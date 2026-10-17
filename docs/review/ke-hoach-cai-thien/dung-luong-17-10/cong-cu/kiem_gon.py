#!/usr/bin/env python3
"""Kiểm mã gọn (dung-luong-17-10): chạy game/build.py gon_js trên mọi game/js/*.js rồi so dãy mảnh với bản gốc bằng acorn (kiem_gon.js).
  python3 kiem_gon.py      (cần node + acorn; ACORN=<đường dẫn> nếu acorn không ở /opt/npm-tools/node_modules/acorn)"""
import os
import subprocess
import sys
import tempfile

GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..'))
sys.path.insert(0, os.path.join(GOC, 'game'))
sys.argv = sys.argv[:1]
import build  # noqa: E402

thu = tempfile.mkdtemp()
cap, a, b = [], 0, 0
for f in sorted(os.listdir(os.path.join(GOC, 'game', 'js'))):
    if not f.endswith('.js'):
        continue
    p = os.path.join(GOC, 'game', 'js', f)
    s = open(p, encoding='utf-8').read()
    g = build.gon_js(s)
    q = os.path.join(thu, f)
    open(q, 'w', encoding='utf-8').write(g)
    cap += [p, q]
    a += len(s.encode()); b += len(g.encode())
print('%d tệp: %.2f MB → %.2f MB' % (len(cap) // 2, a / 1048576, b / 1048576))
sys.exit(subprocess.call(['node', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'kiem_gon.js')] + cap))
