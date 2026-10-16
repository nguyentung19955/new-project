"""Vẽ tay 8 gộp (trận) 16/10: cắt 7 ảnh gộp chủ game gen (docs/anh-goc/ve-tay-8-gop/g2..g8, nền #00FF00) thành
game/art/custom/<mã>.sprite.json.     python3 dung-gop.py [--ghi]     (không --ghi: chỉ ghi vào cong-cu/ra/ để xem)

Cùng cách ../../ve-tay-8-dot-1/cong-cu/dung-hud.py:
 - THU NHỎ NEAREST NEIGHBOR: mỗi điểm đích lấy đúng 1 điểm gốc ở giữa ô → cạnh pixel sắc, không trộn màu.
 - Khử nền 'tach' (vẽ tay 6): a = 1 − (lục − max(đỏ, lam)) / 245; tách màu nền ra; a < 0,5 → trong suốt.
 - Mép trộn nền xanh: đưa về màu SẠCH gần nhất của chính hàng đó (sach()).
 - Ảnh nhiều nấc alpha (quầng, sương, viền đỏ, bóng, cột nắng): giữ alpha (lượng tử vài nấc) thay vì 0 / 255.
Mỗi ảnh gộp: tách HÀNG theo dải ngang không phải nền, tách KHUNG trong hàng theo cột (gộp khe < 'khe' điểm ảnh gốc).
Khung cắt cùng cỡ: rộng = khung rộng nhất, giữa = đường thẳng khớp tâm các khung (đỡ rung), cao = cả dải hàng (giữ chuyển động dọc).
Cỡ đích (điểm ảnh ẢNH, net 2 = gấp đôi điểm game) ghi ở bảng dưới; vừa trong hộp, giữ tỉ lệ (trừ ô lặp: kéo đúng cỡ).
Số đo ra cong-cu/ra/so-do.json, ảnh xem ra cong-cu/ra/<mã>.png, ảnh lát 3×3 của ô lặp ra cong-cu/ra/lat-<mã>.png.
"""
import sys, os, json, io, base64
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
DAY = os.path.abspath(os.path.join(HERE, '../../../../..'))
GOC = os.path.join(DAY, 'docs/anh-goc/ve-tay-8-gop')
GHI = '--ghi' in sys.argv
RA = os.path.join(HERE, 'ra'); os.makedirs(RA, exist_ok=True)
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


def hu_thuong(ten, ih, so, ma, TW, TH, giay, lap, mo_ta, khe=20, nguong=0.5, giua='khop', can_y='dai', mau_sach=True, goc_day=False, khu='tach', quang=None, **them):
    rgb, y0, y1, ks = lay_hang(ten, ih, so, khe)
    o = tach(rgb, nguong) if khu == 'tach' else chat(rgb, quang)
    sh, fw, fh, z = cat_day(rgb, o, y0, y1, ks, TW, TH, giua, can_y)
    if mau_sach and khu == 'tach': sh = sach(sh, rgb[y0:y1])
    goc = [fw / 4, fh / 2 - 0.5] if goc_day else None  # neo giữa ĐÁY (điểm game)
    ghi_hu(ma, sh, fw, fh, so, giay, lap, mo_ta, goc, **them)
    SO_DO.setdefault(ma, {}).update({'hang_goc': [int(y0), int(y1)], 'khung_goc': [list(map(int, k)) for k in ks], 'thu': round(z, 4)})
    return sh


# ======================= G2 lửa =======================
hu_thuong('g2-lua', 0, 4, 'hu-luoi-lua', 8, 14, 0.4, True, 'Lưỡi lửa nhỏ nhảy (vùng cháy, trạng thái cháy, chém Lửa; thay fx.js tongue; neo giữa đáy)', goc_day=True)
hu_thuong('g2-lua', 1, 6, 'hu-lua-bung', 32, 48, 0.6, True, 'Ngọn lửa bùng nhiều lớp (Hồ Tinh / Hổ Lửa F.lua; neo giữa đáy)', goc_day=True)
hu_thuong('g2-lua', 2, 6, 'hu-lang-tia-lo', 12, 24, 1.2, True, 'Tia lửa lò rèn bay lên (làng ambLight; neo giữa đáy)', goc_day=True)
hu_thuong('g2-lua', 3, 6, 'hu-vung-dau-chay', 64, 28, 0.6, True, 'Vệt dầu cháy + đèn đổ (Sông sâu, đèn dầu bị đập; neo giữa)', khe=10)

