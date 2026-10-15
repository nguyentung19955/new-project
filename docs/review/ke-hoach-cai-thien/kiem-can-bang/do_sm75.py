#!/usr/bin/env python3
"""A — SỨC MẠNH THẮNG 75% cho ải thiếu số đo (bản lưu chiến dịch đều dưới khuyên dùng nên do_chien_dich.py --kd chỉ ra "> X").
Lấy bản lưu gần khuyên dùng (luu-A.json), đổi CẤP nhân vật (lên / xuống) để Sức mạnh ≈ khuyên dùng × [0,9 … 1,3], mỗi mức chơi
cả ải N lần bằng bot thường (G.probeRun, như cay.py), hồi quy logistic → Sức mạnh thắng 75%. Chỉ đo, không sửa số game.
  python3 .../do_sm75.py <ải 0..14, phẩy> [N=30] [--muc=0.9,1,1.1,1.2,1.3] [--json=tệp]
  Biến môi trường LK_JS=mã: chạy mã đó trong game trước khi đo (thử đề xuất số trong bộ nhớ, không sửa tệp game).
"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.environ.get('LK_GAME', os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game')))
sys.path.insert(0, os.path.join(GAME, 'tests'))
sys.path.insert(0, HERE)
import cd_lib  # noqa: E402
from phan_tich_a import fit75  # noqa: E402

DAT = r"""([s, d]) => {
  G.save = G.fixSave(JSON.parse(s)); G.save.sound = false;
  const hs = G.save.heroes[G.save.hero];
  while (G.power() < d && hs.lvl < G.MAX_LEVEL) hs.lvl++;
  while (G.power() > d * 1.01 && hs.lvl > 1) hs.lvl--;
  return [G.power(), hs.lvl, JSON.stringify(G.save)];
}"""


def main():
    st = [int(x) for x in sys.argv[1].split(',')]
    n = int(sys.argv[2]) if len(sys.argv) > 2 and not sys.argv[2].startswith('--') else 30
    muc = [float(x) for x in ([a.split('=', 1)[1] for a in sys.argv if a.startswith('--muc=')] or ['0.9,1,1.1,1.2,1.3'])[0].split(',')]
    L = json.load(open(os.path.join(HERE, 'luu-A.json')))
    pg = cd_lib.NodePage([])
    if os.environ.get('LK_JS'):  # thử một đề xuất số TRONG BỘ NHỚ (không sửa tệp game), vd LK_JS='G.STAGE_K.mob[8] = [1.3, 2.2]'
        pg.evaluate('() => { ' + os.environ['LK_JS'] + '; return 1; }')
    ket = {}
    for k in st:
        r, i = divmod(k, 5)
        rec = pg.evaluate('(k) => G.STAGE_REC[k]', k)
        pts = []
        for m in muc:
            pw, lv, sv = pg.evaluate(DAT, [L[k], rec * m])
            wn = 0
            for _ in range(n):
                pg.evaluate("(s) => { G.save = G.fixSave(JSON.parse(s)); G.save.sound = false; }", sv)
                pg.evaluate("([r, i]) => G.startStage(r, i, 0)", [r, i])
                wn += 1 if pg.evaluate("G.probeRun(900)").get('win') else 0
            pts.append((pw, wn, n, lv))
        p = fit75([(a, b, c) for a, b, c, _ in pts])
        ket['%d-%d' % (r + 1, i + 1)] = {'rec': rec, 'pts': pts, 'p75': p}
        print(f"{r+1}-{i+1}: khuyên dùng {rec} → SM thắng 75% ≈ {p:.0f} ({p/rec*100-100:+.0f}%) | " + ' '.join(f'{a}(cấp {lv}): {b}/{c}' for a, b, c, lv in pts), flush=True)
    jf = [a.split('=', 1)[1] for a in sys.argv if a.startswith('--json=')]
    if jf:
        json.dump(ket, open(jf[0], 'w'), ensure_ascii=False)
    pg.close()


if __name__ == '__main__':
    main()
