// TURRET MERGE — KIỂM Ụ CỜ BẠC "LUCKY SLOT" (cobac, Đỏ — thap/js/jackpot.js CB, người dùng 08/11) + BỎ JACKPOT các ụ khác
//   Luật: xuất hiện / lên sao → quay 1,0 s (không bắn) ra CAM / DƯA / NHO (+sao vào ngăn quả của bàn) · 10% JACKPOT (cả 3 ngăn +2×sao)
//   · ngăn quả dùng chung cho mọi Lucky Slot trên bàn đã quay xong · tất định theo hạt (cùng hạt → cùng chuỗi) · ghép thường · gói online 'cb' khứ hồi
//   · không còn jackpot nào khác (JP / T.jp / LOADED DICE / ROYAL VAULT …).
//   Phần 1: luật thuần (vm). Phần 2 (Playwright): trận thật — cuộn xèng, jackpot, khay thẻ có 3 số, trang ụ, bộ sưu tập; ảnh 390×844 + 844×390.
// Chạy: node tools/thap-kt-co-bac.js   (phần 2: python3 -m http.server 8765 ở gốc repo; BASE=… đổi; KHONG_PW=1 bỏ phần 2; SHOTS=thư mục ảnh, mặc định tests/co-bac/shots)
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const goc = path.join(__dirname, '..', 'thap');
const FILES = ['meta', 'text', 'data', 'thebai', 'fx', 'tiervfx', 'game', 'chihuy', 'skills', 'skills2', 'phattrien', 'artscale', 'skills3', 'skills4', 'skills5', 'vangmoi1', 'hotro', 'support', 'buff', 'skills7', 'jackpot', 'growfx', 'trum'];
let loi = 0; const ok = (dk, ten, chi) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (dk || chi == null ? '' : ' — ' + chi)); if (!dk) loi++; };
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
const buoc = (t) => { for (let x = 0; x < t; x += 1 / 30) { R('capNhat(1/30)'); if (ctx._cho.length) ctx._cho.splice(0).forEach(f => { try { f(); } catch (e) { } }); } }; // hẹn giờ giao diện (bảng wave…) không có DOM: bỏ qua
const tran = (deck, hat, che) => { ctx._d = deck; R(`G.debug = { seed: ${hat || 777} }; batDau('${che || 'solo'}', _d, 'hero'); G.cho = 1e9; G.quai.length = 0; G.dan.length = 0; for (const X of G.ban) { X.t.fill(null); X.mana = 0; X.ai = false; } var B = G.ban[0];
  var dat = (o, id, s, b) => { const X = b || B, T = sinhU(taoU(X, id, s, o)); X.t[o] = T; return T; };`); };
const DECK = ['cobac', 'lien', 'tia', 'set', 'bang'];

console.log('1 · có ụ, roster, bậc Đỏ, không jackpot cũ');
tran(DECK);
ok(R("!!SKILLS.cobac && G.rosterMap.cobac && G.rosterMap.cobac.bac === 'do' && SKILLS.cobac.vai === 'tc'"), 'SKILLS.cobac + roster Đỏ Tấn công');
ok(R("typeof JP === 'undefined'"), 'không còn khung jackpot cũ (JP)');
ok(R("!/LOADED DICE|ROYAL VAULT|CASCADE|REACTOR|FREQUENCY|TRUE NORTH|MASTERWORK/.test([SKILLS.xucxac.mo(), SKILLS.pandora.mo({ sao: 3 }), SKILLS.radar.mo ? SKILLS.radar.mo({ sao: 3, ban: 0 }) : ''].join(' '))"), 'chữ thẻ không còn tên jackpot cũ');
ok(R("Object.values(MOC_RIENG).every(m => Object.values(m).every(v => !/JACKPOT|TRUE NORTH/.test(v[0])))"), 'mốc sao không còn tên JACKPOT / TRUE NORTH (5★ La Bàn = POLE STAR)', R("JSON.stringify(MOC_RIENG.canon)"));
ok(R("KY_NANG_CAP.cobac.base === 100 && knGt(KY_NANG_CAP.cobac, 6) === 130"), 'cấp thẻ: Fruit power 100% → 130% (LV11 → LV17)');

