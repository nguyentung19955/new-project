#!/usr/bin/env python3
"""A — CHỈ SỐ THEO CẤP (luật game thật trong Node): mỗi cấp 1..40, cùng đồ (bản lưu mới: 4 vũ khí Trắng +0, không bộ),
in máu tối đa, phần đòn (off), Sức mạnh, kinh nghiệm cần (G.xpNeed) và cộng dồn. Hai cột: chỉ cấp, và cấp + điểm kỹ năng
(1 điểm / 3 cấp chia đều Công/Thủ/Hệ như tests/setup.js) + cây chưởng tự học (G.chuong.autoLearn).
  python3 docs/review/ke-hoach-cai-thien/kiem-can-bang/do_cap.py [--json=tệp]"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.environ.get('LK_GAME', os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game')))
sys.path.insert(0, os.path.join(GAME, 'tests'))
import cd_lib  # noqa: E402

JS = r"""() => {
  const out = [];
  let cum = 0;
  for (let L = 1; L <= 40; L++) {
    G.resetSave(); G.save.sound = false; G.save.tut.done = true;
    const hs = G.save.heroes.smith; hs.lvl = L;
    const P0 = G.buildPlayer(), q0 = G.powerParts();
    hs.sk = { atk: 0, def: 0, elem: 0 };
    let pts = Math.min(G.SKEYS.length * 5, Math.floor(L / 3));
    for (let i = 0; pts > 0; i++, pts--) hs.sk[G.SKEYS[i % 3]]++;
    if (G.chuong && G.chuong.autoLearn) G.chuong.autoLearn(hs, 'smith');
    const P1 = G.buildPlayer(), q1 = G.powerParts();
    out.push({ L, hp: P0.maxhp, off: +q0.off.toFixed(2), sm: q0.power, hp2: P1.maxhp, off2: +q1.off.toFixed(2), sm2: q1.power, xp: G.xpNeed(L), cum });
    cum += G.xpNeed(L);
  }
  G.resetSave();
  return out;
}"""


def main():
    pg = cd_lib.NodePage([])
    rows = pg.evaluate(JS)
    pg.close()
    print('| Cấp | Máu | Đòn | Sức mạnh | +% SM so cấp trước | Máu (có kỹ năng + chưởng) | Đòn (có) | Sức mạnh (có) | +% | KN cần lên cấp | KN cộng dồn tới cấp này |')
    print('|---|---|---|---|---|---|---|---|---|---|---|')
    for k, x in enumerate(rows):
        d1 = (x['sm'] / rows[k - 1]['sm'] - 1) * 100 if k else 0
        d2 = (x['sm2'] / rows[k - 1]['sm2'] - 1) * 100 if k else 0
        print(f"| {x['L']} | {x['hp']} | {x['off']} | {x['sm']} | {d1:+.1f}% | {x['hp2']} | {x['off2']} | {x['sm2']} | {d2:+.1f}% | {x['xp']} | {x['cum']} |")
    jf = [a.split('=', 1)[1] for a in sys.argv if a.startswith('--json=')]
    if jf:
        json.dump(rows, open(jf[0], 'w'))


main()
