# Extract ChatGPT's horned side figure at its native pixel grid (no redraw).
import numpy as np
from PIL import Image
src=np.asarray(Image.open('chatgpt_lam_master_v1.png').convert('RGB')).astype(float)
X0,Y0,X1,Y1=470,40,900,640
reg=src[Y0:Y1,X0:X1]
def cost(g,ox,oy):
    h,w,_=reg.shape; tot=0;n=0
    for cy in np.arange(oy,h-g,g):
        for cx in np.arange(ox,w-g,g):
            c=reg[int(cy)+1:int(cy+g)-1,int(cx)+1:int(cx+g)-1]
            if c.size: tot+=c.var(axis=(0,1)).sum(); n+=1
    return tot/n
best=None
for g in np.arange(4.6,5.6,0.1):
    for ox in np.arange(0,g,1):
        for oy in np.arange(0,g,1):
            c=cost(g,ox,oy)
            if best is None or c<best[0]: best=(c,g,ox,oy)
print(best)
