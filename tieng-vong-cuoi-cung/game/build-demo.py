#!/usr/bin/env python3
"""Ghép demo.html thành MỘT file tự chứa để đăng artifact: nhúng lib/*.js vào <script>,
3 ảnh nền thành data URI base64, và atlas sprite in sẵn (art/sprite/atlas.json + PNG: lam.png, lam48.png, lam3d.png,
quai-chuong.png, boss.png, lam3d36.png — tạo bằng tools/in-atlas.py, tools/in-lam48.py, tools/in-lam3d.py) thành TV.ATLAS_NHUNG,
và sheet Lam 2D (anim/lam-chatgpt-80.anim.json + PNG) thành TV.ANIM2D_NHUNG để bản build chạy được ?anim=2d / #anim=2d / nút "Lam 3D".
Three.js chỉ nạp từ cdnjs khi mở ?rig=1 hoặc khi thiếu atlas in sẵn.
Chạy: python3 build-demo.py  →  ra demo.build.html cạnh file này."""
import base64, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, 'demo.html'), encoding='utf-8').read()

def inline_js(m):
    path = os.path.join(HERE, m.group(1))
    js = open(path, encoding='utf-8').read().replace('</script', '<\\/script')
    return '<script>/* ' + m.group(1) + ' */\n' + js + '\n</script>'

SPRITE = os.path.normpath(os.path.join(HERE, '..', 'art', 'sprite'))
n_sprite = 0
def atlas_block():
    """<script> đặt TV.ATLAS_NHUNG = {json, anh:{file: data URI}} trước atlas-in-san.js."""
    global n_sprite
    jp = os.path.join(SPRITE, 'atlas.json')
    if not os.path.isfile(jp):
        print('CẢNH BÁO: chưa có art/sprite/atlas.json — chạy tools/in-atlas.py; bản build sẽ cần WebGL')
        return ''
    meta = json.load(open(jp, encoding='utf-8'))
    assert {'lam', 'quaiChuong', 'boss'} <= set(meta), sorted(meta)
    if 'lam3d' not in meta:
        print('CẢNH BÁO: atlas.json chưa có lam3d — chạy tools/in-lam3d.py; demo sẽ dùng Lam 48/24')
    anh = {}
    for k, m in meta.items():
        data = open(os.path.join(SPRITE, m['anh']), 'rb').read()
        anh[m['anh']] = 'data:image/png;base64,' + base64.b64encode(data).decode()
        n_sprite += 1
    js = json.dumps({'json': meta, 'anh': anh}, ensure_ascii=False, separators=(',', ':'))
    return ('<script>/* atlas in sẵn */\nwindow.TV=window.TV||{};TV.ATLAS_NHUNG='
            + js.replace('</', '<\\/') + ';\n</script>\n')

tag = '<script src="lib/atlas-in-san.js"></script>'
assert src.count(tag) == 1
src = src.replace(tag, atlas_block() + tag)

ANIM = os.path.join(HERE, 'anim')
n_anim2d = 0
def anim2d_block():
    """<script> đặt TV.ANIM2D_NHUNG = {json, anh: data URI} trước anim2d.js (demo.html đọc khi có ?anim=2d)."""
    global n_anim2d
    jp = os.path.join(ANIM, 'lam-chatgpt-80.anim.json')
    if not os.path.isfile(jp):
        print('CẢNH BÁO: thiếu anim/lam-chatgpt-80.anim.json — bản build sẽ không bật được ?anim=2d')
        return ''
    meta = json.load(open(jp, encoding='utf-8'))
    data = open(os.path.join(ANIM, meta['image']), 'rb').read()
    n_anim2d = 1
    js = json.dumps({'json': meta, 'anh': 'data:image/png;base64,' + base64.b64encode(data).decode()}, ensure_ascii=False, separators=(',', ':'))
    return ('<script>/* Lam 2D in sẵn: anim/' + meta['image'] + ' */\nwindow.TV=window.TV||{};TV.ANIM2D_NHUNG='
            + js.replace('</', '<\\/') + ';\n</script>\n')

tag2 = '<script src="lib/anim2d.js"></script>'
assert src.count(tag2) == 1
src = src.replace(tag2, anim2d_block() + tag2)

out, n_js = re.subn(r'<script src="(lib/[^"]+\.js)"></script>', inline_js, src)

n_img = 0
def inline_img(m):
    global n_img
    rel = m.group(1)
    data = open(os.path.normpath(os.path.join(HERE, rel)), 'rb').read()
    n_img += 1
    return "'data:image/png;base64," + base64.b64encode(data).decode() + "'"

out = re.sub(r"'(\.\./art/nen/lang-chuong/game/(?:xa|giua|gan)\.png)'", inline_img, out)
assert n_js == 5 and n_img == 3 and n_sprite in (0, 3, 4, 5, 6), (n_js, n_img, n_sprite)
assert 'three.min.js"></script>' not in out
dst = os.path.join(HERE, 'demo.build.html')
open(dst, 'w', encoding='utf-8').write(out)
print('Đã ghi', dst, round(len(out) / 1024), 'KB ·', n_js, 'thư viện ·', n_img, 'ảnh nền ·', n_sprite, 'atlas ·', n_anim2d, 'sheet Lam 2D')
