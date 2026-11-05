"""Chụp soát headless (KHÔNG chơi thử bằng tay) quái vùng 3–4, 844×390 như iPhone ngang, trên site đã gói (bản web ảnh rời).
  python3 chup34.py <thư mục site> <thư mục ra> <vùng: 3|4>
Ra: tran-<v>-quai[-cu].png (mọi quái thường + tinh anh đứng), tran-<v>-ra-don[-cu].png (đang ra đòn), tran-<v>-trum-nho[-cu].png,
    tran-<v>-trum[-cu].png, tran-<v>-trum-chieu[-cu].png. "-cu" = ?quaipl=0 (hình cũ). In số lỗi trang."""
import os, sys, threading, http.server, functools, time
from playwright.sync_api import sync_playwright
SITE, OUT, VUNG = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2]), int(sys.argv[3])
os.makedirs(OUT, exist_ok=True)
GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..'))
SETUP = os.path.join(GOC, 'game', 'tests', 'setup.js')
QUAI = {3: ['linhMa', 'doiThan', 'tuongDa', 'denLong', 'meoDen', 'huLua', 'tieuYeu', 'nhimThan', 'tuongMa', 'huChua'],
        4: ['raiCa', 'diaTrau', 'baBa', 'cocTia', 'ranNuoc', 'echPhinh', 'maDa', 'traiGai', 'raiCaChua', 'cocChua']}[VUNG]
R = VUNG - 1
LOI = []
H = functools.partial(http.server.SimpleHTTPRequestHandler, directory=SITE)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Q, directory=SITE))
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = 'http://127.0.0.1:%d/' % srv.server_address[1]
VAO0 = r'''(r) => { G.resetSave(); G.save.sound = false; G.keys = {}; G.keyP = {}; G.startStage(r, 1, 0, { seed: 777 }); return 1; }'''
VAO = r'''(r) => { const S = G.getRun(); S.fade = 0; S.mode = 'play';
  G.testGoto('fight'); const W = G.getWorld(); W.waves = []; W.spawns = []; return !!S; }'''
CHO_RUN = '() => { try { const S = G.getRun(); return !!(S && S.map && S.W); } catch (e) { return false; } }'
SACH = r'''() => { const S = G.getRun(), Wd = S.W; S.fade = 0; S.hint = null; for (const k of ['mobs','ents','projs','spawns']) if (Wd[k]) Wd[k].length = 0;
  Wd.waves = []; Wd.waveT = 999; Wd.banner = null; S.P.inv = 99; return true; }'''
DAT = r'''(ids) => { const S = G.getRun(), Wd = S.W, P = S.P; P.x = Wd.x0 + 30; P.y = (Wd.y0 + Wd.y1) / 2; const out = [];
  ids.forEach((id, i) => { const col = i % 5, row = (i / 5) | 0; const e = G.spawnEnemy('rusher', P.x + 70 + col * 62, Wd.y0 + 60 + row * 80);
    e.art = id; e.cd = 99; e.face = -1; e.vx = 0; e.vy = 0; e.spd = 0; e.speed = 0; out.push(e.art); });
  return out; }'''
SAN = r'''(ids) => { const SC = G.spriteCustom; let ok = 0; for (const id of ids) { const s = SC.ds[id]; if (s) { SC.get(s.ma); if (s.ready) ok++; } } return ok; }'''
DUNG = r'''() => { const W = G.getWorld(); for (const e of W.ents) { e.vx = 0; e.vy = 0; } return 1; }'''


def mo(b, co=''):
    ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); pg.on('pageerror', lambda e: LOI.append(co + ': ' + str(e)[:300]))
    pg.goto(URL + 'index.html?cloud=0' + co)
    pg.wait_for_function('() => window.G && G.scene && G.bia', timeout=180000); pg.wait_for_timeout(3000)
    pg.add_script_tag(path=SETUP)
    return ctx, pg


def cho_anh(pg, ids, n=60):
    for _ in range(n):
        if pg.evaluate(SAN, ids) >= len(ids): return True
        pg.wait_for_timeout(500)
    return False


def chay(b, nhan, co):
    ctx, pg = mo(b, co)
    pg.evaluate('(r) => { if (G.spriteCustom.taiVung) G.spriteCustom.taiVung(r); return 1; }', R)
    pg.evaluate(VAO0, R); pg.wait_for_function(CHO_RUN, timeout=120000); pg.evaluate(VAO, R); pg.wait_for_timeout(1500); pg.evaluate(SACH)
    print(nhan, 'quai', pg.evaluate(DAT, QUAI), 'anh san', cho_anh(pg, QUAI))
    pg.evaluate('() => { const S = G.getRun(); S.P.inv = 99; S.hint = null; return 1; }')
    pg.wait_for_timeout(1200)
    pg.screenshot(path=os.path.join(OUT, 'tran-%d-quai%s.png' % (VUNG, nhan)))
    pg.evaluate('() => { const P = G.getRun().P; for (const e of G.getWorld().ents) { e.cd = 0; } return 1; }')
    for i in range(3):
        pg.wait_for_timeout(450)
        pg.screenshot(path=os.path.join(OUT, 'tran-%d-ra-don-%d%s.png' % (VUNG, i, nhan)))
    # trùm nhỏ rồi trùm vùng
    for ten, st in (('trum-nho', 2), ('trum', 4)):
        pg.evaluate('(a) => { G.startStage(a[0], a[1], 0, { seed: 777 }); return 1; }', [R, st])
        pg.wait_for_function(CHO_RUN, timeout=120000)
        pg.evaluate('() => { const S = G.getRun(); S.fade = 0; S.mode = "play"; G.testGoto("boss"); return 1; }')
        pg.wait_for_timeout(2500)
        info = pg.evaluate('''() => { const S = G.getRun(), W = S.W, b = W.boss; if (!b) return null; b.busy = 999; b.cd = 99; b.vx = 0; b.vy = 0; b.intro = null; S.P.inv = 99; W.banner = null; S.hint = null;
          for (const k of Object.keys(W)) if (Array.isArray(W[k]) && /^(ents|projs|haz|hazards|zones|bullets|mobs|spawns|warns|aoes)$/.test(k)) W[k].length = 0;
          S.P.x = b.x - 120; S.P.y = b.y + 4; G.spriteCustom.get(b.art); return [b.art, b.kind, Math.round(b.x), Math.round(b.y)]; }''')
        if info: cho_anh(pg, [info[0]], 40)
        pg.wait_for_timeout(600)
        print(nhan, ten, info)
        pg.screenshot(path=os.path.join(OUT, 'tran-%d-%s%s.png' % (VUNG, ten, nhan)))
        if info:
            pg.evaluate('() => { const b = G.getWorld().boss; b.busy = 0; b.cd = 0; return 1; }')
            for i in range(3):
                pg.wait_for_timeout(500)
                pg.screenshot(path=os.path.join(OUT, 'tran-%d-%s-chieu-%d%s.png' % (VUNG, ten, i, nhan)))
    ctx.close()


with sync_playwright() as p:
    b = p.chromium.launch()
    chay(b, '', '')
    chay(b, '-cu', '&quaipl=0')
    b.close()
srv.shutdown()
print('LỖI TRANG:', LOI or 'không có')
