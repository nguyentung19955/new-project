# Lam "energy wearing a cloak" - hand-drawn pixel master draft, 64x64, side/3-4 view facing right.
from PIL import Image, ImageDraw
O=(14,16,30,255)
C1=(22,30,58,255); C2=(34,50,92,255); C3=(52,76,126,255)
M=(240,238,232,255); MS=(184,186,200,255); E=(10,10,16,255)
F1=(225,250,255,255); F2=(110,215,255,255); F3=(40,150,235,255); F4=(22,84,170,255)
im=Image.new('RGBA',(64,64))
def put(p,c):
    if 0<=p[0]<64 and 0<=p[1]<64: im.putpixel(p,c)
def poly(pts):
    m=Image.new('1',(64,64)); ImageDraw.Draw(m).polygon(pts,fill=1)
    return {(x,y) for x in range(64) for y in range(64) if m.getpixel((x,y))}
def ell(b):
    m=Image.new('1',(64,64)); ImageDraw.Draw(m).ellipse(b,fill=1)
    return {(x,y) for x in range(64) for y in range(64) if m.getpixel((x,y))}
def shape(px,col,oc=O):
    px=set(px)
    for (x,y) in px:
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
            q=(x+dx,y+dy)
            if q not in px: put(q,oc)
    for p in px: put(p,col(*p) if callable(col) else col)
def flame(px):
    """energy: outlined in deep blue, core gets brighter toward the inside"""
    px=set(px)
    def depth(x,y):
        d=0
        while all(((x+a*k,y+b*k) in px) for a,b in ((1,0),(-1,0),(0,1),(0,-1)) for k in [d+1]): d+=1
        return d
    shape(px,lambda x,y: [F3,F2,F1,F1][min(depth(x,y),3)],F4)

# --- back flames trailing from the cloak hem (behind everything)
flame(poly([(22,45),(17,43),(13,37),(15,43),(11,42),(16,47),(21,50)]))
flame(poly([(21,49),(15,49),(9,46),(14,51),(21,53)]))
# --- legs + pointy boots
shape(poly([(27,53),(29,53),(29,58),(27,58)]),C1)
shape(poly([(26,58),(30,58),(31,60),(25,60)]),C1)
shape(poly([(32,53),(34,53),(34,57),(32,57)]),C1)
shape(poly([(31,57),(35,57),(38,60),(31,60)]),C2)
# --- cloak body (flares out, ragged hem)
cloak=poly([(25,38),(37,38),(40,46),(42,53),(39,51),(37,54),(34,52),(31,55),(28,52),(25,55),(22,51),(20,53),(21,46)])
L,R=min(x for x,y in cloak),max(x for x,y in cloak)
shape(cloak,lambda x,y: C3 if x>=R-3 else (C1 if x<=L+4 else C2))
# fold lines
for p in [(29,44),(29,45),(29,46),(28,47),(28,48),(33,45),(34,46),(34,47),(35,48),(35,49)]: put(p,C1)
# hem flames (energy leaking from the ragged hem)
flame(poly([(23,52),(21,55),(24,54)])); flame(poly([(38,52),(41,56),(40,52)]))
# --- hood (dome with tip curling back)
hood=ell((20,20,41,40))|poly([(24,24),(16,18),(13,19),(18,22),(22,28)])
shape(hood,lambda x,y: C3 if (x>=36 and y<=30) else (C1 if x<=24 or y>=37 else C2))
# hood opening: dark void with inner energy glow
void=ell((27,25,41,39))
shape(void,lambda x,y: F4 if (x<=28 or y>=38) else C1)
# --- mask (oval, slightly turned right) + two big eyes
mask=ell((29,26,40,38))
shape(mask,lambda x,y: MS if (x<=30 or y>=37) else M)
for p in ell((31,29,34,34)): put(p,E)
for p in ell((36,29,38,34)): put(p,E)
put((32,30),(70,70,90,255))
# --- collar / scarf knot
shape(poly([(24,37),(39,37),(38,41),(25,41)]),lambda x,y: C3 if x>=35 else C2)
for p in [(31,39),(32,39),(32,40),(33,40),(31,40)]: put(p,C1)
# --- front sleeve (no hand: ends in energy)
shape(poly([(34,40),(37,40),(39,47),(35,48)]),lambda x,y: C3 if x>=37 else C2)
flame(poly([(35,48),(38,47),(40,43),(41,46),(43,42),(42,48),(39,51),(36,50)]))
import sys
if len(sys.argv)>1:
    flame(poly([(26,24),(24,18),(22,11),(26,16),(28,21),(29,23)]))
    flame(poly([(34,22),(37,17),(40,10),(40,16),(38,22),(36,24)]))
im.save('lam_master_draft%s.png'%('_power' if len(sys.argv)>1 else ''))
bg=Image.new('RGBA',(64,64),(235,235,235,255)); bg.alpha_composite(im)
bg.resize((384,384),Image.NEAREST).save('lam_master_draft%s_6x.png'%('_power' if len(sys.argv)>1 else ''))
print(im.getbbox())
