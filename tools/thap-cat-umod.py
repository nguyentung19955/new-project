#!/usr/bin/env python3
"""TURRET MERGE — cắt 7 ụ MODULE (ChatGPT 07/11, lưới 2×2 nền magenta) thành bệ riêng + đầu xoay (+ phần phụ).

Nguồn: docs/demo-hop-tuong/thap-art/raw_mod_<id>.png — ô 1 lắp sẵn · ô 2 BASE · ô 3 HEAD (nòng hướng LÊN) · ô 4 PART_B.
Ra (thap/assets/):
  <id>_de.png   bệ riêng: vuông, TÂM ẢNH = điểm gắn đầu (tâm lỗ bệ) → render.js than() vẽ cỡ SB × DE_RIENG_K[id]
  <id>_nong.png đầu: xoay 90° (nòng hướng PHẢI như mọi đầu ụ cũ), TÂM ẢNH = trục xoay; cỡ khung chọn để vẽ bằng HEAD_K[id]
                cũ vẫn đúng tỉ lệ ô 1 (ụ lắp sẵn)
  <id>_phu.png  phần phụ (ô 4) — để dành cho anim sau, chưa vẽ trong game
Khoá magenta theo QUY-TAC-HINH mục 5: lõi đặc giữ nguyên, chỉ dải viền ~1 px lấy alpha mềm + tách trộn nền (không viền hồng),
thu Lanczos nhân-trước-alpha, loang màu ra mép trong suốt.
Chạy: python3 tools/thap-cat-umod.py      (in bảng số để chép DE_RIENG_K vào render.js)
"""
import os, json
import numpy as np, cv2
from PIL import Image
from scipy import ndimage as nd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art')
OUT = os.environ.get('OUT', os.path.join(GOC, 'thap/assets'))
IDS = ['canon', 'lien', 'set', 'bang', 'radar', 'blackhole', 'doc']
HEAD_K = {'canon': 0.678, 'lien': 0.746, 'set': 1.011, 'bang': 0.794, 'radar': 0.595, 'blackhole': 0.811, 'doc': 0.782}  # artscale.js (giữ nguyên)
SB_C0 = 0.714 * 0.98      # bệ chung vẽ = 0.714 × S, S = 0.98 × cạnh ô (render.js than())
PX_DE = 250               # điểm ảnh / cạnh ô của bệ — đo thap-kt-min3x (430×932 DPR 3): bệ ở cỡ ô lớn nhất cần ~218 → r ≈ 0.87
PX_DAU = 300              # điểm ảnh / cạnh ô của đầu — các đầu cũ 278; bang_nong đo r 1.076 ở 278 → 300 (r ≤ 1.0)
# điểm gắn đầu trên bệ (toạ độ tấm raw, ô 2) — tâm lỗ tối giữa bệ; canon/radar: tâm khung bao
TRUC = {'canon': (940.5, 321), 'lien': (937, 329), 'set': (940.5, 392), 'bang': (940.5, 313),
        'radar': (941.5, 358.5), 'blackhole': (940.5, 328), 'doc': (940.5, 309)}
# đầu (ô 3) đặt vào ô 1: tỉ lệ + góc trên-trái (đo bằng so mẫu nhiều tỉ lệ, /tmp ms.py); radar: tỉ lệ đo tay, trục = tâm đĩa
KHOP = {'canon': (0.8, 191, 95), 'lien': (0.85, 225, 69), 'set': (0.875, 149, 67), 'bang': (0.75, 251, 122),
        'radar': (0.72, None, None), 'blackhole': (0.675, 215, 223), 'doc': (0.875, 199, 49)}
M = np.array([1.0, 0.0, 1.0])


def khoi(a):
    """các khối hình (đã đóng lỗ nhỏ) → {ô: (lát cắt, mặt nạ)}"""
    d = np.abs(a - M).max(2) > 40 / 255
    lab, n = nd.label(nd.binary_closing(d, iterations=2))
    sz = nd.sum(d, lab, range(1, n + 1)); sl = nd.find_objects(lab); H = a.shape[0] / 2
    out = {}
    for k, s in enumerate(sz):
        if s < 300: continue
        cy, cx = (sl[k][0].start + sl[k][0].stop) / 2, (sl[k][1].start + sl[k][1].stop) / 2
        out[(1 if cx > H else 0) + (2 if cy > H else 0)] = (sl[k], lab == k + 1)
    return out


def khoa(a, m):
    """RGBA thẳng (float): lõi đặc alpha 1, dải viền ~1 px alpha mềm từ độ lệch magenta + tách trộn nền."""
    loi = nd.binary_erosion(m, iterations=2)
    vien = nd.binary_dilation(m, iterations=1) & ~loi
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    al = np.clip((np.maximum.reduce([1 - r, 1 - b, g]) - 0.045) / 0.955, 0, 1)
    A = np.where(loi, 1.0, np.where(vien, al, 0.0))
    As = nd.gaussian_filter(A, 0.5)
    A = np.where(vien, np.minimum(As, A + 0.25), A)            # mịn mép (không bậc thang), không thủng lõi
    F = np.where(vien[..., None], (a - (1 - al[..., None]) * M) / np.maximum(al[..., None], 1e-3), a)
    F = np.clip(F, 0, 1); F[A < 0.004] = 0
    return np.dstack([F, A])


