#!/usr/bin/env python3
"""SOÁT CẦM VŨ KHÍ (cam-vk-chuan, 16/10/2026): đo lỗi TRƯỚC (?camchuan=0) và SAU (bảng game/js/cam_chuan_data.js) cho mọi hàng Cu Tí
đang dùng × vũ khí × 4 cấp (Trắng / Mầm / Thành hình / Thức tỉnh), bộ ninja; dựng ảnh lưới ×4 và GIF ×3 trước | sau.
KHÔNG chạy game: dựng khung y như js/zed_moi.js bằng ve_zed.py (vk-khop-tay) + do_cam.py.
Chạy (từ gốc repo):  python3 docs/review/ke-hoach-cai-thien/cam-vk-chuan/soat.py [--khong-anh]
Ra: so-do.json (số khung lỗi), luoi/<hàng>-<vũ khí>.png, gif-*.gif, bảng in ra màn hình (dán vào bao-cao.md)."""
import json, os, sys
from PIL import Image, ImageDraw

DAY = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, DAY)
import do_cam as DC  # noqa: E402
import luoi as L  # noqa: E402

CAP_TEN = ['Trắng', 'Mầm', 'Thành hình', 'Thức tỉnh']
MA_LOI = {'tam': 'lệch tâm nắm / lơ lửng', 'tam2': 'không có nắm tay dưới tay thứ hai', 'truc': 'tay trái lệch cán',
          'thieu2': 'cán đè lên tay trái', 'phu': 'vũ khí đè lên ngón', 'phu2': 'cán đè ngón tay trái',
          'luoi': 'lưỡi / đốc trong nắm tay', 'ho': 'chuôi hở dài trước đốc', 'phi': 'phi tiêu lệch cổ tay', 'phi_nguoc': 'phi tiêu ngược cổ tay'}


def doc_bang():
    s = open(os.path.join(DC.ROOT, 'game/js/cam_chuan_data.js'), encoding='utf-8').read()
    return json.loads(s.split('G.CAM_CHUAN_DATA = ', 1)[1].rsplit(';', 1)[0])


def lam_sua(T, B, ma='zed-moi'):
    """Hàm (khoá, khung, cấp) → (neo, cam) theo bảng, như bienThe của js/zed_moi.js (kể cả phép thử tấm cũ)."""
    bo = B['bo'].get(ma, {})
    def f(k, i, cap):
        da = T['dong_tac'][k]
        neo0 = da['nam']['neo']
        R = bo.get(k)
        n = None
        if R and R['so'] == len(neo0):
            g0 = next(x for x in neo0 if x)
            if abs(g0[0] - R['goc'][0]) < 0.02 and abs(g0[1] - R['goc'][1]) < 0.02 and g0[2] == R['goc'][2]:
                n = R['neo'].get(str(i))
        cam = None
        vc = B['vk_cam'].get(da['vk'])
        cc = da['nam'].get('vk_cam', da['vk_cam'])
        if vc and all(abs(a - b) < 0.02 for p, q in zip(vc['cu'], cc) for a, b in zip(p, q)):
            cam = vc['moi'][cap]
        if n is None and cam is None:
            return None
        return (n if n is not None else neo0[i]), cam
    return f


def ap_anh_thay(T, ma='zed-moi'):
    """Khung thay hẳn bằng ảnh gen lại (thuong-tay-trai-cao Lần 2, mục "anh" của game/js/thuong_cao_data.js — game dùng mặc định):
    dán ảnh thân + nắm tay thân vào tấm T['_img'] (bản sao) và đặt neo mới vào biến thể nắm chuôi → đo đúng khung game đang vẽ.
    Trả danh sách (khoá, khung) đã thay."""
    import base64, io, copy
    s = open(os.path.join(DC.ROOT, 'game/js/thuong_cao_data.js'), encoding='utf-8').read()
    B = json.loads(s.split('G.THUONG_CAO_DATA = ', 1)[1].rsplit(';', 1)[0])
    ra = []
    for k, R in B['bo'].get(ma, {}).items():
        for i, r in R['khung'].items():
            if 'anh' not in r:
                continue
            da = T['dong_tac'][k]; i = int(i)
            n = da['nam']['neo'][i]
            if not n or abs(n[0] - r['cu'][0]) >= 0.02 or abs(n[1] - r['cu'][1]) >= 0.02 or abs(n[2] - r['cu'][2]) >= 0.05:
                continue
            im = Image.open(io.BytesIO(base64.b64decode(r['anh']['tam'].split(',', 1)[1]))).convert('RGBA')
            if T['_img'] is DC.VZ.tai(ma)['_img']:
                T['_img'] = T['_img'].copy()
            for lop, h in ((0, da['hang']), (1, da['nam']['hang_tay'])):
                o = im.crop((lop * 96, 0, lop * 96 + 96, 96))
                T['_img'].paste(o, (i * 96, h * 96))
            da['nam']['neo'] = copy.deepcopy(da['nam']['neo']); da['nam']['neo'][i] = r['neo']
            ra.append((k, i))
    return ra


