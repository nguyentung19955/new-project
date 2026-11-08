// TURRET MERGE — KIỂM ĐỢT LÀM LẠI TƯỚNG VÀNG 08/11 (nhóm A, người dùng duyệt TOM-TAT: docs/demo-hop-tuong/tuvan/ghi-chu-nguoi-dung/)
//   Cấp thẻ 10–17 theo vai trò · Ember Relay (max, trần 70) · Quantum Choir HARMONY · Fusion Archive (1 điểm / ghép thật, mốc) · Twin Anvil · Prism Thief
//   (4 màu, Chromatic Circuit) · Blood Circuit (đánh dấu → nuốt → Máu → Blood Rite) · Salvo Battery (bingo dở dang) · Trứng Evolver · Hero Foundry 25 s.
//   Phần 1: luật thuần (vm, không giao diện) — số theo CHATGPT-SPEC B5. Phần 2 (PW=1): chạy thật Playwright + chụp ảnh 844×390 và 390×844.
//   node tools/thap-kt-vang-g2.js        (✓/✗, mã thoát 1 nếu lỗi)
//   PW=1 node tools/thap-kt-vang-g2.js  (cần python3 -m http.server 8765 ở gốc repo; ảnh: tools/shots-vang-g2/ — không commit)
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const goc = path.join(__dirname, '..', 'thap');
const FILES = ['meta', 'text', 'data', 'thebai', 'fx', 'tiervfx', 'game', 'chihuy', 'skills', 'skills2', 'phattrien', 'artscale', 'skills3', 'skills4', 'skills5', 'vangmoi1', 'hotro', 'support', 'buff', 'skills7', 'jackpot', 'growfx', 'trum'];
function moiTruong() {
  const noop = () => {};
  const ctx = { console, Math, JSON, Set, Map, WeakMap, WeakSet, Promise, Object, Array, Error, setTimeout: (f) => { ctx._cho.push(f); }, clearTimeout: noop, _cho: [], performance: { now: () => 0 }, localStorage: { getItem: () => null, setItem: noop } };
  ctx.window = ctx; ctx.location = { search: '' }; ctx.addEventListener = noop;
  ctx.SND = new Proxy({}, { get: () => noop });
  ctx.VX = new Proxy({ TRE_LO: 0, hen: (d, f) => f(), t: 0, ds: [] }, { get: (o, k) => (k in o ? o[k] : noop) });
  ctx.BVX = new Proxy({}, { get: () => noop });
  ctx.REN = { coDau: () => 40, lamNen: noop, t: 0, img: () => null, s: 1, dpr: 1 };
  ctx.UI = { vaoTran: noop, canhBaoTrum: noop, bangWave: noop, ketQua: noop };
  ctx.FONT = { display: 'x', ui: 'x' };
  vm.createContext(ctx);
  for (const f of FILES) { const p = path.join(goc, 'js', f + '.js'); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f + '.js' }); }
  vm.runInContext("if (typeof buffNo === 'undefined') var buffNo = function () {};", ctx);
  vm.runInContext('G.roster = window.ROSTER_EMBED; G.rosterMap = {}; for (const r of G.roster) G.rosterMap[r.id] = r;', ctx);
  return ctx;
}
const ctx = moiTruong(), R = (s) => vm.runInContext(s, ctx);
let loi = 0;
const ok = (dk, ten, chi) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (dk || chi == null ? '' : ' — ' + chi)); if (!dk) loi++; };
const gan = (a, b, e) => Math.abs(a - b) < (e || 1e-6);
const buoc = (t) => { for (let x = 0; x < t; x += 1 / 30) { R('capNhat(1/30)'); if (ctx._cho.length) ctx._cho.splice(0).forEach(f => f()); } };
const tran = (deck, cap) => { ctx._d = deck; ctx._c = cap || {}; R(`G.debug = {}; batDau('solo', _d, 'hero'); G.cho = 1e9; G.quai.length = 0; var B = G.ban[0]; B.t.fill(null); B.mana = 0; B.capThe = Object.assign({}, _c);
  var dat = (o, id, s, f) => { const T = sinhU(taoU(B, id, s, o)); B.t[o] = T; if (f) f(T); return T; }; var cn = () => capNhatBan(B, 1/30);`); };

