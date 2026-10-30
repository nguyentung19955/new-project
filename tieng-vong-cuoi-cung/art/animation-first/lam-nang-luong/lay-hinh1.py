import numpy as np
from PIL import Image
src=np.asarray(Image.open('chatgpt_lam_master_v1.png').convert('RGB')).astype(float)
X0,Y0,X1,Y1=470,40,900,640
g,ox,oy=4.7,1.0,4.0
reg=src[Y0:Y1,X0:X1]; h,w,_=reg.shape
nx=int((w-ox)//g); ny=int((h-oy)//g)
cells=np.zeros((ny,nx,3))
for j in range(ny):
    for i in range(nx):
        c=reg[int(oy+j*g)+1:int(oy+(j+1)*g),int(ox+i*g)+1:int(ox+(i+1)*g)].reshape(-1,3)
        cells[j,i]=np.median(c,axis=0)
bg=np.median(reg[:20,:20].reshape(-1,3),axis=0)
isbg=(np.abs(cells-bg).sum(2)<45)|((cells.min(2)>205)&(np.abs(cells[:,:,0]-cells[:,:,2])<25))
# palette: k-means on figure cells
pts=cells[~isbg]
rng=np.random.default_rng(0); K=16
C=pts[rng.choice(len(pts),K,replace=False)]
for _ in range(30):
    lab=((pts[:,None]-C[None])**2).sum(2).argmin(1)
    C=np.array([pts[lab==k].mean(0) if (lab==k).any() else C[k] for k in range(K)])
lab=((cells[:,:,None]-C[None,None])**2).sum(3).argmin(2)
out=np.zeros((ny,nx,4),np.uint8)
out[...,:3]=C[lab].round(); out[...,3]=np.where(isbg,0,255)
im=Image.fromarray(out,'RGBA'); bb=im.getbbox(); im=im.crop(bb)
im.save('lam_hinh1_pixel.png'); print(im.size)
b=Image.new('RGBA',im.size,(235,235,235,255)); b.alpha_composite(im); b.resize((im.width*4,im.height*4),Image.NEAREST).save('lam_hinh1_pixel_4x.png')
