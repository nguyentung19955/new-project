# Chém 3 (toàn thân, bổ qua đầu): thân PixelLab V3, impact sửa kiếm bổ xuống + vệt chém lớn
import sys,os,math; sys.path.insert(0,'/home/claude/new-project/tieng-vong-cuoi-cung/art/huong-moi/lam-pixel/chibi/v3')
from lam_pixel_lib import *
from PIL import Image
D=os.path.dirname(os.path.abspath(__file__))+'/'
def is_cyan(p): return p[3] and p[2]>150 and p[1]>150 and p[0]<200 and p[1]-p[0]>40
def erase_sword(f,box,r=3):
    x0,y0,x1,y1=box; W,H=f.size
    C=set((x,y) for y in range(y0,y1) for x in range(x0,x1) if is_cyan(f.getpixel((x,y))))
    orig=f.copy(); E=[]
    for y in range(y0,y1):
        for x in range(x0,x1):
            if f.getpixel((x,y))[3] and any((x+dx,y+dy) in C for dx in range(-r,r+1) for dy in range(-r,r+1)):
                f.putpixel((x,y),(0,0,0,0)); E.append((x,y))
    # vá lỗ trên thân (mũ) phía sau lưỡi cũ: lấy màu bên trái gần nhất, mép phải thành viền đen
    Es=set(E)
    for y in range(y0,y1):
        row=[x for x in range(x0,x1) if (x,y) in Es]
        if not row: continue
        lx=min(row)-1; rx=max(row)+1
        lp=f.getpixel((lx,y)) if lx>=0 else (0,0,0,0); rp=f.getpixel((rx,y)) if rx<W else (0,0,0,0)
        if lp[3] and rp[3]:
            for x in row: f.putpixel((x,y),lp)
        elif lp[3] and lp[:3]!=(0,0,0) and not is_cyan(lp):
            # thân kết thúc ở đây: thêm 1 viền đen
            f.putpixel((min(row),y),(0,0,0,255))
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
FL={(252,214,120):(255,246,200),(216,151,67):(252,214,120),(184,118,54):(232,176,80),(206,142,58):(250,200,100),(110,60,22):(184,118,54)}
def bell(f,lvl,box):
    x0,y0,x1,y1=box
    for y in range(y0,y1):
        for x in range(x0,x1):
            p=f.getpixel((x,y))
            if not p[3]: continue
            q=p[:3]
            # chuông: các điểm vàng/đồng trong vùng ngực
            if q[0]>150 and 80<q[1]<230 and q[2]<140:
                r,g,bb=q
                for _ in range(lvl): r,g,bb=min(255,r+25),min(255,g+35),min(255,bb+40)
                f.putpixel((x,y),(r,g,bb,255))
fr={i:Image.open(D+f'goc/f{i}.png').convert('RGBA') for i in range(1,10)}
out=[fr[1].copy()]
f=fr[3].copy(); bell(f,1,(44,52,58,64)); out.append(f)
f=fr[4].copy(); bell(f,2,(44,50,58,62)); out.append(f)
f=fr[5].copy(); bell(f,1,(44,54,58,66)); out.append(f)
f=fr[6].copy(); erase_sword(f,(64,62,100,86))
# nén thân 2px khi tiếp đất (chân giữ nguyên mặt đất)
src=f.copy(); f=Image.new('RGBA',src.size)
for y in range(104):
    for x in range(104):
        p=src.getpixel((x,y)) if y>74 else (src.getpixel((x,y-2)) if y>=2 else (0,0,0,0))
        if p[3]: f.putpixel((x,y),p)
# bụi va chạm hai bên chân
DUST=[(0,0,(200,215,220)),(1,-1,(160,200,205)),(-1,-1,(200,215,220)),(2,0,(120,230,230)),(-2,0,(160,200,205)),(0,-2,(160,200,205))]
for cx,cy in [(40,81),(78,81)]:
    for dx,dy,c in DUST: put(f,cx+dx,cy+dy,c+(255,))
hx,hy=65,68
smear2(f,58,58,31,100,-58,thmax=10,shear=(3,-3)); glove(f,hx-1,hy-1); weapon(f,hx,hy,-58,blade=24); out.append(f)   # 5: IMPACT bổ xuống
out.append(fr[7].copy()); out.append(fr[9].copy())
for f in out: clean2(f)
os.makedirs(D+'out',exist_ok=True)
sh=Image.new('RGBA',(104*len(out),104))
for i,f in enumerate(out): f.save(D+f'out/chem3-{i}.png'); sh.paste(f,(i*104,0))
sh.save(D+'out/chem3-sheet.png')
pv=Image.new('RGBA',sh.size,(58,63,68,255)); pv.alpha_composite(sh); pv.resize((sh.width*3,312),Image.NEAREST).save(D+'out/chem3-xem.png')
g=[]
for f in out:
    b=Image.new('RGBA',(104,104),(58,63,68,255)); b.alpha_composite(f); g.append(b.resize((312,312),Image.NEAREST).convert('P',palette=Image.ADAPTIVE))
g[0].save(D+'out/chem3.gif',save_all=True,append_images=g[1:]+[g[0]],duration=[80,90,110,90,160,100,100,400],loop=0)
