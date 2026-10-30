# Lam Attack 1: energy crescent slash. Body = master/idle pixels moved as whole blocks (shift + row shear), never redrawn.
# Crescent and speed lines are a separate FX layer drawn pixel by pixel.
import math, numpy as np
from PIL import Image
CW,CH,OX=160,128,24          # attack canvas; character placed at x+24 (same baseline as idle)
idle=[np.array(Image.open(f'idle/{i}.png')) for i in range(4)]
H,W=idle[0].shape[:2]
NECK=77; HEM=103; LEG=113; LEGSPLIT=47
FL=[(7,47,111),(4,84,191),(3,114,226),(5,148,247),(6,180,251),(14,226,253),(87,224,249),(188,221,233)]
WHITE=(240,252,255)
def is_flame(p): return p[3] and p[0]<=8 and p[2]>=100
def body_frame(src,dx=0,shear=0,dy=0,lf=0,lb=0,hem=0,glow=0):
    out=np.zeros((CH,CW,4),np.uint8)
    def put(x,y,p):
        if 0<=x<CW and 0<=y<CH: out[y,x]=p
    # legs first (behind cloak)
    for y in range(LEG,H):
        for x in range(W):
            p=src[y,x]
            if p[3]: put(x+OX+(lf if x>=LEGSPLIT else lb),y,p)
    for y in range(LEG):
        sh=round(shear*(LEG-y)/LEG)          # lean: upper rows move more
        yy=y+(dy if y<HEM else max(0,dy-1))
        for x in range(W):
            p=src[y,x].copy()
            if not p[3]: continue
            if glow and is_flame(p) and x>=55 and NECK<=y<LEG:   # front sleeve flame brightness
                c=tuple(int(v) for v in p[:3])
                if c in FL: p[:3]=FL[max(0,min(len(FL)-1,FL.index(c)+glow))]
            hx=hem if (y>=HEM-6 and (x<36)) else 0
            put(x+OX+dx+sh+hx,yy,p)
    return out
def fx_put(out,x,y,c):
    if 0<=x<CW and 0<=y<CH: out[y,x]=(*c,255)
def crescent(out,cx,cy,r_out,a0,a1,maxT):
    n=int(abs(a1-a0)*3)+1
    cols=[(4,84,191),(14,226,253),(87,224,249),WHITE]
    for i in range(n+1):
        t=i/n; a=math.radians(a0+(a1-a0)*t)
        th=max(1,maxT*math.sin(math.pi*t)**0.8)
        r=r_out
        while r>=r_out-th:
            depth=r_out-r; k=0 if depth<1 else (1 if depth<2 else (2 if depth<th*0.6 else 3))
            if r<=r_out-th+1 and th>3: k=1       # inner edge cyan
            fx_put(out,round(cx+math.cos(a)*r),round(cy+math.sin(a)*r),cols[k]); r-=0.4
def arcline(out,cx,cy,r,a0,a1,c):
    n=int(abs(a1-a0)*3)+1
    for i in range(n+1):
        a=math.radians(a0+(a1-a0)*i/n); fx_put(out,round(cx+math.cos(a)*r),round(cy+math.sin(a)*r),c)
def orb(out,x,y,R):
    for yy in range(-R,R+1):
        for xx in range(-R,R+1):
            d=math.hypot(xx,yy)
            if d<=R: fx_put(out,x+xx,y+yy,WHITE if d<R*0.5 else ((14,226,253) if d<R*0.8 else (5,148,247)))
HAND=(66+OX,94)     # front sleeve flame, canvas coords
frames=[]
# F1 ready, hand flame brighter
frames.append(body_frame(idle[0],glow=1))
# F2 crouch 2px, head back 2px, energy gathers at the hand
f=body_frame(idle[1],dx=-2,shear=-5,dy=4,glow=2); orb(f,HAND[0]-2,HAND[1]+2,2); frames.append(f)
# F3 slight rotation, cloak pulled back, short energy blade forms (pointing up-back)
f=body_frame(idle[2],dx=-1,shear=-3,dy=2,hem=-2,glow=2)
for i in range(9): fx_put(f,HAND[0]-1-i//2,HAND[1]-i,WHITE if i<6 else (14,226,253)); fx_put(f,HAND[0]-i//2,HAND[1]-i,(14,226,253))
orb(f,HAND[0]-1,HAND[1]+1,2); frames.append(f)
# F4 IMPACT: lunge +5, lean forward, huge crescent upper-left -> lower-right in front
f=body_frame(idle[3],dx=12,shear=7,dy=2,lf=12,lb=2,hem=-3,glow=1)
crescent(f,OX+62,80,42,-50,75,16); frames.append(f)
# F5 hold, crescent gone, two thin lines
f=body_frame(idle[0],dx=12,shear=5,dy=1,lf=12,lb=2,hem=-4,glow=1)
arcline(f,OX+62,80,42,-30,72,(87,224,249)); arcline(f,OX+62,80,36,0,62,(14,226,253)); frames.append(f)
# F6 recover, cloak still flying, one faint line
f=body_frame(idle[1],dx=7,shear=2,dy=0,lf=7,lb=1,hem=-3)
arcline(f,OX+62,80,42,30,70,(5,148,247)); frames.append(f)
# F7 near idle, hand flame dims
frames.append(body_frame(idle[2],dx=2,shear=0,dy=2,lf=2,hem=-1,glow=-1))
# F8 idle
frames.append(body_frame(idle[3]))
durs=[70,90,80,80,65,80,100,120]   # F4 45ms + 35ms hitstop
import os; os.makedirs('attack1',exist_ok=True)
ims=[Image.fromarray(x) for x in frames]
for i,im in enumerate(ims): im.save(f'attack1/{i}.png')
for sc in (1,2,3):
    g=[]
    for im in ims:
        bg=Image.new('RGBA',(CW,CH),(235,235,235,255)); bg.alpha_composite(im); g.append(bg.resize((CW*sc,CH*sc),Image.NEAREST).convert('P'))
    g[0].save(f'attack1/lam_attack1_{sc}x.gif',save_all=True,append_images=g[1:],duration=durs,loop=0)
s=Image.new('RGBA',(CW*8,CH),(235,235,235,255))
for i,im in enumerate(ims): s.alpha_composite(im,(CW*i,0))
s.resize((CW*8*2,CH*2),Image.NEAREST).save('attack1/strip_2x.png')
print('ok')
