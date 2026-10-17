"""Số đo viền (tư vấn 17/10 mục 2.1) trên ảnh do-tuong-phan.py ghi ra (vung-<r>.png + vung-<r>-nen.png, 480×270).
Mỗi nhân vật: (x, dL thân − nền, % điểm viền lệch độ sáng ≥ 30 với nền kề, % điểm viền lệch màu ΔE(Lab) ≥ 30 với nền kề).
Chạy: python3 do-vien.py <thư mục ra của do-tuong-phan.py>   (cần numpy, scipy, Pillow)
"""
import numpy as np, sys
from PIL import Image
def L(a): return 0.299*a[...,0]+0.587*a[...,1]+0.114*a[...,2]
def lab(a):
    a=a/255.0; a=np.where(a>0.04045,((a+0.055)/1.055)**2.4,a/12.92)
    M=np.array([[0.4124,0.3576,0.1805],[0.2126,0.7152,0.0722],[0.0193,0.1192,0.9505]]); x=a@M.T/np.array([0.9505,1,1.089])
    f=np.where(x>0.008856,np.cbrt(x),7.787*x+16/116); return np.stack([116*f[...,1]-16,500*(f[...,0]-f[...,1]),200*(f[...,1]-f[...,2])],-1)
from scipy import ndimage
def do(A,N):
    khac=np.abs(A-N).sum(-1)>24
    lb,n=ndimage.label(khac); out=[]
    LA,LN=L(A),L(N); EA,EN=lab(A),lab(N)
    for k in range(1,n+1):
        mm=lb==k
        if mm.sum()<40: continue
        er=ndimage.binary_erosion(mm); vien=mm&~er
        dil=ndimage.binary_dilation(mm)&~mm
        # neighbor floor mean for each edge pixel approx: use mean floor in ring
        ys,xs=np.nonzero(vien)
        ok=0; okE=0
        for y,x in zip(ys,xs):
            sl=(slice(max(0,y-1),y+2),slice(max(0,x-1),x+2)); rng=dil[sl]
            if not rng.any(): continue
            ln=LN[sl][rng].mean(); en=EN[sl][rng].mean(0)
            ok+= abs(LA[y,x]-ln)>=30; okE+= np.linalg.norm(EA[y,x]-en)>=30
        out.append((int(xs.mean()), round(abs(LA[mm].mean()-LN[mm].mean()),1), round(100*ok/len(ys),1), round(100*okE/len(ys),1)))
    return out
if __name__=='__main__':
    d=sys.argv[1]
    for r in range(4):
        A=np.asarray(Image.open(f'{d}/vung-{r}.png').convert('RGB')).astype(float); N=np.asarray(Image.open(f'{d}/vung-{r}-nen.png').convert('RGB')).astype(float)
        print(r, do(A,N))
