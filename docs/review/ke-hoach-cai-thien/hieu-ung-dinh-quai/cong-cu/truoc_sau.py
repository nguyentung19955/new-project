"""Ảnh TRƯỚC (?dinhquai=0) / SAU (mặc định) cho các ca tiêu biểu → ../anh/truoc-sau.png (mỗi hàng: trước | sau)."""
import sys, os, io, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dq_common import *
from PIL import Image, ImageDraw, ImageFont
FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
CA = [('Mộc Tinh · kiếm nhát 1 (chớp trúng)', 'trung', 'moc', 'kiem'), ('Thuồng Luồng · phi tiêu (chớp trúng)', 'trung', 'thuong', 'phitieu'),
      ('Heo Rừng Con · Hỏa chưởng (nổ)', 'trung', 'heoCon', 'chuong_hoa'), ('Ong Vò Vẽ · số sát thương', 'so', 'ongVo', None),
      ('Mộc Tinh · số sát thương', 'so', 'moc', None), ('Mộc Tinh · cháy', 'tt', 'moc', 'chay'), ('Cua Đá (trùm nhỏ) · choáng', 'tt', 'cuaDa', 'choang'),
      ('Ong Vò Vẽ · choáng', 'tt', 'ongVo', 'choang'), ('Heo Rừng Con · cháy khi bị hất tung', 'hat', 'heoCon', 'chay'), ('Lính Ma · độc khi bị hất tung', 'hat', 'linhMa', 'doc')]


def img(u): return Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGB') if u else None


def chay(extra):
    out = []
    with sync_playwright() as pw:
        b, pg, errs = open_game(pw, extra)
        pg.evaluate("DQ.CHUP = (api) => api === 'hit' || api === 'chBoom' || api === 'chHit'")
        for ten, k, i, t in CA:
            q = "DQ.roster().find(x => x.id === '%s')" % i
            if k == 'trung': u = pg.evaluate("([t]) => { const r = DQ.danh(%s, t, -1); const a = r ? r.list.flatMap(x => x.anh || []) : []; return a[0] || null; }" % q, [t])
            elif k == 'so': u = pg.evaluate("() => DQ.anhSo(%s)" % q)
            else: u = pg.evaluate("([t, h]) => DQ.anhTT(%s, t, -1, h)" % q, [t, k == 'hat'])
            out.append(img(u))
        print(extra or 'mặc định', 'lỗi JS', len(errs), flush=True)
        b.close()
    return out


A = chay('&dinhquai=0'); B = chay('')
W = max(max(x.width for x in A if x), max(x.width for x in B if x)); rows = []
for (ten, *_), a, b in zip(CA, A, B):
    h = max(a.height if a else 0, b.height if b else 0) + 22
    r = Image.new('RGB', (2 * W + 18, h), (18, 18, 22)); d = ImageDraw.Draw(r)
    d.text((6, 3), ten + '   —   TRƯỚC (trái) | SAU (phải)', fill=(255, 230, 120), font=FONT)
    if a: r.paste(a, (6, 20))
    if b: r.paste(b, (W + 12, 20))
    rows.append(r)
o = Image.new('RGB', (2 * W + 18, sum(r.height for r in rows)), (18, 18, 22)); y = 0
for r in rows: o.paste(r, (0, y)); y += r.height
os.makedirs(os.path.join(OUT, 'anh'), exist_ok=True)
o.save(os.path.join(OUT, 'anh', 'truoc-sau.png'), optimize=True)
print('ghi anh/truoc-sau.png', o.size)
