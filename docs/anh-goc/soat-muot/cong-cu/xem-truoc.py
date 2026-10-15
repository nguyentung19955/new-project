"""Ảnh soát tĩnh docs/anh-goc/soat-muot/xem-truoc.png: mỗi con hai dải — CŨ (tấm <mã>-muotcu) và MỚI (tấm đang dùng) —
mỗi dải: khung đứng trước (nối vào) | hàng được thay (đánh số khung) | khung đứng sau (về đứng). Đã cộng "can_tam" như game.
Vạch đỏ dọc = điểm neo, vạch xanh ngang = đường đất (điểm neo dọc).
python3 xem-truoc.py [cong-cu/ra]   (thư mục ra: xem bản thử chưa --ghi)"""
import sys, os, json, io, base64
import numpy as np
from PIL import Image, ImageDraw

DAY_CC = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(DAY_CC, '../../../..'))
CUSTOM = os.path.join(REPO, 'game/art/custom')
THU = sys.argv[1] if len(sys.argv) > 1 else None
# ma: (hàng thay, (hàng, cột) đứng trước, (hàng, cột) đứng sau)
DS = [('caNocChua', 'atk', ('tele', 5), ('idle', 0), 'Cá Nóc Chúa · đánh (P1)'),
      ('nhim', 'atk', ('tele', 5), ('idle', 0), 'Nhím Biển · đánh (P2)'),
      ('nhimDoc', 'atk', ('tele', 5), ('idle', 0), 'Nhím Gai Độc · đánh (P2)'),
      ('nhimThan', 'atk', ('tele', 5), ('idle', 0), 'Nhím Than · đánh (P2)'),
      ('heoNanh', 'hit', ('idle', 0), ('idle', 0), 'Heo Nanh Dài · trúng đòn (P3)'),
      ('hoLua-p2', 'hit', ('idle', 0), ('idle', 0), 'Hổ Lửa pha 2 · trúng đòn (P4)'),
      ('namChua-p2', 'hit', ('idle', 0), ('idle', 0), 'Nấm Chúa pha 2 · trúng đòn (P4)'),
      ('hoTinh', 'atk', ('tele', 8), ('idle', 0), 'Hồ Tinh pha 1 · đánh (P6)')]
CAO = 150   # cao một ô trên ảnh soát (điểm ảnh)


def doc(p):
    d = json.load(open(p, encoding='utf-8'))
    return d, np.array(Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',', 1)[1]))).convert('RGBA'))


def o(d, sh, ten, i):
    N = d.get('net', 1); FW, FH = d['khung_rong'] * N, d['khung_cao'] * N; R = d['dong_tac'][ten]['hang']
    a = sh[R * FH:(R + 1) * FH, i * FW:(i + 1) * FW].copy()
    ct = (d.get('can_tam') or {}).get(ten)
    if ct and i < len(ct) and ct[i]:
        a = np.roll(a, ct[i] * N, axis=1)
    return a


def dai(d, sh, ten, truoc, sau):
    L = [('vào', o(d, sh, *truoc))] + [(str(i + 1), o(d, sh, ten, i)) for i in range(d['dong_tac'][ten]['so'])] + [('về', o(d, sh, *sau))]
    return L


try:
    from PIL import ImageFont
    F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
except Exception:
    F = None
hangs = []
for ma, ten, truoc, sau, nhan in DS:
    p_cu = os.path.join(CUSTOM, ma + '-muotcu.sprite.json')
    d_cu, s_cu = doc(p_cu if os.path.exists(p_cu) else os.path.join(CUSTOM, ma + '.sprite.json'))
    d_moi, s_moi = doc(os.path.join(THU, ma + '.sprite.json') if THU else os.path.join(CUSTOM, ma + '.sprite.json'))
    N = d_cu.get('net', 1); FW, FH = d_cu['khung_rong'] * N, d_cu['khung_cao'] * N
    k = CAO / FH; w = max(1, round(FW * k))
    for nh, d, sh in (('CŨ', d_cu, s_cu), ('MỚI', d_moi, s_moi)):
        L = dai(d, sh, ten, truoc, sau)
        im = Image.new('RGB', (250 + len(L) * (w + 6), CAO + 26), (40, 40, 48)); dr = ImageDraw.Draw(im)
        dr.text((6, 6), nhan, fill=(255, 255, 255), font=F); dr.text((6, 30), nh + ' · ' + str(d['dong_tac'][ten]['so']) + ' khung', fill=(255, 220, 120) if nh == 'MỚI' else (180, 180, 180), font=F)
        for j, (t, a) in enumerate(L):
            x = 250 + j * (w + 6)
            nen = Image.new('RGBA', (FW, FH), (92, 92, 104, 255) if t in ('vào', 'về') else (120, 130, 150, 255))
            nen.alpha_composite(Image.fromarray(a))
            im.paste(nen.convert('RGB').resize((w, CAO), Image.NEAREST), (x, 22))
            gx = x + d['goc'][0] * N * k; gy = 22 + d['goc'][1] * N * k
            dr.line([(gx, 22), (gx, 22 + CAO)], fill=(255, 60, 60)); dr.line([(x, gy), (x + w, gy)], fill=(60, 220, 120))
            dr.text((x + 3, 3), t, fill=(255, 255, 255), font=F)
        hangs.append(im)
    hangs.append(Image.new('RGB', (10, 8), (20, 20, 24)))
W = max(h.size[0] for h in hangs); H = sum(h.size[1] for h in hangs)
out = Image.new('RGB', (W, H), (20, 20, 24)); y = 0
for h in hangs: out.paste(h, (0, y)); y += h.size[1]
ra = os.path.join(os.path.dirname(DAY_CC), 'xem-truoc.png')
out.save(ra, optimize=True); print(ra, out.size)
