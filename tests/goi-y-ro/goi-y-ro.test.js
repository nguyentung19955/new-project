// Test claude/goi-y-ro: SÁNG GỢI Ý trên thẻ chợ rõ hơn (màu theo loại + dấu góc + nhịp thở) và vòng/mũi tên trên sân.
// Chạy: node tests/goi-y-ro/goi-y-ro.test.js
const path = require('path');
const fs = require('fs');
const { open, enter, ok, noPixel } = require('../cho-tuong/helpers');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });

// màu điểm ảnh tại (x,y) của ảnh chụp phần tử (PNG → canvas trong trang)
const pixelAt = (page, buf, pts) => page.evaluate(async ([b64, pts]) => {
  const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode();
  const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
  const x = c.getContext('2d'); x.drawImage(im, 0, 0);
  return pts.map(([px, py]) => Array.from(x.getImageData(px, py, 1, 1).data.slice(0, 3)));
}, [buf.toString('base64'), pts]);
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

async function run(pixel, w, h) {
  const tag = `${pixel ? 'pixel' : 'pixel0'}-${w}x${h}`;
  const { browser, page, errors } = await open(w, h, {}, pixel ? null : noPixel());
  await enter(page, 0);
  // dựng chợ: thẻ 1 = tướng ★ đang có (ghép), thẻ 3/4 = nguyên liệu hợp thể Tím/Vàng (giả lập gợi ý), còn lại loại chưa có
  const info = await page.evaluate(() => {
    game.running = false; game.gold = 3000;
    const a = game.spawnHero(game.freeSlots()[0], 'thaymo', { tier: 1 });
    const on = new Set(game.heroes.filter(Boolean).map((x) => x.type));
    const free = BASIC_HEROES.filter((t) => !on.has(t));
    game.market.types = [free[0], 'thaymo', free[1], free[2], free[3], free[4]];
    const fe = FUSION.find((f) => HEROES[f.to].legend === 'epic'), fl = FUSION.find((f) => HEROES[f.to].legend === 'legendary');
    const mn = game.marketNeeds.bind(game), t3 = free[2], t4 = free[3];
    game.marketNeeds = () => { const nd = mn(); for (const x of [free[0], free[1], free[4]]) { nd.hop.delete(x); nd.hopLock.delete(x); }
      nd.hop.add(t3); nd.hopTo.set(t3, fe.to); nd.hop.add(t4); nd.hopTo.set(t4, fl.to); nd.hopLock.delete(t3); nd.hopLock.delete(t4); return nd; };
    ui.sel = -1; ui.sig.deck = null;
    return { slot: a.slot };
  });
  await page.waitForTimeout(400);
  const cls = await page.$$eval('#deck .mk-card', (cs) => cs.map((c) => ({ c: c.className, gy: (c.querySelector('.mk-gy') || {}).textContent || '' })));
  ok(/\btwin\b/.test(cls[1].c) && cls[1].gy === '▲★', `[${tag}] thẻ trùng tướng ★ trên sân: lớp twin + dấu góc ▲★`);
  ok([0, 2, 5].every((i) => !/\b(twin|hop)\b/.test(cls[i].c) && !cls[i].gy), `[${tag}] thẻ loại chưa có trên sân: không sáng, không dấu góc`);
  ok(/\bhop-e\b/.test(cls[3].c) && cls[3].gy === '⇧' && /\bhop-l\b/.test(cls[4].c) && cls[4].gy === '⇧', `[${tag}] nguyên liệu hợp thể: hop-e (Tím) / hop-l (Vàng) + dấu ⇧`);
  const gy = await page.$$eval('#deck .mk-card', (cs) => cs.map((c) => getComputedStyle(c).getPropertyValue('--gy').trim()));
  ok(gy[1] && gy[3] && gy[4] && new Set([gy[1], gy[3], gy[4]]).size === 3, `[${tag}] 3 màu gợi ý khác nhau (ghép ${gy[1]}, Tím ${gy[3]}, Vàng ${gy[4]})`);
  const anim = await page.$eval('#deck .mk-card.twin', (c) => { const s = getComputedStyle(c, '::before'); return { n: s.animationName, d: parseFloat(s.animationDuration), z: +s.zIndex }; });
  ok(anim.n === 'mkGy' && anim.d >= 1.2 && anim.d <= 1.5 && anim.z >= 3, `[${tag}] viền gợi ý thở ${anim.d}s (1,2–1,5 s), nằm trên khung thẻ (z ${anim.z})`);
  // tương phản: dừng nhịp ở đỉnh sáng, so điểm ảnh viền trong của thẻ gợi ý với cùng chỗ trên thẻ thường
  await page.evaluate(() => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = 0; }));
  const boxes = await page.$$eval('#deck .mk-card', (cs) => cs.map((c) => { const r = c.getBoundingClientRect(); return [r.width, r.height]; }));
  const shot = async (i) => page.locator('#deck .mk-card').nth(i).screenshot();
  const [bw, bh] = boxes[0], k = bw / 66, pt = [[Math.round(3 * k), Math.round(bh * 0.45)], [Math.round(bw - 4 * k), Math.round(bh * 0.45)]];
  const plain = await pixelAt(page, await shot(0), pt);
  for (const [i, nm] of [[1, 'ghép'], [3, 'hợp Tím'], [4, 'hợp Vàng']]) {
    const p = await pixelAt(page, await shot(i), pt);
    const d = Math.min(dist(p[0], plain[0]), dist(p[1], plain[1])), cr = Math.min(contrast(p[0], plain[0]), contrast(p[1], plain[1]));
    ok(d > 90 && cr > 1.8, `[${tag}] viền thẻ ${nm} khác hẳn thẻ thường (khoảng màu ${Math.round(d)}, tương phản ${cr.toFixed(2)})`);
  }
  await page.screenshot({ path: path.join(SHOT, `cho-${tag}.png`) });
  // trên sân: tướng sắp ghép có vòng + mũi tên (chỉ khi đang xem chợ)
  const tw = await page.evaluate((s) => { const a = twinMarks(null); ui.sel = s; const b = twinMarks(null); ui.sel = -1; return { a: [...a].map((h) => h.slot), b: b.size }; }, info.slot);
  ok(tw.a.length === 1 && tw.a[0] === info.slot && tw.b === 0, `[${tag}] vòng/mũi tên ghép trên tướng ô ${info.slot}; tắt khi đang chọn tướng`);
  // bỏ tướng cùng loại → thẻ hết sáng ghép
  await page.evaluate((s) => { game.heroes[s] = null; ui.sig.deck = null; }, info.slot);
  await page.waitForTimeout(300);
  ok(await page.$eval('#deck .mk-card[data-mk="1"]', (c) => !c.classList.contains('twin') && !c.querySelector('.mk-gy')), `[${tag}] không còn tướng cùng loại → thẻ hết sáng ghép`);
  ok(!errors.length, `[${tag}] không lỗi JS ${errors.join(' | ')}`);
  await browser.close();
}

(async () => {
  await run(true, 844, 390);
  await run(false, 844, 390);
  await run(true, 667, 375);
  await run(true, 1920, 934);
  console.log('goi-y-ro: OK');
})().catch((e) => { console.error(e); process.exit(1); });
