// claude/ve-lai-pixel (lỗi người dùng iPhone v256): cầm dọc → cả game xoay 90° (#wrap.rot); thanh trên thành "cột nút bên phải".
// Có tai thỏ (safe-area) thanh bị ép ngắn → nút Bắt đầu (chỉ chứa ảnh absolute) từng co còn ~5px, ☰ đè lên.
// Kiểm: 390×844 / 390×664 (thanh Safari) DPR3, có / không lề tai thỏ 59px: mỗi nút ≥ 36px, tâm nút không bị nút khác đè,
// icon không xoay riêng (xoay cùng cả game như chữ bên cạnh). Chạy: node tests/an-giao-dien/rot-nut.test.js
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const ROOT = path.resolve(__dirname, '../..');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const ok = (c, m) => { if (!c) throw new Error('FAIL: ' + m); console.log('  ✓ ' + m); };

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  for (const [w, h] of [[390, 844], [390, 664]]) for (const le of [0, 59]) {
    const tag = `${w}x${h}${le ? ' tai thỏ' : ''}`;
    const page = await (await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })).newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
    await page.addInitScript(() => localStorage.setItem('nuicao.v1', JSON.stringify({ unlocked: 5, storySeen: true, settings: { skipStory: true } })));
    await page.goto('file://' + path.join(ROOT, 'index.html'));
    await page.waitForTimeout(800);
    await page.evaluate(() => ui.playLevel(0, true));
    await page.waitForSelector('#prep:not([hidden])'); await page.click('[data-act=prep-go]'); await page.waitForTimeout(500);
    if (le) await page.addStyleTag({ content: `#topbar { padding-left: ${le}px !important; padding-right: ${le}px !important; }` });   // lề tai thỏ như env(safe-area-inset-*)
    await page.evaluate(() => { game.speed = 1; });
    await page.waitForTimeout(400);
    const r = await page.evaluate(() => {
      const out = [];
      for (const b of document.querySelectorAll('#topbar .sq')) {
        if (b.hidden || getComputedStyle(b).display === 'none') continue;
        const rc = b.getBoundingClientRect(), cx = rc.left + rc.width / 2, cy = rc.top + rc.height / 2, at = document.elementFromPoint(cx, cy);
        const imgs = [...b.querySelectorAll('img')].filter((i) => getComputedStyle(i).display !== 'none');
        out.push({ id: b.id, w: b.offsetWidth, h: b.offsetHeight, hit: !!at && (at === b || b.contains(at)), at: at ? at.id || at.className || at.tagName : '',
          xoay: imgs.map((i) => getComputedStyle(i).transform).filter((t) => t !== 'none') });
      }
      return { rot: ROT, out };
    });
    ok(r.rot, `[${tag}] game đang xoay (cầm dọc)`);
    for (const b of r.out) {
      ok(Math.min(b.w, b.h) >= 32 && b.w >= 36, `[${tag}] ${b.id} đủ cỡ ${b.w}×${b.h} (≥ 36)`);
      ok(b.hit, `[${tag}] ${b.id} không bị đè (tâm nút → ${b.at})`);
      ok(!b.xoay.length, `[${tag}] ${b.id} icon không xoay riêng (xoay cùng cả game)`);
    }
    const tb = await page.locator('#topbar').boundingBox();
    await page.screenshot({ path: path.join(SHOT, `rot-nut-${w}x${h}${le ? '-tai-tho' : ''}.png`), clip: tb });
    ok(!errors.length, `[${tag}] không lỗi trang ${errors.join(' | ')}`);
    await page.context().close();
  }
  await browser.close();
  console.log('OK rot-nut');
})().catch((e) => { console.error(e.message || e); process.exit(1); });
