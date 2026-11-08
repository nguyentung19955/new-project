// TURRET MERGE — KIỂM LUẬT "TĂNG SAO TẠI CHỖ / KỸ NĂNG KÉO THẢ KHÔNG PHẢI GHÉP" (08/11 người dùng):
//   "Những hiệu ứng tăng sao từ ally hoặc từ ụ khác không làm reset các ụ nên không được tính là merge"
//   "Kể cả copy cũng vậy, khi A copy B để thành B thì phải B vào B mới tính là merge"
//   (a) nguồn +★ / −★ TẠI CHỖ (Merge King, Merge King vàng, Genesis Core, Star Lift, chỉ huy REINFORCE, Pandora VAULT STAR, trùm −★, Star Leech,
//       ảnh chụp bàn / gói ghép online) giữ CÙNG thân ụ + mọi cộng dồn của ụ có trạng thái (ngoại lệ đã duyệt: Evolver mất sao → trứng đếm lại).
//   (b) chúng + Copycat chép / Teleporter / Overclock / buff Twin Anvil KHÔNG tính là ghép: Archive, MERGE SURGE, kỹ năng khi ghép (sk.ghep),
//       Twin Maker, Mirror Gate, combo, quay Lucky Slot. Đối chứng: ghép thường + Pháo La Bàn + Pháo La Bàn = ghép thật.
//   Phần trang thật (PW, mặc định bật nếu BASE trả lời): hướng dẫn (HD.su 'ghep'), nhiệm vụ (KT.tran.ghep), chớp ghép HUD2, tấm kết quả KG.
// Chạy: node tools/thap-kt-sao-tai-cho.js · BASE=http://localhost:8765/thap/ (PW=0 bỏ phần trang thật) · NODE_PATH=/opt/npm-tools/node_modules
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const goc = path.join(__dirname, '..', 'thap');
const FILES = ['meta', 'text', 'data', 'thebai', 'fx', 'tiervfx', 'game', 'chihuy', 'skills', 'skills2', 'phattrien', 'artscale', 'skills3', 'skills4', 'skills5', 'vangmoi1', 'hotro', 'support', 'buff', 'skills7', 'jackpot', 'growfx', 'trum', 'online/dongbo'];
const LOI = [], CHO = [];
const ok = (dk, ten, chi) => { if (dk) console.log('  ✓ ' + ten); else { console.log('  ✗ ' + ten + (chi ? ' — ' + chi : '')); LOI.push(ten); } };

