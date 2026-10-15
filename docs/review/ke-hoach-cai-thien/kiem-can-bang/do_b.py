#!/usr/bin/env python3
"""ĐO B (kiem-can-bang/YEU-CAU-B.md): chỉ số đồ theo bậc ép / cấp mài, ép đồ, kinh tế vàng / quặng / đá, bộ trang phục + skill bộ.
CHỈ ĐO: chạy luật game trong Node (game/tests/node_trang.js, như ?cloud=0), không sửa số trong game. Mọi chỉnh số chỉ là tạm trong bộ nhớ
của tiến trình đo (ví dụ đặt hệ số dòng = Rực lửa để so các dòng), không ghi ra tệp game.

  python3 do_b.py bang                 bảng Sức mạnh: bậc ép × mài × cấp hệ × bộ, hiệu quả Sức mạnh / 1.000 vàng quy đổi
  python3 do_b.py ep [N]               Monte Carlo ép (dùng đúng hàm G.epDo.ep): đá / vàng / mảnh / lần ép / bùa để lên mỗi bậc
  python3 do_b.py dong [n]             mỗi dòng hiệu ứng (giá trị Rực lửa) trên kiếm + phi tiêu: thắng trùm 2-5, 3-4, 3-5 (vào trùm 65% máu)
  python3 do_b.py bo [n]               mỗi bộ (cấp 3) so với Ninja cấp 0: thắng trùm, Sức mạnh, độ lệch quy đổi
  python3 do_b.py dpsep [giây] [hạt]   sát thương / giây thật của 4 vũ khí Bậc Trắng → Rực lửa (so với phần Sức mạnh tính)
  python3 do_b.py kinhte [N] [ngày] [mua] [ngay=K] [bq=gia,moiNgay]
                                       N lượt chiến dịch 15 ải (bot cd_lib, kiểu khuyen) + [ngày] ngày chơi tiếp sau 3-5; mua: bot mua quặng
                                       Bà Hàng Xén khi thiếu quặng mài; ngay=K: K lượt ải thường mỗi ngày giả; bq=: đổi giá / số quặng mỗi ngày
  python3 do_b.py ve                   vẽ xem-B.png từ so-lieu-B.json
Mỗi lệnh gộp kết quả vào so-lieu-B.json (cùng thư mục)."""
import json, os, sys, statistics as stt, time

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game'))
sys.path.insert(0, os.path.join(GAME, 'tests'))
import cd_lib  # noqa: E402

OUT = os.path.join(HERE, 'so-lieu-B.json')
REAL = json.load(open(os.path.join(GAME, 'tests', 'cay_luu.json')))  # bản lưu thật của bot lúc vừa đủ khuyên dùng mỗi ải
DA_VANG = 140  # 1 đá nâng bậc quy ra vàng: Ải Đá Bậc Khó 8 đá ~ Ải Vàng Khó 1.100 vàng (cùng 1 lượt ải ngày)


def luu(k, v):
    d = json.load(open(OUT)) if os.path.exists(OUT) else {}
    d[k] = v
    json.dump(d, open(OUT, 'w'), ensure_ascii=False, indent=1)


def trang():
    errs = []
    pg = cd_lib.NodePage(errs)
    return pg, errs


# ---------------------------------------------------------------- 1. BẢNG SỨC MẠNH ----------------------------------------------------------------
BANG = r"""
([svs, daVang]) => {
  const E = G.epDo, VM = G.vkMoi, CF = G.EP_DO, U = G.upg, out = {};
  // bản lưu của bot (tests/cay_luu.json) không có cờ canLai → G.fixSave chạy VM.canLai dựng lại vũ khí và MẤT w.ep (bậc ép). Đặt cờ trước.
  const nap = (x) => { const o = JSON.parse(x); o.canLai = G.SAVE_CAN_LAI || 1; return o; };
  const val = (c) => U.costVal(c || {}) + (c && c.da ? c.da * daVang : 0); // độ đắt quy ra vàng (G.upg.VAL: 1 linh khí 4, quặng 12, nguyên liệu 20, mảnh 150)
  // hệ số sát thương của 1 vũ khí theo bậc (tổng thật, phần Sức mạnh tính = sát thương, phần phụ không vào Sức mạnh)
  out.bac = []; for (let b = 0; b <= 6; b++) { const r = { b, ten: CF.ten[b], tong: CF.tong[b], gia: CF.gia[b] || null, tiLe: CF.tiLe[b] }; for (const t of G.WKEYS) r[t] = CF.tong[b] / (1 + CF.phu[t].giaTri * b); out.bac.push(r); }
  out.mai = []; let cg = 0, co = 0, cm = [0, 0, 0]; for (let n = 0; n < G.MAX_SHARPEN; n++) { const c = G.sharpenFull(n); cg += c.gold; co += c.ore; for (let i = 0; i < 3; i++) cm[i] += c.mat[i]; out.mai.push({ len: n + 1, he: 1 + 0.08 * (n + 1), gold: c.gold, ore: c.ore, mat: c.mat, dGold: cg, dOre: co, dMat: cm.slice(), val: val(c) }); }
  out.lo = G.FORGE_UP; out.loCap = G.FORGE_CAP; out.capHe = G.STAGE_MULT; out.giaHe = G.VK_MOI.gia;
  out.ho = [];
  for (const [k, s] of svs) {
    const base = () => { G.save = G.fixSave(nap(s)); G.save.sound = false; return G.save; };
    let sv = base();
    const pw = () => G.power(), w = (t) => G.save.weapons.find((q) => q.type === t);
    const hs = sv.heroes.smith, sw = w('sword'), bw = w('bow');
    const r = { k, lvl: hs.lvl, pw: pw(), sword: { st: G.wStage(sw), mai: sw.sharpen, bac: E.bac(sw), dong: (sw.ep && sw.ep.d) || [] }, bow: { st: G.wStage(bw), mai: bw.sharpen, bac: E.bac(bw) }, bo: G.zedBo(sv), boCap: sv.boCap || {}, buoc: [] };
    const thu = (ten, fn, cost) => { base(); const p0 = pw(); fn(G.save); const p1 = pw(); r.buoc.push({ ten, d: p1 - p0, val: val(cost), hieu: val(cost) > 0 ? (1000 * (p1 - p0)) / val(cost) : null }); };
    // +1 mài kiếm / phi tiêu, +1 bậc ép, +1 cấp hệ, +1 cấp bộ, +1 cấp nhân vật (đối chiếu)
    for (const t of ['sword', 'bow']) {
      const x = w(t);
      if (x.sharpen < 15) thu('mài ' + t + ' +' + x.sharpen + '→+' + (x.sharpen + 1), (s2) => { s2.weapons.find((q) => q.type === t).sharpen++; }, G.sharpenFull(x.sharpen));
      const b = E.bac(x);
      if (b < 6) {
        // giá kỳ vọng của 1 bậc = giá 1 lần ép / tỉ lệ (bỏ qua tụt bậc; xem lệnh ep cho số đủ)
        const g = CF.gia[b + 1], tl = CF.tiLe[b + 1], c = { gold: g.vang / tl, da: g.da / tl, shard: (g.manh || [0, 0, 0]).map((m) => m / tl) };
        thu('ép ' + t + ' ' + CF.ten[b] + '→' + CF.ten[b + 1], (s2) => { const q = s2.weapons.find((z) => z.type === t); q.ep = q.ep || { b: 0, d: [], may: {} }; q.ep.b = b + 1; }, c);
      }
      const st = G.wStage(x);
      if (st < 3) thu('nâng ' + t + ' ' + G.STAGE_NAMES[st] + '→' + G.STAGE_NAMES[st + 1], (s2) => { VM.datCap(s2.weapons.find((q) => q.type === t), st + 1, x.branch || 'fire'); }, { lk: VM.gia(st) });
    }
    for (const bo of G.ZED_BO_KEYS) {
      const c = VM.boCap(sv, bo);
      if (c < 3) { const g = VM.boGia(c); thu('bộ ' + bo + ' ' + c + '→' + (c + 1) + ' (mặc)', (s2) => { s2.boCap = Object.assign({}, s2.boCap, { [bo]: c + 1 }); s2.zed.boMo = Object.assign({}, s2.zed.boMo, { [bo]: 1 }); if (bo === 'ninja') delete s2.zed.bo; else s2.zed.bo = bo; }, { lk: g.lk, gold: g.vang, shard: [0, 1, 2].map((i) => (i === VM.boVungManh(bo) ? g.manh : 0)) }); }
    }
    thu('cấp nhân vật +1 (đối chiếu, không mua được)', (s2) => { s2.heroes.smith.lvl++; }, null);
    // lưới kiếm: bậc × mài (Sức mạnh cả người), phi tiêu giữ nguyên
    r.luoi = [];
    for (let b = 0; b <= 6; b++) { const row = []; for (const m of [0, 3, 6, 10, 12, 15]) { base(); const q = w('sword'); q.sharpen = m; q.ep = { b, d: [], may: {} }; row.push(pw()); } r.luoi.push(row); }
    // bộ: mỗi bộ cấp 0..3 (Sức mạnh cả người, quy đổi off / ehp)
    r.boBang = {};
    for (const bo of G.ZED_BO_KEYS) { r.boBang[bo] = []; for (let c = 0; c <= 3; c++) { base(); const s2 = G.save; s2.boCap = { [bo]: c }; s2.zed.boMo = { rung: 1, bien: 1, lau: 1 }; if (bo === 'ninja') delete s2.zed.bo; else s2.zed.bo = bo; const P = G.buildPlayer(), q = G.boSk.quyDoi(P); r.boBang[bo].push({ c, pw: pw(), off: q.off, ehp: q.ehp }); } }
    // 4 vũ khí cùng mài / bậc / cấp hệ: Sức mạnh có phân biệt loại không?
    r.loai = {}; for (const t of G.WKEYS) { base(); const s2 = G.save; const q = w(t), m = w('sword'); q.sharpen = m.sharpen; q.ep = JSON.parse(JSON.stringify(m.ep || { b: 0, d: [], may: {} })); VM.datCap(q, G.wStage(m), m.branch); const P = G.buildPlayer(); const ww = P.weapons.find((z) => z.type === t); r.loai[t] = (G.pDamage(P, ww) / G.WTYPES[t].dmg) * 10 * E.sucManh(ww); }
    out.ho.push(r);
  }
  // dòng hiệu ứng: giá trị theo bậc và phần Sức mạnh tính (G.epDo.sucManh) với 1 dòng q = 1
  out.dong = CF.dong.map((D) => { const r = { ma: D.ma, ten: D.ten, goc: D.goc, giaTri: CF.heSo.map((h) => D.goc * h), sm: [] }; for (let b = 3; b <= 6; b++) { const ww = { type: 'sword', ep: { b, d: [{ m: D.ma, q: 1 }], may: {} } }; r.sm.push(E.sucManh(ww)); } return r; });
  return out;
}
"""


