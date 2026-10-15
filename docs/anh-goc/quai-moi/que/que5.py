# Khung que vùng 4 Sông sâu (Bước 3 · Phiên 0): ran (rắn trườn), ran3 (bầy 3 con nhỏ — Đỉa Trâu), vo2 (vỏ hai mảnh — Trai Sông Gai).
# Cùng kiểu que4.py: ô 300×230, cách 40, vạch đất y=150, nét đen trên nền trắng, nét đỏ là hiệu ứng;
# tấm 6 khung 2080×320, tấm trúng đòn 4 khung 1400×320. Chạy: python3 que5.py <thư mục ra>
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
    px=im.load()
    for i in range(n+1):   # khe giữa các ô phải trắng: hình không tràn khỏi ô
        x0=i*(PW+GAP)+2
        for x in range(x0,x0+GAP-4):
            for y in range(0,320,2):
                if px[x,y]!=(255,255,255): sys.exit(f'{ten}: hình tràn khỏi ô (khe {i}, x={x}, y={y})')
    for i in range(n):
        ox=GAP+i*(PW+GAP)+3
        for x in range(ox,ox+PW-5):
            for y in (43,44,40+PH-3):
                if px[x,y] not in ((255,255,255),(200,200,200)) and not (y==44 and x<ox+20): sys.exit(f'{ten}: hình chạm mép ô {i+1} (x={x}, y={y})')
    im.save(ten)
N=dict
def mat(d,x,y,c,mo=1,r=5):
    if mo: d.ellipse([x-r,y-r,x+r,y+r],fill=c)
    else: d.line([(x-r-2,y-r),(x+r+2,y+r)],fill=c,width=3); d.line([(x-r-2,y+r),(x+r+2,y-r)],fill=c,width=3)

# ---- RAN: rắn trườn sát đất. coil=1: cuộn tròn, cổ ngóc lên; còn lại thân uốn sóng chữ S, cổ nối lên đầu.
def ran1(d,x,gy,s=1.25,L=130,amp=10,ph=0,freq=1.5,lift=26,coil=0,bend=0,hdx=0,a=1,mo=1,tongue=0,w=8):
    c=col(a); w=max(3,int(w*s))
    if coil:
        cx=x-14*s
        d.ellipse([cx-46*s,gy-26*s,cx+46*s,gy-2*s],outline=c,width=w)          # vòng dưới
        d.ellipse([cx-32*s,gy-40*s,cx+30*s,gy-18*s],outline=c,width=w)          # vòng trên
        d.line([(cx-46*s,gy-14*s),(cx-62*s,gy-8*s),(cx-70*s,gy-4*s)],fill=c,width=max(3,w-3))  # chóp đuôi
        nx,ny=cx+26*s,gy-30*s
    else:
        pts=[]; n=28
        for i in range(n+1):
            t=i/n; xx=x-L*s/2+L*s*t
            env=0.35+0.65*math.sin(math.pi*min(1,t*1.1))                       # đuôi và cổ ít uốn hơn giữa thân
            yy=gy-9*s-amp*s*env*math.sin(2*math.pi*freq*t+ph)-bend*34*s*math.sin(math.pi*t)
            pts.append((xx,yy))
        for i in range(n):  # đuôi nhỏ dần
            ww=max(3,int(w*(0.45+0.55*min(1,i/8))))
            d.line([pts[i],pts[i+1]],fill=c,width=ww)
        nx,ny=pts[-1]
    hx,hy=nx+14*s+hdx*s,gy-lift*s
    d.line([(nx,ny),((nx+hx)/2+4*s,(ny+hy)/2+6*s),(hx-8*s,hy)],fill=c,width=w)   # cổ
    d.ellipse([hx-14*s,hy-9*s,hx+16*s,hy+8*s],outline=c,width=max(3,int(5*s)))  # đầu
    mat(d,hx+5*s,hy-2*s,c,mo,max(2,int(4*s)))
    if tongue: tx=hx+16*s; d.line([(tx,hy+3*s),(tx+12*s,hy+3*s)],fill=RED,width=3); d.line([(tx+12*s,hy+3*s),(tx+18*s,hy-2*s)],fill=RED,width=2); d.line([(tx+12*s,hy+3*s),(tx+18*s,hy+8*s)],fill=RED,width=2)
    return hx,hy
