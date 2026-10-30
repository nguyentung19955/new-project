# Cut the character sheet into frames. Background (near-white) and the soft grey floor shadow become transparent.
import json,os,numpy as np
from PIL import Image
from scipy import ndimage
src=np.array(Image.open('sheet-goc.png').convert('RGB')).astype(int)
r,g,b=src[...,0],src[...,1],src[...,2]
mx=src.max(2); mn=src.min(2)
bg=(mn>232)                                   # paper white
shadow=(mx-mn<14)&(mn>150)&(mn<=232)          # soft grey floor shadow
fg=~(bg|shadow)
lab,n=ndimage.label(fg,structure=np.ones((3,3)))
objs=ndimage.find_objects(lab); areas=ndimage.sum(np.ones_like(lab),lab,range(1,n+1))
cents=ndimage.center_of_mass(fg,lab,range(1,n+1))
G={
 'idle':dict(xs=[449,582,712,845,978,1121,1263,1411],ys=[130,200,268,333],box=(390,85,1470,370),
             names=['trai','trai-duoi','duoi','phai-duoi','phai','phai-tren','tren','trai-tren'],axis='col'),
 'run':dict(xs=[592,730,870,1010,1152,1297],ys=[475,572],box=(530,425,1360,620),names=['chay-trai','chay-phai'],axis='row'),
 'comboL':dict(xs=[187,290,392,495,588,683],ys=[742,836,936],box=(130,695,770,995),names=['trai-don1','trai-don2','trai-don3'],axis='row'),
 'comboR':dict(xs=[928,1013,1135,1255,1372,1465],ys=[742,836,936],box=(903,705,1530,995),names=['phai-don1','phai-don2','phai-don3'],axis='row'),
}
out={}
os.makedirs('frames',exist_ok=True)
for key,gd in G.items():
    x0,y0,x1,y1=gd['box']; cells={}
    if key=='idle':
        for ri,cy in enumerate(gd['ys']):
            for ci,cx in enumerate(gd['xs']):
                bx0,bx1,by0,by1=cx-64,cx+64,cy-34,cy+34
                m=fg[by0:by1,bx0:bx1]
                l2,n2=ndimage.label(m,structure=np.ones((3,3)))
                keep=np.zeros_like(m)
                for j in range(1,n2+1):
                    if (l2==j).sum()>=4: keep|=(l2==j)
                ys,xs=np.where(keep); X0,X1,Y0,Y1=xs.min(),xs.max()+1,ys.min(),ys.max()+1
                crop=src[by0+Y0:by0+Y1,bx0+X0:bx0+X1]; alpha=(keep[Y0:Y1,X0:X1]*255).astype(np.uint8)
                fn=f"frames/{gd['names'][ci]}-{ri}.png"; Image.fromarray(np.dstack([crop.astype(np.uint8),alpha])).save(fn)
                out[f"{gd['names'][ci]}-{ri}"]=dict(file=fn,bbox=[int(bx0+X0),int(by0+Y0),int(bx0+X1),int(by0+Y1)])
        continue
    for i in range(n):
        if areas[i]<4: continue
        cy,cx=cents[i]
        if not(x0<=cx<=x1 and y0<=cy<=y1): continue
        ci=int(np.argmin([abs(cx-x) for x in gd['xs']])); ri=int(np.argmin([abs(cy-y) for y in gd['ys']]))
        cells.setdefault((ri,ci),[]).append(i+1)
    for (ri,ci),ids in cells.items():
        m=np.isin(lab,ids); ys,xs=np.where(m)
        bx0,bx1,by0,by1=xs.min(),xs.max()+1,ys.min(),ys.max()+1
        crop=src[by0:by1,bx0:bx1]; alpha=(m[by0:by1,bx0:bx1]*255).astype(np.uint8)
        im=Image.fromarray(np.dstack([crop.astype(np.uint8),alpha]))
        name=(gd['names'][ci] if gd['axis']=='col' else gd['names'][ri]); idx=(ri if gd['axis']=='col' else ci)
        fn=f'frames/{name}-{idx}.png'; im.save(fn)
        out[f'{name}-{idx}']=dict(file=fn,bbox=[int(bx0),int(by0),int(bx1),int(by1)])
json.dump(out,open('frames.json','w'),indent=0)
print(len(out))
