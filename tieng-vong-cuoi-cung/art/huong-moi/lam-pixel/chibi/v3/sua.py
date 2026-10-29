from PIL import Image
import numpy as np
from scipy import ndimage
AMB=(214,140,52);AMB2=(150,86,30);G=(206,142,58);GH=(252,214,120);GD=(110,60,22);OUT=(0,0,0);S1=(214,220,228);S2=(150,158,172)
BELL=["..O..",".OGO.","OGHGO","OGGGO","OOOOO","..D.."]
FORK=["O.O.O","OSOSO","OSOSO","OSSSO",".OSO.",".OSO.",".OSO.","..O.."]
def stamp(o,pat,y0,x0,cmap):
    for j,row in enumerate(pat):
        for i,ch in enumerate(row):
            if ch=='.':continue
            o[y0+j,x0+i,:3]=cmap[ch];o[y0+j,x0+i,3]=255
def trim(o,ylo,yhi):
    rgb=o[...,:3].astype(int);al=o[...,3]>0
    blk=(rgb.max(-1)<20)&al
    dist=ndimage.distance_transform_edt(al)
    void=blk&(dist>=2.5)
    teal=al&(rgb[...,2]>rgb[...,0]+10)&(rgb.max(-1)>35)
    near=ndimage.binary_dilation(void,structure=np.ones((3,3)))
    m=teal&near;m[:ylo]=0;m[yhi:]=0
    o[m,:3]=AMB
cfg={'south-east':dict(bell=(26,25),fork=(28,32),trim=(15,26)),
     'east':dict(bell=(26,27),fork=(27,31),trim=(14,26)),
     'south':dict(bell=(26,21),fork=(27,30),trim=(15,26))}
for name,c in cfg.items():
    o=np.array(Image.open(f'goc-{name}.png'))
    trim(o,*c['trim'])
    stamp(o,BELL,*c['bell'],{'O':GD,'G':G,'H':GH,'D':GD})
    stamp(o,FORK,*c['fork'],{'O':OUT,'S':S1})
    Image.fromarray(o).save(f'sua-{name}.png')
ims=[Image.open(f'{p}-{n}.png') for p in ['goc','sua'] for n in ['east','south-east','south']]
v=Image.new('RGBA',(48*3*6+20,48*2*6+10),(40,46,54,255))
for k,im in enumerate(ims):v.alpha_composite(im.resize((288,288),Image.NEAREST),((k%3)*(288+10),(k//3)*(288+10)))
v.save('so-goc-sua.png')
