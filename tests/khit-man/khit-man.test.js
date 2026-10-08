// Lỗi iPhone Safari (cầm dọc, game tự xoay): game phải luôn KHÍT khung nhìn thật — không tràn, không khoảng đen, không cuộn được —
// kể cả khi khung nhìn đổi liên tục (thanh địa chỉ, xoay máy) và visualViewport nhỏ hơn innerHeight. Giá thẻ chợ 3 chữ số không bị cắt.
// Chạy: node tests/khit-man/khit-man.test.js
const { open, enter, ok } = require('../cho-tuong/helpers');
require('fs').mkdirSync(require('path').join(__dirname, 'shots'), { recursive: true });

// khung game (#wrap, đã xoay) so với khung nhìn thật (visualViewport)
const fit = (page) => page.evaluate(() => {
  const r = document.querySelector('#wrap').getBoundingClientRect(), vv = window.visualViewport;
  const V = vv ? { l: vv.offsetLeft, t: vv.offsetTop, r: vv.offsetLeft + vv.width, b: vv.offsetTop + vv.height } : { l: 0, t: 0, r: innerWidth, b: innerHeight };
  // khung-co-dinh (hộp đen): khung nằm TRONG vùng nhìn thấy, căn giữa, khít đúng MỘT chiều (chiều kia thừa → nền đen)
  const out = Math.max(V.l - r.left, V.t - r.top, r.right - V.r, r.bottom - V.b, 0);
  const ctr = Math.max(Math.abs((r.left + r.right - V.l - V.r) / 2), Math.abs((r.top + r.bottom - V.t - V.b) / 2));
  const fitOne = Math.min(Math.abs(r.width - (V.r - V.l)), Math.abs(r.height - (V.b - V.t)));
  const d = Math.max(out, ctr, fitOne);
  return { d, r: [r.left, r.top, r.right, r.bottom].map(Math.round), V: [V.l, V.t, V.r, V.b].map(Math.round), 
    // gốc lỗi "chạm 2 lần kéo sang nửa màn đen": #wrap xoay nằm trong luồng body → body.scrollWidth 527–617 > 390 (giờ #wrap position: fixed)
    scroll: document.scrollingElement.scrollHeight > innerHeight + 1 || document.scrollingElement.scrollWidth > innerWidth + 1 || document.body.scrollWidth > innerWidth + 1 || document.body.scrollHeight > innerHeight + 1,
    out: [...document.querySelectorAll('#ui button')].filter((e) => e.offsetParent && getComputedStyle(e).visibility !== 'hidden').filter((e) => { const q = e.getBoundingClientRect(); return q.width && (q.right > V.r + 2 || q.bottom > V.b + 2 || q.left < V.l - 2 || q.top < V.t - 2); }).map((e) => e.id || e.className) };
});

