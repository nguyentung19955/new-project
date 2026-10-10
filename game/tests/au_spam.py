"""AUDIT (phiên au-vu-khi-he): đứng một chỗ spam đánh có hơn di chuyển + né không? Chỉ đọc số, không đổi luật chơi.
Chạy (từ thư mục game):  python3 tests/au_spam.py [số lượt mỗi ô]
Hai kiểu bot cùng một bản lưu, cùng hạt giống:
  ne   : bot thường của tests/bot.js (thấy vùng đỏ thì chạy ra, lăn né đạn, né quái sắp ra đòn).
  spam : cùng bot nhưng "mù" nguy hiểm: không thấy vùng đỏ, đạn của quái; không bao giờ bấm Né. Chỉ đi tới quái và đánh liên tục.
Đo trên phòng đánh quái (ải 1-3, 2-3, 3-3) và phòng trùm (3 trùm vùng, 1 trùm nhỏ): thời gian dọn phòng / hạ trùm,
% máu mất, tỉ lệ thắng (không gục). Bản lưu dựng sao cho Sức mạnh vừa đạt khuyên dùng của ải (in ra để so). Không bình máu.
"""
import os, sys, json, statistics
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
N = int(sys.argv[1]) if len(sys.argv) > 1 else 6

LIB = r"""
(() => {
  const orig = G.botInput;
  window.AU = { mode: 'ne' };
  G.botInput = function (S) {
    if (AU.mode !== 'spam') return orig(S);
    const W = S.W, z0 = W.zones, p0 = W.projs;
    W.zones = z0.filter((z) => z.team === 'player' || z.team === 'fx');
    W.projs = p0.filter((o) => o.team !== 'enemy');
    let inp;
    try { inp = orig(S); } finally { W.zones = z0; W.projs = p0; }
    inp.dodgeP = false;
    return inp;
  };
})();
"""

JS = r"""
([mode, r, i, room, seed, sv, wt]) => {
  AU.mode = mode;
  // bản lưu đạt đúng Sức mạnh khuyên dùng của ải: tăng dần cấp (bậc, mài đi theo cấp) tới khi đủ
  const rec0 = G.stageRec(r, i, 0);
  for (let L = 1; L <= 40; L++) {
    G.testSave({ hero: 'smith', melee: wt, lvl: L, tier: Math.min(3, Math.floor(L / 9)), sharpen: Math.min(15, Math.floor(L / 2.6)), armor: ['a_r1', 'a_r2', 'a_r3'][r], helm: ['h_r1', 'h_r2', 'h_r3'][r], forge: 4 });
    if (G.power() >= rec0 * (sv.k || 1)) break;
  }
  G.rnd = G.srand(seed);
  G.startStage(r, i, 0, { kind: 'A', seed: seed });
  const S = G.getRun();
  Object.assign(G.botCfg, { prefer: wt, explore: false, side: true });
  const power = G.power(), rec = G.stageRec(r, i, 0);
  if (room === 'boss') G.gotoRoom(S.map.boss); else G.testGoto('fight');
  let W = G.getWorld(), P = S.P;
  P.hp = P.maxhp; P.potions = 0;
  const hp0 = P.maxhp;
  let t = 0, hurt = 0, hits = 0, dead = false, done = false;
  const hurt0 = G.hurtPlayer;
  G.hurtPlayer = function (a, b, c, d) { const h = P.hp, x = hurt0(a, b, c, d); if (x) { hits++; hurt += Math.max(0, h - P.hp); } return x; };
  try {
    for (let f = 0; f < 240 * 2; f++) {
      if (S.mode === 'dead' || P.dead || W.over === 'dead') { dead = true; break; }
      if (room === 'boss' ? (S.won || (W.boss && W.boss.dead)) : (W.cleared && !W.ents.some((e) => !e.dead))) { done = true; break; }
      if (S.mode !== 'play') { G.botRun(1); if (S.mode !== 'play') break; continue; }
      G.sim(30); t += 0.5;
      if (G.getWorld() !== W) break; // bot bỏ phòng (không nên xảy ra)
    }
  } finally { G.hurtPlayer = hurt0; G.rnd = Math.random; AU.mode = 'ne'; }
  const b = W.boss;
  return { t, hurtPct: hurt / hp0, hits, dead, done, power, rec, bossHp: b ? Math.max(0, b.hp) / b.maxhp : null };
}
"""

SAVES = [{'k': 1.0}, {'k': 1.0}, {'k': 1.0}]  # hệ số so với Sức mạnh khuyên dùng (bản lưu dựng tự động trong JS)
CASES = [('phòng quái 1-3', 0, 2, 'fight'), ('phòng quái 2-3', 1, 2, 'fight'), ('phòng quái 3-3', 2, 2, 'fight'),
         ('trùm nhỏ Cua Đá 2-3', 1, 2, 'boss'), ('Mộc Tinh 1-5', 0, 4, 'boss'), ('Ngư Tinh 2-5', 1, 4, 'boss'), ('Hồ Tinh 3-5', 2, 4, 'boss')]


def main():
    errs = []
    res = []
    WT = os.environ.get('VK', 'sword,hammer').split(',')
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        pg.evaluate(LIB)
        print('%-22s %-7s %-5s %6s %8s %8s %8s %8s %10s' % ('cảnh', 'vũ khí', 'kiểu', 'thắng', 'giây', '%máu mất', 'lần trúng', 'SM/khuyên', 'trùm còn'))
        for name, r, i, room in CASES:
            for wt in WT:
                for mode in ['ne', 'spam']:
                    rows = [pg.evaluate(JS, [mode, r, i, room, 900 + k * 17, SAVES[r], wt]) for k in range(N)]
                    if errs:
                        print('LỖI JS', errs[:3]); sys.exit(1)
                    win = sum(1 for x in rows if x['done'] and not x['dead'])
                    tw = [x['t'] for x in rows if x['done'] and not x['dead']]
                    hp = statistics.mean(min(1, x['hurtPct']) for x in rows)
                    hits = statistics.mean(x['hits'] for x in rows)
                    bh = [x['bossHp'] for x in rows if x['bossHp'] is not None and x['dead']]
                    out = {'case': name, 'wt': wt, 'mode': mode, 'win': win, 'n': N, 't': statistics.mean(tw) if tw else None, 'hurt': hp, 'hits': hits, 'power': rows[0]['power'], 'rec': rows[0]['rec'], 'bossLeft': statistics.mean(bh) if bh else None}
                    res.append(out)
                    print('%-22s %-7s %-5s %3d/%-2d %8s %7.0f%% %8.1f %5d/%-4d %10s' % (name[:22], wt, mode, win, N, ('%.1f' % out['t']) if tw else '-', hp * 100, hits, out['power'], out['rec'], ('%.0f%%' % (out['bossLeft'] * 100)) if bh else '-'))
                    sys.stdout.flush()
        b.close()
    with open(os.path.join(ROOT, 'tests', 'au_spam_ketqua.json'), 'w') as f:
        json.dump(res, f, ensure_ascii=False, indent=1)


main()
