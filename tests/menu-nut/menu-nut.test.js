// Test mọi nút menu (v165). Chạy: node tests/menu-nut/menu-nut.test.js
// - menu chính: bấm thật từng nút (Xuất Quân, Anh Hùng, Ấn Phù, Kho Báu, Cài đặt, Bách khoa, Xếp hạng, Góp ý, Chơi mới) → đúng màn mở,
//   tâm nút không bị phần tử khác che
// - Ấn Phù: chưa có tướng Vàng vẫn mở màn (giải thích + nút Đến Anh Hùng); có tướng Vàng thì khắc ấn được; toast nổi trên lớp menu
// - ngăn kéo ≡ trong trận: Túi đồ, Anh Hùng, Ấn Phù, Bách khoa, Tạm dừng, Góp ý
// - Đăng xuất: hiện khi đã đăng nhập (bảng tài khoản ở khung người chơi + Cài đặt), bấm → xác nhận → gọi CLOUD.signOut; khách / đám mây tắt thì không có
// - thẻ tướng không còn dấu ✦ "đã khám phá hiệu ứng ẩn"
const path = require('path');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const ROOT = path.resolve(__dirname, '../..');
const SHOT = path.join(__dirname, 'shots');
require('fs').mkdirSync(SHOT, { recursive: true });
const ok = (c, m) => { if (!c) throw new Error('FAIL: ' + m); console.log('  ✓ ' + m); };
const shown = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); return !!e && !e.hidden && e.getClientRects().length > 0; }, sel);

