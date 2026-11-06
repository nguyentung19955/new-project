// TURRET MERGE — ĐO SỨC MẠNH THEO BẬC (trắng < xanh < tím < vàng < đỏ), kiểu DCDW
//   node tools/thap-sim-tier.js do [ra.json] [nhanh]  → đo cả 85 ụ, ghi JSON (mặc định docs/demo-hop-tuong/tuvan/tier/do-sau.json)
//   node tools/thap-sim-tier.js bang truoc.json sau.json → in bảng BANG.md (trước/sau)
//   node tools/thap-sim-tier.js bac [lan]               → bộ bài cùng bậc (3 Tấn công + 1 Hỗ trợ + 1 Đặc biệt) tự chơi SOLO: wave trung bình mỗi bậc
// Cách đo (cùng kịch bản wave 20, cấp thẻ = LV đầu của bậc → hsThe = 1, không power-up):
//   · Tấn công  : DPS 1 ụ ở ô 2 (sát đường) — đơn mục tiêu (quái trâu) và đám đông (≤10 quái) — tại 1★/4★/7★; ụ đỏ tự dùng chủ động khi nạp đầy.
//                 CHỈ SỐ = trung bình nhân (đơn × đám đông) / trung vị ụ Tấn công TRẮNG cùng sao.
//   · Hỗ trợ    : % DPS tăng thêm cho bàn chuẩn 4 ụ Tấn công Trắng cùng sao quanh ô 7 (so với ô 7 = Mana Core). CHỈ SỐ = 4 × % tăng (= "đáng giá bao nhiêu ụ Tấn công Trắng").
//   · Đặc biệt  : wave đạt được (20 lượt; nhanh 12) khi thêm vào bộ cố định [Gatling, Cannon, Tesla, Revolver] (AI của game chơi, nhiều hạt giống).
//                 CHỈ SỐ quy đổi từ wave bằng đường hồi quy log(chỉ số) ~ wave dựng trên chính các ụ Tấn công (cùng bộ, cùng AI).
//   · Cột "wave bộ" có cho MỌI ụ (giá trị thật trong trận, gồm cơ chế phụ thuộc bàn như Star Cannon / Chain Link / Railgun).
'use strict';
const fs = require('fs'), path = require('path');
const { taoMoiTruong: taoGoc, R } = require('./thap-sim-vaitro.js');
// môi trường mô phỏng + các tệp ụ mới ngoài danh sách của thap-sim-vaitro.js (ụ vàng mới đợt 1/2)
const THEM = ['vangmoi1', 'skills7'];
function taoMoiTruong(hat) {
  const ctx = taoGoc(hat), vm = require('vm');
  vm.runInContext("if (typeof SUP === 'undefined') { var SUP = {}, SUP_LOAI = {}, SUP_GIA = {}; }", ctx); // bảng hiển thị hỗ trợ (support.js — không cần khi mô phỏng)
  for (const f of THEM) { const p = path.join(__dirname, '..', 'thap', 'js', f + '.js'); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f + '.js' }); }
  return ctx;
}
const TIER = ['trang', 'xanh', 'tim', 'vang', 'do'];
const TEN = { trang: 'White', xanh: 'Blue', tim: 'Purple', vang: 'Gold', do: 'Red' };
const NEN = ['lien', 'canon', 'set', 'sungluc'];
const SAO = [1, 4, 7];

const DUNG_CD = `{ const B = G.ban[0]; for (const T of B.t) if (T) { const sk = SKILLS[T.id]; if (sk.chuDong && T.nap >= 1 && (!sk.aiNen || sk.aiNen(G, B, T))) sk.chuDong(G, B, T); } }`;
function dps(ctx, dat, T0, opt) {
  ctx._dat = dat;
  R(ctx, `{ G.debug = { auto: false }; batDau('solo', ['lien', 'canon', 'set', 'tia', 'mana'], 'hero'); G.cho = 1e9; G.wave = 20;
    const B = G.ban[0]; B.tim = 1e9; B.mana = 0;
    for (const [o, id, s] of _dat) { const T = sinhU(taoU(B, id, s, o)); B.t[o] = T; }
    G._sum = 0; G._q = 0; }`);
  if (!ctx._lotVong) { ctx._lotVong = 1; R(ctx, 'const _lotSim = lot; lot = function (E) { if (G._vong) { E.s = 0; return; } return _lotSim(E); };'); }
  R(ctx, 'G._vong = true;');
  const dt = 1 / 30; let cd = 0;
  for (let t = 0; t < T0; t += dt) {
    if (t >= R(ctx, 'G._q') * 0.5) R(ctx, `{ G._q++; if (G.quai.filter(e => !e.chet).length < ${opt.max}) { const d = taoWave(G.wave).ds; const Q = sinhQuai(pick(d), 0, 0, ${opt.hs}); Q.vao = 1; } }`);
    R(ctx, 'capNhat(' + dt + ')');
    if (ctx._cho.length) { const c = ctx._cho.splice(0); c.forEach(f => f()); }
    if ((cd -= dt) <= 0) { cd = 0.5; R(ctx, DUNG_CD); }
  }
  R(ctx, 'G._vong = false;');
  return R(ctx, 'G._sum') / T0;
}
function song(ctx, deck, maxT) {
  ctx._deck = deck;
  R(ctx, `G.debug = { auto: true }; G._bot = false; batDau('solo', _deck, 'hero');`);
  const dt = 1 / 30;
  for (let t = 0; t < maxT; t += dt) {
    R(ctx, 'capNhat(' + dt + ')');
    if (ctx._cho.length) { const c = ctx._cho.splice(0); c.forEach(f => f()); }
    if (R(ctx, '!!G.ketThuc')) break;
  }
  return R(ctx, 'G.wave');
}
const med = (a) => { const b = a.slice().sort((x, y) => x - y), n = b.length; return !n ? 0 : n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };
const gm = (a, b) => Math.sqrt(Math.max(1e-6, a) * Math.max(1e-6, b));

