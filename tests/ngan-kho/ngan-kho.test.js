// v182: Ngân khố mở khoá MỌI tướng (Thường / Tím / Vàng) + vòng cày Vô tận (theo đợt, mốc, boss, kỷ lục mới, nhiệm vụ ngày)
// Chạy: node tests/ngan-kho/ngan-kho.test.js
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const ROOT = path.resolve(__dirname, '../..');
const URL = 'file://' + path.join(ROOT, 'index.html');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const ok = (cond, msg) => { if (!cond) throw new Error('FAIL: ' + msg); console.log('  ✓ ' + msg); };
const SIZES = [[1920, 934], [844, 390], [667, 375]];

async function open(save, w = 844, h = 390) {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::|favicon|firebase|gstatic/i.test(m.text())) errors.push(m.text()); });
  await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
  await page.addInitScript((s) => { if (!sessionStorage.getItem('seeded')) { if (s) localStorage.setItem('nuicao.v1', JSON.stringify(s)); sessionStorage.setItem('seeded', '1'); } }, save);
  await page.goto(URL);
  await page.waitForTimeout(900);
  return { browser, page, errors };
}

(async () => {
  // ================= người chơi mới: chỉ có tướng khởi đầu
  let { browser, page, errors } = await open(null);
  const s0 = await page.evaluate(() => ({ owned: ui.save.owned, starter: STARTER_HEROES, v: ui.save.heroOpenV, all: BASIC_HEROES.length + LEGEND_HEROES.length }));
  ok(s0.v === 1 && s0.owned.length === s0.starter.length && s0.starter.every((t) => s0.owned.includes(t)), `người mới: mở sẵn ${s0.starter.length} tướng Thường khởi đầu`);
  ok(s0.all === 60, 'tổng 60 tướng (20 Thường · 20 Tím · 20 Vàng)');
  ok(await page.evaluate(() => OWN_COST.common < OWN_COST.epic && OWN_COST.epic < OWN_COST.legendary), `giá theo bậc: Thường < Tím < Vàng`);
  // đội gợi ý / đội trong trận chỉ gồm tướng đã mở → chợ trận chỉ ra tướng đã mở
  const dk = await page.evaluate(() => { const out = []; for (let i = 0; i < LEVELS.length; i++) out.push(suggestDeck(i, ui.save.owned)); return out; });
  ok(dk.every((d) => d.length === 6 && d.every((t) => s0.starter.includes(t))), 'đội gợi ý ở mọi bản đồ chỉ gồm tướng đã mở');
  ok(await page.evaluate(() => suggestDeck(0, null).length === 6 && openCommons(null).length === 20), 'không truyền owned (bot mô phỏng): mở hết như cũ');
  await page.evaluate(() => { ui.playLevel(5); });
  await page.waitForSelector('#prep:not([hidden])');
  const mk = await page.evaluate(() => { const seen = new Set(); for (let k = 0; k < 300; k++) { game.gold = 1e6; game.rerollMarket(); game.market.types.forEach((t) => seen.add(t)); } return { seen: [...seen], deck: game.deck }; });
  ok(mk.seen.every((t) => s0.starter.includes(t)), `chợ trận (300 lần đổi) chỉ ra tướng đã mở: ${mk.seen.length} loại`);
  // bảng chọn đội: tướng khoá mờ, có giá, chạm không chọn được
  await page.click('[data-act=deck-open]');
  for (const [w, h] of SIZES) { await page.setViewportSize({ width: w, height: h }); await page.evaluate(() => { document.querySelector('#toasts').innerHTML = ''; }); await page.waitForTimeout(250); await page.screenshot({ path: path.join(SHOT, `chon-doi-khoa-${w}x${h}.png`) }); }
  await page.setViewportSize({ width: 844, height: 390 });
  const lockN = await page.locator('#prep .dk-pick.lock').count();
  ok(lockN === 12, `chọn đội: ${lockN} tướng Thường khoá (mờ + giá)`);
  const lockedId = await page.getAttribute('#prep .dk-pick.lock', 'data-id');
  await page.click('#prep .dk-pick.lock');
  ok(await page.evaluate((t) => !(ui.deckSel || []).includes(t), lockedId), 'chạm tướng khoá: không vào đội, nhắc mở ở Anh Hùng');
  ok(await page.evaluate((t) => typeof game.restDeck === 'function' && (game.rest = { wave: 10 }, typeof game.restDeck([...game.deck.slice(0, 5), t]) === 'string'), lockedId), 'Nghỉ chân: không đổi được sang tướng chưa mở');
  await page.evaluate(() => { game.rest = null; ui.deckOpen = false; ui.showMenu(); });
  // màn Anh Hùng: Đã mở X/Y, tướng khoá có giá + nút mở
  await page.evaluate(() => { ui.save.kho = 5000; ui.showRoster('dotnuong'); });
  let ro = await page.evaluate(() => document.querySelector('#roster').innerText);
  ok(/Đã mở\s*8\/60/.test(ro), 'Anh Hùng: hiện "Đã mở 8/60"');
  ok(await page.locator('#roster .ro-card.lock').count() === 52 && await page.locator('#roster .ro-card.lock .ro-price').count() === 52, 'mọi tướng khoá hiện giá trên thẻ');
  ok(await page.locator('#roster [data-act=ro-buy]').count() === 1 && /Mở khoá/.test(ro) && /Nhiệm vụ ngày/.test(ro), 'tướng khoá: nút Mở khoá + cách kiếm Ngân khố + nhiệm vụ ngày');
  for (const [w, h] of SIZES) { await page.setViewportSize({ width: w, height: h }); await page.evaluate(() => { document.querySelector('#toasts').innerHTML = ''; }); await page.waitForTimeout(250); await page.screenshot({ path: path.join(SHOT, `anh-hung-khoa-${w}x${h}.png`) }); }
  await page.setViewportSize({ width: 844, height: 390 });
  await page.click('#roster [data-act=ro-buy]');
  const b1 = await page.evaluate(() => ({ kho: ui.save.kho, own: ui.save.owned.includes('dotnuong') }));
  ok(b1.own && b1.kho === 5000 - 300, 'mở tướng Thường: trừ 300 Ngân khố, vào danh sách đã mở');
  ok(await page.evaluate(() => suggestDeck(0, ui.save.owned).length === 6 && openCommons(ui.save.owned).includes('dotnuong')), 'tướng vừa mở chọn được vào đội');
  await page.evaluate(() => ui.showRoster('caong'));
  await page.click('#roster [data-act=ro-buy]');
  const b2 = await page.evaluate(() => ({ kho: ui.save.kho, own: ui.save.owned.includes('caong') }));
  ok(b2.own && b2.kho === 4700 - 900, 'mở tướng Tím: 900');
  await page.evaluate(() => { ui.save.kho = 100; ui.showRoster('giong'); });
  ok(await page.locator('#roster [data-act=ro-buy][disabled]').count() === 1 && /còn thiếu/.test(await page.evaluate(() => document.querySelector('#roster').innerText)), 'không đủ tiền: nút mờ, báo còn thiếu');
  ok(/Đã mở\s*10\/60/.test(await page.evaluate(() => document.querySelector('#roster').innerText)), 'đếm tiến độ: 10/60');
  for (const [w, h] of SIZES) { await page.setViewportSize({ width: w, height: h }); await page.evaluate(() => { document.querySelector('#toasts').innerHTML = ''; }); await page.waitForTimeout(250); await page.screenshot({ path: path.join(SHOT, `anh-hung-thieu-tien-${w}x${h}.png`) }); }
  await page.setViewportSize({ width: 844, height: 390 });

  // ================= thưởng cuối trận: theo đợt + kỷ lục mới + nhiệm vụ ngày
  await page.evaluate(() => { ui.save.kho = 0; ui.save.bestEndless = { 2: 5 }; delete ui.save.dailyWin; delete ui.save.quest; ui.playLevel(2); document.querySelector('[data-act=prep-go]').click(); });
  await page.evaluate(() => { game.running = true; for (let w = 1; w <= 20; w++) { game.wave = w; game.waveActive = true; game.spawnQueue = []; game.enemies = []; game.waveComplete(); if (game.rest) game.skipRest(); } game.wave = 21; game.bossesKilled = 2; });
  await page.waitForTimeout(300);
  const mid = await page.evaluate(() => ({ kho: ui.save.kho, run: game.khoRun }));
  ok(mid.run === 300, `mốc đợt 10 và 20: +150 mỗi mốc (${mid.run})`);
  await page.evaluate(() => { game.lives = 0; game.over = true; game.running = false; game.events.push({ type: 'defeat' }); });
  await page.waitForSelector('#result:not([hidden])');
  await page.waitForTimeout(1300);
  const end = await page.evaluate(() => ({ kho: ui.save.kho, q: ui.save.quest, best: ui.save.bestEndless[2] }));
  // đợt 21: theo đợt 6 × 20 = 120 · kỷ lục cũ 5 → +15 × 16 = 240 · trận đầu ngày qua đợt 10: 300 · chưa đủ 3 boss / 60 đợt
  ok(end.kho - mid.kho === 120 + 240 + 300, `cuối trận: +${end.kho - mid.kho} (120 theo đợt + 240 kỷ lục mới + 300 trận đầu ngày)`);
  ok(end.q.waves === 20 && end.q.boss === 2 && end.q.got.first && !end.q.got.boss, 'nhiệm vụ ngày: tính 20 đợt, 2 boss');
  const res = await page.evaluate(() => document.querySelector('#result').innerText);
  ok(/Kỷ lục mới \(\+15/.test(res) && /Nhiệm vụ ngày/.test(res) && /Ngân khố cả trận/.test(res) && /Anh Hùng · đã mở/.test(res), 'màn kết quả: dòng kỷ lục mới, tổng Ngân khố cả trận, nhiệm vụ ngày, gợi ý mở tướng');
  for (const [w, h] of SIZES) { await page.setViewportSize({ width: w, height: h }); await page.evaluate(() => { document.querySelector('#toasts').innerHTML = ''; }); await page.waitForTimeout(250); await page.screenshot({ path: path.join(SHOT, `ket-qua-${w}x${h}.png`) }); }
  await page.setViewportSize({ width: 844, height: 390 });
  // trận 2 trong ngày: hạ thêm boss → xong "Hạ 3 boss" (+200), không có kỷ lục (dưới kỷ lục)
  await page.evaluate(() => { ui.playLevel(2); document.querySelector('[data-act=prep-go]').click(); game.wave = 6; game.bossesKilled = 1; });
  const k3 = await page.evaluate(() => ui.save.kho);
  await page.evaluate(() => { game.over = true; game.events.push({ type: 'defeat' }); });
  await page.waitForSelector('#result:not([hidden])');
  await page.waitForTimeout(400);
  const e2 = await page.evaluate((k) => ({ d: ui.save.kho - k, q: ui.save.quest }), k3);
  ok(e2.d === 30 + 200 && e2.q.got.boss, `trận 2: +${e2.d} (30 theo đợt + 200 nhiệm vụ Hạ 3 boss)`);
  // đủ tiền → nút mở ngay trên màn kết quả đưa tới Anh Hùng
  await page.evaluate(() => { ui.save.kho = 9999; game.over = true; ui.finishLevel(); });
  await page.waitForTimeout(1300);
  ok(await page.locator('#result [data-act=res-heroes]').count() === 1, 'đủ Ngân khố: màn kết quả có nút mở tướng');
  await page.click('#result [data-act=res-heroes]');
  await page.waitForSelector('#roster:not([hidden])');
  ok(await page.locator('#roster [data-act=ro-buy]').count() === 1, 'bấm → vào Anh Hùng đúng tướng chưa mở');
  ok(errors.length === 0, 'không lỗi JS' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();

  // ================= bản lưu cũ (trước v182): giữ đủ 20 tướng Thường + tướng Tím / Vàng đã mua, không mất Ngân khố
  ({ browser, page, errors } = await open({ kho: 777, owned: ['caong', 'giong'], deck: ['chodo', 'haisen', 'nguphu', 'lactuong', 'lucsi', 'xathu'], storySeen: true, settings: { skipStory: true }, savedAt: 1 }));
  const o = await page.evaluate(() => ({ owned: ui.save.owned, kho: ui.save.kho, v: ui.save.heroOpenV }));
  ok(o.v === 1 && BASIC_OK(o.owned) && o.owned.includes('caong') && o.owned.includes('giong') && o.kho === 777, `bản lưu cũ: ${o.owned.length} tướng đã mở (20 Thường + 2 đã mua), Ngân khố giữ nguyên`);
  function BASIC_OK(list) { return ['lactuong', 'chodo', 'haisen', 'ongthoi', 'tre', 'chantrau'].every((t) => list.includes(t)) && list.length === 22; }
  await page.evaluate(() => { ui.playLevel(0); });
  ok(await page.evaluate(() => game.deck.join() === 'chodo,haisen,nguphu,lactuong,lucsi,xathu'), 'bản lưu cũ: đội đã chọn giữ nguyên');
  // đám mây: bản cũ trên mây (chưa có heroOpenV) nạp về → cũng được giữ đủ
  await page.evaluate(() => ui.applyCloudSave({ kho: 50, owned: ['thachsanh'], savedAt: 5 }, 'u1'));
  const c = await page.evaluate(() => ({ owned: ui.save.owned, v: ui.save.heroOpenV, stored: JSON.parse(localStorage.getItem('nuicao.v1')).heroOpenV }));
  ok(c.v === 1 && c.stored === 1 && c.owned.length === 21 && c.owned.includes('thachsanh'), 'bản cũ từ đám mây: chuyển đổi một lần, giữ 20 Thường + tướng đã mua');
  await page.evaluate(() => ui.applyCloudSave(null, 'u2'));
  ok(await page.evaluate(() => ui.save.owned.length === STARTER_HEROES.length), 'tài khoản mới trên máy đã có tài khoản khác: chỉ tướng khởi đầu');
  await page.reload(); await page.waitForTimeout(700);
  ok(await page.evaluate(() => ui.save.owned.length === STARTER_HEROES.length), 'tải lại: không chuyển đổi lần hai');
  ok(errors.length === 0, 'không lỗi JS' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  console.log('ngan-kho: OK');
})().catch((e) => { console.error(e); process.exit(1); });
