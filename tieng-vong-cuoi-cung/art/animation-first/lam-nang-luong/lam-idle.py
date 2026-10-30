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
frames=[]; bob=[0,1,1,0]
for f in range(4):
    out=np.zeros_like(m)
    # body: upper part (y<neck) shifted down by bob
    for y in range(H):
        for x in range(W):
            if body[y,x] or (flame[y,x] and not free[y,x]):
                ty=y+(bob[f] if y<neck else 0)
                if ty<H: out[ty,x]=m[y,x]
    # free flames sway horizontally; rows above neck also bob
    for y in range(H):
        ph=2*math.pi*f/4+y*0.12
        dx=round(math.sin(ph)*1.2)
        for x in range(W):
            if free[y,x]:
                ty=y+(bob[f] if y<neck else 0); tx=x+dx
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
