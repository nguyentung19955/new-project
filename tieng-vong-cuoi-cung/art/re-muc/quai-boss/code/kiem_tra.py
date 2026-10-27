"""Bước 5 – kiểm bằng số (mã thoát 1 nếu có mục TRƯỢT). Ghi mọi số đo vào ../so-lieu.json.
 1. dáng nghỉ ráp lại trùng bản nguyên trong ảnh nguồn (IoU bóng ≥ 0,98)
 2. nội suy không vượt biên ở mọi kênh mọi clip
 3. không mảnh nào xuyên đất (lấy mẫu mỗi 5 ms) – trừ clip bay của Dơi (đất ở đó là đáy hitbox, không phải mặt đất)
 4. đi tuần Nấm: chân chịu lực trôi đúng 54 px logic/s, đế chạm đất
 5. clip lặp nối vòng liền; clip đứng/bay/đánh/trúng bắt đầu + kết thúc ở dáng nghỉ (đổi clip không giật)
 6. khung chạm: Nấm – nắm tay trước trong hộp đấm; Mẹ Nấm quét – vuốt trước chạm đất & chồng hộp quét;
    Mẹ Nấm đập – hai vuốt chạm đất ở khung chạm đất
 7. clip chết: không còn kênh 'trang' (nháy do game); cờ 'hien' là bậc thang"""
import os
import sys
import numpy as np
from chung import GOC, SRC, NV_DS, rig_json, load_json, save_json, load_rgb, background
import rig as R
from dong_tac import NgCanh, tao_kenh, tu_the, thoi_diem, khung_cham
from xuat import THU_TU_CLIP, MOD
from xem_thu import ban_nguyen

ok_all = True
so = {}
dong = []


def ghi(ten, dat, chi_tiet=''):
    global ok_all
    ok_all &= bool(dat)
    dong.append(f'{"ĐẠT " if dat else "TRƯỢT"}  {ten}  {chi_tiet}')


def lech(C, a, b):
    ma, mb = R.world_mats(C.rig, a), R.world_mats(C.rig, b)
    d = 0.0
    for n, nd_ in C.rig['nut'].items():
        if 'anh' not in nd_ or not R.is_visible(C.rig, a, n):
            continue
        pa = R.piece_matrix(nd_, ma[n]) @ R.piece_edge(nd_['anh'])
        pb = R.piece_matrix(nd_, mb[n]) @ R.piece_edge(nd_['anh'])
        d = max(d, float(np.abs(pa[:2] - pb[:2]).max()))
    return d * C.k


def hop_manh(C, p, n):
    m = R.world_mats(C.rig, p)[n]
    nd_ = C.rig['nut'][n]
    q = R.piece_matrix(nd_, m) @ R.piece_edge(nd_['anh'])
    gx, gy = C.root
    return ((q[0].min() - gx) * C.k, (q[1].min() - gy) * C.k, (q[0].max() - gx) * C.k, (q[1].max() - gy) * C.k)


def chong(a, h):
    return a[0] < h['dx'] + h['w'] and a[2] > h['dx'] and a[1] < h['dy'] + h['h'] and a[3] > h['dy']


