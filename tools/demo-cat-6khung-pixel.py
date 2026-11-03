# Cắt 6 khung + căn bằng khớp hình phần thân (cổ áo->chân) với khung 1 => thân không giật
from PIL import Image
import numpy as np, sys
from scipy import ndimage
S='/tmp/claude-0/-home-claude/07b38427-7433-5f9d-9534-8e5dd3f7e53b/scratchpad/'
V='/root/neon/docs/demo-hop-tuong/nguon-chatgpt/v3/'
src,n,name=sys.argv[1],int(sys.argv[2]),sys.argv[3]
im=Image.open(V+src).convert('RGBA'); arr=np.array(im).astype(np.float32); m=arr[:,:,3]>40
lab,k=ndimage.label(ndimage.binary_dilation(m,iterations=2)); lab=lab*m
W=im.width; centers=[(i+0.5)*W/n for i in range(n)]
sizes=ndimage.sum(m,lab,range(1,k+1)); com=ndimage.center_of_mass(m,lab,range(1,k+1))
groups=[[] for _ in range(n)]
for i in range(k):
    if sizes[i]<30: continue
    groups[int(np.argmin([abs(com[i][1]-c) for c in centers]))].append(i+1)
masks=[np.isin(lab,g) for g in groups]
def layer(mm):
    a=arr.copy(); a[:,:,3]=np.where(mm,a[:,:,3],0); return a
L=[layer(mm) for mm in masks]
# mẫu: khung 0, vùng thân giữa (bỏ hai bên để tránh búa)
ys,xs=np.nonzero(masks[0]); t0,b0=ys.min(),ys.max(); H0=b0-t0
lab0,k0=ndimage.label(masks[0]); big=np.argmax(ndimage.sum(masks[0],lab0,range(1,k0+1)))+1
bx=np.nonzero((lab0==big)[b0-30:b0+1].any(0))[0]; cx0=int(np.median(np.nonzero((lab0==big)[b0-30:b0+1])[1]))
y1,y2=int(t0+H0*0.40),int(b0+1); x1,x2=cx0-int(H0*0.16),cx0+int(H0*0.16)
def feat(a):  # rgb premultiplied + alpha
    al=a[:,:,3:4]/255.0; return np.concatenate([a[:,:,:3]*al/255.0,al],2)
T=feat(L[0][y1:y2,x1:x2])
shifts=[(0,0)]
for j in range(1,n):
    F=feat(L[j]); best=None
    c0=int(centers[j]-centers[0])
    for dy in range(-60,41,2):
        for dx in range(c0-90,c0+91,2):
            P=F[y1+dy:y2+dy,x1+dx:x2+dx]
            if P.shape!=T.shape: continue
            e=np.mean((P-T)**2)
            if best is None or e<best[0]: best=(e,dx,dy)
    # tinh chỉnh 1px
    _,bxx,byy=best
    for dy in range(byy-2,byy+3):
        for dx in range(bxx-2,bxx+3):
            P=F[y1+dy:y2+dy,x1+dx:x2+dx]
            if P.shape!=T.shape: continue
            e=np.mean((P-T)**2)
            if e<best[0]: best=(e,dx,dy)
    shifts.append((best[1],best[2]))
print('shifts',shifts)
sc=116/H0 if 'nosc' not in sys.argv else 1
# chiều cao thân khung 0 (không tính búa trên cao) ~ dùng như bản cũ
ys0=np.nonzero(masks[0].any(1))[0]; sc=116/(ys0[-1]-ys0[0])
FW,FH=224,176
frames=[]
for j in range(n):
    dx,dy=shifts[j]; a=L[j].astype(np.uint8)
    img=Image.fromarray(a,'RGBA')
    # đặt sao cho điểm (cx0,b0) của khung0 tương ứng (cx0+dx,b0+dy) ở khung j nằm tại (FW/2, FH-8)
    lj,kj=ndimage.label(masks[j]); bj=np.argmax(ndimage.sum(masks[j],lj,range(1,kj+1)))+1
    ax,ay=cx0+dx,np.nonzero((lj==bj).any(1))[0][-1]
    yy,xx=np.nonzero(masks[j]); X0,X1,Y0,Y1=xx.min(),xx.max()+1,yy.min(),yy.max()+1
    c=img.crop((X0,Y0,X1,Y1)); c2=c.resize((max(1,round(c.width*sc)),max(1,round(c.height*sc))),Image.LANCZOS)
    a2=np.array(c2); al=a2[:,:,3]>110
    q=Image.fromarray(a2[:,:,:3]).quantize(colors=40,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGB')
    p=Image.fromarray(np.dstack([np.array(q),(al*255).astype('uint8')]),'RGBA')
    px=round(FW/2-(ax-X0)*sc); py=round(FH-8-(ay-Y0)*sc)
    assert px>=0 and px+p.width<=FW and py>=0 and py+p.height<=FH+8,(j,px,py,p.size)
    F=Image.new('RGBA',(FW,FH),(0,0,0,0)); F.paste(p,(px,py),p); frames.append(F)
sheet=Image.new('RGBA',(FW*n,FH),(0,0,0,0))
for i,f in enumerate(frames): sheet.paste(f,(i*FW,0),f)
sheet.save(V+name+'.png')
s=Image.new('RGBA',sheet.size,(96,100,108,255)); s.alpha_composite(sheet); s.resize((sheet.width*2,sheet.height*2),Image.NEAREST).convert('RGB').save(S+name+'_view.png')
durs=[300,140,180,60,260,200][:n]; Z=3; out=[]; dd=[]
for r in range(2):
    for f,d in zip(frames,durs):
        b=Image.new('RGBA',f.size,(96,100,108,255)); b.alpha_composite(f)
        g=b.resize((FW*Z,FH*Z),Image.NEAREST).convert('RGB')
        from PIL import ImageDraw; ImageDraw.Draw(g).line((FW*Z//2,0,FW*Z//2,FH*Z),fill=(70,74,80))
        out.append(g); dd.append(d)
out[0].save(S+name+'.gif',save_all=True,append_images=out[1:],duration=dd,loop=0)
