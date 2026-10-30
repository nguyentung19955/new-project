# Lam master v2 (horned, approved design by ChatGPT sheet) - true pixel sprite, hand-built, 64x64, facing right.
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
    px=set(px)
    def depth(x,y):
        d=0
        while d<3 and all(((x+a*(d+1),y+b*(d+1)) in px) for a,b in ((1,0),(-1,0),(0,1),(0,-1))): d+=1
        return d
    shape(px,lambda x,y:[F3,F2,F1,F1][depth(x,y)],F4)

# back flames (rising up and back from the cloak)
flame(poly([(23,42),(20,40),(17,35),(14,30),(15,36),(13,41),(16,46),(22,48)]))
flame(poly([(22,48),(17,50),(11,50),(15,54),(22,54)]))
# legs + chunky pointy boots
shape(poly([(28,54),(30,54),(30,58),(28,58)]),C1)
shape(poly([(33,54),(35,54),(35,58),(33,58)]),C1)
shape(poly([(26,58),(31,58),(31,61),(25,61)]),C1)
shape(poly([(32,58),(36,58),(39,61),(32,61)]),C2)
# cloak with ragged hem
cloak=poly([(24,40),(38,40),(42,47),(44,55),(41,53),(39,56),(36,53),(33,57),(30,53),(27,56),(24,52),(21,55),(21,47)])
shape(cloak,lambda x,y: C3 if x>=40 else (C1 if x<=25 else C2))
for p in [(29,45),(29,46),(28,47),(28,48),(28,49),(34,45),(35,46),(35,47),(36,48),(36,49),(32,50),(32,51)]: put(p,C1)
flame(poly([(24,53),(22,57),(25,55)])); flame(poly([(41,52),(44,57),(43,52)]))
# hood: big dome + tip swept back
hood=ell((19,16,43,40))|poly([(24,22),(14,14),(9,14),(15,19),(21,28)])
shape(hood,lambda x,y: C3 if (x>=37 and y<=27) else (C1 if x<=23 or y>=37 else C2))
# face opening (dark void, inner energy glow on the far side)
shape(ell((27,23,44,40)),lambda x,y: F4 if x<=28 else C1)
# mask
shape(ell((29,25,43,39)),lambda x,y: MS if (x<=31 or y>=38) else M)
for p in ell((31,29,34,35)): put(p,E)
for p in ell((37,29,39,35)): put(p,E)
# hood brim overlapping the top of the mask
for p in ell((26,21,45,30))-ell((27,24,46,33)):
    if p in hood or p[0]>=27: put(p,C3 if p[0]>=36 else C2)
# scarf collar
shape(poly([(23,37),(40,37),(41,41),(37,43),(26,43),(22,41)]),lambda x,y: C3 if x>=37 else C2)
for p in [(28,39),(29,40),(30,41),(33,39),(34,40),(35,41)]: put(p,C1)
# front sleeve ending in energy (no hand)
shape(poly([(35,42),(38,42),(40,47),(36,48)]),lambda x,y: C3 if x>=38 else C2)
flame(poly([(36,48),(40,46),(42,42),(45,37),(45,43),(43,49),(39,51)]))
# flame horns
flame(poly([(24,22),(22,17),(20,13),(21,9),(23,6),(24,2),(26,7),(27,11),(29,15),(30,19)])|poly([(21,13),(18,10),(21,16)]))
flame(poly([(33,20),(34,15),(36,11),(38,8),(39,3),(41,8),(41,12),(40,16),(38,21)])|poly([(40,12),(44,9),(41,15)]))
im.save('lam_master_v2.png')
bg=Image.new('RGBA',(64,64),(235,235,235,255)); bg.alpha_composite(im)
bg.resize((384,384),Image.NEAREST).save('lam_master_v2_6x.png')
print(im.getbbox())