console.log('2 · quay khi xuất hiện + khi lên sao, không bắn lúc quay');
tran(DECK);
R('var X = dat(7, "cobac", 2);'); buoc(0.05);
ok(R('X.cbS === 2 && X.cbQuay > 0.9 && G.cbLog.length === 1'), 'xuất hiện → quay 1 lần (sao 2), đang quay', R('JSON.stringify([X.cbS, X.cbQuay, G.cbLog])'));
ok(R('B.cb[0] + B.cb[1] + B.cb[2] === (G.cbLog[0].f === 3 ? 12 : 2)'), 'ngăn quả + đúng số sao (jackpot ×2 mỗi ngăn)', R('JSON.stringify(B.cb)'));
R('var E = sinhQuai("bo", G.duong.findIndex(q => q.ban === 0), 300, 1e6); E.vao = 1; E.d = Object.assign({}, E.d, { v: 0 }); var nb = 0, _b = SKILLS.cobac.ban; SKILLS.cobac.ban = function () { nb++; return _b.apply(this, arguments); };');
buoc(0.8); ok(R('nb === 0'), 'trong 1,0 s quay: không bắn', R('nb'));
buoc(2.5); ok(R('nb >= 1'), 'quay xong → bắn', R('nb'));
R('SKILLS.cobac.ban = _b; nangSao(B, X, 1, "x");'); buoc(0.05);
ok(R('G.cbLog.length === 2 && G.cbLog[1].s === 3 && X.cbS === 3'), 'lên sao tại chỗ → quay lại với sao mới', R('JSON.stringify(G.cbLog)'));
R('X.sao = 2;'); buoc(0.05); R('X.sao = 3;'); buoc(0.05);
ok(R('G.cbLog.length === 2'), 'mất sao rồi lên lại đúng sao cũ → không quay lại');

console.log('3 · số mỗi điểm + tốc giảm dần + chung cho mọi Lucky Slot đã quay');
tran(DECK);
R('B.cb = [10, 10, 10]; var A = dat(6, "cobac", 3), C = dat(8, "cobac", 3); A.cbS = 3; C.cbS = 3; A.cbQuay = 0; C.cbQuay = 0; mocBuf(B);');
const d = R('CB.gt(B, "dmg")'), t = R('CB.gt(B, "toc")'), c = R('CB.gt(B, "cdmg")');
ok(Math.abs(d - 0.30) < 1e-9 && Math.abs(c - 1.0) < 1e-9, 'cam 10 → +30% ST · nho 10 → +100% ST chí mạng', d + ' / ' + c);
ok(t > 0.18 && t < 0.2, 'dưa 10 → ≈ +19% tốc (giảm dần)', t);
ok(R('B.cb[1] = 1000; CB.gt(B, "toc") <= 1.5 + 1e-9 && CB.gt(B, "toc") > 1.49'), 'dưa 1000 → tiến tới trần +150%', R('CB.gt(B, "toc")'));
R('B.cb[1] = 10; B.capThe = { cobac: 6 };');
ok(Math.abs(R('CB.gt(B, "dmg")') - 0.39) < 1e-9, 'LV17 (Fruit power 130%): cam 10 → +39%', R('CB.gt(B, "dmg")'));
R('B.capThe = {}; mocBuf(B);');
ok(R('Math.abs(A.buf.dmg - C.buf.dmg) < 1e-9 && A.buf.dmg >= 0.3 - 1e-9 && (A.buf.cdmg || 0) >= 1 - 1e-9'), 'mọi Lucky Slot trên bàn nhận cùng buff', R('JSON.stringify([A.buf, C.buf])'));
R('C.cbQuay = 0.5; mocBuf(B);'); ok(R('C.buf.dmg < A.buf.dmg'), 'Lucky Slot đang quay chưa nhận (chưa thành súng)');
R('var L = dat(0, "lien", 3); mocBuf(B);'); ok(R('L.buf.dmg < 0.3'), 'ụ khác không nhận ngăn quả');
{ const r0 = R('(() => { const T = A; mocBuf(B); return dmgU(T); })()'), r1 = R('(() => { B.cb[0] += 10; mocBuf(B); return dmgU(A); })()');
  ok(Math.abs(r1 / r0 - 1.6 / 1.3) < 0.02, 'cộng vào CHUNG nhóm ST (dmgU tăng đúng 1 + tổng)', (r1 / r0).toFixed(3)); }

