import numpy as np, sys
from PIL import Image
A='/home/claude/new-project/docs/demo-hop-tuong/thap-art/'
OUT='/home/claude/new-project/thap/assets/'
rows={'BUFF1':['dmg','toc','crit','max'],'BUFF2':['cham','khien','chet','mana']}
F=224
WARM={'dmg','toc','max','khien'}
def key(cell,n=''):
    p=cell.astype(np.float32)
    p[:7,:]=255*np.array([1,0,1]);p[-16:,:]=255*np.array([1,0,1]);p[:,:7]=255*np.array([1,0,1]);p[:,-7:]=255*np.array([1,0,1])
    M=np.array([255,0,255],np.float32)
    d=np.sqrt(((p-M)**2).sum(-1))
    a=np.clip((d-38)/(115-38),0,1)
    # despill: p = a*fg + (1-a)*M
    fg=(p-(1-a[...,None])*M)/np.maximum(a[...,None],1e-3)
    fg=np.clip(fg,0,255)
    r,g,b=fg[...,0],fg[...,1],fg[...,2]
    if n in WARM or n=='chet': sp=np.clip(np.minimum(r,b)-g,0,None)
    elif n=='cham': sp=np.clip(r-g,0,None)
    else: sp=np.zeros_like(r)
    if n in WARM or n in ('chet','cham'):
        a=a*(1-np.clip(sp/150,0,1)); fg[...,0]-=sp; fg[...,2]-=sp*(0 if n=='cham' else 1); fg=np.clip(fg,0,255)
    return np.dstack([fg,a*255]).astype(np.uint8)
for sh,names in rows.items():
    im=np.array(Image.open(A+'raw_fx_%s.png'%sh).convert('RGB'))
    H,W,_=im.shape; cs=H/4
    print(sh, 'corner', im[3,3], im[H//2, 3])
    for r,n in enumerate(names):
        cells=[key(im[int(r*cs):int((r+1)*cs), int(c*cs):int((c+1)*cs)].copy(),n) for c in range(4)]
        # bbox of frame1 alpha → circularise + center
        al=cells[0][...,3]>40; ys,xs=np.where(al)
        x0,x1,y0,y1=xs.min(),xs.max(),ys.min(),ys.max(); w=x1-x0; h=y1-y0
        sy=min(1.3,max(1.0,w/h)); cx=(x0+x1)/2; cy=(y0+y1)/2
        print(n,'bbox',w,h,'sy',round(sy,2))
        strip=Image.new('RGBA',(F*4,F))
        for c,cell in enumerate(cells):
            ci=Image.fromarray(cell,'RGBA'); cw,ch=ci.size
            ci=ci.resize((cw,int(ch*sy)),Image.LANCZOS)
            # place so (cx,cy*sy) at center of a canvas sized side
            side=int(max(cw,ch*sy)*1.0)
            can=Image.new('RGBA',(side,side))
            can.paste(ci,(int(side/2-cx),int(side/2-cy*sy)),ci)
            can=can.resize((F,F),Image.LANCZOS)
            q=np.array(can).astype(np.float32); yy,xx=np.mgrid[0:F,0:F]
            ed=np.minimum(np.minimum(xx,F-1-xx),np.minimum(yy,F-1-yy)); q[...,3]*=np.clip(ed/14,0,1) # mép khung mềm: không lộ cạnh vuông
            q[...,3][q[...,3]<6]=0
            can=Image.fromarray(q.astype(np.uint8),'RGBA')
            strip.paste(can,(c*F,0))
        strip.save(OUT+'fxb_%s.png'%n, optimize=True)
