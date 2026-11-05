#!/usr/bin/env python3
"""Cắt 10 tờ CHIÊU ĐẶC BIỆT (ChatGPT, nền magenta, mỗi hàng = 1 hoạt ảnh, ô đều) → thap/assets/sig_<ma>_<nhom>.png
(dải ngang n khung bằng nhau, khoá magenta alpha mềm, thu Lanczos nhân-trước-alpha về 3× cỡ hiển thị lớn nhất, không vượt raw)
+ thap/js/sig-meta.js ({ten: [n, fw, fh]}) + contact sheet docs/demo-hop-tuong/tuvan/sig/cut_contact.png.
Hàng: chiếu bóng alpha theo trục dọc → dải; trong dải: thành phần liên thông (giãn để gom tia lẻ) → gom theo trục ngang.
Dùng: python3 tools/thap-cat-sig.py
"""
import json, os
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(ROOT, 'docs/demo-hop-tuong/thap-art')
OUT = os.path.join(ROOT, 'thap/assets')
TV = os.path.join(ROOT, 'docs/demo-hop-tuong/tuvan/sig')
os.makedirs(TV, exist_ok=True)

# tờ → [(nhóm, số khung, cỡ hiển thị LỚN NHẤT (px logic, cạnh dài), mềm?)] theo thứ tự hàng trên → dưới
TO = {
    'L22': [('stage', 5, 64, 0), ('hand', 9, 120, 0), ('string', 6, 70, 0), ('shadow', 3, 44, 0), ('toy', 8, 120, 0), ('immune', 4, 70, 0)],
    'M05': [('throne', 8, 120, 0), ('hands', 8, 110, 0), ('echo', 5, 64, 0), ('hourglass', 6, 110, 0)],
    'M01': [('shards', 5, 190, 0), ('lens', 9, 190, 0), ('swirl', 8, 190, 0), ('crush', 7, 200, 0), ('release', 4, 200, 0)],
    'M09': [('wake', 6, 90, 0), ('wings', 6, 130, 0), ('wyrm', 8, 110, 0), ('cone', 6, 130, 0), ('crest', 5, 110, 0)],
    'M07': [('jaw', 4, 140, 0), ('neck', 8, 110, 0), ('breath', 6, 110, 0), ('corner', 4, 80, 0), ('sigil', 4, 90, 0)],
    'L14': [('heads', 8, 90, 0), ('bite', 6, 70, 0), ('fusion', 8, 100, 0), ('beam', 4, 110, 0), ('hit', 6, 90, 0)],
    'L16': [('vault', 8, 90, 0), ('wheel', 6, 90, 0), ('icons', 6, 48, 0),
            ('o_atk', 4, 110, 0), ('o_def', 4, 110, 0), ('o_heal', 4, 110, 0), ('o_zap', 4, 110, 0), ('o_void', 4, 110, 0), ('o_gold', 4, 110, 0)],
    'L06': [('thief', 8, 80, 0), ('courier', 8, 80, 0), ('shatter', 6, 70, 0), ('gift', 6, 70, 0), ('seal', 3, 60, 0)],
    'L04': [('crest', 5, 90, 0), ('crown', 7, 90, 0), ('hammer', 6, 70, 0), ('star', 6, 64, 0)],
    'M06': [('queen', 7, 80, 0), ('pulse', 6, 110, 0), ('drone', 6, 28, 0), ('comb', 6, 64, 0), ('crest', 5, 90, 0)],
}
META, CONTACT = {}, []


def nen(a):
    v = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    return np.median(v, axis=0)


