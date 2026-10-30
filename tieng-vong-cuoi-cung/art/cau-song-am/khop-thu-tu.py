# Tim thu tu khung: so tung o trong anh tham chieu (luoi 5 cot) voi cac khung tren dia.
# usage: khop-thu-tu.py ref.png don1 6
import sys, numpy as np
from PIL import Image
ref,k,n=sys.argv[1],sys.argv[2],int(sys.argv[3])
R=np.array(Image.open(ref).convert('RGB')).astype(float); s=R.shape[1]/1920
import glob
F={int(p.split('_')[-1][:-4]):np.array(Image.open(p).convert('RGBA')).astype(float) for p in glob.glob(f'frames/{k}_*.png')}
out=[]
for i in range(n):
    x=((i%5)*384+112)*s; y=((i//5)*448+144)*s; w=160*s
    crop=Image.fromarray(R[int(y):int(y+w),int(x):int(x+w)].astype(np.uint8)).resize((80,80),Image.BILINEAR)
    c=np.array(crop).astype(float)
    best=min(F,key=lambda f:(np.abs(c-np.where(F[f][...,3:]>0,F[f][...,:3],[255,0,255]))).mean())
    out.append(best)
print(','.join(map(str,out)))
