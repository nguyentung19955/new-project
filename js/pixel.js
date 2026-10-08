// ------------------------------------------------------------
//  PIXEL ART (claude/pixel-nen-tang): sprite vẽ bằng lưới ký tự (tools/pixel/src/<nhóm>/<mã>.txt
//  → node tools/build-pixel.js → assets/pixel/<nhóm>/<mã>.png + js/pixel/<nhóm>.js). Quy chuẩn: docs/pixel/QUY-CHUAN.md
//  Bật pixel: mã CÓ sprite pixel thì vẽ pixel (tướng, quái/boss, chân dung, icon ngũ hành, ô nền bản đồ);
//  mã CHƯA có thì giữ hình cũ → chuyển dần từng lô. Phóng nearest-neighbor theo bội số nguyên điểm ảnh màn hình.
// ------------------------------------------------------------
// ==== CÔNG TẮC PIXEL (một dòng): false = tắt (hình cũ); true = bật toàn cục khi đã đủ hình ====
const PIXEL_BAT = false;
// bật TẠM để thử: ?pixel=1 trên URL · test: window.PIXEL_BAT_EP = true (page.addInitScript). ?pixel=0 ép tắt.
const PX_ON = (() => {
  try {
    if (/[?&]pixel=0\b/.test(location.search)) return false;
    // claude/tool-pixel: công tắc "Bật pixel" trong Cài đặt → Gói pixel (lưu trên máy, js/pixel-goi.js)
    let may = false; try { may = localStorage.getItem('ttv.pixel') === '1'; } catch (e) { /* chặn lưu */ }
    return PIXEL_BAT || !!window.PIXEL_BAT_EP || may || /[?&]pixel=1\b/.test(location.search);
  } catch (e) { return PIXEL_BAT; }
})();
const pixelOn = () => PX_ON;
const PX = { seen: new Set(), blits: 0, smooth: null };   // mã đã vẽ bằng pixel ("tuong/giong"…) — test đọc
const pxSmoothOff = () => PX.blits > 0 && PX.smooth === false;
if (PX_ON && typeof document !== 'undefined') {
  document.documentElement.classList.add('pixel');
  // font pixel có dấu tiếng Việt (VT323: số · Handjet: tiêu đề) — chỉ tải khi bật pixel
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Handjet:wght@500;700&family=VT323&display=swap&subset=vietnamese';
  document.head.appendChild(l);
}

function pxEntry(group, code) {
  if (!PX_ON || !code) return null;
  const m = window.PIXEL_MANIFEST, e = m && m[group + '/' + code];
  if (!e) return null;
  if (!e.key) e.key = group + '/' + code;
  return e;
}
// Giao Long Con đổi màu theo hành (e.el: hoa / tho → quai/giaolong-hoa|-tho; thuy hoặc chưa có → giaolong)
const pxEnemyEntry = (type, e) => (type === 'giaolong' && e && e.el && pxEntry('quai', 'giaolong-' + e.el)) || pxEntry('quai', type) || pxEntry('boss', type);
// đường dẫn ảnh (trong assets/) — dùng cho <img>
const pxPath = (e, cd) => `pixel/${e.key}${cd ? '-chan-dung' : ''}.png`;
const pxUrl = (group, code, cd) => { const e = pxEntry(group, code); return e && hasAsset(pxPath(e, cd)) ? assetSrc(pxPath(e, cd)) : ''; };

