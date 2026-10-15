#!/usr/bin/env python3
"""ĐO CÂN BẰNG VŨ KHÍ (15/10, kiem-can-bang phiên C). Chạy luật game trong Node (tests/node_trang.js qua cd_lib.NodePage) — mô hình tính
số bằng bot, không phải người chơi thật. CHỈ ĐO: không sửa số trong game; muốn thử số đề xuất thì truyền --pre=<mã JS> (chạy trong bộ
nhớ của lượt đo, không ghi tệp nào).

Bản lưu: tests/cay_luu.json — bản lưu thật của bot lúc vừa đủ Sức mạnh khuyên dùng của từng ải (như tests/balance.py). "Đổi vũ khí
chính sang X" = món chính của bản lưu (đã nâng, mài, ép) đổi LOẠI thành X, món loại X cũ đổi thành loại của món chính; món phụ là phi
tiêu (khi X là phi tiêu thì món phụ là món Kiếm — chính là phi tiêu cũ đổi loại). Sức mạnh gần như không đổi theo loại (đo: lệch ≤ 4%).
Bot: cấu hình "người mới" của cd_lib (BOT: react 0,3, bỏ sót 33% đạn), như bot đo khuyên dùng.

  python3 tests/vk_do.py giay                         bảng trên giấy: sát thương mỗi đòn, nhịp, st/giây, mana, chiêu Đặc biệt
  python3 tests/vk_do.py bia [n] [--ai=0,7,12]        st/giây trên cụm quái thường, một tinh anh (choáng, ngắt chiêu) — n lượt 40 giây
  python3 tests/vk_do.py btrum [n] [--ai=..]          st/giây lên trùm từng ải (không lớp thích nghi; em bé không chết: máu ≥ 60%)
  python3 tests/vk_do.py thang [n] [--ai=..]          tỉ lệ thắng cả ải theo vũ khí (+ lớp thích nghi trùm gặp, nguồn sát thương)
  python3 tests/vk_do.py trum [n] [--ai=4,9,14] [--lop=khong,khang,ap,ca]   thắng TRÙM (vào thẳng phòng trùm) theo vũ khí × lớp thích nghi
Cờ chung: --thuan (bỏ +10% "sở trường" của nhân vật, so thuần vũ khí) · --nodac (bot không dùng chiêu Đặc biệt) · --nochuong (không Chưởng)
          --khongdoi (bot KHÔNG đổi sang món phụ khi trùm kháng hệ món chính — như người chơi không để ý thẻ "Kháng ..., yếu ...")
          --vk=sword,bow,spear,hammer · --pre=<mã JS chạy trước mỗi lượt> · --json=tệp (ghi số thô) · --cpu=2 (số tiến trình Node)
"""
import sys, os, json, math, multiprocessing as mp
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import cd_lib  # noqa: E402

REAL = json.load(open(os.path.join(HERE, 'cay_luu.json')))
VK = ['sword', 'bow', 'spear', 'hammer']
TEN = {'sword': 'Kiếm', 'bow': 'Phi tiêu', 'spear': 'Thương', 'hammer': 'Búa'}

LIB = r"""
() => {
  const fav0 = G.favOf;
  window.VKD = {
    // nạp bản lưu, đổi món chính sang loại wt; o.thuan: bỏ sở trường; o.nodac / o.nochuong: bot không dùng chiêu đó
    load(sv, wt, o) {
      G.favOf = o.thuan ? () => [] : fav0;
      G.save = G.fixSave(JSON.parse(sv)); G.save.sound = false;
      const ws = G.save.carry.map((id) => G.weaponById(id)), main = ws[0];
      if (wt && main.type !== wt) { const ot = ws.find((w) => w.type === wt); if (ot) ot.type = main.type; main.type = wt; }
      G.botDatVk(wt || 'sword');
      Object.assign(G.botCfg, { react: 0.3, missProj: 0.33, prefer: wt || null, explore: false, swapOnResist: !o.khongdoi });
      VKD.o = o;
    },
    // gọi mỗi khung (hoặc mỗi nửa giây) khi đang đánh: tắt chiêu theo cờ
    gate(P) { if (VKD.o.nodac) P.specCd = 99; if (VKD.o.nochuong) P.skillCd = 99; },
    layers(b, lop, wt) { // đặt lớp thích nghi cho trùm theo tên biến thể
      if (!b || lop === 'tn') return;
      const el = G.activeEl(G.getWorld().P, G.curW(G.getWorld().P)) || 'fire';
      const anti = { type: wt === 'bow' ? 'antiRanged' : 'antiMelee' }, res = { type: 'resist', el, pct: VKD.pct || 0.3 }; // VKD.pct: thử mức kháng khác qua --pre=VKD.pct=0.2
      b.layers = lop === 'khong' ? [] : lop === 'khang' ? [res] : lop === 'ap' ? [anti] : [res, anti];
      const rs = b.layers.filter((l) => l.type === 'resist').map((l) => l.el);
      b.weak = rs.map((e) => G.WEAK[e]).filter((e) => !rs.includes(e));
    },
  };
  return 1;
}
"""

