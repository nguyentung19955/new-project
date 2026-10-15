import math, sys
from PIL import Image, ImageDraw
PW,PH,GAP,GY=300,230,40,150
K=(0,0,0); RED=(220,30,30); GR=(110,110,110)
def col(a): return K if a>=1 else tuple([int(255-(255)*a)]*3)
def tam(fr,ten,ve):
    n=len(fr); im=Image.new('RGB',(GAP+n*(PW+GAP),320),'white'); d=ImageDraw.Draw(im)
    for i,P in enumerate(fr):
        ox=GAP+i*(PW+GAP); oy=40
        d.rectangle([ox,oy,ox+PW,oy+PH],outline=(200,200,200),width=2)
        d.line([(ox+10,oy+GY),(ox+PW-10,oy+GY)],fill=(170,170,170),width=2)
        d.text((ox+6,oy+4),str(i+1),fill=(200,0,0))
        ve(d,ox+150,oy+GY,**P)
    im.save(ten)
N=dict
def mat(d,x,y,c,mo=1):
    if mo: d.ellipse([x-5,y-5,x+5,y+5],fill=c)
    else: d.line([(x-7,y-5),(x+7,y+5)],fill=c,width=3); d.line([(x-7,y+5),(x+7,y-5)],fill=c,width=3)

# ---- CUA: than det, chan hai ben, cang to phia truoc
def cua(d,cx,gy,dx=0,up=0,step=0,claw=0,snap=0,lean=0,flip=0,a=1,fx=None,mo=1):
    c=col(a); x=cx+dx; w=55; h=22
    if flip:
        by=gy-24; d.ellipse([x-w,by-h,x+w,by+h],outline=c,width=5)
        for k in (-40,-20,0,20,40): d.line([(x+k,by-h+4),(x+k*1.2,by-h-18),(x+k*1.3+6,by-h-26)],fill=c,width=4)
        mat(d,x+w-16,by+4,c,0); return
    by=gy-38-up; lx=lean*10
    d.ellipse([x-w+lx,by-h,x+w+lx,by+h],outline=c,width=5)
    for i,k in enumerate((-45,-30,-15)):
        s=(1 if (i+step)%2 else -1)*7
        d.line([(x+k+lx,by+h-6),(x+k-18+s,gy-16),(x+k-14+s,gy)],fill=c,width=4)
    for i,k in enumerate((10,25)):
        s=(1 if (i+step)%2 else -1)*7
        d.line([(x+k+lx,by+h-4),(x+k+18+s,gy-16),(x+k+14+s,gy)],fill=c,width=4)
    mat(d,x+w-18+lx,by-8,c,mo)
    ang=-0.3-claw*1.2
    sx,sy=x+w-8+lx,by+6; L=28
    ex,ey=sx+math.cos(ang)*L+snap*26,sy+math.sin(ang)*L
    d.line([(sx,sy),(ex,ey)],fill=c,width=7)
    op=0.12 if snap else 0.55
    d.ellipse([ex-8,ey-8,ex+8,ey+8],outline=c,width=5)
    d.line([(ex,ey),(ex+26*math.cos(ang-op),ey+26*math.sin(ang-op))],fill=c,width=7)
    d.line([(ex,ey),(ex+22*math.cos(ang+op),ey+22*math.sin(ang+op))],fill=c,width=6)
    if fx=='cat': d.line([(ex+34,ey-14),(ex+48,ey+14)],fill=RED,width=4)
    if fx=='dau': d.line([(x-30,by-40),(x-18,by-28)],fill=RED,width=3)
