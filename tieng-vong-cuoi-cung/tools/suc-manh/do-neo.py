#!/usr/bin/env python3
"""Đo TỰ ĐỘNG điểm neo mặt nạ / ngực / hông / lưng của Kiếm Khách cho từng khung (phiên sucmanh, theo tư vấn ChatGPT mục 6:
"đo neo mặt nạ/ngực/hông/lưng từng khung"). Không sửa ảnh nào.
Chạy: python3 tools/suc-manh/do-neo.py [thư mục ảnh xem NGOÀI repo]
Ghi: game/thu-mat-na/neo-kiem-khach.json  –  {clip: {"mat_na": [[x,y]…], "nguc": …, "hong": …, "lung": …}}
     toạ độ trong khung gốc 256×256, nhân vật quay PHẢI, chân [128,172] (giống art/kiem-khach/<clip>/fNN.png).
Cách đo (ảnh thân nhỏ ~40×75 px):
  mat_na = tâm điểm ảnh xanh băng (vệt mắt) trong vùng đầu; không thấy → tâm điểm ảnh trắng nhất phía trước đầu
  nguc   = tâm khối vải tối ở dải ngay dưới cổ (mat_na.y + 7 … +13), bỏ tóc/kiếm
  hong   = tâm khối vải tối ở dải thắt lưng (≈ 45% chiều cao tính từ chân), mép trước
  lung   = từ điểm ngực đi ngang về phía sau tới mép thân (dừng ở tóc/chỗ trống) – chỗ buộc dải vải
Đây là ước lượng: xem ảnh kiểm (<xem>/neo-<clip>.png, chấm đỏ=mặt nạ, vàng=ngực, xanh lá=hông, tím=lưng) và sửa tay nếu lệch.
"""
import sys, os, json
from PIL import Image, ImageDraw

GOC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
XEM = sys.argv[1] if len(sys.argv) > 1 else '/tmp/suc-manh-xem'
os.makedirs(XEM, exist_ok=True)
CLIP = ['dung', 'chay', 'nhay', 'roi', 'tiepdat', 'luot', 'trungdon', 'don1', 'don2', 'don3', 'don4']

def lum(p): return 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]
def cyan(p): return p[3] > 128 and p[2] > 150 and p[2] > p[0] + 60 and p[1] > p[0] + 30
def toi(p): return p[3] > 128 and lum(p) < 105 and not cyan(p) and p[2] - p[0] < 40   # vải tối (bỏ viền xanh thẫm của vệt chém)
def sang(p): return p[3] > 128 and lum(p) > 200 and max(p[:3]) - min(p[:3]) < 40

def tam(ds):
    if not ds: return None
    return [round(sum(x for x, _ in ds) / len(ds)), round(sum(y for _, y in ds) / len(ds))]

def toc(p): return p[3] > 128 and lum(p) > 195 and max(p[:3]) - min(p[:3]) < 70 and p[0] >= p[2] and not cyan(p)   # kem ấm (tóc/mặt nạ), không lấy trắng xanh của lưỡi kiếm

def cum(px, W, H, dk, vung):
    """các cụm liền nhau (4 hướng) của điểm thoả dk trong vùng (x0,y0,x1,y1)"""
    x0, y0, x1, y1 = vung; da = set(); out = []
    for y in range(y0, y1):
        for x in range(x0, x1):
            if (x, y) in da or not dk(px[x, y]): continue
            st = [(x, y)]; da.add((x, y)); c = []
            while st:
                u, v = st.pop(); c.append((u, v))
                for du, dv in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    a, b = u + du, v + dv
                    if x0 <= a < x1 and y0 <= b < y1 and (a, b) not in da and dk(px[a, b]): da.add((a, b)); st.append((a, b))
            out.append(c)
    return out

