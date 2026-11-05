#!/usr/bin/env python3
"""Dựng game/js/phong_data.js từ các tệp phông game/art/phong/*.woff2 (Talesworn phiên E, 05/11/2026).

Phông chủ đề cổ tích châu Âu (giấy phép SIL OFL 1.1, tệp OFL-*.txt cùng thư mục):
  grenze-gotisch-700.woff2  — TIÊU ĐỀ (logo TALESWORN, tên bảng, tên trùm, tên chương). Đủ dấu tiếng Việt.
  alegreya-sans-500.woff2   — THÂN CHỮ thường (nút, hộp thoại, HUD).                     Đủ dấu tiếng Việt.
  alegreya-sans-700.woff2   — THÂN CHỮ đậm.                                              Đủ dấu tiếng Việt.
  silkscreen-700.woff2      — SỐ (sát thương, số nhỏ). KHÔNG có dấu tiếng Việt → chỉ dùng cho chuỗi toàn số / ký hiệu.

Các tệp woff2 do tools/phong/thu_gon.py làm ra từ bản gốc github.com/google/fonts (ofl/grenzegotisch, ofl/alegreyasans,
ofl/silkscreen): cố định nét, số thẳng hàng, chỉ giữ ký tự game cần (Latin, Latin-1, đủ chữ tiếng Việt, dấu câu).

Chạy: python3 tools/phong/dung_phong.py   (ghi đè game/js/phong_data.js)
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'game', 'art', 'phong')
OUT = os.path.join(ROOT, 'game', 'js', 'phong_data.js')
# khoá trong G.PHONG_DATA: (tệp, họ phông, nét)
DS = [
    ('td700', 'grenze-gotisch-700.woff2', 'TW Tieu De', '700'),
    ('than500', 'alegreya-sans-500.woff2', 'TW Than', '500'),
    ('than700', 'alegreya-sans-700.woff2', 'TW Than', '700'),
    ('so700', 'silkscreen-700.woff2', 'TW So', '700'),
]


def main():
    dong = ['// TỰ SINH bởi tools/phong/dung_phong.py — đừng sửa tay. Phông OFL 1.1 (game/art/phong/OFL-*.txt), woff2 đã thu gọn ký tự.',
            '(window.G = window.G || {}).PHONG_DATA = [']
    tong = 0
    for k, tep, ho, net in DS:
        b = open(os.path.join(SRC, tep), 'rb').read()
        tong += len(b)
        dong.append('  { k: %r, ho: %r, net: %r, b64: %r },' % (k, ho, net, base64.b64encode(b).decode('ascii')))
    dong.append('];')
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(dong) + '\n')
    print('Đã ghi %s (%d phông, %.1f KB woff2, %.1f KB tệp JS)' % (os.path.relpath(OUT, ROOT), len(DS), tong / 1024, os.path.getsize(OUT) / 1024))


if __name__ == '__main__':
    main()
