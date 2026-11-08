#!/usr/bin/env python3
# TURRET MERGE — ẢNH GỐC trùm SIGNAL JAMMER vẽ bằng code (quaianim.js TRUM_ANIM_CODE.jammer, kieu 'vanh').
# Gen lại 08/11 bằng ChatGPT (3 lớp riêng trên nền magenta phẳng, tham chiếu khung dải đi trum_jammer_8.png):
#   docs/demo-hop-tuong/thap-art/raw_jammer_vanh.png  vành gai NHÌN THẲNG TỪ TRÊN (tròn đều, 12 gai, giữa rỗng)
#   docs/demo-hop-tuong/thap-art/raw_jammer_than.png  thân/vòm (không vành gai, không ăng-ten)
#   docs/demo-hop-tuong/thap-art/raw_jammer_nap.png   ăng-ten (bi + cần + vòng hào quang)
# Ra (thap/assets/):
#   trum_jammer_m_vanh.png  vành tròn, tâm vành = tâm ảnh, mép gai chạm mép ảnh — code quay THUẬN KIM ĐỒNG HỒ rồi nén dọc (phối cảnh)
#   trum_jammer_m.png       thân (ô 350 như dải đi → K8 giữ nguyên), đáy thân ở J_DAY
#   trum_jammer_m_nap.png   ăng-ten, chân cần cắm đúng lỗ đỉnh vòm (điểm neo napL)
#   trum_jammer_m_sang.png  lớp sáng (vân tím-hồng) của thân — 'lighter' nhấp nháy
# Chạy (gốc repo): python3 tools/thap-trum-master-jammer.py      (XEM=thư_mục → ảnh xem nhanh trên nền xanh)
import os
import numpy as np
from PIL import Image
from scipy import ndimage as nd

A = 'thap/assets/'
R = 'docs/demo-hop-tuong/thap-art/'
XEM = os.environ.get('XEM')
S = 350                       # cạnh ô ảnh gốc (= ô dải đi)
MAG = np.array([1.0, 0.0, 1.0])


