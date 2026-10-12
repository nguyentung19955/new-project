import json,base64,io,sys,subprocess
import numpy as np
from PIL import Image
R='/home/claude/new-project/'
def load(key,rev=None):
    p=f'game/art/custom/em-be-{key}.sprite.json'
    s=subprocess.check_output(['git','-C',R,'show',f'{rev}:{p}']) if rev else open(R+p,'rb').read()
    d=json.loads(s)
    im=Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA')
    return d,np.array(im)
def frames(d,B,name='move'):
    m=d['dong_tac'][name]; n=d['net']; W=d['khung_rong']*n; H=d['khung_cao']*n
    return [B[m['hang']*H:(m['hang']+1)*H, i*W:(i+1)*W] for i in range(m['so'])]
if __name__=='__main__':
    rev=sys.argv[1] if len(sys.argv)>1 else None
    for k in ['hunter','wrestler','smith','healer']:
        d,B=load(k,rev); F=frames(d,B)
        print(k, d['dong_tac']['move'])
        for i,f in enumerate(F):
            a=f[...,3]>0; ys,xs=np.where(a)
            top=ys.min(); bot=ys.max(); h=bot-top+1
            head=a[top:top+int(h*0.5)]; hx=np.where(head)[1].mean()
            # foot band: bottom 6px rows: columns
            fb=a[bot-5:bot+1]; fx=np.where(fb.any(0))[0]
            print(f'  f{i}: top {top:3d} bot {bot:3d} h {h:3d} headCx {hx:5.1f} x[{xs.min()},{xs.max()}] footspan {fx.min()}-{fx.max()}')
        sheet=np.concatenate(F,1); Image.fromarray(sheet).resize((sheet.shape[1]*3,sheet.shape[0]*3),Image.NEAREST).save(f'{k}-{rev or "now"}.png')
