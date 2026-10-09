import json, math, sys
from PIL import Image
sys.path.insert(0,'.')
from rig import frame
def poses(kind, legs, arms):
    out=[]
    for i in range(12):  # idle
        t=i/12*2*math.pi
        p={'bob':math.sin(t)*3}
        for a in arms: p[a]=math.sin(t)*4
        p['head']=math.sin(t+1)*2
        out.append(('Thở',p))
    for i in range(12):  # walk
        t=i/12*2*math.pi
        p={'bob':-abs(math.sin(t))*8,'head':math.sin(2*t)*2}
        for j,l in enumerate(legs): p[l]=math.sin(t+(math.pi if j%2 else 0))*22
        for j,a in enumerate(arms): p[a]=-math.sin(t+(math.pi if j%2 else 0))*18
        if 'tail' in kind: p['tail']=math.sin(2*t)*15
        out.append(('Đi',p))
    for i in range(12):  # attack
        u=i/11
        wind=min(u/0.4,1); hit=max(0,(u-0.4)/0.2); hit=min(hit,1); back=max(0,(u-0.75)/0.25)
        k=(-1 if 'quad' in kind else 1)
        p={'body':(10*wind-25*hit)*(1-back) if 'quad' in kind else (-8*wind+14*hit)*(1-back),'dx':(-10*wind+40*hit)*(1-back)}
        if arms: p[arms[0]]=(55*wind-120*hit)*(1-back)
        if 'quad' in kind: p['head']=(15*wind-30*hit)*(1-back)
        out.append(('Đánh',p))
    return out
def run(name, kind, legs, arms):
    cfg=json.load(open(name+'.json'))
    return [frame(cfg,p).resize((300,300),Image.LANCZOS) for _,p in poses(kind,legs,arms)]
H=run('hero','biped',['leg_f','leg_b'],['arm_f','arm_b'])
B=run('boar','quad tail',['legFN','legBF','legFF','legBN'],[])
K=run('knight','biped',['leg_f','leg_b'],['arm_f','arm_b'])
frames=[]
for h,b,k in zip(H,B,K):
    f=Image.new('RGB',(900,300),'white')
    for i,im in enumerate((h,b,k)): f.paste(im.convert('RGB'),(i*300,0))
    frames.append(f)
frames[0].save('chibi_thu.gif',save_all=True,append_images=frames[1:],duration=90,loop=0)
frames[4].save('chibi_tinh.png'); frames[16].save('chibi_di.png'); frames[30].save('chibi_danh.png')