def lenh_bang():
    pg, errs = trang()
    ks = [4, 9, 14]
    o = pg.evaluate(BANG, [[[k, REAL[k]] for k in ks], DA_VANG])
    pg.close()
    luu('bang', o)
    print('== Hệ số sát thương 1 vũ khí theo bậc ép (tổng thật / phần Sức mạnh tính)')
    print('| Bậc | Tổng | Kiếm | Thương | Búa | Phi tiêu | Giá 1 lần | Tỉ lệ |')
    print('|---|---|---|---|---|---|---|---|')
    for r in o['bac']:
        g = r['gia']
        print(f"| {r['ten']} | ×{r['tong']:.2f} | ×{r['sword']:.3f} | ×{r['spear']:.3f} | ×{r['hammer']:.3f} | ×{r['bow']:.3f} | {('%d đá + %d vàng' % (g['da'], g['vang'])) if g else '–'} | {r['tiLe']:.0%} |")
    print('\n== Mài: hệ số và giá cộng dồn')
    for r in o['mai']:
        print(f"+{r['len']:>2} ×{r['he']:.2f}  lần này {r['gold']} vàng {r['ore']} quặng nl {r['mat']} | cộng dồn {r['dGold']} vàng {r['dOre']} quặng nl {r['dMat']}")
    for h in o['ho']:
        print(f"\n== Hồ sơ bot lúc tới {cd_lib.ten(h['k'])}: cấp {h['lvl']}, Sức mạnh {h['pw']}, kiếm {h['sword']}, phi tiêu {h['bow']}, bộ {h['bo']} {h['boCap']}")
        print('| Việc | +Sức mạnh | Giá quy vàng | Sức mạnh / 1.000 vàng |')
        print('|---|---|---|---|')
        for b in sorted(h['buoc'], key=lambda x: -(x['hieu'] or -1)):
            print(f"| {b['ten']} | {b['d']:+d} | {b['val']:.0f} | {('%.1f' % b['hieu']) if b['hieu'] is not None else '–'} |")
        print('Lưới Sức mạnh (kiếm bậc × mài 0/3/6/10/12/15):')
        for b, row in enumerate(h['luoi']):
            print(f"  {o['bac'][b]['ten']:<9}", ' '.join(f'{x:>4}' for x in row))
        print('Bộ (Sức mạnh cấp 0/1/2/3; quy đổi cấp 3 off×ehp):')
        for bo, rows in h['boBang'].items():
            print(f"  {bo:<6}", ' '.join(f"{x['pw']:>4}" for x in rows), f"  off ×{rows[3]['off']:.3f} ehp ×{rows[3]['ehp']:.3f}")
        print('Phần đòn của 4 loại khi cùng cấp hệ / mài / bậc như kiếm:', {k: round(v, 1) for k, v in h['loai'].items()})
    print('\n== Dòng hiệu ứng: giá trị (Tím / Vàng / Đỏ / Rực lửa, q = 1) và hệ số Sức mạnh tính')
    for d in o['dong']:
        print(f"{d['ten']:<32} {' / '.join('%.1f%%' % (100 * x) for x in d['giaTri'][3:])}   Sức mạnh ×{' / '.join('%.3f' % x for x in d['sm'])}")
    if errs:
        print('LỖI', errs[:3])


