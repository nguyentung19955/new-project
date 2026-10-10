"""AUDIT (phiên au-vu-khi-he): bản sắc 4 vũ khí. Chỉ đọc số, không đổi luật chơi.
Chạy (từ thư mục game):  python3 tests/au_vu_khi.py [giây mỗi lượt] [số hạt giống]
Phần 1 (trên giấy, đọc từ G.MOVES, G.WTYPES): từng đòn: thời lượng, lúc gây sát thương, hệ số, tầm, đẩy lùi, choáng.
Phần 2 (bot chơi trong phòng thường, quái mới thật, giống tests/dps.py 'quaimoi'), mỗi vũ khí đo:
  - st/giây vào cụm 5 quái và vào 1 quái máu dày (đo riêng, KHÔNG thay số của tests/dps.py hay phiên au-chien-dau)
  - số quái trúng trung bình mỗi nhịp đánh trúng (gom các lần G.damage nguồn 'hit' trong cùng một khung)
  - % thời gian đang ra đòn (bị chậm 60%), số lần né mỗi phút, máu mất mỗi giây
  - % nhát đã vung mà bị huỷ trước lúc chạm (vì Né, bị đánh...), đo bằng nhát bắt đầu so với nhát gây sát thương
  - dấu ấn mỗi phút khi vũ khí ở mốc Mầm Lửa (tỉ lệ gây hệ 20%) và Trắng (không hệ) — chỉ từ quái thường bị kết liễu khi đang dính hệ
"""
import os, sys, json
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = [a for a in sys.argv[1:]]
SECS = int(args[0]) if len(args) > 0 else 40
SEEDS = int(args[1]) if len(args) > 1 else 4

