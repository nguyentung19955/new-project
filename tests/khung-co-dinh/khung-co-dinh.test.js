// claude/khung-co-dinh: KHUNG THIẾT KẾ CỐ ĐỊNH 844×390 thu / phóng (+ xoay khi cầm dọc) vừa vùng an toàn — 10 cỡ máy, lề an toàn giả.
// Mỗi cỡ: khung nằm trọn vùng an toàn, không phần tử UI ra ngoài khung, ảnh quy về khung logic giống nhau, kéo thẻ chợ đặt đúng ô,
// các bảng chính (menu, Hợp thể, Anh Hùng, Sính lễ, Cài đặt, Kết quả) nằm trọn khung. Chạy: node tests/khung-co-dinh/khung-co-dinh.test.js
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('../cho-tuong/helpers');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const SIZES = [[375, 667], [390, 844], [390, 664], [430, 932], [820, 1180], [360, 800], [412, 915], [844, 390], [667, 375], [1920, 934]];
const safe = (w, h) => (w >= 1000 ? [0, 0, 0, 0] : h > w ? [59, 0, 34, 0] : [0, 47, 21, 47]);   // trên, phải, dưới, trái

// khung (#wrap) + phần tử nhìn thấy trong vùng sel — so với vùng an toàn và với chính khung
const check = (page, sel, sf) => page.evaluate(([sel, sf]) => {
  const m = sf.some((x) => x > 0) ? 8 : 0;
  const S = { l: sf[3] + m, t: sf[0] + m, r: innerWidth - sf[1] - m, b: innerHeight - sf[2] - m };
  const g = document.querySelector('#wrap').getBoundingClientRect();
  const inSafe = g.left >= S.l - 1 && g.top >= S.t - 1 && g.right <= S.r + 1 && g.bottom <= S.b + 1;
  const touch = Math.abs(g.right - g.left - (S.r - S.l)) < 2 || Math.abs(g.bottom - g.top - (S.b - S.t)) < 2;   // vừa khít một chiều
  const bad = [];
  for (const e of document.querySelectorAll(sel)) {
    if (!e.offsetParent || getComputedStyle(e).visibility === 'hidden' || e.closest('[hidden]')) continue;
    const q = e.getBoundingClientRect();
    if (!q.width || !q.height) continue;
    // bị vùng cuộn che (danh sách dài cuộn được) → không nhìn thấy, bỏ qua
    let a = e.parentElement, hid = false;
    while (a && a.id !== 'wrap') { const cs = getComputedStyle(a); if (cs.overflowY !== 'visible' || cs.overflowX !== 'visible') { const b = a.getBoundingClientRect(); if (q.bottom <= b.top + 1 || q.top >= b.bottom - 1 || q.right <= b.left + 1 || q.left >= b.right - 1) { hid = true; break; } } a = a.parentElement; }
    if (hid) continue;
    if (q.left < g.left - 2 || q.top < g.top - 2 || q.right > g.right + 2 || q.bottom > g.bottom + 2) bad.push((e.id || e.className || e.tagName).toString().slice(0, 30));
  }
  return { inSafe, touch, bad: [...new Set(bad)].slice(0, 6), g: [g.left, g.top, g.right, g.bottom].map(Math.round), scroll: document.body.scrollWidth > innerWidth + 1 || document.body.scrollHeight > innerHeight + 1 };
}, [sel, sf]);
const setSafe = (page, sf) => page.evaluate((sf) => { const d = document.documentElement.style; ['t', 'r', 'b', 'l'].forEach((k, i) => d.setProperty('--safe-' + k, sf[i] + 'px')); window.dispatchEvent(new Event('resize')); }, sf);
// ảnh khung quy về 844×390 (chụp đúng vùng #wrap, xoay về ngang) để so giữa các cỡ
async function frameShot(page, file) {
  const r = await page.evaluate(() => { const g = document.querySelector('#wrap').getBoundingClientRect(); return { x: g.left, y: g.top, w: g.width, h: g.height, rot: ROT }; });
  const buf = await page.screenshot({ clip: { x: r.x, y: r.y, width: r.w, height: r.h } });
  fs.writeFileSync(file, buf);
  return r.rot;
}

