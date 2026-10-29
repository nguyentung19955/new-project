"""Thử: Lam pixel 54 điểm – dựng chạy 6 hình + chém 5 hình bằng cách cắt mảnh và dịch từng điểm ảnh (không gen AI).
AI chỉ cung cấp MỘT dáng đứng; mọi khung giữ y nguyên điểm ảnh của đầu/mũ/đèn/chuông."""
from PIL import Image, ImageDraw
import numpy as np, sys
P='art/huong-moi/lam-pixel/'
src=np.array(Image.open(P+'lam4-dung-54px.png').convert('RGBA'))
H,W=src.shape[:2]
PAD_L,PAD_R,PAD_T=16,40,6
CW,CH=W+PAD_L+PAD_R,H+PAD_T+4
GROUND=PAD_T+H  # đường chân
def blank(): return np.zeros((CH,CW,4),np.uint8)
def paste(dst,part,dx,dy):
    ys,xs=np.nonzero(part[...,3])
    for y,x in zip(ys,xs):
        X,Y=x+dx+PAD_L,y+dy+PAD_T
        if 0<=X<CW and 0<=Y<CH: dst[Y,X]=part[y,x]
def mask(fn):
    m=np.zeros_like(src);yy,xx=np.mgrid[0:H,0:W];sel=fn(xx,yy)&(src[...,3]>0);m[sel]=src[sel];return m
BOOT_Y=49
boot_back=mask(lambda x,y:(y>=BOOT_Y)&(x<24))
boot_front=mask(lambda x,y:(y>=BOOT_Y)&(x>=24))
lantern=mask(lambda x,y:(x<13)&(y>=24)&(y<BOOT_Y))
bell_tip=mask(lambda x,y:(x<7)&(y>=9)&(y<19))
blade=mask(lambda x,y:(x>=37)&(y>=29)&(y<BOOT_Y))
body=mask(lambda x,y:(y<BOOT_Y))
for m in (lantern,bell_tip,blade): body[m[...,3]>0]=0
# Lấp chỗ trống sau khi bỏ mảnh: không cần vì mảnh vẽ lại đè lên.
def frame(bob=0,lean=0,bf=(0,0),bb=(0,0),lan=(0,0),bell=(0,0),bl=(0,0),blade_img=None,arc=None):
    f=blank()
    paste(f,lantern,lan[0]+lean,lan[1]+bob)
    paste(f,boot_back,bb[0],bb[1]);
    # thân: nghiêng = dịch các hàng trên thêm lean px
    b=body.copy()
    top=np.zeros_like(b);top[:30]=b[:30];low=b.copy();low[:30]=0
    paste(f,low,0,bob);paste(f,top,lean,bob)
    paste(f,bell_tip,bell[0]+lean,bell[1]+bob)
    paste(f,boot_front,bf[0],bf[1])
    paste(f,blade_img if blade_img is not None else blade,bl[0],bl[1]+bob)
    img=Image.fromarray(f)
    if arc:
        d=ImageDraw.Draw(img)
        for i,(r,c) in enumerate(arc): d.arc(r,*c[:2],fill=c[2],width=2)
    return img
# CHẠY 6 hình: chân trước/sau đổi luân phiên, thân nhún 0/1 px, nghiêng 1 px
run=[frame(bob=0,lean=1,bf=(4,0),bb=(-4,0),lan=(-1,0),bell=(-1,0),bl=(1,0)),
     frame(bob=1,lean=1,bf=(2,0),bb=(-1,-2),lan=(-1,1),bell=(-2,1),bl=(1,0)),
     frame(bob=0,lean=1,bf=(-1,0),bb=(3,-2),lan=(0,0),bell=(-1,0),bl=(1,0)),
     frame(bob=0,lean=1,bf=(-4,0),bb=(4,0),lan=(-1,0),bell=(-1,0),bl=(1,0)),
     frame(bob=1,lean=1,bf=(-1,-2),bb=(2,0),lan=(-1,1),bell=(-2,1),bl=(1,0)),
     frame(bob=0,lean=1,bf=(3,-2),bb=(-1,0),lan=(0,0),bell=(-1,0),bl=(1,0))]
# CHÉM 5 hình: lấy đà (dao lùi + giơ) → đánh mạnh (dao vươn trước, xoay 90°, cung vàng) → hồi
bx=np.nonzero(blade[...,3].any(axis=0))[0];by=np.nonzero(blade[...,3].any(axis=1))[0]
cut=blade[by.min():by.max()+1,bx.min():bx.max()+1]
def put(img_arr,dx,dy):
    m=np.zeros((H,W+30,4),np.uint8);h,w=img_arr.shape[:2];m[by.min()+dy:by.min()+dy+h,bx.min()+dx:bx.min()+dx+w]=img_arr;return m
rot=np.rot90(cut,-1)  # dao chĩa ngang ra trước
GOLD=(245,214,140,255);PALE=(255,240,200,255)
sl=[frame(lean=-1,bl=(-3,-3),bf=(1,0),bb=(-1,0),blade_img=put(cut,-3,-3)),
    frame(lean=-2,bl=(0,0),bf=(1,0),bb=(-2,0),blade_img=put(cut,-6,-8),bell=(1,0)),
    frame(lean=2,bf=(5,0),bb=(-3,0),blade_img=put(rot,2,4),bell=(-2,0),lan=(-1,0),
          arc=[([PAD_L+24,PAD_T+6,PAD_L+W+30,PAD_T+H-2],(-70,70,GOLD)),([PAD_L+28,PAD_T+10,PAD_L+W+26,PAD_T+H-6],(-55,55,PALE))]),
    frame(lean=1,bf=(4,0),bb=(-2,0),blade_img=put(rot,1,5),bell=(-1,0),
          arc=[([PAD_L+24,PAD_T+6,PAD_L+W+30,PAD_T+H-2],(20,70,GOLD))]),
    frame(lean=0,bf=(2,0),bb=(-1,0),bl=(0,0))]
def xuat(frames,ten,ms,scale=4):
    bg=(40,46,54,255);out=[]
    for f in frames:
        c=Image.new('RGBA',f.size,bg);c.alpha_composite(f);out.append(c.resize((f.width*scale,f.height*scale),Image.NEAREST).convert('RGB'))
    out[0].save(P+f'thu-{ten}.gif',save_all=True,append_images=out[1:],duration=ms,loop=0)
    sheet=Image.new('RGBA',(frames[0].width*len(frames),frames[0].height));[sheet.alpha_composite(f,(i*f.width,0)) for i,f in enumerate(frames)];sheet.save(P+f'lam4-{ten}-sheet.png')
xuat(run,'chay',90);xuat(run,'chay-cham',300)
xuat(sl,'chem',[80,90,140,110,120]);xuat(sl,'chem-cham',[320,360,560,440,480])
