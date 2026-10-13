#!/usr/bin/env python3
"""Cắt ảnh hiệu ứng PHI TIÊU (nền xanh lá #00FF00) thành tệp game/art/custom/*.sprite.json (định dạng 'linh-khi-sprite').

Chạy:  python3 docs/anh-goc/zed/hieu-ung/cat_phi_tieu.py      (từ thư mục gốc repo; cần Pillow, numpy, scipy)

Cách làm cho mỗi tấm:
  1. Xoá nền: điểm ảnh gần màu nền xanh lá thành trong suốt (độ trong mềm theo khoảng cách màu tới nền).
  2. Cắt khung THEO ĐƯỜNG VIỀN: chiếu các điểm có hình xuống trục ngang, tìm các dải cột trống; lấy (số khung − 1) dải trống
     DÀI NHẤT làm chỗ cắt (không chia đều ô vuông). Các mảnh vụn rất nhỏ (nhiễu nén ảnh) bị bỏ trước khi đo.
  3. Mỗi khung đặt vào ô chung theo kiểu canh (trái / giữa / phải), hàng dọc giữ nguyên vị trí như trong tấm gốc,
     rồi thu nhỏ bằng trung bình vùng (BOX) về cỡ điểm ảnh game × net (net = 2 như các tệp cũ).
  4. Khử viền xanh: điểm có độ đậm < 50% bỏ; điểm còn lại bị "ăn" màu xanh (G vượt cả R và B) thì kéo G xuống.
     Tấm hệ Độc (xanh chanh thật) chỉ khử những điểm xanh lá thuần (R và B đều thấp) nằm ở mép.
Ghi thêm xem-truoc.png (mọi khung, phóng 4 lần, nền tối).
"""
import base64
import io
import json
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(DIR, '..', '..', '..', '..'))
CUSTOM = os.path.join(ROOT, 'game', 'art', 'custom')
NEN = np.array([16, 240, 16], dtype=np.float32)
NET = 2


def doc(ten):
    return np.asarray(Image.open(os.path.join(DIR, ten)).convert('RGB')).astype(np.float32)


def xoa_nen(rgb):
    """Trả về ảnh RGBA float (0..255) với alpha mềm theo khoảng cách tới màu nền xanh lá."""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    # "độ xanh nền": G vượt hẳn R và B (nền: ~224). Xanh chanh của hệ Độc có R cao nên độ xanh thấp.
    d = g - np.maximum(r, b)
    dist = np.sqrt(((rgb - NEN) ** 2).sum(-1))
    a1 = np.clip((150.0 - d) / 70.0, 0, 1)
    a2 = np.clip((dist - 40.0) / 80.0, 0, 1)
    a = np.maximum(a1, a2) * (dist > 30)
    a = np.where(d > 175, 0, a)
    # gỡ phần nền trộn vào điểm mép (điểm mờ = màu thật × a + nền × (1 − a))
    aa = np.maximum(a, 1e-3)[..., None]
    sach = np.clip((rgb - (1 - aa) * NEN) / aa, 0, 255)
    rgb = np.where((a > 0.05)[..., None] & (a < 1)[..., None], sach, rgb)
    return np.dstack([rgb, a * 255.0])


def lam_sach(rgba, vun=40):
    """Bỏ các mảnh vụn nhỏ (nhiễu) để không làm sai chỗ cắt và khung bao."""
    m = rgba[..., 3] > 128
    lab, n = ndimage.label(m)
    if n:
        co = ndimage.sum(m, lab, range(1, n + 1))
        bo = np.isin(lab, np.where(co < vun)[0] + 1)
        rgba[..., 3][bo] = 0
        # điểm mờ không dính mảnh lớn nào cũng bỏ
        m2 = ndimage.binary_dilation(rgba[..., 3] > 128, iterations=3)
        rgba[..., 3][~m2] = 0
    return rgba


def cat_khung(rgba, n):
    """Cắt theo dải cột trống dài nhất. Trả về danh sách (x0, x1) theo cột của tấm gốc."""
    cot = (rgba[..., 3] > 128).sum(0) > 0
    xs = np.where(cot)[0]
    x0, x1 = xs[0], xs[-1] + 1
    trong = []  # (độ dài, bắt đầu, kết thúc) các dải trống bên trong
    i = x0
    while i < x1:
        if not cot[i]:
            j = i
            while j < x1 and not cot[j]:
                j += 1
            trong.append((j - i, i, j))
            i = j
        else:
            i += 1
    trong.sort(reverse=True)
    cat = sorted([t for t in trong[: n - 1] if t[0] >= 15], key=lambda t: t[1])
    ds, s = [], x0
    for _, a, b in cat:
        ds.append((s, a))
        s = b
    ds.append((s, x1))
    # Hai khung dính nhau (không có dải trống đủ dài): tách mảnh rộng nhất ở cột ít điểm nhất trong khoảng giữa của nó
    dem = (rgba[..., 3] > 128).sum(0).astype(np.float32)
    dem = np.convolve(dem, np.ones(5) / 5, mode='same')
    while len(ds) < n:
        k = max(range(len(ds)), key=lambda i: ds[i][1] - ds[i][0])
        a, b = ds[k]
        lo, hi = a + (b - a) // 4, b - (b - a) // 4
        c = lo + int(np.argmin(dem[lo:hi]))
        print('  (tách hai khung dính nhau ở cột %d)' % c)
        ds[k:k + 1] = [(a, c), (c, b)]
    return ds


