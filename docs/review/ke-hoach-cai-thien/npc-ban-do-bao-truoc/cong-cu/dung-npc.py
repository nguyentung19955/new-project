"""Bảy NPC làng mới (phong cách Zed): khung đã cắt docs/anh-goc/npc-moi/nl-<mã>-{1-dung,2-noi}-cat -> game/art/custom/nl-<mã>.sprite.json
(2 hàng x 6: hàng 0 đứng 1,2 s lặp, hàng 1 nói 0,9 s lặp; ảnh nhìn sang PHẢI như cũ). python3 dung-npc.py [--ghi]
- Cỡ: chiều cao đứng (trung vị khung hàng đứng, gồm nón/mũ) = CAO điểm game; Zed mới cao 31 -> người lớn 38–42 (~1,25–1,35 lần), Bà Hàng Xén thấp, Cụ Đồ ngồi.
- Hàng nói co theo tỉ lệ SIFT so với hàng đứng (sift_ti_le.py).
- Neo: đáy chân = đường đất (trung vị 'chan' của hàng), ngang = trung vị dải chân 15% dưới cùng.
"""
import sys, os, json, glob, io, base64
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../trum-moi/cong-cu'))
DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
GOC = os.path.join(DAY, 'docs/anh-goc/npc-moi')
GHI = '--ghi' in sys.argv
RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ra'); os.makedirs(RA, exist_ok=True)
N = 2; SO_MAU = 96
TEN = {'lai': 'Chú Lái Đò', 'ren': 'Ông Thợ Rèn', 'xen': 'Bà Hàng Xén', 'may': 'Cô Thợ May', 'do': 'Cụ Đồ', 'tu': 'Ông Từ', 'mo': 'Anh Mõ'}
CAO = {'lai': 42, 'ren': 41, 'xen': 33, 'may': 40, 'do': 29, 'tu': 41, 'mo': 40}
SIFT = {'lai': 0.992, 'ren': 0.966, 'xen': 1.037, 'may': 0.958, 'do': 0.999, 'tu': 1.088, 'mo': 0.966}

def doc_hang(ma, h):
    d = os.path.join(GOC, 'nl-%s-%s-cat' % (ma, h))
    ks = json.load(open(os.path.join(d, 'bao-cao.json'), encoding='utf-8'))['hang'][0]['khung']
    fs = sorted(glob.glob(os.path.join(d, '*', 'khung-*.png'))); assert len(fs) == len(ks) == 6, (ma, h)
    dat = float(np.median([k['chan'][1] for k in ks])); out = []; lech = []
    for f, k in zip(fs, ks):
        a = np.array(Image.open(f).convert('RGBA')); m = a[..., 3] > 128
        ys = np.nonzero(m.any(1))[0]; y0, y1 = ys[0], ys[-1]
        band = m.copy(); band[: int(y1 - 0.15 * (y1 - y0))] = False
        xs = np.nonzero(band)[1]; cx = a.shape[1] / 2; lech.append(float(np.median(xs)) - cx)
        out.append((a, cx, k['chan'][1] - dat))
    L = float(np.median(lech))
    return [(a, cx + L, dy) for a, cx, dy in out]

def thu(a, z):
    H, W = a.shape[:2]; tw, th = max(1, round(W * z)), max(1, round(H * z))
    al = a[..., 3:4].astype(np.float32) / 255
    pre = np.concatenate([a[..., :3] * al, al * 255], 2).astype(np.float32)
    ch = [np.array(Image.fromarray(pre[..., k]).resize((tw, th), Image.BOX)) for k in range(4)]
    A = ch[3]; o = np.zeros((th, tw, 4), np.uint8)
    for k in range(3): o[..., k] = np.clip(np.where(A > 0, ch[k] / np.maximum(A, 1e-3) * 255, 0), 0, 255)
    o[..., 3] = (A >= 128) * 255
    # bỏ mảnh vụn rời (nhiễu khi cắt): thành phần liền < 12 điểm
    from scipy import ndimage
    lb, n = ndimage.label(o[..., 3] > 0)
    if n > 1:
        sz = ndimage.sum(np.ones_like(lb), lb, range(1, n + 1))
        for i, v in enumerate(sz):
            if v < 12: o[lb == i + 1] = 0
    return o

