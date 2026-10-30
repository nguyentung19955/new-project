# Attack 1 FX layer from ONE PixelLab-generated crescent (attack1_pl/fx_pl_2.png).
# Only flips, recolours to Lam's palette, and ERASES pixels to make the other FX frames. Nothing new is drawn.
import json,numpy as np
from PIL import Image
from collections import deque
D='attack1_pl'
RAMP=[(119,224,248),(16,226,253),(7,181,251),(5,149,247),(3,116,228),(4,89,197)]  # core -> edge
src=np.array(Image.open(f'{D}/fx_pl_2.png').convert('RGBA'))[:, ::-1]   # flip: ")" bulging right
op=src[...,3]>0
lum=(0.3*src[...,0]+0.59*src[...,1]+0.11*src[...,2]).astype(float)
v=lum[op]; qs=np.quantile(v,[1-0.12,1-0.30,1-0.50,1-0.70,1-0.86])  # brightest 12% -> core
cr=np.zeros_like(src)
for y,x in zip(*np.where(op)):
    L=lum[y,x]; i=sum(L<q for q in qs)
    cr[y,x]=(*RAMP[i],255)
H,W=op.shape
# distance from transparency (thickness map)
dist=np.full(op.shape,99); q=deque()
for y in range(H):
    for x in range(W):
        if op[y,x] and any(not(0<=y+dy<H and 0<=x+dx<W) or not op[y+dy,x+dx] for dy,dx in((1,0),(-1,0),(0,1),(0,-1))):
            dist[y,x]=0; q.append((y,x))
while q:
    y,x=q.popleft()
    for dy,dx in((1,0),(-1,0),(0,1),(0,-1)):
        ny,nx=y+dy,x+dx
        if 0<=ny<H and 0<=nx<W and op[ny,nx] and dist[ny,nx]>dist[y,x]+1: dist[ny,nx]=dist[y,x]+1; q.append((ny,nx))
ys,xs=np.where(op); x0=xs.min(); y0,y1=ys.min(),ys.max(); yc=(y0+y1)/2
# inner (concave) edge point at mid height = leftmost opaque pixel on the middle row band
mid=[x for y,x in zip(ys,xs) if abs(y-yc)<=2]; ax,ay=min(mid),int(yc)
def keep(mask):
    o=cr.copy(); o[~mask]=0; return o
f1=keep(op & (np.arange(H)[:,None]>=y1-12))   # short blade = the crescent's own lower tip (12 px)
f2=cr.copy()                                                                                  # peak
# FX3: two thin curved streaks = outer rim + inner rim, core removed, tips shortened
rim=op & (dist<=1)
f3=keep(rim & (np.abs(np.arange(H)[:,None]-yc)<=(y1-y0)/2-3))
for y,x in zip(*np.where(f3[...,3]>0)):
    if tuple(f3[y,x,:3])==RAMP[0]: f3[y,x]=(*RAMP[1],255)
# FX4: one broken streak (outer rim only), no bright core, gaps every 4 rows
outer=rim.copy()
for y in range(H):
    xs_r=np.where(rim[y])[0]
    if len(xs_r): outer[y,:]=False; outer[y,xs_r.max()]=True; outer[y,max(xs_r.max()-1,0)]=rim[y,max(xs_r.max()-1,0)]
f4=keep(outer & ((np.arange(H)[:,None]//4)%2==0) & (np.abs(np.arange(H)[:,None]-yc)<=(y1-y0)/2-6))
for y,x in zip(*np.where(f4[...,3]>0)): f4[y,x]=(*RAMP[3],255) if (y//4)%4==0 else (*RAMP[4],255)
# FX5: 3 tiny bits left on the cut line
f5=np.zeros_like(cr)
for yy in (int(yc)-12,int(yc),int(yc)+12):
    xr=np.where(rim[yy])[0]
    if len(xr):
        x=xr.max()
        for dy in (0,1):
            if op[yy+dy,x]: f5[yy+dy,x]=(*RAMP[4],255)
        if op[yy,x-1]: f5[yy,x-1]=(*RAMP[4],255)
frames={'FX1':f1,'FX2':f2,'FX3':f3,'FX4':f4,'FX5':f5}
for n,a in frames.items(): Image.fromarray(a).save(f'{D}/fx/{n}.png')
json.dump({'anchor_in_fx':[int(ax),int(ay)],'note':'place fx so anchor_in_fx sits 2px right of the wrist'},open(f'{D}/fx/anchor.json','w'))
print('anchor',ax,ay,'bbox',xs.min(),xs.max(),y0,y1)
