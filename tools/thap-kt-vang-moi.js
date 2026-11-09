// TURRET MERGE — KIỂM HỒI QUY 4 Ụ VÀNG MỚI ĐỢT 1 (thap/js/vangmoi1.js): Ember Relay · Quantum Choir · Fusion Archive · Hero Foundry
// Mô phỏng không giao diện (vm). Kiểm luật từng ụ + cân bằng (DPS 1/4/7★ phải nằm trong dải bậc Vàng) + chạy SOLO/CO-OP/PVP không lỗi.
//   node tools/thap-kt-vang-moi.js          (in ✓/✗, thoát mã 1 nếu có lỗi)   ·   BANG=1 in bảng DPS
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const goc = path.join(__dirname, '..', 'thap');
const FILES = ['meta', 'text', 'data', 'thebai', 'fx', 'tiervfx', 'game', 'chihuy', 'skills', 'skills2', 'phattrien', 'artscale', 'skills3', 'skills4', 'skills5', 'vangmoi1', 'hotro', 'growfx'];
function moiTruong() {
  const noop = () => {};
  const ctx = { console, Math, JSON, Set, Map, WeakMap, WeakSet, Promise, Object, Array, setTimeout: (f) => { ctx._cho.push(f); }, _cho: [], performance: { now: () => 0 }, localStorage: { getItem: () => null, setItem: noop } };
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
  vm.runInContext('const _tr = trung; trung = function (E, d, o) { const h = Math.max(0, E.hp), c = E.chet; const r = _tr(E, d, o); if (!c) G._sum = (G._sum || 0) + Math.min(h, Math.max(0, h - Math.max(0, E.hp))); return r; };', ctx);
  return ctx;
}
const ctx = moiTruong(), R = (s) => vm.runInContext(s, ctx);
let loi = 0;
const ok = (dk, ten) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten); if (!dk) loi++; };
const buoc = (t) => { for (let x = 0; x < t; x += 1 / 30) { R('capNhat(1/30)'); if (ctx._cho.length) ctx._cho.splice(0).forEach(f => f()); } };
const tran = (deck, che) => { ctx._d = deck; R(`G.debug = {}; batDau('${che || 'solo'}', _d, 'hero'); G.cho = 1e9; var B = G.ban[0]; B.t.fill(null); B.mana = 0; var dat = (o, id, s) => { const T = sinhU(taoU(B, id, s, o)); B.t[o] = T; return T; };`); };

// 08/11: 4 ụ làm lại theo TOM-TAT người dùng duyệt — luật chi tiết (số B5) ở tools/thap-kt-vang-g2.js; ở đây chỉ kiểm nhanh + chế độ + cân bằng
console.log('Ember Relay (lualien)');
tran(['lualien', 'lien', 'canon', 'bang', 'tia']);
R(`var a = dat(0, 'lualien', 1), b = dat(1, 'lualien', 1), n1 = dat(2, 'lualien', 2), n2 = dat(6, 'lualien', 3), xa = dat(3, 'lualien', 2), kc = dat(7, 'lien', 1); a.lc = 2; b.lc = 3; n1.lc = 1; n2.lc = 9; xa.lc = 0;`);
R(`B.deck = ['lien']; var ra = ghep(B, a, b);`);
ok(R('n1.lc === 6 && xa.lc === 5 && n2.lc === 14'), 'ghép 0 → 1: cùng hàng ô ghép (ô 2, ô 3) +2 +3 → 6, 5 · ô 6 (cột ô ghép ô 1) 9 + 2 + 3 = 14 (luật 08/11: theo ô ghép)', R('[n1.lc, xa.lc, n2.lc]'));
ok(!R('kc.lc'), 'ụ khác loại không nhận lửa');
R('n1.lc = 10; capNhatBan(B, 1/30)');
ok(Math.abs(R('n1.buf.dmg') - (0.8 + R('DOTPHA.thuong(1, "lualien").dmg'))) < 1e-6 && Math.abs(R('n1.buf.crit') - 0.04) < 1e-6, '10 lửa: +80% ST, +4 điểm % chí mạng (đột phá I) — 08/11');
ok(/flame limit 90 /.test(R('SKILLS.lualien.mo(n1)')) && /Flames \d+\/90/.test(R('SKILLS.lualien.mo(n1)')), 'chữ xem: trần lửa 90 ở LV9 (09/11 lần 2), số lửa dạng n/trần');

