#!/usr/bin/env python3
"""Cắt 4 mảnh giáp từ ảnh gen thật và thu nhỏ về cỡ xương ô 96 (giữ nét).

Nguồn (CHỈ ĐỌC): ../anh-gen/giap-roi-4-manh.png  (1 hàng 4 mảnh trên nền #00FF00)
                ../data.json                     (độ dài xương trung bình)
Ra rig/giap-gen/:
  goc-<mảnh>.png       bản gốc cắt (nền trong suốt, đã tách viền xanh, đã xoay về chiều xương)
  <mảnh>.png           bản thu nhỏ cỡ ô 96 (dùng trong rig)
  <mảnh>-x2.png        bản thu nhỏ cỡ ô 192 (CHỈ để so sánh "nhân vật ×2", game không dùng)
  chup-*.png           3 chụp khớp: hình của bộ máy vẽ, tô lại bằng bảng màu gen
  gen.json             cỡ, điểm neo, bảng màu, số liệu từng bước (tao-rig.py đọc tệp này)

Cách thu nhỏ (giữ nét):
  1. Tách nền: điểm ảnh có xanh lá trội (G - max(R,B) > 28) là nền. Viền xanh nhạt lẫn
     (G - max(R,B) > 10 và chạm nền) cũng bỏ. Điểm còn lại hơi ngả xanh thì kéo G về max(R,B).
  2. Giảm màu: k-means trên điểm ảnh của cả 4 mảnh -> bảng 8 màu lấy từ chính ảnh
     (viền đen, 3 tông thép, 3 tông đồng, 1 tông tối trong lòng ống).
  3. Thu nhỏ có chọn lọc: mỗi điểm ảnh đích ứng với 1 ô trong ảnh gốc.
     - Có hình nếu ô phủ ≥ 40% hình.
     - Ô có ≥ 50% viền đen -> viền đen.
     - Ô có ≥ 45% đồng (không tính viền) -> tô đồng (đai đồng mỏng không bị thép lấn mất);
       ngược lại tô thép. Màu cụ thể = trung bình màu trong ô rồi bám về màu gần nhất của
       nhóm đó trong bảng (đỡ lấm tấm hơn lấy màu đông nhất).
     - Điểm ảnh ở mép hình (chạm ô trống) mà ô gốc có ≥ 12% viền đen -> tô viền đen.
  4. Dọn điểm ảnh lẻ: bỏ điểm có hình không chạm điểm có hình nào (4 hướng); điểm bên trong
     khác màu với cả 8 điểm quanh (trừ viền/đồng) -> đổi theo màu đông nhất quanh nó.
Chạy:  python3 docs/thu-modular-96/rig/tao-giap-gen.py   (rồi tao-rig.py)
"""
import json, math, os
import numpy as np
from PIL import Image

RIG = os.path.dirname(os.path.abspath(__file__))
BO = os.path.dirname(RIG)
SRC = os.path.join(BO, 'anh-gen', 'giap-roi-4-manh.png')
OUT = os.path.join(RIG, 'giap-gen')
os.makedirs(OUT, exist_ok=True)

a = np.asarray(Image.open(SRC).convert('RGB')).astype(int)
R, G, B = a[..., 0], a[..., 1], a[..., 2]
lead = G - np.maximum(R, B)
bg = lead > 28
# viền xanh nhạt: hơi xanh và chạm nền (giãn nền 2 lần)
near = bg.copy()
for _ in range(2):
    n = near.copy()
    n[1:] |= near[:-1]; n[:-1] |= near[1:]; n[:, 1:] |= near[:, :-1]; n[:, :-1] |= near[:, 1:]
    near = n
fringe = (lead > 10) & near & ~bg
fg = ~(bg | fringe)
nFringe = int(fringe.sum())
a2 = a.copy()
spill = fg & (lead > 0)
a2[..., 1] = np.where(spill, np.maximum(R, B), G)

# ---------- tìm 4 mảnh theo cột trống ----------
cols = fg.sum(0)
segs, inn = [], False
for x, c in enumerate(cols):
    if c > 3 and not inn: s, inn = x, True
    if c <= 3 and inn:
        if x - s > 40: segs.append((s, x))
        inn = False
