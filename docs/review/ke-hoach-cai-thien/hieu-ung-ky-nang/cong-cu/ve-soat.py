"""Ảnh soát tĩnh (không chạy game): đọc đúng 9 tệp game/art/custom/hu-*.sprite.json vừa dựng, vẽ mỗi tệp một dải khung ở cỡ game ×3
(net 2 → chia 2 rồi ×3, điểm ảnh vuông), dấu + đỏ là điểm neo (goc), khung xám là ô khung. Ra: ../xem-hieu-ung.png, ../xem-hieu-ung.gif
(mỗi hiệu ứng phát lặp 8 khung/giây, cùng cỡ ×3).   python3 ve-soat.py"""
import os, json, io, base64
from PIL import Image, ImageDraw, ImageFont

DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
RA = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
MA = ['hu-cau-dat-lan', 'hu-vet-nhot', 'hu-vung-dien', 'hu-bua-tam-giac', 'hu-vo-oc', 'hu-manh-san-ho', 'hu-tuong-tinh-the', 'hu-vet-dau', 'hu-nam-con']
K = 3
NEN = (58, 54, 66, 255)
try:
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
except Exception:
    FONT = ImageFont.load_default()


def doc(ma):
    t = json.load(open(os.path.join(DAY, 'game/art/custom', ma + '.sprite.json'), encoding='utf-8'))
    im = Image.open(io.BytesIO(base64.b64decode(t['tam'].split(',', 1)[1]))).convert('RGBA')
    n, fw, fh = t.get('net', 1), t['khung_rong'], t['khung_cao']
    ks = [im.crop((i * fw * n, 0, (i + 1) * fw * n, fh * n)).resize((fw * K, fh * K), Image.NEAREST) for i in range(t['so'])]
    return t, ks


DS = [doc(m) for m in MA]
GAP = 10
W = max(sum(k.width + GAP for k in ks) for t, ks in DS) + 20
H = sum(ks[0].height + 40 for t, ks in DS) + 10
o = Image.new('RGBA', (max(W, 900), H), NEN); d = ImageDraw.Draw(o)
y = 6
for t, ks in DS:
    d.text((10, y), '%s · %s · %d khung · %d×%d điểm game · %.2f s%s%s' % (t['ma'], t['vung'], t['so'], t['khung_rong'], t['khung_cao'], t['giay'],
           ' · lặp' if t['lap'] else '', ' · xoay' if t['xoay'] else ''), fill=(240, 230, 200), font=FONT)
    y += 22; x = 10
    for i, k in enumerate(ks):
        d.rectangle([x - 1, y - 1, x + k.width, y + k.height], outline=(90, 86, 100))
        o.alpha_composite(k, (x, y))
        gx, gy = x + t['goc'][0] * K, y + t['goc'][1] * K
        d.line([gx - 4, gy, gx + 4, gy], fill=(255, 60, 60)); d.line([gx, gy - 4, gx, gy + 4], fill=(255, 60, 60))
        d.text((x + 2, y + 1), str(i + 1), fill=(200, 200, 210), font=FONT)
        x += k.width + GAP
    y += ks[0].height + 18
o.convert('RGB').save(os.path.join(RA, 'xem-hieu-ung.png'), optimize=True)

# GIF: lưới 3 × 3, mỗi ô một hiệu ứng phát lặp
CW = max(ks[0].width for t, ks in DS) + 12; CH = max(ks[0].height for t, ks in DS) + 28
hinh = []
for f in range(24):
    g = Image.new('RGBA', (CW * 3, CH * 3), NEN); dg = ImageDraw.Draw(g)
    for j, (t, ks) in enumerate(DS):
        cx, cy = (j % 3) * CW, (j // 3) * CH
        k = ks[f % len(ks)]
        g.alpha_composite(k, (cx + (CW - k.width) // 2, cy + 22 + (CH - 22 - k.height) // 2))
        dg.text((cx + 4, cy + 3), t['ma'], fill=(240, 230, 200), font=FONT)
    hinh.append(g.convert('P', palette=Image.ADAPTIVE, colors=255))
hinh[0].save(os.path.join(RA, 'xem-hieu-ung.gif'), save_all=True, append_images=hinh[1:], duration=125, loop=0, optimize=True)
print('xong', o.size, (CW * 3, CH * 3))
