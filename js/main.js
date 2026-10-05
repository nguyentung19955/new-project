'use strict';

// ============================================================
//  KHỞI ĐỘNG: canvas co giãn theo màn hình điện thoại, vòng lặp vẽ
// ============================================================

const canvas = $('#game');
const ctx = canvas.getContext('2d');
const wrap = $('#wrap');
let ui;
const game = new Game((msg, color) => ui && ui.toast(msg, color));
ui = new UI(game);
game.speed = 1;
game.paused = false;
window.game = game;

let view = { scale: 1, dpr: 1 };
let mapCanvas = null;

// Đọc kích thước màn hình; trong khung nhúng đôi khi lúc đầu trả về 0 -> thử lại
function viewportSize() {
  const vv = window.visualViewport;
  const de = document.documentElement;
  const w = (vv && vv.width) || window.innerWidth || de.clientWidth;
  const h = (vv && vv.height) || window.innerHeight || de.clientHeight;
  return [w, h];
}

function resize() {
  const [vw, vh] = viewportSize();
  if (!vw || !vh) return requestAnimationFrame(resize);
  const scale = Math.min(vw / CONFIG.W, vh / CONFIG.H);
  const w = Math.floor(CONFIG.W * scale), h = Math.floor(CONFIG.H * scale);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  wrap.style.width = w + 'px';
  wrap.style.height = h + 'px';
  wrap.style.setProperty('--u', scale);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  view = { scale, dpr };
  ui.scale = scale;
  mapCanvas = buildMapCanvas(Math.max(1, scale * dpr));
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 200));
if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
resize();

// --- Chạm & kéo tướng: chạm nhanh = mở bảng, giữ và kéo = đổi bệ
let drag = null;   // { from, sx, sy, x, y, moved, id }
const toLogical = (ev) => {
  const r = canvas.getBoundingClientRect();
  return [(ev.clientX - r.left) / view.scale, (ev.clientY - r.top) / view.scale];
};

canvas.addEventListener('pointerdown', (ev) => {
  const [x, y] = toLogical(ev);
  const slot = ui.slotAt(x, y);
  if (game.started && !game.over && slot >= 0 && game.heroes[slot]) {
    drag = { from: slot, sx: x, sy: y, x, y, moved: false, id: ev.pointerId };
    try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* bỏ qua */ }
    return;
  }
  ui.tapMap(x, y);
});

canvas.addEventListener('pointermove', (ev) => {
  if (!drag || ev.pointerId !== drag.id) return;
  [drag.x, drag.y] = toLogical(ev);
  if (!drag.moved && Math.hypot(drag.x - drag.sx, drag.y - drag.sy) > 12) {
    drag.moved = true;
    ui.close();
  }
});

canvas.addEventListener('pointerup', (ev) => {
  if (!drag || ev.pointerId !== drag.id) return;
  const d = drag;
  drag = null;
  if (!d.moved) return ui.tapMap(d.sx, d.sy);
  const to = ui.slotAt(d.x, d.y);
  if (to >= 0 && to !== d.from) {
    const other = game.heroes[to];
    const name = HEROES[game.heroes[d.from].type].name;
    game.moveHero(d.from, to);
    ui.toast(other ? `${name} đổi chỗ với ${HEROES[other.type].name}` : `${name} chuyển sang bệ mới`, '#9dffc4');
  }
});
canvas.addEventListener('pointercancel', () => { drag = null; });

