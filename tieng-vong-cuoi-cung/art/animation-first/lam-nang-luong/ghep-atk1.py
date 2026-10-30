# Preview: body v2_clean + FX layer on a 176x128 canvas, ChatGPT timing.
import json,numpy as np
from PIL import Image
D='attack1_pl'; ms=[70,90,80,55,45,75,95,120]
fxmap={3:'FX1',4:'FX2',5:'FX3',6:'FX4'}  # FX ends at F7 (ChatGPT QA)
ORG=(91,45)
def org(k,fx):
    if k==3:
        a=np.array(fx)[...,3]>0; ys,xs=np.where(a)
        i=np.argmin(xs); return (int(96+1-xs[i]), int(82-ys[i]))
    return ORG
BG=(234,235,235,255); out=[]; meta={}
for k in range(8):
    c=Image.new('RGBA',(176,128),(0,0,0,0)); body=Image.open(f'{D}/v2_clean/{k}.png').convert('RGBA'); c.alpha_composite(body,(0,0))
    if k in fxmap:
        fx=Image.open(f'{D}/fx/{fxmap[k]}.png'); o=org(k,fx); c.alpha_composite(fx,o); meta[k+1]={'fx':fxmap[k],'offset':o}
    c.save(f'{D}/preview/{k}.png'); out.append(c)
json.dump(meta,open(f'{D}/preview/fx_offsets.json','w'))
ims=[]
for c in out:
    b=Image.new('RGBA',c.size,BG); b.alpha_composite(c); ims.append(b.convert('RGB').resize((528,384),Image.NEAREST))
ims[0].save(f'{D}/lam_attack1_v2_fx_3x.gif',save_all=True,append_images=ims[1:],duration=ms,loop=0)
st=Image.new('RGBA',(4*176*2,2*128*2),BG)
for k,c in enumerate(out): st.alpha_composite(c.resize((352,256),Image.NEAREST),((k%4)*352,(k//4)*256))
st.save(f'{D}/preview_grid_2x.png')
