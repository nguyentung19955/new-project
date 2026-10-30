# split a saved 1:1 strip (magenta background) into frames. usage: tach-frame.py strip.png outdir w h n per
import sys, os, numpy as np
from PIL import Image
src,out,w,h,n,per=sys.argv[1],sys.argv[2],*map(int,sys.argv[3:7])
os.makedirs(out,exist_ok=True)
a=np.array(Image.open(src).convert('RGBA'))
for k in range(n):
    x0,y0=(k%per)*w,(k//per)*h
    f=a[y0:y0+h,x0:x0+w].copy()
    mag=(f[...,0]>235)&(f[...,1]<25)&(f[...,2]>235)
    f[mag]=0
    Image.fromarray(f).save(f'{out}/{k}.png')
print('ok')