def ap_kiem_vuong(V):
    """KIẾM VUÔNG 17/10 (game mặc định, js/sprite_custom.js ghepKiemVuong): dán ảnh 4 kiếm mới (mục "kiem_vuong") dưới tấm zed-vk, ô kiếm
    trỏ sang ảnh mới; trả 4 điểm cầm mới (hàng kiếm nào cũng dùng — js/zed_moi.js bienThe). Không có mục / --kiemvuong=0: None."""
    import base64, io
    K = V.get('kiem_vuong')
    if not K or '--kiemvuong=0' in sys.argv:
        return None
    k2 = Image.open(io.BytesIO(base64.b64decode(K['tam'].split(',', 1)[1]))).convert('RGBA')
    im = V['_img']; H0 = im.height
    t = Image.new('RGBA', (max(im.width, k2.width), H0 + 2 + k2.height), (0, 0, 0, 0)); t.paste(im, (0, 0)); t.paste(k2, (0, H0 + 2))
    V['_img'] = t
    V['vk'] = dict(V['vk'], kiem=[[r[0], r[1] + H0 + 2, r[2], r[3]] for r in K['vk']])
    return K['cam']


def sua_kiem_vuong(T, sua, cam_kv):
    """Bọc hàm sửa: hàng cầm kiếm lấy điểm cầm kiếm vuông (neo theo bảng như cũ)."""
    if not cam_kv:
        return sua
    def f(k, i, cap):
        r = sua(k, i, cap) if sua else None
        if T['dong_tac'][k].get('vk') != 'kiem':
            return r
        da = T['dong_tac'][k]; neo0 = da['nam']['neo'] if 'nam' in da else da['neo']
        return ((r[0] if r else neo0[i]), cam_kv[cap])
    return f


def dem(T, V, k, sua=None):
    """Số (khung × cấp) lỗi, tổng, và đếm theo mã lỗi."""
    da = T['dong_tac'][k]
    loi = tong = 0; ma = {}
    ds = []
    for i in range(da['so']):
        for cap in range(4):
            neo = cam = None
            if sua:
                nc = sua(k, i, cap)
                if nc:
                    neo, cam = nc
            r = DC.do_khung(T, V, k, i, cap, neo, cam)
            if r is None:
                continue
            tong += 1
            if r['loi']:
                loi += 1; ds.append((i + 1, cap + 1, r['loi']))
                for m in r['loi']:
                    ma[m] = ma.get(m, 0) + 1
    return loi, tong, ma, ds


def gif(T, V, sua, chuoi, ten, cap=0, Z=3, ms=110):
    """GIF trước | sau: chuoi = [(khoá, khung)]; mỗi khung vẽ toàn thân ô 96 phóng ×Z."""
    P = DC.VZ.PAD * Z
    anh = []
    for k, i in chuoi:
        hai = []
        for s in (False, True):
            neo = cam = None
            if s and sua:
                nc = sua(k, i, cap)
                if nc:
                    neo, cam = nc
            im, chu, info = DC.dung(T, V, k, i, cap, neo, cam, Z=Z)
            o = Image.new('RGBA', im.size, L.NEN); o.alpha_composite(im)
            hai.append(o.crop((P - 30 * Z, P - 22 * Z, P + 126 * Z, P + 100 * Z)))
        w, h = hai[0].size
        f = Image.new('RGBA', (2 * w + 6, h + 18), (20, 20, 26, 255))
        f.paste(hai[0], (0, 18)); f.paste(hai[1], (w + 6, 18))
        d = ImageDraw.Draw(f)
        d.text((4, 2), 'TRƯỚC (?camchuan=0)', fill=(255, 255, 160, 255), font=L.F)
        d.text((w + 10, 2), 'SAU  %s k%d  cấp %d' % (k, i + 1, cap + 1), fill=(160, 255, 160, 255), font=L.F)
        anh.append(f.convert('RGB').quantize(128))
    anh[0].save(os.path.join(DAY, ten), save_all=True, append_images=anh[1:], duration=ms, loop=0)


