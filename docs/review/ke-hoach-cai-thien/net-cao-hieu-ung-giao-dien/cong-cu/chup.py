"""CHỤP HEADLESS (không chơi thử): nạp trang game, đo lỗi JS, chụp HUD trong trận và vẽ lưới hiệu ứng / giao diện bằng CHÍNH hàm vẽ của game.
  python3 chup.py <thư mục dist> <trang.html> <ra> [nét, vd 2,3,4] [--luoi]
Ra:  <ra>/m844-n<N>.png (cả màn trận 844×390 dpr 3), m1280-n<N>.png, loi.json (lỗi JS từng lần nạp),
     --luoi: luoi-hu-<trang>-n<N>.png (hiệu ứng khung giữa, vẽ bằng G.fxAnh.veK lên canvas cỡ thế giới nét N),
             luoi-gd-<trang>-n<N>.png (ảnh giao diện, vẽ bằng SC.veGd lên canvas cỡ lớp #ui với cùng G.uiScale) — chờ ảnh nét cao tải xong.
Máy chủ http tạm phục vụ <thư mục dist> (bản web cần đường dẫn anh/…)."""
import base64, functools, http.server, io, json, os, socketserver, sys, threading, time
from PIL import Image
from playwright.sync_api import sync_playwright

DIST, TRANG, OUT = sys.argv[1], sys.argv[2], os.path.abspath(sys.argv[3])
os.makedirs(OUT, exist_ok=True)
NETS = [int(x) for x in (sys.argv[4] if len(sys.argv) > 4 and sys.argv[4][0].isdigit() else '2,3,4').split(',')]
LUOI = '--luoi' in sys.argv
GAME = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..', 'game'))
MAN = (('m844', (844, 390), 3), ('m1280', (1280, 720), 1))
if '--chi844' in sys.argv:
    MAN = MAN[:1]

INIT = r'''() => { let s = 12345; Math.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; window.__hat = (n) => { s = n >>> 0; }; }'''
TRAN = r'''() => {
  window.__hat(777); G.time = 0; if (G.fx && G.fx.reset) G.fx.reset();
  G.testSave({ lvl: 12, melee: 'sword' }); G.save.sound = false;
  G.startStage(0, 0, 0, { kind: 'A', seed: 7 });
  const S = G.getRun(), W = S.W, P = W.P; S.fade = 0; S.mode = 'play';
  P.inv = 999; P.x = (W.x0 + W.x1) / 2 - 30; P.y = (W.y0 + W.y1) / 2 + 6;
  for (let i = 0; i < 150 && !(W.ents || []).some((e) => e !== P && e.hp > 0); i++) G.tick();
  const M = (W.ents || []).filter((e) => e !== P && e.hp > 0 && !e.dead).slice(0, 3);
  W.ents.length = 0; M.forEach((m) => W.ents.push(m)); if (W.spawns) W.spawns.length = 0;
  M.forEach((m, i) => { m.x = P.x + 48 + i * 34; m.y = P.y - 18 + i * 18; m.hp = m.maxhp = 1e9; m.cd = 99; m.cdT = 99; });
  G.keys = {}; G.keyP = {}; if (G.pointers) G.pointers.clear();
  for (let i = 0; i < 60; i++) { M.forEach((m, j) => { m.x = P.x + 48 + j * 34; m.y = P.y - 18 + j * 18; m.cd = 99; m.cdT = 99; }); G.tick(); }
  return { net: G.NET, us: G.uiScale };
}'''
# vẽ lưới: mỗi hiệu ứng khung giữa, ô 80×56 điểm game; trả dataURL (canvas cỡ thế giới × nét)
LUOI_HU = r'''async (mas) => {
  const FA = G.fxAnh, n = G.NET, W = 480, H = 270;
  for (const m of mas) FA.co(m);
  for (let t = 0; t < 120; t++) { let ok = true; for (const m of mas) { const a = FA.ds[m]; FA.co(m); if (a && (a.tamN3 || a.tamN4) && n > 2 && !(a.hi && a.hi[n === 3 && a.tamN3 ? 3 : (a.tamN4 ? 4 : 3)] && (a.hi[n === 3 && a.tamN3 ? 3 : (a.tamN4 ? 4 : 3)].ok || a.hi[n === 3 && a.tamN3 ? 3 : (a.tamN4 ? 4 : 3)].hong))) ok = false; if (a && !a.ready) ok = false; } if (ok) break; await new Promise((r) => setTimeout(r, 100)); }
  const cv = document.createElement('canvas'); cv.width = W * n; cv.height = H * n; const c = cv.getContext('2d');
  c.setTransform(n, 0, 0, n, 0, 0); c.fillStyle = '#1c1e2c'; c.fillRect(0, 0, W, H); c.imageSmoothingEnabled = false;
  const ra = [];
  mas.forEach((m, i) => {
    const a = FA.ds[m]; if (!a || !a.ready) { ra.push([m, 'chua']); return; }
    const cx = (i % 6) * 80 + 40, cy = Math.floor(i / 6) * 67 + 40, k = Math.min(1, 74 / a.fw, 60 / a.fh);
    FA.veK(c, m, cx - (a.fw / 2 - a.ax) * k, cy - (a.fh / 2 - a.ay) * k, Math.floor(a.so / 2), 0, k / (a.co || 1));
    ra.push([m, a.net]);
  });
  return { url: cv.toDataURL('image/png'), ra };
}'''
LUOI_GD = r'''async (mas) => {
  const SC = G.spriteCustom, us = G.uiScale, W = 480, H = 270;
  for (let t = 0; t < 120; t++) { let ok = true; for (const m of mas) { const g = SC.gdSan(m); const s = SC.gd[m]; if (!g) ok = ok && !s; else if (G.NET > 2 && s.anhN && g.net < 3) ok = false; } if (ok) break; await new Promise((r) => setTimeout(r, 100)); }
  const cv = document.createElement('canvas'); cv.width = Math.round(W * us); cv.height = Math.round(H * us); const c = cv.getContext('2d');
  const ux0 = G.ux; G.ux = c; // veGd tính độ phóng theo G.uiScale khi vẽ vào lớp #ui
  c.setTransform(us, 0, 0, us, 0, 0); c.fillStyle = '#1c1e2c'; c.fillRect(0, 0, W, H); c.imageSmoothingEnabled = false;
  const ra = [];
  try {
    mas.forEach((m, i) => {
      const g = SC.gdSan(m); if (!g) { ra.push([m, 'chua']); return; }
      const k = Math.min(1, 74 / g.rong, 50 / g.cao), w = g.rong * k, h = g.cao * k;
      const cx = (i % 6) * 80 + 40, cy = Math.floor(i / 6) * 54 + 30;
      SC.veGd(c, g, cx - w / 2, cy - h / 2, w, h); ra.push([m, g.net]);
    });
  } finally { G.ux = ux0; }
  return { url: cv.toDataURL('image/png'), ra };
}'''


