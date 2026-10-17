"""Kiểm lỗi JS headless (bot tự đánh, vẽ từng khung) ở bản dist: mặc định, ?dinhquai=0, ?netcao=4. Mỗi vùng: ải 3 (quái + tinh anh) và phòng trùm.
  python3 kiem_js.py"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dq_common import *

JS = r"""
([r, i, n]) => {
  G.testSave({ lvl: 25, tier: 2, sharpen: 4, branch: ['poison', 'ice', 'fire', 'poison'][r], marks: 300 });
  G.rnd = G.srand(11 + r * 7 + i);
  G.startStage(r, i, 0);
  const S = G.getRun();
  if (i >= 4) G.gotoRoom(S.map.rooms.findIndex((x) => x.type === 'boss'));
  T.useBot(true);
  const e0 = G.fx.errs || 0;
  let ve = 0;
  for (let k = 0; k < n; k++) {
    const R = G.getRun(); if (!R) break;
    if (R.P) { R.P.hp = R.P.maxhp; R.P.mana = R.P.maxmana; }
    if (R.mode !== 'play') { G.botRun ? G.botRun(1) : T.sim(1); continue; }
    T.frame(1); ve++;
  }
  return { ve, fxErr: (G.fx.errs || 0) - e0, loi: T.errs.slice(0, 5) };
}
"""
kq = {}
with sync_playwright() as pw:
    for extra in ['', '&dinhquai=0', '&netcao=4']:
        b, pg, errs = open_game(pw, extra)
        out = []
        for r in range(4):
            for i in (2, 4):
                try: out.append([r, i, pg.evaluate(JS, [r, i, 900])])
                except Exception as ex: errs.append('EVAL ' + str(ex)[:300])
        kq[extra or 'mac-dinh'] = {'phong': out, 'pageerror': errs}
        print(extra or 'mặc định', 'lỗi trang:', len(errs), [x[2]['fxErr'] for x in out], [x[2]['ve'] for x in out], errs[:3], flush=True)
        b.close()
json.dump(kq, open(os.path.join(OUT, 'so-lieu', 'kiem-js.json'), 'w'), ensure_ascii=False, indent=1)