function doTatCa(nhanh, cu, chi) { // cu + chi: chỉ đo lại các id trong chi, còn lại chép số đo cũ (vòng lặp chỉnh nhanh)
  const ctx = taoMoiTruong(12345);
  const tatCa = R(ctx, `G.roster.filter(r => SKILLS[r.id]).map(r => ({ id: r.id, bac: r.bac, vai: SKILLS[r.id].vai, ten: TEXT.turret[r.id] ? TEXT.turret[r.id].name : r.id, huong: !!SKILLS[r.id].huong }))`);
  const ds = cu && chi ? tatCa.filter(u => chi.includes(u.id)) : tatCa;
  const T0 = nhanh ? 20 : 36, NHAT = nhanh ? 2 : 3;
  // --- Tấn công: DPS đơn + đám đông ---
  for (const u of ds.filter(u => u.vai === 'tc')) {
    u.don = {}; u.dong = {};
    for (const s of SAO) {
      const k = 1 + 0.85 * (s - 1);
      u.don[s] = dps(ctx, [[2, u.id, s]], T0, { max: 1, hs: 60 * k });
      u.dong[s] = dps(ctx, [[2, u.id, s]], T0, { max: 10, hs: 6 * k });
    }
  }
  const tcT = ds.filter(u => u.vai === 'tc' && u.bac === 'trang');
  const nen = cu && chi ? cu.nen : {}; if (!(cu && chi)) for (const s of SAO) nen[s] = { don: med(tcT.map(u => u.don[s])), dong: med(tcT.map(u => u.dong[s])) };
  // --- Hỗ trợ: % DPS tăng cho bàn chuẩn ---
  const CTX = [ctx, taoMoiTruong(777), taoMoiTruong(4242)].slice(0, NHAT);
  for (const u of ds.filter(u => u.vai === 'ht')) {
    u.g = {};
    const cot = u.huong ? [1, 3, 11, 13] : [2, 6, 8, 12];
    for (const s of SAO) {
      const nhom = cot.map((o, i) => [o, NEN[i], s]);
      const k = 1 + 0.85 * (s - 1);
      let goc = 0, co = 0;
      for (const c of CTX) { goc += dps(c, nhom.concat([[7, 'mana', 1]]), T0 * 0.8, { max: 10, hs: 10 * k }); co += dps(c, nhom.concat([[7, u.id, s]]), T0 * 0.8, { max: 10, hs: 10 * k }); }
      u.g[s] = co / goc - 1;
    }
  }
  // --- wave của bộ cố định + 1 ụ (mọi ụ) ---
  // Đặc biệt + ụ hạ gục tức thì: wave bộ bài LÀ chỉ số → nhiều lượt (20; nhanh 8). Tấn công / Hỗ trợ: 4 lượt chỉ để tham khảo (nhanh: bỏ).
  const CW = [11, 222, 3333, 44444, 555555].map(h => taoMoiTruong(h));
  for (const u of ds) {
    const chinh = u.vai === 'db' || THEO_BO.includes(u.id), n = chinh ? (nhanh ? 12 : 20) : (nhanh ? 0 : 4);
    const w = []; for (let i = 0; i < n; i++) w.push(song(CW[i % CW.length], NEN.concat([u.id]), 2400));
    u.w = w.length ? w.reduce((a, b) => a + b, 0) / w.length : HQ_W0;
    process.stderr.write('.');
  }
  process.stderr.write('\n');
  const ra = cu && chi ? tatCa.map(u => ds.find(q => q.id === u.id) || cu.ds.find(q => q.id === u.id)) : ds;
  return tinh({ ngay: new Date().toISOString(), nhanh: !!nhanh, nen, ds: ra });
}