def luu(p, ten, nen=(38, 64, 120)):
    im = Image.fromarray((np.clip(p, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGBA')
    im.save(A + ten, optimize=True)
    print('  ->', A + ten, im.size)
    if XEM:
        os.makedirs(XEM, exist_ok=True)
        bg = Image.new('RGBA', im.size, nen + (255,)); bg.alpha_composite(im)
        bg.convert('RGB').save(os.path.join(XEM, ten.replace('.png', '.png')))


def tach_nen(ten, hat=()):
    """nền magenta → alpha: vùng gần-magenta LIỀN với mép ảnh (và các điểm hạt, vd lỗ giữa vành) là nền;
    mép mềm 1 px; khử ám hồng ở mép bằng phép tách trộn obs = a·fg + (1−a)·magenta."""
    p = np.asarray(Image.open(R + ten).convert('RGB')).astype(np.float32) / 255.0
    H, W = p.shape[:2]
    d = np.abs(p - MAG).max(-1)                       # khoảng cách tới magenta (0 = đúng magenta)
    gan = d < 0.32
    lb, _ = nd.label(gan)
    nhan = set(np.unique(np.concatenate([lb[0], lb[-1], lb[:, 0], lb[:, -1]])))
    for (x, y) in hat: nhan.add(lb[int(y * H), int(x * W)])
    nhan.discard(0)
    nen = np.isin(lb, list(nhan))
    nen = nd.binary_opening(nen, iterations=1) | (d < 0.12) & nd.binary_dilation(nen, iterations=2)
    # alpha mềm ở dải mép: theo khoảng cách màu tới magenta
    mep = nd.binary_dilation(nen, iterations=2) & ~nd.binary_erosion(nen, iterations=1)
    a = (~nen).astype(np.float32)
    a = np.where(mep, np.clip((d - 0.1) / 0.5, 0, 1), a)
    a = nd.gaussian_filter(a, 0.4); a *= a > 0.04
    # khử ám: tách màu nền khỏi điểm bán trong suốt, rồi lấy màu lân cận đặc cho điểm quá mờ
    c = (p - (1 - a[..., None]) * MAG) / np.maximum(a[..., None], 0.2)
    c = np.clip(c, 0, 1)
    dac = a > 0.85
    if dac.any():
        idx = nd.distance_transform_edt(~dac, return_distances=False, return_indices=True)
        lan = p[idx[0], idx[1]]
        k = np.clip((0.85 - a) / 0.5, 0, 1)[..., None]
        c = c * (1 - k) + lan * k
    return np.concatenate([c, a[..., None]], -1)


def hop(p, nguong=0.5):
    ys, xs = np.nonzero(p[..., 3] > nguong)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def doi_co(p, w, h):  # đổi cỡ nhân-trước-alpha (không viền đen/hồng)
    pm = p.copy(); pm[..., :3] *= pm[..., 3:4]
    ch = [np.asarray(Image.fromarray(pm[..., i].astype(np.float32), 'F').resize((w, h), Image.LANCZOS)) for i in range(4)]
    o = np.clip(np.stack(ch, -1), 0, 1)
    o[..., :3] /= np.maximum(o[..., 3:4], 1e-4)
    o[..., :3] = np.clip(o[..., :3], 0, 1)
    return o


def nhoe(p, r):
    pm = p.copy(); pm[..., :3] *= pm[..., 3:4]
    o = np.stack([nd.gaussian_filter(pm[..., c], r) for c in range(4)], -1)
    o[..., :3] /= np.maximum(o[..., 3:4], 1e-4)
    return o


def hsv(p):
    r, g, b = p[..., 0], p[..., 1], p[..., 2]
    mx, mn = p[..., :3].max(-1), p[..., :3].min(-1)
    d = mx - mn + 1e-6
    h = np.where(mx == r, (g - b) / d % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    return h, d / (mx + 1e-6), mx


def lop_sang(p, nguong, hue):
    h, s, v = hsv(p)
    lum = p[..., 0] * 0.3 + p[..., 1] * 0.59 + p[..., 2] * 0.11
    w = np.clip((np.maximum(lum, v * 0.92) - nguong) / (1 - nguong), 0, 1) * p[..., 3]
    a, b = hue
    w *= (h >= a) & (h <= b) & (s > 0.35)
    w = nd.grey_opening(w, size=3)
    g = p.copy(); g[..., 3] = w
    return nhoe(g, max(2, p.shape[0] / 110))


# ---- bố cục trong ô S (tỉ lệ ô) — quaianim.js TRUM_ANIM_CODE.jammer dùng đúng các số này ----
J_THAN_W, J_THAN_DAY = 0.6, 0.86     # thân rộng 0,6 ô, đáy thân ở 0,86
J_VANH = (0.5, 0.58, 0.46, 0.6)      # vành: tâm x, y (ngang chỗ thân phình nhất) · bán kính ngoài (đỉnh gai) · nén dọc (phối cảnh)
J_NAP_W = 0.26                       # ăng-ten: bề rộng (vòng hào quang) — chân cần cắm vào lỗ đỉnh vòm (điểm neo napL)


def dat(p, w, x_neo, y_neo, X, Y):
    """đổi cỡ p để bề rộng hộp = w (tỉ lệ ô) rồi đặt điểm neo (x_neo, y_neo — px của p) vào (X, Y) của ô S."""
    x0, y0, x1, y1 = hop(p, 0.02)
    k = w * S / (x1 - x0)
    W, H = max(1, int(round(p.shape[1] * k))), max(1, int(round(p.shape[0] * k)))
    q = doi_co(p, W, H)
    o = np.zeros((S, S, 4), np.float32)
    dx, dy = int(round(X * S - x_neo * k)), int(round(Y * S - y_neo * k))
    sx0, sy0, sx1, sy1 = max(0, -dx), max(0, -dy), min(W, S - dx), min(H, S - dy)
    o[sy0 + dy:sy1 + dy, sx0 + dx:sx1 + dx] = q[sy0:sy1, sx0:sx1]
    return o, k


def than():
    p = tach_nen('raw_jammer_than.png')
    x0, y0, x1, y1 = hop(p, 0.5)
    # điểm neo: giữa đáy thân
    o, k = dat(p, J_THAN_W, (x0 + x1) / 2, y1, 0.5, J_THAN_DAY)
    luu(o, 'trum_jammer_m.png')
    luu(lop_sang(o, 0.55, (280, 330)), 'trum_jammer_m_sang.png')  # vân tím-hồng phát sáng
    # lỗ cắm ăng-ten (ảnh gốc: tâm lỗ đen ≈ (447, 337)/895) → toạ độ ô
    H = p.shape[0]
    hx, hy = 447 / 895 * H, 337 / 895 * H
    print('  lỗ cắm ăng-ten (napL) = [%.3f, %.3f]' % (0.5 + (hx - (x0 + x1) / 2) * k / S, J_THAN_DAY + (hy - y1) * k / S))


def nap(nx, ny):
    p = tach_nen('raw_jammer_nap.png', hat=[(380 / 895, 448 / 895), (520 / 895, 448 / 895)])  # lỗ trong vòng hào quang
    x0, y0, x1, y1 = hop(p, 0.5)
    a = p[..., 3] > 0.5
    # chân cần: điểm thấp nhất giữa
    xs = np.nonzero(a[y1 - 3])[0]
    o, k = dat(p, J_NAP_W, xs.mean(), y1 - 1, nx, ny)
    luu(o, 'trum_jammer_m_nap.png')


def vanh():
    p = tach_nen('raw_jammer_vanh.png', hat=[(0.5, 0.5)])
    x0, y0, x1, y1 = hop(p, 0.3)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    r = max(x1 - x0, y1 - y0) / 2 + 2
    H, W = p.shape[:2]
    yy, xx = np.mgrid[0:H, 0:W]
    p[..., 3] *= np.clip(r - np.hypot(xx + 0.5 - cx, yy + 0.5 - cy), 0, 1)  # cắt tròn: không sót gì ngoài vành
    q = np.zeros((int(2 * r), int(2 * r), 4), np.float32)
    ox, oy = int(round(cx - r)), int(round(cy - r))
    sx0, sy0 = max(0, ox), max(0, oy)
    sx1, sy1 = min(W, ox + q.shape[1]), min(H, oy + q.shape[0])
    q[sy0 - oy:sy1 - oy, sx0 - ox:sx1 - ox] = p[sy0:sy1, sx0:sx1]
    luu(doi_co(q, S, S), 'trum_jammer_m_vanh.png')


if __name__ == '__main__':
    vanh()
    than()
    if os.path.exists(R + 'raw_jammer_nap.png'): nap(0.5, 0.445)
