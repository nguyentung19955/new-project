import sys; sys.path.insert(0,'/root/rig')
from tudon import clean
from PIL import Image
import numpy as np, os
D='/root/neon/docs/demo-hop-tuong/nguon-tuong/sentinel'
def build(k):
  fr=[]
  for i in range(9):
    p=f'{D}/fixed_{k}_{i}.png'
    fx=os.path.exists(p)
    im=Image.open(p) if fx else Image.open(f'{D}/pl2_atk_{k}_{i}.png' if k=='sw' else f'{D}/pl_atk_{k}_{i}.png')
    if fx: c,n=im.convert('RGBA'),0
    elif k in ('e','ne','nw','w','sw'): c,n=clean(im)
    else:
      from tudon import keep_main
      c=Image.fromarray(keep_main(np.array(im.convert('RGBA')).astype(int)).astype('uint8')); n=0
    fr.append((c,n,fx))
  return fr
if __name__=='__main__':
  dirs=sys.argv[1:]; S=os.environ['S']
  out=Image.new('RGBA',(9*160,len(dirs)*160),(96,100,108,255))
  for r,k in enumerate(dirs):
    fr=build(k); sheet=Image.new('RGBA',(148*9,148))
    for i,(c,n,fx) in enumerate(fr):
      sheet.paste(c,(i*148,0)); out.alpha_composite(c.crop((4,4,144,144)).resize((160,160),Image.NEAREST),(i*160,r*160))
    sheet.save(f'{D}/sentinel_atk_{k}_sach.png')
    print(k,'hiệu ứng còn lại (điểm):',[n for c,n,fx in fr],'khung ChatGPT sửa:',[i for i,(c,n,fx) in enumerate(fr) if fx])
  out.save(S+'/tong.png')
