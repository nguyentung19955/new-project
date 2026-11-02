import sys;from PIL import Image;import numpy as np
src='docs/demo-hop-tuong/nguon-chatgpt/v3/projectiles_grid.png'
ids='scorch frost arc lance warp broker glitch venom'.split()
im=Image.open(src).convert('RGBA');a=np.array(im)[:,:,3]>20
def runs(v):
  r=[];s=None
  for i,x in enumerate(v):
    if x and s is None:s=i
    if not x and s is not None:r.append((s,i));s=None
  if s is not None:r.append((s,len(v)))
  return r
rows=runs(a.any(1));cuts=[0,290,560,840,im.width]
H=48
for uid,(y0,y1) in zip(ids,rows):
  cells=[]
  for c in range(4):
    sub=im.crop((cuts[c],y0,cuts[c+1],y1));bb=sub.getbbox();cells.append(sub.crop(bb))
  w=max(c.width for c in cells);h=max(c.height for c in cells)
  sc=H/h;fw=max(8,round(w*sc))
  out=Image.new('RGBA',(fw*4,H))
  for i,c in enumerate(cells):
    c=c.resize((max(1,round(c.width*sc)),max(1,round(c.height*sc))),Image.LANCZOS)
    out.paste(c,(i*fw+(fw-c.width)//2,(H-c.height)//2),c)
  out=out.quantize(256,method=Image.FASTOCTREE).convert('RGBA') if False else out
  out.save(f'demo/assets/v3/proj_{uid}.png',optimize=True);print(uid,out.size)
