// Lỗi iPhone Safari (cầm dọc, game tự xoay): game phải luôn KHÍT khung nhìn thật — không tràn, không khoảng đen, không cuộn được —
// kể cả khi khung nhìn đổi liên tục (thanh địa chỉ, xoay máy) và visualViewport nhỏ hơn innerHeight. Giá thẻ chợ 3 chữ số không bị cắt.
// Chạy: node tests/khit-man/khit-man.test.js
const { open, enter, ok } = require('../cho-tuong/helpers');
require('fs').mkdirSync(require('path').join(__dirname, 'shots'), { recursive: true });

// khung game (#wrap, đã xoay) so với khung nhìn thật (visualViewport)
const fit = (page) => page.evaluate(() => {
  const r = document.querySelector('#wrap').getBoundingClientRect(), vv = window.visualViewport;
  const V = vv ? { l: vv.offsetLeft, t: vv.offsetTop, r: vv.offsetLeft + vv.width, b: vv.offsetTop + vv.height } : { l: 0, t: 0, r: innerWidth, b: innerHeight };
  const d = Math.max(Math.abs(r.left - V.l), Math.abs(r.top - V.t), Math.abs(r.right - V.r), Math.abs(r.bottom - V.b));
  return { d, r: [r.left, r.top, r.right, r.bottom].map(Math.round), V: [V.l, V.t, V.r, V.b].map(Math.round), rot: document.querySelector('#wrap').classList.contains('rot'),
    // gốc lỗi "chạm 2 lần kéo sang nửa màn đen": #wrap xoay nằm trong luồng body → body.scrollWidth 527–617 > 390 (giờ #wrap position: fixed)
    scroll: document.scrollingElement.scrollHeight > innerHeight + 1 || document.scrollingElement.scrollWidth > innerWidth + 1 || document.body.scrollWidth > innerWidth + 1 || document.body.scrollHeight > innerHeight + 1,
    out: [...document.querySelectorAll('#ui button')].filter((e) => e.offsetParent && getComputedStyle(e).visibility !== 'hidden').filter((e) => { const q = e.getBoundingClientRect(); return q.width && (q.right > V.r + 2 || q.bottom > V.b + 2 || q.left < V.l - 2 || q.top < V.t - 2); }).map((e) => e.id || e.className) };
});

