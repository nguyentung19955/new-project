'use strict';

// ============================================================
//  VẼ: bản đồ, tướng (thay đổi theo trang bị), quái, hiệu ứng
//  Toàn bộ vẽ bằng code (không cần ảnh) -> dễ thay bằng sprite sau.
// ============================================================

function shade(hex, pct) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + (pct < 0 ? c : 255 - c) * pct)));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// Tự vẽ bo góc (ctx.roundRect không có trên iOS < 16)
function rrect(ctx, x, y, w, h, r, color) {
  r = Math.min(r, w / 2, h / 2);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

function tierOf(kills) {
  let t = 0;
  CONFIG.tiers.forEach((need, i) => { if (kills >= need) t = i; });
  return t;
}

function setCounts(equip) {
  const counts = {};
  for (const slot of SLOTS) {
    const it = ITEMS[equip[slot]];
    if (it && it.set) counts[it.set] = (counts[it.set] || 0) + 1;
  }
  return counts;
}

function activeSets(equip) {
  const c = setCounts(equip);
  return Object.keys(c).filter((k) => SETS[k] && c[k] >= SETS[k].pieces);
}

// Gộp ngoại hình gốc của tướng + trang bị + bậc tiến hóa + set -> "look"
function computeLook(type, equip, kills) {
  const base = HEROES[type].look;
  const look = {
    skin: base.skin, cloth: base.cloth, hair: base.hair,
    helmet: base.helmet || null, armor: null, weapon: { ...base.weapon },
    tier: tierOf(kills), aura: null, wings: null,
  };
  for (const slot of SLOTS) {
    const it = ITEMS[equip[slot]];
    if (it) look[slot] = it.look;
  }
  if (look.tier >= 2) look.aura = base.aura;
  for (const set of activeSets(equip)) Object.assign(look, SETS[set].look);
  return look;
}

// ------------------------------------------------------------
//  TƯỚNG — tọa độ cục bộ: chân tại (0,0), hướng mặt sang phải
// ------------------------------------------------------------
function drawHero(ctx, look, x, y, o = {}) {
  const t = o.t || 0;
  const dir = o.dir || 1;
  const s = (o.scale || 1) * (1 + look.tier * 0.1);
  const bob = Math.sin(t * 4 + x) * 1;

  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 15 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  if (look.aura) {
    const a = 0.35 + Math.sin(t * 3) * 0.12;
    const g = ctx.createRadialGradient(0, -22 * s, 4, 0, -22 * s, 34 * s);
    g.addColorStop(0, look.aura + '00');
    g.addColorStop(0.6, look.aura + Math.round(a * 255).toString(16).padStart(2, '0'));
    g.addColorStop(1, look.aura + '00');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, -22 * s, 34 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.scale(dir * s, s);
  ctx.translate(0, bob);

  if (look.wings) drawWings(ctx, look.wings, t);
  if (look.armor && look.armor.cape) drawCape(ctx, look.armor.cape, t);

  // chân
  ctx.fillStyle = '#3b3b3b';
  ctx.fillRect(-6, -11, 5, 11);
  ctx.fillRect(1, -11, 5, 11);
  ctx.fillStyle = '#2b1d0e';
  ctx.fillRect(-7, -3, 6, 3);
  ctx.fillRect(1, -3, 7, 3);

  drawTorso(ctx, look);

  // đầu
  circle(ctx, 0, -34, 8, look.skin);
  ctx.fillStyle = '#222';
  ctx.fillRect(2, -36, 2, 2.5);
  ctx.fillRect(5.5, -36, 2, 2.5);

  drawHelmet(ctx, look);
  drawWeapon(ctx, look.weapon, o.swing || 0, t);
  ctx.restore();

  // sao tiến hóa
  for (let i = 0; i < look.tier; i++) {
    drawStar(ctx, x + (i - (look.tier - 1) / 2) * 10 * s, y - 56 * s, 4 * s, '#f1c40f');
  }
}

function drawStar(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

function drawWings(ctx, color, t) {
  const flap = Math.sin(t * 3) * 0.25;
  for (const [off, col] of [[0.35, shade(color, -0.3)], [0, color]]) {
    ctx.save();
    ctx.translate(-4, -24);
    ctx.rotate(-0.2 - flap - off);
    ctx.fillStyle = col;
    ctx.strokeStyle = shade(color, 0.4);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-10, -22);
    ctx.lineTo(-30, -26);
    ctx.quadraticCurveTo(-24, -16, -30, -10);
    ctx.quadraticCurveTo(-22, -6, -24, 2);
    ctx.quadraticCurveTo(-14, 0, -6, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawCape(ctx, color, t) {
  const wave = Math.sin(t * 5) * 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-6, -27);
  ctx.lineTo(4, -27);
  ctx.lineTo(-6 + wave * 0.3, -2);
  ctx.lineTo(-16 + wave, 0);
  ctx.closePath();
  ctx.fill();
}

function drawTorso(ctx, look) {
  const a = look.armor;
  if (!a) {
    rrect(ctx, -8, -26, 16, 16, 3, look.cloth);
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(-8, -14, 16, 2.5);
    return;
  }
  if (a.type === 'leather') {
    rrect(ctx, -8.5, -26.5, 17, 17, 3, a.color);
    ctx.strokeStyle = shade(a.color, -0.35);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-6, -26); ctx.lineTo(6, -13);
    ctx.stroke();
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(-8.5, -14, 17, 3);
    ctx.fillStyle = '#d4ac0d';
    ctx.fillRect(-1.5, -14, 3, 3);
  } else if (a.type === 'plate') {
    rrect(ctx, -9.5, -27.5, 19, 18, 4, a.color);
    rrect(ctx, -6, -25, 6, 10, 2, shade(a.color, 0.35));
    ctx.fillStyle = shade(a.color, -0.3);
    ctx.fillRect(-9.5, -13, 19, 3);
    circle(ctx, -8, -25, 5, shade(a.color, -0.15));
    circle(ctx, 8, -25, 5, shade(a.color, -0.15));
    circle(ctx, 8, -26, 2, shade(a.color, 0.4));
  } else if (a.type === 'robe') {
    ctx.fillStyle = a.color;
    ctx.beginPath();
    ctx.moveTo(-8, -28); ctx.lineTo(8, -28); ctx.lineTo(12, -1); ctx.lineTo(-12, -1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = a.trim || shade(a.color, 0.4);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -27); ctx.lineTo(0, -1);
    ctx.moveTo(-12, -2); ctx.lineTo(12, -2);
    ctx.stroke();
  }
}

function drawHelmet(ctx, look) {
  const h = look.helmet;
  const hair = () => {
    ctx.fillStyle = look.hair;
    ctx.beginPath();
    ctx.arc(0, -35, 8.6, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-8.6, -36, 5, 8);
  };
  if (!h) { hair(); return; }

  switch (h.type) {
    case 'cap':
      hair();
      ctx.fillStyle = h.color;
      ctx.beginPath();
      ctx.arc(0, -36, 8.8, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(0, -37, 12, 2.5);
      break;
    case 'hood':
      circle(ctx, -1, -35, 10.5, h.color);
      ctx.fillStyle = h.color;
      ctx.beginPath();
      ctx.moveTo(-8, -40); ctx.lineTo(-16, -26); ctx.lineTo(-5, -28);
      ctx.fill();
      circle(ctx, 2, -33, 6.5, look.skin);
      ctx.fillStyle = '#222';
      ctx.fillRect(3, -35, 2, 2.5);
      ctx.fillRect(6, -35, 2, 2.5);
      break;
    case 'helm':
    case 'horned': {
      ctx.fillStyle = h.color;
      ctx.beginPath();
      ctx.arc(0, -35, 9.6, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-9.6, -35, 19.2, 7);
      ctx.fillStyle = '#111';
      ctx.fillRect(1, -35, 9, 2.2);
      ctx.fillStyle = shade(h.color, 0.35);
      ctx.fillRect(-1, -44, 2.5, 9);
      if (h.plume) {
        ctx.fillStyle = h.plume;
        ctx.beginPath();
        ctx.ellipse(-4, -46, 7, 3, -0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      if (h.type === 'horned') {
        ctx.fillStyle = '#ecf0f1';
        for (const sx of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(sx * 6, -41);
          ctx.quadraticCurveTo(sx * 16, -44, sx * 15, -55);
          ctx.quadraticCurveTo(sx * 11, -46, sx * 3, -43);
          ctx.fill();
        }
      }
      break;
    }
    case 'wizard':
      hair();
      ctx.fillStyle = h.color;
      ctx.beginPath();
      ctx.ellipse(0, -40, 13, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-8, -41); ctx.lineTo(8, -41);
      ctx.quadraticCurveTo(2, -52, -10, -62);
      ctx.closePath();
      ctx.fill();
      drawStar(ctx, 0, -48, 2.8, '#f1c40f');
      break;
    case 'crown':
      hair();
      ctx.fillStyle = h.color;
      ctx.fillRect(-8, -46, 16, 5);
      ctx.beginPath();
      for (const cx of [-6, 0, 6]) {
        ctx.moveTo(cx - 3, -46); ctx.lineTo(cx, -53); ctx.lineTo(cx + 3, -46);
      }
      ctx.fill();
      circle(ctx, 0, -43.5, 1.8, h.gem || '#e74c3c');
      circle(ctx, -5, -43.5, 1.2, h.gem || '#e74c3c');
      circle(ctx, 5, -43.5, 1.2, h.gem || '#e74c3c');
      break;
  }
}

function drawWeapon(ctx, w, swing, t) {
  ctx.save();
  ctx.translate(9, -17);
  if (w.glow) {
    ctx.shadowColor = w.glow;
    ctx.shadowBlur = 10 + Math.sin(t * 6) * 4;
  }
  switch (w.type) {
    case 'sword':
    case 'greatsword': {
      const big = w.type === 'greatsword';
      ctx.rotate(-0.5 + swing * 2.2);
      const bw = big ? 5 : 3, bl = big ? 32 : 22;
      ctx.fillStyle = w.color;
      ctx.fillRect(-bw / 2, -bl - 2, bw, bl);
      ctx.beginPath();
      ctx.moveTo(-bw / 2, -bl - 2); ctx.lineTo(0, -bl - 7); ctx.lineTo(bw / 2, -bl - 2);
      ctx.fill();
      ctx.fillStyle = '#b7950b';
      ctx.fillRect(big ? -7 : -5, -3, big ? 14 : 10, 2.5);
      ctx.fillStyle = '#4a2c0a';
      ctx.fillRect(-1, -1, 2, 6);
      break;
    }
    case 'axe':
      ctx.rotate(-0.5 + swing * 2.2);
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(-1.2, -26, 2.4, 31);
      ctx.fillStyle = w.color;
      ctx.beginPath();
      ctx.moveTo(1, -26);
      ctx.quadraticCurveTo(14, -28, 13, -16);
      ctx.quadraticCurveTo(8, -19, 1, -17);
      ctx.fill();
      break;
    case 'bow':
    case 'longbow': {
      const r = w.type === 'longbow' ? 19 : 14;
      ctx.strokeStyle = w.color;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(-3, 0, r, -1.15, 1.15);
      ctx.stroke();
      const ex = -3 + Math.cos(1.15) * r, ey = Math.sin(1.15) * r;
      const pull = -swing * 9;
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ecf0f1';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(ex, -ey); ctx.lineTo(ex + pull, 0); ctx.lineTo(ex, ey);
      ctx.stroke();
      break;
    }
    case 'staff':
      ctx.rotate(-0.15 + swing * 0.4);
      ctx.fillStyle = w.color;
      ctx.fillRect(-1.3, -30, 2.6, 38);
      circle(ctx, 0, -33, 4.8 + swing * 1.5, w.orb || '#e67e22');
      circle(ctx, -1.3, -34.5, 1.4, 'rgba(255,255,255,0.8)');
      break;
  }
  ctx.restore();
}

// ------------------------------------------------------------
//  QUÁI
// ------------------------------------------------------------
function drawEnemy(ctx, e, t) {
  const d = e.def, r = d.size;
  const wob = Math.sin(t * 12 + e.id) * 1.5;
  let color = d.color;
  if (e.slowT > 0) color = '#74b9ff';

  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.6, r, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.scale(e.dir, 1);

  if (e.type === 'runner') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, -2 + wob * 0.5, r * 1.35, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    circle(ctx, r * 1.1, -r * 0.6, r * 0.6, color);
    ctx.beginPath();
    ctx.moveTo(r * 0.9, -r * 1.1); ctx.lineTo(r * 1.1, -r * 1.7); ctx.lineTo(r * 1.35, -r * 1.0);
    ctx.fill();
    ctx.fillRect(-r * 1.7, -r * 0.5, r * 0.6, 3);
    circle(ctx, r * 1.35, -r * 0.7, 1.8, '#c0392b');
  } else if (e.type === 'tank') {
    rrect(ctx, -r, -r * 1.6 + wob * 0.3, r * 2, r * 2, 6, color);
    ctx.strokeStyle = shade(color, -0.35);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, -r * 1.4); ctx.lineTo(-r * 0.1, -r * 0.8); ctx.lineTo(-r * 0.4, -r * 0.2);
    ctx.stroke();
    circle(ctx, r * 0.45, -r * 0.9, 3, '#f1c40f');
  } else {
    const boss = e.type === 'boss';
    circle(ctx, 0, -r * 0.6 + wob, r, color);
    if (boss) {
      ctx.fillStyle = '#2d3436';
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(sx * r * 0.4, -r * 1.4);
        ctx.quadraticCurveTo(sx * r * 1.1, -r * 1.7, sx * r * 0.9, -r * 2.3);
        ctx.lineTo(sx * r * 0.7, -r * 1.3);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, -r); ctx.lineTo(-r * 1.4, -r * 1.4); ctx.lineTo(-r * 0.4, -r * 1.3);
      ctx.fill();
    }
    circle(ctx, r * 0.35, -r * 0.75 + wob, r * 0.28, '#fff');
    circle(ctx, r * 0.45, -r * 0.75 + wob, r * 0.14, boss ? '#e74c3c' : '#111');
  }
  ctx.restore();

  if (e.poisonT > 0 && Math.random() < 0.3) {
    circle(ctx, e.x + (Math.random() - 0.5) * r, e.y - r * 1.5, 2, '#2ecc71');
  }

  // thanh máu
  const w = Math.max(24, r * 2);
  const by = e.y - r * (e.type === 'boss' ? 2.6 : 2) - 6;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(e.x - w / 2 - 1, by - 1, w + 2, 5);
  ctx.fillStyle = e.hp / e.maxHp > 0.4 ? '#2ecc71' : '#e74c3c';
  ctx.fillRect(e.x - w / 2, by, w * Math.max(0, e.hp / e.maxHp), 3);
}


// ------------------------------------------------------------
//  BẢN ĐỒ (phần tĩnh vẽ 1 lần vào canvas phụ)
// ------------------------------------------------------------
function buildMapCanvas(scale) {
  const c = document.createElement('canvas');
  c.width = Math.round(CONFIG.W * scale);
  c.height = Math.round(CONFIG.H * scale);
  const ctx = c.getContext('2d');
  ctx.scale(scale, scale);
  const W = CONFIG.W, H = CONFIG.H;
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // cỏ: nền chuyển màu + mảng sáng tối
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#3f6b2f');
  g.addColorStop(1, '#4f7f36');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 26; i++) {
    ctx.fillStyle = rnd() < 0.5 ? 'rgba(255,255,160,0.05)' : 'rgba(0,40,0,0.08)';
    ctx.beginPath();
    ctx.ellipse(rnd() * W, rnd() * H, 40 + rnd() * 70, 25 + rnd() * 40, rnd() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 420; i++) {
    const x = rnd() * W, y = rnd() * H;
    ctx.strokeStyle = rnd() < 0.5 ? '#5c8f3e' : '#355c27';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + (rnd() - 0.5) * 3, y - 4 - rnd() * 3);
    ctx.stroke();
  }

  const strokePath = (w, color, dash) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.setLineDash(dash || []);
    ctx.beginPath();
    CONFIG.path.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.setLineDash([]);
  };
  strokePath(CONFIG.pathWidth + 14, 'rgba(0,0,0,0.18)');
  strokePath(CONFIG.pathWidth + 8, '#7a5a35');
  strokePath(CONFIG.pathWidth, '#c9a56b');
  strokePath(CONFIG.pathWidth - 18, '#d6b67f');
  strokePath(3, 'rgba(120,85,45,0.35)', [6, 14]);

  // sỏi trên đường
  for (let i = 0; i < 160; i++) {
    const x = rnd() * W, y = rnd() * H;
    if (distToPath(x, y) > CONFIG.pathWidth / 2 - 4) continue;
    circle(ctx, x, y, 1 + rnd() * 2, rnd() < 0.5 ? '#b08d58' : '#e2c896');
  }

  const blocked = (x, y, pad) =>
    CONFIG.slots.some(([sx, sy]) => Math.hypot(sx - x, sy - y) < 42 + pad) ||
    distToPath(x, y) < CONFIG.pathWidth / 2 + 14 + pad || y < 70 || y > H - 110;

  // hoa & đá nhỏ
  for (let i = 0; i < 70; i++) {
    const x = rnd() * W, y = rnd() * H;
    if (blocked(x, y, 0)) continue;
    if (rnd() < 0.6) {
      const col = ['#f7d794', '#f8a5c2', '#ffffff', '#a29bfe'][Math.floor(rnd() * 4)];
      for (let k = 0; k < 3; k++) circle(ctx, x + k * 4 - 4, y + (k % 2) * 3, 1.8, col);
    } else {
      circle(ctx, x, y + 2, 5, 'rgba(0,0,0,0.2)');
      circle(ctx, x, y, 5, '#8d8d8d');
      circle(ctx, x - 1.5, y - 1.5, 2, '#b5b5b5');
    }
  }

  // cây
  const trees = [];
  for (let i = 0; i < 60; i++) {
    const x = rnd() * W, y = rnd() * H;
    if (!blocked(x, y, 6)) trees.push([x, y, 10 + rnd() * 6]);
  }
  trees.sort((a, b) => a[1] - b[1]).forEach(([x, y, r]) => {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(x + 3, y + r * 0.8, r, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(x - 2, y, 4, r * 0.8);
    circle(ctx, x, y - r * 0.2, r, '#2e5e2a');
    circle(ctx, x - r * 0.35, y - r * 0.45, r * 0.6, '#3d7a35');
    circle(ctx, x - r * 0.45, y - r * 0.6, r * 0.25, '#5a9a48');
  });

  drawCastle(ctx);
  return c;
}

function drawCastle(ctx) {
  const [cx] = CONFIG.path[CONFIG.path.length - 1];
  const H = CONFIG.H, top = H - 66;
  const stone = '#9aa0a6', dark = '#6b7177';
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(cx - 82, H - 8, 164, 8);
  // tháp hai bên
  for (const sx of [-1, 1]) {
    const tx = cx + sx * 62;
    rrect(ctx, tx - 18, top - 18, 36, 90, 3, stone);
    for (let i = 0; i < 3; i++) ctx.fillRect(tx - 18 + i * 13, top - 27, 10, 11);
    ctx.fillStyle = '#2c2c34';
    rrect(ctx, tx - 4, top + 5, 8, 14, 4, '#2c2c34');
    // cờ
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(tx - 1, top - 62, 2, 30);
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.moveTo(tx + 1, top - 62); ctx.lineTo(tx + 20, top - 55); ctx.lineTo(tx + 1, top - 48);
    ctx.fill();
  }
  // tường giữa
  rrect(ctx, cx - 50, top, 100, 66, 3, stone);
  ctx.fillStyle = stone;
  for (let i = 0; i < 5; i++) ctx.fillRect(cx - 48 + i * 21, top - 10, 12, 12);
  ctx.strokeStyle = dark;
  ctx.lineWidth = 1;
  for (let row = 0; row < 4; row++) {
    const y = top + 12 + row * 14;
    ctx.beginPath(); ctx.moveTo(cx - 50, y); ctx.lineTo(cx + 50, y); ctx.stroke();
  }
  // cổng
  ctx.fillStyle = '#3e2723';
  ctx.beginPath();
  ctx.moveTo(cx - 22, H);
  ctx.lineTo(cx - 20, top + 34);
  ctx.arc(cx, top + 34, 20, Math.PI, 0);
  ctx.lineTo(cx + 22, H);
  ctx.fill();
  ctx.strokeStyle = '#2a1a15';
  ctx.lineWidth = 2;
  for (let i = -14; i <= 14; i += 7) {
    ctx.beginPath(); ctx.moveTo(cx + i, top + 18); ctx.lineTo(cx + i, H); ctx.stroke();
  }
}

// Cổng quỷ nơi quái xuất hiện (vẽ động mỗi khung hình)
function drawPortal(ctx, t) {
  const [, y] = CONFIG.path[0];
  const x = 14;
  ctx.save();
  ctx.translate(x, y);
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `rgba(${170 + i * 30},${60 + i * 30},255,${0.7 - i * 0.2})`;
    ctx.lineWidth = 4 - i;
    ctx.beginPath();
    ctx.ellipse(0, 0, 14 + i * 5 + Math.sin(t * 3 + i) * 2, 30 + i * 4, 0, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  }
  const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 30);
  g.addColorStop(0, 'rgba(220,160,255,0.8)');
  g.addColorStop(1, 'rgba(90,30,160,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 32, 0, -Math.PI / 2, Math.PI / 2);
  ctx.fill();
  ctx.restore();
}

function distToPath(x, y) {
  let best = Infinity;
  const p = CONFIG.path;
  for (let i = 1; i < p.length; i++) {
    const [ax, ay] = p[i - 1], [bx, by] = p[i];
    const dx = bx - ax, dy = by - ay;
    const tt = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    best = Math.min(best, Math.hypot(ax + dx * tt - x, ay + dy * tt - y));
  }
  return best;
}

// Bệ đá đặt tướng; `hint` = nhấp nháy gợi ý cho người mới
function drawSlot(ctx, x, y, selected, hint, t) {
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(x, y + 5, 26, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7d756a';
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 24, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = selected ? '#efd9a0' : '#b3a998';
  ctx.beginPath();
  ctx.ellipse(x, y - 1, 24, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = selected ? '#f1c40f' : '#d9cfbd';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(80,70,55,0.7)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 1); ctx.lineTo(x + 6, y - 1);
  ctx.moveTo(x, y - 4.5); ctx.lineTo(x, y + 2.5);
  ctx.stroke();
  if (hint) {
    const k = (t * 1.2) % 1;
    ctx.strokeStyle = `rgba(241,196,15,${1 - k})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y - 1, 24 + k * 22, 10 + k * 9, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}
