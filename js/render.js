'use strict';

// ============================================================
//  VẼ: bản đồ (theo bản thiết kế), tướng (hình vector chia khớp
//  từ "Đền Anh Hùng" + đồ mặc vẽ chồng lên để đổi hình dạng),
//  quân Thủy Tinh và boss. Hình vector nằm trong js/art.js (ART).
// ============================================================

function shade(hex, pct) {
  const n = parseInt(hex.slice(1, 7), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + (pct < 0 ? c : 255 - c) * pct)));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
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

// ------------------------------------------------------------
//  ẢNH TỪ SVG (ART) — chuyển chuỗi SVG thành ảnh, lưu đệm
// ------------------------------------------------------------
const HAS_ART = typeof ART !== 'undefined';
const svgCache = new Map();
function svgUrl(svg) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
// Đặt lại kích thước điểm ảnh cho một chuỗi <svg ...> đầy đủ
function sizedSvg(svg, w, h) {
  return svg.replace(/<svg\b([^>]*)>/, (m, attrs) => {
    const a = attrs.replace(/\s(width|height)="[^"]*"/g, '');
    return `<svg${a} width="${Math.round(w)}" height="${Math.round(h)}" preserveAspectRatio="xMidYMid meet">`;
  });
}
function svgImage(key, svg) {
  let img = svgCache.get(key);
  if (!img) {
    img = new Image();
    img.decoding = 'async';
    img.src = svgUrl(svg);
    svgCache.set(key, img);
  }
  return img;
}
const ready = (img) => img && img.complete && img.naturalWidth > 0;

// ------------------------------------------------------------
//  ẢNH VẼ TAY (AI) TRONG THƯ MỤC assets/ — đặt đúng tên file theo
//  docs/ASSETS.md là game tự dùng; chưa có ảnh thì dùng hình vector.
//  Ảnh được thử tải khi cần lần đầu (không cần danh sách trước).
// ------------------------------------------------------------
const ASSET_ROOT = 'assets/';
const assetMap = new Map();      // đường dẫn -> { img, ok: null | true | false }
let assetVersion = 0;            // tăng mỗi khi có ảnh mới tải xong (để giao diện vẽ lại)
let useAssets = true;
function asset(path) {
  if (!useAssets) return null;
  let a = assetMap.get(path);
  if (!a) {
    a = { img: new Image(), ok: null };
    a.img.onload = () => { a.ok = true; assetVersion++; };
    a.img.onerror = () => { a.ok = false; };
    a.img.src = ASSET_ROOT + path;
    assetMap.set(path, a);
  }
  return a.ok ? a.img : null;
}
const assetUrl = (path) => (asset(path) ? ASSET_ROOT + path : '');
// mã tướng / quái theo tài liệu prompt (H01..H16, E01..E08, B01..B03)
const HERO_CODE = { lactuong: 'h01', lucsi: 'h02', xathu: 'h03', thosan: 'h04', thaymo: 'h05', thansuong: 'h06',
  giong: 'h07', llq: 'h08', kimquy: 'h09', thachsanh: 'h10', auco: 'h11', caolo: 'h12', antiem: 'h13',
  cdt: 'h14', tiendung: 'h15', langlieu: 'h16' };
const ENEMY_CODE = { tom: 'E01', casau: 'E02', rua: 'E03', phuthuy: 'E04', chimbao: 'E05', echme: 'E06',
  nongnoc: 'E07', giaolong: 'E08', thuongluong: 'B01', haba: 'B02', thuytinh: 'B03' };
// tên file đồ theo tài liệu (còn lại: mã đồ đổi "_" thành "-")
const ITEM_FILE = { no_tre: 'no', gay_mo: 'gay-thay-mo', mu_long_chim: 'mulong-chim', song_riu: 'song-riu-cuong-no',
  ngua_hong_mao: 'ngua-chin-hong-mao' };
// A = splash, B = chân dung, C = sprite trong trận, D = sprite lúc đánh / tung chiêu
const heroPng = (type, v) => asset(`heroes/hero_${HERO_CODE[type]}_${v}.png`);
const enemyPng = (type, elite) => {
  const c = ENEMY_CODE[type];
  if (!c) return null;
  return (elite && asset(`${c[0] === 'B' ? 'bosses' : 'enemies'}/${c}_elite_B.png`)) || asset(`${c[0] === 'B' ? 'bosses' : 'enemies'}/${c}.png`);
};
const itemPngPath = (id) => `items/${ITEM_FILE[id] || id.replace(/_/g, '-')}.png`;
const skillPngPath = (type, i) => `skills/${HERO_CODE[type]}_${SKILL_KEYS[i]}.png`;
const SCENE_FILE = { menu: 'key-art-menu.png', story1: 'scenes/story-1.png', story2: 'scenes/story-2.png', story3: 'scenes/story-3.png',
  win: 'scenes/victory-bg.png', lose: 'scenes/defeat-bg.png', mountain1: 'scenes/mountain-1.png', mountain2: 'scenes/mountain-2.png',
  mountain3: 'scenes/mountain-3.png', mountain4: 'scenes/mountain-4.png', mountain5: 'scenes/mountain-5.png',
  voi: 'items/voi-chin-nga.png', ga: 'items/ga-chin-cua.png', ngua: 'items/ngua-chin-hong-mao.png', hubau: 'items/hu-bau.png' };
