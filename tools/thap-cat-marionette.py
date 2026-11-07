#!/usr/bin/env python3
"""Cắt 3 dải ChatGPT mới của Rối Máy (Marionette) → thap/assets/fx_marionette_{tay,thanh,day}.png (dải ngang n khung bằng nhau).
Nguồn: docs/demo-hop-tuong/thap-art/raw_fx_marionette_{tay,thanh,day}.png (1 hàng, nền magenta).
Khoá magenta (alpha mềm, tách trộn màu nền) → ô theo bóng chiếu cột → bỏ đảo lẻ → căn khung theo neo (cổ tay / tâm / sợi dây)
→ thu Lanczos nhân-trước-alpha về 3× cỡ hiển thị lớn nhất. In cỡ khung để dán vào js/sigfx.js (SIG_META).
Dùng: python3 tools/thap-cat-marionette.py
"""
import os, importlib.util, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(ROOT, 'docs/demo-hop-tuong/thap-art')
OUT = os.path.join(ROOT, 'thap/assets')

# mượn khoá màu / chia ô / thu nhỏ từ thap-cat-sig.py (không chạy phần chính của nó)
src = open(os.path.join(ROOT, 'tools/thap-cat-sig.py'), encoding='utf-8').read().split('\nfor ma, groups in TO.items():')[0]
G = {'__file__': os.path.join(ROOT, 'tools/thap-cat-sig.py')}; exec(compile(src, 'thap-cat-sig.py', 'exec'), G)
nen, khoa, cells_of, thu = G['nen'], G['khoa'], G['cells_of'], G['thu']

# tên → (số khung, cỡ hiển thị lớn nhất px logic (cạnh dài), neo căn ngang: 'tren' = tâm khối 30% trên (cổ tay), 'tam' = tâm hộp, 'cot' = cột đặc nhất (sợi dây), đảo nhỏ nhất giữ lại)
DS = {'tay': (8, 80, 'tren', 400), 'thanh': (6, 60, 'tam', 400), 'day': (4, 60, 'cot', 12)}
META = {}
for ten, (n, disp, neo, dao) in DS.items():
    a = np.asarray(Image.open(os.path.join(ART, 'raw_fx_marionette_%s.png' % ten)).convert('RGB')).astype(np.float32)
    rg = khoa(a, nen(a), False)
    al = rg[..., 3]
    # khử viền hồng: điểm ánh tím-hồng (R,B cao, G thấp, R≈B) = bóng/quầng trộn nền → bóng sẫm (tay, thanh) hoặc ánh vàng (dây)
    r, g, b = rg[..., 0], rg[..., 1], rg[..., 2]
    hong = (r > g + 35) & (b > g + 35) & (np.abs(r - b) < 70) & (al > 0)
    if ten == 'day':
        rg[hong, 0], rg[hong, 1], rg[hong, 2] = 255, 214, 110
    else:
        rg[hong, 0], rg[hong, 1], rg[hong, 2] = 36, 18, 24
        rg[hong & (al < 250), 3] *= 0.55
    # bỏ đảo lẻ (chấm thừa) nhỏ hơn `dao` px
    lab, k = ndi.label(al > 20)
    if k:
        sz = ndi.sum(np.ones_like(al), lab, range(1, k + 1))
        for i, s in enumerate(sz):
            if s < dao: rg[lab == i + 1, 3] = 0
    rows = np.where((rg[..., 3] > 20).sum(1) > 0)[0]
    y0, y1 = max(0, rows[0] - 4), min(a.shape[0], rows[-1] + 5)
    xs = cells_of(rg[..., 3], y0, y1, n)
    assert len(xs) == n, (ten, len(xs))
    fh = y1 - y0
    cx = []
    for x0, x1 in xs:
        c = rg[y0:y1, x0:x1, 3] > 40
        if neo == 'tren':
            top = c[: int(fh * 0.3)]; cols = np.where(top.any(0))[0]
        elif neo == 'cot':
            cols = [int(np.argmax(c.sum(0)))] * 2
        else:
            cols = np.where(c.any(0))[0]
        cx.append(x0 + (cols[0] + cols[-1]) / 2)
    half = int(max(max(cx[i] - xs[i][0], xs[i][1] - cx[i]) for i in range(n))) + 4
    fw = 2 * half
    fr = []
    for (x0, x1), c0 in zip(xs, cx):
        X0 = int(round(c0)) - half
        c = np.zeros((fh, fw, 4), np.float32)
        sx0, sx1 = max(0, X0, x0 - 3), min(a.shape[1], X0 + fw, x1 + 3)
        c[:, sx0 - X0:sx1 - X0] = rg[y0:y1, sx0:sx1]
        fr.append(c)
    kk = min(1.0, 3 * disp / max(fw, fh))
    nw, nh = max(2, round(fw * kk)), max(2, round(fh * kk))
    strip = np.zeros((nh, nw * n, 4), np.uint8)
    for i, c in enumerate(fr): strip[:, i * nw:(i + 1) * nw] = thu(c, nw, nh)
    im = Image.fromarray(strip, 'RGBA')
    im.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG).save(os.path.join(OUT, 'fx_marionette_%s.png' % ten), optimize=True)
    META['fx_marionette_' + ten] = [n, nw, nh]
    print('fx_marionette_%s' % ten, n, 'khung', nw, 'x', nh, '(raw %dx%d)' % (fw, fh))
print(META)
