// Test khung người chơi trên màn menu: avatar nằm trong huy hiệu, chữ gọn trong ô tối, không lộ email.
// Chạy: node tests/khung-nguoi-choi/khung.test.js [thư-mục-ảnh]
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const ROOT = path.resolve(__dirname, '../..');
const URL = 'file://' + path.join(ROOT, 'index.html');
const OUT = process.argv[2] || path.join(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });
const SOFT = process.env.SOFT;
const ok = (c, m) => { if (!c) { if (SOFT) return console.log('  ✗ ' + m); throw new Error('FAIL: ' + m); } console.log('  ✓ ' + m); };
// ảnh avatar nhỏ (ô vuông 2 màu) để thử photoURL
const PHOTO = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#3a7bd5"/><circle cx="32" cy="26" r="12" fill="#fff"/><rect x="12" y="42" width="40" height="22" rx="11" fill="#fff"/></svg>');
const USERS = {
  khach: null,
  email: { isAnonymous: false, email: 'test123@example.test', uid: 'x' },
  ten_dai: { isAnonymous: false, email: 'a@b.c', uid: 'y', displayName: 'Nguyễn Văn Trường Giang Thượng Ngàn' },
  anh: { isAnonymous: false, email: 'a@b.c', uid: 'z', displayName: 'Ly Tester', photoURL: PHOTO },
};
// vùng trong ảnh khung 700x241 (đo bằng PIL): ô tối x 230–625, y 50–187; lòng huy hiệu tâm (117,118) r≈45
const DARK = { x0: 230 / 700, x1: 628 / 700, y0: 48 / 241, y1: 190 / 241 };
const MED = { cx: 117 / 700, cy: 118 / 241, r: 46 / 241 };

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const errors = [];
  for (const [w, h] of [[844, 390], [667, 375], [932, 430], [390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 3 });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
    await page.addInitScript(() => localStorage.setItem('nuicao.v1', JSON.stringify({ unlocked: 2, stars: [3], lifeKills: 2100, storySeen: true, settings: { skipStory: true } })));
    await page.goto(URL);
    await page.waitForTimeout(900);
    for (const [k, u] of Object.entries(USERS)) {
      await page.evaluate((u) => { CLOUD.user = u; ui.showMenu(); }, u);
      await page.waitForTimeout(150);
      const r = await page.evaluate(() => {
        const box = document.querySelector('#menu-player'), b = box.getBoundingClientRect();
        const rect = (e) => { if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.x, y: q.y, w: q.width, h: q.height, r: q.right, b: q.bottom }; };
        const nm = box.querySelector('b'), sm = box.querySelector('small');
        return { box: rect(box), text: rect(box.querySelector('.pl-txt')), name: rect(nm), sub: rect(sm), av: rect(box.querySelector('.av img')),
          svg: !!box.querySelector('svg'), nameTxt: nm.textContent, subTxt: sm.textContent, html: box.innerHTML,
          nameOver: nm.scrollWidth > nm.clientWidth + 1, subOver: sm.scrollWidth > sm.clientWidth + 1, rot: document.querySelector('#wrap').classList.contains('rot') };
      });
      const tag = `${k}-${w}x${h}`;
      console.log(tag, r.nameTxt, '|', r.subTxt);
      // ở chế độ xoay dọc, khung bị xoay 90° — đổi hệ toạ độ cho hộp chữ về theo khung
      const B = r.box, horiz = (q) => r.rot ? { x: (q.y - B.y) / B.h, x1: (q.b - B.y) / B.h, y: (B.r - q.r) / B.w, y1: (B.r - q.x) / B.w }
        : { x: (q.x - B.x) / B.w, x1: (q.r - B.x) / B.w, y: (q.y - B.y) / B.h, y1: (q.b - B.y) / B.h };
      const bw = r.rot ? B.h : B.w, bh = r.rot ? B.w : B.h;
      ok(Math.abs(bw / bh - 700 / 241) < 0.03, `${tag}: khung đúng tỉ lệ ảnh (${(bw / bh).toFixed(3)})`);
      for (const q of [r.name, r.sub]) {
        const t = horiz(q);
        ok(t.x >= DARK.x0 && t.x1 <= DARK.x1 && t.y >= DARK.y0 && t.y1 <= DARK.y1, `${tag}: chữ nằm trong ô tối (${[t.x, t.x1, t.y, t.y1].map((v) => v.toFixed(3)).join(',')})`);
      }
      ok(!r.subOver, `${tag}: dòng phụ không tràn`);
      ok(!/@|test123|example/.test(r.nameTxt + r.html), `${tag}: không lộ email`);
      ok(!/Đã đăng nhập/.test(r.subTxt), `${tag}: bỏ chữ "Đã đăng nhập"`);
      ok(!r.svg, `${tag}: không chèn SVG đè huy hiệu`);
      if (u && u.photoURL) {
        const a = horiz(r.av), cx = (a.x + a.x1) / 2, cy = (a.y + a.y1) / 2, rad = (a.y1 - a.y) / 2;
        ok(Math.abs(cx - MED.cx) < 0.01 && Math.abs(cy - MED.cy) < 0.02 && rad <= MED.r, `${tag}: ảnh đại diện nằm đúng lòng huy hiệu`);
      }
      await page.screenshot({ path: path.join(OUT, `${tag}.png`), clip: { x: B.x - 4, y: B.y - 4, width: B.w + 8, height: B.h + 8 } });
    }
    await page.screenshot({ path: path.join(OUT, `menu-${w}x${h}.png`) });
    await ctx.close();
  }
  await browser.close();
  ok(!errors.length, 'không lỗi trang ' + errors.join(' | '));
})().catch((e) => { console.error(e.message); process.exit(1); });
