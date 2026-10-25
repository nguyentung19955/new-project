import math, numpy as np, json, sys
from PIL import Image, ImageDraw, ImageFont
from khuon2 import *
def T_(x,y): return np.array([[1,0,x],[0,1,y],[0,0,1.]])
def R_(a):
    c,s=math.cos(math.radians(a)),math.sin(math.radians(a)); return np.array([[c,-s,0],[s,c,0],[0,0,1.]])
def place(pos,a,piv): return T_(*pos)@R_(a)@T_(-piv[0],-piv[1])
def app(M,p): return (M@np.array([p[0],p[1],1.]))[:2]
def ang(v): return math.degrees(math.atan2(v[1],v[0]))
def put(cv,img,M):
    Mi=np.linalg.inv(M); cv.alpha_composite(img.transform(cv.size,Image.AFFINE,tuple(Mi[:2].flatten()),Image.BICUBIC))
PC=build()
IM={n:PC[n].rgba('mau',far=n.endswith('-xa')) for n in PC}
def chain(names,root,angles):
    out=[];pos=np.array(root,float)
    for n,a in zip(names,angles):
        p=PC[n]; rest=ang(np.subtract(p.D,p.P)) if p.D else 0
        M=place(pos,a-rest,p.P); out.append((IM[n],M)); pos=app(M,p.D) if p.D else pos
    return out
# vị trí đặt của mảnh không xoay (toạ độ mảnh ở tỉ lệ thế giới), tâm ảnh → toạ độ thế giới
def at(n,world_center):
    im=IM[n]; return T_(world_center[0]-im.width/2, world_center[1]-im.height/2)
def lam(pose):
    Mt=place((236,335),pose.get('lean',0),PC['than'].P)
    L=[]
    L+=[(IM['capelet-sau'],at('capelet-sau',(165,285)))]
    L+=chain(['tay-tren-xa','cang-tay-xa','gang-xa'],app(Mt,(29,36)),pose['armB'])
    L+=chain(['dui-xa','cang-chan-xa','ung-xa'],app(Mt,(32,65)),pose['legB'])
    L+=chain(['dui-gan','cang-chan-gan','ung-gan'],app(Mt,(81,65)),pose['legA'])
    L+=[(IM['than'],Mt),(IM['bao-dao'],at('bao-dao',(160,352))),(IM['vat-sau'],at('vat-sau',(175,372))),
        (IM['vat-truoc'],at('vat-truoc',(250,372))),(IM['dai'],at('dai',(236,338)))]
    Mh=place((205,245),pose.get('head',0),PC['mu'].P)
    g=PC['chop-mu'].extra['goc_trong_mu']; Mtip=Mh@T_(g[0],g[1])@T_(*PC['chop-mu'].P)@R_(pose.get('tip',0))@T_(-PC['chop-mu'].P[0],-PC['chop-mu'].P[1])
    L+=[(IM['mu'],Mh),(IM['chop-mu'],Mtip)]
    e=IM['mat']; L+=[(e.resize((round(e.width*.92),round(e.height*.92))),Mh@T_(244-11,198-21)),(e,Mh@T_(283-12,193-23))]
    arm=chain(['tay-tren-gan','cang-tay-gan','gang-gan'],app(Mt,(85,36)),pose['armA'])
    gl=arm[-1][1]; dao=(IM['dao'],gl@T_(38,34)@R_(-12)@T_(-PC['dao'].P[0],-PC['dao'].P[1]))
    L+=arm[:2]+[dao]+arm[2:]
    L+=[(IM['capelet-truoc'],at('capelet-truoc',(250,282))),(IM['chuong'],at('chuong',(245,290)))]
    return L
REST=dict(armA=[85,30,10],armB=[120,150,180],legA=[80,85,90],legB=[100,95,90])
def render(L,size=(520,520)):
    cv=Image.new('RGBA',size,(0,0,0,0))
    for img,M in L: put(cv,img,M)
    return cv
if __name__=='__main__':
    m=Image.open('master-s.png').convert('RGBA')
    cv=render(lam(REST))
    a=Image.new('RGBA',(520,520),'white'); a.alpha_composite(m)
    b=Image.new('RGBA',(520,520),'white'); b.alpha_composite(cv)
    o=Image.new('RGB',(1560,520),'white'); o.paste(a.convert('RGB'),(0,0)); o.paste(b.convert('RGB'),(520,0)); o.paste(Image.blend(a,b,.5).convert('RGB'),(1040,0)); o.save('rest2.png')
