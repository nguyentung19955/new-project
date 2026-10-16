"""Cắt ảnh cho bảng kiểm kê: với mỗi (mã, nguồn) lấy ô chụp của hàm vẽ code tương ứng trong gom.json.
    python3 cat_anh.py <thư mục kk> <tệp nguon.json>
nguon.json: [{"ma": "...", "src": [["all", "regex trên tên hàm chủ"], ...]}, ...]
Ra (thư mục con-ve-tay-8):
  anh/<mã>.png         ảnh nhỏ cho bảng (ảnh ghép #world + #ui, 2 điểm ảnh màn = 1 điểm game, khung tím = chỗ hình code)
  mau/<mã>.png         ảnh mẫu gửi kèm khi gen: cắt sát hình code (+8 điểm game quanh), phóng ×4 theo điểm game, không khung
  cong-cu/do-co.json   cỡ hình code (điểm game) từng mã"""
import json, sys, os, re, base64, io
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)
kk = sys.argv[1]
spec = json.load(open(sys.argv[2], encoding='utf-8'))
G = {}
for d in ('all', 'song', 'rieng', 'vc'):
    p = os.path.join(kk, d, 'gom.json')
    if os.path.exists(p): G[d] = json.load(open(p))
os.makedirs(OUT + '/anh', exist_ok=True); os.makedirs(OUT + '/mau', exist_ok=True)
DO = {}
def tim(d, rx):
    for g in G[d]:
        if g['png'] and re.search(rx, g['chu']): return g
    return None
for s in spec:
    ims, mau = [], []
    for d, rx in s['src']:
        g = tim(d, rx)
        if not g: print('THIẾU', s['ma'], d, rx); continue
        im = Image.open(io.BytesIO(base64.b64decode(g['png'].split(',', 1)[1]))).convert('RGB')
        b = g['snap']['bb']
        DO.setdefault(s['ma'], []).append({'nguon': d, 'ham': g['chu'], 'rong': round((b[2] - b[0]) / 2), 'cao': round((b[3] - b[1]) / 2), 'canh': g['snap']['nhan']})
        # mẫu: cắt sát + 16 điểm màn (8 điểm game), phóng ×2 (= ×4 điểm game)
        x0, y0, x1, y1 = max(0, int(b[0]) - 16), max(0, int(b[1]) - 16), min(im.width, int(b[2]) + 16), min(im.height, int(b[3]) + 16)
        m = im.crop((x0, y0, x1, y1)); k = 2
        if m.width * k > 1600: k = 1600 / m.width
        mau.append(m.resize((max(1, int(m.width * k)), max(1, int(m.height * k))), Image.NEAREST))
        t = im.copy(); dd = ImageDraw.Draw(t); dd.rectangle([b[0] - 1, b[1] - 1, b[2], b[3]], outline=(255, 0, 255), width=2)
        if t.width > 360: t = t.resize((360, max(1, int(t.height * 360 / t.width))), Image.NEAREST)
        ims.append(t)
    if not ims: continue
    W = max(i.width for i in ims); H = sum(i.height for i in ims) + 4 * (len(ims) - 1)
    a = Image.new('RGB', (W, H), (24, 24, 30)); y = 0
    for i in ims: a.paste(i, (0, y)); y += i.height + 4
    a.save(OUT + '/anh/%s.png' % s['ma'], optimize=True)
    W = max(i.width for i in mau); H = sum(i.height for i in mau) + 8 * (len(mau) - 1)
    a = Image.new('RGB', (W, H), (24, 24, 30)); y = 0
    for i in mau: a.paste(i, (0, y)); y += i.height + 8
    a.save(OUT + '/mau/%s.png' % s['ma'], optimize=True)
json.dump(DO, open(HERE + '/do-co.json', 'w'), ensure_ascii=False, indent=1)
for k, v in DO.items(): print(k, [(x['rong'], x['cao']) for x in v])
