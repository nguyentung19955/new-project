import os
# Cắt lưới khung (cols x rows) theo khối liền, căn thân bằng khớp hình với khung 1, chân bám đất, thu nhỏ pixel
from PIL import Image, ImageDraw
import numpy as np, sys
from scipy import ndimage
S='/tmp/claude-0/-home-claude/07b38427-7433-5f9d-9534-8e5dd3f7e53b/scratchpad/'
V='/root/neon/docs/demo-hop-tuong/nguon-chatgpt/v3/'
src,cols,rows,name=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),sys.argv[4]
durs=[int(x) for x in sys.argv[5].split(',')] if len(sys.argv)>5 else None
im=Image.open(V+src).convert('RGBA'); arr=np.array(im).astype(np.float32); m=arr[:,:,3]>40
lab,k=ndimage.label(ndimage.binary_dilation(m,iterations=1)); lab=lab*m
W,H=im.size; n=cols*rows
cen=[((c+0.5)*W/cols,(r+0.5)*H/rows) for r in range(rows) for c in range(cols)]
sizes=ndimage.sum(m,lab,range(1,k+1)); com=ndimage.center_of_mass(m,lab,range(1,k+1))
groups=[[] for _ in range(n)]
for i in range(k):
    if sizes[i]<30: continue
    cy,cx=com[i]; groups[int(np.argmin([(cx-a)**2+((cy-b)*1.5)**2 for a,b in cen]))].append(i+1)
masks=[np.isin(lab,g) for g in groups]
L=[]
lua=(arr[:,:,0]>215)&(arr[:,:,1]>140)&(arr[:,:,2]<150)
for mm in masks:
    a=arr.copy(); a[:,:,3]=np.where(mm,a[:,:,3],0); L.append(a)
def body(mm):
    lj,kj=ndimage.label(mm); b=np.argmax(ndimage.sum(mm,lj,range(1,kj+1)))+1; return lj==b
b0m=body(masks[0]); ys=np.nonzero(b0m.any(1))[0]; t0,b0=ys[0],ys[-1]; H0=b0-t0
cx0=int(np.median(np.nonzero(b0m[b0-30:b0+1])[1]))
y1,y2=(int(t0),int(t0+H0*0.55)) if os.environ.get('BAND')=='top' else (int(t0+H0*0.40),int(b0+1)); x1,x2=cx0-int(H0*0.16),cx0+int(H0*0.16)
def feat(a):
    al=a[:,:,3:4]/255.0; return np.concatenate([a[:,:,:3]*al/255.0,al],2)
T=feat(L[0][y1:y2,x1:x2])
shifts=[(0,0)]
for j in range(1,n):
    F=feat(L[j]); best=None
    ox=int(cen[j][0]-cen[0][0]); oy=int(cen[j][1]-cen[0][1])
    for dy in range(oy-60,oy+41,3):
        for dx in range(ox-90,ox+91,3):
            if y1+dy<0 or x1+dx<0: continue
            P=F[y1+dy:y2+dy,x1+dx:x2+dx]
            if P.shape!=T.shape: continue
            e=np.mean((P-T)**2)
            if best is None or e<best[0]: best=(e,dx,dy)
    _,bx,by=best
    for dy in range(by-3,by+4):
        for dx in range(bx-3,bx+4):
            if y1+dy<0 or x1+dx<0: continue
            P=F[y1+dy:y2+dy,x1+dx:x2+dx]
            if P.shape!=T.shape: continue
            e=np.mean((P-T)**2)
            if e<best[0]: best=(e,dx,dy)
    shifts.append((best[1],best[2]))
sc=116/H0
SACH=os.environ.get('SACH')=='1'
VIEN=os.environ.get('SACH')=='vien'   # chỉ dọn viền: giữ nguyên cách thu nhỏ/màu bên trong
def khuNhieu(q,al):
    # 1) bỏ điểm lẻ: ô đặc có <=1 hàng xóm đặc   2) điểm màu lạc: khác mọi hàng xóm -> lấy màu hàng xóm phổ biến nhất
    H,W=al.shape; q=q.copy(); al=al.copy()
    nb=sum(np.roll(np.roll(al,a,0),b,1) for a in(-1,0,1) for b in(-1,0,1) if (a,b)!=(0,0))
    al&=nb>=2
    key=(q[:,:,0].astype(np.int32)<<16)|(q[:,:,1].astype(np.int32)<<8)|q[:,:,2]
    out=q.copy()
    for y in range(1,H-1):
        for x in range(1,W-1):
            if not al[y,x]: continue
            ks=[key[y+a,x+b] for a in(-1,0,1) for b in(-1,0,1) if (a,b)!=(0,0) and al[y+a,x+b]]
            if len(ks)>=5 and key[y,x] not in ks:
                k=max(set(ks),key=ks.count); out[y,x]=[(k>>16)&255,(k>>8)&255,k&255]
    return out,al
