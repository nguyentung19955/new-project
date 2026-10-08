// Test cỡ quái pixel CỐ ĐỊNH (claude/quai-to-dan). Chạy: node tests/pixel/quai-co-dinh.test.js
// Lỗi cũ: drawEnemy co giãn quái khi bơi / trúng đòn (×1,1) → pxBlit làm tròn cỡ điểm ảnh lên cả bậc → quái nhảy to (đến ×2).
// 1. mọi loại quái có pixel: chiều cao hộp (enemyBox) ngay khi sinh = suốt 30 s chơi + ép tải hết ảnh cũ (sai ≤ 2%);
//    chiều cao VẼ THẬT trên màn (pxDrawEnemy × tỉ lệ khung) không đổi quá 2% dù bị giật lùi liên tục
// 2. bảng js/pixel/quai-cao.js có đủ mọi mã trong ENEMIES
// 3. chụp đầu trận + sau 30 s ở 1920×934 · 844×390 → tests/pixel/shots/
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const ok = (c, m) => { if (!c) throw new Error('FAIL: ' + m); console.log('  ✓ ' + m); };
let chromium;
try { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); } catch (e) { console.log('SKIP: không có playwright'); process.exit(0); }

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  for (const [w, h, tag] of [[1920, 934, '1920x934'], [844, 390, '844x390']]) {
    console.log(`— ${tag}`);
    const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.route('**/firebase-config.js*', (rr) => rr.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
    await page.addInitScript(() => { localStorage.setItem('nuicao.v1', JSON.stringify({ unlocked: 17, storySeen: true, settings: { skipStory: true } })); });
    await page.goto('file://' + path.join(ROOT, 'index.html'));
    await page.waitForTimeout(500);
    await page.evaluate(() => ui.playLevel(0, false));
    await page.waitForSelector('#prep:not([hidden])');
    await page.click('[data-act=prep-go]');
    if (tag === '1920x934') {
      const { miss, n } = await page.evaluate(() => ({ miss: Object.keys(ENEMIES).filter((t) => !ENEMY_OLD_HW_TABLE[t]), n: Object.keys(ENEMY_OLD_HW_TABLE).length }));
      ok(!miss.length, `bảng quai-cao.js đủ ${n} mã (thiếu: ${miss.join(',') || 'không'})`);
    }
    // sinh mỗi loại một con, đo ngay (ảnh cũ chưa tải)
    const h0 = await page.evaluate(() => {
      game.speed = 1;
      window.__H = {};
      const f = pxDrawEnemy;
      pxDrawEnemy = function (ctx, e) { const r = f.apply(this, arguments); if (r) { const m = ctx.getTransform(), v = r.h * Math.hypot(m.a, m.b), q = (__H[e.type] = __H[e.type] || [1e9, 0]); q[0] = Math.min(q[0], v); q[1] = Math.max(q[1], v); } return r; };
      setInterval(() => { for (const e of game.enemies) { e.kbT = 0.14; e.kbDir = 1; } }, 700);   // trúng đòn giật lùi liên tục
      const out = {};
      Object.keys(ENEMIES).forEach((t, i) => { const e = game.spawn(t, 40 + (i % 12) * 30); e.speed = e.baseSpeed = 4; e.hp = e.maxHp = 1e12; const b = enemyBox(e); if (b.px) out[t] = b.h; });
      return out;
    });
    await page.screenshot({ path: path.join(SHOT, `quai-co-dinh-dau-${tag}.png`) });
    const n = Object.keys(h0).length;
    ok(n >= 10, `${n} loại quái vẽ bằng pixel`);
    // ép tải mọi ảnh cũ (như đường vẽ cũ / cdSoloImg) rồi chơi tiếp
    await page.evaluate(() => { for (const t of Object.keys(ENEMIES)) { cdSoloImg(t, true); for (const p of [`${t}.png`, `packs/${t}/idle.png`, `packs/${t}/walk1.png`]) asset(p, true); } });
    const samples = [];
    for (let s = 0; s < 30; s += 5) {
      await page.waitForTimeout(5000);
      samples.push(await page.evaluate(() => Object.fromEntries(game.enemies.filter((e) => e.hp > 0).map((e) => [e.type, enemyBox(e).h]))));
    }
    await page.screenshot({ path: path.join(SHOT, `quai-co-dinh-30s-${tag}.png`) });
    let worst = 0, wt = '';
    for (const sm of samples) for (const [t, v] of Object.entries(sm)) if (h0[t]) { const r = Math.abs(v / h0[t] - 1); if (r > worst) { worst = r; wt = t; } }
    ok(worst <= 0.02, `[${tag}] hộp quái không đổi qua 30 s + ảnh cũ tải xong (lệch lớn nhất ${(worst * 100).toFixed(1)}% ${wt})`);
    const H = await page.evaluate(() => __H);
    const jump = Object.entries(H).filter(([, [a, b]]) => b / a > 1.02).map(([t, [a, b]]) => `${t} ${a.toFixed(0)}→${b.toFixed(0)}`);
    ok(Object.keys(H).length >= 10 && !jump.length, `[${tag}] cỡ vẽ thật ${Object.keys(H).length} loại không nhảy khi bơi / trúng đòn (${jump.slice(0, 5).join(', ') || 'ổn'})`);
    ok(!errors.length, `[${tag}] không lỗi trang ${errors.join(' | ')}`);
    await page.close();
  }
  await browser.close();
  console.log('OK quai-co-dinh');
})().catch((e) => { console.error(e); process.exit(1); });
