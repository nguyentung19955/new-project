# Lam Idle: master pixels are never redrawn. Hood/mask/horns bob 1px; free flame pixels sway row by row (flicker).
import math, numpy as np
from PIL import Image
m=np.array(Image.open('lam_master_80x128.png'))
H,W=m.shape[:2]
r,g,b,a=[m[...,i].astype(int) for i in range(4)]
blue=(a>0)&(r<=8)&(b>=100)
pale=(a>0)&(r==188)
flame=blue.copy()
for y in range(H):
    for x in range(W):
        if pale[y,x]:
            nb=[(y+dy,x+dx) for dy in (-1,0,1) for dx in (-1,0,1) if (dy or dx) and 0<=y+dy<H and 0<=x+dx<W]
            if sum(blue[p] for p in nb)>=3: flame[y,x]=True
body=(a>0)&~flame
# interior flames (sitting on the cloak) stay static; free flames sway
def has_body(y,x0,x1):
    return body[y,max(0,x0):max(0,min(W,x1))].any()
free=np.zeros_like(flame)
for y in range(H):
    for x in range(W):
        if flame[y,x] and not (has_body(y,x-4,x) and has_body(y,x+1,x+5)): free[y,x]=True
# neck line: first row (from top) where the scarf starts = row with the widest dark body below the mask; use the mask bottom
ys,xs=np.where(pale&~flame); ys=ys[ys<H*0.6]; neck=ys.max()+2
print('neck',neck,'flame px',flame.sum(),'free',free.sum())
# distance of each free flame pixel from the nearest non-free pixel (its base)
from collections import deque
dist=np.full((H,W),99); q=deque()
for y in range(H):
    for x in range(W):
        if (a[y,x]>0) and not free[y,x]: dist[y,x]=0; q.append((y,x))
while q:
    y,x=q.popleft()
    for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
        ny,nx=y+dy,x+dx
        if 0<=ny<H and 0<=nx<W and free[ny,nx] and dist[ny,nx]>dist[y,x]+1: dist[ny,nx]=dist[y,x]+1; q.append((ny,nx))
wave=[0,1,0,-1]
hem=np.zeros_like(body)
hem[103:113,:36]=body[103:113,:36]; hem[103:113,55:]=body[103:113,55:]
frames=[]; bob=[0,1,1,0]; hemdy=[0,0,1,1]
for f in range(4):
    out=np.zeros_like(m)
    for y in range(H):
        for x in range(W):
            if body[y,x] or (flame[y,x] and not free[y,x]):
                ty=y+(bob[f] if y<neck else 0)
                if ty<H: out[ty,x]=m[y,x]
    for y in range(H):
        for x in range(W):
            if hem[y,x] and y+hemdy[f]<H: out[y+hemdy[f],x]=m[y,x]
    for y in range(H):
        for x in range(W):
            if free[y,x]:
                up=y<neck
                w=wave[f] if up else wave[(f-1)%4]
                d=dist[y,x]
                dx=w*(1 if d>=4 else 0)*(2 if (d>=10 and up) else 1)
                ty=y+(bob[f] if up else 0); tx=x+dx
                if 0<=tx<W and ty<H and out[ty,tx,3]==0: out[ty,tx]=m[y,x]
    frames.append(Image.fromarray(out))
import os; os.makedirs('idle',exist_ok=True)
for i,fr in enumerate(frames): fr.save(f'idle/{i}.png')
def gif(sc,name):
    g=[]
    for fr in frames:
        bg=Image.new('RGBA',(W,H),(235,235,235,255)); bg.alpha_composite(fr); g.append(bg.resize((W*sc,H*sc),Image.NEAREST).convert('P'))
    g[0].save(name,save_all=True,append_images=g[1:],duration=[160,140,160,140],loop=0)
gif(1,'idle/lam_idle_1x.gif'); gif(3,'idle/lam_idle_3x.gif')
s=Image.new('RGBA',(W*4,H),(235,235,235,255))
for i,fr in enumerate(frames): s.alpha_composite(fr,(W*i,0))
s.resize((W*4*3,H*3),Image.NEAREST).save('idle/strip_3x.png')
