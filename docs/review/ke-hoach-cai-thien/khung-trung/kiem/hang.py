import json,base64,io,sys,os
from PIL import Image
def tai(ma):
    f='/home/claude/new-project/game/art/custom/%s.sprite.json'%ma
    d=json.load(open(f)); tam=d['tam']
    im=Image.open(io.BytesIO(base64.b64decode(tam.split(',',1)[1]))) if tam.startswith('data:') else Image.open(os.path.join(os.path.dirname(f),tam))
    return d,im.convert('RGBA')
def hang(ma,k):
    d,im=tai(ma); v=d['dong_tac'][k]; net=float(d.get('net') or 1)
    W=int(round(d['khung_rong']*net));H=int(round(d['khung_cao']*net))
    return [im.crop((i*W,v['hang']*H,(i+1)*W,(v['hang']+1)*H)) for i in range(v['so'])],d,v
if __name__=='__main__':
    rows=[('em-be-wrestler-bien','atk'),('socNo','atk'),('socNo','die'),('hoTinh-p2','atk')]
    ims=[]
    for ma,k in rows:
        fr,d,v=hang(ma,k); W,H=fr[0].size
        s=4 if W<100 else 2
        sh=Image.new('RGBA',(len(fr)*W*s,H*s),(60,70,60,255))
        for i,f in enumerate(fr): sh.alpha_composite(f.resize((W*s,H*s),Image.NEAREST),(i*W*s,0))
        sh.save('hang_%s_%s.png'%(ma,k)); print(ma,k,W,H,v,d.get('net'))
