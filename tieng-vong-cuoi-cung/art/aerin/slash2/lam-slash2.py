# AERIN Slash2 (chém hất lên, SE) – hybrid pixel-exact theo Art Director:
# A F2 → F3 (nén 2px) → F4* (lưỡi nghiêng thêm về phải bằng dời từng hàng pixel + vệt hất lên) → F6 → F7
import os,math,json
from PIL import Image
D=os.path.dirname(os.path.abspath(__file__))+'/'
J=D+'../phase2b/goc/'
def ld(p): return Image.open(p).convert('RGBA')
A={k:ld(J+f'jump-{k}.png') for k in range(7)}
W=112
CW=(0xf5,0xfa,0xfd,255); CC=(0x52,0xd0,0xf2,255); CL=(0xb2,0xf3,0xf8,255); CD=(0x3f,0x95,0xcd,255); AM=(0xff,0xc8,0x6e,255)
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
def squash(f,n,ground):
    g=Image.new('RGBA',f.size)
    for y in range(W):
        for x in range(W):
            p=f.getpixel((x,y)) if y>ground else (f.getpixel((x,y-n)) if y>=n else (0,0,0,0))
            if p[3]: g.putpixel((x,y),p)
    return g
def lean_blade(f,box,pivot_y,step):
    """nghiêng lưỡi: hàng y trên pivot dời phải (pivot_y-y)//step px – chỉ dời nguyên pixel trong hộp lưỡi"""
    x0,y0,x1,y1=box; g=f.copy()
    for y in range(y0,y1):
        for x in range(x0,x1): g.putpixel((x,y),(0,0,0,0))
    for y in range(y0,y1):
        s=max(0,(pivot_y-y)//step)
        for x in range(x0,x1):
            p=f.getpixel((x,y))
            if p[3] and x+s<W: g.putpixel((x+s,y),p)
    return g
out=[A[1].copy(), squash(A[2].copy(),2,74)]
f=lean_blade(A[3].copy(),(78,10,90,40),40,3)   # lưỡi đứng ~78° -> ~65°
smear(f,73,46,31,-55,66,5)
out.append(f)
out+=[A[5].copy(), A[6].copy()]
MS=[70,70,45,90,110]
os.makedirs(D+'out',exist_ok=True)
for i,f in enumerate(out): f.save(D+f'out/slash2-{i}.png')
sh=Image.new('RGBA',(W*len(out),W)); [sh.paste(f,(i*W,0)) for i,f in enumerate(out)]; sh.save(D+'slash2-sheet.png')
bg=Image.new('RGBA',sh.size,(58,63,68,255)); bg.alpha_composite(sh); bg.resize((sh.width*3,W*3),Image.NEAREST).save(D+'slash2-x3.png')
g=[]
for f in out:
    b=Image.new('RGBA',(W,W),(58,63,68,255)); b.alpha_composite(f); g.append(b.resize((W*3,W*3),Image.NEAREST).convert('P',palette=Image.ADAPTIVE))
g[0].save(D+'slash2.gif',save_all=True,append_images=g[1:],duration=MS,loop=0)
json.dump({'frames':len(out),'ms':MS,'impact_index':2,'canvas':W,'lunge_px':5,'hitstop_ms':35},open(D+'slash2.json','w'))
