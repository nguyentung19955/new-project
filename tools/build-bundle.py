#!/usr/bin/env python3
"""Gói ảnh assets/packs + runes + ui + maps (+ icon đồ theo tools/item-sheets.json) thành vài file JS (window.ASSET_DATA) cho bản thử chỉ được ít file.

  python3 tools/build-bundle.py <thư mục ra> [MB mỗi file, mặc định 12]
Ra <thư mục>/assets-bundle-1.js … ; nạp các file này TRƯỚC js/render.js. Bản chơi thật không cần.
"""
import os, sys, base64, json
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets')
out, cap = sys.argv[1], float(sys.argv[2]) * 1e6 if len(sys.argv) > 2 else 12e6
os.makedirs(out, exist_ok=True)
items = []
for sub in ('packs', 'runes', 'ui', 'maps'):
    for dp, _, fs in sorted(os.walk(os.path.join(root, sub))):
        for f in sorted(fs):
            if f.endswith(('.png', '.jpg')):
                p = os.path.join(dp, f)
                mime = 'image/jpeg' if f.endswith('.jpg') else 'image/png'
                items.append((os.path.relpath(p, root).replace(os.sep, '/'), f'data:{mime};base64,' + base64.b64encode(open(p, 'rb').read()).decode()))
# v155: icon đồ vẽ tay (cat-items.py) nằm ngay trong assets/ hoặc assets/ui/ — gói theo danh sách tấm
for sh in json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'item-sheets.json'), encoding='utf8')).values():
    for f in sh['files']:
        rel = (sh['dir'] + '/' if sh['dir'] else '') + f
        p = os.path.join(root, rel)
        if os.path.exists(p) and not any(k == rel for k, _ in items):
            items.append((rel, 'data:image/png;base64,' + base64.b64encode(open(p, 'rb').read()).decode()))
chunks, cur, size = [], {}, 0
for k, v in items:
    if size + len(v) > cap and cur: chunks.append(cur); cur, size = {}, 0
    cur[k] = v; size += len(v)
if cur: chunks.append(cur)
for i, c in enumerate(chunks, 1):
    with open(os.path.join(out, f'assets-bundle-{i}.js'), 'w') as fh:
        fh.write('window.ASSET_DATA = Object.assign(window.ASSET_DATA || {}, ' + json.dumps(c) + ');\n')
print(f'{len(items)} ảnh → {len(chunks)} file')
