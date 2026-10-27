"""Bước 2: đo cỡ + vị trí từng mảnh so với ẢNH ĐÃ CHỐT (lam-moi-chuong-tan.png).
Mỗi mảnh: tìm (co_x, co_y, xoay, dịch) sao cho mảnh (ảnh bảng mảnh) trùng ảnh chốt nhất trong vùng tìm của nó:
  1) dò lưới thô ở ¼ độ phân giải (cv2.matchTemplate có mặt nạ alpha, SQDIFF/điểm),
  2) tinh chỉnh Nelder–Mead ở ½ độ phân giải, sai số màu có CHẶN TRÊN (chỗ bị mảnh khác che không kéo lệch).
Mảnh bị che hoàn toàn trong ảnh chốt (găng xa, ủng) đặt tay theo hình học (ghi rõ trong DAT_TAY).
Kết quả: ../manh/goc/khop.json  (ma trận 2×3 mảnh-bảng → toạ độ ảnh chốt, cỡ đo được)."""
import os
import numpy as np
import cv2
from scipy.optimize import minimize
from PIL import Image
from chung import SRC_CHOT, MANH, load_rgb, luu_json

# vùng tìm trên ảnh chốt [x0, y0, x1, y1], khoảng xoay (độ), khoảng cỡ
TIM = {
    'mu':        ([370, 60, 910, 640],   (-20, 20), (0.95, 1.35)),
    'chop':      ([280, 60, 640, 460],   (-70, 70), (0.85, 1.4)),
    'than':      ([280, 560, 920, 1195], (-15, 15), (0.9, 1.35)),
    'ao-vai':    ([380, 570, 860, 830],  (-20, 20), (0.95, 1.45)),
    'vat-truoc': ([480, 860, 920, 1195], (-20, 20), (0.85, 1.4)),
    'vat-sau':   ([270, 860, 760, 1195], (-20, 20), (0.85, 1.4)),
    'chuong':    ([660, 560, 880, 820],  (-25, 25), (0.8, 1.25)),
    'gang-gan':  ([560, 780, 780, 930],  (-35, 35), (0.8, 1.3)),
    'dao':       ([620, 800, 980, 1000], (-10, 40), (0.85, 1.35)),
    'mat':       ([740, 400, 830, 540],  (-20, 20), (0.7, 1.3)),
}
# phần mảnh dùng để KHỚP (tỉ lệ trong hộp mảnh x0,y0,x1,y1) – vd. chuông: chỉ thân chuông, bỏ vòng dây
CAT_KHOP = {'chuong': (0.40, 0.25, 1.0, 1.0), 'dao': (0.25, 0.0, 1.0, 1.0)}


def warp_params(p, w, h):
    """p = (cx, cy, rot, sx, sy): tâm mảnh đặt tại (cx, cy) trên ảnh chốt. Trả ma trận 2×3 mảnh → ảnh chốt."""
    cx, cy, rot, sx, sy = p
    c, s = np.cos(np.radians(rot)), np.sin(np.radians(rot))
    A = np.array([[c * sx, -s * sy], [s * sx, c * sy]])
    t = np.array([cx, cy]) - A @ np.array([w / 2, h / 2])
    return np.hstack([A, t[:, None]])