// Hiệu ứng: dải khung hình nằm ngang, mỗi khung vuông (rộng = cao)
const VFX_FILE = { pillar: 'fire-pillar', explosion: 'fire-burst', nova: 'ice-ring', snow: 'freeze', wave: 'water-wave',
  bolt: 'lightning', xslash: 'slash-gold', slash: 'slash-gold', claw: 'slash-gold', heal: 'heal', dome: 'shield-gold',
  rockfall: 'rocks', cracks: 'rocks', drop: 'coins', notes: 'music-notes', summon: 'spawn-ring', die: 'dust',
  bash: 'hit-spark', floodrise: 'flood-rise', raise: 'mountain-rise' };
function vfxSheet(type) {
  const f = VFX_FILE[type];
  return f ? asset(`vfx/${f}.png`) : null;
}
// vẽ một khung của dải hiệu ứng theo tiến độ p (0..1), tâm (x, y), cạnh size
function drawVfx(ctx, img, p, x, y, size) {
  const n = Math.max(1, Math.round(img.naturalWidth / img.naturalHeight));
  const fr = Math.min(n - 1, Math.floor(p * n));
  const fw = img.naturalWidth / n;
  ctx.drawImage(img, fr * fw, 0, fw, img.naturalHeight, x - size / 2, y - size / 2, size, size);
}

// ------------------------------------------------------------
//  BẢN ĐỒ
// ------------------------------------------------------------
let mapImgKey = '';
function mapImage(pw, ph, level) {
  const png = asset(`maps/map-0${(level || 0) + 1}.png`);
  if (png) return png;
  if (!HAS_ART) return null;
  const key = `map|${pw}x${ph}`;
  mapImgKey = key;
  return svgCache.get(key) || svgImage(key, sizedSvg(ART.map, pw, ph));
}

// Vẽ nền dự phòng khi chưa có ảnh: cỏ + sông theo đường đi
function drawMapFallback(ctx) {
  ctx.fillStyle = '#3A5A28';
  ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);
  strokePath(ctx, CONFIG.path, 104 * DK, 'rgba(44,106,134,0.5)');
  strokePath(ctx, CONFIG.path, 54 * DK, '#8A7650');
  strokePath(ctx, CONFIG.path, 42 * DK, '#1F5670');
}

function strokePath(ctx, pts, w, color, dash) {
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  if (dash) ctx.setLineDash([]);
}

// Mực nước: dải nước tràn hai bờ rộng dần theo số bậc đã ngập
function drawWaterLevel(ctx, water, t) {
  if (water <= 0) return;
  const w = (104 + water * 70) * DK;
  ctx.save();
  ctx.globalAlpha = 0.28 + Math.sin(t * 1.5) * 0.03;
  strokePath(ctx, CONFIG.path, w, '#2C6A86');
  ctx.globalAlpha = 0.35;
  strokePath(ctx, CONFIG.path, w, 'rgba(158,221,242,0.5)', [6, 18]);
  ctx.restore();
}

