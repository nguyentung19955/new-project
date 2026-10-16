"""Ảnh cạnh nhau TRƯỚC | SAU (×4 điểm ảnh game) + bảng chỉ số nét, từ hai lần chạy do_tran.py.
python3 so_sanh.py <thư mục trước> <thư mục sau> <thư mục ảnh ra> <tên,tên,…>
Mỗi tên: <ra>/<tên>.png = hàng 1: canvas thế giới ×4 (trước | sau | heoCon chuẩn), hàng 2: màn 844×390 (dpr 3), hàng 3: màn 1280×720."""
import json, os, sys
from PIL import Image, ImageDraw

T, S, RA = sys.argv[1], sys.argv[2], sys.argv[3]
TEN = sys.argv[4].split(',')
os.makedirs(RA, exist_ok=True)
NEN = (64, 92, 70, 255)


def mo(p):
    return Image.open(p).convert('RGBA') if os.path.exists(p) else Image.new('RGBA', (10, 10), (0, 0, 0, 0))


def hang(ims, nhan):
    W = sum(i.width for i in ims) + 24 * (len(ims) + 1); H = max(i.height for i in ims) + 22
    o = Image.new('RGBA', (W, H), NEN); x = 24; d = ImageDraw.Draw(o)
    for im, n in zip(ims, nhan):
        o.alpha_composite(im, (x, 20)); d.text((x, 4), n, fill=(255, 235, 160, 255)); x += im.width + 24
    return o


for ten in TEN:
    rows = []
    for th, nh, z in (('the-x4', '×4 (canvas)', 1), ('m844', 'màn 844×390', 1), ('m1280', 'màn 1280×720 ×2', 2)):
        a, b = mo(os.path.join(T, th, ten + '.png')), mo(os.path.join(S, th, ten + '.png'))
        c = mo(os.path.join(S, th, 'quai-heoCon.png'))
        if z != 1:
            a, b, c = [i.resize((i.width * z, i.height * z), Image.NEAREST) for i in (a, b, c)]
        ims, nn = [a, b], ['TRƯỚC ' + nh, 'SAU ' + nh]
        if ten != 'quai-heoCon':
            ims.append(c); nn.append('heoCon (chuẩn nét)')
        rows.append(hang(ims, nn))
    W = max(r.width for r in rows); H = sum(r.height for r in rows)
    o = Image.new('RGBA', (W, H), NEN); y = 0
    for r in rows:
        o.alpha_composite(r, (0, y)); y += r.height
    o.convert('RGB').save(os.path.join(RA, ten + '.png'), optimize=True)

# bảng
t, s = json.load(open(os.path.join(T, 'so-lieu.json')))['hinh'], json.load(open(os.path.join(S, 'so-lieu.json')))['hinh']
h0 = s.get('quai-heoCon', {}).get('the', {}).get('NHOE')
print('| Hình | NHOE trước | NHOE sau | viền lửng % trước → sau | lặp cột % trước → sau | 1280×720 trước → sau | so heoCon (%.1f) |' % (h0 or 0))
print('|---|---|---|---|---|---|---|')
for k in sorted(t, key=lambda k: -(t[k]['the'] or {}).get('NHOE', 0)):
    a, b = t[k].get('the') or {}, (s.get(k) or {}).get('the') or {}
    if not a or not b:
        continue
    m1, m2 = (t[k].get('m1280') or {}).get('NHOE', 0), ((s.get(k) or {}).get('m1280') or {}).get('NHOE', 0)
    print('| %s | %.1f | **%.1f** | %.1f → %.1f | %.1f → %.1f | %.1f → %.1f | %s |' % (k, a['NHOE'], b['NHOE'], a['mo_vien'], b['mo_vien'], a['lap_cot'], b['lap_cot'], m1, m2,
          'nét bằng / hơn' if h0 and b['NHOE'] <= h0 + 1 else '+%.1f' % (b['NHOE'] - h0) if h0 else ''))
