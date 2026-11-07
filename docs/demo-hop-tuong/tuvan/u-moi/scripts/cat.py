# Cắt lưới 2x2 nền magenta: loang từ viền ô (không key toàn cục), bỏ đảo nhỏ, khử viền hồng
import sys, os, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

def cut_cells(path):
    im = Image.open(path).convert('RGB'); a = np.asarray(im).astype(np.int32)
    H, W = a.shape[:2]; h2, w2 = H // 2, W // 2
    return [a[r*h2:(r+1)*h2, c*w2:(c+1)*w2] for r in (0, 1) for c in (0, 1)]

def key_cell(c, thr=110):
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    # khoảng cách tới magenta + nền phải "hồng": r,b cao, g thấp
    d = np.sqrt((r - 255) ** 2 + g.astype(np.int32) ** 2 + (b - 255) ** 2)
    cand = (d < thr) | ((r > 150) & (b > 150) & (g < 90) & (np.abs(r - b) < 70))
    lab, n = ndi.label(cand)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    fg = ~bg
    # bỏ đảo nhỏ không nối vào khối chính
    lab2, n2 = ndi.label(fg)
    stray = 0
    if n2 > 1:
        sizes = ndi.sum(fg, lab2, range(1, n2 + 1))
        big = sizes.max(); area = fg.size
        keep = np.zeros(n2 + 1, bool)
        for k, s in enumerate(sizes, 1):
            keep[k] = s >= max(0.005 * area, 0.02 * big)
        stray = int((~keep[1:]).sum())
        fg = keep[lab2]
    # lỗ magenta kẹt bên trong (bao kín) cũng là nền nếu rất hồng
    inner = cand & fg & (d < 60)
    fg &= ~inner
    alpha = (fg * 255).astype(np.uint8)
    rgb = c.copy()
    # khử viền: điểm biên có ánh hồng → giảm hồng / trong suốt bớt
    er = ndi.binary_erosion(fg, iterations=1)
    edgepx = fg & ~er
    pink = edgepx & (rgb[..., 0] > rgb[..., 1] + 40) & (rgb[..., 2] > rgb[..., 1] + 40)
    alpha[pink] = 0
    edge2 = fg & ~ndi.binary_erosion(fg, iterations=2) & ~pink
    m = np.minimum(rgb[..., 0], rgb[..., 2])
    sp = edge2 & (m > rgb[..., 1] + 30)
    for ch in (0, 2):
        x = rgb[..., ch]; x[sp] = np.maximum(rgb[..., 1][sp] + 30, x[sp] - (m[sp] - rgb[..., 1][sp] - 30))
    out = np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), alpha])
    img = Image.fromarray(out, 'RGBA')
    touch = bool(fg[0].any() or fg[-1].any() or fg[:, 0].any() or fg[:, -1].any())
    return img, {'stray': stray, 'touch': touch, 'cover': float(fg.mean())}

def cut_sheet(path, outdir, uid):
    os.makedirs(outdir, exist_ok=True)
    info = {}
    for k, c in enumerate(cut_cells(path)):
        img, st = key_cell(c)
        img.save(os.path.join(outdir, f'{uid}_o{k+1}.png'))
        info[f'o{k+1}'] = st
    return info

if __name__ == '__main__':
    src, outdir = sys.argv[1], sys.argv[2]
    res = {}
    for f in sorted(os.listdir(src)):
        if f.startswith('raw_mod_') and f.endswith('.png'):
            uid = f[8:-4]
            res[uid] = cut_sheet(os.path.join(src, f), outdir, uid)
    json.dump(res, open(os.path.join(outdir, 'cat.json'), 'w'), indent=0)
    for u, v in res.items():
        bad = [k for k, s in v.items() if s['touch'] or s['stray']]
        if bad: print(u, {k: v[k] for k in bad})
    print(len(res))
