import sys
from PIL import Image
src,pref,n=sys.argv[1],sys.argv[2],int(sys.argv[3])
im=Image.open(src).convert('RGB'); sc=1
for k in range(n):
    f=Image.new('RGBA',(104,104),(0,0,0,0)); ox=(k%5)*208; oy=(k//5)*208
    for y in range(104):
        for x in range(104):
            p=im.getpixel((int((ox+2*x+1)*sc),int((oy+2*y+1)*sc)))
            if not(p[0]>200 and p[2]>200 and p[1]<80): f.putpixel((x,y),p+(255,))
    f.save(f'{pref}{k}.png')
