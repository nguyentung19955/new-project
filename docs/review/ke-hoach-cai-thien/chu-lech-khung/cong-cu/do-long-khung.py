#!/usr/bin/env python3
"""Đo LÒNG THẬT của các khung giao diện ảnh (gd-*) để đặt chữ (chu-lech-khung, 15/10).

`vien` trong tệp ảnh là ô cắt 9 mảnh (gồm cả núm / hoa văn góc), KHÔNG phải độ dày viền: nút 63x24 có vien [9,13,9,13] nhưng
ở giữa nút viền chỉ dày ~4 điểm. Công cụ này loang (flood fill) từ tâm ảnh qua các điểm "lòng" (khung rỗng: điểm trong suốt;
khung đặc: điểm có độ sáng cùng dải với vùng giữa ảnh), mở hình 1 điểm để cắt các khe rò, rồi ghi cho TỪNG HÀNG ẢNH đoạn lòng
[trái, phải) chứa cột giữa. Game (js/ui_theme.js, T.LONG) dùng bảng này + cách cắt 9 mảnh để biết, ở mỗi hàng của khung đã co giãn,
chữ được phép nằm từ đâu tới đâu (trừ thêm 2 điểm đệm).

  python3 do-long-khung.py            in bảng + ghi ảnh soát long-khung.png cạnh tệp này
  python3 do-long-khung.py --ghi      ghi bảng vào game/js/ui_theme.js (giữa hai dòng mốc // <LONG> ... // </LONG>)
"""
import base64, io, json, os, re, sys
from collections import deque
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', '..'))
ART = os.path.join(REPO, 'game', 'art', 'custom')
THEME = os.path.join(REPO, 'game', 'js', 'ui_theme.js')
# Khung có chữ nằm trong / trên
MA = ['gd-nut-thuong', 'gd-nut-chinh', 'gd-nut-nguy', 'gd-nut-chon', 'gd-khung-bang', 'gd-khung-thoai', 'gd-khung-nho',
      'gd-dai-thong-bao', 'gd-the-thuong', 'gd-the-nho', 'gd-the-sap-co', 'gd-thanh-tren', 'gd-khung-canh-bao', 'gd-o-con',
      'gd-o-con-chon', 'gd-khung-trum', 'gd-khung-trum-nho', 'gd-khung-tinh-anh', 'gd-o-do-0', 'gd-khung-ban-do']


def lum(p):
    return 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]


def doc(ma):
    d = json.load(open(os.path.join(ART, ma + '.sprite.json')))
    im = Image.open(io.BytesIO(base64.b64decode(d['anh'].split(',', 1)[1]))).convert('RGBA')
    return d, im


