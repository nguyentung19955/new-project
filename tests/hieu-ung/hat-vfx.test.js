// Test claude/vfx-kenney: hệ hạt dùng ảnh assets/vfx/ (Kenney CC0) — lửa, độc, choáng, băng, làm chậm, nổ, quái / boss chết.
// - không lỗi console; số hạt bị giới hạn (MAX), có pool dùng lại; hạn mức ảnh trạng thái mỗi khung;
// - thiếu ảnh (404) → VFX.status trả cờ false, game vẽ cách cũ bằng code, hạt 'tex' vẽ quầng dự phòng;
// - chụp trong trận (1920×934, 844×390, 667×375) vào tests/hieu-ung/shots/ + đo FPS sơ bộ khi nhiều quái.
// Chạy: node tests/hieu-ung/hat-vfx.test.js
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('../cho-tuong/helpers');

const SHOTS = path.join(__dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

// đặt một hàng quái với đủ trạng thái, dừng trận để chụp
const stage = (page) => page.evaluate(() => {
  game.running = false;
  game.enemies.length = 0; game.effects.length = 0;
  const types = Object.keys(ENEMIES).filter((k) => !ENEMIES[k].boss && !ENEMIES[k].minion && !ENEMIES[k].flying);
  const L = PATH.total;
  const mk = (k, f, st) => { const e = game.spawn(types[k % types.length], L * f); Object.assign(e, st); return e; };
  mk(0, 0.18, { poisonT: 99, dotColor: '#E0452C' });                    // bỏng
  mk(1, 0.28, { stunT: 99, stunKind: 'stun' });                        // choáng
  mk(2, 0.38, { stunT: 99, stunKind: 'ice' });                         // đóng băng
  mk(3, 0.48, { poisonT: 99, dotColor: '#7FC24A', hp: 1 });            // độc (đã bị đánh → hiện thanh máu)
  mk(4, 0.58, { slowT: 99, slowPct: 30 });                             // làm chậm
  mk(5, 0.68, { poisonT: 99, dotColor: '#E0452C', stunT: 99, stunKind: 'stun' });
  for (const e of game.enemies) e.hp = Math.min(e.hp, e.maxHp * 0.6);
  return game.enemies.map((e) => ({ x: e.x, y: e.y }));
});
const boom = (page, at) => page.evaluate((at) => {
  const [a, b, c] = at;
  game.effects.push({ type: 'explosion', x: a.x, y: a.y, r: 70, ttl: 0.5, max: 0.5 });
  game.effects.push({ type: 'impact', kind: 'fireball', el: 'hoa', splash: 60, x: b.x, y: b.y, ttl: 0.3, max: 0.3 });
  game.effects.push({ type: 'nova', x: c.x, y: c.y, ttl: 0.4, max: 0.4 });
  game.effects.push({ type: 'scorch', x: c.x + 60, y: c.y + 10, r: 40, ttl: 1.4, max: 1.4 });
  game.effects.push({ type: 'die', etype: Object.keys(ENEMIES).find((k) => ENEMIES[k].boss), x: at[5].x, y: at[5].y, ttl: 0.4, max: 0.4 });
}, at);

(async () => {
  // ---------- 1. có ảnh: trạng thái bằng sprite, giới hạn hạt, pool
  {
    const { browser, page, errors } = await open(844, 390);
    await enter(page, 0);
    await page.waitForFunction(() => VFX.VFX_IMGS.every((n) => VFX.ready('vfx/' + n)), null, { timeout: 8000 });
    ok(true, 'nạp đủ ' + (await page.evaluate(() => VFX.VFX_IMGS.length)) + ' ảnh assets/vfx/');
    const at = await stage(page);
    await page.waitForTimeout(200);
    const r = await page.evaluate(() => {
      const c = document.createElement('canvas').getContext('2d');
      VFX.frame();
      return game.enemies.map((e) => VFX.status(c, e, enemyBox(e), 0, 1.3));
    });
    ok(r[0].dot && !r[0].stun, 'bỏng: ngọn lửa ảnh lua-*');
    ok(r[1].stun, 'choáng: sao choang-sao xoay trên đầu');
    ok(r[2].ice && !r[2].stun, 'đóng băng: ánh lấp lánh + mảnh băng');
    ok(r[3].dot, 'độc: mây doc-1 + bong bóng');
    ok(r[4].slow, 'làm chậm: sương lạnh + bông tuyết');
    ok(r[5].dot && r[5].stun, 'bỏng + choáng cùng lúc');
    // các trạng thái không vẽ lên thanh máu: mọi ảnh trạng thái nằm dưới đỉnh hình quái
    const hpOk = await page.evaluate(() => {
      const bad = [];
      const c = document.createElement('canvas').getContext('2d');
      const di = c.drawImage;
      for (const e of game.enemies) {
        const box = enemyBox(e), top = e.y - box.ay - 4, by = top - 3;
        for (const t of [0.1, 0.4, 0.7, 1.0, 1.3, 2.2]) {
          c.setTransform(1, 0, 0, 1, 0, 0);
          c.drawImage = function (im, x, y, w, h) {
            const m = this.getTransform();
            const y0 = m.f + Math.min(y * m.d, (y + h) * m.d) - Math.abs(m.c) * Math.abs(w);
            if (y0 < by - 1 + (Math.abs(m.b) + Math.abs(m.c) > 0.01 ? -6 : 0) - 4) bad.push([e.id, t, Math.round(y0), Math.round(by)]);
          };
          VFX.frame(); VFX.status(c, e, box, 0, t);
        }
      }
      c.drawImage = di;
      return bad;
    });
    ok(hpOk.length === 0, 'ảnh trạng thái không lên tới thanh máu' + (hpOk.length ? ' — ' + JSON.stringify(hpOk.slice(0, 4)) : ''));
    // giới hạn số hạt + pool
    const lim = await page.evaluate(() => {
      const max = VFX.max();
      for (let i = 0; i < 4000; i++) VFX.burst(400, 200, 1, '#FFB04A');
      const full = VFX.count();
      const d0 = VFX.dropped();
      VFX.decal(400, 200, 'vfx/no-2', null, 20, 0.5, { must: true });
      const afterMust = VFX.count();
      VFX.update(2); VFX.update(2);
      const pool = VFX.poolSize(), empty = VFX.count();
      for (let i = 0; i < 100; i++) VFX.burst(400, 200, 1, '#FFB04A');
      return { max, full, d0, afterMust, pool, empty, pool2: VFX.poolSize(), n2: VFX.count() };
    });
    ok(lim.full <= lim.max && lim.full === lim.max, `số hạt không vượt MAX (${lim.full}/${lim.max}), ${lim.d0} hạt bị bỏ`);
    ok(lim.afterMust === lim.max, 'hạt quan trọng (must) thế chỗ khi đầy, không vượt MAX');
    ok(lim.empty === 0 && lim.pool >= lim.max * 0.9, `hạt chết vào pool (${lim.pool})`);
    ok(lim.n2 === 100 && lim.pool2 === lim.pool - 100, 'hạt mới lấy lại từ pool, không tạo object mới');
    // hạn mức ảnh trạng thái mỗi khung
    const sb = await page.evaluate(() => {
      const c = document.createElement('canvas').getContext('2d');
      VFX.frame();
      const e0 = game.enemies[0], box = enemyBox(e0);
      let n = 0;
      for (let i = 0; i < 400; i++) { VFX.status(c, e0, box, 0, i * 0.01); n++; }
      return { drawn: VFX.statusDrawn() };
    });
    ok(sb.drawn <= 180, `ảnh trạng thái mỗi khung bị giới hạn (${sb.drawn} ≤ 180)`);
    // mọi loại hiệu ứng gọi qua onEffect không lỗi
    await page.evaluate(() => {
      const types = ['impact', 'slash', 'xslash', 'claw', 'bash', 'explosion', 'pillar', 'nova', 'snow', 'bolt', 'heal', 'dome', 'rockfall', 'cracks',
        'splat', 'wave', 'gust', 'petals', 'beam', 'streak', 'cast', 'evolve', 'summon', 'die', 'scorch', 'meteor'];
      for (const el of [null, 'kim', 'moc', 'thuy', 'hoa', 'tho'])
        for (const type of types) VFX.onEffect({ type, x: 300, y: 200, x2: 400, y2: 220, r: 50, el, splash: el ? 40 : 0, kind: 'fireball', etype: 'haba', ult: true });
      VFX.update(0.05); VFX.draw(document.querySelector('canvas').getContext('2d'));
    });
    // ---------- chụp ở 3 cỡ màn hình
    for (const [w, h] of [[1920, 934], [844, 390], [667, 375]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(400);
      const at2 = await stage(page);
      await page.waitForTimeout(150);
      await boom(page, at2);
      await page.waitForTimeout(170);
      const f = path.join(SHOTS, `hat-vfx-${w}x${h}.png`);
      await page.screenshot({ path: f });
      console.log('  ảnh: ' + path.relative(process.cwd(), f));
    }
    // ---------- FPS sơ bộ: 120 quái, nửa số bị bỏng / độc / choáng, trận chạy
    await page.setViewportSize({ width: 844, height: 390 });
    const fps = await page.evaluate(async () => {
      game.enemies.length = 0; game.effects.length = 0;
      const types = Object.keys(ENEMIES).filter((k) => !ENEMIES[k].boss && !ENEMIES[k].minion);
      for (let i = 0; i < 120; i++) {
        const e = game.spawn(types[i % types.length], PATH.total * (0.05 + 0.85 * i / 120));
        e.hp = e.maxHp = 1e9;
        if (i % 4 === 0) Object.assign(e, { poisonT: 99, dotColor: '#E0452C' });
        if (i % 4 === 1) Object.assign(e, { stunT: 99, stunKind: 'stun' });
        if (i % 4 === 2) Object.assign(e, { poisonT: 99, dotColor: '#7FC24A', slowT: 99 });
      }
      game.running = true;
      let n = 0; const t0 = performance.now();
      await new Promise((res) => { const f = () => { n++; if (n % 10 === 0) game.effects.push({ type: 'explosion', x: 200 + Math.random() * 400, y: 200, r: 60, ttl: 0.5, max: 0.5 }); performance.now() - t0 < 2500 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
      game.running = false;
      return { fps: Math.round(n / ((performance.now() - t0) / 1000)), parts: VFX.count(), max: VFX.max() };
    });
    console.log(`  FPS sơ bộ (120 quái, máy test không GPU): ${fps.fps}, hạt ${fps.parts}/${fps.max}`);
    ok(fps.parts <= fps.max, 'nhiều quái + nổ liên tục: số hạt vẫn trong giới hạn');
    ok(!errors.length, 'không lỗi console' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
    await browser.close();
  }
  // ---------- 2. thiếu ảnh assets/vfx/ (404): vẽ cách cũ, không lỗi
  {
    const { browser, page, errors } = await open(844, 390, {}, (p) => p.route('**/assets/vfx/*.png', (r) => r.fulfill({ status: 404, body: '' })));
    await enter(page, 0);
    await page.waitForTimeout(600);
    await stage(page);
    const r = await page.evaluate(() => {
      const c = document.createElement('canvas').getContext('2d');
      VFX.frame();
      const flags = game.enemies.map((e) => VFX.status(c, e, enemyBox(e), 0, 1.3));
      // hạt 'tex' của ảnh vfx/ vẫn vẽ quầng gradient dự phòng
      const k = document.createElement('canvas'); k.width = k.height = 200;
      const kc = k.getContext('2d');
      VFX.update(5);
      VFX.decal(100, 100, 'vfx/no-2', null, 30, 1, { add: false, fbc: '#FF8A2E' });
      VFX.draw(kc);
      const px = kc.getImageData(100, 100, 1, 1).data[3];
      VFX.update(5);
      return { ready: VFX.ready('vfx/lua-1'), any: flags.some((f) => f.dot || f.stun || f.slow || f.ice), px };
    });
    ok(!r.ready && !r.any, 'thiếu ảnh: VFX.status trả cờ false → render.js vẽ sao / sương / chấm độc bằng code như cũ');
    ok(r.px > 0, 'thiếu ảnh: hạt ảnh vẽ quầng gradient dự phòng');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SHOTS, 'hat-vfx-thieu-anh-844x390.png') });
    ok(!errors.length, 'thiếu ảnh: không lỗi console' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
    await browser.close();
  }
  console.log('hat-vfx: OK');
})().catch((e) => { console.error(e); process.exit(1); });
