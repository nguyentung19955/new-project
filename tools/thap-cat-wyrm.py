# Cắt ảnh ChatGPT rồng lửa Wyrm Engine + đầu rồng băng Leviathan (cỡ mới: trồi lên từ ô ụ ~1.7 ô)
# raw ở docs/demo-hop-tuong/thap-art/: raw_wyrm_rong.png (đầu rồng lửa), raw_fx_wyrm_lua.png (4×4 = 16 khung luồng lửa), raw_lev_rong.png
# khoá magenta + Lanczos nhân-trước-alpha (hàm của tools/thap-cat-leviathan.py)
import numpy as np, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
import importlib.util
def khoa(im, mem=False):
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    r,g,b = a[...,0],a[...,1],a[...,2]
    m = np.clip((np.minimum(r,b) - g) / 255.0, 0, 1)
    al = np.clip((0.78 - m) / (0.78 - 0.42), 0, 1) if not mem else np.clip((0.92 - m) / 0.92, 0, 1) ** 0.9
    M = np.array([255,0,255],np.float32)
    A = np.maximum(al,1e-3)[...,None]
    F = np.clip((a - (1-al)[...,None]*M)/A, 0, 255)
    F = np.where(al[...,None] > 0.999, a, F)
    return Image.fromarray(np.dstack([F, al*255]).astype(np.uint8), 'RGBA')
def thu(im, w, h=None):
    a = np.asarray(im).astype(np.float32)/255
    pm = np.dstack([a[...,:3]*a[...,3:4], a[...,3]])
    h = h or round(im.size[1]*w/im.size[0])
    ch = [Image.fromarray((pm[...,i]*255).astype(np.uint8)).resize((w,h), Image.LANCZOS) for i in range(4)]
    q = np.dstack([np.asarray(c).astype(np.float32)/255 for c in ch])
    A = q[...,3:4]; rgb = np.where(A>1e-4, q[...,:3]/np.maximum(A,1e-4), 0)
    return Image.fromarray((np.dstack([np.clip(rgb,0,1), A])*255).astype(np.uint8),'RGBA')
ROOT = os.path.join(os.path.dirname(__file__), '..')
src = os.path.join(ROOT, 'docs/demo-hop-tuong/thap-art/'); out = os.path.join(ROOT, 'thap/assets/')
for ten, ra in (('raw_wyrm_rong.png', 'wyrm_rong.png'), ('raw_lev_rong.png', 'lev_rong.png')):
    r = khoa(Image.open(src + ten)); r = r.crop(r.getbbox()); thu(r, 420).save(out + ra, optimize=True); print(ra, r.size)
# dải 16 khung lửa: ô 4×4 → cắt chung 1 dải băng (hộp bao hợp của mọi khung, giữ mép trái = gốc luồng) → 1 hàng ngang
s = khoa(Image.open(src + 'raw_fx_wyrm_lua.png'), True); W, H = s.size; cw, ch = W // 4, H // 4
fr = [s.crop((x*cw + 6, y*ch + 6, (x+1)*cw - 6, (y+1)*ch - 6)) for y in range(4) for x in range(4)]
# bỏ alpha rất mờ (khói nhạt trộn nền) khi tính hộp bao
bb = None
for f in fr:
    a = np.asarray(f)[..., 3] > 40; ys, xs = np.where(a)
    if not len(xs): continue
    b = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    bb = b if bb is None else (min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3]))
print('hop bao', bb)
fr = [f.crop(bb) for f in fr]
FW = min(300, fr[0].size[0]); fr = [thu(f, FW) for f in fr]; fh = fr[0].size[1]
st = Image.new('RGBA', (FW*16, fh), (0,0,0,0))
for i, f in enumerate(fr): st.paste(f, (i*FW, 0))
st.save(out + 'fx_wyrm_lua.png', optimize=True); print('fx_wyrm_lua', FW, fh, 'goc luong x≈', 0)
