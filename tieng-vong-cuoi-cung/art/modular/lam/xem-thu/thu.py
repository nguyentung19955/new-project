from lap import *
from PIL import ImageFont
F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',26)
def bg(size):
    im=Image.new('RGBA',size,(255,255,255,255)); d=ImageDraw.Draw(im)
    for y in range(0,size[1],20):
        for x in range(0,size[0],20):
            if (x//20+y//20)%2: d.rectangle([x,y,x+19,y+19],fill=(255,120,220,255))
    return im
def body(cv, Mt, over):
    L=[(P['than'],Mt),(P['vat-sau'],place((175,372),0,(63,62),B)),(P['vat-truoc'],place((250,372),0,(54,66),B)),(P['dai'],place((236,338),0,(94,30),B))]
    for img,M in L: put(cv,img,M)
def arm(b):
    cv=Image.new('RGBA',(520,520)); Mt=place((236,335),0,(88,86),B)
    body(cv,Mt,True)
    a_up=95; a_lo=95-b
    parts,_=chain(['tay-tren-gan','cang-tay-gan','gang-gan'],app(Mt,(130,55)),[a_up,a_lo,a_lo])
    for img,M in parts: put(cv,img,M)
    put(cv,P['capelet-truoc'],place((250,282),0,(80,59),B))
    return cv
def leg(b):
    cv=Image.new('RGBA',(520,560)); Mt=place((236,335),0,(88,86),B)
    a_up=90-b*0.45; a_lo=a_up+b
    parts,_=chain(['dui-gan','cang-chan-gan','ung-gan'],app(Mt,(125,100)),[a_up,a_lo,90+(a_lo-90)*0.5])
    for img,M in parts: put(cv,img,M)
    body(cv,Mt,False)
    return cv
rows=[]
for name,fn in [('TAY',arm),('CHÂN',leg)]:
    cells=[]
    for b,lab in [(0,'duỗi'),(50,'gập vừa'),(105,'gập mạnh')]:
        c=fn(b); bb=c.getbbox(); c=c.crop((bb[0]-15,bb[1]-15,bb[2]+15,bb[3]+15))
        c=c.resize((c.width*3,c.height*3),Image.LANCZOS); o=bg(c.size); o.alpha_composite(c)
        ImageDraw.Draw(o).text((10,8),f'{name} – {lab} ({b}°)',fill=(0,0,0),font=F); cells.append(o)
    rows.append(cells)
W=max(sum(c.width for c in r)+40 for r in rows); H=sum(max(c.height for c in r) for r in rows)+30
sh=Image.new('RGB',(W,H),'white'); y=10
for r in rows:
    x=10
    for c in r: sh.paste(c.convert('RGB'),(x,y)); x+=c.width+10
    y+=max(c.height for c in r)+10
sh.save('thu-khop-v4.png'); print(sh.size)
