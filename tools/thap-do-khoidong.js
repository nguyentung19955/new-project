// TURRET MERGE — ĐO THỜI GIAN KHỞI ĐỘNG (màn tải 0% → 100% → HOME) với mạng giả lập (CDP) + bộ đệm trống/ấm.
// Chạy: NODE_PATH=/opt/npm-tools/node_modules node tools/thap-do-khoidong.js <url thap/> [mạng=fast3g|4g] [lạnh|ấm] [ảnh-chụp-ra.png] [json-ra]
//  · fast3g: 1,44 Mbps xuống / 562 ms RTT (Chrome DevTools "Fast 3G") · 4g: 9 Mbps / 170 ms
//  · in ra mốc (ms từ lúc điều hướng): FCP, màn tải hiện, % đầu tiên > 0, 100 %, HOME tương tác; danh sách byte theo tệp
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const [URL_, MANG = 'fast3g', BODEM = 'lanh', ANH, JOUT] = process.argv.slice(2);
const MANGS = {
  fast3g: { latency: 562.5, downloadThroughput: 1.44e6 / 8, uploadThroughput: 675e3 / 8 },
  '4g': { latency: 170, downloadThroughput: 9e6 / 8, uploadThroughput: 1.5e6 / 8 },
  khong: null,
};
(async () => {
  const br = await chromium.launch();
  const ctx = await br.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
  await ctx.addInitScript(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true, boQua: true, buoc: {} })); } catch (e) { } });
  const pg = await ctx.newPage();
  const cdp = await ctx.newCDPSession(pg);
  await cdp.send('Network.enable');
  const loi = [];
  pg.on('pageerror', e => loi.push(String(e.stack || e).slice(0, 300)));
  if (BODEM === 'am') { // lần 1 không giới hạn để làm ấm bộ đệm
    await pg.goto(URL_, { waitUntil: 'load' });
    await pg.waitForFunction(() => typeof TAI !== 'undefined' && TAI.daBoot, null, { timeout: 120000 });
    await pg.waitForTimeout(500);
  } else await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  if (MANGS[MANG]) await cdp.send('Network.emulateNetworkConditions', Object.assign({ offline: false }, MANGS[MANG]));
  const tep = new Map(); let t0 = 0;
  cdp.on('Network.requestWillBeSent', e => { if (!t0) t0 = e.timestamp; tep.set(e.requestId, { url: e.request.url, bd: (e.timestamp - t0) * 1000 }); });
  cdp.on('Network.responseReceived', e => { const x = tep.get(e.requestId); if (x) { x.ma = e.response.status; x.cache = e.response.fromDiskCache || e.response.fromMemoryCache; } });
  cdp.on('Network.loadingFinished', e => { const x = tep.get(e.requestId); if (x) { x.byte = e.encodedDataLength; x.xong = (e.timestamp - t0) * 1000; } });
  await pg.addInitScript(() => {
    window.__moc = {}; const T = () => Math.round(performance.now());
    const ghi = (k) => { if (!(k in window.__moc)) window.__moc[k] = T(); };
    new PerformanceObserver(l => { for (const e of l.getEntries()) { if (e.name === 'first-contentful-paint') window.__moc.fcp = Math.round(e.startTime); if (e.name === 'first-paint') window.__moc.fp = Math.round(e.startTime); } }).observe({ type: 'paint', buffered: true });
    const vong = () => {
      const t = document.getElementById('tai');
      if (t && !t.hidden && t.getBoundingClientRect().width > 0) ghi('taiHien');
      const p = t && +t.dataset.p;
      if (p > 0) ghi('pDau'); if (p >= 50) ghi('p50'); if (p >= 100) ghi('p100');
      if (typeof TAI !== 'undefined' && TAI.daBoot) ghi('boot');
      const hm = document.getElementById('hm-choi'), c = document.getElementById('chon');
      if (typeof TAI !== 'undefined' && TAI.daBoot && t && t.hidden && c && !c.hidden && hm && hm.getBoundingClientRect().width > 0) { ghi('home'); return; }
      requestAnimationFrame(vong);
    };
    requestAnimationFrame(vong);
  });
  const tb = Date.now();
  await pg.goto(URL_, { waitUntil: 'commit' });
  try { await pg.waitForFunction(() => window.__moc && window.__moc.home, null, { timeout: +(process.env.TMO || 300000), polling: 100 }); } catch (e) { loi.push('timeout HOME'); }
  const moc = await pg.evaluate(() => window.__moc);
  if (ANH) await pg.screenshot({ path: ANH });
  const ds = [...tep.values()].filter(x => x.byte != null);
  const tong = ds.reduce((a, x) => a + x.byte, 0);
  const kq = { url: URL_, mang: MANG, bodem: BODEM, moc, soTep: ds.length, tongByte: tong, loi, tep: ds.sort((a, b) => a.bd - b.bd).map(x => ({ u: x.url.replace(/^https?:\/\/[^/]+/, ''), bd: Math.round(x.bd), xong: Math.round(x.xong), byte: x.byte, cache: !!x.cache })) };
  console.log(JSON.stringify({ mang: MANG, bodem: BODEM, moc, soTep: ds.length, MB: +(tong / 1048576).toFixed(2), loi, giay: (Date.now() - tb) / 1000 }));
  if (JOUT) fs.writeFileSync(JOUT, JSON.stringify(kq, null, 1));
  await br.close();
})();
