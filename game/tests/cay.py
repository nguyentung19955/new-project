"""CÂN BẰNG PHẢI CÀY (hệ thống mới, đợt 5): bot chơi chiến dịch 15 ải từ bản lưu mới như một người chơi bình thường, nhiều lượt,
và in bảng từng ải. Luật chơi của bot: tests/cd_lib.py (chọn ải, cày) + tests/bot_nang.js (nâng cấp ở làng).

Cách bot chơi (mỗi lượt):
  - Cây chưởng: lượt chiến dịch 1, 4, 7... dùng Hỏa chưởng; 2, 5, 8... Độc chưởng; 3, 6, 9... Băng chưởng. Học hết điểm chưởng mỗi lần về làng.
  - Ở làng: 4 vũ khí cố định, bot dùng Kiếm (chính) + Phi tiêu (phụ); nâng bằng linh khí, lên Mầm chọn hệ hợp vùng; nâng bộ trang phục
    (linh khí + vàng + mảnh trùm); học kỹ năng, mài, nâng lò (G.upg.auto). Không rơi đồ, không quần áo cũ.
  - Kiểu "khuyen" (mặc định): Sức mạnh chưa đủ "khuyên dùng" của ải kế thì chơi lại ải mới nhất đã qua để cày (tối đa 8 lượt liền;
    cày 3 lượt mà Sức mạnh không tăng thì thử luôn), đủ thì vào ải mới. Thua thì chơi lại ải cũ một lượt rồi mới thử lại.
  - Kiểu "lieu": không nhìn lời khuyên, cứ vào ải mới; thua thì chơi lại ải cũ một lượt rồi thử lại.
Số lần chơi của một ải = mọi lượt (kể cả chơi lại ải cũ và lượt thua) từ lúc qua ải trước cho tới lúc qua ải đó.

Chạy: python3 tests/cay.py [số lượt chiến dịch, mặc định 12] [khuyen|lieu] [-v: in từng lượt] [--nhanh: chỉ vùng 1]
      [--kd=R: đo lại Sức mạnh khuyên dùng — mỗi bản lưu lúc vừa tới một ải (của kiểu khuyen và kiểu lieu) chơi lại ải đó R lần,
       tìm Sức mạnh mà bot thắng 75%] [--json=tệp: ghi số liệu thô]
Thoát mã 1 nếu: có luật hỏng, có lượt chiến dịch bị kẹt, có ải trung bình phải chơi quá 9 lần (8 lượt cày + 1 lượt thử), có lỗi trang."""
import sys, json, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
import cd_lib
from cd_lib import ten

# Mục tiêu tham khảo (số lần chơi trung bình mỗi ải) từ các phiên cân bằng trước; đợt 5 chỉ BẮT BUỘC "không ải nào quá ~8 lượt cày".
def muc_tieu(k):
    r, i = divmod(k, 5)
    if r == 0:
        return (1, 2.5) if i < 4 else (3, 9)
    if i == 4:
        return (3, 9)
    return (1, 5.5)