console.log('4 · tất định + tỉ lệ JACKPOT ≈ 10%');
const chuoi = (hat) => { tran(DECK, hat); return R('(() => { const ds = []; for (let i = 1; i <= 40; i++) ds.push(CB.rut(B, i)); return ds.join(""); })()'); };
ok(chuoi(4242) === chuoi(4242), 'cùng hạt → cùng chuỗi kết quả');
ok(chuoi(4242) !== chuoi(4243), 'khác hạt → khác chuỗi');
{ tran(DECK, 99); const dem = R('(() => { const c = [0, 0, 0, 0]; for (let i = 1; i <= 20000; i++) c[CB.rut(B, i)]++; return c; })()');
  ok(Math.abs(dem[3] / 20000 - 0.10) < 0.01, 'JACKPOT ' + (dem[3] / 200).toFixed(2) + '% trên 20 000 lần quay', JSON.stringify(dem));
  ok(dem.slice(0, 3).every(x => Math.abs(x / 20000 - 0.30) < 0.015), '3 quả đều ≈ 30%', JSON.stringify(dem)); }
{ const lan = (hat) => { tran(DECK, hat); R('for (let i = 0; i < 6; i++) dat(i, "cobac", 1 + (i % 3));'); buoc(0.1); return R('JSON.stringify([B.cb, G.cbLog.map(x => x.f)])'); };
  ok(lan(31) === lan(31), 'trận cùng hạt → cùng ngăn quả', lan(31)); }
tran(DECK); R('var Q = dat(3, "cobac", 1);'); buoc(0.05); ok(R("!/Math\\.random/.test(SKILLS.cobac.capNhat.toString() + CB.rut.toString() + CB.quay.toString())"), 'luật quay không dùng Math.random');

console.log('5 · ghép (luật thường) + ngăn quả giữ trên bàn');
tran(DECK);
R('var a = dat(0, "cobac", 2), b = dat(1, "cobac", 2);'); buoc(0.05); const truoc = R('JSON.stringify(B.cb)'), n0 = R('G.cbLog.length');
R('B.deck = ["cobac"]; var r = ghep(B, a, b);'); buoc(0.05);
ok(R('r && r.id === "cobac" && r.sao === 3 && B.t[0] === null'), 'cùng loại cùng sao → ụ ngẫu nhiên trong bộ +1★ (bộ ép = cobac)');
ok(R('G.cbLog.length') === n0 + 1 && R('G.cbLog[G.cbLog.length - 1].s') === 3, 'Lucky Slot ra từ ghép → quay lại (sao 3)');
ok(R('B.cb.every((x, i) => x >= ' + truoc + '[i])'), 'ngăn quả không mất khi 2 nguyên liệu biến mất', truoc + ' → ' + R('JSON.stringify(B.cb)'));
R('B.deck = ["lien"]; var a2 = dat(5, "cobac", 3), b2 = B.t[1];'); buoc(1.2); const keep = R('JSON.stringify(B.cb)'); R('ghep(B, a2, b2)'); buoc(0.05);
ok(R('JSON.stringify(B.cb)') === keep && !R('B.t.some(T => T && T.id === "cobac")'), 'ghép ra ụ khác: bàn không còn Lucky Slot, ngăn quả vẫn giữ', keep);

