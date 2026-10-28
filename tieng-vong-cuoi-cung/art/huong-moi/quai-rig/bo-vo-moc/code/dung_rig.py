#!/usr/bin/env python3
"""Bọ Vỏ Mộc – bước 3: dựng rig 5 mảnh (+ 2 lớp nứt mai), tô màu hướng mới, vệt sáng mép, 11 clip → gói runtime.

Vào: ../tam/goc/*.png (tach.py), vị trí ráp đo bằng khop.py + chỉnh tay theo ảnh nguyên con (bảng VI_TRI).
Ra (thư mục bo-vo-moc/):
  manh/*.png          mảnh 2 px ảnh / 1 px logic (đã tô màu + vệt sáng mép vẽ sẵn), viền trong 2 px
  bo-vo-moc-rig.json  CÙNG định dạng game/runtime/quai-boss/quai-moi-rig.json → QBR.napThem(base,'bo-vo-moc-rig.json')
                      toạ độ rig = px mảnh nguồn (cỡ mảnh rời trong ảnh gốc), nhân vật QUAY TRÁI; tư thế khung
                      [dx,dy,goc,sx,sy,toi,mo,hien] theo nut_ds; goc dương = quay chiều kim đồng hồ (y hướng xuống)
  kiem/*.png          ảnh kiểm (ráp, tách lớp, so cỡ Lam, các tư thế chính) – cỡ thật, không phóng nearest
Chạy: python3 dung_rig.py   (cần pillow, numpy, scipy)"""
import json, math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd
from scipy.spatial import ConvexHull

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..'))
GOC = os.path.join(ROOT, 'tam', 'goc'); MANH = os.path.join(ROOT, 'manh'); KIEM = os.path.join(ROOT, 'kiem')
for d in (MANH, KIEM): os.makedirs(d, exist_ok=True)

# ---------------- TỈ LỆ ----------------
CAO_LOGIC = 74.0                 # cao dáng nghỉ (đỉnh mai → đất), px logic. Lam cao 112.
K_NC = 0.89                      # mảnh rời → nguyên con (khop.py đo trên mai)
# vị trí góc trên-trái từng mảnh trong ảnh NGUYÊN CON (đã thu K_NC) – khop.py + chỉnh tay (xem kiem/rap-so-nguyen-con.png)
VI_TRI = {'mai': (84, 18), 'dau': (22, 195), 'chan-truoc': (140, 323), 'chan-sau': (470, 312), 'bung': (425, 120)}
IM = {t: Image.open(os.path.join(GOC, t + '.png')).convert('RGBA') for t in VI_TRI}
TL = {t: (VI_TRI[t][0] / K_NC, VI_TRI[t][1] / K_NC) for t in VI_TRI}          # góc trên-trái, toạ độ RÁP (px mảnh nguồn)
DAT_Y = max(TL[t][1] + IM[t].height for t in ('chan-truoc', 'chan-sau'))      # mặt đất = đáy chân thấp nhất
for t in ('chan-truoc', 'chan-sau'): TL[t] = (TL[t][0], DAT_Y - IM[t].height)  # hai cụm chân cùng chạm đất
DINH_Y = TL['mai'][1]
TY = CAO_LOGIC / (DAT_Y - DINH_Y)                                               # px logic / px nguồn
PX = 2.0; PAD = 2; F = PX * TY                                                  # ảnh mảnh: 2 px / 1 px logic
X_TRAI = TL['dau'][0]; X_PHAI = TL['bung'][0] + IM['bung'].width
GOC_X = 420.0                                                                   # điểm neo (giữa thân) trên mặt đất
THAN_C = (402.0, (DINH_Y + DAT_Y) / 2)                                          # nút thân: giữa mai, nửa chiều cao (trục lật ngửa)

# ---------------- MÀU HƯỚNG MỚI ----------------
def hex3(h): return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255
DAI_AM = [(0, '#0b1416'), (0.2, '#17272C'), (0.42, '#39312E'), (0.62, '#65503C'), (0.82, '#A78046'), (1, '#F2D69A')]
DX = np.array([p for p, _ in DAI_AM]); DC = np.stack([hex3(c) for _, c in DAI_AM])
def dai(L):
    return np.stack([np.interp(L, DX, DC[:, c]) for c in range(3)], -1)
