# Ghép sprite sheet bộ v9 (SCORCH / FROST / ARC) từ ảnh PixelLab: chỉ cắt/căn/ghép, KHÔNG sửa pixel nhân vật, KHÔNG lật gương.
# Chạy: python3 docs/demo-hop-tuong/ghep_sheet_v9.py  → demo/assets/v9/<id>_dung.png (8 hàng × 4 khung), <id>_tc.png (8 hàng × 12 khung),
#        fx_<id>_phat|bay|trung.png (1 hàng 6 khung, đã thu nhỏ) + meta.json (độ dịch từng hướng).
# Căn chân: mỗi hướng đo điểm chân (đáy alpha + tâm ngang 4 hàng đáy) ở khung 0 ảnh ĐỨNG → cùng một độ dịch cho 4 khung đứng hướng đó.
# Khung tấn công: tìm độ dịch (±40px) để khung 0 tấn công khớp alpha nhất với khung 0 đứng cùng hướng → áp chung 12 khung.
# Mọi hướng có chân ở NEO = (96, 160) trong ô 192.
import numpy as np, json, os
from PIL import Image
GOC = '/home/claude/new-project/'
SRC = GOC + 'docs/demo-hop-tuong/nguon-tuong/v9/'
OUT = GOC + 'demo/assets/v9/'
os.makedirs(OUT, exist_ok=True)
DIRS = [('s', 'south'), ('se', 'south-east'), ('e', 'east'), ('ne', 'north-east'), ('n', 'north'), ('nw', 'north-west'), ('w', 'west'), ('sw', 'south-west')]
HERO = {'scorch': 'dam12', 'frost': 'phep12', 'arc': 'dam12'}
CELL = 192; NEO = (96, 160); TIM = 40

def anh(p): return Image.open(p).convert('RGBA')
def alpha(im): return np.asarray(im)[..., 3] > 8
def chan(a):   # (x tâm 4 hàng đáy, y đáy+1)
    ys = np.where(a.any(axis=1))[0]; y1 = ys[-1]
    xs = np.where(a[max(0, y1 - 3):y1 + 1].any(axis=0))[0]
    return (xs[0] + xs[-1] + 1) / 2.0, y1 + 1
def dat(a, dx, dy, H, W):   # a dịch (dx,dy) lên nền H×W
    out = np.zeros((H, W), bool); h, w = a.shape
    x0, y0 = max(0, dx), max(0, dy); x1, y1 = min(W, w + dx), min(H, h + dy)
    if x1 > x0 and y1 > y0: out[y0:y1, x0:x1] = a[y0 - dy:y1 - dy, x0 - dx:x1 - dx]
    return out

meta = {}
for hid, tc in HERO.items():
    dung = Image.new('RGBA', (CELL * 4, CELL * 8)); atk = Image.new('RGBA', (CELL * 12, CELL * 8))
    m = {}
    for r, (d, ten) in enumerate(DIRS):
        s0 = anh(f'{SRC}{hid}_dung_{ten}_0.png'); a_s = alpha(s0)
        cx, cy = chan(a_s); dx, dy = int(round(NEO[0] - cx)), int(round(NEO[1] - cy))
        for f in range(4): dung.paste(anh(f'{SRC}{hid}_dung_{ten}_{f}.png'), (f * CELL + dx, r * CELL + dy))
        ref = dat(a_s, dx, dy, CELL, CELL)
        a0 = alpha(anh(f'{SRC}{hid}_{tc}_{ten}_0.png'))
        best = None
        for sy in range(dy - TIM, dy + TIM + 1):
            for sx in range(dx - TIM, dx + TIM + 1):
                sc = np.logical_xor(ref, dat(a0, sx, sy, CELL, CELL)).sum()
                if best is None or sc < best[0]: best = (sc, sx, sy)
        sc, sx, sy = best
        for f in range(12):
            im = anh(f'{SRC}{hid}_{tc}_{ten}_{f}.png'); cell = Image.new('RGBA', (CELL, CELL)); cell.paste(im, (sx, sy))
            atk.paste(cell, (f * CELL, r * CELL))
        m[d] = {'dung': [dx, dy], 'tc': [int(sx), int(sy)], 'lech_alpha': int(sc), 'chan_goc': [float(cx), int(cy)]}
        print(hid, d, m[d])
    dung.save(OUT + hid + '_dung.png', optimize=True); atk.save(OUT + hid + '_tc.png', optimize=True)
    meta[hid] = m

# HIỆU ỨNG (ChatGPT, đã tách nền): cắt theo khung bao chung 6 khung (vuông, quanh tâm), thu nhỏ LANCZOS về ô 2× cỡ hiển thị
FX = {'phat': 48, 'bay': 56, 'trung': 72}   # hiển thị 24 / 28 / 36 px
for hid in HERO:
    for loai, o in FX.items():
        ims = [anh(f'{SRC}fx/{hid}_{loai}_{k}.png') for k in range(6)]
        W = max(i.width for i in ims); H = max(i.height for i in ims)
        bb = None
        for i in ims:
            b = i.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
            if b: bb = b if bb is None else (min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3]))
        mx, my = (bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2
        if loai == 'bay': mx = W / 2   # đạn: giữ tâm ngang ảnh (đầu đạn hướng phải) — chỉ cắt sát theo bề cao
        half = max(bb[2] - bb[0], bb[3] - bb[1]) / 2 + 2
        box = (int(mx - half), int(my - half), int(mx + half), int(my + half))
        sh = Image.new('RGBA', (o * 6, o))
        for k, i in enumerate(ims):
            nen = Image.new('RGBA', (W + 400, H + 400)); nen.paste(i, (200, 200))
            c = nen.crop((box[0] + 200, box[1] + 200, box[2] + 200, box[3] + 200)).resize((o, o), Image.LANCZOS)
            sh.paste(c, (k * o, 0))
        sh.save(OUT + f'fx_{hid}_{loai}.png', optimize=True)
        meta.setdefault('fx', {})[f'{hid}_{loai}'] = {'o': o, 'cat': box}
json.dump(meta, open(OUT + 'meta.json', 'w'), indent=1)
print('xong')