# st/giây lên cụm quái thường hoặc một tinh anh (đánh tới chết rồi mọc con mới), trong phòng đầu của ải k
BIA = r"""
([sv, wt, o, r, i, kieu, secs, seed]) => {
  VKD.load(sv, wt, o);
  G.rnd = G.srand(seed);
  G.startStage(r, i, 0);
  const S = G.getRun(), W = G.getWorld(), P = S.P;
  W.waves = []; W.spawns = []; W.zones = []; W.banner = null;
  for (const e of W.ents) e.dead = true;
  P.x = W.geo.cx; P.y = W.geo.cy;
  if (G.curW(P).type !== wt) { const k = P.weapons.findIndex((w) => w.type === wt); if (k >= 0) P.cur = k; }
  let dealt = 0, hurt = 0, kills = 0, stunF = 0, eF = 0, spec = 0, ch = 0, lastSpec = 0, lastSk = 0, ttk = [], born = 0;
  const dmg0 = G.damage, hurt0 = G.hurtPlayer;
  G.damage = function (t, amt, oo) { const h = t.hp, rr = dmg0(t, amt, oo); if (!oo || oo.fromPlayer !== false) dealt += Math.max(0, h - Math.max(0, t.hp)); return rr; };
  G.hurtPlayer = function () { const h = P.hp, rr = hurt0.apply(this, arguments); hurt += Math.max(0, h - P.hp); return rr; };
  const ngat0 = G.chieuTrum ? G.chieuTrum.soNgat : 0;
  const roles = ['rusher', 'swarm', 'shield', 'archer', 'nimble', 'spiky', 'rusher', 'bomber'];
  let ri = 0, bad = '', cur = null;
  try {
    for (let f = 0; f < secs * 60; f++) {
      const alive = W.ents.filter((e) => !e.dead);
      if (kieu === 'tinhanh') {
        if (!cur || cur.dead) { if (cur) { ttk.push((f - born) / 60); kills++; } const side = G.rnd() < 0.5 ? W.x0 + 14 : W.x1 - 14; cur = G.spawnEnemy('elite', side, G.rr(W.y0 + 10, W.y1 - 10), {}); cur.inside = true; born = f; }
        eF++; if (cur.st.stun > 0 || cur.st.frozen > 0) stunF++;
      } else if (alive.length < 5) {
        const side = G.rnd() < 0.5 ? W.x0 + 8 : W.x1 - 8;
        const e = G.spawnEnemy(roles[ri++ % roles.length], side + G.rr(-4, 4), G.rr(W.y0 + 6, W.y1 - 6), { hpMult: 2.5 }); e.inside = true;
        if (ri > 5) kills++;
      }
      VKD.gate(P);
      if (P.specT > lastSpec) spec++; lastSpec = P.specT;
      if (P.skillCd > lastSk + 0.5) ch++; lastSk = P.skillCd;
      G.sim(1);
      if (S.mode !== 'play') { bad = 'thoát khỏi trận: ' + S.mode; break; }
      if (!W.over) P.hp = Math.max(P.hp, P.maxhp * 0.6);
    }
  } finally { G.damage = dmg0; G.hurtPlayer = hurt0; G.rnd = Math.random; }
  try { S.quit = true; G.finishStage(false); } catch (e) { /* bỏ qua */ }
  return { dps: dealt / secs, hurt: hurt / secs / P.maxhp * 100, kills, ttk: ttk.length ? ttk.reduce((a, b) => a + b, 0) / ttk.length : null, stun: eF ? stunF / eF : null,
           ngat: (G.chieuTrum ? G.chieuTrum.soNgat : 0) - ngat0, spec: spec / secs * 60, ch: ch / secs * 60, pw: S.power, bad };
}
"""

