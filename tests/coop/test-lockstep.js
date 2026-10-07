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
      // Nghỉ chân: người 1 đổi 1 tướng trong đội, người 0 bỏ qua
      if (g.rest && !document.querySelector('#rest').hidden) {
        if (me === 1) { const sel = [...g.summonList()], nu = BASIC_HEROES.find((t) => !sel.includes(t)); sel[0] = nu; ui.restSel = sel; ui.restDone(true); window.__restSwap = nu; }
        else ui.restDone(false);
        return;
      }
      if (window.__botBusy > 0) { window.__botBusy--; return; }
      const mine = g.heroes.filter((h) => h && co.canAct(me, h.slot));
      const r = rnd();
      if (mine.length < 5 && g.gold >= g.summonCost() && g.freeSlots().length) ui.buyCard(Math.floor(rnd() * 4));
      else if (r < 0.1 && g.gold > g.rerollCost() + 80) ui.action({ act: 'mk-reroll' });
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
  check(await A.evaluate(() => document.querySelectorAll('#modes .md-card').length === 2 && !/Phó Bản/.test(document.querySelector('#modes').innerText)), 'màn Chọn chế độ: chỉ Vô Tận + Cùng Giữ Thành');
  await A.evaluate(() => { ui.save.unlocked = Math.max(ui.save.unlocked || 1, 2); });
  const soon = await A.evaluate(() => { ui.showModes(); const c = document.querySelector('.md-card.coop'); c.click(); return { dis: c.disabled, txt: c.textContent, open: !document.querySelector('#coop').hidden }; });
  check(soon.dis && /Sắp ra mắt/.test(soon.txt) && !soon.open, 'mặc định thẻ Cùng Giữ Thành khoá, ghi "Sắp ra mắt", bấm không mở (COOP.visible = false)');
  await A.evaluate(() => { COOP.visible = true; ui.showModes(); });
  await click(A, '.md-card.coop');
  // luật chưa đăng → báo rõ + nút Thử lại; mất mạng → báo mất mạng
  relay.noRules = true;
  await click(A, '[data-act=coop-create]');
  await waitFor(() => A.evaluate(() => !!document.querySelector('[data-act=coop-retry]')), 5000, 'báo lỗi tạo phòng');
  const e1 = await A.evaluate(() => document.querySelector('#coop .login-err').textContent);
  check(/luật chơi nhóm/.test(e1) && /permission-denied/.test(e1), `luật chưa đăng: "${e1.replace(/\s+/g, ' ').slice(0, 90)}…" + nút Thử lại`);
  relay.noRules = false; relay.setOffline('chuPhong');
  await click(A, '[data-act=coop-retry]');
  await waitFor(() => A.evaluate(() => /Mất mạng/.test((document.querySelector('#coop .login-err') || {}).textContent || '')), 5000, 'báo mất mạng');
  check(true, 'mất mạng khi tạo phòng: báo "Mất mạng…" (unavailable)');
  relay.setOnline('chuPhong');
  await click(A, '[data-act=coop-retry]');
  for (let i = errors.length - 1; i >= 0; i--) if (/\[chơi nhóm\] Tạo phòng lỗi/.test(errors[i])) errors.splice(i, 1);   // lỗi cố ý ở trên (đã ghi console.error)
  const code = await waitFor(() => A.evaluate(() => ui.lobby && ui.lobby.code), 5000, 'tạo phòng');
  check(/^[A-Z0-9]{6}$/.test(code), `tạo phòng, mã ${code}`);
  await B.evaluate(() => ui.showCoop());
  await B.fill('#co-code', code.toLowerCase());
  await click(B, '[data-act=coop-join]');
  await waitFor(() => A.evaluate(() => ui.lobby && ui.lobby.room && ui.lobby.room.members.length === 2), 5000, 'khách vào phòng');
  const lobbyTxt = await A.evaluate(() => document.querySelector('#coop').innerText);
  check(/Chủ phòng/.test(lobbyTxt) && /Khách/.test(lobbyTxt), 'màn chờ hiện 2 người');
  check(await A.evaluate(() => document.querySelectorAll('#coop [data-act=coop-lv]').length === LEVELS.length) && !/(^|\s)Ải(\s|$)/.test(lobbyTxt), 'chủ phòng chọn được cả ' + 17 + ' bản đồ vô tận, không còn chữ "Ải"');
  await click(A, '[data-act=coop-lv][data-i="1"]');
  await waitFor(() => B.evaluate(() => ui.lobby && ui.lobby.room && ui.lobby.room.level === 1), 5000, 'khách thấy bản đồ đã chọn');
  await click(A, '[data-act=coop-start]');
  await waitFor(async () => (await A.evaluate(() => COOP.on)) && (await B.evaluate(() => COOP.on)), 5000, 'vào trận');
  check(await A.evaluate(() => game.endless) && await B.evaluate(() => game.endless), 'trận nhóm là vô tận');
  const own = await A.evaluate(() => [game.co.own.filter((x) => x === 0).length, game.co.own.filter((x) => x === 1).length]);
  check(Math.abs(own[0] - own[1]) <= 1, `chia ô công bằng: ${own[0]} / ${own[1]}`);
  await waitFor(async () => (await B.evaluate(() => COOP.hashes.has(60))), 10000, 'mốc hash đầu tiên');
  const same0 = await Promise.all([A, B].map((p) => p.evaluate(() => COOP.hashes.get(60))));
  check(same0[0] === same0[1], 'cùng seed → trạng thái ở bước 60 giống hệt (' + same0.join(' / ') + ')');
  const mk = await Promise.all([A, B].map((p) => p.evaluate(() => game.co.pl.map((x) => ({ m: x.market.types.join(','), ok: x.market.types.every((t) => BASIC_HEROES.includes(t)) })))));
  check(JSON.stringify(mk[0]) === JSON.stringify(mk[1]) && mk[0].every((x) => x.ok) && mk[0][0].m !== undefined,
    `chợ tướng riêng mỗi người (v181: mọi tướng Thường, ưu tiên đội mình), giống nhau trên hai máy (${mk[0].map((x) => x.m).join(' | ')})`);

  // ---- trò chuyện (không đi qua lockstep)
  await A.evaluate(() => ui.chatAct({ act: 'chat-quick', i: '0' }));
  await waitFor(() => B.evaluate(() => COOP.chatList.some((m) => m.text === 'Giúp mình với!')), 5000, 'khách nhận tin chat');
  const bub = await B.evaluate(() => ({ dot: !document.querySelector('#chat-dot').hidden, bub: document.querySelector('#chat-bubbles').textContent, btn: !document.querySelector('#btn-chat').hidden }));
  check(bub.btn && bub.dot && /Giúp mình với/.test(bub.bub), 'tin đồng đội hiện bong bóng + chấm chưa đọc khi khung chat đóng');
  await B.evaluate(() => { ui.chatToggle(true); document.querySelector('#chat-in').value = 'đm boss mạnh quá ' + 'x'.repeat(200); });
  await B.evaluate(() => ui.chatAct({ act: 'chat-send' }));
  const fast = await B.evaluate(() => COOP.say('tin thứ hai ngay lập tức', 'B'));
  check(/chậm/.test(String(fast)), 'giới hạn 1 tin / giây');
  await waitFor(() => A.evaluate(() => COOP.chatList.some((m) => /boss mạnh/.test(m.text))), 5000, 'chủ phòng nhận tin');
  const got = await A.evaluate(() => COOP.chatList.find((m) => /boss mạnh/.test(m.text)).text);
  check(got.startsWith('*** boss') && got.length <= 120, `lọc từ thô tục + tối đa 120 ký tự ("${got.slice(0, 24)}…", ${got.length} ký tự)`);
  const panel = await B.evaluate(() => { const r = document.querySelector('#chat').getBoundingClientRect(), w = document.querySelector('#wrap').getBoundingClientRect(); return { frac: r.width / w.width, list: document.querySelector('#chat-list').textContent }; });
  check(panel.frac <= 0.34 && /Giúp mình với/.test(panel.list), `khung chat gọn (${Math.round(panel.frac * 100)}% chiều ngang), hiện lịch sử tin`);
  await B.evaluate(() => ui.chatToggle(false));

  const denied = await B.evaluate(() => { const s = game.co.own.findIndex((o) => o === 0); return COOP.issue('raiseSpot', [s]); });
  check(/đồng đội/.test(String(denied)), 'không thao tác được ô của đồng đội');

  // ---- chạy nhiều đợt với 2 "người chơi máy"
  await A.evaluate(() => COOP.issue('speed', [3]));
  await startBot(A, 7); await startBot(B, 99);
  await waitFor(async () => { const s = await state(B); return s.wave >= 12 || s.over; }, 420000, 'chơi tới đợt 12 (qua boss đợt 10 + Nghỉ chân)');
  let a = await state(A), b = await state(B);
  let cmp = compareHashes(a, b);
  console.log(`    đợt ${b.wave}, bước ${a.tick}/${b.tick}, tướng ${a.heroes}, vàng ${a.gold}, mạng ${a.lives}`);
  check(a.speed === 3 && b.speed === 3, 'đổi tốc độ x3 đồng bộ cả hai máy');
  check(cmp.same >= 20 && cmp.diff === 0, `hash giống nhau ở ${cmp.same} mốc chung, lệch ${cmp.diff}`);
  check(b.stats.ok >= 20 && b.stats.bad === 0 && b.stats.resync === 0, `máy khách so ${b.stats.ok} hash với chủ phòng, không lệch`);
  check(a.heroes >= 4 && a.gold[0] >= 0 && a.gold[1] >= 0, 'cả hai người đều có tướng và ví riêng');
  if (!a.over) {
    const rest = await Promise.all([A, B].map((p) => p.evaluate(() => ({ rest: !!game.rest, deck1: game.co.pl[1].deck.join(','), swap: window.__restSwap || null }))));
    check(!rest[0].rest && !rest[1].rest && rest[1].swap && rest[0].deck1 === rest[1].deck1 && rest[0].deck1.includes(rest[1].swap),
      `Nghỉ chân sau boss: khách đổi đội (thêm ${rest[1].swap}), cả hai máy cùng đội mới, trận chạy tiếp`);
  }

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
    const tA = await A.evaluate(() => (ui.coopLog || []).map((x) => x.msg).join(' | '));
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
  const [res, lvName] = await B.evaluate(() => [document.querySelector('#result').innerText, LEVELS[1].name]);
  check(/Giữ được tới đợt/.test(res) && res.includes(lvName) && !/(^|\s)Ải(\s|$)/.test(res), 'màn kết quả nhóm: theo bản đồ, không chữ "Ải"');
  const after = await A.evaluate(() => { ui.showMenu(); ui.startLevel(0); document.querySelector('#prep').hidden = true; for (let i = 0; i < 300; i++) game.update(1 / 30); return { coop: SIM.coop, co: !!game.co, gold: typeof Object.getOwnPropertyDescriptor(game, 'gold').value }; });
  check(!after.coop && !after.co && after.gold === 'number', 'sau trận nhóm, chơi đơn trở lại bình thường');
  check(errors.length === 0, 'không có lỗi JS' + (errors.length ? ': ' + errors.slice(0, 5).join(' | ') : ''));
  await A.context().close(); await B.context().close();
}

module.exports = run;
if (require.main === module) launch().then(async (b) => { try { await run(b); } finally { await b.close(); } }).catch((e) => { console.error(e.stack || e); process.exit(1); });