def main():
    ve_anh = '--khong-anh' not in sys.argv
    T = DC.VZ.tai('zed-moi'); V = DC.VZ.tai('zed-vk')
    print('Khung thay ảnh (thuong-tay-trai-cao Lần 2) đo theo ảnh mới:', ap_anh_thay(T))
    B = doc_bang(); sua = lam_sua(T, B)
    cam_kv = ap_kiem_vuong(V)
    print('Kiếm vuông (mặc định game):', 'BẬT, điểm cầm %s' % cam_kv if cam_kv else 'TẮT (kiếm cũ)')
    sua = sua_kiem_vuong(T, sua, cam_kv)
    km = DC.khoa_game(T)
    bang, so_do = [], {}
    os.makedirs(os.path.join(DAY, 'luoi'), exist_ok=True)
    for nhan, ten, vk, k in DC.hang_dung(T):
        if not k:
            continue
        if 'vk' not in T['dong_tac'][k]:
            bang.append((nhan, vk, k, None, None, None, None)); continue
        a = dem(T, V, k); b = dem(T, V, k, sua)
        bang.append((nhan, vk, k, a, b, None, None))
        so_do[k] = {'nhan': nhan, 'vk': vk, 'truoc': {'loi': a[0], 'tong': a[1], 'ma': a[2], 'khung': a[3]},
                    'sau': {'loi': b[0], 'tong': b[1], 'ma': b[2], 'khung': b[3]}}
        print('%-16s %-8s %-18s trước %3d/%3d %-40s sau %3d/%3d %s' % (nhan, vk, k, a[0], a[1], a[2], b[0], b[1], b[2]), flush=True)
        if ve_anh:
            o, _ = L.luoi(T, V, k, [0, 1, 2, 3], sua, '%s — %s (%s)   trái: TRƯỚC 4 cấp | phải: SAU 4 cấp   vàng = điểm cầm, đỏ = nắm tay đo, '
                          'lam / cam = tay thứ hai, hồng = trục, viền lá = ngón đè cán' % (nhan, DC.VK_TEN[vk], k))
            o.convert('RGB').quantize(200).save(os.path.join(DAY, 'luoi', '%s-%s.png' % (k.replace('~', '-'), vk)), optimize=True)
    json.dump({'gen_lai': B.get('gen_lai', []), 'hang': so_do}, open(os.path.join(DAY, 'so-do.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    if ve_anh:
        dg = lambda vk: [(km['dung_' + vk], 0), (km['dung_' + vk], 2)]
        seq = lambda k: [(km[k], i) for i in range(T['dong_tac'][km[k]]['so'])]
        gif(T, V, sua, dg('kiem') + seq('kiem_1') + seq('kiem_2') + seq('kiem_3') + dg('kiem'), 'gif-kiem-x3.gif', cap=3)
        gif(T, V, sua, dg('kiem') + seq('kiem_1') + seq('kiem_2') + seq('kiem_3') + dg('kiem'), 'gif-kiem-cap3-x3.gif', cap=2)
        gif(T, V, sua, dg('thuong') + seq('thuong_1') + seq('thuong_2') + seq('thuong_3') + seq('thuong_quet') + dg('thuong'), 'gif-thuong-x3.gif', cap=3)
        gif(T, V, sua, dg('bua') + seq('bua_nen') + seq('bua_nen_dat') + seq('db_bua') + dg('bua'), 'gif-bua-x3.gif', cap=3)
        gif(T, V, sua, seq('dung_phitieu') + seq('di_phitieu') + seq('chay_phitieu'), 'gif-phitieu-x3.gif', cap=3)
        gif(T, V, sua, seq('chay2tay_thuong') * 2, 'gif-chay-cam-thuong-x3.gif', cap=3, ms=75)
    return bang


if __name__ == '__main__':
    main()
