import sys, json, base64, io
from PIL import Image
# xanh.py file.sprite.json : remove green-dominant pixels; prints count
f=sys.argv[1]; d=json.load(open(f))
im=Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA'); px=im.load(); n=0
for y in range(im.height):
  for x in range(im.width):
    r,g,b,a=px[x,y]
    if a and g-max(r,b)>45 and g>120: px[x,y]=(0,0,0,0); n+=1
bio=io.BytesIO(); im.save(bio,'PNG',optimize=True); d['tam']='data:image/png;base64,'+base64.b64encode(bio.getvalue()).decode()
json.dump(d,open(f,'w'),separators=(',',':'),ensure_ascii=False); print(f,'removed',n)
