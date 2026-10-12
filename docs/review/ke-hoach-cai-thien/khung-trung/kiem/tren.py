import json,glob,os,numpy as np
from hang import hang, tai
res=[]
for f in sorted(glob.glob('/home/claude/new-project/game/art/custom/*.sprite.json')):
    ma=os.path.basename(f)[:-12]
    d=json.load(open(f))
    if d.get('doi_tuong') not in ('quai','em-be','nguoi-lang') or not isinstance(d.get('tam'),str): continue
    for k in d.get('dong_tac',{}):
        try: fr,_,v=hang(ma,k)
        except Exception as e: continue
        for i,im in enumerate(fr):
            a=np.asarray(im)[...,3]
            if a.shape[0]==0: continue
            n0=(a[0]>20).sum(); n1=(a[1]>20).sum() if a.shape[0]>1 else 0
            if n0: res.append((ma,k,i,int(n0),int(n1),im.size))
from collections import defaultdict
g=defaultdict(list)
for r in res: g[(r[0],r[1])].append((r[2],r[3],r[4]))
for k,v in g.items(): print(k,v)
