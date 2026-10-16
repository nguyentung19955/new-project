"""NÂNG TAY TRÁI CẦM THƯƠNG (thuong-tay-trai-cao, 17/10/2026) — phép sửa ảnh thân ô 96.

Cách làm (không vẽ mới, chỉ dời điểm ảnh sẵn có):
  1. Tâm nắm tay trái = khối da gần điểm tay thứ hai (neo[4]) — tam_nam.
  2. Dò cánh tay trái theo CỘT: từ nắm tay đi sang trái dọc cẳng tay; ở mỗi cột lấy đoạn đặc liền chứa trục tay. Gặp cột có đoạn
     đặc dày hơn ~1,6 lần bề dày nắm tay (đã chạm thân / áo) thì dừng: đó là mép thân xa (khuỷu / chỗ tay khuất sau thân).
     Phía phải đi tiếp tới hết nắm tay. → do_tay.
  3. Mỗi cột của cánh tay dời LÊN dy·w(x): w = 0 ở mép thân, tăng đều tới 1 ở cổ tay (cột nắm tay − 2), nắm tay dời đủ dy.
     Cả đoạn cột dời nguyên khối nên viền trên / dưới, nét, màu giữ nguyên; cẳng tay nghiêng lên nối liền từ khuỷu. → nang.
  Cùng phép dời áp cho lớp nắm tay cắt từ thân (hang_tay) để hai lớp khớp nhau. → doi_lop.
"""
import math, os, sys
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../..'))


def do_tay(a, F, xmin=0):
    """a: RGBA ô 96. F: tâm nắm tay trái. Trả (cot {x: (y0, y1)}, xa = cột đầu của cánh tay, bề dày ở nắm tay) hoặc None."""
    al = a[..., 3] > 0
    fx, fy = int(round(F[0] - 0.5)), int(round(F[1] - 0.5))
    if not al[fy, fx]:
        ys, xs = np.nonzero(al)
        j = np.argmin((xs - fx) ** 2 + (ys - fy) ** 2)
        fx, fy = int(xs[j]), int(ys[j])

    def run(x, y):
        if not (0 <= y < 96 and 0 <= x < 96) or not al[y, x]:
            return None
        y0 = y
        while y0 > 0 and al[y0 - 1, x]:
            y0 -= 1
        y1 = y
        while y1 < 95 and al[y1 + 1, x]:
            y1 += 1
        return y0, y1
    r = run(fx, fy)
    if r is None:
        return None
    day0 = r[1] - r[0] + 1
    lim = max(7, int(day0 * 1.6))
    cot = {}
    x, c = fx, fy
    while x < 95:
        r = run(x, c)
        if r is None or r[1] - r[0] + 1 > lim:
            break
        cot[x] = r; c = (r[0] + r[1]) // 2; x += 1
    x, c, xa = fx - 1, fy, None
    while x >= xmin:
        r = run(x, c)
        if r is None:
            for d in (1, -1, 2, -2):
                r = run(x, c + d)
                if r:
                    break
        if r is None or r[1] - r[0] + 1 > lim:
            xa = x + 1; break
        cot[x] = r; c = (r[0] + r[1]) // 2; x -= 1
    if xa is None:
        xa = xmin
    return cot, xa, day0


def doi_lop(a, cot, xa, xb, dy):
    """Dời các đoạn cột (cot) của lớp a lên dy·w(x). Trả ảnh mới."""
    out = a.copy()
    for x, (y0, y1) in cot.items():
        out[y0:y1 + 1, x] = 0
    for x, (y0, y1) in sorted(cot.items()):
        w = 1.0 if x >= xb else max(0.0, (x - xa + 1) / (xb - xa + 1))
        s = int(round(dy * w))
        seg = a[y0:y1 + 1, x].copy()
        for k in range(len(seg)):
            yy = y0 + k - s
            if 0 <= yy < 96 and seg[k, 3] > 0:
                out[yy, x] = seg[k]
    return out


def nang(a, F, dy, xmin=0):
    """Trả (ảnh mới, {'xa', 'xb', 'cot', 'day', '_cot'}) hoặc None (không dò được tay)."""
    r = do_tay(a, F, xmin)
    if r is None:
        return None
    cot, xa, day0 = r
    xb = max(int(F[0]) - 2, xa)
    return doi_lop(a, cot, xa, xb, dy), {'xa': xa, 'xb': xb, 'cot': len(cot), 'day': day0, '_cot': cot}


def tam_nam(a, t, ban_kinh=7):
    """Tâm khối da nắm tay trái gần t (trong bán kính ban_kinh, khối 3..60 điểm ảnh; nhiều khối thì lấy khối xa về phía trước nhất)."""
    sys.path.insert(0, os.path.join(ROOT, 'docs/review/ke-hoach-cai-thien/cam-vk-chuan'))
    import do_cam as DC
    cs, lab = DC.cum_da(a)
    best = None
    for k_, sz, cx, cy in cs:
        if math.hypot(cx - t[0], cy - t[1]) < ban_kinh and 3 <= sz < 60:
            if best is None or cx > best[0]:
                best = (cx, cy)
    return best
