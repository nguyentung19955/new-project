"""Chụp soát headless (KHÔNG chơi thử bằng tay): dựng cảnh bằng lệnh, 844×390 như iPhone ngang, ?cloud=0.
  python3 chup.py <địa chỉ trang: http://localhost:8765/index.html (site của cổng kiểm phục vụ qua http — file:// làm ảnh bị 'tainted', game báo lỗi sẵn có ở js/mobs.js ttQuai)> <thư mục ra> [vùng ...]   (vùng: 0 = Rừng Gai, 1 = Hang Chìm; mặc định 0)
Mỗi vùng, bản mới và bản "-cu" (?quaipl=0, hình cũ):
  v<vùng>-1-quai[-cu].png    mọi quái thường + 2 tinh anh của vùng đứng yên
  v<vùng>-2-ra-don-<k>[-cu].png  cùng đám quái đang ra đòn (báo đòn, đánh, hiệu ứng)
  v<vùng>-3-trum-<chiêu>[-cu].png  trùm vùng ra từng chiêu (G.bossDebug), v<vùng>-4-trum-nho-<chiêu>[-cu].png trùm nhỏ (vùng 1)
In ra danh sách lỗi trang (pageerror) — phải rỗng."""
import os, sys
from playwright.sync_api import sync_playwright
HTML = sys.argv[1] if sys.argv[1].startswith('http') else 'file://' + os.path.abspath(sys.argv[1]); OUT = os.path.abspath(sys.argv[2]); os.makedirs(OUT, exist_ok=True)
VUNG = [int(x) for x in sys.argv[3:]] or [0]
GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..'))
SETUP = os.path.join(GOC, 'game', 'tests', 'setup.js')
LOI = []
VAO0 = r'''([r, i]) => { G.resetSave(); G.save.sound = false; G.keys = {}; G.keyP = {}; G.startStage(r, i, 0); return 1; }'''
VAO1 = r'''() => { const S = G.getRun(); S.fade = 0; S.mode = 'play'; S.P.inv = 99; S.P.maxhp = 99999; S.P.hp = 99999; return S.r; }'''
SACH = r'''() => { const S = G.getRun(), Wd = S.W; S.fade = 0; S.hint = null; for (const k of ['mobs','ents','projs','spawns']) if (Wd[k]) Wd[k].length = 0;
  Wd.waves = []; Wd.waveT = 999; Wd.banner = null; S.P.inv = 99; return true; }'''
QUAI = r'''(r) => { const S = G.getRun(), Wd = S.W, P = S.P; P.x = Wd.x0 + 30; P.y = (Wd.y0 + Wd.y1) / 2;
  const M = G.MOB_ART, ds = [];
  const vai = ['rusher', 'swarm', 'shield', 'archer', 'nimble', 'kami', 'bomber', 'spiky'];
  const h = (Wd.y1 - Wd.y0);
  vai.forEach((v, k) => { const e = G.spawnEnemy(v, P.x + 90 + (k % 4) * 62, Wd.y0 + h * (k < 4 ? 0.3 : 0.62)); ds.push(e); });
  M.elite[r].forEach((a, k) => { const e = G.spawnEnemy('elite', P.x + 345, Wd.y0 + h * (0.28 + k * 0.42), { art: a }); ds.push(e); });
  for (const e of ds) { e.cd = 99; e.face = -1; e.skCd = 99; }
  return ds.map((e) => e.art + (G.quaiPl && G.quaiPl.tamMoi && G.quaiPl.tamMoi(e.art) ? '*' : '')); }'''
DANH = r'''() => { const P = G.getRun().P; P.maxhp = Math.max(P.maxhp || 0, 99999); P.hp = P.maxhp; for (const e of G.getRun().W.ents) { e.cd = 0; e.skCd = e.role === 'elite' ? 0 : e.skCd; } G.getRun().P.inv = 99; return 1; }'''
TRUM = r'''() => { const S = G.getRun(), Wd = S.W, b = Wd.boss; if (!b) return null; b.cd = 99; b.vx = 0; b.vy = 0; S.P.inv = 99; Wd.banner = null; S.hint = null;
  S.P.x = b.x - 110; S.P.y = b.y + 4; S.P.maxhp = Math.max(S.P.maxhp || 0, 99999); S.P.hp = S.P.maxhp; return [b.art, b.kind, !!(G.quaiPl && G.quaiPl.tamMoi && G.quaiPl.tamMoi(b.art))]; }'''


