import sys
from PIL import Image
src,pref,n,w=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4]); cols=7
im=Image.open(src).convert('RGB')
for k in range(n):
    f=Image.new('RGBA',(w,w),(0,0,0,0)); ox=(k%cols)*w*2; oy=(k//cols)*w*2
    for y in range(w):
        for x in range(w):
            p=im.getpixel((ox+2*x,oy+2*y))
            if not(p[0]>200 and p[2]>200 and p[1]<80): f.putpixel((x,y),p+(255,))
    f.save(f'{pref}{k}.png')
