import sys, json, base64, io, colorsys
from PIL import Image
f=sys.argv[1]; out=sys.argv[2]; d=json.load(open(f))
im=Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA'); px=im.load(); n=m=0
for y in range(im.height):
  for x in range(im.width):
    r,g,b,a=px[x,y]
    if not a: continue
    # dark green halo -> outline color
    if g>r+12 and g>b+8 and g<110: px[x,y]=(20,24,46,255); m+=1; continue
    h,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255); hd=h*360
    if (hd>=340 or hd<=40) and s>0.12 and v>0.45:
      nh=(258 if hd<=40 else 258)/360; ns=min(1,s*0.95); nv=v*0.93
      R,G,B=colorsys.hsv_to_rgb(nh,ns,nv); px[x,y]=(round(R*255),round(G*255),round(B*255),255); n+=1
bio=io.BytesIO(); im.save(bio,'PNG',optimize=True); d['tam']='data:image/png;base64,'+base64.b64encode(bio.getvalue()).decode()
json.dump(d,open(out,'w'),separators=(',',':'),ensure_ascii=False); print('skin',n,'halo',m)
