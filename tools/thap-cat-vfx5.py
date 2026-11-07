#!/usr/bin/env python3
"""Cắt 5 dải ChatGPT rà soát VFX (07/11) + dải Rồng bổ nhào → thap/assets/fx_<ten>.png (dải ngang n khung bằng nhau).
Nguồn: docs/demo-hop-tuong/thap-art/raw_fx_<raw>.png (1 hàng, nền magenta, ô đều).
Mỗi ô: khoá màu nền (color-to-alpha, tách trộn màu nền) → LOANG từ viền ô (vùng gần màu nền nối với viền = trong suốt hẳn, kể cả hốc nền kín)
→ khử viền hồng (dải 2 px sát nền: bỏ ánh magenta) → bỏ đảo lẻ (chấm thừa) → căn tâm theo khối lớn nhất → thu Lanczos nhân-trước-alpha
về 3× cỡ hiển thị lớn nhất (không vượt raw). In cỡ khung để dán vào js/vfxmoi.js (VXM.META).
Dùng: python3 tools/thap-cat-vfx5.py [ten ...]
"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(ROOT, 'docs/demo-hop-tuong/thap-art')
OUT = os.path.join(ROOT, 'thap/assets')

# mượn khoá màu / thu nhỏ từ thap-cat-sig.py (không chạy phần chính của nó)
src = open(os.path.join(ROOT, 'tools/thap-cat-sig.py'), encoding='utf-8').read().split('\nfor ma, groups in TO.items():')[0]
G = {'__file__': os.path.join(ROOT, 'tools/thap-cat-sig.py')}; exec(compile(src, 'thap-cat-sig.py', 'exec'), G)
nen, thu = G['nen'], G['thu']

# tên ra → (ảnh raw, số khung, cỡ hiển thị lớn nhất px logic (cạnh dài), đảo nhỏ nhất giữ lại (px raw), mềm? (khói/nổ: giữ quầng))
DS = {
    'fx_cuuvi_hoho': ('raw_fx_cuuvi_hoho', 6, 30, 300, False),
    'fx_orbital_bomno': ('raw_fx_orbital_no', 6, 96, 60, True),
    'fx_min_mo': ('raw_fx_min_mo', 6, 34, 300, False),
    'fx_mortar_chum': ('raw_fx_mortar_chum', 6, 130, 60, True),
    'fx_drone_bom': ('raw_fx_drone_bom', 6, 38, 300, False),
    'fx_ronglua_dive': ('raw_fx_ronglua_dive', 8, 84, 300, False),
}


def cat_o(c, bg, mem, dao):
    """1 ô RGB float → RGBA float đã khoá nền magenta.
    Tách trộn theo phần magenta: k = min(R,B) − G (nền ≈ 255, hình không ánh tím ≈ ≤ 0) → f = k/255 phần nền,
    alpha = 1 − f, màu = (c − f·nền)/(1 − f). Không dùng color-to-alpha 1 màu (khói xám trên magenta sẽ ra XANH LÁ)."""
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    k = np.minimum(r, b) - g
    f = np.clip((k - 18) / (255 - 18 - 25), 0, 1)       # ≤ 18: hình đục; ≥ 230: nền
    rg = np.zeros(c.shape[:2] + (4,), np.float32)
    for ch in range(3): rg[..., ch] = np.clip((c[..., ch] - f * bg[ch]) / np.maximum(1 - f, 1e-3), 0, 255)
    rg[..., 3] = (1 - f) * 255
    d = np.sqrt(((c - bg) ** 2).sum(2))
    # loang từ viền ô: điểm gần màu nền (≤ 70) nối với viền ô → nền thật (trong suốt hẳn); hốc nền kín gần đúng màu nền (≤ 22) cũng vậy
    gan = d < 70
    lab, n = ndi.label(gan)
    vien = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    nenThat = np.isin(lab, list(vien)) if vien else np.zeros_like(gan)
    nenThat |= d < 22
    rg[nenThat, 3] = 0
    # khử viền: dải 1 px sát nền thật mờ bớt (không bậc thang, không viền hồng)
    dai = ndi.binary_dilation(nenThat, iterations=1) & ~nenThat
    rg[dai, 3] *= 0.6 if not mem else 0.8
    # bỏ đảo lẻ (chấm thừa / mảnh vụn ChatGPT rời)
    al = rg[..., 3]
    lab, n = ndi.label(al > 24)
    if n:
        sz = ndi.sum(np.ones_like(al), lab, range(1, n + 1))
        for i, s_ in enumerate(sz):
            if s_ < dao: rg[lab == i + 1, 3] = 0
    rg[rg[..., 3] < 6, 3] = 0
    return rg


def chay(ten):
    raw, n, disp, dao, mem = DS[ten]
    p = os.path.join(ART, raw + '.png')
    if not os.path.exists(p): print('thiếu', p); return None
    a = np.asarray(Image.open(p).convert('RGB')).astype(np.float32)
    bg = nen(a); H, W = a.shape[:2]; cw = W / n
    os_ = [cat_o(a[:, int(round(i * cw)):int(round((i + 1) * cw))], bg, mem, dao) for i in range(n)]
    # hộp chung: căn theo tâm khối của từng ô (giữ vị trí tương đối trong ô = chuyển động thật của hoạt ảnh)
    ys, xs = [], []
    for o in os_:
        m = o[..., 3] > 10
        if m.any():
            yy, xx = np.where(m); ys += [yy.min(), yy.max()]; xs += [xx.min() - o.shape[1] / 2, xx.max() - o.shape[1] / 2]
    y0, y1 = max(0, int(min(ys)) - 3), min(H, int(max(ys)) + 4)
    half = int(max(abs(min(xs)), abs(max(xs)))) + 3
    fw, fh = 2 * half, y1 - y0
    fr = []
    for o in os_:
        c = np.zeros((fh, fw, 4), np.float32); ow = o.shape[1]; cx = ow // 2
        sx0, sx1 = max(0, cx - half), min(ow, cx + half)
        c[:, sx0 - (cx - half):sx1 - (cx - half)] = o[y0:y1, sx0:sx1]
        fr.append(c)
    kk = min(1.0, 3 * disp / max(fw, fh))
    nw, nh = max(2, round(fw * kk)), max(2, round(fh * kk))
    strip = np.zeros((nh, nw * n, 4), np.uint8)
    for i, c in enumerate(fr): strip[:, i * nw:(i + 1) * nw] = thu(c, nw, nh)
    im = Image.fromarray(strip, 'RGBA')
    im.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG).save(os.path.join(OUT, ten + '.png'), optimize=True)
    print(ten, n, 'khung', nw, 'x', nh, '(raw %dx%d)' % (fw, fh))
    return [n, nw, nh]


META = {}
for ten in (sys.argv[1:] or DS.keys()):
    r = chay(ten)
    if r: META[ten] = r
print(META)
