#!/usr/bin/env python3
"""Ghép demo.html thành MỘT file tự chứa để đăng artifact: nhúng lib/*.js vào <script>
và 3 ảnh nền thành data URI base64. Three.js vẫn nạp từ cdnjs.
Chạy: python3 build-demo.py  →  ra demo.build.html cạnh file này."""
import base64, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, 'demo.html'), encoding='utf-8').read()

def inline_js(m):
    path = os.path.join(HERE, m.group(1))
    js = open(path, encoding='utf-8').read().replace('</script', '<\\/script')
    return '<script>/* ' + m.group(1) + ' */\n' + js + '\n</script>'

out, n_js = re.subn(r'<script src="(lib/[^"]+\.js)"></script>', inline_js, src)

n_img = 0
def inline_img(m):
    global n_img
    rel = m.group(1)
    data = open(os.path.normpath(os.path.join(HERE, rel)), 'rb').read()
    n_img += 1
    return "'data:image/png;base64," + base64.b64encode(data).decode() + "'"

out = re.sub(r"'(\.\./art/nen/lang-chuong/game/(?:xa|giua|gan)\.png)'", inline_img, out)
assert n_js == 3 and n_img == 3, (n_js, n_img)
dst = os.path.join(HERE, 'demo.build.html')
open(dst, 'w', encoding='utf-8').write(out)
print('Đã ghi', dst, round(len(out) / 1024), 'KB ·', n_js, 'thư viện ·', n_img, 'ảnh')
