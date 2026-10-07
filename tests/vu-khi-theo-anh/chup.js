// Chụp trận có tướng đổi kiểu đánh theo ảnh (Thợ Săn bắn cung, Thợ Gốm / Chăn Trâu cận chiến, đạn giáo / kiếm khí)
// Chạy: node tests/vu-khi-theo-anh/chup.js [thư mục gốc game=.] [thư mục ảnh=tests/vu-khi-theo-anh/shots] [tiền tố=sau]
const path = require('path'), fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '../..'));
const OUT = path.resolve(process.argv[3] || path.join(__dirname, 'shots'));
const PRE = process.argv[4] || 'sau';
fs.mkdirSync(OUT, { recursive: true });
const TEAMS = { a: ['thosan', 'thogom', 'chantrau', 'xathu'], b: ['matroi', 'longnu', 'thansuong', 'tiendung', 'antiem', 'auco'] };
(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const errs = [];
  for (const [w, h] of [[1920, 934], [844, 390], [667, 375]]) for (const tk of Object.keys(TEAMS)) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errs.push(String(e)));
    await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
    await page.addInitScript(() => { localStorage.setItem('nuicao.v1', JSON.stringify({ unlocked: 5, storySeen: true, settings: { skipStory: true } })); });
    await page.goto('file://' + path.join(ROOT, 'index.html'));
    await page.waitForTimeout(1200);
    await page.evaluate(() => ui.playLevel(1, false));
    await page.waitForSelector('#prep:not([hidden])');
    await page.click('[data-act=prep-go]');
    await page.waitForTimeout(400);
    await page.evaluate((team) => {
      const g = game;
      g.heroes.forEach((x, i) => { if (x) g.heroes[i] = null; });
      const slots = g.freeSlots().map((i) => { const [x, y] = CONFIG.slots[i]; let c = 0; for (let d = 0; d < PATH.total * 0.4; d += 10) { const p = PATH.at(d); if (Math.hypot(p.x - x, p.y - y) < 150) c++; } return { i, c }; })
        .sort((a, b) => b.c - a.c).map((o) => o.i);
      team.forEach((t, k) => { const hh = g.spawnHero(slots[k], t, { tier: 2 }); hh.level = 8; });
      g.wave = 3; if (g.rest) g.rest = null;
      g.startWave();
    }, TEAMS[tk]);
    // chạy mô phỏng (bước cố định) tới khi có đạn bay + quái đã tới gần tướng
    await page.evaluate(() => {
      const g = game;
      for (let k = 0; k < 30 * 40; k++) {
        if (g.rest) { g.rest = null; g.startWave(); }
        g.update(1 / 30);
        const near = g.heroes.filter((h) => h && g.enemies.some((e) => !e.dead && Math.hypot(e.x - h.x, e.y - h.y) < 130)).length;
        if (k > 30 * 6 && g.projectiles.length >= 2 && near >= 2 && g.heroes.some((h) => h && h.swing > 0.5)) break;
      }
    });
    await page.evaluate(() => { game.paused = true; });
    await page.waitForTimeout(150);
    const f = path.join(OUT, `${PRE}-${tk}-${w}x${h}.png`);
    await page.screenshot({ path: f });
    console.log(f);
    await ctx.close();
  }
  await browser.close();
  if (errs.length) { console.log('LỖI TRANG:', errs.slice(0, 5)); process.exit(1); }
})();
