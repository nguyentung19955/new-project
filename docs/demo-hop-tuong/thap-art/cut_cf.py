# Cắt sheet CORE FEEDBACK (raw_cf1, raw_cf2, …) → dải khung ngang trong thap/assets/cf_*.png
# Khoá magenta (alpha theo khoảng cách tới #FF00FF + khử lem), tách khung bằng thành phần liên thông
# (không đoán theo lưới), canh tâm theo khối chính của mỗi khung, xuất ô vuông đều.
import sys, numpy as np
from PIL import Image
from scipy import ndimage as nd
A = '/home/claude/new-project/docs/demo-hop-tuong/thap-art/'
OUT = '/home/claude/new-project/thap/assets/'
SHEETS = {
    'raw_cf1.png': [('cf_vong_hop', 4, 176), ('cf_o_nha', 6, 160), ('cf_hut', 8, 208)],
    'raw_cf2.png': [('cf_no', 5, 224), ('cf_vong_ren', 6, 224), ('cf_dau_sao', 5, 192)],
}
M = np.array([255, 0, 255], np.float32)

def key(p):
    p = p.astype(np.float32)
    d = np.sqrt(((p - M) ** 2).sum(-1))
    a = np.clip((d - 40) / (120 - 40), 0, 1)
    fg = (p - (1 - a[..., None]) * M) / np.maximum(a[..., None], 1e-3)
    fg = np.clip(fg, 0, 255)
    # khử lem tím còn sót ở mép (r và b cùng cao hơn g nhiều mà alpha thấp)
    r, g, b = fg[..., 0], fg[..., 1], fg[..., 2]
    sp = np.clip(np.minimum(r, b) - g - 40, 0, None) * (1 - a)
    fg[..., 0] -= sp; fg[..., 2] -= sp
    # quầng sáng bán trong suốt pha magenta → tím: kéo về xanh lơ (r xuống), giữ vàng (b thấp) nguyên
    r, g, b = fg[..., 0], fg[..., 1], fg[..., 2]
    pur = (a < 0.9) & (r > g + 10) & (b > g + 10)
    fg[..., 0] = np.where(pur, np.minimum(r, g * 0.7), r)
    fg[..., 1] = np.where(pur, np.maximum(g, b * 0.85), g)
    a[a < 0.03] = 0
    return np.dstack([np.clip(fg, 0, 255), a * 255]).astype(np.uint8)

def cut(sheet, rows):
    im = np.array(Image.open(A + sheet).convert('RGB'))
    rgba = key(im)
    m = rgba[..., 3] > 60
    # dải hàng theo hình chiếu dọc
    pr = m.sum(1) > 2
    bands, y = [], 0
    while y < len(pr):
        if pr[y]:
            y0 = y
            while y < len(pr) and pr[y]: y += 1
            if y - y0 > 30: bands.append([y0, y])
        y += 1
    # gộp dải sát nhau (tia lửa rời phía trên khung)
    mg = []
    for b in bands:
        if mg and b[0] - mg[-1][1] < 25: mg[-1][1] = b[1]
        else: mg.append(b)
    bands = mg
    print(sheet, 'bands', bands)
    assert len(bands) == len(rows), (len(bands), len(rows))
    for (name, n, F), (y0, y1) in zip(rows, bands):
        sub = m[y0:y1]
        lab, k = nd.label(nd.binary_dilation(sub, iterations=3))
        objs = nd.find_objects(lab)
        sizes = nd.sum(sub, lab, range(1, k + 1))
        order = np.argsort(-sizes)
        big = sorted(order[:n], key=lambda i: objs[i][1].start)
        cen = []
        ext = []
        for i in big:
            sl = objs[i]
            cy = (sl[0].start + sl[0].stop) / 2; cx = (sl[1].start + sl[1].stop) / 2
            cen.append((cx, cy))
        # mọi điểm ảnh của hàng thuộc khung có tâm gần nhất theo x
        xs = np.array([c[0] for c in cen])
        half = 0
        own = np.zeros(lab.shape, np.int32) - 1
        for j in range(1, k + 1):
            sl = objs[j - 1]
            ox = (sl[1].start + sl[1].stop) / 2
            f = int(np.argmin(np.abs(xs - ox)))
            own[lab == j] = f
            cx, cy = cen[f]
            half = max(half, abs(sl[1].start - cx), abs(sl[1].stop - cx), abs(sl[0].start - cy), abs(sl[0].stop - cy))
        if name == 'cf_no':  # khung vỡ mảnh: tâm = trọng tâm điểm ảnh của khung (khối lớn nhất có thể là 1 mảnh lệch)
            yy, xx = np.nonzero(sub)
            for f in range(n):
                sel = own[yy, xx] == f
                cen[f] = (xx[sel].mean(), yy[sel].mean())
            half = 0
            for j in range(1, k + 1):
                sl = objs[j - 1]; f = int(np.argmin(np.abs(np.array([c[0] for c in cen]) - (sl[1].start + sl[1].stop) / 2)))
                cx, cy = cen[f]
                half = max(half, abs(sl[1].start - cx), abs(sl[1].stop - cx), abs(sl[0].start - cy), abs(sl[0].stop - cy))
        half = int(half + 4)
        strip = Image.new('RGBA', (F * n, F))
        for f, (cx, cy) in enumerate(cen):
            cell = rgba[y0:y1].copy()
            cell[..., 3] = np.where(own == f, cell[..., 3], 0)
            can = np.zeros((2 * half, 2 * half, 4), np.uint8)
            X0, Y0 = int(cx - half), int(cy - half)
            sx0, sy0 = max(0, X0), max(0, Y0)
            sx1, sy1 = min(cell.shape[1], X0 + 2 * half), min(cell.shape[0], Y0 + 2 * half)
            can[sy0 - Y0:sy1 - Y0, sx0 - X0:sx1 - X0] = cell[sy0:sy1, sx0:sx1]
            ci = Image.fromarray(can, 'RGBA').resize((F, F), Image.LANCZOS)
            strip.paste(ci, (f * F, 0))
        strip.save(OUT + name + '.png', optimize=True)
        print(name, n, 'frames', F, 'half', half)

for s, rows in SHEETS.items():
    try: open(A + s, 'rb').close()
    except OSError: print('skip', s); continue
    if len(sys.argv) > 1 and s not in sys.argv[1:]: continue
    cut(s, rows)
