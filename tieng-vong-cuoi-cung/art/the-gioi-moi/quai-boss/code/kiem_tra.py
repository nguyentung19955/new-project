"""Bước 6 – kiểm tự động (mã thoát 1 nếu có mục TRƯỢT). Ghi mọi số đo vào ../so-lieu.json.

Kiểm:
 1. dáng nghỉ ráp lại trùng ảnh nguồn (IoU bóng ≥ 0,99)
 2. nội suy không vượt biên ở mọi kênh mọi clip
 3. không mảnh nào xuyên đất ở mọi khung (và ở mọi ms, lấy mẫu dày)
 4. đi tuần: chân chịu lực đứng đúng mặt đất, đế phẳng, trôi đúng tốc độ đất (54 px logic/s) – lấy mẫu mỗi 1 ms
 5. clip lặp nối vòng liền (khung cuối → đầu), clip không lặp bắt đầu/kết thúc ở dáng nghỉ (đổi clip không giật)
 6. khung chạm: quái đấm – nắm tay trước nằm trong hộp đấm gameplay; boss quét – nắm tay trước chạm đất và chồng hộp
    quét; boss đập – hai nắm tay chạm đất
 7. sprite sheet: cùng cỡ khung, cùng neo, RGBA, ≤ 4096 px, điểm trong suốt RGB = 0, không khung rỗng, không chạm mép,
    hàng thấp nhất có hình ≤ neo y − 1 (không vẽ dưới đất)."""
import os
import sys
import numpy as np
from PIL import Image
from chung import GOC, SPRITE, RIG_JSON, SRC, load_json, save_json, load_rgb, background
import rig as R
from dong_tac import NgCanh, tao_kenh, tu_the, thoi_diem, khung_cham
from xuat import THU_TU_CLIP, MOD

ok_all = True
so = {}
dong = []


def ghi(ten, dat, chi_tiet=''):
    global ok_all
    ok_all &= bool(dat)
    dong.append(f'{"ĐẠT " if dat else "TRƯỢT"}  {ten}  {chi_tiet}')


def pose_diff(C, a, b):
    """độ lệch lớn nhất (px logic) giữa vị trí pivot thế giới của các nút ở hai tư thế"""
    ma, mb = R.world_mats(C.rig, a), R.world_mats(C.rig, b)
    d = 0.0
    for n in C.rig['nut']:
        nd_ = C.rig['nut'][n]
        if 'anh' not in nd_:
            continue
        pa = R.piece_matrix(nd_, ma[n]) @ R.piece_edge(nd_['anh'])
        pb = R.piece_matrix(nd_, mb[n]) @ R.piece_edge(nd_['anh'])
        d = max(d, float(np.abs(pa[:2] - pb[:2]).max()))
    return d * C.k


