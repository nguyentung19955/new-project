#!/usr/bin/env python3
"""TURRET MERGE — cắt 4 DẠNG Rồng Máy (Wyrm Engine, ronglua) — 08/11 "Lò Phản Ứng".

Nguồn: docs/demo-hop-tuong/thap-art/raw_mod_ronglua_f<1..4>.png (ChatGPT, lưới 2×2 nền magenta như raw_mod_<id>):
       ô 1 lắp sẵn (đầu chĩa LÊN) · ô 2 BỆ · ô 3 ĐẦU/THÂN không cánh · ô 4 MỘT cánh TRÁI (gốc cánh ở mép phải phần).
Ra (thap/assets/):
  ronglua_f<n>_de.png / _vien.png / _nong.png  — cắt y như tools/thap-cat-umod.py (cùng hàm, cùng mật độ điểm ảnh)
  ronglua_f<n>_canh.png                         — cánh TRÁI đã xoay như đầu (đầu chĩa PHẢI → cánh nằm phía TRÊN), tâm ảnh = tâm khung bao
Ghi thap/js/artscale.js: window.RONG_DANG = { f<n>: { K (đầu / cạnh ô), DE (bệ: × bệ chung), tip, canh: [x, y, cỡ, gốcX, gốcY] } }
  canh: tâm cánh trái (đơn vị cạnh ô, hệ đầu chĩa phải: x tới trước, y âm = bên trái) + cạnh ảnh cánh + GỐC cánh (điểm cánh gần trục nhất)
  → render (skills5.js veDau): vẽ cánh trái + cánh phải (lật dọc) xoay quanh gốc = vỗ cánh. Vị trí cánh khớp từ ô 1 (so mẫu SQDIFF như đầu/bệ).
Chạy: python3 tools/thap-cat-rong-may.py [1 2 3 4]   (KT=thư-mục: ảnh kiểm khớp)
"""
import os, sys, json, importlib.util
import numpy as np
from PIL import Image

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location('umod', os.path.join(GOC, 'tools', 'thap-cat-umod.py'))
U = importlib.util.module_from_spec(spec); spec.loader.exec_module(U)
OUT = U.OUT
# ô 1 của tờ Rồng vẽ bệ NHỎ hơn ô 2 nhiều (ChatGPT): mở rộng dải tỉ lệ khớp bệ (umod mặc định 0.86–1.14)
_khop0 = U.khop
def _khop(o1, c, m, rim=False, lo=0.6, hi=1.12):
    if rim: lo, hi = 0.55, 1.14
    return _khop0(o1, c, m, rim=rim, lo=lo, hi=hi)
U.khop = _khop


TINH = {1: (0.8, 1.1)}  # dạng: (hệ số khoảng cách ngang của cánh, hệ số cỡ cánh)


