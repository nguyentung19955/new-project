from PIL import Image
import glob,os
for f in glob.glob('demo/assets/v3/*_*.png'):
    n=os.path.basename(f)
    if n.startswith('tile'): continue
    im=Image.open(f).convert('RGBA')
    if im.height!=160: continue
    im=im.resize((round(im.width*0.7),112),Image.LANCZOS)
    im.quantize(colors=256,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE).save(f,optimize=True)
