// TURRET MERGE — KIỂM Ụ CỜ BẠC "LUCKY SLOT" (cobac, Đỏ — thap/js/jackpot.js CB) — MÁY XÈNG 3 Ô (người dùng 08/11) + BỎ JACKPOT các ụ khác
//   Luật: xuất hiện (1 lần duy nhất; lên sao tại chỗ KHÔNG quay lại) → 3 cuộn quay 1,2 s, dừng trái → phải (cách 0,35 s):
//     cặp = +1 điểm quả đó · 3 giống = JACKPOT (mỗi ngăn +2) · khác hết = tự quay lại (0,7 s) · đang quay không bắn
//   · ngăn quả dùng chung cho mọi Lucky Slot đã quay xong · tất định theo hạt (rngHat theo lần quay n, lượt k, ô j) · tỉ lệ 20 000 lần quay
//   · ghép thường · gói online 'cb' mang MỌI ô của MỌI lượt → bàn con rối phát lại y hệt · không còn jackpot nào khác.
//   Phần 1: luật thuần (vm). Phần 2 (Playwright): trận thật — cuộn / dừng trái→phải / cặp / quay lại / jackpot, khay thẻ 3 số (1–3 chữ số),
//   trang ụ, bộ sưu tập; ảnh 390×844 + 844×390 (+ khay 667×375).
// Chạy: node tools/thap-kt-co-bac.js   (phần 2: python3 -m http.server 8765 ở gốc repo; BASE=… đổi; KHONG_PW=1 bỏ phần 2; SHOTS=thư mục ảnh, mặc định tests/co-bac/shots)
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const goc = path.join(__dirname, '..', 'thap');
const FILES = ['meta', 'text', 'data', 'thebai', 'fx', 'tiervfx', 'game', 'chihuy', 'skills', 'skills2', 'phattrien', 'artscale', 'skills3', 'skills4', 'skills5', 'vangmoi1', 'hotro', 'support', 'buff', 'skills7', 'jackpot', 'thacmana', 'growfx', 'trum'];
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

console.log('2 · quay khi xuất hiện (máy 3 ô), không bắn lúc quay, lên sao tại chỗ không quay lại');
tran(DECK);
R('G._cbEp = [[[0, 1, 2], [1, 1, 0]]]; var X = dat(7, "cobac", 2);'); buoc(0.05);
ok(R('X.cbS === 2 && G.cbLog.length === 1 && G.cbLog[0].q === "012|110" && X.cbQ.length === 2'), 'xuất hiện → quay 1 lần, chuỗi 2 lượt (khác hết → quay lại → cặp)', R('JSON.stringify([X.cbS, G.cbLog])'));
ok(R('Math.abs(CB.lich(X.cbQ).het - 4.15) < 1e-9 && X.cbQuay > 4.0'), 'thời gian: 1,2 + 0,7 (3 ô dừng) + 0,45 nghỉ + 0,7 + 0,7 + 0,4 = 4,15 s', R('CB.lich(X.cbQ).het'));
ok(R('B.cb.join() === "0,1,0"'), 'cặp dưa hấu → +1 dưa (không nhân sao)', R('JSON.stringify(B.cb)'));
R('var E = sinhQuai("bo", G.duong.findIndex(q => q.ban === 0), 300, 1e6); E.vao = 1; E.d = Object.assign({}, E.d, { v: 0 }); var nb = 0, _b = SKILLS.cobac.ban; SKILLS.cobac.ban = function () { nb++; return _b.apply(this, arguments); };');
buoc(3.9); ok(R('nb === 0 && !CB.laSung(X)'), 'trong 4,15 s quay (cả lượt quay lại): không bắn', R('nb'));
buoc(2.5); ok(R('nb >= 1 && CB.laSung(X)'), 'quay xong → thành súng, bắn', R('nb'));
R('SKILLS.cobac.ban = _b; nangSao(B, X, 1, "x");'); buoc(0.05);
ok(R('G.cbLog.length === 1 && X.cbS === 2 && X.sao === 3 && !(X.cbQuay > 0)'), 'lên sao tại chỗ (nangSao) → KHÔNG quay lại', R('JSON.stringify(G.cbLog)'));
R('X.sao = 2;'); buoc(0.05); R('X.sao = 5;'); buoc(0.05);
ok(R('G.cbLog.length === 1'), 'mất sao rồi lên sao tại chỗ → vẫn không quay lại');
R('var c0 = JSON.stringify(B.cb), K = dat(3, "vughep", 5), n0 = G.cbLog.length; var gh = 0, _g = SKILLS.cobac.ghep; SKILLS.cobac.ghep = function () { gh++; }; var r = ghep(B, K, X); SKILLS.cobac.ghep = _g;'); buoc(1.2);
ok(R('r === X && B.t[7] === X && X.sao === 6 && G.cbLog.length === n0 && JSON.stringify(B.cb) === c0 && X.cbS === 2 && !(X.cbQuay > 0) && gh === 0'), 'Merge King lên Lucky Slot: giữ ụ, +1★, KHÔNG quay, ngăn quả không đổi', R('JSON.stringify([r && r.id, X.sao, G.cbLog.length, B.cb, X.cbS, gh])'));
ok(R('dmgU(X) > 0 && Math.abs(SKILLS.cobac.dmg * TIERS.do.hs * heSaoST("cobac", X.sao) * hsLv(B, "cobac") * (1 + X.buf.dmg) * heSoMocDmg(X) - dmgU(X)) < 1e-6'), 'súng tăng sao như ụ thường (heSaoST: sao + nền Đỏ)', R('dmgU(X)'));