def do_khung(im):
    W, H = im.size; px = im.load()
    bb = im.getbbox(); x0, y0, x1, y1 = bb
    toiDs = [(x, y) for y in range(y0, y1) for x in range(x0, x1) if toi(px[x, y])]
    tx = sorted(x for x, _ in toiDs)[len(toiDs) // 2] if toiDs else 128
    # đầu = cụm tóc/mặt nạ (màu kem sáng) LỚN NHẤT – bỏ kiếm, vệt chém, bọc tay
    cs = cum(px, W, H, toc, (max(0, x0), max(0, y0), min(W, x1), min(H, 172)))
    lon = [c for c in cs if len(c) >= 10] or ([max(cs, key=len)] if cs else [])
    dauC = []
    if lon:
        lon.sort(key=len, reverse=True); ytop = min(y for _, y in lon[0])     # cụm lớn nhất (tóc) → mép trên đầu
        dauC = [(x, y) for c in lon if ytop - 4 <= min(y for _, y in c) < ytop + 24 for (x, y) in c if y < ytop + 32]
    if dauC:
        yd = min(y for _, y in dauC); xa = min(x for x, _ in dauC); xb = max(x for x, _ in dauC); yb = max(y for _, y in dauC)
    else:
        yd, xa, xb, yb = y0, tx - 18, tx + 22, y0 + 30
    cao = 172 - yd
    # mặt nạ = vệt mắt xanh băng: cụm xanh NHỎ (3–14 điểm, ≤5×6) gần như bị bao quanh bởi màu mặt nạ
    ung = []
    for c in cum(px, W, H, cyan, (xa, yd, min(W, xb + 8), min(H, yb + 2))):
        if not (2 <= len(c) <= 14): continue
        cx = [x for x, _ in c]; cy = [y for _, y in c]
        if max(cx) - min(cx) > 6 or max(cy) - min(cy) > 6: continue
        vien = [(x + i, y + j) for x, y in c for i in (-1, 0, 1) for j in (-1, 0, 1) if (x + i, y + j) not in c]
        ty = sum(1 for u, v in vien if toc(px[u, v]) or sang(px[u, v])) / max(1, len(vien))   # mặt nạ: trắng kem hoặc trắng lạnh
        if ty >= 0.5: ung.append((ty, c))
    m = tam(max(ung, key=lambda t: (round(t[0], 1), sum(x for x, _ in t[1]) / len(t[1])))[1]) if ung else None   # bao bởi mặt nạ nhiều nhất, rồi phía TRƯỚC
    thayMat = m is not None
    if not m:   # không thấy mắt (mặt nạ bị tay/kiếm che, quay đi) → mat_na = null (lớp mặt nạ ẩn ở khung đó); ước lượng để đo phần khác
        m = [min(xb - 3, tx + 8), min(yd + 14, (yd + yb) // 2)]
    def dai(ya, yb, rong=14):
        return [(x, y) for y in range(max(0, ya), min(H, yb)) for x in range(max(0, tx - rong), min(W, tx + rong)) if toi(px[x, y])]
    n = tam(dai(m[1] + 7, m[1] + 14)) or [tx, m[1] + 10]
    yh = round(172 - cao * 0.45)
    hd = dai(yh - 2, yh + 3)
    h = [max(x for x, _ in hd) - 2, yh] if hd else [tx, yh]
    # lưng: từ ngực đi ngang về phía SAU (trái) trên hàng ngay trên ngực, dừng khi gặp tóc / chỗ trống
    yl = n[1] - 2; xl = n[0]
    while xl - 1 > 0 and px[xl - 1, yl][3] > 128 and not toc(px[xl - 1, yl]) and not cyan(px[xl - 1, yl]) and n[0] - xl < 16: xl -= 1
    l = [xl + 1, yl]
    return {'mat_na': m if thayMat else None, 'nguc': n, 'hong': h, 'lung': l}

# SỬA TAY sau khi xem ảnh kiểm (02/11): (clip, khung) → điểm thay thế. null = điểm đó bị che, lớp ẩn ở khung ấy.
SUA_TAY = {
    ('don1', 7): {'mat_na': [134, 114]},   # mắt sát mép mặt nạ, dò tự động bỏ sót
}

out = {'ghi_chu': 'Điểm neo ĐO TỰ ĐỘNG bằng tools/suc-manh/do-neo.py (ước lượng, sửa tay nếu lệch). Toạ độ khung gốc 256×256, quay phải, chân [128,172].'}
MAU = {'mat_na': (255, 40, 40), 'nguc': (255, 220, 0), 'hong': (40, 255, 80), 'lung': (200, 80, 255)}
for c in CLIP:
    d = os.path.join(GOC, 'art/kiem-khach', c)
    if not os.path.isdir(d): continue
    fs = sorted(f for f in os.listdir(d) if f.startswith('f') and f.endswith('.png'))
    o = {k: [] for k in MAU}
    tiles = []
    for f in fs:
        im = Image.open(os.path.join(d, f)).convert('RGBA')
        r = do_khung(im)
        r.update(SUA_TAY.get((c, int(f[1:3])), {}))
        for k in MAU: o[k].append(r[k])
        bg = Image.new('RGBA', im.size, (34, 34, 52, 255)); bg.alpha_composite(im)
        z = bg.crop((60, 60, 196, 180)).resize((408, 360), Image.NEAREST); dr = ImageDraw.Draw(z)
        for k, v in r.items():
            if not v: continue
            x, y = v
            X, Y = (x - 60) * 3 + 1, (y - 60) * 3 + 1; dr.rectangle([X - 3, Y - 3, X + 3, Y + 3], outline=MAU[k] + (255,), width=2)
        tiles.append(z)
    sh = Image.new('RGBA', (408 * len(tiles), 360)); [sh.paste(t, (i * 408, 0)) for i, t in enumerate(tiles)]
    sh.save(os.path.join(XEM, 'neo-' + c + '.png'))
    out[c] = o
    print(c, len(fs), 'khung  mat_na', o['mat_na'])
p = os.path.join(GOC, 'game/thu-mat-na/neo-kiem-khach.json')
with open(p, 'w', encoding='utf-8') as fo:
    fo.write('{\n "ghi_chu": ' + json.dumps(out.pop('ghi_chu'), ensure_ascii=False))
    for c, o in out.items():
        fo.write(',\n "' + c + '": {' + ', '.join('"%s": %s' % (k, json.dumps(v, separators=(',', ':'))) for k, v in o.items()) + '}')
    fo.write('\n}\n')
print('Ghi', p)
