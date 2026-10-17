#!/usr/bin/env python3
"""Dựng các file phụ của prototype Lam 3/4.
  python3 build.py nen     → nen.js   (nền Làng Chuông 480×270 ghép 3 lớp, dạng data URI; dùng trong proto.html)
  python3 build.py         → proto.build.html (một file: proto.html + vendor/three.min.js + nen.js nhúng thẳng)
Không đụng gì ngoài thư mục proto-lam/.
"""
import base64, io, os, re, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
NEN = os.path.join(ROOT, 'art', 'nen', 'lang-chuong', 'game')


def ghep_nen():
    """Ghép xa (480×270) + giữa + gần (640×360, căn giữa lệch −80,−45) thành một cảnh 480×270."""
    xa = Image.open(os.path.join(NEN, 'xa.png')).convert('RGBA')
    giua = Image.open(os.path.join(NEN, 'giua.png')).convert('RGBA')
    gan = Image.open(os.path.join(NEN, 'gan.png')).convert('RGBA')
    out = xa.copy()
    out.alpha_composite(giua, dest=(0, 0), source=(80, 45, 560, 315))
    out.alpha_composite(gan, dest=(0, 0), source=(80, 45, 560, 315))
    return out.convert('RGB')


def data_uri(im):
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()


def lam_nen_js():
    im = ghep_nen()
    js = '// Nền Làng Chuông 480×270 (ghép từ art/nen/lang-chuong/game/*.png bằng build.py nen) – mặt lối đi y≈241\n'
    js += 'window.NEN_LANG_CHUONG = "%s";\n' % data_uri(im)
    with open(os.path.join(HERE, 'nen.js'), 'w') as f:
        f.write(js)
    print('nen.js', im.size, len(js) // 1024, 'KB')


def build_html():
    html = open(os.path.join(HERE, 'proto.html'), encoding='utf-8').read()

    def inline(m):
        src = m.group(1)
        code = open(os.path.join(HERE, src), encoding='utf-8').read()
        code = code.replace('</script>', '<\\/script>')
        return '<script>/* %s */\n%s\n</script>' % (src, code)
    out = re.sub(r'<script src="([^"]+)"></script>', inline, html)
    out = out.replace('<!--BUILD-->', '<!-- bản build một file: python3 build.py -->')
    with open(os.path.join(HERE, 'proto.build.html'), 'w', encoding='utf-8') as f:
        f.write(out)
    print('proto.build.html', len(out) // 1024, 'KB')
    if '--artifact' in sys.argv:   # bản cho Artifact claude.ai: bỏ khung doctype/html/head/body (trang được bọc sẵn khi publish)
        p = sys.argv[sys.argv.index('--artifact') + 1]
        a = re.sub(r'^.*?<head>\s*<meta charset="utf-8">\s*<meta name="viewport"[^>]*>\s*', '', out, count=1, flags=re.S)
        a = a.replace('</head>\n<body>', '').replace('</body>\n</html>', '')
        with open(p, 'w', encoding='utf-8') as f:
            f.write(a)
        print(p, len(a) // 1024, 'KB')


if __name__ == '__main__':
    if 'nen' in sys.argv[1:]:
        lam_nen_js()
    else:
        build_html()
