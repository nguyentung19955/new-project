// Test Vai trò tướng (v182). Chạy: node tests/vai-tro/vai-tro.test.js
// Dữ liệu vai trò, cộng hưởng 2/4, icon trên thẻ chợ / bảng chỉ số / Anh Hùng / Bách khoa, lọc theo vai trò.
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('../cho-tuong/helpers');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const SIZES = [[1920, 934], [844, 390], [667, 375]];

async function main() {
  // ---------- dữ liệu
  let { browser, page, errors } = await open(844, 390);
  const d = await page.evaluate(() => {
    const all = [...BASIC_HEROES, ...LEGEND_HEROES];
    const per = {}; for (const k of all) { const r = heroRole(k); per[r] = (per[r] || 0) + 1; }
    return {
      n: all.length, missing: all.filter((k) => !HERO_ROLE[k]), bad: all.filter((k) => !heroRoles(k).every((r) => ROLES[r]) || heroRoles(k).length > 2 || (heroRoles(k)[1] && heroRoles(k)[1] === heroRoles(k)[0])),
      extra: Object.keys(HERO_ROLE).filter((k) => !HEROES[k]), per, roles: ROLE_KEYS.length,
      basicPer: BASIC_HEROES.reduce((o, k) => { o[heroRole(k)] = (o[heroRole(k)] || 0) + 1; return o; }, {}),
    };
  });
  ok(d.roles >= 6 && d.roles <= 7, `${d.roles} vai trò`);
  ok(d.missing.length === 0 && d.extra.length === 0, `mọi tướng (${d.n}) có vai trò chính` + (d.missing.length ? ' thiếu: ' + d.missing : ''));
  ok(d.bad.length === 0, 'vai trò hợp lệ, tối đa 1 vai phụ khác vai chính');
  ok(Object.keys(d.per).length === d.roles && Object.values(d.per).every((v) => v >= 4), 'mỗi vai trò có ≥4 tướng: ' + JSON.stringify(d.per));
  ok(Object.keys(d.basicPer).length === d.roles, 'tướng Thường phủ đủ mọi vai trò: ' + JSON.stringify(d.basicPer));
  // Dũng Sĩ Giáo Đồng (Diệt boss) có % sát thương lên boss
  ok(await page.evaluate(() => { const s = {}; s.crit = 0; s.bossPct = 0; HEROES.giaodong.skills[2].apply(s, 50); return s.bossPct >= 10; }), 'Giáo Đồng: Thế Giáo +% sát thương lên boss');

  // ---------- cộng hưởng trong trận
  await enter(page, 0);
  await page.evaluate(() => { game.running = false; game.gold = 99999; });
  const syn = await page.evaluate(() => {
    const put = (t) => { const s = game.freeSlots()[0]; game.placeHero(s, t); return game.heroes[s]; };
    const out = {};
    const a = put('xathu'); game.updateAuras();
    const h0 = heroStats(a).cooldown;
    out.t1 = JSON.stringify(game.vtTiers);
    put('tre'); game.updateAuras();
    out.t2 = game.vtTiers.satthuong; out.cd2 = heroStats(a).cooldown < h0;
    put('xathu'); game.updateAuras(); out.same = game.vtTiers.satthuong;   // trùng loại không tính thêm
    put('dotnuong'); put('ongthoi'); game.updateAuras(); out.t4 = game.vtTiers.satthuong;
    // Hỗ trợ: buff toàn quân
    put('thaylang'); put('haisen'); game.updateAuras();
    out.regen = (a.buff.vt || {}).regen || 0;
    ROLE_SYN.on = false; game.updateAuras(); out.off = Object.keys(game.vtTiers).length; ROLE_SYN.on = true; game.updateAuras();
    return out;
  });
  ok(syn.t1 === '{}', '1 tướng Sát thương: chưa cộng hưởng');
  ok(syn.t2 === 1 && syn.cd2, '2 tướng Sát thương khác loại: bậc 1, tốc đánh tăng');
  ok(syn.same === 1, 'tướng trùng loại không tính thêm');
  ok(syn.t4 === 2, '4 tướng Sát thương khác loại: bậc 2');
  ok(syn.regen === 1.5, 'Hỗ trợ 2: toàn quân +1,5 hồi máu/giây');
  ok(syn.off === 0, 'tắt ROLE_SYN thì không cộng hưởng');
  ok(await page.locator('#deck .mk-card .rl svg.rli').count() === 4, 'thẻ chợ có icon vai trò');
  await browser.close();

  // ---------- ảnh 3 cỡ màn hình
  for (const [w, h] of SIZES) {
    ({ browser, page, errors } = await open(w, h, { owned: ['thachsanh', 'giong'] }));
    await enter(page, 0);
    await page.evaluate(() => { game.running = false; game.gold = 99999; for (const t of ['xathu', 'tre', 'thaylang', 'haisen']) game.placeHero(game.freeSlots()[0], t); game.updateAuras(); game.market.types = ['lucsi', 'thaymo', 'thansuong', 'thosan']; ui.sig.deck = null; });
    await page.waitForTimeout(250);
    const deck = await page.locator('#deck').boundingBox();
    await page.screenshot({ path: path.join(SHOT, `the-cho-${w}x${h}.png`), clip: { x: 0, y: Math.max(0, deck.y - 6), width: w, height: Math.min(h - Math.max(0, deck.y - 6), deck.height + 12) } });
    // icon vai trò không lòi ra ngoài thẻ
    const inside = await page.evaluate(() => [...document.querySelectorAll('#deck .mk-card')].every((c) => { const r = c.getBoundingClientRect(), i = c.querySelector('.rl').getBoundingClientRect(); return i.left >= r.left && i.right <= r.right && i.top >= r.top && i.bottom <= r.bottom; }));
    ok(inside, `${w}x${h}: icon vai trò nằm gọn trong thẻ chợ`);
    // icon thẻ chợ: nền đặc màu vai trò, đủ to để thấy (≥13px trên màn)
    const ic = await page.evaluate(() => { const i = document.querySelector('#deck .mk-card .rl svg'); const r = i.getBoundingClientRect(); return { w: r.width, solid: i.classList.contains('solid') }; });
    ok(ic.solid && ic.w >= 13, `${w}x${h}: icon vai trò thẻ chợ dạng đặc, rộng ${ic.w.toFixed(1)}px`);
    // không chồng lên tên tướng
    const clash = await page.evaluate(() => [...document.querySelectorAll('#deck .mk-card')].some((c) => { const i = c.querySelector('.rl').getBoundingClientRect(), n = c.querySelector('.nm'); const rg = document.createRange(); rg.selectNodeContents(n); const t = rg.getBoundingClientRect(); return i.bottom > t.top + 1 && i.right > t.left + 1; }));
    ok(!clash, `${w}x${h}: icon vai trò không đè tên tướng`);
    // chọn tướng + giữ chân dung → bảng chỉ số
    await page.evaluate(() => { ui.sel = game.heroes.findIndex((x) => x && x.type === 'xathu'); ui.statsOpen = true; ui.sig.deck = null; });
    await page.waitForTimeout(300);
    ok(await page.locator('#hero-stats .hs-vt .rl-chip').count() >= 1, `${w}x${h}: bảng chỉ số có vai trò`);
    ok(await page.locator('#deck .dk-info .sub svg.rli').count() === 1, `${w}x${h}: thanh tướng có icon vai trò`);
    await page.screenshot({ path: path.join(SHOT, `bang-chi-so-${w}x${h}.png`) });
    await page.evaluate(() => { ui.statsOpen = false; ui.sel = -1; });
    // Anh Hùng + lọc
    await page.evaluate(() => { $('#toasts').innerHTML = ''; ui.showRoster('thachsanh', true); });
    await page.waitForTimeout(200);
    if (await page.locator('#roster:not([hidden]) .ro-grid').count() === 0) await page.evaluate(() => { $('#roster').hidden = false; ui.renderRoster(); });
    await page.waitForTimeout(300);
    ok(await page.locator('#roster .ro-card .tag.rl').count() === 60, `${w}x${h}: Anh Hùng — 60 thẻ có icon vai trò`);
    ok(await page.locator('#roster .rl-tags .rl-chip').count() >= 1, `${w}x${h}: chi tiết tướng có nhãn vai trò`);
    await page.screenshot({ path: path.join(SHOT, `anh-hung-${w}x${h}.png`) });
    await page.click('#roster .rl-f[data-r=dietboss]');
    await page.waitForTimeout(200);
    const f = await page.evaluate(() => { const f = [...document.querySelectorAll('#roster .ro-card')].map((c) => c.dataset.type);
      return { n: f.length, ok: f.every((k) => heroRoles(k).includes('dietboss')), all: [...BASIC_HEROES, ...LEGEND_HEROES].filter((k) => heroRoles(k).includes('dietboss')).length }; });
    ok(f.n > 0 && f.ok && f.n === f.all, `${w}x${h}: lọc Diệt boss → ${f.n} tướng`);
    ok(await page.locator('#roster .rl-f.on span').evaluate((e) => getComputedStyle(e).display !== 'none'), `${w}x${h}: nút lọc đang chọn hiện tên vai trò`);
    ok(await page.locator('#roster .rl-f[data-r=dietboss][data-tip][title]').count() === 1, `${w}x${h}: nút lọc có tooltip (giữ / rê)`);
    // tướng đang xem không thuộc bộ lọc → chọn tướng đầu danh sách
    await page.click('#roster .rl-f[data-r=hotro]'); await page.waitForTimeout(200);
    const sel = await page.evaluate(() => ({ t: ui.rosterSel, first: document.querySelector('#roster .ro-card').dataset.type, on: (document.querySelector('#roster .ro-card.on') || {}).dataset }));
    ok(sel.t === sel.first && sel.on && sel.on.type === sel.t, `${w}x${h}: lọc Hỗ trợ → chọn ${sel.t} (đầu danh sách)`);
    await page.screenshot({ path: path.join(SHOT, `anh-hung-loc-${w}x${h}.png`) });
    await page.click('#roster .rl-f[data-r=""]');
    ok(await page.locator('#roster .ro-card').count() === 60, `${w}x${h}: Tất cả → đủ 60 tướng`);
    await page.evaluate(() => { $('#roster').hidden = true; });
    // Bách khoa · Vai trò
    await page.evaluate(() => { $('#toasts').innerHTML = ''; ui.openScreen('codex', { top: true }); ui.screen.tab = 'role'; ui.renderScreen(true); });
    await page.waitForTimeout(300);
    ok(await page.locator('.vt-col').count() === 7, `${w}x${h}: Bách khoa · Vai trò có 7 cột`);
    await page.screenshot({ path: path.join(SHOT, `bach-khoa-${w}x${h}.png`) });
    await page.click('.vt-top .rl-f[data-r=hotro]');
    await page.waitForTimeout(200);
    ok(await page.locator('.vt-col').count() === 1 && await page.locator('.vt-h.sub').count() > 0, `${w}x${h}: lọc Hỗ trợ → 1 cột, có tướng vai phụ`);
    await page.screenshot({ path: path.join(SHOT, `bach-khoa-loc-${w}x${h}.png`) });
    // không có chữ tràn ngang trong màn
    const over = await page.evaluate(() => { const b = document.querySelector('.vt-body'); return b.scrollWidth > b.clientWidth + 1; });
    ok(!over, `${w}x${h}: Bách khoa không tràn ngang`);
    ok(errors.length === 0, `${w}x${h}: không lỗi JS` + (errors.length ? ': ' + errors.join(' | ') : ''));
    await browser.close();
  }
  console.log('OK vai-tro');
}
main().catch((e) => { console.error(e); process.exit(1); });
