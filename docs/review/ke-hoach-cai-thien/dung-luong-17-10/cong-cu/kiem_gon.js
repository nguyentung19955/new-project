// node kiem_gon.js a.js b.js [c.js d.js …]: so dãy mảnh (token) của từng cặp tệp bằng acorn (kiểu, giá trị, chữ gốc, có xuống dòng trước hay không); khác → thoát 1. ACORN=<đường dẫn acorn> nếu không ở /opt/npm-tools.
const acorn = require(process.env.ACORN || '/opt/npm-tools/node_modules/acorn'); const fs = require('fs');
function toks(s) { const r = []; let prevEnd = 0; for (const t of acorn.tokenizer(s, { ecmaVersion: 'latest', sourceType: 'script' })) { const nl = /[\n\r\u2028\u2029]/.test(s.slice(prevEnd, t.start)); r.push([t.type.label, t.type.label === 'regexp' ? String(t.value.pattern) + '/' + t.value.flags : t.value === undefined ? '' : String(t.value), nl, s.slice(t.start, t.end)]); prevEnd = t.end; } return r; }
let bad = 0;
for (let k = 2; k < process.argv.length; k += 2) {
  const a = toks(fs.readFileSync(process.argv[k], 'utf8')), b = toks(fs.readFileSync(process.argv[k + 1], 'utf8'));
  let ok = a.length === b.length;
  for (let i = 0; ok && i < a.length; i++) if (a[i][0] !== b[i][0] || a[i][1] !== b[i][1] || a[i][2] !== b[i][2] || a[i][3] !== b[i][3]) { ok = false; console.log('KHÁC', process.argv[k], i, JSON.stringify(a[i]), JSON.stringify(b[i])); }
  if (!ok) { bad++; if (a.length !== b.length) console.log('KHÁC số mảnh', process.argv[k], a.length, b.length); }
}
console.log(bad ? 'LỖI ' + bad : 'ĐẠT ' + (process.argv.length - 2) / 2 + ' tệp');
process.exit(bad ? 1 : 0);
