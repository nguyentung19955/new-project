from PIL import Image
import numpy as np, sys
from scipy import ndimage
S='/tmp/claude-0/-home-claude/07b38427-7433-5f9d-9534-8e5dd3f7e53b/scratchpad/'
V='/root/neon/docs/demo-hop-tuong/nguon-chatgpt/v3/'
src,n,name=sys.argv[1],int(sys.argv[2]),sys.argv[3]
im=Image.open(V+src).convert('RGBA'); arr=np.array(im); m=arr[:,:,3]>40
lab,k=ndimage.label(ndimage.binary_dilation(m,iterations=2)); lab=lab*m
W=im.width; centers=[(i+0.5)*W/n for i in range(n)]
sizes=ndimage.sum(m,lab,range(1,k+1)); com=ndimage.center_of_mass(m,lab,range(1,k+1))
groups=[[] for _ in range(n)]
for i in range(k):
    if sizes[i]<30: continue
    groups[int(np.argmin([abs(com[i][1]-c) for c in centers]))].append(i+1)
masks=[np.isin(lab,g) for g in groups]
# tỉ lệ theo chiều cao thân khung đầu
ys=np.nonzero(masks[0].any(1))[0]; sc=116/(ys[-1]-ys[0])
ground=max(np.nonzero(mm.any(1))[0][-1] for mm in masks)
FW,FH=224,176
frames=[]
for mm in masks:
    ys=np.nonzero(mm.any(1))[0]; gb=ys[-1]
    # chân: hàng dưới cùng của khối lớn nhất (thân)
    lab2,k2=ndimage.label(mm); big=np.argmax(ndimage.sum(mm,lab2,range(1,k2+1)))+1; body=lab2==big
    by=np.nonzero(body.any(1))[0][-1]; yy,xx=np.nonzero(body[by-25:by+1]); cx=np.median(xx)
    a=arr.copy(); a[:,:,3]=np.where(mm,a[:,:,3],0)
    x0,x1=np.nonzero(mm.any(0))[0][[0,-1]]; y0=ys[0]
    c=Image.fromarray(a,'RGBA').crop((x0,y0,x1+1,gb+1))
    c2=c.resize((max(1,round(c.width*sc)),max(1,round(c.height*sc))),Image.LANCZOS)
    a2=np.array(c2); al=a2[:,:,3]>110
    q=Image.fromarray(a2[:,:,:3]).quantize(colors=40,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGB')
    p=Image.fromarray(np.dstack([np.array(q),(al*255).astype('uint8')]),'RGBA')
    F=Image.new('RGBA',(FW,FH),(0,0,0,0))
    px=int(FW/2-(cx-x0)*sc); py=int(FH-8-(by-y0)*sc)
    assert px>=0 and px+p.width<=FW and py>=0 and py+p.height<=FH+8, (px,py,p.size)
    F.paste(p,(px,py),p); frames.append(F)
sheet=Image.new('RGBA',(FW*n,FH),(0,0,0,0))
for i,f in enumerate(frames): sheet.paste(f,(i*FW,0),f)
sheet.save(V+name+'.png')
s=Image.new('RGBA',sheet.size,(96,100,108,255)); s.alpha_composite(sheet); s.resize((sheet.width*2,sheet.height*2),Image.NEAREST).convert('RGB').save(S+name+'_view.png')
durs=[300,140,180,60,260,200][:n]
Z=3; out=[]; dd=[]
for r in range(2):
    for f,d in zip(frames,durs):
        b=Image.new('RGBA',f.size,(96,100,108,255)); b.alpha_composite(f); out.append(b.resize((FW*Z,FH*Z),Image.NEAREST).convert('RGB')); dd.append(d)
out[0].save(S+name+'.gif',save_all=True,append_images=out[1:],duration=dd,loop=0)
print('ok',sc)