# ======================= G3 nước =======================
hu_thuong('g3-nuoc', 0, 6, 'hu-gon-nuoc', 40, 20, 1.3, False, 'Vòng gợn nước lan ra + vệt sáng (vũng nước, sông làng; neo giữa)', can_y='hop')
hu_thuong('g3-nuoc', 1, 6, 'hu-moi-truong-bien-giot', 12, 32, 1.4, False, 'Giọt nước nhũ đá Hang biển: đọng, rơi, toé (neo giữa ĐỈNH = chóp nhũ đá)', goc_day=False)
KET['hu-moi-truong-bien-giot'][1]['goc'] = [KET['hu-moi-truong-bien-giot'][1]['khung_rong'] / 2, 0]
# nước dâng: ô lặp trái-phải, 4 khung 48×24 (lấy trọn mỗi tấm, kéo đúng cỡ)
rgb, y0, y1, ks = lay_hang('g3-nuoc', 2, 4)
o = np.dstack([rgb, np.full(rgb.shape[:2], 255.0)]).astype(np.uint8)
fr = [gan(o, k[0] + 1, k[1] + 1, k[2] - 1, k[3] - 1, 48, 24) for k in ks]
sh = np.concatenate(fr, 1); sh[..., 3] = 255
ghi_hu('hu-nuoc-dang', sh, 48, 24, 4, 0.8, True, 'Nước dâng trận Ngư Tinh: ô lặp ngang, mép bọt ở trên (game lát + đặt 62% như cũ)', [0, 0], o_lap=1)
hu_thuong('g3-nuoc', 3, 4, 'hu-song-vung-sau', 104, 56, 1.2, True, 'Vũng nước sâu Sông sâu (bầu dục, game kéo theo rx, ry; neo giữa)', can_y='hop')

# ======================= G4 trắng =======================
hu_thuong('g4-trang', 0, 4, 'hu-tia-gay', 64, 16, 0.3, False, 'Tia gãy khúc trắng (Mộc Tinh F.set; nhuộm theo màu cũ; neo giữa mép trái)')
KET['hu-tia-gay'][1]['goc'] = [0, KET['hu-tia-gay'][1]['khung_cao'] / 2]
hu_thuong('g4-trang', 1, 4, 'hu-vet-vung', 64, 40, 0.3, False, 'Vệt vung vũ khí trắng (nhuộm màu hệ; thay trailDraw; xoay theo hướng lưỡi; neo giữa)', khe=40, xoay=True)
# hạt bụi: các khung lẫn vào nhau → tách theo ĐỐM, mỗi đốm một khung, chọn 8 khung theo thứ tự trái → phải
rgb = doc('g4-trang'); y0, y1 = hang(rgb)[2]
m = ~nen_mask(rgb[y0:y1]); lab, n = ndimage.label(ndimage.binary_dilation(m, iterations=3))
dom = sorted([ndimage.find_objects(lab)[i] for i in range(n)], key=lambda s: s[1].start)
dom = [d for d in dom if (lab[d] > 0).sum() > 10]
SO_DO['hu-hat-bui'] = {'so_dom': len(dom)}
# 8 đốm có sáng nhất (chấm chữ thập / chấm vuông), giữ thứ tự trái → phải
sang = [rgb[y0:y1][d][..., 0].max() for d in dom]
chon = sorted(sorted(range(len(dom)), key=lambda i: -sang[i])[:8])
o = tach(rgb, 0.5); S = 30
fr = []
for i in chon:
    d = dom[i]; cy = y0 + (d[0].start + d[0].stop) / 2; cx = (d[1].start + d[1].stop) / 2
    fr.append(gan(o, cx - S / 2, cy - S / 2, cx + S / 2, cy + S / 2, 12, 12))
