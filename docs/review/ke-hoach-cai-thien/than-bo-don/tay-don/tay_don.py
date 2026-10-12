"""Bảng NẮM TAY cho các hàng cung, giáo, búa của tệp đòn thân bộ (SC.TAY_DON trong game/js/sprite_custom.js).
Vì sao: máy tự đo bàn tay trong game (tìm màu da xa thân) bắt nhầm sừng mũ, gùi, khăn của bộ đồ → cung vẽ trên đầu, giáo/búa ra sau lưng.
Chạy: python3 tay_don.py <key> <bộ> [ra.png]  → in số điểm ảnh từng khung + nắm tay ước lượng (dán vào SC.TAY_DON['<key>-<bộ>']),
ghi ảnh soát (vòng đỏ = nắm tay, vạch vàng = điểm chân). PHẢI SOÁT BẰNG MẮT: máy chỉ tìm điểm da xa nhất phía trước ở ngang
ngực–hông; khung giơ tay qua đầu (búa lấy đà), tay chụm ở bụng thì sửa tay. Toạ độ: điểm ảnh game tính từ chân, x về trước mặt."""
import sys, os, json, base64, io, colorsys
import numpy as np
from PIL import Image, ImageDraw
GOC = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '..'))
key, bo = sys.argv[1], sys.argv[2]
ra = sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tay-%s-%s.png' % (key, bo))
d = json.load(open(os.path.join(GOC, 'game', 'art', 'custom', 'em-be-%s-%s-don.sprite.json' % (key, bo))))
N = d.get('net', 2); fw, fh = d['khung_rong'], d['khung_cao']; ax, ay = d['goc']
S = np.array(Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA'))
HANG = [k for k in ('atk_bow', 'atk_spear', 'atk_hammer') if k in d['dong_tac']]
h0 = N // 2
def o_game(h, j):  # một ô theo điểm ảnh game (lấy mẫu giữa mỗi ô nét, như matNa trong game)
    return S[h * fh * N + h0:(h + 1) * fh * N:N, j * fw * N + h0:(j + 1) * fw * N:N]
def uoc(g):
    pts = []
    for y in range(fh):
        for x in range(fw):
            if g[y, x, 3] < 128: continue
            hh, sa, v = colorsys.rgb_to_hsv(*(g[y, x, :3] / 255))
            if 0.02 < hh < 0.11 and sa > 0.35 and v > 0.6 and -12.5 <= y - ay <= -4 and x - ax >= -2: pts.append((x - ax, y - ay))
    if not pts: return [5.5, -9.0]
    p = np.array(pts); q = p[p[:, 0] >= p[:, 0].max() - 2.5]
    return [float(v) for v in np.round((q.mean(0) + 0.5) * 2) / 2]
Z = 6; M = Image.new('RGB', (6 * fw * Z, len(HANG) * fh * Z), (110, 140, 115)); dr = ImageDraw.Draw(M)
print("    '%s-%s': {" % (key, bo))
for r, ten in enumerate(HANG):
    a = d['dong_tac'][ten]; so, tay = [], []
    for j in range(a['so']):
        g = o_game(a['hang'], j); so.append(int((g[..., 3] > 127).sum())); t = uoc(g); tay.append(t)
        for y in range(fh):
            for x in range(fw):
                if g[y, x, 3] > 127: dr.rectangle([j * fw * Z + x * Z, r * fh * Z + y * Z, j * fw * Z + x * Z + Z - 1, r * fh * Z + y * Z + Z - 1], fill=tuple(int(v) for v in g[y, x, :3]))
        for gx in range(0, fw, 2): dr.line([j * fw * Z + gx * Z, r * fh * Z, j * fw * Z + gx * Z, (r + 1) * fh * Z], fill=(95, 122, 100))
        for gy in range(1, fh, 2): dr.line([j * fw * Z, r * fh * Z + gy * Z, (j + 1) * fw * Z, r * fh * Z + gy * Z], fill=(95, 122, 100))
        dr.line([j * fw * Z + ax * Z, r * fh * Z, j * fw * Z + ax * Z, (r + 1) * fh * Z], fill=(255, 230, 0))
        dr.line([j * fw * Z, r * fh * Z + ay * Z, (j + 1) * fw * Z, r * fh * Z + ay * Z], fill=(255, 230, 0))
        cx, cy = j * fw * Z + (t[0] + ax) * Z, r * fh * Z + (t[1] + ay) * Z
        dr.ellipse([cx - 9, cy - 9, cx + 9, cy + 9], outline=(255, 0, 0), width=3)
        dr.rectangle([j * fw * Z, r * fh * Z, (j + 1) * fw * Z - 1, (r + 1) * fh * Z - 1], outline=(0, 0, 0))
        dr.text((j * fw * Z + 4, r * fh * Z + 4), '%s %d %s' % (ten, j + 1, t), fill=(0, 0, 0))
    print('      %s: { so: %s, tay: %s },' % (ten, so, json.dumps(tay).replace('.0,', ',').replace('.0]', ']')))
print('    },')
M.save(ra); print('ảnh soát:', ra)
