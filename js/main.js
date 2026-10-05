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
window.game = game;

let view = { scale: 1, dpr: 1 };
// Tướng và quái vẽ to hơn trên bản đồ ngang cho dễ nhìn trên điện thoại
const UNIT_SCALE = 1.3;
function scaled(x, y, fn) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(UNIT_SCALE, UNIT_SCALE);
  ctx.translate(-x, -y);
  fn();
  ctx.restore();
}
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
  // game thiết kế cho màn hình ngang: điện thoại cầm dọc thì nhắc xoay máy
  $('#rotate').hidden = !(vh > vw && vw < 900);
  const scale = Math.min(vw / CONFIG.W, vh / CONFIG.H);
  const w = Math.floor(CONFIG.W * scale), h = Math.floor(CONFIG.H * scale);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  wrap.style.width = w + 'px';
  wrap.style.height = h + 'px';
  // --p: 1px thiết kế; --f: chữ to hơn bố cục trên màn hình nhỏ để vẫn đọc được
  wrap.style.setProperty('--p', scale + 'px');
  wrap.style.setProperty('--f', Math.max(scale, Math.min(1, scale * 1.45)) + 'px');
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
  if (!drag.moved && Math.hypot(drag.x - drag.sx, drag.y - drag.sy) > 12) drag.moved = true;
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
    ui.sel = to;
    ui.toast(other ? `${name} đổi chỗ với ${HEROES[other.type].name}` : `${name} chuyển sang bệ mới`, '#9dffc4');
  }
});
canvas.addEventListener('pointercancel', () => { drag = null; });

