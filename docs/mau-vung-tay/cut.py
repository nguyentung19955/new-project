import numpy as np
from PIL import Image
from collections import deque
im=np.array(Image.open('/tmp/claude-0/-home-user-new-project/d152bc1d-6393-530c-92d6-c5b8c0bbcf0b/images/8.webp').convert('RGB')).astype(int)
H,W,_=im.shape
r,g,b=im[...,0],im[...,1],im[...,2]
# pinkish bg: r high, g low, b mid; includes dark shadow magenta
pink=(r>g+60)&(b>g+20)&(r>100)
shadow=(r>g+40)&(b>g+20)&(r>110)
cand=pink|shadow
# flood from border
mask=np.zeros((H,W),bool)
q=deque()
for x in range(W):
  for y in (0,H-1):
    if cand[y,x] and not mask[y,x]: mask[y,x]=True;q.append((y,x))
for y in range(H):
  for x in (0,W-1):
    if cand[y,x] and not mask[y,x]: mask[y,x]=True;q.append((y,x))
while q:
  y,x=q.popleft()
  for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
    ny,nx=y+dy,x+dx
    if 0<=ny<H and 0<=nx<W and not mask[ny,nx] and cand[ny,nx]:
      mask[ny,nx]=True;q.append((ny,nx))
# enclosed pink holes (between legs) also bg if large & pure pink
mask|= pink & ((r-g)>120)
mask[1780:,1760:]=True  # watermark corner
a=np.where(mask,0,255).astype(np.uint8)
out=np.dstack([im.astype(np.uint8),a])
img=Image.fromarray(out,'RGBA')
bb=img.getbbox();img=img.crop(bb)
img.save('nv.png');print(bb,img.size)
