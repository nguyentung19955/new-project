import json,sys
from PIL import Image,ImageDraw
src,out=sys.argv[1],sys.argv[2]
d=json.load(open(src)); S=4; W=96*S
fr=d['khung']; img=Image.new('RGB',(W*len(fr),W),(0,255,0))
C={'t':((106,44,160),(60,20,100)),'p':((255,138,0),(150,70,0)),'lt':((31,79,160),(15,40,90)),'lp':((255,210,0),(150,120,0))}
def cap(dr,a,b,w,col):
    (x1,y1),(x2,y2)=a,b
    dr.line([(x1,y1),(x2,y2)],fill=col[1],width=w+6)
    for (x,y) in (a,b): dr.ellipse([x-(w+6)/2,y-(w+6)/2,x+(w+6)/2,y+(w+6)/2],fill=col[1])
    dr.line([(x1,y1),(x2,y2)],fill=col[0],width=w)
    for (x,y) in (a,b): dr.ellipse([x-w/2,y-w/2,x+w/2,y+w/2],fill=col[0])
for i,f in enumerate(fr):
    k=f['khop']; ox=i*W; dr=ImageDraw.Draw(img)
    P=lambda n:(ox+k[n][0]*S,k[n][1]*S); Z=lambda n:k[n][2]
    parts=[]
    for s,key in (('t','t'),('p','p')):
        z=(Z('vai_'+s)+Z('khuyu_'+s)+Z('co_tay_'+s))/3
        parts.append((z,'arm',s))
        z=(Z('hong_'+s)+Z('goi_'+s)+Z('co_chan_'+s))/3
        parts.append((z,'leg',s))
    parts.append((0,'body',None))
    for z,t,s in sorted(parts,key=lambda p:p[0]):
        if t=='arm':
            col=C[s]; cap(dr,P('vai_'+s),P('khuyu_'+s),34,col); cap(dr,P("khuyu_"+s),P("co_tay_"+s),30,col)
            x,y=P('co_tay_'+s); dr.ellipse([x-18,y-18,x+18,y+18],fill=col[0],outline=col[1],width=3)
        elif t=='leg':
            col=C['l'+s]; cap(dr,P('hong_'+s),P('goi_'+s),42,col); cap(dr,P("goi_"+s),P("co_chan_"+s),36,col)
            if 'mui_chan_'+s in k: cap(dr,P('co_chan_'+s),P('mui_chan_'+s),26,col)
        else:
            cap(dr,P('eo'),P('nguc'),70,((40,40,40),(0,0,0)))
            cap(dr,P('nguc'),P('co'),62,((40,40,40),(0,0,0)))
            x,y=P('eo'); dr.rectangle([x-26,y-6,x+26,y+6],fill=(200,30,30))
            x,y=P('dau'); r=14.5*S; dr.ellipse([x-r,y-r,x+r,y+r],fill=(230,170,120),outline=(0,0,0),width=4)
            dr.pieslice([x-r,y-r,x+r,y+r],150,360,fill=(20,20,20))
            dr.ellipse([x+r*0.45,y+r*0.05,x+r*0.45+14,y+r*0.05+14],fill=(220,0,0))
    dr.line([(ox,90*S),(ox+W,90*S)],fill=(0,160,0),width=2)
img.save(out)
# crop each cell x 14..82, y 12..94
n=len(fr); cw=68*S; ch=82*S
o=Image.new('RGB',(n*cw+ (n-1)*40, ch),(0,255,0))
for i in range(n):
    o.paste(img.crop((i*W+14*S,12*S,i*W+82*S,94*S)),(i*(cw+40),0))
o.save(out)
