import json,base64,io,sys,os
from PIL import Image,ImageDraw
R='/home/claude/new-project/game/art/custom/'
def tai(ma):
    d=json.load(open(R+ma+'.sprite.json'));im=Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA');return d,im
if __name__=='__main__':
    os.makedirs('hucu',exist_ok=True)
    rows=[]
    for ma in sys.argv[1:]:
        d,im=tai(ma);rows.append((ma,d,im))
    W=max(im.width for _,_,im in rows);H=sum(im.height+14 for _,_,im in rows)
    s=Image.new('RGBA',(max(W,300),H),(40,40,50,255));dr=ImageDraw.Draw(s);y=0
    for ma,d,im in rows:
        dr.text((0,y),'%s %dx%d n%s so%d goc%s %s'%(ma,d['khung_rong'],d['khung_cao'],d.get('net',1),d['so'],d.get('goc'),d.get('ten','')[:40]),fill=(255,255,0,255))
        s.alpha_composite(im,(0,y+12));y+=im.height+14
    s.save('hucu/_%s.png'%sys.argv[1])
