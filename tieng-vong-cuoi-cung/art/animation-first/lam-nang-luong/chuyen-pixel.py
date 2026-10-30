# Convert ChatGPT's approved horned side view into a true pixel sprite: quantize to a fixed palette, block-majority downscale.
import sys, collections
from PIL import Image
src=Image.open('chatgpt_lam_master_v1.png').convert('RGB')
crop=src.crop((470,0,900,640))
bgc=crop.getpixel((5,5))
isbg=lambda p: sum(abs(a-b) for a,b in zip(p,bgc))<40 or (p[0]>215 and p[1]>215 and p[2]>215 and abs(p[0]-p[2])<20)
xs=[];ys=[]
for y in range(crop.height):
    for x in range(crop.width):
        if not isbg(crop.getpixel((x,y))): xs.append(x); ys.append(y)
bb=(min(xs),min(ys),max(xs)+1,max(ys)+1); print('bbox',bb)
fig=crop.crop(bb)
PAL=[(14,16,30),(22,30,58),(34,50,92),(52,76,126),(240,238,232),(184,186,200),(10,10,16),(225,250,255),(110,215,255),(40,150,235),(22,84,170)]
def q(p):
    return min(range(len(PAL)),key=lambda i: sum((a-b)**2 for a,b in zip(p,PAL[i])))
H=int(sys.argv[1]) if len(sys.argv)>1 else 48
s=fig.height/H; Wd=round(fig.width/s)
out=Image.new('RGBA',(Wd,H))
for Y in range(H):
    for X in range(Wd):
        votes=collections.Counter(); bgv=0
        for y in range(int(Y*s),int((Y+1)*s)):
            for x in range(int(X*s),int((X+1)*s)):
                p=fig.getpixel((x,y))
                if isbg(p): bgv+=1
                else: votes[q(p)]+=1
        n=sum(votes.values())
        if n>bgv*0.8 and n: out.putpixel((X,Y),PAL[votes.most_common(1)[0][0]]+(255,))
out.save(f'lam_pixel_raw_{H}.png'); print(out.size)
bg=Image.new('RGBA',out.size,(235,235,235,255)); bg.alpha_composite(out); bg.resize((out.width*8,H*8),Image.NEAREST).save(f'lam_pixel_raw_{H}_8x.png')
