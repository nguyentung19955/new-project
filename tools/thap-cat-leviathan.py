import numpy as np, sys
from PIL import Image
def khoa(im, mem=False):
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    r,g,b = a[...,0],a[...,1],a[...,2]
    # độ "magenta": min(r,b) - g lớn → nền
    m = np.clip((np.minimum(r,b) - g) / 255.0, 0, 1)
    al = np.clip((0.78 - m) / (0.78 - 0.42), 0, 1) if not mem else np.clip((0.92 - m) / 0.92, 0, 1) ** 0.9  # mem: sương mờ trộn nền → alpha tuyến tính + tách màu
    M = np.array([255,0,255],np.float32)
    A = np.maximum(al,1e-3)[...,None]
    F = np.clip((a - (1-al)[...,None]*M)/A, 0, 255)
    F = np.where(al[...,None] > 0.999, a, F)
    out = np.dstack([F, al*255]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')
def thu(im, w):
    # Lanczos nhân-trước-alpha
    a = np.asarray(im).astype(np.float32)/255
    pm = np.dstack([a[...,:3]*a[...,3:4], a[...,3]])
    h = round(im.size[1]*w/im.size[0])
    ch = [Image.fromarray((pm[...,i]*255).astype(np.uint8)).resize((w,h), Image.LANCZOS) for i in range(4)]
    q = np.dstack([np.asarray(c).astype(np.float32)/255 for c in ch])
    A = q[...,3:4]; rgb = np.where(A>1e-4, q[...,:3]/np.maximum(A,1e-4), 0)
    return Image.fromarray((np.dstack([np.clip(rgb,0,1), A])*255).astype(np.uint8),'RGBA')
src='/tmp/claude-0/art/'; out='/home/claude/new-project/thap/assets/'
# đầu rồng
r = khoa(Image.open(src+'raw_lev_rong.png')); r = r.crop(r.getbbox()); thu(r, 340).save(out+'lev_rong.png', optimize=True); print('rong', r.size)
# icon xoáy
c = khoa(Image.open(src+'raw_lev_abyss.png')); c = c.crop(c.getbbox()); thu(c, 56).save(out+'lev_abyss.png', optimize=True); print('abyss', c.size)
# dải 16 khung: ô 543×181 → khung cùng cỡ, ghép dải ngang
s = khoa(Image.open(src+'raw_fx_lev_bang.png'), True); W,H = s.size; cw,ch = W//4, H//4
fr = [s.crop((x*cw, y*ch, (x+1)*cw, (y+1)*ch)) for y in range(4) for x in range(4)]
FW = 230; fr = [thu(f, FW) for f in fr]; fh = fr[0].size[1]
st = Image.new('RGBA', (FW*16, fh), (0,0,0,0))
for i,f in enumerate(fr): st.paste(f, (i*FW, 0))
st.save(out+'fx_lev_bang.png', optimize=True); print('bang', FW, fh)
