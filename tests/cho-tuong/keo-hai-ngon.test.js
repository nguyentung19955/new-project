// Test hồi quy sua-trieu-hoi: đang kéo tướng (ngón 1) mà ngón 2 chạm tướng khác → trước đây `drag` bị ghi đè, lớp
// #wrap.dragging-hero kẹt mãi → chợ tướng ẩn + không nhận chạm, "không triệu hồi được nữa". Chạy: node tests/cho-tuong/keo-hai-ngon.test.js
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const { ok, ROOT } = require('./helpers');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });

async function run(W, H) {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await (await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true })).newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
  await page.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('nuicao.v1', JSON.stringify({ unlocked: 5, storySeen: true, settings: { skipStory: true } })); sessionStorage.setItem('seeded', '1'); } });
  await page.goto('file://' + path.join(ROOT, 'index.html'));
  await page.waitForTimeout(800);
  await page.evaluate(() => ui.playLevel(0, false));
  await page.waitForSelector('#prep:not([hidden])');
  await page.click('[data-act=prep-go]');
  await page.waitForTimeout(300);
  await page.evaluate(() => { game.running = false; game.gold = 9999; for (const s of [0, 1]) game.spawnHero(s, BASIC_HEROES[s], { tier: 1 }); });
  const xy = (s) => page.evaluate((s) => { const [x, y] = CONFIG.slots[s]; const r = document.querySelector('#game').getBoundingClientRect(); return logToClient(x, y); }, s);   // khung-co-dinh: toạ độ bản đồ → màn (thu phóng + xoay)
  const A = await xy(0), B = await xy(1);
  const cdp = await page.context().newCDPSession(page);
  const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y, id]) => ({ x, y, id })) });
  const state = () => page.evaluate(() => ({ cls: $('#wrap').classList.contains('dragging-hero'), vis: getComputedStyle($('#deck')).visibility, pe: getComputedStyle($('#deck')).pointerEvents, trash: !$('#trash').hidden }));

  // ngón 1 giữ & kéo tướng ô 0
  await T('touchStart', [[A[0], A[1], 1]]);
  for (let k = 1; k <= 6; k++) { await T('touchMove', [[A[0] + k * 8, A[1] - k * 6, 1]]); await page.waitForTimeout(16); }
  ok((await state()).cls, 'đang kéo tướng: chợ ẩn, hiện thùng 🗑');
  // ngón 2 chạm tướng ô 1 rồi nhấc, sau đó ngón 1 nhấc
  const a1 = [A[0] + 48, A[1] - 36, 1];
  await T('touchStart', [a1, [B[0], B[1], 2]]);
  await T('touchEnd', [a1]);
  await T('touchEnd', []);
  await page.waitForTimeout(200);
  const s = await state();
  ok(!s.cls && s.vis === 'visible' && s.pe === 'auto' && !s.trash, `nhấc cả 2 ngón: chợ hiện lại & nhận chạm, thùng 🗑 ẩn (${JSON.stringify(s)})`);

  // chạm 1 thẻ chợ → mua được
  await page.evaluate(() => { ui.sel = -1; ui.sig.deck = null; ui.updateDeck(); });
  const b = await page.locator('#deck .mk-card[data-mk="0"]').boundingBox();
  const n0 = await page.evaluate(() => game.summonN);
  await T('touchStart', [[b.x + b.width / 2, b.y + b.height / 2, 3]]); await T('touchEnd', []);
  await page.waitForTimeout(150);
  ok(await page.evaluate((n0) => game.summonN === n0 + 1, n0), 'chạm thẻ chợ sau đó → triệu hồi được');
  await page.screenshot({ path: path.join(SHOT, `keo-hai-ngon-${W}x${H}.png`) });

  // lớp dragging-hero còn sót (bản cũ) → chạm bản đồ lần sau / vào trận mới tự gỡ
  await page.evaluate(() => ui.showTrash(0));
  await T('touchStart', [[B[0] + 200, B[1] + 5, 4]]); await T('touchEnd', []);
  await page.waitForTimeout(100);
  ok(!(await state()).cls, 'lớp dragging-hero sót lại → chạm bản đồ là gỡ');
  await page.evaluate(() => ui.showTrash(0));
  await page.evaluate(() => ui.startLevel(0));
  await page.waitForTimeout(300);
  ok(!(await state()).cls, 'vào trận mới không mang lớp dragging-hero sót sang');
  ok(!errors.length, 'không lỗi JS ' + errors.join(' | '));
  await browser.close();
}
async function main() { await run(844, 390); await run(1920, 934); console.log('OK keo-hai-ngon'); }
main().catch((e) => { console.error(e); process.exit(1); });
