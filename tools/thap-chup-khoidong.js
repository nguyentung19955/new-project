// Ảnh dòng thời gian khởi động (trước/sau): chụp màn ở các mốc giây trên Fast 3G, bộ đệm trống → 1 tấm ghép.
// NODE_PATH=/opt/npm-tools/node_modules node tools/thap-chup-khoidong.js <url> <nhãn> <ra.png> [mốc giây, vd 1,3,6,15,30]
'use strict';
const { chromium } = require('playwright');
const [URL_, NHAN, RA, MOC = '1,3,6,15,30'] = process.argv.slice(2);
(async () => {
  const br = await chromium.launch();
  const ctx = await br.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => localStorage.setItem('turret_hd', JSON.stringify({ xong: true, boQua: true, buoc: {} })));
  const pg = await ctx.newPage(), cdp = await ctx.newCDPSession(pg);
  await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 562.5, downloadThroughput: 1.44e6 / 8, uploadThroughput: 675e3 / 8 });
  const ms = MOC.split(',').map(Number), anh = [];
  const t0 = Date.now(); pg.goto(URL_, { waitUntil: 'commit' }).catch(() => { });
  for (const s of ms) {
    const con = s * 1000 - (Date.now() - t0); if (con > 0) await pg.waitForTimeout(con);
    const p = await pg.evaluate(() => { const t = document.getElementById('tai'); return t && !t.hidden ? (t.dataset.p || '0') + '%' : (typeof TAI !== 'undefined' && TAI.daBoot ? 'HOME' : '—'); }).catch(() => '—');
    anh.push({ s, p, b64: (await pg.screenshot()).toString('base64') });
  }
  const html = '<body style="margin:0;background:#111;color:#fff;font:600 22px system-ui"><div style="padding:10px 14px">' + NHAN + ' — Fast 3G, bộ đệm trống</div><div style="display:flex;gap:10px;padding:0 10px 10px">' +
    anh.map(a => '<div><img src="data:image/png;base64,' + a.b64 + '" style="width:195px;height:422px;display:block;border:1px solid #444"><div style="text-align:center;margin-top:6px">' + a.s + ' s · ' + a.p + '</div></div>').join('') + '</div></body>';
  const p2 = await (await br.newContext({ viewport: { width: 10 + anh.length * 205, height: 520 } })).newPage();
  await p2.setContent(html); await p2.screenshot({ path: RA, fullPage: true });
  await br.close();
})();