sh = np.concatenate(fr, 1); sh[sh[..., 3] > 0, :3] = 255  # bụi trắng → game nhuộm
ghi_hu('hu-hat-bui', sh, 12, 12, 8, 1.6, True, 'Hạt bụi / phấn trắng nhấp nháy (nhuộm màu từng vùng; thay mote, hạt trong cột sáng)')
SO_DO['hu-hat-bui'].update({'dom_chon': [[int(y0 + dom[i][0].start), int(dom[i][1].start)] for i in chon]})
# sương: alpha theo độ sáng (sương mỏng trộn nền), màu trắng
rgb, y0, y1, ks = lay_hang('g4-trang', 3, 4, khe=10)
a = alpha_tach(rgb); o = np.zeros(rgb.shape[:2] + (4,), np.uint8); o[..., :3] = 255
o[..., 3] = np.where(a > 0.6, 70, np.where(a > 0.35, 40, np.where(a > 0.15, 18, 0)))
sh, fw, fh, z = cat_day(rgb, o, y0, y1, ks, 64, 10)
ghi_hu('hu-suong-dai', sh, fw, fh, 4, 2.0, True, 'Dải sương trắng mỏng (alpha 7 / 16 / 27 %; nhuộm màu từng vùng; thay emist / mist)')
# quầng sáng: bị pha nền xanh → dựng lại alpha từ độ sáng (kênh đỏ: nền ≈ 3, trắng 255), màu trắng
rgb, y0, y1, ks = lay_hang('g4-trang', 4, 4)
L = rgb[..., 0]; a = np.clip((L - 8) / 240.0, 0, 1)
o = np.zeros(rgb.shape[:2] + (4,), np.uint8); o[..., :3] = 255
lv = np.array([0, 20, 46, 77, 110]); o[..., 3] = lv[np.argmin(np.abs(a[..., None] * 110 - lv), 2)]  # nấc: 0 / 8 / 18 / 30 / 43 %
sh, fw, fh, z = cat_day(rgb, o, y0, y1, ks, 40, 28, can_y='hop')
ghi_hu('hu-quang-den', sh, fw, fh, 4, 0.8, True, 'Quầng sáng trắng (đèn lồng, đuốc, cửa sổ; game nhuộm màu ấm + chỉnh độ đậm; neo giữa)')
SO_DO['hu-quang-den'] = {'khung_goc': [list(map(int, k)) for k in ks]}
hu_thuong('g4-trang', 5, 6, 'hu-bia-hat', 24, 24, 1.2, True, 'Hạt sáng / vệt mưa trôi trên tranh bìa (màn chào)', mau_sach=False)

# ======================= G5 vật Sông sâu =======================
hu_thuong('g5-vat-song', 0, 4, 'hu-vat-luc-binh', 56, 44, 1.6, True, 'Lục bình nổi + quầng tím (vật bấm Độc, Sông sâu; neo giữa đáy)', goc_day=True, khe=30, khu='chat')
hu_thuong('g5-vat-song', 1, 4, 'hu-vat-den-dau', 44, 80, 1.2, True, 'Cọc tre treo đèn dầu + quầng cam (vật bấm Lửa, Sông sâu; neo ở chân cọc)', khe=30, khu='chat')
hu_thuong('g5-vat-song', 2, 4, 'hu-bom-song', 16, 16, 0.5, True, 'Quả bom bầu bọc rong (Ma Da ném; neo giữa)', khe=30, can_y='hop')
hu_thuong('g5-vat-song', 3, 6, 'hu-vung-luc-binh', 112, 52, 3.0, False, 'Vũng độc lục bình (6 khung mờ dần trong 3 giây; game kéo theo bán kính; neo giữa)', khe=10, can_y='hop', khu='chat')
hu_thuong('g5-vat-song', 4, 4, 'hu-moi-truong-rung-co-lay', 10, 12, 1.0, True, 'Khóm cỏ lay sát tường Rừng già (neo giữa đáy)', goc_day=True, khe=30, khu='chat')
hu_thuong('g5-vat-song', 5, 6, 'hu-moi-truong-rung-nam-sang', 24, 28, 1.6, True, 'Quầng lục dưới nấm sáng + bào tử bay (Rừng già; neo giữa đáy)', goc_day=True, khe=30, khu='chat', quang=((176, 240, 112), 64))

