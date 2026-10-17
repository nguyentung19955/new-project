"""Ảnh soát tĩnh: lưới khung 3 tệp sprite (×2 = nét 2, vạch đỏ = mặt nước / điểm neo dọc, vạch vàng = điểm neo ngang) + ghép ảnh trận trước / sau.
Chạy sau kiem_tl.py:  python3 lam_anh.py"""
import os, json, base64, io
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '../../../../..'))
D = os.path.join(os.path.dirname(HERE), 'anh') + '/'
try: F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
except Exception: F = None
TEN = {'idle': 'đứng', 'move': 'đi', 'tele': 'báo đòn', 'atk': 'đánh', 'hit': 'trúng đòn', 'die': 'lặn'}
for m in ['thuongLuong', 'thuongLuong-p2', 'thuongLuong-p3']:
    t = json.load(open(os.path.join(REPO, 'game/art/custom/%s.sprite.json' % m)))
    im = Image.open(io.BytesIO(base64.b64decode(t['tam'].split(',')[1]))).convert('RGBA')
    FW, FH, N = t['khung_rong'], t['khung_cao'], t['net']; gx, gy = t['goc']; cw, ch = FW * N, FH * N; L = 150
    o = Image.new('RGBA', (L + im.width, im.height), (52, 64, 66, 255)); o.alpha_composite(im, (L, 0)); d = ImageDraw.Draw(o)
    seen = {}
    for k, v in t['dong_tac'].items(): seen.setdefault(v['hang'], []).append('%s (%d)' % (TEN[k], v['so']))
    for h, names in seen.items():
        d.text((6, h * ch + 8), '\n'.join(names), fill=(255, 240, 200), font=F)
        d.line([(L, h * ch + gy * N), (o.width, h * ch + gy * N)], fill=(255, 60, 60))
        for c in range(im.width // cw + 1): d.line([(L + c * cw, h * ch), (L + c * cw, (h + 1) * ch)], fill=(90, 110, 110))
        for c in range(im.width // cw): d.line([(L + c * cw + gx * N, h * ch), (L + c * cw + gx * N, (h + 1) * ch)], fill=(255, 210, 60))
    o.save(D + 'luoi-khung-%s.png' % m)
ims = [Image.open(D + 'tran-%s-pha%d.png' % (a, p)).convert('RGB') for p in (1, 2, 3) for a in ('truoc', 'sau')]
W, H = ims[0].size; o = Image.new('RGB', (W * 2 + 10, H * 3 + 20), (20, 20, 20))
for i, im in enumerate(ims): o.paste(im, ((i % 2) * (W + 10), (i // 2) * (H + 10)))
o.save(D + 'tran-truoc-sau-3-pha.png')
