"""Lấy ảnh mẫu (để gửi kèm khi gen ảnh sự kiện) từ game/art/custom/*.sprite.json — chỉ ĐỌC, không sửa game/.
Chạy: python3 docs/review/ke-hoach-cai-thien/su-kien-ai/cong-cu/lay-anh-mau.py
Ra: su-kien-ai/mau/<mã>.png (NPC lấy khung đầu của hàng idle, phóng x4 nét gốc) + mau/bang-mau.png (ghép tất cả, có nhãn)."""
import json, base64, io, os
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', '..'))
OUT = os.path.join(HERE, '..', 'mau')
os.makedirs(OUT, exist_ok=True)
MAU = ['nl-tu', 'nl-xen', 'nl-do', 'nl-lai', 'nl-mo', 'gd-vat-thuong-nhan', 'gd-vat-ban-tho', 'gd-vat-ruong', 'gd-vat-ruong-mo',
       'gd-vat-be-thu-thach', 'gd-vat-suoi-mau', 'gd-lang-gieng', 'gd-lang-chum', 'gd-lang-cay-da', 'gd-lang-den-long', 'gd-vat-chau-than', 'gd-bua-fire']
tiles = []
for ma in MAU:
    d = json.load(open(os.path.join(ROOT, 'game', 'art', 'custom', ma + '.sprite.json')))
    src = d.get('tam') or d.get('anh')
    im = Image.open(io.BytesIO(base64.b64decode(src.split(',', 1)[1]))).convert('RGBA')
    if d.get('khung_rong'):  # tấm nhiều khung: lấy khung 0 hàng 0
        n = d.get('net', 1); im = im.crop((0, 0, d['khung_rong'] * n, d['khung_cao'] * n))
    bb = im.getbbox()
    if bb: im = im.crop(bb)
    big = im.resize((im.width * 2, im.height * 2), Image.NEAREST)
    big.save(os.path.join(OUT, ma + '.png'))
    tiles.append((ma, d.get('ten', ma), big))
cw = max(t[2].width for t in tiles) + 16; ch = max(t[2].height for t in tiles) + 30; cols = 5
rows = (len(tiles) + cols - 1) // cols
sheet = Image.new('RGBA', (cw * cols, ch * rows), (0, 255, 0, 255))
dr = ImageDraw.Draw(sheet)
for k, (ma, ten, im) in enumerate(tiles):
    x, y = (k % cols) * cw, (k // cols) * ch
    sheet.alpha_composite(im, (x + (cw - im.width) // 2, y + ch - 26 - im.height))
    dr.rectangle([x, y + ch - 22, x + cw, y + ch], fill=(20, 24, 46, 255))
    dr.text((x + 4, y + ch - 18), ma, fill=(255, 255, 255, 255))
sheet.convert('RGB').save(os.path.join(OUT, 'bang-mau.png'))
print('ok', len(tiles), sheet.size)
