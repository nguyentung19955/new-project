#!/usr/bin/env python3
"""Tách 6 ảnh gen nền trắng (art/the-gioi-moi/nguon-v3/) thành asset trang trí địa hình Cổng làng, xuất 2x
vào art/the-gioi-moi/cong-lang-v3/ (atlas từng họ + cong-lang-v3.json) và ảnh kiểm viền (xem-thu/kiem-vien-*.png).

Mỗi ảnh: tách nền trắng bằng flood-fill từ mép (chung.nen_trang: vùng trắng nối mép + lỗ trắng kín bao bởi nét mực),
khử viền trắng (chung.khu_vien_trang: điểm sát nền coi là trộn màu đặc với trắng → alpha), cắt từng mảnh theo hộp
cố định bên dưới, thu về cỡ logic đã chọn (×2 ảnh), dán vào atlas của họ. Cỡ logic chọn theo lưới ô 32 / Lam 112:

  mang-go-lon   6 mảng gỗ trơ, rộng ≈ 3,5 ô (112 logic) – phủ lên thân sàn / tường
  chan-re-goc   2 chân rễ (đủ + bản thấp đã cắt thân, mờ dần ở mép cắt), 2 rễ ôm cột đá (đã BỎ phần đá, chỉ giữ rễ + rêu),
                2 rễ ôm góc đá (đủ cả đá – chưa dùng ở Cổng làng)
  mep-dat-re    2 bộ × (đầu trái, giữa, đầu phải): dày ≈ 30 logic (1 ô), giữa dài 4 ô; đầu cắt được làm mờ dần 6 px để nối
  be-neo        6 bệ gốc + 1 bệ GHÉP "be-re-do": rễ đỡ dưới bệ 3 ô (96 logic) × cao 96 logic (3 ô) → mặt đứng = mép trên
  cua-cong-nha  cửa nhà trong thân cây (khung cửa + đèn lồng + cờ, rộng khung = 96 logic = 3 ô), ban công, cổng vòm, cửa chặn rễ
  tien-canh-re-da  2 cụm rễ-đá mép trái / phải, thu 0,8 (tip thấp nhất ≈ 47 % màn sau khi dời lên 60 logic trong game)

Họ có đuôi "-kho" = mảnh đã tách nhưng Cổng làng CHƯA dùng (bệ gốc 6 kiểu, ban công / cổng vòm / cửa chặn rễ, rễ ôm góc đá) –
game không nạp các atlas này (đỡ bộ nhớ); để dành chọn kiểu / áp sang màn khác.

Chạy: python3 -B art/the-gioi-moi/cong-lang-v3/code/tach.py   (cần Pillow, numpy, scipy; ~10 s)"""
import os
import sys

import numpy as np
import scipy.ndimage as nd
from PIL import Image, ImageDraw

CODE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.dirname(CODE)                                    # cong-lang-v3/
sys.path.insert(0, os.path.normpath(os.path.join(GOC, '..', 'lang-chuong', 'code')))
from chung import doi_co, font, khu_vien_trang, luu_json, luu_png, mat_trang, nen_trang, xep_atlas   # noqa: E402

NGUON = os.path.normpath(os.path.join(GOC, '..', 'nguon-v3'))
XEM = os.path.join(GOC, 'xem-thu')
BOI = 2

_cache = {}


def tach(ten):
    """Ảnh gen → RGBA uint8 (nền trong, viền trắng đã khử) + mặt nạ đặc."""
    if ten in _cache:
        return _cache[ten]
    a = np.array(Image.open(os.path.join(NGUON, ten + '.png')).convert('RGB')).astype(np.float64)
    bg = nen_trang(a)
    # vệt trắng nhỏ kín (< 400 px) nằm trong hình (vd. khía trắng ở mép mảng gỗ) → coi là nền (trong suốt)
    w = mat_trang(a) & ~bg
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


def cat(rgba, box, pad=2):
    x0, y0, x1, y1 = box
    sub = rgba[max(0, y0 - pad):y1 + pad, max(0, x0 - pad):x1 + pad]
    ys, xs = np.nonzero(sub[..., 3] > 0)
    return sub[ys.min():ys.max() + 1, xs.min():xs.max() + 1].copy()


def thu(rgba, k):
    h, w = rgba.shape[:2]
    return doi_co(rgba, max(1, round(w * k)), max(1, round(h * k)))