console.log('Quantum Choir (hopca)');
tran(['hopca', 'lien', 'canon', 'bang', 'tia']);
R(`var q = dat(7, 'hopca', 2); dat(2, 'lien', 2); dat(6, 'canon', 2); dat(8, 'bang', 1); var d = dat(12, 'tia', 2); d.st.da = true; capNhatBan(B, 1/30);`);
ok(R('SKILLS.hopca.hoa(B, q)') === 2 && Math.abs(R('q.buf.dmg') - 0.5) < 1e-6, 'HARMONY: 2 ụ kề cùng sao (bỏ khác sao, bỏ ô đá) → +50% ST');
tran(['hopca', 'lien', 'canon', 'bang', 'tia'], 'coop');
R(`var q = dat(7, 'hopca', 2); const D = G.ban[1]; D.t.fill(null); for (let o = 0; o < 15; o++) { const T = sinhU(taoU(D, 'lien', 2, o)); D.t[o] = T; }`);
ok(R('SKILLS.hopca.hoa(B, q)') === 0, 'CO-OP: ụ bàn đồng đội không tính');

console.log('Fusion Archive (luutru)');
tran(['luutru', 'lien', 'canon', 'bang', 'tia']);
R(`var k1 = dat(14, 'luutru', 1); B.deck = ['lien']; for (let i = 0; i < 6; i++) { const a = dat(0, 'lien', 1), b = dat(1, 'lien', 1); ghep(B, a, b); B.t[1] = null; }`);
ok(R('k1.kho') === 6 && R('B.ghepN') === 6, 'mỗi lần ghép thật +1 điểm (1 Archive duy nhất nhận cả 6)');
R(`var k2 = dat(13, 'luutru', 1);`); ok(R('k2.kho') === 0, 'Archive mới bắt đầu 0 điểm');
R('capNhatBan(B, 1/30)'); ok(Math.abs(R('k1.buf.dmg') - 0.06) < 1e-6, '6 điểm: +6% ST');

console.log('Hero Foundry (xuonganh)');
tran(['xuonganh', 'lien', 'canon', 'bang', 'tia']);
R(`var f1 = dat(5, 'xuonganh', 1), f2 = dat(6, 'xuonganh', 1); B.deck = ['lien']; ghep(B, f1, f2); capNhatBan(B, 1/30);`);
ok(R('B.hero.length === 1 && B.hero[0].o === 6') && Math.abs(R('B.t[6].buf.toc') - 0.8) < 1e-6, 'ghép 2 Foundry → ô ghép thành ô anh hùng: +80% tốc');
R('G.t += 25.1; capNhatBan(B, 1/30);'); ok(R('B.hero.filter(h => h.het > G.t).length') === 0, 'ô hết hạn sau 25 s');

console.log('Ngẫu nhiên / chế độ');
const nn = R(`(() => { const c = {}; for (let i = 0; i < 300; i++) for (const id of deckNgauNhien()) c[id] = 1; return Object.keys(VM1.TAM).filter(id => c[id]); })()`);
ok(nn.length === 0, 'ụ chưa có ảnh riêng không vào bộ bài ngẫu nhiên (' + (nn.join(',') || '—') + ')');
for (const che of ['solo', 'coop', 'pvp']) {
  try { ctx._d = ['lualien', 'hopca', 'luutru', 'xuonganh', 'lien']; R(`G.debug = { auto: true, deck2: _d, mana: 3000, wave: 9 }; batDau('${che}', _d, 'hero');`); buoc(90); ok(true, che.toUpperCase() + ' 90 s bot tự chơi, không lỗi (wave ' + R('G.wave') + ')'); }
  catch (e) { ok(false, che + ': ' + e.stack.split('\n').slice(0, 3).join(' | ')); }
}

