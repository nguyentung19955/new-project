#!/usr/bin/env python3
"""Ảnh cảnh truyện: docs/anh-goc/truyen/<tên>.png (ảnh gốc 16:9, ~1672×941) → game/art/truyen/<tên>.webp + <tên>.jpg (960×540).

  python3 tools/anh-truyen/dung.py            dựng mọi ảnh trong danh sách TEN có ảnh gốc
  python3 tools/anh-truyen/dung.py b4-trao-vu-khi   chỉ dựng ảnh này

960×540 = đúng số điểm ảnh thật của canvas thế giới khi Độ nét Cao (480×270 × G.NET 2), nên ảnh hiện đủ chi tiết, không phóng mờ.
WebP có mất mát (quality 80) cho trình duyệt thường; JPEG (quality 80, progressive) dự phòng cho trình duyệt không đọc được WebP.
game/build.py lấy MỌI tệp trong game/art/truyen/ (bản một tệp: nhúng; bản ảnh rời: chép sang dist/anh/, tải lười khi mở truyện).
Thêm cảnh: thả <tên>.png vào docs/anh-goc/truyen/, thêm tên vào TEN (và khoá nền vào bảng ANH của js/truyen.js nếu là khoá mới) rồi chạy
lệnh này; tệp chưa có thì game vẽ nền code. (B4 b4-trao-vu-khi, B5 b5-hoi-lang về sau và vào game đúng theo cách này.) KHÔNG đưa vào game: b2b-bong-duoi-song-v2.png (dự phòng),
hac-long-tao-hinh.png (ảnh chốt tạo hình trùm vùng 8).

Bìa game (15/10, bia-moi): docs/anh-goc/bia/<tên>.png → game/art/bia/<tên>.webp + <tên>.jpg (cùng cỡ 960×540, cùng chất lượng)
+ <tên>.mo.jpg (32×18, rất nhỏ: nền mờ của màn tải HTML #lk-tai, build.py nhúng dạng data:). Danh sách BIA trùng với js/bia.js.
  python3 tools/anh-truyen/dung.py bia-1-cay-da   chỉ dựng một bìa (tên nằm trong BIA)
"""
import os
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
GOC = os.path.join(ROOT, 'docs', 'anh-goc', 'truyen')
RA = os.path.join(ROOT, 'game', 'art', 'truyen')
# Trùng với bảng ANH trong game/js/truyen.js (khoá nền → tên tệp)
TEN = ['b1-trong-vo-cay-da-ua', 'b2-ba-yeu-tinh', 'b2b-bong-duoi-song', 'b3-ba-ban-bi-bat', 'b4-trao-vu-khi', 'b5-hoi-lang', 'b6-nen-lang']
CO = (960, 540)
# Bìa màn hình chính (js/bia.js: ngẫu nhiên 1 trong 2, ?bia=1 / ?bia=2 ép)
GOC_BIA = os.path.join(ROOT, 'docs', 'anh-goc', 'bia')
RA_BIA = os.path.join(ROOT, 'game', 'art', 'bia')
BIA = ['bia-1-cay-da', 'bia-2-dong-song', 'bia-3-talesworn']
# TALESWORN 05/11 (docs/review/ke-hoach-cai-thien/talesworn-c-rowan): bìa 3 lấy thẳng ảnh gốc ChatGPT (không chép thêm bản vào docs/anh-goc/bia)
# và THU NÉT kiểu điểm ảnh: lượng tử màu → mỗi điểm 480×270 lấy màu xuất hiện nhiều nhất trong ô (không trung bình) → phóng ×2 kiểu
# "điểm gần nhất" thành 960×540. WebP chất lượng cao hơn (giữ cạnh điểm ảnh).
GOC_RIENG = {'bia-3-talesworn': os.path.join(ROOT, 'docs', 'tu-van-toan-cau', 'chatgpt-05-11', 'man-dau-nen-nguon-chatgpt.png')}
THU_NET = {'bia-3-talesworn': (480, 270)}


def thu_net(im, co):
    """Thu ảnh về co (rộng, cao) điểm ảnh: mỗi điểm = màu có thật xuất hiện nhiều nhất trong ô nguồn (sau lượng tử 96 màu)."""
    import numpy as np
    q = im.quantize(96, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[:96 * 3], dtype=np.uint8).reshape(-1, 3)
    a = np.array(q)
    H0, W0 = a.shape
    w, h = co
    ra = np.zeros((h, w, 3), np.uint8)
    for j in range(h):
        ya, yb = int(j * H0 / h), max(int(j * H0 / h) + 1, int((j + 1) * H0 / h))
        for i in range(w):
            xa, xb = int(i * W0 / w), max(int(i * W0 / w) + 1, int((i + 1) * W0 / w))
            ra[j, i] = pal[np.bincount(a[ya:yb, xa:xb].ravel(), minlength=len(pal)).argmax()]
    return Image.fromarray(ra)
CO_MO = (32, 18)


def dung(ten):
    bia = ten in BIA
    goc, ra = (GOC_BIA, RA_BIA) if bia else (GOC, RA)
    src = GOC_RIENG.get(ten) or os.path.join(goc, ten + '.png')
    if not os.path.isfile(src):
        return None
    im = Image.open(src).convert('RGB')
    w, h = im.size
    # cắt giữa cho đúng 16:9 rồi thu nhỏ
    if abs(w / h - 16 / 9) > 0.005:
        if w / h > 16 / 9:
            nw = round(h * 16 / 9); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
        else:
            nh = round(w * 9 / 16); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    net = ten in THU_NET
    im = thu_net(im, THU_NET[ten]).resize(CO, Image.NEAREST) if net else im.resize(CO, Image.LANCZOS)
    os.makedirs(ra, exist_ok=True)
    pw, pj = os.path.join(ra, ten + '.webp'), os.path.join(ra, ten + '.jpg')
    im.save(pw, 'WEBP', quality=92 if net else 80, method=6)
    im.save(pj, 'JPEG', quality=90 if net else 80, optimize=True, progressive=True)
    if bia:  # bản rất nhỏ cho nền mờ màn tải (trình duyệt phóng to tự làm mờ)
        im.resize(CO_MO, Image.BOX).save(os.path.join(ra, ten + '.mo.jpg'), 'JPEG', quality=70, optimize=True)
    return os.path.getsize(pw), os.path.getsize(pj)


def main():
    ds = sys.argv[1:] or TEN + BIA
    tw = tj = 0
    for t in ds:
        r = dung(t)
        if r is None:
            print('%-24s chưa có ảnh gốc (giữ nền vẽ code)' % t)
            continue
        tw += r[0]; tj += r[1]
        print('%-24s webp %4d KB · jpg %4d KB' % (t, r[0] // 1024, r[1] // 1024))
    print('Tổng: webp %d KB · jpg %d KB → %s, %s' % (tw // 1024, tj // 1024, os.path.relpath(RA, ROOT), os.path.relpath(RA_BIA, ROOT)))


if __name__ == '__main__':
    main()
