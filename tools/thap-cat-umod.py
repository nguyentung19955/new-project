#!/usr/bin/env python3
"""TURRET MERGE — cắt 93 ụ MODULE (ChatGPT, lưới 2×2 nền magenta) thành bệ riêng + đầu xoay + phần phụ + icon thẻ.

Nguồn: docs/demo-hop-tuong/thap-art/raw_mod_<id>.png (có raw_mod_<id>_v2.png thì dùng bản v2)
       ô 1 lắp sẵn · ô 2 BASE · ô 3 HEAD (nòng hướng LÊN) · ô 4 PART_B (PHAN-HO.md / KET-QUA.md).
Ra (thap/assets/):
  <id>_de.png    bệ riêng: vuông, TÂM ẢNH = trục xoay (tâm khung bao bệ) → render.js than() vẽ cỡ SB × DE_RIENG[id]
  <id>_nong.png  đầu: xoay 90° (nòng hướng PHẢI như mọi đầu ụ), TÂM ẢNH = trục xoay → vẽ cỡ ô × HEAD_K[id]
  <id>_phu.png   phần phụ (ô 4), cùng mật độ điểm ảnh với đầu → cỡ vẽ = ô × PHU_K[id]
  nho/<id>.png   icon thẻ 192 px = bệ + đầu dựng như ô 1 (đầu chĩa lên)
Ghi số vào thap/js/artscale.js: HEAD_K (93 id), window.DE_RIENG, window.PHU_K, window.UMOD_TIP (mũi nòng → ART_META.tip).

Cách làm (QUY-TAC-HINH mục 5 + KET-QUA mục 1):
  - tách nền: LOANG từ viền từng ô (không key magenta toàn cục) + vũng magenta kín bên trong (vòng, khung) cũng là nền;
  - bỏ đảo điểm ảnh rời (vụn xa khối chính); giữ chi tiết nhỏ nằm sát khối chính (giọt, tia lấp lánh, dây cung đứt);
  - viền: lõi đặc giữ nguyên, dải ~1 px lấy alpha mềm theo độ lệch magenta + tách trộn nền (không viền hồng);
  - vị trí/tỉ lệ đầu và bệ trong ô 1: so mẫu nhiều tỉ lệ (SQDIFF có mặt nạ) → trục xoay = tâm bệ đưa về ô 3;
  - mọi ụ nằm TRONG Ô ở MỌI GÓC XOAY: bán kính xa nhất của đầu tính từ trục ≤ R_MAX ô → thu cả ụ nếu vượt;
  - thu Lanczos nhân-trước-alpha, loang màu ra mép trong suốt.
  <id>_vien.png  viền bậc TRẮNG (vát kim loại) ôm hình bóng bệ, cùng tâm, khung = bệ + 12 px mỗi phía → render.js tô màu bậc (REN.vienBac)
Chạy: python3 tools/thap-cat-umod.py [id …]      (OUT=… để ghi chỗ khác; KHONG_JS=1 không sửa artscale.js)
      CHI_VIEN=1 python3 tools/thap-cat-umod.py [id …]   chỉ dựng lại <id>_vien.png từ <id>_de.png có sẵn (VIEN_PX=8 độ dày)
In bảng đo + ghi docs/demo-hop-tuong/tuvan/u-moi/cat-game.json (khớp, thu nhỏ, đảo đã bỏ).
"""
import os, sys, json, re
import numpy as np, cv2
from PIL import Image
from scipy import ndimage as nd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art')
OUT = os.environ.get('OUT', os.path.join(GOC, 'thap/assets'))
JS = os.path.join(GOC, 'thap/js')
BAO = os.environ.get('BAO', os.path.join(GOC, 'docs/demo-hop-tuong/tuvan/u-moi/cat-game.json'))
SB_C0 = 0.714 * 0.98      # bệ vẽ = 0.714 × S, S = 0.98 × cạnh ô (render.js than())
PX_DE = 250               # điểm ảnh / cạnh ô của bệ (thap-kt-min3x: ~218 cần ở ô lớn nhất)
PX_DAU = 300              # điểm ảnh / cạnh ô của đầu (r ≤ 1.0)
R_MAX = 0.485             # bán kính xa nhất của đầu (tính từ trục) / cạnh ô — chừa 1,5% cho giật nòng
BE_MAX = 0.70             # cạnh lớn nhất của bệ / cạnh ô (= bệ chung cũ)
M = np.array([1.0, 0.0, 1.0])
# ô 1 vẽ KHÁC các bộ phận (so mẫu sai, đã soát bằng mắt ảnh KT=…): trục = điểm sâu nhất trong đầu (tâm đường tròn nội tiếp lớn nhất),
# tỉ lệ đầu/bệ = trung vị các ụ khớp tốt. set: ô 1 có vòng cuộn chồng giữa (khớp bệ sai cỡ); pandora: ô 1 bình đậy nắp, ô 3 miệng mở; bua: đầu (mũi đục) khớp nhầm cỡ; thanhdia: tấm 4:3, ô 1 mái chùa cao.
KHONG_KHOP = {'set', 'pandora', 'bua', 'thanhdia'}
REL_TB = 0.90
# phần phụ vẽ NGAY TẠI TRỤC trong game (ô 1 có nó ở giữa): set = vòng cuộn Tesla, mauhut = trái tim trong vòng, combo = lõi sáng
PHU_GIUA = {'set': 'duoi', 'mauhut': 'duoi', 'combo': 'tren'}


