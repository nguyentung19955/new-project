#!/usr/bin/env python3
"""Vùng 4 phiên 2A — đo bằng bot TRƯỚC / SAU (docs/ke-hoach/LUAT-CAN-BANG.md): 8 quái thường Sông sâu (bản thường) so với 8 con mượn Hang biển
(?quaisong=0 = phiên 1). Mỗi ải 4-1 … 4-5 chơi N lượt ở Sức mạnh ≈ khuyên dùng (bản lưu 3-5 của kiem-can-bang/luu-A.json, lên cấp tới khuyên dùng),
cùng hạt ngẫu nhiên cho hai bản. Ghi: thắng, thời gian, máu mất do quái thường (% máu tối đa / lượt), số lần bé trúng đòn quái thường.
  python3 do_quai_song.py [N=20] [ải: 0..4, phẩy]
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game'))
sys.path.insert(0, os.path.join(GAME, 'tests'))
import cd_lib  # noqa: E402

JS = r"""([s, i, seed]) => {
  G.save = G.fixSave(JSON.parse(s)); G.save.sound = false;
  for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) G.save.stars[r + '-' + k] = Math.max(1, G.save.stars[r + '-' + k] || 0);
  for (let k = 0; k < i; k++) G.save.stars['3-' + k] = 1;
  const rec = G.STAGE_REC[15 + i], hs = G.save.heroes[G.save.hero];
  while (G.power() < rec && hs.lvl < G.MAX_LEVEL) hs.lvl++;
  const pw = G.power();
  G.rnd = G.srand(seed);
  G.startStage(3, i, 0);
  const h0 = G.hurtPlayer, q = { mau: 0, lan: 0, vai: {} };
  G.hurtPlayer = function (amt, el, src, melee) {
    const W = G.getWorld(), P = W.P, hp = P.hp, r = h0.apply(this, arguments);
    const s2 = src && src.src ? src.src : src;
    if (r && s2 && !s2.isBoss && s2.role && s2.role !== 'elite') { const f = (hp - P.hp) / P.maxhp; q.mau += f; q.lan++; q.vai[s2.role] = (q.vai[s2.role] || 0) + f; }
    return r;
  };
  let out;
  try { out = G.probeRun(900); } finally { G.hurtPlayer = h0; }
  return { pw, rec, win: !!out.win, t: out.t, q, bad: out.bad.length, room: out.room, bossT: out.bossT };
}"""


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 20
    ais = [int(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 else [0, 1, 2, 3, 4]
    L = json.load(open(os.path.join(HERE, '..', 'kiem-can-bang', 'luu-A.json')))
    s = L[14]
    kq = {}
    for ten, q in (('truoc', 'quaisong=0'), ('sau', '')):
        os.environ['LK_Q'] = q
        pg = cd_lib.NodePage([])
        for i in ais:
            kq.setdefault(i, {})[ten] = [pg.evaluate(JS, [s, i, 101 + j * 7]) for j in range(n)]
        pg.close()
    os.environ.pop('LK_Q', None)
    print('| Ải | Sức mạnh / khuyên dùng | Thắng: trước → sau | Thời gian TB (giây) | Máu mất do quái thường (% máu tối đa / lượt) | Số đòn quái thường trúng / lượt |')
    print('|---|---|---|---|---|---|')
    vai = {}
    for i in ais:
        a, b = kq[i]['truoc'], kq[i]['sau']
        w = lambda x: sum(1 for r in x if r['win'])
        tb = lambda x, f: sum(f(r) for r in x) / len(x)
        print(f"| 4-{i+1} | {tb(b, lambda r: r['pw']):.0f} / {b[0]['rec']} | {w(a)}/{n} ({w(a)*100/n:.0f}%) → {w(b)}/{n} ({w(b)*100/n:.0f}%) | {tb(a, lambda r: r['t']):.0f} → {tb(b, lambda r: r['t']):.0f} | "
              f"{tb(a, lambda r: r['q']['mau'])*100:.0f}% → {tb(b, lambda r: r['q']['mau'])*100:.0f}% | {tb(a, lambda r: r['q']['lan']):.1f} → {tb(b, lambda r: r['q']['lan']):.1f} |")
        for ten in ('truoc', 'sau'):
            for r in kq[i][ten]:
                for k, v in r['q']['vai'].items(): vai.setdefault(k, {}).setdefault(ten, 0); vai[k][ten] += v
        bad = sum(r['bad'] for r in a + b)
        if bad: print(f'  (lỗi số: {bad})')
    tong = n * len(ais)
    print()
    print('Máu mất theo vai (cả các ải đo, % máu tối đa / lượt): ' + ', '.join(f"{k} {v.get('truoc', 0)*100/tong:.1f}% → {v.get('sau', 0)*100/tong:.1f}%" for k, v in sorted(vai.items())))
    json.dump(kq, open(os.path.join(HERE, 'so-lieu-do.json'), 'w'), ensure_ascii=False)


main()