# ---------------------------------------------------------------- 2. ÉP: MONTE CARLO ----------------------------------------------------------------
EP = r"""
([N, bua]) => {
  const E = G.epDo, out = [];
  const gocRnd = Math.random;
  for (let dich = 1; dich <= 6; dich++) {
    const xs = [];
    for (let n = 0; n < N; n++) {
      const sv = { daBac: 1e8, buaBac: bua ? 1e8 : 0, gold: 1e9, shards: [1e6, 1e6, 1e6] };
      const w = { type: 'sword', ep: { b: 0, d: [], may: {} } };
      let lan = 0, tut = 0, maxB = 0;
      while (E.bac(w) < dich && lan < 5000) { const k = E.ep(sv, w, bua); lan++; if (k.tut) tut++; }
      xs.push({ da: 1e8 - sv.daBac, vang: 1e9 - sv.gold, m1: 1e6 - sv.shards[1], m2: 1e6 - sv.shards[2], bua: bua ? 1e8 - sv.buaBac : 0, lan, tut });
    }
    const tb = (k) => xs.reduce((a, x) => a + x[k], 0) / N;
    const pc = (k, p) => { const v = xs.map((x) => x[k]).sort((a, b) => a - b); return v[Math.min(N - 1, Math.floor(p * N))]; };
    out.push({ dich, ten: G.EP_DO.ten[dich], da: tb('da'), vang: tb('vang'), m1: tb('m1'), m2: tb('m2'), bua: tb('bua'), lan: tb('lan'), tut: tb('tut'), da50: pc('da', 0.5), da90: pc('da', 0.9) });
  }
  Math.random = gocRnd;
  // đổi dòng: số lần tẩy để có đúng 1 dòng mong muốn ở 1 ô (món đã có 3 dòng khác, Rực lửa)
  const sv = { daBac: 1e8, buaBac: 0, gold: 1e9, shards: [0, 0, 0] }; let tong = 0; const M = 4000;
  for (let n = 0; n < M; n++) { const w = { type: 'sword', ep: { b: 6, d: [{ m: 'hutMau', q: 1 }, { m: 'giamST', q: 1 }, { m: 'linhKhi', q: 1 }, { m: 'hoiChieu', q: 1 }], may: {} } }; let k = 0; while (w.ep.d[3].m !== 'chiMang' && k < 500) { E.doiDong(sv, w, 3); k++; } tong += k; }
  return { bac: out, doiDong: tong / M };
}
"""


def lenh_ep(N=20000):
    pg, errs = trang()
    a = pg.evaluate(EP, [N, False])
    b = pg.evaluate(EP, [N, True])
    pg.close()
    luu('ep', {'khongBua': a, 'coBua': b, 'N': N})
    print(f'Kỳ vọng ép MỘT vũ khí từ Bậc Trắng (Monte Carlo {N} lần, hàm G.epDo.ep thật) — không bùa | luôn dùng bùa')
    print('| Lên | Đá TB (trung vị / 90%) | Vàng | Mảnh Ngư / Hồ | Lần ép | Lần tụt | Có bùa: đá / vàng / bùa tốn |')
    print('|---|---|---|---|---|---|---|')
    for x, y in zip(a['bac'], b['bac']):
        print(f"| {x['ten']} | {x['da']:.0f} ({x['da50']} / {x['da90']}) | {x['vang']:.0f} | {x['m1']:.1f} / {x['m2']:.1f} | {x['lan']:.1f} | {x['tut']:.1f} | {y['da']:.0f} / {y['vang']:.0f} / {y['bua']:.1f} |")
    print(f"Đổi dòng ra đúng 1 dòng mong muốn (Rực lửa, món đã có 3 dòng khác): trung bình {a['doiDong']:.1f} lần × 12 đá + 600 vàng")
    if errs:
        print('LỖI', errs[:3])


# ---------------------------------------------------------------- 3 & 4. ĐẤU TRÙM: DÒNG, BỘ ----------------------------------------------------------------
TRUM = r"""
([r, i, sv, mau, cfg]) => {
  const o0 = JSON.parse(sv); o0.canLai = G.SAVE_CAN_LAI || 1; // không có cờ này G.fixSave xoá bậc ép (VM.canLai)
  G.save = G.fixSave(o0); G.save.sound = false;
  const s = G.save;
  if (cfg.dong !== undefined) { // một dòng (q = 1) trên kiếm + phi tiêu, hệ số dòng = Rực lửa (2) bất kể bậc đang có; bậc giữ nguyên
    G.EP_DO.heSo = cfg.heSo || [2, 2, 2, 2, 2, 2, 2];
    for (const t of ['sword', 'bow']) { const w = s.weapons.find((q) => q.type === t); w.ep = w.ep || { b: 0, d: [], may: {} }; w.ep.d = cfg.dong ? [{ m: cfg.dong, q: 1 }] : []; }
  }
  if (cfg.bo !== undefined) { // mặc bộ cfg.bo ở cấp cfg.cap (các bộ khác về 0)
    s.zed = s.zed || { v: 1, hoc: {} }; s.zed.boMo = { rung: 1, bien: 1, lau: 1 };
    s.boCap = { [cfg.bo]: cfg.cap }; if (cfg.bo === 'ninja') delete s.zed.bo; else s.zed.bo = cfg.bo;
  }
  const pw = G.power();
  G.botCfg.prefer = null;
  G.startStage(r, i, 0);
  const S0 = G.getRun();
  if (cfg.ca) { const q = G.probeRun(900); return { win: !!q.win, t: q.t || 0, hp: q.win ? Math.round(100 * (q.hp || 0) / (q.maxhp || 1)) : 0, bossHp: 0, pw }; } // cả ải
  G.gotoRoom(S0.map.boss);
  const W0 = G.getWorld(), b0 = W0.boss;
  if (mau) S0.P.hp = Math.max(1, Math.round(S0.P.maxhp * mau));
  const out = { win: false, t: 0, hp: 0, bossHp: 100, pw };
  for (let k = 0; k < 720; k++) {
    const S = G.getRun();
    if (!S) break;
    if (S.won || (b0 && b0.dead)) { out.win = true; out.hp = Math.round((S.P.hp / S.P.maxhp) * 100); break; }
    if (S.mode === 'dead' || S.mode === 'result' || S.P.dead) break;
    if (S.mode !== 'play') { G.botRun(1); continue; }
    G.sim(30); out.t += 0.5;
  }
  out.bossHp = b0 ? Math.max(0, Math.round((b0.hp / b0.maxhp) * 100)) : null;
  try { const S = G.getRun(); if (S) { S.quit = true; G.finishStage(false); } } catch (e) { /* bỏ qua */ }
  return out;
}
"""
HESO_GOC = "() => { G.EP_DO.heSo = [0, 0, 0, 1, 1.25, 1.6, 2]; return 1; }"


