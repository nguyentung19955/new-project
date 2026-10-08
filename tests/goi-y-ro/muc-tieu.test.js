// Test claude/goi-y-ro (mở rộng): MỤC TIÊU HỢP THỂ (ghim / gợi ý tự động), TÌM TÊN không dấu, CHẠM GIỮ thẻ chợ.
// Chạy: node tests/goi-y-ro/muc-tieu.test.js
const path = require('path');
const fs = require('fs');
const { open, enter, ok, noPixel } = require('../cho-tuong/helpers');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });

async function run(pixel, w, h, full) {
  const tag = `${pixel ? 'pixel' : 'pixel0'}-${w}x${h}`;
  const { browser, page, errors } = await open(w, h, {}, pixel ? null : noPixel());
  await enter(page, 0);
  // công thức Tím từ 2 tướng Thường; trên sân có 1 nguyên liệu (a); chợ có b, a và 4 loại khác
  const f = await page.evaluate(() => {
    game.running = false; game.gold = 3000;
    const f = FUSION.find((x) => HEROES[x.to].legend === 'epic' && BASIC_HEROES.includes(x.a) && BASIC_HEROES.includes(x.b) && x.a !== x.b);
    game.spawnHero(game.freeSlots()[0], f.a, { tier: 1 });
    const others = BASIC_HEROES.filter((t) => t !== f.a && t !== f.b && !FUSION.some((y) => y.to === f.to && (y.a === t || y.b === t)));
    game.market.types = [others[0], f.b, others[1], f.a, others[2], others[3]];
    game.marketNeeds = ((mn) => () => { const nd = mn(); nd.hop.clear(); nd.hopLock.clear(); return nd; })(game.marketNeeds.bind(game));
    ui.save.settings.pins = []; ui.save.settings.autoPin = true; ui.pinCache = null; ui.sig.deck = null; ui.sel = -1;
    return f;
  });
  await page.waitForTimeout(300);
  const cls = () => page.$$eval('#deck .mk-card', (cs) => cs.map((c) => c.className));
  // chưa ghim: tự gợi ý công thức gần xong nhất (đang có 1 nguyên liệu)
  let c = await cls();
  const auto = await page.evaluate(() => ui.pinTargets());
  ok(auto.auto && auto.to.length === 1 && (await page.locator('#deck .mk-pin.auto').count()) === 1, `[${tag}] chưa ghim: dải "Gợi ý" tự động (${auto.to[0]})`);
  // ghim đúng công thức → thẻ b sáng ghim, thẻ khác không
  await page.evaluate((t) => { ui.togglePin(t); }, f.to);
  await page.waitForTimeout(200);
  c = await cls();
  ok(/\bpin\b/.test(c[1]) && !/pin-a/.test(c[1]) && [0, 2, 4, 5].every((i) => !/\bpin\b/.test(c[i])), `[${tag}] ghim ${f.to}: thẻ nguyên liệu ${f.b} sáng màu ghim, thẻ khác không`);
  ok(/\btwin\b/.test(c[3]), `[${tag}] thẻ ${f.a} trùng tướng ★ trên sân vẫn ưu tiên sáng "ghép"`);
  ok(await page.$eval('#deck .mk-card[data-mk="1"] .mk-gy', (e) => !!e.querySelector('.svpin')), `[${tag}] thẻ ghim có dấu ghim ở góc`);
  const strip = await page.$$eval('#deck .mk-pin:not(.auto) .mp-m', (ms) => ms.map((m) => m.className));
  ok(strip.length === 2 && strip.some((x) => /part|ok/.test(x)) && strip.some((x) => /\bno\b/.test(x)), `[${tag}] dải mục tiêu: 2 nguyên liệu, có (★ hiện tại) / thiếu (mờ)`);
  const gy = await page.$eval('#deck .mk-card[data-mk="1"]', (e) => getComputedStyle(e).getPropertyValue('--gy').trim());
  ok(gy === '#5FE0FF', `[${tag}] màu ghim riêng ${gy}`);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('nuicao.v1')).settings.pins);
  ok(saved && saved[0] === f.to, `[${tag}] ghim được lưu (${saved})`);
  // tối đa 2 ghim
  const pins3 = await page.evaluate((t) => { const L = FUSION.filter((x) => x.to !== t).slice(0, 2).map((x) => x.to); L.forEach((x) => ui.togglePin(x)); const r = ui.pinList(); ui.save.settings.pins = [t]; ui.pinCache = null; ui.sig.deck = null; return r; }, f.to);
  ok(pins3.length === 2 && !pins3.includes(f.to), `[${tag}] ghim thứ 3 thì bỏ ghim cũ nhất (còn 2)`);
  await page.waitForTimeout(200);
  if (full) await page.screenshot({ path: path.join(SHOT, `cho-ghim-${tag}.png`) });

  // chạm GIỮ thẻ chợ: hiện tên + công thức, thả tay không mua
  const g0 = await page.evaluate(() => game.gold);
  const b = await page.locator('#deck .mk-card[data-mk="1"]').boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.waitForTimeout(650);
  const tip = await page.evaluate(() => { const e = document.querySelector('#hero-tip'); return e && !e.hidden ? e.textContent : ''; });
  ok(tip.includes(await page.evaluate((t) => HEROES[t].name, f.b)) && tip.includes('Góp vào') && tip.includes(await page.evaluate((t) => HEROES[t].name, f.to)), `[${tag}] chạm giữ thẻ: tên + "Góp vào … ${f.to}"`);
  // bảng giữ tay nằm NGANG (rộng > 2× cao, ≤ 1/3 cao #ui), trong khung #ui, không che thẻ đang giữ
  const lay = await page.evaluate(() => { const e = document.querySelector('#hero-tip'), u = document.querySelector('#ui'), t = e.getBoundingClientRect(), c = document.querySelector('#deck .mk-card[data-mk="1"]').getBoundingClientRect(), U = u.getBoundingClientRect();
    const ov = Math.min(t.right, c.right) - Math.max(t.left, c.left) > 1 && Math.min(t.bottom, c.bottom) - Math.max(t.top, c.top) > 1;
    return { w: e.offsetWidth, h: e.offsetHeight, H: u.offsetHeight, inUi: e.parentNode === u, ov, inside: t.left >= U.left - 1 && t.right <= U.right + 1 && t.top >= U.top - 1 && t.bottom <= U.bottom + 1, cols: e.querySelectorAll('.ht-c').length }; });
  ok(lay.inUi && lay.cols === 3 && lay.w > lay.h * 2 && lay.h <= lay.H / 3 + 1, `[${tag}] bảng giữ tay nằm ngang 3 cột (${lay.w}×${lay.h}, cao #ui ${lay.H})`);
  ok(!lay.ov && lay.inside, `[${tag}] bảng không che thẻ đang giữ, không tràn mép`);
  if (full) await page.screenshot({ path: path.join(SHOT, `giu-the-${tag}.png`) });
  await page.mouse.up(); await page.waitForTimeout(150);
  ok(await page.evaluate((g) => game.gold === g && document.querySelector('#hero-tip').hidden, g0), `[${tag}] thả tay: ẩn thông tin, không mua`);
  await page.click('#deck .mk-card[data-mk="0"]'); await page.waitForTimeout(150);
  ok(await page.evaluate((g) => game.gold < g, g0), `[${tag}] chạm nhanh vẫn mua như cũ`);

  // tắt gợi ý tự động từ dải
  await page.evaluate(() => { ui.save.settings.pins = []; ui.pinCache = null; ui.sig.deck = null; }); await page.waitForTimeout(200);
  await page.click('#deck .mk-pin.auto .mp-x'); await page.waitForTimeout(200);
  ok(await page.evaluate(() => ui.save.settings.autoPin === false && !document.querySelector('#deck .mk-pin')), `[${tag}] ✕ trên dải gợi ý → tắt gợi ý tự động`);

  // bảng Hợp thể: nút Theo đuổi + tìm không dấu (cả 2 tab)
  await page.evaluate(() => ui.openLegends(true)); await page.waitForTimeout(200);
  await page.click(`#legends .hx-pin[data-t="${f.to}"]`); await page.waitForTimeout(150);
  ok(await page.evaluate((t) => ui.pinList().includes(t) && document.querySelector(`#legends .hx-pin[data-t="${t}"]`).classList.contains('on'), f.to), `[${tag}] Hợp thể: bấm "Theo đuổi" → ghim`);
  const nmA = await page.evaluate((t) => HEROES[t].name, f.a);
  const q = nmA.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();
  await page.fill('#legends .hs-q', q); await page.waitForTimeout(200);
  const vis = await page.$$eval('#legends .hx-card:not(.hs-off)', (cs) => cs.map((c) => c.dataset.hsT));
  ok(vis.length >= 1 && vis.every((t) => t.split(' ').includes(f.a)), `[${tag}] Hợp thể: gõ "${q}" (không dấu) → ${vis.length} công thức có ${nmA}`);
  ok(await page.evaluate(() => document.activeElement && document.activeElement.classList.contains('hs-q')), `[${tag}] gõ tìm không mất ô nhập`);
  if (full) await page.screenshot({ path: path.join(SHOT, `hop-the-tim-${tag}.png`) });
  await page.fill('#legends .hs-q', ''); await page.evaluate(() => ui.openLegends(false));

  // Anh Hùng: "thach sanh" → Thạch Sanh; lọc bậc
  await page.evaluate(() => ui.showRoster(null, true)); await page.waitForTimeout(300);
  await page.fill('#roster .hs-q', 'thach sanh'); await page.waitForTimeout(150);
  const ro = await page.$$eval('#roster .ro-card:not(.hs-off) .nm', (n) => n.map((x) => x.textContent));
  ok(ro.length >= 1 && ro.every((x) => x.includes('Thạch Sanh')), `[${tag}] Anh Hùng: "thach sanh" → ${ro.join(', ')}`);
  await page.fill('#roster .hs-q', ''); await page.click('#roster [data-act=hs-tier][data-k=legendary]'); await page.waitForTimeout(150);
  ok(await page.$$eval('#roster .ro-card:not(.hs-off)', (cs) => cs.length > 0 && cs.every((c) => c.classList.contains('legendary'))), `[${tag}] Anh Hùng: lọc bậc Vàng`);
  await page.click('#roster [data-act=hs-tier][data-k=legendary]');
  if (full) { await page.fill('#roster .hs-q', 'thach sanh'); await page.waitForTimeout(150); await page.screenshot({ path: path.join(SHOT, `anh-hung-tim-${tag}.png`) }); await page.fill('#roster .hs-q', ''); }
  ok(!errors.length, `[${tag}] không lỗi JS ${errors.join(' | ')}`);
  await browser.close();
}

(async () => {
  const ok2 = await (async () => {
    const { browser, page } = await open(844, 390);
    const r = await page.evaluate(() => [noDau('Thạch Sanh') === 'thach sanh', heroHit('thachsanh', { q: 'THACH sanh' }), heroHit('thachsanh', { q: 'thạch' }), !heroHit('thachsanh', { q: 'giong' }), noDau('Đồng') === 'dong']);
    await browser.close(); return r;
  })();
  ok(ok2.every(Boolean), 'tìm không dấu: "thach sanh" / "THACH sanh" / "thạch" → Thạch Sanh; đ → d');
  await run(true, 844, 390, true);
  await run(false, 844, 390, true);
  await run(true, 667, 375, true);
  await run(true, 1920, 934, true);
  await run(true, 390, 844, true);     // dọc: game xoay 90°, bảng giữ tay xoay theo
  console.log('muc-tieu: OK');
})().catch((e) => { console.error(e); process.exit(1); });
