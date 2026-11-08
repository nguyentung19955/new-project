// TURRET MERGE — mô phỏng cân bằng LUCKY SLOT 3 ô (cobac, thap/js/jackpot.js CB — người dùng 08/11)
//   node tools/thap-sim-co-bac.js diem [lan] [solo|pvp] → điểm quả tích được ở wave 12/20/40/60/70 (SOLO) hoặc …/80/100 (PVP vô tận) — bot tự chơi, máu vô hạn để đi xa,
//                                               bộ thường (1 Lucky Slot trong 5) + bộ "nhiều Lucky Slot" (bộ chỉ cobac) — trung bình / lớn nhất;
//                                               kèm "điểm kiểu cũ" (mỗi lượt +sao, jackpot 10% ×2 sao: kỳ vọng 0,5×sao/ngăn) để so hệ số mỗi điểm.
//   node tools/thap-sim-co-bac.js dps [giây]   → ST/phút Lucky Slot 4★ wave 12 (cấp thẻ +3) theo ngăn a/a/a — so Hive Queen / Leviathan (như bản gốc)
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const { taoMoiTruong, R, buoc, dpsBan } = require('./thap-sim-vaitro.js');
const goc = path.join(__dirname, '..', 'thap');
function moi(hat) {
  const ctx = taoMoiTruong(hat);
  vm.runInContext("if (typeof SUP === 'undefined') { var SUP = {}, SUP_LOAI = {}, SUP_GIA = {}; }", ctx);
  for (const f of ['vangmoi1', 'skills7', 'jackpot']) vm.runInContext(fs.readFileSync(path.join(goc, 'js', f + '.js'), 'utf8'), ctx, { filename: f + '.js' });
  return ctx;
}
function diem(ctx, deck, hat, moc, che) {
  ctx._deck = deck; ctx._che = che || 'solo';
  R(ctx, `G.debug = { auto: true, seed: ${hat} }; batDau(_che, _deck, 'hero'); for (const X of G.ban) X.tim = 1e9; G.ban[0].ai = true;`);
  const kq = {}; let i = 0; const dt = 1 / 30;
  for (let t = 0; t < 20000 && i < moc.length; t += dt) {
    R(ctx, 'capNhat(' + dt + ')'); if (ctx._cho.length) ctx._cho.splice(0).forEach(f => { try { f(); } catch (e) { } });
    if (R(ctx, 'G.wave') >= moc[i]) { kq[moc[i]] = R(ctx, `(() => { const B = G.ban[0], L = (G.cbLog || []).filter(x => x.ban === 0); return { cb: (B.cb || [0, 0, 0]).slice(), lan: L.length, luot: L.reduce((a, x) => a + x.q.split('|').length, 0), cu: L.reduce((a, x) => a + 0.5 * x.s, 0), slot: B.t.filter(T => T && T.id === 'cobac').length, t: Math.round(G.t) }; })()`); i++; }
  }
  return kq;
}
if (require.main === module) {
  const che = process.argv[2] || 'diem';
  if (che === 'diem') {
    const lan = +(process.argv[3] || 4), che2 = process.argv[4] || 'solo', MOC = che2 === 'pvp' ? [12, 20, 40, 60, 80, 100] : [12, 20, 40, 60, 70]; // SOLO hết ở wave 70 (LUAT.waveMax); PVP không giới hạn → "trận dài vô tận"
    const BO = { 'normal (1 of 5)': ['cobac', 'lien', 'canon', 'tia', 'set'], 'all Lucky Slot': ['cobac'] };
    for (const k in BO) {
      const ds = []; for (let h = 1; h <= lan; h++) ds.push(diem(moi(h * 97), BO[k], h * 131, MOC, che2));
      console.log('\n' + k + ' — ' + che2 + ', ' + lan + ' games');
      console.log('| wave | mean points/fruit | max fruit | sum (mean) | spins | reel rounds | old-rule pts/fruit | Slots on board | time s |'); console.log('|---|---|---|---|---|---|---|---|---|');
      for (const w of MOC) {
        const x = ds.map(d => d[w]).filter(Boolean); if (!x.length) continue;
        const tb = (f) => x.reduce((a, d) => a + f(d), 0) / x.length;
        console.log('| ' + w + ' | ' + tb(d => d.cb.reduce((a, b) => a + b, 0) / 3).toFixed(1) + ' | ' + Math.max(...x.map(d => Math.max(...d.cb))) + ' | ' + tb(d => d.cb.reduce((a, b) => a + b, 0)).toFixed(0)
          + ' | ' + tb(d => d.lan).toFixed(1) + ' | ' + tb(d => d.luot).toFixed(1) + ' | ' + tb(d => d.cu).toFixed(1) + ' | ' + tb(d => d.slot).toFixed(1) + ' | ' + tb(d => d.t).toFixed(0) + ' |');
      }
    }
  } else if (che === 'dps') {
    const T0 = +(process.argv[3] || 60), ctx = moi(7);
    if (process.env.CU === '1') R(ctx, 'CB.DMG = 0.03; CB.TOC = 0.02; CB.CDMG = 0.10;'); // CU=1: số mỗi điểm KIỂU CŨ (trước 08/11) để so
    R(ctx, 'var _dpsCB = null;');
    // dpsBan tự gọi batDau → đặt cấp thẻ +3 + ngăn quả (Lucky Slot đã quay xong) bằng móc sinhU
    R(ctx, `const _sinhCB = sinhU; sinhU = function (T) { const r = _sinhCB.apply(this, arguments); const B = G.ban[T.ban]; B.capThe = Object.assign(B.capThe || {}, { [T.id]: 3 }); if (T.id === 'cobac') { B.cb = (_dpsCB || [0, 0, 0]).slice(); T.cbS = 4; T.cbQuay = 0; } return r; };`);
    const dps = (id, st) => { R(ctx, `_dpsCB = ${JSON.stringify(st || [0, 0, 0])};`); return dpsBan(ctx, [[2, id, 4]], T0, { wave: 12, max: 1, hs: 400 }) * 60; };
    console.log('| unit (4★ W12, card +3) | dmg/min |'); console.log('|---|---|');
    for (const st of [[0, 0, 0], [5, 5, 5], [7, 7, 7], [10, 10, 10], [14, 14, 14], [15, 15, 15], [20, 20, 20], [30, 30, 30], [40, 40, 40]]) console.log('| Lucky Slot ' + st.join('/') + ' | ' + (dps('cobac', st) / 1000).toFixed(0) + 'k |');
        for (const id of ['chuato', 'leviathan']) if (R(ctx, `!!SKILLS['${id}']`)) console.log('| ' + id + ' | ' + (dps(id) / 1000).toFixed(0) + 'k |');
  }
}
