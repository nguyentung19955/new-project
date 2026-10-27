#!/usr/bin/env python3
"""Tạo bản kiểm thử từ game/demo.html (KHÔNG sửa demo.html):
  game/kiem-thu-lang-hoan-thien/kiem-thu.html        = demo.html hiện tại + khối THỬ (khoi-thu.js)
  game/kiem-thu-lang-hoan-thien/kiem-thu-truoc.html  = demo.html ở commit TRƯỚC đợt này (git: tham số 1, mặc định ad1605e) + khối THỬ
     → để chụp ảnh TRƯỚC cùng camera. File "truoc" chỉ dùng lúc chụp, không commit.
Chỉ đổi đường dẫn (thư mục sâu hơn 1 cấp) + chèn khối THỬ trước boot(). Mỗi chỗ thay phải khớp đúng 1 lần (hoặc 0 lần với đường dẫn
chỉ có ở bản mới). Chạy: python3 game/kiem-thu-lang-hoan-thien/cong-cu/tao-ban-thu.py [commit-trước]"""
import os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
KT = os.path.normpath(os.path.join(HERE, '..'))
GAME = os.path.normpath(os.path.join(KT, '..'))
THU = open(os.path.join(HERE, 'khoi-thu.js'), encoding='utf-8').read()


def chuyen(src, ten):
    out = src
    out = re.sub(r'<script src="runtime/', '<script src="../runtime/', out)
    # đường dẫn tài nguyên trong SRC / CLIPS: '../art/…' → '../../art/…', 'anim/…' / 'runtime/…' → '../…'
    out = out.replace("'../art/", "'../../art/")
    for a in ("nghi:'anim/", "giu:  'anim/", "qbr:  'runtime/"):
        out = out.replace(a, a.replace("'", "'../", 1))
    out = out.replace("src='anim/'+json.image", "src='../anim/'+json.image")
    tag = "\nboot();\n</script>"
    assert out.count(tag) == 1, 'không thấy boot()'
    out = out.replace(tag, '\n' + THU + tag)
    out = out.replace('<title>Tiếng Vọng – Demo Làng Chuông</title>', '<title>Tiếng Vọng – Kiểm thử làng hoàn thiện (%s)</title>' % ten)
    return out


moi = chuyen(open(os.path.join(GAME, 'demo.html'), encoding='utf-8').read(), 'SAU')
open(os.path.join(KT, 'kiem-thu.html'), 'w', encoding='utf-8').write(moi)
ref = sys.argv[1] if len(sys.argv) > 1 else 'ad1605e'
cu = subprocess.run(['git', 'show', ref + ':tieng-vong-cuoi-cung/game/demo.html'], cwd=GAME, capture_output=True, text=True, check=True).stdout
open(os.path.join(KT, 'kiem-thu-truoc.html'), 'w', encoding='utf-8').write(chuyen(cu, 'TRƯỚC'))
print('ghi kiem-thu.html (%d byte) + kiem-thu-truoc.html (từ %s)' % (len(moi.encode()), ref))