// ---- cân bằng: DPS 1 ụ (quái wave 20 vào liên tục), so với dải các ụ Vàng tấn công hiện có ----
function dps(id, sao, o) {
  o = o || {}; ctx._o = o;
  R(`{ G.debug = { auto: false }; batDau('solo', ['${id}', 'lien', 'sungluc', 'bang', 'tia'], 'hero'); G.cho = 1e9; G.wave = 20; const B = G.ban[0]; B.t.fill(null); B.tim = 1e9; B.mana = 0;
    const T = sinhU(taoU(B, '${id}', ${sao}, 2)); B.t[2] = T; if (_o.lc) T.lc = _o.lc; if (_o.kho) T.kho = _o.kho;
    if (_o.ban) for (const o of [0, 1, 3, 4, 10, 11, 12]) { const X = sinhU(taoU(B, 'sungluc', ${sao}, o)); B.t[o] = X; } // đệm 7 ụ = Súng Lục (Pháo La Bàn mới có mũi tên ngẫu nhiên + sóng nổ → DPS dao động, trừ phần đệm sai)
    G._sum = 0; G._q = 0; }`);
  for (let t = 0; t < 40; t += 1 / 30) {
    if (t >= R('G._q') * 0.5) R(`{ G._q++; const d = taoWave(G.wave).ds; sinhQuai(pick(d), 0, 0, 6); G.quai[G.quai.length - 1].vao = 1; }`);
    R('capNhat(1/30)'); if (ctx._cho.length) ctx._cho.splice(0).forEach(f => f());
  }
  return R('G._sum') / 40;
}
const VANG = ['aten', 'railgun', 'hydra', 'cuuvi', 'nemesis', 'nhatthuc', 'soi', 'ngoisao'].filter(id => R(`!!SKILLS['${id}'] && SKILLS['${id}'].dmg > 0`));
const ds = (id, o) => [1, 4, 7].map(s => Math.round(dps(id, s, o)));
const nen = VANG.map(id => [id, ds(id)]);
const min = [0, 1, 2].map(i => Math.min(...nen.map(x => x[1][i]))), max = [0, 1, 2].map(i => Math.max(...nen.map(x => x[1][i])));
const MOI = [['lualien', { lc: 10 }, 'Ember Relay (10 lửa — 08/11: mỗi lửa 8%)'], ['hopca', { ban: 1 }, 'Quantum Choir (7 ụ cùng sao)'], ['luutru', { kho: 20 }, 'Fusion Archive (20 điểm)']];
if (process.env.BANG) { console.log('| Ụ | 1★ | 4★ | 7★ |'); for (const [id, v] of nen) console.log('| ' + id + ' | ' + v.join(' | ') + ' |'); }
console.log('Cân bằng (dải Vàng hiện có 1★ ' + min[0] + '–' + max[0] + ' · 4★ ' + min[1] + '–' + max[1] + ' · 7★ ' + min[2] + '–' + max[2] + ')');
for (const [id, o, ten] of MOI) {
  const v = ds(id, o), v0 = o.ban ? ds('sungluc', { ban: 1 }).map((x, i) => x) : null;
  const tu = o.ban ? v.map((x, i) => x - Math.round(dps('sungluc', [1, 4, 7][i], { ban: 1 }) - dps('sungluc', [1, 4, 7][i]))) : v; // Choir: trừ phần 7 Cannon
  const trong = tu.every((x, i) => x >= min[i] * 0.75 && x <= max[i] * 1.2);
  ok(trong, ten + ' DPS ' + tu.join(' / ') + ' trong dải Vàng (±)');
}
console.log(loi ? '✗ ' + loi + ' lỗi' : '✓ 4 ụ vàng mới đợt 1: đạt');
process.exit(loi ? 1 : 0);