STATIC = r"""
() => {
  const M = G.MOVES, T = G.WTYPES, out = [];
  const add = (w, name, dur, mult, reach, depth, extra) => out.push(Object.assign({ w, name, dur, hitAt: +(dur * 0.45).toFixed(3), dmg: +(T[w].dmg * mult).toFixed(1), reach, depth }, extra || {}));
  M.sword.chain.forEach((m) => add('sword', m.name, m.dur, m.mult, m.reach, m.depth, { push: m.push || 0 }));
  add('sword', M.sword.glide.name + ' (sau né)', M.sword.glide.t, M.sword.glide.mult, M.sword.glide.len, 24, { win: M.sword.glide.win });
  add('bow', M.bow.shot.name + ' (đứng yên)', M.bow.shot.still, M.bow.shot.mult, M.bow.shot.range, 0, { pierce: M.bow.shot.pierce, pierceMult: M.bow.shot.pierceMult });
  add('bow', M.bow.shot.name + ' (vừa chạy)', M.bow.shot.move, M.bow.shot.mult, M.bow.shot.range, 0);
  add('bow', M.bow.charge.name + ' (đầy)', M.tap + M.bow.charge.time + M.bow.charge.recover * 0.55, M.bow.charge.mult1, M.bow.charge.range, 0, { pierce: M.bow.charge.pierce[2] });
  M.spear.chain.forEach((m) => add('spear', m.name, m.dur, m.mult, m.reach || m.r, m.depth || 'vòng', { push: m.push || 0 }));
  add('spear', M.spear.charge.name + ' (đầy)', M.tap + M.spear.charge.time + M.spear.charge.t + 0.2, M.spear.charge.mult1, M.spear.charge.len1, M.spear.charge.depth, { iframe: M.spear.charge.t });
  add('hammer', M.hammer.swing.name, M.hammer.swing.dur, M.hammer.swing.mult, M.hammer.swing.reach, M.hammer.swing.depth, { stagger: T.hammer.stagger });
  const hc = M.hammer.charge;
  add('hammer', hc.slam[1].name + ' (nấc 1)', M.tap + hc.lv1 + hc.recover * 0.64, hc.slam[1].mult, hc.slam[1].r, 'vòng', { wave: hc.slam[1].wave.mult });
  add('hammer', hc.slam[2].name + ' (nấc 2)', M.tap + hc.time + hc.recover * 0.64, hc.slam[2].mult, hc.slam[2].r, 'vòng', { stun: hc.slam[2].stun, wave: hc.slam[2].wave.mult });
  for (const k of ['sword', 'spear', 'hammer']) { const s = M.special[k]; out.push({ w: k, name: 'Đặc biệt: ' + s.name, dmg: +(T[k].dmg * s.mult).toFixed(1), reach: s.min + '-' + s.max, stun: s.stun || s.pin || 0, special: true }); }
  out.push({ w: 'bow', name: 'Đặc biệt: Mưa Tên', dmg: +(T.bow.dmg * M.bow.rain.mult).toFixed(1) + ' x ~6 đợt', reach: 'vòng 40', special: true });
  return out;
}
"""

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
  let starts = 0, landed = 0, dealt = 0, hurt = 0, frameHits = 0, hitFrames = 0, hitEvents = 0, atkT = 0;
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
      const a0 = P.atkT, h0 = P.hitDone;
      G.sim(1);
      if (P.atkT > a0 + 0.05 && !P.hitDone) starts++;
      if (!h0 && P.hitDone && a0 > 0) landed++;
      if (seen.size) { hitFrames++; }
      if (P.atkT > 0 || P.dashT > 0 || (P.mv && P.mv.holding)) atkT++;
      if (S.mode !== 'play') { bad = 'thoát khỏi trận: ' + S.mode; break; }
      if (!W.over) P.hp = Math.max(P.hp, P.maxhp * 0.6);
    }
  } finally { G.damage = dmg0; G.hurtPlayer = hurt0; G.rnd = Math.random; }
  return { dps: dealt / secs, hurt: hurt / secs, perHit: hitFrames ? frameHits / hitFrames : 0, kills: spawned - (one ? 1 : 5), dodgesMin: (S.stats.dodges - d0) / secs * 60,
           busy: atkT / (secs * 60), cancel: starts ? Math.max(0, 1 - landed / starts) : 0, marksMin: (W.marksGained - m0) / secs * 60, bad };
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
        st = pg.evaluate(STATIC)
        res['static'] = st
        print('== PHẦN 1: từng đòn (sát thương gốc loại vũ khí, chưa tính cấp/bậc/mài)')
        for r in st:
            print('  ', json.dumps(r, ensure_ascii=False))
        print('\n== PHẦN 2: bot, phòng thường, quái mới (máu x2,5), %d giây x %d hạt giống' % (SECS, SEEDS))
        print('%-7s %-10s %8s %8s %8s %8s %8s %8s %8s %6s' % ('vũ khí', 'cảnh', 'st/giây', 'mất/giây', 'quái/nhịp', '%raĐòn', 'né/phút', 'hạ', 'ấn/phút', '%huỷ'))
        for wt in ['sword', 'bow', 'spear', 'hammer']:
            for name, el, mk, one in [('cụm 5', None, 0, False), ('1 quái', None, 0, True), ('cụm, Mầm Lửa', 'fire', 30, False)]:
                tot = {}
                for s in range(SEEDS):
                    r = pg.evaluate(JS, [wt, el, mk, SECS, 500 + s * 31, one])
                    if r['bad'] or errs:
                        print('LỖI', wt, r['bad'], errs[:3]); sys.exit(1)
                    for k, v in r.items():
                        if k != 'bad': tot[k] = tot.get(k, 0) + v / SEEDS
                res[wt + '|' + name] = tot
                print('%-7s %-10s %8.1f %8.2f %8.2f %7.0f%% %8.1f %8.1f %8.1f %5.0f%%' % (wt, name[:10], tot['dps'], tot['hurt'], tot['perHit'], tot['busy'] * 100, tot['dodgesMin'], tot['kills'], tot['marksMin'], tot['cancel'] * 100))
                sys.stdout.flush()
        b.close()
    with open(os.path.join(ROOT, 'tests', 'au_vu_khi_ketqua.json'), 'w') as f:
        json.dump(res, f, ensure_ascii=False, indent=1)
    if errs:
        print('LỖI JS', errs[:5]); sys.exit(1)


main()
