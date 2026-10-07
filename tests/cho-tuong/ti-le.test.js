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
  ok(C.need >= 60 && C.need <= 85, `thiếu nguyên liệu hợp thể: ra đúng nguyên liệu ${C.need}% (v179 ~50%)`);
  ok(D.board >= 90 && D.maxDry <= 3, `giữa trận, sở hữu mọi tướng Tím: vẫn ra tướng đang có ${D.board}% (giới hạn nguyên liệu hợp thể ưu tiên cùng lúc), trượt liền tối đa ${D.maxDry}`);
  ok(C.maxNeedDry <= 2, `thiếu nguyên liệu: bảo hiểm — trượt liền tối đa ${C.maxNeedDry} ≤ 2 lần`);
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
    // sở hữu MỌI tướng Tím: nhiều công thức cùng gần xong → tối đa MARKET_HOP.max loại, ≤ MARKET_HOP.off loại chưa có trên sân,
    // ưu tiên nguyên liệu đã có trên sân (Thần Sương ★ cạnh Ngư Phủ ★★)
    game.owned = null;
    const nd3 = game.marketNeeds();
    game.spawnHero(game.freeSlots()[0], 'thansuong', { tier: 1 });
    const nd4 = game.marketNeeds();
    return { capped, hop, refill, hint: game.marketHint('thansuong', nd), hint2: nd2.hop.has('thansuong'), w: nd.w, hopOut: nd.hop.has('chodo'),
      hop3: [...nd3.hop], hop4: [...nd4.hop], noDoi: !('doi' in MARKET_W) && typeof game.summonList === 'undefined' && typeof suggestDeck === 'undefined' };
  });
  ok(r.capped === 0 && r.refill === 0, 'tướng đã đủ bản sao (★★★) không ra nữa — cả đổi chợ lẫn thẻ bù');
  ok(r.hint === 'hop' && r.w.thansuong === 12 && r.w.nguphu === 5 && r.w.xathu === 1 && r.w.chodo === 1, `trọng số: nguyên liệu thiếu ×12, đang ghép ×5, còn lại ×1 (không còn đội ưu tiên) ${JSON.stringify(r.w)}`);
  ok(r.noDoi, 'đã bỏ đội ưu tiên: không còn MARKET_W.doi / summonList / suggestDeck');
  ok(!r.hopOut, 'chưa sở hữu Lý Ngư → Chèo Đò không được ưu tiên hợp thể');
  ok(!r.hint2, 'chưa sở hữu tướng đích thì không ưu tiên nguyên liệu');
  ok(r.hop3.length === 1 && !r.hop3.includes('thansuong'), `sở hữu mọi Tím, chưa có nguyên liệu nào trên sân: chỉ 1 nguyên liệu được ưu tiên (${r.hop3}) — bên kia ★★★ đứng trước ★★`);
  ok(r.hop4.length === 2 && r.hop4[0] === 'thansuong', `có Thần Sương ★ trên sân: nguyên liệu đã có trên sân đứng đầu (${r.hop4}), tối đa 2 loại`);

  // bảo hiểm MARKET_PITY với rng cố định: rng luôn trả 0.9999 → mỗi thẻ rút ra loại cuối danh sách (không phải tướng cần),
  // nên chuỗi trượt chắc chắn xảy ra; sau đúng MARKET_PITY lần trượt, lần kế phải có tướng cần (rồi đếm lại từ đầu)
  const p = await page.evaluate(() => {
    for (let s = 0; s < game.heroes.length; s++) game.heroes[s] = null;
    game.owned = new Set([...BASIC_HEROES, 'caong']); game.gold = 1e6;
    game.spawnHero(game.freeSlots()[0], 'nguphu', { tier: 2 });       // cần Thần Sương (Cá Ông)
    // chợ hợp lệ, bộ đếm trượt = 0 (không để ensureMarket() rút ngẫu nhiên bằng srand trước vòng lặp → lệch bộ đếm)
    game.market = { types: ['xathu', 'xathu', 'xathu', 'xathu'], rr: 0, dry: 0, lock: false };
    const nd = game.marketNeeds(), list = nd.pool.filter((t) => nd.w[t] > 0);
    const hi = () => 0.9999, seq = [];
    for (let i = 0; i < 9; i++) { game.rerollMarket(hi); seq.push({ hit: game.market.types.includes('thansuong'), dry: game.market.dry }); }
    // cùng tình huống, rng có seed (LCG) cố định: mọi lần đủ MARKET_PITY trượt thì lần kế phải trúng
    let x = 12345; const lcg = () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648);
    let dry = 0, maxDry = 0, forced = 0;
    for (let i = 0; i < 2000; i++) { game.market.rr = 0; const d0 = game.market.dry; game.rerollMarket(lcg); const hit = game.market.types.some((t) => nd.top.has(t)); if (d0 >= MARKET_PITY) { forced++; if (!hit) return { bad: i }; } dry = hit ? 0 : dry + 1; maxDry = Math.max(maxDry, dry); }
    return { pity: MARKET_PITY, last: list[list.length - 1], top: [...nd.top], seq, maxDry, forced };
  });
  console.log('  · pity rng cố định:', JSON.stringify(p.seq.map((s) => (s.hit ? 'TRÚNG' : 'trượt'))));
  ok(p.pity === 2 && p.last !== 'thansuong' && p.top.join() === 'thansuong', `tình huống: tướng cần = Thần Sương, rng cố định rút toàn ${p.last}`);
  ok(p.seq.map((s) => s.hit).join() === 'false,false,true,false,false,true,false,false,true', 'rng cố định: trượt, trượt → lần 3 chắc chắn ra Thần Sương; lặp lại đúng chu kỳ');
  ok(p.seq.map((s) => s.dry).join() === '1,2,0,1,2,0,1,2,0', 'bộ đếm trượt 1, 2 rồi về 0 khi ra tướng cần');
  ok(p.bad === undefined && p.maxDry <= 2 && p.forced > 0, `rng có seed, 2000 lần ↻: không lần nào đủ 2 trượt mà lần sau vẫn trượt (bảo hiểm kích hoạt ${p.forced} lần, trượt liền tối đa ${p.maxDry})`);

  // 🔒 khoá chợ: bấm nút → đầu đợt sau giữ nguyên 4 thẻ, rồi tự mở khoá
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
  await page.evaluate(() => { game.spawnHero(game.freeSlots()[0], 'thansuong', { tier: 1 }); game.spawnHero(game.freeSlots()[0], 'nguphu', { tier: 1 }); game.market.types = ['thansuong', 'xathu', 'lucsi', 'nguphu']; ui.sig.deck = null; });
  await page.waitForTimeout(150);
  ok(await page.locator('#deck .mk-card[data-mk="0"].hop .cost .hp').innerText() === 'hợp', 'thẻ nguyên liệu còn thiếu có nhãn "hợp" ở thanh giá');
  const lab = await page.evaluate(() => { const c = document.querySelector('#deck .mk-card[data-mk="0"]'); const im = c.querySelector(':scope > img').getBoundingClientRect(); const rs = [...c.querySelectorAll('.tw,.hp')].map((e) => e.getBoundingClientRect()); return rs.length === 2 && rs.every((r) => r.top >= im.bottom - 4) && rs[0].right <= rs[1].left; });
  ok(lab, 'thẻ vừa ghép vừa hợp: 2 nhãn nằm ở thanh giá dưới mặt tướng, không chồng nhau');
  ok(await page.locator('#deck .mk-card[data-mk="1"] .hp').count() === 0, 'thẻ thường không có nhãn');
  await page.screenshot({ path: path.join(SHOT, 'nhan-hop-the-844x390.png'), clip: { x: 0, y: 390 - 110, width: 844, height: 110 } });
  ok(errors.length === 0, 'không lỗi trang ' + errors.join(' | '));
  await browser.close();
  console.log('ti-le.test.js: OK');
}
main().catch((e) => { console.error(e); process.exit(1); });
