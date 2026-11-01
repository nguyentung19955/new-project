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
P=[p for p in P if p.shape[:2]==(512,1536)]
U=[]
for p in P:
    if not U or not np.array_equal(U[-1],p): U.append(p)
full=np.vstack([U[-2],U[-1]])
r,g,b=full[...,0],full[...,1],full[...,2]
d=np.sqrt((r-255)**2+g**2+(b-255)**2)
pinkish=(r>150)&(b>120)&(g<110)&(np.abs(r-b)<110)   # quầng sáng trộn nền
op=(d>80)&~pinkish
op=ndimage.binary_opening(op,iterations=1)
rgba=np.dstack([r,g,b,np.where(op,255,0)]).astype(np.uint8)
D='/home/claude/new-project/tieng-vong-cuoi-cung/art/vung-1/dao-cu/dan-duong'; os.makedirs(D,exist_ok=True)
Image.fromarray(rgba).save(D+'/nguon-chatgpt.png')
def cut(box,name,cao):
    x0,y0,x1,y1=box; sub=rgba[y0:y1,x0:x1]; ys,xs=np.nonzero(sub[...,3])
    sub=sub[ys.min():ys.max()+1, xs.min():xs.max()+1]
    im=Image.fromarray(sub); w=round(im.width*cao/im.height); im=im.resize((w,cao),Image.BOX)
    a=np.array(im); a[...,3]=np.where(a[...,3]>140,255,0); Image.fromarray(a).save(f'{D}/{name}.png'); print(name,im.size)
    return im.size
cut((0,0,520,500),'bia',60)        # px gốc ở tỉ lệ 3 px logic/điểm → cao 180 logic
cut((660,150,920,430),'chuong_nho',18)
cut((1120,60,1460,500),'coc_chuong',44)
cut((100,560,320,940),'nut_bi_mat',30)
cut((1220,620,1420,880),'canh_bao',16)
# đạn kèn: 4 khung, ghép vào ô 2,3 của ken_tron.png (ô 96px), giữ ô 0,1,4,5
K='/home/claude/new-project/tieng-vong-cuoi-cung/art/hieu-ung/chieu-quai/ken_tron.png'
ken=Image.open(K).convert('RGBA')
fr=[]
for x0 in (420,610,800,980):
    sub=rgba[680:830,x0:x0+180]; ys,xs=np.nonzero(sub[...,3]); sub=sub[ys.min():ys.max()+1, xs.min():xs.max()+1]
    im=Image.fromarray(sub); s=34/im.height; im=im.resize((max(1,round(im.width*s)),34),Image.BOX); a=np.array(im); a[...,3]=np.where(a[...,3]>140,255,0); fr.append(Image.fromarray(a))
for cell,k in ((2,0),(3,2)):
    c=Image.new('RGBA',(96,96),(0,0,0,0)); im=fr[k]; c.alpha_composite(im,(48-im.height//2-2, 48-im.height//2))   # đầu đạn (bên trái) gần tâm ô
    ken.paste(c,(cell*96,0))
ken.save(K); print('ken_tron cập nhật')
