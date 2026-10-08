'use strict';

// ============================================================
//  KHỞI ĐỘNG: canvas co giãn theo màn hình (khung thiết kế 932×430,
//  tọa độ logic 1280×590), chạm & kéo tướng, vòng lặp vẽ, hiệu ứng
// ============================================================

const canvas = $('#game');
const ctx = canvas.getContext('2d');
// v85: đổ bóng nhoè (shadowBlur) rất nặng trên điện thoại — đồ hoạ bậc Vừa / Tiết kiệm tắt hẳn trên canvas chính
// (quầng sáng tướng dùng ảnh dựng sẵn nên vẫn còn)
{
  const d = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'shadowBlur');
  Object.defineProperty(ctx, 'shadowBlur', {
    get() { return d.get.call(this); },
    set(v) { d.set.call(this, typeof GFX !== 'undefined' && GFX.level() >= 1 ? 0 : v); },
  });
}
const wrap = $('#wrap');
let ui;
const game = new Game((msg, color) => ui && ui.toast(msg, color));
ui = new UI(game);
game.speed = 1;
window.game = game;

let view = { scale: 1, dpr: 1 };
let PLAY_TOP = -1e9;
let mapImg = null;

// Diện tích thật sự dùng được: trừ phần đệm vùng an toàn của trang (tai thỏ, thanh home)
// để khung game không tràn ra ngoài
function viewportSize() {
  const vv = window.visualViewport;
  const de = document.documentElement;
  let w = (vv && vv.width) || window.innerWidth || de.clientWidth;
  let h = (vv && vv.height) || window.innerHeight || de.clientHeight;
  const px = (el, k) => parseFloat(getComputedStyle(el)[k]) || 0;
  for (const el of [de, document.body]) {
    w -= px(el, 'paddingLeft') + px(el, 'paddingRight') + px(el, 'borderLeftWidth') + px(el, 'borderRightWidth');
    h -= px(el, 'paddingTop') + px(el, 'paddingBottom') + px(el, 'borderTopWidth') + px(el, 'borderBottomWidth');
  }
  return [Math.max(0, w), Math.max(0, h)];
}

// Cỡ chữ & nút: 'auto' = màn hình thấp (điện thoại xoay ngang, cao < 520 px) phóng to 1,2 lần
let UIW = 932, UIH = 430, MAPX = 0, MAPY = 0;
const UIZ = 1;
let HZ = 1;
function uiZoom(vh) {
  const m = (ui && ui.save && ui.save.settings.uiSize) || 'auto';
  if (m === 'auto') return vh < 520 ? 1.2 : 1;
  return { s: 1, m: 1.2, l: 1.35 }[m] || 1;
}
// Đồ hoạ tự động: đo thời gian khung hình trên chính máy người chơi; giật (>24 ms trung bình
// trong 3 giây) thì hạ một bậc: giảm độ nét canvas, bớt hạt sáng, tắt hạt hào quang. Có thể chọn tay trong Cài đặt.
const GFX = {
  lv: 0, ema: 16, acc: 0, n: 0,
  mode() { return (ui && ui.save && ui.save.settings.gfx) || 'auto'; },
  level() { const m = this.mode(); return m === 'high' ? 0 : m === 'low' ? 2 : this.lv; },
  dprCap() { return [3, 2, 1.5][this.level()]; },          // v47: máy ×3 (iPhone) vẽ nét đủ ×3
  // v189 (L15): bậc thấp còn giới hạn tổng số điểm ảnh canvas (màn to 1920×934 vẽ ~1,8 triệu điểm mỗi khung — chậm gấp 2–3 lần 844×390)
  pxCap(w, h) { const m = [Infinity, 2.2e6, 1.1e6][this.level()]; return Math.sqrt(m / Math.max(1, w * h)); },
  apply() { if (typeof VFX !== 'undefined' && VFX.setMax) VFX.setMax([700, 380, 180][this.level()]); resize(); },
  sample(ms) {
    if (this.mode() !== 'auto' || this.lv >= 2 || document.hidden) return;
    this.ema += (Math.min(ms, 100) - this.ema) * 0.05;
    this.acc += ms;
    if (this.acc < 2000) return;
    this.acc = 0;
    if (this.ema > 24) { this.lv++; this.ema = 16; this.apply(); }
  },
};
// Tự xoay ngang (v42): cầm điện thoại dọc thì xoay cả khung game 90° cho vừa màn hình,
// người chơi chỉ việc cầm ngang — không cần bật xoay màn hình của máy.
let ROT = false;
function resize() {
  // v153: bàn phím điện thoại mở khi gõ chat (hoặc góp ý) làm khung nhìn co lại — giữ nguyên bố cục, gõ xong mới co giãn lại
  const ae = document.activeElement;
  if (ae && ae.id === 'chat-in') { if (!resize.hooked) { resize.hooked = true; ae.addEventListener('blur', () => { resize.hooked = false; setTimeout(resize, 150); }, { once: true }); } return; }
  let [vw, vh] = viewportSize();
  if (!vw || !vh) return requestAnimationFrame(resize);
  ROT = vh > vw;
  if (ROT) [vw, vh] = [vh, vw];
  $('#rotate').hidden = true;
  wrap.classList.toggle('rot', ROT);
  // Responsive (v42): khung game phủ KÍN màn hình. Bản đồ co vừa (được cắt bớt tối đa CROP đơn vị
  // nền trống trên + dưới khi màn hình dẹt), nằm giữa; phần thừa phủ ảnh bản đồ mờ tối.
  // Giao diện bám mép màn hình thật nên che ít bản đồ hơn.
  const CROP = 34;
  const scale = Math.min(vw / CONFIG.W, vh / (CONFIG.H - CROP));
  const w = Math.floor(vw), h = Math.floor(vh);
  const ox = (w / scale - CONFIG.W) / 2;                       // lệch bản đồ (đơn vị logic)
  const hv = h / scale;
  const oy = hv >= CONFIG.H ? (hv - CONFIG.H) / 2 : (hv - CONFIG.H) * 0.55;   // cắt trên nhiều hơn dưới một chút
  const dpr = Math.min(window.devicePixelRatio || 1, GFX.dprCap(), GFX.pxCap(w, h));
  wrap.style.width = w + 'px';
  wrap.style.height = h + 'px';
  // giao diện: cùng tỉ lệ với bản đồ (k), khung thiết kế rộng / cao theo màn hình (UIW × UIH)
  const k = scale * DK;
  UIW = w / k; UIH = h / k; MAPX = ox; MAPY = oy;
  $('#ui').style.width = UIW + 'px';
  $('#ui').style.height = UIH + 'px';
  wrap.style.setProperty('--k', k);
  HZ = uiZoom(vh);
  wrap.style.setProperty('--hz', HZ);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  view = { scale, dpr, ox, oy };
  // mép trên vùng chơi (đơn vị logic): đáy thanh trên — quái bay / boss cao không vẽ lọt dưới thanh
  PLAY_TOP = (($('#topbar') || {}).offsetHeight || 40) * HZ * DK - oy;
  ui.scale = scale;
  mapImg = mapImage(Math.round(CONFIG.W * scale * dpr), Math.round(CONFIG.H * scale * dpr), game.level);
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 200));
if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
resize();

// --- Chạm & kéo tướng: chạm nhanh = chọn, giữ và kéo = đổi ô
let drag = null;
const toLogical = (ev) => {
  const r = canvas.getBoundingClientRect();
  // khung đang xoay 90° (chiều kim đồng hồ): trục ngang của game chạy dọc màn hình
  if (ROT) return [(ev.clientY - r.top) / view.scale - view.ox, (r.right - ev.clientX) / view.scale - view.oy];
  return [(ev.clientX - r.left) / view.scale - view.ox, (ev.clientY - r.top) / view.scale - view.oy];
};

canvas.addEventListener('pointerdown', (ev) => {
  if (ui.uiHidden) return;   // v180: đang ẩn giao diện = chỉ xem, chạm bản đồ không chọn / kéo tướng
  // sua-trieu-hoi: đang kéo tướng bằng một ngón thì bỏ qua ngón khác — trước đây ngón 2 ghi đè `drag`, ngón 1 nhấc ra
  // không ai gỡ lớp dragging-hero → chợ tướng bị ẩn + không nhận chạm vĩnh viễn ("không triệu hồi được nữa")
  if (drag) return;
  if (!$('#trash').hidden) ui.hideTrash();     // còn sót thùng 🗑 / lớp dragging-hero từ lần kéo trước → gỡ
  const [x, y] = toLogical(ev);
  const slot = ui.slotAt(x, y);
  if (game.started && !game.over && !ui.raising && slot >= 0 && game.heroes[slot]) {
    drag = { from: slot, sx: x, sy: y, x, y, moved: false, id: ev.pointerId };
    try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* bỏ qua */ }
    return;
  }
  // v86: bấm vào boss → hiện thanh máu boss (góc dưới trái); bấm chỗ khác → ẩn
  if (game.started && ui.tapBoss(x, y)) return;
  ui.tapMap(x, y);
});

canvas.addEventListener('pointermove', (ev) => {
  if (!drag || ev.pointerId !== drag.id) return;
  [drag.x, drag.y] = toLogical(ev);
  if (!drag.moved && Math.hypot(drag.x - drag.sx, drag.y - drag.sy) > 12) { drag.moved = true; ui.showTrash(drag.from); }
  if (drag.moved) ui.hoverTrash(ev.clientX, ev.clientY);
});

canvas.addEventListener('pointerup', (ev) => {
  if (!drag || ev.pointerId !== drag.id) return;
  const d = drag;
  drag = null;
  if (!d.moved) return ui.tapMap(d.sx, d.sy);
  const to = ui.slotAt(d.x, d.y);
  // thả vào thùng 🗑: hủy tướng, hoàn vàng (v140: thả trúng một ô khác thì ưu tiên ô, không hủy nhầm)
  if (ui.hideTrash(ev.clientX, ev.clientY) && !(to >= 0 && to !== d.from)) return ui.trashHero(d.from);
  // thả lên tướng cùng loại cùng sao: ghép; đúng công thức: hợp thể; còn lại: đổi chỗ
  if (to >= 0 && to !== d.from) ui.dropOn(d.from, to);
});
canvas.addEventListener('pointercancel', (ev) => { if (drag && ev.pointerId !== drag.id) return; drag = null; ui.hideTrash(); });

// --- v143: CHỢ TƯỚNG — chạm thẻ = mua & đặt vào ô trống; kéo thẻ thả vào một ô = đặt đúng ô (lên tướng ★ cùng loại = ghép)
let cardDrag = null;
const cardGhost = document.createElement('div');
cardGhost.id = 'mk-ghost'; cardGhost.hidden = true;
document.body.appendChild(cardGhost);
$('#deck').addEventListener('pointerdown', (ev) => {
  const b = ev.target.closest('[data-mk]');
  if (!b || !game.started || game.over || cardDrag) return;
  const i = +b.dataset.mk, type = game.market && game.market.types[i];
  if (!type) return;
  ev.preventDefault();
  cardDrag = { i, type, id: ev.pointerId, sx: ev.clientX, sy: ev.clientY, moved: false, x: -9999, y: -9999 };
});
window.addEventListener('pointermove', (ev) => {
  const d = cardDrag;
  if (!d || ev.pointerId !== d.id) return;
  if (!d.moved && Math.hypot(ev.clientX - d.sx, ev.clientY - d.sy) > 10) {
    d.moved = true;
    cardGhost.innerHTML = `<img src="${heroImgUrl(d.type, 'head')}" alt="">`;
    cardGhost.style.setProperty('--c', ELEMENTS[HEROES[d.type].el].color);
    cardGhost.classList.toggle('rot', ROT);
    cardGhost.hidden = false;
  }
  if (!d.moved) return;
  [d.x, d.y] = toLogical(ev);
  cardGhost.style.left = ev.clientX + 'px';
  cardGhost.style.top = ev.clientY + 'px';
});
const endCardDrag = (ev, cancel) => {
  const d = cardDrag;
  if (!d || (ev && ev.pointerId !== d.id)) return;
  cardDrag = null;
  cardGhost.hidden = true;
  if (cancel) return;
  if (!d.moved) return ui.buyCard(d.i);
  const slot = ui.slotAt(d.x, d.y);
  if (slot >= 0) ui.buyCard(d.i, slot);
};
window.addEventListener('pointerup', (ev) => endCardDrag(ev, false));
window.addEventListener('pointercancel', (ev) => endCardDrag(ev, true));

const px = () => view.scale * view.dpr;

