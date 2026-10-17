"""Mở game (bản một tệp dist/linh-khi.html, ?cloud=0) trong Chromium không màn hình, nạp công cụ đo. Dùng chung cho do.py / gif.py."""
import os, json, base64, io, time
from playwright.sync_api import sync_playwright
DAY = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(DAY, '../../../../..'))
GAME = os.path.join(ROOT, 'game')
def mo(p, them='', w=844, h=390, dpr=2):
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--allow-file-access-from-files'])
    g = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=dpr)
    g.route('http*://**', lambda r: r.abort())
    loi = []
    g.on('pageerror', lambda e: loi.append(str(e)))
    g.goto('file://' + GAME + '/dist/linh-khi.html?cloud=0' + them)
    g.wait_for_function("window.G && G.scene && G.fxAnh && G.fxAnh.co('hu-chem-luot-fire') && G.spriteCustom && G.spriteCustom.get('heoCon')", timeout=120000)
    g.wait_for_timeout(1500)
    for f in ('bot.js', 'setup.js', 'au_lib.js'):
        g.add_script_tag(path=os.path.join(GAME, 'tests', f))
    g.add_script_tag(path=os.path.join(DAY, 'do_he.js'))
    # ảnh tải lười: chạm hết các ảnh hu-* để chắc đã sẵn sàng
    g.evaluate("() => { for (const k in G.fxAnh.ds) G.fxAnh.co(k); }")
    g.wait_for_function("() => Object.values(G.fxAnh.ds).every(a => a.ready)", timeout=60000)
    return b, g, loi
def anh(urls):
    from PIL import Image
    return [Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGB') for u in urls]
