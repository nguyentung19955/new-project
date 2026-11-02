import sys
from PIL import Image
S='docs/demo-hop-tuong/nguon-chatgpt/v3/'; O='demo/assets/v3/'
specs={'lance':('lance_5huong',['s','sw','w','nw','n']),'scorch':('scorch_5huong',['s','sw','w','nw','n']),
 'frost':('frost_5huong',['s','sw','w','nw','n']),'arc':('arc_5huong',['s','sw','w','nw','n']),
 'broker':('broker_5huong',['s','sw','w','nw','n']),'venom':('venom_5huong',['s','sw','w','nw','n']),
 'glitch':('glitch_3huong',['s','w','n'])}
C=160; FOOT=150
for uid,(f,dirs) in specs.items():
    im=Image.open(S+f+'.png').convert('RGBA'); W,H=im.size; n=len(dirs); cw=W/n
    cells=[]
    for i in range(n):
        p=im.crop((round(i*cw),0,round((i+1)*cw),H)); bb=p.getchannel('A').point(lambda v:255 if v>24 else 0).getbbox(); cells.append(p.crop(bb))
    k=118/cells[0].height
    for d,p in zip(dirs,cells):
        q=p.resize((max(1,round(p.width*k)),max(1,round(p.height*k))),Image.LANCZOS)
        if q.width>C-4: q=q.resize((C-4,round(q.height*(C-4)/q.width)),Image.LANCZOS)
        out=Image.new('RGBA',(C,C),(0,0,0,0)); out.alpha_composite(q,((C-q.width)//2,max(0,FOOT-q.height)))
        out.save(O+f'{uid}_{d}.png',optimize=True)
    print(uid,[c.size for c in cells])