console.log('3 · cặp +1 · 3 giống = JACKPOT +2 mỗi ngăn · khác hết = quay lại');
tran(DECK);
R('G._cbEp = [[[2, 0, 2]]]; dat(0, "cobac", 5);'); buoc(0.05);
ok(R('B.cb.join() === "0,0,1"'), 'cặp nho (ô 1 + ô 3) → +1 nho, 5★ không nhân', R('JSON.stringify(B.cb)'));
R('G._cbEp = [[[1, 2, 2]]]; dat(1, "cobac", 1);'); buoc(0.05);
ok(R('B.cb.join() === "0,0,2"'), 'cặp ô 2 + ô 3 → +1 quả đó', R('JSON.stringify(B.cb)'));
R('G._cbEp = [[[1, 1, 1]]]; dat(2, "cobac", 7);'); buoc(0.05);
ok(R('B.cb.join() === "2,2,4" && B.t[2].cbKq === 3'), '3 dưa hấu = JACKPOT → MỖI ngăn +2', R('JSON.stringify(B.cb)'));
R('G._cbEp = [[[0, 1, 2], [2, 1, 0], [0, 0, 1]]]; dat(3, "cobac", 2);'); buoc(0.05);
ok(R('B.cb.join() === "3,2,4" && G.cbLog[G.cbLog.length - 1].q === "012|210|001"'), 'khác hết 2 lần → quay tiếp tới khi có cặp (cam +1)', R('JSON.stringify([B.cb, G.cbLog.slice(-1)])'));
ok(R('CB.kq([0, 1, 2]).f === -1 && CB.kq([1, 1, 2]).f === 1 && CB.kq([2, 1, 1]).f === 1 && CB.kq([0, 2, 0]).f === 0 && CB.kq([2, 2, 2]).jp'), 'CB.kq: khác hết / cặp mọi vị trí / 3 giống');

console.log('4 · số mỗi điểm + tốc giảm dần + chung cho mọi Lucky Slot đã quay');
tran(DECK);
R('B.cb = [10, 10, 10]; var A = dat(6, "cobac", 3), C = dat(8, "cobac", 3); A.cbS = 3; C.cbS = 3; A.cbQuay = 0; C.cbQuay = 0; mocBuf(B);');
{ const d = R('CB.gt(B, "dmg")'), t = R('CB.gt(B, "toc")'), c = R('CB.gt(B, "cdmg")'), DM = R('CB.DMG'), CD = R('CB.CDMG'), TO = R('CB.TOC');
  const KH = R('CB.KHOI'); // 09/11: mỗi ngăn tính sẵn KHOI = 10 điểm
  ok(KH === 10 && Math.abs(d - (10 + KH) * DM) < 1e-9 && Math.abs(c - (10 + KH) * CD) < 1e-9 && Math.abs(DM - 0.025) < 1e-9 && Math.abs(CD - 0.06) < 1e-9 && Math.abs(TO - 0.05) < 1e-9 && R('SKILLS.cobac.dmg') === 58, 'cam 10 (+10 sẵn) → +' + (d * 100).toFixed(0) + '% ST · nho 10 (+10 sẵn) → +' + (c * 100).toFixed(0) + '% ST chí mạng (09/11: mỗi điểm 2,5% / 5% / 6%, sẵn 10 điểm)', d + ' / ' + c);
  ok(Math.abs(t - 1.5 * (1 - Math.exp(-(10 + KH) * TO / 1.5))) < 1e-9 && t < (10 + KH) * TO, 'dưa 10 (+10 sẵn) → +' + (t * 100).toFixed(1) + '% tốc (giảm dần)', t); }
ok(R('B.cb[1] = 1000; CB.gt(B, "toc") <= 1.5 + 1e-9 && CB.gt(B, "toc") > 1.49'), 'dưa 1000 → tiến tới trần +150%', R('CB.gt(B, "toc")'));
ok(R('B.cb[0] = 999; B.cb[2] = 999; Math.abs(CB.gt(B, "dmg") - (999 + CB.KHOI) * CB.DMG) < 1e-9 && Math.abs(CB.gt(B, "cdmg") - (999 + CB.KHOI) * CB.CDMG) < 1e-9'), 'cam / nho KHÔNG trần (999 điểm vẫn tuyến tính — người dùng 08/11)');
R('B.cb = [10, 10, 10]; B.capThe = { cobac: 6 };');
ok(Math.abs(R('CB.gt(B, "dmg")') - R('(10 + CB.KHOI) * CB.DMG * 1.3')) < 1e-9, 'LV17 (Fruit power 130%): cam 10 × 1,3', R('CB.gt(B, "dmg")'));
R('B.capThe = {}; mocBuf(B);');
// 09/11 "Lucky Slot chơi khó": 0 điểm vẫn có sẵn KHOI điểm mỗi ngăn — Lucky Slot vừa quay xong (ngăn 0) đã có buff; ụ chưa quay / ụ khác không nhận
{ const s0 = R('JSON.stringify(B.cb)'); R('B.cb = [0, 0, 0]; for (const T of B.t) if (T) for (const k in T.buf) if (typeof T.buf[k] === "number") T.buf[k] = 0; mocBuf(B);');
  ok(R('Math.abs(CB.gt(B, "dmg") - 10 * CB.DMG) < 1e-9 && Math.abs(CB.gt(B, "cdmg") - 10 * CB.CDMG) < 1e-9 && Math.abs(CB.gt(B, "toc") - 1.5 * (1 - Math.exp(-10 * CB.TOC / 1.5))) < 1e-9 && CB.gt(B, "toc") > 0.4'), 'ngăn 0 điểm → vẫn +25% ST · +42% tốc · +60% ST chí mạng (10 điểm sẵn)', R('[CB.gt(B, "dmg"), CB.gt(B, "toc"), CB.gt(B, "cdmg")].join(" / ")'));
  ok(R('A.buf.dmg >= 10 * CB.DMG - 1e-9 && A.buf.toc > 0.4'), 'Lucky Slot vừa quay xong ở bàn 0 điểm đã có buff sẵn', R('JSON.stringify(A.buf)'));
  ok(R('/Every fruit starts with 10 bonus points/.test(SKILLS.cobac.mo(A)) && /\\+25% damage|Orange 0 \\(\\+25%\\)/.test(SKILLS.cobac.mo(A))'), 'mô tả ghi điểm sẵn + % hiện tại tính cả điểm sẵn', R('SKILLS.cobac.mo(A)').slice(-160));
  R('B.cb = ' + s0 + '; mocBuf(B);'); }
