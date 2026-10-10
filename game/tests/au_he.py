"""AUDIT (phiên au-vu-khi-he): ba hệ Lửa, Độc, Băng ở các mốc Trắng / Mầm (30) / Thành hình (120) / Thức tỉnh (300).
Chỉ đọc số, không đổi luật chơi. Chạy (từ thư mục game):  python3 tests/au_he.py [giây] [hạt giống]
Bot đánh cụm 5 quái mới (máu x2,5) trong phòng thường, cả 4 vũ khí, lấy trung bình. Đo: st/giây (tách đòn trực tiếp, cháy/độc theo
nhịp, phản ứng hệ), máu mất mỗi giây, % quái đang bị khống chế (chậm vì Băng, đóng băng, choáng, giữ chân), tốc độ trung bình của
quái (1 = bình thường, 0 = đứng im), dấu ấn mỗi phút. Số này đo riêng cho phiên audit, không thay tests/dps.py.
"""
import os, sys, json
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECS = int(sys.argv[1]) if len(sys.argv) > 1 else 40
SEEDS = int(sys.argv[2]) if len(sys.argv) > 2 else 4

JS = r"""
([wtype, el, marks, secs, seed, one]) => {
  for (const k of G.HKEYS) G.HEROES[k].fav = [];
  G.testSave({ hero: 'smith', melee: wtype === 'bow' ? 'sword' : wtype, lvl: 10, tier: 1, sharpen: 3, branch: el || undefined, marks: el ? marks : 0 });
  G.rnd = G.srand(seed);
  G.startStage(0, 2, 0, { kind: 'A', seed: 3 });
  const S = G.getRun(), W = G.getWorld(), P = S.P;
  W.waves = []; W.spawns = []; W.props = []; W.zones = []; W.banner = null;
  P.x = W.geo.cx; P.y = W.geo.cy;
  Object.assign(G.botCfg, { prefer: wtype, explore: false, props: false });
  if (G.curW(P).type !== wtype) P.cur = 1 - P.cur;
  P.markMult = 1;
  let ctrl = 0, ctrlN = 0, spd = 0, src = { hit: 0, dot: 0, combo: 0, other: 0 }, dealt = 0, hurt = 0, frameHits = 0, hitFrames = 0, hitEvents = 0, atkT = 0;
  const dmg0 = G.damage, hurt0 = G.hurtPlayer;
  let seen = new Set();
  G.damage = function (t, amt, o) {
    const h = t.hp, r = dmg0(t, amt, o);
    if (!o || o.fromPlayer !== false) { const x = Math.max(0, h - Math.max(0, t.hp)); dealt += x; const k = o && o.src; src[k === 'hit' || k === 'dot' || k === 'combo' ? k : 'other'] += x; }
    if (o && o.src === 'hit' && !seen.has(t)) { seen.add(t); frameHits++; }
    return r;
  };
  G.hurtPlayer = function (a, b, c, d) { const h = P.hp, r = hurt0(a, b, c, d); hurt += Math.max(0, h - P.hp); return r; };
  const roles = ['rusher', 'rusher', 'swarm', 'shield', 'archer', 'nimble', 'swarm', 'rusher'];
  let ri = 0, spawned = 0, bad = '';
  const d0 = S.stats.dodges, m0 = W.marksGained;
  try {
    for (let f = 0; f < secs * 60; f++) {
      const alive = W.ents.filter((e) => !e.dead).length;
      if (alive < (one ? 1 : 5)) {
        const side = G.rnd() < 0.5 ? W.x0 + 8 : W.x1 - 8;
        const e = G.spawnEnemy(one ? 'rusher' : roles[ri++ % roles.length], side + G.rr(-4, 4), G.rr(W.y0 + 6, W.y1 - 6), one ? { hpMult: 8 } : { hpMult: 2.5 });
        e.inside = true; spawned++;
      }
      seen = new Set();
      G.sim(1);
      if (seen.size) { hitFrames++; }
      for (const e of W.ents) if (!e.dead && !(e.spawnT > 0)) { ctrlN++; const hard = e.st.frozen > 0 || e.st.stun > 0 || e.st.root > 0; if (hard || e.st.iceN > 0) ctrl++; spd += hard ? 0 : Math.max(0.4, 1 - 0.15 * e.st.iceN); }
      if (P.atkT > 0 || P.dashT > 0 || (P.mv && P.mv.holding)) atkT++;
      if (S.mode !== 'play') { bad = 'thoát khỏi trận: ' + S.mode; break; }
      if (!W.over) P.hp = Math.max(P.hp, P.maxhp * 0.6);
    }
  } finally { G.damage = dmg0; G.hurtPlayer = hurt0; G.rnd = Math.random; }
  return { dps: dealt / secs, hurt: hurt / secs, perHit: hitFrames ? frameHits / hitFrames : 0, kills: spawned - (one ? 1 : 5), dodgesMin: (S.stats.dodges - d0) / secs * 60,
           busy: atkT / (secs * 60), ctrl: ctrlN ? ctrl / ctrlN : 0, spd: ctrlN ? spd / ctrlN : 1, sHit: src.hit / secs, sDot: src.dot / secs, sCombo: src.combo / secs, sOther: src.other / secs, marksMin: (W.marksGained - m0) / secs * 60, bad };
}
"""


def main():
    errs = []
    res = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        cols = ['dps', 'sHit', 'sDot', 'sCombo', 'sOther', 'hurt', 'ctrl', 'spd', 'marksMin']
        print('%-8s %-11s %7s %7s %7s %7s %7s %7s %7s %7s %7s' % ('hệ', 'mốc', 'st/giây', 'đòn', 'nhịp', 'phản', 'khác', 'mất/s', '%khống', 'tốc độ', 'ấn/ph'))
        WT = os.environ.get('VK', 'sword,bow,spear,hammer').split(',')
        for el in [None, 'fire', 'poison', 'ice']:
            for name, mk in ([('Trắng', 0)] if el is None else [('Mầm', 30), ('Thành hình', 120), ('Thức tỉnh', 300)]):
                tot = {k: 0 for k in cols}
                n = len(WT) * SEEDS
                for wt in WT:
                    for s in range(SEEDS):
                        r = pg.evaluate(JS, [wt, el, mk, SECS, 700 + s * 13, False])
                        if r['bad'] or errs:
                            print('LỖI', wt, r['bad'], errs[:3]); sys.exit(1)
                        for k in cols: tot[k] += r[k] / n
                res[(el or 'none') + '|' + name] = tot
                print('%-8s %-11s %7.1f %7.1f %7.1f %7.1f %7.1f %7.2f %6.0f%% %7.2f %7.1f' % (el or 'không', name, tot['dps'], tot['sHit'], tot['sDot'], tot['sCombo'], tot['sOther'], tot['hurt'], tot['ctrl'] * 100, tot['spd'], tot['marksMin']))
                sys.stdout.flush()
        b.close()
    with open(os.path.join(ROOT, 'tests', 'au_he_ketqua.json'), 'w') as f:
        json.dump(res, f, ensure_ascii=False, indent=1)
    if errs:
        print('LỖI JS', errs[:5]); sys.exit(1)


main()
