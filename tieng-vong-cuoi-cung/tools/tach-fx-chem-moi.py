import json,base64,io,os
import numpy as np
from PIL import Image
F='/root/.claude/projects/-home-claude/3d4601ea-c0a0-509d-bac3-ac4c31c5f5c0.jsonl'
with open(F,'rb') as f:
    f.seek(0,2); n=f.tell(); f.seek(max(0,n-3_000_000)); L=f.read().decode('utf8','ignore').splitlines()[1:]
imgs=[]
def walk(o):
    if isinstance(o,dict):
        if o.get('type')=='image' and 'source' in o: imgs.append(o['source'])
        for v in o.values(): walk(v)
    elif isinstance(o,list):
        for v in o: walk(v)
for l in L:
    try: walk(json.loads(l))
    except: pass
P=[np.array(Image.open(io.BytesIO(base64.b64decode(p['data']))).convert('RGB')).astype(int) for p in imgs]
P=[p for p in P if p.shape[:2]==(512,1536)]
U=[]
for p in P:
    if not U or not np.array_equal(U[-1],p): U.append(p)
full=np.vstack([U[-2],U[-1]])
r,g,b=full[...,0],full[...,1],full[...,2]
d=np.sqrt((r-255)**2+g**2+(b-255)**2)
a=np.full(r.shape,255)
a[d<70]=0
pink=(d>=70)&(r>160)&(b>160)&(g<150)&(np.abs(r-b)<70)
out=np.dstack([r,g,b,a]).astype(np.uint8)
# pha hồng (khói mờ trộn nền) -> tím khói bán trong
out[pink,0]=96; out[pink,1]=62; out[pink,2]=138; out[pink,3]=150
o=out.astype(int); R,G,B=o[...,0],o[...,1],o[...,2]
cy=((B>R+40)&(G>R+20))|((R>200)&(G>200)&(B>200))
k=~cy&(o[...,3]>0)
o[k,0]=(R[k]*0.62).astype(int); o[k,1]=(G[k]*0.62+6).astype(int); o[k,2]=(B[k]*0.74+10).astype(int)
out=o.clip(0,255).astype(np.uint8)
img=Image.fromarray(out,'RGBA')
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','art/hieu-ung/chem-moi'); os.makedirs(D,exist_ok=True)
img.save(D+'/nguon-chatgpt.png')
names=['ngang','cung','cheo','no']
for row,nm in enumerate(names):
    strip=Image.new('RGBA',(128*6,128),(0,0,0,0))
    for c in range(6):
        cell=img.crop((c*256,row*256,(c+1)*256,(row+1)*256)).resize((128,128),Image.BOX)
        arr=np.array(cell); arr[...,3]=np.where(arr[...,3]>90,arr[...,3],0)
        strip.paste(Image.fromarray(arr),(c*128,0))
    strip.save(f'{D}/{nm}.png')
chk=Image.new('RGBA',(768,512),(22,20,28,255))
for row,nm in enumerate(names): chk.alpha_composite(Image.open(f'{D}/{nm}.png'),(0,row*128))
chk.resize((1536,1024),Image.NEAREST).save('fxchem_chk.png'); print('ok')