function render() {
  const t = performance.now() / 1000;
  ctx.setTransform(view.scale * view.dpr, 0, 0, view.scale * view.dpr, 0, 0);
  if (!mapCanvas) return;
  // rung màn hình khi tung chiêu mạnh
  if (game.shake > 0.2) ctx.translate((Math.random() - 0.5) * game.shake, (Math.random() - 0.5) * game.shake);
  ctx.drawImage(mapCanvas, 0, 0, CONFIG.W, CONFIG.H);
  drawPortal(ctx, t);

  const selected = ui.sel;
  const dragging = drag && drag.moved ? drag : null;
  const dropSlot = dragging ? ui.slotAt(dragging.x, dragging.y) : -1;
  CONFIG.slots.forEach(([x, y], i) => {
    const h = game.heroes[i];
    if (dragging) {
      if (i === dropSlot) drawSpot(ctx, x, y, 'target', t);
      else if (!h) drawSpot(ctx, x, y, 'free', t);
    } else if (i === selected || i === ui.spot) {
      drawSpot(ctx, x, y, 'target', t);
    } else if (!h && ui.armed) {
      drawSpot(ctx, x, y, 'free', t);
    } else if (!h && i === ui.coachSlot) {
      drawSpot(ctx, x, y, 'hint', t);
    }
    if (h && !(dragging && i === dragging.from)) drawSpot(ctx, x, y, 'hero', t, ATTRS[HEROES[h.type].attr].color);
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
    ...game.enemies.map((e) => ({ y: e.y, draw: () => scaled(e.x, e.y, () => drawEnemy(ctx, e, t)) })),
    ...game.heroes.filter((h) => h && !(dragging && h.slot === dragging.from))
      .map((h) => ({ y: h.y, draw: () => scaled(h.x, h.y, () => drawHeroOnMap(h, t)) })),
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
  drawHero(ctx, computeLook(h.type, h.equip, h.kills), d.x, d.y - 26, { t, dir: h.dir, scale: UNIT_SCALE * 1.1 });
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
  const st = heroStats(h);
  if (st.stench) drawStench(h, t);
  if (h.castT > 0) drawCastGlow(h, t);
  drawHero(ctx, look, h.x, h.y, { t, dir: h.dir, swing: h.swing });
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

// Mùi Hôi Thối: khí xanh lượn quanh Đồ Tể
function drawStench(h, t) {
  for (let i = 0; i < 5; i++) {
    const a = t * 0.8 + i * 1.26;
    const r = 30 + Math.sin(t * 2 + i) * 8;
    ctx.fillStyle = `rgba(139,195,74,${0.13 + 0.05 * Math.sin(t * 3 + i)})`;
    ctx.beginPath();
    ctx.ellipse(h.x + Math.cos(a) * r, h.y - 10 + Math.sin(a) * r * 0.4, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Tướng vừa tung chiêu: cột sáng + vòng rune dưới chân
function drawCastGlow(h, t) {
  const k = h.castT / 0.5;
  const c = h.castColor || '#fff';
  ctx.save();
  ctx.globalAlpha = k;
  const g = ctx.createLinearGradient(h.x, h.y, h.x, h.y - 80);
  g.addColorStop(0, c + 'aa');
  g.addColorStop(1, c + '00');
  ctx.fillStyle = g;
  ctx.fillRect(h.x - 16, h.y - 80, 32, 80);
  ctx.strokeStyle = c;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = c;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.ellipse(h.x, h.y, 22 + (1 - k) * 10, 8 + (1 - k) * 4, 0, 0, Math.PI * 2);
  ctx.stroke();
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

function drawEffects(t) {
  for (const f of game.effects) {
    if (f.delay > 0 && f.type !== 'rain') continue;
    const k = f.ttl / f.max; // 1 -> 0
    const p = 1 - k;         // 0 -> 1
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, k * 1.5));
    switch (f.type) {
      case 'text': {
        const pop = p < 0.15 ? 0.7 + p * 2 : 1;
        ctx.font = `bold ${Math.round((f.size || 15) * pop)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000';
        ctx.strokeText(f.str, f.x, f.y);
        ctx.fillStyle = f.color;
        ctx.fillText(f.str, f.x, f.y);
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
        break; // vẽ cùng tướng (drawCastGlow)
      case 'slash': {
        ctx.strokeStyle = '#fff';
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
        ctx.shadowColor = '#f1c40f';
        ctx.shadowBlur = 18;
        if (Math.random() < 0.8 || p < 0.3) {
          lightning(f.x + 6, f.y - 260, f.x, f.y - 6, 30, 5 * k + 1, '#fffbe6');
          lightning(f.x + 6, f.y - 260, f.x, f.y - 6, 50, 2, '#f9e79f');
          lightning(f.x, f.y - 120, f.x - 40, f.y - 60, 20, 1.5, '#f9e79f');
        }
        ctx.globalAlpha = k;
        const g = ctx.createRadialGradient(f.x, f.y - 6, 2, f.x, f.y - 6, 50);
        g.addColorStop(0, 'rgba(255,255,220,0.95)');
        g.addColorStop(1, 'rgba(241,196,15,0)');
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
        ctx.strokeStyle = '#f6e58d';
        ctx.lineWidth = 4 * k + 1;
        ctx.beginPath();
        ctx.ellipse(f.x, f.y + 8, 12 + p * 34, 5 + p * 13, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#fffbe6';
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          ctx.fillRect(f.x + Math.cos(a) * (10 + p * 26) - 1.5, f.y + Math.sin(a) * (6 + p * 12) - 1.5, 3, 3);
        }
        break;
      }
      case 'streak': {
        ctx.lineCap = 'round';
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 14;
        const hx = f.x + (f.x2 - f.x) * Math.min(1, p * 2.2);
        const hy = f.y + (f.y2 - f.y) * Math.min(1, p * 2.2);
        ctx.strokeStyle = f.color;
        ctx.lineWidth = 6 * k;
        ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(hx, hy); ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(hx, hy); ctx.stroke();
        const a = Math.atan2(f.y2 - f.y, f.x2 - f.x);
        ctx.translate(hx, hy);
        ctx.rotate(a);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-6, -6); ctx.lineTo(-6, 6); ctx.fill();
        break;
      }
      case 'volley':
        ctx.strokeStyle = '#d5f5e3';
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
        ctx.strokeStyle = '#d5f5e3';
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
            circle(ctx, tx, ty + 1, 3 * k, 'rgba(213,245,227,0.5)');
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
        for (let i = 0; i <= 6; i++) {
          const yy = f.y - (h * i) / 6;
          ctx.lineTo(f.x - 20 + i * 2 + Math.sin(t * 25 + i) * 4, yy);
        }
        for (let i = 6; i >= 0; i--) {
          const yy = f.y - (h * i) / 6;
          ctx.lineTo(f.x + 20 - i * 2 + Math.sin(t * 22 + i * 2) * 4, yy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,127,80,0.35)';
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, 48, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 6; i++) {
          circle(ctx, f.x + Math.sin(t * 9 + i * 2) * 18, f.y - ((t * 120 + i * 20) % h), 2.5, '#ffd36e');
        }
        break;
      }
      case 'meteor': {
        ctx.globalAlpha = 1;
        const mx = f.x + k * 140, my = f.y - k * 320;
        for (let i = 6; i >= 1; i--) {
          circle(ctx, mx + i * 9, my - i * 20, 12 - i * 1.4, `rgba(255,${120 + i * 15},40,${0.5 - i * 0.06})`);
        }
        ctx.shadowColor = '#e67e22';
        ctx.shadowBlur = 24;
        circle(ctx, mx, my, 15, '#d35400');
        circle(ctx, mx - 3, my - 3, 8, '#f9e79f');
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
        ctx.strokeStyle = 'rgba(255,220,150,0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, f.r * (0.4 + p), f.r * 0.45 * (0.4 + p), 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      case 'hook': {
        const h = f.hero, e = f.target;
        if (!h || !e) break;
        ctx.globalAlpha = 1;
        // 0..0.35: phóng xích ra; sau đó thu về cùng quái
        const out = Math.min(1, p / 0.35);
        const ex = e.x, ey = e.y - 8;
        const hx = h.x, hy = h.y - 22;
        const tx = hx + (ex - hx) * out, ty = hy + (ey - hy) * out;
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(tx, ty); ctx.stroke();
        ctx.strokeStyle = '#d7ccc8';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 3]);
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(tx, ty); ctx.stroke();
        ctx.setLineDash([]);
        ctx.translate(tx, ty);
        ctx.rotate(Math.atan2(ty - hy, tx - hx));
        ctx.strokeStyle = '#eceff1';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(2, 6, 8, -Math.PI / 2, Math.PI * 0.75);
        ctx.stroke();
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
      case 'swallow': {
        const x = f.x + (f.x2 - f.x) * p, y = f.y + (f.y2 - f.y) * p - Math.sin(p * Math.PI) * 30;
        ctx.globalAlpha = 1;
        circle(ctx, x, y, Math.max(1, f.r * k), f.color);
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
        ctx.fillStyle = 'rgba(174,233,255,0.18)';
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, r, r * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e8fbff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#d6f6ff';
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
        ctx.fillStyle = 'rgba(116,185,255,0.15)';
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
        ctx.strokeStyle = '#55efc4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, f.r * p, f.r * 0.45 * p, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#55efc4';
        ctx.fillRect(f.x - 2, f.y - 40 - p * 10, 4, 12);
        ctx.fillRect(f.x - 6, f.y - 36 - p * 10, 12, 4);
        break;
      }
      case 'revive': {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#9be7ff';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const a = t * 4 + (i * Math.PI * 2) / 3;
          ctx.beginPath();
          ctx.arc(f.x, f.y - 30, 30 + i * 6, a, a + 1.4);
          ctx.stroke();
        }
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + t;
          ctx.fillStyle = '#dfe6e9';
          ctx.fillRect(f.x + Math.cos(a) * 40 * k - 4, f.y - 20 + Math.sin(a) * 16 * k, 8, 2.5);
        }
        break;
      }
      case 'flash':
        ctx.fillStyle = 'rgba(231,76,60,0.35)';
        ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);
        break;
    }
    ctx.restore();
  }
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  // game vẫn chạy khi mở bảng tướng / đồ; chỉ dừng khi bấm nút tạm dừng
  if (game.started && game.running) {
    // chia nhỏ bước khi tăng tốc để mô phỏng ổn định
    for (let i = 0; i < game.speed; i++) game.update(dt);
  }
  render();
  ui.tick(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
