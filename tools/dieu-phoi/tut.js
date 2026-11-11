const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8799/index.html?tut=1'); await p.waitForTimeout(12000);
  const r = await p.evaluate(() => ({ mv: typeof HD !== 'undefined' && HD.MV, ban: typeof G !== 'undefined' && G.ban && G.ban.length, dang: typeof HD !== 'undefined' && HD.dang }));
  await p.screenshot({ path: '/tmp/tut.png' });
  console.log(JSON.stringify(r), 'errors:', errs.slice(0, 3));
  await b.close();
})();
