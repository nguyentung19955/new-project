import json, math, sys
from PIL import Image
def load(n,k): return Image.open(f'{n}_p{k}.png').convert('RGBA')
def place(canvas, img, pivot, at, ang, scale=1.0):
    # rotate img around pivot, place pivot at 'at'
    w,h=img.size
    big=Image.new('RGBA',(w*3,h*3)); big.paste(img,(w,h))
    px,py=pivot[0]+w,pivot[1]+h
    r=big.rotate(ang,resample=Image.BICUBIC,center=(px,py))
    canvas.alpha_composite(r,(int(at[0]-px),int(at[1]-py)))
def rot(p,c,ang):
    a=math.radians(-ang); x,y=p[0]-c[0],p[1]-c[1]
    return (c[0]+x*math.cos(a)-y*math.sin(a), c[1]+x*math.sin(a)+y*math.cos(a))
def frame(cfg, pose, size=(600,600)):
    C=Image.new('RGBA',size,(255,255,255,255))
    ox,oy=cfg['root']; by=pose.get('bob',0); ba=pose.get('body',0)
    body=cfg['parts']['body']; bimg=load(cfg['name'],body['k'])
    root=(ox+pose.get('dx',0),oy+by)
    order=sorted(cfg['parts'].items(), key=lambda kv: kv[1]['z'])
    def body_pt(p):  # point in body image coords -> canvas
        q=(root[0]+p[0]-body['pivot'][0], root[1]+p[1]-body['pivot'][1])
        return rot(q,root,ba)
    for name,pt in order:
        img=load(cfg['name'],pt['k'])
        if name=='body': place(C,img,body['pivot'],root,ba); continue
        at=body_pt(pt['at']); ang=ba+pose.get(name,0)
        place(C,img,pt['pivot'],at,ang)
    return C
