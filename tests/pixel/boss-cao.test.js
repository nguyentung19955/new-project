// Test cỡ boss pixel (claude/pixel-quai-boss). Chạy: node tests/pixel/boss-cao.test.js
// 1. chiều cao hộp vẽ boss pixel ≈ hình cũ (sai ≤ 15%): daibang · ngutinh · hotinh · chantinh · trieuda
// 2. Đại Bàng (bay) ở đoạn đường cao nhất: đỉnh hình không lọt dưới thanh trên (PLAY_TOP)
// 3. chụp Đại Bàng ở khúc đường cao 1920×934 · 844×390 → tests/pixel/shots/ (xem tận mắt)
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const ok = (c, m) => { if (!c) throw new Error('FAIL: ' + m); console.log('  ✓ ' + m); };
let chromium;
try { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); } catch (e) { console.log('SKIP: không có playwright'); process.exit(0); }
const BOSS = ['daibang', 'ngutinh', 'hotinh', 'chantinh', 'trieuda'];

async function open(w, h, query) {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.route('**/firebase-config.js*', (rr) => rr.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
  await page.addInitScript(() => { localStorage.setItem('nuicao.v1', JSON.stringify({ unlocked: 17, storySeen: true, settings: { skipStory: true } })); });
  await page.goto('file://' + path.join(ROOT, 'index.html') + query);
  await page.waitForTimeout(800);
  await page.evaluate(() => ui.playLevel(0, false));
  await page.waitForSelector('#prep:not([hidden])');
  await page.click('[data-act=prep-go]');
  await page.waitForTimeout(400);
  return { browser, page, errors };
}
// sinh boss rải trên đường, đợi ảnh tải, trả chiều cao hộp vẽ (đơn vị logic)
async function heights(page) {
  await page.evaluate((bs) => { bs.forEach((b, i) => game.spawn(b, 150 + i * 120)); }, BOSS);
  await page.waitForTimeout(1500);
  return page.evaluate((bs) => { game.paused = true; return Object.fromEntries(bs.map((b) => { const e = game.enemies.find((x) => x.type === b); return [b, e ? enemyBox(e).h : 0]; })); }, BOSS);
}

(async () => {
  const old = await (async () => { const { browser, page } = await open(1920, 934, '?pixel=0'); const h = await heights(page); await browser.close(); return h; })();
  for (const [w, h, tag] of [[1920, 934, '1920x934'], [844, 390, '844x390']]) {
    console.log(`— ?pixel=1 ${tag}`);
    const { browser, page, errors } = await open(w, h, '?pixel=1');
    const nw = await heights(page);
    for (const b of BOSS) {
      const r = nw[b] / old[b];
      ok(old[b] > 0 && Math.abs(r - 1) <= 0.15, `[${tag}] ${b}: cao pixel ${nw[b].toFixed(0)} ≈ cũ ${old[b].toFixed(0)} (×${r.toFixed(2)})`);
    }
    // Đại Bàng ở điểm cao nhất của đường
    const s = await page.evaluate(() => {
      game.enemies.length = 0;
      game.paused = false;
      const e = game.spawn('daibang', 0);
      let best = 0, by = 1e9;
      for (let d = 0; d < PATH.total; d += 4) { const p = PATH.at(d); if (p.y < by) { by = p.y; best = d; } }
      const p = PATH.at(best);
      e.dist = best; e.x = p.x; e.y = p.y; e.speed = 0; e.baseSpeed = 0;
      return { y: p.y, h: enemyBox(e).h, top: PLAY_TOP, x: p.x };
    });
    await page.waitForTimeout(500);
    await page.evaluate(() => { game.paused = true; });
    // vẽ thử lại vài pha bay: đo đỉnh hình thật bằng cách quét điểm ảnh canvas
    const top = await page.evaluate(() => {
      const e = game.enemies.find((x) => x.type === 'daibang'); const box = enemyBox(e);
      const cv = document.createElement('canvas'); cv.width = 400; cv.height = 600;
      const c = cv.getContext('2d'); let worst = 1e9;
      for (let i = 0; i < 24; i++) {
        c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 400, 600);
        c.translate(200 - e.x, 500 - e.y);
        drawEnemy(c, e, i * 0.13, {});
        const d = c.getImageData(0, 0, 400, 600).data;
        let y0 = -1;
        for (let y = 0; y < 600 && y0 < 0; y++) for (let x = 0; x < 400; x++) if (d[(y * 400 + x) * 4 + 3] > 60) { y0 = y; break; }
        if (y0 >= 0) worst = Math.min(worst, y0 - 500 + e.y);
      }
      return worst;
    });
    ok(top >= s.top - 1, `[${tag}] Đại Bàng ở đường cao nhất (y=${s.y.toFixed(0)}): đỉnh hình ${top.toFixed(0)} ≥ mép trên vùng chơi ${s.top.toFixed(0)}`);
    const sx = await page.evaluate((s) => ({ x: (s.x + view.ox) * view.scale, y: (s.y + view.oy) * view.scale }), s);
    await page.screenshot({ path: path.join(SHOT, `boss-cao-${tag}.png`) });
    await page.screenshot({ path: path.join(SHOT, `boss-cao-${tag}-zoom.png`), clip: { x: Math.max(0, sx.x - 160), y: 0, width: 320, height: Math.min(h, sx.y + 60) } });
    ok(!errors.length, `[${tag}] không lỗi trang ${errors.join(' | ')}`);
    await browser.close();
  }
  console.log('OK boss-cao');
})().catch((e) => { console.error(e); process.exit(1); });