def mot(n):
    i = 'ronglua_f%d' % n
    r = U.mot(i)  # bệ + viền + đầu (+ phần phụ ô 4 = cánh theo mật độ đầu) + icon nho/
    # bỏ sản phẩm phụ không dùng (phần phụ ô 4 theo mật độ đầu — cánh cắt lại bên dưới; icon nho/ dựng lại có cánh)
    for f in (os.path.join(OUT, i + '_phu.png'),):
        if os.path.exists(f): os.remove(f)
    a8 = np.asarray(Image.open(U.nguon(i)).convert('RGB'))
    O = U.o_luoi(a8); F = [o.astype(np.float64) / 255 for o in O]
    m2, m3, m4 = U.tach(O[1])[0], U.tach(O[2])[0], U.tach(O[3])[0]
    c2, c3, c4 = U.khoa(F[1], m2), U.khoa(F[2], m3), U.khoa(F[3], m4)
    sb, bx, by, eb = U.khop(O[0], c2, c2[..., 3] > 0.5, rim=True)
    sh, hx, hy, eh = U.khop(O[0], c3, c3[..., 3] > 0.5)
    sw, wx, wy, ew = U.khop(O[0], c4, c4[..., 3] > 0.5, lo=0.6, hi=1.3)
    x0, y0, x1, y1 = U.bbox(c2[..., 3] > 0); px, py = (x0 + x1) / 2, (y0 + y1) / 2
    ax, ay = px * sb + bx, py * sb + by                       # trục trong ô 1
    bmax = max(x1 - x0, y1 - y0)
    # cạnh ô / px ô 1 (cùng công thức mot(): g = SB_C0 / bmax × f theo px ô 2; 1 px ô 1 = 1/sb px ô 2)
    f = r['thu']; g1 = U.SB_C0 / bmax * (U.BE_MAX / 0.7) * f / sb
    X0, Y0, X1, Y1 = U.bbox(c4[..., 3] > 0)
    h4 = max(X1 - X0, Y1 - Y0) / 2 + 3
    cx4, cy4 = (X0 + X1) / 2, (Y0 + Y1) / 2
    # VỊ TRÍ CÁNH = phần CÒN LẠI của ô 1 sau khi trừ bệ + đầu đã khớp (cánh trái = khối lớn nhất bên trái trục):
    # khung bao khối đó → tâm + tỉ lệ cánh (so mẫu cánh trực tiếp hay khớp nhầm vì ô 1 vẽ cánh nhỏ/khác góc)
    from scipy import ndimage as nd
    import cv2
    H1, W1 = O[0].shape[:2]
    def phu_o1(c, s, x, y):
        a = (c[..., 3] > 0.3).astype(np.uint8) * 255
        a = cv2.resize(a, (max(1, int(round(a.shape[1] * s))), max(1, int(round(a.shape[0] * s)))))
        M = np.zeros((H1, W1), np.uint8); xi, yi = int(round(x)), int(round(y))
        sx0, sy0 = max(0, xi), max(0, yi); sx1, sy1 = min(W1, xi + a.shape[1]), min(H1, yi + a.shape[0])
        if sx1 > sx0 and sy1 > sy0: M[sy0:sy1, sx0:sx1] = a[sy0 - yi:sy1 - yi, sx0 - xi:sx1 - xi]
        return M > 127
    m1 = U.tach(O[0])[0]
    con = m1 & ~nd.binary_dilation(phu_o1(c2, sb, bx, by) | phu_o1(c3, sh, hx, hy), iterations=6)
    con[:, int(ax):] = False
    lab, nn = nd.label(con)
    if nn:
        k = 1 + int(np.argmax(nd.sum(con, lab, range(1, nn + 1))))
        bx0, by0, bx1, by1 = U.bbox(lab == k)
        sw = max(bx1 - bx0, by1 - by0) / max(X1 - X0, Y1 - Y0)
        wx, wy = (bx0 + bx1) / 2 - cx4 * sw, (by0 + by1) / 2 - cy4 * sw
    wcx, wcy = cx4 * sw + wx, cy4 * sw + wy                   # tâm cánh trong ô 1
    # gốc cánh: điểm đặc của cánh gần trục nhất (trong ô 1)
    ys, xs = np.nonzero(c4[..., 3] > 0.5)
    gx, gy = xs * sw + wx, ys * sw + wy
    k = np.argmin((gx - ax) ** 2 + (gy - ay) ** 2); rx, ry = gx[k], gy[k]
    # hệ đầu chĩa PHẢI: x' = −dy, y' = dx (ô 1 đầu chĩa LÊN)
    def doi(x, y): return float(-(y - ay) * g1), float((x - ax) * g1)
    tx, ty = doi(wcx, wcy); gx2, gy2 = doi(rx, ry)
    co = float(2 * h4 * sw * g1)
    # cánh nằm TRONG Ô khi vỗ (± 18°): bán kính xa nhất ≤ R_MAX → thu cánh quanh gốc nếu lòi
    xa = np.sqrt(((gx - ax) * g1) ** 2 + ((gy - ay) * g1) ** 2).max()
    thu = min(1.0, U.R_MAX / xa) if xa > 0 else 1.0
    if thu < 1:
        tx, ty = gx2 + (tx - gx2) * thu, gy2 + (ty - gy2) * thu; co *= thu
    # chỉnh tay (soát bằng mắt ảnh KT): dạng 1 khối dư sau khi trừ đầu/bệ lẫn vỏ trứng → cánh bị đẩy ra ngoài: kéo vào sát vai
    k_in = TINH.get(n, (1.0, 1.0))
    ty *= k_in[0]; gy2 *= k_in[0]; co *= k_in[1]
    canh = np.rot90(U.dat_giua(c4, cx4, cy4, h4), -1).copy()
    U.luu(U.thu(canh, max(8, int(round(U.PX_DAU * co)))), i + '_canh')
    r.update({'canh': [round(tx, 4), round(ty, 4), round(co, 4), round(gx2, 4), round(gy2, 4)], 'khop_canh': [round(sw, 3), round(ew, 4)], 'canh_thu': round(thu, 3)})
    # icon 192 px nho/ronglua_f<n>.png (trang ụ: 4 dạng) = bệ + 2 cánh + đầu, đầu chĩa LÊN như icon thẻ
    N = 192; Wd = 1.02; q = 0.94 / Wd; cv = Image.new('RGBA', (N, N), (0, 0, 0, 0)); c = N / 2
    de = Image.open(os.path.join(OUT, i + '_de.png')).convert('RGBA'); d = int(round(N * q * 0.714 * 0.98 * r['DE_RIENG']))
    cv.alpha_composite(de.resize((d, d), Image.LANCZOS), (int(c - d / 2), int(c - d / 2)))
    cw = Image.open(os.path.join(OUT, i + '_canh.png')).convert('RGBA'); sz = max(1, int(round(N * q * co)))
    for lat in (1, -1):
        im = cw.resize((sz, sz), Image.LANCZOS); im = im if lat == 1 else im.transpose(Image.FLIP_TOP_BOTTOM)
        cv.alpha_composite(im, (int(round(c + tx * N * q - sz / 2)), int(round(c + lat * ty * N * q - sz / 2))))
    hd = Image.open(os.path.join(OUT, i + '_nong.png')).convert('RGBA'); h = int(round(N * q * r['HEAD_K']))
    cv.alpha_composite(hd.resize((h, h), Image.LANCZOS), (int(c - h / 2), int(c - h / 2)))
    cv = cv.rotate(90, Image.BICUBIC)
    bb = cv.getbbox()
    if bb:
        cr = cv.crop(bb); s2 = 0.9 * N / max(cr.size); cr = cr.resize((max(1, round(cr.width * s2)), max(1, round(cr.height * s2))), Image.LANCZOS)
        cv = Image.new('RGBA', (N, N), (0, 0, 0, 0)); cv.alpha_composite(cr, ((N - cr.width) // 2, (N - cr.height) // 2))
    os.makedirs(os.path.join(OUT, 'nho'), exist_ok=True); cv.save(os.path.join(OUT, 'nho', i + '.png'), optimize=True)
    if os.environ.get('KT'):  # ảnh kiểm: ô 1 | đầu + bệ + 2 cánh dựng lại theo số (đầu chĩa phải)
        N = 400; cv = Image.new('RGBA', (N, N), (255, 0, 255, 255)); c = N / 2
        de = Image.open(os.path.join(OUT, i + '_de.png')).convert('RGBA'); d = int(N * 0.714 * 0.98 * r['DE_RIENG'])
        cv.alpha_composite(de.resize((d, d)), (int(c - d / 2), int(c - d / 2)))
        cw = Image.open(os.path.join(OUT, i + '_canh.png')).convert('RGBA'); s = int(N * co)
        for lat in (1, -1):
            im = cw.resize((s, s)); im = im if lat == 1 else im.transpose(Image.FLIP_TOP_BOTTOM)
            cv.alpha_composite(im, (int(c + tx * N - s / 2), int(c + lat * ty * N - s / 2)))
        hd = Image.open(os.path.join(OUT, i + '_nong.png')).convert('RGBA'); h = int(N * r['HEAD_K'])
        cv.alpha_composite(hd.resize((h, h)), (int(c - h / 2), int(c - h / 2)))
        o1 = Image.fromarray(O[0]).resize((N, N)).rotate(-90)
        sh2 = Image.new('RGB', (N * 2, N)); sh2.paste(o1, (0, 0)); sh2.paste(cv.convert('RGB'), (N, 0))
        os.makedirs(os.environ['KT'], exist_ok=True); sh2.save(os.path.join(os.environ['KT'], i + '.png'))
    return r


def main():
    ns = [int(x) for x in sys.argv[1:]] or [1, 2, 3, 4]
    p = os.path.join(GOC, 'thap/js/artscale.js'); t = open(p, encoding='utf-8').read()
    cu = U.js_obj(t, 'RONG_DANG') or {}
    for n in ns:
        if not os.path.exists(U.nguon('ronglua_f%d' % n)): print('thiếu', U.nguon('ronglua_f%d' % n)); continue
        r = mot(n)
        cu['f%d' % n] = {'K': r['HEAD_K'], 'DE': r['DE_RIENG'], 'tip': r['tip'], 'canh': r['canh']}
        print('f%d' % n, 'K', r['HEAD_K'], 'de', r['DE_RIENG'], 'thu', r['thu'], 'khop', r['khop_be'], r['khop_dau'], 'canh', r['canh'], r['khop_canh'], 'thu canh', r['canh_thu'])
    t = U.js_set(t, 'RONG_DANG', dict(sorted(cu.items())), '// Rồng Máy 4 dạng (tools/thap-cat-rong-may.py): đầu ronglua_f<n>_nong (cỡ ô × K), bệ _de (bệ chung × DE), cánh _canh [x, y, cỡ, gốcX, gốcY]')
    open(p, 'w', encoding='utf-8').write(t)


if __name__ == '__main__':
    main()
