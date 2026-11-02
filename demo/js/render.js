// DEMO "NEON GRID — Merge Defense" — đồ hoạ cyberpunk vẽ procedural bằng canvas (glow / bloom / mưa / parallax).
// Ảnh người dùng thả vào demo/assets/ (đúng tên trong docs/demo-hop-tuong/PROMPT-CHATGPT.md) được ưu tiên thay hình vẽ code.
'use strict';
(function () {
  const C = CAU_HINH, G = GAME;
  const W = C.W, H = C.H;
  const Q = { cao: true, hat: 260 };   // chất lượng: tự hạ khi FPS thấp

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
  for (const id of TUONG_IDS) nap('u:' + id, `assets/units/${id}.png`);
  for (const k in QUAI) nap('e:' + k, `assets/enemies/${k}.png`);
  for (const b of BOSS) nap('b:' + b.id, `assets/bosses/${b.id}.png`);
  for (const k of ['city', 'cell', 'core', 'portal']) nap(k, `assets/bg/${k}.png`);

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
  // TƯỚNG cyberpunk hình người (chibi, đầu to), quay phải. o = { da, da2 (da tối), ao, aoT (áo sáng→tối), tay, toc(c), sau(c), truoc(c), mat }
  function mat2(c, h, kieu) {
    if (kieu === 'visor') { c.save(); neon(c, h.mau, 10); rr(c, 31, 13.5, 13, 4.5, 2); c.fillStyle = h.mau; c.fill(); c.fillStyle = 'rgba(255,255,255,0.85)'; c.fillRect(36, 14.5, 5, 1.2); c.restore(); return; }
    c.fillStyle = '#ffffff'; c.fillRect(35, 15, 3, 2.6); c.fillRect(40.5, 15, 2.6, 2.6);
    c.fillStyle = '#0b0d15'; c.fillRect(36.4, 15.2, 1.6, 2.4); c.fillRect(41.6, 15.2, 1.5, 2.4);
    c.fillStyle = 'rgba(20,10,10,0.8)'; c.fillRect(34.5, 13.2, 4, 1); c.fillRect(40, 13.2, 3.4, 1);
    c.fillStyle = 'rgba(60,20,20,0.5)'; c.fillRect(38.5, 21.5, 3, 0.9);
  }
  function nguoi(c, h, o) {
    de(c, h);
    if (o.sau) o.sau(c);
    for (const x of [25, 33]) { rr(c, x, 41, 7, 12, 2); fillO(c, lg(c, x, 41, x + 7, 53, [[0, '#2a3044'], [1, '#10131e']])); rr(c, x - 0.5, 50.5, 8.5, 5.5, 2); fillO(c, '#0b0d15'); }
    c.save(); neon(c, h.mau, 6); c.fillStyle = h.mau; c.fillRect(26, 46, 5, 1.2); c.fillRect(34, 46, 5, 1.2); c.restore();
    rr(c, 18.5, 27, 6.5, 13, 3); fillO(c, o.tay || '#1d2336');
    c.beginPath(); c.moveTo(21, 25); c.lineTo(44, 25); c.lineTo(42, 43); c.lineTo(23, 43); c.closePath(); fillO(c, lg(c, 21, 25, 44, 43, [[0, o.ao], [1, o.aoT]])); vien(c, h.mau, 0.5);
    c.save(); neon(c, h.mau, 8); c.strokeStyle = h.mau; c.lineWidth = 1.2; c.beginPath(); c.moveTo(33, 26); c.lineTo(32, 39); c.moveTo(22, 26.5); c.lineTo(28, 26.5); c.stroke(); c.restore();
    c.fillStyle = '#0b0d15'; c.fillRect(23, 39.5, 19, 3); c.save(); neon(c, h.mau, 6); c.fillStyle = h.mau; c.fillRect(31.5, 40, 3, 2); c.restore();
    c.fillStyle = o.da2; c.fillRect(30, 23, 6, 3);
    c.beginPath(); c.arc(33, 15.5, 10.5, 0, 7); fillO(c, rg(c, 31, 12, 2, 12, [[0, o.da], [1, o.da2]]));
    c.save(); c.globalAlpha = 0.6; c.strokeStyle = '#3ce7ff'; c.lineWidth = 1; c.beginPath(); c.arc(33, 15.5, 10, Math.PI * 0.75, Math.PI * 1.25); c.stroke(); c.strokeStyle = '#ff2bd6'; c.beginPath(); c.arc(33, 15.5, 10, -0.3, 0.4); c.stroke(); c.restore();
    if (o.toc) o.toc(c);
    if (o.mat !== 'khong') mat2(c, h, o.mat);
    if (o.truoc) o.truoc(c);
  }
  const TOC = {
    mohawk: (m) => (c) => { c.beginPath(); c.arc(33, 15.5, 10.5, Math.PI * 1.02, Math.PI * 1.75); c.lineTo(33, 13); c.closePath(); fillO(c, '#15101a');
      c.save(); neon(c, m, 8); c.fillStyle = m; c.beginPath(); c.moveTo(24, 9); for (let k = 0; k < 5; k++) { c.lineTo(26 + k * 3.4, 1 + (k % 2) * 3); c.lineTo(28 + k * 3.4, 7); } c.lineTo(41, 8); c.closePath(); c.fill(); c.restore(); },
    dai: (m, mau) => (c) => { c.beginPath(); c.arc(33, 15, 11.5, Math.PI * 0.95, Math.PI * 2.05); c.quadraticCurveTo(44, 8, 37, 9); c.quadraticCurveTo(31, 12, 25, 11); c.closePath(); fillO(c, mau);
      c.save(); neon(c, m, 6); c.strokeStyle = m; c.lineWidth = 0.9; c.beginPath(); c.moveTo(26, 7); c.quadraticCurveTo(33, 3, 40, 6); c.stroke(); c.restore(); },
    nhon: (m, mau) => (c) => { c.beginPath(); c.moveTo(22, 15); for (let k = 0; k < 6; k++) { c.lineTo(23 + k * 3.8, k % 2 ? 1 : 4.5); c.lineTo(25 + k * 3.8, 8); } c.lineTo(44, 12); c.quadraticCurveTo(36, 9, 30, 11); c.lineTo(23, 18); c.closePath(); fillO(c, mau);
      c.save(); neon(c, m, 8); c.fillStyle = m; c.beginPath(); c.moveTo(33, 3); c.lineTo(36, 8); c.lineTo(32, 8); c.closePath(); c.fill(); c.restore(); },
    ngan: (mau) => (c) => { c.beginPath(); c.arc(33, 15.5, 10.8, Math.PI * 0.98, Math.PI * 2.02); c.quadraticCurveTo(40, 9, 33, 10); c.quadraticCurveTo(27, 10.5, 23, 14); c.closePath(); fillO(c, mau); },
    bui: (mau) => (c) => { c.beginPath(); c.arc(22.5, 10, 4.5, 0, 7); fillO(c, mau); TOC.ngan(mau)(c); },
    mu: (m) => (c) => { c.beginPath(); c.moveTo(20, 30); c.quadraticCurveTo(17, 10, 33, 2.5); c.quadraticCurveTo(48, 8, 46, 26); c.lineTo(41, 25); c.quadraticCurveTo(42, 12, 33, 9); c.quadraticCurveTo(26, 12, 26, 28); c.closePath();
      fillO(c, lg(c, 18, 2, 46, 30, [[0, '#3a4560'], [0.5, '#1a2032'], [1, '#080a12']])); vien(c, m, 0.4);
      c.beginPath(); c.moveTo(26, 24); c.quadraticCurveTo(26, 11, 34, 10); c.quadraticCurveTo(42, 12, 41.5, 24); c.closePath(); c.fillStyle = '#04060c'; c.fill(); },
  };
  const VE_UNIT = {
    scorch(c, h) {
      nguoi(c, h, { da: '#d9a07a', da2: '#9a6142', ao: '#6a3018', aoT: '#24100a', tay: '#2a1a14', mat: 'mat', toc: TOC.mohawk(h.mau),
        sau: (c) => { rr(c, 13, 24, 9, 19, 3); fillO(c, METAL(c, 13, 24, 22, 43)); c.save(); neon(c, h.mau, 8); c.fillStyle = h.mau; c.fillRect(15, 29, 5, 1.6); c.fillRect(15, 34, 5, 1.6); c.restore(); },
        truoc: (c) => {
          c.fillStyle = '#0b0d15'; c.fillRect(33, 12.5, 12, 2); c.save(); neon(c, h.mau, 6); c.fillStyle = hexA(h.mau, 0.9); c.fillRect(35, 11.5, 3.5, 2.6); c.fillRect(40.5, 11.5, 3.5, 2.6); c.restore();
          rr(c, 36, 28, 8, 11, 3); fillO(c, '#2a1a14');
          rr(c, 39, 29.5, 19, 9, 3); fillO(c, METAL(c, 39, 29.5, 58, 38.5)); c.fillStyle = '#05070e'; c.fillRect(56, 30.5, 4, 7);
          c.save(); neon(c, h.mau, 10); c.fillStyle = h.mau; c.fillRect(57, 32, 3, 4); c.fillRect(42, 33.3, 11, 1.5); c.restore(); } });
    },
    frost(c, h) {
      nguoi(c, h, { da: '#f4d4bd', da2: '#c99a80', ao: '#22577a', aoT: '#0a1828', tay: '#163a54', mat: 'mat', toc: TOC.dai(h.mau, '#d8f4ff'),
        sau: (c) => { c.beginPath(); c.moveTo(22, 12); c.quadraticCurveTo(18, 26, 22, 36); c.lineTo(30, 30); c.lineTo(28, 14); c.closePath(); fillO(c, '#c4e6f4'); },
        truoc: (c) => {
          c.strokeStyle = '#2a3348'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(48, 56); c.lineTo(48, 14); c.stroke(); c.strokeStyle = '#6b7a99'; c.lineWidth = 0.8; c.stroke();
          rr(c, 42, 28, 7.5, 7, 3); fillO(c, '#f4d4bd');
          c.save(); neon(c, h.mau, 16); c.beginPath(); c.moveTo(48, 1); c.lineTo(53, 9); c.lineTo(48, 17); c.lineTo(43, 9); c.closePath(); c.fillStyle = lg(c, 43, 1, 53, 17, [[0, '#ffffff'], [0.5, h.mau], [1, h.toi]]); c.fill(); c.restore();
          for (const [x, y] of [[56, 5], [41, 2], [57, 16]]) { c.save(); neon(c, h.mau, 8); c.fillStyle = h.sang; c.beginPath(); c.moveTo(x, y - 3); c.lineTo(x + 1.8, y); c.lineTo(x, y + 3); c.lineTo(x - 1.8, y); c.closePath(); c.fill(); c.restore(); } } });
    },
    arc(c, h) {
      nguoi(c, h, { da: '#e8b896', da2: '#a8764f', ao: '#3a3a44', aoT: '#101016', tay: '#22222c', mat: 'mat', toc: TOC.nhon(h.mau, '#12121a'),
        truoc: (c) => {
          c.save(); neon(c, h.mau, 14); c.strokeStyle = h.sang; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(45, 31); c.lineTo(61, 6); c.stroke(); c.restore();
          c.strokeStyle = '#1a1a22'; c.lineWidth = 3; c.beginPath(); c.moveTo(41, 37); c.lineTo(45, 31); c.stroke(); c.fillStyle = '#c9a64a'; c.fillRect(43.5, 31, 4, 1.6);
          rr(c, 38, 30, 8, 8, 3); fillO(c, '#e8b896');
          c.save(); neon(c, h.mau, 8); c.strokeStyle = h.mau; c.lineWidth = 1; c.beginPath(); c.moveTo(54, 10); c.lineTo(58, 13); c.lineTo(55, 15); c.lineTo(60, 19); c.moveTo(50, 20); c.lineTo(54, 22); c.stroke(); c.restore(); } });
    },
    lance(c, h) {
      nguoi(c, h, { da: '#9a6442', da2: '#5e3a24', ao: '#4a1830', aoT: '#140810', tay: '#2a1020', mat: 'visor', toc: TOC.ngan('#0e0a10'),
        truoc: (c) => {
          rr(c, 26, 29, 37, 5.5, 2); fillO(c, METAL(c, 26, 29, 63, 34.5));
          c.save(); neon(c, h.mau, 10); c.fillStyle = h.mau; c.fillRect(34, 31, 26, 1.4); c.restore();
          rr(c, 33, 24.5, 12, 4.5, 2); fillO(c, METAL(c, 33, 24.5, 45, 29)); c.save(); neon(c, h.mau, 10); c.fillStyle = h.mau; c.beginPath(); c.arc(44.5, 26.7, 1.8, 0, 7); c.fill(); c.restore();
          rr(c, 61, 28, 3, 7.5, 1); fillO(c, '#2a3348');
          rr(c, 37, 33, 7, 7, 3); fillO(c, '#9a6442'); } });
    },
    warp(c, h) {
      nguoi(c, h, { da: '#f1c7a5', da2: '#b98e70', ao: '#3a1a5e', aoT: '#0e0618', tay: '#261040', mat: 'mat', toc: TOC.dai(h.mau, '#2a1446'),
        sau: (c) => {
          c.save(); neon(c, h.mau, 14); c.strokeStyle = h.mau; c.lineWidth = 1.8; c.beginPath(); c.arc(31, 14, 16, 0, 7); c.stroke(); c.restore();
          for (let k = 0; k < 4; k++) { const g = k * Math.PI / 2 + 0.6; c.save(); neon(c, h.mau, 8); c.fillStyle = h.sang; c.fillRect(31 + Math.cos(g) * 16 - 1.5, 14 + Math.sin(g) * 16 - 1.5, 3, 3); c.restore(); }
          c.beginPath(); c.moveTo(21, 26); c.quadraticCurveTo(16, 44, 20, 55); c.lineTo(44, 55); c.quadraticCurveTo(46, 44, 43, 26); c.closePath(); fillO(c, lg(c, 16, 26, 46, 55, [[0, '#2a1446'], [1, '#08040e']])); },
        truoc: (c) => {
          rr(c, 39, 29, 7, 8, 3); fillO(c, '#f1c7a5');
          c.save(); neon(c, h.mau, 16); c.fillStyle = rg(c, 49, 31, 0, 6, [[0, '#ffffff'], [0.4, h.sang], [1, h.mau]]); c.beginPath(); c.arc(49, 31, 5, 0, 7); c.fill(); c.restore();
          c.save(); neon(c, h.mau, 6); c.strokeStyle = h.sang; c.lineWidth = 0.8; c.beginPath(); c.ellipse(49, 31, 8, 3, -0.4, 0, 7); c.stroke(); c.restore(); } });
    },
    miner(c, h) {
      nguoi(c, h, { da: '#c98d63', da2: '#8a5a3b', ao: '#1e3a6a', aoT: '#08101e', tay: '#142a4a', mat: 'visor', toc: TOC.bui('#1a0f0a'),
        truoc: (c) => {
          rr(c, 39, 29, 7, 8, 3); fillO(c, '#c98d63');
          c.save(); neon(c, h.mau, 10); c.fillStyle = hexA(h.mau, 0.3); c.strokeStyle = h.mau; c.lineWidth = 1; c.beginPath(); c.moveTo(42, 30); c.lineTo(58, 26); c.lineTo(58, 36); c.lineTo(42, 37); c.closePath(); c.fill(); c.stroke();
          c.fillStyle = h.mau; [3, 6, 4, 8].forEach((b, k) => c.fillRect(46 + k * 3, 35 - b, 1.8, b)); c.restore();
          c.save(); neon(c, '#ffe24a', 12); hexP(c, 52, 13, 6, Math.PI / 6); c.lineWidth = 1.5; c.strokeStyle = '#ffe24a'; c.stroke(); c.fillStyle = 'rgba(255,226,74,0.3)'; c.fill(); c.fillStyle = '#fff6c0'; c.fillRect(51, 9.5, 2, 7); c.restore(); } });
    },
    glitch(c, h) {
      nguoi(c, h, { da: '#d2a080', da2: '#8a6448', ao: '#0e2e24', aoT: '#04100c', tay: '#0a2018', mat: 'khong', toc: TOC.mu(h.mau),
        truoc: (c) => {
          c.save(); neon(c, h.mau, 14); rr(c, 29, 15, 13, 4, 2); c.fillStyle = h.mau; c.fill(); c.fillStyle = '#04120c'; c.fillRect(33, 16, 1.3, 2); c.fillRect(36, 16, 3, 0.9); c.restore();
          rr(c, 38, 31, 7, 7, 3); fillO(c, '#0a2018');
          rr(c, 42, 31.5, 13, 5, 1.5); fillO(c, METAL(c, 42, 31.5, 55, 36.5)); c.save(); neon(c, h.mau, 10); c.fillStyle = h.mau; c.fillRect(53, 32.5, 3, 3); c.restore();
          c.save(); neon(c, h.mau, 8); c.fillStyle = h.mau; c.globalAlpha = 0.85; for (const [x, y, w] of [[6, 14, 5], [7, 18, 3], [52, 8, 6], [55, 12, 3], [6, 40, 4]]) c.fillRect(x, y, w, 1.8); c.restore(); } });
    },
    venom(c, h) {
      nguoi(c, h, { da: '#9a6442', da2: '#5e3a24', ao: '#2e4010', aoT: '#0c1206', tay: '#1e2a0a', mat: 'mat', toc: TOC.nhon(h.mau, '#101408'),
        truoc: (c) => {
          rr(c, 31, 18.5, 13, 7, 3); fillO(c, METAL(c, 31, 18.5, 44, 25.5));
          c.save(); neon(c, h.mau, 8); c.fillStyle = h.mau; c.beginPath(); c.arc(35, 22.5, 1.6, 0, 7); c.arc(40.5, 22.5, 1.6, 0, 7); c.fill(); c.restore();
          for (const y of [29.5, 35]) { rr(c, 38, y, 7, 6, 3); fillO(c, '#1e2a0a'); rr(c, 42, y + 0.8, 13, 4, 1.5); fillO(c, METAL(c, 42, y, 55, y + 4)); c.save(); neon(c, h.mau, 10); c.fillStyle = h.mau; c.fillRect(54, y + 1.5, 3, 2); c.restore(); } } });
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

  // ---------- NỀN: trời + thành phố 2 lớp parallax + sàn lưới phối cảnh ----------
  let L = null, LK = 0;
  function taoLop(k0) {
    const k = Math.min(k0, 2), ks = Math.min(k0, 3);   // giới hạn bộ nhớ lớp nền trên máy dpr cao
    let sd = 5; const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    const WW = W * 2;
    const tinh = mk(W + 16, H + 16, (c) => {
      c.translate(8, 8);
      if (ANH.city.ok) { c.drawImage(ANH.city.img, -8, -8, W + 16, H + 16); return; }
      c.fillStyle = lg(c, 0, 0, 0, H, [[0, '#03010a'], [0.3, '#0c0422'], [0.46, '#2a0a48'], [0.5, '#3a0c4a'], [0.52, '#0c0620'], [1, '#030108']]); c.fillRect(-8, -8, W + 16, H + 16);
      c.fillStyle = rg(c, W / 2, 200, 10, 380, [[0, 'rgba(255,40,170,0.38)'], [0.4, 'rgba(120,30,200,0.16)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(-8, -8, W + 16, H + 16);
      for (let i = 0; i < 70; i++) { c.fillStyle = `rgba(200,220,255,${0.2 + r() * 0.5})`; c.fillRect(r() * W, r() * 110, 1, 1); }
      const hy = 202, vx = W / 2;
      c.strokeStyle = 'rgba(255,60,200,0.22)'; c.lineWidth = 1;
      for (let k2 = 0; k2 < 14; k2++) { const y = hy + Math.pow(k2 / 13, 2.1) * (H - hy + 20); c.globalAlpha = 0.3 + 0.7 * k2 / 13; c.beginPath(); c.moveTo(-8, y); c.lineTo(W + 8, y); c.stroke(); }
      c.globalAlpha = 1; c.strokeStyle = 'rgba(80,200,255,0.16)';
      for (let k2 = -16; k2 <= 16; k2++) { c.beginPath(); c.moveTo(vx + k2 * 8, hy); c.lineTo(vx + k2 * 110, H + 8); c.stroke(); }
      c.fillStyle = lg(c, 0, hy - 4, 0, hy + 30, [[0, 'rgba(255,80,210,0.5)'], [1, 'rgba(255,80,210,0)']]); c.fillRect(-8, hy - 2, W + 16, 32);
    }, k);
    const thanhPho = (base, hMin, hMax, mau, cuaSo, bien, n, dai) => mk(WW, H, (c) => {
      const toaNha = [];
      let x = 0; while (x < WW - 10) { const w = 18 + r() * dai; toaNha.push([x, Math.min(w, WW - x), hMin + r() * (hMax - hMin), r() < 0.35]); x += w + r() * 6; }
      for (const [x0, w, hh, ang] of toaNha) {
        c.fillStyle = mau; c.fillRect(x0, base - hh, w, H - base + hh);
        if (ang) c.fillRect(x0 + w * 0.4, base - hh - 10, 2, 10);
      }
      sd = n;
      for (const [x0, w, hh] of toaNha) {
        for (let yy = base - hh + 5; yy < base - 4; yy += 6) for (let xx = x0 + 3; xx < x0 + w - 3; xx += 5) {
          const q = r(); if (q < cuaSo) { c.fillStyle = q < cuaSo * 0.15 ? 'rgba(255,90,220,0.8)' : q < cuaSo * 0.35 ? 'rgba(90,220,255,0.75)' : 'rgba(255,210,150,0.35)'; c.fillRect(xx, yy, 2, 2); }
        }
        if (bien && r() < 0.3 && w > 22) {   // biển hiệu neon dọc
          const m = ['#ff3cac', '#3ce7ff', '#ffe24a', '#a35cff'][(r() * 4) | 0], sy = base - hh + 10 + r() * 30, sh = 22 + r() * 18;
          c.save(); neon(c, m, 10); c.fillStyle = m; c.fillRect(x0 + w - 7, sy, 4, sh); c.restore();
          c.fillStyle = 'rgba(0,0,0,0.55)'; for (let yy = sy + 3; yy < sy + sh; yy += 6) c.fillRect(x0 + w - 7, yy, 4, 1.2);
        }
        if (bien && r() < 0.2) { const m = ['#ff3cac', '#3ce7ff'][(r() * 2) | 0]; c.save(); neon(c, m, 8); c.fillStyle = m; c.fillRect(x0 + 2, base - hh, w - 4, 1.5); c.restore(); }
      }
    }, k);
    L = {
      tinh, xa: thanhPho(196, 40, 120, '#120a2c', 0.18, false, 3, 34), gan: thanhPho(214, 70, 170, '#07041a', 0.1, true, 9, 46), WW,
      mu: [0, 1, 2].map((i) => mk(256, 256, (c) => { const m = ['rgba(60,200,255,', 'rgba(255,50,190,', 'rgba(150,80,255,'][i]; c.fillStyle = rg(c, 128, 128, 0, 128, [[0, m + '0.5)'], [1, m + '0)']]); c.fillRect(0, 0, 256, 256); }, 1)),
      san: mk(W, H, (c) => veSanTinh(c), ks),
      toi: mk(W, H, (c) => { c.fillStyle = rg(c, W / 2, H / 2, 160, 520, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.7)']]); c.fillRect(0, 0, W, H); }, 1),
    };
    LK = k0;
  }
  // đường dẫn dữ liệu + tấm sân kính (tĩnh)
  function duongPath(c) { const P = G.DUONG; c.beginPath(); c.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) c.lineTo(P[i][0], P[i][1]); }
  function veSanTinh(c) {
    c.lineJoin = 'miter';
    duongPath(c); c.lineWidth = 36; c.strokeStyle = 'rgba(2,2,10,0.85)'; c.stroke();
    c.save(); neon(c, '#3ce7ff', 14); duongPath(c); c.lineWidth = 30; c.strokeStyle = '#3ce7ff'; c.stroke(); c.restore();
    duongPath(c); c.lineWidth = 27; c.strokeStyle = '#060818'; c.stroke();
    duongPath(c); c.lineWidth = 19; c.strokeStyle = '#0b1030'; c.stroke();
    c.save(); duongPath(c); c.setLineDash([2, 10]); c.lineWidth = 19; c.strokeStyle = 'rgba(60,231,255,0.10)'; c.stroke(); c.restore();
    const bx = G.OX - 6, by = G.OY - 6, bw = G.SW + 12, bh = G.SH + 12;
    c.save(); neon(c, 'rgba(0,0,0,0.9)', 20); rr(c, bx, by, bw, bh, 10); c.fillStyle = 'rgba(6,9,24,0.9)'; c.fill(); c.restore();
    rr(c, bx, by, bw, bh, 10); c.fillStyle = lg(c, bx, by, bx, by + bh, [[0, 'rgba(120,160,255,0.10)'], [0.5, 'rgba(60,80,160,0.03)'], [1, 'rgba(255,60,200,0.06)']]); c.fill();
    c.lineWidth = 1.5; c.strokeStyle = 'rgba(140,170,255,0.35)'; c.stroke();
    
    c.fillStyle = 'rgba(60,231,255,0.7)'; for (const [x, y] of [[bx + 3, by + 3], [bx + bw - 3, by + 3], [bx + 3, by + bh - 3], [bx + bw - 3, by + bh - 3]]) { c.beginPath(); c.arc(x, y, 1.6, 0, 7); c.fill(); }
    c.fillStyle = 'rgba(140,170,255,0.4)'; for (let k = 0; k < 10; k++) c.fillRect(bx + bw / 2 - 45 + k * 10, by + 1.5, 6, 1.2);
    for (let i = 0; i < C.COT * C.HANG; i++) {
      const [x, y] = G.oXY(i);
      if (ANH.cell.ok) { c.drawImage(ANH.cell.img, x, y, C.O, C.O); continue; }
      rr(c, x + 1, y + 1, C.O - 2, C.O - 2, 7); c.fillStyle = lg(c, x, y, x + C.O, y + C.O, [[0, 'rgba(130,180,255,0.10)'], [1, 'rgba(40,60,140,0.04)']]); c.fill();
      c.lineWidth = 1; c.strokeStyle = 'rgba(120,180,255,0.22)'; c.stroke();
      c.strokeStyle = 'rgba(60,231,255,0.55)'; c.lineWidth = 1.4; c.beginPath();
      const a = 8, e = 3;
      c.moveTo(x + e, y + e + a); c.lineTo(x + e, y + e); c.lineTo(x + e + a, y + e);
      c.moveTo(x + C.O - e - a, y + C.O - e); c.lineTo(x + C.O - e, y + C.O - e); c.lineTo(x + C.O - e, y + C.O - e - a); c.stroke();
      c.fillStyle = 'rgba(120,180,255,0.18)'; c.fillRect(x + C.O / 2 - 4, y + C.O / 2 - 0.5, 8, 1); c.fillRect(x + C.O / 2 - 0.5, y + C.O / 2 - 4, 1, 8);
    }
  }
  // mưa
  const MUA = [];
  for (let i = 0; i < 130; i++) MUA.push({ x: Math.random() * (W + 80), y: Math.random() * H, v: 520 + Math.random() * 260, l: 8 + Math.random() * 12 });
  function veMua(c, dt) {
    const n = Q.cao ? MUA.length : 50;
    c.save(); c.lineWidth = 1; c.strokeStyle = 'rgba(170,210,255,0.28)'; c.beginPath();
    for (let i = 0; i < n; i++) { const m = MUA[i]; m.y += m.v * dt; m.x -= m.v * dt * 0.18; if (m.y > H) { m.y = -20; m.x = Math.random() * (W + 80); } if (m.x < -20) m.x += W + 80; c.moveTo(m.x, m.y); c.lineTo(m.x + m.l * 0.18, m.y - m.l); }
    c.stroke(); c.restore();
  }

  // ---------- hạt ----------
  const HAT = [];
  function no(x, y, m, n, v = 120, s = 2.4, song = 0.5) {
    if (!Q.cao) n = Math.ceil(n / 2);
    n = Math.min(n, Math.max(0, Q.hat - HAT.length));
    for (let i = 0; i < n; i++) { const g = Math.random() * 7, sp = v * (0.3 + Math.random()); HAT.push({ x, y, vx: Math.cos(g) * sp, vy: Math.sin(g) * sp - 20, t: 0, T: song * (0.6 + Math.random() * 0.8), m, s: s * (0.6 + Math.random() * 0.8) }); }
  }
  function veHat(c, dt) {
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = HAT.length - 1; i >= 0; i--) { const p = HAT[i]; p.t += dt; if (p.t >= p.T) { HAT.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy = p.vy * 0.94 + 60 * dt; c.globalAlpha = 1 - p.t / p.T; c.fillStyle = p.m; c.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); }
    c.restore();
  }

  // ---------- vẽ unit trong ô ----------
  const HANG_MAU = ['#bff6ff', '#bff6ff', '#bff6ff', '#ffd84a', '#ffd84a', '#ff4fd8', '#b37bff'];
  function veVach(c, x, y, n) {   // vạch hạng neon (1–7)
    const w = 5, k = 2, tong = n * w + (n - 1) * k, x0 = x + C.O / 2 - tong / 2, m = HANG_MAU[n - 1];
    rr(c, x0 - 4, y + C.O - 13, tong + 8, 10, 3); c.fillStyle = 'rgba(2,4,12,0.88)'; c.fill(); c.lineWidth = 1; c.strokeStyle = hexA(m, 0.5); c.stroke();
    c.save(); if (Q.cao) neon(c, m, 6); c.fillStyle = m; for (let i = 0; i < n; i++) c.fillRect(x0 + i * (w + k), y + C.O - 10.5, w, 5); c.restore();
  }
  function veUnit(c, v, x, y, t, chon) {
    const td = TUONG[v.id], h = HANH[td.hanh];
    const s = v.moi > 0 ? 1 + Math.sin((v.moi / 0.5) * Math.PI) * 0.2 : 1;
    rr(c, x + 2, y + 2, C.O - 4, C.O - 4, 7); c.fillStyle = hexA(h.toi, 0.85); c.fill();
    c.save(); c.clip(); veGlow(c, h.mau, x + C.O / 2, y + C.O / 2 + 8, 40, 0.42 + 0.1 * Math.sin(t * 3 + v.uid)); c.restore();
    rr(c, x + 2, y + 2, C.O - 4, C.O - 4, 7); c.lineWidth = chon ? 2.5 : 1.4; c.strokeStyle = chon ? '#ffffff' : hexA(h.mau, 0.85);
    if (Q.cao) { c.save(); neon(c, h.mau, chon ? 14 : 7); c.stroke(); c.restore(); } else c.stroke();
    const bob = Math.sin(t * 2.4 + v.uid) * 1.1;
    const lui = v.danh > 0.18 && !v.da ? -1.5 : 0;
    c.save(); c.translate(x + C.O / 2, y + C.O - 6); c.scale(s, s); c.translate(-(x + C.O / 2), -(y + C.O - 6));
    veHinh(c, ANH['u:' + v.id], sprUnit(v.id), x + 4 + lui, y + 1 + bob, 56, 56);
    c.restore();
    if (v.danh > 0.15 && !v.da) { const tp = td.tip; veGlow(c, h.mau, x + 4 + tp[0] * 0.875, y + 1 + tp[1] * 0.875, 12, (v.danh - 0.15) / 0.15); }
    if (v.da > 0) {   // bị khoá (LOCKDOWN)
      rr(c, x + 2, y + 2, C.O - 4, C.O - 4, 7); c.fillStyle = 'rgba(40,0,6,0.72)'; c.fill();
      c.save(); c.clip(); c.fillStyle = 'rgba(255,60,60,0.22)'; for (let yy = y + ((t * 30) % 6); yy < y + C.O; yy += 6) c.fillRect(x, yy, C.O, 2); c.restore();
      c.save(); neon(c, '#ff3b3b', 10); c.strokeStyle = '#ff3b3b'; c.lineWidth = 2; rr(c, x + 2, y + 2, C.O - 4, C.O - 4, 7); c.stroke();
      c.fillStyle = '#ff3b3b'; rr(c, x + 24, y + 22, 16, 12, 2); c.fill(); c.lineWidth = 2.4; c.beginPath(); c.arc(x + 32, y + 22, 5, Math.PI, 0); c.stroke(); c.restore();
      c.fillStyle = '#ffd0d0'; c.font = '700 9px Orbitron, "Segoe UI", sans-serif'; c.textAlign = 'center'; c.fillText('LOCK ' + Math.ceil(v.da), x + C.O / 2, y + 45);
    }
    veVach(c, x, y, v.sao);
    c.save(); c.translate(x + 9, y + 9); c.rotate(Math.PI / 4); c.fillStyle = '#02040c'; c.fillRect(-4, -4, 8, 8); c.fillStyle = h.mau; c.fillRect(-2.6, -2.6, 5.2, 5.2); c.restore();
  }
  // ---------- quái ----------
  const MAU_QUAI = { thuong: '#ff3355', nhanh: '#ff2bd6', trau: '#ff8a1a' };
  function veQuai(c, q, t) {
    const w = q.co, hv = q.kind === 'thuong' || q.boss ? Math.sin(t * 4 + q.uid) * 2 : 0;
    const x = q.x - w / 2, yChan = q.y + 10, vao = Math.min(1, q.d / 26);
    c.save(); c.globalAlpha = vao;
    c.save(); c.globalAlpha = 0.5 * vao; c.fillStyle = '#000'; c.beginPath(); c.ellipse(q.x, q.y + 9, w * 0.36, 3.5, 0, 0, 7); c.fill(); c.restore();
    const m = q.boss ? q.boss.mau : MAU_QUAI[q.kind];
    if (Q.cao) veGlow(c, m, q.x, yChan - w / 2 + hv, w * 0.8, 0.28);
    if (q.boss) {
      if (q.boss.id === 'overclock') { c.save(); c.translate(q.x, yChan - w / 2 - 3 + hv); c.rotate(t * 2.5); c.drawImage(sprBanh(), -w / 2 - 4, -w / 2 - 4, w + 8, w + 8); c.restore(); }
      veHinh(c, ANH['b:' + q.boss.id], sprBoss(q.boss), x - 4, yChan - w - 8 + hv, w + 8, w + 8);
    } else {
      const sp = sprQuai(q.kind), a = ANH['e:' + q.kind];
      if (q.kind === 'nhanh' && Q.cao && Math.sin(t * 13 + q.uid) > 0.85 && !(a && a.ok)) {   // nhiễu glitch
        c.save(); c.globalAlpha = 0.6; c.globalCompositeOperation = 'lighter'; c.drawImage(sp, x + 3, yChan - w, w, w); c.restore();
      }
      veHinh(c, a, sp, x, yChan - w + hv, w, w);
    }
    if (q.cham > 0) { c.save(); c.globalAlpha = 0.55; c.strokeStyle = '#5ee7ff'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(q.x, q.y + 6, w * 0.45, 5, 0, 0, 7); c.stroke(); c.restore(); veGlow(c, '#5ee7ff', q.x, yChan - w / 2, w * 0.6, 0.3); }
    if (q.chayT > 0) for (let k = 0; k < 3; k++) { const p = (t * 2.5 + k / 3) % 1; veGlow(c, '#ff6a2a', q.x - 7 + k * 7, yChan - w * 0.3 - p * 18, 6 * (1 - p) + 2, 0.9); }
    if (q.dau > 0) { c.save(); c.strokeStyle = '#00ffa3'; c.lineWidth = 1.2; c.globalAlpha = 0.85; const cy = yChan - w / 2, r = w * 0.5; for (const [a0, a1] of [[0.2, 1.2], [1.8, 2.8], [3.4, 4.4], [5, 6]]) { c.beginPath(); c.arc(q.x, cy, r, a0 + t, a1 + t); c.stroke(); } c.restore(); }
    if (q.choang > 0) { c.save(); c.strokeStyle = '#c8ffe8'; c.lineWidth = 1.2; c.globalAlpha = 0.9; c.beginPath(); let px = q.x - 10, py = yChan - w - 4; c.moveTo(px, py); for (let k = 0; k < 5; k++) { px += 4; py += (k % 2 ? -4 : 4) * Math.sin(t * 30 + k); c.lineTo(px, py); } c.stroke(); c.restore(); }
    if (!q.boss) {
      const bw = Math.max(22, w * 0.75), by = yChan - w - 6, k = Math.max(0, q.hp / q.max);
      c.fillStyle = 'rgba(2,4,12,0.85)'; c.fillRect(q.x - bw / 2 - 1, by - 1, bw + 2, 4);
      c.fillStyle = k > 0.4 ? '#3cffb0' : '#ff3c6e'; c.fillRect(q.x - bw / 2, by, bw * k, 2);
    }
    c.restore();
  }
  // ---------- đạn ----------
  function veDan(c, d) {
    const h = d.mau, g = d.goc != null ? d.goc : Math.atan2(d.q.y - d.y, d.q.x - d.x), dai = d.id === 'lance' ? 46 : d.id === 'venom' ? 12 : 16;
    const x1 = d.x - Math.cos(g) * dai, y1 = d.y - Math.sin(g) * dai;
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    c.strokeStyle = lg(c, x1, y1, d.x, d.y, [[0, hexA(h, 0)], [1, hexA(h, 0.95)]]); c.lineWidth = d.id === 'lance' ? 3.4 : d.id === 'venom' ? 1.6 : 4; c.beginPath(); c.moveTo(x1, y1); c.lineTo(d.x, d.y); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = d.id === 'venom' ? 0.8 : 1.4; c.beginPath(); c.moveTo((x1 + d.x) / 2, (y1 + d.y) / 2); c.lineTo(d.x, d.y); c.stroke();
    c.restore();
    veGlow(c, h, d.x, d.y, d.id === 'scorch' ? 13 : d.id === 'frost' ? 11 : 8, 0.95);
  }
  // ---------- hiệu ứng ----------
  const DA_THAY = new WeakSet();
  function sinhHat(S) {
    for (const f of S.fx) {
      if (DA_THAY.has(f)) continue; DA_THAY.add(f);
      const o = f.i != null ? G.oTam(f.i) : [f.x, f.y];
      if (f.k === 'no') no(o[0], o[1], '#ffc890', 12, 140, 2.6, 0.5);
      else if (f.k === 'gop') { no(o[0], o[1], '#ffffff', 18, 170, 2.4, 0.6); no(o[0], o[1], HANG_MAU[f.sao - 1], 16, 120, 2.8, 0.7); }
      else if (f.k === 'trieu') no(o[0], o[1] + 10, '#3ce7ff', 10, 70, 2, 0.5);
      else if (f.k === 'song') no(o[0], o[1], '#bff6ff', 8, 90, 2, 0.4);
      else if (f.k === 'hoada') no(o[0], o[1], '#ff3b3b', 10, 90, 2.4, 0.5);
      else if (f.k === 'kn') no(o[0], o[1], f.mau, 20, 200, 3, 0.7);
      else if (f.k === 'thanh') no(W - 30, G.BOT - 18, '#ff3b3b', 20, 160, 3, 0.6);
    }
  }
  function veFx(c, f) {
    const k = f.t / f.T, o = f.i != null ? G.oTam(f.i) : [f.x, f.y], a = Math.max(0, 1 - k);
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a;
    if (f.k === 'trieu') {
      c.fillStyle = lg(c, 0, o[1] - 90, 0, o[1] + 30, [[0, 'rgba(60,231,255,0)'], [0.7, 'rgba(60,231,255,0.7)'], [1, 'rgba(255,255,255,0.9)']]);
      const w = 44 * (1 - k * 0.7); c.fillRect(o[0] - w / 2, o[1] - 90, w, 120);
      c.strokeStyle = '#3ce7ff'; c.lineWidth = 2; c.beginPath(); c.ellipse(o[0], o[1] + 22, 10 + 26 * k, 4 + 8 * k, 0, 0, 7); c.stroke();
    } else if (f.k === 'gop') {
      c.strokeStyle = '#ffffff'; c.lineWidth = 3 * a + 1; c.beginPath(); c.arc(o[0], o[1], 8 + 46 * k, 0, 7); c.stroke();
      c.strokeStyle = HANG_MAU[f.sao - 1]; c.lineWidth = 2; c.beginPath(); c.arc(o[0], o[1], 4 + 30 * k, 0, 7); c.stroke();
      veGlow(c, '#ffffff', o[0], o[1], 40 * (1 - k) + 6, a);
      c.globalCompositeOperation = 'source-over'; c.font = '900 13px Orbitron, "Segoe UI", sans-serif'; c.textAlign = 'center';
      c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.8)'; c.strokeText('RANK ' + f.sao, o[0], o[1] - 34 - k * 10); c.fillStyle = '#ffffff'; c.fillText('RANK ' + f.sao, o[0], o[1] - 34 - k * 10);
    } else if (f.k === 'bac') {
      c.strokeStyle = '#3cffb0'; c.lineWidth = 2;
      for (let n = 0; n < 2; n++) { const yy = o[1] + 12 - k * 34 - n * 9; c.beginPath(); c.moveTo(o[0] - 9, yy + 5); c.lineTo(o[0], yy - 2); c.lineTo(o[0] + 9, yy + 5); c.stroke(); }
    } else if (f.k === 'no') {
      c.strokeStyle = '#ffd0a0'; c.lineWidth = 2; c.beginPath(); c.arc(o[0], o[1], 4 + f.r * 1.3 * k, 0, 7); c.stroke();
      veGlow(c, '#ff9a50', o[0], o[1], f.r * (1 - k) + 4, a);
    } else if (f.k === 'set') {
      c.lineJoin = 'round';
      const p = f.pts; c.beginPath(); c.moveTo(p[0][0], p[0][1]);
      for (let n = 1; n < p.length; n++) { const [x0, y0] = p[n - 1], [x1, y1] = p[n]; for (let s = 1; s <= 4; s++) { const kk = s / 4, j = s < 4 ? (Math.random() - 0.5) * 12 : 0; c.lineTo(x0 + (x1 - x0) * kk + j, y0 + (y1 - y0) * kk + j); } }
      c.strokeStyle = f.mau; c.lineWidth = 4; c.stroke(); c.strokeStyle = '#ffffff'; c.lineWidth = 1.5; c.stroke();
      for (const q of p.slice(1)) veGlow(c, f.mau, q[0], q[1], 14, a);
    } else if (f.k === 'song') {
      c.strokeStyle = '#5ee7ff'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(o[0], o[1], 46 * k + 6, (46 * k + 6) * 0.55, 0, 0, 7); c.stroke();
      veGlow(c, '#5ee7ff', o[0], o[1], 30, a * 0.7);
    } else if (f.k === 'hoada') {
      c.strokeStyle = '#ff3b3b'; c.lineWidth = 2; hexP(c, o[0], o[1], 20 + 20 * k); c.stroke();
    } else if (f.k === 'xoay') {
      c.strokeStyle = '#ffb31a'; c.lineWidth = 2.5; c.beginPath(); c.arc(o[0], o[1], 26, k * 9, k * 9 + 3.5); c.stroke();
    } else if (f.k === 'hoi') {
      c.strokeStyle = '#c04dff'; c.lineWidth = 3; c.beginPath(); c.arc(o[0], o[1], 20 + 150 * k, 0, 7); c.stroke();
    } else if (f.k === 'kn') {
      c.strokeStyle = f.mau; c.lineWidth = 3; c.beginPath(); c.arc(o[0], o[1], 10 + 70 * k, 0, 7); c.stroke();
    }
    c.restore();
  }
  function veSo(c, s) {
    const k = s.t / 0.9, y = s.y - k * 24 - (s.to ? 4 : 0);
    c.save(); c.globalAlpha = Math.min(1, 2.4 * (1 - k));
    c.font = `700 ${s.to ? 16 : 13}px Rajdhani, "Segoe UI", sans-serif`; c.textAlign = 'center';
    c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.85)'; c.strokeText(s.v, s.x, y);
    if (Q.cao) neon(c, s.lk ? '#ffe24a' : s.mau || '#ffffff', 6);
    c.fillStyle = s.lk ? '#fff4b0' : '#ffffff'; c.fillText(s.v, s.x, y);
    c.restore();
  }
  // cổng quái (trái) + lõi CORE (phải)
  function veCong(c, t) {
    const x = 22, y = G.BOT - 6;
    if (ANH.portal.ok) { c.drawImage(ANH.portal.img, x - 30, y - 34, 60, 60); return; }
    veGlow(c, '#ff2bd6', x, y, 34, 0.55 + 0.15 * Math.sin(t * 5));
    c.save(); c.translate(x, y);
    c.beginPath(); c.ellipse(0, 0, 13, 19, 0, 0, 7); c.fillStyle = '#05000a'; c.fill();
    c.save(); neon(c, '#ff2bd6', 12); c.strokeStyle = '#ff2bd6'; c.lineWidth = 2; c.setLineDash([6, 5]); c.lineDashOffset = -t * 30; c.beginPath(); c.ellipse(0, 0, 15, 21, 0, 0, 7); c.stroke(); c.restore();
    c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 1; c.beginPath(); c.ellipse(0, 0, 9, 14, t, 0.5, 2.5); c.stroke();
    c.restore();
  }
  function veCore(c, t, dau) {
    const x = W - 32, y = G.BOT - 16, m = dau ? '#ff3b3b' : '#3ce7ff';
    if (ANH.core.ok) { c.drawImage(ANH.core.img, x - 36, y - 50, 72, 72); if (dau) veGlow(c, '#ff3b3b', x, y - 14, 50, 0.6); return; }
    veGlow(c, m, x, y - 12, 54, 0.45 + 0.12 * Math.sin(t * 3));
    c.save(); c.translate(x, y);
    hexP(c, 0, 4, 26, Math.PI / 6); c.fillStyle = '#060a18'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = hexA(m, 0.6); c.stroke();
    hexP(c, 0, -10, 18, 0); c.fillStyle = METAL(c, -18, -28, 18, 8); c.fill(); c.strokeStyle = '#03050a'; c.stroke();
    c.save(); neon(c, m, 16); c.fillStyle = rg(c, 0, -10, 1, 11, [[0, '#ffffff'], [0.4, m], [1, hexA(m, 0)]]); c.beginPath(); c.arc(0, -10, 10 + Math.sin(t * 4) * 1.2, 0, 7); c.fill(); c.restore();
    c.save(); neon(c, m, 8); c.strokeStyle = m; c.lineWidth = 1.3; c.beginPath(); c.ellipse(0, -10, 24, 7, t * 0.8, 0, 7); c.stroke(); c.beginPath(); c.ellipse(0, -10, 24, 7, -t * 0.8 + 1, 0, 7); c.stroke(); c.restore();
    c.fillStyle = hexA(m, 0.9); c.font = '700 8px Orbitron, sans-serif'; c.textAlign = 'center'; c.fillText('CORE', 0, 22);
    c.restore();
  }
  function veChuNhieu(c, txt, x, y, mau) {   // chữ tách màu (chromatic aberration)
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.75;
    c.fillStyle = '#ff2bd6'; c.fillText(txt, x - 1.5, y); c.fillStyle = '#3ce7ff'; c.fillText(txt, x + 1.5, y); c.restore();
    c.fillStyle = mau; c.fillText(txt, x, y);
  }

  // ---------- vẽ cả khung ----------
  let tTruoc = 0;
  function ve(c, S, t, k, keo) {
    const dt = Math.min(0.05, Math.max(0, t - tTruoc)); tTruoc = t;
    if (!L || LK !== k || batLai) { taoLop(k); batLai = false; }
    c.save();
    if (S && S.rung > 0 && Q.cao) { const r = S.rung * 7; c.translate((Math.random() - 0.5) * r, (Math.random() - 0.5) * r); }
    c.drawImage(L.tinh, -8, -8, W + 16, H + 16);
    if (!ANH.city.ok) {
      const ox = (t * 4) % L.WW, ox2 = (t * 11) % L.WW;
      c.drawImage(L.xa, -ox, 0, L.WW, H); c.drawImage(L.xa, L.WW - ox, 0, L.WW, H);
      c.drawImage(L.gan, -ox2, 0, L.WW, H); c.drawImage(L.gan, L.WW - ox2, 0, L.WW, H);
    }
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) { const x = (W * (0.2 + 0.32 * i) + Math.sin(t * 0.13 + i * 2) * 120), y = 150 + Math.sin(t * 0.2 + i) * 50; c.globalAlpha = Q.cao ? 0.35 : 0.2; c.drawImage(L.mu[i], x - 260, y - 160, 520, 320); }
    c.restore();
    veMua(c, dt);
    c.drawImage(L.san, 0, 0, W, H);
    // dòng dữ liệu chảy trên đường
    c.save(); c.globalCompositeOperation = 'lighter'; duongPath(c); c.lineJoin = 'miter';
    c.setLineDash([5, 23]); c.lineDashOffset = -t * 70; c.lineWidth = 3; c.strokeStyle = 'rgba(60,231,255,0.9)'; if (Q.cao) neon(c, '#3ce7ff', 8); c.stroke();
    c.setLineDash([2, 41]); c.lineDashOffset = -t * 120; c.lineWidth = 2; c.strokeStyle = 'rgba(255,80,220,0.9)'; c.stroke(); c.restore();
    // viền neon chạy quanh sân
    { const bx = G.OX - 6, by = G.OY - 6, bw = G.SW + 12, bh = G.SH + 12;
      c.save(); c.globalCompositeOperation = 'lighter'; rr(c, bx, by, bw, bh, 10); c.lineWidth = 2;
      if (Q.cao) neon(c, '#3ce7ff', 10);
      c.setLineDash([70, 330]); c.lineDashOffset = -t * 110; c.strokeStyle = '#3ce7ff'; c.stroke();
      c.lineDashOffset = -t * 110 - 200; c.strokeStyle = '#ff2bd6'; c.shadowColor = '#ff2bd6'; c.stroke(); c.restore(); }
    veCong(c, t);
    veCore(c, t, S && S.fx.some((f) => f.k === 'thanh'));
    if (S) {
      sinhHat(S);
      const goi = keo ? S.o[keo.i] : null;
      for (let i = 0; i < S.o.length; i++) {
        const v = S.o[i], [x, y] = G.oXY(i);
        if (!v) continue;
        if (keo && keo.i === i) { c.globalAlpha = 0.25; veUnit(c, v, x, y, t); c.globalAlpha = 1; continue; }
        const hop = goi && G.gopDuoc(S, keo.i, i);
        veUnit(c, v, x, y, t, hop);
        if (goi && !hop) { rr(c, x + 2, y + 2, C.O - 4, C.O - 4, 7); c.fillStyle = 'rgba(0,0,8,0.6)'; c.fill(); }
        if (hop) { c.save(); c.globalCompositeOperation = 'lighter'; rr(c, x - 2, y - 2, C.O + 4, C.O + 4, 9); c.lineWidth = 2; c.strokeStyle = `rgba(255,255,255,${0.5 + 0.5 * Math.sin(t * 10)})`; c.stroke(); c.restore(); }
      }
      const qs = S.quai.slice().sort((a, b) => a.y - b.y);
      for (const q of qs) veQuai(c, q, t);
      for (const d of S.dan) veDan(c, d);
      for (const f of S.fx) veFx(c, f);
      veHat(c, dt);
      if (goi) { c.save(); c.globalAlpha = 0.95; veUnit(c, goi, keo.x - C.O / 2, keo.y - C.O / 2 - 6, t, true); c.restore(); }
      for (const s of S.so) veSo(c, s);
    } else veHat(c, dt);
    c.restore();
    c.drawImage(L.toi, 0, 0, W, H);
    if (S && S.fx.some((f) => f.k === 'thanh')) { c.save(); c.fillStyle = rg(c, W / 2, H / 2, 200, 520, [[0, 'rgba(255,0,40,0)'], [1, 'rgba(255,0,40,0.35)']]); c.fillRect(0, 0, W, H); c.restore(); }
    if (!S) return;
    if (S.boss) {   // thanh giáp boss
      const b = S.boss, w = 270, x = W / 2 - w / 2, y = 8, kk = Math.max(0, b.hp / b.max), m = b.boss.mau;
      rr(c, x - 3, y - 3, w + 6, 12, 4); c.fillStyle = 'rgba(4,4,14,0.85)'; c.fill(); c.lineWidth = 1; c.strokeStyle = hexA(m, 0.7); c.stroke();
      c.save(); neon(c, m, 10); c.fillStyle = lg(c, x, 0, x + w, 0, [[0, m], [1, '#ffffff']]); c.fillRect(x, y, w * kk, 6); c.restore();
      c.fillStyle = 'rgba(0,0,0,0.35)'; for (let n = 1; n < 20; n++) c.fillRect(x + n * w / 20, y, 1, 6);
      c.font = '700 10px Orbitron, "Segoe UI", sans-serif'; c.textAlign = 'center';
      c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.85)'; const tx = `${b.boss.ten}  ·  ${b.boss.knTen}  ·  ${Math.ceil(b.hp)}`;
      c.strokeText(tx, W / 2, y + 22); c.fillStyle = '#ffffff'; c.fillText(tx, W / 2, y + 22);
    }
    if (S.bao) {   // băng thông báo đợt
      const b = S.bao, a = Math.max(0, Math.min(1, b.t * 4, (b.T - b.t) * 3)), cy = G.OY + G.SH / 2, hh = b.phu ? 62 : 40, m = b.boss ? '#ff3b3b' : '#3ce7ff';
      c.save(); c.globalAlpha = a;
      const sx = (1 - Math.min(1, b.t * 5)) * 40;
      c.fillStyle = 'rgba(3,4,14,0.84)'; c.fillRect(0, cy - hh / 2, W, hh);
      c.save(); neon(c, m, 12); c.fillStyle = m; c.fillRect(0, cy - hh / 2, W, 1.5); c.fillRect(0, cy + hh / 2 - 1.5, W, 1.5); c.restore();
      if (b.boss) { c.save(); c.beginPath(); c.rect(0, cy - hh / 2, W, hh); c.clip(); c.fillStyle = 'rgba(255,40,40,0.10)'; for (let x = -40 + ((t * 60) % 40); x < W; x += 40) { c.beginPath(); c.moveTo(x, cy + hh / 2); c.lineTo(x + 20, cy - hh / 2); c.lineTo(x + 34, cy - hh / 2); c.lineTo(x + 14, cy + hh / 2); c.fill(); } c.restore(); }
      c.textAlign = 'center';
      if (b.boss) { c.font = '700 10px Orbitron, "Segoe UI", sans-serif'; c.fillStyle = '#ff6b6b'; c.fillText('WARNING · BOSS INCOMING', W / 2, cy - hh / 2 + 14); }
      c.font = `900 ${b.boss ? 22 : 24}px Orbitron, "Segoe UI", sans-serif`;
      veChuNhieu(c, b.chu, W / 2 + sx, cy + (b.phu ? 7 : 9), '#ffffff');
      if (b.phu) { c.font = '600 13px Rajdhani, "Segoe UI", sans-serif'; c.fillStyle = '#ffd0d0'; c.fillText(b.phu, W / 2, cy + 24); }
      c.restore();
    }
  }
  // chân dung cho thẻ UI (sprite + quầng màu)
  function veChanDung(cvs, id, px) {
    const k = Math.min(3, (window.devicePixelRatio || 1) * 1.5);
    cvs.width = Math.round(px * k); cvs.height = Math.round(px * k);
    const c = cvs.getContext('2d'); c.scale(k, k);
    const h = HANH[TUONG[id].hanh];
    const ve1 = () => { c.clearRect(0, 0, px, px); veGlow(c, h.mau, px / 2, px * 0.6, px * 0.6, 0.55); veHinh(c, ANH['u:' + id], sprUnit(id), 0, 0, px, px); };
    ve1(); setTimeout(ve1, 500);
  }
  // FPS thấp liên tục → hạ chất lượng (ít mưa, ít hạt, tắt bóng phát sáng)
  let dem = 0, tong = 0;
  function doFps(dtMs) { tong += dtMs; if (++dem >= 90) { const tb = tong / dem; if (tb > 24 && Q.cao) { Q.cao = false; Q.hat = 90; } else if (tb < 15 && !Q.cao) { Q.cao = true; Q.hat = 260; } dem = 0; tong = 0; } }
  window.RENDER = { ve, veChanDung, ANH, Q, doFps, HAT };
})();
