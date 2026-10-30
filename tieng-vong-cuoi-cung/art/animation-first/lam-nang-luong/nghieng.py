# Forward lean by whole-row shift: every pixel row of the whole frame moves right by an amount proportional to its
# height above the feet (feet row = 0 px, top = LEAN px). Rows move intact, nothing is redrawn or added.
import sys, numpy as np
from PIL import Image
LEAN=float(sys.argv[1]); src=sys.argv[2]; dst=sys.argv[3]
for k in range(8):
    a=np.array(Image.open(f'{src}/{k}.png')); H,W=a.shape[:2]
    ys=np.where(a[...,3].any(1))[0]; top,foot=ys.min(),ys.max()
    out=np.zeros_like(a)
    for y in range(H):
        s=int(round(LEAN*(foot-y)/(foot-top))) if y<=foot else 0
        if s>0: out[y,s:]=a[y,:W-s]
        else: out[y]=a[y]
    Image.fromarray(out).save(f'{dst}/{k}.png')