LUAT = r"""
() => {
  const out = [];
  const ok = (c, m) => out.push([!!c, m]);
  const VM = G.vkMoi;
  G.resetSave(); G.save.sound = false;
  ok(G.power() >= 95 && G.power() <= 105, 'Zed mới (cấp 1, 4 vũ khí Trắng +0) có Sức mạnh khoảng 100: ' + G.power());
  ok(G.save.weapons.length === 4 && G.save.carry.length === 4 && G.save.weapons.every((w) => G.wStage(w) === 0 && w.rarity === 0), 'bản lưu mới: đúng 4 vũ khí Trắng, không bậc màu');
  let mono = true; for (let k = 1; k < 15; k++) if (G.STAGE_REC[k] <= G.STAGE_REC[k - 1]) mono = false;
  ok(mono, 'Sức mạnh khuyên dùng tăng dần qua 15 ải: ' + G.STAGE_REC.join(' '));
  ok(G.stageRec(2, 4, 1) > G.stageRec(2, 4, 0), 'độ khó thứ hai cần Sức mạnh cao hơn');
  ok(G.grindMult(100, 100) === 1 && G.grindMult(130, 100) === 1 && G.grindMult(160, 100) < 1 && G.grindMult(400, 100) === 0.4, 'thưởng khi cày: đủ khi chưa quá 130%, giảm dần, thấp nhất 40%');
  // Sức mạnh tăng theo cấp, mài, cấp vũ khí (linh khí)
  const p0 = G.power(); G.save.heroes.smith.lvl = 10; const p1 = G.power();
  const w = G.weaponById(G.save.carry[0]); w.sharpen = 3; const p2 = G.power();
  G.save.linhKhi = 100; VM.nang(G.save, w, 'fire'); const p3 = G.power();
  ok(p1 > p0 && p2 > p1 && p3 > p2 && G.save.linhKhi === 0 && G.wStage(w) === 1 && w.branch === 'fire', 'Sức mạnh tăng theo cấp, mài, nâng Mầm bằng 100 linh khí: ' + [p0, p1, p2, p3].join(' < '));
  // không còn "Quyết tâm"
  G.resetSave(); G.save.sound = false; G.save.tut.done = true;
  const P0 = G.buildPlayer(), pw0 = G.power();
  for (let k = 0; k < 4; k++) { G.startStage(0, 1, 0); G.getRun().P.hp = 0; G.getRun().W.over = 'dead'; G.sim(120); }
  G.startStage(0, 1, 0); const S = G.getRun();
  ok(G.save.grit === undefined && S.P.maxhp === P0.maxhp && S.power === pw0, 'thua 4 lần liền: không quyết tâm, máu ' + S.P.maxhp + ', Sức mạnh ' + S.power + ' như cũ');
  S.quit = true; G.finishStage(false);
  ok(G.save.weapons.length === 4, 'sau các lượt thua vẫn đúng 4 vũ khí (không rơi đồ)');
  // trần: cấp 40, mài +15 (lò 4)
  ok(G.MAX_LEVEL === 40 && G.MAX_SHARPEN === 15 && G.FORGE_CAP[G.FORGE_CAP.length - 1] === 15, 'trần: cấp 40, mài +15 với lò cấp 4');
  // trần cuối game (chỉ đồ cày được) vẫn vượt khuyên dùng Hồ Tinh
  G.resetSave(); G.save.tut.done = true;
  const sv = G.save, hs = sv.heroes.smith;
  hs.lvl = 40; hs.sk = { atk: 5, def: 5, elem: 3 }; sv.forge = 4;
  if (G.chuong) G.chuong.autoLearn(hs, 'smith');
  for (const t of ['sword', 'bow']) { const x = sv.weapons.find((q) => q.type === t); x.sharpen = 15; VM.datCap(x, 3, t === 'sword' ? 'fire' : 'ice'); }
  const top = G.power(), need = G.STAGE_REC[14];
  ok(top >= need * 1.15, 'trần trước Hồ Tinh (cấp 40, kiếm + phi tiêu Thức tỉnh +15, cây chưởng đầy): Sức mạnh ' + top + ' >= 1,15 x khuyên dùng Hồ Tinh ' + need);
  // cây chưởng đã đầy: không gợi ý / không "học" mãi điểm thừa (G.upg.auto vẫn làm việc khác)
  ok(!G.upg.list(sv).some((q) => q.kind === 'chuong'), 'cây chưởng đã học hết nút: không còn mục "điểm chưởng chưa học" (cấp 40 > tổng bậc của cây)');
  sv.gold = 5000; sv.ore = 200; sv.mats = [50, 50, 50]; const xw = sv.weapons.find((q) => q.type === 'sword'); xw.sharpen = 10;
  const d0 = G.upg.auto(sv);
  ok(xw.sharpen > 10, 'cây chưởng đầy mà G.upg.auto vẫn mài tiếp: ' + d0.slice(0, 3).join('; '));
  // GỢI Ý Ở BẢNG THUA
  G.resetSave(); G.save.tut.done = true;
  const s2 = G.save; s2.heroes.smith.lvl = 7; s2.gold = 120; s2.ore = 3; s2.mats = [2, 0, 0]; s2.stars = { '0-0': 3, '0-1': 2, '0-2': 2, '0-3': 1 };
  G.startStage(0, 4, 0); G.getRun().P.hp = 0; G.getRun().W.over = 'dead'; G.sim(120);
  const T = G.getRun().result.tips;
  ok(T && T.tips.length >= 2 && T.tips.length <= 3, 'bảng thua có 2-3 gợi ý: ' + (T ? T.tips.map((t) => t.text + ' (' + t.sub + ')').join(' | ') : 'không có'));
  ok(T && T.tips[0].kind === 'skill', 'còn điểm kỹ năng thì gợi ý học trước tiên');
  ok(T && T.tips.every((t) => (t.gain > 0 || t.kind === 'skill' || t.kind === 'chuong') && t.go && (t.go.who || t.go.weapon != null)), 'gợi ý nào cũng tăng Sức mạnh (hoặc là điểm chưa học) và có chỗ để đi tới');
  G.villageApi && G.setScene(G.Village); G.villageApi && G.villageApi.goHub && G.villageApi.goHub();
  // bot nâng cấp tự động chỉ tiêu tài nguyên đang có, không bao giờ âm; nâng bằng linh khí chọn hệ của G.upg.heMam
  G.resetSave(); const s5 = G.save; s5.heroes.smith.lvl = 9; s5.gold = 2000; s5.ore = 40; s5.mats = [30, 10, 0]; s5.linhKhi = 150;
  const pb = G.power(), did = G.upg.auto(s5), pa = G.power();
  ok(pa > pb && s5.gold >= 0 && s5.ore >= 0 && s5.mats.every((x) => x >= 0) && VM.lk(s5) >= 0 && s5.weapons.some((x) => G.wStage(x) === 1), 'nâng cấp tự động: Sức mạnh ' + pb + ' -> ' + pa + ' sau ' + did.length + ' việc, có nâng Mầm, không tiêu quá số có');
  // nâng bộ: cấp 2 cần mảnh trùm
  G.resetSave(); const s6 = G.save; s6.linhKhi = 1000; s6.gold = 5000;
  const b1 = VM.nangBo(s6, 'ninja'), b2why = VM.boDuoc(s6, 'ninja'); s6.shards[0] = 3; const b2 = VM.nangBo(s6, 'ninja');
  ok(b1 && b2why === 'Thiếu mảnh trùm' && b2 && VM.boCap(s6, 'ninja') === 2 && s6.shards[0] === 0, 'nâng bộ Ninja: cấp 1 không cần mảnh, cấp 2 cần 3 mảnh Mộc Tinh');
  G.resetSave();
  return out;
}
"""