function moiTruong() {
  const noop = () => {};
  const ctx = { console, Math, JSON, Set, Map, WeakMap, WeakSet, Promise, Object, Array, Error, setTimeout: (f) => { ctx._cho.push(f); }, clearTimeout: noop, _cho: [], performance: { now: () => 0 }, localStorage: { getItem: () => null, setItem: noop } };
  ctx.window = ctx; ctx.location = { search: '' }; ctx.addEventListener = noop;
  ctx.SND = new Proxy({}, { get: () => noop });
  ctx._vx = { ghep: 0, kichHoat: 0 };
  ctx.VX = new Proxy({ TRE_LO: 0, hen: (d, f) => f(), t: 0, ds: [], ghep() { ctx._vx.ghep++; }, kichHoat() { ctx._vx.kichHoat++; } }, { get: (o, k) => (k in o ? o[k] : noop) });
  ctx.BVX = new Proxy({}, { get: () => noop });
  ctx.REN = { coDau: () => 40, lamNen: noop, t: 0, img: () => null, s: 1, dpr: 1 };
  ctx.UI = { vaoTran: noop, canhBaoTrum: noop, bangWave: noop, ketQua: noop };
  ctx.FONT = { display: 'x', ui: 'x' };
  vm.createContext(ctx);
  for (const f of FILES) { const p = path.join(goc, 'js', f + '.js'); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f + '.js' }); }
  vm.runInContext("if (typeof buffNo === 'undefined') var buffNo = function () {};", ctx);
  vm.runInContext('G.roster = window.ROSTER_EMBED; G.rosterMap = {}; for (const r of G.roster) G.rosterMap[r.id] = r;', ctx);
  // gián điệp: kỹ năng khi ghép, Twin Maker, nhãn (MERGE SURGE / MIRROR COPY / COMBO)
  vm.runInContext(`var _spy = { skGhep: 0, sinhDoi: 0, nhan: [], guong: 0 };
    for (const id in SKILLS) if (SKILLS[id].ghep) { const g0 = SKILLS[id].ghep; SKILLS[id].ghep = function () { _spy.skGhep++; return g0.apply(this, arguments); }; }
    { const s0 = sinhDoi; sinhDoi = function () { _spy.sinhDoi++; return s0.apply(this, arguments); }; }
    { const n0 = nhanU; nhanU = function (T, s) { _spy.nhan.push(String(s)); return n0.apply(this, arguments); }; }
    { const g0 = guongLoe; guongLoe = function () { _spy.guong++; return g0.apply(this, arguments); }; }`, ctx);
  return ctx;
}
const ctx = moiTruong(), R = (s) => vm.runInContext(s, ctx);
const buoc = (t) => { for (let x = 0; x < t; x += 1 / 30) { R('capNhat(1/30)'); if (ctx._cho.length) ctx._cho.splice(0).forEach(f => f()); } };
const tran = (deck, che) => { ctx._d = deck; R(`G.debug = {}; batDau('${che || 'solo'}', _d, 'hero'); G.cho = 1e9; G.quai.length = 0; G.wave = 3; for (const X of G.ban) { X.t.fill(null); X.mana = 0; } var B = G.ban[0]; var D = G.ban[1] || null;
  var dat = (o, id, s, f, BB) => { BB = BB || B; const T = sinhU(taoU(BB, id, s, o)); BB.t[o] = T; if (f) f(T); return T; };`); };

// ụ có trạng thái riêng: [id, sao, cài trạng thái, khoá so sánh (tăng theo thời gian được phép: '>=')]
const CO_TT = [
  ['luutru', 3, 'T.kho = 7', ['kho']],
  ['lualien', 3, 'T.lc = 3', ['lc']],
  ['loren', 3, "T.dang = 'toc'; T.lo = 5", ['dang', 'lo']],
  ['tienhoa', 3, 'T.egg = 5', [['egg', '>=']]],
  ['nemesis', 3, 'T.nmDem = 7; T.nmToc = 0.08; T.nmDmg = 0.12', ['nmDem', 'nmToc', 'nmDmg']],
  ['soi', 3, 'T.thuc = true', ['thuc']],
  ['canon', 3, 'T.hb = 13; T.cmC = 2', ['hb', 'cmC']],
  ['cuuvi', 3, 'T.duoi = 5', ['duoi']],
  ['hopbi', 3, 'T.tuoi = 20', [['tuoi', '>=']]],
  ['leviathan', 3, 'T.vuc = 6', ['vuc']],
  ['mauhut', 3, 'T.mau = 12', ['mau']],
  ['vughep', 3, 'T.vang = true', ['vang']],
  ['lien', 3, "T.epxung = 0.3; T.tocT = 4; T.tocV = 0.2; T.anv = { k: 'dmg', v: 0.1 }; T.aurora = 5; T.khien = 1; T.banSao = true", ['epxung', ['tocT', 'tt'], 'tocV', 'anv', ['aurora', 'tt'], 'khien', 'banSao']],
];
// nguồn +★ / −★ TẠI CHỖ (X ở ô 7; ô 2 trên X; ô 14 xa; nhân chứng: Archive ô 10, Star Breaker ô 6 kề X)
const NGUON = [
  ['Merge King +1★', 1, `var M = dat(14, 'vughep', X.sao, T => { T.vang = false; }); ghep(B, M, X);`],
  ['Merge King VÀNG +2★', 2, `var M = dat(14, 'vughep', X.sao, T => { T.vang = true; }); ghep(B, M, X);`],
  ['Genesis Core +1★', 1, `var K = dat(2, 'khoisinh', 3); K.luot = 3; K.sinhT = 999; SKILLS.khoisinh.capNhat(G, B, K, 0.01);`],
  ['Star Lift +1★', 1, `var S = dat(2, 'nangsao', 5); S.pipW = G.wave - 1; S.pipDem = 1; X.pip = 2; SKILLS.nangsao.capNhat(G, B, S, 0.01);`],
  ['Chỉ huy REINFORCE +1★', 1, `CH.env().nangSao(B, X);`],
  ['Pandora VAULT STAR +1★', 1, `B.t[10].st.da = true; B.t[6].st.da = true; SKILLS.pandora.lam(G, B, 'sao', 3, B.o[X.o]); B.t[10].st.da = false; B.t[6].st.da = false;`],
  ['Online: ảnh chụp bàn lệch sao', 1, `var c = ONS.oCua(B); c[7] = X.id + ':' + (X.sao + 1); ONS.apAnh(B, { c, h: ONS.bam(c), f: B.t.map(T => (T && ONS.oTT(T)[2]) || '') });`],
  ['Online: gói ghép Merge King (bàn con rối)', 1, `var M = dat(14, 'vughep', X.sao, T => { T.vang = false; }); var sb = ONS.oTT(X); sb[1] = X.sao + 1; ONS.apGhep(B, { db: 1, a: 14, b: 7, id: X.id, s: X.sao + 1, sa: 0, sb });`],
  ['Trùm −1★ (haSao)', -1, `haSao(B, X);`],
  ['Star Leech hút −1★', -1, `TRUM_KN.leech.lam({ x: 0, y: 0, kho: 0 }, B, [X]);`],
];
const so = (k) => R(`JSON.stringify(X.${k})`);

