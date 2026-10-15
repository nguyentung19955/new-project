#!/usr/bin/env python3
"""ĐO THẮNG TRÙM (bot cân bằng, chạy Node — mô hình tính số, không phải chơi thử): nổi giận trước / sau.

Mỗi lượt: bản lưu thật của bot lúc vừa đủ Sức mạnh khuyên dùng của ải (game/tests/cay_luu.json, như tests/balance.py), vào ải rồi
nhảy THẲNG vào phòng trùm (đủ máu, đủ bình như lúc vào ải) và để bot đánh tới khi thắng / thua. Bỏ phần đánh quái trước trùm nên số đo
chỉ là trùm (trùm nhỏ ở ải 1–4, trùm vùng ở ải 5), ít nhiễu hơn tỉ lệ thắng cả ải.

  python3 docs/review/ke-hoach-cai-thien/noi-gian-manh/do_trum.py <cu|moi|js:mã> [ải 0..14, phẩy] [số lượt mỗi ải]
  Biến môi trường: LK_MAU=0.5 vào phòng trùm với 50% máu (giả lượt đã mất máu trước trùm) · LK_NGUON=1 in máu mất theo chiêu trùm ·
  LK_LOP=resist:fire,antiMelee lớp thích nghi của trùm (lượt thật của bot hay gặp: Kháng Lửa, Chống áp sát) ·
  LK_GAME=thư mục game khác (mặc định game/ của repo).
    cu  = cờ ?giancu=1 (G.NOI_GIAN_BAT = false, y hệt trước phiên này) · moi = bảng G.NOI_GIAN hiện tại · js:mã = chạy mã trước khi đo
In: mỗi ải "thắng a/n (x%) · máu còn TB khi thắng · thời gian trùm TB · trùm còn TB khi thua", rồi TỔNG.
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game'))
GAME = os.environ.get('LK_GAME', GAME)
sys.path.insert(0, os.path.join(GAME, 'tests'))
import cd_lib  # noqa: E402

JS = r"""
([r, i, sv, mau, lop]) => {
  G.save = G.fixSave(JSON.parse(sv)); G.save.sound = false;
  G.botCfg.prefer = null;
  G.startStage(r, i, 0);
  const S0 = G.getRun();
  G.gotoRoom(S0.map.boss);
  const W0 = G.getWorld(), b0 = W0.boss;
  if (lop && b0) { b0.layers = lop.split(',').map((t) => (t.indexOf(':') > 0 ? { type: t.split(':')[0], el: t.split(':')[1], pct: 0.3 } : { type: t })); } // LK_LOP: lớp thích nghi của trùm như lượt thật
  if (mau) S0.P.hp = Math.max(1, Math.round(S0.P.maxhp * mau)); // LK_MAU: vào phòng trùm với bấy nhiêu phần máu (giả lượt đã mất máu ở các phòng trước)
  const out = { win: false, t: 0, hp: 0, bossHp: 100, maxhp: S0.P.maxhp };
  for (let s = 0; s < 360 * 2; s++) {
    const S = G.getRun();
    if (!S) break;
    if (S.won || (b0 && b0.dead)) { out.win = true; out.hp = Math.round(S.P.hp / S.P.maxhp * 100); break; }
    if (S.mode === 'dead' || S.mode === 'result' || S.P.dead) break;
    if (S.mode !== 'play') { G.botRun(1); continue; }
    G.sim(30); out.t += 0.5;
  }
  out.bossHp = b0 ? Math.max(0, Math.round(b0.hp / b0.maxhp * 100)) : null;
  try { const S = G.getRun(); if (S) { S.quit = true; G.finishStage(false); } } catch (e) { /* bỏ qua */ }
  return out;
}
"""

HOOK = r"""() => { window.__hb = {}; const h0 = G.hurtPlayer; G.hurtPlayer = function (amt, el, src, melee) { const W = G.getWorld(), P = W.P, hp0 = P.hp; const r = h0.apply(this, arguments); const b = W.boss; if (r && b && !b.dead) { const k = 'p' + (b.phase + 1) + ' ' + (b.skillName || '?') + (melee ? ' (cận)' : ''); const q = window.__hb[k] || (window.__hb[k] = [0, 0]); q[0] += hp0 - P.hp; q[1]++; } return r; }; return 1; }"""


MAU = float(os.environ.get('LK_MAU') or 0)
LOP = os.environ.get('LK_LOP') or ''


def main():
    var = sys.argv[1] if len(sys.argv) > 1 else 'moi'
    st = [int(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 else list(range(15))
    n = int(sys.argv[3]) if len(sys.argv) > 3 else 20
    pre = {'cu': 'G.NOI_GIAN_BAT = false', 'moi': '1'}.get(var, var[3:] if var.startswith('js:') else '1')
    REAL = json.load(open(os.path.join(GAME, 'tests', 'cay_luu.json')))
    errs = []
    pg = cd_lib.NodePage(errs)
    pg.evaluate('() => { ' + pre + '; return 1; }')
    nguon = os.environ.get('LK_NGUON') == '1'  # in máu mất theo chiêu trùm (pha, tên chiêu, cận chiến) — tìm chiêu làm tụt tỉ lệ thắng
    if nguon: pg.evaluate(HOOK)
    tw = tn = 0
    for k in st:
        r, i = divmod(k, 5)
        if nguon: pg.evaluate('() => { window.__hb = {}; return 1; }')
        rs = [pg.evaluate(JS, [r, i, REAL[k], MAU, LOP]) for _ in range(n)]
        if nguon:
            hb = pg.evaluate('() => window.__hb')
            print('   máu mất / số lần trúng:', ' | '.join(f"{k2}: {round(v[0])}/{v[1]}" for k2, v in sorted(hb.items(), key=lambda q: -q[1][0])[:8]))
        w = [x for x in rs if x['win']]
        l = [x for x in rs if not x['win']]
        tw += len(w); tn += n
        print(f"{r+1}-{i+1}: thắng trùm {len(w)}/{n} ({100*len(w)/n:.0f}%)" +
              (f" · máu còn TB {sum(x['hp'] for x in w)/len(w):.0f}% · {sum(x['t'] for x in w)/len(w):.0f} giây" if w else '') +
              (f" · thua: trùm còn TB {sum((x['bossHp'] or 0) for x in l)/len(l):.0f}%" if l else ''), flush=True)
    print(f"TỔNG ({var[:60]}): thắng trùm {tw}/{tn} ({100*tw/max(1,tn):.0f}%)" + (' LỖI ' + str(errs[:2]) if errs else ''), flush=True)
    pg.close()


main()
