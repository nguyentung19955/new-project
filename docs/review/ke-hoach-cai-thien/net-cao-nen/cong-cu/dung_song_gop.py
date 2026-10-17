"""NÉT CAO — NỀN (17/10): phần Sông sâu (tường, cửa, cọc, đá bùn, tiền cảnh) + cột sáng Hang biển / Lâu đài của
ve-tay-8-gop-tran/cong-cu/dung-gop.py, chép nguyên cách cắt (khử nền 'tach', màu sạch, NEAREST giữa ô), thêm --net N:
mọi cỡ đích (điểm ảnh ảnh, viết cho net 2) nhân N/2; đoạn lặp liền của tường (lap_ngang) lấy theo lần chạy net 2 rồi nhân lên
(cùng điểm game bắt đầu, cùng độ dài) nên ảnh net N phủ ĐÚNG phần ảnh gốc của ảnh đang dùng.
  python3 dung_song_gop.py --net 2|3|4      → ra/net<N>-net/<mã>.png (+ so-do-song-<N>.json). Không ghi vào game.
"""
import sys, os, json, io, base64
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
DAY = os.path.abspath(os.path.join(HERE, '../../../../..'))
GOC = os.path.join(DAY, 'docs/anh-goc/ve-tay-8-gop')

NEN = np.array([3, 248, 3], np.float32)