console.log('Cấp thẻ VÀNG/ĐỎ 10–17 theo vai trò');
tran(['lien', 'canon', 'bang', 'tia', 'set']);
ok(R("THE.maxLv('vang')") === 17 && R("THE.maxLv('do')") === 17 && R("THE.maxLv('trang')") === 15, 'thẻ Vàng/Đỏ tối đa LV17, bậc khác 15');
ok(R("THE.saoCan.vang.length") === 8 && R("THE.vangCan.length") >= 17, 'bảng bản sao/vàng đủ cho LV16–17');
R("B.capThe = { hydra: 8, dongbo: 8, loren: 8 }");
ok(gan(R("hsThe(B, 'hydra')"), 1.40) && gan(R("tocThe(B, 'hydra')"), 1.16), 'Tấn công LV17: +40% ST, +16% tốc (+5% / +2% mỗi cấp)');
ok(gan(R("tocThe(B, 'dongbo')"), 1) && gan(R("heDB(B, 'loren')"), 1.24), 'Hỗ trợ không thêm tốc · Đặc biệt LV17 ×1.24 (+3%/cấp)');
ok(gan(R("knGt(KY_NANG_CAP.dongbo, 8) / KY_NANG_CAP.dongbo.base"), 1.32, 1e-3), 'Hỗ trợ VÀNG LV17 ×1.32 (+4%/cấp)');
ok(gan(R("hsThe(B, 'lien')"), 1), 'thẻ bậc thấp không đổi (không có cấp)');

