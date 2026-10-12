import sys,importlib.util,numpy as np
from PIL import Image
sp=importlib.util.spec_from_file_location('c','docs/anh-goc/zed/cat-diem-anh.py'); c=importlib.util.module_from_spec(sp); sp.loader.exec_module(c)
S=sys.argv[1]
def lay(n):
    arr=np.array(Image.open(f'docs/anh-goc/zed/v2/{n}.png').convert('RGB')); m=c.mat_na(arr)
    rgba=np.dstack([arr,(m*255).astype(np.uint8)]); h=c.tim_hinh(m); g=c.chia_hang(h,3)
    out=[]
    for row in g:
        r=[]
        for i in row:
            y0,y1,x0,x1,v=h[i]; cut=rgba[y0:y1,x0:x1].copy(); cut[...,3]=np.where(v,255,0); r.append((Image.fromarray(cut,'RGBA'),v))
        out.append(r)
    return out
B=lay('00-than-dung-di-chay'); G=lay('05-lop-giap-do'); N=lay('06-lop-non-la'); A=lay('07-lop-ao-choang')
print([len(x) for x in B],[len(x) for x in G],[len(x) for x in N],[len(x) for x in A])
def span(v,f0,f1):
    H=v.shape[0]; part=v[int(H*f0):int(H*f1)]; xs=np.where(part.any(0))[0]; return xs.min(),xs.max()
C=400
strip=Image.new('RGB',(200*8,200*3),(40,44,52))
for r,(ten,ms) in enumerate([('dung',125),('di',90),('chay',80)]):
    fr=[]
    for k in range(8):
        bi,bv=B[r][k]; H=bv.shape[0]
        ox=(C-bi.width)//2; oy=C-40-H
        can=Image.new('RGBA',(C,C),(40,44,52,255))
        tx0,tx1=span(bv,0.48,0.72); tcx=(tx0+tx1)/2
        hx0,hx1=span(bv,0.05,0.40); hcx=(hx0+hx1)/2
        # ao choang: sau lung
        if k<len(A[r]):
            ai,av=A[r][k]; sca=min(1.0,(tx1-tx0)*1.6/av.shape[1]) if r==0 else min(1.0,(tx1-tx0)*2.4/av.shape[1])
            ai=ai.resize((max(1,int(ai.width*sca)),max(1,int(ai.height*sca))),Image.LANCZOS)
            can.alpha_composite(ai,(int(ox+tcx-ai.width*0.9),int(oy+H*0.44)))
        can.alpha_composite(bi,(ox,oy))
        if k<len(G[r]):
            gi,gv=G[r][k]; tw=tx1-tx0; gw=gv.shape[1]; scg=min(1.0,tw*1.35/gw)
            gi=gi.resize((max(1,int(gi.width*scg)),max(1,int(gi.height*scg))),Image.LANCZOS)
            can.alpha_composite(gi,(int(ox+tcx-gi.width/2),int(oy+H*0.44)))
        if k<len(N[r]):
            ni,nv=N[r][k]; wid=nv.sum(1); top=int(nv.shape[0]*0.7); brim=int(np.argmax(wid[:top]))
            ni=ni.crop((0,0,ni.width,brim+4)); nv=nv[:brim+4]
            xs=np.where(nv[brim])[0]; ncx=(xs.min()+xs.max())/2; hw=hx1-hx0; scn=min(1.2,hw*1.35/(xs.max()-xs.min()+1))
            ni=ni.resize((max(1,int(ni.width*scn)),max(1,int(ni.height*scn))),Image.LANCZOS)
            can.alpha_composite(ni,(int(ox+hcx-ncx*scn),int(oy+H*0.16-brim*scn)))
        f=can.convert('RGB'); fr.append(f.resize((320,320)))
        strip.paste(f.resize((200,200)),(k*200,r*200))
    fr[0].save(f'{S}/c/ghep-{r+1}-{ten}.gif',save_all=True,append_images=fr[1:],duration=ms,loop=0)
strip.save(S+'/c/ghep-strip.png')
