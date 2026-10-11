# Vẽ docs/vfx/bang-mau-loi.png: 44 ô màu (32 lõi theo nhóm + 12 màu hệ) có mã hex, đọc thẳng từ docs/review/ra-soat-my-thuat/bang-mau.json.
# Chạy: python3 ve_bang_mau.py <thư mục repo>
import json, sys
from PIL import Image, ImageDraw, ImageFont
REPO = sys.argv[1]; J = json.load(open(REPO + '/docs/review/ra-soat-my-thuat/bang-mau.json', encoding='utf-8'))
F = lambda s, b=False: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans' + ('-Bold' if b else '') + '.ttf', s)
NHOM = [('da', 'Da'), ('toc', 'Tóc'), ('go', 'Gỗ'), ('da_stone', 'Đá'), ('kim_loai', 'Kim loại'), ('vai', 'Vải'), ('co_cay', 'Cỏ cây'), ('nuoc', 'Nước'), ('lua', 'Lửa môi trường'), ('bong', 'Bóng và viền')]
HE = [('lua', 'Hệ Lửa'), ('doc', 'Hệ Độc'), ('bang', 'Hệ Băng')]; NAC = {'nhat': 'nhạt', 'chinh': 'chính', 'dam': 'đậm (quái)', 'loi_sang': 'lõi sáng (người chơi)'}
OW, OH, LE, COT = 184, 70, 20, 5
hang = [(ten, [(c['hex'], c['ten']) for c in J['core'] if c['nhom'] == k]) for k, ten in NHOM]
hang_he = [(ten, [(c['hex'], NAC[c['nac']]) for c in J['he'][k]]) for k, ten in HE]
assert sum(len(h[1]) for h in hang) == 32 and sum(len(h[1]) for h in hang_he) == 12
W = LE * 2 + COT * OW; cao_hang = OH + 46 + 30
H = 70 + (len(hang) + len(hang_he)) * cao_hang + 60 + 20
im = Image.new('RGB', (W, H), (26, 22, 30)); d = ImageDraw.Draw(im)
d.text((LE, 18), 'LINH KHÍ · Bảng màu lõi: 32 màu nền tảng + 12 màu hệ', font=F(26, True), fill=(246, 220, 146))
def sang(hx): r, g, b = (int(hx[i:i + 2], 16) for i in (1, 3, 5)); return 0.299 * r + 0.587 * g + 0.114 * b
y = 70; so = 0
for i, (ten, ds) in enumerate(hang + hang_he):
    if i == len(hang): d.text((LE, y + 14), '12 màu hệ (mỗi hệ 4 nấc)', font=F(22, True), fill=(246, 220, 146)); y += 60
    d.text((LE, y), ten, font=F(19, True), fill=(230, 226, 214))
    for j, (hx, t) in enumerate(ds):
        so += 1; x = LE + j * OW
        d.rectangle([x, y + 28, x + OW - 10, y + 28 + OH], fill=hx, outline=(90, 86, 100))
        d.text((x + 8, y + 28 + OH - 26), hx, font=F(17, True), fill=(20, 24, 46) if sang(hx) > 120 else (240, 240, 232))
        d.text((x + 8, y + 34), str(so), font=F(13), fill=(20, 24, 46) if sang(hx) > 120 else (200, 200, 196))
        d.text((x, y + 28 + OH + 4), t if len(t) <= 21 else t[:20] + '…', font=F(14), fill=(190, 186, 176))
    y += cao_hang
d.text((LE, y), 'Viền ngoài mọi hình: #14182e · Lõi hiệu ứng của người chơi: #fbfed0 · Hiệu ứng của quái: nấc đậm', font=F(15), fill=(190, 186, 176))
im.save(REPO + '/docs/vfx/bang-mau-loi.png'); print('xong', im.size, so)
