// TURRET MERGE — KIỂM Ụ GHÉP TỰ DO "WILD LINK" (tudo, VÀNG Đặc biệt — thap/js/game.js tdW / laTuDo / saoGhep / ghep)
//   Luật (người dùng 08/11): ghép với BẤT KỲ ụ (mọi loại, mọi sao, cả ĐÁ / BĂNG, cả Pháo La Bàn / Prism Thief (cả mặt nạ) / Lucky Slot)
//   → 1 ụ NGẪU NHIÊN trong bộ bài (RNG hạt giống), sao = ⌈(sao 2 ụ)/2⌉, không +1★ (cấp thẻ: xác suất +1★) · GHÉP THẬT (bộ đếm, Archive,
//   kỹ năng khi ghép 1 lần — Twin Maker gọi thêm ụ ở sao trung bình) · Wild Link bị khoá thì không dùng được · tất định · gói online khứ hồi · AI.
//   Phần 1: luật thuần (vm). Phần 2 (Playwright, có thì chạy): kéo thật + xem trước sao + ảnh 390×844 & 844×390.
// Chạy: node tools/thap-kt-ghep-tu-do.js   (phần 2: python3 -m http.server 8784 ở gốc repo; BASE=… đổi; KHONG_PW=1 bỏ phần 2; SHOTS=thư mục ảnh, mặc định tests/ghep-tu-do/shots)
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const goc = path.join(__dirname, '..', 'thap');
const FILES = ['meta', 'text', 'data', 'thebai', 'fx', 'tiervfx', 'game', 'chihuy', 'skills', 'skills2', 'phattrien', 'artscale', 'skills3', 'skills4', 'skills5', 'vangmoi1', 'hotro', 'support', 'buff', 'skills7', 'jackpot', 'growfx', 'trum', 'online/dongbo'];
let loi = 0; const ok = (dk, ten, chi) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (dk || chi == null ? '' : ' — ' + chi)); if (!dk) loi++; };
function moiTruong() {
  const noop = () => {};
  const ctx = { console, Math, JSON, Set, Map, WeakMap, WeakSet, Promise, Object, Array, Error, setTimeout: (f) => { ctx._cho.push(f); }, clearTimeout: noop, setInterval: noop, clearInterval: noop, _cho: [], performance: { now: () => 0 }, localStorage: { getItem: () => null, setItem: noop, removeItem: noop } };
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
const BONUS = (b, m) => R(`KY_NANG_CAP.tudo.base = ${b}; KY_NANG_CAP.tudo.max = ${m};`);
BONUS(0, 0); // tắt xác suất +1★ (trừ mục 5) → sao kết quả = đúng ⌈trung bình⌉
const buoc = (t) => { for (let x = 0; x < t; x += 1 / 30) { R('capNhat(1/30)'); if (ctx._cho.length) ctx._cho.splice(0).forEach(f => { try { f(); } catch (e) { } }); } };
const tran = (deck, hat, che) => { ctx._d = deck; R(`G.debug = { seed: ${hat || 777} }; batDau('${che || 'solo'}', _d, 'hero'); G.cho = 1e9; G.quai.length = 0; G.dan.length = 0; for (const X of G.ban) { X.t.fill(null); X.mana = 0; X.ai = false; } var B = G.ban[0];
  var dat = (o, id, s, b) => { const X = b || B, T = sinhU(taoU(X, id, s, o)); X.t[o] = T; return T; };`); };
const DECK = ['tudo', 'lien', 'tia', 'set', 'sinhdoi'];

console.log('1 · có ụ: roster Tím Đặc biệt, họ JOKER, cấp thẻ, chữ thẻ');
tran(DECK);
ok(R("!!SKILLS.tudo && G.rosterMap.tudo.bac === 'vang' && HO_CUA.tudo.i === 3 && THE.maxLv('vang') === 17 && SKILLS.tudo.vai === 'db' && HO_CUA.tudo && HO_CUA.tudo.ho === 'joker'"), 'SKILLS.tudo + roster VÀNG Đặc biệt + họ JOKER (bậc Vàng, LV17)');
BONUS(10, 30); ok(R("KY_NANG_CAP.tudo.base === 10 && KY_NANG_CAP.tudo.buoc === 2.5 && knGt(KY_NANG_CAP.tudo, 8) === 30 && knGt(KY_NANG_CAP.tudo, 9) === 30"), 'cấp thẻ: +1★ 10% → 30% (8 cấp Vàng LV9→17)'); BONUS(0, 0);
ok(R("/ANY turret/.test(SKILLS.tudo.mo(dat(0, 'tudo', 1))) && /real merge/.test(SKILLS.tudo.mo(B.t[0])) && /Stone and Frozen/.test(SKILLS.tudo.mo(B.t[0]))"), 'mo(): ANY turret · real merge · Stone and Frozen');
ok(R("SKILLS.tudo.dmg > 0 && typeof SKILLS.tudo.ban === 'function'"), 'bắn nhẹ như Mimic / Twin Maker (Đặc biệt nhóm ghép có bắn)');

console.log('2 · ghép mọi loại, mọi sao — sao = ⌈trung bình⌉, ra ụ trong bộ bài');
const CAP = [[1, 1, 1], [1, 2, 2], [2, 1, 2], [3, 4, 4], [2, 6, 4], [1, 7, 4], [7, 7, 7], [6, 7, 7], [5, 2, 4]];
for (const [sa, sb, kq] of CAP) {
  tran(DECK);
  R(`var Wl = dat(7, 'tudo', ${sa}), X = dat(8, 'tia', ${sb}), h = hopLeGhep(Wl, X), r = ghep(B, Wl, X);`);
  ok(R(`h && r && B.t[8] === r && !B.t[7] && r.sao === ${kq} && saoGhep(dat(1, 'tudo', ${sa}), dat(2, 'lien', ${sb})) === ${kq} && _d.includes(r.id)`), `${sa}★ Wild + ${sb}★ Sniper → ${kq}★ ụ ngẫu nhiên trong bộ`, R('JSON.stringify([h, r && r.id, r && r.sao])'));
}
tran(DECK); R('var X = dat(3, "lien", 5), Wl = dat(4, "tudo", 2), h = hopLeGhep(X, Wl), C3 = dat(5, "saochep", 3), Wc = dat(6, "tudo", 2), hc = hopLeGhep(C3, Wc);');
ok(R('!h && !hc'), 'MỘT CHIỀU (08/11): kéo ụ thường / Copycat 3★ lên Wild Link 2★ KHÔNG ghép', R('JSON.stringify([h, hc])'));
tran(DECK); R('var a = dat(0, "tudo", 3), b = dat(1, "tudo", 5);');
ok(R('hopLeGhep(a, b) && ghep(B, a, b).sao >= 4'), 'Wild + Wild khác sao ghép được (3★ + 5★ → 4★)');

console.log('3 · đá / băng / ụ luật riêng → ụ ngẫu nhiên thường (hết khoá, mất stack)');
tran(DECK);
R('var Wl = dat(0, "tudo", 2), S = dat(1, "tia", 4); S.st.da = true; var W2 = dat(2, "tudo", 3), F = dat(3, "lien", 3); F.st.bang = 5;');
ok(R('hopLeGhep(Wl, S) && hopLeGhep(W2, F)'), 'Wild Link lên ô ĐÁ / BĂNG: ghép được');
R('var r1 = ghep(B, Wl, S), r2 = ghep(B, W2, F);');
ok(R('r1 && !r1.st.da && !(r1.st.bang > 0) && r1.sao === 3 && r2 && !r2.st.da && !(r2.st.bang > 0) && r2.sao === 3'), 'kết quả là ụ thường (không đá, không băng)', R('JSON.stringify([r1 && r1.st, r2 && r2.st])'));
tran(DECK); R('var S2 = dat(0, "tia", 2); S2.st.da = true; var W3 = dat(1, "tudo", 2);');
ok(R('!hopLeGhep(S2, W3)'), 'ụ KÉO bị khoá (đá) không dùng Wild Link (luật nguồn khoá)');
R('var Wd = dat(2, "tudo", 2); Wd.st.da = true; var Sd = dat(3, "tia", 2); Sd.st.da = true; var X5 = dat(4, "lien", 1);');
ok(R('!hopLeGhep(X5, Wd) && !hopLeGhep(Wd, X5) && hopLeGhep(Wd, Sd)'), 'Wild Link ĐÁ: không ghép tự do; đá + đá cùng sao vẫn theo luật đá');
R('var rd = ghep(B, Wd, Sd);'); ok(R('rd && rd.st.da && rd.sao === 3'), 'Wild Link đá + đá 2★ → đá 3★ (luật đá cũ)');
R('var Wf = dat(5, "tudo", 2); Wf.st.bang = 5; var Xf = dat(6, "lien", 2);'); ok(R('!hopLeGhep(Xf, Wf) && !hopLeGhep(Wf, Xf)'), 'Wild Link BĂNG: không ghép');

tran(['tudo', 'canon', 'bienmau', 'cobac', 'lien']);
R('var Cn = dat(0, "canon", 4); Cn.hb = 15; Cn.cmC = 3; var Wl = dat(1, "tudo", 4); var Pm = dat(2, "bienmau", 5); Pm.pf = 2; Pm.pm = 1; var W2 = dat(3, "tudo", 3); var Ls = dat(4, "cobac", 2); var W3 = dat(5, "tudo", 2);');
ok(R('hopLeGhep(Wl, Cn) && !hopLeGhep(Cn, Wl) && hopLeGhep(W2, Pm) && !hopLeGhep(Pm, W2) && hopLeGhep(W3, Ls)'), 'Wild Link kéo lên La Bàn / mặt nạ Prism / Lucky Slot: ghép được (chiều ngược: không)');
R('var n0 = (G.cbLog || []).length, rc = ghep(B, Wl, Cn), rp = ghep(B, W2, Pm), rl = ghep(B, W3, Ls);'); buoc(0.1);
ok(R('rc && B.t[0] === rc && !B.t[1] && rc.sao === 4 && !(rc.id === "canon" && (rc.cmC | 0) > 0)'), 'La Bàn NSWE+3 stack + Wild → ụ ngẫu nhiên 4★, không mang stack', R('JSON.stringify([rc && rc.id, rc && rc.hb, rc && rc.cmC])'));
ok(R('rp && B.t[2] === rp && rp.sao === 4 && !(rp.id === "bienmau" && rp.pf > 0)'), 'mặt nạ Prism + Wild → ụ ngẫu nhiên 4★, không mang hợp thể', R('JSON.stringify([rp && rp.id, rp && rp.pf])'));
ok(R('rl && B.t[4] === rl && rl.sao === 2'), 'Lucky Slot + Wild → ụ ngẫu nhiên 2★');
// dạng ngẫu nhiên lúc sinh quay lại: ép kết quả là Pháo La Bàn / Prism / Lucky Slot
tran(['tudo', 'canon', 'bienmau', 'cobac', 'lien']);
const ra = []; for (let i = 0; i < 30; i++) { R(`B.t.fill(null); var a = dat(0, "tudo", 3), b = dat(1, "lien", 3); var r = ghep(B, a, b); capNhat(1/30);`); ra.push(R('r.id + ":" + (r.id === "canon" ? r.hb : r.id === "bienmau" ? r.pm + "/" + (r.pf | 0) : r.id === "cobac" ? (r.cbS | 0) : "")')); }
const coCanon = ra.filter(s => /^canon:/.test(s)), coPm = ra.filter(s => /^bienmau:/.test(s)), coCb = ra.filter(s => /^cobac:/.test(s));
ok(coCanon.every(s => [1, 2, 4, 8].includes(+s.split(':')[1])) && coPm.every(s => /\/0$/.test(s)) && coCb.every(s => +s.split(':')[1] > 0) && coCanon.length + coPm.length + coCb.length > 0, 'ụ ra quay dạng lúc sinh: La Bàn 1 hướng, Prism đơn 0 hợp thể, Lucky Slot quay xèng', JSON.stringify(ra));

console.log('4 · GHÉP THẬT: bộ đếm, Archive, kỹ năng khi ghép (1 lần), Twin Maker');
tran(DECK);
R('var ng = B.ghepN | 0, Wl = dat(7, "tudo", 3), T = dat(8, "sinhdoi", 4), th = laGhepThat(Wl, T); var nTw = 0, _sd = sinhDoi; sinhDoi = function (BB, s) { nTw++; G._swS = s; return _sd.apply(this, arguments); }; var r = ghep(B, Wl, T); sinhDoi = _sd;');
ok(R('th && (B.ghepN | 0) === ng + 1'), 'laGhepThat = true, bộ đếm ghép +1', R('JSON.stringify([th, B.ghepN, ng])'));
ok(R('nTw === 1 && G._swS === 4 && B.t.filter(X => X && X !== r).length === 1 && B.t.find(X => X && X !== r).sao >= 4'), 'Twin Maker 4★ + Wild 3★: kỹ năng chạy ĐÚNG 1 lần, gọi thêm ụ 4★ (⌈3,5⌉; 10%+: 5★)', R('JSON.stringify([nTw, G._swS, B.t.filter(Boolean).map(X => X.id + X.sao)])'));
tran(DECK); R('var Wl = dat(7, "tudo", 2), T = dat(8, "sinhdoi", 2), n = 0, _g = SKILLS.sinhdoi.ghep; SKILLS.sinhdoi.ghep = function () { n++; return _g.apply(this, arguments); }; var hT = hopLeGhep(T, Wl); SKILLS.sinhdoi.ghep = _g;');
ok(R('!hT'), 'kéo Twin Maker lên Wild Link: KHÔNG ghép (một chiều)');
tran(['tudo', 'nhanmana', 'lien', 'tia', 'set']); R('var Wl = dat(0, "tudo", 1), M = dat(1, "nhanmana", 3), m0 = B.mana; ghep(B, Wl, M);');
ok(R('B.mana - m0 === SKILLS.nhanmana.luong(2, B)'), 'Mana Doubler 3★ + Wild 1★: mana như ghép 2★ (sao trung bình)', R('JSON.stringify([B.mana - m0, SKILLS.nhanmana.luong(2, B)])'));
tran(['tudo', 'luutru', 'lien', 'tia', 'set']); R('var A = dat(14, "luutru", 2); A.st.da = false; var ar0 = JSON.stringify([A.luu, A.ld, A.n]); var Wl = dat(0, "tudo", 1), X = dat(1, "lien", 5); ghep(B, Wl, X);');
ok(R('JSON.stringify([A.luu, A.ld, A.n]) !== ar0 || (B.ghepN | 0) === 1'), 'Fusion Archive / bộ đếm nhận ghép Wild Link');
tran(DECK); R('var K = dat(0, "vughep", 3), Wl = dat(1, "tudo", 3), th = laGhepThat(K, Wl), rk = ghep(B, K, Wl);');
ok(R('!th && rk === Wl && Wl.id === "tudo" && Wl.sao === 4'), 'Merge King lên Wild Link: +★ tại chỗ, KHÔNG phải ghép');

console.log('5 · cấp thẻ: xác suất +1★ (tất định)');
BONUS(10, 28); tran(DECK); let up = 0; const N = 400;
for (let i = 0; i < N; i++) { R('B.t.fill(null); var a = dat(0, "tudo", 2), b = dat(1, "lien", 4), r = ghep(B, a, b);'); if (R('r.sao') === 4) up++; }
ok(up > N * 0.04 && up < N * 0.18, 'cấp đầu ~10% kết quả +1★ (3★ → 4★)', up + '/' + N);
R('B.capThe = { tudo: 9 };'); up = 0;
for (let i = 0; i < N; i++) { R('B.t.fill(null); var a = dat(0, "tudo", 2), b = dat(1, "lien", 4), r = ghep(B, a, b);'); if (R('r.sao') === 4) up++; }
ok(up > N * 0.2 && up < N * 0.37, 'cấp thẻ max ~28%', up + '/' + N);
R('B.capThe = {};'); BONUS(0, 0);

console.log('6 · tất định (cùng hạt → cùng kết quả)');
const chay = (hat) => { tran(DECK, hat); const o = []; for (let i = 0; i < 12; i++) { R(`B.t.fill(null); var a = dat(${i % 15}, "tudo", ${1 + i % 4}), b = dat(${(i + 5) % 15}, "set", ${1 + (i * 3) % 7}), r = ghep(B, a, b);`); o.push(R('r.id + r.sao')); } return o.join(','); };
const k1 = chay(4242), k2 = chay(4242), k3 = chay(999);
ok(k1 === k2, 'cùng hạt 4242 → cùng chuỗi', k1 + ' | ' + k2);
ok(k1 !== k3, 'hạt khác → chuỗi khác');

console.log('7 · online: gói gh khứ hồi (bàn con rối ra đúng loại + sao + ụ sinh đôi)');
tran(DECK, 31337, 'coop');
R(`var B0 = G.ban[0], B1 = G.ban[1]; B0.net = false; B1.net = true; ONS.on = true; ONS.seed = 31337; var _gui = []; ONS.gui = (k, v) => _gui.push([k, JSON.parse(JSON.stringify(v))]); ONS._apDung = 0;
  if (!ONS._boc) { ONS.boc(); ONS._boc = 1; }
  for (const [o, id, s] of [[3, 'tudo', 2], [4, 'sinhdoi', 5], [9, 'lien', 1]]) { dat(o, id, s, B0); dat(o, id, s, B1); }
  var r0 = ghep(B0, B0.t[3], B0.t[4]);`);
ok(R('_gui.some(g => g[0] === "gh")'), 'máy chủ bàn gửi gói gh', R('JSON.stringify(_gui.map(g => g[0]))'));
R('var goi = _gui.find(g => g[0] === "gh")[1]; ONS.apGhep(B1, goi);');
ok(R('B1.t[4] && B1.t[4].id === r0.id && B1.t[4].sao === r0.sao && !B1.t[3] === !B0.t[3]'), 'bàn con rối: ô ghép đúng loại + sao', R('JSON.stringify([goi, B1.t[4] && B1.t[4].id + B1.t[4].sao, r0.id + r0.sao])'));
ok(R('B0.t.map(X => X ? X.id + X.sao : "-").join() === B1.t.map(X => X ? X.id + X.sao : "-").join()'), 'cả bàn khớp (gồm ụ Twin Maker gọi thêm)', R('B0.t.map(X => X ? X.id + X.sao : "-").join() + " | " + B1.t.map(X => X ? X.id + X.sao : "-").join()'));
R('ONS.on = false;');

console.log('8 · AI dùng hợp lý (lệch ≤ 1★, ưu tiên ụ có kỹ năng khi ghép)');
tran(DECK); R(`B.ai = true; B.mana = 0; B.gia = 1e9; for (let o = 0; o < 13; o++) dat(o, ['lien', 'tia', 'set'][o % 3], 6 - (o % 3) * 0); var Wl = dat(13, 'tudo', 3), T = dat(14, 'sinhdoi', 4); B.t[0].sao = 6; B.aiT = 0; var nTw = 0, _g = SKILLS.sinhdoi.ghep; SKILLS.sinhdoi.ghep = function () { nTw++; return _g.apply(this, arguments); }; aiBan(B, 1); SKILLS.sinhdoi.ghep = _g;`);
ok(R('nTw === 1 && B.t[14] && B.t[14] !== T'), 'AI ghép Wild Link 3★ vào Twin Maker 4★ (lệch 1★, có kỹ năng khi ghép)', R('JSON.stringify([nTw, B.t.map(X => X ? X.id + X.sao : "-")])'));
tran(DECK); R(`B.ai = true; B.mana = 0; B.gia = 1e9; for (let o = 0; o < 13; o++) dat(o, ['lien', 'tia', 'set'][o % 3], 6 + (o % 2)); var Wl = dat(13, 'tudo', 1); B.aiT = 0; aiBan(B, 1);`);
ok(R('B.t[13] && B.t[13].id === "tudo"'), 'AI KHÔNG ghép Wild Link 1★ vào ụ 6–7★ (mất sao)', R('JSON.stringify(B.t.map(X => X ? X.id + X.sao : "-"))'));

// ===================================================== Phần 2: Playwright =====================================================
if (process.env.KHONG_PW === '1') process.exit(loi ? 1 : 0);
let pw; try { pw = require('playwright'); } catch (e) { console.log('SKIP phần 2 (không có playwright)'); process.exit(loi ? 1 : 0); }
const BASE = process.env.BASE || 'http://localhost:8784/thap/';
const SHOTS = process.env.SHOTS || path.join(__dirname, '..', 'tests', 'ghep-tu-do', 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
(async () => {
  const br = await pw.chromium.launch();
  try {
    for (const [w, h] of [[390, 844], [844, 390]]) {
      const p = await br.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
      const err = []; p.on('pageerror', e => err.push(e.message));
      try { await p.goto(BASE + '?mode=solo&deck=tudo,sinhdoi,lien,tia,set&notut=1&seed=4242', { waitUntil: 'load', timeout: 90000 }); }
      catch (e) { console.log('SKIP phần 2 (không mở được ' + BASE + ')'); await br.close(); process.exit(loi ? 1 : 0); }
      await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length && G.ban[0].o, null, { timeout: 60000 });
      await p.waitForFunction(() => { const e = document.querySelector('.tai-logo'); const r = e && e.getBoundingClientRect(); return (!e || !r.width || getComputedStyle(e).visibility === 'hidden' || !e.offsetParent) && !G.dung; }, null, { timeout: 60000 }).catch(() => {});
      await p.waitForTimeout(1500);
      await p.evaluate(() => { const B = G.ban[0]; G.cho = 1e9; G.quai.length = 0; B.t.fill(null); B.mana = 0; const d = (o, id, s) => { const T = sinhU(taoU(B, id, s, o)); B.t[o] = T; return T; }; d(7, 'tudo', 2); d(8, 'sinhdoi', 6); d(6, 'tudo', 3); d(2, 'lien', 3); d(12, 'tia', 4); B.t[12].st.da = true; KY_NANG_CAP.tudo.base = 0; KY_NANG_CAP.tudo.max = 0; try { localStorage.setItem('thap_kg_meo', '9'); } catch (e) { } });
      await p.waitForTimeout(500);
      const toaDo = (o) => p.evaluate((o) => { const cv = document.querySelector('#cv').getBoundingClientRect(), B = G.ban[0], c = B.o[o]; return { x: cv.left + c.x * cv.width / W, y: cv.top + c.y * cv.height / H }; }, o);
      // kéo 2★ Wild lên Twin Maker 6★, giữ trên ô → huy hiệu xem trước 4★ + chữ "−2★"
      const a = await toaDo(7), b = await toaDo(8), z = await toaDo(14);
      await p.mouse.click(z.x, z.y); await p.waitForTimeout(300); await p.mouse.click(z.x, z.y); await p.waitForTimeout(300);
      await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move((a.x + b.x) / 2, (a.y + b.y) / 2, { steps: 6 }); await p.mouse.move(b.x, b.y, { steps: 6 }); await p.waitForTimeout(450);
      const tip = await p.evaluate(() => (typeof KG !== 'undefined' && KG._tip && KG._tip.s) || '');
      ok(/Wild merge: random 4★ \(−2★\)/.test(tip), `[${w}×${h}] xem trước khi rê: "${tip}"`);
      await p.screenshot({ path: path.join(SHOTS, `keo-${w}x${h}.png`) });
      await p.mouse.up(); await p.waitForTimeout(700);
      await p.screenshot({ path: path.join(SHOTS, `ket-qua-${w}x${h}.png`) });
      const kq = await p.evaluate(() => G.ban[0].t.map(X => X ? X.id + X.sao : '-'));
      ok(!kq[7].startsWith('tudo') && kq[8] !== '-' && kq.filter(s => s !== '-').length === 5, `[${w}×${h}] thả: ghép thật + Twin Maker gọi thêm 1 ụ`, JSON.stringify(kq));
      await p.waitForTimeout(900);
      await p.screenshot({ path: path.join(SHOTS, `twin-${w}x${h}.png`) });
      // Wild 3★ lên ô đá 4★
      const c = await toaDo(6), d = await toaDo(12);
      await p.mouse.move(c.x, c.y); await p.mouse.down(); await p.mouse.move(d.x, d.y, { steps: 10 }); await p.waitForTimeout(400); await p.mouse.up(); await p.waitForTimeout(900);
      const da = await p.evaluate(() => { const T = G.ban[0].t[12]; return T ? [T.id, T.sao, !!T.st.da] : null; });
      ok(da && da[1] === 4 && !da[2] && !G_null(da), `[${w}×${h}] Wild 3★ lên ô ĐÁ 4★ → ụ thường 4★`, JSON.stringify(da));
      await p.screenshot({ path: path.join(SHOTS, `da-${w}x${h}.png`) });
      // trang ụ
      const mo = await p.evaluate(() => { try { if (typeof UP !== 'undefined' && UP.mo) { UP.mo('tudo'); return 'UP'; } } catch (e) { return 'loi ' + e.message; } return null; });
      if (mo === 'UP') { await p.waitForTimeout(2500); await p.screenshot({ path: path.join(SHOTS, `trang-u-${w}x${h}.png`) });
        const t = await p.evaluate(() => { const mb = document.querySelector('[data-up="more"]'); if (mb) mb.click(); return [...document.querySelectorAll('.up-muc')].map(x => x.textContent).join(' '); }); ok(/Wild merge/.test(t) && /average/.test(t) && /Stone and Frozen/.test(t) && /Spectrum mask/.test(t), `[${w}×${h}] trang ụ có luật ghép tự do`); }
      else ok(false, 'mở trang ụ', mo);
      ok(!err.length, `[${w}×${h}] không lỗi trang`, err.join(' | '));
      await p.close();
    }
  } finally { await br.close(); }
  console.log(loi ? '✗ ' + loi + ' lỗi' : '✓ đạt'); process.exit(loi ? 1 : 0);
})();
function G_null(x) { return x == null; }
