# Bị đánh South-East: giữ F1 (Idle), F4, F5 của Skeleton 'Taking Punch'; vẽ lại fork sát tay
import sys; sys.path.insert(0,'..')
from lam_pixel_lib import *
from PIL import Image
D=B+'hurt-se/'
f1=Image.open(B+'idle-se/idle-se-0.png').convert('RGBA')
f4=Image.open(D+'goc/hurt-goc-3.png').convert('RGBA'); fork(f4,40,37,60,stem=3)
f5=Image.open(D+'goc/hurt-goc-4.png').convert('RGBA'); fork(f5,40,37,35,stem=3)
fr=[f1,f4,f5]
sh=Image.new('RGBA',(192,64))
for i,f in enumerate(fr): f.save(D+f'hurt-{i}.png'); sh.paste(f,(i*64,0))
sh.save(D+'hurt-sheet.png'); sh.resize((768,256),Image.NEAREST).save(D+'hurt-sheet-x4.png')
g=[]
for f in fr+[f1]:
    b=Image.new('RGBA',(64,64),(58,63,68,255)); b.alpha_composite(f); g.append(b.resize((256,256),Image.NEAREST).convert('P',palette=Image.ADAPTIVE))
g[0].save(D+'hurt-x4.gif',save_all=True,append_images=g[1:],duration=[83,83,83,500],loop=0)