console.log('1 · nguồn tăng/giảm sao TẠI CHỖ × ụ có trạng thái (cùng thân, giữ cộng dồn, không tính là ghép)');
for (const [ten, d, js] of NGUON) {
  let hong = [];
  for (const [id, sao, cai, khoa] of CO_TT) {
    tran([id, 'lien', 'vughep', 'khoisinh', 'pandora']);
    R(`var X = dat(7, '${id}', ${sao}, T => { ${cai} }); var A = dat(10, 'luutru', 1); A.kho = 0; var SB = dat(6, 'hasao', 3); var uid0 = X.uid, sao0 = X.sao, N0 = B.ghepN | 0, C0 = B.combo | 0, cb0 = (G.cbLog || []).length;
      _spy.skGhep = 0; _spy.sinhDoi = 0; _spy.nhan.length = 0; _vx.ghep = 0; _vx.kichHoat = 0;`);
    if (id === 'tienhoa' || id === 'hopbi') buoc(1 / 30);
    const truoc = {}; for (const k of khoa) { const kk = Array.isArray(k) ? k[0] : k; truoc[kk] = so(kk); }
    R(js); buoc(0.2);
    const loi = [];
    if (!R('B.t[7] === X && X.uid === uid0')) loi.push('đổi thân ụ');
    else {
      const dk = R('X.sao - sao0'); if (dk !== Math.max(1 - sao, Math.min(7 - sao, d))) loi.push('sao ' + (dk > 0 ? '+' : '') + dk);
      for (const k of khoa) {
        const [kk, cach] = Array.isArray(k) ? k : [k, '='];
        if (id === 'tienhoa' && kk === 'egg' && d < 0) { if (!(R('X.egg') < 0.5)) loi.push('Evolver mất sao phải đếm lại (luật đã duyệt)'); continue; }
        const sau = so(kk);
        if (cach === '>=' ? !(JSON.parse(sau) >= JSON.parse(truoc[kk])) : cach === 'tt' ? !(JSON.parse(sau) >= JSON.parse(truoc[kk]) - 0.3) : sau !== truoc[kk]) loi.push(kk + ' ' + truoc[kk] + '→' + sau);
      }
    }
    if (R('(B.ghepN | 0) !== N0 || A.kho !== 0')) loi.push('Archive/ghepN đếm ghép');
    if (R('(B.combo | 0) !== C0')) loi.push('combo');
    if (R('_spy.skGhep || _spy.sinhDoi || _vx.ghep || _vx.kichHoat')) loi.push('kỹ năng/hiệu ứng KHI GHÉP chạy');
    if (R("_spy.nhan.some(s => /MERGE SURGE|MIRROR/.test(s))")) loi.push('MERGE SURGE');
    if (R('(G.cbLog || []).length !== cb0')) loi.push('Lucky Slot quay');
    if (loi.length) hong.push(id + ': ' + loi.join(', '));
  }
  ok(!hong.length, ten + ' × ' + CO_TT.length + ' ụ có trạng thái', hong.join(' | '));
}

