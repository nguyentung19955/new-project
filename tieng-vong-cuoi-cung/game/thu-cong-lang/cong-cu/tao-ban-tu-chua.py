#!/usr/bin/env python3
"""Ghép bản thử thu-cong-lang.html thành MỘT file tự chứa thu-cong-lang.build.html (mở được qua file://, không cần máy chủ).

Dùng lại toàn bộ cách nhúng của game/build-demo.py (TV.NHUNG: Lam, hành động, hiệu ứng, quái+boss, Làng Chuông, điểm lưu) bằng cách
chạy build-demo.py với nguồn = thu-cong-lang.html; thêm:
  - TV.NHUNG.tt = {json: cong-lang-v3.json, anh: {tên atlas: data URI PNG nguyên bản}} (chỉ atlas game dùng, không có họ "-kho");
  - chèn INLINE runtime/trang-tri-dia-hinh.js + runtime/trang-tri/cong-lang.js thay cho <script src>.
Không commit file build (đã ghi .gitignore). Chạy: python3 game/thu-cong-lang/cong-cu/tao-ban-tu-chua.py"""
import base64, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
THU = os.path.normpath(os.path.join(HERE, '..'))
GAME = os.path.normpath(os.path.join(THU, '..'))
ART = os.path.normpath(os.path.join(GAME, '..', 'art', 'the-gioi-moi', 'cong-lang-v3'))

bd = open(os.path.join(GAME, 'build-demo.py'), encoding='utf-8').read()
# nguồn = bản thử; đường dẫn tài nguyên trong bản thử sâu hơn 1 cấp nhưng build-demo đọc file theo HERE (game/) nên không ảnh hưởng
bd = bd.replace("src = open(os.path.join(HERE, 'demo.html'), encoding='utf-8').read()",
                "src = open(os.path.join(HERE, 'thu-cong-lang', 'thu-cong-lang.html'), encoding='utf-8').read()")
bd = bd.replace('QBR_TAG = \'<script src="runtime/quai-boss-runtime.js"></script>\'', 'QBR_TAG = \'<script src="../runtime/quai-boss-runtime.js"></script>\'')
bd = bd.replace("dst = os.path.join(HERE, 'demo.build.html')", "dst = os.path.join(HERE, 'thu-cong-lang', 'thu-cong-lang.build.html')")
# trước khi kiểm "không còn <script src=": chèn inline 2 script trang trí
bd = bd.replace("assert '<script src=' not in src, ",
                "src = TT_INLINE(src)\nassert '<script src=' not in src, ")
# nhúng TV.NHUNG.tt
bd = bd.replace("    nh['lc'] = lang_chuong(q_sheet)", "    nh['lc'] = lang_chuong(q_sheet)\n    nh['tt'] = TT_NHUNG()")

HERE_GAME = GAME


def TT_INLINE(src):
    for rel in ('runtime/trang-tri-dia-hinh.js', 'runtime/trang-tri/cong-lang.js'):
        tag = '<script src="../%s"></script>' % rel
        assert src.count(tag) == 1, 'bản thử phải nạp ' + rel + ' đúng 1 lần'
        js = open(os.path.join(HERE_GAME, rel), encoding='utf-8').read()
        assert '</script' not in js
        src = src.replace(tag, '<script>/* %s (nhúng) */\n%s\n</script>' % (rel, js))
    return src


def TT_NHUNG():
    meta = json.load(open(os.path.join(ART, 'cong-lang-v3.json'), encoding='utf-8'))
    anh = {}
    for h, a in meta['anh'].items():
        if h.endswith('-kho'):
            continue
        p = os.path.join(ART, a['tep'])
        anh[a['tep']] = 'data:image/png;base64,' + base64.b64encode(open(p, 'rb').read()).decode()
    return {'json': meta, 'anh': anh}


g = {'__name__': '__main__', '__file__': os.path.join(GAME, 'build-demo.py'), 'TT_INLINE': TT_INLINE, 'TT_NHUNG': TT_NHUNG}
exec(compile(bd, os.path.join(GAME, 'build-demo.py'), 'exec'), g)
