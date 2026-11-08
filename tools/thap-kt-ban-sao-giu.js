// TURRET MERGE — KIỂM LUẬT "BẢN SAO THEO Ô ĐÍCH" (người dùng 09/11: "thả Pháo La Bàn thật vào Pháo La Bàn bản sao Copycat thì lại thành ụ La Bàn xịn"
//   + chốt: "ghép ụ xịn vào ụ copy thì giữ ụ copy, còn ngược lại thì ưu tiên ụ xịn" — kéo cái nào vào cái nào là chiến thuật).
//   Luật: ghép CÙNG LOẠI ra đúng loại đó → kết quả lấy cờ bản sao của Ụ ĐÍCH (game.js giuBanSao): thật→copy = copy · copy→thật = thật.
//     La Bàn + La Bàn · hợp thể Prism (ô cuối đường vuốt / mặt nạ đích) · Twin Anvil + Twin Anvil · Merge King + Merge King
//     · đổi ụ ngoài bộ (ktDeck) giữ cờ của chính ụ.
//   SỬA 09/11 (người dùng: "A + A ra A khác với A + A ra ụ ngẫu nhiên, dù ngẫu nhiên ra A cũng không thể coi là cùng 1 ụ"): GHÉP THƯỜNG X + X bốc trúng
//     lại X (Ember, Leviathan, Evolver, Rồng…) = ụ MỚI THẬT trong mọi chiều — không theo ô đích.
//   Giữ nguyên thân (đã đúng, kiểm hồi quy): Merge King +★ lên bản sao · Teleporter đổi chỗ · Overclock · biến tại chỗ (chuyenU: Hộp / Evolver nở)
//     · nâng sao tại chỗ · đóng băng / hoá đá / tẩy.
//   Ghép ra ụ KHÁC loại (ngẫu nhiên khác loại, Mimic) = ụ mới, KHÔNG phải bản sao.
//   Bản sao → sát thương × heSaoChep (dmgU). Online: gói 'gh' (ghép đặc biệt: sa/sb = oTT), 'pm' (hợp thể Prism), ảnh chụp oTT/datO mang cờ 'c'.
// Chạy: node tools/thap-kt-ban-sao-giu.js   (thuần vm, không trình duyệt)
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const goc = path.join(__dirname, '..', 'thap');
const FILES = ['meta', 'text', 'data', 'thebai', 'fx', 'tiervfx', 'game', 'chihuy', 'skills', 'skills2', 'phattrien', 'artscale', 'skills3', 'skills4', 'skills5', 'vangmoi1', 'hotro', 'support', 'buff', 'skills7', 'jackpot', 'growfx', 'trum'];
let loi = 0; const ok = (dk, ten, chi) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (dk || chi == null ? '' : ' — ' + chi)); if (!dk) loi++; };
function moiTruong(onl) {
  const noop = () => {};
  const ctx = { console: { log: console.log, warn: noop, error: noop }, Math: Object.create(Math), JSON, Set, Map, WeakMap, WeakSet, Promise, Object, Array, Error, RegExp, String, Number, Date, setTimeout: (f) => { ctx._cho.push(f); }, setInterval: noop, clearInterval: noop, clearTimeout: noop, _cho: [], performance: { now: () => 0 }, localStorage: { getItem: () => null, setItem: noop, removeItem: noop } };
  ctx.window = ctx; ctx.location = { search: '' }; ctx.addEventListener = noop;
  ctx.SND = new Proxy({}, { get: () => noop });
  ctx.VX = new Proxy({ TRE_LO: 0, hen: (d, f) => f(), t: 0, ds: [] }, { get: (o, k) => (k in o ? o[k] : noop) });
  ctx.BVX = new Proxy({}, { get: () => noop });
  ctx.REN = { coDau: () => 40, lamNen: noop, t: 0, img: () => null, s: 1, dpr: 1 };
  ctx.UI = { vaoTran: noop, canhBaoTrum: noop, bangWave: noop, ketQua: noop };
  ctx.FONT = { display: 'x', ui: 'x' };
  vm.createContext(ctx);
  const ds = FILES.slice(); if (onl) ds.push('online/dongbo');
  for (const f of ds) { if (f === 'online/dongbo') ctx.document = { addEventListener: noop, hidden: false, getElementById: () => null, querySelector: () => null }; const p = path.join(goc, 'js', f + '.js'); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f + '.js' }); }
  vm.runInContext("if (typeof buffNo === 'undefined') var buffNo = function () {};", ctx);
  vm.runInContext('G.roster = window.ROSTER_EMBED; G.rosterMap = {}; for (const r of G.roster) G.rosterMap[r.id] = r;', ctx);
  return ctx;
}
const DECK = ['canon', 'bienmau', 'vughep', 'loren', 'saochep', 'dichchuyen', 'mimic', 'lien', 'epxung', 'tienhoa'];
const NAP = (ctx, hat, che) => { const R = (s) => vm.runInContext(s, ctx); ctx._d = DECK;
  R(`Math.random = rngHat(${hat} * 13 + 5); G.debug = { seed: ${hat} }; batDau('${che || 'solo'}', _d, 'hero'); G.cho = 1e9; G.quai.length = 0; G.dan.length = 0; for (const X of G.ban) { X.t.fill(null); X.mana = 0; } var B = G.ban[0];
  var dat = (o, id, s, f) => { const T = sinhU(taoU(B, id, s, o)); B.t[o] = T; if (f) Object.assign(T, f); return T; };
  var xoa = () => { B.t.fill(null); B.deck = _d.slice(); };
  var bs = (o) => !!(B.t[o] && B.t[o].banSao);`); return R; };