console.log('Ember Relay (lualien)');
tran(['lualien', 'lien', 'canon', 'bang', 'tia']);
R(`var a = dat(1, 'lualien', 2, T => T.lc = 2), b = dat(2, 'lualien', 2, T => T.lc = 4), c3 = dat(4, 'lualien', 1, T => T.lc = 3), c8 = dat(7, 'lualien', 1, T => T.lc = 8), xa = dat(8, 'lualien', 1, T => T.lc = 1); B.deck = ['lien']; var ra = ghep(B, a, b);`);
// LUẬT 08/11 (người dùng): ghép Ember + Ember → mọi Ember khác cùng hàng/cột với Ô GHÉP (ô C) nhận lửa A + C; rời bàn đơn lẻ → theo ô của chính nó; ở lại → không
ok(R('c3.lc') === 9, 'Ember cùng hàng ô ghép (ô 2): 3 + 2 + 4 = 9', R('c3.lc'));
ok(R('c8.lc') === 14, 'Ember ô 7 chung CỘT với ô ghép (ô 2): 8 + 2 + 4 = 14', R('c8.lc'));
ok(R('xa.lc') === 1, 'Ember ngoài hàng/cột của A và C không đổi');
{ // nhiều ụ nhận, hàng + cột, A và C khác hàng/khác cột (A ô 0, C ô 6)
  R(`B.t.fill(null); var A = dat(0, 'lualien', 2, T => T.lc = 5), C = dat(6, 'lualien', 2, T => T.lc = 3), x1 = dat(1, 'lualien', 1, T => T.lc = 1), x5 = dat(5, 'lualien', 1, T => T.lc = 2),
    x2 = dat(2, 'lualien', 1, T => T.lc = 0), x11 = dat(11, 'lualien', 1, T => T.lc = 4), x13 = dat(13, 'lualien', 1, T => T.lc = 7); B.deck = ['lien']; ghep(B, A, C);`);
  ok(R('x1.lc') === 9 && R('x5.lc') === 10, 'ô 1, ô 5 chung đường với ô ghép (ô 6): nhận A + C (1 + 8 = 9, 2 + 8 = 10)', R('[x1.lc, x5.lc]'));
  ok(R('x2.lc') === 0 && R('x11.lc') === 12, 'ô 2 (chỉ hàng của A, không chung đường ô ghép) không nhận · ô 11 (cột ô ghép) nhận 3 + 5 = 8 → 12', R('[x2.lc, x11.lc]'));
  ok(R('x13.lc') === 7, 'ô 13 không chung đường → giữ 7');
}
{ // ví dụ người dùng: A = 5, B = 5, C = 5, kéo B vào C → A = 15 (A thẳng hàng với C, với B, với cả 2)
  const ab = (oA, oB, oC) => { R(`B.t.fill(null); var A = dat(${oA}, 'lualien', 1, T => T.lc = 5), Bm = dat(${oB}, 'lualien', 2, T => T.lc = 5), Cm = dat(${oC}, 'lualien', 2, T => T.lc = 5); B.deck = ['lien']; ghep(B, Bm, Cm);`); return R('A.lc'); };
  ok(ab(10, 7, 0) === 15, 'A chỉ chung CỘT với C (A ô 10, B ô 7, C ô 0): A = 5 + 5 + 5 = 15', ab(10, 7, 0));
  ok(ab(10, 0, 7) === 5, 'A chỉ chung đường với B (A ô 10, B ô 0, C ô 7): không nhận (ô ghép là ô C)', ab(10, 0, 7));
  ok(ab(2, 0, 1) === 15, 'A chung hàng với cả B và C (A ô 2, B ô 0, C ô 1): 15 (mỗi lần ghép tính 1 lần, không 25)', ab(2, 0, 1));
}
{ // ụ ra là Ember: giữ như cũ max(★, A + C), không nhận thêm từ hàng/cột · khác sao không ghép được
  R(`B.t.fill(null); var A = dat(0, 'lualien', 2, T => T.lc = 5), C = dat(1, 'lualien', 2, T => T.lc = 3), y = dat(2, 'lualien', 1, T => T.lc = 1); B.deck = ['lualien']; var ra = ghep(B, A, C);`);
  ok(R('ra.id') === 'lualien' && R('ra.lc') === 8 && R('B.t[1] === ra') && R('y.lc') === 9, 'Ember + Ember ra Ember: ụ ra = 5 + 3 = 8 (không tự nhận) · ô 2 = 1 + 5 + 3 = 9', R('[ra.lc, y.lc]'));
  R(`B.t.fill(null); var A = dat(0, 'lualien', 2, T => T.lc = 5), C = dat(1, 'lualien', 3, T => T.lc = 3), y = dat(2, 'lualien', 1, T => T.lc = 1); var r = ghep(B, A, C);`);
  ok(!R('hopLeGhep(A, C)') && R('r') === null && R('B.t[0] === A && B.t[1] === C') && R('y.lc') === 1, '2 Ember KHÁC SAO: không ghép, không truyền lửa');
  R(`B.t.fill(null); var A = dat(0, 'lualien', 2, T => T.lc = 5), C = dat(1, 'lualien', 2, T => T.lc = 3), y = dat(2, 'lualien', 1, T => T.lc = 1); SKILLS.lualien.ghep(G, B, A, C, null);`);
  ok(R('y.lc') === 1, 'kỹ năng KHI GHÉP không tự truyền (chỉ móc rời bàn truyền) — không cộng 2 lần');
}
{ // trần
  R(`B.t.fill(null); var A = dat(0, 'lualien', 2, T => T.lc = 30), C = dat(1, 'lualien', 2, T => T.lc = 20), y = dat(2, 'lualien', 1, T => T.lc = 60); B.deck = ['lien']; ghep(B, A, C);`);
  ok(R('y.lc') === 70, 'cộng vượt trần → 70', R('y.lc'));
}
{ // các đường RỜI BÀN khác (móc chung ở mức bàn)
  const lam = (dung, viec) => { R(`B.t.fill(null); B.deck = ['lualien', 'lien']; var E = dat(7, 'lualien', 3, T => T.lc = 6), h = dat(5, 'lualien', 1, T => T.lc = 1), c = dat(12, 'lualien', 1, T => T.lc = 2), k = dat(0, 'lualien', 1, T => T.lc = 1); ${dung || ''} cn();`); R(viec + '; cn();'); return R('[h.lc, c.lc, k.lc]').join(','); };
  ok(lam('', 'B.t[7] = null') === '7,8,1', 'bán / xoá Ember: hàng (ô 5) +6, cột (ô 12) +6, ô 0 không chung đường', lam('', 'B.t[7] = null'));
  ok(lam('', 'E.sao = 1; haSao(B, E)') === '7,8,1', 'bị bắn trừ sao ở 1★ → VỠ (rời bàn) → truyền');
  ok(lam('', 'haSao(B, E)') === '1,2,1' && R('B.t[7] === E && E.lc === 6 && E.sao === 2'), 'bị bắn trừ sao (3★ → 2★): ở lại, giữ 6 lửa, KHÔNG truyền', R('[E.sao, E.lc]'));
  ok(lam('', 'E.st.da = true') === '1,2,1', 'hoá đá: không truyền');
  ok(lam('', 'E.st.bang = 5') === '1,2,1', 'đóng băng: không truyền');
  ok(lam('', 'B.t[7] = giuKhiBien(sinhU(taoU(B, "lien", 3, 7)), E)') === '1,2,1', 'bị biến thành ụ khác tại chỗ (trùm / kỹ năng): không truyền');
  ok(lam('var tp = dat(14, "dichchuyen", 3);', 'ghep(B, tp, E)') === '1,2,1' && R('B.t[14] === E'), 'Teleporter đổi chỗ: không truyền');
  ok(lam('var mm = dat(2, "mimic", 3);', 'ghep(B, mm, E)') === '7,8,1', 'Mimic ghép vào Ember (Ember bị ghép mất): truyền', R('[h.lc, c.lc, k.lc]'));
  ok(lam('var mm = dat(2, "mimic", 3);', 'ghep(B, E, mm)') === '1,8,7', 'Ember kéo vào Mimic: truyền theo Ô GHÉP (ô 2 của Mimic): ô 0 (hàng) +6, ô 12 (cột) +6, ô 5 không', R('[h.lc, c.lc, k.lc]'));
  if (R('typeof SKILLS.tudo') === 'object') ok(lam('var wl = dat(2, "tudo", 3);', 'ghep(B, E, wl)') === '1,8,7', 'Ember kéo vào Wild Link: truyền theo Ô GHÉP (ô 2)', R('[h.lc, c.lc, k.lc]'));
  ok(lam('var E2 = dat(9, "lualien", 1, T => T.lc = 4);', 'B.t[7] = null; B.t[9] = null') === '11,8,1', 'bán 2 Ember cùng lúc: mỗi ụ góp 1 lần (ô 5: 1 + 6 + 4 = 11)', R('[h.lc, c.lc, k.lc]'));
  ok(lam('', 'B.t[7] = null; var moi = dat(2, "lualien", 1, T => T.lc = 1)') === '7,8,1' && R('moi.lc') === 1, 'Ember mới xuất hiện cùng lượt không nhận');
  if (R('typeof SKILLS.tudo') === 'object') ok(lam('var wl = dat(2, "tudo", 1);', 'ghep(B, wl, E)') === '7,8,1', 'Wild Link ghép vào Ember (Ember bị ghép mất): truyền', R('[h.lc, c.lc, k.lc]'));
  ok(lam('var bc = dat(14, "mauhut", 3); ghep(B, bc, E);', 'bc.mh.con = 0.001') === '7,8,1' && !R('B.t[7]'), 'Blood Circuit nuốt Ember: truyền', R('[h.lc, c.lc, k.lc]'));
  ok(lam('B.net = true;', 'B.t[7] = null') === '1,2,1', 'online: bàn con rối không tự truyền (số lửa theo cờ "r" từ máy chủ bàn)'); R('B.net = false');
}
R(`B.t.fill(null); var n0 = dat(5, 'lualien', 3);`); ok(R('n0.lc') === 3, 'Relay mới sinh: lửa = số sao');
R(`n0.lc = 50; cn();`); ok(gan(R('n0.buf.dmg'), 1.0 + R('DOTPHA.thuong(3, "lualien").dmg')) && gan(R('n0.buf.crit'), 0.06 + R('DOTPHA.thuong(3, "lualien").crit')), '50 lửa: +100% ST, +6 điểm % chí mạng (+ đột phá III)');
ok(R('SKILLS.lualien.tran(n0)') === 70 && (R('B.capThe.lualien = 2'), R('SKILLS.lualien.tran(n0)')) === 100 && (R('B.capThe.lualien = 6'), R('SKILLS.lualien.tran(n0)')) === 160, 'trần 70 (LV9) → 100 (LV11) → 160 (LV15)');
R(`B.capThe.lualien = 0; B.t.fill(null); var p = dat(0, 'lualien', 1, T => T.lc = 50), q = dat(1, 'lualien', 1, T => T.lc = 40), r2 = dat(2, 'lualien', 1, T => T.lc = 0); B.deck = ['lien']; ghep(B, p, q);`);
ok(R('r2.lc') === 70, 'tổng vượt trần → 70');
ok(R('SKILLS.lualien.icon(5)') === 'fx_cuuvi_dan' && R('SKILLS.lualien.icon(10)') === 'lua_t1' && R('SKILLS.lualien.icon(30)') === 'lua_t2' && R('SKILLS.lualien.icon(50)') === 'lua_t3' && R('SKILLS.lualien.icon(70)') === 'lua_t4', 'icon lửa: cam <10 · trắng · xanh · vàng · đỏ');
ok(JSON.stringify(R('DOTPHA.NGUONG.lualien')) === '[10,30,50,70]', 'đột phá 10/30/50/70');

