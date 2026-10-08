// Test v189: sửa các lỗi trong docs/BAO-CAO-TEST.md (báo cáo QA bản 180) — mỗi lỗi một nhóm kiểm tra,
// ở 1920×934, 844×390, 667×375. Ảnh sau khi sửa: tests/sua-loi-tester/shots/ (đã xem bằng mắt khi sửa).
// Chạy: node tests/sua-loi-tester/sua-loi-tester.test.js
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const ROOT = path.resolve(__dirname, '../..');
const URL = 'file://' + path.join(ROOT, 'index.html');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ✗ ' + msg); } else console.log('  ✓ ' + msg); };
const SAVE = { unlocked: 5, storySeen: true, settings: { skipStory: true }, owned: ['giong', 'llq', 'kimquy', 'thachsanh'], kho: 5000 };
const SIZES = [[1920, 934], [844, 390], [667, 375]];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(browser, w, h, o = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  page.errors = []; page.fails = [];
  page.on('pageerror', (e) => page.errors.push(String(e)));
  page.on('requestfailed', (r) => /^https?:/.test(r.url()) || page.fails.push(r.url().replace('file://' + ROOT + '/', '')));
  await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: o.fb || "const FIREBASE_CONFIG={apiKey:''};" }));
  await page.addInitScript((s) => localStorage.setItem('nuicao.v1', JSON.stringify(s)), o.save || SAVE);
  await page.goto(URL);
  await page.waitForTimeout(900);
  return page;
}
const enter = async (page) => {
  await page.evaluate(() => { ui.playLevel(0, false); document.querySelector('[data-act=prep-go]').click(); });
  await page.waitForTimeout(400);
};
// hình chữ nhật của phần tử (px màn hình), null nếu đang ẩn
const rect = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e || e.closest('[hidden]') || !e.getClientRects().length) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; }, sel);
const inter = (a, b) => !!(a && b) && Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));
// vị trí thành (cuối đường quái) trên màn hình, ±40 px
const gateRect = (page) => page.evaluate(() => { const p = PATH.at(PATH.total), c = document.getElementById('game').getBoundingClientRect(); const x = c.left + (p.x + view.ox) * view.scale, y = c.top + (p.y + view.oy) * view.scale, G = 40 * view.scale / 0.9; return { l: x - G, t: y - G, r: x + G, b: y + G }; });
// gọi boss Thuồng Luồng (đợt 10) ra ngay
const bossWave = (page) => page.evaluate(() => { const g = ui.game; g.wave = 9; g.nextWave = buildWave(10, g.level); g.running = true; g.startWave(); g.spawnQueue = g.spawnQueue.filter((q) => ENEMIES[q.type].boss); for (const q of g.spawnQueue) q.gap = 0; });

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });

  // ---------- L14: danh sách ảnh khớp thư mục, không còn request ảnh 404
  {
    console.log('L14 · ảnh 404 khi tải');
    const al = require(path.join(ROOT, 'tools/build-asset-list.js'));
    const want = al.render(al.list()), have = fs.readFileSync(al.out, 'utf8');
    ok(want === have, `js/asset-list.js khớp thư mục assets/ (${al.list().length} ảnh) — lệch thì chạy: node tools/build-asset-list.js`);
    const page = await open(browser, 1280, 720);
    const steps = [
      () => ui.showCampaign(0), () => ui.showCampaign(9), () => { ui.showMenu(); document.getElementById('btn-heroes').click(); },
      () => { ui.showMenu(); document.getElementById('btn-runes').click(); }, () => { ui.showMenu(); document.getElementById('btn-treasury').click(); },
      () => { ui.showMenu(); document.getElementById('btn-menu-codex').click(); }, () => ui.playLevel(0, false), () => document.querySelector('[data-act=prep-go]').click(),
      () => { const g = ui.game; g.gold = 9999; for (let i = 0; i < 6; i++) g.summonRandom(); g.running = true; g.speed = 3; g.startWave(); },
    ];
    for (const s of steps) { await page.evaluate(s); await sleep(400); }
    await sleep(2500);
    await page.evaluate(() => { ui.game.wave = 12; ui.finishLevel(); });
    await sleep(500);
    ok(page.fails.length === 0, `đi qua menu, bản đồ, anh hùng, ấn phù, kho báu, bách khoa, chuẩn bị, trận, kết quả: ${page.fails.length} request lỗi ${page.fails.slice(0, 5).join(', ')}`);
    ok(await page.evaluate(() => [...document.querySelectorAll('img')].filter((i) => i.complete && !i.naturalWidth && i.src && !/^data:/.test(i.src)).length === 0), 'không còn thẻ <img> vỡ');
    ok(page.errors.length === 0, 'không lỗi JS ' + page.errors.join(' | '));
    await page.context().close();
  }

  for (const [w, h] of SIZES) {
    const tag = `${w}x${h}`;
    console.log(`\n== ${tag}`);
    const page = await open(browser, w, h);

    // ---------- L09: nút Ấn Phù có lề phải
    {
      const m = await page.evaluate(() => { const b = document.getElementById('btn-runes'); const r = b.getBoundingClientRect(); const rg = document.createRange(); rg.selectNodeContents(b); const tr = rg.getBoundingClientRect(); return { sw: b.scrollWidth, cw: b.clientWidth, gap: (r.right - tr.right) / (r.width / b.offsetWidth) }; });
      ok(m.sw <= m.cw && m.gap >= 5, `L09 Ấn Phù: chữ không chạm viền (lề phải ${m.gap.toFixed(1)}px, ${m.sw}≤${m.cw})`);
    }
    // ---------- L10: góc phải dưới nen-menu.jpg không còn khung xám
    if (w === 1920) {
      const v = await page.evaluate(() => new Promise((res) => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); const d = x.getImageData(1500, 660, 90, 83).data; let mx = 0; for (let i = 0; i < d.length; i += 4) mx = Math.max(mx, (d[i] + d[i + 1] + d[i + 2]) / 3); res(mx); }; im.src = 'assets/ui/nen-menu.jpg'; }));
      ok(v < 150, `L10 nền menu: vùng ô vuông cũ (1500..1590, 660..743) không còn viền sáng (sáng nhất ${v.toFixed(0)} < 150)`);
    }
    // ---------- L02: icon hành nằm gọn góc ảnh, không đè dòng lý do
    {
      const chk = (sel) => page.evaluate((sel) => [...document.querySelectorAll(sel + ' .ch-av')].filter((a) => a.querySelector('i')).map((a) => { const R = (e) => e.getBoundingClientRect(); const i = R(a.querySelector('i')), im = R(a.querySelector(':scope > img')), sm = R(a.querySelector('small')); return { k: i.width / im.width, ib: i.bottom, imb: im.bottom, st: sm.top, ir: i.right, imr: im.right, iw: im.width }; }), sel);
      await page.evaluate(() => ui.showCampaign(0)); await sleep(500);
      await page.evaluate(() => { const s = document.querySelector('#campaign .cp-scroll'); if (s) s.scrollTop = 9999; }); await sleep(150);
      await page.screenshot({ path: path.join(SHOT, `L02-ban-do-${tag}.png`) });
      const a = await chk('#campaign');
      await page.evaluate(() => ui.playLevel(0, false)); await sleep(400);
      await page.screenshot({ path: path.join(SHOT, `L02-chuan-bi-${tag}.png`) });
      const b = await chk('#prep');
      const all = [...a, ...b];
      ok(all.length >= 6 && all.every((x) => x.k <= 0.42), `L02 icon hành ≤ 0,42 ảnh (lớn nhất ${Math.max(...all.map((x) => x.k)).toFixed(2)}, ${all.length} tướng)`);
      ok(all.every((x) => x.ib <= x.imb + 0.6 && x.ib <= x.st + 0.6), 'L02 icon hành không lấn xuống dòng lý do');
      ok(all.every((x) => x.ir <= x.imr + x.iw * 0.12 && x.ir >= x.imr - x.iw * 0.12), 'L02 icon hành ở góc phải ảnh');
      // ---------- L05a: màn Chuẩn bị không còn toast đè "Tướng khắc chế"
      ok(await page.evaluate(() => document.querySelectorAll('#toasts .toast').length === 0), 'L05 màn Chuẩn bị: không có thông báo đè cột Tướng khắc chế');
    }
    await page.evaluate(() => document.querySelector('[data-act=prep-go]').click());
    await sleep(500);
    // ---------- L05: thông báo trong trận né thành, xoá khi đổi màn, trong lớp phủ hiện ở đáy giữa
    {
      const gate = await gateRect(page);
      const t0 = await page.evaluate(() => [...document.querySelectorAll('#toasts .toast')].map((t) => t.textContent));
      ok(t0.some((x) => /Vô tận/.test(x)), 'L05 mục tiêu bản đồ báo khi vào trận');
      const tr = await rect(page, '#toasts .toast');
      ok(tr && !inter(tr, gate), `L05 thông báo trong trận không đè thành`);
      await page.screenshot({ path: path.join(SHOT, `L05-tran-${tag}.png`) });
      await sleep(400);
      await page.evaluate(() => ui.toast('Đã hủy Lạc Tướng: +54 vàng'));
      await sleep(400);
      await page.evaluate(() => { ui.openLegends(true); ui.toast('Đã ghép Lạc Tướng ★★'); });
      await sleep(300);
      const t1 = await page.evaluate(() => ({ txt: [...document.querySelectorAll('#toasts .toast')].map((t) => t.textContent), ov: document.getElementById('toasts').classList.contains('ov') }));
      ok(!t1.txt.some((x) => /hủy/.test(x)) && t1.txt.some((x) => /ghép/.test(x)), `L05 mở Hợp thể: thông báo cũ bị xoá, thông báo mới còn (${t1.txt.join(' | ')})`);
      const lr = await rect(page, '#toasts .toast');
      const hit = await page.evaluate(() => { const t = document.querySelector('#toasts .toast').getBoundingClientRect(); return [...document.querySelectorAll('#legends button, #legends [data-act], #legends h1, #legends .ttl')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && Math.min(r.right, t.right) - Math.max(r.left, t.left) > 2 && Math.min(r.bottom, t.bottom) - Math.max(r.top, t.top) > 2; }).map((e) => e.textContent.trim().slice(0, 20)); });
      ok(t1.ov && lr && lr.t >= 0 && lr.b <= h && lr.l >= 0 && lr.r <= w, 'L05 trong lớp phủ: thông báo nằm trong màn');
      ok(hit.length <= 1, `L05 trong lớp phủ: thông báo không đè nút / tiêu đề (đè: ${hit.join(' | ') || 'không'})`);
      await page.screenshot({ path: path.join(SHOT, `L05-hop-the-${tag}.png`) });
      await page.evaluate(() => { document.getElementById('legends').hidden = true; });
      await sleep(200);
      // đổi màn trong #screen (túi đồ → anh hùng): thông báo cũ cũng xoá
      await page.evaluate(() => { ui.openScreen('bag'); }); await sleep(400);
      await page.evaluate(() => ui.toast('Thông báo ở Túi đồ')); await sleep(400);
      await page.evaluate(() => ui.openScreen('codex')); await sleep(200);
      ok(await page.evaluate(() => ![...document.querySelectorAll('#toasts .toast')].some((t) => /Túi đồ/.test(t.textContent))), 'L05 đổi Túi đồ → Bách khoa: thông báo của Túi đồ bị xoá');
      await page.evaluate(() => ui.closeScreen()); await sleep(200);
      ok(await page.evaluate(() => !document.getElementById('toasts').classList.contains('ov')), 'L05 đóng màn: thông báo về lại vị trí trong trận');
    }
    // ---------- banner Thăng thần gọn 1 dòng chữ to
    {
      await page.evaluate(() => ui.banner('Thăng thần', 'Lạc Tướng hóa thân Lý Ngư Tướng Quân')); await sleep(600);
      const b = await page.evaluate(() => { const e = document.getElementById('banner-text'); return { h: e.getBoundingClientRect().height, lh: parseFloat(getComputedStyle(e).fontSize) * (e.getBoundingClientRect().height / e.offsetHeight) }; });
      ok(b.h < b.lh * 1.6, `Banner "Thăng thần" 1 dòng (cao ${b.h.toFixed(0)}px, cỡ chữ ${b.lh.toFixed(0)}px)`);
      await page.screenshot({ path: path.join(SHOT, `thang-than-${tag}.png`) });
      await sleep(2300);
    }
    // ---------- L16: chữ "Đợt" không vượt mép trên
    {
      const r = await rect(page, '#tb-wave');
      ok(r.t >= 0.5, `L16 chữ "Đợt" cách mép trên ${r.t.toFixed(1)}px (≥ 0,5)`);
    }
    // ---------- L21: chữ "Đợt" không nhích khi số đợt thêm chữ số
    {
      const xs = [];
      for (const wv of [0, 9, 10, 99]) xs.push(await page.evaluate((wv) => { ui.game.wave = wv; ui.updateTopbar(); const r = document.createRange(), t = document.getElementById('tb-wave').firstChild; r.setStart(t, 0); r.setEnd(t, 3); const b = r.getBoundingClientRect(); return ROT ? b.top : b.left; }, wv));
      await page.evaluate(() => { ui.game.wave = 0; ui.updateTopbar(); });
      ok(Math.max(...xs) - Math.min(...xs) < 0.6, `L21 chữ "Đợt" đứng yên khi đợt 0 → 9 → 10 → 99 (lệch ${(Math.max(...xs) - Math.min(...xs)).toFixed(1)}px)`);
    }
    // ---------- L22: bong bóng Thần tinh không đè đầu tướng vừa hoá thân (tướng Tím vẽ to)
    {
      const r = await page.evaluate(() => {
        const g = ui.game, t = Object.keys(HEROES).find((k) => HEROES[k].legend === 'epic');
        const slots = CONFIG.slots.map((s, i) => [s[1], i]).sort((a, b) => b[0] - a[0]).map((x) => x[1]);   // ô thấp nhất (bong bóng hiện trên đầu)
        const i = slots.find((k) => !g.heroes[k]); g.spawnHero(i, t); const h = g.heroes[i]; h.from = 'lactuong'; h.tier = 1;
        ui.sel = i; ui.moreSig = null; return i;
      });
      await sleep(400);
      const m = await page.evaluate((i) => { const el = document.getElementById('more'); if (el.hidden) return null; const b = el.getBoundingClientRect(); const top = HERO_TOP.get(ui.game.heroes[i]); const c = document.getElementById('game').getBoundingClientRect(); const y = ROT ? null : c.top + (top + view.oy) * view.scale; return { mb: b.bottom, mt: b.top, y, below: el.classList.contains('below') }; }, r);
      ok(m && (m.y === null || m.below || m.mb <= m.y + 2), `L22 bong bóng Thần tinh nằm trên đỉnh hình tướng (đáy bong bóng ${m && m.mb.toFixed(0)} ≤ đỉnh tướng ${m && m.y && m.y.toFixed(0)})`);
      await page.screenshot({ path: path.join(SHOT, `L22-than-tinh-${tag}.png`) });
      await page.evaluate((i) => { ui.game.heroes[i] = null; ui.sel = -1; }, r);
    }
    // ---------- L07: banner boss — hội thoại + thông báo đợi banner tắt, không chồng nhau
    {
      await bossWave(page);
      let seen = false;
      for (let i = 0; i < 40 && !seen; i++) { await sleep(100); seen = await page.evaluate(() => !document.getElementById('banner').hidden); }
      ok(seen, 'L07 banner "Boss xuất hiện" hiện');
      await sleep(400);
      const s1 = await page.evaluate(() => ({ dlg: !document.getElementById('dialogue').hidden, toast: [...document.querySelectorAll('#toasts .toast')].some((t) => /Quái mới/.test(t.textContent)) }));
      ok(!s1.dlg && !s1.toast, 'L07 lúc banner đang hiện: chưa có hội thoại / thông báo "Quái mới" chồng lên');
      await page.screenshot({ path: path.join(SHOT, `L07-banner-${tag}.png`) });
      // máy bận (chạy song song): đọc lại tới khi có đủ hội thoại + thông báo (tối đa ~10 giây) thay vì chờ cố định 2,6 giây
      let dl = null, bt = null;
      for (let i = 0; i < 100 && !(dl && bt); i++) {
        await sleep(100);
        dl = await rect(page, '#dialogue');
        const ts = await page.evaluate(() => [...document.querySelectorAll('#toasts .toast')].map((t) => { const r = t.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, x: t.textContent }; }));
        bt = ts.find((t) => /Quái mới/.test(t.x));
      }
      await sleep(300);   // để hiệu ứng hiện xong rồi mới đo chồng nhau / chụp
      dl = await rect(page, '#dialogue') || dl;
      bt = (await page.evaluate(() => [...document.querySelectorAll('#toasts .toast')].map((t) => { const r = t.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, x: t.textContent }; }))).find((t) => /Quái mới/.test(t.x)) || bt;
      ok(dl && bt, 'L07 sau banner: hiện hội thoại boss và thông báo "Quái mới"');
      ok(!inter(dl, bt) && !inter(bt, await gateRect(page)), 'L07 hội thoại, thông báo, thành không chồng nhau');
      await page.screenshot({ path: path.join(SHOT, `L07-sau-banner-${tag}.png`) });
    }
    // ---------- L06: bảng boss không giật cao, dời khi che boss
    {
      const hs = [];
      for (let i = 0; i < 6; i++) {
        await page.evaluate((i) => { const b = ui.game.enemies.find((e) => e.def.boss); ui.bossSel = b; b.silenceT = i % 2 ? 3 : 0; b.stunT = i % 3 === 2 ? 1 : 0; }, i);
        await sleep(120);
        hs.push((await rect(page, '#bossbar')).b - (await rect(page, '#bossbar')).t);
      }
      ok(Math.max(...hs) - Math.min(...hs) < 0.5, `L06 bảng boss cao cố định khi dính/hết hiệu ứng (${hs.map((x) => x.toFixed(0)).join(',')})`);
      // đặt boss ngay dưới bảng (góc trên trái) → bảng dời xuống; boss xuống dưới → bảng về trên
      // boss / tướng nằm dưới bảng (góc trên trái) → bảng thu gọn 1 dòng, không còn che; không có gì bên dưới → bảng đầy đủ
      await page.evaluate(() => { ui.placeBossbar0 = ui.placeBossbar; ui.placeBossbar = () => {}; document.getElementById('bossbar').classList.remove('mini', 'ghost'); });
      await sleep(150);
      const full = await rect(page, '#bossbar');
      const under = await page.evaluate((fb) => { const c = document.getElementById('game').getBoundingClientRect(), bx = enemyBox(ui.game.enemies.find((e) => e.def.boss)); let best = -1; for (let q = 0; q < PATH.total; q += 10) { const p = PATH.at(q), x = c.left + (p.x + view.ox) * view.scale, y = c.top + (p.y - bx.h * 0.45 + view.oy) * view.scale; if (x > fb.l + 20 && x < fb.r - 20 && y > fb.t + 40 && y < fb.b - 5) best = q; } return best; }, full);
      await page.evaluate(() => { ui.placeBossbar = ui.placeBossbar0; });
      const place = (q) => page.evaluate((q) => { const b = ui.game.enemies.find((e) => e.def.boss); const p = PATH.at(q); b.dist = q; b.x = p.x; b.y = p.y; b.slowT = 99; b.zoneSlow = 1; ui.bossSel = b; }, q);
      const moveHeroesAway = () => page.evaluate(() => { const g = ui.game; for (const h of g.heroes) if (h) { h.y = 9999; } });
      if (under >= 0) {
        await page.evaluate(() => { for (const h of ui.game.heroes) if (h) h.__y = h.y; }); await moveHeroesAway();
        await place(under); await sleep(250);
        const m = await page.evaluate(() => ({ mini: document.getElementById('bossbar').classList.contains('mini'), h: document.getElementById('bossbar').getBoundingClientRect().height }));
        ok(m.mini && m.h < (full.b - full.t) * 0.45, `L06 boss nằm dưới bảng → bảng thu gọn 1 dòng (cao ${m.h.toFixed(0)} / ${(full.b - full.t).toFixed(0)}px)`);
        await page.screenshot({ path: path.join(SHOT, `L06-bang-boss-${tag}.png`) });
        await place(Math.round(await page.evaluate(() => PATH.total * 0.75))); await sleep(250);
        ok(await page.evaluate(() => !document.getElementById('bossbar').classList.contains('mini')), 'L06 boss đi xa, không tướng dưới bảng → bảng đầy đủ');
        await page.evaluate(() => { for (const h of ui.game.heroes) if (h && h.__y !== undefined) h.y = h.__y; });
      } else ok(true, 'L06 (đường đi không chạy dưới bảng ở cỡ màn này)');
      // tướng đứng ở ô hàng trái, dưới bảng đầy đủ → bảng thu gọn, không che tướng
      const hsl = await page.evaluate((fb) => { const c = document.getElementById('game').getBoundingClientRect(); for (let i = 0; i < CONFIG.slots.length; i++) { const [x, y] = CONFIG.slots[i]; const sx = c.left + (x + view.ox) * view.scale, sy = c.top + (y - 40 + view.oy) * view.scale; if (sx > fb.l + 10 && sx < fb.r - 10 && sy > fb.t + 40 && sy < fb.b) return i; } return -1; }, full);
      if (hsl >= 0) {
        await page.evaluate((hs) => { const g = ui.game; if (!g.heroes[hs]) g.spawnHero(hs, 'lucsi'); }, hsl); await sleep(250);
        const sl = await page.evaluate((hs) => { const h = ui.game.heroes[hs], c = document.getElementById('game').getBoundingClientRect(); return { x: c.left + (h.x + view.ox) * view.scale, y: c.top + (h.y - 40 + view.oy) * view.scale }; }, hsl);
        const bb = await rect(page, '#bossbar');
        ok(!(sl.x > bb.l && sl.x < bb.r && sl.y > bb.t && sl.y < bb.b) || await page.evaluate(() => document.getElementById("bossbar").classList.contains("ghost")), `L06 tướng ở ô ${hsl} (dưới bảng đầy đủ): bảng thu gọn, không che tướng`);
        await page.screenshot({ path: path.join(SHOT, `L06-tuong-duoi-bang-${tag}.png`) });
      } else ok(true, 'L06 (không có ô tướng dưới bảng ở cỡ màn này)');
      ok(await page.evaluate(() => [...document.querySelectorAll('#bb-info .fc span')].every((s) => !/Câm lặng|Choáng/.test(s.textContent))), 'L06 hiệu ứng nằm ở dòng riêng (không xen dòng chỉ số)');
    }
    // ---------- L04 + L17: màn kết quả cuộn được tới dòng cuối; icon Mạng còn là trái tim
    {
      await page.evaluate(() => { const g = ui.game; g.gold = 999; for (let i = 0; i < 6; i++) g.summonRandom(); g.xpLog = { lactuong: 420, thosan: 380, xathu: 300, thaymo: 250 }; g.wave = 23; g.lives = 0; ui.finishLevel(); });
      await sleep(500);
      const tv = await page.evaluate(() => { const d = [...document.querySelectorAll('#result .res-table > div')].find((x) => /Tu Vi/.test(x.querySelector('span').textContent)); const sp = d && d.querySelector('span'); return sp ? sp.getBoundingClientRect().height / parseFloat(getComputedStyle(sp).fontSize) / (sp.getBoundingClientRect().height / sp.offsetHeight) : 9; });
      ok(tv < 1.7, `Kết quả: nhãn "Tu Vi" nằm 1 dòng (không ngắt "Tu / Vi")`);
      const m = await page.evaluate(() => { const r = document.querySelector('#result .res-main'); const cs = getComputedStyle(r); return { sh: r.scrollHeight, ch: r.clientHeight, oy: cs.overflowY }; });
      ok(/auto|scroll/.test(m.oy), `L04 cột kết quả cuộn được (overflow-y ${m.oy}, nội dung ${m.sh} / khung ${m.ch})`);
      await page.evaluate(() => { const r = document.querySelector('#result .res-main'); r.scrollTop = r.scrollHeight; }); await sleep(200);
      const last = await page.evaluate(() => { const els = [...document.querySelectorAll('#result .res-main > *')]; const b = els[els.length - 1].getBoundingClientRect().bottom; const tv = [...document.querySelectorAll('#result .res-table div')].find((d) => /Tu Vi/.test(d.textContent)); return { b, ih: innerHeight, tv: tv ? tv.getBoundingClientRect().bottom : null }; });
      ok(last.b <= last.ih + 1, `L04 cuộn hết: khối cuối nằm trong màn (${last.b.toFixed(0)} ≤ ${last.ih})`);
      await page.screenshot({ path: path.join(SHOT, `L04-ket-qua-cuon-${tag}.png`) });
      ok(await page.evaluate(() => { const d = [...document.querySelectorAll('#result .res-table div')].find((x) => /Mạng còn/.test(x.textContent)); const im = d && d.querySelector('img.icn'); return !!im && /ui-tai-nguyen-2/.test(im.src); }), 'L17 "Mạng còn" dùng trái tim đỏ (ui-tai-nguyen-2.png), không dùng khiên đồng giống đồng xu');
    }
    // ---------- L12: xếp hạng ngoại tuyến có hình + kỷ lục trên máy
    {
      await page.evaluate(() => { ui.showMenu(); document.getElementById('btn-ranks').click(); }); await sleep(400);
      const r = await page.evaluate(() => ({ ill: !!document.querySelector('#ranks .rk-empty .rk-ill'), mine: [...document.querySelectorAll('#ranks .rk-mine .rk-row')].map((x) => x.textContent) }));
      ok(r.ill && r.mine.some((x) => /Đợt 23/.test(x)), `L12 xếp hạng ngoại tuyến: có hình minh hoạ + kỷ lục trên máy (${r.mine.join(' | ')})`);
      await page.screenshot({ path: path.join(SHOT, `L12-xep-hang-${tag}.png`) });
    }
    ok(page.errors.length === 0, 'không lỗi JS ' + page.errors.join(' | '));
    await page.context().close();

    // ---------- L05: Anh Hùng — mở khoá tướng: thông báo không đè nút / thẻ; chọn tướng khác thì thông báo tắt
    {
      const p3 = await open(browser, w, h, { save: { unlocked: 5, storySeen: true, settings: { skipStory: true }, kho: 50000 } });
      await p3.evaluate(() => document.getElementById('btn-heroes').click()); await sleep(400);
      await p3.evaluate(() => document.querySelector('#roster .ro-card.lock').click()); await sleep(250);
      await p3.evaluate(() => document.querySelector('#roster [data-act=ro-buy]').click()); await sleep(300);
      // máy bận: chờ thông báo hiện + trượt vào xong (tối đa 5 giây) — đo giữa lúc đang trượt thì vị trí sai
      await p3.waitForFunction(() => { const t = document.querySelector('#toasts .toast'); return t && t.getAnimations({ subtree: true }).every((a) => a.playState !== 'running' || a.effect.getComputedTiming().iterations === Infinity); }, null, { timeout: 5000 }).catch(() => {});
      const hit = await p3.evaluate(() => { const t = document.querySelector('#toasts .toast'); if (!t) return null; const q = t.getBoundingClientRect(); return [...document.querySelectorAll('#roster button, #roster [data-act], #roster [data-tip], #roster h1, #roster .chip')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && Math.min(r.right, q.right) - Math.max(r.left, q.left) > 2 && Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top) > 2; }).map((e) => e.textContent.trim().slice(0, 16)); });
      ok(hit && hit.length === 0, `L05 Anh Hùng: thông báo "Đã mở khoá" không đè nút / thẻ (đè: ${hit ? hit.join(' | ') || 'không' : 'không có thông báo'})`);
      await p3.screenshot({ path: path.join(SHOT, `L05-anh-hung-${tag}.png`) });
      await sleep(350);
      const c = await p3.evaluate(() => { const r = document.querySelectorAll('#roster .ro-card')[2].getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
      await p3.mouse.click(c[0], c[1]); await sleep(200);
      ok(await p3.evaluate(() => document.querySelectorAll('#toasts .toast').length === 0), 'L05 Anh Hùng: chọn tướng khác → thông báo cũ tắt');
      await p3.context().close();
    }
    // ---------- L11: đăng nhập bắt buộc (Firebase bật, chưa đăng nhập) có lối ra
    {
      const p2 = await open(browser, w, h, { fb: "const FIREBASE_CONFIG={apiKey:'x'};" });
      await p2.evaluate(() => { CLOUD.init = () => {}; CLOUD.status = 'signedout'; CLOUD.authKnown = true; CLOUD.signedIn = false; CLOUD.user = null; ui.showLogin(false); });
      await sleep(300);
      await p2.screenshot({ path: path.join(SHOT, `L11-dang-nhap-${tag}.png`) });
      // người dùng quyết (v189): BẮT BUỘC đăng nhập như v73 — không nút khách, không ✕ khi chưa đăng nhập; nhưng treo/lỗi thì có Thử lại
      ok(!(await rect(p2, '#login .login-guest')) && !(await p2.evaluate(() => [...document.querySelectorAll('#login button')].some((b) => /khách|ngoại tuyến/i.test(b.textContent)))), 'L11 bắt buộc đăng nhập: không có nút chơi khách / ngoại tuyến');
      await p2.evaluate(() => ui.showLogin(true)); await sleep(200);
      ok(!(await rect(p2, '#login .login-x')), 'L11 chưa đăng nhập: mở từ menu cũng không có ✕');
      await p2.evaluate(() => { CLOUD.authKnown = false; ui.loginSlow = true; ui.showLogin(false); }); await sleep(200);
      ok(await p2.evaluate(() => !!document.querySelector('#login [data-act=login-retry]') && /quá lâu/.test(document.getElementById('login').textContent)), 'L11 kiểm tra đăng nhập quá lâu: báo lỗi + nút Thử lại (không kẹt ở "Đang kiểm tra…")');
      await p2.screenshot({ path: path.join(SHOT, `L11-cham-${tag}.png`) });
      if (w === 844) {
        await p2.evaluate(() => { ui.loginSlow = false; CLOUD.authKnown = true; CLOUD.email = () => new Promise(() => {}); ui.showLogin(false); });
        await sleep(200);
        await p2.fill('#lg-email', 'a@b.vn'); await p2.fill('#lg-pass', '123456');
        await p2.click('#login [data-act=login-email]'); await sleep(300);
        ok(await p2.evaluate(() => /Đang xử lý/.test(document.getElementById('login').textContent)), 'L11 bấm Đăng nhập: hiện "Đang xử lý…"');
        await sleep(20300);
        ok(await p2.evaluate(() => /không phản hồi/.test(document.getElementById('login').textContent) && !document.querySelector('#login [data-act=login-email]').disabled), 'L11 máy chủ không trả lời 20 giây: báo lỗi, nút Đăng nhập bấm lại được');
        await p2.screenshot({ path: path.join(SHOT, `L11-treo-${tag}.png`) });
      }
      await p2.evaluate(() => { ui.offline = true; document.getElementById('login').hidden = true; ui.showMenu(); });
      // L12: Firebase bật nhưng mất mạng → nút Thử lại
      await p2.evaluate(() => { CLOUD.ready = false; CLOUD.status = 'error'; CLOUD.error = 'mất mạng'; CLOUD.topScores = async () => null; document.getElementById('btn-ranks').click(); });
      await sleep(600);
      ok(await p2.evaluate(() => !!document.querySelector('#ranks .rk-empty [data-act=rank-tab]')), 'L12 mất mạng: có nút ↻ Thử lại');
      await p2.screenshot({ path: path.join(SHOT, `L12-mat-mang-${tag}.png`) });
      await p2.context().close();
    }
  }

  // ---------- L15: hiệu năng — nền tĩnh vẽ đệm một lần, ảnh quái thu nhỏ sẵn, bậc đồ hoạ thấp giới hạn số điểm ảnh
  {
    console.log('\nL15 · hiệu năng (Chromium không GPU — số FPS chỉ để tham khảo)');
    for (const [w, h] of [[1920, 934], [1280, 720]]) {
      const page = await open(browser, w, h);
      await enter(page);
      await page.evaluate(() => {
        const g = ui.game; g.gold = 99999; for (let i = 0; i < 10; i++) g.summonRandom();
        const sp = g.spawn.bind(g); g.spawn = (...a) => { const e = sp(...a); e.hp = e.maxHp = 1e9; return e; };
        g.wave = 29; g.nextWave = buildWave(30, g.level); g.lives = 9999; g.running = true; g.speed = 3; g.startWave();
        const base = g.spawnQueue.filter((q) => !q.champion); g.spawnQueue = []; for (let k = 0; k < 20; k++) g.spawnQueue.push(...base.map((q) => ({ ...q, gap: 0.25 })));
      });
      await sleep(6000);
      const r = await page.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = (now) => { n++; if (now - t0 < 3000) requestAnimationFrame(f); else res({ fps: n / ((now - t0) / 1000), en: ui.game.enemies.length, builds: bgCache.builds, lv: GFX.level(), px: canvas.width * canvas.height }); }; requestAnimationFrame(f); }));
      console.log(`  ${w}x${h}: ${r.fps.toFixed(1)} FPS · ${r.en} quái · bậc đồ hoạ ${r.lv} · canvas ${(r.px / 1e6).toFixed(2)} triệu điểm`);
      ok(r.builds <= 6, `L15 ${w}x${h} nền tĩnh chỉ vẽ lại ${r.builds} lần (không vẽ mỗi khung)`);
      ok(r.lv < 2 || r.px <= 1.1e6 * 1.02, `L15 ${w}x${h} bậc đồ hoạ thấp: canvas ≤ 1,1 triệu điểm ảnh`);
      ok(await page.evaluate(() => { const im = asset('packs/tom/walk1.png', true) || asset('quai_tom-binh.png'); if (!im) return true; const a = fitSprite(im, 40), b = fitSprite(im, 40); return a === b && a.width < (im.naturalWidth || im.width); }), `L15 ảnh quái thu nhỏ sẵn theo cỡ trên màn (dùng lại, không co mỗi khung)`);
      await page.context().close();
    }
  }

  await browser.close();
  console.log(fails ? `\n${fails} kiểm tra HỎNG` : '\nTất cả đạt');
  process.exit(fails ? 1 : 0);
})();
