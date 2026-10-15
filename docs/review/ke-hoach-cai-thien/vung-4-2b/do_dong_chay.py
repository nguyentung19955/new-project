#!/usr/bin/env python3
"""Phiên 2B (vùng 4 Sông sâu): đo bằng bot luật riêng của vùng — dòng chảy có gây chết oan không, tỉ lệ thắng / kinh tế trước–sau.
Bot chơi THẬT (mất máu, chết được) cả ải 4-1..4-5, bản lưu luu-A.json (ải 3-5) nâng cấp tới Sức mạnh ≈ khuyên dùng của ải (hoặc cấp tối đa),
ba chế độ trên CÙNG chuỗi hạt ngẫu nhiên (lượt j của mọi chế độ dùng hạt giống nhau):
  truoc     = G.SONG_LUAT = false (như phiên 1: nấm / chậu than / tinh thể, không dòng, không vũng)
  sau       = đủ luật (dòng chảy + cầu tre, nước sâu, lục bình, đèn dầu)
  khongdong = ?dongchay=0 (đủ luật trừ dòng chảy)
Ghi: thắng, chết, thời gian, linh khí (S.marks), quái hạ; đòn trúng em bé khi đang đứng trong dòng (không trên cầu), trong đó đòn vùng / đạn;
chết mà đòn cuối trúng lúc đang trôi; số bước đẩy bị chặn vì sẽ đưa em bé vào vùng đỏ (W.songChan).
  python3 do_dong_chay.py [N=30] [ải=0,1,2,3,4]
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game'))
sys.path.insert(0, os.path.join(GAME, 'tests'))
import cd_lib  # noqa: E402

JS = r"""([s, i, che, hat]) => {
  G.SONG_LUAT = che !== 'truoc'; G.DONG_CHAY = che !== 'khongdong';
  G.save = G.fixSave(JSON.parse(s)); G.save.sound = false;
  for (let ii = 0; ii < i; ii++) G.save.stars['3-' + ii] = 1;
  const k = 15 + i, d = G.STAGE_REC[k], hs = G.save.heroes[G.save.hero];
  while (G.power() < d && hs.lvl < G.MAX_LEVEL) hs.lvl++;
  const pw = G.power();
  const rnd0 = G.rnd; G.rnd = G.srand(hat);
  const L = G.songLuat, h0 = G.hurtPlayer, o = { pw, rec: d, trungTrongDong: 0, vungTrongDong: 0, cuoiTrongDong: false, chan: 0, dong: 0 };
  let W0 = null;
  G.hurtPlayer = function (amt, el, src, melee) {
    const W = G.getWorld(), P = W.P, hp0 = P.hp, r = h0.apply(this, arguments);
    if (r && hp0 > P.hp) {
      o.tong = (o.tong || 0) + 1; if (!melee) o.xa = (o.xa || 0) + 1;
      const trong = !!(L && L.dongTai(W, P.x, P.y)), vuaTroi = P.troiLuc != null && (G.time || 0) - P.troiLuc < 0.35;
      if (trong) { o.trungTrongDong++; if (!melee) o.vungTrongDong++; }
      if (vuaTroi && !melee) {
        o.vuaTroiVung = (o.vuaTroiVung || 0) + 1;
        const zs = W.zones.filter((z) => z.team !== 'player' && z.team !== 'fx' && z.shape && !(z.t > 0) && G.inZone(z, P));
        if (!zs.length) o.vtDan = (o.vtDan || 0) + 1;
        else if (P.truocDay && zs.some((z) => G.inZone(z, { x: P.truocDay[0], y: P.truocDay[1] }))) o.vtSan = (o.vtSan || 0) + 1;
        else o.vtDay = (o.vtDay || 0) + 1;
      }
      o.cuoiTrongDong = trong;
    }
    return r;
  };
  try {
    G.startStage(3, i, 0);
    const sim0 = G.sim;
    G.sim = function (n) { const S = G.getRun(); if (S && S.W && S.W !== W0) { if (W0) { o.chan += W0.songChan || 0; o.dong += (W0.song && W0.song.dai.length) || 0; } W0 = S.W; } return sim0.apply(this, arguments); };
    try { Object.assign(o, G.probeRun(900)); } finally { G.sim = sim0; }
    if (W0) { o.chan += W0.songChan || 0; o.dong += (W0.song && W0.song.dai.length) || 0; }
  } finally { G.hurtPlayer = h0; G.rnd = rnd0; G.SONG_LUAT = true; G.DONG_CHAY = true; }
  return { win: !!o.win, t: o.t, marks: o.marks, kills: o.kills, room: o.room, pw: Math.round(pw), rec: d, trung: o.trungTrongDong, vung: o.vungTrongDong,
    chetTroi: !o.win && o.cuoiTrongDong, tong: o.tong || 0, xa: o.xa || 0, vuaTroi: o.vuaTroiVung || 0, vtDan: o.vtDan || 0, vtSan: o.vtSan || 0, vtDay: o.vtDay || 0, chan: o.chan, dong: o.dong, hp: o.hp, maxhp: o.maxhp };
}"""


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 30
    ais = [int(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 else [0, 1, 2, 3, 4]
    s14 = json.load(open(os.path.join(HERE, '..', 'kiem-can-bang', 'luu-A.json')))[14]
    pg = cd_lib.NodePage([])
    kq = {}
    for i in ais:
        for che in ('truoc', 'sau', 'khongdong'):
            rs = [pg.evaluate(JS, [s14, i, che, 9001 + j * 131 + i]) for j in range(n)]
            kq[f'{i}:{che}'] = rs
            w = sum(r['win'] for r in rs)
            print(f"4-{i+1} {che:9s} SM {rs[0]['pw']}/{rs[0]['rec']}  thắng {w}/{n} ({100*w/n:.0f}%)  "
                  f"tg TB {sum(r['t'] for r in rs)/n:.0f}s  linh khí TB {sum(r['marks'] or 0 for r in rs)/n:.0f}  quái TB {sum(r['kills'] or 0 for r in rs)/n:.1f}  "
                  f"đòn trúng bé/phút {sum(r['tong'] for r in rs)/max(1,sum(r['t'] for r in rs))*60:.2f} (vùng+đạn {sum(r['xa'] for r in rs)/max(1,sum(r['t'] for r in rs))*60:.2f})  dải gặp/lượt {sum(r['dong'] for r in rs)/n:.1f}  đòn trúng khi trong dòng {sum(r['trung'] for r in rs)} (không phải đòn đánh trực tiếp {sum(r['vung'] for r in rs)})  "
                  f"đòn vùng/đạn trúng ≤0,35 s sau khi bị đẩy {sum(r['vuaTroi'] for r in rs)} [đạn {sum(r['vtDan'] for r in rs)} · vùng đã đứng trong từ trước {sum(r['vtSan'] for r in rs)} · vùng do bị đẩy vào {sum(r['vtDay'] for r in rs)}]  chết đòn cuối khi đang trôi {sum(r['chetTroi'] for r in rs)}  bước đẩy bị chặn {sum(r['chan'] for r in rs)}", flush=True)
    json.dump(kq, open(os.path.join(HERE, 'so-lieu-do-dong-chay.json'), 'w'), ensure_ascii=False)
    pg.close()


if __name__ == '__main__':
    main()
