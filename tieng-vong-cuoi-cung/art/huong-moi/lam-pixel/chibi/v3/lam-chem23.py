# Chém 2 (Rising Echo, 5 frame) và Chém 3 (Bell Resonance, 7 frame) - cùng pipeline Chém 1
from PIL import Image
import math
from lam_pixel_lib import *
AM=(255,190,80,255); CY=(120,230,230,255); CY2=(70,150,160,255); WH=(255,244,200,255)
FLASH={(252,214,120):(255,246,200),(216,151,67):(252,214,120),(184,118,54):(232,176,80),(206,142,58):(250,200,100),(110,60,22):(184,118,54)}
def bell_flash(f,lvl):
    for y in range(39,47):
        for x in range(32,39):
            p=f.getpixel((x,y))[:3]
            q=p
            for _ in range(lvl): q=FLASH.get(q,q)
            if q!=p: f.putpixel((x,y),q+(255,))
def canvas(f): c=Image.new('RGBA',(96,64)); c.alpha_composite(f,(0,0)); return c
def diag_arc(c,x0,y0,x1,y1,bow,col,col2=None):
    n=40
    for i in range(n+1):
        u=i/n; x=x0+(x1-x0)*u; y=y0+(y1-y0)*u
        dx,dy=x1-x0,y1-y0; L=math.hypot(dx,dy); nx,ny=dy/L,-dx/L
        b=bow*4*u*(1-u); px,py=round(x+nx*b),round(y+ny*b)
        put(c,px,py,col)
        if col2: put(c,px-1,py+1,col2)
def ring(c,cx,cy,r,col):
    # không vẽ đè lên fork (giữ vũ khí luôn đọc được)
    for t in range(0,360,6):
        a=math.radians(t); x,y=round(cx+r*math.cos(a)),round(cy+r*math.sin(a)*0.8)
        if 0<=x<c.width and 0<=y<c.height and c.getpixel((x,y))[:3] in [S[:3],H[:3]]: continue
        if x>=37 and any(0<=x+dx<c.width and 0<=y+dy<c.height and c.getpixel((x+dx,y+dy))[:3] in [S[:3],H[:3]] for dx in(-1,0,1) for dy in(-1,0,1)): continue
        put(c,x,y,col)
def save(name,frames,previews,durs):
    out=B+name+'/'
    sh=Image.new('RGBA',(64*len(frames),64))
    for i,f in enumerate(frames): f.save(out+f'{name[:5]}-{i}.png'); sh.paste(f,(i*64,0))
    sh.save(out+f'{name[:5]}-sheet.png')
    pv=Image.new('RGBA',(96*len(previews),64),(58,63,68,255))
    for i,c in enumerate(previews): pv.alpha_composite(c,(i*96,0))
    pv.resize((pv.width*4,256),Image.NEAREST).save(out+f'{name[:5]}-xem-vfx.png')
    g=[]
    for c in previews:
        b=Image.new('RGBA',(96,64),(58,63,68,255)); b.alpha_composite(c); g.append(b.resize((384,256),Image.NEAREST).convert('P',palette=Image.ADAPTIVE))
    g[0].save(out+f'{name[:5]}-xem-vfx.gif',save_all=True,append_images=g[1:]+[g[0]],duration=durs+[500],loop=0)
    return pv
idle=lambda: Image.open(B+'idle-se/idle-se-0.png').convert('RGBA')
# ---- Chém 2: Rising Echo ----
F=[idle()]
f=base_clean(); shift_rows(f,44,54,0,1); arm(f,38,47,37,51); glove(f,37,51); fork(f,39,52,-50,stem=4); F.append(f)   # hạ thấp, fork chúc xuống trước
f=base_clean(); shift_rows(f,44,54,1,0); arm(f,39,45,43,42); glove(f,43,41); fork(f,45,41,50); F.append(f)        # impact: vung chéo lên
f=base_clean(); shift_rows(f,44,54,1,0); arm(f,39,44,42,39); glove(f,42,38); fork(f,43,37,75); F.append(f)         # follow: fork lên cao
f=base_clean(); glove(f,39,49); fork(f,40,48,90,stem=4); F.append(f)
P=[canvas(x) for x in F]
diag_arc(P[2],49,50,58,30,4,CY,AM)
diag_arc(P[3],51,46,60,26,4,CY2)
pv2=save('chem2-se',F,P,[83,83,120,83,83])
# ---- Chém 3: Bell Resonance (v2 theo góp ý ChatGPT) ----
def broken_arc(c,cx,cy,r,col,a0=-60,a1=61,step=3,gap=4):
    for k,t in enumerate(range(a0,a1,step)):
        if (k//gap)%2: continue
        a=math.radians(t); put(c,round(cx+r*math.cos(a)),round(cy+r*math.sin(a)*1.1),col)
F=[idle()]
f=base_clean(); shift_rows(f,44,54,0,1); glove(f,37,48); fork(f,38,47,92,stem=4); F.append(f)          # F2 hạ thân, khuỷu lùi, fork sát chuông
f=base_clean(); shift_rows(f,44,54,0,1); glove(f,37,48); fork(f,38,47,92,stem=4); bell_flash(f,1); F.append(f)   # F3 chuông bắt đầu sáng
f=base_clean(); glove(f,38,47); fork(f,39,46,92,stem=4); bell_flash(f,2)
for p in [(35,43),(35,44),(36,44)]: put(f,p[0],p[1],WH)
F.append(f)                                                                                              # F4 chuông lóe, tâm sáng
f=base_clean(); shift_rows(f,44,54,2,0); arm(f,40,46,48,46); glove(f,48,45); fork(f,50,45,0,stem=4,prong=4); bell_flash(f,1); F.append(f)  # F5 đẩy thẳng
f=base_clean(); shift_rows(f,44,54,1,0); arm(f,39,46,46,47); glove(f,46,46); fork(f,48,47,-8,stem=4,prong=4); F.append(f)
f=base_clean(); glove(f,39,49); fork(f,40,48,90,stem=4); F.append(f)
P=[canvas(x) for x in F]
ring(P[2],35,44,5,AM)                                 # F3 quầng sáng lớn hơn 1px
ring(P[3],35,44,5,WH); ring(P[3],35,44,8,AM)          # F4 vòng sáng
for r,col in [(8,CY),(7,AM)]:                          # F5 sóng âm kép phía trước
    broken_arc(P[4],52,45,r,col,step=4,gap=99)
broken_arc(P[4],52,45,13,CY,gap=3)
broken_arc(P[4],35,44,11,CY2,a0=-50,a1=51,gap=3)
broken_arc(P[5],54,46,10,CY2,step=4,gap=99)            # F6 dư âm, vòng ngoài dịch ra 4px
broken_arc(P[5],56,46,17,CY2,gap=3)
pv3=save('chem3-se',F,P,[83,83,83,120,160,83,83])
