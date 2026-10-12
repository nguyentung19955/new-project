import sys
from PIL import Image, ImageDraw
# chong.py ra.png p1.png p2.png p3.png [hang1 hang2 hang3] : 3 ô cạnh nhau + ô chồng bóng (đỏ=p1, lam=p2, vàng=p3)
ra=sys.argv[1]; ps=sys.argv[2:5]; hs=[int(x) for x in sys.argv[5:8]] if len(sys.argv)>5 else [0,0,0]
c=int(sys.argv[8]) if len(sys.argv)>8 else 0
cells=[Image.open(p).convert('RGBA').crop((c*416,h*256,c*416+416,h*256+256)) for p,h in zip(ps,hs)]
o=Image.new('RGBA',(416*4,256),(50,58,76,255))
for i,ce in enumerate(cells): o.alpha_composite(ce,(i*416,0))
mau=[(255,60,60),(80,140,255),(255,220,0)]
for ce,m in zip(cells,mau):
    a=ce.split()[3]; e=a.point(lambda v:255 if v else 0)
    # viền bóng
    from PIL import ImageFilter
    vien=Image.eval(Image.eval(e.filter(ImageFilter.MaxFilter(3)),lambda v:v) , lambda v:v)
    ed=Image.composite(Image.new('L',e.size,255),Image.new('L',e.size,0),Image.eval(e.filter(ImageFilter.MaxFilter(3)),lambda v:v)).point(lambda v:v)
    diff=Image.eval(e.filter(ImageFilter.MaxFilter(3)),lambda v:v)
    import PIL.ImageChops as C
    ring=C.subtract(e.filter(ImageFilter.MaxFilter(5)),e)
    o.paste(Image.new('RGBA',e.size,m+(255,)),(3*416,0),ring)
d=ImageDraw.Draw(o)
for i in range(4): d.line([(i*416,248),(i*416+415,248)],fill=(255,255,255,90)); d.line([(i*416+208,0),(i*416+208,255)],fill=(255,255,255,50))
o.save(ra)