// ---- chỉ số từ số đo thô ----
//  ps = chỉ số đơn lẻ theo vai (Tấn công: DPS đơn×đám đông; Hỗ trợ: 4 × % tăng) — tỉ lệ với sát thương, dùng làm CHỈ SỐ chính.
//  pw = chỉ số quy từ wave bộ bài: exp(HQ_B·(wave − HQ_W0)) — hồi quy CỐ ĐỊNH log(ps 4★) ~ wave trên 38 ụ Tấn công lúc đo gốc (06/11/2026),
//       giữ cố định để trước/sau so được (1 wave ≈ +25% chỉ số).
//  p  = ps cho Tấn công / Hỗ trợ; = pw cho Đặc biệt và cho ụ HẠ GỤC TỨC THÌ (bài thử quái trâu làm phồng ảo: Guillotine, Nemesis).
const HQ_B = 0.2206, HQ_W0 = 13.69, THEO_BO = ['maychem', 'nemesis'];
function tinh(d) {
  for (const u of d.ds) {
    const pw = Math.exp(HQ_B * (u.w - HQ_W0));
    u.ps = {}; u.p = {};
    for (const s of SAO) {
      if (u.vai === 'tc') u.ps[s] = gm(u.don[s] / d.nen[s].don, u.dong[s] / d.nen[s].dong);
      else if (u.vai === 'ht') u.ps[s] = Math.max(0.02, 4 * u.g[s]);
      else u.ps[s] = pw;
      u.p[s] = u.vai === 'db' || THEO_BO.includes(u.id) ? pw : u.ps[s];
    }
    u.pw = pw;
  }
  return d;
}
// ---- bảng ----
function tomTat(d) {
  const r = {};
  for (const t of TIER) { const x = d.ds.filter(u => u.bac === t); r[t] = { p4: med(x.map(u => u.p[4])), p1: med(x.map(u => u.p[1])), p7: med(x.map(u => u.p[7])), w: med(x.map(u => u.w)), n: x.length };
    for (const v of ['tc', 'ht', 'db']) r[t][v] = med(x.filter(u => u.vai === v).map(u => u.p[4])); }
  return r;
}
function kiem(d) { // luật: trung vị tăng theo bậc (4★), không ụ bậc thấp vượt trung vị vàng, không vàng vượt trung vị đỏ
  const t = tomTat(d), loi = [];
  for (let i = 1; i < TIER.length; i++) if (t[TIER[i - 1]].p4 > t[TIER[i]].p4) loi.push('median ' + TEN[TIER[i - 1]] + ' ' + t[TIER[i - 1]].p4.toFixed(2) + ' > ' + TEN[TIER[i]] + ' ' + t[TIER[i]].p4.toFixed(2));
  return { t, loi };
}
const VAI = { tc: 'Attack', ht: 'Support', db: 'Special' };
function bang(truoc, sau) {
  const L = [], f = (x) => x.toFixed(2);
  const A = tomTat(truoc), Bb = sau ? tomTat(sau) : null;
  L.push('## Median power per tier (index ×White Attack, 4★, LV start)', '');
  L.push('| Tier | n | median 1★ | median 4★ | median 7★ | Attack 4★ | Support 4★ | Special 4★ | deck wave | step vs prev (4★) |' + (Bb ? ' AFTER 4★ | AFTER step | AFTER deck wave |' : ''));
  L.push('|---|---|---|---|---|---|---|---|---|---|' + (Bb ? '---|---|---|' : ''));
  TIER.forEach((t, i) => {
    const x = A[t], st = i ? '+' + Math.round((x.p4 / A[TIER[i - 1]].p4 - 1) * 100) + '%' : '—';
    let s = '| ' + TEN[t] + ' | ' + x.n + ' | ' + f(x.p1) + ' | ' + f(x.p4) + ' | ' + f(x.p7) + ' | ' + f(x.tc) + ' | ' + f(x.ht) + ' | ' + f(x.db) + ' | ' + x.w.toFixed(1) + ' | ' + st + ' |';
    if (Bb) { const y = Bb[t]; s += ' ' + f(y.p4) + ' | ' + (i ? '+' + Math.round((y.p4 / Bb[TIER[i - 1]].p4 - 1) * 100) + '%' : '—') + ' | ' + y.w.toFixed(1) + ' |'; }
    L.push(s);
  });
  const d = sau || truoc, T = tomTat(d);
  L.push('', '## Every turret (' + (sau ? 'AFTER rebalance' : 'measured') + '), ranked per tier', '');
  L.push('Index (×White Attack median): Attack = solo DPS (geo-mean single×crowd); Support = 4 × DPS gain on a 4-White board ("worth N White attackers"); Special and instant-kill units (Guillotine, Nemesis) = from deck waves (fixed regression, 1 wave ≈ +25%). Flags (vs the SAME ROLE’s tier medians): ▲ above next tier · ▼ below previous tier · ⚑ above Gold (White/Blue/Purple) or above Red (Gold).', '');
  L.push('| Tier | Turret | role | 1★ | 4★ | 7★ | deck wave | flag |' + (sau ? ' before 4★ |' : ''));
  L.push('|---|---|---|---|---|---|---|---|' + (sau ? '---|' : ''));
  TIER.forEach((t, i) => {
    const x = d.ds.filter(u => u.bac === t).sort((a, b) => b.p[4] - a.p[4]);
    for (const u of x) {
      const fl = [];
      const m = (k) => T[k][u.vai] || 0; // so CÙNG VAI (Tấn công với Tấn công…): trung vị gộp lẫn vai nên không dùng để cắm cờ
      if (i < 4 && m(TIER[i + 1]) && u.p[4] > m(TIER[i + 1])) fl.push('▲');
      if (i > 0 && m(TIER[i - 1]) && u.p[4] < m(TIER[i - 1])) fl.push('▼');
      if (i < 3 && m('vang') && u.p[4] > m('vang')) fl.push('⚑');
      if (i === 3 && m('do') && u.p[4] > m('do')) fl.push('⚑');
      let s = '| ' + TEN[t] + ' | ' + u.ten + ' (`' + u.id + '`) | ' + VAI[u.vai] + ' | ' + f(u.p[1]) + ' | ' + f(u.p[4]) + ' | ' + f(u.p[7]) + ' | ' + u.w.toFixed(1) + ' | ' + fl.join(' ') + ' |';
      if (sau) { const o = truoc.ds.find(q => q.id === u.id); s += ' ' + (o ? f(o.p[4]) : '—') + ' |'; }
      L.push(s);
    }
  });
  return L.join('\n');
}

