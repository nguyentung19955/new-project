// Chụp mọi ải + đo thời gian vẽ một khung (render()). Chạy: node tests/duong-quai/chup.js <nhãn>
// Ảnh ra tests/duong-quai/shots/<nhãn>-<ải>.png (không commit), số đo in ra màn hình + shots/<nhãn>.json
const path = require('path');
const fs = require('fs');
const { open, enter } = require('../cho-tuong/helpers');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const tag = process.argv[2] || 'sau';
(async () => {
  const { browser, page, errors } = await open(844, 390, { unlocked: 17 });
  const n = await page.evaluate(() => LEVELS.length);
  const out = [];
  for (let i = 0; i < n; i++) {
    await enter(page, i);
    await page.waitForTimeout(1500);
    // đo: 120 lần render() liên tiếp, lấy trung bình (ms)
    const ms = await page.evaluate(() => { render(); const t0 = performance.now(); for (let k = 0; k < 120; k++) { render(); ctx.getImageData(0, 0, 1, 1); } return (performance.now() - t0) / 120; });
    await page.screenshot({ path: path.join(SHOT, `${tag}-${String(i + 1).padStart(2, '0')}.png`) });
    const id = await page.evaluate(() => MAP_ID);
    out.push({ i: i + 1, map: id, ms: +ms.toFixed(3) });
    console.log(`ải ${i + 1} ${id}: ${ms.toFixed(3)} ms/khung`);
    await page.evaluate(() => { game.started = false; ui.show && 0; });
  }
  const avg = out.reduce((s, o) => s + o.ms, 0) / out.length;
  console.log(`trung bình ${avg.toFixed(3)} ms/khung · lỗi trang: ${errors.length}`, errors.slice(0, 3));
  fs.writeFileSync(path.join(SHOT, `${tag}.json`), JSON.stringify({ avg, out, errors }, null, 1));
  await browser.close();
})();