function render() {
  const t = performance.now() / 1000;
  ctx.setTransform(view.scale * view.dpr, 0, 0, view.scale * view.dpr, 0, 0);
  if (!mapCanvas) return;
  ctx.drawImage(mapCanvas, 0, 0, CONFIG.W, CONFIG.H);
  drawPortal(ctx, t);

  const selected = ui.sheet && ui.sheet.slot !== undefined ? ui.sheet.slot : -1;
  const dragging = drag && drag.moved ? drag : null;
  const dropSlot = dragging ? ui.slotAt(dragging.x, dragging.y) : -1;
  CONFIG.slots.forEach(([x, y], i) => {
    const h = game.heroes[i];
    drawSlot(ctx, x, y, i === selected || i === dropSlot, i === ui.coachSlot || (dragging && i !== dragging.from), t,
      !!h, h && ATTRS[HEROES[h.type].attr].color);
  });

  // vòng tầm đánh của tướng đang chọn
  const sel = dragging ? null : game.heroes[selected];
  if (sel) {
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sel.x, sel.y, heroStats(sel).range, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // vẽ theo trục y để vật thể phía dưới đè lên phía trên
  const drawables = [
    ...game.enemies.map((e) => ({ y: e.y, draw: () => drawEnemy(ctx, e, t) })),
    ...game.heroes.filter((h) => h && !(dragging && h.slot === dragging.from))
      .map((h) => ({ y: h.y, draw: () => drawHeroOnMap(h, t) })),
  ].sort((a, b) => a.y - b.y);
  drawables.forEach((d) => d.draw());

  for (const p of game.projectiles) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle || 0);
    if (p.kind === 'evil') {
      ctx.shadowColor = '#e056fd';
      ctx.shadowBlur = 10;
      circle(ctx, 0, 0, 5, '#be2edd');
      circle(ctx, 0, 0, 2.5, '#f6d5ff');
    } else if (p.kind === 'frostbolt') {
      ctx.shadowColor = '#74b9ff';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#aee9ff';
      ctx.beginPath();
      ctx.moveTo(8, 0); ctx.lineTo(-6, -4); ctx.lineTo(-3, 0); ctx.lineTo(-6, 4);
      ctx.fill();
    } else if (p.kind === 'arrow') {
      ctx.strokeStyle = p.st.poison ? '#2ecc71' : '#ecf0f1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, 0); ctx.lineTo(4, 0);
      ctx.stroke();
    } else {
      ctx.shadowColor = '#ff6b00';
      ctx.shadowBlur = 12;
      circle(ctx, 0, 0, 6, p.st.slow ? '#74b9ff' : '#e67e22');
      circle(ctx, 1, -1, 3, '#fff3b0');
    }
    ctx.restore();
  }

  drawEffects(t);
  if (dragging) drawDragGhost(dragging, dropSlot, t);
}

// Tướng đang kéo: nổi lên trên ngón tay, kèm vòng tầm đánh tại bệ sẽ thả
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
  drawHero(ctx, computeLook(h.type, h.equip, h.kills), d.x, d.y - 26, { t, dir: h.dir, scale: 1.15 });
  ctx.globalAlpha = 1;
}

