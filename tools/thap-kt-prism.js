// TURRET MERGE — KIỂM PRISM THIEF (bienmau) LÀM LẠI 08/11 lần 2: TƯỚNG HỢP THỂ (docs/demo-hop-tuong/tuvan/prism/THIET-KE.md)
//   Phần 1 (vm, không giao diện): màu lúc sinh tất định · luật vuốt hợp thể · hợp thể lại (mặt nạ = ô đại diện) · số hợp thể / cộng dồn cộng hết / sao cao nhất
//     · ghép thật (bộ đếm ghép) · mặt nạ + mặt nạ · mặt nạ không ghép thường · Merge King giữ · Copycat → Prism đơn màu mới · chỉ số theo n
//     · tất định (2 lần chạy cùng hạt ra y hệt) · online: gói 'pm' + cờ ô (oTT/datO) khứ hồi · AI tự hợp thể.
//   Phần 2 (Playwright, mặc định bật; KHONG_PW=1 bỏ): vuốt thật bằng con trỏ ở 390×844 (+ 844×390) → mặt nạ 4 màu + số; chụp ảnh vệt vuốt,
//     hiệu ứng hợp thể, mặt nạ + số, bản cầm kéo (mặt nạ NGANG), trang chi tiết, bảng chỉ số. Ảnh: SHOTS (mặc định /tmp/shots-prism) — không commit.
//   node tools/thap-kt-prism.js   (BASE=http://localhost:8765/thap/ · NODE_PATH=/opt/npm-tools/node_modules)
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const goc = path.join(__dirname, '..', 'thap');
const FILES = ['meta', 'text', 'data', 'thebai', 'fx', 'tiervfx', 'game', 'chihuy', 'skills', 'skills2', 'phattrien', 'artscale', 'skills3', 'skills4', 'skills5', 'vangmoi1', 'hotro', 'support', 'buff', 'skills7', 'jackpot', 'growfx', 'trum', 'online/dongbo'];
function moiTruong() {
  const noop = () => {};
  const ctx = { console, Math: Object.create(Math), JSON, Set, Map, WeakMap, WeakSet, Promise, Object, Array, Error, Date, setTimeout: (f) => { ctx._cho.push(f); }, clearTimeout: noop, setInterval: noop, _cho: [], performance: { now: () => 0 }, localStorage: { getItem: () => null, setItem: noop } };
  let s = 12345; ctx.Math.random = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x80000000; }; // Math.random cố định → so 2 lần chạy
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
let loi = 0;
const ok = (dk, ten, chi) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (dk || chi == null ? '' : ' — ' + chi)); if (!dk) loi++; };
const gan = (a, b, e) => Math.abs(a - b) < (e || 1e-6);
let ctx = moiTruong(), R = (s) => vm.runInContext(s, ctx);
const tran = (deck, che) => { ctx._d = deck; R(`G.debug = { seed: 4242 }; batDau('${che || 'solo'}', _d, 'hero'); G.cho = 1e9; G.quai.length = 0; var B = G.ban[0]; B.t.fill(null); B.mana = 0; B.capThe = {};
  var dat = (o, id, s, f, BB) => { BB = BB || B; const T = sinhU(taoU(BB, id, s, o)); BB.t[o] = T; if (f) f(T); return T; }; var PR = (o, q, st, s, BB) => dat(o, 'bienmau', s || 2, T => { T.pm = q; T.pms = st || 0; }, BB); var cn = () => capNhatBan(B, 1/30);`); };
const DECK = ['bienmau', 'lien', 'canon', 'bang', 'tia'];

console.log('Màu lúc sinh (tất định)');
tran(DECK);
R(`var m1 = []; for (let i = 0; i < 8; i++) m1.push(dat(i, 'bienmau', 1).pm); B.t.fill(null); B._pmN = 0; var m2 = []; for (let i = 0; i < 8; i++) m2.push(dat(i, 'bienmau', 1).pm);`);
ok(R('JSON.stringify(m1) === JSON.stringify(m2)') && R('new Set(m1).size') >= 2 && R('m1.every(q => q >= 0 && q < 4)'), 'cùng hạt + cùng thứ tự → cùng màu, có nhiều màu (' + R('m1.join("")') + ')');