# vào thẳng phòng trùm của ải (r, i); dps: em bé không chết (máu ≥ 60%), đo st/giây tới khi trùm gục (tối đa lim giây);
# thắng: chơi thật tới thắng / thua
TRUM = r"""
([sv, wt, o, r, i, lop, mode, lim, seed]) => {
  VKD.load(sv, wt, o);
  G.rnd = G.srand(seed);
  G.startStage(r, i, 0);
  const S0 = G.getRun();
  G.gotoRoom(S0.map.boss);
  const W = G.getWorld(), b = W.boss, P = S0.P;
  if (G.curW(P).type !== wt) { const k = P.weapons.findIndex((w) => w.type === wt); if (k >= 0) P.cur = k; }
  VKD.layers(b, lop, wt);
  const out = { win: false, t: 0, hp: 0, bossHp: 100, stun: 0, spec: 0, hurt: 0, dist: 0, layers: b ? b.layers.map(G.layerText) : [], kind: b ? b.kind : '-', name: b ? b.name : '-' };
  let dealt = 0, f = 0, stunF = 0, lastSpec = 0, distS = 0, hurt = 0;
  const hurt0 = G.hurtPlayer;
  const src = {};
  G.hurtPlayer = function () { const h = P.hp, rr = hurt0.apply(this, arguments), d = Math.max(0, h - P.hp); hurt += d;
    if (d > 0) { const k = b && !b.dead ? (b.skillName || 'đánh thường') : 'khác'; src[k] = (src[k] || 0) + d / P.maxhp * 100; } return rr; };
  out.src = src;
  try {
    for (; f < lim * 60; f++) {
      const S = G.getRun();
      if (!S) break;
      if (S.won || (b && b.dead)) { out.win = true; out.hp = Math.round(S.P.hp / S.P.maxhp * 100); break; }
      if (S.mode === 'dead' || S.mode === 'result' || S.P.dead) break;
      if (S.mode !== 'play') { G.botRun(1); continue; }
      VKD.gate(P);
      if (P.specT > lastSpec) out.spec++; lastSpec = P.specT;
      if (b && (b.st.stun > 0 || b.st.frozen > 0)) stunF++;
      if (b) distS += Math.hypot(P.x - b.x, (P.y - b.y) * 1.6);
      G.sim(1);
      if (mode === 'dps' && !W.over) P.hp = Math.max(P.hp, P.maxhp * 0.6);
    }
  } finally { G.hurtPlayer = hurt0; G.rnd = Math.random; }
  out.t = f / 60;
  out.stun = f ? stunF / f : 0; out.dist = f ? distS / f : 0; out.spec = out.spec / Math.max(1, out.t) * 60;
  out.hurt = hurt / Math.max(1, out.t) / P.maxhp * 100;
  out.bossHp = b ? Math.max(0, Math.round(b.hp / b.maxhp * 100)) : null;
  out.dps = b ? (b.maxhp - Math.max(0, b.hp)) / Math.max(1, out.t) : 0;
  out.bossMax = b ? Math.round(b.maxhp) : 0;
  try { const S = G.getRun(); if (S && S.mode === 'play') { S.quit = true; G.finishStage(false); } } catch (e) { /* bỏ qua */ }
  return out;
}
"""

# cả ải như tests/balance.py (G.probeRun), ghi thêm lớp thích nghi trùm học được và tỉ lệ đánh xa / hệ
THANG = r"""
([sv, wt, o, r, i, seed]) => {
  VKD.load(sv, wt, o);
  G.rnd = G.srand(seed);
  G.startStage(r, i, 0);
  const S0 = G.getRun(), pw = S0.power, rec = S0.rec;
  if (G.curW(S0.P).type !== wt) { const k = S0.P.weapons.findIndex((w) => w.type === wt); if (k >= 0) S0.P.cur = k; }
  if (o.nodac || o.nochuong) { const s0 = G.sim; G.sim = function (n) { const S = G.getRun(); if (S && S.P) VKD.gate(S.P); return s0.apply(this, arguments); }; VKD.s0 = s0; }
  let res;
  try { res = G.probeRun(900); } finally { G.rnd = Math.random; if (VKD.s0) { G.sim = VKD.s0; VKD.s0 = null; } }
  const S = G.getRun(), st = S && S.stats;
  const lay = (S && S.layers) || [];
  const hurt = Object.values(res.hurt || {}).reduce((a, b) => a + b, 0);
  return { pw, rec, win: !!res.win, t: res.t, toi: !!(res.rooms || []).some((x) => x[0] === 'boss') || res.bossT != null || (res.rooms || []).length && res.bossHp != null,
           bossHp: res.bossHp, layers: lay.map((l) => l.type === 'resist' ? 'resist:' + l.el : l.type), hurt: hurt / (res.maxhp || (S && S.P && S.P.maxhp) || 1), hetGio: !res.win && res.t >= 899,
           ranged: st ? st.ranged / Math.max(1, st.ranged + st.melee) : null, nguon: res.hurt, bad: res.bad };
}
"""

