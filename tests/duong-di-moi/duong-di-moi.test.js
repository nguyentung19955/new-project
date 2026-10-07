// Dạng đường mới + Vô tận theo màn (claude/duong-di-moi). Chạy: node tests/duong-di-moi/duong-di-moi.test.js
// 1) hình học: mọi bản đồ gốc + mọi dạng đường liền mạch, nhánh dài gần bằng nhau, đường mới nằm trong vùng an toàn,
//    đủ ô đặt tướng, ô không nằm trên đường; thứ tự màn vô tận
// 2) quái đi hết đường tới thành ở mọi dạng (mọi nhánh đều có quái, bám đường)
// 3) Vô tận: tua đợt 1 → 200 — sang màn mới đúng sau mỗi đợt boss (bản đồ + bộ quái + boss của màn), giữ tướng / hoàn vàng
//    khi hết ô, chạy thật đợt boss, lưu / nạp giữa trận giữ đúng màn, chơi nhóm không đổi màn
// 3b) giao diện: chọn Vô tận → vào màn đầu luôn (không chọn bản đồ); chơi qua boss → sang màn → TẢI LẠI TRANG → Tiếp tục
//     → cùng bản đồ / bộ quái / đợt / ô tướng; bản lưu cũ (không có trường màn) vẫn tiếp tục được
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
      // thứ tự màn vô tận: đổi đúng sau đợt boss, hai màn liền nhau khác bản đồ, dạng khó chỉ từ đợt hardFrom
      const seq = [];
      for (const lv of [0, 5, 10, 16]) {
        let prev = endlessStageAt(0, lv);
        if (prev.k || prev.lv !== lv || prev.shape) bad.push(`ải ${lv}: màn đầu sai`);
        for (let w = 1; w <= 260; w++) {
          const st = endlessStageAt(w, lv);
          if (st.k !== prev.k) {
            if (!bossAt(w, lv)) bad.push(`ải ${lv}: đổi màn ở đợt ${w} không phải đợt boss`);
            if (st.k !== prev.k + 1) bad.push(`ải ${lv}: nhảy màn ở đợt ${w}`);
            if (stageMapId(st) === stageMapId(prev)) bad.push(`ải ${lv}: màn ${st.k} trùng bản đồ màn trước`);
            if (st.shape && PATH_SHAPES[st.shape].diff > 1 && w < ENDLESS_STAGES.hardFrom) bad.push(`dạng khó ${st.shape} ở đợt ${w}`);
            if (lv === 0) seq.push(`${w}:${LEVELS[st.lv].map}${st.shape ? '~' + st.shape : ''}`);
          } else if (bossAt(w, lv)) bad.push(`ải ${lv}: qua boss đợt ${w} mà không đổi màn`);
          prev = st;
        }
      }
      const used = new Set(); for (let w = 1; w <= 400; w++) { const st = endlessStageAt(w, 0); if (st.shape) used.add(st.shape); }
      for (const sh of shapes) if (!used.has(sh)) bad.push(`dạng ${sh} không xuất hiện trong 400 đợt`);
      return { bad, info, seq, n: shapes.length };
    });
    console.log('  ' + Object.entries(geo.info).map(([k, v]) => `${k}=${v.slots}ô/${v.len}${v.lanes > 1 ? '/' + v.lanes + 'nhánh' : ''}`).join(' '));
    console.log('  thứ tự màn (sau đợt boss): ' + geo.seq.join(' '));
    ok(geo.n >= 9, `${geo.n} dạng đường mới`);
    ok(!geo.bad.length, `hình học + thứ tự màn vô tận ${geo.bad.slice(0, 6).join(' | ')}`);

    // ---- 2. quái đi hết đường ở mọi dạng (không tướng: mọi quái tới thành)
    for (const lv of [0, 8]) {
      const r = await page.evaluate((lv) => {
        const out = [];
        for (const sh of Object.keys(PATH_SHAPES)) {
          game.reset(lv); game.started = true; game.running = true;
          game.setStage({ k: 1, lv, shape: sh, at: 0 }); game.events.length = 0;
          game.stageTick = () => {};   // đợt 1: giữ màn đang thử
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
          delete game.stageTick;
          out.push({ sh, id, lost: 9999 - game.lives, spawned: seen.size, lanes: lanes.size, need, maxOff, n, done: !game.waveActive, endOk });
        }
        return out;
      }, lv);
      for (const x of r) ok(x.done && x.endOk && x.lost >= x.spawned && x.spawned > 3 && x.lanes === x.need && x.maxOff < 45 && x.n > 50,
        `bản đồ ${lv + 1} · ${x.sh}: ${x.spawned} quái đi hết đường tới thành (mất ${x.lost} mạng), dùng ${x.lanes}/${x.need} nhánh, lệch tối đa ${x.maxOff.toFixed(1)}`);
    }

    // ---- 3. Vô tận: tua 1 → 200, sang màn mới sau mỗi đợt boss, giữ tướng, chạy thật mỗi đợt boss
    for (const lv of [0, 10]) {
      const r = await page.evaluate((lv) => {
        const bad = [], log = [];
        game.reset(lv); game.endless = true; game.started = true; game.running = true;
        game.gold = 1e6;
        const types = Object.keys(HEROES).filter((t) => !HEROES[t].legend).slice(0, 6);
        types.forEach((t, k) => game.placeHero([1, 4, 7, 10, 3, 8][k], t));
        const ids0 = game.heroes.filter(Boolean).map((h) => h.id).sort().join();
        let k0 = 0;
        for (let w = 1; w <= 200; w++) {
          const boss = bossAt(w, lv);
          // đợt boss: chạy thật (quái + boss của màn đang chơi đi trên đường của màn)
          if (boss && w % 20 === 0) {
            game.wave = w - 1; game.lives = 9999; game.nextWaveT = 0; game.waveActive = false;
            game.nextWave = buildWave(w, lv, game.stLv());
            const want = bossAt(w, lv, game.stLv()), ro = rosterKeyOf(rosterFor(w, lv, game.stLv()));
            const got = game.nextWave.slice(-1)[0].type;
            if (got !== want) bad.push(`đợt ${w}: boss ${got} ≠ ${want}`);
            if (game.stage.k && ro !== (LEVELS[game.stage.lv].roster || 'thuy')) bad.push(`đợt ${w}: bộ quái ${ro} ≠ màn ${LEVELS[game.stage.lv].roster}`);
            game.startWave();
            let maxOff = 0;
            for (let s = 0; s < 1500 && game.waveActive; s++) {
              game.update(0.05);
              for (const e of game.enemies) if (!e.def.flying && e.x > 0 && e.x < CONFIG.W) maxOff = Math.max(maxOff, Math.min(...CONFIG.paths.map((p) => distToPolyline(p, e.x, e.y))));
            }
            if (maxOff > 45) bad.push(`đợt ${w}: quái lệch đường ${maxOff.toFixed(0)}`);
            game.enemies = []; game.spawnQueue = [];
          }
          game.wave = w; game.waveActive = true; game.spawnQueue = []; game.enemies = [];
          game.waveComplete();
          const want = endlessStageAt(w, lv);
          if (game.stage.k !== want.k || MAP_ID !== stageMapId(want)) bad.push(`sau đợt ${w}: màn ${game.stage.k}/${MAP_ID} ≠ ${want.k}/${stageMapId(want)}`);
          if (boss && game.stage.k !== k0 + 1) bad.push(`sau đợt boss ${w}: không sang màn mới`);
          if (!boss && game.stage.k !== k0) bad.push(`sau đợt ${w}: đổi màn khi không có boss`);
          if (game.stage.k !== k0) {
            const ev = game.events.find((e) => e.type === 'stage');
            if (!ev) bad.push(`đợt ${w}: thiếu sự kiện màn mới`);
            log.push(`${w}:${MAP_ID}×${game.pathHp}`);
          }
          k0 = game.stage.k;
          game.events.length = 0;
          const hs = game.heroes.filter(Boolean);
          if (hs.map((h) => h.id).sort().join() !== ids0) bad.push(`sau đợt ${w}: mất / thừa tướng`);
          for (const h of hs) { const s = CONFIG.slots[h.slot]; if (!s || game.heroes[h.slot] !== h || s[0] !== h.x || s[1] !== h.y) { bad.push(`sau đợt ${w}: tướng lệch ô`); break; } }
          if (game.heroes.length !== CONFIG.slots.length) bad.push(`sau đợt ${w}: mảng tướng ${game.heroes.length} ≠ ${CONFIG.slots.length} ô`);
        }
        return { bad, log };
      }, lv);
      console.log(`  ải ${lv + 1}: ${r.log.join(' ')}`);
      ok(!r.bad.length, `ải ${lv + 1}: tua tới đợt 200 — sang màn mới sau mỗi boss, đúng bộ quái + boss, giữ đủ tướng đúng ô ${r.bad.slice(0, 4).join(' | ')}`);
    }
    // hết ô → hoàn vàng + đồ về túi; trận mới về màn đầu
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
      game.setStage({ k: 1, lv: 0, shape: 'xoanoc', at: 10 });
      const n1 = game.heroes.filter(Boolean).length, slots = CONFIG.slots.length;
      const kept = game.heroes.filter(Boolean).reduce((s, h) => s + h.spent, 0);
      const r = { n0, n1, slots, refund: game.gold - g0, lostSpent: spent - kept, bag: game.inventory.length - bag0, hadItem: !!it, kept0: game.heroes.includes(h0) };
      game.reset(0);
      r.back = MAP_ID; r.hp = game.pathHp; r.k = game.stage.k;
      return r;
    });
    ok(full.n1 === Math.min(full.n0, full.slots) && full.refund === full.lostSpent && full.refund > 0,
      `đầy sân ${full.n0} tướng → Xoắn ốc ${full.slots} ô: giữ ${full.n1}, hoàn đủ ${full.refund} vàng tướng hết chỗ`);
    if (full.hadItem && !full.kept0) ok(full.bag === 1, 'đồ của tướng hết chỗ trả về túi');
    ok(full.back === 'song1' && full.hp === 1 && full.k === 0, 'vào trận mới: về màn đầu, máu quái ×1');
    // lưu / nạp giữa trận giữ đúng màn + ô tướng
    const sv = await page.evaluate(() => {
      game.reset(0); game.endless = true; game.started = true; game.gold = 1e6;
      game.placeHero(2, Object.keys(HEROES)[0]); game.placeHero(5, Object.keys(HEROES)[1]);
      for (let w = 1; w <= 33; w++) { game.wave = w; game.waveActive = true; game.spawnQueue = []; game.enemies = []; game.waveComplete(); }
      const pick = () => ({ id: MAP_ID, k: game.stage.k, hp: game.pathHp, ro: rosterKeyOf(rosterFor(game.wave + 1, 0, game.stLv())), next: game.nextWave.map((e) => e.type).join(','), pos: game.heroes.map((h, i) => h && `${i}:${h.type}@${h.x},${h.y}`).filter(Boolean).join(' ') });
      const before = pick();
      const snap = JSON.parse(JSON.stringify(game.snapshot()));
      game.reset(3);
      game.restore(snap);
      const after = pick();
      before.next = after.next = '';   // đợt kế rút lại ngẫu nhiên — chỉ so bộ quái
      game.wave = 34; game.waveActive = true; game.spawnQueue = []; game.enemies = []; game.waveComplete();
      return { before, after, still: game.stage.k };
    });
    ok(JSON.stringify(sv.before) === JSON.stringify(sv.after) && sv.after.k > 0 && sv.still === sv.after.k,
      `lưu / nạp ở đợt 33 giữ màn ${sv.after.k} (${sv.after.id}, quân ${sv.after.ro}, máu ×${sv.after.hp}) và đúng ô tướng`);
    // chơi nhóm: không đổi màn (ô chia theo người chơi)
    ok(await page.evaluate(() => {
      game.reset(0); game.endless = true; game.co = { canAct: () => true };
      game.wave = 10; game.waveActive = true; game.spawnQueue = []; game.enemies = [];
      try { game.waveComplete(); } catch (e) { /* bảng co-op giả */ }
      const r = game.stage.k === 0 && MAP_ID === 'song1';
      game.co = null; game.reset(0);
      return r;
    }), 'chơi nhóm: giữ bản đồ của phòng');

    // ---- 4. cân bằng: mô phỏng trận (đội 8 tướng ★3 cấp 20 đặt vào 8 ô phủ đường tốt nhất, 3 đợt)
    const bal = await page.evaluate(() => {
      let seed = 1; const rnd0 = Math.random;
      Math.random = () => { let t = (seed = (seed + 0x6D2B79F5) | 0); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      const ARMY = ['xathu', 'lactuong', 'thaymo', 'thansuong', 'lucsi', 'thosan', 'xathu', 'thaymo'];
      const run = (lv, w0, shape) => {
        seed = 777;
        game.reset(lv); game.endless = true; game.started = true; game.running = true;
        game.wave = w0; game.stageTick = () => {};
        game.setStage({ k: 1, lv, shape, at: 0 });   // cùng bộ quái của ải cho mọi dạng (cả đường gốc: shape null)
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
        delete game.stageTick;
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

  // ---------- 3b. giao diện: vào Vô tận không chọn bản đồ → qua boss sang màn → tải lại trang → Tiếp tục
  {
    const { browser, page, errors } = await open(844, 390, { unlocked: 17 });
    await page.click('#btn-continue');
    await page.waitForSelector('#modes:not([hidden])');
    await page.click('#modes .md-card.endl');
    await page.waitForSelector('#prep:not([hidden])');
    ok(await page.evaluate(() => $('#campaign').hidden && game.level === 0 && game.stage.k === 0 && MAP_ID === 'song1'), 'chọn Vô tận → vào màn đầu (Bến Sông Đà) luôn, không qua màn chọn bản đồ');
    await page.screenshot({ path: path.join(SHOT, 'chuan-bi-844x390.png') });
    // nút Khó trong màn Chuẩn bị
    await page.click('[data-act=prep-diff]');
    ok(await page.evaluate(() => game.hard && ui.save.settings.hard && /Bật/.test($('[data-act=prep-diff]').textContent)), 'màn Chuẩn bị: bật Khó');
    await page.click('[data-act=prep-diff]');
    await page.click('[data-act=prep-go]');
    await page.waitForTimeout(300);
    // chơi tới đợt boss 10: đặt tướng, tua đợt 1–9, đợt 10 chạy thật bằng vòng lặp game (game.running), hạ hết quái + boss
    await page.evaluate(() => {
      game.gold = 5000;
      game.placeHero(2, 'xathu'); game.placeHero(6, 'lactuong'); game.placeHero(9, 'thaymo');
      for (let w = 1; w <= 9; w++) { game.wave = w; game.waveActive = true; game.spawnQueue = []; game.enemies = []; game.waveComplete(); }
      game.nextWave = buildWave(10, game.level, game.stLv());   // (tua bằng waveComplete không dựng đợt kế)
      game.lives = 999; game.nextWaveT = 0.1; game.running = true; game.speed = 4;
    });
    await page.waitForFunction(() => game.wave === 10 && game.enemies.some((e) => e.def.boss), null, { timeout: 60000 });
    // hạ boss cuối cùng (sân hết quái cùng lúc → đợt boss xong ngay trong khung hạ boss)
    await page.evaluate(() => { game.spawnQueue = []; for (const e of game.enemies) if (!e.def.boss) { e.dead = true; } game.enemies = game.enemies.filter((e) => e.def.boss); const b = game.enemies[0]; game.kill(b, null); });
    await page.waitForSelector('#reward:not([hidden])');
    const w0 = await page.evaluate(() => ({ run: game.running, wave: game.wave, active: game.waveActive, t: game.nextWaveT, id: MAP_ID, k: game.stage.k }));
    await page.waitForTimeout(4000);   // để bảng Sính lễ mở 4 giây (tester: trước đây đợt 11–13 tự chạy sau lưng bảng)
    const w1 = await page.evaluate(() => ({ run: game.running, wave: game.wave, active: game.waveActive, t: game.nextWaveT, id: MAP_ID, k: game.stage.k }));
    ok(!w0.run && !w1.run && w1.wave === 10 && !w1.active && Math.abs(w1.t - w0.t) < 0.01 && w1.id === 'song1' && w1.k === 0,
      `bảng Sính lễ mở: trận dừng hẳn (4 giây vẫn đợt 10, đếm ngược đứng ở ${w1.t.toFixed(1)} giây), chưa đổi màn`);
    await page.screenshot({ path: path.join(SHOT, 'sinh-le-844x390.png') });
    await page.evaluate(() => { game.speed = 1; });
    await page.click('#reward [data-act=reward][data-i="2"]');
    await page.waitForTimeout(400);
    const r1 = await page.evaluate(() => ({ run: game.running, wave: game.wave, k: game.stage.k, id: MAP_ID, t: game.nextWaveT, hint: !$('#roster-hint').hidden, banner: !$('#banner').hidden && $('#banner').textContent }));
    ok(r1.run && r1.wave === 10 && r1.k === 1 && r1.id !== 'song1' && r1.t >= 19, `đóng Sính lễ → sang màn 2 (${r1.id}), trận chạy lại, nghỉ ${r1.t.toFixed(1)} giây trước đợt 11`);
    ok(/vùng đất mới/.test(r1.banner) && !r1.hint, `một banner "${(r1.banner || '').replace(/\s+/g, ' ').trim()}", không chồng bảng bộ quái mới`);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(SHOT, 'sang-man-844x390.png') });
    await page.waitForTimeout(2200);
    const toasts = await page.evaluate(() => [...document.querySelectorAll('#toasts .toast')].map((t) => t.textContent));
    const hint2 = await page.evaluate(() => !!document.querySelector('#roster-hint:not([hidden])'));
    ok(toasts.length <= 2 && !hint2, `sau banner: ${toasts.length} thông báo (${toasts.join(' | ').slice(0, 120)})`);
    await page.screenshot({ path: path.join(SHOT, 'sang-man-thong-bao-844x390.png') });
    await page.evaluate(() => { game.running = false; });
    const before = await page.evaluate(() => ({ id: MAP_ID, k: game.stage.k, lv: game.stage.lv, wave: game.wave, ro: rosterKeyOf(rosterFor(game.wave + 1, game.level, game.stLv())), hp: game.pathHp,
      heroes: game.heroes.map((h, i) => h && `${i}:${h.type}`).filter(Boolean).join(' '), saved: ui.save.run && ui.save.run.mapId, savedStage: ui.save.run && ui.save.run.stage && ui.save.run.stage.k }));
    ok(before.saved === before.id && before.savedStage === before.k, `bản lưu ghi màn hiện tại (${before.saved}, màn ${before.savedStage})`);
    await page.reload();
    await page.waitForTimeout(1200);
    ok(await page.evaluate(() => /Tiếp tục/.test($('#continue-label').textContent)), 'tải lại trang: nút Tiếp tục');
    await page.click('#btn-continue');
    await page.waitForTimeout(600);
    const after = await page.evaluate(() => ({ id: MAP_ID, k: game.stage.k, lv: game.stage.lv, wave: game.wave, ro: rosterKeyOf(rosterFor(game.wave + 1, game.level, game.stLv())), hp: game.pathHp,
      heroes: game.heroes.map((h, i) => h && `${i}:${h.type}`).filter(Boolean).join(' '), saved: ui.save.run && ui.save.run.mapId, savedStage: ui.save.run && ui.save.run.stage && ui.save.run.stage.k }));
    ok(JSON.stringify(after) === JSON.stringify(before), `Tiếp tục: cùng bản đồ ${after.id}, bộ quái ${after.ro}, đợt ${after.wave}, ô tướng ${after.heroes}`);
    ok(await page.evaluate(() => { render(); return !pathFade; }), 'Tiếp tục: không chạy chuyển cảnh (chỉ chạy khi đổi màn trong trận)');
    await page.screenshot({ path: path.join(SHOT, 'tiep-tuc-844x390.png') });
    // bản lưu cũ (không có trường màn): đợt 35, tướng trên bản đồ gốc → suy ra màn từ số đợt, không lỗi
    await page.evaluate(() => {
      game.reset(0); game.endless = true; game.started = true; game.gold = 1e5;
      game.placeHero(1, 'xathu'); game.placeHero(4, 'thaymo'); game.wave = 35;
      const o = game.snapshot(); delete o.stage; delete o.mapId; delete o.pathHp;
      game.started = false; game.over = true;
      ui.save.run = o; writeSave(ui.save);
    });
    await page.reload();
    await page.waitForTimeout(1200);
    const lbl = await page.evaluate(() => ({ t: $('#continue-label').textContent, want: LEVELS[endlessStageAt(35, 0).lv].name }));
    ok(lbl.t.includes(lbl.want) && /Đợt 35/.test(lbl.t), `bản lưu cũ: nút "${lbl.t}" ghi đúng vùng đất sẽ vào`);
    await page.click('#btn-continue');
    await page.waitForTimeout(600);
    const old = await page.evaluate(() => { const st = endlessStageAt(35, 0); return { k: game.stage.k, want: st.k, id: MAP_ID, wid: stageMapId(st), n: game.heroes.filter(Boolean).length, wave: game.wave, started: game.started }; });
    ok(old.started && old.wave === 35 && old.k === old.want && old.id === old.wid && old.n === 2, `bản lưu cũ đợt 35: suy ra màn ${old.k} (${old.id}), giữ 2 tướng`);
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
          game.setStage({ k: 1, lv: game.level, shape: sh, at: 0 }); game.events.length = 0; game.effects = game.effects.filter((f) => f.type !== 'summon');
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
        game.setStage({ k: 1, lv: game.level, shape: 'zigzag', at: 0 }); render();
        await new Promise((r) => setTimeout(r, 1900)); render();
        game.setStage({ k: 2, lv: game.level, shape: 'uonkhuc', at: 0 }); render();
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
