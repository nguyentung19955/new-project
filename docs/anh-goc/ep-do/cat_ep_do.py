#!/usr/bin/env python3
"""Cắt ảnh ÉP ĐỒ + ẢI NGÀY (docs/anh-goc/ep-do/E1..E8, nền #00FF00) thành game/art/custom/*.sprite.json — đợt 6
(docs/review/ke-hoach-cai-thien/he-thong-moi/YEU-CAU-6-EP-DO-AI-NGAY.md).

Chạy:  python3 docs/anh-goc/ep-do/cat_ep_do.py      (từ thư mục gốc repo; cần Pillow, numpy, scipy)

Dùng lại các bước của docs/anh-goc/zed/hieu-ung/cat_phi_tieu.py (xoá nền alpha mềm, bỏ mảnh vụn, cắt khung theo dải cột trống,
thu nhỏ trung bình vùng về điểm ảnh game × net 2, khử viền xanh).

  E1 -> gd-da-nang-bac        (ảnh giao diện 24×24: biểu tượng đá nâng bậc)
  E2 -> gd-bua-giu-bac        (24×24: bùa giữ bậc)
  E3 -> gd-o-ep-0 .. gd-o-ep-6 (7 khung ô vũ khí theo bậc ép, 30×30 mỗi khung; js/ep_do.js vẽ icon vũ khí lên trên)
  E4 -> hu-ep-thanh-cong      (hiệu ứng 6 khung; js/ep_do.js phát trên bảng ép bằng G.fxAnh)
  E5 -> hu-ep-that-bai        (5 khung, giữ bệ lò rèn đá ở dưới)
  E6 -> hu-ep-tut-bac         (6 khung; mỗi khung có VIỀN Ô VUÔNG ĐEN trong ảnh gốc → bỏ viền trước khi cắt)
  E7 -> gd-cong-ai-ngay       (cổng ải ngày, cao 96)
  E8 -> gd-ai-ngay-da, gd-ai-ngay-mai, gd-ai-ngay-vang (3 biểu tượng ải ngày, 32×32)
Ghi docs/anh-goc/ep-do/xem-truoc.png (mọi hình, phóng to, nền tối).
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(DIR, '..', 'zed', 'hieu-ung'))
import cat_phi_tieu as C  # noqa: E402

XEM = os.path.join(DIR, 'xem-truoc.png')
CHUNG = []


def doc(ten):
    return np.asarray(Image.open(os.path.join(DIR, ten)).convert('RGB')).astype(np.float32)


def bo_vien_den(rgb):
    """E6: tô các đường kẻ ô đen (cột / hàng tối dài) thành màu nền trước khi xoá nền."""
    d = rgb.max(-1) < 70
    out = rgb.copy()
    nen = np.array([0, 255, 0], np.float32)
    cot = np.where(d.sum(0) > 300)[0]
    hang = np.where(d.sum(1) > 1500)[0]
    for x in cot:
        out[:, max(0, x - 3):x + 4] = nen
    for y in hang:
        out[max(0, y - 3):y + 4, :] = nen
    return out


def anh_tinh(rgba, w, h, pad=1, doc_he=False):
    """Một hình tĩnh: cắt khung bao, canh giữa vào ô w×h (chừa pad điểm ảnh game), thu nhỏ về (w, h) × net."""
    m = rgba[..., 3] > 128
    ys, xs = np.where(m)
    crop = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    ch, cw = crop.shape[:2]
    s = max(cw / float(w - 2 * pad), ch / float(h - 2 * pad))
    W, H = int(round(w * s)), int(round(h * s))
    cv = np.zeros((H, W, 4), np.float32)
    ox, oy = (W - cw) // 2, (H - ch) // 2
    cv[oy:oy + ch, ox:ox + cw] = crop
    return C.khu_xanh(C.thu_nho(cv, w * C.NET, h * C.NET), doc_he)  # doc_he: giữ xanh lá thật (khung Bậc Xanh lục)


def ghi_gd(ma, ten, px):
    d = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'ma': ma, 'ten': ten, 'doi_tuong': 'giao-dien', 'rong': px.shape[1] // C.NET,
         'cao': px.shape[0] // C.NET, 'net': C.NET, 'anh': C.data_url(Image.fromarray(px, 'RGBA'))}
    with open(os.path.join(C.CUSTOM, ma + '.sprite.json'), 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, separators=(',', ':'))
    CHUNG.append((ma, [px], px.shape[1] // C.NET, px.shape[0] // C.NET, None))
    print('%-20s gd %dx%d' % (ma, px.shape[1] // C.NET, px.shape[0] // C.NET))


def tinh(tep, ma, ten, w, h, vun=30):
    rgba = C.lam_sach(C.xoa_nen(doc(tep)), vun)
    ghi_gd(ma, ten, anh_tinh(rgba, w, h))


def nhieu(tep, ds, w, h, vun=60, xanh=()):
    """Một hàng nhiều hình rời (E3 khung ô, E8 biểu tượng): mỗi hình thành một tệp gd riêng."""
    rgba = C.lam_sach(C.xoa_nen(doc(tep)), vun)
    cot = C.cat_khung(rgba, len(ds))
    for k, ((a, b), (ma, ten)) in enumerate(zip(cot, ds)):
        part = np.zeros_like(rgba)
        part[:, a:b] = rgba[:, a:b]
        ghi_gd(ma, ten, anh_tinh(part, w, h, doc_he=k in xanh))


def hieu_ung(rgb, ma, ten, n, cao, neo, giay, vun=40):
    rgba = C.lam_sach(C.xoa_nen(rgb), vun)
    m = rgba[..., 3] > 128
    hang = np.where(m.any(1))[0]
    s = (hang[-1] + 1 - hang[0]) / float(cao - 2)
    khung, fw, fh, _, _, _ = C.dung_tam(rgba, n, s, 'giua')
    khung = [C.khu_xanh(k, False) for k in khung]
    goc = (fw * neo[0], fh * neo[1])
    C.ghi_hu(ma, ten, khung, fw, fh, goc, giay, False, False, 'thuong')
    CHUNG.append((ma, khung, fw, fh, goc))
    print('%-20s %d khung %dx%d' % (ma, n, fw, fh))


def main():
    tinh('E1-da-nang-bac.png', 'gd-da-nang-bac', 'Đá nâng bậc (ép đồ)', 24, 24)
    tinh('E2-bua-giu-bac.png', 'gd-bua-giu-bac', 'Bùa giữ bậc (ép đồ)', 24, 24)
    TEN = ['Trắng', 'Xanh lam', 'Xanh lục', 'Tím', 'Vàng', 'Đỏ', 'Rực lửa']
    nhieu('E3-khung-o-7-bac.png', [('gd-o-ep-%d' % i, 'Ô vũ khí · Bậc %s' % t) for i, t in enumerate(TEN)], 30, 30, xanh=(2,))
    # neo (0.5, 0.86): đáy cột sáng / bệ lò / đống mảnh — đặt vào giữa dưới ô vũ khí
    hieu_ung(doc('E4-hu-ep-thanh-cong.png'), 'hu-ep-thanh-cong', 'Ép đồ thành công (cột sáng vàng)', 6, 48, (0.5, 0.86), 0.9)
    hieu_ung(doc('E5-hu-ep-that-bai.png'), 'hu-ep-that-bai', 'Ép đồ thất bại (khói xám trên bệ lò)', 5, 48, (0.5, 0.86), 0.9)
    hieu_ung(bo_vien_den(doc('E6-hu-ep-tut-bac.png')), 'hu-ep-tut-bac', 'Tụt bậc (ngọc vỡ)', 6, 40, (0.5, 0.6), 0.9, vun=12)
    tinh('E7-cong-ai-ngay.png', 'gd-cong-ai-ngay', 'Cổng ải ngày', 92, 96, vun=60)
    nhieu('E8-bieu-tuong-ai-ngay.png', [('gd-ai-ngay-da', 'Ải Đá Bậc'), ('gd-ai-ngay-mai', 'Ải Đá Mài'), ('gd-ai-ngay-vang', 'Ải Vàng')], 32, 32)
    xem()


def xem():
    hang = []
    for ma, khung, fw, fh, goc in CHUNG:
        Z = 4 if fh <= 50 else 2
        w, h = fw * C.NET * Z // 2, fh * C.NET * Z // 2
        row = Image.new('RGBA', (180 + len(khung) * (w + 8), h + 8), (24, 26, 34, 255))
        dr = ImageDraw.Draw(row)
        dr.text((4, 4), ma, fill=(230, 230, 230, 255))
        dr.text((4, 18), '%dx%d x%d' % (fw, fh, len(khung)), fill=(150, 150, 160, 255))
        for i, k in enumerate(khung):
            x = 180 + i * (w + 8)
            im = Image.fromarray(k, 'RGBA').resize((w, h), Image.NEAREST)
            row.alpha_composite(im, (x, 4))
            if goc:
                gx, gy = x + goc[0] * Z, 4 + goc[1] * Z
                dr.ellipse([gx - 3, gy - 3, gx + 3, gy + 3], outline=(255, 60, 60, 255))
        hang.append(row)
    W = max(r.width for r in hang)
    H = sum(r.height + 4 for r in hang)
    out = Image.new('RGBA', (W, H), (16, 18, 24, 255))
    y = 0
    for r in hang:
        out.alpha_composite(r, (0, y))
        y += r.height + 4
    out.convert('RGB').save(XEM, optimize=True)
    print('xem-truoc.png', out.size)


if __name__ == '__main__':
    main()