// mỗi đường: tạo 2 nguyên liệu (a = kéo ở ô 0, b = đích ở ô 1, cờ bản sao ca/cb), chạy, trả { o: ô kết quả, id mong đợi }
const C = (x) => (x ? 'banSao: true' : 'banSao: false');
const DUONG = {
  'La Bàn + La Bàn': (ca, cb) => `dat(0, 'canon', 3, { hb: 1, cmC: 0, ${C(ca)} }); dat(1, 'canon', 3, { hb: 2, cmC: 0, ${C(cb)} }); ghep(B, B.t[0], B.t[1]); [1, 'canon']`,
  'La Bàn NSWE + NSWE (stack)': (ca, cb) => `dat(0, 'canon', 3, { hb: 15, cmC: 1, ${C(ca)} }); dat(1, 'canon', 3, { hb: 15, cmC: 0, ${C(cb)} }); ghep(B, B.t[0], B.t[1]); [1, 'canon']`,
  'Prism mặt nạ + mặt nạ': (ca, cb) => `dat(0, 'bienmau', 3, { pm: 0, pf: 1, pmk: [1, 0, 0, 0], ${C(ca)} }); dat(1, 'bienmau', 3, { pm: 1, pf: 1, pmk: [0, 1, 0, 0], ${C(cb)} }); ghep(B, B.t[0], B.t[1]); [1, 'bienmau']`,
  'Twin Anvil + Twin Anvil': (ca, cb) => `dat(0, 'loren', 3, { dang: 'dmg', lo: 2, ${C(ca)} }); dat(1, 'loren', 3, { dang: 'dmg', lo: 2, ${C(cb)} }); ghep(B, B.t[0], B.t[1]); [1, 'loren']`,
  'Merge King + Merge King': (ca, cb) => `dat(0, 'vughep', 3, { vang: false, ${C(ca)} }); dat(1, 'vughep', 3, { vang: false, ${C(cb)} }); ghep(B, B.t[0], B.t[1]); [1, 'vughep']`,
  'Ember Relay + Ember Relay': (ca, cb) => `B.deck = ['lualien']; dat(0, 'lualien', 3, { lc: 2, ${C(ca)} }); dat(1, 'lualien', 3, { lc: 3, ${C(cb)} }); ghep(B, B.t[0], B.t[1]); [1, 'lualien']`,
  'Leviathan + Leviathan': (ca, cb) => `B.deck = ['leviathan']; dat(0, 'leviathan', 3, { ${C(ca)} }); dat(1, 'leviathan', 3, { ${C(cb)} }); ghep(B, B.t[0], B.t[1]); [1, 'leviathan']`,
  'Evolver + Evolver': (ca, cb) => `B.deck = ['tienhoa']; dat(0, 'tienhoa', 3, { egg: 1, ${C(ca)} }); dat(1, 'tienhoa', 3, { egg: 2, ${C(cb)} }); ghep(B, B.t[0], B.t[1]); [1, 'tienhoa']`,
  'ghép thường X + X ra lại X': (ca, cb) => `B.deck = ['lien']; dat(0, 'lien', 3, { ${C(ca)} }); dat(1, 'lien', 3, { ${C(cb)} }); ghep(B, B.t[0], B.t[1]); [1, 'lien']`,
};
// ghép THƯỜNG (bốc ngẫu nhiên trúng lại đúng loại) → luôn ụ mới THẬT (sửa 09/11)
const THUONG = new Set(['Ember Relay + Ember Relay', 'Leviathan + Leviathan', 'Evolver + Evolver', 'ghép thường X + X ra lại X']);
console.log('1 · ghép ĐẶC BIỆT cùng loại: theo cờ bản sao của Ụ ĐÍCH · ghép THƯỜNG ra lại đúng loại: luôn ụ mới THẬT');
for (const [ten, f] of Object.entries(DUONG)) {
  const R = NAP(moiTruong(false), 4242), sai = [], th = THUONG.has(ten);
  for (const [ca, cb, mong0] of [[0, 0, false], [0, 1, true], [1, 0, false], [1, 1, true]]) {
    const mong = th ? false : mong0;
    const [o, id] = R(`xoa(); ${f(ca, cb)}`), T = R(`B.t[${o}] && [B.t[${o}].id, !!B.t[${o}].banSao, !B.t[0]]`);
    if (!T || T[0] !== id || T[1] !== mong || !T[2]) sai.push((ca ? 'copy' : 'real') + '+' + (cb ? 'copy' : 'real') + '=' + JSON.stringify(T));
  }
  ok(!sai.length, ten + (th ? ': ghép THƯỜNG → mọi chiều ra ụ mới THẬT (kể cả copy + copy)' : ': thật→thật = thật · thật→copy = COPY · copy→thật = THẬT · copy→copy = copy'), sai.join(' | '));
}
{ // vuốt hợp thể 4 Prism: mặt nạ ra ở ô CUỐI → theo cờ bản sao ô cuối
  const R = NAP(moiTruong(false), 4243), sai = [];
  for (let k = -1; k < 4; k++) {
    R(`xoa(); for (let q = 0; q < 4; q++) dat(q, 'bienmau', 3, { pm: q, pms: 0, banSao: q === ${k} });`);
    const r = R('SKILLS.bienmau.mach(B, [0, 1, 2, 3])'), T = R('B.t[3] && [B.t[3].id, B.t[3].pf, !!B.t[3].banSao]');
    if (!r || !T || T[0] !== 'bienmau' || !(T[1] > 0) || T[2] !== (k === 3)) sai.push('copy@' + k + '=' + JSON.stringify(T));
  }
  ok(!sai.length, 'Prism vuốt hợp thể 4 ô: mặt nạ là bản sao ⇔ ô CUỐI là bản sao (bản sao ở ô 1–3 bị nuốt → thật)', sai.join(' | '));
}

