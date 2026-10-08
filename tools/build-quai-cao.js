// Bảng chiều cao HÌNH CŨ của quái/boss (tỉ lệ cao / rộng logic, k = 1) → js/pixel/quai-cao.js.
// Quái pixel co theo chiều cao này (render.js enemyBoxOldH). Trước đây đo lúc chơi → ảnh cũ tải muộn làm quái nhảy cỡ giữa trận.
// Chạy lại khi thêm quái / đổi ảnh cũ / đổi ENEMY_W: node tools/build-quai-cao.js
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'js/pixel/quai-cao.js');
const { chromium } = require('/opt/node-tools/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
  // bỏ bảng đang có để đo lại từ ảnh cũ
  await page.route('**/js/pixel/quai-cao.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.goto('file://' + path.join(ROOT, 'index.html'));
  await page.waitForTimeout(800);
  const measure = () => page.evaluate(() => {
    const out = {}; let wait = 0;
    for (const type of Object.keys(ENEMIES)) {
      const def = ENEMIES[type], w = ENEMY_W[type] || 40;
      if (typeof cdSoloImg === 'function') cdSoloImg(type, true);   // gọi tải ảnh đơn
      const b = enemyBoxOld({ type, def }, enemyArt(type), w, 1);
      out[type] = +(b.h / w).toFixed(4);
    }
    for (const a of assetMap.values()) if (a.ok === null) wait++;   // ảnh cũ đang tải
    return { out, wait };
  });
  let r;
  for (let i = 0; i < 40; i++) { r = await measure(); if (!r.wait) break; await page.waitForTimeout(250); }
  await browser.close();
  if (r.wait) console.log(`! còn ${r.wait} ảnh chưa tải được (dùng giá trị vector/dự phòng)`);
  const body = Object.entries(r.out).map(([k, v]) => `${JSON.stringify(k)}:${v}`).join(',');
  fs.writeFileSync(OUT, '// SINH TỰ ĐỘNG bởi tools/build-quai-cao.js — đừng sửa tay.\n'
    + '// Tỉ lệ cao / rộng hình cũ của từng quái (k = 1) → cỡ quái pixel cố định ngay từ đầu trận (render.js enemyBoxOldH).\n'
    + `const ENEMY_OLD_HW_TABLE = {${body}};\n`);
  console.log(`ghi ${path.relative(ROOT, OUT)}: ${Object.keys(r.out).length} quái`);
})();