console.log('Quantum Choir — Harmony (hopca)');
tran(['hopca', 'lien', 'canon', 'bang', 'tia']);
R(`var h = dat(7, 'hopca', 2); dat(2, 'lien', 2); dat(6, 'canon', 2); dat(8, 'bang', 1); dat(1, 'tia', 2); cn();`);
ok(R('SKILLS.hopca.hoa(B, h)') === 2, 'đếm 2 ụ KỀ cùng sao (chéo / khác sao không tính)');
ok(gan(R('h.buf.dmg'), 0.5) && gan(R('h.buf.cdmg'), 0.16) && gan(R('h.buf.toc'), 0), '2 Harmony: +50% ST, +16% ST chí mạng');
R(`dat(12, 'set', 2, T => T.st.bang = 99); cn();`); ok(R('SKILLS.hopca.hoa(B, h)') === 3 && gan(R('h.buf.toc'), 0.3), 'ụ băng vẫn tính · 3 Harmony: +30% tốc');
R(`B.t[8] = null; dat(8, 'lien', 2, T => T.st.da = true); cn();`); ok(R('SKILLS.hopca.hoa(B, h)') === 3, 'ô đá không tính');
R(`B.t[8] = null; dat(8, 'lien', 2); cn();`); ok(R('SKILLS.hopca.hoa(B, h)') === 4 && gan(R('h.buf.cdmg'), 0.32 + 0.5), '4 Harmony: +50% ST chí mạng thêm');
R(`B.t.fill(null); var h7 = dat(7, 'hopca', 7); cn();`); ok(gan(R('h7.buf.toc') - R('(function(){ const b = h7.buf.toc; h7.buf.toc = 0; mocBuf(B); const m = h7.buf.toc; h7.buf.toc = b; return m; })()'), 0.25), '7★: +25% tốc (ngoài mốc sao chung)');
ok(R("typeof JP === 'undefined'") && !R('DOTPHA.NGUONG.hopca'), 'bỏ GRAND CHORUS (khung jackpot cũ đã bỏ 08/11) và đột phá cũ');

