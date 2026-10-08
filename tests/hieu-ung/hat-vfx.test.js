// Test claude/vfx-kenney: hiệu ứng PIXEL (js/vfx.js + sprite nhóm vfx: tools/pixel/src/vfx/*.txt → node tools/build-pixel.js
// → assets/pixel/vfx/*.png + js/pixel/vfx.js)
// - nguồn vfx hợp lệ theo tool chung; bảng màu chép trong js/vfx.js khớp tools/pixel/palette.txt;
// - trạng thái (bỏng / độc / choáng chim Lạc / đóng băng / làm chậm) bằng sprite pixel, không lên tới thanh máu, bám lưới điểm ảnh;
// - đạn bay + hiệu ứng mỗi khung (drawFx) bằng pixel; mọi loại hiệu ứng chạy không lỗi;
// - số hạt bị giới hạn (MAX), pool dùng lại, hạn mức sprite trạng thái mỗi khung;
// - thiếu sprite pixel → status / drawFx / drawProj trả false (game vẽ cách cũ), không lỗi console;
// - chụp trong trận 1920×934, 844×390, 667×375 vào tests/hieu-ung/shots/ + đo FPS sơ bộ khi nhiều quái.
// Chạy: node tests/hieu-ung/hat-vfx.test.js
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { open, enter, ok, ROOT } = require('../cho-tuong/helpers');

