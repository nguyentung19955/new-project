#!/usr/bin/env python3
"""Vùng 4 phiên 3A — đo bằng bot TRƯỚC / SAU (docs/ke-hoach/LUAT-CAN-BANG.md): 2 tinh anh + trùm nhỏ Cá Trê (bản thường) so với tinh anh /
trùm nhỏ mượn Hang biển (?trumsong=0 = phiên 1 / 2A). Mỗi ải 4-1 … 4-5 chơi N lượt ở Sức mạnh ≈ khuyên dùng (bản lưu 3-5 của
kiem-can-bang/luu-A.json, lên cấp tới khuyên dùng), cùng hạt ngẫu nhiên cho hai bản. Ghi: thắng, thời gian, linh khí, máu mất do tinh anh /
trùm nhỏ (% máu tối đa / lượt), đòn mạnh nhất của tinh anh / trùm nhỏ (% máu tối đa), thời gian đánh trùm nhỏ.
  python3 do_3a.py [N=20] [ải: 0..4, phẩy]
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
  const h0 = G.hurtPlayer, q = { ta: 0, tn: 0, maxTa: 0, maxTn: 0, lanTa: 0, lanTn: 0, luoi: 0 };
  G.hurtPlayer = function (amt, el, src, melee) {
    const W = G.getWorld(), P = W.P, hp = P.hp, r = h0.apply(this, arguments);
    const s2 = src && src.src ? src.src : src, f = (hp - P.hp) / P.maxhp;
    if (r && s2 && s2.role === 'elite') { q.ta += f; q.lanTa++; q.maxTa = Math.max(q.maxTa, f); }
    else if (r && ((s2 && s2.isBoss && s2.kind === 'mini') || (!s2 && W.boss && W.boss.kind === 'mini' && !W.boss.dead))) { q.tn += f; q.lanTn++; q.maxTn = Math.max(q.maxTn, f); }
    return r;
  };
  let out, n0 = 0;
  const tick0 = G.sim;
  try { out = G.probeRun(900); } finally { G.hurtPlayer = h0; }
  const S = G.getRun();
  return { pw, rec, win: !!out.win, t: out.t, marks: out.marks, q, bad: out.bad.length, room: out.room, bossT: out.bossT };
}"""


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 20
    ais = [int(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 else [0, 1, 2, 3, 4]
    L = json.load(open(os.path.join(HERE, '..', 'kiem-can-bang', 'luu-A.json')))
    s = L[14]
    kq = {}
    for ten, q in (('truoc', 'trumsong=0'), ('sau', '')):
        os.environ['LK_Q'] = q
        pg = cd_lib.NodePage([])
        for i in ais:
            kq.setdefault(i, {})[ten] = [pg.evaluate(JS, [s, i, 301 + j * 7]) for j in range(n)]
        pg.close()
    os.environ.pop('LK_Q', None)
    json.dump(kq, open(os.path.join(HERE, 'so-lieu-do.json'), 'w'), ensure_ascii=False)
    in_bang(kq, n, ais)


def in_bang(kq, n, ais):
    tb = lambda x, f: sum(f(r) for r in x) / max(1, len(x))
    w = lambda x: sum(1 for r in x if r['win'])
    print('| Ải | SM / khuyên dùng | Thắng: trước → sau | Thời gian TB (giây) | Linh khí TB | Máu mất do tinh anh (% / lượt) | Máu mất do trùm nhỏ (% / lượt) | Đòn mạnh nhất tinh anh / trùm nhỏ (% máu) | Đánh trùm nhỏ (giây, lượt tới được) |')
    print('|---|---|---|---|---|---|---|---|---|')
    for i in ais:
        a, b = kq[i]['truoc'], kq[i]['sau']
        mx = lambda x, k: max([r['q'][k] for r in x] + [0])
        bt = lambda x: [r.get('bossT') for r in x if r.get('bossT') is not None and i < 4]
        bts = lambda x: (f"{sum(bt(x))/len(bt(x)):.0f}" if bt(x) else '—')
        print(f"| 4-{i+1} | {tb(b, lambda r: r['pw']):.0f} / {b[0]['rec']} | {w(a)}/{n} ({w(a)*100/n:.0f}%) → {w(b)}/{n} ({w(b)*100/n:.0f}%) | {tb(a, lambda r: r['t']):.0f} → {tb(b, lambda r: r['t']):.0f} | "
              f"{tb(a, lambda r: r['marks'] or 0):.0f} → {tb(b, lambda r: r['marks'] or 0):.0f} | {tb(a, lambda r: r['q']['ta'])*100:.0f}% → {tb(b, lambda r: r['q']['ta'])*100:.0f}% | "
              f"{tb(a, lambda r: r['q']['tn'])*100:.0f}% → {tb(b, lambda r: r['q']['tn'])*100:.0f}% | {mx(a,'maxTa')*100:.0f} / {mx(a,'maxTn')*100:.0f} → {mx(b,'maxTa')*100:.0f} / {mx(b,'maxTn')*100:.0f} | "
              f"{bts(a)} → {bts(b)} ({len(bt(a))} → {len(bt(b))}) |")
        bad = sum(r['bad'] for r in a + b)
        if bad: print(f'  (lỗi số: {bad})')


if len(sys.argv) > 1 and sys.argv[1] == '--in':  # in lại bảng từ so-lieu-do.json
    K = {int(k): v for k, v in json.load(open(os.path.join(HERE, 'so-lieu-do.json'))).items()}
    in_bang(K, len(next(iter(K.values()))['sau']), sorted(K))
else:
    main()