ok(R('Math.abs(A.buf.dmg - C.buf.dmg) < 1e-9 && A.buf.dmg >= 20 * CB.DMG - 1e-9 && (A.buf.cdmg || 0) >= 20 * CB.CDMG - 1e-9'), 'mọi Lucky Slot trên bàn nhận cùng buff', R('JSON.stringify([A.buf, C.buf])'));
R('C.cbQuay = 0.5; mocBuf(B);'); ok(R('C.buf.dmg < A.buf.dmg'), 'Lucky Slot đang quay chưa nhận (chưa thành súng)');
R('var L = dat(0, "lien", 3); mocBuf(B);'); ok(R('L.buf.dmg < 20 * CB.DMG'), 'ụ khác không nhận ngăn quả');
{ R('var moi0 = () => { for (const T of B.t) if (T) for (const k in T.buf) if (typeof T.buf[k] === "number") T.buf[k] = 0; mocBuf(B); };');
  const r0 = R('(() => { moi0(); return dmgU(A); })()'), b0 = R('A.buf.dmg'), r1 = R('(() => { B.cb[0] += 10; moi0(); return dmgU(A); })()'), b1 = R('A.buf.dmg'), k = (1 + b1) / (1 + b0);
  ok(Math.abs(b1 - b0 - 10 * R('CB.DMG')) < 1e-9, '+10 cam → nhóm ST +' + (10 * R('CB.DMG') * 100).toFixed(0) + '%', b1 - b0);
  ok(Math.abs(r1 / r0 - k) < 0.02, 'cộng vào CHUNG nhóm ST (dmgU tăng đúng 1 + tổng)', (r1 / r0).toFixed(3) + ' vs ' + k.toFixed(3)); }

console.log('5 · tất định + tỉ lệ thật trên 20 000 lần quay (cuộn đều)');
const chuoi = (hat) => { tran(DECK, hat); return R('(() => { const ds = []; for (let i = 1; i <= 40; i++) ds.push(CB.rut(B, i).map(l => l.join("")).join("|")); return ds.join(","); })()'); };
ok(chuoi(4242) === chuoi(4242), 'cùng hạt → cùng chuỗi (mọi ô mọi lượt)');
ok(chuoi(4242) !== chuoi(4243), 'khác hạt → khác chuỗi');
ok(R('CB.o(B, 5, 1, 2) === CB.o(B, 5, 1, 2) && CB.rut(B, 9).length === CB.rut(B, 9).length'), 'ô j lượt k lần n rút lại y hệt (số lượt quay lại cũng tất định)');
{ tran(DECK, 99); const k = R(`(() => { const c = { jp: 0, cap: 0, khac1: 0, luot: 0, qua: [0, 0, 0], o: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] };
    for (let n = 1; n <= 20000; n++) { const q = CB.rut(B, n), r = CB.kq(q[q.length - 1]); c.luot += q.length; if (r.jp) c.jp++; else { c.cap++; c.qua[r.f]++; } if (CB.kq(q[0]).f < 0) c.khac1++; for (let j = 0; j < 3; j++) c.o[j][q[0][j]]++; }
    return c; })()`);
  const pc = (x) => (x / 200).toFixed(2) + '%';
  ok(Math.abs(k.jp / 20000 - 1 / 7) < 0.01, 'JACKPOT thật ' + pc(k.jp) + ' (lý thuyết 1/7 ≈ 14,29%)', JSON.stringify(k));
  ok(Math.abs(k.cap / 20000 - 6 / 7) < 0.01, 'cặp ' + pc(k.cap) + ' (6/7 ≈ 85,71%)');
  ok(Math.abs(k.khac1 / 20000 - 2 / 9) < 0.01, 'lượt đầu khác hết (phải quay lại) ' + pc(k.khac1) + ' (2/9 ≈ 22,22%)');
  ok(Math.abs(k.luot / 20000 - 9 / 7) < 0.02, 'trung bình ' + (k.luot / 20000).toFixed(3) + ' lượt / lần quay (9/7 ≈ 1,286)');
  ok(k.qua.every(x => Math.abs(x / k.cap - 1 / 3) < 0.015), 'cặp chia đều 3 quả', JSON.stringify(k.qua));
  ok(k.o.every(a => a.every(x => Math.abs(x / 20000 - 1 / 3) < 0.015)), 'mỗi ô (trái / giữa / phải) ra đều 3 quả', JSON.stringify(k.o)); }
{ const lan = (hat) => { tran(DECK, hat); R('for (let i = 0; i < 6; i++) dat(i, "cobac", 1 + (i % 3));'); buoc(0.1); return R('JSON.stringify([B.cb, G.cbLog.map(x => x.q)])'); };
  ok(lan(31) === lan(31), 'trận cùng hạt → cùng ngăn quả + cùng chuỗi', lan(31)); }
