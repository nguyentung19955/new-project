// DEMO "NEON GRID — Merge Defense" — đồ hoạ cyberpunk vẽ procedural bằng canvas (glow / bloom / mưa / parallax).
// Ảnh người dùng thả vào demo/assets/ (đúng tên trong docs/demo-hop-tuong/PROMPT-CHATGPT.md) được ưu tiên thay hình vẽ code.
'use strict';
(function () {
  const C = CAU_HINH, G = GAME;
  const W = C.W, H = C.H;
  const Q = { cao: true, hat: 200 };   // chất lượng: tự hạ khi FPS thấp

  // ---------- ảnh người dùng (tuỳ chọn) ----------
  const ANH = {};
  let batLai = true;
  const SPR_CACHE = new Map();
  function nap(key, src) {
    const a = { img: null, ok: false, moi: false };
    ANH[key] = a;
    const im = new Image();
    im.onload = () => { a.img = im; a.ok = true; a.moi = true; batLai = true; };
    im.onerror = () => {};
    im.src = src;
  }
  // ảnh cũ (dự phòng khi chưa có ảnh v2)
  for (const id of TUONG_IDS) nap('u:' + id, `assets/units/${id}.png`);
  for (const k in QUAI) nap('e:' + k, `assets/enemies/${k}.png`);
  for (const b of BOSS) nap('b:' + b.id, `assets/bosses/${b.id}.png`);
  // ảnh v2 theo đặc tả mục 4 (demo/assets/v2/): có file là tự dùng, chưa có thì dùng ảnh cũ / hình vẽ code
  const V2 = 'assets/v2/';
  for (const id of TUONG_IDS) for (const a of ['idle', 'attack', 'hurt', 'summon']) nap(`v2:${id}:${a}`, `${V2}${TEN_FILE(id)}_${a}.png`);
  for (const k of ['bg_arena_portrait', 'board_frame_top', 'board_frame_player', 'tile_normal', 'tile_active', 'tile_merge',
    'lane_straight', 'lane_spawn', 'lane_exit', 'star_badges', 'unit_shadow', 'portraits_8', 'portraits_boss_3', 'leader_portrait',
    'vfx_fire', 'vfx_ice', 'vfx_chain', 'vfx_sniper', 'vfx_void', 'vfx_bounty', 'vfx_hack', 'vfx_poison', 'vfx_merge', 'vfx_summon',
    'board_overlay_fx']) nap('v2:' + k, `${V2}${k}.png`);
  // ảnh v3 HIGH TOP-DOWN (demo/assets/v3/): ảnh tĩnh mỗi tướng + tile; sheet <id>_idle/_attack (nếu có) được ưu tiên
  const V3 = 'assets/v3/';
  for (const id of TUONG_IDS) { nap(`v3:${id}`, `${V3}${TEN_FILE(id)}.png`); for (const a of ['idle', 'attack']) nap(`v3:${id}:${a}`, `${V3}${TEN_FILE(id)}_${a}.png`); }
  // 8 hướng: ảnh vẽ 5 hướng s, sw, w, nw, n (<id>_<dir>.png, sheet <id>_idle_<dir>.png / <id>_attack_<dir>.png); SE/E/NE = lật gương SW/W/NW.
  // WARP (drone) không có ảnh hướng: xoay ảnh bằng code theo góc tới mục tiêu.
  const HUONG5 = ['s', 'sw', 'w', 'nw', 'n'], XOAY_CODE = new Set(['warp']);
  for (const id of TUONG_IDS) if (XOAY_CODE.has(id)) { for (const a of ['idle', 'attack']) nap(`v3:${id}:${a}:s`, `${V3}${TEN_FILE(id)}_${a}_s.png`); }   // WARP: chỉ sheet hướng S, xoay bằng code
  else for (const d of HUONG5) {
    nap(`v3:${id}:${d}`, `${V3}${TEN_FILE(id)}_${d}.png`);
    for (const a of ['idle', 'attack']) nap(`v3:${id}:${a}:${d}`, `${V3}${TEN_FILE(id)}_${a}_${d}.png`);
  }
  nap('v3:tile', `${V3}tile.png`);
  const SHEET_QUAI = { thuong: 'enemy_drone_sheet', nhanh: 'enemy_skitter_sheet', trau: 'enemy_bulwark_sheet' };
  for (const k in SHEET_QUAI) nap('v2q:' + k, `${V2}${SHEET_QUAI[k]}.png`);
  BOSS.forEach((b, n) => nap('v2b:' + b.id, `${V2}boss_0${n + 1}_sheet.png`));
  const VFX_TUONG = { scorch: 'vfx_fire', frost: 'vfx_ice', arc: 'vfx_chain', lance: 'vfx_sniper', warp: 'vfx_void', miner: 'vfx_bounty', glitch: 'vfx_hack', venom: 'vfx_poison' };
  const co = (k) => ANH[k] && ANH[k].ok ? ANH[k].img : null;

  // ---------- tiện ích vẽ ----------
  const SS = 3;   // sprite vẽ sẵn ở 3× cho nét
  function mk(w, h, f, ss = SS) { const cv = document.createElement('canvas'); cv.width = Math.ceil(w * ss); cv.height = Math.ceil(h * ss); const c = cv.getContext('2d'); c.scale(ss, ss); f(c); return cv; }
  const lg = (c, x0, y0, x1, y1, st) => { const g = c.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, m]) => g.addColorStop(o, m)); return g; };
  const rg = (c, x, y, r0, r1, st) => { const g = c.createRadialGradient(x, y, r0, x, y, r1); st.forEach(([o, m]) => g.addColorStop(o, m)); return g; };
  function rr(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  const METAL = (c, x0, y0, x1, y1) => lg(c, x0, y0, x1, y1, [[0, '#6b7a99'], [0.18, '#3c4762'], [0.6, '#1d2336'], [1, '#0c0f1a']]);
  const neon = (c, m, b = 8) => { c.shadowColor = m; c.shadowBlur = b; };
  function fillO(c, f) { c.fillStyle = f; c.fill(); c.lineWidth = 1.1; c.strokeStyle = '#04060c'; c.stroke(); }
  function vien(c, m, a = 0.55) { c.save(); c.globalAlpha = a; c.lineWidth = 0.8; c.strokeStyle = m; c.stroke(); c.restore(); }
  const hexA = (hex, a) => hex + Math.round(a * 255).toString(16).padStart(2, '0');
  function hexP(c, x, y, r, rot = 0) { c.beginPath(); for (let k = 0; k < 6; k++) { const g = rot + k * Math.PI / 3; c.lineTo(x + Math.cos(g) * r, y + Math.sin(g) * r); } c.closePath(); }
  // quầng sáng vẽ sẵn theo màu (bloom rẻ: drawImage + 'lighter')
  const GLOW = {};
  function glow(m) { return GLOW[m] || (GLOW[m] = mk(64, 64, (c) => { c.fillStyle = rg(c, 32, 32, 0, 32, [[0, hexA(m, 0.9)], [0.25, hexA(m, 0.45)], [1, hexA(m, 0)]]); c.fillRect(0, 0, 64, 64); }, 1)); }
  function veGlow(c, m, x, y, r, a = 1) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, a); c.drawImage(glow(m), x - r, y - r, r * 2, r * 2); c.restore(); }

  // ---------- TƯỚNG (khung thiết kế 64×64, chân ở y≈57, quay phải) ----------
  function de(c, h) {   // bệ đứng
    c.save(); c.beginPath(); c.ellipse(32, 57, 20, 5.5, 0, 0, 7); c.fillStyle = '#05070e'; c.fill();
    neon(c, h.mau, 8); c.lineWidth = 1.2; c.strokeStyle = hexA(h.mau, 0.8); c.stroke(); c.restore();
  }
  // TƯỚNG chibi ANIME cyberpunk (đầu to ~1:1, mắt anime to), quay phải. Khung 64×64, chân ở y≈57.
  const HX = 32, HY = 19, HR = 13;
  function mat(c, x, y, w, h, iris, sang) {   // mắt anime: tròng trắng, mống màu nguyên tố, 2 đốm sáng, mi trên đậm
    c.beginPath(); c.ellipse(x, y, w / 2, h / 2, 0, 0, 7); c.fillStyle = '#ffffff'; c.fill();
    c.save(); c.beginPath(); c.ellipse(x, y, w / 2, h / 2, 0, 0, 7); c.clip();
    c.beginPath(); c.ellipse(x + w * 0.08, y + h * 0.06, w * 0.42, h * 0.46, 0, 0, 7); c.fillStyle = lg(c, 0, y - h / 2, 0, y + h / 2, [[0, '#0b0d15'], [0.45, iris], [1, sang]]); c.fill();
    c.beginPath(); c.ellipse(x + w * 0.1, y + h * 0.05, w * 0.18, h * 0.22, 0, 0, 7); c.fillStyle = '#05060c'; c.fill();
    c.restore();
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x - w * 0.12, y - h * 0.18, w * 0.17, 0, 7); c.fill(); c.beginPath(); c.arc(x + w * 0.22, y + h * 0.22, w * 0.08, 0, 7); c.fill();
    c.strokeStyle = '#0b0710'; c.lineWidth = 1.5; c.lineCap = 'round'; c.beginPath(); c.ellipse(x, y + 0.3, w / 2 + 0.3, h / 2 + 0.2, 0, Math.PI * 1.08, Math.PI * 1.95); c.stroke();
    c.lineWidth = 1; c.beginPath(); c.moveTo(x + w / 2, y - h * 0.25); c.lineTo(x + w / 2 + 1.4, y - h * 0.42); c.stroke(); c.lineCap = 'butt';
  }
  function mat2(c, h, o) {
    if (o.mat === 'visor') { c.save(); neon(c, h.mau, 10); rr(c, 24, 17, 20, 6.5, 3); c.fillStyle = hexA(h.mau, 0.82); c.fill(); c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(33, 18.3, 8, 1.3); c.restore(); }
    else if (o.mat !== 'khong') {
      mat(c, 29.3, 21.6, 6.4, 7.8, h.mau, h.sang); mat(c, 39, 21.6, 5.2, 7.6, h.mau, h.sang);
      c.strokeStyle = 'rgba(20,8,12,0.75)'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(27, 16.2); c.lineTo(31.5, 15.6); c.moveTo(37.3, 15.6); c.lineTo(41.4, 16.2); c.stroke();
    }
    if (!o.matNa) { c.strokeStyle = 'rgba(90,30,30,0.8)'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(34, 27.8); c.quadraticCurveTo(35.5, o.cuoi ? 29.2 : 28.3, 37, 27.7); c.stroke(); }
    if (o.ma) { c.fillStyle = 'rgba(255,110,140,0.28)'; c.beginPath(); c.ellipse(27.5, 25, 2.2, 1.1, 0, 0, 7); c.ellipse(41, 25, 1.6, 1, 0, 0, 7); c.fill(); }
  }
  // tóc: phần mũ tóc + mái nhọn (kieu: 'mai' | 'nhon' | 'bob'); toc = [sáng, tối]
  function mai(c, toc, kieu, m) {
    c.beginPath();
    c.moveTo(18, 22); c.arc(HX, HY - 1, HR + 1.6, Math.PI * 0.94, Math.PI * 2.06);
    const tips = kieu === 'bob' ? [[47, 27], [44, 16], [42, 19.5], [39, 13], [36, 17.5], [33, 12.5], [30, 17], [27, 12.5], [24, 17.5], [21, 15], [18, 27]]
      : [[46, 23], [43, 14], [41.5, 17.5], [38.5, 12.5], [36, 16.5], [33, 12], [30, 16.5], [26.5, 12.5], [24, 17], [20.5, 14], [18, 23]];
    for (const [x, y] of tips) c.lineTo(x, y);
    c.closePath(); fillO(c, lg(c, 0, 3, 0, 26, [[0, toc[0]], [1, toc[1]]]));
    if (kieu === 'nhon') { c.beginPath(); for (const [x0, y0, x1, y1, x2, y2] of [[22, 9, 15, 3, 25, 6], [27, 5, 26, -3, 32, 4], [33, 4, 39, -3, 37, 5], [39, 6, 48, 2, 42, 10]]) { c.moveTo(x0, y0); c.lineTo(x1, y1); c.lineTo(x2, y2); } c.closePath(); fillO(c, toc[0]); }
    c.save(); c.globalAlpha = 0.45; c.strokeStyle = '#ffffff'; c.lineWidth = 1.6; c.beginPath(); c.arc(HX - 1, HY - 3, HR - 3, Math.PI * 1.15, Math.PI * 1.55); c.stroke(); c.restore();
    if (m) { c.save(); neon(c, m, 6); c.globalAlpha = 0.8; c.strokeStyle = m; c.lineWidth = 1; c.beginPath(); c.arc(HX, HY - 1, HR + 1, Math.PI * 1.25, Math.PI * 1.6); c.stroke(); c.restore(); }
  }
  function nguoi(c, h, o) {
    de(c, h);
    if (o.sau) o.sau(c);
    if (o.tocSau) { c.beginPath(); c.moveTo(19, 16); c.quadraticCurveTo(14, 34, 19, o.tocDai || 42); c.lineTo(45, o.tocDai || 42); c.quadraticCurveTo(50, 32, 45, 16); c.closePath(); fillO(c, lg(c, 0, 10, 0, 44, [[0, o.toc[0]], [1, o.toc[1]]])); }
    for (const x of [26, 33]) { rr(c, x, 44, 6, 8, 2); fillO(c, lg(c, x, 44, x + 6, 52, [[0, '#2a3044'], [1, '#10131e']])); rr(c, x - 0.8, 50, 8, 7, 2.5); fillO(c, lg(c, x, 50, x, 57, [[0, '#3c4762'], [1, '#0b0d15']])); }
    c.save(); neon(c, h.mau, 6); c.fillStyle = h.mau; c.fillRect(26, 52.5, 6, 1.2); c.fillRect(33, 52.5, 6, 1.2); c.restore();
    rr(c, 19.5, 32, 5.5, 10, 2.5); fillO(c, o.tay || '#1d2336');
    c.beginPath(); c.moveTo(22.5, 31); c.lineTo(42.5, 31); c.lineTo(41.5, 46); c.lineTo(23.5, 46); c.closePath(); fillO(c, lg(c, 22, 31, 43, 46, [[0, o.ao], [1, o.aoT]])); vien(c, h.mau, 0.55);
    c.save(); neon(c, h.mau, 8); c.strokeStyle = h.mau; c.lineWidth = 1.1; c.beginPath(); c.moveTo(33, 32); c.lineTo(32.5, 45); c.moveTo(23.5, 43.5); c.lineTo(41.5, 43.5); c.stroke(); c.restore();
    c.beginPath(); c.moveTo(26, 30); c.lineTo(32.5, 34); c.lineTo(39.5, 30); c.lineTo(38, 32.5); c.lineTo(32.5, 36); c.lineTo(27.5, 32.5); c.closePath(); fillO(c, o.co || '#0e1220');
    c.fillStyle = o.da2; c.fillRect(30, 29, 5.5, 3);
    c.beginPath(); c.ellipse(HX + 0.5, HY + 1, HR - 0.5, HR - 1, 0, 0, 7); fillO(c, rg(c, HX - 2, HY - 2, 2, HR + 2, [[0, o.da], [1, o.da2]]));
    c.save(); c.globalAlpha = 0.55; c.strokeStyle = '#3ce7ff'; c.lineWidth = 1; c.beginPath(); c.ellipse(HX + 0.5, HY + 1, HR - 1, HR - 1.5, 0, Math.PI * 0.7, Math.PI * 1.05); c.stroke(); c.strokeStyle = '#ff2bd6'; c.beginPath(); c.ellipse(HX + 0.5, HY + 1, HR - 1, HR - 1.5, 0, -0.2, 0.5); c.stroke(); c.restore();
    mat2(c, h, o);
    if (o.truocToc) o.truocToc(c);
    if (o.toc) mai(c, o.toc, o.kieu || 'mai', o.vienToc ? h.mau : null);
    if (o.truoc) o.truoc(c);
  }
  const VE_UNIT = {
    scorch(c, h) {
      nguoi(c, h, { da: '#ffd9bd', da2: '#d79a78', ao: '#7a3418', aoT: '#2a100a', tay: '#3a1a10', toc: ['#ff8a3a', '#b0300c'], kieu: 'nhon', cuoi: 1, vienToc: 1,
        sau: (c) => { rr(c, 13, 30, 9, 16, 3); fillO(c, METAL(c, 13, 30, 22, 46)); c.save(); neon(c, h.mau, 8); c.fillStyle = h.mau; c.fillRect(15, 34, 5, 1.5); c.fillRect(15, 39, 5, 1.5); c.restore(); },
        truoc: (c) => {
          rr(c, 21, 8.5, 22, 4, 2); fillO(c, '#1d2336'); c.save(); neon(c, h.mau, 8); for (const x of [25.5, 35]) { c.beginPath(); c.arc(x, 10.5, 3.2, 0, 7); c.fillStyle = '#0b0d15'; c.fill(); c.beginPath(); c.arc(x, 10.5, 2.2, 0, 7); c.fillStyle = hexA(h.mau, 0.9); c.fill(); } c.restore();
          rr(c, 37, 33, 7, 9, 3); fillO(c, '#3a1a10');
          rr(c, 40, 33.5, 16, 8, 3); fillO(c, METAL(c, 40, 33.5, 56, 41.5)); c.fillStyle = '#05070e'; c.fillRect(54.5, 34.5, 3.5, 6);
          c.save(); neon(c, h.mau, 10); c.fillStyle = h.mau; c.fillRect(55.3, 35.8, 2.8, 3.6); c.fillRect(43, 37, 9, 1.4); c.restore(); } });
    },
    frost(c, h) {
      nguoi(c, h, { da: '#fff0e6', da2: '#e0b8a6', ao: '#2a6a94', aoT: '#0c1e32', tay: '#1c4a6a', toc: ['#f4fcff', '#8ec8e4'], tocSau: 1, tocDai: 46, ma: 1, vienToc: 1,
        truocToc: () => {},
        truoc: (c) => {
          c.save(); neon(c, h.mau, 8); c.fillStyle = h.sang; c.beginPath(); c.moveTo(22, 8); c.lineTo(24.5, 4); c.lineTo(26, 9); c.closePath(); c.fill(); c.restore();
          c.strokeStyle = '#2a3348'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(48, 57); c.lineTo(48, 18); c.stroke(); c.strokeStyle = '#8a9ab8'; c.lineWidth = 0.7; c.stroke();
          rr(c, 42.5, 34, 7, 6.5, 3); fillO(c, '#fff0e6');
          c.save(); neon(c, h.mau, 16); c.beginPath(); c.moveTo(48, 5); c.lineTo(53, 12.5); c.lineTo(48, 20); c.lineTo(43, 12.5); c.closePath(); c.fillStyle = lg(c, 43, 5, 53, 20, [[0, '#ffffff'], [0.5, h.mau], [1, h.toi]]); c.fill(); c.restore();
          for (const [x, y] of [[56, 8], [41, 4], [57, 20]]) { c.save(); neon(c, h.mau, 8); c.fillStyle = h.sang; c.beginPath(); c.moveTo(x, y - 3); c.lineTo(x + 1.8, y); c.lineTo(x, y + 3); c.lineTo(x - 1.8, y); c.closePath(); c.fill(); c.restore(); } } });
    },
    arc(c, h) {
      nguoi(c, h, { da: '#ffe0c4', da2: '#d0a07c', ao: '#3a3a48', aoT: '#101016', tay: '#22222c', toc: ['#2a2a3a', '#0a0a12'], kieu: 'nhon', vienToc: 1,
        truoc: (c) => {
          c.save(); neon(c, h.mau, 8); c.fillStyle = h.mau; c.beginPath(); c.moveTo(19, 13.5); c.lineTo(46, 12); c.lineTo(46, 14.6); c.lineTo(19, 16.2); c.closePath(); c.fill(); c.restore();
          c.fillStyle = h.mau; c.beginPath(); c.moveTo(19, 14); c.lineTo(13, 19); c.lineTo(16, 20); c.lineTo(20, 16); c.closePath(); c.fill();
          c.save(); neon(c, h.mau, 14); c.strokeStyle = h.sang; c.lineWidth = 2.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(45, 35); c.lineTo(60, 13); c.stroke(); c.restore();
          c.strokeStyle = '#1a1a22'; c.lineWidth = 2.8; c.beginPath(); c.moveTo(41.5, 40); c.lineTo(45, 35); c.stroke(); c.fillStyle = '#c9a64a'; c.fillRect(43.5, 34.5, 4, 1.5);
          rr(c, 38.5, 34, 7, 7, 3); fillO(c, '#ffe0c4');
          c.save(); neon(c, h.mau, 8); c.strokeStyle = h.mau; c.lineWidth = 1; c.beginPath(); c.moveTo(54, 16); c.lineTo(58, 19); c.lineTo(55, 21); c.lineTo(60, 25); c.stroke(); c.restore(); } });
    },
    lance(c, h) {
      nguoi(c, h, { da: '#c88a64', da2: '#8a5a3c', ao: '#5a1c38', aoT: '#160810', tay: '#2a1020', toc: ['#3a1a2e', '#0e0610'], kieu: 'bob', vienToc: 1,
        truoc: (c) => {
          c.save(); for (const x of [17.5, 46.5]) { rr(c, x - 3, 15, 6, 10, 3); fillO(c, '#1d2336'); neon(c, h.mau, 8); c.fillStyle = h.mau; c.fillRect(x - 1, 17, 2, 6); } c.restore();
          c.strokeStyle = '#1d2336'; c.lineWidth = 2; c.beginPath(); c.arc(32, 15, 15, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
          c.save(); neon(c, h.mau, 10); c.beginPath(); c.moveTo(16, 3); c.lineTo(19, 10); c.lineTo(13.5, 9); c.closePath(); c.moveTo(48, 3); c.lineTo(50.5, 9); c.lineTo(45, 10); c.closePath(); c.fillStyle = h.mau; c.fill(); c.restore();
          rr(c, 26, 35, 37, 5, 2); fillO(c, METAL(c, 26, 35, 63, 40));
          c.save(); neon(c, h.mau, 10); c.fillStyle = h.mau; c.fillRect(34, 36.8, 26, 1.3); c.restore();
          rr(c, 33, 31, 11, 4, 2); fillO(c, METAL(c, 33, 31, 44, 35)); c.save(); neon(c, h.mau, 10); c.fillStyle = h.mau; c.beginPath(); c.arc(43.5, 33, 1.6, 0, 7); c.fill(); c.restore();
          rr(c, 61, 34, 3, 7, 1); fillO(c, '#2a3348');
          rr(c, 37.5, 38, 6.5, 6.5, 3); fillO(c, '#c88a64'); } });
    },
    warp(c, h) {
      nguoi(c, h, { da: '#ffe6da', da2: '#d6a896', ao: '#4a2278', aoT: '#12061e', tay: '#2e1450', toc: ['#c79bff', '#4a1c86'], tocSau: 1, tocDai: 50, ma: 1, vienToc: 1,
        sau: (c) => {
          c.save(); neon(c, h.mau, 14); c.strokeStyle = h.mau; c.lineWidth = 1.8; c.beginPath(); c.arc(31, 16, 19, 0, 7); c.stroke(); c.restore();
          for (let k = 0; k < 4; k++) { const g = k * Math.PI / 2 + 0.6; c.save(); neon(c, h.mau, 8); c.fillStyle = h.sang; c.fillRect(31 + Math.cos(g) * 19 - 1.5, 16 + Math.sin(g) * 19 - 1.5, 3, 3); c.restore(); } },
        truoc: (c) => {
          c.beginPath(); c.moveTo(16, 9); c.lineTo(48, 9); c.lineTo(41, 7); c.lineTo(36, -4); c.lineTo(28, 6); c.closePath(); fillO(c, lg(c, 16, -4, 48, 9, [[0, '#3a1a5e'], [1, '#0e0618']]));
          c.save(); neon(c, h.mau, 8); c.strokeStyle = h.mau; c.lineWidth = 1.2; c.beginPath(); c.moveTo(18, 8.6); c.lineTo(46, 8.6); c.stroke(); c.restore();
          rr(c, 39.5, 35, 6.5, 6.5, 3); fillO(c, '#ffe6da');
          c.save(); neon(c, h.mau, 16); c.fillStyle = rg(c, 48.5, 37, 0, 5.5, [[0, '#ffffff'], [0.4, h.sang], [1, h.mau]]); c.beginPath(); c.arc(48.5, 37, 4.6, 0, 7); c.fill(); c.restore();
          c.save(); neon(c, h.mau, 6); c.strokeStyle = h.sang; c.lineWidth = 0.8; c.beginPath(); c.ellipse(48.5, 37, 7.5, 2.8, -0.4, 0, 7); c.stroke(); c.restore(); } });
    },
    miner(c, h) {
      nguoi(c, h, { da: '#e8b48e', da2: '#b07c5a', ao: '#1e3e72', aoT: '#08101e', tay: '#142a4a', toc: ['#5a3020', '#1a0c08'], kieu: 'bob', cuoi: 1, ma: 1,
        sau: (c) => { c.beginPath(); c.arc(20, 9, 5.5, 0, 7); fillO(c, lg(c, 0, 4, 0, 15, [[0, '#5a3020'], [1, '#1a0c08']])); c.save(); neon(c, h.mau, 6); c.fillStyle = h.mau; c.fillRect(17, 8, 6, 1.3); c.restore(); },
        truoc: (c) => {
          c.save(); c.strokeStyle = h.mau; c.lineWidth = 1.1; neon(c, h.mau, 8); c.beginPath(); c.arc(29.5, 21, 4.4, 0, 7); c.stroke(); c.beginPath(); c.arc(38.8, 21, 3.9, 0, 7); c.stroke(); c.beginPath(); c.moveTo(33.9, 21); c.lineTo(34.9, 21); c.stroke(); c.restore();
          rr(c, 39.5, 34, 6.5, 7, 3); fillO(c, '#e8b48e');
          c.save(); neon(c, h.mau, 10); c.fillStyle = hexA(h.mau, 0.3); c.strokeStyle = h.mau; c.lineWidth = 1; c.beginPath(); c.moveTo(43, 35); c.lineTo(58, 31); c.lineTo(58, 41); c.lineTo(43, 42); c.closePath(); c.fill(); c.stroke();
          c.fillStyle = h.mau; [3, 6, 4, 8].forEach((b, k) => c.fillRect(46.5 + k * 2.8, 40 - b, 1.7, b)); c.restore();
          c.save(); neon(c, '#ffe24a', 12); hexP(c, 52, 20, 5.5, Math.PI / 6); c.lineWidth = 1.5; c.strokeStyle = '#ffe24a'; c.stroke(); c.fillStyle = 'rgba(255,226,74,0.3)'; c.fill(); c.fillStyle = '#fff6c0'; c.fillRect(51.1, 16.8, 1.8, 6.4); c.restore(); } });
    },
    glitch(c, h) {
      nguoi(c, h, { da: '#f4d2bc', da2: '#c49a84', ao: '#0e3a2e', aoT: '#04100c', tay: '#0a2018', mat: 'khong', matNa: 1,
        sau: (c) => { c.beginPath(); c.moveTo(16, 34); c.quadraticCurveTo(12, 10, 32, 2); c.quadraticCurveTo(52, 10, 49, 34); c.closePath(); fillO(c, lg(c, 12, 2, 52, 34, [[0, '#2e4a42'], [0.5, '#12241e'], [1, '#050a08']]));
          c.beginPath(); c.moveTo(18, 8); c.lineTo(17, -2); c.lineTo(25, 4); c.closePath(); c.moveTo(46, 8); c.lineTo(48, -2); c.lineTo(40, 4); c.closePath(); fillO(c, '#1a2e28');
          c.save(); neon(c, h.mau, 8); c.fillStyle = h.mau; c.beginPath(); c.moveTo(19, 6); c.lineTo(18.5, 1.5); c.lineTo(22, 4.5); c.closePath(); c.moveTo(45, 6); c.lineTo(46, 1.5); c.lineTo(42.5, 4.5); c.closePath(); c.fill(); c.restore(); },
        truoc: (c) => {
          c.beginPath(); c.moveTo(17, 30); c.quadraticCurveTo(15, 9, 32, 5); c.quadraticCurveTo(49, 9, 47.5, 30); c.lineTo(44, 24); c.quadraticCurveTo(44, 12, 32, 11); c.quadraticCurveTo(21, 12, 21, 26); c.closePath();
          fillO(c, lg(c, 15, 5, 49, 30, [[0, '#2e4a42'], [0.5, '#12241e'], [1, '#050a08']])); vien(c, h.mau, 0.5);
          mat(c, 29.5, 20, 5.4, 6.2, h.mau, '#ffffff'); mat(c, 38.8, 20, 4.4, 6, h.mau, '#ffffff');
          c.beginPath(); c.moveTo(23, 23.5); c.lineTo(44, 23.5); c.lineTo(43, 30); c.quadraticCurveTo(33, 33, 24, 30); c.closePath(); fillO(c, '#0a1612');
          c.save(); neon(c, h.mau, 8); c.fillStyle = h.mau; for (let k = 0; k < 4; k++) c.fillRect(27 + k * 4, 26.5, 2.4, 1.2); c.restore();
          rr(c, 38.5, 36, 6.5, 6.5, 3); fillO(c, '#0a2018');
          rr(c, 42, 36.5, 12, 4.5, 1.5); fillO(c, METAL(c, 42, 36.5, 54, 41)); c.save(); neon(c, h.mau, 10); c.fillStyle = h.mau; c.fillRect(52.5, 37.3, 3, 3); c.restore();
          c.save(); neon(c, h.mau, 8); c.fillStyle = h.mau; c.globalAlpha = 0.85; for (const [x, y, w] of [[5, 16, 5], [6, 20, 3], [52, 10, 6], [55, 14, 3], [5, 42, 4]]) c.fillRect(x, y, w, 1.8); c.restore(); } });
    },
    venom(c, h) {
      nguoi(c, h, { da: '#d8a07a', da2: '#9a6442', ao: '#344a12', aoT: '#0c1206', tay: '#1e2a0a', toc: ['#2a3a1a', '#0a1006'], kieu: 'nhon', matNa: 1, vienToc: 1,
        truoc: (c) => {
          c.beginPath(); c.moveTo(25, 24); c.lineTo(43, 23.5); c.lineTo(42, 30.5); c.quadraticCurveTo(34, 33, 26, 30.5); c.closePath(); fillO(c, METAL(c, 25, 23.5, 43, 32));
          c.save(); neon(c, h.mau, 8); c.fillStyle = h.mau; c.beginPath(); c.arc(29.5, 28, 2, 0, 7); c.arc(39, 28, 1.7, 0, 7); c.fill(); c.restore();
          for (const y of [34.5, 40]) { rr(c, 38.5, y, 6.5, 5.5, 2.5); fillO(c, '#1e2a0a'); rr(c, 42, y + 0.6, 12, 4, 1.5); fillO(c, METAL(c, 42, y, 54, y + 4)); c.save(); neon(c, h.mau, 10); c.fillStyle = h.mau; c.fillRect(53, y + 1.4, 3, 2); c.restore(); } } });
    },
  };

  // ---------- QUÁI (khung 40×40, quay phải) & BOSS (khung 80×80) ----------
  const VE_QUAI = {
    thuong(c) {   // DRONE
      const m = '#ff3355';
      c.strokeStyle = '#2a3348'; c.lineWidth = 2; c.beginPath(); c.moveTo(10, 14); c.lineTo(15, 18); c.moveTo(30, 14); c.lineTo(25, 18); c.stroke();
      c.save(); c.globalAlpha = 0.7; c.fillStyle = '#9aa6c4'; c.beginPath(); c.ellipse(10, 12, 9, 2, 0, 0, 7); c.ellipse(30, 12, 9, 2, 0, 0, 7); c.fill(); c.restore();
      c.beginPath(); c.ellipse(20, 23, 15, 9.5, 0, 0, 7); fillO(c, lg(c, 5, 13, 35, 33, [[0, '#6a3242'], [0.4, '#2e1520'], [1, '#0c060a']]));
      c.save(); neon(c, m, 6); c.strokeStyle = hexA(m, 0.8); c.lineWidth = 1; c.beginPath(); c.ellipse(20, 25, 13, 6, 0, 0.2, Math.PI - 0.2); c.stroke(); c.restore();
      c.beginPath(); c.arc(25, 21, 5.5, 0, 7); fillO(c, '#120509');
      c.save(); neon(c, m, 12); c.fillStyle = m; c.beginPath(); c.arc(25.5, 21, 3.6, 0, 7); c.fill(); c.fillStyle = '#fff'; c.fillRect(26, 19.5, 1.5, 1.5); c.restore();
      c.save(); neon(c, m, 8); c.fillStyle = m; c.fillRect(11, 30.5, 2, 2); c.fillRect(19, 31.5, 2, 2); c.fillRect(27, 30.5, 2, 2); c.restore();
    },
    nhanh(c) {    // SKITTER
      const m = '#ff2bd6';
      c.strokeStyle = '#1d2336'; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath();
      for (const [a, b, d] of [[10, 30, 5], [16, 31, 11], [24, 31, 27], [30, 30, 35]]) { c.moveTo(a, b - 4); c.lineTo(d, 38); }
      c.stroke(); c.lineCap = 'butt';
      c.beginPath(); c.moveTo(4, 26); c.lineTo(18, 15); c.lineTo(34, 19); c.lineTo(39, 26); c.lineTo(30, 32); c.lineTo(9, 32); c.closePath();
      fillO(c, lg(c, 4, 15, 39, 32, [[0, '#4a2a52'], [0.5, '#1e1024'], [1, '#09040c']]));
      c.save(); neon(c, m, 10); c.fillStyle = m; c.fillRect(10, 22, 8, 1.6); c.fillRect(14, 26, 11, 1.6); c.fillRect(7, 29, 5, 1.4); c.restore();
      c.save(); neon(c, m, 12); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(31, 21); c.lineTo(37, 25); c.lineTo(30, 26); c.closePath(); c.fill(); c.restore();
    },
    trau(c) {     // BULWARK
      const m = '#ff8a1a';
      rr(c, 3, 29, 33, 10, 4); fillO(c, '#0d1018');
      c.fillStyle = '#3c4762'; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(8 + k * 8, 34, 2.6, 0, 7); c.fill(); }
      rr(c, 5, 9, 26, 22, 3); fillO(c, METAL(c, 5, 9, 31, 31));
      rr(c, 9, 4, 15, 8, 2); fillO(c, METAL(c, 9, 4, 24, 12));
      c.save(); neon(c, m, 10); c.fillStyle = m; c.fillRect(13, 7, 9, 2); c.restore();
      rr(c, 27, 6, 10, 27, 2); fillO(c, lg(c, 27, 6, 37, 33, [[0, '#7a5a3a'], [0.5, '#3a2a1a'], [1, '#150d06']]));
      c.save(); neon(c, m, 10); c.fillStyle = m; c.fillRect(29.5, 10, 2, 19); c.fillRect(33, 13, 1.6, 13); c.restore();
      c.save(); neon(c, m, 6); c.fillStyle = hexA(m, 0.8); c.fillRect(9, 17, 12, 1.5); c.fillRect(9, 22, 8, 1.5); c.restore();
    },
  };
  const VE_BOSS = {
    firewall(c, m) {
      c.fillStyle = '#0d1018'; rr(c, 18, 66, 14, 10, 2); c.fill(); rr(c, 48, 66, 14, 10, 2); c.fill();
      c.save(); neon(c, m, 16); c.fillStyle = m; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(18 + k * 11, 22); c.lineTo(23.5 + k * 11, 6 + (k % 2) * 5); c.lineTo(29 + k * 11, 22); c.closePath(); c.fill(); } c.restore();
      hexP(c, 40, 44, 30, Math.PI / 6); fillO(c, lg(c, 10, 14, 70, 74, [[0, '#5a2a30'], [0.45, '#22101a'], [1, '#08040a']]));
      c.save(); hexP(c, 40, 44, 30, Math.PI / 6); c.clip();
      c.save(); neon(c, m, 8); c.strokeStyle = hexA(m, 0.55); c.lineWidth = 1;
      for (let x = 12; x < 70; x += 8) { c.beginPath(); c.moveTo(x, 14); c.lineTo(x, 74); c.stroke(); }
      for (let y = 18; y < 74; y += 8) { c.beginPath(); c.moveTo(10, y); c.lineTo(70, y); c.stroke(); }
      c.restore(); c.restore();
      c.save(); neon(c, m, 10); hexP(c, 40, 44, 30, Math.PI / 6); c.lineWidth = 2; c.strokeStyle = m; c.stroke(); c.restore();
      rr(c, 22, 36, 36, 12, 5); fillO(c, '#08030a');
      c.save(); neon(c, m, 18); c.fillStyle = m; rr(c, 25, 39.5, 30, 5, 2.5); c.fill(); c.fillStyle = '#fff'; c.fillRect(44, 40.5, 6, 2.4); c.restore();
    },
    overclock(c, m) {
      c.strokeStyle = '#1d2336'; c.lineWidth = 4; c.beginPath(); c.moveTo(30, 58); c.lineTo(18, 76); c.moveTo(50, 58); c.lineTo(62, 76); c.moveTo(40, 62); c.lineTo(40, 76); c.stroke();
      c.beginPath(); c.arc(40, 42, 21, 0, 7); fillO(c, METAL(c, 19, 21, 61, 63));
      c.save(); neon(c, m, 22); c.fillStyle = rg(c, 38, 40, 1, 13, [[0, '#ffffff'], [0.35, '#fff0b0'], [0.7, m], [1, '#5a3000']]); c.beginPath(); c.arc(40, 42, 12, 0, 7); c.fill(); c.restore();
      c.save(); neon(c, m, 8); c.strokeStyle = m; c.lineWidth = 1.2; for (let k = 0; k < 8; k++) { const g = k * Math.PI / 4; c.beginPath(); c.moveTo(40 + Math.cos(g) * 14, 42 + Math.sin(g) * 14); c.lineTo(40 + Math.cos(g) * 19, 42 + Math.sin(g) * 19); c.stroke(); } c.restore();
    },
    corruptor(c, m) {
      let sd = 11; const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
      c.save(); neon(c, m, 10); c.strokeStyle = hexA(m, 0.8); c.lineWidth = 2.2; c.lineCap = 'round';
      for (let k = 0; k < 6; k++) { const g = Math.PI * 0.15 + k * Math.PI * 0.14; c.beginPath(); c.moveTo(40, 46); c.bezierCurveTo(40 + Math.cos(g) * 20, 60, 40 + Math.cos(g) * 34 - 10, 70, 40 + Math.cos(g) * 36, 78); c.stroke(); } c.restore();
      for (let k = 0; k < 34; k++) { const g = r() * 7, d = r() * 22, s = 5 + r() * 9, x = 40 + Math.cos(g) * d - s / 2, y = 40 + Math.sin(g) * d * 0.85 - s / 2;
        rr(c, x, y, s, s, 1); fillO(c, r() < 0.3 ? '#3a1458' : r() < 0.6 ? '#1e0a30' : '#2a0f40');
        if (r() < 0.35) { c.save(); neon(c, m, 8); c.fillStyle = m; c.fillRect(x + s * 0.3, y + s * 0.3, s * 0.35, s * 0.35); c.restore(); } }
      c.beginPath(); c.arc(42, 38, 10, 0, 7); fillO(c, '#0a0410');
      c.save(); neon(c, m, 20); c.fillStyle = rg(c, 43, 37, 1, 8, [[0, '#ffffff'], [0.4, '#ffc8ff'], [1, m]]); c.beginPath(); c.ellipse(43, 38, 7, 5, 0, 0, 7); c.fill(); c.fillStyle = '#12001a'; c.fillRect(42, 35, 2.4, 6); c.restore();
    },
  };
  function spr(key, w, h, f) { let s = SPR_CACHE.get(key); if (!s) { s = mk(w, h, f); SPR_CACHE.set(key, s); } return s; }
  const sprUnit = (id) => spr('u' + id, 64, 64, (c) => VE_UNIT[id](c, HANH[TUONG[id].hanh]));
  const sprQuai = (k) => spr('q' + k, 40, 40, (c) => VE_QUAI[k](c));
  const sprBoss = (b) => spr('b' + b.id, 80, 80, (c) => VE_BOSS[b.id](c, b.mau));
  const sprBanh = () => spr('gear', 80, 80, (c) => {   // bánh răng xoay quanh OVERCLOCK
    c.beginPath(); for (let k = 0; k < 24; k++) { const g = k * Math.PI / 12, r2 = k % 2 ? 31 : 36; c.lineTo(40 + Math.cos(g) * r2, 40 + Math.sin(g) * r2); } c.closePath();
    c.arc(40, 40, 26, 0, 7, true); fillO(c, METAL(c, 4, 4, 76, 76));
    c.save(); neon(c, '#ffb31a', 8); c.strokeStyle = '#ffb31a'; c.lineWidth = 1.2; c.beginPath(); c.arc(40, 40, 28, 0, 7); c.stroke(); c.restore();
  });
  function veHinh(c, a, cv, x, y, w, h) {   // ảnh người dùng (nếu có) hoặc sprite vẽ code, chân chạm đáy hộp
    if (a && a.ok) { const im = a.img, k = Math.min(w / im.width, h / im.height); c.drawImage(im, x + (w - im.width * k) / 2, y + h - im.height * k, im.width * k, im.height * k); }
    else c.drawImage(cv, x, y, w, h);
  }

  // ================= MÀN DỌC 390×844: nền + 2 làn + 2 bàn (lớp tĩnh vẽ sẵn) =================
  const BANS = [G.BAN_AI, G.BAN_NG];
  let L = null, LK = 0;
  function veBanTinh(c, B) {   // khung bàn 250×153 + 15 ô (tile v3, khe 1px; không có thì ảnh v2 / vẽ code)
    const { BX: bx, BY: by } = B, bw = C.BAN_W, bh = C.BAN_H, m = B.ai ? '#3ce7ff' : '#ff2bd6';
    c.save(); neon(c, 'rgba(0,0,0,0.75)', 10); rr(c, bx, by, bw, bh, 5); c.fillStyle = '#07090f'; c.fill(); c.restore();
    const t3 = co('v3:tile'), tile = co('v2:tile_normal');
    const gx = (C.BUOC_X - C.O - 1) / 2, gy = (C.BUOC_Y - C.OH - 1) / 2;   // nới ảnh tile để khe giữa các ô còn 1px (lưới logic giữ nguyên)
    for (let i = 0; i < C.COT * C.HANG; i++) {
      const [x, y] = G.oXY({ B }, i);
      if (t3) { c.drawImage(t3, x - gx, y - gy, C.O + 2 * gx, C.OH + 2 * gy); continue; }
      if (tile) { c.drawImage(tile, x, y, C.O, C.OH); continue; }
      rr(c, x, y, C.O, C.OH, 3); c.fillStyle = lg(c, x, y, x, y + C.OH, [[0, '#2a3142'], [0.5, '#1a1f2c'], [1, '#121621']]); c.fill();
      c.lineWidth = 1; c.strokeStyle = 'rgba(0,0,0,0.8)'; c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.07)'; c.fillRect(x + 2, y + 1, C.O - 4, 1);
      c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x + C.O / 2 - 0.5, y + 4, 1, C.OH - 8); c.fillRect(x + 4, y + C.OH / 2 - 0.5, C.O - 8, 1);
      c.fillStyle = 'rgba(140,160,200,0.25)'; for (const [px, py] of [[x + 3, y + 3], [x + C.O - 4, y + 3], [x + 3, y + C.OH - 4], [x + C.O - 4, y + C.OH - 4]]) c.fillRect(px, py, 1.2, 1.2);
    }
    const fr = co(B.ai ? 'v2:board_frame_top' : 'v2:board_frame_player');
    if (fr) { c.drawImage(fr, bx, by, bw, bh); return; }
    // khung graphite tối mảnh (không viền neon dày); chỉ nhấn màu nhỏ ở 4 góc (người chơi magenta / AI cyan)
    const V = C.VIEN;
    c.save(); c.beginPath(); rr(c, bx, by, bw, bh, 5); c.rect(bx + V, by + V, bw - 2 * V, bh - 2 * V); c.fillStyle = '#1a1f2b'; c.fill('evenodd'); c.restore();
    rr(c, bx + 0.5, by + 0.5, bw - 1, bh - 1, 5); c.lineWidth = 1; c.strokeStyle = '#3b4356'; c.stroke();
    c.strokeStyle = 'rgba(0,0,0,0.7)'; c.strokeRect(bx + V - 0.5, by + V - 0.5, bw - 2 * V + 1, bh - 2 * V + 1);
    c.save(); c.strokeStyle = hexA(m, 0.85); c.lineWidth = 1.5; c.lineCap = 'round';
    const g = 9, o = 2;
    for (const [px, py, sx, sy] of [[bx + o, by + o, 1, 1], [bx + bw - o, by + o, -1, 1], [bx + o, by + bh - o, 1, -1], [bx + bw - o, by + bh - o, -1, -1]]) {
      c.beginPath(); c.moveTo(px + sx * g, py); c.lineTo(px, py); c.lineTo(px, py + sy * g); c.stroke();
    }
    c.restore();
  }
  function veLanTinh(c, B) {   // làn quái dọc bên trái (x 42..92): đầu trên = cổng sinh, cuối dưới = cửa thoát
    const [[x, y0], [, y1]] = B.DUONG, w = C.LAN_X1 - C.LAN_X0, x0 = C.LAN_X0;
    const ln = co('v2:lane_straight');
    if (ln) c.drawImage(ln, x0, y0, w, y1 - y0);
    else {
      c.fillStyle = 'rgba(3,4,10,0.88)'; c.fillRect(x0, y0, w, y1 - y0);
      c.fillStyle = lg(c, x0, 0, x0 + w, 0, [[0, '#1c2130'], [0.12, '#0b0e18'], [0.88, '#0b0e18'], [1, '#1c2130']]); c.fillRect(x0 + 3, y0, w - 6, y1 - y0);
      c.fillStyle = '#2c3346'; c.fillRect(x0 + 3, y0, 1.5, y1 - y0); c.fillRect(x0 + w - 4.5, y0, 1.5, y1 - y0);
      c.fillStyle = 'rgba(255,50,70,0.55)'; for (let y = y0 + 14; y < y1 - 10; y += 16) { c.fillRect(x0 + 5, y, 2, 2); c.fillRect(x0 + w - 7, y, 2, 2); }
    }
    const sp = co('v2:lane_spawn'), ex = co('v2:lane_exit');
    if (sp) c.drawImage(sp, x - 22, y0 - 22, 44, 44);
    else { c.save(); neon(c, '#ff2b4d', 10); c.strokeStyle = '#ff2b4d'; c.lineWidth = 1.6; c.beginPath(); c.ellipse(x, y0, 17, 6, 0, 0, 7); c.stroke(); c.restore(); c.fillStyle = '#05000a'; c.beginPath(); c.ellipse(x, y0, 15, 5, 0, 0, 7); c.fill(); }
    if (ex) c.drawImage(ex, x - 22, y1 - 22, 44, 44);
    else { rr(c, x - 17, y1 - 6, 34, 12, 3); c.fillStyle = '#0a0d18'; c.fill(); c.save(); neon(c, '#ff3b3b', 8); c.strokeStyle = '#ff3b3b'; c.lineWidth = 1.4; c.stroke(); c.restore();
      c.fillStyle = '#ff3b3b'; for (let n = 0; n < 4; n++) c.fillRect(x - 12 + n * 7, y1 - 1, 4, 2); }
  }
  function taoLop(k0) {
    const k = Math.min(k0, 3);
    let sd = 5; const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    const tinh = mk(W, H, (c) => {
      const bg = co('v2:bg_arena_portrait');
      if (bg) c.drawImage(bg, 0, 0, W, H);
      else {   // hẻm cyberpunk tối (vẽ code): trời tím, 2 dải nhà xa, sàn lưới mờ
        c.fillStyle = lg(c, 0, 0, 0, H, [[0, '#04020c'], [0.3, '#0b0620'], [0.55, '#140832'], [0.8, '#090418'], [1, '#030108']]); c.fillRect(0, 0, W, H);
        c.fillStyle = rg(c, W / 2, H * 0.4, 10, 420, [[0, 'rgba(255,40,170,0.20)'], [0.5, 'rgba(90,30,200,0.08)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(0, 0, W, H);
        for (const [base, hMin, hMax, mau] of [[300, 40, 140, '#0e0824'], [600, 50, 170, '#0a061c']]) {
          let x = 0; while (x < W) { const w = 16 + r() * 34, hh = hMin + r() * (hMax - hMin); c.fillStyle = mau; c.fillRect(x, base - hh, w, hh);
            for (let yy = base - hh + 5; yy < base - 4; yy += 7) for (let xx = x + 3; xx < x + w - 3; xx += 6) if (r() < 0.12) { c.fillStyle = r() < 0.3 ? 'rgba(255,90,220,0.55)' : 'rgba(90,220,255,0.45)'; c.fillRect(xx, yy, 1.5, 1.5); }
            x += w + r() * 5; }
        }
        c.strokeStyle = 'rgba(80,200,255,0.06)'; c.lineWidth = 1;
        for (let y = 0; y < H; y += 24) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
        for (let x = 6; x < W; x += 24) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
      }
      // dải giữa (y 300..353): vệt nối thị giác giữa 2 bàn
      c.fillStyle = lg(c, 0, 300, 0, 353, [[0, 'rgba(0,0,0,0)'], [0.5, 'rgba(0,0,0,0.35)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(0, 300, W, 53);
      c.fillStyle = 'rgba(255,60,90,0.25)'; c.fillRect(C.LAN_X0 + 23, 273, 4, 101);
      for (const B of BANS) { veLanTinh(c, B); veBanTinh(c, B); }
    }, k);
    L = { tinh, toi: mk(W, H, (c) => { c.fillStyle = rg(c, W / 2, H / 2, 260, 620, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.55)']]); c.fillRect(0, 0, W, H); }, 1) };
    LK = k0;
  }
  // mưa
  const MUA = [];
  for (let i = 0; i < 110; i++) MUA.push({ x: Math.random() * (W + 80), y: Math.random() * H, v: 520 + Math.random() * 260, l: 8 + Math.random() * 12 });
  function veMua(c, dt) {
    const n = Q.cao ? MUA.length : 40;
    c.save(); c.lineWidth = 1; c.strokeStyle = 'rgba(170,210,255,0.16)'; c.beginPath();
    for (let i = 0; i < n; i++) { const m = MUA[i]; m.y += m.v * dt; m.x -= m.v * dt * 0.18; if (m.y > H) { m.y = -20; m.x = Math.random() * (W + 80); } if (m.x < -20) m.x += W + 80; c.moveTo(m.x, m.y); c.lineTo(m.x + m.l * 0.18, m.y - m.l); }
    c.stroke(); c.restore();
  }

  // ---------- hạt ----------
  const HAT = [];
  function no(x, y, m, n, v = 90, s = 1.8, song = 0.45) {
    if (!Q.cao) n = Math.ceil(n / 2);
    n = Math.min(n, Math.max(0, Q.hat - HAT.length));
    for (let i = 0; i < n; i++) { const g = Math.random() * 7, sp = v * (0.3 + Math.random()); HAT.push({ x, y, vx: Math.cos(g) * sp, vy: Math.sin(g) * sp - 15, t: 0, T: song * (0.6 + Math.random() * 0.8), m, s: s * (0.6 + Math.random() * 0.8) }); }
  }
  function veHat(c, dt) {
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = HAT.length - 1; i >= 0; i--) { const p = HAT[i]; p.t += dt; if (p.t >= p.T) { HAT.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy = p.vy * 0.94 + 50 * dt; c.globalAlpha = 1 - p.t / p.T; c.fillStyle = p.m; c.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); }
    c.restore();
  }

  // ================= TƯỚNG: sprite sheet khung vuông, neo chân (64,110)/128, scale 0.41 — chỉ đổi khung, không uốn/không ráp =================
  const HANG_MAU = ['#bff6ff', '#bff6ff', '#bff6ff', '#ffd84a', '#ffd84a', '#ff4fd8', '#b37bff'];
  const ANIM = { idle: { fps: 9, lap: true, n: 8 }, attack: { fps: 14, lap: false, n: 12 }, hurt: { fps: 12, lap: false, n: 4 }, summon: { fps: 12, lap: false, n: 8 } };
  const SC = 0.41, NEO_X = 64 / 128, NEO_Y = 110 / 128;
  const sheet = (id, a) => co(`v2:${id}:${a}`);
  function chonAnim(v, tg) {   // trạng thái hoạt ảnh theo thời gian trận (dừng trận = đứng hình)
    const dang = (a, t0) => t0 != null && tg - t0 >= 0 && tg - t0 < ANIM[a].n / ANIM[a].fps;
    if (dang('summon', v.sinhT) && sheet(v.id, 'summon')) return ['summon', tg - v.sinhT];
    if (dang('hurt', v.dauT) && sheet(v.id, 'hurt')) return ['hurt', tg - v.dauT];
    if (dang('attack', v.atkT) && sheet(v.id, 'attack')) return ['attack', tg - v.atkT];
    return ['idle', tg + v.uid * 0.37];
  }
  // vẽ 1 khung của sheet 1 hàng (frame vuông = chiều cao ảnh, số khung = rộng / cao), chân tại (x, chan)
  function veKhung(c, im, f, x, chan, sc, hang = 0, soHang = 1) {
    const fh = im.height / soHang, s = sc * 128 / fh;
    c.drawImage(im, f * fh, hang * fh, fh, fh, x - fh * NEO_X * s, chan - fh * NEO_Y * s, fh * s, fh * s);
  }
  const soKhung = (im, soHang = 1) => Math.max(1, Math.round(im.width / (im.height / soHang)));
  function veBong(c, x, y, w) {
    if (w === 16) { c.save(); c.globalAlpha = 0.2; c.fillStyle = '#07090F'; c.beginPath(); c.ellipse(x, y, 8, 2.5, 0, 0, 7); c.fill(); c.restore(); return; }   // bóng v3: ellipse 16×5
    const b = co('v2:unit_shadow');
    if (b) { c.drawImage(b, x - w / 2, y - w * 0.17, w, w * 0.34); return; }
    c.save(); c.fillStyle = 'rgba(0,0,0,0.42)'; c.beginPath(); c.ellipse(x, y, w / 2, w * 0.15, 0, 0, 7); c.fill(); c.restore();
  }
  function veSao(c, cx, cy, n) {   // nhãn sao: nền tối, sao vàng; đặt cố định (tâm ô, đỉnh ô + 2), không nhún theo người
    const bd = co('v2:star_badges');
    if (bd) { const nf = soKhung(bd), f = Math.min(n, nf) - 1, fh = bd.height, sz = 15; c.drawImage(bd, f * fh, 0, fh, fh, cx - sz / 2, cy - sz / 2, sz, sz); if (n > nf) { c.fillStyle = HANG_MAU[n - 1]; c.font = '900 6px Orbitron, sans-serif'; c.textAlign = 'center'; c.fillText('+', cx + sz / 2, cy - 2); } return; }
    const w = 5, tong = n * w, m = HANG_MAU[n - 1];
    rr(c, cx - tong / 2 - 2.5, cy - 3.5, tong + 5, 7, 2.5); c.fillStyle = 'rgba(2,4,12,0.85)'; c.fill(); c.lineWidth = 0.6; c.strokeStyle = hexA(m, 0.5); c.stroke();
    c.fillStyle = m;
    for (let i = 0; i < n; i++) { const px = cx - tong / 2 + w / 2 + i * w; c.beginPath(); for (let k = 0; k < 10; k++) { const g = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 0.95 : 2.2; c.lineTo(px + Math.cos(g) * r, cy + Math.sin(g) * r); } c.closePath(); c.fill(); }
  }
  // ---- v3 HIGH TOP-DOWN: cao 29px (rộng ≤ 40px), chân tại (cx, chan); không uốn / xoay / biến dạng ảnh ----
  const V3_CAO = 29, V3_RONG = 40, V3_ANIM = { idle: { fps: 9, lap: true }, attack: { fps: 14, lap: false } };
  const DO_V3 = new Map();
  function doSheet(im) {   // đo khung 0 của sheet: tỉ lệ để phần hình cao 29px + đáy phần hình (neo chân); khung vuông, số khung = rộng / cao
    let d = DO_V3.get(im); if (d) return d;
    const fh = im.height; d = { s: V3_CAO / fh, day: fh };
    try {
      const cv = document.createElement('canvas'); cv.width = fh; cv.height = fh; const g = cv.getContext('2d'); g.drawImage(im, 0, 0, fh, fh, 0, 0, fh, fh);
      const px = g.getImageData(0, 0, fh, fh).data; let x0 = fh, x1 = -1, y0 = fh, y1 = -1;
      for (let y = 0; y < fh; y++) for (let x = 0; x < fh; x++) if (px[(y * fh + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 >= 0) d = { s: Math.min(V3_CAO / (y1 - y0 + 1), V3_RONG / (x1 - x0 + 1)), day: y1 + 1 };
    } catch (e) { /* ảnh khác nguồn: dùng ước lượng */ }
    DO_V3.set(im, d); return d;
  }
  // ---- 8 hướng ----
  // hg (game.js): 0=E 1=SE 2=S 3=SW 4=W 5=NW 6=N 7=NE → [hướng ảnh nguồn, lật gương]
  const HG_ANH = [['w', true], ['sw', true], ['s', false], ['sw', false], ['w', false], ['nw', false], ['n', false], ['nw', true]];
  const LUI = { s: ['s', 'sw', 'w'], sw: ['sw', 's', 'w'], w: ['w', 'sw', 'nw', 's'], nw: ['nw', 'n', 'w'], n: ['n', 'nw', 'w'] };   // thiếu hướng → hướng gần nhất có ảnh (GLITCH: sw→s/w, nw→n)
  const coV3 = (id) => co('v3:' + id) || co(`v3:${id}:idle`) || HUONG5.some((d) => coHuong(id, d));
  const coHuong = (id, d) => co(`v3:${id}:${d}`) || co(`v3:${id}:idle:${d}`);
  function doKhung(im) {   // đo khung 0 (khung vuông cạnh = cao ảnh): hộp phần hình (alpha > 8)
    let d = DO_V3.get(im); if (d) return d;
    const fh = im.height; d = { fh, x0: 0, x1: fh - 1, y0: 0, y1: fh - 1 };
    try {
      const cv = document.createElement('canvas'); cv.width = fh; cv.height = fh; const g = cv.getContext('2d'); g.drawImage(im, 0, 0, fh, fh, 0, 0, fh, fh);
      const px = g.getImageData(0, 0, fh, fh).data; let x0 = fh, x1 = -1, y0 = fh, y1 = -1;
      for (let y = 0; y < fh; y++) for (let x = 0; x < fh; x++) if (px[(y * fh + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 >= 0) d = { fh, x0, x1, y0, y1 };
    } catch (e) { /* ảnh khác nguồn: dùng cả khung */ }
    DO_V3.set(im, d); return d;
  }
  function tiLeS(id) {   // tỉ lệ chung theo hướng S: phần hình cao 29px (rộng ≤ 40px), quy theo cạnh khung để mọi hướng cùng cỡ
    const im = co(`v3:${id}:idle:s`) || co(`v3:${id}:s`); if (!im) return null;
    const d = doKhung(im);
    return Math.min(V3_CAO / (d.y1 - d.y0 + 1), V3_RONG / (d.x1 - d.x0 + 1)) * d.fh;   // = số px hiển thị cho 1 cạnh khung
  }
  function veHuong(c, v, cx, chan, tg, i, nhun, giat) {   // ảnh theo hướng (sheet idle/attack hoặc ảnh tĩnh hướng đó); false nếu không có
    const [goc, lat] = HG_ANH[v.hg == null ? 2 : v.hg];
    const d = LUI[goc].find((h) => coHuong(v.id, h)); if (!d) return false;
    const canh = tiLeS(v.id) || (() => { const k = doKhung(coHuong(v.id, d)); return Math.min(V3_CAO / (k.y1 - k.y0 + 1), V3_RONG / (k.x1 - k.x0 + 1)) * k.fh; })();
    const idle = co(`v3:${v.id}:idle:${d}`), atk = co(`v3:${v.id}:attack:${d}`), tinh = co(`v3:${v.id}:${d}`);
    const dAtk = v.atkT != null ? tg - v.atkT : -1, dangDanh = atk && dAtk >= 0 && dAtk < soKhung(atk) / V3_ANIM.attack.fps;
    let im, f = 0, laSheet = false;
    if (dangDanh) { im = atk; f = Math.min(soKhung(atk) - 1, Math.floor(dAtk * V3_ANIM.attack.fps)); laSheet = true; }
    else if (idle) { im = idle; f = Math.floor((tg + (i || 0) * 0.173) * V3_ANIM.idle.fps) % soKhung(idle); laSheet = true; }
    else im = tinh;
    if (!im) return false;
    const k = doKhung(idle || tinh || im), fh = im.height, w = Math.min(canh, V3_RONG * k.fh / (k.x1 - k.x0 + 1));   // cạnh khung hiển thị; rộng phần hình hướng này vẫn ≤ 40px
    const day = (k.y1 + 1) * (w / k.fh);   // đáy phần hình khung đầu = chân → cùng 1 điểm mọi hướng
    let x = cx - w / 2, y = chan - day;
    if (!laSheet) {   // ảnh tĩnh: nhún + giật lùi ngược hướng nhìn như cũ
      const g = (v.hg == null ? 2 : v.hg) * Math.PI / 4;
      x -= Math.cos(g) * 1.5 * giat; y += nhun - Math.sin(g) * 1.5 * giat;
    }
    c.save();
    if (lat) { c.translate(cx * 2, 0); c.scale(-1, 1); }   // lật gương ngang quanh tâm ô
    c.drawImage(im, f * fh, 0, fh, fh, x, y, w, w);
    if (!laSheet && giat > 0) { c.globalCompositeOperation = 'lighter'; c.globalAlpha *= 0.35 * giat; c.drawImage(im, f * fh, 0, fh, fh, x, y, w, w); }   // chớp sáng nhẹ
    c.restore();
    return true;
  }
  function veXoay(c, v, cx, chan, tg, i, nhun, giat) {   // WARP drone: sheet idle_s/attack_s (hoặc ảnh tĩnh) xoay quanh tâm phần hình theo v.goc mượt; ảnh gốc nhìn S = 90°
    const idle = co(`v3:${v.id}:idle:s`), atk = co(`v3:${v.id}:attack:s`); if (!idle && !atk) return false;
    const dAtk = v.atkT != null ? tg - v.atkT : -1, dangDanh = atk && dAtk >= 0 && dAtk < soKhung(atk) / V3_ANIM.attack.fps;
    let im = idle, f = 0;
    if (dangDanh || !idle) { im = atk; f = dangDanh ? Math.min(soKhung(atk) - 1, Math.floor(dAtk * V3_ANIM.attack.fps)) : 0; }
    else f = Math.floor((tg + (i || 0) * 0.173) * V3_ANIM.idle.fps) % soKhung(idle);
    const k = doKhung(idle || atk), fh = im.height;
    const w = Math.min(V3_CAO / (k.y1 - k.y0 + 1), V3_RONG / (k.x1 - k.x0 + 1)) * k.fh, sc = w / k.fh;   // cạnh khung hiển thị
    const tx = (k.x0 + k.x1 + 1) / 2 * sc, ty = (k.y0 + k.y1 + 1) / 2 * sc, day = (k.y1 + 1) * sc;   // tâm phần hình trong khung (đã thu)
    const g = v.goc == null ? Math.PI / 2 : v.goc, tamY = chan - day + ty + (idle ? 0 : nhun);
    c.save(); c.translate(cx - Math.cos(g) * 1.5 * giat, tamY - Math.sin(g) * 1.5 * giat); c.rotate(g - Math.PI / 2);
    c.drawImage(im, f * fh, 0, fh, fh, -tx, -ty, w, w);
    c.restore(); return true;
  }
  function veV3(c, v, cx, chan, tg, i) {
    const nhun = i == null ? 0 : -1.5 * (0.5 - 0.5 * Math.cos(2 * Math.PI * (tg / 0.9 + i * 0.173)));   // nhún 0..1.5px, chu kỳ 0.9s, lệch pha theo ô
    const ban = v.atkT != null ? tg - v.atkT - C.TAC_DONG : -1, giat = ban >= 0 && ban < 0.16 ? 1 - ban / 0.16 : 0;   // lúc đạn phát
    if (XOAY_CODE.has(v.id) && veXoay(c, v, cx, chan, tg, i, nhun, giat)) return true;   // WARP: sheet S xoay theo góc
    if (!XOAY_CODE.has(v.id) && veHuong(c, v, cx, chan, tg, i, nhun, giat)) return true;   // 8 hướng (ưu tiên)
    const idle = co(`v3:${v.id}:idle`), atk = co(`v3:${v.id}:attack`);
    const dAtk = v.atkT != null ? tg - v.atkT : -1, dangDanh = atk && dAtk >= 0 && dAtk < soKhung(atk) / V3_ANIM.attack.fps;
    if (idle || dangDanh) {   // sheet v3 chung (không theo hướng): chỉ đổi khung — attack 14fps, idle 9fps lặp
      let im = idle, a = 'idle', el = tg + (i || 0) * 0.173;
      if (dangDanh) { im = atk; a = 'attack'; el = dAtk; }
      const n = soKhung(im), fh = im.height, fr = Math.floor(el * V3_ANIM[a].fps), f = V3_ANIM[a].lap ? fr % n : Math.min(n - 1, fr);
      const d = doSheet(idle || im), w = fh * d.s;
      c.drawImage(im, f * fh, 0, fh, fh, cx - w / 2, chan - d.day * d.s, w, w);
      return true;
    }
    const im = co('v3:' + v.id); if (!im) return false;
    const s = Math.min(V3_CAO / im.height, V3_RONG / im.width), w = im.width * s, h = im.height * s;
    if (XOAY_CODE.has(v.id)) {   // WARP drone: xoay cả ảnh quanh tâm hình theo góc mượt v.goc (ảnh gốc nhìn xuống = S = 90°)
      const tam = chan - h / 2 + nhun, g = v.goc == null ? Math.PI / 2 : v.goc;
      c.save(); c.translate(cx - Math.cos(g) * 1.5 * giat, tam - Math.sin(g) * 1.5 * giat); c.rotate(g - Math.PI / 2);
      c.drawImage(im, -w / 2, -h / 2, w, h);
      if (giat > 0) { c.globalCompositeOperation = 'lighter'; c.globalAlpha *= 0.35 * giat; c.drawImage(im, -w / 2, -h / 2, w, h); }
      c.restore(); return true;
    }
    const x = cx - w / 2 - (v.huong || -1) * 1.5 * giat, y = chan - h + nhun;   // giật lùi 1.5px ngược hướng bắn
    c.drawImage(im, x, y, w, h);
    if (giat > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha *= 0.35 * giat; c.drawImage(im, x, y, w, h); c.restore(); }   // chớp sáng nhẹ
    return true;
  }
  function veHinhTuong(c, v, cx, chan, tg, i) {   // chỉ sprite (không bóng/sao) — dùng cả khi kéo
    if (coV3(v.id)) {
      const hien = v.sinhT != null ? Math.min(1, (tg - v.sinhT) / 0.3) : 1;
      c.save(); c.globalAlpha *= Math.max(0, hien); const ok = veV3(c, v, cx, chan, tg, i); c.restore();
      if (ok) return;
    }
    const [a, el] = chonAnim(v, tg), im = sheet(v.id, a);
    if (im) { const A = ANIM[a], n = soKhung(im), fr = Math.floor(el * A.fps); veKhung(c, im, A.lap ? fr % n : Math.min(n - 1, fr), cx, chan, SC); return; }
    // chưa có ảnh v2: ảnh cũ nguyên khối (đứng yên) hoặc hình vẽ code; xuất hiện thì chỉ hiện dần (opacity)
    const hien = v.sinhT != null ? Math.min(1, (tg - v.sinhT) / 0.3) : 1;
    c.save(); c.globalAlpha *= Math.max(0, hien);
    const u = ANH['u:' + v.id];
    if (u && u.ok) veHinh(c, u, null, cx - 25, chan - 50, 50, 50);
    else c.drawImage(sprUnit(v.id), cx - 24, chan - 48 * 57 / 64, 48, 48);
    c.restore();
  }
  function veUnit(c, S, v, i, tg, t, hop) {
    const v3 = !!coV3(v.id);
    const [x, y] = G.oXY(S, i), cx = x + C.O / 2, chan = y + C.OH - (v3 ? 10 : 5), h = HANH[TUONG[v.id].hanh];
    veBong(c, cx, chan, v3 ? 16 : 20);
    if (hop) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = '#ffffff'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(cx, chan, 15, 4.5, 0, 0, 7); c.stroke(); c.restore(); }
    if (v.nong > 0) veGlow(c, '#ff3355', cx, chan - 14, 22, 0.45 + 0.15 * Math.sin(t * 12));
    if (v.corrT > 0) veGlow(c, '#c04dff', cx, chan - 14, 22, 0.4);
    veHinhTuong(c, v, cx, chan, tg, i);
    if (!sheet(v.id, 'attack') && !co(`v3:${v.id}:attack`) && !HUONG5.some((d) => co(`v3:${v.id}:attack:${d}`)) && v.atkT != null && tg - v.atkT > C.TAC_DONG - 0.05 && tg - v.atkT < C.TAC_DONG + 0.12) {   // chưa có sheet attack: chớp ở nòng lúc phát đạn
      const [mx, my] = G.nong(S, i, v); veGlow(c, h.mau, mx, my, 8, 0.9);
    }
  }
  function veNhanO(c, S, v, i) {   // sao + trạng thái boss (lớp trên cùng của bàn)
    const [x, y] = G.oXY(S, i), cx = x + C.O / 2;
    veSao(c, cx, coV3(v.id) ? y + 2 : y - 3, v.sao);   // v3: tướng cao 29px, đỉnh đầu ~ đỉnh ô + 6 → nhãn (cao 7px) ở đỉnh ô + 2 không che mặt
    if (v.nong > 0 || v.corrT > 0) {
      const tx = v.nong > 0 ? 'HOT ' + Math.ceil(v.nong) : 'BUG';
      c.font = '700 6.5px Orbitron, "Segoe UI", sans-serif'; c.textAlign = 'center'; c.lineWidth = 2.5; c.strokeStyle = 'rgba(0,0,0,0.85)';
      c.strokeText(tx, cx, y + C.OH - 1); c.fillStyle = v.nong > 0 ? '#ffb0b0' : '#e8b6ff'; c.fillText(tx, cx, y + C.OH - 1);
    }
  }
  // ---------- quái ----------
  const MAU_QUAI = { thuong: '#ff3355', nhanh: '#ff2bd6', trau: '#ff8a1a' };
  function veQuai(c, q, t, tg) {
    const w = q.co, yChan = q.y + 2, vao = q.daRa ? 1 : Math.min(1, (tg - (q.sinhT || 0)) / 0.5);
    c.save(); c.globalAlpha = vao;
    veBong(c, q.x, yChan, w * 0.8);
    const m = q.boss ? q.boss.mau : MAU_QUAI[q.kind];
    if (Q.cao) veGlow(c, m, q.x, yChan - w / 2, w * 0.7, 0.22);
    const sh = co(q.boss ? 'v2b:' + q.boss.id : 'v2q:' + q.kind);
    if (sh) {   // sheet nhiều hàng: quái 3 hàng idle/move/hurt ×8; boss 4 hàng idle/move/attack/hurt ×16
      const soHang = q.boss ? 4 : 3, hang = q.flash > 0 ? soHang - 1 : q.boss && q.tele ? 2 : q.choang > 0 ? 0 : 1;
      const n = soKhung(sh, soHang), f = Math.floor((tg + q.uid * 0.21) * (q.boss ? 12 : 10)) % n;
      veKhung(c, sh, f, q.x, yChan, w * 1.9 / 128, hang, soHang);
    } else {
      const hv = q.kind === 'thuong' || q.boss ? Math.sin(t * 4 + q.uid) * 1.2 : 0, s = q.boss ? w + 6 : w;
      if (q.boss && q.boss.id === 'overclock') { c.save(); c.translate(q.x, yChan - w / 2 - 2 + hv); c.rotate(t * 2.5); c.drawImage(sprBanh(), -s / 2 - 3, -s / 2 - 3, s + 6, s + 6); c.restore(); }
      const a = q.boss ? ANH['b:' + q.boss.id] : ANH['e:' + q.kind], sp = q.boss ? sprBoss(q.boss) : sprQuai(q.kind);
      veHinh(c, a, sp, q.x - s / 2, yChan - s + hv, s, s);
      if (q.flash > 0.045 && Q.cao) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(0.7, q.flash * 7) * vao; veHinh(c, a, sp, q.x - s / 2, yChan - s + hv, s, s); c.globalCompositeOperation = 'source-over'; c.globalAlpha = vao; }
    }
    const cy = yChan - w / 2;
    if (q.cham > 0) { c.save(); c.globalAlpha = 0.55 * vao; c.strokeStyle = '#5ee7ff'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(q.x, yChan, w * 0.42, 3.5, 0, 0, 7); c.stroke(); c.restore(); }
    if (q.chill > 0) { c.save(); c.strokeStyle = '#bff6ff'; c.lineWidth = 1.2; for (let k = 0; k < q.chill; k++) { const g = t * 2 + k * 2.09, r = w * 0.42; c.beginPath(); c.moveTo(q.x + Math.cos(g) * r, cy + Math.sin(g) * r * 0.5); c.lineTo(q.x + Math.cos(g) * (r + 4), cy + Math.sin(g) * (r + 4) * 0.5); c.stroke(); } c.restore(); }
    if (q.tox > 0) { c.fillStyle = '#b4ff2a'; for (let k = 0; k < q.tox; k++) c.fillRect(q.x - 8 + k * 4, yChan - w - 9, 3, 2); }
    if (q.breachT > 0) { c.save(); c.strokeStyle = '#00ffa3'; c.lineWidth = 1.1; const r = w * 0.5, j = Math.sin(t * 40 + q.uid) > 0.6 ? 2 : 0; c.beginPath(); c.moveTo(q.x - r + 4 + j, cy - r * 0.6); c.lineTo(q.x - r + j, cy - r * 0.6); c.lineTo(q.x - r + j, cy + r * 0.6); c.lineTo(q.x - r + 4 + j, cy + r * 0.6); c.moveTo(q.x + r - 4 - j, cy - r * 0.6); c.lineTo(q.x + r - j, cy - r * 0.6); c.lineTo(q.x + r - j, cy + r * 0.6); c.lineTo(q.x + r - 4 - j, cy + r * 0.6); c.stroke(); c.restore(); }
    if (q.bounty > 0) { c.save(); c.strokeStyle = '#4d8dff'; c.fillStyle = 'rgba(77,141,255,0.35)'; c.lineWidth = 1; hexP(c, q.x + w * 0.5, yChan - w - 4, 3.5, t); c.fill(); c.stroke(); c.restore(); }
    if (q.khien > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,120,120,0.85)'; c.lineWidth = 1.5; c.beginPath(); c.arc(q.x, cy, w * 0.55, 0, 7); c.stroke(); c.restore(); }
    if (q.nhanhT > 0) { c.save(); c.strokeStyle = 'rgba(255,200,60,0.8)'; c.lineWidth = 1; for (let k = 0; k < 3; k++) { const xx = q.x - 6 + k * 6, l = 5 + ((t * 30 + k * 13) % 5); c.beginPath(); c.moveTo(xx, cy - w * 0.4 - l); c.lineTo(xx, cy - w * 0.4); c.stroke(); } c.restore(); }
    if (q.echo) { c.save(); c.strokeStyle = '#ffb31a'; c.lineWidth = 1.2; c.setLineDash([3, 2]); c.lineDashOffset = -t * 20; c.beginPath(); c.arc(q.x, cy, w * 0.5, 0, 7); c.stroke(); c.restore(); }
    if (q.choang > 0) { c.save(); c.strokeStyle = '#c8ffe8'; c.lineWidth = 1; c.beginPath(); let px = q.x - 7, py = yChan - w - 3; c.moveTo(px, py); for (let k = 0; k < 5; k++) { px += 3; py += (k % 2 ? -3 : 3) * Math.sin(t * 30 + k); c.lineTo(px, py); } c.stroke(); c.restore(); }
    if (!q.boss) {
      const bw = 16, by = yChan - w - 5, k = Math.max(0, q.hp / q.max);
      c.fillStyle = 'rgba(2,4,12,0.85)'; c.fillRect(q.x - bw / 2 - 0.5, by - 0.5, bw + 1, 3);
      c.fillStyle = k > 0.4 ? '#3cffb0' : '#ff3c6e'; c.fillRect(q.x - bw / 2, by, bw * k, 2);
    } else {
      const bw = 34, by = yChan - w - 9, k = Math.max(0, q.hp / q.max);
      c.fillStyle = 'rgba(2,4,12,0.9)'; c.fillRect(q.x - bw / 2 - 1, by - 1, bw + 2, 5);
      c.fillStyle = q.boss.mau; c.fillRect(q.x - bw / 2, by, bw * k, 3);
    }
    c.restore();
  }
  // ---------- đạn ----------
  function veDan(c, d, tg) {
    const h = d.mau, g = d.goc != null ? d.goc : Math.atan2(d.q.y - d.y, d.q.x - d.x), dai = d.id === 'lance' ? 28 : d.id === 'venom' ? 8 : 10;
    const x1 = d.x - Math.cos(g) * dai, y1 = d.y - Math.sin(g) * dai;
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    c.strokeStyle = lg(c, x1, y1, d.x, d.y, [[0, hexA(h, 0)], [1, hexA(h, 0.95)]]); c.lineWidth = d.id === 'lance' ? 2.4 : d.id === 'venom' ? 1.2 : 2.6; c.beginPath(); c.moveTo(x1, y1); c.lineTo(d.x, d.y); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = d.id === 'venom' ? 0.6 : 1; c.beginPath(); c.moveTo((x1 + d.x) / 2, (y1 + d.y) / 2); c.lineTo(d.x, d.y); c.stroke();
    const vf = co('v2:' + VFX_TUONG[d.id]);
    if (vf) { const fh = vf.height, n = soKhung(vf), f = Math.floor(tg * 16) % n; c.drawImage(vf, f * fh, 0, fh, fh, d.x - 8, d.y - 8, 16, 16); }
    c.restore();
    if (!vf) veGlow(c, h, d.x, d.y, d.id === 'scorch' ? 8 : d.id === 'frost' ? 7 : 5, 0.95);
  }
  // ---------- hiệu ứng ----------
  const DA_THAY = new WeakSet();
  function sinhHat(S) {
    for (const f of S.fx) {
      if (DA_THAY.has(f)) continue; DA_THAY.add(f);
      const o = f.i != null ? G.oTam(S, f.i) : [f.x, f.y];
      if (f.k === 'no') no(o[0], o[1], '#ffc890', 8, 100, 2, 0.45);
      else if (f.k === 'gop') { no(o[0], o[1], '#ffffff', 12, 120, 1.8, 0.5); no(o[0], o[1], HANG_MAU[f.sao - 1], 10, 90, 2, 0.6); }
      else if (f.k === 'trieu') no(o[0], o[1] + 8, '#3ce7ff', 7, 50, 1.6, 0.45);
      else if (f.k === 'hoada') no(o[0], o[1], '#ff3b3b', 7, 70, 1.8, 0.45);
      else if (f.k === 'kn') no(o[0], o[1], f.mau, 12, 140, 2.2, 0.6);
      else if (f.k === 'thanh') no(S.B.RA[0], S.B.RA[1], '#ff3b3b', 14, 110, 2.2, 0.5);
      else if (f.k === 'hit') no(o[0], o[1], f.mau, f.to ? 4 : 2, 80, 1.6, 0.22);
      else if (f.k === 'vo') no(o[0], o[1], '#bff6ff', 7, 90, 2, 0.4);
      else if (f.k === 'plasma' || f.k === 'nhiet') no(o[0], o[1], '#ff9a50', 7, 80, 2, 0.35);
      else if (f.k === 'emp') no(o[0], o[1], '#00ffa3', 4, 60, 1.6, 0.3);
      else if (f.k === 'tien') { for (let n = 0; n < 3; n++) HAT.push({ x: o[0], y: o[1], vx: (Math.random() - 0.5) * 40, vy: -80 - Math.random() * 40, t: 0, T: 0.5, m: '#4d8dff', s: 2.5 }); }
      else if (f.k === 'boom') no(o[0], o[1], '#c79bff', 9, 100, 2, 0.45);
      else if (f.k === 'xung') no(o[0], o[1], '#ffd34a', 9, 110, 2, 0.45);
      else if (f.k === 'rail') no(f.x0, f.y0, '#ff8cc0', 4, 50, 1.6, 0.25);
    }
  }
  function veSheetFx(c, im, k, x, y, sz) { const fh = im.height, n = soKhung(im), f = Math.min(n - 1, Math.floor(k * n)); c.drawImage(im, f * fh, 0, fh, fh, x - sz / 2, y - sz / 2, sz, sz); }
  function veFx(c, S, f) {
    const k = f.t / f.T, o = f.i != null ? G.oTam(S, f.i) : [f.x, f.y], a = Math.max(0, 1 - k);
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a;
    if (f.k === 'trieu') {
      const im = co('v2:vfx_summon');
      if (im) { c.globalAlpha = 1; veSheetFx(c, im, k, o[0], o[1] + 6, 56); }
      else { c.fillStyle = lg(c, 0, o[1] - 50, 0, o[1] + 20, [[0, 'rgba(60,231,255,0)'], [0.7, 'rgba(60,231,255,0.6)'], [1, 'rgba(255,255,255,0.85)']]);
        const w = 28 * (1 - k * 0.7); c.fillRect(o[0] - w / 2, o[1] - 50, w, 70);
        c.strokeStyle = '#3ce7ff'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(o[0], o[1] + 17, 7 + 16 * k, 2.5 + 5 * k, 0, 0, 7); c.stroke(); }
    } else if (f.k === 'gop') {
      const im = co('v2:vfx_merge');
      if (im) { c.globalAlpha = 1; veSheetFx(c, im, k, o[0], o[1], 64); }
      else { c.strokeStyle = '#ffffff'; c.lineWidth = 2 * a + 1; c.beginPath(); c.arc(o[0], o[1], 5 + 30 * k, 0, 7); c.stroke();
        c.strokeStyle = HANG_MAU[f.sao - 1]; c.lineWidth = 1.5; c.beginPath(); c.arc(o[0], o[1], 3 + 20 * k, 0, 7); c.stroke();
        veGlow(c, '#ffffff', o[0], o[1], 26 * (1 - k) + 4, a); }
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = a; c.font = '900 9px Orbitron, "Segoe UI", sans-serif'; c.textAlign = 'center';
      c.lineWidth = 2.5; c.strokeStyle = 'rgba(0,0,0,0.8)'; c.strokeText('RANK ' + f.sao, o[0], o[1] - 26 - k * 8); c.fillStyle = '#ffffff'; c.fillText('RANK ' + f.sao, o[0], o[1] - 26 - k * 8);
    } else if (f.k === 'bac') {
      c.strokeStyle = '#3cffb0'; c.lineWidth = 1.5;
      for (let n = 0; n < 2; n++) { const yy = o[1] + 8 - k * 24 - n * 6; c.beginPath(); c.moveTo(o[0] - 6, yy + 4); c.lineTo(o[0], yy - 1); c.lineTo(o[0] + 6, yy + 4); c.stroke(); }
    } else if (f.k === 'no') {
      c.strokeStyle = '#ffd0a0'; c.lineWidth = 1.5; c.beginPath(); c.arc(o[0], o[1], 3 + f.r * 1.2 * k, 0, 7); c.stroke();
      veGlow(c, '#ff9a50', o[0], o[1], f.r * (1 - k) + 3, a);
    } else if (f.k === 'set') {
      c.lineJoin = 'round';
      const p = f.pts; c.beginPath(); c.moveTo(p[0][0], p[0][1]);
      for (let n = 1; n < p.length; n++) { const [x0, y0] = p[n - 1], [x1, y1] = p[n]; for (let s = 1; s <= 4; s++) { const kk = s / 4, j = s < 4 ? (Math.random() - 0.5) * 7 : 0; c.lineTo(x0 + (x1 - x0) * kk + j, y0 + (y1 - y0) * kk + j); } }
      c.strokeStyle = f.mau; c.lineWidth = 2.6; c.stroke(); c.strokeStyle = '#ffffff'; c.lineWidth = 1; c.stroke();
      for (const q of p.slice(1)) veGlow(c, f.mau, q[0], q[1], 9, a);
    } else if (f.k === 'hoada') {
      c.strokeStyle = f.mau || '#ff3b3b'; c.lineWidth = 1.5; hexP(c, o[0], o[1], 14 + 12 * k); c.stroke();
    } else if (f.k === 'hit') {
      const r0 = (f.to ? 9 : 6) * (0.4 + k); c.strokeStyle = f.to ? '#ffb31a' : '#ffffff'; c.lineWidth = 1.2;
      for (let n = 0; n < 4; n++) { const g = n * 1.571 + 0.4; c.beginPath(); c.moveTo(o[0] + Math.cos(g) * r0 * 0.4, o[1] + Math.sin(g) * r0 * 0.4); c.lineTo(o[0] + Math.cos(g) * r0, o[1] + Math.sin(g) * r0); c.stroke(); }
      veGlow(c, f.mau, o[0], o[1], r0, a);
    } else if (f.k === 'chem') {
      c.lineCap = 'round'; c.strokeStyle = f.mau; c.lineWidth = 3 * a + 1; c.beginPath(); c.arc(o[0] - 4, o[1] + 3, 11, -1.2 + k, 0.4 + k); c.stroke(); c.strokeStyle = '#ffffff'; c.lineWidth = 1; c.stroke();
    } else if (f.k === 'rail') {
      c.lineCap = 'round'; c.strokeStyle = f.mau; c.lineWidth = (f.focus ? 4.5 : 3.2) * a; c.beginPath(); c.moveTo(f.x0, f.y0); c.lineTo(f.x1, f.y1); c.stroke();
      c.strokeStyle = '#ffffff'; c.lineWidth = 1.1 * a; c.stroke(); veGlow(c, f.mau, f.x0, f.y0, 10, a);
    } else if (f.k === 'vo') {
      c.strokeStyle = '#5ee7ff'; c.lineWidth = 1.5; c.beginPath(); c.arc(o[0], o[1], f.r * (0.4 + k), 0, 7); c.stroke();
      c.fillStyle = '#dffaff'; for (let n = 0; n < 8; n++) { const g = n * 0.785, rr2 = f.r * (0.3 + k * 0.9), px = o[0] + Math.cos(g) * rr2, py = o[1] + Math.sin(g) * rr2; c.beginPath(); c.moveTo(px, py - 2); c.lineTo(px + 2, py + 1.5); c.lineTo(px - 2, py + 1.5); c.fill(); }
    } else if (f.k === 'plasma' || f.k === 'nhiet') {
      c.strokeStyle = f.k === 'nhiet' ? '#fff0d0' : '#ff6a2a'; c.lineWidth = 2; c.beginPath(); c.arc(o[0], o[1], (f.r || 15) * (0.3 + k), 0, 7); c.stroke(); veGlow(c, '#ff6a2a', o[0], o[1], (f.r || 15) * (1 - k * 0.5), a);
    } else if (f.k === 'emp') {
      c.strokeStyle = '#00ffa3'; c.lineWidth = 1.5; c.beginPath(); c.arc(o[0], o[1], f.r * (0.3 + k), 0, 7); c.stroke();
    } else if (f.k === 'lan') {
      c.strokeStyle = '#b4ff2a'; c.lineWidth = 1.2; for (const [px, py] of f.pts) { c.beginPath(); c.moveTo(o[0], o[1]); c.quadraticCurveTo((o[0] + px) / 2 + 12, (o[1] + py) / 2, o[0] + (px - o[0]) * Math.min(1, k * 1.6), o[1] + (py - o[1]) * Math.min(1, k * 1.6)); c.stroke(); }
    } else if (f.k === 'boom') {
      c.strokeStyle = '#a35cff'; c.lineWidth = 2; c.beginPath(); c.arc(o[0], o[1], f.r * (1 - k), 0, 7); c.stroke(); veGlow(c, '#a35cff', o[0], o[1], f.r * 0.6, a);
    } else if (f.k === 'xung') {
      c.strokeStyle = '#ffb31a'; c.lineWidth = 2; c.beginPath(); c.arc(o[0], o[1], 8 + 60 * k, 0, 7); c.stroke();
    } else if (f.k === 'kn') {
      c.strokeStyle = f.mau; c.lineWidth = 2; c.beginPath(); c.arc(o[0], o[1], 7 + 40 * k, 0, 7); c.stroke();
    }
    c.restore();
  }
  // ---------- vùng hiệu ứng trên làn ----------
  function veVung(c, S, z, t) {
    const k = z.t / z.T, a = Math.max(0, Math.min(1, (1 - k) * 3, z.t * 8));
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a;
    if (z.k === 'lua') {
      c.strokeStyle = 'rgba(255,106,42,0.55)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(z.x, z.y + 2, z.r, z.r * 0.45, 0, 0, 7); c.stroke();
      c.beginPath(); c.ellipse(z.x, z.y + 2, z.r * 0.6, z.r * 0.27, 0, 0, 7); c.stroke(); veGlow(c, '#ff6a2a', z.x, z.y, z.r * 0.9, 0.35);
      for (let n = 0; n < 3; n++) { const p = (t * 1.5 + n / 3) % 1; veGlow(c, '#ffb070', z.x - z.r * 0.5 + n * z.r * 0.5, z.y - p * 10, 2 * (1 - p) + 1, 0.8); }
    } else if (z.k === 'hut') {
      c.strokeStyle = '#a35cff'; c.lineWidth = 1.2;
      for (let n = 0; n < 3; n++) { const r = z.r * (0.45 + n * 0.25); c.beginPath(); c.ellipse(z.x, z.y - 3, r * 0.6, r, 0, t * 2.4 + n * 2, t * 2.4 + n * 2 + 2.2); c.stroke(); }
      c.fillStyle = '#e2ccff'; for (let n = 0; n < 8; n++) { const g = n * 0.785 + t, p = 1 - ((t * 1.3 + n * 0.1) % 1), r = z.r * p; c.fillRect(z.x + Math.cos(g) * r * 0.6 - 1, z.y - 3 + Math.sin(g) * r - 1, 2, 2); }
    } else if (z.k === 'bang') {
      c.fillStyle = 'rgba(94,231,255,0.18)'; c.strokeStyle = 'rgba(191,246,255,0.6)'; c.lineWidth = 1; c.beginPath(); c.ellipse(z.x, z.y + 2, z.r, z.r * 0.45, 0, 0, 7); c.fill(); c.stroke();
    } else if (z.k === 'tia') {
      c.strokeStyle = 'rgba(255,60,142,0.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(z.x0, z.y0); c.lineTo(z.x1, z.y1); c.stroke();
    } else if (z.k === 'ember') {
      c.lineCap = 'round'; c.strokeStyle = 'rgba(255,51,85,0.75)'; c.lineWidth = 2;
      const buoc = Math.max(2, 10 * S.B.P * 3);
      for (let d = z.d0; d < z.d1; d += buoc) { const [px, py] = G.viTri(S, d); const j = Math.sin(t * 12 + d) * 2; c.beginPath(); c.moveTo(px - 8, py + 2); c.lineTo(px + 8 + j, py - 2); c.stroke(); }
    }
    c.restore();
  }
  function veCanhBao(c, S, t) {   // cảnh báo kỹ năng boss + dây ký sinh
    const b = S.boss; if (!b) return;
    const m = b.boss.mau, nh = 0.55 + 0.45 * Math.sin(t * 18);
    for (const q of S.quai) if (q.linkT > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = '#ff2bd6'; c.lineWidth = 1.2; c.setLineDash([4, 3]); c.lineDashOffset = -t * 30; c.beginPath(); c.moveTo(b.x, b.y - b.co / 2); c.quadraticCurveTo(Math.max(b.x, q.x) + 20, (b.y + q.y) / 2, q.x, q.y - q.co / 2); c.stroke(); c.restore(); }
    const te = b.tele; if (!te) return;
    c.save(); c.globalAlpha = nh;
    if (te.k === 'lockdown') { const [x, y] = G.oXY(S, te.hang * C.COT); c.save(); neon(c, '#ff3355', 10); c.strokeStyle = '#ff3355'; c.lineWidth = 2; rr(c, x - 2, y - 2, S.B.SW, C.OH + 4, 6); c.stroke(); c.restore(); c.fillStyle = 'rgba(255,51,85,0.12)'; rr(c, x - 2, y - 2, S.B.SW, C.OH + 4, 6); c.fill(); }
    else if (te.k === 'infect') for (const i of te.o) { const [x, y] = G.oXY(S, i); c.save(); neon(c, '#c04dff', 10); c.strokeStyle = '#c04dff'; c.lineWidth = 2; rr(c, x, y, C.O, C.OH, 5); c.stroke(); c.restore(); }
    else if (te.k === 'ember') { c.strokeStyle = '#ff3355'; c.lineWidth = 4; c.setLineDash([5, 5]); c.beginPath(); for (let d = b.d; d <= b.d + 100 * S.B.P; d += 2) { const [px, py] = G.viTri(S, d); d === b.d ? c.moveTo(px, py) : c.lineTo(px, py); } c.stroke(); }
    else if (te.k === 'surge' || te.k === 'split') { c.strokeStyle = '#ffb31a'; c.lineWidth = 2; c.beginPath(); c.arc(b.x, b.y - b.co / 2, b.co * 0.7 + 10 * (te.t / te.T), 0, 7); c.stroke(); }
    else if (te.k === 'link') { c.strokeStyle = '#ff2bd6'; c.lineWidth = 1.2; for (const q of te.ds) { c.beginPath(); c.moveTo(b.x, b.y - b.co / 2); c.lineTo(q.x, q.y - q.co / 2); c.stroke(); } }
    c.restore();
    // thanh đếm ngược + tên chiêu cạnh boss (bên phải làn, không đè ô)
    const bw = 40, bx = C.LAN_X1 + 2, by = b.y - b.co - 4, kk = te.t / te.T;
    c.fillStyle = 'rgba(4,4,14,0.85)'; c.fillRect(bx - 1, by - 1, bw + 2, 4); c.fillStyle = m; c.fillRect(bx, by, bw * (1 - kk), 2);
    c.font = '700 6.5px Orbitron, "Segoe UI", sans-serif'; c.textAlign = 'left'; c.lineWidth = 2.5; c.strokeStyle = 'rgba(0,0,0,0.85)';
    c.strokeText('⚠ ' + te.ten, bx, by - 3); c.fillStyle = '#ffffff'; c.fillText('⚠ ' + te.ten, bx, by - 3);
  }
  // số sát thương nổi: sinh tại quái, trôi lên 12→22px trong 0.5s, chí mạng màu hổ phách
  function veSo(c, s) {
    const k = Math.min(1, s.t / 0.5), y = s.y - 12 - 10 * k;
    c.save(); c.globalAlpha = Math.min(1, 3.5 * (0.7 - s.t));
    c.font = `700 ${s.to ? 10 : 8.5}px Rajdhani, "Segoe UI", sans-serif`; c.textAlign = 'center';
    c.lineWidth = 2.5; c.strokeStyle = 'rgba(0,0,0,0.85)'; c.strokeText(s.v, s.x, y);
    c.fillStyle = s.lk ? '#fff4b0' : s.to ? '#ffb31a' : '#ffffff'; c.fillText(s.v, s.x, y);
    c.restore();
  }
  function veChuNhieu(c, txt, x, y, mau) {   // chữ tách màu (chromatic aberration)
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.7;
    c.fillStyle = '#ff2bd6'; c.fillText(txt, x - 1, y); c.fillStyle = '#3ce7ff'; c.fillText(txt, x + 1, y); c.restore();
    c.fillStyle = mau; c.fillText(txt, x, y);
  }
  // nhãn bàn: AI MIRROR (x112,y76) / PLAYER (x112,y363) + mạng + thanh máu boss bên phải
  function veNhanBan(c, S, ten, y) {
    c.font = '900 9px Orbitron, "Segoe UI", sans-serif'; c.textAlign = 'left';
    const m = S.ai ? '#3ce7ff' : '#ff2bd6', w = c.measureText(ten).width;
    c.lineWidth = 2.5; c.strokeStyle = 'rgba(0,0,0,0.8)'; c.strokeText(ten, 112, y + 9); c.fillStyle = m; c.fillText(ten, 112, y + 9);
    for (let i = 0; i < C.MANG; i++) { c.fillStyle = i < S.mang ? m : 'rgba(255,60,60,0.35)'; c.beginPath(); const x = 118 + w + i * 12; c.moveTo(x + 2, y + 2); c.lineTo(x + 11, y + 2); c.lineTo(x + 9, y + 9); c.lineTo(x, y + 9); c.closePath(); c.fill(); }
    if (S.boss) {
      const b = S.boss, bw = 110, bx = 361 - bw, kk = Math.max(0, b.hp / b.max);
      c.fillStyle = 'rgba(4,4,14,0.85)'; c.fillRect(bx - 1, y + 3, bw + 2, 6); c.fillStyle = b.boss.mau; c.fillRect(bx, y + 4, bw * kk, 4);
      c.font = '700 6.5px Orbitron, "Segoe UI", sans-serif'; c.textAlign = 'right'; c.fillStyle = '#ffffff'; c.strokeText(b.boss.ten, bx - 4, y + 9); c.fillText(b.boss.ten, bx - 4, y + 9);
    }
  }
  function veBan(c, S, t, keo) {   // 1 bàn: vùng → tướng → quái → đạn → fx → nhãn sao → số
    const tg = S.t;
    sinhHat(S);
    for (const z of S.vung) veVung(c, S, z, t);
    const goi = keo ? S.o[keo.i] : null;
    if (goi) {   // ô đích khi kéo: tile_active (ô trống) / tile_merge (ghép được)
      const ta = co('v2:tile_active'), tm = co('v2:tile_merge');
      for (let j = 0; j < S.o.length; j++) {
        if (j === keo.i) continue;
        const [x, y] = G.oXY(S, j), hop = G.gopDuoc(S, keo.i, j);
        if (hop) { if (tm) c.drawImage(tm, x, y, C.O, C.OH); else { c.save(); c.globalCompositeOperation = 'lighter'; rr(c, x, y, C.O, C.OH, 4); c.lineWidth = 1.5; c.strokeStyle = `rgba(255,43,214,${0.6 + 0.4 * Math.sin(t * 10)})`; c.stroke(); c.restore(); } }
        else if (!S.o[j] && keo.x >= x && keo.x < x + C.O && keo.y >= y && keo.y < y + C.OH) { if (ta) c.drawImage(ta, x, y, C.O, C.OH); else { rr(c, x, y, C.O, C.OH, 4); c.lineWidth = 1.5; c.strokeStyle = '#3ce7ff'; c.stroke(); } }
      }
    }
    for (let i = 0; i < S.o.length; i++) {
      const v = S.o[i]; if (!v) continue;
      if (keo && keo.i === i) { c.save(); c.globalAlpha = 0.25; veUnit(c, S, v, i, tg, t); c.restore(); continue; }
      const hop = goi && G.gopDuoc(S, keo.i, i);
      veUnit(c, S, v, i, tg, t, hop);
      if (goi && !hop) { const [x, y] = G.oXY(S, i); rr(c, x, y, C.O, C.OH, 3); c.fillStyle = 'rgba(0,0,8,0.55)'; c.fill(); }
    }
    const qs = S.quai.slice().sort((a, b) => a.y - b.y);
    for (const q of qs) veQuai(c, q, t, tg);
    for (const d of S.dan) veDan(c, d, tg);
    for (const f of S.fx) veFx(c, S, f);
    veCanhBao(c, S, t);
    for (let i = 0; i < S.o.length; i++) if (S.o[i] && !(keo && keo.i === i)) veNhanO(c, S, S.o[i], i);
  }
  function veSoBan(c, S) { for (const s of S.so) veSo(c, s); }

  // ---------- vẽ cả khung ----------
  let tTruoc = 0;
  function ve(c, S, t, k, keo, A) {
    const dt = Math.min(0.05, Math.max(0, t - tTruoc)); tTruoc = t;
    if (!L || LK !== k || batLai) { taoLop(k); batLai = false; for (let n = THE_VE.length - 1; n >= 0; n--) { if (THE_VE[n].cvs.isConnected) THE_VE[n].f(); else THE_VE.splice(n, 1); } }
    c.save();
    // rung màn ≤ 2px logic (chỉ sân, không rung HUD)
    if (S && S.rung > 0 && Q.cao) c.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
    c.drawImage(L.tinh, 0, 0, W, H);
    veMua(c, dt);
    // dòng chảy trên 2 làn
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineWidth = 2;
    for (const B of BANS) { const [[x, y0], [, y1]] = B.DUONG; c.beginPath(); c.moveTo(x, y0 + 8); c.lineTo(x, y1 - 8); c.setLineDash([3, 14]); c.lineDashOffset = -t * 30; c.strokeStyle = 'rgba(255,60,90,0.5)'; c.stroke(); }
    c.restore();
    if (S) {
      veNhanBan(c, A || { ai: true, mang: C.MANG }, 'AI MIRROR', 76);
      veNhanBan(c, S, 'PLAYER', 363);
      if (A) veBan(c, A, t, null);
      veBan(c, S, t, keo);
      veHat(c, dt);
      const goi = keo ? S.o[keo.i] : null;
      if (goi) {   // vòng tầm bắn: tâm ô đang trỏ tới (ô trống / ô gộp được), không thì ô gốc
        // mọi tướng trên bàn bắn được toàn bộ làn của bàn mình → tô sáng làn thay cho vòng tầm bắn
        const m = HANH[TUONG[goi.id].hanh].mau, [[, ly0], [, ly1]] = S.B.DUONG;
        c.save(); c.fillStyle = hexA(m, 0.08); c.fillRect(C.LAN_X0, ly0, C.LAN_X1 - C.LAN_X0, ly1 - ly0); c.lineWidth = 1; c.strokeStyle = hexA(m, 0.4); c.strokeRect(C.LAN_X0 + 0.5, ly0 + 0.5, C.LAN_X1 - C.LAN_X0 - 1, ly1 - ly0 - 1); c.restore();
        c.save(); c.globalAlpha = 0.95; veHinhTuong(c, goi, keo.x, keo.y + 16, S.t); c.restore();
      }
      if (A) veSoBan(c, A);
      veSoBan(c, S);
    } else veHat(c, dt);
    c.restore();
    c.drawImage(L.toi, 0, 0, W, H);
    if (S && S.fx.some((f) => f.k === 'thanh')) { c.save(); c.fillStyle = rg(c, W / 2, H / 2, 260, 620, [[0, 'rgba(255,0,40,0)'], [1, 'rgba(255,0,40,0.3)']]); c.fillRect(0, 0, W, H); c.restore(); }
    if (!S) return;
    if (S.bao) {   // dải thông báo đợt / boss: vùng giữa y 300..353 (không có nút chạm)
      const b = S.bao, a = Math.max(0, Math.min(1, b.t * 4, (b.T - b.t) * 3)), y0 = 300, hh = 53, cy = y0 + hh / 2, m = b.boss ? '#ff3b3b' : '#3ce7ff';
      c.save(); c.globalAlpha = a;
      const sx = (1 - Math.min(1, b.t * 5)) * 30;
      c.fillStyle = 'rgba(3,4,14,0.84)'; c.fillRect(0, y0, W, hh);
      c.save(); neon(c, m, 10); c.fillStyle = m; c.fillRect(0, y0, W, 1.2); c.fillRect(0, y0 + hh - 1.2, W, 1.2); c.restore();
      if (b.boss) { c.save(); c.beginPath(); c.rect(0, y0, W, hh); c.clip(); c.fillStyle = 'rgba(255,40,40,0.10)'; for (let x = -40 + ((t * 60) % 40); x < W; x += 40) { c.beginPath(); c.moveTo(x, y0 + hh); c.lineTo(x + 20, y0); c.lineTo(x + 34, y0); c.lineTo(x + 14, y0 + hh); c.fill(); } c.restore(); }
      c.textAlign = 'center';
      if (b.boss) { c.font = '700 7px Orbitron, "Segoe UI", sans-serif'; c.fillStyle = '#ff6b6b'; c.fillText('WARNING · BOSS INCOMING', W / 2, y0 + 10); }
      c.font = `900 ${b.boss ? 15 : 18}px Orbitron, "Segoe UI", sans-serif`;
      veChuNhieu(c, b.chu, W / 2 + sx, cy + (b.phu ? 4 : 6), '#ffffff');
      if (b.phu) { c.font = '600 9px Rajdhani, "Segoe UI", sans-serif'; c.fillStyle = '#ffd0d0'; c.fillText(b.phu.length > 70 ? b.phu.slice(0, 68) + '…' : b.phu, W / 2, cy + 17); }
      c.restore();
    }
  }
  // ---------- chân dung (thẻ UI): portraits_8.png nếu có, không thì ảnh cũ / hình vẽ code ----------
  const THU_TU_PORT = ['scorch', 'frost', 'arc', 'lance', 'warp', 'miner', 'glitch', 'venom'];
  const THE_VE = [];
  function veChanDungVao(c, id, w, h, cat) {   // cat: cắt bán thân (ảnh cũ toàn thân)
    const pt = co('v2:portraits_8');
    if (pt) { const fh = pt.height, f = THU_TU_PORT.indexOf(id), s = Math.max(w, h) / fh; c.drawImage(pt, f * fh, 0, fh, fh, (w - fh * s) / 2, (h - fh * s) / 2, fh * s, fh * s); return; }
    const a = ANH['u:' + id];
    if (a && a.ok) { const im = a.img, kk = Math.max(w / im.width, (h * (cat ? 1.25 : 1)) / im.height); c.drawImage(im, (w - im.width * kk) / 2, 0, im.width * kk, im.height * kk); }
    else { const sp = sprUnit(id); c.drawImage(sp, 8 * SS, 0, 48 * SS, 48 * SS * h / w, 0, 0, w, h); }
  }
  function veChanDung(cvs, id, px) {
    const k = Math.min(3, (window.devicePixelRatio || 1) * 2);
    cvs.width = Math.round(px * k); cvs.height = Math.round(px * k);
    const c = cvs.getContext('2d'); c.scale(k, k);
    const h = HANH[TUONG[id].hanh];
    const ve1 = () => { c.clearRect(0, 0, px, px); veGlow(c, h.mau, px / 2, px * 0.6, px * 0.6, 0.5); veChanDungVao(c, id, px, px, true); };
    ve1(); THE_VE.push({ cvs, f: ve1 });
  }
  // ẢNH THẺ TƯỚNG: nền màu hệ + chân dung (thẻ chọn tướng / thẻ nâng cấp)
  function veThe(cvs, id, w, h) {
    const k = Math.min(3, (window.devicePixelRatio || 1) * 2);
    cvs.width = Math.round(w * k); cvs.height = Math.round(h * k);
    const c = cvs.getContext('2d'); c.scale(k, k);
    const hh = HANH[TUONG[id].hanh];
    const ve1 = () => {
      c.clearRect(0, 0, w, h);
      c.fillStyle = lg(c, 0, 0, 0, h, [[0, '#05030e'], [0.55, hexA(hh.toi, 1)], [1, '#030208']]); c.fillRect(0, 0, w, h);
      veGlow(c, hh.mau, w / 2, h * 0.42, w * 0.95, 0.5);
      veChanDungVao(c, id, w, h, true);
      c.fillStyle = lg(c, 0, h * 0.62, 0, h, [[0, 'rgba(3,2,10,0)'], [1, 'rgba(3,2,10,0.92)']]); c.fillRect(0, h * 0.62, w, h * 0.38);
    };
    ve1(); THE_VE.push({ cvs, f: ve1 });
  }
  // FPS thấp liên tục → hạ chất lượng (ít mưa, ít hạt, tắt bóng phát sáng)
  let dem = 0, tong = 0;
  function doFps(dtMs) { tong += dtMs; if (++dem >= 90) { const tb = tong / dem; if (tb > 24 && Q.cao) { Q.cao = false; Q.hat = 90; } else if (tb < 15 && !Q.cao) { Q.cao = true; Q.hat = 200; } dem = 0; tong = 0; } }
  window.RENDER = { ve, veChanDung, veThe, ANH, Q, doFps, HAT };
})();
