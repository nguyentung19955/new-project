#!/usr/bin/env python3
"""TURRET MERGE — cắt hiệu ứng THẺ ĐƯỢC CHỌN (màn chọn bộ bài) từ tấm ChatGPT docs/demo-hop-tuong/thap-art/raw_sel_card.png.

Tấm raw (nền magenta): hàng 1 = khung vàng + quầng xanh (4 khung lặp) · hàng 2 = bùng chọn 1 lần (5 khung)
· hàng 3 = huy hiệu 'trong bộ' (3 cỡ) · hàng 4 = đế sáng (xanh / cam).
Khung vàng của ChatGPT KHÔNG dùng (thẻ đã có khung độ hiếm của nó) → chỉ GIỮ phần sáng NẰM NGOÀI thân khung
(góc ngoặc xanh, quầng, tia, vòng) = lớp phủ ôm sát mép ngoài khung thẻ, giữa rỗng.
Cách cắt: khoá magenta (alpha mềm + tách trộn màu nền → không viền hồng), tách thân khung (vùng đặc không phát sáng,
mở hình học bỏ tia mảnh, lấp lỗ) → bỏ thân + 1 px, đặt hộp thân khung lên hộp khung thẻ (ô lưới thẻ), thu Lanczos
nhân-trước-alpha về cỡ ≤ raw (≈ 3× cỡ CSS lớn nhất, iPhone DPR 3).
Ra: thap/assets/chon_vong.png (dải 4 khung lặp), chon_bung.png (dải 4 khung bùng), chon_huy.png, chon_de_xanh.png, chon_de_cam.png
    + in phần lề (% của hộp khung thẻ) để đặt CSS.
Chạy: python3 tools/thap-cat-chonthe.py
"""
import os, json
import numpy as np
from PIL import Image
from scipy import ndimage as nd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art/raw_sel_card.png')
A = os.environ.get('OUT', os.path.join(GOC, 'thap/assets'))
M = np.array([255, 0, 255], np.float32)

im = np.asarray(Image.open(RAW).convert('RGB')).astype(np.float32)
R, G, B = im[..., 0], im[..., 1], im[..., 2]
# alpha: độ lệch khỏi magenta (kênh lệch nhiều nhất), dốc mềm
d = np.maximum.reduce([255 - R, G, 255 - B])
alpha = np.clip((d - 14) / 150.0, 0, 1)
alpha = nd.gaussian_filter(alpha, 0.5)
a3 = np.maximum(alpha, 1e-3)[..., None]
col = np.clip((im - (1 - alpha[..., None]) * M) / a3, 0, 255)   # tách trộn nền magenta
# phần phát sáng (xanh lơ / trắng sáng) vs thân khung đặc
lum = col.mean(-1)
glow = ((col[..., 2] > 150) & (col[..., 1] > 140) & (col[..., 0] < col[..., 1] * 0.85)) | (lum > 235)


def than(box):
    """mặt nạ thân khung (đặc, lấp lỗ) trong ô box=(x0,y0,x1,y1)"""
    x0, y0, x1, y1 = box
    a = alpha[y0:y1, x0:x1]; g = glow[y0:y1, x0:x1]
    c = col[y0:y1, x0:x1]
    # thân: đặc, không phát sáng, màu vàng/đồng/thép tối (tia vàng sáng mảnh bị mở hình học loại)
    b = (a > 0.9) & ~g & (c.mean(-1) < 225)
    b = nd.binary_opening(b, iterations=2)            # bỏ tia/hạt mảnh
    b = nd.binary_closing(b, iterations=8)            # nối qua đèn xanh trên thanh dọc
    lab, n = nd.label(b)
    if n == 0: return np.zeros_like(b)
    sz = nd.sum(b, lab, range(1, n + 1)); b = lab == (1 + int(np.argmax(sz)))
    b = nd.binary_fill_holes(b)
    b = nd.binary_opening(b, iterations=6)            # bỏ gai tia dính mép
    return b


def lanczos(rgba, w, h):
    """thu Lanczos trên ảnh nhân-trước-alpha"""
    a = rgba[..., 3:4] / 255.0
    pm = np.concatenate([rgba[..., :3] * a, rgba[..., 3:4]], -1)
    chans = [np.asarray(Image.fromarray(pm[..., i].astype(np.float32), 'F').resize((w, h), Image.LANCZOS)) for i in range(4)]
    o = np.stack(chans, -1)
    al = np.clip(o[..., 3], 0, 255)
    rgb = np.clip(o[..., :3] / np.maximum(al[..., None] / 255.0, 1e-3), 0, 255)
    # loang màu ra mép trong suốt (tránh viền đen khi lọc)
    out = np.concatenate([rgb, al[..., None]], -1)
    out[al < 1] = 0
    return out.astype(np.uint8)


