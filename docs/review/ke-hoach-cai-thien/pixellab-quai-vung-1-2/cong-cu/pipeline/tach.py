import json,base64,io,sys
from PIL import Image
R='/home/claude/new-project/game/art/custom/'
def tam(m):
    d=json.load(open(R+m+'.sprite.json'))
    im=Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA')
    return d,im
def khung(m,row='idle',i=0):
    d,im=tam(m);n=d['net'];fw,fh=d['khung_rong']*n,d['khung_cao']*n
    h=d['dong_tac'][row]['hang']
    return im.crop((i*fw,h*fh,i*fw+fw,h*fh+fh))
if __name__=='__main__':
    ms=sys.argv[1:]
    ims=[]
    for m in ms:
        f=khung(m); f=f.crop(f.getbbox()); ims.append((m,f)); f.save('cu/%s.png'%m)
    W=sum(f.width+10 for _,f in ims);H=max(f.height for _,f in ims)
    s=Image.new('RGBA',(W,H),(60,60,70,255));x=0
    for m,f in ims: s.paste(f,(x,H-f.height),f); x+=f.width+10
    s=s.resize((s.width*2,s.height*2),Image.NEAREST);s.save('cu/_sheet_%s.png'%ms[0])
    print([(m,f.size) for m,f in ims])
