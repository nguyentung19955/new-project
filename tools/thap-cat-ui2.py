# -*- coding: utf-8 -*-
"""TURRET MERGE — cắt ảnh HUD TRẬN ANIME "Royal Twilight" (09/11, B2) từ tấm ChatGPT:
  docs/demo-hop-tuong/thap-art/raw_ui2_hud.png       → ha_top (thanh trên 3 khoang, bỏ vương miện), ha_canh (băng cảnh báo mảnh),
                                                       ha_trieu (nút SUMMON tròn), ha_o_rong (ô mana), ha_o_vuong (nút vuông / khung chỉ huy)
  docs/demo-hop-tuong/thap-art/raw_ui2_khung_bac.png → ha_khung_{trang,xanh,tim,vang,do} (khung thẻ theo bậc, dáng riêng)
  docs/demo-hop-tuong/thap-art/raw_ui2_ban.png       → ha_nen.jpg (trời hoàng hôn + vòng phép, KHÔNG lấy đường/bàn trong ảnh),
                                                       ha_khay (mặt bàn 5×3 — kéo theo toạ độ ô THẬT KHAY_COT/KHAY_HANG của data.js),
                                                       ha_duong (đoạn đường thẳng, không mũi tên) + ha_goc (góc: uốn cong chính đoạn thẳng)
  docs/demo-hop-tuong/thap-art/raw_ui2_icon_taisan.png → ha_mana (icon MANA lục giác teal #25D6C0 tia sét)
  ảnh có sẵn →
               ha_ic_dung / ha_ic_toc (cắt hình 2 vạch / mũi tên khỏi phím thép cũ), ha_mau_trum (thanh máu trùm #D55BEA phân đoạn).
Khoá magenta (tach_nen của thap-cat-hinh.py) → xén → thu Lanczos nhân-trước-alpha về 3× cỡ CSS lớn nhất (không vượt ảnh gốc).
Chạy: python3 tools/thap-cat-ui2.py   (ghi thap/assets/ha_*.png|jpg + tờ xem docs/demo-hop-tuong/tuvan/huong-anime/cat_ui2.jpg)
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as nd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NGUON = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art')
DICH = os.path.join(GOC, 'thap/assets')
XEM = os.path.join(GOC, 'docs/demo-hop-tuong/tuvan/huong-anime')
_src = open(os.path.join(GOC, 'tools/thap-cat-hinh.py'), encoding='utf-8').read().split('\n')
exec('\n'.join(_src[17:58]))  # def tach_nen(im, mau)
DA = []


def raw(ten):
    return Image.open(os.path.join(NGUON, ten)).convert('RGB')


def xen(im, nguong=8):
    a = np.asarray(im)[..., 3]
    ys, xs = np.nonzero(a > nguong)
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


def thu(im, w, h=None):
    """Lanczos nhân-trước-alpha (không viền tối quanh mép trong suốt)."""
    if h is None:
        h = max(1, round(im.size[1] * w / im.size[0]))
    a = np.asarray(im.convert('RGBA')).astype(np.float32) / 255
    p = np.dstack([a[..., :3] * a[..., 3:4], a[..., 3:4]])
    ch = [Image.fromarray(p[..., i], 'F').resize((w, h), Image.LANCZOS) for i in range(4)]
    q = np.dstack([np.asarray(c) for c in ch])
    al = np.clip(q[..., 3:4], 0, 1)
    rgb = np.where(al > 1e-4, q[..., :3] / np.maximum(al, 1e-4), 0)
    return Image.fromarray((np.dstack([np.clip(rgb, 0, 1), al]) * 255 + 0.5).astype(np.uint8), 'RGBA')


def luu(im, ten, ghi=''):
    p = os.path.join(DICH, ten)
    if ten.endswith('.jpg'):
        im.convert('RGB').save(p, quality=86, optimize=True, progressive=True)
    else:
        im.save(p, optimize=True)
    DA.append((ten, im))
    print('%-22s %4dx%-4d %6.0f KB  %s' % (ten, im.size[0], im.size[1], os.path.getsize(p) / 1024, ghi))


# ---------------- 1. tấm HUD ----------------
H = raw('raw_ui2_hud.png')
Ha = np.asarray(H).copy()
# thanh trên: bỏ vương miện giữa (x 450..805, y 100..195) — chép cột viền phẳng x=440 sang ngang (viền thanh + mép trên khoang giữa)
for y in range(96, 196):
    for x in range(448, 810):
        Ha[y, x] = Ha[y, 440]
H2 = Image.fromarray(Ha)
top = tach_nen(H2.crop((10, 140, 1244, 326)), 'tim')
top = xen(top)
# 430 css px rộng × 3 → 1290 > ảnh gốc 1222: giữ cỡ gốc; ép dọc 0.92 (thanh 56 css px thay vì 61 — kim cương không lộ méo)
luu(thu(top, top.size[0], round(top.size[1] * 0.92)), 'ha_top.png', 'thanh trên: nền #top (100% 100%)')

cb = xen(tach_nen(H.crop((30, 372, 1226, 534)), 'tim'))
luu(thu(cb, 990), 'ha_canh.png', 'băng cảnh báo mảnh 330×~38 css')

tr = xen(tach_nen(H.crop((62, 558, 596, 1152)), 'tim'))
luu(thu(tr, 270), 'ha_trieu.png', 'nút SUMMON Ø~80 css (vòng + ngọc trên + sao dưới)')

orr = xen(tach_nen(H.crop((616, 624, 1176, 826)), 'tim'))
luu(thu(orr, 420), 'ha_o_rong.png', 'ô mana ~140 css')

ov = xen(tach_nen(H.crop((644, 878, 868, 1090)), 'tim'))
luu(thu(ov, 216), 'ha_o_vuong.png', 'nút vuông 50 / khung chỉ huy 70 css')

# ---------------- 2. khung bậc ----------------
K = raw('raw_ui2_khung_bac.png')
# hộp chung theo THÂN khung (mép trái/phải thân, đáy thân); phần trang trí trên (tím/vàng/đỏ) nằm trong lề trên chung
THAN = {'trang': (30, 322), 'xanh': (354, 645), 'tim': (676, 971), 'vang': (1002, 1301), 'do': (1337, 1643)}
for ten, (x0, x1) in THAN.items():
    w = x1 - x0
    lx, rx = 26, 26  # lề ngang cho lửa (đỏ) / cánh (vàng)
    im = tach_nen(K.crop((x0 - lx, 120, x1 + rx, 690)), 'tim')
    # giữ đúng hộp (không xén) → mọi bậc cùng tỉ lệ đặt trong CSS: thân = [lx, lx+w] × [~110, ~556]
    # cùng cỡ ra 212×350 cho mọi bậc (thân lệch ≤ 2% giữa các bậc) → CSS đặt chung: thân ≈ trái 7,5% · rộng 85% · trên 21,4% · đáy 97,5%
    luu(thu(im, 212, 350), 'ha_khung_' + ten + '.png', 'thân %d px gốc' % w)

# ---------------- 3. nền trận / bàn / đường ----------------
B = raw('raw_ui2_ban.png')
Bn = np.asarray(B).astype(np.float32)
NEN = np.array([16, 22, 47], np.float32)  # #10162F


def ghep_doc(dich, anh, y0, nhat_tren, nhat_duoi):
    """dán ảnh (float RGB) vào dich từ hàng y0, mờ dần mép trên/dưới về màu nền."""
    h = anh.shape[0]
    t = np.ones(h, np.float32)
    if nhat_tren:
        t[:nhat_tren] = np.linspace(0, 1, nhat_tren) ** 1.4
    if nhat_duoi:
        t[h - nhat_duoi:] = np.minimum(t[h - nhat_duoi:], np.linspace(1, 0, nhat_duoi) ** 1.4)
    y1 = min(dich.shape[0], y0 + h)
    t = t[:y1 - y0, None, None]
    dich[y0:y1] = dich[y0:y1] * (1 - t) + anh[:y1 - y0] * t


NW, NH = 860, 1720  # 2× khung 430×860
nen = np.ones((NH, NW, 3), np.float32) * NEN
# trời + lâu đài: hàng 0..282 (trên viền bàn trong ảnh), cột 96..928
troi = Image.fromarray(Bn[0:282, 96:928].astype(np.uint8)).resize((NW, round(282 * NW / 832)), Image.LANCZOS)
troi = np.asarray(troi).astype(np.float32) * 0.82  # tối hơn bàn
ghep_doc(nen, troi, 0, 0, 90)
# vòng phép + hoa: hàng 1214..1536 (dưới viền đường trong ảnh)
duoi = Image.fromarray(Bn[1214:1536, 0:1024].astype(np.uint8)).resize((NW, round(322 * NW / 1024)), Image.LANCZOS)
duoi = np.asarray(duoi).astype(np.float32) * 0.78
ghep_doc(nen, duoi, 1068, 70, 0)
nen_im = Image.fromarray(np.clip(nen, 0, 255).astype(np.uint8))
luu(nen_im, 'ha_nen.png', 'nền trận 2× (cover 430×860)')

# mặt bàn: ô ảnh gốc (tâm cột 231.5/372/512/652/793, hàng 642.5/784/925.5) → tâm ô THẬT (KHAY_COT/HANG × 900×532)
KC = [0.166, 0.338, 0.504, 0.672, 0.843]
KH = [0.249, 0.499, 0.749]
KW, KHh = 900, 532
RC, RH = [231.5, 372, 512, 652, 793], [642.5, 784, 925.5]
sx = (KC[-1] - KC[0]) * KW / (RC[-1] - RC[0])
sy = (KH[-1] - KH[0]) * KHh / (RH[-1] - RH[0])
ox = RC[0] - KC[0] * KW / sx
oy = RH[0] - KH[0] * KHh / sy
kh = B.transform((KW, KHh), Image.AFFINE, (1 / sx, 0, ox, 0, 1 / sy, oy), resample=Image.BICUBIC)
# chỉ giữ từ viền vàng của mặt bàn vào trong (ảnh gốc x 125..900, y 507..1065, bo góc ~42) — bỏ ray đường sát mép
yy, xx = np.mgrid[0:KHh, 0:KW].astype(np.float32)
rx_, ry_ = xx / sx + ox, yy / sy + oy
X0, X1, Y0, Y1, R = 124.5, 900.5, 506.5, 1065.5, 42.0
cx = np.clip(rx_, X0 + R, X1 - R)
cy = np.clip(ry_, Y0 + R, Y1 - R)
d = np.hypot(rx_ - cx, ry_ - cy)
trong = (rx_ >= X0) & (rx_ <= X1) & (ry_ >= Y0) & (ry_ <= Y1)
al = np.clip(R - d + 0.5, 0, 1) * trong
ka = np.dstack([np.asarray(kh).astype(np.float32), al * 255])
# góc dưới-phải mặt bàn trong ảnh gốc bị tinh thể lõi đè → thay bằng góc dưới-trái lật ngang (mặt bàn đối xứng quanh X≈454)
gx0, gy0, mem = 780, 370, 14
trai = ka[gy0:, 908 - KW + 1:908 - gx0 + 1][:, ::-1]          # cột X' = 908 − X (viền trái 39,5 ↔ viền phải 869)
wy = np.clip((np.arange(KHh - gy0) - 0.0) / mem, 0, 1)[:, None, None]
wx = np.clip((np.arange(KW - gx0) - 0.0) / mem, 0, 1)[None, :, None]
w8 = np.minimum(wy, wx)                                          # mép vùng thay: trộn dần (không lộ mối)
ka[gy0:, gx0:KW] = ka[gy0:, gx0:KW] * (1 - w8) + trai[:, :KW - gx0] * w8
ka = ka.astype(np.uint8)
luu(Image.fromarray(ka, 'RGBA'), 'ha_khay.png', 'mặt bàn (vẽ ở B.x,B.y,B.w,B.h như khay.png)')

# đường: 1 phiến đá trọn của đường trên (mạch nối x≈431 → 583, giữa 2 cụm mũi tên) → lặp liền theo mạch; ray ngoài y≈406 → ray trong ≈510.
# Ngọc trên 2 ray giữa phiến (x≈497..528) xoá bằng đoạn ray bên trái (x−36).
Bp = Bn.copy()
for y0, y1 in ((398, 436), (486, 516)):
    Bp[y0:y1, 494:532] = Bn[y0:y1, 458:496]
seg = Bp[406:510, 431:583] * 0.8  # tối bớt: đường vẫn sáng hơn bàn nhưng không chói, quái nổi rõ
dai = seg.shape[1]
# dọc: x = bề ngang đường (0 = ray NGOÀI, như duong_thang), y = chiều dài
thang = np.transpose(seg, (1, 0, 2))
S = thang.shape[1]
luu(Image.fromarray(np.dstack([np.clip(thang, 0, 255), np.full(thang.shape[:2], 255)]).astype(np.uint8), 'RGBA'), 'ha_duong.png', 'đoạn đường thẳng lặp (rộng = DUONG_RONG)')
# góc: mở lên + phải (như duong_goc), tâm cong ở góc trên-phải; u = S - khoảng cách tâm (0 = ray ngoài)
yy, xx = np.mgrid[0:S, 0:S].astype(np.float32) + 0.5
dd = np.hypot(S - xx, yy)
u = S - dd
phi = np.arctan2(yy, S - xx)
v = (phi * S * 0.5) % dai
ui = np.clip(u, 0, S - 1)
goc = np.zeros((S, S, 4), np.float32)
for k in range(3):
    goc[..., k] = nd.map_coordinates(thang[..., k], [v, ui], order=1, mode='wrap')
goc[..., 3] = np.clip(u + 0.5, 0, 1) * 255
luu(Image.fromarray(np.clip(goc, 0, 255).astype(np.uint8), 'RGBA'), 'ha_goc.png', 'góc đường (uốn từ đoạn thẳng)')

# ---------------- 4. từ ảnh có sẵn ----------------
A = os.path.join(DICH, '%s.png')


def doi_mau(im, dich_hue, sat=1.0, val=1.0):
    a = np.asarray(im.convert('RGBA')).astype(np.float32) / 255
    hsv = np.asarray(Image.fromarray((a[..., :3] * 255).astype(np.uint8)).convert('HSV')).astype(np.float32)
    hsv[..., 0] = (hsv[..., 0] + dich_hue * 255 / 360) % 255
    hsv[..., 1] = np.clip(hsv[..., 1] * sat, 0, 255)
    hsv[..., 2] = np.clip(hsv[..., 2] * val, 0, 255)
    rgb = np.asarray(Image.fromarray(hsv.astype(np.uint8), 'HSV').convert('RGB'))
    return Image.fromarray(np.dstack([rgb, (a[..., 3] * 255).astype(np.uint8)]), 'RGBA')


# mana: icon MANA lục giác teal tia sét (raw_ui2_icon_taisan.png, ô 1/6 — ChatGPT 09/11, thap-art/ANH-SINH-0911.md)
ts = tach_nen(raw('raw_ui2_icon_taisan.png').crop((0, 120, 380, 560)), 'tim')
al = np.asarray(ts)[..., 3] > 60
lab, n = nd.label(al)
k = np.argmax(nd.sum(al, lab, range(1, n + 1))) + 1
ys, xs = np.nonzero(nd.binary_dilation(lab == k, iterations=4))
mana = ts.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
luu(thu(mana, 96), 'ha_mana.png', 'icon mana lục giác teal tia sét (Ø ≤ 32 css)')
# ký hiệu phím: cắt phần vạch / mũi tên bạc giữa phím thép cũ
for src, ten, hop in [('h2_phim_dung_cho', 'ha_ic_dung', None), ('h2_phim_toc_cho', 'ha_ic_toc', None)]:
    im = Image.open(A % src).convert('RGBA')
    a = np.asarray(im).astype(np.int32)
    w, h = im.size
    # vùng giữa (bỏ khung thép): 26%..74% mỗi chiều, giữ điểm SÁNG ít bão hoà (bạc) → alpha
    x0, x1, y0, y1 = int(w * .2), int(w * .8), int(h * .2), int(h * .8)
    c = a[y0:y1, x0:x1].copy()
    mx, mn = c[..., :3].max(2), c[..., :3].min(2)
    sang = (mx > 150) & (mx - mn < 60)
    lab, n = nd.label(nd.binary_closing(sang, iterations=2))
    sz = nd.sum(sang, lab, range(1, n + 1))
    giu = np.isin(lab, [i + 1 for i, s in enumerate(sz) if s > sang.sum() * 0.08])
    giu = nd.binary_fill_holes(giu)
    m = nd.gaussian_filter(giu.astype(np.float32), 0.6)
    c[..., 3] = (c[..., 3] * np.clip(m * 1.4, 0, 1)).astype(np.int32)
    luu(xen(Image.fromarray(c.astype(np.uint8), 'RGBA'), 20), ten + '.png', 'ký hiệu phím (cắt từ ' + src + ')')

# thanh máu trùm phân đoạn (#D55BEA) + thanh tiến độ tới trùm (cyan #71E4EE) + rãnh tối: từ dải sáng tai_day (ChatGPT) đổi màu,
# cắt 10 khe trong suốt (10 đoạn = 10% máu / 10 wave của chu kỳ trùm)
day = Image.open(A % 'tai_day').convert('RGBA').resize((300, 20), Image.LANCZOS)


def phan_doan(im, n=10, khe=3):
    a = np.asarray(im).copy()
    w = a.shape[1]
    for i in range(1, n):
        x = round(i * w / n)
        a[:, x - khe // 2:x - khe // 2 + khe, 3] = 0
    return Image.fromarray(a, 'RGBA')


def to_mau(im, mau, toi=1.0):
    a = np.asarray(im).astype(np.float32)
    L = (a[..., 0] * .3 + a[..., 1] * .59 + a[..., 2] * .11) / 255
    m = np.array(mau, np.float32)
    # sáng giữa dải → pha trắng; tối mép → màu đậm
    rgb = np.clip(m[None, None] * (0.55 + 0.6 * L[..., None]) + 255 * np.clip(L[..., None] - 0.82, 0, 1) * 2.2, 0, 255) * toi
    return Image.fromarray(np.dstack([rgb, a[..., 3]]).astype(np.uint8), 'RGBA')


luu(phan_doan(to_mau(day, (213, 91, 234))), 'ha_mau_trum.png', 'máu trùm #D55BEA, 10 đoạn')
luu(phan_doan(to_mau(day, (113, 228, 238))), 'ha_mau_xanh.png', 'tiến độ tới trùm (cyan), 10 đoạn')
luu(phan_doan(to_mau(day, (60, 70, 120), 0.45)), 'ha_mau_ranh.png', 'rãnh thanh (tối)')

# tờ xem
W2 = 1200
xem = Image.new('RGB', (W2, 1500), (24, 30, 60))
x = y = 10
hmax = 0
for ten, im in DA:
    t = im.convert('RGBA')
    t.thumbnail((380, 380))
    if x + t.size[0] > W2:
        x, y, hmax = 10, y + hmax + 10, 0
    xem.paste(t, (x, y), t)
    x += t.size[0] + 10
    hmax = max(hmax, t.size[1])
xem.crop((0, 0, W2, min(1500, y + hmax + 10))).save(os.path.join(XEM, 'cat_ui2.jpg'), quality=82)
print('tờ xem: docs/demo-hop-tuong/tuvan/huong-anime/cat_ui2.jpg')