// Bản đồ ải vẽ bằng AI (nen_ai-1..4, PROMPT-FOOOCUS): phủ kín khung rồi vẽ lại dòng sông
// của game lên trên, để đường quái đi và ô đặt tướng luôn khớp dù ảnh lệch đôi chút.
const NEN_AI = [1, 2, 3, 3, 1, 2, 3, 4];     // ải 1..8 → ảnh nền
function drawAiMap(img, ctx = canvas.getContext('2d')) {
  const k = Math.max(CONFIG.W / img.naturalWidth, CONFIG.H / img.naturalHeight);
  const w = img.naturalWidth * k, h = img.naturalHeight * k;
  ctx.drawImage(img, (CONFIG.W - w) / 2, (CONFIG.H - h) / 2, w, h);
  ctx.save();
  ctx.globalAlpha = 0.55;
  strokePath(ctx, CONFIG.path, 70 * DK, '#6A5A3E');
  ctx.globalAlpha = 0.85;
  strokePath(ctx, CONFIG.path, 44 * DK, '#1F5670');
  ctx.globalAlpha = 0.5;
  strokePath(ctx, CONFIG.path, 20 * DK, '#3E89A8');
  ctx.restore();
}

function drawMateSpot(x, y, hero) {
  ctx.save();
  ctx.strokeStyle = 'rgba(110,200,240,0.95)';
  ctx.fillStyle = 'rgba(90,180,214,0.16)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 5]);
  ctx.beginPath(); ctx.ellipse(x, y, 15 * DK * (hero ? 1.45 : 1.2), 10 * DK * (hero ? 1.3 : 1.2), 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// v189 (L15): nền tĩnh (lề tối quanh bản đồ + bản đồ + thành) trước đây vẽ lại MỖI khung: một lần phóng ảnh phủ kín màn có
// độ mờ (lề) + một ảnh bản đồ cỡ màn hình. Nay vẽ sẵn một lần vào canvas đệm cùng cỡ, mỗi khung chỉ chép 1:1
// (đo Chromium không GPU 1920×934, ~110 quái: xem GAMEPLAY.md v189). Rung màn (shake) thì vẽ trực tiếp như cũ.
function backdropSrc() {
  const map = asset(`maps/map-0${game.level + 1}.png`);
  // v163: ảnh nền nen_ai-*.png là bản đồ sông Đà (chương Sơn Tinh – Thủy Tinh) — không dùng cho ải chương khác
  const nen = !map && NEN_AI[game.level] && asset(`nen_ai-${NEN_AI[game.level]}.png`);
  const bg = !nen && mapBg();
  const margin = view.ox > 0.5 || view.oy > 0.5;
  const back = margin && (typeof mapLayerCache !== 'undefined' && mapLayerCache.key.startsWith(MAP_ID + '|') ? mapLayerCache.c : ready(mapImg) && mapImg);
  // v156: nền vẽ tay + đường đi theo chủ đề + cổng dựng sẵn một lần vào canvas tĩnh; mỗi khung chỉ vẽ gợn nước / dấu chân
  const layer = bg && typeof mapLayer === 'function' && !map
    && mapLayer(MAP_ID, bg.img, mapImg, Math.round(CONFIG.W * px()), Math.round(CONFIG.H * px()));
  // thành Phong Châu vẽ tay (khi bản đồ chưa có ảnh riêng) — v163: chỉ ở chương Sơn Tinh – Thủy Tinh
  const castle = !map && chapterOf(game.level).id === 'sontinh' && (assetAny(['ban-do_phong-chau.png', 'tiles/castle-phong-chau.png']) || {}).img;
  return { nen, bg, margin, back, layer, castle };
}
function drawBackdrop(c, s, shake) {
  // phần màn hình ngoài bản đồ: ảnh bản đồ phóng phủ kín, tối đi (chỉ khi có lề)
  c.setTransform(1, 0, 0, 1, 0, 0);
  if (s.margin) {
    c.fillStyle = '#1E2A16';
    c.fillRect(0, 0, canvas.width, canvas.height);
    if (s.back) {
      const cs = Math.max(canvas.width / CONFIG.W, canvas.height / CONFIG.H);
      c.globalAlpha = 0.45;
      c.drawImage(s.back, (canvas.width - CONFIG.W * cs) / 2, (canvas.height - CONFIG.H * cs) / 2, CONFIG.W * cs, CONFIG.H * cs);
      c.globalAlpha = 1;
    }
  }
  c.setTransform(px(), 0, 0, px(), view.ox * px(), view.oy * px());
  if (shake) c.translate((Math.random() - 0.5) * game.shake, (Math.random() - 0.5) * game.shake);
  if (s.layer) c.drawImage(s.layer, 0, 0, CONFIG.W, CONFIG.H);
  else {
    if (s.bg) { if (s.bg.img) c.drawImage(s.bg.img, 0, 0, CONFIG.W, CONFIG.H); else { c.fillStyle = MAP_THEMES[s.bg.theme].ground; c.fillRect(0, 0, CONFIG.W, CONFIG.H); } }
    if (s.nen) drawAiMap(s.nen, c);
    else if (ready(mapImg)) c.drawImage(mapImg, 0, 0, CONFIG.W, CONFIG.H);
    else drawMapFallback(c);
  }
  if (s.castle) c.drawImage(s.castle, 838 * DK, 70 * DK, 110 * DK, 150 * DK);
}
const bgCache = { c: null, key: '', refs: [], builds: 0 };
function cachedBackdrop(s) {
  if (!s.layer && !s.nen && !ready(mapImg)) return null;          // ảnh nền chưa tải xong: vẽ trực tiếp
  const refs = [s.layer, s.bg && s.bg.img, s.nen, s.castle, s.back, s.layer ? null : mapImg];
  const key = `${canvas.width}x${canvas.height}|${view.ox}|${view.oy}|${px()}|${MAP_ID}|${game.level}`;
  if (bgCache.key !== key || refs.some((r, i) => r !== bgCache.refs[i])) {
    const c = bgCache.c || (bgCache.c = document.createElement('canvas'));
    c.width = canvas.width; c.height = canvas.height;
    drawBackdrop(c.getContext('2d'), s, false);
    bgCache.key = key; bgCache.refs = refs; bgCache.builds++;
  }
  return bgCache.c;
}

function render() {
  const t = performance.now() / 1000;
  const s = backdropSrc(), shake = game.shake > 0.2;
  const cached = !shake && cachedBackdrop(s);
  if (cached) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(cached, 0, 0);
    ctx.setTransform(px(), 0, 0, px(), view.ox * px(), view.oy * px());
  } else drawBackdrop(ctx, s, shake);
  if (s.layer) drawPathFx(ctx, MAP_ID, t);
  drawWaterLevel(ctx, game.water, t);
  drawZones(t);
  drawBlocks(t);

  const dragging = drag && drag.moved ? drag : null;
  const dropSlot = dragging ? ui.slotAt(dragging.x, dragging.y) : -1;
  const soon = game.started ? game.floodSoon() : -1;
  CONFIG.slots.forEach(([x, y], i) => {
    const h = game.heroes[i];
    const o = { tier: CONFIG.slotTier[i], flooded: game.isFlooded(i), raised: game.raised[i], hero: !!h,
      soon: game.started && game.floodNext(i) };
    // đang kéo: ô thả sáng, tướng ghép được (cùng loại cùng sao) / hợp thể được nhấp nháy vàng
    if (dragging) {
      const dh = game.heroes[dragging.from];
      const pair = h && dh && h !== dh && (game.canMerge(dh, h) === true || fusionFor(dh.type, h.type));
      o.mode = i === dropSlot ? 'target' : pair ? 'sel' : !h ? 'free' : '';
    }
    else if (cardDrag && cardDrag.moved) {
      // v143: đang kéo thẻ chợ tướng: ô trống sáng, tướng ★ cùng loại (ghép được) nhấp nháy, ô dưới tay là ô đích
      const tw = h && h.type === cardDrag.type && (h.tier || 0) === 1 && !h.from;
      o.mode = i === ui.slotAt(cardDrag.x, cardDrag.y) && (!h || tw) && !o.flooded ? 'target' : tw ? 'sel' : !h && !o.flooded ? 'free' : '';
    }
    else if (ui.raising) o.mode = game.canRaise(i) && (o.flooded || o.soon) ? 'free' : '';
    else if (i === ui.spot && !h) o.mode = 'target';
    else if (!h && ui.armed && !o.flooded) o.mode = 'free';
    else if (!h && i === ui.coachSlot) o.mode = 'hint';
    // v141: chơi nhóm — ô của đồng đội viền xanh nét đứt (cả khi có tướng đứng trên)
    const mate = COOP.on && game.co && !game.co.canAct(COOP.me, i);
    // v138: ô đã có tướng không vẽ vòng (kể cả khi chọn tướng — đã có vòng tầm đánh); chỉ hiện lúc đang kéo để ghép
    if (!(h && !o.mode)) drawSpot(ctx, x, y, o, t);
    if (mate) drawMateSpot(x, y, !!h);
  });

  // vòng tầm đánh của tướng đang chọn
  const sel = dragging ? null : game.heroes[ui.sel];
  if (sel) {
    ctx.strokeStyle = 'rgba(255,241,196,0.55)';
    ctx.fillStyle = 'rgba(255,241,196,0.06)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sel.x, sel.y, heroStats(sel).range, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // đường nối tương sinh với tướng đứng kề (màu hành sinh ra)
    const el = HEROES[sel.type].el;
    for (const o of game.adjacent(sel)) {
      const oel = HEROES[o.type].el;
      const giver = EL_SINH[oel] === el ? oel : EL_SINH[el] === oel ? el : null;
      if (!giver) continue;
      ctx.save();
      ctx.strokeStyle = ELEMENTS[giver].color;
      ctx.globalAlpha = 0.55 + 0.25 * Math.sin(t * 4);
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 5]);
      ctx.lineDashOffset = -t * 20;
      ctx.beginPath(); ctx.moveTo(sel.x, sel.y - 4); ctx.lineTo(o.x, o.y - 4); ctx.stroke();
      ctx.restore();
    }
  }

  // vẽ theo trục y để vật thể phía dưới đè lên phía trên
  if (VFX.frame) VFX.frame();   // hạn mức ảnh trạng thái mỗi khung
  const drawables = [
    ...game.enemies.map((e) => ({ y: e.y + (e.def.flying ? 40 : 0), draw: () => drawEnemy(ctx, e, t, { px: px() }) })),
    ...game.heroes.filter((h) => h && !(dragging && h.slot === dragging.from))
      .map((h) => ({ y: h.y, draw: () => drawHeroOnMap(h, t) })),
  ].sort((a, b) => a.y - b.y);
  drawables.forEach((d) => d.draw());
  drawGuard(t);
  drawEventFog(t);

  // hệ hạt: vệt đuôi + quầng sáng đạn, nổ khi trúng, hạt của chiêu
  const vdt = Math.min(0.05, Math.max(0, t - (render.lastT || t)));
  render.lastT = t;
  VFX.update(vdt);
  for (const p of game.projectiles) { if (p.kind !== 'evil' || Math.random() < 0.5) VFX.trail(p, vdt); VFX.projGlow(ctx, p); }
  for (const p of game.projectiles) drawProjectile(p, t);
  drawEffects(t);
  VFX.draw(ctx);
  if (dragging) drawDragGhost(dragging, dropSlot, t);
  else drawFuseMarks(t);
}

