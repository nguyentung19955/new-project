# Bộ chém tay xa (SE): ghép từ PixelLab V3 Slash2 (s2) + Slash1 F3 (s1) + sửa pixel theo ChatGPT
import sys,os,math; sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from lam_pixel_lib import *
from PIL import Image
D=os.path.dirname(os.path.abspath(__file__))+'/'
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
_SW=Image.open(D+'goc/s2-f3.png').convert('RGBA').crop((60,53,90,69))   # kiếm PixelLab thật (chuôi ở (2,7) trong crop)
SW_PIV=(2,7); SW_ANG=7
def sword_layer(hx,hy,ang):
    big=Image.new('RGBA',(104,104)); big.alpha_composite(_SW,(52-SW_PIV[0],52-SW_PIV[1]))
    r=big.rotate(ang-SW_ANG,resample=Image.NEAREST,center=(52,52))
    l=Image.new('RGBA',(104,104)); l.alpha_composite(r,(0,0)) ; out=Image.new('RGBA',(104,104)); out.paste(r,(hx-52,hy-52),r); return out
def wpn(f,hx,hy,ang,bl=22): f.alpha_composite(sword_layer(hx,hy,ang)); glove(f,hx-2,hy-1)
DUST=[(0,0,(200,215,220)),(1,-1,(160,200,205)),(-1,-1,(200,215,220)),(2,0,(120,230,230)),(-2,0,(160,200,205)),(0,-2,(160,200,205))]
s2={k:Image.open(D+f'goc/s2-f{k}.png').convert('RGBA') for k in range(9)}
s1={k:Image.open(D+f'goc/s1-f{k}.png').convert('RGBA') for k in range(9)}
clips={}
# ---- Chém 1: chéo xuống-phải (wind-up cao bên vai xa -> chém xuống) ----
o=[s2[7].copy(), s2[4].copy()]
f=s2[3].copy(); erase_sword(f,(60,50,100,68)); smear2(f,57,57,26,65,-45,thmax=4,shear=(3,-2)); wpn(f,63,61,-45,22); o.append(f)
o+=[s2[1].copy(), s2[0].copy()]
clips['chem1']=(o,[70,70,110,100,140],2)
# ---- Chém 2: hất lên (crouch -> bật lên, kiếm quét thấp-phải lên cao-phải) ----
o=[s2[1].copy(), squash(s2[2].copy(),2)]
f=lift(s2[3].copy(),2); erase_sword(f,(60,48,100,66)); smear2(f,56,58,27,-55,64,thmax=4,shear=(-2,-1)); wpn(f,63,56,50,22); o.append(f)
o+=[s2[7].copy(), s2[8].copy()]
clips['chem2']=(o,[70,70,110,110,140],2)
# ---- Chém 3: nhảy bổ (nạp chuông, kiếm sau vai xa, nhảy, bổ xuống) ----
o=[s2[0].copy()]
f=behind(s1[3].copy(),58,54,98,24); bell(f,2); o.append(f)
f=squash(behind(s1[3].copy(),58,56,100,24),3); bell(f,2); o.append(f)
f=lift(behind(s1[3].copy(),57,50,80,26),5); bell(f,2); o.append(f)
f=s2[1].copy(); erase_sword(f,(60,62,100,86)); f=squash(f,3)
for cx,cy in [(40,81),(78,81),(84,80)]:
    for dx,dy,c in DUST: put(f,cx+dx,cy+dy,c+(255,))
smear2(f,58,58,31,100,-38,thmax=6,shear=(3,-3)); wpn(f,64,68,-38,24); o.append(f)
o.append(s2[0].copy())
clips['chem3']=(o,[80,90,70,90,150,220],4)
for name,(o,dur,imp) in clips.items():
    for f in o: clean2(f)
    od=D+name+'/'; os.makedirs(od,exist_ok=True)
    sh=Image.new('RGBA',(104*len(o),104))
    for i,f in enumerate(o): f.save(od+f'{name}-{i}.png'); sh.paste(f,(i*104,0))
    sh.save(od+f'{name}-sheet.png')
    pv=Image.new('RGBA',sh.size,(58,63,68,255)); pv.alpha_composite(sh); pv.resize((sh.width*3,312),Image.NEAREST).save(od+f'{name}-xem.png')
    g=[]
    for f in o:
        b=Image.new('RGBA',(104,104),(58,63,68,255)); b.alpha_composite(f); g.append(b.resize((312,312),Image.NEAREST).convert('P',palette=Image.ADAPTIVE))
    g[0].save(od+f'{name}.gif',save_all=True,append_images=g[1:],duration=dur,loop=0)
# tổng hợp 3 đòn
rows=[Image.open(D+f'{n}/{n}-xem.png') for n in clips]
W=max(r.width for r in rows); t=Image.new('RGBA',(W,312*3),(58,63,68,255))
for i,r in enumerate(rows): t.paste(r,(0,i*312))
t.save(D+'ba-don-xem.png')
