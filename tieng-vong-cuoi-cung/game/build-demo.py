#!/usr/bin/env python3
"""Ghép demo.html thành MỘT file tự chứa để đăng artifact:
nhúng 3 sheet chibi (anim/lam-chibi, anim/quai-boss, anim/the-gioi: json + ảnh) và 2 lớp nền parallax
(art/chibi/nen/parallax/xa-1920.png, gan-1920.png) vào TV.NHUNG dạng data URI WebP (nhỏ hơn PNG nhiều, Safari iOS 14+ đọc được).
Sheet tạo bằng tools/chibi-sheets.py. Nếu file build > 15 MB thì tự giảm chất lượng WebP.
Chạy: python3 build-demo.py  →  ra demo.build.html cạnh file này (không commit file build)."""
import base64, io, json, os, re
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, 'demo.html'), encoding='utf-8').read()
ANIM = os.path.join(HERE, 'anim')
NEN = os.path.normpath(os.path.join(HERE, '..', 'art', 'chibi', 'nen', 'parallax'))
SHEETS = {'lam': 'lam-chibi.json', 'qb': 'quai-boss.json', 'tg': 'the-gioi.json'}
NENS = {'xa': 'xa-1920.png', 'gan': 'gan-1920.png'}


def webp(path, q, alpha=True):
    b = io.BytesIO()
    im = Image.open(path)
    if alpha:
        im.convert('RGBA').save(b, 'WEBP', quality=q, method=6, alpha_quality=100)
    else:
        im.convert('RGB').save(b, 'WEBP', quality=q, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()


def khoi(q_sheet, q_nen):
    nh = {}
    for k, jf in SHEETS.items():
        meta = json.load(open(os.path.join(ANIM, jf), encoding='utf-8'))
        nh[k] = {'json': meta, 'anh': webp(os.path.join(ANIM, meta['image']), q_sheet)}
    for k, f in NENS.items():
        nh[k] = {'anh': webp(os.path.join(NEN, f), q_nen, alpha=(k == 'gan'))}
    js = json.dumps(nh, ensure_ascii=False, separators=(',', ':'))
    return '<script>/* tài nguyên chibi nhúng sẵn */\nwindow.TV=window.TV||{};TV.NHUNG=' + js.replace('</', '<\\/') + ';\n</script>\n'


tag = "<script>\n'use strict';"
assert src.count(tag) == 1
assert '<script src=' not in src, 'demo.html không còn nạp lib/*.js'
for qs, qn in [(92, 85), (85, 78), (75, 70), (60, 60)]:
    out = src.replace(tag, khoi(qs, qn) + tag)
    mb = len(out.encode('utf-8')) / 1024 / 1024
    if mb <= 15:
        break
    print('Bản build %.1f MB > 15 MB → giảm chất lượng WebP' % mb)
dst = os.path.join(HERE, 'demo.build.html')
open(dst, 'w', encoding='utf-8').write(out)
print('Đã ghi', dst, '%.2f MB' % mb, '· WebP sheet q%d, nền q%d' % (qs, qn))
