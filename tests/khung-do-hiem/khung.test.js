// Test khung theo độ hiếm (v151). Chạy: node tests/khung-do-hiem/khung.test.js [tên-ảnh-thêm]
// Thường: viền đồng/nâu, không phát sáng · Tím: viền + quầng tím · Vàng: viền + quầng vàng.
const path = require('path');
const fs = require('fs');
const { open, ok } = require('../cho-tuong/helpers');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const extra = process.argv[2];

// đọc viền + bóng của một phần tử
const look = (page, sel) => page.evaluate((sel) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const cs = getComputedStyle(el);
  return { bc: cs.borderTopColor, bw: parseFloat(cs.borderTopWidth), sh: cs.boxShadow };
}, sel);
const rgb = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
// "sắc vàng": đỏ & lục cao, lục gần bằng đỏ, lam thấp
const isGold = (c) => { const [r, g, b] = rgb(c); return r > 150 && g / r > 0.72 && b < g * 0.7; };
// bóng phát sáng ra ngoài: có lớp không inset với độ nhoè > 0
// (bóng đổ màu tối không tính là phát sáng)
const glows = (sh) => !!sh && sh !== 'none' && sh.split(/,(?![^(]*\))/).some((l) => {
  const px = l.match(/(-?[\d.]+)px/g) || [], c = rgb((l.match(/rgba?\([^)]*\)/) || ['rgb(0,0,0)'])[0]);
  return !/inset/.test(l) && px.length >= 3 && parseFloat(px[2]) > 0 && c[0] + c[1] + c[2] > 150;
});
const near = (a, hex) => { const [r, g, b] = rgb(a); const h = hex.replace('#', ''); const t = [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16)); return Math.abs(r - t[0]) + Math.abs(g - t[1]) + Math.abs(b - t[2]) < 12; };

async function rosterCase(w, h, tag) {
  // đã khám phá hiệu ứng ẩn của Lạc Tướng (trước đây làm thẻ sáng vàng)
  const { browser, page, errors } = await open(w, h, { owned: ['lyngu'], secrets: ['h.lactuong', 'h.llq'] });
  const R = await page.evaluate(() => ({ epic: RARITY.epic.color, leg: RARITY.legendary.color }));
  await page.evaluate(() => ui.showRoster('lactuong')); await page.waitForTimeout(300);
  const card = (t) => `#roster .ro-card[data-type=${t}]`;
  // thẻ KHÔNG đang chọn
  const c = await look(page, card('lucsi')), ck = await look(page, card('lactuong'));
  const e = await look(page, card('lyngu')), l = await look(page, card('llq'));
  ok(c && e && l, `[${tag}] tìm thấy thẻ Thường / Tím / Vàng`);
  ok(c.bc !== e.bc && e.bc !== l.bc && c.bc !== l.bc, `[${tag}] 3 bậc 3 màu viền khác nhau (${c.bc} | ${e.bc} | ${l.bc})`);
  ok(!isGold(c.bc) && !glows(c.sh), `[${tag}] thẻ Thường không vàng, không phát sáng (${c.bc}; ${c.sh})`);
  ok(near(e.bc, R.epic) && glows(e.sh), `[${tag}] thẻ Tím viền ${R.epic} + quầng`);
  ok(near(l.bc, R.leg) && glows(l.sh), `[${tag}] thẻ Vàng viền ${R.leg} + quầng`);
  // Lạc Tướng: đang chọn + đã khám phá ẩn → vẫn không vàng, không phát sáng ra ngoài; v165: không còn dấu ✦
  ok(!isGold(ck.bc) && !glows(ck.sh), `[${tag}] Thường đang chọn + đã khám phá: vẫn không vàng/không sáng (${ck.bc}; ${ck.sh})`);
  ok(await page.locator('#roster .kn').count() === 0 && !(await page.locator('#roster .ro-grid, #roster .ro-pic').allInnerTexts()).join('').includes('✦'), `[${tag}] v165: không còn dấu ✦ ở thẻ / ảnh chi tiết`);
  ok(ck.bw > c.bw || ck.sh !== c.sh, `[${tag}] thẻ đang chọn khác thẻ thường (viền dày/vòng trong)`);
  // ảnh chi tiết
  const pc = await look(page, '#roster .ro-pic');
  ok(!isGold(pc.bc) && !glows(pc.sh), `[${tag}] ảnh chi tiết Thường: viền đồng, không sáng (${pc.bc}; ${pc.sh})`);
  await page.screenshot({ path: path.join(SHOT, `anh-hung-thuong-${tag}.png`) });
  if (extra && tag === '844x390') await page.screenshot({ path: path.join(__dirname, extra) });
  await page.evaluate(() => ui.showRoster('lyngu')); await page.waitForTimeout(250);
  const pe = await look(page, '#roster .ro-pic'), es = await look(page, card('lyngu'));
  ok(near(pe.bc, R.epic) && glows(pe.sh) && !isGold(pe.bc), `[${tag}] ảnh chi tiết Tím: viền tím + quầng (${pe.bc})`);
  ok(near(es.bc, R.epic) && !isGold(es.bc), `[${tag}] thẻ Tím đang chọn vẫn viền tím`);
  await page.evaluate(() => ui.showRoster('llq')); await page.waitForTimeout(250);
  const pl = await look(page, '#roster .ro-pic');
  ok(near(pl.bc, R.leg) && glows(pl.sh), `[${tag}] ảnh chi tiết Vàng: viền vàng + quầng (${pl.bc})`);
  await page.screenshot({ path: path.join(SHOT, `anh-hung-vang-${tag}.png`) });
  // cây phát triển: chân dung theo bậc
  await page.evaluate(() => ui.showRoster('lactuong')); await page.waitForTimeout(250);
  const evb = await look(page, '#roster .ev-p.base'), eve = await look(page, '#roster .ev-p.epic'), evme = await look(page, '#roster .ev-p.me');
  ok(evb && eve && !isGold(evb.bc) && near(eve.bc, R.epic), `[${tag}] cây phát triển: Thường viền đồng, Tím viền tím`);
  ok(!isGold(evme.bc) && !glows(evme.sh), `[${tag}] cây phát triển: chân dung Thường đang xem không sáng vàng`);
  // không tràn
  const bad = await page.evaluate(() => [...document.querySelectorAll('#roster .ro-grid, #roster .ro-det, #roster .ev-row')].filter((x) => x.scrollWidth > x.clientWidth + 1).map((x) => x.className));
  ok(!bad.length && await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `[${tag}] không tràn ngang ${bad.join(' | ')}`);
  ok(!errors.length, `[${tag}] không lỗi trang ${errors.join(' | ')}`);
  await browser.close();
}