def png(sh, so_mau=64):
    sh = np.ascontiguousarray(sh)
    op = sh[..., 3] > 0; px = sh[op][:, :3]
    if len(px) and len(set(map(tuple, px.tolist()))) > so_mau:
        q = Image.fromarray(px.reshape(1, -1, 3)).quantize(colors=so_mau, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
        pal = np.array(q.getpalette()[:3 * so_mau]).reshape(-1, 3); sh[op, :3] = pal[np.array(q).ravel()]
    sh[~op] = 0
    b = io.BytesIO(); Image.fromarray(sh, 'RGBA').save(b, 'PNG', optimize=True)
    assert (np.array(Image.open(io.BytesIO(b.getvalue())).convert('RGBA')) == sh).all()
    return b.getvalue()


ANH = {}
def doc(ten):
    if ten not in ANH: ANH[ten] = np.array(Image.open(os.path.join(GOC, ten + '.png')).convert('RGB')).astype(np.float32)
    return ANH[ten]


def nen_mask(rgb): return (rgb[..., 1] - np.maximum(rgb[..., 0], rgb[..., 2])) > 150


def alpha_tach(rgb): return np.clip(1 - (rgb[..., 1] - np.maximum(rgb[..., 0], rgb[..., 2])) / 245.0, 0, 1)


def go_nen(rgb, a):
    return np.clip(np.where(a[..., None] > 0, (rgb - (1 - a[..., None]) * NEN) / np.maximum(a, 1e-3)[..., None], 0), 0, 255)


def tach(rgb, nguong=0.5):
    a = alpha_tach(rgb); o = np.zeros(rgb.shape[:2] + (4,), np.uint8)
    o[..., :3] = go_nen(rgb, a); o[..., 3] = (a >= nguong) * 255
    return o


def chat(rgb, quang=None):
    """Vật cũng có màu lục (lá, cỏ, quầng lục): giữ màu GỐC, bỏ điểm gần màu nền và điểm lục chói sát nền (cách 'chat' của vẽ tay 6).
    quang: (màu, alpha) — điểm lục chói (quầng sáng trộn nền) thành quầng màu đó, alpha đó, thay vì bỏ."""
    d = np.sqrt(((rgb - NEN) ** 2).sum(2)); r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    choi = ((g > 205) & (d < 210)) | ((g > 170) & (g - np.maximum(r, b) > 80))  # lục chói: viền lem nền
    o = np.zeros(rgb.shape[:2] + (4,), np.uint8); o[..., :3] = rgb.astype(np.uint8)
    o[..., 3] = ((d > 70) & ~choi) * 255
    if quang is not None:
        q = choi & (d > 45); o[q, :3] = quang[0]; o[q, 3] = quang[1]
    return o


def sach(o, rgb, loc=None):
    """Điểm đặc: đưa về màu sạch gần nhất (bảng ≤ 40 màu từ điểm gốc không ngả lục của chính vùng rgb)."""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    ok = (g <= np.maximum(r, b) - 10) if loc is None else loc(rgb)
    px = rgb[ok].astype(np.uint8)
    if len(px) < 20: return o
    if len(px) > 200000: px = px[np.random.RandomState(1).choice(len(px), 200000, replace=False)]
    q = Image.fromarray(px.reshape(1, -1, 3)).quantize(colors=40, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[:120], float).reshape(-1, 3)
    op = o[..., 3] > 0; c = o[op][:, :3].astype(float)
    if len(c): o[op, :3] = pal[np.argmin(((c[:, None] - pal[None]) ** 2).sum(2), 1)].astype(np.uint8)
    return o


def gan(o, x0, y0, x1, y1, W, H):
    """NEAREST: ô (x0..x1, y0..y1) ảnh gốc → W×H, mỗi điểm đích = điểm gốc ở giữa ô. Ngoài ảnh → trong suốt."""
    xs = np.floor(x0 + (np.arange(W) + 0.5) * (x1 - x0) / W).astype(int)
    ys = np.floor(y0 + (np.arange(H) + 0.5) * (y1 - y0) / H).astype(int)
    out = np.zeros((H, W, o.shape[2]), o.dtype)
    okx = (xs >= 0) & (xs < o.shape[1]); oky = (ys >= 0) & (ys < o.shape[0])
    out[np.ix_(oky, okx)] = o[ys[oky]][:, xs[okx]]
    return out


def hang(rgb, gop=12):
    on = (~nen_mask(rgb)).sum(1) > 0
    lab, n = ndimage.label(ndimage.binary_closing(on, iterations=gop))
    return [tuple(np.nonzero(lab == i)[0][[0, -1]] + [0, 1]) for i in range(1, n + 1) if (lab == i).sum() > 8]


def khung(rgb, y0, y1, khe=20, x0=0, x1=None):
    sub = ~nen_mask(rgb[y0:y1, x0:x1])
    on = sub.sum(0) > 0
    lab, n = ndimage.label(ndimage.binary_closing(on, iterations=khe // 2))
    out = []
    for i in range(1, n + 1):
        xs = np.nonzero(lab == i)[0]
        if sub[:, xs].sum() < 6: continue
        ys = np.nonzero(sub[:, xs[0]:xs[-1] + 1].any(1))[0]
        out.append((x0 + xs[0], y0 + ys[0], x0 + xs[-1] + 1, y0 + ys[-1] + 1))
    return out


def lay_hang(ten, i_hang, so, khe=20, gop=12):
    rgb = doc(ten); hs = hang(rgb, gop); y0, y1 = hs[i_hang]
    ks = khung(rgb, y0, y1, khe)
    if len(ks) != so:  # khung lẫn hạt lẻ → chia LƯỚI đều theo bề ngang ảnh, hộp các điểm trong từng ô
        W = rgb.shape[1] / so; ks = []
        for i in range(so):
            m = ~nen_mask(rgb[y0:y1, int(i * W):int((i + 1) * W)]); ys, xs = np.nonzero(m)
            ks.append((int(i * W) + xs.min(), y0 + ys.min(), int(i * W) + xs.max() + 1, y0 + ys.max() + 1))
        SO_DO.setdefault('_luoi', []).append([ten, i_hang])
    return rgb, y0, y1, ks


def cat_day(rgb, o, y0, y1, ks, TW, TH, giua='khop', can_y='dai'):
    """Cắt các khung cùng cỡ rồi thu về trong hộp TW×TH (điểm ảnh ảnh), giữ tỉ lệ. Trả về ảnh dải ngang + cỡ khung."""
    cx = np.array([(k[0] + k[2]) / 2 for k in ks])
    if giua == 'khop' and len(ks) > 2:
        p = np.polyfit(np.arange(len(ks)), cx, 1); cx = np.polyval(p, np.arange(len(ks)))
    w = max(max(k[2] - cx[i], cx[i] - k[0]) for i, k in enumerate(ks)) * 2 + 2
    if can_y == 'dai': Y0, Y1 = [y0] * len(ks), [y1] * len(ks)
    else:  # giữa hộp từng khung
        h = max(k[3] - k[1] for k in ks) + 2; cy = [(k[1] + k[3]) / 2 for k in ks]; Y0 = [c - h / 2 for c in cy]; Y1 = [c + h / 2 for c in cy]
    h = Y1[0] - Y0[0]
    z = min(TW / w, TH / h); fw = max(2, int(round(w * z / 2)) * 2); fh = max(2, int(round(h * z / 2)) * 2)
    fr = [gan(o, cx[i] - fw / z / 2, Y0[i], cx[i] + fw / z / 2, Y0[i] + fh / z, fw, fh) for i in range(len(ks))]
    return np.concatenate(fr, 1), fw, fh, z


SO_DO = {}
KET = {}


def ghi_hu(ma, sh, fw, fh, so, giay, lap, ten, goc=None, **them):
    KET[ma] = (sh, dict(hu=1, khung_rong=fw // 2, khung_cao=fh // 2, so=so, giay=giay, lap=lap, ten=ten,
                        goc=goc or [fw / 4, fh / 4], **them))


def ghi_gd(ma, sh, ten, **them):
    KET[ma] = (sh, dict(ten=ten, **them))


def kiem_nen(sh, ma):
    op = sh[..., 3] > 0; c = sh[op][:, :3].astype(int)
    xanh = ((c[:, 1] - np.maximum(c[:, 0], c[:, 2])) > 90).sum()
    SO_DO.setdefault(ma, {})['diem_xanh'] = int(xanh)

def _arg(k, d):
    return sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
N = int(_arg('--net', '2'))
RA = os.path.join(HERE, 'ra', 'net%d-net' % N); os.makedirs(RA, exist_ok=True)
Z = N / 2.0
def nz(v):  # cỡ net 2 → cỡ net N (điểm ảnh ảnh), số nguyên
    return int(round(v * Z))
def chan(v):  # làm tròn về bội của N (= số nguyên điểm game)
    return max(N, int(round(v / N)) * N)
LAP2 = json.load(open(os.path.join(HERE, 'ra', 'net2-net', 'so-do-song.json'))) if N != 2 else None

def cot_nang(ih, ma, ten):
    rgb = doc('g7-phu-man'); y0, y1 = hang(rgb, 4)[ih]; k = khung(rgb, y0, y1, 20)[0]
    sub = rgb[k[1]:k[3], k[0]:k[2]]; m = ~nen_mask(sub)
    a = alpha_tach(sub); col = go_nen(sub, np.maximum(a, 0.5))
    L = col.sum(2); Lm = L[m]
    q1, q2 = np.quantile(Lm, [0.35, 0.75])
    al = np.where(~m, 0, np.where(L >= q2, 77, np.where(L >= q1, 51, 26)))  # 30 / 20 / 10 %
    o = np.zeros(sub.shape[:2] + (4,), np.uint8); o[..., :3] = np.clip(col, 0, 255); o[..., 3] = al
    W = nz(56); H = chan(sub.shape[0] * W / sub.shape[1])
    sh = gan(o, 0, 0, sub.shape[1], sub.shape[0], W, H)
    ghi_gd(ma, sh, ten)


cot_nang(3, 'gd-cot-nang-bien', 'Cột sáng chéo Hang biển (lam nhạt, 30 / 20 / 10 %)')
cot_nang(4, 'gd-cot-nang-lau', 'Cột nắng chéo qua kính màu Lâu đài (vàng ấm, 30 / 20 / 10 %)')


# ======================= G8 tường, cửa, trang trí Sông sâu =======================
rgb = doc('g8-song-tuong-cua')
hs = [(15, 226), (243, 468), (470, 620), (655, 757), (778, 993)]  # cột cọc (hàng 2) chạm hàng cửa → ghi tay dải hàng
ot = sach(tach(rgb, 0.5), rgb)
NEN_TUONG = np.array([26, 42, 34, 255], np.uint8)  # #1a2a22: lau sậy tối phía sau (như mép trên tường code)


def lap_ngang(img, W):
    """Ô lặp ngang: chọn đoạn [x, x+P) có hai mép giống nhau nhất (hàng rào cọc gần tuần hoàn)."""
    a = img.astype(float); best = None
    for P in range(int(img.shape[1] * 0.55), img.shape[1] - 2):
        for x in range(0, img.shape[1] - P - 1, 2):
            d = np.abs(a[:, x] - a[:, x + P]).mean() + np.abs(a[:, x + 1] - a[:, x + P + 1]).mean()
            if best is None or d < best[0]: best = (d, x, P)
    return best


def dac(sh):
    o = sh.copy(); t = o[..., 3] == 0; o[t] = NEN_TUONG; o[..., 3] = 255; return o


y0, y1 = hs[0]; ks = khung(rgb, y0, y1, 30); assert len(ks) == 2, ks
# tường sau: cao 49 điểm game (cap 7 + tường 42) = 98 ảnh; tỉ lệ giữ; rồi cắt đoạn lặp liền
k = ks[0]; H = nz(98); Wf = int(round((k[2] - k[0]) * H / (k[3] - k[1])))
big = dac(gan(ot, k[0], k[1], k[2], k[3], Wf, H))
d, x, P = lap_ngang(big, Wf) if N == 2 else (LAP2['gd-nen-song-tuong-sau']['lech_mep'], nz(LAP2['gd-nen-song-tuong-sau']['doan'][0]), nz(LAP2['gd-nen-song-tuong-sau']['doan'][1]))
if N == 2: P -= P % 2; x -= x % 2
ghi_gd('gd-nen-song-tuong-sau', big[:, x:x + P], 'Tường sau Sông sâu: hàng rào cọc tre + lau sậy (lặp ngang)', o_lap=1)
SO_DO['gd-nen-song-tuong-sau'] = {'doan': [int(x), int(P)], 'lech_mep': round(float(d), 1)}
# tường trước: 12 điểm game; lấy phần hàng rào (bỏ ngọn lau phía trên) của tường thứ hai
k = ks[1]; sub = ~nen_mask(rgb[k[1]:k[3], k[0]:k[2]])
yc = k[1] + int(np.argmax(sub.mean(1) > 0.6))  # hàng đầu tiên phủ > 60% bề ngang = đỉnh cọc
H = nz(24); Wf = int(round((k[2] - k[0]) * H / (k[3] - yc)))
big = dac(gan(ot, k[0], yc, k[2], k[3], Wf, H))
d, x, P = lap_ngang(big, Wf) if N == 2 else (LAP2['gd-nen-song-tuong-truoc']['lech_mep'], nz(LAP2['gd-nen-song-tuong-truoc']['doan'][0]), nz(LAP2['gd-nen-song-tuong-truoc']['doan'][1]))
if N == 2: P -= P % 2; x -= x % 2
ghi_gd('gd-nen-song-tuong-truoc', big[:, x:x + P], 'Tường trước Sông sâu: hàng rào cọc tre thấp (lặp ngang)', o_lap=1)
SO_DO['gd-nen-song-tuong-truoc'] = {'doan': [int(x), int(P)], 'lech_mep': round(float(d), 1), 'dinh_coc_goc': int(yc)}
# tường bên: ảnh chỉ có MỘT cột cọc → lấy đoạn thân cọc giữa (có dây buộc), lặp dọc làm tường bên (14 điểm game)
y0, y1 = hs[1]; ks = khung(rgb, y0, y1, 30, 650, 900)
k = ks[0]
cx = (k[0] + k[2]) / 2; Wg = (k[2] - k[0]) * 0.9
ya = k[1] + (k[3] - k[1]) * 0.18; yb = k[1] + (k[3] - k[1]) * 0.78
big = dac(gan(ot, cx - Wg / 2, ya, cx + Wg / 2, yb, nz(28), nz(128)))
ghi_gd('gd-nen-song-tuong-ben', big, 'Tường bên Sông sâu (TRÁI; phải lật): thân MỘT cột cọc tre lặp dọc (ảnh gen chỉ có một cột)', o_lap=1)
SO_DO['gd-nen-song-tuong-ben'] = {'ghi_chu': 'ảnh gen chỉ có một cột cọc: lấy đoạn thân 18–78% chiều cao, kéo 28×128 ảnh, lặp dọc', 'cot_goc': list(map(int, k))}
# cửa: hàng 3 có 6 hình (trên mở | trên khoá | bên mở | bên khoá | dưới mở | dưới khoá)
y0, y1 = hs[2]; ks = khung(rgb, y0, y1, 12); assert len(ks) == 6, ks


def cua(k, W, ten, ma, xoay=False):
    sub = ot[k[1]:k[3], k[0]:k[2]]
    if xoay: sub = np.rot90(sub, -1)  # cửa bên: xoay để song chắn nằm dọc theo tường
    h, w = sub.shape[:2]
    if xoay:
        Hh = nz(74); img = gan(sub, 0, 0, w, h, W, Hh)
    else:
        Hh = chan(h * W / w); img = gan(sub, 0, 0, w, h, W, Hh)
    ghi_gd(ma, img, ten)


cua(ks[0], nz(84), 'Cửa trên · mở', 'gd-cua-song-tren'); cua(ks[1], nz(84), 'Cửa trên · khoá', 'gd-cua-song-tren-khoa')
cua(ks[2], nz(30), 'Cửa bên · mở (ảnh gen nhìn thẳng → xoay 90°, kéo dọc)', 'gd-cua-song-ben', True); cua(ks[3], nz(30), 'Cửa bên · khoá (xoay 90°)', 'gd-cua-song-ben-khoa', True)
cua(ks[4], nz(92), 'Cửa dưới · mở', 'gd-cua-song-duoi'); cua(ks[5], nz(92), 'Cửa dưới · khoá', 'gd-cua-song-duoi-khoa')
SO_DO['gd-cua-song'] = {'khung_goc': [list(map(int, k)) for k in ks]}
# trang trí
y0, y1 = hs[3]; ks = khung(rgb, y0, y1, 30); assert len(ks) == 2, ks
for k, ma, W, ten in [(ks[0], 'gd-tt-song-coc', nz(20), 'Cọc tre buộc thuyền'), (ks[1], 'gd-tt-song-da-bun', nz(30), 'Cụm đá bùn')]:
    sub = ot[k[1]:k[3], k[0]:k[2]]; h, w = sub.shape[:2]; H = chan(h * W / w)
    ghi_gd(ma, gan(sub, 0, 0, w, h, W, H), ten)
y0, y1 = hs[4]; ks = khung(rgb, y0, y1, 30); assert len(ks) == 2, ks
for k, ma, ten in [(ks[0], 'gd-tt-song-tien-canh-phai', 'Tiền cảnh lau sậy (ngả phải)'), (ks[1], 'gd-tt-song-tien-canh-trai', 'Tiền cảnh lau sậy (ngả trái)')]:
    sub = ot[k[1]:k[3], k[0]:k[2]]; h, w = sub.shape[:2]; W = nz(80); H = chan(h * W / w)
    ghi_gd(ma, gan(sub, 0, 0, w, h, W, H), ten)



# ======================= G6 ô lặp: cầu, mép sàn tiếp nước, nước ngoài phòng (chép từ dung-gop.py) =======================
rgb = doc('g6-o-lap'); hs = hang(rgb)
o = np.dstack([rgb, np.full(rgb.shape[:2], 255.0)]).astype(np.uint8)
y0, y1 = hs[4]; ks = khung(rgb, y0, y1, 20); k = ks[0]
ot = sach(tach(rgb, 0.5), rgb[y0:y1])
w = k[2] - k[0]; h = k[3] - k[1]; W = nz(124); H = chan(h * W / w)
ghi_gd('gd-song-cau', gan(ot, k[0], k[1], k[2], k[3], W, H), 'Cầu ván tre')
y0, y1 = hs[5]; ks = khung(rgb, y0, y1, 20); k = ks[0]
ghi_gd('gd-nen-song-mep', gan(o, k[0] + 1, k[1] + 1, k[2] - 1, k[3] - 1, nz(128), nz(24)), 'Mép sàn ván tiếp nước (lặp ngang)')
y0, y1 = hs[6]; ks = khung(rgb, y0, y1, 20); k = ks[0]
ghi_gd('gd-nen-song-ngoai', gan(o, k[0] + 1, k[1] + 1, k[2] - 1, k[3] - 1, nz(128), nz(128)), 'Nước đục ngoài phòng (lặp hai chiều)')


# ======================= ghi ảnh (không ghi vào game) =======================
for ma, (sh, meta) in KET.items():
    sh = np.ascontiguousarray(sh)
    data = png(sh.copy(), 64)
    y = np.array(Image.open(io.BytesIO(data)).convert('RGBA'))
    Image.fromarray(y).save(os.path.join(RA, ma + '.png'))
    SO_DO.setdefault(ma, {}).update({'co_anh': [sh.shape[1], sh.shape[0]], 'png': len(data)})
    print(ma, SO_DO[ma])
json.dump(SO_DO, open(os.path.join(RA, 'so-do-song.json'), 'w'), ensure_ascii=False, indent=1, default=float)
