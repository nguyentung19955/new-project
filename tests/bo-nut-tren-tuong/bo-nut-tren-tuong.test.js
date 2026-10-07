// Test v171: bảng nổi trên tướng bỏ Ghép sao / Trang bị; ghép vẫn bằng kéo thả.
// v180: bỏ luôn nút Hủy nổi trên đầu tướng — hủy = giữ-kéo tướng thả vào thùng 🗑 ở dưới.
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
  const acts = await page.evaluate(() => { const m = document.querySelector('#more'); return { vis: !m.hidden, acts: [...m.querySelectorAll('[data-act]')].map((x) => x.dataset.act), txt: m.innerText }; });
  ok(await page.evaluate((a) => ui.sel === a, a), `[${tag}] chạm tướng → chọn tướng`);
  ok(!acts.vis, `[${tag}] tướng thường: không hiện bong bóng nổi trên đầu (${JSON.stringify(acts.acts)})`);
  ok(!acts.acts.includes('sell') && !/Hủy/.test(acts.txt), `[${tag}] không còn nút Hủy nổi trên tướng`);
  ok(!/Ghép sao|Trang bị|Ghép ★/.test(acts.txt), `[${tag}] không còn chữ Ghép sao / Trang bị`);
  ok(await page.evaluate(() => !document.querySelector('[data-act=sell]')), `[${tag}] không còn nút data-act=sell nào trên màn`);
  await page.screenshot({ path: path.join(SHOT, `${tag}-cham-tuong.png`) });
  // kéo thả ghép
  const pb = await slotXY(page, b);
  await dragTo(page, pa, pb); await page.waitForTimeout(250);
  ok(await page.evaluate(([a, b]) => !game.heroes[a] && game.heroes[b] && game.heroes[b].tier === 1, [a, b]), `[${tag}] kéo tướng thả lên tướng cùng loại → ghép ★★`);
  // Hủy: giữ-kéo tướng thả vào thùng 🗑 ở dưới
  const pc = await slotXY(page, c);
  await page.evaluate(() => ui.clearSel()); await page.waitForTimeout(100);
  const g0 = await page.evaluate(() => game.gold);
  await page.mouse.move(pc[0], pc[1]); await page.mouse.down();
  await page.mouse.move(pc[0] + 20, pc[1] + 20, { steps: 3 }); await page.waitForTimeout(80);
  const tr = await page.evaluate(() => { const t = document.querySelector('#trash'); const r = t.getBoundingClientRect(); return { vis: !t.hidden, x: r.left + r.width / 2, y: r.top + r.height / 2, txt: t.innerText }; });
  ok(tr.vis && /Hủy tướng/.test(tr.txt), `[${tag}] kéo tướng → hiện thùng "Hủy tướng"`);
  await page.mouse.move(tr.x, tr.y, { steps: 10 }); await page.waitForTimeout(80);
  ok(await page.evaluate(() => document.querySelector('#trash').classList.contains('hot')), `[${tag}] kéo tới thùng → sáng thùng`);
  await page.mouse.up(); await page.waitForTimeout(200);
  ok(await page.evaluate(([c, g0]) => !game.heroes[c] && game.gold >= g0, [c, g0]), `[${tag}] thả vào thùng → hủy tướng, hoàn vàng`);
  ok(await page.evaluate(() => document.querySelector('#trash').hidden), `[${tag}] thả xong thùng ẩn đi`);
  ok(!errors.length, `[${tag}] không lỗi trang ${errors.join(' | ')}`);
  await browser.close();
}

(async () => {
  await run(844, 390, '844x390');
  await run(667, 375, '667x375');
  console.log('\nTất cả đều đạt');
})().catch((e) => { console.error(e.message); process.exit(1); });
