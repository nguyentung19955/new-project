"""Ảnh so trước / sau (ghép cạnh nhau, phóng ×3, không làm mờ) cho các tấm đã nén có đổi điểm ảnh.
python3 so-anh.py <thư mục chứa *.sprite.json bản TRƯỚC>   → ghi ../anh/so-*.png
Mỗi ô: TRƯỚC | SAU trên nền tối của game, lấy vùng 200×90 điểm có sai khác lớn nhất của tấm (tấm nhỏ hơn thì lấy cả tấm).
Tấm "chép khung trùng": lấy đúng ô đã chép (trước: ô AI gần trùng, sau: bản chép của cột phát kế bên)."""
import base64, io, json, os, sys
import numpy as np
from PIL import Image, ImageDraw
DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'anh')
TRUOC = sys.argv[1]
K, WW, HH = 3, 200, 90
n = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ra', 'nen.json'), encoding='utf-8'))

def doc(path):
    d = json.load(open(path, encoding='utf-8')); k = 'tam' if isinstance(d.get('tam'), str) else 'anh'
    a = np.array(Image.open(io.BytesIO(base64.b64decode(d[k].split(',', 1)[1]))).convert('RGBA')); a[a[..., 3] == 0] = 0
    return d, a

def tren_nen(a):
    nen = Image.new('RGBA', (a.shape[1], a.shape[0]), (40, 36, 48, 255)); nen.alpha_composite(Image.fromarray(a, 'RGBA')); return nen.convert('RGB')

def o(ten, a, b, box, ghi):
    x0, y0, x1, y1 = box
    A = tren_nen(a[y0:y1, x0:x1]).resize(((x1 - x0) * K, (y1 - y0) * K), Image.NEAREST)
    B = tren_nen(b[y0:y1, x0:x1]).resize(((x1 - x0) * K, (y1 - y0) * K), Image.NEAREST)
    W = A.width * 2 + 12; H = A.height + 18
    im = Image.new('RGB', (W, H), (18, 16, 24)); im.paste(A, (0, 18)); im.paste(B, (A.width + 12, 18))
    dr = ImageDraw.Draw(im); dr.text((2, 3), 'TRUOC  ' + ten, fill=(230, 230, 230)); dr.text((A.width + 14, 3), 'SAU  ' + ghi, fill=(230, 230, 230))
    return im

def vung_lech(a, b):
    e = np.abs(a.astype(int) - b.astype(int)).max(-1).astype(float)
    H, W = e.shape; w, h = min(WW, W), min(HH, H)
    if (w, h) == (W, H): return (0, 0, W, H)
    c = e.cumsum(0).cumsum(1); c = np.pad(c, ((1, 0), (1, 0)))
    s = c[h:, w:] - c[:-h, w:] - c[h:, :-w] + c[:-h, :-w]
    y, x = np.unravel_index(np.argmax(s), s.shape); return (x, y, x + w, y + h)

os.makedirs(RA, exist_ok=True)
tiles_q, tiles_c = [], []
for r in n['tam']:
    if not r['sai_so'] and 'chép' not in r['cach']: continue
    d0, a = doc(os.path.join(TRUOC, r['ma'] + '.sprite.json')); d1, b = doc(os.path.join(DAY, 'game/art/custom', r['ma'] + '.sprite.json'))
    if r['sai_so']:
        tiles_q.append((r['sai_so'][0], o(r['ma'], a, b, vung_lech(a, b), 'sai so TB %.2f / 255' % r['sai_so'][0])))
    else:
        nn = d0.get('net', 1); fw, fh = d0['khung_rong'] * nn, d0['khung_cao'] * nn
        lech = np.argwhere(np.abs(a.astype(int) - b.astype(int)).max(-1) > 0)
        y, x = lech[0]; r0, c0 = y // fh, x // fw
        tiles_c.append(o(r['ma'] + ' (o hang %d cot %d, game khong ve)' % (r0, c0), a, b, (c0 * fw, r0 * fh, (c0 + 1) * fw, (r0 + 1) * fh), 'chep cot phat ke ben'))

def trang(tiles, ten, moi=8):
    ra = []
    for i in range(0, len(tiles), moi):
        g = tiles[i:i + moi]; W = max(t.width for t in g); H = sum(t.height + 8 for t in g)
        im = Image.new('RGB', (W, H), (10, 10, 14)); y = 0
        for t in g: im.paste(t, (0, y)); y += t.height + 8
        p = os.path.join(RA, '%s-%02d.png' % (ten, i // moi + 1)); im.save(p, optimize=True); ra.append(p)
    return ra

tiles_q.sort(key=lambda t: -t[0])
out = trang([t for _, t in tiles_q], 'so-256-mau') + trang(tiles_c, 'so-khung-trung', 6)
print('\n'.join(os.path.relpath(p, DAY) for p in out))
