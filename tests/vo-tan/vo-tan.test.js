// v166: bỏ Phó bản — chỉ còn Vô tận (chơi đơn) + Cùng Giữ Thành (chơi nhóm, cũng vô tận)
// Chạy: node tests/vo-tan/vo-tan.test.js
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const ROOT = path.resolve(__dirname, '../..');
const URL = 'file://' + path.join(ROOT, 'index.html');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const ok = (cond, msg) => { if (!cond) throw new Error('FAIL: ' + msg); console.log('  ✓ ' + msg); };
const NO_AI = /(^|[^\p{L}])(Ải|ẢI)([^\p{L}]|$)|Phó [Bb]ản|PHÓ BẢN|ĐIỀU KIỆN SAO/u;

async function open(save, w = 844, h = 390) {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::|favicon|firebase|gstatic/i.test(m.text())) errors.push(m.text()); });
  await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
  await page.addInitScript((s) => { if (!sessionStorage.getItem('seeded')) { if (s) localStorage.setItem('nuicao.v1', JSON.stringify(s)); sessionStorage.setItem('seeded', '1'); } }, save);
  // pixel-mac-dinh: ghi lại mọi thông báo đã hiện (thông báo sống 2,6 giây; tải ảnh pixel làm goto lâu hơn)
  await page.addInitScript(() => { window.__T = []; new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => n.classList && n.classList.contains('toast') && window.__T.push(n.textContent)))).observe(document, { childList: true, subtree: true }); });
  await page.goto(URL);
  await page.waitForTimeout(900);
  return { browser, page, errors };
}
const txt = (page, sel) => page.evaluate((s) => document.querySelector(s).innerText, sel);

