// Nhánh vo-tan-su-kien: (1) Vô tận có vô tận thật không — đợt 200 / 500 / 1000 / 5000 / 1e6 không NaN / Infinity,
// quái vẫn sinh, độ khó vẫn tăng, giao diện số đợt đúng; (2) sự kiện đợt: từ đợt 60, cứ 10 đợt một thử thách
// (khó hơn chút, nặng dần), báo trước 1 đợt, có thưởng; (3) mô phỏng: đội vừa đủ qua đợt thường vẫn qua được đợt sự kiện.
// Chạy: node tests/vo-tan-su-kien/vo-tan-su-kien.test.js
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('../cho-tuong/helpers');
const { minM, leaks } = require('./mo-phong');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });

// đặt đội + dựng cảnh trận ở đợt n (chưa chạy)
const setup = (page, n, evId) => page.evaluate(([n, evId]) => {
  const g = game;
  if (evId) { window.__ev0 = window.__ev0 || eventAt; eventAt = (w, lv) => (w === n ? waveEventOf(evId, n, (n - 60) / 10) : window.__ev0(w, lv)); }
  g.gold = 5000; g.lives = 20;
  for (const [sl, t] of [[1, 'xathu'], [3, 'lactuong'], [5, 'thaymo'], [7, 'thansuong'], [9, 'lucsi'], [11, 'thosan']]) if (!g.heroes[sl] && !g.isFlooded(sl)) { g.placeHero(sl, t); }
  for (const h of g.heroes) if (h) { h.dead = false; h.respawnT = 0; h.stunT = 0; h.cursed = 0; h.hp = heroStats(h).hpMax; }
  g.wave = n - 1; g.evWave = n - 1; g.waveActive = false; g.enemies = []; g.spawnQueue = [];
  g.nextWave = buildWave(n, g.level); g.nextWaveT = 3; g.running = true; g.events.length = 0;
  // nhảy thẳng tới đợt n (không chơi qua) → khung "bộ quái mới" bật ra; chơi thật thì đã báo từ trước
  ui.rosterKey = rosterKeyOf(rosterFor(n + 1, g.level)); ui.rosterLevel = g.level; document.querySelector('#roster-hint').hidden = true;
}, [n, evId]);
const CHI_ANH = !!process.env.CHI_ANH;   // CHI_ANH=1: chỉ chụp ảnh

