import sys;from PIL import Image;import numpy as np
d=sys.argv[1];P='/root/neon/demo/assets/v3/pixel/'
a=Image.open(P+f'patchwork_atk_{d}.png');f=Image.new('RGBA',(224,224));f.paste(a.crop((0,0,224,176)),(0,48))
A=np.array(f);m=A[:,:,3]>0;ys=np.nonzero(m.any(1))[0];t,b=ys[0],ys[-1];sp=int(t+0.62*(b-t))
out=Image.new('RGBA',(896,224))
for j,k in enumerate([0,2,4,2]):
  B=A.copy()
  if k: B[k:sp]=A[:sp-k]; B[:k]=0
  out.paste(Image.fromarray(B),(j*224,0))
out.save(P+f'patchwork_idle_{d}.png');print(d,t,b)
