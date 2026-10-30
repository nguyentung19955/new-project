# Lean forward by whole-row shift (like nghieng.py), but the white mask rows share ONE shift,
# so the face never gets a 1px jog. Moves pixels only; never adds or redraws.
import sys,numpy as np
from PIL import Image
LEAN=float(sys.argv[1]); src=sys.argv[2]; dst=sys.argv[3]
MASK=(227,236,239)
for k in range(8):
    a=np.array(Image.open(f'{src}/{k}.png').convert('RGBA')); H,W=a.shape[:2]
    ys=np.where(a[...,3].any(1))[0]; top,foot=ys.min(),ys.max()
    sh=[int(round(LEAN*(foot-y)/(foot-top))) if y<=foot else 0 for y in range(H)]
    m=np.all(a[...,:3]==MASK,axis=2)&(a[...,3]>0)
    my=np.where(m.any(1))[0]
    if len(my):
        mt,mb=my.min()-2,my.max()+2   # eyes/outline just around the mask too
        c=sh[(mt+mb)//2]
        for y in range(mt,mb+1): sh[y]=c
    out=np.zeros_like(a)
    for y in range(H):
        s=sh[y]
        if s>0: out[y,s:]=a[y,:W-s]
        else: out[y]=a[y]
    Image.fromarray(out).save(f'{dst}/{k}.png')
