#!/usr/bin/env python3
# TURRET MERGE — ẢNH GỐC cho trùm LĂN/QUAY/BÒ vẽ bằng code (đợt 2 sau thử 08/11 — quaianim.js TRUM_ANIM_CODE).
# Cắt từ 1 khung dải đi trum_<id>_8.png (không gen ảnh mới, không thêm tay chân / mắt):
#   trum_<id>_m.png       thân (cùng cỡ ô dải đi → K8 giữ nguyên); phần "nắp" đã gỡ ra được vá bằng chính hoa văn quanh đó
#   trum_<id>_m_nap.png   nắp KHÔNG lăn (jammer: ăng-ten + vòng hào quang · patcher: giá chữ X + cờ lê) — code giữ thẳng đứng, lắc trễ
#   trum_<id>_m_sang.png  lớp sáng (nhoè mềm) — code nhấp nháy bằng 'lighter'
#   trum_hive_m_ong.png   3 con ong tách khỏi tổ (dải 3 ô vuông, tâm ô = tâm ong) — code cho bay vòng quanh, không lăn theo tổ
# Chạy (gốc repo): python3 tools/thap-trum-master-lan.py [id ...]     (gỡ lỗi: XEM=thư_mục → ảnh xem nhanh trên nền màu)
import os
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

A = 'thap/assets/'
XEM = os.environ.get('XEM')


def khung(id_, k):
    im = Image.open(A + 'trum_%s_8.png' % id_).convert('RGBA')
    s = im.size[1]
    return np.asarray(im.crop((k * s, 0, k * s + s, s))).astype(np.float32) / 255.0


