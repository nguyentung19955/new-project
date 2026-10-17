#!/usr/bin/env python3
"""So điểm ảnh 30 cảnh tiêu biểu giữa hai bản đóng gói (dung-luong-17-10). Chạy headless, KHÔNG chơi tay.

  python3 so_canh.py chup <tệp html hoặc thư mục dist (bản web)> <thư mục ra> [cờ, vd "&hangcu=1"] [số cảnh, vd 2,11,30]
  python3 so_canh.py so <thư mục ảnh A> <thư mục ảnh B>

Đồng hồ giả (performance.now, Date, requestAnimationFrame) + số ngẫu nhiên có hạt giống: hai bản chạy đúng cùng một chuỗi khung hình,
nên mọi khác biệt điểm ảnh là do bản đóng gói. Chờ mọi ảnh đã tải / giải mã xong rồi mới chụp (bản web: tải hết ảnh mọi vùng trước).
Chụp ô #stage (canvas game + lớp giao diện) bằng ảnh chụp màn hình, cỡ 992×540, tỉ lệ điểm ảnh 1,5."""
import functools
import http.server
import io
import json
import os
import sys
import threading

GAME = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..', 'game')
GAME = os.path.normpath(GAME)

INIT = r"""
(() => {
  let now = 1000; const q = [];
  window.__vt = { step(ms) { now += ms; const cbs = q.splice(0); for (const cb of cbs) { try { cb(now); } catch (e) { console.error(e); } } }, get now() { return now; } };
  performance.now = () => now;
  const D = Date, d0 = 1792400000000; // 17/10/2026
  class FD extends D { constructor(...a) { if (a.length) super(...a); else super(d0 + now); } static now() { return d0 + now; } }
  window.Date = FD;
  window.requestAnimationFrame = (cb) => { q.push(cb); return q.length; };
  window.__seed = (s) => { s = s >>> 0 || 1; Math.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  window.__seed(12345);
  const I = window.Image; window.__imgs = [];
  function TI(w, h) { const im = arguments.length ? new I(w, h) : new I(); window.__imgs.push(im); return im; }
  TI.prototype = I.prototype; window.Image = TI;
  try { localStorage.clear(); } catch (e) {}
})();
"""

HELP = r"""
window.T = {
  sc: null,
  freeze() { if (!T.sc) { const sc = G.StageScene; T.sc = sc; G.scene = { update() {}, draw() { sc.draw(); }, hide() {} }; } },
  thaw() { if (T.sc) { G.scene = T.sc; T.sc = null; } },
  rng(seed) { window.__seed(seed); G.rnd = Math.random; },
  save(o) {
    G.testSave(Object.assign({ lvl: 30, tier: 2, sharpen: 4, branch: 'fire', marks: 140, gold: 5000 }, o || {}));
    const sv = G.save; sv.stars = sv.stars || {};
    for (let r = 0; r < (G.REGIONS || []).length; r++) for (let i = 0; i < 5; i++) sv.stars[r + '-' + i] = 3;
    return sv;
  },
  start(r, i, seed, o) {
    T.thaw(); T.rng(seed * 13 + 5);
    T.save(o);
    G.startStage(r, i, 0, { kind: 'A', seed });
    const S = G.getRun(); S.fade = 0; return S;
  },
  fight(n, maxTicks) {
    const S = G.getRun();
    for (let k = 0; k < (maxTicks || 600); k++) {
      G.sim(1);
      if (S.mode !== 'play') break;
      const W = S.W, P = S.P;
      if (W.ents.length >= n && P.atkT > 0 && P.atkT < P.atkDur * 0.6) break;
    }
    S.P.hp = Math.max(S.P.hp, Math.round(S.P.maxhp * 0.8));
    T.freeze();
  },
  village(k, tab) {
    T.thaw(); T.rng(77); T.save();
    G.setScene(G.Village);
    const A = G.villageApi;
    if (k === 'title') A.V.tab = 'title'; else if (k === 'hub') A.goHub(); else { A.goHub(); A.open(k); if (tab) A.V.tab = tab; }
  },
};
"""

CANH = [
    ('01-man-chao', "T.village('title')"),
    ('02-lang', "T.village('hub')"),
    ('03-lang-ban-do', "T.village('lai')"),
    ('04-lang-lo-ren', "T.village('ren')"),
    ('05-lang-hang-xen', "T.village('xen')"),
    ('06-lang-may', "T.village('may')"),
    ('07-lang-ong-do', "T.village('do')"),
    ('08-lang-ong-tu', "T.village('tu')"),
    ('09-lang-anh-mo', "T.village('mo')"),
    ('10-lang-so-yeu-quai', "T.village('tu', 'so')"),
]
for r, ten in enumerate(('rung', 'bien', 'laudai', 'song')):
    CANH.append(('%02d-%s-phong-quai' % (11 + r * 4, ten), "T.start(%d, 1, 3); G.testGoto('fight'); G.getRun().fade = 0; T.fight(2, 500)" % r))
    CANH.append(('%02d-%s-tinh-anh' % (12 + r * 4, ten), "T.start(%d, 2, 4); G.testGoto('elite'); G.getRun().fade = 0; T.fight(1, 400)" % r))
    CANH.append(('%02d-%s-trum-nho' % (13 + r * 4, ten), "T.start(%d, 2, 5); G.testGoto('boss'); G.getRun().fade = 0; G.sim(150); T.freeze()" % r))
    CANH.append(('%02d-%s-trum-vung' % (14 + r * 4, ten), "T.start(%d, 4, 6); G.testGoto('boss'); G.getRun().fade = 0; G.sim(180); T.freeze()" % r))
