"""Ảnh soát xem-ban-nho.png: Zed + 3 bạn nhỏ cùng tỉ lệ game (phóng 4 lần điểm game). Hàng trên: ĐỨNG khung 1, 4 và khung 1 lật (nhìn trái);
hàng dưới: NGỒI khung 1, 4 và lật. Đỏ = đường đất, xanh = neo ngang (goc). python3 xem-ban-nho.py [ra.png]"""
import os, json, io, base64, sys
from PIL import Image, ImageDraw
DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
CU = os.path.join(DAY, 'game/art/custom')
def tai(ma):
    d = json.load(open(os.path.join(CU, ma + '.sprite.json'), encoding='utf-8'))
    return d, Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA')
S = 4; DAT = 50; CW = 40
zd, zi = tai('zed-moi')
def khung(d, im, hang, i, lat):
    n = d['net']; fw, fh = d['khung_rong'] * n, d['khung_cao'] * n
    k = im.crop((i * fw, hang * fh, (i + 1) * fw, (hang + 1) * fh)); k = k.resize((k.width * S // n, k.height * S // n), Image.NEAREST)
    gx = d['goc'][0]
    if lat: k = k.transpose(Image.FLIP_LEFT_RIGHT); gx = d['khung_rong'] - gx
    return k, gx, d['goc'][1]
cols = [('zed-moi', None)] + [('em-be-' + k, v) for k in ['hunter', 'healer', 'wrestler'] for v in [(0, False), (3, False), (0, True)]]
o = Image.new('RGB', (S * CW * len(cols) + 20, S * DAT * 2 + 20), (120, 104, 80)); dr = ImageDraw.Draw(o)
for R in range(2):
    x0 = 10
    for ma, v in cols:
        d, im = (zd, zi) if ma == 'zed-moi' else tai(ma)
        i, lat = v or (0, False)
        k, gx, gy0 = khung(d, im, 0 if ma == 'zed-moi' else R, i, lat)
        cx = x0 + CW * S // 2; gy = 10 + R * DAT * S + (DAT - 6) * S
        o.paste(k, (int(cx - gx * S), int(gy - gy0 * S)), k)
        dr.line([(x0, gy), (x0 + (CW - 2) * S, gy)], fill=(220, 40, 40)); dr.line([(cx, gy - 10), (cx, gy + 10)], fill=(40, 200, 255))
        # vạch cao Zed (31)
        dr.line([(x0, gy - 31 * S), (x0 + 12, gy - 31 * S)], fill=(255, 255, 0))
        nhan = ma.replace('em-be-', '') + ('' if ma == 'zed-moi' else (' ngoi' if R else ' dung') + ' k%d' % (i + 1) + (' lat' if lat else ''))
        dr.text((x0 + 2, 12 + R * DAT * S), nhan, fill=(255, 255, 255))
        x0 += CW * S
o.save(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '../xem-ban-nho.png'))
