# Row 2 (Song Nguyet Tram) FX from ONE PixelLab flat crescent (row2_pl/fx_flat_pl.png).
# Only recolour to Lam's ramp, flip, and ERASE pixels. Nothing new is drawn.
import json,numpy as np
from PIL import Image, ImageDraw
from collections import deque
D='row2_pl'
RAMP=[(119,224,248),(16,226,253),(7,181,251),(5,149,247),(3,116,228),(4,89,197)]
src=np.array(Image.open(f'{D}/fx_flat_pl.png').convert('RGBA'))
op=src[...,3]>0
lum=(0.3*src[...,0]+0.59*src[...,1]+0.11*src[...,2]).astype(float)
qs=np.quantile(lum[op],[1-0.12,1-0.30,1-0.50,1-0.70,1-0.86])
cr=np.zeros_like(src)
for y,x in zip(*np.where(op)): cr[y,x]=(*RAMP[sum(lum[y,x]<q for q in qs)],255)
ys,xs=np.where(op); cr=cr[ys.min():ys.max()+1, xs.min():xs.max()+1]; op=cr[...,3]>0; H,W=op.shape
def dist_map(op):
    H,W=op.shape; d=np.full(op.shape,99); q=deque()
    for y in range(H):
        for x in range(W):
            if op[y,x] and any(not(0<=y+a<H and 0<=x+b<W) or not op[y+a,x+b] for a,b in((1,0),(-1,0),(0,1),(0,-1))): d[y,x]=0; q.append((y,x))
    while q:
        y,x=q.popleft()
        for a,b in((1,0),(-1,0),(0,1),(0,-1)):
            ny,nx=y+a,x+b
            if 0<=ny<H and 0<=nx<W and op[ny,nx] and d[ny,nx]>d[y,x]+1: d[ny,nx]=d[y,x]+1; q.append((ny,nx))
    return d
def keep(a,m): o=a.copy(); o[~m]=0; return o
dist=dist_map(op)
low=cr                                   # smile arc, full
streak=keep(cr, op&(dist<=0))            # 1-px rim = two thin streaks
for y,x in zip(*np.where(streak[...,3]>0)):
    if tuple(streak[y,x,:3]) in (RAMP[0],RAMP[1]): streak[y,x]=(*RAMP[2],255)
high=cr[::-1]                            # frown arc
high_streak=streak[::-1]
push=keep(streak, (streak[...,3]>0) & (np.arange(W)[None,:]>=W-18))   # right tip of the rim, 18 px
ys,xs=np.where(push[...,3]>0); push=push[ys.min():ys.max()+1, xs.min():xs.max()+1]
out={'low':low,'low_streak':streak,'high':high,'high_streak':high_streak,'push':push}
import os; os.makedirs(f'{D}/fx',exist_ok=True)
for n,a in out.items(): Image.fromarray(a).save(f'{D}/fx/{n}.png')
print('flat crescent',W,'x',H)
# placement on a 176x128 canvas (body at x=0). (frame index -> fx, top-left offset)
place={2:('low',(100-W,88)), 3:('low_streak',(106-W,90)), 5:('high',(94,52)), 6:('high_streak',(100,58)), 7:('push',(80,94))}
ms=[60,65,55,60,75,45,65,80]
BG=(234,235,235,255); frames=[]
for k in range(8):
    c=Image.new('RGBA',(176,128),(0,0,0,0)); c.alpha_composite(Image.open(f'{D}/body/{k}.png').convert('RGBA'),(0,0))
    if k in place:
        n,o=place[k]; c.alpha_composite(Image.open(f'{D}/fx/{n}.png'),o)
    frames.append(c)
os.makedirs(f'{D}/preview',exist_ok=True)
for k,c in enumerate(frames): c.save(f'{D}/preview/{k}.png')
json.dump({str(k+1):{'fx':v[0],'offset':list(v[1])} for k,v in place.items()},open(f'{D}/preview/fx_offsets.json','w'))
ims=[]
for c in frames:
    b=Image.new('RGBA',c.size,BG); b.alpha_composite(c); ims.append(b.convert('RGB').resize((528,384),Image.NEAREST))
ims[0].save(f'{D}/lam_row2_3x.gif',save_all=True,append_images=ims[1:],duration=ms,loop=0)
st=Image.new('RGBA',(4*352,2*256+20),BG); d=ImageDraw.Draw(st)
for k,c in enumerate(frames):
    st.alpha_composite(c.resize((352,256),Image.NEAREST),((k%4)*352,(k//4)*266)); d.text(((k%4)*352+6,(k//4)*266+4),f'F{k+1}',fill=(0,0,0,255))
st.save(f'{D}/preview_grid_2x.png')
