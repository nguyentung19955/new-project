#!/usr/bin/env python3
"""Dán PHIÊN BẢN (băm nội dung) vào bản thap/ sắp xuất bản → điện thoại không chạy JS/ảnh cũ trong bộ đệm.

  python3 tools/thap-ver.py <thư mục thap của bản xuất bản>      # vd: /tmp/pub/thap

Chỉ chạy trên BẢN XUẤT BẢN (nhánh claude/mobile-tower-defense-game-k5oxzo), KHÔNG chạy trên claude/demo-hop-tuong
(index.html ở nhánh làm việc giữ nguyên → các phiên song song không xung đột). Chạy lại nhiều lần vẫn đúng.
 · index.html: <script src="js/x.js?v=băm"> / <link href="css/x.css?v=băm"> (băm 8 ký tự từng tệp)
 · js/ver-anh.js: ANH_V = { 'quai_bo_side_8': 'băm', … } → REN.taiAnh tải 'assets/<tên>.png?v=băm'
 · ver.json {v}: + đoạn kiểm tra ở đầu index.html (fetch no-store) — bản trang đang mở cũ hơn bản trên máy chủ → tải lại 1 lần
   (KHÔNG tải lại khi đã vào sảnh/trận online: ONL.code / ONS.on — tải lại giữa sảnh làm mất người nghe của chủ phòng)
"""
import hashlib, json, os, re, sys

D = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else 'thap')
bam = lambda p: hashlib.sha1(open(p, 'rb').read()).hexdigest()[:8]


def _webp(a):
    p, h, kho = a
    c = os.path.join(kho, h + '.webp')
    if os.path.isfile(c):
        b = open(c, 'rb').read()
    else:
        import io
        from PIL import Image
        im = Image.open(p); im.load()
        if im.mode not in ('RGB', 'RGBA'): im = im.convert('RGBA')
        o = io.BytesIO(); im.save(o, 'WEBP', quality=90, method=6, alpha_quality=100, exact=False); b = o.getvalue()
        open(c, 'wb').write(b)
    return b if len(b) <= 0.6 * os.path.getsize(p) else None

A = os.path.join(D, 'assets')
anh = {}
for goc, _, ds in os.walk(A):
    for f in ds:
        if f.endswith(('.png', '.jpg')):
            p = os.path.join(goc, f)
            k = os.path.relpath(p, os.path.join(D, 'assets'))[:-4].replace(os.sep, '/')
            if f.endswith('.png') or k not in anh: anh[k] = bam(p)

# ---- KHỞI ĐỘNG NHANH: bản .webp chất lượng cao (q90, alpha không mất mát, CÙNG số điểm ảnh → giữ luật ≥ 3× của QUY-TAC-HINH)
# cho ảnh PNG ≥ 30 KB nếu nhỏ hơn ≤ 60 %. Chỉ sinh trong BẢN XUẤT BẢN (nhánh làm việc giữ PNG gốc). PNG vẫn còn (dự phòng).
# Bộ đệm ~/.cache/thap-webp/<băm png>.webp → xuất bản lần sau nhanh. Tắt: THAP_WEBP=0.
W = {}
if os.environ.get('THAP_WEBP', '1') != '0':
    from concurrent.futures import ProcessPoolExecutor
    KHO = os.path.expanduser('~/.cache/thap-webp'); os.makedirs(KHO, exist_ok=True)
    viec = [(t, os.path.join(A, t + '.png'), anh[t]) for t in anh
            if not t.startswith('fonts/') and os.path.isfile(os.path.join(A, t + '.png')) and os.path.getsize(os.path.join(A, t + '.png')) >= 30000]
    with ProcessPoolExecutor() as ex:
        for t, kq in zip([v[0] for v in viec], ex.map(_webp, [(v[1], v[2], KHO) for v in viec], chunksize=4)):
            if kq:
                open(os.path.join(A, t + '.webp'), 'wb').write(kq)
                W[t] = hashlib.sha1(kq).hexdigest()[:8]
# số byte từng ảnh (thanh % theo byte của màn tải)
B = {}
for goc, _, ds in os.walk(A):
    for f in ds:
        if f.endswith(('.png', '.jpg', '.jpeg', '.webp', '.json')):
            p = os.path.join(goc, f); B['assets/' + os.path.relpath(p, A).replace(os.sep, '/')] = os.path.getsize(p)
va = os.path.join(D, 'js/ver-anh.js')
open(va, 'w').write('// tự sinh bởi tools/thap-ver.py lúc xuất bản — KHÔNG sửa tay\nvar ANH_V = ' + json.dumps(anh, sort_keys=True, separators=(',', ':')) + ';\n'
                    + 'var ANH_W = ' + json.dumps(W, sort_keys=True, separators=(',', ':')) + ';\n'
                    + 'var ANH_B = ' + json.dumps(B, sort_keys=True, separators=(',', ':')) + ';\n')