tran(DECK); R('var Q = dat(3, "cobac", 1);'); buoc(0.05); ok(R("!/Math\\.random/.test(SKILLS.cobac.capNhat.toString() + CB.rut.toString() + CB.o.toString() + CB.quay.toString())"), 'luật quay không dùng Math.random');

console.log('6 · ghép (luật thường) + ngăn quả giữ trên bàn');
tran(DECK);
R('var a = dat(0, "cobac", 2), b = dat(1, "cobac", 2);'); buoc(0.05); const truoc = R('JSON.stringify(B.cb)'), n0 = R('G.cbLog.length');
R('B.deck = ["cobac"]; var r = ghep(B, a, b);'); buoc(0.05);
ok(R('r && r.id === "cobac" && r.sao === 3 && B.t[0] === null'), 'cùng loại cùng sao → ụ ngẫu nhiên trong bộ +1★ (bộ ép = cobac)');
ok(R('G.cbLog.length') === n0 + 1 && R('G.cbLog[G.cbLog.length - 1].s') === 3, 'Lucky Slot ra từ ghép → quay (lần mới)');
ok(R('B.cb.every((x, i) => x >= ' + truoc + '[i])'), 'ngăn quả không mất khi 2 nguyên liệu biến mất', truoc + ' → ' + R('JSON.stringify(B.cb)'));
R('B.deck = ["lien"]; var a2 = dat(5, "cobac", 3), b2 = B.t[1];'); buoc(6); const keep = R('JSON.stringify(B.cb)'); R('ghep(B, a2, b2)'); buoc(0.05);
ok(R('JSON.stringify(B.cb)') === keep && !R('B.t.some(T => T && T.id === "cobac")'), 'ghép ra ụ khác: bàn không còn Lucky Slot, ngăn quả vẫn giữ', keep);

console.log('7 · PVP / CO-OP: ngăn theo bàn, AI dùng được');
tran(DECK, 5, 'pvp');
R('var D = G.ban[1]; var p = dat(2, "cobac", 2), q = dat(2, "cobac", 4, D);'); buoc(0.05);
ok(R('[1, 6].includes(B.cb.reduce((s, x) => s + x, 0)) && D.cb && [1, 6].includes(D.cb.reduce((s, x) => s + x, 0)) && B.cb !== D.cb'), 'mỗi bàn ngăn riêng (mỗi lần quay: +1 hoặc +6)', R('JSON.stringify([B.cb, D.cb])'));
ok(R("THEBAI.dsDo().includes('cobac')"), 'có trong bể Đỏ (gacha / cửa hàng / bộ máy)');
{ tran(['cobac', 'lien', 'tia', 'set', 'bang'], 8, 'pvp'); R('G.ban[1].deck = ["cobac", "lien", "tia", "set", "bang"]; G.ban[1].ai = true; G.ban[1].mana = 5000; G.cho = 0;'); buoc(40);
  ok(R('(G.cbLog || []).some(x => x.ban === 1)'), 'AI đối thủ triệu hồi / ghép ra Lucky Slot → tự quay', R('JSON.stringify((G.cbLog || []).filter(x => x.ban === 1).slice(0, 4))')); }