def ran(d,cx,gy,dx=0,fx=None,**k):
    hx,hy=ran1(d,cx+dx,gy,**k)
    if fx=='lao': d.line([(hx+24,hy-14),(hx+34,hy+10)],fill=RED,width=4); d.line([(hx+32,hy-18),(hx+42,hy+6)],fill=RED,width=3)
    if fx=='dau': d.line([(hx-26,hy-28),(hx-14,hy-16)],fill=RED,width=3)
    if fx=='canh': d.line([(hx,hy-26),(hx,hy-18)],fill=RED,width=3); d.line([(hx-12,hy-22),(hx-7,hy-16)],fill=RED,width=3); d.line([(hx+12,hy-22),(hx+7,hy-16)],fill=RED,width=3)
ran_fr={'1-dung':[N(coil=1,lift=l,hdx=h,tongue=t) for l,h,t in ((50,0,0),(52,2,0),(54,4,1),(52,2,0),(50,0,0),(48,-2,0))],
'2-di':[N(dx=i*7-24,ph=i*math.pi/3,amp=11,lift=22+(i%2)*2) for i in range(6)],
'3-bao-don':[N(amp=11,lift=22),N(dx=-4,amp=13,L=122,freq=1.7,lift=27,hdx=-6),N(dx=-8,amp=15,L=112,freq=1.9,lift=32,hdx=-12,fx='canh'),
             N(dx=-12,amp=17,L=104,freq=2.1,lift=36,hdx=-18,fx='canh'),N(dx=-14,amp=18,L=100,freq=2.2,lift=38,hdx=-20,fx='canh'),N(dx=-14,amp=18,L=100,freq=2.2,lift=38,hdx=-20,fx='canh',tongue=1)],
'4-danh':[N(dx=-14,amp=18,L=100,freq=2.2,lift=38,hdx=-20),N(dx=-24,amp=10,L=130,freq=1.5,lift=26,hdx=6),N(dx=-44,amp=3,L=150,freq=1,lift=16,hdx=26,tongue=1,fx='lao'),
          N(dx=-42,amp=3,L=150,freq=1,lift=16,hdx=28,tongue=1,fx='lao'),N(dx=-20,amp=8,L=138,freq=1.4,lift=20,hdx=10),N(amp=11,lift=22)],
'5-trung-don':[N(dx=-18,bend=.8,amp=4,lift=40,hdx=-26,mo=0,fx='dau'),N(dx=-10,bend=.45,amp=7,lift=32,hdx=-12,mo=0),N(dx=-4,bend=.15,amp=9,lift=26),N(amp=11,lift=22)],
'6-chet':[N(dx=-6,bend=.5,amp=6,lift=34,mo=0),N(dx=-6,bend=.2,amp=5,lift=20,mo=0),N(dx=-10,amp=3,lift=12,mo=0,L=140),N(dx=-12,amp=1,lift=8,mo=0,L=146),N(dx=-12,amp=0,lift=8,mo=0,L=146,a=.55),N(dx=-12,amp=0,lift=8,mo=0,L=146,a=.2)]}

# ---- RAN3: ba con nhỏ của ran xếp so le (Bầy Đỉa Trâu). Con sau vẽ trước; con dẫn đầu (i=2) lao xa nhất khi đánh.
RAN3_VT=[(-58,-26,.62),(-34,0,.68),(34,-13,.74)]   # (lệch x, lệch đất y, cỡ)
def ran3(d,cx,gy,dx=0,spread=1,lead=0,fx=None,**k):
    hx=hy=0
    for i,(px,py,s) in enumerate(RAN3_VT):
        kk=dict(k); kk['s']=s; kk.setdefault('w',11); kk['L']=k.get('L',140)*0.78; kk['ph']=k.get('ph',0)+i*1.3
        hx,hy=ran1(d,cx+dx+px*spread+(lead if i==2 else 0),gy+py*spread,**kk)
    if fx=='lao': d.line([(hx+22,hy-12),(hx+36,hy+8)],fill=RED,width=4)
    if fx=='dau': d.line([(cx+dx-40,gy-80),(cx+dx-28,gy-68)],fill=RED,width=3)
    if fx=='canh': d.line([(hx,hy-22),(hx,hy-14)],fill=RED,width=3)