CANH += [
    ('27-ai-ban-do', "T.start(0, 1, 7); G.sim(30); G.getRun().mode = 'map'; T.freeze()"),
    ('28-ai-tam-dung', "T.start(1, 1, 8); G.sim(30); G.getRun().mode = 'paused'; T.freeze()"),
    ('29-ai-tui-do', "T.start(2, 1, 9); G.sim(30); G.getRun().mode = 'bag'; T.freeze()"),
    ('30-thuong-danh', "T.start(0, 1, 10, { melee: 'spear' }); G.testGoto('fight'); G.getRun().fade = 0; T.fight(1, 500)"),
]


def phuc_vu(thu):
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=thu)
    h.log_message = lambda *a: None
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), h)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s


def chup(nguon, ra, co='', chon=None):
    canh = [c for c in CANH if not chon or int(c[0][:2]) in chon]
    from playwright.sync_api import sync_playwright
    os.makedirs(ra, exist_ok=True)
    web = os.path.isdir(nguon)
    srv = None
    if web:
        srv = phuc_vu(nguon)
        url = 'http://127.0.0.1:%d/linh-khi-nhe.html?cloud=0' % srv.server_address[1] + co
    else:
        url = 'file://' + os.path.abspath(nguon) + '?cloud=0' + co
    loi = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 992, 'height': 540}, device_scale_factor=1.5)
        pg.on('pageerror', lambda e: loi.append('pageerror: ' + str(e)))
        pg.on('console', lambda m: loi.append('console.error: ' + m.text) if m.type == 'error' else None)
        pg.add_init_script(INIT)
        pg.goto(url)
        pg.wait_for_function('window.G && G.scene && G.Village')
        for _ in range(5):
            pg.evaluate('__vt.step(1000/60)')
        pg.add_script_tag(path=os.path.join(GAME, 'tests', 'bot.js'))
        pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
        pg.evaluate(HELP)

        def cho_anh():
            for _ in range(600):
                ok = pg.evaluate("""() => { const SC = G.spriteCustom, R = SC && SC.roi;
                  if (R && (R.hang() || R.dang())) { if (SC.taiVung) for (let r = 0; r < (G.REGIONS || []).length; r++) SC.taiVung(r); return false; }
                  return window.__imgs.every((i) => i.complete); }""")
                if ok:
                    return
                pg.wait_for_timeout(100)  # chờ thật, KHÔNG chạy thêm khung (số khung phải như nhau ở mọi lần chụp)
            loi.append('chờ ảnh quá lâu')

        cho_anh()
        for ten, js in canh:
            pg.evaluate('() => { ' + js + ' }')
            for _ in range(3):
                pg.evaluate('__vt.step(1000/60)')
            cho_anh()
            for _ in range(20):
                pg.evaluate('__vt.step(1000/60)')
            cho_anh()
            box = pg.evaluate("(() => { const r = document.getElementById('stage').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; })()")
            pg.screenshot(path=os.path.join(ra, ten + '.png'), clip={'x': box[0], 'y': box[1], 'width': box[2], 'height': box[3]})
        b.close()
    if srv:
        srv.shutdown()
    json.dump(loi, open(os.path.join(ra, 'loi.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    mang = [x for x in loi if 'ERR_TUNNEL' in x or '(404) was received when fetching the script' in x]  # phông Google (không có mạng ngoài) / sw.js (chỉ có khi đăng web)
    print('%s%s: %d cảnh, %d lỗi JS (không tính %d lỗi mạng: phông chữ ngoài, sw.js)' % (nguon, co, len(canh), len(loi) - len(mang), len(mang)))
    for x in [x for x in loi if x not in mang][:20]:
        print('  ', x[:300])


def so(a, b):
    from PIL import Image, ImageChops
    kq, khac = [], 0
    for ten, _ in CANH:
        if not os.path.isfile(os.path.join(a, ten + '.png')):
            continue
        x = Image.open(os.path.join(a, ten + '.png')).convert('RGBA')
        y = Image.open(os.path.join(b, ten + '.png')).convert('RGBA')
        n = 0 if x.size == y.size and x.tobytes() == y.tobytes() else (sum(1 for v in ImageChops.difference(x, y).convert('L').getdata() if v) if x.size == y.size else -1)
        khac += 1 if n else 0
        kq.append((ten, n))
        print('%-28s %s' % (ten, 'y hệt' if n == 0 else ('KHÁC %d điểm' % n)))
    print('Tổng: %d/%d cảnh y hệt' % (len(kq) - khac, len(kq)))
    return khac


if __name__ == '__main__':
    if sys.argv[1] == 'chup':
        chup(sys.argv[2], sys.argv[3], sys.argv[4] if len(sys.argv) > 4 else '', [int(x) for x in sys.argv[5].split(',')] if len(sys.argv) > 5 else None)
    else:
        sys.exit(1 if so(sys.argv[2], sys.argv[3]) else 0)
