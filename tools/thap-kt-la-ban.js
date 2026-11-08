// TURRET MERGE — KIỂM PHÁO LA BÀN TỔ HỢP HƯỚNG (người dùng chốt 08/11)
//   Luật: 1 hướng ngẫu nhiên N/S/W/E (tất định theo hạt) · ghép = HỢP hướng (khác sao được) · sao = trung bình làm tròn lên (không +1★)
//   · hợp không thêm hướng → không ghép · NSWE + NSWE → stack = stack 2 bên + 1 (không trần) · mỗi hướng 1 tên lửa đuổi
//   · Merge King giữ tổ hợp, Copycat chép = 1 hướng ngẫu nhiên mới + 0 stack (08/11), Mimic ra ụ ngẫu nhiên, đá chỉ ghép đá · gói online (oTT / datO / apGhep / apTrieu) khứ hồi.
//   Phần 1: luật thuần (vm, không trình duyệt). Phần 2 (Playwright, có thì chạy): gói online + kéo thật bằng chuột + ảnh 844×390 & 390×844.
// Chạy: node tools/thap-kt-la-ban.js   (phần 2 cần python3 -m http.server 8765 ở gốc repo; BASE=… đổi cổng; KHONG_PW=1 bỏ phần 2;
//       SHOTS=thư mục ảnh, mặc định /tmp/shots-la-ban — không commit)
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
const buoc = (t) => { for (let x = 0; x < t; x += 1 / 30) { R('capNhat(1/30)'); if (ctx._cho.length) ctx._cho.splice(0).forEach(f => f()); } };
const tran = (deck, hat) => { ctx._d = deck; R(`G.debug = { seed: ${hat || 777} }; batDau('solo', _d, 'hero'); G.cho = 1e9; G.quai.length = 0; G.dan.length = 0; for (const X of G.ban) { X.t.fill(null); X.mana = 0; } var B = G.ban[0], S = SKILLS.canon;
  var dat = (o, id, s, f) => { const T = sinhU(taoU(B, id, s, o)); B.t[o] = T; if (f) Object.assign(T, f); return T; };
  var cn = (o, hb, s, c) => dat(o, 'canon', s || 1, { hb, cmC: c || 0 });`); };
const N = 1, E = 2, Sx = 4, W = 8;

console.log('1 · hợp hướng + tên');
tran(['canon', 'lien', 'tia', 'set', 'bang']);
ok(R('[1,2,4,8,5,9,3,12,6,10,13,7,11,14,15].map(m => S.ten(m)).join(" ")') === 'N E S W NS NW NE SW SE WE NSW NSE NWE SWE NSWE', '15 tổ hợp đọc theo thứ tự N S W E', R('[1,2,4,8,5,9,3,12,6,10,13,7,11,14,15].map(m => S.ten(m)).join(" ")'));
{ const ds = []; for (let a = 1; a <= 15; a++) for (let b = 1; b <= 15; b++) { R(`var a = cn(0, ${a}, 2), b = cn(1, ${b}, 2)`); const hl = R('hopLeGhep(a, b)'), mong = (a | b) !== a && (a | b) !== b || (a === 15 && b === 15); if (hl !== mong) ds.push(a + '+' + b + '=' + hl); }
  ok(!ds.length, '225 cặp: ghép được ⇔ hợp thêm hướng (hoặc NSWE + NSWE)', ds.slice(0, 8).join(', ')); }
