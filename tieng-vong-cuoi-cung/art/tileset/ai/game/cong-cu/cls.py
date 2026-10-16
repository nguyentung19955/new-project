import colorsys
def lop(c):
    if c is None: return '.'
    r,g,b=[v/255 for v in c[:3]]
    h,l,s=colorsys.rgb_to_hls(r,g,b); h*=360
    if l<0.075: return 'o'
    if 50<h<130 and s>0.25 and l>0.18: return 'g'
    if 30<=h<=50 and l>0.35: return 'y'
    if l<0.15: return 'd'
    if l<0.30: return 'b'
    return 'l'
def show(rgba):
    for row in rgba:
        print(''.join(lop(p) if p[3] else '.' for p in row))
