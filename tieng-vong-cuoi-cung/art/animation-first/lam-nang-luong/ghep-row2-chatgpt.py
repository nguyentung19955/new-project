# Compose Row 2: far FX (ChatGPT) under the body, near FX (ChatGPT) over the body.
import os
from PIL import Image, ImageDraw
D='row2_v2'; F='row2_fx_chatgpt'; BG=(234,235,235,255)
ms=[90,110,55,60,70,80,130]
seq=[Image.open('pixellab/east.png').convert('RGBA')]+[Image.open(f'{D}/body/{k}.png').convert('RGBA') for k in range(1,7)]
os.makedirs(f'{F}/preview',exist_ok=True); frames=[]
for i,b in enumerate(seq):
    c=Image.new('RGBA',(128,128),(0,0,0,0))
    if i>0: c.alpha_composite(Image.open(f'{F}/far_{i}.png'))
    c.alpha_composite(b)
    if i>0: c.alpha_composite(Image.open(f'{F}/near_{i}.png'))
    c.save(f'{F}/preview/{i}.png'); frames.append(c)
ims=[]
for c in frames:
    b=Image.new('RGBA',c.size,BG); b.alpha_composite(c); ims.append(b.convert('RGB').resize((384,384),Image.NEAREST))
ims[0].save(f'{F}/lam_row2_3x.gif',save_all=True,append_images=ims[1:],duration=ms,loop=0)
ref=Image.open('tham-khao/mau-don-danh.jpg').convert('RGBA').crop((0,225,1200,405))
st=Image.new('RGBA',(1200,180+256),BG); st.alpha_composite(ref,(0,0)); d=ImageDraw.Draw(st)
for i in range(1,7):
    st.alpha_composite(frames[i].resize((256,256),Image.NEAREST).crop((28,0,228,256)),((i-1)*200,180)); d.text(((i-1)*200+5,185),f'R2-{i}',fill=(200,0,0,255))
st.save(f'{F}/compare.png')
