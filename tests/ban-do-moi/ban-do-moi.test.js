// Thêm dạng bản đồ (claude/ban-do-moi). Chạy: node tests/ban-do-moi/ban-do-moi.test.js
// 1) quy tắc chốt: CHỈ ải đầu (Bến Sông Đà) đi đường gốc; mọi ải khác + mọi màn Vô tận sau màn đầu đều đi dạng đường khác
// 2) từng dạng mới: đường liền, ô không đè đường, đủ ô, đặc trưng riêng (3 nhánh nhập 1, 2 cầu, ô trên núi, dãy ô giữa
//    hai ngả, đoạn đò đi chậm, cổng trên / dưới gần thành) + quái đi đúng đường mọi nhánh
// 3) ải chiến dịch: máu quái nhân theo độ phơi so với đường gốc (0,8–1,4); bản lưu cũ (đường gốc) nạp lại đúng đường cũ
// 4) ảnh từng dạng 844×390 + 1920×934 (nền vẽ tay + bật pixel) vào shots/
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('../cho-tuong/helpers');

const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const NEW = ['ngaba', 'caunhieu', 'vongnui', 'songsong', 'deodoc', 'ruongdoc', 'bendo', 'cong3'];

(async () => {
  {
    const { browser, page, errors } = await open(844, 390, { unlocked: 17 });
    await enter(page, 0);
    // ---- 1. quy tắc chốt
    const rule = await page.evaluate(() => {
      const bad = [];
      if (LEVELS[0].shape || levelMapId(0) !== 'song1') bad.push('ải đầu không phải đường gốc');
      LEVELS.forEach((L, i) => { if (i && !(L.shape && PATH_SHAPES[L.shape] && MAPS[levelMapId(i)].shape)) bad.push(`ải ${i} (${L.name}) đi đường gốc`); });
      // ải nào cũng vào đúng bản đồ của ải
      for (let i = 0; i < LEVELS.length; i++) { game.reset(i); if (MAP_ID !== levelMapId(i)) bad.push(`ải ${i}: vào ${MAP_ID} ≠ ${levelMapId(i)}`); }
      // Vô tận: mọi màn sau màn đầu (k ≥ 1) có dạng đường, từ mọi ải bắt đầu
      for (let lv = 0; lv < LEVELS.length; lv++) for (let w = 1; w <= 400; w++) { const st = endlessStageAt(w, lv); if (st.k && !st.shape) { bad.push(`Vô tận từ ải ${lv}: màn ${st.k} đi đường gốc`); break; } }
      // mọi dạng mới đều xuất hiện ở Vô tận (400 đợt từ ải đầu) + cổng ba phía chỉ ở đợt cao
      const used = new Set(); let cong3Early = 0;
      for (let w = 1; w <= 400; w++) { const st = endlessStageAt(w, 0); if (st.shape) used.add(st.shape); if (st.shape === 'cong3' && st.at < ENDLESS_STAGES.hardFrom) cong3Early++; }
      return { bad, used: [...used], cong3Early, cong3Lv: LEVELS.map((L, i) => L.shape === 'cong3' ? i : -1).filter((i) => i >= 0), ends: CHAPTERS.map((c) => c.to) };
    });
    ok(!rule.bad.length, `chỉ ải đầu đi đường gốc; mọi ải khác + mọi màn Vô tận sau màn đầu đi dạng khác ${rule.bad.slice(0, 4).join(' | ')}`);
    for (const sh of NEW) ok(rule.used.includes(sh), `Vô tận có dạng ${sh}`);
    ok(rule.cong3Early === 0 && rule.cong3Lv.every((i) => rule.ends.includes(i)), `Cổng ba phía chỉ ở ải cuối chương (${rule.cong3Lv}) / Vô tận đợt cao`);

    // ---- 2. hình học + đặc trưng từng dạng
    const geo = await page.evaluate((NEW) => {
      const out = {};
      for (const sh of NEW) {
        const id = mapVariant('song1', sh); setMap(id);
        const m = MAPS[id], r = { bad: [], slots: CONFIG.slots.length, lanes: PATH.lanes.length };
        CONFIG.paths.forEach((pts, li) => { for (let i = 1; i < pts.length; i++) if (Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) > 40) r.bad.push(`nhánh ${li} hở`); });
        for (const [x, y] of CONFIG.slots) if (distToPath(x, y) / DK < CONFIG.buildGrid.minD - 0.5) r.bad.push(`ô (${Math.round(x / DK)},${Math.round(y / DK)}) đè đường`);
        if (CONFIG.slots.length < 12) r.bad.push(`chỉ ${CONFIG.slots.length} ô`);
        // ô không đè cảnh đặc biệt sai chỗ: ô trong dải sông của bến đò thì không được (không đứng giữa sông)
        if (m.ferry) for (const [x] of CONFIG.slots) if (x / DK > m.ferry[0] + 6 && x / DK < m.ferry[1] - 6) r.bad.push('ô nằm giữa sông bến đò');
        // ô cạnh mọi nhánh: nhánh nào cũng có ≥ 2 ô trong tầm 120
        CONFIG.paths.forEach((pts, li) => { const n = CONFIG.slots.filter(([x, y]) => distToPolyline(pts, x, y) / DK < 120).length; if (n < 2) r.bad.push(`nhánh ${li} chỉ ${n} ô gần`); });
        r.cross = pathCrossings(CONFIG.paths[0]).length;
        r.off = PATH.lanes.map((L) => Math.round((L.off || 0) / DK));
        r.slow = PATH.slow.length;
        if (m.mount) { const [cx, cy, rx, ry] = m.mount; r.onMount = CONFIG.slots.filter(([x, y]) => ((x / DK - cx) / rx) ** 2 + ((y / DK - cy) / ry) ** 2 <= 1).length; }
        // ô đánh được cả hai ngả (khoảng cách tới mỗi nhánh ≤ 98)
        if (sh === 'songsong') r.both = CONFIG.slots.filter(([x, y]) => CONFIG.paths.every((p) => distToPolyline(p, x, y) / DK <= 98)).length;
        out[sh] = r;
      }
      return out;
    }, NEW);
    for (const sh of NEW) ok(!geo[sh].bad.length, `${sh}: đường liền, ${geo[sh].slots} ô không đè đường, nhánh nào cũng có ô ${geo[sh].bad.slice(0, 4).join(' | ')}`);
    ok(geo.ngaba.lanes === 3, 'Ngã ba sông: 3 nhánh nhập 1');
    ok(geo.caunhieu.cross === 2, `Cầu phao hai vòng: ${geo.caunhieu.cross} chỗ cắt có cầu`);
    ok(geo.vongnui.onMount >= 2, `Vòng quanh núi: ${geo.vongnui.onMount} ô trên sườn núi giữa`);
    ok(geo.songsong.lanes === 2 && geo.songsong.both >= 4, `Hai đường song song: ${geo.songsong.both} ô giữa đánh được cả hai ngả`);
    ok(geo.bendo.slow === 1, 'Bến đò: có đoạn qua sông đi chậm');
    ok(geo.cong3.lanes === 3 && geo.cong3.off[1] > 200 && geo.cong3.off[2] > 200, `Cổng ba phía: cổng trên / dưới vào giữa đường (off ${geo.cong3.off})`);

    // quái đi đúng đường mọi nhánh, tới thành; nhánh cổng trên / dưới ra ngay ở cổng; đò đi chậm
    const walk = await page.evaluate((NEW) => {
      const out = [];
      for (const sh of NEW) {
        game.reset(0); game.started = true; game.running = true;
        game.setStage({ k: 1, lv: 0, shape: sh, at: 0 }); game.events.length = 0;
        game.stageTick = () => {}; game.lives = 9999;
        let maxOff = 0, seen = new Set(), lanes = new Set(), firstBad = 0, inFerry = 0, outFerry = 0;
        game.startWave();
        for (let s = 0; s < 9000 && game.waveActive; s++) {
          game.update(0.05);
          for (const e of game.enemies) {
            if (!seen.has(e.id)) { seen.add(e.id); lanes.add(e.lane); const g = CONFIG.paths[e.lane || 0][0]; if (e.lane && PATH.lanes[e.lane].off && Math.hypot(e.x - g[0], e.y - g[1]) > 30) firstBad++; }
            if (!e.def.flying && e.x > -5 && e.x < CONFIG.W) maxOff = Math.max(maxOff, Math.min(...CONFIG.paths.map((p) => distToPolyline(p, e.x, e.y))));
            if (!e.def.flying && PATH.slow.length && e.stunT <= 0) { if (PATH.speedAt(e.dist) < 1) inFerry++; else outFerry++; }
          }
        }
        delete game.stageTick;
        out.push({ sh, spawned: seen.size, lost: 9999 - game.lives, lanes: lanes.size, need: PATH.lanes.length, maxOff, done: !game.waveActive, firstBad, inFerry, outFerry });
      }
      return out;
    }, NEW);
    for (const x of walk) ok(x.done && x.lost >= x.spawned && x.lanes === x.need && x.maxOff < 45 && !x.firstBad,
      `${x.sh}: ${x.spawned} quái đi hết đường (${x.lanes}/${x.need} nhánh, lệch ${x.maxOff.toFixed(1)}${x.firstBad ? `, ${x.firstBad} quái không ra ở cổng` : ''})`);
    const b = walk.find((x) => x.sh === 'bendo');
    ok(b.inFerry > 0, `Bến đò: quái có đi qua đoạn đò (${b.inFerry} khung)`);
    const ferryT = await page.evaluate(() => {
      // cùng một quái đi qua đò: thời gian trên đoạn đò ≈ 2 lần đi bộ
      setMap(mapVariant('song1', 'bendo')); const z = PATH.slow[0];
      game.reset(0); game.setStage({ k: 1, lv: 0, shape: 'bendo', at: 0 });
      const type = Object.keys(ENEMIES).find((k) => !ENEMIES[k].boss && !ENEMIES[k].flying && ENEMIES[k].speed > 20 && !ENEMIES[k].dash && !ENEMIES[k].speedAura);
      game.enemies = []; game.spawnQueue = []; game.waveActive = false; game.lives = 9999; game.started = true; game.running = true;
      const e = game.spawn(type, z.d0, null, null, 0), sp = e.def.speed; game.enemies = [e];
      let t = 0;
      while (e.dist < z.d1 && t < 60 && !e.dead) { game.update(0.05); t += 0.05; }
      return { t, walk: (z.d1 - z.d0) / sp };
    });
    ok(ferryT.t > ferryT.walk * 1.7, `Bến đò: qua sông mất ${ferryT.t.toFixed(1)} giây (đi bộ ${ferryT.walk.toFixed(1)} giây)`);

    // ---- 3. máu quái ải chiến dịch + bản lưu cũ
    const camp = await page.evaluate(() => {
      const hp = LEVELS.map((_, i) => { game.reset(i); return game.pathHp; });
      // bản lưu cũ (trước nhánh này): ải 3 lưu trên đường gốc song4, stage k0 không có dạng
      game.reset(3); const snap = game.snapshot();
      snap.stage = { k: 0, lv: 3, shape: null, at: 0 }; snap.mapId = 'song4'; snap.pathHp = 1;
      snap.heroes = CONFIG.slots.map(() => null);
      game.restore(snap);
      const oldOk = MAP_ID === 'song4' && game.pathHp === 1;
      game.reset(3); const s2 = game.snapshot(); game.restore(s2);
      return { hp, oldOk, newOk: MAP_ID === levelMapId(3) };
    });
    ok(camp.hp[0] === 1 && camp.hp.every((v) => v >= 0.8 && v <= 1.4), `máu quái ải chiến dịch theo dạng đường: ${camp.hp.join(' ')}`);
    ok(camp.oldOk && camp.newOk, 'bản lưu cũ (đường gốc) nạp lại đúng đường cũ; bản lưu mới đúng dạng đường của ải');
    ok(!errors.length, `không lỗi trang ${errors.slice(0, 3).join(' | ')}`);
    await browser.close();
  }

  // ---- 4. ảnh từng dạng (ải chiến dịch hợp chủ đề) — nền vẽ tay rồi bật pixel
  const LV = { ngaba: 6, caunhieu: 5, vongnui: 4, songsong: 12, deodoc: 10, ruongdoc: 11, bendo: 13, cong3: 7 };
  for (const pixel of [false, true]) {
    for (const [w, h] of [[844, 390], [1920, 934]]) {
      const { browser, page, errors } = await open(w, h, { unlocked: 17 }, pixel ? (p) => p.addInitScript(() => { window.PIXEL_BAT_EP = true; }) : undefined);
      for (const sh of NEW) {
        await enter(page, LV[sh]);
        ok(await page.evaluate((sh) => MAPS[MAP_ID].shape === sh, sh), `${w}×${h}: ải ${LV[sh] + 1} đi ${sh}`);
        await page.evaluate(() => { mapLayerCache.key = ''; });
        await page.waitForTimeout(1200);
        await page.screenshot({ path: path.join(SHOT, `${sh}${pixel ? '-pixel' : ''}-${w}x${h}.png`) });
        await page.evaluate(() => { game.state = 'menu'; });
      }
      ok(!errors.length, `${w}×${h}${pixel ? ' pixel' : ''}: không lỗi trang ${errors.slice(0, 3).join(' | ')}`);
      await browser.close();
    }
  }
  console.log('XONG');
})().catch((e) => { console.error(e); process.exit(1); });