console.log('Fusion Archive (luutru)');
tran(['luutru', 'lien', 'canon', 'vughep', 'saochep']);
R(`var A1 = dat(10, 'luutru', 1), A2 = dat(11, 'luutru', 1), A3 = dat(12, 'luutru', 1); B.deck = ['lien'];`);
for (let i = 0; i < 10; i++) R(`dat(0, 'lien', 1); dat(1, 'lien', 1); ghep(B, B.t[0], B.t[1]); B.t[1] = null; B.t[0] = null;`);
ok(R('A1.kho + A2.kho + A3.kho') === 10, 'B5-1: 3 Archive, 10 lần ghép thật → TỔNG 10 điểm (không phải 30) (' + R('[A1.kho, A2.kho, A3.kho].join("/")') + ')');
R(`var tong0 = A1.kho + A2.kho + A3.kho; dat(0, 'vughep', 2); dat(1, 'lien', 2); ghep(B, B.t[0], B.t[1]);`);
ok(R('A1.kho + A2.kho + A3.kho') === R('tong0'), 'Vua Ghép tăng sao: không tính');
R(`B.t[0] = null; B.t[1] = null; dat(0, 'saochep', 1); dat(1, 'canon', 1); ghep(B, B.t[0], B.t[1]);`);
ok(R('A1.kho + A2.kho + A3.kho') === R('tong0'), 'Copycat: không tính');
R(`B.t.fill(null); var A = dat(10, 'luutru', 1); A.kho = 39; B.deck = ['lien']; dat(0, 'lien', 1); dat(1, 'lien', 1); ghep(B, B.t[0], B.t[1]); dat(3, 'lien', 1); dat(4, 'lien', 1); ghep(B, B.t[3], B.t[4]); cn();`);
ok(R('A.kho') === 40, 'trần 40 ở LV9');
const t40 = R('SKILLS.luutru.thuong(40)'); ok(gan(t40.dmg, 0.65) && gan(t40.toc, 0.15) && gan(t40.crit, 0.08) && gan(t40.cdmg, 0.40), '40 điểm: +40% +25% ST, +15% tốc, +8% chí mạng, +40% ST chí mạng');
ok(gan(R('SKILLS.luutru.thuong(70)').dmg, 0.70 + 0.25 + 0.2 + 0.3 + 0.4), 'mốc 50/60/70 thêm +20/30/40% ST');
R(`B.capThe.luutru = 6;`); ok(R('SKILLS.luutru.tran(A)') === 70, 'trần 70 ở LV15');
R(`B.t.fill(null); var X1 = dat(10, 'luutru', 2); dat(11, 'luutru', 2); B.deck = ['lien']; var rr = ghep(B, B.t[11], B.t[10]);`);
ok(R('G.hu.every(o => o.k !== "vm1Xung")'), 'bỏ 3 xung Archive + Archive');
R(`B.t.fill(null); var Y = dat(10, 'luutru', 1); dat(0, 'loren', 3, T => { T.dang = 'dmg'; T.lo = 3; }); dat(1, 'loren', 3, T => { T.dang = 'dmg'; T.lo = 5; }); var k0 = Y.kho; ghep(B, B.t[0], B.t[1]);`);
ok(R('Y.kho') === R('k0') + 1, 'Twin Anvil + Twin Anvil (thành công hay hỏng) = 1 lần ghép thật');

