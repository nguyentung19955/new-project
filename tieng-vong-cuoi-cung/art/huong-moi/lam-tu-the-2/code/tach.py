#!/usr/bin/env python3
"""Tách nền trắng + đo từng tư thế Lam (thử 2) – bước 1 của PHAN-HOI-12 / việc 1.

  - nền = điểm gần trắng (min kênh > 228, chênh kênh < 22) NỐI với mép ảnh (tô loang) + lỗ trắng kín đủ to (≥ 30 px)
  - khử quầng trắng: dải 3 px trong mép lấy màu của điểm trong gần nhất, alpha = độ "tối hơn trắng" so với màu đó
    (C = a·F + (1−a)·255  →  a = Σ(255−C) / Σ(255−F))
  - cắt tư thế = thành phần liên thông lớn nhất trong từng ô lưới (giữ nguyên toạ độ trong ẢNH GỐC – không căn giữa)
  - đo: đỉnh mũ, đáy (ủng), mắt hổ phách (tâm), bề rộng mũ ở hàng mắt, chuông (đồng, trên tay), màu mũ trung bình
Dùng như module: from tach import tach_anh, do_tu_the
"""
import numpy as np
from PIL import Image
from scipy import ndimage as ndi


def mask_nen(rgb):
    r, g, b = [rgb[..., i].astype(np.int16) for i in range(3)]
    mn = np.minimum(np.minimum(r, g), b); mx = np.maximum(np.maximum(r, g), b)
    trang = (mn > 228) & (mx - mn < 22)
    lab, n = ndi.label(trang)
    mep = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    nen = np.isin(lab, list(mep))
    # lỗ trắng kín (khe chuông, khe giữa hai nhánh Âm Đao gần chuôi): trắng hơn hẳn (min > 238) và đủ to
    lo = trang & ~nen & (mn > 238)
    l2, n2 = ndi.label(lo)
    if n2:
        co = ndi.sum(lo, l2, range(1, n2 + 1))
        for i, c in enumerate(co, 1):
            if c >= 30: nen |= (l2 == i)
    return nen


def tach_anh(path):
    rgb = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    nen = mask_nen(rgb.astype(np.uint8))
    fg = ~nen
    fg = ndi.binary_opening(fg, iterations=1) | (fg & ndi.binary_erosion(fg, iterations=1))
    trong = ndi.binary_erosion(fg, iterations=3)
    _, idx = ndi.distance_transform_edt(~trong, return_indices=True)
    F = rgb[idx[0], idx[1]]
    dai = fg & ~trong
    num = (255 - rgb).sum(-1); den = np.maximum((255 - F).sum(-1), 1)
    a = np.clip(num / den, 0, 1)
    alpha = np.where(trong, 1.0, np.where(dai, a, 0.0))
    # màu ở dải mép: tách khỏi trắng (C − (1−a)·255)/a, chặn về gần màu điểm trong để không loé
    with np.errstate(divide='ignore', invalid='ignore'):
        Ct = (rgb - (1 - alpha[..., None]) * 255) / np.maximum(alpha[..., None], 1e-3)
    Ct = np.clip(Ct, 0, 255)
    Ct = np.where((alpha[..., None] < 0.999) & dai[..., None], 0.5 * Ct + 0.5 * F, rgb)
    alpha[alpha < 0.06] = 0
    out = np.dstack([Ct, alpha * 255]).round().clip(0, 255).astype(np.uint8)
    out[out[..., 3] == 0, :3] = 0
    return out


