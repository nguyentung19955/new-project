# Hand-drawn Minimal Character Master (64x64, side view facing right). Pixel by pixel, no resampling.
from PIL import Image
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
        for cx,cy in ((x0,y0),(x1,y0),(x0,y1),(x1,y1)): s.discard((cx,cy))
    return s
# back arm (nub behind body)
shape(rect(23,44,24,47),lambda x,y:S)
# back leg
shape(rect(26,52,28,56),lambda x,y:S)
shape(rect(26,57,29,58),lambda x,y:F)
# body / tunic
shape(rect(25,41,34,51,cut=1),lambda x,y: D if (x<=26 or y>=50) else R)
# front leg
shape(rect(31,52,33,56),lambda x,y:W)
shape(rect(31,57,35,58),lambda x,y:F)
# head: 16x15 rounded box
def headcol(x,y):
    if x<=22 or y>=38: return S
    return W
shape(rect(21,25,37,39,cut=1),headcol)
for (x,y) in [(30,30),(31,30),(30,31),(31,31),(30,32),(31,32),(34,30),(35,30),(34,31),(35,31),(34,32),(35,32)]:
    im.putpixel((x,y),O)
# front arm hangs along the front of the body; the hand rests at the hip
shape({(x,y) for x in (34,35) for y in range(43,49)}|{(35,49),(36,49),(36,48)},lambda x,y: W)
# sword: dark hilt + crossguard, blade angled forward-down
shape({(37,49),(38,49)},lambda x,y:H)
shape({(39,48),(39,49),(39,50)},lambda x,y:H)
blade=set()
for i in range(6):
    blade|={(40+i,50+i),(41+i,50+i)}
shape(blade,lambda x,y: BH if x-y==-10 else B)
im.save('master_ve_tay.png')
im.resize((256,256),Image.NEAREST).save('master_ve_tay_4x.png')
print(im.getbbox())
