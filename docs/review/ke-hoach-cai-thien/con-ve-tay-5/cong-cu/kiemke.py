"""Kiểm kê mọi lệnh vẽ code trên canvas thế giới trong trận (mọi vùng, quái, trùm, vũ khí, hệ), bot tự đánh.
python3 kiemke.py <ra.json> [query]   (query '?vecode=1' = bản cũ)"""
import os, sys, json
sys.path.insert(0, '/home/claude/new-project/game/tests')
from quai_lib import sync_playwright, ROOT, LIB

out = sys.argv[1]
q = sys.argv[2] if len(sys.argv) > 2 else ''

HOOK = r"""
(() => {
  const P = CanvasRenderingContext2D.prototype; window.__dem = {}; window.__bat = false;
  const lop = (c) => { try { if (window.G && G.wx && c.canvas === G.wx.canvas) return 'W'; if (window.G && G.ux && c.canvas === G.ux.canvas) return 'U'; } catch (e) {} return c.__chanVe ? 'L' : 'o'; };
  for (const m of ['arc','ellipse','fillRect','strokeRect','fill','stroke','drawImage']) {
    const g = P[m];
    P[m] = function (a0) {
      if (window.__bat) {
        const l = lop(this);
        if (l === 'W' || l === 'L') {
          let kind = '';
          if (m === 'drawImage') { if (!(a0 instanceof HTMLCanvasElement)) return g.apply(this, arguments); kind = ' [canvas ' + a0.width + 'x' + a0.height + ']'; }
          const st = String(new Error().stack).split('\n').slice(2, 6).map(s => s.trim().replace(/^at /,'').replace(/file:\/\/\/\S*\//,'').replace(/[()]/g,''));
          const k = l + ' ' + m + kind.replace(/\d+x\d+/, '') + ' | ' + st.join(' < ');
          window.__dem[k] = (window.__dem[k] || 0) + 1;
        }
      }
      return g.apply(this, arguments);
    };
  }
})();
"""

ROOMS = r"""([r, melee, el, n]) => {
  G.pointers.clear();
  G.testSave({ lvl: 30, melee, branch: el, marksMoi: el ? G.MARKS[2] + 50 : 0, gold: 0 });
  G.rnd = G.srand(11 + r);
  G.startStage(r, 2, 0);
  const S = G.getRun(); const W = G.getWorld(); const P = S.P;
  const id = S.map.rooms.findIndex((x) => x.type === 'fight'); if (id >= 0) G.gotoRoom(id);
  const W2 = G.getWorld(); W2.waveT = 0.01;
  W2.waves = [['rusher', 'swarm', 'archer', 'shield', 'bomber', 'spiky', 'kami', 'nimble'], ['elite', 'rusher', 'archer', 'bomber'], ['spiky', 'kami', 'swarm', 'shield']];
  T.useBot(true);
  for (let k = 0; k < n; k++) { window.__bat = k % 9 === 0; T.frame(1); window.__bat = false; const S2 = G.getRun(); if (!S2 || !S2.P) break; S2.P.hp = S2.P.maxhp; S2.P.mp = S2.P.maxmp || S2.P.mp; S2.P.dead = false; if (S2.W) S2.W.over = null; }
  T.useBot(false);
}"""
BOSS = r"""([r, big, melee, el, n]) => {
  const { S, W, P, b } = T.boss(r, big, { seed: 3 + r, save: { lvl: 30, melee, branch: el, marksMoi: G.MARKS[2] + 50 } });
  T.useBot(true);
  for (let k = 0; k < n; k++) { window.__bat = k % 9 === 0; T.frame(1); window.__bat = false; const S2 = G.getRun(); if (!S2 || !S2.P) break; S2.P.hp = S2.P.maxhp; S2.P.dead = false; if (S2.W) { S2.W.over = null; const bb = S2.W.boss; if (bb && bb.hp < bb.maxhp * 0.2 && k < n * 0.8) bb.hp = bb.maxhp * 0.45; } }
  T.useBot(false);
}"""

with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={'width': 992, 'height': 540})
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.add_init_script(HOOK)
    pg.goto('file:///tmp/claude-0/-home-claude-new-project/70cf0cef-ec57-5749-9638-345aa5d4fcd6/scratchpad/dist-kk.html' + q)
    pg.wait_for_function('window.G && G.scene')
    pg.wait_for_timeout(300)
    pg.evaluate("window.requestAnimationFrame = () => 0")
    pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
    pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
    pg.evaluate(LIB)
    pg.wait_for_timeout(1500)
    N = int(os.environ.get('N', '420'))
    combos = [('sword', 'poison'), ('spear', 'fire'), ('hammer', 'ice'), ('sword', None)]
    for r in range(4):
        for i, (m, el) in enumerate(combos):
            try:
                pg.evaluate(ROOMS, [r, m, el, N])
            except Exception as e:
                errs.append('EVAL room %d %s %s: %s' % (r, m, el, str(e)[:200]))
            print('phong', r, m, el, flush=True)
            json.dump({'dem': pg.evaluate("window.__dem"), 'loi': errs}, open(out, 'w'), ensure_ascii=False, indent=0)
    for r in range(4):
        for big in (False, True):
            m, el = combos[(r + big) % 3]
            try:
                pg.evaluate(BOSS, [r, big, m, el, N * 2 if r < 3 else N // 2])
            except Exception as e:
                errs.append('EVAL boss %d %s: %s' % (r, big, str(e)[:200]))
            print('trum', r, big, flush=True)
            json.dump({'dem': pg.evaluate("window.__dem"), 'loi': errs}, open(out, 'w'), ensure_ascii=False, indent=0)
    d = pg.evaluate("window.__dem")
    json.dump({'dem': d, 'loi': errs}, open(out, 'w'), ensure_ascii=False, indent=0)
    print('LOI', errs[:20])
    b.close()
