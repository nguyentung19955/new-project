// TURRET MERGE — KIỂM "Ụ KHÔNG BẮN": mọi ụ thẻ ghi "Does not shoot" (dmg 0, trừ bang/doc/bomhen) KHÔNG được tự gây sát thương bằng đòn bắn/chọc.
//   Ngoại lệ có chủ đích (sát thương từ kỹ năng mô tả rõ: tường nổ, bom, hố đen…) ghi trong NGOAI_LE kèm lý do.
//   node tools/thap-kt-khong-ban.js   (✓/✗, mã thoát 1 nếu có lỗi)
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const goc = path.join(__dirname, '..', 'thap');
const FILES = ['meta', 'text', 'data', 'thebai', 'fx', 'tiervfx', 'game', 'chihuy', 'skills', 'skills2', 'phattrien', 'artscale', 'skills3', 'skills4', 'skills5', 'vangmoi1', 'hotro', 'growfx'];
function moiTruong() {
  const noop = () => {};
  const ctx = { console, Math, JSON, Set, Map, WeakMap, WeakSet, Promise, Object, Array, setTimeout: (f) => { ctx._cho.push(f); }, _cho: [], performance: { now: () => 0 }, localStorage: { getItem: () => null, setItem: noop } };
  ctx.window = ctx; ctx.location = { search: '' };
  ctx.SND = new Proxy({}, { get: () => noop });
  ctx.VX = new Proxy({ TRE_LO: 0, hen: (d, f) => f(), t: 0, ds: [] }, { get: (o, k) => (k in o ? o[k] : noop) });
  ctx.BVX = new Proxy({}, { get: () => noop });
  ctx.REN = { coDau: () => 40, lamNen: noop, t: 0, img: () => null, s: 1, dpr: 1 };
  ctx.UI = { vaoTran: noop, canhBaoTrum: noop, bangWave: noop, ketQua: noop };
  ctx.FONT = { display: 'x', ui: 'x' };
  vm.createContext(ctx);
  for (const f of FILES) { const p = path.join(goc, 'js', f + '.js'); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f + '.js' }); }
  vm.runInContext('G.roster = window.ROSTER_EMBED; G.rosterMap = {}; for (const r of G.roster) G.rosterMap[r.id] = r;', ctx);
  vm.runInContext('const _tr = trung; trung = function (E, d, o) { const h = Math.max(0, E.hp), c = E.chet; const r = _tr(E, d, o); if (!c) G._sum = (G._sum || 0) + Math.min(h, Math.max(0, h - Math.max(0, E.hp))); return r; };', ctx);
  return ctx;
}
const ctx = moiTruong(), R = (s) => vm.runInContext(s, ctx);
const buoc = (t) => { for (let x = 0; x < t; x += 1 / 30) { R('capNhat(1/30)'); if (ctx._cho.length) ctx._cho.splice(0).forEach(f => f()); } };
R(`var _dmg = {}; const _t2 = trung; trung = function (E, d, o) { const T = (o && o.T) || G.dangBan; const h = E.hp; const r = _t2(E, d, o); if (T && T.id) _dmg[T.id] = (_dmg[T.id] || 0) + Math.max(0, h - E.hp); return r; };`);
const NGOAI_LE = JSON.parse(process.env.NGOAI_LE || '{}');
const ids = R(`Object.keys(SKILLS).filter(k => !SKILLS[k].dmg && !['bang','doc','bomhen'].includes(k) && G.rosterMap[k])`);
let loi = 0;
for (const id of ids) {
  let max = 0;
  for (const s of [1, 4, 7]) {
    ctx._d = [id, 'lien', 'canon', 'tia', 'set'];
    R(`G.debug = {}; batDau('solo', _d, 'hero'); G.cho = 0; var B = G.ban[0]; B.t.fill(null); B.mana = 0; _dmg = {}; var T = sinhU(taoU(B, '${id}', ${s}, 7)); B.t[7] = T;`);
    buoc(25);
    max = Math.max(max, R(`_dmg['${id}'] || 0`));
  }
  if (max > 0 && !NGOAI_LE[id]) { console.log('  ✗ ' + id + ' (thẻ: Does not shoot) gây ' + Math.round(max) + ' sát thương'); loi++; }
  else console.log('  ✓ ' + id + (max > 0 ? ' — ngoại lệ: ' + NGOAI_LE[id] : ''));
}
console.log(loi ? '✗ thap-kt-khong-ban: ' + loi + ' ụ "không bắn" vẫn gây sát thương' : '✓ thap-kt-khong-ban: đạt (' + ids.length + ' ụ)');
process.exit(loi ? 1 : 0);
