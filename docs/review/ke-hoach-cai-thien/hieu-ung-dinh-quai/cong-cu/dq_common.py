"""Phần chung cho các bài đo hiệu ứng dính quái: mở game/dist/linh-khi.html qua http.server, nạp công cụ, chờ ảnh."""
import os, sys, time, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', '..'))
GAME = os.path.join(REPO, 'game')
sys.path.insert(0, os.path.join(GAME, 'tests'))
from quai_lib import LIB  # noqa: E402  (T.room, T.boss, T.frame...)

_port = None


def serve():
    global _port
    if _port: return _port
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=GAME)

    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    h = functools.partial(Q, directory=GAME)

    class S(socketserver.ThreadingMixIn, http.server.HTTPServer):
        daemon_threads = True
        allow_reuse_address = True
    s = S(('127.0.0.1', 0), h)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    _port = s.server_address[1]
    return _port


def open_game(pw, extra='', w=960, h=540, tep='dist/linh-khi.html'):
    port = serve()
    b = pw.chromium.launch(args=['--disable-gpu'])
    pg = b.new_page(viewport={'width': w, 'height': h})
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.goto('http://127.0.0.1:%d/%s?cloud=0%s' % (port, tep, extra))
    pg.wait_for_function('window.G && G.scene', timeout=120000)
    pg.wait_for_timeout(500)
    pg.evaluate("window.requestAnimationFrame = () => 0")
    pg.add_script_tag(path=os.path.join(GAME, 'tests', 'bot.js'))
    pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
    pg.evaluate(LIB)
    pg.add_script_tag(path=os.path.join(HERE, 'dq_lib.js'))
    # tải ảnh mọi vùng (quái, trùm, dáng pha) + mọi ảnh hiệu ứng
    pg.evaluate("() => { for (let r = 0; r < G.REGIONS.length; r++) G.spriteCustom.taiVung(r); DQ.loaded(); }")
    t0 = time.time()
    while time.time() - t0 < 180:
        x = pg.evaluate("() => { const v = G.REGIONS.map((_, r) => G.spriteCustom.vungTien(r, true).san).every(Boolean); return [v].concat(DQ.loaded()); }")
        if x[0] and x[1] >= x[2]: break
        if x[0] and time.time() - t0 > 8 and pg.evaluate("() => G.monsterArt.list.every(q => !G.spriteCustom.has(q.id) || G.spriteCustom.get(q.id))"): break
        pg.wait_for_timeout(500)
    thieu = pg.evaluate("() => Object.keys(G.fxAnh.ds).filter(k => !G.fxAnh.co(k)).concat(G.monsterArt.list.filter(q => G.spriteCustom.has(q.id) && !G.spriteCustom.get(q.id)).map(q => q.id))")
    if thieu: print('chưa tải:', thieu, flush=True)
    print('ảnh:', x, '%.1fs' % (time.time() - t0), flush=True)
    return b, pg, errs
