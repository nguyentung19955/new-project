#!/usr/bin/env python3
"""A — ĐO ĐỘ KHÓ CHIẾN DỊCH + ĐƯỜNG CONG CẤP (bot cân bằng, luật game chạy trong Node — tests/node_trang.js, như ?cloud=0).

Bot chơi từ bản lưu mới như người chơi thật (luật bot: game/tests/cd_lib.py + bot_nang.js, giống tests/cay.py), thêm:
  - ghi MỌI lần nhận kinh nghiệm (G.addXp bọc lại): ải nào, thắng/thua, bao nhiêu, cấp trước/sau → đường cong cấp;
  - ghi Sức mạnh / cấp ở mỗi lần thử ải (đã có trong cd_lib: st[k]['att'], log);
  - --kd=R: đo Sức mạnh để bot thắng 75% mỗi ải (như cay.py --kd), cả độ khó 2 nếu --kho2;
  - --luu=tệp: ghi mỗi ải MỘT bản lưu có Sức mạnh gần khuyên dùng nhất (cho do_trum_a.py).
Không sửa số nào của game.

  python3 docs/review/ke-hoach-cai-thien/kiem-can-bang/do_chien_dich.py --n=6 [--mode=khuyen|lieu] [--vk=kiem|thuong|bua] [--kho2]
          [--kd=4] [--luu=tệp.json] [--luu-tat=tệp.json] [--ngay=8] --out=ket-qua.json
    Biến môi trường LK_JS=mã: chạy mã đó trong game trước khi đo (thử đề xuất số trong bộ nhớ, không sửa tệp game).
"""
import json, math, os, sys, time
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.environ.get('LK_GAME', os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game')))
sys.path.insert(0, os.path.join(GAME, 'tests'))
import cd_lib  # noqa: E402
from cd_lib import ten  # noqa: E402

XP_HOOK = r"""() => {
  window.__xp = [];
  if (!G.__xpBoc) {
    G.__xpBoc = true;
    const a0 = G.addXp;
    G.addXp = function (k, xp) {
      const S = G.getRun(), hs = G.save.heroes[k], l0 = hs.lvl;
      const r = a0.apply(this, arguments);
      const nhan = !S ? '?' : S.aiNgay ? 'ngay' : (S.diff ? 'K2 ' : '') + (S.r + 1) + '-' + (S.i + 1);
      window.__xp.push([nhan, S && S.mode !== 'dead' && !S.P.dead && !S.quit ? 1 : 0, Math.round(xp), l0, hs.lvl, Math.round(S ? (S.power || 0) : 0)]);
      return r;
    };
  }
  return 1;
}"""


def arg(name, d=None):
    for a in sys.argv[1:]:
        if a.startswith('--' + name + '='):
            return a.split('=', 1)[1]
    return d


def fit75(pts):
    """Hồi quy logistic thắng ~ log(Sức mạnh) (như tests/cay.py): trả Sức mạnh thắng 75%."""
    if not pts:
        return None
    xs = [math.log(p) for p, _, _ in pts]
    mx = sum(xs) / len(xs)
    best = None
    for a10 in range(-60, 61):
        a = a10 / 10.0
        for b in [x * 0.5 for x in range(1, 121)]:
            ll = 0
            for (p, wn, n), x in zip(pts, xs):
                q = 1 / (1 + math.exp(-max(-30, min(30, a + b * (x - mx)))))
                q = min(1 - 1e-6, max(1e-6, q))
                ll += wn * math.log(q) + (n - wn) * math.log(1 - q)
            if best is None or ll > best[0]:
                best = (ll, a, b)
    _, a, b = best
    return math.exp(mx + (math.log(3) - a) / b)


def main():
    n = int(arg('n', '6'))
    mode = arg('mode', 'khuyen')
    vk = cd_lib.VK.get(arg('vk', 'kiem'), 'sword')
    kho2 = '--kho2' in sys.argv
    kd = int(arg('kd', '0'))
    ngay = int(arg('ngay', str(cd_lib.NGAY)))
    out_f = arg('out', os.path.join(HERE, 'ket-qua-tam.json'))
    luu = arg('luu')
    luu_tat = arg('luu-tat')  # ghi MỌI bản lưu lúc vừa tới mỗi ải (dict ải → danh sách) cho do_ai_chet.py --luu=
    errs = []
    pg = cd_lib.NodePage(errs)
    pg.evaluate(XP_HOOK)
    if os.environ.get('LK_JS'):  # thử một đề xuất số TRONG BỘ NHỚ (không sửa tệp game), vd LK_JS='G.STAGE_K.mob[8] = [1.3, 2.2]'
        pg.evaluate('() => { ' + os.environ['LK_JS'] + '; return 1; }')
    saves = {} if (kd or luu or luu_tat) else None
    saves2 = {} if (kd and kho2) else None
    runs = []
    t0 = time.time()
    for k in range(n):
        pg.evaluate('() => { window.__xp = []; return 1; }')
        out, why = cd_lib.campaign(pg, mode, 15, cd_lib.CAY[k % 3], saves, chinh=vk, ngay=ngay, kho2=kho2, saves2=saves2,
                                   guard_max=440 if kho2 else 220)
        if not out:
            out = getattr(cd_lib.campaign, 'last', None) or {}
            out['ket'] = why
        out['xp'] = pg.evaluate('() => window.__xp')
        out['cay'] = cd_lib.CAY[k % 3]
        out['log'] = out.get('log', [])[-400:]
        runs.append(out)
        print(f"lượt {k+1}/{n} {mode} {vk}{' kho2' if kho2 else ''}: {'KẸT ' + why if why else 'xong'} | "
              f"{sum(s['plays'] for s in out.get('st', []))} lần chơi, {out.get('t', 0)/60:.0f} phút | {time.time()-t0:.0f}s", flush=True)
    kd_res = {}
    if kd:
        for diff, sv_ds in ((0, saves), (1, saves2)):
            if not sv_ds:
                continue
            pool = None
            if diff:
                allsv = [x for d in (saves or {}, saves2 or {}) for ds in d.values() for x in ds]
                pool = sorted(((pg.evaluate("(s) => { G.save = G.fixSave(JSON.parse(s)); G.save.sound = false; return G.power(); }", x), x) for x in allsv), key=lambda q: q[0])
            for k in sorted(sv_ds):
                ds_k = sv_ds[k]
                rec = pg.evaluate('([r, i, d]) => G.stageRec(r, i, d)', list(divmod(k, 5)) + [diff])
                if pool:
                    ds_k = [x for p0, x in pool if p0 < rec][-4:] + [x for p0, x in pool if p0 >= rec][:4] + list(sv_ds[k][:2])
                pts = []
                for sj in ds_k:
                    pw = pg.evaluate("(s) => { G.save = G.fixSave(JSON.parse(s)); G.save.sound = false; return G.power(); }", sj)
                    wn = 0
                    for _ in range(kd):
                        pg.evaluate("(s) => { G.save = G.fixSave(JSON.parse(s)); G.save.sound = false; }", sj)
                        pg.evaluate("([r, i, d]) => G.startStage(r, i, d)", list(divmod(k, 5)) + [diff])
                        wn += 1 if pg.evaluate("G.probeRun(900)").get('win') else 0
                    pts.append((pw, wn, kd))
                lo = sorted(pts)
                p75 = fit75(pts)
                tag = 'fit'
                if sum(w for _, w, _ in pts) >= 0.95 * sum(m for _, _, m in pts):
                    p75, tag = lo[0][0], 'le'      # thắng gần hết: Sức mạnh 75% ≤ bản lưu thấp nhất
                elif p75 is not None and (p75 > lo[-1][0] * 1.25 or p75 < lo[0][0] * 0.75):
                    p75, tag = lo[-1][0], 'gt'     # hồi quy vọt khỏi khoảng đo: > bản lưu cao nhất
                key = ('K2 ' if diff else '') + ten(k)
                kd_res[key] = {'pts': lo, 'p75': p75, 'tag': tag, 'rec': rec}
                print(f"{key}: SM 75% {'<=' if tag == 'le' else '>' if tag == 'gt' else '≈'} {p75:.0f} (khuyên dùng {rec}) | " + ' '.join(f'{p}:{w}/{m}' for p, w, m in lo), flush=True)
    if luu and saves:
        ds = []
        for k in range(15):
            rec = pg.evaluate('(k) => G.STAGE_REC[k]', k)
            cand = [(abs(pg.evaluate("(s) => { G.save = G.fixSave(JSON.parse(s)); return G.power(); }", x) - rec), x) for x in saves.get(k, [])]
            ds.append(min(cand, key=lambda q: q[0])[1] if cand else None)
        json.dump(ds, open(luu, 'w'), ensure_ascii=False)
        print('Đã ghi bản lưu gần khuyên dùng:', luu, sum(1 for x in ds if x), 'ải')
    if luu_tat and saves:
        json.dump({str(k): v for k, v in saves.items()}, open(luu_tat, 'w'), ensure_ascii=False)
        print('Đã ghi mọi bản lưu:', luu_tat, sum(len(v) for v in saves.values()), 'bản')
    json.dump({'mode': mode, 'vk': vk, 'kho2': kho2, 'ngay': ngay, 'runs': runs, 'kd': kd_res, 'errs': errs[:5]}, open(out_f, 'w'), ensure_ascii=False)
    print('Đã ghi', out_f, '| lỗi trang:', errs[:2] if errs else 'không')
    pg.close()


main()
