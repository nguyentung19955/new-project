# AERIN Slash3 (nhảy bổ nặng, SE) – hybrid pixel-exact theo Art Director:
# A F3 (huy hiệu sáng) → A F4 → A F6 (lưỡi đủ dài, đỉnh) → A F7* impact (nén 2px, nghiêng tới 2px, lưỡi -45°, vệt lớn, bụi) → giữ thấp → Idle
import os,math,json
from PIL import Image
D=os.path.dirname(os.path.abspath(__file__))+'/'
def ld(p): return Image.open(p).convert('RGBA')
A={k:ld(D+f'../phase2b/goc/jump-{k}.png') for k in range(7)}
idle=ld(D+'../phase2/goc/dung-0.png')
W=112
CW=(0xf5,0xfa,0xfd,255); CC=(0x52,0xd0,0xf2,255); CL=(0xb2,0xf3,0xf8,255); CD=(0x3f,0x95,0xcd,255); AM=(0xff,0xc8,0x6e,255)
def is_blade_any(p): return p[3] and p[2]>190 and p[1]>160
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
root=min(blade,key=lambda q:q[0]+q[1])
def paste_blade(f,hx,hy):
    dx,dy=hx-root[0],hy-root[1]
    for x,y,p in BLADE:
        q=(x+dx,y+dy)
        if 0<=q[0]<W and 0<=q[1]<W: f.putpixel(q,p)
def clear(f,box):
    for y in range(box[1],box[3]):
        for x in range(box[0],box[2]): f.putpixel((x,y),(0,0,0,0))
def smear(f,cx,cy,R,a0,a1,thmax):
    lay=Image.new('RGBA',(W,W)); n=int(abs(a1-a0)*3)+1
    for i in range(n+1):
        u=i/n; a=math.radians(a0+(a1-a0)*u); th=1+(thmax-1)*(u**1.3)
        for k in range(int(round(th))):
            r=R-k; c=CW if k==0 else (CL if k==1 else (CC if k<th-1 else CD))
            x,y=round(cx+r*math.cos(a)),round(cy-r*math.sin(a))
            if 0<=x<W and 0<=y<W: lay.putpixel((x,y),c)
        if u>0.35:
            x,y=round(cx+(R+1)*math.cos(a)),round(cy-(R+1)*math.sin(a))
            if 0<=x<W and 0<=y<W and not lay.getpixel((x,y))[3]: lay.putpixel((x,y),AM)
    f.alpha_composite(lay)
def body_shift(f,ground,down,right):
    """dời nguyên khối phần trên mặt đất (y<=ground): xuống 'down', sang phải 'right' – chân giữ nguyên"""
    g=Image.new('RGBA',f.size)
    for y in range(W):
        for x in range(W):
            p=f.getpixel((x,y))
            if not p[3]: continue
            if y<=ground:
                q=(x+right,y+down)
                if 0<=q[0]<W and 0<=q[1]<W and not g.getpixel(q)[3]: g.putpixel(q,p)
            else: g.putpixel((x,y),p)
    return g
def glow(f,box,center):
    x0,y0,x1,y1=box
    for y in range(y0,y1):
        for x in range(x0,x1):
            p=f.getpixel((x,y))
            if p[3] and min(p[:3])>140: f.putpixel((x,y),CW)
    cx,cy=center
    for q in ((cx-2,cy),(cx+2,cy),(cx,cy-2),(cx,cy+2)):
        if f.getpixel(q)[3]: f.putpixel(q,CC)
DUST=[(0,0,(200,215,220)),(1,-1,(160,200,205)),(-1,-1,(200,215,220)),(2,0,(170,230,240)),(-2,0,(160,200,205)),(0,-2,(160,200,205))]
out=[]
f=A[2].copy(); glow(f,(55,67,63,73),(59,70)); out.append(f)
out.append(A[3].copy())
out.append(A[5].copy())
# IMPACT
f=A[6].copy(); clear(f,(82,60,112,84))
f=body_shift(f,74,2,2)
paste_blade(f,82,67)
smear(f,66,50,32,100,-45,6)
for cx,cy in [(44,90),(86,90),(92,89)]:
    for dx,dy,c in DUST:
        if 0<=cx+dx<W and 0<=cy+dy<W: f.putpixel((cx+dx,cy+dy),c+(255,))
out.append(f)
# giữ thấp (không vệt)
f=A[6].copy(); clear(f,(82,60,112,84)); f=body_shift(f,74,2,2); paste_blade(f,82,67); out.append(f)
out.append(idle.copy())
MS=[90,90,100,55,120,120]
os.makedirs(D+'out',exist_ok=True)
for i,f in enumerate(out): f.save(D+f'out/slash3-{i}.png')
sh=Image.new('RGBA',(W*len(out),W)); [sh.paste(f,(i*W,0)) for i,f in enumerate(out)]; sh.save(D+'slash3-sheet.png')
bg=Image.new('RGBA',sh.size,(58,63,68,255)); bg.alpha_composite(sh); bg.resize((sh.width*3,W*3),Image.NEAREST).save(D+'slash3-x3.png')
g=[]
for f in out:
    b=Image.new('RGBA',(W,W),(58,63,68,255)); b.alpha_composite(f); g.append(b.resize((W*3,W*3),Image.NEAREST).convert('P',palette=Image.ADAPTIVE))
g[0].save(D+'slash3.gif',save_all=True,append_images=g[1:],duration=MS,loop=0)
json.dump({'frames':len(out),'ms':MS,'impact_index':3,'canvas':W,'lunge_px':8,'hitstop_ms':55,'shake_px':2},open(D+'slash3.json','w'))