def rgb_hsv(c):
    r, g, b = c[..., 0], c[..., 1], c[..., 2]; mx = c.max(-1); mn = c.min(-1); d = mx - mn + 1e-6
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    s = np.where(mx > 0, (mx - mn) / (mx + 1e-6), 0); return h, s, mx
def hsv_rgb(h, s, v):
    c = v * s; x = c * (1 - np.abs((h / 60) % 2 - 1)); m = v - c; z = np.zeros_like(h); k = (h // 60).astype(int) % 6
    r = np.choose(k, [c, x, z, z, x, c]); g = np.choose(k, [x, c, c, x, z, z]); b = np.choose(k, [z, z, x, c, c, x])
    return np.stack([r + m, g + m, b + m], -1)
# mỗi mảnh: tron = mức thay bằng dải màu ấm; tp = tương phản giữ lại; sang = độ sáng
GRADE = {'mai': (0.38, 1.12, 0.82), 'dau': (0.38, 1.28, 0.96), 'chan-truoc': (0.38, 1.05, 0.76), 'chan-sau': (0.38, 1.05, 0.76),
         'bung': (0.22, 1.0, 0.80)}   # bụng: giữ màu ngà (điểm yếu phải SÁNG hơn mai) nhưng dịu và tối hơn ảnh gốc
# PH3 mục 3–4 (không tăng viền sáng toàn thân): mai TỐI hơn chút (0,84 → 0,82); ĐẦU tương phản 1,12 → 1,28, sáng 0,86 → 0,92;
# BỤNG nâng sáng một chút, kéo về XÁM ĐẤT NHẠT (bớt ngà vàng, gần mai ít hơn về độ sáng chứ không về độ rực)
XAM_DAT = '#B9AE9C'; BUNG_XAM = 0.38; BUNG_SANG = 1.10
# PH4 mục 3 (nâng sáng CÓ CHỌN LỌC, không rim, không tươi hơn): ĐẦU sáng 0,92 → 0,96; BỤNG ×1,06 → ×1,10. Mai / chân giữ nguyên.
def to_mau(t, a):
    rgb = a[..., :3].astype(np.float32) / 255; al = a[..., 3:4]
    tron, tp, sang = GRADE[t]
    h, s, v = rgb_hsv(rgb)
    reu = (h > 45) & (h < 150) & (s > 0.18)                       # rêu xanh → olive xỉn (như HM_SO.REU)
    h2 = np.where(reu, 50 + (h - 45) * 0.2, h); s2 = np.where(reu, s * 0.75, s * 0.9); v2 = np.where(reu, v * 0.92, v)
    mat = (h > 20) & (h < 55) & (s > 0.35) & (v > 0.55)            # mắt hổ phách: giữ nguyên, sáng thêm (điểm nhận diện)
    rgb0 = rgb.copy()
    rgb = hsv_rgb(h2, s2, v2)
    L = rgb @ np.array([0.299, 0.587, 0.114], np.float32)
    Lm = 0.42 + (L - 0.42) * tp
    out = rgb * (1 - tron) + dai(np.clip(Lm * 1.02, 0, 1)) * tron
    out = np.clip(out * sang, 0, 1)
    if t == 'bung':   # trộn về xám đất nhạt giữ sắc độ từng chỗ (khía đốt vẫn thấy), rồi nâng sáng nhẹ
        Lo = out @ np.array([0.299, 0.587, 0.114], np.float32); xd = hex3(XAM_DAT); Lx = float(xd @ np.array([0.299, 0.587, 0.114]))
        out = np.clip((out * (1 - BUNG_XAM) + xd * (Lo / Lx)[..., None] * BUNG_XAM) * BUNG_SANG, 0, 1)
    if t == 'dau': out = np.where(mat[..., None], np.clip(rgb0 * 0.6 + hex3('#F2D69A') * 0.5, 0, 1), out)
    return np.dstack([(out * 255).round().astype(np.uint8), al])

# ---------------- MẢNH 2x + VỆT SÁNG MÉP ----------------
RIM = '#F2D69A'
RIM_SO = {'mai': (6, 0.72), 'dau': (5, 0.62), 'bung': (4, 0.40), 'chan-truoc': (0, 0), 'chan-sau': (0, 0)}   # (độ dày px ảnh 2x, độ mạnh)
def rim(img, day, manh):
    """vệt sáng mép TRÊN-TRƯỚC (nhân vật quay trái → ánh từ trên, lệch trái), vẽ sẵn vào mảnh, mờ dần vào trong."""
    if day <= 0: return img
    a = np.array(img).astype(np.float32); al = a[..., 3] / 255; m = al > 0.5
    acc = np.zeros_like(al)
    for k in range(1, day + 1):          # điểm vật mà điểm cách k px về phía trên-trái là nền → mép trên-trước
        sh = np.zeros_like(m); dy, dx = k, int(round(k * 0.45))
        sh[dy:, dx:] = m[:-dy, :-dx] if dx else m[:-dy, :]
        acc = np.maximum(acc, (m & ~sh) * (1 - (k - 1) / day))
    acc = nd.gaussian_filter(acc, 0.7) * al
    # chỉ nửa trên mảnh (không viền sáng dưới bụng / chân)
    ys = np.nonzero(m.any(1))[0]; y0, y1 = ys.min(), ys.max()
    w = np.clip(1.15 - (np.arange(a.shape[0]) - y0) / max(1, (y1 - y0)) * 1.6, 0, 1)[:, None]
    k = (acc * w * manh)[..., None]
    a[..., :3] = a[..., :3] * (1 - k) + hex3(RIM) * 255 * k
    return Image.fromarray(a.clip(0, 255).round().astype(np.uint8), 'RGBA')

def vien_toi(img, day):
    """viền TỐI mỏng quanh mảnh (đầu): tách đầu khỏi mai cùng tông – làm rõ đầu mà không thêm vệt sáng."""
    a = np.array(img).astype(np.float32); al = a[..., 3] / 255
    ngoai = nd.binary_dilation(al > 0.5, iterations=day) & ~(al > 0.5)
    k = nd.gaussian_filter(ngoai.astype(np.float32), 0.6) * ngoai
    toi = np.array([14, 11, 10], np.float32)
    out = a.copy(); w = (k * 0.85)[..., None]
    out[..., :3] = np.where(ngoai[..., None], toi, a[..., :3]); out[..., 3] = np.maximum(a[..., 3], (k * 0.85 * 255))
    return Image.fromarray(out.clip(0, 255).round().astype(np.uint8), 'RGBA')

def nut_mai(img, muc):
    """lớp NỨT mai (mức 1: 2 vết, mức 2: thêm 3 vết dài) – vẽ đè lên mai, cùng cỡ/neo; game bật theo thanh mai."""
    W, H = img.size; al = np.array(img)[..., 3] > 200
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0)); g = ImageDraw.Draw(c)
    rnd = np.random.RandomState(7)
    VET = [((0.42, 0.18), 1.2, 0.28), ((0.66, 0.25), -0.9, 0.22), ((0.30, 0.42), 0.4, 0.33), ((0.55, 0.50), -0.3, 0.36), ((0.80, 0.45), 0.9, 0.26)]
    for i, ((u, v), huong, dai_) in enumerate(VET[:2 if muc == 1 else 5]):
        x, y = u * W, v * H; pts = [(x, y)]
        for s in range(7):
            ang = math.pi / 2 + huong * 0.6 + rnd.uniform(-0.7, 0.7)
            L = dai_ * H / 7
            x += math.cos(ang) * L * (0.6 if s % 2 else 1); y += math.sin(ang) * L; pts.append((x, y))
        g.line(pts, fill=(14, 10, 9, 255), width=3, joint='curve')
        g.line([(px - 1, py - 1) for px, py in pts], fill=(242, 214, 154, 110), width=1)   # mép vỡ bắt sáng
        for px, py in pts[2::2]:   # nhánh nhỏ
            g.line([(px, py), (px + rnd.uniform(-9, 9), py + rnd.uniform(4, 10))], fill=(14, 10, 9, 230), width=2)
    a = np.array(c); a[..., 3] = (a[..., 3] * al).astype(np.uint8)
    return Image.fromarray(a, 'RGBA')

anh = {}
for t, im in IM.items():
    g = Image.fromarray(to_mau(t, np.array(im)), 'RGBA')
    W0, H0 = im.size; w, h = max(1, round(W0 * F)), max(1, round(H0 * F))
    sm = g.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')
    can = Image.new('RGBA', (w + 2 * PAD, h + 2 * PAD), (0, 0, 0, 0)); can.paste(sm, (PAD, PAD))
    can = rim(can, *RIM_SO[t])
    if t == 'dau': can = vien_toi(can, 2)
    a = np.array(can); a[a[..., 3] == 0] = 0; can = Image.fromarray(a, 'RGBA')
    anh[t] = (can, W0, H0, w, h)
for muc in (1, 2):
    can, W0, H0, w, h = anh['mai']; anh['mai-nut-%d' % muc] = (nut_mai(can, muc), W0, H0, w, h)