def nguon(i):
    p2 = os.path.join(RAW, 'raw_mod_%s_v2.png' % i)
    return p2 if os.path.exists(p2) else os.path.join(RAW, 'raw_mod_%s.png' % i)


def o_luoi(a):
    H, W = a.shape[:2]; h2, w2 = H // 2, W // 2
    return [a[r * h2:(r + 1) * h2, c * w2:(c + 1) * w2] for r in (0, 1) for c in (0, 1)]


def tach(c):
    """c: RGB uint8 → (mặt nạ hình, số đảo đã bỏ). Nền = vùng hồng loang từ viền ô + vũng magenta kín rõ."""
    r, g, b = (c[..., k].astype(np.int32) for k in range(3))
    d = np.sqrt((r - 255) ** 2 + g ** 2 + (b - 255) ** 2)
    cand = (d < 110) | ((r > 150) & (b > 150) & (g < 90) & (np.abs(r - b) < 70))
    lab, n = nd.label(cand)
    vien = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    nen = np.isin(lab, list(vien))
    if n:  # vũng kín bên trong (lỗ vòng, khung): đủ to + rất magenta → nền
        sz = nd.sum(np.ones_like(d), lab, range(1, n + 1)); md = nd.median(d, lab, range(1, n + 1))
        kin = [k + 1 for k in range(n) if (k + 1) not in vien and sz[k] >= 30 and md[k] < 45]
        if kin: nen |= np.isin(lab, kin)
    fg = ~nen
    lab2, n2 = nd.label(fg, structure=np.ones((3, 3)))
    bo = []
    if n2 > 1:
        sz = nd.sum(fg, lab2, range(1, n2 + 1)); big = sz.max()
        chinh = np.zeros(n2 + 1, bool)
        for k, s in enumerate(sz, 1): chinh[k] = s >= 0.02 * big
        gan = nd.binary_dilation(chinh[lab2], iterations=int(0.06 * c.shape[0]))   # vùng sát khối chính
        giu = chinh.copy()
        for k, s in enumerate(sz, 1):
            if chinh[k]: continue
            if s >= 12 and gan[lab2 == k].any(): giu[k] = True
            else: bo.append(int(s))
        fg = giu[lab2]
    return fg, bo


