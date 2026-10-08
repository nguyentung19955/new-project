#!/usr/bin/env node
// claude/xuat-goi-pixel: sinh spec bản đồ pixel tools/pixel/spec/ban-do.json từ dữ liệu bản đồ CỦA GAME
//   chạy js/data.js + js/game.js trong vm Node → setMap(id) → đường đi (MAPS[id].d, hoặc mảng nhiều nhánh d / paths)
//   + ô đặt tướng CONFIG.slots đúng như trong trận (buildSpots). Dạng đường mới thêm vào MAPS → chạy lại lệnh này.
//   node tools/build-ban-do-spec.js [--out tools/pixel/spec/ban-do.json] [--chi song1,bien1]
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const out = path.resolve(arg('--out') || path.join(ROOT, 'tools/pixel/spec/ban-do.json'));
const chi = arg('--chi') ? new Set(arg('--chi').split(',')) : null;

const noop = () => {};
const el = new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : el), apply: () => el, construct: () => el });
const ctx = { console: { log: noop, warn: noop, error: noop }, Math, JSON, Date, setTimeout: noop, clearTimeout: noop, performance: { now: () => 0 },
  localStorage: { getItem: () => null, setItem: noop }, navigator: { userAgent: '' }, location: { search: '', href: '' } };
ctx.window = ctx; ctx.self = ctx; ctx.document = el; ctx.Image = function () {}; ctx.addEventListener = noop;
vm.createContext(ctx);
// chapters.js: đăng ký bản đồ dạng đường của mọi ải (levelMapId, claude/ban-do-moi)
for (const f of ['js/data.js', 'js/game.js', 'js/chapters.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
// loại đường theo chủ đề: PATH_KIND trong js/maps.js (chỉ đọc hằng số, maps.js cần DOM)
const pk = fs.readFileSync(path.join(ROOT, 'js/maps.js'), 'utf8').match(/const PATH_KIND = (\{[^}]*\})/);
const PATH_KIND = pk ? vm.runInNewContext('(' + pk[1] + ')') : {};

const maps = vm.runInContext('MAPS', ctx), DK = vm.runInContext('DK', ctx);
const r1 = (v) => Math.round(v * 10) / 10;
const list = [];
for (const [id, m] of Object.entries(maps)) {
  if (chi && !chi.has(id)) continue;
  vm.runInContext(`MAP_ID = ''; setMap(${JSON.stringify(id)})`, ctx);
  const slots = vm.runInContext('CONFIG.slots', ctx).map(([x, y]) => [r1(x / DK), r1(y / DK)]);
  // claude/ban-do-moi: bản đồ dạng đường có cảnh riêng (núi giữa / sông bến đò) game tự vẽ bằng pxMapGround → bỏ qua
  if (m.mount || m.ferry) continue;
  let d = m.paths || m.d;   // nhiều nhánh: mảng chuỗi path
  // nhiều nhánh (chia / nhập nhánh): nhánh phụ chỉ giữ đoạn KHÔNG trùng nhánh trước (cắt hở 18 đơn vị quanh chỗ chia / nhập)
  // — tool coi hai nhánh chạm nhau là "cắt nhau" và vẽ cầu, chỗ chia nhánh không phải cầu
  if (m.lanes && m.lanes.length) {
    const prev = [vm.runInContext(`sampleSvgPath(${JSON.stringify(m.d)})`, ctx)];
    d = [m.d];
    for (const ld of m.lanes) {
      const pts = vm.runInContext(`sampleSvgPath(${JSON.stringify(ld)})`, ctx);
      const far = (p) => prev.every((q) => vm.runInContext(`distToPolyline(${JSON.stringify(q)}, ${p[0]}, ${p[1]})`, ctx) >= 18);
      let run = [];
      const flush = () => { if (run.length > 1) d.push('M ' + run.map(([x, y]) => `${r1(x)} ${r1(y)}`).join(' L ')); run = []; };
      for (const p of pts) { if (far(p)) run.push(p); else flush(); }
      flush();
      prev.push(pts);
    }
  }
  list.push({ ma: `ban-do/${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, ten: `Bản đồ ${id} (${m.theme})`, bo_phan: { chu_de: m.theme, ...(PATH_KIND[m.theme] ? { duong_loai: PATH_KIND[m.theme] } : {}) }, duong: d, o_dat: slots });
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, '{ "ma": [\n' + list.map((x) => '  ' + JSON.stringify(x)).join(',\n') + '\n] }\n');
console.log(`build-ban-do-spec: ${list.length} bản đồ → ${path.relative(process.cwd(), out)}`);
