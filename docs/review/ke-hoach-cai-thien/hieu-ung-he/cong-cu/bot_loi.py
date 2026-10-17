"""Bot chơi thật (có vẽ) vài ải với 4 vũ khí × 3 hệ × bậc cao/thấp, đếm lỗi JS (pageerror), lỗi lớp hiệu ứng (G.fx.errs) và lỗi js/fx_he_moi.js.
Chạy: python3 bot_loi.py [them]"""
import sys, json
from lib import *
THEM = sys.argv[1] if len(sys.argv) > 1 else ''
JS = r"""
([wt, el, st, reg, giay]) => {
  G.testSave({ hero: 'smith', melee: wt === 'bow' ? 'sword' : wt, lvl: 25, tier: 2, sharpen: 3, branch: el, marks: [0, 30, 120, 300][st] });
  const base = window.__botGoc;
  Object.assign(G.botCfg, { prefer: wt, explore: true, props: true });
  G.botInput = function (S) { const i = base(S); const q = Math.random(); if (q < 0.03) i.specialP = true; else if (q < 0.05) i.skillP = true; return i; };
  G.startStage(reg, 1, 0);
  const P = G.getRun().P; if (G.curW(P).type !== wt) P.cur = 1 - P.cur;
  AU.live(true);
  return true;
}
"""
kq = []
with sync_playwright() as p:
    b, g, loi = mo(p, THEM)
    g.evaluate('() => { window.__botGoc = G.botInput; }')
    for i, (wt, el) in enumerate([(w, e) for w in ('sword', 'spear', 'hammer', 'bow') for e in ('fire', 'poison', 'ice')]):
        st = 1 if i % 2 else 3
        g.evaluate(JS, [wt, el, st, i % 3, 12])
        g.wait_for_timeout(12000)
        r = g.evaluate("() => ({ fx: G.fx.errs, fxLast: G.fx.lastErr || null, he: G.heMoi ? G.heMoi.loi || null : 'tat', mode: G.getRun() && G.getRun().mode, giet: G.getRun() && G.getRun().loot && G.getRun().loot.kills })")
        g.evaluate("() => { AU.live(false); G.botInput = null; }")
        kq.append([wt, el, st, r]); print(wt, el, st, r, flush=True)
    print('pageerror:', loi or 'không có')
    b.close()
