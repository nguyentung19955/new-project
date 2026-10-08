// Test claude/vfx-pixel-2: hiệu ứng pixel lô 2 — đạn theo hệ, nổ theo hệ, vật ném, thú / vật triệu hồi, Gióng bay, đá lăn,
// vùng đất (lửa / ruộng lúa / Cây Đa / đá), đàn Lạc Tử, hào quang đốt (trống / lửa ma / mưa), quái biến thể, vòng tinh anh,
// tướng choáng (chim Lạc), sa lầy, hào quang bậc tướng. Kiểm tra các móc trả true (vẽ pixel), không lỗi console, chụp 3 cỡ.
// Chạy: node tests/hieu-ung/hat-vfx-2.test.js
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('../cho-tuong/helpers');

const SHOTS = path.join(__dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

const stage = (page) => page.evaluate(() => {
  game.running = false;
  game.enemies.length = 0; game.effects.length = 0; game.projectiles.length = 0; game.zones.length = 0; game.blocks.length = 0;
  const L = PATH.total, at = (f) => PATH.at(L * f);
  const E = Object.keys(ENEMIES);
  const plain = E.filter((k) => !ENEMIES[k].boss && !ENEMIES[k].minion && !ENEMIES[k].flying && !ENEMIES[k].fx);
  // quái tinh anh 4 loại + quái biến thể có fx + boss có hào quang đốt
  ['armored', 'regen', 'swift', 'shield'].forEach((el, i) => { const e = game.spawn(plain[i], L * (0.08 + i * 0.07), el); e.hp *= 0.7; });
  const fxT = E.filter((k) => ENEMIES[k].fx && !ENEMIES[k].boss).slice(0, 3);
  fxT.forEach((k, i) => game.spawn(k, L * (0.4 + i * 0.06)));
  const aura = E.find((k) => ENEMIES[k].burnAura && !ENEMIES[k].boss) || E.find((k) => ENEMIES[k].burnAura);
  if (aura) game.spawn(aura, L * 0.62);
  // vùng đất + Lạc Tử
  const p1 = at(0.72), p2 = at(0.85);
  game.zones.push({ kind: 'fire', d1: L * 0.2, d2: L * 0.3, ttl: 3, max: 4 });
  game.zones.push({ kind: 'tree', x: p1.x, y: p1.y + 60, r: 90, heal: { r: 60 }, ttl: 3, max: 6 });
  game.zones.push({ kind: 'rice', x: p2.x - 60, y: p2.y + 70, r: 60, ttl: 3, max: 4 });
  game.zones.push({ kind: 'rock', x: p2.x + 60, y: p2.y - 50, r: 60, ttl: 3, max: 3.5 });
  game.blocks.push({ kind: 'eggs', dist: L * 0.52, ttl: 5, max: 6 });
  // hiệu ứng triệu hồi / vật ném (giữa chừng)
  const e0 = game.enemies[0], e1 = game.enemies[2];
  game.effects.push({ type: 'tiger', x: e0.x - 120, y: e0.y, target: e0, ttl: 0.25, max: 0.5 });
  game.effects.push({ type: 'bird', kind: 'lac', x: e1.x - 100, y: e1.y - 60, target: e1, ttl: 0.25, max: 0.5 });
  game.effects.push({ type: 'bird', x: e1.x + 120, y: e1.y - 80, target: e1, ttl: 0.25, max: 0.5 });
  game.effects.push({ type: 'horse', x: p1.x - 200, y: p1.y + 20, x2: p1.x, y2: p1.y, ttl: 0.25, max: 0.5 });
  game.effects.push({ type: 'skyride', d1: 0, d2: L, ttl: 0.6, max: 1.1 });
  game.effects.push({ type: 'skyride', d1: L, d2: L * 0.5, ttl: 0.4, max: 0.7, rock: true });
  ['den', 'chai', 'gom', 'dua'].forEach((kind, i) => game.effects.push({ type: 'lob', kind, x: 200 + i * 120, y: 520, x2: 260 + i * 120, y2: 560, ttl: 0.2, max: 0.4 }));
  game.effects.push({ type: 'notes', x: p2.x, y: p2.y + 120, r: 50, ttl: 0.5, max: 1 });
  game.effects.push({ type: 'raise', x: p2.x + 150, y: p2.y + 120, ttl: 0.4, max: 1 });
  for (const f of game.effects) f._vfx = true;
  // đạn theo hệ của tướng bắn
  ['kim', 'moc', 'thuy', 'tho', 'hoa'].forEach((el, i) => {
    const ht = Object.keys(HEROES).find((k) => HEROES[k].el === el);
    game.projectiles.push({ kind: 'fireball', x: 300 + i * 50, y: 470, tx: 600, ty: 470, sx: 200, sy: 470, angle: 0, speed: 1, st: {}, hero: { type: ht, x: 0, y: 0 }, target: e0, dmg: 0 });
  });
  return { n: game.enemies.length };
});

(async () => {
  const { browser, page, errors } = await open(844, 390);
  await enter(page, 0);
  await page.waitForFunction(() => ['dan-kim', 'no-thuy', 'vat-chai', 'ho-ba-vi', 'ngua-sat', 'cay-da', 'lac-tu', 'khien-giap', 'chim-lac', 'giong-bay'].every((n) => VFX.spr(n)), null, { timeout: 8000 });
  // các móc trả true (đã vẽ pixel)
  const r = await page.evaluate(() => {
    const c = document.createElement('canvas').getContext('2d');
    const P = VFX.px, out = {};
    out.zone = ['fire', 'rice', 'tree', 'rock'].filter((kind) => P.zone(c, { kind, x: 100, y: 100, r: 50, d1: 0, d2: 200, heal: { r: 30 }, ttl: 1, max: 2 }, 1)).length;
    out.lacTu = P.lacTu(c, { x: 100, y: 100 }, 1, 1);
    out.aura = ['drum', 'fire', undefined].filter((kind) => P.aura(c, { radius: 80, kind, color: '#C85AFF' }, 1)).length;
    out.efx = ['fire', 'frost', 'ghost', 'gold', 'steel', 'shadow', 'poison', 'water'].filter((k) => P.enemyFx(c, k, 40, 50, 1, 3, false)).length;
    out.elite = ['armored', 'regen', 'swift', 'shield'].filter((k) => P.elite(c, k, ELITE_MODS[k].color, 40, 1)).length;
    out.stun = P.heroStun(c, 100, 50, 1);
    out.bog = P.bog(c, 100, 100, 20, 8, 1);
    out.acc = P.accAura(c, { kind: 'drum', color: '#E8B83A' }, 0.28, 1, false);
    out.asc = P.ascAura(c, 2, 0.28, 1) && P.evoAura(c, 3, '#3478A6', 0.28, 1) && P.smokeAura(c, 1, '199,125,255', 1, { id: 1 }) && P.packFront(c, 'legendary', true, 1, 200) && P.ascGems(c, 1, 3, 'legendary', true) && P.sunHalo(c, 1);
    const kinds = ['kim', 'moc', 'thuy', 'tho'];
    out.dan = kinds.filter((el) => { const ht = Object.keys(HEROES).find((k) => HEROES[k].el === el); let used = null; const di = c.drawImage; c.drawImage = function (im) { used = im; }; VFX.drawProj(c, { kind: 'fireball', st: {}, hero: { type: ht } }, 1); c.drawImage = di; return used === VFX.spr('dan-' + el).fr[0] || VFX.spr('dan-' + el).fr.includes(used); }).length;
    return out;
  });
  ok(r.zone === 4, 'vùng đất pixel: vệt lửa, ruộng lúa, Cây Đa Thần, đá núi');
  ok(r.lacTu, 'đàn Lạc Tử pixel');
  ok(r.aura === 3, 'hào quang đốt pixel: trống trận, lửa ma, mưa gió');
  ok(r.efx === 8, 'hiệu ứng 8 loại quái biến thể bằng pixel');
  ok(r.elite === 4, 'vòng tinh anh pixel + dấu 4 loại');
  ok(r.stun && r.bog && r.acc, 'tướng choáng (chim Lạc), sa lầy, hào quang đồ bằng pixel');
  ok(r.asc, 'hào quang bậc tướng (Thần tinh, tiến hoá, khói Tím/Vàng, ngọc bay, vầng trống đồng) bằng pixel');
  ok(r.dan === 4, 'đạn chung của tướng Kim / Mộc / Thủy / Thổ đổi thành đạn theo hệ');
  // nổ lan theo hệ
  const no = await page.evaluate(() => { VFX.update(9); for (const el of ['kim', 'moc', 'thuy', 'tho']) VFX.onEffect({ type: 'impact', kind: 'fireball', el, splash: 60, x: 300, y: 200 }); return VFX.count(); });
  ok(no > 0, 'nổ lan theo hệ chạy không lỗi');
  for (const [w, h] of [[1920, 934], [844, 390], [667, 375]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(400);
    await stage(page);
    await page.evaluate(() => { game.heroes.filter(Boolean).forEach((hh, i) => { if (i % 2 === 0) hh.stunT = 99; }); });
    await page.waitForTimeout(150);
    const f = path.join(SHOTS, `hat-vfx-2-${w}x${h}.png`);
    await page.screenshot({ path: f });
    console.log('  ảnh: ' + path.relative(process.cwd(), f));
  }
  ok(!errors.length, 'không lỗi console' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log('hat-vfx-2: OK');
})().catch((e) => { console.error(e); process.exit(1); });