console.log('2 · ghép đặc biệt / biến tại chỗ giữ thân → giữ bản sao');
{ const R = NAP(moiTruong(false), 4244);
  R(`xoa(); dat(0, 'vughep', 3, { vang: false }); var X = dat(1, 'lien', 3, { banSao: true }); ghep(B, B.t[0], X);`);
  ok(R('B.t[1] === X && X.sao === 4 && X.banSao'), 'Merge King (thật) +★ lên bản sao: vẫn bản sao');
  R(`xoa(); dat(0, 'vughep', 3, { vang: false, banSao: true }); var X = dat(1, 'lien', 3); ghep(B, B.t[0], X);`);
  ok(R('B.t[1] === X && X.sao === 4 && !X.banSao'), 'Merge King bản sao +★ lên ụ thật KHÁC loại: ụ đích vẫn thật (không lây)');
  R(`xoa(); dat(0, 'dichchuyen', 3); var X = dat(1, 'lien', 3, { banSao: true }); ghep(B, B.t[0], X);`);
  ok(R('B.t[0] === X && X.banSao && B.t[1].id === "dichchuyen" && !B.t[1].banSao'), 'Teleporter đổi chỗ: bản sao đi theo ụ');
  R(`xoa(); dat(0, 'epxung', 3); var X = dat(1, 'lien', 3, { banSao: true }); ghep(B, B.t[0], X);`);
  ok(R('B.t[1] === X && X.banSao && X.epxung > 0'), 'Overclock lên bản sao: vẫn bản sao');
  R(`xoa(); var X = dat(4, 'tienhoa', 3, { banSao: true }); var N = chuyenU(B, X, 'lien', 4, true);`);
  ok(R('B.t[4] === N && N.id === "lien" && N.banSao'), 'biến tại chỗ (chuyenU: Evolver nở / Hộp Bí Ẩn / Scrambler): giữ bản sao');
  R(`xoa(); var X = dat(4, 'lien', 3, { banSao: true }); nangSao(B, X, 2);`);
  ok(R('B.t[4] === X && X.sao === 5 && X.banSao'), 'nâng sao tại chỗ (Star Lift / chiêu +★): giữ bản sao');
  R(`xoa(); var X = dat(4, 'lien', 3, { banSao: true }); X.st.da = true; X.st.bang = 5; X.st.da = false; X.st.bang = 0;`);
  ok(R('X.banSao && B.t[4] === X'), 'đóng băng / hoá đá / tẩy: chỉ đổi trạng thái thân, giữ bản sao');
  R(`xoa(); B.deck = ['lien']; var X = dat(4, 'canon', 3, { banSao: true }); G.ktDeck = true; ktDeck('kt'); G.ktDeck = false;`);
  ok(R('B.t[4] && B.t[4].id === "lien" && B.t[4].banSao'), 'sửa ụ ngoài bộ bài (ktDeck): ụ thay thế giữ bản sao');
}

