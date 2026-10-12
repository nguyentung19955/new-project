# Bảng tiếp xúc: mỗi hàng hoạt ảnh, khung phóng to, vạch đỏ = đường chân (goc y), vạch xanh = goc x, khung ô xám.
import json, base64, io, sys
import numpy as np
from PIL import Image, ImageDraw
D='/home/claude/new-project/game/art/custom/'
def bang(ma, out, z=3, hangs=None):
    d=json.load(open(D+ma+'.sprite.json'))
    im=Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',',1)[1]))).convert('RGBA')
    n=d.get('net') or 1; fw,fh=d['khung_rong']*n,d['khung_cao']*n; gx,gy=d['goc'][0]*n,d['goc'][1]*n
    dt=d['dong_tac']; hs=[h for h in dt if not hangs or h in hangs]
    mx=max(dt[h]['so'] for h in hs)
    s=max(1,round(z*2/n)) if n>1 else z
    W,H=mx*(fw*s+4)+60, len(hs)*(fh*s+4)
    C=Image.new('RGBA',(W,H),(200,200,190,255)); dr=ImageDraw.Draw(C)
    for j,h in enumerate(hs):
        t=dt[h]; dr.text((2,j*(fh*s+4)+4),h,fill=(0,0,0))
        for i in range(t['so']):
            cell=im.crop((i*fw,t['hang']*fh,(i+1)*fw,(t['hang']+1)*fh)).resize((fw*s,fh*s),Image.NEAREST)
            x0,y0=60+i*(fw*s+4), j*(fh*s+4)
            dr.rectangle([x0-1,y0-1,x0+fw*s,y0+fh*s],outline=(120,120,120))
            C.alpha_composite(cell,(x0,y0))
            dr.line([x0,y0+gy*s,x0+fw*s,y0+gy*s],fill=(255,0,0)); dr.line([x0+gx*s,y0,x0+gx*s,y0+fh*s],fill=(0,0,255))
    C.convert('RGB').save(out)
if __name__=='__main__':
    bang(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv)>3 else 3, sys.argv[4].split(',') if len(sys.argv)>4 else None)