console.log('Luật vuốt hợp thể');
tran(DECK);
R(`var A = [PR(0, 0, 3, 2), PR(1, 1, 2, 4), PR(6, 2, 1, 3), PR(7, 3, 4, 1)]; var g0 = B.ghepN | 0;`);
ok(R("SKILLS.bienmau.kiemMach(B, [0, 6, 1, 7]).loi") === 'path', 'bước chéo: không hợp lệ');
ok(R("SKILLS.bienmau.kiemMach(B, [0, 1, 1, 7]).loi") === 'path', 'lặp ô: không hợp lệ');
ok(R("SKILLS.bienmau.kiemMach(B, [0, 1, 6]).loi") === 'path', '3 ô: không hợp lệ');
ok(R("SKILLS.bienmau.kiemMach(B, [0, 1, 6, 5]).loi") === 'prism', 'ô không phải Prism: không hợp lệ');
R('A[3].pm = 0;'); ok(R("SKILLS.bienmau.kiemMach(B, [0, 1, 6, 7]).loi") === 'colour', '2 Prism đơn trùng màu: không hợp lệ'); R('A[3].pm = 3;');
R('A[2].st.da = true;'); ok(R("SKILLS.bienmau.kiemMach(B, [0, 1, 6, 7]).loi") === 'prism', 'Prism hoá đá: không hợp thể'); R('A[2].st.da = false;');
ok(R("SKILLS.bienmau.mach(B, [0, 1, 6, 7])") === true, 'đường chữ Z 0 → 1 → 6 → 7, 4 màu: HỢP THỂ');
R('var M = B.t[7];');
ok(R('!B.t[0] && !B.t[1] && !B.t[6] && M && M.id === "bienmau"'), '3 ô kia trống, mặt nạ ở ô CUỐI (7)');
ok(R('M.pf') === 1 && R('JSON.stringify(M.pmk)') === '[3,2,1,4]' && R('M.sao') === 4, 'hợp thể 1 · cộng dồn chuyển sang đúng màu [3,2,1,4] · sao = cao nhất (4★)');
ok(R('(B.ghepN | 0) - g0') === 1, 'tính là 1 lần GHÉP THẬT (bộ đếm ghép +1)');
ok(R('SKILLS.bienmau.ds(M).length') === 4 && R('SKILLS.bienmau.tran(M)') === 20, 'mặt nạ có đủ 4 màu · trần cộng dồn mỗi màu 10 × (1 + 1) = 20');
ok(R('typeof B.pmCd === "undefined" || !(B.pmCd > G.t)'), 'không hồi chiêu');

console.log('Hợp thể lại (mặt nạ = ô đại diện)');
R(`var A2 = [PR(4, 0, 5, 1), PR(9, 1, 0, 1), PR(8, 2, 2, 1)];`); // đường 4 → 9 → 8 → 7 (mặt nạ ở cuối)
ok(R("SKILLS.bienmau.mach(B, [4, 9, 8, 7])") === true, 'mặt nạ + 3 Prism 3 màu khác (đỏ/vàng/lam — trùng màu với mặt nạ vẫn được): hợp thể lại');
R('var M2 = B.t[7];');
ok(R('M2.pf') === 2 && R('JSON.stringify(M2.pmk)') === '[8,2,3,4]' && R('M2.sao') === 4, 'hợp thể 2 · cộng dồn cộng hết [8,2,3,4] · sao giữ 4★');
R(`B.t.fill(null); var X1 = PR(0, 0, 4, 3), X2 = PR(1, 1, 0, 3), K1 = PR(2, 0, 0, 2), K2 = PR(3, 0, 0, 2); K1.pf = 2; K1.pmk = [1, 1, 1, 1]; K2.pf = 3; K2.pmk = [2, 0, 0, 0]; var okK = SKILLS.bienmau.mach(B, [0, 1, 2, 3]);`);
ok(R('okK') && R('B.t[3].pf') === 6 && R('B.t[3].sao') === 3 && R('JSON.stringify(B.t[3].pmk)') === '[7,1,1,1]', '2 mặt nạ (n 2 + 3) + 2 Prism đơn → n = 2 + 3 + 1 = 6 · cộng dồn [7,1,1,1] · sao 3★');

