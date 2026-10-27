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
GRADE = {'mai': (0.38, 1.12, 0.82), 'dau': (0.38, 1.28, 0.92), 'chan-truoc': (0.38, 1.05, 0.76), 'chan-sau': (0.38, 1.05, 0.76),
         'bung': (0.22, 1.0, 0.80)}   # bụng: giữ màu ngà (điểm yếu phải SÁNG hơn mai) nhưng dịu và tối hơn ảnh gốc
# PH3 mục 3–4 (không tăng viền sáng toàn thân): mai TỐI hơn chút (0,84 → 0,82); ĐẦU tương phản 1,12 → 1,28, sáng 0,86 → 0,92;
# BỤNG nâng sáng một chút, kéo về XÁM ĐẤT NHẠT (bớt ngà vàng, gần mai ít hơn về độ sáng chứ không về độ rực)
XAM_DAT = '#B9AE9C'; BUNG_XAM = 0.38; BUNG_SANG = 1.06
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
    # PH3: mảng BỤNG MỀM lộ khi LẬT NGỬA – cùng ảnh bụng, đặt ở mặt dưới thân (lật sy=−1 → nằm trên mai), vẽ SAU mai.
    # Ẩn mặc định; clip lat / lat_giu / day / chet_lat bật + mờ dần vào (lat_tu_the).
    ('bung_lat', 'bung', 'than', (177, 136), (GOC_X - 14, DINH_Y + 0.64 * (DAT_Y - DINH_Y)), False),
    ('dau', 'dau', 'than', (205, 95), neo('dau', (205, 95)), True),
    ('chan_sau', 'chan-sau', 'than', (140, 25), neo('chan-sau', (140, 25)), True),
    ('chan_truoc', 'chan-truoc', 'than', (121, 25), neo('chan-truoc', (121, 25)), True),
]
THU_TU_VE = ['chan_sau_xa', 'chan_truoc_xa', 'bung', 'mai', 'nut1', 'nut2', 'bung_lat', 'dau', 'chan_sau', 'chan_truoc']
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
DS = [n[0] for n in NUT]
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

CLIPS = {}
def clip(ten, ms, lap, fn, mo_ta, buoc=BUOC):
    n = int(round(ms / buoc)) if lap else int(round(ms / buoc)) + 1
    kh = []
    for i in range(n):
        t = i * buoc / 1000.0; P = tu_the(); fn(P, t); nen(P)
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
def f_quay(P, t):   # 0,4 s; game lật hướng ở giữa (bước 12) – lúc thân hẹp nhất
    u = t / 0.4; s = 1 - 0.42 * math.sin(math.pi * min(1, u))
    cong(P, 'than', sx=s, dy=5 * math.sin(math.pi * min(1, u)))
    cong(P, 'dau', goc=-7 * math.sin(math.pi * min(1, u)))
    for n in CHAN: cong(P, n, dy=-5 * math.sin(math.pi * min(1, u)))
    buoc_chan(P, t, 0.4, 14, 16)
def f_keng(P, t):   # trúng MAI (0,23 s): mai dội về sau, đầu rụt vào, thân nén – không đau
    s = lo_xo(t, 7, 9)
    cong(P, 'mai', dx=12 * s, goc=3.5 * s, dy=-3 * s)
    cong(P, 'than', dx=7 * s, sy=1 - 0.04 * max(0, s), sx=1 + 0.02 * max(0, s))
    r = 1 - ram(t, 0.04, 0.22)
    cong(P, 'dau', dx=18 * r * ram(t, 0, 0.03), dy=5 * r * ram(t, 0, 0.03), goc=-4 * r)
def f_dau(P, t):    # trúng BỤNG (0,27 s): CẢ THÂN CO LẠI (gập ngắn + dẹt), bụng thắt mạnh, chân quắp, đầu ngẩng đau
    s = lo_xo(t, 5.5, 6); co = math.sin(math.pi * ram(t, 0, 0.16)) * (t < 0.16) + max(0, s) * 0.5 * (t >= 0.16)
    cong(P, 'bung', sx=1 - 0.24 * co - 0.06 * s, sy=1 + 0.10 * co, goc=-3 * s, dx=-14 * co)
    cong(P, 'than', goc=-5 * s, dx=-6 * s, sx=1 - 0.10 * co, sy=1 - 0.06 * co, dy=4 * co)
    cong(P, 'dau', goc=12 * (1 - ram(t, 0.05, 0.27)) * ram(t, 0, 0.05), dy=-4 * (1 - ram(t, 0.05, 0.27)))
    cong(P, 'mai', dy=-6 * max(0, s))
    for n in CHAN: cong(P, n, goc=6 * s)