R(`var a = cn(0, ${N}, 1), b = cn(1, ${Sx}, 1), r = ghep(B, a, b)`);
ok(R('r === b && B.t[1] === b && !B.t[0] && b.id === "canon" && b.hb === 5 && b.sao === 1'), 'N 1★ + S 1★ → NS 1★ (giữ thân đích, ô kéo trống, không +1★)', R('JSON.stringify([b.hb, b.sao, !!B.t[0]])'));
for (const [x, y, sa, sb, mh, ms] of [[N, Sx, 3, 4, 5, 4], [5, W, 2, 5, 13, 4], [13, E, 3, 4, 15, 4], [3, 12, 7, 7, 15, 7], [N, W, 1, 6, 9, 4]]) {
  R(`var a = cn(0, ${x}, ${sa}), b = cn(1, ${y}, ${sb}); ghep(B, a, b)`);
  ok(R(`B.t[1] && B.t[1].hb === ${mh} && B.t[1].sao === ${ms} && !B.t[0]`), `${R(`S.ten(${x})`)} ${sa}★ + ${R(`S.ten(${y})`)} ${sb}★ → ${R(`S.ten(${mh})`)} ${ms}★ (trung bình làm tròn lên)`, R('JSON.stringify([B.t[1].hb, B.t[1].sao])'));
}
console.log('2 · ghép KHÔNG hợp lệ');
for (const [x, y] of [[N, N], [5, N], [N, 5], [13, 5], [7, 15], [15, 1]]) {
  R(`var a = cn(0, ${x}, 2), b = cn(1, ${y}, 2), r = ghep(B, a, b)`);
  ok(R('r === null && B.t[0] === a && B.t[1] === b && a.hb === ' + x + ' && b.hb === ' + y), R(`S.ten(${x})`) + ' + ' + R(`S.ten(${y})`) + ': không ghép (ô đứng yên)');
}
console.log('3 · NSWE + NSWE → stack không trần');
R('var a = cn(0, 15, 3, 2), b = cn(1, 15, 4, 0); ghep(B, a, b)'); ok(R('B.t[1].hb === 15 && B.t[1].cmC === 3 && B.t[1].sao === 4'), 'NSWE(2) 3★ + NSWE(0) 4★ → NSWE stack 3, 4★', R('JSON.stringify([B.t[1].cmC, B.t[1].sao])'));
R('var a = cn(0, 15, 7, 40), b = cn(1, 15, 7, 59); ghep(B, a, b)'); ok(R('B.t[1].cmC === 100 && B.t[1].sao === 7'), '7★ + 7★ vẫn ghép được: stack 40 + 59 + 1 = 100 (không trần, sao giữ 7)', R('B.t[1].cmC'));
ok(R('JSON.stringify([0,1,3,7,15,99].map(n => DOTPHA.bac(n, DOTPHA.NGUONG.canon)))') === '[0,1,2,3,4,4]', 'đột phá theo stack 1/3/7/15', R('JSON.stringify([0,1,3,7,15,99].map(n => DOTPHA.bac(n, DOTPHA.NGUONG.canon)))'));
{ const k = R('(() => { const T0 = cn(5, 15, 2, 0), T1 = cn(6, 15, 2, 1), T4 = cn(7, 15, 2, 4); return [S.them(T0), S.them(T1), S.them(T4), S.moiChong(T0)]; })()');
  ok(Math.abs(k[0]) < 1e-9 && Math.abs(k[1] - k[3]) < 1e-9 && Math.abs(k[2] - 4 * k[3]) < 1e-9 && k[3] >= 0.5 && k[3] <= 0.7, 'mỗi stack +' + Math.round(k[3] * 100) + '% ST (cộng thẳng, 4 stack = +' + Math.round(k[2] * 100) + '%)', JSON.stringify(k)); }
ok(R('(() => { const T = cn(5, 15, 5, 2); return Math.abs(S.them(T) - (S.moiChong(T) * 3 + 0.2)) < 1e-9; })()'), '5★ POLE STAR: stack tính ×1.5, +20% ST');

console.log('4 · số tên lửa theo tổ hợp + tên lửa đuổi trúng');
for (const [m, n] of [[N, 1], [W, 1], [5, 2], [10, 2], [13, 3], [14, 3], [15, 4]]) {
  tran(['canon', 'lien', 'tia', 'set', 'bang']); R(`var T = cn(7, ${m}, 3); for (let i = 0; i < 4; i++) { const Q = sinhQuai('bo', 0, 120 + i * 60, 50); Q.vao = 1; } G.dan.length = 0; S.ban(G, B, T, G.quai[0]);`);
  ok(R('G.dan.filter(d => d.dd && d.T === T).length') === n, R(`S.ten(${m})`) + ': ' + n + ' tên lửa', R('G.dan.length'));
}
{ tran(['canon', 'lien', 'tia', 'set', 'bang']); R('var T = cn(7, 15, 3); for (let i = 0; i < 4; i++) { const Q = sinhQuai("bo", 0, 120 + i * 60, 50); Q.vao = 1; } var h0 = G.quai.reduce((s, Q) => s + Q.hp, 0); G.dan.length = 0; S.ban(G, B, T, G.quai[0]); var g0 = G.dan.map(d => d.dd.g);');
  const g0 = R('g0'); ok(JSON.stringify(g0.map(g => Math.round(g * 100) / 100)) === JSON.stringify([-1.57, 0, 1.57, 3.14]), 'phóng ra đúng 4 hướng la bàn N E S W', JSON.stringify(g0));
  for (let i = 0; i < 90 && R('G.dan.some(d => d.dd)'); i++) { R('for (const d of G.dan) d.T = T;'); for (let k = 0; k < 1; k++) { R('for (let i = G.dan.length - 1; i >= 0; i--) if (capNhatDan(G.dan[i], 1/30)) G.dan.splice(i, 1);'); } }
  ok(!R('G.dan.some(d => d.dd)') && R('G.quai.reduce((s, Q) => s + Q.hp, 0) < h0'), 'cả 4 tên lửa rẽ đuổi + nổ trúng quái trong 3 s', R('G.dan.length + " " + (h0 - G.quai.reduce((s, Q) => s + Q.hp, 0))')); }