// khung thứ i của dải → canvas riêng (cỡ gốc), để vẽ / làm viền sáng; null khi ảnh chưa tải xong
const pxFrames = new Map();
function pxFrame(e, i) {
  const key = e.key + '|' + i;
  let c = pxFrames.get(key);
  if (c) return c;
  const sheet = asset(pxPath(e), true);
  if (!sheet) return null;
  c = document.createElement('canvas');
  c.width = e.w; c.height = e.h;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  x.drawImage(sheet, i * e.w, 0, e.w, e.h, 0, 0, e.w, e.h);
  c.naturalWidth = e.w; c.naturalHeight = e.h;
  pxFrames.set(key, c);
  return c;
}
// chỉ số khung trong dải: động tác + vị trí (p: 0..1 cho động tác một lần, hoặc thời gian t cho vòng lặp)
function pxIndex(e, anim, o) {
  const a = e.anims[anim] || e.anims.idle || e.anims.walk || e.anims.main || Object.values(e.anims)[0];
  let k;
  if (o.p !== undefined) k = Math.min(a.n - 1, Math.max(0, Math.floor(o.p * a.n)));
  else k = Math.floor((o.t || 0) * a.fps + (o.seed || 0)) % a.n;
  return a.start + ((k % a.n) + a.n) % a.n;
}
// vẽ khung với điểm neo (chân) tại (x, y) của hệ toạ độ hiện tại; unit = cỡ một điểm ảnh sprite (đơn vị logic).
// Bám lưới điểm ảnh màn hình: phóng theo số nguyên khi một điểm ảnh sprite ≥ 1 điểm ảnh màn hình.
function pxBlit(ctx, img, e, x, y, unit, flip, o = {}) {
  const m = ctx.getTransform();
  const k = Math.hypot(m.a, m.b) || 1;
  const dev = unit * k;
  const n = dev >= 1 ? Math.max(1, Math.round(dev)) : dev;
  const p = new DOMPoint(x, y).matrixTransform(m);
  const sx = (m.a < 0 ? -1 : 1) * (flip ? -1 : 1);
  ctx.save();
  ctx.setTransform(sx, 0, 0, 1, Math.round(p.x), Math.round(p.y));
  ctx.imageSmoothingEnabled = false;
  PX.blits = (PX.blits || 0) + 1; PX.smooth = ctx.imageSmoothingEnabled;
  const X = -(e.ax + 0.5) * n, Y = -(e.ay + 1) * n, W = e.w * n, H = e.h * n;
  if (o.glow) drawGlowOnly(ctx, img, X, Y, W, H, o.glow.color, o.glow.blur * k, o.glow.alpha);
  ctx.drawImage(img, X, Y, W, H);
  if (o.flash > 0) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha *= o.flash;
    ctx.drawImage(img, X, Y, W, H);
  }
  ctx.restore();
  return n / k;   // cỡ thật một điểm ảnh sprite (đơn vị logic)
}

// ---- TƯỚNG trên bản đồ (gọi từ đầu drawHeroSprite; trả null = không có pixel → vẽ hình cũ)
function pxDrawHero(ctx, h, x, y, o) {
  const e = pxEntry('tuong', h.type);
  if (!e) return null;
  const def = HEROES[h.type];
  const look = o.look || computeLook(h);
  const t = o.t || 0;
  let anim = 'idle', st = { t, seed: (h.id || 0) * 0.7 };
  if (o.fall !== undefined) { anim = 'die'; st = { p: 1 - o.fall / 0.6 }; }
  else if (o.hurt > 0 && e.anims.hurt) { anim = 'hurt'; st = { p: 1 - o.hurt / 0.2 }; }
  else if (o.castT > 0 && e.anims.cast) anim = 'cast';
  else if (o.swing > 0 && e.anims.attack) { anim = 'attack'; st = { p: 1 - o.swing }; }
  else if (o.win && e.anims.cast) anim = 'cast';
  const img = pxFrame(e, pxIndex(e, anim, st));
  if (!img) return null;   // chưa tải xong: hình cũ (chỉ trong khoảnh khắc đầu)
  const tier = look.tier || 0, asc = look.asc || 0;
  const s = (o.scale || 0.26) * TIER_SCALE[tier] * (1 + 0.04 * asc) * (look.bulk || 1);
  // cao cả khung ≈ ảnh vẽ tay cũ (236 đơn vị × s) để thanh máu / vòng tầm đánh giữ chỗ cũ
  const unit = 236 * s * 0.92 / e.h;
  let alpha = o.alpha ?? 1;
  if (o.fall !== undefined) alpha *= Math.max(0.25, o.fall / 0.6 + 0.25);
  let lift = 0;
  if (o.summon > 0) lift = -60 * (o.summon / 0.5) * (o.summon / 0.5) * s;
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (!o.noShadow) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y, 13 * DK * (s / 0.28), 4 * DK * (s / 0.28), 0, 0, Math.PI * 2);
    ctx.fill();
    if (look.accAura) { ctx.save(); ctx.translate(x, y); drawAccAura(ctx, look.accAura, s, t, true); ctx.restore(); }
  }
  // chiêu: viền sáng màu chiêu; ★★ trở lên: viền sáng màu hệ (như ảnh vẽ tay)
  const glowK = o.castT > 0 ? Math.min(1, o.castT / 0.25) : 0;
  const glow = glowK > 0 ? { color: o.castColor || '#FFE08A', blur: 10 * glowK * (o.castUlt ? 1.4 : 1), alpha: 0.8 * glowK }
    : tier >= 2 || asc > 0 ? { color: look.attrColor || '#FFE08A', blur: 5 + tier, alpha: 0.5 + Math.sin(t * 3) * 0.1 } : null;
  // trúng đòn: ngoài khung hurt (lùi + sáng da) thêm nháy trắng ngắn để không lẫn với khung đứng
  const u = pxBlit(ctx, img, e, x, y + lift, unit, (o.dir || 1) < 0, { glow, flash: o.hurt > 0 ? Math.min(1, o.hurt / 0.2) * 0.6 : 0 });
  ctx.restore();
  if (o.bog) drawBogWater(ctx, x, y, s, t);
  PX.seen.add(e.key);
  return { top: y + lift - (e.ay + 1 - e.bbox[1]) * u, s };
}

