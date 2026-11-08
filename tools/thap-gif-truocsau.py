#!/usr/bin/env python3
# Ghép 2 thư mục khung (trước | sau) thành 1 GIF nhỏ + 1 bảng khung JPG. Dùng: thap-gif-truocsau.py <dir_cu> <dir_moi> <ra_khong_duoi> <fps>
import sys, os, json
from PIL import Image, ImageDraw

cu, moi, ra, fps = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
nhan = json.load(open(os.path.join(moi, 'nhan.json')))
fs = sorted(f for f in os.listdir(moi) if f.endswith('.png'))
O = 150
khung = []
for i, f in enumerate(fs):
    im = Image.new('RGB', (O * 2 + 4, O + 18), (16, 16, 20))
    im.paste(Image.open(os.path.join(cu, f)).convert('RGB'), (0, 18))
    im.paste(Image.open(os.path.join(moi, f)).convert('RGB'), (O + 4, 18))
    d = ImageDraw.Draw(im)
    d.text((4, 3), 'BEFORE (strip)', fill=(255, 200, 120))
    d.text((O + 8, 3), 'AFTER (code)', fill=(140, 255, 160))
    d.text((O * 2 - 90, 3), nhan[i], fill=(230, 230, 230))
    khung.append(im)
pal = [k.quantize(colors=64, method=Image.MEDIANCUT, dither=Image.Dither.NONE) for k in khung]
pal[0].save(ra + '_truoc-sau.gif', save_all=True, append_images=pal[1:], duration=int(1000 / fps), loop=0, optimize=True)
# bảng khung: mỗi đoạn lấy 6 khung đều nhau, 2 hàng (trước/sau)
doan = []
for i, n in enumerate(nhan):
    if not doan or doan[-1][0] != n: doan.append([n, []])
    doan[-1][1].append(i)
S = 120
rows = []
for n, ids in doan:
    pick = [ids[int(j * (len(ids) - 1) / 5)] for j in range(6)]
    r = Image.new('RGB', (6 * S, 2 * S + 14), (16, 16, 20))
    ImageDraw.Draw(r).text((4, 1), n + '  (top: before / bottom: after)', fill=(230, 230, 230))
    for j, k in enumerate(pick):
        r.paste(Image.open(os.path.join(cu, fs[k])).convert('RGB').resize((S, S)), (j * S, 14))
        r.paste(Image.open(os.path.join(moi, fs[k])).convert('RGB').resize((S, S)), (j * S, 14 + S))
    rows.append(r)
sh = Image.new('RGB', (6 * S, sum(r.size[1] for r in rows)))
y = 0
for r in rows: sh.paste(r, (0, y)); y += r.size[1]
sh.save(ra + '_tomtat.jpg', quality=78)
print(ra, len(khung), 'khung', os.path.getsize(ra + '_truoc-sau.gif') // 1024, 'KB')