ran3_fr={'1-dung':[N(amp=a_,ph=i*math.pi/3,lift=22+(i%2)*3) for i,a_ in enumerate((10,12,14,12,10,8))],
'2-di':[N(dx=i*8-20,ph=i*math.pi/3,amp=14,lift=22) for i in range(6)],
'3-bao-don':[N(amp=12,lift=22),N(dx=-4,spread=.95,amp=13,L=130,freq=1.6,lift=30,hdx=-6),N(dx=-8,spread=.9,amp=14,L=120,freq=1.75,lift=38,hdx=-12,fx='canh'),
             N(dx=-12,spread=.86,amp=15,L=112,freq=1.85,lift=44,hdx=-18,fx='canh'),N(dx=-14,spread=.84,amp=15,L=108,freq=1.9,lift=46,hdx=-20,fx='canh'),N(dx=-14,spread=.84,amp=15,L=108,freq=1.9,lift=46,hdx=-20,fx='canh')],
'4-danh':[N(dx=-14,spread=.84,amp=15,L=108,freq=1.9,lift=46,hdx=-20),N(dx=-4,lead=12,amp=12,L=150,lift=30,hdx=8),N(dx=-34,lead=30,amp=5,L=160,freq=1,lift=18,hdx=20,fx='lao'),
          N(dx=-40,lead=42,amp=5,L=160,freq=1,lift=16,hdx=22,fx='lao'),N(dx=-6,lead=20,amp=10,L=160,lift=22),N(amp=12,lift=22)],
'5-trung-don':[N(dx=-20,spread=1.3,bend=.9,amp=4,lift=40,hdx=-20,mo=0,fx='dau'),N(dx=-12,spread=1.15,bend=.5,amp=7,lift=32,mo=0),N(dx=-5,spread=1.05,bend=.2,amp=10,lift=26),N(amp=12,lift=22)],
'6-chet':[N(spread=1.15,bend=.5,amp=6,lift=34,mo=0),N(spread=1.2,bend=.2,amp=4,lift=20,mo=0),N(spread=1.25,amp=2,lift=12,mo=0,L=170),N(spread=1.3,amp=0,lift=9,mo=0,L=180),
          N(spread=1.3,amp=0,lift=9,mo=0,L=180,a=.55),N(spread=1.3,amp=0,lift=9,mo=0,L=180,a=.2)]}

# ---- VO2: vỏ hai mảnh (con trai) nhìn ngang, bản lề ở sau (trái), miệng vỏ hướng phải.
# mo: độ há (radian của mảnh trên), chan: chân thịt thò ra trước-dưới (0..1, buoc: nhịp lết), ngoc: viên ngọc (0 ẩn .. 1 sáng),
# rung: rung khép chặt, vo: vỡ vỏ (0..1, hai mảnh tách và rơi), fx: 'sang' tia đỏ chỗ ngọc · 'ban' 5 chấm đỏ hình quạt · 'dau'.
def _manh(d,hx,hy,W,H,ang,up,c,gai=1,vet=0):
    pts=[]
    for i in range(17):
        t=math.pi*i/16; px=W/2*(1-math.cos(t)); py=(-1 if up else 1)*H*math.sin(t)*(1 if up else .8)
        r=-ang if up else ang
        pts.append((hx+px*math.cos(r)-py*math.sin(r),hy+px*math.sin(r)+py*math.cos(r)))
    d.line(pts+[pts[0]],fill=c,width=5,joint='curve')
    if up and gai:
        for i in (4,7,10,13):
            (x0,y0),(x1,y1)=pts[i-1],pts[i+1]; nx,ny=(y1-y0),-(x1-x0); L=math.hypot(nx,ny) or 1
            mx,my=pts[i]; d.line([(mx,my),(mx+nx/L*12,my+ny/L*12)],fill=c,width=4)
    for i in (5,9,12):   # gờ vỏ
        mx,my=pts[i]; d.line([(mx,my),(hx+(mx-hx)*.45,hy+(my-hy)*.45)],fill=GR,width=2)
    if vet:
        mx,my=pts[8]; d.line([(mx,my),(mx+6,my+(14 if up else -14)),(mx-4,my+(24 if up else -24))],fill=c,width=3)
    return pts
