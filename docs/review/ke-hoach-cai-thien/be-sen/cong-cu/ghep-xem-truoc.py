"""Ghép ảnh soát xem-truoc.png từ các ảnh chup.py: toàn cảnh làng (bến đò bên phải), bến phóng to, 4 câu thoại (2 VI, 2 EN)."""
import sys, os
from PIL import Image, ImageDraw
V = sys.argv[1]; RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../xem-truoc.png')
from PIL import ImageFont
import glob
_f = (glob.glob('/usr/share/fonts/**/DejaVuSans.ttf', recursive=True) + glob.glob('/usr/share/fonts/**/NotoSans-Regular.ttf', recursive=True))
FONT = ImageFont.truetype(_f[0], 13) if _f else None
mo = lambda n: Image.open(os.path.join(V, n)).convert('RGB')
ca = [('ben-vi-0.png', 'VI · câu 1'), ('ben-vi-3.png', 'VI · câu 4 (móc vùng 4)'), ('ben-en-2.png', 'EN · câu 3'), ('ben-en-3.png', 'EN · câu 4')]
toan = mo('ben-trong.png')                                    # 960 x 540
zoom = toan.crop((700, 200, 940, 380)).resize((480, 360), Image.NEAREST)
cr = [mo(n).crop((620, 180, 960, 420)) for n, _ in ca]          # 340 x 240
W = 960 + 16 + 480; H = 540 + 16 + 2 * 240 + 16 + 40
o = Image.new('RGB', (max(W, 4 * 340 + 3 * 8), H), (24, 22, 30)); d = ImageDraw.Draw(o)
o.paste(toan, (0, 20)); d.text((4, 4), 'Làng: Bé Sen ngồi ở bến đò cạnh Chú Lái Đò (khung nhìn game, chưa chạm)', fill=(255, 230, 160), font=FONT)
o.paste(zoom, (976, 20)); d.text((980, 4), 'Bến đò phóng to', fill=(255, 230, 160), font=FONT)
y = 20 + 540 + 16
for i, (im, (_, t)) in enumerate(zip(cr, ca)):
    x = i * 348; o.paste(im, (x, y + 16)); d.text((x + 4, y), t, fill=(255, 230, 160), font=FONT)
o = o.crop((0, 0, o.width, y + 16 + 240 + 4))
o.save(RA, optimize=True); print(RA, o.size, os.path.getsize(RA))
