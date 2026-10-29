# Bị đánh + Chết từ state cầm kiếm (Skeleton v3), sửa theo ChatGPT: chọn frame, kiếm rơi xuống đất, mắt tắt dần
import sys,os,math; sys.path.insert(0,'/home/claude/new-project/tieng-vong-cuoi-cung/art/huong-moi/lam-pixel/chibi/v3')
from lam_pixel_lib import *
from PIL import Image
D=os.path.dirname(os.path.abspath(__file__))+'/'
def keep_main(f,minsize=30):
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
            if len(comp)<minsize:
                for q in comp: f.putpixel(q,(0,0,0,0))
def eyes(f,mode):
    W,H=f.size
    E=[]
    for y in range(1,H-1):
        for x in range(1,W-1):
            p=f.getpixel((x,y))
            if p[3] and p[0]>180 and 90<p[1]<220 and p[2]<110:
                nb=sum(1 for dx in(-1,0,1) for dy in(-1,0,1) if (dx or dy) and f.getpixel((x+dx,y+dy))[3] and max(f.getpixel((x+dx,y+dy))[:3])<40)
                if nb>=5: E.append((x,y))
    for i,(x,y) in enumerate(E):
        p=f.getpixel((x,y))
        if mode=='dim': f.putpixel((x,y),(int(p[0]*.55),int(p[1]*.5),int(p[2]*.5),255))
        elif mode=='one': f.putpixel((x,y),(110,60,22,255) if i==0 else (0,0,0,255))
        elif mode=='off': f.putpixel((x,y),(0,0,0,255))
def dim_blade(f,box,k):
    x0,y0,x1,y1=box
    for y in range(y0,y1):
        for x in range(x0,x1):
            p=f.getpixel((x,y))
            if p[3] and (p[2]>150 and p[1]>150 and p[0]<235):
                f.putpixel((x,y),(int(p[0]*k+20*(1-k)),int(p[1]*k+30*(1-k)),int(p[2]*k+40*(1-k)),255))
def save(name,fr,durs):
    os.makedirs(D+name+'/out',exist_ok=True); W=fr[0].width
    sh=Image.new('RGBA',(W*len(fr),W))
    for i,f in enumerate(fr): f.save(D+name+f'/out/{name}-{i}.png'); sh.paste(f,(i*W,0))
    sh.save(D+name+f'/out/{name}-sheet.png')
    pv=Image.new('RGBA',sh.size,(58,63,68,255)); pv.alpha_composite(sh); pv.resize((sh.width*3,W*3),Image.NEAREST).save(D+name+f'/out/{name}-xem.png')
    g=[]
    for f in fr:
        b=Image.new('RGBA',(W,W),(58,63,68,255)); b.alpha_composite(f); g.append(b.resize((W*3,W*3),Image.NEAREST).convert('P',palette=Image.ADAPTIVE))
    g[0].save(D+name+f'/out/{name}.gif',save_all=True,append_images=g[1:],duration=durs,loop=0)
# ---- Bị đánh: F1, F4, F5 gốc ----
h={i:Image.open(D+f'bi-danh/goc/f{i}.png').convert('RGBA') for i in range(1,7)}
hurt=[h[1],h[4],h[5]]
for f in hurt: keep_main(f)
save('bi-danh',hurt,[83,83,83,400])
# ---- Chết ----
c={i:Image.open(D+f'chet/goc/f{i}.png').convert('RGBA') for i in range(1,8)}
for f in c.values(): keep_main(f)
GY=94   # mặt đất (đáy ủng)
f3=c[3].copy(); weapon(f3,78,80,-50,blade=16)                                       # tuột tay, rơi chéo
f4=c[4].copy(); weapon(f4,78,GY-3,-12,blade=20); dim_blade(f4,(70,80,112,100),.6); eyes(f4,'dim')
f5=c[5].copy(); weapon(f5,78,GY-3,-12,blade=5); eyes(f5,'one')
f6=c[6].copy(); weapon(f6,78,GY-3,-12,blade=0); eyes(f6,'off')
f7=c[7].copy(); weapon(f7,78,GY-3,-12,blade=0); eyes(f7,'off')
death=[c[1],c[2],f3,f4,f5,f6,f7]
save('chet',death,[70,80,90,90,100,100,1500])
