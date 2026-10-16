"""Nền Sông sâu + sân trùm Thuồng Luồng từ ảnh gen (lặp 3×3) → tệp gd-nen-song-* (cùng chuẩn bộ nền Rừng / Biển / Lâu, js/room_art.js TR_CO).
  n1-nen-song-san.png: 4 ô 2×2 trên nền #00FF00, mỗi ô là 1 mảng sàn lặp 3×3 → ô 1–3 = gd-nen-song-san0/1/2, ô 4 = gd-nen-song-san-nhan
  n2-san-thuong-luong.png: cả ảnh là 1 mảng lặp 3×3 → gd-nen-song-san-tl (sân trùm, js/thuong_luong.js)
Cách làm: tìm chu kỳ lặp thật (tự tương quan quanh 1/3 cạnh, ảnh AI không chia đúng 1/3), cắt đúng một chu kỳ ở giữa, thu về 64×64 điểm game
(net 2 → 128×128), làm liền mép (trộn dải mép như tools/tach-phong lienMep), giảm còn 64 màu. Ghi kèm ảnh lát 3×3 để soát mép.
Dùng: python3 dung-nen.py [--ghi]   (không --ghi: chỉ ghi ảnh soát vào ../anh-soat/)
"""
import os, sys, json, io, base64
import numpy as np
from PIL import Image

DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
GOC = os.path.join(DAY, 'docs/anh-goc/ve-tay-8-gop')
CUSTOM = os.path.join(DAY, 'game/art/custom')
SOAT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../anh-soat'); os.makedirs(SOAT, exist_ok=True)
GHI = '--ghi' in sys.argv
N, CO = 2, 64


def chu_ky(a, truc):
    """chu kỳ lặp theo trục (0 = dọc, 1 = ngang): độ lệch d quanh L/3 làm |a - a dịch d| nhỏ nhất."""
    L = a.shape[truc]; g = a.astype(np.float32).mean(2)
    best = None
    for d in range(int(L / 3 * 0.85), int(L / 3 * 1.15)):
        A = g.take(range(0, L - d), axis=truc); B = g.take(range(d, L), axis=truc)
        e = float(np.abs(A - B).mean())
        if best is None or e < best[0]: best = (e, d)
    return best[1], best[0]


def mep(o, b):
    """làm liền mép: trong dải b điểm ảnh ở hai mép đối nhau trộn dần với điểm đối xứng (sát mép 50/50)."""
    o = o.astype(np.float32); h, w = o.shape[:2]
    for i in range(b):
        t = 0.5 * (1 - i / b)
        l, r = o[:, i].copy(), o[:, w - 1 - i].copy(); o[:, i] = l * (1 - t) + r * t; o[:, w - 1 - i] = r * (1 - t) + l * t
    for i in range(b):
        t = 0.5 * (1 - i / b)
        u, d = o[i].copy(), o[h - 1 - i].copy(); o[i] = u * (1 - t) + d * t; o[h - 1 - i] = d * (1 - t) + u * t
    return np.clip(o + 0.5, 0, 255).astype(np.uint8)


def vet_noi(t):
    """độ lộ đường nối khi lát: chênh lệch qua mép (cột cuối → cột đầu) so với chênh lệch trung bình giữa hai cột kề nhau bên trong."""
    t = t.astype(np.float32)
    trong = (np.abs(np.diff(t, axis=1)).mean() + np.abs(np.diff(t, axis=0)).mean()) / 2
    qua = (np.abs(t[:, 0] - t[:, -1]).mean() + np.abs(t[0] - t[-1]).mean()) / 2
    return round(float(qua / trong), 2)


def mot_mang(a, ten, b_mep, co=CO):
    py, ey = chu_ky(a, 0); px, ex = chu_ky(a, 1)
    H, W = a.shape[:2]; y0 = (H - py) // 2; x0 = (W - px) // 2
    t = a[y0:y0 + py, x0:x0 + px]
    tr = vet_noi(t)
    im = Image.fromarray(t).resize((co * N, co * N), Image.LANCZOS)
    o = np.array(im.convert('RGB'))
    if b_mep: o = mep(o, b_mep)
    sau_mep = vet_noi(o)
    q = Image.fromarray(o).quantize(64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    o = np.array(q)
    r = dict(ten=ten, chu_ky=[px, py], lech_lap=[round(ex, 1), round(ey, 1)], vet_noi_goc=tr, vet_noi_truoc_mep=sau_mep, vet_noi_ra=vet_noi(o))
    return o, r


def soat(o, ten):
    lat = np.tile(o, (3, 3, 1))
    Image.fromarray(lat).resize((lat.shape[1] * 2, lat.shape[0] * 2), Image.NEAREST).save(os.path.join(SOAT, 'lat-3x3-' + ten + '.png'))


def ghi(ma, ten, o, co=CO):
    b = io.BytesIO(); Image.fromarray(o).save(b, 'PNG', optimize=True)
    t = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'ma': ma, 'ten': ten, 'doi_tuong': 'giao-dien', 'rong': co, 'cao': co, 'net': N,
         'anh': 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()}
    p = os.path.join(CUSTOM, ma + '.sprite.json')
    json.dump(t, open(p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    return os.path.getsize(p)


if __name__ == '__main__':
    kq = []
    a = np.array(Image.open(os.path.join(GOC, 'n1-nen-song-san.png')).convert('RGB'))
    r_, g_, b_ = (a[..., i].astype(int) for i in range(3))
    xanh = (g_ > 150) & (g_ - np.maximum(r_, b_) > 80)
    H, W = xanh.shape
    O = [('gd-nen-song-san0', 'Sàn A'), ('gd-nen-song-san1', 'Sàn B'), ('gd-nen-song-san2', 'Sàn C'), ('gd-nen-song-san-nhan', 'Sàn điểm nhấn')]
    for k, (ma, ten) in enumerate(O):
        ys, xs = slice((k // 2) * H // 2, (k // 2 + 1) * H // 2), slice((k % 2) * W // 2, (k % 2 + 1) * W // 2)
        m = ~xanh[ys, xs]; yy = np.nonzero(m.mean(1) > 0.5)[0]; xx = np.nonzero(m.mean(0) > 0.5)[0]
        o_ = a[ys, xs][yy[0] + 2:yy[-1] - 1, xx[0] + 2:xx[-1] - 1]   # bỏ 2 điểm ảnh viền (lem xanh)
        o, r = mot_mang(o_, ma, 6)
        soat(o, ma)
        if GHI: r['byte'] = ghi(ma, ten, o)
        kq.append(r)
    a = np.array(Image.open(os.path.join(GOC, 'n2-san-thuong-luong.png')).convert('RGB'))
    o, r = mot_mang(a, 'gd-nen-song-san-tl', 12, 128)   # sân trùm: mảng 128×128 điểm game (đỡ lặp trên sân 282×186)   # ảnh gốc lộ vệt nối giữa các ô → dải trộn mép rộng hơn
    soat(o, 'gd-nen-song-san-tl')
    if GHI: r['byte'] = ghi('gd-nen-song-san-tl', 'Sân trùm Thuồng Luồng', o, 128)
    kq.append(r)
    for r in kq: print(json.dumps(r, ensure_ascii=False))
    json.dump(kq, open(os.path.join(SOAT, 'nen-so-do.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
