// TURRET MERGE — ĐO TỐC BẮN + DPS ụ Tấn công TÍM / VÀNG / ĐỎ (yêu cầu 09/11: "ụ đỏ không imba như tôi nghĩ")
//   node tools/thap-do-vang-do.js [ra.json] [nhanh] [chi=id1,id2]   (Lucky Slot: CB=n đặt sẵn điểm quả · CB_TIA=[1e9,1e9] tắt 2–3 tia)
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
  for (const f of ['vangmoi1', 'skills7', 'jackpot']) { const p = path.join(__dirname, '..', 'thap', 'js', f + '.js'); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f + '.js' }); }
  if (process.env.CB_TIA) vm.runInContext('CB.TIA = ' + process.env.CB_TIA, ctx); // CB_TIA=[1e9,1e9]: tắt tia theo ngưỡng (đo trước/sau)
  return ctx;
}
const DUNG_CD = `{ const B = G.ban[0]; for (const T of B.t) if (T) { const sk = SKILLS[T.id]; if (sk.chuDong && T.nap >= 1) sk.chuDong(G, B, T); } }`;
function dps(ctx, id, sao, cap, wave, T0, max, hs) {
  ctx._a = [id, sao, cap, wave];
  R(ctx, `{ const [id, sao, cap, wave] = _a; G.debug = { auto: false }; batDau('solo', ['lien', 'canon', 'set', 'tia', 'mana'], 'hero'); G.cho = 1e9; G.wave = wave;
    const B = G.ban[0]; B.tim = 1e9; B.mana = 600; B.capThe = {}; B.capThe[id] = cap; B.lv = B.lv || {}; B.lv[id] = 4;
    const T = sinhU(taoU(B, id, sao, 2)); if (typeof _epThuc === 'boolean') T.thuc = _epThuc; if (id === 'leviathan' && typeof _vucKV === 'number') T.vuc = _vucKV;
    if (id === 'cobac') { const n = typeof _cbKV === 'number' ? _cbKV : 0; B.cb = [n, n, n]; T.cbS = sao; T.cbQuay = 0; } B.t[2] = T; G._T = T; G._sum = 0; G._q = 0; }`);
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
// VỰC SÂU kỳ vọng của Leviathan theo wave (09/11 lần 2): trung vị điểm của Leviathan mạnh nhất trên bàn ở mốc wave, trận SOLO bot (bộ Thường / Vàng / Tím,
//   cấp thẻ 0, 18 trận — docs/demo-hop-tuong/tocban/DO-VANG-DO.md). VUC=0 để tắt (đo từ 0 điểm như cũ).
const VUC_KV = process.env.VUC === '0' ? null : { 20: 8, 30: 20, 40: 80, 50: 180 };
// Lucky Slot (cobac, 09/11): điểm quả KỲ VỌNG mỗi ngăn theo wave — trận SOLO bot (tools/thap-sim-co-bac.js, 16 trận: bộ 1/5 Thường + 1/5 Vàng),
//   trung bình điểm Dưa hấu ≈ 13 / 18 / 23 / 25 ở wave 20 / 30 / 40 / 50 (3 ngăn gần bằng nhau). Đặt sẵn [n, n, n], ụ đã quay xong (không mất 1,5–2 s quay).
//   CB=0 → đo từ 0 điểm · CB=n → n điểm mỗi ngăn ở mọi wave. Bảng chính dùng kỳ vọng (Lucky Slot luôn có điểm ngay khi xuất hiện — khác Leviathan).
const CB_KV = process.env.CB === '0' ? null : process.env.CB ? { 20: +process.env.CB, 30: +process.env.CB, 40: +process.env.CB, 50: +process.env.CB } : { 20: 13, 30: 18, 40: 23, 50: 25 }; // CB=n: mọi wave n điểm/ngăn (vd vận đen)
const gm = (a, b) => Math.sqrt(Math.max(1e-6, a) * Math.max(1e-6, b));
function doTatCa(nhanh, chi) {
  const CTX = [4242, 777, 31337].map(h => taoMoiTruong(h)), ctx = CTX[0];
  for (const c of CTX) R(c, 'var B_mana_fix = 0;');
  const med3 = (a) => a.slice().sort((x, y) => x - y)[(a.length - 1) >> 1];
  let ds = R(ctx, `G.roster.filter(r => SKILLS[r.id] && SKILLS[r.id].vai === 'tc' && ['tim', 'vang', 'do'].includes(r.bac)).map(r => ({ id: r.id, bac: r.bac, ten: TEXT.turret[r.id] ? TEXT.turret[r.id].name : r.id }))`);
  if (chi) ds = ds.filter(u => chi.includes(u.id));
  const capMax = { tim: 9, vang: 8, do: 6 };
  const T0 = +process.env.T0 || (nhanh ? 14 : 24), SAO = process.env.SAO ? process.env.SAO.split(',').map(Number) : [3, 5, 7], WAVE = nhanh ? [30] : process.env.WAVE ? process.env.WAVE.split(',').map(Number) : [20, 30, 40, 50], CAP = ['dau', 'max'];
  const m20 = R(ctx, 'mauWave(20)');
  for (const u of ds) {
    u.r = {};
    for (const c of CAP) for (const s of SAO) for (const w of WAVE) {
      const cap = c === 'dau' ? 0 : capMax[u.bac], k = (1 + 0.85 * (s - 1)) * m20 / R(ctx, `mauWave(${w})`);
      // trung vị 3 hạt giống: ụ có dạng quay lúc sinh (Sói thức tỉnh, màu Prism…) không làm lệch số đo
      const do1 = () => { const A = CTX.map(x => dps(x, u.id, s, cap, w, T0, 1, 400 * k)), Bq = CTX.map(x => dps(x, u.id, s, cap, w, T0, 10, 25 * k)); return { don: med3(A.map(q => q.d)), dong: med3(Bq.map(q => q.d)), toc: A[0].toc }; };
      let x;
      if (u.id === 'soi') {
        // 09/11 lần 2 (Đỏ hơn Vàng rõ rệt): Sói quay Thường/Thức tỉnh lúc sinh → trung vị 3 hạt lúc ra bản này lúc bản kia (Vàng tốt nhất nhảy ×1.6–3 giữa các wave).
        //   Đo CẢ HAI bản (ép T.thuc) rồi lấy KỲ VỌNG theo tỉ lệ thức tỉnh ở cấp thẻ đó (SKILLS.soi.tiLe).
        for (const c2 of CTX) c2._epThuc = false; const n = do1(); for (const c2 of CTX) c2._epThuc = true; const t = do1(); for (const c2 of CTX) c2._epThuc = undefined;
        const q = R(ctx, `(() => { batDau('solo', ['soi'], 'hero'); const B = G.ban[0]; B.capThe = { soi: ${cap} }; B.lv = B.lv || {}; B.lv.soi = 4; return SKILLS.soi.tiLe(B); })()`);
        x = { don: (1 - q) * n.don + q * t.don, dong: (1 - q) * n.dong + q * t.dong, toc: n.toc, q };
      } else if (u.id === 'leviathan' && VUC_KV) {
        // VỰC SÂU cộng dồn không trần (+4%/điểm, riêng từng ụ, ghép = về 0): bài 24 s chỉ được vài điểm → đặt sẵn số điểm KỲ VỌNG ở wave đó
        //   (Leviathan trên bàn trong các trận SOLO mô phỏng — xem VUC_KV) → u.rKV. Bảng chính (u.r, trung vị Đỏ) vẫn tính TỪ 0 điểm như cũ (thận trọng).
        x = do1(); for (const c2 of CTX) c2._vucKV = VUC_KV[w] || 0; const y = do1(); for (const c2 of CTX) c2._vucKV = undefined;
        u.rKV = u.rKV || {}; u.rKV[c + s + 'w' + w] = { don: y.don, dong: y.dong, p: gm(y.don, y.dong), vuc: VUC_KV[w] || 0 };
      } else if (u.id === 'cobac') { for (const c2 of CTX) c2._cbKV = CB_KV ? CB_KV[w] || 0 : 0; x = do1(); for (const c2 of CTX) c2._cbKV = undefined; x.cb = CB_KV ? CB_KV[w] || 0 : 0; }
      else x = do1();
      u.r[c + s + 'w' + w] = { don: x.don, dong: x.dong, p: gm(x.don, x.dong), toc: x.toc, cb: x.cb };
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
  const L = [], keys = Object.keys(d.ds[0].r), lev = d.ds.find(u => u.id === 'leviathan' && u.rKV);
  L.push('| kịch bản | Tím TV | Vàng TV | Vàng top-3 TB | Vàng tốt nhất | Đỏ TV | Đỏ thấp nhất | Vàng TV / Tím TV | Đỏ TV / Vàng TV | **Đỏ TV / Vàng tốt nhất** | Đỏ thấp nhất / Vàng tốt nhất' + (lev ? ' | Leviathan (VỰC SÂU kỳ vọng) / Vàng tốt nhất' : '') + ' |',
    '|---|---|---|---|---|---|---|---|---|---|---|' + (lev ? '---|' : ''));
  const med = (a) => { const b = a.slice().sort((x, y) => x - y), n = b.length; return !n ? 0 : n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };
  for (const k of keys) {
    const g = (bac, bo) => d.ds.filter(u => u.bac === bac && !(bo && NGOAI.includes(u.id))).map(u => u.r[k].p);
    const t = g('tim'), v = g('vang'), v2 = g('vang', 1).sort((a, b) => b - a), r = g('do'), top3 = (v2[0] + v2[1] + v2[2]) / 3;
    const tenV = (d.ds.find(u => u.bac === 'vang' && u.r[k].p === v2[0]) || {}).id, rMin = Math.min(...r), tenR = (d.ds.find(u => u.bac === 'do' && u.r[k].p === rMin) || {}).id;
    L.push('| ' + k + ' | ' + Math.round(med(t)) + ' | ' + Math.round(med(v)) + ' | ' + Math.round(top3) + ' | ' + Math.round(v2[0]) + ' ' + tenV + ' | ' + Math.round(med(r)) + ' | ' + Math.round(rMin) + ' ' + tenR + ' | ' + (med(v) / med(t)).toFixed(2) + ' | ' + (med(r) / med(v)).toFixed(2) + ' | **' + (med(r) / v2[0]).toFixed(2) + '** | ' + (rMin / v2[0]).toFixed(2) + (lev ? ' | ' + (lev.rKV[k].p / v2[0]).toFixed(2) + ' (' + lev.rKV[k].vuc + ' điểm)' : '') + ' |');
  }
  // trung bình theo nhóm kịch bản (dau3 … max7)
  const nhom = {};
  for (const k of keys) {
    const vb = Math.max(...d.ds.filter(u => u.bac === 'vang' && !NGOAI.includes(u.id)).map(u => u.r[k].p)), r = d.ds.filter(u => u.bac === 'do').map(u => u.r[k].p);
    (nhom[k.split('w')[0]] = nhom[k.split('w')[0]] || []).push(med(r) / vb);
  }
  L.push('', 'Trung bình 4 wave — Đỏ TV / Vàng tốt nhất: ' + Object.entries(nhom).map(([k, a]) => k + ' ' + (a.reduce((x, y) => x + y, 0) / a.length).toFixed(2)).join(' · '));
  return L.join('\n');
}
// từng ụ Đỏ / Vàng tốt nhất theo kịch bản (bảng ma trận)
function tungDo(d) {
  const keys = Object.keys(d.ds[0].r), dd = d.ds.filter(u => u.bac === 'do');
  const L = ['| kịch bản | ' + dd.map(u => (TEXT_TEN[u.id] || u.id)).join(' | ') + (dd.some(u => u.rKV) ? ' | Leviathan VỰC SÂU kỳ vọng' : '') + ' |', '|---|' + dd.map(() => '---|').join('') + (dd.some(u => u.rKV) ? '---|' : '')];
  for (const k of keys) {
    const vb = Math.max(...d.ds.filter(u => u.bac === 'vang' && !NGOAI.includes(u.id)).map(u => u.r[k].p)), lev = dd.find(u => u.rKV);
    L.push('| ' + k + ' | ' + dd.map(u => (u.r[k].p / vb).toFixed(2)).join(' | ') + (lev ? ' | ' + (lev.rKV[k].p / vb).toFixed(2) : '') + ' |');
  }
  return L.join('\n');
}
const TEXT_TEN = { blackhole: 'Black Hole', overlord: 'Overlord', chuato: 'Hive Queen', leviathan: 'Leviathan (từ 0)', ronglua: 'Wyrm Engine', thacmana: 'Arcane Cascade', cobac: 'Lucky Slot' };
if (require.main === module) {
  const a = process.argv.slice(2), nhanh = a.includes('nhanh'), chiA = a.find(x => x.startsWith('chi=')), bangA = a.find(x => x.startsWith('bang='));
  if (bangA) { const d = JSON.parse(fs.readFileSync(bangA.slice(5))); console.log(tomTat(d)); if (a.includes('tungdo')) console.log('\n' + tungDo(d)); for (const k of (a.find(x => x.startsWith('khoa=')) || 'khoa=max5w30').slice(5).split(',')) console.log('\n### ' + k + '\n\n' + bang(d, k)); }
  else {
    const ra = a.find(x => x.endsWith('.json')) || '/tmp/do-vang-do.json';
    const d = doTatCa(nhanh, chiA && chiA.slice(4).split(','));
    fs.writeFileSync(ra, JSON.stringify(d));
    console.log(tomTat(d));
  }
}
module.exports = { doTatCa, bang, tomTat, tungDo };
