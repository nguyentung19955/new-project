import math, numpy as np, sys
from PIL import Image, ImageDraw
from scipy import ndimage
def defringe(im):
    a=np.array(im.convert('RGBA')); al=a[...,3]>0
    inner=ndimage.binary_erosion(al,iterations=1); edge=al&~ndimage.binary_erosion(al,iterations=4)
    a[~(inner&~(edge&(a[...,:3].min(2)>170))),3]=0; return Image.fromarray(a)
P={n:defringe(Image.open(n+'.png')) for n in ['mu','mat','chop-mu','than','capelet-sau','capelet-truoc','vat-sau','vat-truoc','dai','bao-dao','chuong','dao',
 'tay-tren-gan','cang-tay-gan','gang-gan','tay-tren-xa','cang-tay-xa','gang-xa','dui-gan','cang-chan-gan','ung-gan','dui-xa','cang-chan-xa','ung-xa']}
def T_(x,y): return np.array([[1,0,x],[0,1,y],[0,0,1.]])
def R_(a):
    c,s=math.cos(math.radians(a)),math.sin(math.radians(a)); return np.array([[c,-s,0],[s,c,0],[0,0,1.]])
def S_(k): return np.array([[k,0,0],[0,k,0],[0,0,1.]])
def place(pos,a,piv,k): return T_(*pos)@R_(a)@S_(k)@T_(-piv[0],-piv[1])
def app(M,p): return (M@np.array([p[0],p[1],1.]))[:2]
def ang(v): return math.degrees(math.atan2(v[1],v[0]))
def put(cv,img,M):
    Mi=np.linalg.inv(M); cv.alpha_composite(img.transform(cv.size,Image.AFFINE,tuple(Mi[:2].flatten()),Image.BICUBIC))
B=0.65
# khớp chi (toạ độ ảnh gốc): P gần, D xa
J={'tay-tren':((82,28),(45,88)),'cang-tay':((22,42),(86,66)),'gang':((30,55),(90,55)),
   'dui':((62,30),(45,100)),'cang-chan':((40,22),(40,82)),'ung':((52,24),(52,90))}
def chain(names,root,angles,k=B):
    out=[];pos=np.array(root,float)
    for n,a in zip(names,angles):
        base=n.rsplit('-',1)[0]; p,d=J[base]; rest=ang(np.subtract(d,p))
        M=place(pos,a-rest,p,k); out.append((P[n],M)); pos=app(M,d)
    return out,pos
