// TURRET MERGE — mô phỏng không giao diện cho ỤNG MỚI (cân bằng + bắt lỗi kỹ năng)
//   node tools/thap-sim-moi.js dps  [giây]          → bảng sát thương/giây 1 ụ ở 1/4/7★ (quái wave 20 vào liên tục, không chết vì lọt)
//   node tools/thap-sim-moi.js song [soLan] [che]   → bot tự chơi (deck X×3 + Gatling + Cannon), wave trung bình đạt được
//   node tools/thap-sim-moi.js che                  → chạy nhanh SOLO / CO-OP / PVP với mọi ụ mới (bắt lỗi)
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const goc = path.join(__dirname, '..', 'thap');
const FILES = ['meta', 'text', 'data', 'fx', 'tiervfx', 'game', 'skills', 'skills2', 'phattrien', 'artscale', 'skills3', 'skills4'];
function taoMoiTruong() {
  const noop = () => {};
  const ctx = { console, Math, JSON, Set, Map, Promise, Object, Array, setTimeout: (f) => { ctx._cho.push(f); }, _cho: [], performance: { now: () => 0 } };
  ctx.window = ctx;
  ctx.SND = new Proxy({}, { get: () => noop });
  ctx.VX = new Proxy({ TRE_LO: 0, hen: (d, f) => f(), t: 0, ds: [] }, { get: (o, k) => (k in o ? o[k] : noop) });
  ctx.REN = { coDau: () => 40, lamNen: noop, t: 0, img: () => null };
  ctx.UI = { vaoTran: noop, canhBaoTrum: noop, bangWave: noop, ketQua: noop };
  ctx.FONT = { display: 'x', ui: 'x' };
  vm.createContext(ctx);
  for (const f of FILES) { const p = path.join(goc, 'js', f + '.js'); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f + '.js' }); }
  vm.runInContext('G.roster = window.ROSTER_EMBED; G.rosterMap = {}; for (const r of G.roster) G.rosterMap[r.id] = r;', ctx);
  // đếm sát thương thật (không tính phần tràn quá máu còn lại)
  vm.runInContext('const _tr = trung; trung = function (E, d, o) { const h = Math.max(0, E.hp), c = E.chet; const r = _tr(E, d, o); if (!c) G._sum = (G._sum || 0) + Math.min(h, Math.max(0, h - Math.max(0, E.hp))); return r; };', ctx);
  return ctx;
}
const R = (ctx, s) => vm.runInContext(s, ctx);
function buoc(ctx, maxT, dung) {
  const dt = 1 / 30;
  for (let t = 0; t < maxT; t += dt) {
    R(ctx, 'capNhat(' + dt + ')');
    if (ctx._cho.length) { const c = ctx._cho.splice(0); c.forEach(f => f()); }
    if (dung && R(ctx, '!!G.ketThuc')) break;
  }
}
// ---- 1) DPS: 1 ụ (hoặc ụ hỗ trợ + 4 Gatling) ở sao s, quái wave W vào liên tục 2/s ----
function dps(ctx, id, sao, T0, opt) {
  opt = opt || {};
  ctx._id = id; ctx._sao = sao; ctx._o = opt;
  R(ctx, `{ G.debug = { auto: false }; batDau('solo', ['${id}', 'lien', 'canon', 'bang', 'tia'], 'hero'); G.cho = 1e9; G.wave = ${opt.wave || 20};
    const B = G.ban[0]; B.tim = 1e9; B.mana = 0;
    const dat = (o, id, s) => { const T = sinhU(taoU(B, id, s, o)); B.t[o] = T; return T; };
    if (_o.ht) { dat(7, _id, _sao); for (const o of _o.ht) dat(o, 'lien', _o.saoBan || 4); }
    else dat(_o.o != null ? _o.o : 2, _id, _sao);
    if (_o.combo) B.combo = _o.combo;
    G._sum = 0; G._q = 0; }`);
  const dt = 1 / 30;
  for (let t = 0; t < T0; t += dt) {
    if (t >= R(ctx, 'G._q') * 0.5) R(ctx, `{ G._q++; const d = taoWave(G.wave).ds; sinhQuai(pick(d), 0, 0, ${opt.hs || 6}); G.quai[G.quai.length - 1].vao = 1; }`);
    R(ctx, 'capNhat(' + dt + ')');
    if (ctx._cho.length) { const c = ctx._cho.splice(0); c.forEach(f => f()); }
  }
  return R(ctx, 'G._sum') / T0;
}
// ---- 2) bot tự chơi: wave đạt được ----
function song(ctx, che, deck, maxT) {
  ctx._deck = deck; ctx._che = che;
  R(ctx, `G.debug = { auto: true }; batDau(_che, _deck, 'hero');`);
  buoc(ctx, maxT, true);
  return R(ctx, '({ wave: G.wave, thang: G.ketThuc ? G.ketThuc.thang : null })');
}
const MOI = ['nayda', 'combo', 'khoathoigian', 'hydra', 'cuuvi', 'pandora', 'luoicheo', 'ngaithoigian', 'nemesis', 'docton', 'thaukinh', 'nhieusong', 'santhuong', 'nhatthuc', 'loren', 'guongcong', 'marionette'];
const SO = { ht: ['radar', 'khuech'], tim: ['cuongno', 'bao', 'no5', 'lienket', 'baotuyet'], vang: ['aten', 'dongbo', 'railgun', 'orbital', 'soi', 'ngoisao'], do: ['overlord', 'blackhole', 'lophanung', 'haoquang'] };
if (require.main === module) {
  const che = process.argv[2] || 'dps';
  const ctx = taoMoiTruong();
  const coSkill = (id) => R(ctx, `!!SKILLS['${id}']`);
  const moi = MOI.filter(coSkill);
  if (che === 'dps') {
    const T0 = +(process.argv[3] || 40);
    const bac = (id) => R(ctx, `G.rosterMap['${id}'].bac`);
    const ds = [...moi.filter(id => R(ctx, `SKILLS['${id}'].vai !== 'ht'`)), ...SO.tim, ...SO.vang, ...SO.do];
    console.log('| Ụ | Bậc | 1★ | 4★ | 7★ |'); console.log('|---|---|---|---|---|');
    for (const id of ds) {
      const v = [1, 4, 7].map(s => dps(ctx, id, s, T0).toFixed(0));
      console.log('| ' + R(ctx, `TEXT.turret['${id}'].name`) + (moi.includes(id) ? ' **(mới)**' : '') + ' | ' + bac(id) + ' | ' + v.join(' | ') + ' |');
    }
    // Combo Core theo COMBO, hỗ trợ theo % tăng sát thương 4 Gatling
    for (const n of [10, 20]) console.log('| Combo Core COMBO ' + n + ' | tim | ' + [1, 4, 7].map(s => dps(ctx, 'combo', s, T0, { combo: n }).toFixed(0)).join(' | ') + ' |');
    const nen = dps(ctx, 'radar', 1, T0, { ht: [1, 3, 11, 13], o: 7 });
    for (const [id, ht] of [['luoicheo', [1, 3, 11, 13]], ['khuech', [2, 6, 8, 12]], ['radar', [2, 6, 8, 12]], ['chimang', [2, 6, 8, 12]]].concat(moi.includes('thaukinh') ? [['thaukinh', [2, 6, 8, 12]]] : [])) {
      const v = [1, 4, 7].map(s => { const goc0 = dps(ctx, 'mana', 1, T0, { ht: ht }); const co = dps(ctx, id, s, T0, { ht }); return '+' + Math.round((co / goc0 - 1) * 100) + '%'; });
      console.log('| ' + R(ctx, `TEXT.turret['${id}'].name`) + ' (4 Gatling 4★) | ' + bac(id) + ' | ' + v.join(' | ') + ' |');
    }
  } else if (che === 'song') {
    const n = +(process.argv[3] || 3), mode = process.argv[4] || 'solo';
    const ds = process.argv[5] ? process.argv[5].split(',') : [...moi, ...SO.ht, ...SO.tim, ...SO.vang, ...SO.do];
    const base = []; for (let i = 0; i < n; i++) base.push(song(ctx, mode, ['lien', 'lien', 'lien', 'lien', 'canon'], 1500).wave);
    console.log('NỀN (Gatling×4 + Cannon):', (base.reduce((a, b) => a + b) / n).toFixed(1));
    for (const id of ds) {
      const ws = [];
      for (let i = 0; i < n; i++) { try { ws.push(song(ctx, mode, R(ctx, `SKILLS['${id}'].vai`) === 'ht' ? [id, 'lien', 'lien', 'lien', 'canon'] : [id, id, id, 'lien', 'canon'], 1500).wave); } catch (e) { console.log('LỖI', id, e.stack.split('\n').slice(0, 4).join(' | ')); ws.push(0); break; } }
      console.log(id.padEnd(13), R(ctx, `G.rosterMap['${id}'].bac`).padEnd(5), (ws.reduce((a, b) => a + b) / ws.length).toFixed(1), moi.includes(id) ? '(mới)' : '');
    }
  } else if (che === 'che') {
    for (const mode of ['solo', 'coop', 'pvp']) for (const id of moi) {
      try {
        ctx._deck = [id, 'lien', 'canon', moi[(moi.indexOf(id) + 1) % moi.length], 'mimic']; ctx._che = mode;
        ctx._deck2 = [id, 'nhanban', 'mimic', 'bang', 'lien'];
        R(ctx, `G.debug = { auto: true, deck2: _deck2, mana: 3000, wave: 9 }; batDau(_che, _deck, 'hero');`);
        buoc(ctx, 120, false);
        console.log(mode.padEnd(5), id.padEnd(13), 'wave', R(ctx, 'G.wave'), 'ok');
      } catch (e) { console.log('LỖI', mode, id, e.stack.split('\n').slice(0, 5).join(' | ')); }
    }
  }
}
module.exports = { taoMoiTruong, dps, song };
