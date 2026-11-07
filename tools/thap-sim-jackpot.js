// TURRET MERGE — đo JACKPOT + CỘNG GỘP (thap/js/jackpot.js, tư vấn ChatGPT 07/11)
//   node tools/thap-sim-jackpot.js boi            → hệ số DPS xấu nhất (ụ chồng mọi nguồn) — kiểu NHÂN cũ (CONG_GOP=false) vs CỘNG GỘP
//   node tools/thap-sim-jackpot.js nhip [lan]     → nhịp: wave ĐỘT PHÁ đầu / JACKPOT đầu (bàn người chơi = bot), SOLO + PVP, mỗi bộ bài `lan` lần (mặc định 4)
// Mô phỏng không giao diện, RNG có hạt giống (tools/thap-sim-vaitro.js). Bot thêm 2 thói quen "người chơi có chủ đích": cho Lò ăn ụ 1–3★ thiếu bậc,
//   Blood Circuit hiến khi bàn kẹt (skills7). Còn lại bot ghép như sim-vaitro (không căn màu Prism / không giữ đội hình Choir có chủ đích).
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const { taoMoiTruong, R, buoc } = require('./thap-sim-vaitro.js');
const goc = path.join(__dirname, '..', 'thap');
function moi(hat) {
  const ctx = taoMoiTruong(hat);
  vm.runInContext("if (typeof SUP === 'undefined') { var SUP = {}, SUP_LOAI = {}, SUP_GIA = {}; }", ctx);
  for (const f of ['vangmoi1', 'skills7', 'jackpot']) vm.runInContext(fs.readFileSync(path.join(goc, 'js', f + '.js'), 'utf8'), ctx, { filename: f + '.js' });
  return ctx;
}

// ---------- 1) hệ số DPS xấu nhất ----------
// Ember Relay 7★ ô 7 (giữa): 40 lửa (+400% ST, ĐỘT PHÁ IV) · Mimic vừa ghép · 4 hỗ trợ 7★ kề (Radar / Hammer / Focus Lens / Crit Antenna)
// · Scrap Forge 60 cộng dồn (+240%, ĐỘT PHÁ IV khó 4) · ô anh hùng · MASTERWORK đang chạy · Overclock · RAGE ×2 — so với chính ụ đó 7★ không buff
function boi() {
  const ctx = moi(7);
  const do1 = (cong) => R(ctx, `(() => { CONG_GOP = ${cong}; G.debug = { auto: false }; batDau('solo', ['lualien', 'radar', 'bua', 'thaukinh', 'loren'], 'hero'); G.cho = 1e9;
    const B = G.ban[0]; B.t.fill(null); B.mana = 0;
    const dat = (o, id, s) => { const T = sinhU(taoU(B, id, s, o)); B.t[o] = T; return T; };
    const X = dat(7, 'lualien', 7);
    const dps = () => { capNhatBan(B, 1 / 30); const c = critU(X), m = (2 + (X.buf.cdmg || 0)) * (!CONG_GOP ? 1 + JP.gt(X, 'cdmg') / 2 : 1); return dmgU(X) * tocU(X) * (1 + c * (m - 1)); };
    const d0 = dps();
    X.lc = 40; X.aurora = 8; X.epxung = 0.9;
    dat(2, 'radar', 7); dat(6, 'bua', 7); dat(8, 'thaukinh', 7); dat(12, 'chimang', 7);
    const F = dat(0, 'loren', 7); F.lo = 60;
    B.hero = [{ o: 7, het: 1e9, v: 0.56, t0: 0 }];
    X.jp = { masterwork: { het: 1e9, t0: 0, dmg: JP.DS.masterwork.dmg, toc: JP.DS.masterwork.toc, cdmg: JP.DS.masterwork.cdmg, k: 'x' } };
    B.cuong = 10;
    const d1 = dps();
    return { boi: d1 / d0, dmg: X.buf.dmg, toc: X.buf.toc + X.epxung, crit: Math.min(1, critU(X)), cdmg: X.buf.cdmg };
  })()`);
  const nhan = do1(false), cong = do1(true);
  R(ctx, 'CONG_GOP = true');
  console.log('Kịch bản: Ember Relay 7★ 40 lửa + Mimic + Radar/Hammer/Focus Lens/Crit Antenna 7★ + Forge 60 + ô anh hùng + MASTERWORK + Overclock + RAGE');
  console.log('  NHÂN cũ   : ×' + nhan.boi.toFixed(1));
  console.log('  CỘNG GỘP  : ×' + cong.boi.toFixed(1) + '  (nhóm ST +' + Math.round(cong.dmg * 100) + '%, tốc +' + Math.round(cong.toc * 100) + '%, chí mạng ' + Math.round(cong.crit * 100) + '%, STCM +' + Math.round(cong.cdmg * 100) + '%)');
  return { nhan: nhan.boi, cong: cong.boi };
}

