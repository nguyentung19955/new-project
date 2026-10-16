#!/usr/bin/env python3
"""Phiên 3B: đo TRẬN THUỒNG LUỒNG bằng bot (chơi thật: mất máu, chết được), chỉ phòng trùm ải 4-5, vào phòng đầy máu.
Bản lưu kiem-can-bang/luu-A.json (ải 3-5) nâng cấp tới Sức mạnh khuyên dùng 4-5 (cấp tối đa 40 → ~662 / 690), hai vũ khí mang ÉP cùng một hệ
(bot "chỉ dùng 1 hệ", KE-HOACH mục 8.3). Ba bản game (cờ lúc nạp): truoc = ?tlrieng=0 (phiên 1: chiêu Ngư Tinh, sân thường),
sau = phiên 3B, motHe = ?tldoihe=0 (Độc suốt trận). Cùng chuỗi hạt ngẫu nhiên cho mọi bản.
  python3 do_trum.py [N=40] [he=fire,poison,ice]
Ghi: thắng (hạ trùm), thời gian hạ (lượt thắng), máu còn, đòn trúng bé / phút, số lần Vỗ sóng bờ / phút, đòn Vỗ sóng bờ trúng.
"""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game'))

JS = r"""([s, he, hat]) => {
  G.save = G.fixSave(JSON.parse(s)); G.save.sound = false;
  for (let ii = 0; ii < 4; ii++) G.save.stars['3-' + ii] = 1;
  const d = G.STAGE_REC[19], hs = G.save.heroes[G.save.hero];
  while (G.power() < d && hs.lvl < G.MAX_LEVEL) hs.lvl++;
  for (const id of G.save.carry) { const w = G.save.weapons.find((x) => x.id === id); if (!w) continue; const m = Math.max(w.marks.fire || 0, w.marks.poison || 0, w.marks.ice || 0, G.MARKS[1]); w.marks = { fire: 0, poison: 0, ice: 0 }; w.marks[he] = m; w.branch = he; }
  const pw = G.power();
  const rnd0 = G.rnd; G.rnd = G.srand(hat);
  const h0 = G.hurtPlayer, o = { trung: 0, mat: 0, song: 0, songTrung: 0, chieu: {}, phMat: [0, 0, 0], phT: [0, 0, 0] };
  G.hurtPlayer = function (amt, el, src, melee) {
    const W = G.getWorld(), P = W.P, hp0 = P.hp, r = h0.apply(this, arguments);
    if (r && hp0 > P.hp) {
      o.trung++; o.mat += hp0 - P.hp;
      const ph = W.boss ? W.boss.phase | 0 : 0; o.phMat[ph] += (hp0 - P.hp) / P.maxhp * 100;
      const sb = W.zones.some((z) => z.skill === 'Vỗ sóng bờ' && !(z.t > 0.02) && G.inZone(z, P));
      if (sb) o.songTrung++;
      const k = sb ? 'Vỗ sóng bờ' : (W.boss && W.boss.skillName) || '?';
      o.chieu[k] = (o.chieu[k] || 0) + Math.round(hp0 - P.hp);
    }
    return r;
  };
  let ketQua = null;
  try {
    G.startStage(3, 4, 0); G.testGoto('boss');
    const S = G.getRun(), W = S.W, b = W.boss, z0 = new Set();
    let t = 0;
    for (let i = 0; i < 2 * 240; i++) {
      if (S.won || S.mode === 'dead' || W.P.dead) break;
      o.phT[b.phase | 0] += 0.5; G.botRun(0.5); t += 0.5;
      for (const z of W.zones) if (z.skill === 'Vỗ sóng bờ' && !z0.has(z)) { z0.add(z); o.song++; }
    }
    ketQua = { win: !!S.won, t, hp: Math.round(W.P.hp / W.P.maxhp * 100), bossHp: b ? Math.round(Math.max(0, b.hp) / b.maxhp * 100) : 0, ph: b ? b.phase : 0 };
  } finally { G.hurtPlayer = h0; G.rnd = rnd0; }
  return Object.assign(ketQua, o, { pw: Math.round(pw), rec: d });
}"""


class Trang:
    def __init__(self, q):
        env = dict(os.environ); env['LK_Q'] = q
        self.p = subprocess.Popen(['node', os.path.join(GAME, 'tests', 'node_trang.js')], stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                  stderr=subprocess.DEVNULL, text=True, encoding='utf-8', bufsize=1, env=env)

    def goi(self, code, arg):
        self.p.stdin.write(json.dumps({'code': code.strip(), 'arg': arg}, ensure_ascii=False) + '\n'); self.p.stdin.flush()
        r = json.loads(self.p.stdout.readline())
        if not r.get('ok'): raise RuntimeError(r.get('loi', '?')[:600])
        return r['v']


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 40
    hes = sys.argv[2].split(',') if len(sys.argv) > 2 else ['fire', 'poison', 'ice']
    s14 = json.load(open(os.path.join(HERE, '..', 'kiem-can-bang', 'luu-A.json')))[14]
    s14 = s14 if isinstance(s14, str) else json.dumps(s14)
    ban = {k: v for k, v in {'truoc': 'tlrieng=0', 'sau': '', 'motHe': 'tldoihe=0'}.items() if k in (os.environ.get('BAN') or 'truoc,sau,motHe').split(',')}
    ban = {k: Trang(v) for k, v in ban.items()}
    kq = {}
    for he in hes:
        for ten, T in ban.items():
            rs = [T.goi(JS, [s14, he, 7001 + j * 97]) for j in range(n)]
            kq[f'{he}:{ten}'] = rs
            w = [r for r in rs if r['win']]
            tt = sum(r['t'] for r in rs) or 1
            ch = {}
            for r in rs:
                for k, v in r['chieu'].items(): ch[k] = ch.get(k, 0) + v
            top = ', '.join(f'{k} {v // n}' for k, v in sorted(ch.items(), key=lambda x: -x[1])[:5])
            print(f"{he:6s} {ten:6s} SM {rs[0]['pw']}/{rs[0]['rec']}  thắng {len(w)}/{n} ({100*len(w)/n:.0f}%)  tg hạ TB {sum(r['t'] for r in w)/max(1,len(w)):.0f}s  "
                  f"máu còn TB (thắng) {sum(r['hp'] for r in w)/max(1,len(w)):.0f}%  máu trùm còn TB (thua) {sum(r['bossHp'] for r in rs if not r['win'])/max(1,n-len(w)):.0f}%  "
                  f"đòn trúng/phút {sum(r['trung'] for r in rs)/tt*60:.2f}  sóng bờ/phút {sum(r['song'] for r in rs)/tt*60:.2f} (trúng {sum(r['songTrung'] for r in rs)})  "
                  f"theo pha (giây · % máu mất/phút): " + ' | '.join(f"{sum(r['phT'][k] for r in rs)/n:.0f}s · {sum(r['phMat'][k] for r in rs)/max(1,sum(r['phT'][k] for r in rs))*60:.0f}" for k in range(3)) + "  "
                  f"máu mất theo chiêu (mỗi lượt): {top}", flush=True)
    json.dump(kq, open(os.path.join(HERE, 'so-lieu-do-trum.json'), 'w'), ensure_ascii=False)


if __name__ == '__main__':
    main()
