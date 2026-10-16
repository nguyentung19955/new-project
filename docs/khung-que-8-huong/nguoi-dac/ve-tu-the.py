import math,sys,json
from PIL import Image,ImageDraw
S=4
cols={'t':((106,44,160),(55,18,95)),'p':((255,138,0),(140,65,0)),'lt':((31,79,160),(12,35,85)),'lp':((255,210,0),(140,110,0))}
def cap(dr,a,b,w,c):
    for ww,cc in ((w+8,c[1]),(w,c[0])):
        dr.line([a,b],fill=cc,width=int(ww))
        for (x,y) in (a,b): dr.ellipse([x-ww/2,y-ww/2,x+ww/2,y+ww/2],fill=cc)
V=lambda p,ang,L:(p[0]+L*math.sin(math.radians(ang)),p[1]+L*math.cos(math.radians(ang)))
def leg(h,th,kn):
    k=V(h,th,20); s=th-kn; a=V(k,s,20); fs=max(math.radians(s),-0.3)
    return k,a,(a[0]+7*math.cos(fs),a[1]-7*math.sin(fs))
def ve(frames,out):
    N=len(frames); CW,CH=96*S,112*S; G=40
    img=Image.new('RGB',(N*CW+(N-1)*G,CH),(0,255,0))
    for i,f in enumerate(frames):
        cell=Image.new('RGB',(120*S,114*S),(0,255,0)); dr=ImageDraw.Draw(cell)
        sc=lambda p:((p[0]+12)*S,(p[1]+18)*S)
        h0=(48+f.get('dx',0),0)
        lR=leg(h0,*f['lp']); lL=leg(h0,*f['lt'])
        hy=88-max(lR[1][1],lL[1][1],lR[2][1],lL[2][1])
        hip=(h0[0],hy); lR=leg(hip,*f['lp']); lL=leg(hip,*f['lt'])
        lean=f.get('lean',8); chest=V(hip,180-lean,24); head=V(chest,180-lean,11); head=(head[0]+2,head[1])
        def arm(u,fo):
            sh=(chest[0],chest[1]+1); el=V(sh,u,14); wr=V(el,fo,13); return sh,el,wr
        aR=arm(*f['ap']); aL=arm(*f['at'])
        for p in (aL,):
            cap(dr,sc(p[0]),sc(p[1]),30,cols['t']); cap(dr,sc(p[1]),sc(p[2]),26,cols['t']); x,y=sc(p[2]); dr.ellipse([x-16,y-16,x+16,y+16],fill=cols['t'][0],outline=cols['t'][1],width=4)
        cap(dr,sc(hip),sc(lL[0]),40,cols['lt']); cap(dr,sc(lL[0]),sc(lL[1]),34,cols['lt']); cap(dr,sc(lL[1]),sc(lL[2]),24,cols['lt'])
        cap(dr,sc(hip),sc(chest),66,((45,45,45),(0,0,0)))
        x,y=sc(V(hip,180-lean,3)); dr.rectangle([x-30,y-6,x+30,y+6],fill=(205,30,30))
        cap(dr,sc(hip),sc(lR[0]),40,cols['lp']); cap(dr,sc(lR[0]),sc(lR[1]),34,cols['lp']); cap(dr,sc(lR[1]),sc(lR[2]),24,cols['lp'])
        x,y=sc(head); r=9*S
        dr.ellipse([x-r,y-r,x+r,y+r],fill=(230,170,120),outline=(0,0,0),width=4); dr.pieslice([x-r,y-r,x+r,y+r],160,360,fill=(20,20,20))
        dr.ellipse([x+r*0.4,y+2,x+r*0.4+16,y+18],fill=(220,0,0))
        p=aR; cap(dr,sc(p[0]),sc(p[1]),30,cols['p']); cap(dr,sc(p[1]),sc(p[2]),26,cols['p'])
        b=math.radians(f['blade']); w=sc(p[2]); tip=(w[0]+26*S*math.cos(b),w[1]-26*S*math.sin(b))
        for k in range(0,26,3):
            a0=(w[0]+(k+2)*S*math.cos(b),w[1]-(k+2)*S*math.sin(b)); a1=(w[0]+(k+4)*S*math.cos(b),w[1]-(k+4)*S*math.sin(b))
            dr.line([a0,a1],fill=(230,0,0),width=10)
        x,y=w; dr.ellipse([x-16,y-16,x+16,y+16],fill=cols['p'][0],outline=cols['p'][1],width=4)
        if f.get('hit'): dr.text((10,10),'HIT',fill=(230,0,0))
        dr.line([(0,106*S+12),(120*S,106*S+12)],fill=(0,150,0),width=3)
        img.paste(cell.crop((12*S,0,108*S,112*S)),(i*(CW+G),0))
    img.save(out)
G=[30,10];B=[-25,5]
K1=[dict(lean=-4,lp=G,lt=B,ap=(-150,-175),at=(-15,70),blade=125),
    dict(lean=4,lp=G,lt=B,ap=(140,110),at=(-20,60),blade=80),
    dict(lean=12,dx=3,lp=(35,30),lt=(-30,5),ap=(85,85),at=(-40,30),blade=0,hit=1),
    dict(lean=16,dx=4,lp=(35,35),lt=(-30,8),ap=(35,20),at=(-45,20),blade=-60),
    dict(lean=6,dx=1,lp=G,lt=B,ap=(30,105),at=(-15,70),blade=45)]
K2=[dict(lean=12,lp=(30,40),lt=(-20,30),ap=(-45,-60),at=(-10,70),blade=-135),
    dict(lean=8,lp=(30,30),lt=(-25,20),ap=(25,40),at=(-20,60),blade=-25),
    dict(lean=0,dx=2,lp=(30,10),lt=(-25,5),ap=(115,125),at=(-35,30),blade=55,hit=1),
    dict(lean=-8,dx=2,lp=G,lt=B,ap=(170,-170),at=(-35,40),blade=115),
    dict(lean=6,lp=G,lt=B,ap=(30,105),at=(-15,70),blade=45)]
K3=[dict(lean=15,dx=-3,lp=(25,40),lt=(-15,35),ap=(-70,-95),at=(30,90),blade=185),
    dict(lean=12,dx=0,lp=(40,20),lt=(-30,15),ap=(-50,-25),at=(20,80),blade=205),
    dict(lean=10,dx=3,lp=(40,25),lt=(-35,10),ap=(65,100),at=(-20,60),blade=70),
    dict(lean=18,dx=6,lp=(40,40),lt=(-40,8),ap=(88,88),at=(-50,25),blade=0,hit=1),
    dict(lean=20,dx=7,lp=(40,42),lt=(-40,10),ap=(20,-25),at=(-45,30),blade=-120),
    dict(lean=15,dx=7,lp=(38,38),lt=(-38,10),ap=(15,-15),at=(-40,40),blade=-110)]
d='/tmp/claude-0/-home-claude/52818104-cc44-5676-9a9e-80d37d57856b/scratchpad/manne/'
ve(K1,d+'kiem1.png'); ve(K2,d+'kiem2.png'); ve(K3,d+'kiem3.png')
