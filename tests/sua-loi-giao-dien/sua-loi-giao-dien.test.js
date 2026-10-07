// Test nhánh claude/sua-loi-giao-dien: lỗi tester báo ở bản 194–195 (T1–T5, T7, G5–G7).
// Chạy: node tests/sua-loi-giao-dien/sua-loi-giao-dien.test.js — ảnh chụp: tests/sua-loi-giao-dien/shots/
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
const SIZES = [[1920, 934], [844, 390], [667, 375], [390, 844]];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(browser, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(String(e)));
  await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
  await page.addInitScript((s) => localStorage.setItem('nuicao.v1', JSON.stringify(s)), SAVE);
  await page.goto(URL);
  await page.waitForTimeout(900);
  return page;
}
const enter = (page) => page.evaluate(() => {
  ui.playLevel(0, false); document.querySelector('[data-act=prep-go]').click();
  const g = ui.game; g.gold = 99999; for (let i = 0; i < 8; i++) g.summonRandom();
});
const bossWave = (page) => page.evaluate(() => { const g = ui.game; g.wave = 9; g.nextWave = buildWave(10, g.level); g.running = true; g.startWave(); g.spawnQueue = g.spawnQueue.filter((q) => ENEMIES[q.type].boss); for (const q of g.spawnQueue) q.gap = 0; });
// độ sáng trung bình vùng giữa canvas bản đồ (đen = 0)
const mapLight = (page) => page.evaluate(() => { const c = document.getElementById('game'), x = c.getContext('2d'); const d = x.getImageData(c.width * 0.3, c.height * 0.35, c.width * 0.4, c.height * 0.3).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] + d[i + 1] + d[i + 2]; return s / (d.length / 4) / 3; });
// phần giao của hộp thông báo với nút / tiêu đề / chip của các bảng đang mở (px²)
const toastHits = (page) => page.evaluate(() => {
  const ts = [...document.querySelectorAll('#toasts .toast')].map((t) => t.getBoundingClientRect());
  const open = ui.toastIds.filter((id) => !document.querySelector(id).hidden).map((id) => document.querySelector(id));
  const hits = [];
  for (const c of open) for (const e of c.querySelectorAll('button, .btn, [data-act], .chip, h1, .ttl, .sl-title')) {
    if (e.closest('[hidden]')) continue;
    const r = e.getBoundingClientRect();
    for (const t of ts) { const a = Math.max(0, Math.min(r.right, t.right) - Math.max(r.left, t.left)) * Math.max(0, Math.min(r.bottom, t.bottom) - Math.max(r.top, t.top)); if (a > 4) hits.push((e.textContent || '').trim().slice(0, 20)); }
  }
  return hits;
});

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });

  // ---------- T1: thu cửa sổ về gần 0 rồi trả lại → bản đồ không đen, không lỗi drawImage cỡ 0
  {
    console.log('T1 · cửa sổ thu về 1×1 / 0×0 rồi trả lại');
    for (const lv of [0, 2]) {
      const page = await open(browser, 844, 390);
      await enter(page); await sleep(600);
      for (const [w, h] of [[1, 1], [0, 0], [30, 12], [1, 1]]) { await page.setViewportSize({ width: w, height: h }).catch(() => {}); await sleep(300); }
      await page.setViewportSize({ width: 844, height: 390 }); await sleep(700);
      const L = await mapLight(page);
      await page.screenshot({ path: path.join(SHOT, `T1-ai${lv + 1}.png`) });
      ok(L > 40, `ải ${lv + 1}: bản đồ vẽ lại sau khi trả cửa sổ (độ sáng ${L.toFixed(0)} > 40)`);
      ok(page.errors.length === 0, `ải ${lv + 1}: không lỗi JS ${page.errors.slice(0, 2).join(' | ')}`);
      await page.context().close();
    }
    // vòng lặp vẽ sống sót cả khi một khung vẽ ném lỗi
    const page = await open(browser, 844, 390);
    await enter(page); await sleep(300);
    const f0 = await page.evaluate(() => new Promise((res) => { const r0 = render; let n = 0; render = () => { if (n++ === 0) throw new Error('thử lỗi một khung'); r0(); }; setTimeout(() => res(n), 500); }));
    ok(f0 > 5, `vòng lặp vẽ chạy tiếp sau một khung lỗi (${f0} khung)`);
    await page.context().close();
  }

  for (const [w, h] of SIZES) {
    const tag = `${w}x${h}`;
    console.log(`\n== ${tag}`);

    // ---------- T2 + T3: boss là quái cuối bị hạ → Sính lễ trước, Nghỉ chân sau; thông báo không đè bảng
    {
      const page = await open(browser, w, h);
      await enter(page); await sleep(300); await bossWave(page); await sleep(1500);
      await page.evaluate(() => { const g = ui.game; g.enemies.filter((e) => !e.def.boss).forEach((e) => { e.dead = true; }); const b = g.enemies.find((e) => e.def.boss); g.kill(b, null); b.dead = true; });
      await sleep(500);
      const s1 = await page.evaluate(() => ({ reward: !$('#reward').hidden, rest: !$('#rest').hidden }));
      ok(s1.reward && !s1.rest, `T2 hạ boss cuối: mở Sính lễ, Nghỉ chân chưa mở (${JSON.stringify(s1)})`);
      const hit = await toastHits(page);
      ok(hit.length === 0, `T3 Sính lễ: thông báo không đè nút / tiêu đề / chip (${hit.join(' | ') || 'không'})`);
      await page.screenshot({ path: path.join(SHOT, `T2-sinh-le-${tag}.png`) });
      await sleep(1000);
      await page.evaluate(() => document.querySelector('#reward [data-act=reward]').click()); await sleep(400);
      const s2 = await page.evaluate(() => ({ reward: !$('#reward').hidden, rest: !$('#rest').hidden }));
      ok(!s2.reward && s2.rest, `T2 chọn thưởng xong mới mở Nghỉ chân (${JSON.stringify(s2)})`);
      const hit2 = await toastHits(page);
      ok(hit2.length === 0, `T3 Nghỉ chân: thông báo không đè nút (${hit2.join(' | ') || 'không'})`);
      await page.screenshot({ path: path.join(SHOT, `T2-nghi-chan-${tag}.png`) });
      // Sính lễ đến khi Nghỉ chân đang mở → Sính lễ lên trước, Nghỉ chân mở lại sau
      await page.evaluate(() => { const g = ui.game; ui.showReward({ options: g.bossRewards('thuongluong'), id: 2, boss: 'thuongluong' }); });
      await sleep(200);
      const s3 = await page.evaluate(() => ({ reward: !$('#reward').hidden, rest: !$('#rest').hidden }));
      ok(s3.reward && !s3.rest, `T2 Sính lễ đến khi Nghỉ chân đang mở: Sính lễ lên trước (${JSON.stringify(s3)})`);
      ok(page.errors.length === 0, 'không lỗi JS ' + page.errors.join(' | '));
      await page.context().close();
    }

    // ---------- T3: màn Tiến hoá, ngăn kéo ≡ — thông báo không đè
    {
      const page = await open(browser, w, h);
      await enter(page); await sleep(300);
      await page.evaluate(() => { ui.openScreen('evo'); ui.toast('Thánh Gióng tiến hoá lên ★★!', '#F2D27A'); }); await sleep(400);
      const hit = await toastHits(page);
      ok(hit.length === 0, `T3 Tiến hoá: thông báo không đè chip / nút (${hit.join(' | ') || 'không'})`);
      await page.screenshot({ path: path.join(SHOT, `T3-tien-hoa-${tag}.png`) });
      await page.evaluate(() => { ui.closeScreen(); }); await sleep(300);
      await page.evaluate(() => { document.getElementById('btn-menu').click(); ui.toast('Hoàn thành đợt 3! +35 vàng · núi cao +12 vàng', '#F2D27A'); ui.toast('Rơi đồ: Giáp đồng (Hiếm)', '#5AB4D6'); }); await sleep(400);
      const dh = await page.evaluate(() => { const ts = [...document.querySelectorAll('#toasts .toast')].map((t) => t.getBoundingClientRect()); return [...document.querySelectorAll('#drawer .dw-btn')].filter((b) => { const r = b.getBoundingClientRect(); return ts.some((t) => Math.min(r.right, t.right) - Math.max(r.left, t.left) > 2 && Math.min(r.bottom, t.bottom) - Math.max(r.top, t.top) > 2); }).map((b) => b.textContent.trim()); });
      ok(dh.length === 0, `T3 ngăn kéo ≡: thông báo không đè nút (${dh.join(' | ') || 'không'})`);
      await page.screenshot({ path: path.join(SHOT, `T3-ngan-keo-${tag}.png`) });
      ok(page.errors.length === 0, 'không lỗi JS ' + page.errors.join(' | '));
      await page.context().close();
    }

    // ---------- T4: đợt boss — "Quái mới" gộp vào lời thoại; bảng boss không đè con boss
    {
      const page = await open(browser, w, h);
      await enter(page); await sleep(300); await bossWave(page); await sleep(400);
      await page.evaluate(() => { ui.bossSel = ui.game.enemies.find((e) => e.def.boss); });
      await sleep(2700);
      const d = await page.evaluate(() => ({ dlg: !$('#dialogue').hidden && $('#dialogue').textContent, toasts: [...document.querySelectorAll('#toasts .toast')].map((t) => t.textContent) }));
      ok(d.dlg && /Quái mới/.test(d.dlg) && /Thuồng Luồng/.test(d.dlg), 'T4 lời thoại boss kèm dòng "Quái mới"');
      ok(!d.toasts.some((t) => /Quái mới: Thuồng Luồng/.test(t)), `T4 không còn thông báo "Quái mới" riêng chồng lên lời thoại (${d.toasts.join(' | ')})`);
      const bb = await page.evaluate(() => {
        const b = ui.bossSel; if (!b || $('#bossbar').hidden) return null;
        const box = enemyBox(b), x = (b.x + MAPX) / DK, y = (b.y - box.h * 0.45 + MAPY) / DK, rx = box.w * 0.4 / DK, ry = box.h * 0.5 / DK;
        const q = uiRect($('#bossbar').getBoundingClientRect());
        return { ov: Math.max(0, Math.min(q[2], x + rx) - Math.max(q[0], x - rx)) * Math.max(0, Math.min(q[3], y + ry) - Math.max(q[1], y - ry)), ghost: $('#bossbar').classList.contains('ghost') };
      });
      ok(bb && (bb.ov === 0 || bb.ghost), `T4 bảng boss không đè con boss (giao ${bb && bb.ov.toFixed(0)})`);
      await page.screenshot({ path: path.join(SHOT, `T4-boss-${tag}.png`) });
      ok(page.errors.length === 0, 'không lỗi JS ' + page.errors.join(' | '));
      await page.context().close();
    }

    // ---------- T5: bộ quái mới = banner nhỏ, không chặn chạm, tự tắt; nhường banner Thăng thần
    {
      const page = await open(browser, w, h);
      await enter(page); await sleep(300);
      await page.evaluate(() => { const g = ui.game; g.wave = 49; g.running = true; ui.checkRosterHint(); });
      await sleep(300);
      const r = await page.evaluate(() => { const e = $('#roster-hint'); const q = uiRect(e.getBoundingClientRect()); return { shown: !e.hidden, pe: getComputedStyle(e).pointerEvents, h: q[3] - q[1], H: UIH }; });
      ok(r.shown && r.pe === 'none', `T5 banner bộ quái mới hiện, không chặn chạm (pointer-events ${r.pe})`);
      ok(r.h < 70, `T5 banner thấp (${r.h.toFixed(0)} < 70 đơn vị)`);
      await page.screenshot({ path: path.join(SHOT, `T5-bo-quai-${tag}.png`) });
      await page.evaluate(() => ui.banner('Thăng thần', 'Thánh Gióng hóa thân Phù Đổng Thiên Vương')); await sleep(200);
      ok(await page.evaluate(() => $('#roster-hint').hidden), 'T5 banner Thăng thần hiện thì bộ quái mới nhường chỗ');
      await sleep(2700);
      ok(await page.evaluate(() => !$('#roster-hint').hidden), 'T5 banner lớn tắt → bộ quái mới hiện lại');
      await sleep(5800);
      ok(await page.evaluate(() => $('#roster-hint').hidden), 'T5 tự tắt');
      await page.context().close();
    }

    // ---------- G5 / G6 / G7 ngoài trận
    {
      const page = await open(browser, w, h);
      await page.evaluate(() => document.getElementById('btn-menu-codex').click()); await sleep(500);
      ok(await page.evaluate(() => !document.querySelector('#screen .goldbox')), 'G5 Bách khoa mở từ menu: không còn ô vàng "220"');
      await page.evaluate(() => ui.closeScreen()); await sleep(200);
      await page.evaluate(() => document.getElementById('btn-heroes').click()); await sleep(500);
      const bg = await page.evaluate(() => { const f = document.querySelector('.ro-grid > .rl-filter'); return f ? getComputedStyle(f).backgroundColor : 'none'; });
      ok(/^rgb\(/.test(bg), `G6 thanh lọc vai trò nền đặc (${bg})`);
      await page.evaluate(() => ui.showCampaign(0)); await sleep(500);
      const g7 = await page.evaluate(() => { const sc = document.querySelector('#campaign .cp-scroll'); const can = sc.scrollHeight - sc.clientHeight > 6; const on = sc.parentNode.classList.contains('can-down'); sc.scrollTop = 1e5; sc.dispatchEvent(new Event('scroll')); return { can, on, off: !sc.parentNode.classList.contains('can-down') }; });
      ok(g7.on === g7.can && g7.off, `G7 cột phải Bản đồ: gợi ý cuộn khi còn nội dung (${g7.can ? 'có' : 'không'} nội dung ẩn), tắt khi cuộn tới đáy`);
      await page.evaluate(() => { document.querySelector('#campaign .cp-scroll').scrollTop = 0; document.querySelector('#campaign .cp-scroll').dispatchEvent(new Event('scroll')); }); await sleep(250);
      await page.screenshot({ path: path.join(SHOT, `G7-ban-do-${tag}.png`) });
      ok(page.errors.length === 0, 'không lỗi JS ' + page.errors.join(' | '));
      await page.context().close();
    }
  }

  // ---------- T7: bị đánh liên tục → chớp trắng ngắt quãng, không trắng bệch suốt
  {
    console.log('\nT7 · chớp trúng đòn');
    const page = await open(browser, 844, 390);
    await enter(page); await sleep(300); await bossWave(page); await sleep(800);
    const k = await page.evaluate(() => { const g = ui.game, b = g.enemies.find((e) => e.def.boss); b.hp = b.maxHp * 100; let on = 0; for (let i = 0; i < 120; i++) { g.hit(b, 1, null, {}); g.updateEnemy(b, 1 / 60); if (b.hitT > 0) on++; } return on / 120; });
    ok(k < 0.5, `boss bị đánh mỗi khung: chớp trắng ${Math.round(k * 100)}% thời gian (< 50%)`);
    ok(page.errors.length === 0, 'không lỗi JS ' + page.errors.join(' | '));
    await page.context().close();
  }

  await browser.close();
  console.log(fails ? `\n${fails} lỗi` : '\nĐạt hết');
  process.exit(fails ? 1 : 0);
})();
