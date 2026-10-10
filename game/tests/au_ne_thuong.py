"""AUDIT (phiên au-vu-khi-he): cơ chế thưởng cho NÉ có đáng giá không. Chỉ đọc số, không sửa file game
(chỉ tắt tạm Nhát lướt trong bộ nhớ trang thử để so). Chạy (từ thư mục game):  python3 tests/au_ne_thuong.py [giây] [hạt giống]
So kiếm có / không có Nhát lướt (đánh ngay sau Né, x1,4), và bộ Hồ Tinh (sau Né đòn kế +60%) trên cụm 5 quái mới.
In: st/giây, số Nhát lướt mỗi phút, số lần dùng thưởng bộ Hồ mỗi phút, số lần né mỗi phút."""
import os, sys, json
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECS = int(sys.argv[1]) if len(sys.argv) > 1 else 60
SEEDS = int(sys.argv[2]) if len(sys.argv) > 2 else 8

JS = r"""
([wtype, el, marks, secs, seed, one, glide, setHo]) => {
  G.MOVES.sword.glide.win = glide ? 0.35 : 0;
  for (const k of G.HKEYS) G.HEROES[k].fav = [];
  G.testSave({ hero: 'smith', melee: wtype === 'bow' ? 'sword' : wtype, lvl: 10, tier: 1, sharpen: 3, branch: el || undefined, marks: el ? marks : 0 });
  G.rnd = G.srand(seed);
  G.startStage(0, 2, 0, { kind: 'A', seed: 3 });
  const S = G.getRun(), W = G.getWorld(), P = S.P;
  W.waves = []; W.spawns = []; W.props = []; W.zones = []; W.banner = null;
  P.x = W.geo.cx; P.y = W.geo.cy;
  Object.assign(G.botCfg, { prefer: wtype, explore: false, props: false });
  if (G.curW(P).type !== wtype) P.cur = 1 - P.cur;
  P.markMult = 1; if (setHo) P.set = 'ho';
  let glides = 0, boosts = 0;
  let dealt = 0, hurt = 0, frameHits = 0, hitFrames = 0, hitEvents = 0, atkT = 0;
  const dmg0 = G.damage, hurt0 = G.hurtPlayer;
  let seen = new Set();
  G.damage = function (t, amt, o) {
    const h = t.hp, r = dmg0(t, amt, o);
    if (!o || o.fromPlayer !== false) dealt += Math.max(0, h - Math.max(0, t.hp));
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
      const k0 = P.mv && P.mv.kind, b0 = P.boost;
      G.sim(1);
      if (P.mv && P.mv.kind === 'luot' && k0 !== 'luot') glides++;
      if (b0 && !P.boost) boosts++;
      if (seen.size) { hitFrames++; }
      if (P.atkT > 0 || P.dashT > 0 || (P.mv && P.mv.holding)) atkT++;
      if (S.mode !== 'play') { bad = 'thoát khỏi trận: ' + S.mode; break; }
      if (!W.over) P.hp = Math.max(P.hp, P.maxhp * 0.6);
    }
  } finally { G.MOVES.sword.glide.win = 0.35; G.damage = dmg0; G.hurtPlayer = hurt0; G.rnd = Math.random; }
  return { dps: dealt / secs, hurt: hurt / secs, perHit: hitFrames ? frameHits / hitFrames : 0, kills: spawned - (one ? 1 : 5), dodgesMin: (S.stats.dodges - d0) / secs * 60,
           busy: atkT / (secs * 60), glides: glides / secs * 60, boosts: boosts / secs * 60, marksMin: (W.marksGained - m0) / secs * 60, bad };
}
"""


def main():
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        print('%-7s %-24s %8s %8s %8s %8s %8s' % ('vũ khí', 'cảnh', 'st/giây', 'mất/s', 'lướt/ph', 'boost/ph', 'né/ph'))
        for wt, name, glide, ho in [('sword', 'có Nhát lướt (mặc định)', True, False), ('sword', 'TẮT Nhát lướt', False, False), ('sword', 'có lướt + bộ Hồ Tinh', True, True), ('hammer', 'búa, không bộ', True, False), ('hammer', 'búa + bộ Hồ Tinh', True, True)]:
            tot = {}
            for s in range(SEEDS):
                r = pg.evaluate(JS, [wt, None, 0, SECS, 300 + s * 7, False, glide, ho])
                for k, v in r.items():
                    if k != 'bad': tot[k] = tot.get(k, 0) + v / SEEDS
            print('%-7s %-24s %8.1f %8.2f %8.1f %8.1f %8.1f' % (wt, name, tot['dps'], tot['hurt'], tot['glides'], tot['boosts'], tot['dodgesMin']))
            sys.stdout.flush()
        b.close()
    if errs:
        print('LỖI JS', errs[:5]); sys.exit(1)


main()
