import sys,glob,os
from PIL import Image,ImageDraw
def luoi(files,out,z=2,cols=None,bg=(70,90,80,255)):
    ims=[Image.open(f).convert('RGBA') for f in files]
    w=max(i.width for i in ims);h=max(i.height for i in ims);n=len(ims);cols=cols or min(n,5);rows=(n+cols-1)//cols
    s=Image.new('RGBA',(cols*(w+4),rows*(h+12)),bg);d=ImageDraw.Draw(s)
    for k,(f,i) in enumerate(zip(files,ims)):
        x=(k%cols)*(w+4);y=(k//cols)*(h+12);s.paste(i,(x,y+10),i);d.text((x+1,y),os.path.basename(f)[:-4],fill=(255,255,0,255))
    s=s.resize((s.width*z,s.height*z),Image.NEAREST);s.save(out)
if __name__=='__main__':
    z=int(sys.argv[2]) if len(sys.argv)>2 else 2
    luoi(sorted(glob.glob(sys.argv[1])),sys.argv[3] if len(sys.argv)>3 else 'luoi.png',z)
