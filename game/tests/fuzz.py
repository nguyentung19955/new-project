"""Bấm loạn để tìm lỗi sập và số liệu hỏng: mọi hero x mọi loại vũ khí, đi qua từng phòng của một ải ngẫu nhiên.
Người chơi được giữ sống để đi hết các phòng. Chạy: python3 tests/fuzz.py [số giây mỗi phòng]"""
import sys
from playwright.sync_api import sync_playwright

JS = r"""
([hero, wtype, secs]) => {
  const bad = [];
  const r = Math.floor(Math.random() * 3), i = Math.floor(Math.random() * 5), diff = Math.random() < 0.3 ? 1 : 0;
  const el = G.pick(G.ELS);
  G.testSave({ hero, melee: wtype === 'bow' ? 'sword' : wtype, lvl: 12 + Math.floor(Math.random() * 18), tier: 1 + Math.floor(Math.random() * 2), sharpen: 5, branch: el, marks: G.pick([10, 40, 150, 290, 400]),
    armor: G.pick(Object.keys(G.GEAR.armor)), helm: G.pick(Object.keys(G.GEAR.helm)), charm: G.pick(Object.keys(G.GEAR.charm)) });
  G.save.scars = { moc: 'fire', ngu: 'ice', ho: 'poison' };
  G.botCfg.explore = true; G.botCfg.prefer = wtype;
  const base = G.botInput;
  G.botInput = function (S) {
    const inp = base(S), q = Math.random;
    if (q() < 0.2) { inp.mx = q() * 2 - 1; inp.my = q() * 2 - 1; }
    if (q() < 0.04) inp.specialP = true;
    if (q() < 0.04) inp.skillP = true;
    if (q() < 0.01) inp.swapP = true;
    if (q() < 0.03) inp.dodgeP = true;
    if (q() < 0.005) inp.potionP = true;
    if (q() < 0.3) inp.atk = true;
    return inp;
  };
  try {
    G.startStage(r, i, diff);
    const n = G.getRun().rooms.length;
    for (let room = 0; room < n; room++) {
      let S = G.getRun();
      if (!S || S.mode === 'result' || S.mode === 'dead') break;
      if (S.idx < room) G.gotoRoom(room);
      if (Math.random() < 0.3) G.addCoat(G.pick(G.ELS), 30);
      for (let t = 0; t < secs * 2; t++) {
        S = G.getRun();
        if (!S || S.mode === 'result' || S.mode === 'dead' || S.idx > room) break;
        if (S.mode !== 'play') { G.botRun(1); continue; }
        G.sim(30);
        const W = S.W, P = S.P;
        if (!W.over) { P.hp = Math.max(P.hp, P.maxhp * 0.5); P.mana = Math.max(P.mana, 60); }
        for (const k of ['hp', 'x', 'y', 'mana']) if (!isFinite(P[k])) bad.push('người chơi ' + k + ' hỏng, phòng ' + S.rooms[S.idx]);
        if (P.x < W.x0 - 1 || P.x > W.x1 + 1 || P.y < W.y0 - 1 || P.y > W.y1 + 1) bad.push('người chơi ra ngoài sân ' + Math.round(P.x) + ',' + Math.round(P.y));
        for (const e of W.ents.concat(W.boss && !W.boss.dead ? [W.boss] : [])) {
          for (const k of ['hp', 'x', 'y']) if (!isFinite(e[k])) bad.push((e.role || e.kind) + ' ' + k + ' hỏng');
          if (e.inside && (e.x < W.x0 - 1 || e.x > W.x1 + 1)) bad.push('quái ngoài phòng ' + e.role);
          if (e.y < G.GY0 - 20 || e.y > G.GY1 + 20) bad.push('quái lệch dọc ' + (e.role || e.kind) + ' ' + Math.round(e.y));
        }
        for (const w of P.weapons) for (const e2 of G.ELS) if (!isFinite(w.marks[e2])) bad.push('dấu ấn hỏng');
        if (bad.length > 4) break;
      }
      if (bad.length > 4) break;
    }
  } finally { G.botInput = base; }
  const S = G.getRun();
  return { r, i, diff, bad, mode: S ? S.mode : null, idx: S ? S.idx : null };
}
"""

def main():
    secs = int(sys.argv[1]) if len(sys.argv) > 1 else 15
    errs, nbad = [], 0
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file:///home/claude/new-project/game/index.html')
        pg.wait_for_timeout(1500)
        pg.add_script_tag(path='tests/bot.js')
        pg.add_script_tag(path='tests/setup.js')
        for hero in ['smith', 'hunter', 'healer', 'wrestler']:
            for wt in ['sword', 'bow', 'spear', 'hammer']:
                try:
                    res = pg.evaluate(JS, [hero, wt, secs])
                except Exception as ex:
                    res = {'bad': ['SẬP: ' + str(ex)[:400]]}
                nbad += len(res['bad']) + len(errs)
                print(hero, wt, f"ải {res.get('r')}-{res.get('i')} độ khó {res.get('diff')}", 'ổn' if not res['bad'] and not errs else res['bad'] + errs)
                errs.clear()
                sys.stdout.flush()
        b.close()
    print('tổng số lỗi:', nbad)
    sys.exit(1 if nbad else 0)

main()
