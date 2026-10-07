// Tiện ích chung cho test Chợ tướng (Playwright, mở thẳng file index.html)
const path = require('path');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const ROOT = path.resolve(__dirname, '../..');
const URL = 'file://' + path.join(ROOT, 'index.html');

// prep(page): chạy trước khi mở trang (vd page.route thay ảnh assets bằng ảnh giả, không đụng file thật)
async function open(w = 844, h = 390, save = {}, prep = null) {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: false });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::|favicon|firebase|gstatic/i.test(m.text())) errors.push(m.text()); });
  await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
  if (prep) await prep(page);
  const init = Object.assign({ unlocked: 5, storySeen: true, settings: { skipStory: true } }, save);
  await page.addInitScript((s) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('nuicao.v1', JSON.stringify(s)); sessionStorage.setItem('seeded', '1'); } }, init);
  await page.goto(URL);
  await page.waitForFunction(() => typeof game !== 'undefined' && typeof ui !== 'undefined' && document.querySelector('#loading').hidden !== false || true);
  await page.waitForTimeout(800);
  return { browser, page, errors };
}
// vào trận: ải i (vô tận nếu endless) qua màn Chuẩn bị → Vào trận
async function enter(page, i = 0, endless = false) {
  await page.evaluate(([i, e]) => ui.playLevel(i, e), [i, endless]);
  await page.waitForSelector('#prep:not([hidden])');
  await page.click('[data-act=prep-go]');
  await page.waitForTimeout(300);
}
const ok = (cond, msg) => { if (!cond) throw new Error('FAIL: ' + msg); console.log('  ✓ ' + msg); };
module.exports = { open, enter, ok, ROOT };
