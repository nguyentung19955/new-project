# kiem4: combo theo GIF mẫu của đạo diễn – thân PixelLab V3 (row B 47c4ea5e, row C 24b04d4a) + vệt chém lớn thay lưỡi ở hình trúng đòn
import os,sys; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from kiem_lib import *
D=os.path.dirname(os.path.abspath(__file__))+'/'
B={k:Image.open(D+f'goc/b-f{k}.png').convert('RGBA') for k in range(9)}
C={k:Image.open(D+f'goc/c-f{k}.png').convert('RGBA') for k in range(9)}
DUST=[(0,0,(200,215,220)),(1,-1,(160,200,205)),(-1,-1,(200,215,220)),(2,0,(120,230,230)),(-2,0,(160,200,205)),(0,-2,(160,200,205))]
def dust(f,pts):
    for cx,cy in pts:
        for dx,dy,c in DUST: put(f,cx+dx,cy+dy,c+(255,))
clips={}
# ---- Chém 1: thu kiếm sau vai xa -> ngồi nén -> lao chém chéo xuống-phải ----
o=[B[0].copy(), B[2].copy()]
f=squash(behind(B[3].copy(),60,60,72,24),2); o.append(f)
f=B[4].copy(); erase_sword(f,(58,40,100,72)); smear2(f,56,58,30,72,-45,thmax=7,shear=(4,-2)); wpn(f,61,67,-45); o.append(f)       # IMPACT
f=B[4].copy(); erase_sword(f,(58,40,100,72)); f=squash(f,1); wpn(f,61,68,-55); o.append(f)
o.append(B[1].copy())
clips['chem1']=(o,[70,90,100,40,90,110],3)
# ---- Chém 2: ngồi thấp -> bật lên, chém hất lên -> trên không -> tiếp đất ----
o=[B[3].copy(), lift(B[4].copy(),2)]
f=B[5].copy(); erase_sword(f,(58,24,100,70)); smear2(f,56,60,27,-55,75,thmax=6,shear=(-2,-1)); wpn(f,65,54,50); o.append(f)        # IMPACT
o+=[B[6].copy(), B[7].copy(), squash(B[8].copy(),2)]
clips['chem2']=(o,[70,70,40,80,80,110],2)
# ---- Chém 3: nạp chuông -> nén -> nhảy, kiếm dựng phía xa -> bổ xuống nặng -> giữ thấp -> về thủ ----
o=[C[0].copy()]
f=C[2].copy(); bell(f,1); o.append(f)
f=squash(C[3].copy(),3); bell(f,2); o.append(f)
f=B[6].copy(); bell(f,2); o.append(f)
f=B[4].copy(); erase_sword(f,(58,40,100,72)); f=squash(f,3); dust(f,[(40,81),(80,81),(86,80)]); smear2(f,56,56,34,100,-55,thmax=9,shear=(3,-3)); wpn(f,61,70,-55); o.append(f)   # IMPACT
f=B[4].copy(); erase_sword(f,(58,40,100,72)); f=squash(f,3); wpn(f,61,71,-65); o.append(f)
o.append(C[8].copy())
clips['chem3']=(o,[70,90,90,80,50,140,110],4)
for name,(o,dur,imp) in clips.items():
    for f in o: clean2(f)
    od=D+name+'/'; os.makedirs(od,exist_ok=True)
    sh=Image.new('RGBA',(104*len(o),104))
    for i,f in enumerate(o): f.save(od+f'{name}-{i}.png'); sh.paste(f,(i*104,0))
    sh.save(od+f'{name}-sheet.png')
    pv=Image.new('RGBA',sh.size,(58,63,68,255)); pv.alpha_composite(sh); pv.resize((sh.width*3,312),Image.NEAREST).save(od+f'{name}-xem.png')
    g=[]
    for f in o:
        b=Image.new('RGBA',(104,104),(58,63,68,255)); b.alpha_composite(f); g.append(b.resize((312,312),Image.NEAREST).convert('P',palette=Image.ADAPTIVE))
    g[0].save(od+f'{name}.gif',save_all=True,append_images=g[1:],duration=dur,loop=0)
rows=[Image.open(D+f'{n}/{n}-xem.png') for n in clips]
W=max(r.width for r in rows); t=Image.new('RGBA',(W,312*3),(58,63,68,255))
for i,r in enumerate(rows): t.paste(r,(0,i*312))
t.save(D+'ba-don-xem.png')
