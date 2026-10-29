#!/usr/bin/env python3
"""Tách các ảnh gen mới (nền trắng) cho đợt "Làng hoàn thiện" → atlas 2x + lang-hoan-thien.json + ảnh kiểm viền nền hồng / đen.

Nguồn: art/the-gioi-moi/nguon-v4/ (diem-luu, den-long, re-tran, chuong-lon, do-lang), art/giao-dien/nguon/ (hud, nut-cam-ung,
man-bat-dau, man-ket, vat-pham), art/nhan-vat/nguon/ (npc-lang, npc-lang-manh, chan-dung).
Cách tách giống các đợt trước (lang-chuong/code/chung.py): flood-fill nền trắng từ mép + lỗ trắng kín có viền mực → nền;
khử viền trắng (alpha theo độ pha trắng) → cắt mảnh theo hộp → thu về cỡ LOGIC × 2 (ảnh 2x) → xếp atlas từng họ.

Cỡ logic (Lam 112 px, ô 32) – hệ số k = px logic / px ảnh gen:
  diem-luu   0,255  → cổng điểm lưu ≈ 206×146 (hình cũ 148×161); CHUÔNG tách rời khỏi khung (lắc quanh vòng treo khi lưu)
  den-long   0,120  → đèn ≈ 31–37 × 45; bỏ móc tường (game treo đèn bằng dây vẽ từ mép trên màn như cũ)
  re-tran    0,372  → dải đá trần = đúng 1 hàng ô (32), rễ rủ ≤ 56 dưới trần; 3 đoạn + bản "giữa trơn" (chỉ đá + rêu, cho chỗ boss treo)
  chuong-lon 0,380  → ≈ 285×287, 2 trạng thái (im / rung)
  do-lang    0,280  → quầy hàng ≈ 158×129, bảng nhiệm vụ ≈ 132×119, biển chỉ đường ≈ 93×131;  thang (0,20) → họ -kho (demo chưa có thang)
  hud        0,062  → chuông máu ≈ 22×24 …
  nut-cam-ung        nút DOM: 224 px (= 2× nút lớn nhất 112 CSS px), đế cần 410, núm 128
  vat-pham   0,12 / 0,15 → họ -kho (demo chưa có Mảnh Ký Ức / Âm Phù / rương)
  npc        0,170  → NPC cao ≈ 108; mảnh rời → rig (toạ độ từng mảnh so với CHÂN, đặt theo ảnh ghép npc-lang.png)
  chan-dung  0,20   → ≈ 104×110 (ô hộp thoại, hiện ≈ 80–100 px CSS); 2 ô Lam: CẮT chóp mũ (bo tròn đỉnh mũ trùm, kẻ lại nét viền) cho khớp Lam trong game
  man-bat-dau / man-ket: tranh 16:9 không có nền trắng → giữ cỡ gốc 1672×941 (JPEG q88)

Chạy: python3 -B art/lang-hoan-thien/code/tach.py   (cần Pillow, numpy, scipy; ~60 s)"""
import json
import os
import sys

import numpy as np
import scipy.ndimage as nd
from PIL import Image, ImageDraw

CODE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.dirname(CODE)                                   # art/lang-hoan-thien/
ART = os.path.dirname(GOC)
sys.path.insert(0, os.path.join(ART, 'the-gioi-moi', 'lang-chuong', 'code'))
from chung import doi_co, font, khu_vien_trang, mat_trang, nen_trang, xep_atlas   # noqa: E402

NG = {'v4': os.path.join(ART, 'the-gioi-moi', 'nguon-v4'), 'gd': os.path.join(ART, 'giao-dien', 'nguon'),
      'nv': os.path.join(ART, 'nhan-vat', 'nguon')}
XEM = os.path.join(GOC, 'xem-thu')
BOI = 2
_cache = {}


def tach(nguon, ten):
    """ảnh gen → (RGBA uint8 nền trong suốt, mặt nạ đặc, RGB float)."""
    key = nguon + ten
    if key in _cache:
        return _cache[key]
    a = np.array(Image.open(os.path.join(NG[nguon], ten + '.png')).convert('RGB')).astype(np.float64)
    bg = nen_trang(a)          # nền nối mép + lỗ trắng kín có viền mực (lỗ quai chuông…); điểm sáng trắng trong hình GIỮ
    fg = ~bg
    lab, n = nd.label(fg)
    if n > 1:                                                 # bỏ hạt bụi lẻ
        sz = nd.sum(fg, lab, range(1, n + 1))
        fg &= ~np.isin(lab, np.nonzero(sz < 80)[0] + 1)
    out = khu_vien_trang(a, fg)
    _cache[key] = (out, fg, a)
    return _cache[key]


