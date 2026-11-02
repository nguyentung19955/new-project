import sys,os
from PIL import Image
import numpy as np
from scipy import ndimage
S='docs/demo-hop-tuong/nguon-chatgpt/v3/'; O='demo/assets/v3/'
def clean(p):
    a=np.array(p); m=a[:,:,3]>24; lab,n=ndimage.label(m)
    if n<=1: return p
    sz=ndimage.sum(m,lab,range(1,n+1)); keep=np.zeros_like(m)
    for i,s in enumerate(sz,1):
        if s>=sz.max()*0.08: keep|=lab==i
    a[:,:,3]=np.where(ndimage.binary_dilation(keep,iterations=2),a[:,:,3],0); return Image.fromarray(a)
def cells(f,rows,cols,cl=True):
    im=Image.open(S+f).convert('RGBA'); W,H=im.size; cw,ch=W/cols,H/rows
    return [[(clean if cl else (lambda x:x))(im.crop((round(c*cw),round(r*ch),round((c+1)*cw),round((r+1)*ch)))) for c in range(cols)] for r in range(rows)]
def strip(row,C,fit,anchor='bottom',foot=None,common=True):
    boxes=[p.getchannel('A').point(lambda v:255 if v>16 else 0).getbbox() for p in row]; bs=[b for b in boxes if b]
    x0=min(b[0] for b in bs);y0=min(b[1] for b in bs);x1=max(b[2] for b in bs);y1=max(b[3] for b in bs)
    k=min(fit/(x1-x0),fit/(y1-y0))
    out=Image.new('RGBA',(C*len(row),C),(0,0,0,0))
    for i,p in enumerate(row):
        q=p.crop((x0,y0,x1,y1)); q=q.resize((max(1,round(q.width*k)),max(1,round(q.height*k))),Image.LANCZOS)
        y=(C-q.height)//2 if anchor=='center' else C-4-q.height
        out.alpha_composite(q,(i*C+(C-q.width)//2,y))
    return out
def save(im,name): im.quantize(colors=256,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE).save(O+name,optimize=True); print(name,im.size)
what=sys.argv[1]
if what=='vfx':
    g=cells('vfx_hit_grid.png',4,6,cl=False)
    for r,n in enumerate(['kinetic','frost','flame','electric']): save(strip(g[r],96,90,'center'),f'vfx_hit_{n}.png')
if what=='sm':
    g=cells('vfx_summon_merge_grid.png',2,6,cl=False)
    save(strip(g[0],112,106,'center'),'vfx_summon.png'); save(strip(g[1],112,106,'center'),'vfx_merge.png')
if what=='portraits':
    g=cells('portraits_grid.png',2,4)
    ids=[['scorch','frost','arc','lance'],['warp','broker','glitch','venom']]
    for r in range(2):
        for c in range(4):
            p=g[r][c]; bb=p.getchannel('A').point(lambda v:255 if v>16 else 0).getbbox(); p=p.crop(bb)
            k=200/max(p.size); p=p.resize((round(p.width*k),round(p.height*k)),Image.LANCZOS)
            o=Image.new('RGBA',(200,200),(0,0,0,0)); o.alpha_composite(p,((200-p.width)//2,200-p.height))
            save(o,f'portrait_{ids[r][c]}.png')
            if ids[r][c]=='broker': save(o,'portrait_miner.png')
if what=='enemies':
    g=cells('enemies_walk_grid.png',3,8)
    for r,n in enumerate(['thuong','nhanh','trau']): save(strip(g[r],112,104),f'enemy_{n}_walk.png')
if what=='bosses':
    g=cells('bosses_walk_grid.png',3,8)
    for r,n in enumerate(['firewall','overclock','corruptor']): save(strip(g[r],160,150),f'boss_{n}_walk.png')
