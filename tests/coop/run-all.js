'use strict';
// Chạy toàn bộ kiểm thử chơi nhóm: node tests/coop/run-all.js
// Cần Playwright + Chromium (môi trường có sẵn: /opt/node-tools/node_modules/playwright, /opt/pw-browsers/chromium).
const { launch } = require('./harness');
const tests = [['Luật Firestore', require('./test-rules')], ['Chơi đơn', require('./test-solo')], ['Chơi nhóm lockstep', require('./test-lockstep')]];

(async () => {
  const browser = await launch();
  let fail = 0;
  for (const [name, fn] of tests) {
    const t0 = Date.now();
    try { await fn(browser); console.log(`ĐẠT  ${name} (${((Date.now() - t0) / 1000).toFixed(0)} giây)\n`); }
    catch (e) { fail++; console.error(`LỖI  ${name}: ${e.stack || e}\n`); }
  }
  await browser.close();
  console.log(fail ? `${fail} bài lỗi` : 'Tất cả đạt');
  process.exit(fail ? 1 : 0);
})();
