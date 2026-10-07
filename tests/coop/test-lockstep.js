'use strict';
// Hai trang chơi nhóm qua máy chủ trung gian:
//  1) tạo phòng / vào phòng / bắt đầu bằng giao diện thật
//  2) cùng seed + cùng lệnh → hash trạng thái hai trang giống nhau sau nhiều đợt
//  3) làm lệch dữ liệu một trang → phát hiện, đồng bộ lại bằng ảnh chụp, hết lệch
//  4) mất mạng: đồng đội thấy thông báo, chơi một mình cả hai nửa; có mạng lại thì vào lại trận
//  5) tải lại trang (vào lại phòng) → nhận ảnh chụp, chơi tiếp đồng bộ
const { launch, openGame, RelayServer, sleep, check } = require('./harness');

const FAST = { timeScale: 3, dropAfter: 4, authLost: 3, pingEvery: 1 };

async function setCfg(page) { await page.evaluate((c) => Object.assign(COOP_CFG, c), FAST); }
const click = (page, sel) => page.evaluate((s) => { const el = document.querySelector(s); if (!el) throw new Error('không thấy ' + s); el.click(); }, sel);

// "người chơi máy": mỗi 0,3 giây chọn một việc trên nửa của mình (triệu hồi, lên cấp, ghép, mặc đồ…)
async function startBot(page, seed) {
  await page.evaluate((sd) => {
    let k = sd;
    const rnd = () => { k = (k * 1103515245 + 12345) & 0x7fffffff; return k / 0x7fffffff; };
    clearInterval(window.__bot);
    window.__bot = setInterval(() => {
      if (!COOP.on || COOP.waitSnap || !game.co) return;
      const g = game, me = COOP.me, co = g.co;
      if (!co.started) { if (me === 0) COOP.issue('start'); return; }
      if (window.__botBusy > 0) { window.__botBusy--; return; }
      const mine = g.heroes.filter((h) => h && co.canAct(me, h.slot));
      const r = rnd();
      if (g.offer) ui.pickOffer(Math.floor(rnd() * g.offer.types.length));
      else if (mine.length < 5 && g.canSummon() === true) ui.summonRand();
      else if (r < 0.35 && mine.length) { const h = mine[Math.floor(rnd() * mine.length)]; if (g.gold > g.levelCost(h)) ui.doLevelUp(h); }
      else if (r < 0.5) ui.action({ act: 'auto-merge' });
      else if (r < 0.6) ui.action({ act: 'auto-eq-all' });
      else if (r < 0.7 && mine.length) { const h = mine[Math.floor(rnd() * mine.length)]; ui.sel = h.slot; ui.action({ act: 'sk-up', i: String(Math.floor(rnd() * 4)) }); }
      else if (r < 0.75 && g.gold > 150) ui.action({ act: 'coop-gift', v: '50' });
      else if (r < 0.8 && mine.length > 1) { const a = mine[0], free = g.freeSlots(); if (free.length) ui.dropOn(a.slot, free[0]); }
      else if (r < 0.83) ui.action({ act: 'auto-up-gear' });
      window.__botBusy = 1;
      // sính lễ boss: ai thấy trước chọn
      if (!document.querySelector('#reward').hidden) ui.pickReward(Math.floor(rnd() * 3));
    }, 300);
  }, seed);
}
const stopBot = (page) => page.evaluate(() => clearInterval(window.__bot));
const state = (page) => page.evaluate(() => ({
  on: COOP.on, role: COOP.role, tick: COOP.tick, wave: game.wave, lives: game.lives, over: game.over, won: game.won,
  stats: { ...COOP.stats }, alone: game.co ? game.co.alone : null, wait: COOP.waitSnap,
  hashes: [...COOP.hashes.entries()], gold: game.co ? game.co.pl.map((p) => Math.round(p.gold)) : null,
  heroes: game.heroes.filter(Boolean).length, speed: game.co ? game.co.speed : 0,
}));
// so hash ở các bước cả hai trang cùng ghi
function compareHashes(a, b, after = 0) {
  const mb = new Map(b.hashes);
  let same = 0, diff = 0;
  for (const [t, h] of a.hashes) if (t > after && mb.has(t)) { if (mb.get(t) === h) same++; else diff++; }
  return { same, diff };
}
async function waitFor(fn, ms, what) {
  const t0 = Date.now();
  for (;;) {
    const v = await fn();
    if (v) return v;
    if (Date.now() - t0 > ms) throw new Error('Hết thời gian chờ: ' + what);
    await sleep(250);
  }
}