console.log('3 · ghép ra ụ KHÁC loại → ụ mới thật (giữ luật cũ)');
{ const R = NAP(moiTruong(false), 4245);
  R(`xoa(); B.deck = ['tia']; dat(0, 'lien', 3, { banSao: true }); dat(1, 'lien', 3, { banSao: true }); ghep(B, B.t[0], B.t[1]);`);
  ok(R('B.t[1] && B.t[1].id === "tia" && B.t[1].sao === 4 && !B.t[1].banSao'), 'ghép thường copy + copy ra loại KHÁC: ụ mới thật');
  R(`xoa(); B.deck = ['lien']; dat(0, 'mimic', 3); dat(1, 'canon', 3, { banSao: true }); ghep(B, B.t[0], B.t[1]);`);
  ok(R('B.t[1] && B.t[1].id === "lien" && !B.t[1].banSao'), 'Mimic + bản sao: ụ ngẫu nhiên mới thật');
  R(`xoa(); var X = dat(1, 'lien', 3); dat(0, 'saochep', 3); ghep(B, B.t[0], X);`);
  ok(R('B.t[0] && B.t[0].id === "lien" && B.t[0].banSao && !X.banSao'), 'Copycat chép: Copycat thành bản sao, ụ gốc vẫn thật');
  R(`xoa(); var P0 = dat(0, 'lien', 3), Q0 = dat(1, 'lien', 3, { banSao: true });`);
  const t = R('dmgU(Q0) / dmgU(P0)'), he = R('heSaoChep(B)');
  ok(Math.abs(t - he) < 1e-9 && he < 1, 'sát thương bản sao = ×heSaoChep (' + Math.round(he * 100) + '%)', t + ' vs ' + he);
  R(`xoa(); dat(0, 'canon', 3, { hb: 1, cmC: 0 }); dat(1, 'canon', 3, { hb: 2, cmC: 0, banSao: true }); var d0 = dmgU(B.t[1]); ghep(B, B.t[0], B.t[1]);`);
  ok(R('B.t[1].banSao && dmgU(B.t[1]) < dmgU(dat(5, "canon", B.t[1].sao, { hb: B.t[1].hb, cmC: B.t[1].cmC }))'), 'ca người dùng báo: La Bàn thật thả vào La Bàn bản sao → vẫn −% sát thương bản sao');
}

