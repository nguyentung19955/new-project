from PIL import Image
import numpy as np, sys
from scipy import ndimage
K=float(sys.argv[1]) if len(sys.argv)>1 else 0.8
G=int(sys.argv[2]) if len(sys.argv)>2 else 108
D='/root/neon/docs/demo-hop-tuong/nguon-tuong/sentinel/'
def segs(m):
  cols=m.any(0); out=[];ins=False
  for x,v in enumerate(cols):
    if v and not ins: s=x;ins=True
    if not v and ins: out.append((s,x));ins=False
  if ins: out.append((s,len(cols)))
  return [s for s in out if s[1]-s[0]>30]
im=Image.open(D+'sentinel_model4.png').convert('RGBA'); A=np.array(im)[...,3]>40
bx={}
for n,(x0,x1) in zip(['s','se','e','ne','n_old'],segs(A)):
  ys,xs=np.nonzero(A[:,x0:x1]); bx[n]=(x0+xs.min(),ys.min(),x0+xs.max()+1,ys.max()+1)
ground=bx['ne'][3]
sc=0.284*K
def place(c,s,feet_from_top,cx,name):
  r=c.resize((max(1,round(c.width*s)),max(1,round(c.height*s))),Image.LANCZOS)
  ra=np.array(r); ra[...,3]=np.where(ra[...,3]>110,255,0); r=Image.fromarray(ra)
  rgb=r.convert('RGB').quantize(32,method=Image.MEDIANCUT).convert('RGB'); r=Image.merge('RGBA',(*rgb.split(),r.split()[3]))
  px=round(64-cx*s); py=round(G-feet_from_top*s)
  cv=Image.new('RGBA',(128,128)); cv.alpha_composite(r,(px,py)); print(name,cv.getbbox()); cv.save(D+f'sentinel_pl2_ref_{name}.png')
def hood_top(sub,f=0.6):
  w=sub.shape[1]; yy=np.nonzero(sub[:, :int(w*f)].any(1))[0]; return yy.min()
for n in ['s','se','e','ne']:
  b=bx[n]; sub=A[b[1]:b[3],b[0]:b[2]]; rows=sub[:int(sub.shape[0]*0.2)]; xs=np.nonzero(rows.any(0))[0]
  place(im.crop(b),sc,ground-b[1],(xs.min()+xs.max())/2,n)
im2=Image.open(D+'sentinel_n2.png').convert('RGBA'); a2=np.array(im2)[...,3]>40
l,k=ndimage.label(a2); sz=ndimage.sum(a2,l,range(1,k+1)); keep=np.isin(l,np.nonzero(sz>500)[0]+1)
arr=np.array(im2); arr[...,3]=np.where(keep,arr[...,3],0); im2=Image.fromarray(arr)
ys,xs=np.nonzero(keep); b2=(xs.min(),ys.min(),xs.max()+1,ys.max()+1); sub=keep[b2[1]:b2[3],b2[0]:b2[2]]
o=bx['n_old']; so=A[o[1]:o[3],o[0]:o[2]]
ho=(o[3]-o[1])-hood_top(so); hn=sub.shape[0]-hood_top(sub); s2=sc*ho/hn
ht=hood_top(sub); rows=sub[ht:ht+int(hn*0.2), :int(sub.shape[1]*0.75)]; xs2=np.nonzero(rows.any(0))[0]
place(im2.crop(b2),s2,sub.shape[0],(xs2.min()+xs2.max())/2,'n')
