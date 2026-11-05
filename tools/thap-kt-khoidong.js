// TURRET MERGE — KIỂM KHỞI ĐỘNG NHANH (đợt HOME → đợt nền → cổng bấm → vào trận) trên mạng giả lập, bộ đệm trống.
//  1) mở game (4G), HOME hiện → bấm DECK NGAY (đợt nền chưa xong) → phải hiện màn tải rồi mới mở bộ bài; mọi ảnh thẻ đã có (không ảnh trống)
//  2) mở lại (bộ bài đủ 5) → bấm PLAY ngay ở HOME → màn tải trận → trận chạy, không thiếu ảnh canvas (REN.thieu), không lỗi 4xx/trang
// NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-khoidong.js <url thap/> [thư mục ảnh chụp]
'use strict';
const { chromium } = require('playwright');
const [URL_ = 'http://localhost:8765/thap/', OUT = '/tmp'] = process.argv.slice(2);
const MANG = { latency: 170, downloadThroughput: 9e6 / 8, uploadThroughput: 1.5e6 / 8, offline: false };
const LOI = [];
async function moi(br, bo) {
  const ctx = await br.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await ctx.addInitScript((bo) => { localStorage.setItem('turret_hd', JSON.stringify({ xong: true, boQua: true, buoc: {} })); if (bo) localStorage.setItem('turret_bo', JSON.stringify(bo)); }, bo);
  const pg = await ctx.newPage(), cdp = await ctx.newCDPSession(pg);
  await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true }); await cdp.send('Network.emulateNetworkConditions', MANG);
  pg.on('pageerror', e => LOI.push('pageerror ' + String(e.stack || e).slice(0, 200)));
  pg.on('response', r => { if (r.status() >= 400) LOI.push('http ' + r.status() + ' ' + r.url()); });
  await pg.goto(URL_, { waitUntil: 'commit' });
  await pg.waitForFunction(() => typeof TAI !== 'undefined' && TAI.daBoot && document.getElementById('tai').hidden, null, { timeout: 120000 });
  return { ctx, pg };
}
(async () => {
  const br = await chromium.launch();
  // 1) DECK sớm
  {
    const { ctx, pg } = await moi(br, null);
    const nen = await pg.evaluate(() => TAI.nenXong);
    await pg.click('#hm [data-act="hm-deck"]');
    const coCong = await pg.waitForFunction(() => !document.getElementById('tai').hidden, null, { timeout: 1500 }).then(() => true).catch(() => false);
    await pg.waitForFunction(() => TAI.nenXong && document.getElementById('chon').classList.contains('xem-dk') && document.getElementById('tai').hidden, null, { timeout: 120000 });
    await pg.waitForTimeout(800);
    const kq = await pg.evaluate(() => {
      const con = document.querySelectorAll('img[data-tm-src]').length;
      const hong = [...document.querySelectorAll('#dk img')].filter(i => { const r = i.getBoundingClientRect(); return r.width > 4 && r.bottom > 0 && r.top < innerHeight && getComputedStyle(i).visibility !== 'hidden' && !(i.complete && i.naturalWidth); }).map(i => i.getAttribute('src'));
      return { con, hong };
    });
    console.log('DECK sớm: đợt nền xong lúc HOME =', nen, '· cổng hiện màn tải =', coCong, '· ảnh chưa gán =', kq.con, '· ảnh hỏng trên màn =', kq.hong.length);
    if (kq.con || kq.hong.length) LOI.push('deck: ' + JSON.stringify(kq).slice(0, 300));
    if (!nen && !coCong) LOI.push('deck: bấm DECK khi đợt nền chưa xong mà không hiện màn tải');
    await pg.screenshot({ path: OUT + '/kt-deck-som.png' });
    await ctx.close();
  }
  // 2) PLAY sớm
  {
    const { ctx, pg } = await moi(br, { chon: ['canon', 'bang', 'tia', 'set', 'lien'], mv: 'hero', che: 'solo' });
    await pg.click('#hm [data-act="hm-choi"]');
    await pg.waitForFunction(() => G.ban && G.ban.length && !TAI.cho && document.getElementById('tai').hidden, null, { timeout: 180000 });
    await pg.waitForTimeout(4000);
    const kq = await pg.evaluate(() => ({ thieu: [...REN.thieu], taiThieu: [...TAI.thieu], fps: 0 }));
    console.log('PLAY sớm: REN.thieu =', kq.thieu.length, '· TAI.thieu =', kq.taiThieu.length);
    if (kq.thieu.length || kq.taiThieu.length) LOI.push('tran thieu: ' + JSON.stringify(kq).slice(0, 300));
    await pg.screenshot({ path: OUT + '/kt-play-som.png' });
    await ctx.close();
  }
  await br.close();
  console.log(LOI.length ? 'TRƯỢT\n' + LOI.join('\n') : 'XANH');
  process.exit(LOI.length ? 1 : 0);
})();
