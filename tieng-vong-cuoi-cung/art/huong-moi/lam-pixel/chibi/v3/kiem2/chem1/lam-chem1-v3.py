# Chém 1 (bản toàn thân): thân từ PixelLab V3 free-motion (state cầm kiếm), sửa góc kiếm tại impact theo ChatGPT
import sys,os,math; sys.path.insert(0,'/home/claude/new-project/tieng-vong-cuoi-cung/art/huong-moi/lam-pixel/chibi/v3')
from lam_pixel_lib import *
from PIL import Image
D=os.path.dirname(os.path.abspath(__file__))+'/'
def is_cyan(p): return p[3] and p[2]>150 and p[1]>150 and p[0]<200 and p[1]-p[0]>40
def is_amber(p): return p[3] and p[0]>170 and 90<p[1]<215 and p[2]<120
def is_silver(p): return p[3] and min(p[:3])>140 and max(p[:3])-min(p[:3])<40
def erase_sword(f,box):
    x0,y0,x1,y1=box; W,H=f.size
    C=set((x,y) for y in range(y0,y1) for x in range(x0,x1) if is_cyan(f.getpixel((x,y))))
    def near(S,x,y,r=1): return any((x+dx,y+dy) in S for dx in range(-r,r+1) for dy in range(-r,r+1))
    A=set((x,y) for y in range(y0,y1) for x in range(x0,x1) if f.getpixel((x,y))[3] and near(C,x,y,3))
    S=C|A
    for (x,y) in S: f.putpixel((x,y),(0,0,0,0))
    # viền tối còn lơ lửng quanh lưỡi cũ
    for _ in range(2):
        for y in range(y0,y1):
            for x in range(x0,x1):
                p=f.getpixel((x,y))
                if p[3] and max(p[:3])<60:
                    n=sum(1 for dx in(-1,0,1) for dy in(-1,0,1) if (dx or dy) and 0<=x+dx<W and 0<=y+dy<H and f.getpixel((x+dx,y+dy))[3])
                    if n<=2: f.putpixel((x,y),(0,0,0,0))
def wpn(f,hx,hy,ang,bl=24): glove(f,hx-1,hy-1); weapon(f,hx,hy,ang,blade=bl)
fr={i:Image.open(D+f'goc/f{i}.png').convert('RGBA') for i in range(1,10)}
out=[]
out.append(fr[1].copy())                                   # 1: chuẩn bị
out.append(fr[7].copy())                                   # 2: lấy đà, kiếm sau đầu
f=fr[7].copy(); erase_sword(f,(10,36,39,66)); wpn(f,40,60,100); out.append(f)       # 3: xoay vai, kiếm nghiêng +35° ra trước
f=fr[8].copy(); erase_sword(f,(69,55,100,72)); smear2(f,58,58,30,52,-40,thmax=8,shear=(5,-2)); wpn(f,64,64,-40,24); out.append(f)  # 4: IMPACT lunge, chém xuống-phải
f=fr[9].copy(); erase_sword(f,(71,52,100,75)); wpn(f,67,63,-60,20); out.append(f)   # 5: theo đà
def clean(f):
    W,H=f.size
    for y in range(H):
        for x in range(W):
            if f.getpixel((x,y))[3] and not any(0<=x+dx<W and 0<=y+dy<H and f.getpixel((x+dx,y+dy))[3] for dx in(-1,0,1) for dy in(-1,0,1) if dx or dy): f.putpixel((x,y),(0,0,0,0))
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
for f in out: clean(f); clean2(f)
os.makedirs(D+'out',exist_ok=True)
sh=Image.new('RGBA',(104*5,104))
for i,f in enumerate(out): f.save(D+f'out/chem1-{i}.png'); sh.paste(f,(i*104,0))
sh.save(D+'out/chem1-sheet.png')
pv=Image.new('RGBA',sh.size,(58,63,68,255)); pv.alpha_composite(sh); pv.resize((sh.width*3,312),Image.NEAREST).save(D+'out/chem1-xem.png')
g=[]
for f in out:
    b=Image.new('RGBA',(104,104),(58,63,68,255)); b.alpha_composite(f); g.append(b.resize((312,312),Image.NEAREST).convert('P',palette=Image.ADAPTIVE))
g[0].save(D+'out/chem1.gif',save_all=True,append_images=g[1:]+[g[0]],duration=[83,100,66,140,100,400],loop=0)