console.log('Mặt nạ + mặt nạ · ghép khác');
tran(DECK);
R(`var K1 = PR(0, 1, 0, 2), K2 = PR(1, 2, 0, 5); K1.pf = 1; K1.pmk = [1, 2, 3, 4]; K2.pf = 4; K2.pmk = [10, 0, 0, 1]; var g0 = B.ghepN | 0;`);
ok(R('hopLeGhep(K1, K2) && laGhepThat(K1, K2)'), 'kéo mặt nạ lên mặt nạ: hợp lệ, là ghép thật');
R('var r = ghep(B, K1, K2);');
ok(R('!B.t[0] && B.t[1] && B.t[1].pf') === 6 && R('JSON.stringify(B.t[1].pmk)') === '[11,2,3,5]' && R('B.t[1].sao') === 5 && R('(B.ghepN | 0) - g0') === 1, 'mặt nạ 1 + mặt nạ 4 → n = 6, cộng dồn cộng hết, sao 5★, +1 ghép');
R(`B.t.fill(null); var K = PR(0, 0, 0, 2); K.pf = 2; K.pmk = [0, 0, 0, 0]; var S1 = PR(1, 0, 0, 2), Mi = dat(5, 'mimic', 2);`);
ok(!R('hopLeGhep(K, S1)') && !R('hopLeGhep(S1, K)') && !R('hopLeGhep(Mi, K)') && !R('hopLeGhep(K, Mi)'), 'mặt nạ không ghép thường (với Prism đơn, Mimic)');
R(`var S2 = PR(2, 1, 0, 2);`); ok(R('hopLeGhep(S1, S2)'), 'Prism đơn + Prism đơn cùng sao: ghép thường như cũ');
R(`nangSao(B, K, 1);`); ok(R('B.t[0] === K && K.sao === 3 && K.pf === 2'), 'nâng sao tại chỗ (Merge King / thưởng sao): giữ thân + số hợp thể');
R(`var C = dat(6, 'saochep', 3); var okC = hopLeGhep(C, K), rC = ghep(B, C, K); var N = B.t[6];`);
ok(R('okC && N && N.id === "bienmau" && !(N.pf > 0) && N.pm >= 0 && N.pm < 4 && B.t[0] === K && K.pf === 2'), 'Copycat chép mặt nạ → Prism ĐƠN màu ngẫu nhiên (không chép hợp thể), mặt nạ gốc giữ nguyên');

console.log('Chỉ số theo số hợp thể');
tran(DECK);
R(`var D = PR(7, 1, 4, 2), K = PR(8, 0, 0, 2); K.pf = 3; K.pmk = [5, 6, 7, 8]; cn();`);
ok(gan(R('K.buf.dmg'), 3 * 3 + 0.06, 1e-9) && gan(R('K.buf.toc'), 0.3, 1e-9) && gan(R('K.buf.cdmg || 0'), 0.4, 1e-9), 'n = 3: +900% ST (+6% vàng), +30% tốc, +40% ST chí mạng (8 cộng dồn lục)');
ok(gan(R('SKILLS.bienmau.ti(K, 0)'), 0.04 * 1.75) && gan(R('SKILLS.bienmau.ti(K, 3)'), 0.1 * 1.75), 'tỉ lệ mỗi màu × (1 + 0.25 n)');
ok(R('SKILLS.bienmau.tran(K)') === 40 && R('SKILLS.bienmau.tran(D)') === 10 && (R('B.capThe.bienmau = 8'), R('SKILLS.bienmau.tran(K)')) === 72, 'trần cộng dồn: đơn 10, mặt nạ n=3: 40; LV17: 18 × 4 = 72'); R('B.capThe.bienmau = 0');
ok(R('SKILLS.bienmau.manaTran(B)') === 12, 'trần mana vàng / giây cả bàn: 6 + 2 × 3 = 12');
ok(R('dmgU(K) > dmgU(D) * 4'), 'mặt nạ n = 3 mạnh hơn 4 Prism đơn cùng sao (ST/phát)');
let s = ''; try { s = R('SKILLS.bienmau.mo(K) + " | " + SKILLS.bienmau.mo(D)'); } catch (e) { s = 'LỖI ' + e.message; }
ok(!/LỖI|undefined|NaN/.test(s) && /SPECTRUM PRISM · fusion 3/.test(s) && /FUSION/.test(s), 'chữ kỹ năng (mo) đơn + mặt nạ: ' + s.slice(0, 120) + '…');

