import math, numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
W,H=960,540; FPS=30
full=Image.open('nv.png'); A=np.array(full)
ys,xs=np.mgrid[0:A.shape[0],0:A.shape[1]]
arm=(A[...,3]>0)&(xs>=1222)&(ys>730)&(ys<1170)&~((xs<1300)&(ys<745))&~((xs<1340)&(ys>1060))
armA=A.copy(); armA[~arm,3]=0; bodyA=A.copy(); bodyA[arm,3]=0
PIV=(1228,805); TIP=(1840,960)
SC=330/full.height
def sc(im): return im.resize((int(im.width*SC),int(im.height*SC)),Image.LANCZOS)
body=sc(Image.fromarray(bodyA)); armI=sc(Image.fromarray(armA))
piv=(PIV[0]*SC,PIV[1]*SC); tip=(TIP[0]*SC,TIP[1]*SC)
sw,sh=body.size; FOOT=(sw*0.5,sh*0.98)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',26)
bg=Image.new('RGBA',(W,H)); d=ImageDraw.Draw(bg)
for y in range(H): d.line([(0,y),(W,y)],fill=(int(150+60*min(1,y/260)),int(200+30*min(1,y/260)),235,255))
d.rectangle([0,300,W,H],fill=(196,170,110,255)); d.rectangle([0,286,W,300],fill=(80,150,80,255))
def rot_about(img,ang,p):  # rotate image around point p (deg, ccw positive in PIL)
  return img.rotate(ang,resample=Image.BICUBIC,center=p)
def rp(pt,ang,p):
  a=-math.radians(ang); x,y=pt[0]-p[0],pt[1]-p[1]
  return (p[0]+x*math.cos(a)-y*math.sin(a), p[1]+x*math.sin(a)+y*math.cos(a))
def place(cv,img,fx,fy,sx=1,sy=1,shear=0):
  M=np.array([[sx,shear*sx],[0,sy]]); Mi=np.linalg.inv(M); a,b=Mi[0]; c,e=Mi[1]
  cv.alpha_composite(img.transform((W,H),Image.AFFINE,(a,b,FOOT[0]-a*fx-b*fy,c,e,FOOT[1]-c*fx-e*fy),resample=Image.BICUBIC))
def tomap(pt,fx,fy,sx,sy,shear):
  x,y=pt[0]-FOOT[0],pt[1]-FOOT[1]; return (fx+sx*(x+shear*y), fy+sy*y)
def ease(t): return t*t*(3-2*t)
def dummy(cv,x,y,hit):
  o=Image.new('RGBA',(W,H)); dr=ImageDraw.Draw(o); s=10*math.sin(hit*40)*(hit>0)
  dr.rectangle([x-6+s,y-200,x+6+s,y],fill=(110,75,40,255)); dr.ellipse([x-45+s,y-200,x+45+s,y-100],fill=(210,180,90,255),outline=(90,60,30,255),width=4)
  dr.ellipse([x-30+s,y-250,x+30+s,y-190],fill=(220,190,100,255),outline=(90,60,30,255),width=4); cv.alpha_composite(o)
# góc tay: 0 = như ảnh gốc; dương = giơ lên (PIL ccw)
def arm_angle(t):  # 1 nhát chém trong t∈[0,1]
  if t<0.35: return 75*ease(t/0.35)            # giơ cao lấy đà
  if t<0.55: return 75-130*ease((t-0.35)/0.2)  # chém xuống mạnh
  return -55+55*ease((t-0.55)/0.45)            # thu về
frames=0; trail=[]
seq=[('Đứng thở',45,None),('Vung tay chém',36,0),('Vung tay chém',36,1),('Vung tay chém (nhanh x2)',18,2),('Vung tay chém (nhanh x2)',18,3),('Đứng thở',30,None)]
fi=0
for name,n,k in seq:
  for i in range(n):
    t=i/(n-1); T=fi/FPS; cv=bg.copy()
    fx,fy,sx,sy,shear=320,470,1,1,0; ang=0; hit=0
    if k is None:
      b=math.sin(T*2*math.pi*0.9); sy=1+0.025*b; sx=1-0.012*b
      ang=4*math.sin(T*2*math.pi*0.9+1)
    else:
      ang=arm_angle(t)
      # thân ngả theo tay
      if t<0.35: shear=-0.08*ease(t/0.35); sy=1+0.03*ease(t/0.35)
      elif t<0.55: q=ease((t-0.35)/0.2); shear=-0.08+0.22*q; fx+=30*q; sy=1.03-0.06*q
      else: q=ease((t-0.55)/0.45); shear=0.14*(1-q); fx+=30*(1-q); sy=0.97+0.03*q
      if 0.45<t<0.9: hit=t
    ch=body.copy(); ch.alpha_composite(rot_about(armI,ang,piv))
    o=Image.new('RGBA',(W,H)); ImageDraw.Draw(o).ellipse([fx-100,470-12,fx+100,470+12],fill=(0,0,0,80)); cv.alpha_composite(o)
    dummy(cv,640,470,hit)
    place(cv,ch,fx,fy,sx,sy,shear)
    tp=tomap(rp(tip,ang,piv),fx,fy,sx,sy,shear)
    if k is not None and 0.33<t<0.75: trail.append(tp)
    elif k is None: trail=[]
    if k is not None and t>=0.75: trail=trail[2:]
    if i==0: trail=[]
    if len(trail)>1:
      o=Image.new('RGBA',(W,H)); dr=ImageDraw.Draw(o); m=len(trail)
      for j in range(1,m):
        w=int(4+22*j/m); al=int(230*j/m)
        dr.line([trail[j-1],trail[j]],fill=(255,250,225,al),width=w)
      cv.alpha_composite(o.filter(ImageFilter.GaussianBlur(1.2)))
    if 0.5<t<0.85 and k is not None:
      q=(t-0.5)/0.35; o=Image.new('RGBA',(W,H)); dr=ImageDraw.Draw(o); cx,cy=620,330; al=int(255*(1-q))
      for j in range(10):
        a=j*0.628; r1=15+80*q; dr.line([(cx+r1*math.cos(a),cy+r1*math.sin(a)),(cx+(r1+16)*math.cos(a),cy+(r1+16)*math.sin(a))],fill=(255,220,120,al),width=5)
      cv.alpha_composite(o)
    dr=ImageDraw.Draw(cv); dr.rounded_rectangle([20,18,20+16*len(name)+30,62],12,fill=(20,14,8,200)); dr.text((36,24),name,font=font,fill=(255,214,107,255))
    cv.convert('RGB').save(f'c{fi:04d}.png'); fi+=1
print(fi)
