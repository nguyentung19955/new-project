#!/usr/bin/env python3
"""Cắt ảnh BƯỚC 2 (Sổ yêu quái, Việc hôm nay, Thành tựu — docs/anh-goc/buoc-2/B1..B17, nền #00FF00)
thành game/art/custom/*.sprite.json. Kế hoạch: docs/ke-hoach/buoc-2/KE-HOACH.md mục 3, mục 4 "Phiên D".

Chạy:  python3 docs/anh-goc/buoc-2/cat_buoc_2.py      (từ thư mục gốc repo; cần Pillow, numpy, scipy)

Theo mẫu docs/anh-goc/ep-do/cat_ep_do.py: dùng lại các bước của docs/anh-goc/zed/hieu-ung/cat_phi_tieu.py (xoá nền alpha mềm,
bỏ mảnh vụn, cắt khung theo dải trống, thu nhỏ trung bình vùng về điểm ảnh game × net 2, khử viền xanh).

  B1  -> gd-so-trang              trang sổ 166×173 (đúng cỡ trang trong bảng; dựng lại từ góc / cạnh / huy hiệu của ảnh gốc
                                  để KHÔNG kéo giãn hoa văn), "vien" = độ dày viền (chữ đặt trong lòng, trừ viền)
  B2  -> gd-so-bia                biểu tượng sổ 32×32 (chưa gắn: hàng thẻ chưa có biểu tượng)
  B3  -> gd-so-o-0 / -1 / -2      ô quái 31×31: chưa gặp / đã gặp / thuần thục
  B4  -> gd-so-dau-fire / -poison / -ice   dấu đỏ điểm yếu 18×18
  B5  -> gd-so-sao-0 .. -3        sao nấc 10×10: trống / đồng / bạc / vàng
  B6  -> gd-bang-viec             bảng việc làng 64×58 (góc bảng Việc hôm nay)
  B7  -> gd-the-viec / gd-the-viec-xong    thẻ việc 9 mảnh, cao 34 (giãn ngang tới 304)
  B8  -> gd-icon-viec-0 .. -11    biểu tượng loại việc 22×22 (tấm 4×3, đọc theo hàng)
  B9  -> gd-ruong-ngay / -mo      rương ngày 32×28
  B10 -> gd-o-tuan / -dau         ô ngày trong dải tuần 18×18
  B11 -> gd-huy-khung-dong / -bac / -vang / -khoa   khung huy hiệu 28×28
  B12 -> gd-huy-hinh-0 .. -15     hình giữa huy hiệu 18×18 (tấm 4×4, đọc theo hàng)
  B13 -> gd-danh-hieu-dong / -bac / -vang   băng danh hiệu 9 mảnh, cao 16
  B14 -> gd-the-zed / gd-the-so / gd-the-thanh-tuu / gd-the-viec-ngay   biểu tượng thẻ 16×16 (chưa gắn)
  B15 -> hu-nhan-thuong           hiệu ứng bấm Nhận, 6 khung
  B16 -> hu-dong-dau              hiệu ứng đóng dấu điểm yếu, 5 khung
  B17 -> hu-huy-hieu              hiệu ứng mở huy hiệu, 6 khung
Ghi docs/anh-goc/buoc-2/xem-truoc.png (mọi hình, phóng to, nền tối).
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(DIR, '..', 'zed', 'hieu-ung'))
import cat_phi_tieu as C  # noqa: E402

XEM = os.path.join(DIR, 'xem-truoc.png')
CHUNG = []
N = C.NET


def doc(ten):
    return np.asarray(Image.open(os.path.join(DIR, ten)).convert('RGB')).astype(np.float32)


def sach(ten, vun=60):
    return C.lam_sach(C.xoa_nen(doc(ten)), vun)


def dai(v):
    """Các đoạn liên tiếp True của mảng 1 chiều: [(đầu, cuối)]."""
    out, i = [], 0
    while i < len(v):
        if v[i]:
            j = i
            while j < len(v) and v[j]:
                j += 1
            out.append((i, j))
            i = j
        else:
            i += 1
    return out


def bbox(rgba):
    m = rgba[..., 3] > 128
    ys, xs = np.where(m)
    return ys.min(), ys.max() + 1, xs.min(), xs.max() + 1


def vao_o(crop, w, h, pad=1, s=None, doc_he=False):
    """Đặt crop (RGBA float, cỡ gốc) giữa ô w×h điểm ảnh game (chừa pad), thu nhỏ về (w, h) × net. s: điểm ảnh gốc / điểm game (cố định)."""
    ch, cw = crop.shape[:2]
    if s is None:
        s = max(cw / float(w - 2 * pad), ch / float(h - 2 * pad))
    W, H = int(round(w * s)), int(round(h * s))
    cv = np.zeros((H, W, 4), np.float32)
    ox, oy = (W - cw) // 2, (H - ch) // 2
    sx0, sy0 = max(0, -ox), max(0, -oy)
    dx0, dy0 = max(0, ox), max(0, oy)
    ww, hh = min(cw - sx0, W - dx0), min(ch - sy0, H - dy0)
    cv[dy0:dy0 + hh, dx0:dx0 + ww] = crop[sy0:sy0 + hh, sx0:sx0 + ww]
    return C.khu_xanh(C.thu_nho(cv, w * N, h * N), doc_he)


def cat_bao(rgba):
    y0, y1, x0, x1 = bbox(rgba)
    return rgba[y0:y1, x0:x1]


def ghi_gd(ma, ten, px, vien=None):
    d = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'ma': ma, 'ten': ten, 'doi_tuong': 'giao-dien', 'rong': px.shape[1] // N,
         'cao': px.shape[0] // N, 'net': N, 'anh': C.data_url(Image.fromarray(px, 'RGBA'))}
    if vien:
        d['vien'] = [int(v) for v in vien]
    with open(os.path.join(C.CUSTOM, ma + '.sprite.json'), 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, separators=(',', ':'))
    CHUNG.append((ma, [px], px.shape[1] // N, px.shape[0] // N, None, vien))
    print('%-22s gd %dx%d%s' % (ma, px.shape[1] // N, px.shape[0] // N, ('  vien ' + str(list(vien))) if vien else ''))


def hang_ngang(rgba, n):
    """Một hàng n hình rời: [(phần ảnh chỉ còn cột của hình k)]."""
    out = []
    for a, b in C.cat_khung(rgba, n):
        part = np.zeros_like(rgba)
        part[:, a:b] = rgba[:, a:b]
        out.append(cat_bao(part))
    return out


def hang_doc(rgba, n):
    """n hình xếp chồng theo chiều dọc (B7, B13): cắt theo dải hàng trống."""
    t = np.ascontiguousarray(rgba.transpose(1, 0, 2))
    out = []
    for a, b in C.cat_khung(t, n):
        part = np.zeros_like(rgba)
        part[a:b] = rgba[a:b]
        out.append(cat_bao(part))
    return out


def luoi(rgba, hang, cot):
    """Tấm hang × cot hình (B8, B12): dải hàng trống trước, rồi trong mỗi hàng chia cột. Đọc theo hàng."""
    t = np.ascontiguousarray(rgba.transpose(1, 0, 2))
    out = []
    for a, b in C.cat_khung(t, hang):
        band = np.zeros_like(rgba)
        band[a:b] = rgba[a:b]
        out += hang_ngang(band, cot)
    return out


def manh_lon(crop):
    """Giữ khung bao của mảnh liền lớn nhất (bỏ lấp lánh rời quanh ô vàng B3)."""
    m = crop[..., 3] > 128
    lab, n = ndimage.label(m)
    if n <= 1:
        return crop
    co = ndimage.sum(m, lab, range(1, n + 1))
    k = int(np.argmax(co)) + 1
    ys, xs = np.where(lab == k)
    return crop[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


# ---------------- B1: trang sổ, dựng lại đúng cỡ ----------------
def trang_so(W=166, H=173):
    """Ảnh gốc là khung ngang 3:2, trang trong game đứng (166×173). Kéo giãn 9 mảnh sẽ làm méo hoa văn và huy hiệu giữa cạnh,
    nên dựng lại ở cỡ gốc: giữ chiều ngang, nối dài hai cạnh bên bằng đoạn hoa văn lặp đúng chu kỳ, huy hiệu cạnh bên đặt lại
    giữa cạnh; lòng giấy kéo giãn (giấy cũ không có hoa văn). Rồi thu nhỏ một lần về 166×173."""
    a = sach('B1-gd-so-trang.png', 200)
    a = cat_bao(a)
    h0, w0 = a.shape[:2]
    s = w0 / float(W)  # điểm gốc / điểm game: giữ cả bề ngang
    Hs = int(round(H * s))
    # đo: lòng giấy (hàng / cột ở 1/4) — độ sáng làm mịn 15 điểm (giấy có vệt loang) > 140
    rgb = a[..., :3]
    sang = (ndimage.uniform_filter(rgb.mean(-1), 15) > 140) & (a[..., 3] > 200)
    cot = sang[:, w0 // 4]
    hang = sang[h0 // 4, :]
    dt = dai(cot)
    dl = dai(hang)
    top_in, bot_in = max(dt, key=lambda q: q[1] - q[0])
    l_in, r_in = max(dl, key=lambda q: q[1] - q[0])
    # huy hiệu cạnh bên + nẹp đồng hai bên nó: nằm quanh giữa chiều cao gốc (±12% chiều cao)
    yc = h0 // 2
    med = int(round(0.12 * h0))
    # chu kỳ hoa văn dọc ở cạnh trái: tự tương quan của dải cột viền giữa góc và nẹp huy hiệu
    y_a, y_b = int(0.24 * h0), yc - med
    dlv = rgb[y_a:y_b, 10:l_in].mean(-1)
    dlv = dlv - dlv.mean(0)
    best, P = -1e18, 40
    for p in range(20, min(120, (y_b - y_a) // 2)):
        v = (dlv[:-p] * dlv[p:]).sum() / (dlv.shape[0] - p)
        if v > best:
            best, P = v, p
    # dựng: [trên .. yc-med) + lặp đoạn hoa văn trơn ngay trên nẹp + [huy hiệu + nẹp] + lặp đoạn ngay dưới nẹp + [dưới]
    tren = a[:yc - med]
    giua = a[yc - med:yc + med]
    duoi = a[yc + med:]
    them = Hs - h0
    lap_tren = a[yc - med - P:yc - med]
    lap_duoi = a[yc + med:yc + med + P]
    can_tren = them // 2
    can_duoi = them - can_tren
    kn = int(np.ceil(can_tren / float(P)))

    def noi(lap, n_px, cuoi):
        k = int(np.ceil(n_px / float(P))) + 1
        x = np.concatenate([lap] * k, 0)
        return x[-n_px:] if cuoi else x[:n_px]  # nối liền chu kỳ: trên lấy phần cuối (khớp với nẹp), dưới lấy phần đầu
    out = np.concatenate([tren, noi(lap_tren, can_tren, True), giua, noi(lap_duoi, can_duoi, False), duoi], 0)
    # lòng giấy: thay bằng lòng gốc kéo giãn (bỏ phần giấy lặp và vệt giấy của dải huy hiệu)
    long_goc = a[top_in:bot_in, l_in:r_in]
    nh = out.shape[0] - top_in - (h0 - bot_in)
    im = Image.fromarray(np.clip(long_goc, 0, 255).astype(np.uint8), 'RGBA').resize((r_in - l_in, nh), Image.BICUBIC)
    out[top_in:top_in + nh, l_in:r_in] = np.asarray(im).astype(np.float32)
    px = C.khu_xanh(C.thu_nho(out, W * N, H * N), False)
    # huy hiệu cạnh bên nhô vào lòng giấy vài điểm: lòng trái / phải đo ở hàng giữa (qua huy hiệu), lấy bên hẹp hơn
    Lg = ndimage.uniform_filter(px[..., :3].astype(np.float32).mean(-1), 5)
    yg = px.shape[0] // 2
    gl, gr = max(dai(Lg[yg] > 140), key=lambda q: q[1] - q[0])
    # độ dày viền (điểm game): tới lòng giấy, +1 cho nét bóng trong
    v = [int(np.ceil(top_in / s)) + 1, int(np.ceil((w0 - r_in) / s)) + 1, int(np.ceil((h0 - bot_in) / s)) + 1, int(np.ceil(l_in / s)) + 1]
    v[3] = max(v[3], -(-gl // N) + 1)
    v[1] = max(v[1], W - gr // N + 1)
    print('  B1: chu kỳ hoa văn %d điểm gốc, lặp %d lần mỗi bên' % (P, kn))
    ghi_gd('gd-so-trang', 'Trang sổ yêu quái', px, v)


def nhieu_tinh(tep, ds, w, h, vun=60, lon=False, pad=1, cung_ti=False):
    """Một hàng nhiều hình rời -> mỗi hình một tệp gd. cung_ti: cùng tỉ lệ thu cho cả hàng (giữ cỡ tương đối, như sao / ô)."""
    parts = hang_ngang(sach(tep, vun), len(ds))
    if lon:
        parts = [manh_lon(p) for p in parts]
    s = None
    if cung_ti:
        s = max(max(p.shape[1] / float(w - 2 * pad), p.shape[0] / float(h - 2 * pad)) for p in parts)
    for p, (ma, ten) in zip(parts, ds):
        ghi_gd(ma, ten, vao_o(p, w, h, pad, s))


def the_9(tep, ds, H, n_sau=None, ti_so=1.0):
    """Thanh ngang xếp chồng (B7 thẻ việc, B13 băng danh hiệu) -> tệp 9 mảnh cao H, cùng tỉ lệ thu; vien đo theo lòng."""
    parts = hang_doc(sach(tep, 60), len(ds))
    s = max(p.shape[0] for p in parts) / float(H - 1) * ti_so
    out = []
    for p, (ma, ten, do_vien) in zip(parts, ds):
        w = int(np.ceil(p.shape[1] / s)) + 2
        px = vao_o(p, w, H, 0, s)
        v = do_vien(px)
        ghi_gd(ma, ten, px, v)
        out.append(px)
    return out


def vien_the_viec(px):
    """Lòng sáng của thẻ việc: hàng giữa / cột giữa, các điểm sáng liền nhau dài nhất."""
    a = px[..., 3] > 0
    L = px[..., :3].astype(np.int32).mean(-1)
    H, W = L.shape
    cot = (L[:, W // 3] > 170) & a[:, W // 3]
    t, b = max(dai(cot), key=lambda q: q[1] - q[0])
    y = t + 2  # hàng sát mép trên lòng (tránh dấu đỏ ở giữa đầu phải của thẻ "xong")
    hang = (L[y] > 170) & a[y]
    l, r = max(dai(hang), key=lambda q: q[1] - q[0])
    # điểm ảnh ảnh -> điểm game (làm tròn ra ngoài lòng); trái/phải +1 cho chắc hết nắp đồng
    return [(t + N - 1) // N, W // N - r // N + 1, H // N - b // N, (l + N - 1) // N + 1]


def vien_the_xong(px):
    """Thẻ "xong": như thẻ thường, nhưng ô cắt phải lùi qua hết dấu đỏ ✓ (không để dấu bị kéo giãn khi thẻ giãn ngang)."""
    v = vien_the_viec(px)
    r, g, b = [px[..., i].astype(np.int32) for i in range(3)]
    do = (r > 170) & (g < 90) & (b < 90) & (px[..., 3] > 0)
    do[:, :px.shape[1] // 2] = False  # chỉ tìm ở nửa phải (nắp đồng có điểm đỏ cam)
    xs = np.where(do.sum(0) >= 3)[0]
    if len(xs):
        v[1] = int(max(v[1], px.shape[1] // N - xs.min() // N + 1))
    return v


def vien_dai(px):
    """Băng danh hiệu: phần thân băng = các cột có độ phủ gần đầy theo chiều cao; hai bên là đuôi gấp."""
    # đo tự động không ổn (thân băng gợn sóng): đuôi + nếp cuộn ở ảnh gốc chiếm ~20% mỗi bên (soát bằng mắt ở xem-truoc.png)
    W = px.shape[1] // N
    k = int(round(W * 0.2))
    # ô cắt 9 mảnh: trên/dưới 0 (cả băng giãn theo chiều cao), trái/phải = đuôi + nếp cuộn
    return [0, k, 0, k]


def hieu_ung(tep, ma, ten, n, cao, neo, giay, vun=40):
    rgba = sach(tep, vun)
    m = rgba[..., 3] > 128
    hang = np.where(m.any(1))[0]
    s = (hang[-1] + 1 - hang[0]) / float(cao - 2)
    khung, fw, fh, _, _, _ = C.dung_tam(rgba, n, s, 'giua')
    khung = [C.khu_xanh(k, False) for k in khung]
    goc = (fw * neo[0], fh * neo[1])
    C.ghi_hu(ma, ten, khung, fw, fh, goc, giay, False, False, 'thuong')
    CHUNG.append((ma, khung, fw, fh, goc, None))
    print('%-22s %d khung %dx%d' % (ma, n, fw, fh))


def main():
    trang_so()
    p = cat_bao(sach('B2-gd-so-bia.png'))
    ghi_gd('gd-so-bia', 'Sổ yêu quái (biểu tượng)', vao_o(p, 32, 32))
    nhieu_tinh('B3-gd-so-o.png', [('gd-so-o-0', 'Ô sổ: chưa gặp'), ('gd-so-o-1', 'Ô sổ: đã gặp'), ('gd-so-o-2', 'Ô sổ: thuần thục')],
               31, 31, lon=True, pad=0, cung_ti=True)
    nhieu_tinh('B4-gd-so-dau.png', [('gd-so-dau-fire', 'Dấu điểm yếu: Lửa'), ('gd-so-dau-poison', 'Dấu điểm yếu: Độc'),
                                    ('gd-so-dau-ice', 'Dấu điểm yếu: Băng')], 18, 18, pad=0, cung_ti=True)
    nhieu_tinh('B5-gd-so-sao.png', [('gd-so-sao-%d' % i, 'Sao nấc sổ %d' % i) for i in range(4)], 10, 10, pad=0, cung_ti=True)
    p = cat_bao(sach('B6-gd-bang-viec.png'))
    ghi_gd('gd-bang-viec', 'Bảng việc làng', vao_o(p, int(round(58 * p.shape[1] / p.shape[0])) + 2, 60))
    the_9('B7-gd-the-viec.png', [('gd-the-viec', 'Thẻ việc (đang làm)', vien_the_viec), ('gd-the-viec-xong', 'Thẻ việc (xong)', vien_the_xong)], 34)
    tam8 = luoi(sach('B8-gd-icon-viec.png', 30), 3, 4)
    TEN8 = ['Hạ quái', 'Hạ tinh anh', 'Qua ải', 'Ba sao', 'Không bình máu', 'Ba hệ', 'Phản ứng hệ', 'Lộn né', 'Chưởng', 'Mở rương',
            'Nâng cấp', 'Ải ngày']
    for i, p in enumerate(tam8):
        ghi_gd('gd-icon-viec-%d' % i, 'Việc: ' + TEN8[i], vao_o(p, 22, 22))
    nhieu_tinh('B9-gd-ruong-ngay.png', [('gd-ruong-ngay', 'Rương ngày (đóng)'), ('gd-ruong-ngay-mo', 'Rương ngày (mở)')], 32, 28, pad=0, cung_ti=True)
    nhieu_tinh('B10-gd-o-tuan.png', [('gd-o-tuan', 'Ô ngày (trống)'), ('gd-o-tuan-dau', 'Ô ngày (đã đóng dấu)')], 18, 18, pad=0, cung_ti=True)
    nhieu_tinh('B11-gd-huy-khung.png', [('gd-huy-khung-dong', 'Khung huy hiệu đồng'), ('gd-huy-khung-bac', 'Khung huy hiệu bạc'),
                                        ('gd-huy-khung-vang', 'Khung huy hiệu vàng'), ('gd-huy-khung-khoa', 'Khung huy hiệu khoá')], 28, 28, pad=0, cung_ti=True)
    tam12 = luoi(sach('B12-gd-huy-hinh.png', 30), 4, 4)
    TEN12 = ['Chim Lạc', 'Bé', 'Sọ quái', 'Sao', 'Bình máu', 'Hai vũ khí', 'Mầm', 'Kiếm Thức tỉnh', 'Ba hệ', 'Đe', 'Lửa', 'Đá mài',
             'Sổ mở', 'Lịch mặt trời', 'Rương', 'Vương miện']
    for i, p in enumerate(tam12):
        ghi_gd('gd-huy-hinh-%d' % i, 'Hình huy hiệu: ' + TEN12[i], vao_o(p, 18, 18))
    the_9('B13-gd-danh-hieu.png', [('gd-danh-hieu-dong', 'Băng danh hiệu đồng', vien_dai), ('gd-danh-hieu-bac', 'Băng danh hiệu bạc', vien_dai),
                                   ('gd-danh-hieu-vang', 'Băng danh hiệu vàng', vien_dai)], 16)
    nhieu_tinh('B14-gd-the-ong-tu.png', [('gd-the-zed', 'Thẻ Cu Tí'), ('gd-the-so', 'Thẻ Sổ'), ('gd-the-thanh-tuu', 'Thẻ Thành tựu'),
                                         ('gd-the-viec-ngay', 'Thẻ Việc hôm nay')], 16, 16, pad=0, cung_ti=True)
    # neo: (0.5, 0.86) đáy vòng sáng / chân con dấu — đặt vào giữa dưới chỗ phát
    hieu_ung('B15-hu-nhan-thuong.png', 'hu-nhan-thuong', 'Bấm Nhận (vàng, ngọc tím toả ra)', 6, 44, (0.5, 0.86), 0.8)
    hieu_ung('B16-hu-dong-dau.png', 'hu-dong-dau', 'Đóng dấu điểm yếu', 5, 30, (0.5, 0.88), 0.6)
    hieu_ung('B17-hu-huy-hieu.png', 'hu-huy-hieu', 'Mở huy hiệu (đồng xoay, vòng chim Lạc)', 6, 40, (0.5, 0.5), 0.8)
    xem()


def xem():
    hang = []
    for ma, khung, fw, fh, goc, vien in CHUNG:
        Z = 4 if fh <= 50 else 2
        if fw > 120:
            Z = 2
        w, h = fw * N * Z // 2, fh * N * Z // 2
        row = Image.new('RGBA', (190 + len(khung) * (w + 8), max(h, 30) + 8), (24, 26, 34, 255))
        dr = ImageDraw.Draw(row)
        dr.text((4, 4), ma, fill=(230, 230, 230, 255))
        dr.text((4, 18), '%dx%d x%d' % (fw, fh, len(khung)), fill=(150, 150, 160, 255))
        for i, k in enumerate(khung):
            x = 190 + i * (w + 8)
            im = Image.fromarray(k, 'RGBA').resize((w, h), Image.NEAREST)
            row.alpha_composite(im, (x, 4))
            if goc:
                gx, gy = x + goc[0] * Z, 4 + goc[1] * Z
                dr.ellipse([gx - 3, gy - 3, gx + 3, gy + 3], outline=(255, 60, 60, 255))
            if vien:  # đường cắt 9 mảnh / lòng (xanh nhạt)
                t, r, b, l = [v * Z for v in vien]
                dr.rectangle([x + l, 4 + t, x + w - r - 1, 4 + h - b - 1], outline=(80, 220, 255, 255))
        hang.append(row)
    # xếp 2 cột cho đỡ dài
    W = max(r.width for r in hang)
    cot = [[], []]
    hc = [0, 0]
    for r in hang:
        k = 0 if hc[0] <= hc[1] else 1
        cot[k].append(r)
        hc[k] += r.height + 4
    out = Image.new('RGBA', (W * 2 + 8, max(hc)), (16, 18, 24, 255))
    for k in range(2):
        y = 0
        for r in cot[k]:
            out.alpha_composite(r, (k * (W + 8), y))
            y += r.height + 4
    out.convert('RGB').save(XEM, optimize=True)
    print('xem-truoc.png', out.size)


if __name__ == '__main__':
    main()