console.log('Tất định (2 lần chạy cùng hạt)');
const chay = () => {
  ctx = moiTruong(); R = (q) => vm.runInContext(q, ctx);
  tran(DECK); R(`G.cho = 0; B.mana = 0; var K = PR(7, 0, 0, 4); K.pf = 4; K.pmk = [0, 0, 0, 0]; PR(6, 0, 0, 3); PR(8, 2, 0, 3);`);
  for (let t = 0; t < 40; t += 1 / 30) { R('capNhat(1/30)'); if (ctx._cho.length) ctx._cho.splice(0).forEach(f => f()); }
  return R('JSON.stringify({ k: B.t[7] && B.t[7].pmk, a: B.t[6] && B.t[6].pms, b: B.t[8] && B.t[8].pms, m: Math.round(B.mana), w: G.wave, q: G.quai.length })');
};
const h1 = chay(), h2 = chay();
ok(h1 === h2 && JSON.parse(h1).k.some(x => x > 0), '40 s đánh thật, 2 lần chạy ra y hệt: ' + h1);

console.log('Online: gói pm + cờ ô khứ hồi');
ctx = moiTruong(); R = (q) => vm.runInContext(q, ctx);
tran(DECK, 'pvp');
R(`var B1 = G.ban[1]; B1.t.fill(null); var goi = []; ONS.on = true; ONS.seed = 7; ONS.gui = (k, d) => goi.push([k, JSON.parse(JSON.stringify(d))]);
  for (const BB of [B, B1]) { PR(10, 0, 3, 2, BB); PR(11, 1, 1, 3, BB); PR(12, 2, 0, 2, BB); PR(13, 3, 2, 1, BB); }
  B1.t[11].pms = 0; // lệch nhỏ trên bàn con rối → phải chốt theo cờ ô của máy bạn
  var okA = SKILLS.bienmau.mach(B, [10, 11, 12, 13]);`);
ok(R('okA') && R('goi.length') === 1 && R('goi[0][0]') === 'pm' && R('JSON.stringify(goi[0][1].o)') === '[10,11,12,13]' && R('Array.isArray(goi[0][1].r)'), "máy chủ bàn gửi đúng 1 gói 'pm' (đường vuốt + cờ ô kết quả), không gửi thêm 'gh'");
R(`ONS.nhan({ u: 'ban', k: 'pm', d: JSON.stringify(goi[0][1]) });`);
ok(R('JSON.stringify(ONS.oTT(B1.t[13]))') === R('JSON.stringify(ONS.oTT(B.t[13]))') && R('!B1.t[10] && !B1.t[11] && !B1.t[12]'), 'bàn con rối: cùng hợp thể, ô kết quả khớp từng cờ (' + R('ONS.oTT(B1.t[13])[2]') + ')');
R(`var f = ONS.oTT(B.t[13]); B1.t[13] = null; ONS.datO(B1, 13, f);`);
ok(R('B1.t[13].pf') === 1 && R('JSON.stringify(B1.t[13].pmk)') === R('JSON.stringify(B.t[13].pmk)'), 'ảnh chụp bàn (oTT → datO): dựng lại đúng số hợp thể + cộng dồn 4 màu');
R(`B1.t.fill(null); PR(13, 0, 0, 2, B1); var g2 = goi[0][1]; g2.r = ['bienmau', 2, 'q3;F1;K3.1.0.2;']; ONS.nhan({ u: 'ban', k: 'pm', d: JSON.stringify(g2) });`);
ok(R('B1.t[13] && B1.t[13].pf') === 1, 'bàn con rối lệch (thiếu Prism): vẫn chốt ô cuối theo máy bạn');
R('ONS.on = false;');