console.log('4 · ONLINE: máy chủ bàn → gói thật → bàn con rối giữ cờ bản sao');
{ const H = moiTruong(true), P = moiTruong(true), RH = NAP(H, 31337, 'coop'), RP = NAP(P, 31337, 'coop');
  const goi = []; H._goi = goi;
  RH('ONS.on = true; ONS.seed = 31337; ONS.gui = (k, d) => _goi.push({ k, d: JSON.parse(JSON.stringify(d)) }); ONS.boc();');
  RP('ONS.on = true; ONS.seed = 31337; var B1 = G.ban[1]; B1.net = true;');
  const dongBo = () => { const s = RH('B.t.map(T => ONS.oTT(T))'); P._s = s; RP('B1.t.fill(null); _s.forEach((x, o) => { if (x) ONS.datO(B1, o, x); });'); };
  const phat = () => { for (const g of goi.splice(0)) { P._g = g.d; if (g.k === 'gh') RP('ONS.apGhep(B1, _g)'); if (g.k === 'pm') RP('SKILLS.bienmau.mach(B1, _g.o, true, _g.r)'); } };
  const so = (o) => [RH(`(() => { const T = B.t[${o}]; return T ? T.id + T.sao + (T.banSao ? 'c' : '') : '-'; })()`), RP(`(() => { const T = B1.t[${o}]; return T ? T.id + T.sao + (T.banSao ? 'c' : '') : '-'; })()`)];
  const lech = []; let n = 0;
  for (const [ten, f] of Object.entries(DUONG)) for (const [ca, cb] of [[0, 1], [1, 0], [0, 0], [1, 1]]) {
    RH(`xoa(); var _r = (() => { ${f(ca, cb).replace(/ghep\(B, B\.t\[0\], B\.t\[1\]\); \[1, '\w+'\]$/, '')} })();`); dongBo(); RH('ghep(B, B.t[0], B.t[1]);'); phat(); n++;
    const [h, p] = so(1); if (h !== p || h.endsWith('c') !== (!!cb && !THUONG.has(ten))) lech.push(ten + ' ' + ca + cb + ': ' + h + '/' + p);
  }
  for (const k of [1, 3]) { RH(`xoa(); for (let q = 0; q < 4; q++) dat(q, 'bienmau', 3, { pm: q, pms: 0, banSao: q === ${k} });`); dongBo(); RH('SKILLS.bienmau.mach(B, [0, 1, 2, 3]);'); phat(); n++;
    const [h, p] = so(3); if (h !== p || h.endsWith('c') !== (k === 3)) lech.push('Prism vuốt copy@' + k + ': ' + h + '/' + p); }
  ok(!lech.length, 'ghép cùng loại × ' + Object.keys(DUONG).length + ' đường × 4 chiều + vuốt Prism: ' + n + ' gói, cờ bản sao 2 máy khớp', lech.slice(0, 4).join(' | '));
  RH('xoa(); dat(0, "canon", 4, { hb: 15, cmC: 3, banSao: true }); dat(1, "loren", 2, { dang: "toc", lo: 2, banSao: true }); dat(2, "lien", 5);'); dongBo();
  ok([0, 1, 2].every(o => { const [h, p] = so(o); return h === p; }) && RP('!!B1.t[0].banSao && !!B1.t[1].banSao && !B1.t[2].banSao'), 'ảnh chụp oTT → datO giữ cờ bản sao (c)');
}
console.log(loi ? '✗ thap-kt-ban-sao-giu: ' + loi + ' lỗi' : '✓ thap-kt-ban-sao-giu: xanh');
process.exit(loi ? 1 : 0);