def khoa(a, m):
    """RGBA thẳng (float): lõi đặc alpha 1, dải viền ~1 px alpha mềm từ độ lệch magenta + tách trộn nền."""
    loi = nd.binary_erosion(m, iterations=2)
    vien = nd.binary_dilation(m, iterations=1) & ~loi
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    al = np.clip((np.maximum.reduce([1 - r, 1 - b, g]) - 0.045) / 0.955, 0, 1)
    A = np.where(loi, 1.0, np.where(vien, al, 0.0))
    As = nd.gaussian_filter(A, 0.5)
    A = np.where(vien, np.minimum(As, A + 0.25), A)
    F = np.where(vien[..., None], (a - (1 - al[..., None]) * M) / np.maximum(al[..., None], 1e-3), a)
    F = np.clip(F, 0, 1)
    # dải viền còn ánh hồng (r,b ≫ g) sau tách trộn → kéo r,b về gần g (không viền hồng)
    mn = np.minimum(F[..., 0], F[..., 2]); hong = vien & (mn > F[..., 1] + 0.12)
    for ch in (0, 2): F[..., ch] = np.where(hong, np.maximum(F[..., 1] + 0.12, F[..., ch] - (mn - F[..., 1] - 0.12)), F[..., ch])
    A[A < 0.02] = 0; F[A == 0] = 0
    # điểm ảnh lẻ còn sót ngoài khối (alpha > 0 nhưng không nối với khối chính)
    lab, n = nd.label(A > 0, structure=np.ones((3, 3)))
    if n > 1:
        sz = nd.sum(A > 0, lab, range(1, n + 1)); A[~np.isin(lab, [k + 1 for k in range(n) if sz[k] >= 12])] = 0
    return np.dstack([F, A])


def bbox(m):
    ys, xs = np.nonzero(m); return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def khop(o1, c, m, rim=False, lo=0.6, hi=1.12):
    """vị trí + tỉ lệ đặt mẫu c (RGBA ô 3/ô 2, mặt nạ m) vào ô 1 → (s, x0, y0, sai số) theo toạ độ khung bao mẫu."""
    x0, y0, x1, y1 = bbox(m)
    T = (c[y0:y1, x0:x1, :3] * 255).astype(np.float32); Mk = m[y0:y1, x0:x1].astype(np.float32)
    if rim:  # bệ: chỉ so phần vành (giữa thường bị đầu che)
        dt = nd.distance_transform_edt(Mk > 0); Mk = ((dt > 0) & (dt <= 0.14 * max(Mk.shape))).astype(np.float32)
    I = o1.astype(np.float32)
    best = None
    def thu(s, I2, q):
        w, h = int(round(T.shape[1] * s * q)), int(round(T.shape[0] * s * q))
        if w < 8 or h < 8 or w >= I2.shape[1] or h >= I2.shape[0]: return None
        t = cv2.resize(T, (w, h), interpolation=cv2.INTER_AREA); mk = cv2.resize(Mk, (w, h), interpolation=cv2.INTER_AREA)
        mk = (mk > 0.6).astype(np.float32); n = mk.sum()
        if n < 30: return None
        R = cv2.matchTemplate(I2, t, cv2.TM_SQDIFF, mask=np.dstack([mk] * 3))
        R[~np.isfinite(R)] = 1e18
        v, _, p, _ = cv2.minMaxLoc(R)
        return v / (n * 3), p
    q = 0.4; I2 = cv2.resize(I, None, fx=q, fy=q, interpolation=cv2.INTER_AREA)
    for s in np.arange(lo, hi + 1e-6, 0.02):
        r = thu(s, I2, q)
        if r and (best is None or r[0] < best[0]): best = (r[0], s, r[1][0] / q, r[1][1] / q)
    _, s0, _, _ = best; best = None
    for s in np.arange(s0 - 0.03, s0 + 0.031, 0.005):
        r = thu(s, I, 1.0)
        if r and (best is None or r[0] < best[0]): best = (r[0], s, r[1][0], r[1][1])
    e, s, px, py = best
    return float(s), float(px - x0 * s), float(py - y0 * s), float(e)   # ô1 = ô_mẫu × s + (px, py)