(async () => {
  const { browser, page, errors } = await open(390, 844, { unlocked: 5 });
  await enter(page, 0, true);
  await page.evaluate(() => { game.running = false; });
  // 1) đổi khung nhìn liên tục khi đang trong trận
  for (const [w, h] of [[390, 664], [390, 844], [390, 600], [844, 390], [390, 844], [667, 375], [390, 700]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(800);
    const f = await fit(page);
    ok(f.d <= 2 && !f.scroll && f.rot === h > w, `${w}×${h}: game khít khung nhìn (lệch ${f.d}px, xoay=${f.rot}, cuộn=${f.scroll})`);
    ok(!f.out.length, `${w}×${h}: không nút nào tràn ra ngoài khung nhìn ${f.out.join(',')}`);
  }
  // 2) visualViewport nhỏ hơn innerHeight (thanh địa chỉ iOS hiện) + lệch xuống (offsetTop) — giả lập
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const real = window.visualViewport;
    const fake = new EventTarget(); Object.assign(fake, { width: 390, height: 760, offsetLeft: 0, offsetTop: 30, scale: 1 });
    Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => fake });
    window.__fakeVV = fake; window.__realVV = real;
    window.dispatchEvent(new Event('resize'));
  });
  await page.waitForTimeout(800);
  let f = await fit(page);
  ok(f.d <= 2 && !f.scroll, `visualViewport 390×760 lệch 30px: game khít đúng vùng nhìn thấy (game ${f.r} / khung ${f.V})`);
  // 2b) người chơi lỡ phóng to (scale 2, visualViewport còn nửa) → bố cục giữ theo khung bố cục, không to ra
  await page.evaluate(() => { Object.assign(window.__fakeVV, { width: 195, height: 422, offsetLeft: 40, offsetTop: 100, scale: 2 }); window.dispatchEvent(new Event('resize')); window.__fakeVV.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(800);
  const z = await page.evaluate(() => { const r = document.querySelector('#wrap').getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom].map(Math.round); });
  ok(z[2] - z[0] > 380 && z[3] - z[1] > 700, `phóng to (scale 2): khung game không co / lệch theo visualViewport (${z})`);
  await page.evaluate(() => { Object.assign(window.__fakeVV, { width: 390, height: 760, offsetLeft: 0, offsetTop: 30, scale: 1 }); window.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(800);
  // 3) trang không cuộn được (ảnh lỗi: 1/3 dưới đen)
  await page.evaluate(() => { window.scrollTo(0, 300); document.scrollingElement.scrollTop = 300; });
  await page.waitForTimeout(200);
  ok(await page.evaluate(() => window.scrollY === 0 && document.scrollingElement.scrollTop === 0), 'trang không cuộn lệch được');
  await page.evaluate(() => { Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => window.__realVV }); window.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(800);
  // 4) giá thẻ chợ 3 chữ số (220) hiện đủ, không cắt "22C"
  await page.evaluate(() => { game.summonCost = () => 220; ui.sig = {}; });
  await page.waitForTimeout(500);
  for (const [w, h] of [[390, 844], [667, 375], [844, 390], [1920, 934]]) {
    await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(700);
    await page.evaluate(() => { ui.sig = {}; }); await page.waitForTimeout(300);
    const c = await page.evaluate(() => [...document.querySelectorAll('#deck .mk-card .cost')].map((e) => ({ t: e.textContent.trim(), cut: e.scrollWidth > e.clientWidth + 1 || [...e.querySelectorAll('*')].some((x) => { const a = x.getBoundingClientRect(), b = e.getBoundingClientRect(); return a.width && (a.left < b.left - 1 || a.right > b.right + 1); }) })));
    ok(c.length && c.every((x) => x.t.includes('220') && !x.cut), `${w}×${h}: giá thẻ chợ "220" hiện đủ (${c.length} thẻ)`);
  }
  // 5) HỘP ĐEN: giả lề an toàn lớn (iPhone: trên 59, dưới 34, trái/phải 47) — khung game + mọi nút nằm trọn trong vùng an toàn − 8px
  await page.evaluate(() => { game.summonCost = () => 220; });
  for (const [w, h, sf] of [[390, 844, [59, 0, 34, 0]], [390, 664, [59, 0, 34, 0]], [375, 600, [59, 0, 34, 0]], [844, 390, [0, 47, 21, 47]]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate((sf) => { const d = document.documentElement.style; ['t', 'r', 'b', 'l'].forEach((k, i) => d.setProperty('--safe-' + k, sf[i] + 'px')); window.dispatchEvent(new Event('resize')); ui.sig = {}; }, sf);
    await page.waitForTimeout(900);
    const r = await page.evaluate((sf) => {
      const S = { l: sf[3] + 8, t: sf[0] + 8, r: innerWidth - sf[1] - 8, b: innerHeight - sf[2] - 8 };
      const g = document.querySelector('#wrap').getBoundingClientRect();
      const bad = [...document.querySelectorAll('#ui button, #deck .mk-card .cost, #topbar')].filter((e) => e.offsetParent && getComputedStyle(e).visibility !== 'hidden')
        .filter((e) => { const q = e.getBoundingClientRect(); return q.width && (q.left < S.l - 1 || q.top < S.t - 1 || q.right > S.r + 1 || q.bottom > S.b + 1); }).map((e) => e.id || e.className);
      const fill = Math.abs(g.left - S.l) < 2 && Math.abs(g.top - S.t) < 2 && Math.abs(g.right - S.r) < 2 && Math.abs(g.bottom - S.b) < 2;
      const gia = [...document.querySelectorAll('#deck .mk-card .cost')].every((e) => e.textContent.includes('220'));
      const tb = document.querySelector('#topbar');
      return { bad, fill, gia, g: [g.left, g.top, g.right, g.bottom].map(Math.round), S, tb: tb.scrollWidth <= tb.clientWidth + 1, tbw: [tb.scrollWidth, tb.clientWidth] };
    }, sf);
    ok(r.tb, `${w}×${h}: thanh trên không tràn (scrollWidth ${r.tbw[0]} ≤ ${r.tbw[1]})`);
    ok(r.fill && !r.bad.length && r.gia, `${w}×${h} lề ${sf}: game vừa khít vùng an toàn − 8px (${r.g}), không gì lọt ra ngoài ${r.bad.join(',')}`);
    await page.screenshot({ path: require('path').join(__dirname, `shots/hop-den-${w}x${h}.png`) }).catch(() => {});
  }
  await page.evaluate(() => { const d = document.documentElement.style; ['t', 'r', 'b', 'l'].forEach((k) => d.removeProperty('--safe-' + k)); window.dispatchEvent(new Event('resize')); });
  ok(!errors.length, 'không lỗi JS ' + errors.slice(0, 2).join(' | '));
  await browser.close();
  console.log('PASS khit-man');
})().catch((e) => { console.error(e); process.exit(1); });
