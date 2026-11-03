# Cắt 5 góc nhìn từ model sheet đã tách nền -> ảnh 128px cùng tỉ lệ, cùng mặt đất
import numpy as np, sys
from PIL import Image
def segs(m):
  cols=m.any(0); out=[];ins=False
  for x,v in enumerate(cols):
    if v and not ins: s=x;ins=True
    if not v and ins: out.append((s,x));ins=False
  if ins: out.append((s,len(cols)))
  return [s for s in out if s[1]-s[0]>40]
def run(src,prefix,H=100,G=116):
  im=Image.open(src).convert('RGBA'); A=np.array(im)[...,3]>0
  ss=segs(A); assert len(ss)==5, ss
  boxes=[]
  for x0,x1 in ss:
    ys,xs=np.nonzero(A[:,x0:x1]); boxes.append((x0+xs.min(),ys.min(),x0+xs.max()+1,ys.max()+1))
  hmax=max(b[3]-b[1] for b in boxes); sc=H/hmax
  for n,b in zip(['s','se','e','ne','n'],boxes):
    c=im.crop(b); r=c.resize((max(1,round(c.width*sc)),max(1,round(c.height*sc))),Image.LANCZOS)
    ra=np.array(r); ra[...,3]=np.where(ra[...,3]>110,255,0); r=Image.fromarray(ra)
    rgb=r.convert('RGB').quantize(64,method=Image.Quantize.FASTOCTREE).convert('RGB'); r=Image.merge('RGBA',(*rgb.split(),r.split()[3]))
    cv=Image.new('RGBA',(128,128)); cv.alpha_composite(r,(round(64-r.width/2),G-r.height)); cv.save(f'{prefix}_{n}.png'); print(n,cv.getbbox())
if __name__=='__main__': run(sys.argv[1],sys.argv[2])