def dat_giua(c, px, py, half):
    """khung vuông cạnh 2·half, tâm (px,py) — toạ độ trong c"""
    N = int(np.ceil(half * 2)); o = np.zeros((N, N, 4))
    x0, y0 = int(round(px - N / 2)), int(round(py - N / 2))
    H, W = c.shape[:2]
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


def luu(c, ten):
    c = c.copy(); c[..., :3] = loang(c[..., :3], c[..., 3]); c[c[..., 3] < 0.008] = 0
    im = Image.fromarray((c * 255).round().astype(np.uint8), 'RGBA')
    im.save(os.path.join(OUT, ten + '.png'), optimize=True)
    return im.size


def main():
    bao = {}
    for i in IDS:
        a = np.asarray(Image.open(os.path.join(RAW, 'raw_mod_%s.png' % i)).convert('RGB')).astype(np.float64) / 255
        K = khoi(a); H = a.shape[0] // 2
        # --- BỆ (ô 2): khung vuông quanh điểm gắn, nửa cạnh = xa nhất từ điểm gắn tới mép hình
        s2, m2 = K[1]; c2 = khoa(a, m2)
        px, py = TRUC[i]; ys, xs = np.nonzero(m2)
        bmax = max(xs.max() + 1 - xs.min(), ys.max() + 1 - ys.min())           # cạnh lớn nhất của bệ (raw px) ↔ SB
        half = max(px - xs.min(), xs.max() + 1 - px, py - ys.min(), ys.max() + 1 - py) + 3
        de = dat_giua(c2, px, py, half)
        kde = 2 * half / bmax                                                     # khung / cạnh hình → render.js DE_RIENG_K
        nde = int(round(PX_DE * SB_C0 * kde))
        sz_de = luu(thu(de, nde), i + '_de')
        # --- ĐẦU (ô 3): trục = điểm gắn bệ đưa về toạ độ ô 3 qua phép đặt (tỉ lệ sc, góc trên-trái) đo ở ô 1
        s3, m3 = K[2]; c3 = khoa(a, m3); sc, hx, hy = KHOP[i]
        ys3, xs3 = np.nonzero(m3)
        if hx is None: qx, qy = (xs3.min() + xs3.max() + 1) / 2, (ys3.min() + ys3.max() + 1) / 2
        else: qx = s3[1].start + (px - H - hx) / sc; qy = s3[0].start + (py - hy) / sc
        hh = max(qx - xs3.min(), xs3.max() + 1 - qx, qy - ys3.min(), ys3.max() + 1 - qy) + 3
        # cỡ khung để vẽ bằng HEAD_K cũ: khung (raw ô 3) × sc ↔ HEAD_K·C0, bệ bmax ↔ SB_C0·C0
        hk = HEAD_K[i]; khung = hk * bmax / (SB_C0 * sc)
        k_moi = hk
        if khung < 2 * hh:                                                        # không đủ chỗ → nâng HEAD_K riêng
            khung = 2 * hh; k_moi = round(khung * SB_C0 * sc / bmax, 3)
        dau = dat_giua(c3, qx, qy, khung / 2)
        dau = np.rot90(dau, -1).copy()                                            # nòng LÊN → PHẢI (quy ước đầu ụ)
        nd_ = int(round(PX_DAU * k_moi))
        sz_dau = luu(thu(dau, nd_), i + '_nong')
        # --- PHẦN PHỤ (ô 4), nếu có: vuông quanh tâm khung bao, cùng mật độ điểm ảnh với đầu
        sz_phu = None
        if 3 in K:
            s4, m4 = K[3]; c4 = khoa(a, m4); ys4, xs4 = np.nonzero(m4)
            cx4, cy4 = (xs4.min() + xs4.max() + 1) / 2, (ys4.min() + ys4.max() + 1) / 2
            h4 = max(xs4.max() + 1 - xs4.min(), ys4.max() + 1 - ys4.min()) / 2 + 3
            phu = dat_giua(c4, cx4, cy4, h4)
            n4 = int(round(2 * h4 * nd_ / khung))
            sz_phu = luu(thu(phu, n4), i + '_phu')
        bao[i] = {'de': sz_de, 'DE_RIENG_K': round(kde, 3), 'nong': sz_dau, 'HEAD_K': k_moi, 'HEAD_K_cu': hk, 'phu': sz_phu}
        print(i, bao[i])
    print(json.dumps({i: bao[i]['DE_RIENG_K'] for i in IDS}))
    print('HEAD_K mới:', json.dumps({i: bao[i]['HEAD_K'] for i in IDS if bao[i]['HEAD_K'] != bao[i]['HEAD_K_cu']}))


if __name__ == '__main__':
    main()
