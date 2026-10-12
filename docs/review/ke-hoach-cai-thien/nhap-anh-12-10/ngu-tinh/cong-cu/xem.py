import sys
from PIL import Image, ImageDraw
p1=Image.open('nguTinh-cu.png').convert('RGBA')
p2=Image.open(sys.argv[1]+'/nguTinh-p2.png').convert('RGBA'); p3=Image.open(sys.argv[1]+'/nguTinh-p3.png').convert('RGBA')
FW,FH=180,116
o=Image.new('RGBA',(6*FW,12*FH),(55,65,85,255)); d=ImageDraw.Draw(o)
r=0
for hp1,hp in [(0,0),(2,1),(3,2),(4,3)]:
  for img,h in [(p1,hp1),(p2,hp),(p3,hp)]:
    for c in range(6):
      o.alpha_composite(img.crop((c*FW,h*FH,(c+1)*FW,(h+1)*FH)),(c*FW,r*FH))
      d.line([(c*FW,r*FH+112),(c*FW+FW-1,r*FH+112)],fill=(255,255,255,60)); d.line([(c*FW+90,r*FH),(c*FW+90,r*FH+FH)],fill=(255,255,255,40))
    r+=1
o=o.resize((o.width*2//1,o.height*2//1),Image.NEAREST); o.save(sys.argv[2])
