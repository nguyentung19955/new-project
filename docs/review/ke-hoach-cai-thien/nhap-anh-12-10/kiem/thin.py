import sys, json, base64, io
from PIL import Image
f=sys.argv[1]; d=json.load(open(f)); V=(20,24,46)
im=Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA'); px=im.load(); W,H=im.size
def isv(p): return p[3] and abs(p[0]-V[0])+abs(p[1]-V[1])+abs(p[2]-V[2])<30
rm=[]
for y in range(H):
  for x in range(W):
    p=px[x,y]
    if not isv(p): continue
    nb=[px[x+dx,y+dy] if 0<=x+dx<W and 0<=y+dy<H else (0,0,0,0) for dx,dy in((1,0),(-1,0),(0,1),(0,-1))]
    if any(q[3]==0 for q in nb) and all(q[3]==0 or isv(q) for q in nb) and sum(1 for q in nb if isv(q))>=1:
      rm.append((x,y))
for x,y in rm: px[x,y]=(0,0,0,0)
bio=io.BytesIO(); im.save(bio,'PNG',optimize=True); d['tam']='data:image/png;base64,'+base64.b64encode(bio.getvalue()).decode()
json.dump(d,open(f,'w'),separators=(',',':'),ensure_ascii=False); print('thinned',len(rm))