// vo-tan-su-kien: Sương Mù Lam Chướng — các mảng sương trôi chậm phủ bản đồ (đậm theo mức giảm tầm)
function drawEventFog(t) {
  const f = game.fogNow ? game.fogNow() : 0;
  if (!f) return;
  ctx.save();
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; ctx.shadowBlur = 0;
  ctx.fillStyle = `rgba(196,212,220,${0.1 + f * 0.6})`;        // lớp màn mỏng phủ cả bản đồ
  ctx.fillRect(-200, -200, CONFIG.W + 400, CONFIG.H + 400);
  const a = Math.min(0.75, 0.45 + f * 1.5);
  for (let i = 0; i < 12; i++) {
    const x = ((i * 157 + t * (10 + i * 3)) % (CONFIG.W + 500)) - 250, y = 60 + ((i * 97) % (CONFIG.H - 100)), r = 170 + (i % 3) * 60;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(222,232,236,${a})`); g.addColorStop(0.55, `rgba(214,226,230,${a * 0.45})`); g.addColorStop(1, 'rgba(214,226,230,0)');
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
}

// cỡ vẽ (px) của ảnh đạn vẽ tay theo loại
const PROJ_IMG = { fireball: 20, frostbolt: 20, arrow: 24, bolt: 22, orb: 18, feather: 20, petal: 16, melon: 18, rice: 18, evil: 20 };
function drawProjectile(p, t) {
  ctx.save();
  if (p.curve) {
    // Bộ Chim Lạc: tên bay vòng cung
    const all = Math.hypot(p.tx - p.sx, p.ty - p.sy) || 1;
    const q = 1 - Math.min(1, Math.hypot(p.tx - p.x, p.ty - p.y) / all);
    const lift = Math.min(60, all * 0.25);
    ctx.translate(p.x, p.y - Math.sin(q * Math.PI) * lift);
    ctx.rotate((p.angle || 0) - Math.cos(q * Math.PI) * 0.6 * Math.sign(p.tx - p.sx || 1));
  } else {
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle || 0);
  }
  // claude/vfx-kenney: đạn pixel (js/vfx.js, sprite tools/pixel/src/vfx/) — không có sprite thì ảnh vẽ tay / code như cũ
  if (VFX.drawProj && VFX.drawProj(ctx, p, t)) { ctx.restore(); return; }
  // v153: đạn vẽ tay assets/fx/dan_<loại>.png (docs/PROMPT-HIEU-UNG.txt phần D) — chưa có ảnh thì vẽ bằng code như cũ
  const pk = PROJ_IMG[p.kind] ? p.kind : 'fireball';
  // v175: chưa có ảnh riêng của loại đạn thì dùng đạn theo hệ của tướng bắn (assets/fx/dan-<hệ>.png, docs/PROMPT-CAN-GEN.txt)
  const pel = p.hero && HEROES[p.hero.type] && HEROES[p.hero.type].el;
  const pim = asset(`fx/dan_${pk}.png`, true) || (pel && p.kind !== 'evil' ? asset(`fx/dan-${pel}.png`, true) : null);
  if (pim) {
    const s = PROJ_IMG[pk];
    if (pk === 'melon' || pk === 'petal' || pk === 'orb' || pk === 'evil') ctx.rotate(t * (pk === 'melon' ? 10 : 6));
    ctx.drawImage(pim, -s / 2, -s / 2, s, s);
    ctx.restore();
    return;
  }
  switch (p.kind) {
    case 'evil':
      ctx.shadowColor = '#5AB4D6';
      ctx.shadowBlur = 10;
      circle(ctx, 0, 0, 5, '#2C6A86');
      circle(ctx, 1, -1, 2.5, '#BFE8F5');
      break;
    case 'frostbolt':
      ctx.shadowColor = '#9EDDF2';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#E8F8FF';
      ctx.beginPath();
      ctx.moveTo(8, 0); ctx.lineTo(-6, -4); ctx.lineTo(-3, 0); ctx.lineTo(-6, 4);
      ctx.fill();
      break;
    case 'arrow':
    case 'bolt':
      ctx.strokeStyle = p.st.poison ? '#7FC24A' : p.kind === 'bolt' ? '#F2D27A' : '#F2E6C8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-11, 0); ctx.lineTo(4, 0);
      ctx.stroke();
      ctx.fillStyle = '#C8C8C0';
      ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(3, -2.5); ctx.lineTo(3, 2.5); ctx.fill();
      break;
    case 'melon':
      ctx.rotate(t * 10);
      circle(ctx, 0, 0, 7, '#2E8A2E');
      ctx.strokeStyle = '#8AD05A';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(0, 0, 7, -1, 1); ctx.stroke();
      break;
    case 'feather':
      ctx.fillStyle = '#FFF4F8';
      ctx.shadowColor = '#FF9EC4';
      ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.ellipse(0, 0, 9, 3, 0, 0, Math.PI * 2); ctx.fill();
      break;
    case 'petal':
      ctx.rotate(t * 6);
      ctx.fillStyle = '#FFB8D8';
      for (let i = 0; i < 5; i++) {
        ctx.rotate(Math.PI * 0.4);
        ctx.beginPath(); ctx.ellipse(3, 0, 3.5, 2, 0, 0, Math.PI * 2); ctx.fill();
      }
      circle(ctx, 0, 0, 1.6, '#FFE08A');
      break;
    case 'rice':
      ctx.fillStyle = '#F2E6C8';
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(-i * 4, (i % 2) * 2 - 1, 2.2, 1.2, 0, 0, Math.PI * 2); ctx.fill(); }
      break;
    case 'orb':
      ctx.shadowColor = '#9EDDF2';
      ctx.shadowBlur = 12;
      circle(ctx, 0, 0, 5.5, '#5AB4D6');
      circle(ctx, 1, -1, 2.5, '#E8F8FF');
      break;
    default:   // cầu lửa
      ctx.shadowColor = '#ff6b00';
      ctx.shadowBlur = 12;
      circle(ctx, 0, 0, 6, p.st.slow ? '#9EDDF2' : '#F28A2E');
      circle(ctx, 1, -1, 3, '#fff3b0');
  }
  ctx.restore();
}

// Vùng đất có hiệu ứng: vệt lửa dọc sông, ruộng lúa, đá núi
function drawZones(t) {
  for (const z of game.zones) {
    const k = Math.min(1, z.ttl / 0.4, (z.max - z.ttl) / 0.25);
    if (typeof VFX !== 'undefined' && VFX.px && VFX.px.zone(ctx, z, t)) continue;   // claude/vfx-pixel-2: vùng đất pixel (js/vfx.js)
    ctx.save();
    ctx.globalAlpha = Math.max(0, k);
    if (z.kind === 'fire') {
      const pts = [];
      for (let d = z.d1; d <= z.d2; d += 12) { const p = PATH.at(d); pts.push([p.x, p.y]); }
      strokePath(ctx, pts, 30, 'rgba(242,138,46,0.35)');
      strokePath(ctx, pts, 12, 'rgba(255,224,138,0.5)');
      pts.forEach(([x, y], i) => {
        if (i % 2) return;
        const f = Math.sin(t * 18 + i) * 3;
        ctx.fillStyle = '#FF8A2E';
        ctx.beginPath();
        ctx.moveTo(x - 6, y); ctx.quadraticCurveTo(x - 4, y - 14 - f, x, y - 22 - f); ctx.quadraticCurveTo(x + 4, y - 12, x + 6, y);
        ctx.fill();
        circle(ctx, x, y - 6, 3, '#FFE08A');
      });
    } else if (z.kind === 'rice') {
      ctx.fillStyle = 'rgba(232,208,112,0.18)';
      ctx.beginPath(); ctx.ellipse(z.x, z.y, z.r, z.r * 0.45, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#B8A040';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 26; i++) {
        const a = i * 2.4, rr = z.r * (((i * 37) % 100) / 100);
        const x = z.x + Math.cos(a) * rr, y = z.y + Math.sin(a) * rr * 0.45;
        const sw = Math.sin(t * 3 + i) * 2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sw, y - 8, x + sw * 2, y - 14); ctx.stroke();
        circle(ctx, x + sw * 2, y - 15, 2, '#E8D070');
      }
    } else if (z.kind === 'tree') {
      // Cây Đa Thần: vòng lá chậm quái + vòng hồi máu
      ctx.fillStyle = 'rgba(95,208,106,0.16)';
      ctx.beginPath(); ctx.ellipse(z.x, z.y, z.r, z.r * 0.45, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(191,240,160,0.5)'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 5]); ctx.lineDashOffset = -t * 20;
      ctx.beginPath(); ctx.ellipse(z.x, z.y, z.heal.r, z.heal.r * 0.45, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      const grow = Math.min(1, (z.max - z.ttl) / 0.5);
      const timg = asset('trieu-hoi_cay-da-than.png');
      if (timg) {
        const hh = 110 * grow, ww = hh * timg.naturalWidth / timg.naturalHeight;
        ctx.drawImage(timg, z.x - ww / 2, z.y - hh + 8, ww, hh);
        ctx.restore();
        continue;
      }
      ctx.fillStyle = '#6A4420'; ctx.fillRect(z.x - 5, z.y - 46 * grow, 10, 46 * grow);
      for (const [dx, dy, r] of [[0, -58, 26], [-20, -48, 18], [20, -48, 18], [0, -74, 16]]) {
        circle(ctx, z.x + dx * grow, z.y + dy * grow, r * grow, '#3E9A4A');
        circle(ctx, z.x + dx * grow - 4, z.y + dy * grow - 4, r * grow * 0.5, '#5FD06A');
      }
      if (Math.random() < 0.15) game.effects.push({ type: 'spark', x: z.x + (Math.random() - 0.5) * z.r, y: z.y - 60 + Math.random() * 40, a: Math.random() * 6.28, color: '#BFF0A0', ttl: 0.5, max: 0.5 });
    } else if (z.kind === 'rock') {
      ctx.fillStyle = 'rgba(138,118,80,0.25)';
      ctx.beginPath(); ctx.ellipse(z.x, z.y, z.r, z.r * 0.45, 0, 0, Math.PI * 2); ctx.fill();
      const grow = Math.min(1, (z.max - z.ttl) / 0.3);
      for (let i = 0; i < 9; i++) {
        const a = i * 0.7, rr = z.r * (0.25 + ((i * 41) % 70) / 100);
        const x = z.x + Math.cos(a) * rr, y = z.y + Math.sin(a) * rr * 0.45;
        const hgt = (10 + (i % 3) * 6) * grow;
        ctx.fillStyle = i % 2 ? '#8A7650' : '#6A5A42';
        ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x - 2, y - hgt); ctx.lineTo(x + 5, y - hgt * 0.7); ctx.lineTo(x + 8, y); ctx.fill();
        ctx.strokeStyle = '#2A2116'; ctx.lineWidth = 1; ctx.stroke();
      }
    }
    ctx.restore();
  }
}

// Vật chặn đường: đàn Lạc Tử / Thành Một Đêm
function drawBlocks(t) {
  for (const b of game.blocks) {
    const p = PATH.at(b.dist);
    const k = Math.min(1, b.ttl / 0.4, (b.max - b.ttl) / 0.3);
    ctx.save();
    ctx.globalAlpha = Math.max(0, k);
    if (b.kind === 'wall') {
      for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
        const x = p.x - 30 + c * 12 + (r % 2 ? 6 : 0), y = p.y - 10 - r * 11;
        rrect(ctx, x, y, 12, 11, 1, (r + c) % 2 ? '#8A7046' : '#A08458');
        ctx.strokeStyle = '#2A1F12'; ctx.lineWidth = 1; ctx.strokeRect(x, y, 12, 11);
      }
    } else if (typeof VFX !== 'undefined' && VFX.px && VFX.px.lacTu(ctx, p, t, k)) {
      // claude/vfx-pixel-2: đàn Lạc Tử pixel (js/vfx.js)
    } else if (asset('trieu-hoi_lac-tu.png')) {
      // ảnh vẽ tay Lạc Tử: 7 đứa đứng thành 2 hàng
      const img = asset('trieu-hoi_lac-tu.png');
      const hh = 26, ww = hh * img.naturalWidth / img.naturalHeight;
      for (let i = 0; i < 7; i++) {
        const x = p.x - 24 + (i % 4) * 16 + (i > 3 ? 8 : 0), y = p.y + (i > 3 ? 6 : -6) + Math.sin(t * 6 + i) * 1.5;
        ctx.drawImage(img, x - ww / 2, y - hh, ww, hh);
      }
    } else {
      for (let i = 0; i < 7; i++) {
        const x = p.x - 24 + (i % 4) * 16 + (i > 3 ? 8 : 0), y = p.y + (i > 3 ? 6 : -6);
        const bob = Math.sin(t * 6 + i) * 1.5;
        rrect(ctx, x - 4, y - 14 + bob, 8, 11, 2, '#B8402A');
        circle(ctx, x, y - 18 + bob, 5, '#E8B98C');
        ctx.strokeStyle = '#F2E6C8'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(x - 3, y - 22 + bob); ctx.lineTo(x - 5, y - 28 + bob); ctx.moveTo(x + 3, y - 22 + bob); ctx.lineTo(x + 5, y - 28 + bob); ctx.stroke();
      }
    }
    ctx.restore();
  }
}

// Kim Quy Hộ Thành: mai rùa vàng che thành (cuối đường)
function drawGuard(t) {
  if (game.guardT <= 0) return;
  const [x, y] = [899 * DK, 160 * DK];
  ctx.save();
  ctx.globalAlpha = Math.min(1, game.guardT) * (0.6 + Math.sin(t * 6) * 0.15);
  ctx.strokeStyle = '#FFD66B';
  ctx.fillStyle = 'rgba(255,214,107,0.18)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(x, y, 80, 95, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 80, y + Math.sin(a) * 95); ctx.stroke();
  }
  ctx.restore();
}

// Tướng đang kéo: nổi lên trên ngón tay, kèm vòng tầm đánh tại ô sẽ thả
// Tướng thành phần cần nâng để hợp thể: CHỈ khi bấm thẻ thần ở dải gợi ý trên cùng (ui.fuseFocus, vài giây).
// Chọn một tướng trên sân thì không đánh dấu đối tác (tránh rối mắt).
let fuseMarkCache = { key: '', set: new Map() };
function fuseMarks() {
  const ff = ui.fuseFocus && performance.now() < ui.fuseFocus.until ? ui.fuseFocus : null;
  const key = ff ? 'f' + ff.i : '';
  if (fuseMarkCache.key === key && key !== '') return fuseMarkCache.set;
  const m = new Map();
  const add = (type, color) => {
    const best = game.heroes.filter((x) => x && x.type === type).sort((x, y) => (y.tier || 0) - (x.tier || 0) || y.level - x.level)[0];
    if (best && !m.has(best)) m.set(best, color);
  };
  if (ff) { const f = FUSION[ff.i]; const c = RARITY[HEROES[f.to].legend].color; add(f.a, c); add(f.b, c); }
  fuseMarkCache = { key, set: m };
  return m;
}
function drawFuseMarks(t) {
  for (const [h, c] of fuseMarks()) {
    if (h.dead) continue;
    const bob = Math.sin(t * 6) * 4;
    const y = h.y - 78 + bob;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(h.x, h.y - 30, 4, h.x, h.y - 30, 46);
    g.addColorStop(0, hexA(c, 'aa')); g.addColorStop(1, hexA(c, '00'));
    ctx.fillStyle = g;
    ctx.fillRect(h.x - 46, h.y - 76, 92, 92);
    ctx.restore();
    ctx.fillStyle = c;
    ctx.strokeStyle = '#1A0F0A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(h.x - 13, y - 14); ctx.lineTo(h.x + 13, y - 14); ctx.lineTo(h.x, y + 3); ctx.closePath();
    ctx.fill(); ctx.stroke();
  }
}

function drawDragGhost(d, dropSlot, t) {
  const h = game.heroes[d.from];
  if (!h) return;
  const st = heroStats(h);
  if (dropSlot >= 0) {
    const [sx, sy] = CONFIG.slots[dropSlot];
    ctx.strokeStyle = 'rgba(157,255,196,0.7)';
    ctx.fillStyle = 'rgba(157,255,196,0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sx, sy, st.range, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.globalAlpha = 0.85;
  drawHeroSprite(ctx, h, d.x, d.y + 10, { t, dir: h.dir, scale: 0.32, px: px() });
  ctx.globalAlpha = 1;
}

const HERO_TOP = new WeakMap();   // tướng → toạ độ y đỉnh hình vẽ khung trước
function drawHeroOnMap(h, t) {
  if (h.dead && !(h.fallT > 0)) {
    // đá đánh dấu + đếm ngược hồi sinh
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(h.x, h.y, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    rrect(ctx, h.x - 10, h.y - 24, 20, 24, 8, '#8C7A5A');
    ctx.strokeStyle = '#C8B48A'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(h.x, h.y - 13, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.font = '800 14px "Alegreya Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000';
    const txt = Math.ceil(h.respawnT) + 's';
    ctx.strokeText(txt, h.x, h.y - 30);
    ctx.fillStyle = '#FFB08A';
    ctx.fillText(txt, h.x, h.y - 30);
    return;
  }
  const st = heroStats(h);
  if (st.stench) drawDust(h, t);
  const va = visualAnim(h, t);
  if (va.castT > 0) drawCastGlow(h, t, va.castT);
  if (h.shield > 0) {
    ctx.strokeStyle = 'rgba(242,210,122,0.8)';
    ctx.fillStyle = 'rgba(242,210,122,0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(h.x, h.y - 30, 26, 38, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  }
  drawRankAura(h, t, false);
  drawHeroStates(h, st, t, false);
  const r = drawHeroSprite(ctx, h, h.x, h.y, {
    scale: (useAssets ? 0.285 : 0.33) * (HZ > 1 ? 1.12 : 1), t, dir: h.dir, swing: va.swing, castT: va.castT, castUlt: h.castUlt, hurt: h.hurtT, px: px(),
    bog: h.bogged, summon: h.summonT, fall: h.dead ? h.fallT : undefined,
    bounce: h.bounceT, evo: h.evoT, wingT: h.wingT, smooth: true, castColor: h.castColor, win: !!game.won, vector: !!(ui.save && ui.save.settings.vectorHeroes),
  });
  if (h.dead) return;
  drawRankAura(h, t, true);
  drawHeroStates(h, st, t, true);
  const top = r.top + 6;
  HERO_TOP.set(h, r.top);   // v189: đỉnh hình tướng — bong bóng thao tác (#more) đặt trên đỉnh thật (không ghi vào tướng: khỏi lưu / đồng bộ)
  if (h.invulnT > 0) {
    ctx.strokeStyle = '#FFE08A';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(h.x, h.y - 30, 24, 40, 0, 0, Math.PI * 2); ctx.stroke();
  }
  // thanh máu tướng + sao tiến hoá. Chế độ Gọn: chỉ hiện máu khi bị thương, không thanh năng lượng
  const detail = showDetail();
  if (detail || h.hp < st.hpMax * 0.99 || ui.sel === h.slot) {
    ctx.fillStyle = 'rgba(10,10,10,0.85)';
    ctx.fillRect(h.x - 17, top - 5, 34, detail ? 6 : 4);
    ctx.fillStyle = h.hp / st.hpMax > 0.35 ? '#3EBE3E' : '#D84A2A';
    ctx.fillRect(h.x - 16, top - 4, 32 * Math.max(0, h.hp / st.hpMax), 2.5);
    if (detail) { ctx.fillStyle = '#4A90E2'; ctx.fillRect(h.x - 16, top - 1.2, 32 * Math.max(0, h.mana / st.maxMana), 1.6); }
    const fr = asset('ui/thanh-mau-tuong.png', true);      // v163: khung thanh máu vẽ tay (nếu có)
    if (fr) ctx.drawImage(fr, h.x - 20, top - 7.5, 40, detail ? 11 : 9);
  }
  // sao mới hiện khi tướng hạ xuống (60% thời gian tiến hoá)
  const stars = (h.tier || 0) - (h.evoT > 0.48 ? 1 : 0);
  // tướng thần: sao Thần tinh màu cam đỏ, lớn hơn
  const starImg = h.from && asset('ui_than-tinh.png');
  // v81: sao to hơn, có viền tối để nổi trên mọi nền
  const sr = h.from ? 6.8 : 6, gap = sr * 2.05;
  for (let i = 0; i < stars; i++) {
    const sx = h.x - gap * ((stars - 1) / 2) + i * gap;
    if (starImg) ctx.drawImage(starImg, sx - sr * 1.3, top - 13 - sr * 1.3, sr * 2.6, sr * 2.6);
    else drawStar(ctx, sx, top - 13, sr, h.from ? '#FF7A3A' : '#FFD66B', '#2A1608', 1.8);
  }
  if (!detail) { drawHeroStun(h, top, t); return; }
  if (stars >= 3 || h.from) {
    // ★★★: tên tướng trên thanh máu chuyển chữ vàng
    ctx.font = '800 9px "Alegreya Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(13,11,8,0.9)';
    ctx.strokeText(HEROES[h.type].name, h.x, top - 18);
    ctx.fillStyle = '#FFD66B';
    ctx.fillText(HEROES[h.type].name, h.x, top - 18);
  }
  // cấp tướng
  ctx.font = '800 10px "Alegreya Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(13,11,8,0.85)';
  ctx.beginPath();
  ctx.arc(h.x + 22, h.y - 6, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = HEROES[h.type].legend ? '#F0A030' : '#8C6A2E';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = ELEMENTS[HEROES[h.type].el].color;
  ctx.fillText(h.level, h.x + 22, h.y - 2.5);
  // chấm hành
  circle(ctx, h.x + 28.5, h.y - 12, 3.2, '#0D0B08');
  circle(ctx, h.x + 28.5, h.y - 12, 2.4, ELEMENTS[HEROES[h.type].el].color);
  if (h.stunT > 0 && !(typeof VFX !== 'undefined' && VFX.px && VFX.px.heroStun(ctx, h.x, top - 6, t))) {
    for (let i = 0; i < 3; i++) {
      const a = t * 5 + (i * Math.PI * 2) / 3;
      drawStar(ctx, h.x + Math.cos(a) * 12, top - 16 + Math.sin(a) * 4, 3.5, '#F2D27A');
    }
  }
  if (h.bogged && Math.sin(t * 2 + h.id) > 0.6) {
    ctx.font = '800 9px "Alegreya Sans", sans-serif';
    ctx.fillStyle = '#9EDDF2';
    ctx.fillText('SA LẦY', h.x, h.y + 16);
  }
}

// Hiệu ứng của đồ trên người mặc. back = false: vẽ dưới chân (trước sprite),
// true: vẽ đè lên người (sau sprite)
const ORB_ITEMS = (h) => ACC_SLOTS.map((s) => h.equip[s]).filter((i) => i && ITEMS[i.id].look && ITEMS[i.id].look.aura
  && (ITEMS[i.id].fx || ITEMS[i.id].stunChance || ITEMS[i.id].hasteAura || SECRETS['r.' + i.id] || ITEMS[i.id].bossOnly));
// chế độ hiển thị: Gọn (mặc định) / Chi tiết (nút 👁 trên thanh trên)
function showDetail() { return !!(ui && ui.save && ui.save.settings.detail); }
// Hào quang tướng thần: Tím (sử thi) vòng ấn tím + hạt bay lên; Vàng (huyền thoại) to hơn,
// tia sáng xoay dưới chân, cột sáng, hạt vàng bay vòng quanh. Vẽ cộng màu, không cần ảnh.
const AURA = {
  epic: { c: '168,108,224', hi: '225,190,255', r: 38, n: 4, ray: 0, col: 0.16 },
  legendary: { c: '255,180,60', hi: '255,236,170', r: 44, n: 6, ray: 8, col: 0.22 },
};
function drawRankAura(h, t, front) {
  const a = AURA[HEROES[h.type].legend];
  if (!a) return;
  const x = h.x, y = h.y, ph = (h.slot || 0) * 1.7;
  const pulse = 0.8 + 0.2 * Math.sin(t * 2 + ph);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  if (!front) {
    // cột sáng mảnh, mờ, chỉ sau lưng (không phủ lên người)
    const cg = ctx.createLinearGradient(0, y, 0, y - 95);
    cg.addColorStop(0, `rgba(${a.c},${a.col * pulse})`);
    cg.addColorStop(1, `rgba(${a.c},0)`);
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.moveTo(x - a.r * 0.55, y); ctx.lineTo(x - a.r * 0.3, y - 95); ctx.lineTo(x + a.r * 0.3, y - 95); ctx.lineTo(x + a.r * 0.55, y);
    ctx.fill();
    // hạt sáng bay lên ở HAI BÊN người (sau lưng, không đè mặt); máy yếu thì bỏ
    const nMotes = GFX.level() >= 2 ? 0 : a.n;
    for (let i = 0; i < nMotes; i++) {
      const k = (t * 0.3 + i / a.n + ph) % 1;
      const side = i % 2 ? 1 : -1;
      const px2 = x + side * a.r * (0.6 + 0.15 * Math.sin(t * 1.5 + i));
      const py2 = y - 6 - k * 80;
      const al = Math.sin(k * Math.PI);
      ctx.fillStyle = `rgba(${a.c},${0.3 * al})`;
      ctx.beginPath(); ctx.arc(px2, py2, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(${a.hi},${0.85 * al})`;
      ctx.beginPath(); ctx.arc(px2, py2, 1.7, 0, Math.PI * 2); ctx.fill();
    }
  }
  // v50: bỏ vòng ấn dưới chân (tướng đứng trên ô không còn vòng tròn)
  ctx.restore();
}

