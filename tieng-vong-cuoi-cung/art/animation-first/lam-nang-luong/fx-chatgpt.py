# Convert ChatGPT's FX image (2 rows x 6 cols, magenta bg) to 128x128 pixel FX layers in Lam's palette.
# No drawing: downsample each cell (majority colour per block), magenta -> transparent, colours -> nearest Lam ramp.
import sys,numpy as np
from PIL import Image
from collections import Counter
D='row2_fx_chatgpt'; SHIFT_Y=int(sys.argv[1]) if len(sys.argv)>1 else 0
full=Image.new('RGB',(2172,723)); full.paste(Image.open(f'{D}/left.png').convert('RGB'),(0,0)); full.paste(Image.open(f'{D}/right.png').convert('RGB'),(1086,0))
full.save(f'{D}/chatgpt_fx_full.png')
a=np.array(full).astype(int)
RAMP=np.array([(119,224,248),(16,226,253),(7,181,251),(5,149,247),(3,116,228),(4,89,197)])
cw=2172/6; ch=723/2; S=cw/128
def cell(r,c):
    out=np.zeros((128,128,4),np.uint8)
    for y in range(128):
        for x in range(128):
            x0=int(c*cw+x*S); y0=int(r*ch+y*S); blk=a[y0:int(r*ch+(y+1)*S)+1, x0:int(c*cw+(x+1)*S)+1].reshape(-1,3)
            mag=(blk[:,0]>200)&(blk[:,1]<80)&(blk[:,2]>200)
            if mag.sum()>=len(blk)*0.5: continue
            col=blk[~mag].mean(0)
            k=np.argmin(((RAMP-col)**2).sum(1)); yy=y+SHIFT_Y
            if 0<=yy<128: out[yy,x]=(*RAMP[k],255)
    return Image.fromarray(out)
for c in range(6):
    cell(0,c).save(f'{D}/far_{c+1}.png'); cell(1,c).save(f'{D}/near_{c+1}.png')
print('ok')
