# AERIN Slash1 (SE) – hybrid pixel-exact theo Art Director:
# chỉ chép/dời nguyên khối pixel PixelLab (không xoay/co giãn), vệt chém vẽ từng pixel ở lớp trước.
import os,math,json
from PIL import Image
D=os.path.dirname(os.path.abspath(__file__))+'/'
P2=D+'../phase2/'
def ld(p): return Image.open(p).convert('RGBA')
idle=ld(P2+'goc/dung-0.png'); gen={k:ld(D+f'goc/gen-{k}.png') for k in range(8)}
run4=ld(P2+'sua/chay-3.png')
W=112
def is_blade(p): return p[3] and p[2]>200 and p[1]>170 and p[0]<235 and not (p[0]>235 and p[1]>235)
def is_blade_any(p): return p[3] and p[2]>190 and p[1]>160   # gồm cả trắng của lưỡi
# --- khối lưỡi kiếm sạch của Idle (chéo xuống-phải ~45°): pixel lưỡi + viền tối kề nó, trong hộp dưới-phải tay
BB=(72,64,96,92)
blade=set((x,y) for y in range(BB[1],BB[3]) for x in range(BB[0],BB[2]) if is_blade_any(idle.getpixel((x,y))))
edge=set()
for (x,y) in blade:
    for dx in(-1,0,1):
        for dy in(-1,0,1):
            q=(x+dx,y+dy)
            if q not in blade and BB[0]<=q[0]<BB[2] and BB[1]<=q[1]<BB[3]:
                p=idle.getpixel(q)
                if p[3] and max(p[:3])<110: edge.add(q)
BLADE=[(x,y,idle.getpixel((x,y))) for (x,y) in blade|edge]
bx0=min(x for x,y,_ in BLADE); by0=min(y for x,y,_ in BLADE)
# điểm gốc lưỡi (đầu gần tay) = pixel lưỡi trên-trái nhất
root=min(blade,key=lambda q:q[0]+q[1])
def paste_blade(f,hx,hy,only_empty=False):
    dx,dy=hx-root[0],hy-root[1]
    for x,y,p in BLADE:
        q=(x+dx,y+dy)
        if 0<=q[0]<W and 0<=q[1]<W and (not only_empty or not f.getpixel(q)[3]): f.putpixel(q,p)
def clear(f,box):
    for y in range(box[1],box[3]):
        for x in range(box[0],box[2]): f.putpixel((x,y),(0,0,0,0))
def erase_region(f,box,test):
    x0,y0,x1,y1=box
    S=set((x,y) for y in range(y0,y1) for x in range(x0,x1) if test(f.getpixel((x,y))))
    # thêm viền tối dính lưỡi
    for (x,y) in list(S):
        for dx in(-1,0,1):
            for dy in(-1,0,1):
                q=(x+dx,y+dy)
                if x0<=q[0]<x1 and y0<=q[1]<y1 and q not in S:
                    p=f.getpixel(q)
                    if p[3] and max(p[:3])<110: S.add(q)
    for q in S: f.putpixel(q,(0,0,0,0))
CW=(0xf5,0xfa,0xfd,255); CC=(0x52,0xd0,0xf2,255); CL=(0xb2,0xf3,0xf8,255); CD=(0x3f,0x95,0xcd,255); AM=(0xff,0xc8,0x6e,255)
def smear(f,cx,cy,R,a0,a1,thmax):
    lay=Image.new('RGBA',(W,W))
    n=int(abs(a1-a0)*3)+1
    for i in range(n+1):
        u=i/n; a=math.radians(a0+(a1-a0)*u); th=1+(thmax-1)*(u**1.3)
        for k in range(int(round(th))):
            r=R-k
            c=CW if k==0 else (CL if k==1 else (CC if k<th-1 else CD))
            x,y=round(cx+r*math.cos(a)),round(cy-r*math.sin(a))
            if 0<=x<W and 0<=y<W: lay.putpixel((x,y),c)
        if u>0.35:
            x,y=round(cx+(R+1)*math.cos(a)),round(cy-(R+1)*math.sin(a))
            if 0<=x<W and 0<=y<W and not lay.getpixel((x,y))[3]: lay.putpixel((x,y),AM)
    f.alpha_composite(lay)
out=[]
# F1 thủ thế
out.append(idle.copy())
# F2 vung kiếm qua vai (PixelLab gen F2, giữ nguyên)
out.append(gen[1].copy())
# F3 lưỡi ra sau vai xa: dời khối lưỡi đứng của gen F2 xuống-phải, chỉ vẽ vào chỗ trống (nằm sau mũ)
f=gen[1].copy()
gb=[(x,y,f.getpixel((x,y))) for y in range(0,36) for x in range(40,80) if is_blade_any(f.getpixel((x,y))) or (f.getpixel((x,y))[3] and y<30)]
for x,y,_ in gb: f.putpixel((x,y),(0,0,0,0))
for x,y,p in gb:
    q=(x+7,y+5)
    if not f.getpixel(q)[3]: f.putpixel(q,p)
out.append(f)
# F4 IMPACT: thân lao tới của Run F4, bỏ lưỡi ngang, gắn khối lưỡi chéo (Idle) vào tay + vệt chém lớn
f=run4.copy(); clear(f,(87,50,112,68))
paste_blade(f,85,60)
smear(f,70,52,28,70,-48,5)
out.append(f)
# F5 theo đà: cùng thân, lưỡi thấp hơn 2px, vệt mảnh còn lại
f=run4.copy(); clear(f,(87,50,112,68))
paste_blade(f,85,62)
smear(f,70,54,27,-10,-52,3)
out.append(f)
# F6–F7 hồi về (PixelLab gen F7, F8), F8 thủ thế
out+= [gen[6].copy(), gen[7].copy(), idle.copy()]
MS=[70,70,70,40,90,90,90,110]
os.makedirs(D+'out',exist_ok=True)
for i,f in enumerate(out): f.save(D+f'out/slash1-{i}.png')
sh=Image.new('RGBA',(W*len(out),W)); [sh.paste(f,(i*W,0)) for i,f in enumerate(out)]; sh.save(D+'slash1-sheet.png')
bg=Image.new('RGBA',sh.size,(58,63,68,255)); bg.alpha_composite(sh); bg.resize((sh.width*3,W*3),Image.NEAREST).save(D+'slash1-x3.png')
g=[]
for f in out:
    b=Image.new('RGBA',(W,W),(58,63,68,255)); b.alpha_composite(f); g.append(b.resize((W*3,W*3),Image.NEAREST).convert('P',palette=Image.ADAPTIVE))
g[0].save(D+'slash1.gif',save_all=True,append_images=g[1:],duration=MS,loop=0)
json.dump({'frames':len(out),'ms':MS,'impact_index':3,'canvas':W,'blade_root_idle':root},open(D+'slash1.json','w'))
print('root',root,len(BLADE))
