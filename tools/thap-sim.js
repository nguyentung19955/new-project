// TURRET MERGE — mô phỏng bot không giao diện (cân bằng + bắt lỗi kỹ năng)
// Dùng: node tools/thap-sim.js [soLan] [cheDo]   → in bảng wave trung bình theo từng ụ
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const goc = path.join(__dirname, '..', 'thap');
function taoMoiTruong() {
  const noop = () => {};
  const ctx = { console, Math, JSON, setTimeout: (f) => { ctx._cho.push(f); }, _cho: [], performance: { now: () => 0 } };
  ctx.window = ctx;
  ctx.SND = new Proxy({}, { get: () => noop });
  ctx.REN = { coDau: () => 40, lamNen: noop, t: 0 };
  ctx.UI = { vaoTran: noop, canhBaoTrum: noop, bangWave: noop, ketQua: noop };
  vm.createContext(ctx);
  for (const f of ['meta', 'text', 'data', 'fx', 'game', 'skills', 'skills2']) vm.runInContext(fs.readFileSync(path.join(goc, 'js', f + '.js'), 'utf8'), ctx, { filename: f + '.js' });
  vm.runInContext('G.roster = window.ROSTER_EMBED; G.rosterMap = {}; for (const r of G.roster) G.rosterMap[r.id] = r;', ctx);
  return ctx;
}
function chay(ctx, che, deck, deck2, maxT) {
  ctx._deck = deck; ctx._deck2 = deck2 || null; ctx._che = che;
  vm.runInContext(`G.debug = { auto: true, deck2: _deck2 }; batDau(_che, _deck, 'hero');`, ctx);
  const dt = 1 / 30;
  for (let t = 0; t < maxT; t += dt) {
    vm.runInContext('capNhat(' + dt + ')', ctx);
    if (ctx._cho.length) { const c = ctx._cho.splice(0); c.forEach(f => f()); }
    if (vm.runInContext('!!G.ketThuc', ctx)) break;
  }
  return vm.runInContext('({ wave: G.wave, thang: G.ketThuc ? G.ketThuc.thang : null, mana: G.ban[0].manaNay })', ctx);
}
if (require.main === module) {
  const n = +(process.argv[2] || 2), che = process.argv[3] || 'solo';
  const ctx = taoMoiTruong();
  const ids = vm.runInContext('G.roster.filter(r => SKILLS[r.id]).map(r => r.id + ":" + r.bac)', ctx);
  const nen = ['lien', 'canon', 'bang', 'tia'];
  const kq = [];
  const base = []; for (let i = 0; i < n; i++) base.push(chay(ctx, che, ['lien', 'lien', 'lien', 'lien', 'canon'], null, 1700).wave);
  console.log('NỀN (lien×4, canon):', (base.reduce((a, b) => a + b) / n).toFixed(1));
  for (const s of ids) {
    const [id, bac] = s.split(':');
    const ws = [];
    for (let i = 0; i < n; i++) {
      try { ws.push(chay(ctx, che, [id, id, id, 'lien', 'canon'], null, 1700).wave); }
      catch (e) { console.log('LỖI', id, e.stack.split('\n').slice(0, 3).join(' | ')); ws.push(0); break; }
    }
    kq.push({ id, bac, w: ws.reduce((a, b) => a + b) / ws.length });
  }
  for (const b of ['trang', 'xanh', 'tim', 'vang', 'do']) {
    const ds = kq.filter(k => k.bac === b);
    console.log(b.toUpperCase(), 'tb', (ds.reduce((a, k) => a + k.w, 0) / ds.length).toFixed(1), '|', ds.map(k => k.id + ' ' + k.w.toFixed(1)).join(', '));
  }
}
module.exports = { taoMoiTruong, chay };
