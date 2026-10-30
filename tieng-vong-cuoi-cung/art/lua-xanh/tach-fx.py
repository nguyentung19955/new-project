# Tach hieu ung lua (ChatGPT ve) ra khoi anh luoi 3x3, can chinh ve khung 80x80 goc.
# usage: tach-fx.py gpt.png don1  (gpt.png: anh crop luoi, o (x0,y0), moi o 'cell' px)
import sys, numpy as np
from PIL import Image
from scipy import ndimage
src,k=sys.argv[1],sys.argv[2]; x0,y0,cell=[float(v) for v in sys.argv[3:6]]
G=np.array(Image.open(src).convert('RGB')).astype(int)
H,W,_=G.shape
PAD=24; OW=80+2*PAD   # fx canvas wider than cell: 128x128, offset PAD
PAL=np.array([[255,255,255],[150,240,255],[70,170,255],[40,90,220],[25,45,120]])
def mag(p): return (p[...,0]>150)&(p[...,2]>150)&(p[...,1]<110)
for i in range(9):
    c,r=i%3,i//3
    fr=np.array(Image.open(f'frames/{k}_{i+1}.png')).astype(int)
    a=fr[...,3]>0
    s=cell/80
    ox,oy=x0+c*cell, y0+r*cell
    # fit: dark body mask bbox in both
    sub=G[int(oy):int(oy+cell),int(ox):int(ox+cell)]
    dk=(~mag(sub))&(sub.max(-1)<95)
    lab,n=ndimage.label(dk); 
    if n==0: continue
    big=lab==(np.argmax(ndimage.sum(dk,lab,range(1,n+1)))+1)
    ys,xs=np.nonzero(big)
    od=a&(fr[...,:3].max(-1)<95); oys,oxs=np.nonzero(od)
    sx=(xs.max()-xs.min()+1)/(oxs.max()-oxs.min()+1); sy=(ys.max()-ys.min()+1)/(oys.max()-oys.min()+1)
    sc=(sx+sy)/2
    bx=ox+xs.min()-oxs.min()*sc; by=oy+ys.max()+1-(oys.max()+1)*sc  # align left & feet
    out=np.zeros((OW,OW,4),np.uint8)
    keep=ndimage.binary_dilation(a,iterations=2)
    for y in range(OW):
        for x in range(OW):
            fx,fy=x-PAD,y-PAD
            if 0<=fx<80 and 0<=fy<80 and keep[fy,fx]: continue
            gx=bx+(fx+0.5)*sc; gy=by+(fy+0.5)*sc
            # stay inside this cell (plus small margin)
            if not(ox-4<=gx<ox+cell+4 and oy-4<=gy<oy+cell+4) or not(0<=gx<W and 0<=gy<H): continue
            p=G[int(gy),int(gx)]
            if mag(p[None])[0]: continue
            if p[2]<110 or p[2]-p[0]<20 and p.min()<200: continue   # only blue/white fire
            q=PAL[np.argmin(((PAL-p)**2).sum(1))]
            out[y,x,:3]=q; out[y,x,3]=255
    m=out[...,3]>0; lab,n=ndimage.label(m,structure=np.ones((3,3)))
    for j,sz in enumerate(ndimage.sum(m,lab,range(1,n+1))):
        if sz<3: out[lab==j+1]=0
    Image.fromarray(out).save(f'fx/{k}_{i+1}.png'); print(i+1,round(sc,2),int(m.sum()))