def cat_o(rgba, cot, hang):
    """thành phần liên thông lớn nhất (alpha > 0) có tâm trong từng ô; trả list (x0, y0, x1, y1, mặt nạ) theo thứ tự trái→phải, trên→dưới"""
    H, W = rgba.shape[:2]; a = rgba[..., 3] > 0
    lab, n = ndi.label(a, structure=np.ones((3, 3)))
    co = ndi.sum(a, lab, range(1, n + 1)); tam = ndi.center_of_mass(a, lab, range(1, n + 1))
    ra = []
    for j in range(hang):
        for i in range(cot):
            best = None
            for k in range(n):
                cy, cx = tam[k]
                if int(cx // (W / cot)) == i and int(cy // (H / hang)) == j and (best is None or co[k] > co[best]): best = k
            m = lab == best + 1
            # gộp mảnh nhỏ sát bên (đầu nhánh, mũi ủng rời) trong ô, cách thân ≤ 6 px
            gan = ndi.binary_dilation(m, iterations=6)
            for k in range(n):
                if k != best and co[k] >= 12:
                    mk = lab == k + 1
                    if (mk & gan).any(): m |= mk
            ys, xs = np.nonzero(m)
            ra.append((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1, m))
    return ra


def do_tu_the(rgba, m):
    """số đo một tư thế trong toạ độ ẢNH GỐC (px gen)"""
    a = m & (rgba[..., 3] > 128)
    ys, xs = np.nonzero(a)
    top, bot = ys.min(), ys.max() + 1
    r, g, b = [rgba[..., i].astype(np.int16) for i in range(3)]
    mat = a & (r > 215) & (g > 140) & (r - b > 60)
    lab, n = ndi.label(mat)
    mat_t = None
    if n:
        co = ndi.sum(mat, lab, range(1, n + 1))
        # mắt = cụm hổ phách cao nhất có cỡ hợp lý (chuông / chuôi dao là đồng tối hơn, nằm dưới)
        cand = [(ndi.center_of_mass(mat, lab, k + 1), co[k]) for k in range(n) if co[k] >= 15]
        cand.sort(key=lambda t: t[0][0])
        if cand: mat_t = (float(cand[0][0][1]), float(cand[0][0][0])); mat_co = float(cand[0][1])
    ey = int(round(mat_t[1])) if mat_t else (top + bot) // 2
    hang = np.nonzero(a[ey])[0]
    # bề rộng mũ ở hàng mắt: đoạn liền chứa mắt
    rong = None
    if mat_t is not None and len(hang):
        ex = int(round(mat_t[0])); seg = np.split(hang, np.nonzero(np.diff(hang) > 1)[0] + 1)
        for s in seg:
            if s.min() <= ex <= s.max(): rong = int(s.max() - s.min() + 1); x_sau, x_truoc = int(s.min()), int(s.max())
    # màu mũ: điểm phía trên mắt, xanh đậm (b > r)
    vung = a.copy(); vung[ey:] = False
    xanh = vung & (b > r + 8)
    mau = [float(np.median(c[xanh])) for c in (r, g, b)] if xanh.any() else None
    # chuông: cụm đồng đủ lớn GẦN TRỤC MẮT nhất dưới mắt, cách mắt ≤ 260 px gen ngang (chuôi / chắn dao nhỏ hơn) – kiểm lại bằng mắt ở ảnh dải
    dong = a & (r > 100) & (g > 70) & (b < 100) & (r - b > 50) & ~mat
    dong[:ey + 10] = False
    if mat_t is not None:
        xx0 = np.arange(dong.shape[1]); dong[:, np.abs(xx0 - mat_t[0]) > 260] = False
    lab2, n2 = ndi.label(ndi.binary_closing(dong, iterations=2))
    chuong = None
    if n2:
        co2 = ndi.sum(dong, lab2, range(1, n2 + 1))
        tam2 = ndi.center_of_mass(dong, lab2, range(1, n2 + 1))
        ung = [j for j in range(n2) if co2[j] >= 0.3 * co2.max()]
        k = min(ung, key=lambda j: abs(tam2[j][1] - (mat_t[0] if mat_t else tam2[j][1])))   # gần trục mắt nhất (chuông treo cổ; chắn dao ở phía trước)
        yy, xx = np.nonzero(lab2 == k + 1); cy, cx = ndi.center_of_mass(dong, lab2, k + 1)
        chuong = {'tam': [float(cx), float(cy)], 'rong': int(xx.max() - xx.min() + 1), 'cao': int(yy.max() - yy.min() + 1), 'dien_tich': float(co2[k])}
    return {'top': int(top), 'day': int(bot), 'trai': int(xs.min()), 'phai': int(xs.max() + 1), 'mat': mat_t, 'mat_co': mat_co if mat_t else None,
            'mu_cao_tren_mat': (ey - top) if mat_t else None, 'mu_rong_hang_mat': rong,
            'mu_sau': x_sau if rong else None, 'mu_truoc': x_truoc if rong else None, 'mau_mu': mau, 'chuong': chuong}