// ---- QUÁI / BOSS: kích thước (enemyBox) + vẽ (drawEnemy, sau khi đã dịch / lật / nhún)
// hOld: chiều cao hình cũ → khớp chiều cao đó (giữ tỉ lệ), không rộng quá 1,15× rộng cũ; 0 = theo rộng
function pxEnemyBox(e, w, k, hOld) {
  const pe = pxEnemyEntry(e.type, e);
  if (!pe) return null;
  const hp = pe.ay + 1 - pe.bbox[1];
  let unit = w / Math.max(8, pe.bbox[2]);
  if (hOld > 0) unit = Math.min(hOld / hp, unit * 1.15);
  const h = hp * unit;
  return { w: Math.max(8, pe.bbox[2]) * unit, h, ay: h, k, px: pe, unit };
}
function pxDrawEnemy(ctx, e, t, box) {
  const pe = box.px;
  let anim = 'walk', st = { t: t * (e.enraged ? 1.5 : 1), seed: (e.id || 0) * 0.37 };
  if (e.atkT > 0 && pe.anims.attack) { anim = 'attack'; st = { p: 1 - e.atkT / 0.45 }; }
  else if (e.hitT > 0 && pe.anims.hurt) { anim = 'hurt'; st = { p: 1 - e.hitT / 0.12 }; }
  else if (e.enraged && pe.anims.rage) anim = 'rage';
  const img = pxFrame(pe, pxIndex(pe, anim, st));
  if (!img) return false;
  const d = e.def || {};
  const fxc = d.fx && typeof ENEMY_FX !== 'undefined' && ENEMY_FX[d.fx];
  const u = pxBlit(ctx, img, pe, 0, 0, box.unit, false, { glow: fxc ? { color: fxc.glow, blur: fxc.blur * 0.6, alpha: 0.9 } : null, flash: e.hitT > 0 && !pe.anims.hurt ? e.hitT / 0.12 * 0.55 : 0 });
  PX.seen.add(pe.key);
  // hộp hình thật đã vẽ (điểm ảnh làm tròn theo màn hình), so với chân (chưa lật): cao trên chân, rộng, lệch tâm ngang, đáy dưới chân
  const [bx, by, bw, bh] = pe.bbox;
  return { h: (pe.ay + 1 - by) * u, w: bw * u, dx: (bx + bw / 2 - pe.ax - 0.5) * u, db: (by + bh - pe.ay - 1) * u };
}
// biểu tượng quái (bảng đợt, bách khoa)
function pxEnemyIcon(cv, type, pad) {
  const pe = pxEnemyEntry(type);
  const img = pe && pxFrame(pe, pxIndex(pe, 'walk', { p: 0 }));
  if (!img) return false;
  const c = cv.getContext('2d'), W = cv.width, H = cv.height;
  c.clearRect(0, 0, W, H);
  const [bx, by, bw, bh] = pe.bbox;
  let n = Math.min(W * (1 - pad * 2) / bw, H * (1 - pad * 2) / bh);
  if (n >= 1) n = Math.floor(n);
  c.imageSmoothingEnabled = false;
  c.drawImage(img, bx, by, bw, bh, Math.round((W - bw * n) / 2), Math.round((H - bh * n) / 2), bw * n, bh * n);
  PX.seen.add(pe.key);
  return true;
}
// chân dung tướng vào canvas: o.full → cả người (khung đứng đầu), không thì ảnh chân dung (<mã>-chan-dung.png)
function pxHeroPortrait(cv, h, o) {
  const e = pxEntry('tuong', h.type);
  if (!e) return false;
  const c = cv.getContext('2d'), W = cv.width, H = cv.height;
  let img, sx = 0, sy = 0, sw, sh;
  if (o.full) { img = pxFrame(e, pxIndex(e, 'idle', { p: 0 })); if (img) [sx, sy, sw, sh] = e.bbox; }
  else { img = asset(pxPath(e, true), true); if (img) { sw = img.naturalWidth; sh = img.naturalHeight; } }
  if (!img) return false;
  c.clearRect(0, 0, W, H);
  let n = Math.min(W / sw, H / sh) * (o.full ? 0.94 : 1);
  if (n >= 1) n = Math.floor(n);
  c.imageSmoothingEnabled = false;
  c.drawImage(img, sx, sy, sw, sh, Math.round((W - sw * n) / 2), Math.round(o.full ? H * 0.97 - sh * n : H - sh * n), sw * n, sh * n);
  PX.seen.add(e.key);
  return true;
}