def chon(nguon, ten, box, tam_trong=True):
    """RGBA cả ảnh, chỉ giữ các thành phần liền có tâm hộp bao nằm trong box (x0,y0,x1,y1); trả mảnh cắt gọn + (x0,y0) góc."""
    im, fg, _ = tach(nguon, ten)
    lab, n = nd.label(fg)
    keep = np.zeros(n + 1, bool)
    x0, y0, x1, y1 = box
    for i, s in enumerate(nd.find_objects(lab)):
        if s is None:
            continue
        cy, cx = (s[0].start + s[0].stop) / 2, (s[1].start + s[1].stop) / 2
        if x0 <= cx < x1 and y0 <= cy < y1:
            keep[i + 1] = True
    m = keep[lab]
    o = im.copy()
    o[~m] = 0
    return got(o)


def got(rgba):
    ys, xs = np.nonzero(rgba[..., 3] > 0)
    return rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1].copy(), (int(xs.min()), int(ys.min()))


def thu(rgba, k):
    """thu theo hệ số k logic/px gen → ảnh 2x (k*2)."""
    h, w = rgba.shape[:2]
    kk = k * BOI
    return doi_co(rgba, max(1, round(w * kk)), max(1, round(h * kk)))


def co_dinh(rgba, w, h):
    return doi_co(rgba, w, h)


# ------------------------------------------------------------------ nơi gom mảnh
HO = {}          # họ → [(tên, rgba)]
META = {}        # tên → dict thêm (neo 2x, …)


def them(ho, ten, rgba, neo, **them_):
    HO.setdefault(ho, []).append((ten, rgba))
    META[ten] = dict(neo=[int(round(neo[0])), int(round(neo[1]))], **them_)


# ====================================================================== 1. điểm lưu (khung + chuông rời)
def diem_luu():
    """KHUNG (vòm rễ) lấy từ trạng thái tắt, dùng cho cả 2 trạng thái (ảnh gen 2 trạng thái cùng khung).
    CHUÔNG tách rời: phần dưới đường cắt y 338 (giữa mắt xích trên và vòng treo) – lắc quanh vòng treo khi lưu.
    Bản SÁNG: quầng ngọc vẽ sẵn dính rêu khung + nhuộm cả nét viền → không cắt sạch được theo màu. Cách làm: lấy ĐÚNG hình dạng
    (mặt nạ + alpha) của chuông bản tắt, dời tới chỗ chuông bản sáng (tâm điểm vàng) và lấy MÀU của bản sáng → chuông vàng sáng,
    không kèm quầng; game vẽ quầng ngọc bằng code (như hình cũ)."""
    k = 0.255
    K = k * BOI
    im, fg, a = tach('v4', 'diem-luu')
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    cy = 338
    vang = (R > 140) & (R > B + 50) & (G > 90)
    yy, xx = np.mgrid[0:fg.shape[0], 0:fg.shape[1]]
    tam_vang = {}
    for st, dx in (('tat', 0), ('sang', 886)):
        vung = np.zeros(fg.shape, bool)
        vung[cy:600, 300 + dx:620 + dx] = True
        ys, xs = np.nonzero(vang & vung)
        tam_vang[st] = (xs.mean(), ys.mean())
    cxb, cyb = tam_vang['tat']
    vung = np.zeros(fg.shape, bool); vung[cy:600, 300:620] = True
    f2 = fg & vung & (((xx - cxb) / 82.0) ** 2 + ((yy - 440) / 112.0) ** 2 < 1)
    lab2, _ = nd.label(f2)
    m = nd.binary_fill_holes(lab2 == lab2[int(round(cyb)), int(round(cxb))])
    ch = im.copy(); ch[~m] = 0
    cq, (cx0, cy0) = got(ch)
    hang = np.nonzero(m[cy + 2])[0]
    px = (hang.min() + hang.max()) / 2
    kh = im.copy(); kh[~((xx >= 30) & (xx < 860) & (yy >= 150) & (yy < 750))] = 0; kh[m] = 0
    q, (x0, y0) = got(kh)
    day = np.nonzero(q[..., 3].max(1) > 0)[0].max()
    KH = (x0 + q.shape[1] / 2, y0 + day + 1)
    them('diem-luu', 'diem-luu-khung', thu(q, k), (q.shape[1] / 2 * K, (day + 1) * K))
    treo = [round((px - KH[0]) * k, 2), round((cy - KH[1]) * k, 2)]
    piv = ((px - cx0) * K, (cy - cy0) * K)
    them('diem-luu', 'diem-luu-chuong-tat', thu(cq, k), piv, treo=treo)
    ddx = int(round(tam_vang['sang'][0] - cxb)); ddy = int(round(tam_vang['sang'][1] - cyb))
    vien = m & (a.mean(-1) < 60)                              # nét mực của chuông bản tắt → tìm độ dời sao cho nét rơi đúng nét tối
    vy, vx = np.nonzero(vien)
    L = a.mean(-1)
    tot = min(((L[vy + ddy + j, vx + ddx + i].mean(), i, j) for i in range(-12, 13) for j in range(-12, 13)))
    ddx += tot[1]; ddy += tot[2]
    s2 = cq.copy()
    h, w = cq.shape[:2]
    s2[..., :3] = a[cy0 + ddy:cy0 + ddy + h, cx0 + ddx:cx0 + ddx + w].round().clip(0, 255).astype(np.uint8)
    s2[cq[..., 3] == 0] = 0
    them('diem-luu', 'diem-luu-chuong-sang', thu(s2, k), piv, treo=treo, lech_nguon=[ddx, ddy])


