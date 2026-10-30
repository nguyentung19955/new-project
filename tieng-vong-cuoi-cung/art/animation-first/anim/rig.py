# Pixel rig of the locked master: rigid parts (head, body, limbs, sword) placed per frame.
# Parts are never redrawn differently: the head/eyes/body are identical blocks in every frame.
import math
from PIL import Image
O=(26,20,32,255); W=(244,244,238,255); S=(196,198,210,255); R=(214,52,60,255); D=(142,31,44,255)
F=(58,48,64,255); B=(214,224,232,255); BH=(255,255,255,255); H=(90,62,58,255)
SM=(250,250,244,255); SL=(222,236,240,255)

class Canvas:
    def __init__(s,w=64,h=64): s.im=Image.new('RGBA',(w,h))
    def put(s,p,c):
        x,y=p
        if 0<=x<s.im.width and 0<=y<s.im.height: s.im.putpixel((x,y),c)
    def shape(s,px,col,outline=True):
        px=set(px)
        if outline:
            for (x,y) in px:
                for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
                    q=(x+dx,y+dy)
                    if q not in px: s.put(q,O)
        for p in px: s.put(p,col(*p) if callable(col) else col)

def rect(x0,y0,x1,y1,cut=0):
    r={(x,y) for x in range(x0,x1+1) for y in range(y0,y1+1)}
    if cut:
        for c in ((x0,y0),(x1,y0),(x0,y1),(x1,y1)): r.discard(c)
    return r
def line(a,b,th=2):
    (x0,y0),(x1,y1)=a,b; n=max(abs(x1-x0),abs(y1-y0),1); pts=set()
    for i in range(n+1):
        x=round(x0+(x1-x0)*i/n); y=round(y0+(y1-y0)*i/n)
        pts.add((x,y))
        if th>=2: pts.add((x+1,y))
    return pts

def sword(c,hand,ang,length=7):
    """hand = grip pixel; ang degrees (0=right, 90=down)."""
    dx,dy=math.cos(math.radians(ang)),math.sin(math.radians(ang))
    hx,hy=hand
    P=lambda t,o=0:(round(hx+dx*t-dy*o),round(hy+dy*t+dx*o))
    blade=set()
    for t in range(4,4+length):
        blade.add(P(t)); blade.add(P(t,0.9))
    c.shape(blade,lambda x,y:B)
    # highlight on the leading edge
    for t in range(4,4+length):
        q=P(t,0.9)
        if q in blade: c.put(q,BH)
    c.shape({P(1),P(2)},H)
    c.shape({P(3,-1),P(3),P(3,1)},H)

def smear(c,cx,cy,r0,r1,a0,a1,taper=True):
    """White crescent along an arc from angle a0 to a1 (deg), thickest at the a1 end."""
    pts=set(); n=int(abs(a1-a0)*2)+1
    for i in range(n+1):
        t=i/n; a=math.radians(a0+(a1-a0)*t)
        inner=r1-(r1-r0)*(t if taper else 1)
        r=inner
        while r<=r1:
            pts.add((round(cx+math.cos(a)*r),round(cy+math.sin(a)*r))); r+=0.5
    c.shape(pts,SM)
def speedline(c,cx,cy,r,a0,a1,col=SL):
    n=int(abs(a1-a0)*2)+1
    for i in range(n+1):
        a=math.radians(a0+(a1-a0)*i/n); c.put((round(cx+math.cos(a)*r),round(cy+math.sin(a)*r)),col)

def char(p):
    """p: dict of offsets. Defaults reproduce the master pose."""
    g=lambda k,d=0:p.get(k,d)
    c=Canvas()
    bx,by=g('bx'),g('by')            # body/hip offset
    hx,hy=g('hx',bx),g('hy',by)      # head offset (defaults follow body)
    sq=g('sq')                        # body squash in rows (top moves down)
    if g('pre'): g('pre')(c)
    if g('sback'): sword(c,g('hand'),g('ang'),g('slen',7))
    # back arm
    if 'barm' in p:
        c.shape(line((25+bx,43+by+sq),p['barm']),S)
    else:
        c.shape(rect(23+bx,44+by+sq,24+bx,47+by),S)
    # back leg: hip fixed to body, foot offset
    fbx,fby=g('fb',(0,0))
    c.shape(line((27+bx,52+by),(27+fbx,55+fby)) | rect(26+fbx,52+by,28+fbx,56+fby) if fbx==bx and fby==by else line((27+bx,52+by),(27+fbx,55+fby),2)|{(28+fbx,56+fby),(27+fbx,56+fby),(26+fbx,56+fby)},S)
    c.shape(rect(26+fbx,57+fby,29+fbx,58+fby),F)
    # body
    c.shape(rect(25+bx,41+by+sq,34+bx,51+by,cut=1),lambda x,y: D if (x<=26+bx or y>=50+by) else R)
    # front leg
    ffx,ffy=g('ff',(0,0))
    if ffx==bx and ffy==by:
        c.shape(rect(31+bx,52+by,33+bx,56+by),W)
    else:
        c.shape(line((31+bx,52+by),(31+ffx,55+ffy),2)|{(31+ffx,56+ffy),(32+ffx,56+ffy),(33+ffx,56+ffy),(32+bx,52+by),(33+bx,52+by)},W)
    c.shape(rect(31+ffx,57+ffy,35+ffx,58+ffy),F)
    # head (rigid block)
    c.shape(rect(21+hx,25+hy,37+hx,39+hy,cut=1),lambda x,y: S if (x<=22+hx or y>=38+hy) else W)
    for ex in (30,31,34,35):
        for ey in ((31,) if g('blink') else (30,31,32)):
            c.put((ex+hx,ey+hy),O)
    if g('mid'): g('mid')(c)
    # sword + front arm
    sh=g('sh',(34+bx,43+by+sq))
    if g('sword',True):
        hand=g('hand',(36+bx,49+by)); ang=g('ang',45)
        if 'hand' in p or 'ang' in p:
            if not g('sback'): sword(c,hand,ang,g('slen',7))
            c.shape(line(sh,(hand[0]-1,hand[1]),2),W)
        else:
            c.shape({(37+bx,49+by),(38+bx,49+by)},H)
            c.shape({(39+bx,48+by),(39+bx,49+by),(39+bx,50+by)},H)
            bl=set()
            for i in range(6): bl|={(40+i+bx,50+i+by),(41+i+bx,50+i+by)}
            c.shape(bl,lambda x,y: BH if x-y==-10+bx-by else B)
            c.shape({(x,y) for x in (34+bx,35+bx) for y in range(43+by+sq,49+by)}|{(35+bx,49+by),(36+bx,49+by),(36+bx,48+by)},W)
    else:
        c.shape(line(sh,g('hand'),2),W)
    if g('post'): g('post')(c)
    return c.im