def lop_ngoai(box, fw, fh, lx, ly):
    """phần sáng ngoài thân khung của ô box, đặt sao cho hộp thân = hộp khung fw×fh; lề lx, ly (tỉ lệ khung)"""
    x0, y0, x1, y1 = box
    b = than(box)
    ys, xs = np.nonzero(b)
    bx0, bx1, by0, by1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    keep = ~nd.binary_dilation(b, iterations=2)
    # đèn xanh giữa 2 thanh dọc của khung ChatGPT (không thuộc quầng) → bỏ, tránh chồng lên chi tiết khung thẻ
    yy, xx = np.mgrid[0:b.shape[0], 0:b.shape[1]]
    giua = (yy > by0 + 0.28 * (by1 - by0)) & (yy < by0 + 0.72 * (by1 - by0))
    canh = (xx > bx0 - 0.015 * (bx1 - bx0)) & (xx < bx0 + 0.16 * (bx1 - bx0)) | (xx < bx1 + 0.015 * (bx1 - bx0)) & (xx > bx1 - 0.16 * (bx1 - bx0))
    keep &= ~(giua & canh)
    trong = (xx > bx0 + 0.15 * (bx1 - bx0)) & (xx < bx1 - 0.15 * (bx1 - bx0)) & (yy > by0 + 0.15 * (by1 - by0)) & (yy < by1 - 0.15 * (by1 - by0))
    keep &= ~trong                                     # lòng cửa sổ: không gì che chân dung
    cc = col[y0:y1, x0:x1]
    keep &= cc.max(-1) > 110                           # mảnh viền tối của khung ChatGPT sót ngoài thân
    a = alpha[y0:y1, x0:x1] * keep
    a = nd.gaussian_filter(a, 0.4) * (a > 0)  # mép mềm, không bậc thang
    c = col[y0:y1, x0:x1].copy()
    tim = c[..., 2] > c[..., 1]                        # quầng ánh tím/hồng do trộn nền → kéo về xanh lơ
    c[..., 0] = np.where(tim, np.minimum(c[..., 0], c[..., 1]), c[..., 0])
    # cắt vùng = hộp thân + lề, trong toạ độ raw
    bw, bh = bx1 - bx0, by1 - by0
    X0, X1 = bx0 - lx * bw, bx1 + lx * bw
    Y0, Y1 = by0 - ly * bh, by1 + ly * bh
    W, H = int(round(X1 - X0)), int(round(Y1 - Y0))
    can = np.zeros((H, W, 4), np.float32)
    ox, oy = int(round(-X0)), int(round(-Y0))
    hh, ww = a.shape
    sx0, sy0 = max(0, -ox), max(0, -oy)
    sx1, sy1 = min(ww, W - ox), min(hh, H - oy)
    can[sy0 + oy:sy1 + oy, sx0 + ox:sx1 + ox, :3] = c[sy0:sy1, sx0:sx1]
    can[sy0 + oy:sy1 + oy, sx0 + ox:sx1 + ox, 3] = a[sy0:sy1, sx0:sx1] * 255
    ow, oh = int(round(fw * (1 + 2 * lx))), int(round(fh * (1 + 2 * ly)))
    return lanczos(can, ow, oh), (bw, bh)


def cat(box, w=None):
    x0, y0, x1, y1 = box
    a = alpha[y0:y1, x0:x1]
    lab, n = nd.label(a > 0.02)
    sz = nd.sum(a > 0.02, lab, range(1, n + 1))
    giu = np.isin(lab, [i + 1 for i in range(n) if sz[i] > 30])
    a = a * giu
    ys, xs = np.nonzero(a > 0.02)
    sl = (slice(ys.min(), ys.max() + 1), slice(xs.min(), xs.max() + 1))
    rgba = np.concatenate([col[y0:y1, x0:x1][sl], (a[sl] * 255)[..., None]], -1)
    h, ww = rgba.shape[:2]
    if w is None: w = ww
    return lanczos(rgba, w, int(round(h * w / ww)))


# khung thẻ hiển thị lớn nhất ≈ 80×84 CSS → 3× ≈ 240×252; raw thân khung ≈ 215×225 → dùng cỡ raw (không phóng)
FW, FH = 216, 228
info = {}
# hàng 1: vòng lặp (4 khung) — lề 9 %
V = [(87, 21, 347, 291), (407, 20, 674, 292), (732, 24, 1001, 289), (1061, 24, 1319, 289)]
LX = LY = 0.09
fr = []
for bx in V:
    o, bb = lop_ngoai(bx, FW, FH, LX, LY); fr.append(o); info.setdefault('vong_than', []).append(bb)
Image.fromarray(np.concatenate(fr, 1), 'RGBA').save(os.path.join(A, 'chon_vong.png'), optimize=True)
info['vong'] = {'w': fr[0].shape[1], 'h': fr[0].shape[0], 'lx': LX, 'ly': LY, 'n': len(fr)}
# hàng 2: bùng (bỏ khung 1 = khung trơn chưa có hiệu ứng) — lề 30 %
BU = [(300, 301, 548, 603), (554, 301, 840, 603), (840, 301, 1128, 603), (1140, 301, 1380, 603)]
BX = BY = 0.30
fr = []
for bx in BU:
    o, bb = lop_ngoai(bx, FW, FH, BX, BY); fr.append(o); info.setdefault('bung_than', []).append(bb)
Image.fromarray(np.concatenate(fr, 1), 'RGBA').save(os.path.join(A, 'chon_bung.png'), optimize=True)
info['bung'] = {'w': fr[0].shape[1], 'h': fr[0].shape[0], 'lx': BX, 'ly': BY, 'n': len(fr)}
# hàng 3: huy hiệu — cỡ to, hiển thị ≈ 32×16 CSS → 3× ≈ 100 px rộng
hu = cat((130, 605, 512, 820), 108)
Image.fromarray(hu, 'RGBA').save(os.path.join(A, 'chon_huy.png'), optimize=True); info['huy'] = hu.shape[:2]
# hàng 4: đế sáng — hiển thị ≈ 100 CSS rộng → 3× ≈ 300 (raw ≈ 380)
for ten, bx in (('chon_de_xanh', (270, 840, 680, 1115)), ('chon_de_cam', (750, 840, 1145, 1115))):
    o = cat(bx, 300); Image.fromarray(o, 'RGBA').save(os.path.join(A, ten + '.png'), optimize=True); info[ten] = o.shape[:2]
print(json.dumps(info, default=int))
