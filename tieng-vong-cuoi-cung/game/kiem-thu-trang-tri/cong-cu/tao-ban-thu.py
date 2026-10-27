#!/usr/bin/env python3
"""Tạo game/kiem-thu-trang-tri/kiem-thu.html từ game/demo.html (KHÔNG sửa demo.html) – bản kiểm thử trang trí địa hình 3 màn.

demo.html đã chứa module trang trí (runtime/trang-tri-dia-hinh.js + runtime/trang-tri/*.js) và các tham số ?tt=0, ?vao=, ?hitbox=1.
Bản kiểm thử chỉ thêm: đường dẫn tài nguyên (thư mục sâu hơn 1 cấp), khối THỬ (khoi-thu.js: ?vao=cong2, ?quai=0, ?ghi=1, bot kịch bản,
API chụp / quay TVTHU) chèn trước boot(). Mỗi chỗ thay phải khớp ĐÚNG 1 lần – demo.html đổi khác thì dừng và báo.

Chạy: python3 game/kiem-thu-trang-tri/cong-cu/tao-ban-thu.py"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.normpath(os.path.join(HERE, '..', '..'))
src = open(os.path.join(GAME, 'demo.html'), encoding='utf-8').read()
THU = open(os.path.join(HERE, 'khoi-thu.js'), encoding='utf-8').read()

R = []
def thay(mo_ta, cu, moi):
    R.append((mo_ta, cu, moi))

thay('tiêu đề', '<title>Tiếng Vọng – Demo Làng Chuông</title>', '<title>Tiếng Vọng – Kiểm thử trang trí địa hình</title>')
thay('script runtime', '<script src="runtime/quai-boss-runtime.js"></script>', '<script src="../runtime/quai-boss-runtime.js"></script>')
thay('script trang trí', '<script src="runtime/trang-tri-dia-hinh.js"></script>', '<script src="../runtime/trang-tri-dia-hinh.js"></script>')
for m in ('cong-lang', 'san-chuong', 'phong-boss'):
    thay('dữ liệu ' + m, '<script src="runtime/trang-tri/%s.js"></script>' % m, '<script src="../runtime/trang-tri/%s.js"></script>' % m)
for cu, moi in [("lam:'../art/modular/lam-moi/rig-v4/", "lam:'../../art/modular/lam-moi/rig-v4/"), ("lam:'../art/modular/lam-moi/rig-v3/", "lam:'../../art/modular/lam-moi/rig-v3/"),
                ("nghi:'anim/lam-nghi-v4-2x.png'", "nghi:'../anim/lam-nghi-v4-2x.png'"), ("nghi:'anim/lam-nghi-2x.png'", "nghi:'../anim/lam-nghi-2x.png'"),
                ("hd:   '../art/modular/", "hd:   '../../art/modular/"), ("hu:   '../art/hieu-ung/", "hu:   '../../art/hieu-ung/"),
                ("qbr:  'runtime/quai-boss/'", "qbr:  '../runtime/quai-boss/'"), ("lc:   '../art/the-gioi-moi/lang-chuong/'", "lc:   '../../art/the-gioi-moi/lang-chuong/'"),
                ("giu:  'anim/lang-chuong-giu.json'", "giu:  '../anim/lang-chuong-giu.json'"),
                ("tt:   '../art/the-gioi-moi/dia-hinh-v4/dia-hinh-v4.json'", "tt:   '../../art/the-gioi-moi/dia-hinh-v4/dia-hinh-v4.json'"),
                ("json=await r.json(); src='anim/'+json.image; }", "json=await r.json(); src='../anim/'+json.image; }")]:
    thay('đường dẫn ' + cu.split("'")[1], cu, moi)
thay('khối THỬ + khởi động', "\nboot();\n</script>", "\n" + THU + "\nboot();\n</script>")

out = src
loi = []
for mo_ta, cu, moi in R:
    n = out.count(cu)
    if n != 1:
        loi.append('%s: khớp %d lần (cần 1)' % (mo_ta, n))
        continue
    out = out.replace(cu, moi)
if loi:
    sys.exit('LỖI – demo.html đã đổi, sửa script:\n  ' + '\n  '.join(loi))
dst = os.path.join(GAME, 'kiem-thu-trang-tri', 'kiem-thu.html')
open(dst, 'w', encoding='utf-8').write(out)
print('ghi', dst, len(out.encode('utf-8')), 'byte')
