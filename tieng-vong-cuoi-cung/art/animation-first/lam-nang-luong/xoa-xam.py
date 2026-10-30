# Remove grey halo pixels (148,158,181) around the back flame (x<56, y>=50), where the master never has them.
# Edge grey -> transparent; grey enclosed by flame -> the most common non-grey neighbour colour. Never touches the mask or horns.
import sys,numpy as np
from PIL import Image
from collections import Counter
G=(148,158,181)
for src,dst in zip(sys.argv[1::2],sys.argv[2::2]):
    a=np.array(Image.open(src).convert('RGBA')); H,W=a.shape[:2]; n=0
    for it in range(6):
        g=np.all(a[...,:3]==G,2)&(a[...,3]>0); ys,xs=np.where(g); ch=[]
        for y,x in zip(ys,xs):
            if not(x<56 and y>=50): continue
            nb=[a[y+dy,x+dx] for dy in (-1,0,1) for dx in (-1,0,1) if (dy or dx) and 0<=y+dy<H and 0<=x+dx<W]
            if any(p[3]==0 for p in nb): ch.append((y,x,(0,0,0,0)))
            else:
                c=Counter(tuple(int(v) for v in p) for p in nb if tuple(int(v) for v in p[:3])!=G)
                if c: ch.append((y,x,c.most_common(1)[0][0]))
        for y,x,c in ch: a[y,x]=c; n+=1
        if not ch: break
    Image.fromarray(a).save(dst); print(dst,'changed',n)
