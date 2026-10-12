import json,glob,base64,io,sys,os
from PIL import Image
import numpy as np
NG=float(sys.argv[1]) if len(sys.argv)>1 else 0.02
out=[]
for f in sorted(glob.glob('/home/claude/new-project/game/art/custom/*.sprite.json')):
    d=json.load(open(f))
    tam=d.get('tam'); dt=d.get('dong_tac')
    if not isinstance(tam,str) or not dt: continue
    if tam.startswith('data:'): im=Image.open(io.BytesIO(base64.b64decode(tam.split(',',1)[1])))
    else:
        p=os.path.join(os.path.dirname(f),tam)
        if not os.path.exists(p): print('?',f,tam[:60]); continue
        im=Image.open(p)
    a=np.asarray(im.convert('RGBA')).astype(int)
    fw,fh=d['khung_rong'],d['khung_cao']
    n=round(a.shape[1]/fw) if False else None
    net=d.get('net') or 1
    try: net=float(net)
    except: net=1
    W=int(round(fw*net));H=int(round(fh*net))
    for k,v in dt.items():
        if not isinstance(v,dict) or 'hang' not in v: continue
        r=v['hang'];so=v.get('so',1)
        fr=[]
        for i in range(so):
            c=a[r*H:(r+1)*H,i*W:(i+1)*W]
            if c.shape[0]!=H or c.shape[1]!=W: break
            fr.append(c)
        for i in range(1,len(fr)):
            A,B=fr[i-1],fr[i]
            op=(A[...,3]>20)|(B[...,3]>20)
            nop=op.sum()
            if nop==0: continue
            dif=(np.abs(A-B).max(-1)>24)&op
            r1=dif.sum()/nop; r2=dif.sum()/(W*H)
            if r1<NG: out.append((os.path.basename(f).replace('.sprite.json',''),k,r,so,i,round(r1*100,2),round(r2*100,2),v.get('giay'),v.get('lap',False)))
for o in out: print(*o)
print(len(out))