console.log('Twin Anvil (loren)');
ok(gan(R('SKILLS.loren.tiLe(8, 0)'), 50) && gan(R('SKILLS.loren.tiLe(8, 8)'), 82) && gan(R('SKILLS.loren.tiLe(14, 0)'), 7.14) && gan(R('SKILLS.loren.tiLe(14, 8)'), 39.14) && gan(R('SKILLS.loren.tiLe(5, 8)'), R('SKILLS.loren.tiLe(5, 0)')), 'B5-3: tỉ lệ 8 cộng dồn 50% → 82% (LV17), 14 → 7.14% → 39.14%; tổng < 8 không cộng cấp');
tran(['loren', 'lien', 'canon', 'bang', 'tia'], { loren: 8 });
R(`var d1 = dat(0, 'loren', 1, T => { T.dang = 'dmg'; T.lo = 14; }), L = dat(5, 'lien', 2); ghep(B, d1, L); cn();`);
ok(gan(R('L.anv.v'), 0.5208) && gan(R('L.buf.dmg'), 0.5208, 1e-4) && !R('B.t[0]'), 'B5-4: LV17 14 cộng dồn rèn ST → +52.08% ST, Anvil mất');
R(`var d2 = dat(1, 'loren', 1, T => { T.dang = 'toc'; T.lo = 14; }); ghep(B, d2, L); cn();`);
ok(R('L.anv.k') === 'toc' && gan(R('L.anv.v'), 0.3472) && gan(R('L.buf.dmg'), 0, 1e-9), 'LV17 rèn tốc 14 → +34.72% tốc; chỉ 1 loại buff / ụ (thay buff ST)');
R(`L.st.da = true; cn();`); ok(gan(R('L.buf.toc'), 0, 1e-9), 'ụ hoá đá: buff tắt'); R('L.st.da = false');
R(`B.t.fill(null); B.capThe = {}; var p1 = dat(5, 'lien', 2, T => T.anv = { k: 'dmg', v: 0.42 }), p2 = dat(6, 'lien', 2, T => T.anv = { k: 'dmg', v: 0.27 }); B.deck = ['canon']; var con = ghep(B, p1, p2);`);
ok(R('con && con.anv && con.anv.v') === 0.42, 'B5-4: 2 ụ có buff ghép → ụ con lấy +42% (không cộng 69%)');
R(`B.t.fill(null); var e1 = dat(0, 'loren', 2, T => { T.dang = 'dmg'; }), e2 = dat(1, 'loren', 2, T => { T.dang = 'toc'; });`);
ok(!R('hopLeGhep(e1, e2)'), 'khác dạng: không ghép được');
R(`e2.dang = 'dmg'; e1.lo = 13; e2.lo = 2; e2.sao = 5; G.hat = 1;`); ok(R('hopLeGhep(e1, e2)'), 'cùng dạng, khác sao: ghép được');
let tc = 0, tb = 0;
for (let i = 0; i < 40; i++) { R(`G.hat = ${i + 1}; B._anR = 0; B.t.fill(null); var f1 = dat(0, 'loren', 3, T => { T.dang = 'dmg'; T.lo = 13; }), f2 = dat(1, 'loren', 5, T => { T.dang = 'dmg'; T.lo = 2; }); ghep(B, f1, f2);`);
  const okR = R('B._anOk'); if (okR) { if (R('f2.lo === 14 && f2.sao === 5 && !B.t[0]')) tc++; } else if (R('f2.lo === 13 && f2.sao === 5 && !B.t[0]')) tb++; }
ok(tc + tb === 40 && tb > tc, 'B5-3: 13 + 2 → hỏng giữ 13 ở sao cũ, mất ụ kéo; thành công 14 ở sao max (' + tc + ' thành công / ' + tb + ' hỏng)');
R(`G.hat = 77; B.t.fill(null); B._anN = 0; var g1 = dat(3, 'loren', 1); B._anN = 0; var g2 = dat(3, 'loren', 1);`); ok(R('g1.dang === g2.dang'), 'dạng quay bằng hạt giống (tất định)');

