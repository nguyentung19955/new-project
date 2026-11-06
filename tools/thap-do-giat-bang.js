// So sánh 2 lần đo tools/thap-do-giat.js (kq_<A>.json vs kq_<B>.json) → bảng markdown theo khoảnh khắc. node tools/thap-do-giat-bang.js truoc sau
'use strict';
const fs = require('fs'), OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/giat_skill/';
const [a, b] = [process.argv[2] || 'truoc', process.argv[3] || 'sau'];
const A = JSON.parse(fs.readFileSync(OUT + 'kq_' + a + '.json')), B = JSON.parse(fs.readFileSync(OUT + 'kq_' + b + '.json'));
const sc = (F, k) => F ? F : null;
const rows = [];
for (const g in A) {
  const ka = new Map((A[g].kq || []).map(k => [k.ten, k])), kb = new Map(((B[g] || {}).kq || []).map(k => [k.ten, k]));
  for (const [t, x] of ka) {
    const y = kb.get(t); if (!y) continue;
    rows.push([g, t, x.xauV, y.xauV, x.rot, y.rot, (x.xauTag || '').match(/scale [\d.]+ms/) ? x.xauTag.match(/scale ([\d.]+)ms/)[1] : '0', (y.xauTag || '').match(/scale ([\d.]+)ms/) ? y.xauTag.match(/scale ([\d.]+)ms/)[1] : '0']);
  }
}
console.log('| nhóm | khoảnh khắc | JS khung xấu nhất TRƯỚC (ms) | SAU (ms) | khung rớt TRƯỚC | SAU | thu nhỏ ảnh trong khung xấu TRƯỚC | SAU |');
console.log('|---|---|---:|---:|---:|---:|---:|---:|');
for (const r of rows) console.log('| ' + r.join(' | ') + ' |');
const mx = (i) => Math.max(...rows.map(r => r[i]));
console.log('\nTệ nhất: TRƯỚC ' + mx(2) + ' ms → SAU ' + mx(3) + ' ms; số khoảnh khắc > 16 ms: ' + rows.filter(r => r[2] > 16).length + ' → ' + rows.filter(r => r[3] > 16).length + '; > 24 ms: ' + rows.filter(r => r[2] > 24).length + ' → ' + rows.filter(r => r[3] > 24).length);