def dau(pg, k, n, mau, cfg):
    r, i = divmod(k, 5)
    rs = [pg.evaluate(TRUM, [r, i, REAL[k], mau, cfg]) for _ in range(n)]
    pg.evaluate(HESO_GOC)
    w = [x for x in rs if x['win']]
    return {'n': n, 'win': len(w), 'pct': len(w) / n, 'hp': (sum(x['hp'] for x in w) / len(w)) if w else 0,
            't': (sum(x['t'] for x in w) / len(w)) if w else None, 'pw': rs[0]['pw'],
            'trumCon': (sum((x['bossHp'] or 0) for x in rs if not x['win']) / max(1, n - len(w)))}


DONGS = [None, 'chiMang', 'stChiMang', 'trum', 'hutMau', 'tocDanh', 'hoiChieu', 'linhKhi', 'stHe', 'giamST']


def lenh_dong(n=40, ks=(9, 13, 14), mau=0.65):
    pg, errs = trang()
    ks = list(ks)
    kq = {}
    print(f'Mỗi dòng (giá trị Rực lửa, q = 1) trên cả kiếm + phi tiêu, bản lưu thật của bot ở khuyên dùng; vào thẳng phòng trùm với {mau:.0%} máu; {n} lượt')
    print('| Dòng | ' + ' | '.join(f'{cd_lib.ten(k)} thắng · máu còn · giây' for k in ks) + ' | Sức mạnh tính (3-5) |')
    print('|---|' + '---|' * (len(ks) + 1))
    for d in DONGS:
        row = {}
        for k in ks:
            row[k] = dau(pg, k, n, mau, {'dong': d or ''})
        kq[d or 'khong'] = row
        print(f"| {d or '(không dòng)'} | " + ' | '.join(f"{row[k]['pct']:.0%} · {row[k]['hp']:.0f}% · {row[k]['t'] or 0:.0f}" for k in ks) + f" | {row[ks[-1]]['pw']} |", flush=True)
    pg.close()
    luu('dong_m' + str(int(mau * 100)), {'n': n, 'ks': ks, 'mau': mau, 'kq': kq})
    if errs:
        print('LỖI', errs[:3])


def lenh_bo(n=40, ks=(4, 7, 9, 13, 14), mau=0.65, ca=False, thu=None):
    pg, errs = trang()
    ks = list(ks)
    cfgs = [('ninja', 0), ('ninja', 3), ('rung', 3), ('bien', 3), ('lau', 3)]
    kq = {}
    print(f'Mỗi bộ cấp 3 (chỉ mặc bộ đó) so với Ninja cấp 0 (không skill bộ); bản lưu thật ở khuyên dùng; ' + ('CẢ ẢI (probeRun)' if ca else f'vào thẳng phòng trùm {mau:.0%} máu') + f'; {n} lượt' + (' · THỬ: ' + thu if thu else ''))
    print('| Bộ | ' + ' | '.join(f'{cd_lib.ten(k)} thắng · máu · giây · SM' for k in ks) + ' |')
    print('|---|' + '---|' * len(ks))
    for bo, cap in cfgs:
        row = {}
        for k in ks:
            if thu: pg.evaluate('() => { ' + thu + ' return 1; }')
            row[k] = dau(pg, k, n, mau, {'bo': bo, 'cap': cap, 'ca': 1 if ca else 0})
        kq[f'{bo}{cap}'] = row
        print(f"| {bo} {cap} | " + ' | '.join(f"{row[k]['pct']:.0%} · {row[k]['hp']:.0f}% · {row[k]['t'] or 0:.0f} · {row[k]['pw']}" for k in ks) + ' |', flush=True)
    pg.close()
    luu(('bo_ca' if ca else 'bo_m' + str(int(mau * 100))) + ('_thu' if thu else ''), {'n': n, 'ks': ks, 'mau': mau, 'ca': ca, 'thu': thu, 'kq': kq})
    if errs:
        print('LỖI', errs[:3])


# ---------------------------------------------------------------- 5. DPS THẬT THEO BẬC ----------------------------------------------------------------
DPS = r"""
([wtype, bac, secs, seed, hpm]) => {
  for (const k of G.HKEYS) G.HEROES[k].fav = [];
  G.testSave({ hero: 'smith', melee: wtype === 'bow' ? 'sword' : wtype, lvl: 20, tier: 0, sharpen: 6 });
  for (const w of G.save.weapons) { G.vkMoi.datCap(w, 2, 'poison'); w.ep = { b: bac, d: [], may: {} }; }
  G.rnd = G.srand(seed);
  G.startStage(0, 2, 0, { kind: 'A', seed: 3 });
  const S = G.getRun();
  const W = G.getWorld(), P = S.P;
  W.waves = []; W.spawns = []; W.props = []; W.zones = []; W.banner = null;
  if (W.boss) { W.boss.dead = true; W.boss = null; }
  P.x = W.geo.cx; P.y = W.geo.cy;
  Object.assign(G.botCfg, { prefer: wtype, explore: false, props: false });
  if (G.curW(P).type !== wtype) P.cur = P.weapons.findIndex((w) => w.type === wtype);
  let dealt = 0;
  const dmg0 = G.damage;
  G.damage = function (t, amt, o) { const h = t.hp, r = dmg0(t, amt, o); if (!o || o.fromPlayer !== false) dealt += Math.max(0, h - Math.max(0, t.hp)); return r; };
  const roles = ['rusher', 'rusher', 'swarm', 'shield', 'archer', 'nimble', 'swarm', 'rusher'];
  let ri = 0, bad = '';
  try {
    for (let f = 0; f < secs * 60; f++) {
      if (W.ents.filter((e) => !e.dead).length < 5) {
        const side = G.rnd() < 0.5 ? W.x0 + 8 : W.x1 - 8;
        const e = G.spawnEnemy(roles[ri++ % roles.length], side + G.rr(-4, 4), G.rr(W.y0 + 6, W.y1 - 6), { hpMult: hpm });
        e.inside = true;
      }
      G.sim(1);
      if (S.mode !== 'play') { bad = S.mode; break; }
      P.hp = Math.max(P.hp, P.maxhp * 0.6);
    }
  } finally { G.damage = dmg0; G.rnd = Math.random; }
  try { S.quit = true; G.finishStage(false); } catch (e) { /* bỏ qua */ }
  return { dps: dealt / secs, bad };
}
"""


def lenh_dpsep(secs=40, seeds=6, hpm=8):
    pg, errs = trang()
    kq = {}
    print(f'Sát thương / giây thật (cụm 5 quái mới máu ×{hpm}, Zed cấp 20, Thành hình Độc, mài +6; {secs} giây × {seeds} hạt giống)')
    print('| Vũ khí | Bậc Trắng | Tím | Rực lửa | Rực lửa ÷ Trắng (thật) | Bảng hứa (tổng) | Sức mạnh tính |')
    print('|---|---|---|---|---|---|---|')
    sm = pg.evaluate("() => { const CF = G.EP_DO, o = {}; for (const t of G.WKEYS) o[t] = CF.tong[6] / (1 + CF.phu[t].giaTri * 6); return o; }")
    for t in ['sword', 'spear', 'hammer', 'bow']:
        row = {}
        for b in [0, 3, 6]:
            v = [pg.evaluate(DPS, [t, b, secs, 1000 + s * 77, hpm]) for s in range(seeds)]
            if any(x['bad'] for x in v):
                print('LỖI', t, b, v[0]['bad'])
            row[b] = sum(x['dps'] for x in v) / seeds
        kq[t] = row
        print(f"| {t} | {row[0]:.1f} | {row[3]:.1f} | {row[6]:.1f} | ×{row[6]/row[0]:.2f} | ×1,75 | ×{sm[t]:.2f} |", flush=True)
    pg.close()
    luu('dpsep_hp' + str(hpm), {'secs': secs, 'seeds': seeds, 'hpm': hpm, 'kq': kq, 'sm': sm})
    if errs:
        print('LỖI', errs[:3])