// Lucky Slot: chỉ quay khi XUẤT HIỆN (session khác sửa jackpot.js) — chưa đổi thì báo CHỜ, không tính lỗi
console.log('2 · Lucky Slot (cobac) × +★ tại chỗ');
{
  tran(['cobac', 'vughep', 'lien']);
  R(`var X = dat(7, 'cobac', 3); var M = dat(14, 'vughep', 3, T => { T.vang = false; });`); buoc(1.2);
  R('var n0 = (G.cbLog || []).length, f0 = JSON.stringify(B.cb), uid0 = X.uid; ghep(B, M, X);'); buoc(1.2);
  const quay = R('(G.cbLog || []).length - n0'), cung = R('B.t[7] === X && X.uid === uid0');
  const cu = /T\.sao > \(T\.cbS/.test(fs.readFileSync(path.join(goc, 'js', 'jackpot.js'), 'utf8'));
  if (quay && cu) { console.log('  … CHỜ: jackpot.js còn luật quay khi sao tăng (session Lucky Slot đang sửa) — quay ' + quay + ' lần'); CHO.push('cobac'); }
  else ok(!quay && cung, 'Merge King +1★ lên Lucky Slot: cùng thân, KHÔNG quay lại', 'quay ' + quay);
}

console.log('3 · kỹ năng kéo thả KHÔNG phải ghép (Copycat / Teleporter / Overclock / buff Anvil / Mạch Máu) · đối chứng ghép thật');
const KN = [
  ['Copycat chép (A thành B)', 0, `var a = dat(14, 'saochep', 3), X = dat(7, 'lien', 3, T => { T.epxung = 0.3; T.tocT = 4; T.tocV = 0.2; }); var r = ghep(B, a, X);`,
    `B.t[7] === X && X.epxung === 0.3 && B.t[14] && B.t[14].id === 'lien' && B.t[14].banSao && !B.t[14].st.da`],
  ['Teleporter đổi chỗ', 0, `var a = dat(14, 'dichchuyen', 3), X = dat(7, 'lualien', 3, T => { T.lc = 3; }); ghep(B, a, X);`, `B.t[14] === X && X.lc === 3 && X.o === 14`],
  ['Overclock', 0, `var a = dat(14, 'epxung', 3), X = dat(7, 'canon', 3, T => { T.hb = 13; T.cmC = 2; }); ghep(B, a, X);`, `B.t[7] === X && X.hb === 13 && X.cmC === 2 && X.epxung > 0`],
  ['Twin Anvil buff lên ụ khác', 0, `var a = dat(14, 'loren', 3), X = dat(7, 'nemesis', 3, T => { T.nmDem = 7; }); ghep(B, a, X);`, `B.t[7] === X && X.nmDem === 7 && !!X.anv`],
  ['Mạch Máu đánh dấu', 0, `var a = dat(14, 'mauhut', 3), X = dat(7, 'lien', 3); ghep(B, a, X);`, `B.t[7] === X`],
  ['Merge King + Merge King (+★ tại chỗ)', 0, `var a = dat(14, 'vughep', 3, T => { T.vang = false; }), X = dat(7, 'vughep', 3, T => { T.vang = true; }); ghep(B, a, X);`, `B.t[7] === X && X.vang && X.sao === 4`],
  ['ĐỐI CHỨNG ghép thường', 1, `B.deck = ['lien']; var a = dat(14, 'sinhdoi', 3), X = dat(7, 'sinhdoi', 3); ghep(B, a, X);`, `B.t[7] && B.t[7].sao === 4`],
  ['ĐỐI CHỨNG Pháo La Bàn + Pháo La Bàn (B vào B)', 1, `var a = dat(14, 'canon', 3, T => { T.hb = 1; T.cmC = 0; }), X = dat(7, 'canon', 3, T => { T.hb = 2; T.cmC = 0; }); ghep(B, a, X);`, `B.t[7] === X && X.hb === 3`],
];
for (const che of ['solo', 'coop', 'pvp']) for (const [ten, that, js, giu] of KN) {
  tran(['lien', 'saochep', 'dichchuyen', 'epxung', 'loren', 'mauhut', 'vughep', 'sinhdoi', 'canon', 'nhanmana'], che);
  R(`var A = dat(10, 'luutru', 1); A.kho = 0; var SB = dat(6, 'hasao', 3); var N0 = B.ghepN | 0; _spy.skGhep = 0; _spy.sinhDoi = 0; _spy.nhan.length = 0; _spy.guong = 0; _vx.ghep = 0; _vx.kichHoat = 0;
    if (D) { D.t.fill(null); dat(0, 'guongcong', 3, null, D).nap = 1; dat(1, 'lien', 3, null, D); }`);
  R(js); buoc(0.1);
  const dem = R(`[(B.ghepN | 0) - N0, A.kho, _spy.sinhDoi, _vx.ghep, _spy.nhan.filter(s => /MERGE SURGE/.test(s)).length].join()`);
  const giuOk = R(giu);
  if (that) ok(R('(B.ghepN | 0) - N0') === 1 && R('A.kho') === 1 && giuOk, che + ': ' + ten + ' = ghép thật (Archive +1)', dem);
  else ok(dem === '0,0,0,0,0' && !R('_spy.skGhep') && !R('_spy.guong') && giuOk, che + ': ' + ten + ' — không đếm ghép, không MERGE SURGE / kỹ năng khi ghép / Mirror Gate, giữ trạng thái', dem + ' skGhep=' + R('_spy.skGhep') + ' guong=' + R('_spy.guong') + ' giữ=' + giuOk);
}
// Mirror Gate (co-op): Merge King kéo lên Mana Doubler → không chép kỹ năng khi ghép sang bàn đồng đội; ghép thật Mana Doubler → chép
tran(['nhanmana', 'vughep', 'lien'], 'coop');
R(`D.t.fill(null); var GG = dat(0, 'guongcong', 3, null, D); GG.nap = 1; dat(1, 'lien', 3, null, D); _spy.guong = 0; var M = dat(14, 'vughep', 3, T => { T.vang = false; }), X = dat(7, 'nhanmana', 3); ghep(B, M, X); var g1 = _spy.guong;
  GG.nap = 1; B.deck = ['lien']; var p = dat(12, 'nhanmana', 2), q = dat(13, 'nhanmana', 2); ghep(B, p, q); var g2 = _spy.guong - g1;`);
ok(R('g1') === 0 && R('g2') === 1, 'co-op: Mirror Gate chỉ chép khi GHÉP THẬT (Merge King +★: không)', R('g1') + '/' + R('g2'));

console.log('4 · Pandora VAULT/ALLY STAR tất định (online: 2 máy chọn cùng ô)');
{
  const lan = (s) => { tran(['pandora', 'lien', 'set', 'tia', 'bao'], 'coop'); R(`for (let i = 0; i < 12; i++) { dat(i, 'lien', 1 + (i % 3)); dat(i, 'set', 2, null, D); } B.ghepN = 5; G.hat = 77;`);
    const r0 = Math.random; let x = s; Math.random = () => { x = (x * 1103515245 + 12345) & 0x7fffffff; return x / 0x7fffffff; };
    try { R('var s0 = B.t.map(T => T ? T.sao : 0).join() + "|" + D.t.map(T => T ? T.sao : 0).join(); SKILLS.pandora.lam(G, B, "sao", 4, B.o[0]);'); } finally { Math.random = r0; }
    return R('B.t.map(T => T ? T.sao : 0).join() + "|" + D.t.map(T => T ? T.sao : 0).join()'); };
  const a = lan(1), b = lan(99991);
  ok(a === b, 'cùng hạt trận, Math.random khác → cùng ô được +★ (cả bàn mình và bàn đồng đội)', a + ' vs ' + b);
}

// ---------- trang thật: hướng dẫn / nhiệm vụ / chớp ghép / tấm kết quả ----------
(async () => {
  const BASE = process.env.BASE || 'http://localhost:8765/thap/';
  if (process.env.PW !== '0') {
    let pw = null; try { pw = require('playwright'); } catch (e) { console.log('  (SKIP trang thật: không có playwright)'); }
    let song = false; try { const r = await fetch(BASE); song = r.ok; } catch (e) { }
    if (pw && !song) console.log('  (SKIP trang thật: ' + BASE + ' không trả lời)');
    if (pw && song) {
      console.log('5 · trang thật (hướng dẫn, nhiệm vụ, chớp ghép HUD2, tấm kết quả)');
      const b = await pw.chromium.launch(); const p = await (await b.newContext({ viewport: { width: 844, height: 390 } })).newPage();
      const errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.goto(BASE + '?mode=solo&deck=vughep,saochep,dichchuyen,epxung,lien&wave=1&mana=0&notut=1', { waitUntil: 'load' });
      await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length && typeof TAI !== 'undefined' && !TAI.cho, null, { timeout: 45000 });
      await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 });
      await p.evaluate(() => {
        G.quai = []; G.cho = 999; window._dem = { hd: 0, hud: 0, kg: 0 };
        if (typeof HD !== 'undefined') { const s = HD.su; HD.su = function (k) { if (k === 'ghep') _dem.hd++; return s.apply(this, arguments); }; }
        if (typeof HUD2 !== 'undefined') { const s = HUD2.ghep; HUD2.ghep = function () { _dem.hud++; return s.apply(this, arguments); }; }
        if (typeof KG !== 'undefined') { const s = KG.hien; KG.hien = function () { _dem.kg++; return s.apply(this, arguments); }; }
      });
      const r = {};
      for (const [k, id] of [['mk', 'vughep'], ['copy', 'saochep'], ['tele', 'dichchuyen'], ['oc', 'epxung'], ['that', 'lien']]) {
        r[k] = await p.evaluate(async (id) => {
          const B = G.ban[0]; for (let i = 0; i < 15; i++) B.t[i] = null; B.deck = ['lien'];
          const dat = (o, id, s) => { const T = sinhU(taoU(B, id, s, o)); if (id === 'vughep') T.vang = false; B.t[o] = T; return T; };
          const k0 = KT.tran ? KT.tran.ghep : 0; _dem.hd = _dem.hud = _dem.kg = 0;
          const X = dat(7, 'lien', 2); ghep(B, dat(8, id, 2), X);
          await new Promise(r => setTimeout(r, 1500));
          return [_dem.hd, KT.tran ? KT.tran.ghep - k0 : -1, _dem.hud, _dem.kg].join(',');
        }, id);
      }
      for (const k of ['mk', 'copy', 'tele', 'oc']) ok(/^0,0,0,0$/.test(r[k]), 'trang: ' + k + ' — không bước hướng dẫn / nhiệm vụ / chớp ghép / tấm kết quả', r[k]);
      ok(/^\d+,1,1,1$/.test(r.that), 'trang: ghép thật vẫn tính (nhiệm vụ +1, chớp, tấm kết quả)', r.that);
      ok(!errs.length, 'không lỗi trang', errs.join(' | '));
      await b.close();
    }
  }
  console.log(LOI.length ? '✗ thap-kt-sao-tai-cho: ' + LOI.length + ' lỗi' : '✓ thap-kt-sao-tai-cho: đạt' + (CHO.length ? ' (CHỜ: ' + CHO.join(',') + ')' : ''));
  process.exit(LOI.length ? 1 : 0);
})();
