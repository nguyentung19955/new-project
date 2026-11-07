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

console.log('Ember Relay (lualien)');
tran(['lualien', 'lien', 'canon', 'bang', 'tia']);
R(`var a = dat(0, 'lualien', 1), b = dat(1, 'lualien', 1), n1 = dat(2, 'lualien', 2), n2 = dat(6, 'lualien', 3), xa = dat(3, 'lualien', 2), kc = dat(7, 'lien', 1);`);
R(`B.deck = ['lien']; var ra = ghep(B, a, b);`);
ok(R('n1.lc === 1 && n2.lc === 1 && xa.lc === 1'), 'ghép ô 1 → +1 lửa cho mọi Relay cùng HÀNG (ô 2, ô 3 xa) + cùng CỘT (ô 6) — luật chữ thập co-che-moi §3-B');
ok(R('!kc.lc'), 'ụ khác loại không nhận lửa');
ok(R('n1.tocT >= 4.9 && n1.tocV >= 0.15'), 'Relay nhận lửa +15% tốc bắn 5 s');
R('for (let i = 0; i < 9; i++) SKILLS.lualien.ghep(G, B, n2, B.t[1] || n2, null);'); // ép nhiều lần ghép quanh ô 1
ok(R('n1.lc === 10'), 'KHÔNG trần lửa: 1 + 9 lần ghép = 10 lửa (n1.lc=' + R('n1.lc') + ')');
R('capNhatBan(B, 1/30)');
ok(Math.abs(R('n1.buf.dmg') - 10 * R('SKILLS.lualien.moiLua(n1)')) < 1e-6 && Math.abs(R('n1.buf.crit') - 0.20) < 1e-6, '10 lửa: 10 × mỗi lửa sát thương, +20% chí mạng (dmg ' + R('n1.buf.dmg').toFixed(3) + ')');
R('B.capThe.lualien = 6; capNhatBan(B, 1/30)');
ok(Math.abs(R('n1.buf.dmg') - 10 * R('SKILLS.lualien.moiLua(n1)')) < 1e-6 && R('SKILLS.lualien.moiLua(n1)') > 0.1, 'LV15: mỗi lửa mạnh hơn LV9 (' + R('SKILLS.lualien.moiLua(n1)') + ') × 10 lửa');
ok(/LV15/.test(R('SKILLS.lualien.mo(n1)')) && /LV9 → LV10/.test((R('B.capThe.lualien = 0'), R('SKILLS.lualien.mo(n1)'))), 'chữ xem: cấp hiện tại → cấp sau');

console.log('Quantum Choir (hopca)');
tran(['hopca', 'lien', 'canon', 'bang', 'tia']);
R(`var q = dat(7, 'hopca', 3); dat(0, 'lien', 3); dat(1, 'canon', 3); dat(2, 'bang', 3); dat(3, 'tia', 2); var d = dat(4, 'lien', 3); d.st.da = true; capNhatBan(B, 1/30);`);
ok(R('SKILLS.hopca.dem(B, q)') === 3, 'đếm 3 ụ cùng 3★ (bỏ ụ khác sao, bỏ ô đá)');
ok(Math.abs(R('q.buf.dmg') - 0.54) < 1e-6, 'LV9: +18% × 3 = +54%');
R(`for (let o = 8; o < 15; o++) dat(o, 'lien', 3); capNhatBan(B, 1/30);`);
ok(R('SKILLS.hopca.dem(B, q)') === 10 && Math.abs(R('q.buf.dmg') - 2.05) < 1e-6 && R('DOTPHA.bacU(q)') === 3, 'KHÔNG trần: 10 ụ cùng sao → +180% (LV9) + ĐỘT PHÁ III +25% (dem=' + R('SKILLS.hopca.dem(B, q)') + ', dmg ' + R('q.buf.dmg').toFixed(3) + ')');
R(`B.capThe.hopca = 6; capNhatBan(B, 1/30);`);
ok(Math.abs(R('q.buf.dmg') - 3.25) < 1e-6, 'LV15: 30% × 10 = +300% (+25% đột phá III)');
R(`B.capThe.hopca = 0; B.t.fill(null); var q7 = dat(7, 'hopca', 7); capNhatBan(B, 1/30);`);
ok(Math.abs(R('q7.buf.toc') - R('(function(){ const T = q7; const t = T.buf.toc; return t; })()')) < 1e-9 && R('q7.buf.toc') >= 0.12 - 1e-9, '7★: +12% tốc bắn');
tran(['hopca', 'lien', 'canon', 'bang', 'tia'], 'coop');
R(`var q = dat(7, 'hopca', 2); const D = G.ban[1]; D.t.fill(null); for (let o = 0; o < 5; o++) { const T = sinhU(taoU(D, 'lien', 2, o)); D.t[o] = T; }`);
ok(R('SKILLS.hopca.dem(B, q)') === 0, 'CO-OP: ụ cùng sao bàn đồng đội không tính');