(async () => {
  const shots = [];
  for (const [w, h] of SIZES) {
    const sf = safe(w, h), tag = `${w}x${h}`;
    const { browser, page, errors } = await open(w, h, { unlocked: 20, owned: ['giong', 'thachsanh', 'caolo', 'lachau'] });
    await setSafe(page, sf); await page.waitForTimeout(500);
    let c = await check(page, '#menu button, #menu .pl-box, #menu .title', sf);
    ok(c.inSafe && c.touch && !c.bad.length && !c.scroll, `${tag} menu: khung trọn vùng an toàn ${sf} (${c.g}), không lọt ra ngoài ${c.bad}`);
    await enter(page, 0, true);
    // chợ cố định (thẻ ngẫu nhiên làm ảnh các cỡ khác nhau)
    await page.evaluate(() => { game.running = false; game.gold = 5000; const m = game.ensureMarket(); m.types = m.types.map(() => 'lactuong'); ui.sig = {}; }); await page.waitForTimeout(400);
    c = await check(page, '#ui button, #topbar, #deck, #auto-btns', sf);
    ok(c.inSafe && !c.bad.length, `${tag} trận: mọi nút trong khung ${c.bad}`);
    const tb = await page.evaluate(() => { const t = document.querySelector('#topbar'); return t.scrollWidth <= t.clientWidth + 1; });
    ok(tb, `${tag}: thanh trên không tràn`);
    const f = path.join(SHOT, `tran-${tag}.png`); const rot = await frameShot(page, f); shots.push([tag, f, rot]);
    // kéo thẻ chợ thứ 1 thả vào ô trống đầu tiên → tướng đặt đúng ô
    const tgt = await page.evaluate(() => {
      const s = game.freeSlots()[0], p = { x: CONFIG.slots[s][0], y: CONFIG.slots[s][1] };
      // toạ độ logic → màn hình (nghịch của toFrame)
      const fx = (p.x + view.ox) * view.scale, fy = (p.y + view.oy) * view.scale;
      let dx = (fx - FW / 2) * FRAME.s, dy = (fy - FH / 2) * FRAME.s; if (FRAME.rot) [dx, dy] = [-dy, dx];
      const card = document.querySelector('#deck .mk-card').getBoundingClientRect();
      return { s, x: FRAME.cx + dx, y: FRAME.cy + dy, cx: card.left + card.width / 2, cy: card.top + card.height / 2, n: game.heroes.filter(Boolean).length };
    });
    await page.mouse.move(tgt.cx, tgt.cy); await page.mouse.down();
    for (let i = 1; i <= 8; i++) { await page.mouse.move(tgt.cx + (tgt.x - tgt.cx) * i / 8, tgt.cy + (tgt.y - tgt.cy) * i / 8); await page.waitForTimeout(20); }
    await page.mouse.up(); await page.waitForTimeout(300);
    const placed = await page.evaluate((s) => !!game.heroes[s], tgt.s);
    ok(placed, `${tag}: kéo thẻ chợ thả đúng ô ${tgt.s}`);
    // bảng Hợp thể
    await page.click('#deck [data-act=legend-open]'); await page.waitForTimeout(300);
    c = await check(page, '#legends, #legends button', sf); ok(!c.bad.length, `${tag} Hợp thể trọn khung ${c.bad}`);
    await page.click('#legends [data-act=hx-close]'); await page.waitForTimeout(150);
    // Sính lễ
    await page.evaluate(() => { const o = game.bossRewards('thuongluong'); ui.showReward({ type: 'reward', boss: 'thuongluong', options: o, id: 1 }); }); await page.waitForTimeout(300);
    c = await check(page, '#reward button, #reward .sl-card', sf); ok(!c.bad.length, `${tag} Sính lễ trọn khung ${c.bad}`);
    await page.evaluate(() => { document.querySelector('#reward').hidden = true; });
    // Cài đặt
    await page.evaluate(() => ui.showSettings(true)); await page.waitForTimeout(300);
    c = await check(page, '#settings .scr-head, #settings .scr-head button', sf); ok(!c.bad.length, `${tag} Cài đặt trọn khung ${c.bad}`);
    await page.evaluate(() => { document.querySelector('#settings').hidden = true; });
    // Kết quả
    await page.evaluate(() => { game.lives = 0; game.over = true; game.events.push({ type: 'defeat' }); }); await page.waitForTimeout(700);
    c = await check(page, '#result .scr-head, #result .scr-head button', sf); ok(!c.bad.length, `${tag} Kết quả trọn khung ${c.bad}`);
    // Anh Hùng
    await page.evaluate(() => ui.showRoster()); await page.waitForTimeout(400);
    c = await check(page, '#roster .scr-head, #roster .scr-head button', sf); ok(!c.bad.length, `${tag} Anh Hùng trọn khung ${c.bad}`);
    ok(!errors.length, `${tag}: không lỗi JS ${errors.slice(0, 2)}`);
    await browser.close();
  }
  // ảnh trận các cỡ quy về khung 844×390 (xoay về ngang) — so khác biệt với cỡ chuẩn 844×390
  const py = `
import sys
from PIL import Image, ImageChops, ImageStat
items = [l.split('|') for l in sys.argv[1:]]
ims = []
for tag, f, rot in items:
    im = Image.open(f).convert('RGB')
    if rot == 'true': im = im.rotate(90, expand=True)
    ims.append((tag, im.resize((844, 390), Image.BILINEAR)))
ref = dict(ims)['844x390']
for tag, im in ims:
    # so ở 1/4 độ phân giải: bỏ qua lệch từng điểm ảnh của cỏ / hạt khi nội suy, chỉ so bố cục
    sm = lambda x: x.resize((211, 97), Image.BOX)
    d = ImageStat.Stat(ImageChops.difference(sm(im), sm(ref)).convert('L')).mean[0]
    print(tag, round(d, 2))
W = Image.new('RGB', (844 * 2 + 10, (390 + 10) * 5), (40, 40, 40))
for i, (tag, im) in enumerate(ims): W.paste(im, ((i % 2) * 854, (i // 2) * 400))
W.save(sys.argv[0].replace('.py', '') if False else '${path.join(SHOT, 'ghep-10-co.png')}')
`;
  const out = require('child_process').execFileSync('python3', ['-c', py, ...shots.map(([t, f, r]) => `${t}|${f}|${r}`)]).toString().trim().split('\n');
  for (const l of out) { const [t, d] = l.split(' '); ok(+d < 10, `${t}: ảnh quy về khung giống 844×390 (khác biệt trung bình ${d}/255)`); }
  console.log('PASS khung-co-dinh · ảnh ghép: tests/khung-co-dinh/shots/ghep-10-co.png');
})().catch((e) => { console.error(e); process.exit(1); });
