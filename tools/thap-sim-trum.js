// TURRET MERGE — mô phỏng không giao diện cho 12 TRÙM (cân bằng trum.js)
//   node tools/thap-sim-trum.js [soLan] [che]   → mỗi trùm: ép MỌI wave trùm là trùm đó, bot tự chơi (deck chuẩn),
//   in: wave trung bình đạt được, tỉ lệ giết trùm ở wave 10/20/30/40, số tim mất vì trùm.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const goc = path.join(__dirname, '..', 'thap');
const FILES = ['meta', 'text', 'data', 'fx', 'tiervfx', 'game', 'chihuy', 'skills', 'skills2', 'phattrien', 'artscale', 'skills3', 'skills4', 'skills5', 'hotro', 'growfx', 'trum'];
function taoMoiTruong() {
  const noop = () => {};
  const ctx = { console, Math, JSON, Set, Map, Promise, Object, Array, setTimeout: (f) => { ctx._cho.push(f); }, clearTimeout: noop, _cho: [], performance: { now: () => 0 } };
  ctx.window = ctx;
  ctx.SND = new Proxy({}, { get: () => noop });
  ctx.VX = new Proxy({ TRE_LO: 0, hen: (d, f) => f(), t: 0, ds: [] }, { get: (o, k) => (k in o ? o[k] : noop) });
  ctx.TVX = new Proxy({}, { get: () => noop });
  ctx.REN = { coDau: () => 40, lamNen: noop, t: 0, img: () => null };
  ctx.UI = { vaoTran: noop, canhBaoTrum: noop, bangWave: noop, ketQua: noop };
  ctx.FONT = { display: 'x', ui: 'x' };
  vm.createContext(ctx);
  for (const f of FILES) { const p = path.join(goc, 'js', f + '.js'); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f + '.js' }); }
  vm.runInContext(`G.roster = window.ROSTER_EMBED; G.rosterMap = {}; for (const r of G.roster) G.rosterMap[r.id] = r;
    const _c0 = chet; chet = function (E, B) { const d = E.chet; _c0(E, B); if (!d && E.trum && !E.con && G._tk) G._tk.giet[G.wave] = 1; };
    const _l0 = lot; lot = function (E) { if (E.trum && G._tk) { G._tk.timTrum += E.tim; if (!E.con) G._tk.lot[G.wave] = 1; } _l0(E); };`, ctx);
  return ctx;
}
const R = (ctx, s) => vm.runInContext(s, ctx);
function chay(ctx, che, deck, id, maxT) {
  ctx._deck = deck; ctx._che = che; ctx._id = id;
  R(ctx, `TRUM_DBG = _id; G.debug = { auto: true }; batDau(_che, _deck, 'hero'); G.hang.length = 0; G._tk = { giet: {}, lot: {}, timTrum: 0 };`);
  const dt = 1 / 30;
  for (let t = 0; t < maxT; t += dt) {
    R(ctx, 'capNhat(' + dt + ')');
    if (ctx._cho.length) { const c = ctx._cho.splice(0); c.forEach(f => f()); }
    if (R(ctx, '!!G.ketThuc')) break;
  }
  return R(ctx, '({ wave: G.wave, tk: G._tk })');
}
// trận trùm có kiểm soát: bàn đầy ụ (sao theo wave), chỉ 1 trùm + 4 quái hộ tống → % quãng đường trùm đi được khi chết (≥100 = lọt)
function tranTrum(ctx, id, w, sao, deck, hs) {
  ctx._hs = hs || 1; ctx._id = id; ctx._w = w; ctx._sao = sao; ctx._deck = deck;
  R(ctx, `{ TRUM_DBG = null; G.debug = { auto: false }; batDau('solo', _deck, 'hero'); G.hang.length = 0; G.cho = 1e9; G.wave = _w;
    const B = G.ban[0]; B.tim = 1e9; B.mana = 0;
    for (let o = 0; o < B.o.length; o++) { const T = sinhU(taoU(B, _deck[o % _deck.length], Math.max(1, Math.min(7, _sao + ((o * 7) % 3) - 1)), o)); B.t[o] = T; }
    TRM.hsPhu = _hs; G._E = sinhTrum(_id, 0, _hs); G._E.vao = 1; for (let i = 0; i < 4; i++) { const q = sinhQuai('bo', 0, 0, _hs); q.s = -20 - i * 25; }
    G._sao0 = B.t.reduce((a, T) => a + (T ? T.sao : 0), 0); G._ms = 0; G._tk = { giet: {}, lot: {}, timTrum: 0 }; }`);
  const dt = 1 / 30; let t = 0;
  for (; t < 240; t += dt) {
    R(ctx, 'capNhat(' + dt + ')');
    if (ctx._cho.length) { const c = ctx._cho.splice(0); c.forEach(f => f()); }
    if (R(ctx, '{ let c = false; for (const E of G.quai) if (E.trum && !E.chet) { c = true; G._ms = Math.max(G._ms, E.s / G.duong[E.p].len); } !c; }')) break;
  }
  return R(ctx, `({ pct: Math.round(100 * G._ms), lot: G._tk.timTrum > 0, con: G.quai.filter(E => E.con).length,
    t: ${t.toFixed(1)}, saoMat: G._sao0 - G.ban[0].t.reduce((a, T) => a + (T ? T.sao : 0), 0) })`);
}
if (require.main === module && process.argv[2] === 'tran') {
  const n = +(process.argv[3] || 3), ctx = taoMoiTruong(), ids = R(ctx, 'TRUM_POOL.slice()');
  const DECK = ['lien', 'canon', 'bang', 'tia', 'set'], MOC = [[10, 3, 1], [20, 4, 1], [30, 6, 0.3], [40, 7, 0.12]];
  console.log('Bàn đầy', DECK.join(','), '· sao TB theo wave', MOC.map(m => 'w' + m[0] + '=' + m[1] + '★' + (m[2] < 1 ? ' (máu trùm ×' + m[2] + ' bù nâng cấp/ụ mạnh)' : '')).join(' '), '· số = % quãng đường trùm đi được khi chết (TB ' + n + ' lần; L = lọt)');
  console.log('trùm'.padEnd(11), MOC.map(m => ('w' + m[0]).padStart(9)).join(''), '   ★ mất@w30');
  for (const id of ids) {
    const o = [];
    let sm = 0;
    for (const [w, s, hs] of MOC) {
      let tot = 0, lot = 0;
      for (let i = 0; i < n; i++) { const r = tranTrum(ctx, id, w, s, DECK, hs); tot += Math.min(100, r.pct); if (r.lot) lot++; if (w === 30) sm += r.saoMat; }
      o.push(((tot / n).toFixed(0) + '%' + (lot ? ' L' + lot : '')).padStart(9));
    }
    console.log(id.padEnd(11), o.join(''), '   ', (sm / n).toFixed(1));
  }
} else if (require.main === module) {
  const n = +(process.argv[2] || 4), che = process.argv[3] || 'solo';
  const ctx = taoMoiTruong();
  const ids = R(ctx, 'TRUM_POOL.slice()');
  const DECK = ['lien', 'canon', 'bang', 'tia', 'set'];
  console.log('che', che, 'deck', DECK.join(','), 'n', n);
  console.log('trùm'.padEnd(11), 'wave TB', ' giết@10  @20  @30  @40', ' tim mất/trận');
  for (const id of ids) {
    const ws = [], g = { 10: 0, 20: 0, 30: 0, 40: 0 }, d = { 10: 0, 20: 0, 30: 0, 40: 0 }; let tim = 0;
    for (let i = 0; i < n; i++) {
      let r; try { r = chay(ctx, che, DECK, id, 2400); } catch (e) { console.log('LỖI', id, e.stack.split('\n').slice(0, 4).join(' | ')); break; }
      ws.push(r.wave); tim += r.tk.timTrum;
      for (const w of [10, 20, 30, 40]) if (r.wave > w || r.tk.giet[w] || r.tk.lot[w]) { d[w]++; if (r.tk.giet[w]) g[w]++; }
    }
    const tb = ws.reduce((a, b) => a + b, 0) / Math.max(1, ws.length);
    const f = (w) => (d[w] ? Math.round(100 * g[w] / d[w]) + '%' : '—').padStart(5);
    console.log(id.padEnd(11), tb.toFixed(1).padStart(6), '  ', f(10), f(20), f(30), f(40), '   ', (tim / Math.max(1, ws.length)).toFixed(1));
  }
}
module.exports = { taoMoiTruong, chay, tranTrum };
