# Ghép sprite sheet bộ v4 (SENTINEL/PULSE/ANCHOR) từ ảnh PixelLab: chỉ cắt/căn/ghép, không sửa pixel.
# Chạy: python3 docs/demo-hop-tuong/ghep_sheet_v4.py (ra demo/assets/v4/ + meta.json độ dịch/neo).
import numpy as np, json, sys
from PIL import Image
SRC='/home/claude/new-project/docs/demo-hop-tuong/nguon-tuong/moi/'
OUT='/home/claude/new-project/demo/assets/v4/'
import os; os.makedirs(OUT, exist_ok=True)
DIRS=['s','se','e','ne','n','nw','w','sw']
HERO={'sentinel':('sen_ngam_{d}.png','sen_giat_{d}_{f}.png'),
      'pulse':('pul_dung_{d}.png','pul_tc_{d}_{f}.png'),
      'anchor':('anc_ngam_{d}.png','anc_tc_{d}_{f}.png')}
CELL=192; P=32
def arr(p): return np.asarray(Image.open(p).convert('RGBA')).astype(np.float32)
def score(idle, atk, sx, sy):
    # idle (x,y) <-> atk (x+sx, y+sy); compare over idle canvas
    H,W=idle.shape[:2]; h,w=atk.shape[:2]
    pad=np.zeros((H,W,4),np.float32)
    x0=max(0,-sx); y0=max(0,-sy); x1=min(W,w-sx); y1=min(H,h-sy)
    if x1<=x0 or y1<=y0: return 1e18
    pad[y0:y1,x0:x1]=atk[y0+sy:y1+sy, x0+sx:x1+sx]
    ai=idle[...,3]>40; aa=pad[...,3]>40
    xor=np.logical_xor(ai,aa).sum()
    both=ai&aa
    col=np.abs(idle[...,:3][both]-pad[...,:3][both]).sum(axis=1)
    return xor*120.0 + col.sum()/3.0
meta={}
for hid,(fi,fa) in HERO.items():
    idleS=Image.new('RGBA',(CELL*8,CELL)); atkS=Image.new('RGBA',(CELL*4,CELL*8))
    m={'o':CELL,'dich':{},'neo':{}}
    for r,d in enumerate(DIRS):
        idle=arr(SRC+fi.format(d=d)); a0=arr(SRC+fa.format(d=d,f=0))
        nom=(a0.shape[1]-idle.shape[1])//2
        best=None
        for sy in range(nom-24,nom+25):
            for sx in range(nom-24,nom+25):
                s=score(idle,a0,sx,sy)
                if best is None or s<best[0]: best=(s,sx,sy)
        _,sx,sy=best
        m['dich'][d]=[sx-nom,sy-nom]
        idleS.paste(Image.open(SRC+fi.format(d=d)).convert('RGBA'),(r*CELL+P,P))
        for f in range(4):
            im=Image.open(SRC+fa.format(d=d,f=f)).convert('RGBA')
            # atk pixel (X,Y) at idle (X-sx,Y-sy) -> cell (P+X-sx, P+Y-sy)
            ox,oy=P-sx,P-sy
            cell=Image.new('RGBA',(CELL,CELL)); cell.alpha_composite(im,(max(0,ox),max(0,oy)),(max(0,-ox),max(0,-oy)))
            lost=np.asarray(im)[...,3].sum()-np.asarray(cell)[...,3].sum()
            if lost>0: print('CLIP',hid,d,f,lost)
            atkS.paste(cell,(f*CELL,r*CELL))
        # neo chan: tu anh dung (day + tam 3 hang day)
        al=idle[...,3]>8; ys=np.where(al.any(1))[0]; y1=ys[-1]
        xs=np.where(al[max(0,y1-2):y1+1].any(0))[0]
        m['neo'][d]=[float(P+(xs[0]+xs[-1]+1)/2), int(P+y1+1)]
        top=ys[0]; m.setdefault('cao',{})[d]=int(y1+1-top)
        pass
    idleS.save(OUT+f'{hid}_dung.png',optimize=True); atkS.save(OUT+f'{hid}_tc.png',optimize=True)
    meta[hid]=m
json.dump(meta,open('meta.json','w'),indent=1)