FW,FH=224,int(os.environ.get("FH",176))
frames=[]
for j in range(n):
    dx,dy=shifts[j]; bj=body(masks[j]); ay=(b0+dy) if os.environ.get("NEO")=="dy" else np.nonzero(bj.any(1))[0][-1]; ax=cx0+dx
    yy,xx=np.nonzero(masks[j]); X0,X1,Y0,Y1=xx.min(),xx.max()+1,yy.min(),yy.max()+1
    c=Image.fromarray(L[j].astype(np.uint8),'RGBA').crop((X0,Y0,X1,Y1))
    if VIEN:
        ca=np.array(c); ca[:,:,3]=np.where(ndimage.binary_erosion(ca[:,:,3]>110,iterations=2),ca[:,:,3],0); c=Image.fromarray(ca,'RGBA')
    if SACH:   # gọt viền 2px nguồn (bỏ quầng nền trắng) trước khi thu nhỏ
        ca=np.array(c); ca[:,:,3]=np.where(ndimage.binary_erosion(ca[:,:,3]>110,iterations=1),ca[:,:,3],0); c=Image.fromarray(ca,'RGBA')
    c2=c.resize((max(1,round(c.width*sc)),max(1,round(c.height*sc))),Image.BOX if SACH else Image.LANCZOS)
    a2=np.array(c2); al=a2[:,:,3]>(140 if SACH else 110)
    q=Image.fromarray(a2[:,:,:3]).quantize(colors=(28 if SACH else 40),method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGB')
    q=np.array(q)
    if VIEN:
        for _ in range(2):
            nb=sum(np.roll(np.roll(al,a,0),b,1) for a in(-1,0,1) for b in(-1,0,1) if (a,b)!=(0,0)); al=al&(nb>=3)
        lb,kb=ndimage.label(al); sz=ndimage.sum(al,lb,range(1,kb+1))
        for i,z in enumerate(sz):
            if z<6: al[lb==i+1]=False
    if SACH:
        q,al=khuNhieu(q,al)
        vien=al&~ndimage.binary_erosion(al)   # viền ngoài 1px tô màu tối nhất -> nét viền kín như pixel art
        lum=q.sum(2); dk=q[al][np.argmin(lum[al])] if al.any() else [20,15,20]
        q[vien]=(np.array(dk)*0.6+np.array([25,18,24])*0.4).astype(np.uint8)
    p=Image.fromarray(np.dstack([q,(al*255).astype('uint8')]),'RGBA')
    px=round(FW/2-(ax-X0)*sc); py=round(FH-int(os.environ.get("PADB",8))-(ay-Y0)*sc)
    assert px>=0 and px+p.width<=FW and py>=0 and py+p.height<=FH+8,(j,px,py,p.size)
    F=Image.new('RGBA',(FW,FH),(0,0,0,0)); F.paste(p,(px,py),p); frames.append(F)
sheet=Image.new('RGBA',(FW*n,FH),(0,0,0,0))
for i,f in enumerate(frames): sheet.paste(f,(i*FW,0),f)
sheet.save(V+name+'.png')
s=Image.new('RGBA',sheet.size,(96,100,108,255)); s.alpha_composite(sheet); s.resize((sheet.width,sheet.height),Image.NEAREST).convert('RGB').save(S+name+'_view.png')
durs=durs or [100]*n; Z=3; out=[]
for r in range(2):
    for f in frames:
        b=Image.new('RGBA',f.size,(96,100,108,255)); b.alpha_composite(f)
        g=b.resize((FW*Z,FH*Z),Image.NEAREST).convert('RGB'); out.append(g)
out[0].save(S+name+'.gif',save_all=True,append_images=out[1:],duration=durs*2,loop=0)
print('ok',shifts)