(async () => {
  // ================= người chơi mới (bản lưu trống)
  let { browser, page, errors } = await open(null);
  const menu = await txt(page, '#menu');
  ok(!NO_AI.test(menu) && !/chọn ải/.test(menu), 'menu: không còn chữ Ải / Phó bản');
  ok(await page.evaluate(() => ui.save.campConv === 1 && !ui.save.campGift && (ui.save.kho || 0) === 0), 'bản lưu mới: không có quà quy đổi');
  await page.click('#btn-continue');
  await page.waitForSelector('#modes:not([hidden])');
  const modes = await txt(page, '#modes');
  ok(await page.locator('#modes .md-card').count() === 2 && /Vô Tận/.test(modes) && /Cùng Giữ Thành/.test(modes) && !NO_AI.test(modes), 'Chọn chế độ: chỉ Vô Tận + Cùng Giữ Thành');
  await page.screenshot({ path: path.join(SHOT, 'chon-che-do-844x390.png') });
  await page.click('#modes .md-card.endl');
  // claude/duong-di-moi: Vô tận không chọn bản đồ — vào màn đầu luôn (màn chọn bản đồ còn mở được bằng ui.showCampaign)
  await page.waitForSelector('#prep:not([hidden])');
  ok(await page.evaluate(() => $('#campaign').hidden && game.level === 0), 'chọn Vô Tận → vào màn đầu luôn (không chọn bản đồ)');
  await page.evaluate(() => { game.started = false; ui.showCampaign(0); });
  await page.waitForSelector('#campaign:not([hidden])');
  const nTabs = await page.locator('#campaign .cp-tab').count();
  ok(nTabs === (await page.evaluate(() => CHAPTERS.length)), `chọn bản đồ: ${nTabs} nhóm truyền thuyết`);
  let nodes = 0, locked = 0, bad = '';
  for (let k = 0; k < nTabs; k++) {
    await page.click(`#campaign .cp-tab[data-i="${k}"]`);
    nodes += await page.locator('#campaign .cp-node').count();
    locked += await page.locator('#campaign .cp-node.lock, #campaign .cp-node[disabled]').count();
    const t = await txt(page, '#campaign');
    if (NO_AI.test(t)) bad += ` [nhóm ${k}]`;
    if (k === 0) await page.screenshot({ path: path.join(SHOT, 'chon-ban-do-844x390.png') });
    if (k === 1) await page.screenshot({ path: path.join(SHOT, 'chon-ban-do-thach-sanh-844x390.png') });
  }
  ok(nodes === 17 && locked === 0, `đủ 17 bản đồ, mở hết (khoá: ${locked})`);
  ok(!bad, 'màn chọn bản đồ không còn chữ Ải / điều kiện sao' + bad);
  const side = await txt(page, '#campaign .cp-side');
  ok(/Kỷ lục bản đồ này/.test(side) && /TƯỚNG KHẮC CHẾ/i.test(side) && /Quân/.test(side) && /boss/.test(side), 'mỗi bản đồ: kỷ lục, quân / boss, tướng khắc chế');
  ok(await page.locator('#campaign [data-act=diff]').count() === 2, 'giữ Thường / Khó');
  // vào vô tận ở mọi bản đồ
  for (let i = 0; i < 17; i++) {
    await page.evaluate((i) => ui.playLevel(i, false), i);
    await page.waitForSelector('#prep:not([hidden])');
    const r = await page.evaluate((i) => ({ e: game.endless, lv: game.level, chip: document.querySelector('#prep .scr-head .chip.dark').innerText, name: LEVELS[i].name }), i);
    if (!(r.e && r.lv === i && r.chip.includes('Vô tận') && r.chip.includes(r.name))) throw new Error('FAIL: bản đồ ' + i + ' ' + JSON.stringify(r));
    await page.click('[data-act=prep-go]');
  }
  ok(true, 'người mới vào được vô tận ở cả 17 bản đồ (ui.playLevel(i, false) cũ vẫn chạy)');

  // ---- trận ở bản đồ 3 (Rừng Lim): mốc đợt 10 + boss → Ngân khố giữa trận; hết mạng → màn kết quả theo bản đồ
  await page.evaluate(() => { ui.playLevel(2); document.querySelector('[data-act=prep-go]').click(); });
  const k0 = await page.evaluate(() => ui.save.kho || 0);
  await page.evaluate(() => { game.running = true; for (let w = 1; w <= 12; w++) { game.wave = w; game.waveActive = true; game.spawnQueue = []; game.enemies = []; game.waveComplete(); } });
  await page.waitForTimeout(300);
  const k1 = await page.evaluate(() => ({ kho: ui.save.kho, run: game.khoRun }));
  ok(k1.kho - k0 === 150 && k1.run === 150, `mốc đợt 10: +150 Ngân khố giữa trận (${k0} → ${k1.kho})`);
  ok(await page.evaluate(() => !game.won && game.endless), 'qua đợt cuối cũ của bản đồ vẫn không thắng ải');
  // hết mạng
  await page.evaluate(() => { game.lives = 0; game.over = true; game.running = false; game.events.push({ type: 'defeat' }); });
  await page.waitForSelector('#result:not([hidden])');
  await page.waitForTimeout(1300);
  const res = await txt(page, '#result');
  const lv2 = await page.evaluate(() => LEVELS[2].name);
  ok(res.includes(lv2) && /Giữ được tới đợt/.test(res) && /Kỷ lục mới/.test(res) && !NO_AI.test(res) && !/★ ?Kỷ lục mới[\s\S]*Ải tiếp/.test(res), 'thua → màn kết quả theo bản đồ, có kỷ lục mới, không chữ Ải');
  await page.screenshot({ path: path.join(SHOT, 'ket-qua-844x390.png') });
  const k2 = await page.evaluate(() => ({ kho: ui.save.kho, best: ui.save.bestEndless[2], daily: ui.save.dailyWin, run: ui.save.run }));
  // đợt 12: cuối trận 6 × 11 = 66 + kỷ lục mới (v182) 15 × 11 = 165 + trận đầu ngày qua đợt 10: 300
  ok(k2.kho - k1.kho === 66 + 165 + 300 && k2.best === 12 && k2.daily && !k2.run, `thưởng cuối trận đúng: +${k2.kho - k1.kho} (66 theo đợt + 165 kỷ lục mới + 300 trận đầu ngày), kỷ lục 12`);
  ok(await page.locator('#result [data-act=next-level], #result [data-act=endless]').count() === 0, 'không còn nút Ải tiếp theo / Chơi vô tận');
  ok(await page.locator('#result [data-act=to-map]').count() === 0, 'kết quả: bỏ nút Bản đồ (vô tận không chọn bản đồ)');
  await page.evaluate(() => ui.showCampaign(2));
  await page.waitForSelector('#campaign:not([hidden])');
  ok((await txt(page, '#campaign .cp-side')).includes('đợt 12'), 'Bản đồ: hiện kỷ lục vừa lập');
  // trận thứ hai trong ngày: không thưởng ngày nữa
  await page.evaluate(() => { ui.playLevel(0); document.querySelector('[data-act=prep-go]').click(); game.wave = 11; });
  const k3 = await page.evaluate(() => ui.save.kho);
  await page.evaluate(() => { game.over = true; game.events.push({ type: 'defeat' }); });
  await page.waitForSelector('#result:not([hidden])');
  ok(await page.evaluate((k) => ui.save.kho - k === 60 + 150, k3), 'trận thứ hai trong ngày: theo đợt (60) + kỷ lục mới bản đồ này (150), không thưởng trận đầu ngày nữa');
  await page.click('#result [data-act=to-menu]').catch(() => {});
  await page.waitForTimeout(1300);
  await page.evaluate(() => ui.showMenu());

  // ---- tiếp tục trận dở sau khi tải lại trang
  await page.evaluate(() => { ui.playLevel(4); document.querySelector('[data-act=prep-go]').click(); game.running = true; for (let w = 1; w <= 3; w++) { game.wave = w; game.waveActive = true; game.waveComplete(); } ui.saveRun(); });
  await page.reload(); await page.waitForTimeout(900);
  const lbl = await txt(page, '#continue-label');
  const lv4 = await page.evaluate(() => LEVELS[4].name);
  ok(lbl.includes(lv4) && /Đợt 3/.test(lbl) && !NO_AI.test(lbl), 'nút Tiếp tục: ' + lbl);
  ok(!(await page.locator('#btn-newgame').isHidden()) && /Chơi mới/.test(await txt(page, '#btn-newgame')), 'có nút Chơi mới');
  await page.click('#btn-continue'); await page.waitForTimeout(300);
  ok(await page.evaluate(() => game.started && game.endless && game.level === 4 && game.wave === 3), 'Tiếp tục: trận vô tận dở chơi tiếp đúng bản đồ / đợt');
  // tạm dừng, bảng xếp hạng, cài đặt
  await page.evaluate(() => ui.showSettings(true));
  const set = await txt(page, '#settings');
  ok(!NO_AI.test(set) && set.includes(lv4) && !/cốt truyện/.test(set), 'Tạm dừng: không chữ Ải, bỏ tuỳ chọn cốt truyện');
  await page.evaluate(() => { document.querySelector('#settings').hidden = true; ui.showRanks('endless'); });
  ok(await page.locator('#ranks .cp-tab').count() === 1 && !NO_AI.test(await txt(page, '#ranks')), 'Bảng xếp hạng: chỉ còn Vô tận');
  await page.evaluate(() => { document.querySelector('#ranks').hidden = true; ui.openScreen('codex', { top: true }); });
  await page.waitForTimeout(200);
  ok(!NO_AI.test(await txt(page, '#screen')), 'Bách khoa: không chữ Ải');
  await page.evaluate(() => { ui.screen = { kind: 'codex', tab: 'boss' }; ui.renderScreen(true); });
  ok(!NO_AI.test(await txt(page, '#screen')), 'Bách khoa (Boss): không chữ Ải');
  ok(errors.length === 0, 'người mới: không lỗi trang ' + errors.join(' | '));
  await browser.close();

  // ================= bản lưu cũ (đã có sao / ải đã mở / trận Phó bản dở)
  const stars = [3, 3, 2, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  ({ browser, page, errors } = await open({ stars, unlocked: 6, best: { 0: 25, 1: 31, 4: 18 }, bestEndless: { 1: 40 }, storySeen: true, chSeen: { thachsanh: true }, kho: 100, last: 3, settings: { skipStory: true } }));
  const o = await page.evaluate(() => ({ kho: ui.save.kho, conv: ui.save.campConv, be: ui.save.bestEndless, stars: ui.save.stars, unlocked: ui.save.unlocked }));
  ok(o.kho === 100 + 12 * 40 && o.conv === 1, `quy đổi một lần: 12 sao → +480 Ngân khố (${o.kho})`);
  ok(o.be[0] === 25 && o.be[1] === 40 && o.be[4] === 18, 'đợt xa nhất Phó bản cũ tính vào kỷ lục vô tận (giữ kỷ lục cao hơn)');
  ok(JSON.stringify(o.stars) === JSON.stringify(stars) && o.unlocked === 6, 'dữ liệu sao / ải đã mở vẫn giữ nguyên (không xoá)');
  ok((await page.evaluate(() => window.__T)).some((t) => /Phó bản đã gộp vào/.test(t)), 'báo một lần: Phó bản đã gộp vào Vô tận');
  // trận Phó bản dở trong bản lưu cũ → chơi tiếp thành vô tận
  await page.evaluate(() => { ui.startLevel(1); document.querySelector('[data-act=prep-go]').click(); const r = game.snapshot(); r.endless = false; r.wave = 5; ui.save.run = r; game.started = false; writeSave(ui.save); });
  await page.reload(); await page.waitForTimeout(900);
  ok(await page.evaluate(() => ui.save.kho === 580), 'tải lại: không quy đổi lần hai');
  ok(!(await txt(page, '#toasts')).includes('gộp vào'), 'tải lại: không báo lại');
  await page.click('#btn-continue'); await page.waitForTimeout(300);
  ok(await page.evaluate(() => game.endless && game.level === 1 && game.wave === 5), 'trận Phó bản dở → chơi tiếp thành vô tận');
  await page.evaluate(() => { game.wave = game.levelWaves; game.waveActive = true; game.spawnQueue = []; game.enemies = []; game.waveComplete(); });
  ok(await page.evaluate(() => !game.won && !game.over), 'qua đợt cuối cũ không bị xử thắng');
  await page.evaluate(() => ui.showMenu());
  await page.screenshot({ path: path.join(SHOT, 'menu-ban-luu-cu-844x390.png') });
  ok(!NO_AI.test(await txt(page, '#menu')), 'menu bản lưu cũ: không chữ Ải');
  ok(errors.length === 0, 'bản lưu cũ: không lỗi trang ' + errors.join(' | '));
  await browser.close();

  // ================= màn hẹp (điện thoại) — chụp ảnh
  ({ browser, page, errors } = await open(null, 740, 360));
  await page.evaluate(() => ui.showModes()); await page.screenshot({ path: path.join(SHOT, 'chon-che-do-740x360.png') });
  await page.evaluate(() => ui.showCampaign(8)); await page.screenshot({ path: path.join(SHOT, 'chon-ban-do-740x360.png') });
  ok(errors.length === 0, 'màn hẹp: không lỗi trang');
  await browser.close();
  console.log('\nTẤT CẢ ĐẠT');
})().catch((e) => { console.error(e); process.exit(1); });
