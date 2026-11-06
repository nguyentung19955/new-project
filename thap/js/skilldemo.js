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
// Hero Foundry: % tốc của ô anh hùng vừa dập (giá trị thật trong B.hero — tính theo sao Foundry ghép, không theo ụ ra)
function sdHero(T) { const B = G.ban[T.ban] || G.ban[0], h = B && B.hero && B.hero[B.hero.length - 1]; return h ? h.v : SKILLS.xuonganh.v(T); }
const SD_K = {
  canon: { q: Q.nhom(5, 175), c: [[0.2, 'Fires slow explosive shells'], [1.2, 'Blast hits the whole group', { ev: 'hit', cham: 0.5 }]] },
  xucxac: { q: Q.hang(3, 170, 50, 6), may: [5, 5.8], c: [[0.2, 'Each shot rolls 3–300% damage'], [1.5, 'Watch the numbers jump', { ev: 'hit', cham: 0.4 }], [4.8, 'Crits always roll the max', { ev: 'hit', cham: 0.5 }]] },
  lien: { q: Q.dong(7, 0.55, 3), c: [[0.2, 'Very fast fire at the lead'], [2.4, (T, s) => s >= 3 ? 'Stars make it fire faster' : 'More stars, faster fire', { cham: 0.4 }]] },
  phun: { q: Q.nhom(6, 185, 24, 6), c: [[0.2, 'Sprays bullets at random enemies'], [1.6, 'Every enemy gets peppered', { ev: 'hit', cham: 0.4 }]] },
  sungluc: { q: Q.hang(3, 170, 55, 2), c: [[0.2, 'One heavy shot, instant hit'], [0.8, 'Hits the lead enemy', { ev: 'hit', cham: 0.5 }]] },
  bang: { q: Q.hang(4, 180, 40, 8), truoc: (T) => { T.nap = 0.8; }, c: [[0.2, 'Freezes the lead enemy'], [1.3, (T) => 'Frozen ' + SKILLS.bang.dai(T) + 's, no damage, no chain', { cham: 0.6 }], [4.6, 'Next freeze picks a new enemy']] },
  doc: { q: Q.nhom(4, 175, 22, 9), ke: [[6, 'lien', 's'], [8, 'canon', 's']], truoc: (T) => { T.nap = 0.8; }, c: [[0.2, 'Marks the lead enemy'], [1.4, (T) => 'Marked: +' + +knThe(G.ban[T.ban], 'doc').toFixed(1) + '% damage from all', { cham: 0.6 }]] },
  tia: { q: Q.to(6), c: [[0.2, 'Picks the toughest enemy'], [1.0, '+100% damage vs big enemies', { ev: 'hit', cham: 0.6 }]] },
  set: { q: Q.hang(7, 205, 28, 5), lien: 1, c: [[0.2, 'Lightning jumps between enemies'], [1.0, (T, s) => 'Chains to ' + s + (s > 1 ? ' enemies' : ' enemy'), { ev: 'hit', cham: 0.6 }]] },
  maychem: { q: Q.nho(), may: [3.2, 4.4], c: [[0.2, 'Shoots the lead enemy'], [3.0, 'Can instantly kill small enemies', { ev: 'kill', cham: 0.6 }]] },
  phagiap: { kieu: 'ht', truoc: (T) => { T.nap = 0.9; }, c: [[0.2, 'Exposes the lead and toughest'], [1.4, (T) => 'Neighbours deal +' + Math.round(Math.min(SKILLS.phagiap.k(T), HOTRO.CAP.dmg * HOTRO.CAP_BAC[T.bac]) * 100) + '% to exposed', { cham: 0.5 }]] },
  bua: { kieu: 'ht', may: [1.6, 3.2, 'ke'], c: [[0.2, 'Boosts neighbours’ crits'], [1.6, 'Crits hit harder and stagger', { cham: 0.6 }]] },
  nam: { o: 2, q: Q.nhom(5, 175, 16, 8), c: [[0.2, 'Melee: only hits enemies nearby'], [1.6, 'Each punch blasts enemies around its target', { ev: 'hit', cham: 0.5 }]] },
  bomhen: { q: Q.hang(4, 170, 34, 8), ke: [[6, 'lien', 's'], [8, 'canon', 's']], truoc: (T) => { T.nap = 0.9; }, c: [[0.2, 'Sticks a bomb on an enemy'], [1.2, 'It goes off after 5 seconds'], [5.5, (T) => 'Blast weakens: +' + +(SKILLS.bomhen.yw(T) * 100).toFixed(2) + '% damage taken', { cham: 0.6 }]], dai: 9.4 },
  nhanmana: { kieu: 'ghep', mana: 1, manaDau: 100, c: [[0.2, 'Merge two Mana Doublers'], [2.5, 'Merging gives bonus mana', { ev: 'mana', cham: 0.6 }]] },
  kiembang: { q: Q.nhom(4, 170, 22, 12), c: [[0.2, 'Each hit chills nearby enemies'], [1.4, (T) => 'Slowed enemies take ×' + (ms(T, 7) ? 8 : ms(T, 3) ? 6 : 5) + ' damage', { ev: 'hit', cham: 0.6 }]] },
  mimic: { kieu: 'ghep', ban: 'canon', c: [[0.2, 'Joker: merges with any turret'], [2.5, (T) => 'Result gets +' + Math.round(knThe(G.ban[T.ban], 'mimic')) + '% attack', { ev: 'moi', cham: 0.6 }]] },
  dichchuyen: { o: 2, q: Q.nhom(4, 170, 18, 9), ke: [[12, 'nam', 's']], keo: [2.6, 2, 12], c: [[0.2, 'Iron Fist is too far away'], [1.6, 'Drag onto a same-star turret'], [2.6, 'They swap places', { cham: 0.6 }], [4.2, 'Now it reaches the enemies']] },
  drone: { kieu: 'ghep', q: Q.hang(4, 175, 40, 5), c: [[0.2, 'Merge two Drone Bays'], [2.5, 'Merging launches bomb drones', { cham: 0.5 }], [4.4, 'Drones fly up the path']] },
  tron: { kieu: 'ht', ke: [[2, 'lien', 's'], [6, 'canon', 's'], [8, 'set', 's'], [12, 'sungluc', 's']], c: [[0.2, 'Four different Attack types'], [1.6, (T) => 'Each gets +' + sdBuf(T) + ' fire rate', { cham: 0.4 }]] },
  nangluong: { q: Q.hang(3, 175, 50, 8), mana: 1, manaDau: 60, truoc: null, them: [[3.4, (B) => { B.mana += 600; }]], c: [[0.2, 'Damage grows with your mana'], [3.4, 'More mana, bigger hits', { ev: 'hit', cham: 0.6 }]] },
  laser: { q: Q.hang(3, 180, 50, 14), c: [[0.2, 'Locks a beam on one enemy'], [2.2, 'Beam ramps up to ×4', { cham: 0.5 }]] },
  mortar: { q: Q.nhom(6, 185, 22, 7), c: [[0.2, 'Shells random enemies'], [1.2, 'Every 3rd shell splits apart', { ev: 'hit', cham: 0.7 }]] },
  vungdoc: { q: Q.dong(6, 0.6, 9), truoc: (T) => { T.nap = 0.85; }, c: [[0.2, 'Throws a poison pool'], [2.0, 'Enemies walking through get poisoned', { cham: 0.5 }]] },
  loa: { kieu: 'ghep', cd: 1, c: [[0.2, 'Your Archfiend skill is cooling'], [2.5, 'Merging cuts the cooldown', { cham: 0.6 }]] },
  hutmana: { q: Q.hang(4, 175, 40, 6), mana: 1, manaDau: 0, c: [[0.2, 'Every hit makes a little mana'], [2.0, 'Mana flows to your counter', { ev: 'mana', cham: 0.5 }]] },
  min: { q: Q.dong(6, 0.7, 6), truoc: (T) => { T.nap = 0.8; }, c: [[0.2, 'Lays mines on the path'], [2.6, 'Stepping on them explodes', { ev: 'hit', cham: 0.6 }]] },
  cuongno: { q: Q.dong(8, 0.5, 4), may: [1.8, 3.4], c: [[0.2, 'Crits build up rage'], [1.8, 'Two crits: fire-rate frenzy', { cham: 0.6 }]] },
  baotuyet: { q: Q.nhom(5, 180, 26, 10), truoc: (T) => { T.nap = 0.86; }, c: [[0.2, 'Blizzard every few seconds'], [1.3, 'Slows every enemy on the path', { cham: 0.6 }]] },
  nhanban: { kieu: 'ghep', c: [[0.2, 'Merge two Cloners'], [2.5, 'Merging summons a free turret', { ev: 'moi', cham: 0.6 }]] },
  lienket: { q: Q.hang(3, 175, 50, 6), ke: [[6, 'lienket', 's'], [8, 'lienket', 's']], c: [[0.2, 'Linked twins power each other'], [1.4, (T) => 'Chain of ' + (T.chuoi || 3) + ': +' + Math.round(0.4 * ((T.chuoi || 3) - 1) * 100) + '% damage', { ev: 'hit', cham: 0.5 }]] },
  kepha: { kieu: 'ghep', doi: [[4, 'canon', 3], [9, 'tia', 4], [14, 'set', 3]], c: [[0.2, 'Merge two Jammers'], [2.5, 'Rival turrets get clamped', { cham: 0.6 }], [4.0, 'Clamped: −40% fire rate']] },
  taylo: { kieu: 'ht', dong: [2, 6], truoc: (T) => { T.nap = 0.85; }, c: [[0.2, 'Two neighbours are frozen'], [1.8, 'Its pulse cleanses them', { cham: 0.7 }]] },
  khien: { kieu: 'ht', ke: [[2, 'lien', 's'], [6, 'canon', 's'], [8, 'lien', (s) => Math.min(7, s + 1)], [12, 'canon', 's']], q: Q.trum('freezer', 3.4, 80), truoc: (T) => { T.nap = 0.9; }, c: [[0.2, 'Charges neighbours’ shields'], [1.4, 'Neighbours get a 1-hit shield', { cham: 0.5 }], [3.4, 'The boss aims a skill…'], [4.6, 'A shield blocks it', { ev: 'chan', cham: 0.6 }]], dai: 9 },
  hopbi: { kieu: 'phu', dem: (T) => SKILLS.hopbi.can(T) - T.tuoi, truoc: (T) => { T.tuoi = SKILLS.hopbi.can(T) - 3.2; }, c: [[0.2, 'Counts down, then opens'], [3.0, (T, s) => 'Becomes a random ' + (s >= 7 ? 5 : s >= 5 ? 3 : 1) + '–' + (s >= 7 ? 7 : 6) + '★ turret', { ev: 'moi', cham: 0.6 }]] },
  nangsao: { kieu: 'ht', ke: [[2, 'lien', 1], [6, 'canon', 3], [8, 'set', 1], [12, 'sungluc', 4]], c: [[0.2, 'Finds its 2 lowest-star neighbours'], [1.6, (T) => 'They get +' + sdBuf(T) + ' fire rate', { cham: 0.5 }]] },
  xaotron: { kieu: 'ghep', doi: [[4, 'canon', 3], [9, 'tia', 4], [14, 'set', 3]], c: [[0.2, 'Merge two Scramblers'], [2.5, 'Rival turrets get shuffled', { cham: 0.7 }], [4.0, 'Their board layout breaks']] },
  epxung: { kieu: 'gDB', ban: 'lien', so: { o: 8, k: 'toc' }, c: [[0.2, 'Drag onto a same-star turret'], [2.5, (T) => '+' + +knThe(G.ban[T.ban], 'epxung').toFixed(1) + '% fire rate, it stacks', { cham: 0.6 }]] },
  no5: { q: Q.nhom(5, 175, 20, 9), c: [[0.2, 'Counts its shots'], [1.0, '5th shot fires 3 exploding bolts', { ev: 'shot%5', cham: 0.7 }]] },
  bao: { q: Q.hang(6, 200, 30, 10), may: [2.4, 3.6], lien: 1, c: [[0.2, 'Instant hits, very fast'], [2.3, 'Some hits arc to another', { ev: 'hit', cham: 0.5 }]] },
  anhsang: { q: Q.hang(3, 170, 50, 6), truoc: (T) => { T.nap = 0.86; }, c: [[0.2, 'Light orbs charge up'], [1.4, 'Summons a free 1★ turret', { ev: 'moi', cham: 0.6 }]] },
  aten: { q: Q.nhom(4, 175, 22, 5), ke: [[6, 'doc', 's']], c: [[0.2, 'Venom poisons, Purifier punishes'], [1.6, '×4 damage vs poisoned', { ev: 'hit', cham: 0.5 }], [3.4, 'Kills explode on nearby enemies', { ev: 'kill', cham: 0.5 }]] },
  dongbo: { kieu: 'ht', day: 1, ke: [[0, 'lien', 's'], [4, 'canon', 's'], [8, 'set', (s) => s >= 3 ? s - 2 : s + 2], [14, 'sungluc', 's'], [11, 'tia', 's']], c: [[0.2, 'Finds same-star Attack turrets anywhere'], [1.6, (T) => 'Each gets +' + sdBuf(T) + ' damage, no need to touch', { cham: 0.4 }], [3.4, 'A different star gets nothing'], [4.8, (T) => 'PvP: rival turrets deal −' + Math.round(SKILLS.dongbo.giamPvp(T) * 100) + '% damage']] },
  railgun: { day: 1, q: Q.hang(3, 175, 50, 8), ke: [[5, 'railgun', 's'], [6, 'railgun', 's'], [8, 'railgun', 's'], [9, 'railgun', 's'], [2, 'railgun', 's'], [12, 'railgun', 's']],
    them: [[3.2, (B, D, T) => { if (!T || !B.t[6] || B.t[6].id !== 'railgun') return; B.t[6] = null; sdThem(B, [[6, 'canon', T.sao]], T, 'dmg'); }]],
    c: [[0.2, () => 'A full row of Railguns: +' + Math.round(SKILLS.railgun.BINGO_DMG * 100) + '% damage'], [1.6, () => 'A full column of Railguns: +' + Math.round(SKILLS.railgun.BINGO_TOC * 100) + '% fire rate', { cham: 0.5 }], [3.2, 'Swap one for another turret…', { cham: 0.6 }], [4.4, 'The row bonus is gone: Railguns only']] },
  vughep: { kieu: 'gDB', ke: [[8, 'canon', 's'], [12, 'vughep', 's'], [13, 'lien', 's']], keo: [[2.5, 7, 8], [4.6, 12, 13]],
    truoc: (T, B) => { if (T) T.vang = false; const K = B.t[12]; if (K) K.vang = true; }, // vang = kết quả gieo khi xuất hiện (knThe 'vughep' %): clip cho xem cả 2 ca, chú thích nói xác suất
    c: [[0.2, 'Drag onto a same-star turret'], [2.5, 'Target gets +1★, keeps type', { ev: 'sao', cham: 0.6 }], [3.6, (T) => Math.round(knThe(G.ban[T.ban], 'vughep')) + '% chance a Merge King is Golden'], [4.6, 'Golden King: target +2★', { ev: 'sao', cham: 0.6 }]], dai: 9 },
  sinhdoi: { kieu: 'ghep', c: [[0.2, 'Merge two Twin Makers'], [2.5, 'Merging adds a same-star twin', { ev: 'moi', cham: 0.6 }], [4.2, (T) => Math.round(knThe(G.ban[T.ban], 'sinhdoi') || 10) + '% chance the twin is +1★']] },
  hasao: { kieu: 'ht', ke: [[2, 'lien', 's'], [6, 'canon', 's'], [8, 'lien', 's'], [12, 'sungluc', 4]],
    them: [[4.0, (B, D, T) => { if (!T) return; T.da5Dau = 1; T.w5 = -1; const N = B.t[12]; if (N && N.sao < 5) nangSao(B, N, 5 - N.sao); }]], // ô 12 luôn 4★ → lên 5★ thật = lần 5★ đầu của wave
    c: [[0.2, 'Boosts Attack neighbours'], [1.6, (T) => 'Each gets +' + sdBuf(T) + ' damage', { cham: 0.4 }], [4.0, 'First 5★ of the wave: weakest +8% fire rate', { ev: 'sao', cham: 0.6 }], [5.4, 'PvP: the rival’s first 5★ −8% fire rate']] },
  saochep: { kieu: 'gDB', ban: 'tia', c: [[0.2, 'Drag onto a same-star turret'], [2.5, (T) => 'Becomes a copy at ' + Math.round(heSaoChep(G.ban[T.ban]) * 100) + '% power', { cham: 0.6 }]] },
  ngoisao: { q: Q.hang(3, 175, 50, 6), ke: [[2, 'lien', 3], [6, 'canon', 3], [8, 'set', 3], [12, 'bang', 3]], them: [[1.6, (B) => sdNgoiSao(B, 20)], [3.2, (B) => sdNgoiSao(B, 50)]], c: [[0.2, 'Counts every star on the board'], [1.6, 'Every 10★: faster fire', { cham: 0.5 }], [3.2, 'Every 50★: more damage']] },
  soi: { o: 2, q: Q.nhom(5, 175, 18, 6), ke: [[3, 'soi', 's']], truoc: (T, B) => { const g = SD.gd; if (T) { T.thuc = g === 3; T.gd = null; } const W = B && B.t[3]; if (W) { W.thuc = g ? g === 3 : true; W.gd = null; } }, // thuc = kết quả gieo tiLe khi xuất hiện: clip ép 1 Thường + 1 Thức tỉnh, chú thích nói xác suất thật
    c: [[0.2, 'Each Werewolf is Normal or Awakened'], [1.6, 'Awakened: always crits, faster', { ev: 'hit', cham: 0.5 }], [3.4, (T) => 'Each summon or merge: ' + Math.round(SKILLS.soi.tiLe(G.ban[T.ban]) * 100) + '% chance to awaken']] },
  tienhoa: { kieu: 'phu', truoc: (T) => { if (T.sao < 7) T.tuoi = SKILLS.tienhoa.can(T) - 4.2; }, c: [[0.2, (T, s) => s >= 7 ? 'Max 7★: the bomb fizzles' : 'Time bomb counts down'], [4.3, (T, s) => s >= 7 ? 'Just a 7★ turret: no skill' : 'Becomes a random turret +1★', { ev: 'moi', cham: 0.6 }]] }, // bom hẹn giờ trên ụ (growfx veEvoBom) — không cần số đếm riêng của clip
  cauvong: { kieu: 'ht', q: Q.dong(6, 0.6, 9), truoc: (T) => { T.nap = 0.85; }, c: [[0.2, 'Paints a rainbow trail'], [1.6, 'Enemies on it take more damage', { cham: 0.5 }], [3.4, 'PvP: it paints the rival\'s path instead']] },
  wallgen: { kieu: 'ghep', q: Q.dong(6, 0.55, 12), ke: [[8, 'wallgen', 's']], keo: [4.6, 7, 8], truoc: (T) => { T.nap = 0.7; }, c: [[0.2, 'Raises a wall on the path'], [2.6, 'Wall stops enemies, then explodes', { cham: 0.6 }], [3.6, 'Merge two Wall Projectors'], [4.6, 'Merging: a Golden Wall, ×6 blast', { cham: 0.6 }]], dai: 11 },
  orbital: { kieu: 'ghep', q: Q.hang(4, 175, 40, 10), ke: [[2, 'orbital', 's'], [12, 'orbital', 's']], c: [[0.2, 'Merge two Orbitals'], [2.5, (T) => 'Every Orbital on the board awakens for ' + SKILLS.orbital.dai(G.ban[T.ban]) + 's', { cham: 0.5 }], [4.2, 'Awakened: area bomb salvos']] },
  blackhole: { q: Q.nhom(6, 190, 24, 14), truoc: (T) => { T.nap = 0.85; }, c: [[0.2, 'Opens a black hole'], [1.4, 'Pulls enemies in and crushes', { cham: 0.7 }]] },
  overlord: { q: Q.nhom(6, 190, 22, 10), truoc: (T) => { T.nap = 0.55; }, c: [[0.2, 'Slowly charges a thunder blast'], [2.6, 'Huge blast hits the group', { ev: 'hit', cham: 0.7 }]] },
  lophanung: { kieu: 'ht', q: Q.nhom(5, 180, 22, 30), cham: [4.0], truoc: (T) => { T.nap = 0.9; }, c: [[0.2, 'Cold aura slows nearby enemies'], [1.6, 'Neighbours hit slowed enemies harder', { cham: 0.5 }], [4.0, 'Tap when charged: freeze nearby', { cham: 0.7 }]] },
  haoquang: { q: Q.trum('freezer', 2.0, 90), cham: [3.0], truoc: (T) => { T.nap = 1; T.napDay = -99; }, c: [[0.2, 'Does not shoot: charges a barrier'], [2.0, 'The boss aims a skill…'], [3.0, 'Tap: team barrier, boss skill weakened', { cham: 0.7 }]], dai: 9 },
  nayda: { q: Q.hang(7, 205, 30, 6), lien: 1, c: [[0.2, 'Disc bounces between enemies'], [1.0, (T, s) => 'Bounces ' + s + (s > 1 ? ' times' : ' time') + ', stronger each', { ev: 'hit', cham: 0.7 }]] },
  combo: { kieu: 'ghep', ke: [[2, 'combo', 's']], c: [[0.2, 'Merge two Combo Cores'], [2.5, 'Every Combo Core powers up', { cham: 0.6 }]] },
  khoathoigian: { kieu: 'tc', q: Q.hang(3, 175, 50, 12), truoc: (T) => { T.nap = 0.86; }, c: [[0.2, 'Freezes the lead enemy in time'], [1.2, 'Damage is stored while locked', { cham: 0.5 }], [2.6, 'Release: stored damage bursts', { ev: 'hit', cham: 0.5 }]] },
  hydra: { q: Q.hang(7, 205, 28, 7), lien: 1, c: [[0.2, (T, s) => s >= 7 ? 'Barrels fuse into a beam' : s + (s > 1 ? ' barrels' : ' barrel') + ', different targets'], [1.2, (T, s) => s >= 7 ? 'Pierces the whole line' : 'Each barrel picks its own', { ev: 'hit', cham: 0.6 }]] },
  cuuvi: { kieu: 'tc', q: Q.dong(9, 0.4, 1), truoc: (T) => { T.duoi = 6; }, c: [[0.2, 'Kills grow fire tails'], [1.8, '9 tails: homing foxfires', { cham: 0.7 }]] },
  pandora: { kieu: 'ghep', mana: 1, manaDau: 100, c: [[0.2, 'Merge two Pandora Vaults'], [2.5, 'The vault spins…', { cham: 0.8 }], [3.5, () => SD.pdr ? 'Vault opens: ' + SD.pdr.toLowerCase().replace('×3', '') .trim() : 'Opens 1 of 6 big effects', { cham: 0.5 }]] },
  luoicheo: { kieu: 'ht', ke: CHEO4.map((o, i) => [o, i % 2 ? 'canon' : 'lien', 's']), c: [[0.2, 'Buffs the 4 diagonal cells'], [2.0, 'All 4 filled: resonance', { cham: 0.5 }]] },
  ngaithoigian: { q: Q.nhom(5, 200, 26, 30), cham: [4.2], truoc: (T) => { T.nap = 0.92; T.napDay = -99; }, c: [[0.2, 'Enemies slow down over time'], [4.2, 'Tap: rewind pushes enemies back', { cham: 0.7 }]], dai: 9 },
  nemesis: { q: Q.trum('janus', 99, 40).concat(Q.hang(2, 210, 40, 3)), c: [[0.2, 'Executes enemies at low HP'], [2.4, 'Bosses lose chunks of max HP', { ev: 'hit', cham: 0.5 }]] },
  docton: { q: Q.dong(8, 0.5, 4), them: [[4.2, (B) => { const N = sinhU(taoU(B, 'lien', SD.sao, 8)); B.t[8] = N; VX.trieu(N); }]], c: [[0.2, 'Alone: double fire rate'], [4.2, 'A neighbour cancels the bonus', { cham: 0.6 }]] },
  thaukinh: { kieu: 'ht', may: [1.8, 3.4, 'ke'], q: Q.hang(5, 200, 30, 8), c: [[0.2, 'Neighbours’ crits hit harder'], [1.8, 'Crits pierce through enemies', { cham: 0.5 }]] },
  nhieusong: { kieu: 'ghep', doi: [[4, 'canon', 3], [9, 'tia', 4], [14, 'set', 3]], c: [[0.2, 'Merge two Signal Jammers'], [2.5, 'Rival turrets get jammed', { cham: 0.7 }], [3.6, 'Jammed: −40% fire rate']] },
  santhuong: { q: Q.to(4), mana: 1, manaDau: 0, truoc: (T) => { T.nap = 0.86; }, c: [[0.2, 'Marks an enemy (big first)'], [2.0, 'Marked kills give bonus mana', { ev: 'mana', cham: 0.6 }]] },
  nhatthuc: { q: Q.hang(4, 180, 40, 14), truoc: (T) => { T.doiT = 3.6; }, c: [[0.2, 'Day: a burning beam'], [3.6, 'Night: a slowing wave', { cham: 0.6 }]] },
  loren: { kieu: 'gDB', ban: 'lien', saoBan: 1, keoNguoc: 1, so: { o: 2, k: 'dmg' }, c: [[0.2, 'Feed it a 1–3★ turret'], [2.5, 'Your best Attack gun gets stronger', { cham: 0.6 }]] },
  guongcong: { q: Q.trum('octopus', 1.6, 90), truoc: (T) => { T.nap = 1; }, doi: [[4, 'kepha', 3], [9, 'canon', 4], [14, 'set', 3]],
    them: [[5.0, (B, D, T) => { if (T) T.nap = 1; const K = D && D.t[4]; if (K) SKILLS.kepha.ghep(G, D, K, K, K); }]], dai: 9.4,
    c: [[0.2, 'Neighbours resist control'], [1.6, 'The boss aims a skill…'], [3.0, 'The mirror blocks it', { cham: 0.6 }], [4.4, 'Rival casts a Clamp…'], [5.0, 'Mirror reflects it back', { cham: 0.7 }]] },
  marionette: { q: Q.hang(4, 190, 36, 14), truoc: (T) => { T.nap = 0.86; }, c: [[0.2, 'Takes control of an enemy'], [1.6, 'Walks it back, then boom', { cham: 0.5 }]], dai: 9 },
  chuato: { q: Q.hang(5, 200, 36, 8), cham: [4.6], truoc: (T) => { T.nap = 0.95; T.napDay = -99; T.de = 99; }, c: [[0.2, 'Breeds hunter drones'], [4.6, 'Tap: the swarm dives in', { cham: 0.7 }]], dai: 9 },
  leviathan: { q: Q.nho().concat([{ k: 'khong_lo', s: 30, h: 30 }]), cham: [4.6], truoc: (T) => { T.nap = 0.95; T.napDay = -99; T.nuot = 99; }, c: [[0.2, 'Devours a small enemy'], [1.4, 'Whirlpool tag = ABYSS points'], [4.6, 'Tap: ice dragon breath', { cham: 0.7 }]], dai: 9 },
  khoisinh: { kieu: 'phu', cham: [4.6], truoc: (T) => { T.sinhT = SKILLS.khoisinh.g(T) - 1.4; T.nap = 0.95; T.napDay = -99; }, ke: [[6, 'lien', 1], [8, 'canon', 2], [2, 'set', 3]], c: [[0.2, 'Raises your lowest turret'], [1.4, 'Lowest turret gets +1★', { ev: 'sao', cham: 0.6 }], [4.6, 'Tap: summons new turrets', { cham: 0.6 }]], dai: 9 },
  ronglua: { q: Q.nhom(6, 190, 20, 12), cham: [4.6], truoc: (T) => { T.nap = 0.95; T.napDay = -99; }, c: [[0.2, 'Flame cone burns crowds'], [4.6, 'Tap: fire dragon breath', { cham: 0.7 }]], dai: 9 },
  mana: { kieu: 'phu', mana: 1, manaDau: 0, truoc: (T) => { T.nap = 0.8; }, c: [[0.2, 'Does not shoot'], [1.2, (T) => 'Makes mana every ' + SKILLS.mana.ky(T) + 's', { ev: 'mana', cham: 0.6 }]] },
  chimang: { may: [2.0, 3.6, 'ke'], c: [[0.2, 'Gives 4 neighbours crit chance'], [2.0, 'Crits deal double damage', { cham: 0.5 }]] },
  radar: { c: [[0.2, 'Speeds up 4 turrets around it'], [2.0, (T) => 'Each gets +' + sdBuf(T) + ' fire rate', { cham: 0.4 }]] },
  lanhgia: { c: [[0.2, 'Neighbours’ shots also slow'], [1.6, 'Slow spreads to every target', { cham: 0.5 }]] },
  khuech: { c: [[0.2, 'Buffs Attack turrets around it'], [2.0, (T) => 'Repeat hits on one enemy: up to +' + Math.round(Math.min(SKILLS.khuech.buoc(T) * SKILLS.khuech.max(T), HOTRO.CAP.dmg * HOTRO.CAP_BAC[T.bac]) * 100) + '% damage', { cham: 0.4 }]] },
  tuthan: { q: Q.nho().concat(Q.dong(6, 0.6, 2, 'nho', 1.5)), may: [2.2, 3.6, 'ke'], c: [[0.2, 'Neighbours may execute'], [2.2, 'Low-HP enemies are reaped', { ev: 'kill', cham: 0.6 }]] },
  // ---------- vàng mới (vangmoi1.js / skills7.js) ----------
  // Ember Relay: ghép ở ô 8 → Relay ở ô kề 3 & 13 nhận 1 lửa thật (SKILLS.lualien.ghep); ô 13 đã có 4 lửa → đủ 5 (lõi lửa)
  lualien: { kieu: 'ghep', ke: [[8, 'lualien', 's'], [3, 'lualien', 's'], [13, 'lualien', 's']], keo: [2.5, 7, 8], so: { o: 13, k: 'dmg' }, truoc: (T, B) => { if (B.t[13]) B.t[13].lc = 4; },
    c: [[0.2, 'Merge two Ember Relays'], [2.5, 'Relays next to it catch a flame', { cham: 0.6 }], [3.9, (T) => 'Each flame: +' + VM1.pct(SKILLS.lualien.moiLua(T)) + '% damage, +3% crit'], [5.0, '5 flames: full blaze']] },
  // Quantum Choir: thêm ụ cùng sao (trùng) và khác sao (không tính) — chỉ số sát thương trước → sau
  hopca: { q: Q.hang(4, 180, 40, 8), ke: [[6, 'lien', 's'], [8, 'canon', (s) => s > 1 ? s - 1 : 2]],
    them: [[2.0, (B, D, T) => { if (T) sdThem(B, [[2, 'set', T.sao], [12, 'bang', T.sao]], T, 'dmg'); }], [4.0, (B, D, T) => { if (T) sdThem(B, [[3, 'sungluc', T.sao > 1 ? T.sao - 1 : 2]], T, 'dmg'); }]],
    c: [[0.2, (T) => 'Counts other ' + T.sao + '★ turrets on your board'], [2.0, (T) => 'Each match: +' + VM1.pct(SKILLS.hopca.moi(T)) + '% damage', { cham: 0.6 }], [4.0, 'Other star levels don\'t count', { cham: 0.4 }]] },
  // Fusion Archive: 2 ghép thường bất kỳ → +1 điểm lưu mỗi lần; cuối: Archive + Archive → 3 xung nổ
  luutru: { kieu: 'ghep', ke: [[2, 'lien', 1], [3, 'lien', 1], [11, 'canon', 1], [12, 'canon', 1], [8, 'luutru', 's']], keo: [[1.6, 3, 2, { o: 7, k: 'dmg' }], [3.2, 12, 11, { o: 7, k: 'dmg' }], [5.0, 8, 7]],
    c: [[0.2, 'Every merge you make charges it'], [1.6, (T) => '+1 charge: +' + VM1.pct(SKILLS.luutru.moi(T)) + '% damage', { cham: 0.5 }], [3.2, 'Any merge counts, not just its own'], [5.0, 'Archive + Archive: 3 big pulses', { cham: 0.7 }]], dai: 9.4 },
  // Hero Foundry: ghép → ô ngẫu nhiên thật (VM1.rng) thành ô Anh hùng; hiện tốc bắn trước → sau của ụ đứng trên ô
  xuonganh: { kieu: 'ghep', ke: [[2, 'lien', 's'], [3, 'set', 's'], [6, 'canon', 's'], [12, 'sungluc', 's']],
    them: [[2.45, (B) => { SD._toc0 = B.t.map(X => X ? sdSo(X, 'toc') : null); }], [3.2, (B) => { const o = B._hf, N = o != null && B.t[o]; if (N && o !== 8 && SD._toc0 && SD._toc0[o]) SD.soDoi = { o, a: SD._toc0[o], b: sdSo(N, 'toc'), ic: 'ic_toc', t0: performance.now() }; }]],
    c: [[0.2, 'Merge two Hero Foundries'], [2.5, 'A random turret gets a Hero tile', { cham: 0.6 }], [4.0, (T) => 'Hero tile: +' + VM1.pct(sdHero(T)) + '% fire rate for 12s']] },
  // Blood Circuit: kéo lên ụ CÙNG sao (+1 Vamp) rồi lên ụ KHÁC sao (tốn 2 Vamp → xung máu); không bao giờ tự lên sao
  mauhut: { kieu: 'gDB', ke: [[8, 'lien', 's'], [3, 'mauhut', 's'], [2, 'lien', (s) => s > 1 ? s - 1 : 2]], keo: [[2.5, 7, 8], [4.8, 3, 2]], truoc: (T, B) => { B.vamp = 1; },
    c: [[0.2, 'Drag onto any of your turrets'], [2.5, 'Same star: both become a random turret', { ev: 'moi', cham: 0.5 }], [3.5, (T) => '+1 Vamp: +' + (SKILLS.mauhut.pv(T) * 100).toFixed(1) + '% damage each'], [4.8, (T) => 'Different star: 2 Vamp, ' + (T.sao >= 5 ? 300 : 220) + '% blood pulse', { cham: 0.7 }]], dai: 9 },
  // Hex Saboteur: PvP thu nhỏ — lượt nguyền chọn sẵn để cú gieo thật trúng (ca may mắn), chú thích nói đúng xác suất
  nguyenrua: { kieu: 'ghep', doi: [[4, 'canon', 3], [9, 'tia', 4], [14, 'set', 3]], truoc: (T, B) => sdHexTrung(B, T, 8),
    c: [[0.2, 'Merge two Hex Saboteurs'], [2.5, 'A hex flies at a rival turret', { cham: 0.6 }], [4.0, (T) => Math.round(SKILLS.nguyenrua.p(T) * 100) + '% chance: the rival turret loses 1★', { ev: 'sao', cham: 0.6 }], [5.2, 'Co-op: an ally turret gets +1★']] },
  // Sanctum: vào bàn lúc 1.8 s (triệu hồi thật → sinh/moiDen) → tẩy băng 2 ụ kề + khiên 1 lần; rồi hào quang sát thương
  thanhdia: { kieu: 'ht', ke: [[2, 'lien', 's'], [6, 'canon', 's'], [8, 'lien', 's'], [12, 'canon', 's']], dong: [2, 8], truoc: (T, B) => { if (T) B.t[T.o] = null; },
    them: [[1.8, (B, D, T) => { if (!T || B.t[7]) return; const N = sinhU(taoU(B, 'thanhdia', T.sao, 7)); N.goc = -Math.PI / 2; B.t[7] = N; VX.trieu(N); }]],
    c: [[0.2, 'Two turrets are frozen'], [1.8, 'Sanctum arrives: cleanses them', { ev: 'moi', cham: 0.7 }], [3.2, 'Neighbours get a 1-hit shield'], [4.6, (T) => 'Attack neighbours +' + sdBuf(T) + ' damage', { cham: 0.4 }]] },
  // Prism Thief: 2 ụ đồng pha màu (tuoi) → ghép CÙNG màu = COMBO thật; Prism Thief thứ 3 (ô 12) nhận sát thương
  bienmau: { kieu: 'ghep', ke: [[8, 'bienmau', 's'], [12, 'bienmau', 's']], keo: [4.2, 7, 8], so: { o: 12, k: 'dmg' }, truoc: (T, B) => { const P = B.t[8]; if (T && P) P.tuoi = T.tuoi + (T.uid % 3) - (P.uid % 3); },
    c: [[0.2, 'Shots cycle red, gold, blue'], [1.4, 'Red burns, gold crits, blue slows'], [3.0, 'Merge two of the same colour'], [4.2, (T) => 'Combo: every Prism Thief +' + (SKILLS.bienmau.pc(T) * 100).toFixed(1) + '% damage', { cham: 0.6 }]], dai: 9 },
};
// ---------- chỉ huy (Ma vương): chạm nút → kỹ năng thật (dungMV) ----------
const SD_MV = {
  hero: { ke: [[6, 'lien', 2], [8, 'canon', 2], [12, 'set', 1]], q: Q.hang(4, 180, 40, 8), mana: 1, manaDau: 60, mvT: 2.4,
    c: [[0.2, 'Reinforce: free turrets'], [1.4, 'Tap the commander'], [2.5, 'Two free 1★ turrets appear', { ev: 'moi', cham: 0.7 }], [5.0, 'Cost doubles each use']] },
  dahlia: { ke: [[2, 'lien', 3], [6, 'canon', 3], [7, 'sungluc', 3], [8, 'set', 3], [12, 'bang', 3]], q: Q.hang(3, 170, 46, 9).concat(Q.dong(14, 0.75, 9, 'bo', 1.2)), mana: 1, manaDau: 60, mvT: 2.6, dai: 13.6, glow: 1,
    c: [[0.2, 'Normal damage numbers'], [1.6, 'Tap the commander'], [2.7, 'Whole board: +100% damage', { cham: 0.7 }], [5.0, 'Every damage number doubles'], [8.4, 'Rage lasts 10 seconds']] },
  eve: { ke: [[2, 'lien', 3], [6, 'canon', 3], [7, 'sungluc', 4], [8, 'set', 3], [12, 'bang', 3]], dong: [6, 8], da: [12], q: Q.trum('freezer', 3.4, 90), mvT: 2.0, dai: 9.4,
    c: [[0.2, 'Debuffs lock your turrets'], [1.1, 'Tap the commander'], [2.1, 'Freeze, stone & burn cleared', { cham: 0.7 }], [3.4, 'The boss aims a skill…'], [4.8, 'Holy Shield blocks it', { ev: 'chan', cham: 0.7 }]] },
};
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
  tienhoa: ['Small amber pellets', 'Molten slug with splash', 'Golden spark beam'],
  lophanung: ['Cold aura, no shots', 'Aura deepens, freeze charging', 'Ice storm ready: tap to freeze'],
  soi: ['(no Pup stage)', 'Normal: double slash, two hits', 'Awakened: fast slashes that always crit'],
  orbital: ['Standby: no shots', 'Uplink: 2+ Orbitals', 'Awakened: area bomb salvos'],
  cuongno: ['Normal yellow tracers', 'Rage: hotter, faster rounds', 'Frenzy: twin rounds, fire bursts'],
  ngoisao: ['Small star shards', 'Star shards fly in pairs', 'Comets, and meteors every 5th'],
  lienket: ['Hollow ring bolt', 'Bolt drags a chain tether', 'Chain lashes a 2nd enemy'],
  dongbo: ['No same-star Attack turret', 'Synced: same-star turrets glow', 'Full sync: 3+ matched'],
  hydra: ['Needles at different enemies', 'Fan of instant needles', 'One giant piercing beam'],
  cuuvi: ['Straight foxfire orb', 'Foxfire curls with flame trail', 'Blue foxfire bursts in rings'],
  ngaithoigian: ['Piercing clock-hand dart', 'Dart stamps a slowing clock', 'Pierces the line, then echoes'],
  ronglua: ['Orange flame cone burns', 'Blue flame: +30% vs big', 'White flame, longer burning trail'],
  luoicheo: ['Diagonal damage buff', 'Buffed hits spark teal rings', 'Every 3rd shot shows an echo (visual only)'],
  chuato: ['Stingers plus orbiting drones', 'Drones boost neighbours\u2019 fire rate', 'Every 5th drone is gold'],
  leviathan: ['Bubble shot with splash', 'Eats big enemies too', 'Huge bubbles, eats flyers too'],
  combo: ['Warm-up: a plain core', 'On a roll: spinning rings', 'Overdrive: red-hot core'],
  pandora: ['Locked vault', 'Lid ajar, colours leak', 'Open: the 7★ merge fires 2 effects'],
  nemesis: ['Scales: plain executions', 'Scythe: heavier judgment', 'Executions leap to another enemy'],
  nhatthuc: ['Dusk: day and night swap', 'Corona: brighter swaps', 'Both modes on every swap'],
  loren: ['Cold forge', 'Bellows: forge heating', 'Hot forge: big bonus stored'],
  guongcong: ['One mirror pane', 'Twin mirror panes', 'Shard halo reflects twice'],
  marionette: ['Strings grab small enemies', 'Golden hand grabs big ones', 'Controls two puppets at once'],
  khoisinh: ['Rings raise your lowest turret', 'Neighbours get +15% damage', 'Each raise seeds a free 1★'],
  lualien: ['Cold relay: no flames yet', 'Kindled: 1 to 4 flames', 'Full blaze: 5 flames'],
  luutru: ['Empty shelves: under 10 charges', 'Filing: 10 to 29 charges', 'Grand archive: 30+ charges'],
};
// dòng số liệu cuối vòng (khi sk.mo là trạng thái tạm, không phải số liệu theo sao)
const SD_MO = {
  cuongno: (T) => 'Frenzy +' + Math.round(SKILLS.cuongno.them(T) * 100) + '% fire rate',
  lienket: () => '+40% damage per link',
  dongbo: (T) => 'Every ' + T.sao + '★ Attack turret +' + Math.round(SKILLS.dongbo.v(T) * 100) + '% damage',
  hopbi: (T) => 'Opens into ' + (T.sao >= 7 ? 5 : T.sao >= 5 ? 3 : 1) + '–' + (T.sao >= 7 ? 7 : 6) + '★',
  tienhoa: (T) => T.sao >= 7 ? 'Max 7★: fizzles — no skill' : 'Evolves into ' + Math.min(7, T.sao + 1) + '★',
  ngoisao: () => 'Every 10★ faster · every 50★ more damage',
  soi: (T) => Math.round(SKILLS.soi.tiLe(G.ban[T.ban]) * 100) + '% Awakened: always crits',
  guongcong: (T) => 'Resist ' + Math.round(Math.min(0.35, SKILLS.guongcong.khang(T)) * 100) + '% · mirror every ' + SKILLS.guongcong.h(T) + 's',
  combo: (T) => 'Each combo: +' + Math.round(SKILLS.combo.c(T) * 100) + '% damage',
  cuuvi: (T) => '9 foxfires ×' + SKILLS.cuuvi.heSo(T).toFixed(1),
  railgun: () => 'Full row / column of Railguns only',
  vughep: (T) => Math.round(knThe(G.ban[T.ban], 'vughep')) + '% Golden: target +2★',
  loren: (T) => '+' + +(SKILLS.loren.moi(T) * 100).toFixed(2) + '% per stack (max +60%) to your best gun',
  orbital: (T) => 'Merge: every Orbital awakens ' + SKILLS.orbital.dai(G.ban[T.ban]) + 's',
  nangluong: () => '+100% damage per 120 mana',
  mana: (T) => '+' + SKILLS.mana.luong(T) + ' mana every ' + SKILLS.mana.ky(T) + 's',
  lien: (T) => tocU(T).toFixed(1) + ' shots per second',
  phun: (T) => tocU(T).toFixed(1) + ' shots per second',
  xucxac: (T) => 'Damage ' + Math.round(dmgU(T) * 0.03) + '–' + Math.round(dmgU(T) * 3) + ' per shot',
  sungluc: (T) => 'Damage ' + Math.round(dmgU(T)) + ' per shot',
  nam: (T) => 'Damage ' + Math.round(dmgU(T)) + ' per punch',
  bomhen: (T) => 'Blast: +' + +(SKILLS.bomhen.yw(T) * 100).toFixed(2) + '% damage taken ' + SKILLS.bomhen.yeuDai(T) + 's',
  mimic: (T) => 'Result: +' + Math.round(knThe(G.ban[T.ban], 'mimic')) + '% attack for 8s',
  dichchuyen: () => 'Swap with a same-star turret',
  epxung: (T) => '+' + +knThe(G.ban[T.ban], 'epxung').toFixed(1) + '% fire rate per drag',
  vughep: () => 'Target +1★, keeps its type · 2 Merge Kings → Merge King +1★',
  saochep: (T) => 'Copy has ' + Math.round(heSaoChep(G.ban[T.ban]) * 100) + '% power',
  sinhdoi: (T) => Math.round(knThe(G.ban[T.ban], 'sinhdoi') || 10) + '% chance the twin is +1★',
  pandora: () => 'Merge: 1 of 6 vault effects',
  kepha: (T) => 'Merge: clamps ' + (1 + Math.floor(T.sao / 2)) + ' rival turrets',
  xaotron: (T) => 'Merge: shuffles ' + (1 + Math.floor(T.sao / 2)) + ' rival turrets',
  nhieusong: (T) => 'Merge: jams ' + SKILLS.nhieusong.n({ sao: Math.min(7, T.sao + 1) }) + ' rival turrets',
  cauvong: (T) => 'Neighbours +' + Math.round(SKILLS.cauvong.k(T) * 100) + '% vs enemies on it',
  ngaithoigian: (T) => 'Enemies slow up to ' + Math.round(SKILLS.ngaithoigian.sMax(T) * 100) + '%',
  hydra: (T) => T.sao >= 7 ? 'Fused head: ×6 piercing beam' : T.sao + (T.sao > 1 ? ' barrels' : ' barrel') + ', 55% damage each',
  chuato: (T) => 'Up to ' + (/\/(\d+)/.exec(SKILLS.chuato.mo(T)) || [0, 3])[1] + ' hunter drones',
  leviathan: () => 'Whirlpool tag under the cell = ABYSS (+4% damage each, MAX 100)',
  khoisinh: (T) => '+1★ to lowest every ' + SKILLS.khoisinh.g(T) + 's',
  ronglua: (T) => (T.sao >= 7 ? 'White' : T.sao >= 4 ? 'Blue' : 'Orange') + ' flame cone burns',
  anhsang: (T) => 'Free 1★ turret every ' + SKILLS.anhsang.ky(T).toFixed(0) + 's',
  haoquang: (T) => 'Tap: team barrier ' + SKILLS.haoquang.tg(T) + 's',
  laser: (T) => 'Beam ramps to ×4 over 3s',
  mortar: (T) => 'Damage ' + Math.round(dmgU(T)) + ', 46 px splash',
  no5: (T) => 'Damage ' + Math.round(dmgU(T)) + ' per shot',
  lualien: (T) => 'Each flame +' + VM1.pct(SKILLS.lualien.moiLua(T)) + '% damage, max 5',
  hopca: (T) => '+' + VM1.pct(SKILLS.hopca.moi(T)) + '% damage per same-star turret',
  luutru: (T) => '+' + VM1.pct(SKILLS.luutru.moi(T)) + '% damage per merge, max 40',
  xuonganh: (T) => 'Hero tile: +' + VM1.pct(SKILLS.xuonganh.v(T)) + '% fire rate, 12s',
  mauhut: (T) => '+' + (SKILLS.mauhut.pv(T) * 100).toFixed(1) + '% damage per Vamp, max 10',
  nguyenrua: (T) => 'Hex chance ' + Math.round(SKILLS.nguyenrua.p(T) * 100) + '%, 8s team cooldown',
  bienmau: (T) => 'Combo: +' + (SKILLS.bienmau.pc(T) * 100).toFixed(1) + '% damage, +4% fire rate',
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
  if (id === 'mimic' || sk.ghep) return 'ghep';
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
    them(2, 'lien', 2); them(6, 'canon', 1);
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
  const sChinh = ks.saoU || (ks.kieu === 'ghep' || ks.kieu === 'gDB' ? Math.min(s, 6) : s);
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
  v = sdNgan(String(v).replace(/^On merge:\s*/i, 'Merge: '));
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
      const c = B.o[T.o]; this.tay = { x: c.x, y: c.y, t0: this.t, keo: null };
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
const SD_Y0 = 150; // mép trên khung cắt (toạ độ logic) — khớp unitpage.js
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
    const da = []; for (const h of this.kq) if (this.t - h.t < 0.45 && !h.E.chet && !da.includes(h.E)) da.push(h.E);
    da.forEach((E, i) => sdChu(x, String(i + 1), E.x, E.y - (E.d.co || 40) * 0.58, '#ffffff', 14));
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
    const mx = 384, my = SD_Y0 + 24;
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
    const mx = 384, my = SD_Y0 + 24, cd = B.mv.cd;
    sdVe(x, 'ui_gia', mx, my, 88, 34);
    x.save(); x.beginPath(); x.arc(mx - 26, my, 11, 0, Math.PI * 2); x.clip(); sdVe(x, MAVUONG[B.mv.id].anh, mx - 26, my, 24); x.restore(); // vetay-ok: mask — mặt nạ cắt/mờ dần ảnh PNG
    sdChu(x, cd > 0 ? cd.toFixed(1) + 's' : 'Ready', mx + 9, my + 1, '#e6f6ff', 14);
  }
  // 14) chú thích (giữa trên) + thẻ mốc sao cuối vòng
  this.veChu(x, now);
  // 15) quay chậm: nhãn chữ
  if (G.tocDo < 1) sdChu(x, 'Slow-mo', W - 12, SD_Y0 + 54, '#ffe46b', 11, 'right');
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
  return { dau: m.n + '★ bonus', chu: sdNgan(SD_MOC_NGAN[m.mo] || m.mo) };
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
  const u = clamp((this.t - o.t0) / 0.18, 0, 1), cx = ks.mana || ks.cd ? 170 : W / 2, cy = SD_Y0 + 25;
  const chu = (o.dau ? o.dau + '  ' : '') + o.chu;
  x.font = '800 16px "TM UI", sans-serif';
  let w = x.measureText(chu).width; const fs = w > 250 ? 16 * 250 / w : 16; if (fs !== 16) w = 250;
  const bw = w + 44;
  x.globalAlpha = u; x.save(); x.translate(cx, cy); x.scale(0.94 + 0.06 * u, 0.94 + 0.06 * u); x.translate(-cx, -cy);
  sdVe(x, 'bang_wave_nen', cx, cy, bw, 40); // băng PNG; chưa nạp → chỉ chữ (bỏ hộp fillRect vẽ code)
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '800 ' + fs.toFixed(1) + 'px "TM UI", sans-serif';
  if (o.dau) { // đầu dòng màu vàng (sao / mốc) + phần chữ trắng
    const wd = x.measureText(o.dau + '  ').width, x0 = cx - w / 2;
    x.textAlign = 'left'; x.fillStyle = '#ffe46b'; x.fillText(o.dau, x0, cy + 1); x.fillStyle = '#f4f6f8'; x.fillText(o.chu, x0 + wd, cy + 1);
  } else { x.fillStyle = '#f4f6f8'; x.fillText(o.chu, cx, cy + 1); }
  x.restore(); x.globalAlpha = 1;
};

// ===================================================== khởi động trong iframe =====================================================
SD.moc();
window.SD = SD;
