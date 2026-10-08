// Gỡ khỏi tools/pixel/spec/*.json các mã đã VẼ LẠI tay (tránh `ve-pixel.js --nap --ghi-de` ghi đè bản vẽ tay bằng bản chuyển ảnh / phác thảo).
// Danh sách mã: tools/pixel/ve-lai/DA-VE-LAI.json. Chạy: node tools/pixel/ve-lai/bo-spec.js
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../../..');
const ds = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'DA-VE-LAI.json'), 'utf8')));
for (const f of fs.readdirSync(path.join(ROOT, 'tools/pixel/spec')).filter((f) => f.endsWith('.json'))) {
  const p = path.join(ROOT, 'tools/pixel/spec', f), j = JSON.parse(fs.readFileSync(p, 'utf8'));
  const arr = Array.isArray(j) ? j : j.ma;
  if (!Array.isArray(arr)) continue;
  const moi = arr.filter((x) => !ds.has(x.ma));
  if (moi.length === arr.length) continue;
  const body = moi.map((x) => '  ' + JSON.stringify(x)).join(',\n');
  fs.writeFileSync(p, Array.isArray(j) ? `[\n${body}\n]\n` : `{ "ma": [\n${body}\n] }\n`);
  console.log(f, arr.length, '→', moi.length);
}
