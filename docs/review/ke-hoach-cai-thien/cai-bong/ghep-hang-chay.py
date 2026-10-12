from PIL import Image; import numpy as np, sys
R='/home/claude/new-project/docs/anh-goc/2026-10-12/'
S=np.asarray(Image.open(R+'em-be-healer-than.png').convert('RGB')).astype(int)
C=np.asarray(Image.open(R+'chay-healer.png').convert('RGB')).astype(int)
def nenTim(a): return (a[...,0]>170)&(a[...,2]>170)&(a[...,1]<110)
def nenXanh(a): return (a[...,1]-np.maximum(a[...,0],a[...,2])>70)
def bbox(m):
    ys,xs=np.where(m); return xs.min(),ys.min(),xs.max(),ys.max()
cx=[0,192,384,576,768,959,1151,1343,1535]
def hinh(a,x0,y0,x1,y1,nen):
    sub=a[y0+4:y1-3,x0+4:x1-3]; m=~nen(sub)&(sub.sum(2)>60)  # bỏ vạch kẻ đen
    m2=~nen(sub)
    # bỏ vạch: chỉ giữ thành phần chính: dùng bbox của pixel không nền và không quá sát mép
    b=bbox(m2); return sub,m2,b
hd=[]
for c in range(6):
    sub,m,b=hinh(S,cx[c],0,cx[c+1],166,nenTim); hd.append(b[3]-b[1]+1)
print('cao dung',hd)
ccx=[0,265,525,785,1045,1304,1563,1823,2087]
fr=[]
for c in range(8):
    sub,m,b=hinh(C,ccx[c],225,ccx[c+1],495,nenXanh); fr.append((sub,m,b))
hc=[b[3]-b[1]+1 for _,_,b in fr]; print('cao chay',hc)
k=float(sys.argv[1]) if len(sys.argv)>1 else np.median(hd)/np.median(hc)
print('k',k)
out=S.copy()
y0,y1=166,324
bg=np.array([248,8,244])
for c in range(8):
    out[y0+3:y1-2,cx[c]+3:cx[c+1]-2]=bg
    sub,m,b=fr[c]
    x0,yy0,x1,yy1=b
    crop=sub[yy0:yy1+1,x0:x1+1].copy(); mm=m[yy0:yy1+1,x0:x1+1]
    crop[~mm]=bg
    # khử viền xanh còn sót: pixel xanh trội -> nền
    gr=(crop[...,1]>crop[...,0]+30)&(crop[...,1]>crop[...,2]+30); crop[gr]=bg
    im=Image.fromarray(crop.astype('uint8')).resize((max(1,round(crop.shape[1]*k)),max(1,round(crop.shape[0]*k))),Image.NEAREST)
    a=np.asarray(im); h,w=a.shape[:2]
    oy=y1-14-h; ox=cx[c]+(192-w)//2
    out[oy:oy+h,ox:ox+w]=a
Image.fromarray(out.astype('uint8')).save('ghep-healer.png')
