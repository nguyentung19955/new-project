# AERIN SE master v4 "sạch": KHÔNG co giãn/ép/đổi màu (các bước đó làm vỡ nét). Chỉ chép nguyên pixel PixelLab:
#  - đuôi khăn: cắt khối pixel nguyên vẹn, lật ngang, đặt ra sau vai (không resample)
#  - mũi kiếm: thêm 2 px đầu nhọn bằng đúng màu lưỡi có sẵn
#  - đặt vào canvas 96x96, chân y=88
import os,sys
from PIL import Image
D=os.path.dirname(os.path.abspath(__file__))+'/'
src=Image.open(D+'helmet/pixellab_original_se_64.png').convert('RGBA')
W=64
scarf=Image.new('RGBA',(W,W))
for y in range(17,32):
    for x in range(46,W):
        p=src.getpixel((x,y))
        if p[3]: scarf.putpixel((x,y),p); src.putpixel((x,y),(0,0,0,0))
sb=scarf.getbbox(); t=scarf.crop(sb).transpose(Image.FLIP_LEFT_RIGHT)
px,py=17-t.width+3,21
for y in range(t.height):
    for x in range(t.width):
        p=t.getpixel((x,y))
        if p[3] and 0<=px+x<W and not src.getpixel((px+x,py+y))[3]: src.putpixel((px+x,py+y),p)
FEET=61; OX=16; OY=88-FEET
m=Image.new('RGBA',(96,96)); m.alpha_composite(src,(OX,OY))
# mũi kiếm vẽ tay (ảnh gốc bị cắt ở hàng y=63 của khung 64): nối tiếp đường chéo lưỡi, dùng đúng màu lưỡi PixelLab
E=(0x4c,0x88,0xb5,255); Wt=(0xf5,0xfa,0xfd,255); C=(0x52,0xd0,0xf2,255); L=(0xb2,0xf3,0xf8,255)
for y in range(90,96):
    for x in range(36,60): m.putpixel((x,y),(0,0,0,0))
TIP={90:[(45,E),(46,Wt),(47,Wt),(48,C),(49,C),(50,C),(51,L),(52,E)],
     91:[(44,E),(45,Wt),(46,Wt),(47,C),(48,C),(49,L),(50,E)],
     92:[(44,E),(45,Wt),(46,C),(47,L),(48,E)],
     93:[(44,E),(45,L),(46,E)],
     94:[(44,E)]}
for y,row in TIP.items():
    for x,c in row: m.putpixel((x,y),c)
m.save(D+'aerin_master_se.png')
b=Image.new('RGBA',(96,96),(58,63,68,255)); b.alpha_composite(m); b.resize((576,576),Image.NEAREST).save(D+'aerin_master_se_x6.png')
print(m.getbbox())
