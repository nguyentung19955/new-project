#!/usr/bin/env python3
"""Tách 5 ảnh gen v4 nền trắng (art/the-gioi-moi/nguon-v4/) thành asset trang trí địa hình đợt 4, xuất 2x vào
art/the-gioi-moi/dia-hinh-v4/ (atlas từng họ + dia-hinh-v4.json) và ảnh kiểm viền nền hồng / đen (xem-thu/kiem-vien-*.png).

Cách tách giống đợt v3 (cong-lang-v3/code/tach.py): flood-fill nền trắng từ mép (chung.nen_trang) + khử viền trắng
(chung.khu_vien_trang) → cắt từng mảnh → thu về cỡ logic đã chọn (×2 = ảnh 2x) → dán vào atlas họ. Cỡ logic theo lưới ô 32 / Lam 112:

  re-treo-cot   3 rễ treo ôm đầu cột (ĐÃ BỎ cột gỗ trong ảnh gen, chỉ giữ rễ + ngón ôm): cột gen 98 px → 32 logic (= 1 ô),
                rễ rộng ≈ 180 logic, cao ≈ 105 logic từ đầu cột lên → đặt neo (giữa đầu cột) lên đỉnh cột treo Cổng làng (x 784, y 96)
                thì rễ kéo lên quá mép trên màn (y ≈ −9). Neo = (tâm cột, đỉnh cột).
  xa-moc-day    xà / cành có 2 vòng dây: "xa-day-3" (dây cách 74 logic = đúng 2 dây của ván treo 3 ô) và "xa-day-2" (42 logic = ván 2 ô);
                khoảng giữa 2 vòng được KÉO DÀI bằng cách chèn dải vỏ cành lặp (hoà trộn chéo 8 px) cho đúng khoảng cách dây;
                dây rủ của xà CẮT ngay dưới nút buộc (mờ dần 14 px) → game nối ô dây 'day-treo' (v3) từ nút buộc ván lên tới đây.
                Neo = (tâm dây TRÁI, đáy đoạn dây còn giữ). Dây xà làm tối nhẹ cho gần màu dây ván.
  mang-go-van   6 mảng gỗ CÓ VÂN (cùng hộp cắt / cỡ 112 logic như mảng trơ v3); chỉnh màu trung bình về đúng mức mảng v3 đã tối 7 %
                (99/70/51 – so với ô thân gạch go-than 108/80/57) bằng hệ số từng kênh.
  mep-da-reu    2 bộ × (đầu trái, giữa lặp, đầu phải) mép ĐÁ rêu cho khối đá Sân chuông: cao 34 logic (≈ dải mép đất cũ 30), bỏ bụi cỏ
                ở chân 2 đầu (nằm giữa mặt đứng khối thì vô lý), xoá lá nhô cao hơn mặt rêu > 1,5 logic; neo y = 1 logic dưới mặt rêu
                → đặt neo đúng mặt collider thì rêu chỉ nhô 1 logic. Đầu cắt mờ dần 14 px gen để xếp kề.
  cong-re       cổng rễ cây thay cổng gỗ: cắt bản ĐÓNG thành 3 mảnh (trụ trái | rễ đan giữa | trụ phải, cắt thẳng ở mép trong 2 trụ)
                + 2 trụ ĐƠN (ảnh gen trụ đơn #2, #4; cùng cỡ, đặt đúng tâm trụ bản đóng). Cỡ: cao 162 logic (sàn → đáy tường 159 + 3
                rêu đỉnh), thân 2 trụ rộng ≈ 173 logic (hộp chặn 183) – ép ngang/dọc 0,63/0,56 ảnh gen (lệch tỷ lệ 11 %, mắt hơi
                bầu dục, chấp nhận). Mọi mảnh neo theo MỘT điểm chung = (tâm cổng, chân cổng) → game vẽ tất cả tại (px, sàn).
                Mắt ngọc (đèn báo) ghi toạ độ 'mat' (logic, so với neo). Trạng thái MỞ game dựng bằng code (rễ giữa bóp ngang + mờ).
  cong-re-kho   2 trụ đơn còn lại (#3, #5) – để dành, game không nạp.

JSON hợp nhất: dia-hinh-v4.json gồm CẢ các ô v3 còn dùng (mép đất, chân rễ, ván treo / dây, tiền cảnh; tệp '../cong-lang-v3/…')
→ game chỉ nạp 1 JSON. Mảng gỗ trơ v3 (mang-go-lon) không đưa vào (đã thay bằng mảng vân).

Chạy: python3 -B art/the-gioi-moi/dia-hinh-v4/code/tach.py   (cần Pillow, numpy, scipy; ~15 s)"""
import json
import os
import sys

