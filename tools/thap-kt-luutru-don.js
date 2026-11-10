// TURRET MERGE — KIỂM LUẬT DỒN ĐIỂM FUSION ARCHIVE (10/11 người dùng chốt "chuyển điểm dồn hết") — thap/js/vangmoi1.js SKILLS.luutru.don
//   Archive bị ĐEM GHÉP (rời bàn) → TOÀN BỘ điểm dồn sang Archive còn trên bàn nhiều điểm nhất (hoà → ô nhỏ hơn); quá trần → sang Archive kế;
//   không còn Archive → mất. Archive vẫn còn trên bàn (Merge King +★ tại chỗ) → giữ điểm, không nhân đôi. Tất định: 2 lần cùng hạt ra cùng kết quả.
//   node tools/thap-kt-luutru-don.js   (in ✓/✗, thoát mã 1 nếu có lỗi)
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const goc = path.join(__dirname, '..', 'thap');
const FILES = ['meta', 'text', 'data', 'thebai', 'fx', 'tiervfx', 'game', 'chihuy', 'skills', 'skills2', 'phattrien', 'artscale', 'skills3', 'skills4', 'skills5', 'vangmoi1', 'hotro', 'growfx'];
function moiTruong(hatRnd) {
  const noop = () => {};
  let a = hatRnd | 0; const M = Object.create(Math); M.random = () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const ctx = { console, Math: M, JSON, Set, Map, WeakMap, WeakSet, Promise, Object, Array, setTimeout: (f) => { ctx._cho.push(f); }, _cho: [], performance: { now: () => 0 }, localStorage: { getItem: () => null, setItem: noop } };
  ctx.window = ctx; ctx.location = { search: '' };
  ctx.SND = new Proxy({}, { get: () => noop });
  ctx.VX = new Proxy({ TRE_LO: 0, hen: (d, f) => f(), t: 0, ds: [] }, { get: (o, k) => (k in o ? o[k] : noop) });
  ctx.BVX = new Proxy({}, { get: () => noop });
  ctx.REN = { coDau: () => 40, lamNen: noop, t: 0, img: () => null, s: 1, dpr: 1 };
  ctx.UI = { vaoTran: noop, canhBaoTrum: noop, bangWave: noop, ketQua: noop };
  ctx.FONT = { display: 'x', ui: 'x' };
  vm.createContext(ctx);
  for (const f of FILES) { const p = path.join(goc, 'js', f + '.js'); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f + '.js' }); }
  vm.runInContext('G.roster = window.ROSTER_EMBED; G.rosterMap = {}; for (const r of G.roster) G.rosterMap[r.id] = r;', ctx);
  return ctx;
}
let loi = 0;
const ok = (dk, ten, ...x) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (dk ? '' : '  → ' + JSON.stringify(x))); if (!dk) loi++; };
let ctx = moiTruong(1), R = (s) => vm.runInContext(s, ctx);
const tran = (deck, seed) => { ctx._d = deck; R(`G.debug = { seed: ${seed || 777} }; batDau('solo', _d, 'hero'); G.cho = 1e9; var B = G.ban[0]; B.t.fill(null); B.mana = 0; var dat = (o, id, s, k) => { const T = sinhU(taoU(B, id, s, o)); B.t[o] = T; if (k != null) T.kho = k; return T; };`); };
const DECK = ['luutru', 'lien', 'canon', 'bang', 'tia'];

console.log('Dồn điểm (tắt +1 ngẫu nhiên để đếm chính xác)');
tran(DECK); R('var _nhan = SKILLS.luutru.nhan; SKILLS.luutru.nhan = () => null; B.deck = ["lien"];');
R('var A = dat(0, "luutru", 2, 10), Bb = dat(1, "luutru", 2, 5), C = dat(5, "luutru", 1, 12), D = dat(6, "luutru", 1, 3); var r = ghep(B, A, Bb);');
ok(R('r && r.id === "lien" && B.t[0] === null'), 'ghép 2 Archive có điểm (10 + 5) → ra ụ khác loại');
ok(R('C.kho') === 27 && R('D.kho') === 3, 'Archive nhiều điểm nhất (12) nhận đủ 15 → 27; Archive ít điểm không nhận', R('[C.kho, D.kho]'));

tran(DECK); R('SKILLS.luutru.nhan = () => null; B.deck = ["lien"];');
R('var A = dat(0, "luutru", 2, 10), Bb = dat(1, "luutru", 2, 5), C = dat(5, "luutru", 1, 35), D = dat(6, "luutru", 1, 3), E = dat(7, "luutru", 1, 1); ghep(B, A, Bb);');
ok(R('SKILLS.luutru.tran(C)') === 40, 'trần cấp thẻ 0 = 40');
ok(R('C.kho') === 40 && R('D.kho') === 13 && R('E.kho') === 1, 'tràn trần: 35 → 40 (+5), dư 10 sang Archive kế (3 → 13), Archive thứ 3 không nhận', R('[C.kho, D.kho, E.kho]'));

