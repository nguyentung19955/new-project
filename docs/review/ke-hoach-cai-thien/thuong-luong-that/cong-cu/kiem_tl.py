"""Kiểm + ảnh soát Thuồng Luồng thật (headless, bot — KHÔNG chơi tay).
python3 kiem_tl.py            → ../anh/*.png, *.gif, ../so-lieu.json
Mỗi bản (web linh-khi-nhe.html / một tệp linh-khi.html) × (mặc định / ?tlmoi=0):
  1. vào phòng trùm ải 4-5, bot tự đánh ~40 giây trận (máu Cu Tí giữ đầy), ép qua 3 pha rồi hạ trùm (cảnh bỏ trốn) → đếm lỗi JS;
  2. ảnh trận 844×390 mỗi pha (bản web: mặc định = SAU, ?tlmoi=0 = TRƯỚC);
  3. khung từng động tác (đứng / báo đòn + đánh (chiêu Phun nước đen c2, đúng thời lượng thật) / trúng đòn / lặn) vẽ riêng ra canvas → GIF, lưới khung;
  4. đo dính hiệu ứng: hộp thân js/dinh_quai.js (than) so với hộp điểm ảnh vẽ thật, chỗ chớp trúng (caoTrung), chỗ số / biểu tượng (đỉnh đầu).
"""
import os, sys, json, base64, io, time, threading, functools, http.server, socketserver
from PIL import Image
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)
ANH = os.path.join(OUT, 'anh'); os.makedirs(ANH, exist_ok=True)
REPO = os.path.abspath(os.path.join(HERE, '../../../../..'))
GAME = os.path.join(REPO, 'game')
sys.path.insert(0, os.path.join(GAME, 'tests'))
from quai_lib import LIB  # noqa: E402


def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    class S(socketserver.ThreadingMixIn, http.server.HTTPServer):
        daemon_threads = True; allow_reuse_address = True
    s = S(('127.0.0.1', 0), functools.partial(Q, directory=GAME))
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s.server_address[1]


PORT = serve()

JS_VE = r"""
(a) => {
  const [st, p, t] = a, W = G.getWorld(), b = W.boss, TL = G.thuongLuong;
  b.dead = false; b.dying = null; b.hitT = 0; b.flash = 0; b.wind = 0; b.exposed = 0; b.tired = 0; b.st.stun = 0; b.lunge = null; b.invuln = 0;
  b.phase = p; TL.datHe(b, p); b.tl.lan = null; b.tl.troi = null; b.hidden = false; b.illusion = false;
  b.x = W.x1 - TL.CFG.dau.lui; b.y = (W.y0 + W.y1) / 2; b.face = -1;
  if (st === 'idle') b.an = { n: 'idle', t, spd: 1 };
  else if (st === 'c2') b.an = { n: 'c2', t, spd: 1 };
  else if (st === 'hit') { b.an = { n: 'idle', t: 0, spd: 1 }; b.hitT = Math.max(0.001, 0.4 - t); }
  else if (st === 'lan') { b.an = { n: 'idle', t: 0, spd: 1 }; b.tl.lan = { t, y0: b.y, y1: b.y }; b.hidden = true; }
  G.time = 100 + t;
  const cv = document.createElement('canvas'); cv.width = 500; cv.height = 300;
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  c.fillStyle = '#3a4a48'; c.fillRect(0, 0, 500, 300); c.fillStyle = '#2b3836'; c.fillRect(0, 260, 500, 40);
  c.scale(2, 2); c.translate(105 - b.x, 130 - b.y);
  G.fx.dangVe = b; G.art.boss(c, b); G.fx.dangVe = null;
  return cv.toDataURL();
}
"""

JS_DINH = r"""
(p) => {
  const W = G.getWorld(), b = W.boss, TL = G.thuongLuong;
  b.phase = p; TL.datHe(b, p); b.an = { n: 'idle', t: 0.3, spd: 1 }; b.hitT = 0; b.tl.lan = null; b.hidden = false; b.dying = null; b.dead = false;
  b.x = W.x1 - TL.CFG.dau.lui; b.y = (W.y0 + W.y1) / 2; b.face = -1;
  const N = G.NET || 1, cv = document.createElement('canvas'); cv.width = 600 * N; cv.height = 600 * N; const c = cv.getContext('2d');
  c.scale(N, N); c.translate(300 - b.x, 400 - b.y);   // cùng tỉ lệ canvas thế giới (G.NET) để hộp khung vừa vẽ (ghiKhung) đúng
  G.fx.dangVe = b; G.art.boss(c, b); G.fx.dangVe = null;
  const S = 600 * N, d = c.getImageData(0, 0, S, S).data; let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (d[(y * S + x) * 4 + 3] > 128) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  x0 /= N; x1 /= N; y0 /= N; y1 /= N;
  const T = G.dinhQuai.than(b), h = G.dinhQuai.caoTrung(b);
  return { ve: [x0 - 300, x1 - 300, y0 - 400, y1 - 400], than: T ? [T.x0, T.x1, T.y0, T.y1, T.cx] : null, caoTrung: h, moi: !!(TL.anhMoi && TL.anhMoi()) };
}
"""


