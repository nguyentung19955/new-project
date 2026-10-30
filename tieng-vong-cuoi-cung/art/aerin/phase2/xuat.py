# Tách hình PixelLab (vẽ 2x trên nền hồng) -> PNG gốc 1:1; ghép strip 1x/4x và GIF. Không resample hình gốc.
import sys,os,json
from PIL import Image
D=os.path.dirname(os.path.abspath(__file__))+'/'
src=Image.open(sys.argv[1]).convert('RGB')
W=112
clips={'dung':(0,4,150),'chay':(1,6,85)}
info={}
for name,(row,n,ms) in clips.items():
    fr=[]
    for k in range(n):
        f=Image.new('RGBA',(W,W),(0,0,0,0))
        for y in range(W):
            for x in range(W):
                p=src.getpixel((k*W*2+2*x,row*W*2+2*y))
                if not(p[0]>200 and p[2]>200 and p[1]<80): f.putpixel((x,y),p+(255,))
        f.save(D+f'goc/{name}-{k}.png'); fr.append(f)
    # chân: hàng thấp nhất có pixel không phải lưỡi kiếm (cyan) trên toàn clip
    def cy(p): return p[2]>200 and p[1]>180 and p[0]<170
    feet=[max(y for y in range(W) for x in range(W) if f.getpixel((x,y))[3] and not cy(f.getpixel((x,y)))) for f in fr]
    info[name]={'frames':n,'ms':ms,'canvas':W,'feet_y_per_frame':feet}
    sh=Image.new('RGBA',(W*n,W)); [sh.paste(f,(i*W,0)) for i,f in enumerate(fr)]; sh.save(D+f'{name}-sheet.png')
    bg=Image.new('RGBA',sh.size,(58,63,68,255)); bg.alpha_composite(sh); bg.resize((sh.width*4,W*4),Image.NEAREST).save(D+f'{name}-x4.png')
    g=[]
    for f in fr:
        b=Image.new('RGBA',(W,W),(58,63,68,255)); b.alpha_composite(f); g.append(b.resize((W*3,W*3),Image.NEAREST).convert('P',palette=Image.ADAPTIVE))
    g[0].save(D+f'{name}.gif',save_all=True,append_images=g[1:],duration=ms,loop=0)
json.dump(info,open(D+'info.json','w'),indent=1); print(info)