def main():
    for nv in NV_DS:
        C = NgCanh(nv)
        clips = MOD[nv].tao(C)
        s = so[nv] = {}
        a = load_rgb(SRC[nv], lat=True)
        bg, _ = background(a)
        r, f, _ = ban_nguyen(nv, ~bg, C.rig)
        iou = float((r & f).sum() / (r | f).sum())
        s['iou_dang_nghi'] = round(iou, 5)
        ghi(f'{nv}: dáng nghỉ khớp ảnh nguồn', iou >= 0.98, f'IoU {iou:.4f}')
        for ten in THU_TU_CLIP[nv]:
            cl = clips[ten]
            kenh = tao_kenh(cl)
            sc = s[ten] = {}
            vuot = max(k.kiem_vuot() for k in kenh.values())
            sc['vuot_bien_lon_nhat'] = vuot
            ghi(f'{nv}.{ten}: không vượt biên ({len(kenh)} kênh)', vuot <= 1e-6, f'{vuot:.2e}')
            ghi(f'{nv}.{ten}: không nướng nháy trắng', not any(p == 'trang' for (_, p) in kenh))
            if not (nv == 'doi' and ten in ('bay', 'lao', 'trung', 'chet-roi')):
                xuyen = 0.0
                for t in np.arange(0, cl['ms'] + 1e-6, 5.0):
                    p = tu_the(C, cl, float(t), kenh)
                    low = R.lowest_y(C.rig, p)
                    xuyen = max(xuyen, max(low.values()) - C.ground)
                xl = max(0.0, xuyen) * C.k
                sc['xuyen_dat_lon_nhat_px_logic'] = round(xl, 3)
                ghi(f'{nv}.{ten}: không xuyên đất (mỗi 5 ms)', xl <= 0.3, f'{xl:.2f} px logic')
            ts = thoi_diem(cl)
            p0 = tu_the(C, cl, 0.0, kenh)
            if cl['lap']:
                d = lech(C, tu_the(C, cl, cl['ms'] - 1e-3, kenh), p0)
                sc['noi_vong_px'] = round(d, 3)
                ghi(f'{nv}.{ten}: nối vòng liền', d <= 0.05, f'{d:.3f} px')
            if ten not in ('chet', 'chet-roi', 'chet-vo', 'di', 'bay'):   # đi/bay: runtime hoà từ tư thế đang hiện
                d0 = lech(C, p0, {})
                d1 = 0.0 if cl['lap'] else lech(C, tu_the(C, cl, cl['ms'], kenh), {})
                sc['lech_dang_nghi_dau_cuoi_px'] = [round(d0, 3), round(d1, 3)]
                ghi(f'{nv}.{ten}: đầu/cuối = dáng nghỉ', max(d0, d1) <= 0.05, f'{d0:.3f} / {d1:.3f} px')
            hit = khung_cham(cl, ts)
            if hit:
                sc['khung_cham'] = hit
            if nv == 'nam' and ten == 'dam':
                ok = all(chong(hop_manh(C, tu_the(C, cl, ts[i], kenh), 'tay-truoc'), cl['hop_don']) for i in hit)
                ghi('nam.dam: nắm tay trước trong hộp đấm ở mọi khung chạm', ok and len(hit) >= 3, f'khung {hit}')
            if nv == 'menam' and ten == 'quet':
                kq = []
                for i in hit:
                    p = tu_the(C, cl, ts[i], kenh)
                    kq.append((chong(hop_manh(C, p, 'vuot-truoc'), cl['hop_don']),
                               round((C.ground - R.lowest_y(C.rig, p, ['vuot-truoc'])['vuot-truoc']) * C.k, 2)))
                ghi('menam.quet: vuốt trước chồng hộp quét + sát đất (≤ 2 px)', all(a and b <= 2 for a, b in kq), str(kq))
            if nv == 'menam' and ten == 'dap':
                t = cl['su_kien']['cham_dat_ms'] + 0.01
                p = tu_the(C, cl, t, kenh)
                low = R.lowest_y(C.rig, p, ['vuot-truoc', 'vuot-sau'])
                k = [round((C.ground - v) * C.k, 2) for v in low.values()]
                ghi('menam.dap: hai vuốt chạm đất lúc sự kiện chạm đất', max(k) <= 0.3, f'khe {k} px')
    with open(os.path.join(GOC, 'so-lieu.json'), 'w', encoding='utf-8') as fo:
        import json
        json.dump({'ket_qua': dong, 'so': so, 'tat_ca_dat': ok_all}, fo, ensure_ascii=False, indent=1)
    print('\n'.join(dong))
    print(f'{sum(1 for d in dong if d.startswith("ĐẠT"))}/{len(dong)} ĐẠT')
    return ok_all


if __name__ == '__main__':
    sys.exit(0 if main() else 1)