console.log('6 · PVP / CO-OP: ngăn theo bàn, AI dùng được');
tran(DECK, 5, 'pvp');
R('var D = G.ban[1]; var p = dat(2, "cobac", 2), q = dat(2, "cobac", 4, D);'); buoc(0.05);
ok(R('B.cb.reduce((s, x) => s + x, 0) % 2 === 0 && D.cb && D.cb.reduce((s, x) => s + x, 0) % 4 === 0 && B.cb !== D.cb'), 'mỗi bàn ngăn riêng', R('JSON.stringify([B.cb, D.cb])'));
ok(R("THEBAI.dsDo().includes('cobac')"), 'có trong bể Đỏ (gacha / cửa hàng / bộ máy)');
{ tran(['cobac', 'lien', 'tia', 'set', 'bang'], 8, 'pvp'); R('G.ban[1].deck = ["cobac", "lien", "tia", "set", "bang"]; G.ban[1].ai = true; G.ban[1].mana = 5000; G.cho = 0;'); buoc(40);
  ok(R('(G.cbLog || []).some(x => x.ban === 1)'), 'AI đối thủ triệu hồi / ghép ra Lucky Slot → tự quay', R('JSON.stringify((G.cbLog || []).filter(x => x.ban === 1).slice(0, 4))')); }

console.log('7 · online: gói cb + ảnh chụp khứ hồi (bàn con rối không tự quay)');
{ const src = fs.readFileSync(path.join(goc, 'js', 'online', 'dongbo.js'), 'utf8');
  tran(DECK, 77, 'coop');
  vm.runInContext(src.replace(/^'use strict';/m, '').replace(/^const ONS = /m, 'var ONS = '), ctx, { filename: 'dongbo.js' }); // var: hàm đã biên dịch trước (jackpot.js) thấy được trong vm
  R('var gui = []; ONS.on = true; ONS.seed = 77; ONS.me = "a"; ONS.gui = (k, d) => gui.push([k, JSON.parse(JSON.stringify(d))]); var B1 = G.ban[1]; B1.net = true;');
  R('var m = dat(4, "cobac", 3);'); buoc(0.05);
  ok(R('gui.length === 1 && gui[0][0] === "cb" && gui[0][1].o === 4 && gui[0][1].s === 3 && gui[0][1].st.join() === B.cb.join()'), 'máy chủ bàn gửi gói cb { o, f, s, st, n }', R('JSON.stringify(gui)'));
  R('var pm = dat(4, "cobac", 3, B1);'); buoc(0.3);
  ok(R('!(pm.cbS > 0) && !(B1.cb && B1.cb.some(x => x))'), 'bàn con rối KHÔNG tự quay');
  R('ONS.apCB(B1, gui[0][1]);');
  ok(R('pm.cbS === 3 && B1.cb.join() === B.cb.join() && pm.cbKq === gui[0][1].f && G.hu.some(o => o.k === "cbQuay" && o.B === B1)'), 'nhận gói: đúng quả, ngăn quả khớp, phát lại cuộn xèng', R('JSON.stringify([pm.cbS, B1.cb, B.cb])'));
  ok(R('gui.length === 1'), 'bàn con rối không gửi lại');
  const anh = R('JSON.stringify(ONS.anhBan(B))');
  R('B1.cb = [0, 0, 0]; pm.cbS = 0; ONS.apAnh(B1, JSON.parse(' + JSON.stringify(anh) + '), false);');
  ok(R('B1.cb.join() === B.cb.join() && pm.cbS === 3'), 'ảnh chụp (cb + cờ z) sửa lệch bàn con rối', R('JSON.stringify([B1.cb, pm.cbS, ONS.oTT(m)])'));
  R('ONS.on = false;'); }

if (loi) { console.log('\n✗ ' + loi + ' lỗi (phần luật)'); }
else console.log('\n✓ phần luật đạt');

