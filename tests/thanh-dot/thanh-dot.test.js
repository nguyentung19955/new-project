// v172: thanh tiến độ đợt không bị kéo méo — hai đầu ngọc giữ tỉ lệ ảnh, phần lấp đầy nằm trong rãnh
// Chạy: node tests/thanh-dot/thanh-dot.test.js [tiền-tố-ảnh]
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const ROOT = path.resolve(__dirname, '../..');
const URL = 'file://' + path.join(ROOT, 'index.html');
const SHOT = path.join(__dirname, 'shots');
const PFX = process.argv[2] || 'sau';
fs.mkdirSync(SHOT, { recursive: true });
const ok = (cond, msg) => { if (!cond) throw new Error('FAIL: ' + msg); console.log('  ✓ ' + msg); };
const SAVE = { unlocked: 5, storySeen: true, settings: { skipStory: true } };
const IMG = { w: 800, h: 163, gemL: 131, gemR: 133, grooveTop: 31, grooveBot: 124 };

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  for (const [w, h] of [[1920, 1000], [844, 390], [667, 375], [390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
    await page.addInitScript((s) => localStorage.setItem('nuicao.v1', JSON.stringify(s)), SAVE);
    await page.goto(URL);
    await page.waitForTimeout(800);
    await page.evaluate(() => { ui.playLevel(0, false); document.querySelector('[data-act=prep-go]').click(); });
    await page.waitForTimeout(800);
    const m = await page.evaluate(() => {
      const b = document.querySelector('.tb-prog'), cs = getComputedStyle(b), r = b.getBoundingClientRect();
      return { r: { w: r.width, h: r.height, x: r.x, y: r.y }, bl: parseFloat(cs.borderLeftWidth), br: parseFloat(cs.borderRightWidth),
        img: cs.borderImageSource, bg: cs.backgroundImage, ow: b.offsetWidth, oh: b.offsetHeight, sc: Math.max(r.width, r.height) / b.offsetWidth };
    });
    const tag = `${w}x${h}`;
    ok(/thanh-tien-do/.test(m.img) && m.bg === 'none', `${tag}: dùng border-image 9 mảnh, không nền 100% 100%`);
    // tỉ lệ đầu ngọc (rộng/cao) phải bằng tỉ lệ trên ảnh gốc
    // (màn dọc: cả game xoay 90° nên đo theo kích thước bố cục, không theo hộp trên màn hình)
    const rL = m.bl / m.oh, rR = m.br / m.oh, sw = m.ow * m.sc, sh = m.oh * m.sc;
    ok(Math.abs(rL - IMG.gemL / IMG.h) < 0.02 && Math.abs(rR - IMG.gemR / IMG.h) < 0.02, `${tag}: đầu ngọc trái ${rL.toFixed(3)} / phải ${rR.toFixed(3)} ≈ ảnh ${(IMG.gemL / IMG.h).toFixed(3)}`);
    ok(sw <= 0.4 * Math.max(w, h) && sw >= 100 && sh >= 14, `${tag}: rộng hợp lý ${sw.toFixed(0)}px (cao ${sh.toFixed(0)}px, tỉ lệ ${(sw / sh).toFixed(2)})`);
    for (const f of [0, 0.5, 1]) {
      const q = await page.evaluate((f) => {
        const b = document.querySelector('.tb-prog'), i = b.querySelector('i');
        // vòng lặp game ghi đè style.width mỗi khung hình → ép bằng một luật !important trong stylesheet
        let st = document.getElementById('t-fill'); if (!st) { st = document.createElement('style'); st.id = 't-fill'; document.head.appendChild(st); }
        st.textContent = `#tb-fill { width: ${f * 100}% !important; transition: none !important; }`;
        const H = b.clientHeight;
        return { gl: 0, gr: b.clientWidth, gt: H * 31 / 163, gb: H * 124 / 163,
          il: i.offsetLeft, ir: i.offsetLeft + i.offsetWidth, it: i.offsetTop, ib: i.offsetTop + i.offsetHeight, iw: i.offsetWidth };
      }, f);
      ok(q.il >= q.gl - 1 && q.ir <= q.gr + 1 && q.it >= q.gt - 0.5 && q.ib <= q.gb + 0.5 && Math.abs(q.iw - f * (q.gr - q.gl)) < 1,
        `${tag}: lấp đầy ${f * 100}% nằm trong rãnh (${q.il.toFixed(1)}–${q.ir.toFixed(1)} ⊂ ${q.gl.toFixed(1)}–${q.gr.toFixed(1)})`);
      if (f === 0.5) {
        const r = await page.locator('.tb-prog').boundingBox();
        await page.screenshot({ path: path.join(SHOT, `${PFX}-${tag}.png`) });
        await page.screenshot({ path: path.join(SHOT, `${PFX}-${tag}-zoom.png`), clip: { x: Math.max(0, r.x - 30), y: Math.max(0, r.y - 30), width: r.width + 60, height: r.height + 60 } });
      }
    }
    ok(!errors.length, `${tag}: không lỗi JS ${errors.join('|')}`);
    await ctx.close();
  }
  await browser.close();
  console.log('XONG');
})().catch((e) => { console.error(e); process.exit(1); });
