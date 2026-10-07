'use strict';
// Kiểm tra cấu trúc firestore.rules: ngoặc cân bằng, các khối match nằm đúng cấp
// (lỗi gộp nhánh từng làm rooms/… lồng nhầm vào feedback/{id} — Firebase vẫn cho publish nhưng luật áp sai đường dẫn).
const fs = require('fs'), path = require('path');
const { check } = require('./harness');

function run() {
  console.log('• Cấu trúc firestore.rules');
  const src = fs.readFileSync(path.join(__dirname, '..', '..', 'firestore.rules'), 'utf8').replace(/\/\/.*$/gm, '');
  let depth = 0;
  const at = {};
  for (const line of src.split('\n')) {
    const m = line.trim().match(/^match\s+(\S+)/);
    if (m) at[m[1]] = depth;
    depth += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
    if (depth < 0) break;
  }
  check(depth === 0, 'ngoặc { } cân bằng');
  for (const p of ['/users/{uid}', '/boards/{board}/scores/{uid}', '/feedback/{id}', '/rooms/{code}']) check(at[p] === 2, `${p} nằm ngay dưới /databases/{database}/documents`);
  for (const p of ['/cmds/{id}', '/reqs/{id}', '/snap/{id}', '/chat/{id}']) check(at[p] === 3, `${p} nằm trong /rooms/{code}`);
}
module.exports = run;
if (require.main === module) { try { run(); } catch (e) { console.error(e.message); process.exit(1); } }