def dat_giua(c, px, py, half):
    N = int(np.ceil(half * 2)); o = np.zeros((N, N, 4))
    x0, y0 = int(round(px - N / 2)), int(round(py - N / 2)); H, W = c.shape[:2]
    sx0, sy0, sx1, sy1 = max(0, x0), max(0, y0), min(W, x0 + N), min(H, y0 + N)
    o[sy0 - y0:sy1 - y0, sx0 - x0:sx1 - x0] = c[sy0:sy1, sx0:sx1]
    return o


def thu(c, m):
    pm = c.copy(); pm[..., :3] *= pm[..., 3:4]
    ch = [np.asarray(Image.fromarray(pm[..., k].astype(np.float32), 'F').resize((m, m), Image.LANCZOS)) for k in range(4)]
    pm = np.clip(np.dstack(ch), 0, 1); al = pm[..., 3:4]
    rgb = np.where(al > 1e-3, pm[..., :3] / np.maximum(al, 1e-3), 0)
    return np.dstack([np.clip(rgb, 0, 1), al[..., 0]])


def loang(rgb, a, buoc=4):
    dac = a > 0.8; out = rgb * dac[..., None]; wt = dac.astype(np.float32)
    k = np.array([[1, 2, 1], [2, 4, 2], [1, 2, 1]], np.float32)
    for _ in range(buoc):
        s = np.stack([nd.convolve(out[..., i], k, mode='nearest') for i in range(3)], -1)
        sw = nd.convolve(wt, k, mode='nearest'); moi = (wt == 0) & (sw > 0)
        out[moi] = s[moi] / sw[moi, None]; wt[moi] = 1
    return np.where((a < 0.98)[..., None] & (wt[..., None] > 0), out, rgb)


def anh(c):
    c = c.copy(); c[..., :3] = loang(c[..., :3], c[..., 3]); c[c[..., 3] < 0.008] = 0
    return Image.fromarray((c * 255).round().astype(np.uint8), 'RGBA')


def luu(c, ten):
    im = anh(c); im.save(os.path.join(OUT, ten + '.png'), optimize=True); return im


# --- VIỀN BẬC (người dùng 07/11 18:25): <id>_vien.png = viền kim loại TRẮNG ôm sát hình bóng bệ (game tô màu theo bậc lúc chạy).
# Lấy từ alpha bệ (rãnh tối 1–2 px sát bệ rồi dải màu): nở VIEN_PX px (ở cỡ ảnh bệ ≈ 0,85 px màn DPR 3) trừ lõi bệ co 1 px (viền luồn 1 px dưới mép bệ → không hở),
# mép ngoài mềm 1 px; độ sáng = vát kim loại (sáng trên-trái, tối dưới-phải) + gờ sáng mảnh ở mép ngoài.
# Khung ảnh = khung bệ + VIEN_PAD mỗi phía, CÙNG TÂM → render.js vẽ cỡ SD × (cạnh viền / cạnh bệ).
VIEN_PX = float(os.environ.get('VIEN_PX', 8))
VIEN_PAD = 12