LAT_DY = 0.0   # thân ở GIỮA chiều cao → lật sy=−1 thì đỉnh mai rơi đúng mặt đất, không cần dời
def lat_tu_the(P, t_lat, u):
    """u: 0 = đứng, 1 = nằm ngửa. Lật quanh trục ngang qua tâm thân (sy 1 → −1), bật lên giữa chừng."""
    sy = math.cos(math.pi * ease(u)); hop = math.sin(math.pi * u)
    cong(P, 'than', sy=sy if abs(sy) > 0.08 else math.copysign(0.08, sy if sy else 1), dy=-70 * hop + LAT_DY * ease(u), goc=10 * hop)
    # mảng bụng mềm: hiện từ lúc đã lật quá nửa, to 1,5 × bụng (đủ lớn để đọc "chỗ mềm" ở cỡ 74 px)
    if u > 0.5: P['bung_lat'][7] = 1; P['bung_lat'][6] = ram(u, 0.5, 0.8)
    cong(P, 'bung_lat', sx=1.5, sy=1.05, goc=-4)
def f_lat(P, t):    # VỠ MAI → bị hất lật ngửa (0,5 s)
    nen_ = math.sin(math.pi * ram(t, 0, 0.12)) * (t < 0.12)
    cong(P, 'than', dy=10 * nen_, sy=1 - 0.05 * nen_)
    u = ram(t, 0.10, 0.36)
    lat_tu_the(P, t, u)
    if t > 0.36: b = lo_xo(t - 0.36, 4, 7); cong(P, 'than', dy=-10 * max(0, b), sx=1 + 0.06 * max(0, -b))
    for n in CHAN: cong(P, n, goc=18 * math.sin(2 * math.pi * 6 * t) * u * (1 if 'truoc' in n else -1))
    cong(P, 'dau', goc=-10 * u)
def f_lat_giu(P, t):   # nằm ngửa giãy (lặp 0,6 s): chân quờ trên không, thân lắc trên mai, bụng thở gấp
    lat_tu_the(P, t, 1.0)
    w = 2 * math.pi * t / 0.6
    cong(P, 'than', goc=2.5 * math.sin(w), dx=4 * math.sin(w))
    for i, n in enumerate(CHAN):
        cong(P, n, goc=20 * math.sin(2 * w + i * 1.7), dx=6 * math.sin(2 * w + i * 1.7))
    cong(P, 'bung', sx=1 + 0.035 * math.sin(2 * w), sy=1 + 0.03 * math.sin(2 * w + 0.5))
    cong(P, 'bung_lat', sx=1 + 0.04 * math.sin(2 * w), sy=1 + 0.06 * math.sin(2 * w + 0.5))
    cong(P, 'dau', goc=-10 + 6 * math.sin(w + 0.7))
def f_day(P, t):    # lật lại (0,5 s): lắc mạnh 2 nhịp rồi bật úp xuống
    w = 2 * math.pi * t / 0.25
    u = 1 - ram(t, 0.22, 0.42)
    lat_tu_the(P, t, u)
    cong(P, 'than', goc=7 * math.sin(w) * (t < 0.22))
    if t > 0.42: b = lo_xo(t - 0.42, 4, 8); cong(P, 'than', dy=-6 * max(0, b), sy=1 - 0.04 * max(0, -b))
    for n in CHAN: cong(P, n, goc=14 * math.sin(2 * w) * u)
    cong(P, 'dau', goc=-10 * u)
def f_chet(P, t):   # chết (0,9 s): giật, MAI BẬT RA rơi ra sau, BỤNG XẸP, thân sụp, đầu gục
    g = math.sin(math.pi * ram(t, 0, 0.12)) * (t < 0.12)
    cong(P, 'than', dy=-8 * g, sy=1 + 0.04 * g)
    u = ram(t, 0.10, 0.75)
    cong(P, 'than', dy=58 * ease(ram(t, 0.12, 0.45)))
    for n in CHAN: cong(P, n, dy=-58 * ease(ram(t, 0.12, 0.45)), sy=1 - 0.25 * ram(t, 0.12, 0.45),
                        goc=(14 if 'truoc' in n else -14) * ram(t, 0.12, 0.45), dx=(-14 if 'truoc' in n else 14) * ram(t, 0.12, 0.45))
    bay = ram(t, 0.12, 0.62); roi = ram(t, 0.40, 0.75)
    cong(P, 'mai', dx=130 * ease(bay), dy=-55 * math.sin(math.pi * min(1, bay * 1.25)) + 66 * roi, goc=22 * ease(bay) - 6 * roi)
    if t > 0.75: cong(P, 'mai', dy=-5 * max(0, lo_xo(t - 0.75, 4, 9)))
    xep = ram(t, 0.25, 0.85)
    cong(P, 'bung', sx=1 + 0.10 * xep, sy=1 - 0.42 * xep, dy=40 * xep, dx=-10 * xep, toi=0.35 * xep)
    cong(P, 'dau', goc=-20 * ram(t, 0.2, 0.6), dy=30 * ram(t, 0.2, 0.6), toi=0.3 * ram(t, 0.4, 0.9))