# ---------------- RIG ----------------
# nút ảnh: (mảnh, cha, điểm neo TRONG mảnh nguồn, vị trí neo trong toạ độ RÁP)
def neo(t, p, dich=(0, 0)): return (TL[t][0] + p[0] + dich[0], TL[t][1] + p[1] + dich[1])
NUT = [   # tên, ảnh, cha, pivot (px mảnh nguồn), vị trí neo (toạ độ ráp) hoặc None (= gốc), mặc định hiện
    ('goc', None, None, None, (GOC_X, DAT_Y), True),
    ('than', None, 'goc', None, THAN_C, True),
    ('chan_sau_xa', 'chan-sau', 'than', (140, 25), neo('chan-sau', (140, 25), (-26, -8)), True),
    ('chan_truoc_xa', 'chan-truoc', 'than', (121, 25), neo('chan-truoc', (121, 25), (30, -8)), True),
    ('bung', 'bung', 'than', (60, 150), neo('bung', (60, 150)), True),
    ('mai', 'mai', 'than', (308, 330), neo('mai', (308, 330)), True),
    ('nut1', 'mai-nut-1', 'mai', (308, 330), None, False),
    ('nut2', 'mai-nut-2', 'mai', (308, 330), None, False),
    # Bản 4 (bỏ lật ngửa): mảng BỤNG MỀM lộ ra DƯỚI / SAU mai khi mai vỡ bật hé lệch lên trước và thân sụp sấp – cùng ảnh bụng,
    # vẽ TRƯỚC mai (mai vỡ hé ra thì thấy nó). Ẩn mặc định; clip vo_mai / sup_choang / day / chet_sup bật.
    ('bung_lo', 'bung', 'than', (177, 136), (GOC_X + 40, DINH_Y + 0.66 * (DAT_Y - DINH_Y)), False),
    ('dau', 'dau', 'than', (205, 95), neo('dau', (205, 95)), True),
    ('chan_sau', 'chan-sau', 'than', (140, 25), neo('chan-sau', (140, 25)), True),
    ('chan_truoc', 'chan-truoc', 'than', (121, 25), neo('chan-truoc', (121, 25)), True),
]
THU_TU_VE = ['chan_sau_xa', 'chan_truoc_xa', 'bung', 'bung_lo', 'mai', 'nut1', 'nut2', 'mai_m3', 'mai_m2', 'mai_m1', 'dau', 'chan_sau', 'chan_truoc']
VTRI = {}
for ten, a_, cha, piv, vt, hien in NUT:
    if vt is None: vt = VTRI[cha]
    VTRI[ten] = vt