# ---------------------------------------------------------------- 6. KINH TẾ ----------------------------------------------------------------
CAI = r"""
([mua, bq, thu]) => {
  const U = G.upg, VM = G.vkMoi, E = G.epDo;
  if (thu) (0, eval)(thu); // THỬ ĐỀ XUẤT: đoạn JS đổi số CHỈ trong tiến trình đo (không ghi ra tệp game)
  if (bq) G.BAN_QUANG = { gia: bq[0], moiNgay: bq[1] }; // CHỈ trong tiến trình đo (thử giá Bà Hàng Xén khác)
  const S = () => { const s = G.save; return { gold: s.gold, ore: s.ore, lk: VM.lk(s), da: E.da(s), bua: E.bua(s), m0: s.mats[0], m1: s.mats[1], m2: s.mats[2], s0: s.shards[0], s1: s.shards[1], s2: s.shards[2] }; };
  G.__chi = {}; G.__thieu = {};
  if (!G.__daCai) {
    G.__daCai = true;
    const tally = (cat, a) => { const b = S(), c = G.__chi[cat] || (G.__chi[cat] = { n: 0 }); c.n++; for (const k in a) { const d = a[k] - b[k]; if (d) c[k] = (c[k] || 0) + d; } };
    const wrap = (obj, name, catf) => { const f = obj[name]; obj[name] = function () { const a = S(); const r = f.apply(this, arguments); if (r !== false && r !== null && r !== 0) tally(catf(arguments, r), a); return r; }; };
    wrap(U, 'doIt', (ar) => ar[1].kind); wrap(VM, 'nangBo', () => 'bo'); wrap(E, 'ep', () => 'ep'); wrap(E, 'doiDong', () => 'doiDong'); wrap(U, 'doi', () => 'doiNL'); wrap(U, 'bqMua', () => 'muaQuang');
    const vung = () => { let n = 0; for (let k = 0; k < 15; k++) if (G.save.stars[Math.floor(k / 5) + '-' + (k % 5)]) n = k + 1; return Math.min(3, Math.floor(n / 5)); };
    const muaQ = () => { // người chơi thiếu quặng để mài kiếm / phi tiêu lần kế thì mua bù ở Bà Hàng Xén (trong hạn mỗi ngày)
      const sv = G.save; if (U.bqDuoc(sv) !== '') return;
      let need = 0; for (const t of ['sword', 'bow']) { const w = sv.weapons.find((q) => q.type === t); if (w.sharpen < Math.min(G.FORGE_CAP[sv.forge], G.MAX_SHARPEN)) need += G.sharpenFull(w.sharpen).ore; }
      const thieu = need - sv.ore; if (thieu > 0) U.bqMua(sv, thieu);
    };
    const nb = G.botNang;
    G.botNang = function () {
      if (G.__muaQuang) muaQ();
      const r = nb.apply(this, arguments);
      // tắc nghẽn: việc tăng Sức mạnh đáng nhất mà chưa làm được thiếu gì; ép kiếm lần kế thiếu gì
      try {
        const sv = G.save, v = vung(), T = G.__thieu[v] || (G.__thieu[v] = { lan: 0 });
        T.lan++;
        const ds = U.rate(sv, U.list(sv).filter((q) => q.kind !== 'skill' && q.kind !== 'chuong' && q.kind !== 'level')).filter((q) => !q.ok && q.gain > 0);
        ds.sort((a, b) => b.gain / (25 + b.val * 0.15 + b.missVal) - a.gain / (25 + a.val * 0.15 + a.missVal));
        const q = ds[0];
        if (q) { const ks = []; if (q.need && q.need.lk) ks.push('linh khí'); const m = q.miss || {}; if (m.gold) ks.push('vàng'); if (m.ore) ks.push('quặng'); if (m.mat && m.mat.some((x) => x > 0)) ks.push('nguyên liệu'); const key = q.kind + ':' + (ks.join('+') || '?'); T[key] = (T[key] || 0) + 1; }
        const sw = sv.weapons.find((w) => w.type === 'sword'), ly = E.duoc(sv, sw);
        if (ly) T['ép:' + ly] = (T['ép:' + ly] || 0) + 1;
      } catch (e) { /* bỏ qua */ }
      return r;
    };
    const sn = G.botSangNgay;
    G.botSangNgay = function () { if (G.save) G.save.banQuang = { cuoi: '', n: 0 }; return sn.apply(this, arguments); }; // ngày giả mới: hồi lượt mua quặng
  }
  G.__muaQuang = !!mua;
  return 1;
}
"""
RES = """() => { const s = G.save, E = G.epDo, VM = G.vkMoi, w = (t) => s.weapons.find((q) => q.type === t);
  return { gold: Math.floor(s.gold), ore: s.ore, da: E.da(s), bua: E.bua(s), lk: Math.floor(VM.lk(s)), mats: s.mats.slice(), shards: s.shards.slice(),
    b0: E.bac(w('sword')), b1: E.bac(w('bow')), s0: w('sword').sharpen, s1: w('bow').sharpen, h0: G.wStage(w('sword')), lvl: s.heroes.smith.lvl, pw: G.power(), forge: s.forge,
    bo: JSON.stringify(s.boCap || {}) }; }"""


MANH = """() => { const s = G.save, E = G.epDo; for (const t of ['sword', 'bow']) { const w = s.weapons.find((q) => q.type === t); const g = E.gia(E.bac(w) + 1);
  if (g && g.manh) for (let i = 0; i < 3; i++) if ((s.shards[i] | 0) < g.manh[i]) return i; } return null; }"""


class Tap:
    """Bọc trang Node: ghi thu nhập từng lượt ải thường (trước / sau G.probeRun) mà không sửa cd_lib."""
    def __init__(self, pg):
        self.pg = pg; self.cur = None; self.log = []

    def evaluate(self, code, arg=None):
        if code.startswith('([r, i, d]) => G.startStage'):
            self.cur = list(arg)
        if code.startswith('G.probeRun('):
            a = self.pg.evaluate(RES)
            res = self.pg.evaluate(code, arg)
            b = self.pg.evaluate(RES)
            d = {k: b[k] - a[k] for k in ('gold', 'ore', 'da', 'bua', 'lk')}
            d['mats'] = [b['mats'][j] - a['mats'][j] for j in range(3)]
            self.log.append({'k': self.cur, 'win': bool(res.get('win')), 't': res.get('t') or 0, 'd': d, 'sau': b, 'hau': getattr(self, 'hau', False)})
            return res
        return self.pg.evaluate(code, arg)

    def close(self):
        self.pg.close()


