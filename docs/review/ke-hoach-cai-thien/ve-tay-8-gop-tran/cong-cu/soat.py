"""Vẽ tay 8 gộp (trận) — chép từ ../../con-ve-tay-9/cong-cu/soat9.py, đổi cảnh. Chụp ảnh soát tĩnh (headless, bot tự đánh, KHÔNG chơi thử). Chạy cùng cảnh trên bản TRƯỚC (DIST_TRUOC) và bản SAU
(game/dist/linh-khi.html), ghép trên/dưới: anh-soat/truoc-sau-<cảnh>.png.   python3 soat9.py <bản trước .html> [cảnh,cảnh]"""
import os, sys, json, time, io
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '../../../../../game'))
OUT = os.path.join(HERE, '..', 'anh-soat')
sys.path.insert(0, os.path.join(ROOT, 'tests'))
from quai_lib import sync_playwright, LIB
TRUOC = sys.argv[1]; SAU = ROOT + '/dist/linh-khi.html'
CHON = sys.argv[2].split(',') if len(sys.argv) > 2 else None
PRE = r"""() => {
  T.save = (o) => G.testSave(Object.assign({ lvl: 30, gold: 99999, melee: 'sword', branch: 'fire', marksMoi: G.MARKS[1] + 30 }, o || {}));
  T.S = () => G.getRun();
  T.vao = (r) => { G.startStage(r, 2, 0); const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; };
  T.chay = (n, inp) => { for (let k = 0; k < n; k++) { T.frame(1, inp ? inp(k) : null); if (G.theme && G.theme.endFrame) G.theme.endFrame(); const S = G.getRun && G.getRun(); if (S && S.P && S.P.hp < S.P.maxhp * 0.4) { S.P.hp = S.P.maxhp; S.P.dead = false; } } };
}"""
# (tên, js, [số khung chụp...])  js chạy trước; mỗi mốc: chạy tới khung đó rồi chụp
CANH = {
  'vung1': ("""() => { T.save(); G.rnd = G.srand(11); T.vao(0); T.useBot(true); }""", [60, 160, 260]),
  'vung2': ("""() => { T.save({ branch: 'ice' }); G.rnd = G.srand(12); T.vao(1); T.useBot(true); }""", [60, 160, 260]),
  'vung3': ("""() => { T.save({ branch: 'poison' }); G.rnd = G.srand(13); T.vao(2); T.useBot(true); }""", [60, 160, 260]),
  'vung4': ("""() => { T.save(); G.rnd = G.srand(14); T.vao(3); T.useBot(true); }""", [60, 160, 260]),
  'song-phong-day': ("""() => { T.save(); G.rnd = G.srand(34); G.startStage(3, 0, 0); const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; const W = G.getWorld(); W.waves = []; W.spawns = []; }""", [30, 90], (0, 0, 992, 540)),
  'song-phong-vat': ("""() => { T.save(); G.rnd = G.srand(35); G.startStage(3, 3, 0); const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; const W = G.getWorld(); W.waves = []; W.spawns = []; const g = W.geo; G.songLuat.datVat(W, 'poison', g.cx - 90, g.cy + 30, true); G.songLuat.datVat(W, 'fire', g.cx + 40, g.cy + 40, true); G.songLuat.datVat(W, 'ice', g.cx - 30, g.cy - 30, true); }""", [30, 90], (0, 0, 992, 540)),
  'song-vung': ("""() => { T.save(); G.rnd = G.srand(35); G.startStage(3, 3, 0); const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; const W = G.getWorld(); W.waves = []; W.spawns = []; const g = W.geo; G.songLuat.datVat(W, 'poison', g.cx - 90, g.cy + 30, true); G.songLuat.datVat(W, 'fire', g.cx + 40, g.cy + 40, true); G.songLuat.datVat(W, 'ice', g.cx - 30, g.cy - 30, true); const ps = (W.props || []).filter((p) => p.type === 'lucbinh' || p.type === 'dendau'); for (const p of ps) { try { G.triggerProp(p); } catch (e) {} } }""", [8, 40, 100], (0, 0, 992, 540)),
  'song-trum': ("""() => { T.save(); const x = T.boss(3, true, { seed: 5, save: { lvl: 30 } }); x.S.fade = 0; T.useBot(true); }""", [10, 60, 120]),
  'ho-tinh-lua': ("""() => { T.save(); const x = T.boss(2, true, { seed: 5, save: { lvl: 30 } }); x.S.fade = 0; T.useBot(true); }""", [200, 320, 440]),
  'moc-tinh-ra-mat': ("""() => { T.save(); T.boss(0, true, { seed: 3, save: { lvl: 30 } }).S.fade = 0; }""", [40, 80, 120]),
  'ngu-tinh-nuoc': ("""() => { T.save(); const x = T.boss(1, true, { seed: 4, save: { lvl: 30 } }); x.S.fade = 0; const W = G.getWorld(); const g = W.geo; W.shrink = { y0: g.fy0 + 40, y1: g.fy1 - 40, x0: g.fx0 + 30 }; }""", [5, 60]),
  'lang-lo-ren': ("""() => { T.save(); G.setScene(G.Village); }""", [60, 200], (150, 120, 700, 460)),
  'bang-lang': ("""() => { G.MO_DAN_BAT = false; T.save(); G.setScene(G.Village); const VA = G.villageApi; VA.goHub(); VA.open('tu'); T.chay(3); }""", [10], (0, 0, 992, 540)),
  'man-chao': ("""() => { }""", [5, 60]),
  'hang-bien-phong': ("""() => { T.save(); G.rnd = G.srand(31); T.vao(1); const W = G.getWorld(); W.waves = []; W.spawns = []; }""", [30, 120, 200], (150, 60, 850, 480)),
  'lau-phong': ("""() => { T.save(); G.rnd = G.srand(33); T.vao(2); const W = G.getWorld(); W.waves = []; W.spawns = []; }""", [30, 120], (150, 60, 850, 480)),
  'rung-phong': ("""() => { T.save(); G.rnd = G.srand(36); T.vao(0); const W = G.getWorld(); W.waves = []; W.spawns = []; }""", [30, 120], (150, 60, 850, 480)),
  'chem-lua': ("""() => { T.save({ branch: 'fire' }); G.rnd = G.srand(21); T.vao(0); T.useBot(true); const S = G.getRun(); S.P.hp = Math.round(S.P.maxhp * 0.25); }""", [30, 34, 38, 90]),
}
def chay(pw, url, ten):
    b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 992, 'height': 540}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto('file://' + url + '?cloud=0' + os.environ.get('THEM', '')); pg.wait_for_function('window.G && G.scene'); pg.wait_for_timeout(1500)
    pg.evaluate("window.requestAnimationFrame = () => 0")
    pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js')); pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
    pg.evaluate(LIB); pg.evaluate(PRE)
    if os.environ.get('JS'): pg.evaluate(os.environ['JS'])
    js, moc = CANH[ten][:2]; pg.evaluate(js); anh = []; da = 0
    for m in moc:
        pg.evaluate('(n) => T.chay(n)', m - da); da = m
        pg.wait_for_timeout(200)
        anh.append(Image.open(io.BytesIO(pg.screenshot())).convert('RGB'))
    loi = errs + pg.evaluate('T.errs'); b.close(); return anh, loi