R = {}
da_ghi = {}
for ten, a_, cha, piv, vt, hien in NUT:
    gan = [0.0, 0.0] if cha is None else [round(VTRI[ten][0] - VTRI[cha][0], 2), round(VTRI[ten][1] - VTRI[cha][1], 2)]
    r = {'cha': cha, 'gan': gan, 'goc_nghi': 0.0}
    if a_:
        can, W0, H0, w, h = anh[a_]; ten_anh = 'manh/' + a_ + '.png'
        if ten_anh not in da_ghi:
            can.save(os.path.join(ROOT, ten_anh), optimize=True)
            src = IM[a_.replace('-nut-1', '').replace('-nut-2', '')]
            al = np.array(src)[..., 3] > 32; ys, xs = np.nonzero(al)
            pts = np.concatenate([np.stack([xs, ys], 1), np.stack([xs + 1, ys + 1], 1)]).astype(float)
            hull = pts[ConvexHull(pts).vertices]
            if len(hull) > 48: hull = hull[np.linspace(0, len(hull) - 1, 48).astype(int)]
            da_ghi[ten_anh] = (can.size, hull, (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
        size, hull, hb = da_ghi[ten_anh]; kx, ky = W0 / w, H0 / h
        r.update({'anh': ten_anh, 'co_anh': list(size), 'pivot': [piv[0] + PAD * kx, piv[1] + PAD * ky],
                  'co': [(w + 2 * PAD) * kx, (h + 2 * PAD) * ky],
                  'hop_dac': [float(hb[0]) + PAD * kx, float(hb[1]) + PAD * ky, float(hb[2]) + PAD * kx, float(hb[3]) + PAD * ky],
                  'vien': [[round(x + PAD * kx, 1), round(y + PAD * ky, 1)] for x, y in hull], 'hien': hien})
    R[ten] = r
# ---- Bản 4: 3 MẢNG MAI VỠ (m1 trước · m2 giữa · m3 sau) – cắt từ ảnh mai (đã trộn 2 lớp nứt) theo 2 đường gãy răng cưa,
# mép gãy tối 3 px + vệt sáng 1 px. Con của nút 'mai' (theo mọi chuyển động của mai), điểm xoay = trọng tâm từng mảng.
# Ẩn mặc định; mai vỡ thì game / clip tắt 'mai' + 'nut1/2' và bật 3 mảng (mai vỡ GIỮ tới chết – phản hồi 5).
def tach_mai():
    can, W0, H0, w, h = anh['mai']; kx, ky = W0 / w, H0 / h
    nen_ = can.copy(); nen_.alpha_composite(anh['mai-nut-1'][0]); nen_.alpha_composite(anh['mai-nut-2'][0])
    Wc, Hc = nen_.size; rnd = np.random.RandomState(11)
    def duong(u0, u1):
        n = 10; return [((u0 + (u1 - u0) * i / n) * Wc + (rnd.uniform(-0.03, 0.03) * Wc if 0 < i < n else 0), i / n * Hc) for i in range(n + 1)]
    c1 = duong(0.37, 0.43); c2 = duong(0.69, 0.63)
    g = ImageDraw.Draw(nen_)
    for c in (c1, c2):
        g.line(c, fill=(14, 10, 9, 255), width=3, joint='curve')
        g.line([(x - 1, y) for x, y in c], fill=(242, 214, 154, 120), width=1)
    al0 = np.array(can)[..., 3]; a = np.array(nen_); a[..., 3] = np.minimum(a[..., 3], al0); nen_ = Image.fromarray(a, 'RGBA')
    vung = [[(0, 0)] + c1 + [(0, Hc)], c1 + c2[::-1], c2 + [(Wc, Hc), (Wc, 0)]]
    mai_pv = R['mai']['pivot']; ra = []
    for i, pg in enumerate(vung):
        m = Image.new('L', (Wc, Hc), 0); ImageDraw.Draw(m).polygon(pg, fill=255)
        a = np.array(nen_); a[..., 3] = (a[..., 3].astype(np.float32) * np.array(m) / 255).astype(np.uint8); a[a[..., 3] == 0] = 0
        ys, xs = np.nonzero(a[..., 3] > 32); x0, y0, x1, y1 = max(0, xs.min() - 1), max(0, ys.min() - 1), min(Wc, xs.max() + 2), min(Hc, ys.max() + 2)
        cx, cy = xs.mean(), ys.mean(); im = Image.fromarray(a[y0:y1, x0:x1], 'RGBA')
        ten = 'mai-manh-%d' % (i + 1); im.save(os.path.join(MANH, ten + '.png'), optimize=True)
        pts = np.concatenate([np.stack([xs, ys], 1), np.stack([xs + 1, ys + 1], 1)]).astype(float); hull = pts[ConvexHull(pts).vertices]
        if len(hull) > 32: hull = hull[np.linspace(0, len(hull) - 1, 32).astype(int)]
        R['mai_m%d' % (i + 1)] = {'cha': 'mai', 'goc_nghi': 0.0, 'gan': [round(cx * kx - mai_pv[0], 2), round(cy * ky - mai_pv[1], 2)],
            'anh': 'manh/' + ten + '.png', 'co_anh': list(im.size), 'pivot': [(cx - x0) * kx, (cy - y0) * ky], 'co': [im.width * kx, im.height * ky],
            'hop_dac': [float(xs.min() - x0) * kx, float(ys.min() - y0) * ky, float(xs.max() + 1 - x0) * kx, float(ys.max() + 1 - y0) * ky],
            'vien': [[round((x - x0) * kx, 1), round((y - y0) * ky, 1)] for x, y in hull], 'hien': False}
        da_ghi['manh/' + ten + '.png'] = (im.size, None, None); ra.append(ten)
    return ra
MANH_MAI = tach_mai()
DS = [n[0] for n in NUT] + ['mai_m1', 'mai_m2', 'mai_m3']
IDX = {n: i for i, n in enumerate(DS)}

# ---------------- CLIP ----------------
BUOC = 1000 / 30          # 1 khung khoá mỗi 2 bước logic; runtime nội suy tuyến tính giữa hai khung
CHAN = ['chan_truoc', 'chan_sau', 'chan_truoc_xa', 'chan_sau_xa']
def tu_the(): return {n: [0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1 if R[n].get('hien', True) else 0] for n in DS}
def nen(P):               # mọi tư thế: chân phía xa tối 45 %
    P['chan_truoc_xa'][5] = max(P['chan_truoc_xa'][5], 0.45); P['chan_sau_xa'][5] = max(P['chan_sau_xa'][5], 0.45); return P
def cong(P, n, dx=0, dy=0, goc=0, sx=1, sy=1, toi=0):
    p = P[n]; p[0] += dx; p[1] += dy; p[2] += goc; p[3] *= sx; p[4] *= sy; p[5] = max(p[5], toi)
def ease(x): x = min(1, max(0, x)); return x * x * (3 - 2 * x)
def lo_xo(t, f=6.0, tat=6.0): return math.exp(-tat * t) * math.cos(2 * math.pi * f * t)   # dao động tắt dần (t giây)
def ram(t, a, b): return ease((t - a) / (b - a)) if b > a else float(t >= a)

def buoc_chan(P, t, T, A, L, nhanh=1.0):
    """chân bước: mỗi cụm chân pha riêng; nửa chu kỳ chống (trượt về sau đúng tốc độ thân), nửa nhấc lên vung tới."""
    for n, lech in (('chan_truoc', 0.0), ('chan_sau', 0.5), ('chan_truoc_xa', 0.5), ('chan_sau_xa', 0.0)):
        u = (t / T + lech) % 1.0
        if u < 0.5: x = -A + 4 * A * u; nhac = 0.0
        else: v = (u - 0.5) * 2; x = A - 2 * A * ease(v); nhac = L * math.sin(math.pi * v)
        cong(P, n, dx=x * 0.55, dy=-nhac, goc=-x / A * 6 * nhanh)

#   BẢN 5 (phản hồi 7 mục 3): KHÔNG XUYÊN SÀN. Đầu (khi gục: sụp choáng, chết) và 3 mảng mai vỡ (khi trượt rơi lúc chết) từng thấp hơn
#   mặt đất tới 7–12 px logic (đầu lún ~1–2 px dễ thấy trên lớp mép đất). Sau khi tính tư thế, nâng các nút này theo trục y của nút cha
#   tới khi điểm thấp nhất (đường bao mảnh) ≤ DAT_CHAM px logic dưới mặt đất – bằng mức chân chạm đất (chân chống: 0–2 px).
#   Kẹp liên tục theo tư thế → chuyển động vẫn liền, chỉ phần "chìm" bị chặn lại thành "tựa lên đất".
DAT_CHAM = 1.0
KEP_DAT = ['dau', 'mai_m1', 'mai_m2', 'mai_m3']
def _ma_tran(P):
    M = {}
    for n in DS:
        r = R[n]; p = P[n]; g = math.radians(r['goc_nghi'] + p[2]); c, s = math.cos(g), math.sin(g)
        L = np.array([[c * p[3], -s * p[4], r['gan'][0] + p[0]], [s * p[3], c * p[4], r['gan'][1] + p[1]], [0, 0, 1]])
        M[n] = L if r['cha'] is None else M[r['cha']] @ L
    return M
def thap_nhat(P, n, M=None):   # điểm thấp nhất của mảnh n (px logic, dương = dưới mặt đất)
    M = M or _ma_tran(P); r = R[n]
    return max((M[n] @ np.array([u - r['pivot'][0], v - r['pivot'][1], 1]))[1] for u, v in r['vien']) * TY
def kep_dat(P):
    for n in KEP_DAT:
        if not P[n][7]: continue
        for _ in range(4):
            M = _ma_tran(P); du = thap_nhat(P, n, M) - DAT_CHAM
            if du <= 0.01: break
            ky = M[R[n]['cha']][1][1]   # dy cục bộ của cha → dy màn (thân có thể nghiêng / dẹt nhẹ)
            P[n][1] -= du / TY / max(0.3, ky)
    return P

CLIPS = {}
def clip(ten, ms, lap, fn, mo_ta, buoc=BUOC):
    n = int(round(ms / buoc)) if lap else int(round(ms / buoc)) + 1
    kh = []
    for i in range(n):
        t = i * buoc / 1000.0; P = tu_the(); fn(P, t); nen(P); kep_dat(P)
        kh.append([[round(v, 3) if j < 7 else int(v) for j, v in enumerate(P[nn])] for nn in DS])
    CLIPS[ten] = {'ten': mo_ta, 'ms': round(n * buoc if lap else (n - 1) * buoc, 3), 'buoc_ms': round(buoc, 4), 'lap': lap,
                  'giu_khung_cuoi': not lap, 'pha': None, 'khung_cham': [], 'cua_so_cham_ms': None, 'hop_don': None, 'su_kien': None, 'khung': kh}

TOC_DI = 36.0             # px logic / s (game: 0,6 px / bước)
T_DI = 0.80
A_DI = TOC_DI / TY * T_DI / 4      # biên độ chân (px nguồn) để chân chống không trượt
def f_dung(P, t):
    w = 2 * math.pi * t / 1.6
    cong(P, 'mai', dy=2.5 * math.sin(w), sy=1 + 0.006 * math.sin(w)); cong(P, 'bung', sx=1 + 0.018 * math.sin(w - 0.6), sy=1 + 0.012 * math.sin(w - 0.6))
    cong(P, 'dau', goc=1.5 * math.sin(w - 1.0), dy=1.5 * math.sin(w - 0.8))
def f_di(P, t):
    w = 2 * math.pi * t / T_DI
    nhun = 7.0 * (0.5 + 0.5 * math.cos(2 * w))           # 2 nhịp nhún mỗi chu kỳ (mỗi bước chân)
    cong(P, 'than', dy=-nhun, goc=1.0 * math.sin(2 * w))
    for n in CHAN: cong(P, n, dy=nhun)                   # chân bù lại: bàn chân vẫn trên đất
    buoc_chan(P, t, T_DI, A_DI, 26)
    cong(P, 'mai', dy=3.5 * math.cos(2 * w - 0.9), goc=0.8 * math.sin(2 * w - 0.9))   # mai nhấp nhô trễ nhịp
    cong(P, 'dau', goc=2.2 * math.sin(2 * w - 1.3), dx=3 * math.sin(w))
    cong(P, 'bung', goc=1.2 * math.sin(2 * w - 1.6), sx=1 + 0.012 * math.sin(2 * w - 1.6))
# BÁO TRƯỚC cú húc: 30 bước = 0,5 s. Cúi đầu, hạ thân, chân sau đạp; mai RUNG mạnh dần + 2 lần KHÉP MAI GÕ (bước 12, 23)
GO = [0.200, 0.383]
def f_bao(P, t):
    k = ram(t, 0, 0.18)
    cong(P, 'than', dy=10 * k, goc=-3.5 * k, dx=6 * k)
    cong(P, 'dau', goc=-15 * k, dx=-8 * k, dy=10 * k)
    cao = max(0.0, math.sin(2 * math.pi * 7.5 * t)) * ram(t, 0.06, 0.16)          # chân sau CÀO đất lùi (cùng nhịp bụi trong game)
    cong(P, 'chan_sau', dx=10 * k + 9 * cao, goc=-6 * k - 10 * cao, dy=-4 * cao); cong(P, 'chan_sau_xa', dx=10 * k + 9 * (1 - cao) * k, goc=-6 * k)
    cong(P, 'chan_truoc', dx=-5 * k); cong(P, 'chan_truoc_xa', dx=-5 * k)
    for n in CHAN: cong(P, n, dy=-10 * k)
    amp = 6 * ram(t, 0.05, 0.45)
    cong(P, 'mai', dx=amp * math.sin(2 * math.pi * 15 * t), goc=1.6 * ram(t, 0.05, 0.45) * math.sin(2 * math.pi * 15 * t + 1))
    for g in GO:
        if g <= t < g + 0.1: s = math.sin(math.pi * (t - g) / 0.1); cong(P, 'mai', dy=14 * s, sy=1 - 0.03 * s)
    cong(P, 'bung', sy=1 - 0.04 * k, sx=1 + 0.03 * k)
T_HUC = 0.22
def f_huc(P, t):
    cong(P, 'than', dy=8, goc=-4.5, dx=4)
    cong(P, 'dau', goc=-16, dx=-18, dy=12)
    cong(P, 'mai', goc=-1.5, dy=2 * math.sin(2 * math.pi * t / T_HUC * 2))
    for n in CHAN: cong(P, n, dy=-8)
    buoc_chan(P, t, T_HUC, 36, 22, 1.4)
def f_hoi(P, t):   # sau cú húc (0,67 s): ngẩng lên lắc đầu, thân lắng về – lúc này dễ bị vòng ra sau
    k = 1 - ram(t, 0, 0.30)
    cong(P, 'than', dy=8 * k, goc=-4.5 * k + 3 * math.sin(math.pi * ram(t, 0.08, 0.40)), dx=4 * k)
    cong(P, 'dau', goc=-16 * k + 9 * math.sin(math.pi * ram(t, 0.12, 0.42)) + 5 * lo_xo(max(0, t - 0.3), 5, 5) * (t > 0.3),
         dx=-18 * k, dy=12 * k)
    cong(P, 'mai', dx=5 * lo_xo(t, 4.5, 4), goc=1.2 * lo_xo(t, 4.5, 4))
    for n in CHAN: cong(P, n, dy=-8 * k)
# QUAY ĐẦU (bản 4) – kiểu game 2D (lật gương TỨC THÌ trong 1 bước, che bằng tư thế trước / sau), KHÔNG co dẹt ngang qua 0.
# Game lật hướng ở bước 12 (= 200 ms). Clip khoá MỖI BƯỚC (16,7 ms) để khung 11 (trước) và 12 (sau) không bị nội suy lẫn nhau.
#   0–200 ms  HÃM: chân trước cắm, thân dồn ra sau + ngả nhẹ, đầu rụt vào mai, mai trễ theo
#   200 ms    LẬT GƯƠNG (game) – thân đang dồn về phía cũ = phía TRƯỚC mới, đầu vẫn rụt → bóng gần đối xứng, đổi hướng không lộ
#   200–400   mai nảy nhẹ (quán tính), thân về giữa, chân bước lại tại chỗ, đầu thò ra
QUAY_LAT = 0.200
DON = 34.0          # thân dồn ra sau (px nguồn ≈ 5,4 px logic)
def f_quay(P, t):
    if t < QUAY_LAT - 1e-6:
        k = ease(t / 0.13)
        cong(P, 'than', dx=DON * k, dy=9 * k, goc=2.2 * k, sy=1 - 0.02 * k)
        cong(P, 'mai', dx=-6 * math.sin(math.pi * min(1, t / 0.16)), goc=-1.2 * k)          # mai trễ một nhịp
        cong(P, 'dau', dx=48 * k, dy=12 * k, goc=8 * k)                                    # rụt vào dưới mép mai
        for n in ('chan_truoc', 'chan_truoc_xa'): cong(P, n, dx=-DON * k - 10 * k, dy=-9 * k, goc=-12 * k)   # cắm: giữ chỗ trên đất, chống chéo
        for n in ('chan_sau', 'chan_sau_xa'): cong(P, n, dx=-DON * k + 4 * k, dy=-9 * k, goc=5 * k, sy=1 - 0.06 * k)
        cong(P, 'bung', sx=1 + 0.03 * k, sy=1 - 0.03 * k)
        return
    s = t - QUAY_LAT; u = min(1.0, s / 0.2)
    v = 1 - ease(min(1, s / 0.15))                                                          # thân về giữa trong 150 ms
    cong(P, 'than', dx=-DON * v, dy=9 * v, goc=-2.2 * v, sy=1 - 0.02 * v)                   # thân giữ CHỖ cũ trên màn (đã lật)
    b = lo_xo(s, 5.5, 9)
    cong(P, 'mai', dy=-11 * max(0.0, b) + 4 * max(0.0, -b), goc=2.0 * b, dx=-7 * b)         # mai nảy nhẹ do quán tính
    r = 1 - ram(s, 0.06, 0.18)
    cong(P, 'dau', dx=48 * r, dy=12 * r, goc=8 * r - 3 * math.sin(math.pi * ram(s, 0.12, 0.2)))   # đầu thò ra
    for n, lech in (('chan_truoc', 0.0), ('chan_sau', 0.5), ('chan_truoc_xa', 0.5), ('chan_sau_xa', 0.0)):
        cong(P, n, dx=DON * v - 0.0, dy=-9 * v)                                            # chân giữ chỗ (bù thân về giữa)
        w = ((u * 2 + lech) % 1.0) if u < 1 else 0.0                                        # 2 nhịp bước tại chỗ
        cong(P, n, dy=-14 * math.sin(math.pi * w) * (1 - ram(u, 0.8, 1.0)), goc=4 * math.sin(2 * math.pi * w) * (1 - u))
def f_keng(P, t):   # trúng MAI (0,23 s): mai dội về sau, đầu rụt vào, thân nén – không đau
    s = lo_xo(t, 7, 9)
    cong(P, 'mai', dx=12 * s, goc=3.5 * s, dy=-3 * s)
    cong(P, 'than', dx=7 * s, sy=1 - 0.025 * max(0, s), sx=1 + 0.01 * max(0, s))   # PH4: nén thân NHẸ hơn (để co bụng nổi bật hơn)
    r = 1 - ram(t, 0.04, 0.22)
    cong(P, 'dau', dx=18 * r * ram(t, 0, 0.03), dy=5 * r * ram(t, 0, 0.03), goc=-4 * r)
def f_dau(P, t):    # trúng BỤNG (0,27 s): CẢ THÂN CO LẠI (gập ngắn + dẹt), bụng thắt mạnh, chân quắp, đầu ngẩng đau
    s = lo_xo(t, 5.5, 6); co = math.sin(math.pi * ram(t, 0, 0.16)) * (t < 0.16) + max(0, s) * 0.5 * (t >= 0.16)
    # PH4: co RÕ hơn (bụng thắt 24 → 34 %, thân hẹp 10 → 15 %, dẹt 6 → 10 %) – phải đọc được khi chớp đã ngắn lại
    cong(P, 'bung', sx=1 - 0.34 * co - 0.06 * s, sy=1 + 0.12 * co, goc=-4 * s, dx=-18 * co)
    cong(P, 'than', goc=-5 * s, dx=-6 * s, sx=1 - 0.15 * co, sy=1 - 0.10 * co, dy=6 * co)
    cong(P, 'dau', goc=12 * (1 - ram(t, 0.05, 0.27)) * ram(t, 0, 0.05), dy=-4 * (1 - ram(t, 0.05, 0.27)))
    cong(P, 'mai', dy=-6 * max(0, s))
    for n in CHAN: cong(P, n, goc=6 * s)
# ---------------- VỠ MAI · CHOÁNG · DẬY · CHẾT (bản 4: bỏ lật ngửa) ----------------
# Mai vỡ = 3 mảng (mai_m1 trước, m2 giữa, m3 sau). LECH_* = độ lệch [dx, dy, goc] (px nguồn, độ) của từng mảng so với chỗ liền:
#   CHOÁNG: mảng trước bật hé lên-ra trước, mảng sau vểnh đuôi lên → lộ khe + mảng bụng mềm phía sau/dưới.
#   ĐỨNG (mai vỡ giữ tới chết – PH5): lệch nhỏ hơn, vẫn thấy rõ mai không liền. Game đặt LECH_DUNG cho mọi clip thường khi mai đã vỡ.
LECH_CHOANG = {'mai_m1': (-26, -30, 13), 'mai_m2': (-4, -12, -3), 'mai_m3': (16, -20, -15)}
LECH_DUNG = {'mai_m1': (-10, -11, 6), 'mai_m2': (-2, -4, -1.5), 'mai_m3': (7, -8, -6)}
SUP = 76.0          # thân sụp xuống (px nguồn ≈ 12 px logic): bụng / mép mai gần chạm đất
def mai_vo(P, lech, k=1.0):
    P['mai'][7] = 0; P['nut1'][7] = 0; P['nut2'][7] = 0
    for n, (dx, dy, g) in lech.items(): P[n][7] = 1; cong(P, n, dx=dx * k, dy=dy * k, goc=g * k)
def tron_lech(a, b, u): return {n: tuple(a[n][i] + (b[n][i] - a[n][i]) * u for i in range(3)) for n in a}
def sup(P, k, run=0.0, t=0.0):
    """k: 0 = đứng, 1 = sụp sấp. Chân khuỵu (gập ngắn, xoè), thân hạ thấp chúi nhẹ về trước; chân vẫn bám đất."""
    cong(P, 'than', dy=SUP * k, goc=-3.0 * k)
    for n in CHAN:
        tr = 'truoc' in n
        cong(P, n, dy=-SUP * k + (6 if tr else 2) * k, dx=(-16 if tr else 18) * k, goc=(22 if tr else -20) * k, sy=1 - 0.42 * k)
        if run: cong(P, n, goc=run * math.sin(2 * math.pi * 11 * t + (1.3 if tr else 0) + (0.7 if 'xa' in n else 0)))   # run nhẹ
    cong(P, 'dau', dy=16 * k, dx=6 * k, goc=-9 * k)                                        # đầu gục xuống sát đất
    cong(P, 'bung', dy=6 * k, sy=1 - 0.05 * k)
def bung_lo(P, mo, tho=0.0):
    P['bung_lo'][7] = 1 if mo > 0.01 else 0; P['bung_lo'][6] = mo
    cong(P, 'bung_lo', sx=1.18 + tho * 0.03, sy=0.92 + tho * 0.05, goc=-6, dy=-44)
def f_vo_mai(P, t):   # VỠ MAI (0,5 s, game 'lat' 30 bước): giật, mai vỡ bật hé lên-ra trước, thân sụp sấp, chân khuỵu
    g = math.sin(math.pi * ram(t, 0, 0.07)) * (t < 0.07)
    cong(P, 'than', dy=-8 * g)
    k = ram(t, 0.05, 0.26); bo = lo_xo(max(0, t - 0.26), 5, 9) * (t > 0.26)
    sup(P, k); cong(P, 'than', dy=-7 * max(0.0, bo))
    for n in CHAN: cong(P, n, dy=7 * max(0.0, bo))
    if t >= 0.034:
        p = ram(t, 0.03, 0.16); vot = 1 + 0.35 * math.sin(math.pi * ram(t, 0.03, 0.30))     # bật quá đà rồi lắng
        mai_vo(P, LECH_CHOANG, p * vot if t < 0.30 else 1 + 0.12 * lo_xo(t - 0.30, 6, 10))
    bung_lo(P, ram(t, 0.10, 0.30))
def f_sup_choang(P, t):   # CHOÁNG (lặp 1,2 s): nằm sấp BẤT ĐỘNG, bụng mềm lộ thở chậm, mai vỡ hé
    # BẢN 5 (phản hồi 7 mục 3, bản sạch): bỏ chân run (2,2° 11 Hz) và mảng mai lắc; thân chỉ phập phồng 1 px nguồn → đọc là "nằm im";
    # chỉ còn bụng lộ thở (dấu hiệu còn sống). Game vẽ thêm MỘT vết nứt tĩnh trên mai (khoi-bo.js veVetNut) thay 3 chấm quay.
    w = 2 * math.pi * t / 1.2
    sup(P, 1.0)
    cong(P, 'than', dy=1.0 * math.sin(w))
    mai_vo(P, LECH_CHOANG)
    bung_lo(P, 1.0, math.sin(w))
    cong(P, 'bung', sx=1 + 0.025 * math.sin(w - 0.5), sy=1 + 0.03 * math.sin(w - 0.5))
def f_day(P, t):    # ĐỨNG DẬY (0,5 s): chân chống, thân nhấc (2 nhịp), mai vỡ vẫn lệch
    k = 1 - ram(t, 0.05, 0.40) ** 0.8
    if t < 0.18: k = 1 - 0.18 * math.sin(math.pi * t / 0.18)                                 # nhấc thử một lần rồi khuỵu lại
    else: k = (1 - ram(t, 0.20, 0.42)) * 0.9 + 0.1 * (1 - ram(t, 0.30, 0.42))
    sup(P, k, run=1.5 * k, t=t)
    if t > 0.42: b = lo_xo(t - 0.42, 4.5, 9); cong(P, 'than', dy=5 * max(0.0, -b))
    mai_vo(P, tron_lech(LECH_CHOANG, LECH_DUNG, ram(t, 0.18, 0.44)))
    bung_lo(P, 1 - ram(t, 0.22, 0.42))
CHET_MANH = {'mai_m1': (-44, 34, -50), 'mai_m2': (6, 40, 20), 'mai_m3': (52, 30, 52)}   # mảng trượt / rơi xuống đất (cộng thêm vào độ lệch đang có)
def chet_chung(P, t, k0):
    """k0: độ sụp lúc bắt đầu (0 đứng / 1 đang choáng). Khựng → chân khuỵu, thân đổ sụp → mai nứt tách 3 mảng trượt rơi → bụng xẹp → nằm im."""
    kh = math.sin(math.pi * ram(t, 0, 0.10)) * (t < 0.10)
    cong(P, 'than', dy=-5 * kh * (1 - k0)); cong(P, 'dau', goc=5 * kh)                     # khựng
    k = k0 + (1 - k0) * ram(t, 0.10, 0.42) ** 1.6                                           # đổ nặng: chậm rồi nhanh
    sup(P, k, run=(2.0 * k0 * (1 - ram(t, 0, 0.3))), t=t)
    cong(P, 'than', dy=10 * ram(t, 0.38, 0.55))                                             # dồn hết sức nặng xuống đất
    for n in CHAN: cong(P, n, dy=-10 * ram(t, 0.38, 0.55), sy=1 - 0.1 * ram(t, 0.38, 0.55))
    if t >= 0.30 or k0 > 0.5:
        lech = LECH_CHOANG if k0 > 0.5 else {n: (0, 0, 0) for n in LECH_CHOANG}
        mai_vo(P, lech)
        for i, (n, (dx, dy, g)) in enumerate(CHET_MANH.items()):
            u = ram(t, 0.32 + 0.05 * i, 0.72 + 0.05 * i) ** 1.4; nay = 3 * max(0.0, lo_xo(max(0, t - 0.72 - 0.05 * i), 6, 10)) * (t > 0.72 + 0.05 * i)
            cong(P, n, dx=dx * u, dy=dy * u - nay * 3, goc=g * u, toi=0.18 * ram(t, 0.6, 1.0))
    xep = ram(t, 0.30, 0.85)
    cong(P, 'bung', sx=1 + 0.08 * xep, sy=1 - 0.38 * xep, dy=18 * xep, toi=0.35 * xep)
    bung_lo(P, k0 * (1 - 0.0 * xep)); cong(P, 'bung_lo', sy=1 - 0.4 * xep, dy=14 * xep, toi=0.35 * xep)
    cong(P, 'dau', dy=12 * ram(t, 0.2, 0.6), goc=-10 * ram(t, 0.2, 0.6), toi=0.3 * ram(t, 0.4, 0.95))
    for n in CHAN: cong(P, n, toi=0.2 * ram(t, 0.5, 1.0))
def f_chet(P, t): chet_chung(P, t, 0.0)          # chết khi đang đứng (game cộng LECH_DUNG nếu mai đã vỡ từ trước)
def f_chet_sup(P, t): chet_chung(P, t, 1.0)      # chết khi đang sụp choáng

clip('dung', 1600, True, f_dung, 'đứng thở')
clip('di', T_DI * 1000, True, f_di, 'đi (chân bước, mai nhấp nhô) – phát theo QUÃNG ĐƯỜNG: %.0f px logic/chu kỳ' % (TOC_DI * T_DI))
clip('bao', 500, False, f_bao, 'báo trước cú húc 0,5 s: cúi đầu, rung mai, 2 lần khép mai gõ (ms 200, 383)')
clip('huc', T_HUC * 1000, True, f_huc, 'lao húc (lặp chân chạy nhanh, thân chúi, đầu cúi)')
clip('hoi', 667, False, f_hoi, 'hồi sau húc: ngẩng đầu lắc, thân lắng')
clip('quay', 400, False, f_quay, 'quay đầu: hãm (thân dồn sau, đầu rụt) → game lật gương TỨC THÌ ở bước 12 → mai nảy, bước tại chỗ, đầu thò ra', buoc=1000 / 60)
clip('keng', 233, False, f_keng, 'bị đánh vào mai: keng, dội, rụt đầu')
clip('dau', 267, False, f_dau, 'bị đánh vào bụng: giật, mất máu')
clip('vo_mai', 500, False, f_vo_mai, 'vỡ mai: mai bật hé lệch lên trước, thân sụp sấp, chân khuỵu, lộ bụng mềm')
clip('sup_choang', 1200, True, f_sup_choang, 'choáng (lặp): nằm sấp, chân run nhẹ, bụng thở, mai vỡ hé')
clip('day', 500, False, f_day, 'đứng dậy: chân chống, thân nhấc, mai vỡ vẫn lệch')
clip('chet', 1000, False, f_chet, 'chết: khựng, chân khuỵu, thân đổ sụp, mai nứt tách 3 mảng trượt rơi, bụng xẹp (game làm tan vụn)')
clip('chet_sup', 1000, False, f_chet_sup, 'chết khi đang sụp choáng')

# ---------------- HỘP THÂN (gameplay) ----------------
def bao_tu_the(P):
    """hộp bao các mảnh (px logic, so với điểm neo, quay trái) – ma trận giống QBR.ve."""
    M = {}
    x0 = y0 = 1e9; x1 = y1 = -1e9
    for n in DS:
        r = R[n]; p = P[n]; g = math.radians(r['goc_nghi'] + p[2]); c, s = math.cos(g), math.sin(g)
        L = np.array([[c * p[3], -s * p[4], r['gan'][0] + p[0]], [s * p[3], c * p[4], r['gan'][1] + p[1]], [0, 0, 1]])
        M[n] = L if r['cha'] is None else M[r['cha']] @ L
        if 'anh' in r and p[7]:
            for u, v in r['vien']:
                q = M[n] @ np.array([u - r['pivot'][0], v - r['pivot'][1], 1]); x0, x1 = min(x0, q[0]), max(x1, q[0]); y0, y1 = min(y0, q[1]), max(y1, q[1])
    return [x0 * TY, y0 * TY, x1 * TY, y1 * TY], M
def P_khung(ten, i):
    k = CLIPS[ten]['khung'][i]; return {n: k[j] for j, n in enumerate(DS)}
hop_nghi, _ = bao_tu_the(P_khung('dung', 0))
hop_lat, _ = bao_tu_the(P_khung('sup_choang', 0))
print('dáng nghỉ (px logic, so với neo):', [round(v, 1) for v in hop_nghi], 'cao', round(hop_nghi[3] - hop_nghi[1], 1), 'rộng', round(hop_nghi[2] - hop_nghi[0], 1))
print('sụp choáng:', [round(v, 1) for v in hop_lat])
BUNG_X = (TL['bung'][0] + 40 - GOC_X) * TY   # mép trước phần bụng lộ ra (px logic, quay trái → dương = phía sau)
out = {'phien_ban': 1,
       'ghi_chu': 'Sinh bởi art/huong-moi/quai-rig/bo-vo-moc/code/dung_rig.py. Cùng định dạng game/runtime/quai-boss/quai-moi-rig.json '
                  '(QBR.napThem). Toạ độ rig = px mảnh nguồn, nhân vật QUAY TRÁI; ảnh mảnh 2 px/px logic. Tư thế khung: '
                  '[dx,dy,goc,sx,sy,toi,mo,hien] theo nut_ds. nut1/nut2 = lớp nứt mai (game bật theo thanh mai). Không có kênh nháy trắng.',
       'px_anh_moi_px_logic': PX,
       'nv': {'bo': {'ten': 'Bọ Vỏ Mộc', 'ty_le': TY, 'cao_px_logic': round(hop_nghi[3] - hop_nghi[1], 1),
                     'hop_nghi_logic': [round(v, 1) for v in hop_nghi], 'hop_sup_choang_logic': [round(v, 1) for v in hop_lat],
                     'mai_vo_lech_dung': {n: list(v) for n, v in LECH_DUNG.items()},
                     'bung_tu_x_logic': round(BUNG_X, 1),
                     'hitbox_than_de_xuat': {'w': 108, 'h': 62, 'ghi_chu': 'hộp thân gameplay, đáy = mặt đất, giữa = điểm neo'},
                     'nut_ds': DS, 'nut': R, 'thu_tu_ve': THU_TU_VE, 'clip': CLIPS,
                     'huong': 'quay trái; quay phải = lật ngang quanh điểm neo'}}}
tong = {'anh': len(da_ghi), 'byte_png': sum(os.path.getsize(os.path.join(ROOT, a)) for a in da_ghi),
        'byte_giai_ma': sum(s[0] * s[1] * 4 for s, _, _ in da_ghi.values())}
out['tong'] = tong
p = os.path.join(ROOT, 'bo-vo-moc-rig.json')
json.dump(out, open(p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('ghi', p, os.path.getsize(p), 'byte;', tong, 'TY', round(TY, 5))

# ---------------- VẼ KIỂM (Python, cùng ma trận với QBR.ve) ----------------
ANH = {a: Image.open(os.path.join(ROOT, a)) for a in da_ghi}
def ve(P, k=1.0, nen_=(23, 39, 44, 255), co=(300, 150), neo_=None, lat=False, bo=None):
    """vẽ tư thế ở k px màn / px logic (k=2: đúng ảnh mảnh 2x, không phóng)."""
    c = Image.new('RGBA', co, nen_)
    neo_ = neo_ or (co[0] / 2, co[1] - 16)
    _, M = bao_tu_the(P)
    for n in THU_TU_VE:
        r = R[n]; p = P[n]
        if not p[7] or 'anh' not in r: continue
        im = ANH[r['anh']]; sxp = r['co'][0] / im.width; syp = r['co'][1] / im.height
        A = M[n].copy()
        # ảnh px → rig: (i*sxp − pivot) ; rig → màn: neo + TY*k*(±x, y)
        S = np.array([[(-1 if lat else 1) * TY * k, 0, neo_[0]], [0, TY * k, neo_[1]], [0, 0, 1]])
        T = S @ A @ np.array([[sxp, 0, -r['pivot'][0]], [0, syp, -r['pivot'][1]], [0, 0, 1]])
        inv = np.linalg.inv(T)
        lop = im.transform(co, Image.AFFINE, tuple(inv[:2].flatten()), resample=Image.BICUBIC)
        if p[5] > 0:
            a = np.array(lop).astype(np.float32); a[..., :3] *= (1 - p[5]); a[..., :3] += np.array([12, 15, 20]) * p[5]; lop = Image.fromarray(a.clip(0, 255).astype(np.uint8))
        if p[6] < 1:
            a = np.array(lop); a[..., 3] = (a[..., 3] * p[6]).astype(np.uint8); lop = Image.fromarray(a)
        c.alpha_composite(lop)
    return c

if __name__ == '__main__':
    # 1) ráp so với nguyên con (cỡ ảnh nguồn thu 0,5)
    P0 = P_khung('dung', 0)
    kR = 0.5 / TY   # px màn / px logic để ra cỡ nửa ảnh nguồn
    nc = Image.open(os.path.join(GOC, 'nguyen-con.png')); nc = nc.resize((round(nc.width * 0.5 / K_NC), round(nc.height * 0.5 / K_NC)), Image.LANCZOS)
    rap = ve(P0, kR, co=(nc.width + 40, nc.height + 40), neo_=((GOC_X - X_TRAI) * 0.5 + 20, (DAT_Y - DINH_Y) * 0.5 + 20 + 9))
    g = Image.new('RGBA', (rap.width * 2 + 10, rap.height), (23, 39, 44, 255)); t0 = Image.new('RGBA', rap.size, (23, 39, 44, 255)); t0.alpha_composite(nc, (20, 20))
    g.paste(t0, (0, 0)); g.paste(rap, (rap.width + 10, 0)); g.convert('RGB').save(os.path.join(KIEM, 'rap-so-nguyen-con.png'))
    # 2) tách lớp: mỗi mảnh một ô (2x, đúng ảnh mảnh)
    xs = 8; W_ = sum(ANH[a].width + 8 for a in ANH) + 8; H_ = max(ANH[a].height for a in ANH) + 16
    tl = Image.new('RGBA', (W_, H_), (23, 39, 44, 255))
    for a, im in ANH.items(): tl.alpha_composite(im, (xs, 8)); xs += im.width + 8
    tl.convert('RGB').save(os.path.join(KIEM, 'manh-2x.png'))
    # 3) bản 4: tư thế chính (2 px ảnh / px logic, không phóng nearest). Quay: khung sau bước 12 vẽ LẬT GƯƠNG như game.
    HANG = [[('quay', 0, 0), ('quay', 100, 0), ('quay', 183, 0), ('quay', 200, 1), ('quay', 267, 1), ('quay', 400, 1)],
            [('vo_mai', 0, 0), ('vo_mai', 100, 0), ('vo_mai', 200, 0), ('sup_choang', 300, 0), ('day', 250, 0), ('day', 500, 0)],
            [('chet', 50, 0), ('chet', 300, 0), ('chet', 450, 0), ('chet', 600, 0), ('chet', 1000, 0), ('chet_sup', 1000, 0)]]
    Wc, Hc = 300, 180; tt = Image.new('RGBA', (Wc * 6, Hc * 3), (23, 39, 44, 255))
    for j, hang in enumerate(HANG):
        for i, (cn, ms, lt) in enumerate(hang):
            c = CLIPS[cn]; P = P_khung(cn, min(len(c['khung']) - 1, int(round(ms / c['buoc_ms']))))
            o = ve(P, 2.0, co=(Wc, Hc), neo_=(Wc / 2, Hc - 24), lat=bool(lt)); d = ImageDraw.Draw(o)
            d.line([(0, Hc - 24), (Wc, Hc - 24)], fill=(101, 80, 60, 255)); d.text((4, 4), '%s %d ms%s' % (cn, ms, ' (lat guong)' if lt else ''), fill=(242, 214, 154, 255))
            tt.alpha_composite(o, (i * Wc, j * Hc))
    tt.convert('RGB').save(os.path.join(KIEM, 'tu-the-ban-4.png'))
    print('ghi kiem/*.png')
