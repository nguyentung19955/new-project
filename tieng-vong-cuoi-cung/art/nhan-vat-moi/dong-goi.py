# Pack frames into uniform cells per animation, anchored on the character's feet (bottom-centre of the dark body).
import json,numpy as np
from PIL import Image, ImageDraw
F=json.load(open('frames.json'))
def anchor(im):
    a=np.array(im).astype(int); dark=(a[...,3]>0)&(a[...,:3].max(2)<90)
    from scipy import ndimage
    lab,n=ndimage.label(dark); 
    if n==0: ys,xs=np.where(a[...,3]>0)
    else:
        big=1+int(np.argmax(ndimage.sum(dark,lab,range(1,n+1)))); ys,xs=np.where(lab==big)
    return int(round(xs.mean())), int(ys.max())
from scipy import ndimage as _nd
def clean(im):
    # drop stray bits cut from neighbouring cells: keep the main body, big pieces (FX arcs) and pieces close to them
    a=np.array(im); op=a[...,3]>0; lab,n=_nd.label(op,structure=np.ones((3,3)))
    if n<=1: return im
    sz=_nd.sum(op,lab,range(1,n+1)); big=1+int(np.argmax(sz))
    keepm=(lab==big)|np.isin(lab,[i+1 for i in range(n) if sz[i]>=150])
    dist=_nd.distance_transform_edt(~keepm)
    for i in range(n):
        m=lab==i+1
        if keepm[m].any(): continue
        if dist[m].min()<=12 and not (np.where(m)[0].min()<=1): keepm|=m
    a[~keepm]=0; return Image.fromarray(a)
ANIMS={}
for d in ['trai','trai-duoi','duoi','phai-duoi','phai','phai-tren','tren','trai-tren']: ANIMS['dung-'+d]=[f'{d}-{i}' for i in range(4)]
for d in ['chay-trai','chay-phai']: ANIMS[d]=[f'{d}-{i}' for i in range(6)]
for s in ['trai','phai']:
    for k in (1,2,3): ANIMS[f'{s}-don{k}']=[f'{s}-don{k}-{i}' for i in range(6)]
info={}
for name,keys in ANIMS.items():
    ims=[clean(Image.open(F[k]['file'])) for k in keys]; anc=[anchor(i) for i in ims]
    L=max(ax for ax,ay in anc); R=max(i.width-ax for i,(ax,ay) in zip(ims,anc))
    U=max(ay for ax,ay in anc); D=max(i.height-ay for i,(ax,ay) in zip(ims,anc))
    W=L+R; H=U+D
    info[name]=dict(frames=len(ims),cell=[W,H],anchor=[L,U])
ALLW=max(v['cell'][0] for v in info.values()); ALLH=max(v['cell'][1] for v in info.values())
AX=max(v['anchor'][0] for v in info.values()); AY=max(v['anchor'][1] for v in info.values())
CW=max(ALLW, AX+max(v['cell'][0]-v['anchor'][0] for v in info.values())); CH=max(ALLH, AY+max(v['cell'][1]-v['anchor'][1] for v in info.values()))
rows=list(ANIMS.items()); maxf=max(len(k) for _,k in rows)
sheet=Image.new('RGBA',(CW*maxf,CH*len(rows)),(0,0,0,0)); meta={'cell':[CW,CH],'anchor':[AX,AY],'anims':{}}
for r,(name,keys) in enumerate(rows):
    for c,k in enumerate(keys):
        im=clean(Image.open(F[k]['file'])); ax,ay=anchor(im); sheet.alpha_composite(im,(c*CW+AX-ax, r*CH+AY-ay))
    meta['anims'][name]={'row':r,'frames':len(keys)}
sheet.save('nhan-vat-moi-sheet.png'); json.dump(meta,open('nhan-vat-moi-sheet.json','w'),indent=1,ensure_ascii=False)
pv=Image.new('RGBA',sheet.size,(234,235,235,255)); pv.alpha_composite(sheet); d=ImageDraw.Draw(pv)
for r,(name,_) in enumerate(rows): d.text((2,r*CH+2),name,fill=(200,0,0,255))
pv.save('xem-sheet.png'); print(CW,CH,AX,AY,sheet.size)