# chân cọc đèn dầu: cột cọc là cột đặc dài nhất bên trái → neo ở chân cọc (đáy ảnh, x cọc)
sh = KET['hu-vat-den-dau'][0]; fw = KET['hu-vat-den-dau'][1]['khung_rong'] * 2
col = (sh[:, :fw, 3] > 0).sum(0); xc = int(np.argmax(col[: fw // 2 + 4]))
KET['hu-vat-den-dau'][1]['goc'] = [round(xc / 2, 1), KET['hu-vat-den-dau'][1]['khung_cao'] - 1]

# ======================= G6 ô lặp (chỉ Sông sâu: hàng 4–7) =======================
rgb = doc('g6-o-lap'); hs = hang(rgb)
o = np.dstack([rgb, np.full(rgb.shape[:2], 255.0)]).astype(np.uint8)
# dòng chảy: 4 khung, mỗi tấm vuông đặc; lấy trọn tấm → 112×112 (dải dọc 56 điểm game), mũi tên chảy XUỐNG
y0, y1 = hs[3]; ks = khung(rgb, y0, y1, 20); assert len(ks) == 4, ks
fr = [gan(o, k[0] + 1, k[1] + 4, k[2] - 1, k[3] - 4, 112, 112) for k in ks]  # bỏ hàng viền tối trên / dưới tấm (lộ đường nối khi lát dọc)
sh = np.concatenate(fr, 1); sh[..., 3] = 255
ghi_hu('hu-song-dong', sh, 112, 112, 4, 1.2, True, 'Dòng nước Sông sâu: ô lặp DỌC, mũi tên chảy xuống (game kéo theo bề rộng dải, cuộn theo tốc dòng; dải ngang xoay 90°)', [0, 0], o_lap=1)
# cầu: 1 tấm, bỏ nền
y0, y1 = hs[4]; ks = khung(rgb, y0, y1, 20); k = ks[0]
ot = sach(tach(rgb, 0.5), rgb[y0:y1])
w = k[2] - k[0]; h = k[3] - k[1]; W = 124; H = int(round(h * W / w / 2)) * 2
ghi_gd('gd-song-cau', gan(ot, k[0], k[1], k[2], k[3], W, H), 'Cầu ván tre (dòng dọc: nằm ngang như ảnh; dòng ngang: game xoay 90°)')
# mép sàn tiếp nước: 64×12 điểm game lặp ngang
y0, y1 = hs[5]; ks = khung(rgb, y0, y1, 20); k = ks[0]
ghi_gd('gd-nen-song-mep', gan(o, k[0] + 1, k[1] + 1, k[2] - 1, k[3] - 1, 128, 24), 'Mép sàn ván tiếp nước (lặp ngang)', o_lap=1)
# nước ngoài phòng: 64×64 lặp hai chiều
y0, y1 = hs[6]; ks = khung(rgb, y0, y1, 20); k = ks[0]
ghi_gd('gd-nen-song-ngoai', gan(o, k[0] + 1, k[1] + 1, k[2] - 1, k[3] - 1, 128, 128), 'Nước đục ngoài phòng (lặp hai chiều)', o_lap=2)


# ======================= G7 phủ màn =======================
rgb = doc('g7-phu-man'); hs = hang(rgb, 4)
y0, y1 = hs[0]; ks = khung(rgb, y0, y1, 20); assert len(ks) == 3, ks
ot = sach(tach(rgb, 0.5), rgb[y0:y1])
k = ks[0]; tile = gan(ot, k[0] + (k[2] - k[0]) * 0.3, k[1], k[0] + (k[2] - k[0]) * 0.7, k[3], 64, 10)  # giữa dải (bỏ đầu bo tròn) → lặp
k = ks[1]; orn = gan(ot, k[0], k[1], k[2], k[3], 48, int(round((k[3] - k[1]) * 48 / (k[2] - k[0]) / 2)) * 2)
k = ks[2]; fl = np.zeros((10, 64, 4), np.uint8); fl[...] = 255
ghi_gd('gd-ruot-thanh-trum', tile, 'Ruột thanh máu trùm (lặp ngang, 32×5 điểm game)', o_lap=1)
ghi_gd('gd-trum-vach-ten', orn, 'Vạch trang trí đồng hai bên tên trùm (ảnh cho bên PHẢI; bên trái lật)')
SO_DO['gd-ruot-thanh-trum'] = {'chop': 'dải trắng thuần → game dùng ô trắng (không cần ảnh)'}
# viền đỏ màn hình: giải màu trộn với #00FF00 → alpha thật
y0, y1 = hs[1]; ks = khung(rgb, y0, y1, 20); k = ks[0]
sub = rgb[k[1]:k[3], k[0]:k[2]]
a = np.clip((sub[..., 0] - 3) / (200 - 3), 0, 1)  # đỏ thuần #c8140a ≈ (200, 20, 10); kênh đỏ của nền ≈ 3
a = np.where(a < 0.06, 0, a)
o = np.zeros(sub.shape[:2] + (4,), np.uint8); o[..., 0] = 200; o[..., 1] = 20; o[..., 2] = 10
lv = np.array([0, 20, 51, 102, 153, 230]); o[..., 3] = lv[np.argmin(np.abs(a[..., None] * 255 - lv), 2)]
ghi_gd('gd-vien-man-do', gan(o, 0, 0, sub.shape[1], sub.shape[0], 240, 136), 'Viền đỏ màn hình (máu thấp / trúng đòn / trùm nổi giận; game kéo phủ màn)', net=1)
SO_DO['gd-vien-man-do'] = {'hop_goc': list(map(int, k))}
# bóng khung: chỉ có góc dưới phải → dựng 9 mảnh 48×48 (điểm ảnh ảnh, net 2 → 24×24 game) từ góc đó
y0, y1 = hs[2]; ks = khung(rgb, y0, y1, 20); k = ks[0]
sub = rgb[k[1]:k[3], k[0]:k[2]]
g = sub[..., 1]; toi = np.clip((248 - g) / 248.0, 0, 1) * (np.maximum(sub[..., 0], sub[..., 2]) < 120)
lv = np.array([0, 20, 51, 89]); al = lv[np.argmin(np.abs(toi[..., None] * 89 - lv), 2)]  # 0 / 8 / 20 / 35 %
# độ dày nét bóng (điểm ảnh gốc): cột phải / hàng dưới có bóng
cot = np.nonzero((al > 0).sum(0) > (al.shape[0] * 0.5))[0]; hng = np.nonzero((al > 0).sum(1) > (al.shape[1] * 0.5))[0]
dx = cot[-1] - cot[0] + 1 if len(cot) else 12; dy = hng[-1] - hng[0] + 1 if len(hng) else 12
z = 6 / max(dx, dy)  # nét bóng = 6 điểm ảnh ảnh (3 điểm game)
gc = al[-int(round(24 / z)):, -int(round(24 / z)):]  # góc dưới phải 24×24 ảnh
goc_dp = gan(gc[..., None], 0, 0, gc.shape[1], gc.shape[0], 24, 24)[..., 0]
cv = np.zeros((48, 48), np.uint8)
cv[24:, 24:] = goc_dp
cv[24:, :24] = np.tile(goc_dp[:, :1], (1, 24))  # cạnh dưới: lặp cột trái của góc
cv[:24, 24:] = np.tile(goc_dp[:1, :], (24, 1))   # cạnh phải: lặp hàng trên của góc
cv[:6, 24:] = 0; cv[24:, :6] = 0                  # bóng lệch xuống phải: hai đầu xa trống
o = np.zeros((48, 48, 4), np.uint8); o[..., 3] = cv
ghi_gd('gd-bong-khung', o, 'Bóng đổ khung giao diện (9 mảnh, lệch xuống phải; đen 35 / 20 / 8 %)', vien=[6, 6, 6, 6])
SO_DO['gd-bong-khung'] = {'net_bong_goc': [int(dx), int(dy)]}


def cot_nang(ih, ma, ten):
    rgb = doc('g7-phu-man'); y0, y1 = hang(rgb, 4)[ih]; k = khung(rgb, y0, y1, 20)[0]
    sub = rgb[k[1]:k[3], k[0]:k[2]]; m = ~nen_mask(sub)
    a = alpha_tach(sub); col = go_nen(sub, np.maximum(a, 0.5))
    L = col.sum(2); Lm = L[m]
    q1, q2 = np.quantile(Lm, [0.35, 0.75])
    al = np.where(~m, 0, np.where(L >= q2, 77, np.where(L >= q1, 51, 26)))  # 30 / 20 / 10 %
    o = np.zeros(sub.shape[:2] + (4,), np.uint8); o[..., :3] = np.clip(col, 0, 255); o[..., 3] = al
    W = 56; H = int(round(sub.shape[0] * W / sub.shape[1] / 2)) * 2
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
k = ks[0]; H = 98; Wf = int(round((k[2] - k[0]) * H / (k[3] - k[1])))
big = dac(gan(ot, k[0], k[1], k[2], k[3], Wf, H))
d, x, P = lap_ngang(big, Wf); P -= P % 2; x -= x % 2
ghi_gd('gd-nen-song-tuong-sau', big[:, x:x + P], 'Tường sau Sông sâu: hàng rào cọc tre + lau sậy (lặp ngang)', o_lap=1)
SO_DO['gd-nen-song-tuong-sau'] = {'doan': [int(x), int(P)], 'lech_mep': round(float(d), 1)}
# tường trước: 12 điểm game; lấy phần hàng rào (bỏ ngọn lau phía trên) của tường thứ hai
k = ks[1]; sub = ~nen_mask(rgb[k[1]:k[3], k[0]:k[2]])
yc = k[1] + int(np.argmax(sub.mean(1) > 0.6))  # hàng đầu tiên phủ > 60% bề ngang = đỉnh cọc
H = 24; Wf = int(round((k[2] - k[0]) * H / (k[3] - yc)))
big = dac(gan(ot, k[0], yc, k[2], k[3], Wf, H))
d, x, P = lap_ngang(big, Wf); P -= P % 2; x -= x % 2
ghi_gd('gd-nen-song-tuong-truoc', big[:, x:x + P], 'Tường trước Sông sâu: hàng rào cọc tre thấp (lặp ngang)', o_lap=1)
SO_DO['gd-nen-song-tuong-truoc'] = {'doan': [int(x), int(P)], 'lech_mep': round(float(d), 1), 'dinh_coc_goc': int(yc)}
# tường bên: ảnh chỉ có MỘT cột cọc → lấy đoạn thân cọc giữa (có dây buộc), lặp dọc làm tường bên (14 điểm game)
y0, y1 = hs[1]; ks = khung(rgb, y0, y1, 30, 650, 900)
k = ks[0]
cx = (k[0] + k[2]) / 2; Wg = (k[2] - k[0]) * 0.9
ya = k[1] + (k[3] - k[1]) * 0.18; yb = k[1] + (k[3] - k[1]) * 0.78
big = dac(gan(ot, cx - Wg / 2, ya, cx + Wg / 2, yb, 28, 128))
ghi_gd('gd-nen-song-tuong-ben', big, 'Tường bên Sông sâu (TRÁI; phải lật): thân MỘT cột cọc tre lặp dọc (ảnh gen chỉ có một cột)', o_lap=1)
SO_DO['gd-nen-song-tuong-ben'] = {'ghi_chu': 'ảnh gen chỉ có một cột cọc: lấy đoạn thân 18–78% chiều cao, kéo 28×128 ảnh, lặp dọc', 'cot_goc': list(map(int, k))}
# cửa: hàng 3 có 6 hình (trên mở | trên khoá | bên mở | bên khoá | dưới mở | dưới khoá)
y0, y1 = hs[2]; ks = khung(rgb, y0, y1, 12); assert len(ks) == 6, ks


def cua(k, W, ten, ma, xoay=False):
    sub = ot[k[1]:k[3], k[0]:k[2]]
    if xoay: sub = np.rot90(sub, -1)  # cửa bên: xoay để song chắn nằm dọc theo tường
    h, w = sub.shape[:2]
    if xoay:
        Hh = 74; img = gan(sub, 0, 0, w, h, W, Hh)
    else:
        Hh = int(round(h * W / w / 2)) * 2; img = gan(sub, 0, 0, w, h, W, Hh)
    ghi_gd(ma, img, ten)


cua(ks[0], 84, 'Cửa trên · mở', 'gd-cua-song-tren'); cua(ks[1], 84, 'Cửa trên · khoá', 'gd-cua-song-tren-khoa')
cua(ks[2], 30, 'Cửa bên · mở (ảnh gen nhìn thẳng → xoay 90°, kéo dọc)', 'gd-cua-song-ben', True); cua(ks[3], 30, 'Cửa bên · khoá (xoay 90°)', 'gd-cua-song-ben-khoa', True)
cua(ks[4], 92, 'Cửa dưới · mở', 'gd-cua-song-duoi'); cua(ks[5], 92, 'Cửa dưới · khoá', 'gd-cua-song-duoi-khoa')
SO_DO['gd-cua-song'] = {'khung_goc': [list(map(int, k)) for k in ks]}
# trang trí
y0, y1 = hs[3]; ks = khung(rgb, y0, y1, 30); assert len(ks) == 2, ks
for k, ma, W, ten in [(ks[0], 'gd-tt-song-coc', 20, 'Cọc tre buộc thuyền'), (ks[1], 'gd-tt-song-da-bun', 30, 'Cụm đá bùn')]:
    sub = ot[k[1]:k[3], k[0]:k[2]]; h, w = sub.shape[:2]; H = int(round(h * W / w / 2)) * 2
    ghi_gd(ma, gan(sub, 0, 0, w, h, W, H), ten)
y0, y1 = hs[4]; ks = khung(rgb, y0, y1, 30); assert len(ks) == 2, ks
for k, ma, ten in [(ks[0], 'gd-tt-song-tien-canh-phai', 'Tiền cảnh lau sậy (ngả phải)'), (ks[1], 'gd-tt-song-tien-canh-trai', 'Tiền cảnh lau sậy (ngả trái)')]:
    sub = ot[k[1]:k[3], k[0]:k[2]]; h, w = sub.shape[:2]; W = 80; H = int(round(h * W / w / 2)) * 2
    ghi_gd(ma, gan(sub, 0, 0, w, h, W, H), ten)


# ======================= ghi =======================
def lat33(sh, ma, fw, fh, kieu):
    t = sh[:fh, :fw]
    big = np.tile(t, (3, 3, 1)) if kieu == 2 else (np.tile(t, (3, 3, 1)) if kieu == 1 else t)
    Image.fromarray(big).resize((big.shape[1] * 3, big.shape[0] * 3), Image.NEAREST).save(os.path.join(RA, 'lat-' + ma + '.png'))


VUNG = {'hu-song-dong': 'song', 'hu-song-vung-sau': 'song', 'hu-vat-luc-binh': 'song', 'hu-vat-den-dau': 'song', 'hu-vung-luc-binh': 'song',
        'hu-vung-dau-chay': 'song', 'hu-bom-song': 'song', 'hu-moi-truong-rung-co-lay': 'rung', 'hu-moi-truong-rung-nam-sang': 'rung',
        'hu-moi-truong-bien-giot': 'bien'}  # tải theo vùng (build.py vung_rieng)
for ma, (sh, meta) in KET.items():
    o_lap = meta.pop('o_lap', 0)
    if ma in VUNG: meta['vung'] = VUNG[ma]
    kiem_nen(sh, ma)
    data = png(np.ascontiguousarray(sh), 48 if ma in ('hu-suong-dai', 'hu-quang-den', 'gd-vien-man-do', 'gd-bong-khung', 'hu-hat-bui') else 64)
    if meta.pop('hu', 0):
        t = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'doi_tuong': 'hieu-ung', 'ma': ma, 'ten': meta.pop('ten'), 'net': 2,
             'xoay': False, 'co': 1, 'tron': 'thuong', 'tam': 'data:image/png;base64,' + base64.b64encode(data).decode(), **meta}
        if o_lap: lat33(sh, ma, meta['khung_rong'] * 2, meta['khung_cao'] * 2, o_lap)
    else:
        net = meta.pop('net', 2)
        t = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'ma': ma, 'ten': meta.pop('ten'), 'doi_tuong': 'giao-dien',
             'rong': sh.shape[1] // net, 'cao': sh.shape[0] // net, 'net': net, **meta, 'anh': 'data:image/png;base64,' + base64.b64encode(data).decode()}
        if o_lap: lat33(sh, ma, sh.shape[1], sh.shape[0], o_lap)
    Image.fromarray(np.ascontiguousarray(sh)).save(os.path.join(RA, ma + '.png'))
    ra = os.path.join(DAY, 'game/art/custom', ma + '.sprite.json') if GHI else os.path.join(RA, ma + '.sprite.json')
    json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    SO_DO.setdefault(ma, {}).update({'co_anh': [sh.shape[1], sh.shape[0]], 'png': len(data), 'byte': os.path.getsize(ra)})
    print(ma, {k: v for k, v in SO_DO[ma].items() if k in ('co_anh', 'byte', 'diem_xanh', 'thu')})
json.dump(SO_DO, open(os.path.join(RA, 'so-do.json'), 'w'), ensure_ascii=False, indent=1, default=float)
print('tổng byte', sum(v.get('byte', 0) for v in SO_DO.values() if isinstance(v, dict)))