def luu_png(sh, so_mau=SO_MAU):
    sh = sh.copy(); op = sh[..., 3] > 0; px = sh[op][:, :3]
    q = Image.fromarray(px.reshape(1, -1, 3)).quantize(colors=so_mau, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[:3 * so_mau]).reshape(-1, 3); sh[op, :3] = pal[np.array(q).ravel()]; sh[~op] = 0
    mau = sorted(set(map(tuple, sh.reshape(-1, 4).tolist())))
    flat = sh.reshape(-1, 4).astype(np.int64); key = ((flat[:, 0] * 256 + flat[:, 1]) * 256 + flat[:, 2]) * 256 + flat[:, 3]
    kmau = np.array([((c[0] * 256 + c[1]) * 256 + c[2]) * 256 + c[3] for c in mau], np.int64)
    ix = np.searchsorted(kmau, key).astype(np.uint8).reshape(sh.shape[:2])
    pim = Image.fromarray(ix, 'P'); pim.putpalette([v for c in mau for v in c[:3]])
    buf = io.BytesIO(); pim.save(buf, 'PNG', optimize=True, transparency=bytes(c[3] for c in mau))
    return buf.getvalue(), sh

so_do = {}
for ma in TEN:
    dung = doc_hang(ma, '1-dung'); noi = doc_hang(ma, '2-noi')
    hc = float(np.median([a.shape[0] - dy for a, x, dy in dung]))
    z1 = N * CAO[ma] / hc; z2 = z1 / SIFT[ma]
    hang = [[(thu(a, z1), x * z1, dy * z1) for a, x, dy in dung], [(thu(a, z2), x * z2, dy * z2) for a, x, dy in noi]]
    trai = max(x for v in hang for a, x, dy in v); phai = max(a.shape[1] - x for v in hang for a, x, dy in v)
    tren = max(a.shape[0] - dy for v in hang for a, x, dy in v); duoi = max(max(0.0, dy) for v in hang for a, x, dy in v)
    GX = int(np.ceil(trai / N)) + 1; FW = GX + int(np.ceil(phai / N)) + 1
    GY = int(np.ceil(tren / N)) + 1; FH = GY + int(np.ceil(duoi / N)) + 1
    sh = np.zeros((2 * FH * N, 6 * FW * N, 4), np.uint8)
    for R, v in enumerate(hang):
        for C, (a, x, dy) in enumerate(v):
            X = int(round(GX * N - x)); Y = int(round(GY * N + dy - a.shape[0]))
            o = sh[R * FH * N:(R + 1) * FH * N, C * FW * N:(C + 1) * FW * N]
            assert X >= 0 and Y >= 0 and X + a.shape[1] <= FW * N and Y + a.shape[0] <= FH * N
            sub = o[Y:Y + a.shape[0], X:X + a.shape[1]]; sub[:] = np.where(a[..., 3:4] > 0, a, sub)
    png, sh = luu_png(sh)
    # rộng / cao: khung đứng đầu (điểm game) — game dùng cho hộp chạm và chỗ bong bóng
    m = sh[:FH * N, :FW * N, 3] > 127; ys = np.nonzero(m.any(1))[0]; xs = np.nonzero(m.any(0))[0]
    cao = int(round((GY * N - ys[0]) / N)); rong = int(round((xs[-1] - xs[0] + 1) / N))
    t = {'loai': 'linh-khi-sprite', 'doi_tuong': 'nguoi-lang', 'ma': 'nl-' + ma, 'ten': TEN[ma],
         'tam': 'data:image/png;base64,' + base64.b64encode(png).decode(), 'net': N, 'khung_rong': FW, 'khung_cao': FH, 'goc': [GX, GY],
         'rong': rong, 'cao': cao, 'dong_tac': {'idle': {'hang': 0, 'so': 6, 'giay': 1.2, 'lap': True}, 'noi': {'hang': 1, 'so': 6, 'giay': 0.9, 'lap': True}}}
    Image.fromarray(sh).save(os.path.join(RA, 'nl-%s.png' % ma))
    ra = os.path.join(DAY, 'game/art/custom', 'nl-%s.sprite.json' % ma) if GHI else os.path.join(RA, 'nl-%s.sprite.json' % ma)
    json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    so_do[ma] = {'o': [FW, FH], 'goc': [GX, GY], 'rong': rong, 'cao': cao, 'byte': os.path.getsize(ra)}
    print(ma, so_do[ma])
json.dump(so_do, open(os.path.join(RA, 'so-do-npc.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