assert len(segs) == 4, segs
TEN = ['giap-vai', 'giap-cang-tay', 'giap-ong-chan', 'giap-nguc']
NAME = {'giap-vai': 'Giáp vai', 'giap-cang-tay': 'Giáp cẳng tay', 'giap-ong-chan': 'Giáp ống chân', 'giap-nguc': 'Giáp ngực nhỏ'}

# ---------- độ dài xương trung bình (ô 96) ----------
D = json.load(open(os.path.join(BO, 'data.json')))
def avg(a_, b_, frac=1.0):
    return sum(math.dist(f['joints'][a_], f['joints'][b_]) for f in D['frames']) / len(D['frames']) * frac
CHEST_FRAC = 0.6   # giáp ngực phủ từ cổ tới 60% đoạn cổ → giữa hông (≈ thắt lưng)
BONE = {
    'giap-vai': ('vai → khuỷu (trước)', avg('shoulderFront', 'elbowFront')),
    'giap-cang-tay': ('khuỷu → cổ tay (trước)', avg('elbowFront', 'wristFront')),
    'giap-ong-chan': ('gối → cổ chân', (avg('kneeFront', 'ankleFront') + avg('kneeBack', 'ankleBack')) / 2),
    'giap-nguc': ('cổ → 60% tới giữa hông', avg('neck', 'hipCenter', CHEST_FRAC)),
}
# điểm neo nằm ở tỉ lệ này theo chiều dài ảnh (phần thò ra 2 đầu để che khớp)
ANCHOR_FRAC = {'giap-vai': (0.15, 0.85), 'giap-cang-tay': (0.12, 0.88), 'giap-ong-chan': (0.12, 0.88), 'giap-nguc': (0.08, 0.92)}

