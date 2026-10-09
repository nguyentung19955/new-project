import sys, numpy as np
from PIL import Image
from scipy import ndimage
name=sys.argv[1]
im=np.array(Image.open(name+'_parts.png').convert('RGB')).astype(int)
bg=np.median(np.concatenate([im[:5].reshape(-1,3),im[-5:].reshape(-1,3)]),axis=0)
diff=np.abs(im-bg).sum(2)
mask=diff>45
mask=ndimage.binary_closing(mask,iterations=3)
mask=ndimage.binary_fill_holes(mask)
lab,n=ndimage.label(mask)
objs=ndimage.find_objects(lab)
parts=[]
for i,s in enumerate(objs):
    area=(lab[s]==i+1).sum()
    if area<1500: continue
    parts.append((s,i+1,area))
parts.sort(key=lambda p:(p[0][0].start//150,p[0][1].start))
rgba=np.dstack([im.astype(np.uint8),np.zeros(im.shape[:2],np.uint8)])
for k,(s,l,a) in enumerate(parts):
    sub=rgba[s].copy(); m=(lab[s]==l)
    # soft alpha from diff
    al=np.clip((diff[s]-15)*6,0,255).astype(np.uint8); al[~ndimage.binary_dilation(m,iterations=2)]=0
    al[m & (al<255)] = np.maximum(al[m & (al<255)], 0)
    al=np.where(ndimage.binary_erosion(m,iterations=2),255,al)
    sub[...,3]=al
    Image.fromarray(sub).save(f'{name}_p{k}.png')
    print(k, s[1].start, s[0].start, s[1].stop-s[1].start, s[0].stop-s[0].start, a)