def khoa(a, bg, mem):
    """RGB float → RGBA float: color-to-alpha theo màu nền (giữ quầng mềm, tách trộn màu nền) + lõi đặc cho hình có viền."""
    bg = np.where(bg > 235, 255.0, np.where(bg < 20, 0.0, bg))
    d = a - bg
    dn0 = np.sign(d) * np.maximum(np.abs(d) - 8, 0)
    up = np.where(dn0 > 0, dn0 / np.maximum(255 - bg, 1), 0)
    dn = np.where(dn0 < 0, -dn0 / np.maximum(bg, 1), 0)
    al = np.clip(np.max(np.maximum(up, dn), axis=2), 0, 1)
    if not mem:
        dist = np.sqrt((d ** 2).sum(2))
        solid = ndi.binary_erosion(dist > 95, iterations=1)
        soft = ndi.gaussian_filter(solid.astype(np.float32), 0.8)  # viền alpha mềm ~1 px
        al = np.maximum(al, np.clip(soft * 1.4, 0, 1))
    al[al < 0.035] = 0
    a2 = np.where(al[..., None] > 0, bg + d / np.maximum(al[..., None], 1e-3), 0)
    a2 = np.where(al[..., None] >= 0.999, a, a2)
    return np.dstack([np.clip(a2, 0, 255), al * 255])


def bands_of(alpha, n_want):
    prof = (alpha > 30).sum(1)
    on = prof > 2
    lab, n = ndi.label(on)
    bs = [(s.start, s.stop) for s, in ndi.find_objects(lab)]
    bs = [b for b in bs if b[1] - b[0] > 10]
    # gộp dải sát nhau (khe < 6 px) cho tới khi đủ số hàng
    while len(bs) > n_want:
        gaps = [bs[i + 1][0] - bs[i][1] for i in range(len(bs) - 1)]
        i = int(np.argmin(gaps)); bs[i:i + 2] = [(bs[i][0], bs[i + 1][1])]
    # thiếu hàng (bụi/tia nối 2 hàng): tách dải dày nhất ở chỗ lõm sâu nhất của bóng chiếu (bỏ 25% hai đầu)
    sm = ndi.uniform_filter1d(prof.astype(np.float32), 5)
    while len(bs) < n_want:
        def best(b):
            lo, hi = b[0] + (b[1] - b[0]) // 4, b[1] - (b[1] - b[0]) // 4
            y = lo + int(np.argmin(sm[lo:hi])); return sm[y] / max(1, sm[b[0]:b[1]].max()), y
        sc = [best(b) for b in bs]
        i = int(np.argmin([s for s, _ in sc])); y = sc[i][1]
        bs[i:i + 1] = [(bs[i][0], y), (y, bs[i][1])]
    return bs


def cells_of(alpha, y0, y1, n_want):
    m = alpha[y0:y1] > 20
    md = ndi.binary_dilation(m, iterations=4)
    colon = md.any(0)
    lab, n = ndi.label(colon)
    xs = [(s.start, s.stop) for s, in ndi.find_objects(lab)]
    xs = [x for x in xs if x[1] - x[0] > 6]
    while len(xs) > n_want:  # mảnh lẻ: gộp vào khe hẹp nhất
        gaps = [xs[i + 1][0] - xs[i][1] for i in range(len(xs) - 1)]
        i = int(np.argmin(gaps)); xs[i:i + 2] = [(xs[i][0], xs[i + 1][1])]
    # thiếu ô (quầng 2 ô chạm nhau): tách đoạn RỘNG NHẤT (so với bề rộng ô trung bình) ở chỗ lõm của bóng chiếu dọc
    prof = ndi.uniform_filter1d((alpha[y0:y1] > 20).sum(0).astype(np.float32), 7)
    while len(xs) < n_want:
        tb = sum(b - a_ for a_, b in xs) / n_want
        i = int(np.argmax([(b - a_) for a_, b in xs])); x0, x1 = xs[i]
        k = max(2, round((x1 - x0) / tb))
        # điểm cắt gần vị trí chia đều 1/k nhất, tìm lõm trong ±35% bề rộng ô
        c0 = x0 + (x1 - x0) / k; lo, hi = int(c0 - tb * 0.35), int(c0 + tb * 0.35)
        x = lo + int(np.argmin(prof[lo:hi]))
        xs[i:i + 1] = [(x0, x), (x, x1)]
    return xs


def thu(c, nw, nh):
    pm = c.copy(); pm[..., :3] *= pm[..., 3:4] / 255
    im = Image.fromarray(np.clip(pm, 0, 255).astype(np.uint8), 'RGBA').resize((nw, nh), Image.LANCZOS)
    q = np.asarray(im).astype(np.float32)
    q[..., :3] = np.where(q[..., 3:4] > 0, q[..., :3] * 255 / np.maximum(q[..., 3:4], 1), 0)
    return np.clip(q, 0, 255).astype(np.uint8)