cua_fr={'1-dung':[N(up=u,claw=c) for u,c in ((0,0),(2,.1),(3,.2),(2,.1),(0,0),(-1,0))],
'2-di':[N(dx=i*7,step=i,up=(i%2)*3) for i in range(6)],
'3-bao-don':[N(claw=.2),N(claw=.5,lean=-.3,dx=-4),N(claw=.8,lean=-.6,dx=-8),N(claw=1,lean=-.8,dx=-12),N(claw=1.1,lean=-.9,dx=-14),N(claw=1.15,lean=-.9,dx=-14)],
'4-danh':[N(claw=1.15,lean=-.9,dx=-14),N(claw=.4,lean=.3,dx=6),N(claw=0,snap=1,lean=.8,dx=18,fx='cat'),N(claw=0,snap=1,lean=.6,dx=16),N(claw=.2,lean=.2,dx=8),N()],
'5-trung-don':[N(dx=-16,up=6,lean=-.8,mo=0,fx='dau'),N(dx=-8,up=2,lean=-.4,mo=0),N(dx=-3,lean=-.1),N()],
'6-chet':[N(lean=-.6,up=8,mo=0),N(up=14,mo=0,dx=-4),N(flip=1),N(flip=1),N(flip=1,a=.55),N(flip=1,a=.2)]}

# ---- CA: 1 con ca boi lo lung
def ca1(d,x,y,s,tail,a,belly=0,mo=1,tilt=0):
    c=col(a); w=40*s; h=20*s
    d.ellipse([x-w,y-h,x+w,y+h],outline=c,width=5)
    tx=x-w; tw=tail*10*s
    d.polygon([(tx,y),(tx-24*s,y-18*s+tw),(tx-24*s,y+18*s+tw)],outline=c,width=4) if False else None
    d.line([(tx,y),(tx-24*s,y-18*s+tw)],fill=c,width=4); d.line([(tx,y),(tx-24*s,y+18*s+tw)],fill=c,width=4); d.line([(tx-24*s,y-18*s+tw),(tx-24*s,y+18*s+tw)],fill=c,width=4)
    if belly: mat(d,x+w*0.55,y+6*s,c,0)
    else: mat(d,x+w*0.55,y-5*s,c,mo)
    d.line([(x-5*s,y-h),(x-18*s,y-h-14*s)],fill=GR if a>=1 else c,width=4)
def ca(d,cx,gy,y=0,dx=0,tail=0,bend=0,a=1,fx=None,fall=0,belly=0,mo=1,s=1):
    base=gy-75-y; yy=base+fall*((gy-20)-base)
    ca1(d,cx+dx,yy,s,tail,a,belly,mo)
    if fx=='lao': d.line([(cx+dx+60,yy-10),(cx+dx+80,yy+10)],fill=RED,width=4)
    if fx=='dau': d.line([(cx+dx-20,yy-45),(cx+dx-8,yy-33)],fill=RED,width=3)
ca_fr={'1-dung':[N(y=v,tail=t) for v,t in ((0,1),(4,0),(6,-1),(4,0),(0,1),(-3,0))],
'2-di':[N(y=v,tail=t,dx=i*8) for i,(v,t) in enumerate(((0,1),(6,-1),(10,1),(6,-1),(0,1),(-2,-1)))],
'3-bao-don':[N(),N(dx=-6,y=4,tail=1),N(dx=-12,y=8,tail=1.5,s=.95),N(dx=-18,y=10,tail=2,s=.92),N(dx=-22,y=12,tail=2,s=.9),N(dx=-24,y=12,tail=2,s=.9)],
'4-danh':[N(dx=-24,y=12,tail=2,s=.9),N(dx=0,y=20,tail=-1,s=1.05),N(dx=35,y=35,tail=-2,s=1.1,fx='lao'),N(dx=55,y=25,tail=-1,fx='lao'),N(dx=30,y=8),N(dx=0)],
'5-trung-don':[N(dx=-22,y=14,mo=0,fx='dau'),N(dx=-12,y=8,mo=0),N(dx=-4,y=2),N()],
'6-chet':[N(dx=-8,y=10,mo=0),N(belly=1,y=0),N(belly=1,fall=.4),N(belly=1,fall=.8),N(belly=1,fall=1,a=.55),N(belly=1,fall=1,a=.2)]}

