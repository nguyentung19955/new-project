# Bộ chém tay xa (SE): ghép từ PixelLab V3 Slash2 (s2) + Slash1 F3 (s1) + sửa pixel theo ChatGPT
import sys,os,math; sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from lam_pixel_lib import *
from PIL import Image
D=os.path.dirname(os.path.abspath(__file__))+'/'
K3=os.path.dirname(D.rstrip('/'))+'/kiem3/'
def is_cyan(p): return p[3] and p[2]>150 and p[1]>150 and p[0]<200 and p[1]-p[0]>40
def erase_sword(f,box,r=3):
    x0,y0,x1,y1=box; W,H=f.size
    C=set((x,y) for y in range(y0,y1) for x in range(x0,x1) if is_cyan(f.getpixel((x,y))))
    A=set((x,y) for y in range(y0,y1) for x in range(x0,x1) if f.getpixel((x,y))[3] and any((x+dx,y+dy) in C for dx in range(-r,r+1) for dy in range(-r,r+1)))
    for q in C|A: f.putpixel(q,(0,0,0,0))
def clean2(f):
    W,H=f.size; seen=set()
    for y in range(H):
        for x in range(W):
            if (x,y) in seen or not f.getpixel((x,y))[3]: continue
            st=[(x,y)]; comp=[]; seen.add((x,y))
            while st:
                a,b=st.pop(); comp.append((a,b))
                for dx in(-1,0,1):
                    for dy in(-1,0,1):
                        q=(a+dx,b+dy)
                        if 0<=q[0]<W and 0<=q[1]<H and q not in seen and f.getpixel(q)[3]: seen.add(q); st.append(q)
            if len(comp)<6:
                for q in comp: f.putpixel(q,(0,0,0,0))
def squash(f,n=2,ground=74):
    """nén thân n px: phần trên mặt đất dịch xuống n px, chân giữ nguyên"""
    src=f.copy(); g=Image.new('RGBA',src.size)
    for y in range(104):
        for x in range(104):
            p=src.getpixel((x,y)) if y>ground else (src.getpixel((x,y-n)) if y>=n else (0,0,0,0))
            if p[3]: g.putpixel((x,y),p)
    return g
def lift(f,n):
    g=Image.new('RGBA',f.size); g.alpha_composite(f.crop((0,n,104,104)),(0,0)); return g
def bell(f,lvl,box=(44,48,60,66)):
    x0,y0,x1,y1=box
    for y in range(y0,y1):
        for x in range(x0,x1):
            p=f.getpixel((x,y))
            if p[3] and p[0]>150 and 80<p[1]<230 and p[2]<140:
                r,g,b=p[:3]
                for _ in range(lvl): r,g,b=min(255,r+25),min(255,g+35),min(255,b+40)
                f.putpixel((x,y),(r,g,b,255))
def behind(body,hx,hy,ang,bl):
    """vẽ kiếm ở lớp SAU thân (tay xa bị hood/thân che)"""
    l=sword_layer(hx,hy,ang); l.alpha_composite(body); return l
_SW=Image.open(K3+'goc/s2-f3.png').convert('RGBA').crop((60,53,90,69))   # kiếm PixelLab thật (chuôi ở (2,7) trong crop)
SW_PIV=(2,7); SW_ANG=7
def sword_layer(hx,hy,ang):
    big=Image.new('RGBA',(104,104)); big.alpha_composite(_SW,(52-SW_PIV[0],52-SW_PIV[1]))
    r=big.rotate(ang-SW_ANG,resample=Image.NEAREST,center=(52,52))
    l=Image.new('RGBA',(104,104)); l.alpha_composite(r,(0,0)) ; out=Image.new('RGBA',(104,104)); out.paste(r,(hx-52,hy-52),r); return out
def wpn(f,hx,hy,ang,bl=22): f.alpha_composite(sword_layer(hx,hy,ang)); glove(f,hx-2,hy-1)
DUST=[(0,0,(200,215,220)),(1,-1,(160,200,205)),(-1,-1,(200,215,220)),(2,0,(120,230,230)),(-2,0,(160,200,205)),(0,-2,(160,200,205))]
