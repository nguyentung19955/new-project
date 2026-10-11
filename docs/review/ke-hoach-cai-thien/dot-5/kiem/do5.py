"""Đo trên tấm ảnh thân AI: dời đầu, dời thân (khớp mảng màu), và tờ soi phóng to có lưới để chấm điểm bằng mắt.
python3 do5.py <thư mục ra> [tệp điểm json để vẽ đè]"""
from chung import *
import numpy as np
OUT = sys.argv[1]; DIEM = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else {}
os.makedirs(OUT, exist_ok=True)
HANG = [('idle', 6), ('move', 6), ('tele', 4), ('atk', 6), ('hit', 4)]
AX, AY = 24, 45
MAU = {'dinh_dau': (255, 255, 0), 'eo': (0, 255, 255), 'lung': (255, 0, 255), 'tay_truoc': (0, 255, 0), 'goc_canh': (255, 140, 0)}


def tam(key):
    t = json.load(open(REPO + '/game/art/custom/em-be-%s.sprite.json' % key))
    im = Image.open(io.BytesIO(base64.b64decode(t['tam'].split(',', 1)[1]))).convert('RGBA')
    return t, im


def khung(t, im, ten, i):
    """Khung theo điểm ảnh game (48×48×4), lấy điểm giữa ô 2×2 như game."""
    a = np.asarray(im); h = t['dong_tac'][ten]['hang']
    return a[h * 96 + 1:(h + 1) * 96:2, i * 96 + 1:(i + 1) * 96:2].copy()


def khop_mang(A, B, cx, cy, rx, ry, lim=9):
    """Dời (dx, dy) để mảng màu quanh (cx, cy) (toạ độ chân) của khung A khớp nhất trong khung B."""
    x0, x1, y0, y1 = AX + cx - rx, AX + cx + rx + 1, AY + cy - ry, AY + cy + ry + 1
    P = A[y0:y1, x0:x1].astype(float); best = None
    for dy in range(-lim, lim + 1):
        for dx in range(-lim, lim + 1):
            if y0 + dy < 0 or x0 + dx < 0 or y1 + dy > 48 or x1 + dx > 48: continue
            Q = B[y0 + dy:y1 + dy, x0 + dx:x1 + dx].astype(float)
            ma = (P[..., 3] > 127); mb = (Q[..., 3] > 127)
            e = np.where(ma & mb, np.abs(P[..., :3] - Q[..., :3]).sum(-1), np.where(ma ^ mb, 400, 0)).sum() + 6 * (abs(dx) + abs(dy))
            if best is None or e < best[0]: best = (e, dx, dy)
    return best[1], best[2]


def to_soi(key):
    t, im = tam(key); A0 = khung(t, im, 'idle', 0); kq = {}
    X0, Y0, N = 6, 12, 38
    NHOM = [('idle', [('idle', i) for i in range(6)], 8), ('move', [('move', i) for i in range(6)], 8), ('tele', [('tele', i) for i in range(4)], 12), ('hit', [('hit', i) for i in range(4)], 12), ('atk', [('atk', i) for i in range(6)], 8)]
    for nhom, ds, Z in NHOM:
        sh = Image.new('RGB', (len(ds) * (N * Z + 6) + 6, N * Z + 26), (24, 34, 36)); d = ImageDraw.Draw(sh)
        for ci, (ten, i) in enumerate(ds):
            F = khung(t, im, ten, i); k = '%s:%d' % (ten, i)
            kq[k] = {'eo': khop_mang(A0, F, 0, -9, 4, 3), 'lung': khop_mang(A0, F, -2, -13, 4, 3)}
            ys, xs = np.nonzero(F[..., 3] > 127); xm = xs.max(); sel = xs >= xm - 2
            kq[k]['phai'] = (int(xm - 1 - AX), float(round(ys[sel].mean() - AY, 1)))
            ox, oy = ci * (N * Z + 6) + 6, 22
            d.text((ox, 4), '%s %s e%+d%+d l%+d%+d' % (key, k, *kq[k]['eo'], *kq[k]['lung']), fill=(241, 230, 198), font=font(12))
            bg = Image.new('RGBA', (N, N), (43, 58, 46, 255)); bg.alpha_composite(Image.fromarray(F[Y0:Y0 + N, X0:X0 + N]))
            sh.paste(bg.convert('RGB').resize((N * Z, N * Z), Image.NEAREST), (ox, oy))
            for q in range(N + 1):
                gx = X0 + q - AX; gy = Y0 + q - AY
                if gx % 5 == 0:
                    d.line([ox + q * Z, oy, ox + q * Z, oy + N * Z], fill=(255, 255, 255) if gx == 0 else (120, 140, 130)); d.text((ox + q * Z + 2, oy + 1), str(gx), fill=(255, 255, 255), font=font(10))
                if gy % 5 == 0:
                    d.line([ox, oy + q * Z, ox + N * Z, oy + q * Z], fill=(255, 255, 255) if gy == 0 else (120, 140, 130)); d.text((ox + 1, oy + q * Z + 1), str(gy), fill=(255, 255, 255), font=font(10))
            for ten_d, p in (DIEM.get(key, {}).get(k) or {}).items():
                px, py = ox + (p[0] + AX - X0 + 0.5) * Z, oy + (p[1] + AY - Y0 + 0.5) * Z
                d.ellipse([px - 3, py - 3, px + 3, py + 3], outline=MAU.get(ten_d, (255, 255, 255)), width=2)
        sh.save('%s/%s-%s.png' % (OUT, key, nhom))
    return kq


kq = {k: to_soi(k) for k in KEYS}
json.dump(kq, open(OUT + '/khop-mang.json', 'w'))
