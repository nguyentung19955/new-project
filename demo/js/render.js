// DEMO "NEON GRID — Merge Defense" — đồ hoạ cyberpunk vẽ procedural bằng canvas (glow / bloom / mưa / parallax).
// Ảnh người dùng thả vào demo/assets/ (đúng tên trong docs/demo-hop-tuong/PROMPT-CHATGPT.md) được ưu tiên thay hình vẽ code.
'use strict';
// ---------- LÀM MƯỢT TƯỚNG PIXEL v4 (SENTINEL / PULSE / ANCHOR) — chỉ code hiển thị, không đổi pixel ảnh ----------
// Thông số ở MUOT (ngay dưới):
//   TRE 30°      vùng trễ: giữ hướng đang nhìn tới khi góc tới mục tiêu (v.gocMuc) lệch khỏi TÂM hướng đó > 30°; hết quái → giữ hướng cuối.
//   DOI_MIN 0,15s đổi hướng đích tối đa 1 lần mỗi 0,15 s.
//   HOA_1 130ms   đổi sang hướng kề: vẽ cả 2 ảnh, alpha A giảm / B tăng (B vẽ trên, alpha = min(1, 2k) mỗi bên → không lộ nền giữa chừng).
//   HOA_BUOC 110ms mỗi bước kề khi phải đi qua nhiều hướng (nối tiếp, không nhảy cóc; quay 180° đi vòng qua S).
//   Tấn công: thời gian khung ở data.js TUONG[id].px.atk.nhip (ms). Khung 0 = tư thế đứng → không phát; nhip[0] (60) = hoà ảnh đứng → khung 1;
//     SENTINEL 60/60/110/130 (trung khung 1), PULSE & ANCHOR 60/90/60/120 (trung khung 2); hết chuỗi hoà về ảnh đứng HOA_VE 80ms.
//   THO_T 1,6s   thở: dịch thân 0/−1 px theo px sprite gốc (làm tròn, không co giãn/xoay), lệch pha ngẫu nhiên từng tướng; tắt khi đang đánh.
//   Vẽ: imageSmoothingEnabled = false, góc ảnh bắt đúng lưới pixel thiết bị.
//   (04/11 bộ v9 SCORCH/FROST/ARC) P.dir8.doc = sheet đứng 8 HÀNG × n khung (khung 0 = ảnh đứng); P.tho { ms, n } = thở bằng khung ảnh thật
//     (lặp n khung, ms/khung, lệch pha mỗi tướng; tắt nhún code THO_PX). P.fx = tên bộ hiệu ứng ChatGPT fx_<ten>_phat|bay|trung.png (1 hàng 6 khung).
(function () {
  const C = CAU_HINH, G = GAME;
  const W = C.W; let H = C.H;   // H (chiều cao logic) đổi theo màn — ve() dựng lại lớp tĩnh khi đổi
  const Q = { cao: true, hat: 200 };   // chất lượng: tự hạ khi FPS thấp
  const FX9 = { phat: 24, bay: 22, trung: 34, kn: 60 };   // cỡ hiển thị (px logic) hiệu ứng bộ v9
  const MUOT = { TRE: 30, DOI_MIN: 0.25, HOA_1: 0.13, HOA_BUOC: 0.11, HOA_VE: 0.08, THO_T: 1.6, THO_PX: 1 };   // xem ghi chú đầu file

  // ---------- ảnh người dùng (tuỳ chọn) ----------
  const ANH = {};
  // C.SHEET_TUONG = false (mặc định): KHÔNG nạp/chạy sheet idle/attack — chỉ ảnh tĩnh theo hướng (+ <anh>_atk_<dir>.png nếu có)
  const SHEET = !!C.SHEET_TUONG, ANIM_TEN = SHEET ? ['idle', 'attack'] : [];
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

  for (const b of BOSS) nap('b:' + b.id, `assets/bosses/${b.id}.png`);
  // ảnh v2 theo đặc tả mục 4 (demo/assets/v2/): có file là tự dùng, chưa có thì dùng ảnh cũ / hình vẽ code
  const V2 = 'assets/v2/';
  if (SHEET) for (const id of TUONG_IDS) for (const a of ['idle', 'attack', 'hurt', 'summon']) nap(`v2:${id}:${a}`, `${V2}${TEN_FILE(id)}_${a}.png`);
  for (const k of ['bg_arena_portrait', 'board_frame_top', 'board_frame_player', 'tile_normal', 'tile_active', 'tile_merge',
    'lane_straight', 'lane_spawn', 'lane_exit', 'star_badges', 'unit_shadow', 'portraits_8', 'portraits_boss_3', 'leader_portrait',
    'vfx_fire', 'vfx_ice', 'vfx_chain', 'vfx_sniper', 'vfx_void', 'vfx_bounty', 'vfx_hack', 'vfx_poison', 'vfx_merge', 'vfx_summon',
    'board_overlay_fx']) nap('v2:' + k, `${V2}${k}.png`);
  // ảnh v3 HIGH TOP-DOWN (demo/assets/v3/): ảnh tĩnh mỗi tướng + tile; sheet <id>_idle/_attack (nếu có) được ưu tiên
  const V3 = 'assets/v3/';
  // C.SHEET_TUONG = false (mặc định): KHÔNG nạp/chạy sheet idle/attack — chỉ ảnh tĩnh theo hướng (+ <anh>_atk_<dir>.png nếu có)
  for (const id of TUONG_IDS) { nap(`v3:${id}`, `${V3}${TEN_FILE(id)}.png`); for (const a of ANIM_TEN) nap(`v3:${id}:${a}`, `${V3}${TEN_FILE(id)}_${a}.png`); }
  // 8 hướng: ảnh vẽ 5 hướng s, sw, w, nw, n (<id>_<dir>.png, sheet <id>_idle_<dir>.png / <id>_attack_<dir>.png); SE/E/NE = lật gương SW/W/NW.
  // WARP (drone) không có ảnh hướng: xoay ảnh bằng code theo góc tới mục tiêu.
  const HUONG5 = ['s', 'sw', 'w', 'nw', 'n'], XOAY_CODE = new Set(TUONG_IDS.filter((id) => TUONG[id].xoay));   // tướng xoay ảnh bằng code (dữ liệu: xoay: true)
  for (const id of TUONG_IDS) if (XOAY_CODE.has(id)) { for (const a of ANIM_TEN) nap(`v3:${id}:${a}:s`, `${V3}${TEN_FILE(id)}_${a}_s.png`); nap(`v3:${id}:atk:s`, `${V3}${TEN_FILE(id)}_atk_s.png`); }   // WARP: ảnh tĩnh xoay bằng code
  else for (const d of HUONG5) {
    nap(`v3:${id}:${d}`, `${V3}${TEN_FILE(id)}_${d}.png`);
    nap(`v3:${id}:atk:${d}`, `${V3}${TEN_FILE(id)}_atk_${d}.png`);   // ảnh ra đòn (ChatGPT vẽ sau) — có thì đổi sang ~C.ATK_ANH giây lúc bắn
    for (const a of ANIM_TEN) nap(`v3:${id}:${a}:${d}`, `${V3}${TEN_FILE(id)}_${a}_${d}.png`);
  }
  nap('v3:tile', `${V3}tile.png`);
  // chân dung thẻ v3 (portrait_<id>.png; id 'miner' thử cả portrait_broker.png); quái/trùm đi bộ (1 hàng khung vuông, nhìn xuống = hướng đi);
  // hiệu ứng trúng đòn 4 loại + summon/merge (1 hàng 6 khung). Thiếu file nào thì giữ cách cũ.
  for (const id of TUONG_IDS) { nap('v3p:' + id, `${V3}portrait_${id}.png`); if (TEN_FILE(id) !== id) nap('v3p2:' + id, `${V3}portrait_${TEN_FILE(id)}.png`); }
  for (const k in QUAI) nap('v3q:' + k, `${V3}bug_${k}_walk.png`);          // 4 BỌ thường: 6 khung vuông 112
  for (const k in TINH_ANH) nap('v3ta:' + k, `${V3}elite_${k}_walk.png`);  // 4 TINH ANH: 6 khung vuông 128
  for (const b of BOSS) nap('v3b:' + b.id, `${V3}boss_${b.id}_walk.png`);
  for (const l of ['kinetic', 'frost', 'flame', 'electric']) nap('v3fx:' + l, `${V3}vfx_hit_${l}.png`);
  // ĐẠN: proj_<proj|anh>.png — 1 hàng 4 khung, cao 48, khung = rộng/4, đầu đạn hướng PHẢI; chỉ dùng khung 1–2 (nhỏ, gọn)
  for (const id of TUONG_IDS) nap('v3proj:' + id, `${V3}proj_${TUONG[id].proj || TEN_FILE(id)}.png`);
  for (const id in ARCHFIEND) nap('v3af:' + id, `${V3}archfiend_${id}.png`);   // chân dung Archfiend riêng (nếu sau này có); chưa có thì dùng portrait tạm
  for (const k of ['vfx_summon', 'vfx_merge']) nap('v3:' + k, `${V3}${k}.png`);
  BOSS.forEach((b, n) => nap('v2b:' + b.id, `${V2}boss_0${n + 1}_sheet.png`));
  const co = (k) => ANH[k] && ANH[k].ok ? ANH[k].img : null;
  // TƯỚNG PIXEL ART (TUONG[id].px, ảnh trong assets/v3/pixel/): px:<id>:8 (đứng yên 8 hướng), px:<id>:idle:<d>, px:<id>:atk:<d>
  // P.thu = thư mục ảnh (vd. 'v4' → assets/v4/), mặc định assets/v3/pixel/. P.atk.file là CHUỖI = 1 sheet tấn công 8 hàng (thứ tự hàng = P.dir8.thuTu) × n khung.
  for (const id of TUONG_IDS) {
    const P = TUONG[id].px; if (!P) continue;
    const PXD = P.thu ? `assets/${P.thu}/` : V3 + 'pixel/';
    nap(`px:${id}:8`, `${PXD}${P.dir8.file}.png`);
    for (const d in P.idle || {}) nap(`px:${id}:idle:${d}`, `${PXD}${P.idle[d].file}.png`);
    if (P.atk && typeof P.atk.file === 'string') nap(`px:${id}:atk`, `${PXD}${P.atk.file}.png`);
    if (P.kn && P.kn.file) nap(`px:${id}:kn`, `${PXD}${P.kn.file}.png`);   // bộ DC: sheet kỹ năng 8 hàng
    if (P.fx) for (const l of P.fxL || ['phat', 'bay', 'trung']) nap(`fx9:${id}:${l}`, `${PXD}fx_${P.fx}_${l}.png`);   // hiệu ứng bộ v9 / DC
    else if (P.atk) for (const d in P.atk.file) nap(`px:${id}:atk:${d}`, `${PXD}${P.atk.file[d]}.png`);
  }

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
  const sprUnit = (id) => spr('u' + id, 64, 64, (c) => { if (!TUONG[id]) return; if (VE_UNIT[id]) VE_UNIT[id](c, HANH[TUONG[id].hanh]); else de(c, HANH[TUONG[id].hanh]); });   // tướng mới chưa có ảnh: chỉ bệ đứng
  const sprQuai = (k) => spr('q' + k, 40, 40, (c) => (VE_QUAI[k] || VE_QUAI.thuong)(c));
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

  // ================= MÀN DỌC kiểu DCDW: SÀN đá-tech sáng + KHAY lõm chứa bàn + HÀNH LANG quái ôm mép trái/dưới (lớp tĩnh vẽ sẵn) =================
  // Tư vấn mục E/L: 75–85% trung tính (graphite), 10–20% accent (viền phe, cổng), < 5% phát sáng (vi mạch cyan rất mờ).
  // Có ảnh demo/assets/v3/san_<x>.png (vân sàn, lặp) / khay_<x>.png (khay bàn, kéo vừa bàn) thì tự dùng (x theo SKIN_ANH; ảnh thứ 1 = bàn mình, thứ 2 = bàn trên).
  const BANS = [G.BAN_AI, G.BAN_NG];
  let L = null, LK = 0;
  const SKIN_ANH = ['1', '2', 'neon', 'graphite', 'circuit', 'steel', 'tech', 'ice', 'sand', 'a', 'b'];
  for (const x of SKIN_ANH) { nap('v3san:' + x, `${V3}san_${x}.png`); nap('v3khay:' + x, `${V3}khay_${x}.png`); }
  const skin = (loai, n) => { const ds = SKIN_ANH.map((x) => co(`v3${loai}:${x}`)).filter(Boolean); return ds.length ? ds[Math.min(n, ds.length - 1)] : null; };
  function veSan(c, x, y, w, h, nSkin) {   // sàn đá graphite SÁNG hơn ô: vân tile.png phủ sáng + vi mạch cyan rất mờ
    const san = skin('san', nSkin), t3 = co('v3:tile');
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    if (san) { const k = 96 / san.width; for (let yy = y; yy < y + h; yy += san.height * k) for (let xx = x; xx < x + w; xx += 96) c.drawImage(san, xx, yy, 96, san.height * k); }
    else {
      c.fillStyle = '#4b5361'; c.fillRect(x, y, w, h);
      if (t3) { c.globalAlpha = 0.55; for (let yy = y - ((y % 48) + 48) % 48; yy < y + h; yy += 48) for (let xx = x - ((x % 48) + 48) % 48; xx < x + w; xx += 48) c.drawImage(t3, xx, yy, 48, 48); c.globalAlpha = 1; }
      c.globalCompositeOperation = 'screen'; c.fillStyle = 'rgba(140,150,168,0.62)'; c.fillRect(x, y, w, h); c.globalCompositeOperation = 'source-over';
    }
    c.restore();
  }
  function veViMach(c, x, y, w, h, r) {   // vi mạch cyan RẤT mờ trên sàn (đường gấp khúc + nút sáng nhỏ) — < 5% diện tích phát sáng
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.strokeStyle = 'rgba(80,220,255,0.10)'; c.lineWidth = 1;
    for (let n = 0; n < Math.round(w * h / 9000); n++) {
      let px = x + r() * w, py = y + r() * h; c.beginPath(); c.moveTo(px, py);
      for (let k = 0; k < 3; k++) { if (r() < 0.5) px += (r() < 0.5 ? -1 : 1) * (10 + r() * 26); else py += (r() < 0.5 ? -1 : 1) * (10 + r() * 26); c.lineTo(px, py); }
      c.stroke(); c.fillStyle = 'rgba(120,235,255,0.22)'; c.fillRect(px - 1, py - 1, 2, 2);
    }
    c.restore();
  }
  function veHanhLang(c, B) {   // hành lang quái: tấm lát sàn hơi tối hơn sàn, mép rãnh rõ, vạch nối tấm; mũi tên rất mờ chỉ hướng đi
    for (const h of B.HL) {
      c.save(); rr(c, h.x, h.y, h.w, h.h, 4); c.clip();
      c.fillStyle = 'rgba(28,34,46,0.38)'; c.fillRect(h.x, h.y, h.w, h.h);
      const doc = h.h > h.w, buoc = 22;
      c.fillStyle = 'rgba(255,255,255,0.05)';
      if (doc) for (let yy = h.y; yy < h.y + h.h; yy += buoc) { c.fillRect(h.x, yy, h.w, 1); c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(h.x, yy + 1, h.w, 1); c.fillStyle = 'rgba(255,255,255,0.05)'; }
      else for (let xx = h.x; xx < h.x + h.w; xx += buoc) { c.fillRect(xx, h.y, 1, h.h); c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(xx + 1, h.y, 1, h.h); c.fillStyle = 'rgba(255,255,255,0.05)'; }
      c.restore();
    }
    // mũi tên mờ theo đường đi (đỏ nhạt, alpha thấp)
    c.save(); c.strokeStyle = 'rgba(255,90,110,0.28)'; c.lineWidth = 2; c.lineCap = 'round'; c.lineJoin = 'round';
    for (const g of B.DOAN) for (let s2 = 24; s2 < g.d - 14; s2 += 46) {
      const x = g.x0 + g.ux * s2, y = g.y0 + g.uy * s2 - (g.ux ? 11 : 0), a = Math.atan2(g.uy, g.ux);
      c.beginPath(); c.moveTo(x - Math.cos(a - 0.7) * 5, y - Math.sin(a - 0.7) * 5); c.lineTo(x, y); c.lineTo(x - Math.cos(a + 0.7) * 5, y - Math.sin(a + 0.7) * 5); c.stroke();
    }
    c.restore();
    // cổng sinh (góc trên trái): miệng tối viền đỏ
    if (!B.noi) { const [x, y] = B.SINH; c.save(); neon(c, '#ff2b4d', 8); c.strokeStyle = '#ff2b4d'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(x, y + 2, 14, 5, 0, 0, 7); c.stroke(); c.restore(); c.fillStyle = '#07040c'; c.beginPath(); c.ellipse(x, y + 2, 12.5, 4, 0, 0, 7); c.fill(); }
    // đế cổng (góc phải): bệ tròn cho avatar Archfiend (avatar + tim vẽ động)
    if (B.CONG) { const [x, y] = B.CONG; c.fillStyle = 'rgba(10,12,22,0.75)'; c.beginPath(); c.ellipse(x, y + 4, 15, 6, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,80,100,0.55)'; c.lineWidth = 1.2; c.stroke(); }
  }
  function veBanTinh(c, B, nSkin) {   // KHAY LÕM (vành vát + lòng tối) + 15 ô gần vuông, khe rõ (tile.png + lớp phủ), góc nhấn màu phe
    const { BX: bx, BY: by } = B, bw = C.BAN_W, bh = C.BAN_H, m = B.ai ? '#3ce7ff' : '#ff2bd6', V = C.VIEN;
    // vành khay: sáng mép dưới/phải, tối mép trên/trái (lõm xuống)
    c.save(); rr(c, bx - 3, by - 3, bw + 6, bh + 6, 7); c.fillStyle = lg(c, bx, by - 3, bx, by + bh + 3, [[0, '#262c38'], [1, '#79839a']]); c.fill(); c.restore();
    const khay = skin('khay', nSkin);
    if (khay) c.drawImage(khay, bx, by, bw, bh);
    else { rr(c, bx, by, bw, bh, 5); c.fillStyle = '#10141c'; c.fill(); }
    c.save(); rr(c, bx, by, bw, bh, 5); c.clip(); c.fillStyle = lg(c, 0, by, 0, by + 10, [[0, 'rgba(0,0,0,0.55)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(bx, by, bw, 10); c.restore();   // bóng đổ trong lòng khay
    const t3 = co('v3:tile');
    for (let i = 0; i < C.COT * C.HANG; i++) {
      const [x, y] = G.oXY({ B }, i);
      c.save(); rr(c, x, y, C.O, C.OH, 3); c.clip();
      if (t3) { c.drawImage(t3, x - 2, y - 2, C.O + 4, C.OH + 4); c.globalCompositeOperation = 'screen'; c.fillStyle = 'rgba(60,78,105,0.22)'; c.fillRect(x, y, C.O, C.OH); c.globalCompositeOperation = 'source-over'; }
      else { c.fillStyle = lg(c, x, y, x, y + C.OH, [[0, '#323a4a'], [1, '#1e2430']]); c.fillRect(x, y, C.O, C.OH); }
      c.fillStyle = lg(c, x, y, x, y + C.OH, [[0, 'rgba(255,255,255,0.07)'], [1, 'rgba(0,10,30,0.12)']]); c.fillRect(x, y, C.O, C.OH);
      c.restore();
      rr(c, x + 0.5, y + 0.5, C.O - 1, C.OH - 1, 3); c.lineWidth = 1; c.strokeStyle = 'rgba(190,210,240,0.30)'; c.stroke();
    }
    c.save(); c.strokeStyle = hexA(m, 0.8); c.lineWidth = 1.5; c.lineCap = 'round';   // góc nhấn màu phe (accent nhỏ)
    const g = 10, o = 1.5;
    for (const [px, py, sx, sy] of [[bx + o, by + o, 1, 1], [bx + bw - o, by + o, -1, 1], [bx + o, by + bh - o, 1, -1], [bx + bw - o, by + bh - o, -1, -1]]) { c.beginPath(); c.moveTo(px + sx * g, py); c.lineTo(px, py); c.lineTo(px, py + sy * g); c.stroke(); }
    c.restore();
    void V;
  }
  // ================= SKIN BÀN (ảnh ChatGPT skin_<id>.png, data.js SKIN) + NỀN NEON FRACTURE =================
  // Mỗi bàn vẽ NGUYÊN ẢNH skin, thu nhỏ đều (game.js hinhSkin: lưới ảnh trùng ô logic, hành lang ảnh trùng đường quái). Ảnh chưa tải → vẽ khay/ô/hành lang code cũ (dự phòng).
  for (const k of SKIN_IDS) nap('v3skin:' + k, `${V3}skin_${k}.png`);
  const anhSkin = (B) => B && B.SKIN ? co('v3skin:' + B.SKIN.id) : null;
  function veSkin(c, B) { const im = anhSkin(B), k = B.SKIN; if (!im) return false; c.drawImage(im, k.x, k.y, k.w, k.h); return true; }
  // CO-OP: bàn người chơi (dưới) vẽ ảnh skin nhưng CẮT bỏ hành lang trái + dưới của ảnh (B.CAT: chỉ giữ phần bên phải mép hành lang trái
  // và phía trên mép hành lang dưới) — quái chỉ đi hành lang trái + hành lang giữa của ảnh bàn trên. Mép cắt có bóng mềm cho hoà vào nền.
  function veSkinCat(c, B) {
    const im = anhSkin(B), k = B.SKIN, cat = B.CAT; if (!im) return;
    if (!cat) { veSkin(c, B); return; }
    c.save(); c.beginPath(); c.rect(cat.x, k.y - 40, W - cat.x + 40, cat.y - k.y + 40); c.clip();
    c.drawImage(im, k.x, k.y, k.w, k.h);
    c.fillStyle = lg(c, cat.x, 0, cat.x + 10, 0, [[0, 'rgba(0,0,0,0.45)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(cat.x, k.y, 10, cat.y - k.y);
    c.fillStyle = lg(c, 0, cat.y - 8, 0, cat.y, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.45)']]); c.fillRect(cat.x, cat.y - 8, W - cat.x, 8);
    c.restore();
  }
  // NỀN: xám xanh than trung tính (không còn nền tím neon) + vài VẾT NỨT cyan rất mờ (thế giới NEON FRACTURE: neon chỉ là điểm nhấn)
  function veNen(c, r) {
    c.fillStyle = lg(c, 0, 0, 0, H, [[0, '#1b232c'], [0.5, '#151c24'], [1, '#10151b']]); c.fillRect(0, 0, W, H);
    c.fillStyle = rg(c, W / 2, H * 0.45, 40, H * 0.7, [[0, 'rgba(70,90,105,0.18)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(0, 0, W, H);
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    for (let n = 0; n < 7; n++) {
      let x = r() * W, y = C.TOP_H + r() * (H - C.TOP_H - 40), g = r() * Math.PI * 2;
      const pts = [[x, y]];
      for (let j = 0; j < 6 + r() * 6; j++) { g += (r() - 0.5) * 1.3; const l = 8 + r() * 18; x += Math.cos(g) * l; y += Math.sin(g) * l; pts.push([x, y]); }
      for (const [w2, a] of [[4, 0.035], [1, 0.16]]) {
        c.strokeStyle = `rgba(80,225,255,${a})`; c.lineWidth = w2; c.beginPath(); pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.stroke();
      }
    }
    c.restore();
  }
  // LÀN DỌC (co-op / solo, chuẩn DCDW): thân làn = dải hành lang TRÁI cắt từ ảnh skin bàn người chơi (đoạn thẳng giữa lưới), lát nối tiếp
  // suốt chiều cao làn (không vẽ lại pixel); đầu làn = CỔNG SINH (assets/bg/portal.png), cuối làn = LÕI (assets/bg/core.png).
  nap('bg:portal', 'assets/bg/portal.png'); nap('bg:core', 'assets/bg/core.png');
  function veLanDoc(c, lan, B) {
    const im = anhSkin(B), k = B && B.SKIN;
    if (im && k) {
      const s = SKIN[k.id], g = s.grid, L = s.lane, sx = (L.x - L.w / 2) * s.w, sw = L.w * s.w, sy = (g[1] + 0.03) * s.h, sh = (g[3] - g[1] - 0.06) * s.h;
      const dh = sh * k.tl;
      c.save(); c.beginPath(); c.rect(lan.x - 1, lan.y, lan.w + 2, lan.h); c.clip();
      for (let y = lan.y; y < lan.y + lan.h; y += dh - 1) c.drawImage(im, sx, sy, sw, sh, lan.x, y, lan.w, dh);
      // mép làn: bóng tối 2 bên cho dải lát liền khối với nền
      c.fillStyle = lg(c, lan.x, 0, lan.x + 8, 0, [[0, 'rgba(0,0,0,0.55)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(lan.x, lan.y, 8, lan.h);
      c.fillStyle = lg(c, lan.x + lan.w - 8, 0, lan.x + lan.w, 0, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.55)']]); c.fillRect(lan.x + lan.w - 8, lan.y, 8, lan.h);
      c.restore();
    } else veHanhLang(c, Object.assign({}, B, { HL: [lan], CONG: null, noi: true }));
    // mũi tên rất mờ chỉ hướng đi xuống
    c.save(); c.strokeStyle = 'rgba(255,90,110,0.22)'; c.lineWidth = 2; c.lineCap = 'round'; c.lineJoin = 'round';
    const cx = lan.x + lan.w / 2;
    for (let y = lan.sinh[1] + 40; y < lan.loi[1] - 40; y += 56) { c.beginPath(); c.moveTo(cx - 5, y - 4); c.lineTo(cx, y + 1); c.lineTo(cx + 5, y - 4); c.stroke(); }
    c.restore();
    // cổng sinh (đầu làn) + lõi (cuối làn)
    const po = co('bg:portal'), lo = co('bg:core');
    { const [x, y] = lan.sinh, w = lan.w * 0.95, h = w * 1.1; c.save(); c.globalCompositeOperation = 'lighter'; veGlow(c, '#ff2bd6', x, y, w * 0.8, 0.35); c.restore();
      if (po) c.drawImage(po, x - w / 2, y - h / 2, w, h); else { c.fillStyle = '#07040c'; c.beginPath(); c.ellipse(x, y, w / 2.4, h / 2.4, 0, 0, 7); c.fill(); } }
    { const [x, y] = lan.loi, w = lan.w * 1.15; c.save(); c.globalCompositeOperation = 'lighter'; veGlow(c, '#3ce7ff', x, y, w * 0.8, 0.3); c.restore();
      if (lo) c.drawImage(lo, x - w / 2, y - w * 0.55, w, w); }
  }
  // che: false (PVP) | 'coop' | 'solo'
  function taoLop(k0, che) {
    const k = Math.min(k0, 3);
    let sd = 5; const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    const coop = che === 'coop', solo = che === 'solo';
    const tinh = mk(W, H, (c) => {
      const coSkin = anhSkin(G.BAN_NG) && anhSkin(G.BAN_AI);
      if (coSkin) {
        veNen(c, r);
        if (coop) { veSkinCat(c, G.BAN_NG_CO); veSkinCat(c, G.BAN_AI_CO); veLanDoc(c, C.LAN_CO, G.BAN_NG_CO); return; }
        if (solo) { veSkinCat(c, G.BAN_SO); veLanDoc(c, C.LAN_SO, G.BAN_SO); return; }
        // PVP: bàn dưới trước, bàn trên sau (trang trí đáy bàn trên đè lên trang trí đỉnh bàn dưới; hành lang không bị che)
        veSkin(c, G.BAN_NG); veSkin(c, G.BAN_AI);
        for (const B of BANS) veMieng(c, B, false);
        return;
      }
      // DỰ PHÒNG (ảnh skin chưa tải): sàn + hành lang + khay/ô vẽ code như cũ
      const bg = co('v2:bg_arena_portrait');
      if (bg) c.drawImage(bg, 0, 0, W, H);
      else { veSan(c, 0, 0, W, C.GIUA_Y, 1); veSan(c, 0, C.GIUA_Y, W, H - C.GIUA_Y, 0); veViMach(c, 0, C.TOP_H, W, C.DUOI_Y - C.TOP_H, r); }
      c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(0, 0, W, H);
      if (coop) { veLanDoc(c, C.LAN_CO, G.BAN_NG_CO); veBanTinh(c, G.BAN_AI_CO, 1); veBanTinh(c, G.BAN_NG_CO, 0); }
      else if (solo) { veLanDoc(c, C.LAN_SO, G.BAN_SO); veBanTinh(c, G.BAN_SO, 0); }
      else { for (const B of BANS) veHanhLang(c, B); veBanTinh(c, G.BAN_AI, 1); veBanTinh(c, G.BAN_NG, 0); }
    }, k);
    L = { tinh, toi: mk(W, H, (c) => { c.fillStyle = rg(c, W / 2, H / 2, 300, 640, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.30)']]); c.fillRect(0, 0, W, H); }, 1) };
    LK = k0; L.che = che; L.skin = C.SKIN_NG + '|' + C.SKIN_AI;
  }
  // cổng sinh quái trên ảnh skin: vết nứt cyan nhỏ phát sáng ở đầu hành lang (hạt sáng, không vẽ hình) + đế cổng mờ ở cuối hành lang
  function veMieng(c, B, noi) {
    if (!noi) { const [x, y] = B.SINH; c.save(); c.globalCompositeOperation = 'lighter'; veGlow(c, '#3ce7ff', x, y + 2, 16, 0.35); c.restore();
      c.fillStyle = 'rgba(4,8,14,0.55)'; c.beginPath(); c.ellipse(x, y + 2, 11, 4, 0, 0, 7); c.fill(); }
    if (B.CONG) { const [x, y] = B.CONG; c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(x, y + 6, 16, 6, 0, 0, 7); c.fill(); }
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
    if (w === 16) { c.save(); c.globalAlpha = 0.24; c.fillStyle = '#07090F'; c.beginPath(); c.ellipse(x, y, 10, 3, 0, 0, 7); c.fill(); c.restore(); return; }   // bóng v3: ellipse 20×6
    const b = co('v2:unit_shadow');
    if (b) { c.drawImage(b, x - w / 2, y - w * 0.17, w, w * 0.34); return; }
    c.save(); c.fillStyle = 'rgba(0,0,0,0.42)'; c.beginPath(); c.ellipse(x, y, w / 2, w * 0.15, 0, 0, 7); c.fill(); c.restore();
  }
  // SAO 1–7: pip ngôi nhỏ TRÊN ĐẦU (như DCDW), cố định theo ô (không nhún theo người): 1–3 sao 1 hàng; 4–7 sao 2 hàng gọn (2+2, 3+2, 3+3, 4+3).
  function veSao(c, cx, cy, n) {
    const w = 5, m = n >= 7 ? '#ff7a3a' : '#ffd84a', hang = n <= 3 ? [n] : [Math.ceil(n / 2), Math.floor(n / 2)];
    c.save(); c.lineJoin = 'round'; c.lineWidth = 1.5; c.strokeStyle = 'rgba(4,4,10,0.9)'; c.fillStyle = m;
    hang.forEach((so, h) => {
      const y = cy + (hang.length > 1 ? (h - 0.5) * 4.6 : 0), tong = so * w;
      for (let i = 0; i < so; i++) {
        const px = cx - tong / 2 + w / 2 + i * w; c.beginPath();
        for (let k = 0; k < 10; k++) { const g = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 1.0 : 2.4; c.lineTo(px + Math.cos(g) * r, y + Math.sin(g) * r); }
        c.closePath(); c.stroke(); c.fill();
      }
    });
    c.restore();
  }
  // ĐẾ TRÒN DƯỚI CHÂN tô màu BẬC ĐẬM (trắng bạc / lam / tím / vàng kim / đỏ) — nhìn là biết bậc. 5★+ thêm vòng ngoài; VÀNG/ĐỎ lấp lánh nhẹ.
  const SANG_BAC = { trang: '#ffffff', lam: '#bfe2ff', tim: '#ead6ff', vang: '#fff2b8', do: '#ffc4c4' };
  // ĐĨA AURA tròn màu dưới chân khi tướng đang được BUFF (Archfiend OVERCLOCK, COPY BUFFER...) — như DCDW
  // (aura chỉ khi có buff THẬT: vòng mảnh, mờ, sát chân — không phải đế)
  function veAura(c, cx, chan, mau, t, uid) {
    const rx = C.O * 0.36, ry = rx * 0.3, nh = 0.5 + 0.5 * Math.sin(t * 4 + (uid || 0));
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.25 + 0.15 * nh; c.strokeStyle = mau; c.lineWidth = 1;
    c.beginPath(); c.ellipse(cx, chan, rx, ry, 0, 0, 7); c.stroke(); c.restore();
  }
  // BÓNG ĐỔ mềm sát chân (C.BONG_*): elip tối, tâm đậm → mép mờ, để tướng trông đứng trên sàn ô
  function veBongChan(c, cx, chan) {
    const rx = C.O * C.BONG_W / 2, ry = rx * C.BONG_DET;
    c.save(); c.translate(cx, chan); c.scale(1, ry / rx);
    c.fillStyle = rg(c, 0, 0, 0, rx, [[0, `rgba(0,0,0,${C.BONG_A})`], [0.6, `rgba(0,0,0,${C.BONG_A * 0.75})`], [1, 'rgba(0,0,0,0)']]);
    c.beginPath(); c.arc(0, 0, rx, 0, 7); c.fill(); c.restore();
  }
  // MŨI TÊN nhỏ cạnh tướng: XANH ▲ = đang được buff (tốc đánh), ĐỎ ▼ = đang bị debuff (trùm / tinh anh)
  function veMuiTen(c, x, y, len, t) {
    const d = len ? -1 : 1, nh = Math.sin(t * 6) * 1.2, m = len ? '#3cff7a' : '#ff3b4b';
    c.save(); c.translate(x, y + nh * d); c.beginPath(); c.moveTo(0, 4 * d); c.lineTo(-3.6, 0); c.lineTo(-1.3, 0); c.lineTo(-1.3, -3.5 * d); c.lineTo(1.3, -3.5 * d); c.lineTo(1.3, 0); c.lineTo(3.6, 0); c.closePath();
    c.scale(1, 1); c.fillStyle = m; c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(0,0,0,0.85)'; c.stroke(); c.restore();
  }
  // (02/11: KHÔNG còn vẽ trên bàn theo yêu cầu người dùng — giữ hàm để dùng lại nếu cần)
  function veVongBac(c, v, cx, chan, t, afMau) {
    const id = TUONG[v.id].bac, b = BAC[id] || BAC.trang, rx = C.O * 0.36, ry = rx * 0.34;
    c.save();
    c.beginPath(); c.ellipse(cx, chan + 0.5, rx + 1.5, ry + 1.5, 0, 0, 7); c.fillStyle = 'rgba(4,6,14,0.75)'; c.fill();   // viền tối tách khỏi nền ô
    c.beginPath(); c.ellipse(cx, chan, rx, ry, 0, 0, 7);
    c.fillStyle = rg(c, cx, chan - ry * 0.3, 1, rx, [[0, SANG_BAC[id] || '#ffffff'], [0.35, b.mau], [1, hexA(b.mau, 0.8)]]); c.fill();
    c.lineWidth = 1; c.strokeStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.ellipse(cx, chan, rx - 0.5, ry - 0.5, 0, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
    if (v.sao >= 5) { c.globalAlpha = 0.85; c.strokeStyle = b.mau; c.lineWidth = v.sao >= 7 ? 1.6 : 1.1; c.beginPath(); c.ellipse(cx, chan, rx + 3.5, ry + 2.5, 0, 0, 7); c.stroke(); c.globalAlpha = 1; }
    if (id === 'vang' || id === 'do') {   // lấp lánh nhẹ: 3 sao 4 cánh nhỏ chớp lệch pha trên đế
      c.globalCompositeOperation = 'lighter'; c.fillStyle = '#ffffff';
      for (let n = 0; n < 3; n++) {
        const p = (t * 0.9 + n / 3 + (v.uid || 0) * 0.13) % 1, a = Math.sin(p * Math.PI); if (a < 0.15) continue;
        const g = n * 2.1 + (v.uid || 0), px = cx + Math.cos(g) * rx * 0.75, py = chan + Math.sin(g) * ry * 0.7, r = 1 + 1.6 * a;
        c.globalAlpha = a; c.beginPath(); c.moveTo(px, py - r); c.lineTo(px + r * 0.3, py - r * 0.3); c.lineTo(px + r, py); c.lineTo(px + r * 0.3, py + r * 0.3); c.lineTo(px, py + r); c.lineTo(px - r * 0.3, py + r * 0.3); c.lineTo(px - r, py); c.lineTo(px - r * 0.3, py - r * 0.3); c.closePath(); c.fill();
      }
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    }
    c.restore();
  }
  // ---- v3 HIGH TOP-DOWN: cao 32px (rộng ≤ 40px → chừa ≥3px mỗi bên ô 46, không đè ô bên), chân tại (cx, chan); không uốn / xoay / biến dạng ảnh ----
  // P0.1 (tu-van-chatgpt-cham-ban-choi-8huong.txt): 29px → 32px (~70% cạnh ô), neo chân giữ nguyên giữa mọi hướng/khung; hitbox ô không đổi.
  // P2.2: idle 8fps lặp, lệch pha mỗi tướng; attack 14fps, giữ khung ra đòn thêm C.GIU_KHUNG (đạn phát đúng khung đó, game.js TAC_DONG)
  const V3_ANIM = { idle: { fps: 8, lap: true }, attack: { fps: 14, lap: false } };
  const KHUNG_RA = Math.round(C.TAC_DONG * V3_ANIM.attack.fps);   // = 3
  const tgAtk = (n) => n / V3_ANIM.attack.fps + C.GIU_KHUNG;      // tổng thời gian attack (sheet 8 hay 12 khung đều tự tính: số khung = rộng/cao)
  function khungAtk(n, el) {   // chuẩn bị (0..2) → ra đòn (3, giữ thêm) → thu đòn; -1 = hết
    const fps = V3_ANIM.attack.fps, ra = Math.min(KHUNG_RA, n - 1), t1 = ra / fps, t2 = (ra + 1) / fps + C.GIU_KHUNG;
    if (el < 0) return -1;
    if (el < t1) return Math.floor(el * fps);
    if (el < t2) return ra;
    const f = ra + 1 + Math.floor((el - t2) * fps); return f < n ? f : -1;
  }
  const phaIdle = (v) => (((v.uid || 0) * 0.618034) % 1);         // lệch pha idle theo từng tướng (không đồng bộ cả bàn)
  const khungIdle = (n, tg, v) => Math.floor(tg * V3_ANIM.idle.fps + phaIdle(v) * n) % n;
  function giatLui(v, tg) {   // 0..1: giật lùi lúc ra đòn — giữ trong lúc giữ khung, rồi về trong 90ms
    if (v.atkT == null) return 0;
    const e = tg - v.atkT - C.TAC_DONG;
    if (e < 0) return 0; if (e < C.GIU_KHUNG) return 1;
    const r = (e - C.GIU_KHUNG) / 0.09; return r < 1 ? 1 - r : 0;
  }
  const GIAT_PX = 2;   // giật lùi 2px ngược hướng nhìn
  const DO_V3 = new Map();
  const DO_SHEET = new Map();
  function doSheet(im) {   // đo khung 0 của sheet: tỉ lệ để phần hình cao C.TUONG_CAO + đáy phần hình (neo chân); khung vuông, số khung = rộng / cao
    let d = DO_SHEET.get(im); if (d) return d;
    const fh = im.height; d = { s: C.TUONG_CAO / fh, day: fh };
    try {
      const cv = document.createElement('canvas'); cv.width = fh; cv.height = fh; const g = cv.getContext('2d'); g.drawImage(im, 0, 0, fh, fh, 0, 0, fh, fh);
      const px = g.getImageData(0, 0, fh, fh).data; let x0 = fh, x1 = -1, y0 = fh, y1 = -1;
      for (let y = 0; y < fh; y++) for (let x = 0; x < fh; x++) if (px[(y * fh + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 >= 0) d = { s: Math.min(C.TUONG_CAO / (y1 - y0 + 1), C.TUONG_RONG / (x1 - x0 + 1)), day: y1 + 1 };
    } catch (e) { /* ảnh khác nguồn: dùng ước lượng */ }
    DO_SHEET.set(im, d); return d;
  }
  // ---- 8 hướng ----
  // hg (game.js): 0=E 1=SE 2=S 3=SW 4=W 5=NW 6=N 7=NE → [hướng ảnh nguồn, lật gương]
  const HG_ANH = [['w', true], ['sw', true], ['s', false], ['sw', false], ['w', false], ['nw', false], ['n', false], ['nw', true]];
  const LUI = { s: ['s', 'sw', 'w'], sw: ['sw', 's', 'w'], w: ['w', 'sw', 'nw', 's'], nw: ['nw', 'n', 'w'], n: ['n', 'nw', 'w'] };   // thiếu hướng → hướng gần nhất có ảnh (GLITCH: sw→s/w, nw→n)
  const coV3 = (id) => coPx(id) || co('v3:' + id) || co(`v3:${id}:idle`) || HUONG5.some((d) => coHuong(id, d));
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
  function tiLeS(id) {   // tỉ lệ chung theo hướng S: phần hình cao C.TUONG_CAO (rộng ≤ 40px), quy theo cạnh khung để mọi hướng cùng cỡ
    const im = co(`v3:${id}:idle:s`) || co(`v3:${id}:s`); if (!im) return null;
    const d = doKhung(im);
    return Math.min(C.TUONG_CAO / (d.y1 - d.y0 + 1), C.TUONG_RONG / (d.x1 - d.x0 + 1)) * d.fh;   // = số px hiển thị cho 1 cạnh khung
  }
  // quay > 90° (lệch > 2 sector): chen 1 khung hướng trung gian ~70ms (vẫn là ảnh hướng đó / lật gương, không xoay ảnh)
  function hgHien(v, tg) {
    const hg = v.hg == null ? 2 : v.hg;
    if (v._hgVe == null) v._hgVe = hg;
    if (hg !== v._hgVe) {
      let d = (((hg - v._hgVe) % 8) + 8) % 8; if (d > 4) d -= 8;
      if (Math.abs(d) > 2) { v._giua = (((v._hgVe + Math.sign(d) * Math.ceil(Math.abs(d) / 2)) % 8) + 8) % 8; v._giuaT = tg + 0.07; }
      v._hgVe = hg;
    }
    return v._giuaT != null && tg < v._giuaT && tg >= v._giuaT - 0.2 ? v._giua : hg;
  }
  function veHuong(c, v, cx, chan, tg, i, nhun) {   // ảnh theo hướng (sheet idle/attack hoặc ảnh tĩnh hướng đó); false nếu không có
    const hg = hgHien(v, tg), [goc, lat] = HG_ANH[hg];
    const d = LUI[goc].find((h) => coHuong(v.id, h)); if (!d) return false;
    const canh = tiLeS(v.id) || (() => { const k = doKhung(coHuong(v.id, d)); return Math.min(C.TUONG_CAO / (k.y1 - k.y0 + 1), C.TUONG_RONG / (k.x1 - k.x0 + 1)) * k.fh; })();
    const idle = co(`v3:${v.id}:idle:${d}`), atk = co(`v3:${v.id}:attack:${d}`), tinh = co(`v3:${v.id}:${d}`);
    const fA = atk && v.atkT != null ? khungAtk(soKhung(atk), tg - v.atkT) : -1;
    let im, f = 0, laSheet = false;
    if (fA >= 0) { im = atk; f = fA; laSheet = true; }
    else if (idle) { im = idle; f = khungIdle(soKhung(idle), tg, v); laSheet = true; }
    else im = tinh;
    if (!im) return false;
    const k = doKhung(idle || tinh || im), fh = im.height, w = Math.min(canh, C.TUONG_RONG * k.fh / (k.x1 - k.x0 + 1));   // cạnh khung hiển thị; rộng phần hình hướng này vẫn ≤ 40px
    const day = (k.y1 + 1) * (w / k.fh);   // đáy phần hình khung đầu = chân → cùng 1 điểm mọi hướng
    const g = hg * Math.PI / 4, gl = giatLui(v, tg) * GIAT_PX;   // giật lùi ngược hướng nhìn (toạ độ màn hình, trước khi lật)
    let x = cx - w / 2, y = chan - day;
    if (!laSheet) y += nhun;   // ảnh tĩnh: thêm nhún bằng code (sheet idle đã tự chuyển động)
    c.save();
    c.translate(-Math.cos(g) * gl, -Math.sin(g) * gl);
    if (lat) { c.translate(cx * 2, 0); c.scale(-1, 1); }   // lật gương ngang quanh tâm ô
    if (im === atk && atk !== idle) {   // sheet attack vẽ ở tỉ lệ nguồn nhỏ hơn idle (~0.72): quy về cùng cỡ theo chiều cao khung đầu, đáy khung đầu = chân
      const kA = doKhung(atk), r = Math.max(0.8, Math.min(1.6, (k.y1 - k.y0 + 1) / (kA.y1 - kA.y0 + 1))), wA = w * r;
      x = cx - wA / 2; y = chan - (kA.y1 + 1) * (wA / kA.fh);
      c.drawImage(im, f * fh, 0, fh, fh, x, y, wA, wA);
    } else c.drawImage(im, f * fh, 0, fh, fh, x, y, w, w);
    if (!laSheet && gl > 0) { c.globalCompositeOperation = 'lighter'; c.globalAlpha *= 0.35 * gl / GIAT_PX; c.drawImage(im, f * fh, 0, fh, fh, x, y, w, w); }   // chớp sáng nhẹ
    c.restore();
    return true;
  }
  function veXoay(c, v, cx, chan, tg, i, nhun) {   // WARP drone: sheet idle_s/attack_s (hoặc ảnh tĩnh) xoay quanh tâm phần hình theo v.goc mượt; ảnh gốc nhìn S = 90°
    const idle = co(`v3:${v.id}:idle:s`), atk = co(`v3:${v.id}:attack:s`); if (!idle && !atk) return false;
    const fA = atk && v.atkT != null ? khungAtk(soKhung(atk), tg - v.atkT) : -1;
    let im = idle, f = 0;
    if (fA >= 0 || !idle) { im = atk; f = Math.max(0, fA); }
    else f = khungIdle(soKhung(idle), tg, v);
    const k = doKhung(idle || atk), fh = im.height;
    const w = Math.min(C.TUONG_CAO / (k.y1 - k.y0 + 1), C.TUONG_RONG / (k.x1 - k.x0 + 1)) * k.fh, sc = w / k.fh;   // cạnh khung hiển thị
    const tx = (k.x0 + k.x1 + 1) / 2 * sc, ty = (k.y0 + k.y1 + 1) / 2 * sc, day = (k.y1 + 1) * sc;   // tâm phần hình trong khung (đã thu)
    const g = v.goc == null ? Math.PI / 2 : v.goc, gl = giatLui(v, tg) * GIAT_PX, tamY = chan - day + ty + (idle ? 0 : nhun);
    c.save(); c.translate(cx - Math.cos(g) * gl, tamY - Math.sin(g) * gl); c.rotate(g - Math.PI / 2);
    c.drawImage(im, f * fh, 0, fh, fh, -tx, -ty, w, w);
    c.restore(); return true;
  }
  // ================= TƯỚNG ẢNH TĨNH (mặc định, C.SHEET_TUONG = false) =================
  // Luôn vẽ ảnh tĩnh theo hướng <anh>_<dir>.png (5 hướng vẽ + lật gương; WARP xoay ảnh) → đầu/thân giữ nguyên, không giật.
  // Cỡ: cao = C.TUONG_CAO × TUONG[id].co theo hướng S (mọi hướng dùng CHUNG 1 tỉ lệ → không đổi cỡ khi quay), rộng mọi hướng ≤ C.TUONG_RONG.
  // Neo: tâm khung ảnh = tâm ô, đáy phần hình = chân. Đánh: giật lùi C.GIAT px ngược hướng bắn trong C.GIAT_T giây (dịch nguyên khối).
  const DO_CHAC = new Map();
  function doChac(im) {   // hộp phần hình "chắc" (bỏ chấm lẻ): cột/hàng có ≥ 2 điểm alpha > 60
    let d = DO_CHAC.get(im); if (d) return d;
    const w = im.width, h = im.height; d = { w, h, x0: 0, x1: w - 1, y0: 0, y1: h - 1 };
    try {
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'); g.drawImage(im, 0, 0);
      const px = g.getImageData(0, 0, w, h).data, cot = new Array(w).fill(0), hang = new Array(h).fill(0);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (px[(y * w + x) * 4 + 3] > 60) { cot[x]++; hang[y]++; }
      const dau = (a) => a.findIndex((n) => n >= 2), cuoi = (a) => a.length - 1 - a.slice().reverse().findIndex((n) => n >= 2);
      if (dau(cot) >= 0) d = { w, h, x0: dau(cot), x1: cuoi(cot), y0: dau(hang), y1: cuoi(hang) };
    } catch (e) { /* ảnh khác nguồn */ }
    DO_CHAC.set(im, d); return d;
  }
  // BỎ CHẤM LẺ: ảnh ChatGPT có vài mảnh vụn rời khỏi hình (vd. lance_nw, venom_sw). Chỉ XOÁ các mảng rời rất nhỏ (< 2% điểm ảnh của hình),
  // không sửa / không bóp phần hình chính. Làm 1 lần khi nạp, kết quả là canvas cùng cỡ.
  const SACH = new WeakMap();
  function sach(im) {
    if (!im) return im; let cv = SACH.get(im); if (cv) return cv;
    cv = im;
    try {
      const w = im.width, h = im.height, c2 = document.createElement('canvas'); c2.width = w; c2.height = h;
      const g = c2.getContext('2d'); g.drawImage(im, 0, 0);
      const d = g.getImageData(0, 0, w, h), px = d.data, nhan = new Int32Array(w * h).fill(-1), co2 = [];
      let tong = 0;
      for (let i = 0; i < w * h; i++) {
        if (nhan[i] >= 0 || px[i * 4 + 3] <= 20) continue;
        const ds = [i], vung = []; nhan[i] = co2.length;
        while (ds.length) { const j = ds.pop(); vung.push(j); const x = j % w, y = (j / w) | 0;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; const k = yy * w + xx; if (nhan[k] < 0 && px[k * 4 + 3] > 20) { nhan[k] = co2.length; ds.push(k); } } }
        co2.push(vung); tong += vung.length;
      }
      let xoa = 0;
      for (const vung of co2) if (vung.length < tong * 0.02) { for (const j of vung) px[j * 4 + 3] = 0; xoa++; }
      if (xoa) { g.putImageData(d, 0, 0); cv = c2; }
    } catch (e) { /* ảnh khác nguồn: giữ nguyên */ }
    SACH.set(im, cv); return cv;
  }
  const TL_TINH = new Map();
  function tiLeTinh(id) {   // px hiển thị / px ảnh, chung mọi hướng của 1 tướng
    const key = id + '|' + C.TUONG_CAO + '|' + C.OH; let s = TL_TINH.get(key); if (s) return s;
    const xoay = XOAY_CODE.has(id), imS = sach(xoay ? co('v3:' + id) : (co(`v3:${id}:s`) || HUONG5.map((d) => co(`v3:${id}:${d}`)).find(Boolean)));
    if (!imS) return null;
    const dS = doChac(imS), hS = dS.y1 - dS.y0 + 1;
    let wMax = dS.x1 - dS.x0 + 1;
    if (!xoay) for (const d of HUONG5) { const im = sach(co(`v3:${id}:${d}`)); if (im) { const k = doChac(im); wMax = Math.max(wMax, k.x1 - k.x0 + 1); } }
    const cao = C.TUONG_CAO * (TUONG[id].co || 1);
    s = Math.min(cao / hS, (xoay ? C.O : C.TUONG_RONG) / wMax, (C.OH - C.CHAN + 3) / hS);   // cho vượt mép trên ô tối đa ~3px
    TL_TINH.set(key, s);
    return s;
  }
  // NHỊP ĐÁNH 240ms (tư vấn bước 4): lùi C.LUI px trong C.LUI_T (chuẩn bị) → lao tới +C.LAO px trong C.LAO_T (đạn phát ĐÚNG lúc này) → về 0 trong C.VE_T
  // trả về độ dịch theo hướng bắn (âm = lùi). Tính từ v.atkT (lúc bắt đầu đòn).
  function lao(v, tg) {
    if (v.atkT == null) return 0;
    const e = tg - v.atkT, t1 = C.LUI_T, t2 = t1 + C.LAO_T, t3 = t2 + C.VE_T;
    if (e < 0 || e >= t3) return 0;
    if (e < t1) { const k = e / t1; return -C.LUI * (1 - (1 - k) * (1 - k)); }
    if (e < t2) return -C.LUI + (C.LUI + C.LAO) * ((e - t1) / C.LAO_T);
    const k = (e - t2) / C.VE_T; return C.LAO * (1 - k) * (1 - k);
  }
  const giat = (v, tg) => { if (v.banT == null) return 0; const e = tg - v.banT; return e < 0 || e >= C.GIAT_T ? 0 : C.GIAT * (1 - e / C.GIAT_T); };
  const coAtk = (v, tg) => v.banT != null && tg - v.banT >= -0.01 && tg - v.banT < C.ATK_ANH;
  // hình học ảnh đang vẽ cho tướng v ở (cx, chan): { im, x, y, w, h, s, lat, d, g } — dùng chung cho VẼ và ĐIỂM NÒNG
  function hinhTinh(v, cx, chan, hg, tg) {
    const id = v.id, s = tiLeTinh(id); if (!s) return null;
    if (XOAY_CODE.has(id)) {
      const atk = coAtk(v, tg) && co(`v3:${id}:atk:s`), im = sach(atk || co('v3:' + id)), w = im.width * s, h = im.height * s;
      return { im, s, w, h, xoay: true, tx: cx, ty: chan - h / 2, goc: v.goc == null ? Math.PI / 2 : v.goc, d: 's' };
    }
    const [goc, lat] = HG_ANH[hg], d = LUI[goc].find((h) => co(`v3:${id}:${h}`)); if (!d) return null;
    const tinh = co(`v3:${id}:${d}`), atk = tg != null && coAtk(v, tg) && co(`v3:${id}:atk:${d}`), im = sach(atk || tinh);
    const k = doChac(im), w = im.width * s, h = im.height * s;
    return { im, s, w, h, x: cx - w / 2, y: chan - (k.y1 + 1) * s, lat, d };
  }
  // ĐIỂM ĐẦU NÒNG trên màn (bảng TUONG[id].nong theo hướng ảnh vẽ, lật gương đối xứng x, xoay cho WARP) — game.js dùng qua GAME.nongHook
  function diemNong(S, i, v) {
    const [ox, oy] = G.oXY(S, i), cx = ox + C.O / 2, chan = oy + C.OH - C.CHAN;
    const P4 = TUONG[v.id].px;
    if (P4 && P4.neo) {   // tướng v4 (TẠM): điểm ra đòn = giữa thân + lệch theo hướng đang nhìn (bảng P.nong [x, y] theo hướng trong ô sheet nếu có)
      const ten = HG_TEN[v._d != null ? v._d : v.hg == null ? 2 : v.hg], cao = C.TUONG_CAO * (TUONG[v.id].co || 1), b = P4.nong && P4.nong[ten];
      if (b) { const im8 = co(`px:${v.id}:8`), ref = im8 ? doPx(im8, P4.dir8.o, P4.dir8.o, ...o8(P4, 's')) : null, k = ref ? cao / (ref.day - ref.y0) : cao / 96;
        return [cx + (b[0] - P4.neo[0]) * k, chan + (b[1] - P4.neo[1]) * k]; }
      const g = (v._d != null ? v._d : v.hg == null ? 2 : v.hg) * Math.PI / 4;
      return [cx + Math.cos(g) * cao * 0.36, chan - cao * 0.5 + Math.sin(g) * cao * 0.28];
    }
    const hh = hinhTinh(v, cx, chan, v.hg == null ? 2 : v.hg, null); if (!hh) return null;
    const bang = TUONG[v.id].nong || {}, p = bang[hh.d] || bang.s; if (!p) return null;
    const kx = hh.im.width / 112, ky = hh.im.height / 112;   // bảng đo trên khung 112 (ảnh khác cỡ: quy đổi)
    if (hh.xoay) {
      const dx = (p[0] - hh.im.width / 2) * hh.s, dy = (p[1] - hh.im.height / 2) * hh.s, r = hh.goc - Math.PI / 2;
      return [hh.tx + dx * Math.cos(r) - dy * Math.sin(r), hh.ty + dx * Math.sin(r) + dy * Math.cos(r)];
    }
    const px = hh.x + p[0] * kx * hh.s, py = hh.y + p[1] * ky * hh.s;
    return [hh.lat ? 2 * cx - px : px, py];
  }
  G.nongHook = diemNong;
  // viền sáng mảnh 1px màu BẬC quanh hình (bóng đặc của chính ảnh, tô màu, đặt lệch ±1px) — không vẽ hình mới
  const BONG_MAU = new WeakMap();
  function bongMau(im, mau) {
    let m = BONG_MAU.get(im); if (!m) { m = new Map(); BONG_MAU.set(im, m); }
    let cv = m.get(mau); if (cv) return cv;
    cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
    const g = cv.getContext('2d'); g.drawImage(im, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = mau; g.fillRect(0, 0, im.width, im.height);
    m.set(mau, cv); return cv;
  }
  function veTinh(c, v, cx, chan, tg, i) {
    const hh = hinhTinh(v, cx, chan, hgHien(v, tg), tg); if (!hh) return false;
    const nhun = i == null ? 0 : C.NHUN * Math.sin(2 * Math.PI * (tg / C.NHUN_T + phaIdle(v)));   // idle: nhún ±0.5px chu kỳ 1.7s, nguyên khối
    const gl = lao(v, tg), g = hh.xoay ? hh.goc : (v.hg == null ? 2 : v.hg) * Math.PI / 4;
    const bac = BAC[TUONG[v.id].bac] || BAC.trang, vien = bongMau(hh.im, bac.mau);
    c.save();
    c.translate(Math.cos(g) * gl, Math.sin(g) * gl + nhun);   // nhịp đánh: lùi → lao tới → về (nguyên khối, theo hướng bắn)
    if (hh.xoay) {
      c.translate(hh.tx, hh.ty); c.rotate(hh.goc - Math.PI / 2);
      c.globalAlpha *= 0.9; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) c.drawImage(vien, -hh.w / 2 + dx, -hh.h / 2 + dy, hh.w, hh.h);
      c.globalAlpha /= 0.9; c.drawImage(hh.im, -hh.w / 2, -hh.h / 2, hh.w, hh.h);
    } else {
      if (hh.lat) { c.translate(cx * 2, 0); c.scale(-1, 1); }   // lật gương ngang quanh tâm ô
      c.globalAlpha *= 0.9; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) c.drawImage(vien, hh.x + dx, hh.y + dy, hh.w, hh.h);
      c.globalAlpha /= 0.9; c.drawImage(hh.im, hh.x, hh.y, hh.w, hh.h);
    }
    c.restore();
    return true;
  }
  function veV3(c, v, cx, chan, tg, i) {
    if (!SHEET && veTinh(c, v, cx, chan, tg, i)) return true;
    const nhun = i == null ? 0 : -1.5 * (0.5 - 0.5 * Math.cos(2 * Math.PI * (tg / 0.9 + phaIdle(v))));   // nhún 0..1.5px cho ảnh tĩnh, lệch pha theo tướng
    const gl = giatLui(v, tg) * GIAT_PX;
    if (XOAY_CODE.has(v.id) && veXoay(c, v, cx, chan, tg, i, nhun)) return true;   // WARP: sheet S xoay theo góc
    if (!XOAY_CODE.has(v.id) && veHuong(c, v, cx, chan, tg, i, nhun)) return true;   // 8 hướng (ưu tiên)
    const idle = co(`v3:${v.id}:idle`), atk = co(`v3:${v.id}:attack`);
    const fA = atk && v.atkT != null ? khungAtk(soKhung(atk), tg - v.atkT) : -1;
    if (idle || fA >= 0) {   // sheet v3 chung (không theo hướng): chỉ đổi khung
      const im = fA >= 0 ? atk : idle, f = fA >= 0 ? fA : khungIdle(soKhung(idle), tg, v), fh = im.height;
      const d = doSheet(idle || im), w = fh * d.s;
      c.drawImage(im, f * fh, 0, fh, fh, cx - w / 2 - (v.huong || -1) * gl, chan - d.day * d.s, w, w);
      return true;
    }
    const im = co('v3:' + v.id); if (!im) return false;
    const s = Math.min(C.TUONG_CAO / im.height, C.TUONG_RONG / im.width), w = im.width * s, h = im.height * s;
    if (XOAY_CODE.has(v.id)) {   // WARP drone: xoay cả ảnh quanh tâm hình theo góc mượt v.goc (ảnh gốc nhìn xuống = S = 90°)
      const tam = chan - h / 2 + nhun, g = v.goc == null ? Math.PI / 2 : v.goc;
      c.save(); c.translate(cx - Math.cos(g) * gl, tam - Math.sin(g) * gl); c.rotate(g - Math.PI / 2);
      c.drawImage(im, -w / 2, -h / 2, w, h);
      if (gl > 0) { c.globalCompositeOperation = 'lighter'; c.globalAlpha *= 0.35 * gl / GIAT_PX; c.drawImage(im, -w / 2, -h / 2, w, h); }
      c.restore(); return true;
    }
    const x = cx - w / 2 - (v.huong || -1) * gl, y = chan - h + nhun;   // giật lùi ngược hướng bắn
    c.drawImage(im, x, y, w, h);
    if (gl > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha *= 0.35 * gl / GIAT_PX; c.drawImage(im, x, y, w, h); c.restore(); }   // chớp sáng nhẹ
    return true;
  }
  // xuất hiện: summon = hiện từ cổng sáng + phóng đều 0.85→1.0 trong 150ms; merge = ẩn lúc 2 tướng cũ thu vào tâm (110ms) rồi bật ra 0.85→1.08→1.0 (130ms)
  const SINH_T = C.SINH_T - 0.02, GOP_THU = C.GOP_T * 0.45, GOP_BAT = C.GOP_T * 0.55;   // summon 220ms, merge 180ms
  function heSoXuatHien(v, tg) {   // [tỉ lệ, alpha]
    if (v.sinhT == null) return [1, 1];
    const e = tg - v.sinhT;
    if (v.kieuSinh === 'gop') {
      if (e < GOP_THU) return [0, 0];
      const k = (e - GOP_THU) / GOP_BAT; if (k >= 1) return [1, 1];
      return [k < 0.6 ? 0.85 + 0.23 * (k / 0.6) : 1.08 - 0.08 * ((k - 0.6) / 0.4), Math.min(1, k * 3)];
    }
    if (e >= SINH_T || e < 0) return [1, 1];
    const k = e / SINH_T, ra = 1 - (1 - k) * (1 - k);
    return [0.85 + 0.15 * ra, Math.min(1, k * 1.8)];
  }
  // ================= TƯỚNG PIXEL ART (đường render dùng lại cho mọi tướng có TUONG[id].px) =================
  // - imageSmoothingEnabled = false; tỉ lệ tính theo PIXEL THIẾT BỊ: r = số px thiết bị cho 1 px ảnh, ≥ 1 thì làm tròn SỐ NGUYÊN
  //   (cao ≈ C.TUONG_CAO × co như tướng khác), < 1 (màn nhỏ) thì giữ r nhưng toạ độ góc ảnh vẫn bắt đúng lưới px thiết bị.
  // - Neo chân: đo khung 0 mỗi ảnh → đáy phần hình + tâm chân (giữa các điểm có hình ở 3 hàng đáy) → đặt tại (cx, chan) như tướng khác.
  // - Hướng: v.hg (game.js) → tên hướng; đứng yên = ô của dir8 (P.dir8.thuTu); hướng có sheet idle thì phát idle; đang đánh → P.atk.huong.
  const HG_TEN = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
  const coPx = (id) => !!(TUONG[id] && TUONG[id].px && co(`px:${id}:8`));
  const o8 = (P, ten) => { const n = Math.max(0, P.dir8.thuTu.indexOf(ten)); return P.dir8.doc ? [0, n] : [n, 0]; };   // [cột, hàng] ô đứng hướng ten trong dir8
  const DO_PX = new Map();
  function doPx(im, fw, fh, f = 0, hang = 0) {   // { y0, day, tam } của khung f, hàng hang (alpha > 8)
    const key = im.src + '|' + f + '|' + hang; let d = DO_PX.get(key); if (d) return d;
    d = { y0: 0, day: fh, tam: fw / 2 };
    try {
      const cv = document.createElement('canvas'); cv.width = fw; cv.height = fh; const g = cv.getContext('2d'); g.drawImage(im, f * fw, hang * fh, fw, fh, 0, 0, fw, fh);
      const px = g.getImageData(0, 0, fw, fh).data; let y0 = -1, y1 = -1;
      for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) if (px[(y * fw + x) * 4 + 3] > 8) { if (y0 < 0) y0 = y; y1 = y; }
      if (y1 >= 0) {
        let x0 = fw, x1 = -1;
        for (let y = Math.max(0, y1 - 2); y <= y1; y++) for (let x = 0; x < fw; x++) if (px[(y * fw + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; }
        d = { y0, day: y1 + 1, tam: (x0 + x1 + 1) / 2 };
      }
    } catch (e) { /* ảnh khác nguồn: neo giữa đáy ô */ }
    DO_PX.set(key, d); return d;
  }
  // hướng hiển thị của tướng pixel: vùng trễ MUOT.TRE + tối đa 1 lần / MUOT.DOI_MIN, rồi đi từng hướng kề có hoà trộn.
  // trả về [A, B, k]: đang hoà từ hướng A sang B, tiến độ k (0..1); đứng yên thì A = B, k = 1.
  function huongPx(v, tg) {
    if (v._d == null || tg < v._t0 - 1) { const h = v.hg == null ? 2 : v.hg; v._d = v._toi = v._dDich = h; v._t0 = tg; v._dur = 0; v._dT = -9; }
    if (v.gocMuc != null) {
      const deg = v.gocMuc * 180 / Math.PI; let lech = Math.abs(deg - v._dDich * 45) % 360; if (lech > 180) lech = 360 - lech;
      if (lech > MUOT.TRE && tg - v._dT >= MUOT.DOI_MIN) { v._dDich = ((Math.round(deg / 45) % 8) + 8) % 8; v._dT = tg; }
    }
    let noi = false;
    for (let n = 0; n < 9; n++) {
      if (v._toi !== v._d) { if (tg - v._t0 < v._dur) break; v._t0 += v._dur; v._d = v._toi; noi = true; }   // xong 1 bước → bước sau nối liền
      if (v._d === v._dDich) break;
      const d = ((v._dDich - v._d) % 8 + 8) % 8, cung = d < 4 || (d === 4 && [1, 2, 3].some((k) => (v._d + k) % 8 === 2));
      const con = cung ? d : 8 - d;
      v._toi = (v._d + (cung ? 1 : 7)) % 8; v._dur = con === 1 && !noi ? MUOT.HOA_1 : MUOT.HOA_BUOC;
      if (!noi) v._t0 = tg;
    }
    return v._toi === v._d ? [v._d, v._d, 1] : [v._d, v._toi, Math.max(0, Math.min(1, (tg - v._t0) / v._dur))];
  }
  const hoa = (x) => Math.min(1, 2 * x);   // alpha hoà trộn: lớp ra = hoa(1-k), lớp vào (vẽ trên) = hoa(k)
  // các lớp ảnh của 1 hướng tại thời điểm tg: [{ im, f, hang, fw, fh, lat, a }] theo thứ tự vẽ; dang = đang trong chuỗi tấn công (kể cả hoà)
  function lopPx(v, P, im8, ten, tg) {
    const dung = () => {
      const id = P.idle && P.idle[ten], ii = id && co(`px:${v.id}:idle:${ten}`);
      if (ii) { const n = Math.max(1, Math.round(ii.width / id.o)); return { im: ii, f: Math.floor(tg * 1000 / id.ms + phaIdle(v) * n) % n, hang: 0, fw: id.o, fh: id.o }; }
      const [c8, h8] = o8(P, ten);
      if (P.tho && P.dir8.doc) { const n = P.tho.n || 4; return { im: im8, f: Math.floor(tg * 1000 / P.tho.ms + phaIdle(v) * n) % n, hang: h8, fw: P.dir8.o, fh: P.dir8.o }; }   // v9: thở bằng khung thật
      return { im: im8, f: c8, hang: h8, fw: P.dir8.o, fh: P.dir8.o, ref: true };
    };
    const laKn = P.kn && v.knT0 != null && co(`px:${v.id}:kn`) && (v.atkT == null || v.knT0 >= v.atkT);   // bộ DC: đang chạy kỹ năng → sheet kn
    const A = laKn ? P.kn : P.atk; let khung = null;
    if (A && typeof A.file === 'string') { const ia = co(`px:${v.id}:${laKn ? 'kn' : 'atk'}`); if (ia) { const o = A.o || P.dir8.o, hang = Math.max(0, (A.hang || P.dir8.thuTu).indexOf(ten)); khung = (f) => ({ im: ia, f, hang, fw: o, fh: o }); } }
    else if (A) { const [d, l] = A.huong[ten] || ['s', 0], ia = co(`px:${v.id}:atk:${d}`); if (ia) khung = (f) => ({ im: ia, f, hang: 0, fw: A.w, fh: A.h, lat: !!l }); }
    const t0 = laKn ? v.knT0 : v.atkT, el = t0 == null ? -1 : tg - t0;
    if (!khung || el < 0) return { lop: [Object.assign(dung(), { a: 1 })], dang: false };
    const nh = A.nhip, vao = nh[0] / 1000; let t = vao;
    if (el < vao) { const k = el / vao; return { lop: [Object.assign(dung(), { a: hoa(1 - k) }), Object.assign(khung(1), { a: hoa(k) })], dang: true }; }
    for (let f = 1; f < nh.length; f++) { t += nh[f] / 1000; if (el < t) return { lop: [Object.assign(khung(f), { a: 1 })], dang: true }; }
    const e2 = el - t;
    if (e2 < MUOT.HOA_VE) { const k = e2 / MUOT.HOA_VE; return { lop: [Object.assign(khung(nh.length - 1), { a: hoa(1 - k) }), Object.assign(dung(), { a: hoa(k) })], dang: true }; }
    return { lop: [Object.assign(dung(), { a: 1 })], dang: false };
  }
  function vePixel(c, v, cx, chan, tg) {
    const P = TUONG[v.id].px, im8 = co(`px:${v.id}:8`); if (!P || !im8) return false;
    const [hA, hB, kH] = huongPx(v, tg);
    const LA = lopPx(v, P, im8, HG_TEN[hA], tg), LB = hB !== hA ? lopPx(v, P, im8, HG_TEN[hB], tg) : null;
    const lop = LB ? [...LA.lop.map((l) => Object.assign(l, { a: l.a * hoa(1 - kH) })), ...LB.lop.map((l) => Object.assign(l, { a: l.a * hoa(kH) }))] : LA.lop;
    // cỡ: chiều cao phần hình ô S của dir8 = C.TUONG_CAO × co (× to khi biến hình) → làm tròn theo px thiết bị
    const ref = doPx(im8, P.dir8.o, P.dir8.o, ...o8(P, 's')), hRef = ref.day - ref.y0;
    const T0 = c.getTransform(), kx = Math.hypot(T0.a, T0.b) || 1;
    const cao = C.TUONG_CAO * (TUONG[v.id].co || 1) * (v.toT > 0 ? P.to || 1.25 : 1);
    let r = cao * kx / hRef;
    if (r >= 1 && P.thu !== 'dc') { const rn = Math.round(r); if (!P.neo || Math.abs(rn - r) / r < 0.12) r = rn; }   // px nguyên khi không lệch cỡ quá 12% (P.neo: giữ cỡ 1,1–1,3 ô)
    const s = r / kx;
    // thở: 0 hoặc −THO_PX px sprite gốc (làm tròn, không co giãn), chu kỳ THO_T, pha ngẫu nhiên mỗi tướng; tắt khi đang đánh
    if (v._pha == null) v._pha = Math.random();
    const dang = LA.dang || (LB && LB.dang);
    const tho = dang || P.tho ? 0 : -MUOT.THO_PX * Math.round(0.5 - 0.5 * Math.cos(2 * Math.PI * (tg / MUOT.THO_T + v._pha)));
    const snapX = (x) => (Math.round(T0.a * x + T0.e) - T0.e) / T0.a, snapY = (y) => (Math.round(T0.d * y + T0.f) - T0.f) / T0.d;
    const a0 = c.globalAlpha;
    c.save(); c.imageSmoothingEnabled = false;
    for (const L of lop) {
      if (L.a <= 0.001) continue;
      const m = P.neo ? { day: P.neo[1], tam: P.neo[0] } : doPx(L.im, L.fw, L.fh, L.ref ? L.f : 0, L.ref ? L.hang : 0);   // P.neo: neo chân CỐ ĐỊNH trong ô sheet (đứng & tấn công đã căn chung) → không nhảy
      const tam = L.lat ? L.fw - m.tam : m.tam;
      const x = snapX(cx - tam * s), y = snapY(chan - (m.day - tho) * s), w = L.fw * s, h = L.fh * s;
      c.globalAlpha = a0 * Math.min(1, L.a);
      if (L.lat) { c.save(); c.translate(x + w, y); c.scale(-1, 1); c.drawImage(L.im, L.f * L.fw, L.hang * L.fh, L.fw, L.fh, 0, 0, w, h); c.restore(); }
      else c.drawImage(L.im, L.f * L.fw, L.hang * L.fh, L.fw, L.fh, x, y, w, h);
    }
    c.restore();
    return true;
  }
  function veHinhTuong(c, v, cx, chan, tg, i) {   // chỉ sprite (không bóng/sao) — dùng cả khi kéo
    if (coPx(v.id)) {   // tướng pixel: xuất hiện chỉ hiện dần (không phóng to/nhỏ để giữ px nguyên)
      const [, al] = heSoXuatHien(v, tg); if (al <= 0) return;
      c.save(); c.globalAlpha *= al; const ok = vePixel(c, v, cx, chan, tg); c.restore();
      if (ok) return;
    }
    if (coV3(v.id)) {
      let [sc, al] = heSoXuatHien(v, tg);
      sc *= 1 + 0.01 * ((v.sao || 1) - 1);   // sao cao: to hơn chút (1.00 → 1.06), quanh chân, không vượt ô
      if (al <= 0) return;
      c.save(); c.globalAlpha *= al;
      if (sc !== 1) { c.translate(cx, chan); c.scale(sc, sc); c.translate(-cx, -chan); }   // phóng đều quanh chân, không méo
      const ok = veV3(c, v, cx, chan, tg, i); c.restore();
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
  function veCong(c, cx, chan, e) {   // cổng triệu hồi dưới chân: sheet vfx_summon (6 khung) chạy trong SINH_T+30ms; không có thì vòng sáng vẽ code
    const T = SINH_T + 0.03; if (e < 0 || e >= T) return;
    const k = e / T, im = co('v3:vfx_summon');
    c.save(); c.globalCompositeOperation = 'lighter';
    if (im) { const fh = im.height, n = soKhung(im), f = Math.min(n - 1, Math.floor(k * n)), sz = 46; c.drawImage(im, f * fh, 0, fh, fh, cx - sz / 2, chan - sz * 0.72, sz, sz); }
    else { c.globalAlpha = 1 - k; c.strokeStyle = '#3ce7ff'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(cx, chan, 6 + 10 * k, 2 + 3 * k, 0, 0, 7); c.stroke(); veGlow(c, '#3ce7ff', cx, chan - 8, 14 * (1 - k) + 4, 0.8 * (1 - k)); }
    c.restore();
  }
  function veCotNeo(c, x, y, t, v) {   // CỘT NEO ANCHOR (TẠM, vẽ code — sẽ thay ảnh ChatGPT): đế + thân cột + đĩa ăng-ten + đèn xanh lục nhịp
    const h = Math.max(14, C.TUONG_CAO * 0.42), nh = 0.5 + 0.5 * Math.sin(t * 4 + (v.uid || 0));
    c.save();
    c.globalAlpha = 0.35; c.fillStyle = '#000'; c.beginPath(); c.ellipse(x, y, 4.5, 1.8, 0, 0, 7); c.fill(); c.globalAlpha = 1;
    c.fillStyle = '#2a3140'; rr(c, x - 3.5, y - 3, 7, 3.5, 1); c.fill();
    c.fillStyle = '#4a6a8f'; c.fillRect(x - 1.3, y - h, 2.6, h - 2); c.fillStyle = '#ffd23a'; c.fillRect(x - 1.3, y - h * 0.45, 2.6, 1.2);
    c.strokeStyle = '#7f9bbd'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(x, y - h, 4, 1.6, 0, 0, 7); c.stroke();
    c.globalCompositeOperation = 'lighter'; veGlow(c, '#00ffa3', x, y - h - 1.5, 5 + 2 * nh, 0.5 + 0.3 * nh);
    c.fillStyle = '#b8ffe2'; c.beginPath(); c.arc(x, y - h - 1.5, 1.3, 0, 7); c.fill();
    c.restore();
  }
  function veUnit(c, S, v, i, tg, t, hop) {
    const v3 = !!coV3(v.id);
    const [x, y] = G.oXY(S, i), cx = x + C.O / 2, chan = y + C.OH - (v3 ? C.CHAN : 5), h = HANH[TUONG[v.id].hanh];
    const moiGop = v.kieuSinh === 'gop' && v.sinhT != null && tg - v.sinhT < GOP_THU;
    const buff = G.afBat(S, 'tocDanh') ? ARCHFIEND[S.af.id].mau : v.bufT > 0 ? '#00ffa3' : null;   // đang được buff thật → vòng aura mảnh mờ dưới chân
    if (!moiGop) { veBongChan(c, cx, chan); if (buff) veAura(c, cx, chan, buff, t, v.uid); }   // KHÔNG còn đế màu bậc — chỉ bóng đổ (+ vòng aura mảnh khi có buff)
    if (v.sinhT != null && v.kieuSinh !== 'gop') veCong(c, cx, chan, tg - v.sinhT);
    if (hop) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = '#ffffff'; c.lineWidth = 1.4; c.beginPath(); c.ellipse(cx, chan, C.O * 0.42, C.O * 0.15, 0, 0, 7); c.stroke(); c.restore(); }
    if (v.nong > 0) veGlow(c, '#ff3355', cx, chan - 18, 24, 0.45 + 0.15 * Math.sin(t * 12));
    if (v.corrT > 0) veGlow(c, '#c04dff', cx, chan - 18, 24, 0.4);
    if (TUONG[v.id].hoTro && TUONG[v.id].hoTro.cot && !moiGop) veCotNeo(c, cx + C.O * 0.34, chan - 3, t, v);   // cột neo: VẬT RIÊNG cạnh nhân vật (sau lưng)
    if (v.knFxT != null && S.t - v.knFxT < 0.6 && co(`fx9:${v.id}:kn`)) {   // bộ DC (ARC kn.sau): vòng sét SAU LƯNG tướng — vẽ trước sprite
      const im = co(`fx9:${v.id}:kn`), fh = im.height, n = Math.max(1, Math.round(im.width / fh)), fr = Math.min(n - 1, Math.floor((S.t - v.knFxT) / 0.6 * n)), z = C.TUONG_CAO * 1.25;
      c.save(); c.globalCompositeOperation = 'lighter'; c.drawImage(im, fr * fh, 0, fh, fh, cx - z / 2, chan - C.TUONG_CAO * 0.55 - z / 2, z, z); c.restore();
    }
    veHinhTuong(c, v, cx, chan, tg, i);
  }
  function veGopCu(c, S, f, tg) {   // merge: 2 tướng cũ (ô kéo + ô đích) thu nhỏ đều và trượt vào tâm ô đích trong GOP_THU giây
    if (!f.cu || f.t >= GOP_THU) return;
    const p = f.t / GOP_THU, e = p * p, [xi, yi] = G.oXY(S, f.i), tx = xi + C.O / 2, ty = yi + C.OH - C.CHAN - 10;
    [f.tu, f.i].forEach((o, n) => {
      const v = f.cu[n]; if (!v || o == null) return;
      const [x, y] = G.oXY(S, o), sx = x + C.O / 2, sy = y + C.OH - C.CHAN;
      const px = sx + (tx - sx) * e, py = sy + (ty - sy) * e, sc = 1 - 0.75 * e;
      c.save(); c.globalAlpha *= 1 - 0.7 * e; c.translate(px, py); c.scale(sc, sc);
      veHinhTuong(c, v, 0, 0, tg);
      c.restore();
    });
  }
  function veKiem(c, x, y, m) {   // biểu tượng kiếm nhỏ (cận chiến)
    c.save(); c.translate(x, y); c.rotate(-Math.PI / 4); c.lineCap = 'round';
    c.strokeStyle = 'rgba(0,0,0,0.8)'; c.lineWidth = 3.2; c.beginPath(); c.moveTo(0, -5); c.lineTo(0, 4); c.moveTo(-2.6, 2); c.lineTo(2.6, 2); c.stroke();
    c.strokeStyle = m; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, -5); c.lineTo(0, 4); c.moveTo(-2.6, 2); c.lineTo(2.6, 2); c.stroke(); c.restore();
  }
  function veNgoaiTam(c, x, y, t) {   // cận chiến đứng ô KHÔNG với tới đường: kiếm mờ + gạch chéo đỏ (nhịp nhẹ)
    c.save(); c.globalAlpha = 0.6 + 0.25 * Math.sin(t * 4);
    c.beginPath(); c.arc(x, y, 6.5, 0, 7); c.fillStyle = 'rgba(4,6,14,0.8)'; c.fill();
    veKiem(c, x, y, 'rgba(200,205,215,0.7)');
    c.strokeStyle = '#ff5a5a'; c.lineWidth = 1.6; c.beginPath(); c.arc(x, y, 5.6, 0, 7); c.moveTo(x - 4, y + 4); c.lineTo(x + 4, y - 4); c.stroke(); c.restore();
  }
  function veNhanO(c, S, v, i, t) {   // sao + trạng thái (lớp trên cùng của bàn)
    const [x, y] = G.oXY(S, i), cx = x + C.O / 2;
    const dau = y + C.OH - C.CHAN - C.TUONG_CAO * (TUONG[v.id].co || 1);   // đỉnh đầu (theo cỡ chuẩn, KHÔNG theo nhún) → sao cố định
    veSao(c, cx, Math.max(y + (v.sao > 3 ? 6 : 4), dau - (v.sao > 3 ? 4 : 2)), v.sao);
    const buff = G.afBat(S, 'tocDanh') || v.bufT > 0 || !!v.keB, debuff = v.nong > 0 || v.corrT > 0 || v.khoaT > 0, my = y + C.OH - C.CHAN - C.TUONG_CAO * 0.55;
    if (buff) veMuiTen(c, x + C.O - 7, my, true, t);
    if (debuff) veMuiTen(c, x + 7, my, false, t);
    let ix = x + 4;
    const nhan = (txt, mau) => { c.font = '700 6px Orbitron, "Segoe UI", sans-serif'; c.textAlign = 'left'; const w = c.measureText(txt).width + 4;
      c.fillStyle = 'rgba(4,6,14,0.85)'; rr(c, ix, y + C.OH - 11, w, 8, 2); c.fill(); c.fillStyle = mau; c.fillText(txt, ix + 2, y + C.OH - 4.5); ix += w + 2; };
    if (G.laCanChien(v.id) && !G.oCanChien(S, i)) veNgoaiTam(c, x + 8, y + 9, t);   // cận chiến NGOÀI TẦM: không ra đòn ở ô này
    if (v.khoaT > 0) nhan('LOCK ' + Math.ceil(v.khoaT), '#ff8080');   // JAMMER khoá kỹ năng
    if (v.bufT > 0) nhan('BUF', '#00ffa3');                          // GLITCH COPY BUFFER
    if (v.giaoDichT > S.t) nhan('$', '#ffd84a');                     // BROKER TRADE
    if (!S.ai) {   // huy hiệu kỹ năng CHỦ ĐỘNG (VÀNG): sẵn sàng = vàng nhịp sáng; hồi chiêu = vòng tiến độ xám
      const ds = G.chuDong(S, i);
      if (ds.length) {
        const san = ds.some((m) => m.san), bx = x + C.O - 7, byy = y + 8;
        const p = san ? 1 : Math.max(...ds.map((m) => 1 - m.cd / m.cf.cd));
        c.save(); c.beginPath(); c.arc(bx, byy, 5.5, 0, 7); c.fillStyle = 'rgba(4,6,14,0.85)'; c.fill();
        c.lineWidth = 1.8; c.strokeStyle = san ? '#ffc93a' : 'rgba(160,170,190,0.9)'; c.beginPath(); c.arc(bx, byy, 4.6, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); c.stroke();
        if (san) { c.globalAlpha = 0.5 + 0.5 * Math.sin(t * 6); veGlow(c, '#ffc93a', bx, byy, 9, 0.8); c.globalAlpha = 1; }
        c.fillStyle = san ? '#fff2b0' : '#a0a8b8'; c.beginPath(); c.moveTo(bx + 0.8, byy - 3.2); c.lineTo(bx - 2, byy + 0.5); c.lineTo(bx - 0.2, byy + 0.5); c.lineTo(bx - 0.8, byy + 3.2); c.lineTo(bx + 2, byy - 0.5); c.lineTo(bx + 0.2, byy - 0.5); c.closePath(); c.fill();
        c.restore();
      }
    }
    if (v.nong > 0 || v.corrT > 0) {
      const tx = v.nong > 0 ? 'HOT ' + Math.ceil(v.nong) : 'BUG';
      c.font = '700 6.5px Orbitron, "Segoe UI", sans-serif'; c.textAlign = 'center'; c.lineWidth = 2.5; c.strokeStyle = 'rgba(0,0,0,0.85)';
      c.strokeText(tx, cx, y + C.OH - 13); c.fillStyle = v.nong > 0 ? '#ffb0b0' : '#e8b6ff'; c.fillText(tx, cx, y + C.OH - 13);
    }
  }
  // ---------- quái ----------
  const TRANG = new Map();   // bóng trắng của 1 khung (chớp trắng 45–75ms khi trúng đòn) — chỉ tô lại alpha của ảnh, không vẽ hình mới
  function khungTrang(im, f) {
    let m = TRANG.get(im); if (!m) { m = []; TRANG.set(im, m); }
    if (m[f]) return m[f];
    const fh = im.height, cv = document.createElement('canvas'); cv.width = fh; cv.height = fh;
    const g = cv.getContext('2d'); g.drawImage(im, f * fh, 0, fh, fh, 0, 0, fh, fh); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#ffffff'; g.fillRect(0, 0, fh, fh);
    return (m[f] = cv);
  }
  const MAU_QUAI = { thuong: '#ff3355', nhanh: '#ff2bd6', trau: '#ff8a1a' };
  function veQuai(c, q, t, tg) {
    const w = q.co, yChan = q.y + 2, vao = q.daRa ? 1 : Math.min(1, (tg - (q.sinhT || 0)) / 0.5);
    c.save(); c.globalAlpha = vao;
    veBong(c, q.x, yChan, w * 0.8);
    const m = q.boss ? q.boss.mau : q.ta ? q.ta.mau : MAU_QUAI[q.kind] || '#ff5a3a';
    if (Q.cao && (q.boss || q.ta)) veGlow(c, m, q.x, yChan - w / 2, w * 0.7, 0.22);
    const sh3 = co(q.boss ? 'v3b:' + q.boss.id : q.ta ? 'v3ta:' + q.kind : 'v3q:' + q.kind), sh = sh3 ? null : co(q.boss ? 'v2b:' + q.boss.id : 'v2q:' + q.kind);
    if (q.ta) veTinhAnhDuoi(c, q, w, yChan, t);
    if (sh3) {   // đi bộ 10fps (bọ 6 khung 112, tinh anh 6 khung 128, trùm 8 khung): cao phần hình = w, đáy = chân; chớp trắng khi trúng đòn
      const k = doKhung(sh3), fh = sh3.height, n = soKhung(sh3), s = w / (k.y1 - k.y0 + 1), dw = fh * s;
      const f = q.choang > 0 ? 0 : Math.floor((tg + q.uid * 0.137) * 10) % n;
      let x = q.x - (k.x0 + k.x1 + 1) / 2 * s; const y = yChan - (k.y1 + 1) * s;
      if (q.ta && q.ta.k === 'no' && q.hp / q.max < 0.35) x += Math.sin(t * 60) * 1;   // BROOD gần chết: rung nhẹ (dịch nguyên khối)
      const mo = q.neT > 0 ? 0.38 + 0.12 * Math.sin(t * 20) : 1;                        // CICADA lệch pha: mờ trong suốt
      c.save(); c.globalAlpha = vao * mo;
      // XOAY NGUYÊN ẢNH theo hướng đi trên hành lang (ảnh gốc nhìn xuống = hướng đi xuống), góc mượt ở chỗ rẽ — không méo hình
      { const dich = q.huongDi == null ? Math.PI / 2 : q.huongDi; if (q.gocVe == null) q.gocVe = dich;
        let dg = dich - q.gocVe; dg = Math.atan2(Math.sin(dg), Math.cos(dg)); q.gocVe += dg * Math.min(1, Math.max(0, tg - (q._tgV == null ? tg : q._tgV)) * 9); q._tgV = tg;
        const px = q.x, py = yChan - w / 2; c.translate(px, py); c.rotate(q.gocVe - Math.PI / 2); c.translate(-px, -py); }
      c.drawImage(sh3, f * fh, 0, fh, fh, x, y, dw, dw);
      if (q.neT > 0) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.35; c.drawImage(bongMau(sh3, '#a35cff'), f * fh, 0, fh, fh, x, y, dw, dw); c.globalCompositeOperation = 'source-over'; }
      c.globalAlpha = vao;
      if (q.flash > 0) { c.globalAlpha = 0.8 * vao; c.drawImage(khungTrang(sh3, f), x, y, dw, dw); c.globalAlpha = vao; }
      c.restore(); c.globalAlpha = vao;
    } else if (sh) {   // sheet nhiều hàng: quái 3 hàng idle/move/hurt ×8; boss 4 hàng idle/move/attack/hurt ×16
      const soHang = q.boss ? 4 : 3, hang = q.flash > 0 ? soHang - 1 : q.boss && q.tele ? 2 : q.choang > 0 ? 0 : 1;
      const n = soKhung(sh, soHang), f = Math.floor((tg + q.uid * 0.21) * (q.boss ? 12 : 10)) % n;
      veKhung(c, sh, f, q.x, yChan, w * 1.9 / 128, hang, soHang);
    } else {
      const hv = q.kind === 'thuong' || q.boss ? Math.sin(t * 4 + q.uid) * 1.2 : 0, s = q.boss ? w + 6 : w;
      if (q.boss && q.boss.id === 'overclock') { c.save(); c.translate(q.x, yChan - w / 2 - 2 + hv); c.rotate(t * 2.5); c.drawImage(sprBanh(), -s / 2 - 3, -s / 2 - 3, s + 6, s + 6); c.restore(); }
      const a = q.boss ? ANH['b:' + q.boss.id] : ANH['e:' + q.kind], sp = q.boss ? sprBoss(q.boss) : sprQuai(q.kind);
      veHinh(c, a, sp, q.x - s / 2, yChan - s + hv, s, s);
      if (q.flash > 0 && Q.cao) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(0.7, q.flash * 7) * vao; veHinh(c, a, sp, q.x - s / 2, yChan - s + hv, s, s); c.globalCompositeOperation = 'source-over'; c.globalAlpha = vao; }
    }
    const cy = yChan - w / 2;
    if (q.ta) veTinhAnhTren(c, q, w, cy, t);
    if (q.khienT > 0) {   // FIREWALL khiên trước thân (phía đang đi tới = dưới)
      c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,90,60,0.9)'; c.lineWidth = 3; c.beginPath(); c.ellipse(q.x, cy + w * 0.25, w * 0.62, w * 0.42, 0, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
      c.lineWidth = 1; c.strokeStyle = '#fff0d0'; c.stroke(); c.restore();
    }
    if (q.kenT > 0) {     // CORRUPTOR kén: vòng tím + tiến độ phá (cần gây đủ sát thương trước khi hết giờ)
      const p = Math.min(1, q.kenDa / q.kenCan);
      c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(192,77,255,0.5)'; c.lineWidth = 3; c.beginPath(); c.arc(q.x, cy, w * 0.6, 0, 7); c.stroke();
      c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.beginPath(); c.arc(q.x, cy, w * 0.6, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); c.stroke(); c.restore();
    }
    // hiệu ứng TRÙM trên quái (khiên, tăng tốc, bản sao) giữ hình nhỏ quanh thân; hiệu ứng TƯỚNG gây ra → biểu tượng nhỏ cạnh thanh máu
    if (q.khien > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,120,120,0.85)'; c.lineWidth = 1.5; c.beginPath(); c.arc(q.x, cy, w * 0.55, 0, 7); c.stroke(); c.restore(); }
    if (q.nhanhT > 0) { c.save(); c.strokeStyle = 'rgba(255,200,60,0.8)'; c.lineWidth = 1; for (let k = 0; k < 3; k++) { const xx = q.x - 6 + k * 6, l = 5 + ((t * 30 + k * 13) % 5); c.beginPath(); c.moveTo(xx, cy - w * 0.4 - l); c.lineTo(xx, cy - w * 0.4); c.stroke(); } c.restore(); }
    if (q.echo) { c.save(); c.strokeStyle = '#ffb31a'; c.lineWidth = 1.2; c.setLineDash([3, 2]); c.lineDashOffset = -t * 20; c.beginPath(); c.arc(q.x, cy, w * 0.5, 0, 7); c.stroke(); c.restore(); }
    const bw = q.boss ? 56 : q.ta ? 32 : 22, bh = q.boss ? 5 : q.ta ? 4 : 3, by = yChan - w - (q.boss ? 9 : 6), kHp = Math.max(0, q.hp / q.max);
    const qx0 = q.x; q = Object.create(q); q.x = Math.max(bw / 2 + 2, qx0);   // thanh máu không tràn mép trái màn
    if (!q.boss) {   // thanh máu bọ 22×3 · tinh anh 32×4 viền màu tinh anh
      c.fillStyle = q.ta ? q.ta.mau : 'rgba(2,4,12,0.88)'; c.fillRect(q.x - bw / 2 - 1, by - 1, bw + 2, bh + 2);
      if (q.ta) { c.fillStyle = 'rgba(2,4,12,0.9)'; c.fillRect(q.x - bw / 2, by, bw, bh); }
      c.fillStyle = kHp > 0.4 ? '#3cffb0' : '#ff3c6e'; c.fillRect(q.x - bw / 2, by, bw * kHp, bh);
    } else {         // boss 56×5
      c.fillStyle = 'rgba(2,4,12,0.9)'; c.fillRect(q.x - bw / 2 - 1, by - 1, bw + 2, bh + 2);
      c.fillStyle = q.boss.mau; c.fillRect(q.x - bw / 2, by, bw * kHp, bh);
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(q.x - bw / 2, by, bw * kHp, 1);
    }
    let ix = q.x + bw / 2 + 4;
    const icon = (k, n) => { veIcon(c, k, ix, by + bh / 2, n); ix += 6; };
    if (q.chayT > 0) icon('chay');
    if (q.chill > 0) icon('bang', q.chill);
    if (q.tox > 0) icon('doc', q.tox);
    if (q.breachT > 0) icon('hack');
    if (q.bounty > 0) icon('na');
    if (q.choang > 0) icon('choang');
    c.restore();
  }
  // ---- TINH ANH: báo trước bằng hình dạng + màu (vòng dưới đất / quanh thân), tiết chế ----
  function veTinhAnhDuoi(c, q, w, yChan, t) {   // dưới sprite: vòng đất theo màu tinh anh
    c.save(); c.globalAlpha = 0.55; c.strokeStyle = q.ta.mau; c.lineWidth = 1.2; c.beginPath(); c.ellipse(q.x, yChan, w * 0.45, w * 0.15, 0, 0, 7); c.stroke(); c.restore();
  }
  function veTinhAnhTren(c, q, w, cy, t) {
    const d = q.ta, b = q.taBao || 0;
    c.save(); c.globalCompositeOperation = 'lighter';
    if (d.k === 'phan') {
      if (q.phan) {   // gương phản đã dựng: lục giác sáng quanh thân
        c.strokeStyle = 'rgba(190,215,255,0.85)'; c.lineWidth = 1.6; hexP(c, q.x, cy, w * 0.62, t * 0.8); c.stroke();
        c.globalAlpha = 0.25 + 0.15 * Math.sin(t * 8); c.fillStyle = '#bcd4ff'; hexP(c, q.x, cy, w * 0.62, t * 0.8); c.fill();
      } else if (b > 0) { c.globalAlpha = b; c.strokeStyle = '#bcd4ff'; c.lineWidth = 1.4; hexP(c, q.x, cy, w * (1.1 - 0.48 * b), t * 2); c.stroke(); }   // báo 0.7s: lục giác co dần
    } else if (d.k === 'pha') {
      if (b > 0) { c.globalAlpha = b; c.strokeStyle = '#c79bff'; c.lineWidth = 1.4; c.setLineDash([3, 3]); c.lineDashOffset = -t * 30; c.beginPath(); c.arc(q.x, cy, w * (1.0 - 0.4 * b), 0, 7); c.stroke(); }
      if (q.neT > 0) { c.globalAlpha = 0.6; c.strokeStyle = '#a35cff'; c.lineWidth = 1; c.setLineDash([2, 4]); c.beginPath(); c.arc(q.x, cy, w * 0.6, 0, 7); c.stroke(); }
    } else if (d.k === 'khoa' && b > 0) {   // anten đỏ chớp
      const nh = 0.5 + 0.5 * Math.sin(t * 25);
      veGlow(c, '#ff3030', q.x - w * 0.14, cy - w * 0.42, 5, nh); veGlow(c, '#ff3030', q.x + w * 0.14, cy - w * 0.42, 5, nh);
    }
    c.restore();
  }
  // JAMMER: đường đứt nét đỏ nối tinh anh → ô tướng bị chọn (đang báo trước 1s) — vẽ sau bàn
  function veDayKhoa(c, S, t) {
    for (const q of S.quai) {
      if (!q.ta || q.ta.k !== 'khoa' || q.khoaO == null || !(q.taBao > 0) || q.ban !== S) continue;
      const [x, y] = G.oTam(S, q.khoaO);
      c.save(); c.globalAlpha = 0.5 + 0.5 * q.taBao; c.strokeStyle = '#ff4040'; c.lineWidth = 1.5; c.setLineDash([4, 3]); c.lineDashOffset = -t * 40;
      c.beginPath(); c.moveTo(q.x, q.y - q.co * 0.8); c.lineTo(x, y); c.stroke(); c.setLineDash([]);
      rr(c, x - C.O / 2 + 1, y - C.OH / 2 + 1, C.O - 2, C.OH - 2, 4); c.lineWidth = 2; c.stroke(); c.restore();
    }
  }
  // BIỂU TƯỢNG TRẠNG THÁI nhỏ (5px) cạnh thanh máu quái: lửa / băng / độc (số tầng) / hack / truy nã / choáng
  const ICON_MAU = { chay: '#ff8a3a', bang: '#7fe9ff', doc: '#b4ff2a', hack: '#00ffa3', na: '#ffd84a', choang: '#fff2a0' };
  function veIcon(c, k, x, y, n) {
    c.save(); c.fillStyle = ICON_MAU[k]; c.strokeStyle = 'rgba(2,4,12,0.9)'; c.lineWidth = 1.2; c.beginPath();
    if (k === 'chay') { c.moveTo(x, y - 3); c.quadraticCurveTo(x + 3, y, x + 1.8, y + 2.5); c.lineTo(x - 1.8, y + 2.5); c.quadraticCurveTo(x - 3, y, x, y - 3); }
    else if (k === 'bang') { c.moveTo(x, y - 3); c.lineTo(x + 2.5, y); c.lineTo(x, y + 3); c.lineTo(x - 2.5, y); c.closePath(); }
    else if (k === 'doc') { c.moveTo(x, y - 3); c.quadraticCurveTo(x + 3, y + 0.5, x, y + 2.8); c.quadraticCurveTo(x - 3, y + 0.5, x, y - 3); }
    else if (k === 'hack') { c.rect(x - 2.4, y - 2.4, 4.8, 4.8); }
    else if (k === 'na') { c.arc(x, y, 2.6, 0, 7); }
    else { for (let i = 0; i < 8; i++) { const g = i * Math.PI / 4, r = i % 2 ? 1 : 2.8; c.lineTo(x + Math.cos(g) * r, y + Math.sin(g) * r); } c.closePath(); }
    c.stroke(); c.fill();
    if (n > 1) { c.font = '700 5px Orbitron, sans-serif'; c.textAlign = 'center'; c.lineWidth = 1.6; c.strokeText(n, x + 2.5, y + 5.5); c.fillStyle = '#fff'; c.fillText(n, x + 2.5, y + 5.5); }
    c.restore();
  }
  // ---------- đạn ----------
  // ĐẠN GỌN như DCDW: ảnh proj_<id>.png khung 1–2 (nhỏ nhất), dài ~12px (10–14), xoay theo hướng bay, không trail / hạt.
  // Không có ảnh: vạch ngắn màu hệ (đạn mặc định theo hệ).
  const DO_PROJ = new Map();
  function doProj(im, f) {   // hộp phần hình (alpha > 8) của khung f (khung rộng = rộng/4, cao = cao ảnh)
    const key = im.src + '#' + f; let d = DO_PROJ.get(key); if (d) return d;
    const fw = Math.floor(im.width / 4), fh = im.height; d = { fw, fh, x0: 0, x1: fw - 1, y0: 0, y1: fh - 1 };
    try {
      const cv = document.createElement('canvas'); cv.width = fw; cv.height = fh; const g = cv.getContext('2d'); g.drawImage(im, f * fw, 0, fw, fh, 0, 0, fw, fh);
      const px = g.getImageData(0, 0, fw, fh).data; let x0 = fw, x1 = -1, y0 = fh, y1 = -1;
      for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) if (px[(y * fw + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 >= 0) d = { fw, fh, x0, x1, y0, y1 };
    } catch (e) { /* ảnh khác nguồn: dùng cả khung */ }
    DO_PROJ.set(key, d); return d;
  }
  function veDan(c, d, tg) {
    if (d.cung) {   // LỰU ĐẠN PULSE (TẠM, vẽ code): bóng trên sàn + quả cam bay vòng cung
      c.save(); c.globalAlpha = 0.35; c.fillStyle = '#000'; c.beginPath(); c.ellipse(d.gx, d.gy, 3, 1.3, 0, 0, 7); c.fill();
      c.globalAlpha = 1; veGlow(c, '#ff8a2a', d.x, d.y, 7, 0.6);
      c.fillStyle = '#ff8a2a'; c.strokeStyle = '#3a1206'; c.lineWidth = 1; c.beginPath(); c.arc(d.x, d.y, 2.6, 0, 7); c.fill(); c.stroke();
      c.fillStyle = '#ffe2b0'; c.fillRect(d.x - 0.8, d.y - 2.2, 1.4, 1.4); c.restore(); return;
    }
    const g = d.goc != null ? d.goc : Math.atan2(d.q.y - d.y, d.q.x - d.x), im = co('v3proj:' + d.id), dai = 12;
    const b9 = co(`fx9:${d.id}:bay`);
    if (b9) {   // bộ v9: sheet đạn bay 6 khung (vẽ hướng PHẢI) xoay theo góc bay, tâm tại viên đạn, cỡ FX9.bay px
      const fh = b9.height, f = Math.floor((tg - (d.t0 == null ? (d.t0 = tg) : d.t0)) / 0.06) % Math.max(1, Math.round(b9.width / fh)), z = FX9.bay;
      c.save(); c.globalCompositeOperation = 'lighter'; c.translate(d.x, d.y); c.rotate(g); c.drawImage(b9, f * fh, 0, fh, fh, -z / 2, -z / 2, z, z); c.restore(); return;
    }
    if (im) {
      const f = Math.floor((tg - (d.t0 == null ? (d.t0 = tg) : d.t0)) / 0.06) % 2, k = doProj(im, f);   // khung 1 ↔ 2
      const s = dai / (k.x1 - k.x0 + 1), cyK = (k.y0 + k.y1 + 1) / 2;
      c.save(); c.translate(d.x, d.y); c.rotate(g);
      c.drawImage(im, f * k.fw + k.x0, 0, k.x1 - k.x0 + 1, k.fh, -dai, -cyK * s, dai, k.fh * s);   // đầu đạn tại (d.x, d.y)
      c.restore(); return;
    }
    const x1 = d.x - Math.cos(g) * 9, y1 = d.y - Math.sin(g) * 9;
    c.save(); c.lineCap = 'round'; c.strokeStyle = d.mau; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x1, y1); c.lineTo(d.x, d.y); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 1; c.beginPath(); c.moveTo((x1 + d.x) / 2, (y1 + d.y) / 2); c.lineTo(d.x, d.y); c.stroke(); c.restore();
  }
  // ---------- hiệu ứng ----------
  const DA_THAY = new WeakSet();
  function sinhHat(S) {
    for (const f of S.fx) {
      if (DA_THAY.has(f)) continue; DA_THAY.add(f);
      const o = f.i != null ? G.oTam(S, f.i) : [f.x, f.y];
      if (f.k === 'no') no(o[0], o[1], '#ffc890', 8, 100, 2, 0.45);
      else if (f.k === 'gop' && !f.an) { no(o[0], o[1], '#ffffff', 12, 120, 1.8, 0.5); no(o[0], o[1], HANG_MAU[f.sao - 1], 10, 90, 2, 0.6); }
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
    }
  }
  // loại hiệu ứng trúng đòn theo tướng (P0.4)
  const LOAI_HIT = {}; for (const id of TUONG_IDS) LOAI_HIT[id] = TUONG[id].hit || 'kinetic';   // dữ liệu: TUONG[id].hit
  function veSheetFx(c, im, k, x, y, sz) { const fh = im.height, n = soKhung(im), f = Math.min(n - 1, Math.floor(k * n)); c.drawImage(im, f * fh, 0, fh, fh, x - sz / 2, y - sz / 2, sz, sz); }
  function veFx(c, S, f) {
    const k = f.t / f.T, o = f.i != null ? G.oTam(S, f.i) : [f.x, f.y], a = Math.max(0, 1 - k);
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a;
    if (f.k === 'trieu') {
      const im = co('v2:vfx_summon');
      if (co('v3:vfx_summon')) { /* cổng sáng v3 vẽ dưới chân tướng trong veUnit (veCong) */ }
      else if (im) { c.globalAlpha = 1; veSheetFx(c, im, k, o[0], o[1] + 6, 56); }
      else { c.fillStyle = lg(c, 0, o[1] - 50, 0, o[1] + 20, [[0, 'rgba(60,231,255,0)'], [0.7, 'rgba(60,231,255,0.6)'], [1, 'rgba(255,255,255,0.85)']]);
        const w = 28 * (1 - k * 0.7); c.fillRect(o[0] - w / 2, o[1] - 50, w, 70);
        c.strokeStyle = '#3ce7ff'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(o[0], o[1] + 17, 7 + 16 * k, 2.5 + 5 * k, 0, 0, 7); c.stroke(); }
    } else if (f.k === 'gop' && f.an) { /* WARP GATE: 2 tướng cũ chỉ thu vào rồi biến mất */
    } else if (f.k === 'gop') {
      const im3 = co('v3:vfx_merge'), im = co('v2:vfx_merge'), kg = f.t / C.GOP_T;   // phản hồi merge 240ms (180–260ms)
      if (im3) { if (kg < 1) { c.globalAlpha = 1; veSheetFx(c, im3, kg, o[0], o[1] - 2, 54); } }
      else if (im) { c.globalAlpha = 1; veSheetFx(c, im, k, o[0], o[1], 64); }
      else { c.strokeStyle = '#ffffff'; c.lineWidth = 2 * a + 1; c.beginPath(); c.arc(o[0], o[1], 5 + 30 * k, 0, 7); c.stroke();
        c.strokeStyle = HANG_MAU[f.sao - 1]; c.lineWidth = 1.5; c.beginPath(); c.arc(o[0], o[1], 3 + 20 * k, 0, 7); c.stroke();
        veGlow(c, '#ffffff', o[0], o[1], 26 * (1 - k) + 4, a); }
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = a; c.font = '900 9px Orbitron, "Segoe UI", sans-serif'; c.textAlign = 'center';
      c.lineWidth = 2.5; c.strokeStyle = 'rgba(0,0,0,0.8)'; c.strokeText('RANK ' + f.sao, o[0], o[1] - 26 - k * 8); c.fillStyle = '#ffffff'; c.fillText('RANK ' + f.sao, o[0], o[1] - 26 - k * 8);
    } else if (f.k === 'bac') {
      c.strokeStyle = '#3cffb0'; c.lineWidth = 1.5;
      for (let n = 0; n < 2; n++) { const yy = o[1] + 8 - k * 24 - n * 6; c.beginPath(); c.moveTo(o[0] - 6, yy + 4); c.lineTo(o[0], yy - 1); c.lineTo(o[0] + 6, yy + 4); c.stroke(); }
    } else if (f.k === 'noLan') {   // NỔ LAN PULSE (TẠM): vòng tròn cam lan tới bán kính nổ
      c.globalAlpha = 1; veGlow(c, '#ff8a2a', o[0], o[1], f.r * (1.1 - 0.5 * k), 0.7 * a);
      c.fillStyle = `rgba(255,140,50,${0.28 * a})`; c.beginPath(); c.ellipse(o[0], o[1], f.r * (0.4 + 0.6 * k), f.r * (0.4 + 0.6 * k) * 0.7, 0, 0, 7); c.fill();
      c.strokeStyle = `rgba(255,200,120,${a})`; c.lineWidth = 2 * a + 0.5; c.beginPath(); c.ellipse(o[0], o[1], f.r * (0.4 + 0.6 * k), f.r * (0.4 + 0.6 * k) * 0.7, 0, 0, 7); c.stroke();
    } else if (f.k === 'neoSong') {   // ANCHOR (TẠM): vòng sóng xanh lục lan từ cột neo ra 4 ô kề
      const e = f.t - (f.tre || 0); if (e < 0) { c.restore(); return; }
      const kk = Math.min(1, e / (f.T - (f.tre || 0))), aa = 1 - kk, R = C.BUOC_X * (0.3 + 0.9 * kk);
      c.globalAlpha = 1; c.strokeStyle = `rgba(0,255,163,${0.9 * aa})`; c.lineWidth = 2.2 * aa + 0.6;
      c.beginPath(); c.ellipse(o[0], o[1] + 6, R, R * 0.72, 0, 0, 7); c.stroke();
      for (const j of G.ke(f.i)) { const [x1, y1] = G.oTam(S, j); c.strokeStyle = `rgba(0,255,163,${0.55 * aa})`; c.lineWidth = 1.4; rr(c, x1 - C.O / 2 + 2, y1 - C.OH / 2 + 2, C.O - 4, C.OH - 4, 4); c.stroke(); }
      veGlow(c, '#00ffa3', o[0], o[1], 14 * aa + 4, 0.5 * aa);
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
    } else if (f.k === 'hit' && co('v3fx:' + (LOAI_HIT[f.id] || 'kinetic'))) {   // tia trúng đòn v3 theo loại sát thương, 120ms
      const im = co('v3fx:' + (LOAI_HIT[f.id] || 'kinetic'));
      c.globalAlpha = 1; veSheetFx(c, im, k, o[0], o[1], f.to ? C.HIT_PX + 4 : C.HIT_PX);   // 120ms, đỉnh ~12px
      if (TUONG[f.id] && TUONG[f.id].hit === 'kinetic' && f.mau) veGlow(c, f.mau, o[0], o[1], 8, a * 0.5);   // tia kinetic phủ nhẹ màu hệ
    } else if (f.k === 'hit') {
      const r0 = (f.to ? 9 : 6) * (0.4 + k); c.strokeStyle = f.to ? '#ffb31a' : '#ffffff'; c.lineWidth = 1.2;
      for (let n = 0; n < 4; n++) { const g = n * 1.571 + 0.4; c.beginPath(); c.moveTo(o[0] + Math.cos(g) * r0 * 0.4, o[1] + Math.sin(g) * r0 * 0.4); c.lineTo(o[0] + Math.cos(g) * r0, o[1] + Math.sin(g) * r0); c.stroke(); }
      veGlow(c, f.mau, o[0], o[1], r0, a);
    } else if (f.k === 'chem') {
      c.lineCap = 'round'; c.strokeStyle = f.mau; c.lineWidth = 3 * a + 1; c.beginPath(); c.arc(o[0] - 4, o[1] + 3, 11, -1.2 + k, 0.4 + k); c.stroke(); c.strokeStyle = '#ffffff'; c.lineWidth = 1; c.stroke();
    } else if (f.k === 'rail') {   // tia tức thời: từ nòng DỪNG Ở MỤC TIÊU (không bay khỏi màn); quái bị xuyên chỉ chớp nhỏ
      c.lineCap = 'round'; c.strokeStyle = f.mau; c.lineWidth = (f.focus ? 3.2 : 2) * a; c.beginPath(); c.moveTo(f.x0, f.y0); c.lineTo(f.x1, f.y1); c.stroke();
      c.strokeStyle = '#ffffff'; c.lineWidth = 0.9 * a; c.stroke();
      for (const [px, py] of f.sau || []) veGlow(c, f.mau, px, py, 6, a);
    } else if (f.k === 'vo') {
      c.strokeStyle = '#5ee7ff'; c.lineWidth = 1.5; c.beginPath(); c.arc(o[0], o[1], f.r * (0.4 + k), 0, 7); c.stroke();
      c.fillStyle = '#dffaff'; for (let n = 0; n < 8; n++) { const g = n * 0.785, rr2 = f.r * (0.3 + k * 0.9), px = o[0] + Math.cos(g) * rr2, py = o[1] + Math.sin(g) * rr2; c.beginPath(); c.moveTo(px, py - 2); c.lineTo(px + 2, py + 1.5); c.lineTo(px - 2, py + 1.5); c.fill(); }
    } else if (f.k === 'plasma' || f.k === 'nhiet') {
      c.strokeStyle = f.k === 'nhiet' ? '#fff0d0' : '#ff6a2a'; c.lineWidth = 2; c.beginPath(); c.arc(o[0], o[1], (f.r || 15) * (0.3 + k), 0, 7); c.stroke(); veGlow(c, '#ff6a2a', o[0], o[1], (f.r || 15) * (1 - k * 0.5), a);
    } else if (f.k === 'dap') {   // PATCHWORK đập búa: vòng sóng dẹt nở ra trên sàn + vài hạt bụi
      const e = 1 - (1 - k) * (1 - k), R = f.r * (0.35 + 0.65 * e);
      c.strokeStyle = f.mau; c.lineWidth = f.nho ? 1.2 : 2; c.beginPath(); c.ellipse(o[0], o[1], R, R * 0.38, 0, 0, 7); c.stroke();
      if (!f.nho) { c.globalAlpha = a * 0.5; c.strokeStyle = '#ffffff'; c.lineWidth = 1; c.beginPath(); c.ellipse(o[0], o[1], R * 0.7, R * 0.27, 0, 0, 7); c.stroke(); }
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = a * 0.8; c.fillStyle = '#d9b48a';
      for (let n = 0; n < 6; n++) { const g = Math.PI + n * Math.PI / 5, rr2 = R * 0.9; c.fillRect(Math.round(o[0] + Math.cos(g) * rr2), Math.round(o[1] + Math.sin(g) * rr2 * 0.38 - 4 * e * (1 - e) * 4), 1.5, 1.5); }
    } else if (f.k === 'emp') {
      c.strokeStyle = '#00ffa3'; c.lineWidth = 1.5; c.beginPath(); c.arc(o[0], o[1], f.r * (0.3 + k), 0, 7); c.stroke();
    } else if (f.k === 'lan') {
      c.strokeStyle = '#b4ff2a'; c.lineWidth = 1.2; for (const [px, py] of f.pts) { c.beginPath(); c.moveTo(o[0], o[1]); c.quadraticCurveTo((o[0] + px) / 2 + 12, (o[1] + py) / 2, o[0] + (px - o[0]) * Math.min(1, k * 1.6), o[1] + (py - o[1]) * Math.min(1, k * 1.6)); c.stroke(); }
    } else if (f.k === 'boom') {
      c.strokeStyle = '#a35cff'; c.lineWidth = 2; c.beginPath(); c.arc(o[0], o[1], f.r * (1 - k), 0, 7); c.stroke(); veGlow(c, '#a35cff', o[0], o[1], f.r * 0.6, a);
    } else if (f.k === 'xung') {
      c.strokeStyle = '#ffb31a'; c.lineWidth = 2; c.beginPath(); c.arc(o[0], o[1], 8 + 60 * k, 0, 7); c.stroke();
    } else if (f.k === 'ky') {   // skill VÀNG/ĐỎ kích hoạt: chớp vòng ngắn màu bậc + chữ tên skill 0.6s (tiết chế)
      const v = S.o[f.i], b = BAC[(v && TUONG[v.id].bac) || 'vang'], [x, y] = G.oXY(S, f.i), cx = x + C.O / 2, chan = y + C.OH - C.CHAN;
      if (k < 0.4) { c.globalAlpha = 1 - k / 0.4; c.strokeStyle = b.mau; c.lineWidth = 1.6; c.beginPath(); c.ellipse(cx, chan, 12 + 14 * k, (12 + 14 * k) * 0.32, 0, 0, 7); c.stroke(); }
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = Math.min(1, (1 - k) * 3); c.font = '900 7px Orbitron, "Segoe UI", sans-serif'; c.textAlign = 'center';
      const ty = y - 4 - 6 * k; c.lineWidth = 2.5; c.strokeStyle = 'rgba(0,0,0,0.85)'; c.strokeText(f.ten, cx, ty); c.fillStyle = b.mau; c.fillText(f.ten, cx, ty);
    } else if (f.k === 'af' || f.k === 'chan') {   // Archfiend kích hoạt / FIREWALL chặn chiêu trùm: viền bàn chớp + tên 0.6s
      const B = S.B, m = f.k === 'af' ? f.mau : '#3ce7ff';
      c.strokeStyle = m; c.lineWidth = 2; rr(c, B.BX - 2 * k, B.BY - 2 * k, C.BAN_W + 4 * k, C.BAN_H + 4 * k, 6); c.stroke();
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = Math.min(1, (1 - k) * 3); c.font = '900 11px Orbitron, "Segoe UI", sans-serif'; c.textAlign = 'center';
      const tx = f.k === 'af' ? f.ten : 'BLOCKED', cx = B.BX + C.BAN_W / 2, cy = B.BY + C.BAN_H / 2 - 6 * k;
      c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.85)'; c.strokeText(tx, cx, cy); c.fillStyle = m; c.fillText(tx, cx, cy);
    } else if (f.k === 'kn') {
      c.strokeStyle = f.mau; c.lineWidth = 2; c.beginPath(); c.arc(o[0], o[1], 7 + 40 * k, 0, 7); c.stroke();
    } else if ((f.k === 'nong' || f.k === 'trung9') && f.id && co(`fx9:${f.id}:${f.k === 'nong' ? 'phat' : 'trung'}`)) {   // bộ v9: chớp tại tay / nổ khi trúng (6 khung)
      const im = co(`fx9:${f.id}:${f.k === 'nong' ? 'phat' : 'trung'}`), fh = im.height, n = Math.max(1, Math.round(im.width / fh)), fr = Math.min(n - 1, Math.floor(k * n)), z = f.k === 'nong' ? FX9.phat : FX9.trung;
      c.globalCompositeOperation = 'lighter'; c.globalAlpha = 1; c.drawImage(im, fr * fh, 0, fh, fh, f.x - z / 2, f.y - z / 2, z, z);
    } else if (f.k === 'trung9') {
    } else if (f.k === 'kn9' && co(`fx9:${f.id}:kn`)) {   // bộ DC: hiệu ứng kỹ năng fx_<id>_kn (6 khung): chan = đáy ảnh tại chân quái (cột lửa) · quat = hình quạt xoay theo goc (đỉnh quạt tại tướng)
      const im = co(`fx9:${f.id}:kn`), fh = im.height, n = Math.max(1, Math.round(im.width / fh)), fr = Math.min(n - 1, Math.floor(k * n));
      c.globalAlpha = 1;
      if (f.quat) { const z = Math.min(f.quat * 1.15, C.TUONG_CAO * 1.8); /* quạt băng tối đa ~1,8× chiều cao tướng */ c.translate(f.x, f.y); c.rotate(f.goc + Math.PI / 2); c.drawImage(im, fr * fh, 0, fh, fh, -z / 2, -z * 0.8, z, z); }
      else if (f.chan) { const z = FX9.kn; c.drawImage(im, fr * fh, 0, fh, fh, f.x - z / 2, f.y - z * 0.86, z, z); }
      else { const z = FX9.kn; c.drawImage(im, fr * fh, 0, fh, fh, f.x - z / 2, f.y - z / 2, z, z); }
    } else if (f.k === 'kn9') {
    } else if (f.k === 'nong') {   // CHỚP ĐẦU NÒNG 60–80ms: lõi trắng + quầng màu hệ + 2 tia ngắn theo hướng bắn
      const r = 5 * (1 - k * 0.5); veGlow(c, f.mau, f.x, f.y, r * 2.2, a); c.fillStyle = '#ffffff'; c.globalAlpha = a; c.beginPath(); c.arc(f.x, f.y, r * 0.55, 0, 7); c.fill();
      c.strokeStyle = f.mau; c.lineWidth = 1.4; c.lineCap = 'round';
      for (const lch of [-0.45, 0.45]) { c.beginPath(); c.moveTo(f.x, f.y); c.lineTo(f.x + Math.cos(f.goc + lch) * r * 1.8, f.y + Math.sin(f.goc + lch) * r * 1.8); c.stroke(); }
      c.beginPath(); c.moveTo(f.x, f.y); c.lineTo(f.x + Math.cos(f.goc) * r * 2.4, f.y + Math.sin(f.goc) * r * 2.4); c.stroke();
    } else if (f.k === 'phan') {   // MANTIS phản / kén vỡ: lục giác nở + vỡ
      c.strokeStyle = f.mau || '#bcd4ff'; c.lineWidth = 2; hexP(c, o[0], o[1], f.r * (1 + 0.6 * k), k * 2); c.stroke();
    } else if (f.k === 'chonO') {  // ô được kỹ năng chủ động chọn: viền ô chớp
      const [x, y] = G.oXY(S, f.i); c.strokeStyle = f.mau; c.lineWidth = 2.5; rr(c, x - 2 * k, y - 2 * k, C.O + 4 * k, C.OH + 4 * k, 5); c.stroke();
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
    else if (te.k === 'khienTruoc') { c.strokeStyle = '#ff5a3c'; c.lineWidth = 2.5; c.setLineDash([4, 3]); c.beginPath(); c.ellipse(b.x, b.y - b.co / 2 + b.co * 0.25, b.co * 0.62, b.co * 0.42, 0, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); }
    else if (te.k === 'ken') { c.strokeStyle = '#c04dff'; c.lineWidth = 2; c.beginPath(); c.arc(b.x, b.y - b.co / 2, b.co * (0.9 - 0.3 * te.t / te.T), 0, 7); c.stroke(); }
    else if (te.k === 'surge' || te.k === 'split' || te.k === 'tangToc') { c.strokeStyle = '#ffb31a'; c.lineWidth = 2; c.beginPath(); c.arc(b.x, b.y - b.co / 2, b.co * 0.7 + 10 * (te.t / te.T), 0, 7); c.stroke(); }
    else if (te.k === 'link') { c.strokeStyle = '#ff2bd6'; c.lineWidth = 1.2; for (const q of te.ds) { c.beginPath(); c.moveTo(b.x, b.y - b.co / 2); c.lineTo(q.x, q.y - q.co / 2); c.stroke(); } }
    c.restore();
    // thanh đếm ngược + tên chiêu cạnh boss (bên phải làn, không đè ô)
    const bw = 40, bx = Math.min(W - bw - 4, Math.max(4, b.x + b.co * 0.5)), by = Math.max(C.TOP_H + 12, b.y - b.co - 4), kk = te.t / te.T;
    c.fillStyle = 'rgba(4,4,14,0.85)'; c.fillRect(bx - 1, by - 1, bw + 2, 4); c.fillStyle = m; c.fillRect(bx, by, bw * (1 - kk), 2);
    c.font = '700 6.5px Orbitron, "Segoe UI", sans-serif'; c.textAlign = 'left'; c.lineWidth = 2.5; c.strokeStyle = 'rgba(0,0,0,0.85)';
    c.strokeText('⚠ ' + te.ten, bx, by - 3); c.fillStyle = '#ffffff'; c.fillText('⚠ ' + te.ten, bx, by - 3);
  }
  // số sát thương nổi: sống 0.55s (0.45–0.65), bay lên 12px (8–14) chậm dần, mờ ở 35% cuối; chí mạng màu hổ phách
  function veSo(c, s) {
    const T = s.T || 0.8, k = Math.min(1, s.t / T), y = s.y - 6 - 12 * (1 - (1 - k) * (1 - k));
    c.save(); c.globalAlpha = Math.max(0, Math.min(1, (T - s.t) / (T * 0.35)));
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
    const m = S.ai ? '#3ce7ff' : '#ff2bd6', w = c.measureText(ten).width, x0 = C.BAN_X + 2;
    c.lineWidth = 2.5; c.strokeStyle = 'rgba(0,0,0,0.8)'; c.strokeText(ten, x0, y + 9); c.fillStyle = m; c.fillText(ten, x0, y + 9);
    if (S.af && S.af.T > 0) { const a = ARCHFIEND[S.af.id]; c.font = '700 7px Orbitron, "Segoe UI", sans-serif'; const tx = a.ten + ' ' + Math.ceil(S.af.T); c.strokeText(tx, x0 + w + (S.coop ? 8 : 48), y + 9); c.fillStyle = a.mau; c.fillText(tx, x0 + w + (S.coop ? 8 : 48), y + 9); }
    if (!S.coop) for (let i = 0; i < C.MANG; i++) { c.fillStyle = i < S.mang ? m : 'rgba(255,60,60,0.35)'; c.beginPath(); const x = x0 + 6 + w + i * 12; c.moveTo(x + 2, y + 2); c.lineTo(x + 11, y + 2); c.lineTo(x + 9, y + 9); c.lineTo(x, y + 9); c.closePath(); c.fill(); }
    if (S.boss) {
      const b = S.boss, bw = 110, bx = C.BAN_X + C.BAN_W - bw, kk = Math.max(0, b.hp / b.max);
      c.fillStyle = 'rgba(4,4,14,0.85)'; c.fillRect(bx - 1, y + 3, bw + 2, 6); c.fillStyle = b.boss.mau; c.fillRect(bx, y + 4, bw * kk, 4);
      c.font = '700 6.5px Orbitron, "Segoe UI", sans-serif'; c.textAlign = 'right'; c.fillStyle = '#ffffff'; c.strokeText(b.boss.ten, bx - 4, y + 9); c.fillText(b.boss.ten, bx - 4, y + 9);
    }
  }
  function veBan(c, S, t, keo) {   // 1 bàn: vùng → tướng → quái → đạn → fx → nhãn sao → số
    const tg = S.t;
    sinhHat(S);
    for (const z of S.vung) veVung(c, S, z, t);
    const goi = keo ? S.o[keo.i] : null;
    for (let i = 0; i < S.o.length; i++) {
      const v = S.o[i]; if (!v) continue;
      if (keo && keo.i === i) { c.save(); c.globalAlpha = 0.3; veUnit(c, S, v, i, tg, t); c.restore(); continue; }
      veUnit(c, S, v, i, tg, t, goi && G.gopDuoc(S, keo.i, i));
    }
    veDayKe(c, S, t);
    if (goi) veKeoO(c, S, keo, t);
    for (const f of S.fx) if (f.k === 'gop') veGopCu(c, S, f, tg);
    const qs = S.coop && S.ai ? [] : S.quai.slice().sort((a, b) => a.y - b.y);   // co-op: mảng quái chung → chỉ vẽ 1 lần (ở bàn người chơi, vẽ sau)
    for (const q of qs) veQuai(c, q, t, tg);
    for (const d of S.dan) veDan(c, d, tg);
    for (const f of S.fx) veFx(c, S, f);
    veCanhBao(c, S, t);
    if (G.afBat(S, 'tuongLua')) { const a = ARCHFIEND[S.af.id]; c.save(); c.globalAlpha = 0.5 + 0.2 * Math.sin(t * 6); c.strokeStyle = a.mau; c.lineWidth = 1.5; rr(c, S.B.BX + 1, S.B.BY + 1, C.BAN_W - 2, C.BAN_H - 2, 5); c.stroke(); c.restore(); }   // FIREWALL đang bật
    for (let i = 0; i < S.o.length; i++) if (S.o[i] && !(keo && keo.i === i)) veNhanO(c, S, S.o[i], i, t);
    veDayKhoa(c, S, t);
  }
  // KÉO THẢ: ô nguồn viền CAM · ô ghép được (cùng loại cùng sao) viền XANH-VÀNG sáng · ô trống hợp lệ viền cyan nhạt · ô không hợp lệ đỏ mờ
  function veKeoO(c, S, keo, t) {
    const nh = 0.6 + 0.4 * Math.sin(t * 10), goi = S.o[keo.i], can = goi && G.laCanChien(goi.id);
    if (can) for (let j = 0; j < S.o.length; j++) {   // CẬN CHIẾN đang được kéo/giữ: tô sáng các ô SÁT ĐƯỜNG nó đánh được (vàng cam) + biểu tượng kiếm
      if (!G.oCanChien(S, j)) continue;
      const [x, y] = G.oXY(S, j);
      c.save(); rr(c, x + 3, y + 3, C.O - 6, C.OH - 6, 4);
      c.fillStyle = `rgba(255,190,60,${0.10 + 0.06 * nh})`; c.fill(); c.lineWidth = 1.6; c.setLineDash([4, 3]); c.strokeStyle = `rgba(255,200,80,${0.55 + 0.3 * nh})`; c.stroke();
      c.setLineDash([]); veKiem(c, x + C.O - 9, y + 9, '#ffd27a'); c.restore();
    }
    for (let j = 0; j < S.o.length; j++) {
      const [x, y] = G.oXY(S, j), tren = keo.x >= x && keo.x < x + C.O && keo.y >= y && keo.y < y + C.OH;
      c.save(); rr(c, x + 1, y + 1, C.O - 2, C.OH - 2, 4);
      if (j === keo.i) { c.lineWidth = 2.5; c.strokeStyle = '#ff9a2a'; c.stroke(); }
      else if (G.gopDuoc(S, keo.i, j)) { c.fillStyle = `rgba(150,255,90,${tren ? 0.3 : 0.18})`; c.fill(); c.lineWidth = tren ? 3 : 2.4; c.strokeStyle = `rgba(170,255,80,${nh})`; c.stroke(); c.lineWidth = 1; c.strokeStyle = '#fff59a'; c.stroke(); }
      else if (!S.o[j]) { c.fillStyle = `rgba(60,231,255,${tren ? 0.22 : 0.08})`; c.fill(); c.lineWidth = tren ? 2 : 1.2; c.strokeStyle = `rgba(60,231,255,${tren ? 0.95 : 0.5})`; c.stroke(); }
      else { c.fillStyle = `rgba(255,40,60,${tren ? 0.24 : 0.14})`; c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(255,70,80,0.45)'; c.stroke(); }
      c.restore();
    }
  }
  // HỖ TRỢ 4 Ô KỀ: đường nối MỜ từ tướng hỗ trợ (TUONG[id].keBuff) tới các ô kề đang có tướng được buff
  const MAU_KE = { tocDanh: '#ffd84a', chiMang: '#ff5a7a', satThuong: '#ff9a2a', lamCham: '#5ee7ff' };
  function veDayKe(c, S, t) {
    let co = false;
    for (let i = 0; i < S.o.length; i++) {
      const v = S.o[i], kb = v && TUONG[v.id].keBuff; if (!kb || v.khoaT > 0) continue;
      const [x0, y0] = G.oTam(S, i), m = MAU_KE[kb.k] || '#ffffff';
      for (const j of G.ke(i)) {
        if (!S.o[j]) continue;
        if (!co) { c.save(); co = true; }
        const [x1, y1] = G.oTam(S, j);
        c.globalAlpha = 0.22 + 0.1 * Math.sin(t * 3 + i); c.strokeStyle = m; c.lineWidth = 2; c.setLineDash([3, 3]); c.lineDashOffset = -t * 12;
        c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
        c.globalAlpha = 0.45; c.fillStyle = m; c.beginPath(); c.arc(x1 + (x0 - x1) * 0.25, y1 + (y0 - y1) * 0.25, 2, 0, 7); c.fill();
      }
    }
    if (co) c.restore();
  }
  function veSoBan(c, S) { for (const s of S.so) veSo(c, s); }
  // ================= KỸ NĂNG CHỦ ĐỘNG (VÀNG) + PACKET SWAP — giao diện trên canvas; ui.js dò chạm bằng các hộp trả về =================
  // menu: chạm 1 tướng VÀNG → hàng nút kỹ năng ngay trên ô (tên + hồi chiêu). Chọn nút sẵn sàng → chế độ chọn ô (ô hợp lệ viền vàng nhịp sáng).
  function hopChu(S, i) {
    const ds = G.chuDong(S, i); if (!ds.length) return [];
    const [x, y] = G.oXY(S, i), w = 62, h = 18, gap = 3, tong = ds.length * w + (ds.length - 1) * gap;
    let x0 = Math.max(4, Math.min(W - 4 - tong, x + C.O / 2 - tong / 2)); const y0 = Math.max(C.TOP_H + 2, y - h - 4);
    return ds.map((m) => { const r = { k: m.cf.k, ten: m.cf.ten, san: m.san, cd: m.cd, x: x0, y: y0, w, h }; x0 += w + gap; return r; });
  }
  function hopChonGop(S) {   // PACKET SWAP: 2 chân dung + REROLL (nếu có) phía trên ô ghép
    const cg = S.chonGop; if (!cg) return [];
    const [x, y] = G.oXY(S, cg.i), sz = 34, gap = 4, n = cg.reroll ? 3 : 2, tong = n * sz + (n - 1) * gap;
    let x0 = Math.max(4, Math.min(W - 4 - tong, x + C.O / 2 - tong / 2)); const y0 = Math.max(C.TOP_H + 14, y - sz - 6);
    const ds = cg.ds.map((id, n2) => { const r = { n: n2, id, x: x0, y: y0, w: sz, h: sz }; x0 += sz + gap; return r; });
    if (cg.reroll) ds.push({ n: 'reroll', x: x0, y: y0, w: sz, h: sz });
    return ds;
  }
  function veGiaoDien(c, S, ui, t) {
    if (!ui) return;
    if (ui.chon) {   // chế độ chọn ô
      const ok = new Set(ui.chon.ds);
      for (let j = 0; j < S.o.length; j++) {
        const [x, y] = G.oXY(S, j);
        if (j === ui.chon.i) { rr(c, x, y, C.O, C.OH, 4); c.lineWidth = 2; c.strokeStyle = '#ffffff'; c.stroke(); continue; }
        if (!ok.has(j)) { rr(c, x, y, C.O, C.OH, 3); c.fillStyle = 'rgba(0,0,10,0.5)'; c.fill(); continue; }
        c.save(); rr(c, x + 1, y + 1, C.O - 2, C.OH - 2, 4); c.lineWidth = 2.5; c.strokeStyle = `rgba(255,201,58,${0.6 + 0.4 * Math.sin(t * 9)})`; c.stroke();
        c.fillStyle = 'rgba(255,201,58,0.12)'; c.fill(); c.restore();
      }
      const tx = ui.chon.ten + ' · TAP A GLOWING HERO', B = S.B;
      c.save(); c.font = '900 8px Orbitron, "Segoe UI", sans-serif'; c.textAlign = 'center';
      const w = c.measureText(tx).width + 14, cx = B.BX + C.BAN_W / 2, cy = B.BY - 9;
      c.fillStyle = 'rgba(30,20,0,0.92)'; rr(c, cx - w / 2, cy - 7, w, 13, 6); c.fill(); c.strokeStyle = '#ffc93a'; c.lineWidth = 1; c.stroke();
      c.fillStyle = '#ffe9a0'; c.fillText(tx, cx, cy + 2.5); c.restore();
    }
    if (ui.menu != null && S.o[ui.menu]) {
      for (const r of hopChu(S, ui.menu)) {
        c.save(); rr(c, r.x, r.y, r.w, r.h, 5); c.fillStyle = r.san ? 'rgba(50,34,0,0.95)' : 'rgba(20,22,32,0.95)'; c.fill();
        c.lineWidth = 1.2; c.strokeStyle = r.san ? '#ffc93a' : '#5a6278'; c.stroke();
        c.font = '900 7px Orbitron, "Segoe UI", sans-serif'; c.textAlign = 'center'; c.fillStyle = r.san ? '#fff2b0' : '#9aa3b8';
        c.fillText(r.ten, r.x + r.w / 2, r.y + 8); c.font = '700 6.5px Orbitron, "Segoe UI", sans-serif';
        c.fillText(r.san ? 'READY' : Math.ceil(r.cd) + 's', r.x + r.w / 2, r.y + 15.5); c.restore();
      }
    }
    const hs = hopChonGop(S);
    if (hs.length) {
      const cg = S.chonGop, x0 = hs[0].x - 4, x1 = hs[hs.length - 1].x + hs[0].w + 4, y0 = hs[0].y - 12;
      c.save(); rr(c, x0, y0, x1 - x0, hs[0].h + 18, 6); c.fillStyle = 'rgba(2,18,14,0.94)'; c.fill(); c.strokeStyle = '#00ffa3'; c.lineWidth = 1.2; c.stroke();
      c.font = '900 7px Orbitron, "Segoe UI", sans-serif'; c.textAlign = 'center'; c.fillStyle = '#9dffd9'; c.fillText(cg.ten, (x0 + x1) / 2, y0 + 8);
      c.fillStyle = '#00ffa3'; c.fillRect(x0 + 3, y0 + hs[0].h + 15, (x1 - x0 - 6) * (1 - cg.t / cg.T), 1.5);
      for (const r of hs) {
        if (r.n === 'reroll') {
          rr(c, r.x, r.y, r.w, r.h, 4); c.fillStyle = '#10261e'; c.fill(); c.strokeStyle = '#00ffa3'; c.stroke();
          c.fillStyle = '#c8ffe8'; c.font = '900 6.5px Orbitron, "Segoe UI", sans-serif'; c.fillText('RE', r.x + r.w / 2, r.y + 15); c.fillText('ROLL', r.x + r.w / 2, r.y + 23); continue;
        }
        const b = BAC[TUONG[r.id].bac] || BAC.trang, cur = S.o[cg.i] && S.o[cg.i].id === r.id;
        c.save(); rr(c, r.x, r.y, r.w, r.h, 4); c.clip(); c.fillStyle = hexA(b.mau, 0.35); c.fillRect(r.x, r.y, r.w, r.h);
        const p = co('v3p:' + r.id) || co('v3p2:' + r.id); if (p) c.drawImage(p, r.x, r.y, r.w, r.h); c.restore();
        rr(c, r.x, r.y, r.w, r.h, 4); c.lineWidth = cur ? 2.2 : 1.2; c.strokeStyle = cur ? '#ffffff' : b.mau; c.stroke();
      }
      c.restore();
    }
  }

  // ---------- THANH GIỮA MỎNG (kiểu DCDW): PVP "ROUND N" + đồng hồ giây / tên trùm của round (cờ đầu hàng = nút DOM bên phải) · CO-OP: dải đèn nguy hiểm mỏng ----------
  function veThanhGiua(c, S, A, t) {
    if (S.coop) return;   // co-op: giữa 2 bàn là HÀNH LANG GIỮA (đường quái), không vẽ thanh; wave / trùm đã có ở HUD trên
    const y = C.THANH_Y, h = C.THANH_H, x0 = C.BAN_X - 2, x1 = W - 3, cy = y + h / 2;
    c.save();
    rr(c, x0, y, x1 - x0, h, 5); c.fillStyle = 'rgba(8,10,20,0.86)'; c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(150,170,210,0.35)'; c.stroke();
    const boss = S.boss || (A && A.boss), w = S.dot;
    c.textBaseline = 'middle';
    if (S.coop) {   // dải đèn đỏ mỏng chạy + chữ nhỏ ở giữa
      for (let x = x0 + 8; x < x1 - 6; x += 10) { const p = (Math.sin(t * 6 - x * 0.08) + 1) / 2; c.fillStyle = `rgba(255,${boss ? 40 : 80},${boss ? 60 : 90},${0.15 + 0.5 * p * (boss ? 1 : 0.6)})`; c.fillRect(x, y + 3, 5, 2); c.fillRect(x, y + h - 5, 5, 2); }
      const den = Math.ceil(Math.max(1, w) / 10) * 10, con = den - w;
      const tx = boss ? `⚠ ${(boss.cuoi ? 'FINAL · ' : '') + boss.boss.ten}` : con <= 0 ? 'BOSS THIS WAVE' : `BOSS IN ${con} WAVE${con > 1 ? 'S' : ''}`;
      c.font = '900 10px Orbitron, "Segoe UI", sans-serif'; c.textAlign = 'center'; c.fillStyle = boss ? '#ff6b6b' : '#ffd0d0'; c.fillText(tx, (x0 + x1) / 2, cy + 0.5);
    } else {
      c.font = '900 11px Orbitron, "Segoe UI", sans-serif'; c.textAlign = 'left'; c.fillStyle = '#ffffff'; c.fillText('ROUND ' + Math.max(1, w), x0 + 10, cy + 0.5);
      c.textAlign = 'center';
      if (boss) { c.fillStyle = boss.boss.mau; c.font = '900 11px Orbitron, "Segoe UI", sans-serif'; c.fillText(boss.boss.ten, (x0 + x1) / 2 + 6, cy + 0.5); }
      else { const sec = Math.max(0, Math.floor(S.t - (S.dotT0 || 0))); c.font = '700 11px Orbitron, "Segoe UI", sans-serif'; c.fillStyle = '#cfe8ff'; c.fillText(`${sec}s`, (x0 + x1) / 2 + 6, cy + 0.5);
        c.strokeStyle = '#cfe8ff'; c.lineWidth = 1.2; c.beginPath(); c.arc((x0 + x1) / 2 - 18, cy, 5, 0, 7); c.stroke(); c.beginPath(); c.moveTo((x0 + x1) / 2 - 18, cy); c.lineTo((x0 + x1) / 2 - 18, cy - 3); c.moveTo((x0 + x1) / 2 - 18, cy); c.lineTo((x0 + x1) / 2 - 15.5, cy + 1); c.stroke(); }
    }
    c.restore();
  }
  // ---------- CỔNG mỗi bàn: avatar Archfiend nhỏ + trái tim (PVP 3 mạng; CO-OP mạng chung) ở góc phải hành lang dưới ----------
  const AVT = new Map();
  function anhAF(id) {   // [ảnh, sx, sy, sw, sh] — archfiend_<id>.png, không thì cắt mặt từ cutin_<id>.png (ARCHFIEND[id].mat), không thì portrait tạm
    const a = ARCHFIEND[id], im = co('v3af:' + id); if (im) return [im, 0, 0, im.width, im.height];
    const ci = co('v3ci:' + id);
    if (ci) { const [fx, fy, fk] = a.mat || [0.5, 0.3, 0.5], sw = ci.width * fk; return [ci, Math.max(0, Math.min(ci.width - sw, ci.width * fx - sw / 2)), Math.max(0, Math.min(ci.height - sw, ci.height * fy - sw / 2)), sw, sw]; }
    const p = co('v3p:' + a.anh) || co('v3p2:' + a.anh); return p ? [p, 0, 0, p.width, p.height] : null;
  }
  function veTim(c, x, y, r, day) {
    c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.3, x, y - r * 0.45); c.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.closePath();
    c.fillStyle = day ? '#ff3b5c' : 'rgba(60,60,80,0.9)'; c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(0,0,0,0.85)'; c.stroke();
    if (day) { c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.arc(x - r * 0.45, y - r * 0.35, r * 0.25, 0, 7); c.fill(); }
  }
  function veCongAF(c, S, t) {
    const B = S.B; if (!B.CONG) return;
    const [x, y] = B.CONG, r = Math.min(14, C.HL_DAY / 2 - 3), a = S.af && ARCHFIEND[S.af.id], m = a ? a.mau : '#ff2bd6';
    const nh = S.fx.some((f) => f.k === 'thanh') ? 1 : 0;   // mất mạng: avatar chớp đỏ
    c.save();
    if (a && S.af.T > 0) { c.globalCompositeOperation = 'lighter'; veGlow(c, m, x, y, r * 2.2, 0.5 + 0.2 * Math.sin(t * 8)); c.globalCompositeOperation = 'source-over'; }
    c.beginPath(); c.arc(x, y, r + 1.5, 0, 7); c.fillStyle = nh ? '#ff2a40' : m; c.fill();
    c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.clip(); c.fillStyle = '#141020'; c.fillRect(x - r, y - r, 2 * r, 2 * r);
    const im = S.af && anhAF(S.af.id); if (im) c.drawImage(im[0], im[1], im[2], im[3], im[4], x - r, y - r, 2 * r, 2 * r);
    c.restore();
    if (a && S.af.T > 0) { c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r + 1.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * S.af.T / ARCHFIEND[S.af.id].T); c.stroke(); }   // vòng thời gian hiệu lực
    // tim: PVP 3 tim bên trái avatar; CO-OP: 1 tim + số mạng chung
    if (S.coop) { const ph = x - r - 26 < 0, hx = ph ? x + r + 10 : x - r - 12, tx0 = ph ? x + r + 17 : x - r - 19;   // làn dọc sát mép trái: tim + số mạng sang PHẢI avatar
      veTim(c, hx, y, 5, true); c.font = '900 10px Orbitron, "Segoe UI", sans-serif'; c.textAlign = ph ? 'left' : 'right'; c.textBaseline = 'middle'; c.lineWidth = 2.5; c.strokeStyle = 'rgba(0,0,0,0.85)'; const tx = `${S.coop.mang}`; c.strokeText(tx, tx0, y + 0.5); c.fillStyle = S.coop.mang <= 3 ? '#ff6b6b' : '#ffffff'; c.fillText(tx, tx0, y + 0.5); }
    else for (let i = 0; i < C.MANG; i++) veTim(c, x - r - 10 - (C.MANG - 1 - i) * 12, y, 4.6, i < S.mang);
    c.restore();
  }
  // ---------- "Not enough mana." nổi giữa bàn người chơi (xếp chồng) ----------
  const THIEU = [];
  function baoThieu(txt) { const now = performance.now() / 1000; THIEU.push({ txt: txt || 'Not enough mana.', t0: now }); while (THIEU.length > 4) THIEU.shift(); }
  function veThieu(c, S, t) {
    const B = S.B, cx = B.BX + C.BAN_W / 2, cy = B.BY + C.BAN_H / 2;
    for (let n = THIEU.length - 1; n >= 0; n--) if (t - THIEU[n].t0 > 1.1) THIEU.splice(n, 1);
    THIEU.forEach((m, n) => {
      const e = t - m.t0, a = Math.min(1, e * 8, (1.1 - e) * 4), y = cy - (THIEU.length - 1 - n) * 17 - e * 10;
      c.save(); c.globalAlpha = Math.max(0, a); c.font = '700 13px Rajdhani, "Segoe UI", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      const w = c.measureText(m.txt).width + 20; rr(c, cx - w / 2, y - 9, w, 18, 9); c.fillStyle = 'rgba(10,6,20,0.82)'; c.fill();
      c.fillStyle = '#ffffff'; c.fillText(m.txt, cx, y + 0.5); c.restore();
    });
  }
  // ================= CUT-IN kiểu DCDW (tranh lớn trượt vào + băng chữ + halftone/vệt sét bằng hạt code nhỏ; game KHÔNG dừng) =================
  //   'af'   : Archfiend kích hoạt — cutin_<af>.png (không có: chân dung Archfiend) + "POWER UP!" + tên kỹ năng, 0.9s
  //   'tuong': tướng VÀNG/ĐỎ xuất hiện lần đầu / tung kỹ năng — cutin_<id>.png (không có: portrait) + băng tên, 0.8s, tối đa 1 lần / 8s
  //   'trum' : trùm tung chiêu — cutin_boss_<id>.png (không có: khung đầu ảnh đi bộ phóng to) trượt ngang nền halftone đỏ, 0.8s
  //   'gioi' : màn giới thiệu trùm co-op — tối màn, trùm phóng to giữa + băng đỏ tên trùm, 1.2s
  for (const id in ARCHFIEND) nap('v3ci:' + id, `${V3}cutin_${id}.png`);
  for (const id of TUONG_IDS) { nap('v3ch:' + id, `${V3}cutin_${id}.png`); if (TEN_FILE(id) !== id) nap('v3ch2:' + id, `${V3}cutin_${TEN_FILE(id)}.png`); }
  for (const b of BOSS) nap('v3cb:' + b.id, `${V3}cutin_boss_${b.id}.png`);
  let CUT = null, cutTuongT = -99, cutTrumT = -99;
  const THAY = new WeakSet(), DA_LEN = new WeakMap();   // fx đã xét; loại VÀNG/ĐỎ đã cut-in trong trận (theo S)
  function batCut(k, o, t) {
    if (CUT && CUT.k === 'gioi' && t - CUT.t0 < CUT.T) return;   // không đè màn giới thiệu trùm
    if (CUT && t - CUT.t0 < CUT.T && k !== 'af' && k !== 'gioi') return;   // đang có cut-in: bỏ cut-in phụ
    CUT = Object.assign({ k, t0: t, T: k === 'gioi' ? 1.2 : k === 'af' ? 0.9 : 0.8 }, o);
  }
  function xetCutIn(S, A, t) {   // dò sự kiện mới trên bàn người chơi (và trùm co-op) → bật cut-in
    const seen = DA_LEN.get(S) || (DA_LEN.set(S, new Set()), DA_LEN.get(S));
    for (const f of S.fx) {
      if (THAY.has(f)) continue; THAY.add(f);
      if (f.k === 'af') batCut('af', { id: S.af.id, ten: f.ten, mau: f.mau }, t);
      else if ((f.k === 'trieu' || f.k === 'gop' || f.k === 'ky') && f.i != null && S.o[f.i]) {
        const v = S.o[f.i], b = TUONG[v.id].bac; if (b !== 'vang' && b !== 'do') continue;
        const lanDau = !seen.has(v.id); if (f.k !== 'ky' && !lanDau) continue;
        seen.add(v.id);
        if (t - cutTuongT >= 8) { cutTuongT = t; batCut('tuong', { id: v.id, ten: f.k === 'ky' ? f.ten : TUONG[v.id].ten, phu: f.k === 'ky' ? TUONG[v.id].ten : BAC[b].ten, mau: BAC[b].mau }, t); }
      } else if (f.k === 'kn' && f.tung && f.boss && t - cutTrumT >= 5) { cutTrumT = t; batCut('trum', { boss: f.boss, ten: f.ten, mau: f.boss.mau }, t); }
    }
    if (A && S.coop) for (const f of A.fx) {   // co-op: trùm trên bàn đồng đội cũng cut-in
      if (THAY.has(f)) continue; THAY.add(f);
      if (f.k === 'kn' && f.tung && f.boss && t - cutTrumT >= 5) { cutTrumT = t; batCut('trum', { boss: f.boss, ten: f.ten, mau: f.boss.mau }, t); }
    }
    const bs = S.coop ? (A && A.boss) || S.boss : null;   // co-op: trùm mới xuất hiện → màn giới thiệu
    if (bs && !DA_LEN.has(bs)) { DA_LEN.set(bs, 1); batCut('gioi', { boss: bs.boss, cuoi: bs.cuoi, w: S.dot, mau: bs.boss.mau }, t); }
  }
  const de3 = (k) => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);
  function veHalftone(c, x, y, w, h, mau, r0, lech) {   // chấm halftone to dần về 1 phía (hạt code)
    c.save(); c.fillStyle = mau;
    for (let yy = y + 4; yy < y + h; yy += 9) for (let xx = x + ((yy / 9) % 2) * 4.5; xx < x + w; xx += 9) {
      const k = lech > 0 ? (xx - x) / w : 1 - (xx - x) / w, r = r0 * (0.25 + 0.75 * k); if (r < 0.4) continue;
      c.beginPath(); c.arc(xx, yy, r, 0, 7); c.fill();
    }
    c.restore();
  }
  function veSet(c, x0, y0, x1, y1, mau, sd) {   // vệt sét gấp khúc (hạt code)
    let r = sd; const rn = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
    c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = mau; c.lineWidth = 2.2; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x0, y0);
    for (let k = 1; k <= 8; k++) c.lineTo(x0 + (x1 - x0) * k / 8 + (k < 8 ? (rn() - 0.5) * 18 : 0), y0 + (y1 - y0) * k / 8 + (k < 8 ? (rn() - 0.5) * 18 : 0));
    c.stroke(); c.strokeStyle = '#ffffff'; c.lineWidth = 0.8; c.stroke(); c.restore();
  }
  function veChuBang(c, txt, x, y, co2, mau, nghieng) {   // chữ đậm viền đen, nghiêng
    c.save(); c.translate(x, y); c.transform(1, 0, nghieng || -0.18, 1, 0, 0); c.font = `900 ${co2}px Orbitron, "Segoe UI", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineJoin = 'round'; c.lineWidth = co2 * 0.28; c.strokeStyle = '#0a0410'; c.strokeText(txt, 0, 0); c.fillStyle = mau; c.fillText(txt, 0, 0); c.restore();
  }
  function veCutIn(c, t) {
    if (!CUT) return; const e = t - CUT.t0; if (e >= CUT.T || e < 0) { if (e >= CUT.T) CUT = null; return; }
    const T = CUT.T, vao = de3(e / 0.16), ra = e > T - 0.2 ? de3((e - (T - 0.2)) / 0.2) : 0, a = vao * (1 - ra), m = CUT.mau || '#ff2bd6';
    c.save();
    if (CUT.k === 'gioi') {   // màn giới thiệu trùm co-op
      c.fillStyle = `rgba(0,0,0,${0.72 * a})`; c.fillRect(0, 0, W, H);
      const cy = H * 0.42, b = CUT.boss, ci = co('v3cb:' + b.id), sh = co('v3b:' + b.id), sz = 190 * (0.85 + 0.15 * vao) * (1 + 0.04 * e);
      c.globalAlpha = a; veGlow(c, m, W / 2, cy, sz * 0.75, 0.6);
      if (ci) { const k = sz / Math.max(ci.width, ci.height); c.drawImage(ci, W / 2 - ci.width * k / 2, cy - ci.height * k / 2, ci.width * k, ci.height * k); }
      else if (sh) { const fh = sh.height; c.drawImage(sh, 0, 0, fh, fh, W / 2 - sz / 2, cy - sz / 2, sz, sz); }
      const by = cy + sz * 0.52, bx = -W * (1 - vao) * 0.6;
      c.fillStyle = '#b8001c'; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + W + 30, by - 10); c.lineTo(bx + W + 30, by + 34); c.lineTo(bx, by + 44); c.closePath(); c.fill();
      veHalftone(c, 0, by - 8, W, 50, 'rgba(255,255,255,0.10)', 2.2, 1);
      veChuBang(c, CUT.cuoi ? 'FINAL BOSS' : `WAVE ${CUT.w}`, W / 2, by + 6, 10, '#ffd0d0', -0.1);
      veChuBang(c, b.ten, W / 2, by + 24, 24, '#ffffff', -0.15);
      c.restore(); return;
    }
    // băng chéo giữa màn
    const cy = CUT.k === 'af' ? H * 0.47 : H * 0.44, bh = CUT.k === 'af' ? 210 : CUT.k === 'trum' ? 150 : 170, nghi = 26;
    const tu = CUT.k === 'tuong' ? 1 : -1;   // tranh trượt vào từ trái (af, trùm từ phải) hay phải (tướng)
    c.globalAlpha = a;
    c.save(); c.beginPath(); c.moveTo(0, cy - bh / 2 + nghi); c.lineTo(W, cy - bh / 2 - nghi); c.lineTo(W, cy + bh / 2 - nghi); c.lineTo(0, cy + bh / 2 + nghi); c.closePath(); c.clip();
    const nen = CUT.k === 'trum' ? ['#3a0008', '#a0001a'] : ['#0c0618', hexA(m, 0.85)];
    c.fillStyle = lg(c, 0, 0, W, 0, tu > 0 ? [[0, nen[1]], [1, nen[0]]] : [[0, nen[0]], [1, nen[1]]]); c.fillRect(0, cy - bh, W, bh * 2);
    veHalftone(c, 0, cy - bh / 2 - nghi, W, bh + 2 * nghi, CUT.k === 'trum' ? 'rgba(255,60,60,0.35)' : 'rgba(255,255,255,0.13)', 3, tu > 0 ? -1 : 1);
    // vệt sáng tốc độ
    c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 1.2;
    for (let n = 0; n < 9; n++) { const yy = cy - bh / 2 + ((n * 37 + e * 900) % bh), l = 40 + (n * 23) % 70, xx = ((n * 71 + e * 1400 * -tu) % (W + 200) + W + 200) % (W + 200) - 100; c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx + l, yy - l * 0.07); c.stroke(); }
    c.restore();
    if (CUT.k === 'af') { veSet(c, -10, cy - bh / 2 + 30, W + 10, cy + 10, m, 7 + Math.floor(e * 20)); veSet(c, -10, cy + 40, W + 10, cy - bh / 2 + 10, '#ffffff', 31 + Math.floor(e * 20)); }
    // tranh
    let im = null, sx = 0, sy = 0, sw = 0, sh2 = 0;
    if (CUT.k === 'af') { const ci = co('v3ci:' + CUT.id); if (ci) { im = ci; sw = ci.width; sh2 = ci.height; } else { const x = anhAF(CUT.id); if (x) [im, sx, sy, sw, sh2] = x; } }
    else if (CUT.k === 'tuong') { const ci = co('v3ch:' + CUT.id) || co('v3ch2:' + CUT.id) || co('v3p:' + CUT.id) || co('v3p2:' + CUT.id); if (ci) { im = ci; sw = ci.width; sh2 = ci.height; }
      else if (coPx(CUT.id)) { const P = TUONG[CUT.id].px; im = co(`px:${CUT.id}:8`); sw = sh2 = P.dir8.o; const [c8, h8] = o8(P, 's'); sx = c8 * sw; sy = h8 * sw; } }   // tướng pixel: ô S phóng to (ctx không smoothing)
    else { const ci = co('v3cb:' + CUT.boss.id), b = co('v3b:' + CUT.boss.id); if (ci) { im = ci; sw = ci.width; sh2 = ci.height; } else if (b) { im = b; sw = b.height; sh2 = b.height; } }
    if (im) {
      const ih = bh * (CUT.k === 'trum' ? 1.0 : 1.15), iw = sw / sh2 * ih;
      let ix;
      if (CUT.k === 'trum') ix = W - (W + iw) * (e / T) - iw * 0.1;   // trùm: trượt ngang liên tục phải → trái
      else { const dich = tu > 0 ? W - iw - 4 : 4; ix = dich + tu * (1 - vao) * (iw + 40) + tu * ra * (iw + 60); }
      c.drawImage(im, sx, sy, sw, sh2, ix, cy - ih / 2 - (CUT.k === 'trum' ? 0 : 6), iw, ih);
    }
    c.restore();
    // băng chữ
    const tx = tu > 0 ? W * 0.32 : W * 0.66, tyB = cy + bh / 2 - 34;
    const bx = (1 - vao) * 120 * -tu;
    c.save(); c.translate(bx, 0);
    c.fillStyle = 'rgba(8,4,16,0.88)'; c.beginPath(); c.moveTo(tx - 130, tyB - 12); c.lineTo(tx + 140, tyB - 22); c.lineTo(tx + 130, tyB + 14); c.lineTo(tx - 140, tyB + 22); c.closePath(); c.fill();
    c.fillStyle = m; c.fillRect(tx - 140, tyB + 19, 280, 2.5);
    if (CUT.k === 'af') { veChuBang(c, 'POWER UP!', tx, cy - bh / 2 + 48, 26, '#ffffff'); veChuBang(c, CUT.ten, tx, tyB, 15, m); }
    else if (CUT.k === 'tuong') { veChuBang(c, CUT.ten, tx, tyB - 1, 16, '#ffffff'); veChuBang(c, CUT.phu, tx, cy - bh / 2 + 44, 11, m, -0.1); }
    else { veChuBang(c, CUT.ten, tx, tyB, 16, '#ffffff'); veChuBang(c, CUT.boss.ten, tx, cy - bh / 2 + 44, 12, '#ffb0b0', -0.1); }
    c.restore();
    c.restore();
  }
  // ---------- vẽ cả khung ----------
  let tTruoc = 0;
  function ve(c, S, t, k, keo, A, ui) {
    const dt = Math.min(0.05, Math.max(0, t - tTruoc)); tTruoc = t;
    if (H !== C.H) { H = C.H; batLai = true; }   // đổi chiều cao màn → dựng lại lớp tĩnh (bàn dưới đã dời)
    const coop = !!(S && S.coop), che = coop ? (S.coop.solo ? 'solo' : 'coop') : false;
    if (!L || LK !== k || batLai || L.che !== che || L.skin !== C.SKIN_NG + '|' + C.SKIN_AI) { taoLop(k, che); batLai = false; for (let n = THE_VE.length - 1; n >= 0; n--) { if (THE_VE[n].cvs.isConnected) THE_VE[n].f(); else THE_VE.splice(n, 1); } }
    c.save();
    // rung màn ≤ 2px logic (chỉ sân, không rung HUD)
    if (S && S.rung > 0 && Q.cao) c.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
    c.drawImage(L.tinh, 0, 0, W, H);
    if (S) {
      xetCutIn(S, A, t);
      veThanhGiua(c, S, A, t);
      if (A) veBan(c, A, t, null);
      veBan(c, S, t, keo);
      if (A && !coop) veCongAF(c, A, t);
      veCongAF(c, S, t);
      veHat(c, dt);
      veGiaoDien(c, S, ui, t);
      const goi = keo ? S.o[keo.i] : null;
      if (goi) {   // kéo: tô sáng ĐƯỜNG QUÁI của bàn mình (mọi tướng bắn được cả đường) + GHOST tướng dưới ngón
        const m = HANH[TUONG[goi.id].hanh].mau;
        c.save(); c.strokeStyle = hexA(m, 0.22); c.lineWidth = 22; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath();
        S.B.DUONG.forEach(([x, y], n) => (n ? c.lineTo(x, y - (n ? 11 : 0)) : c.moveTo(x, y))); c.stroke(); c.restore();
        c.save(); c.globalAlpha = 0.85; veHinhTuong(c, goi, keo.x, keo.y + 16, S.t); c.restore();
      }
      if (A) veSoBan(c, A);
      veSoBan(c, S);
      veThieu(c, S, t);
    } else veHat(c, dt);
    c.restore();
    c.drawImage(L.toi, 0, 0, W, H);
    if (S && S.fx.some((f) => f.k === 'thanh')) { c.save(); c.fillStyle = rg(c, W / 2, H / 2, 260, 620, [[0, 'rgba(255,0,40,0)'], [1, 'rgba(255,0,40,0.3)']]); c.fillRect(0, 0, W, H); c.restore(); }
    if (!S) return;
    if (S.bao && !(coop && S.bao.boss)) {   // dải thông báo round / trùm: đè lên THANH GIỮA (co-op trùm dùng màn giới thiệu)
      const b = S.bao, a = Math.max(0, Math.min(1, b.t * 8, (b.T - b.t) * 4)), hh = b.boss ? 46 : 30, y0 = (che === 'solo' ? C.GIUA_SO : coop ? C.GIUA_CO : C.GIUA_Y) - hh / 2, cy = y0 + hh / 2, m = b.boss ? '#ff3b3b' : '#3ce7ff';
      c.save(); c.globalAlpha = a;
      const sx = (1 - Math.min(1, b.t * 5)) * 30;
      c.fillStyle = 'rgba(3,4,14,0.9)'; c.fillRect(0, y0, W, hh);
      c.save(); neon(c, m, 10); c.fillStyle = m; c.fillRect(0, y0, W, 1.2); c.fillRect(0, y0 + hh - 1.2, W, 1.2); c.restore();
      if (b.boss) { c.save(); c.beginPath(); c.rect(0, y0, W, hh); c.clip(); c.fillStyle = 'rgba(255,40,40,0.10)'; for (let x = -40 + ((t * 60) % 40); x < W; x += 40) { c.beginPath(); c.moveTo(x, y0 + hh); c.lineTo(x + 20, y0); c.lineTo(x + 34, y0); c.lineTo(x + 14, y0 + hh); c.fill(); } c.restore(); }
      c.textAlign = 'center'; c.textBaseline = 'middle';
      const chu = coop || !b.chu.startsWith('WAVE') ? b.chu : b.chu.replace(/^WAVE/, 'ROUND');
      c.font = `900 ${b.boss ? 17 : 16}px Orbitron, "Segoe UI", sans-serif`;
      veChuNhieu(c, chu, W / 2 + sx, cy - (b.phu ? 6 : 0), '#ffffff');
      if (b.phu) { c.font = '700 10px Rajdhani, "Segoe UI", sans-serif'; c.fillStyle = '#ffe2e2'; c.fillText(b.phu.length > 70 ? b.phu.slice(0, 68) + '…' : b.phu, W / 2, cy + 12); }
      c.restore();
    }
    veCutIn(c, t);
  }
  // ---------- chân dung (thẻ UI): portraits_8.png nếu có, không thì ảnh cũ / hình vẽ code ----------
  const THU_TU_PORT = ['scorch', 'frost', 'arc', 'lance', 'warp', 'miner', 'glitch', 'venom'];
  const THE_VE = [];
  function veChanDungVao(c, id, w, h, cat) {   // cat: cắt bán thân (ảnh cũ toàn thân)
    if (coPx(id)) {   // tướng pixel: ô hướng S của dir8, không smoothing, canh phần hình theo bề ngang thẻ
      const P = TUONG[id].px, im = co(`px:${id}:8`), o = P.dir8.o, [f, h8] = o8(P, 's'), d = doPx(im, o, o, f, h8);
      const s = Math.max(w / (o * 0.8), h / (o * (cat ? 0.75 : 1)));
      c.save(); c.imageSmoothingEnabled = false; c.drawImage(im, f * o, h8 * o, o, o, w / 2 - d.tam * s, -d.y0 * s + h * 0.04, o * s, o * s); c.restore();
      return;
    }
    const p3 = co('v3p:' + id) || co('v3p2:' + id);
    if (p3) { const s = Math.max(w / p3.width, h / p3.height); c.drawImage(p3, (w - p3.width * s) / 2, 0, p3.width * s, p3.height * s); return; }   // chân dung v3 bán thân: phủ kín, canh đỉnh
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
    const h = BAC[TUONG[id].bac] || BAC.trang;
    const ve1 = () => { c.clearRect(0, 0, px, px); c.fillStyle = hexA(h.mau, 0.28); c.fillRect(0, 0, px, px); veChanDungVao(c, id, px, px, true); };
    ve1(); THE_VE.push({ cvs, f: ve1 });
  }
  // ẢNH THẺ TƯỚNG: nền màu hệ + chân dung (thẻ chọn tướng / thẻ nâng cấp)
  function veThe(cvs, id, w, h) {
    const k = Math.min(3, (window.devicePixelRatio || 1) * 2);
    cvs.width = Math.round(w * k); cvs.height = Math.round(h * k);
    const c = cvs.getContext('2d'); c.scale(k, k);
    const hh = BAC[TUONG[id].bac] || BAC.trang;   // nền thẻ theo màu BẬC
    const ve1 = () => {
      c.clearRect(0, 0, w, h);
      // P0.2: nền sáng hơn theo màu hệ, chân dung rõ; chỉ tối nhẹ mép dưới để chữ đọc được
      c.fillStyle = lg(c, 0, 0, 0, h, [[0, hexA(hh.mau, 0.55)], [0.5, hexA(hh.mau, 0.22)], [1, '#0b0f22']]); c.fillRect(0, 0, w, h);
      veGlow(c, hh.mau, w / 2, h * 0.4, w * 0.9, 0.35);
      veChanDungVao(c, id, w, h, true);
      c.fillStyle = lg(c, 0, h * 0.78, 0, h, [[0, 'rgba(6,8,20,0)'], [1, 'rgba(6,8,20,0.55)']]); c.fillRect(0, h * 0.78, w, h * 0.22);
    };
    ve1(); THE_VE.push({ cvs, f: ve1 });
  }
  // CHÂN DUNG ARCHFIEND: archfiend_<id>.png nếu có, không thì portrait tạm của tướng `anh` (data.js), nền màu Archfiend
  function veAF(cvs, id, px) {
    const k = Math.min(3, (window.devicePixelRatio || 1) * 2), a = ARCHFIEND[id];
    cvs.width = Math.round(px * k); cvs.height = Math.round(px * k);
    const c = cvs.getContext('2d'); c.scale(k, k);
    const ve1 = () => {
      c.clearRect(0, 0, px, px);
      c.fillStyle = lg(c, 0, 0, 0, px, [[0, hexA(a.mau, 0.6)], [1, '#0b0f22']]); c.fillRect(0, 0, px, px);
      const x = anhAF(id);   // archfiend_<id>.png → mặt cắt từ cutin_<id>.png → portrait tạm
      if (x) c.drawImage(x[0], x[1], x[2], x[3], x[4], 0, 0, px, px * x[4] / x[3]);
      else if (a.anh && TUONG[a.anh]) veChanDungVao(c, a.anh, px, px, true);   // portrait tạm của 1 tướng (nếu có)
    };
    ve1(); THE_VE.push({ cvs, f: ve1 });
  }
  // FPS thấp liên tục → hạ chất lượng (ít mưa, ít hạt, tắt bóng phát sáng)
  let dem = 0, tong = 0;
  function doFps(dtMs) { tong += dtMs; if (++dem >= 90) { const tb = tong / dem; if (tb > 24 && Q.cao) { Q.cao = false; Q.hat = 90; } else if (tb < 15 && !Q.cao) { Q.cao = true; Q.hat = 200; } dem = 0; tong = 0; } }
  window.RENDER = { ve, veChanDung, veThe, veAF, ANH, Q, doFps, HAT, hopChu, hopChonGop, baoThieu };
})();