console.log('8 · online: gói cb mang CẢ CHUỖI + ảnh chụp khứ hồi (bàn con rối không tự quay)');
{ const src = fs.readFileSync(path.join(goc, 'js', 'online', 'dongbo.js'), 'utf8');
  tran(DECK, 77, 'coop');
  vm.runInContext(src.replace(/^'use strict';/m, '').replace(/^const ONS = /m, 'var ONS = '), ctx, { filename: 'dongbo.js' }); // var: hàm đã biên dịch trước (jackpot.js) thấy được trong vm
  R('var gui = []; ONS.on = true; ONS.seed = 77; ONS.me = "a"; ONS.gui = (k, d) => gui.push([k, JSON.parse(JSON.stringify(d))]); var B1 = G.ban[1]; B1.net = true;');
  R('G._cbEp = [[[0, 1, 2], [1, 0, 2], [2, 2, 2]]]; var m = dat(4, "cobac", 3);'); buoc(0.05);
  ok(R('gui.length === 1 && gui[0][0] === "cb" && gui[0][1].o === 4 && gui[0][1].s === 3 && gui[0][1].st.join() === B.cb.join() && JSON.stringify(gui[0][1].q) === "[[0,1,2],[1,0,2],[2,2,2]]"'), 'máy chủ bàn gửi gói cb { o, q (mọi ô mọi lượt), s, st, n }', R('JSON.stringify(gui)'));
  R('var pm = dat(4, "cobac", 3, B1);'); buoc(0.3);
  ok(R('!(pm.cbS > 0) && !(B1.cb && B1.cb.some(x => x))'), 'bàn con rối KHÔNG tự quay');
  R('ONS.apCB(B1, gui[0][1]);');
  ok(R('pm.cbS === 3 && B1.cb.join() === B.cb.join() && JSON.stringify(pm.cbQ) === JSON.stringify(m.cbQ) && Math.abs(pm.cbQuay - CB.lich(m.cbQ).het) < 1e-9 && G.hu.some(o => o.k === "cbQuay" && o.B === B1 && JSON.stringify(o.q) === JSON.stringify(m.cbQ))'), 'nhận gói: phát lại ĐÚNG chuỗi 3 lượt (cùng hình, cùng thời gian không bắn), ngăn quả khớp', R('JSON.stringify([pm.cbS, pm.cbQ, B1.cb, B.cb])'));
  ok(R('gui.length === 1'), 'bàn con rối không gửi lại');
  ok(R('(() => { const T = { o: 9, sao: 1, id: "cobac" }; const X = { cb: [0, 0, 0], i: 1 }; CB.quay(X, T, { f: 2, s: 1, n: 3 }); return X.cb.join() === "0,0,1"; })()'), 'gói cũ (chỉ f) vẫn hiểu');
  const anh = R('JSON.stringify(ONS.anhBan(B))');
  R('B1.cb = [0, 0, 0]; pm.cbS = 0; ONS.apAnh(B1, JSON.parse(' + JSON.stringify(anh) + '), false);');
  ok(R('B1.cb.join() === B.cb.join() && pm.cbS === 3'), 'ảnh chụp (cb + cờ z) sửa lệch bàn con rối', R('JSON.stringify([B1.cb, pm.cbS, ONS.oTT(m)])'));
  R('B.cb = [CB.TIA[1], CB.TIA[1] + 2, CB.TIA[1]]; B1.cb = [0, 0, 0]; ONS.apAnh(B1, ONS.anhBan(B), false);');
  ok(R('B1.cb.join() === B.cb.join() && CB.tia(B1) === 3 && CB.tia(B) === 3'), 'online: số tia của bàn con rối = máy chủ (theo ngăn quả đồng bộ)', R('JSON.stringify([B1.cb, CB.tia(B1)])'));
  R('nangSao(B, m, 1, "x"); nangSao(B1, pm, 1, "x");'); buoc(0.1);
  ok(R('gui.length === 1 && m.cbS === 3 && pm.cbS === 3'), 'lên sao tại chỗ (online): máy chủ không quay / không gửi lại', R('JSON.stringify(gui.map(x => x[0]))'));
  R('var nh = G.cbLog.length; ONS.apCB(B1, Object.assign({}, gui[0][1], { s: 4, n: 99 }));');
  ok(R('G.cbLog.length === nh && pm.cbS === 3'), 'bàn con rối: ụ đã quay nhận gói cb sao cao hơn → KHÔNG quay lại');
  R('var pm2 = dat(5, "cobac", 4, B1);'); buoc(0.1);
  R('ONS.apCB(B1, { o: 5, q: [[1, 2, 1]], s: 4, st: B1.cb.map((x, i) => x + (i === 1 ? 1 : 0)), n: 50 });');
  ok(R('pm2.cbS === 4 && pm2.cbKq === 1 && G.cbLog.length === nh + 1 && G.cbLog[G.cbLog.length - 1].q === "121"'), 'bàn con rối: ụ mới chưa quay → nhận đúng 1 lượt quay', R('JSON.stringify([pm2.cbS, pm2.cbKq])'));
  R('ONS.on = false;'); }

console.log('9 · KHÔNG nâng cấp bằng mana trong trận (08/11 người dùng)');
tran(DECK);
R('B.mana = 5000; var mn = B.mana;');
ok(R("SKILLS.cobac.khongNang === true && nangCap(B, 'cobac') === false && B.lv.cobac === 1 && B.mana === mn"), 'nangCap(cobac) từ chối, không trừ mana, cấp giữ 1');
ok(R("nangCap(B, 'lien') === true && B.lv.lien === 2"), 'ụ khác vẫn nâng được');
{ tran(['cobac'], 9, 'pvp'); R('var A2 = G.ban[1]; A2.deck = ["cobac"]; A2.lv = { cobac: 1 }; A2.ai = true; A2.mana = 1e6; G.cho = 0;'); buoc(20);
  ok(R('A2.lv.cobac === 1'), 'AI không nâng Lucky Slot (bộ chỉ có cobac, mana đầy)', R('JSON.stringify(A2.lv)')); }
tran(DECK); R('var Z = dat(6, "cobac", 3); B.lv.cobac = 4;'); buoc(0.05);
ok(R('B.lv.cobac === 1'), 'lỡ có cấp (trận lưu cũ / gói cũ) → về cấp 1 (hệ số gốc)');
ok(R("/no mana power-up/.test(SKILLS.cobac.mo(Z))"), 'chữ kỹ năng ghi rõ không nâng bằng mana');
{ const src = fs.readFileSync(path.join(goc, 'js', 'online', 'dongbo.js'), 'utf8');
  tran(DECK, 78, 'coop');
  vm.runInContext(src.replace(/^'use strict';/m, '').replace(/^const ONS = /m, 'var ONS = '), ctx, { filename: 'dongbo.js' });
  R('var B1 = G.ban[1]; B1.lv = { cobac: 1, lien: 1 };');
  R('ONS.on = true; ONS.me = "a"; ONS.gui = () => {}; B1.net = true; var v = ONS.anhBan(B1); v.lv = { cobac: 5, lien: 3 }; ONS.apAnh(B1, v, true);');
  ok(R('B1.lv.cobac === 1 && B1.lv.lien === 3'), 'online: ảnh chụp mang cấp Lucky Slot > 1 → vẫn cấp 1 (ụ khác nhận cấp)', R('JSON.stringify(B1.lv)'));
  R('ONS.nhan({ u: "b", k: "nc", d: JSON.stringify({ id: "cobac", lv: 3 }) }); ONS.nhan({ u: "b", k: "nc", d: JSON.stringify({ id: "lien", lv: 4 }) });');
  ok(R('B1.lv.cobac === 1 && B1.lv.lien === 4'), 'online: gói nâng cấp nc cho Lucky Slot bị bỏ qua', R('JSON.stringify(B1.lv)'));
  R('ONS.on = false;');
}

