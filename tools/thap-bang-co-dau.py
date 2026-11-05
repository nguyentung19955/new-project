#!/usr/bin/env python3
# TURRET MERGE — bảng đối chiếu cỡ đầu ụ trên bệ chung: python3 tools/thap-bang-co-dau.py thap/js/artscale.js out.png id1,id2,... "tiêu đề" [id viền vàng]
import json, re, sys, math
from PIL import Image, ImageDraw, ImageFont
A='thap/assets'
def load(path):
    art=open(path).read(); return json.loads(re.search(r'HEAD_K = (.*);',art).group(1))
def sheet(HK, ids, out, title, C=110, cols=8, mark=()):
    de=Image.open(f'{A}/de_chung.png').convert('RGBA')
    rows=(len(ids)+cols-1)//cols
    S=Image.new('RGBA',(cols*C, rows*(C+16)+24),(38,40,46,255)); d=ImageDraw.Draw(S)
    d.text((6,4),title,fill=(255,255,255,255))
    for i,id in enumerate(ids):
        x0=(i%cols)*C; y0=24+(i//cols)*(C+16)
        # cell bg
        d.rectangle([x0+2,y0+2,x0+C-3,y0+C-3],fill=(58,62,70,255),outline=(255,200,60,255) if id in mark else (80,84,92,255))
        b=int(C*0.7); S.alpha_composite(de.resize((b,b),Image.LANCZOS),(x0+(C-b)//2,y0+(C-b)//2))
        D=int(round(C*HK[id])); hd=Image.open(f'{A}/{id}_nong.png').convert('RGBA').resize((D,D),Image.LANCZOS).rotate(30,Image.BICUBIC)
        S.alpha_composite(hd,(x0+(C-D)//2,y0+(C-D)//2))
        d.text((x0+4,y0+C),f'{id} {HK[id]:.2f}',fill=(230,230,230,255))
    S.convert('RGB').save(out)
if __name__=='__main__':
    HK=load(sys.argv[1]); ids=sys.argv[3].split(','); sheet(HK,ids,sys.argv[2],sys.argv[4] if len(sys.argv)>4 else '', mark=set(sys.argv[5].split(',')) if len(sys.argv)>5 else ())
