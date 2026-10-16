"""Ghép GIF TRƯỚC | SAU từ hai lần chạy quay.py (cùng kịch bản, cùng số nhịp).
  python3 so_sanh.py <thư mục trước> <thư mục sau> <thư mục ra>
Ra: so-sanh-<ten>.gif   cỡ thật (canvas thế giới, 2 điểm ảnh / điểm ảnh game), trái = trước (?muot2=0&cotiTo=0), phải = sau
    dien-thoai-<ten>.gif cỡ màn điện thoại ngang (480×270 game → 844×475): cắt 240×135 game quanh Cu Tí, trái trước / phải sau"""
import json, os, sys
from PIL import Image, ImageDraw, ImageSequence

A, B, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
CHINH = ['dung', 'di', 'chay', 'lon', 'trung-don', 'chet', 'chuong', 'kiem-1-3', 'thuong', 'thuong-giu', 'bua', 'bua-giu', 'phi-tieu',
         'phi-tieu-ngam', 'chay-chem', 'chay-nguoc-chem', 'db-kiem', 'db-thuong', 'db-bua', 'db-phitieu', 'doi-vk', 'chuyen']
DT = ['dung', 'chay', 'kiem-1-3', 'lon', 'chay-chem', 'bua']
os.makedirs(OUT, exist_ok=True)


def khung(p):
    return [f.convert('RGB') for f in ImageSequence.Iterator(Image.open(p))]


def nhan(im, chu):
    ImageDraw.Draw(im).text((4, 2), chu, fill=(255, 235, 150))
    return im


for ten in CHINH:
    fa, fb = khung(os.path.join(A, ten + '.gif')), khung(os.path.join(B, ten + '.gif'))
    n = min(len(fa), len(fb))
    w, h = fa[0].size
    ra = []
    for i in range(n):
        o = Image.new('RGB', (w * 2 + 4, h), (20, 20, 24))
        o.paste(fa[i], (0, 0)); o.paste(fb[i], (w + 4, 0))
        nhan(o, 'TRUOC'); ImageDraw.Draw(o).text((w + 8, 2), 'SAU', fill=(255, 235, 150))
        ra.append(o.quantize(128, dither=Image.Dither.NONE))
    ra[0].save(os.path.join(OUT, 'so-sanh-' + ten + '.gif'), save_all=True, append_images=ra[1:], duration=33, loop=0)
    if ten in DT and os.path.exists(os.path.join(A, 'dien-thoai-' + ten + '.gif')):
        sa, sb = json.load(open(os.path.join(A, 'so-lieu.json')))[ten], json.load(open(os.path.join(B, 'so-lieu.json')))[ten]
        da, db = khung(os.path.join(A, 'dien-thoai-' + ten + '.gif')), khung(os.path.join(B, 'dien-thoai-' + ten + '.gif'))
        k = 844 / 480
        ra = []
        for i in range(0, min(len(da), len(db)), 2):  # 15 khung/giây cho nhẹ tệp
            o = Image.new('RGB', (844, 238 + 2), (20, 20, 24))
            for j, (fr, sl) in enumerate(((da[i], sa), (db[i], sb))):
                r = sl[min(len(sl) - 1, i * 2)]
                cx, cy = r['sx'] * k, (r['sy'] - 20) * k
                x0 = int(max(0, min(844 - 422, cx - 211))); y0 = int(max(0, min(475 - 238, cy - 119)))
                o.paste(fr.crop((x0, y0, x0 + 422, y0 + 238)), (j * 422, 0))
            nhan(o, 'TRUOC'); ImageDraw.Draw(o).text((426, 2), 'SAU', fill=(255, 235, 150))
            ra.append(o.quantize(160, dither=Image.Dither.NONE))
        ra[0].save(os.path.join(OUT, "dien-thoai-" + ten + ".gif"), save_all=True, append_images=ra[1:], duration=66, loop=0)
    print(ten, n)
