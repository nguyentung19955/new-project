# Sửa Run theo Art Director (pixel-exact): F5 nâng 5px, F6 nâng 4px; F4–F6 dán lại cụm khăn trắng từ Idle F1 (chép nguyên pixel, chỉ vẽ vào chỗ trống = nằm sau thân)
import os
from PIL import Image
D=os.path.dirname(os.path.abspath(__file__))+'/'
idle=Image.open(D+'goc/dung-0.png').convert('RGBA')
BOX=(68,39,83,53)   # cụm khăn trong Idle F1
scarf=[(x,y,idle.getpixel((x,y))) for y in range(BOX[1],BOX[3]) for x in range(BOX[0],BOX[2]) if idle.getpixel((x,y))[3]]
def helm(f):  # mép trên + mép phải vùng mũ (hàng 24..40)
    pts=[(x,y) for y in range(20,41) for x in range(112) if f.getpixel((x,y))[3]]
    return min(y for x,y in pts), max(x for x,y in pts if y<38)
ht,hr=helm(idle)
os.makedirs(D+'sua',exist_ok=True)
SHIFT={4:5,5:4}
for k in range(6):
    f=Image.open(D+f'goc/chay-{k}.png').convert('RGBA')
    if k in (3,4,5):
        t,r=helm(f); dx,dy=r-hr,t-ht
        for x,y,p in scarf:
            q=(x+dx,y+dy)
            if 0<=q[0]<112 and 0<=q[1]<112 and not f.getpixel(q)[3]: f.putpixel(q,p)
    if k in SHIFT:
        g=Image.new('RGBA',f.size); g.alpha_composite(f.crop((0,SHIFT[k],112,112)),(0,0)); f=g
    f.save(D+f'sua/chay-{k}.png')
fr=[Image.open(D+f'sua/chay-{k}.png') for k in range(6)]
sh=Image.new('RGBA',(112*6,112)); [sh.paste(f,(i*112,0)) for i,f in enumerate(fr)]; sh.save(D+'chay-sheet.png')
bg=Image.new('RGBA',sh.size,(58,63,68,255)); bg.alpha_composite(sh); bg.resize((sh.width*4,448),Image.NEAREST).save(D+'chay-x4.png')
g=[]
for f in fr:
    b=Image.new('RGBA',(112,112),(58,63,68,255)); b.alpha_composite(f); g.append(b.resize((336,336),Image.NEAREST).convert('P',palette=Image.ADAPTIVE))
g[0].save(D+'chay.gif',save_all=True,append_images=g[1:],duration=85,loop=0)
def cy(p): return p[2]>200 and p[1]>180 and p[0]<170
print([max(y for y in range(112) for x in range(112) if f.getpixel((x,y))[3] and not cy(f.getpixel((x,y)))) for f in fr])
