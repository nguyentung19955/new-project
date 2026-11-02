# cut a ChatGPT grid (rows=directions, cols=frames) into per-direction horizontal sheets of square frames
import sys
from PIL import Image
src,uid,act,dirs,cols=sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4].split(','),int(sys.argv[5])
O='demo/assets/v3/'; C=160; FOOT=150
import numpy as np
from scipy import ndimage
def clean(p):
    a=np.array(p); m=a[:,:,3]>24
    lab,n=ndimage.label(m)
    if n<=1: return p
    sizes=ndimage.sum(m,lab,range(1,n+1)); big=sizes.max()
    keep=np.zeros_like(m)
    for i,sz in enumerate(sizes,1):
        if sz>=big*0.08: keep|=lab==i
    a[:,:,3]=np.where(ndimage.binary_dilation(keep,iterations=2),a[:,:,3],0)
    return Image.fromarray(a)
im=Image.open(src).convert('RGBA'); W,H=im.size; rows=len(dirs)
cw,ch=W/cols,H/rows
ref=Image.open(O+f'{uid}_s.png').convert('RGBA'); refh=ref.getchannel('A').getbbox(); refh=refh[3]-refh[1]
for r,d in enumerate(dirs):
    cells=[]
    for c in range(cols):
        p=im.crop((round(c*cw),round(r*ch),round((c+1)*cw),round((r+1)*ch)))
        cells.append(clean(p))
    # common bbox across row to keep anchor stable
    boxes=[p.getchannel('A').point(lambda v:255 if v>24 else 0).getbbox() for p in cells]
    boxes=[b for b in boxes if b]
    x0=min(b[0] for b in boxes);y0=min(b[1] for b in boxes);x1=max(b[2] for b in boxes);y1=max(b[3] for b in boxes)
    # scale: row S height match static s image height (first frame bbox height)
    if r==0 or 'k' not in dir():
        fb=boxes[0]; k=refh/(fb[3]-fb[1])
    sheet=Image.new('RGBA',(C*cols,C),(0,0,0,0))
    for i,p in enumerate(cells):
        q=p.crop((x0,y0,x1,y1)); q=q.resize((max(1,round(q.width*k)),max(1,round(q.height*k))),Image.LANCZOS)
        if q.width>C: q=q.resize((C,round(q.height*C/q.width)),Image.LANCZOS)
        sheet.alpha_composite(q,(i*C+(C-q.width)//2,max(0,FOOT-q.height)))
    sheet.save(O+f'{uid}_{act}_{d}.png',optimize=True)
    print(uid,act,d,(x1-x0,y1-y0),round(k,3))
