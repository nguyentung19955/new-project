// TURRET MERGE — gộp kết quả tools/thap-bot-tran.js (--ra …json) thành bảng Markdown "bộ → wave trước / sau, đỉnh quái sống".
// Chạy: node tools/thap-bot-bang.js docs/demo-hop-tuong/tocban/bot-wave-goc.json …-A.json …-B.json
'use strict';
const fs = require('fs');
const tv = (a) => { a = a.slice().sort((x, y) => x - y); const n = a.length; return n ? (n % 2 ? a[(n - 1) / 2] : Math.round((a[n / 2 - 1] + a[n / 2]) / 2)) : 0; };
const B = {}, bts = [], ten = [];
for (const f of process.argv.slice(2)) for (const x of JSON.parse(fs.readFileSync(f, 'utf8'))) {
  if (!bts.includes(x.bt)) bts.push(x.bt); if (!ten.includes(x.ten)) ten.push(x.ten);
  ((B[x.ten] = B[x.ten] || {})[x.bt] = B[x.ten][x.bt] || []).push(x);
}
const o = (t, bt) => { const r = (B[t][bt] || []).filter(x => !x.kq.loi); if (!r.length) return ['–', '–'];
  const w = r.map(x => x.kq.wave), d = r.map(x => x.kq.dinh), th = r.filter(x => x.kq.thang).length, thap = r[0].ca.che === 'thap';
  const mn = r.map(x => Object.keys(x.kq.w).filter(k => +k <= 30).reduce((s, k) => s + (x.kq.w[k].mn || 0), 0));
  return [thap ? th + '/' + r.length + (th ? ' (♥' + tv(r.filter(x => x.kq.thang).map(x => x.kq.tim)) + ')' : '') + ' w' + r[0].kq.cd.w0 + '–' + r[0].kq.cd.w1
    : tv(w) + ' (' + Math.min(...w) + '–' + Math.max(...w) + ')' + (th ? ' ✓' + th : ''), tv(d) + '/' + Math.max(...d), tv(mn), r.reduce((s, x) => s + (x.kq.ket | 0), 0)]; };
console.log('| Bộ | ' + bts.map(b => 'wave ' + b).join(' | ') + ' | ' + bts.map(b => 'đỉnh ' + b).join(' | ') + ' |');
console.log('|---|' + bts.map(() => '---|').join('') + bts.map(() => '---|').join(''));
for (const t of ten) console.log('| ' + t + ' | ' + bts.map(b => o(t, b)[0]).join(' | ') + ' | ' + bts.map(b => o(t, b)[1]).join(' | ') + ' |');
console.log('\nmana giết ≤ wave 30 (trung vị) · số lần bot kẹt:');
for (const t of ten) console.log('  ' + t + ': ' + bts.map(b => b + ' ' + o(t, b)[2] + ' · kẹt ' + o(t, b)[3]).join(' | '));
