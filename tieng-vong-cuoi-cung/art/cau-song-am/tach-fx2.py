# Tach hieu ung lua tu anh ChatGPT (luoi 4x2 o rong), khop voi khung 80x80 goc.
# usage: tach-fx2.py anh.png don1 "3,4,5,6,7,8,1,2"   (thu tu: frame so may cua don, theo o 1..8)
import sys, numpy as np
from PIL import Image
from scipy import ndimage
src,k,order=sys.argv[1],sys.argv[2],[int(v) for v in sys.argv[3].split(',')]
COLS=int(sys.argv[4]) if len(sys.argv)>4 else 4; CW=1920/COLS; ROW0=int(sys.argv[5]) if len(sys.argv)>5 else 0
G=np.array(Image.open(src).convert('RGB')).astype(int); H,W,_=G.shape
s=W/1920.0
PAD=80; OW=80+2*PAD
PAL=np.array([[255,255,255],[150,240,255],[70,170,255],[40,90,220],[25,45,120]])
def mag(p): return (p[...,0]>150)&(p[...,2]>150)&(p[...,1]<110)
for i,fn in enumerate(order):
    fr=np.array(Image.open(f'frames/{k}_{fn}.png')).astype(int); a=fr[...,3]>0
    cx,cy=(i%COLS)*CW*s,(i//COLS+ROW0)*448*s; cw,ch=CW*s,448*s
    x1,y1,x2,y2=int(cx+8),int(cy+8),int(cx+cw-8),int(min(H,cy+ch-8))
    sub=G[y1:y2,x1:x2]
    dk=(~mag(sub))&(sub.max(-1)<95)&(np.abs(sub[...,0]-sub[...,1])+np.abs(sub[...,1]-sub[...,2])>6)
    lab,n=ndimage.label(dk)
    big=lab==(np.argmax(ndimage.sum(dk,lab,range(1,n+1)))+1)
    ys,xs=np.nonzero(big); od=a&(fr[...,:3].max(-1)<95); oys,oxs=np.nonzero(od)
    sc=((xs.max()-xs.min()+1)/(oxs.max()-oxs.min()+1)+(ys.max()-ys.min()+1)/(oys.max()-oys.min()+1))/2
    bx=x1+xs.min()-oxs.min()*sc; by=y1+ys.max()+1-(oys.max()+1)*sc
    keep=ndimage.binary_dilation(a,iterations=2)
    out=np.zeros((OW,OW,4),np.uint8)
    for y in range(OW):
        for x in range(OW):
            fx,fy=x-PAD,y-PAD
            if 0<=fx<80 and 0<=fy<80 and keep[fy,fx]: continue
            gx=bx+(fx+0.5)*sc; gy=by+(fy+0.5)*sc
            if not(x1<=gx<x2 and y1<=gy<y2): continue
            p=G[int(gy),int(gx)]
            if mag(p[None])[0] or p[2]<110 or (p[2]-p[0]<20 and p.min()<200): continue
            out[y,x,:3]=PAL[np.argmin(((PAL-p)**2).sum(1))]; out[y,x,3]=255
    m=out[...,3]>0; lab,n=ndimage.label(m,structure=np.ones((3,3)))
    for j,sz in enumerate(ndimage.sum(m,lab,range(1,n+1))):
        if sz<3: out[lab==j+1]=0
    edge=int(m[0].sum()+m[-1].sum()+m[:,0].sum()+m[:,-1].sum())
    Image.fromarray(out).save(f'fx/{k}_{fn}.png'); print(fn,round(sc,2),int(out[...,3].astype(bool).sum()),'edge',edge)
