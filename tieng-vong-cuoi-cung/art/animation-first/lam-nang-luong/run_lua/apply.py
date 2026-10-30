import sys,numpy as np
from PIL import Image
PAL=["18,35,75","7,181,251","16,226,253","5,149,247","28,48,90","t","3,116,228","10,23,57","3,8,26","4,89,197","38,61,105","6,71,164","119,224,248","227,236,239","8,50,117","47,75,125"]
src,diff,dst=sys.argv[1:4]
a=np.array(Image.open(src).convert('RGBA'))
n=0
for t in open(diff).read().split():
    x,y,i=map(int,t.split('.')); c=PAL[i]
    a[y,x]=(0,0,0,0) if c=='t' else (*map(int,c.split(',')),255); n+=1
Image.fromarray(a).save(dst); print(n)
