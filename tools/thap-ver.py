#!/usr/bin/env python3
"""Dán PHIÊN BẢN (băm nội dung) vào bản thap/ sắp xuất bản → điện thoại không chạy JS/ảnh cũ trong bộ đệm.

  python3 tools/thap-ver.py <thư mục thap của bản xuất bản>      # vd: /tmp/pub/thap

Chỉ chạy trên BẢN XUẤT BẢN (nhánh claude/mobile-tower-defense-game-k5oxzo), KHÔNG chạy trên claude/demo-hop-tuong
(index.html ở nhánh làm việc giữ nguyên → các phiên song song không xung đột). Chạy lại nhiều lần vẫn đúng.
 · index.html: <script src="js/x.js?v=băm"> / <link href="css/x.css?v=băm"> (băm 8 ký tự từng tệp)
 · js/ver-anh.js: ANH_V = { 'quai_bo_side_8': 'băm', … } → REN.taiAnh tải 'assets/<tên>.png?v=băm'
 · ver.json {v}: + đoạn kiểm tra ở đầu index.html (fetch no-store) — bản trang đang mở cũ hơn bản trên máy chủ → tải lại 1 lần
"""
import hashlib, json, os, re, sys

D = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else 'thap')
bam = lambda p: hashlib.sha1(open(p, 'rb').read()).hexdigest()[:8]

anh = {}
for goc, _, ds in os.walk(os.path.join(D, 'assets')):
    for f in ds:
        if f.endswith('.png'):
            p = os.path.join(goc, f)
            anh[os.path.relpath(p, os.path.join(D, 'assets'))[:-4].replace(os.sep, '/')] = bam(p)
va = os.path.join(D, 'js/ver-anh.js')
open(va, 'w').write('// tự sinh bởi tools/thap-ver.py lúc xuất bản — KHÔNG sửa tay\nvar ANH_V = ' + json.dumps(anh, sort_keys=True, separators=(',', ':')) + ';\n')

ip = os.path.join(D, 'index.html')
h = open(ip, encoding='utf-8').read()
h = re.sub(r'\n?\s*<meta name="tm-ver"[^>]*>', '', h)
h = re.sub(r'\n?\s*<script id="tm-ver">.*?</script>', '', h, flags=re.S)
h = re.sub(r'\n?\s*<script src="js/ver-anh\.js[^"]*"></script>', '', h)


def gan(m):
    attr, path = m.group(1), m.group(2).split('?')[0]
    p = os.path.join(D, path)
    return f'{attr}="{path}?v={bam(p)}"' if os.path.isfile(p) else m.group(0)


h = re.sub(r'(src|href)="((?:js|css)/[^"]+\.(?:js|css)(?:\?[^"]*)?)"', gan, h)
h = re.sub(r'(<script src="js/)', '<script src="js/ver-anh.js?v=' + bam(va) + '"></script>\n  \\1', h, count=1)
V = hashlib.sha1(''.join(re.findall(r'\?v=([0-9a-f]{8})', h)).encode()).hexdigest()[:10]
kt = ('<script id="tm-ver">(function(){var V="%s";try{fetch("ver.json?t="+Date.now(),{cache:"no-store"}).then(function(r){return r.json()})'
      '.then(function(j){if(j&&j.v&&j.v!==V){var k="tm-ver-tai";if(sessionStorage.getItem(k)!==j.v){sessionStorage.setItem(k,j.v);location.reload()}}})'
      '.catch(function(){})}catch(e){}})();</script>') % V
h = h.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  <meta name="tm-ver" content="%s">\n  %s' % (V, kt), 1)
open(ip, 'w', encoding='utf-8').write(h)
json.dump({'v': V}, open(os.path.join(D, 'ver.json'), 'w'))
print('thap-ver:', V, '·', len(anh), 'ảnh ·', len(re.findall(r'\?v=', h)), 'tệp js/css')
