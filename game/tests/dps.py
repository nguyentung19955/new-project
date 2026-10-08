"""Đo sát thương theo thời gian của bốn vũ khí khi bot chơi trong một sân tập có quái hồi sinh liên tục.
Mỗi vũ khí đo ở bốn trạng thái: chưa có hệ, và Thức tỉnh Lửa, Độc, Băng. Số ngẫu nhiên có hạt giống nên chạy lại ra đúng số cũ.
Chạy: python3 tests/dps.py [giây mỗi lượt] [số hạt giống] [nho]   ("nho": sân nhỏ 208 điểm ảnh)
Thoát mã 1 nếu bốn vũ khí (chưa có hệ) lệch nhau quá 15% so với trung bình, hoặc ba hệ lệch nhau quá 15%."""
import os, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JS = r"""
([wtype, el, secs, seed, small]) => {
  for (const k of G.HKEYS) G.HEROES[k].fav = [];           // bỏ thưởng vũ khí ưa thích để so cho công bằng
  G.testSave({ hero: 'smith', melee: wtype === 'bow' ? 'sword' : wtype, lvl: 10, tier: 1, sharpen: 3, branch: el || undefined, marks: el ? 300 : 0 });
  G.rnd = G.srand(seed);
  G.startStage(0, 2, 0);
  const S = G.getRun(), W = G.getWorld(), P = S.P;
  W.waves = []; W.props = [];
  if (small) { W.x1 = 218; W.w = 228; }
  Object.assign(G.botCfg, { prefer: wtype, explore: false, props: false });
  if (G.curW(P).type !== wtype) P.cur = 1 - P.cur;
  let dealt = 0, hurt = 0;
  const dmg0 = G.damage, hurt0 = G.hurtPlayer;
  G.damage = function (t, amt, o) {
    const h = t.hp, r = dmg0(t, amt, o);
    if (!o || o.fromPlayer !== false) dealt += Math.max(0, h - Math.max(0, t.hp));
    return r;
  };
  G.hurtPlayer = function (a, b, c, d) { const h = P.hp, r = hurt0(a, b, c, d); hurt += Math.max(0, h - P.hp); return r; };
  const roles = ['rusher', 'rusher', 'swarm', 'shield', 'archer', 'nimble', 'swarm', 'rusher'];
  let ri = 0, kills = 0, bad = '';
  try {
    for (let f = 0; f < secs * 60; f++) {
      const alive = W.ents.filter((e) => !e.dead).length;
      if (alive < 5) {
        const side = G.rnd() < 0.5 ? W.x0 + 8 : W.x1 - 8;
        const e = G.spawnEnemy(roles[ri++ % roles.length], side + G.rr(-4, 4), G.rr(W.y0 + 6, W.y1 - 6), {});
        e.inside = true; kills++;
      }
      G.sim(1);
      if (S.mode !== 'play') { bad = 'thoát khỏi trận: ' + S.mode; break; }
      if (!W.over) P.hp = Math.max(P.hp, P.maxhp * 0.6);
      if (!isFinite(P.x) || !isFinite(P.hp)) { bad = 'số liệu hỏng'; break; }
    }
  } finally { G.damage = dmg0; G.hurtPlayer = hurt0; G.rnd = Math.random; }
  const st = S.stats;
  return { dps: dealt / secs, hurt: hurt / secs, kills: kills - 5, bad, melee: Math.round(st.melee), ranged: Math.round(st.ranged), el: st.el, marks: Math.round(S.W.marksGained) };
}
"""

def main():
    args = [a for a in sys.argv[1:] if a != 'nho']
    small = 'nho' in sys.argv
    secs = int(args[0]) if len(args) > 0 else 60
    seeds = int(args[1]) if len(args) > 1 else 4
    errs = []
    table = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        print('sân', 'nhỏ 208' if small else 'dài 460', '|', secs, 'giây x', seeds, 'hạt giống')
        print('%-7s %-6s %7s %7s %6s %7s' % ('vũ khí', 'hệ', 'st/giây', 'bị đánh', 'hạ', 'dấu ấn'))
        for wt in ['sword', 'bow', 'spear', 'hammer']:
            for el in [None, 'fire', 'poison', 'ice']:
                tot = {'dps': 0, 'hurt': 0, 'kills': 0, 'marks': 0}
                for s in range(seeds):
                    if os.environ.get('DPS_PRE'): pg.evaluate(os.environ['DPS_PRE'])  # đoạn JS chỉnh thử con số trước khi đo
                    r = pg.evaluate(JS, [wt, el, secs, 1000 + s * 77, small])
                    if r['bad'] or errs:
                        print('LỖI', wt, el, r['bad'], errs[:3]); sys.exit(1)
                    for k in tot:
                        tot[k] += r[k] / seeds
                table[(wt, el)] = tot
                print('%-7s %-6s %7.1f %7.1f %6.1f %7.1f' % (wt, el or 'không', tot['dps'], tot['hurt'], tot['kills'], tot['marks']))
                sys.stdout.flush()
        b.close()
    bad = 0
    base = [table[(w, None)]['dps'] for w in ['sword', 'bow', 'spear', 'hammer']]
    avg = sum(base) / 4
    dev = max(abs(x - avg) / avg for x in base)
    print('Bốn vũ khí (chưa có hệ): trung bình %.1f, lệch nhiều nhất %.0f%% so với trung bình, cao nhất hơn thấp nhất %.0f%%' % (avg, dev * 100, (max(base) / min(base) - 1) * 100))
    if dev > 0.15: bad += 1
    els = [sum(table[(w, e)]['dps'] for w in ['sword', 'bow', 'spear', 'hammer']) / 4 for e in ['fire', 'poison', 'ice']]
    eavg = sum(els) / 3
    edev = max(abs(x - eavg) / eavg for x in els)
    print('Ba hệ ở Thức tỉnh (trung bình bốn vũ khí): Lửa %.1f, Độc %.1f, Băng %.1f, lệch nhiều nhất %.0f%%' % (els[0], els[1], els[2], edev * 100))
    if edev > 0.15: bad += 1
    sys.exit(1 if bad else 0)

main()