GIAY = r"""
() => {
  const M = G.MOVES, T = G.WTYPES, out = {};
  const row = (reach, hits) => { const t = hits.reduce((a, h) => a + h.t, 0), d = hits.reduce((a, h) => a + h.d, 0); return { reach, t, n: hits.length, hit: d / hits.length, dps: d / t }; };
  out.sword = row(M.sword.chain[0].reach + '-' + M.sword.chain[2].reach, M.sword.chain.map((m) => ({ t: m.dur, d: T.sword.dmg * m.mult })));
  out.bow = row(M.bow.shot.range, [{ t: M.bow.shot.still, d: T.bow.dmg * M.bow.shot.mult }]);
  out.spear = row(M.spear.chain[0].reach + '-' + M.spear.chain[2].reach, M.spear.chain.map((m) => ({ t: m.dur, d: T.spear.dmg * m.mult })));
  out.hammer = row(M.hammer.swing.reach, [{ t: M.hammer.swing.dur, d: T.hammer.dmg * M.hammer.swing.mult }]);
  const sp = M.special;
  out.dac = { sword: [sp.sword.name, T.sword.dmg * sp.sword.mult, 'xuyên, con sau x' + sp.sword.fall], spear: [sp.spear.name, T.spear.dmg * sp.spear.mult, 'ghim choáng ' + sp.spear.pin + ' s, về tay x' + sp.spear.backMult],
    hammer: [sp.hammer.name, T.hammer.dmg * (sp.hammer.mult + sp.hammer.ringMult), 'vệt nứt choáng ' + sp.hammer.stun + ' s + vòng'], bow: ['Mưa phi tiêu', T.bow.dmg * M.bow.rain.mult * 6, '6 đợt x' + M.bow.rain.mult + ' mỗi quái trong vùng'] };
  out.stagger = T.hammer.stagger; out.dmg = Object.fromEntries(Object.keys(T).map((k) => [k, T[k].dmg]));
  return out;
}
"""


def opts():
    o = {'thuan': '--thuan' in sys.argv, 'nodac': '--nodac' in sys.argv, 'nochuong': '--nochuong' in sys.argv, 'khongdoi': '--khongdoi' in sys.argv}
    return o


def arg(name, d=None):
    for a in sys.argv:
        if a.startswith('--' + name + '='):
            return a.split('=', 1)[1]
    return d


_pg = None


def _init(pre):
    global _pg
    _pg = cd_lib.NodePage([])
    _pg.evaluate(LIB)
    if pre:
        _pg.evaluate('() => { ' + pre + '; return 1; }')


def _run(job):
    code, a = job
    try:
        return _pg.evaluate({'BIA': BIA, 'TRUM': TRUM, 'THANG': THANG}[code], a)
    except Exception as e:  # lỗi một lượt: ghi lại, không dừng cả bài đo
        return {'bad': str(e)[:300]}


def chay(jobs, pre=None):
    cpu = int(arg('cpu', min(2, os.cpu_count() or 1)))
    with mp.Pool(cpu, initializer=_init, initargs=(pre,)) as pool:
        return pool.map(_run, jobs, chunksize=1)


def wilson(k, n):
    if not n: return (0, 0)
    z = 1.96; p = k / n; d = 1 + z * z / n
    c = (p + z * z / (2 * n)) / d; h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return (max(0, c - h), min(1, c + h))


