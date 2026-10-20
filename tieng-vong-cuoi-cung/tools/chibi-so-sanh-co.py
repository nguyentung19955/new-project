#!/usr/bin/env python3
"""Contact sheet so-sanh-co.png: cùng khung ở 512/256/160/128/96/64 px cao. Chạy từ tieng-vong-cuoi-cung/."""
import importlib.util, numpy as np
from PIL import Image, ImageDraw, ImageFont
spec=importlib.util.spec_from_file_location('t','tools/chibi-tach-khung.py'); t=importlib.util.module_from_spec(spec); spec.loader.exec_module(t)
K='art/chibi/lam/khung/'
frames=[('goc-nhin/khung-8','3/4 trước: 2 mắt + chuông'),('attack/khung-5','nghiêng: dao + chuông'),('run/khung-1','chạy')]
sizes=[512,256,160,128,96,64]
try: font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',18)
except: font=ImageFont.load_default()
rows=[]
for f,lab in frames:
    im=Image.open(K+f+'.png'); bb=im.getchannel('A').point(lambda v:255 if v>10 else 0).getbbox(); c=np.asarray(im.crop(bb))
    cells=[]
    for h in sizes:
        k=h/c.shape[0]; sm=Image.fromarray(t.doi_co(c,k),'RGBA'); cells.append((h,sm))
    rows.append((lab,cells))
W=sum(max(s.width for _,s in [cc]) for cc in rows[0][1])
W=40+sum(max(r[1][i][1].width for r in rows)+30 for i in range(len(sizes)))
H=sum(512+60 for _ in rows)+40
o=Image.new('RGB',(W,H),(32,34,40)); d=ImageDraw.Draw(o)
y=40
d.text((20,8),'So sánh cỡ nhân vật (cao tính theo hình, px thật – không phóng to). Nền tối giống game.',fill=(230,230,230),font=font)
for lab,cells in rows:
    x=20; d.text((20,y),lab,fill=(200,220,255),font=font)
    for i,(h,sm) in enumerate(cells):
        cw=max(r[1][i][1].width for r in rows)
        bg=Image.new('RGBA',sm.size,(32,34,40,255)); bg.alpha_composite(sm)
        o.paste(bg.convert('RGB'),(x,y+30+512-sm.height))
        d.text((x,y+30+512+2),f'{h}px',fill=(255,210,120),font=font)
        x+=cw+30
    y+=512+60
o.save(K+'so-sanh-co.png',optimize=True)
print(o.size)