// tất định: cùng hạt → cùng máu quái sau 4 s chiến đấu
{ const chay = () => { tran(['canon', 'lien', 'tia', 'set', 'bang'], 4242); R('cn(7, 13, 3); cn(2, 15, 2, 3); for (let i = 0; i < 6; i++) { const Q = sinhQuai("bo", 0, 60 + i * 50, 400); Q.vao = 1; }'); buoc(6); return R('JSON.stringify(G.quai.map(Q => Math.round(Q.hp * 1000)))'); };
  // Math.random gieo cùng hạt (online: luật dùng chung RNG lockstep — chí mạng…); tên lửa đuổi chỉ dùng dt + vị trí quái
  const gieo = (f) => { const mr = Math.random; let q = 99; Math.random = () => ((q = (q * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff); try { return f(); } finally { Math.random = mr; } };
  const a = gieo(chay), b = gieo(chay); ok(a === b && a.length > 2, 'trận 6 s cùng hạt: máu quái giống hệt (tất định)', a.slice(0, 80) + ' / ' + b.slice(0, 80)); }

console.log('5 · tất định khi gọi ra (không Math.random)');
{ const goi = (hat, k) => { tran(['canon', 'lien', 'tia', 'set', 'bang'], hat); const mr = Math.random; let q = k; Math.random = () => (q = (q * 0.618 + 0.13) % 1); // Math.random khác nhau mỗi lần → hướng vẫn phải theo hạt
    try { return R('(() => { const r = []; for (let i = 0; i < 12; i++) { const T = sinhU(taoU(B, "canon", 1, i)); r.push(T.hb); } return r.join(","); })()'); } finally { Math.random = mr; } };
  let a, b, c; try { a = goi(11, 0.1); b = goi(11, 0.77); c = goi(12, 0.1); } catch (e) { a = 'lỗi ' + e.message; }
  ok(a === b && /^[1248](,[1248]){11}$/.test(a) && a !== c, 'hướng bốc từ hạt trận (cùng hạt cùng chuỗi, chỉ 1 hướng N/E/S/W)', a + ' | ' + c); }

console.log('6 · tương tác ghép đặc biệt');
tran(['canon', 'vughep', 'saochep', 'mimic', 'dichchuyen']);
R('var b = cn(1, 13, 3, 0), M = dat(0, "vughep", 3, { vang: false }); ghep(B, M, b);'); ok(R('B.t[1] === b && b.sao === 4 && b.hb === 13'), 'Merge King +1★ giữ tổ hợp NSW');
R('var b = cn(1, 15, 4, 5), M = dat(0, "vughep", 4, { vang: false }); ghep(B, M, b);'); ok(R('b.sao === 5 && b.hb === 15 && b.cmC === 5'), 'Merge King giữ NSWE + stack');
R('var b = cn(1, 15, 3, 2), C = dat(0, "saochep", 3); ghep(B, C, b); var k = B.t[0];'); ok(R('k && k.id === "canon" && k.banSao && [1, 2, 4, 8].includes(k.hb) && k.cmC === 0 && B.t[1] === b && b.hb === 15 && b.cmC === 2'), 'Copycat chép NSWE + stack 2 (08/11): bản sao = lần xuất hiện MỚI → 1 hướng ngẫu nhiên, 0 stack; gốc giữ nguyên', R('JSON.stringify([k && k.hb, k && k.cmC])'));
R('var b = cn(1, 9, 3), C = dat(0, "saochep", 3); ghep(B, C, b); var d0 = B.t[0].hb, X = cn(2, 15 & ~d0, 3); ghep(B, B.t[0], X);'); ok(R('B.t[2] && B.t[2].id === "canon" && B.t[2].hb === 15 && !B.t[2].banSao && !B.t[0]'), 'bản sao (1 hướng mới) + Pháo các hướng còn lại: ghép gộp hướng → NSWE ụ THẬT', R('JSON.stringify(B.t[2] && [B.t[2].hb, B.t[2].banSao])'));
R('B.deck = ["lien"]; var b = cn(1, 5, 3), Mi = dat(0, "mimic", 3); ghep(B, Mi, b);'); ok(R('B.t[1] && B.t[1].id === "lien" && B.t[1].sao === 4'), 'Mimic + Pháo La Bàn → ụ ngẫu nhiên +1★ (luật thường)');
R('var b = cn(1, 5, 3), Tp = dat(0, "dichchuyen", 3); ghep(B, Tp, b);'); ok(R('B.t[0] && B.t[0].id === "canon" && B.t[0].hb === 5'), 'Teleporter đổi chỗ: giữ NS');
R('B.deck = ["lien"]; var a = cn(0, 1, 2, 0), b = cn(1, 4, 2, 0); a.st.da = true; b.st.da = true;'); ok(R('hopLeGhep(a, b)') && R('(ghep(B, a, b), B.t[1].st.da && B.t[1].sao === 3)'), 'đá + đá cùng sao: khối đá +1★ (luật đá)');
R('var a = cn(0, 1, 2), b = cn(1, 4, 2); b.st.da = true;'); ok(!R('hopLeGhep(a, b)'), 'Pháo thường không ghép lên Pháo đá');
R('var a = cn(0, 1, 2), b = cn(1, 4, 2); b.st.bang = 9;'); ok(!R('hopLeGhep(a, b)'), 'Pháo thường không ghép lên Pháo băng');
R('var a = cn(0, 1, 2), b = cn(1, 4, 2); a.st.bang = 9;'); ok(!R('hopLeGhep(a, b)'), 'Pháo băng không kéo ghép được');

console.log('7 · AI chọn cặp');
tran(['canon', 'lien', 'tia', 'set', 'bang']);
R('var x1 = cn(0, 1, 2), x2 = cn(1, 1, 2), y = cn(2, 14, 2), z = cn(3, 5, 2); var ts = B.t.filter(Boolean); var kq = aiCapTot(ts, x1, z, (a, b) => hopLeGhep(a, b));');
ok(R('S.hopNhat(kq[0], kq[1]).hb === 15'), 'AI ưu tiên cặp ra NSWE', R('JSON.stringify(kq.map(T => T.hb))'));

// =================================== PHẦN 2: TRÌNH DUYỆT ===================================
async function trinhDuyet() {
  let chromium; try { ({ chromium } = require('playwright')); } catch (e) { console.log('SKIP phần trình duyệt (không có playwright)'); return; }
  const BASE = process.env.BASE || 'http://localhost:8765/thap/', OUT = process.env.SHOTS || '/tmp/shots-la-ban', sleep = (ms) => new Promise(r => setTimeout(r, ms));
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  try {
    for (const [w, h] of [[844, 390], [390, 844]]) {
      console.log('Playwright ' + w + '×' + h);
      const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 }); const errs = [];
      const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
      try { await p.goto(BASE + '?mode=solo&deck=canon,lien,tia,set,vughep&wave=2&mana=0&notut=1', { waitUntil: 'load' }); }
      catch (e) { console.log('SKIP phần trình duyệt (không mở được ' + BASE + ')'); await c.close(); return; }
      await p.waitForFunction(() => typeof G !== 'undefined' && G.roster && G.roster.length && typeof TAI !== 'undefined' && !TAI.cho, null, { timeout: 60000 });
      await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 }); await sleep(900);
      const chup = async (ten) => { const f = path.join(OUT, ten + '-' + w + 'x' + h + '.png'); await p.screenshot({ path: f }); console.log('    ảnh ' + f); };
      // gói online khứ hồi
      if (w === 844) {
        const r = await p.evaluate(() => {
          const B = G.ban[0], o = [];
          for (const [hb, n] of [[1, 0], [5, 0], [13, 0], [15, 0], [15, 7], [15, 123]]) { const T = taoU(B, 'canon', 3, 4); T.hb = hb; T.cmC = n; const s = ONS.oTT(T); const X = { t: [] }; X.t = B.t.slice(); const BB = Object.assign(Object.create(Object.getPrototypeOf(B)), B, { t: B.t.slice() }); ONS.datO(BB, 9, s); o.push([hb, n, BB.t[9].hb, BB.t[9].cmC, s[2]]); }
          // máy bạn: ghép thật trên bàn của họ → gói như dongbo.js gửi (db + sa/sb = oTT 2 ô sau ghép + hn)
          B.t.fill(null); const a = taoU(B, 'canon', 2, 0), bb = taoU(B, 'canon', 4, 1); a.hb = 1; bb.hb = 4; B.t[0] = a; B.t[1] = bb; ghep(B, a, bb);
          const goi = { a: 0, b: 1, id: 'canon', s: B.t[1].sao, giuA: B.t[0] ? 1 : 0, db: 1, sa: ONS.oTT(B.t[0]), sb: ONS.oTT(B.t[1]), hn: [B.t[1].hb, B.t[1].cmC] };
          const B1 = B; B1.t.fill(null); // bàn con rối: dựng lại trạng thái trước ghép rồi áp gói
          B1.t[0] = taoU(B1, 'canon', 2, 0); B1.t[0].hb = 1; B1.t[1] = taoU(B1, 'canon', 4, 1); B1.t[1].hb = 4;
          ONS.apGhep(B1, JSON.parse(JSON.stringify(goi)));
          const g = B1.t[1] && [B1.t[1].hb, B1.t[1].sao, !!B1.t[0]];
          B1.t.fill(null); ONS.apTrieu(B1, { o: 6, id: 'canon', s: 1, f: 1, hu: 8 }); const tr = B1.t[6] && B1.t[6].hb;
          return { o, g, tr };
        });
        ok(r.o.every(([a, n, a2, n2]) => a === a2 && n === n2), 'oTT → datO: tổ hợp + stack khứ hồi đúng (' + r.o.map(x => x[4]).join(' | ') + ')', JSON.stringify(r.o));
        ok(JSON.stringify(r.g) === '[5,3,false]', 'apGhep bàn con rối: N 2★ + S 4★ → NS 3★ như máy bạn', JSON.stringify(r.g));
        ok(r.tr === 8, 'apTrieu: hướng W bốc trên máy bạn', r.tr);
      }
      // bảng 15 tổ hợp (thứ tự N S W E · NS NW NE SW SE WE · NSW NSE NWE SWE · NSWE+3 stack) — ảnh xem tận mắt
      await p.evaluate(() => { const B = G.ban[0]; B.t.fill(null); G.dan.length = 0; G.quai.length = 0;
        [1, 4, 8, 2, 5, 9, 3, 12, 6, 10, 13, 7, 11, 14, 15].forEach((m, o) => { const T = sinhU(taoU(B, 'canon', 3, o)); T.hb = m; T.cmC = m === 15 ? 3 : 0; T.goc = -Math.PI / 2; B.t[o] = T; }); G.dung = true; });
      await sleep(700); await chup('to-hop-15'); await p.evaluate(() => { G.dung = false; });
      // bàn: nhiều tổ hợp + kéo thật
      await p.evaluate(() => {
        const B = G.ban[0]; B.t.fill(null); G.dan.length = 0;
        const d = (o, hb, s, n) => { const T = sinhU(taoU(B, 'canon', s, o)); T.hb = hb; T.cmC = n || 0; B.t[o] = T; T.goc = -Math.PI / 2; return T; };
        d(0, 1, 2); d(1, 4, 2); d(2, 5, 3); d(3, 13, 3); d(4, 15, 4, 3); d(5, 10, 2); d(6, 2, 1); d(7, 8, 2); d(8, 15, 5, 7); d(9, 14, 3); d(10, 1, 3); d(11, 7, 2); d(12, 6, 4); d(13, 9, 1); d(14, 11, 2);
        G.cho = 0;
      });
      await p.evaluate(() => { for (let t = 0; t < 2.5; t += 1 / 30) capNhat(1 / 30); }); await sleep(400); await chup('tran-to-hop');
      const cell = (o) => p.evaluate((o) => { const c = G.ban[0].o[o], rr = document.querySelector('#cv').getBoundingClientRect(); return [rr.left + c.x / W * rr.width, rr.top + c.y / H * rr.height]; }, o);
      const keo = async (a, z, giu) => { const [x0, y0] = await cell(a), [x1, y1] = await cell(z); await p.mouse.move(x0, y0); await p.mouse.down(); for (let k = 1; k <= 10; k++) await p.mouse.move(x0 + (x1 - x0) * k / 10, y0 + (y1 - y0) * k / 10); if (giu) await giu(); await p.mouse.up(); await sleep(350); };
      // kéo N (ô 0) lên S (ô 1) — hợp lệ; chụp lúc đang giữ trên ô đích (tấm đáy ô hiện kết quả NS)
      await keo(0, 1, async () => { await sleep(250); await chup('keo-n-len-s'); });
      let r = await p.evaluate(() => { const B = G.ban[0]; return [!!B.t[0], B.t[1] && B.t[1].hb, B.t[1] && B.t[1].sao]; });
      ok(JSON.stringify(r) === '[false,5,2]', 'kéo chuột N 2★ → S 2★: ô 1 = NS 2★, ô 0 trống', JSON.stringify(r));
      // kéo N (ô 10) lên NS (ô 1) — không hợp lệ: không đổi gì
      await keo(10, 1); r = await p.evaluate(() => { const B = G.ban[0]; return [B.t[10] && B.t[10].hb, B.t[1] && B.t[1].hb]; });
      ok(JSON.stringify(r) === '[1,5]', 'kéo chuột N lên NS: không ghép (cả 2 đứng yên)', JSON.stringify(r));
      // NSWE + NSWE thật bằng chuột
      await keo(4, 8); r = await p.evaluate(() => { const T = G.ban[0].t[8]; return T && [T.hb, T.cmC, T.sao, !G.ban[0].t[4]]; });
      ok(JSON.stringify(r) === '[15,11,5,true]', 'kéo chuột NSWE(3) 4★ → NSWE(7) 5★: stack 11, sao 5', JSON.stringify(r));
      await p.evaluate(() => { for (let t = 0; t < 1.2; t += 1 / 30) capNhat(1 / 30); }); await sleep(300); await chup('tran-sau-ghep');
      // tên lửa đuổi đang bay (quái rải khắp đường): dừng game, phóng 1 loạt từ NSWE ô 8 + NS ô 1, chạy 0,25 s
      r = await p.evaluate(() => { const B = G.ban[0]; G.dan.length = 0; for (let i = 0; i < 8; i++) { const Q = sinhQuai('bo', 0, 150 + i * 120, 30); Q.vao = 1; }
        for (const o of [8, 1, 3]) if (B.t[o]) SKILLS.canon.ban(G, B, B.t[o], G.quai[0]); return G.dan.filter(d => d.dd).length; });
      ok(r === 9, 'loạt tên lửa: NSWE 4 + NS 2 + NSW 3 = 9 quả', r);
      await sleep(140); await chup('ten-lua-bay'); // game chạy thời gian thật (ảnh vẽ đạn hiện dần theo khung vẽ)
      // trang chi tiết ụ
      await p.evaluate(() => { try { UP.mo('canon'); } catch (e) { } }); await sleep(900); await chup('trang-chi-tiet');
      await p.evaluate(() => { const k = document.querySelector('.up-kn[data-up="more"]'); if (k) k.click(); }); await sleep(700);
      const luat = await p.evaluate(() => { const d = [...document.querySelectorAll('dl.up-dl dt')].find(x => /Combine/.test(x.textContent)); if (d) d.scrollIntoView({ block: 'start' }); return d ? d.parentElement.textContent : ''; });
      await sleep(400); await chup('trang-chi-tiet-luat');
      ok(/Result star = average/.test(luat) && /cannot merge/.test(luat) && /stack/.test(luat), 'trang chi tiết: mục luật ghép có Combine / Star / Stack', luat.slice(0, 120));
      ok(!errs.length, 'không lỗi trang', errs.slice(0, 3).join(' | '));
      await c.close();
    }
  } finally { await b.close(); }
}
(async () => {
  if (!process.env.KHONG_PW) await trinhDuyet();
  console.log(loi ? '✗ thap-kt-la-ban: ' + loi + ' lỗi' : '✓ thap-kt-la-ban: đạt');
  process.exit(loi ? 1 : 0);
})().catch(e => { console.log('✗ thap-kt-la-ban: ' + e.message); process.exit(1); });
