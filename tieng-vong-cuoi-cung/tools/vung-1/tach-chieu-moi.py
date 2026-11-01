import json,base64,io,os
import numpy as np
from PIL import Image
from scipy import ndimage
F='/root/.claude/projects/-home-claude/3d4601ea-c0a0-509d-bac3-ac4c31c5f5c0.jsonl'
with open(F,'rb') as f:
    f.seek(0,2); n=f.tell(); f.seek(max(0,n-3_000_000)); L=f.read().decode('utf8','ignore').splitlines()[1:]
imgs=[]
def walk(o):
    if isinstance(o,dict):
        if o.get('type')=='image' and 'source' in o: imgs.append(o['source'])
        for v in o.values(): walk(v)
    elif isinstance(o,list):
        for v in o: walk(v)
for l in L:
    try: walk(json.loads(l))
    except: pass
P=[np.array(Image.open(io.BytesIO(base64.b64decode(p['data']))).convert('RGB')).astype(int) for p in imgs]
P=[p for p in P if p.shape[:2]==(887,887)]
U=[]
for p in P:
    if not U or not np.array_equal(U[-1],p): U.append(p)
full=np.hstack([U[-2],U[-1]])
r,g,b=full[...,0],full[...,1],full[...,2]
d=np.sqrt((r-255)**2+g**2+(b-255)**2)
pink=(r>140)&(b>110)&(g<120)&(np.abs(r-b)<120)&~((r>200)&(g>60))   # quầng tím hồng trộn nền
op=(d>90)&~pink
rgba=np.dstack([r,g,b,np.where(op,255,0)]).astype(np.uint8)
# chỗ quầng mờ trộn nền nhưng là ánh đỏ: giữ bán trong màu đỏ gạch
glow=(d>60)&pink&(r>180)
rgba[glow]=[200,70,50,120]
D='/home/claude/new-project/tieng-vong-cuoi-cung/art/hieu-ung/chieu-moi'; os.makedirs(D,exist_ok=True)
Image.fromarray(rgba).save(D+'/nguon-chatgpt.png')
def strip(name, boxes, y0, y1, H):
    fr=[]
    for x0,x1 in boxes:
        sub=rgba[y0:y1,x0:x1]; fr.append(sub)
    cw=max(f.shape[1] for f in fr); ch=y1-y0
    s=H/ch; W=round(cw*s)
    out=Image.new('RGBA',(W*len(fr),H),(0,0,0,0))
    for i,f in enumerate(fr):
        im=Image.fromarray(f).resize((round(f.shape[1]*s),H),Image.BOX); a=np.array(im); a[...,3]=np.where(a[...,3]>100,a[...,3],0)
        out.paste(Image.fromarray(a),(i*W+(W-im.width)//2,0))
    out.save(f'{D}/{name}.png'); print(name,out.size,'ô',W,H)
strip('nut_dat',[(25,410),(455,835),(887,1270),(1312,1750)],40,175,46)
strip('song_dat',[(25,370),(415,795),(887,1255),(1282,1750)],215,420,70)
strip('re_troi',[(25,380),(440,805),(887,1270),(1312,1750)],440,675,80)
def icon(name,box,H):
    x0,y0,x1,y1=box; sub=rgba[y0:y1,x0:x1]; ys,xs=np.nonzero(sub[...,3]); sub=sub[ys.min():ys.max()+1,xs.min():xs.max()+1]
    im=Image.fromarray(sub); im=im.resize((max(1,round(im.width*H/im.height)),H),Image.BOX); a=np.array(im); a[...,3]=np.where(a[...,3]>120,255,0)
    Image.fromarray(a).save(f'{D}/{name}.png'); print(name,im.size)
icon('khung_mau',(25,730,725,870),14)
icon('ruot_mau',(765,775,1310,815),4)
icon('i_manh_am',(1340,725,1425,860),16)
icon('i_chuong_vo',(1460,720,1570,860),16)
icon('i_mat_na',(1620,720,1740,860),16)
chk=Image.new('RGBA',(1200,420),(22,20,28,255)); y=0
for n in ['nut_dat','song_dat','re_troi']:
    im=Image.open(f'{D}/{n}.png'); chk.alpha_composite(im.resize((min(1200,im.width*2),im.height*2) if im.width*2<=1200 else (1200,int(im.height*1200/im.width)),Image.NEAREST),(0,y)); y+=im.height*2+4 if im.width*2<=1200 else int(im.height*1200/im.width)+4
x=0
for n in ['khung_mau','i_manh_am','i_chuong_vo','i_mat_na']:
    im=Image.open(f'{D}/{n}.png'); im=im.resize((im.width*3,im.height*3),Image.NEAREST); chk.alpha_composite(im,(x,min(y,420-im.height))); x+=im.width+10
chk.save('vfx2_chk.png')
