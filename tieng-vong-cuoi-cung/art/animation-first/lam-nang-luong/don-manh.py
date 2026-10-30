# Remove only floating pixels: pieces not attached to the main body. Never adds or redraws pixels.
# A detached piece is kept only if it is flame-coloured AND within 2 px of the body (a flame wisp, like the master has).
import sys, numpy as np
from PIL import Image
from collections import deque
FLC={(4,89,197),(119,224,248),(3,116,228),(5,149,247),(7,181,251),(16,226,253),(6,71,164),(8,50,117)}
def comps(op):
    H,W=op.shape; seen=np.zeros_like(op); out=[]
    for y in range(H):
        for x in range(W):
            if op[y,x] and not seen[y,x]:
                q=deque([(y,x)]); seen[y,x]=1; c=[]
                while q:
                    cy,cx=q.popleft(); c.append((cy,cx))
                    for dy in (-1,0,1):
                        for dx in (-1,0,1):
                            ny,nx=cy+dy,cx+dx
                            if 0<=ny<H and 0<=nx<W and op[ny,nx] and not seen[ny,nx]: seen[ny,nx]=1; q.append((ny,nx))
                out.append(c)
    return sorted(out,key=len,reverse=True)
for src,dst in zip(sys.argv[1::2],sys.argv[2::2]):
    a=np.array(Image.open(src)); op=a[...,3]>0
    cs=comps(op); main=np.zeros_like(op)
    for p in cs[0]: main[p]=1
    ys,xs=np.where(main); removed=0
    for c in cs[1:]:
        flame=all(tuple(int(v) for v in a[p][:3]) in FLC for p in c)
        near=min(np.min(np.abs(ys-p[0])+np.abs(xs-p[1])) for p in c)<=3
        if not(flame and near):
            for p in c: a[p][3]=0
            removed+=len(c)
    Image.fromarray(a).save(dst); print(dst,'removed',removed,'px')
