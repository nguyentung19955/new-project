#!/usr/bin/env python3
# TURRET MERGE — chân dung phi công vừa khung thẻ: bỏ viền ô lưới, thêm khoảng trống trên đầu (kéo dài nền của chính ảnh, mờ dần),
# tính PILOT_FIT (x canh mặt). Nguồn: docs/demo-hop-tuong/thap-art/redo/pilot_<id>_v3.png (nếu có) hoặc _v2.png → thap/assets/pilot_<id>.png.
# In ra dòng PILOT_FIT để dán vào thap/js/khung.js. Bảng xem: docs/demo-hop-tuong/tuvan/pilotfit/all.png
import re, json, sys, numpy as np
sys.exit('BỎ: công cụ này làm MỜ đỉnh tóc (dải kéo dài + blur) và chỉ 256 px — dùng tools/thap-pilot-net.py')
from PIL import Image, ImageFilter, ImageDraw
import os
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')+'/'
ART=R+'docs/demo-hop-tuong/thap-art/redo/'
ids=re.findall(r"'(\w+)'",open(R+'thap/js/text.js').read().split('const PILOTS = new Set([')[1].split('])')[0])
OV={'phun':{'p':20,'fx':112},'cuuvi':{'p':20},'pandora':{'p':20,'fx':180}}  # v3 đã có chỗ trống trên đầu; chỉnh tay: {id:{'p':pad_px,'fx':face_x,'y':y%}}
OUT=R+'thap/assets/'
def src_of(id):
    for v in ('v3','v2'):
        f=ART+f'pilot_{id}_{v}.png'
        if os.path.exists(f): return f
def trim(im, t=4):
    w,h=im.size; return im.crop((t,t,w-t,h-t)).resize((256,256),Image.LANCZOS)
def headroom(im, p):
    a=np.array(im).astype(np.float32)
    sx=p//4; cb=p//2
    ext=np.pad(a,((p,0),(sx,sx),(0,0)),mode='edge')
    H,W=ext.shape[:2]
    blur=np.array(Image.fromarray(ext.astype(np.uint8)).filter(ImageFilter.GaussianBlur(9))).astype(np.float32)
    border=np.concatenate([a[:6].reshape(-1,3),a[:,:6].reshape(-1,3),a[:,-6:].reshape(-1,3)])
    L=border.mean(1); bg=border[L<=np.percentile(L,20)].mean(0)
    yy,xx=np.mgrid[0:H,0:W].astype(np.float32)
    dy=np.clip((p-yy)/max(p,1),0,1)          # 0 at original top edge → 1 at canvas top
    dx=np.clip(np.maximum(sx-xx, xx-(W-1-sx))/max(sx,1),0,1)
    d=np.maximum(dy,dx)
    fade=(1-0.85*d**0.8)[...,None]
    fill=blur*fade+bg*(1-fade)
    # feather: original over fill, soft 7 px at its top/side edges
    fy=np.clip((yy-p)/7,0,1); fxl=np.clip((xx-sx)/5,0,1); fxr=np.clip(((W-1-sx)-xx)/5,0,1)
    m=np.minimum(fy,np.minimum(fxl,fxr))[...,None]
    inside=(yy>=p)&(xx>=sx)&(xx<W-sx)
    m=m*inside[...,None]
    out=ext*m+fill*(1-m)
    out=out[:H-cb]
    return Image.fromarray(np.clip(out,0,255).astype(np.uint8)).resize((256,256),Image.LANCZOS), (W)/256
det={}
for id in ids:
    a=np.array(Image.open(src_of(id)).convert('RGB')).astype(float)
    r,g,b=a[...,0],a[...,1],a[...,2]
    skin=(r>70)&(r>g)&(g>b*0.9)&((r-b)>20)&((r-g)<90)&(abs(r-g)>8)
    det[id]={'fx':int(np.convolve(skin[:180].sum(0),np.ones(40),'same').argmax())}
FIT={}
for id in ids:
    o=OV.get(id,{})
    im=trim(Image.open(src_of(id)).convert('RGB'))
    p=o.get('p',32)
    out,k=headroom(im,p) if p>0 else (im,1)
    out.save(OUT+f'pilot_{id}.png')
    fx=(o.get('fx',det[id]['fx'])+p//4)/k/256   # face x in new image (0..1)
    a=0.88
    x=min(100,max(0,(fx-a/2)/(1-a)*100))
    FIT[id]=[round(x), o.get('y',8), 1]
FIT={k:[round(50+(v[0]-50)*0.6),v[1],v[2]] for k,v in FIT.items()}
print('const PILOT_FIT = {'+','.join(f'{k}:[{v[0]},{v[1]},{v[2]}]' for k,v in FIT.items())+'};')
