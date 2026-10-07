// Test icon nhỏ dùng chung ui.ic (v159). Chạy: node tests/icon-nho/icon-nho.test.js
// - thanh máu boss, bảng chỉ số tướng, bách khoa quái: không còn emoji (ô vuông "□" khi điện thoại thiếu font), dùng icon .icn
// - chưa có ảnh: SVG nội tuyến · có ảnh assets/ui/ic-*.png (giả bằng PIL): dùng <img>
// - không tràn ở 844x390, 667x375 và xoay dọc
// ROOT=<thư mục khác> để chụp ảnh "trước" từ bản cũ (chỉ chụp, bỏ qua kiểm tra)
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const ROOT = process.env.ROOT || path.resolve(__dirname, '../..');
const OLD = !!process.env.ROOT;
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const ok = (c, m) => { if (OLD) return; if (!c) throw new Error('FAIL: ' + m); console.log('  ✓ ' + m); };
const EMOJI = /(?![★☆✦➜])\p{Extended_Pictographic}/u;  // emoji / ký hiệu hình (mũi tên ➜, sao ★ là chữ thường, có sẵn trong font)

// ảnh icon giả (vòng tròn đỏ viền nâu) bằng PIL
const FAKE = path.join(require('os').tmpdir(), 'icon-nho-gia.png');
execFileSync('python3', ['-c', `from PIL import Image, ImageDraw
im = Image.new('RGBA', (64, 64), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
d.ellipse((4, 4, 60, 60), fill=(220, 40, 40, 255), outline=(42, 22, 8, 255), width=6); im.save(${JSON.stringify(FAKE)})`]);

async function open(w, h, fake) {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
  if (fake) await page.route('**/assets/ui/ic-*.png', (r) => r.fulfill({ contentType: 'image/png', body: fs.readFileSync(FAKE) }));
  if (fake) await page.addInitScript(() => { window.ASSET_ALL = true; });   // v186: ảnh giả không có trong js/asset-list.js
  await page.addInitScript(() => { localStorage.setItem('nuicao.v1', JSON.stringify({ unlocked: 17, storySeen: true, settings: { skipStory: true } })); });
  await page.goto('file://' + path.join(ROOT, 'index.html'));
  await page.waitForTimeout(800);
  await page.evaluate(() => ui.playLevel(0, false));
  await page.waitForSelector('#prep:not([hidden])');
  await page.click('[data-act=prep-go]');
  await page.waitForTimeout(400);
  return { browser, page, errors };
}
// thả Hà Bá (đang chậm + choáng) rồi bấm vào nó để mở thanh máu boss
async function boss(page) {
  await page.evaluate(() => {
    game.paused = true;
    const e = game.spawn('haba', 300); const b = e || game.enemies[game.enemies.length - 1];
    b.slowT = 5; b.slowPct = 0.3; b.poisonT = 5;
    ui.tapBoss(b.x, b.y - enemyBox(b).h * 0.45);
  });
  await page.waitForTimeout(500);
  return page.evaluate(() => {
    const bb = document.querySelector('#bossbar'), r = bb.getBoundingClientRect(), fc = bb.querySelector('.fc');
    return { hidden: bb.hidden, text: bb.textContent, html: bb.innerHTML, svg: bb.querySelectorAll('svg.icn').length, img: bb.querySelectorAll('img.icn').length,
      imgOk: [...bb.querySelectorAll('img.icn')].every((i) => i.complete && i.naturalWidth > 0),
      r: { l: r.left, t: r.top, ri: r.right, b: r.bottom }, vw: innerWidth, vh: innerHeight, over: fc ? fc.scrollWidth > fc.clientWidth + 1 : false };
  });
}