def mot_luot(seed_i, ngay_sau, mua, ngay, bq, thu=None):
    errs = []
    pg = Tap(cd_lib.NodePage(errs))
    cd_lib.MAX_CAY = getattr(cd_lib, 'MAX_CAY', 8)
    pg.evaluate(CAI, [mua, bq, thu])
    cay = ['hoa', 'doc', 'bang'][seed_i % 3]
    kq, why = cd_lib.campaign(pg, 'khuyen', 15, cay, ngay=ngay)
    if why:
        pg.close()
        return {'loi': why}
    luot_cd = len(pg.log)
    chi_cd = pg.evaluate('() => JSON.parse(JSON.stringify(G.__chi))')
    thieu_cd = pg.evaluate('() => JSON.parse(JSON.stringify(G.__thieu))')
    ngay_cd = kq['ngay']
    # chơi tiếp sau 3-5: mỗi ngày `ngay` lượt ải thường (bot chọn chỗ cày như cd_lib) + mọi ải ngày, rồi sang ngày
    pg.hau = True
    ngay_log = []
    rec = lambda k: pg.evaluate("([r, i]) => G.stageRec(r, i, 0)", list(divmod(k, 5)))
    for dd in range(ngay_sau):
        for p in range(ngay):
            v = pg.evaluate("(a) => G.botNang(a)", 'sau')
            k = 14 if v['power'] >= 1.15 * 520 else 13
            wh = v.get('where')
            if wh is not None and (wh % 5 < 4 or v['power'] >= 1.15 * rec(wh)):
                k = wh
            # ép kiếm / phi tiêu lần kế thiếu mảnh trùm (Đỏ: mảnh Ngư Tinh, Rực lửa: mảnh Hồ Tinh) → đánh lại đúng trùm vùng đó (như người chơi)
            vm = pg.evaluate(MANH)
            if vm is not None:
                k = vm * 5 + 4
            pg.evaluate("([r, i, d]) => G.startStage(r, i, d)", list(divmod(k, 5)) + [0])
            pg.evaluate("G.probeRun(900)")
        ds = pg.evaluate("() => G.botAiNgay()")
        pg.evaluate("() => G.botSangNgay()")
        s = pg.evaluate(RES)
        s['aiNgay'] = {kk: sum(x[kk] for x in ds) for kk in ('gold', 'ore', 'da', 'lk')}
        ngay_log.append(s)
    pg.evaluate("(a) => G.botNang(a)", 'sau')
    cuoi = pg.evaluate(RES)
    chi = pg.evaluate('() => JSON.parse(JSON.stringify(G.__chi))')
    thieu = pg.evaluate('() => JSON.parse(JSON.stringify(G.__thieu))')
    pg.close()
    return {'cd': {'st': kq['st'], 't': kq['t'], 'moc': kq['moc'], 'cuoi': kq['cuoi'], 'aiNgay': kq['aiNgay'], 'ngay': ngay_cd, 'luot': luot_cd},
            'log': pg.log, 'chiCd': chi_cd, 'thieuCd': thieu_cd, 'ngayLog': ngay_log, 'cuoi': cuoi, 'chi': chi, 'thieu': thieu, 'errs': errs[:3]}


def lenh_kinhte(N=4, ngay_sau=21, mua=False, ngay=8, bq=None, thu=None, nhan=''):
    t0 = time.time()
    runs = []
    for s in range(N):
        r = mot_luot(s, ngay_sau, mua, ngay, bq, thu)
        runs.append(r)
        print(f'  lượt {s+1}/{N} xong ({time.time()-t0:.0f} giây)' + (' LỖI ' + str(r.get('loi')) if r.get('loi') else ''), flush=True)
    ok = [r for r in runs if 'loi' not in r]
    ten_k = f"kinhte_{'mua' if mua else 'khong'}_n{ngay}" + (f"_bq{bq[0]}x{bq[1]}" if bq else '') + (('_' + nhan) if nhan else '')
    tom = tom_tat(ok, ngay)
    luu(ten_k, {'N': N, 'ngaySau': ngay_sau, 'mua': mua, 'ngay': ngay, 'bq': bq, 'thu': thu, 'tom': tom})
    in_kinhte(tom, ten_k)


def tom_tat(runs, ngay):
    # 1) thu mỗi lượt ải thường theo vùng (lượt THẮNG, chiến dịch) và theo kiểu (trùm nhỏ / trùm vùng)
    thu = {}
    for r in runs:
        for x in r['log']:
            if x['hau'] or not x['k']:
                continue
            rr, ii, dd = x['k']
            key = f"v{rr+1} {'trùm vùng' if ii == 4 else 'ải thường'} {'thắng' if x['win'] else 'thua'}"
            q = thu.setdefault(key, {'n': 0, 'gold': 0, 'ore': 0, 'da': 0, 'lk': 0, 'mat': 0, 't': 0})
            q['n'] += 1; q['t'] += x['t']
            for kk in ('gold', 'ore', 'da', 'lk'):
                q[kk] += x['d'][kk]
            q['mat'] += sum(x['d']['mats'])
    for q in thu.values():
        for kk in ('gold', 'ore', 'da', 'lk', 'mat', 't'):
            q[kk] = round(q[kk] / q['n'], 1)
    # 2) ải ngày (chiến dịch)
    an = {'n': 0, 'gold': 0, 'ore': 0, 'da': 0, 'lk': 0, 'ngay': 0}
    for r in runs:
        a = r['cd']['aiNgay']; an['n'] += a['n']; an['ngay'] += r['cd']['ngay']
        for kk in ('gold', 'ore', 'da', 'lk'):
            an[kk] += a[kk]
    for kk in ('n', 'gold', 'ore', 'da', 'lk', 'ngay'):
        an[kk] = round(an[kk] / len(runs), 1)
    # 3) chi tiêu theo việc (chiến dịch / cả hai)
    def gop(key):
        out = {}
        for r in runs:
            for cat, c in r[key].items():
                o = out.setdefault(cat, {})
                for kk, v in c.items():
                    o[kk] = o.get(kk, 0) + v / len(runs)
        return {c: {k: round(v, 1) for k, v in o.items()} for c, o in out.items()}
    # 4) mốc bậc ép kiếm / phi tiêu theo ngày (chiến dịch: ngày = số lượt ải thường / ngay; sau: theo ngày giả)
    moc = {}
    for r in runs:
        seen = {}
        nluot = 0
        ndays_cd = r['cd']['ngay']
        for x in r['log']:
            if not x['hau']:
                nluot += 1
                day = nluot / ngay
            else:
                continue
            for wk, kb in (('kiếm', 'b0'), ('phi tiêu', 'b1')):
                for b in range(1, x['sau'][kb] + 1):
                    seen.setdefault(f'{wk} {b}', (round(day, 1), cd_lib.ten(x['k'][0] * 5 + x['k'][1])))
        for d, s in enumerate(r['ngayLog']):
            for wk, kb in (('kiếm', 'b0'), ('phi tiêu', 'b1')):
                for b in range(1, s[kb] + 1):
                    seen.setdefault(f'{wk} {b}', (round(ndays_cd + d + 1, 1), 'sau 3-5'))
        for k, v in seen.items():
            moc.setdefault(k, []).append(v)
    # 5) đường tồn kho theo ngày sau 3-5 (trung bình)
    duong = []
    nd = min(len(r['ngayLog']) for r in runs) if runs else 0
    for d in range(nd):
        row = {}
        for kk in ('gold', 'ore', 'da', 'lk', 'b0', 'b1', 's0', 's1', 'pw', 'lvl', 'forge', 'bua'):
            row[kk] = round(sum(r['ngayLog'][d][kk] for r in runs) / len(runs), 1)
        row['mats'] = [round(sum(r['ngayLog'][d]['mats'][j] for r in runs) / len(runs)) for j in range(3)]
        row['aiNgay'] = {kk: round(sum(r['ngayLog'][d]['aiNgay'][kk] for r in runs) / len(runs), 1) for kk in ('gold', 'ore', 'da', 'lk')}
        duong.append(row)
    # tồn kho theo lượt trong chiến dịch (mỗi ải vừa qua)
    cdduong = []
    for r in runs[:1]:
        for x in r['log']:
            if not x['hau'] and x['win']:
                cdduong.append({'k': cd_lib.ten(x['k'][0] * 5 + x['k'][1]), **{kk: x['sau'][kk] for kk in ('gold', 'ore', 'da', 'lk', 'b0', 'b1', 's0', 's1', 'pw')}})
    thieu = {}
    for key in ('thieuCd', 'thieu'):
        for r in runs:
            for v, T in r[key].items():
                o = thieu.setdefault(key + ' v' + str(v), {})
                for kk, n in T.items():
                    o[kk] = o.get(kk, 0) + n
    return {'thu': thu, 'aiNgay': an, 'chiCd': gop('chiCd'), 'chi': gop('chi'), 'moc': moc, 'duong': duong, 'cdduong': cdduong,
            'cuoiCd': {kk: round(sum(r['cd']['cuoi'][kk] if not isinstance(r['cd']['cuoi'][kk], list) else 0 for r in runs) / len(runs), 1) for kk in ('vang', 'lk', 'quang', 'da', 'cap', 'sm')},
            'ngayCd': round(sum(r['cd']['ngay'] for r in runs) / len(runs), 1), 'luotCd': round(sum(r['cd']['luot'] for r in runs) / len(runs), 1),
            'phutCd': round(sum(r['cd']['t'] for r in runs) / len(runs) / 60), 'thieu': thieu, 'errs': [r['errs'] for r in runs if r['errs']]}