// Hoạt ảnh tách khỏi tốc độ game (v45): ở x2 / x3 đòn đánh và tung chiêu vẫn chiếu tối thiểu
// ANIM_MIN giây thật (không còn giật / mất pha ra đòn); sát thương vẫn theo đồng hồ game.
const ANIM_MIN = { swing: 0.3, cast: 0.38 };
function visualAnim(h, t) {
  const sp = game.running ? game.speed || 1 : 1;
  const v = h._va || (h._va = { sw: 0, ct: 0, sw0: -9, swDur: 1, ct0: -9, ctTot: 0, ctRate: 1 });
  // đòn mới bắt đầu: game đặt swing = 1 (nhảy lên so với khung trước)
  if (h.swing > v.sw + 0.05) {
    v.sw0 = t;
    const gameDur = 1 / ((h.swingRate || 2.6) * sp);        // thời gian thật nếu chạy theo game
    v.swDur = Math.max(gameDur, Math.min(1 / (h.swingRate || 2.6), ANIM_MIN.swing));
  }
  v.sw = h.swing;
  if (h.castT > v.ct + 0.05) { v.ct0 = t; v.ctTot = h.castT; v.ctRate = Math.min(sp, Math.max(1, h.castT / ANIM_MIN.cast)); }
  v.ct = h.castT;
  if (sp <= 1) return { swing: h.swing, castT: h.castT };
  const swing = Math.min(1, Math.max(0, 1 - (t - v.sw0) / v.swDur));
  const castT = Math.min(v.ctTot, Math.max(0, v.ctTot - (t - v.ct0) * v.ctRate));
  return { swing, castT };
}

