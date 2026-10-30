# Split the approved Lam master into 7 modules (pixel-exact). Hidden areas are filled once by copying edge rows
# (collar under the hood, leg tops under the cloak) so moving parts never reveal holes.
import numpy as np
from PIL import Image
m=np.array(Image.open('lam_master_80x128.png'))
H,W=m.shape[:2]
r,g,b,a=[m[...,i].astype(int) for i in range(4)]
op=a>0
FLC={(4,84,191),(87,224,249),(3,114,226),(5,148,247),(6,180,251),(14,226,253),(7,68,155),(7,47,111)}
blue=np.zeros_like(op)
for c in FLC: blue|=op&(r==c[0])&(g==c[1])&(b==c[2])
flame=blue.copy()
pale=op&(r==188)
for y in range(H):
    for x in range(W):
        if pale[y,x]:
            nb=[(y+dy,x+dx) for dy in (-1,0,1) for dx in (-1,0,1) if (dy or dx) and 0<=y+dy<H and 0<=x+dx<W]
            if sum(blue[p] for p in nb)>=3: flame[y,x]=True
solid=op&~flame
Y,X=np.mgrid[0:H,0:W]
mods={}
mods['horns']=flame&(Y<48)&(X>=30)
mods['back_flames']=flame&(X<33)&(Y>=48)
mods['front_energy']=flame&(X>=56)&(Y>=70)
rest_flame=flame&~(mods['horns']|mods['back_flames']|mods['front_energy'])
HOOD_BOT=66; COLLAR_BOT=78; LEG_TOP=112
mods['hood_mask']=(solid&(Y<HOOD_BOT))|(rest_flame&(Y<HOOD_BOT))
mods['collar']=(solid|rest_flame)&(Y>=HOOD_BOT)&(Y<COLLAR_BOT)
mods['cloak']=(solid|rest_flame)&(Y>=COLLAR_BOT)&(Y<LEG_TOP)
mods['legs']=solid&(Y>=LEG_TOP)
print({k:int(v.sum()) for k,v in mods.items()}, 'unassigned', int((op&~np.any(list(mods.values()),axis=0)).sum()))
def layer(mask):
    out=np.zeros_like(m); out[mask]=m[mask]; return out
L={k:layer(v) for k,v in mods.items()}
# collar: extend upward under the hood (copy its top row up 6 rows)
c=L['collar']
for y in range(HOOD_BOT-1,HOOD_BOT-7,-1):
    src=c[HOOD_BOT].copy(); k=(src[...,3]>0)&(m[y,:,3]>0); c[y][k]=src[k]
# cloak: extend upward under the collar (copy top row up 4 rows)
c=L['cloak']
for y in range(COLLAR_BOT-1,COLLAR_BOT-5,-1):
    src=c[COLLAR_BOT].copy(); k=(src[...,3]>0)&(m[y,:,3]>0); c[y][k]=src[k]
# legs: split back/front at x=47, extend each leg's top row upward 8 rows under the cloak
lg=L.pop('legs'); split=47
for name,sl in (('leg_back',slice(0,split)),('leg_front',slice(split,W))):
    t=np.zeros_like(m); t[:,sl]=lg[:,sl]
    top=t[LEG_TOP].copy()
    for y in range(LEG_TOP-1,LEG_TOP-9,-1):
        k=(top[...,3]>0)&(m[y,:,3]>0)&mods['cloak'][y]; t[y][k]=top[k]
    L[name]=t
for k,v in L.items(): Image.fromarray(v).save(f'rig/{k}.png')
# overview image: modules side by side
names=['hood_mask','horns','collar','cloak','back_flames','front_energy','leg_back','leg_front']
s=Image.new('RGBA',(W*len(names)*3,H*3),(235,235,235,255))
for i,n in enumerate(names):
    s.alpha_composite(Image.open(f'rig/{n}.png').resize((W*3,H*3),Image.NEAREST),(i*W*3,0))
s.save('rig/tong-quan-module_3x.png')
# recombination test: must equal the master exactly where the master is opaque
order=['back_flames','leg_back','leg_front','cloak','collar','hood_mask','horns','front_energy']
comp=Image.new('RGBA',(W,H))
for n in order: comp.alpha_composite(Image.open(f'rig/{n}.png'))
c=np.array(comp); d=((m[...,3]>0)&(c!=m).any(2))|((m[...,3]==0)&(c[...,3]>0))
print('recombine diff px:',int(d.sum()))