def fit75(pts):
    """pts: [(Sức mạnh, số thắng, số lần)]. Hồi quy logistic thắng ~ Sức mạnh (thang log); trả về Sức mạnh thắng 75% (None nếu không tìm được)."""
    if not pts:
        return None, None
    xs = [math.log(p) for p, _, _ in pts]
    mx = sum(xs) / len(xs)
    best = None
    for a10 in range(-60, 61):
        a = a10 / 10.0
        for b in [x * 0.5 for x in range(1, 121)]:
            ll = 0
            for (p, wn, n), x in zip(pts, xs):
                z = a + b * (x - mx)
                q = 1 / (1 + math.exp(-max(-30, min(30, z))))
                q = min(1 - 1e-6, max(1e-6, q))
                ll += wn * math.log(q) + (n - wn) * math.log(1 - q)
            if best is None or ll > best[0]:
                best = (ll, a, b)
    _, a, b = best
    x75 = mx + (math.log(3) - a) / b
    return math.exp(x75), b


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('-')]
    n = int(args[0]) if args else 12
    mode = args[1] if len(args) > 1 else 'khuyen'
    upto = 5 if '--nhanh' in sys.argv else 15
    kd = [int(a.split('=', 1)[1]) for a in sys.argv if a.startswith('--kd=')]
    jout = [a.split('=', 1)[1] for a in sys.argv if a.startswith('--json=')]
    errs = []
    runs = []
    saves = {} if kd else None
    bad = 0
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = cd_lib.open_page(b, errs)
        bad_luat = 0
        for good, msg in pg.evaluate(LUAT):
            print(('đạt ' if good else 'HỎNG ') + msg)
            bad_luat += 0 if good else 1
        if bad_luat:
            print('SAI: %d luật hỏng' % bad_luat); bad = 1
        modes = [mode] * n
        if kd and mode == 'khuyen':
            modes += ['lieu'] * n  # thêm bản lưu ở Sức mạnh thấp hơn để đo đường thắng/thua
        for k, md in enumerate(modes):
            out, why = cd_lib.campaign(pg, md, upto, cd_lib.CAY[k % 3], saves)
            if md != mode:
                print(f'(lượt {k+1}, kiểu {md}: chỉ lấy bản lưu để đo khuyên dùng){" — " + why if why else ""}')
                continue
            if not out:
                print('Lượt', k + 1, 'không xong:', why)
                if '-v' in sys.argv: print('\n'.join(cd_lib.campaign.last['log']))
                runs.append(None); continue
            runs.append(out)
            if '-v' in sys.argv:
                print('\n'.join(out['log']))
            print(f"lượt {k+1} ({cd_lib.CAY[k % 3]}): {out['t']/60:.0f} phút, {sum(s['plays'] for s in out['st'])} lần chơi | " + ' '.join(str(s['plays']) for s in out['st'][:upto]))
            sys.stdout.flush()
        kd_res = {}
        if kd:
            R = kd[0]
            print(f'\nĐo khuyên dùng: mỗi bản lưu lúc vừa tới ải chơi lại ải đó {R} lần (không nâng cấp thêm)')
            for k in sorted(saves):
                pts = []
                for sj in saves[k]:
                    pw = pg.evaluate("(s) => { G.save = G.fixSave(JSON.parse(s)); G.save.sound = false; return G.power(); }", sj)
                    wn = 0
                    for _ in range(R):
                        pg.evaluate("(s) => { G.save = G.fixSave(JSON.parse(s)); G.save.sound = false; }", sj)
                        pg.evaluate("([r, i]) => G.startStage(r, i, 0)", list(divmod(k, 5)))
                        res = pg.evaluate("G.probeRun(900)")
                        wn += 1 if res.get('win') else 0
                    pts.append((pw, wn, R))
                p75, slope = fit75(pts)
                lo = sorted(pts)
                if sum(w for _, w, _ in pts) >= 0.95 * sum(nn for _, _, nn in pts):
                    p75 = None  # thắng gần hết: chỉ biết Sức mạnh 75% thấp hơn bản lưu thấp nhất
                kd_res[k] = {'pts': lo, 'p75': p75}
                print(f"{ten(k)}: Sức mạnh 75% ≈ {'<= %d' % lo[0][0] if p75 is None else '%.0f' % p75} (khuyên dùng hiện {pg.evaluate('(k) => G.STAGE_REC[k]', k)}) | " + ' '.join(f'{p}:{w}/{nn}' for p, w, nn in lo))
                sys.stdout.flush()
        b.close()
    ok = [r for r in runs if r]
    if len(ok) < n:
        print('SAI: có lượt chiến dịch bị kẹt'); bad = 1
    if jout:
        json.dump({'runs': ok, 'kd': kd_res}, open(jout[0], 'w'), ensure_ascii=False)
    if not ok:
        sys.exit(1)
    m = len(ok)
    med = lambda xs: (sorted(xs)[len(xs) // 2] if len(xs) % 2 else sum(sorted(xs)[len(xs) // 2 - 1:len(xs) // 2 + 1]) / 2)
    print(f"\nKiểu bot: {mode}, {m} lượt chiến dịch. Số lần chơi = mọi lượt (cả chơi lại ải cũ và lượt thua) để qua ải đó.")
    print('| Ải | Lần chơi TB (trung vị) | Lượt cày | Lần thử | Thua | Phút (cả cày) | Giây lượt thắng | Cấp khi qua | Sức mạnh khi qua / khuyên dùng | Máu còn khi thắng | Đòn trùm mạnh nhất (% máu) | Linh khí / lượt | Vàng / lượt | Tham khảo |')
    print('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|')
    for k in range(upto):
        avg = lambda key: sum(r['st'][k][key] for r in ok) / m
        lo, hi = muc_tieu(k)
        pl = avg('plays')
        flag = ' ✗' if pl > 9 else ''
        if flag and mode == 'khuyen': bad = 1
        plays = sum(r['st'][k]['plays'] for r in ok)
        hp = [r['st'][k]['hp'] for r in ok if r['st'][k]['hp'] is not None]
        bh = [r['st'][k]['bossHit'] for r in ok if r['st'][k]['bossHit']]
        print(f"| {ten(k)} | {pl:.1f}{flag} ({med([r['st'][k]['plays'] for r in ok]):g}) | {avg('grind'):.1f} | {avg('tries'):.1f} | {avg('fails'):.1f} | {avg('t')/60:.0f} | {avg('tWin'):.0f} | {avg('lvl'):.0f} | {avg('pw'):.0f} / {avg('rec'):.0f} | "
              f"{(sum(hp)/len(hp)*100 if hp else 0):.0f}% | {(max(bh)*100 if bh else 0):.0f}% (TB {(sum(bh)/len(bh)*100 if bh else 0):.0f}%) | "
              f"{sum(r['st'][k]['lk'] for r in ok)/max(1,plays):.0f} | {sum(r['st'][k]['gold'] for r in ok)/max(1,plays):.0f} | {lo:g}-{hi:g} |")
    tt = sum(r['t'] for r in ok) / m / 60
    ts = sorted(r['t'] / 60 for r in ok)
    print(f"Tổng thời gian đi hết {upto} ải lần đầu: trung bình {tt:.0f} phút ({tt/60:.1f} giờ), trung vị {ts[m//2]:.0f}, nhanh nhất {ts[0]:.0f}, lâu nhất {ts[-1]:.0f}; "
          f"{sum(sum(s['plays'] for s in r['st']) for r in ok)/m:.0f} lần chơi")
    cu = [r['cuoi'] for r in ok if r.get('cuoi')]
    if cu:
        print(f"Lúc qua 3-5 (trung bình): cấp {sum(c['cap'] for c in cu)/len(cu):.0f}, Sức mạnh {sum(c['sm'] for c in cu)/len(cu):.0f}, vàng còn {sum(c['vang'] for c in cu)/len(cu):.0f}, "
              f"linh khí còn {sum(c['lk'] for c in cu)/len(cu):.0f}, quặng {sum(c['quang'] for c in cu)/len(cu):.0f}, nguyên liệu {'/'.join('%.0f' % (sum(c['nl'][i] for c in cu)/len(cu)) for i in range(3))}, "
              f"mảnh {'/'.join('%.1f' % (sum(c['manh'][i] for c in cu)/len(cu)) for i in range(3))}")
    # mốc nâng cấp: ải đang tới lúc đạt (trung vị qua các lượt có đạt)
    keys = []
    for r in ok:
        for kk in r['moc']:
            if kk not in keys: keys.append(kk)
    order = lambda kk: med([int(r['moc'][kk][0]) * 5 + int(r['moc'][kk][2]) for r in ok if kk in r['moc']])
    print('\nMốc nâng cấp (ải đang tới lúc đủ để nâng; trung vị, số lượt chiến dịch có đạt):')
    for kk in sorted(keys, key=order):
        xs = [(int(r['moc'][kk][0]) - 1) * 5 + int(r['moc'][kk][2]) - 1 for r in ok if kk in r['moc']]
        mm = med(xs)
        print(f"  {kk}: {ten(int(mm))}{'' if mm == int(mm) else '/' + ten(int(mm) + 1)} (sớm nhất {ten(min(xs))}, muộn nhất {ten(max(xs))}; {len(xs)}/{m} lượt)")
    hurt = {}
    for r in ok:
        for kk, x in r['hurt'].items(): hurt[kk] = hurt.get(kk, 0) + x
    tot = sum(hurt.values()) or 1
    print('Nguồn mất máu:', ', '.join(f"{kk} {x*100/tot:.0f}%" for kk, x in sorted(hurt.items(), key=lambda kv: -kv[1])))
    if errs:
        print('LỖI TRANG:', errs[:3]); bad = 1
    sys.exit(bad)


main()
