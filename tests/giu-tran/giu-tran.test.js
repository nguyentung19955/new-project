// claude/giu-tran-dang-choi: rời trận chưa thua (≡ Dừng chơi, tải lại trang giữa / sau đợt, bảng Sính lễ đang mở) rồi vào lại
// phải có "Tiếp tục · <bản đồ> · Đợt N" và vào đúng màn / đợt / tướng / vàng / mạng — không bị về màn 1 đợt 1.
// Chạy: node tests/giu-tran/giu-tran.test.js
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const ROOT = path.resolve(__dirname, '../..');
const URL = 'file://' + path.join(ROOT, 'index.html');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const ok = (cond, msg) => { if (!cond) throw new Error('FAIL: ' + msg); console.log('  ✓ ' + msg); };
const W = 16;   // đợt 16 = màn 2 (boss đợt 10 Bến Sông Đà sang màn mới)

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
  await page.goto(URL);
  await page.waitForTimeout(900);
  const label = () => page.evaluate(() => $('#continue-label').textContent);
  const st = () => page.evaluate(() => ({ wave: game.wave, k: game.stage && game.stage.k, map: MAP_ID, gold: game.gold, lives: game.lives, n: game.heroes.filter(Boolean).length,
    t: game.heroes.filter(Boolean).map((h) => h.type).join(','), wa: game.waveActive, started: game.started, ingame: $('#menu').hidden }));
  const lab = (t, w) => { const m = /^Tiếp tục · Đợt (\d+)/.exec(t); return !!m && +m[1] === w && t.endsWith(' · ' + mapName); };
  let mapName = '';
  const quit = async () => { await page.click('#btn-menu'); ok(/Rời trận/.test(await page.evaluate(() => $('#quit-label').textContent)), 'nút ☰ → Rời trận'); await page.click('#drawer [data-act="quit-run"]'); await page.waitForSelector('#menu:not([hidden])', { timeout: 2000 }); };   // bấm 1 lần là rời
  const reload = async () => { await page.reload(); await page.waitForTimeout(900); };

  // vào trận vô tận mới, tua tới đợt 16 (màn 2), có tướng, vàng, mạng riêng
  await page.click('#btn-continue'); await page.click('#modes .md-card.endl');
  await page.waitForSelector('#prep:not([hidden])');
  await page.evaluate(() => ui.action({ act: 'prep-go' }));
  mapName = await page.evaluate((W) => {
    game.wave = W; game.evWave = W; game.setStage(endlessStageAt(W, 0), true);
    const ts = Object.keys(HEROES); game.spawnHero(0, ts[0], {}); game.spawnHero(3, ts[1], {});
    game.gold = 777; game.lives = 13; game.nextWave = buildWave(W + 1, 0, game.stLv());
    game.events.push({ type: 'checkpoint' }); ui.handleEvents();
    return LEVELS[game.stage.lv].name;
  }, W);
  const s0 = await st();
  ok(s0.k === 1 && s0.wave === W, `tới đợt ${W} màn 2 (${mapName}, ${s0.map})`);

  // 1) ≡ Dừng chơi giữa hai đợt (sau khi mua thêm: vàng 888)
  await page.evaluate(() => { game.gold = 888; });
  await quit();
  ok(await page.evaluate(() => !!ui.save.run && ui.save.run.wave === 16 && ui.save.run.gold === 888), 'Dừng chơi giữa hai đợt: bản lưu GIỮ trận (vàng mới nhất)');
  ok(lab(await label(), W), 'menu: ' + await label());
  await page.screenshot({ path: path.join(SHOT, 'tiep-tuc-844x390.png') });
  await page.click('#btn-continue');
  let s = await st();
  ok(s.ingame && s.wave === W && s.k === 1 && s.gold === 888 && s.lives === 13 && s.t === s0.t, 'Tiếp tục (chưa tải lại): đúng đợt / màn / vàng / mạng / tướng');

  // 2) tải lại trang sau khi Dừng chơi → Tiếp tục
  await quit(); await reload();
  ok(lab(await label(), W), 'tải lại: vẫn ' + await label());
  await page.click('#btn-continue');
  s = await st();
  ok(s.ingame && s.wave === W && s.k === 1 && s.map === s0.map && s.gold === 888 && s.lives === 13 && s.t === s0.t, 'tải lại → Tiếp tục: đúng đợt / màn / bản đồ / vàng / mạng / tướng');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(SHOT, 'vao-lai-844x390.png') });

  // 3) Dừng chơi GIỮA đợt 17: Tiếp tục ngay (còn trong bộ nhớ) quay lại đúng giữa đợt; tải lại → chơi lại từ đầu đợt 17
  await page.evaluate(() => { game.startWave(); game.running = true; });
  await page.waitForTimeout(600);
  await page.evaluate(() => { game.gold = 950; });
  await quit();
  ok(await page.evaluate(() => ui.save.run.wave === 16 && !game.running), 'giữa đợt: bản lưu đầu đợt giữ nguyên, trận tạm dừng');
  ok(lab(await label(), W + 1), 'menu giữa đợt: ' + await label());
  await page.click('#btn-continue');
  s = await st();
  ok(s.ingame && s.wave === W + 1 && s.wa && s.gold === 950 && await page.evaluate(() => game.running), 'giữa đợt → Tiếp tục: đúng khoảnh khắc, trận chạy tiếp');
  await reload();   // đóng tab / tải lại giữa đợt (không bấm Dừng chơi)
  ok(lab(await label(), W), 'tải lại giữa đợt: ' + await label());
  await page.click('#btn-continue');
  s = await st();
  ok(s.ingame && s.wave === W && s.k === 1 && !s.wa && s.lives === 13 && s.t === s0.t, 'tải lại giữa đợt → Tiếp tục từ đầu đợt 17 (màn 2)');

  // 3b) Back của trình duyệt / vuốt Back trong trận = Rời trận ngay (lưu + về menu, không hỏi)
  await page.evaluate(() => { game.running = true; history.back(); });
  await page.waitForSelector('#menu:not([hidden])', { timeout: 3000 });
  ok(await page.evaluate(() => !!ui.save.run && ui.save.run.wave === 16 && !document.getElementById('leave-ask')) && lab(await label(), W), 'Back trong trận → về menu, giữ bản lưu, không hộp hỏi: ' + await label());
  await page.click('#btn-continue');
  ok(await page.evaluate(() => { const r = game.wave >= 16 && game.wave <= 17 && game.stage.k === 1 && game.running; game.running = false; game.wave = 16; game.waveActive = false; game.enemies = []; game.spawnQueue = []; return r; }), 'Tiếp tục sau Back: đúng đợt / màn, trận chạy tiếp');
  // 4) bảng Sính lễ đang mở (đợt boss đã xong) → Dừng chơi, tải lại → bảng mở lại
  await page.evaluate(() => { game.events.push({ type: 'reward', boss: 'thuongluong', options: game.bossRewards('thuongluong'), id: 1 }); ui.handleEvents(); });
  ok(await page.evaluate(() => !$('#reward').hidden), 'bảng Sính lễ mở');
  // đợt boss xong khi bảng còn mở → checkpoint lưu cả bảng; bảng che nút ≡ nên người chơi rời bằng cách đóng app / tải lại
  await page.evaluate(() => { game.events.push({ type: 'checkpoint' }); ui.handleEvents(); });
  await reload();
  await page.click('#btn-continue');
  await page.waitForFunction(() => !$('#reward').hidden, null, { timeout: 5000 }).catch(() => {});
  ok(await page.evaluate(() => !$('#reward').hidden && game.wave === 16 && !game.running), 'tải lại → Tiếp tục: bảng Sính lễ mở lại, không mất thưởng boss');
  await page.waitForTimeout(500);
  await page.evaluate(() => ui.pickReward(0));
  ok(await page.evaluate(() => $('#reward').hidden && game.wave === 16), 'chọn sính lễ xong chơi tiếp');

  // 5) ẩn app (visibilitychange) rồi tải lại
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await reload();
  ok(lab(await label(), W), 'ẩn app + tải lại: ' + await label());

  // 6) Chơi mới đè lên trận dở → trận cũ tính bỏ trận (Ngân khố 4 × đợt đã qua), trận mới từ đợt 0
  const kho0 = await page.evaluate(() => ui.save.kho || 0);
  await page.click('#btn-newgame'); await page.click('#modes .md-card.endl');
  await page.waitForSelector('#prep:not([hidden])');
  ok(await page.evaluate((k) => ui.save.kho - k === PREP.losePerWave * 15 && ui.save.run.wave === 0 && game.wave === 0, kho0), 'Chơi mới: trận cũ trả Ngân khố như bỏ trận, trận mới từ đầu');

  ok(!errors.length, 'không lỗi JS ' + errors.join(' | '));
  await browser.close();
  console.log('XONG giu-tran');
})().catch((e) => { console.error(e); process.exit(1); });
