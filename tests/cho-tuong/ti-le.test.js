// Test chợ có chủ đích (v180): tỉ lệ ra tướng cần, bảo hiểm, giới hạn bản sao, 🔒 khoá chợ, nhãn "hợp thể".
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
  const A = out['dau-tran'], B = out['giua-tran'], C = out['thieu-hop-the'];
  ok(A.board >= 50 && A.board <= 80, `đầu trận: ra tướng đang có ${A.board}% (v179 ~51%, không quá dễ ≤ 80%)`);
  ok(A.kinds === 20 && A.outDeck >= 30, `chợ ra mọi tướng Thường: ${A.kinds} loại, ${A.outDeck}% thẻ ngoài đội ưu tiên`);
  ok(A.maxDry <= 2, `đầu trận: bảo hiểm — trượt liền tối đa ${A.maxDry} ≤ 2 lần`);
  ok(B.board >= 93, `giữa trận: ra tướng đang có ${B.board}% (dù chợ 20 loại)`);
  ok(C.need >= 60 && C.need <= 85, `thiếu nguyên liệu hợp thể: ra đúng nguyên liệu ${C.need}% (v179 ~50%)`);
  ok(C.maxNeedDry <= 2, `thiếu nguyên liệu: bảo hiểm — trượt liền tối đa ${C.maxNeedDry} ≤ 2 lần`);
  ok(e0.length === 0, 'không lỗi trang khi mô phỏng ' + e0.join(' | '));

  // ---------- luật chợ trong trận thật
  const { browser, page, errors } = await open(844, 390);
  await enter(page, 0);
  const r = await page.evaluate(() => {
    game.running = false; game.owned = null; game.gold = 1e6;
    game.deck = ['nguphu', 'thansuong', 'lactuong', 'lucsi', 'xathu', 'thaymo'];
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
    game.owned = new Set();
    const nd2 = game.marketNeeds();
    game.owned = null;
    return { capped, hop, refill, hint: game.marketHint('thansuong', nd), hint2: nd2.hop.has('thansuong'), w: nd.w, hopOut: nd.hop.has('chodo') };
  });
  ok(r.capped === 0 && r.refill === 0, 'tướng đã đủ bản sao (★★★) không ra nữa — cả đổi chợ lẫn thẻ bù');
  ok(r.hint === 'hop' && r.w.thansuong === 12 && r.w.nguphu === 5 && r.w.xathu === 2 && r.w.chodo === 1, `trọng số: nguyên liệu thiếu ×12, đang ghép ×5, đội ưu tiên ×2, ngoài đội ×1`);
  ok(!r.hopOut, 'nguyên liệu ngoài đội và chưa có trên sân (Chèo Đò → Lý Ngư) không được ưu tiên hợp thể');
  ok(!r.hint2, 'chưa sở hữu tướng đích thì không ưu tiên nguyên liệu');

  // 🔒 khoá chợ: bấm nút → đầu đợt sau giữ nguyên 4 thẻ, rồi tự mở khoá
  await page.evaluate(() => { game.freshMarket(); ui.clearSel && ui.clearSel(); ui.sig.deck = null; });
  await page.waitForTimeout(150);
  ok(await page.locator('#deck [data-act=mk-lock]').count() === 1, 'có nút 🔒 khoá chợ cạnh ↻');
  const box = await page.locator('#deck [data-act=mk-lock]').boundingBox();
  const rr = await page.locator('#deck [data-act=mk-reroll]').boundingBox();
  ok(rr.width >= 40 && rr.height >= 40, `nút ↻ vẫn đủ lớn (${rr.width}×${rr.height})`);
  ok(box.width >= 24 && box.y + box.height > rr.y, `nút 🔒 gắn góc nút ↻ (${box.width}px)`);
  const before = await page.evaluate(() => [...game.market.types]);
  await page.click('#deck [data-act=mk-lock]'); await page.waitForTimeout(150);
  ok(await page.evaluate(() => game.market.lock === true) && await page.locator('#deck .mk-lk.on').count() === 1, 'bấm 🔒 → chợ khoá, nút sáng');
  await page.screenshot({ path: path.join(SHOT, 'khoa-cho-844x390.png'), clip: { x: 0, y: 390 - 110, width: 844, height: 110 } });
  const w1 = await page.evaluate(() => { game.startWave(); game.running = false; return { t: [...game.market.types], lock: game.market.lock, rr: game.market.rr }; });
  ok(JSON.stringify(w1.t) === JSON.stringify(before) && w1.lock === false && w1.rr === 0, 'sang đợt sau: giữ nguyên 4 thẻ, tự mở khoá, giá ↻ về 10');
  const w2 = await page.evaluate(() => { game.toggleMarketLock(); game.gold = 1000; game.rerollMarket(); return { lock: game.market.lock, rr: game.market.rr }; });
  ok(w2.lock === false && w2.rr === 1, 'đổi ↻ khi đang khoá: rút hàng mới và mở khoá');
  // bảo hiểm qua giao diện: bấm ↻ nhiều lần, nguyên liệu thiếu không trượt quá 2 lần liền
  const pity = await page.evaluate(() => {
    for (let s = 0; s < game.heroes.length; s++) game.heroes[s] = null;
    game.spawnHero(game.freeSlots()[0], 'nguphu', { tier: 2 }); ui.sig.deck = null; return true; });
  let dry = 0, maxDry = 0;
  for (let i = 0; i < 30; i++) {
    await page.evaluate(() => { game.gold = 1e5; game.market.rr = 0; });
    await page.click('#deck [data-act=mk-reroll]');
    const hit = await page.evaluate(() => game.market.types.includes('thansuong'));
    dry = hit ? 0 : dry + 1; maxDry = Math.max(maxDry, dry);
  }
  ok(pity && maxDry <= 2, `bấm ↻ 30 lần: Thần Sương (nguyên liệu Cá Ông) trượt liền tối đa ${maxDry} ≤ 2`);
  // nhãn "hợp thể" trên thẻ
  await page.evaluate(() => { game.market.types = ['thansuong', 'xathu', 'lucsi', 'nguphu']; ui.sig.deck = null; });
  await page.waitForTimeout(150);
  ok(await page.locator('#deck .mk-card[data-mk="0"].hop .hp').innerText() === 'hợp thể', 'thẻ nguyên liệu còn thiếu có nhãn "hợp thể"');
  ok(await page.locator('#deck .mk-card[data-mk="1"] .hp').count() === 0, 'thẻ thường không có nhãn');
  await page.screenshot({ path: path.join(SHOT, 'nhan-hop-the-844x390.png'), clip: { x: 0, y: 390 - 110, width: 844, height: 110 } });
  ok(errors.length === 0, 'không lỗi trang ' + errors.join(' | '));
  await browser.close();
  console.log('ti-le.test.js: OK');
}
main().catch((e) => { console.error(e); process.exit(1); });