import numpy as np
import scipy.ndimage as nd
from PIL import Image, ImageDraw

CODE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.dirname(CODE)                                    # dia-hinh-v4/
TGM = os.path.dirname(GOC)                                     # the-gioi-moi/
sys.path.insert(0, os.path.join(TGM, 'lang-chuong', 'code'))
from chung import doi_co, font, khu_vien_trang, luu_json, luu_png, mat_trang, nen_trang, xep_atlas   # noqa: E402
import importlib.util                                           # noqa: E402
_spec = importlib.util.spec_from_file_location('tach_v3', os.path.join(TGM, 'cong-lang-v3', 'code', 'tach.py'))
_t3 = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_t3)
cat, mo_dan, thu, tron_ngang = _t3.cat, _t3.mo_dan, _t3.thu, _t3.tron_ngang   # hàm dùng chung với đợt v3

NGUON = os.path.join(TGM, 'nguon-v4')
V3 = os.path.join(TGM, 'cong-lang-v3')
XEM = os.path.join(GOC, 'xem-thu')
BOI = 2
MAU_GO_V3 = np.array([99.0, 70.0, 51.0])                      # màu trung bình mảng gỗ trơ v3 sau khi tối 7 % (giữ mức này)

_cache = {}


def tach(ten):
    """Ảnh gen → (RGBA uint8 nền trong, mặt nạ đặc, RGB float)."""
    if ten in _cache:
        return _cache[ten]
    a = np.array(Image.open(os.path.join(NGUON, ten + '.png')).convert('RGB')).astype(np.float64)
    bg = nen_trang(a)
    w = mat_trang(a) & ~bg                                      # vệt trắng nhỏ kín trong hình → nền
    lab, n = nd.label(w)
    if n:
        sz = nd.sum(w, lab, range(1, n + 1))
        bg |= np.isin(lab, np.nonzero(sz < 400)[0] + 1)
    fg = ~bg
    lab, n = nd.label(fg)
    if n > 1:                                                   # bỏ hạt bụi lẻ
        sz = nd.sum(fg, lab, range(1, n + 1))
        fg &= ~np.isin(lab, np.nonzero(sz < 80)[0] + 1)
    out = khu_vien_trang(a, fg)
    _cache[ten] = (out, fg, a)
    return _cache[ten]


def got(rgba):
    """Cắt gọn về hộp alpha > 0; trả (mảnh, (x0, y0) đã bỏ)."""
    ys, xs = np.nonzero(rgba[..., 3] > 0)
    return rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1].copy(), (int(xs.min()), int(ys.min()))


def co_xy(rgba, kx, ky):
    h, w = rgba.shape[:2]
    return doi_co(rgba, max(1, round(w * kx)), max(1, round(h * ky)))


def mau_tb(ds):
    px = np.concatenate([im[im[..., 3] > 128][:, :3] for im in ds]).astype(float)
    return px.mean(0)


