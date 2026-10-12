"""GIF trước | sau, phóng ×4 điểm ảnh game: đứng → đi → chạy → dừng → chém 3 nhát → đứng (từ dải khung do_mat.py).
Chạy: python3 gif_truoc_sau.py <thư mục dải trước> <thư mục dải sau> <thư mục ra>"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)
A, B, OUT = sys.argv[1:4]
for k, ten in [('smith', 'Cu Tí'), ('hunter', 'Cu Tèo'), ('wrestler', 'Cu Lì'), ('healer', 'Cái Bống')]:
    n = json.load(open(os.path.join(B, k + '.nhan.json')))
    het = n.index('đứng→chạy'); bd = 6  # bỏ bớt đứng đầu
    da, db = Image.open(os.path.join(A, k + '.dai.png')), Image.open(os.path.join(B, k + '.dai.png'))
    fr = []
    for j in range(bd, het):
        im = Image.new('RGB', (512 + 8, 256 + 18), (30, 36, 44))
        for x, d in ((0, da), (264, db)): im.paste(d.crop((j * 128, 0, j * 128 + 128, 128)).resize((256, 256), Image.NEAREST), (x, 18))
        dr = ImageDraw.Draw(im); dr.text((4, 3), 'TRƯỚC (?kiemsau=0)  ' + ten, fill=(255, 190, 170), font=F); dr.text((268, 3), 'SAU  ' + n[j], fill=(190, 255, 190), font=F)
        fr.append(im)
    fr[0].save(os.path.join(OUT, 'truoc-sau-' + k + '.gif'), save_all=True, append_images=fr[1:], duration=33, loop=0, optimize=True)
    print(k, len(fr), os.path.getsize(os.path.join(OUT, 'truoc-sau-' + k + '.gif')) // 1024, 'KB')