async function run(browser) {
  console.log('• Chơi nhóm 2 trang (lockstep qua máy chủ trung gian)');
  const errors = [];
  const relay = new RelayServer();
  let A = await openGame(browser, { relay, uid: 'chuPhong', errors });
  let B = await openGame(browser, { relay, uid: 'khach', errors });
  for (const p of [A, B]) await setCfg(p);

  // ---- phòng chờ bằng giao diện
  await A.evaluate(() => ui.showModes());
  await click(A, '.md-card.coop');
  await click(A, '[data-act=coop-create]');
  const code = await waitFor(() => A.evaluate(() => ui.lobby && ui.lobby.code), 5000, 'tạo phòng');
  check(/^[A-Z0-9]{6}$/.test(code), `tạo phòng, mã ${code}`);
  await B.evaluate(() => ui.showCoop());
  await B.fill('#co-code', code.toLowerCase());
  await click(B, '[data-act=coop-join]');
  await waitFor(() => A.evaluate(() => ui.lobby && ui.lobby.room && ui.lobby.room.members.length === 2), 5000, 'khách vào phòng');
  const lobbyTxt = await A.evaluate(() => document.querySelector('#coop').innerText);
  check(/Chủ phòng/.test(lobbyTxt) && /Khách/.test(lobbyTxt), 'màn chờ hiện 2 người');
  await click(A, '[data-act=coop-lv][data-i="0"]');
  await click(A, '[data-act=coop-start]');
  await waitFor(async () => (await A.evaluate(() => COOP.on)) && (await B.evaluate(() => COOP.on)), 5000, 'vào trận');
  const own = await A.evaluate(() => [game.co.own.filter((x) => x === 0).length, game.co.own.filter((x) => x === 1).length]);
  check(Math.abs(own[0] - own[1]) <= 1, `chia ô công bằng: ${own[0]} / ${own[1]}`);
  await waitFor(async () => (await B.evaluate(() => COOP.hashes.has(60))), 10000, 'mốc hash đầu tiên');
  const same0 = await Promise.all([A, B].map((p) => p.evaluate(() => COOP.hashes.get(60))));
  check(same0[0] === same0[1], 'cùng seed → trạng thái ở bước 60 giống hệt (' + same0.join(' / ') + ')');
  const denied = await B.evaluate(() => { const s = game.co.own.findIndex((o) => o === 0); return COOP.issue('raiseSpot', [s]); });
  check(/đồng đội/.test(String(denied)), 'không thao tác được ô của đồng đội');

  // ---- chạy nhiều đợt với 2 "người chơi máy"
  await A.evaluate(() => COOP.issue('speed', [3]));
  await startBot(A, 7); await startBot(B, 99);
  await waitFor(async () => { const s = await state(B); return s.wave >= 7 || s.over; }, 240000, 'chơi tới đợt 7');
  let a = await state(A), b = await state(B);
  let cmp = compareHashes(a, b);
  console.log(`    đợt ${b.wave}, bước ${a.tick}/${b.tick}, tướng ${a.heroes}, vàng ${a.gold}, mạng ${a.lives}`);
  check(a.speed === 3 && b.speed === 3, 'đổi tốc độ x3 đồng bộ cả hai máy');
  check(cmp.same >= 20 && cmp.diff === 0, `hash giống nhau ở ${cmp.same} mốc chung, lệch ${cmp.diff}`);
  check(b.stats.ok >= 20 && b.stats.bad === 0 && b.stats.resync === 0, `máy khách so ${b.stats.ok} hash với chủ phòng, không lệch`);
  check(a.heroes >= 4 && a.gold[0] >= 0 && a.gold[1] >= 0, 'cả hai người đều có tướng và ví riêng');

  // ---- làm lệch một trang → phát hiện + tự sửa
  await B.evaluate(() => { game.co.pl[0].gold += 1234; game.lives += 1; });
  await waitFor(async () => (await state(B)).stats.resync >= 1, 30000, 'đồng bộ lại sau khi lệch');
  b = await state(B);
  check(b.stats.bad >= 1, `phát hiện lệch (${b.stats.bad} lần) và đồng bộ lại (${b.stats.resync} lần)`);
  const T = b.tick;
  await sleep(6000);
  a = await state(A); b = await state(B);
  cmp = compareHashes(a, b, T);
  check(cmp.same >= 5 && cmp.diff === 0, `sau đồng bộ: hash giống nhau ở ${cmp.same} mốc mới`);

  // ---- mất mạng giữa chừng
  if (!a.over && !a.won) {
    await stopBot(B);
    relay.setOffline('khach');
    await waitFor(async () => (await state(A)).alone === 0, 20000, 'chủ phòng thấy đồng đội rời');
    const tA = await A.evaluate(() => [...document.querySelectorAll('#toasts .toast')].map((e) => e.textContent).join(' | '));
    check(/mất kết nối/i.test(tA) || /rời/i.test(tA), 'chủ phòng thấy thông báo mất kết nối');
    const solo = await A.evaluate(() => { const s = game.co.own.findIndex((o, i) => o === 1); return game.co.canAct(COOP.me, s); });
    check(solo, 'chơi tiếp một mình, điều khiển được cả nửa của đồng đội');
    await sleep(3000);
    relay.setOnline('khach');
    await waitFor(async () => { const s = await state(B); return s.on && !s.wait && s.alone === -1 && s.stats.resync >= 2; }, 30000, 'khách vào lại trận sau khi có mạng');
    await startBot(B, 5);
    const T2 = (await state(B)).tick;
    await sleep(7000);
    a = await state(A); b = await state(B);
    cmp = compareHashes(a, b, T2);
    check(a.alone === -1 && cmp.same >= 3 && cmp.diff === 0, `có mạng lại: hai nửa tách lại, hash giống ở ${cmp.same} mốc`);
  }

  // ---- chủ phòng (người điều phối) mất mạng → khách giành quyền điều phối, giữ cả hai nửa; chủ phòng có mạng lại thì vào lại
  a = await state(A);
  if (!a.over && !a.won) {
    const size = await A.evaluate(() => COOP.serialize().length);
    console.log(`    ảnh chụp trạng thái: ${(size / 1024).toFixed(0)} KB`);
    check(size < 900000, 'ảnh chụp nằm trong giới hạn 900 KB của luật Firestore');
    await stopBot(A);
    relay.setOffline('chuPhong');
    await waitFor(async () => { const s = await state(B); return s.role === 'auth' && s.alone === 1; }, 20000, 'khách thành người điều phối');
    check(true, 'chủ phòng mất mạng: khách giành quyền điều phối và giữ cả hai nửa');
    await sleep(2500);
    relay.setOnline('chuPhong');
    await waitFor(async () => { const s = await state(A); return s.role === 'follow' && !s.wait && s.alone === -1; }, 30000, 'chủ phòng vào lại trận');
    await startBot(A, 3);
    const T4 = (await state(A)).tick;
    await sleep(7000);
    a = await state(A); b = await state(B);
    cmp = compareHashes(a, b, T4);
    check(cmp.same >= 3 && cmp.diff === 0, `chủ phòng vào lại (giờ là máy theo): hash giống ở ${cmp.same} mốc`);
  }

  // ---- tải lại trang khách → vào lại phòng
  a = await state(A);
  if (!a.over && !a.won) {
    // tải lại trang của máy đang là máy theo
    if (a.role !== 'follow') throw new Error('mong A là máy theo');
    [A, B] = [B, A];
    await stopBot(B);
    await B.reload();
    await B.waitForFunction(() => typeof COOP !== 'undefined' && ui && ui.game);
    await B.evaluate(() => ui.showCoop());
    const has = await B.evaluate(() => !!document.querySelector('[data-act=coop-rejoin]'));
    check(has, 'sau khi tải lại có nút "Vào lại phòng"');
    await click(B, '[data-act=coop-rejoin]');
    await waitFor(async () => { const s = await state(B); return s.on && !s.wait && s.tick > 0; }, 30000, 'vào lại phòng sau khi tải trang');
    await setCfg(B);
    await startBot(B, 11);
    const T3 = (await state(B)).tick;
    await sleep(7000);
    a = await state(A); b = await state(B);
    cmp = compareHashes(a, b, T3);
    check(cmp.same >= 3 && cmp.diff === 0, `vào lại sau tải trang: hash giống ở ${cmp.same} mốc`);
  }
  await stopBot(A); await stopBot(B);

  // ---- chạy tới hết trận: cả hai nhận Ngân khố, trở lại chơi đơn bình thường
  const k0 = await Promise.all([A, B].map((p) => p.evaluate(() => ui.save.kho || 0)));
  await A.evaluate(() => { game.lives = 1; });
  await B.evaluate(() => { game.lives = 1; });     // cùng sửa cả hai máy → vẫn đồng bộ
  await waitFor(async () => (await A.evaluate(() => !COOP.on)) && (await B.evaluate(() => !COOP.on)), 120000, 'hết trận');
  const k1 = await Promise.all([A, B].map((p) => p.evaluate(() => ui.save.kho || 0)));
  check(k1[0] >= k0[0] && k1[1] >= k0[1] && (k1[0] > k0[0] || k1[1] > k0[1]), `kết thúc trận: Ngân khố ${k0} → ${k1}`);
  const after = await A.evaluate(() => { ui.showMenu(); ui.startLevel(0); document.querySelector('#prep').hidden = true; for (let i = 0; i < 300; i++) game.update(1 / 30); return { coop: SIM.coop, co: !!game.co, gold: typeof Object.getOwnPropertyDescriptor(game, 'gold').value }; });
  check(!after.coop && !after.co && after.gold === 'number', 'sau trận nhóm, chơi đơn trở lại bình thường');
  check(errors.length === 0, 'không có lỗi JS' + (errors.length ? ': ' + errors.slice(0, 5).join(' | ') : ''));
  await A.context().close(); await B.context().close();
}

module.exports = run;
if (require.main === module) launch().then(async (b) => { try { await run(b); } finally { await b.close(); } }).catch((e) => { console.error(e.stack || e); process.exit(1); });
