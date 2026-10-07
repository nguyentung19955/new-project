// v180: khối "Đợt N · Vô tận" (.tb-center) đứng yên một chỗ, kích thước cố định, dù tiền/mạng đổi số chữ số,
// hiện ô nước, nút chat, đổi tốc độ, ẩn/hiện chỉ số, thanh boss, thanh tướng, chế độ Khó, số đợt 1→9999
// Chạy: node tests/dot-co-dinh/dot-co-dinh.test.js [tiền-tố-ảnh]
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const ROOT = path.resolve(__dirname, '../..');
const URL = 'file://' + path.join(ROOT, 'index.html');
const SHOT = path.join(__dirname, 'shots');
const PFX = process.argv[2] || 'sau';
const CHECK = PFX === 'sau';
fs.mkdirSync(SHOT, { recursive: true });
const ok = (cond, msg) => { if (!cond) { if (CHECK) throw new Error('FAIL: ' + msg); console.log('  ✗ ' + msg); } else console.log('  ✓ ' + msg); };
const SAVE = { unlocked: 5, storySeen: true, settings: { skipStory: true } };

// mỗi bước đổi trạng thái rồi gọi lại updateTopbar (vòng lặp game cũng gọi mỗi khung hình)
const STEPS = [
  ['đợt 1', 'g.wave = 1'],
  ['đợt 9', 'g.wave = 9'],
  ['đợt 10', 'g.wave = 10'],
  ['đợt 100', 'g.wave = 100'],
  ['đợt 999', 'g.wave = 999'],
  ['tiền 99', 'g.gold = 99'],
  ['tiền 100', 'g.gold = 100'],
  ['tiền 1000', 'g.gold = 1000'],
  ['tiền 123456', 'g.gold = 123456'],
  ['mạng 100/100', 'g.lives = 100; g.maxLives = 100'],
  ['mạng 5/100', 'g.lives = 5'],
  ['tốc độ x2', "document.getElementById('btn-speed').click()"],
  ['tốc độ x3', "document.getElementById('btn-speed').click()"],
  ['ẩn/hiện chỉ số 👁', "document.getElementById('btn-detail').click()"],
  ['thanh boss', "document.getElementById('bossbar').hidden = false"],
  ['nextwaves', "document.getElementById('nextwaves').hidden = false"],
  ['thanh tướng', "document.getElementById('hero-stats').hidden = false"],
  ['chế độ Khó', 'g.hard = true'],
  ['ô nước', "document.getElementById('tb-water').hidden = false; document.getElementById('tb-water').style.display = 'flex'"],
  ['nút chat', "document.getElementById('btn-chat').hidden = false"],
  ['đợt 9999', 'g.wave = 9999'],
  ['đợt 9 lại', 'g.wave = 9; g.hard = false; g.gold = 5'],
];

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  for (const [w, h] of [[1920, 1000], [844, 390], [667, 375]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
    await page.addInitScript((s) => localStorage.setItem('nuicao.v1', JSON.stringify(s)), SAVE);
    await page.goto(URL);
    await page.waitForTimeout(800);
    await page.evaluate(() => { ui.playLevel(0, false); document.querySelector('[data-act=prep-go]').click(); });
    await page.waitForTimeout(600);
    const tag = `${w}x${h}`;
    const measure = () => page.evaluate(() => {
      const R = (s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right }; };
      const wv = document.getElementById('tb-wave');
      const kids = [...document.querySelectorAll('#topbar > *')].filter((e) => e.offsetParent && !e.classList.contains('tb-center'));
      return { c: R('.tb-center'), p: R('.tb-prog'), t: R('#tb-wave'), txt: wv.textContent,
        cx: (() => { const r = wv.getBoundingClientRect(); return r.x + r.width / 2; })(),
        nextL: Math.min(...kids.map((e) => e.getBoundingClientRect().x)), bar: R('#topbar'),
        lastR: Math.max(...kids.map((e) => e.getBoundingClientRect().right)) };
    });
    let base = null, maxD = 0, worst = '';
    for (const [name, code] of STEPS) {
      await page.evaluate(`(() => { const g = ui.game; ${code}; ui.updateTopbar(); })()`);
      await page.waitForTimeout(120);
      const m = await measure();
      if (!base) base = m;
      const d = Math.max(Math.abs(m.c.x - base.c.x), Math.abs(m.c.y - base.c.y), Math.abs(m.c.w - base.c.w), Math.abs(m.c.h - base.c.h),
        Math.abs(m.p.x - base.p.x), Math.abs(m.p.y - base.p.y), Math.abs(m.p.w - base.p.w), Math.abs(m.cx - base.cx), Math.abs(m.t.y - base.t.y));
      if (d > maxD) { maxD = d; worst = name; }
      ok(d <= 1, `${tag} ${name}: lệch ${d.toFixed(1)}px  ("${m.txt}")`);
      ok(m.t.x >= m.c.x - 1 && m.t.r <= m.c.r + 1, `${tag} ${name}: chữ nằm gọn trong khối (${m.t.w.toFixed(0)} ≤ ${m.c.w.toFixed(0)}px)`);
      ok(m.c.r <= m.nextL + 0.5 && m.lastR <= m.bar.r + 1, `${tag} ${name}: không đè ô tiền / không tràn thanh trên`);
      const k = { 'đợt 999': 'dot999', 'tiền 99': 'tien99', 'tiền 123456': 'tien123456', 'ô nước': 'onuoc' }[name];
      if (k) {
        await page.screenshot({ path: path.join(SHOT, `${PFX}-${tag}-${k}.png`), clip: { x: 0, y: 0, width: w, height: Math.ceil(m.bar.h + 6) } });
      }
    }
    console.log(`  ${tag}: lệch lớn nhất ${maxD.toFixed(1)}px (${worst})`);
    ok(!errors.length, `${tag}: không lỗi JS ${errors.join('|')}`);
    await ctx.close();
  }
  await browser.close();
  console.log('XONG');
})().catch((e) => { console.error(e); process.exit(1); });