const SHOTS = path.join(__dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

// đặt một hàng quái với đủ trạng thái, dừng trận để chụp
const stage = (page) => page.evaluate(() => {
  game.running = false;
  game.enemies.length = 0; game.effects.length = 0; game.projectiles.length = 0;
  const types = Object.keys(ENEMIES).filter((k) => !ENEMIES[k].boss && !ENEMIES[k].minion && !ENEMIES[k].flying);
  const L = PATH.total;
  const mk = (k, f, st) => { const e = game.spawn(types[k % types.length], L * f); Object.assign(e, st); return e; };
  mk(0, 0.18, { poisonT: 99, dotColor: '#E0452C' });                    // bỏng
  mk(1, 0.28, { stunT: 99, stunKind: 'stun' });                        // choáng
  mk(2, 0.38, { stunT: 99, stunKind: 'ice' });                         // đóng băng
  mk(3, 0.48, { poisonT: 99, dotColor: '#7FC24A' });                   // độc
  mk(4, 0.58, { slowT: 99, slowPct: 30 });                             // làm chậm
  mk(5, 0.68, { poisonT: 99, dotColor: '#E0452C', stunT: 99, stunKind: 'stun' });
  for (const e of game.enemies) e.hp = e.maxHp * 0.6;
  return game.enemies.map((e) => ({ x: e.x, y: e.y }));
});
const boom = (page, at) => page.evaluate((at) => {
  const [a, b, c] = at;
  game.effects.push({ type: 'explosion', x: a.x, y: a.y, r: 70, ttl: 0.5, max: 0.5 });
  game.effects.push({ type: 'impact', kind: 'fireball', el: 'hoa', splash: 60, x: b.x, y: b.y, ttl: 0.3, max: 0.3 });
  game.effects.push({ type: 'nova', x: c.x, y: c.y, r: 70, ttl: 0.4, max: 0.4 });
  game.effects.push({ type: 'scorch', x: c.x + 60, y: c.y + 10, r: 40, ttl: 1.4, max: 1.4 });
  game.effects.push({ type: 'bolt', x: at[4].x, y: at[4].y, ttl: 0.4, max: 0.4 });
  game.effects.push({ type: 'die', etype: Object.keys(ENEMIES).find((k) => ENEMIES[k].boss), x: at[5].x, y: at[5].y, ttl: 0.4, max: 0.4 });
}, at);
const noPixelVfx = (p) => p.route('**/js/pixel/vfx.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: '' }));

(async () => {
  // ---------- 0. nguồn sprite hợp lệ theo tool chung; bảng màu trong js/vfx.js khớp bảng chung
  {
    const out = execFileSync('node', [path.join(ROOT, 'tools/build-pixel.js'), '--check', 'vfx/'], { encoding: 'utf8' });
    const n = +((/(\d+) file nguồn hợp lệ/.exec(out) || [])[1] || 0);
    ok(n > 0, 'nguồn tools/pixel/src/vfx/ hợp lệ (build-pixel --check): ' + out.trim().split('\n').pop());
    const vfxSrc = fs.readdirSync(path.join(ROOT, 'tools/pixel/src/vfx')).filter((f) => f.endsWith('.txt') && f !== 'palette.txt');
    ok(vfxSrc.length >= 30, `${vfxSrc.length} sprite hiệu ứng pixel`);
    const missing = vfxSrc.map((f) => f.replace(/\.txt$/, '')).filter((c) => !fs.existsSync(path.join(ROOT, 'assets/pixel/vfx', c + '.png')));
    ok(!missing.length, 'đã dựng đủ assets/pixel/vfx/*.png' + (missing.length ? ' — thiếu ' + missing : ''));
    const pal = Object.fromEntries(fs.readFileSync(path.join(ROOT, 'tools/pixel/palette.txt'), 'utf8').split('\n')
      .map((l) => /^\s*([a-z0-9-]+)\s+(#[0-9a-fA-F]{6})/.exec(l)).filter(Boolean).map((m) => [m[1], m[2].toUpperCase()]));
    const js = fs.readFileSync(path.join(ROOT, 'js/vfx.js'), 'utf8');
    const C = Object.fromEntries([...js.matchAll(/'([a-z0-9-]+)': '(#[0-9A-Fa-f]{6})'/g)].map((m) => [m[1], m[2].toUpperCase()]));
    ok(JSON.stringify(C) === JSON.stringify(pal), `bảng màu trong js/vfx.js khớp tools/pixel/palette.txt (${Object.keys(pal).length} màu)`);
  }
  // ---------- 1. có sprite pixel
  {
    const { browser, page, errors } = await open(844, 390);
    await enter(page, 0);
    await page.waitForFunction(() => ['lua-chay', 'chim-lac', 'gio-xoay', 'bang-tinh', 'suong-lanh', 'may-doc', 'bong-doc', 'tuyet', 'dan-lua', 'no'].every((n) => VFX.spr(n)), null, { timeout: 8000 });
    await stage(page);
    await page.waitForTimeout(200);
    const r = await page.evaluate(() => {
      const c = document.createElement('canvas').getContext('2d');
      VFX.frame();
      return game.enemies.map((e) => VFX.status(c, e, enemyBox(e), 0, 1.3));
    });
    ok(r[0].dot && !r[0].stun, 'bỏng: ngọn lửa pixel');
    ok(r[1].stun, 'choáng: chim Lạc + xoáy khí lượn quanh đầu');
    ok(r[2].ice && r[2].iceArt && !r[2].stun, 'đóng băng: vỏ băng pixel (thay khối băng code) + tinh thể băng');
    ok(r[3].dot, 'độc: mây độc + bong bóng');
    ok(r[4].slow, 'làm chậm: sương lạnh + bông tuyết');
    ok(r[5].dot && r[5].stun, 'bỏng + choáng cùng lúc');
    // không lên tới thanh máu, toạ độ nguyên, không khử răng cưa
    const chk = await page.evaluate(() => {
      const bad = [], frac = [];
      let smooth = false;
      const c = document.createElement('canvas').getContext('2d');
      for (const e of game.enemies) {
        const box = enemyBox(e), by = e.y - box.ay - 7;
        const top = (y) => { if (y < by + 4) bad.push([e.type, Math.round(y), Math.round(by)]); };
        c.drawImage = function (im, x, y, w, h) { if (this.imageSmoothingEnabled) smooth = true; top(this.getTransform().f + Math.min(y, y + h)); if (x % 1 || y % 1) frac.push([x, y]); };
        c.fillRect = function (x, y) { top(this.getTransform().f + y); if (x % 1 || y % 1) frac.push([x, y]); };
        const st = e.stunT; if (e.stunKind === 'stun' || e.stunKind === 'ice') e.stunT = 0;   // vòng choáng trên đầu / khối băng bọc trọn hình (thanh máu đè lên) — kiểm riêng bên dưới
        for (const t of [0.1, 0.4, 0.7, 1.0, 1.3, 2.2]) { VFX.frame(); VFX.status(c, e, box, 0, t); }
        e.stunT = st;
      }
      return { bad, frac: frac.length, smooth };
    });
    ok(!chk.bad.length, 'ảnh trạng thái (trừ vòng choáng, khối băng) không lên tới thanh máu' + (chk.bad.length ? ' — ' + JSON.stringify(chk.bad.slice(0, 4)) : ''));
    // vòng choáng (quái + tướng): đáy vòng chạm nhẹ đỉnh bbox hình (±3 + 1 ô), không đè mặt, không bay xa;
    // lửa bỏng ngang vai, cao 18–45% hình quái (không to như sprite 10×14 cũ, không chỉ vài chấm)
    const geo = await page.evaluate(() => {
      const c = document.querySelector('canvas').getContext('2d'), out = { stun: [], burn: [], hero: [] };
      const rec = (fn) => {
        const r = { y0: 1e9, y1: -1e9, x0: 1e9, x1: -1e9 };
        const put = (m, x, y, w, h) => { r.x0 = Math.min(r.x0, m.e + x); r.x1 = Math.max(r.x1, m.e + x + w); r.y0 = Math.min(r.y0, m.f + y); r.y1 = Math.max(r.y1, m.f + y + h); };
        const d0 = c.drawImage, f0 = c.fillRect;
        c.drawImage = function (im, x, y, w, h) { put(this.getTransform(), x, y, w, h); };
        c.fillRect = function (x, y, w, h) { if (String(this.fillStyle).toLowerCase() !== '#d6a532') put(this.getTransform(), x, y, w, h); };   // bỏ tàn lửa bay (vàng nghệ)
        try { fn(); } finally { c.drawImage = d0; c.fillRect = f0; }
        return r;
      };
      const k = c.getTransform().a || 1;
      for (const [i, key] of [[1, 'stun'], [0, 'burn']]) {
        const e = game.enemies[i], box = enemyBox(e);
        for (const t of [0.1, 0.4, 0.7, 1.0, 1.3, 2.2]) {
          const r = rec(() => { VFX.frame(); VFX.status(c, e, box, 0, t); });
          const m = c.getTransform();
          out[key].push({ bottom: r.y1, top: r.y0, head: m.d * (e.y - box.ay) + m.f, d: m.d, h: (r.y1 - r.y0) / m.d, w: (r.x1 - r.x0) / m.a, H: box.ay, W: box.w, n: Math.max(1, Math.round(1.2 * k)) });
        }
      }
      for (const t of [0.1, 0.7, 1.3]) {   // tướng: đỉnh đầu 100
        const r = rec(() => VFX.px.heroStun(c, 300, 100, t));
        const m = c.getTransform();
        out.hero.push({ bottom: r.y1, head: m.d * 100 + m.f, d: m.d, n: Math.max(1, Math.round(1.2 * k)) });
      }
      return out;
    });
    const touch = (a) => a.every((g) => Math.abs(g.bottom - g.head) <= 3 * g.d + 2 * g.n);
    ok(touch(geo.stun), 'đáy vòng choáng quái chạm đỉnh bbox hình (±3) ' + JSON.stringify(geo.stun.map((g) => Math.round(g.bottom - g.head))));
    ok(touch(geo.hero), 'đáy vòng choáng tướng chạm đỉnh đầu (±3) ' + JSON.stringify(geo.hero.map((g) => Math.round(g.bottom - g.head))));
    ok(geo.burn.every((g) => g.h >= g.H * 0.18 && g.h <= g.H * 0.45), 'lửa bỏng rõ dáng, cao 18–45% hình quái ' + JSON.stringify(geo.burn.map((g) => +(g.h / g.H).toFixed(2))));
    ok(geo.burn.every((g) => g.top >= g.head), 'lửa bỏng nằm trong thân (không vượt đỉnh đầu)');
    ok(geo.burn.every((g) => g.w <= g.W * 0.9), 'lửa bỏng không rộng quá thân quái');
    // khối băng bát giác bao trọn hộp hình thật (drawEnemy thật → hộp truyền vào VFX.status), lề mỗi bên ≤ 15% (+1 ô lưới)
    const ice = await page.evaluate(() => {
      const c = document.createElement('canvas').getContext('2d'), out = [];
      const st0 = VFX.status;
      for (const type of ['tom', 'voichien', 'thuongluong', 'daibang']) {
        if (!ENEMIES[type]) { out.push({ type, miss: true }); continue; }
        game.enemies.length = 0;
        const e = game.spawn(type, PATH.total * 0.4) || game.enemies[game.enemies.length - 1];
        Object.assign(e, { stunT: 99, stunKind: 'ice' });
        let box = null; const rows = new Map();
        VFX.status = function (ctx, en, b, lift, t) {
          box = Object.assign({ lift }, b);
          const f0 = ctx.fillRect;
          ctx.fillRect = function (x, y, w, h) {
            if (String(this.fillStyle).toLowerCase() === '#b8d8e0') { const r = rows.get(y) || [1e9, -1e9]; rows.set(y, [Math.min(r[0], x), Math.max(r[1], x + w)]); }
            return f0.call(this, x, y, w, h);
          };
          try { return st0.call(this, ctx, en, b, lift, t); } finally { delete ctx.fillRect; }
        };
        VFX.frame(); drawEnemy(c, e, 1.3);
        VFX.status = st0;
        const x0 = e.x + (box.dx || 0) - box.w / 2, x1 = x0 + box.w, y0 = e.y - box.lift - box.ay, y1 = e.y - box.lift + (box.db || 0);
        let miss = 0, X0 = 1e9, X1 = -1e9, Y0 = 1e9, Y1 = -1e9;
        for (const [y, [a, b]] of rows) { X0 = Math.min(X0, a); X1 = Math.max(X1, b); Y0 = Math.min(Y0, y); Y1 = Math.max(Y1, y + 1); }
        for (let y = Math.ceil(y0) + 1; y < y1 - 1; y++) {
          const r = [...rows].filter(([ry]) => ry <= y && y < ry + 4).map(([, v]) => v)[0];
          if (!r || r[0] > x0 + 1 || r[1] < x1 - 1) miss++;
        }
        const W = x1 - x0, H = y1 - y0;
        out.push({ type, flying: !!ENEMIES[type].flying, rows: rows.size, miss, mx: +(Math.max(x0 - X0, X1 - x1) / W).toFixed(3), my: +(Math.max(y0 - Y0, Y1 - y1) / H).toFixed(3), W: Math.round(W), H: Math.round(H) });
      }
      return out;
    });
    for (const g of ice) {
      ok(!g.miss && g.rows > 0, `khối băng bát giác bao trọn hình ${g.type} ` + JSON.stringify(g));
      ok(g.mx <= 0.15 + 4 / g.W && g.my <= 0.15 + 4 / g.H, `khối băng ${g.type}: lề ≤ 15% (ngang ${g.mx}, dọc ${g.my})`);
    }
    ok(!chk.frac && !chk.smooth, 'trạng thái vẽ bám lưới điểm ảnh (toạ độ nguyên), không khử răng cưa');
    // đạn bay + hiệu ứng mỗi khung bằng pixel
    const fx = await page.evaluate(() => {
      const c = document.querySelector('canvas').getContext('2d');
      const kinds = ['fireball', 'frostbolt', 'arrow', 'bolt', 'orb', 'feather', 'petal', 'melon', 'rice', 'evil'];
      const proj = kinds.filter((kind) => { c.save(); c.translate(200, 200); const r = VFX.drawProj(c, { kind, angle: 0.4, st: {} }, 1); c.restore(); return r; });
      const notOwn = [...VFX.OWN].filter((type) => { c.save(); const r = VFX.drawFx(c, { type, x: 300, y: 220, x2: 420, y2: 200, r: 60, d: 20, a: 1, dir: 1, d1: 0, d2: 300, kind: 'lac', color: '#E25A3A', lv: 3, ttl: 0.2, max: 0.5, target: { x: 420, y: 230, dead: false }, hero: { x: 250, y: 230 } }, 0.5, 1); c.restore(); return !r; });
      return { proj: proj.length, n: kinds.length, notOwn };
    });
    ok(fx.proj === fx.n, `đạn bay pixel đủ ${fx.n} loại`);
    ok(!fx.notOwn.length, 'drawFx vẽ pixel mọi loại trong danh sách OWN' + (fx.notOwn.length ? ' — thiếu ' + fx.notOwn : ''));
    await page.evaluate(() => {
      const types = ['impact', 'slash', 'xslash', 'claw', 'bash', 'explosion', 'pillar', 'nova', 'snow', 'bolt', 'heal', 'dome', 'rockfall', 'cracks',
        'splat', 'wave', 'gust', 'petals', 'beam', 'streak', 'cast', 'evolve', 'levelup', 'promote', 'summon', 'proc', 'die', 'scorch', 'meteor'];
      for (const el of [null, 'kim', 'moc', 'thuy', 'hoa', 'tho'])
        for (const type of types) VFX.onEffect({ type, x: 300, y: 200, x2: 400, y2: 220, r: 50, el, splash: el ? 40 : 0, kind: 'fireball', etype: 'haba', ult: true });
      VFX.update(0.05); VFX.draw(document.querySelector('canvas').getContext('2d'));
      const c = document.querySelector('canvas').getContext('2d');   // đòn đánh của tướng (costume.js fxImage → VFX.pxTex)
      for (const n of ['slash_03', 'circle_03', 'flame_05', 'spark_06', 'star_09', 'smoke_09', 'twirl_02', 'dirt_01']) if (!VFX.pxTex(c, n, '#E25A3A', 300, 200, 30, 0, 0.5, 1)) throw new Error('pxTex ' + n);
    });
    // giới hạn số hạt + pool
    const lim = await page.evaluate(() => {
      VFX.update(9);
      const max = VFX.max();
      for (let i = 0; i < 4000; i++) VFX.burst(400, 200, 1, '#FFB04A');
      const full = VFX.count(), d0 = VFX.dropped();
      VFX.decal(400, 200, 'no', null, 20, 0.5, { must: true });
      const afterMust = VFX.count();
      VFX.update(2); VFX.update(2);
      const pool = VFX.poolSize(), empty = VFX.count();
      for (let i = 0; i < 100; i++) VFX.burst(400, 200, 1, '#FFB04A');
      return { max, full, d0, afterMust, pool, empty, pool2: VFX.poolSize(), n2: VFX.count() };
    });
    ok(lim.full === lim.max, `số hạt không vượt MAX (${lim.full}/${lim.max}), ${lim.d0} hạt bị bỏ`);
    ok(lim.afterMust === lim.max, 'hạt quan trọng (must) thế chỗ khi đầy, không vượt MAX');
    ok(lim.empty === 0 && lim.pool >= lim.max * 0.9, `hạt chết vào pool (${lim.pool})`);
    ok(lim.n2 === 100 && lim.pool2 === lim.pool - 100, 'hạt mới lấy lại từ pool, không tạo object mới');
    const sb = await page.evaluate(() => {
      const c = document.createElement('canvas').getContext('2d');
      VFX.frame();
      const e0 = game.enemies[0], box = enemyBox(e0);
      for (let i = 0; i < 400; i++) VFX.status(c, e0, box, 0, i * 0.01);
      return VFX.statusDrawn();
    });
    ok(sb <= 180, `sprite trạng thái mỗi khung bị giới hạn (${sb} ≤ 180)`);
    // ---------- chụp ở 3 cỡ màn hình
    for (const [w, h] of [[1920, 934], [844, 390], [667, 375]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(400);
      const at2 = await stage(page);
      await page.waitForTimeout(250);
      await page.screenshot({ path: path.join(SHOTS, `hat-vfx-trang-thai-${w}x${h}.png`) });
      await boom(page, at2);
      await page.waitForTimeout(160);
      const f = path.join(SHOTS, `hat-vfx-${w}x${h}.png`);
      await page.screenshot({ path: f });
      console.log('  ảnh: ' + path.relative(process.cwd(), f));
    }
    // ---------- FPS sơ bộ: 120 quái, ¾ dính trạng thái, nổ liên tục
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
  // ---------- 2. thiếu sprite pixel (không có manifest vfx): vẽ cách cũ, không lỗi
  {
    const { browser, page, errors } = await open(844, 390, {}, noPixelVfx);
    await enter(page, 0);
    await page.waitForTimeout(300);
    const at = await stage(page);
    const r = await page.evaluate(() => {
      const c = document.createElement('canvas').getContext('2d');
      VFX.frame();
      const flags = game.enemies.map((e) => VFX.status(c, e, enemyBox(e), 0, 1.3));
      const fx = VFX.drawFx(c, { type: 'ring', x: 1, y: 1, r: 10, ttl: 1, max: 1 }, 0.5, 1);
      const pj = VFX.drawProj(c, { kind: 'arrow', st: {} }, 1);
      const k = document.createElement('canvas'); k.width = k.height = 200;
      const kc = k.getContext('2d');
      VFX.update(5);
      VFX.burst(100, 100, 30, '#FFB04A', { speed: 1 });
      VFX.draw(kc);
      let px = 0; const d = kc.getImageData(80, 80, 40, 40).data; for (let i = 3; i < d.length; i += 4) px = Math.max(px, d[i]);
      VFX.update(5);
      return { any: flags.some((f) => f.dot || f.stun || f.slow || f.ice), fx, pj, px };
    });
    ok(!r.any && !r.fx && !r.pj, 'thiếu sprite pixel: status / drawFx / drawProj trả false → game vẽ sao / khối băng / đạn bằng code như cũ');
    ok(r.px > 0, 'thiếu sprite pixel: hạt vẫn vẽ ô màu');
    await boom(page, at);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SHOTS, 'hat-vfx-thieu-pixel-844x390.png') });
    ok(!errors.length, 'thiếu sprite pixel: không lỗi console' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
    await browser.close();
  }
  console.log('hat-vfx: OK');
})().catch((e) => { console.error(e); process.exit(1); });
