// Lỗi iPhone Safari (cầm dọc, game tự xoay): game phải luôn KHÍT khung nhìn thật — không tràn, không khoảng đen, không cuộn được —
// kể cả khi khung nhìn đổi liên tục (thanh địa chỉ, xoay máy) và visualViewport nhỏ hơn innerHeight. Giá thẻ chợ 3 chữ số không bị cắt.
// Chạy: node tests/khit-man/khit-man.test.js
const { open, enter, ok } = require('../cho-tuong/helpers');

// khung game (#wrap, đã xoay) so với khung nhìn thật (visualViewport)
const fit = (page) => page.evaluate(() => {
  const r = document.querySelector('#wrap').getBoundingClientRect(), vv = window.visualViewport;
  const V = vv ? { l: vv.offsetLeft, t: vv.offsetTop, r: vv.offsetLeft + vv.width, b: vv.offsetTop + vv.height } : { l: 0, t: 0, r: innerWidth, b: innerHeight };
  const d = Math.max(Math.abs(r.left - V.l), Math.abs(r.top - V.t), Math.abs(r.right - V.r), Math.abs(r.bottom - V.b));
  return { d, r: [r.left, r.top, r.right, r.bottom].map(Math.round), V: [V.l, V.t, V.r, V.b].map(Math.round), rot: document.querySelector('#wrap').classList.contains('rot'),
    scroll: document.scrollingElement.scrollHeight > innerHeight + 1 || document.scrollingElement.scrollWidth > innerWidth + 1 };
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
  ok(!errors.length, 'không lỗi JS ' + errors.slice(0, 2).join(' | '));
  await browser.close();
  console.log('PASS khit-man');
})().catch((e) => { console.error(e); process.exit(1); });
