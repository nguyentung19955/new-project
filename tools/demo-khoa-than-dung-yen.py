# Khoá phần đứng yên: các vùng chỉ khác khung 1 chút (nét vẽ lại lệch) lấy theo khung 1 -> hết rung; vùng thay đổi lớn (tay, súng) giữ của từng khung.
import sys,os,numpy as np
from PIL import Image
from scipy import ndimage
src,dst,W=sys.argv[1],sys.argv[2],int(sys.argv[3]); T=float(os.environ.get('T',38))
im=np.array(Image.open(src).convert('RGBA')).astype(float); n=im.shape[1]//W
F=[im[:,k*W:(k+1)*W] for k in range(n)]; f0=F[0]
def g(x): return x[...,:3].mean(2)*(x[...,3]/255)
out=[f0]
for k in range(1,n):
    fk=F[k]
    # căn lệch nguyên điểm ảnh theo vùng thân (tương quan)
    a,b=g(f0),g(fk); c=np.real(np.fft.ifft2(np.fft.fft2(a)*np.conj(np.fft.fft2(b)))); i=np.unravel_index(np.argmax(c),c.shape)
    dy,dx=[(v if v<s//2 else v-s) for v,s in zip(i,c.shape)]
    if abs(dy)<=3 and abs(dx)<=3: fk=np.roll(np.roll(fk,dy,0),dx,1)
    d=np.abs(fk-f0).sum(2)/4
    m=ndimage.gaussian_filter(d,3)>T
    m=ndimage.binary_opening(m,iterations=2); m=ndimage.binary_dilation(m,iterations=6)
    m=(m.astype(float) if os.environ.get('CUNG')=='1' else ndimage.gaussian_filter(m.astype(float),2))[...,None]   # CUNG=1: mặt nạ cứng cho pixel art (không pha màu)
    out.append(fk*m+f0*(1-m))
Image.fromarray(np.concatenate(out,1).clip(0,255).astype(np.uint8)).save(dst)
print('ok',n)
