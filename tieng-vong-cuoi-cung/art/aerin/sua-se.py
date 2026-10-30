# AERIN SE master v2: theo Art Director – xoay thân thêm (ép nửa xa), khăn ra sau (screen-left), thu về ~53 px, vẽ lại mũi kiếm
from PIL import Image
import os,json
D=os.path.dirname(os.path.abspath(__file__))+'/'
src=Image.open(D+'attempt3/pixellab_original_se_64.png').convert('RGBA')
W=64; K=(0,0,0,255)
# 1) tách đuôi khăn (vùng trắng bên phải đầu, ngoài thân) và xoá
scarf=Image.new('RGBA',(W,W))
for y in range(17,32):
    for x in range(47,W):
        p=src.getpixel((x,y))
        if p[3]: scarf.putpixel((x,y),p); src.putpixel((x,y),(0,0,0,0))
# 2) xoay thêm: ép nửa xa (x>CX) theo chiều ngang
CX=32; S=0.82
f=Image.new('RGBA',(W,W))
for y in range(W):
    for x in range(W):
        if x<=CX: p=src.getpixel((x,y))
        else:
            sx=CX+(x-CX)/S
            p=src.getpixel((int(round(sx)),y)) if round(sx)<W else (0,0,0,0)
        if p[3]: f.putpixel((x,y),p)
# 3) đuôi khăn lật ra sau, bám sau vai trái màn hình (chỉ vẽ vào chỗ trống = nằm sau thân)
sb=scarf.getbbox()
t=scarf.crop(sb).transpose(Image.FLIP_LEFT_RIGHT)
px,py=17-t.width+3, 21
for y in range(t.height):
    for x in range(t.width):
        p=t.getpixel((x,y))
        if p[3] and 0<=px+x<W and not f.getpixel((px+x,py+y))[3]: f.putpixel((px+x,py+y),p)
# 4) thu nhỏ về ~53 px (nearest), giữ chân trên baseline
FEET=61; H=FEET+1; T=53; s=T/H
nw=round(W*s)
small=f.resize((nw,nw),Image.NEAREST)
# 5) viền đen: điểm trống kề màu sáng ở rìa ngoài -> đen (vá viền mất do thu nhỏ)
def outline(im):
    A=[[im.getpixel((x,y))[3]>0 for x in range(im.width)] for y in range(im.height)]
    out=im.copy()
    for y in range(im.height):
        for x in range(im.width):
            if A[y][x]:
                p=im.getpixel((x,y))
                edge=any(not(0<=x+dx<im.width and 0<=y+dy<im.height) or not A[y+dy][x+dx] for dx,dy in((1,0),(-1,0),(0,1),(0,-1)))
                if edge and max(p[:3])>60: 
                    for dx,dy in((1,0),(-1,0),(0,1),(0,-1)):
                        q=(x+dx,y+dy)
                        if 0<=q[0]<im.width and 0<=q[1]<im.height and not A[q[1]][q[0]]: out.putpixel(q,K)
    return out
small=outline(small)
# 6) đặt vào canvas 96, chân y=88
m=Image.new('RGBA',(96,96))
feet_s=round(FEET*s)
OX=(96-nw)//2+2; OY=88-feet_s
m.alpha_composite(small,(OX,OY))
# 7) vẽ lại mũi kiếm: kéo dài lưỡi theo hướng cũ thêm 3 px, kết thúc nhọn
cy=[(x,y) for y in range(96) for x in range(96) if (lambda p:p[3] and p[2]>200 and p[1]>200 and p[0]<120)(m.getpixel((x,y)))]
tip=max(cy,key=lambda q:q[1])
CY=(68,230,244,255); CW=(245,250,253,255)
for i in range(1,4):
    x,y=tip[0]-round(i*0.45),tip[1]+i
    m.putpixel((x,y),CW if i<3 else CY)
    if i<3: m.putpixel((x+1,y),CY)
    for q in ((x-1,y),(x+2 if i<3 else x+1,y),(x,y+1)):
        if not m.getpixel(q)[3]: m.putpixel(q,K)
m.save(D+'aerin_master_se.png')
b=Image.new('RGBA',(96,96),(58,63,68,255)); b.alpha_composite(m); b.resize((576,576),Image.NEAREST).save(D+'aerin_master_se_x6.png')
bb=m.getbbox(); print('bbox',bb,'scale',round(s,3),'offset',OX,OY,'tip',tip)
json.dump({'scale':s,'offset':[OX,OY],'feet_src':FEET,'squash_far_half':S,'cx':CX},open(D+'master/sua-se-params.json','w'))
# 8) chuẩn hoá bảng màu: gộp về 28 sắc (giữ 6 nhóm màu), alpha giữ nguyên
q=m.convert('RGB').quantize(28,method=Image.Quantize.MEDIANCUT).convert('RGB')
out=Image.new('RGBA',(96,96))
for y in range(96):
    for x in range(96):
        if m.getpixel((x,y))[3]: out.putpixel((x,y),q.getpixel((x,y))+(255,))
out.save(D+'aerin_master_se.png')
b=Image.new('RGBA',(96,96),(58,63,68,255)); b.alpha_composite(out); b.resize((576,576),Image.NEAREST).save(D+'aerin_master_se_x6.png')