def toi(rgba, sang, bh):
    """Làm tối (×sang) và bớt bão hoà (×bh), giữ alpha."""
    a = rgba.astype(np.float64)
    L = (a[..., :3] @ np.array([0.299, 0.587, 0.114]))[..., None]
    a[..., :3] = np.clip((L + (a[..., :3] - L) * bh) * sang, 0, 255)
    o = np.round(a).astype(np.uint8)
    o[o[..., 3] == 0] = 0
    return o


def mo_dan(rgba, canh, px):
    """Làm mờ dần alpha ở cạnh cắt ('tren'/'duoi'/'trai'/'phai') trong px điểm."""
    a = rgba.astype(np.float64)
    h, w = a.shape[:2]
    if canh in ('tren', 'duoi'):
        r = np.arange(h, dtype=float)
        f = np.clip((r + 0.5) / px, 0, 1) if canh == 'tren' else np.clip((h - r - 0.5) / px, 0, 1)
        a[..., 3] *= f[:, None]
    else:
        r = np.arange(w, dtype=float)
        f = np.clip((r + 0.5) / px, 0, 1) if canh == 'trai' else np.clip((w - r - 0.5) / px, 0, 1)
        a[..., 3] *= f[None, :]
    o = np.round(a).astype(np.uint8)
    o[o[..., 3] == 0] = 0
    return o


def bo_da(rgba, src_rgb):
    """Rễ ôm cột đá: bỏ đá (xám, bão hoà thấp) + nét đen chỉ bao quanh đá; giữ rễ, rêu, lá và nét bao quanh chúng."""
    a = src_rgb
    mx, mn = a.max(-1), a.min(-1)
    sat = mx - mn
    dac = rgba[..., 3] > 0
    xam = dac & (sat < 34) & (mn > 55)                           # đá: xám / xám xanh nhạt
    toi = dac & (mx < 70)                                        # nét mực đen
    mau = dac & ~xam & ~toi                                      # rễ (nâu), rêu (xanh)
    # đá còn sót (mạch vữa tối trong khối đá): vùng tối nằm hoàn toàn trong vùng đá giãn
    da = nd.binary_dilation(xam, iterations=6)
    giu = mau | (toi & nd.binary_dilation(mau, iterations=3))    # nét bao quanh rễ / rêu
    giu = nd.binary_fill_holes(giu) & dac
    # nét đen cạnh đá nhưng không cạnh rễ → bỏ; mảnh rễ quá nhỏ → bỏ
    lab, n = nd.label(giu)
    if n > 1:
        sz = nd.sum(giu, lab, range(1, n + 1))
        giu &= ~np.isin(lab, np.nonzero(sz < 400)[0] + 1)
    o = rgba.copy()
    o[~giu] = 0
    # mép cắt với đá (không có nét): thêm nét nâu sẫm 2 px từ phía rễ
    vien = giu & ~nd.binary_erosion(giu, iterations=2) & nd.binary_dilation(da & ~giu, iterations=2)
    o[vien, :3] = (40, 26, 16)
    return o


