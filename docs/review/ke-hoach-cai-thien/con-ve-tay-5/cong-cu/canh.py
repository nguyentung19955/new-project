"""Ảnh soát tĩnh nhiều cảnh trận (trùm, trùm nhỏ, phòng quái mỗi vùng), bản cũ (?vecode=1) và mới.
python3 canh.py <thư mục ra> [query]"""
import io, os, sys
sys.path.insert(0, '/home/claude/new-project/game/tests')
from PIL import Image
from quai_lib import sync_playwright, ROOT, LIB

od = sys.argv[1]; q = sys.argv[2] if len(sys.argv) > 2 else ''
os.makedirs(od, exist_ok=True)
CLIP = {'x': 16, 'y': 0, 'width': 960, 'height': 540}
ROOMS = r"""([r, melee, el]) => {
  G.pointers.clear();
  G.testSave({ lvl: 30, melee, branch: el, marksMoi: el ? G.MARKS[2] + 50 : 0 });
  G.rnd = G.srand(11 + r); Math.random = G.srand(99 + r);
  G.startStage(r, 2, 0);
  const S = G.getRun();
  const id = S.map.rooms.findIndex((x) => x.type === 'fight'); if (id >= 0) G.gotoRoom(id);
  const W2 = G.getWorld(); W2.waveT = 0.01;
  W2.waves = [['rusher', 'swarm', 'archer', 'shield', 'bomber', 'spiky', 'kami', 'nimble'], ['elite', 'rusher', 'archer', 'bomber']];
  window.__k = 0;
}"""
BOSS = r"""([r, big, melee, el]) => {
  T.boss(r, big, { seed: 3 + r, save: { lvl: 30, melee, branch: el, marksMoi: G.MARKS[2] + 50 } }); Math.random = G.srand(77 + r);
  window.__k = 0;
}"""
STEP = r"""(n) => { T.useBot(true); for (let k = 0; k < n; k++) { T.frame(1); const S2 = G.getRun(); if (!S2 || !S2.P) break; S2.P.hp = S2.P.maxhp; S2.P.dead = false; if (S2.W) { S2.W.over = null; const bb = S2.W.boss; if (bb && bb.hp < bb.maxhp * 0.3) bb.hp = bb.maxhp * 0.45; } } T.useBot(false); }"""

def snap(pg):
    return Image.open(io.BytesIO(pg.screenshot(clip=CLIP))).convert('RGB')

with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={'width': 992, 'height': 540})
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.goto('file://' + ROOT + '/dist/linh-khi.html' + q)
    pg.wait_for_function('window.G && G.scene')
    pg.wait_for_timeout(300)
    pg.evaluate("window.requestAnimationFrame = () => 0")
    pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
    pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
    pg.evaluate(LIB)
    pg.wait_for_timeout(1500)
    combos = [('sword', 'poison'), ('spear', 'fire'), ('hammer', 'ice')]
    jobs = []
    for r in range(4):
        jobs.append(('phong-%d' % r, ROOMS, [r] + list(combos[r % 3])))
        jobs.append(('trumnho-%d' % r, BOSS, [r, False] + list(combos[(r + 1) % 3])))
        jobs.append(('trum-%d' % r, BOSS, [r, True] + list(combos[(r + 2) % 3])))
    for name, js, arg in jobs:
        ims = []
        try:
            pg.evaluate(js, arg)
            for k in range(6):
                pg.evaluate(STEP, 110)
                ims.append(snap(pg))
        except Exception as e:
            errs.append(name + ': ' + str(e)[:200])
        if ims:
            W = Image.new('RGB', (960 * 3, 540 * 2))
            for i, im in enumerate(ims): W.paste(im, ((i % 3) * 960, (i // 3) * 540))
            W.resize((1440, 540)).save(os.path.join(od, name + '.png'))
        print(name, flush=True)
    print('LOI', errs)
    b.close()