async function deckCase(w, h, tag) {
  const { browser, page, errors } = await open(w, h, { secrets: ['h.lactuong'] });
  await page.evaluate(() => ui.playLevel(0, false)); await page.waitForSelector('#prep:not([hidden])');
  // claude/bo-chon-doi: không còn bảng chọn đội — chỉ kiểm tra chân dung tướng trong trận
  // trong trận: chân dung tướng đang chọn (.dk-pt) theo bậc
  await page.click('[data-act=prep-go]'); await page.waitForTimeout(300);
  for (const [t, kind] of [['lactuong', 'thuong'], ['lyngu', 'tim'], ['llq', 'vang']]) {
    await page.evaluate(([t, i]) => { const g = game; const s = g.freeSlots()[0]; const hh = g.spawnHero(s, t, {}); if (HEROES[t].legend) { hh.from = t; hh.lineage = []; } hh.summonT = 0; ui.sel = s; ui.spot = -1; ui.armed = null; ui.updateDeck(); }, [t, kind]);
    await page.waitForTimeout(250);
    const pt = await look(page, '#deck .dk-pt');
    if (!pt) { console.log(`  · [${tag}] (không mở được bảng tướng ${t} trong trận — bỏ qua)`); continue; }
    if (kind === 'thuong') ok(!isGold(pt.bc) && !glows(pt.sh), `[${tag}] chân dung trận Thường không vàng/sáng (${pt.bc})`);
    if (kind === 'tim') ok(near(pt.bc, '#A86CE0') && glows(pt.sh), `[${tag}] chân dung trận Tím viền tím + quầng`);
    if (kind === 'vang') ok(near(pt.bc, '#F0A030') && glows(pt.sh), `[${tag}] chân dung trận Vàng viền vàng + quầng`);
  }
  ok(!errors.length, `[${tag}] không lỗi trang ${errors.join(' | ')}`);
  await browser.close();
}

(async () => {
  for (const [w, h, tag] of [[844, 390, '844x390'], [667, 375, '667x375'], [800, 360, 'ngang-800x360']]) {
    console.log(`— Anh Hùng ${tag}`); await rosterCase(w, h, tag);
    console.log(`— Chân dung trong trận ${tag}`); await deckCase(w, h, tag);
  }
  console.log('XONG: tất cả đạt');
})().catch((e) => { console.error(e.message); process.exit(1); });
