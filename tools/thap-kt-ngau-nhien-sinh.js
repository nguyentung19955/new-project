// TURRET MERGE — KIỂM LUẬT "NGẪU NHIÊN KHI XUẤT HIỆN" (người dùng 08/11: "khi copy hoặc được sinh ra thì cũng sẽ random với các ụ có quy tắc random")
//   Ụ có dạng quay lúc sinh: Pháo La Bàn (1 hướng N/S/W/E, 0 stack) · Prism Thief (màu đỏ/vàng/lam/lục) · Merge King (vàng 10%+) · Sói Máy (thức tỉnh 30%+)
//   · Twin Anvil (dạng ST / tốc) · Lucky Slot (quay máy xèng 1 lần khi xuất hiện).
//   MỌI đường xuất hiện phải quay MỚI (không chép / không cố định dạng): triệu hồi · ghép thường · Copycat chép · Twin Maker · Cloner · REINFORCE (chỉ huy)
//   · biến tại chỗ (Hộp Bí Ẩn / Evolver / Scrambler = chuyenU) · trùm Mad Crown / Genesis (sinhR) · AI.
//   Mỗi (ụ × đường): nhiều lần sinh → phân bố NGẪU NHIÊN (≥ 2 dạng, bản sao không luôn = dạng gốc) và TẤT ĐỊNH (cùng hạt → cùng chuỗi).
//   Copycat chép La Bàn NSWE + stack → 1 hướng ngẫu nhiên, 0 stack · chép Prism → màu ngẫu nhiên, 0 cộng dồn.
//   Online: 2 máy (chủ bàn + bàn con rối) qua gói thật (ONS.boc → 'tr' / 'gh' + ảnh chụp oTT/datO) ra CÙNG dạng.
// Chạy: node tools/thap-kt-ngau-nhien-sinh.js   (thuần vm, không trình duyệt)
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const goc = path.join(__dirname, '..', 'thap');
const FILES = ['meta', 'text', 'data', 'thebai', 'fx', 'tiervfx', 'game', 'chihuy', 'skills', 'skills2', 'phattrien', 'artscale', 'skills3', 'skills4', 'skills5', 'vangmoi1', 'hotro', 'support', 'buff', 'skills7', 'jackpot', 'growfx', 'trum'];
let loi = 0; const ok = (dk, ten, chi) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (dk || chi == null ? '' : ' — ' + chi)); if (!dk) loi++; };
function moiTruong(onl) {
  const noop = () => {};
  const ctx = { console, Math: Object.create(Math), JSON, Set, Map, WeakMap, WeakSet, Promise, Object, Array, Error, RegExp, String, Number, Date, setTimeout: (f) => { ctx._cho.push(f); }, setInterval: noop, clearInterval: noop, clearTimeout: noop, _cho: [], performance: { now: () => 0 }, localStorage: { getItem: () => null, setItem: noop, removeItem: noop } };
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
const DECK = ['canon', 'bienmau', 'vughep', 'soi', 'loren', 'cobac', 'saochep', 'nhanban', 'sinhdoi', 'lien'];
const NAP = (ctx, hat, che) => { const R = (s) => vm.runInContext(s, ctx); ctx._d = DECK;
  R(`Math.random = rngHat(${hat} * 13 + 5); G.debug = { seed: ${hat} }; batDau('${che || 'solo'}', _d, 'hero'); G.cho = 1e9; G.quai.length = 0; G.dan.length = 0; for (const X of G.ban) { X.t.fill(null); X.mana = 0; } var B = G.ban[0];
  var dat = (o, id, s, f) => { const T = sinhU(taoU(B, id, s, o)); B.t[o] = T; if (f) Object.assign(T, f); return T; };
  var xoa = () => B.t.fill(null);
  // dạng quay lúc sinh (Lucky Slot: chuỗi máy xèng — quay 1 khung capNhat)
  var DANG = (T) => { if (!T) return null; switch (T.id) {
    case 'canon': return T.hb + '/' + T.cmC; case 'bienmau': return T.pm + '/' + T.pms; case 'vughep': return T.vang ? 'G' : 'n'; case 'soi': return T.thuc ? 'A' : 'n';
    case 'loren': return T.dang; case 'cobac': { if (!(T.cbS > 0)) SKILLS.cobac.capNhat(G, G.ban[T.ban], T, 0); return T.cbQ ? T.cbQ.map(l => l.join('')).join('|') : 'KHONG_QUAY'; } } return '?'; };
  // dạng CỐ ĐỊNH của ụ gốc (để thấy bản sao có chép hay quay mới)
  var GOC = { canon: { hb: 15, cmC: 2 }, bienmau: { pm: 0, pms: 5 }, vughep: { vang: true }, soi: { thuc: true }, loren: { dang: 'toc' }, cobac: { cbS: 3, cbQuay: 0, cbQ: [[0,0,0]], cbKq: 3 } };
  var DUONG = {
    trieu: (id) => { xoa(); B.deck = [id]; return trieu(B, true, id); },
    ghep: (id) => { xoa(); B.deck = [id]; const a = dat(0, 'lien', 2), b = dat(1, 'lien', 2); return ghep(B, a, b); },
    copycat: (id) => { xoa(); const X = dat(1, id, 3, GOC[id]); const C = dat(0, 'saochep', 3); ghep(B, C, X); const N = B.t[0]; return N && N.id === id && N.banSao ? N : null; },
    twin: (id) => { xoa(); B.deck = [id]; return sinhDoi(B, 2, 7); },
    cloner: (id) => { xoa(); B.deck = [id]; const a = dat(0, 'nhanban', 2), b = dat(1, 'nhanban', 2); ghep(B, a, b); return B.t.find((T, o) => T && o !== 1) || null; },
    reinforce: (id) => { xoa(); B.deck = [id]; return CH.env().trieu(B); },
    bien: (id) => { xoa(); const X = dat(4, 'lien', 2); return chuyenU(B, X, id, 2, false); }, // Hộp Bí Ẩn / Evolver / Scrambler
    trum: (id) => { xoa(); B._trN = (B._trN | 0) + 1; const N = sinhR(taoU(B, id, 2, 5), rngHat(G.hat * 7 + B._trN * 31)); B.t[5] = N; return N; }, // Mad Crown / Genesis (sinhR)
    ai: (id) => { xoa(); B.deck = [id]; B.ai = true; B.mana = 1e6; B.gia = 1; aiBan(B, 1); B.ai = false; return B.t.find(T => T) || null; },
  };`); return R; };

const N = 120, ID = ['canon', 'bienmau', 'vughep', 'soi', 'loren', 'cobac'], DUONG = ['trieu', 'ghep', 'copycat', 'twin', 'cloner', 'reinforce', 'bien', 'trum', 'ai'];
const chay = (hat, id, d) => { const ctx = moiTruong(false), R = NAP(ctx, hat); ctx._id = id; ctx._du = d; return R(`(() => { const r = []; for (let i = 0; i < ${N}; i++) { const T = DUONG[_du](_id); r.push(T && T.id === _id ? DANG(T) : null); } return r; })()`); };

console.log('1 · mỗi ụ ngẫu nhiên × mỗi đường xuất hiện: phân bố ngẫu nhiên + tất định');
const nguon = { canon: '15/2', bienmau: '0/5', vughep: 'G', soi: 'A', loren: 'toc' };
for (const id of ID) for (const d of DUONG) {
  let a, b, c; try { a = chay(4242, id, d); b = chay(4242, id, d); c = chay(777, id, d); } catch (e) { ok(false, id + ' × ' + d, 'lỗi ' + e.message); continue; }
  const co = a.filter(x => x != null), kd = new Set(co);
  if (!co.length) { ok(d === 'ai', id + ' × ' + d + ': không sinh được ụ', JSON.stringify(a.slice(0, 5))); continue; }
  const tatDinh = JSON.stringify(a) === JSON.stringify(b), khacHat = JSON.stringify(a) !== JSON.stringify(c);
  let dung = kd.size >= 2 && tatDinh && khacHat, chi = 'dạng: ' + [...kd].slice(0, 6).join(',') + ' · tất định ' + tatDinh + ' · hạt khác → chuỗi khác ' + khacHat;
  if (nguon[id] && d === 'copycat') { const giong = co.filter(x => x === nguon[id]).length; chi += ' · trùng dạng gốc ' + giong + '/' + co.length; if (giong === co.length) dung = false; }
  if (id === 'canon') { const sai = co.filter(x => !/^[1248]\/0$/.test(x)); if (sai.length) { dung = false; chi += ' · SAI (không phải 1 hướng 0 stack): ' + sai[0]; } }
  if (id === 'bienmau') { const sai = co.filter(x => !/^[0-3]\/0$/.test(x)); if (sai.length) { dung = false; chi += ' · SAI cộng dồn: ' + sai[0]; } }
  if (id === 'cobac' && co.includes('KHONG_QUAY')) { dung = false; chi += ' · có bản KHÔNG quay'; }
  if (id === 'vughep' || id === 'soi') { const p = co.filter(x => x !== 'n').length / co.length, mo = id === 'vughep' ? [0.02, 0.3] : [0.12, 0.5]; chi += ' · tỉ lệ ' + Math.round(p * 100) + '%'; if (p < mo[0] || p > mo[1]) dung = false; }
  ok(dung, id + ' × ' + d + ' (' + co.length + ' lần)', chi);
}

console.log('2 · Copycat chép: La Bàn NSWE + stack → 1 hướng mới 0 stack · Prism → màu mới · Copycat không tự quay Math.random');
{ const ctx = moiTruong(false), R = NAP(ctx, 99);
  R('xoa(); var X = dat(1, "canon", 3, { hb: 15, cmC: 7 }), C = dat(0, "saochep", 3); ghep(B, C, X);');
  ok(R('B.t[0].id === "canon" && B.t[0].banSao && [1,2,4,8].includes(B.t[0].hb) && B.t[0].cmC === 0 && X.hb === 15 && X.cmC === 7'), 'NSWE stack 7 → bản sao 1 hướng, 0 stack; gốc giữ nguyên', R('JSON.stringify([B.t[0].hb, B.t[0].cmC])'));
  const mau = new Set(); for (let i = 0; i < 40; i++) mau.add(R('(() => { xoa(); const X = dat(1, "bienmau", 2, { pm: 2, pms: 9 }), C = dat(0, "saochep", 2); ghep(B, C, X); return B.t[0].pm + "/" + B.t[0].pms; })()'));
  ok(mau.size === 4 && [...mau].every(x => /\/0$/.test(x)), 'Prism LAM 9 cộng dồn → bản sao ra đủ 4 màu, 0 cộng dồn', [...mau].join(','));
  R('xoa(); var A = dat(1, "lien", 2), C = dat(0, "saochep", 2, { aurora: 5, epxung: 0.3 }); ghep(B, C, A);');
  ok(R('B.t[0].aurora === 5 && Math.abs(B.t[0].epxung - 0.3) < 1e-9'), 'buff KHÔNG ngẫu nhiên trên thân Copycat (Aurora, Overclock) vẫn giữ');
  ok(!/Math\.random/.test(R('SKILLS.vughep.sinh.toString() + SKILLS.soi.sinh.toString() + SKILLS.canon.sinh.toString() + SKILLS.bienmau.sinh.toString() + SKILLS.loren.sinh.toString()')), 'mọi hook quay lúc sinh dùng rngHat (không Math.random)');
  ok(/roll anew/.test(R('SKILLS.saochep.mo(null)')), 'chữ kỹ năng Copycat: "random traits … roll anew"', R('SKILLS.saochep.mo(null)'));
}

console.log('3 · ONLINE: máy chủ bàn → gói thật → bàn con rối ra CÙNG dạng');
{ const H = moiTruong(true), P = moiTruong(true), RH = NAP(H, 31337, 'coop'), RP = NAP(P, 31337, 'coop');
  const goi = []; H._goi = goi;
  RH('ONS.on = true; ONS.seed = 31337; ONS.gui = (k, d) => _goi.push({ k, d: JSON.parse(JSON.stringify(d)) }); ONS.boc();');
  RP('ONS.on = true; ONS.seed = 31337; var B1 = G.ban[1]; B1.net = true;');
  const dongBo = () => { const s = RH('B.t.map(T => ONS.oTT(T))'); P._s = s; RP('B1.t.fill(null); _s.forEach((x, o) => { if (x) ONS.datO(B1, o, x); });'); }; // ảnh chụp
  const phat = () => { for (const g of goi.splice(0)) { P._g = g.d; if (g.k === 'tr') RP('ONS.apTrieu(B1, _g)'); if (g.k === 'gh') RP('ONS.apGhep(B1, _g)'); } };
  const so = (o) => [RH(`DANG(B.t[${o}])`), RP(`(() => { const T = B1.t[${o}]; if (!T) return null; const D = T.id === 'cobac' ? (T.cbS > 0 ? 'z' + T.cbS : 'cho') : DANG(T); return D; })()`)];
  let lech = [], n = 0;
  for (const id of ['canon', 'bienmau', 'vughep', 'soi', 'loren']) for (let i = 0; i < 12; i++) {
    RH(`xoa(); B.deck = [${JSON.stringify(id)}];`); dongBo(); RH('var T = trieu(B, true); var oT = T.o;'); phat(); n++;
    const o = RH('oT'), [h, p] = so(o); if (h !== p) lech.push('tr ' + id + ' ' + h + '≠' + p);
    RH(`xoa(); B.deck = [${JSON.stringify(id)}]; dat(0, 'lien', 2); dat(1, 'lien', 2);`); dongBo(); RH('ghep(B, B.t[0], B.t[1]);'); phat(); n++;
    { const [h2, p2] = so(1); if (h2 !== p2) lech.push('gh ' + id + ' ' + h2 + '≠' + p2); }
    RH(`xoa(); dat(1, ${JSON.stringify(id)}, 3, GOC[${JSON.stringify(id)}]); dat(0, 'saochep', 3);`); dongBo(); RH('ghep(B, B.t[0], B.t[1]);'); phat(); n++;
    { const [h3, p3] = so(0); if (h3 !== p3) lech.push('copy ' + id + ' ' + h3 + '≠' + p3); }
    RH(`xoa(); B.deck = [${JSON.stringify(id)}]; dat(0, 'sinhdoi', 2); dat(1, 'sinhdoi', 2);`); dongBo(); RH('ghep(B, B.t[0], B.t[1]); var oTw = B.t.findIndex((T, o) => T && o !== 1);'); phat(); n++;
    { const o2 = RH('oTw'); if (o2 >= 0) { const [h4, p4] = so(o2); if (h4 !== p4) lech.push('twin ' + id + ' ' + h4 + '≠' + p4); } }
  }
  ok(!lech.length, 'triệu hồi / ghép / Copycat / Twin × 5 ụ: ' + n + ' gói, dạng 2 máy khớp', lech.slice(0, 4).join(' | '));
  // Lucky Slot: bàn con rối không tự quay, chờ gói 'cb' (máy chủ bàn quay khi bản sao xuất hiện)
  RH('xoa(); dat(1, "cobac", 3, GOC.cobac); dat(0, "saochep", 3);'); dongBo(); RH('ghep(B, B.t[0], B.t[1]); SKILLS.cobac.capNhat(G, B, B.t[0], 0);');
  const cb = goi.filter(g => g.k === 'cb'); phat(); for (const g of cb) { P._g = g.d; RP('ONS.apCB(B1, _g)'); }
  ok(cb.length === 1 && RH('JSON.stringify(B.t[0].cbQ)') === RP('JSON.stringify(B1.t[0] && B1.t[0].cbQ)'), 'Lucky Slot bản sao: máy chủ quay 1 lần, bàn con rối phát lại đúng chuỗi', cb.length + ' ' + RP('JSON.stringify(B1.t[0] && B1.t[0].cbQ)'));
  // ảnh chụp khứ hồi giữ mọi dạng
  RH('xoa(); dat(0, "canon", 2, { hb: 8, cmC: 0 }); dat(1, "bienmau", 2, { pm: 3 }); dat(2, "vughep", 2, { vang: true }); dat(3, "soi", 2, { thuc: true }); dat(4, "loren", 2, { dang: "toc" });'); dongBo();
  ok([0, 1, 2, 3, 4].every(o => { const [h, p] = so(o); return h === p; }), 'ảnh chụp oTT → datO giữ đủ dạng (hướng, màu, vàng, thức tỉnh, dạng Anvil)');
}
console.log(loi ? '✗ thap-kt-ngau-nhien-sinh: ' + loi + ' lỗi' : '✓ thap-kt-ngau-nhien-sinh: xanh');
process.exit(loi ? 1 : 0);
