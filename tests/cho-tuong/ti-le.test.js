// Test chợ có chủ đích (v180; claude/bo-chon-doi: bỏ đội ưu tiên): tỉ lệ ra tướng cần, bảo hiểm, giới hạn bản sao, 🔒 khoá chợ, nhãn "hợp thể".
// Chạy: node tests/cho-tuong/ti-le.test.js
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('./helpers');
const { runAll, CASES } = require('./ti-le-sim');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });

async function main() {
  // ---------- mô phỏng 1000 lần đổi chợ mỗi tình huống
  const { out, errors: e0 } = await runAll(1000);
  for (const k in out) console.log(`  · ${CASES[k].name}: ${JSON.stringify(out[k])}`);
  const A = out['dau-tran'], B = out['giua-tran'], C = out['thieu-hop-the'], D = out['giua-tran-moi-tim'];
  ok(A.board >= 50 && A.board <= 80, `đầu trận: ra tướng đang có ${A.board}% (v179 ~51%, không quá dễ ≤ 80%)`);
  ok(A.kinds === 20 && A.outDeck >= 50, `chợ ra mọi tướng Thường, không còn đội ưu tiên: ${A.kinds} loại, ${A.outDeck}% thẻ ngoài 6 tướng đội cũ`);
  ok(A.maxDry <= 2, `đầu trận: bảo hiểm — trượt liền tối đa ${A.maxDry} ≤ 2 lần`);
  ok(B.board >= 93, `giữa trận: ra tướng đang có ${B.board}% (dù chợ 20 loại)`);
  ok(C.need === 100 && C.maxNeedDry === 0, `thiếu nguyên liệu hợp thể (đích đã mở): MỖI lần đổi chợ đều có nguyên liệu thiếu (${C.need}%, cho-6-the)`);
  ok(D.board >= 90 && D.maxDry <= 3, `giữa trận, sở hữu mọi tướng Tím: vẫn ra tướng đang có ${D.board}% (tối đa MARKET_HOP.max công thức đang theo), trượt liền tối đa ${D.maxDry}`);
  ok(e0.length === 0, 'không lỗi trang khi mô phỏng ' + e0.join(' | '));

  // ---------- luật chợ trong trận thật
  const { browser, page, errors } = await open(844, 390);
  await enter(page, 0);
  const r = await page.evaluate(() => {
    game.running = false; game.owned = new Set([...BASIC_HEROES, 'caong']); game.gold = 1e6;
    for (let s = 0; s < game.heroes.length; s++) game.heroes[s] = null;
    // Lạc Tướng ★★★ = đủ 4 bản sao → không ra nữa
    game.spawnHero(game.freeSlots()[0], 'lactuong', { tier: 3 });
    game.spawnHero(game.freeSlots()[0], 'nguphu', { tier: 2 });
    let capped = 0, hop = 0;
    for (let i = 0; i < 500; i++) { game.market.rr = 0; game.rerollMarket(); if (game.market.types.includes('lactuong')) capped++; if (game.market.types.includes('thansuong')) hop++; }
    // mua thẻ: thẻ bù cũng tôn trọng giới hạn bản sao
    let refill = 0;
    for (let i = 0; i < 200; i++) { const t = game.rollCard(); if (t === 'lactuong') refill++; }
    const nd = game.marketNeeds();
    // chưa sở hữu Cá Ông → không coi là nguyên liệu hợp thể
    game.owned = new Set(BASIC_HEROES);
    const nd2 = game.marketNeeds();
    game.owned = new Set([...BASIC_HEROES, 'caong']);
    // sở hữu MỌI tướng Tím: nhiều công thức cùng đang theo → tối đa MARKET_HOP.max công thức; công thức có cả 2 bên trên sân đứng trước
    game.owned = null;
    const nd3 = game.marketNeeds();
    game.spawnHero(game.freeSlots()[0], 'thansuong', { tier: 1 });
    const nd4 = game.marketNeeds();
    const recOf = (S) => FUSION.filter((f) => HEROES[f.to].legend && [...S].some((x) => x === f.a || x === f.b));
    game.owned = new Set([...BASIC_HEROES, 'caong']);
    return { capped, hop, refill, hint: game.marketHint('thansuong', nd), hint2: nd2.hop.has('thansuong'), lock2: nd2.hopLock.get('thansuong') === 'caong', w: nd.w, W: { ...MARKET_W }, hopOut: nd.hop.has('chodo'),
      hop3: [...nd3.hop], hop4: [...nd4.hop], noDoi: !('doi' in MARKET_W) && typeof game.summonList === 'undefined' && typeof suggestDeck === 'undefined' };
  });
  ok(r.capped === 0 && r.refill === 0, 'tướng đã đủ bản sao (★★★) không ra nữa — cả đổi chợ lẫn thẻ bù');
  ok(r.hint === 'hop' && r.w.thansuong === r.W.hop && r.w.nguphu === r.W.hop && r.w.xathu === 1 && r.w.chodo === 1 && r.W.hop === 8 && r.W.ghep === 3.5, `trọng số (cho-6-the): nguyên liệu công thức đang theo ×${r.W.hop} (cả Ngư Phủ đang ghép dở), còn lại ×1 ${JSON.stringify(r.w)}`);
  ok(r.noDoi, 'đã bỏ đội ưu tiên: không còn MARKET_W.doi / summonList / suggestDeck');
  ok(!r.hopOut, 'chưa sở hữu Lý Ngư → Chèo Đò không được ưu tiên hợp thể');
  ok(!r.hint2 && r.lock2, 'chưa mở khoá tướng đích: không ưu tiên nguyên liệu, chỉ gắn nhãn khoá (hopLock → Cá Ông)');
  ok(r.hop3.length >= 1 && r.hop3.length <= 2 * 2, `sở hữu mọi Tím: chỉ nguyên liệu của tối đa 2 công thức đang theo được ưu tiên (${r.hop3})`);
  ok(r.hop4.includes('thansuong') && r.hop4.includes('nguphu') && r.hop4.length <= 4, `có Thần Sương ★ cạnh Ngư Phủ ★★: Cá Ông (cả 2 bên trên sân) được theo trước (${r.hop4})`);

  // cho-6-the: bảo hiểm HỢP THỂ — đang theo công thức có đích đã mở (Ngư Phủ ★★ → Cá Ông): MỌI lần đổi chợ có Thần Sương,
  // kể cả rng cố định 0.9999 (mỗi thẻ rút ra loại cuối danh sách)
  const q = await page.evaluate(() => {
    for (let s = 0; s < game.heroes.length; s++) game.heroes[s] = null;
    game.owned = new Set([...BASIC_HEROES, fusionFor('nguphu', 'thansuong').to]); game.gold = 1e6;
    game.spawnHero(game.freeSlots()[0], 'nguphu', { tier: 2 });
    game.market = { types: Array(MARKET_SIZE).fill('xathu'), rr: 0, dry: 0, lock: false };
    let hiMiss = 0, lcgMiss = 0, x = 777; const lcg = () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648);
    for (let i = 0; i < 9; i++) { game.market.rr = 0; game.rerollMarket(() => 0.9999); if (!game.market.types.includes('thansuong')) hiMiss++; }
    for (let i = 0; i < 2000; i++) { game.market.rr = 0; game.rerollMarket(lcg); if (!game.market.types.includes('thansuong')) lcgMiss++; }
    return { hiMiss, lcgMiss, need: [...game.marketNeeds().hopNeed].join() };
  });
  ok(q.need === 'thansuong' && q.hiMiss === 0 && q.lcgMiss === 0, `bảo hiểm hợp thể: nguyên liệu thiếu nhất (${q.need}) có mặt ở MỌI lần đổi chợ (rng cố định 9/9, rng có seed 2000/2000)`);

  // bảo hiểm MARKET_PITY cho tướng đang ghép (không theo công thức nào đã mở): rng luôn trả 0.9999 → mỗi thẻ rút ra loại cuối
  // danh sách (không phải tướng cần), nên chuỗi trượt chắc chắn xảy ra; sau đúng MARKET_PITY lần trượt, lần kế phải có tướng cần
  const p = await page.evaluate(() => {
    for (let s = 0; s < game.heroes.length; s++) game.heroes[s] = null;
    game.owned = new Set(BASIC_HEROES); game.gold = 1e6;     // chưa mở tướng Tím nào → không có công thức đang theo
    game.spawnHero(game.freeSlots()[0], 'nguphu', { tier: 2 });
    // chợ hợp lệ, bộ đếm trượt = 0 (không để ensureMarket() rút ngẫu nhiên bằng srand trước vòng lặp → lệch bộ đếm)
    game.market = { types: Array(MARKET_SIZE).fill('xathu'), rr: 0, dry: 0, lock: false };
    const nd = game.marketNeeds(), list = nd.pool.filter((t) => nd.w[t] > 0);
    const hi = () => 0.9999, seq = [];
    for (let i = 0; i < 9; i++) { game.market.rr = 0; game.rerollMarket(hi); seq.push({ hit: game.market.types.includes('nguphu'), dry: game.market.dry }); }
    let x = 12345; const lcg = () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648);
    let dry = 0, maxDry = 0, forced = 0;
    for (let i = 0; i < 2000; i++) { game.market.rr = 0; const d0 = game.market.dry; game.rerollMarket(lcg); const hit = game.market.types.some((t) => nd.top.has(t)); if (d0 >= MARKET_PITY) { forced++; if (!hit) return { bad: i }; } dry = hit ? 0 : dry + 1; maxDry = Math.max(maxDry, dry); }
    game.owned = null;
    return { pity: MARKET_PITY, last: list[list.length - 1], top: [...nd.top], hop: nd.hop.size, seq, maxDry, forced };
  });
  console.log('  · pity rng cố định:', JSON.stringify(p.seq.map((s) => (s.hit ? 'TRÚNG' : 'trượt'))));
  ok(p.pity === 2 && p.hop === 0 && p.last !== 'nguphu' && p.top.join() === 'nguphu', `tình huống: tướng cần = Ngư Phủ (đang ghép), rng cố định rút toàn ${p.last}`);
  ok(p.seq.map((s) => s.hit).join() === 'false,false,true,false,false,true,false,false,true', 'rng cố định: trượt, trượt → lần 3 chắc chắn ra Ngư Phủ; lặp lại đúng chu kỳ');
  ok(p.seq.map((s) => s.dry).join() === '1,2,0,1,2,0,1,2,0', 'bộ đếm trượt 1, 2 rồi về 0 khi ra tướng cần');
  ok(p.bad === undefined && p.maxDry <= 2, `rng có seed, 2000 lần ↻: không lần nào đủ 2 trượt mà lần sau vẫn trượt (bảo hiểm kích hoạt ${p.forced} lần, trượt liền tối đa ${p.maxDry})`);

  // 🔒 khoá chợ: bấm nút → đầu đợt sau giữ nguyên 6 thẻ, rồi tự mở khoá
  await page.evaluate(() => { game.freshMarket(); ui.clearSel && ui.clearSel(); ui.sig.deck = null; });
  await page.waitForTimeout(150);
  ok(await page.locator('#deck [data-act=mk-lock]').count() === 1, 'có nút 🔒 khoá chợ cạnh ↻');
  const box = await page.locator('#deck [data-act=mk-lock]').boundingBox();
  const rr = await page.locator('#deck [data-act=mk-reroll]').boundingBox();
  ok(rr.width >= 40 && rr.height >= 40, `nút ↻ vẫn đủ lớn (${rr.width}×${rr.height})`);
  ok(box.width >= 36 && box.height >= 40 && box.x >= rr.x + rr.width - 1, `nút 🔒 riêng cạnh ↻, vùng chạm ${Math.round(box.width)}×${Math.round(box.height)} ≥ 36`);
  const before = await page.evaluate(() => [...game.market.types]);
  await page.click('#deck [data-act=mk-lock]'); await page.waitForTimeout(150);
  ok(await page.evaluate(() => game.market.lock === true) && await page.locator('#deck .mk-lk.on').count() === 1, 'bấm 🔒 → chợ khoá, nút sáng');
  ok(await page.locator('#deck .mk-row.locked').count() === 1 && await page.locator('#deck .mk-lk.on span').innerText() === 'Đã\nkhoá', 'đang khoá: hàng thẻ có viền khoá, nút ghi "Đã khoá"');
  await page.screenshot({ path: path.join(SHOT, 'khoa-cho-844x390.png'), clip: { x: 0, y: 390 - 110, width: 844, height: 110 } });
  const w1 = await page.evaluate(() => { game.startWave(); game.running = false; return { t: [...game.market.types], lock: game.market.lock, rr: game.market.rr }; });
  ok(JSON.stringify(w1.t) === JSON.stringify(before) && w1.lock === false && w1.rr === 0, 'sang đợt sau: giữ nguyên 6 thẻ, tự mở khoá, giá ↻ về 10');
  const w2 = await page.evaluate(() => { game.toggleMarketLock(); game.gold = 1000; game.rerollMarket(); return { lock: game.market.lock, rr: game.market.rr }; });
  ok(w2.lock === false && w2.rr === 1, 'đổi ↻ khi đang khoá: rút hàng mới và mở khoá');
  // bảo hiểm qua giao diện: bấm ↻ nhiều lần, nguyên liệu thiếu không trượt quá 2 lần liền
  const pity = await page.evaluate(() => {
    for (let s = 0; s < game.heroes.length; s++) game.heroes[s] = null;
    game.owned = new Set([...BASIC_HEROES, fusionFor('nguphu', 'thansuong').to]);
    game.spawnHero(game.freeSlots()[0], 'nguphu', { tier: 2 }); ui.sig.deck = null; return true; });
  let dry = 0, maxDry = 0;
  for (let i = 0; i < 30; i++) {
    await page.evaluate(() => { game.gold = 1e5; game.market.rr = 0; });
    await page.click('#deck [data-act=mk-reroll]');
    const hit = await page.evaluate(() => game.market.types.includes('thansuong'));
    dry = hit ? 0 : dry + 1; maxDry = Math.max(maxDry, dry);
  }
  ok(pity && maxDry === 0, `bấm ↻ 30 lần: lần nào cũng có Thần Sương (nguyên liệu Cá Ông, đích đã mở) — trượt liền ${maxDry}`);
  // nhãn "hợp thể" trên thẻ
  await page.evaluate(() => { game.spawnHero(game.freeSlots()[0], 'thansuong', { tier: 1 }); game.spawnHero(game.freeSlots()[0], 'nguphu', { tier: 1 }); game.market.types = ['thansuong', 'xathu', 'lucsi', 'nguphu']; ui.sig.deck = null; });
  await page.waitForTimeout(150);
  ok(await page.locator('#deck .mk-card[data-mk="0"].hop .cost .hp').innerText() === 'hợp', 'thẻ nguyên liệu còn thiếu có nhãn "hợp" ở thanh giá');
  const lab = await page.evaluate(() => { const c = document.querySelector('#deck .mk-card[data-mk="0"]'); const im = c.querySelector(':scope > img').getBoundingClientRect(); const rs = [...c.querySelectorAll('.tw,.hp')].map((e) => e.getBoundingClientRect()); return rs.length === 2 && rs.every((r) => r.top >= im.bottom - 4) && rs[0].right <= rs[1].left; });
  ok(lab, 'thẻ vừa ghép vừa hợp: 2 nhãn nằm ở thanh giá dưới mặt tướng, không chồng nhau');
  ok(await page.locator('#deck .mk-card[data-mk="1"] .hp').count() === 0, 'thẻ thường không có nhãn');
  // cho-6-the: nguyên liệu của công thức có tướng đích CHƯA mở khoá → ổ khoá + lời nhắc "Mở ở Anh Hùng"
  const lk = await page.evaluate(() => {
    const f = FUSION.find((x) => !game.ownsHero(x.to) && BASIC_HEROES.includes(x.a) && BASIC_HEROES.includes(x.b) && ![x.a, x.b].some((t) => ['nguphu', 'thansuong'].includes(t)));
    game.spawnHero(game.freeSlots()[0], f.a, { tier: 1 });
    game.market.types[5] = f.b; ui.sig.deck = null; ui.updateDeck();
    const c = document.querySelector('#deck .mk-card[data-mk="5"]');
    return { cls: c.className, hl: !!c.querySelector('.cost .hl'), tip: c.getAttribute('title'), to: HEROES[f.to].name, b: f.b };
  });
  ok(/hoplk/.test(lk.cls) && lk.hl && lk.tip.includes('Mở ở Anh Hùng') && lk.tip.includes(lk.to), `nguyên liệu ${lk.b} của ${lk.to} (chưa mở): thẻ có ổ khoá, gợi ý "Mở ở Anh Hùng · 900"`);
  await page.evaluate(() => { game.flags.hopLockTip = false; });
  await page.click('#deck .mk-card[data-mk="5"]'); await page.waitForTimeout(900);
  ok((await page.locator('#toast, .toast').allInnerTexts()).join(' ').includes('Anh Hùng'), 'mua nguyên liệu của tướng chưa mở → nhắc đi mở khoá ở Anh Hùng');
  await page.screenshot({ path: path.join(SHOT, 'nhan-hop-the-844x390.png'), clip: { x: 0, y: 390 - 110, width: 844, height: 110 } });
  ok(errors.length === 0, 'không lỗi trang ' + errors.join(' | '));
  await browser.close();
  console.log('ti-le.test.js: OK');
}
main().catch((e) => { console.error(e); process.exit(1); });