def khop(ten, piece_rgba, chot_full):
    box, (r0, r1), (s0, s1) = TIM[ten]
    a = piece_rgba.astype(np.float32)
    if ten in CAT_KHOP:
        fx0, fy0, fx1, fy1 = CAT_KHOP[ten]
        h, w = a.shape[:2]
        m = np.zeros((h, w), bool)
        m[int(fy0 * h):int(fy1 * h), int(fx0 * w):int(fx1 * w)] = True
        a = a.copy()
        a[~m, 3] = 0
    h, w = a.shape[:2]
    rgb, al = a[..., :3], (a[..., 3] / 255.0)
    # ----- 1) dò lưới thô ở ¼ -----
    q = 0.25
    reg = chot_full[box[1]:box[3], box[0]:box[2]].astype(np.float32)
    regq = cv2.resize(reg, None, fx=q, fy=q, interpolation=cv2.INTER_AREA)
    best = (1e18, None)
    for sc in np.linspace(s0, s1, 9):
        for rot in np.arange(r0, r1 + 0.1, 5):
            M = warp_params((0, 0, rot, sc * q, sc * q), w, h)
            cs = np.abs(M[:, :2]) @ np.array([w, h])
            Wt, Ht = int(cs[0]) + 4, int(cs[1]) + 4
            M[:, 2] += [Wt / 2, Ht / 2]
            t = cv2.warpAffine(rgb, M, (Wt, Ht), flags=cv2.INTER_AREA)
            mk = cv2.warpAffine(al, M, (Wt, Ht))
            mk = (mk > 0.5).astype(np.float32)
            if Ht >= regq.shape[0] or Wt >= regq.shape[1] or mk.sum() < 10:
                continue
            r = cv2.matchTemplate(regq, t, cv2.TM_SQDIFF, mask=np.dstack([mk] * 3))
            r = r / mk.sum()
            mn, _, loc, _ = cv2.minMaxLoc(r)
            if mn < best[0]:
                cx = box[0] + (loc[0] + Wt / 2) / q
                cy = box[1] + (loc[1] + Ht / 2) / q
                best = (mn, (cx, cy, rot, sc, sc))
    p0 = best[1]
    # ----- 2) tinh chỉnh ở ½ -----
    k = 0.5
    chot_h = cv2.resize(chot_full.astype(np.float32), None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
    pc = cv2.resize(rgb, None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
    mc = cv2.resize(al, None, fx=k, fy=k, interpolation=cv2.INTER_AREA)

    def f(p):
        cx, cy, rot, sx, sy = p
        if not (s0 * 0.9 <= sx <= s1 * 1.1 and s0 * 0.9 <= sy <= s1 * 1.1) or abs(sx / sy - 1) > 0.15:
            return 1e9
        M = warp_params((cx * k, cy * k, rot, sx, sy), pc.shape[1], pc.shape[0])
        Hh, Ww = chot_h.shape[:2]
        pw = cv2.warpAffine(pc, M, (Ww, Hh))
        mw = cv2.warpAffine(mc, M, (Ww, Hh))
        sel = mw > 0.5
        if sel.sum() < 30:
            return 1e9
        d = np.abs(pw[sel] - chot_h[sel]).mean(-1)
        return float(np.minimum(d, 55.0).mean())
    res = minimize(f, np.array(p0, float), method='Nelder-Mead',
                   options={'xatol': 0.05, 'fatol': 1e-3, 'maxiter': 1500, 'initial_simplex': None})
    return res.x, res.fun, p0, best[0]


# Mảnh bị che hẳn trong ảnh chốt: đặt theo hình học (tâm, xoay, cỡ) – mắt nhìn thấy trong ảnh khớp chồng ../kiem/
DAT_TAY = {
    'gang-xa': (585, 858, -8, 0.92, 0.92),     # sau thân, thấp hơn và lùi sau găng gần một chút
    'ung-gan': (705, 1166, 0, 1.0, 1.0),       # mũi ủng gần ló dưới vạt trước
    'ung-xa':  (585, 1170, 0, 1.0, 1.0),       # ủng xa sau, gần giữa
}


def main():
    chot = load_rgb(SRC_CHOT)
    out = {}
    for ten in list(TIM) + list(DAT_TAY):
        img = np.array(Image.open(os.path.join(MANH, 'goc', ten + '.png')))
        h, w = img.shape[:2]
        if ten in TIM:
            p, fun, p0, f0 = khop(ten, img, chot)
            nguon = 'khớp tự động'
        else:
            p, fun, p0, f0 = np.array(DAT_TAY[ten], float), None, None, None
            nguon = 'đặt tay (bị che trong ảnh chốt)'
        M = warp_params(p, w, h)
        out[ten] = {'tam': [round(p[0], 2), round(p[1], 2)], 'xoay': round(p[2], 2),
                    'co': [round(p[3], 4), round(p[4], 4)], 'M': M.round(5).tolist(), 'sai_so': fun,
                    'nguon': nguon, 'co_manh_bang': [w, h]}
        print(f'{ten:10s} tâm ({p[0]:7.1f},{p[1]:7.1f}) xoay {p[2]:6.1f}° cỡ {p[3]:.3f}×{p[4]:.3f}  sai số {fun}')
    luu_json(os.path.join(MANH, 'goc', 'khop.json'), out)


if __name__ == '__main__':
    main()
