# Thư viện vẽ tay/fork cho các đòn chém Lam (South-East)
from PIL import Image
import math
B='/home/claude/new-project/tieng-vong-cuoi-cung/art/huong-moi/lam-pixel/chibi/v3/'
O=(0,0,0,255); SL=(47,69,86,255); SD=(30,44,60,255); G=(199,206,214,255); GD=(120,124,137,255)
S=(214,220,228,255); H=(240,244,250,255); T=(0,0,0,0)
def base_clean():
    f=Image.open(B+'idle-se/idle-se-0.png').convert('RGBA')
    for y in range(42,46):
        for x in range(41,44): f.putpixel((x,y),T)
        f.putpixel((40,y),O)
    for y in range(46,51): f.putpixel((41,y),SD)
    for x,y in [(37,48),(38,48),(36,49),(37,50),(38,50),(36,50),(37,51),(40,49),(41,50)]:
        if f.getpixel((x,y))[3]: f.putpixel((x,y),SD)
    return f
def shift_rows(f,y0,y1,dx,dy):
    src=f.copy()
    for y in range(y0,y1+1):
        for x in range(64):
            f.putpixel((x,y),T) if dx else None
    for y in range(y0,y1+1):
        for x in range(64):
            p=src.getpixel((x,y))
            if p[3] and 0<=x+dx<64 and 0<=y+dy<64: f.putpixel((x+dx,y+dy),p)
def put(f,x,y,c):
    if 0<=x<f.width and 0<=y<f.height: f.putpixel((x,y),c)
def outline(f,pts,only_empty=True):
    s=set(pts)
    for x,y in pts:
        for dx in (-1,0,1):
            for dy in (-1,0,1):
                q=(x+dx,y+dy)
                if q in s or not(0<=q[0]<f.width and 0<=q[1]<f.height): continue
                if (not only_empty) or f.getpixel(q)[3]==0: put(f,q[0],q[1],O)
def line(x0,y0,x1,y1):
    n=max(abs(x1-x0),abs(y1-y0),1)
    return [(round(x0+(x1-x0)*i/n),round(y0+(y1-y0)*i/n)) for i in range(n+1)]
def fork(f,gx,gy,ang,stem=4,prong=3):
    # ang độ: 0 = hướng phải, 90 = hướng lên
    a=math.radians(ang); d=(math.cos(a),-math.sin(a)); n=(-d[1],d[0])
    ex,ey=gx+d[0]*stem,gy+d[1]*stem
    st=line(gx,gy,round(ex),round(ey))
    pr=[]
    for sgn in (-1,1):
        bx,by=ex+n[0]*1.5*sgn,ey+n[1]*1.5*sgn
        pr+=line(round(bx),round(by),round(bx+d[0]*prong),round(by+d[1]*prong))
    cross=line(round(ex+n[0]*1.5),round(ey+n[1]*1.5),round(ex-n[0]*1.5),round(ey-n[1]*1.5))
    pts=list(dict.fromkeys(st+cross+pr))
    outline(f,pts)
    for p in pts: put(f,p[0],p[1],S)
    for p in pr[-1:]+pr[len(pr)//2-1:len(pr)//2]: put(f,p[0],p[1],H)   # đầu chạc sáng
def arm(f,sx,sy,hx,hy):
    pts=line(sx,sy,hx,hy); pts2=[(x,y+1) for x,y in pts]
    outline(f,pts+pts2)
    for p in pts: put(f,p[0],p[1],SL)
    for p in pts2: put(f,p[0],p[1],SD)
def glove(f,hx,hy):
    pts=[(hx,hy),(hx+1,hy),(hx,hy+1),(hx+1,hy+1)]
    outline(f,pts,only_empty=False)
    put(f,hx,hy,G); put(f,hx+1,hy,G); put(f,hx,hy+1,GD); put(f,hx+1,hy+1,G)
