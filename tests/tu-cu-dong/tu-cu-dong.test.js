// Test TỰ CỬ ĐỘNG (claude/tu-cu-dong): 1 ảnh tĩnh → game tự chuyển động (js/tu-cu-dong.js).
// Chạy: node tests/tu-cu-dong/tu-cu-dong.test.js   (ảnh chụp ở tests/tu-cu-dong/shots/)
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const { enter, ok, ROOT } = require('../cho-tuong/helpers');

const SHOTS = path.join(__dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SIZES = [[1920, 934], [844, 390], [667, 375]];
const MA = 'lactuong,xathu,thosan,thaymo,lucsi,kinhduong,kybinh,cao,anvuong';

async function open(browser, w, h, q = '') {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::|favicon|firebase|gstatic/i.test(m.text())) page.errors.push(m.text()); });
  await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
  await page.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('nuicao.v1', JSON.stringify({ unlocked: 5, storySeen: true, settings: { skipStory: true } })); sessionStorage.setItem('seeded', '1'); } });
  await page.goto('file://' + path.join(ROOT, 'index.html') + q);
  await page.waitForTimeout(1200);
  return page;
}

async function main() {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });

  // ---------- 1. đo ảnh: khung bao, hàng chân, tâm chân (ảnh giả có lề trong suốt + vũ khí chìa một bên)
  console.log('Đo ảnh đơn:');
  {
    const page = await open(browser, 844, 390);
    const r = await page.evaluate(() => {
      const c = document.createElement('canvas'); c.width = 400; c.height = 400;
      const x = c.getContext('2d');
      x.fillStyle = '#c33'; x.fillRect(150, 60, 80, 240);   // thân: chân ở hàng 300 (còn 100 px lề dưới)
      x.fillRect(150, 300, 30, 40); x.fillRect(200, 300, 30, 40);   // 2 chân tới hàng 340
      x.fillRect(230, 100, 140, 12);                       // giáo chìa sang phải
      c.naturalWidth = 400; c.naturalHeight = 400;
      const p = cdPrepare(c);
      return { w: p.c.width, h: p.c.height, ar: p.ar, fx: p.fx, again: cdPrepare(c) === p };
    });
    ok(Math.abs(r.h / r.w - (280 / 220)) < 0.08, `cắt sát khung bao (bỏ lề trong suốt): ${r.w}×${r.h}`);
    ok(Math.abs(r.fx - (40 / 220)) < 0.06, `tâm chân theo đáy hình, không theo giữa ảnh (giáo chìa phải): fx=${r.fx.toFixed(3)}`);
    ok(r.again, 'đo một lần, lần sau dùng lại (không tạo canvas mỗi khung)');

    // ---------- 2. chọn ảnh đơn: bộ nhiều khung vẫn ưu tiên; chỉ còn idle (hoặc <mã>.png) → ảnh đơn
    console.log('Chọn ảnh:');
    const s = await page.evaluate(() => {
      const a = !!cdSoloImg('lactuong', false);
      ['wind', 'strike', 'cast'].forEach((n) => ASSET_SET.delete(`packs/xathu/${n}.png`)); cdMultiCache.clear();
      ASSET_SET.add('ma-moi.png');
      return { lac: a, xathu: hasAsset('packs/xathu/idle.png') && !cdHasMulti('xathu', false), tom: !!cdSoloImg('tom', true), path: ['ma-moi.png', 'packs/ma-moi/idle.png'].filter(hasAsset) };
    });
    ok(!s.lac, 'Lạc Tướng có bộ nhiều khung (wind / strike) → giữ đường vẽ cũ');
    ok(s.xathu, 'chỉ còn packs/<mã>/idle.png → coi là ảnh đơn');
    ok(!s.tom, 'quái có walk2 / attack → giữ bộ nhiều khung');
    ok(s.path[0] === 'ma-moi.png', '<mã>.png ở gốc assets/ được nhận làm ảnh đơn');
    await page.close();
  }

  // ---------- 3. tư thế: biên độ hợp lý, chết mờ dần (không biến mất cụt), lệch pha giữa các tướng
  console.log('Tư thế:');
  {
    const page = await open(browser, 844, 390);
    const r = await page.evaluate(() => {
      const out = { minS: 9, maxS: 0, maxRot: 0, alpha: [], phases: new Set() };
      for (const melee of [true, false]) for (let sw = 1; sw >= 0; sw -= 0.02) {
        const P = cdPose({ t: 1, seed: 0.3, swing: sw, melee });
        out.minS = Math.min(out.minS, P.sx, P.sy); out.maxS = Math.max(out.maxS, P.sx, P.sy); out.maxRot = Math.max(out.maxRot, Math.abs(P.rot)); if (P.phase) out.phases.add(P.phase);
      }
      for (const f of [0.6, 0.45, 0.3, 0.15, 0.01]) out.alpha.push(cdPose({ t: 1, seed: 0, fall: f }).alpha);
      const cast = cdPose({ t: 1, seed: 0, castT: 0.3, castUlt: true });
      const rage = cdPose({ t: 1, seed: 0, enraged: true });
      const hurt = cdPose({ t: 1, seed: 0, hurt: 0.2 });
      const a = cdPose({ t: 3, seed: cdSeed(1, 'lactuong') }), b = cdPose({ t: 3, seed: cdSeed(2, 'lactuong') });
      return { ...out, phases: [...out.phases], cast: [cast.sy, cast.glow, cast.dy], rage: [rage.sx, rage.flash, rage.flashC], hurt: [hurt.flash, hurt.dx], desync: Math.abs(a.sy - b.sy) + Math.abs(a.bend - b.bend) };
    });
    ok(r.minS > 0.85 && r.maxS < 1.25, `co giãn trong khoảng an toàn ${r.minS.toFixed(3)}…${r.maxS.toFixed(3)} (không méo hình)`);
    ok(r.maxRot < 0.2, `nghiêng tối đa ${r.maxRot.toFixed(3)} rad khi đánh`);
    ok(['wind', 'strike', 'recover'].every((p) => r.phases.includes(p)), 'đánh đủ 3 pha: lấy đà → lao tới → bật về');
    ok(r.alpha.every((a, i) => i === 0 || a < r.alpha[i - 1]) && r.alpha[4] > 0.1 && r.alpha[4] < 0.25, `chết mờ dần ${r.alpha.map((a) => a.toFixed(2)).join(' → ')} (không biến mất cụt)`);
    ok(r.cast[0] > 1.1 && r.cast[1] > 0.9 && r.cast[2] < 0, 'tung chiêu: nhún lên, phóng to, phát sáng viền');
    ok(r.rage[0] > 1.1 && r.rage[1] > 0.2 && r.rage[2] === '#FF2A1A', 'boss nổi giận: phồng to, ám đỏ');
    ok(r.hurt[0] > 0.5 && r.hurt[1] < 0, 'trúng đòn: chớp sáng + giật lùi');
    ok(r.desync > 0.004, 'các tướng lệch pha (không thở đồng bộ)');

    // ---------- 4. chân không trôi: vẽ một tướng ảnh đơn, đáy hình & tâm chân đứng yên khi thở / lấy đà
    const feet = await page.evaluate(async () => {
      CD.force = true;
      const c = document.createElement('canvas'); c.width = 300; c.height = 300;
      const x = c.getContext('2d', { willReadFrequently: true });
      const img = cdSoloImg('lactuong', false);
      for (let i = 0; i < 40 && !img; i++) await new Promise((r) => setTimeout(r, 50));
      const res = [];
      const meas = (o) => {
        x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, 300, 300);
        drawHeroSprite(x, { type: 'lactuong', id: 3, tier: 1, equip: {} }, 150, 270, { t: o.t, scale: 1, noShadow: true, swing: o.swing || 0 });
        const d = x.getImageData(0, 0, 300, 300).data;
        let bot = 0; for (let y = 299; y >= 0 && !bot; y--) for (let xx = 0; xx < 300; xx++) if (d[(y * 300 + xx) * 4 + 3] > 80) { bot = y; break; }
        let n = 0, sx = 0; for (let y = bot - 6; y <= bot; y++) for (let xx = 0; xx < 300; xx++) if (d[(y * 300 + xx) * 4 + 3] > 80) { n++; sx += xx; }
        return { bot, cx: n ? sx / n : 0 };
      };
      for (let k = 0; k < 12; k++) res.push(meas({ t: k * 0.21 }));
      const wind = meas({ t: 1, swing: 0.8 });
      return { idle: res, wind };
    });
    const bots = feet.idle.map((f) => f.bot), cxs = feet.idle.map((f) => f.cx);
    ok(Math.max(...bots) - Math.min(...bots) <= 2, `đứng thở: đáy hình (chân) lệch ≤ 2 px (${Math.min(...bots)}…${Math.max(...bots)})`);
    ok(Math.max(...cxs) - Math.min(...cxs) <= 3, `đứng thở: tâm chân trôi ngang ≤ 3 px (${(Math.max(...cxs) - Math.min(...cxs)).toFixed(1)} px)`);
    ok(Math.abs(feet.wind.bot - bots[0]) <= 3, 'lấy đà: chân vẫn chạm đất');
    ok(page.errors.length === 0, 'không lỗi trang: ' + page.errors.join(' | '));
    await page.close();
  }

  // ---------- 5. trang thử tools/xem-cu-dong.html → index.html?xem-cu-dong: đủ nhân vật, đủ trạng thái, chụp ảnh
  console.log('Trang thử:');
  for (const [w, h] of SIZES) {
    const page = await open(browser, w, h, `?xem-cu-dong&ma=${MA}`);
    await page.waitForFunction(() => window.XEM && XEM.frames > 5, null, { timeout: 15000 });
    await page.evaluate(() => { XEM.pause = true; });
    const n = await page.evaluate(() => XEM.cells.length);
    ok(n === MA.split(',').length, `${w}×${h}: ${n} nhân vật trong lưới`);
    for (const st of ['attack', 'cast', 'hurt', 'die', 'walk', 'rage']) {
      await page.selectOption('#xcd-st', st);
      for (const [i, dt] of [[0, 0.12], [1, 0.3], [2, 0.5]]) {
        await page.evaluate((t) => { document.querySelector('#xem-cu-dong').scrollTop = 0; XEM.draw(t); }, 20 + dt);
        if (w === 1920 || i === 1) await page.screenshot({ path: path.join(SHOTS, `${w}x${h}-${st}-${i}.jpg`), quality: 80 });
      }
    }
    ok(page.errors.length === 0, `${w}×${h}: không lỗi trang ` + page.errors.join(' | '));
    await page.close();
  }
  const tool = fs.readFileSync(path.join(ROOT, 'tools/xem-cu-dong.html'), 'utf8');
  ok(/index\.html\?xem-cu-dong/.test(tool), 'tools/xem-cu-dong.html mở được trang thử');

  // ---------- 6. chơi thật ?solo=1: tướng + quái vẽ bằng ảnh đơn, đo FPS so với bộ nhiều khung
  console.log('Trong trận:');
  const fps = {};
  for (const q of ['', '?solo=1']) {
    for (const [w, h] of SIZES) {
      const page = await open(browser, w, h, q);
      await enter(page);
      await page.evaluate(() => {
        const g = ui.game; g.gold = 99999; for (let i = 0; i < 10; i++) g.summonRandom();
        const sp = g.spawn.bind(g); g.spawn = (...a) => { const e = sp(...a); e.hp = e.maxHp = 1e9; return e; };
        g.wave = 29; g.nextWave = buildWave(30, g.level); g.lives = 9999; g.running = true; g.speed = 3; g.startWave();
        const base = g.spawnQueue.filter((s) => !s.champion); g.spawnQueue = []; for (let k = 0; k < 8; k++) g.spawnQueue.push(...base.map((s) => ({ ...s, gap: 0.25 })));
      });
      await sleep(4500);
      const r = await page.evaluate(() => new Promise((res) => { const s0 = { ...CD.stats }; let n = 0; const t0 = performance.now(); const f = (now) => { n++; if (now - t0 < 2500) requestAnimationFrame(f); else res({ fps: n / ((now - t0) / 1000), en: ui.game.enemies.length, hero: CD.stats.hero - s0.hero, enemy: CD.stats.enemy - s0.enemy }); }; requestAnimationFrame(f); }));
      fps[q + w] = r.fps;
      console.log(`  ${q || 'nhiều khung'} ${w}×${h}: ${r.fps.toFixed(1)} FPS · ${r.en} quái · vẽ ảnh đơn: ${r.hero} lượt tướng, ${r.enemy} lượt quái`);
      // ẩn bảng "bộ quái mới" / thông báo cho ảnh chụp thấy rõ sân
      await page.evaluate(() => { const r = document.querySelector('#roster-hint'); if (r) r.hidden = true; document.querySelectorAll('.toast, #toasts > *').forEach((e) => e.remove()); });
      await sleep(150);
      await page.screenshot({ path: path.join(SHOTS, `tran-${q ? 'anh-don' : 'nhieu-khung'}-${w}x${h}.jpg`), quality: 80 });
      if (q) ok(r.hero > 0 && r.enemy > 0, `${w}×${h}: ?solo=1 vẽ tướng + quái bằng ảnh đơn`);
      else ok(r.hero === 0 && r.enemy === 0, `${w}×${h}: không ép thì vẫn dùng bộ nhiều khung (không đổi gì)`);
      ok(page.errors.length === 0, `${w}×${h}: không lỗi trang ` + page.errors.join(' | '));
      await page.close();
    }
  }
  for (const [w] of SIZES) ok(fps['?solo=1' + w] >= fps[w] * 0.8, `${w}: FPS ảnh đơn ${fps['?solo=1' + w].toFixed(1)} ≥ 80% nhiều khung ${fps[w].toFixed(1)} (Chromium không GPU, tham khảo)`);
  await browser.close();
  console.log('Tất cả đạt');
}
main().catch((e) => { console.error(e); process.exit(1); });