def hsv(p):
    r, g, b = p[..., 0], p[..., 1], p[..., 2]
    mx, mn = p[..., :3].max(-1), p[..., :3].min(-1)
    d = mx - mn + 1e-6
    h = np.where(mx == r, (g - b) / d % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    return h, d / (mx + 1e-6), mx


def luu(p, ten):
    Image.fromarray((np.clip(p, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGBA').save(A + ten, optimize=True)
    print('  ->', A + ten)
    if XEM:
        os.makedirs(XEM, exist_ok=True)
        im = Image.fromarray((np.clip(p, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGBA')
        bg = Image.new('RGBA', im.size, (38, 64, 120, 255)); bg.alpha_composite(im)
        bg.convert('RGB').save(os.path.join(XEM, ten.replace('.png', '.jpg')), quality=88)


def nhoe(p, r):  # nhoè nhân-trước-alpha (không viền đen)
    pm = p.copy(); pm[..., :3] *= pm[..., 3:4]
    o = np.stack([nd.gaussian_filter(pm[..., c], r) for c in range(4)], -1)
    o[..., :3] /= np.maximum(o[..., 3:4], 1e-4)
    return o


def lop_sang(p, nguong, hue, vung=None):  # như thap-trum-master.py; vung = mặt nạ giới hạn (tuỳ chọn)
    h, s, v = hsv(p)
    lum = p[..., 0] * 0.3 + p[..., 1] * 0.59 + p[..., 2] * 0.11
    w = np.clip((np.maximum(lum, v * 0.92) - nguong) / (1 - nguong), 0, 1) * p[..., 3]
    if hue:
        a, b = hue
        w *= (h >= a) & (h <= b) & (s > 0.35)
    if vung is not None: w *= vung
    w = nd.grey_opening(w, size=3)
    g = p.copy(); g[..., 3] = w
    return nhoe(g, max(2, p.shape[0] / 110))


def luoi(S):
    yy, xx = np.mgrid[0:S, 0:S]
    return (xx + 0.5) / S, (yy + 0.5) / S


def va_khuech_tan(p, lo, vung):  # vá vùng lo (trong vung) bằng trung bình lân cận lan dần (như vá vương miện mad_crown)
    q = p.copy(); m = vung & ~lo
    for _ in range(400):
        moi = lo & vung & ~m
        if not moi.any(): break
        pm = q[..., :3] * m[..., None]
        sm = sum(np.roll(np.roll(pm, dy, 0), dx, 1) for dy in (-1, 0, 1) for dx in (-1, 0, 1))
        cn = sum(np.roll(np.roll(m, dy, 0), dx, 1) for dy in (-1, 0, 1) for dx in (-1, 0, 1)).astype(np.float32)
        moi &= cn > 0
        q[moi, :3] = sm[moi] / cn[moi][:, None]; q[moi, 3] = 1
        m |= moi
    return q


def va_trung_vi(p, lo, c, r_max):
    # vá vùng lo có bán kính < r_max quanh c bằng TRUNG VỊ màu cùng bán kính (vòng đồng tâm liền, không kéo vệt sọc)
    S = p.shape[0]; xx, yy = luoi(S)
    rb = np.floor(np.hypot(xx - c[0], yy - c[1]) * S).astype(int)
    q = p.copy(); nguon = ~lo & (p[..., 3] > 0.5); cu = None
    for r in range(int(r_max * S) + 1):
        o = lo & (rb == r)
        n = nguon & (rb == r)
        if n.sum() >= 3: cu = np.median(p[n], axis=0)
        if o.any() and cu is not None: q[o] = cu  # bán kính bị nắp che trọn vòng: dùng vòng trong gần nhất
    return q


def va_cuc(p, lo, vung, c, chu_ky):
    # vá theo TOẠ ĐỘ CỰC quanh tâm quay c: điểm thiếu lấy điểm cùng bán kính lệch k·chu_ky (răng cưa lặp lại) — hoa văn
    # đồng tâm/bánh răng liền mạch khi quay; bán kính nào thiếu trọn vòng thì vá lan (va_khuech_tan)
    S = p.shape[0]; xx, yy = luoi(S)
    dx, dy = xx - c[0], yy - c[1]
    rr, th = np.hypot(dx, dy), np.arctan2(dy, dx)
    q = p.copy(); con = lo & vung
    hop = (~lo).astype(np.float32)  # nguồn: mọi điểm ngoài vùng vá (kể cả trong suốt → chép cả kẽ răng)
    for k in range(1, int(round(2 * np.pi / chu_ky))):
        if not con.any(): break
        for sg in (1, -1):
            t2 = th + sg * k * chu_ky
            sx, sy = (c[0] + rr * np.cos(t2)) * S - 0.5, (c[1] + rr * np.sin(t2)) * S - 0.5
            ok = nd.map_coordinates(hop, [sy, sx], order=0) > 0.5
            dung = con & ok
            for ch in range(4):
                q[..., ch][dung] = nd.map_coordinates(p[..., ch], [sy, sx], order=1)[dung]
            con &= ~dung
    if con.any(): q = va_khuech_tan(q, con, vung)
    return q


def tron(p, c, r):
    S = p.shape[0]; xx, yy = luoi(S)
    return np.hypot(xx - c[0], yy - c[1]) < r


# ---------------- hive: tách 3 con ong ----------------
def doi_tam(p):  # như thap-trum-master.py (ảnh gốc hive của bản thử) — quả cầu: tâm hình tròn về giữa ô
    S = p.shape[0]; a = p[..., 3] > 0.5
    rows = np.nonzero(a.any(1))[0]; cols = np.nonzero(a[int(S * 0.3):].any(0))[0]
    cx = (cols.min() + cols.max()) / 2; r = (cols.max() - cols.min()) / 2
    cy = rows.max() - r
    dx, dy = int(round(S / 2 - cx)), int(round(S / 2 - cy))
    return np.roll(np.roll(p, dy, 0), dx, 1)


ONG = [(0.475, 0.10), (0.85, 0.37), (0.155, 0.575)]  # tâm ong (tỉ lệ ô ảnh gốc hive)
ONG_R = 0.085                                        # bán kính vùng tìm ong; ô dải ong = 2·ONG_R


def hive():
    p = doi_tam(khung('hive', 0))
    S = p.shape[0]; xx, yy = luoi(S)
    _, _, v = hsv(p); a = p[..., 3] > 0.5
    ong = np.zeros((S, S), bool); cat = []
    O = int(round(2 * ONG_R * S))
    dai = np.zeros((O, 3 * O, 4), np.float32)
    for i, (cx, cy) in enumerate(ONG):
        vong = (xx - cx) ** 2 + (yy - cy) ** 2 < ONG_R ** 2
        lb, _ = nd.label(vong & a & (v > 0.3))
        m = lb == lb[int(cy * S), int(cx * S)]
        m = nd.binary_fill_holes(nd.binary_dilation(m, iterations=3) & a) & vong
        ong |= m
        x0, y0 = int(round(cx * S)) - O // 2, int(round(cy * S)) - O // 2
        o = p.copy(); o[..., 3] *= nd.gaussian_filter(m.astype(np.float32), 0.7)
        dai[:, i * O:(i + 1) * O] = o[y0:y0 + O, x0:x0 + O]
    lo = nd.binary_dilation(ong, iterations=4) & a
    cau = tron(p, (0.5, 0.5), 0.445)
    lo |= nd.binary_dilation(lo, iterations=5) & (v < 0.3) & tron(p, (0.5, 0.5), 0.40)  # viền đen quanh ong (trong cầu) → vá luôn
    than = va_khuech_tan(p, lo & cau, cau & a)        # trong quả cầu: vá từ hoa văn quanh đó; ngoài cầu: bỏ
    than[..., 3] *= cau
    luu(dai, 'trum_hive_m_ong.png')
    luu(than, 'trum_hive_m.png')
    luu(lop_sang(than, 0.80, (20, 55)), 'trum_hive_m_sang.png')
    print('  ong O=%d px, tâm' % O, ONG)


J_E = (0.5, 0.575, 0.37, 0.305)  # elip thân jammer (tâm x, y, bán trục x, y — tỉ lệ ô)


# ---------------- jammer: ăng-ten (bi + cần + vòng hào quang) là nắp ----------------
def jammer():
    p = khung('jammer', 0)
    S = p.shape[0]; xx, yy = luoi(S)
    h, s, v = hsv(p); a = p[..., 3] > 0.3
    bi = np.hypot(xx - 0.553, yy - 0.088) < 0.072
    # cần: đoạn (0.50,0.36) → (0.553,0.11), nửa bề rộng 0.032
    ax, ay, bx, by = 0.50, 0.37, 0.553, 0.11
    t = np.clip(((xx - ax) * (bx - ax) + (yy - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2), 0, 1)
    can = np.hypot(xx - (ax + t * (bx - ax)), yy - (ay + t * (by - ay))) < 0.032
    # vòng hào quang: dải elip quanh cần — nét sáng + quầng tím quanh nét
    e = np.hypot((xx - 0.528) / 0.138, (yy - 0.245) / 0.052)
    sang = (v > 0.62) & (s < 0.55)
    quang = (h > 265) & (h < 330) & (s > 0.45) & (v > 0.45)
    vong = (np.abs(e - 1) < 0.35) & (sang | quang)
    vong = nd.binary_dilation(vong, iterations=2) & (np.abs(e - 1) < 0.55)
    co = p[..., 3] > 0.02
    nap = nd.binary_dilation((bi | can | vong) & co, iterations=2) & co
    cau = np.hypot((xx - J_E[0]) / J_E[2], (yy - J_E[1]) / J_E[3]) < 1.03   # thân dẹt (elip) — ăng-ten nhô ra ngoài
    lo = (nap | (nd.binary_dilation(nap, iterations=3) & (v < 0.3))) & cau  # viền tối quanh cần → vá luôn
    lo |= (p[..., 3] < 0.6) & (e < 1.4) & (np.hypot((xx - J_E[0]) / J_E[2], (yy - J_E[1]) / J_E[3]) < 0.97)  # lỗ trong vòng (nền bị tách) → vá kín
    than = va_khuech_tan(p, lo, cau & (a | lo))
    than[..., 3] *= ~(nd.binary_dilation(nap, iterations=3) & ~cau)
    np_ = p.copy(); np_[..., 3] *= nd.gaussian_filter(nap.astype(np.float32), 0.6)
    luu(np_, 'trum_jammer_m_nap.png')
    luu(than, 'trum_jammer_m.png')
    luu(lop_sang(than, 0.62, (275, 330)), 'trum_jammer_m_sang.png')  # vân tím-hồng phát sáng


# ---------------- patcher: bánh răng quay; giá chữ X + vòng xám + cờ lê là nắp ----------------
P_C = (0.494, 0.556)


def patcher():
    p = khung('patcher', 0)
    S = p.shape[0]; xx, yy = luoi(S)
    h, s, v = hsv(p); a = p[..., 3] > 0.5
    rr = np.hypot(xx - P_C[0], yy - P_C[1]); goc = np.degrees(np.arctan2(yy - P_C[1], xx - P_C[0]))
    xam = a & (s < 0.3) & (v > 0.35)
    cle = (goc > -80) & (goc < -15) & (rr > 0.12)              # góc phần tư cờ lê (trên-phải)
    cam = a & (h > 18) & (h < 50) & (s > 0.5) & (v > 0.5) & cle & (rr < 0.4)  # cán cờ lê màu cam
    m = (xam & ((rr < 0.31) | cle)) | cam
    m = nd.binary_opening(m, iterations=1)
    lb, n = nd.label(m)
    sz = nd.sum(m, lb, range(1, n + 1))
    m = np.isin(lb, 1 + np.nonzero(sz > S * S * 0.002)[0])
    m = nd.binary_fill_holes(nd.binary_closing(m, iterations=3))
    m |= a & (rr > 0.158) & (rr < 0.232)                         # trọn vòng xám trong: đứng yên cùng giá (vòng tròn → không lộ)
    m &= ~(rr < 0.075)                                           # chốt giữa: quay theo bánh răng (tròn, không lộ)
    nap = nd.binary_dilation(m, iterations=3) & a
    vien = a & (v < 0.38) & cle & (rr > 0.3) & nd.binary_dilation(m, iterations=16)  # viền + bóng đổ của cờ lê ngoài bánh răng
    nap |= nd.binary_dilation(vien, iterations=1) & a
    than = va_trung_vi(p, nap, P_C, 0.33)                          # mặt bánh răng: vòng đồng tâm
    than = va_cuc(than, nap & (rr >= 0.33), np.ones_like(a), P_C, 2 * np.pi / 8)  # răng: chép răng bên cạnh (8 răng)
    than[..., 3] *= ~(cle & (rr > 0.425))                        # bỏ viền cờ lê còn sót ngoài răng
    np_ = p.copy(); np_[..., 3] *= nd.gaussian_filter(nap.astype(np.float32), 0.6)
    luu(np_, 'trum_patcher_m_nap.png')
    luu(than, 'trum_patcher_m.png')
    luu(lop_sang(than, 0.72, (70, 110)), 'trum_patcher_m_sang.png')  # xanh chanh sáng


# ---------------- leech: bò (không nắp) — sáng ở bụng sao tím ----------------
def leech():
    p = khung('leech', 0)
    h, s, v = hsv(p); a = p[..., 3] > 0.5
    tim = a & (h > 255) & (h < 320) & (s > 0.35)
    lb, n = nd.label(nd.binary_closing(tim, iterations=2))
    bung = nd.binary_fill_holes(lb == (np.argmax(nd.sum(tim, lb, range(1, n + 1))) + 1))
    bung = nd.binary_dilation(bung, iterations=2)
    luu(p, 'trum_leech_m.png')
    g = lop_sang(p, 0.55, None, bung)
    luu(g, 'trum_leech_m_sang.png')


VIEC = {'hive': hive, 'jammer': jammer, 'patcher': patcher, 'leech': leech}
# 08/11: jammer đã gen lại 3 lớp (tools/thap-trum-master-jammer.py) — chỉ chạy jammer() cũ khi gọi rõ tên (ghi đè ảnh mới!)
for id_ in (sys.argv[1:] or [k for k in VIEC if k != 'jammer']):
    print(id_); VIEC[id_]()
