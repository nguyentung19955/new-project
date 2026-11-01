# Luồng H – tạo hình đạn phân biệt: ken_tron.png (Kèn Câm), cau_tim.png (Khuyết Cẩu), vai_nhat.png (Hồn Vải)
# Chạy: python3 tools/vung-1/tao-fx-dan-h.py art/hieu-ung/chieu-quai
import sys, math
from PIL import Image
D = sys.argv[1]
def hx(s): s=s.lstrip('#'); return tuple(int(s[i:i+2],16) for i in (0,2,4))
def lum(p): return (0.299*p[0]+0.587*p[1]+0.114*p[2])/255
def doiMau(src, dst, bang, nhanA=1.0):
    im = Image.open(f'{D}/{src}.png').convert('RGBA'); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a = px[x,y]
            if a == 0: continue
            L = lum((r,g,b)); c = bang[-1][1]
            for nguong, m in bang:
                if L < nguong: c = m; break
            px[x,y] = (*hx(c), int(a*nhanA))
    im.save(f'{D}/{dst}.png')
# Khuyết Cẩu: cầu năng lượng tím than / đỏ gạch
doiMau('cau', 'cau_tim', [(0.22,'#24112C'),(0.38,'#4A1E4A'),(0.52,'#6E2C5C'),(0.66,'#8E3A4E'),(0.78,'#B84C43'),(0.9,'#D9705C'),(1.01,'#F4C2A8')])
# Hồn Vải: vòng sóng âm nhạt (kem xám – tím nhạt), trong mờ
doiMau('vai', 'vai_nhat', [(0.35,'#8C7E96'),(0.6,'#B7A9BE'),(0.8,'#D8CCCF'),(1.01,'#EFE6D6')], 0.8)
# Kèn Câm: giữ ô loé nòng (0,1) + nổ (4,5) của ken.png, ô 2,3 = đạn tròn đồng có vệt đuôi ngắn
ken = Image.open(f'{D}/ken.png').convert('RGBA'); S = 96
out = Image.new('RGBA', (S*6, S), (0,0,0,0))
for o in (0,1,4,5): out.paste(ken.crop((o*S,0,o*S+S,S)), (o*S,0))
VIEN, THAN, SANG, LOA = hx('#4A2410'), hx('#B8692A'), hx('#F0B85E'), hx('#FFE9B8')
DUOI = [hx('#F0B85E'), hx('#E5A13B'), hx('#B8692A')]
for o, dai in ((2, 16), (3, 12)):
    cx, cy, R = o*S + 44, 48, 7.5
    # vệt đuôi ngắn (phía sau = bên PHẢI vì hình hướng TRÁI)
    for i in range(dai):
        x = int(cx + R + i); a = int(220 * (1 - i/dai)); c = DUOI[min(2, i*3//dai)]
        h = max(1, int(4 * (1 - i/dai)))
        for dy in range(-h, h+1):
            if out.getpixel((x, cy+dy))[3] < a: out.putpixel((x, cy+dy), (*c, a))
    for y in range(-9, 10):
        for x in range(-9, 10):
            d = math.hypot(x+0.5-0.5, y)
            if d <= R + 1.2:
                if d > R - 0.3: c = VIEN
                else:
                    # sáng phía trước-trên (trái-trên)
                    s = (-(x) * 0.6 - y * 0.8) / R
                    c = LOA if s > 0.55 and d < R*0.5 else SANG if s > 0.35 else THAN
                out.putpixel((cx+x, cy+y), (*c, 255))
out.save(f'{D}/ken_tron.png')
print('xong')
