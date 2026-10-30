# Row 2 v2: elliptical energy ring around Lam's chest with depth.
# Near half = the PixelLab flat crescent (smile) drawn OVER the body; far half = the same crescent flipped (arch) drawn UNDER the body.
# Thin streak versions are only erased rims of the same asset (fx-row2.py). Nothing new is drawn.
import json,os,numpy as np
from PIL import Image, ImageDraw
D='row2_v2'; F='row2_pl/fx'
def L(n): return Image.open(f'{F}/{n}.png').convert('RGBA')
near_full,near_rim,far_full,far_rim=L('low'),L('low_streak'),L('high'),L('high_streak')
W,H=near_full.size  # 60x27
def half(img,side):
    a=np.array(img); a[:, (W//2 if side=='left' else 0):(W if side=='left' else W//2)]=0; return Image.fromarray(a)
CX,CY=72,84   # ring centre on the chest
nx,ny=CX-W//2, CY-2          # smile: tips at the ring centre line
fx_,fy=CX-W//2, CY-H+2       # arch: tips at the ring centre line
plan={ # frame: (far layer, far offset, near layer, near offset)
 1:None,
 2:(half(far_rim,'left'),(fx_,fy),near_full,(nx,ny)),
 3:(far_full,(fx_,fy),near_full,(nx+4,ny)),
 4:(far_full,(fx_-2,4),near_rim,(nx,ny)),          # arc rises over the head (reference R2-4)
 5:(far_rim,(fx_-6,6),None,None),
 6:(None,None,half(far_full,'right'),(CX-W//2-28,96)),   # descending streak from the hands, down-forward (ChatGPT round 4)
}
ms=[90,110,55,60,70,80,130]   # F0 = master idle-to-ready, then R2-1..R2-6
os.makedirs(f'{D}/preview',exist_ok=True)
frames=[]; BG=(234,235,235,255)
seq=[Image.open('pixellab/east.png').convert('RGBA')]+[Image.open(f'{D}/body/{k}.png').convert('RGBA') for k in range(1,7)]
meta={}
for i,body in enumerate(seq):
    c=Image.new('RGBA',(128,128),(0,0,0,0)); p=plan.get(i) if i>0 else None
    if p and p[0] is not None: c.alpha_composite(p[0],p[1])
    c.alpha_composite(body)
    if p and p[2] is not None: c.alpha_composite(p[2],p[3])
    frames.append(c); c.save(f'{D}/preview/{i}.png')
ims=[]
for c in frames:
    b=Image.new('RGBA',c.size,BG); b.alpha_composite(c); ims.append(b.convert('RGB').resize((384,384),Image.NEAREST))
ims[0].save(f'{D}/lam_row2_v2_3x.gif',save_all=True,append_images=ims[1:],duration=ms,loop=0)
ref=Image.open('tham-khao/mau-don-danh.jpg').convert('RGBA').crop((0,225,1200,405))
st=Image.new('RGBA',(1200,180+256),BG); st.alpha_composite(ref,(0,0)); d=ImageDraw.Draw(st)
for i in range(1,7):
    f=frames[i].resize((256,256),Image.NEAREST).crop((28,0,228,256)); st.alpha_composite(f,((i-1)*200,180)); d.text(((i-1)*200+5,185),f'R2-{i}',fill=(200,0,0,255))
st.save(f'{D}/compare_fx.png')
