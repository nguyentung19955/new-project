# Hand-drawn South (front) view to accompany the East master, used only as the PixelLab reference.
from PIL import Image, ImageOps
O=(26,20,32,255); W=(244,244,238,255); S=(196,198,210,255); R=(214,52,60,255); D=(142,31,44,255)
F=(58,48,64,255); B=(214,224,232,255); BH=(255,255,255,255); H=(90,62,58,255)
im=Image.new('RGBA',(64,64))
def shape(px,col):
    px=set(px)
    for (x,y) in px:
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
            q=(x+dx,y+dy)
            if q not in px: im.putpixel(q,O)
    for (x,y) in px: im.putpixel((x,y),col(x,y))
def rect(x0,y0,x1,y1,cut=0):
    s={(x,y) for x in range(x0,x1+1) for y in range(y0,y1+1)}
    if cut:
        for c in ((x0,y0),(x1,y0),(x0,y1),(x1,y1)): s.discard(c)
    return s
# legs
shape(rect(28,52,30,56),lambda x,y:W); shape(rect(27,57,30,58),lambda x,y:F)
shape(rect(34,52,36,56),lambda x,y:W); shape(rect(34,57,37,58),lambda x,y:F)
# sword (right side of screen), blade down-out
blade=set()
for i in range(6): blade|={(41+i,50+i),(42+i,50+i)}
shape(blade,lambda x,y: BH if x-y==-9 else B)
shape({(40,48),(40,49),(40,50)},lambda x,y:H)
# body
shape(rect(27,41,37,51,cut=1),lambda x,y: D if y>=50 or x<=27 else R)
# arms
shape(rect(25,43,26,48),lambda x,y:W)
shape(rect(38,43,39,48),lambda x,y:W)
# head
shape(rect(24,25,40,39,cut=1),lambda x,y: S if y>=38 or x<=24 else W)
for (x,y) in [(28,30),(29,30),(28,31),(29,31),(28,32),(29,32),(35,30),(36,30),(35,31),(36,31),(35,32),(36,32)]:
    im.putpixel((x,y),O)
im.save('south.png')
e=Image.open('master_ve_tay.png'); e.save('east.png'); ImageOps.mirror(e).save('west.png')
s=Image.new('RGBA',(64*3,64),(120,140,160,255))
for k,p in enumerate(['west.png','south.png','east.png']): s.alpha_composite(Image.open(p),(64*k,0))
s.resize((64*3*5,64*5),Image.NEAREST).save('/tmp/claude-0/-home-claude/3d4601ea-c0a0-509d-bac3-ac4c31c5f5c0/scratchpad/wse.png')
