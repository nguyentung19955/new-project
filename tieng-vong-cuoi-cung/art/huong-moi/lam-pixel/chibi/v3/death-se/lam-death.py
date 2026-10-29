# Chết South-East: 6 frame từ Skeleton 'Falling Back Death' (bỏ F2 gốc),
# sửa mặt đen, mắt tắt dần, fork rơi xuống đất.
# Khung 80x72: gốc toạ độ lệch (-8,0) so với khung 64x64 của các animation khác (chân cùng mặt đất).
import sys; sys.path.insert(0,'..')
from lam_pixel_lib import *
from PIL import Image
D=B+'death-se/'
src=[Image.open(D+f'goc/death-goc-{i}.png').convert('RGBA') for i in range(7)]
PATCH={(128,165,171),(140,144,158),(174,181,190)}
def fix_face(f,box):
    x0,y0,x1,y1=box
    for y in range(y0,y1+1):
        for x in range(x0,x1+1):
            if f.getpixel((x,y))[:3] in PATCH and f.getpixel((x,y))[3]: f.putpixel((x,y),(0,0,0,255))
EYE=(245,159,40,255); EYE2=(150,90,30,255); EYE3=(90,50,20,255)
def remove_fork_in_hand(f):  # frame đứng: xoá fork để vẽ fork tuột tay
    pass
fr=[]
fr.append(src[0])
f=src[2].copy(); fix_face(f,(33,40,39,45)); fork(f,45,47,-35,stem=3); fr.append(f)                 # tuột tay
f=src[3].copy(); fix_face(f,(35,34,40,39)); put(f,35,36,EYE); put(f,38,36,EYE); fork(f,57,53,-40,stem=3); fr.append(f)
f=src[4].copy(); fix_face(f,(35,33,39,37)); put(f,35,35,EYE2); put(f,38,35,EYE2); fork(f,57,58,-8,stem=3); fr.append(f)
f=src[5].copy(); put(f,33,44,EYE3); fork(f,57,58,-8,stem=3); fr.append(f)
f=src[6].copy(); fork(f,57,58,-8,stem=3); fr.append(f)
sh=Image.new('RGBA',(80*6,72))
for i,f in enumerate(fr): f.save(D+f'death-{i}.png'); sh.paste(f,(i*80,0))
sh.save(D+'death-sheet.png'); sh.resize((480*4,288),Image.NEAREST).save(D+'death-sheet-x4.png')
g=[]
for f in fr:
    b=Image.new('RGBA',(80,72),(58,63,68,255)); b.alpha_composite(f); g.append(b.resize((320,288),Image.NEAREST).convert('P',palette=Image.ADAPTIVE))
g[0].save(D+'death-x4.gif',save_all=True,append_images=g[1:],duration=[100]*5+[1200],loop=0)
