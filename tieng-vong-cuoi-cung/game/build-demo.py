#!/usr/bin/env python3
"""Ghép demo.html thành MỘT file tự chứa để đăng artifact / chơi offline, nhúng vào TV.NHUNG:
  - lam    : Lam mới, clip CHẠY NHANH rig-v4 (mặc định) = JSON + PNG CÙNG lấy từ art/modular/lam-moi/rig-v4/sprite/
  - lam_v3 : clip cũ rig-v3 (dùng khi mở ?clip=v3) = JSON + PNG từ art/modular/lam-moi/rig-v3/sprite/
           Cả hai nhúng PNG NGUYÊN BẢN (không nén lại, không đổi cỡ) – kiểm ảnh đúng 2142×970 = co_sheet trong JSON và đúng
           phien_ban_clip, sai thì dừng; + dáng nghỉ TẠM anim/lam-nghi-2x.png (dùng chung, cùng ô/neo) nhúng PNG nguyên bản.
  - qb, tg : sheet quái+boss và thế giới (anim/quai-boss.*, anim/the-gioi.*) dạng data URI WebP (Safari iOS 14+ đọc được).
Nền parallax cũ (art/chibi/…) đã bị xoá: demo.html vẽ nền gradient TẠM, không cần nhúng ảnh nền.
Nếu file build > 15 MB thì tự giảm chất lượng WebP của qb/tg.
Chạy: python3 build-demo.py  →  ra demo.build.html cạnh file này (không commit file build)."""
import base64, io, json, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, 'demo.html'), encoding='utf-8').read()
ANIM = os.path.join(HERE, 'anim')
LAM_DIRS = {'v4': os.path.normpath(os.path.join(HERE, '..', 'art', 'modular', 'lam-moi', 'rig-v4', 'sprite')),
            'v3': os.path.normpath(os.path.join(HERE, '..', 'art', 'modular', 'lam-moi', 'rig-v3', 'sprite'))}
LAM_CO = (2142, 970)
SHEETS = {'qb': 'quai-boss.json', 'tg': 'the-gioi.json'}


def webp(path, q):
    b = io.BytesIO()
    Image.open(path).convert('RGBA').save(b, 'WEBP', quality=q, method=6, alpha_quality=100)
    return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()


def png_uri(path):
    return 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode()


def lam(clip):
    LAM_DIR = LAM_DIRS[clip]
    meta = json.load(open(os.path.join(LAM_DIR, 'lam-chay-2x.json'), encoding='utf-8'))
    if meta.get('phien_ban_clip', 'v3') != clip:
        raise SystemExit('LỖI: %s không phải clip %s' % (LAM_DIR, clip))
    p = os.path.join(LAM_DIR, meta['anh'])
    co = Image.open(p).size
    if co != LAM_CO or tuple(meta['co_sheet']) != co:
        raise SystemExit('LỖI: %s cỡ %s – phải đúng %s và trùng co_sheet %s trong JSON (PNG + JSON cùng từ rig-%s/sprite/)'
                         % (p, co, LAM_CO, meta['co_sheet'], clip))
    pn = os.path.join(ANIM, 'lam-nghi-2x.png')
    if Image.open(pn).size != tuple(meta['co_khung']):
        raise SystemExit('LỖI: %s phải cùng cỡ ô %s – chạy lại tools/lam-dang-nghi.py' % (pn, meta['co_khung']))
    return {'json': meta, 'anh': png_uri(p), 'nghi': png_uri(pn)}


def khoi(q_sheet, L):
    nh = {'lam': L['v4'], 'lam_v3': L['v3']}
    for k, jf in SHEETS.items():
        meta = json.load(open(os.path.join(ANIM, jf), encoding='utf-8'))
        nh[k] = {'json': meta, 'anh': webp(os.path.join(ANIM, meta['image']), q_sheet)}
    js = json.dumps(nh, ensure_ascii=False, separators=(',', ':'))
    return '<script>/* tài nguyên nhúng sẵn */\nwindow.TV=window.TV||{};TV.NHUNG=' + js.replace('</', '<\\/') + ';\n</script>\n'


tag = "<script>\n'use strict';"
assert src.count(tag) == 1
assert '<script src=' not in src, 'demo.html không còn nạp lib/*.js'
L = {c: lam(c) for c in ('v4', 'v3')}
for qs in (92, 85, 75, 60):
    out = src.replace(tag, khoi(qs, L) + tag)
    mb = len(out.encode('utf-8')) / 1024 / 1024
    if mb <= 15:
        break
    print('Bản build %.1f MB > 15 MB → giảm chất lượng WebP' % mb)
dst = os.path.join(HERE, 'demo.build.html')
open(dst, 'w', encoding='utf-8').write(out)
print('Đã ghi', dst, '%.2f MB' % mb, '· Lam v4 + v3 PNG nguyên bản %dx%d · WebP quái/thế giới q%d (mở ?clip=v3 để xem clip cũ)' % (LAM_CO + (qs,)))
