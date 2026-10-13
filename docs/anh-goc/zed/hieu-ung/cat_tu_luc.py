#!/usr/bin/env python3
"""Cắt ảnh hiệu ứng TỤ LỰC (G-tu-luc.png, nền xanh lá #00FF00, 1 hàng 6 khung) thành game/art/custom/hu-tu-luc.sprite.json.

Chạy:  python3 docs/anh-goc/zed/hieu-ung/cat_tu_luc.py      (từ thư mục gốc repo; cần Pillow, numpy, scipy)

Dùng lại các bước của cat_phi_tieu.py: xoá nền (alpha mềm), bỏ mảnh vụn, cắt khung THEO ĐƯỜNG VIỀN (dải cột trống dài nhất),
thu nhỏ trung bình vùng về điểm ảnh game × net 2, khử viền xanh (điểm ám xanh đổi sang xám vì ảnh là trắng-xám, game tự nhuộm).
Riêng ở đây:
  - Cỡ: vòng dẹt ở khung 1 rộng ≈ 44 điểm ảnh game (cỡ 1).
  - Mỗi khung canh ngang theo TÂM VÒNG (giữa mép trái/phải của dải hàng chứa vòng), không theo khung bao (tia bốc lên lệch bên).
  - Điểm neo (goc) = tâm vòng dưới chân: giữa bề ngang; hàng = tâm của dải vòng (đo ở khung 1).
Ghi thêm docs/review/ke-hoach-cai-thien/hu-tu-luc/xem-tu-luc.png: 6 khung × 4 màu hệ (không hệ, Lửa, Độc, Băng), phóng to, nền tối,
nhuộm đúng cách game nhuộm (js/fx_he.js: nhân màu hệ rồi cộng lại một phần ảnh gốc cho lõi còn trắng).
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, DIR)
import cat_phi_tieu as C  # noqa: E402

ROOT = C.ROOT
XEM = os.path.join(ROOT, 'docs', 'review', 'ke-hoach-cai-thien', 'hu-tu-luc', 'xem-tu-luc.png')
N = 6
VONG = 44.0  # đường kính vòng (điểm ảnh game) ở cỡ 1
PAD = 1


def dai_vong(m):
    """m: mặt nạ một khung. Dải hàng của vòng dẹt = phần dưới cùng: từ hàng cuối đi lên tới khi bề ngang tụt dưới 55% bề ngang lớn nhất
    của nửa dưới. Trả về (hàng trên, hàng dưới, x trái, x phải) của vòng."""
    hang = np.where(m.any(1))[0]
    y1 = hang[-1]
    rong = np.zeros(m.shape[0])
    for y in hang:
        xs = np.where(m[y])[0]
        rong[y] = xs[-1] - xs[0] + 1
    giua = (hang[0] + y1) // 2
    wmax = rong[giua:y1 + 1].max()
    # vòng: các hàng phía dưới có bề ngang ≥ 55% wmax; lấy dải liền từ hàng có bề ngang lớn nhất
    ymax = giua + int(np.argmax(rong[giua:y1 + 1]))
    y0 = ymax
    # vòng dẹt: cao ≈ 0,4 bề ngang; tìm mép trên vòng = ymax - (y1 - ymax) (đối xứng qua hàng rộng nhất)
    y0 = max(hang[0], ymax - (y1 - ymax))
    xs = np.where(m[y0:y1 + 1].any(0))[0]
    return y0, y1, xs[0], xs[-1] + 1, ymax


def main():
    rgba = C.lam_sach(C.xoa_nen(C.doc('G-tu-luc.png')), 40)
    ds = C.cat_khung(rgba, N)
    m = rgba[..., 3] > 128
    hang = np.where(m.any(1))[0]
    Y0, Y1 = hang[0], hang[-1] + 1
    # khung 1: đo vòng
    a, b = ds[0]
    vy0, vy1, vx0, vx1, vymax = dai_vong(m[:, a:b])
    s = (vx1 - vx0) / VONG
    tam_y = (vy0 + vy1) / 2.0
    print('khung 1: vòng rộng %d điểm gốc, dải hàng %d..%d, tâm hàng %.1f -> s = %.2f' % (vx1 - vx0, vy0, vy1, tam_y, s))
    # tâm ngang từng khung: giữa mép trái/phải trong dải hàng của vòng (dùng chung dải hàng của khung 1, nới 15%)
    nh = int((vy1 - vy0) * 0.15)
    tam_x = []
    lech = 0
    for a, b in ds:
        mm = m[max(Y0, vy0 - nh):vy1 + nh + 1, a:b]
        xs = np.where(mm.any(0))[0]
        cx = a + (xs[0] + xs[-1] + 1) / 2.0
        tam_x.append(cx)
        cs = np.where(m[:, a:b].any(0))[0]
        lech = max(lech, cx - (a + cs[0]), (a + cs[-1] + 1) - cx)
    fw = int(np.ceil(2 * lech / s)) + 2 * PAD
    fw += fw % 2
    fh = int(np.ceil((Y1 - Y0) / s)) + 2 * PAD
    cw, ch = int(round(fw * s)), int(round(fh * s))
    oy = int(round((ch - (Y1 - Y0)) / 2))
    khung = []
    for (a, b), cx in zip(ds, tam_x):
        cv = np.zeros((ch, cw, 4), np.float32)
        ox = int(round(cw / 2.0 - (cx - a)))  # cột a của tấm gốc nằm ở ox trong ô
        sx0, dx0 = max(0, -ox), max(0, ox)
        ww = min((b - a) - sx0, cw - dx0)
        hh = min(Y1 - Y0, ch - oy)
        cv[oy:oy + hh, dx0:dx0 + ww] = rgba[Y0:Y0 + hh, a + sx0:a + sx0 + ww]
        k = C.thu_nho(cv, fw * C.NET, fh * C.NET)
        khung.append(C.khu_xanh(k, False, True))
    goc = (float(fw / 2.0), float((tam_y - Y0 + oy) / s))
    C.ghi_hu('hu-tu-luc', 'Tụ lực (giữ nút đánh lấy đà, vòng dưới chân)', khung, fw, fh, goc, 0.6, True, False, 'cong')
    print('hu-tu-luc: %d khung %dx%d, goc %s, net %d' % (N, fw, fh, goc, C.NET))
    xem(khung, fw, fh, goc)


# Màu hệ (js/fx.js PAL[el].c; nhãn không dấu vì phông mặc định của Pillow không có chữ Việt) và màu vàng đầy nấc, giống js/fx_he.js
HE = [('Khong he', None), ('Lua', (0xff, 0x7a, 0x2a)), ('Doc', (0x6f, 0xcf, 0x3a)), ('Bang', (0x7f, 0xd4, 0xff))]
GIU_GOC = 0.25  # phần ảnh gốc (trắng) cộng lại sau khi nhân màu, như js/fx_he.js


def nhuom(k, mau):
    if mau is None:
        return k
    f = k.astype(np.float32)
    rgb = f[..., :3] * (np.array(mau, np.float32) / 255.0)
    rgb = np.clip(rgb + f[..., :3] * GIU_GOC, 0, 255)
    return np.dstack([rgb, f[..., 3]]).astype(np.uint8)


def xem(khung, fw, fh, goc):
    Z = 3
    w, h = fw * C.NET * Z, fh * C.NET * Z
    L = 110
    out = Image.new('RGBA', (L + N * (w + 8), len(HE) * (h + 8) + 24), (16, 18, 24, 255))
    dr = ImageDraw.Draw(out)
    dr.text((4, 4), 'hu-tu-luc: %d khung %dx%d diem anh game (net %d), phong %d lan; cham do = tam vong (diem neo)' % (N, fw, fh, C.NET, C.NET * Z), fill=(220, 220, 220, 255))
    for r, (ten, mau) in enumerate(HE):
        y = 24 + r * (h + 8)
        dr.text((4, y + h // 2), ten, fill=(220, 220, 220, 255))
        dr.text((4, y + h // 2 + 12), ['none', 'fire', 'poison', 'ice'][r], fill=(160, 160, 170, 255))
        for i, k in enumerate(khung):
            x = L + i * (w + 8)
            o = Image.new('RGBA', (w, h), (28, 30, 40, 255))
            im = Image.fromarray(nhuom(k, mau), 'RGBA').resize((w, h), Image.NEAREST)
            # cộng sáng như game (tron 'cong')
            arr = np.asarray(o).astype(np.int32)
            src = np.asarray(im).astype(np.int32)
            al = src[..., 3:4] / 255.0
            arr[..., :3] = np.clip(arr[..., :3] + src[..., :3] * al, 0, 255)
            out.paste(Image.fromarray(arr.astype(np.uint8), 'RGBA'), (x, y))
            gx, gy = x + goc[0] * C.NET * Z, y + goc[1] * C.NET * Z
            dr.ellipse([gx - 3, gy - 3, gx + 3, gy + 3], outline=(255, 60, 60, 255))
    out.convert('RGB').save(XEM, optimize=True)
    print('xem-tu-luc.png', out.size)


if __name__ == '__main__':
    main()