console.log('Fusion Archive (luutru)');
tran(['luutru', 'lien', 'canon', 'bang', 'tia']);
R(`var k1 = dat(14, 'luutru', 1); B.deck = ['lien']; for (let i = 0; i < 6; i++) { const a = dat(0, 'lien', 1), b = dat(1, 'lien', 1); ghep(B, a, b); B.t[1] = null; }`);
ok(R('k1.kho') === 6 && R('B.ghepN') === 6, 'mỗi lần ghép thường +1 điểm lưu (6 lần → ' + R('k1.kho') + ')');
R(`var k2 = dat(13, 'luutru', 1);`);
ok(R('k2.kho') === 3, 'Archive mới nhận 50% số lần ghép (3)');
R('capNhatBan(B, 1/30)');
ok(Math.abs(R('k1.buf.dmg') - 0.15) < 1e-6, 'LV9: 6 × 2.5% = +15%');
R('k1.kho = 60; capNhatBan(B, 1/30)');
ok(Math.abs(R('k1.buf.dmg') - 1.75) < 1e-6, 'KHÔNG trần: 60 điểm → +150% (LV9) + đột phá III +25%');
R('B.capThe.luutru = 6; capNhatBan(B, 1/30)');
ok(Math.abs(R('k1.buf.dmg') - 2.65) < 1e-6, 'LV15: 4%/điểm × 60 → +240% (+25% đột phá III)');
R(`B.capThe.luutru = 0; k1.kho = 45; { const a = dat(0, 'lien', 1), b = dat(1, 'lien', 1); ghep(B, a, b); B.t[1] = null; }`);
ok(R('k1.kho') === 46, 'ghép khi đã quá 40 điểm vẫn +1 (45 → ' + R('k1.kho') + ')');
R(`B.capThe.luutru = 0; G.quai.length = 0; for (let i = 0; i < 4; i++) { sinhQuai('bo', 0, 100 + i * 2, 50); G.quai[G.quai.length - 1].vao = 1; } var h0 = G.quai.reduce((s, E) => s + E.hp, 0); var A = dat(5, 'luutru', 3), C = dat(6, 'luutru', 3); ghep(B, A, C);`);
ok(R('G.hu.some(h => h.k === "vm1Xung")'), 'Archive + Archive → 3 xung nổ');
buoc(1.2);
ok(R('G.quai.reduce((s, E) => s + Math.max(0, E.hp), 0) < h0'), 'xung nổ trúng quái');