def vien(im_de):
    a = np.asarray(im_de.convert('RGBA')).astype(np.float64)[..., 3] / 255
    a = np.pad(a, VIEN_PAD)
    m = a > 0.5
    dt = nd.distance_transform_edt(~m)                                   # khoảng cách tới bệ (px)
    ngoai = np.clip(VIEN_PX + 0.5 - dt, 0, 1)                            # nở VIEN_PX, mép ngoài mềm 1 px
    loi = nd.binary_erosion(m, iterations=1)
    al = ngoai * (1 - loi)
    # vát: pháp tuyến từ mặt nạ nở đã làm mờ, ánh sáng từ trên-trái
    h = nd.gaussian_filter(ngoai, 1.6)
    gy, gx = np.gradient(h)
    n = np.hypot(gx, gy) + 1e-6
    lam = (-gx * -0.62 + -gy * -0.78) / n                                # pháp tuyến hướng ra ngoài · hướng sáng (trên-trái)
    lum = 0.72 + 0.28 * lam
    gio = np.clip(1 - np.abs(dt - (VIEN_PX - 1.2)) / 1.1, 0, 1) * np.clip(lam, 0, 1)   # gờ sáng mảnh ở mép ngoài phía sáng
    lum = np.clip(lum + 0.25 * gio, 0, 1)
    ranh = np.clip(1 - np.abs(dt - 1.2) / 1.3, 0, 1)                     # rãnh tối mảnh sát mép bệ: tách viền khỏi bệ (bệ vàng + viền vàng vẫn đọc được)
    lum = lum * (1 - 0.7 * ranh)
    lum = np.where(dt < 0.5, 0.3, lum)                                   # phần luồn dưới mép bệ: tối
    out = np.zeros(a.shape + (4,)); out[..., 0] = out[..., 1] = out[..., 2] = lum; out[..., 3] = al
    out[out[..., 3] < 0.01] = 0
    return Image.fromarray((out * 255).round().astype(np.uint8), 'RGBA')


def luu_vien(i, im_de=None):
    im_de = im_de or Image.open(os.path.join(OUT, i + '_de.png'))
    vien(im_de).save(os.path.join(OUT, i + '_vien.png'), optimize=True)


def mui(dau):
    """mũi nòng (đầu đã xoay nòng → PHẢI): điểm đặc xa nhất bên phải trong dải giữa ±8%, theo nửa cạnh ảnh"""
    a = dau[..., 3] > 0.5; h, w = a.shape; b = a[int(h * .42):int(h * .58)]
    xs = np.nonzero(b.any(0))[0]
    return round(float((xs.max() + 1 - w / 2) / (w / 2)), 3) if len(xs) else 0.9


