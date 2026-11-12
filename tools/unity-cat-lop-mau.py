import json,sys,numpy as np
from PIL import Image,ImageFilter
U='/mnt/user-data/uploads/'; O='/home/claude/mau-unity/Giao/2026-11-12_mau_thu/'
def key(im):
    a=np.asarray(im.convert('RGB')).astype(np.float32)
    d=np.sqrt(((a-np.array([255,0,255]))**2).sum(2))
    al=np.clip((d-65)/60,0,1)
    r,g,b=a[...,0],a[...,1],a[...,2]
    # khử ám hồng ở mép: kéo R,B về gần G khi alpha thấp
    m=(al<1)
    lim=np.maximum(g,np.minimum(r,b)*al)
    r=np.where(m,np.minimum(r,lim+ (r-lim)*al),r); b=np.where(m,np.minimum(b,lim+(b-lim)*al),b)
    out=np.dstack([r,g,b,al*255]).clip(0,255).astype(np.uint8)
    return Image.fromarray(out,'RGBA')
def keyglow_tim(im):
    a=np.asarray(im.convert('RGB')).astype(np.float32); r,g,b=a[...,0],a[...,1],a[...,2]
    al=np.clip(np.maximum((g-30)/110,(255-r-25)/80),0,1)
    out=np.dstack([np.maximum(g,175),g,np.full_like(g,255),al*255]).clip(0,255).astype(np.uint8)
    return Image.fromarray(out,'RGBA')
def keyglow_xanh(im):
    a=np.asarray(im.convert('RGB')).astype(np.float32); r,g,b=a[...,0],a[...,1],a[...,2]
    al=np.clip((g-45)/150,0,1)
    out=np.dstack([np.minimum(r,g)*al,np.maximum(g,200),np.full_like(g,255),al*255]).clip(0,255).astype(np.uint8)
    return Image.fromarray(out,'RGBA')
def bbox(im,t=24):
    a=np.asarray(im)[...,3]>t; ys,xs=np.where(a); return int(xs.min()),int(ys.min()),int(xs.max())+1,int(ys.max())+1
def cells(im,nx,ny):
    w,h=im.width//nx,im.height//ny
    return [im.crop((x*w,y*h,(x+1)*w,(y+1)*h)) for y in range(ny) for x in range(nx)]
def canvas(n): return Image.new('RGBA',(n,n),(0,0,0,0))
def sang_tu(im):  # lấy phần tự phát sáng (xanh lơ) ngay từ hình ráp → khớp vị trí tuyệt đối
    a=np.asarray(im).astype(np.int32); r,g,b,al=a[...,0],a[...,1],a[...,2],a[...,3]
    m=((g>205)&(b>225)&(r<175)&(al>200)).astype(np.uint8)*255
    near=np.asarray(Image.fromarray(m,'L').filter(ImageFilter.MaxFilter(15)))>0
    m=np.maximum(m,(((g>215)&(b>230)&(al>200))&near).astype(np.uint8)*255)
    M=Image.fromarray(m,'L').filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.5))
    o=im.copy(); o.putalpha(Image.fromarray(np.minimum(np.asarray(M),al).astype(np.uint8),'L')); return o
def luu(im,ten): im.save(O+ten); print(ten,im.size,bbox(im))

# ---------- GIANT (kiểu B, canvas 1024, giữ cỡ gốc) ----------
c=cells(Image.open(U+'590a2023-image.png'),2,2)
than,reu=key(c[1]),key(c[2]); sang=keyglow_tim(c[3]); rap0=key(c[0])
bx=bbox(than); ox=512-(bx[0]+bx[2])//2; oy=int(1024*0.85)-bx[3]   # đáy chạm vạch 85%
for im,t in((than,'quai_khong_lo_than.png'),(reu,'quai_khong_lo_reu.png'),(sang,'quai_khong_lo_sang.png')):
    C=canvas(1024); C.alpha_composite(im,(ox,oy)); luu(C,t)