def mo(pw, tep, extra):
    b = pw.chromium.launch(args=['--disable-gpu'])
    pg = b.new_page(viewport={'width': 844, 'height': 390})
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.on('console', lambda m: errs.append('console.' + m.type + ': ' + m.text) if m.type == 'error' and not ('404' in m.text and 'script' in m.text) and 'Failed to load resource' not in m.text else None)
    pg.goto('http://127.0.0.1:%d/%s?cloud=0%s' % (PORT, tep, extra))
    pg.wait_for_function('window.G && G.scene', timeout=120000)
    pg.wait_for_timeout(500)
    pg.evaluate("window.requestAnimationFrame = () => 0")
    pg.add_script_tag(path=os.path.join(GAME, 'tests', 'bot.js'))
    pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
    pg.evaluate(LIB)
    pg.evaluate("() => { if (G.spriteCustom.taiVung) G.spriteCustom.taiVung(3); }")
    t0 = time.time()
    while time.time() - t0 < 90:
        ok = pg.evaluate("() => ['nguTinh', 'nguTinh-p2', 'nguTinh-p3', 'gd-nen-song-san-tl'].every(k => { const s = G.spriteCustom.ds[k] || (G.spriteCustom.gdSan && G.spriteCustom.gdSan(k)); return !s || s.ready; })"
                         " && (G.TL_MOI === false || !G.spriteCustom.ds.thuongLuong || ['thuongLuong', 'thuongLuong-p2', 'thuongLuong-p3'].every(k => G.spriteCustom.ds[k] && G.spriteCustom.ds[k].ready))")
        if ok: break
        pg.wait_for_timeout(400)
    return b, pg, errs


def tran(pg, chup=None):
    """bot đánh qua 3 pha rồi hạ trùm; chup: tiền tố tên ảnh trận 844×390"""
    pg.evaluate("() => { T.boss(3, true); T.useBot(true); }")
    info = pg.evaluate("() => { const b = G.getWorld().boss; return { kind: b.kind, art: b.art, moi: !!(G.thuongLuong.anhMoi && G.thuongLuong.anhMoi()) }; }")
    anh = []
    for p, hp in ((0, 1.0), (1, 0.6), (2, 0.3)):
        pg.evaluate("(hp) => { const b = G.getWorld().boss; b.hp = Math.min(b.hp, b.maxhp * hp); }", hp)
        for k in range(10):
            pg.evaluate("() => { const S = G.getRun(); T.frame(60); S.P.hp = S.P.maxhp; S.P.dead = false; S.W.over = null; }")
        if chup:
            f = os.path.join(ANH, '%s-pha%d.png' % (chup, p + 1)); pg.screenshot(path=f); anh.append(os.path.basename(f))
    pg.evaluate("() => { const b = G.getWorld().boss; b.hp = 1; }")
    for k in range(8):
        pg.evaluate("() => { const S = G.getRun(); T.frame(60); S.P.hp = S.P.maxhp; S.P.dead = false; S.W.over = null; }")
    ket = pg.evaluate("() => { const W = G.getWorld(), b = W.boss; return { pha: b.phase, chet: !!(b.dead || b.dying != null), tron: !!W.tlTron, loiVe: G.thuongLuong.loiVe ? String(G.thuongLuong.loiVe) : null, terrs: T.errs.slice(0, 5) }; }")
    return dict(info, **ket, anh=anh)


def khung(pg, st, p, ts):
    out = []
    for t in ts:
        u = pg.evaluate(JS_VE, [st, p, t])
        out.append(Image.open(io.BytesIO(base64.b64decode(u.split(',', 1)[1]))).convert('RGB'))
    return out


def main():
    so = {}
    with sync_playwright() as pw:
        for tep, extra, nhan in (('dist/linh-khi-nhe.html', '', 'web'), ('dist/linh-khi-nhe.html', '&tlmoi=0', 'web-tlmoi0'),
                                 ('dist/linh-khi.html', '', 'mot-tep'), ('dist/linh-khi.html', '&tlmoi=0', 'mot-tep-tlmoi0')):
            b, pg, errs = mo(pw, tep, extra)
            r = tran(pg, chup={'web': 'tran-sau', 'web-tlmoi0': 'tran-truoc'}.get(nhan))
            if nhan.startswith('web'):
                pg.evaluate("() => { T.boss(3, true); T.useBot(false); T.frame(2); }")
                r['dinh'] = [pg.evaluate(JS_DINH, p) for p in range(3)]
                Dc2 = pg.evaluate("() => G.monsterArt.dur('nguTinh', 'c2')")
                gif = {}
                for p in range(3):
                    for st, ts in (('idle', [i * 0.1 for i in range(16)]), ('c2', [i * Dc2 / 30 for i in range(31)]),
                                   ('hit', [i * 0.4 / 8 for i in range(9)]), ('lan', [i / 20 for i in range(21)])):
                        fr = khung(pg, st, p, ts)
                        ten = '%s-pha%d-%s' % ('sau' if nhan == 'web' else 'truoc', p + 1, {'idle': 'dung', 'c2': 'bao-don-danh', 'hit': 'trung-don', 'lan': 'lan'}[st])
                        fr[0].save(os.path.join(ANH, 'gif', ten + '.gif'), save_all=True, append_images=fr[1:], optimize=True, duration=int(1000 * (ts[1] - ts[0])), loop=0) if os.makedirs(os.path.join(ANH, 'gif'), exist_ok=True) is None else None
                        gif[ten] = len(fr)
                r['gif'] = gif
            r['loi_js'] = errs
            so[nhan] = r
            print(nhan, json.dumps({k: v for k, v in r.items() if k not in ('gif',)}, ensure_ascii=False)[:900], flush=True)
            b.close()
    json.dump(so, open(os.path.join(OUT, 'so-lieu.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
