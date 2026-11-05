// TURRET MERGE — mô phỏng không giao diện cho ĐỢT CÂN BẰNG VAI TRÒ (40 Tấn công / 27 Đặc biệt / 18 Hỗ trợ)
//   node tools/thap-sim-vaitro.js dem               → đếm vai trò theo bậc (khớp bảng TU-VAN-VAI-TRO mục 7)
//   node tools/thap-sim-vaitro.js dps [giây]        → DPS 1★ không buff từng ụ Tấn công / DPS chuẩn Thường (ngân sách theo bậc, mục 6A)
//   node tools/thap-sim-vaitro.js hotro [giây]      → giá trị ụ Hỗ trợ: % DPS tăng thêm cho nhóm ụ Tấn công kề (3★/5★/7★, mục 6B)
//   node tools/thap-sim-vaitro.js deck [lan]        → 5 kiểu deck (mục 6C) bot tự chơi SOLO, wave trung bình
//   node tools/thap-sim-vaitro.js che               → chạy nhanh SOLO / CO-OP / PVP với mọi ụ đổi vai (bắt lỗi)
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const goc = path.join(__dirname, '..', 'thap');
const FILES = ['meta', 'text', 'data', 'fx', 'tiervfx', 'game', 'chihuy', 'skills', 'skills2', 'phattrien', 'artscale', 'skills3', 'skills4', 'skills5', 'hotro'];
function taoMoiTruong(hat) {
  const noop = () => {};
  let s = hat || 12345; // Math.random có hạt giống → kết quả lặp lại được
  const M = Object.create(Math); M.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const ctx = { console, Math: M, JSON, Set, Map, Promise, Object, Array, Number, String, Infinity, NaN, isFinite, parseInt, parseFloat, Symbol, Proxy, Reflect, Error,
    setTimeout: (f) => { ctx._cho.push(f); }, clearTimeout: noop, _cho: [], performance: { now: () => 0 }, localStorage: { getItem: () => null, setItem: noop } };
  ctx.window = ctx; ctx.document = { createElement: () => ({ getContext: () => ({}) }), querySelector: () => null, getElementById: () => null, addEventListener: noop };
  ctx.addEventListener = noop;
  ctx.SND = new Proxy({}, { get: () => noop });
  ctx.VX = new Proxy({ TRE_LO: 0, hen: (d, f) => f(), t: 0, ds: [] }, { get: (o, k) => (k in o ? o[k] : noop) });
  ctx.REN = { coDau: () => 40, lamNen: noop, t: 0, img: () => null };
  ctx.UI = new Proxy({ xemHT: null }, { get: (o, k) => (k in o ? o[k] : noop) });
  ctx.FONT = { display: 'x', ui: 'x' };
  ctx.buffNo = noop; ctx.BVX = new Proxy({}, { get: () => noop }); // hàm hiển thị (buffvfx.js) — không cần khi mô phỏng
  vm.createContext(ctx);
  for (const f of FILES) { const p = path.join(goc, 'js', f + '.js'); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f + '.js' }); }
  vm.runInContext('G.roster = window.ROSTER_EMBED; G.rosterMap = {}; for (const r of G.roster) G.rosterMap[r.id] = r;', ctx);
  vm.runInContext('const _tr = trung; trung = function (E, d, o) { const h = Math.max(0, E.hp), c = E.chet; const r = _tr(E, d, o); if (!c) G._sum = (G._sum || 0) + Math.min(h, Math.max(0, h - Math.max(0, E.hp))); return r; };', ctx);
  return ctx;
}
const R = (ctx, s) => vm.runInContext(s, ctx);
function buoc(ctx, maxT, dung) {
  const dt = 1 / 30; // lò xo xoay đầu (w=24) cần dt ≤ 1/30 để ổn định
  for (let t = 0; t < maxT; t += dt) {
    R(ctx, 'capNhat(' + dt + ')');
    if (ctx._cho.length) { const c = ctx._cho.splice(0); c.forEach(f => f()); }
    if (dung && R(ctx, '!!G.ketThuc')) break;
  }
}

