// Dạng đường mới + Vô tận đổi đường (claude/duong-di-moi). Chạy: node tests/duong-di-moi/duong-di-moi.test.js
// 1) hình học: mọi bản đồ gốc + mọi dạng đường liền mạch, nhánh dài gần bằng nhau, đường mới nằm trong vùng an toàn,
//    đủ ô đặt tướng, ô không nằm trên đường
// 2) quái đi hết đường tới thành ở mọi dạng (mọi nhánh đều có quái, bám đường)
// 3) Vô tận: tua đợt 1 → 200 ở vài bản đồ — đổi đường đúng mốc (60, 70, … 200), giữ tướng / hoàn vàng khi hết ô,
//    chạy thật một đợt ở mỗi mốc, lưu / nạp giữa trận giữ đúng đường, chơi nhóm không đổi đường
// 4) cân bằng: mô phỏng trận (đội 8 tướng cố định) — dạng thường không quá dễ / khó so với đường gốc, dạng khó khó hơn có giới hạn
// 5) không đè giao diện ở 1920×934, 844×390, 667×375 (thanh trên, cột nút phải, hàng thẻ) + chụp từng dạng (cả màn dọc 390×844)
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('../cho-tuong/helpers');

const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });

(async () => {
  // ---------- 1–4: logic (844 × 390)
  {
    const { browser, page, errors } = await open(844, 390, { unlocked: 17 });
    await enter(page, 0);

    // ---- 1. hình học
    const geo = await page.evaluate(() => {
      const bad = [], info = {};
      const ids = [...new Set(LEVELS.map((l) => l.map))];
      const shapes = Object.keys(PATH_SHAPES);
      for (const sh of shapes) ids.push(mapVariant('song1', sh));
      for (const id of ids) {
        setMap(id);
        const m = MAPS[id], isNew = !!m.shape;
        // liền mạch: hai điểm mẫu liên tiếp cách nhau không quá 40 (đơn vị game), không nhảy cóc
        CONFIG.paths.forEach((pts, li) => { for (let i = 1; i < pts.length; i++) { const g = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (g > 40) bad.push(`${id} nhánh ${li}: hở ${g.toFixed(0)} ở điểm ${i}`); } });
        // cuối đường sát thành
        CONFIG.paths.forEach((pts, li) => { const [x, y] = pts[pts.length - 1]; const d = Math.hypot(x / DK - m.end[0], y / DK - m.end[1]); if (d > 45) bad.push(`${id} nhánh ${li}: cuối đường cách thành ${d.toFixed(0)}`); });
        // các nhánh dài gần bằng nhau (quãng đường quy đổi không méo tốc độ quá 8%)
        for (const L of PATH.lanes) if (L.k < 0.92 || L.k > 1.08) bad.push(`${id}: nhánh dài lệch ${L.k.toFixed(3)}`);
        // ô đặt tướng: đủ, không đè đường, không trong vùng giao diện
        if (CONFIG.slots.length < (isNew ? 12 : 10)) bad.push(`${id}: chỉ ${CONFIG.slots.length} ô`);
        for (const [x, y] of CONFIG.slots) if (distToPath(x, y) / DK < CONFIG.buildGrid.minD - 0.5) bad.push(`${id}: ô (${x},${y}) đè đường`);
        if (isNew) {
          // vùng an toàn của đường mới (toạ độ thiết kế): tim đường y ∈ [125, 312], không vào cột nút phải x > 865 & y > 235
          for (const pts of CONFIG.paths) for (const [X, Y] of pts) {
            const x = X / DK, y = Y / DK;
            if (x < -25 || x > 932) bad.push(`${id}: điểm ngoài khung (${x.toFixed(0)},${y.toFixed(0)})`);
            if (x > 0 && (y < 124 || y > 313)) { bad.push(`${id}: điểm đè thanh trên / hàng thẻ (${x.toFixed(0)},${y.toFixed(0)})`); break; }
            if (x > 865 - 30 && y > 235 - 30) { bad.push(`${id}: điểm đè cột nút phải (${x.toFixed(0)},${y.toFixed(0)})`); break; }
          }
          const [ex, ey] = m.end;
          if (ey < 110 || (ey > 295 && ex + 54 > 170) || (ex + 54 > 865 && ey > 185)) bad.push(`${id}: thành đè giao diện (${ex},${ey})`);
        }
        info[id] = { slots: CONFIG.slots.length, len: Math.round(PATH.total / DK), lanes: PATH.lanes.length };
      }
      // thứ tự đổi đường vô tận: đúng mốc, hai mốc liền nhau khác dạng, dạng khó chỉ từ đợt 130
      const seq = [];
      for (const lv of [0, 5, 10, 16]) for (let w = 1; w <= 260; w++) {
        const s = endlessPathFor(w, lv), s0 = endlessPathFor(w - 1, lv);
        if (w < 60 && s) bad.push(`đợt ${w}: đã đổi đường`);
        if (w >= 60 && !PATH_SHAPES[s]) bad.push(`đợt ${w}: dạng ${s} không có`);
        if (s !== s0 && w >= 61 && (w - 60) % 10) bad.push(`đổi đường lệch mốc ở đợt ${w}`);
        if (w >= 70 && (w - 60) % 10 === 0 && s === s0) bad.push(`bản đồ ${lv} đợt ${w}: trùng dạng mốc trước`);
        if (s && PATH_SHAPES[s].diff > 1 && w < 130) bad.push(`dạng khó ${s} ở đợt ${w}`);
        if (lv === 0 && w >= 60 && (w - 60) % 10 === 0) seq.push(`${w}:${s}`);
      }
      return { bad, info, seq, n: shapes.length, stage: [endlessPathStage(59), endlessPathStage(60), endlessPathStage(79)] };
    });
    console.log('  ' + Object.entries(geo.info).map(([k, v]) => `${k}=${v.slots}ô/${v.len}${v.lanes > 1 ? '/' + v.lanes + 'nhánh' : ''}`).join(' '));
    console.log('  thứ tự (bản đồ 1): ' + geo.seq.join(' '));
    ok(geo.n >= 9, `${geo.n} dạng đường mới`);
    ok(geo.stage.join() === '-1,0,1', 'endlessPathStage: đợt 59 → -1, 60 → 0, 79 → 1');
    ok(!geo.bad.length, `hình học + thứ tự đổi đường ${geo.bad.slice(0, 6).join(' | ')}`);

    // ---- 2. quái đi hết đường ở mọi dạng (không tướng: mọi quái tới thành)
    for (const lv of [0, 8]) {
      const r = await page.evaluate((lv) => {
        const out = [];
        for (const sh of Object.keys(PATH_SHAPES)) {
          game.reset(lv); game.started = true; game.running = true;
          game.setPathShape(sh); game.events.length = 0;
          game.endlessPathTick = () => {};   // đợt 1: giữ dạng đường đang thử
          game.lives = 9999;
          const geoms = CONFIG.paths, need = PATH.lanes.length, id = MAP_ID;
          let maxOff = 0, n = 0, seen = new Set(), lanes = new Set(), endOk = true;
          game.startWave();
          for (let s = 0; s < 8000 && game.waveActive; s++) {
            const before = game.enemies.slice();
            game.update(0.05);
            for (const e of game.enemies) {
              if (!seen.has(e.id)) { seen.add(e.id); lanes.add(e.lane); }
              if (!e.def.flying && e.x > 0 && e.x < CONFIG.W) { n++; maxOff = Math.max(maxOff, Math.min(...geoms.map((p) => distToPolyline(p, e.x, e.y)))); }
            }
            for (const e of before) if (e.dead && e.hp > 0 && e.dist < PATH.total) endOk = false;   // biến mất giữa đường
          }
          delete game.endlessPathTick;
          out.push({ sh, id, lost: 9999 - game.lives, spawned: seen.size, lanes: lanes.size, need, maxOff, n, done: !game.waveActive, endOk });
        }
        return out;
      }, lv);
      for (const x of r) ok(x.done && x.endOk && x.lost >= x.spawned && x.spawned > 3 && x.lanes === x.need && x.maxOff < 45 && x.n > 50,
        `bản đồ ${lv + 1} · ${x.sh}: ${x.spawned} quái đi hết đường tới thành (mất ${x.lost} mạng), dùng ${x.lanes}/${x.need} nhánh, lệch tối đa ${x.maxOff.toFixed(1)}`);
    }

    // ---- 3. Vô tận: tua 1 → 200, đổi đường đúng mốc, giữ tướng, chạy thật một đợt ở mỗi mốc
    for (const lv of [0, 10, 15]) {
      const r = await page.evaluate((lv) => {
        const bad = [], log = [];
        game.reset(lv); game.endless = true; game.started = true; game.running = true;
        game.gold = 1e6;
        const types = Object.keys(HEROES).filter((t) => !HEROES[t].legend).slice(0, 6);
        types.forEach((t, k) => game.placeHero([1, 4, 7, 10, 3, 8][k], t));
        const ids0 = game.heroes.filter(Boolean).map((h) => h.id).sort().join();
        for (let w = 1; w <= 200; w++) {
          game.wave = w; game.waveActive = true; game.spawnQueue = []; game.enemies = [];
          game.waveComplete();
          if (game.rest) game.skipRest();
          const want = endlessPathFor(w + 1, lv);
          if (game.pathShape !== want) bad.push(`sau đợt ${w}: đường ${game.pathShape} ≠ ${want}`);
          if (want && MAP_ID !== `${LEVELS[lv].map}~${want}`) bad.push(`sau đợt ${w}: MAP_ID ${MAP_ID}`);
          const hs = game.heroes.filter(Boolean);
          if (hs.map((h) => h.id).sort().join() !== ids0) bad.push(`sau đợt ${w}: mất / thừa tướng`);
          for (const h of hs) { const s = CONFIG.slots[h.slot]; if (!s || game.heroes[h.slot] !== h || s[0] !== h.x || s[1] !== h.y) { bad.push(`sau đợt ${w}: tướng lệch ô`); break; } }
          if (game.heroes.length !== CONFIG.slots.length) bad.push(`sau đợt ${w}: mảng tướng ${game.heroes.length} ≠ ${CONFIG.slots.length} ô`);
          // mốc đổi đường: chạy thật đợt kế (quái đi trên đường mới, không lỗi)
          if (w + 1 >= 60 && (w + 1 - 60) % 10 === 0) {
            game.lives = 9999; game.nextWaveT = 0;
            game.startWave();
            let maxOff = 0;
            for (let s = 0; s < 1200 && game.waveActive; s++) {
              game.update(0.05);
              if (game.rest) game.skipRest();
              for (const e of game.enemies) if (!e.def.flying && e.x > 0 && e.x < CONFIG.W) maxOff = Math.max(maxOff, Math.min(...CONFIG.paths.map((p) => distToPolyline(p, e.x, e.y))));
            }
            if (maxOff > 45) bad.push(`đợt ${w + 1}: quái lệch đường ${maxOff.toFixed(0)}`);
            log.push(`${w + 1}:${game.pathShape}×${game.pathHp}`);
            game.enemies = []; game.spawnQueue = []; game.waveActive = false; game.wave = w + 1;
            w++;
          }
        }
        return { bad, log, gold: game.gold };
      }, lv);
      console.log(`  bản đồ ${lv + 1}: ${r.log.join(' ')}`);
      ok(!r.bad.length, `bản đồ ${lv + 1}: tua tới đợt 200 đổi đường đúng mốc, giữ đủ tướng đúng ô ${r.bad.slice(0, 4).join(' | ')}`);
    }
    // hết ô → hoàn vàng + đồ về túi; quay lại đường gốc khi reset
    const full = await page.evaluate(() => {
      game.reset(0); game.endless = true; game.started = true;
      game.gold = 1e7;
      const t = Object.keys(HEROES).filter((k) => !HEROES[k].legend)[0];
      CONFIG.slots.forEach((_, i) => game.placeHero(i, t));
      const n0 = game.heroes.filter(Boolean).length;
      const it = game.inventory.find((x) => ITEMS[x.id].slot === 'weapon');
      const h0 = game.heroes.find(Boolean); if (it) { h0.equip.weapon = it; game.inventory = game.inventory.filter((x) => x !== it); }
      const spent = game.heroes.filter(Boolean).reduce((s, h) => s + h.spent, 0);
      const g0 = game.gold, bag0 = game.inventory.length;
      game.setPathShape('xoanoc');
      const n1 = game.heroes.filter(Boolean).length, slots = CONFIG.slots.length;
      const kept = game.heroes.filter(Boolean).reduce((s, h) => s + h.spent, 0);
      const r = { n0, n1, slots, refund: game.gold - g0, lostSpent: spent - kept, bag: game.inventory.length - bag0, hadItem: !!it, kept0: game.heroes.includes(h0) };
      game.reset(0);
      r.back = MAP_ID; r.hp = game.pathHp;
      return r;
    });
    ok(full.n1 === Math.min(full.n0, full.slots) && full.refund === full.lostSpent && full.refund > 0,
      `đầy sân ${full.n0} tướng → Xoắn ốc ${full.slots} ô: giữ ${full.n1}, hoàn đủ ${full.refund} vàng tướng hết chỗ`);
    if (full.hadItem && !full.kept0) ok(full.bag === 1, 'đồ của tướng hết chỗ trả về túi');
    ok(full.back === 'song1' && full.hp === 1, 'vào trận mới: về đường gốc, máu quái ×1');
    // lưu / nạp giữa trận giữ đúng đường + ô tướng
    const sv = await page.evaluate(() => {
      game.reset(3); game.endless = true; game.started = true; game.gold = 1e6;
      game.placeHero(2, Object.keys(HEROES)[0]); game.placeHero(5, Object.keys(HEROES)[1]);
      for (let w = 1; w <= 75; w++) { game.wave = w; game.waveActive = true; game.spawnQueue = []; game.enemies = []; game.waveComplete(); if (game.rest) game.skipRest(); }
      const before = { id: MAP_ID, shape: game.pathShape, hp: game.pathHp, pos: game.heroes.map((h, i) => h && `${i}:${h.type}@${h.x},${h.y}`).filter(Boolean).join(' ') };
      const snap = JSON.parse(JSON.stringify(game.snapshot()));
      game.reset(0);
      game.restore(snap);
      const after = { id: MAP_ID, shape: game.pathShape, hp: game.pathHp, pos: game.heroes.map((h, i) => h && `${i}:${h.type}@${h.x},${h.y}`).filter(Boolean).join(' ') };
      // đợt kế tiếp sau khi nạp: vẫn đường đó (không đổi lại)
      game.wave = 76; game.waveActive = true; game.spawnQueue = []; game.enemies = []; game.waveComplete();
      return { before, after, still: game.pathShape };
    });
    ok(JSON.stringify(sv.before) === JSON.stringify(sv.after) && sv.after.shape && sv.still === sv.after.shape,
      `lưu / nạp ở đợt 75 giữ đường ${sv.after.shape} (máu ×${sv.after.hp}) và đúng ô tướng (${sv.after.pos})`);
    // chơi nhóm: không đổi đường (ô chia theo người chơi)
    ok(await page.evaluate(() => {
      game.reset(0); game.endless = true; game.co = { canAct: () => true };
      game.wave = 59; game.waveActive = true; game.spawnQueue = []; game.enemies = [];
      try { game.waveComplete(); } catch (e) { /* bảng co-op giả */ }
      const r = game.pathShape === null && MAP_ID === 'song1';
      game.co = null; game.reset(0);
      return r;
    }), 'chơi nhóm: giữ đường gốc');

    // ---- 4. cân bằng: mô phỏng trận (đội 8 tướng ★3 cấp 20 đặt vào 8 ô phủ đường tốt nhất, 3 đợt)
    const bal = await page.evaluate(() => {
      let seed = 1; const rnd0 = Math.random;
      Math.random = () => { let t = (seed = (seed + 0x6D2B79F5) | 0); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      const ARMY = ['xathu', 'lactuong', 'thaymo', 'thansuong', 'lucsi', 'thosan', 'xathu', 'thaymo'];
      const run = (lv, w0, shape) => {
        seed = 777;
        game.reset(lv); game.endless = true; game.started = true; game.running = true;
        game.wave = w0; game.endlessPathTick = () => {};
        if (shape) game.setPathShape(shape);
        const cov = CONFIG.slots.map(([x, y], i) => { let c = 0; PATH.lanes.forEach((_, li) => { for (let d = 0; d < PATH.total; d += 8) { const p = PATH.at(d, li); if (Math.hypot(p.x - x, p.y - y) <= 190) c += 8; } }); return [c / PATH.lanes.length, i]; }).sort((a, b) => b[0] - a[0]);
        game.gold = 1e9;
        ARMY.forEach((t, k) => { const slot = cov[k][1]; game.placeHero(slot, t); const h = game.heroes[slot]; h.tier = 3; for (let i = 1; i < 20; i++) game.levelUp(h); h.hp = heroStats(h).hpMax; });
        game.gold = 0; game.lives = 999;
        let hpIn = 0, hpLeak = 0; const seen = new Set();
        for (let w = 0; w < 3; w++) {
          game.nextWaveT = 0; game.startWave();
          for (let s = 0; s < 6000 && game.waveActive; s++) {
            for (const e of game.enemies) if (!seen.has(e.id)) { seen.add(e.id); hpIn += e.maxHp; }
            const before = game.enemies.slice();
            game.update(0.05);
            for (const e of before) if (e.dead && e.dist >= PATH.total) hpLeak += Math.max(0, e.hp);
            if (game.rest) game.rest = null;
          }
        }
        delete game.endlessPathTick;
        return Math.round(hpLeak / hpIn * 1000) / 10;
      };
      const out = [];
      for (const [lv, w0] of [[0, 45], [11, 30]]) {
        const base = run(lv, w0, null);
        for (const sh of Object.keys(PATH_SHAPES)) out.push({ map: LEVELS[lv].map, sh, base, leak: run(lv, w0, sh), hp: game.pathHp, hard: (PATH_SHAPES[sh].diff || 1) > 1 });
      }
      Math.random = rnd0;
      game.reset(0);
      return out;
    });
    for (const b of bal) {
      const lim = b.hard ? b.base * 2.5 + 12 : b.base * 2 + 10;
      ok(b.leak <= lim, `cân bằng ${b.map} · ${b.sh}${b.hard ? ' (khó)' : ''}: máu quái ×${b.hp}, lọt ${b.leak}% máu quái (đường gốc ${b.base}%, giới hạn ${lim.toFixed(0)}%)`);
    }
    ok(!errors.length, `không lỗi trang ${errors.slice(0, 3).join(' | ')}`);
    await browser.close();
  }

  // ---------- 5. không đè giao diện + ảnh từng dạng
  for (const [w, h] of [[1920, 934], [844, 390], [667, 375], [390, 844]]) {
    const { browser, page, errors } = await open(w, h, { unlocked: 17 });
    await enter(page, 0);
    await page.waitForTimeout(600);
    const shapes = await page.evaluate(() => Object.keys(PATH_SHAPES));
    for (const [lv, list] of [[0, shapes], [8, ['caucheo', 'haicong', 'duongtat']], [10, ['chianhanh', 'zigzag']], [13, ['vongve']]]) {
      if (lv) { await enter(page, lv); await page.waitForTimeout(400); }
      for (const sh of list) {
        const r = await page.evaluate((sh) => {
          game.setPathShape(sh); game.events.length = 0; game.effects = game.effects.filter((f) => f.type !== 'summon');
          ui.toasts && (document.querySelector('#toasts').innerHTML = '');
          if (ROT) return { rot: true };
          const rects = ['.topbar', '.auto-btns', '#deck, .deck'].map((s) => { const el = document.querySelector(s); const b = el && el.getBoundingClientRect(); return b && { s, l: b.left, t: b.top, r: b.right, b: b.bottom }; }).filter(Boolean);
          const m = MAPS[MAP_ID], half = PATH_LOOK[pathKind(m.theme)].edge / 2 * DK;
          const toS = (x, y) => [(x + view.ox) * view.scale, (y + view.oy) * view.scale];
          const hits = [];
          for (const pts of CONFIG.paths) for (const [x, y] of pts) {
            const [sx, sy] = toS(x, y), pad = half * view.scale;
            for (const R of rects) if (sx + pad > R.l && sx - pad < R.r && sy + pad > R.t && sy - pad < R.b && sx > 0) { hits.push(`${R.s}@${Math.round(x / DK)},${Math.round(y / DK)}`); break; }
          }
          // thành cuối đường (ảnh 124 đơn vị, thu 15% phần viền trong suốt)
          const s = 124 * DK, [ex, ey] = m.end, g = [ex * DK - s * 0.42, ey * DK - s * 0.5, ex * DK + s * 0.42, ey * DK + s * 0.32];
          const [gl, gt] = toS(g[0], g[1]), [gr, gb] = toS(g[2], g[3]);
          for (const R of rects) if (gr > R.l && gl < R.r && gb > R.t && gt < R.b) hits.push(`thành×${R.s}`);
          // ô đặt tướng không bị giao diện che
          for (const [x, y] of CONFIG.slots) { const [sx, sy] = toS(x, y); for (const R of rects) if (sx > R.l && sx < R.r && sy > R.t && sy < R.b) hits.push(`ô×${R.s}`); }
          return { hits: [...new Set(hits)] };
        }, sh);
        await page.waitForTimeout(1800);   // hết chuyển cảnh mờ dần
        await page.screenshot({ path: path.join(SHOT, `${sh}-l${lv + 1}-${w}x${h}.png`) });
        if (!r.rot) ok(!r.hits.length, `${w}×${h} bản đồ ${lv + 1} · ${sh}: không đè giao diện ${r.hits.slice(0, 4).join(' ')}`);
      }
    }
    if (w < h) ok(await page.evaluate(() => ROT), `${w}×${h}: màn dọc tự xoay ngang (cùng bố cục 844×390), đã chụp ảnh`);
    // chuyển cảnh: đổi đường giữa trận → nền cũ mờ dần (pathFade) rồi tắt
    if (w === 844) {
      const fade = await page.evaluate(async () => {
        game.setPathShape('zigzag'); render();
        await new Promise((r) => setTimeout(r, 1900)); render();
        game.setPathShape('uonkhuc'); render();
        const on = !!pathFade;
        await new Promise((r) => setTimeout(r, 1800)); render();
        return { on, off: !pathFade };
      });
      ok(fade.on && fade.off, 'đổi đường: nền cũ mờ dần sang nền mới (1,6 giây)');
    }
    ok(!errors.length, `${w}×${h}: không lỗi trang ${errors.slice(0, 3).join(' | ')}`);
    await browser.close();
  }
  console.log('XONG');
})().catch((e) => { console.error(e); process.exit(1); });
