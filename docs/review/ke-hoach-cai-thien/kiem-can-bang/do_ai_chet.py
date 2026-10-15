#!/usr/bin/env python3
"""A — ải thua ở đâu: chơi cả ải N lần ở Sức mạnh ≈ khuyên dùng (bản lưu luu-A.json, nâng cấp nhân vật nếu thiếu như do_trum_a.py),
ghi: thắng, tới phòng trùm, thắng trùm trong số lượt tới, máu còn lúc vào phòng trùm, nguồn mất máu (quái thường / tinh anh / trùm),
lớp thích nghi trùm nhận được trong lượt thật (G.computeLayers), máu mất ở phòng trùm theo chiêu.
  python3 .../do_ai_chet.py <ải 0..14, phẩy> [N=40] [--luu=tệp: luu-A.json (mặc định, 1 bản/ải) hoặc tệp do_chien_dich.py --luu-tat (nhiều bản/ải)]
  Biến môi trường LK_JS=mã: chạy mã đó trong game trước khi đo (thử đề xuất số trong bộ nhớ, không sửa tệp game).
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.environ.get('LK_GAME', os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game')))
sys.path.insert(0, os.path.join(GAME, 'tests'))
import cd_lib  # noqa: E402

JS = r"""([s, d, r, i, c2]) => {
  G.save = G.fixSave(JSON.parse(s)); G.save.sound = false;
  const hs = G.save.heroes[G.save.hero];
  while (G.power() < d && hs.lvl < G.MAX_LEVEL) hs.lvl++;
  while (c2 && G.power() > d * 1.02 && hs.lvl > 1) hs.lvl--; // bản lưu trên khuyên dùng: hạ cấp cho Sức mạnh ≈ khuyên dùng
  const pw = G.power();
  G.startStage(r, i, 0);
  const out = { pw };
  let mau = null, lop = null;
  const hb = {};
  const orig = G.sim, h0 = G.hurtPlayer;
  G.sim = function (n) {
    const S2 = G.getRun();
    if (S2 && S2.W && S2.W.type === 'boss' && mau == null) { mau = Math.round(S2.P.hp / S2.P.maxhp * 100); const b = S2.W.boss; lop = b && b.layers ? b.layers.map((l) => l.type + (l.el ? ':' + l.el : '')) : []; }
    return orig.apply(this, arguments);
  };
  G.hurtPlayer = function (amt, el, src, melee) {
    const W = G.getWorld(), P = W.P, hp0 = P.hp, r = h0.apply(this, arguments), b = W.boss;
    if (r && W.type === 'boss' && b && !b.dead) { const k = 'p' + (b.phase + 1) + ' ' + (b.skillName || '?'); const q = hb[k] || (hb[k] = [0, 0, 0]); q[0] += (hp0 - P.hp) / P.maxhp; q[1]++; q[2] = Math.max(q[2], (hp0 - P.hp) / P.maxhp); }
    return r;
  };
  try { Object.assign(out, G.probeRun(900)); } finally { G.sim = orig; G.hurtPlayer = h0; }
  out.mauVaoTrum = mau; out.lop = lop; out.hb = hb;
  return out;
}"""


def main():
    st = [int(x) for x in sys.argv[1].split(',')]
    n = int(sys.argv[2]) if len(sys.argv) > 2 and not sys.argv[2].startswith('--') else 40
    lf = ([a.split('=', 1)[1] for a in sys.argv if a.startswith('--luu=')] or [os.path.join(HERE, 'luu-A.json')])[0]
    L = json.load(open(lf))
    nhieu = isinstance(L, dict)  # do_chien_dich.py --luu-tat: nhiều bản lưu mỗi ải → lần lượt từng bản, đưa Sức mạnh về ≈ khuyên dùng (lên / xuống cấp)
    pg = cd_lib.NodePage([])
    if os.environ.get('LK_JS'):  # thử một đề xuất số TRONG BỘ NHỚ (không sửa tệp game), vd LK_JS='G.STAGE_K.mob[8] = [1.3, 2.2]'
        pg.evaluate('() => { ' + os.environ['LK_JS'] + '; return 1; }')
    print('| Ải | SM / khuyên dùng | Thắng ải | Tới phòng trùm | Thắng trùm (trong số tới) | Máu còn lúc vào trùm | Mất máu: quái thường · tinh anh · trùm |')
    print('|---|---|---|---|---|---|---|')
    extra = []
    for k in st:
        r, i = divmod(k, 5)
        rec = pg.evaluate('(k) => G.STAGE_REC[k]', k)
        ds = L[str(k)] if nhieu else [L[k]]
        rs = [pg.evaluate(JS, [ds[j % len(ds)], rec, r, i, nhieu]) for j in range(n)]
        w = sum(1 for x in rs if x.get('win'))
        toi = [x for x in rs if x.get('mauVaoTrum') is not None]
        wt = sum(1 for x in toi if x.get('win'))
        h = {'q': 0, 'e': 0, 't': 0}
        for x in rs:
            for kk, v in (x.get('hurt') or {}).items():
                src = kk.split(':')[1]
                h['t' if src in ('trùm-đánh', 'vùng-trùm') else 'e' if src == 'elite' else 'q'] += v
        tot = sum(h.values()) or 1
        vai = {}
        for x in rs:
            for kk, v in (x.get('hurt') or {}).items():
                vai[kk.split(':')[1]] = vai.get(kk.split(':')[1], 0) + v
        lop = {}
        for x in toi:
            for l in x.get('lop') or []:
                lop[l] = lop.get(l, 0) + 1
        hb = {}
        for x in toi:
            for kk, v in (x.get('hb') or {}).items():
                q = hb.setdefault(kk, [0, 0, 0]); q[0] += v[0]; q[1] += v[1]; q[2] = max(q[2], v[2])
        tb = sum(v[0] for v in hb.values()) or 1
        extra.append(f"{r+1}-{i+1}: lớp thích nghi của trùm (số lượt / {len(toi)}): " + (', '.join(f'{a} {b}' for a, b in sorted(lop.items(), key=lambda q: -q[1])) or 'không') +
                     ' | mất máu theo loại quái (cả ải): ' + ', '.join(f"{a} {b*100/tot:.0f}%" for a, b in sorted(vai.items(), key=lambda q: -q[1])[:6]) +
                     ' | máu mất ở phòng trùm theo chiêu: ' + '; '.join(f"{kk} {v[0]*100/tb:.0f}% (to nhất {v[2]*100:.0f}%)" for kk, v in sorted(hb.items(), key=lambda q: -q[1][0])[:5]))
        print(f"| {r+1}-{i+1} | {sum(x['pw'] for x in rs)/n:.0f}/{rec}{' (' + str(len(ds)) + ' bản lưu)' if nhieu else ''} | {w}/{n} ({w*100/n:.0f}%) | {len(toi)}/{n} | {wt}/{max(1,len(toi))} ({wt*100/max(1,len(toi)):.0f}%) | "
                  f"{(sum(x['mauVaoTrum'] for x in toi)/max(1,len(toi))):.0f}% | {h['q']*100/tot:.0f}% · {h['e']*100/tot:.0f}% · {h['t']*100/tot:.0f}% |", flush=True)
    print()
    for e in extra:
        print('- ' + e)
    pg.close()


main()