// ---- Ô NỀN BẢN ĐỒ: cỏ phủ nền + đường đi (đất / nước) lát ô 16×16 phóng số nguyên
// trả về canvas đệm hoặc null (chưa có ô / chưa tải xong → nền cũ)
function pxTilePattern(x, code, dev) {
  const e = pxEntry('nen', code);
  const img = e && pxFrame(e, 0);
  if (!img) return null;
  const n = Math.max(1, Math.round(dev));
  const c = document.createElement('canvas');
  c.width = e.w * n; c.height = e.h * n;
  const cx = c.getContext('2d');
  cx.imageSmoothingEnabled = false;
  cx.drawImage(img, 0, 0, c.width, c.height);
  PX.seen.add(e.key);
  return x.createPattern(c, 'repeat');
}
// vẽ nền pixel lên x (đã setTransform theo bản đồ); k = điểm ảnh màn hình / đơn vị logic
function pxMapGround(x, m, kind, k) {
  if (!pxEntry('nen', 'co')) return false;
  const unit = 3.5;   // một điểm ảnh ô nền ≈ 3,5 đơn vị bản đồ (ô 16 px ≈ 56 đơn vị ≈ bề rộng đường đi)
  const grass = pxTilePattern(x, 'co', unit * k);
  const road = pxTilePattern(x, kind === 'nuoc' ? 'nuoc' : 'dat', unit * k);
  if (!grass || !road) return false;
  const inv = new DOMMatrix().scale(1 / k);
  grass.setTransform(inv); road.setTransform(inv);
  x.save();
  x.fillStyle = grass;
  x.fillRect(0, 0, CONFIG.W, CONFIG.H);
  if (typeof drawShapeUnder === 'function') {
    const water = m.ferry && (kind === 'nuoc' ? road : pxTilePattern(x, 'nuoc', unit * k));
    if (water && water !== road) water.setTransform(inv);
    drawShapeUnder(x, m, water);
  }   // núi giữa / sông của bến đò (claude/ban-do-moi)
  const L = (typeof PATH_LOOK !== 'undefined' && PATH_LOOK[kind]) || { w: 42, edge: 54 };
  x.lineCap = 'round'; x.lineJoin = 'round';
  // mọi nhánh (chianhanh, haicong…): viền của mọi nhánh trước rồi mới lòng đường → chỗ chia / nhập nhánh liền một mảng
  const lanes = CONFIG.paths && CONFIG.paths.length ? CONFIG.paths : [CONFIG.path];
  for (const pts of lanes) strokePath(x, pts, L.edge * DK, kind === 'nuoc' ? '#1A2448' : '#4A2E1A');
  x.strokeStyle = road;
  x.lineWidth = L.w * DK;
  x.beginPath();
  for (const pts of lanes) pts.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py)));
  x.stroke();
  // cầu ở chỗ đường tự cắt (caucheo) — dùng lại cầu của đường vẽ tay (js/maps.js)
  if (m.bridge && typeof drawBridge === 'function') for (const [cx, cy, a] of pathCrossings(lanes[0])) drawBridge(x, cx, cy, a, kind);
  if (typeof drawShapeOver === 'function') drawShapeOver(x, m, lanes[0]);
  x.restore();
  return true;
}
// tải sẵn mọi dải khung có trong manifest (vài KB mỗi dải) để khỏi nháy hình cũ lúc đầu
if (PX_ON && typeof Image !== 'undefined' && window.PIXEL_MANIFEST) for (const k of Object.keys(window.PIXEL_MANIFEST)) asset(`pixel/${k}.png`, true);