function drawHeroStun(h, top, t) {
  // bị câm (Chằn Tinh gầm): bong bóng tím có dấu gạch — không dùng được chiêu
  if (h.silenceT > 0 && !(h.stunT > 0)) {
    const y = top - 18 + Math.sin(t * 4) * 1.5;
    ctx.fillStyle = 'rgba(40,16,56,0.85)'; ctx.strokeStyle = '#C85AFF'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(h.x, y, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#F2D8FF'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(h.x - 4, y - 4); ctx.lineTo(h.x + 4, y + 4); ctx.moveTo(h.x + 4, y - 4); ctx.lineTo(h.x - 4, y + 4); ctx.stroke();
  }
  if (!(h.stunT > 0)) return;
  if (typeof VFX !== 'undefined' && VFX.px && VFX.px.heroStun(ctx, h.x, top - 6, t)) return;   // claude/vfx-pixel-2: chim Lạc + xoáy khí
  for (let i = 0; i < 3; i++) {
    const a = t * 5 + (i * Math.PI * 2) / 3;
    drawStar(ctx, h.x + Math.cos(a) * 12, top - 16 + Math.sin(a) * 4, 3.5, '#F2D27A');
  }
}
function drawHeroStates(h, st, t, over) {
  const x = h.x, y = h.y;
  ctx.save();
  if (!over) {
    // Trống Đồng gõ đầu đợt: vòng sóng âm vàng
    if (h.warT > 0) {
      for (let i = 0; i < 2; i++) {
        const q = (t * 1.6 + i / 2) % 1;
        ctx.strokeStyle = `rgba(242,210,122,${(1 - q) * 0.8})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(x, y, 16 + q * 30, 5 + q * 10, 0, 0, Math.PI * 2); ctx.stroke();
      }
    }
    // Bộ Sơn Tinh: bụi đá quanh chân làm chậm quái chạm vào
    if (st.touchSlow) {
      for (let i = 0; i < 6; i++) {
        const a = t * 1.2 + (i * Math.PI) / 3;
        circle(ctx, x + Math.cos(a) * 22, y + Math.sin(a) * 6, 1.8, 'rgba(200,180,138,0.8)');
      }
    }
    // Đồ hành Mộc "Rễ càng sâu": đứng yên lâu thì rễ cây mọc quanh chân
    if (st.hid['i.moc2'] && (h.still || 0) >= 10) {
      ctx.strokeStyle = 'rgba(95,184,74,0.85)';
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + 0.3;
        ctx.beginPath(); ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + Math.cos(a) * 10, y + Math.sin(a) * 3 + 3, x + Math.cos(a) * 20, y + Math.sin(a) * 6);
        ctx.stroke();
      }
    }
  } else {
    // Song Rìu Cuồng Nộ: lửa đỏ bùng theo số tầng
    if (h.rageT > 0 && h.rageN) {
      for (let i = 0; i < h.rageN; i++) {
        const a = t * 3 + (i / h.rageN) * Math.PI * 2;
        const fx = x + Math.cos(a) * 16, fy = y - 28 + Math.sin(a) * 6;
        const hgt = 7 + Math.sin(t * 12 + i) * 2;
        ctx.fillStyle = 'rgba(231,76,60,0.75)';
        ctx.beginPath(); ctx.moveTo(fx - 3, fy); ctx.quadraticCurveTo(fx - 2, fy - hgt, fx, fy - hgt * 1.3); ctx.quadraticCurveTo(fx + 2, fy - hgt, fx + 3, fy); ctx.fill();
      }
    }
    // Đất lành chim đậu: da đá bao quanh
    if (h.earthT > 0) {
      ctx.globalAlpha = Math.min(1, h.earthT) * 0.55;
      ctx.fillStyle = '#8C7A5A';
      ctx.strokeStyle = '#C8B48A';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(x, y - 28, 20, 32, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // Cá gặp nước: bong bóng khi đứng ô ngập
    if (h.flooded && st.hid['i.thuy1']) {
      for (let i = 0; i < 4; i++) {
        const q = (t * 0.8 + i / 4) % 1;
        ctx.strokeStyle = `rgba(158,221,242,${1 - q})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x - 12 + i * 8, y - q * 40, 2 + q * 2, 0, Math.PI * 2); ctx.stroke();
      }
    }
    // Lửa thử vàng: máu dưới 50% thì người bốc lửa
    if (st.hid['i.hoa2'] && h.hp < st.hpMax * 0.5) {
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) {
        const fx = x - 8 + i * 8, hgt = 10 + Math.sin(t * 14 + i * 2) * 3;
        ctx.fillStyle = 'rgba(224,69,44,0.55)';
        ctx.beginPath(); ctx.moveTo(fx - 3, y - 6); ctx.quadraticCurveTo(fx, y - 6 - hgt * 1.4, fx + 3, y - 6); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    // phụ kiện có hiệu ứng: quả cầu nhỏ màu riêng bay vòng quanh người
    const orbs = ORB_ITEMS(h);
    orbs.forEach((inst, i) => {
      const a = t * 1.8 + (i / orbs.length) * Math.PI * 2;
      const ox = x + Math.cos(a) * 19, oy = y - 30 + Math.sin(a) * 7;
      if (Math.sin(a) < -0.2) ctx.globalAlpha = 0.45;      // phía sau người: mờ đi
      const c = ITEMS[inst.id].look.aura;
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, 6);
      g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.4, c); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(ox, oy, 6, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    });
  }
  ctx.restore();
}

// Bụi Đá: bụi đá lượn quanh Lực Sĩ Núi
function drawDust(h, t) {
  for (let i = 0; i < 5; i++) {
    const a = t * 0.8 + i * 1.26;
    const r = 30 + Math.sin(t * 2 + i) * 8;
    ctx.fillStyle = `rgba(185,162,116,${0.16 + 0.05 * Math.sin(t * 3 + i)})`;
    ctx.beginPath();
    ctx.ellipse(h.x + Math.cos(a) * r, h.y - 8 + Math.sin(a) * r * 0.4, 16, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Tướng vừa tung chiêu: cột sáng + vòng hoa văn trống đồng dưới chân
function drawCastGlow(h, t, ct = h.castT) {
  const dur = h.castUlt ? 0.9 : 0.5;
  const k = Math.max(0, Math.min(1, ct / dur));
  const c = (h.castColor || '#ffffff').length === 4 ? '#ffffff' : h.castColor || '#ffffff';
  ctx.save();
  ctx.globalAlpha = k;
  const g = ctx.createLinearGradient(h.x, h.y, h.x, h.y - 90);
  g.addColorStop(0, hexA(c, '55'));
  g.addColorStop(1, hexA(c, '00'));
  ctx.fillStyle = g;
  ctx.fillRect(h.x - 18, h.y - 90, 36, 90);
  ctx.strokeStyle = c;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(h.x, h.y, 24 + (1 - k) * 12, 8 + (1 - k) * 4, 0, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = t * 2 + (i / 12) * Math.PI * 2;
    circle(ctx, h.x + Math.cos(a) * (24 + (1 - k) * 12), h.y + Math.sin(a) * (8 + (1 - k) * 4), 1.6, c);
  }
  for (let i = 0; i < 6; i++) {
    const a = t * 3 + (i * Math.PI) / 3;
    circle(ctx, h.x + Math.cos(a) * 20, h.y - 10 - (1 - k) * 50 - i * 4, 2.2, c);
  }
  ctx.restore();
}

function lightning(x1, y1, x2, y2, spread, width, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  const steps = 8;
  for (let i = 1; i <= steps; i++) {
    const k = i / steps;
    const j = i === steps ? 0 : (Math.random() - 0.5) * spread;
    ctx.lineTo(x1 + (x2 - x1) * k + j, y1 + (y2 - y1) * k);
  }
  ctx.stroke();
}

// vòng hoa văn trống đồng dưới chân (lên cấp, tiến hoá)
function drumRing(x, y, r, a, color) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.34, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(x, y, r * 0.72, r * 0.245, 0, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const g = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(g) * r * 0.74, y + Math.sin(g) * r * 0.25);
    ctx.lineTo(x + Math.cos(g) * r * 0.98, y + Math.sin(g) * r * 0.333);
    ctx.stroke();
  }
  drawStar(ctx, x, y, r * 0.18, color);
  ctx.restore();
}

function particles(x, y, n, color, spread, p, size = 2.5) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + i;
    const d = spread * p * (0.5 + ((i * 37) % 50) / 100);
    circle(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.6 - p * 20, size * (1 - p) + 0.6, color);
  }
}

// v153: ảnh vẽ tay cho các hiệu ứng phần D (docs/PROMPT-HIEU-UNG.txt). Trả về true nếu đã vẽ bằng ảnh.
// Dải khung assets/vfx/<loại>.png (cắt bằng tools/cat-fx.py dai); dải trắng xám (TINT) được tô theo màu hiệu ứng.
const FX_ART_TINT = new Set(['ring', 'warn', 'streak', 'beam', 'afterimage']);
function drawFxArt(f, p, t) {
  const strip = (name) => asset(`vfx/${name}.png`, true);
  // tia nối hai điểm: dải nằm ngang, kéo dài theo khoảng cách, xoay theo hướng
  const along = (img, x1, y1, x2, y2, thick) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    if (len < 2) return;
    ctx.translate(x1, y1); ctx.rotate(Math.atan2(y2 - y1, x2 - x1));
    drawVfx(ctx, img, p, len / 2, 0, len, thick);
  };
  const flipAt = (x, y, left) => { ctx.translate(x, y); if (left) ctx.scale(-1, 1); };
  switch (f.type) {
    // v175: hiệu ứng theo hệ của tướng (docs/PROMPT-CAN-GEN.txt phần HIỆU ỨNG) — chưa có ảnh thì như cũ
    case 'impact': {
      const img = f.el && strip(f.splash ? `no-${f.el}` : `trung-${f.el}`);
      if (!img) return false;
      ctx.globalAlpha = 1;
      const size = f.splash ? Math.max(70, f.splash * 2.2) : 52;
      drawVfx(ctx, img, p, f.x, f.y - size * (f.splash ? 0.25 : 0.1), size);
      return true;
    }
    case 'cast': {
      const img = f.el && strip(`vong-chieu-${f.el}`);
      if (!img) return false;
      ctx.globalAlpha = 1;
      const size = f.ult ? 120 : 84;
      drawVfx(ctx, img, p, f.x, f.y - 4, size, size * 0.5);
      return true;
    }
    case 'die': {
      const boss = f.etype && ENEMIES[f.etype] && ENEMIES[f.etype].boss;
      const img = strip(boss ? 'chet-boss' : 'chet-quai');
      if (!img) return false;
      ctx.globalAlpha = 1;
      const size = boss ? 130 : 64;
      drawVfx(ctx, img, p, f.x, f.y - size * 0.35, size);
      return true;
    }
    case 'vortex': case 'revive': case 'volley': case 'ring': case 'warn': case 'rain': case 'mark': case 'meteor': case 'sweep': {
      let img = strip(f.type);
      if (!img) return false;
      if (FX_ART_TINT.has(f.type)) img = tintSheet(img, f.color);
      ctx.globalAlpha = 1;
      if (f.type === 'rain' && f.delay > 0) return true;
      if (f.type === 'mark') { const e = f.target; if (e && !e.dead) drawVfx(ctx, img, p, e.x, e.y - 10, 56); return true; }
      if (f.type === 'sweep') { flipAt(f.x, f.y, f.dir < 0); drawVfx(ctx, img, p, 0, 0, Math.max(80, (f.r || 60) * 1.6)); return true; }
      const size = { vortex: 80, revive: 100, volley: 90, meteor: 170 }[f.type] || Math.max(60, (f.r || 30) * 2.2);
      const dy = { revive: -40, meteor: -size * 0.35, rain: -20 }[f.type] || 0;
      drawVfx(ctx, img, p, f.x, f.y + dy, size);
      return true;
    }
    case 'streak': case 'beam': case 'afterimage': {
      const img = strip(f.type === 'beam' ? 'streak' : f.type);
      if (!img || f.x2 === undefined) return false;
      ctx.globalAlpha = 1;
      along(tintSheet(img, f.color), f.x, f.y, f.x2, f.y2, f.type === 'afterimage' ? 36 : 26);
      return true;
    }
    case 'hook': {
      const img = strip('hook'), h = f.hero, e = f.target;
      if (!img || !h || !e) return false;
      ctx.globalAlpha = 1;
      along(img, h.x, h.y - 22, e.x, e.y - 8, 30);
      return true;
    }
    case 'lob': {
      // vật ném: đèn trời (Cô Thả Đèn Trời), chài (Ngư Phủ), bình gốm (Thợ Gốm), dưa hấu (Mai An Tiêm)
      const file = { den: 'den-troi', chai: 'chai', gom: 'binh-gom', dua: 'dua-hau' }[f.kind];
      const img = file && asset(`hieu-ung_${file}.png`, true);
      if (!img) return false;
      const x = f.x + (f.x2 - f.x) * p, y = f.y + (f.y2 - f.y) * p - Math.sin(p * Math.PI) * 60;
      const hh = { den: 26, chai: 30, gom: 22, dua: 20 }[f.kind], ww = hh * img.width / img.height;
      ctx.globalAlpha = 1; ctx.translate(x, y);
      if (f.kind !== 'den') ctx.rotate(p * (f.kind === 'chai' ? 4 : 9));
      ctx.drawImage(img, -ww / 2, -hh / 2, ww, hh);
      return true;
    }
    case 'horse': {
      const img = asset('trieu-hoi_ngua-sat.png', true);
      if (!img) return false;
      const x = f.x + (f.x2 - f.x) * p, y = f.y + (f.y2 - f.y) * p - Math.sin(p * Math.PI) * 30;
      const hh = 40, ww = hh * img.width / img.height;
      ctx.globalAlpha = 1; flipAt(x, y, f.x2 < f.x);
      ctx.drawImage(img, -ww / 2, -hh, ww, hh);
      return true;
    }
    default: return false;
  }
}