console.log('10 · TIA THEO NGƯỠNG: min(3 quả, điểm quay) ≥ CB.TIA[0] → 2 tia · ≥ CB.TIA[1] → 3 tia, mục tiêu khác nhau theo thứ tự đường');
{ const dung = (c) => { // c: mảng ngăn quả; 4 quái đứng yên (s 300/250/200/150) → 1 loạt bắn của Lucky Slot đã quay xong
    c.R('var kP = G.duong.findIndex(q => q.ban === 0), kQS = [150, 300, 200, 250].map(s => { const E = sinhQuai("bo", kP, s, 1e6); E.vao = 1; E.d = Object.assign({}, E.d, { v: 0 }); return E; });'
      + 'var kL = dat(7, "cobac", 3); kL.cbS = 3; kL.cbQuay = 0; kL.goc = 0; var kGhi = [], kTr = trung; trung = function (M, d, o) { kGhi.push([M.s, d]); return kTr.apply(this, arguments); };'
      + 'var kBan = (cb) => { B.cb = cb.slice(); G.dan.length = 0; kGhi.length = 0; mocBuf(B); SKILLS.cobac.ban(G, B, kL, quaiDau(B)); return G.dan.filter(d => d.T === kL).map(d => d.muc.s); };'); };
  tran(DECK, 31); dung({ R });
  const T1 = R('CB.TIA[0]'), T2 = R('CB.TIA[1]');
  ok(T1 >= 1 && T2 > T1, 'ngưỡng CB.TIA = [' + T1 + ', ' + T2 + '] (điểm quay, không tính KHOI)');
  ok(R(`CB.tia({ cb: [${T1 - 1}, 99, 99] }) === 1 && CB.tia({ cb: [${T1}, ${T1}, ${T1}] }) === 2 && CB.tia({ cb: [99, ${T2 - 1}, 99] }) === 2 && CB.tia({ cb: [${T2}, ${T2}, ${T2}] }) === 3 && CB.tia({ cb: [0, 0, 0] }) === 1`), 'CB.tia: chỉ tính quả THẤP nhất (cả 3 phải đạt) · KHOI không tính');
  ok(R(`JSON.stringify(kBan([${T1 - 1}, 50, 50])) === "[300]"`), 'dưới ngưỡng (1 quả thiếu 1 điểm) → 1 tia vào quái đầu', R(`JSON.stringify(kBan([${T1 - 1}, 50, 50]))`));
  ok(R(`JSON.stringify(kBan([${T1}, ${T1}, ${T2 - 1}])) === "[300,250]"`), 'min ≥ T1 → 2 tia: quái đầu + quái kế tiếp theo đường', R(`JSON.stringify(kBan([${T1}, ${T1}, ${T2 - 1}]))`));
  ok(R(`JSON.stringify(kBan([${T2}, ${T2 + 5}, ${T2}])) === "[300,250,200]"`), 'min ≥ T2 → 3 tia: 3 quái đầu theo thứ tự đường, không trùng');
  R(`var kM3 = kBan([${T2}, ${T2}, ${T2}]); for (let i = 0; i < 90; i++) { for (let j = G.dan.length - 1; j >= 0; j--) if (capNhatDan(G.dan[j], 1 / 30)) G.dan.splice(j, 1); }`);
  ok(R('kGhi.length === 3 && new Set(kGhi.map(g => g[0])).size === 3 && kGhi.every(g => Math.abs(g[1] - dmgU(kL) * CB.TIA_ST[2]) < 1e-6)'), 'mỗi tia trúng ĐÚNG 1 quái khác nhau, ST mỗi tia = dmgU × TIA_ST (không lan)', R('JSON.stringify([kGhi, dmgU(kL), CB.TIA_ST])'));
  R('for (const E of kQS) if (E.s !== 300) E.chet = true; G.quai = G.quai.filter(E => !E.chet); B._ds = null;');
  ok(R(`JSON.stringify(kBan([${T2}, ${T2}, ${T2}])) === "[300]"`), 'chỉ còn 1 quái → 1 tia (không bắn trùng mục tiêu)');
  ok(R(`/All 3 fruits at ${T1}\\+ spun points/.test(SKILLS.cobac.mo(kL)) && /Beams now: 3/.test(SKILLS.cobac.mo(kL))`), 'mô tả ụ: ngưỡng tia + số tia hiện tại');
  R('trung = kTr;');
  // online / 2 máy: cùng hạt + cùng ngăn quả → cùng chuỗi mục tiêu (thứ tự đường, hoà → uid), không Math.random
  const chuoi = (c, cb) => { c.R(`G.debug = { seed: 4321 }; batDau('solo', ${JSON.stringify(DECK)}, 'hero'); G.cho = 1e9; G.quai.length = 0; G.dan.length = 0; for (const X of G.ban) { X.t.fill(null); X.mana = 0; X.ai = false; } var B = G.ban[0];`
      + 'var kP = G.duong.findIndex(q => q.ban === 0); for (let i = 0; i < 6; i++) { const E = sinhQuai("bo", kP, 120 + (i % 3) * 40, 1e5); E.vao = 1; }' // 2 quái cùng vị trí → hoà, tách bằng uid
      + `B.cb = ${JSON.stringify(cb)}; var kL = sinhU(taoU(B, "cobac", 4, 7)); B.t[7] = kL; kL.cbS = 4; kL.cbQuay = 0; kL.goc = -Math.PI / 2; kL.pha = 0; kL.cd = 0.3; var ds = []; var kBb = SKILLS.cobac.ban; SKILLS.cobac.ban = function (G, B, T, E) { const n0 = G.dan.length; kBb.apply(this, arguments); ds.push(G.dan.slice(n0).map(d => d.muc.uid).join(',')); };`);
    for (let x = 0; x < 4; x += 1 / 30) { c.R('capNhat(1/30)'); if (c.ctx._cho.length) c.ctx._cho.splice(0).forEach(f => { try { f(); } catch (e) { } }); }
    return c.R('SKILLS.cobac.ban = kBb; JSON.stringify(ds)'); };
  const c1 = moiTruong(), c2 = moiTruong(), m1 = { ctx: c1, R: (s) => vm.runInContext(s, c1) }, m2 = { ctx: c2, R: (s) => vm.runInContext(s, c2) };
  const a = chuoi(m1, [T2, T2, T2 + 3]), b = chuoi(m2, [T2, T2, T2 + 3]);
  ok(a === b && JSON.parse(a).length >= 3 && JSON.parse(a).every(x => x.split(',').length === 3 && new Set(x.split(',')).size === 3), '2 máy (cùng hạt, cùng ngăn quả) → cùng chuỗi 3 mục tiêu mỗi loạt, không trùng', a.slice(0, 160) + ' | ' + b.slice(0, 160));
  ok(/CB\.tia\(B\)/.test(fs.readFileSync(path.join(goc, 'js', 'jackpot.js'), 'utf8')) && !/Math\.random/.test(fs.readFileSync(path.join(goc, 'js', 'jackpot.js'), 'utf8').split('SKILLS.cobac = {')[1].split('};')[0]), 'số tia thuần theo B.cb (đồng bộ gói cb), SKILLS.cobac không dùng Math.random');
}

