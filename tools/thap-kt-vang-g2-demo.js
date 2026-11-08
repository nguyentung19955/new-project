// TURRET MERGE — khung Test range (clip ?preview=<id>, skilldemo.js) của 9 ụ làm lại 08/11: chạy 1★ / 4★ / 7★, không lỗi, chụp 2 thời điểm.
//   BASE=http://localhost:8765/thap/ NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-vang-g2-demo.js   (ảnh: tools/shots-vang-g2/demo-*.png)
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.env.SHOTS || path.join(__dirname, 'shots-vang-g2');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); let loi = 0;
  const ctx = await b.newContext({ viewport: { width: 390, height: 520 }, deviceScaleFactor: 2 });
  for (const id of (process.env.IDS || 'lualien,hopca,luutru,loren,bienmau,mauhut,railgun,tienhoa,xuonganh').split(',')) for (const s of [1, 4, 7]) {
    const p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(BASE + 'index.html?preview=' + id + '&star=' + s + '&notut=1', { waitUntil: 'load' });
    await sleep(3400); if (s === 4) await p.screenshot({ path: path.join(OUT, 'demo-' + id + '-' + s + 'a.png') });
    await sleep(2600); if (s === 4) await p.screenshot({ path: path.join(OUT, 'demo-' + id + '-' + s + 'b.png') });
    console.log((errs.length ? '  ✗ ' : '  ✓ ') + id + ' ' + s + '★ ' + errs.slice(0, 2).join(' | ')); if (errs.length) loi++;
    await p.close();
  }
  await b.close(); process.exit(loi ? 1 : 0);
})();