def ghep(tr, sa, ten):
    cr = CANH[ten][2] if len(CANH[ten]) > 2 else None
    if cr: tr = [a.crop(cr) for a in tr]; sa = [a.crop(cr) for a in sa]
    W0, H0 = tr[0].size; k = 0.5 if W0 > 900 else 0.7 if W0 > 600 else 2; w = int(W0 * k); h = int(H0 * k); n = len(tr)
    im = Image.new('RGB', (w * n + 4 * (n - 1), h * 2 + 30), (30, 24, 36)); d = ImageDraw.Draw(im)
    for i, (a, bb) in enumerate(zip(tr, sa)):
        im.paste(a.resize((w, h), Image.LANCZOS if k < 1 else Image.NEAREST), (i * (w + 4), 14)); im.paste(bb.resize((w, h), Image.LANCZOS if k < 1 else Image.NEAREST), (i * (w + 4), h + 30))
    d.text((4, 1), ten + ' - TRUOC (tren)', fill=(255, 220, 160)); d.text((4, h + 17), 'SAU (duoi)', fill=(160, 255, 200))
    im.save(os.path.join(OUT, 'truoc-sau-%s.png' % ten), optimize=True)
with sync_playwright() as pw:
    for ten in CANH:
        if CHON and ten not in CHON: continue
        t0 = time.time(); tr, l1 = chay(pw, TRUOC, ten); t1 = time.time(); sa, l2 = chay(pw, SAU, ten); t2 = time.time()
        ghep(tr, sa, ten)
        if True: [x.save(os.path.join(OUT, 'sau-%s-%d.png' % (ten, i))) for i, x in enumerate(sa)]
        print(ten, 'trước %.0fs sau %.0fs' % (t1 - t0, t2 - t1), 'lỗi', l1[:3], l2[:3], flush=True)
