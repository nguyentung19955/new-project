// Test v171: bảng nổi trên tướng chỉ còn Hủy (bỏ Ghép sao / Trang bị); ghép vẫn bằng kéo thả.
// Chạy: node tests/bo-nut-tren-tuong/bo-nut-tren-tuong.test.js
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('../cho-tuong/helpers');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });

const slotXY = (page, s) => page.evaluate((s) => {
  const [x, y] = CONFIG.slots[s]; const r = document.querySelector('#game').getBoundingClientRect();
  return ROT ? [r.right - (y + view.oy) * view.scale, r.top + (x + view.ox) * view.scale] : [r.left + (x + view.ox) * view.scale, r.top + (y + view.oy) * view.scale];
}, s);
async function dragTo(page, from, to) {
  await page.mouse.move(from[0], from[1]); await page.mouse.down();
  for (let k = 1; k <= 12; k++) { await page.mouse.move(from[0] + (to[0] - from[0]) * k / 12, from[1] + (to[1] - from[1]) * k / 12); await page.waitForTimeout(16); }
  await page.mouse.up();
}

async function run(w, h, tag) {
  const { browser, page, errors } = await open(w, h);
  await enter(page, 0);
  const [a, b, c] = await page.evaluate(() => {
    game.running = false; game.gold = 999;
    const [a, b, c] = game.freeSlots();
    game.spawnHero(a, 'lucsi'); game.spawnHero(b, 'lucsi'); game.spawnHero(c, 'thosan');
    ui.clearSel(); return [a, b, c];
  });
  await page.waitForTimeout(200);
  // chạm tướng
  const pa = await slotXY(page, a);
  await page.mouse.click(pa[0], pa[1]); await page.waitForTimeout(250);
  const acts = await page.evaluate(() => { const m = document.querySelector('#more'); return { vis: !m.hidden, acts: [...m.querySelectorAll('[data-act]')].map((x) => x.dataset.act), txt: m.innerText, w: m.offsetWidth }; });
  ok(acts.vis, `[${tag}] chạm tướng → hiện bảng nổi`);
  ok(JSON.stringify(acts.acts) === '["sell"]', `[${tag}] bảng nổi chỉ còn nút Hủy ${JSON.stringify(acts.acts)}`);
  ok(!/Ghép sao|Trang bị|Ghép ★/.test(acts.txt), `[${tag}] không còn chữ Ghép sao / Trang bị`);
  ok(acts.w < 90, `[${tag}] bảng nổi gọn (rộng ${acts.w}px)`);
  await page.screenshot({ path: path.join(SHOT, `${tag}-cham-tuong.png`) });
  // kéo thả ghép
  const pb = await slotXY(page, b);
  await dragTo(page, pa, pb); await page.waitForTimeout(250);
  ok(await page.evaluate(([a, b]) => !game.heroes[a] && game.heroes[b] && game.heroes[b].tier === 1, [a, b]), `[${tag}] kéo tướng thả lên tướng cùng loại → ghép ★★`);
  // Hủy: 2 bước
  const pc = await slotXY(page, c);
  await page.evaluate(() => ui.clearSel()); await page.waitForTimeout(100);
  await page.mouse.click(pc[0], pc[1]); await page.waitForTimeout(250);
  ok(await page.evaluate((c) => ui.sel === c, c), `[${tag}] chạm tướng thứ 3 → chọn`);
  await page.click('#more [data-act=sell]'); await page.waitForTimeout(150);
  ok(/Chắc chắn/.test(await page.locator('#more [data-act=sell]').innerText()) && await page.evaluate((c) => !!game.heroes[c], c), `[${tag}] bấm Hủy lần 1 → "Chắc chắn?"`);
  const g0 = await page.evaluate(() => game.gold);
  await page.click('#more [data-act=sell]'); await page.waitForTimeout(150);
  ok(await page.evaluate(([c, g0]) => !game.heroes[c] && game.gold >= g0, [c, g0]), `[${tag}] bấm lần 2 → hủy tướng, hoàn vàng`);
  ok(!errors.length, `[${tag}] không lỗi trang ${errors.join(' | ')}`);
  await browser.close();
}

(async () => {
  await run(844, 390, '844x390');
  await run(667, 375, '667x375');
  console.log('\nTất cả đều đạt');
})().catch((e) => { console.error(e.message); process.exit(1); });
