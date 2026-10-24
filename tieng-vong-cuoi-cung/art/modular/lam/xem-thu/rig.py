import math, numpy as np
from PIL import Image, ImageDraw, ImageFilter
L=lambda k: Image.open(f'p{k:02d}.png').convert('RGBA')
head=L(0)
import numpy as _np
_a=_np.array(head); yy,xx=_np.mgrid[:_a.shape[0],:_a.shape[1]]
_m=((xx-160)**2+(yy-322)**2<36**2)&(yy>=304)
_a[_m,3]=0; head=Image.fromarray(_a)
d=ImageDraw.Draw(head)
for (ex,ey,w,h) in [(334,238,20,38),(380,234,22,42)]:
    d.ellipse([ex-w/2-5,ey-h/2-5,ex+w/2+5,ey+h/2+5],fill=(255,210,60,90))
    d.ellipse([ex-w/2,ey-h/2,ex+w/2,ey+h/2],fill=(255,226,80,255))
P={ # image, pivot(local), named anchors
 'head':(head,(160,322)),
 'torso':(L(1),(160,250)),
 'arm':(L(3),(105,25)),'armB':(L(4),None),
 'leg':(L(7),(84,25)),'legB':(L(8),None),
 'glove':(L(5),(65,25)),'gloveB':(L(6),(65,25)),
 'boot':(L(9),(83,22)),'bootB':(L(10),(83,22)),
 'dagger':(L(11),(95,60)),'bell':(L(12),(52,14)),
}
def SC(name,k):
    img,pv=P[name]; P[name]=(img.resize((round(img.width*k),round(img.height*k)),Image.LANCZOS),pv)
for n,k in [('arm',.8),('armB',.8),('glove',.85),('gloveB',.85),('dagger',.5)]: SC(n,k)
def T(x,y): return np.array([[1,0,x],[0,1,y],[0,0,1.]])
def R(a):
    c,s=math.cos(math.radians(a)),math.sin(math.radians(a)); return np.array([[c,-s,0],[s,c,0],[0,0,1.]])
def ang(v): return math.degrees(math.atan2(v[1],v[0]))
ARM_REST=ang((43-105,160-25)); LEG_REST=ang((47-84,170-25))
def put(canvas,img,M):
    Mi=np.linalg.inv(M)
    t=img.transform(canvas.size,Image.AFFINE,tuple(Mi[:2].flatten()),Image.BICUBIC)
    canvas.alpha_composite(t)
def frame(p,S=1000):
    s=math.sin(p); c=math.cos(p)
    rootx,rooty=480, 640 - 14*abs(math.cos(p))  # bob: highest mid-stride
    lean=9
    Mt=T(rootx,rooty)@R(lean)@T(-160,-250)
    def child(Mp,A,name,world_ang=None,rest=0,rel=0,piv=None):
        img,pv=P[name]; pv=piv or pv
        r = rel if world_ang is None else world_ang-rest-lean
        return Mp@T(*A)@R(r)@T(-pv[0],-pv[1])
    legF=90-46*s; legB=90+46*s
    armF=90+30*s; armB=95-45*s
    Mlf=child(Mt,(185,235),'leg',legF,LEG_REST,piv=(84,25))
    Mlb=child(Mt,(130,235),'legB',legB,LEG_REST,piv=(84,25))
    lift=lambda q: max(0,-math.sin(q))*22  # foot lift in swing
    Mbf=child(Mlf,(47,170),'boot',rel=-(legF-90)-lean+ (lift(p)*0.6),piv=(83,22))
    Mbb=child(Mlb,(47,170),'bootB',rel=-(legB-90)-lean+ (lift(p+math.pi)*0.6),piv=(83,22))
    Maf=child(Mt,(190,115),'arm',armF,ARM_REST,piv=(84,20))
    Mab=child(Mt,(120,100),'armB',armB,ARM_REST,piv=(84,20))
    Mgf=child(Maf,(34,128),'glove',rel=-(armF-ARM_REST)+ (armF-90)*0.3,piv=(55,21))
    Mgb=child(Mab,(34,128),'gloveB',rel=-(armB-ARM_REST),piv=(55,21))
    Md=child(Mgf,(64,85),'dagger',rel=-15,piv=(47,30))
    Mh=child(Mt,(165,45),'head',rel=-lean*0.5+2*math.sin(2*p),piv=(245,300))
    Mbl=child(Mt,(228,40),'bell',rel=10*s,piv=(52,14))
    cv=Image.new('RGBA',(S,S),(0,0,0,0))
    for img,M in [(P['armB'][0],Mab),(P['gloveB'][0],Mgb),(P['legB'][0],Mlb),(P['bootB'][0],Mbb),
                  (P['leg'][0],Mlf),(P['boot'][0],Mbf),(P['torso'][0],Mt),(P['head'][0],Mh),(P['bell'][0],Mbl),
                  (P['arm'][0],Maf),(P['glove'][0],Mgf),(P['dagger'][0],Md)]:
        put(cv,img,M)
    return cv
if __name__=='__main__':
    import sys
    fr=frame(0); bg=Image.new('RGBA',fr.size,(235,240,245,255)); bg.alpha_composite(fr); bg.save('test0.png')