def phuc_vu():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=DIST)
    h.log_message = lambda *a, **k: None
    s = socketserver.ThreadingTCPServer(('127.0.0.1', 0), h)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s, s.server_address[1]


def luu(url, p):
    Image.open(io.BytesIO(base64.b64decode(url.split(',', 1)[1]))).save(p)


def main():
    srv, port = phuc_vu()
    mas_hu = json.load(open(os.path.join(OUT, 'mas_hu.json'))) if os.path.exists(os.path.join(OUT, 'mas_hu.json')) else []
    mas_gd = json.load(open(os.path.join(OUT, 'mas_gd.json'))) if os.path.exists(os.path.join(OUT, 'mas_gd.json')) else []
    loi = {}
    with sync_playwright() as p:
        br = p.chromium.launch()
        for ten, (w, h), dpr in MAN:
            for n in NETS:
                ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=dpr)
                pg = ctx.new_page(); L = []
                pg.on('pageerror', lambda e: L.append('pageerror: ' + str(e)))
                pg.on('console', lambda m: L.append('console.' + m.type + ': ' + m.text) if m.type == 'error' else None)
                pg.add_init_script('(' + INIT + ')()')
                q = '?cloud=0' + ('&netcao=%d' % n if n > 2 else '')
                pg.goto('http://127.0.0.1:%d/%s%s' % (port, TRANG, q), wait_until='load')
                pg.wait_for_timeout(1500)
                pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
                pg.wait_for_function('() => window.G && G.spriteCustom && G.art && G.monsterArt && G.testSave', timeout=60000)
                pg.evaluate("() => { const SC = G.spriteCustom; for (const k in SC.ds) SC.canAnh && SC.canAnh(k); for (const k of ['zed-moi','zed-vk']) SC.canAnh && SC.canAnh(k); if (G.fxAnh) for (const k in G.fxAnh.ds) G.fxAnh.co(k); }")
                pg.wait_for_timeout(2500)
                pg.evaluate("() => { G.testSave({ lvl: 12, melee: 'sword' }); G.save.sound = false; G.startStage(0, 0, 0, { kind: 'A', seed: 7 }); }")
                pg.wait_for_function("() => G.getRun && G.getRun() && G.getRun().W", timeout=60000)
                pg.wait_for_timeout(2000)
                info = pg.evaluate(TRAN)
                time.sleep(1.5)
                pg.screenshot(path=os.path.join(OUT, '%s-%s-n%d.png' % (TRANG.split('.')[0], ten, n)))
                if LUOI and ten == 'm844':
                    for nhom, mas, js in (('hu', mas_hu, LUOI_HU), ('gd', mas_gd, LUOI_GD)):
                        for j in range(0, len(mas), 24):
                            r = pg.evaluate(js, mas[j:j + 24])
                            luu(r['url'], os.path.join(OUT, 'luoi-%s-%s-%02d-n%d.png' % (nhom, TRANG.split('.')[0], j // 24, n)))
                            info.setdefault('luoi_' + nhom, []).extend(r['ra'])
                loi['%s %s n%d' % (TRANG, ten, n)] = {'loi': [x for x in L if '/sw.js' not in x], 'info': info}
                print(ten, n, 'lỗi JS:', len(loi['%s %s n%d' % (TRANG, ten, n)]['loi']), info.get('net'), flush=True)
                ctx.close()
        br.close()
    srv.shutdown()
    p_ = os.path.join(OUT, 'loi.json')
    cu = json.load(open(p_)) if os.path.exists(p_) else {}
    cu.update(loi)
    json.dump(cu, open(p_, 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