C=canvas(1024); [C.alpha_composite(Image.open(O+t)) for t in('quai_khong_lo_than.png','quai_khong_lo_sang.png','quai_khong_lo_reu.png')]; luu(C,'quai_khong_lo_rap.png')
json.dump({'canvas':1024,'tam':[512,int(1024*0.85)-(bx[3]-bx[1])//2],'day':[512,int(1024*0.85)]},open(O+'quai_khong_lo_diem.json','w'))

# ---------- FREEZER (canvas 1024) ----------
c=cells(Image.open(U+'60d8bf87-image.png'),2,2)
A,mu,tuyet=key(c[0]),key(c[2]),keyglow_xanh(c[3]); khoi=key(Image.open(U+'085d3ecf-image.png'))
bA,bm,bk=bbox(A),bbox(mu),bbox(khoi)
k=khoi.crop(bk)                      # khối giữ cỡ gốc (to nhất)
s=0.84*1024/max(bA[2]-bA[0],bA[3]-bA[1])                                   # tỉ lệ: khối trong hình ráp rộng ~455 px (x 90..545)
def sc(im,f): return im.resize((max(1,round(im.width*f)),max(1,round(im.height*f))),Image.LANCZOS)
m=sc(mu.crop(bm),s*(bA[2]-bA[0])/(bm[2]-bm[0]))  # mũ: rộng bằng hình ráp
bt=bbox(tuyet,120); t=sc(tuyet.crop(bt),s*175/(bt[2]-bt[0]))
# toạ độ trong hệ hình ráp (×s): khối trái=90, đáy=568; mũ trái-trên = bbox ráp; tuyết tâm (292,397)
W=round((bA[2]-bA[0])*s); H=round((bA[3]-bA[1])*s)
x0=512-W//2; y0=int(1024*0.85)-H
def P(x,y): return (x0+round((x-bA[0])*s), y0+round((y-bA[1])*s))
k=sc(k,s*(545-90)/k.width); Ck=canvas(1024); px,py=P(90,568); Ck.alpha_composite(k,(px,py-k.height)); luu(Ck,'trum_freezer_khoi.png')
Cm=canvas(1024); Cm.alpha_composite(m,P(bA[0],bA[1])); luu(Cm,'trum_freezer_mu.png')
Ct=canvas(1024); cx,cy=P(292,397); Ct.alpha_composite(t,(cx-t.width//2,cy-t.height//2)); luu(Ct,'trum_freezer_sang_loi.png')
C=canvas(1024); [C.alpha_composite(x) for x in(Ck,Ct,Cm)]; luu(C,'trum_freezer_rap.png')
json.dump({'canvas':1024,'day':[512,int(1024*0.85)],'loi':[cx,cy],'mu_khop':[512,P(0,300)[1]]},open(O+'trum_freezer_diem.json','w'))
sc(A,1).save('/home/claude/mau-unity/tool/freezer_goc.png')

# ---------- Ụ: trục xoay theo ảnh web cũ ----------
def truc(f):  # tỉ lệ vị trí tâm canvas dọc theo chiều nòng (0 = đuôi, 1 = đầu nòng) ở ảnh cũ (nòng chĩa phải)
    im=Image.open('/home/claude/wt-cd/thap/assets/'+f).convert('RGBA'); b=bbox(im); return (im.width/2-b[0])/(b[2]-b[0])
def dat(lop,ref_bbox,frac,N=512,le=0.08):
    # ref_bbox: bbox hình ráp trong ô nguồn; trục xoay = (giữa ngang, từ đáy lên frac*cao)
    x0,y0,x1,y1=ref_bbox; px=(x0+x1)/2; py=y1-frac*(y1-y0)
    r=max(px-x0,x1-px,py-y0,y1-py); s=(N/2*(1-2*le))/r
    out=[]
    for im in lop:
        C=canvas(N); j=sc(im,s); C.alpha_composite(j,(round(N/2-px*s),round(N/2-py*s))) if True else 0; out.append(C)
    return out,s,(px,py)
# GATLING
c=cells(Image.open(U+'c345bdbc-image.png'),2,2)
A,than,cum=key(c[0]),key(c[1]),key(c[2]); bA,bc=bbox(A),bbox(cum)
# cụm nòng: canh đỉnh + giữa ngang theo hình ráp
cum2=Image.new('RGBA',A.size,(0,0,0,0)); cc=cum.crop(bc); cum2.alpha_composite(cc,((bA[0]+bA[2])//2-cc.width//2-0,bA[1]))
f=truc('lien_nong.png'); (a,b_,c_,d),s,(px,py)=dat([A,than,cum2,sang_tu(A)],bA,f)
luu(a,'lien_nong.png'); luu(b_,'lien_nong_than.png'); luu(c_,'lien_nong_cumnong.png'); luu(d,'lien_nong_sang.png')
tb=bbox(c_); json.dump({'canvas':512,'truc':[256,256],'nong':[[(tb[0]+tb[2])//2,tb[1]]],'xoay':{'cumnong':[(tb[0]+tb[2])//2,(tb[1]+tb[3])//2]},'truc_theo_anh_cu':round(f,3)},open(O+'lien_diem.json','w'))
# SCATTER
c=cells(Image.open(U+'527b12c3-image.png'),2,1); A=key(c[0]); bA=bbox(A)
f=truc('phun_nong.png'); (a,d),s,_=dat([A,sang_tu(A)],bA,f)
luu(a,'phun_nong.png'); luu(d,'phun_nong_sang.png'); tb=bbox(a)
json.dump({'canvas':512,'truc':[256,256],'nong':[[(tb[0]+tb[2])//2,tb[1]]],'truc_theo_anh_cu':round(f,3)},open(O+'phun_diem.json','w'))