(async () => {
  for (const [w, h, tag] of [[844, 390, 'ngang'], [667, 375, 'nho'], [390, 844, 'doc']]) {
    console.log(`— ${tag} ${w}x${h}`);
    const { browser, page, errors } = await open(w, h, false);
    const B = await boss(page);
    await page.screenshot({ path: path.join(SHOT, `${OLD ? 'truoc' : 'sau'}-${tag}.png`), clip: { x: 0, y: 0, width: Math.min(w, 420), height: Math.min(h, 260) } });
    ok(!B.hidden, `[${tag}] thanh máu boss mở khi bấm Hà Bá`);
    ok(!EMOJI.test(B.text), `[${tag}] thanh máu boss không còn emoji (${(B.text.match(EMOJI) || [''])[0]})`);
    ok(B.svg + B.img >= 6 && B.imgOk, `[${tag}] mỗi chỉ số có icon: ảnh ic-*.png thật hoặc SVG dự phòng (${B.img} ảnh + ${B.svg} SVG)`);
    ok(/Giáp/.test(B.text) && /Kháng phép/.test(B.text) && /Chậm/.test(B.text) && /Thiêu đốt/.test(B.text), `[${tag}] đủ chỉ số + trạng thái`);
    ok(B.r.l >= 0 && B.r.t >= 0 && B.r.ri <= B.vw && B.r.b <= B.vh && !B.over, `[${tag}] thanh máu boss không tràn (${JSON.stringify(B.r)})`);
    if (!OLD) {
      // bảng chỉ số tướng
      const S = await page.evaluate(() => {
        game.paused = true;
        const slot = game.freeSlots()[0];
        try { game.spawnHero(slot, game.summonList()[0], { tier: 1 }); } catch (e) { return { err: String(e) }; }
        ui.sel = game.heroes.findIndex((x) => x && x.slot === slot); if (ui.sel < 0) ui.sel = slot; ui.statsOpen = true; ui.statsSig = null;
        return null;
      });
      await page.waitForTimeout(500);
      const H = await page.evaluate(() => { const s = document.querySelector('#hero-stats'); const r = s.getBoundingClientRect();
        return { hidden: s.hidden, text: s.textContent, n: s.querySelectorAll('.hs-g .icn').length, r: { l: r.left, ri: r.right, t: r.top }, vw: innerWidth }; });
      ok(!S && !H.hidden && H.n >= 12, `[${tag}] bảng chỉ số tướng có icon mỗi dòng (${H.n}) ${S ? S.err : ''}`);
      ok(!EMOJI.test(H.text), `[${tag}] bảng chỉ số tướng không emoji`);
      if (tag === 'ngang') await page.screenshot({ path: path.join(SHOT, 'chi-so-tuong.png') });
      // bách khoa quái
      await page.evaluate(() => { ui.statsOpen = false; ui.openScreen('codex'); });
      await page.waitForTimeout(400);
      const K = await page.evaluate(() => { const s = document.querySelector('.bk-stat'); return s ? { text: s.textContent, n: s.querySelectorAll('.icn').length, over: s.scrollWidth > s.clientWidth + 1 } : null; });
      ok(K && K.n >= 4 && !EMOJI.test(K.text) && !K.over, `[${tag}] thẻ quái bách khoa có icon, không emoji, không tràn (${K && K.n})`);
      if (tag === 'ngang') await page.screenshot({ path: path.join(SHOT, 'bach-khoa.png') });
    }
    ok(!errors.length, `[${tag}] không lỗi JS ${errors.join(' | ')}`);
    await browser.close();
    if (OLD) continue;
    // có ảnh icon (giả) → dùng <img>
    const F = await open(w, h, true);
    await F.page.waitForTimeout(300);
    const B2 = await boss(F.page);
    ok(B2.img >= 6 && B2.imgOk, `[${tag}] có ảnh ic-*.png thì dùng ảnh (${B2.img} ảnh)`);
    ok(B2.r.ri <= B2.vw && !B2.over, `[${tag}] dùng ảnh vẫn không tràn`);
    if (tag === 'ngang') await F.page.screenshot({ path: path.join(SHOT, 'sau-anh-gia.png'), clip: { x: 0, y: 0, width: 420, height: 260 } });
    await F.browser.close();
  }
  console.log(OLD ? 'Đã chụp ảnh trước' : 'OK');
})().catch((e) => { console.error(e); process.exit(1); });
