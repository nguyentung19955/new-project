// TURRET MERGE — ĐO TỐC BẮN + DPS ụ Tấn công TÍM / VÀNG / ĐỎ (yêu cầu 09/11: "ụ đỏ không imba như tôi nghĩ")
//   node tools/thap-do-vang-do.js [ra.json] [nhanh] [chi=id1,id2]
// Cách đo (mô phỏng không giao diện như tools/thap-sim-tier.js, RNG có hạt):
//   · 1 ụ ở ô 2 (sát đường), sao 3/5/7, cấp thẻ: "dau" (LV đầu bậc) và "max" (LV tối đa bậc: Tím 15, Vàng/Đỏ 17), POWER-UP +3 (MAX) như nhau.
//   · DPS đơn (1 quái trâu) + DPS đám đông (≤10 quái) → chỉ số = trung bình nhân. Wave 20/30/40/50: máu quái giữ cùng mức tuyệt đối
//     (hs chia theo mauWave) để chỉ còn khác biệt của heHauKy / cơ chế theo wave. Ụ có chủ động tự dùng khi nạp đầy (như AI).
//   · Mỗi điểm = trung vị của 3 hạt giống (ụ có dạng quay lúc sinh: Sói thức tỉnh, màu Prism Thief…).
//   · B.mana = 600 (Arcane Cascade sống nhờ mana đang có — mức giữa trận điển hình).
//   · toc = tocU(T) sau 1 bước (phát/giây "danh nghĩa" của ụ, đã gồm sao, cấp thẻ, mốc 3★, tốc theo sao).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { taoMoiTruong: taoGoc, R } = require('./thap-sim-vaitro.js');
function taoMoiTruong(hat) {
  const ctx = taoGoc(hat);
  vm.runInContext("if (typeof SUP === 'undefined') { var SUP = {}, SUP_LOAI = {}, SUP_GIA = {}; }", ctx);
  for (const f of ['vangmoi1', 'skills7']) { const p = path.join(__dirname, '..', 'thap', 'js', f + '.js'); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f + '.js' }); }
  return ctx;
}
const DUNG_CD = `{ const B = G.ban[0]; for (const T of B.t) if (T) { const sk = SKILLS[T.id]; if (sk.chuDong && T.nap >= 1) sk.chuDong(G, B, T); } }`;
function dps(ctx, id, sao, cap, wave, T0, max, hs) {
  ctx._a = [id, sao, cap, wave];
  R(ctx, `{ const [id, sao, cap, wave] = _a; G.debug = { auto: false }; batDau('solo', ['lien', 'canon', 'set', 'tia', 'mana'], 'hero'); G.cho = 1e9; G.wave = wave;
    const B = G.ban[0]; B.tim = 1e9; B.mana = 600; B.capThe = {}; B.capThe[id] = cap; B.lv = B.lv || {}; B.lv[id] = 4;
    const T = sinhU(taoU(B, id, sao, 2)); B.t[2] = T; G._T = T; G._sum = 0; G._q = 0; }`);
  if (!ctx._lotVong) { ctx._lotVong = 1; R(ctx, 'const _lotSim = lot; lot = function (E) { if (G._vong) { E.s = 0; return; } return _lotSim(E); };'); }
  R(ctx, 'G._vong = true;');
  const dt = 1 / 30; let cd = 0, toc = 0;
  for (let t = 0; t < T0; t += dt) {
    if (t >= R(ctx, 'G._q') * 0.5) R(ctx, `{ G._q++; if (G.quai.filter(e => !e.chet).length < ${max}) { const d = taoWave(G.wave).ds; const Q = sinhQuai(pick(d), 0, 0, ${hs}); Q.vao = 1; } }`);
    R(ctx, 'capNhat(' + dt + ')');
    if (!toc) toc = R(ctx, 'tocU(G._T)');
    if (ctx._cho.length) { const c = ctx._cho.splice(0); c.forEach(f => f()); }
    if ((cd -= dt) <= 0) { cd = 0.5; R(ctx, 'B_mana_fix = 0; G.ban[0].mana = 600;' + DUNG_CD); }
  }
  R(ctx, 'G._vong = false;');
  return { d: R(ctx, 'G._sum') / T0, toc };
}
const gm = (a, b) => Math.sqrt(Math.max(1e-6, a) * Math.max(1e-6, b));
function doTatCa(nhanh, chi) {
  const CTX = [4242, 777, 31337].map(h => taoMoiTruong(h)), ctx = CTX[0];
  for (const c of CTX) R(c, 'var B_mana_fix = 0;');
  const med3 = (a) => a.slice().sort((x, y) => x - y)[(a.length - 1) >> 1];
  let ds = R(ctx, `G.roster.filter(r => SKILLS[r.id] && SKILLS[r.id].vai === 'tc' && ['tim', 'vang', 'do'].includes(r.bac)).map(r => ({ id: r.id, bac: r.bac, ten: TEXT.turret[r.id] ? TEXT.turret[r.id].name : r.id }))`);
  if (chi) ds = ds.filter(u => chi.includes(u.id));
  const capMax = { tim: 9, vang: 8, do: 6 };
  const T0 = nhanh ? 14 : 24, SAO = [3, 5, 7], WAVE = nhanh ? [30] : [20, 30, 40, 50], CAP = ['dau', 'max'];
  const m20 = R(ctx, 'mauWave(20)');
  for (const u of ds) {
    u.r = {};
    for (const c of CAP) for (const s of SAO) for (const w of WAVE) {
      const cap = c === 'dau' ? 0 : capMax[u.bac], k = (1 + 0.85 * (s - 1)) * m20 / R(ctx, `mauWave(${w})`);
      // trung vị 3 hạt giống: ụ có dạng quay lúc sinh (Sói thức tỉnh, màu Prism…) không làm lệch số đo
      const A = CTX.map(x => dps(x, u.id, s, cap, w, T0, 1, 400 * k)), Bq = CTX.map(x => dps(x, u.id, s, cap, w, T0, 10, 25 * k));
      const don = med3(A.map(q => q.d)), dong = med3(Bq.map(q => q.d));
      u.r[c + s + 'w' + w] = { don, dong, p: gm(don, dong), toc: A[0].toc };
    }
    process.stderr.write(u.id + ' ');
  }
  process.stderr.write('\n');
  return { ngay: new Date().toISOString(), ds };
}
function bang(d, khoa) {
  const L = [], TEN = { tim: 'Tím', vang: 'Vàng', do: 'Đỏ' };
  const ds = d.ds.slice().sort((a, b) => (b.r[khoa] ? b.r[khoa].p : 0) - (a.r[khoa] ? a.r[khoa].p : 0));
  L.push('| Bậc | Ụ | tốc (phát/s) | DPS đơn | DPS đám đông | chỉ số |', '|---|---|---|---|---|---|');
  for (const u of ds) { const x = u.r[khoa]; if (!x) continue; L.push('| ' + TEN[u.bac] + ' | ' + u.ten + ' (`' + u.id + '`) | ' + x.toc.toFixed(2) + ' | ' + Math.round(x.don) + ' | ' + Math.round(x.dong) + ' | ' + Math.round(x.p) + ' |'); }
  return L.join('\n');
}
// Nemesis = đòn % máu tối đa / hạ gục: bài thử quái trâu làm phồng ảo (như thap-sim-tier.js THEO_BO) → không tính vào "Vàng tốt nhất" (Prism Thief cũng vậy)
const NGOAI = ['nemesis', 'bienmau']; // Prism Thief: dạng màu quay lúc sinh → số đo nhảy ×10 giữa các hạt
function tomTat(d) {
  const L = [], keys = Object.keys(d.ds[0].r);
  L.push('| kịch bản | Tím TV | Vàng TV | Vàng top-3 TB | Vàng tốt nhất | Đỏ TV | Đỏ thấp nhất | Vàng TV / Tím TV | Đỏ TV / Vàng TV | Đỏ TV / Vàng tốt nhất |', '|---|---|---|---|---|---|---|---|---|---|');
  const med = (a) => { const b = a.slice().sort((x, y) => x - y), n = b.length; return !n ? 0 : n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };
  for (const k of keys) {
    const g = (bac, bo) => d.ds.filter(u => u.bac === bac && !(bo && NGOAI.includes(u.id))).map(u => u.r[k].p);
    const t = g('tim'), v = g('vang'), v2 = g('vang', 1).sort((a, b) => b - a), r = g('do'), top3 = (v2[0] + v2[1] + v2[2]) / 3;
    L.push('| ' + k + ' | ' + Math.round(med(t)) + ' | ' + Math.round(med(v)) + ' | ' + Math.round(top3) + ' | ' + Math.round(v2[0]) + ' | ' + Math.round(med(r)) + ' | ' + Math.round(Math.min(...r)) + ' | ' + (med(v) / med(t)).toFixed(2) + ' | ' + (med(r) / med(v)).toFixed(2) + ' | ' + (med(r) / v2[0]).toFixed(2) + ' |');
  }
  return L.join('\n');
}
if (require.main === module) {
  const a = process.argv.slice(2), nhanh = a.includes('nhanh'), chiA = a.find(x => x.startsWith('chi=')), bangA = a.find(x => x.startsWith('bang='));
  if (bangA) { const d = JSON.parse(fs.readFileSync(bangA.slice(5))); console.log(tomTat(d)); for (const k of (a.find(x => x.startsWith('khoa=')) || 'khoa=max5w30').slice(5).split(',')) console.log('\n### ' + k + '\n\n' + bang(d, k)); }
  else {
    const ra = a.find(x => x.endsWith('.json')) || '/tmp/do-vang-do.json';
    const d = doTatCa(nhanh, chiA && chiA.slice(4).split(','));
    fs.writeFileSync(ra, JSON.stringify(d));
    console.log(tomTat(d));
  }
}
module.exports = { doTatCa, bang, tomTat };