tran(DECK); R('SKILLS.luutru.nhan = () => null; B.deck = ["lien"];');
R('var A = dat(0, "luutru", 2, 4), Bb = dat(1, "luutru", 2, 0), C = dat(9, "luutru", 1, 38), D = dat(3, "luutru", 1, 38); ghep(B, A, Bb);');
ok(R('D.kho') === 40 && R('C.kho') === 40, 'hoà điểm → ô nhỏ hơn nhận trước (ô 3: 38 → 40, ô 9: 38 → 40)', R('[D.kho, C.kho]'));
tran(DECK); R('SKILLS.luutru.nhan = () => null; B.deck = ["lien"];');
R('var A = dat(0, "luutru", 2, 3), Bb = dat(1, "luutru", 2, 0), C = dat(9, "luutru", 1, 38), D = dat(3, "luutru", 1, 38); ghep(B, A, Bb);');
ok(R('D.kho') === 40 && R('C.kho') === 39, 'hoà điểm, dư 3: ô 3 lên 40 trước, ô 9 nhận 1', R('[D.kho, C.kho]'));

tran(DECK); R('SKILLS.luutru.nhan = () => null; B.deck = ["lien"];');
R('var A = dat(0, "luutru", 2, 10), Bb = dat(1, "luutru", 2, 5); var r = ghep(B, A, Bb); var tong = B.t.reduce((s, T) => s + (T && T.kho | 0), 0);');
ok(R('tong') === 0, 'không còn Archive nào → điểm mất');

tran(DECK); R('SKILLS.luutru.nhan = () => null; B.deck = ["luutru"];');
R('var A = dat(0, "luutru", 2, 10), Bb = dat(1, "luutru", 2, 5); var r = ghep(B, A, Bb);');
ok(R('r.id === "luutru" && r.kho === 15'), 'ghép ra Archive MỚI (0 điểm) → nó là Archive còn trên bàn → nhận 15', R('r.kho'));

tran(DECK); R('SKILLS.luutru.nhan = () => null; B.deck = ["lien"];');
R('var A = dat(0, "luutru", 2, 6), C = dat(5, "luutru", 1, 9), S = dat(1, "lien", 2); A.st.da = true; S.st.da = true;');
R('var A2 = dat(0, "luutru", 2, 6), C2 = C, dd = dat(4, "luutru", 1, 20); dd.st.da = true; var X = dat(2, "luutru", 2, 0), Y = dat(3, "luutru", 2, 0); X.kho = 7; ghep(B, X, Y);');
ok(R('C.kho') === 16 && R('dd.kho') === 20, 'Archive hoá đá không nhận điểm (Archive thường 9 → 16)', R('[C.kho, dd.kho]'));

tran(['luutru', 'vughep', 'lien', 'bang', 'tia']); R('SKILLS.luutru.nhan = () => null;');
R('var K = dat(0, "luutru", 2, 8), C = dat(5, "luutru", 1, 1), V = dat(1, "vughep", 2); var r = ghep(B, V, K);');
ok(R('!!r') && R('B.t.filter(T => T && T.id === "luutru").reduce((s, T) => s + (T.kho | 0), 0)') === 9, 'Merge King +★ lên Archive (Archive vẫn ở bàn) → giữ điểm, không nhân đôi', R('B.t.map(T => T && [T.id, T.kho])'));

tran(DECK); R('SKILLS.luutru.nhan = _nhan; B.deck = ["lien"];');
R('var A = dat(0, "luutru", 2, 10), Bb = dat(1, "luutru", 2, 5), C = dat(5, "luutru", 1, 12), D = dat(6, "luutru", 1, 3); ghep(B, A, Bb);');
ok(R('C.kho + D.kho') === 31 && R('C.kho') >= 27, 'có +1 ngẫu nhiên: 15 dồn sang C + 1 điểm ghép cho 1 Archive (tổng 31)', R('[C.kho, D.kho]'));

console.log('Tất định (bot tự chơi, cùng hạt trận + cùng RNG bot → cùng điểm từng Archive)');
const chay = () => {
  ctx = moiTruong(4242); R = (s) => vm.runInContext(s, ctx);
  ctx._d = ['luutru', 'lien', 'canon', 'bang', 'tia'];
  R(`G.debug = { auto: true, seed: 9137, mana: 3000, wave: 5 }; batDau('solo', _d, 'hero');`);
  const kq = [];
  for (let i = 0; i < 30 * 120; i++) { R('capNhat(1/30)'); if (ctx._cho.length) ctx._cho.splice(0).forEach(f => f()); if (i % 300 === 299) kq.push(R('JSON.stringify([G.ban[0].ghepN | 0, G.ban[0].t.map(T => T && T.id === "luutru" ? [T.o, T.kho | 0] : 0)])')); }
  return kq;
};
const k1 = chay(), k2 = chay();
const coKho = k1.some(s => /\[\d+,[1-9]\d*\]/.test(s));
ok(JSON.stringify(k1) === JSON.stringify(k2), '2 lần chạy 120 s cùng hạt → cùng ghepN + điểm từng Archive ở mọi mốc 10 s', k1.slice(-1), k2.slice(-1));
ok(coKho, 'trận có Archive tích điểm (kiểm có nghĩa)', k1.slice(-1));
console.log(loi ? '✗ ' + loi + ' lỗi' : '✓ đạt hết');
process.exit(loi ? 1 : 0);
