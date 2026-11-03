# Ghép khung ChatGPT đã sửa vào khung PixelLab: chỉ thay vùng khác biệt lớn (vùng hiệu ứng)
import sys, numpy as np
from PIL import Image
from scipy import ndimage
def run(orig_p, gpt_p, out_p, pal_ps=(), vw=1920, vh=897, shot_w=1568):
  o=np.array(Image.open(orig_p).convert('RGBA')).astype(int)
  g=np.array(Image.open(gpt_p).convert('RGB')).astype(float)
  G=g.shape[1]/vw
  css=(vh-20)/148; s0=css*G; l0=(vw-148*css)/2*G; t0=10*G
  al=o[...,3]; ys,xs=np.nonzero(al>0)
  def samp(s,l,t,ys,xs):
    X=np.clip((l+(xs+0.5)*s).astype(int),0,g.shape[1]-1);Y=np.clip((t+(ys+0.5)*s).astype(int),0,g.shape[0]-1)
    return g[Y,X]
  best=None
  for ds in np.linspace(-0.04,0.04,9):
    for dl in range(-14,15,2):
      for dt in range(-14,15,2):
        s=s0*(1+ds);c=samp(s,l0+dl,t0+dt,ys,xs)
        e=np.median(np.abs(c-o[ys,xs,:3]).max(1))
        if best is None or e<best[0]: best=(e,s,l0+dl,t0+dt)
  e,s,l,t=best
  # tinh chỉnh 1px
  for dl in range(-2,3):
    for dt in range(-2,3):
      c=samp(s,l+dl*0.5,t+dt*0.5,ys,xs); ee=np.median(np.abs(c-o[ys,xs,:3]).max(1))
      if ee<e: e,l2,t2=ee,l+dl*0.5,t+dt*0.5; best=(e,s,l2,t2)
  e,s,l,t=best
  H,W=al.shape; YY,XX=np.mgrid[0:H,0:W]
  gc=samp(s,l,t,YY.ravel(),XX.ravel()).reshape(H,W,3)
  bgc=np.median(g[5:40,5:40].reshape(-1,3),0)
  gop=np.abs(gc-bgc).max(2)>24
  oop=al>0
  d=np.abs(gc-o[...,:3]).max(2)
  cand=(oop&~gop)|(~oop&gop)|(oop&gop&(d>70))
  cand=ndimage.binary_opening(cand,structure=np.ones((2,2)))
  cand=ndimage.binary_dilation(cand,iterations=1)
  pal=[o[oop][:,:3]]
  for p in pal_ps:
    pa=np.array(Image.open(p).convert('RGBA')).astype(int); pal.append(pa[pa[...,3]>0][:,:3])
  pal=np.unique(np.vstack(pal),axis=0)
  pal=pal[~((np.minimum(np.minimum(pal[:,0],pal[:,1]),pal[:,2])>238)&(pal[:,2]>=pal[:,0]))]
  out=o.copy()
  for y,x in zip(*np.nonzero(cand)):
    if not gop[y,x]: out[y,x,3]=0; continue
    j=np.argmin(((pal-gc[y,x])**2).sum(1)); out[y,x,:3]=pal[j]; out[y,x,3]=255
  # bỏ mảnh vụn rời
  m=out[...,3]>0; lb,k=ndimage.label(m,structure=np.ones((3,3)))
  if k>1:
    sz=ndimage.sum(m,lb,range(1,k+1)); mx=np.argmax(sz)+1
    for j in range(1,k+1):
      if j!=mx and sz[j-1]<20: out[...,3][lb==j]=0
  Image.fromarray(out.astype('uint8')).save(out_p)
  print('sai số khớp',round(e,1),'số điểm thay',int(cand.sum()))
if __name__=='__main__': run(sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4:])