// ---------- 2) nhịp đột phá / jackpot ----------
const BOT2 = `aiBan = (function (goc) { return function (B, dt) {
  if (G._bot && B === G.ban[0] && (B._ai2 = (B._ai2 || 0) - dt) <= 0) {
    B._ai2 = 0.7;
    // Lò Rèn: cho ăn ụ 1–3★ (không phải ụ Tấn công sao cao nhất), ưu tiên bậc sao Lò chưa có trong 75 s
    const F = B.t.find(X => X && X.id === 'loren' && !biKhoa(X));
    if (F && oTrong(B).length <= 3) {
      const g = F.mw || {}, best = JP.tcCao(B), ds = B.t.filter(X => X && X !== F && X !== best && X.id !== 'loren' && X.sao <= 3 && !biKhoa(X) && hopLeGhep(F, X));
      ds.sort((a, b) => ((g[a.sao] != null) - (g[b.sao] != null)) || a.sao - b.sao);
      if (ds[0]) { ghep(B, F, ds[0]); return; }
    }
  }
  return goc(B, dt);
}; })(aiBan);`;
const BO = {
  'Orbital': ['orbital', 'lien', 'canon', 'tia', 'set'],
  'Compass': ['canon', 'lien', 'tia', 'set', 'radar'],
  'Choir': ['hopca', 'lien', 'canon', 'tia', 'set'],
  'Dice+Radar': ['xucxac', 'lien', 'canon', 'tia', 'radar'],
  'Pandora': ['pandora', 'lien', 'canon', 'tia', 'set'],
  'Chain Link': ['lienket', 'lien', 'canon', 'tia', 'set'],
  'Prism': ['bienmau', 'lien', 'canon', 'tia', 'set'],
  'Blood': ['mauhut', 'lien', 'canon', 'tia', 'set'],
  'Forge': ['loren', 'lien', 'canon', 'tia', 'set'],
  'Ember': ['lualien', 'lien', 'canon', 'tia', 'set'],
  'Leviathan': ['leviathan', 'lien', 'canon', 'tia', 'set'],
};
function mot(ctx, che, deck, maxT) {
  ctx._deck = deck; ctx._che = che;
  if (!ctx._coBot2) { ctx._coBot2 = 1; R(ctx, BOT2); }
  R(ctx, `G.debug = { auto: true }; G._bot = true; batDau(_che, _deck, 'hero'); G._dp = 0;`);
  const dt = 1 / 30; let dp = 0;
  for (let t = 0; t < maxT; t += dt) {
    R(ctx, 'capNhat(' + dt + ')');
    if (ctx._cho.length) ctx._cho.splice(0).forEach(f => f());
    if (!dp && ((t * 30) | 0) % 30 === 0 && R(ctx, 'G.ban[0].t.some(T => T && (DOTPHA.bacU(T) > 0 || (T.dpNhan > 0 && G.t - T.dpNhanT < 0.5)))')) dp = R(ctx, 'G.wave');
    if (R(ctx, '!!G.ketThuc')) break;
  }
  const log = R(ctx, 'G.jpLog.filter(l => l.ban === 0)');
  return { dp, jp: log.length ? log[0].w : 0, n: log.length, ids: [...new Set(log.map(l => l.id))].join(','), wave: R(ctx, 'G.wave') };
}
function nhip(lan) {
  const kq = {};
  for (const che of ['solo', 'pvp']) for (const ten in BO) {
    const ds = [];
    for (let i = 0; i < lan; i++) {
      const ctx = moi(1000 + i * 17 + che.length);
      // nạp bot gốc (sim-vaitro) rồi bot thêm
      require('./thap-sim-vaitro.js').song(ctx, che, BO[ten], 0.01);
      ds.push(mot(ctx, che, BO[ten], che === 'solo' ? 20 * 26 : 20 * 22));
    }
    const tb = (k) => { const v = ds.map(d => d[k]).filter(x => x > 0); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) + ' (' + v.length + '/' + ds.length + ')' : '— (0/' + ds.length + ')'; };
    kq[che + ' ' + ten] = { dp: tb('dp'), jp: tb('jp'), n: (ds.reduce((a, d) => a + d.n, 0) / ds.length).toFixed(1), ids: [...new Set(ds.map(d => d.ids).join(',').split(',').filter(Boolean))].join(','), wave: (ds.reduce((a, d) => a + d.wave, 0) / ds.length).toFixed(1) };
  }
  console.log('| Chế độ · bộ | ĐỘT PHÁ đầu (wave) | JACKPOT đầu (wave) | jackpot/trận | loại | wave đạt |'); console.log('|---|---|---|---|---|---|');
  for (const k in kq) console.log('| ' + k + ' | ' + kq[k].dp + ' | ' + kq[k].jp + ' | ' + kq[k].n + ' | ' + (kq[k].ids || '—') + ' | ' + kq[k].wave + ' |');
  return kq;
}

if (require.main === module) {
  const che = process.argv[2] || 'boi';
  if (che === 'boi') boi();
  else if (che === 'nhip') nhip(+(process.argv[3] || 4));
}
module.exports = { boi, nhip };