console.log('Prism Thief (bienmau) — HỢP THỂ (kiểm đủ: tools/thap-kt-prism.js)');
tran(['bienmau', 'lien', 'canon', 'bang', 'tia']);
R(`var PP = [[0, 0], [1, 1], [6, 2], [7, 3]].map(([o, q]) => dat(o, 'bienmau', 2, T => { T.pm = q; T.pms = 2; }));`);
ok(R('SKILLS.bienmau.tran(PP[0])') === 10 && (R('B.capThe.bienmau = 8'), R('SKILLS.bienmau.tran(PP[0])')) === 18, 'trần cộng dồn Prism đơn 10 (LV9) → 18 (LV17)'); R('B.capThe.bienmau = 0');
ok(R('SKILLS.bienmau.kiemMach(B, [0, 6, 1, 7]).loi') === 'path', 'đường có bước chéo (0 → 6): không hợp lệ');
ok(R('SKILLS.bienmau.mach(B, [0, 1, 6, 7])') === true && R('B.t[7].pf') === 1 && R('JSON.stringify(B.t[7].pmk)') === '[2,2,2,2]' && R('!B.t[0] && !B.t[1] && !B.t[6]'), 'vuốt 4 màu → 1 mặt nạ 4 màu ở ô cuối, cộng dồn cộng hết');
R(`G.quai.length = 0; B.t.fill(null); var V = dat(7, 'bienmau', 1, T => { T.pm = 1; T.pms = 0; }); B.mana = 0;`);
R(`for (let i = 0; i < 30; i++) { if (B.pmMt == null || G.t - B.pmMt >= 1) { B.pmMt = G.t; B.pmMv = 0; } if ((B.pmMv || 0) + 2 <= SKILLS.bienmau.manaTran(B)) { B.pmMv += 2; B.mana += 2; } }`);
ok(R('B.mana') === 6, 'trần mana Prism vàng: 6 mana / giây cả bàn (không có mặt nạ)');

console.log('Blood Circuit (mauhut)');
tran(['mauhut', 'lien', 'tienhoa', 'loren', 'dongbo']);
R(`var M = dat(7, 'mauhut', 2), T4 = dat(8, 'lien', 4);`);
ok(R('hopLeGhep(M, T4)') && !R(`hopLeGhep(M, dat(2, 'lien', 7))`) && !R(`hopLeGhep(M, dat(3, 'tienhoa', 2))`) && !R(`hopLeGhep(M, dat(4, 'loren', 2))`) && !R(`hopLeGhep(M, dat(9, 'dongbo', 2))`), 'không nuốt 7★ / Trứng / Twin Anvil / Hỗ trợ');
R('B.t[2] = null; B.t[3] = null; B.t[4] = null; B.t[9] = null;'); R(`ghep(B, M, T4);`); ok(gan(R('M.mh.con'), 17), 'B5-7: đánh dấu 4★ → 17 s, cả 2 vẫn trên bàn'); ok(R('B.t[8] === T4 && B.t[7] === M'), 'đánh dấu không di chuyển ụ');
R(`M.mh.con = 10; T4.sao = 5; cn();`); ok(gan(R('M.mh.con'), 13 - 1 / 30, 1e-3), 'mục tiêu +1★ → +3 s');
R(`M.mh.con = 0.01; cn();`); ok(!R('B.t[8]') && R('M.mau') === 25, 'nuốt 5★ → +25 Máu, ô trống');
R(`B.t[2] = null; dat(6, 'lien', 2); var r = SKILLS.mauhut.chuDong(G, B, M); cn();`);
ok(R('r') && R('M.mau') === 15 && gan(R('B.t[6].buf.dmg'), 0.30) && gan(R('B.t[6].buf.toc'), 0.15), 'Blood Rite: tiêu 10 Máu → ụ Tấn công kề +30% ST +15% tốc');
R(`SKILLS.mauhut.chuDong(G, B, M);`); ok(R('M.mau') === 5, 'Rite lần 2 (B5-7: 25 Máu → 2 Rite, còn 5)');
R(`G.t += 21; cn();`); ok(gan(R('B.t[6].buf.dmg'), 0, 1e-9), 'Rite hết sau 20 s');
R(`var Z = dat(12, 'canon', 2); ghep(B, M, Z); B.t[12] = null; dat(12, 'lien', 2); cn();`); ok(!R('M.mh'), 'mục tiêu biến mất / đổi loại → huỷ dấu, không thưởng');

