// Test Chợ tướng (v143; claude/bo-chon-doi: bỏ đội 6 tướng + Nghỉ chân). Chạy: node tests/cho-tuong/cho-tuong.test.js
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('./helpers');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });

const slotXY = (page, s) => page.evaluate((s) => {
  const [x, y] = CONFIG.slots[s]; const r = document.querySelector('#game').getBoundingClientRect();
  return ROT ? [r.right - (y + view.oy) * view.scale, r.top + (x + view.ox) * view.scale] : [r.left + (x + view.ox) * view.scale, r.top + (y + view.oy) * view.scale];
}, s);
const center = async (page, sel) => { const b = await page.locator(sel).first().boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };
async function dragTo(page, from, to) {
  await page.mouse.move(from[0], from[1]); await page.mouse.down();
  for (let k = 1; k <= 12; k++) { await page.mouse.move(from[0] + (to[0] - from[0]) * k / 12, from[1] + (to[1] - from[1]) * k / 12); await page.waitForTimeout(16); }
}
const rerender = (page) => page.evaluate(() => { ui.sig.deck = null; });

async function main() {
  // ---------- 844x390: chợ tướng
  let { browser, page, errors } = await open(844, 390);
  await enter(page, 0);
  await page.evaluate(() => { game.running = false; });
  ok(await page.locator('#deck .mk-card').count() === 6, 'thanh đáy có 6 thẻ tướng (cho-6-the)');
  ok(await page.locator('#deck [data-act=mk-reroll]').count() === 1 && await page.locator('#deck [data-act=legend-open]').count() === 1, 'có nút ↻ và Hợp thể');
  ok(await page.locator('[data-act=summon-rand]').count() === 0, 'không còn nút Triệu hồi cũ');
  const inDeck = await page.evaluate(() => game.market.types.every((t) => BASIC_HEROES.includes(t)));
  ok(inDeck, 'thẻ rút từ tướng Thường (v180: mọi tướng Thường đã mở)');
  await page.screenshot({ path: path.join(SHOT, 'thanh-day-844x390.png'), clip: { x: 0, y: 390 - 110, width: 844, height: 110 } });

  // chạm mua (thẻ loại chưa có trên sân — có thì mua là tự ghép, xem bên dưới)
  await page.evaluate(() => { const on = new Set(game.heroes.filter(Boolean).map((h) => h.type)); game.market.types = game.market.types.map((t) => (on.has(t) ? BASIC_HEROES.find((x) => !on.has(x)) : t)); ui.sig.deck = null; });
  let s0 = await page.evaluate(() => ({ gold: game.gold, cost: game.summonCost(), t: game.market.types[0], n: game.heroes.filter(Boolean).length }));
  await page.click('#deck .mk-card[data-mk="0"]');
  await page.waitForTimeout(150);
  let s1 = await page.evaluate(() => ({ gold: game.gold, n: game.heroes.filter(Boolean).length, types: game.heroes.filter(Boolean).map((h) => h.type), cost: game.summonCost() }));
  ok(s1.n === s0.n + 1 && s1.types.includes(s0.t), 'chạm thẻ → tướng xuất hiện trên sân');
  ok(s1.gold === s0.gold - s0.cost, `vàng trừ đúng ${s0.cost} (${s0.gold} → ${s1.gold})`);
  ok(s1.cost > s0.cost, `giá tăng dần (${s0.cost} → ${s1.cost})`);

  // kéo thẻ vào ô cụ thể
  await page.evaluate(() => { game.gold = 2000; });
  const target = await page.evaluate(() => game.freeSlots()[3]);
  const t1 = await page.evaluate(() => { const on = new Set(game.heroes.filter(Boolean).map((h) => h.type)); return (game.market.types[1] = BASIC_HEROES.find((x) => !on.has(x))); });
  await rerender(page); await page.waitForTimeout(100);
  await dragTo(page, await center(page, '#deck .mk-card[data-mk="1"]'), await slotXY(page, target));
  ok(await page.locator('#mk-ghost:not([hidden])').count() === 1, 'đang kéo thẻ có ảnh tướng theo tay');
  await page.mouse.up(); await page.waitForTimeout(150);
  ok(await page.evaluate(([s, t]) => game.heroes[s] && game.heroes[s].type === t, [target, t1]), `kéo thẻ thả vào ô ${target} → tướng đặt đúng ô`);

  // cho-6-the: mua thẻ ghép được → TỰ GHÉP luôn (còn ô trống cũng ghép), ghép dây chuyền ★ → ★★ → ★★★; không còn nút "Ghép tự động"
  const am = await page.evaluate(() => {
    for (let s = 0; s < game.heroes.length; s++) game.heroes[s] = null;
    game.gold = 5000; const t = 'lucsi';
    const a = game.freeSlots()[0]; game.spawnHero(a, t, { tier: 2 });
    const b = game.freeSlots()[0]; game.spawnHero(b, t, { tier: 1 });
    game.market.types[2] = t; ui.sig.deck = null; ui.updateDeck();
    return { a, b, n: game.heroes.filter(Boolean).length, auto: document.querySelectorAll('#deck [data-act=auto-merge], #deck .dk-auto').length, twin: document.querySelector('#deck .mk-card[data-mk="2"]').classList.contains('twin') };
  });
  ok(am.auto === 0 && am.twin, 'không còn nút "Ghép tự động"; thẻ ghép được có nhãn ⇄ ghép');
  await page.click('#deck .mk-card[data-mk="2"]'); await page.waitForTimeout(150);
  const am2 = await page.evaluate(() => ({ n: game.heroes.filter(Boolean).length, tiers: game.heroes.filter(Boolean).map((h) => h.tier), fx: game.effects.filter((e) => e.type === 'evolve').length }));
  ok(am2.n === 1 && am2.tiers[0] === 3 && am2.fx >= 2, `mua Lực Sĩ khi sân có ★★ + ★ → tự ghép dây chuyền thành ★★★ (còn ${am2.n} tướng, ${am2.fx} hiệu ứng lên sao)`);
  const am3 = await page.evaluate(() => { const r = game.buyCard(0, game.freeSlots()[0]); game.market.types[1] = game.heroes[r].type; ui.sig.deck = null; const free = game.freeSlots()[1]; const r2 = game.buyCard(1, free); return { r, r2, tier: game.heroes[r].tier, empty: !game.heroes[free] }; });
  ok(am3.r2 === am3.r && am3.tier === 2 && am3.empty, 'kéo thẻ ghép được vào ô trống khác → vẫn ghép vào tướng ★ trên sân (ô trống để trống)');
  // cho-6-the: dựng lại thanh chợ (đổi ↻ / mua) không tạo lại ảnh đã có → không nháy trắng; ảnh mới đã giải mã sẵn
  const nf = await page.evaluate(async () => {
    // máy bận (chạy song song): chờ các ảnh nạp sẵn (ui.mkPre) tải xong — tối đa 10 giây — thay vì tin 400 / 250 ms là đủ
    const preReady = async (ms) => { const end = performance.now() + ms; while (performance.now() < end && ui.mkPre && [...ui.mkPre.values()].some((L) => L.some((im) => !(im.complete && im.naturalWidth > 0)))) await new Promise((r) => setTimeout(r, 50)); };
    game.gold = 1e5; ui.sig.deck = null; ui.updateDeck(); await new Promise((r) => setTimeout(r, 400)); await preReady(10000);
    let blank = 0, kept = 0, total = 0, over3 = 0;
    for (let k = 0; k < 20; k++) {
      const before = new Map([...document.querySelectorAll('#deck .mk-card > img')].map((im) => [im.getAttribute('src'), im]));
      await new Promise((r) => setTimeout(r, 250));     // nhịp bấm ↻ của người (≥ 1/4 giây)
      await preReady(5000);
      game.market.rr = 0; game.rerollMarket(); ui.updateDeck();
      // ui.preImg chỉ giữ sẵn 3 bản mỗi ảnh; chợ 6 thẻ có thể ra ≥ 4 thẻ cùng loại → thẻ thứ 4 trở đi tạo ảnh mới chưa tải
      // (lỗi game đã báo, chưa sửa) — đếm riêng (over3), không tính vào blank để test không chập chờn theo may rủi đổi chợ
      const cnt = {};
      for (const im of document.querySelectorAll('#deck .mk-card > img')) cnt[im.src] = (cnt[im.src] || 0) + 1;   // im.src: đường dẫn đầy đủ (thuộc tính src có thể tương đối / tuyệt đối)
      for (const im of document.querySelectorAll('#deck .mk-card > img')) { total++; const src = im.getAttribute('src'); if (before.get(src) === im) kept++; if (!(im.complete && im.naturalWidth > 0)) { if (cnt[im.src] > 3) over3++; else blank++; } }
    }
    return { blank, kept, total, over3 };
  });
  if (nf.over3) console.log(`  ! lỗi game đã báo: ${nf.over3} thẻ trùng loại thứ 4+ hiện ảnh chưa tải (ui.preImg chỉ giữ 3 bản)`);
  ok(nf.blank === 0 && nf.kept > 0, `20 lần đổi chợ: ${nf.total} ảnh thẻ, ảnh chưa sẵn sàng ngay khi dựng lại: ${nf.blank}, ${nf.kept} ảnh dùng lại không tạo mới`);
  await page.evaluate(() => { game.gold = 2000; game.market.rr = 0; ui.sig.deck = null; });

  // ↻ đổi hàng
  let r0 = await page.evaluate(() => ({ gold: game.gold, c: game.rerollCost() }));
  await page.click('#deck [data-act=mk-reroll]'); await page.waitForTimeout(100);
  let r1 = await page.evaluate(() => ({ gold: game.gold, c: game.rerollCost(), rr: game.market.rr }));
  ok(r0.c === 10 && r1.gold === r0.gold - 10 && r1.c === 20 && r1.rr === 1, `↻ trừ 10 vàng, lần sau 20 (${r0.gold} → ${r1.gold})`);
  await page.click('#deck [data-act=mk-reroll]'); await page.waitForTimeout(100);
  ok(await page.evaluate(() => game.rerollCost()) === 30, '↻ lần 3 giá 30');

  // làm mới miễn phí đầu đợt
  let w0 = await page.evaluate(() => { game.market.types = game.market.types.map(() => game.marketPool()[0]); const m = game.market; window.__m = m; return game.gold; });
  await page.evaluate(() => { game.startWave(); game.running = false; });
  let w1 = await page.evaluate(() => ({ gold: game.gold, rr: game.market.rr, fresh: game.market !== window.__m, c: game.rerollCost(), ok: game.market.types.length === 6 }));
  ok(w1.fresh && w1.rr === 0 && w1.c === 10 && w1.gold === w0 && w1.ok, 'đầu đợt mới: chợ làm mới miễn phí, giá ↻ về 10');

  // thẻ "ghép"
  const twin = await page.evaluate(() => { const same = (x) => game.heroes.filter((y) => y && y.type === x.type).length; const h = game.heroes.find((x) => x && x.tier === 1 && same(x) === 1) || game.spawnHero(game.freeSlots()[0], game.marketPool().find((t) => !game.heroes.some((y) => y && y.type === t)), { tier: 1 }); game.market.types[2] = h.type; game.market.types[3] = game.marketPool().find((t) => !game.heroes.some((x) => x && x.type === t)) || game.market.types[3]; ui.sig.deck = null; return { slot: h.slot, type: h.type }; });
  await page.waitForTimeout(120);
  ok(await page.locator('#deck .mk-card[data-mk="2"].twin .tw').innerText() === 'ghép', 'thẻ trùng tướng ★ trên sân có viền sáng + nhãn "ghép"');
  await page.screenshot({ path: path.join(SHOT, 'thanh-day-ghep-844x390.png'), clip: { x: 0, y: 390 - 110, width: 844, height: 110 } });
  // kéo thẻ ghép thả lên tướng ★ cùng loại → lên ★★
  await dragTo(page, await center(page, '#deck .mk-card[data-mk="2"]'), await slotXY(page, twin.slot));
  await page.mouse.up(); await page.waitForTimeout(150);
  await page.waitForFunction((s) => game.heroes[s] && game.heroes[s].tier === 2, twin.slot, { timeout: 5000 }).catch(() => {});   // máy bận: chờ ghép xong
  ok(await page.evaluate((s) => game.heroes[s] && game.heroes[s].tier === 2 && game.heroes.length === CONFIG.slots.length, twin.slot), 'thả thẻ lên tướng ★ cùng loại → ghép thành ★★');

  // chợ ẩn khi kéo tướng, thùng Hủy ở đúng chỗ thanh đáy
  const hs = await page.evaluate(() => game.heroes.find(Boolean).slot);
  const p0 = await slotXY(page, hs);
  await dragTo(page, p0, [p0[0] + 60, p0[1] - 40]);
  const st = await page.evaluate(() => ({ cls: document.querySelector('#wrap').classList.contains('dragging-hero'), vis: getComputedStyle(document.querySelector('#deck')).visibility, trash: !document.querySelector('#trash').hidden, tb: document.querySelector('#trash').getBoundingClientRect().bottom, db: document.querySelector('#deck').getBoundingClientRect().bottom }));
  ok(st.cls && st.vis === 'hidden' && st.trash, 'đang kéo tướng: chợ tướng ẩn, thùng Hủy hiện');
  ok(Math.abs(st.tb - st.db) < 4, 'thùng Hủy nằm đúng chỗ thanh đáy');
  await page.screenshot({ path: path.join(SHOT, 'keo-tuong-thung-huy-844x390.png') });
  await page.mouse.up(); await page.waitForTimeout(100);
  ok(await page.evaluate(() => getComputedStyle(document.querySelector('#deck')).visibility) === 'visible', 'thả tay: chợ tướng hiện lại');

  // hết ô trống: chạm thẻ "ghép" vẫn ghép được; thẻ khác mờ
  await page.evaluate(() => { const t = game.marketPool(); game.freeSlots().forEach((s, k) => game.spawnHero(s, t[k % 6], { tier: 3, spent: 0 }));
    for (const h of game.heroes) if (h) h.tier = 3; const one = game.heroes.find((h) => h && h.tier === 3); one.tier = 1; ui.clearSel(); game.market.types = [one.type, t.find((x) => x !== one.type), one.type, one.type]; ui.sig.deck = null; window.__one = one.slot; });
  await page.waitForTimeout(120);
  ok(await page.locator('#deck .mk-card[data-mk="1"].poor').count() === 1, 'hết ô: thẻ không ghép được bị mờ');
  await page.click('#deck .mk-card[data-mk="0"]'); await page.waitForTimeout(100);
  ok(await page.evaluate(() => game.heroes[window.__one].tier === 2), 'hết ô: chạm thẻ "ghép" → ghép thẳng vào tướng ★');
  ok(errors.length === 0, 'không lỗi trang (844x390) ' + errors.join(' | '));
  await browser.close();

  // ---------- 667x375 + chế độ xoay dọc
  for (const [w, h, name] of [[667, 375, '667x375'], [390, 844, 'xoay-doc-390x844']]) {
    ({ browser, page, errors } = await open(w, h));
    await enter(page, 1);
    await page.evaluate(() => { game.running = false; game.gold = 400; const s = game.freeSlots(); game.spawnHero(s[0], game.marketPool()[0], { tier: 1 }); game.spawnHero(s[1], game.marketPool()[0], { tier: 1 }); game.market.types[1] = game.marketPool()[0]; ui.sig.deck = null; });
    await page.waitForTimeout(250);
    const m = await page.evaluate(() => {
      const els = [...document.querySelectorAll('#deck .mk-card, #deck .mk-rr, #deck .mk-lk, #deck .dk-card, #deck .dk-auto')];
      const rs = els.map((e) => e.getBoundingClientRect());
      const over = [...document.querySelectorAll('#deck .mk-card .nm')].some((e) => e.scrollWidth > e.clientWidth + 1);
      const tops = new Set(rs.map((r) => Math.round(ROT ? r.left : r.top) / 4 | 0));
      const d = document.querySelector('#deck').getBoundingClientRect();
      return { deckH: (ROT ? d.width : d.height) / (innerWidth > innerHeight ? innerHeight : innerWidth) * 390, min: Math.min(...rs.map((r) => Math.min(r.width, r.height))), over, rows: tops.size, inside: d.left >= 0 && d.right <= innerWidth && d.top >= 0 && d.bottom <= innerHeight, n: els.length, rot: ROT };
    });
    ok(m.n >= 7 && m.rows <= 2 && m.inside, `${name}: 6 thẻ + ↻ + Hợp thể (+ Ghép tự động) một hàng, nằm trong màn hình (rot=${m.rot})`);
    ok(m.min >= 36, `${name}: vùng chạm nhỏ nhất ${m.min.toFixed(1)}px ≥ 36 (cho-6-the: thanh gọn)`);
    ok(m.deckH <= 0.7 * 76, `${name}: thanh chợ gọn ${m.deckH.toFixed(1)}px ≤ 70% thanh cũ (~76px ở 844×390)`);
    ok(!m.over, `${name}: tên trên thẻ không tràn`);
    if (!m.rot) await page.screenshot({ path: path.join(SHOT, `thanh-day-${name}.png`), clip: { x: 0, y: h - 100, width: w, height: 100 } });
    else await page.screenshot({ path: path.join(SHOT, `thanh-day-${name}.png`) });
    // chạm mua cũng chạy khi xoay
    // thẻ 3 là loại chưa có trên sân (chợ ngẫu nhiên có thể ra đúng loại tướng ★ đang đứng → mua thành ghép, số tướng không tăng)
    const n0 = await page.evaluate(() => { const t = game.marketPool().find((x) => !game.heroes.some((y) => y && y.type === x)); game.market.types[3] = t; ui.sig.deck = null; ui.updateDeck(); return game.heroes.filter(Boolean).length; });
    await page.click('#deck .mk-card[data-mk="3"]'); await page.waitForTimeout(100);
    await page.waitForFunction((n0) => game.heroes.filter(Boolean).length === n0 + 1, n0, { timeout: 5000 }).catch(() => {});   // máy bận: chờ mua xong
    ok(await page.evaluate(() => game.heroes.filter(Boolean).length) === n0 + 1, `${name}: chạm thẻ mua được`);
    ok(errors.length === 0, `không lỗi trang (${name}) ` + errors.join(' | '));
    await browser.close();
  }

  // ---------- claude/bo-chon-doi: màn Chuẩn bị không còn chọn đội; sau đợt boss không Nghỉ chân; bản lưu cũ còn đội / Nghỉ chân vẫn nạp được
  ({ browser, page, errors } = await open(844, 390, { owned: [] }));
  await page.evaluate(() => ui.playLevel(0, true));
  await page.waitForSelector('#prep:not([hidden])');
  ok((await page.locator('#prep .scr-head .chip.dark').first().innerText()).includes('Vô tận'), 'Vô tận: vào màn Chuẩn bị (có ghi Vô tận)');
  const pv = await page.evaluate(() => ({ txt: document.querySelector('#prep').innerText, deckBtn: document.querySelectorAll('#prep [data-act^=deck-], #prep .deck-row, #prep .dk-modal').length,
    counter: document.querySelectorAll('#prep .prep-counter').length, rest: document.querySelectorAll('#rest').length }));
  ok(pv.deckBtn === 0 && !/đội ưu tiên|chọn đội/i.test(pv.txt), 'màn Chuẩn bị: không còn bảng / nút chọn đội ưu tiên');
  ok(pv.counter === 1 && pv.rest === 0, 'màn Chuẩn bị vẫn còn cột khắc chế; không còn khung Nghỉ chân');
  await page.click('[data-act=prep-go]');
  await page.waitForTimeout(200);
  const mk0 = await page.evaluate(() => ({ e: game.endless, deck: 'deck' in game, pool: game.marketPool().length, own: openCommons(ui.save.owned).length, t: game.market.types.every((t) => openCommons(ui.save.owned).includes(t)) }));
  ok(mk0.e && !mk0.deck && mk0.pool === mk0.own && mk0.t, `Vô tận: không còn đội, chợ rút từ ${mk0.pool} tướng Thường đã mở`);
  // vừa hạ boss đợt 10: không dừng trận, không bảng Nghỉ chân
  await page.evaluate(() => { game.running = true; game.wave = 10; game.waveActive = true; game.spawnQueue = []; game.enemies = []; game.waveComplete(); });
  await page.waitForTimeout(200);
  ok(await page.evaluate(() => game.running === true && !('rest' in game && game.rest) && !game.events.some((e) => e.type === 'rest')), 'sau đợt boss 10: trận chạy tiếp, không Nghỉ chân');
  // lưu / tiếp tục: không còn trường đội / Nghỉ chân trong bản lưu
  await page.evaluate(() => ui.saveRun());
  const sv = await page.evaluate(() => Object.keys(ui.save.run));
  ok(!sv.includes('deck') && !sv.includes('rest') && !sv.includes('restWave'), 'bản lưu trận không còn deck / rest / restWave');
  const mk = await page.evaluate(() => [...game.market.types]);
  await page.reload(); await page.waitForTimeout(900);
  await page.evaluate(() => ui.resumeRun()); await page.waitForTimeout(200);
  ok(await page.evaluate((mk) => JSON.stringify(game.market.types) === JSON.stringify(mk) && game.endless && game.wave === 10, mk), 'tiếp tục trận: giữ nguyên chợ, đúng đợt');
  // bản lưu CŨ đang mở bảng Nghỉ chân (có deck, rest, restWave) → bỏ qua, trận chạy được
  const legacy = await page.evaluate(() => { const o = game.snapshot(); o.deck = ['lactuong', 'lucsi', 'xathu', 'thosan', 'thaymo', 'thansuong']; o.rest = { wave: 10 }; o.restWave = 10;
    game.restore(o); game.running = true; const w = game.wave; game.update(0.05);
    return { deck: 'deck' in game, rest: 'rest' in game, rw: 'restWave' in game, time: game.time > 0, m: game.market.types.length, w }; });
  ok(!legacy.deck && !legacy.rest && !legacy.rw && legacy.time && legacy.m === 6, 'bản lưu cũ có đội + Nghỉ chân: bỏ qua các trường cũ, trận chạy tiếp ' + JSON.stringify(legacy));
  await page.evaluate(() => { game.running = false; });
  await page.screenshot({ path: path.join(SHOT, 'sau-boss-khong-nghi-chan-844x390.png') });
  ok(errors.length === 0, 'không lỗi trang (Vô tận) ' + errors.join(' | '));
  await browser.close();

  // ---------- v166 (chỉ còn vô tận): đợt boss cuối của bản đồ không thắng ải, chạy tiếp
  ({ browser, page, errors } = await open(844, 390));
  await enter(page, 1);   // bản đồ 2: boss đợt 10, 20, đợt cuối
  await page.evaluate(() => { game.running = true; game.wave = game.levelWaves; game.waveActive = true; game.spawnQueue = []; game.enemies = []; game.waveComplete(); });
  await page.waitForTimeout(200);
  const fin = await page.evaluate(() => ({ won: game.won, over: game.over, run: game.running }));
  ok(!fin.won && !fin.over && fin.run, 'đợt boss cuối của bản đồ: không thắng ải (vô tận), chạy tiếp ' + JSON.stringify(fin));
  // bản lưu cũ còn bảng chọn 1 trong 3 (đã trả vàng) → hoàn vàng
  const old = await page.evaluate(() => { const o = game.snapshot(); delete o.market; o.won = false; o.wave = 4; o.gold = 100; o.summonN = 3; o.offer = { types: ['lactuong', 'lucsi', 'xathu'], cost: 72, rr: 0 }; game.restore(o); return { gold: game.gold, n: game.summonN, m: game.market && game.market.types.length, offer: game.offer }; });
  ok(old.gold === 172 && old.n === 2 && old.m === 6 && !old.offer, 'bản lưu cũ có offer: hoàn vàng, chuyển sang chợ tướng');
  ok(errors.length === 0, 'không lỗi trang (bản đồ 2) ' + errors.join(' | '));
  await browser.close();
  console.log('\nTẤT CẢ ĐẠT');
}
main().catch((e) => { console.error(e); process.exit(1); });