def tb(xs):
    xs = [x for x in xs if x is not None]
    return sum(xs) / len(xs) if xs else float('nan')


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else 'giay'
    pos = [a for a in sys.argv[2:] if not a.startswith('--')]
    n = int(pos[0]) if pos else 10
    o = opts()
    vks = (arg('vk') or ','.join(VK)).split(',')
    pre = arg('pre')
    raw = {'mode': mode, 'n': n, 'o': o, 'pre': pre, 'rows': []}
    if mode == 'giay':
        pg = cd_lib.NodePage([])
        g = pg.evaluate(GIAY)
        print('| Vũ khí | Sát thương gốc | Tầm | Chuỗi đòn | Giây/chuỗi | St/đòn | St/giây trên giấy | Đặc biệt (st gốc 1 lần) |')
        print('|---|---|---|---|---|---|---|---|')
        for k in VK:
            r = g[k]; d = g['dac'][k]
            print(f"| {TEN[k]} | {g['dmg'][k]} | {r['reach']} | {r['n']} | {r['t']:.2f} | {r['hit']:.1f} | {r['dps']:.1f} | {d[0]} {d[1]:.1f} ({d[2]}) |")
        print('Búa choáng mỗi nhát trúng (không lên trùm):', g['stagger'], 'giây')
        raw['giay'] = g
        pg.close()
    elif mode == 'bia':
        ais = [int(x) for x in (arg('ai') or '2,7,12').split(',')]
        jobs = []
        for k in ais:
            for wt in vks:
                for kieu in ('quai', 'tinhanh'):
                    for s in range(n):
                        jobs.append(('BIA', [REAL[k], wt, o, k // 5, k % 5, kieu, 40, 1000 + 77 * s]))
        res = chay(jobs, pre)
        it = iter(res)
        print('| Ải (Sức mạnh) | Vũ khí | Quái thường st/giây | mất máu %/giây | Tinh anh st/giây | giây hạ 1 tinh anh | tinh anh bị choáng/đông | ngắt chiêu / phút | Đặc biệt / phút |')
        print('|---|---|---|---|---|---|---|---|---|')
        for k in ais:
            for wt in vks:
                q = [next(it) for _ in range(n)]; e = [next(it) for _ in range(n)]
                bad = [x['bad'] for x in q + e if x.get('bad')]
                raw['rows'].append({'ai': k, 'wt': wt, 'quai': q, 'tinhanh': e})
                print(f"| {cd_lib.ten(k)} ({q[0].get('pw')}) | {TEN[wt]} | {tb([x.get('dps') for x in q]):.1f} | {tb([x.get('hurt') for x in q]):.2f} | {tb([x.get('dps') for x in e]):.1f} | "
                      f"{tb([x.get('ttk') for x in e]):.1f} | {100*tb([x.get('stun') for x in e]):.0f}% | {tb([x.get('ngat') for x in e])*60/40:.1f} | {tb([x.get('spec') for x in q + e]):.1f} |" + (' LỖI ' + str(bad[:1]) if bad else ''), flush=True)
    elif mode in ('btrum', 'trum'):
        ais = [int(x) for x in (arg('ai') or ('0,1,2,3,4,5,6,7,8,9,10,11,12,13,14' if mode == 'btrum' else '4,9,14')).split(',')]
        lops = (arg('lop') or ('khong' if mode == 'btrum' else 'khong,khang,ap,ca')).split(',')
        jobs = []
        for k in ais:
            for lop in lops:
                for wt in vks:
                    for s in range(n):
                        jobs.append(('TRUM', [REAL[k], wt, o, k // 5, k % 5, lop, 'dps' if mode == 'btrum' else 'thang', 150 if mode == 'btrum' else 360, 2000 + 31 * s]))
        res = chay(jobs, pre)
        it = iter(res)
        if mode == 'btrum':
            print('| Ải | Trùm | Vũ khí | St/giây lên trùm | Giây hạ trùm | Trùm bị choáng | Đặc biệt / phút | Cách trùm TB | Mất máu %/giây |')
            print('|---|---|---|---|---|---|---|---|---|')
        else:
            print('| Ải | Trùm | Lớp | Vũ khí | Thắng trùm | Khoảng 95% | Giây | Máu còn khi thắng | Trùm còn khi thua |')
            print('|---|---|---|---|---|---|---|---|---|')
        for k in ais:
            for lop in lops:
                for wt in vks:
                    q = [next(it) for _ in range(n)]
                    bad = [x['bad'] for x in q if x.get('bad')]
                    raw['rows'].append({'ai': k, 'lop': lop, 'wt': wt, 'r': q})
                    nm = q[0].get('name', '?')
                    if mode == 'btrum':
                        print(f"| {cd_lib.ten(k)} | {nm} | {TEN[wt]} | {tb([x.get('dps') for x in q]):.1f} | {tb([x.get('t') for x in q]):.0f} | {100*tb([x.get('stun') for x in q]):.0f}% | "
                              f"{tb([x.get('spec') for x in q]):.1f} | {tb([x.get('dist') for x in q]):.0f} | {tb([x.get('hurt') for x in q]):.2f} |" + (' LỖI ' + str(bad[:1]) if bad else ''), flush=True)
                    else:
                        w = [x for x in q if x.get('win')]; l = [x for x in q if not x.get('win') and not x.get('bad')]
                        lo, hi = wilson(len(w), n)
                        print(f"| {cd_lib.ten(k)} | {nm} | {lop} {'/'.join(q[0].get('layers') or ['-'])} | {TEN[wt]} | {len(w)}/{n} ({100*len(w)/n:.0f}%) | {100*lo:.0f}–{100*hi:.0f}% | "
                              f"{tb([x['t'] for x in w]):.0f} | {tb([x['hp'] for x in w]):.0f}% | {tb([x.get('bossHp') for x in l]):.0f}% |" + (' LỖI ' + str(bad[:1]) if bad else ''), flush=True)
    elif mode == 'thang':
        ais = [int(x) for x in (arg('ai') or ','.join(map(str, range(15)))).split(',')]
        jobs = [('THANG', [REAL[k], wt, o, k // 5, k % 5, 3000 + 53 * s]) for wt in vks for k in ais for s in range(n)]
        res = chay(jobs, pre)
        it = iter(res)
        tot = {}
        print('| Vũ khí | Ải | Sức mạnh / khuyên dùng | Thắng | Tới trùm | Thua ở trùm, trùm còn | Lớp thích nghi hay gặp | Đánh xa % | Mất máu / ải |')
        print('|---|---|---|---|---|---|---|---|---|')
        for wt in vks:
            for k in ais:
                q = [next(it) for _ in range(n)]
                ok = [x for x in q if not x.get('bad')]
                w = [x for x in ok if x['win']]
                toi = [x for x in ok if x.get('bossHp') is not None]
                thua = [x for x in toi if not x['win']]
                lay = {}
                for x in toi:
                    key = '+'.join(x.get('layers') or []) or '-'
                    lay[key] = lay.get(key, 0) + 1
                top = ', '.join(f'{a} {b}' for a, b in sorted(lay.items(), key=lambda kv: -kv[1])[:2])
                t = tot.setdefault(wt, [0, 0, {}]); t[0] += len(w); t[1] += len(ok)
                t[2][k] = (len(w), len(ok))
                raw['rows'].append({'ai': k, 'wt': wt, 'r': q})
                print(f"| {TEN[wt]} | {cd_lib.ten(k)} | {q[0].get('pw')}/{q[0].get('rec')} | {len(w)}/{len(ok)} | {len(toi)} | {tb([x.get('bossHp') for x in thua]):.0f}% | {top} | "
                      f"{100*tb([x.get('ranged') for x in ok]):.0f} | {100*tb([x.get('hurt') for x in ok]):.0f}% |" + (' LỖI' if len(ok) < len(q) else ''), flush=True)
        print('\n| Vũ khí | Thắng cả 15 ải | Khoảng 95% | Vùng 1 | Vùng 2 | Vùng 3 |')
        print('|---|---|---|---|---|---|')
        for wt in vks:
            a, b, per = tot[wt]
            lo, hi = wilson(a, b)
            vung = []
            for v in range(3):
                ww = sum(per[k][0] for k in per if k // 5 == v); nn = sum(per[k][1] for k in per if k // 5 == v)
                vung.append(f'{100*ww/nn:.0f}%' if nn else '-')
            print(f"| {TEN[wt]} | {a}/{b} ({100*a/max(1,b):.0f}%) | {100*lo:.0f}–{100*hi:.0f}% | " + ' | '.join(vung) + ' |')
        raw['tong'] = {wt: tot[wt][:2] for wt in tot}
    else:
        print(__doc__); sys.exit(2)
    j = arg('json')
    if j:
        json.dump(raw, open(j, 'w'), ensure_ascii=False)


if __name__ == '__main__':
    main()
