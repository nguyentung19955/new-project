import math
from PIL import Image,ImageDraw
S=4; N=12
# one-leg cycle (thigh deg from vertical, +forward ; knee bend deg)
TH=[30,15,0,-25,-40,-38,-20,0,30,50,52,42]
KN=[12,40,22,8,25,75,105,125,100,65,25,12]
ARM=lambda i: -TH[i%12]*1.0
def leg(h,i):
    a=math.radians(TH[i%12]); k=math.radians(KN[i%12])
    kn=(h[0]+20*math.sin(a),h[1]+20*math.cos(a)); s=a-k
    an=(kn[0]+20*math.sin(s),kn[1]+20*math.cos(s))
    fs=max(s,-0.3) if True else s
    toe=(an[0]+7*math.cos(fs),an[1]-7*math.sin(fs))
    return kn,an,toe
frames=[]
for i in range(N):
    h0=(48,0)
    R=leg(h0,i); L=leg(h0,i+6)
    low=max(R[1][1],L[1][1],R[2][1],L[2][1])
    hy=88-low
    if i%6 in (4,5): hy-=2.5      # flight
    frames.append((hy,i))
cols={'t':((106,44,160),(55,18,95)),'p':((255,138,0),(140,65,0)),'lt':((31,79,160),(12,35,85)),'lp':((255,210,0),(140,110,0))}
def cap(dr,a,b,w,c):
    for ww,cc in ((w+8,c[1]),(w,c[0])):
        dr.line([a,b],fill=cc,width=int(ww))
        for (x,y) in (a,b): dr.ellipse([x-ww/2,y-ww/2,x+ww/2,y+ww/2],fill=cc)
CW,CH=80*S,94*S; G=40
img=Image.new('RGB',(N*CW+(N-1)*G,CH),(0,255,0))
for hy,i in frames:
    cell=Image.new('RGB',(96*S,96*S),(0,255,0)); dr=ImageDraw.Draw(cell)
    sc=lambda p:(p[0]*S,p[1]*S)
    hip=(48,hy); lean=math.radians(12)
    chest=(hip[0]+24*math.sin(lean),hip[1]-24*math.cos(lean))
    head=(chest[0]+3,chest[1]-11)
    def arm(side,ang):
        sh=(chest[0],chest[1]+1)
        a=math.radians(ang); e=math.radians(105 if ang>0 else 40)
        el=(sh[0]+14*math.sin(a),sh[1]+14*math.cos(a)); f=a+e
        wr=(el[0]+13*math.sin(f),el[1]+13*math.cos(f))
        return sh,el,wr
    aR=arm('p',ARM(i)); aL=arm('t',ARM(i+6))
    lR=leg(hip,i); lL=leg(hip,i+6)
    # far side first
    for p in (aL,):
        cap(dr,sc(p[0]),sc(p[1]),32,cols['t']); cap(dr,sc(p[1]),sc(p[2]),28,cols['t']); x,y=sc(p[2]); dr.ellipse([x-17,y-17,x+17,y+17],fill=cols['t'][0],outline=cols['t'][1],width=4)
    cap(dr,sc(hip),sc(lL[0]),40,cols['lt']); cap(dr,sc(lL[0]),sc(lL[1]),34,cols['lt']); cap(dr,sc(lL[1]),sc(lL[2]),24,cols['lt'])
    cap(dr,sc(hip),sc(chest),66,((45,45,45),(0,0,0)))
    x,y=sc(hip); dr.rectangle([x-30,y-30,x+30,y-18],fill=(205,30,30))
    cap(dr,sc(hip),sc(lR[0]),40,cols['lp']); cap(dr,sc(lR[0]),sc(lR[1]),34,cols['lp']); cap(dr,sc(lR[1]),sc(lR[2]),24,cols['lp'])
    x,y=sc(head); r=9*S
    dr.ellipse([x-r,y-r,x+r,y+r],fill=(230,170,120),outline=(0,0,0),width=4); dr.pieslice([x-r,y-r,x+r,y+r],160,360,fill=(20,20,20))
    dr.ellipse([x+r*0.4,y+2,x+r*0.4+16,y+18],fill=(220,0,0))
    p=aR; cap(dr,sc(p[0]),sc(p[1]),32,cols['p']); cap(dr,sc(p[1]),sc(p[2]),28,cols['p']); x,y=sc(p[2]); dr.ellipse([x-17,y-17,x+17,y+17],fill=cols['p'][0],outline=cols['p'][1],width=4)
    dr.line([(0,88*S+12),(96*S,88*S+12)],fill=(0,150,0),width=3)
    img.paste(cell.crop((8*S,0,88*S,94*S)),(i*(CW+G),0))
img.save('/tmp/claude-0/-home-claude/52818104-cc44-5676-9a9e-80d37d57856b/scratchpad/manne/chay3.png')