(async () => {
  const { browser, page, errors } = await open(844, 390, { unlocked: 5 });
  await enter(page, 0, true);
  await page.evaluate(() => { game.running = false; });
  // 1) đổi khung nhìn liên tục khi đang trong trận
  for (const [w, h] of [[844, 340], [844, 390], [800, 360], [932, 430], [667, 375], [915, 412], [844, 390]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(800);
    const f = await fit(page);
    ok(f.d <= 2 && !f.scroll, `${w}×${h}: game khít khung nhìn (lệch ${f.d}px, cuộn=${f.scroll})`);
    ok(!f.out.length, `${w}×${h}: không nút nào tràn ra ngoài khung nhìn ${f.out.join(',')}`);
  }
  // 2) visualViewport nhỏ hơn innerHeight (thanh địa chỉ iOS hiện) + lệch xuống (offsetTop) — giả lập
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const real = window.visualViewport;
    const fake = new EventTarget(); Object.assign(fake, { width: 844, height: 340, offsetLeft: 0, offsetTop: 30, scale: 1 });
    Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => fake });
    window.__fakeVV = fake; window.__realVV = real;
    window.dispatchEvent(new Event('resize'));
  });
  await page.waitForTimeout(800);
  let f = await fit(page);
  ok(f.d <= 2 && !f.scroll, `visualViewport 844×340 lệch 30px: game nằm giữa vùng nhìn thấy (game ${f.r} / khung ${f.V})`);
  // 2b) người chơi lỡ phóng to (scale 2, visualViewport còn nửa) → bố cục giữ theo khung bố cục, không to ra
  const z0 = await page.evaluate(() => { const r = document.querySelector('#wrap').getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom].map(Math.round).join(','); });
  await page.evaluate(() => { Object.assign(window.__fakeVV, { width: 422, height: 170, offsetLeft: 100, offsetTop: 40, scale: 2 }); window.dispatchEvent(new Event('resize')); window.__fakeVV.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(800);
  const z = await page.evaluate(() => { const r = document.querySelector('#wrap').getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom].map(Math.round); });
  ok(z.join(',') === z0, `phóng to (scale 2): khung game không co / lệch theo visualViewport (${z} = ${z0})`);
  await page.evaluate(() => { Object.assign(window.__fakeVV, { width: 844, height: 340, offsetLeft: 0, offsetTop: 30, scale: 1 }); window.dispatchEvent(new Event('resize')); });
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
  for (const [w, h] of [[800, 360], [667, 375], [844, 390], [1920, 934]]) {
    await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(700);
    await page.evaluate(() => { ui.sig = {}; }); await page.waitForTimeout(300);
    const c = await page.evaluate(() => [...document.querySelectorAll('#deck .mk-card .cost')].map((e) => ({ t: e.textContent.trim(), cut: e.scrollWidth > e.clientWidth + 1 || [...e.querySelectorAll('*')].some((x) => { const a = x.getBoundingClientRect(), b = e.getBoundingClientRect(); return a.width && (a.left < b.left - 1 || a.right > b.right + 1); }) })));
    ok(c.length && c.every((x) => x.t.includes('220') && !x.cut), `${w}×${h}: giá thẻ chợ "220" hiện đủ (${c.length} thẻ)`);
  }
  // 5) HỘP ĐEN: giả lề an toàn lớn (iPhone: trên 59, dưới 34, trái/phải 47) — khung game + mọi nút nằm trọn trong vùng an toàn − 8px
  await page.evaluate(() => { game.summonCost = () => 220; });
  for (const [w, h, sf] of [[844, 390, [0, 47, 21, 47]], [800, 360, [0, 47, 21, 47]], [667, 375, [0, 44, 21, 44]], [932, 430, [0, 59, 21, 59]]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate((sf) => { const d = document.documentElement.style; ['t', 'r', 'b', 'l'].forEach((k, i) => d.setProperty('--safe-' + k, sf[i] + 'px')); window.dispatchEvent(new Event('resize')); ui.sig = {}; }, sf);
    await page.waitForTimeout(900);
    const r = await page.evaluate((sf) => {
      const S = { l: sf[3] + 8, t: sf[0] + 8, r: innerWidth - sf[1] - 8, b: innerHeight - sf[2] - 8 };
      const g = document.querySelector('#wrap').getBoundingClientRect();
      const bad = [...document.querySelectorAll('#ui button, #deck .mk-card .cost, #topbar')].filter((e) => e.offsetParent && getComputedStyle(e).visibility !== 'hidden')
        .filter((e) => { const q = e.getBoundingClientRect(); return q.width && (q.left < S.l - 1 || q.top < S.t - 1 || q.right > S.r + 1 || q.bottom > S.b + 1); }).map((e) => e.id || e.className);
      // khung-co-dinh: trong vùng an toàn, khít một chiều
      const fill = g.left >= S.l - 1 && g.top >= S.t - 1 && g.right <= S.r + 1 && g.bottom <= S.b + 1 && (Math.abs(g.width - (S.r - S.l)) < 2 || Math.abs(g.height - (S.b - S.t)) < 2);
      const gia = [...document.querySelectorAll('#deck .mk-card .cost')].every((e) => e.textContent.includes('220'));
      const tb = document.querySelector('#topbar');
      return { bad, fill, gia, g: [g.left, g.top, g.right, g.bottom].map(Math.round), S, tb: tb.scrollWidth <= tb.clientWidth + 1, tbw: [tb.scrollWidth, tb.clientWidth] };
    }, sf);
    ok(r.tb, `${w}×${h}: thanh trên không tràn (scrollWidth ${r.tbw[0]} ≤ ${r.tbw[1]})`);
    ok(r.fill && !r.bad.length && r.gia, `${w}×${h} lề ${sf}: game vừa khít vùng an toàn − 8px (${r.g}), không gì lọt ra ngoài ${r.bad.join(',')}`);
    await page.screenshot({ path: require('path').join(__dirname, `shots/hop-den-${w}x${h}.png`) }).catch(() => {});
  }
  await page.evaluate(() => { const d = document.documentElement.style; ['t', 'r', 'b', 'l'].forEach((k) => d.removeProperty('--safe-' + k)); window.dispatchEvent(new Event('resize')); });
  // 6) bàn phím (gốc lỗi người dùng tìm ra): chạm ô tìm ở Hợp thể → khung nhìn co 844×200 → game ĐỨNG YÊN; rời ô → về đúng như trước
  await page.setViewportSize({ width: 844, height: 390 }); await page.waitForTimeout(900);
  const box = () => page.evaluate(() => { const r = document.querySelector('#wrap').getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom].map(Math.round).join(','); });
  for (const [name, open, sel] of [['Hợp thể', () => ui.openLegends(true), '#legends input'], ['Anh Hùng', () => ui.showRoster(), '#roster input']]) {
    await page.evaluate(open); await page.waitForTimeout(400);
    const b0 = await box();
    const inp = page.locator(sel).first();
    ok(await inp.count() && (await inp.evaluate((e) => parseFloat(getComputedStyle(e).fontSize))) >= 16, `${name}: ô nhập chữ ≥ 16px (iOS không tự phóng to)`);
    await inp.focus();
    await page.setViewportSize({ width: 844, height: 200 }); await page.waitForTimeout(900);
    ok(await box() === b0, `${name}: đang gõ, bàn phím làm khung co 844×200 → game đứng yên (${await box()})`);
    await page.evaluate(() => document.activeElement.blur());
    await page.setViewportSize({ width: 844, height: 390 }); await page.waitForTimeout(1000);
    ok(await box() === b0, `${name}: rời ô, bàn phím đóng → game về đúng như trước (${await box()} = ${b0})`);
    await page.evaluate(() => { ui.hideOverlays && ui.hideOverlays(); const l = document.querySelector('#legends'); if (l) l.hidden = true; });
  }
  ok(!errors.length, 'không lỗi JS ' + errors.slice(0, 2).join(' | '));
  await browser.close();
  console.log('PASS khit-man');
})().catch((e) => { console.error(e); process.exit(1); });