function drawEffects(t) {
  for (const f of game.effects) {
    if (!f._vfx) { f._vfx = true; VFX.onEffect(f); }
    if (f.delay > 0 && f.type !== 'rain') continue;
    const k = f.ttl / f.max; // 1 -> 0
    const p = 1 - k;         // 0 -> 1
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, k * 1.5));
    // claude/vfx-kenney: hiệu ứng pixel (js/vfx.js VFX.drawFx) trước; loại chưa có bản pixel → ảnh vẽ tay / code như cũ
    if (VFX.drawFx && VFX.drawFx(ctx, f, p, t)) { ctx.restore(); continue; }
    // v153: hiệu ứng trước chỉ vẽ bằng code (phần D docs/PROMPT-HIEU-UNG.txt) — có ảnh thì dùng ảnh
    if (drawFxArt(f, p, t)) { ctx.restore(); continue; }
    // hiệu ứng vẽ tay (dải khung hình trong assets/vfx/) nếu có
    const sheet = f.x !== undefined && vfxSheet(f.type);
    if (sheet) {
      const size = Math.max(60, (f.r || 30) * 2.2);
      ctx.globalAlpha = 1;
      drawVfx(ctx, sheet, p, f.x, f.y - size * 0.3, size);
      ctx.restore();
      continue;
    }
    switch (f.type) {
      case 'text': {
        // chế độ Gọn: bỏ số sát thương / vàng / chữ phụ, chỉ giữ đòn chí mạng
        if (!showDetail() && !/^\d[\d.,]*!$/.test(String(f.str))) break;
        const pop = p < 0.15 ? 0.7 + p * 2 : 1;
        ctx.font = typeof pixelOn === 'function' && pixelOn() ? `${Math.round((f.size || 15) * pop * 1.3)}px "VT323", "Alegreya Sans", sans-serif` : `800 ${Math.round((f.size || 15) * pop)}px "Alegreya Sans", sans-serif`;   // pixel: số sát thương / vàng bằng VT323 (có dấu)
        ctx.textAlign = 'center';
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#1A0C04';
        ctx.strokeText(f.str, f.x, f.y);
        ctx.fillStyle = f.color;
        ctx.fillText(f.str, f.x, f.y);
        break;
      }
      case 'banner': {
        // tên chiêu tối thượng hiện to giữa màn
        const sc = p < 0.15 ? 1.6 - p * 4 : 1;
        ctx.globalAlpha = p > 0.75 ? (1 - p) * 4 : 1;
        ctx.translate(CONFIG.W / 2, 170);
        ctx.scale(sc, sc);
        ctx.font = '800 44px "Alegreya SC", serif';
        ctx.textAlign = 'center';
        // v163: dải lụa vẽ tay sau chữ (ui/dai-thong-bao.png), chưa có ảnh thì chỉ có chữ như cũ
        const rib = asset('ui/dai-thong-bao.png', true);
        if (rib) { const rw = ctx.measureText(f.str).width + 150; ctx.drawImage(rib, -rw / 2, -50, rw, 76); }
        ctx.lineWidth = 7;
        ctx.strokeStyle = '#1A0C04';
        ctx.strokeText(f.str, 0, 0);
        ctx.fillStyle = f.color;
        ctx.fillText(f.str, 0, 0);
        break;
      }
      case 'ring':
        ctx.strokeStyle = f.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(f.x, f.y, Math.max(1, f.r * (1 - k * 0.6)), 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'cast':
      case 'none':
        break;
      case 'slash': {
        ctx.strokeStyle = '#FFF1C4';
        ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
          ctx.globalAlpha = Math.max(0, k - i * 0.25);
          ctx.lineWidth = 4 - i;
          ctx.beginPath();
          ctx.arc(f.x - f.dir * 8, f.y, 16 + i * 3, -1.4 + p * 1.2, 0.5 + p * 1.2);
          ctx.stroke();
        }
        break;
      }
      case 'spark': {
        const d = p * (f.d || 22);
        circle(ctx, f.x + Math.cos(f.a) * d, f.y + Math.sin(f.a) * d + p * p * 10, 2.5 * k + 0.8, f.color);
        break;
      }
      case 'dim':
        ctx.globalAlpha = 0.35 * k;
        ctx.fillStyle = '#0b0b1a';
        ctx.fillRect(-20, -20, CONFIG.W + 40, CONFIG.H + 40);
        break;
      case 'bolt': {
        ctx.globalAlpha = 1;
        ctx.shadowColor = '#C8A8FF';
        ctx.shadowBlur = 18;
        if (Math.random() < 0.8 || p < 0.3) {
          lightning(f.x + 6, f.y - 260, f.x, f.y - 6, 30, 5 * k + 1, '#F4EEFF');
          lightning(f.x + 6, f.y - 260, f.x, f.y - 6, 50, 2, '#C8A8FF');
          lightning(f.x, f.y - 120, f.x - 40, f.y - 60, 20, 1.5, '#C8A8FF');
        }
        ctx.globalAlpha = k;
        const g = ctx.createRadialGradient(f.x, f.y - 6, 2, f.x, f.y - 6, 50);
        g.addColorStop(0, 'rgba(240,235,255,0.95)');
        g.addColorStop(1, 'rgba(168,140,232,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(f.x, f.y - 6, 50, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'scorch':
        ctx.globalAlpha = 0.5 * k;
        ctx.fillStyle = '#1a120b';
        ctx.beginPath();
        ctx.ellipse(f.x, f.y + 2, f.r || 26, (f.r || 26) * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'bash': {
        ctx.strokeStyle = '#F2D27A';
        ctx.lineWidth = 4 * k + 1;
        ctx.beginPath();
        ctx.ellipse(f.x, f.y + 8, 12 + p * 34, 5 + p * 13, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#FFF1C4';
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          ctx.fillRect(f.x + Math.cos(a) * (10 + p * 26) - 1.5, f.y + Math.sin(a) * (6 + p * 12) - 1.5, 3, 3);
        }
        break;
      }
      case 'streak':
      case 'beam': {
        ctx.lineCap = 'round';
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 14;
        const hx = f.x + (f.x2 - f.x) * Math.min(1, p * 2.2);
        const hy = f.y + (f.y2 - f.y) * Math.min(1, p * 2.2);
        ctx.strokeStyle = f.color;
        ctx.lineWidth = (f.w ? f.w * 0.8 : 6) * k;
        ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(hx, hy); ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = f.w ? 4 : 2;
        ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(hx, hy); ctx.stroke();
        if (f.type === 'beam') {
          ctx.shadowBlur = 0;
          lightning(f.x, f.y, hx, hy, 24, 2, '#FFF1C4');
          break;
        }
        const a = Math.atan2(f.y2 - f.y, f.x2 - f.x);
        ctx.translate(hx, hy);
        ctx.rotate(a);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-6, -6); ctx.lineTo(-6, 6); ctx.fill();
        break;
      }
      case 'volley':
        ctx.strokeStyle = '#F2E6C8';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
          const ox = (i - 2.5) * 6, oy = -p * 160 - i * 6;
          ctx.beginPath(); ctx.moveTo(f.x + ox, f.y + oy); ctx.lineTo(f.x + ox, f.y + oy - 14); ctx.stroke();
        }
        break;
      case 'warn': {
        const pulse = 0.5 + Math.sin(t * 20) * 0.3;
        ctx.globalAlpha = 0.35 + pulse * 0.4;
        ctx.strokeStyle = f.color;
        ctx.fillStyle = f.color + '22';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, f.r, f.r * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, f.r * p, f.r * 0.45 * p, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      case 'rain': {
        if (f.delay > 0) break;
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#F2E6C8';
        ctx.lineWidth = 2;
        for (let i = 0; i < 22; i++) {
          const rr = f.r * (((i * 37) % 100) / 100);
          const a = i * 2.4;
          const tx = f.x + Math.cos(a) * rr, ty = f.y + Math.sin(a) * rr * 0.45;
          const fall = Math.min(1, p * 1.6 + (i % 4) * 0.08);
          const ay = ty - (1 - fall) * 160;
          if (fall < 1) {
            ctx.beginPath(); ctx.moveTo(tx + 3, ay - 16); ctx.lineTo(tx, ay); ctx.stroke();
          } else {
            ctx.globalAlpha = Math.max(0, k * 1.5);
            ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + 2, ty - 7); ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
        break;
      }
      case 'pillar': {
        const h = 110 * Math.min(1, p * 3);
        const g = ctx.createLinearGradient(f.x, f.y, f.x, f.y - h);
        g.addColorStop(0, 'rgba(255,240,180,0.95)');
        g.addColorStop(0.4, 'rgba(255,127,80,0.85)');
        g.addColorStop(1, 'rgba(192,57,43,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(f.x - 20, f.y);
        for (let i = 0; i <= 6; i++) ctx.lineTo(f.x - 20 + i * 2 + Math.sin(t * 25 + i) * 4, f.y - (h * i) / 6);
        for (let i = 6; i >= 0; i--) ctx.lineTo(f.x + 20 - i * 2 + Math.sin(t * 22 + i * 2) * 4, f.y - (h * i) / 6);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,127,80,0.35)';
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, 48, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 6; i++) circle(ctx, f.x + Math.sin(t * 9 + i * 2) * 18, f.y - ((t * 120 + i * 20) % h), 2.5, '#ffd36e');
        break;
      }
      case 'meteor': {
        ctx.globalAlpha = 1;
        const mx = f.x + k * 140, my = f.y - k * 320;
        for (let i = 6; i >= 1; i--) circle(ctx, mx + i * 9, my - i * 20, 12 - i * 1.4, `rgba(255,${120 + i * 15},40,${0.5 - i * 0.06})`);
        ctx.shadowColor = '#F28A2E';
        ctx.shadowBlur = 24;
        circle(ctx, mx, my, 15, '#8A3A1A');
        circle(ctx, mx - 3, my - 3, 8, '#FFB04A');
        break;
      }
      case 'explosion': {
        ctx.globalAlpha = k;
        const r = f.r * (0.3 + p * 0.8);
        const g = ctx.createRadialGradient(f.x, f.y - 10, 4, f.x, f.y - 10, r);
        g.addColorStop(0, 'rgba(255,250,210,1)');
        g.addColorStop(0.35, 'rgba(255,170,60,0.9)');
        g.addColorStop(0.75, 'rgba(192,57,43,0.6)');
        g.addColorStop(1, 'rgba(60,20,10,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(f.x, f.y - 10, r, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'hook': {
        const h = f.hero, e = f.target;
        if (!h || !e) break;
        ctx.globalAlpha = 1;
        const out = Math.min(1, p / 0.35);
        const ex = e.x, ey = e.y - 8, hx = h.x, hy = h.y - 22;
        const tx = hx + (ex - hx) * out, ty = hy + (ey - hy) * out;
        ctx.strokeStyle = '#3A2A12';
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo((hx + tx) / 2, (hy + ty) / 2 - 20, tx, ty); ctx.stroke();
        ctx.strokeStyle = f.color || '#6A8A2A';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo((hx + tx) / 2, (hy + ty) / 2 - 20, tx, ty); ctx.stroke();
        circle(ctx, tx, ty, 5, '#8BC34A');
        break;
      }
      case 'vortex': {
        ctx.strokeStyle = f.color;
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          const a0 = t * 8 + i * 2.1;
          ctx.arc(f.x, f.y, 10 + i * 8 * k, a0, a0 + 2.2);
          ctx.stroke();
        }
        break;
      }
      case 'rockfall': {
        ctx.globalAlpha = 1;
        const y = f.y - 120 * Math.max(0, 1 - p * 2.5);
        ctx.fillStyle = '#8A7650';
        ctx.strokeStyle = '#2A2116';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(f.x, y - 12, 22, 16, 0.2, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        if (p > 0.4) particles(f.x, f.y, 10, '#B9A274', 40, (p - 0.4) / 0.6, 3);
        break;
      }
      case 'afterimage': {
        for (let i = 0; i < 5; i++) {
          const q = i / 4;
          const x = f.x + (f.x2 - f.x) * q, y = f.y + (f.y2 - f.y) * q;
          ctx.globalAlpha = k * (0.25 + q * 0.5);
          ctx.fillStyle = f.color;
          ctx.beginPath();
          ctx.ellipse(x, y - 22, 7, 16, 0, 0, Math.PI * 2);
          ctx.fill();
          circle(ctx, x, y - 42, 6, f.color);
        }
        break;
      }
      case 'xslash': {
        const s = (f.big ? 26 : 18) * Math.min(1, p * 3);
        ctx.strokeStyle = f.color;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 10;
        ctx.lineCap = 'round';
        ctx.lineWidth = 4 * k + 1;
        ctx.beginPath();
        ctx.moveTo(f.x - s, f.y - s); ctx.lineTo(f.x + s, f.y + s);
        ctx.moveTo(f.x + s, f.y - s); ctx.lineTo(f.x - s, f.y + s);
        ctx.stroke();
        break;
      }
      case 'claw': {
        ctx.strokeStyle = f.color;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 10;
        ctx.lineCap = 'round';
        ctx.lineWidth = 3 * k + 1;
        const s = 24 * Math.min(1, p * 3);
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(f.x - s + i * 7, f.y - s); ctx.quadraticCurveTo(f.x + i * 7, f.y, f.x + s + i * 7, f.y + s);
          ctx.stroke();
        }
        break;
      }
      case 'mark': {
        const e = f.target;
        if (!e || e.dead) break;
        ctx.globalAlpha = 1;
        const r = 26 - p * 10;
        ctx.strokeStyle = '#ff4d4d';
        ctx.lineWidth = 2;
        ctx.translate(e.x, e.y - 10);
        ctx.rotate(p * 3);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2;
          ctx.moveTo(Math.cos(a) * (r - 6), Math.sin(a) * (r - 6));
          ctx.lineTo(Math.cos(a) * (r + 6), Math.sin(a) * (r + 6));
        }
        ctx.stroke();
        break;
      }
      case 'nova': {
        const r = f.r * Math.min(1, p * 1.8);
        ctx.fillStyle = 'rgba(189,235,250,0.18)';
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, r, r * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#E8FBFF';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#D6F6FF';
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          const sx = f.x + Math.cos(a) * r, sy = f.y + Math.sin(a) * r * 0.45;
          ctx.beginPath();
          ctx.moveTo(sx - 3, sy); ctx.lineTo(sx, sy - 14 * k - 4); ctx.lineTo(sx + 3, sy);
          ctx.fill();
        }
        break;
      }
      case 'snow': {
        ctx.globalAlpha = Math.min(1, k * 2);
        ctx.fillStyle = 'rgba(200,228,242,0.22)';
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 45; i++) {
          const a = i * 2.4 + t * 1.5;
          const rr = f.r * (((i * 37) % 100) / 100);
          const fy = ((t * 70 + i * 23) % 50) - 25;
          circle(ctx, f.x + Math.cos(a) * rr, f.y + Math.sin(a) * rr * 0.7 + fy, i % 5 ? 1.8 : 3, '#ffffff');
        }
        break;
      }
      case 'heal': {
        const c = f.color || '#3EDC4E';
        ctx.strokeStyle = c;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, f.r * p, f.r * 0.45 * p, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = c;
        ctx.fillRect(f.x - 2, f.y - 46 - p * 12, 4, 12);
        ctx.fillRect(f.x - 6, f.y - 42 - p * 12, 12, 4);
        break;
      }
      case 'revive': {
        // cột sáng vàng hồi sinh
        ctx.globalAlpha = k;
        const g = ctx.createLinearGradient(f.x, f.y, f.x, f.y - 140);
        g.addColorStop(0, 'rgba(255,214,107,0.9)');
        g.addColorStop(1, 'rgba(255,214,107,0)');
        ctx.fillStyle = g;
        ctx.fillRect(f.x - 16 - p * 6, f.y - 140, 32 + p * 12, 140);
        particles(f.x, f.y - 30, 10, '#FFF1C4', 40, p, 2.5);
        break;
      }
      case 'dive': {
        ctx.globalAlpha = 1;
        ctx.font = '800 13px "Alegreya Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#9EDDF2';
        ctx.fillText('~ ~ ~', f.x, f.y - 10 - Math.sin(t * 6) * 3);
        break;
      }
      case 'flash':
        ctx.globalAlpha = 0.35 * k;
        ctx.fillStyle = f.color || '#E25A3A';
        ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);
        break;
      case 'sweep': {
        // gậy tre ngà quét vòng cung
        ctx.strokeStyle = f.color;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 10 * k + 2;
        ctx.lineCap = 'round';
        const a0 = f.dir > 0 ? -1.6 : Math.PI + 1.6;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * 0.7, a0 - 1.2 + p * 2.4 * f.dir, a0 + p * 2.4 * f.dir, f.dir < 0);
        ctx.stroke();
        break;
      }
      case 'horse': {
        // ngựa sắt phi tới, phun lửa
        const x = f.x + (f.x2 - f.x) * p, y = f.y + (f.y2 - f.y) * p - Math.sin(p * Math.PI) * 30;
        ctx.globalAlpha = 1;
        for (let i = 0; i < 6; i++) circle(ctx, x - (f.x2 - f.x) * 0.05 * i, y + 4 - i, 6 - i * 0.6, `rgba(255,${140 + i * 15},46,${0.7 - i * 0.1})`);
        rrect(ctx, x - 14, y - 16, 28, 12, 5, '#6B7682');
        circle(ctx, x + 14, y - 18, 6, '#6B7682');
        break;
      }
      case 'skyride': {
        // Gióng bay dọc dòng sông
        // (rock: tảng đá Lạc Hầu lăn ngược dòng, d1 > d2)
        const d = f.d1 + (f.d2 - f.d1) * Math.min(1, p * 1.3);
        const pts = [];
        const step = f.d2 >= f.d1 ? 12 : -12;
        for (let dd = f.d1; step > 0 ? dd <= d : dd >= d; dd += step) { const q = PATH.at(dd); pts.push([q.x, q.y - (f.rock ? 6 : 30)]); }
        if (pts.length > 1) {
          strokePath(ctx, pts, 22, f.rock ? 'rgba(138,118,80,0.35)' : 'rgba(255,176,74,0.35)');
          strokePath(ctx, pts, 6, f.rock ? '#B9A274' : '#FFE0A0');
        }
        const q = PATH.at(d);
        ctx.globalAlpha = 1;
        if (f.rock) {
          ctx.save(); ctx.translate(q.x, q.y - 16); ctx.rotate(-t * 8);
          const rimg = asset('hieu-ung_da-lan.png');
          if (rimg) { ctx.drawImage(rimg, -22, -22, 44, 44); ctx.restore(); break; }
          ctx.fillStyle = '#8A7650'; ctx.strokeStyle = '#2A2116'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.ellipse(0, 0, 18, 15, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-8, -4); ctx.lineTo(6, 6); ctx.stroke();
          ctx.restore();
          break;
        }
        const gimg = asset('trieu-hoi_giong-bay.png', true);   // v153: ảnh vẽ tay nếu có
        if (gimg) {
          const hh = 48, ww = hh * gimg.width / gimg.height;
          ctx.translate(q.x, q.y - 34); if (f.d2 < f.d1) ctx.scale(-1, 1);
          ctx.drawImage(gimg, -ww / 2, -hh / 2, ww, hh);
          break;
        }
        circle(ctx, q.x, q.y - 34, 14, '#FFB04A');
        circle(ctx, q.x, q.y - 34, 7, '#FFF1C4');
        break;
      }
      case 'wave': {
        // sóng nước lan ra
        const r = f.r * (0.3 + p * 0.8);
        ctx.strokeStyle = f.color;
        ctx.lineWidth = 8 * k + 2;
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, r, r * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#E8F8FF';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, r * 0.85, r * 0.38, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      }
      case 'gust': {
        ctx.strokeStyle = f.color;
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 5; i++) {
          const r = f.r * (0.3 + p * 0.7) - i * 8;
          if (r <= 0) continue;
          ctx.beginPath();
          ctx.arc(f.x, f.y, r, -0.6 + i * 0.25, 0.4 + i * 0.25);
          ctx.stroke();
        }
        particles(f.x, f.y, 8, '#FFB8D8', f.r, p, 2.5);
        break;
      }
      case 'dome': {
        ctx.globalAlpha = k * 0.8;
        ctx.strokeStyle = f.color;
        ctx.fillStyle = f.color + '22';
        ctx.lineWidth = 2.5;
        const r = f.r * Math.min(1, p * 2);
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, r, r * 0.5, 0, Math.PI, 0);
        ctx.ellipse(f.x, f.y, r, r * 0.25, 0, 0, Math.PI);
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'cracks': {
        ctx.strokeStyle = '#3A2A12';
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + 0.3;
          ctx.beginPath();
          ctx.moveTo(f.x, f.y);
          ctx.lineTo(f.x + Math.cos(a) * f.r * 0.5, f.y + Math.sin(a) * f.r * 0.2 + 4);
          ctx.lineTo(f.x + Math.cos(a + 0.2) * f.r * 0.9, f.y + Math.sin(a + 0.2) * f.r * 0.4);
          ctx.stroke();
        }
        break;
      }
      case 'notes': {
        ctx.font = 'bold 18px serif';
        ctx.textAlign = 'center';
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2 + t;
          const r = 20 + p * f.r;
          ctx.fillStyle = i % 2 ? '#FFE08A' : '#F2E6C8';
          ctx.fillText(i % 3 ? '♪' : '♫', f.x + Math.cos(a) * r, f.y - 30 + Math.sin(a) * r * 0.45 - p * 20);
        }
        break;
      }
      case 'lob': {
        const x = f.x + (f.x2 - f.x) * p, y = f.y + (f.y2 - f.y) * p - Math.sin(p * Math.PI) * 60;
        ctx.globalAlpha = 1;
        circle(ctx, x, y, 8, '#2E8A2E');
        ctx.strokeStyle = '#8AD05A';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x, y, 8, t * 8, t * 8 + 1.5); ctx.stroke();
        break;
      }
      case 'splat':
        particles(f.x, f.y, 12, f.color, f.r, p, 4);
        ctx.fillStyle = 'rgba(224,72,72,0.3)';
        ctx.beginPath(); ctx.ellipse(f.x, f.y, f.r * 0.6, f.r * 0.25, 0, 0, Math.PI * 2); ctx.fill();
        break;
      case 'tiger': {
        // hổ Ba Vì vồ tới mục tiêu (ảnh trieu-hoi_ho-ba-vi.png nếu có)
        const e = f.target;
        if (!e) break;
        ctx.globalAlpha = 1;
        const q = Math.min(1, p * 1.15);
        const x = f.x + (e.x - f.x) * q, y = f.y + (e.y - f.y) * q - Math.sin(q * Math.PI) * 26;
        const img = asset('trieu-hoi_ho-ba-vi.png');
        ctx.save(); ctx.translate(x, y); if (e.x < f.x) ctx.scale(-1, 1);
        if (img) { const hh = 34, ww = hh * img.naturalWidth / img.naturalHeight; ctx.drawImage(img, -ww / 2, -hh, ww, hh); }
        else {
          ctx.fillStyle = '#F2A23A'; ctx.strokeStyle = '#2A1608'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.ellipse(0, -10, 16, 8, -0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.arc(14, -16, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = '#2A1608'; ctx.lineWidth = 2;
          for (const sx of [-8, -2, 4]) { ctx.beginPath(); ctx.moveTo(sx, -17); ctx.lineTo(sx + 2, -9); ctx.stroke(); }
        }
        ctx.restore();
        break;
      }
      case 'bird': {
        const e = f.target;
        if (!e) break;
        ctx.globalAlpha = 1;
        const q = Math.min(1, p * 1.2);
        const x = f.x + (e.x - f.x) * q, y = f.y + (e.y - 20 - f.y) * q - Math.sin(q * Math.PI) * 30;
        const flap = Math.sin(t * 30) * 4;
        const bimg = asset(f.kind === 'lac' ? 'trieu-hoi_chim-lac.png' : 'trieu-hoi_chim-than.png');
        if (bimg) {
          const bh = 22, bw = bh * bimg.naturalWidth / bimg.naturalHeight;
          ctx.save(); ctx.translate(x, y); if (e.x < f.x) ctx.scale(-1, 1);
          ctx.scale(1, 1 + flap * 0.03); ctx.drawImage(bimg, -bw / 2, -bh / 2, bw, bh); ctx.restore();
          break;
        }
        ctx.strokeStyle = '#F2E6C8';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x - 7, y - flap); ctx.quadraticCurveTo(x - 3, y - 3, x, y); ctx.quadraticCurveTo(x + 3, y - 3, x + 7, y - flap); ctx.stroke();
        break;
      }
      case 'petals':
        for (let i = 0; i < 16; i++) {
          const a = i * 2.4 + t;
          const r = f.r * (((i * 37) % 100) / 100);
          const x = f.x + Math.cos(a) * r, y = f.y + Math.sin(a) * r * 0.45 - (1 - p) * 60 + ((i * 13) % 20);
          ctx.fillStyle = i % 3 ? f.color : '#FFF4F8';
          ctx.beginPath(); ctx.ellipse(x, y, 4, 2.4, a, 0, Math.PI * 2); ctx.fill();
        }
        break;
      case 'raise': {
        // Mọc Núi: núi đất trồi lên dưới ô
        ctx.globalAlpha = 1;
        const hgt = 36 * Math.sin(Math.min(1, p * 1.5) * Math.PI / 2) * (p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1);
        ctx.fillStyle = '#8C7A5A';
        ctx.strokeStyle = '#2A2116';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(f.x - 26, f.y + 4); ctx.lineTo(f.x - 6, f.y - hgt); ctx.lineTo(f.x + 4, f.y - hgt * 0.7); ctx.lineTo(f.x + 26, f.y + 4);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        particles(f.x, f.y, 10, '#B9A274', 40, p, 3);
        break;
      }
      case 'floodrise':
        ctx.globalAlpha = 0.35 * Math.sin(p * Math.PI);
        ctx.fillStyle = '#2C6A86';
        ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);
        break;
      case 'summon': {
        // vòng vàng + bụi khi triệu hồi
        ctx.strokeStyle = '#FFD66B';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, 10 + p * 34, 4 + p * 12, 0, 0, Math.PI * 2);
        ctx.stroke();
        if (p > 0.6) particles(f.x, f.y, 10, '#C8B48A', 30, (p - 0.6) / 0.4, 3);
        break;
      }
      case 'levelup': {
        // vòng hoa văn trống đồng vàng lóe dưới chân + chữ "Cấp N" / "+N cấp"
        const x = f.hero ? f.hero.x : f.x, y = f.hero ? f.hero.y : f.y;
        drumRing(x, y, 16 + p * 22, Math.min(1, k * 1.6), '#F2D27A');
        const ty = y - 66 - p * 22;
        ctx.globalAlpha = Math.min(1, k * 2.2);
        ctx.font = '800 15px "Alegreya SC", serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = 'rgba(13,11,8,0.9)';
        const str = f.count > 1 ? `+${f.count} cấp` : `Cấp ${f.lv}`;
        ctx.strokeText(str, x, ty);
        ctx.fillStyle = '#FFD66B';
        ctx.fillText(str, x, ty);
        break;
      }
      case 'evolve': {
        // nhấc lên, cột sáng màu đồng, nổ hạt hoa văn khi hạ xuống kích thước mới
        const x = f.hero ? f.hero.x : f.x, y = f.hero ? f.hero.y : f.y;
        const col = Math.sin(Math.PI * Math.min(1, p / 0.85));
        const w = 30 * (0.6 + 0.4 * col);
        const gr = ctx.createLinearGradient(0, y - 150, 0, y + 6);
        gr.addColorStop(0, 'rgba(232,168,96,0)');
        gr.addColorStop(0.5, 'rgba(232,168,96,0.45)');
        gr.addColorStop(1, 'rgba(255,226,160,0.8)');
        ctx.globalAlpha = col;
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.moveTo(x - w * 0.35, y - 150); ctx.lineTo(x + w * 0.35, y - 150);
        ctx.lineTo(x + w, y + 4); ctx.lineTo(x - w, y + 4); ctx.closePath();
        ctx.fill();
        drumRing(x, y, 22 + col * 8, col, '#E8A860');
        if (p > 0.55) {
          // hạt hoa văn: hình thoi & vòng tròn chấm kiểu trống đồng
          const q = (p - 0.55) / 0.45;
          ctx.globalAlpha = 1 - q;
          for (let i = 0; i < 14; i++) {
            const a = (i / 14) * Math.PI * 2 + i;
            const r = 12 + q * (40 + (i % 3) * 10);
            const px2 = x + Math.cos(a) * r, py2 = y - 34 + Math.sin(a) * r * 0.7;
            ctx.fillStyle = i % 2 ? '#FFD66B' : f.color || '#E8A860';
            ctx.save(); ctx.translate(px2, py2); ctx.rotate(a);
            if (i % 2) { ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(3, 0); ctx.lineTo(0, 4); ctx.lineTo(-3, 0); ctx.fill(); }
            else { ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.stroke(); circle(ctx, 0, 0, 1, ctx.fillStyle); }
            ctx.restore();
          }
          drumRing(x, y, 20 + q * 40, 1 - q, '#FFD66B');
        }
        break;
      }
      case 'equipflash':
      case 'promote': {
        // mặc đồ: lóe màu độ hiếm 1 lần; thăng phẩm: nhấp sáng 2 lần
        const flash = f.type === 'promote' ? Math.abs(Math.sin(p * Math.PI * 2)) : Math.sin(p * Math.PI);
        const r = f.type === 'promote' ? 20 : 14 + p * 10;
        const gr = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
        gr.addColorStop(0, 'rgba(255,255,255,0.95)');
        gr.addColorStop(0.35, f.color);
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = flash;
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = gr;
        ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'proc': {
        // đồ kích hoạt: vòng sáng nở ra + tia
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = k;
        ctx.strokeStyle = f.color;
        ctx.lineWidth = 2.5 * k + 0.5;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (0.4 + p * 0.8), 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + f.r;
          const r0 = f.r * (0.3 + p * 0.6), r1 = r0 + 6 * k;
          ctx.beginPath(); ctx.moveTo(f.x + Math.cos(a) * r0, f.y + Math.sin(a) * r0); ctx.lineTo(f.x + Math.cos(a) * r1, f.y + Math.sin(a) * r1); ctx.stroke();
        }
        break;
      }
      case 'coin': {
        // vàng thêm khi hạ quái (Bồ Lúa Thần, dòng phụ vàng)
        const yy = f.y - 18 * Math.sin(Math.min(1, p * 1.5) * Math.PI * 0.5);
        ctx.globalAlpha = k;
        // dùng ảnh có sẵn: đồng xu lỗ vuông (ui-tai-nguyen-1); chưa có / chưa tải xong thì vẽ tròn như cũ
        const ci = asset('ui/ui-tai-nguyen-1.png', true);
        if (ci) {
          // cỡ theo màn: ~16 px CSS trên điện thoại (không nhỏ hơn 12 đơn vị bản đồ), chỉ mờ dần ở 40% cuối
          const cs = Math.max(12, 16 / view.scale);
          ctx.globalAlpha = Math.min(1, k / 0.4);
          ctx.drawImage(ci, f.x - cs / 2, yy - cs / 2, cs, cs);
        }
        else {
          circle(ctx, f.x, yy, 4.5, '#B8852A');
          circle(ctx, f.x, yy, 3.5, '#F2D27A');
          ctx.fillStyle = '#7A5418'; ctx.fillRect(f.x - 1, yy - 1, 2, 2);
        }
        break;
      }
      case 'corpse': {
        // xác quái ngã nghiêng, co lại, chìm và mờ dần
        const e = f.enemy;
        const q = 1 - k;                      // 0 → 1
        const ease = q * q * (3 - 2 * q);
        ctx.globalAlpha = Math.max(0, 1 - ease * 1.05);
        ctx.translate(f.x, f.y + ease * 10);
        ctx.rotate((f.dir || 1) * 0.9 * ease);
        ctx.scale(1 - 0.35 * ease, 1 - 0.5 * ease);
        drawEnemy(ctx, { ...e, x: 0, y: 0, hitT: q < 0.25 ? 0.12 * (1 - q / 0.25) : 0 }, t, { icon: true, px: px() });
        break;
      }
      case 'die':
        particles(f.x, f.y - 10, 8, '#BFE8F5', 26, p, 3);
        break;
      case 'drop': {
        ctx.globalAlpha = k;
        const y = f.y - 20 - Math.sin(Math.min(1, p * 2) * Math.PI) * 24;
        // dùng ảnh có sẵn: rương đồng (ui-menu-1-3), quầng màu theo độ hiếm; chưa có ảnh thì hộp + sao như cũ
        const bi = asset('ui/ui-menu-1-3.png', true);
        if (bi) {
          // ~30 px CSS trên điện thoại (không nhỏ hơn 26 đơn vị bản đồ), quầng tròn đậm màu độ hiếm phía sau, chỉ mờ ở 30% cuối
          const bs = Math.max(26, 30 / view.scale), a = Math.min(1, k / 0.3);
          const gr = ctx.createRadialGradient(f.x, y, bs * 0.15, f.x, y, bs * 0.85);
          gr.addColorStop(0, f.color); gr.addColorStop(0.55, f.color + 'AA'); gr.addColorStop(1, f.color + '00');
          ctx.globalAlpha = a * (0.75 + 0.25 * Math.sin(t * 8));
          ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(f.x, y, bs * 0.85, 0, Math.PI * 2); ctx.fill();
          // viền vòng đậm màu độ hiếm (quầng vàng huyền thoại dễ chìm trên nền cát)
          ctx.strokeStyle = f.color; ctx.lineWidth = Math.max(2, 2.5 / view.scale);
          ctx.beginPath(); ctx.arc(f.x, y, bs * 0.62, 0, Math.PI * 2); ctx.stroke();
          ctx.globalAlpha = a;
          ctx.shadowColor = f.color; ctx.shadowBlur = 14 * px();
          ctx.drawImage(bi, f.x - bs / 2, y - bs / 2, bs, bs);
          break;
        }
        ctx.strokeStyle = f.color;
        ctx.fillStyle = '#2A1F12';
        ctx.lineWidth = 2;
        ctx.fillRect(f.x - 8, y - 8, 16, 16);
        ctx.strokeRect(f.x - 8, y - 8, 16, 16);
        drawStar(ctx, f.x, y, 5, f.color);
        break;
      }
    }
    ctx.restore();
  }
}

let last = performance.now();
function loop(now) {
  const raw = Math.max(0, (now - last) / 1000);
  const dt = Math.min(0.05, raw);
  if (game.started && game.running) GFX.sample(now - last);
  last = now;
  // v141: chơi nhóm — mô phỏng bước cố định theo lệnh đồng bộ (js/coop.js), không theo khung hình
  if (COOP.on) COOP.frame(raw);
  // game vẫn chạy khi mở các bảng; chỉ dừng khi bấm nút dừng
  else if (game.started && game.running) {
    for (let i = 0; i < game.speed; i++) game.update(dt);
  } else if (game.started) game.updateIdle(dt);
  mapImg = mapImage(Math.round(CONFIG.W * view.scale * view.dpr), Math.round(CONFIG.H * view.scale * view.dpr), game.level);
  render();
  ui.tick(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