if (require.main === module) {
  const che = process.argv[2] || 'do';
  const thu = path.join(__dirname, '..', 'docs', 'demo-hop-tuong', 'tuvan', 'tier');
  if (che === 'do') {
    const ra = process.argv[3] || path.join(thu, 'do-sau.json'), nhanh = process.argv.includes('nhanh');
    const aTu = process.argv.find(a => a.startsWith('tu=')), aChi = process.argv.find(a => a.startsWith('chi='));
    const d = doTatCa(nhanh, aTu && JSON.parse(fs.readFileSync(aTu.slice(3))), aChi && aChi.slice(4).split(','));
    fs.mkdirSync(path.dirname(ra), { recursive: true }); fs.writeFileSync(ra, JSON.stringify(d, null, 1));
    const k = kiem(d);
    for (const t of TIER) console.log(TEN[t].padEnd(7), 'median4★', k.t[t].p4.toFixed(2), ' tc', k.t[t].tc.toFixed(2), ' ht', k.t[t].ht.toFixed(2), ' db', k.t[t].db.toFixed(2), ' wave', k.t[t].w.toFixed(1));
    console.log(k.loi.length ? 'TIER ORDER BROKEN: ' + k.loi.join('; ') : 'tier medians rise White < Blue < Purple < Gold < Red ✔');
  } else if (che === 'bac') { // bộ bài CÙNG BẬC (3 Tấn công + 1 Hỗ trợ + 1 Đặc biệt đầu bảng của bậc) — wave trung bình, AI game chơi SOLO
    const n = +(process.argv[3] || 8), ctx = taoMoiTruong(99), CW = [99, 1234, 56789].map(h => taoMoiTruong(h));
    const ds = R(ctx, `G.roster.filter(r => SKILLS[r.id]).map(r => [r.id, r.bac, SKILLS[r.id].vai])`);
    console.log('| Tier deck | deck | mean wave |'); console.log('|---|---|---|');
    for (const t of TIER) {
      const lay = (v, k) => ds.filter(q => q[1] === t && q[2] === v).slice(0, k).map(q => q[0]);
      const deck = lay('tc', 3).concat(lay('ht', 1), lay('db', 1)), w = [];
      for (let i = 0; i < n; i++) w.push(song(CW[i % CW.length], deck, 3000));
      console.log('| ' + TEN[t] + ' | ' + deck.join(', ') + ' | ' + (w.reduce((a, b) => a + b, 0) / w.length).toFixed(1) + ' |');
    }
  } else if (che === 'bang') {
    const a = tinh(JSON.parse(fs.readFileSync(process.argv[3]))), b = process.argv[4] ? tinh(JSON.parse(fs.readFileSync(process.argv[4]))) : null;
    console.log(bang(a, b));
  }
}
module.exports = { doTatCa, tinh, tomTat, kiem, bang, TIER, TEN };
