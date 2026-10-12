"""Chơi thật trên bản hai tệp (như web): 4 em bé × 4 vũ khí, mặc mũ + đồ, bot đánh ải 1-1 có vẽ màn hình thật (rAF thật), chụp ảnh giữa trận.
Đếm pageerror. Chạy: python3 choi.py <thư mục ảnh>"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
with sync_playwright() as p:
    b, pg, errs = mo(p, 844, 390)
    pg.add_script_tag(path='/home/claude/new-project/game/tests/bot.js')
    for i, (k, wt, hat) in enumerate([('smith', 'spear', 'non_la'), ('hunter', 'hammer', 'mu_tai_cao'), ('healer', 'sword', 'khan_xep'), ('wrestler', 'bow', 'mu_sung')]):
        pg.evaluate("""([k, wt, hat]) => { G.resetSave(); const sv = G.save; sv.sound = false; if (sv.tut) sv.tut.done = true;
          for (const h of G.HKEYS) { sv.heroes[h].unlocked = true; sv.heroes[h].lvl = 8; }
          sv.hero = k; if ('active' in sv) sv.active = k;
          const w = G.weaponById(sv.carry[0]); if (w) { w.type = wt; w.family = 2; w.tier = 1; }
          try { const O = G.outfit; const id = O.give ? O.give(sv, hat) : null; if (O.wear && id != null) O.wear(sv, id); } catch (e) {}
          G.startStage(0, 0, 0); }""", [k, wt, hat])
        for s in range(6):
            pg.evaluate("() => { try { G.botRun(1.5); } catch (e) { console.error(e); } }")
            pg.wait_for_timeout(700)
        pg.screenshot(path=os.path.join(OUT, 'tran-%d-%s-%s.png' % (i, k, wt)))
    print('pageerror:', errs)
