# -*- coding: utf-8 -*-
"""TURRET MERGE — Pass 9: cắt lại 6 khung thẻ the_khung_<bậc> (trang/xanh/tim/vang/do/mv) từ raw_s8.png, KHÔNG cắt cụt hoạ tiết.

Lỗi cũ (tools/thap-cat-s89.py): ảnh ra cố định 132×160, cửa sổ đặt tại WIN → phần khung chìa ra ngoài (sừng + lửa khung đỏ,
vương miện + cánh khung chỉ huy, cánh khung vàng, ngọc khung tím, cả gờ ống 2 bên khung xám/xanh) bị cắt thẳng ở mép ảnh.

Bản mới: cùng phép đặt cửa sổ (cửa sổ của mọi khung vẫn trùng nhau → mặt không xê dịch giữa các bậc), nhưng ảnh ra có
LỀ ĐỐI XỨNG PX/PY quanh ô 132×160 cũ → hoạ tiết giữ trọn. CSS (css/khung-p9.css) phóng ảnh <img> khung đúng tỉ lệ
(132+2PX)/132 × (160+2PY)/160 quanh tâm ô → cửa sổ nằm đúng chỗ cũ, hoạ tiết tràn ra ngoài ô (không bị cắt).
Khoá magenta (tach_nen của thap-cat-hinh.py), thu Lanczos nhân-trước-alpha, viền alpha mềm 1 px, loang màu viền.
Chạy: python3 tools/thap-cat-khung-p9.py [K]   (K mặc định 2.6 = độ nét tối đa của raw_s8; ảnh ra 437×499; ô thẻ lớn nhất 120×145 CSS)
"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(GOC, 'thap/assets')
OUT = os.environ.get('OUT', A)
src = open(os.path.join(GOC, 'tools/thap-cat-s89.py'), encoding='utf-8').read()
g = {'__name__': 's89', '__file__': os.path.join(GOC, 'tools/thap-cat-s89.py')}
exec(src[:src.index('# ---------- S8')], g)  # tach_nen, cat, cuaSo

PX, PY = 18, 16                     # lề mỗi bên (đơn vị ô 132×160) — đủ cho chỗ chìa xa nhất (khung chỉ huy −15.5 / khung đỏ −13)
K = float(sys.argv[1]) if len(sys.argv) > 1 else 2.6
W0, H0 = 132 + 2 * PX, 160 + 2 * PY
KW, KH = round(W0 * K), round(H0 * K)
kx, ky = KW / W0, KH / H0
WIN = ((17 + PX) * kx, (30 + PY) * ky, (115 + PX) * kx, (140 + PY) * ky)
TEN8 = {(0, 0): 'trang', (0, 1): 'xanh', (0, 2): 'tim', (1, 0): 'vang', (1, 1): 'do', (1, 2): 'mv'}


def loang(rgb, a, buoc=4):
    dac = a > 200
    out = rgb * dac[..., None]; wt = dac.astype(np.float32)
    k = np.array([[1, 2, 1], [2, 4, 2], [1, 2, 1]], np.float32)
    for _ in range(buoc):
        s = np.stack([nd.convolve(out[..., i], k, mode='nearest') for i in range(3)], -1)
        sw = nd.convolve(wt, k, mode='nearest')
        moi = (wt == 0) & (sw > 0)
        out[moi] = s[moi] / sw[moi, None]; wt[moi] = 1
    return np.where((a >= 250)[..., None], rgb, np.where(wt[..., None] > 0, out, rgb))


im, o = g['cat']('raw_s8.png', 3, 2)
for k, ten in TEN8.items():
    x0, y0, x1, y1 = o[k]
    c = im.crop((x0 - 4, y0 - 4, x1 + 4, y1 + 4))     # +4 px raw: không mất viền mềm của hoạ tiết
    wx0, wy0, wx1, wy1 = g['cuaSo'](c)
    sx = (WIN[2] - WIN[0]) / (wx1 - wx0); sy = (WIN[3] - WIN[1]) / (wy1 - wy0)
    c2 = c.convert('RGBa').resize((max(1, round(c.width * sx)), max(1, round(c.height * sy))), Image.LANCZOS).convert('RGBA')
    dx, dy = round(WIN[0] - wx0 * sx), round(WIN[1] - wy0 * sy)
    tmp = Image.new('RGBA', (KW + 200, KH + 200)); tmp.alpha_composite(c2, (dx + 100, dy + 100))
    out = tmp.crop((100, 100, 100 + KW, 100 + KH))
    if np.asarray(out)[..., 3].sum() < np.asarray(tmp)[..., 3].sum() - 255:
        raise SystemExit('%s: hoạ tiết vẫn chạm mép ảnh — tăng PX/PY' % ten)
    a = np.asarray(out).astype(np.float32)
    al = a[..., 3]
    mem = nd.gaussian_filter(al, 0.5)
    vien = ~nd.binary_erosion(al >= 250, iterations=1) & nd.binary_dilation(al > 0, iterations=1)
    al = np.where(vien, mem, al); al[al < 3] = 0
    a = np.dstack([loang(a[..., :3], al), al])
    res = Image.fromarray(np.clip(a, 0, 255).round().astype(np.uint8), 'RGBA')
    res.save(os.path.join(OUT, 'the_khung_' + ten + '.png'), optimize=True)
    bb = res.getbbox()
    print('the_khung_%-6s %dx%d  hình %s  lề trái %d phải %d trên %d dưới %d' % (ten, KW, KH, bb, bb[0], KW - bb[2], bb[1], KH - bb[3]))
print('CSS: scale %.4f %.4f   (cửa sổ %.1f–%.1f %% x, %.1f–%.1f %% y của ô cũ)' % (W0 / 132, H0 / 160, 17 / 1.32, 115 / 1.32, 30 / 1.6, 140 / 1.6))
