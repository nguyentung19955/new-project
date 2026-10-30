# AERIN master: lật SOUTH attempt 1 (kiếm sang tay trái giải phẫu) + vẽ lại tóc thành đúng 3 chỏm lớn
from PIL import Image, ImageDraw
import os
D=os.path.dirname(os.path.abspath(__file__))+'/'
src=Image.open(D+'attempt1/pixellab_original_south_64.png').convert('RGBA')
m=src.transpose(Image.FLIP_LEFT_RIGHT)
K=(0,0,0,255); H1=(0x1c,0x15,0x39,255); H2=(0x2a,0x29,0x4f,255); H3=(0x38,0x3c,0x60,255); H4=(0x46,0x4e,0x73,255); H5=(0x73,0x83,0xa6,255)
CUT=11   # giữ nguyên tóc từ hàng này trở xuống (mái + khung mặt)
for y in range(0,CUT):
    for x in range(64): m.putpixel((x,y),(0,0,0,0))
# 3 chỏm: (đáy trái, đáy phải, đỉnh)
spikes=[((15,CUT+2),(32,CUT),(7,1)), ((23,CUT),(42,CUT),(29,0)), ((34,CUT),(52,CUT+3),(58,3))]
BAND=[(17,CUT+2),(17,CUT-3),(50,CUT-3),(51,CUT+3)]
lay=Image.new('RGBA',(64,64)); d=ImageDraw.Draw(lay)
for a,b,t in spikes: d.polygon([a,t,b],fill=H3)
d.polygon(BAND,fill=H3)
# đổ bóng: nửa trái mỗi chỏm tối, sống chỏm sáng
for a,b,t in spikes:
    for y in range(0,CUT+3):
        xs=[x for x in range(64) if lay.getpixel((x,y))[3] and abs(x-((a[0]+b[0])/2*(1-(CUT-y)/CUT)+t[0]*(CUT-y)/CUT))<20]
for y in range(64):
    for x in range(64):
        p=lay.getpixel((x,y))
        if not p[3]: continue
        # tối dần theo bên trái, sáng ở mép phải trên
        l=lay.getpixel((x-1,y))[3] if x>0 else 0; r=lay.getpixel((x+1,y))[3] if x<63 else 0
        c=H3
        if not l: c=H2
        elif not r: c=H4
        if y<4 and r and l: c=H4 if (x+y)%3 else H5
        lay.putpixel((x,y),c)
# nếp tóc: đường tối giữa chỏm + vệt sáng song song
def ln(p,q):
    x0,y0=p;x1,y1=q;n=max(abs(x1-x0),abs(y1-y0)) or 1
    return [(round(x0+(x1-x0)*i/n),round(y0+(y1-y0)*i/n)) for i in range(n+1)]
for a,b,t in spikes:
    mid=((a[0]+b[0])//2,CUT+1)
    for i,(x,y) in enumerate(ln(mid,t)[:-2]):
        if lay.getpixel((x,y))[3]: lay.putpixel((x,y),H1)
        if 0<=x+1<64 and lay.getpixel((x+1,y))[3] and i%2==0: lay.putpixel((x+1,y),H2)
    hl=((mid[0]+b[0])//2,CUT); 
    for i,(x,y) in enumerate(ln(hl,((t[0]+b[0])//2,(t[1]+b[1])//2))):
        if lay.getpixel((x,y))[3]: lay.putpixel((x,y),H4 if i%3 else H5)
# nối: chỉ đè lên chỗ trống của m
for y in range(64):
    for x in range(64):
        if lay.getpixel((x,y))[3] and (y<CUT+3 and (not m.getpixel((x,y))[3] or y<CUT)): m.putpixel((x,y),lay.getpixel((x,y)))
# viền đen ngoài toàn tóc
A=[[m.getpixel((x,y))[3]>0 for x in range(64)] for y in range(64)]
for y in range(0,CUT+4):
    for x in range(64):
        if not A[y][x] and any(0<=x+dx<64 and 0<=y+dy<64 and A[y+dy][x+dx] for dx,dy in((1,0),(-1,0),(0,1),(0,-1))):
            m.putpixel((x,y),K)
m.save(D+'master/aerin_reference_south_64.png')
b=Image.new('RGBA',(64,64),(60,60,70,255)); b.alpha_composite(m); b.resize((512,512),Image.NEAREST).save('/tmp/claude-0/ref8.png')
