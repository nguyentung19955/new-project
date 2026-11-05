// TURRET MERGE — KIỂM người chơi MỚI (localStorage trống → vào thẳng trận hướng dẫn) trên 4G giả lập, bộ đệm trống:
//  trận chạy → 15 s sau: REN.thieu / TAI.thieu rỗng, mọi dải TRÙM đã tải nền xong, không <img> HUD trống, 0 lỗi trang / 4xx.
//  NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-khoidong-hd.js <url thap/ bản xuất bản>
'use strict';
const { chromium, devices } = require('playwright');
(async () => {
  const br = await chromium.launch({ args: ['--ignore-certificate-errors'] });
  const ctx = await br.newContext({ ...devices['iPhone 13'], ignoreHTTPSErrors: true });
  const p = await ctx.newPage(); const errs = [], hong = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('response', r => { if (r.status() >= 400) hong.push(r.status() + ' ' + r.url()); });
  const cdp = await ctx.newCDPSession(p); await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 165, downloadThroughput: 1012500, uploadThroughput: 168750 });
  const t0 = Date.now(); await p.goto(process.argv[2]);
  await p.waitForFunction(() => typeof HD !== 'undefined' && HD.dang && G.ban.length && !TAI.cho, null, { timeout: 120000 });
  console.log('tutorial ready', Date.now() - t0, 'ms');
  await p.waitForTimeout(15000);
  const r = await p.evaluate(() => { const tr = Object.keys(REN.anh).filter(k => /^trum_/.test(k)); const ok = tr.filter(k => { const a = REN.anh[k]; return a._cv || (a.complete && a.naturalWidth); }); const can = TRUM_THU_TU.length; return { renThieu: [...REN.thieu], taiThieu: [...TAI.thieu], trumCo: ok.length, trumTong: tr.length, nenXong: TAI.nenXong, imgTrong: [...document.querySelectorAll('#duoi img, #top img')].filter(i => i.getClientRects().length && !(i.complete && i.naturalWidth)).map(i => i.getAttribute('src') || i.getAttribute('data-tm-src')) }; });
  console.log(JSON.stringify(r), 'errs', errs.slice(0, 3), 'hong', hong.slice(0, 5));
  await br.close();
})();