crops, meta = {}, {}
for ten, (x0, x1) in zip(TEN, segs):
    m = fg[:, x0:x1]
    ys = np.where(m.any(1))[0]
    y0, y1 = ys.min(), ys.max() + 1
    rgb = a2[y0:y1, x0:x1].astype(np.uint8)
    al = (m[y0:y1] * 255).astype(np.uint8)
    im = Image.fromarray(np.dstack([rgb, al]), 'RGBA')
    huong = 'giữ nguyên'
    if ten == 'giap-nguc':
        im = im.rotate(90, expand=True)     # ngược chiều kim đồng hồ: cổ (đỉnh) sang trái
        huong = 'xoay 90° ngược chiều kim đồng hồ: cổ (mép trên) sang trái, thắt lưng sang phải'
    elif ten in ('giap-cang-tay', 'giap-ong-chan'):
        # đầu xương (khuỷu/gối) là đầu loe to hơn -> phải nằm bên trái
        A = np.asarray(im)[..., 3] > 0
        w = A.shape[1]; k = max(3, w // 7)
        left, right = A[:, :k].sum(0).mean(), A[:, -k:].sum(0).mean()
        if right > left:
            im = im.transpose(Image.FLIP_LEFT_RIGHT); huong = 'lật ngang (đầu loe sang trái)'
        else:
            huong = 'giữ nguyên (đầu loe = khớp đầu đã ở bên trái: dày %.0f so với %.0f điểm ảnh)' % (left, right)
    else:
        huong = 'giữ nguyên (mép vòm vai ở bên trái)'
    im.save(os.path.join(OUT, 'goc-%s.png' % ten))
    crops[ten] = im
    meta[ten] = {'cutBox': [int(x0), int(y0), int(x1), int(y1)], 'cutSize': list(im.size), 'orient': huong}

# ---------- bảng màu k-means ----------
px = np.concatenate([np.asarray(c)[..., :3][np.asarray(c)[..., 3] > 0] for c in crops.values()]).astype(float)
rng = np.random.default_rng(1)
samp = px[rng.choice(len(px), min(60000, len(px)), replace=False)]
K = 8
# khởi tạo theo độ sáng để kết quả ổn định
lum = samp @ [0.299, 0.587, 0.114]
cent = np.array([samp[(lum >= np.quantile(lum, i / K)) & (lum <= np.quantile(lum, (i + 1) / K))].mean(0) for i in range(K)])
for _ in range(30):
    lab = ((samp[:, None, :] - cent[None]) ** 2).sum(2).argmin(1)
    cent = np.array([samp[lab == i].mean(0) if (lab == i).any() else cent[i] for i in range(K)])
cent = np.round(cent).astype(int)
order = np.argsort(cent @ [0.299, 0.587, 0.114]); cent = cent[order]
PAL = [tuple(int(v) for v in c) for c in cent]
OUTLINE = 0                                       # tối nhất = viền đen
BRONZE = [i for i, c in enumerate(PAL) if c[0] > c[2] + 35 and i != OUTLINE]
STEEL = [i for i in range(K) if i not in BRONZE and i != OUTLINE]
def role(i):
    return 'viền' if i == OUTLINE else ('đồng' if i in BRONZE else 'thép/tối')
BRONZE_MIN = 0.45   # ô có ≥45% đồng (không tính viền) thì tô đồng


def to_idx(im):
    arr = np.asarray(im).astype(float)
    rgb, al = arr[..., :3], arr[..., 3] > 0
    d = ((rgb[..., None, :] - cent[None, None].astype(float)) ** 2).sum(3)
    return np.where(al, d.argmin(2), -1)


def shrink(idx, W, H):
    h, w = idx.shape
    out = -np.ones((H, W), int); edgeOut = np.zeros((H, W))
    for ty in range(H):
        for tx in range(W):
            blk = idx[int(ty * h / H):max(int(ty * h / H) + 1, int((ty + 1) * h / H)),
                      int(tx * w / W):max(int(tx * w / W) + 1, int((tx + 1) * w / W))]
            v = blk[blk >= 0]
            if v.size < 0.40 * blk.size:
                continue
            fo = (v == OUTLINE).mean()
            edgeOut[ty, tx] = fo
            inner = v[v != OUTLINE]
            if fo >= 0.5 or inner.size == 0:          # ô gần như toàn viền -> viền
                out[ty, tx] = OUTLINE; continue
            fb = np.isin(inner, BRONZE).mean()
            if fb >= BRONZE_MIN:                       # đai đồng mỏng: giữ màu đồng
                cand = inner[np.isin(inner, BRONZE)]
            else:
                cand = inner[~np.isin(inner, BRONZE)]
            mean = cent[cand].mean(0)                  # trung bình màu rồi bám về bảng (đỡ lấm tấm)
            pool = BRONZE if fb >= BRONZE_MIN else STEEL
            out[ty, tx] = int(min(pool, key=lambda i: ((cent[i] - mean) ** 2).sum()))
    st = {'outlineForced': 0, 'removedLonely': 0, 'fixedStray': 0}
    op = out >= 0
    for ty in range(H):
        for tx in range(W):
            if not op[ty, tx]: continue
            border = any(not (0 <= ty + dy < H and 0 <= tx + dx < W) or not op[ty + dy, tx + dx]
                         for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            if border and out[ty, tx] != OUTLINE and edgeOut[ty, tx] >= 0.12:
                out[ty, tx] = OUTLINE; st['outlineForced'] += 1
    # dọn điểm lẻ
    o2 = out.copy()
    for ty in range(H):
        for tx in range(W):
            if out[ty, tx] < 0: continue
            n4 = [out[ty + dy, tx + dx] for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= ty + dy < H and 0 <= tx + dx < W]
            if not any(v >= 0 for v in n4):
                o2[ty, tx] = -1; st['removedLonely'] += 1; continue
            n8 = [out[ty + dy, tx + dx] for dy in (-1, 0, 1) for dx in (-1, 0, 1) if (dy or dx) and 0 <= ty + dy < H and 0 <= tx + dx < W]
            if len(n8) == 8 and all(v >= 0 for v in n8) and out[ty, tx] not in [OUTLINE] + BRONZE and out[ty, tx] not in n8:
                o2[ty, tx] = int(np.bincount([v for v in n8], minlength=K).argmax()); st['fixedStray'] += 1
    return o2, st


def save_idx(o, path):
    H, W = o.shape
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for y in range(H):
        for x in range(W):
            if o[y, x] >= 0: im.putpixel((x, y), PAL[o[y, x]] + (255,))
    im.save(path)
    return im


for ten, im in crops.items():
    nm, L = BONE[ten]
    f0, f1 = ANCHOR_FRAC[ten]
    W = max(4, round(L / (f1 - f0)))
    H = max(3, round(W * im.size[1] / im.size[0]))
    idx = to_idx(im)
    used = sorted(set(int(v) for v in np.unique(idx) if v >= 0))
    o1, st1 = shrink(idx, W, H)
    o2, st2 = shrink(idx, 2 * W, 2 * H)
    save_idx(o1, os.path.join(OUT, ten + '.png'))
    save_idx(o2, os.path.join(OUT, ten + '-x2.png'))
    meta[ten].update({
        'name': NAME[ten], 'bone': nm, 'avgBoneLen96': round(L, 2),
        'size': [W, H], 'sizeX2': [2 * W, 2 * H],
        'anchorStart': [round(f0 * W, 2), round(H / 2, 2)], 'anchorEnd': [round(f1 * W, 2), round(H / 2, 2)],
        'thicknessScale': 1.0,
        'sourcePixels': int((idx >= 0).sum()), 'pixels96': int((o1 >= 0).sum()), 'pixelsX2': int((o2 >= 0).sum()),
        'colors96': len(set(o1[o1 >= 0].tolist())), 'colorsX2': len(set(o2[o2 >= 0].tolist())), 'colorsSource': len(used),
        'clean96': st1, 'cleanX2': st2,
    })

# ---------- chụp khớp: hình bộ máy vẽ, tô lại bằng màu gen ----------
CAPS = {
    'chup-vai': [".ooo.", "ohllo", "olbdo", "obddo", ".ooo."],
    'chup-khuyu': [".oo.", "oSso", "osxo", ".oo."],
    'chup-goi': [".oo.", "ohlo", "obdo", ".oo."],
}
br = sorted(BRONZE, key=lambda i: sum(PAL[i]))       # đồng tối -> sáng
stl = sorted(STEEL, key=lambda i: sum(PAL[i]))       # thép tối -> sáng
pick = lambda lst, t: lst[min(len(lst) - 1, round(t * (len(lst) - 1)))]
CMAP = {'o': OUTLINE, 'd': pick(br, 0), 'b': pick(br, .5), 'l': pick(br, 1), 'h': pick(br, 1),
        'x': pick(stl, .34), 's': pick(stl, .67), 'S': pick(stl, 1)}
for ten, rows in CAPS.items():
    for sc, suf in ((1, ''), (2, '-x2')):
        im = Image.new('RGBA', (len(rows[0]) * sc, len(rows) * sc), (0, 0, 0, 0))
        for y, r in enumerate(rows):
            for x, c in enumerate(r):
                if c != '.':
                    for dy in range(sc):
                        for dx in range(sc):
                            im.putpixel((x * sc + dx, y * sc + dy), PAL[CMAP[c]] + (255,))
        im.save(os.path.join(OUT, ten + suf + '.png'))
    meta[ten] = {'name': ten, 'size': [len(rows[0]), len(rows)], 'anchor': [len(rows[0]) / 2, len(rows) / 2],
                 'note': 'hình chụp khớp của bộ máy vẽ, tô bằng bảng màu gen (ảnh gen không có chụp khớp)'}

gen = {
    'source': 'docs/thu-modular-96/anh-gen/giap-roi-4-manh.png',
    'sourceSize': [int(a.shape[1]), int(a.shape[0])],
    'greenRemoved': int(bg.sum()), 'lightGreenFringeRemoved': nFringe,
    'palette': [{'rgb': '#%02x%02x%02x' % c, 'role': role(i)} for i, c in enumerate(PAL)],
    'chestFrac': CHEST_FRAC,
    'pieces': meta,
}
json.dump(gen, open(os.path.join(OUT, 'gen.json'), 'w'), ensure_ascii=False, indent=1)
for t in TEN:
    m = meta[t]
    print('%-14s gốc %4d×%-4d -> %2d×%-2d (x2 %d×%d) | xương %.2f | neo %s→%s | %s | điểm ảnh %d→%d | màu %d/%d | dọn %s'
          % (t, *m['cutSize'], *m['size'], *m['sizeX2'], m['avgBoneLen96'], m['anchorStart'], m['anchorEnd'], m['orient'][:30],
             m['sourcePixels'], m['pixels96'], m['colors96'], m['colorsX2'], m['clean96']))
print('bảng màu:', [(p['rgb'], p['role']) for p in gen['palette']])
print('xanh nhạt lẫn bỏ:', nFringe)
