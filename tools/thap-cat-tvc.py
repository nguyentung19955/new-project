# -*- coding: utf-8 -*-
"""TURRET MERGE — cắt ảnh "tư vấn C" (TU-VAN-TOAN-BO.txt §E) raw_tv_<Exx>.png → thap/assets/tv_<tên>.png.
Khoá magenta CẢ trong lòng khung rỗng (viền alpha mềm, khử trộn hồng) · tách khối liền theo hàng → cột ·
nhiều trạng thái của cùng 1 vật → cùng khung · thu Lanczos nhân-trước-alpha về ≤ 3× cỡ CSS lớn nhất (không phóng to).
Chạy: python3 tools/thap-cat-tvc.py   (tấm nào chưa có thì bỏ qua; in bảng tên · cỡ)."""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as nd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NGUON = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art')
DICH = os.path.join(GOC, 'thap/assets')

# Exx: (tên các khối theo thứ tự hàng → cột, rộng tối đa px = 3 × CSS lớn nhất, cùng khung?)
#  cỡ CSS ở khung logic 430 (#wrap): tấm/nút trải ngang ≤ 394 css nhưng chỉ cắt 9 mảnh → giữ ≤ 1024 px là đủ nét ở góc
BANG = {
    'E01': (['tv_tam_yen'], 1024, False),                                   # tấm B yên
    'E02': (['tv_tam_bat'], 1024, False),                                   # tấm B đang chọn
    'E03': (['tv_nut1', 'tv_nut1_an', 'tv_nut1_tat'], 1024, True),          # nút chính
    'E04': (['tv_nut2', 'tv_nut2_an', 'tv_nut2_tat'], 600, True),           # nút phụ
    'E05': (['tv_bang'], 1024, False),                                      # vỏ bảng trượt (D)
    'E06': (['tv_bang_dau'], 1024, False),                                  # đầu bảng
    'E14': (['tv_chip', 'tv_chip_on', 'tv_chip2', 'tv_chip2_on'], 600, True),
    'E15': (['tv_tim'], 1024, False),
    'E16': (['tv_loc', 'tv_loc_on'], 150, True),
    'E32': (['tv_ic_solo', 'tv_ic_coop', 'tv_ic_pvp', 'tv_ic_online'], 156, False),  # biểu tượng chế độ 52 css
    'E33': (['tv_che_hang', 'tv_che_hang_on'], 1024, True),
    'E34': (['tv_sanh_p', 'tv_sanh_cho'], 1024, True),
    'E35': (['tv_ma_phong'], 900, False),
    'E36': (['tv_kq_o', 'tv_kq_o2', 'tv_kq_o3'], 400, True),
    'E37': (['tv_kq_thang', 'tv_kq_thua'], 400, False),                     # huy hiệu kết quả 128 css
    'E38': (['tv_cuon'], 96, False),
    'E39': (['tv_trum_san'], 1024, False),
    'E40': (['tv_up_nen'], 1290, False),
    'E41': (['tv_mv_huy'], 600, False),                                     # huy hiệu chỉ huy ~196 css
    'E46': (['tv_truot_ray', 'tv_truot_day', 'tv_truot_num'], 600, False),
    'E47': (['tv_bao'], 1024, False),
    'E48': (['tv_tab', 'tv_tab_on', 'tv_tab_tat'], 480, True),
}


def khoa(im):
    """magenta → trong suốt (cả lòng khung) + khử trộn hồng ở viền mềm 1 px."""
    a = np.asarray(im.convert('RGBA')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = np.minimum(r, b) - g                   # độ "hồng"
    k = np.clip(1 - (m - 50) / 70, 0, 1)       # 1 = giữ, 0 = nền
    a[..., 3] *= k
    du = np.clip(m, 0, None) * (k < 1) * 0.9
    a[..., 0] -= du * 0.5; a[..., 2] -= du * 0.5
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


def khoi(im, n):
    """n khối lớn nhất, xếp hàng → cột."""
    al = np.asarray(im)[..., 3] > 60
    lab, k = nd.label(nd.binary_dilation(al, iterations=6))
    if not k: return []
    s = nd.sum(al, lab, range(1, k + 1))
    ids = [i + 1 for i in np.argsort(s)[::-1][:n]]
    hop = []
    for i in ids:
        ys, xs = np.nonzero(lab == i)
        hop.append((i, xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    h0 = np.median([h[4] - h[2] for h in hop])
    hop.sort(key=lambda h: (round(h[2] / (h0 * 0.6)), h[1]))
    ra = []
    for i, x0, y0, x1, y1 in hop:
        a = np.asarray(im).copy(); a[..., 3] = (a[..., 3] * (lab == i)).astype(np.uint8)
        ra.append(Image.fromarray(a, 'RGBA').crop((x0, y0, x1, y1)))
    return ra


def cung_khung(ims):
    W = max(i.size[0] for i in ims); H = max(i.size[1] for i in ims)
    ra = []
    for i in ims:
        o = Image.new('RGBA', (W, H)); o.alpha_composite(i, ((W - i.size[0]) // 2, (H - i.size[1]) // 2)); ra.append(o)
    return ra


def thu(im, w):
    """Lanczos nhân-trước-alpha, chỉ thu nhỏ."""
    if im.size[0] <= w: return im
    h = max(1, round(im.size[1] * w / im.size[0]))
    a = np.asarray(im).astype(np.float32) / 255
    p = a.copy(); p[..., :3] *= p[..., 3:4]
    ch = [Image.fromarray(p[..., c] * 255).resize((w, h), Image.LANCZOS) for c in range(4)]
    q = np.stack([np.asarray(c, dtype=np.float32) / 255 for c in ch], -1)
    al = np.clip(q[..., 3:4], 1e-4, 1)
    q[..., :3] = np.clip(q[..., :3] / al, 0, 1); q[..., 3] = np.clip(q[..., 3], 0, 1)
    return Image.fromarray((q * 255 + .5).astype(np.uint8), 'RGBA')


if __name__ == '__main__':
    for e, (ten, w, cung) in BANG.items():
        p = os.path.join(NGUON, 'raw_tv_' + e + '.png')
        if not os.path.exists(p): continue
        ims = khoi(khoa(Image.open(p)), len(ten))
        if len(ims) < len(ten): print('!!', e, 'chỉ thấy', len(ims), 'khối, cần', len(ten)); ten = ten[:len(ims)]
        if cung: ims = cung_khung(ims)
        for im, t in zip(ims, ten):
            im = thu(im, w); im.save(os.path.join(DICH, t + '.png'), optimize=True)
            print(e, t + '.png', '%dx%d' % im.size)