for ma, groups in TO.items():
    p = os.path.join(ART, 'raw_fx_SIG_' + ma + '.png')
    a = np.asarray(Image.open(p).convert('RGB')).astype(np.float32)
    bg = nen(a)
    hard, soft = khoa(a, bg, False), khoa(a, bg, True)
    bs = bands_of(hard[..., 3], len(groups))
    assert len(bs) == len(groups), (ma, len(bs), bs)
    for (y0, y1), (g, n, disp, mem) in zip(bs, groups):
        rg = soft if mem else hard
        xs = cells_of(rg[..., 3], y0, y1, n)
        if len(xs) != n:
            print('  !!', ma, g, 'tìm', len(xs), 'ô, cần', n, '→ chia đều')
            X0, X1 = xs[0][0], xs[-1][1]
            xs = [(round(X0 + (X1 - X0) * i / n), round(X0 + (X1 - X0) * (i + 1) / n)) for i in range(n)]
        pad = 3
        Y0, Y1 = max(0, y0 - pad), min(a.shape[0], y1 + pad)
        fw = max(x1 - x0 for x0, x1 in xs) + 2 * pad
        fh = Y1 - Y0
        fr = []
        for x0, x1 in xs:
            cx = (x0 + x1) // 2
            X0 = cx - fw // 2
            c = np.zeros((fh, fw, 4), np.float32)
            sx0, sx1 = max(0, X0), min(a.shape[1], X0 + fw)
            c[:, sx0 - X0:sx1 - X0] = rg[Y0:Y1, sx0:sx1]
            # chỉ giữ phần thuộc ô (cắt bỏ mép ô bên cạnh)
            keep = np.zeros(fw, bool); keep[max(0, x0 - pad - X0):min(fw, x1 + pad - X0)] = True
            c[:, ~keep, 3] = 0
            fr.append(c)
        k = min(1.0, 3 * disp / max(fw, fh))
        nw, nh = max(2, round(fw * k)), max(2, round(fh * k))
        strip = np.zeros((nh, nw * n, 4), np.uint8)
        for i, c in enumerate(fr):
            strip[:, i * nw:(i + 1) * nw] = thu(c, nw, nh)
        ten = 'sig_%s_%s' % (ma.lower(), g)
        im = Image.fromarray(strip, 'RGBA')
        # bảng màu 256 (alpha theo màu, khuếch tán lỗi): nhẹ ~4× mà nhìn như bản gốc — 10 tờ tải lười theo bộ bài
        im.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG).save(os.path.join(OUT, ten + '.png'), optimize=True)
        META[ten] = [n, nw, nh]
        CONTACT.append((ten, im))
        print(ten, n, 'khung', nw, 'x', nh, '(raw %dx%d)' % (fw, fh))

with open(os.path.join(ROOT, 'thap/js/sig-meta.js'), 'w') as f:
    f.write('// sinh bởi tools/thap-cat-sig.py — [số khung, rộng khung, cao khung] của dải chiêu đặc biệt (đừng sửa tay)\n')
    f.write("'use strict';\nconst SIG_META = " + json.dumps(META, separators=(',', ':')) + ';\n')

# contact sheet: mỗi dải 1 hàng, nền ca-rô
rowh, W0 = 110, 1400
sheet = Image.new('RGBA', (W0, rowh * len(CONTACT)), (40, 44, 52, 255))
dr = ImageDraw.Draw(sheet)
for i, (ten, im) in enumerate(CONTACT):
    y = i * rowh
    for yy in range(y, y + rowh, 10):
        for xx in range(0, W0, 10):
            if (xx // 10 + yy // 10) % 2: dr.rectangle([xx, yy, xx + 9, yy + 9], fill=(60, 64, 72, 255))
    t = im.copy(); t.thumbnail((W0 - 150, rowh - 6))
    sheet.alpha_composite(t, (150, y + 3))
    dr.text((4, y + 40), ten.replace('sig_', ''), fill=(240, 240, 240, 255))
sheet.convert('RGB').save(os.path.join(TV, 'cut_contact.jpg'), quality=85)
print('xong', len(META), 'dải')
