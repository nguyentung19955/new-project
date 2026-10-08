// goi-som: giữa hai đợt bấm "Gọi sớm" (#nextwaves.early) → đợt kế bắt đầu ngay + toast "+X vàng".
// Lỗi cũ: luật gốc #nextwaves { pointer-events: none } làm nút không nhận bấm. Thử chuột + chạm, sau khi mở/đóng Túi đồ, sau khi kéo tướng.
// Chạy: node tests/goi-som/goi-som.test.js
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const { ok, ROOT } = require('../cho-tuong/helpers');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });

// hết đợt hiện tại (xoá quái + hàng chờ) rồi chờ dải Gọi sớm hiện
async function endWave(page) {
  await page.evaluate(() => { game.spawnQueue = []; for (const e of game.enemies) e.dead = true; });
  await page.waitForFunction(() => !game.waveActive && document.querySelector('#nextwaves.early:not([hidden]) .go'), null, { timeout: 8000 });
  await page.waitForTimeout(250);
}
async function pressEarly(page, touch, name, label) {
  const p = await page.evaluate(() => {
    const go = document.querySelector('#nextwaves .go'), r = go.getBoundingClientRect();
    const x = (r.left + r.right) / 2, y = (r.top + r.bottom) / 2, t = document.elementFromPoint(x, y);
    return { x, y, top: !!t && document.querySelector('#nextwaves').contains(t), wave: game.wave };
  });
  ok(p.top, `${name} ${label}: nút Gọi sớm nằm trên cùng (không bị che / chặn chạm)`);
  if (touch) await page.touchscreen.tap(p.x, p.y); else await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(250);
  const a = await page.evaluate(() => ({ wave: game.wave, active: game.waveActive, toast: [...document.querySelectorAll('#toasts > *')].some((t) => /Gọi sớm: \+\d+ vàng/.test(t.textContent)) }));
  ok(a.wave === p.wave + 1 && a.active && a.toast, `${name} ${label}: bấm Gọi sớm → đợt ${a.wave} bắt đầu ngay + toast vàng`);
}

(async () => {
  for (const [w, h, touch] of [[844, 390, false], [844, 390, true], [1920, 934, false]]) {
    const name = `${w}x${h}-${touch ? 'cham' : 'chuot'}`;
    console.log(name);
    const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
    await page.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('nuicao.v1', JSON.stringify({ unlocked: 5, storySeen: true, settings: { skipStory: true } })); sessionStorage.setItem('seeded', '1'); } });
    await page.goto('file://' + path.join(ROOT, 'index.html'));
    await page.waitForTimeout(800);
    await page.evaluate(() => ui.playLevel(0, false));
    await page.waitForSelector('#prep:not([hidden])');
    await page.click('[data-act=prep-go]');
    await page.waitForTimeout(300);
    await page.evaluate(() => { game.gold = 5000; game.summonRandom(); });
    await page.click('#btn-run');
    await page.waitForTimeout(500);
    // 1) giữa đợt 1 và 2
    await endWave(page);
    await page.screenshot({ path: path.join(SHOT, `goi-som-${name}.png`) });
    await pressEarly(page, touch, name, 'sau đợt 1');
    // 2) mở rồi đóng Túi đồ
    await endWave(page);
    await page.evaluate(() => ui.openScreen('bag'));
    await page.waitForTimeout(250);
    await page.click('#screen [data-act=close]');
    await page.evaluate(() => ui.clearSel());
    await page.waitForTimeout(250);
    await pressEarly(page, touch, name, 'sau khi mở/đóng Túi đồ');
    // 3) kéo tướng (thùng hủy) rồi thả
    await endWave(page);
    const slot = await page.evaluate(() => game.heroes.findIndex(Boolean));
    await page.evaluate((s) => { ui.showTrash(s); }, slot);
    await page.waitForTimeout(150);
    await page.evaluate(() => ui.hideTrash());
    await page.waitForTimeout(200);
    await pressEarly(page, touch, name, 'sau khi kéo tướng');
    ok(errors.length === 0, `${name}: không lỗi trang ${errors.join(' | ')}`);
    await browser.close();
  }
  console.log('OK');
})().catch((e) => { console.error(e.message); process.exit(1); });
