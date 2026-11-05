"""Chụp soát headless (KHÔNG chơi thử bằng tay): dựng cảnh bằng lệnh, 844×390 như iPhone ngang.
  python3 chup.py <dist/linh-khi.html> <thư mục ra>
Ra: tran-1-quai-thuong[-cu].png (ải 1-1 bản thử: 2 Thorncap Goblin + 1 Spore Puff), tran-2-trum[-cu].png (Toadstool King),
    tran-3-fire-guard[-cu].png (trùm dựng khiên), phóng ×3 vùng quái: *-x3.png. "-cu" = ?quaipl=0 (hình cũ)."""
import os, sys
from playwright.sync_api import sync_playwright
from PIL import Image
HTML = os.path.abspath(sys.argv[1]); OUT = os.path.abspath(sys.argv[2]); os.makedirs(OUT, exist_ok=True)
GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..'))
SETUP = os.path.join(GOC, 'game', 'tests', 'setup.js')
LOI = []
VAO = r'''() => { G.resetSave(); G.save.sound = false; G.keys = {}; G.keyP = {}; G.startStage(0, 0, 0); const S = G.getRun(); S.fade = 0; S.mode = 'play'; return !!S.slice; }'''
SACH = r'''() => { const S = G.getRun(), Wd = S.W; S.fade = 0; S.hint = null; for (const k of ['mobs','ents','projs','spawns']) if (Wd[k]) Wd[k].length = 0;
  Wd.waves = []; Wd.waveT = 999; Wd.banner = null; S.P.inv = 99; return true; }'''
QUAI = r'''() => { const S = G.getRun(), Wd = S.W, P = S.P; P.x = Wd.x0 + 40; P.y = (Wd.y0 + Wd.y1) / 2;
  const a = G.spawnEnemy('rusher', P.x + 110, P.y - 22), b = G.spawnEnemy('rusher', P.x + 175, P.y + 18), c = G.spawnEnemy('archer', P.x + 240, P.y - 6);
  for (const e of [a, b, c]) { e.cd = 99; e.face = -1; }
  return [a.art, b.art, c.art, !!(G.quaiPl && G.quaiPl.tamMoi && G.quaiPl.tamMoi('heoCon')), !!(G.quaiPl && G.quaiPl.tamMoi && G.quaiPl.tamMoi('hoaBaoTu'))]; }'''
PHONG = r'''(n) => { G.gotoRoom(n); const S = G.getRun(); S.fade = 0; S.mode = 'play'; S.trans = null; return S.idx; }'''
TRUM = r'''() => { const S = G.getRun(), Wd = S.W, b = Wd.boss; if (!b) return null; b.busy = 999; b.cd = 99; b.vx = 0; b.vy = 0; S.P.inv = 99; Wd.banner = null; S.hint = null;
  S.slice.nhat = null; S.slice.bang = true;
  for (const k of Object.keys(Wd)) if (Array.isArray(Wd[k]) && /^(ents|projs|haz|hazards|zones|bullets|mobs|spawns|warns|aoes)$/.test(k)) Wd[k].length = 0;
  S.P.x = b.x - 90; S.P.y = b.y + 4; return [b.art, b.x, b.y, b.h, !!(G.quaiPl && G.quaiPl.tamMoi && G.quaiPl.tamMoi('namChua'))]; }'''


def mo(b, co=''):
    ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); pg.on('pageerror', lambda e: LOI.append(str(e)))
    pg.goto('file://' + HTML + '?cloud=0' + co)
    pg.wait_for_function('() => window.G && G.scene && G.bia', timeout=180000); pg.wait_for_timeout(4000)
    pg.add_script_tag(path=SETUP)
    return ctx, pg


def x3(ten, box):
    im = Image.open(os.path.join(OUT, ten + '.png'))
    k = 2  # dpr
    c = im.crop(tuple(v * k for v in box))
    c.resize((c.width * 3 // 2, c.height * 3 // 2), Image.NEAREST).save(os.path.join(OUT, ten + '-x3.png'))


def chay(b, nhan, co):
    ctx, pg = mo(b, co)
    assert pg.evaluate(VAO)
    pg.wait_for_timeout(1500); pg.evaluate(SACH)
    print(nhan, 'quai', pg.evaluate(QUAI))
    pg.wait_for_timeout(2600)
    pg.evaluate('() => { const S = G.getRun(); S.P.inv = 0; S.hint = null; return 1; }')
    pg.wait_for_timeout(100)
    pg.screenshot(path=os.path.join(OUT, 'tran-1-quai-thuong' + nhan + '.png'))
    x3('tran-1-quai-thuong' + nhan, (100, 90, 400, 300))
    pg.evaluate('() => { for (const e of G.getRun().W.ents) e.cd = 0; return 1; }')  # cho ra đòn
    for i in range(4):
        pg.wait_for_timeout(350)
        pg.screenshot(path=os.path.join(OUT, 'tran-1b-ra-don-%d%s.png' % (i, nhan)))
    pg.evaluate(PHONG, 3); pg.wait_for_timeout(3000)
    print(nhan, 'trum', pg.evaluate(TRUM)); pg.wait_for_timeout(400); pg.evaluate(TRUM); pg.wait_for_timeout(300)
    pg.screenshot(path=os.path.join(OUT, 'tran-2-trum' + nhan + '.png'))
    pg.evaluate('() => { const S = G.getRun(), b = S.W.boss; for (let i = 0; i < 5; i++) { b.invuln = 0; G.damage(b, 1, { el: "fire", fromPlayer: true }); } return !!S.slice.guard; }')
    pg.wait_for_timeout(900); pg.evaluate(TRUM); pg.wait_for_timeout(200)
    pg.screenshot(path=os.path.join(OUT, 'tran-3-fire-guard' + nhan + '.png'))
    bx = pg.evaluate('() => { const S = G.getRun(), b = S.W.boss, cam = G.camVe ? G.camVe(S.W) : Math.round(S.W.cam || 0); return [Math.round(b.x - cam), Math.round(b.y)]; }')
    for t in ('tran-2-trum', 'tran-3-fire-guard'):
        x3(t + nhan, (max(0, bx[0] - 140), max(0, bx[1] - 130), min(844, bx[0] + 100), min(390, bx[1] + 40)))
    ctx.close()


with sync_playwright() as p:
    b = p.chromium.launch()
    chay(b, '', '')
    chay(b, '-cu', '&quaipl=0')
    b.close()
print('LỖI TRANG:', LOI or 'không có')