def long_mask(im):
    W, H = im.size
    px = im.load()
    x0, x1, y0, y1 = int(W * .35), int(W * .65), int(H * .35), int(H * .65)
    vals = [lum(px[x, y]) if px[x, y][3] >= 128 else -1 for x in range(x0, x1 + 1) for y in range(y0, y1 + 1)]
    rong = sum(1 for v in vals if v < 0) > len(vals) * 0.5
    if rong:
        ok = lambda p: p[3] < 128
    else:
        vs = sorted(v for v in vals if v >= 0)
        lo, hi = vs[int(len(vs) * 0.02)], vs[int(len(vs) * 0.98)]
        sp = hi - lo
        lo, hi = lo - sp * 0.25, hi + sp * 0.25
        ok = lambda p: p[3] >= 128 and lo <= lum(p) <= hi
    m = [[False] * W for _ in range(H)]
    q = deque([(W // 2, H // 2)])
    m[H // 2][W // 2] = True
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            a, b = x + dx, y + dy
            if 0 <= a < W and 0 <= b < H and not m[b][a] and ok(px[a, b]):
                m[b][a] = True
                q.append((a, b))
    # mở hình (co 1 rồi nở 1, lân cận 8): bỏ các khe rò 1-2 điểm vào hoa văn
    def co(m):
        return [[m[y][x] and all(0 <= x + i < W and 0 <= y + j < H and m[y + j][x + i] for i in (-1, 0, 1) for j in (-1, 0, 1)) for x in range(W)] for y in range(H)]
    def no(m):
        return [[any(0 <= x + i < W and 0 <= y + j < H and m[y + j][x + i] for i in (-1, 0, 1) for j in (-1, 0, 1)) for x in range(W)] for y in range(H)]
    return no(co(m)), rong


def hang(m, W, H):
    """mỗi hàng ảnh: [trái, phải) = mép trái / phải của vùng loang trong hàng đó (lỗ do vân gỗ bên trong không tính), hoặc None.
    Hàng chỉ loang được một phần (mép trên / dưới, vân gỗ sậm) thì bỏ: rộng < 60% hàng rộng nhất."""
    out = []
    for y in range(H):
        xs = [x for x in range(W) if m[y][x]]
        out.append([xs[0], xs[-1] + 1] if xs else None)
    rmax = max(r[1] - r[0] for r in out if r)
    out = [r if r and r[1] - r[0] >= rmax * 0.6 else None for r in out]
    cy = H // 2
    for y in range(cy, -1, -1):
        if out[y] is None:
            for k in range(y): out[k] = None
            break
    for y in range(cy, H):
        if out[y] is None:
            for k in range(y, H): out[k] = None
            break
    return out


def bang():
    kq = {}
    for ma in MA:
        p = os.path.join(ART, ma + '.sprite.json')
        if not os.path.isfile(p): continue
        d, im = doc(ma)
        m, rong = long_mask(im)
        W, H = im.size
        rows = hang(m, W, H)
        y0 = next(i for i, r in enumerate(rows) if r)
        y1 = max(i for i, r in enumerate(rows) if r) + 1
        kq[ma] = {'net': d.get('net', 1), 'pw': W, 'ph': H, 'y0': y0, 'y1': y1, 'r': [rows[i] for i in range(y0, y1)], 'rong': rong}
    return kq


def js_bang(kq):
    # ma: [net, pw, ph, y0, "l,r l,r ..."] (điểm ảnh ẢNH; mỗi hàng từ y0)
    dong = []
    for ma, v in kq.items():
        s = ' '.join('%d,%d' % (a, b) for a, b in v['r'])
        dong.append("    '%s': [%d, %d, %d, %d, '%s']," % (ma, v['net'], v['pw'], v['ph'], v['y0'], s))
    return '\n'.join(dong)


def soat(kq, out):
    tiles = []
    for ma, v in kq.items():
        _, im = doc(ma)
        ov = im.copy(); p = ov.load()
        for i, r in enumerate(v['r']):
            y = v['y0'] + i
            for x in range(r[0], r[1]):
                if (x + y) % 2: p[x, y] = (0, 255, 90, 255)
        s = 3 if im.width < 200 else 2
        tiles.append((ma, ov.resize((im.width * s, im.height * s), Image.NEAREST)))
    from PIL import ImageDraw
    W = max(t.width for _, t in tiles) + 20
    H = sum(t.height + 22 for _, t in tiles) + 10
    sh = Image.new('RGBA', (W, H), (34, 30, 40, 255)); dr = ImageDraw.Draw(sh); y = 6
    for ma, t in tiles:
        dr.text((8, y), ma + '  (xanh = long do duoc)', fill=(255, 230, 160, 255)); y += 14
        sh.paste(t, (8, y), t); y += t.height + 8
    sh.save(out)


if __name__ == '__main__':
    kq = bang()
    for ma, v in kq.items():
        mid = v['r'][len(v['r']) // 2]
        print('%-20s anh %dx%d net %d  hàng lòng %d..%d  giữa [%d,%d)  (game: trên %.1f dưới %.1f trái %.1f phải %.1f)' % (
            ma, v['pw'], v['ph'], v['net'], v['y0'], v['y1'], mid[0], mid[1], v['y0'] / v['net'], (v['ph'] - v['y1']) / v['net'], mid[0] / v['net'], (v['pw'] - mid[1]) / v['net']))
    soat(kq, os.path.join(HERE, 'long-khung.png'))
    if '--ghi' in sys.argv:
        src = open(THEME, encoding='utf-8').read()
        moi = re.sub(r'(// <LONG>\n).*?(\s*// </LONG>)', lambda m: m.group(1) + js_bang(kq) + '\n' + m.group(2).lstrip('\n'), src, flags=re.S)
        if moi == src and '// <LONG>' not in src: sys.exit('thiếu mốc // <LONG> trong ui_theme.js')
        open(THEME, 'w', encoding='utf-8').write(moi)
        print('đã ghi bảng vào', THEME)