def in_kinhte(t, ten_k):
    print(f'\n===== {ten_k} =====')
    print(f"Chiến dịch: {t['luotCd']} lượt ải thường, {t['ngayCd']} ngày giả, {t['phutCd']} phút (cả ải ngày). Lúc qua 3-5: {t['cuoiCd']}")
    print('Thu mỗi lượt ải thường (chiến dịch):')
    print('| Loại | Lượt | Vàng | Quặng | Đá nâng bậc | Linh khí | Nguyên liệu | Giây |')
    print('|---|---|---|---|---|---|---|---|')
    for k in sorted(t['thu']):
        q = t['thu'][k]
        print(f"| {k} | {q['n']} | {q['gold']} | {q['ore']} | {q['da']} | {q['lk']} | {q['mat']} | {q['t']} |")
    print('Ải ngày (chiến dịch, trung bình mỗi lượt):', t['aiNgay'])
    print('Chi tiêu (chiến dịch):', json.dumps(t['chiCd'], ensure_ascii=False))
    print('Chi tiêu (cả chiến dịch + sau):', json.dumps(t['chi'], ensure_ascii=False))
    print('Mốc bậc ép (ngày, ải):')
    for k in sorted(t['moc']):
        v = t['moc'][k]
        ds = sorted(x[0] for x in v)
        print(f"  {k}: ngày trung vị {stt.median(ds):.1f} (sớm {ds[0]}, muộn {ds[-1]}; {len(v)} lượt) — {', '.join(x[1] for x in v)}")
    print('Tồn kho sau 3-5 theo ngày (TB):')
    for d, r in enumerate(t['duong']):
        if d % 3 == 2 or d == 0:
            print(f"  ngày +{d+1}: vàng {r['gold']} quặng {r['ore']} đá {r['da']} bùa {r['bua']} LK {r['lk']} nl {r['mats']} | kiếm bậc {r['b0']} +{r['s0']} · phi tiêu bậc {r['b1']} +{r['s1']} · lò {r['forge']} · cấp {r['lvl']} · SM {r['pw']} | ải ngày hôm đó {r['aiNgay']}")
    print('Tắc nghẽn (việc đáng nhất chưa làm được: thiếu gì; ép kiếm: thiếu gì) — số lần về làng:')
    for k, T in sorted(t['thieu'].items()):
        lan = T.get('lan', 1)
        top = sorted(((kk, n) for kk, n in T.items() if kk != 'lan'), key=lambda q: -q[1])[:6]
        print(f"  {k} ({lan} lần): " + ', '.join(f'{kk} {100*n/lan:.0f}%' for kk, n in top))
    if t['errs']:
        print('LỖI', t['errs'][:2])