async function open(browser, w = 844, h = 390, save = {}) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
  await page.addInitScript((s) => { localStorage.setItem('nuicao.v1', JSON.stringify(s)); }, { unlocked: 5, storySeen: true, settings: { skipStory: true }, ...save });
  await page.goto('file://' + path.join(ROOT, 'index.html'));
  await page.waitForTimeout(700);
  return { page, errors };
}
// tâm nút có đúng là nút (hoặc con của nó) không
const hit = (page, sel) => page.evaluate((s) => {
  const b = document.querySelector(s), r = b.getBoundingClientRect();
  const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
  return !!e && (e === b || b.contains(e));
}, sel);

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const errs = [];
  try {
    for (const [w, h] of [[844, 390], [667, 375]]) {
      const tag = `${w}x${h}`;
      console.log(`Menu chính ${tag}`);
      const MAIN = [['#btn-continue', '#modes'], ['#btn-heroes', '#roster'], ['#btn-runes', '#runes'], ['#btn-treasury', '#treasury'],
        ['#btn-settings', '#settings'], ['#btn-menu-codex', '#screen'], ['#btn-ranks', '#ranks'], ['#btn-feedback', '#feedback']];
      for (const [btn, scr] of MAIN) {
        const { page, errors } = await open(browser, w, h);
        ok(await hit(page, btn), `[${tag}] ${btn}: tâm nút không bị che`);
        ok(await page.evaluate((b) => typeof document.querySelector(b).onclick === 'function', btn), `[${tag}] ${btn}: còn gắn onclick`);
        await page.click(btn);
        await page.waitForTimeout(300);
        ok(await shown(page, scr), `[${tag}] ${btn} → mở ${scr}`);
        errs.push(...errors);
        await page.context().close();
      }
    }

    console.log('Ấn Phù');
    {
      const { page, errors } = await open(browser);
      await page.click('#btn-runes');
      await page.waitForTimeout(200);
      ok(await shown(page, '#runes') && (await page.textContent('#runes')).includes('Chưa có tướng Vàng'), 'chưa có tướng Vàng: vẫn mở màn Ấn Phù kèm giải thích');
      await page.screenshot({ path: path.join(SHOT, 'an-phu-trong.png') });
      await page.click('#runes [data-act=rn-roster]');
      await page.waitForTimeout(200);
      ok(await shown(page, '#roster') && !(await shown(page, '#runes')), 'nút Đến Anh Hùng → màn Anh Hùng');
      // toast nằm trên lớp phủ menu (trước đây bị che nên bấm như không có gì)
      ok(await page.evaluate(() => +getComputedStyle(document.querySelector('#toasts')).zIndex > +getComputedStyle(document.querySelector('#menu')).zIndex), 'thông báo (toast) nổi trên lớp menu');
      // có tướng Vàng: chọn ấn, khắc được (cho sẵn Tu Vi)
      const t = await page.evaluate(() => { const t = LEGEND_HEROES.find((k) => HEROES[k].legend === 'legendary'); ui.save.owned = [...(ui.save.owned || []), t]; ui.save.tuvi = { [t]: 1e7 }; ui.showMenu(); return t; });
      await page.click('#btn-runes');
      await page.waitForTimeout(200);
      ok(await page.locator('#runes .rn-node').count() > 0, `có tướng Vàng (${t}): hiện bảng ấn`);
      await page.click('#runes .rn-node >> nth=0');
      const before = await page.evaluate(() => JSON.stringify(ui.heroRuneLv(ui.runeHero)));
      await page.click('#runes [data-act=rn-buy]');
      ok(await page.evaluate((b) => JSON.stringify(ui.heroRuneLv(ui.runeHero)) !== b, before), 'khắc ấn được');
      await page.click('#runes [data-act=rn-back]');
      await page.waitForTimeout(200);
      ok(await shown(page, '#menu') && !(await shown(page, '#runes')), 'Quay lại → về menu');
      errs.push(...errors);
      await page.context().close();
    }

    console.log('Chơi mới / Tiếp tục khi đang có trận');
    {
      const { page, errors } = await open(browser);
      await page.evaluate(() => ui.playLevel(0, false));
      await page.waitForSelector('#prep:not([hidden])');
      await page.click('[data-act=prep-go]');
      await page.waitForTimeout(300);
      await page.evaluate(() => ui.showMenu());
      ok(await shown(page, '#btn-newgame'), 'đang có trận: hiện nút Chơi mới');
      await page.click('#btn-newgame');
      await page.waitForTimeout(200);
      ok(await shown(page, '#modes'), 'Chơi mới → màn chọn chế độ');
      await page.evaluate(() => ui.showMenu());
      await page.click('#btn-continue');
      await page.waitForTimeout(200);
      ok(await page.evaluate(() => document.querySelector('#menu').hidden && ui.game.started), 'Tiếp tục → quay lại trận');

      console.log('Ngăn kéo ≡ trong trận');
      for (const [k, scr] of [['bag', '#screen'], ['heroes', '#roster'], ['runes', '#runes'], ['codex', '#screen'], ['pause', '#settings'], ['feedback', '#feedback']]) {
        await page.click('#btn-menu');
        await page.waitForTimeout(100);
        await page.click(`#drawer [data-k=${k}]`);
        await page.waitForTimeout(200);
        ok(await shown(page, scr), `≡ ${k} → mở ${scr}`);
        // đóng lại, về trận
        await page.evaluate(() => { for (const id of ['#screen', '#roster', '#runes', '#settings', '#feedback']) document.querySelector(id).hidden = true; });
      }
      errs.push(...errors);
      await page.context().close();
    }

    console.log('Đăng xuất');
    {
      const { page, errors } = await open(browser);
      // giả lập đã đăng nhập
      const login = () => page.evaluate(() => {
        window.__out = 0;
        Object.assign(CLOUD, { enabled: true, authKnown: true, signedIn: true, ready: true, user: { uid: 'u1', email: 'an@vd.vn', displayName: 'An', isAnonymous: false } });
        CLOUD.signOut = async () => { window.__out++; CLOUD.signedIn = false; CLOUD.user = null; };
        ui.showMenu();
      });
      await login();
      await page.click('#menu-player');
      ok(await shown(page, '#pl-pop'), 'chạm khung người chơi → bảng tài khoản');
      ok(await page.locator('#pl-pop [data-act=cloud-out]').isVisible(), 'đã đăng nhập: có nút Đăng xuất');
      await page.screenshot({ path: path.join(SHOT, 'bang-tai-khoan.png') });
      await page.click('#pl-pop [data-act=cloud-out]');
      ok(await page.locator('#pl-pop [data-act=cloud-out-ok]').isVisible() && await page.evaluate(() => window.__out === 0), 'bấm Đăng xuất → hỏi xác nhận, chưa đăng xuất');
      await page.click('#pl-pop [data-act=cloud-out-no]');
      ok(await page.locator('#pl-pop [data-act=cloud-out]').isVisible() && await page.evaluate(() => window.__out === 0), 'Huỷ → không đăng xuất');
      // đổi biệt danh ngay trong bảng
      await page.fill('#pl-nick', 'Thánh Gióng');
      await page.click('#pl-pop [data-act=pl-rename]');
      ok(await page.evaluate(() => ui.save.nick === 'Thánh Gióng') && (await page.textContent('#menu-player')).includes('Thánh Gióng'), 'đổi biệt danh trong bảng');
      await page.click('#pl-pop [data-act=cloud-out]');
      await page.click('#pl-pop [data-act=cloud-out-ok]');
      await page.waitForTimeout(200);
      ok(await page.evaluate(() => window.__out === 1), 'xác nhận → gọi CLOUD.signOut');
      ok(await shown(page, '#login'), 'đăng xuất xong → màn đăng nhập');
      ok(await page.evaluate(() => ui.save.nick === 'Thánh Gióng'), 'tiến trình trên máy vẫn giữ');
      // Cài đặt
      await login();
      await page.click('#btn-settings');
      await page.click('#cloud-row [data-act=cloud-out]');
      ok(await page.locator('#cloud-row [data-act=cloud-out-ok]').isVisible() && await page.evaluate(() => window.__out === 0), 'Cài đặt: Đăng xuất → hỏi xác nhận');
      await page.click('#cloud-row [data-act=cloud-out-ok]');
      await page.waitForTimeout(200);
      ok(await page.evaluate(() => window.__out === 1) && await shown(page, '#login'), 'Cài đặt: xác nhận → signOut + màn đăng nhập');
      // khách ẩn danh: không có Đăng xuất, có Đăng nhập
      await page.evaluate(() => { Object.assign(CLOUD, { signedIn: false, user: { uid: 'g1', isAnonymous: true } }); ui.offline = true; ui.showMenu(); });
      await page.click('#menu-player');
      ok(await page.locator('#pl-pop [data-act=cloud-out]').count() === 0 && await page.locator('#pl-pop [data-act=pl-login]').isVisible(), 'khách: không có Đăng xuất, có Đăng nhập');
      errs.push(...errors);
      await page.context().close();
      // đám mây tắt (mặc định khi chưa cấu hình Firebase)
      const o = await open(browser);
      await o.page.click('#menu-player');
      ok(await shown(o.page, '#pl-pop') && await o.page.locator('#pl-pop [data-act=cloud-out], #pl-pop [data-act=pl-login]').count() === 0, 'đám mây tắt: không có Đăng xuất / Đăng nhập');
      await o.page.mouse.click(420, 300);
      ok(!(await shown(o.page, '#pl-pop')), 'chạm ra ngoài → đóng bảng');
      await o.page.click('#btn-settings');
      ok(await o.page.locator('#cloud-row [data-act=cloud-out]').count() === 0, 'đám mây tắt: Cài đặt không có Đăng xuất');
      errs.push(...o.errors);
      await o.page.context().close();
    }

    console.log('Không còn dấu ✦ ở thẻ tướng');
    {
      const { page, errors } = await open(browser, 844, 390, { secrets: ['h.lactuong'] });
      await page.click('#btn-heroes');
      await page.waitForTimeout(200);
      ok(await page.locator('#roster .kn').count() === 0, 'thẻ / ảnh chi tiết không còn dấu ✦');
      errs.push(...errors);
      await page.context().close();
    }
    ok(!errs.length, 'không có lỗi JS' + (errs.length ? ': ' + errs.join(' | ') : ''));
    console.log('PASS menu-nut');
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