def vo2(d,cx,gy,dx=0,mo=0.0,chan=0,buoc=0,ngoc=0,rung=0,vo=0,a=1,mat_mo=1,fx=None,lean=0):
    c=col(a); W,H=110,30; x=cx+dx+(3 if rung and rung%2 else -3 if rung else 0)
    hx,hy=x-W/2,gy-26-lean*4
    if vo:
        _manh(d,hx-18*vo,hy+vo*20,W,H,0.5*vo,True,c,vet=1)
        _manh(d,hx+10*vo,hy+6*vo,W,H,-0.15*vo,False,c,vet=1)
        for k in range(4):   # mảnh vụn
            px=hx+30+k*22; py=gy-6-(k%2)*6; d.polygon([(px,py),(px+8,py-4),(px+10,py+3)],outline=c)
        return
    if chan:   # chân thịt lết ra phía trước-dưới
        fx0=hx+W*0.75; sx=(1 if buoc%2 else -1)*6
        d.line([(fx0,gy-12),(fx0+20*chan+sx,gy-4),(fx0+34*chan+sx,gy-2)],fill=c,width=6)
    top=_manh(d,hx,hy,W,H,mo,True,c)
    _manh(d,hx,hy,W,H,mo*0.15,False,c,gai=0)
    tip=top[-1]
    if mo>0.15:   # lòng vỏ: ngọc + mắt
        px,py=hx+W*0.55,hy-W*0.5*math.sin(mo*0.55)*0.8
        r=6+6*ngoc
        d.ellipse([px-r,py-r,px+r,py+r],outline=c,width=4)
        if ngoc>0.5: d.ellipse([px-3,py-3,px+3,py+3],fill=c)
        mat(d,hx+W*0.8,hy-10-20*mo,c,mat_mo,4); mat(d,hx+W*0.9,hy-10-20*mo,c,mat_mo,4)
        if fx=='sang':
            for k in range(8):
                g=k*math.pi/4; d.line([(px+math.cos(g)*(r+6),py+math.sin(g)*(r+6)),(px+math.cos(g)*(r+16),py+math.sin(g)*(r+16))],fill=RED,width=3)
        if fx=='ban':
            for k in range(5):
                g=-0.7+k*0.35; bx,by=px+math.cos(g)*(70+abs(k-2)*4),py+math.sin(g)*70
                d.line([(px+math.cos(g)*(r+8),py+math.sin(g)*(r+8)),(bx-math.cos(g)*10,by-math.sin(g)*10)],fill=RED,width=2)
                d.ellipse([bx-6,by-6,bx+6,by+6],fill=RED)
    else:   # khép: hai mắt nhỏ nhìn ra từ khe vỏ
        mat(d,hx+W*0.86,hy-4,c,mat_mo,3); mat(d,hx+W*0.94,hy-4,c,mat_mo,3)
    if rung:
        for k in (-1,1): d.line([(hx-14,hy+k*10),(hx-24,hy+k*14)],fill=c,width=3); d.line([(hx+W+8,hy-14+k*6),(hx+W+18,hy-16+k*8)],fill=c,width=3)
    if fx=='dau': d.line([(hx+20,hy-46),(hx+32,hy-34)],fill=RED,width=3)
vo2_fr={'1-dung':[N(mo=m,mat_mo=1 if i!=3 else 0) for i,m in enumerate((0,.05,.1,.05,0,0))],
'2-di':[N(dx=i*7-18,chan=1,buoc=i,mo=.03) for i in range(6)],
'3-bao-don':[N(mo=.1),N(mo=.3,ngoc=.3,dx=-3),N(mo=.5,ngoc=.5,dx=-6,fx='sang'),N(mo=.7,ngoc=.7,dx=-8,fx='sang'),N(mo=.85,ngoc=.9,dx=-10,fx='sang'),N(mo=.9,ngoc=1,dx=-10,fx='sang')],
'4-danh':[N(mo=.9,ngoc=1,dx=-10,fx='sang'),N(mo=1.05,ngoc=1,dx=-4,fx='ban'),N(mo=1.0,ngoc=.6,dx=0,fx='ban'),N(mo=.8,ngoc=.4,dx=0),N(mo=.4,ngoc=.2),N(mo=.05)],
'5-trung-don':[N(dx=-16,rung=1,mat_mo=0,fx='dau',lean=1),N(dx=-10,rung=2,mat_mo=0),N(dx=-4,rung=1),N()],
'6-chet':[N(rung=1,mat_mo=0),N(rung=2,mat_mo=0,dx=-2),N(vo=.3),N(vo=.6),N(vo=1,a=.55),N(vo=1,a=.2)]}

o=sys.argv[1] if len(sys.argv)>1 else '.'
for tenL,ve,fr in [('ran',ran,ran_fr),('ran3',ran3,ran3_fr),('vo2',vo2,vo2_fr)]:
    for k,v in fr.items(): tam(v,f'{o}/{tenL}-{k}.png',ve)
