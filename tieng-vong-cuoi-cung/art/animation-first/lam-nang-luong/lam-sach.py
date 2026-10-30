# Clean the master: remove background-halo pixels left from the AI image's anti-aliasing (pale greys on the outer edge),
# except inside the mask. Repeat until stable. Then drop specks.
import numpy as np
from PIL import Image
a=np.array(Image.open('lam_master_80x128.png'))
H,W=a.shape[:2]
HALO={(148,158,181),(227,236,239)}
col=lambda y,x: tuple(int(v) for v in a[y,x,:3])
# mask region: pale pixels connected to the eyes area (big pale blob in the upper half)
ys,xs=np.where((a[...,3]>0)&(a[...,0]==188)); 
def in_mask(y,x): return 50<=y<=80 and 40<=x<=70
removed=0
for it in range(4):
    kill=[]
    for y in range(H):
        for x in range(W):
            if a[y,x,3] and col(y,x) in HALO and not in_mask(y,x):
                nb=[(y+dy,x+dx) for dy,dx in ((1,0),(-1,0),(0,1),(0,-1))]
                if any(not(0<=p[0]<H and 0<=p[1]<W) or a[p][3]==0 for p in nb):
                    # keep it if it's part of a flame (blue neighbours dominate)
                    blue=sum(1 for p in nb if 0<=p[0]<H and 0<=p[1]<W and a[p][3] and a[p][0]<=8 and a[p][2]>=100)
                    if blue<2: kill.append((y,x))
    for p in kill: a[p][3]=0
    removed+=len(kill)
    if not kill: break
Image.fromarray(a).save('lam_master_80x128.png'); print('removed',removed)