# ---------------------------------------------------------------- hộp cắt (toạ độ ảnh gen)
def chay():
    os.makedirs(XEM, exist_ok=True)
    meta = {'boi': BOI, 'ghi_chu': 'khung [x,y,w,h] và neo [ax,ay] tính bằng px ảnh (2x); chia 2 ra logic. Cỡ logic = w/2 × h/2.',
            'anh': {}, 'o': {}}
    ho = {}                                                       # họ → list (tên, rgba, neo, ghi chú)

    def them(h, ten, im, neo, chu=''):
        ho.setdefault(h, []).append((ten, im, neo, chu))

    # ---- mảng gỗ lớn: 6 mảng, rộng ≈ 3,5 ô
    im, fg, a = tach('mang-go-lon')
    K_GO = 224 / 470.0
    for i, box in enumerate([(34, 13, 502, 468), (539, 23, 987, 469), (1046, 24, 1510, 468),
                             (33, 525, 500, 982), (535, 511, 997, 982), (1030, 515, 1507, 981)]):
        p = thu(cat(im, box), K_GO)
        them('mang-go-lon', 'mang-go-%d' % (i + 1), p, [0, 0], 'neo góc trên-trái')

    # ---- chân rễ / rễ ôm cột / rễ ôm góc đá
    im, fg, a = tach('chan-re-goc')
    K_CHAN = 92 / 389.0                                          # chân rễ đủ cao 46 logic
    for i, box in enumerate([(24, 116, 573, 471), (602, 91, 1123, 479)]):
        p = cat(im, box)
        them('chan-re-goc', 'chan-re-%d' % (i + 1), thu(p, K_CHAN), None, 'neo giữa đáy')
        h = p.shape[0]
        th = mo_dan(p[int(h * 0.5):], 'tren', 36)                # bản thấp: bỏ nửa trên (thân + rêu), mờ dần mép cắt
        them('chan-re-goc', 'chan-re-%d-thap' % (i + 1), thu(th, K_CHAN), None, 'neo giữa đáy; chỉ rễ, mép cắt mờ dần')
    K_COT = 240 / 463.0                                          # rễ ôm cột: cao 120 logic
    for i, box in enumerate([(1166, 39, 1507, 501), (39, 518, 360, 954)]):
        x0, y0, x1, y1 = box
        sub = im[y0:y1, x0:x1]
        p = bo_da(sub, a[y0:y1, x0:x1])
        ys, xs = np.nonzero(p[..., 3] > 0)
        p = p[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
        them('chan-re-goc', 're-om-cot-%d' % (i + 1), thu(p, K_COT), None, 'neo giữa đáy; đã bỏ đá – đặt đè lên cột đá của game')
    # 2 rễ ôm góc đá dính nhau trong ảnh gen → tách ở cột trống giữa
    sub = fg[600:940, 383:1513]
    cols = sub.any(0)
    tr = [j for j in range(400, 800) if not cols[j]]
    chia = 383 + (tr[len(tr) // 2] if tr else 600)
    K_GOC = 0.3
    for i, box in enumerate([(383, 600, chia, 940), (chia, 600, 1513, 940)]):
        them('chan-re-goc-kho', 're-om-goc-da-%d' % (i + 1), thu(cat(im, box), K_GOC), None, 'neo giữa đáy; có đá – chưa dùng ở Cổng làng')

    # ---- mép đất rễ-rêu: 2 bộ (trái, giữa, phải), giữa dài 4 ô
    im, fg, a = tach('mep-dat-re')
    K_MEP = 256 / 538.0
    for b, (bt, bg, bp) in enumerate([((35, 218, 555, 354), (620, 225, 1157, 351), (1222, 216, 1736, 391)),
                                      ((35, 516, 555, 679), (620, 524, 1157, 651), (1222, 514, 1735, 716))]):
        t = thu(mo_dan(cat(im, bt), 'phai', 14), K_MEP)
        g = thu(mo_dan(mo_dan(cat(im, bg), 'trai', 14), 'phai', 14), K_MEP)
        p = thu(mo_dan(cat(im, bp), 'trai', 14), K_MEP)
        # neo y = 4 px (2 logic) dưới mép trên hộp → đặt neo đúng mặt collider thì rêu chỉ nhô lên tối đa 2 logic.
        # neo x của đầu trái/phải = cột đầu tiên/cuối có RÊU MẶT TRÊN (6 hàng đầu) → đặt neo ở mép collider thì mặt rêu
        # bắt đầu đúng mép; phần rễ cuộn ở đầu nằm THẤP hơn mặt, thò ra ngoài mép vài px.
        def x_mat(im, phai):
            cols = np.nonzero((im[:8, :, 3] > 40).any(0))[0]
            return int(cols.max() + 1) if phai else int(cols.min())
        them('mep-dat-re', 'mep-%d-trai' % (b + 1), t, [x_mat(t, False), 4], 'neo = (cột bắt đầu mặt rêu, 2 logic dưới đỉnh); đầu trái')
        them('mep-dat-re', 'mep-%d-giua' % (b + 1), g, [0, 4], 'neo góc trên-trái (−2 logic); xếp kề nhau, đầu mờ dần 7 px')
        them('mep-dat-re', 'mep-%d-phai' % (b + 1), p, [x_mat(p, True), 4], 'neo = (cột kết thúc mặt rêu, 2 logic dưới đỉnh); đầu phải')

    # ---- bệ có điểm neo: 6 bệ gốc + bệ ghép "rễ đỡ" cho bệ 3 ô
    im, fg, a = tach('be-neo')
    K_BE = 0.4
    ten_be = ['gia-go-1', 're-do-1', 'van-day-1', 're-do-2', 'van-day-2', 'gia-go-2']
    for i, box in enumerate([(26, 133, 483, 436), (553, 48, 1029, 456), (1085, 42, 1514, 388),
                             (538, 535, 1032, 966), (1085, 551, 1514, 906), (26, 611, 483, 927)]):
        them('be-neo-kho', 'be-' + ten_be[i], thu(cat(im, box), K_BE), [0, 0], 'bệ gốc, neo góc trên-trái (chưa đặt – để chọn kiểu)')
    them('be-neo', 'be-re-do', *be_re_do(im, a))

    # ---- cửa / cổng / nhà
    im, fg, a = tach('cua-cong-nha')
    cua = bo_than_cay(im, a)                                     # khung cửa + giá đèn lồng + cờ (bỏ thân cây bao quanh)
    k = 192 / 307.0                                               # khung cửa 222..528 → 192 px = 96 logic = 3 ô
    cua = thu(cua, k)
    them('cua-cong-nha', 'cua-nha', cua, [round((222 - 85) * k + 96), cua.shape[0]], 'neo giữa đáy KHUNG CỬA; khung rộng 96 logic, đèn + cờ nhô bên trái 44 logic')
    them('cua-cong-nha-kho', 'ban-cong', thu(cat(im, (820, 27, 1507, 500)), 0.3), None, 'neo giữa đáy; chưa dùng (sàn ban công = mặt đứng giả)')
    them('cua-cong-nha-kho', 'cong-vom', thu(cat(im, (35, 500, 781, 972)), 0.3), None, 'neo giữa đáy; chưa dùng')
    them('cua-cong-nha-kho', 'cua-chan-re', thu(cat(im, (796, 500, 1507, 974)), 176 / 712.0), None, 'neo giữa đáy; chưa dùng')

    # ---- tiền cảnh rễ-đá: 2 cụm mép trái / phải, thu 0,8 so với màn 960
    im, fg, a = tach('tien-canh-re-da')
    K_TC = 960 * BOI / 1672.0 * 0.8
    # lớp gần nhất: làm tối 0,62 + bớt màu 0,8 (như tiền cảnh Làng Chuông v2) để đọc là bóng rễ trước mặt, không tranh với Lam
    tl = toi(thu(cat(im, (0, 0, 368, 687), 0), K_TC), 0.62, 0.8)
    them('tien-canh-re-da', 'tien-canh-trai', tl, [0, 0], 'neo góc trên-TRÁI màn (cuộn 1,05); đã làm tối 0,62')
    r = toi(thu(cat(im, (1255, 0, 1672, 687), 0), K_TC), 0.62, 0.8)
    them('tien-canh-re-da', 'tien-canh-phai', r, [r.shape[1], 0], 'neo góc trên-PHẢI màn (cuộn 1,05); đã làm tối 0,62')

    # ---- xếp atlas từng họ + JSON + ảnh kiểm viền
    for h, ds in ho.items():
        items = [(t, im) for t, im, _, _ in ds]
        tong = sum(im.shape[1] + 2 for _, im in items) + 2
        rong = tong if tong <= 1024 else (1200 if h == 'tien-canh-re-da' else 1024)   # atlas vừa khít khi đủ nhỏ (đỡ bộ nhớ)
        at, pos = xep_atlas(items, rong=rong)
        luu_png(at, os.path.join(GOC, h + '.png'))
        meta['anh'][h] = {'tep': h + '.png', 'co_anh': [at.shape[1], at.shape[0]]}
        for t, im, neo, chu in ds:
            hh, ww = im.shape[:2]
            if neo is None:
                neo = [ww // 2, hh]
            meta['o'][t] = {'anh': h + '.png', 'khung': pos[t], 'neo': [int(neo[0]), int(neo[1])], 'co_logic': [ww / BOI, hh / BOI], 'ghi_chu': chu}
        kiem_vien(h, ds)
    luu_json(meta, os.path.join(GOC, 'cong-lang-v3.json'))
    print('xong:', ', '.join('%s %d ô' % (h, len(ds)) for h, ds in ho.items()))


def bo_than_cay(src_rgba, src_rgb):
    """Cửa nhà trong thân cây (ảnh gen, toạ độ ảnh gốc): giữ KHUNG CỬA (x 222..528, y 112..485, đỉnh bo vòm) + giá treo,
    đèn lồng, cờ (x 85..225, y 95..365); bỏ thân cây / rêu / rễ bao quanh. Trả RGBA đã cắt gọn."""
    x0, y0, x1, y1 = 85, 95, 528, 485
    o = src_rgba[y0:y1, x0:x1].copy()
    a = src_rgb[y0:y1, x0:x1]
    h, w = o.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    X, Y = xx + x0, yy + y0
    # khung cửa: hình chữ nhật 222..528 × 112..485, hai góc trên bo theo cung tròn (tâm (375, 262), bán kính 153)
    khung = (X >= 222) & (X <= 528) & (Y >= 112) & (Y <= 485)
    goc = (Y < 262) & (((X - 375.0) ** 2 + (Y - 262.0) ** 2) > 153.0 ** 2)
    khung &= ~goc
    # giá treo + đèn + cờ: x < 225; từ y 165 trở xuống chỉ giữ phần KHÔNG phải thân cây nâu (cờ xanh, đèn vàng sáng, nét tối)
    mx = a.max(-1)
    nau = (a[..., 0] > a[..., 2] + 18) & (a[..., 0] > a[..., 1] + 22) & (mx > 80) & (mx < 185)   # thân cây nâu (không phải hoa văn vàng-lục trên cờ)
    den = (X >= 85) & (X < 225) & (Y >= 95) & (Y <= 365)
    tren = den & (Y < 165)
    duoi = den & (Y >= 165) & ~nau
    # bỏ hạt nhỏ còn sót ở vùng cờ
    giu = khung | tren | duoi
    giu &= o[..., 3] > 0
    lab, n = nd.label(giu)
    if n > 1:
        sz = nd.sum(giu, lab, range(1, n + 1))
        giu &= ~np.isin(lab, np.nonzero(sz < 150)[0] + 1)
    o[~giu] = 0
    ys, xs = np.nonzero(o[..., 3] > 0)
    return o[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def be_re_do(im, a):
    """Bệ 'rễ cây đỡ' (mảnh 2 của be-neo) ghép cho bệ một chiều 3 ô (96 logic) cao 3 ô trên sàn:
    - thu để bề rộng (thân + cành) = 96 logic; cắt bỏ phần thân CAO HƠN mặt rêu (không có mặt nào cao hơn collider);
    - kéo thân xuống đủ 96 logic tới sàn bằng cách lặp một lát thân giữa; đáy thân thêm 6 logic lún dưới mặt sàn (bị gạch sàn che).
    Neo = góc trên-trái = mép trên mặt đứng (x = mép trái collider, y = mặt bệ)."""
    p = cat(im, (553, 48, 1029, 456))
    p_full = p.copy()
    al = p[..., 3] > 0
    # mặt rêu: hàng đầu tiên (từ trên) mà phần cành (x > 45 % bề rộng) có điểm đặc
    w = p.shape[1]
    canh = al[:, int(w * 0.45):].any(1)
    y_mat = int(np.argmax(canh))
    # mép trên của rêu cành là mặt đứng; cắt bỏ mọi thứ cao hơn y_mat (thân cây mọc quá mặt bệ)
    p = p[y_mat:].copy()
    # thân bị cắt phẳng ngang mặt bệ → phủ dải rêu lấy từ cành (ngay bên phải thân) lên đầu thân cho mặt bệ liền một dải rêu
    x_than = int(w * 0.27)                                       # thân ≈ 27 % bề rộng bên trái
    reu = p[:70, x_than:x_than + x_than].copy()
    reu = reu[:, :x_than] if reu.shape[1] >= x_than else np.pad(reu, ((0, 0), (0, x_than - reu.shape[1]), (0, 0)))
    reu = reu[:, ::-1]                                           # lật ngang cho khác cành
    m = reu[..., 3] > 0
    dau = p[:70, :x_than]
    dau[m] = reu[m]
    k = 192 / w
    H_MUC = round((192 + 12) / k)                                # cao 96 logic xuống sàn + 6 logic lún (tính ở cỡ ảnh gen)
    h = p.shape[0]
    if h < H_MUC:
        # thân chưa đủ dài: chèn dải thân ghép từ THÂN TRÊN (phần đã cắt bỏ phía trên mặt rêu – vỏ cây thật) + bản sao
        # thân dưới, kéo dọc vừa phần thiếu, nối bằng hoà trộn chéo (premultiplied) 16 px ở các mối
        y_ins = int(h * 0.72)                                     # dưới chỗ rễ cành bám thân
        can = H_MUC - h
        OV = 16

        def rong_than(seg, y):
            xs = np.nonzero(seg[y, :x_than, 3] > 0)[0]
            return (xs.min(), xs.max() + 1) if len(xs) else (0, x_than)

        x0, x1 = rong_than(p, y_ins)                              # bề rộng thân ở chỗ chèn
        wt = x1 - x0

        def chuan(seg):                                           # kéo ngang mảnh thân về đúng bề rộng wt, đặt tại x0
            m = seg[..., 3].any(0)
            xs = np.nonzero(m)[0]
            s = seg[:, xs.min():xs.max() + 1]
            s = np.asarray(Image.fromarray(s).resize((wt, s.shape[0]), Image.LANCZOS))
            out = np.zeros((s.shape[0], x_than, 4), np.uint8)
            out[:, x0:x1] = s
            return out

        tren = chuan(p_full[:y_mat, :x_than])
        duoi = chuan(p[y_ins:, :x_than])
        dai = tron_doc(tren, duoi, OV)                            # dải thân ghép
        dai = np.asarray(Image.fromarray(dai).resize((x_than, can + 2 * OV), Image.LANCZOS))
        goc = np.zeros((h + can, p.shape[1], 4), np.uint8)
        goc[:y_ins] = p[:y_ins]
        goc[y_ins + can:] = p[y_ins:]
        top, bot = p[y_ins - OV:y_ins, :x_than], p[y_ins:y_ins + OV, :x_than]
        goc[y_ins - OV:y_ins + can + OV, :x_than] = tron_doc(tron_doc(top, dai, OV), bot, OV)
        p = goc
    q = thu(p, k)                                                # rộng 192 px = 96 logic
    # đáy thân: cắt phẳng (lún dưới sàn) – giữ nguyên
    return q, [0, 0], 'bệ GHÉP: rễ đỡ cho bệ 3 ô; neo góc trên-trái = (mép trái collider, mặt bệ); cao 96 + 6 lún'


def tron_doc(A, B, OV):
    """Nối A trên B theo chiều dọc, OV hàng cuối của A hoà trộn chéo với OV hàng đầu của B (premultiplied alpha)."""
    A = A.astype(np.float64); B = B.astype(np.float64)
    pa = np.dstack([A[..., :3] * A[..., 3:4] / 255, A[..., 3]])
    pb = np.dstack([B[..., :3] * B[..., 3:4] / 255, B[..., 3]])
    t = np.linspace(0, 1, OV + 2)[1:-1][:, None, None]
    mid = pa[-OV:] * (1 - t) + pb[:OV] * t
    ca, cb = (pa[-OV:, :, 3] > 0).any(0), (pb[:OV, :, 3] > 0).any(0)   # cột chỉ một bên có hình → giữ nguyên bên đó (không mờ)
    mid[:, ca & ~cb] = pa[-OV:][:, ca & ~cb]
    mid[:, cb & ~ca] = pb[:OV][:, cb & ~ca]
    pm = np.concatenate([pa[:-OV], mid, pb[OV:]])
    al = pm[..., 3:4]
    rgb = np.where(al > 1e-3, pm[..., :3] * 255 / np.maximum(al, 1e-3), 0)
    out = np.round(np.dstack([rgb, pm[..., 3]])).clip(0, 255).astype(np.uint8)
    out[out[..., 3] == 0] = 0
    return out


def kiem_vien(h, ds):
    """Ảnh kiểm viền: mọi ô của họ xếp cạnh nhau, đúng cỡ ảnh 2x, trên nền hồng (#ff00ff) và nền đen – soi viền trắng / rìa bẩn."""
    f = font(12, True)
    khe, dau = 16, 34
    W = sum(max(im.shape[1], 90) for _, im, _, _ in ds) + khe * (len(ds) + 1)
    if W > 2400:                                                  # 2 hàng
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
            d.text((x, y - 16), '%d×%d logic' % (im.shape[1] // BOI, im.shape[0] // BOI), fill=mau, font=f)
            hmax = max(hmax, im.shape[0])
            x += max(im.shape[1], 90) + khe
        canvas.convert('RGB').save(os.path.join(XEM, 'kiem-vien-%s-%s.png' % (h, ten_nen)))


if __name__ == '__main__':
    chay()