def mo(b, co=''):
    ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); pg.on('pageerror', lambda e: LOI.append(str(e)))
    pg.goto(HTML + '?cloud=0' + co)
    pg.wait_for_function('() => window.G && G.scene && G.bia', timeout=180000); pg.wait_for_timeout(4000)
    pg.add_script_tag(path=SETUP)
    return ctx, pg


def vao(pg, r, i):
    pg.evaluate(VAO0, [r, i])
    pg.wait_for_function('([r, i]) => { const S = G.getRun && G.getRun(); return !!(S && S.W && S.r === r && S.i === i); }', arg=[r, i], timeout=180000)
    pg.evaluate(VAO1)


def cho_anh(pg):
    pg.wait_for_function('() => !G.spriteCustom || !G.spriteCustom.sauChiBao || !G.spriteCustom.sauChiBao() || !G.spriteCustom.sauChiBao().pct', timeout=120000)
    pg.wait_for_timeout(2500)


def chay(b, r, nhan, co):
    ctx, pg = mo(b, co)
    vao(pg, r, 1); pg.wait_for_timeout(1500); cho_anh(pg); pg.evaluate(SACH)
    print(nhan, 'vung', r, 'quai', pg.evaluate(QUAI, r))
    pg.wait_for_timeout(2500)
    pg.screenshot(path=os.path.join(OUT, 'v%d-1-quai%s.png' % (r, nhan)))
    pg.evaluate(DANH)
    for k in range(5):
        pg.wait_for_timeout(300)
        pg.screenshot(path=os.path.join(OUT, 'v%d-2-ra-don-%d%s.png' % (r, k, nhan)))
    for i, chieu, ten in ((4, ['c1', 'c2', 'c3', 'c4', 'c5'], 'trum'), (2, ['atk', 'chieu1', 'chieu2'], 'trum-nho')):
        if ten == 'trum-nho' and r == 0:
            continue  # trùm nhỏ vùng 1 (Nấm Chúa → Toadstool King) là việc của phiên pixellab-quai-nam
        vao(pg, r, i); pg.wait_for_timeout(800); cho_anh(pg)
        n = pg.evaluate('() => { const S = G.getRun(); const k = S.map.rooms.findIndex((x) => x && x.type === "boss"); return k; }')
        pg.evaluate('(n) => { G.gotoRoom(n); const S = G.getRun(); S.fade = 0; S.mode = "play"; S.trans = null; return 1; }', n)
        pg.evaluate('() => { const P = G.getRun().P; P.inv = 99; P.hp = P.maxhp; return 1; }')
        pg.wait_for_timeout(3500); cho_anh(pg)
        print(nhan, ten, pg.evaluate(TRUM))
        pg.screenshot(path=os.path.join(OUT, 'v%d-3-%s-dung%s.png' % (r, ten, nhan)))
        for c in chieu:
            pg.evaluate('(c) => { G.bossDebug(c); const S = G.getRun(); S.P.inv = 99; S.P.hp = S.P.maxhp; return 1; }', c)
            pg.wait_for_timeout(650)
            pg.screenshot(path=os.path.join(OUT, 'v%d-3-%s-%s%s.png' % (r, ten, c, nhan)))
            pg.wait_for_timeout(2300)
            pg.evaluate(TRUM)
    ctx.close()


with sync_playwright() as p:
    b = p.chromium.launch()
    for r in VUNG:
        chay(b, r, '', '')
        chay(b, r, '-cu', '&quaipl=0')
    b.close()
print('LỖI TRANG:', LOI or 'không có')
