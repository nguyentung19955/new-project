# Cắt sprite sheet ChatGPT (N khung 1 hàng) → dải N khung vuông F×F, chân ở 0.89F, nhân vật cao KH*F (cùng tỉ lệ cho mọi sheet của 1 tướng)
import sys, numpy as np
from PIL import Image
from scipy import ndimage
F, KH, FOOT = 256, 0.586, 0.89
def frames(path, n):
    im = Image.open(path).convert('RGBA'); a = np.array(im)
    al = a[..., 3] > 24
    lab, k = ndimage.label(ndimage.binary_dilation(al, iterations=4))
    objs = ndimage.find_objects(lab)
    comps = sorted([(o[1].start, o[1].stop, o[0].start, o[0].stop, (lab[o] > 0).sum(), i + 1) for i, o in enumerate(objs)], key=lambda c: -c[4])
    big = [c for c in comps if c[4] > comps[0][4] * 0.25][:n]
    big.sort(key=lambda c: c[0])
    out = []
    for c in big:   # gom các mảnh nhỏ thuộc vùng ngang của khung
        x0, x1 = c[0], c[1]
        mask = np.zeros_like(al)
        for d in comps:
            cx = (d[0] + d[1]) / 2
            if x0 - 10 <= cx <= x1 + 10: mask |= (lab == d[5])
        sub = a.copy(); sub[~(mask & al) ] = 0
        ys, xs = np.nonzero(sub[..., 3] > 24)
        out.append(Image.fromarray(sub[ys.min():ys.max() + 1, xs.min():xs.max() + 1]))
    return out
def chan_x(fr):   # tâm ngang của 12% dưới cùng (bàn chân)
    a = np.array(fr)[..., 3] > 24; h = a.shape[0]; ys, xs = np.nonzero(a[int(h * 0.88):]); return xs.mean() if len(xs) else fr.width / 2
def ghep(frs, scale, out):
    sh = Image.new('RGBA', (F * len(frs), F), (0, 0, 0, 0))
    for i, fr in enumerate(frs):
        fr2 = fr.resize((max(1, round(fr.width * scale)), max(1, round(fr.height * scale))), Image.LANCZOS)
        x = int(round(F / 2 - chan_x(fr) * scale)); y = int(round(F * FOOT - fr2.height))
        cl, ct = max(0, -x), max(0, -y)
        fr3 = fr2.crop((cl, ct, min(fr2.width, F - x), min(fr2.height, F - y)))
        tile = Image.new('RGBA', (F, F), (0, 0, 0, 0)); tile.alpha_composite(fr3, (max(0, x), max(0, y)))
        sh.alpha_composite(tile, (i * F, 0))
    sh.save(out, optimize=True)
if __name__ == '__main__':
    # usage: sheet.py id idle_raw attack_raw outdir
    hid, idle, atk, od = sys.argv[1:5]
    fi = frames(idle, 4); fa = frames(atk, 4) if atk != '-' else []
    hc = np.median([f.height for f in fi]); s = KH * F / hc
    ghep(fi, s, f'{od}/{hid}_idle.png')
    if fa:
        # cùng tỉ lệ nhân vật: so chiều cao khung đầu attack với idle (cho phép tư thế thấp hơn: dùng max chiều cao)
        sa = s   # ChatGPT vẽ cùng tỉ lệ (bề ngang khớp), tư thế đánh thấp hơn là chủ ý
        ghep(fa, sa, f'{od}/{hid}_attack.png')
    print(hid, [f.size for f in fi], [f.size for f in fa], round(s, 3))