def doiW(txt):
    """assets/X.png (CSS url, src= trong html, chuỗi trọn vẹn 'assets/X.png' trong js) → assets/X.webp?v=băm nếu có bản webp"""
    def f(m):
        t = m.group(2)
        return m.group(1) + 'assets/' + t + '.webp?v=' + W[t] if t in W else m.group(0)
    return re.sub(r'((?:\.\./)?)assets/([\w\-/]+)\.png(?:\?v=[0-9a-f]+)?', f, txt)


if W:
    for goc, _, ds in os.walk(os.path.join(D, 'css')):
        for f in ds:
            if f.endswith('.css'):
                p = os.path.join(goc, f); t = open(p, encoding='utf-8').read(); t2 = doiW(t)
                if t2 != t: open(p, 'w', encoding='utf-8').write(t2)
    for goc, _, ds in os.walk(os.path.join(D, 'js')):
        for f in ds:
            if f.endswith('.js') and f not in ('ver-anh.js',):
                p = os.path.join(goc, f); t = open(p, encoding='utf-8').read()
                t2 = re.sub(r"""(['"])assets/([\w\-/]+)\.png\1""", lambda m: m.group(1) + 'assets/' + m.group(2) + '.webp?v=' + W[m.group(2)] + m.group(1) if m.group(2) in W else m.group(0), t)
                if t2 != t: open(p, 'w', encoding='utf-8').write(t2)

# CSS: url(../assets/x.png) → url(../assets/x.png?v=băm) (ảnh cắt lại cỡ khác + border-image slice đổi theo → không được dùng ảnh cũ)
def css_v(m):
    p = os.path.normpath(os.path.join(D, 'css', m.group(1)))
    return 'url(%s%s?v=%s)' % (m.group(1), '', bam(p)) if os.path.isfile(p) else m.group(0)
for f in os.listdir(os.path.join(D, 'css')):
    if f.endswith('.css'):
        cp = os.path.join(D, 'css', f); c = open(cp, encoding='utf-8').read()
        c2 = re.sub(r'url\(["\']?(\.\./assets/[^"\')?]+\.(?:png|jpg))(?:\?v=[0-9a-f]+)?["\']?\)', css_v, c)
        if c2 != c: open(cp, 'w', encoding='utf-8').write(c2)

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
h = re.sub(r'(src)="((?:assets)/[^"]+\.(?:png|jpg)(?:\?[^"]*)?)"', gan, h)  # ảnh tĩnh trong index.html
h = re.sub(r'(<(?:script|link)[^>]*?(?:src|href)="((?:js|css)/[^"?]+)[^"]*")(?: data-b="\d+")?', lambda m: m.group(1) + (' data-b="%d"' % os.path.getsize(os.path.join(D, m.group(2))) if os.path.isfile(os.path.join(D, m.group(2))) else ''), h)
if W: h = doiW(h)
h = re.sub(r'(<script src="js/)', '<script src="js/ver-anh.js?v=' + bam(va) + '"></script>\n  \\1', h, count=1)
V = hashlib.sha1(''.join(re.findall(r'\?v=([0-9a-f]{8})', h)).encode()).hexdigest()[:10]
kt = ('<script id="tm-ver">(function(){var V="%s";try{fetch("ver.json?t="+Date.now(),{cache:"no-store"}).then(function(r){return r.json()})'
      '.then(function(j){if(j&&j.v&&j.v!==V){if(typeof ONL!=="undefined"&&ONL.code||typeof ONS!=="undefined"&&ONS.on)return;var k="tm-ver-tai";if(sessionStorage.getItem(k)!==j.v){sessionStorage.setItem(k,j.v);location.reload()}}})'
      '.catch(function(){})}catch(e){}})();</script>') % V
# kiểm bản mới: KHÔNG còn chạy ngay đầu trang (từng tải lại giữa màn tải) — taitai.js TAI.ktVer() đọc meta tm-ver SAU khi HOME hiện,
# chỉ nạp lại khi người chơi đứng ở HOME
h = h.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  <meta name="tm-ver" content="%s">' % V, 1)
open(ip, 'w', encoding='utf-8').write(h)
json.dump({'v': V}, open(os.path.join(D, 'ver.json'), 'w'))
print('thap-ver:', V, '·', len(anh), 'ảnh ·', len(W), 'webp ·', len(re.findall(r'\?v=', h)), 'tệp js/css')