function drawHeroOnMap(h, t) {
  if (h.dead) {
    // bia mộ + đếm ngược hồi sinh
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(h.x, h.y, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    rrect(ctx, h.x - 10, h.y - 26, 20, 26, 8, '#8d8d8d');
    ctx.fillStyle = '#5f5f5f';
    ctx.fillRect(h.x - 1.5, h.y - 21, 3, 12);
    ctx.fillRect(h.x - 5, h.y - 17, 10, 3);
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000';
    const txt = Math.ceil(h.respawnT) + 's';
    ctx.strokeText(txt, h.x, h.y - 32);
    ctx.fillStyle = '#ff8a80';
    ctx.fillText(txt, h.x, h.y - 32);
    return;
  }
  const look = computeLook(h.type, h.equip, h.kills);
  drawHero(ctx, look, h.x, h.y, { t, dir: h.dir, swing: h.swing });
  const st = heroStats(h);
  const top = h.y - 52 * (1 + look.tier * 0.1) * look.bulk;
  // thanh máu tướng (chỉ hiện khi mất máu) + cấp
  if (h.hp < st.hpMax - 0.5) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(h.x - 16, top - 4, 32, 5);
    ctx.fillStyle = h.hp / st.hpMax > 0.35 ? '#5fd35a' : '#e74c3c';
    ctx.fillRect(h.x - 15, top - 3, 30 * (h.hp / st.hpMax), 3);
  }
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.beginPath();
  ctx.arc(h.x + 18, h.y - 6, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = ATTRS[HEROES[h.type].attr].color;
  ctx.fillText(h.level, h.x + 18, h.y - 2.5);
  if (h.stunT > 0) {
    for (let i = 0; i < 3; i++) {
      const a = t * 5 + (i * Math.PI * 2) / 3;
      drawStar(ctx, h.x + Math.cos(a) * 12, top - 10 + Math.sin(a) * 4, 3.5, '#f6e58d');
    }
  }
}

function drawEffects(t) {
  for (const f of game.effects) {
    const k = f.ttl / f.max; // 1 -> 0
    ctx.globalAlpha = Math.max(0, Math.min(1, k * 1.5));
    switch (f.type) {
      case 'text':
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000';
        ctx.strokeText(f.str, f.x, f.y);
        ctx.fillStyle = f.color;
        ctx.fillText(f.str, f.x, f.y);
        break;
      case 'ring':
        ctx.strokeStyle = f.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(f.x, f.y, Math.max(1, f.r * (1 - k * 0.6)), 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'slash':
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(f.x - f.dir * 8, f.y, 16, -1.2 + (1 - k), 0.6 + (1 - k));
        ctx.stroke();
        break;
      case 'spark': {
        const d = (1 - k) * 22;
        circle(ctx, f.x + Math.cos(f.a) * d, f.y + Math.sin(f.a) * d, 2.5, f.color);
        break;
      }
      case 'bolt': {
        ctx.strokeStyle = '#f9e79f';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#f1c40f';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        let x = f.x + 10, y = f.y - 200;
        ctx.moveTo(x, y);
        while (y < f.y - 10) {
          y += 25;
          x = f.x + (Math.random() - 0.5) * 24;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        break;
      }
      case 'rain':
        ctx.strokeStyle = '#d5f5e3';
        ctx.lineWidth = 2;
        for (let i = 0; i < 14; i++) {
          const ax = f.x + Math.cos(i * 2.4) * f.r * ((i % 5) / 5);
          const ay = f.y + Math.sin(i * 2.4) * f.r * 0.5 * ((i % 5) / 5) - k * 120;
          ctx.beginPath();
          ctx.moveTo(ax, ay - 14); ctx.lineTo(ax, ay);
          ctx.stroke();
        }
        break;
      case 'meteor': {
        const my = f.y - k * 300, mx = f.x + k * 120;
        ctx.globalAlpha = 1;
        ctx.shadowColor = '#e67e22';
        ctx.shadowBlur = 20;
        circle(ctx, mx, my, 14, '#d35400');
        circle(ctx, mx - 3, my - 3, 7, '#f9e79f');
        ctx.shadowBlur = 0;
        break;
      }
      case 'line':
        ctx.strokeStyle = f.color;
        ctx.lineWidth = f.w || 3;
        ctx.setLineDash(f.color === '#8d6e63' ? [5, 3] : []);
        ctx.beginPath();
        ctx.moveTo(f.x, f.y); ctx.lineTo(f.x2, f.y2);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      case 'snow': {
        ctx.fillStyle = 'rgba(174,233,255,0.18)';
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 26; i++) {
          const a = i * 2.4, rr = f.r * ((i * 37) % 100) / 100;
          const fy = ((t * 60 + i * 23) % 40) - 20;
          circle(ctx, f.x + Math.cos(a) * rr, f.y + Math.sin(a) * rr * 0.6 + fy, 2, '#ffffff');
        }
        break;
      }
      case 'flash':
        ctx.fillStyle = 'rgba(231,76,60,0.35)';
        ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);
        break;
    }
  }
  ctx.globalAlpha = 1;
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  // game vẫn chạy khi mở bảng tướng / đồ; chỉ dừng khi bấm nút tạm dừng
  if (game.started && !game.paused) {
    // chia nhỏ bước khi tăng tốc để mô phỏng ổn định
    for (let i = 0; i < game.speed; i++) game.update(dt);
  }
  render();
  ui.tick(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