console.log('AI tự hợp thể');
ctx = moiTruong(); R = (q) => vm.runInContext(q, ctx);
tran(DECK);
R(`B.ai = true; PR(0, 0, 0, 1); PR(1, 1, 0, 1); PR(2, 2, 0, 1); PR(7, 3, 0, 1); B.aiT = 0; aiBan(B, 1/30);`);
ok(R('B.t.filter(X => X && X.pf > 0).length') === 1, 'AI thấy đường 4 màu → vuốt hợp thể (' + R('B.t.map(X => X ? X.id[0] + (X.pf | 0) : "-").join(" ")') + ')');
R(`B.t.fill(null); var K1 = PR(0, 1, 0, 2), K2 = PR(9, 2, 0, 2); K1.pf = 1; K1.pmk = [0, 0, 0, 0]; K2.pf = 2; K2.pmk = [0, 0, 0, 0]; B.aiT = 0; aiBan(B, 1/30);`);
ok(R('B.t.filter(X => X && X.pf > 0).map(X => X.pf).join()') === '4', 'AI có 2 mặt nạ → kéo gộp (n = 1 + 2 + 1 = 4)');

async function pw() {
  let pwm; try { pwm = require('playwright'); } catch (e) { console.log('SKIP phần trình duyệt (không có playwright)'); return; }
  const BASE = process.env.BASE || 'http://localhost:8765/thap/', OUT = process.env.SHOTS || '/tmp/shots-prism', sleep = (ms) => new Promise(r => setTimeout(r, ms));
  fs.mkdirSync(OUT, { recursive: true });
  const b = await pwm.chromium.launch();
  for (const [w, h] of [[390, 844], [844, 390]]) {
    console.log('Playwright ' + w + '×' + h);
    const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    const p = await c.newPage(), errs = [];
    p.on('pageerror', e => errs.push(e.message));
    p.on('console', m => { if (m.type() === 'error' && !/WebSocket|ERR_CONNECTION|favicon|404|Firestore|firebase/i.test(m.text())) errs.push('console ' + m.text().slice(0, 160)); });
    await p.goto(BASE + '?mode=solo&deck=bienmau,lien,canon,bang,tia&wave=3&mana=0&notut=1', { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.roster && G.roster.length && typeof TAI !== 'undefined' && !TAI.cho, null, { timeout: 60000 });
    await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 });
    await sleep(900);
    const chup = async (ten) => { const f = path.join(OUT, ten + '-' + w + 'x' + h + '.png'); await p.screenshot({ path: f }); console.log('    ảnh ' + f); };
    await p.evaluate(() => { const B = G.ban[0]; G.quai.length = 0; B.t.fill(null); const ds = [[5, 0, 3], [6, 1, 2], [7, 2, 1], [12, 3, 4], [10, 0, 0], [11, 1, 0], [13, 2, 0], [0, 3, 0]];
      for (const [o, q, st] of ds) { const T = taoU(B, 'bienmau', 2, o); T.pm = q; T.pms = st; T.goc = -Math.PI / 2; B.t[o] = T; } B.t[2] = sinhU(taoU(B, 'lien', 2, 2)); for (const a of SKILLS.bienmau.ANH.concat(SKILLS.bienmau.HOP, ['fx_bienmau_hop'])) REN.img(a); });
    await sleep(1200);
    const cell = (o) => p.evaluate((o) => { const B = G.ban[0], c = B.o[o], rr = document.querySelector('#cv').getBoundingClientRect(); return [rr.left + c.x / W * rr.width, rr.top + c.y / H * rr.height]; }, o);
    await chup('prism-truoc');
    // vuốt thật 5 → 6 → 7 → 12 (chụp giữa lúc vuốt: vệt vuốt)
    const pts = []; for (const o of [5, 6, 7, 12]) pts.push(await cell(o));
    await p.mouse.move(pts[0][0], pts[0][1]); await p.mouse.down();
    for (let i = 1; i < 4; i++) { for (let k = 1; k <= 6; k++) await p.mouse.move(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k / 6, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k / 6); if (i === 3) { await sleep(120); await chup('prism-vet-vuot'); } }
    await p.mouse.up();
    let r = await p.evaluate(() => { const B = G.ban[0], M = B.t[12]; return { n: M && M.pf, k: M && M.pmk, trong: [5, 6, 7].every(o => !B.t[o]), vfx: G.hu.some(o => o.k === 'pmHop') }; });
    ok(r.n === 1 && r.k && [3, 2, 1, 4].every((x, i) => r.k[i] >= x && r.k[i] <= x + 3) && r.trong && r.vfx, 'VUỐT thật 4 màu → mặt nạ 4 màu ở ô cuối, 3 ô trống, có hiệu ứng (' + JSON.stringify(r) + ')');
    await chup('prism-vfx-bay'); await sleep(250); await chup('prism-vfx-no');
    await sleep(1400); await chup('prism-mat-na-1');
    // hợp thể lại: 10 → 11 → 13? (13 không kề 11) → dùng 10 → 11 → 12? 12 là mặt nạ; đường 10 → 11 → 12 → 13 (mặt nạ ở giữa = ô đại diện), kết thúc ở 13
    const p2 = []; for (const o of [10, 11, 12, 13]) p2.push(await cell(o));
    await p.mouse.move(p2[0][0], p2[0][1]); await p.mouse.down();
    for (let i = 1; i < 4; i++) for (let k = 1; k <= 6; k++) await p.mouse.move(p2[i - 1][0] + (p2[i][0] - p2[i - 1][0]) * k / 6, p2[i - 1][1] + (p2[i][1] - p2[i - 1][1]) * k / 6);
    await p.mouse.up();
    r = await p.evaluate(() => { const B = G.ban[0], M = B.t[13]; return { n: M && M.pf, src: !B.t[10] && !B.t[11] && !B.t[12] }; });
    ok(r.n === 2 && r.src, 'vuốt lại qua mặt nạ (ô đại diện) → hợp thể 2 (' + JSON.stringify(r) + ')');
    await p.evaluate(() => { const M = G.ban[0].t[13]; M.pf = 10; });
    await sleep(1700); await chup('prism-mat-na-10');
    // bản cầm kéo: mặt nạ phải NẰM NGANG (kiểm góc đầu = 0 cả ở bản ghost + đơn)
    r = await p.evaluate(() => { const S = SKILLS.bienmau, B = G.ban[0], M = B.t[13]; REN.datDauEp(M); const g1 = S.gocDau(M); REN._dauEp = null; const g0 = S.gocDau({ id: 'bienmau' }); return { g1, g0, ghost: S.dauGhost(M) }; });
    ok(r.g1 === 0 && Math.abs(r.g0 + Math.PI / 2) < 1e-9 && r.ghost, 'mặt nạ vẽ ở góc 0 (cả lúc cầm kéo); đầu dự phòng xoay −90° cho thẳng (' + JSON.stringify(r) + ')');
    const m = await cell(13), dst = await cell(8);
    await p.mouse.move(m[0], m[1]); await p.mouse.down(); for (let k = 1; k <= 8; k++) await p.mouse.move(m[0] + (dst[0] - m[0]) * k / 8, m[1] + (dst[1] - m[1]) * k / 8 - 20); await sleep(200);
    await chup('prism-cam-keo'); await p.mouse.up(); await sleep(400);
    ok(await p.evaluate(() => G.ban[0].t[13] && G.ban[0].t[13].pf === 10), 'thả mặt nạ ra chỗ trống / ô không hợp lệ: không mất');
    // bảng chỉ số (chạm) + trang chi tiết
    await sleep(800); await p.mouse.click(m[0], m[1]); await sleep(700); await chup('prism-bang-chi-so');
    const txt = await p.evaluate(() => (document.querySelector('#tt') || {}).innerText || '');
    ok(/fusion 10/i.test(txt) || /SPECTRUM/i.test(txt), 'bảng chỉ số ghi SPECTRUM PRISM · fusion 10 (' + txt.replace(/\s+/g, ' ').slice(0, 100) + '…)');
    await p.evaluate(() => { if (typeof UP !== 'undefined' && UP.mo) UP.mo('bienmau'); }); await sleep(1500); await chup('prism-trang-chi-tiet');
    ok(!errs.length, 'không lỗi trang' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
    await c.close();
  }
  await b.close();
}
(process.env.KHONG_PW ? Promise.resolve() : pw()).then(() => { console.log(loi ? '✗ ' + loi + ' lỗi' : '✓ đạt hết'); process.exit(loi ? 1 : 0); }, (e) => { console.log('✗ ' + e.stack); process.exit(1); });