# ====================================================================== 1. rễ treo neo cột
def re_treo_cot(them):
    im, fg, a = tach('re-treo-cot')
    H = fg.shape[0]
    yy = np.arange(H)[:, None]
    for i, (bx0, bx1) in enumerate([(16, 572), (606, 1151), (1189, 1758)]):
        sub, f, o = a[:, bx0:bx1], fg[:, bx0:bx1], im[:, bx0:bx1].copy()
        cols = np.nonzero(f[790])[0]                              # cột gỗ = dải đặc ở hàng 790 (chỉ còn cột ở đó)
        px0, px1 = int(cols.min()), int(cols.max()) + 1
        R, G = sub[..., 0], sub[..., 1]
        rect = np.zeros_like(f); rect[:, max(0, px0 - 2):px1 + 2] = True
        mask = f & (R > 76) & ~(G > R + 8) & rect                 # mặt cột (sáng hơn rễ, không phải rêu)
        lab, n = nd.label(mask)
        post = lab == lab[800, (px0 + px1) // 2]
        toi = f & (R <= 76) & rect
        ngon = f & ~post & ~toi
        bo = post | (toi & nd.binary_dilation(post, iterations=5) & ~nd.binary_dilation(ngon, iterations=3))   # + nét bao cột
        y_top = int(np.nonzero(post.any(1))[0].min())
        bo |= rect & (yy > y_top + 118)                            # dưới ngón ôm: bỏ hết (cột game lộ ra)
        lab2, n2 = nd.label(f & ~bo)                               # vụn nét cột còn sót (chỉ nằm trong dải cột, nhỏ) → bỏ
        for j in range(1, n2 + 1):
            c = lab2 == j
            if c.sum() < 1500 and (c & rect).sum() == c.sum():
                bo |= c
        o[bo] = 0
        q, (cx0, cy0) = got(o)
        K = 64.0 / (px1 - px0)                                      # cột gen → 32 logic (64 px 2x)
        q = thu(q, K)
        neo = [round(((px0 + px1) / 2.0 - cx0) * K), round((y_top - cy0) * K)]
        them('re-treo-cot', 're-treo-cot-%d' % (i + 1), q, neo,
             'neo = (tâm cột, đỉnh cột); đặt lên đỉnh cột treo; đã bỏ cột gỗ, ngón ôm phủ xuống ~%d logic' % round((118 * K) / BOI))


# ====================================================================== 2. xà móc dây
XA_BOX = [(39, 562), (618, 1151), (1210, 1736)]                   # 3 biến thể (x0, x1) trong ảnh gen
XA_K = {'xa-day-3': 0.52, 'xa-day-2': 0.45}                        # ảnh gen → 2x (cành dày ≈ 38–44 logic, dây ≈ 10–12 logic)


def _day_cot(f, y0, y1):
    """Tâm + bề rộng 2 dây trong các hàng y0..y1 (chỉ có dây)."""
    cols = f[y0:y1].any(0)
    runs, x = [], 0
    while x < cols.size:
        if cols[x]:
            s = x
            while x < cols.size and cols[x]:
                x += 1
            runs.append((s, x))
        else:
            x += 1
    runs = sorted(runs, key=lambda r: r[1] - r[0])[-2:]
    runs.sort()
    return [((r[0] + r[1]) / 2.0, r[1] - r[0]) for r in runs]


def xa_moc_day(them):
    im, fg, a = tach('xa-moc-day')
    # dây xà sáng + vàng hơn dây ván (135/112/81 so với 111/82/54) → tối 0,85 ở điểm màu dây
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    day_px = (R > 120) & (G > 95) & (B > 60) & (R - B > 30) & (G < R)
    im = im.copy()
    im[day_px, :3] = np.clip(im[day_px, :3] * 0.85, 0, 255).astype(np.uint8)
    for ten, (bx0, bx1), n_o, cach2x in (('xa-day-3', XA_BOX[1], 3, 148), ('xa-day-2', XA_BOX[2], 2, 84)):
        XA_K0 = XA_K[ten]
        sub, f = im[:, bx0:bx1].copy(), fg[:, bx0:bx1]
        y_bot = int(np.nonzero(f.any(1))[0].max())
        (cL, wL), (cR, wR) = _day_cot(f, y_bot - 150, y_bot - 60)
        # nút buộc dưới: đi từ đoạn dây sạch lên, hàng đầu tiên mà bề rộng dải chứa tâm dây > 1,7 lần dây
        def nut_duoi(c, w):
            for y in range(y_bot - 60, 0, -1):
                row = f[y]
                x0 = int(c)
                if not row[x0]:
                    continue
                l = x0
                while l > 0 and row[l - 1]:
                    l -= 1
                r = x0
                while r < row.size - 1 and row[r + 1]:
                    r += 1
                if r - l > 1.7 * w:
                    return y
            return y_bot - 60
        y_nut = max(nut_duoi(cL, wL), nut_duoi(cR, wR))
        # kéo dài khoảng giữa 2 vòng dây cho đúng khoảng cách dây của ván (cach2x px 2x) – làm trên ảnh đủ cao, trước khi cắt dây
        can = int(round(cach2x / XA_K0 - (cR - cL)))
        wn = max(wL, wR)
        sx0, sx1 = int(cL + wn * 0.9 + 6), int(cR - wn * 0.9 - 6)   # dải vỏ cành giữa 2 vòng
        OV = 8
        if can > 2:
            dai = sub[:, sx0:sx1]
            kd = min(2.5, (can + 2 * OV) / float(dai.shape[1]))     # kéo giãn dải tối đa 2,5× (vân thưa ra) rồi mới lặp
            dai = doi_co(dai, int(round(dai.shape[1] * kd)), dai.shape[0])
            n = int(np.ceil((can + 2 * OV) / float(dai.shape[1] - OV))) + 1
            ghep = dai
            for k in range(1, n):                                    # lặp cùng chiều (giữ hướng vân chéo), hoà trộn 8 px
                ghep = tron_ngang(ghep, dai, OV)
            kx = (ghep.shape[1] - can - 2 * OV) // 2
            ghep = ghep[:, kx:kx + can + 2 * OV]
            xm = (sx0 + sx1) // 2
            sub = tron_ngang(tron_ngang(sub[:, :xm], ghep, OV), sub[:, xm:], OV)
        elif can < -2:                                              # ngắn bớt: bỏ dải giữa 2 vòng
            cut, xm = -can, (sx0 + sx1) // 2
            sub = np.concatenate([sub[:, :xm - cut // 2], sub[:, xm + (cut - cut // 2):]], 1)
        fs = sub[..., 3] > 0
        (cL2, _), (cR2, _) = _day_cot(fs, y_nut + 16, y_nut + 60)   # tâm 2 dây ngay DƯỚI nút buộc = chỗ dây ván nối vào
        K = cach2x / (cR2 - cL2)                                     # chỉnh K cho khoảng cách dây ĐÚNG px 2x
        y_cat = y_nut + 14                                          # giữ nút buộc + 14 px dây, mờ dần 14 px
        sub = sub[:y_cat].copy()
        sub[-14:] = mo_dan(sub[-14:], 'duoi', 14)
        q, (qx0, qy0) = got(sub)
        q2 = thu(q, K)
        neo = [round((cL2 - qx0) * K), q2.shape[0]]
        them('xa-moc-day', ten, q2, neo, 'xà móc dây cho ván treo %d ô: neo = (tâm dây trái, đáy đoạn dây giữ lại); 2 dây cách %d logic; '
             'game xếp day-treo từ nút ván lên tới đây' % (n_o, cach2x // 2), {'day': [[0, 0], [cach2x, 0]], 'k_gen': round(K, 4)})
    for i, (bx0, bx1) in enumerate(XA_BOX):                        # 3 biến thể gốc để dành
        q, _ = got(im[:, bx0:bx1])
        them('xa-moc-day-kho', 'xa-goc-%d' % (i + 1), thu(q, 0.5), None, 'xà gốc (gen), neo giữa đáy – để dành')


# ====================================================================== 3. mảng gỗ có vân
def mang_go_van(them):
    im, fg, a = tach('mang-go-van')
    K_GO = 224 / 470.0
    ds = [thu(cat(im, box), K_GO) for box in [(34, 13, 503, 469), (539, 24, 987, 469), (1046, 24, 1511, 469),
                                               (33, 524, 500, 983), (535, 510, 998, 983), (1028, 515, 1508, 982)]]
    tb = mau_tb(ds)
    he = MAU_GO_V3 / tb                                            # hệ số từng kênh → màu trung bình = mảng v3 đã tối 7 %
    print('mảng gỗ vân: màu trung bình gen %d/%d/%d → nhân %s' % (*np.round(tb).astype(int), np.round(he, 3)))
    for i, p in enumerate(ds):
        p = p.copy()
        p[..., :3] = np.clip(p[..., :3] * he, 0, 255).round().astype(np.uint8)
        p[p[..., 3] == 0] = 0
        them('mang-go-van', 'mang-go-van-%d' % (i + 1), p, [0, 0], 'neo góc trên-trái; có vân; màu TB chỉnh về 99/70/51')
    print('mảng gỗ vân: màu trung bình sau chỉnh %d/%d/%d' % tuple(np.round(mau_tb([d[1] for d in them.ho['mang-go-van']])).astype(int)))


# ====================================================================== 4. mép đá rêu
MEP_H = 34                                                        # cao logic từ mặt rêu xuống đáy mảnh


def mep_da_reu(them):
    im, fg, a = tach('mep-da-reu')
    bo = [((33, 267, 481, 479), (527, 274, 1009, 477), (1055, 269, 1503, 481)),
          ((33, 627, 481, 845), (527, 634, 1009, 842), (1055, 629, 1503, 846))]
    for b, (bt, bg_, bp) in enumerate(bo):
        for loai, box in (('trai', bt), ('giua', bg_), ('phai', bp)):
            p = cat(im, box, pad=2)
            h, w = p.shape[:2]
            al = p[..., 3] > 40
            cov = al.sum(1) / float(w)
            y_mat = int(np.argmax(cov > 0.55))                      # hàng đầu tiên phủ > 55 % bề rộng = mặt rêu
            # bề rộng thân đá (hàng giữa): mép trái / phải thân
            than = al[int(h * 0.45):int(h * 0.7)].any(0)
            xs = np.nonzero(than)[0]
            x_tr, x_ph = int(xs.min()), int(xs.max()) + 1
            yy, xx = np.mgrid[0:h, 0:w]
            xoa = yy < y_mat - 6                                    # lá nhô cao hơn mặt rêu > 6 px gen (≈ 1 logic) → bỏ
            if loai == 'trai':
                xoa |= (yy > y_mat + 120) & (xx < x_tr + 4)          # bụi cỏ ở chân đầu trái (ngoài thân đá)
            if loai == 'phai':
                xoa |= (yy > y_mat + 120) & (xx >= x_ph - 4)
            p = p.copy(); p[xoa] = 0
            p, (ox0, oy0) = got(p)
            y_mat -= oy0; x_tr -= ox0; x_ph -= ox0
            K = MEP_H * BOI / float(p.shape[0] - y_mat)
            if loai == 'trai':
                p = mo_dan(p, 'phai', 14)
                neo = [round(x_tr * K), round(y_mat * K) + 2]
            elif loai == 'phai':
                p = mo_dan(p, 'trai', 14)
                neo = [round(x_ph * K), round(y_mat * K) + 2]
            else:
                p = mo_dan(mo_dan(p, 'trai', 14), 'phai', 14)
                neo = [0, round(y_mat * K) + 2]
            q = thu(p, K)
            them('mep-da-reu', 'mep-da-%d-%s' % (b + 1, loai), q, neo,
                 'mép ĐÁ rêu, neo = (%s, 1 logic dưới mặt rêu); cao %d logic' % ({'trai': 'mép trái thân đá', 'phai': 'mép phải thân đá', 'giua': 'góc trái'}[loai], MEP_H))


# ====================================================================== 5. cổng rễ cây
CONG_KX, CONG_KY = 0.63, 0.56                                     # ảnh gen → 2x (ngang / dọc)
CONG_DONG = (49, 67, 754, 645)                                    # hộp bản đóng
CONG_CAT = (265, 529)                                             # cắt thẳng ở mép trong 2 trụ (ảnh gen)
CONG_TRU = [(776, 1025), (1147, 1403), (1422, 1680), (1865, 2124)]   # 4 trụ đơn (x0, x1); y như bản đóng


def _tam_tru(f, x0, x1, y0, y1):
    """Tâm thân trụ = giữa các cột điểm đặc gần suốt chiều cao (> 90 %)."""
    occ = f[y0:y1, x0:x1].sum(0)
    xs = np.nonzero(occ > 0.9 * (y1 - y0))[0]
    return x0 + (xs.min() + xs.max()) / 2.0


def _mat(a, f, x0, x1, y0, y1):
    """Tâm mắt ngọc (xanh ngọc nhạt) trong hộp."""
    y0, y1 = y0 + 200, y0 + 330                                  # mắt ở quãng giữa trụ (cao ≈ 1/2)
    sub = a[y0:y1, x0:x1]
    R, G, B = sub[..., 0], sub[..., 1], sub[..., 2]
    eye = (G > 130) & (B > 100) & (G > R + 12) & f[y0:y1, x0:x1]   # xanh ngọc nhạt (rêu: B thấp)
    lab, n = nd.label(eye)
    best, bs = None, 0
    for i, o in enumerate(nd.find_objects(lab)):
        s = int((lab == i + 1).sum())
        if s > bs and 30 < s < 3000:
            best, bs = o, s
    assert best is not None, 'không thấy mắt'
    return (x0 + (best[1].start + best[1].stop) / 2.0, y0 + (best[0].start + best[0].stop) / 2.0, (best[1].stop - best[1].start) / 2.0)


def cong_re(them):
    im, fg, a = tach('cong-re')
    x0, y0, x1, y1 = CONG_DONG
    cL, cR = CONG_CAT
    tcL, tcR = _tam_tru(fg, x0, cL, y0, y1), _tam_tru(fg, cR, x1, y0, y1)
    gx, gy = (tcL + tcR) / 2.0, float(y1)                         # điểm chung = (tâm cổng, chân cổng)
    print('cổng rễ: tâm trụ đóng %.0f / %.0f, tâm cổng %.0f' % (tcL, tcR, gx))

    def manh(ten, bx0, bx1, by0, by1, ho, chu, dich=0.0):
        """Cắt hộp, thu (KX, KY); neo = điểm chung (gx + dich, gy) tính trong mảnh; mắt ngọc ghi 'mat' (logic so với neo)."""
        p = im[by0:by1, bx0:bx1]
        q, (ox0, oy0) = got(p)
        q = co_xy(q, CONG_KX, CONG_KY)
        ax, ay = (gx + dich - bx0 - ox0) * CONG_KX, (gy - by0 - oy0) * CONG_KY
        ex, ey, er = _mat(a, fg, bx0, bx1, by0, by1)
        mat = [round((ex - gx - dich) * CONG_KX / BOI, 1), round((ey - gy) * CONG_KY / BOI, 1), round(er * CONG_KX / BOI, 1)]
        them(ho, ten, q, [round(ax), round(ay)], chu, {'mat': mat})
        return mat

    manh('cong-re-dong-trai', x0, cL, y0, y1, 'cong-re', 'bản ĐÓNG, trụ trái (cắt thẳng mép trong); neo = (tâm cổng, chân)')
    manh('cong-re-dong-phai', cR, x1, y0, y1, 'cong-re', 'bản ĐÓNG, trụ phải; neo = (tâm cổng, chân)')
    # rễ đan giữa: không có mắt → neo như trên, không ghi 'mat'
    p = im[y0:y1, cL:cR]
    q, (ox0, oy0) = got(p)
    q = co_xy(q, CONG_KX, CONG_KY)
    them('cong-re', 'cong-re-dong-giua', q, [round((gx - cL - ox0) * CONG_KX), round((gy - y0 - oy0) * CONG_KY)],
         'bản ĐÓNG, rễ đan giữa 2 trụ; neo = (tâm cổng, chân); MỞ: game bóp ngang 2 nửa về 2 trụ + mờ dần')
    # trụ đơn: #2, #4 dùng (trái / phải), #3, #5 để dành; đặt tâm thân trụ đơn đúng tâm trụ bản đóng
    for ten, (bx0, bx1), tc_dong, ho in (('cong-re-tru-trai', CONG_TRU[0], tcL, 'cong-re'), ('cong-re-tru-phai', CONG_TRU[2], tcR, 'cong-re'),
                                         ('cong-re-tru-kho-1', CONG_TRU[1], tcL, 'cong-re-kho'), ('cong-re-tru-kho-2', CONG_TRU[3], tcR, 'cong-re-kho')):
        tc = _tam_tru(fg, bx0, bx1, y0, y1)
        manh(ten, bx0, bx1, y0, y1, ho, 'trụ ĐƠN (chỉ trụ / mở hẳn), tâm thân đặt đúng tâm trụ bản đóng; neo = (tâm cổng, chân)', dich=tc - tc_dong)


# ====================================================================== atlas + JSON + kiểm viền
class Ho:
    def __init__(self):
        self.ho = {}

    def __call__(self, h, ten, im, neo, chu='', them_meta=None):
        if neo is None:
            neo = [im.shape[1] // 2, im.shape[0]]
        self.ho.setdefault(h, []).append((ten, im, neo, chu, them_meta or {}))


def chay():
    os.makedirs(XEM, exist_ok=True)
    them = Ho()
    re_treo_cot(them)
    xa_moc_day(them)
    mang_go_van(them)
    mep_da_reu(them)
    cong_re(them)
    meta = {'boi': BOI, 'ghi_chu': 'khung [x,y,w,h] và neo [ax,ay] tính bằng px ảnh (2x); chia 2 ra logic. Cỡ logic = w/2 × h/2. '
            'Gồm cả ô v3 còn dùng (tệp ../cong-lang-v3/…).', 'anh': {}, 'o': {}}
    for h, ds in them.ho.items():
        items = [(t, im) for t, im, _, _, _ in ds]
        tong = sum(im.shape[1] + 2 for _, im in items) + 2
        at, pos = xep_atlas(items, rong=tong if tong <= 1200 else 1024)   # 3 rễ treo xếp 1 hàng (1074 px) → atlas không thừa nửa dưới
        luu_png(at, os.path.join(GOC, h + '.png'))
        meta['anh'][h] = {'tep': h + '.png', 'co_anh': [at.shape[1], at.shape[0]]}
        for t, im, neo, chu, tm in ds:
            hh, ww = im.shape[:2]
            meta['o'][t] = dict({'anh': h + '.png', 'khung': pos[t], 'neo': [int(neo[0]), int(neo[1])], 'co_logic': [ww / BOI, hh / BOI], 'ghi_chu': chu}, **tm)
        kiem_vien(h, ds)
    # hợp nhất ô v3 còn dùng
    v3 = json.load(open(os.path.join(V3, 'cong-lang-v3.json'), encoding='utf-8'))
    giu = {'mep-dat-re', 'chan-re-goc', 'be-neo', 'tien-canh-re-da'}
    for h, v in v3['anh'].items():
        if h in giu:
            meta['anh'][h] = {'tep': '../cong-lang-v3/' + v['tep'], 'co_anh': v['co_anh']}
    for t, v in v3['o'].items():
        h = v['anh'][:-4]
        if h in giu:
            meta['o'][t] = dict(v, anh='../cong-lang-v3/' + v['anh'])
    luu_json(meta, os.path.join(GOC, 'dia-hinh-v4.json'))
    print('xong:', ', '.join('%s %d ô' % (h, len(ds)) for h, ds in them.ho.items()), '+ ô v3:', ', '.join(sorted(giu)))


def kiem_vien(h, ds):
    """Ảnh kiểm viền: mọi ô của họ xếp cạnh nhau, đúng cỡ 2x, trên nền hồng (#ff00ff) và nền đen – soi viền trắng / rìa bẩn."""
    f = font(12, True)
    khe, dau = 16, 34
    ds = [d[:4] for d in ds]
    W = sum(max(im.shape[1], 90) for _, im, _, _ in ds) + khe * (len(ds) + 1)
    if W > 2400:
        n = (len(ds) + 1) // 2
        W = max(sum(max(im.shape[1], 90) for _, im, _, _ in ds[:n]), sum(max(im.shape[1], 90) for _, im, _, _ in ds[n:])) + khe * (n + 1)
        H = max(im.shape[0] for _, im, _, _ in ds[:n]) + max(im.shape[0] for _, im, _, _ in ds[n:]) + 2 * dau + 10
    else:
        n = len(ds)
        H = max(im.shape[0] for _, im, _, _ in ds) + dau + 10
    for ten_nen, nen in (('hong', (255, 0, 255)), ('den', (0, 0, 0))):
        canvas = Image.new('RGBA', (W, H), nen + (255,))
        d = ImageDraw.Draw(canvas)
        x, y, hmax = khe, dau, 0
        for i, (ten, im, neo, _) in enumerate(ds):
            if i == n:
                x, y, hmax = khe, y + hmax + dau + 10, 0
            canvas.alpha_composite(Image.fromarray(im), (x, y))
            mau = (255, 255, 255) if ten_nen == 'den' else (0, 0, 0)
            d.text((x, y - 30), ten, fill=mau, font=f)
            d.text((x, y - 16), '%d×%d logic · neo %d,%d' % (im.shape[1] // BOI, im.shape[0] // BOI, neo[0], neo[1]), fill=mau, font=f)
            d.line([(x + neo[0] - 6, y + neo[1]), (x + neo[0] + 6, y + neo[1])], fill=(0, 255, 255), width=1)
            d.line([(x + neo[0], y + neo[1] - 6), (x + neo[0], y + neo[1] + 6)], fill=(0, 255, 255), width=1)
            hmax = max(hmax, im.shape[0])
            x += max(im.shape[1], 90) + khe
        canvas.convert('RGB').save(os.path.join(XEM, 'kiem-vien-%s-%s.png' % (h, ten_nen)))


if __name__ == '__main__':
    chay()