# ---------------------------------------------------------------- 7. VẼ ----------------------------------------------------------------
def lenh_ve():
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    d = json.load(open(OUT))
    fig, ax = plt.subplots(2, 3, figsize=(17, 9.5))
    fig.suptitle('Kiểm cân bằng B — chỉ số đồ, ép đồ, kinh tế, bộ trang phục (bot Node, 15/10)', fontsize=13)
    # (a) lưới Sức mạnh 3-5
    b = d['bang']
    h = [x for x in b['ho'] if x['k'] == 14][0]
    a = ax[0][0]
    mais = [0, 3, 6, 10, 12, 15]
    for i, m in enumerate(mais):
        a.plot(range(7), [row[i] for row in h['luoi']], marker='o', label=f'mài +{m}')
    a.set_xticks(range(7)); a.set_xticklabels([x['ten'] for x in b['bac']], rotation=30, fontsize=8)
    a.set_title(f"Sức mạnh cả người (hồ sơ bot ở 3-5, cấp {h['lvl']}) theo bậc ép × mài kiếm", fontsize=9); a.legend(fontsize=7); a.grid(alpha=.3)
    # (b) hiệu quả Sức mạnh / 1.000 vàng quy đổi
    a = ax[0][1]
    cols = {4: '#4a90d9', 9: '#e0a030', 14: '#d0453a'}
    rows = []
    for hh in b['ho']:
        for s in hh['buoc']:
            if s['hieu'] is not None:
                rows.append((cd_lib.ten(hh['k']) + ' ' + s['ten'].replace(' (mặc)', ''), s['hieu'], cols[hh['k']]))
    rows = sorted(rows, key=lambda r: r[1])[-22:]
    a.barh(range(len(rows)), [r[1] for r in rows], color=[r[2] for r in rows])
    a.set_yticks(range(len(rows))); a.set_yticklabels([r[0] for r in rows], fontsize=6.5)
    a.set_title('Sức mạnh tăng / 1.000 vàng quy đổi (22 việc đáng nhất; xanh 1-5, cam 2-5, đỏ 3-5)', fontsize=9); a.grid(alpha=.3, axis='x')
    # (c) ép: đá kỳ vọng
    a = ax[0][2]
    e = d['ep']
    xs = [x['ten'] for x in e['khongBua']['bac']]
    a.bar([i - 0.2 for i in range(6)], [x['da'] for x in e['khongBua']['bac']], width=0.4, label='không bùa (TB)')
    a.bar([i + 0.2 for i in range(6)], [x['da'] for x in e['coBua']['bac']], width=0.4, label='luôn dùng bùa (TB)')
    a.plot(range(6), [x['da90'] for x in e['khongBua']['bac']], 'k--', marker='x', label='không bùa, 90% người')
    a.set_yscale('log'); a.set_xticks(range(6)); a.set_xticklabels(xs, fontsize=8)
    a.set_title('Đá nâng bậc cộng dồn để ép 1 vũ khí từ Bậc Trắng (thang log)', fontsize=9); a.legend(fontsize=7); a.grid(alpha=.3)
    # (d) tồn kho sau 3-5 (bot 8 lượt / ngày, không mua quặng)
    a = ax[1][0]
    kt = d.get('kinhte_khong_n8')
    if kt and kt['tom']['duong']:
        du = kt['tom']['duong']; n0 = kt['tom']['ngayCd']
        x = [n0 + i + 1 for i in range(len(du))]
        a.plot(x, [r['gold'] / 1000 for r in du], color='#d4a017', label='vàng (nghìn)')
        a.plot(x, [r['lk'] / 1000 for r in du], color='#3aa76d', label='linh khí (nghìn)')
        a.plot(x, [r['ore'] / 100 for r in du], color='#777', label='quặng (trăm)')
        a.plot(x, [r['da'] / 100 for r in du], color='#8a3fd1', label='đá nâng bậc (trăm)')
        a2 = a.twinx()
        a2.step(x, [r['b0'] for r in du], where='post', color='#d0453a', ls='--', label='bậc ép kiếm')
        a2.set_yticks(range(7)); a2.set_yticklabels(['Trắng'] + xs, fontsize=7); a2.set_ylim(-0.3, 6.5)
        a2.legend(fontsize=7, loc='center right')
        a.axvline(n0, color='k', lw=0.8, ls=':'); a.text(n0, a.get_ylim()[1] * 0.95, ' qua 3-5', fontsize=7)
    a.set_title('Tồn kho sau khi qua 3-5 (8 lượt/ngày + ải ngày) — không còn chỗ tiêu', fontsize=9); a.set_xlabel('ngày chơi (tính cả chiến dịch)'); a.legend(fontsize=7, loc='upper left'); a.grid(alpha=.3)
    # (e) dòng hiệu ứng
    a = ax[1][1]
    dg = d.get('dong_m40')
    if dg:
        ten = list(dg['kq'].keys()); k1, k2 = str(dg['ks'][0]), str(dg['ks'][-1])
        w1 = [dg['kq'][t][k1]['pct'] * 100 for t in ten]; h2 = [dg['kq'][t][k2]['hp'] for t in ten]
        a.bar([i - 0.2 for i in range(len(ten))], w1, width=0.4, color='#4a90d9', label=f'thắng Ngư Tinh 2-5 (%)')
        a.bar([i + 0.2 for i in range(len(ten))], h2, width=0.4, color='#e0a030', label=f'máu còn khi hạ Hồ Tinh 3-5 (%)')
        a.set_xticks(range(len(ten))); a.set_xticklabels(ten, rotation=40, fontsize=7)
        a.axhline(w1[0], color='#4a90d9', lw=0.7, ls=':'); a.axhline(h2[0], color='#e0a030', lw=0.7, ls=':')
    a.set_title('Mỗi dòng ép (giá trị Rực lửa) trên kiếm + phi tiêu, vào trùm 40% máu', fontsize=9); a.legend(fontsize=7); a.grid(alpha=.3, axis='y')
    # (f) bộ: thắng cả ải
    a = ax[1][2]
    bo = d.get('bo_ca') or d.get('bo_m40')
    if bo:
        kk = bo['ks']; cf = list(bo['kq'].keys())
        wdt = 0.8 / len(cf)
        for j2, c in enumerate(cf):
            a.bar([i + j2 * wdt for i in range(len(kk))], [bo['kq'][c][str(k)]['pct'] * 100 for k in kk], width=wdt, label=c)
        a.set_xticks([i + 0.4 - wdt / 2 for i in range(len(kk))]); a.set_xticklabels([cd_lib.ten(k) for k in kk])
        a.set_ylim(40, 100)
        a.set_title('Thắng (%) theo bộ đang mặc' + (' — cả ải' if bo.get('ca') else ' — trùm'), fontsize=9); a.legend(fontsize=7); a.grid(alpha=.3, axis='y')
    fig.tight_layout()
    fig.savefig(os.path.join(HERE, 'xem-B.png'), dpi=110)
    print('đã vẽ xem-B.png')


def main():
    a = sys.argv[1:] or ['bang']
    c = a[0]
    so = [x for x in a[1:] if x.replace('.', '').isdigit()]
    if c == 'bang':
        lenh_bang()
    elif c == 'ep':
        lenh_ep(int(so[0]) if so else 20000)
    elif c == 'dong':
        kk = [x.split('=')[1] for x in a if x.startswith('ai=')]
        mm = [float(x.split('=')[1]) for x in a if x.startswith('mau=')]
        lenh_dong(int(so[0]) if so else 40, tuple(int(q) for q in kk[0].split(',')) if kk else (9, 13, 14), mm[0] if mm else 0.65)
    elif c == 'bo':
        kk = [x.split('=')[1] for x in a if x.startswith('ai=')]
        mm = [float(x.split('=')[1]) for x in a if x.startswith('mau=')]
        th = [x.split('=', 1)[1] for x in a if x.startswith('js=')]
        lenh_bo(int(so[0]) if so else 40, tuple(int(q) for q in kk[0].split(',')) if kk else (4, 7, 9, 13, 14), mm[0] if mm else 0.65, 'ca' in a, th[0] if th else None)
    elif c == 'dpsep':
        lenh_dpsep(int(so[0]) if so else 40, int(so[1]) if len(so) > 1 else 6, float(so[2]) if len(so) > 2 else 8)
    elif c == 'kinhte':
        ng = [int(x.split('=')[1]) for x in a if x.startswith('ngay=')]
        bq = [list(map(int, x.split('=')[1].split(','))) for x in a if x.startswith('bq=')]
        th = [x.split('=', 1)[1] for x in a if x.startswith('js=')]
        nh = [x.split('=', 1)[1] for x in a if x.startswith('nhan=')]
        lenh_kinhte(int(so[0]) if so else 4, int(so[1]) if len(so) > 1 else 21, 'mua' in a, ng[0] if ng else 8, bq[0] if bq else None, th[0] if th else None, nh[0] if nh else '')
    elif c == 've':
        lenh_ve()
    else:
        print(__doc__)


if __name__ == '__main__':
    main()
