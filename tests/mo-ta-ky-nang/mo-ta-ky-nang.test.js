// Test v182: rê chuột (máy tính) / giữ tay ~0,35 giây (điện thoại) lên ô kỹ năng → khung mô tả: tên, mô tả có số liệu,
// hiệu lực cấp này ➜ cấp sau, hồi chiêu, điều kiện mở, giá nâng. Khung nằm gọn trong màn, không che ô đang chỉ,
// tự đổi trên / dưới; chạm nhanh vẫn nâng kỹ năng; game không dừng.
// Kiểm tra 1920×934, 1018×612, 844×390, 667×375, dọc 390×844 (giao diện xoay) ở: thanh tướng trong trận, Cây kỹ năng, Anh Hùng, Ấn Phù, Thần Khí.
// Chạy: node tests/mo-ta-ky-nang/mo-ta-ky-nang.test.js
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('../cho-tuong/helpers');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const SIZES = [[1920, 934], [1018, 612], [844, 390], [667, 375], [390, 844]];   // 390×844: màn dọc, #wrap xoay 90°

const center = (page, sel) => page.evaluate((sel) => {
  const el = document.querySelector(sel); if (!el) return null;
  const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2];
}, sel);
// trạng thái khung mô tả so với ô đang chỉ
const tipState = (page, sel) => page.evaluate((sel) => {
  const t = document.querySelector('#sk-tip'), el = document.querySelector(sel);
  if (!t || t.hidden) return { shown: false };
  const a = t.getBoundingClientRect();
  const b = [el, ...el.children].map((x) => x.getBoundingClientRect()).filter((x) => x.width && x.height).reduce((m, x) => ({ left: Math.min(m.left, x.left), top: Math.min(m.top, x.top), right: Math.max(m.right, x.right), bottom: Math.max(m.bottom, x.bottom) }));
  const hit = (b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
  const over = hit(b);
  // vùng nên tránh (cả cột / thẻ chứa ô): tên vùng nào khung còn đè
  const overZone = (el.dataset.tipAvoid || '').split('|').filter(Boolean).filter((q) => el.closest(q) && hit(el.closest(q).getBoundingClientRect()));
  return { shown: true, text: t.innerText, side: t.dataset.side, over, overZone,
    inside: a.left >= -0.5 && a.top >= -0.5 && a.right <= innerWidth + 0.5 && a.bottom <= innerHeight + 0.5,
    fits: t.scrollHeight <= t.clientHeight + 1 };
}, sel);

async function hover(page, sel, tag, name, shot) {
  await settle(page);
  await page.mouse.move(2, 2);
  await page.evaluate((sel) => { const el = document.querySelector(sel); if (el) el.scrollIntoView({ block: 'nearest' }); }, sel);
  await page.waitForTimeout(150);
  const c = await center(page, sel); ok(!!c, `[${tag}] ${name}: có ô ${sel}`);
  await page.mouse.move(c[0], c[1], { steps: 3 }); await page.waitForTimeout(350);
  // máy bận: chờ khung hiện (tối đa 3 giây) thay vì tin 350 ms là đủ
  let s = await tipState(page, sel);
  // (thanh tướng dựng lại đúng trong 150 ms chờ hiện → ô cũ rời trang, trình duyệt không báo pointerover cho ô mới khi chuột đứng yên;
  //  máy bận dễ trúng → rê chuột ra ngoài rồi vào lại như người dùng)
  for (let k = 0; k < 20 && !s.shown; k++) {
    await page.waitForTimeout(200); s = await tipState(page, sel);
    if (!s.shown && k % 3 === 2) { await page.mouse.move(2, 2); await page.mouse.move(c[0], c[1], { steps: 3 }); }
  }
  ok(s.shown, `[${tag}] ${name}: rê chuột → hiện mô tả`);
  ok(s.inside, `[${tag}] ${name}: khung nằm trong màn`);
  ok(!s.over, `[${tag}] ${name}: không che ô đang chỉ (đặt phía ${s.side})`);
  if (shot) await page.screenshot({ path: path.join(SHOT, `${tag}-${shot}.png`) });
  return s;
}

// máy bận (chạy song song): đọc lại tới khi đúng (tối đa 3 giây) thay vì tin một lần chờ cố định là đủ
async function until(read, good, ms = 3000) {
  const end = Date.now() + ms; let v = await read();
  while (!good(v) && Date.now() < end) { await new Promise((r) => setTimeout(r, 150)); v = await read(); }
  return v;
}
// máy bận: ảnh tải chậm, mỗi ảnh xong tăng assetVersion → thanh tướng dựng lại; dựng lại đúng lúc chờ hiện mô tả (0,15 / 0,35 giây)
// thì ô cũ rời trang và mô tả không hiện. Chờ assetVersion đứng yên 0,8 giây (tối đa 15 giây) trước khi rê / giữ tay.
async function settle(page) {
  await page.evaluate(() => new Promise((res) => {
    let v = assetVersion, t = performance.now(); const end = t + 15000;
    const f = () => { const n = performance.now(); if (assetVersion !== v) { v = assetVersion; t = n; } if (n - t >= 800 || n > end) res(); else setTimeout(f, 100); };
    f();
  }));
}
async function touch(cdp, type, x, y) {
  await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
}

async function run(w, h) {
  const tag = `${w}x${h}`;
  const { browser, page, errors } = await open(w, h, { owned: ['giong'], tuvi: { giong: 99999 }, kho: 99999 });
  await enter(page, 0, true);
  const slot = await page.evaluate(() => {
    game.gold = 5000; const [a] = game.freeSlots(); const hh = game.spawnHero(a, 'lucsi'); hh.summonT = 0;
    for (let k = 0; k < 4; k++) game.levelUp ? game.levelUp(hh) : 0;
    hh.level = Math.max(hh.level, 5); hh.skillPts = Math.max(hh.skillPts, 3);
    ui.sel = a; ui.spot = -1; ui.armed = null; ui.sig.deck = null; ui.updateDeck();
    game.running = true; if (!game.waveActive) game.startWave();
    return a;
  });
  await page.waitForTimeout(300);
  const SK = (i) => `#deck [data-act=cmd-skill][data-i="${i}"]`;
  const lv = (i) => page.evaluate((i) => skillLevel(game.heroes[ui.sel], i), i);

  // 1) thanh tướng trong trận: rê chuột ô W (chưa mở) → mô tả đủ mục, đặt phía trên ô, game vẫn chạy
  const t0 = await page.evaluate(() => game.time || game.t || 0);
  const s1 = await hover(page, SK(1), tag, 'Thanh tướng ô W', 'deck-hover');
  ok(/W · /.test(s1.text) && /Hiệu lực/.test(s1.text) && /Mở khóa/.test(s1.text) && /Giá mở/.test(s1.text), `[${tag}] mô tả ô W có tên, hiệu lực, điều kiện mở, giá`);
  ok(s1.side === 'top', `[${tag}] thanh đáy → khung tự đặt phía trên (${s1.side})`);
  ok(s1.fits, `[${tag}] mô tả không bị cắt chữ`);
  const s0 = await hover(page, SK(0), tag, 'Thanh tướng ô Q');
  ok(/cấp 1: 100%.*cấp 2: 125%/s.test(s0.text) && /Giá nâng/.test(s0.text) && /Lên cấp 2/.test(s0.text), `[${tag}] ô Q: số liệu cấp 1 ➜ cấp 2, điều kiện, giá nâng`);
  await page.waitForTimeout(400);
  const run1 = await page.evaluate(() => ({ r: game.running, t: game.time || game.t || 0 }));
  ok(run1.r && (run1.t > t0 || !t0), `[${tag}] game không dừng khi đang xem mô tả`);
  await page.mouse.move(2, h / 2); await page.waitForTimeout(150);
  ok(!(await until(() => tipState(page, SK(0)), (v) => !v.shown)).shown, `[${tag}] rời chuột → ẩn mô tả`);

  // 2) bấm chuột vẫn nâng như cũ (khung đang hiện cũng không chặn)
  const q0 = await lv(0);
  const cq = await center(page, SK(0)); await page.mouse.move(cq[0], cq[1]); await page.waitForTimeout(300);
  await page.mouse.click(cq[0], cq[1]); await page.waitForTimeout(450);
  await until(() => lv(0), (v) => v === q0 + 1);
  ok((await lv(0)) === q0 + 1, `[${tag}] bấm chuột ô Q vẫn nâng kỹ năng (${q0} → ${await lv(0)})`);
  const s2 = await until(() => tipState(page, SK(0)), (v) => v.shown && new RegExp(`cấp ${q0 + 1}/`).test(v.text));
  ok(s2.shown && new RegExp(`cấp ${q0 + 1}/`).test(s2.text), `[${tag}] mô tả tự cập nhật cấp mới sau khi nâng`);
  await page.mouse.move(2, h / 2); await page.waitForTimeout(150);

  // 3) điện thoại: giữ tay ~0,35 giây → hiện; thả → ẩn, KHÔNG nâng; chạm nhanh → nâng
  const cdp = await page.context().newCDPSession(page);
  // trận đang chạy: ô Q đổi trạng thái hồi chiêu / mana → thanh tướng dựng lại cả hàng; trúng trong 0,35 giây giữ tay thì ô E cũ rời trang
  // và mô tả không hiện (lỗi game đã báo, chưa sửa). Đoạn này chỉ kiểm cử chỉ chạm → tạm dừng trận cho thanh tướng đứng yên.
  await page.evaluate(() => { game.running = false; });
  await settle(page);
  const ce = await center(page, SK(2));
  const e0 = await lv(2), pts0 = await page.evaluate(() => game.heroes[ui.sel].skillPts);
  // máy bận (chạy song song) thì lệnh chạm / đọc trạng thái có thể trễ quá mốc 0,35 giây của game → chỉ kiểm khi đo được thật sự < 0,3 giây
  const tStart = Date.now();
  await touch(cdp, 'touchStart', ce[0], ce[1]); await page.waitForTimeout(200);
  const early = (await tipState(page, SK(2))).shown, dtEarly = Date.now() - tStart;
  if (dtEarly < 300) ok(!early, `[${tag}] giữ 0,2 giây chưa hiện (tránh hiện khi chạm nhanh)`);
  else console.log(`  · [${tag}] máy chậm (${dtEarly} ms) — bỏ kiểm "giữ 0,2 giây chưa hiện"`);
  await page.waitForTimeout(250);
  // máy bận: chờ khung hiện (tối đa 3 giây) thay vì tin 450 ms là đủ
  let s3 = await tipState(page, SK(2));
  for (let k = 0; k < 15 && !s3.shown; k++) { await page.waitForTimeout(200); s3 = await tipState(page, SK(2)); }
  ok(s3.shown && /E · /.test(s3.text), `[${tag}] giữ tay ~0,35 giây → hiện mô tả ô E`);
  ok(s3.inside && !s3.over, `[${tag}] mô tả giữ tay nằm trong màn, không che ngón tay / ô (${s3.side})`);
  ok(/Thả tay để đóng/.test(s3.text), `[${tag}] gợi ý thả tay để đóng`);
  await page.screenshot({ path: path.join(SHOT, `${tag}-deck-giu-tay.png`) });
  await touch(cdp, 'touchEnd'); await page.waitForTimeout(250);
  ok(!(await until(() => tipState(page, SK(2)), (v) => !v.shown)).shown, `[${tag}] thả tay → ẩn mô tả`);
  ok((await lv(2)) === e0 && (await page.evaluate(() => game.heroes[ui.sel].skillPts)) === pts0, `[${tag}] giữ tay xem mô tả không nâng / mở kỹ năng`);
  const cq2 = await center(page, SK(0)); const qa = await lv(0);
  // chạm nhanh: gửi chạm + thả liền một mạch (không chờ giữa 2 lệnh) → trình duyệt nhận cả hai trước mốc 0,35 giây dù máy bận
  await Promise.all([touch(cdp, 'touchStart', cq2[0], cq2[1]), touch(cdp, 'touchEnd')]); await page.waitForTimeout(400);
  await until(() => lv(0), (v) => v === qa + 1);
  ok((await lv(0)) === qa + 1, `[${tag}] chạm nhanh vẫn nâng kỹ năng (${qa} → ${await lv(0)})`);
  ok(!(await tipState(page, SK(0))).shown, `[${tag}] chạm nhanh không hiện mô tả`);
  // giữ rồi kéo ngón tay đi (cuộn) → không hiện
  // (chạm + kéo gửi liền một mạch → kéo luôn tới trước mốc 0,35 giây dù máy bận)
  await Promise.all([touch(cdp, 'touchStart', ce[0], ce[1]), touch(cdp, 'touchMove', ce[0], ce[1] - 60)]); await page.waitForTimeout(400);
  const dragShown = (await tipState(page, SK(2))).shown;
  await touch(cdp, 'touchEnd'); await page.waitForTimeout(200);
  ok(dragShown === false, `[${tag}] kéo ngón tay đi → không hiện mô tả`);
  await page.evaluate(() => { game.running = true; });

  // 4) Cây kỹ năng: ô đầu cột (giữa màn) → mô tả, không che
  await page.evaluate(() => { ui.openScreen('skills'); }); await page.waitForTimeout(300);
  const s4 = await hover(page, '#screen .col[data-i="3"] .hd', tag, 'Cây kỹ năng ô R', 'cay-ky-nang');
  ok(/R · /.test(s4.text) && /Mở khóa|Lên cấp/.test(s4.text), `[${tag}] Cây kỹ năng: mô tả ô R`);
  for (const i of [0, 1]) {
    const sq = await hover(page, `#screen .col[data-i="${i}"] .hd`, tag, `Cây kỹ năng ô ${'QW'[i]}`, i ? '' : 'cay-ky-nang-q');
    ok(!sq.overZone.length, `[${tag}] Cây kỹ năng ô ${'QW'[i]}: khung không đè các dòng cấp của chính cột (${sq.side})`);
  }
  await page.mouse.move(2, 2);
  await page.evaluate(() => ui.closeScreen()); await page.waitForTimeout(200);

  // 5) Anh Hùng: ô kỹ năng (không có tướng trên sân → xem như cấp 1, liệt kê cấp mở)
  await page.evaluate(() => ui.showRoster('giong', true)); await page.waitForTimeout(400);
  const s5 = await hover(page, '#roster .ro-sk [data-skr="giong:0"]', tag, 'Anh Hùng ô Q', 'anh-hung');
  ok(/Q · /.test(s5.text) && /Các cấp/.test(s5.text) && /Hiệu lực/.test(s5.text), `[${tag}] Anh Hùng: mô tả có các cấp mở & hiệu lực`);
  const s5b = await hover(page, '#roster .ro-sk [data-skr="giong:3"]', tag, 'Anh Hùng ô R');
  ok(/Hồi chiêu|Nội tại/.test(s5b.text), `[${tag}] Anh Hùng ô R: có hồi chiêu / loại`);
  ok(!(await page.evaluate(() => document.querySelector('#roster .ro-sk [data-tip]'))), `[${tag}] Anh Hùng: bỏ mô tả cũ (data-tip) — dùng mô tả mới`);

  // 6) Thần Khí: tiêu đề hệ (trên cùng) → khung tự đặt phía dưới
  await page.evaluate(() => { ui.legacyHero = 'giong'; ui.renderLegacy(); }); await page.waitForTimeout(300);
  const s6 = await hover(page, '#roster .lg-sys .lg-h', tag, 'Thần Khí', 'than-khi');
  ok(/Tối đa/.test(s6.text) && /Còn cần/.test(s6.text) && /Đang có/.test(s6.text), `[${tag}] Thần Khí: mức tối đa, Ngân khố còn cần / đang có`);
  ok(!/Mốc cấp|Hiện tại/.test(s6.text), `[${tag}] Thần Khí: không lặp nội dung đã có trên thẻ (mốc, hiện tại)`);
  ok(s6.side !== 'top', `[${tag}] Thần Khí (sát mép trên) → khung tự đổi xuống dưới / bên (${s6.side})`);
  ok(!s6.overZone.length, `[${tag}] Thần Khí: khung không đè chính thẻ hệ (${s6.side})`);
  await page.mouse.move(2, h / 2);
  await page.evaluate(() => { ui.legacyHero = null; document.querySelector('#roster').hidden = true; }); await page.waitForTimeout(150);

  // 7) Ấn Phù: nút ấn → mô tả cấp kế, điều kiện, giá; bỏ title gốc (không hiện 2 khung)
  await page.evaluate(() => ui.showRunes(true, 'giong')); await page.waitForTimeout(400);
  const s7 = await hover(page, '#runes .rn-node', tag, 'Ấn Phù', 'an-phu');
  ok(/Cấp 1/.test(s7.text) && /Giá/.test(s7.text) && /Điều kiện/.test(s7.text), `[${tag}] Ấn Phù: cấp kế, điều kiện, giá`);
  ok(!s7.overZone.includes('.rn-col'), `[${tag}] Ấn Phù: khung không đè các hàng ấn cùng nhánh (${s7.side}, đè: ${s7.overZone.join(',') || 'không'})`);
  ok(!(await page.evaluate(() => document.querySelector('#runes .rn-node[title]'))), `[${tag}] Ấn Phù: không còn title gốc trùng mô tả`);

  ok(!errors.length, `[${tag}] không lỗi JS ${errors.join(' | ')}`);
  await browser.close();
}

(async () => {
  for (const [w, h] of SIZES) { console.log(`— ${w}×${h}`); await run(w, h); }
  console.log('OK: mô tả kỹ năng khi rê chuột / giữ tay');
})().catch((e) => { console.error(e); process.exit(1); });