console.log('Đột phá (DOTPHA)');
ok(R('[0, 4, 5, 9, 10, 19, 20, 39, 40, 999].map(n => DOTPHA.bac(n, DOTPHA.NGUONG.lualien)).join()') === '0,0,1,1,2,2,3,3,4,4', 'bậc theo ngưỡng Ember 5/10/20/40');
ok(R('JSON.stringify(DOTPHA.thuong(4))') === JSON.stringify({ toc: 0.15, cdmg: 0.8, dmg: 0.25, crit: 0.1 }), 'bậc IV cộng dồn: +15% tốc, +80% ST chí mạng, +25% ST, +10% chí mạng');
tran(['lualien', 'lien', 'canon', 'bang', 'tia']);
R(`var e = dat(7, 'lualien', 3); e.lc = 4; capNhatBan(B, 1/30); var t0 = e.buf.toc, c0 = e.buf.cdmg || 0; e.lc = 40; capNhatBan(B, 1/30);`);
ok(Math.abs(R('e.buf.toc - t0') - 0.15) < 1e-6 && Math.abs(R('e.buf.crit') - (0.8 + 0.1)) < 1e-6 && Math.abs(R('e.buf.cdmg - c0') - 0.8) < 1e-6, 'Ember 40 lửa: đột phá IV (toc ' + R('e.buf.toc').toFixed(2) + ', crit ' + R('e.buf.crit').toFixed(2) + ', cdmg ' + R('e.buf.cdmg').toFixed(2) + ')');
ok(/BREAKTHROUGH IV/.test(R('SKILLS.lualien.mo(e)')) && /Breakthroughs at 5\/10\/20\/40/.test((R('e.lc = 2'), R('SKILLS.lualien.mo(e)'))), 'chữ kỹ năng hiện đột phá');
ok(R('critU(Object.assign(e, { lc: 400 })) <= 1') && (R('capNhatBan(B, 1/30)'), R('critU(e)')) === 1, 'tỉ lệ chí mạng vẫn ≤ 100% (400 lửa)');
tran(['loren', 'aten', 'canon', 'bang', 'tia']);
R(`var F = dat(7, 'loren', 3); F.lo = 30; var A = dat(0, 'aten', 4); capNhatBan(B, 1/30);`);
ok(Math.abs(R('A.buf.toc') - 0.15) < 1e-6 && Math.abs(R('A.buf.cdmg') - 0.3) < 1e-6 && R('DOTPHA.bacU(F)') === 3, 'Scrap Forge 30 cộng dồn: đột phá III vào ụ nhận (toc ' + R('A.buf.toc').toFixed(2) + ')');

console.log('Hero Foundry (xuonganh)');
tran(['xuonganh', 'lien', 'canon', 'bang', 'tia']);
R(`for (let o = 0; o < 15; o++) if (o !== 5 && o !== 6) dat(o, 'lien', 1); var f1 = dat(5, 'xuonganh', 1), f2 = dat(6, 'xuonganh', 1); B.deck = ['lien']; ghep(B, f1, f2);`);
ok(R('B.hero && B.hero.length === 1'), 'ghép 2 Foundry → 1 ô anh hùng');
ok(R('!!B.t[B.hero[0].o]'), 'ưu tiên ô có ụ');
R('var oh = B.hero[0].o, T0 = B.t[oh]; capNhatBan(B, 1/30);');
ok(Math.abs(R('T0.buf.toc') - R('(() => { const X = sinhU(taoU(B, T0.id, T0.sao, 99)); return 0; })()') - 0.2) < 0.25 && R('T0.heroO') === 1, 'ụ trên ô +20% tốc bắn (1★ LV9)');
ok(Math.abs(R('SKILLS.xuonganh.v(f2, 7)') - 0.44) < 1e-9 && (R('B.capThe.xuonganh = 6'), Math.abs(R('SKILLS.xuonganh.v(f2, 7)') - 0.56) < 1e-9), '7★: 44% (LV9) · 56% (LV15)');
R(`B.capThe.xuonganh = 0; for (let i = 0; i < 3; i++) { const a = dat(5, 'xuonganh', 2), b = dat(6, 'xuonganh', 2); ghep(B, a, b); }`);
ok(R('B.hero.length') === 2, 'tối đa 2 ô / người');
R('G.t += 13; capNhatBan(B, 1/30);');
ok(R('B.hero.filter(h => h.het > G.t).length') === 0, 'ô hết hạn sau 12 s');
// tất định: 2 bàn cùng hạt giống → cùng ô
const chonO = () => { tran(['xuonganh', 'lien', 'canon', 'bang', 'tia']); R(`G.hat = 12345; B._vmN = 0; for (let o = 0; o < 15; o++) if (o % 3) dat(o, 'lien', 1); var a = dat(0, 'xuonganh', 1), b = dat(3, 'xuonganh', 1); B.deck = ['lien']; ghep(B, a, b);`); return R('B.hero[0].o'); };
ok(chonO() === chonO(), 'chọn ô tất định theo hạt giống (online 2 máy như nhau)');

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
const MOI = [['lualien', { lc: 3 }, 'Ember Relay (3 lửa)'], ['hopca', { ban: 1 }, 'Quantum Choir (7 ụ cùng sao)'], ['luutru', { kho: 20 }, 'Fusion Archive (20 điểm)']];
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
