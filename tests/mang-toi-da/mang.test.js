// Test mạng thành "còn/tối đa" (v169): 20/20 → lọt quái 19/20 → hồi không vượt tối đa → cộng khi đầy 21/21 → lưu / tiếp tục.
// Chạy: node tests/mang-toi-da/mang.test.js
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });
const ok = (c, m) => { if (!c) throw new Error('FAIL: ' + m); console.log('  ✓ ' + m); };

async function open(browser, w, h) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
  await page.addInitScript(() => { if (!localStorage.getItem('nuicao.v1')) localStorage.setItem('nuicao.v1', JSON.stringify({ unlocked: 5, kho: 5000, storySeen: true, settings: { skipStory: true } })); });
  await page.goto('file://' + path.join(ROOT, 'index.html'));
  await page.waitForTimeout(800);
  return { page, errors };
}
const top = (page) => page.evaluate(() => { ui.updateTopbar(); const s = document.querySelector('#tb-lives'); return { t: s.querySelector('b').textContent, cls: s.className }; });

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const { page, errors } = await open(browser, 844, 390);
  await page.evaluate(() => ui.playLevel(0, false));
  await page.waitForSelector('#prep:not([hidden])');
  const card = await page.evaluate(() => document.querySelector('[data-act=prep-buy][data-v=lives], [data-v=lives]')?.textContent || document.querySelector('#prep').textContent);
  ok(/20 → 25/.test(card), 'thẻ Đắp thành hiện "20 → 25"');
  await page.click('[data-act=prep-go]');
  await page.waitForTimeout(300);
  let r = await top(page);
  ok(r.t === '20/20' && r.cls === '', 'vào trận: 20/20 ' + JSON.stringify(r));
  await page.screenshot({ path: path.join(OUT, 'topbar-20-20.png'), clip: { x: 0, y: 0, width: 844, height: 60 } });
  // cho 1 quái lọt thành
  await page.evaluate(() => { game.running = false; const e = game.spawn(Object.keys(ENEMIES).find((k) => !ENEMIES[k].boss && !(ENEMIES[k].lives > 1)), 0) || game.enemies[game.enemies.length - 1]; e.dist = PATH.total - 0.5; game.running = true; game.update(0.05); game.running = false; });
  r = await top(page);
  ok(r.t === '19/20', 'lọt quái: 19/20 ' + r.t);
  await page.evaluate(() => game.gainLives(3));
  r = await top(page);
  ok(r.t === '22/22', 'cộng 3 khi thiếu 1: hồi đủ rồi nâng tối đa 22/22 ' + r.t);
  await page.evaluate(() => { game.lives = 17; game.gainLives(1); });
  r = await top(page);
  ok(r.t === '18/22', 'cộng 1 khi thiếu: 18/22 (không nâng tối đa) ' + r.t);
  await page.evaluate(() => { game.lives = 22; game.gainLives(1); });
  r = await top(page);
  ok(r.t === '23/23', 'cộng 1 khi đầy: 23/23 ' + r.t);
  await page.evaluate(() => { game.lives = 11; });
  r = await top(page); ok(r.cls === 'lv-mid', '≤50% → cam (lv-mid)');
  await page.evaluate(() => { game.lives = 5; });
  r = await top(page); ok(r.cls === 'lv-low', '≤25% → đỏ (lv-low)');
  await page.screenshot({ path: path.join(OUT, 'topbar-5-23.png'), clip: { x: 0, y: 0, width: 844, height: 60 } });
  // lưu / tiếp tục
  await page.evaluate(() => { game.lives = 20; ui.saveRun(); });
  ok(await page.evaluate(() => ui.save.run.maxLives === 23), 'snapshot có maxLives = 23');
  await page.evaluate(() => { game.reset(0); ui.resumeRun(); });
  r = await top(page); ok(r.t === '20/23', 'tiếp tục trận: 20/23 ' + r.t);
  // bản lưu cũ thiếu maxLives
  await page.evaluate(() => { const o = game.snapshot(); delete o.maxLives; o.lives = 24; game.restore(o); });
  r = await top(page); ok(r.t === '24/24', 'bản lưu cũ (lives 24, không maxLives) → 24/24 ' + r.t);
  await page.evaluate(() => { const o = game.snapshot(); delete o.maxLives; o.lives = 12; game.restore(o); });
  r = await top(page); ok(r.t === '12/20', 'bản lưu cũ (lives 12) → 12/20 ' + r.t);
  // các cỡ màn khác: chữ mạng không tràn
  for (const [w, h] of [[667, 375], [390, 844]]) {
    await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(300);
    await page.evaluate(() => { game.lives = 123; game.maxLives = 123; });
    const fit = await page.evaluate(() => { ui.updateTopbar(); const b = document.querySelector('#tb-lives b').getBoundingClientRect(), p = document.querySelector('.tb-res').getBoundingClientRect(); return b.width > 0 && (b.right <= p.right + 1 && b.bottom <= p.bottom + 1 || b.bottom <= p.bottom + 1 && b.right <= p.right + 1); });
    ok(fit, `${w}x${h}: số mạng nằm gọn trong ô tài nguyên`);
    await page.screenshot({ path: path.join(OUT, `man-${w}x${h}.png`) });
  }
  // Đắp thành trước trận: 25/25
  await page.setViewportSize({ width: 844, height: 390 });
  await page.evaluate(() => { ui.startLevel(0); ui.prepBuy('lives'); });
  ok(/20 → 25/.test(await page.evaluate(() => document.querySelector('#prep').textContent)), 'đã mua Đắp thành: thẻ vẫn hiện "20 → 25"');
  await page.click('[data-act=prep-go]'); await page.waitForTimeout(200);
  r = await top(page); ok(r.t === '25/25', 'Đắp thành: 25/25 ' + r.t);
  ok(!errors.length, 'không lỗi trang ' + errors.join(' | '));
  await browser.close();
  console.log('OK');
})().catch((e) => { console.error(e); process.exit(1); });
