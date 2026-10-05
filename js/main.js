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

let view = { scale: 1, dpr: 1 };
let mapCanvas = null;

function resize() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const scale = Math.min(vw / CONFIG.W, vh / CONFIG.H);
  const w = Math.floor(CONFIG.W * scale), h = Math.floor(CONFIG.H * scale);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  wrap.style.width = w + 'px';
  wrap.style.height = h + 'px';
  wrap.style.setProperty('--u', scale);
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  view = { scale, dpr };
  mapCanvas = buildMapCanvas(Math.max(1, scale * dpr));
}
window.addEventListener('resize', resize);
resize();

canvas.addEventListener('pointerdown', (ev) => {
  const r = canvas.getBoundingClientRect();
  ui.tapMap((ev.clientX - r.left) / view.scale, (ev.clientY - r.top) / view.scale);
});

function render() {
  const t = performance.now() / 1000;
  ctx.setTransform(view.scale * view.dpr, 0, 0, view.scale * view.dpr, 0, 0);
  ctx.drawImage(mapCanvas, 0, 0, CONFIG.W, CONFIG.H);

  const selected = ui.sheet && ui.sheet.slot !== undefined ? ui.sheet.slot : -1;
  CONFIG.slots.forEach(([x, y], i) => {
    if (!game.heroes[i]) drawSlot(ctx, x, y, i === selected);
  });

  // vòng tầm đánh của tướng đang chọn
  const sel = game.heroes[selected];
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
    ...game.heroes.filter(Boolean).map((h) => ({
      y: h.y,
      draw: () => drawHero(ctx, computeLook(h.type, h.equip, h.kills), h.x, h.y, { t, dir: h.dir, swing: h.swing }),
    })),
  ].sort((a, b) => a.y - b.y);
  drawables.forEach((d) => d.draw());

  for (const p of game.projectiles) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle || 0);
    if (p.kind === 'arrow') {
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
  if (!game.paused) {
    // chia nhỏ bước khi tăng tốc để mô phỏng ổn định
    for (let i = 0; i < game.speed; i++) game.update(dt);
  }
  render();
  ui.tick(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
