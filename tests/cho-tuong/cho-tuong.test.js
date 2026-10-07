// Test Chợ tướng + đội 6 tướng cho Vô tận + Nghỉ chân (v143). Chạy: node tests/cho-tuong/cho-tuong.test.js
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
  ok(await page.locator('#deck .mk-card').count() === 4, 'thanh đáy có 4 thẻ tướng');
  ok(await page.locator('#deck [data-act=mk-reroll]').count() === 1 && await page.locator('#deck [data-act=legend-open]').count() === 1, 'có nút ↻ và Hợp thể');
  ok(await page.locator('[data-act=summon-rand]').count() === 0, 'không còn nút Triệu hồi cũ');
  const inDeck = await page.evaluate(() => game.market.types.every((t) => game.summonList().includes(t)));
  ok(inDeck, 'thẻ rút từ đội 6 tướng');
  await page.screenshot({ path: path.join(SHOT, 'thanh-day-844x390.png'), clip: { x: 0, y: 390 - 110, width: 844, height: 110 } });

  // chạm mua
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
  const t1 = await page.evaluate(() => game.market.types[1]);
  await rerender(page); await page.waitForTimeout(100);
  await dragTo(page, await center(page, '#deck .mk-card[data-mk="1"]'), await slotXY(page, target));
  ok(await page.locator('#mk-ghost:not([hidden])').count() === 1, 'đang kéo thẻ có ảnh tướng theo tay');
  await page.mouse.up(); await page.waitForTimeout(150);
  ok(await page.evaluate(([s, t]) => game.heroes[s] && game.heroes[s].type === t, [target, t1]), `kéo thẻ thả vào ô ${target} → tướng đặt đúng ô`);

  // ↻ đổi hàng
  let r0 = await page.evaluate(() => ({ gold: game.gold, c: game.rerollCost() }));
  await page.click('#deck [data-act=mk-reroll]'); await page.waitForTimeout(100);
  let r1 = await page.evaluate(() => ({ gold: game.gold, c: game.rerollCost(), rr: game.market.rr }));
  ok(r0.c === 10 && r1.gold === r0.gold - 10 && r1.c === 20 && r1.rr === 1, `↻ trừ 10 vàng, lần sau 20 (${r0.gold} → ${r1.gold})`);
  await page.click('#deck [data-act=mk-reroll]'); await page.waitForTimeout(100);
  ok(await page.evaluate(() => game.rerollCost()) === 30, '↻ lần 3 giá 30');

  // làm mới miễn phí đầu đợt
  let w0 = await page.evaluate(() => { game.market.types = game.market.types.map(() => game.summonList()[0]); const m = game.market; window.__m = m; return game.gold; });
  await page.evaluate(() => { game.startWave(); game.running = false; });
  let w1 = await page.evaluate(() => ({ gold: game.gold, rr: game.market.rr, fresh: game.market !== window.__m, c: game.rerollCost(), ok: game.market.types.length === 4 }));
  ok(w1.fresh && w1.rr === 0 && w1.c === 10 && w1.gold === w0 && w1.ok, 'đầu đợt mới: chợ làm mới miễn phí, giá ↻ về 10');

  // thẻ "ghép"
  const twin = await page.evaluate(() => { const h = game.heroes.find((x) => x && x.tier === 1); game.market.types[2] = h.type; game.market.types[3] = game.summonList().find((t) => !game.heroes.some((x) => x && x.type === t)) || game.market.types[3]; ui.sig.deck = null; return { slot: h.slot, type: h.type }; });
  await page.waitForTimeout(120);
  ok(await page.locator('#deck .mk-card[data-mk="2"].twin .tw').innerText() === 'ghép', 'thẻ trùng tướng ★ trên sân có viền sáng + nhãn "ghép"');
  await page.screenshot({ path: path.join(SHOT, 'thanh-day-ghep-844x390.png'), clip: { x: 0, y: 390 - 110, width: 844, height: 110 } });
  // kéo thẻ ghép thả lên tướng ★ cùng loại → lên ★★
  await dragTo(page, await center(page, '#deck .mk-card[data-mk="2"]'), await slotXY(page, twin.slot));
  await page.mouse.up(); await page.waitForTimeout(150);
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
  await page.evaluate(() => { const t = game.summonList(); game.freeSlots().forEach((s, k) => game.spawnHero(s, t[k % 6], { tier: 3, spent: 0 }));
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
    await page.evaluate(() => { game.running = false; game.gold = 400; const s = game.freeSlots(); game.spawnHero(s[0], game.summonList()[0], { tier: 1 }); game.spawnHero(s[1], game.summonList()[0], { tier: 1 }); game.market.types[1] = game.summonList()[0]; ui.sig.deck = null; });
    await page.waitForTimeout(250);
    const m = await page.evaluate(() => {
      const els = [...document.querySelectorAll('#deck .mk-card, #deck .mk-rr, #deck .dk-card, #deck .dk-auto')];
      const rs = els.map((e) => e.getBoundingClientRect());
      const over = [...document.querySelectorAll('#deck .mk-card .nm')].some((e) => e.scrollWidth > e.clientWidth + 1);
      const tops = new Set(rs.map((r) => Math.round(ROT ? r.left : r.top) / 4 | 0));
      const d = document.querySelector('#deck').getBoundingClientRect();
      return { min: Math.min(...rs.map((r) => Math.min(r.width, r.height))), over, rows: tops.size, inside: d.left >= 0 && d.right <= innerWidth && d.top >= 0 && d.bottom <= innerHeight, n: els.length, rot: ROT };
    });
    ok(m.n >= 7 && m.rows <= 2 && m.inside, `${name}: 4 thẻ + ↻ + Hợp thể (+ Ghép tự động) một hàng, nằm trong màn hình (rot=${m.rot})`);
    ok(m.min >= 40, `${name}: vùng chạm nhỏ nhất ${m.min.toFixed(1)}px ≥ 40`);
    ok(!m.over, `${name}: tên trên thẻ không tràn`);
    if (!m.rot) await page.screenshot({ path: path.join(SHOT, `thanh-day-${name}.png`), clip: { x: 0, y: h - 100, width: w, height: 100 } });
    else await page.screenshot({ path: path.join(SHOT, `thanh-day-${name}.png`) });
    // chạm mua cũng chạy khi xoay
    const n0 = await page.evaluate(() => game.heroes.filter(Boolean).length);
    await page.click('#deck .mk-card[data-mk="3"]'); await page.waitForTimeout(100);
    ok(await page.evaluate(() => game.heroes.filter(Boolean).length) === n0 + 1, `${name}: chạm thẻ mua được`);
    ok(errors.length === 0, `không lỗi trang (${name}) ` + errors.join(' | '));
    await browser.close();
  }

  // ---------- Vô tận: bước chọn đội 6 tướng; Nghỉ chân sau đợt 10; lưu / tiếp tục
  ({ browser, page, errors } = await open(844, 390, { owned: [] }));
  await page.evaluate(() => ui.playLevel(0, true));
  await page.waitForSelector('#prep:not([hidden])');
  ok((await page.locator('#prep .scr-head .chip.dark').first().innerText()).includes('Vô tận'), 'Vô tận: vào màn Chuẩn bị (có ghi Vô tận)');
  await page.click('[data-act=deck-open]');
  ok(await page.locator('#prep .dk-modal').count() === 1, 'Vô tận: mở bảng chọn đội 6 tướng');
  await page.click('[data-act=deck-suggest]');
  // đổi 1 tướng để có đội riêng
  const pick = await page.evaluate(() => { const sel = ui.deckSel; return { out: sel[5], in: BASIC_HEROES.find((t) => !sel.includes(t)) }; });
  await page.click(`#prep [data-act=deck-tog][data-id="${pick.out}"]`);
  await page.click(`#prep [data-act=deck-tog][data-id="${pick.in}"]`);
  await page.click('[data-act=deck-done]');
  await page.click('[data-act=prep-go]');
  await page.waitForTimeout(200);
  const dk = await page.evaluate(() => ({ e: game.endless, deck: game.deck, m: game.market.types.every((t) => game.deck.includes(t)) }));
  ok(dk.e && dk.deck.includes(pick.in) && !dk.deck.includes(pick.out) && dk.m, 'Vô tận: trận dùng đội vừa chọn, chợ theo đội');

  // giả lập vừa hạ boss đợt 10
  await page.evaluate(() => { game.running = true; game.wave = 10; game.restWave = 9; game.waveActive = true; game.spawnQueue = []; game.enemies = []; game.waveComplete(); });
  await page.waitForSelector('#rest:not([hidden])');
  ok(await page.evaluate(() => game.running === false && !!game.rest), 'sau đợt boss 10: hiện bảng Nghỉ chân, trận dừng');
  const before = await page.evaluate(() => ({ deck: [...game.deck], heroes: game.heroes.filter(Boolean).length }));
  const outs = before.deck.slice(0, 3), ins = await page.evaluate((d) => BASIC_HEROES.filter((t) => !d.includes(t)).slice(0, 3), before.deck);
  for (const t of outs.slice(0, 2)) await page.click(`#rest [data-act=rest-tog][data-id="${t}"]`);
  for (const t of ins.slice(0, 2)) await page.click(`#rest [data-act=rest-tog][data-id="${t}"]`);
  await page.screenshot({ path: path.join(SHOT, 'nghi-chan-844x390.png') });
  // đổi thứ 3 bị chặn
  await page.click(`#rest [data-act=rest-tog][data-id="${outs[2]}"]`);
  await page.click(`#rest [data-act=rest-tog][data-id="${ins[2]}"]`);
  ok(await page.evaluate((t) => !ui.restSel.includes(t), ins[2]), 'không cho đổi tướng thứ 3');
  await page.click(`#rest [data-act=rest-tog][data-id="${outs[2]}"]`);   // trả lại
  // lưu giữa chừng khi bảng còn mở → tải lại trang → tiếp tục
  await page.evaluate(() => ui.saveRun());
  const mk = await page.evaluate(() => [...game.market.types]);
  await page.reload(); await page.waitForTimeout(900);
  await page.evaluate(() => ui.resumeRun()); await page.waitForTimeout(200);
  const rs = await page.evaluate(() => ({ rest: !!game.rest, open: !document.querySelector('#rest').hidden, deck: game.deck, m: game.market.types, e: game.endless }));
  ok(rs.rest && rs.open && rs.e, 'tiếp tục trận: bảng Nghỉ chân vẫn mở (Vô tận)');
  ok(JSON.stringify(rs.deck) === JSON.stringify(before.deck) && JSON.stringify(rs.m) === JSON.stringify(mk), 'tiếp tục trận: giữ nguyên đội + chợ');
  for (const t of outs.slice(0, 2)) await page.click(`#rest [data-act=rest-tog][data-id="${t}"]`);
  for (const t of ins.slice(0, 2)) await page.click(`#rest [data-act=rest-tog][data-id="${t}"]`);
  await page.click('#rest [data-act=rest-done]'); await page.waitForTimeout(150);
  const after = await page.evaluate(() => ({ deck: game.deck, rest: game.rest, open: !document.querySelector('#rest').hidden, m: game.market.types.every((t) => game.deck.includes(t)), heroes: game.heroes.filter(Boolean).length }));
  const changed = after.deck.filter((t) => !before.deck.includes(t));
  ok(changed.length === 2 && ins.slice(0, 2).every((t) => after.deck.includes(t)), 'Nghỉ chân: đổi đúng 2 tướng');
  ok(!after.rest && !after.open && after.m, 'đóng bảng, chợ làm mới theo đội mới');
  ok(after.heroes === before.heroes, 'tướng trên sân giữ nguyên');
  // lưu lại & tiếp tục lần nữa: đội mới, không còn nghỉ chân
  await page.evaluate(() => ui.saveRun());
  await page.reload(); await page.waitForTimeout(900);
  await page.evaluate(() => ui.resumeRun()); await page.waitForTimeout(200);
  const rs2 = await page.evaluate(() => ({ deck: game.deck, rest: game.rest, open: !document.querySelector('#rest').hidden, rw: game.restWave }));
  ok(JSON.stringify(rs2.deck) === JSON.stringify(after.deck) && !rs2.rest && !rs2.open && rs2.rw === 10, 'tiếp tục lần 2: đội mới giữ nguyên, không hiện lại Nghỉ chân');
  // đợt thường không nghỉ chân; Bỏ qua giữ đội
  await page.evaluate(() => { game.wave = 11; game.waveActive = true; game.waveComplete(); });
  await page.waitForTimeout(150);
  ok(await page.evaluate(() => !game.rest && document.querySelector('#rest').hidden), 'đợt 11 (thường) không có Nghỉ chân');
  ok(errors.length === 0, 'không lỗi trang (Vô tận) ' + errors.join(' | '));
  await browser.close();

  // ---------- Phó bản: nghỉ chân sau boss đợt 10, bỏ qua; đợt cuối thắng ải không nghỉ
  ({ browser, page, errors } = await open(844, 390));
  await enter(page, 1);   // ải 2: boss đợt 10, 20, đợt cuối
  await page.evaluate(() => { game.running = true; game.wave = 10; game.waveActive = true; game.waveComplete(); });
  await page.waitForSelector('#rest:not([hidden])');
  const d0 = await page.evaluate(() => [...game.deck]);
  await page.click('#rest [data-act=rest-skip]'); await page.waitForTimeout(100);
  ok(await page.evaluate((d) => !game.rest && game.running && JSON.stringify(game.deck) === JSON.stringify(d), d0), 'Phó bản: Nghỉ chân sau đợt 10, Bỏ qua giữ đội và chạy tiếp');
  await page.evaluate(() => { game.wave = game.levelWaves; game.waveActive = true; game.spawnQueue = []; game.enemies = []; game.waveComplete(); });
  await page.waitForTimeout(200);
  const fin = await page.evaluate(() => ({ rest: game.rest, won: game.won, w: game.wave, lw: game.levelWaves, over: game.over }));
  ok(!fin.rest && fin.won, 'đợt boss cuối thắng ải: không Nghỉ chân ' + JSON.stringify(fin));
  // bản lưu cũ còn bảng chọn 1 trong 3 (đã trả vàng) → hoàn vàng
  const old = await page.evaluate(() => { const o = game.snapshot(); delete o.market; delete o.rest; delete o.restWave; o.won = false; o.wave = 4; o.gold = 100; o.summonN = 3; o.offer = { types: game.deck.slice(0, 3), cost: 72, rr: 0 }; game.restore(o); return { gold: game.gold, n: game.summonN, m: game.market && game.market.types.length, rw: game.restWave, offer: game.offer }; });
  ok(old.gold === 172 && old.n === 2 && old.m === 4 && old.rw === 4 && !old.offer, 'bản lưu cũ có offer: hoàn vàng, chuyển sang chợ tướng');
  ok(errors.length === 0, 'không lỗi trang (Phó bản) ' + errors.join(' | '));
  await browser.close();
  console.log('\nTẤT CẢ ĐẠT');
}
main().catch((e) => { console.error(e); process.exit(1); });