def f_chet_lat(P, t):   # chết khi đang nằm ngửa: chân co lại, ngừng giãy, bụng xẹp
    lat_tu_the(P, t, 1.0)
    k = 1 - ram(t, 0, 0.6)
    for i, n in enumerate(CHAN): cong(P, n, goc=16 * k * math.sin(2 * math.pi * 3 * t + i) + 10 * (1 - k) * (1 if 'truoc' in n else -1), sy=1 - 0.3 * (1 - k))
    xep = ram(t, 0.15, 0.8)
    cong(P, 'bung', sx=1 + 0.08 * xep, sy=1 - 0.35 * xep, toi=0.35 * xep)
    cong(P, 'bung_lat', sx=1 + 0.06 * xep, sy=1 - 0.35 * xep, toi=0.35 * xep)
    cong(P, 'dau', goc=-10 - 8 * xep, toi=0.3 * xep)

clip('dung', 1600, True, f_dung, 'đứng thở')
clip('di', T_DI * 1000, True, f_di, 'đi (chân bước, mai nhấp nhô) – phát theo QUÃNG ĐƯỜNG: %.0f px logic/chu kỳ' % (TOC_DI * T_DI))
clip('bao', 500, False, f_bao, 'báo trước cú húc 0,5 s: cúi đầu, rung mai, 2 lần khép mai gõ (ms 200, 383)')
clip('huc', T_HUC * 1000, True, f_huc, 'lao húc (lặp chân chạy nhanh, thân chúi, đầu cúi)')
clip('hoi', 667, False, f_hoi, 'hồi sau húc: ngẩng đầu lắc, thân lắng')
clip('quay', 400, False, f_quay, 'quay đầu (game lật hướng ở giữa clip)')
clip('keng', 233, False, f_keng, 'bị đánh vào mai: keng, dội, rụt đầu')
clip('dau', 267, False, f_dau, 'bị đánh vào bụng: giật, mất máu')
clip('lat', 500, False, f_lat, 'vỡ mai → lật ngửa')
clip('lat_giu', 600, True, f_lat_giu, 'nằm ngửa choáng (lặp)')
clip('day', 500, False, f_day, 'lật lại, đứng dậy')
clip('chet', 900, False, f_chet, 'chết: mai rơi, bụng xẹp')
clip('chet_lat', 800, False, f_chet_lat, 'chết khi đang nằm ngửa')

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
hop_lat, _ = bao_tu_the(P_khung('lat_giu', 0))
print('dáng nghỉ (px logic, so với neo):', [round(v, 1) for v in hop_nghi], 'cao', round(hop_nghi[3] - hop_nghi[1], 1), 'rộng', round(hop_nghi[2] - hop_nghi[0], 1))
print('nằm ngửa:', [round(v, 1) for v in hop_lat])
BUNG_X = (TL['bung'][0] + 40 - GOC_X) * TY   # mép trước phần bụng lộ ra (px logic, quay trái → dương = phía sau)
out = {'phien_ban': 1,
       'ghi_chu': 'Sinh bởi art/huong-moi/quai-rig/bo-vo-moc/code/dung_rig.py. Cùng định dạng game/runtime/quai-boss/quai-moi-rig.json '
                  '(QBR.napThem). Toạ độ rig = px mảnh nguồn, nhân vật QUAY TRÁI; ảnh mảnh 2 px/px logic. Tư thế khung: '
                  '[dx,dy,goc,sx,sy,toi,mo,hien] theo nut_ds. nut1/nut2 = lớp nứt mai (game bật theo thanh mai). Không có kênh nháy trắng.',
       'px_anh_moi_px_logic': PX,
       'nv': {'bo': {'ten': 'Bọ Vỏ Mộc', 'ty_le': TY, 'cao_px_logic': round(hop_nghi[3] - hop_nghi[1], 1),
                     'hop_nghi_logic': [round(v, 1) for v in hop_nghi], 'hop_nam_ngua_logic': [round(v, 1) for v in hop_lat],
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
    print('ghi kiem/*.png')
