// TURRET MERGE — CLIP MINH HOẠ KỸ NĂNG (trang hồ sơ ụ → khung "Test range")
// Mỗi ụ có 1 kịch bản ngắn lặp lại ~8 s: cảnh dựng sẵn (quái giả đúng loại/số lượng, ụ hàng xóm trên bàn 3×3 giữa),
// diễn cơ chế từng bước, chậm lại ở khoảnh khắc chính, chú thích ngắn + mũi tên / đánh dấu chỗ thay đổi.
// Dùng CHÍNH code trận (render/FX/kỹ năng) → hình giống hệt khi chơi. Chỉ chạy trong iframe ?preview=<id> (unitpage.js).
// Kịch bản: mặc định theo kiểu kỹ năng + ghi đè riêng từng ụ (bảng SD_K). Sao 1/4/7 = đúng số liệu sao đó; dạng 1/2/3 ép T._epGd.
'use strict';

const SD = {
  id: null, sao: 1, gd: 0, t: 0, ks: null, B: null, T: null, lap: 0, tRe: 0,
  da: [], sk: [], kq: [], soMana: [], moi: [], vet: {}, nhan: [], tay: null, ve: [],
};

// ===================================================== số ngẫu nhiên cố định =====================================================
// mỗi vòng lặp gieo lại cùng hạt → cùng diễn biến; cửa sổ "may mắn" (kịch bản) → mọi lần gieo của 1 ụ ra ~0 (chí mạng, chém…)
const SD_RNG = { s: 1 };
const _sdRandGoc = Math.random;
function sdRand() { let t = (SD_RNG.s += 0x6D2B79F5); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
Math.random = function () {
  const L = SD.ks && SD.ks.may;
  if (L && SD.t >= L[0] && SD.t < L[1] && G.dangBan && (L[2] === 'ke' ? G.dangBan !== SD.T : G.dangBan === SD.T || (SD.T && G.dangBan.id === SD.id))) return 0.0004;
  return sdRand();
};

// ===================================================== chữ ngắn =====================================================
// (không xoá chữ "Awaken…": đó là tên trạng thái thật của Sói / Vệ Tinh — xoá đi làm câu thành ": always crits")
const sdSC = (s) => { s = String(s || '').replace(/grow-?up\s*/ig, '').replace(/\s+/g, ' ').trim(); return s.charAt(0).toUpperCase() + s.slice(1); };
function sdNgan(s) { // ≤ 6 từ, cắt ở dấu câu
  s = String(s).replace(/\b[A-Z]{2,}\b/g, (w) => ({ HP: 'HP', PVP: 'PvP' }[w] || w.toLowerCase()));
  s = sdSC(s.split(/;|\s\(|\s·\s|\s—\s/)[0]);
  s = s.replace(/\b1 enemies\b/g, '1 enemy').replace(/\b1 turrets\b/g, '1 turret').replace(/\b([2-9]) enemy\b/g, '$1 enemies').replace(/\b([2-9]) turret\b/g, '$1 turrets');
  if (s.split(' ').length > 6 && s.indexOf(',') > 0) s = s.slice(0, s.indexOf(','));
  const w = s.split(' ');
  if (w.length > 6) { let k = 6; while (k > 3 && /^(from|for|of|to|the|a|and|on|in|at|with|its)$/i.test(w[k - 1])) k--; s = w.slice(0, k).join(' '); }
  return s.replace(/[,.]$/, '');
}
const SD_MOC_NGAN = {
  'Slowed enemies take +15% damage from everything': 'Slowed enemies take +15% damage',
  'Every 4th shot freezes the target 0.8s': 'Every 4th shot freezes',
  'Poisoned enemies spread poison when they die': 'Poison spreads when they die',
  'Kill explosion poisons': 'Kill blasts also poison',
  'Also buffs the 4 diagonal cells': 'Also buffs the 4 diagonals',
  'White-blue foxfires blast 40 px; restarts at 3 tails': 'Foxfires blast an area',
  'Rewind restores 1 heart once (Co-op: 1 shared heart; also saves 1 leak)': 'Rewind restores 1 heart once',
  'Merging 5★s rolls twice, keeps the better': 'Rolls twice, keeps the better',
  'Merging 6★s (into 7★) fires 2 effects': '6★ merges fire 2 effects',
  'Each swap: both modes 1.5s + ×4 ring blast': 'Each swap fires a ring blast',
  'Controls 2 enemies at once (4★+: big enemies too)': 'Controls 2 enemies at once',
  'Barrels fuse: ×6 piercing beam, 0.72/s': 'Barrels fuse into a beam',
  'Grow-up stage 2: +40% fire rate': 'Stage 2: +40% fire rate',
  'Stage 3: every hit crits, ×2 speed': 'Stage 3: every hit crits',
  'Unlocks the active skill (tap when full; auto-fires if left full)': 'Unlocks the tap skill',
  'Diagonal turrets also +15% fire rate': 'Diagonals also get fire rate',
  'Aura +20 px': 'Cold area +20 px',
};

// ===================================================== dựng cảnh =====================================================
// quái: s = vị trí trên đường (đường trên: x = 404 − s, đi từ phải sang trái), h = số phát của ụ chính để chết
const Q = {
  hang: (n, s0, gap, h, k) => Array.from({ length: n || 3 }, (_, i) => ({ k: k || 'bo', s: (s0 || 150) - i * (gap || 46), h: h || 4 })),
  nhom: (n, s0, gap, h) => Array.from({ length: n || 5 }, (_, i) => ({ k: 'bo', s: (s0 || 150) - i * Math.max(20, gap || 20), h: h || 5, dy: i % 2 ? 7 : -7 })),
  to: (h) => [{ k: 'bo', s: 175, h: 3 }, { k: 'khong_lo', s: 120, h: h || 7 }, { k: 'bo', s: 70, h: 3 }],
  nho: () => [{ k: 'nho', s: 180, h: 2 }, { k: 'nho', s: 150, h: 2 }, { k: 'bo', s: 120, h: 5 }, { k: 'nho', s: 95, h: 2 }, { k: 'nho', s: 60, h: 2 }],
  dong: (n, gap, h, k, t0) => Array.from({ length: n || 6 }, (_, i) => ({ k: k || 'bo', s: 0, t: (t0 || 0) + i * (gap || 0.7), h: h || 5 })),
  trum: (id, kn, h) => [{ trum: id, s: 110, h: h || 60, kn }, { k: 'bo', s: 170, h: 4 }],
};
// ô: hàng 0 = 0..4, hàng 1 = 5..9, hàng 2 = 10..14 · bàn 3×3 giữa = cột 1..3
const KE4 = [2, 6, 8, 12], CHEO4 = [1, 3, 11, 13];
const sdLaRed = (id) => G.rosterMap[id] && G.rosterMap[id].bac === 'do';

// ---------- kịch bản riêng ----------
// c: [t, chữ (hoặc hàm (T, sao)), {cham: giây trận quay chậm, ev: 'hit'|'kill'|'shot:N'|'mana'|'sao'|'moi'}]
// keo: [t, ô kéo, ô đích] (ghép thật) · cham: [t] (chạm kỹ năng chủ động) · ke: [[ô, id, sao|'s']] · may: [t0, t1, 'ke'?]
// truoc(T, B): chỉnh bộ đếm để kỹ năng định kỳ nổ sớm · lien: đánh số thứ tự trúng · mana: hiện ô mana · day: không làm mờ cột rìa
// demo Star Cannon: lấp ô trống bằng Chain (★ tuỳ chọn) tới đúng tổng ★ n trên bàn → hiện mốc tốc (20) rồi mốc sát thương (50)
function sdNgoiSao(B, n) { for (let o = 0; o < B.t.length; o++) { const k = n - SKILLS.ngoisao.tong(B); if (k <= 0) break; if (!B.t[o]) { const T = sinhU(taoU(B, 'lien', Math.min(7, k), o)); B.t[o] = T; T.goc = -Math.PI / 2; T.gd = null; } } }
// đặt thêm ụ vào ô trống giữa clip (hiệu ứng triệu hồi thật) + hiện chỉ số ụ chính trước → sau (k: 'dmg' | 'toc')
function sdThem(B, ds, T, k) {
  const v0 = T && k ? sdSo(T, k) : null;
  for (const [o, x, sao] of ds) { if (B.t[o]) continue; const N = sinhU(taoU(B, x, clamp(sao | 0, 1, 7), o)); B.t[o] = N; N.goc = -Math.PI / 2; VX.trieu(N); }
  if (v0 != null) VX.hen(0.45, () => { if (B.t[T.o] === T) SD.soDoi = { o: T.o, a: v0, b: sdSo(T, k), ic: k === 'toc' ? 'ic_toc' : 'ic_dmg', t0: performance.now() }; });
}
// Hex Saboteur: chọn lượt nguyền (B.hexN) mà cú gieo THẬT của kỹ năng (SK7.rng) trúng — clip hiện ca may mắn, chú thích nói rõ xác suất
function sdHexTrung(B, T, o) {
  if (!T || typeof SK7 === 'undefined') return;
  const p = SKILLS.nguyenrua.p(T);
  for (let n = 1; n < 400; n++) { const r = SK7.rng(B, o, n, 2); r(); if (r() < p) { B.hexN = n - 1; return; } }
}
// Pháo La Bàn: chữ HƯỚNG TO (N / NS / NSWE…) + stack ở góc trên-trái mỗi Pháo (ụ đang kéo: chữ theo ngón tay)
function sdLaBan(x, B) {
  const S = SKILLS.canon, g = UI.keo && UI.keo.sd ? UI.keo : null;
  for (const T of B.t) if (T && T.id === 'canon') {
    const keo = g && g.T === T, c = keo ? { x: g.x, y: g.y } : B.o[T.o];
    sdChu(x, S.ten(S.hb(T)) + (S.chong(T) ? ' +' + S.chong(T) : ''), c.x - B.cw * 0.3, c.y - B.ch * 0.28, '#7fe8ff', 22);
  }
}
// Lửa Thập Tự: số lửa TO (ảnh glyph/lualien + số) ở góc trên-trái mỗi Relay; 2.5–5 s sau ghép ở ô 8: mũi tên chạy ra dọc hàng + cột,
// "+N" xanh trên Relay vừa nhận lửa (N = lửa thật cộng thêm, so với SD.lcCu chụp lúc 2.4 s), "✗" đỏ trên Relay lệch hàng/cột (ô 11)
function sdLuaLien(x, B) {
  const t = SD.t, o0 = 8, c0 = o0 % 5, h0 = (o0 / 5) | 0;
  for (const T of B.t) if (T && T.id === 'lualien') {
    const c = B.o[T.o], lx = c.x - B.cw * 0.36, ly = c.y - B.ch * 0.28;
    sdVe(x, 'glyph/lualien', lx, ly, 18); sdChu(x, String(T.lc || 0), lx + 9, ly + 1, '#ffb35a', 22, 'left');
    if (t > 2.5 && t < 5.4 && SD.lcCu && SD.lcCu[T.o] != null && (T.lc || 0) > SD.lcCu[T.o]) { const u = clamp((t - 2.5) / 0.4, 0, 1); x.globalAlpha = Math.min(1, (5.4 - t) * 2); sdChu(x, '+' + ((T.lc || 0) - SD.lcCu[T.o]), c.x + B.cw * 0.22, c.y - B.ch * 0.36 - 8 * u, '#7dffb0', 19); x.globalAlpha = 1; }
    if (t > 3.9 && t < 5.4 && T.o % 5 !== c0 && ((T.o / 5) | 0) !== h0) { sdChu(x, '✗', c.x, c.y, '#ff6b6b', 34); }
  }
  if (t > 2.5 && t < 4.6) { // mũi tên dọc hàng + cột (ảnh duong_mui), nhấp nháy chạy ra ngoài
    const k = (t - 2.5) * 3;
    for (const o1 of [o0]) for (let i = 0; i < 15; i++) { // từ Ô GHÉP (8): lửa cả 2 Ember theo hàng/cột ô ghép (luật 08/11)
      const c1 = o1 % 5, h1 = (o1 / 5) | 0, c = i % 5, h = (i / 5) | 0; if (i === o1 || i === 7 || i === o0 || (c !== c1 && h !== h1)) continue;
      const d = Math.abs(c - c1) + Math.abs(h - h1), r = c === c1 ? (h > h1 ? Math.PI / 2 : -Math.PI / 2) : (c > c1 ? 0 : Math.PI);
      const a = B.o[i]; x.globalAlpha = clamp(k - d + 1, 0, 1) * 0.9; sdVe(x, 'duong_mui', a.x - Math.cos(r) * B.cw * 0.5, a.y - Math.sin(r) * B.ch * 0.5, 26, 17, r); x.globalAlpha = 1;
    }
  }
}
// Mystery Box: khoảng sao khi mở = như SKILLS.hopbi.capNhat (sàn = max(mốc 5★/7★, sao của hộp ≤ 6))
const sdHop = (s) => { const lo = Math.max(s >= 7 ? 5 : s >= 5 ? 3 : 1, Math.min(6, s | 0)); return (lo === (s >= 7 ? 7 : 6) ? '' : lo + '–') + (s >= 7 ? 7 : 6); };
// Hero Foundry: % tốc của ô anh hùng vừa dập (giá trị thật trong B.hero — tính theo sao Foundry ghép, không theo ụ ra)
function sdHero(T) { const B = G.ban[T.ban] || G.ban[0], h = B && B.hero && B.hero[B.hero.length - 1]; return h ? h.v : SKILLS.xuonganh.v(T); }
const SD_K = {
  // Pháo La Bàn (tổ hợp hướng 08/11): ô 7 (N) kéo vào ô 8 (S) → NS bắn 2 tên lửa · rồi ô 13 (WE) kéo vào ô 8 → NSWE bắn 4 tên lửa
  //   chữ hướng TO trên mỗi Pháo (sdLaBan); cùng sao → sao kết quả = trung bình làm tròn lên (giữ nguyên sao)
  canon: { kieu: 'ghep', saoMax: 5, q: Q.nhom(6, 175, 26, 9), ke: [[8, 'canon', 's'], [13, 'canon', 's']], keo: [[2.6, 7, 8], [5.6, 13, 8]],
    truoc: (T, B) => { if (T) { T.hb = 1; T.cmC = 0; } if (B.t[8]) { B.t[8].hb = 4; B.t[8].cmC = 0; } if (B.t[13]) { B.t[13].hb = 10; B.t[13].cmC = 0; } },
    ve: (x, B) => sdLaBan(x, B),
    c: [[0.2, 'Each Compass has a direction: N, S, W or E'], [1.4, 'Drag one Compass onto another'], [2.6, 'N + S = NS: 2 homing rockets', { cham: 0.6 }], [4.0, 'Star = average of the two, rounded up'],
      [5.6, 'NS + WE = NSWE: 4 rockets', { cham: 0.7 }], [6.8, (T) => 'NSWE + NSWE: +1 stack = +' + Math.round(SKILLS.canon.moiChong(T) * 100) + '% damage']], dai: 9.4 },
  xucxac: { q: Q.hang(3, 170, 50, 6), may: [5, 5.8], c: [[0.2, 'Each shot: random 3–300% damage'], [1.5, 'Look at the damage numbers', { ev: 'hit', cham: 0.4 }], [4.8, 'A crit always does 300%', { ev: 'hit', cham: 0.5 }]] },
  lien: { q: Q.dong(7, 0.55, 3), c: [[0.2, 'Shoots very fast at the first enemy'], [2.4, (T, s) => s >= 3 ? 'More ★ = shoots faster' : 'More ★ = shoots faster', { cham: 0.4 }]] },
  phun: { q: Q.nhom(6, 185, 24, 6), c: [[0.2, 'Shoots fast at random enemies'], [1.6, 'Every enemy gets hit', { ev: 'hit', cham: 0.4 }]] },
  sungluc: { q: Q.hang(3, 170, 55, 2), c: [[0.2, 'One big shot, hits at once'], [0.8, 'It hits the first enemy', { ev: 'hit', cham: 0.5 }]] },
  bang: { q: Q.hang(4, 180, 40, 8), truoc: (T) => { T.nap = 0.8; }, c: [[0.2, 'Freezes the first enemy'], [1.3, (T) => 'Frozen ' + SKILLS.bang.dai(T) + 's, no damage', { cham: 0.6 }], [4.6, 'Next Freeze picks a new enemy']] },
  doc: { q: Q.nhom(4, 175, 22, 9), ke: [[6, 'lien', 's'], [8, 'canon', 's']], truoc: (T) => { T.nap = 0.8; }, c: [[0.2, 'Marks the first enemy'], [1.4, (T) => 'Marked: +' + +knThe(G.ban[T.ban], 'doc').toFixed(1) + '% damage from all', { cham: 0.6 }]] },
  tia: { q: Q.to(6), c: [[0.2, 'Picks the enemy with most HP'], [1.0, '+100% damage to big enemies', { ev: 'hit', cham: 0.6 }]] },
  set: { q: Q.hang(7, 205, 28, 5), lien: 1, c: [[0.2, 'Lightning jumps enemy to enemy'], [1.0, (T, s) => 'Hits ' + s + (s > 1 ? ' enemies' : ' enemy'), { ev: 'hit', cham: 0.6 }]] },
  maychem: { q: Q.nho(), may: [3.2, 4.4], c: [[0.2, 'Shoots the first enemy'], [3.0, 'May kill a small enemy at once', { ev: 'kill', cham: 0.6 }]] },
  phagiap: { kieu: 'ht', truoc: (T) => { T.nap = 0.9; }, c: [[0.2, 'Breaks armor: first + most HP'], [1.4, (T) => 'Neighbours deal +' + Math.round(HOTRO.hd(T, 'lo', SKILLS.phagiap.k(T)) * 100) + '% to them', { cham: 0.5 }]] },
  bua: { kieu: 'ht', may: [1.6, 3.2, 'ke'], c: [[0.2, 'Neighbours get more crits'], [1.6, 'Crits hit harder and stop enemies', { cham: 0.6 }]] },
  nam: { o: 2, q: Q.nhom(5, 175, 16, 8), c: [[0.2, 'Melee: hits only close enemies'], [1.6, 'Each punch blasts around the target', { ev: 'hit', cham: 0.5 }]] },
  bomhen: { q: Q.hang(4, 170, 34, 8), ke: [[6, 'lien', 's'], [8, 'canon', 's']], truoc: (T) => { T.nap = 0.9; }, c: [[0.2, 'Sticks a bomb on an enemy'], [1.2, 'It blows up after 5 seconds'], [5.5, (T) => 'Blast: enemies take +' + +(SKILLS.bomhen.yw(T) * 100).toFixed(2) + '% damage', { cham: 0.6 }]], dai: 9.4 },
  nhanmana: { kieu: 'ghep', mana: 1, manaDau: 100, c: [[0.2, 'Merge two Mana Doublers'], [2.5, 'Merge = bonus mana', { ev: 'mana', cham: 0.6 }]] },
  kiembang: { q: Q.nhom(4, 170, 22, 12), c: [[0.2, 'Each hit slows nearby enemies'], [1.4, (T) => 'Slowed enemies take ×' + (ms(T, 7) ? 8 : ms(T, 3) ? 6 : 5) + ' damage', { ev: 'hit', cham: 0.6 }]] },
  mimic: { kieu: 'ghep', ban: 'canon', c: [[0.2, 'Merges with ANY same-star turret'], [2.5, (T) => 'New turret: +' + Math.round(knThe(G.ban[T.ban], 'mimic')) + '% attack', { ev: 'moi', cham: 0.6 }]] },
  dichchuyen: { o: 2, q: Q.nhom(4, 170, 18, 9), ke: [[12, 'nam', 's']], keo: [2.6, 2, 12], c: [[0.2, 'Iron Fist is too far away'], [1.6, 'Drag onto a same-star turret'], [2.6, 'They swap places', { cham: 0.6 }], [4.2, 'Now it can reach the enemies']] },
  // Drone Kéo Xa: kéo từ góc dưới-trái (ô 11) lên góc trên-phải (ô 3) = 4 ô → 4 drone (+1 mỗi 3★)
  drone: { kieu: 'ghep', o: 11, q: Q.hang(5, 175, 34, 5), ke: [[3, 'drone', 's']], keo: [2.5, 11, 3], c: [[0.2, 'Merge two Drone Bays far apart'], [2.5, (T) => 'Dragged 4 cells: ' + SKILLS.drone.so(T.sao, 4) + ' bomb drones', { cham: 0.6 }], [4.4, 'Drag farther = more drones']] },
  tron: { kieu: 'ht', ke: [[2, 'lien', 's'], [6, 'canon', 's'], [8, 'set', 's'], [12, 'sungluc', 's']], c: [[0.2, 'Counts Attack types in its Row + Column'], [1.6, (T) => 'Neighbours get +' + sdBuf(T) + ' fire rate', { cham: 0.4 }]] },
  nangluong: { q: Q.hang(3, 175, 50, 8), mana: 1, manaDau: 60, truoc: null, them: [[3.4, (B) => { B.mana += 600; }]], c: [[0.2, 'More mana = more damage'], [3.4, 'Mana went up: bigger hits', { ev: 'hit', cham: 0.6 }]] },
  laser: { q: Q.hang(3, 180, 50, 14), c: [[0.2, 'Keeps a beam on one enemy'], [2.2, 'Beam grows up to ×4', { cham: 0.5 }]] },
  mortar: { q: Q.nhom(6, 185, 22, 7), c: [[0.2, 'Fires shells at random enemies'], [1.2, 'Every 3rd shell splits into bombs', { ev: 'hit', cham: 0.7 }]] },
  vungdoc: { q: Q.dong(6, 0.6, 9), truoc: (T) => { T.nap = 0.85; }, c: [[0.2, 'Throws a poison pool'], [2.0, 'Enemies walking in lose HP', { cham: 0.5 }]] },
  loa: { kieu: 'ghep', cd: 1, c: [[0.2, 'Your Archfiend skill is cooling down'], [2.5, 'Merge = shorter cooldown', { cham: 0.6 }]] },
  hutmana: { q: Q.hang(4, 175, 40, 6), mana: 1, manaDau: 0, c: [[0.2, 'Each hit makes a little mana'], [2.0, 'Mana goes to your counter', { ev: 'mana', cham: 0.5 }]] },
  min: { q: Q.dong(6, 0.7, 6), truoc: (T) => { T.nap = 0.8; }, c: [[0.2, 'Lays mines on the path'], [2.6, 'Step on a mine: boom', { ev: 'hit', cham: 0.6 }]] },
  cuongno: { q: Q.dong(8, 0.5, 4), may: [1.8, 3.4], c: [[0.2, 'Each crit = 1 rage'], [1.8, '2 rage: shoots much faster', { cham: 0.6 }]] },
  baotuyet: { q: Q.nhom(5, 180, 26, 10), truoc: (T) => { T.nap = 0.86; }, c: [[0.2, 'A blizzard every few seconds'], [1.3, 'Slows every enemy on the path', { cham: 0.6 }]] },
  nhanban: { kieu: 'ghep', c: [[0.2, 'Merge two Cloners'], [2.5, 'Merge = a free extra turret', { ev: 'moi', cham: 0.6 }]] },
  lienket: { q: Q.hang(3, 175, 50, 6), ke: [[6, 'lienket', 's'], [8, 'lienket', 's']], c: [[0.2, 'Chain Links side by side = a chain'], [1.4, (T) => 'Chain of ' + (T.chuoi || 3) + ': +' + Math.round(0.4 * ((T.chuoi || 3) - 1) * 100) + '% damage', { ev: 'hit', cham: 0.5 }]] },
  kepha: { kieu: 'ghep', doi: [[4, 'canon', 3], [9, 'tia', 4], [14, 'set', 3]], c: [[0.2, 'Merge two Jammers'], [2.5, 'Rival turrets get slowed', { cham: 0.6 }], [4.0, 'Rival: −40% fire rate']] },
  taylo: { kieu: 'ht', dong: [2, 6], truoc: (T) => { T.nap = 0.85; }, c: [[0.2, 'Two Neighbours are Frozen'], [1.8, 'Its pulse cleans them', { cham: 0.7 }]] },
  khien: { kieu: 'ht', ke: [[2, 'lien', 's'], [6, 'canon', 's'], [8, 'lien', (s) => Math.min(7, s + 1)], [12, 'canon', 's']], q: Q.trum('freezer', 3.4, 80), truoc: (T) => { T.nap = 0.9; }, c: [[0.2, 'Charges shields for Neighbours'], [1.4, 'Neighbours get a 1-hit shield', { cham: 0.5 }], [3.4, 'The Boss uses a skill…'], [4.6, 'The shield blocks it', { ev: 'chan', cham: 0.6 }]], dai: 9 },
  hopbi: { kieu: 'phu', dem: (T) => SKILLS.hopbi.can(T) - T.tuoi, truoc: (T) => { T.tuoi = SKILLS.hopbi.can(T) - 3.2; }, c: [[0.2, 'Counts down, then opens'], [3.0, (T, s) => 'Becomes a random ' + sdHop(s) + '★ turret', { ev: 'moi', cham: 0.6 }]] },
  nangsao: { kieu: 'ht', ke: [[2, 'lien', 1], [6, 'canon', 3], [8, 'set', 1], [12, 'sungluc', 4]], c: [[0.2, 'Buffs all 4 Neighbours, lowest ★ most'], [1.6, (T) => 'They get +' + sdBuf(T) + ' fire rate', { cham: 0.5 }]] },
  xaotron: { kieu: 'ghep', doi: [[4, 'canon', 3], [9, 'tia', 4], [14, 'set', 3]], c: [[0.2, 'Merge two Scramblers'], [2.5, 'Rival turrets change type', { cham: 0.7 }], [4.0, 'Their board is messed up']] },
  epxung: { kieu: 'gDB', ban: 'lien', so: { o: 8, k: 'toc' }, c: [[0.2, 'Drag onto a same-star turret'], [2.5, (T) => '+' + +knThe(G.ban[T.ban], 'epxung').toFixed(1) + '% fire rate, it stacks', { cham: 0.6 }]] },
  no5: { q: Q.nhom(5, 175, 20, 9), c: [[0.2, 'Counts its shots'], [1.0, '5th shot: 3 exploding bolts', { ev: 'shot%5', cham: 0.7 }]] },
  bao: { q: Q.hang(6, 200, 30, 10), may: [2.4, 3.6], lien: 1, c: [[0.2, 'Hits at once, very fast'], [2.3, 'Some hits jump to another enemy', { ev: 'hit', cham: 0.5 }]] },
  anhsang: { q: Q.hang(3, 170, 50, 6), truoc: (T) => { T.nap = 0.86; }, c: [[0.2, 'Light orbs fill up'], [1.4, 'Summons a free 1★ turret', { ev: 'moi', cham: 0.6 }]] },
  aten: { q: Q.nhom(4, 175, 22, 5), ke: [[6, 'doc', 's']], c: [[0.2, 'Venom poisons, Purifier hits hard'], [1.6, '×4 damage to poisoned enemies', { ev: 'hit', cham: 0.5 }], [3.4, 'Kills explode on nearby enemies', { ev: 'kill', cham: 0.5 }]] },
  dongbo: { kieu: 'ht', day: 1, ke: [[0, 'lien', 's'], [4, 'canon', 's'], [8, 'set', (s) => s >= 3 ? s - 2 : s + 2], [14, 'sungluc', 's'], [11, 'tia', 's']], c: [[0.2, 'Finds same-star Attack turrets anywhere'], [1.6, (T) => 'Each gets +' + sdBuf(T) + ' damage, no need to touch', { cham: 0.4 }], [3.4, 'A different star gets nothing'], [4.8, (T) => 'PvP: rival turrets deal −' + Math.round(SKILLS.dongbo.giamPvp(T) * 100) + '% damage']] },
  railgun: { day: 1, q: Q.hang(3, 175, 50, 8), ke: [[5, 'railgun', 's'], [6, 'railgun', 's'], [8, 'railgun', 's'], [9, 'railgun', 's'], [2, 'railgun', 's'], [12, 'railgun', 's']],
    them: [[3.2, (B, D, T) => { if (!T || !B.t[6] || B.t[6].id !== 'railgun') return; B.t[6] = null; sdThem(B, [[6, 'canon', T.sao]], T, 'dmg'); }]],
    c: [[0.2, () => 'A full row of Salvos: +' + Math.round(SKILLS.railgun.HANG[5] * 100) + '% damage'], [1.6, () => 'A full column: +' + Math.round(SKILLS.railgun.COT[3] * 100) + '% fire rate', { cham: 0.5 }], [3.2, 'Swap one for another turret…', { cham: 0.6 }], [4.4, () => '4 of 5 still gives +' + Math.round(SKILLS.railgun.HANG[4] * 100) + '%']] },
  vughep: { kieu: 'gDB', ke: [[8, 'canon', 's'], [12, 'vughep', 's'], [13, 'lien', 's']], keo: [[2.5, 7, 8], [4.6, 12, 13]],
    truoc: (T, B) => { if (T) T.vang = false; const K = B.t[12]; if (K) K.vang = true; }, // vang = kết quả gieo khi xuất hiện (knThe 'vughep' %): clip cho xem cả 2 ca, chú thích nói xác suất
    c: [[0.2, 'Drag onto a same-star turret'], [2.5, 'Target gets +1★, keeps its type', { ev: 'sao', cham: 0.6 }], [3.6, (T) => Math.round(knThe(G.ban[T.ban], 'vughep')) + '% chance a Merge King is Golden'], [4.6, 'Golden King: target +2★', { ev: 'sao', cham: 0.6 }]], dai: 9 },
  // Wild Link (game.js laTuDo): ô 7 (s★) kéo lên Twin Maker KHÁC sao ở ô 8 ((s+1)★) → ụ ngẫu nhiên ⌈trung bình⌉ = (s+1)★ + Twin Maker gọi thêm 1 ụ cùng sao đó
  tudo: { kieu: 'ghep', ke: [[8, 'sinhdoi', (s) => Math.min(7, s + 1)]], keo: [2.5, 7, 8],
    c: [[0.2, 'Merges with ANY turret, any ★'], [1.2, (T) => T.sao + '★ + ' + Math.min(7, T.sao + 1) + '★ → ' + Math.ceil((2 * T.sao + 1) / 2) + '★ (average, rounded up)', { cham: 0.5 }],
      [2.5, 'A real merge: Twin Maker summons a twin', { ev: 'moi', cham: 0.6 }], [4.4, (T) => Math.round(tdThuong(G.ban[T.ban]) * 100) + '% chance: +1★ result'], [6.0, 'Works on Stone, Frozen and any special turret']], dai: 8.4 },
  sinhdoi: { kieu: 'ghep', c: [[0.2, 'Merge two Twin Makers'], [2.5, 'Merge = a same-star twin', { ev: 'moi', cham: 0.6 }], [4.2, (T) => Math.round(knThe(G.ban[T.ban], 'sinhdoi') || 10) + '% chance the twin is +1★']] },
  hasao: { kieu: 'ht', ke: [[2, 'lien', 's'], [6, 'canon', 's'], [8, 'lien', 's'], [12, 'sungluc', 4]],
    them: [[4.0, (B, D, T) => { if (!T) return; T.da5Dau = 1; T.w5 = -1; const N = B.t[12]; if (N && N.sao < 5) nangSao(B, N, 5 - N.sao); }]], // ô 12 luôn 4★ → lên 5★ thật = lần 5★ đầu của wave
    c: [[0.2, 'Helps Attack Neighbours'], [1.6, (T) => 'Each gets +' + sdBuf(T) + ' damage', { cham: 0.4 }], [4.0, 'First 5★ of the wave: weakest +8% fire rate', { ev: 'sao', cham: 0.6 }], [5.4, 'PvP: the rival’s first 5★ −8% fire rate']] },
  saochep: { kieu: 'gDB', ban: 'tia', c: [[0.2, 'Drag onto a same-star turret'], [2.5, (T) => 'Becomes a copy with ' + Math.round(heSaoChep(G.ban[T.ban]) * 100) + '% power', { cham: 0.6 }]] },
  ngoisao: { q: Q.hang(3, 175, 50, 6), ke: [[2, 'lien', 3], [6, 'canon', 3], [8, 'set', 3], [12, 'bang', 3]], them: [[1.6, (B) => sdNgoiSao(B, 20)], [3.2, (B) => sdNgoiSao(B, 50)]], c: [[0.2, 'Counts every ★ on the board'], [1.6, 'Every 10★: faster fire', { cham: 0.5 }], [3.2, 'Every 50★: more damage']] },
  soi: { o: 2, q: Q.nhom(5, 175, 18, 6), ke: [[3, 'soi', 's']], truoc: (T, B) => { const g = SD.gd; if (T) { T.thuc = g === 3; T.gd = null; } const W = B && B.t[3]; if (W) { W.thuc = g ? g === 3 : true; W.gd = null; } }, // thuc = kết quả gieo tiLe khi xuất hiện: clip ép 1 Thường + 1 Thức tỉnh, chú thích nói xác suất thật
    c: [[0.2, 'Each Werewolf is Normal or Awakened'], [1.6, 'Awakened: 3 barrels, always crits, wider splash', { ev: 'hit', cham: 0.5 }], [3.4, (T) => 'Each summon or merge: ' + Math.round(SKILLS.soi.tiLe(G.ban[T.ban]) * 100) + '% chance to awaken']] },
  tienhoa: { kieu: 'phu', truoc: (T) => { if (T && !SKILLS.tienhoa.chay(T)) T.egg = SKILLS.tienhoa.can(T) - 4.2; }, c: [[0.2, (T, s) => s >= 7 ? 'A burnt egg never hatches' : 'The egg grows'], [4.3, (T, s) => s >= 7 ? 'Tap it: +20 mana' : s >= 6 ? 'It burns into a 7★ egg' : 'Hatches: a random turret +1★', { ev: 'moi', cham: 0.6 }]] }, // quả trứng (đầu ảnh trung_*, skills2.js)
  cauvong: { kieu: 'ht', q: Q.dong(6, 0.6, 9), truoc: (T) => { T.nap = 0.85; }, c: [[0.2, 'Paints a rainbow trail'], [1.6, 'Enemies on it take more damage', { cham: 0.5 }], [3.4, 'PvP: it paints the rival\'s path instead']] },
  wallgen: { kieu: 'ghep', q: Q.dong(6, 0.55, 12), ke: [[8, 'wallgen', 's']], keo: [4.6, 7, 8], truoc: (T) => { T.nap = 0.7; }, c: [[0.2, 'Puts a wall on the path'], [2.6, 'Wall stops enemies, then explodes', { cham: 0.6 }], [3.6, 'Merge two Wall Projectors'], [4.6, 'Merging: a Golden Wall, ×6 blast', { cham: 0.6 }]], dai: 11 },
  orbital: { kieu: 'ghep', q: Q.hang(4, 175, 40, 10), ke: [[2, 'orbital', 's'], [12, 'orbital', 's']], c: [[0.2, 'Merge two Orbitals'], [2.5, (T) => 'Every Orbital on the board awakens for ' + SKILLS.orbital.dai(G.ban[T.ban]) + 's', { cham: 0.5 }], [4.2, 'Awake: drops bombs on enemies']] },
  blackhole: { q: Q.nhom(6, 190, 24, 14), truoc: (T) => { T.bhT = 0.85; }, c: [[0.2, 'Opens a black hole'], [1.4, 'Holds enemies, then crushes them', { cham: 0.7 }]] },
  overlord: { q: Q.nhom(6, 190, 22, 10), truoc: (T) => { T.nap = 0.55; }, c: [[0.2, 'Charges a thunder blast slowly'], [2.6, 'Huge blast hits the group', { ev: 'hit', cham: 0.7 }]] },
  lophanung: { kieu: 'ht', q: Q.nhom(5, 180, 22, 30), cham: [4.0], truoc: (T) => { T.nap = 0.9; }, c: [[0.2, 'Cold air slows nearby enemies'], [1.6, 'Neighbours hit slowed enemies harder', { cham: 0.5 }], [4.0, 'Tap when full: Freeze nearby', { cham: 0.7 }]] },
  haoquang: { q: Q.trum('freezer', 2.0, 90), cham: [3.0], truoc: (T) => { T.nap = 1; T.napDay = -99; }, c: [[0.2, 'Does not shoot: charges a barrier'], [2.0, 'The Boss uses a skill…'], [3.0, 'Tap: team barrier, Boss skill weaker', { cham: 0.7 }]], dai: 9 },
  nayda: { q: Q.hang(7, 205, 30, 6), lien: 1, c: [[0.2, 'Disc bounces between enemies'], [1.0, (T, s) => 'Bounces ' + s + (s > 1 ? ' times' : ' time') + ', stronger each', { ev: 'hit', cham: 0.7 }]] },
  combo: { kieu: 'ghep', ke: [[2, 'combo', 's']], c: [[0.2, 'Merge two Combo Cores'], [2.5, 'Every Combo Core gets stronger', { cham: 0.6 }]] },
  khoathoigian: { kieu: 'tc', q: Q.hang(3, 175, 50, 12), truoc: (T) => { T.nap = 0.86; }, c: [[0.2, 'Locks the first enemy in time'], [1.2, 'Damage is saved while locked', { cham: 0.5 }], [2.6, 'Lock ends: saved damage bursts', { ev: 'hit', cham: 0.5 }]] },
  hydra: { q: Q.hang(7, 205, 28, 7), lien: 1, cham: [3.0], truoc: (T) => { const B = G.ban[T.ban]; if (B) B.mana = Math.max(B.mana, 200); }, c: [[0.2, (T, s) => s + (s > 1 ? ' heads' : ' head') + ': a chain of shots'], [1.2, 'Each head picks its own target', { ev: 'hit', cham: 0.6 }], [3.0, (T, s) => s >= 7 ? 'Tap the Hydra card: MACHINE GUN' : s >= 3 ? 'Tap the Hydra card: all Hydras 2× faster' : 'Card skill works from 3★', { cham: 0.6 }], [5.0, (T, s) => s >= 3 ? 'Cost doubles each use' : 'Merge to 3★ for the card skill']] },
  cuuvi: { kieu: 'tc', q: Q.dong(9, 0.4, 1), truoc: (T) => { T.duoi = 6; }, c: [[0.2, 'Kills grow fire tails'], [1.8, '9 tails: foxfires chase enemies', { cham: 0.7 }]] },
  pandora: { kieu: 'ghep', mana: 1, manaDau: 100, c: [[0.2, 'Merge two Pandora Vaults'], [2.5, 'The vault spins…', { cham: 0.8 }], [3.5, () => SD.pdr ? 'Vault opens: ' + SD.pdr.toLowerCase().replace('×3', '') .trim() : 'Opens 1 of 6 big effects', { cham: 0.5 }]] },
  luoicheo: { kieu: 'ht', ke: CHEO4.map((o, i) => [o, i % 2 ? 'canon' : 'lien', 's']), c: [[0.2, 'Buffs the 4 diagonal cells'], [2.0, 'All 4 diagonals filled: resonance', { cham: 0.5 }]] },
  ngaithoigian: { q: Q.nhom(5, 200, 26, 30), cham: [4.2], truoc: (T) => { T.nap = 0.92; T.napDay = -99; }, c: [[0.2, 'Enemies slow down over time'], [4.2, 'Tap: rewind pushes enemies back', { cham: 0.7 }]], dai: 9 },
  nemesis: { q: Q.trum('janus', 99, 40).concat(Q.hang(2, 210, 40, 3)), c: [[0.2, 'Every 10 hits: a VERDICT'], [2.4, 'More elites or bosses: +damage forever', { ev: 'hit', cham: 0.5 }]] },
  // Lucky Slot (jackpot.js, máy xèng 3 ô): ụ giữa ra 3 quả khác nhau → tự quay lại → cặp DƯA (+1); 4,4 s Lucky Slot thứ 2 xuất hiện → 3 NHO = JACKPOT
  //   (chuỗi ép qua G._cbEp — clip, không đổi luật trận)
  cobac: { kieu: 'tc', q: Q.hang(5, 180, 40, 8), truoc: (T, B) => { if (B) { B.cb = [0, 0, 0]; B.cbN = 0; B.cbV = null; } G._cbEp = [[[0, 1, 2], [1, 1, 0]], [[2, 2, 2]]]; if (T) T.cbS = 0; },
    them: [[4.4, (B, D, T) => { if (!T || B.t[8]) return; const N = sinhU(taoU(B, 'cobac', T.sao, 8)); N.goc = -Math.PI / 2; B.t[8] = N; VX.trieu(N); }]],
    c: [[0.2, 'Spins 3 fruit reels when it appears'], [1.95, 'No match: it spins again'], [3.8, 'A pair: +1 point to that fruit', { cham: 0.5 }], [4.6, 'Orange = damage · Watermelon = speed · Grape = crit damage'], [6.35, '3 of a kind: JACKPOT! +2 to all fruits', { cham: 0.6 }], [7.6, 'Every Lucky Slot shares the points']], dai: 9 },
  docton: { q: Q.dong(8, 0.5, 4), them: [[4.2, (B) => { const N = sinhU(taoU(B, 'lien', SD.sao, 8)); B.t[8] = N; VX.trieu(N); }]], c: [[0.2, 'Alone: shoots ×2 faster'], [4.2, 'A Neighbour stops the bonus', { cham: 0.6 }]] },
  thaukinh: { kieu: 'ht', may: [1.8, 3.4, 'ke'], q: Q.hang(5, 200, 30, 8), c: [[0.2, 'Neighbours’ crits hit harder'], [1.8, 'Crits go through enemies', { cham: 0.5 }]] },
  nhieusong: { kieu: 'ghep', doi: [[4, 'canon', 3], [9, 'tia', 4], [14, 'set', 3]], c: [[0.2, 'Merge two Signal Jammers'], [2.5, 'Rival turrets get jammed', { cham: 0.7 }], [3.6, 'Jammed: −40% fire rate']] },
  santhuong: { q: Q.to(2), mana: 1, manaDau: 0, truoc: (T) => { T.nap = 0.95; }, c: [[0.2, 'Marks an enemy (big first)'], [2.0, 'Marked kills give bonus mana', { ev: 'mana', cham: 0.6 }]] },
  nhatthuc: { q: Q.hang(4, 180, 40, 14), truoc: (T) => { T.doiT = 3.6; }, c: [[0.2, 'Day: a burning beam'], [3.6, 'Night: a slowing wave', { cham: 0.6 }]] },
  loren: { kieu: 'gDB', ban: 'lien', saoBan: 1, so: { o: 8, k: 'dmg' }, truoc: (T) => { if (T) { T.dang = 'dmg'; T.lo = Math.max(T.lo || 0, 4); } }, c: [[0.2, 'Drag onto any other turret'], [2.5, 'It gets +damage for good (Speed type: +fire rate)', { cham: 0.6 }], [4.4, 'Same type Anvils: stacks add up, can fail']] },
  guongcong: { q: Q.trum('octopus', 1.6, 90), truoc: (T) => { T.nap = 1; }, doi: [[4, 'kepha', 3], [9, 'canon', 4], [14, 'set', 3]],
    them: [[5.0, (B, D, T) => { if (T) T.nap = 1; const K = D && D.t[4]; if (K) SKILLS.kepha.ghep(G, D, K, K, K); }]], dai: 9.4,
    c: [[0.2, 'Neighbours resist control'], [1.6, 'The Boss uses a skill…'], [3.0, 'The mirror blocks it', { cham: 0.6 }], [4.4, 'Rival uses a Jammer…'], [5.0, 'Mirror reflects it back', { cham: 0.7 }]] },
  marionette: { q: Q.hang(4, 190, 36, 14), truoc: (T) => { T.nap = 0.86; }, c: [[0.2, 'Grabs an enemy'], [1.6, 'Walks it back, then boom', { cham: 0.5 }]], dai: 9 },
  chuato: { q: Q.hang(5, 200, 36, 8), cham: [4.6], truoc: (T) => { T.nap = 0.95; T.napDay = -99; T.de = 99; }, c: [[0.2, 'Drones circle the hive'], [4.6, 'Tap: SWARM — all drones fly out', { cham: 0.7 }]], dai: 9 },
  leviathan: { q: Q.nho().concat([{ k: 'khong_lo', s: 30, h: 30 }]), cham: [4.6], truoc: (T) => { T.nap = 0.95; T.napDay = -99; T.nuot = 99; }, c: [[0.2, 'Eats a small enemy'], [1.4, 'Each eat: ABYSS +1 (+4% damage)'], [4.6, 'Tap: water orbs rain on the path', { cham: 0.7 }]], dai: 9 },
  khoisinh: { kieu: 'phu', cham: [4.6], truoc: (T) => { T.sinhT = SKILLS.khoisinh.g(T) - 1.4; T.nap = 0.95; T.napDay = -99; }, ke: [[6, 'lien', 1], [8, 'canon', 2], [2, 'set', 3]], c: [[0.2, 'Raises the lowest neighbour'], [1.4, 'Lowest neighbour gets +1★', { ev: 'sao', cham: 0.6 }], [4.6, 'Tap: summons a 1★ next to it', { cham: 0.6 }]], dai: 9 },
  // Rồng Máy LÒ PHẢN ỨNG: nhịp phun tích nhiệt → 2,4 s ghép thật cùng HÀNG (+5×★ nhiệt bay vào) → 5,2 s chạm: DRAGON DIVE đốt hết nhiệt
  ronglua: { q: Q.nhom(6, 190, 20, 12), cham: [5.2], truoc: (T) => { T.nap = 0.95; T.napDay = -99; T.nhiet = 80; },
    them: [[2.4, (B, D, T) => { if (!T) return; const o = T.o % 5 ? T.o - 1 : T.o + 1; SKILLS.ronglua.ghepHangCot(B, o, Math.max(3, T.sao), null, null); }]],
    c: [[0.2, 'Every beam tick that hits builds HEAT (+damage)'], [2.4, 'Merge in its row or column: +5 × ★ heat', { cham: 0.6 }], [5.2, 'Tap: DRAGON DIVE burns ALL heat', { cham: 0.7 }]], dai: 9.4 },
  mana: { kieu: 'phu', mana: 1, manaDau: 0, truoc: (T) => { T.nap = 0.8; }, c: [[0.2, 'Does not shoot'], [1.2, (T) => 'Makes mana every ' + SKILLS.mana.ky(T) + 's', { ev: 'mana', cham: 0.6 }]] },
  chimang: { may: [2.0, 3.6, 'ke'], c: [[0.2, 'Gives 4 neighbours crit chance'], [2.0, 'Crits deal double damage', { cham: 0.5 }]] },
  radar: { c: [[0.2, 'Speeds up 4 turrets around it'], [2.0, (T) => 'Each gets +' + sdBuf(T) + ' fire rate', { cham: 0.4 }]] },
  lanhgia: { c: [[0.2, 'Neighbours’ shots also slow'], [1.6, 'Slow spreads to every target', { cham: 0.5 }]] },
  khuech: { c: [[0.2, 'Buffs Attack turrets around it'], [2.0, (T) => 'Same enemy again: up to +' + Math.round(HOTRO.hd(T, 'amp', SKILLS.khuech.buoc(T) * SKILLS.khuech.max(T)) * 100) + '% damage', { cham: 0.4 }]] },
  tuthan: { q: Q.nho().concat(Q.dong(6, 0.6, 2, 'nho', 1.5)), may: [2.2, 3.6, 'ke'], c: [[0.2, 'Neighbours may kill at once'], [2.2, 'Low-HP enemies die at once', { ev: 'kill', cham: 0.6 }]] },
  // ---------- vàng mới (vangmoi1.js / skills7.js) ----------
  // Lửa Thập Tự (luật 08/11 — Ember RỜI BÀN truyền lửa theo hàng/cột của CHÍNH nó): kéo Ember ô 7 (3 lửa) vào ô 8 (1 lửa), cùng sao → cả 2 rời bàn:
  //   ô 6 (chung hàng với cả 7 và 8) 1 → 1 + 3 + 1 = 5 · ô 3, 13 (cột của ô 8) +1: 1 → 2, 7 → 8 · ô 11 không chung đường → không nhận.
  //   Ụ ra ở ô 8 (bộ bài chỉ Relay) không nhận, = max(★, 3 + 1) = 4.
  //   sdLuaLien: số lửa TO dưới mỗi Relay, lúc ghép mũi tên chạy dọc hàng + cột từ ô 8, "+N" trên ụ nhận, "✗" trên ô 11 (lệch hàng/cột)
  lualien: { kieu: 'ghep', ke: [[8, 'lualien', 's'], [6, 'lualien', 's'], [3, 'lualien', 's'], [13, 'lualien', 's'], [11, 'lualien', 's']], keo: [2.5, 7, 8], so: { o: 13, k: 'dmg' },
    truoc: (T, B) => { B.deck = ['lualien']; if (T) T.lc = 3; if (B.t[8]) B.t[8].lc = 1; if (B.t[13]) B.t[13].lc = 7; for (const o of [3, 6, 11]) if (B.t[o]) B.t[o].lc = 1; },
    them: [[2.4, (B) => { SD.lcCu = {}; for (const X of B.t) if (X && X.id === 'lualien') SD.lcCu[X.o] = X.lc || 0; }]],
    ve: (x, B) => sdLuaLien(x, B),
    c: [[0.2, 'Number = flames on each Relay'], [1.3, 'Merge two same-star Embers'], [2.5, 'Both flames go along the merge tile\'s row + column', { cham: 0.6 }], [3.9, 'Not in that row or column: nothing'], [5.0, 'Each flame: +8% damage, +0.4% crit, +4% crit damage'], [6.2, 'Max 70 flames (more at LV11+)']], dai: 9 },
  // Quantum Choir: thêm ụ cùng sao (trùng) và khác sao (không tính) — chỉ số sát thương trước → sau
  hopca: { q: Q.hang(4, 180, 40, 8), ke: [[6, 'lien', 's'], [8, 'canon', (s) => s > 1 ? s - 1 : 2]],
    them: [[2.0, (B, D, T) => { if (T) sdThem(B, [[2, 'set', T.sao], [12, 'bang', T.sao]], T, 'dmg'); }], [4.0, (B, D, T) => { if (T) sdThem(B, [[3, 'sungluc', T.sao > 1 ? T.sao - 1 : 2]], T, 'dmg'); }]],
    c: [[0.2, (T) => 'Touching ' + T.sao + '★ turrets = Harmony'], [2.0, 'Each Harmony: +25% damage', { cham: 0.6 }], [3.0, '3 Harmony: +30% fire rate'], [4.0, 'Other ★ or far away: no', { cham: 0.4 }]] },
  // Fusion Archive: 2 ghép thường bất kỳ → +1 điểm lưu mỗi lần; cuối: Archive + Archive → 3 xung nổ
  luutru: { kieu: 'ghep', ke: [[2, 'lien', 1], [3, 'lien', 1], [11, 'canon', 1], [12, 'canon', 1], [8, 'luutru', 's']], keo: [[1.6, 3, 2, { o: 7, k: 'dmg' }], [3.2, 12, 11, { o: 7, k: 'dmg' }]],
    truoc: (T, B) => { if (B.t[8]) B.t[8].st.da = true; }, // Archive thứ 2 hoá đá → điểm luôn bay vào ụ đang xem
    c: [[0.2, 'Every real merge: +1 charge'], [1.6, 'It flies to one Archive: +1% damage', { cham: 0.5 }], [3.2, 'Any turret merge counts'], [4.6, 'Rewards at 10 / 20 / 30 / 40 charges']], dai: 8 },
  // Hero Foundry: ghép → ô ngẫu nhiên thật (VM1.rng) thành ô Anh hùng; hiện tốc bắn trước → sau của ụ đứng trên ô
  xuonganh: { kieu: 'ghep', ke: [[2, 'lien', 's'], [3, 'set', 's'], [6, 'canon', 's'], [12, 'sungluc', 's']],
    them: [[3.2, (B) => { const o = B._hf, N = o != null && B.t[o]; if (N) SD.soDoi = { o, a: Math.round(tocU(N) / (1 + (B.hero && B.hero[0] ? B.hero[0].toc : 0)) * 100) / 100, b: sdSo(N, 'toc'), ic: 'ic_toc', t0: performance.now() }; }]],
    c: [[0.2, 'Merge two Hero Foundries'], [2.5, 'That cell becomes a Hero tile', { cham: 0.6 }], [4.0, (T) => 'Hero tile: +' + Math.round(SKILLS.xuonganh.TOC * SKILLS.xuonganh.he(T) * 100) + '% fire rate for 25s']] },
  // Blood Circuit: kéo lên ụ CÙNG sao (+1 Vamp) rồi lên ụ KHÁC sao (tốn 2 Vamp → xung máu); không bao giờ tự lên sao
  mauhut: { kieu: 'gDB', ke: [[8, 'lien', 's'], [3, 'mauhut', 's'], [2, 'lien', (s) => s > 1 ? s - 1 : 2]], keo: [[2.5, 7, 8]], truoc: (T) => { if (T) { T.mau = 5; T.mh = null; T.rite = null; } },
    them: [[3.0, (B, D, T) => { if (T && T.mh) T.mh.con = Math.min(T.mh.con, 1.4); }], [6.0, (B, D, T) => { if (T && B.t[T.o] === T) { T.mau = Math.max(T.mau || 0, 10); SKILLS.mauhut.chuDong(G, B, T); } }]],
    c: [[0.2, 'Drag onto one of your turrets'], [2.5, 'Marked: both keep working', { cham: 0.5 }], [4.4, 'Eaten: +5 Blood per ★', { cham: 0.6 }], [6.0, 'Tap with 10 Blood: Blood Rite', { cham: 0.6 }], [7.2, 'Neighbour: +30% damage, +15% fire rate']], dai: 9 },
  // Hex Saboteur: PvP thu nhỏ — lượt nguyền chọn sẵn để cú gieo thật trúng (ca may mắn), chú thích nói đúng xác suất
  nguyenrua: { kieu: 'ghep', doi: [[4, 'canon', 3], [9, 'tia', 4], [14, 'set', 3]], truoc: (T, B) => sdHexTrung(B, T, 8),
    c: [[0.2, 'Merge two Hex Saboteurs'], [2.5, 'A hex flies at a rival turret', { cham: 0.6 }], [4.0, (T) => Math.round(SKILLS.nguyenrua.p(T) * 100) + '% chance: the rival turret loses 1★', { ev: 'sao', cham: 0.6 }], [5.2, 'Co-op: an ally turret gets +1★']] },
  // Sanctum: vào bàn lúc 1.8 s (triệu hồi thật → sinh/moiDen) → tẩy băng 2 ụ kề + khiên 1 lần; rồi hào quang sát thương
  thanhdia: { kieu: 'ht', ke: [[2, 'lien', 's'], [6, 'canon', 's'], [8, 'lien', 's'], [12, 'canon', 's']], dong: [2, 8], truoc: (T, B) => { if (T) B.t[T.o] = null; },
    them: [[1.8, (B, D, T) => { if (!T || B.t[7]) return; const N = sinhU(taoU(B, 'thanhdia', T.sao, 7)); N.goc = -Math.PI / 2; B.t[7] = N; VX.trieu(N); }]],
    c: [[0.2, 'Two turrets are frozen'], [1.8, 'Sanctum arrives: cleans them', { ev: 'moi', cham: 0.7 }], [3.2, 'Neighbours get a 1-hit shield'], [4.6, (T) => 'Attack neighbours +' + sdBuf(T) + ' damage', { cham: 0.4 }]] },
  // Prism Thief (08/11 lần 2 — HỢP THỂ): 4 màu cạnh nhau → vuốt → 1 mặt nạ 4 màu ở ô cuối (13) → 3 Prism mới 6/7/8 → vuốt lại qua mặt nạ → hợp thể 2
  //   kieu 'tc' (không có cú kéo-ghép mặc định); vuốt = gọi đúng luật SKILLS.bienmau.mach (cùng code trận)
  bienmau: { kieu: 'tc', q: Q.hang(4, 180, 40, 8), ke: [[6, 'bienmau', 's'], [8, 'bienmau', 's'], [13, 'bienmau', 's']],
    truoc: (T, B) => { const m = [[6, 0], [7, 1], [8, 2], [13, 3]]; for (const [o, q] of m) { const X = B.t[o]; if (X) { X.pm = q; X.pms = 2; X.pf = 0; X.pmk = null; } } },
    them: [[2.8, (B) => { SKILLS.bienmau.mach(B, [6, 7, 8, 13], true); }],
      [4.6, (B) => { for (const [o, q] of [[6, 0], [7, 1], [8, 2]]) if (!B.t[o]) { const N = taoU(B, 'bienmau', SD.sao, o); N.pm = q; N.pms = 1; N.goc = -Math.PI / 2; B.t[o] = N; VX.trieu(N); } }],
      [6.0, (B) => { SKILLS.bienmau.mach(B, [6, 7, 8, 13], true); }]],
    c: [[0.2, 'Red kills, gold mana, blue freezes, green crits'], [1.4, '4 different colours side by side'], [2.8, 'Swipe all 4: they fuse into one mask', { cham: 0.7 }], [4.6, 'The mask has all 4 colours'], [6.0, 'Fuse again: fusion 2, stronger', { cham: 0.7 }], [7.4, 'Every fusion: more damage, no limit']], dai: 9.6 },
};
// ---------- chỉ huy (Ma vương): chạm nút → kỹ năng thật (dungMV) ----------
const SD_MV = {
  hero: { ke: [[6, 'lien', 2], [8, 'canon', 2], [12, 'set', 1]], q: Q.hang(4, 180, 40, 8), mana: 1, manaDau: 60, mvT: 2.4,
    c: [[0.2, 'Reinforce: free turrets'], [1.4, 'Tap the commander'], [2.5, 'Two free 1★ turrets appear', { ev: 'moi', cham: 0.7 }], [5.0, 'Cost doubles each use']] },
  dahlia: { ke: [[2, 'lien', 3], [6, 'canon', 3], [7, 'sungluc', 3], [8, 'set', 3], [12, 'bang', 3]], q: Q.hang(3, 170, 46, 9).concat(Q.dong(14, 0.75, 9, 'bo', 1.2)), mana: 1, manaDau: 60, mvT: 2.6, dai: 13.6, glow: 1,
    c: [[0.2, 'Normal damage numbers'], [1.6, 'Tap the commander'], [2.7, 'Whole board: +100% damage', { cham: 0.7 }], [5.0, 'Every damage number doubles'], [8.4, 'Rage lasts 10 seconds']] },
  eve: { ke: [[2, 'lien', 3], [6, 'canon', 3], [7, 'sungluc', 4], [8, 'set', 3], [12, 'bang', 3]], dong: [6, 8], da: [12], q: Q.trum('freezer', 3.4, 90), mvT: 2.0, dai: 9.4,
    c: [[0.2, 'Debuffs lock your turrets'], [1.1, 'Tap the commander'], [2.1, 'Freeze, stone & burn cleared', { cham: 0.7 }], [3.4, 'The Boss uses a skill…'], [4.8, 'Holy Shield blocks it', { ev: 'chan', cham: 0.7 }]] },
};
// chỉ huy mới (08/11): clip dùng kỹ năng THẬT (dungMV tự chọn đích như AI — cùng đích người chơi sẽ chạm)
Object.assign(SD_MV, {
  tech: { ke: [[6, 'lien', 1], [7, 'sungluc', 2], [8, 'set', 1], [12, 'canon', 4]], q: Q.hang(4, 180, 40, 7), mana: 1, manaDau: 60, mvT: 2.4, dai: 9.4,
    c: [[0.2, 'Quick Tune: low-star turrets'], [1.4, 'Tap the commander'], [2.5, '1★ and 2★ Attack turrets: 40% faster', { cham: 0.7 }], [5.6, 'The 4★ turret gets nothing'], [7.6, 'Lasts 10 seconds']] },
  tide: { ke: [[6, 'lien', 2], [8, 'set', 2]], q: Q.hang(5, 190, 34, 9), mana: 1, manaDau: 60, mvT: 2.2, dai: 9.0,
    c: [[0.2, 'Enemies rush down the path'], [1.2, 'Tap the commander'], [2.3, 'Drag Net: 25% slower on your path', { cham: 0.7 }], [5.2, 'Bosses: only 12% slower'], [7.2, 'Lasts 6 seconds']] },
  twin: { ke: [[6, 'lien', 3], [8, 'lien', 3], [12, 'canon', 2]], q: Q.hang(4, 180, 40, 9), mana: 1, manaDau: 60, mvT: 2.6, dai: 10.4,
    c: [[0.2, 'Two 3★ twins: same type, same star'], [1.5, 'Tap the commander, then a twin'], [2.7, 'Both twins: +60% damage', { cham: 0.7 }], [5.6, 'Keep them, or merge them?'], [7.8, 'Merging either twin ends the buff']] },
  hawk: { ke: [[6, 'lien', 2], [7, 'sungluc', 2], [8, 'set', 2], [2, 'canon', 2], [12, 'lien', 2]], q: Q.hang(4, 180, 40, 9), mana: 1, manaDau: 60, mvT: 2.6, dai: 10.0,
    c: [[0.2, 'Mix turret types in one cross'], [1.5, 'Tap the commander, then a cell'], [2.7, 'Row and column light up', { cham: 0.7 }], [4.8, '4 types: +80% damage'], [7.4, 'More types, more damage (max +100%)']] },
  weaver: { ke: [[1, 'lien', 4], [3, 'radar', 3], [11, 'chimang', 3], [7, 'set', 2]], q: Q.hang(4, 180, 40, 10), mana: 1, manaDau: 80, mvT: 2.6, dai: 10.4,
    c: [[0.2, 'Supports in its row and column, not next to it'], [1.5, 'Tap the commander, then your main turret'], [2.7, 'Each Support links to it', { cham: 0.7 }], [5.0, 'Each link: +damage and +10% speed'], [7.6, 'A moved or frozen Support breaks its link']] },
});
function sdKichBanMV(mv) {
  const r = Object.assign({}, SD_MV[mv]), d = MAVUONG[mv];
  r.kieu = 'mv'; r.o = null; r.ke = (r.ke || []).slice(); r.c = r.c.slice(); r.dai = r.dai || 8.4;
  r.mo = mv === 'dahlia' ? '10s rage, ' + d.cd + 's cooldown' : d.gia + ' mana, ' + d.cd + 's cooldown';
  if (!r.q.some(q => q.t)) { const h = Math.max(3, ...r.q.filter(q => !q.trum).map(q => q.h)); r.q = r.q.concat(Q.dong(3, 0.9, h, 'bo', 3.2)); }
  return r;
}
// đòn đánh theo dạng (nút Stage 1/2/3)
const SD_GD = {
  overlord: ['Silent charge, no shots', 'Sparks jump to nearby enemies', 'Sky pillar plus aftershock arcs'],
  hopbi: ['Weak card shard poke', 'Three spinning bolts at once', 'Stops shooting: about to open'],
  tienhoa: ['Small egg', 'Growing egg', 'About to hatch'],
  lophanung: ['Cold aura, no shots', 'Aura deepens, freeze charging', 'Ice storm ready: tap to freeze'],
  soi: ['(no Pup stage)', 'Normal: one barrel, 1 shot every 1.8s, splash 40%', 'Awakened: 3-shot volley every 1.2s, always crits, splash 50%'],
  orbital: ['Standby: no shots', 'Uplink: 2+ Orbitals', 'Awake: drops bombs on enemies'],
  cuongno: ['Normal yellow tracers', 'Rage: hotter, faster rounds', 'Frenzy: twin rounds, fire bursts'],
  ngoisao: ['Small star shards', 'Star shards fly in pairs', 'Comets, and meteors every 5th'],
  lienket: ['Hollow ring bolt', 'Bolt drags a chain tether', 'Chain lashes a 2nd enemy'],
  dongbo: ['No same-star Attack turret', 'Synced: same-star turrets glow', 'Full sync: 3+ matched'],
  hydra: ['1–3 heads fire a chain of shots', '4–6 heads: a longer chain', '7 heads: tap the card for a machine gun'],
  cuuvi: ['Straight foxfire orb', 'Foxfire curls with flame trail', 'Blue foxfire bursts in rings'],
  ngaithoigian: ['Piercing clock-hand dart', 'Dart stamps a slowing clock', 'Pierces the line, then echoes'],
  ronglua: ['Hatchling: thin orange fire beam', 'Wyrm / Armored: thicker HEART CORE beam (blue flame from 5★)', 'Inferno: white twin beams'],
  luoicheo: ['Diagonal damage buff', 'Buffed hits spark teal rings', 'Every 3rd shot shows an echo (visual only)'],
  cobac: ['Slot gun: spins 3 reels on arrival', 'HIGH ROLLER: a bigger coin gun', 'GRAND CASINO: the full casino'],
  chuato: ['1–3 drones circle the hive', 'More drones: a stronger volley', '7 drones: the full brood'],
  leviathan: ['Bubble shot with splash', 'Eats big enemies too', 'Huge bubbles, eats flyers too'],
  combo: ['Warm-up: a plain core', 'On a roll: spinning rings', 'Overdrive: red-hot core'],
  pandora: ['Locked vault', 'Lid ajar, colours leak', 'Open: the 7★ merge fires 2 effects'],
  nemesis: ['Scales: verdict every 10 hits', 'Scythe: verdict every 10 hits', 'Verdict every 10 hits'],
  nhatthuc: ['Dusk: day and night swap', 'Corona: brighter swaps', 'Both modes on every swap'],
  loren: ['Damage Anvil', 'Speed Anvil', 'Max 14 stacks'],
  guongcong: ['One mirror pane', 'Twin mirror panes', 'Shard halo reflects twice'],
  marionette: ['Strings grab small enemies', 'Golden hand grabs big ones', 'Controls two puppets at once'],
  khoisinh: ['Raises the lowest neighbour', 'Neighbours get +15% damage', 'Up to 7 gifts, then it breaks'],
  lualien: ['Ember: under 10 flames', 'Kindled: 10 to 49 flames', 'Blazing: 50+ flames'],
  luutru: ['Empty shelves: under 10 charges', 'Filing: 10 to 29 charges', 'Grand archive: 30+ charges'],
};
// dòng số liệu cuối vòng (khi sk.mo là trạng thái tạm, không phải số liệu theo sao)
const SD_MO = {
  cuongno: (T) => 'Frenzy +' + Math.round(SKILLS.cuongno.them(T) * 100) + '% fire rate',
  lienket: () => '+40% damage per link',
  doc: (T) => { const m = /Every ([\d.]+)s marks (\d+)/.exec(SKILLS.doc.mo(T)); return m ? 'Marks ' + m[2] + (m[2] > 1 ? ' enemies' : ' enemy') + ', every ' + m[1] + 's' : 'Marks the first enemy'; },
  khoathoigian: (T) => { const m = /Every ([\d.]+)s locks the lead non-boss enemy ([\d.]+)s/.exec(SKILLS.khoathoigian.mo(T)); return m ? 'Lock ' + +m[2] + 's, every ' + +m[1] + 's' : 'Locks 1 enemy, then it bursts'; },
  dongbo: (T) => 'Every ' + T.sao + '★ Attack turret +' + Math.round(SKILLS.dongbo.v(T) * 100) + '% damage',
  hopbi: (T) => 'Opens into ' + sdHop(T.sao) + '★',
  tienhoa: (T) => SKILLS.tienhoa.chay(T) ? 'Burnt egg: tap for +20 mana' : T.sao >= 6 ? 'Burns into a 7★ egg' : 'Hatches into ' + Math.min(7, T.sao + 1) + '★',
  ngoisao: () => 'Every 10★ faster · every 50★ more damage',
  soi: (T) => Math.round(SKILLS.soi.tiLe(G.ban[T.ban]) * 100) + '% Awakened: always crits',
  guongcong: (T) => 'Resist ' + Math.round(HOTRO.hd(T, 'khang', SKILLS.guongcong.khang(T)) * 100) + '% · mirror every ' + SKILLS.guongcong.h(T) + 's',
  combo: (T) => 'Each combo: +' + Math.round(SKILLS.combo.c(T) * 100) + '% damage',
  cuuvi: (T) => '9 foxfires ×' + SKILLS.cuuvi.heSo(T).toFixed(1),
  railgun: () => 'Row 3/4/5: +25/65/200% · column 2/3: +35/150%',
  vughep: (T) => Math.round(knThe(G.ban[T.ban], 'vughep')) + '% Golden: target +2★',
  loren: (T) => (T.dang === 'toc' ? '+2% fire rate' : '+3% damage') + ' per stack, max 14',
  orbital: (T) => 'Merge: every Orbital awakens ' + SKILLS.orbital.dai(G.ban[T.ban]) + 's',
  nangluong: () => '+100% damage per 120 mana',
  mana: (T) => '+' + SKILLS.mana.luong(T) + ' mana every ' + SKILLS.mana.ky(T) + 's',
  lien: (T) => tocU(T).toFixed(1) + ' shots per second',
  phun: (T) => tocU(T).toFixed(1) + ' shots per second',
  xucxac: (T) => 'Damage ' + Math.round(dmgU(T) * 0.03) + '–' + Math.round(dmgU(T) * 3) + ' per shot',
  sungluc: (T) => 'Damage ' + Math.round(dmgU(T)) + ' per shot',
  nam: (T) => 'Damage ' + Math.round(dmgU(T)) + ' per punch',
  bomhen: (T) => 'Blast: +' + +(SKILLS.bomhen.yw(T) * 100).toFixed(2) + '% damage taken ' + SKILLS.bomhen.yeuDai(T) + 's',
  tudo: (T) => 'Any turret · star = average, rounded up · ' + Math.round(tdThuong(G.ban[T.ban]) * 100) + '%: +1★',
  mimic: (T) => 'New turret: +' + Math.round(knThe(G.ban[T.ban], 'mimic')) + '% attack, 8s',
  dichchuyen: () => 'Swap with a same-star turret',
  epxung: (T) => '+' + +knThe(G.ban[T.ban], 'epxung').toFixed(1) + '% fire rate per drag',
  vughep: () => 'Target +1★, keeps its type · 2 Merge Kings → Merge King +1★',
  saochep: (T) => 'Copy has ' + Math.round(heSaoChep(G.ban[T.ban]) * 100) + '% power',
  sinhdoi: (T) => Math.round(knThe(G.ban[T.ban], 'sinhdoi') || 10) + '% chance the twin is +1★',
  pandora: () => 'Merge: 1 of 6 vault effects',
  kepha: (T) => { const n = 1 + Math.floor(T.sao / 2); return 'Merge: slows ' + n + ' rival turret' + (n > 1 ? 's' : ''); },
  xaotron: (T) => 'Merge: shuffles ' + (1 + Math.floor(T.sao / 2)) + ' rival turrets',
  nhieusong: (T) => 'Merge: jams ' + SKILLS.nhieusong.n({ sao: Math.min(7, T.sao + 1) }) + ' rival turrets',
  cauvong: (T) => 'Neighbours +' + Math.round(SKILLS.cauvong.k(T) * 100) + '% vs enemies on it',
  ngaithoigian: (T) => 'Enemies slow up to ' + Math.round(SKILLS.ngaithoigian.sMax(T) * 100) + '%',
  hydra: (T) => T.sao + (T.sao > 1 ? ' heads' : ' head') + ', ' + Math.round(SKILLS.hydra.vien(T) * 100) + '% damage each',
  cobac: () => 'Pair +1 · 3 of a kind: JACKPOT +2 all',
  chuato: (T) => 'Up to ' + T.sao + ' drones',
  leviathan: () => 'ABYSS: +4% damage each, no cap',
  khoisinh: (T) => '+1★ to a neighbour every ' + SKILLS.khoisinh.g(T) + 's',
  ronglua: (T) => SKILLS.ronglua.tenDang(T) + ' · heat ' + Math.floor(T.nhiet || 0) + ' (+' + Math.round((T.nhiet || 0) * SKILLS.ronglua.NHIET_ST * 100) + '% damage)',
  anhsang: (T) => 'Free 1★ turret every ' + SKILLS.anhsang.ky(T).toFixed(0) + 's',
  haoquang: (T) => 'Tap: team barrier ' + SKILLS.haoquang.tg(T) + 's',
  laser: (T) => 'Beam ramps to ×4 over 3s',
  mortar: (T) => 'Damage ' + Math.round(dmgU(T)) + ', 46 px splash',
  no5: (T) => 'Damage ' + Math.round(dmgU(T)) + ' per shot',
  lualien: (T) => 'Each flame +8% damage, no cap',
  canon: (T) => 'Each stack +' + Math.round(SKILLS.canon.moiChong(T) * 100) + '% damage',
  drone: (T) => '1 drone per cell, +' + Math.floor(T.sao / 3) + ' bonus',
  hopca: () => '+25% damage per Harmony, max 4',
  luutru: (T) => '+1% damage per charge, max ' + SKILLS.luutru.tran(T),
  xuonganh: (T) => 'Hero tile: +' + Math.round(SKILLS.xuonganh.TOC * SKILLS.xuonganh.he(T) * 100) + '% fire rate, 25s',
  mauhut: () => 'Eat a turret: 5 Blood per ★',
  nguyenrua: (T) => 'Hex chance ' + Math.round(SKILLS.nguyenrua.p(T) * 100) + '%, 8s team cooldown',
  bienmau: (T) => (SKILLS.bienmau.n(T) ? 'Spectrum prism · fusion ' + SKILLS.bienmau.n(T) : SKILLS.bienmau.TEN[SKILLS.bienmau.mau(T)] + ' prism') + ' · stacks max ' + SKILLS.bienmau.tran(T),
};
// kỹ năng chủ động mở từ 3★
const SD_KHOA3 = ['chuato', 'leviathan', 'khoisinh', 'ronglua', 'ngaithoigian'];
const sdKhoa = () => SD_KHOA3.includes(SD.id) && SD.T && SD.T.sao < 3;
// % buff ụ hỗ trợ trao cho 1 ụ kề (đọc từ nguồn buff thật)
function sdBuf(T) {
  const B = G.ban[T.ban]; let v = 0;
  for (const N of B.t) if (N && N.nguon) for (const n of N.nguon) if (n.T === T) v = Math.max(v, n.v);
  return Math.round(v * 100) + '%';
}

// kiểu kịch bản mặc định theo dữ liệu kỹ năng
function sdKieu(id) {
  const sk = SKILLS[id];
  if (sk.hoTro && SUP_LOAI[id] && sk.vai === 'ht') return 'ht';
  if (sk.ghepDB) return 'gDB';
  if (id === 'mimic' || id === 'tudo' || sk.ghep) return 'ghep';
  if (!sk.dmg) return 'phu';
  return 'tc';
}
// kịch bản đầy đủ (ghép mặc định + riêng)
function sdKichBan(id) {
  const r = Object.assign({}, SD_K[id] || {}), sk = SKILLS[id], k = r.kieu || sdKieu(id);
  r.kieu = k; r.o = r.o != null ? r.o : 7; r.ke = (r.ke || []).slice(); r.dai = r.dai || 8.4;
  const ten = (TEXT.turret[id] || {}).name || id;
  if (k === 'ht') {
    if (!SD_K[id] || !SD_K[id].ke) for (const [i, o] of (sk.huong && sk.huong({ id, sao: 1 }).every(([a, b]) => a && b) ? CHEO4 : KE4).entries()) r.ke.push([o, i % 2 ? 'canon' : 'lien', 's']);
    r.q = r.q || Q.hang(4, 190, 40, 9); r.buff = 1;
  } else if (k === 'ghep' || k === 'gDB') {
    const them = (o, x, ss) => { if (o !== r.o && !r.ke.some(q => q[0] === o)) r.ke.push([o, x, ss]); };
    if (!r.keo) {
      if (k === 'ghep') them(8, id === 'mimic' ? (r.ban || 'canon') : id, 's');
      else them(8, r.ban || 'lien', r.saoBan || 's');
      r.keo = k === 'gDB' && r.keoNguoc ? [2.5, 8, 7] : [2.5, 7, 8];
    }
    them(2, 'lien', 2); them(6, id === 'canon' ? 'tia' : 'canon', 1); // clip Pháo La Bàn: ụ đệm khác loại (Pháo đệm làm rối chữ hướng)
    r.q = r.q || Q.hang(4, 180, 40, 8);
  } else if (k === 'phu') {
    if (!r.ke.length) { r.ke.push([6, 'lien', 's']); r.ke.push([8, 'canon', 's']); }
    r.q = r.q || Q.hang(4, 180, 40, 8);
  }
  r.q = r.q || Q.hang(3, 175, 50, 4);
  // giữ cảnh có quái tới cuối vòng: thêm 2 con vào từ cổng phải (trừ kịch bản tự sinh theo giờ)
  if (!r.q.some(q => q.t)) { const h = Math.max(3, ...r.q.filter(q => !q.trum).map(q => q.h)); r.q = r.q.concat(Q.dong(3, 0.9, h, 'bo', 3.2)); }
  if (!r.c) r.c = [[0.2, sdNgan((TEXT.turret[id] || {}).skill || ten)]];
  r.c = r.c.slice();
  // dạng ép (1/2/3): câu đầu = đòn đánh của dạng đó
  if (SD.gd && laGrow(id)) r.c[0] = [0.2, (SD_GD[id] || [])[SD.gd - 1] || 'Stage ' + SD.gd + ' attack', { dau: 'Stage ' + SD.gd }];
  if (k === 'ghep' && !r.c.some(c => /merg|drag|feed/i.test(typeof c[1] === 'string' ? c[1] : ''))) r.c.splice(1, 0, [1.5, 'Merge two of the same']);
  if (k === 'gDB' && !r.c.some(c => /merg|drag|feed/i.test(typeof c[1] === 'string' ? c[1] : ''))) r.c.splice(1, 0, [1.5, 'Drag onto a same-star turret']);
  return r;
}

// ===================================================== chạy =====================================================
SD.bat = function (id, sao, gd) {
  const mv = /^mv:/.test(id || '') ? id.slice(3) : null; // 'mv:<id>' = clip kỹ năng chỉ huy
  if (mv ? !MAVUONG[mv] || !SD_MV[mv] : (!SKILLS[id] || !G.rosterMap[id])) return;
  const doi = id !== this.id;
  this.id = id; this.mv = mv; this.sao = mv ? 1 : clamp(sao || 1, 1, 7); this.gd = mv ? 0 : gd || 0;
  if (doi || !G.ban.length) {
    const deck = mv ? ['lien', 'canon', 'set', 'bang', 'sungluc'] : [id].concat(['lien', 'canon', 'set', 'bang', 'sungluc'].filter(x => x !== id)).slice(0, 5);
    batDau('solo', deck, mv || 'hero');
    G.ktDeck = false; // bàn demo đặt ụ tuỳ ý — tắt bất biến bộ bài (game.js ktDeck)
  }
  G.cho = 1e9; G.wave = 6; G.tocDo = 1; G.dung = !!this.dungMuon;
  this.ks = mv ? sdKichBanMV(mv) : sdKichBan(id);
  this.xep();
};
SD.xep = function () {
  const id = this.id, s = this.sao, ks = this.ks;
  SD_RNG.s = 1234567 + s * 101 + (this.gd || 0) * 7;
  const deck = G.ban[0] ? G.ban[0].deck : [id];
  const B = taoBan(boCuc('solo').ban[0], 0, deck, this.mv || 'hero');
  G.ktDeck = false; G.ban = [B]; this.B = B; this.D = null; UI.keo = null;
  // bàn đối thủ thu nhỏ: 3 ụ ở cột phải (cùng toạ độ ô) — trận tự vẽ, kỹ năng PVP tác động thật lên nó
  if (ks.doi) {
    const D = taoBan(boCuc('solo').ban[0], 1, ['canon', 'set', 'bang', 'lien', 'tia'], 'hero'); D.ten = 'Rival'; D.ai = false; D.mana = 0;
    G.ban.push(D); this.D = D;
    for (const [o, x, ss] of ks.doi) { const N = sinhU(taoU(D, x, ss === 's' ? Math.min(s, 6) : ss, o)); D.t[o] = N; N.goc = -Math.PI / 2; N.gd = null; }
  }
  G.quai.length = 0; G.dan.length = 0; G.hu.length = 0; G.bay.length = 0; G.hang.length = 0; FX.reset(); VX.reset();
  UI.xemHT = null; UI.xemU = null;
  B.mana = ks.manaDau != null ? ks.manaDau : 999; B.gia = 10; G.tocDo = 1;
  const dat = (o, x, sao) => { const T = sinhU(taoU(B, x, sao, o)); B.t[o] = T; T.cd = 0.15 + 0.1 * (o % 3); T.goc = -Math.PI / 2; return T; };
  // ụ chính (ghép: chưa thể là 7★)
  const sChinh = Math.min(ks.saoMax || 7, ks.saoU || (ks.kieu === 'ghep' || ks.kieu === 'gDB' ? Math.min(s, 6) : s));
  this.T = this.mv ? null : dat(ks.o, id, sChinh);
  if (this.gd && this.T) this.T._epGd = this.gd;
  for (const [o, x, ss] of ks.ke) { const N = dat(o, x, ss === 's' ? sChinh : typeof ss === 'function' ? ss(sChinh) : ss); if (this.gd && x === id) N._epGd = this.gd; }
  if (ks.dong) for (const o of ks.dong) if (B.t[o]) B.t[o].st.bang = 99;
  if (ks.da) for (const o of ks.da) if (B.t[o]) B.t[o].st.da = true;
  for (const T of B.t) if (T) T.gd = null;
  if (ks.truoc) try { ks.truoc(this.T, B); } catch (e) { }
  if (ks.cd) B.mv.cd = MAVUONG[B.mv.id].cd;
  // máu quái: theo sát thương 1 phát của ụ chính (ụ không bắn: theo sức bắn cả bàn)
  let d1 = 0; try { if (this.T && SKILLS[id].dmg) d1 = dmgU(this.T); } catch (e) { }
  if (!(d1 > 0)) { for (const T of B.t) if (T) { try { if (SKILLS[T.id].dmg) d1 = Math.max(d1, dmgU(T)); } catch (e) { } } }
  this.d1 = Math.max(4, d1 || 20);
  this.hen = ks.q.map(q => Object.assign({}, q, { t: q.t || 0, xong: false }));
  this.t = 0; this.lap++; this.tRe = performance.now();
  this.da = new Set(B.t.filter(Boolean).map(T => T.uid));
  this.saoCu = {}; for (const X of G.ban) for (const T of X.t) if (T) { this.saoCu[T.uid] = T.sao; this.da.add(T.uid); }
  this.buffT = {}; this.chan = []; this.soDoi = null; this.pdr = null; this.mvXong = false;
  this.kq = []; this.soMana = []; this.moi = []; this.vet = {}; this.nhan = []; this.manaCu = B.mana; this.banCu = 0;
  this.cIdx = -1; this.chamDen = -1; this.cho = null; this.chamXong = {}; this.themXong = {};
  this.keoDs = ks.keo ? (Array.isArray(ks.keo[0]) ? ks.keo : [ks.keo]) : []; this.keoI = 0;
  this.ev = {};
  this.moSao = this.mv ? ks.mo : sdMoSao(id, this.T);
};
// dòng số liệu ở sao đang xem (cuối vòng): bảng ghi đè → SUP.chu → sk.mo
function sdMoSao(id, T) {
  let v = '';
  try { v = SD_MO[id] ? SD_MO[id](T) : SUP[id] && SUP[id].chu ? SUP[id].chu(T) : SKILLS[id].mo ? SKILLS[id].mo(T) : ''; } catch (e) { v = ''; }
  v = sdNgan(String(v).replace(/^On merge:\s*/i, 'Merge: ').replace(/\blead enemies\b/g, 'front enemies').replace(/\blead\b/g, 'first').replace(/\bvs exposed\b/i, 'vs broken armor'));
  return v;
}
SD.sinh = function (q) {
  if (q.trum) {
    const E = sinhTrum(q.trum, 0); E.s = q.s; E.max = E.hp = Math.round(this.d1 * q.h); E.knT = q.kn != null ? q.kn : 99; E.vao = 1;
    E.d = Object.assign({}, E.d, { v: 12 });
    [E.x, E.y, E.goc] = viTri(G.duong[0], E.s); return E;
  }
  const E = sinhQuai(q.k, 0, q.s, 1); E.vao = q.t ? 0 : 1;
  E.d = Object.assign({}, QUAI[q.k], { v: QUAI[q.k].v * 0.8 });
  E.max = E.hp = Math.max(1, Math.round(this.d1 * q.h));
  return E;
};
SD.tick = function (dt) {
  if (!this.id || !G.ban.length || !this.ks) return;
  const ks = this.ks, B = G.ban[0], T0 = this.T;
  this.t += dt;
  for (const q of this.hen) if (!q.xong && this.t >= q.t) { q.xong = true; this.sinh(q); }
  // chú thích hiện tại + quay chậm
  let ci = -1; for (let i = 0; i < ks.c.length; i++) if (this.t >= ks.c[i][0]) ci = i;
  if (ci !== this.cIdx) {
    this.cIdx = ci;
    const o = ks.c[ci] && ks.c[ci][2];
    this.cho = o && o.cham ? { ev: o.ev || null, cham: o.cham, t1: this.t + 2.5 } : null;
    if (this.cho && (!this.cho.ev || this.ev[this.cho.ev] >= this.t - 0.3)) { this.chamDen = this.t + this.cho.cham; this.cho = null; }
  }

  // việc theo giờ: kéo-ghép, chạm kỹ năng, thêm ụ…
  const kq = this.keoDs && this.keoDs[this.keoI]; // keo: [t, ô kéo, ô đích, so?] hoặc danh sách nhiều lần kéo (cách nhau ≥ 1,3 s)
  if (kq) {
    const a = B.t[kq[1]], b = B.t[kq[2]], t0 = kq[0] - 1.2;
    // kéo thật của trận (UI.keo): giữ 0,25 s → rê theo cung → thả lên ô đích
    if (this.t >= t0 && a && b) {
      const ca = B.o[a.o], cb = B.o[b.o], u = clamp((this.t - t0 - 0.3) / 0.85, 0, 1), e = u * u * (3 - 2 * u);
      const g = UI.keo && UI.keo.sd ? UI.keo : (UI.keo = { T: a, x: ca.x, y: ca.y, x0: ca.x, y0: ca.y, dang: false, sd: 1 });
      g.px = g.x; g.py = g.y;
      g.x = ca.x + (cb.x - ca.x) * e; g.y = ca.y + (cb.y - ca.y) * e - Math.sin(e * Math.PI) * 26; g.dang = this.t > t0 + 0.3;
    }
    if (this.t >= kq[0]) {
      this.keoI++; if (UI.keo && UI.keo.sd) UI.keo = null;
      const so = kq[3] || ks.so, N0 = so && B.t[so.o], v0 = N0 ? sdSo(N0, so.k) : null;
      if (a && b && hopLeGhep(a, b)) {
        const r = this.voiDoi(() => ghep(B, a, b));
        if (r && r.id === this.id) this.T = r; else if (B.t[kq[2]] && B.t[kq[2]].id === this.id) this.T = B.t[kq[2]]; else if (B.t[kq[1]] && B.t[kq[1]].id === this.id) this.T = B.t[kq[1]];
        const hp = G.hu.find(h => h.k === 'pandora'); if (hp && typeof PANDORA !== 'undefined') this.pdr = PANDORA[hp.chon[0]].ten;
        if (so) VX.hen(0.75, () => { const N = B.t[so.o]; if (N && v0 != null) this.soDoi = { o: so.o, a: v0, b: sdSo(N, so.k), ic: so.k === 'toc' ? 'ic_toc' : 'ic_dmg', t0: performance.now() }; });
      }
    }
  }
  if (ks.mvT != null && !this.mvXong && this.t >= ks.mvT) { // chạm nút chỉ huy → dùng kỹ năng thật (dungMV)
    this.mvXong = true; B.mv.cd = 0; if (B.mana < B.mv.gia) B.mana = B.mv.gia; this.manaCu = B.mana;
    const d0 = G.dung; G.dung = false; // demo có thể đang 'dừng' để xem — luật chỉ huy (chihuy.js) chặn dùng khi tạm dừng
    try { dungMV(B); } catch (e) { console.error(e); } G.dung = d0;
  }
  if (ks.cham) for (const tc of ks.cham) if (!this.chamXong[tc] && this.t >= tc) {
    this.chamXong[tc] = true;
    const T = this.T, sk = SKILLS[this.id];
    if (T && B.t[T.o] === T && sk.chuDong && !sdKhoa()) {
      T.nap = 1; try { sk.chuDong(G, B, T); } catch (e) { }
      const c = B.o[T.o]; if (!sk.theKich) this.tay = { x: c.x, y: c.y, t0: this.t, keo: null }; // Hydra: kỹ năng bật từ THẺ khay, không chạm ụ
    }
  }
  if (ks.them) ks.them.forEach(([tt, fn], i) => { if (!this.themXong[i] && this.t >= tt) { this.themXong[i] = true; try { this.voiDoi(() => fn(B, this.D, this.T)); } catch (e) { console.error(e); } } });
  // phát hiện sự kiện: bắn thứ N, mana tăng, sao tăng, ụ mới
  const T = this.T && B.t[this.T.o] === this.T ? this.T : null;
  if (T && T.banLan !== this.banCu) { this.banCu = T.banLan; this.phat('shot'); for (const n of [3, 5]) if (T.banLan % n === 0) this.phat('shot%' + n); }
  if (B.mana > this.manaCu + 0.5) {
    const n = Math.round(B.mana - this.manaCu);
    if (n < 400) { const c = B.o[(T || T0 || { o: 7 }).o]; const E = this.giet && G.t - this.giet.t < 0.05 ? this.giet.E : null; this.soMana.push({ x: E ? E.x : c.x, y: E ? E.y : c.y - 10, n, t0: performance.now() }); this.phat('mana'); }
  }
  this.manaCu = B.mana;
  for (const Bx of G.ban) for (const X of Bx.t) if (X) {
    if (!this.da.has(X.uid)) { this.da.add(X.uid); this.saoCu[X.uid] = X.sao; if (this.t > 0.3) { this.moi.push({ T: X, t0: performance.now(), k: 'moi' }); this.phat('moi'); if (Bx === B && X.id === this.id && !this.mv) this.T = X; } }
    else if (X.sao > this.saoCu[X.uid]) { this.moi.push({ T: X, t0: performance.now(), k: 'sao', n: X.sao }); this.saoCu[X.uid] = X.sao; this.phat('sao'); }
    else if (X.sao < this.saoCu[X.uid]) { this.moi.push({ T: X, t0: performance.now(), k: 'ha', n: X.sao }); this.saoCu[X.uid] = X.sao; this.phat('sao'); }
  }
  if (this.cho && this.t > this.cho.t1) { (this.thieu || (this.thieu = [])).push(this.cho.ev + '@' + this.cIdx); this.cho = null; }
  G.tocDo = this.t < this.chamDen ? 0.32 : 1;
  if (this.t >= ks.dai) this.xep();
};
// chạy fn như đang ở PVP (bàn đối thủ thu nhỏ) — chỉ trong lúc ghép / phép của kịch bản
SD.voiDoi = function (fn) {
  if (!this.D) return fn();
  const che = G.che; G.che = 'pvp';
  try { return fn(); } finally { G.che = che; }
};
function sdSo(T, k) { try { return k === 'toc' ? tocU(T).toFixed(1) + '/s' : String(Math.round(dmgU(T))); } catch (e) { return null; } }
SD.phat = function (ev) {
  this.ev[ev] = this.t;
  if (this.cho && (this.cho.ev === ev || (this.cho.ev === 'hit' && ev === 'kill'))) { this.chamDen = this.t + this.cho.cham; this.cho = null; }
};

// ===================================================== móc vào trận =====================================================
SD.moc = function () {
  const _trung = trung;
  trung = function (E, dmg, o) {
    const T = o && o.T !== undefined ? o.T : G.dangBan, song = !E.chet;
    const r = _trung(E, dmg, o);
    if (SD.ks && T && SD.T && (T === SD.T || (T.id === SD.id))) {
      if (song) { SD.kq.push({ E, t: SD.t, k: 0 }); if (SD.kq.length > 40) SD.kq.shift(); }
      SD.phat('hit');
    }
    return r;
  };
  const _chet = chet;
  chet = function (E, B) {
    const da = E.chet; _chet(E, B);
    if (!da && SD.ks) { SD.giet = { E, t: G.t }; const T = G.dangBan; if (T && SD.T && (T === SD.T || T.id === SD.id || (SD.ks.may && SD.ks.may[2] === 'ke'))) SD.phat('kill'); }
  };
  const _cap = capNhat;
  capNhat = function (dt) { _cap(dt); try { SD.tick(dt); } catch (e) { console.error(e); } };
  const _fx = FX.capNhat.bind(FX);
  FX.capNhat = function (dt) { return _fx(dt * (G.tocDo < 1 ? 0.45 : 1)); };
  // ụ mới (triệu hồi miễn phí, nhân bản, hộp mở…) rơi vào 3 cột giữa đang xem, không vào cột rìa bị làm mờ
  const _oTrong = oTrong;
  oTrong = function (B) { const a = _oTrong(B); if (!SD.ks || SD.ks.day) return a; const g = a.filter(i => i % 5 >= 1 && i % 5 <= 3); return g.length ? g : a; };
  REN.veNhanBan = function () { };
  // khiên chặn (Máy Khiên / Holy Shield / Hào Quang): đánh dấu để vẽ ảnh khiên lớn + chú thích chờ sự kiện 'chan'
  if (VX.chanKhien) { const _ck = VX.chanKhien.bind(VX); VX.chanKhien = function (B, T) { try { if (SD.ks && T) { SD.chan.push({ T, t0: performance.now() }); SD.phat('chan'); } } catch (e) { } return _ck(B, T); }; } // bàn đối thủ thu nhỏ: nhãn riêng ở cột phải (không dùng nhãn bàn PVP)
  const _ve0 = REN.ve0.bind(REN);
  REN.ve0 = function () { _ve0(); try { SD.veLop(REN.ctx); } catch (e) { console.error(e); } };
};

// ===================================================== lớp vẽ chú thích =====================================================
const SD_Y0 = 112, SD_CAO = 420; // khung cắt (toạ độ logic y 112…532) — khớp unitpage.js khungXem. Đường trên (y 173) + số sát thương bay lên nằm TRỌN trong khung;
// chú thích đặt ở ĐÁY khung (dưới đường dưới) để không che quái (trước: băng chữ ở y 175 đè đúng lên quái đường trên)
const SD_CY = SD_Y0 + SD_CAO - 22;
// ---------- vẽ bằng ẢNH (QUY-TAC-HINH.md): code chỉ đặt vị trí / xoay / phóng / mờ ảnh PNG + chữ số ----------
const SD_IC = { toc: 'ic_toc', dmg: 'ic_dmg', crit: 'ic_crit', cdmg: 'ic_crit', cham: 'ic_cham', chet: 'ic_chet', mana: 'ic_mana', khien: 'ic_khien', taylo: 'ic_taylo' }; // ký hiệu buff → ảnh icon có sẵn
const sdIm = (ten) => { try { return REN.img(ten); } catch (e) { return null; } };
function sdVe(x, ten, cx, cy, w, h, rot) {
  const im = sdIm(ten); if (!im) return false;
  h = h || w * im.height / im.width;
  if (rot) { x.save(); x.translate(cx, cy); x.rotate(rot); x.drawImage(im, -w / 2, -h / 2, w, h); x.restore(); }
  else x.drawImage(im, cx - w / 2, cy - h / 2, w, h);
  return true;
}
function sdKhung(x, ten, f, n, cx, cy, s) { // 1 khung của dải ảnh n khung ngang (fx_starup, fx_summon, fx_buff…)
  const im = sdIm(ten); if (!im) return false;
  const fw = im.width / n, k = clamp(Math.floor(f), 0, n - 1);
  x.drawImage(im, k * fw, 0, fw, im.height, cx - s / 2, cy - s / 2, s, s * im.height / fw); return true;
}
function sdChu(x, s, cx, cy, mau, px, canh) {
  x.font = '800 ' + px + 'px "TM Display", sans-serif'; x.textAlign = canh || 'center'; x.textBaseline = 'middle';
  x.lineJoin = 'round'; x.lineWidth = Math.max(2.5, px * 0.26); x.strokeStyle = 'rgba(8,10,14,.92)'; x.strokeText(s, cx, cy);
  x.fillStyle = mau; x.fillText(s, cx, cy);
}
// ngón tay: ảnh bàn tay ChatGPT chưa có (prompt trong docs/demo-hop-tuong/HINH-VE-CODE-AUDIT.md) — có ảnh thì đặt tên vào SD_TAY.
// Hiện dùng mũi tên ảnh duong_mui chỉ vào đầu ngón.
const SD_TAY = null; // vd. 'ui_tay'
SD.veNgon = function (x, X, Y, rot, an) {
  const s = an ? 0.88 : 1;
  if (SD_TAY && sdVe(x, SD_TAY, X + 10 * s, Y + 16 * s, 34 * s)) return;
  const r = rot == null ? Math.PI / 2 : rot, L = 20;
  x.save(); x.globalAlpha *= 0.95;
  sdVe(x, 'duong_mui', X - Math.cos(r) * L, Y - Math.sin(r) * L, 36 * s, 24 * s, r);
  x.restore();
};
SD.veLop = function (x) {
  if (!this.ks || !G.ban.length) return;
  const B = G.ban[0], k = REN.s * REN.dpr, now = performance.now(), ks = this.ks, m = this.mau();
  x.save(); x.setTransform(k, 0, 0, k, 0, 0); x.globalCompositeOperation = 'source-over';
  // 1) bàn 3×3: làm mờ 2 cột rìa (mặt nạ chức năng) — có bàn đối thủ thu nhỏ thì cột phải là bàn đối thủ
  if (!ks.day) {
    const toi = typeof PX !== 'undefined' && PX.mau('o_trong', '#0e1014'); // ô mờ = ảnh ô trống tô tối (thay fillRect vẽ code)
    if (toi) for (const c of (this.D ? [0] : [0, 4])) for (const h of [0, 5, 10]) { const a = B.o[c + h]; PX.ve(x, toi, a.x, a.y, B.cw, B.ch, 0, 0.62); }
    x.globalAlpha = 1;
    if (this.D) { const a = B.o[4], y = a.y - B.ch * 0.68; sdVe(x, 'ic_pvp', a.x - 28, y, 15); sdChu(x, this.D.ten || 'Rival', a.x - 18, y, '#ff8a80', 12, 'left'); }
  }
  const T = this.T && B.t[this.T.o] === this.T ? this.T : null;
  // 2) ụ chính: mũi tên ảnh chỉ xuống trong câu đầu
  if (T && this.cIdx <= 0 && this.t < 1.6) { const c = B.o[T.o]; this.veNgonChi(x, c.x, c.y - B.ch * 0.62 - 5 * Math.abs(Math.sin(now / 170)), 0.85); }
  // 3) mục tiêu đang ngắm: tâm ngắm ảnh phu_ngam
  if (T && T.muc && !T.muc.chet && SKILLS[this.id] && SKILLS[this.id].dmg && this.cIdx <= 0 && !ks.lien) { const r = (T.muc.d.co || 40) * 0.5 + 6; x.globalAlpha = 0.85; sdVe(x, 'phu_ngam', T.muc.x, T.muc.y, r * 2 + 4 * Math.sin(now / 140), 0, now / 900); x.globalAlpha = 1; }
  // 4) biểu tượng trạng thái trên quái (ảnh)
  for (const E of G.quai) if (!E.chet && E.vao > 0.5) {
    let ix = E.x + (E.d.co || 40) * 0.32, iy = E.y - (E.d.co || 40) * 0.42; const ds = [];
    if (E.chan > 0 || (E.cham > 0 && E.chamT > 0)) ds.push('ic_cham');
    if (E.docT > 0) ds.push('glyph/doc');
    if (E.yeu > 0 || E.cvT > 0 || E.fbT > 0 || E.azT > 0) ds.push('glyph/phagiap');
    for (const d of ds) { sdVe(x, d, ix, iy, 14); ix += 14; }
  }
  // 5) thứ tự trúng (chuỗi / nảy / nhiều nòng): số 1-2-3 trên quái trúng gần nhất
  if (ks.lien) {
    const da = []; for (const h of this.kq) if (this.t - h.t < 0.8 && !h.E.chet && !da.includes(h.E)) da.push(h.E); // 0.8 s: đủ lâu để đọc 1-2-3 (Tesla bắn ~1 phát/s)
    da.forEach((E, i) => sdChu(x, String(i + 1), E.x, E.y - (E.d.co || 40) * 0.58, '#ffffff', 17));
  }
  // 6) hỗ trợ: ký hiệu buff (ảnh ic_*) bật lên trên từng ụ được buff + %; khung buff (dải fx_buff) lúc vừa nhận
  if (ks.buff && T) {
    for (const N of B.t) if (N && N !== T && N.nguon) {
      const ng = N.nguon.filter(n => n.T === T); if (!ng.length) continue;
      const c = B.o[N.o], kk = ng[0].k, mau = BUFF[kk] ? BUFF[kk].mau : m;
      const t0 = this.buffT[N.uid] || (this.buffT[N.uid] = now), u = clamp((now - t0) / 260, 0, 1), nay = u < 1 ? 0.6 + 0.55 * Math.sin(u * Math.PI * 0.8) : 1;
      if (now - t0 < 900) sdKhung(x, 'fx_buff', (now - t0) / 150, 6, c.x, c.y, B.cw * 1.1);
      const y = c.y - B.ch * 0.5 - 2 * Math.sin(now / 300 + N.o);
      sdVe(x, SD_IC[kk] || 'ic_dmg', c.x - 12, y, 18 * nay);
      sdChu(x, '+' + Math.round(ng[0].v * 100) + '%', c.x + 2, y, mau, 12, 'left');
    }
  }
  // 7) ụ mới / ụ lên sao: dải ảnh fx_summon / fx_starup + mũi tên ảnh + nhãn
  this.moi = this.moi.filter(o => now - o.t0 < 1600);
  for (const o of this.moi) {
    const Bo = G.ban[o.T.ban]; if (!Bo || Bo.t[o.T.o] !== o.T) continue;
    const c = Bo.o[o.T.o], u = (now - o.t0) / 1600;
    if (u < 0.6 && o.k !== 'ha') sdKhung(x, o.k === 'sao' ? 'fx_starup' : 'fx_summon', u / 0.6 * 6, 6, c.x, c.y - B.ch * 0.12, B.cw * 1.15);
    x.globalAlpha = Math.min(1, (1 - u) * 3);
    this.veNgonChi(x, c.x, c.y - B.ch * 0.62 - 8 * Math.abs(Math.sin(now / 160)), 1);
    if (o.k === 'moi') sdChu(x, 'New', c.x, c.y + B.ch * 0.52, '#7dffb0', 12);
    if (o.k === 'sao') sdChu(x, o.n + '★', c.x, c.y + B.ch * 0.52, '#ffe46b', 13);
    if (o.k === 'ha') sdChu(x, o.n + '★', c.x, c.y + B.ch * 0.52, '#ff8a80', 13);
    x.globalAlpha = 1;
  }
  // 7a) khiên vừa chặn: ảnh khiên (sup_khien) bật lên trên ụ + chữ
  this.chan = (this.chan || []).filter(o => now - o.t0 < 2200);
  for (const o of this.chan) {
    const Bo = G.ban[o.T.ban]; if (!Bo) continue; const c = Bo.o[o.T.o], u = (now - o.t0) / 2200, nay = u < 0.1 ? 0.6 + u / 0.12 * 0.5 : 1.1 - Math.min(0.1, u);
    x.globalAlpha = Math.min(1, (1 - u) * 3); sdVe(x, 'sup_khien', c.x, c.y - 4, B.cw * 0.8 * nay); x.globalAlpha = 1;
  }
  // 7b) Cuồng nộ: vòng lửa ảnh (phu_lua) trên mọi ụ trong 10 s + '×2' bật lên lúc kích hoạt
  if (ks.glow && B.cuong > 0) for (const N of B.t) if (N) {
    const c = B.o[N.o], tt = this.t - ks.mvT;
    x.globalAlpha = 0.5 + 0.25 * Math.sin(now / 180 + N.o); sdVe(x, 'phu_lua', c.x, c.y, B.cw * 1.02); x.globalAlpha = 1;
    if (tt < 1.6) { x.globalAlpha = Math.min(1, (1.6 - tt) * 2); sdChu(x, '×2', c.x + B.cw * 0.3, c.y - B.ch * 0.42 - tt * 6, '#ff8a6a', 15); x.globalAlpha = 1; }
  }
  // 8) kéo-ghép: trận tự vẽ ụ đang kéo + ô hợp lệ (UI.keo); thêm ngón tay / mũi tên ở đầu ngón
  if (UI.keo && UI.keo.sd) { const g = UI.keo; this.veNgon(x, g.x, g.y, Math.atan2(g.y - (g.py || g.y0), g.x - (g.px || g.x0)) || 0, g.dang); }
  if (this.soDoi && now - this.soDoi.t0 < 3200) { // chỉ số trước → sau (ép xung, lò rèn…)
    const o = this.soDoi, Bo = G.ban[0], N = Bo.t[o.o]; if (N) { const c = Bo.o[o.o], u = clamp((now - o.t0) / 220, 0, 1); x.globalAlpha = u * Math.min(1, (3200 - (now - o.t0)) / 300); sdVe(x, o.ic, c.x - 54, c.y + B.ch * 0.56, 16); sdChu(x, o.a + ' → ' + o.b, c.x - 44, c.y + B.ch * 0.56, '#7dffb0', 13, 'left'); x.globalAlpha = 1; }
  }
  // 9) chạm kỹ năng chủ động: ngón tay + vòng ảnh nở ra
  if (ks.cham && !sdKhoa()) for (const tc of ks.cham) if (this.t > tc - 0.9 && this.t < tc + 0.5 && T) {
    const c = B.o[T.o], u = this.t < tc ? 0 : (this.t - tc) / 0.5;
    if (u > 0) { x.globalAlpha = 1 - u; sdVe(x, 'fx_vong_lv', c.x, c.y, 24 + 70 * u); x.globalAlpha = 1; }
    this.veNgon(x, c.x, c.y - (this.t < tc ? 6 * Math.abs(Math.sin(now / 130)) : 0), Math.PI / 2, u > 0);
  }
  // 10) chỉ huy: nút kỹ năng (ảnh nút + chân dung) ở cột phải + ngón tay chạm
  if (this.mv) this.veNutMV(x, B, now);
  // 11) đồng hồ đếm ngược trên ụ (Hộp Bí Ẩn / Tiến Hoá…)
  if (ks.dem && T) { let r = 0; try { r = ks.dem(T); } catch (e) { } if (r > 0 && r < 9.5) { const c = B.o[T.o], n = Math.ceil(r), f = 1 - (n - r); sdChu(x, String(n), c.x, c.y - B.ch * 0.7, '#e6c8ff', Math.round(18 + 10 * f)); } }
  // 12) mana: ô đếm (ảnh ui_gia + ui_mana) góc phải trên + số bay về
  if (ks.mana) {
    const mx = 384, my = SD_Y0 + 20;
    sdVe(x, 'ui_gia', mx, my, 88, 34);
    sdVe(x, 'ui_mana', mx - 28, my, 22);
    sdChu(x, String(Math.round(B.mana)), mx + 8, my + 1, '#f1e6ff', 15);
    this.soMana = this.soMana.filter(o => now - o.t0 < 900);
    for (const o of this.soMana) {
      const u = VX.eo((now - o.t0) / 900), px = o.x + (mx - 10 - o.x) * u, py = o.y + (my - o.y) * u - Math.sin(u * Math.PI) * 30;
      x.globalAlpha = 1 - Math.max(0, u - 0.8) * 5; sdVe(x, 'ui_mana', px - 18, py, 14); sdChu(x, '+' + o.n, px + 2, py, '#e6c8ff', 14); x.globalAlpha = 1;
    }
  }
  // 13) hồi chiêu chỉ huy (Cooldown Horn): ảnh ui_gia + chân dung + số giây
  if (ks.cd) {
    const mx = 384, my = SD_Y0 + 20, cd = B.mv.cd;
    sdVe(x, 'ui_gia', mx, my, 88, 34);
    x.save(); x.beginPath(); x.arc(mx - 26, my, 11, 0, Math.PI * 2); x.clip(); sdVe(x, MAVUONG[B.mv.id].anh, mx - 26, my, 24); x.restore(); // vetay-ok: mask — mặt nạ cắt/mờ dần ảnh PNG
    sdChu(x, cd > 0 ? cd.toFixed(1) + 's' : 'Ready', mx + 9, my + 1, '#e6f6ff', 14);
  }
  // 13b) lớp vẽ riêng của kịch bản (Pháo La Bàn: mũi tên + số; Lửa Thập Tự: lửa theo hàng + cột)
  if (ks.ve) try { ks.ve(x, B, T, now); } catch (e) { }
  // 14) chú thích (đáy khung) + thẻ mốc sao cuối vòng
  this.veChu(x, now);
  // 15) quay chậm: nhãn chữ
  if (G.tocDo < 1) sdChu(x, 'Slow-mo', W / 2, SD_Y0 + 18, '#ffe46b', 13);
  // 16) chuyển vòng: tối nhanh
  const re = (now - this.tRe) / 260; if (re < 1) { x.globalAlpha = 1 - re; x.fillStyle = '#0d0f12'; x.fillRect(0, 0, W, H); } // vetay-ok: nen — lớp tối đặc toàn màn khi chuyển vòng
  x.restore();
};
SD.mau = function () { return this.mv ? MAVUONG[this.mv].mau : tierOf(this.id).mau; };
SD.veNgonChi = function (x, X, Y, al) { x.save(); x.globalAlpha *= al == null ? 1 : al; sdVe(x, 'duong_mui', X, Y, 26, 17, Math.PI / 2); x.restore(); };
SD.veNutMV = function (x, B, now) {
  const c = B.o[9], d = MAVUONG[this.mv], ks = this.ks, cx = c.x, cy = c.y - 4, tc = ks.mvT;
  const nh = this.t > tc && this.t < tc + 0.18 ? 0.9 : 1;
  x.save(); x.beginPath(); x.arc(cx, cy, 21 * nh, 0, Math.PI * 2); x.clip(); sdVe(x, d.anh, cx, cy + 2, 46 * nh); x.restore(); // vetay-ok: mask — mặt nạ cắt/mờ dần ảnh PNG
  sdVe(x, 'ui_nut_trieu', cx, cy, 56 * nh);
  const cd = B.mv.cd, chu = cd > 0 ? Math.ceil(cd) + 's' : d.gia + '';
  if (cd > 0) sdChu(x, chu, cx, cy + 36, '#cfe8ff', 12); else { sdVe(x, 'ui_mana', cx - 13, cy + 36, 13); sdChu(x, String(B.mv.gia), cx + 5, cy + 36, '#e6c8ff', 12); }
  if (B.cuong > 0) sdChu(x, 'Rage ' + Math.ceil(B.cuong) + 's', cx, cy - 36, '#ff8a6a', 12);
  if (B.khien > 0) sdChu(x, 'Shield ' + Math.ceil(B.khien) + 's', cx, cy - 36, '#bfe8ff', 12);
  if (this.t > tc - 0.9 && this.t < tc + 0.5) {
    const u = this.t < tc ? 0 : (this.t - tc) / 0.5;
    if (u > 0) { x.globalAlpha = 1 - u; sdVe(x, 'fx_vong_lv', cx, cy, 30 + 70 * u); x.globalAlpha = 1; }
    this.veNgon(x, cx, cy - (this.t < tc ? 6 * Math.abs(Math.sin(now / 130)) : 0), Math.PI / 2, u > 0);
  }
};
SD.cauChu = function () {
  const ks = this.ks, T = this.T || {}; const s = this.sao;
  const c = ks.c[this.cIdx]; if (!c) return null;
  let v = c[1]; if (typeof v === 'function') { try { v = v(T, T.sao || s); } catch (e) { v = ''; } }
  if (ks.cham && ks.cham.includes(c[0]) && sdKhoa()) v = 'Tap skill unlocks at 3★';
  return { chu: sdSC(v), t0: c[0], dau: c[2] && c[2].dau };
};
SD.mocChu = function () { // mốc sao đã mở ở sao đang xem (cuối vòng)
  if (this.mv) return null;
  const s = this.sao;
  const ds = mocCua(this.id).filter(m => m.n <= s); if (!ds.length) return null;
  const m = ds[ds.length - 1];
  return { dau: m.n + '★ bonus', chu: sdNgan(String(SD_MOC_NGAN[m.mo] || m.mo).replace(/^Aura ×([\d.]+) of its 1★ value/, 'Buff ×$1 vs 1★').replace(/^Aura\b/, 'Buff').replace(/\bexposed\b/, 'armor-broken')) };
};
SD.veChu = function (x, now) {
  const ks = this.ks, t0 = ks.dai - 2.4;
  let o = null;
  if (this.t >= t0) { // cuối vòng: số liệu ở sao này → mốc sao đã mở
    const mc = this.sao >= 3 ? this.mocChu() : null;
    const dau = this.mv ? null : this.sao + '★';
    if (mc && (this.t >= t0 + 1.2 || !this.moSao)) o = { chu: mc.chu, dau: mc.dau, t0: this.moSao ? t0 + 1.2 : t0 };
    else if (this.moSao) o = { chu: this.moSao, dau, t0 };
    else o = { chu: 'Higher stars: stronger', dau, t0 };
  }
  if (!o) o = this.cauChu();
  if (!o || !o.chu) return;
  // chữ to (19 px logic ≈ 15 px trên điện thoại 390 px). Băng chữ nằm giữa 2 nút góc dưới của khung trang ụ ("4★" trái, nút dừng phải):
  // x 46…370 logic → chữ tối đa 280 px; câu dài xuống 2 dòng (dịch cả câu TRƯỚC khi tách — NN.t dịch theo câu, nửa câu không có bản Việt)
  const u = clamp((this.t - o.t0) / 0.18, 0, 1), cx = 208, F = 19, WMAX = 280;
  const tr = (v) => (typeof NN !== 'undefined' && NN.t ? NN.t(v) : v);
  const chu = tr(o.chu), dau = o.dau ? tr(o.dau) : '', pre = dau ? dau + '  ' : '';
  x.font = '800 ' + F + 'px "TM UI", sans-serif';
  const do_ = (v) => x.measureText(v).width;
  let dong = [chu], w = do_(pre + chu);
  if (w > WMAX) { // tách 2 dòng ở chỗ cân nhất
    const tu = chu.split(' '); let tot = null;
    for (let i = 1; i < tu.length; i++) { const a1 = tu.slice(0, i).join(' '), a2 = tu.slice(i).join(' '), m = Math.max(do_(pre + a1), do_(a2)); if (!tot || m < tot.m) tot = { m, d: [a1, a2] }; }
    if (tot) { dong = tot.d; w = tot.m; }
  }
  const fs = w > WMAX ? F * WMAX / w : F; if (fs !== F) w = WMAX;
  const hai = dong.length > 1, cy = hai ? SD_CY - 10 : SD_CY, bh = hai ? 62 : 42, lh = fs * 1.12;
  const bw = w + 44;
  x.globalAlpha = u; x.save(); x.translate(cx, cy); x.scale(0.94 + 0.06 * u, 0.94 + 0.06 * u); x.translate(-cx, -cy);
  sdVe(x, 'bang_wave_nen', cx, cy, bw, bh); // băng PNG; chưa nạp → chỉ chữ (bỏ hộp fillRect vẽ code)
  x.textBaseline = 'middle'; x.font = '800 ' + fs.toFixed(1) + 'px "TM UI", sans-serif';
  dong.forEach((d, i) => {
    const y = cy + 1 + (hai ? (i ? lh / 2 : -lh / 2) : 0), p0 = i === 0 && pre, wl = x.measureText((p0 ? pre : '') + d).width, x0 = cx - wl / 2;
    x.textAlign = 'left';
    if (p0) { const wd = x.measureText(pre).width; x.fillStyle = '#ffe46b'; x.fillText(dau, x0, y); x.fillStyle = '#f4f6f8'; x.fillText(d, x0 + wd, y); } // đầu dòng màu vàng (sao / mốc)
    else { x.fillStyle = '#f4f6f8'; x.fillText(d, x0, y); }
  });
  x.restore(); x.globalAlpha = 1;
};

// ===================================================== khởi động trong iframe =====================================================
SD.moc();
window.SD = SD;