const TIER = ['trang', 'xanh', 'tim', 'vang', 'do'], TEN_BAC = { trang: 'Common', xanh: 'Rare', tim: 'Epic', vang: 'Legendary', do: 'Mythic' };
const MUC_TIEU = { trang: [9, 4, 2], xanh: [8, 4, 5], tim: [9, 8, 5], vang: [9, 8, 5], do: [5, 3, 1] };
const NGAN_SACH = { trang: [0.85, 1.25], xanh: [1.2, 1.7], tim: [1.45, 2.1], vang: [1.8, 2.6], do: [2.3, 3.3] }; // mục 6A: bền vững → trần ngách
// ---- đếm vai trò ----
function dem(ctx) {
  const ds = R(ctx, `G.roster.map(r => [r.id, r.bac, SKILLS[r.id] ? SKILLS[r.id].vai : '-'])`);
  const c = {}; for (const [, b, v] of ds) { c[b] = c[b] || { tc: 0, db: 0, ht: 0 }; c[b][v]++; }
  let ok = true, tong = { tc: 0, db: 0, ht: 0 };
  const dong = ['| Rarity | Attack | Special | Support | Target | OK |', '|---|---|---|---|---|---|'];
  for (const b of TIER) { const x = c[b], m = MUC_TIEU[b], d = x.tc === m[0] && x.db === m[1] && x.ht === m[2]; ok = ok && d; tong.tc += x.tc; tong.db += x.db; tong.ht += x.ht;
    dong.push('| ' + TEN_BAC[b] + ' | ' + x.tc + ' | ' + x.db + ' | ' + x.ht + ' | ' + m.join(' / ') + ' | ' + (d ? '✔' : '✘') + ' |'); }
  dong.push('| **Total** | **' + tong.tc + '** | **' + tong.db + '** | **' + tong.ht + '** | 40 / 27 / 18 | ' + (ok && tong.tc === 40 && tong.db === 27 && tong.ht === 18 ? '✔' : '✘') + ' |');
  return { ok, dong, tong };
}
// ---- DPS: đặt ụ ở các ô, quái wave W vào liên tục 2/s (máu ×hs, không lọt) ----
function dpsBan(ctx, dat, T0, opt) {
  opt = opt || {};
  ctx._dat = dat;
  R(ctx, `{ G.debug = { auto: false }; batDau('solo', ['lien', 'canon', 'set', 'tia', 'mana'], 'hero'); G.cho = 1e9; G.wave = ${opt.wave || 20};
    const B = G.ban[0]; B.tim = 1e9; B.mana = 0;
    for (const [o, id, s] of _dat) { const T = sinhU(taoU(B, id, s, o)); B.t[o] = T; }
    G._sum = 0; G._q = 0; }`);
  if (!ctx._lotVong) { ctx._lotVong = 1; R(ctx, 'const _lotSim = lot; lot = function (E) { if (G._vong) { E.s = 0; return; } return _lotSim(E); };'); }
  R(ctx, 'G._vong = true;'); // quái tới cuối đường quay lại đầu: đo SÁT THƯƠNG thuần (giá trị khống chế không bị tính thành DPS)
  const dt = 1 / 30;
  for (let t = 0; t < T0; t += dt) {
    if (t >= R(ctx, 'G._q') * 0.5) R(ctx, `{ G._q++; if (G.quai.filter(e => !e.chet).length < ${opt.max || 10}) { const d = taoWave(G.wave).ds; const Q = sinhQuai(pick(d), 0, 0, ${opt.hs || 6}); Q.vao = 1; } }`); // mật độ thật: tối đa ~10 quái trên đường
    R(ctx, 'capNhat(' + dt + ')');
    if (ctx._cho.length) { const c = ctx._cho.splice(0); c.forEach(f => f()); }
  }
  R(ctx, 'G._vong = false;');
  return R(ctx, 'G._sum') / T0;
}
// ---- bot người chơi (chỉ trong mô phỏng): biết vai trò — nâng cấp ụ Tấn công trước, chọn cặp ghép để kết quả rơi cạnh ụ Hỗ trợ,
//      giữ ụ Hỗ trợ đang có nhiều hàng xóm Tấn công. Bàn đối thủ / đồng đội vẫn dùng AI gốc của game.
const BOT = `aiBan = (function (goc) { return function (B, dt) {
  if (!G._bot || B !== G.ban[0]) return goc(B, dt);
  B.aiT -= dt; if (B.aiT > 0) return; B.aiT = 0.5;
  const vai = (id) => SKILLS[id].vai;
  if (CH.trangThai(B) === 'san' && B.mana > 120 && (B.mv.id !== 'hero' || oTrong(B).length >= 2)) { dungMV(B); return; }
  for (const T of B.t) if (T) { const sk = SKILLS[T.id]; if (sk.chuDong && T.nap >= 1 && sk.aiNen(G, B, T)) { sk.chuDong(G, B, T); return; } }
  if (B.mana >= B.gia && oTrong(B).length) { trieu(B); return; }
  const ts = B.t.filter(Boolean);
  const supKe = (o) => ts.filter(S => vai(S.id) === 'ht' && HOTRO.oDich(S).includes(o)).length;
  const tcKe = (S) => HOTRO.oDich(S).filter(o => B.t[o] && vai(B.t[o].id) === 'tc').length;
  if (oTrong(B).length <= 2) { // ghép khi bàn gần đầy
    let best = null, bs = -1e9;
    for (const a of ts) for (const b of ts) if (a !== b && a.sao < 7 && (a.id === b.id || a.id === 'mimic' || b.id === 'mimic') && hopLeGhep(a, b)) {
      let sc = -2 * a.sao + 1.5 * supKe(b.o) - 0.5 * supKe(a.o) + (vai(a.id) !== 'tc' ? 1 : 0);
      if (vai(a.id) === 'ht') sc -= 1.2 * tcKe(a); if (vai(b.id) === 'ht') sc -= 1.2 * tcKe(b);
      if (sc > bs) { bs = sc; best = [a, b]; }
    }
    if (best) { ghep(B, best[0], best[1]); return; }
  }
  const thu = B.deck.filter(id => B.lv[id] < 5).sort((x, y) => ((vai(x) === 'tc' ? 0 : vai(x) === 'ht' ? 1 : 2) - (vai(y) === 'tc' ? 0 : vai(y) === 'ht' ? 1 : 2)) || B.lv[x] - B.lv[y]);
  if (thu.length && B.mana >= LUAT.giaNangCap[B.lv[thu[0]] - 1] + (oTrong(B).length ? B.gia : 0)) nangCap(B, thu[0]);
}; })(aiBan);`;
// ---- bot tự chơi: wave đạt được ----
function song(ctx, che, deck, maxT) {
  ctx._deck = deck; ctx._che = che;
  if (!ctx._coBot) { ctx._coBot = 1; R(ctx, BOT); }
  R(ctx, `G.debug = { auto: true }; G._bot = true; batDau(_che, _deck, 'hero');`);
  buoc(ctx, maxT, true);
  return R(ctx, 'G.wave');
}
const KE4 = [2, 6, 8, 12];
const SUP_NHOM = ['lien', 'canon', 'set', 'sungluc']; // 4 ụ Tấn công Thường khác loại quanh ô 7
// 3 họ bộ bài cùng độ hiếm (Thường / Hiếm / Sử thi) — mỗi kiểu deck lấy n ụ đầu của từng nhóm vai → so sánh công bằng theo bậc
const HO_DECK = [
  { A: ['lien', 'canon', 'set', 'sungluc'], Su: ['bua', 'phagiap'], Sp: ['mana', 'bang'] },
  { A: ['laser', 'mortar', 'kiembang', 'min'], Su: ['radar', 'khuech'], Sp: ['nhanmana', 'mimic'] },
  { A: ['cuongno', 'no5', 'bao', 'nayda'], Su: ['thaukinh', 'tuthan'], Sp: ['khoathoigian', 'santhuong'] },
];
const KIEU = { '3A+1Sup+1Sp (default)': [3, 1, 1], '2A+2Sup+1Sp': [2, 2, 1], '3A+2Sp': [3, 0, 2], '4A+1Sp': [4, 0, 1], '2A+1Sup+2Sp': [2, 1, 2] };
const DECK = {};
for (const k in KIEU) { const [a, u, p] = KIEU[k]; DECK[k] = HO_DECK.map(h => h.A.slice(0, a).concat(h.Su.slice(0, u), h.Sp.slice(0, p))); }
const DOI_VAI = ['bang', 'doc', 'bomhen', 'phagiap', 'bua', 'tron', 'hutmana', 'taylo', 'khien', 'nangsao', 'hasao', 'guongcong', 'dongbo', 'cauvong', 'orbital', 'loren', 'haoquang', 'lophanung'];

