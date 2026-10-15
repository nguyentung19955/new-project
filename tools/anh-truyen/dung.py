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


def dung(ten):
    src = os.path.join(GOC, ten + '.png')
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
    im = im.resize(CO, Image.LANCZOS)
    os.makedirs(RA, exist_ok=True)
    pw, pj = os.path.join(RA, ten + '.webp'), os.path.join(RA, ten + '.jpg')
    im.save(pw, 'WEBP', quality=80, method=6)
    im.save(pj, 'JPEG', quality=80, optimize=True, progressive=True)
    return os.path.getsize(pw), os.path.getsize(pj)


def main():
    ds = sys.argv[1:] or TEN
    tw = tj = 0
    for t in ds:
        r = dung(t)
        if r is None:
            print('%-24s chưa có ảnh gốc (giữ nền vẽ code)' % t)
            continue
        tw += r[0]; tj += r[1]
        print('%-24s webp %4d KB · jpg %4d KB' % (t, r[0] // 1024, r[1] // 1024))
    print('Tổng: webp %d KB · jpg %d KB → %s' % (tw // 1024, tj // 1024, os.path.relpath(RA, ROOT)))


if __name__ == '__main__':
    main()