def khu_xanh(px, doc_he, trang=False):
    """px: mảng RGBA uint8 đã thu nhỏ. Khử viền xanh lá."""
    r, g, b, a = [px[..., i].astype(np.int32) for i in range(4)]
    m = np.maximum(r, b)
    if doc_he:
        # chỉ điểm xanh lá thuần (giống nền) ở mép mới khử
        mep = ndimage.binary_dilation(a == 0, iterations=1) & (a > 0)
        thuan = (g > m + 70) & (m < 110)
        a = np.where(thuan & mep, 0, a)
        g = np.where(thuan & ~mep, (g + m) // 2, g)
    else:
        if trang:  # hiệu ứng trắng-xám: điểm còn ám xanh lá/xanh ngọc chuyển hẳn sang xám
            am = (g > np.minimum(r, b) + 6) & (np.abs(r - b) < 40)
            v = np.maximum(np.minimum(g, m), (r + b) // 2)
            r, g, b = np.where(am, v, r), np.where(am, v, np.minimum(g, m)), np.where(am, v, b)
        else:
            g = np.minimum(g, m)
    out = np.dstack([r, g, b, a]).clip(0, 255).astype(np.uint8)
    out[out[..., 3] == 0] = 0
    return out


def thu_nho(canvas, w, h):
    """canvas: RGBA float (cỡ gốc). Thu về (w, h) bằng trung bình vùng có nhân alpha, rồi cắt alpha 50%."""
    a = canvas[..., 3:4] / 255.0
    pre = np.dstack([canvas[..., :3] * a, a[..., 0] * 255.0])
    im = Image.fromarray(np.clip(pre, 0, 255).astype(np.uint8), 'RGBA')
    # Image.BOX trên dữ liệu đã nhân alpha
    sm = np.asarray(im.resize((w, h), Image.BOX)).astype(np.float32)
    al = sm[..., 3] / 255.0
    rgb = np.where(al[..., None] > 0, sm[..., :3] / np.maximum(al[..., None], 1e-6), 0)
    alpha = np.where(al >= 0.45, 255, 0)
    return np.dstack([np.clip(rgb, 0, 255), alpha]).astype(np.uint8)


def dung_tam(rgba, n, s, canh, pad=1, chieu_rong=None, chieu_cao=None):
    """Đặt n khung vào các ô cùng cỡ, thu nhỏ theo s (điểm ảnh gốc cho 1 điểm ảnh game).
    canh: 'trai' | 'giua' | 'phai'. Trả về (dải ảnh PIL, khung_rong, khung_cao, ô [(x0,x1)], y0 chung, oy)."""
    ds = cat_khung(rgba, n)
    m = rgba[..., 3] > 128
    hang = np.where(m.any(1))[0]
    y0, y1 = hang[0], hang[-1] + 1
    bb = []
    for a, b in ds:
        cs = np.where(m[:, a:b].any(0))[0]
        bb.append((a + cs[0], a + cs[-1] + 1))
    wmax = max(b - a for a, b in bb)
    fw = chieu_rong or int(np.ceil(wmax / s)) + 2 * pad
    fh = chieu_cao or int(np.ceil((y1 - y0) / s)) + 2 * pad
    cw, ch = int(round(fw * s)), int(round(fh * s))
    oy = int(round((ch - (y1 - y0)) / 2))
    khung = []
    for a, b in bb:
        cv = np.zeros((ch, cw, 4), np.float32)
        w = b - a
        if canh == 'trai':
            ox = int(round(pad * s))
        elif canh == 'phai':
            ox = cw - int(round(pad * s)) - w
        else:
            ox = (cw - w) // 2
        sx0, dx0 = max(0, -ox), max(0, ox)
        ww = min(w - sx0, cw - dx0)
        hh = min(y1 - y0, ch - oy)
        cv[oy:oy + hh, dx0:dx0 + ww] = rgba[y0:y0 + hh, a + sx0:a + sx0 + ww]
        khung.append(thu_nho(cv, fw * NET, fh * NET))
    return khung, fw, fh, bb, (y0, y1), oy


def ghep(khung):
    return Image.fromarray(np.concatenate(khung, axis=1), 'RGBA')


def data_url(im):
    bio = io.BytesIO()
    im.save(bio, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(bio.getvalue()).decode()


def ghi_hu(ma, ten, khung, fw, fh, goc, giay, lap, xoay, tron, co=1):
    d = {
        'loai': 'linh-khi-sprite', 'phien_ban': 1, 'doi_tuong': 'hieu-ung', 'ma': ma, 'ten': ten,
        'tam': data_url(ghep(khung)), 'net': NET, 'khung_rong': fw, 'khung_cao': fh,
        'goc': [round(goc[0], 2), round(goc[1], 2)], 'so': len(khung), 'giay': giay, 'lap': lap, 'xoay': xoay, 'co': co, 'tron': tron,
    }
    with open(os.path.join(CUSTOM, ma + '.sprite.json'), 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, separators=(',', ':'))
    return d


def bo_bang(rgba):
    """D3 (phi tiêu Băng) -> phi tiêu thường: bỏ phần băng xanh (điểm có màu đậm), chỉ giữ thân thép xám + vệt trắng."""
    rgb, a = rgba[..., :3], rgba[..., 3]
    mx, mn = rgb.max(-1), rgb.min(-1)
    sat = mx - mn
    xanh = (rgb[..., 2] > rgb[..., 0] + 25)
    # màu đậm xanh (băng, tinh thể, viền băng) bỏ; điểm sáng hơi xanh (vệt trắng) chuyển trắng-xám
    bo = xanh & ((sat > 70) | (mx < 200))
    out = rgba.copy()
    out[..., 3] = np.where(bo, 0, a)
    nhat = xanh & ~bo
    xam = rgb.mean(-1)
    for i in range(3):
        out[..., i] = np.where(nhat, xam, rgb[..., i])
    out = lam_sach(out, vun=400)
    # chỉ giữ mảng lớn nhất (thân phi tiêu) + mảnh dài sát nó phía sau (vệt gió)
    return out


CHUNG = []  # (tên, khung, fw, fh) cho ảnh xem trước


def lam_hieu_ung(tep, ma, ten, n, s, canh, goc_fn, giay, lap, xoay, tron, doc_he=False, sua=None, vun=40, trang=False, **kw):
    rgba = lam_sach(xoa_nen(doc(tep)), vun)
    if sua:
        rgba = sua(rgba)
    khung, fw, fh, bb, yy, oy = dung_tam(rgba, n, s, canh, **kw)
    khung = [khu_xanh(k, doc_he, trang) for k in khung]
    goc = goc_fn(fw, fh, s, bb, yy, oy)
    ghi_hu(ma, ten, khung, fw, fh, goc, giay, lap, xoay, tron)
    CHUNG.append((ma, khung, fw, fh, goc))
    print('%-22s %d khung %dx%d goc %s (s=%.1f)' % (ma, n, fw, fh, goc, s))


def main():
    giua_doc = lambda fw, fh, s, bb, yy, oy: (fw / 2, fh / 2)
    # A: vệt ném (4 khung). Mép trái = tay. Ô 32 rộng như hu-ban-cung cũ.
    for tep, duoi, he in [('A-nem.png', '', ''), ('A1-nem-lua.png', '-fire', ' · Hệ Lửa'), ('A2-nem-doc.png', '-poison', ' · Hệ Độc'), ('A3-nem-bang.png', '-ice', ' · Hệ Băng')]:
        lam_hieu_ung(tep, 'hu-ban-cung' + duoi, 'Ném phi tiêu (vệt ném)' + he, 4, 21.0, 'trai',
                     lambda fw, fh, s, bb, yy, oy: (1, fh / 2), 0.16, False, True, 'cong', doc_he=(duoi == '-poison'), trang=(duoi == ''), chieu_rong=32)
    # D: phi tiêu bay xoay (4 khung, lặp). Phi tiêu ~12 điểm ảnh, canh phải; điểm neo = tâm phi tiêu.
    neo_d = lambda fw, fh, s, bb, yy, oy: (fw - 1 - 160.0 / s, fh / 2)
    for tep, duoi, he in [('D1-bay-lua.png', '-fire', 'Lửa'), ('D2-bay-doc.png', '-poison', 'Độc'), ('D3-bay-bang.png', '-ice', 'Băng')]:
        lam_hieu_ung(tep, 'hu-dan-ten' + duoi, 'Phi tiêu %s bay' % he, 4, 27.0, 'phai', neo_d, 0.3, True, True, 'thuong', doc_he=(duoi == '-poison'))
    # D thường (TẠM): từ D3, bỏ băng xanh.
    lam_hieu_ung('D3-bay-bang.png', 'hu-dan-ten', 'Phi tiêu bay (tạm, từ bản Băng bỏ băng)', 4, 27.0, 'phai', neo_d, 0.3, True, True, 'thuong', sua=bo_bang, trang=True)
    # B: trúng phi tiêu (4 khung), ô 32x32, tâm giữa.
    lam_hieu_ung('B-trung.png', 'hu-trung-phi-tieu', 'Trúng phi tiêu', 4, 13.5, 'giua', giua_doc, 0.2, False, False, 'cong', trang=True, chieu_rong=32, chieu_cao=32)
    # C: mưa phi tiêu (6 khung). Vòng ở khung 1 rộng 80 điểm ảnh (= đường kính vùng mưa r 40). Neo = tâm vòng.
    rgba = lam_sach(xoa_nen(doc('C-mua.png')))
    ds = cat_khung(rgba, 6)
    m = rgba[..., 3] > 128
    a, b = ds[0]
    cs = np.where(m[:, a:b].any(0))[0]
    rs = np.where(m[:, a:b].any(1))[0]
    s_c = (cs[-1] - cs[0] + 1) / 80.0
    tam_y = (rs[0] + rs[-1]) / 2.0
    neo_c = lambda fw, fh, s, bb, yy, oy: (fw / 2, (tam_y - yy[0] + oy) / s)
    lam_hieu_ung('C-mua.png', 'hu-mua-phi-tieu', 'Mưa phi tiêu', 6, s_c, 'giua', neo_c, 0.95, False, False, 'thuong', pad=1, trang=True)
    # E: tích lực + ném chùm (5 khung), mép trái ở tay.
    lam_hieu_ung('E-chum.png', 'hu-phi-tieu-chum', 'Ném chùm phi tiêu (tích lực + bung)', 5, 12.0, 'trai',
                 lambda fw, fh, s, bb, yy, oy: (1, fh / 2), 0.3, False, True, 'cong', trang=True)
    # F: túi phi tiêu (trang phục, 14x18, net 2)
    rgba = lam_sach(xoa_nen(doc('F-tui.png')), 200)
    m = rgba[..., 3] > 128
    ys, xs = np.where(m)
    crop = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    h, w = crop.shape[:2]
    s = max(w / 14.0, h / 18.0)
    cw, ch = int(round(14 * s)), int(round(18 * s))
    cv = np.zeros((ch, cw, 4), np.float32)
    ox, oy = (cw - w) // 2, (ch - h) // 2
    cv[oy:oy + h, ox:ox + w] = crop
    anh = khu_xanh(thu_nho(cv, 14 * NET, 18 * NET), False)
    p = os.path.join(CUSTOM, 'tp-backs-ong_ten.sprite.json')
    d = json.load(open(p, encoding='utf-8'))
    d['ten'] = 'Túi phi tiêu'
    d['anh'] = data_url(Image.fromarray(anh, 'RGBA'))
    with open(p, 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, separators=(',', ':'))
    CHUNG.append(('tp-backs-ong_ten', [anh], 14, 18, None))
    print('tp-backs-ong_ten       túi phi tiêu 14x18')
    xem_truoc()


def xem_truoc():
    """Mọi khung đã cắt, phóng 4 lần (theo điểm ảnh game × net → mỗi điểm ảnh net = 2 điểm), nền tối, chấm đỏ = điểm neo."""
    from PIL import ImageDraw
    Z = 4
    hang = []
    for ma, khung, fw, fh, goc in CHUNG:
        w, h = fw * NET * Z, fh * NET * Z
        row = Image.new('RGBA', (len(khung) * (w + 8) + 200, h + 8), (24, 26, 34, 255))
        dr = ImageDraw.Draw(row)
        dr.text((4, 4), ma, fill=(230, 230, 230, 255))
        for i, k in enumerate(khung):
            x = 200 + i * (w + 8)
            dr.rectangle([x - 1, 3, x + w, 4 + h], outline=(70, 74, 90, 255))
            im = Image.fromarray(k, 'RGBA').resize((w, h), Image.NEAREST)
            row.alpha_composite(im, (x, 4))
            if goc:
                gx, gy = x + goc[0] * NET * Z, 4 + goc[1] * NET * Z
                dr.ellipse([gx - 3, gy - 3, gx + 3, gy + 3], outline=(255, 60, 60, 255))
        hang.append(row)
    W = max(r.width for r in hang)
    H = sum(r.height + 4 for r in hang)
    out = Image.new('RGBA', (W, H), (16, 18, 24, 255))
    y = 0
    for r in hang:
        out.alpha_composite(r, (0, y))
        y += r.height + 4
    out.convert('RGB').save(os.path.join(DIR, 'xem-truoc.png'), optimize=True)
    print('xem-truoc.png', out.size)


if __name__ == '__main__':
    main()