# ====================================================================== 2. đèn lồng
def den_long():
    k = 0.12
    im, fg, a = tach('v4', 'den-long')
    for hang, st, y0 in ((0, 'sang', 29), (1, 'tat', 533)):
        for (x0, x1), kieu in zip(((170, 470), (630, 910), (1065, 1395)), ('tron', 'vuong', 'chuong')):
            o = im.copy()
            sel = np.zeros(fg.shape, bool)
            sel[y0 + 83:y0 + 470, x0:x1] = True            # bỏ móc tường (đáy bản móc ≈ y0 + 81)
            o[~sel] = 0
            q, (qx, qy) = got(o)
            hang0 = np.nonzero(q[0, :, 3] > 40)[0]
            tx = (hang0.min() + hang0.max()) / 2           # tâm sợi dây ở hàng trên cùng
            K = k * BOI
            them('den-long', 'den-%s-%s' % (kieu, st), thu(q, k), (tx * K, 0))


# ====================================================================== 3. rễ trần (Phòng boss)
def re_tran():
    k = 0.372
    im, fg, a = tach('v4', 're-tran')
    K = k * BOI
    TREN, DAY = 182, 268                                       # mép trên / đáy dải đá (gồm vệt tối dưới đáy) trong ảnh gen
    for ten, box, nx in (('re-tran-trai', (40, 120, 700, 430), 200), ('re-tran-giua', (700, 120, 1460, 430), None),
                         ('re-tran-phai', (1460, 120, 2172, 430), 2010)):
        q, (x0, y0) = chon('v4', 're-tran', box)
        if ten == 're-tran-trai':                               # đá xếp dưới đáy dải (góc tường) chỉ giữ trong bề rộng tường (x < 200)
            pass
        hang = q[..., 3] > 0
        if nx is None:                                         # mép trái dải đá ở hàng giữa dải
            cols = np.nonzero(hang[(TREN + DAY) // 2 - y0])[0]
            nx = x0 + cols.min()
        neo = ((nx - x0) * K, (TREN - y0) * K)
        rong = None
        if ten == 're-tran-giua':
            cols = np.nonzero(hang[(TREN + DAY) // 2 - y0])[0]
            rong = round((cols.max() - cols.min() + 1) * k, 1)
        them('re-tran', ten, thu(q, k), neo, **({'rong': rong} if rong else {}))
        if ten == 're-tran-giua':                              # bản TRƠN: chỉ dải đá + rêu bám, cắt dưới đáy dải (mờ dần 12 px)
            q2 = q.copy().astype(np.float64)
            for y in range(q2.shape[0]):
                Y = y + y0
                f = 1.0 if Y <= DAY else max(0.0, 1 - (Y - DAY) / 12)
                q2[y, :, 3] *= f
            q2 = q2.round().astype(np.uint8); q2[q2[..., 3] == 0] = 0
            them('re-tran', 're-tran-giua-tron', thu(q2, k), neo, rong=rong)


# ====================================================================== 4. chuông lớn
def chuong_lon():
    k = 0.38
    K = k * BOI
    for st, box in (('im', (0, 120, 770, 900)), ('rung', (770, 120, 1536, 900))):
        q, (x0, y0) = chon('v4', 'chuong-lon', box)
        day = np.nonzero(q[..., 3].max(1) > 0)[0].max()
        # tâm khung = giữa 2 chân (cột có alpha ở hàng gần đáy)
        cols = np.nonzero(q[day - 30, :, 3] > 0)[0]
        cx = (cols.min() + cols.max()) / 2
        them('chuong-lon', 'chuong-lon-' + st, thu(q, k), (cx * K, (day + 1) * K))


# ====================================================================== 5. đồ làng (+ thang để dành)
def do_lang():
    for ten, box, k, ho in (('quay-hang', (40, 490, 640, 980), 0.28, 'do-lang'), ('bang-nhiem-vu', (640, 520, 1150, 980), 0.28, 'do-lang'),
                            ('bien-chi-duong', (1150, 490, 1520, 980), 0.28, 'do-lang'),
                            ('thang-dau', (320, 20, 600, 400), 0.20, 'thang-kho'), ('thang-giua', (640, 20, 900, 470), 0.20, 'thang-kho'),
                            ('thang-chan', (920, 20, 1240, 470), 0.20, 'thang-kho')):
        q, _ = chon('v4', 'do-lang', box)
        K = k * BOI
        day = np.nonzero(q[..., 3].max(1) > 0)[0].max()
        them(ho, ten, thu(q, k), (q.shape[1] / 2 * K, (day + 1) * K))


# ====================================================================== 6. HUD + nút cảm ứng + vật phẩm (để dành)
def giao_dien():
    k = 0.062
    for ten, box in (('hud-chuong-day', (90, 90, 470, 500)), ('hud-chuong-rong', (570, 90, 950, 500)), ('hud-vong-san', (1020, 130, 1480, 490)),
                     ('hud-vong-hoi', (50, 560, 500, 920)), ('hud-cong-huong', (530, 540, 960, 930)), ('hud-manh-chuong', (1070, 570, 1410, 930))):
        q, _ = chon('gd', 'hud', box)
        r = thu(q, k)
        them('hud', ten, r, (r.shape[1] / 2, r.shape[0] / 2))
    for ten, box, w in (('nut-nhay', (30, 130, 350, 450), 224), ('nut-chem', (350, 130, 670, 450), 224), ('nut-luot', (670, 130, 990, 450), 224),
                        ('nut-vong', (990, 130, 1310, 450), 224), ('nut-nhay-nhan', (30, 455, 350, 780), 224), ('nut-chem-nhan', (350, 455, 670, 780), 224),
                        ('nut-luot-nhan', (670, 455, 990, 780), 224), ('nut-vong-nhan', (990, 455, 1310, 780), 224),
                        ('can-de', (1320, 55, 1760, 490), 410), ('can-num', (1390, 500, 1680, 790), 128)):
        q, _ = chon('gd', 'nut-cam-ung', box)
        s = w / max(q.shape[:2])
        r = co_dinh(q, max(1, round(q.shape[1] * s)), max(1, round(q.shape[0] * s)))
        them('nut', ten, r, (r.shape[1] / 2, r.shape[0] / 2))
    for ten, box, k in (('manh-ky-uc-mo', (460, 20, 700, 310), 0.12), ('manh-ky-uc-sang', (800, 20, 1080, 310), 0.12),
                        ('am-phu-ngoc', (290, 305, 545, 600), 0.12), ('am-phu-vang', (640, 305, 900, 600), 0.12), ('am-phu-do', (995, 305, 1250, 600), 0.12),
                        ('ruong-dong', (300, 600, 750, 990), 0.15), ('ruong-mo', (760, 590, 1220, 990), 0.15)):
        q, _ = chon('gd', 'vat-pham', box)
        r = thu(q, k)
        day = np.nonzero(r[..., 3].max(1) > 0)[0].max()
        them('vat-pham-kho', ten, r, (r.shape[1] / 2, day + 1))


# ====================================================================== 7. NPC: mảnh rời → rig (khớp mẫu vào ảnh ghép npc-lang.png)
NPC_K = 0.170                       # logic / px của ảnh ghép npc-lang.png (NPC cao ≈ 635 px → ≈ 108 logic ≈ Lam 112)
# mảnh rời trong npc-lang-manh.png: (hộp cắt) → đặt vào ảnh ghép npc-lang.png theo (x0, y0, x1) đo bằng mắt trên lưới
# (tỉ lệ = (x1 - x0) / rộng mảnh; khớp mẫu tự động thử rồi – mảnh vẽ lại khác tỉ lệ nên lệch → đặt tay). Chân = (chan_x, chan_y).
NPC_MANH = {
    'ren': {'chan': (267, 785),
            'manh': {'ung-sau': ((98, 690, 303, 842), (105, 676, 250)), 'ung-truoc': ((368, 690, 580, 840), (276, 680, 430)),
                     'than': ((440, 75, 815, 412), (150, 384, 525)), 'dau': ((20, 20, 420, 415), (150, 145, 560)),
                     'gang-sau': ((65, 490, 236, 668), (128, 512, 254)), 'gang-truoc': ((310, 412, 595, 710), (440, 345, 697))}},
    'truong': {'chan': (1027, 790),
               'manh': {'ung-sau': ((972, 690, 1178, 840), (874, 694, 1010)), 'ung-truoc': ((1285, 690, 1494, 840), (1034, 696, 1180)),
                        'than': ((1320, 85, 1690, 412), (788, 340, 1202)), 'dau': ((898, 15, 1300, 432), (774, 148, 1216)),
                        'gang-sau': ((965, 508, 1134, 680), (878, 530, 1002)), 'gang-truoc': ((1186, 392, 1406, 700), (1192, 352, 1412))}},
}
NPC_THU_TU = ['ung-sau', 'ung-truoc', 'than', 'dau', 'gang-sau', 'gang-truoc']


def npc():
    RIG = {}
    for nv, M in NPC_MANH.items():
        cx, cy = M['chan']
        rig = {'manh': []}
        top = 1e9
        for m in NPC_THU_TU:
            hop, (x0, y0, x1) = M['manh'][m]
            q, _ = chon('nv', 'npc-lang-manh', hop)
            s = (x1 - x0) / q.shape[1]
            kk = NPC_K * s
            ten = 'npc-%s-%s' % (nv, m)
            them('npc', ten, thu(q, kk), (0, 0))
            rig['manh'].append({'o': ten, 'x': round((x0 - cx) * NPC_K, 2), 'y': round((y0 - cy) * NPC_K, 2),
                                'w': round(q.shape[1] * kk, 2), 'h': round(q.shape[0] * kk, 2)})
            top = min(top, y0)
        rig['cao'] = round((cy - top) * NPC_K, 1)
        RIG[nv] = rig
    return RIG


# ====================================================================== 8. chân dung (cắt chóp mũ Lam)
def cat_chop(q, ox, oy):
    """q: RGBA ô chân dung Lam (toạ độ gốc ảnh gen trừ (ox, oy)); bỏ phần mũ ngoài vòm bo tròn bên TRÁI-TRÊN (chóp gập + vành phẳng),
    kẻ nét mực dọc đường cắt (≈ 8 px gen) để mũ thành vòm tròn như Lam trong game (rig-v4 không chóp)."""
    h, w = q.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    X, Y = xx + ox, yy + oy                                    # toạ độ ảnh gen (ô 1)
    cx, cy, rx, ry = 338, 352, 196, 250
    ngoai = (((X - cx) / rx) ** 2 + ((Y - cy) / ry) ** 2 > 1) & (X < cx) & (Y < 470)
    o = q.copy()
    co = o[..., 3] > 0
    bo = ngoai & co
    o[bo] = 0
    # nét viền mới: điểm còn lại cách vùng bỏ ≤ 8 px
    d = nd.distance_transform_edt(~bo)
    vien = (d <= 8) & (o[..., 3] > 0)
    MUC = np.array([13, 14, 26, 255], np.uint8)
    o[vien] = MUC
    # khử răng cưa mép ngoài nét: 1 px mép giữa nét và vùng bỏ → alpha ½
    mep = (d > 0) & (d <= 1.5) & bo
    o[mep] = [13, 14, 26, 110]
    return o


def chan_dung():
    k = 0.20
    for ten, box, sx in (('cd-lam', (20, 80, 556, 660), 0), ('cd-lam-ngac-nhien', (556, 80, 1080, 660), 523),
                         ('cd-tho-ren', (1080, 80, 1590, 660), None), ('cd-truong-lang', (1590, 80, 2172, 660), None)):
        im, fg, a = tach('nv', 'chan-dung')
        o = im.copy()
        sel = np.zeros(fg.shape, bool); sel[box[1]:box[3], box[0]:box[2]] = True
        o[~sel] = 0
        if sx is not None:
            o = cat_chop(o, -sx, 0 if sx == 0 else 4)
        q, _ = got(o)
        r = thu(q, k)
        them('chan-dung', ten, r, (0, 0))


# ====================================================================== 9. tranh màn hình
def tranh():
    for ten in ('man-bat-dau', 'man-ket'):
        Image.open(os.path.join(NG['gd'], ten + '.png')).convert('RGB').save(os.path.join(GOC, ten + '.jpg'), quality=88, optimize=True, progressive=True)
    # 29/10: tranh MỚI kiểu "Cổ tích chuông tàn" (Lam mũ tối) – nguồn art/lang-hoan-thien/<ten>-chuong-tan.png → JPEG q86 (~215 KB). Game dùng bản này;
    # man-bat-dau.jpg / man-ket.jpg (Lam mũ trắng cũ) giữ để so.
    for ten in ('man-bat-dau', 'man-ket'):
        Image.open(os.path.join(GOC, ten + '-chuong-tan.png')).convert('RGB').save(os.path.join(GOC, ten + '-chuong-tan.jpg'), quality=86, optimize=True, progressive=True)


# ====================================================================== xuất atlas + JSON + kiểm viền
def kiem_vien(ho, ds):
    """ảnh kiểm viền: mọi mảnh đúng cỡ 2x, hàng trên nền hồng, hàng dưới nền đen, dấu neo xanh."""
    pad = 16
    W = sum(r.shape[1] + pad for _, r in ds) + pad
    H = max(r.shape[0] for _, r in ds) + 2 * pad + 18
    for nen, ten_nen in (((255, 0, 255), 'hong'), ((0, 0, 0), 'den')):
        c = Image.new('RGBA', (W, H), nen + (255,))
        d = ImageDraw.Draw(c)
        x = pad
        for ten, r in ds:
            c.alpha_composite(Image.fromarray(r), (x, pad + 18))
            n = META[ten]['neo']
            d.line((x + n[0] - 5, pad + 18 + n[1], x + n[0] + 5, pad + 18 + n[1]), fill=(0, 255, 255, 255))
            d.line((x + n[0], pad + 18 + n[1] - 5, x + n[0], pad + 18 + n[1] + 5), fill=(0, 255, 255, 255))
            d.text((x, 4), ten, fill=(255, 255, 255, 255) if ten_nen == 'den' else (0, 0, 0, 255), font=font(12))
            x += r.shape[1] + pad
        c.convert('RGB').save(os.path.join(XEM, 'kiem-vien-%s-%s.png' % (ho, ten_nen)))


def main():
    os.makedirs(XEM, exist_ok=True)
    diem_luu(); den_long(); re_tran(); chuong_lon(); do_lang(); giao_dien()
    rig = npc()
    chan_dung(); tranh()
    out = {'phien_ban': 1, 'boi': BOI, 'ghi_chu': 'Atlas 2x (px ảnh = logic × 2). o[tên] = {anh, khung [x,y,w,h] px atlas, neo [x,y] px trong mảnh}. '
           'Họ "-kho" là mảnh để dành (demo chưa có cơ chế) – game không nạp. Sinh bởi code/tach.py', 'anh': {}, 'o': {}, 'npc_rig': rig,
           'tranh': {'man-bat-dau': {'tep': 'man-bat-dau-chuong-tan.jpg', 'co_anh': [1672, 941]}, 'man-ket': {'tep': 'man-ket-chuong-tan.jpg', 'co_anh': [1672, 941]}}}
    for ho, ds in HO.items():
        rong = max(1024, max(r.shape[1] for _, r in ds) + 4)
        tong = sum(r.shape[1] + 2 for _, r in ds)
        if ho in ('re-tran', 'chuong-lon') and tong <= 2048:   # 1 hàng (đỡ ô trống trong atlas → đỡ bộ nhớ giải mã)
            rong = tong
        at, pos = xep_atlas(ds, rong=rong)
        tep = ho + '.png'
        Image.fromarray(at).save(os.path.join(GOC, tep), optimize=True)
        out['anh'][ho] = {'tep': tep, 'co_anh': [at.shape[1], at.shape[0]], 'kho': ho.endswith('-kho')}
        for ten, r in ds:
            out['o'][ten] = dict(anh=tep, khung=pos[ten], **META[ten])
        kiem_vien(ho, ds)
        print('%-14s %2d mảnh  atlas %dx%d' % (ho, len(ds), at.shape[1], at.shape[0]))
    with open(os.path.join(GOC, 'lang-hoan-thien.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    for nv, r in rig.items():
        print('rig', nv, 'cao', r['cao'])


if __name__ == '__main__':
    main()
