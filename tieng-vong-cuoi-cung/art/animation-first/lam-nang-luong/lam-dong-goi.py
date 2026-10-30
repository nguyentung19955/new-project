# Package 8 run frames into final/run: frames, sheet, 1x/3x GIFs, numbered 2x strip.
import sys
from PIL import Image, ImageDraw
src,dst,ms=sys.argv[1],sys.argv[2],int(sys.argv[3])
fr=[Image.open(f'{src}/{k}.png').convert('RGBA') for k in range(8)]
sheet=Image.new('RGBA',(128*8,128))
for k,f in enumerate(fr): f.save(f'{dst}/{k}.png'); sheet.paste(f,(128*k,0))
sheet.save(f'{dst}/lam_run_sheet.png')
BG=(234,235,235,255)
def gif(scale,name):
    ims=[]
    for f in fr:
        b=Image.new('RGBA',f.size,BG); b.alpha_composite(f)
        ims.append(b.convert('RGB').resize((128*scale,128*scale),Image.NEAREST))
    ims[0].save(f'{dst}/{name}',save_all=True,append_images=ims[1:],duration=ms,loop=0,disposal=2)
gif(1,'lam_run_1x.gif'); gif(3,'lam_run_3x.gif')
st=Image.new('RGBA',(256*8,276),BG); d=ImageDraw.Draw(st)
for k,f in enumerate(fr):
    st.alpha_composite(f.resize((256,256),Image.NEAREST),(256*k,0)); d.text((256*k+120,260),f'R{k+1}',fill=(0,0,0,255))
st.save(f'{dst}/strip_2x_danh-so.png')