(async () => {
  let { browser, page, errors } = await open(844, 390, {});
  await enter(page, 0, true);

  if (!CHI_ANH) {
  // ================= PHẦN 1: VÔ TẬN CÓ VÔ TẬN THẬT KHÔNG
  const big = await page.evaluate(() => {
    const out = [];
    for (const lv of [0, 2, 7, LEVELS.length - 1]) {
      let prev = 0;
      for (const n of [100, 200, 500, 1000, 2000, 5000, 20000, 100000, 1000000]) {
        game.level = lv; game.lv = LEVELS[lv]; game.wave = n;
        const w = buildWave(n, lv);
        let total = 0, bad = 0;
        for (const it of w) { const e = game.spawn(it.type, 0, it.elite, it); if (!isFinite(e.hp) || !(e.hp > 0) || !isFinite(e.armor) || !isFinite(e.x)) bad++; total += e.hp; }
        game.enemies = [];
        out.push({ lv, n, len: w.length, total, bad, up: total > prev, fmtHp: fmt(total) });
        prev = total;
      }
    }
    game.level = 0; game.lv = LEVELS[0]; game.wave = 0;
    return out;
  });
  ok(big.every((r) => r.len > 0 && r.len <= 81), `đợt 100 → 1.000.000: luôn có quái, tối đa 81 con/đợt (đợt 1000: ${big.find((r) => r.n === 1000).len} con — trước đây ~950–1250)`);
  ok(big.every((r) => !r.bad && isFinite(r.total)), 'đợt 100 → 1.000.000: máu / giáp / vị trí quái luôn hữu hạn (không NaN / Infinity — trước đây ~đợt 8000+ máu = Infinity)');
  ok(big.every((r) => r.n === 100 || r.up || r.n >= 20000), 'tổng máu đợt vẫn tăng theo đợt (100 < 200 < 500 < 1000 < 2000 < 5000)');
  ok(big.every((r) => !/\d{13}/.test(r.fmtHp.replace(/\./g, ''))), `số máu lớn viết gọn: ${big.find((r) => r.n === 1000 && r.lv === 0).fmtHp}, ${big.find((r) => r.n === 1e6 && r.lv === 0).fmtHp}`);
  const growth = await page.evaluate(() => {
    // đợt thường liền nhau (x1 → x2: không boss / bay / sự kiện), quái thường: tổng máu = số con × hpx × hệ số đợt
    const H = (n) => buildWave(n, 0).filter((it) => !ENEMIES[it.type].boss).reduce((a, it) => a + (it.hpx || 1) * waveHpMult(effWave(n, 0)), 0);
    const r = []; for (const n of [101, 201, 301, 501, 1001]) r.push(H(n + 1) / H(n));
    return r;
  });
  ok(growth.every((x) => x > 1 && x < 1.25), `độ khó tăng đều mỗi đợt (×${growth.map((x) => x.toFixed(3)).join(', ×')}) — không đứng yên, không vọt`);

  // tua đợt 1 → 1000 bằng code (như kết thúc từng đợt thật): không lỗi, vàng / Ngân khố hữu hạn, sự kiện báo trước đúng đợt
  const ff = await page.evaluate(() => {
    const g = game, soon = [], done = [], kho0 = ui.save.kho || 0;
    g.running = true; g.events.length = 0;
    for (let w = 1; w <= 1000; w++) {
      g.wave = w; g.waveActive = true; g.spawnQueue = []; g.enemies = []; g.waveComplete(); if (g.rest) g.skipRest();
      for (const ev of g.events) if (ev.type === 'waveEvent') (ev.phase === 'soon' ? soon : done).push(ev.ev.n + (ev.phase === 'soon' ? 0 : 0));
      g.events = g.events.filter((e) => e.type !== 'rest' && e.type !== 'checkpoint'); ui.handleEvents();
    }
    ui.updateTopbar(); ui.updateNextWaves();
    return { soon, done, gold: g.gold, kho: (ui.save.kho || 0) - kho0, wave: document.querySelector('#tb-wave').innerText, fill: document.querySelector('#tb-fill').style.width };
  });
  const sched = []; for (let n = 60; n <= 1000; n += 10) sched.push(n);
  ok(JSON.stringify(ff.done) === JSON.stringify(sched), `tua tới đợt 1000: sự kiện ở đúng 60, 70, 80 … 1000 (${ff.done.length} lần)`);
  ok(JSON.stringify(ff.soon) === JSON.stringify(sched), 'báo trước ở đợt liền trước (hết đợt 59, 69 … 999)');
  ok(isFinite(ff.gold) && ff.gold > 0 && isFinite(ff.kho) && ff.kho > 0, `vàng (${Math.round(ff.gold)}) / Ngân khố (+${ff.kho}) hữu hạn`);
  ok(/Đợt\s*1000\s*· Vô tận/.test(ff.wave), `thanh đợt hiện: "${ff.wave}"`);
  ok(ff.fill !== '100%', `thanh tiến độ chạy theo chặng 10 đợt sau đợt cuối cũ (đang ${ff.fill}, trước đây đứng 100%)`);
  // trận thật ở đợt 1000: sinh quái + đánh vài giây — không NaN
  await setup(page, 1000);
  const live = await page.evaluate(() => {
    const g = game; g.startWave();
    for (let i = 0; i < 300; i++) g.update(1 / 30);
    ui.updateTopbar();
    return { n: g.enemies.length + g.spawnQueue.length, nan: g.enemies.some((e) => !isFinite(e.hp) || !isFinite(e.x) || !isFinite(e.y)), gold: g.gold, bb: document.querySelector('#bb-hp').innerText };
  });
  ok(live.n > 0 && !live.nan && isFinite(live.gold), `đợt 1000 chạy thật: ${live.n} quái, không NaN`);
  await page.screenshot({ path: path.join(SHOT, 'dot-1000-844x390.png') });

  // ================= PHẦN 2: LỊCH SỰ KIỆN
  const cal = await page.evaluate(() => {
    const bad = [], rep = [], miss = [];
    for (let lv = 0; lv < LEVELS.length; lv++) {
      let prev = null;
      for (let n = 1; n <= 12000; n++) {
        const e = eventAt(n, lv), want = n >= 60 && n % 10 === 0;
        if (!!e !== want) bad.push(`${lv}:${n}`);
        if (!e) continue;
        if (prev && prev === e.id) rep.push(`${lv}:${n}`);
        prev = e.id;
        if (!WAVE_EVENTS[e.id] || !isFinite(e.gold) || !isFinite(e.kho) || /NaN|undefined/.test(e.desc)) bad.push(`${lv}:${n}:${e.id}`);
      }
      // mỗi vòng L sự kiện liên tiếp đủ cả L loại
      const L = WAVE_EVENT_IDS.length;
      for (let c = 0; c < 20; c++) { const s = new Set(); for (let i = 0; i < L; i++) s.add(eventAt(60 + (c * L + i) * 10, lv).id); if (s.size !== L) miss.push(`${lv}:${c}`); }
    }
    const early = []; for (let n = 1; n < 60; n++) if (buildWave(n, 0).some((it) => it.ev)) early.push(n);
    return { bad, rep, miss, early, ids: WAVE_EVENT_IDS, k60: eventAt(60, 0), k100: eventAt(100, 0), deep: eventAt(1000000, 3) };
  });
  ok(!cal.bad.length, 'sự kiện đúng lịch 60, 70, 80 … (tới đợt 12000, cả 17 bản đồ), không có ở đợt khác ' + cal.bad.slice(0, 5));
  ok(!cal.rep.length, 'không lặp cùng sự kiện 2 lần liên tiếp ' + cal.rep.slice(0, 5));
  ok(!cal.miss.length, `mỗi vòng ${cal.ids.length} sự kiện có đủ cả ${cal.ids.length} loại (xoay vòng ngẫu nhiên có kiểm soát)`);
  ok(!cal.early.length, 'trước đợt 60 không đổi gì (không có sự kiện)');
  ok(cal.deep && cal.deep.n === 1000000 && isFinite(cal.deep.kho), `đợt 1.000.000 vẫn có sự kiện: ${cal.deep.name} (${cal.deep.desc})`);
  // mức độ nặng dần theo số lần gặp
  const lvls = await page.evaluate(() => WAVE_EVENT_IDS.map((id) => { const a = waveEventOf(id, 60, 0).p, b = waveEventOf(id, 100, 4).p, c = waveEventOf(id, 1000, 94).p; const k = id === 'troibua' ? 'lock' : Object.keys(a)[0]; return [id, a[k], b[k], c[k]]; }));
  ok(lvls.every(([, a, b, c]) => a < b && b <= c && isFinite(c)), 'sự kiện nặng dần (đợt 60 < đợt 100 ≤ đợt 1000, có trần): ' + lvls.map(([id, a, , c]) => `${id} ${a}→${c}`).join(', '));

  // ================= từng sự kiện: kích hoạt đúng, hiệu ứng đúng, thưởng đúng
  for (const id of cal.ids) {
    await setup(page, 60, id);
    const r = await page.evaluate((id) => {
      const g = game, out = { id };
      const ev = waveEventOf(id, 60, 0);
      // đợt 59 xong → báo trước
      g.wave = 59; g.waveActive = true; g.evWave = 58; g.waveComplete(); if (g.rest) g.skipRest();
      out.soon = g.events.some((e) => e.type === 'waveEvent' && e.phase === 'soon' && e.ev.id === id && e.ev.n === 60);
      ui.handleEvents();
      out.banner = !document.querySelector('#banner').hidden && document.querySelector('#banner-text').innerText === ev.name;
      ui.updateNextWaves();
      out.strip = !!document.querySelector('#nextwaves .evt .icn') && document.querySelector('#nextwaves').innerText.includes(ev.name);
      g.events.length = 0;
      g.updateAuras(); const range0 = heroStats(g.heroes[1]).range;
      g.updateAuras(); const dmg0 = g.heroes.map((h) => (h ? heroStats(h).damage : 0));
      g.startWave();
      out.start = g.events.some((e) => e.type === 'waveEvent' && e.phase === 'start' && e.ev.id === id);
      const q = g.spawnQueue;
      out.air = q.filter((it) => ENEMIES[it.type].flying).length / q.length;
      out.elite = q.filter((it) => it.elite).length / q.length;
      out.evq = q.filter((it) => it.ev).length;
      g.updateAuras();
      out.fog = 1 - heroStats(g.heroes[1]).range / range0;
      // Ngũ Hành Nghịch: đúng hành bị giảm, hành khác giữ nguyên
      out.weakOk = g.heroes.every((h, i) => !h || Math.abs(heroStats(h).damage / dmg0[i] - (ev.p.weak && HEROES[h.type].el === ev.p.el ? 1 - ev.p.weak : 1)) < 0.01);
      out.weakHit = g.heroes.filter((h) => h && ev.p.weak && HEROES[h.type].el === ev.p.el).length;
      // Bùa Yểm: chạy quá p.every giây → có 1 tướng bị trói
      if (ev.p.lock) { for (let i = 0; i < Math.ceil((ev.p.every + 0.3) * 30); i++) g.updateEventCurse(1 / 30); out.cursed = g.heroes.filter((h) => h && h.stunT > 0 && h.cursed).length; }
      // Quân Hùng Hậu: quái (kể cả boss) thêm máu
      if (ev.p.hp) { const a = g.spawn(q[0].type, 40, null, q[0]), b = g.spawn(q[0].type, 40, null, { ...q[0], ev: null }); out.hpx = a.maxHp / b.maxHp; out.bossEv = !!(q[q.length - 1].ev && q[q.length - 1].ev.hp); a.dead = b.dead = true; }
      // quái sinh ra mang hiệu ứng
      const e = g.spawn(q[0].type, 50, null, q[0]);
      out.regen = e.evRegen || 0; out.speed = e.evSpeed || 0; out.split = e.evSplit || 0;
      if (id === 'hoimau') { e.hp = e.maxHp * 0.5; g.updateEnemy(e, 1); out.healed = e.hp / e.maxHp - 0.5; }
      if (id === 'giobao') { const a = g.spawn(q[0].type, 50, null), d0 = e.dist, a0 = a.dist; g.updateEnemy(e, 0.5); g.updateEnemy(a, 0.5); out.fast = (e.dist - d0) / (a.dist - a0); }
      if (id === 'phanthan') {
        const n0 = g.enemies.length, gold0 = g.gold; g.kill(e, null);
        const kid = g.enemies.find((o) => o.split && !o.dead);
        out.kid = kid ? kid.maxHp / e.maxHp : 0; out.n = g.enemies.length - n0;
        const gold1 = g.gold; g.kill(kid, null); out.kidGold = g.gold - gold1; out.kidSplit = g.enemies.some((o) => o.split && !o.dead);
      }
      // vượt đợt → thưởng
      g.enemies = []; g.spawnQueue = []; g.events.length = 0;
      const gold0 = g.gold, kho0 = ui.save.kho || 0;
      g.waveComplete(); if (g.rest) g.skipRest();
      out.gold = g.gold - gold0 - (20 + 60 * 5);     // còn lại = thưởng sự kiện + vàng núi / giữ vững
      out.doneEv = g.events.find((x) => x.type === 'waveEvent' && x.phase === 'done');
      out.khoEv = g.events.find((x) => x.type === 'kho' && /vượt/.test(x.why));
      g.events = g.events.filter((e) => e.type !== 'rest'); ui.handleEvents();
      g.events = g.events.filter((e) => e.type !== 'rest');
      out.kho = (ui.save.kho || 0) - kho0;
      out.want = { gold: ev.gold, kho: ev.kho, p: ev.p };
      g.updateAuras(); out.fogAfter = 1 - heroStats(g.heroes[1]).range / range0;
      eventAt = window.__ev0;
      return out;
    }, id);
    const p = r.want.p;
    ok(r.soon && r.banner && r.strip, `${id}: hết đợt 59 → báo trước (banner + biểu tượng trên dải đợt kế)`);
    ok(r.start && (r.evq > 0 || p.elite || p.air || p.fog || p.weak || p.lock), `${id}: đợt 60 bắt đầu → sự kiện kích hoạt`);
    ok(r.weakOk, `${id}: sát thương tướng ${p.weak ? `hành ${p.el} −${Math.round(p.weak * 100)}% (${r.weakHit} tướng trúng), hành khác giữ nguyên` : 'không đổi'}`);
    if (p.lock) ok(r.cursed === 1, `${id}: sau ${p.every} giây trói 1 tướng ${p.lock} giây`);
    if (p.hp) ok(Math.abs(r.hpx - (1 + p.hp)) < 0.01 && r.bossEv, `${id}: quái máu ×${r.hpx.toFixed(2)}, boss cũng được tăng`);
    if (p.elite) ok(r.elite >= 0.25, `${id}: tỉ lệ tinh anh ${Math.round(r.elite * 100)}% (thường ~45%… cộng thêm ${p.elite * 100}%)`);
    if (p.air) ok(r.air >= 0.35, `${id}: ${Math.round(r.air * 100)}% quân là quái bay`);
    if (p.fog) ok(Math.abs(r.fog - p.fog) < 0.01 && r.fogAfter < 0.001, `${id}: tầm đánh −${Math.round(r.fog * 100)}% trong đợt, hết đợt trả lại`);
    else ok(r.fog < 0.001, `${id}: không đổi tầm đánh`);
    if (p.regen) ok(r.regen === p.regen && r.healed > 0.005, `${id}: quái hồi ${(r.healed * 100).toFixed(1)}%/giây`);
    if (p.speed) ok(Math.abs(r.fast - (1 + p.speed)) < 0.02, `${id}: quái chạy nhanh ×${r.fast.toFixed(2)}`);
    if (p.split) ok(r.n === 1 && Math.abs(r.kid - p.split) < 0.01 && r.kidGold === 0 && !r.kidSplit, `${id}: chết tách 1 phân thân ${Math.round(r.kid * 100)}% máu, phân thân không cho vàng, không tách tiếp`);
    ok(r.doneEv && r.doneEv.gold === r.want.gold && r.gold >= r.want.gold && r.khoEv && r.khoEv.n === r.want.kho && r.kho >= r.want.kho, `${id}: vượt qua → +${r.want.gold} vàng thưởng (ngoài vàng hết đợt), +${r.khoEv && r.khoEv.n} Ngân khố`);
  }
  ok(errors.length === 0, 'không lỗi trang ' + errors.join(' | '));
  }
  await browser.close();

  // ================= ẢNH: banner báo trước + trận đang có sự kiện, 3 cỡ màn
  for (const [w, h] of [[1920, 934], [844, 390], [667, 375]]) {
    ({ browser, page, errors } = await open(w, h, {}));
    await enter(page, 0, true);
    await setup(page, 60, 'suongmu');
    await page.evaluate(() => { const g = game; g.wave = 59; g.waveActive = true; g.waveComplete(); if (g.rest) g.skipRest(); g.running = false; });
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(SHOT, `bao-truoc-${w}x${h}.png`) });
    const ov = await page.evaluate(() => {
      const R = (s) => { const el = document.querySelector(s); if (!el || el.hidden || !el.offsetWidth) return null; return el.getBoundingClientRect(); };
      const hit = (a, b) => a && b && a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
      const bn = R('#banner'), nw = R('#nextwaves'), bad = [];
      for (const s of ['#topbar', '#btn-run', '#btn-menu', '#btn-speed', '#auto-btns', '#deck', '#fuse-strip .fz-card']) if (hit(bn, R(s))) bad.push('banner×' + s);
      for (const s of ['#btn-run', '#btn-menu', '#btn-speed', '#tb-gold', '#tb-lives']) if (hit(nw, R(s))) bad.push('dải×' + s);
      for (const t of document.querySelectorAll('#toasts > *')) if (hit(bn, t.getBoundingClientRect())) bad.push('banner×toast');
      const vw = document.documentElement.clientWidth;
      if (nw && (nw.left < 0 || nw.right > vw)) bad.push('dải tràn màn');
      return bad;
    });
    ok(!ov.length, `${w}x${h}: banner / dải đợt kế không đè nút, thanh, toast ${ov.join(', ')}`);
    // vào đợt sự kiện: chạy vài giây cho quái ra
    await page.waitForTimeout(2700);
    await page.evaluate(() => { const g = game; g.startWave(); ui.handleEvents(); for (let i = 0; i < 360; i++) g.update(1 / 30); g.running = false; });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SHOT, `trong-su-kien-${w}x${h}.png`) });
    ok(await page.evaluate(() => !!document.querySelector('#nextwaves .evt') && game.fogNow() > 0), `${w}x${h}: đang đợt sự kiện → dải trên hiện biểu tượng + thử thách`);
    ok(errors.length === 0, `${w}x${h}: không lỗi trang ` + errors.join(' | '));
    await browser.close();
  }

  if (CHI_ANH) return;
  // ================= PHẦN 3: MÔ PHỎNG — đội vừa đủ qua đợt 60 thường (M = lực sát thương nhỏ nhất để mất ≤ 2 mạng)
  // đánh 24 trận / sự kiện (lực ×0,8 · ×1 · ×1,25 × 8 seed): sự kiện phải khó hơn chút, và đội mạnh hơn 50% vẫn qua gọn
  ({ browser, page, errors } = await open(844, 390, {}));
  await enter(page, 0, true);
  const base = await minM(page, 60, false);
  const L0 = await leaks(page, 60, false, base);
  const rows = [];
  for (const id of await page.evaluate(() => WAVE_EVENT_IDS)) {
    const L = await leaks(page, 60, id, base);
    const strong = await leaks(page, 60, id, base * 1.5, 0, [1]);
    rows.push({ id, lost: L.lost, hp: L.hp / Math.max(1, L0.hp), strong: strong.lost / 8, out: L.out + strong.out });
  }
  console.log(`    đợt 60, lực M=${base.toFixed(1)}, đợt thường mất ${L0.lost} mạng / 24 trận:\n      ` + rows.map((r) => `${r.id}: mất ${r.lost} · máu lọt ×${r.hp.toFixed(2)} · lực ×1,5 mất TB ${r.strong.toFixed(1)}`).join('\n      '));
  ok(rows.every((r) => !r.out), 'mọi trận mô phỏng đều đánh xong đợt (không kẹt)');
  ok(rows.every((r) => r.strong <= 3), 'đội mạnh hơn 50% qua mọi sự kiện, mất TB ≤ 3 mạng — không phải tường chặn');
  ok(rows.every((r) => r.hp <= 6 && r.lost <= L0.lost * 5 + 30), 'không sự kiện nào khó vọt (máu lọt ≤ ×6 đợt thường)');
  ok(rows.filter((r) => r.hp > 1.05 || r.lost > L0.lost * 1.1).length >= rows.length - 2, 'đa số sự kiện làm đợt khó hơn đợt thường');
  ok(errors.length === 0, 'mô phỏng: không lỗi trang ' + errors.join(' | '));
  await browser.close();
  console.log('XONG vo-tan-su-kien');
})().catch((e) => { console.error(e); process.exit(1); });