if (loi) { console.log('\n✗ ' + loi + ' lỗi (phần luật)'); }
else console.log('\n✓ phần luật đạt');

// ---------------- phần 2: trình duyệt ----------------
if (process.env.KHONG_PW === '1') process.exit(loi ? 1 : 0);
let pw; try { pw = require('playwright'); } catch (e) { console.log('SKIP phần 2 (không có playwright)'); process.exit(loi ? 1 : 0); }
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const SHOTS = process.env.SHOTS || path.join(__dirname, '..', 'tests', 'co-bac', 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
// chụp khung hình máy xèng theo THỜI GIAN TRẬN của hiệu ứng (o.t), cắt quanh ô ụ → ảnh nhỏ (ghép tờ liên hoàn docs/…/xeng-3-o.jpg)
async function khung(p, o, t, ten) {
  await p.waitForFunction(([o, t]) => { const h = G.hu.find(x => x.k === 'cbQuay' && x.o === o && x.B === G.ban[0]); return !!h && h.t >= t; }, [o, t], { timeout: 20000, polling: 16 });
  const r = await p.evaluate((o) => { const cv = document.querySelector('#cv').getBoundingClientRect(), B = G.ban[0], c = B.o[o], C = Math.min(B.cw, B.ch) * cv.width / W;
    return { x: cv.left + c.x / W * cv.width, y: cv.top + c.y / H * cv.height, C }; }, o);
  const s = r.C * 2.6, vp = p.viewportSize(), x = Math.max(0, Math.min(vp.width - s, r.x - s / 2)), y = Math.max(0, Math.min(vp.height - s, r.y - s * 0.6));
  await p.screenshot({ path: path.join(SHOTS, ten + '.png'), clip: { x, y, width: s, height: s } });
}
(async () => {
  const br = await pw.chromium.launch();
  try {
    for (const [w, h] of [[390, 844], [844, 390]]) {
      const p = await br.newPage({ viewport: { width: w, height: h } });
      const errs = []; p.on('pageerror', e => errs.push(e.message));
      try { await p.goto(BASE + '?mode=solo&deck=cobac,lien,tia,set,bang&notut=1&seed=4242', { waitUntil: 'load', timeout: 90000 }); }
      catch (e) { console.log('SKIP phần 2 (không mở được ' + BASE + ')'); await br.close(); process.exit(loi ? 1 : 0); }
      await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length && !!document.querySelector('#bo-the .the[data-id="cobac"]'), null, { timeout: 60000 });
      await p.waitForTimeout(9000);
      const tag = w + 'x' + h;
      // lượt 1 khác hết → quay lại → cặp DƯA (ô 7)
      await p.evaluate(() => { const B = G.ban[0]; G.cho = 1e9; G.quai.length = 0; B.t.fill(null); B.cb = [0, 0, 0]; B.cbV = null; G._cbEp = [[[0, 1, 2], [1, 1, 0]]]; const T = sinhU(taoU(B, 'cobac', 3, 7)); B.t[7] = T; VX.trieu(T); });
      for (const [t, ten] of [[0.6, '1-cuon'], [1.32, '2-dung-trai'], [1.67, '3-dung-giua'], [2.05, '4-khac-het'], [2.25, '5-quay-lai'], [3.2, '6-dung-lai'], [3.95, '7-cap'], [4.15, '8-cap-cong']]) await khung(p, 7, t, tag + '-' + ten);
      await p.waitForTimeout(800);
      let r = await p.evaluate(() => { const B = G.ban[0]; const el = document.querySelector('#bo-the .the[data-id="cobac"] .cb-qua'); return { cb: B.cb, so: el ? [...el.querySelectorAll('b')].map(b => +b.textContent) : null, hien: el ? el.getBoundingClientRect().height > 4 : false, sung: CB.laSung(B.t[7]) }; });
      ok(r.so && r.cb.join() === '0,1,0' && r.so.join() === r.cb.join() && r.hien && r.sung, tag + ': khác hết → quay lại → cặp dưa +1, khay thẻ = ngăn quả, thành súng', JSON.stringify(r));
      // không nâng bằng mana: ô giá ẩn, bấm thẻ không trừ mana / không lên cấp
      r = await p.evaluate(() => { const B = G.ban[0]; B.mana = 999; const d = document.querySelector('#bo-the .the[data-id="cobac"]'); const g = d.querySelector('.gia'); d.click(); return { an: getComputedStyle(g).visibility === 'hidden', lv: B.lv.cobac, mana: B.mana, nhan: (d.querySelector('.lv') || {}).textContent || '' }; });
      ok(r.an && r.lv === 1 && r.mana >= 999 && !r.nhan, tag + ': thẻ Lucky Slot ẩn giá, bấm không nâng cấp', JSON.stringify(r));
      // JACKPOT 3 nho (ô 8)
      await p.evaluate(() => { const B = G.ban[0]; G._cbEp = [[[2, 2, 2]]]; const T = sinhU(taoU(B, 'cobac', 4, 8)); B.t[8] = T; VX.trieu(T); });
      for (const [t, ten] of [[1.0, '9-jp-cuon'], [1.92, '10-jp-ba'], [2.15, '11-jp-no'], [2.5, '12-jp-no2']]) await khung(p, 8, t, tag + '-' + ten);
      await p.waitForTimeout(1500);
      r = await p.evaluate(() => { const B = G.ban[0]; const el = document.querySelector('#bo-the .the[data-id="cobac"] .cb-qua'); return { cb: B.cb, so: [...el.querySelectorAll('b')].map(b => +b.textContent) }; });
      ok(r.cb.join() === '2,3,2' && r.so.join() === r.cb.join(), tag + ': JACKPOT → cả 3 ngăn +2 (không nhân sao), khay cập nhật', JSON.stringify(r));
      await p.screenshot({ path: path.join(SHOTS, tag + '-sau-jackpot.png') });
      // trang ụ (detail)
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
    // khay thẻ: 1 / 2 / 3 chữ số (7 · 45 · 153 · 999) không đè nhau, nằm trong thẻ — 3 cỡ màn
    for (const [w, h] of [[390, 844], [844, 390], [667, 375]]) {
      const p = await br.newPage({ viewport: { width: w, height: h } });
      await p.goto(BASE + '?mode=solo&deck=cobac,lien,tia,set,bang&notut=1&seed=4242', { waitUntil: 'load', timeout: 90000 });
      await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && !!document.querySelector('#bo-the .the[data-id="cobac"]'), null, { timeout: 60000 });
      await p.waitForTimeout(6000);
      for (const v of [[7, 45, 153], [999, 88, 1]]) {
        await p.evaluate((v) => { const B = G.ban[0]; G.cho = 1e9; B.cb = v.slice(); B.cbV = null; CB.khay(); }, v);
        await p.waitForTimeout(900);
        const r = await p.evaluate(() => { const d = document.querySelector('#bo-the .the[data-id="cobac"]'), dr = d.getBoundingClientRect();
          const bs = [...d.querySelectorAll('.cb-qua b')].map(b => { const x = b.getBoundingClientRect(); return [x.left, x.right, x.height, b.textContent]; });
          return { bs, the: [dr.left, dr.right], chong: bs.some((b, i) => i && b[0] < bs[i - 1][1] - 0.5), ngoai: bs.some(b => b[0] < dr.left - 1 || b[1] > dr.right + 1) }; });
        ok(!r.chong && !r.ngoai && r.bs.map(b => b[3]).join() === v.join(), w + 'x' + h + ': khay ' + v.join('/') + ' — số không đè nhau, nằm trong thẻ', JSON.stringify(r));
        const el = await p.$('#bo-the .the[data-id="cobac"]'), bb = await el.boundingBox();
        await p.screenshot({ path: path.join(SHOTS, 'khay-' + w + 'x' + h + '-' + v.join('_') + '.png'), clip: { x: Math.max(0, bb.x - 8), y: Math.max(0, bb.y - 8), width: bb.width + 16, height: bb.height + 16 } });
      }
      // huy hiệu số tia: [7,45,153] (min 7) ẩn · [10,12,10] ×2 · [20,30,21] ×3 — nằm góc trên thẻ, không đè dải số quả
      for (const [v, ky] of [[[7, 45, 153], ''], [[10, 12, 10], '×2'], [[20, 30, 21], '×3']]) {
        await p.evaluate((v) => { const B = G.ban[0]; B.cb = v.slice(); B.cbV = null; CB.khay(); }, v); await p.waitForTimeout(300);
        const r = await p.evaluate(() => { const d = document.querySelector('#bo-the .the[data-id="cobac"]'), b = d.querySelector('.cb-tia'), q = d.querySelector('.cb-qua');
          if (!b || b.hidden) return { an: true }; const x = b.getBoundingClientRect(), y = q.getBoundingClientRect(), dr = d.getBoundingClientRect();
          return { an: false, t: b.textContent, de: x.bottom > y.top + 0.5 && x.right > y.left && x.left < y.right, ngoai: x.left < dr.left - 6 || x.top < dr.top - 6 || x.right > dr.right }; });
        ok(ky ? !r.an && r.t === ky && !r.de && !r.ngoai : r.an, w + 'x' + h + ': huy hiệu tia ' + (ky || 'ẩn') + ' (ngăn ' + v.join('/') + ')', JSON.stringify(r));
      }
      { const el = await p.$('#bo-the .the[data-id="cobac"]'), bb = await el.boundingBox(); await p.screenshot({ path: path.join(SHOTS, 'khay-' + w + 'x' + h + '-tia3.png'), clip: { x: Math.max(0, bb.x - 8), y: Math.max(0, bb.y - 8), width: bb.width + 16, height: bb.height + 16 } }); }
      await p.close();
    }
  } finally { await br.close(); }
  console.log(loi ? '\n✗ ' + loi + ' lỗi' : '\n✓ đạt hết'); process.exit(loi ? 1 : 0);
})();