// ---------------- phần 2: trình duyệt ----------------
if (process.env.KHONG_PW === '1') process.exit(loi ? 1 : 0);
let pw; try { pw = require('playwright'); } catch (e) { console.log('SKIP phần 2 (không có playwright)'); process.exit(loi ? 1 : 0); }
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const SHOTS = process.env.SHOTS || path.join(__dirname, '..', 'tests', 'co-bac', 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
(async () => {
  const br = await pw.chromium.launch();
  try {
    for (const [w, h] of [[390, 844], [844, 390]]) {
      const p = await br.newPage({ viewport: { width: w, height: h } });
      const errs = []; p.on('pageerror', e => errs.push(e.message));
      try { await p.goto(BASE + '?mode=solo&deck=cobac,lien,tia,set,bang&notut=1&seed=4242', { waitUntil: 'load', timeout: 90000 }); }
      catch (e) { console.log('SKIP phần 2 (không mở được ' + BASE + ')'); await br.close(); process.exit(loi ? 1 : 0); }
      await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length && !document.querySelector('#bo-the .the') === false, null, { timeout: 60000 });
      await p.waitForTimeout(9000);
      const tag = w + 'x' + h;
      // cuộn xèng thường (ép CAM) giữa ô
      await p.evaluate(() => { const B = G.ban[0]; G.cho = 1e9; B.t.fill(null); G._cbEp = [0]; const T = sinhU(taoU(B, 'cobac', 3, 7)); B.t[7] = T; VX.trieu(T); });
      await p.waitForTimeout(450); await p.screenshot({ path: path.join(SHOTS, tag + '-quay.png') });
      await p.waitForTimeout(900);
      let r = await p.evaluate(() => { const B = G.ban[0]; const el = document.querySelector('#bo-the .the[data-id="cobac"] .cb-qua'); return { cb: B.cb, so: el ? [...el.querySelectorAll('b')].map(b => +b.textContent) : null, hien: el ? el.getBoundingClientRect().height > 4 : false }; });
      ok(r.so && r.so.join() === r.cb.join() && r.hien, tag + ': khay thẻ hiện 3 số = ngăn quả', JSON.stringify(r));
      await p.screenshot({ path: path.join(SHOTS, tag + '-khay.png') });
      // JACKPOT
      await p.evaluate(() => { const B = G.ban[0]; G._cbEp = [3]; const T = sinhU(taoU(B, 'cobac', 4, 8)); B.t[8] = T; VX.trieu(T); });
      await p.waitForTimeout(1250); await p.screenshot({ path: path.join(SHOTS, tag + '-jackpot.png') });
      await p.waitForTimeout(1500);
      r = await p.evaluate(() => { const B = G.ban[0]; const el = document.querySelector('#bo-the .the[data-id="cobac"] .cb-qua'); return { cb: B.cb, so: [...el.querySelectorAll('b')].map(b => +b.textContent) }; });
      ok(r.cb.join() === '11,8,8' && r.so.join() === r.cb.join(), tag + ': JACKPOT 4★ → cả 3 ngăn +8, khay cập nhật', JSON.stringify(r));
      await p.screenshot({ path: path.join(SHOTS, tag + '-sau-jackpot.png') });
      // trang ụ (detail) + bộ sưu tập
      const mo = await p.evaluate(() => { try { if (typeof UP !== 'undefined' && UP.mo) { UP.mo('cobac'); return 'UP'; } } catch (e) { return 'loi ' + e.message; } return null; });
      if (mo) { await p.waitForTimeout(1500); await p.screenshot({ path: path.join(SHOTS, tag + '-chitiet.png') }); }
      ok(!errs.length, tag + ': không lỗi trang', errs.slice(0, 3).join(' | '));
      await p.close();
      // bộ sưu tập (menu)
      const m = await br.newPage({ viewport: { width: w, height: h } });
      await m.goto(BASE + '?notut=1', { waitUntil: 'load', timeout: 90000 }); await m.waitForTimeout(6000);
      await m.evaluate(() => { const b = document.querySelector('[data-act="hm-bst"]'); if (b) b.click(); }); await m.waitForTimeout(1500);
      await m.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /SKIP TUTORIAL/i.test(x.textContent) && x.offsetParent); if (b) b.click(); }); await m.waitForTimeout(1500);
      const coThe = await m.evaluate(() => { const el = document.querySelector('#chon-luoi [data-id="cobac"]'); if (el) el.scrollIntoView({ block: 'center' }); return !!el; });
      await m.waitForTimeout(600); await m.screenshot({ path: path.join(SHOTS, tag + '-bosuutap.png') });
      ok(coThe, tag + ': Lucky Slot có trong bộ sưu tập');
      await m.close();
    }
  } finally { await br.close(); }
  console.log(loi ? '\n✗ ' + loi + ' lỗi' : '\n✓ đạt hết'); process.exit(loi ? 1 : 0);
})();