# ---- CA3: dan 3 con ca
def ca3(d,cx,gy,y=0,dx=0,tail=0,spread=1,a=1,fx=None,fall=0,lead=0,mo=1):
    base=gy-75-y
    for i,(px,py,s) in enumerate([(-50,-28,.7),(-55,28,.65),(15,0,.9)]):
        ex=lead if i==2 else 0; y0=base+py*spread; yy=y0+fall*((gy-14*s)-y0)
        ca1(d,cx+dx+px*spread+ex+fall*i*10,yy,s,tail if i!=1 else -tail,a,belly=1 if fall>0.3 else 0,mo=mo)
    if fx=='lao': d.line([(cx+dx+lead+60,base-10),(cx+dx+lead+76,base+8)],fill=RED,width=4)
    if fx=='dau': d.line([(cx+dx-20,base-55),(cx+dx-8,base-43)],fill=RED,width=3)
ca3_fr={'1-dung':[N(y=v,tail=(1 if i%2 else -1)) for i,v in enumerate((0,4,7,4,0,-3))],
'2-di':[N(y=v,tail=(1 if i%2 else -1),dx=i*7) for i,v in enumerate((0,6,10,5,-2,0))],
'3-bao-don':[N(),N(dx=-6,spread=.95,tail=1),N(dx=-12,spread=.9,y=4),N(dx=-18,spread=.85,y=6,tail=1),N(dx=-22,spread=.82,y=8),N(dx=-24,spread=.8,y=8,tail=1)],
'4-danh':[N(dx=-24,spread=.8,y=8),N(dx=-4,lead=10,tail=1),N(dx=10,lead=40,y=-6),N(dx=20,lead=70,y=-10,fx='lao',tail=1),N(dx=10,lead=20),N()],
'5-trung-don':[N(dx=-25,spread=1.3,y=8,fx='dau',mo=0),N(dx=-14,spread=1.15,y=4,mo=0),N(dx=-6,spread=1.05),N()],
'6-chet':[N(spread=1.2,mo=0),N(fall=.2,spread=1.1,mo=0),N(fall=.5),N(fall=.8),N(fall=.95,a=.55),N(fall=1,a=.2)]}

# ---- SUA: chuong + xuc tu, troi lo lung
def sua(d,cx,gy,y=0,dx=0,sq=0,a=1,fx=None,fall=0,mo=1,wave=0):
    c=col(a); base=gy-95-y; base=base+fall*((gy-30)-base); x=cx+dx
    w=45*(1+sq*0.25); h=38*(1-sq*0.3)*(1-fall*0.5)
    d.chord([x-w,base-h,x+w,base+h*0.4],180,360,outline=c,width=5); d.line([(x-w,base),(x+w,base)],fill=c,width=5)
    mat(d,x+w*0.45,base-h*0.35,c,mo)
    L=60*(1-fall*0.6)
    for k in (-30,-10,10,30):
        pts=[(x+k+math.sin(t*3+wave+k)*6,base+t/3*L) for t in (0,1,2,3)]
        d.line(pts,fill=c,width=4)
    if fx=='dien':
        for k in range(6):
            g=k*math.pi/3; d.line([(x+math.cos(g)*60,base+math.sin(g)*45),(x+math.cos(g)*80,base+math.sin(g)*60)],fill=RED,width=3)
    if fx=='sang': d.line([(x-10,base-h-16),(x+10,base-h-16)],fill=RED,width=3)
    if fx=='dau': d.line([(x-30,base-h-20),(x-18,base-h-8)],fill=RED,width=3)
sua_fr={'1-dung':[N(y=v,sq=s,wave=i) for i,(v,s) in enumerate(((0,0),(4,.3),(8,.5),(6,.2),(2,0),(0,-.1)))],
'2-di':[N(y=v,sq=s,dx=i*7,wave=i) for i,(v,s) in enumerate(((0,.5),(10,-.1),(16,-.2),(12,0),(4,.4),(0,.5)))],
'3-bao-don':[N(sq=0),N(sq=.3,fx='sang'),N(sq=.5,y=-4,fx='sang'),N(sq=.7,y=-6,fx='sang'),N(sq=.8,y=-8,fx='sang'),N(sq=.85,y=-8,fx='sang')],
'4-danh':[N(sq=.85,y=-8),N(sq=-.3,y=6,fx='dien'),N(sq=-.4,y=8,fx='dien'),N(sq=-.2,y=6,fx='dien'),N(sq=.2,y=2),N()],
'5-trung-don':[N(dx=-18,sq=.5,y=6,mo=0,fx='dau'),N(dx=-10,sq=.3,mo=0),N(dx=-4,sq=.1),N()],
'6-chet':[N(sq=.6,mo=0),N(sq=.4,fall=.25,mo=0),N(fall=.5,mo=0),N(fall=.8,mo=0),N(fall=1,a=.55,mo=0),N(fall=1,a=.2,mo=0)]}