// Ô đặt tướng theo bản thiết kế: ellipse 15×10 (tọa độ thiết kế)
// state: dry | flooded | raised | target | free | hint | soon
function drawSpot(ctx, x, y, o, t) {
  const rx = 15 * DK, ry = 10 * DK;
  const tile = asset(o.flooded ? 'tiles/tile-flooded.png' : o.raised || o.tier === 2 ? 'tiles/tile-high.png' : o.tier === 1 ? 'tiles/tile-mid.png' : 'tiles/tile-low.png');
  if (tile) {
    // ô vẽ tay: ảnh vuông, vẽ phẳng theo phối cảnh ô (rộng 2.4 × bán kính)
    ctx.drawImage(tile, x - rx * 1.25, y - ry * 1.25, rx * 2.5, ry * 2.5);
    o = { ...o, tileArt: true };
  }
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (o.tileArt) {
    // đã có ảnh ô
  } else if (o.flooded) {
    ctx.fillStyle = 'rgba(44,106,134,0.85)';
    ctx.fill();
    ctx.setLineDash([3 * DK, 3 * DK]);
    ctx.strokeStyle = '#9EDDF2';
    ctx.lineWidth = 1.5 * DK;
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (o.raised) {
    ctx.fillStyle = '#A07E48';
    ctx.fill();
    ctx.strokeStyle = '#F2D27A';
    ctx.lineWidth = 2 * DK;
    ctx.stroke();
    if (!o.hero) {
      ctx.strokeStyle = '#3A2A12';
      ctx.lineWidth = 1.5 * DK;
      ctx.beginPath();
      ctx.moveTo(x - 7 * DK, y + 1 * DK); ctx.lineTo(x, y - 5 * DK); ctx.lineTo(x + 7 * DK, y + 1 * DK);
      ctx.stroke();
    }
  } else if (o.tier === 2) {
    ctx.fillStyle = '#8C7A5A';
    ctx.fill();
    ctx.strokeStyle = '#C8B48A';
    ctx.lineWidth = 1.5 * DK;
    ctx.stroke();
  } else {
    ctx.fillStyle = o.tier === 0 ? '#4F7240' : '#5C7A3A';
    ctx.fill();
    ctx.strokeStyle = o.tier === 0 ? '#9CC6A8' : '#A9C27A';
    ctx.lineWidth = 1.5 * DK;
    ctx.stroke();
  }
  // sắp ngập: nhấp nháy xanh
  if (o.soon && !o.flooded && !o.raised) {
    ctx.globalAlpha = 0.45 + Math.sin(t * 7) * 0.4;
    ctx.fillStyle = 'rgba(90,180,214,0.6)';
    ctx.fill();
    ctx.strokeStyle = '#9EDDF2';
    ctx.lineWidth = 2.5 * DK;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (o.mode === 'target' || o.mode === 'raise') {
    const g = ctx.createRadialGradient(x, y, 2, x, y, rx * 2);
    g.addColorStop(0, 'rgba(255,214,107,0.55)');
    g.addColorStop(1, 'rgba(255,214,107,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, rx * 2, ry * 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFD66B';
    ctx.lineWidth = 2.5 * DK;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1.5 * DK;
    ctx.setLineDash([4 * DK, 4 * DK]);
    ctx.lineDashOffset = -t * 20;
    ctx.beginPath();
    ctx.ellipse(x, y, 22 * DK, 14 * DK, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (o.mode === 'free') {
    ctx.globalAlpha = 0.5 + Math.sin(t * 5) * 0.3;
    ctx.strokeStyle = '#FFF1C4';
    ctx.lineWidth = 2 * DK;
    ctx.stroke();
    ctx.globalAlpha = 1;
  } else if (o.mode === 'hint') {
    ctx.strokeStyle = '#FFD66B';
    ctx.lineWidth = 2 * DK;
    ctx.globalAlpha = 0.5 + Math.sin(t * 5) * 0.4;
    ctx.beginPath();
    ctx.ellipse(x, y, rx + 4 + Math.sin(t * 5) * 3, ry + 3 + Math.sin(t * 5) * 2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  } else if (o.mode === 'sel') {
    ctx.strokeStyle = '#3EDC4E';
    ctx.lineWidth = 2.5 * DK;
    ctx.beginPath();
    ctx.ellipse(x, y, 21 * DK, 9 * DK, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// ------------------------------------------------------------
//  NGOẠI HÌNH TƯỚNG: hình gốc + trang bị + bậc tiến hoá + bộ đồ
// ------------------------------------------------------------
function computeLook(h) {
  const def = HEROES[h.type];
  const base = def.look;
  const look = {
    helmet: null, armor: null, weapon: null,
    tier: h.tier || 0, aura: null, wings: null, bulk: (base.bulk || 1) * (1 + (h.grow || 0) * 0.025),
  };
  for (const slot of GEAR_SLOTS) {
    const inst = h.equip[slot];
    if (inst) look[slot] = { ...ITEMS[inst.id].look, plus: inst.plus, rarity: inst.rarity };
  }
  if (look.tier >= 1) look.aura = base.aura;
  for (const slot of ACC_SLOTS) {
    const inst = h.equip[slot];
    const it = inst && ITEMS[inst.id];
    if (it && it.look && it.look.aura) look.aura = it.look.aura;
  }
  for (const set of activeSets(h.equip)) Object.assign(look, SETS[set].look);
  return look;
}

// ------------------------------------------------------------
//  TƯỚNG: các phần SVG (sau lưng, chân, tay sau, thân, đầu, tay trước,
//  vũ khí) trong khung 200×230, chân tại (100, 222)
// ------------------------------------------------------------
const HERO_VB = [-60, -50, 320, 300];   // khung vẽ rộng hơn để chứa vũ khí, cánh
const HERO_PARTS = ['back', 'legs', 'armB', 'body', 'head', 'armF', 'weapon'];

function heroPartImage(type, part, q) {
  if (!HAS_ART || !ART.hero[type]) return null;
  const a = ART.hero[type];
  if (!a[part]) return null;
  const [vx, vy, vw, vh] = HERO_VB;
  const key = `h|${type}|${part}|${q}`;
  let img = svgCache.get(key);
  if (!img) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" width="${Math.round(vw * q)}" height="${Math.round(vh * q)}">${a.defs || ''}${a[part]}</svg>`;
    img = svgImage(key, svg);
  }
  return img;
}
// chất lượng ảnh theo kích thước vẽ thực tế
function heroQ(px) {
  return px > 0.9 ? 1.2 : px > 0.45 ? 0.6 : 0.36;
}

function drawPart(ctx, img) {
  if (!ready(img)) return false;
  const [vx, vy, vw, vh] = HERO_VB;
  ctx.drawImage(img, vx, vy, vw, vh);
  return true;
}

// Vẽ tướng. o: { t, dir, scale, swing, castT, castUlt, hurt, bog, fall, summon, attack, px, noShadow }
// o.px = số điểm ảnh màn hình trên 1 đơn vị khung 200×230 (chọn độ nét ảnh)
function drawHeroSprite(ctx, h, x, y, o = {}) {
  const def = HEROES[h.type];
  const look = o.look || computeLook(h);
  const t = o.t || 0;
  const dir = o.dir || 1;
  const s = (o.scale || 0.26) * (1 + look.tier * 0.08) * look.bulk;
  const q = heroQ((o.px || 1) * s);
  const seed = (h.id || 0) * 1.7;
  const breathe = Math.sin(t * 2.85 + seed) * 3;
  const headRot = Math.sin(t * 1.9 + seed) * 0.05;
  const backRot = Math.sin(t * 2.2 + seed) * 0.07;
  // vung đòn / bắn / phép
  const u = 1 - (o.swing || 0);
  let armF = 0, armB = 0, lunge = 0, lift = 0, recoil = 0, big = 1;
  if (o.castT > 0) {
    const k = Math.min(1, o.castT / 0.3);
    armF = -2.0 * k; armB = 2.0 * k; lift = -6 * k;
    if (o.castUlt) big = 1 + 0.14 * Math.min(1, o.castT / 0.4);
  } else if (o.swing > 0) {
    if (def.attack === 'melee') {
      armF = u < 0.6 ? -1.4 * Math.sin((Math.PI * u) / 0.6) : 0.5 * Math.sin((Math.PI * (u - 0.6)) / 0.4);
      lunge = 16 * Math.sin(Math.PI * u);
    } else if (def.attack === 'arrow') {
      recoil = -9 * Math.sin(Math.PI * u);
    } else {
      armF = -1.0 * Math.sin(Math.PI * u); lift = -4 * Math.sin(Math.PI * u);
    }
  }
  let drop = 0, fallRot = 0, alpha = o.alpha ?? 1;
  if (o.summon > 0) drop = -60 * (o.summon / 0.5) * (o.summon / 0.5);
  if (o.fall !== undefined) { fallRot = (1 - o.fall / 0.6) * 1.45; alpha *= Math.max(0.15, o.fall / 0.6); }
  const sink = o.bog ? 10 : 0;
  const hurtX = o.hurt > 0 ? -6 * (o.hurt / 0.2) : 0;

  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  // bóng + hào quang trống đồng
  if (!o.noShadow) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 13 * DK * (s / 0.28), 4 * DK * (s / 0.28), 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (look.aura) drawDrumAura(ctx, look.aura, s, t, look.tier);
  ctx.scale(dir * s * big, s * big);
  ctx.translate(-100 + (lunge + recoil + hurtX), -222 + drop + sink);
  if (fallRot) { ctx.translate(100, 222); ctx.rotate(fallRot); ctx.translate(-100, -222); }

  // ảnh vẽ tay: chân ở giữa đáy ảnh. Ảnh phẳng không thay được từng món đồ,
  // nên đồ mặc hiện qua hào quang, cánh rồng và sao tiến hoá.
  const png = !o.vector && (((o.castT > 0 || o.swing > 0.5) && heroPng(h.type, 'D')) || heroPng(h.type, 'C'));
  if (png) {
    if (look.wings) withProc(ctx, () => drawWings(ctx, look.wings, t));
    const hgt = 236, w = hgt * png.naturalWidth / png.naturalHeight;
    ctx.translate(100, 222);
    ctx.scale(1 + Math.sin(t * 2.85 + seed) * 0.012, 1 - Math.sin(t * 2.85 + seed) * 0.018 + lift * -0.004);
    ctx.drawImage(png, -w / 2, -hgt, w, hgt);
    ctx.restore();
    if (o.bog) drawBogWater(ctx, x, y, s, t);
    return { top: y - 240 * s * big, s };
  }
  const P = (part) => heroPartImage(h.type, part, q);
  const hasArt = !!P('body');
  // sau lưng: áo choàng, cánh
  if (look.wings) withProc(ctx, () => drawWings(ctx, look.wings, t));
  if (look.armor && look.armor.cape) withProc(ctx, () => drawCape(ctx, look.armor.cape, t));
  ctx.save();
  ctx.translate(100, 120); ctx.rotate(backRot); ctx.translate(-100, -120);
  drawPart(ctx, P('back'));
  ctx.restore();
  if (!hasArt) {
    drawFallbackHero(ctx, def, look);
  } else {
    drawPart(ctx, P('legs'));
    ctx.save();
    ctx.translate(0, breathe + lift);
    // tay sau
    ctx.save(); ctx.translate(78, 124); ctx.rotate(armB); ctx.translate(-78, -124);
    drawPart(ctx, P('armB'));
    ctx.restore();
    drawPart(ctx, P('body'));
    if (look.armor) withProc(ctx, () => drawArmor(ctx, look.armor));
    // đầu
    ctx.save(); ctx.translate(100, 110); ctx.rotate(headRot); ctx.translate(-100, -110);
    drawPart(ctx, P('head'));
    if (look.helmet) withProc(ctx, () => drawHelmet(ctx, look.helmet));
    ctx.restore();
    // tay trước + vũ khí
    ctx.save(); ctx.translate(122, 124); ctx.rotate(armF); ctx.translate(-122, -124);
    drawPart(ctx, P('armF'));
    if (look.weapon) withProc(ctx, () => drawWeapon(ctx, look.weapon, 0, t));
    else drawPart(ctx, P('weapon'));
    ctx.restore();
    ctx.restore();
  }
  ctx.restore();

  // sa lầy: nước dâng quanh chân
  if (o.bog) drawBogWater(ctx, x, y, s, t);
  return { top: y - 240 * s * big, s };
}

// chuyển sang hệ tọa độ vẽ đồ cũ (đầu tại (0,-34) bán kính 8) trong khung 200×230
function withProc(ctx, fn) {
  ctx.save();
  ctx.translate(100, 211.5);
  ctx.scale(3.75, 3.75);
  fn();
  ctx.restore();
}

// Hào quang hoa văn trống đồng dưới chân (tiến hoá / đồ ghép)
function drawDrumAura(ctx, color, s, t, tier) {
  const k = s / 0.28;
  const rx = 24 * DK * k, ry = 8 * DK * k;
  ctx.save();
  ctx.globalAlpha *= 0.55 + Math.sin(t * 3) * 0.15;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 2 + Math.min(1, tier); i++) {
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * (1 - i * 0.28), ry * (1 - i * 0.28), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = color;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + t * 0.6;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * rx * 0.86, Math.sin(a) * ry * 0.86, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  const g = ctx.createRadialGradient(0, -30 * k, 2, 0, -30 * k, 40 * k);
  g.addColorStop(0, color + '00');
  g.addColorStop(0.7, color + '33');
  g.addColorStop(1, color + '00');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, -30 * k, 40 * k, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBogWater(ctx, x, y, s, t) {
  const k = s / 0.28;
  ctx.save();
  ctx.fillStyle = 'rgba(44,106,134,0.75)';
  ctx.beginPath();
  ctx.ellipse(x, y - 2, 17 * DK * k, 7 * DK * k, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#9EDDF2';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 2; i++) {
    const p = (t * 0.8 + i * 0.5) % 1;
    ctx.globalAlpha = 1 - p;
    ctx.beginPath();
    ctx.ellipse(x, y - 2, (12 + p * 14) * DK * k, (5 + p * 5) * DK * k, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// Hình dự phòng khi chưa có ảnh vector
function drawFallbackHero(ctx, def, look) {
  const c = def.color || '#C8A040';
  ctx.fillStyle = '#2A1608';
  ctx.fillRect(84, 178, 13, 42); ctx.fillRect(103, 178, 13, 42);
  rrect(ctx, 70, 116, 60, 70, 14, c);
  circle(ctx, 100, 84, 30, '#E8B98C');
  if (look.helmet) withProc(ctx, () => drawHelmet(ctx, look.helmet));
  if (look.weapon) withProc(ctx, () => drawWeapon(ctx, look.weapon, 0, 0));
}

// ------------------------------------------------------------
//  ĐỒ MẶC VẼ CHỒNG (tọa độ cũ: chân tại (0,0), đầu (0,-34) r=8)
// ------------------------------------------------------------
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
  ctx.strokeStyle = '#2A1608';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(-7, -27);
  ctx.lineTo(6, -27);
  ctx.lineTo(9 + wave * 0.3, -1);
  ctx.lineTo(-12 + wave, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function outline(ctx) {
  ctx.strokeStyle = '#2A1608';
  ctx.lineWidth = 0.6;
  ctx.stroke();
}

function drawArmor(ctx, a) {
  if (a.type === 'leather') {
    ctx.fillStyle = a.color;
    ctx.beginPath();
    ctx.moveTo(-8, -25); ctx.lineTo(8, -25); ctx.lineTo(9, -9); ctx.lineTo(-9, -9);
    ctx.closePath();
    ctx.fill(); outline(ctx);
    ctx.strokeStyle = shade(a.color, -0.35);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-6, -25); ctx.lineTo(6, -12);
    ctx.stroke();
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(-9, -12.5, 18, 2.6);
    ctx.fillStyle = '#E0B030';
    ctx.fillRect(-1.5, -12.5, 3, 2.6);
  } else if (a.type === 'plate') {
    ctx.fillStyle = a.color;
    ctx.beginPath();
    ctx.moveTo(-9, -26); ctx.quadraticCurveTo(0, -29, 9, -26); ctx.lineTo(10, -9); ctx.quadraticCurveTo(0, -6, -10, -9);
    ctx.closePath();
    ctx.fill(); outline(ctx);
    // hoa văn trống đồng
    ctx.strokeStyle = shade(a.color, 0.45);
    ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.arc(0, -18, 4.2, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -18, 2, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < 6; i++) { ctx.lineTo(-7 + i * 2.8, -11 + (i % 2) * 1.6); }
    ctx.stroke();
    circle(ctx, -8.5, -25, 3.6, shade(a.color, -0.15));
    circle(ctx, 8.5, -25, 3.6, shade(a.color, -0.15));
  } else if (a.type === 'robe') {
    ctx.fillStyle = a.color;
    ctx.beginPath();
    ctx.moveTo(-8, -27); ctx.lineTo(8, -27); ctx.lineTo(11, -1); ctx.lineTo(-11, -1);
    ctx.closePath();
    ctx.fill(); outline(ctx);
    ctx.strokeStyle = a.trim || shade(a.color, 0.4);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, -26); ctx.lineTo(0, -2);
    for (let i = 0; i < 6; i++) ctx.lineTo(-10 + i * 4, -3 - (i % 2) * 2);
    ctx.stroke();
  }
  if (a.plus >= 5) {
    ctx.fillStyle = '#FFD66B';
    drawStar(ctx, 0, -18, 1.6, '#FFF1C4');
  }
}

function drawHelmet(ctx, h) {
  switch (h.type) {
    case 'feather':
      ctx.fillStyle = '#C8A040';
      ctx.fillRect(-8.6, -39, 17.2, 3.2);
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.translate(-4 + i * 2, -39);
        ctx.rotate(-0.5 + i * 0.25);
        ctx.fillStyle = i % 2 ? '#F2E6C8' : h.color;
        ctx.beginPath();
        ctx.ellipse(0, -6, 1.6, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      break;
    case 'helm':
    case 'horned': {
      ctx.fillStyle = h.color;
      ctx.beginPath();
      ctx.arc(0, -36, 9.4, Math.PI, 0);
      ctx.lineTo(9.4, -33); ctx.lineTo(-9.4, -33);
      ctx.closePath();
      ctx.fill(); outline(ctx);
      ctx.strokeStyle = shade(h.color, 0.4);
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.arc(0, -36, 6.5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      if (h.plume) {
        ctx.fillStyle = h.plume;
        ctx.beginPath();
        ctx.ellipse(-3, -47, 6, 2.6, -0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      if (h.type === 'horned') {
        ctx.fillStyle = '#F2E6C8';
        for (const sx of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(sx * 6, -41);
          ctx.quadraticCurveTo(sx * 16, -44, sx * 15, -55);
          ctx.quadraticCurveTo(sx * 11, -46, sx * 3, -43);
          ctx.fill(); outline(ctx);
        }
      }
      break;
    }
    case 'wizard':
      ctx.fillStyle = h.color;
      ctx.beginPath();
      ctx.ellipse(0, -40, 13, 3.2, 0, 0, Math.PI * 2);
      ctx.fill(); outline(ctx);
      ctx.beginPath();
      ctx.moveTo(-8, -41); ctx.lineTo(8, -41);
      ctx.quadraticCurveTo(2, -52, -10, -62);
      ctx.closePath();
      ctx.fill(); outline(ctx);
      drawStar(ctx, 0, -48, 2.8, '#F2D27A');
      break;
    case 'crown':
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
  if (!w || w.type === 'none') return;
  ctx.save();
  ctx.translate(9.5, -13);
  if (w.glow) {
    ctx.shadowColor = w.glow;
    ctx.shadowBlur = 10 + Math.sin(t * 6) * 4;
  }
  switch (w.type) {
    case 'cleaver':
      ctx.rotate(-0.4 + swing * 2.2);
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(-1.5, -8, 3, 13);
      ctx.fillStyle = w.color;
      ctx.beginPath();
      ctx.moveTo(-2, -8); ctx.lineTo(-2, -30); ctx.lineTo(10, -30); ctx.lineTo(12, -12); ctx.lineTo(6, -8);
      ctx.closePath();
      ctx.fill(); outline(ctx);
      break;
    case 'daggers':
      for (const [ox, oy, rot] of [[-15, 3, 0.4], [0, 0, -0.4]]) {
        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(rot + swing * 1.8);
        ctx.fillStyle = w.color;
        ctx.beginPath();
        ctx.moveTo(-1.5, -2); ctx.lineTo(-1.5, -14); ctx.lineTo(0, -18); ctx.lineTo(1.5, -14); ctx.lineTo(1.5, -2);
        ctx.fill(); outline(ctx);
        ctx.fillStyle = '#B8853A';
        ctx.fillRect(-4, -3, 8, 2);
        ctx.restore();
      }
      break;
    case 'axe':
    case 'greataxe': {
      const big = w.type === 'greataxe' ? 1.35 : 1;
      ctx.rotate(-0.4 + swing * 2.2);
      ctx.scale(big, big);
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(-1.2, -26, 2.4, 31);
      ctx.fillStyle = w.color;
      ctx.beginPath();
      ctx.moveTo(1, -27);
      ctx.quadraticCurveTo(15, -29, 13, -15);
      ctx.quadraticCurveTo(8, -19, 1, -17);
      ctx.closePath();
      ctx.fill(); outline(ctx);
      if (big > 1) {
        ctx.beginPath();
        ctx.moveTo(-1, -27); ctx.quadraticCurveTo(-13, -29, -11, -17); ctx.quadraticCurveTo(-7, -19, -1, -18);
        ctx.closePath();
        ctx.fill(); outline(ctx);
      }
      break;
    }
    case 'crossbow':
      ctx.rotate(-0.2);
      ctx.fillStyle = w.color;
      ctx.fillRect(-4, -2.5, 18, 3.4);
      ctx.strokeStyle = shade(w.color, -0.3);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(11, -1, 8, -1.3, 1.3);
      ctx.stroke();
      ctx.strokeStyle = '#F2E6C8';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(11 + Math.cos(-1.3) * 8, -1 + Math.sin(-1.3) * 8);
      ctx.lineTo(3 - swing * 3, -1);
      ctx.lineTo(11 + Math.cos(1.3) * 8, -1 + Math.sin(1.3) * 8);
      ctx.stroke();
      break;
    case 'staff':
      ctx.rotate(-0.15 + swing * 0.4);
      ctx.fillStyle = w.color;
      ctx.fillRect(-1.3, -30, 2.6, 38);
      if (w.orb) {
        circle(ctx, 0, -33, 4.8 + swing * 1.5, w.orb);
        circle(ctx, -1.3, -34.5, 1.4, 'rgba(255,255,255,0.8)');
      }
      break;
  }
  ctx.restore();
}

// ------------------------------------------------------------
//  QUÂN THỦY TINH — ảnh vector + chuyển động, trạng thái
// ------------------------------------------------------------
// chiều rộng vẽ (đơn vị logic) cho từng loại
const ENEMY_W = {
  tom: 30, casau: 74, rua: 58, phuthuy: 46, chimbao: 56, echme: 50, nongnoc: 20, giaolong: 56,
  thuongluong: 150, haba: 104, thuytinh: 104,
};
function enemyArt(type) {
  if (!HAS_ART) return null;
  return ART.enemy[type] || ART.boss[type] || null;
}
function enemyImage(type, px) {
  const a = enemyArt(type);
  if (!a) return null;
  const w = ENEMY_W[type] || 40;
  const q = px > 2.2 ? 3 : px > 1.2 ? 2 : 1.25;
  const pw = w * q, ph = (w * a.h / a.w) * q;
  return svgImage(`e|${type}|${q}`, sizedSvg(a.svg, pw, ph));
}

// Kích thước vẽ của một con quái (để đặt thanh máu, chọn hiệu ứng)
function enemyBox(e) {
  const a = enemyArt(e.type);
  const k = (e.champion ? 1.5 : 1) * (e.elite ? 1.15 : 1);
  const w = (ENEMY_W[e.type] || 40) * k;
  const h = a ? w * a.h / a.w : w * 0.8;
  const ay = a ? (a.ay / a.h) * h : h;
  return { w, h, ay, k };
}

function drawEnemy(ctx, e, t, o = {}) {
  const d = e.def;
  const box = enemyBox(e);
  const a = enemyArt(e.type);
  const lift = d.flying && !o.icon ? 24 + Math.sin(t * 5 + e.id) * 3 : 0;
  const bob = Math.sin(t * 9 + e.id) * 1.5;
  const wig = Math.sin(t * 7 + e.id) * 0.04;
  ctx.save();
  ctx.translate(e.x, e.y);
  if (!o.icon) {
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.beginPath();
    ctx.ellipse(0, 2, box.w * 0.36, box.w * 0.1 + 2, 0, 0, Math.PI * 2);
    ctx.fill();
    // gợn nước quanh quái bơi
    if (!d.flying) {
      ctx.strokeStyle = 'rgba(191,232,245,0.45)';
      ctx.lineWidth = 1.2;
      const p = (t * 1.2 + e.id * 0.3) % 1;
      ctx.globalAlpha = 1 - p;
      ctx.beginPath();
      ctx.ellipse(0, 2, box.w * (0.3 + p * 0.25), box.w * (0.08 + p * 0.06), 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (e.elite) {
      ctx.strokeStyle = ELITE_MODS[e.elite].color;
      ctx.lineWidth = 2.2;
      ctx.globalAlpha = 0.6 + Math.sin(t * 6) * 0.3;
      ctx.beginPath();
      ctx.ellipse(0, 2, box.w * 0.55, box.w * 0.18, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (d.burnAura) {
      // Thủy Tinh: mưa gió quanh mình
      ctx.fillStyle = `rgba(90,180,214,${0.12 + Math.sin(t * 4) * 0.04})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, d.burnAura.radius, d.burnAura.radius * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(191,232,245,0.5)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 14; i++) {
        const rx = ((i * 53 + t * 40) % (d.burnAura.radius * 2)) - d.burnAura.radius;
        const ry = (((i * 31) % 60) - 30) + ((t * 260 + i * 40) % 80) - 60;
        ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 4, ry + 12); ctx.stroke();
      }
    }
  }
  // Hà Bá lặn xuống
  let sinkK = 0;
  if (e.reviveT > 0) {
    const dl = d.reincarnate.delay;
    const p = 1 - e.reviveT / dl;
    sinkK = p < 0.5 ? p * 2 : (1 - p) * 2;
    for (let i = 0; i < 3; i++) {
      const q = (t * 1.5 + i / 3) % 1;
      ctx.strokeStyle = `rgba(158,221,242,${1 - q})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, box.w * (0.3 + q * 0.6), box.w * (0.1 + q * 0.2), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.translate(0, -lift + bob * (d.flying ? 1.5 : 0.6) + sinkK * box.h * 0.8);
  if (sinkK > 0) {
    ctx.beginPath();
    ctx.rect(-box.w, -box.h * 2, box.w * 2, box.h * 2 - sinkK * box.h * 0.8 + 4);
    ctx.clip();
  }
  ctx.rotate(wig * (d.flying ? 2 : 1));
  const flip = e.dir < 0 ? -1 : 1;
  const flapY = d.flying ? 1 + Math.sin(t * 16 + e.id) * 0.12 : 1;
  ctx.scale(flip, flapY);
  if (e.enraged) {
    ctx.shadowColor = '#ff2d2d';
    ctx.shadowBlur = 14;
  }
  const png = enemyPng(e.type, e.elite || e.champion);
  if (png) {
    // ảnh vẽ tay: chân ở giữa đáy ảnh, rộng theo ENEMY_W
    const h2 = box.w * png.naturalHeight / png.naturalWidth;
    ctx.drawImage(png, -box.w / 2, -h2 + (d.flying ? h2 * 0.5 : 0), box.w, h2);
    if (e.hitT > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = e.hitT / 0.12 * 0.55;
      ctx.drawImage(png, -box.w / 2, -h2 + (d.flying ? h2 * 0.5 : 0), box.w, h2);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
  }
  const img = !png && a && enemyImage(e.type, o.px || 1);
  if (png) { /* đã vẽ */ } else if (ready(img)) {
    const x0 = -(a.ax / a.w) * box.w, y0 = -box.ay;
    ctx.drawImage(img, x0, y0, box.w, box.h);
    // chớp sáng khi trúng đòn
    if (e.hitT > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = e.hitT / 0.12 * 0.55;
      ctx.drawImage(img, x0, y0, box.w, box.h);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
  } else {
    circle(ctx, 0, -box.h * 0.4, box.w * 0.3, d.color);
  }
  ctx.shadowBlur = 0;
  ctx.restore();

  const top = e.y - lift - box.ay - 4;
  ctx.save();
  ctx.translate(e.x, 0);
  // bị làm chậm: phủ sương xanh
  if (e.slowT > 0 || e.zoneSlow > 0) {
    ctx.fillStyle = 'rgba(158,221,242,0.28)';
    ctx.beginPath();
    ctx.ellipse(0, e.y - lift - box.h * 0.35, box.w * 0.45, box.h * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (e.shield > 0) {
    ctx.strokeStyle = 'rgba(90,180,214,0.9)';
    ctx.fillStyle = 'rgba(90,180,214,0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, e.y - lift - box.h * 0.4, box.w * 0.55, box.h * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  if (e.stunT > 0) {
    if (e.stunKind === 'ice') {
      ctx.fillStyle = 'rgba(189,235,250,0.45)';
      ctx.strokeStyle = '#E8FBFF';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(-box.w * 0.5, e.y - lift - box.h, box.w, box.h + 2);
      ctx.fill();
      ctx.stroke();
    } else if (e.stunKind === 'music') {
      ctx.fillStyle = '#FFE08A';
      ctx.font = 'bold 13px serif';
      ctx.textAlign = 'center';
      for (let i = 0; i < 2; i++) {
        const a2 = t * 3 + i * Math.PI;
        ctx.fillText('♪', Math.cos(a2) * box.w * 0.3, top - 6 + Math.sin(a2 * 2) * 4);
      }
    } else {
      for (let i = 0; i < 3; i++) {
        const a2 = t * 6 + (i * Math.PI * 2) / 3;
        drawStar(ctx, Math.cos(a2) * box.w * 0.3, top - 6 + Math.sin(a2) * 3, 3.5, '#F2D27A');
      }
    }
  }
  if (e.poisonT > 0 && Math.random() < 0.3) {
    circle(ctx, (Math.random() - 0.5) * box.w * 0.5, top + box.h * 0.3, 2, e.dotColor);
  }
  ctx.restore();

  if (o.icon) return;
  // thanh máu (+ khiên)
  const w = Math.max(24, Math.min(60, box.w * 0.6));
  const by = top - 3;
  ctx.fillStyle = 'rgba(10,10,10,0.85)';
  ctx.fillRect(e.x - w / 2 - 1, by - 1, w + 2, 5);
  const r = e.hp / e.maxHp;
  ctx.fillStyle = r > 0.5 ? '#3EBE3E' : r > 0.25 ? '#E0B030' : '#D84A2A';
  ctx.fillRect(e.x - w / 2, by, w * Math.max(0, r), 3);
  if (e.shield > 0) {
    ctx.fillStyle = '#5AB4D6';
    ctx.fillRect(e.x - w / 2, by - 3, w * Math.min(1, e.shield / e.maxHp), 2);
  }
}

// Vẽ quái làm biểu tượng (bảng đợt, bách khoa) vào một canvas
function drawEnemyIcon(cv, type, pad = 0.12) {
  const c = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  c.clearRect(0, 0, W, H);
  const png = enemyPng(type);
  if (png) {
    const k2 = Math.min((W * (1 - pad * 2)) / png.naturalWidth, (H * (1 - pad * 2)) / png.naturalHeight);
    c.drawImage(png, (W - png.naturalWidth * k2) / 2, (H - png.naturalHeight * k2) / 2, png.naturalWidth * k2, png.naturalHeight * k2);
    return;
  }
  const a = enemyArt(type);
  if (!a) { circle(c, W / 2, H / 2, Math.min(W, H) * 0.3, ENEMIES[type].color); return; }
  const k = Math.min((W * (1 - pad * 2)) / a.w, (H * (1 - pad * 2)) / a.h);
  const img = svgImage(`icon|${type}|${W}x${H}`, sizedSvg(a.svg, a.w * k, a.h * k));
  const draw = () => {
    c.clearRect(0, 0, W, H);
    c.drawImage(img, (W - a.w * k) / 2, (H - a.h * k) / 2, a.w * k, a.h * k);
  };
  if (ready(img)) draw(); else img.addEventListener('load', draw, { once: true });
}

// Vẽ chân dung tướng vào canvas (thân trên, phóng to)
function drawHeroPortrait(cv, h, t, o = {}) {
  const c = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  c.clearRect(0, 0, W, H);
  const png = !o.full && heroPng(h.type, 'B');
  if (png) {
    const k = Math.max(W / png.naturalWidth, H / png.naturalHeight);
    c.drawImage(png, (W - png.naturalWidth * k) / 2, 0, png.naturalWidth * k, png.naturalHeight * k);
    return;
  }
  const s = o.full ? H / 290 : H / 175;
  const look = computeLook({ ...h, grow: 0 });
  look.aura = null;
  drawHeroSprite(c, { ...h, grow: 0 }, W / 2, o.full ? H * 0.9 : H * 1.32, {
    t, dir: 1, scale: s, px: 1.2 / s * s, noShadow: !o.full, look: { ...look, tier: 0, bulk: 1 },
  });
}
