"""Design-lock QA for PixelLab frames vs the Lam master.
usage: python3 qa.py master.png frame0.png frame1.png ...
Checks per frame:
  colors  : % of pixels whose colour is far from every master palette colour (added details / new colours)
  mask    : best template match of the master mask+eyes block; mismatched pixels inside it (mouth, changed eyes)
  specks  : opaque components smaller than 4 px (broken pixels)
  holes   : transparent pockets fully enclosed by the body (tears)
  size    : body height and foot baseline vs master
Frame-to-frame: centroid jump."""
import sys, numpy as np
from PIL import Image
from collections import deque
def load(p):
    a=np.array(Image.open(p).convert('RGBA')).astype(int); return a
M=load(sys.argv[1])
pal=np.array(sorted({tuple(p[:3]) for p in M.reshape(-1,4) if p[3]>0}))
def comps(mask,eight=True):
    H,W=mask.shape; seen=np.zeros_like(mask,bool); out=[]
    for y in range(H):
        for x in range(W):
            if mask[y,x] and not seen[y,x]:
                q=deque([(y,x)]); seen[y,x]=True; c=[]
                while q:
                    cy,cx=q.popleft(); c.append((cy,cx))
                    for dy in (-1,0,1):
                        for dx in (-1,0,1):
                            if (dy or dx) and (eight or not(dy and dx)):
                                ny,nx=cy+dy,cx+dx
                                if 0<=ny<H and 0<=nx<W and mask[ny,nx] and not seen[ny,nx]: seen[ny,nx]=True; q.append((ny,nx))
                out.append(c)
    return out
def mask_block(a):
    pale=(a[...,3]>0)&(a[...,:3].sum(2)>400)&(a[...,0]>100)
    cs=[c for c in comps(pale) if len(c)>=20]
    dk=(a[...,3]>0)&(a[...,:3].sum(2)<120)
    best=None
    for c in cs:
        ys=[p[0] for p in c]; xs=[p[1] for p in c]
        bb=(min(ys),min(xs),max(ys)+1,max(xs)+1)
        eyes=dk[bb[0]:bb[2],bb[1]:bb[3]].sum()
        if eyes>=8 and (best is None or len(c)>best[0]): best=(len(c),bb)
    return best[1] if best else None
def info(a):
    op=a[...,3]>0; ys,xs=np.where(op)
    return dict(top=ys.min(),bot=ys.max(),h=ys.max()-ys.min()+1,cx=xs.mean(),cy=ys.mean(),n=op.sum())
mb=mask_block(M); mi=info(M)
H0=None
my0,mx0,my1,mx1=mb; tmpl=M[my0:my1,mx0:mx1]
dark=lambda b: (b[...,3]>0)&(b[...,:3].sum(2)<120)
print(f'master: h={mi["h"]} mask={mx1-mx0}x{my1-my0} palette={len(pal)}')
prev=None; allpass=True
MH=len([c for c in comps(~(M[...,3]>0),eight=False) if all(0<y<M.shape[0]-1 and 0<x<M.shape[1]-1 for y,x in c) and len(c)<60])
for p in sys.argv[2:]:
    a=load(p); op=a[...,3]>0
    d=np.sqrt(((a[...,None,:3]-pal[None,None])**2).sum(3)).min(2)
    newc=(op&(d>40)).sum()/max(1,op.sum())*100
    # mask check: slide the master mask block over the frame's own mask area
    fb=mask_block(a); mres='NO MASK'; mbad=999
    if fb:
        best=None
        for dy in range(-4,5):
            for dx in range(-4,5):
                y0,x0=fb[0]+dy,fb[1]+dx
                win=a[y0:y0+tmpl.shape[0],x0:x0+tmpl.shape[1]]
                if win.shape!=tmpl.shape: continue
                inside=tmpl[...,3]>0
                bad=((dark(win)!=dark(tmpl))&inside).sum()
                if best is None or bad<best: best=bad
        mbad=best if best is not None else 999; mres=f'{mbad}px'
    sp=[c for c in comps(op) if len(c)<4]
    hol=[c for c in comps(~op,eight=False) if all(0<y<a.shape[0]-1 and 0<x<a.shape[1]-1 for y,x in c) and len(c)<60]
    fi=info(a)
    jump='' if prev is None else f' jump={abs(fi["cx"]-prev["cx"]):.1f},{abs(fi["cy"]-prev["cy"]):.1f}'
    ok = newc<3 and mbad<=6 and len(sp)<=3 and len(hol)<=MH+2 and abs(fi['h']-mi['h'])<=12
    allpass&=ok
    print(f'{p.split("/")[-1]:>10}: {"PASS" if ok else "FAIL"} newcolor={newc:.1f}% mask_diff={mres} specks={len(sp)} holes={len(hol)} h={fi["h"]}({fi["h"]-mi["h"]:+d}) foot_y={fi["bot"]}{jump}')
    prev=fi
print('ALL PASS' if allpass else 'SOME FAIL')