console.log('Salvo Battery (railgun)');
tran(['railgun', 'lien', 'canon', 'bang', 'tia']);
R(`var s0 = dat(5, 'railgun', 2); dat(6, 'railgun', 2); dat(7, 'railgun', 2); cn();`);
ok(gan(R('s0.buf.dmg'), 0.25), 'hàng 3/5: +25% ST');
R(`dat(8, 'railgun', 2); cn();`); ok(gan(R('s0.buf.dmg'), 0.65), 'hàng 4/5: +65%');
R(`dat(9, 'railgun', 2); cn();`); ok(gan(R('s0.buf.dmg'), 2.0), 'hàng 5/5: +200%');
R(`B.t[9].st.da = true; cn();`); ok(gan(R('s0.buf.dmg'), 0.65), 'B5-15: 1 ô đá → 4/5 = +65%');
R(`B.t[9].st.da = false; B.t[9].st.bang = 9; cn();`); ok(gan(R('s0.buf.dmg'), 2.0), 'ụ băng vẫn tính');
R(`dat(0, 'railgun', 2); cn();`); ok(gan(R('s0.buf.toc'), 0.35), 'cột 2/3: +35% tốc');
R(`dat(10, 'railgun', 2); cn();`); ok(gan(R('s0.buf.toc'), 1.5), 'cột 3/3: +150% tốc');
ok(R("TEXT.turret.railgun.name") === 'Salvo Battery', 'đổi tên Salvo Battery');

console.log('Trứng Evolver (tienhoa)');
tran(['tienhoa', 'lien', 'canon', 'bang', 'tia']);
ok(R(`(function(){ const T = dat(0, 'tienhoa', 1); return SKILLS.tienhoa.can(T); })()`) === 12 && R(`SKILLS.tienhoa.can(dat(1, 'tienhoa', 5))`) === 20 && R(`SKILLS.tienhoa.can(dat(2, 'tienhoa', 6))`) === 22, 'nở 1★ 12 s · 5★ 20 s · 6★ cháy sau 22 s');
R('B.capThe.tienhoa = 8'); ok(gan(R(`SKILLS.tienhoa.can(B.t[2])`), 17.74, 0.01), 'B5/A0: LV17 6★ = 17.74 s'); R('B.capThe.tienhoa = 0');
R(`B.t.fill(null); B.deck = ['lien']; var e = dat(3, 'tienhoa', 2);`); buoc(14.2);
ok(R('B.t[3] && B.t[3].id === "lien" && B.t[3].sao === 3'), '2★ sau 14 s → ụ ngẫu nhiên 3★');
R(`B.t.fill(null); var e6 = dat(4, 'tienhoa', 6);`); buoc(22.2);
ok(R('e6.sao === 7 && SKILLS.tienhoa.chay(e6) && B.t[4] === e6'), 'B5-14: 6★ → trứng cháy 7★ (không nở)');
R('e6.sao = 6;'); buoc(0.1); ok(R('SKILLS.tienhoa.chay(e6)'), 'trứng cháy hạ sao vẫn cháy');
R(`B.mana = 0; var rc = SKILLS.tienhoa.chuDong(G, B, e6);`); ok(R('rc') && R('B.mana') === 20 && !R('B.t[4]'), 'chạm trứng cháy: +20 mana, ô trống');
R(`var e7 = dat(5, 'tienhoa', 3); e7.st.bang = 2; var g0 = e7.egg || 0;`); buoc(1); ok(gan(R('e7.egg || 0'), R('g0')), 'đang băng: đồng hồ dừng');

console.log('Hero Foundry (xuonganh)');
tran(['xuonganh', 'lien', 'canon', 'bang', 'tia'], { xuonganh: 8 });
R(`dat(3, 'xuonganh', 1); dat(8, 'xuonganh', 1); B.deck = ['lien']; ghep(B, B.t[3], B.t[8]); cn();`);
ok(R('B.hero.length === 1 && B.hero[0].o === 8') && gan(R('B.hero[0].het - G.t'), 25), 'ô ANH HÙNG = ô ghép, 25 s, 1 ô / bàn');
ok(gan(R('B.t[8].buf.toc'), 0.992, 1e-3) && gan(R('B.t[8].buf.cdmg'), 0.372, 1e-3), 'LV17: +99.2% tốc, +37.2% ST chí mạng');

console.log('Chữ kỹ năng (mo) không lỗi + tiếng Anh đơn giản');
tran(['lualien', 'hopca', 'luutru', 'loren', 'bienmau']);
for (const id of ['lualien', 'hopca', 'luutru', 'loren', 'bienmau', 'mauhut', 'railgun', 'tienhoa', 'xuonganh']) {
  let s = ''; try { s = R(`SKILLS.${id}.mo(dat(7, '${id}', 3))`); } catch (e) { s = 'LỖI ' + e.message; }
  ok(s && !/LỖI|undefined|NaN/.test(s), id + ': ' + s.slice(0, 90) + '…');
}

if (process.env.PW) require('./thap-kt-vang-g2-pw.js')().then((n) => { loi += n; console.log(loi ? '✗ ' + loi + ' lỗi' : '✓ đạt hết'); process.exit(loi ? 1 : 0); });
else { console.log(loi ? '✗ ' + loi + ' lỗi' : '✓ đạt hết'); process.exit(loi ? 1 : 0); }
