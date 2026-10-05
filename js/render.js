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
  for (const slot of GEAR_SLOTS) {
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
    tier: tierOf(kills), aura: null, wings: null, bulk: base.bulk || 1,
  };
  for (const slot of GEAR_SLOTS) {
    const it = ITEMS[equip[slot]];
    if (it) look[slot] = it.look;
  }
  if (look.tier >= 2) look.aura = base.aura;
  // đồ ghép (phụ kiện) cho tướng hào quang riêng
  for (const slot of ACC_SLOTS) {
    const it = ITEMS[equip[slot]];
    if (it && it.look && it.look.aura) look.aura = it.look.aura;
  }
  for (const set of activeSets(equip)) Object.assign(look, SETS[set].look);
  return look;
}

// ------------------------------------------------------------
//  TƯỚNG — tọa độ cục bộ: chân tại (0,0), hướng mặt sang phải
// ------------------------------------------------------------
function drawHero(ctx, look, x, y, o = {}) {
  const t = o.t || 0;
  const dir = o.dir || 1;
  const s = (o.scale || 1) * (1 + look.tier * 0.1) * (look.bulk || 1);
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
    if (!look.hair) return;
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
    case 'mask':
      circle(ctx, -1, -35, 10.5, h.color);
      circle(ctx, 2, -33, 6.5, look.skin);
      ctx.fillStyle = '#1b1b24';
      ctx.fillRect(-4, -32, 13, 6);
      ctx.fillStyle = '#ff4757';
      ctx.fillRect(3, -36, 2.4, 2);
      ctx.fillRect(6.5, -36, 2.4, 2);
      ctx.fillStyle = h.color;
      ctx.beginPath();
      ctx.moveTo(-8, -40); ctx.lineTo(-17, -24); ctx.lineTo(-5, -28);
      ctx.fill();
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
    case 'cleaver':
      ctx.rotate(-0.5 + swing * 2.2);
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(-1.5, -8, 3, 13);
      ctx.fillStyle = w.color;
      ctx.beginPath();
      ctx.moveTo(-2, -8); ctx.lineTo(-2, -30); ctx.lineTo(10, -30); ctx.lineTo(12, -12); ctx.lineTo(6, -8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = shade(w.color, -0.3);
      ctx.fillRect(-2, -30, 2.5, 22);
      circle(ctx, 6, -26, 1.6, shade(w.color, -0.5));
      break;
    case 'daggers':
      for (const [ox, oy, rot] of [[-15, 3, 0.4], [0, 0, -0.4]]) {
        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(rot + swing * 1.8);
        ctx.fillStyle = w.color;
        ctx.beginPath();
        ctx.moveTo(-1.5, -2); ctx.lineTo(-1.5, -14); ctx.lineTo(0, -18); ctx.lineTo(1.5, -14); ctx.lineTo(1.5, -2);
        ctx.fill();
        ctx.fillStyle = '#6c5ce7';
        ctx.fillRect(-4, -3, 8, 2);
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(-1, -1, 2, 5);
        ctx.restore();
      }
      break;
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
  const lift = d.flying && !e.noBar ? 22 + Math.sin(t * 5 + e.id) * 3 : 0;

  // bóng dưới đất + hào quang tinh anh
  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.6, r * (d.flying ? 0.7 : 1), r * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  if (e.elite) {
    const ec = ELITE_MODS[e.elite].color;
    ctx.strokeStyle = ec;
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.6 + Math.sin(t * 6) * 0.3;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.5, r * 1.4, r * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (d.burnAura) {
    // vùng lửa của Chúa Tể Tro Tàn
    ctx.fillStyle = `rgba(255,90,30,${0.1 + Math.sin(t * 4) * 0.04})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, d.burnAura.radius, d.burnAura.radius * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.translate(0, -lift);
  ctx.scale(e.dir * (e.elite ? 1.2 : 1), e.elite ? 1.2 : 1);
  if (e.enraged) {
    ctx.shadowColor = '#ff2d2d';
    ctx.shadowBlur = 12;
  }
  if (e.reviveT > 0) ctx.globalAlpha = 0.45 + Math.sin(t * 10) * 0.2;

  switch (e.type) {
    case 'runner':
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, -2 + wob * 0.5, r * 1.35, r * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
      circle(ctx, r * 1.1, -r * 0.6, r * 0.6, color);
      ctx.beginPath();
      ctx.moveTo(r * 0.9, -r * 1.1); ctx.lineTo(r * 1.1, -r * 1.7); ctx.lineTo(r * 1.35, -r * 1.0);
      ctx.fill();
      ctx.fillRect(-r * 1.7, -r * 0.5, r * 0.6, 3);
      circle(ctx, r * 1.35, -r * 0.7, 1.8, e.enraged ? '#ff2d2d' : '#c0392b');
      break;
    case 'tank':
      rrect(ctx, -r, -r * 1.6 + wob * 0.3, r * 2, r * 2, 6, color);
      rrect(ctx, -r * 1.25, -r * 1.3, r * 0.5, r * 0.9, 4, shade(color, -0.2));
      rrect(ctx, r * 0.75, -r * 1.3, r * 0.5, r * 0.9, 4, shade(color, -0.2));
      ctx.strokeStyle = shade(color, -0.4);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, -r * 1.4); ctx.lineTo(-r * 0.1, -r * 0.8); ctx.lineTo(-r * 0.4, -r * 0.2);
      ctx.stroke();
      circle(ctx, r * 0.45, -r * 0.9, 3, '#f1c40f');
      break;
    case 'shaman':
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-r, 2); ctx.lineTo(r, 2); ctx.lineTo(r * 0.45, -r * 1.5 + wob); ctx.lineTo(-r * 0.45, -r * 1.5 + wob);
      ctx.fill();
      circle(ctx, 0, -r * 1.7 + wob, r * 0.6, shade(color, -0.3));
      circle(ctx, r * 0.25, -r * 1.7 + wob, 2, '#f1c40f');
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(r * 0.8, -r * 2.3, 2.5, r * 2.4);
      ctx.shadowColor = '#55efc4';
      ctx.shadowBlur = 10;
      circle(ctx, r * 0.9, -r * 2.4, 3.5, '#55efc4');
      ctx.shadowBlur = 0;
      break;
    case 'bat': {
      const flap = Math.sin(t * 18 + e.id) * 0.6;
      ctx.fillStyle = shade(color, -0.25);
      for (const sx of [-1, 1]) {
        ctx.save();
        ctx.scale(sx, 1);
        ctx.rotate(flap * 0.5);
        ctx.beginPath();
        ctx.moveTo(2, -r * 0.6);
        ctx.lineTo(r * 1.8, -r * 1.3);
        ctx.lineTo(r * 1.4, -r * 0.5);
        ctx.lineTo(r * 1.9, -r * 0.2);
        ctx.lineTo(r * 0.6, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.5, r * 0.6, r * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
      circle(ctx, r * 0.2, -r * 0.7, 1.8, '#a3ff7a');
      circle(ctx, -r * 0.15, -r * 0.7, 1.8, '#a3ff7a');
      break;
    }
    case 'splitter':
    case 'mite': {
      ctx.strokeStyle = shade(color, -0.5);
      ctx.lineWidth = 1.5;
      for (let i = -1; i <= 1; i++) {
        const lg = Math.sin(t * 14 + i + e.id) * 2;
        ctx.beginPath();
        ctx.moveTo(i * r * 0.5, -r * 0.3); ctx.lineTo(i * r * 0.7 + lg, r * 0.2);
        ctx.stroke();
      }
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.6 + wob * 0.3, r, r * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = shade(color, -0.35);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-r * 0.1, -r * 1.3); ctx.lineTo(-r * 0.1, -r * 0.05);
      ctx.stroke();
      if (e.type === 'splitter') {
        for (const [sx, sy] of [[-0.5, -0.8], [0.4, -0.9], [0.2, -0.4]]) circle(ctx, r * sx, r * sy, 2.2, shade(color, 0.35));
      }
      circle(ctx, r * 0.95, -r * 0.6, r * 0.32, shade(color, -0.4));
      circle(ctx, r * 1.05, -r * 0.7, 1.4, '#ff4d4d');
      break;
    }
    case 'imp': {
      const fl = Math.sin(t * 20 + e.id) * 2;
      ctx.shadowColor = '#ff7f00';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffb347';
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, 0); ctx.quadraticCurveTo(-r, -r, -r * 0.2, -r * 1.9 - fl);
      ctx.quadraticCurveTo(r * 0.1, -r * 1.2, r * 0.4, -r * 1.7 + fl);
      ctx.quadraticCurveTo(r, -r * 0.8, r * 0.7, 0);
      ctx.fill();
      ctx.shadowBlur = 0;
      circle(ctx, 0, -r * 0.6, r * 0.6, color);
      circle(ctx, r * 0.25, -r * 0.7, 1.6, '#fff3b0');
      break;
    }
    case 'gorath':
      drawBoss(ctx, r, color, wob, t);
      break;
    case 'ashlord':
      drawAshLord(ctx, r, color, wob, t);
      break;
    case 'boneking':
      drawBoneKing(ctx, r, color, wob, t);
      break;
    default:
      circle(ctx, 0, -r * 0.6 + wob, r, color);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, -r); ctx.lineTo(-r * 1.4, -r * 1.4); ctx.lineTo(-r * 0.4, -r * 1.3);
      ctx.fill();
      circle(ctx, r * 0.35, -r * 0.75 + wob, r * 0.28, '#fff');
      circle(ctx, r * 0.45, -r * 0.75 + wob, r * 0.14, '#111');
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  if (e.shield > 0) {
    // khiên phép
    ctx.strokeStyle = 'rgba(116,185,255,0.9)';
    ctx.fillStyle = 'rgba(116,185,255,0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -r * 0.7, r * 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  if (e.stunT > 0 && e.stunKind !== 'ice') {
    for (let i = 0; i < 3; i++) {
      const a = t * 6 + (i * Math.PI * 2) / 3;
      drawStar(ctx, Math.cos(a) * r * 0.8, -r * 2 + Math.sin(a) * 3, 3.5, '#f6e58d');
    }
  } else if (e.stunT > 0) {
    ctx.fillStyle = 'rgba(174,233,255,0.45)';
    ctx.strokeStyle = '#e8fbff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.rect(-r * 1.1, -r * 2.1, r * 2.2, r * 2.4);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  if (e.poisonT > 0 && Math.random() < 0.3) {
    circle(ctx, e.x + (Math.random() - 0.5) * r, e.y - lift - r * 1.5, 2, e.dotColor);
  }

  if (e.noBar) return;
  // thanh máu (+ khiên) và dấu tinh anh
  const big = d.boss ? 2.4 : e.type === 'shaman' ? 2.7 : 2;
  const w = Math.max(24, r * 2) * (e.elite ? 1.2 : 1);
  const by = e.y - lift - r * big * (e.elite ? 1.2 : 1) - 6;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(e.x - w / 2 - 1, by - 1, w + 2, 5);
  ctx.fillStyle = e.hp / e.maxHp > 0.4 ? '#2ecc71' : '#e74c3c';
  ctx.fillRect(e.x - w / 2, by, w * Math.max(0, e.hp / e.maxHp), 3);
  if (e.shield > 0) {
    ctx.fillStyle = '#74b9ff';
    ctx.fillRect(e.x - w / 2, by - 3, w * Math.min(1, e.shield / e.maxHp), 2);
  }
  if (e.elite) {
    const m = ELITE_MODS[e.elite];
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = m.color;
    ctx.fillText(m.icon, e.x - w / 2 - 7, by + 4);
  }
}

// Boss Thạch Long: thằn lằn đá khổng lồ, vết nứt dung nham, sừng và gai lưng
function drawBoss(ctx, r, color, wob, t) {
  const glow = 0.6 + Math.sin(t * 4) * 0.3;
  // đuôi
  ctx.fillStyle = shade(color, -0.2);
  ctx.beginPath();
  ctx.moveTo(-r * 0.8, -r * 0.5); ctx.quadraticCurveTo(-r * 1.8, -r * 0.2 + wob, -r * 2.1, -r * 0.9); ctx.lineTo(-r * 0.7, -r * 0.9);
  ctx.fill();
  // chân
  ctx.fillStyle = shade(color, -0.35);
  for (const lx of [-0.55, 0.35]) rrect(ctx, r * lx, -r * 0.4, r * 0.35, r * 0.5, 3, shade(color, -0.35));
  // thân
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.75 + wob * 0.5, r * 1.05, r * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  // gai lưng
  ctx.fillStyle = '#3e2723';
  for (let i = 0; i < 5; i++) {
    const x = -r * 0.7 + i * r * 0.32;
    ctx.beginPath();
    ctx.moveTo(x - 5, -r * 1.3 + wob * 0.5); ctx.lineTo(x, -r * 1.75 + wob * 0.5); ctx.lineTo(x + 5, -r * 1.3 + wob * 0.5);
    ctx.fill();
  }
  // vết nứt dung nham
  ctx.strokeStyle = `rgba(255,140,40,${glow})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-r * 0.5, -r * 1.0); ctx.lineTo(-r * 0.2, -r * 0.7); ctx.lineTo(-r * 0.35, -r * 0.4);
  ctx.moveTo(r * 0.2, -r * 1.1); ctx.lineTo(r * 0.4, -r * 0.75);
  ctx.stroke();
  // đầu
  ctx.fillStyle = shade(color, 0.1);
  ctx.beginPath();
  ctx.ellipse(r * 1.05, -r * 1.05 + wob, r * 0.55, r * 0.42, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ecf0f1';
  ctx.beginPath();
  ctx.moveTo(r * 0.85, -r * 1.35 + wob); ctx.quadraticCurveTo(r * 0.6, -r * 2.1, r * 0.25, -r * 2.05); ctx.lineTo(r * 0.7, -r * 1.3 + wob);
  ctx.fill();
  ctx.shadowColor = '#ff9f43';
  ctx.shadowBlur = 10;
  circle(ctx, r * 1.25, -r * 1.12 + wob, r * 0.1, '#ffbe76');
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#2d1b14';
  ctx.fillRect(r * 1.2, -r * 0.88 + wob, r * 0.35, 2);
}

// Chúa Tể Tro Tàn: thân than đen nứt dung nham, vương miện lửa
function drawAshLord(ctx, r, color, wob, t) {
  const fl = Math.sin(t * 9) * 3;
  ctx.fillStyle = '#2d1b14';
  ctx.beginPath();
  ctx.moveTo(-r, 0); ctx.lineTo(-r * 0.8, -r * 1.4); ctx.lineTo(r * 0.8, -r * 1.4); ctx.lineTo(r, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(255,120,30,${0.7 + Math.sin(t * 5) * 0.3})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-r * 0.5, -r * 1.2); ctx.lineTo(-r * 0.2, -r * 0.6); ctx.lineTo(-r * 0.5, -r * 0.1);
  ctx.moveTo(r * 0.3, -r * 1.3); ctx.lineTo(r * 0.1, -r * 0.7); ctx.lineTo(r * 0.45, -r * 0.2);
  ctx.stroke();
  // vai lửa
  for (const sx of [-1, 1]) {
    ctx.fillStyle = '#ff7f00';
    ctx.beginPath();
    ctx.moveTo(sx * r * 0.7, -r * 1.3);
    ctx.quadraticCurveTo(sx * r * 1.2, -r * 1.8 - fl, sx * r * 0.9, -r * 2.2);
    ctx.quadraticCurveTo(sx * r * 0.6, -r * 1.7, sx * r * 0.4, -r * 1.4);
    ctx.fill();
  }
  circle(ctx, 0, -r * 1.75 + wob * 0.3, r * 0.48, color);
  ctx.shadowColor = '#ffb347';
  ctx.shadowBlur = 12;
  circle(ctx, r * 0.18, -r * 1.8, r * 0.08, '#fff3b0');
  circle(ctx, -r * 0.12, -r * 1.8, r * 0.08, '#fff3b0');
  // vương miện lửa
  ctx.fillStyle = '#ffb347';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * r * 0.16 - 4, -r * 2.15);
    ctx.lineTo(i * r * 0.16, -r * 2.55 - Math.abs(Math.sin(t * 7 + i)) * 6);
    ctx.lineTo(i * r * 0.16 + 4, -r * 2.15);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

// Vua Xương: thân xương trắng, sọ đội vương miện, áo choàng tím
function drawBoneKing(ctx, r, color, wob, t) {
  ctx.fillStyle = '#4b2a5c';
  ctx.beginPath();
  ctx.moveTo(-r * 0.9, 0); ctx.lineTo(-r * 0.6, -r * 1.4); ctx.lineTo(r * 0.6, -r * 1.4); ctx.lineTo(r * 0.9, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, -r * (0.5 + i * 0.22)); ctx.quadraticCurveTo(0, -r * (0.42 + i * 0.22), r * 0.4, -r * (0.5 + i * 0.22));
    ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(0, -r * 1.4); ctx.lineTo(0, -r * 0.3); ctx.stroke();
  // sọ
  circle(ctx, 0, -r * 1.75 + wob * 0.3, r * 0.45, color);
  ctx.fillRect(-r * 0.25, -r * 1.5, r * 0.5, r * 0.25);
  circle(ctx, -r * 0.16, -r * 1.78, r * 0.11, '#1b1b24');
  circle(ctx, r * 0.18, -r * 1.78, r * 0.11, '#1b1b24');
  ctx.shadowColor = '#74b9ff';
  ctx.shadowBlur = 8;
  circle(ctx, -r * 0.16, -r * 1.78, r * 0.05, '#9be7ff');
  circle(ctx, r * 0.18, -r * 1.78, r * 0.05, '#9be7ff');
  ctx.shadowBlur = 0;
  // vương miện
  ctx.fillStyle = '#d4a752';
  ctx.fillRect(-r * 0.42, -r * 2.25, r * 0.84, r * 0.18);
  for (const cx of [-0.3, 0, 0.3]) {
    ctx.beginPath();
    ctx.moveTo(r * cx - 4, -r * 2.25); ctx.lineTo(r * cx, -r * 2.55); ctx.lineTo(r * cx + 4, -r * 2.25);
    ctx.fill();
  }
  // gậy xương
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(r * 0.9, 0); ctx.lineTo(r * 0.9, -r * 2.2); ctx.stroke();
  circle(ctx, r * 0.9, -r * 2.3, r * 0.18, color);
}

// ------------------------------------------------------------
//  BẢN ĐỒ kiểu bản đồ Dota 1 / Warcraft III (vẽ hoàn toàn bằng code)
//  - Góc cổng quỷ: đất chết (giống phe Scourge), cây khô
//  - Phía lâu đài: cỏ xanh (giống phe Sentinel), rừng thông dày
//  - Đường lát đá cuội theo đường đi trong bản thiết kế
// ------------------------------------------------------------
const RIVER = [];   // bản đồ ngang theo thiết kế không có sông
const BLIGHT_CENTER = [10, 150];

function distToPolyline(pts, x, y) {
  if (pts.length < 2) return Infinity;
  let best = Infinity;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const dx = bx - ax, dy = by - ay;
    const tt = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    best = Math.min(best, Math.hypot(ax + dx * tt - x, ay + dy * tt - y));
  }
  return best;
}
const distToPath = (x, y) => distToPolyline(CONFIG.path, x, y);

// 0 = cỏ xanh, 1 = đất chết hoàn toàn
function blightAt(x, y) {
  const d = Math.hypot(x - BLIGHT_CENTER[0], y - BLIGHT_CENTER[1]);
  return Math.max(0, Math.min(1, 1.35 - d / 240));
}

function strokePoly(ctx, pts, w, color, dash) {
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.setLineDash(dash || []);
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  ctx.setLineDash([]);
}

function buildMapCanvas(scale) {
  const c = document.createElement('canvas');
  c.width = Math.round(CONFIG.W * scale);
  c.height = Math.round(CONFIG.H * scale);
  const ctx = c.getContext('2d');
  ctx.scale(scale, scale);
  const W = CONFIG.W, H = CONFIG.H, PW = CONFIG.pathWidth;
  let seed = 23;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // --- nền cỏ kiểu Warcraft: xanh đậm, nhiều mảng sáng tối + đất trống
  ctx.fillStyle = '#3b5426';
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 90; i++) {
    const x = rnd() * W, y = rnd() * H, r = 18 + rnd() * 50;
    const pick = rnd();
    ctx.fillStyle = pick < 0.4 ? 'rgba(86,120,52,0.35)' : pick < 0.8 ? 'rgba(30,48,22,0.35)' : 'rgba(104,86,52,0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.5 + rnd() * 0.4), rnd() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 900; i++) {
    const x = rnd() * W, y = rnd() * H;
    ctx.fillStyle = rnd() < 0.5 ? 'rgba(120,160,70,0.35)' : 'rgba(20,35,15,0.35)';
    ctx.fillRect(x, y, 1.5, 3 + rnd() * 2);
  }

  // --- đất chết quanh cổng quỷ: tím xám, mạch tím, xương
  for (let i = 0; i < 520; i++) {
    const x = rnd() * W, y = rnd() * H * 0.7;
    const b = blightAt(x, y);
    if (b <= 0 || rnd() > b) continue;
    ctx.fillStyle = rnd() < 0.5 ? `rgba(58,44,66,${0.5 * b + 0.2})` : `rgba(78,58,72,${0.45 * b + 0.15})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 10 + rnd() * 26, 7 + rnd() * 16, rnd() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(150,90,170,0.35)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 40; i++) {
    let x = rnd() * 260, y = 40 + rnd() * 260;
    if (blightAt(x, y) < 0.5) continue;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let k = 0; k < 4; k++) { x += (rnd() - 0.5) * 30; y += (rnd() - 0.5) * 30; ctx.lineTo(x, y); }
    ctx.stroke();
  }

  // --- đường lát đá cuội
  strokePoly(ctx, CONFIG.path, PW + 12, 'rgba(0,0,0,0.25)');
  strokePoly(ctx, CONFIG.path, PW + 6, '#5b4a33');
  strokePoly(ctx, CONFIG.path, PW, '#6f665a');
  // từng viên đá
  const stones = [];
  for (let i = 0; i < 4200; i++) {
    const x = rnd() * W, y = rnd() * (H + 40);
    if (distToPath(x, y) > PW / 2 - 3) continue;
    stones.push([x, y, 2.5 + rnd() * 3, rnd()]);
  }
  for (const [x, y, r, v] of stones) {
    rrect(ctx, x - r, y - r * 0.8, r * 2, r * 1.6, 2, v < 0.33 ? '#817968' : v < 0.66 ? '#8e8574' : '#756d5e');
  }
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (const [x, y, r] of stones) ctx.fillRect(x - r + 1, y - r * 0.8 + 1, r, 1);
  // rêu/đất lấn mép đường
  for (let i = 0; i < 300; i++) {
    const x = rnd() * W, y = rnd() * H;
    const d = distToPath(x, y);
    if (d < PW / 2 - 6 || d > PW / 2 + 2) continue;
    ctx.fillStyle = blightAt(x, y) > 0.5 ? 'rgba(70,50,75,0.8)' : 'rgba(60,85,40,0.8)';
    ctx.beginPath();
    ctx.ellipse(x, y, 4 + rnd() * 5, 3, rnd() * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- vật thể: đá, bụi, xương, rừng cây
  const blocked = (x, y, pad) =>
    CONFIG.slots.some(([sx, sy]) => Math.hypot(sx - x, sy - y) < 40 + pad) ||
    distToPath(x, y) < PW / 2 + 10 + pad ||
    (x > 1040 && x < 1200 && y > 380 && y < 560);

  for (let i = 0; i < 70; i++) {
    const x = rnd() * W, y = rnd() * H;
    if (blocked(x, y, 0)) continue;
    const b = blightAt(x, y);
    if (b > 0.5) {
      // xương trên đất chết
      ctx.strokeStyle = '#d8d2c0';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y - 2); ctx.stroke();
      circle(ctx, x + 6, y - 3, 2.5, '#d8d2c0');
    } else if (rnd() < 0.5) {
      circle(ctx, x, y + 2, 5, 'rgba(0,0,0,0.25)');
      circle(ctx, x, y, 5, '#6f6a62');
      circle(ctx, x - 1.5, y - 1.5, 2, '#958f84');
    } else {
      for (let k = 0; k < 3; k++) circle(ctx, x + k * 4 - 4, y + (k % 2) * 2, 2, rnd() < 0.5 ? '#e8d27a' : '#d98fb0');
    }
  }

  // rừng: dày ở mép bản đồ (như viền rừng của bản đồ Dota), thưa ở giữa
  const trees = [];
  for (let i = 0; i < 1500; i++) {
    const x = rnd() * W, y = 20 + rnd() * (H - 20);
    const edge = Math.min(x, W - x, y, H - y);
    const keep = edge < 30 ? 0.9 : 0.22;
    if (rnd() > keep || blocked(x, y, 4)) continue;
    if (trees.some(([tx, ty]) => Math.hypot(tx - x, ty - y) < 15)) continue;
    trees.push([x, y, 11 + rnd() * 6, blightAt(x, y) > 0.55]);
  }
  trees.sort((a, b) => a[1] - b[1]).forEach(([x, y, r, dead]) => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + 4, y + 2, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    if (dead) drawDeadTree(ctx, x, y, r);
    else drawPineTree(ctx, x, y, r);
  });

  drawCastle(ctx);

  // tối viền như sương mù chiến tranh
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
  return c;
}

function drawPineTree(ctx, x, y, r) {
  ctx.fillStyle = '#4a3423';
  ctx.fillRect(x - 1.5, y - 4, 3, 6);
  const layers = [['#173521', 1, 0], ['#1f4529', 0.78, 0.38], ['#2a5a33', 0.55, 0.7]];
  for (const [col, w, k] of layers) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x - r * w, y - 2 - k * r * 1.1);
    ctx.lineTo(x, y - 2 - r * 2.1 + k * r * 0.35);
    ctx.lineTo(x + r * w, y - 2 - k * r * 1.1);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(160,210,120,0.18)';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.3, y - r * 1.1); ctx.lineTo(x, y - r * 1.9); ctx.lineTo(x - r * 0.05, y - r * 1.1);
  ctx.fill();
}

function drawDeadTree(ctx, x, y, r) {
  ctx.strokeStyle = '#3b2c35';
  ctx.lineCap = 'round';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x + 1, y - r * 1.6);
  ctx.stroke();
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x + 1, y - r); ctx.lineTo(x - r * 0.6, y - r * 1.5);
  ctx.moveTo(x + 1, y - r * 1.3); ctx.lineTo(x + r * 0.6, y - r * 1.9);
  ctx.moveTo(x - r * 0.3, y - r * 1.3); ctx.lineTo(x - r * 0.5, y - r * 1.8);
  ctx.stroke();
  ctx.lineCap = 'butt';
}

// Thành phe ánh sáng ở cuối đường: tường đá, cờ xanh, pha lê phát sáng
function drawCastle(ctx) {
  const [cx, end] = CONFIG.path[CONFIG.path.length - 1];
  const base = end + 70, top = end - 40;
  const stone = '#b3ab98', dark = '#7d7666';
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(cx, base, 90, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const sx of [-1, 1]) {
    const tx = cx + sx * 58;
    rrect(ctx, tx - 17, top - 20, 34, base - top + 20, 3, stone);
    ctx.fillStyle = stone;
    for (let i = 0; i < 3; i++) ctx.fillRect(tx - 17 + i * 12.5, top - 29, 9, 10);
    rrect(ctx, tx - 4, top + 4, 8, 14, 4, '#2c2c34');
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(tx - 1, top - 62, 2, 34);
    ctx.fillStyle = '#2e8b57';
    ctx.beginPath();
    ctx.moveTo(tx + 1, top - 62); ctx.lineTo(tx + 20, top - 55); ctx.lineTo(tx + 1, top - 48);
    ctx.fill();
  }
  rrect(ctx, cx - 46, top, 92, base - top, 3, stone);
  ctx.fillStyle = stone;
  for (let i = 0; i < 5; i++) ctx.fillRect(cx - 44 + i * 19, top - 10, 11, 11);
  ctx.strokeStyle = dark;
  ctx.lineWidth = 1;
  for (let y = top + 12; y < base; y += 14) {
    ctx.beginPath(); ctx.moveTo(cx - 46, y); ctx.lineTo(cx + 46, y); ctx.stroke();
  }
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - 46, top, 92, base - top);
  ctx.fillStyle = '#3e2723';
  ctx.beginPath();
  ctx.moveTo(cx - 20, base);
  ctx.lineTo(cx - 20, top + 40);
  ctx.arc(cx, top + 40, 20, Math.PI, 0);
  ctx.lineTo(cx + 20, base);
  ctx.fill();
  ctx.shadowColor = '#7dffb0';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#9dffc4';
  ctx.beginPath();
  ctx.moveTo(cx, top - 32); ctx.lineTo(cx + 7, top - 20); ctx.lineTo(cx, top - 8); ctx.lineTo(cx - 7, top - 20);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
}

// Cổng quỷ phe bóng tối: hai cột đá gai + xoáy tím (vẽ động)
function drawPortal(ctx, t) {
  const [, y] = CONFIG.path[0];
  const x = 16;
  ctx.save();
  ctx.translate(x, y);
  const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 34);
  g.addColorStop(0, 'rgba(230,170,255,0.9)');
  g.addColorStop(0.5, 'rgba(140,60,200,0.55)');
  g.addColorStop(1, 'rgba(60,20,90,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, 20, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `rgba(${190 + i * 20},${90 + i * 40},255,${0.75 - i * 0.2})`;
    ctx.lineWidth = 3 - i * 0.6;
    ctx.beginPath();
    const a = t * (2 + i) + i;
    ctx.ellipse(0, 0, 9 + i * 5, 22 + i * 4, 0, a, a + Math.PI * 1.3);
    ctx.stroke();
  }
  for (const sy of [-1, 1]) {
    ctx.fillStyle = '#2b2230';
    ctx.beginPath();
    ctx.moveTo(-8, sy * 30); ctx.lineTo(8, sy * 30); ctx.lineTo(5, sy * 44); ctx.lineTo(0, sy * 56); ctx.lineTo(-5, sy * 44);
    ctx.closePath();
    ctx.fill();
    circle(ctx, 0, sy * 40, 2.2, `rgba(200,120,255,${0.6 + Math.sin(t * 4) * 0.3})`);
  }
  ctx.restore();
}

// Dấu vị trí đặt tướng (không còn bệ đá):
//  'hero'   vòng mờ dưới chân tướng theo màu hệ
//  'free'   chấm mờ ở ô trống (chỉ hiện khi đang kéo tướng)
//  'target' ô đang chọn / ô sẽ thả
//  'hint'   gợi ý nhấp nháy cho người mới
function drawSpot(ctx, x, y, mode, t, color) {
  ctx.save();
  if (mode === 'hero') {
    ctx.strokeStyle = color || '#d4a752';
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(x, y, 17, 6.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (mode === 'free') {
    ctx.fillStyle = 'rgba(157,255,196,0.18)';
    ctx.strokeStyle = 'rgba(157,255,196,0.55)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.ellipse(x, y, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (mode === 'target') {
    const k = 0.75 + Math.sin(t * 6) * 0.25;
    ctx.fillStyle = `rgba(246,231,176,${0.25 * k})`;
    ctx.strokeStyle = '#f6e7b0';
    ctx.shadowColor = '#f1c40f';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(x, y, 21, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (mode === 'hint') {
    const k = (t * 1.2) % 1;
    ctx.strokeStyle = `rgba(241,196,15,${1 - k})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y, 14 + k * 26, 6 + k * 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(241,196,15,0.25)';
    ctx.beginPath();
    ctx.ellipse(x, y, 16, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