if (require.main === module) {
  const che = process.argv[2] || 'dem';
  const ctx = taoMoiTruong();
  const ten = (id) => R(ctx, `TEXT.turret['${id}'] ? TEXT.turret['${id}'].name : '${id}'`);
  if (che === 'dem') { const r = dem(ctx); console.log(r.dong.join('\n')); if (!r.ok) process.exitCode = 1; }
  else if (che === 'dps') {
    const T0 = +(process.argv[3] || 40);
    const ds = R(ctx, `G.roster.filter(r => SKILLS[r.id] && SKILLS[r.id].vai === 'tc').map(r => [r.id, r.bac])`);
    // 1 quái trâu (đơn mục tiêu) đi vòng, ụ ở ô 2 (sát đường trên) — kèm cột "đám đông" (≤10 quái) cho ụ nổ lan / chuỗi
    const v = ds.map(([id, b]) => [id, b, dpsBan(ctx, [[2, id, 1]], T0, { max: 1, hs: 60 }), dpsBan(ctx, [[2, id, 1]], T0, { max: 10, hs: 6 })]);
    const tb = (b) => { const x = v.filter(q => q[1] === b).map(q => q[2]); return x.reduce((a, c) => a + c, 0) / x.length; };
    const nen = tb('trang');
    console.log('Common Attack 1★ mean DPS = ' + nen.toFixed(1));
    console.log('| Rarity | mean ×Common | budget (sustained → niche) | units outside |'); console.log('|---|---|---|---|');
    for (const b of TIER) { const ngoai = v.filter(q => q[1] === b && (q[2] / nen < NGAN_SACH[b][0] * 0.75 || q[2] / nen > NGAN_SACH[b][1] * 1.25)).map(q => ten(q[0]) + ' ' + (q[2] / nen).toFixed(2)); console.log('| ' + TEN_BAC[b] + ' | ' + (tb(b) / nen).toFixed(2) + ' | ' + NGAN_SACH[b].join('–') + ' | ' + (ngoai.join(', ') || '—') + ' |'); }
    const nen2 = v.filter(q => q[1] === 'trang').reduce((a, q) => a + q[3], 0) / v.filter(q => q[1] === 'trang').length;
    if (process.argv[4] === 'all') { console.log('| Turret | Rarity | single ×Common | crowd ×Common |'); console.log('|---|---|---|---|'); for (const q of v) console.log('| ' + ten(q[0]) + ' | ' + TEN_BAC[q[1]] + ' | ' + (q[2] / nen).toFixed(2) + ' | ' + (q[3] / nen2).toFixed(2) + ' |'); }
  } else if (che === 'hotro') {
    const T0 = +(process.argv[3] || 30), CTX2 = [ctx, taoMoiTruong(777), taoMoiTruong(4242)];
    const ds = R(ctx, `G.roster.filter(r => SKILLS[r.id] && SKILLS[r.id].vai === 'ht').map(r => [r.id, r.bac])`);
    console.log('| Support | Rarity | 3★ | 5★ | 7★ | note |'); console.log('|---|---|---|---|---|---|');
    for (const [id, b] of ds) {
      const cot = R(ctx, `SKILLS['${id}'].huong ? [1, 3, 11, 13] : [2, 6, 8, 12]`);
      const ra = [3, 5, 7].map(s => {
        const nhom = cot.map((o, i) => [o, SUP_NHOM[i], s]);
        let goc = 0, co = 0;
        const d0 = dpsBan(ctx, nhom.concat([[7, 'mana', 1]]), 15, { hs: 50 * (1 + 0.85 * (s - 1)) });
        const op = { hs: d0 / (1.6 * R(ctx, 'mauWave(20)')) }; // máu quái chỉnh theo sức nhóm: nhóm giết ~1.6 quái/s (quái vào 2/s) → có quái chết, có quái tồn đọng như wave thật
        for (const c2 of CTX2) { goc += dpsBan(c2, nhom.concat([[7, 'mana', 1]]), T0, op); co += dpsBan(c2, nhom.concat([[7, id, s]]), T0, op); }
        return Math.round((co / goc - 1) * 100);
      });
      const nt = ['khien', 'taylo', 'guongcong'].includes(id) ? 'defensive (boss / rival control)' : id === 'nangsao' ? 'buffs 2 lowest only' : '';
      console.log('| ' + ten(id) + ' | ' + TEN_BAC[b] + ' | ' + ra.map(x => (x >= 0 ? '+' : '') + x + '%').join(' | ') + ' | ' + nt + ' |');
    }
  } else if (che === 'deck') {
    const n = +(process.argv[3] || 8), mode = process.argv[4] || 'solo';
    const kq = {};
    for (const k in DECK) { const ws = []; for (const d of DECK[k]) for (let i = 0; i < n; i++) ws.push(song(ctx, mode, d, 2400)); kq[k] = ws.reduce((a, b) => a + b, 0) / ws.length; }
    const tb = Object.values(kq).reduce((a, b) => a + b, 0) / Object.keys(kq).length;
    console.log('| Deck archetype | mean wave | vs mean | within ±15% |'); console.log('|---|---|---|---|');
    for (const k in kq) console.log('| ' + k + ' | ' + kq[k].toFixed(1) + ' | ' + ((kq[k] / tb - 1) * 100 >= 0 ? '+' : '') + ((kq[k] / tb - 1) * 100).toFixed(0) + '% | ' + (Math.abs(kq[k] / tb - 1) <= 0.15 ? '✔' : '✘') + ' |');
  } else if (che === 'che') {
    let loi = 0;
    for (const mode of ['solo', 'coop', 'pvp']) for (const id of DOI_VAI.concat(['radar', 'chimang', 'lanhgia', 'khuech', 'tuthan', 'thaukinh', 'luoicheo', 'kepha', 'xaotron', 'nhieusong'])) {
      try {
        ctx._deck = [id, 'lien', 'canon', 'radar', 'set']; ctx._che = mode;
        ctx._deck2 = [id, 'hasao', 'kepha', 'guongcong', 'lien'];
        R(ctx, `G.debug = { auto: true, deck2: _deck2, mana: 3000, wave: 9, fill: 5 }; batDau(_che, _deck, 'hero');`);
        buoc(ctx, 90, false);
      } catch (e) { loi++; console.log('LỖI', mode, id, e.stack.split('\n').slice(0, 5).join(' | ')); }
    }
    console.log(loi ? loi + ' errors' : 'solo/coop/pvp: all re-roled + interaction units ran 90s without errors');
  }
}
module.exports = { taoMoiTruong, R, buoc, dem, dpsBan, song, DECK };