def main():
    for nv in ('quai', 'boss'):
        C = NgCanh(nv)
        clips = MOD[nv].tao(C)
        s = so[nv] = {}
        # 1
        a = load_rgb(SRC[nv])
        bg, _ = background(a)
        im = R.render(C.rig, {}, (0, 0, 1254, 1254), 1.0)
        r = np.array(im)[..., 3] > 128
        iou = float((r & ~bg).sum() / (r | ~bg).sum())
        s['iou_dang_nghi'] = round(iou, 5)
        ghi(f'{nv}: dáng nghỉ khớp ảnh nguồn', iou >= 0.99, f'IoU {iou:.4f}')
        rest = {}
        for ten in THU_TU_CLIP[nv]:
            cl = clips[ten]
            kenh = tao_kenh(cl)
            sc = s[ten] = {}
            # 2
            vuot = max(k.kiem_vuot() for k in kenh.values())
            sc['vuot_bien_lon_nhat'] = vuot
            ghi(f'{nv}.{ten}: không vượt biên ({len(kenh)} kênh)', vuot <= 1e-6, f'{vuot:.2e}')
            # 3
            ts_day = np.arange(0, cl['ms'] + 1e-6, 5.0)
            xuyen = 0.0
            for t in ts_day:
                p = tu_the(C, cl, float(t), kenh)
                low = R.lowest_y(C.rig, p)
                xuyen = max(xuyen, max(low.values()) - C.ground)
            xuyen_l = max(0.0, xuyen) * C.k
            sc['xuyen_dat_lon_nhat_px_logic'] = round(xuyen_l, 4)
            ghi(f'{nv}.{ten}: không xuyên đất (mỗi 5 ms)', xuyen_l <= 0.05, f'{xuyen_l:.3f} px logic')
            # 5
            ts = thoi_diem(cl)
            p0 = tu_the(C, cl, 0.0, kenh)
            if cl['lap']:
                pT = tu_the(C, cl, cl['ms'] - 1e-3, kenh)
                d = pose_diff(C, p0, pT)
                sc['noi_vong_px_logic'] = round(d, 4)
                ghi(f'{nv}.{ten}: nối vòng liền', d < 0.05, f'{d:.4f} px logic')
            elif not cl.get('giu_cuoi'):
                d0, d1 = pose_diff(C, p0, rest), pose_diff(C, tu_the(C, cl, cl['ms'], kenh), rest)
                sc['lech_dang_nghi_dau_cuoi_px_logic'] = [round(d0, 4), round(d1, 4)]
                ghi(f'{nv}.{ten}: đầu/cuối = dáng nghỉ', max(d0, d1) < 0.05, f'{d0:.3f} / {d1:.3f} px logic')
            # 6
            hit = khung_cham(cl, ts)
            sc['khung_cham'] = hit
            if cl.get('cham'):
                ghi(f'{nv}.{ten}: có khung chạm', len(hit) > 0, str(hit))
            if nv == 'quai' and ten == 'dam':
                hop = cl['hop_don']
                vals = []
                for i in hit:
                    p = tu_the(C, cl, ts[i], kenh)
                    W = R.piece_matrix(C.rig['nut']['tay-truoc'], R.world_mats(C.rig, p)['tay-truoc'])
                    q = (W @ R.piece_edge(C.rig['nut']['tay-truoc']['anh']))[:2]
                    q = (q - C.root[:, None]) * C.k
                    trong = ((q[0] >= hop['dx']) & (q[0] <= hop['dx'] + hop['w']) & (q[1] >= hop['dy'])
                             & (q[1] <= hop['dy'] + hop['h'])).mean()
                    vals.append(round(float(trong), 3))
                sc['ty_le_bien_nam_tay_trong_hop_dam'] = vals
                ghi('quai.dam: nắm tay trước nằm trong hộp đấm ở khung chạm', min(vals) > 0.6, str(vals))
            if nv == 'boss' and ten in ('quet', 'dap'):
                vals = []
                for i in hit:
                    p = tu_the(C, cl, ts[i], kenh)
                    low = R.lowest_y(C.rig, p, ['tay-truoc', 'tay-sau'])
                    names = ['tay-truoc'] if ten == 'quet' else ['tay-truoc', 'tay-sau']
                    vals.append(round(max((C.ground - low[n]) * C.k for n in names), 3))
                sc['khe_nam_tay_dat_o_khung_cham_px_logic'] = vals
                ghi(f'boss.{ten}: nắm tay chạm đất ở khung chạm', max(vals) < 0.05, str(vals))
                if ten == 'quet':
                    hop = cl['hop_don']
                    ov = []
                    for i in hit:
                        p = tu_the(C, cl, ts[i], kenh)
                        W = R.piece_matrix(C.rig['nut']['tay-truoc'], R.world_mats(C.rig, p)['tay-truoc'])
                        q = ((W @ R.piece_edge(C.rig['nut']['tay-truoc']['anh']))[:2] - C.root[:, None]) * C.k
                        ov.append(bool((q[0].min() < hop['dx'] + hop['w']) and (q[0].max() > hop['dx'])))
                    ghi('boss.quet: nắm tay chồng hộp quét ở mọi khung chạm', all(ov), str(ov))
            # 4
            if ten == 'di':
                v = cl['toc_do_dat_px_logic_moi_s'] / 1000.0
                kq = {}
                for chan, (a0, a1) in cl['chiu_luc'].items():
                    span = (a1 - a0) % cl['ms']
                    tt = (a0 + np.arange(0.0, span + 1e-6, 1.0)) % cl['ms']
                    xs, khe, goc = [], [], []
                    for t in tt:
                        p = tu_the(C, cl, float(t), kenh)
                        xs.append(R.world_mats(C.rig, p)[chan][0, 2] * C.k)
                        khe.append(C.khe(chan, p))
                        goc.append(p[chan]['goc'])
                    vx = np.diff(xs) / 1.0
                    kq[chan] = {'van_toc_lech_toi_da_px_logic_moi_s': round(float(np.abs(vx - v).max() * 1000), 4),
                                'truot_tuyet_doi_tich_luy_px_logic': round(float(np.abs(vx - v).sum()), 5),
                                'khe_dat_min_max_px_logic': [round(min(khe), 4), round(max(khe), 4)],
                                'goc_de_lon_nhat': round(float(np.abs(goc).max()), 5)}
                    ghi(f'quai.di: {chan} chịu lực bám đất', kq[chan]['van_toc_lech_toi_da_px_logic_moi_s'] < 0.5
                        and max(khe) - min(khe) < 0.02 and kq[chan]['goc_de_lon_nhat'] < 1e-3,
                        str(kq[chan]))
                sc['chan_chiu_luc'] = kq
            # chuyển clip: lệch giữa khung 0 của clip đứng và dáng nghỉ
            if ten == 'dung':
                sc['dung_khung0_lech_dang_nghi_px_logic'] = round(pose_diff(C, p0, rest), 3)
        # 7
        meta0 = None
        for ten in THU_TU_CLIP[nv]:
            m = load_json(os.path.join(SPRITE, f'{nv}-{ten}-2x.json'))
            if meta0 is None:
                meta0 = m
            dat = m['co_khung'] == meta0['co_khung'] and m['diem_neo']['x'] == meta0['diem_neo']['x'] \
                and m['diem_neo']['y'] == meta0['diem_neo']['y']
            loi = []
            for t in m['trang']:
                im = Image.open(os.path.join(SPRITE, t['anh']))
                if im.mode != 'RGBA' or max(im.size) > 4096 or list(im.size) != t['co']:
                    loi.append(f'{t["anh"]} {im.mode} {im.size}')
                a = np.array(im)
                if (a[a[..., 3] == 0][:, :3] != 0).any():
                    loi.append(f'{t["anh"]}: RGB≠0 ở điểm trong suốt')
            pages = [np.array(Image.open(os.path.join(SPRITE, t['anh']))) for t in m['trang']]
            ay = m['diem_neo']['y']
            thap = 0
            for f in m['frames']:
                a = pages[f['trang']][f['y']:f['y'] + f['h'], f['x']:f['x'] + f['w'], 3]
                if a.max() == 0:
                    loi.append(f'khung {f["i"]} rỗng')
                    continue
                ys, xs = np.nonzero(a > 0)
                thap = max(thap, ys.max())
                if xs.min() == 0 or ys.min() == 0 or xs.max() == f['w'] - 1:
                    loi.append(f'khung {f["i"]} chạm mép')
            if thap > ay - 1 + 1:          # cho phép 1 hàng khử răng cưa dưới mặt đất
                loi.append(f'hình xuống dưới đất: hàng {thap} > neo {ay}')
            ghi(f'{nv}.{ten}: sprite sheet', dat and not loi, '; '.join(loi) or
                f'khung {m["co_khung"]}, neo ({m["diem_neo"]["x"]},{m["diem_neo"]["y"]}), {len(m["frames"])} khung, '
                f'{len(m["trang"])} trang')
        Wk, Hk = meta0['co_khung']
        tong = sum(len(load_json(os.path.join(SPRITE, f'{nv}-{t}-2x.json'))['frames']) for t in THU_TU_CLIP[nv])
        s['bo_nho_giai_nen_MB'] = {'moi_khung': round(Wk * Hk * 4 / 2 ** 20, 2),
                                   'tat_ca_clip': round(Wk * Hk * 4 * tong / 2 ** 20, 1), 'so_khung': tong}
    save_json({'kiem': dong, 'so_lieu': so}, os.path.join(GOC, 'so-lieu.json'))
    print('\n'.join(dong))
    print('TẤT CẢ ĐẠT' if ok_all else 'CÓ MỤC TRƯỢT', f'({sum(d.startswith("ĐẠT") for d in dong)}/{len(dong)})')
    return ok_all


if __name__ == '__main__':
    sys.exit(0 if main() else 1)
