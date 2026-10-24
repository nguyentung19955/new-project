import numpy as np
from PIL import Image
from scipy import ndimage
im=np.array(Image.open('parts.png').convert('RGB')).astype(int)
H,W,_=im.shape
# background: near-white connected to border
nw=(im.min(2)>235)
lab,n=ndimage.label(nw)
bg=np.isin(lab,np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))
bg&=nw
fg=~bg
fg=ndimage.binary_opening(fg,iterations=1)
lab,n=ndimage.label(fg)
objs=ndimage.find_objects(lab)
out=[]
for i,s in enumerate(objs):
    area=(lab[s]==i+1).sum()
    if area<400: continue
    out.append((s[0].start,s[1].start,s[0].stop,s[1].stop,area,i+1))
out.sort(key=lambda t:(t[0]//150,t[1]))
rgba=np.dstack([im,(~bg*255)]).astype(np.uint8)
for k,(y0,x0,y1,x1,a,li) in enumerate(out):
    m=(lab[y0:y1,x0:x1]==li)
    # include holes (interior white) -> fill holes
    m=ndimage.binary_fill_holes(m)
    c=rgba[y0:y1,x0:x1].copy(); c[...,3]=np.where(m,255,0)
    Image.fromarray(c).save(f'p{k:02d}.png')
    print(k,(x0,y0,x1-x0,y1-y0),a)
print(W,H)