# ---- TRON: than tron co gai (ca noc / nhim bien), noi hoac lan
def tron(d,cx,gy,air=20,dx=0,r=1,gai=1,sx=1,sy=1,rot=0,a=1,fx=None,mo=1,duoi=1,lean=0):
    c=col(a); R=38*r; x=cx+dx; y=gy-air-R*sy
    d.ellipse([x-R*sx,y-R*sy,x+R*sx,y+R*sy],outline=c,width=5)
    for k in range(12):
        g=k*math.pi/6+rot
        d.line([(x+math.cos(g)*R*sx,y+math.sin(g)*R*sy),(x+math.cos(g)*(R*sx+14*gai),y+math.sin(g)*(R*sy+14*gai))],fill=c,width=4)
    if duoi: d.line([(x-R*sx,y),(x-R*sx-16,y-12),(x-R*sx-16,y+12),(x-R*sx,y)],fill=c,width=4)
    mat(d,x+R*0.45*sx+lean*6,y-R*0.25,c,mo)
    if fx=='no':
        for k in range(8):
            g=k*math.pi/4; d.line([(x+math.cos(g)*(R+24),y+math.sin(g)*(R+24)),(x+math.cos(g)*(R+44),y+math.sin(g)*(R+44))],fill=RED,width=3)
    if fx=='lao': d.line([(x+R+30,y-12),(x+R+46,y+12)],fill=RED,width=4)
    if fx=='dau': d.line([(x-R,y-R-12),(x-R+12,y-R)],fill=RED,width=3)
tron_fr={'1-dung':[N(air=20+v,r=s) for v,s in ((0,1),(3,1.02),(5,1.04),(3,1.02),(0,1),(-2,.99))],
'2-di':[N(air=20+v,dx=i*8,rot=i*.15) for i,v in enumerate((0,6,10,6,0,-2))],
'3-bao-don':[N(r=1),N(r=1.1,gai=1.2,dx=-4),N(r=1.2,gai=1.4,dx=-8),N(r=1.3,gai=1.6,dx=-10),N(r=1.35,gai=1.7,dx=-12),N(r=1.38,gai=1.8,dx=-12)],
'4-danh':[N(r=1.38,gai=1.8,dx=-12),N(r=1.3,gai=1.8,dx=15,rot=.3,fx='lao'),N(r=1.3,gai=2,dx=40,rot=.6,fx='no'),N(r=1.2,gai=1.6,dx=40,rot=.9),N(r=1.05,dx=25),N(dx=10)],
'5-trung-don':[N(dx=-16,sx=.85,sy=1.1,mo=0,fx='dau'),N(dx=-8,sx=.95,mo=0),N(dx=-3),N()],
'6-chet':[N(r=.95,mo=0),N(r=.9,air=12,mo=0,gai=.8),N(r=.8,air=4,sy=.85,mo=0,gai=.6),N(r=.75,air=0,sy=.7,sx=1.15,mo=0,gai=.5),N(r=.7,air=0,sy=.6,sx=1.2,mo=0,gai=.4,a=.55),N(r=.65,air=0,sy=.5,sx=1.25,mo=0,gai=.3,a=.2)]}

o=sys.argv[1]
for tenL,ve,fr in [('cua',cua,cua_fr),('ca',ca,ca_fr),('ca3',ca3,ca3_fr),('sua',sua,sua_fr),('tron',tron,tron_fr)]:
    for k,v in fr.items(): tam(v,f'{o}/{tenL}-{k}.png',ve)