def mot(i):
    a8 = np.asarray(Image.open(nguon(i)).convert('RGB'))
    O = o_luoi(a8); F = [o.astype(np.float64) / 255 for o in O]
    T = [tach(o) for o in O]
    m1, m2, m3, m4 = (t[0] for t in T)
    c2, c3 = khoa(F[1], m2), khoa(F[2], m3)
    # --- khớp bệ & đầu vào ô 1
    sb, bx, by, eb = khop(O[0], c2, c2[..., 3] > 0.5, rim=True, lo=0.86, hi=1.14)
    sh, hx, hy, eh = khop(O[0], c3, c3[..., 3] > 0.5)
    if os.environ.get('KT'):  # ảnh kiểm khớp: ô 1 | bệ + đầu dựng lại theo số khớp
        Hh, Ww = O[0].shape[:2]; cv = Image.new('RGBA', (Ww, Hh), (255, 0, 255, 255))
        for cc, s, x, y in ((c2, sb, bx, by), (c3, sh, hx, hy)):
            im = anh(cc); im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
            cv.alpha_composite(im, (int(round(x)), int(round(y)))) if x >= 0 and y >= 0 else cv.paste(im, (int(round(x)), int(round(y))), im)
        sh2 = Image.new('RGB', (Ww * 2, Hh)); sh2.paste(Image.fromarray(O[0]), (0, 0)); sh2.paste(cv.convert('RGB'), (Ww, 0))
        os.makedirs(os.environ['KT'], exist_ok=True); sh2.resize((Ww, Hh // 2)).save(os.path.join(os.environ['KT'], i + '.png'))
    # trục = tâm khung bao bệ (ô 2) → ô 1 → ô 3
    x0, y0, x1, y1 = bbox(c2[..., 3] > 0)
    px, py = (x0 + x1) / 2, (y0 + y1) / 2
    bmax = max(x1 - x0, y1 - y0)
    qx, qy = (px * sb + bx - hx) / sh, (py * sb + by - hy) / sh       # trục trong toạ độ ô 3
    rel = sh / sb                                                      # 1 px ô 3 = rel px ô 2
    if i in KHONG_KHOP:
        dt = nd.gaussian_filter(nd.distance_transform_edt(c3[..., 3] > 0.5), 2)
        qy, qx = (float(v) for v in np.unravel_index(np.argmax(dt), dt.shape)); rel = REL_TB
    ys3, xs3 = np.nonzero(c3[..., 3] > 0.02)
    rH = np.sqrt((xs3 + 0.5 - qx) ** 2 + (ys3 + 0.5 - qy) ** 2).max()  # bán kính xa nhất của đầu (px ô 3)
    g = SB_C0 / bmax * (BE_MAX / 0.7)                                   # cạnh ô / px ô 2 (bệ to bằng bệ chung cũ)
    f = min(1.0, R_MAX / (rH * rel * g))                                # thu cả ụ nếu đầu xoay lòi khỏi ô
    g *= f
    # --- BỆ
    half = max(px - x0, x1 - px, py - y0, y1 - py) + 3
    de = dat_giua(c2, px, py, half)
    kde = 2 * half / bmax * f                                           # render: SD = SB × kde
    nde = int(round(PX_DE * 2 * half * g))
    im_de = luu(thu(de, nde), i + '_de')
    luu_vien(i, im_de)
    # --- ĐẦU: khung vuông tâm = trục, nửa cạnh = rH + 3
    hh = rH + 3
    dau = np.rot90(dat_giua(c3, qx, qy, hh), -1).copy()
    K = round(2 * hh * rel * g, 4)
    im_dau = luu(thu(dau, int(round(PX_DAU * K))), i + '_nong')
    tip = mui(dau)
    # --- PHẦN PHỤ (ô 4): vuông quanh tâm khung bao, cùng mật độ với đầu
    phuK = None
    if m4.sum() > 200:
        c4 = khoa(F[3], m4); X0, Y0, X1, Y1 = bbox(c4[..., 3] > 0)
        h4 = max(X1 - X0, Y1 - Y0) / 2 + 3
        phu = dat_giua(c4, (X0 + X1) / 2, (Y0 + Y1) / 2, h4)
        phuK = round(2 * h4 * rel * g, 4)
        luu(thu(phu, max(8, int(round(PX_DAU * phuK)))), i + '_phu')
    # --- ICON THẺ nho/<id>.png: dựng lại như ô 1 (đầu chĩa lên), 192 px, phần hình chiếm ≤ 88%
    N = 192
    Wd = max(kde * SB_C0, K)                                            # bề rộng cần (đơn vị cạnh ô)
    sc = 0.94 / Wd
    ic = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    b = int(round(N * kde * SB_C0 * sc)); ic.alpha_composite(im_de.resize((b, b), Image.LANCZOS), ((N - b) // 2, (N - b) // 2))
    dd = int(round(N * K * sc))
    def dan_phu():
        p4 = Image.open(os.path.join(OUT, i + '_phu.png')).convert('RGBA'); n4 = int(round(N * phuK * sc))
        ic.alpha_composite(p4.resize((n4, n4), Image.LANCZOS), ((N - n4) // 2, (N - n4) // 2))
    if phuK and PHU_GIUA.get(i) == 'duoi': dan_phu()
    hd = im_dau.convert('RGBa').resize((dd, dd), Image.LANCZOS).convert('RGBA').rotate(90, Image.BICUBIC)
    ic.alpha_composite(hd, ((N - dd) // 2, (N - dd) // 2))
    if phuK and PHU_GIUA.get(i) == 'tren': dan_phu()
    bb = ic.getbbox()
    if bb:  # căn giữa theo khung bao thực + phóng cho phần hình chiếm 88%
        cr = ic.crop(bb); s2 = 0.88 * N / max(cr.size)
        cr = cr.convert('RGBa').resize((max(1, round(cr.width * s2)), max(1, round(cr.height * s2))), Image.LANCZOS).convert('RGBA')
        ic = Image.new('RGBA', (N, N), (0, 0, 0, 0)); ic.alpha_composite(cr, ((N - cr.width) // 2, (N - cr.height) // 2))
    os.makedirs(os.path.join(OUT, 'nho'), exist_ok=True)
    ic.save(os.path.join(OUT, 'nho', i + '.png'), optimize=True)
    return {'nguon': os.path.basename(nguon(i)), 'DE_RIENG': round(kde, 4), 'HEAD_K': K, 'PHU_K': phuK, 'tip': float(tip),
            'thu': round(f, 3), 'khop_be': [round(sb, 3), round(eb, 4)], 'khop_dau': [round(sh, 3), round(eh, 4)],
            'truc_o3': [round(qx, 1), round(qy, 1)], 'dao_bo': {'o%d' % (k + 1): T[k][1] for k in range(4) if T[k][1]},
            'co': {'de': im_de.size[0], 'nong': im_dau.size[0]}}


def js_obj(txt, ten):
    m = re.search(r'window\.' + ten + r' = (.*);[ \t]*$', txt, re.M); return json.loads(m.group(1)) if m else None


def js_set(txt, ten, obj, ghichu=''):
    s = 'window.' + ten + ' = ' + json.dumps(obj, ensure_ascii=False) + ';'
    m = re.search(r'window\.' + ten + r' = (.*);[ \t]*$', txt, re.M)
    if m: return txt[:m.start()] + s + txt[m.end():]
    return txt.rstrip('\n') + '\n' + (ghichu + '\n' if ghichu else '') + s + '\n'


def main():
    roster = [r['id'] for r in json.load(open(os.path.join(GOC, 'thap/assets/roster.json'), encoding='utf-8'))]
    if os.environ.get('CHI_VIEN'):  # chỉ dựng lại <id>_vien.png từ <id>_de.png đã có (không cần ảnh gốc ChatGPT)
        for i in sys.argv[1:] or [i for i in roster if os.path.exists(os.path.join(OUT, i + '_de.png'))]: luu_vien(i)
        return
    ids = sys.argv[1:] or [i for i in roster if os.path.exists(nguon(i))]
    bao = json.load(open(BAO, encoding='utf-8')) if os.path.exists(BAO) else {}
    for i in ids:
        bao[i] = mot(i)
        r = bao[i]; print(i, 'K', r['HEAD_K'], 'de', r['DE_RIENG'], 'thu', r['thu'], 'khop', r['khop_be'], r['khop_dau'], 'dao', r['dao_bo'] or '')
    json.dump(bao, open(BAO, 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)
    if os.environ.get('KHONG_JS'): return
    p = os.path.join(JS, 'artscale.js'); t = open(p, encoding='utf-8').read()
    hk = js_obj(t, 'HEAD_K')
    for i, r in bao.items(): hk[i] = r['HEAD_K']
    t = js_set(t, 'HEAD_K', hk)
    ghi = '// claude/u-module (tools/thap-cat-umod.py): ụ module — bệ riêng <id>_de (cỡ = bệ chung × DE_RIENG), phần phụ <id>_phu (cỡ = ô × PHU_K), mũi nòng mới UMOD_TIP'
    t = js_set(t, 'DE_RIENG', {i: r['DE_RIENG'] for i, r in sorted(bao.items())}, ghi)
    t = js_set(t, 'PHU_K', {i: r['PHU_K'] for i, r in sorted(bao.items()) if r['PHU_K']})
    t = js_set(t, 'PHU_GIUA', PHU_GIUA)
    t = js_set(t, 'UMOD_TIP', {i: r['tip'] for i, r in sorted(bao.items())})
    open(p, 'w', encoding='utf-8').write(t)


if __name__ == '__main__':
    main()
