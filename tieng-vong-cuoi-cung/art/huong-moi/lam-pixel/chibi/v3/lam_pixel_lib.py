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

# ---------- Kiếm âm thanh: fork = chuôi/chắn tay, lưỡi sáng bung ra giữa hai chạc ----------
BC=(120,230,230,255); BCW=(230,255,255,255); BA=(255,190,80,255)
def weapon(f,hx,hy,ang,blade=0,pommel=1,stem=3,prong=3):
    """Vẽ fork cầm như kiếm tại tay (hx,hy), góc ang (độ, từ tay tới mũi). blade>0: lưỡi âm thanh dài blade px."""
    a=math.radians(ang); d=(math.cos(a),-math.sin(a)); n=(-d[1],d[0])
    bx,by=hx-d[0]*pommel,hy-d[1]*pommel
    jx,jy=hx+d[0]*stem,hy+d[1]*stem
    st=line(round(bx),round(by),round(jx),round(jy))
    pr=[];cross=line(round(jx+n[0]*1.6),round(jy+n[1]*1.6),round(jx-n[0]*1.6),round(jy-n[1]*1.6))
    for sgn in (-1,1):
        px,py=jx+n[0]*1.6*sgn,jy+n[1]*1.6*sgn
        pr+=line(round(px),round(py),round(px+d[0]*prong),round(py+d[1]*prong))
    fk=list(dict.fromkeys(st+cross+pr))
    bl=[]
    if blade:
        ex,ey=jx+d[0]*blade,jy+d[1]*blade
        core=line(round(jx+d[0]),round(jy+d[1]),round(ex),round(ey))
        e1=line(round(jx+d[0]+n[0]),round(jy+d[1]+n[1]),round(ex-d[0]+n[0]),round(ey-d[1]+n[1]))
        e2=line(round(jx+d[0]-n[0]),round(jy+d[1]-n[1]),round(ex-d[0]-n[0]),round(ey-d[1]-n[1]))
        bl=(core,e1,e2)
        outline(f,core+e1+e2+fk)
        for p in e1+e2: put(f,p[0],p[1],BA)
        for p in core: put(f,p[0],p[1],BC)
        for p in core[:len(core)//2]: put(f,p[0],p[1],BCW)
    else:
        outline(f,fk)
    for p in fk: put(f,p[0],p[1],S)
    for p in [pr[len(pr)//2-1],pr[-1]]: put(f,p[0],p[1],H)
def smear(f,cx,cy,r,a0,a1,th=3,col_in=BCW,col=BC,col_out=BA):
    """Vệt mờ cung (pixel) tâm (cx,cy) bán kính r, từ góc a0 tới a1 (độ), dày th."""
    lo,hi=min(a0,a1),max(a0,a1)
    for t10 in range(int(lo*10),int(hi*10)+1,8):
        a=math.radians(t10/10)
        for k in range(th):
            rr=r-k; c=col_out if k==0 else (col if k<th-1 else col_in)
            put(f,round(cx+rr*math.cos(a)),round(cy-rr*math.sin(a)),c)
def erase_fork(f,box=(39,40,45,51)):
    """Xoá fork gốc (điểm bạc sáng + viền nhô ra) trong hộp, lấp bằng màu tối thân."""
    x0,y0,x1,y1=box
    for y in range(y0,y1+1):
        for x in range(x0,x1+1):
            p=f.getpixel((x,y))
            if p[3] and min(p[:3])>90 and max(p[:3])-min(p[:3])<45: f.putpixel((x,y),SD)
    # bỏ viền đen nhô ra ngoài thân (cột không có màu thân bên trái)
    for y in range(y0,y1+1):
        for x in range(x1,x0-1,-1):
            p=f.getpixel((x,y))
            if p[3]==0: continue
            if p[:3]==(0,0,0) and (x+1>=64 or f.getpixel((x+1,y))[3]==0):
                l=f.getpixel((x-1,y))
                if l[:3] in [(0,0,0),SD[:3]] and f.getpixel((x-2,y))[:3] in [(0,0,0),SD[:3]]:
                    f.putpixel((x,y),(0,0,0,0)); continue
            break
CYD=(70,150,160,255)
def smear2(f,cx,cy,R,a_from,a_to,thmax=8,amber=True,shear=(0,0)):
    """Vệt mờ hình lưỡi liềm: mảnh ở góc bắt đầu, dày dần tới góc kết thúc (vị trí lưỡi kiếm)."""
    n=max(int(abs(a_to-a_from))*2,1)
    for i in range(n+1):
        u=i/n; t=math.radians(a_from+(a_to-a_from)*u)
        th=1+(thmax-1)*(u**1.4)
        for k in range(int(round(th))+1):
            rr=R-k*0.9
            if k==0: c=BCW
            elif k<=max(1,th*0.35): c=BC
            else: c=CYD
            y=cy-rr*math.sin(t); v=(y-cy)/R; dx=shear[0]*v if v>0 else shear[1]*(-v)
            put(f,round(cx+rr*math.cos(t)+dx),round(y),c)
        if amber and u>0.25:
            y=cy-(R+1)*math.sin(t); v=(y-cy)/R; dx=shear[0]*v if v>0 else shear[1]*(-v)
            put(f,round(cx+(R+1)*math.cos(t)+dx),round(y),BA)
