# Ghép kiem4 (3 đòn mới hướng phải) + bộ hướng trái (SW, không lật gương) vào lam-pixellab.json của trang thử
import json,os
from PIL import Image
K=os.path.dirname(os.path.abspath(__file__))+'/'
P=os.path.abspath(K+'../../../pixellab')+'/'
J=json.load(open(P+'lam-pixellab.json'))
def pack(frames,name,neo):
    W=frames[0].width; bb=None
    for f in frames:
        b=f.getbbox()
        if b: bb=b if bb is None else (min(bb[0],b[0]),min(bb[1],b[1]),max(bb[2],b[2]),max(bb[3],b[3]))
    x0,y0,x1,y1=bb; w,h=x1-x0,y1-y0
    sh=Image.new('RGBA',(w*len(frames),h))
    for i,f in enumerate(frames): sh.paste(f.crop(bb),(i*w,0))
    sh.save(P+name+'.png')
    return {'anh':name+'.png','xep':'hang','o':[w,h],'so_hinh':len(frames),'chan':[neo[0]-x0,neo[1]-y0],'nguon_goc':{'o_goc':[W,W],'cat_tu':[x0,y0],'neo_goc':list(neo)}}
def ld(p): return Image.open(p).convert('RGBA')
# --- 3 đòn hướng phải ---
for n,imp in [('chem1',3),('chem2',2),('chem3',4)]:
    fr=[]; i=0
    while os.path.exists(K+f'{n}/{n}-{i}.png'): fr.append(ld(K+f'{n}/{n}-{i}.png')); i+=1
    d=pack(fr,n,(52,81)); old=J['clip'][n]
    ms={'chem1':[70,90,100,40,90,110],'chem2':[70,70,40,80,80,110],'chem3':[70,90,90,80,50,140,110]}[n]
    d.update({'ms':ms,'lap':False,'manh':[imp],'pha':{'layda':list(range(imp)),'rado':[imp],'hoi':list(range(imp+1,len(fr)))}})
    J['clip'][n]=d
# --- hướng trái (SW): đứng, chạy, bị đánh ---
def feet(f):
    A=f.getchannel('A'); return f.getbbox()[3]
for n,src,idx in [('dung','sw-dung-',[0,1,2,3]),('chay','sw-chay-',[0,1,2,3,4,5]),('bi-danh','sw-bidanh-',[0,3,4])]:
    fr=[ld(K+f'goc/{src}{i}.png') for i in idx]
    W=fr[0].width; neo=(W//2, max(feet(f) for f in fr))
    d=pack(fr,n+'-trai',neo)
    for k,v in J['clip'][n].items():
        if k not in d and k not in ('mat','nguon_goc'): d[k]=v
    J['clip'][n+'-trai']=d
json.dump(J,open(P+'lam-pixellab.json','w'),ensure_ascii=False,indent=1)
print({k:(v['o'],v['chan']) for k,v in J['clip'].items() if k.startswith(('chem','dung','chay','bi-danh'))})
