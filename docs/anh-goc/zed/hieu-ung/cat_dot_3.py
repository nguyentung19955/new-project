#!/usr/bin/env python3
"""Cắt ảnh hiệu ứng ĐỢT 3 (docs/anh-goc/zed/hieu-ung/dot-3/*.png, nền #00FF00, 1 hàng khung) thành game/art/custom/*.sprite.json.

Chạy:  python3 docs/anh-goc/zed/hieu-ung/cat_dot_3.py      (từ thư mục gốc repo; cần Pillow, numpy, scipy)

Dùng lại các bước của cat_phi_tieu.py (xoá nền alpha mềm, bỏ mảnh vụn, cắt khung THEO ĐƯỜNG VIỀN = dải cột trống dài nhất,
thu nhỏ trung bình vùng về điểm ảnh game × net 2, khử viền xanh). Riêng ở đây:
  - Ảnh trắng (K2, K7, K11, K12): điểm ám xanh đổi sang xám (trang=True) để game tự nhuộm theo hệ.
  - Ảnh độc / xanh lá thật (K6, K9, S2, S7): giữ màu, chỉ bỏ điểm xanh lá thuần ở mép (doc_he=True).
  - Canh khung: 'giua' / 'trai' / 'phai' như cũ, thêm 'o' = giữ vị trí ngang của khung trong ô đều của tấm gốc
    (tấm rộng chia đều n ô) cho hiệu ứng mà hình dời chỗ giữa các khung (chớp ở đầu mũi chạy dần sang phải...).
  - Cỡ: đặt theo bề ngang lớn nhất (rong=) hoặc bề cao lớn nhất (cao=) tính bằng điểm ảnh game.
  - H, I: nút Đánh / Đặc biệt khi cầm phi tiêu (24×24, net 2), giữ viền đen, bỏ nền.
Ghi docs/review/ke-hoach-cai-thien/hieu-ung-dot-3/xem-truoc.png (mọi khung, phóng to, nền tối, chấm đỏ = điểm neo, ngang ≤ 4000).
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, DIR)
import cat_phi_tieu as C  # noqa: E402

D3 = os.path.join(DIR, 'dot-3')
XEM = os.path.join(C.ROOT, 'docs', 'review', 'ke-hoach-cai-thien', 'hieu-ung-dot-3', 'xem-truoc.png')
CHUNG = []


def doc(ten):
    return np.asarray(Image.open(os.path.join(D3, ten)).convert('RGB')).astype(np.float32)


def lam(tep, ma, ten, n, canh, neo, giay, lap, xoay, tron, rong=None, cao=None, doc_he=False, trang=False, vun=40, pad=1):
    """neo: (nx, ny) theo phần của khung (0..1) hoặc hàm (fw, fh) -> (x, y)."""
    rgba = C.lam_sach(C.xoa_nen(doc(tep)), vun)
    ds = C.cat_khung(rgba, n)
    m = rgba[..., 3] > 128
    hang = np.where(m.any(1))[0]
    y0, y1 = hang[0], hang[-1] + 1
    bb = []
    for a, b in ds:
        cs = np.where(m[:, a:b].any(0))[0]
        bb.append((a + cs[0], a + cs[-1] + 1))
    o_rong = rgba.shape[1] / float(n)
    if canh == 'o':
        # bề ngang cần = phần thật sự dùng trong ô (lệch trái nhỏ nhất .. lệch phải lớn nhất)
        lo = min(a - int(i * o_rong) for i, (a, b) in enumerate(bb))
        hi = max(b - int(i * o_rong) for i, (a, b) in enumerate(bb))
        wmax = hi - lo
    else:
        wmax = max(b - a for a, b in bb)
    if rong:
        s = wmax / float(rong - 2 * pad)
    else:
        s = (y1 - y0) / float(cao - 2 * pad)
    fw = int(np.ceil(wmax / s)) + 2 * pad
    fh = int(np.ceil((y1 - y0) / s)) + 2 * pad
    cw, ch = int(round(fw * s)), int(round(fh * s))
    oy = int(round((ch - (y1 - y0)) / 2))
    khung = []
    for i, (a, b) in enumerate(bb):
        cv = np.zeros((ch, cw, 4), np.float32)
        w = b - a
        if canh == 'trai':
            ox = int(round(pad * s))
        elif canh == 'phai':
            ox = cw - int(round(pad * s)) - w
        elif canh == 'o':
            ox = int(round(pad * s)) + (a - int(i * o_rong)) - lo
        else:
            ox = (cw - w) // 2
        sx0, dx0 = max(0, -ox), max(0, ox)
        ww = min(w - sx0, cw - dx0)
        hh = min(y1 - y0, ch - oy)
        cv[oy:oy + hh, dx0:dx0 + ww] = rgba[y0:y0 + hh, a + sx0:a + sx0 + ww]
        k = C.thu_nho(cv, fw * C.NET, fh * C.NET)
        khung.append(C.khu_xanh(k, doc_he, trang))
    goc = neo(fw, fh) if callable(neo) else (fw * neo[0], fh * neo[1])
    goc = (float(goc[0]), float(goc[1]))
    C.ghi_hu(ma, ten, khung, fw, fh, goc, giay, lap, xoay, tron)
    CHUNG.append((ma, khung, fw, fh, goc))
    print('%-18s %d khung %3dx%-3d goc (%.1f, %.1f)  s=%.1f' % (ma, n, fw, fh, goc[0], goc[1], s))


def nut(tep, ma, ten):
    """Biểu tượng nút 24×24 (net 2): bỏ nền xanh, giữ viền đen, canh giữa, chừa 1 điểm ảnh mép."""
    rgba = C.lam_sach(C.xoa_nen(doc(tep)), 200)
    m = rgba[..., 3] > 128
    ys, xs = np.where(m)
    crop = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    h, w = crop.shape[:2]
    s = max(w, h) / 22.0
    cw = ch = int(round(24 * s))
    cv = np.zeros((ch, cw, 4), np.float32)
    ox, oy = (cw - w) // 2, (ch - h) // 2
    cv[oy:oy + h, ox:ox + w] = crop
    anh = C.khu_xanh(C.thu_nho(cv, 24 * C.NET, 24 * C.NET), False, True)
    p = os.path.join(C.CUSTOM, ma + '.sprite.json')
    d = json.load(open(p, encoding='utf-8'))
    d['anh'] = C.data_url(Image.fromarray(anh, 'RGBA'))
    d['ten'] = ten
    with open(p, 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, separators=(',', ':'))
    CHUNG.append((ma, [anh], 24, 24, None))
    print('%-18s nút 24x24' % ma)


def main():
    chan = lambda fw, fh: (fw / 2.0, fh - 1.5)       # giữa đáy (chân / mặt đất)
    giua = (0.5, 0.5)
    # ---- K: thay chỗ đang vẽ bằng code ----
    lam('K1-lon.png', 'hu-lon', 'Lộn (bụi + vệt gió)', 5, 'o', lambda fw, fh: (7.0, fh - 2.0), 0.32, False, False, 'thuong', rong=40)
    lam('K2-xoc-toi.png', 'hu-xoc-toi', 'Xốc tới (vệt đâm, trắng: game nhuộm hệ)', 5, 'o', lambda fw, fh: (1.0, fh / 2.0), 0.3, False, True, 'cong', rong=52, trang=True)
    lam('K3-song-dat.png', 'hu-song-dat', 'Sóng chấn búa (gờ đất lăn)', 4, 'giua', lambda fw, fh: (fw * 0.55, fh * 0.78), 0.32, True, True, 'thuong', rong=30)
    lam('K4-nut-dat.png', 'hu-nut-dat', 'Nứt đất Địa Chấn (một đoạn)', 6, 'giua', lambda fw, fh: (fw / 2.0, fh * 0.8), 0.9, False, True, 'thuong', rong=26)
    lam('K5-gai-bang.png', 'hu-gai-bang', 'Gai băng mọc (một cụm)', 6, 'giua', chan, 0.8, False, False, 'thuong', rong=22)
    lam('K6-doc-toe.png', 'hu-doc-toe', 'Độc toé', 6, 'giua', chan, 0.6, False, False, 'thuong', rong=30, doc_he=True)
    lam('K7-doi-vk.png', 'hu-doi-vk', 'Đổi vũ khí (vòng sáng, trắng: game nhuộm hệ)', 5, 'giua', giua, 0.3, False, False, 'cong', rong=26, trang=True)
    lam('K8-bam-lua.png', 'hu-bam-lua', 'Đang cháy trên người', 4, 'giua', chan, 0.45, True, False, 'thuong', cao=30)
    lam('K9-bam-doc.png', 'hu-bam-doc', 'Đang trúng độc trên người', 4, 'giua', chan, 0.6, True, False, 'thuong', cao=30, doc_he=True)
    lam('K10-bam-bang.png', 'hu-bam-bang', 'Đang đóng băng trên người', 4, 'giua', chan, 0.7, True, False, 'thuong', cao=30)
    lam('K11-va-cham.png', 'hu-va-cham', 'Va chạm nhỏ (trắng: game nhuộm hệ)', 4, 'o', lambda fw, fh: (fw * 0.4, fh / 2.0), 0.2, False, True, 'cong', rong=26, trang=True)
    lam('K12-tich-chuong.png', 'hu-tich-chuong', 'Tích chưởng (cầu trong tay, trắng: game nhuộm hệ)', 6, 'giua', giua, 0.6, True, False, 'cong', rong=22, trang=True)
    # ---- S: skill bộ (js/bo_skill.js) ----
    lam('S1-khien-nuoc.png', 'hu-khien-nuoc', 'Khiên nước (1–4 lặp, 5–6 vỡ)', 6, 'giua', giua, 0.8, True, False, 'thuong', cao=34)
    lam('S2-day-leo.png', 'hu-day-leo', 'Dây leo trói chân', 6, 'giua', chan, 1.5, False, False, 'thuong', rong=30, doc_he=True)
    lam('S3-song-doi.png', 'hu-song-doi', 'Sóng dội (vòng sóng)', 5, 'giua', giua, 0.35, False, False, 'thuong', rong=64)
    lam('S4-phan-don.png', 'hu-phan-don', 'Phản đòn (khiên lóe, tia sang phải)', 4, 'trai', lambda fw, fh: (8.0, fh / 2.0), 0.36, False, False, 'thuong', rong=48)
    lam('S5-khi-the.png', 'hu-khi-the', 'Khí thế (hào quang lửa quanh Zed)', 6, 'giua', lambda fw, fh: (fw / 2.0, fh - 3.0), 0.6, True, False, 'thuong', rong=34)
    lam('S6-phan-than.png', 'hu-phan-than', 'Bóng phân thân tan (khói)', 5, 'giua', chan, 0.45, False, False, 'thuong', cao=30)
    lam('S7-nhua-rung.png', 'hu-nhua-rung', 'Nhựa rừng (hồi máu dưới chân)', 4, 'giua', lambda fw, fh: (fw / 2.0, fh - 3.0), 0.7, True, False, 'thuong', rong=28, doc_he=True)
    lam('S8-am-sat.png', 'hu-am-sat', 'Ám sát (vệt chém chéo)', 4, 'giua', giua, 0.3, False, False, 'thuong', rong=40)
    # ---- H, I: nút khi cầm phi tiêu ----
    nut('H-nut-danh-phi-tieu.png', 'gd-nut-danh-bow', 'Đánh · Phi tiêu')
    nut('I-nut-mua-phi-tieu.png', 'gd-nut-dac-biet-bow', 'Đặc biệt · Mưa phi tiêu')
    xem()


def xem():
    hang = []
    for ma, khung, fw, fh, goc in CHUNG:
        Z = max(2, min(5, int(3600 // max(1, (len(khung) * (fw * C.NET + 4) + 60)))))
        Z = min(Z, max(1, 300 // (fh * C.NET)))
        w, h = fw * C.NET * Z, fh * C.NET * Z
        row = Image.new('RGBA', (min(4000, 170 + len(khung) * (w + 8)), h + 8), (24, 26, 34, 255))
        dr = ImageDraw.Draw(row)
        dr.text((4, 4), ma, fill=(230, 230, 230, 255))
        dr.text((4, 18), '%dx%d x%d' % (fw, fh, len(khung)), fill=(150, 150, 160, 255))
        for i, k in enumerate(khung):
            x = 170 + i * (w + 8)
            dr.rectangle([x - 1, 3, x + w, 4 + h], outline=(70, 74, 90, 255))
            im = Image.fromarray(k, 'RGBA').resize((w, h), Image.NEAREST)
            row.alpha_composite(im, (x, 4))
            if goc:
                gx, gy = x + goc[0] * C.NET * Z, 4 + goc[1] * C.NET * Z
                dr.ellipse([gx - 3, gy - 3, gx + 3, gy + 3], outline=(255, 60, 60, 255))
        hang.append(row)
    W = min(4000, max(r.width for r in hang))
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
