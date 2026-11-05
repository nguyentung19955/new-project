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
const sdSC = (s) => { s = String(s || '').replace(/grow-?up\s*/ig, '').replace(/\bawaken(ed|s)?\b\s*/ig, '').replace(/\s+/g, ' ').trim(); return s.charAt(0).toUpperCase() + s.slice(1); };
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
  'Rewind restores 1 heart once (Co-op: 1 shared heart)': 'Rewind restores 1 heart once',
  'Merges into 6★+ roll twice, keep the better': 'Rolls twice, keeps the better',
  'Each swap: both modes 1.5s + ×4 ring blast': 'Each swap fires a ring blast',
  'Controls 2 enemies at once (4★+: big enemies too)': 'Controls 2 enemies at once',
  'Barrels fuse: ×6 piercing beam, 0.6/s': 'Barrels fuse into a beam',
  'Grow-up stage 2: +40% fire rate': 'Stage 2: +40% fire rate',
  'Stage 3: every hit crits, ×2 speed': 'Stage 3: every hit crits',
  'Unlocks the active skill (tap when full)': 'Unlocks the tap skill',
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
const SD_K = {
  canon: { q: Q.nhom(5, 175), c: [[0.2, 'Fires slow explosive shells'], [1.2, 'Blast hits the whole group', { ev: 'hit', cham: 0.5 }]] },
  xucxac: { q: Q.hang(3, 170, 50, 6), may: [5, 5.8], c: [[0.2, 'Each shot rolls 3–300% damage'], [1.5, 'Watch the numbers jump', { ev: 'hit', cham: 0.4 }], [4.8, 'Crits always roll the max', { ev: 'hit', cham: 0.5 }]] },
  lien: { q: Q.dong(7, 0.55, 3), c: [[0.2, 'Very fast fire at the lead'], [2.4, (T, s) => s >= 3 ? 'Stars make it fire faster' : 'More stars, faster fire', { cham: 0.4 }]] },
  phun: { q: Q.nhom(6, 185, 24, 6), c: [[0.2, 'Sprays bullets at random enemies'], [1.6, 'Every enemy gets peppered', { ev: 'hit', cham: 0.4 }]] },
  sungluc: { q: Q.hang(3, 170, 55, 2), c: [[0.2, 'One heavy shot, instant hit'], [0.8, 'Hits the lead enemy', { ev: 'hit', cham: 0.5 }]] },
  bang: { q: Q.hang(3, 180, 50, 8), c: [[0.2, 'Shoots the lead enemy'], [0.9, 'Hit enemies slow down 35%', { ev: 'hit', cham: 0.6 }]] },
  doc: { q: Q.nhom(4, 175, 22, 9), c: [[0.2, 'Poisons the lead enemy'], [1.2, 'Poison keeps ticking damage', { ev: 'hit', cham: 0.5 }]] },
  tia: { q: Q.to(6), c: [[0.2, 'Picks the toughest enemy'], [1.0, '+100% damage vs big enemies', { ev: 'hit', cham: 0.6 }]] },
  set: { q: Q.hang(7, 205, 28, 5), lien: 1, c: [[0.2, 'Lightning jumps between enemies'], [1.0, (T, s) => 'Chains to ' + s + (s > 1 ? ' enemies' : ' enemy'), { ev: 'hit', cham: 0.6 }]] },
  maychem: { q: Q.nho(), may: [3.2, 4.4], c: [[0.2, 'Shoots the lead enemy'], [3.0, 'Can instantly kill small enemies', { ev: 'kill', cham: 0.6 }]] },
  phagiap: { q: Q.hang(3, 175, 50, 7), c: [[0.2, 'Marks enemies as weakened'], [1.0, (T) => 'Weakened enemies take +' + Math.round(SKILLS.phagiap.k(T) * 100) + '% damage', { ev: 'hit', cham: 0.6 }]] },
  bua: { q: Q.hang(3, 175, 50, 6), may: [2.6, 4.2], c: [[0.2, 'Heavy hammer shots'], [2.4, 'Crits knock enemies back', { ev: 'hit', cham: 0.7 }]] },
  nam: { o: 2, q: Q.nhom(5, 175, 16, 8), c: [[0.2, 'Melee: only hits enemies nearby'], [1.6, 'Ring blasts hit all around', { ev: 'hit', cham: 0.5 }]] },
  bomhen: { q: Q.hang(4, 170, 34, 8), c: [[0.2, 'Sticks a bomb on an enemy'], [1.2, 'It explodes after 5 seconds'], [5.2, 'Boom! Blast hits nearby enemies', { ev: 'hit', cham: 0.6 }]], dai: 9 },
  nhanmana: { kieu: 'ghep', mana: 1, c: [[0.2, 'Merge two Mana Doublers'], [2.5, 'Merging gives bonus mana', { ev: 'mana', cham: 0.6 }]] },
  kiembang: { q: Q.nhom(4, 170, 22, 12), c: [[0.2, 'Each hit chills nearby enemies'], [1.4, 'Slowed enemies take ×5 damage', { ev: 'hit', cham: 0.6 }]] },
  mimic: { kieu: 'ghep', ban: 'canon', c: [[0.2, 'Joker: merges with any turret'], [2.5, 'Result gets +50% attack', { ev: 'sao', cham: 0.6 }]] },
  dichchuyen: { o: 2, q: Q.nhom(4, 170, 18, 9), ke: [[12, 'nam', 's']], keo: [2.6, 2, 12], c: [[0.2, 'Iron Fist is too far away'], [1.6, 'Drag onto a same-star turret'], [2.6, 'They swap places', { cham: 0.6 }], [4.2, 'Now it reaches the enemies']] },
  drone: { kieu: 'ghep', q: Q.hang(4, 175, 40, 5), c: [[0.2, 'Merge two Drone Bays'], [2.5, 'Merging launches bomb drones', { cham: 0.5 }], [4.4, 'Drones fly up the path']] },
  tron: { kieu: 'gDB', ban: 'canon', saoBan: (s) => Math.min(7, s + 2), c: [[0.2, 'Merges with any turret'], [2.5, 'New stars: average of both', { ev: 'sao', cham: 0.6 }]] },
  nangluong: { q: Q.hang(3, 175, 50, 8), mana: 1, manaDau: 60, truoc: null, them: [[3.4, (B) => { B.mana += 600; }]], c: [[0.2, 'Damage grows with your mana'], [3.4, 'More mana, bigger hits', { ev: 'hit', cham: 0.6 }]] },
  laser: { q: Q.hang(3, 180, 50, 14), c: [[0.2, 'Locks a beam on one enemy'], [2.2, 'Beam ramps up to ×4', { cham: 0.5 }]] },
  mortar: { q: Q.nhom(6, 185, 22, 7), c: [[0.2, 'Shells random enemies'], [1.2, 'Every 3rd shell splits apart', { ev: 'shot%3', cham: 0.7 }]] },
  vungdoc: { q: Q.dong(6, 0.6, 9), truoc: (T) => { T.nap = 0.85; }, c: [[0.2, 'Throws a poison pool'], [2.0, 'Enemies walking through get poisoned', { cham: 0.5 }]] },
  loa: { kieu: 'ghep', cd: 1, c: [[0.2, 'Your Archfiend skill is cooling'], [2.5, 'Merging cuts the cooldown', { cham: 0.6 }]] },
  hutmana: { q: Q.hang(4, 175, 40, 6), mana: 1, manaDau: 0, c: [[0.2, 'Every hit makes a little mana'], [2.0, 'Mana flows to your counter', { ev: 'mana', cham: 0.5 }]] },
  min: { q: Q.dong(6, 0.7, 6), truoc: (T) => { T.nap = 0.8; }, c: [[0.2, 'Lays mines on the path'], [2.6, 'Stepping on them explodes', { ev: 'hit', cham: 0.6 }]] },
  cuongno: { q: Q.dong(8, 0.5, 4), may: [1.8, 3.4], c: [[0.2, 'Crits build up rage'], [1.8, 'Two crits: fire-rate frenzy', { cham: 0.6 }]] },
  baotuyet: { q: Q.nhom(5, 180, 26, 10), truoc: (T) => { T.nap = 0.86; }, c: [[0.2, 'Blizzard every few seconds'], [1.3, 'Slows every enemy on the path', { cham: 0.6 }]] },
  nhanban: { kieu: 'ghep', c: [[0.2, 'Merge two Cloners'], [2.5, 'Merging summons a free turret', { ev: 'moi', cham: 0.6 }]] },
  lienket: { q: Q.hang(3, 175, 50, 6), ke: [[6, 'lienket', 's'], [8, 'lienket', 's']], c: [[0.2, 'Linked twins power each other'], [1.4, (T) => 'Chain of ' + (T.chuoi || 3) + ': +' + Math.round(0.4 * ((T.chuoi || 3) - 1) * 100) + '% damage', { ev: 'hit', cham: 0.5 }]] },
  kepha: { kieu: 'ghep', c: [[0.2, 'Merge two Jammers'], [2.5, 'Merging speeds up your turrets', { cham: 0.6 }]] },
  taylo: { kieu: 'ghep', dong: [2, 6], c: [[0.2, 'Two turrets are frozen'], [2.5, 'Merging clears their debuffs', { cham: 0.7 }]] },
  khien: { kieu: 'ghep', q: Q.trum('nightmare', 3.4, 80), c: [[0.2, 'Merge two Shield Gens'], [2.5, 'Merging shields your turrets', { cham: 0.5 }], [3.4, 'The boss aims a skill…'], [4.6, 'Shield blocks one boss skill', { cham: 0.6 }]], dai: 9 },
  hopbi: { kieu: 'phu', truoc: (T) => { T.tuoi = SKILLS.hopbi.can(T) - 3.2; }, c: [[0.2, 'Counts down, then opens'], [3.0, (T, s) => 'Becomes a random ' + (s >= 7 ? 5 : s >= 5 ? 3 : 1) + '–7★ turret', { ev: 'moi', cham: 0.6 }]] },
  nangsao: { kieu: 'ghep', c: [[0.2, 'Merge two Star Lifts'], [2.5, 'Another turret gets +1★', { ev: 'sao', cham: 0.6 }]] },
  xaotron: { kieu: 'ghep', c: [[0.2, 'Merge two Scramblers'], [2.5, 'Lonely turrets get a partner', { cham: 0.6 }]] },
  epxung: { kieu: 'gDB', ban: 'lien', c: [[0.2, 'Drag onto a same-star turret'], [2.5, '+65% fire rate, it stacks', { cham: 0.6 }]] },
  no5: { q: Q.nhom(5, 175, 20, 9), c: [[0.2, 'Counts its shots'], [1.0, '5th shot fires 3 exploding bolts', { ev: 'shot%5', cham: 0.7 }]] },
  bao: { q: Q.hang(6, 200, 30, 10), may: [2.4, 3.6], lien: 1, c: [[0.2, 'Instant hits, very fast'], [2.3, 'Some hits arc to another', { ev: 'hit', cham: 0.5 }]] },
  anhsang: { q: Q.hang(3, 170, 50, 6), truoc: (T) => { T.nap = 0.86; }, c: [[0.2, 'Light orbs charge up'], [1.4, 'Summons a free 1★ turret', { ev: 'moi', cham: 0.6 }]] },
  aten: { q: Q.nhom(4, 175, 22, 5), ke: [[6, 'doc', 's']], c: [[0.2, 'Venom poisons, Purifier punishes'], [1.6, '×4 damage vs poisoned', { ev: 'hit', cham: 0.5 }], [3.4, 'Kills explode on nearby enemies', { ev: 'kill', cham: 0.5 }]] },
  dongbo: { q: Q.hang(3, 175, 50, 7), ke: [[2, 'lien', 's'], [6, 'canon', 's'], [8, 'set', 's'], [12, 'bang', 's']], c: [[0.2, 'Counts turrets at its star'], [1.4, 'Each one adds damage', { ev: 'hit', cham: 0.5 }]] },
  railgun: { day: 1, q: Q.hang(3, 175, 50, 8), ke: [[5, 'lien', 1], [6, 'canon', 1], [8, 'set', 1], [9, 'bang', 1], [2, 'lien', 1], [12, 'canon', 1]], c: [[0.2, 'Fill its row: more damage'], [1.6, 'Fill its column: faster fire', { cham: 0.5 }], [3.2, 'Bingo powers the piercing shot', { ev: 'hit', cham: 0.5 }]] },
  vughep: { kieu: 'gDB', ban: 'canon', c: [[0.2, 'Drag onto a same-star turret'], [2.5, 'Target gets +1★, keeps type', { ev: 'sao', cham: 0.6 }]] },
  sinhdoi: { kieu: 'ghep', c: [[0.2, 'Merge two Twin Makers'], [2.5, 'Merging adds a same-star twin', { ev: 'moi', cham: 0.6 }]] },
  hasao: { kieu: 'ghep', c: [[0.2, 'Merge two Star Breakers'], [2.5, 'A turret gets +1★', { ev: 'sao', cham: 0.6 }]] },
  saochep: { kieu: 'gDB', ban: 'tia', c: [[0.2, 'Drag onto a same-star turret'], [2.5, 'Becomes a copy (half damage)', { cham: 0.6 }]] },
  ngoisao: { q: Q.hang(3, 175, 50, 6), ke: [[2, 'lien', 3], [6, 'canon', 3], [8, 'set', 3], [12, 'bang', 3]], c: [[0.2, 'Counts every star on the board'], [1.6, '10★ total: faster fire', { cham: 0.5 }]] },
  soi: { o: 2, q: Q.nhom(5, 175, 18, 6), c: [[0.2, 'Melee wolf claws nearby enemies'], [1.6, 'Kills make it grow stronger', { ev: 'kill', cham: 0.5 }]] },
  tienhoa: { kieu: 'phu', truoc: (T) => { T.tuoi = SKILLS.tienhoa.can(T) - 3.2; }, c: [[0.2, 'Charges up, then evolves'], [3.0, 'Becomes a random turret +1★', { ev: 'moi', cham: 0.6 }]] },
  cauvong: { q: Q.dong(6, 0.6, 9), truoc: (T) => { T.nap = 0.85; }, c: [[0.2, 'Paints a rainbow on the path'], [1.6, 'Enemies on it take +30% damage', { cham: 0.5 }]] },
  wallgen: { q: Q.dong(6, 0.55, 12), truoc: (T) => { T.nap = 0.7; }, c: [[0.2, 'Raises a wall on the path'], [2.6, 'Wall stops enemies, then explodes', { cham: 0.6 }]], dai: 9 },
  orbital: { kieu: 'ghep', q: Q.hang(4, 175, 40, 10), c: [[0.2, 'Merge two Orbitals'], [2.5, 'Merging calls a sky strike', { cham: 0.5 }], [4.2, 'Bombards the path for 20s']] },
  blackhole: { q: Q.nhom(6, 190, 24, 14), truoc: (T) => { T.nap = 0.85; }, c: [[0.2, 'Opens a black hole'], [1.4, 'Pulls enemies in and crushes', { cham: 0.7 }]] },
  overlord: { q: Q.nhom(6, 190, 22, 10), truoc: (T) => { T.nap = 0.55; }, c: [[0.2, 'Slowly charges a thunder blast'], [2.6, 'Huge blast hits the group', { ev: 'hit', cham: 0.7 }]] },
  lophanung: { q: Q.nhom(5, 180, 22, 30), cham: [4.0], truoc: (T) => { T.nap = 0.9; }, c: [[0.2, 'Freezing aura slows nearby enemies'], [4.0, 'Tap when charged: freeze all', { cham: 0.7 }]] },
  haoquang: { q: Q.trum('freezer', 2.0, 90), cham: [3.0], truoc: (T) => { T.nap = 1; T.napDay = -99; }, c: [[0.2, 'Holy beam with splash'], [2.0, 'The boss aims a skill…'], [3.0, 'Tap: the board is invincible', { cham: 0.7 }]], dai: 9 },
  nayda: { q: Q.hang(7, 205, 30, 6), lien: 1, c: [[0.2, 'Disc bounces between enemies'], [1.0, (T, s) => 'Bounces ' + s + (s > 1 ? ' times' : ' time') + ', stronger each', { ev: 'hit', cham: 0.7 }]] },
  combo: { kieu: 'ghep', ke: [[2, 'combo', 's']], c: [[0.2, 'Merge two Combo Cores'], [2.5, 'Every Combo Core powers up', { cham: 0.6 }]] },
  khoathoigian: { q: Q.hang(3, 175, 50, 12), truoc: (T) => { T.nap = 0.86; }, c: [[0.2, 'Freezes the lead enemy in time'], [1.2, 'Damage is stored while locked', { cham: 0.5 }], [2.6, 'Release: stored damage bursts', { ev: 'hit', cham: 0.5 }]] },
  hydra: { q: Q.hang(7, 205, 28, 7), lien: 1, c: [[0.2, (T, s) => s >= 7 ? 'Barrels fuse into a beam' : s + (s > 1 ? ' barrels' : ' barrel') + ', different targets'], [1.2, (T, s) => s >= 7 ? 'Pierces the whole line' : 'Each barrel picks its own', { ev: 'hit', cham: 0.6 }]] },
  cuuvi: { q: Q.dong(9, 0.4, 1), truoc: (T) => { T.duoi = 6; }, c: [[0.2, 'Kills grow fire tails'], [1.8, '9 tails: homing foxfires', { cham: 0.7 }]] },
  pandora: { kieu: 'ghep', c: [[0.2, 'Merge two Pandora Vaults'], [2.5, 'Opens 1 of 6 big effects', { cham: 0.7 }]] },
  luoicheo: { kieu: 'ht', ke: CHEO4.map((o, i) => [o, i % 2 ? 'canon' : 'lien', 's']), c: [[0.2, 'Buffs the 4 diagonal cells'], [2.0, 'All 4 filled: resonance', { cham: 0.5 }]] },
  ngaithoigian: { q: Q.nhom(5, 200, 26, 30), cham: [4.2], truoc: (T) => { T.nap = 0.92; T.napDay = -99; }, c: [[0.2, 'Enemies slow down over time'], [4.2, 'Tap: rewind pushes enemies back', { cham: 0.7 }]], dai: 9 },
  nemesis: { q: Q.trum('janus', 99, 40).concat(Q.hang(2, 210, 40, 3)), c: [[0.2, 'Executes enemies at low HP'], [2.4, 'Bosses lose chunks of max HP', { ev: 'hit', cham: 0.5 }]] },
  docton: { q: Q.dong(8, 0.5, 4), them: [[4.2, (B) => { const N = sinhU(taoU(B, 'lien', SD.sao, 8)); B.t[8] = N; VX.trieu(N); }]], c: [[0.2, 'Alone: double fire rate'], [4.2, 'A neighbour cancels the bonus', { cham: 0.6 }]] },
  thaukinh: { kieu: 'ht', may: [1.8, 3.4, 'ke'], q: Q.hang(5, 200, 30, 8), c: [[0.2, 'Neighbours’ crits hit harder'], [1.8, 'Crits pierce through enemies', { cham: 0.5 }]] },
  nhieusong: { kieu: 'ghep', c: [[0.2, 'Merge two Signal Jammers'], [2.5, 'Merging slows all enemies', { cham: 0.6 }]] },
  santhuong: { q: Q.to(4), mana: 1, manaDau: 0, truoc: (T) => { T.nap = 0.86; }, c: [[0.2, 'Marks an enemy (big first)'], [2.0, 'Marked kills give bonus mana', { ev: 'mana', cham: 0.6 }]] },
  nhatthuc: { q: Q.hang(4, 180, 40, 14), truoc: (T) => { T.doiT = 3.6; }, c: [[0.2, 'Day: a burning beam'], [3.6, 'Night: a slowing wave', { cham: 0.6 }]] },
  loren: { kieu: 'gDB', ban: 'lien', saoBan: 1, keoNguoc: 1, c: [[0.2, 'Feed it a 1–3★ turret'], [2.5, 'Each one adds damage stacks', { cham: 0.6 }]] },
  guongcong: { q: Q.trum('octopus', 1.6, 90), truoc: (T) => { T.nap = 1; }, c: [[0.2, 'Charges a mirror shield'], [1.6, 'The boss aims a skill…'], [3.0, 'The mirror blocks it', { cham: 0.6 }]] },
  marionette: { q: Q.hang(4, 190, 36, 14), truoc: (T) => { T.nap = 0.86; }, c: [[0.2, 'Takes control of an enemy'], [1.6, 'Walks it back, then boom', { cham: 0.5 }]], dai: 9 },
  chuato: { q: Q.hang(5, 200, 36, 8), cham: [4.6], truoc: (T) => { T.nap = 0.95; T.napDay = -99; T.de = 99; }, c: [[0.2, 'Breeds hunter drones'], [4.6, 'Tap: the swarm dives in', { cham: 0.7 }]], dai: 9 },
  leviathan: { q: Q.nho().concat([{ k: 'khong_lo', s: 30, h: 30 }]), cham: [4.6], truoc: (T) => { T.nap = 0.95; T.napDay = -99; T.nuot = 99; }, c: [[0.2, 'Devours a small enemy'], [1.4, 'Each meal stacks damage'], [4.6, 'Tap: tidal breath sweeps', { cham: 0.7 }]], dai: 9 },
  khoisinh: { kieu: 'phu', cham: [4.6], truoc: (T) => { T.sinhT = SKILLS.khoisinh.g(T) - 1.4; T.nap = 0.95; T.napDay = -99; }, ke: [[6, 'lien', 1], [8, 'canon', 2], [2, 'set', 3]], c: [[0.2, 'Raises your lowest turret'], [1.4, 'Lowest turret gets +1★', { ev: 'sao', cham: 0.6 }], [4.6, 'Tap: summons new turrets', { cham: 0.6 }]], dai: 9 },
  ronglua: { q: Q.nhom(6, 190, 20, 12), cham: [4.6], truoc: (T) => { T.nap = 0.95; T.napDay = -99; }, c: [[0.2, 'Flame cone burns crowds'], [4.6, 'Tap: dragon dives the path', { cham: 0.7 }]], dai: 9 },
  mana: { kieu: 'phu', mana: 1, manaDau: 0, truoc: (T) => { T.nap = 0.8; }, c: [[0.2, 'Does not shoot'], [1.2, (T) => 'Makes mana every ' + SKILLS.mana.ky(T) + 's', { ev: 'mana', cham: 0.6 }]] },
  chimang: { may: [2.0, 3.6, 'ke'], c: [[0.2, 'Gives 4 neighbours crit chance'], [2.0, 'Crits deal double damage', { cham: 0.5 }]] },
  radar: { c: [[0.2, 'Speeds up 4 turrets around it'], [2.0, (T) => 'Each gets +' + sdBuf(T) + ' fire rate', { cham: 0.4 }]] },
  lanhgia: { c: [[0.2, 'Neighbours’ shots also slow'], [1.6, 'Slow spreads to every target', { cham: 0.5 }]] },
  khuech: { c: [[0.2, 'Buffs the 4 turrets around it'], [2.0, (T) => 'Each gets +' + sdBuf(T) + ' damage', { cham: 0.4 }]] },
  tuthan: { q: Q.nho().concat(Q.dong(6, 0.6, 2, 'nho', 1.5)), may: [2.2, 3.6, 'ke'], c: [[0.2, 'Neighbours may reap small enemies'], [2.2, 'Reaped souls explode', { ev: 'kill', cham: 0.6 }]] },
};
// đòn đánh theo dạng (nút Stage 1/2/3)
const SD_GD = {
  overlord: ['Silent charge, no shots', 'Sparks jump to nearby enemies', 'Sky pillar plus aftershock arcs'],
  hopbi: ['Weak card shard poke', 'Three spinning bolts at once', 'Stops shooting: about to open'],
  tienhoa: ['Small amber pellets', 'Molten slug with splash', 'Golden spark beam'],
  lophanung: ['Frost ring sweeps out', 'Ice needles hit slowest enemies', 'Ice storm shatters enemies'],
  soi: ['Single claw swipe', 'Double slash, two hits', 'Fast slashes that always crit'],
  orbital: ['Small cyan bolt', 'Marker locks before impact', 'Every shot calls 3 sky lances'],
  cuongno: ['Normal yellow tracers', 'Rage: hotter, faster rounds', 'Frenzy: twin rounds, fire bursts'],
  ngoisao: ['Small star shards', 'Star shards fly in pairs', 'Comets, and meteors every 5th'],
  lienket: ['Hollow ring bolt', 'Bolt drags a chain tether', 'Chain lashes a 2nd enemy'],
  dongbo: ['Single gold pellet', 'Pellets pulse on one beat', 'Instant converging gold beam'],
  hydra: ['Needles at different enemies', 'Fan of instant needles', 'One giant piercing beam'],
  cuuvi: ['Straight foxfire orb', 'Foxfire curls with flame trail', 'Blue foxfire bursts in rings'],
  ngaithoigian: ['Piercing clock-hand dart', 'Dart stamps a slowing clock', 'Pierces the line, then echoes'],
  ronglua: ['Orange flame cone burns', 'Blue flame: +30% vs big', 'White flame, longer burning trail'],
  luoicheo: ['Diagonal damage buff', 'Buffed hits spark teal rings', 'Every 3rd shot adds an echo'],
  chuato: ['Stingers plus orbiting drones', 'Drones boost neighbours\u2019 fire rate', 'Every 5th drone is gold'],
  leviathan: ['Bubble shot with splash', 'Wider splash, eats big enemies', 'Huge bubbles, eats flyers too'],
  combo: ['Warm-up: a plain core', 'On a roll: spinning rings', 'Overdrive: red-hot core'],
  pandora: ['Locked vault', 'Lid ajar, colours leak', 'Open: every merge, 2 effects'],
  nemesis: ['Scales: plain executions', 'Scythe: heavier judgment', 'Executions leap to another enemy'],
  nhatthuc: ['Dusk: day and night swap', 'Corona: brighter swaps', 'Both modes on every swap'],
  loren: ['Cold forge', 'Bellows: hotter shots', 'Hot shards hit 2 more'],
  guongcong: ['One mirror pane', 'Twin mirror panes', 'Shard halo reflects twice'],
  marionette: ['Strings grab small enemies', 'Golden hand grabs big ones', 'Controls two puppets at once'],
  khoisinh: ['Rings raise your lowest turret', 'Neighbours get +15% damage', 'Each raise seeds a free 1★'],
};
// dòng số liệu cuối vòng (khi sk.mo là trạng thái tạm, không phải số liệu theo sao)
const SD_MO = {
  cuongno: (T) => 'Frenzy +' + Math.round(SKILLS.cuongno.them(T) * 100) + '% fire rate',
  lienket: () => '+40% damage per link',
  dongbo: () => 'More same-star turrets, more damage',
  hopbi: (T) => 'Opens into ' + (T.sao >= 7 ? 5 : T.sao >= 5 ? 3 : 1) + '–7★',
  tienhoa: (T) => 'Evolves into ' + Math.min(7, T.sao + 1) + '★',
  ngoisao: () => '50★ total: huge damage',
  soi: () => 'Kills and stars grow it',
  guongcong: (T) => 'Mirror every ' + SKILLS.guongcong.h(T) + 's',
  combo: () => 'Each combo: +6% damage',
  cuuvi: (T) => '9 foxfires ×' + SKILLS.cuuvi.heSo(T).toFixed(1),
  railgun: () => 'Bingo: row and column bonus',
  loren: () => 'Forge stacks up to 60',
  orbital: () => 'Merge: 20s sky strike',
  nangluong: () => '+100% damage per 120 mana',
  mana: (T) => '+' + SKILLS.mana.luong(T) + ' mana every ' + SKILLS.mana.ky(T) + 's',
  lien: (T) => tocU(T).toFixed(1) + ' shots per second',
  phun: (T) => tocU(T).toFixed(1) + ' shots per second',
  xucxac: (T) => 'Damage ' + Math.round(dmgU(T) * 0.03) + '–' + Math.round(dmgU(T) * 3) + ' per shot',
  sungluc: (T) => 'Damage ' + Math.round(dmgU(T)) + ' per shot',
  nam: (T) => 'Damage ' + Math.round(dmgU(T)) + ' per punch',
  bomhen: () => 'Bomb blasts ×5 after 5s',
  mimic: () => 'Result: +50% attack for 8s',
  dichchuyen: () => 'Swap with a same-star turret',
  tron: () => 'Stars = average, +1 if equal',
  epxung: () => '+65% fire rate per drag',
  vughep: () => 'Target +1★, keeps its type',
  saochep: () => 'Copy deals 50% damage',
  nangsao: () => 'Result keeps stars, +1★ elsewhere',
  pandora: () => 'Merge: 1 of 6 vault effects',
  kepha: (T) => 'Merge: +' + Math.round((0.4 + 0.05 * T.sao) * 100) + '% speed to ' + (1 + Math.floor(T.sao / 2)) + ' turrets',
  xaotron: () => 'Merge: lonely turrets get partners',
  hasao: () => 'Merge: +1★ to a turret',
  nhieusong: () => 'Merge: slows all enemies 20%',
  cauvong: () => 'Rainbow: +30% damage taken',
  ngaithoigian: () => 'Enemies slow up to 15%',
  hydra: (T) => T.sao >= 7 ? 'Fused head: ×6 piercing beam' : T.sao + (T.sao > 1 ? ' barrels' : ' barrel') + ', 55% damage each',
  chuato: (T) => 'Up to ' + (/\/(\d+)/.exec(SKILLS.chuato.mo(T)) || [0, 3])[1] + ' hunter drones',
  leviathan: () => 'Each meal adds damage stacks',
  khoisinh: (T) => '+1★ to lowest every ' + SKILLS.khoisinh.g(T) + 's',
  ronglua: (T) => (T.sao >= 7 ? 'White' : T.sao >= 4 ? 'Blue' : 'Orange') + ' flame cone burns',
  anhsang: (T) => 'Free 1★ turret every ' + SKILLS.anhsang.ky(T).toFixed(0) + 's',
  haoquang: (T) => 'Tap: invincible board ' + (3 + 0.5 * T.sao).toFixed(1) + 's',
  laser: (T) => 'Beam ramps to ×4 over 3s',
  mortar: (T) => 'Damage ' + Math.round(dmgU(T)) + ', 46 px splash',
  no5: (T) => 'Damage ' + Math.round(dmgU(T)) + ' per shot',
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
    if (!SD_K[id] || !SD_K[id].ke) for (const [i, o] of (sk.huong ? CHEO4 : KE4).entries()) r.ke.push([o, i % 2 ? 'canon' : 'lien', 's']);
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
  if (!SKILLS[id] || !G.rosterMap[id]) return;
  const doi = id !== this.id;
  this.id = id; this.sao = clamp(sao || 1, 1, 7); this.gd = gd || 0;
  if (doi || !G.ban.length) {
    const deck = [id].concat(['lien', 'canon', 'set', 'bang', 'sungluc'].filter(x => x !== id)).slice(0, 5);
    batDau('solo', deck, 'hero');
  }
  G.cho = 1e9; G.wave = 6; G.tocDo = 1; G.dung = !!this.dungMuon;
  this.ks = sdKichBan(id);
  this.xep();
};
SD.xep = function () {
  const id = this.id, s = this.sao, ks = this.ks;
  SD_RNG.s = 1234567 + s * 101 + (this.gd || 0) * 7;
  const deck = G.ban[0] ? G.ban[0].deck : [id];
  const B = taoBan(boCuc('solo').ban[0], 0, deck, 'hero');
  G.ban = [B]; this.B = B;
  G.quai.length = 0; G.dan.length = 0; G.hu.length = 0; G.bay.length = 0; G.hang.length = 0; FX.reset(); VX.reset();
  UI.xemHT = null; UI.xemU = null;
  B.mana = ks.manaDau != null ? ks.manaDau : 999; B.gia = 10; G.tocDo = 1;
  const dat = (o, x, sao) => { const T = sinhU(taoU(B, x, sao, o)); B.t[o] = T; T.cd = 0.15 + 0.1 * (o % 3); T.goc = -Math.PI / 2; return T; };
  // ụ chính (ghép: chưa thể là 7★)
  const sChinh = ks.saoU || (ks.kieu === 'ghep' || ks.kieu === 'gDB' ? Math.min(s, 6) : s);
  this.T = dat(ks.o, id, sChinh);
  if (this.gd) this.T._epGd = this.gd;
  for (const [o, x, ss] of ks.ke) { const N = dat(o, x, ss === 's' ? sChinh : typeof ss === 'function' ? ss(sChinh) : ss); if (this.gd && x === id) N._epGd = this.gd; }
  if (ks.dong) for (const o of ks.dong) if (B.t[o]) B.t[o].st.bang = 99;
  for (const T of B.t) if (T) T.gd = null;
  if (ks.truoc) try { ks.truoc(this.T, B); } catch (e) { }
  if (ks.cd) B.mv.cd = MAVUONG[B.mv.id].cd;
  // máu quái: theo sát thương 1 phát của ụ chính (ụ không bắn: theo sức bắn cả bàn)
  let d1 = 0; try { if (SKILLS[id].dmg) d1 = dmgU(this.T); } catch (e) { }
  if (!(d1 > 0)) { for (const T of B.t) if (T) { try { if (SKILLS[T.id].dmg) d1 = Math.max(d1, dmgU(T)); } catch (e) { } } }
  this.d1 = Math.max(4, d1 || 20);
  this.hen = ks.q.map(q => Object.assign({}, q, { t: q.t || 0, xong: false }));
  this.t = 0; this.lap++; this.tRe = performance.now();
  this.da = new Set(B.t.filter(Boolean).map(T => T.uid));
  this.saoCu = {}; for (const T of B.t) if (T) this.saoCu[T.uid] = T.sao;
  this.kq = []; this.soMana = []; this.moi = []; this.vet = {}; this.nhan = []; this.manaCu = B.mana; this.banCu = 0;
  this.cIdx = -1; this.chamDen = -1; this.cho = null; this.keoXong = false; this.chamXong = {}; this.themXong = {};
  this.ev = {};
  this.moSao = sdMoSao(id, this.T);
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
  if (ks.keo && !this.keoXong && this.t >= ks.keo[0]) {
    this.keoXong = true;
    const a = B.t[ks.keo[1]], b = B.t[ks.keo[2]];
    if (a && b && hopLeGhep(a, b)) { const r = ghep(B, a, b); if (r && r.id === this.id) this.T = r; else if (B.t[ks.keo[2]] && B.t[ks.keo[2]].id === this.id) this.T = B.t[ks.keo[2]]; else if (B.t[ks.keo[1]] && B.t[ks.keo[1]].id === this.id) this.T = B.t[ks.keo[1]]; }
  }
  if (ks.cham) for (const tc of ks.cham) if (!this.chamXong[tc] && this.t >= tc) {
    this.chamXong[tc] = true;
    const T = this.T, sk = SKILLS[this.id];
    if (T && B.t[T.o] === T && sk.chuDong && !sdKhoa()) {
      T.nap = 1; try { sk.chuDong(G, B, T); } catch (e) { }
      const c = B.o[T.o]; this.tay = { x: c.x, y: c.y, t0: this.t, keo: null };
    }
  }
  if (ks.them) ks.them.forEach(([tt, fn], i) => { if (!this.themXong[i] && this.t >= tt) { this.themXong[i] = true; try { fn(B); } catch (e) { } } });
  // phát hiện sự kiện: bắn thứ N, mana tăng, sao tăng, ụ mới
  const T = this.T && B.t[this.T.o] === this.T ? this.T : null;
  if (T && T.banLan !== this.banCu) { this.banCu = T.banLan; this.phat('shot'); for (const n of [3, 5]) if (T.banLan % n === 0) this.phat('shot%' + n); }
  if (B.mana > this.manaCu + 0.5) {
    const n = Math.round(B.mana - this.manaCu);
    if (n < 400) { const c = B.o[(T || T0).o]; const E = this.giet && G.t - this.giet.t < 0.05 ? this.giet.E : null; this.soMana.push({ x: E ? E.x : c.x, y: E ? E.y : c.y - 10, n, t0: performance.now() }); this.phat('mana'); }
  }
  this.manaCu = B.mana;
  for (const X of B.t) if (X) {
    if (!this.da.has(X.uid)) { this.da.add(X.uid); this.saoCu[X.uid] = X.sao; if (this.t > 0.3) { this.moi.push({ T: X, t0: performance.now(), k: 'moi' }); this.phat('moi'); if (X.id === this.id) this.T = X; } }
    else if (X.sao > this.saoCu[X.uid]) { this.saoCu[X.uid] = X.sao; this.moi.push({ T: X, t0: performance.now(), k: 'sao' }); this.phat('sao'); }
  }
  if (this.cho && this.t > this.cho.t1) this.cho = null;
  G.tocDo = this.t < this.chamDen ? 0.32 : 1;
  if (this.t >= ks.dai) this.xep();
};
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
  const _ve0 = REN.ve0.bind(REN);
  REN.ve0 = function () { _ve0(); try { SD.veLop(REN.ctx); } catch (e) { console.error(e); } };
};

// ===================================================== lớp vẽ chú thích =====================================================
const SD_Y0 = 150; // mép trên khung cắt (toạ độ logic) — khớp unitpage.js
function sdRR(x, X, Y, w, h, r) { x.beginPath(); if (x.roundRect) x.roundRect(X, Y, w, h, r); else x.rect(X, Y, w, h); }
SD.veLop = function (x) {
  if (!this.ks || !G.ban.length) return;
  const B = G.ban[0], k = REN.s * REN.dpr, now = performance.now(), ks = this.ks, m = tierOf(this.id).mau;
  x.save(); x.setTransform(k, 0, 0, k, 0, 0); x.globalCompositeOperation = 'source-over'; x.lineCap = 'round'; x.lineJoin = 'round';
  // 1) bàn 3×3: làm mờ 2 cột rìa
  if (!ks.day) {
    x.fillStyle = 'rgba(14,16,20,0.62)';
    for (const c of [0, 4]) { const a = B.o[c], z = B.o[10 + c]; sdRR(x, a.x - B.cw * 0.5, a.y - B.ch * 0.52, B.cw, z.y - a.y + B.ch * 1.04, 8); x.fill(); }
  }
  const T = this.T && B.t[this.T.o] === this.T ? this.T : null;
  // 2) ụ chính: vòng chỉ định nhỏ dưới bệ
  if (T) { const c = B.o[T.o]; x.globalAlpha = 0.55 + 0.25 * Math.sin(now / 260); x.strokeStyle = m; x.lineWidth = 2; x.setLineDash([5, 5]); x.lineDashOffset = -now / 60; x.beginPath(); x.arc(c.x, c.y, B.cw * 0.52, 0, 7); x.stroke(); x.setLineDash([]); x.globalAlpha = 1; }
  // 3) mục tiêu đang ngắm (ụ bắn, chú thích đầu)
  if (T && T.muc && !T.muc.chet && SKILLS[this.id].dmg && this.cIdx <= 0 && !ks.lien) this.veNgam(x, T.muc.x, T.muc.y, (T.muc.d.co || 40) * 0.42, m, now);
  // 4) biểu tượng trạng thái trên quái
  for (const E of G.quai) if (!E.chet && E.vao > 0.5) {
    let ix = E.x + (E.d.co || 40) * 0.32, iy = E.y - (E.d.co || 40) * 0.42; const ds = [];
    if (E.chan > 0) ds.push('dung'); else if (E.cham > 0 && E.chamT > 0) ds.push('cham');
    if (E.docT > 0) ds.push('doc');
    if (E.yeu > 0 || E.cvT > 0 || E.fbT > 0 || E.azT > 0) ds.push('yeu');
    for (const d of ds) { this.veIcon(x, d, ix, iy); ix += 13; }
  }
  // 5) thứ tự trúng (chuỗi / nảy / nhiều nòng): số 1-2-3 trên quái trúng trong 0,7 s gần nhất
  if (ks.lien) {
    const da = []; for (const h of this.kq) if (this.t - h.t < 0.45 && !h.E.chet && !da.includes(h.E)) da.push(h.E);
    let i = 0, truoc = null;
    for (const E of da) {
      i++;
      if (truoc) { x.globalAlpha = 0.5; x.strokeStyle = '#fff'; x.lineWidth = 1.5; x.setLineDash([3, 4]); x.beginPath(); x.moveTo(truoc.x, truoc.y - 4); x.lineTo(E.x, E.y - 4); x.stroke(); x.setLineDash([]); x.globalAlpha = 1; }
      this.veSo(x, E.x, E.y - (E.d.co || 40) * 0.55, i, m); truoc = E;
    }
  }
  // 6) hỗ trợ: ký hiệu buff + % trên từng ụ được buff, tia nối
  if (ks.buff && T) {
    const c0 = B.o[T.o];
    for (const N of B.t) if (N && N !== T && N.nguon) {
      const ng = N.nguon.filter(n => n.T === T); if (!ng.length) continue;
      const c = B.o[N.o], u = (now / 900 + N.o * 0.13) % 1;
      x.globalAlpha = 0.6; x.strokeStyle = BUFF[ng[0].k] ? BUFF[ng[0].k].mau : m; x.lineWidth = 2; x.setLineDash([2, 6]); x.lineDashOffset = -now / 40;
      x.beginPath(); x.moveTo(c0.x, c0.y); x.lineTo(c.x, c.y); x.stroke(); x.setLineDash([]);
      x.globalAlpha = 1 - u; x.fillStyle = x.strokeStyle; x.beginPath(); x.arc(c0.x + (c.x - c0.x) * u, c0.y + (c.y - c0.y) * u, 3, 0, 7); x.fill();
      x.globalAlpha = 1; this.veNhan(x, c.x, c.y - B.ch * 0.5, '+' + Math.round(ng[0].v * 100) + '%', BUFF[ng[0].k] ? BUFF[ng[0].k].mau : m, ng[0].k);
    }
  }
  // 7) ụ mới / ụ lên sao: vòng sáng + nhãn
  this.moi = this.moi.filter(o => now - o.t0 < 1600);
  for (const o of this.moi) {
    if (!B.t[o.T.o] || B.t[o.T.o] !== o.T) continue;
    const c = B.o[o.T.o], u = (now - o.t0) / 1600;
    x.globalAlpha = 1 - u; x.strokeStyle = o.k === 'sao' ? '#ffe46b' : '#7dffb0'; x.lineWidth = 3;
    x.beginPath(); x.arc(c.x, c.y, B.cw * (0.45 + 0.15 * Math.sin(u * Math.PI)), 0, 7); x.stroke(); x.globalAlpha = 1;
    this.veMuiTen(x, c.x, c.y - B.ch * 0.62 - 8 * Math.abs(Math.sin(now / 160)), x.strokeStyle);
    if (o.k === 'moi') this.veNhan(x, c.x, c.y + B.ch * 0.5, 'New', '#7dffb0');
  }
  // 8) kéo-ghép: bàn tay + mũi tên cong 1 s trước khi thả
  if (ks.keo && this.t > ks.keo[0] - 1.1 && this.t < ks.keo[0] + 0.15) {
    const a = B.o[ks.keo[1]], b = B.o[ks.keo[2]], u = clamp((this.t - (ks.keo[0] - 1.1)) / 1.0, 0, 1);
    const mx = (a.x + b.x) / 2, my = Math.min(a.y, b.y) - 34;
    x.strokeStyle = '#fff'; x.lineWidth = 3; x.globalAlpha = 0.85; x.setLineDash([6, 5]);
    x.beginPath(); x.moveTo(a.x, a.y); x.quadraticCurveTo(mx, my, b.x, b.y); x.stroke(); x.setLineDash([]);
    const px = (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * mx + u * u * b.x, py = (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * my + u * u * b.y;
    x.globalAlpha = 1; this.veTay(x, px, py, false);
    x.strokeStyle = '#ffe46b'; x.lineWidth = 2.5; x.globalAlpha = 0.6 + 0.4 * Math.sin(now / 120); x.beginPath(); x.arc(b.x, b.y, B.cw * 0.5, 0, 7); x.stroke(); x.globalAlpha = 1;
  }
  // 9) chạm kỹ năng chủ động
  if (ks.cham && !sdKhoa()) for (const tc of ks.cham) if (this.t > tc - 0.9 && this.t < tc + 0.5 && T) {
    const c = B.o[T.o], u = this.t < tc ? 0 : (this.t - tc) / 0.5;
    if (u > 0) { x.globalAlpha = 1 - u; x.strokeStyle = '#fff'; x.lineWidth = 3; x.beginPath(); x.arc(c.x, c.y, 14 + 40 * u, 0, 7); x.stroke(); x.globalAlpha = 1; }
    this.veTay(x, c.x + 6, c.y + 8 - (this.t < tc ? 6 * Math.abs(Math.sin(now / 130)) : 0), u > 0);
  }
  // 10) mana: ô đếm góc phải trên + số bay về
  if (ks.mana) {
    const mx = 386, my = SD_Y0 + 24;
    x.fillStyle = 'rgba(10,12,16,0.82)'; sdRR(x, mx - 40, my - 14, 80, 28, 14); x.fill();
    x.strokeStyle = '#c77dff'; x.lineWidth = 1.5; x.stroke();
    const im = REN.img && REN.img('ui_mana'); if (im) x.drawImage(im, mx - 36, my - 11, 22, 22); else { x.fillStyle = '#c77dff'; x.beginPath(); x.arc(mx - 25, my, 8, 0, 7); x.fill(); }
    x.fillStyle = '#f1e6ff'; x.font = '800 15px "TM Display", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(Math.round(B.mana)), mx + 10, my + 1);
    this.soMana = this.soMana.filter(o => now - o.t0 < 900);
    for (const o of this.soMana) {
      const u = VX.eo((now - o.t0) / 900), px = o.x + (mx - 10 - o.x) * u, py = o.y + (my - o.y) * u - Math.sin(u * Math.PI) * 30;
      x.globalAlpha = 1 - Math.max(0, u - 0.8) * 5; x.font = '800 14px "TM Display", sans-serif'; x.lineWidth = 3; x.strokeStyle = '#1a0d26'; x.strokeText('+' + o.n, px, py); x.fillStyle = '#e6c8ff'; x.fillText('+' + o.n, px, py);
    }
    x.globalAlpha = 1;
  }
  // 11) hồi chiêu Archfiend (Cooldown Horn)
  if (ks.cd) {
    const mx = 386, my = SD_Y0 + 24, cd = B.mv.cd, tong = MAVUONG[B.mv.id].cd;
    x.fillStyle = 'rgba(10,12,16,0.82)'; sdRR(x, mx - 40, my - 14, 80, 28, 14); x.fill();
    x.strokeStyle = '#6fc8ff'; x.lineWidth = 1.5; x.stroke();
    x.beginPath(); x.moveTo(mx - 25, my); x.arc(mx - 25, my, 9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - cd / tong)); x.closePath(); x.fillStyle = '#6fc8ff'; x.fill();
    x.fillStyle = '#e6f6ff'; x.font = '800 14px "TM Display", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(cd > 0 ? cd.toFixed(1) + 's' : 'Ready', mx + 10, my + 1);
  }
  // 12) chú thích (giữa trên) + thẻ mốc sao cuối vòng
  this.veChu(x, now);
  // 13) quay chậm: viền + nhãn
  if (G.tocDo < 1) {
    x.strokeStyle = 'rgba(255,228,107,0.55)'; x.lineWidth = 3; x.strokeRect(3, SD_Y0 + 3, W - 6, 374);
    x.fillStyle = '#ffe46b'; x.font = '800 11px "TM Display", sans-serif'; x.textAlign = 'right'; x.textBaseline = 'middle'; x.fillText('Slow-mo', W - 12, SD_Y0 + 52);
  }
  // 14) chuyển vòng: tối nhanh
  const re = (now - this.tRe) / 260; if (re < 1) { x.globalAlpha = 1 - re; x.fillStyle = '#0d0f12'; x.fillRect(0, 0, W, H); }
  x.restore();
};
SD.cauChu = function () {
  const ks = this.ks, T = this.T || {}; const s = this.sao;
  const c = ks.c[this.cIdx]; if (!c) return null;
  let v = c[1]; if (typeof v === 'function') { try { v = v(T, T.sao || s); } catch (e) { v = ''; } }
  if (ks.cham && ks.cham.includes(c[0]) && sdKhoa()) v = 'Tap skill unlocks at 3★';
  return { chu: sdSC(v), t0: c[0], dau: c[2] && c[2].dau };
};
SD.mocChu = function () { // mốc sao đã mở ở sao đang xem (cuối vòng)
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
    if (mc && (this.t >= t0 + 1.2 || !this.moSao)) o = { chu: mc.chu, dau: mc.dau, t0: this.moSao ? t0 + 1.2 : t0 };
    else if (this.moSao) o = { chu: this.moSao, dau: this.sao + '★', t0 };
    else o = { chu: 'Higher stars: stronger', dau: this.sao + '★', t0 };
  }
  if (!o) o = this.cauChu();
  if (!o || !o.chu) return;
  const u = clamp((this.t - o.t0) / 0.18, 0, 1), cx = ks.mana || ks.cd ? 176 : W / 2, cy = SD_Y0 + 25;
  x.font = '800 16px "TM UI", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  let w = x.measureText(o.chu).width; const fs = w > 264 ? 16 * 264 / w : 16; if (fs !== 16) { x.font = '800 ' + fs.toFixed(1) + 'px "TM UI", sans-serif'; w = 264; }
  const dw = o.dau ? (x.font = '800 12px "TM Display", sans-serif', x.measureText(o.dau).width + 14) : 0;
  const bw = w + 26 + dw, bx = cx - bw / 2;
  x.globalAlpha = u; x.save(); x.translate(cx, cy); x.scale(0.94 + 0.06 * u, 0.94 + 0.06 * u); x.translate(-cx, -cy);
  x.fillStyle = 'rgba(12,14,18,0.86)'; sdRR(x, bx, cy - 16, bw, 32, 16); x.fill();
  x.strokeStyle = o.dau ? '#ffe46b' : tierOf(this.id).mau; x.lineWidth = 1.5; x.stroke();
  if (o.dau) { x.fillStyle = '#ffe46b'; sdRR(x, bx + 5, cy - 11, dw - 4, 22, 11); x.fill(); x.fillStyle = '#16171a'; x.font = '800 12px "TM Display", sans-serif'; x.fillText(o.dau, bx + 3 + dw / 2, cy + 1); }
  x.fillStyle = '#f4f6f8'; x.font = '800 ' + fs.toFixed(1) + 'px "TM UI", sans-serif'; x.fillText(o.chu, bx + dw + (bw - dw) / 2, cy + 1);
  x.restore(); x.globalAlpha = 1;
};
SD.veNgam = function (x, ex, ey, r, m, now) {
  const q = r + 4 + 2 * Math.sin(now / 140);
  x.strokeStyle = m; x.lineWidth = 2;
  x.beginPath(); x.arc(ex, ey, q, 0, 7); x.stroke();
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + now / 900; x.beginPath(); x.moveTo(ex + Math.cos(a) * (q - 5), ey + Math.sin(a) * (q - 5)); x.lineTo(ex + Math.cos(a) * (q + 5), ey + Math.sin(a) * (q + 5)); x.stroke(); }
};
SD.veSo = function (x, X, Y, n, m) {
  x.fillStyle = '#fff'; x.beginPath(); x.arc(X, Y, 8, 0, 7); x.fill(); x.strokeStyle = m; x.lineWidth = 2; x.stroke();
  x.fillStyle = '#111'; x.font = '800 11px "TM Display", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(n), X, Y + 0.5);
};
SD.veIcon = function (x, k, X, Y) {
  const mau = { cham: '#8fe3ff', doc: '#8dff4a', yeu: '#d9a8ff', dung: '#e8fbff' }[k];
  x.fillStyle = 'rgba(10,12,16,0.85)'; x.beginPath(); x.arc(X, Y, 6.5, 0, 7); x.fill(); x.strokeStyle = mau; x.lineWidth = 1.5; x.stroke();
  x.strokeStyle = mau; x.fillStyle = mau; x.lineWidth = 1.4;
  if (k === 'cham' || k === 'dung') { for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; x.beginPath(); x.moveTo(X - Math.cos(a) * 4, Y - Math.sin(a) * 4); x.lineTo(X + Math.cos(a) * 4, Y + Math.sin(a) * 4); x.stroke(); } }
  else if (k === 'doc') { x.beginPath(); x.moveTo(X, Y - 4); x.quadraticCurveTo(X + 4, Y + 1, X, Y + 3.5); x.quadraticCurveTo(X - 4, Y + 1, X, Y - 4); x.fill(); }
  else { x.beginPath(); x.moveTo(X - 3.5, Y - 2); x.lineTo(X + 3.5, Y - 2); x.lineTo(X, Y + 3.5); x.closePath(); x.fill(); }
};
SD.veNhan = function (x, X, Y, s, mau, k) {
  x.font = '800 12px "TM Display", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  const w = x.measureText(s).width + 12;
  x.fillStyle = 'rgba(10,12,16,0.88)'; sdRR(x, X - w / 2, Y - 9, w, 18, 9); x.fill(); x.strokeStyle = mau; x.lineWidth = 1.2; x.stroke();
  x.fillStyle = mau; x.fillText(s, X, Y + 0.5);
};
SD.veMuiTen = function (x, X, Y, mau) {
  x.fillStyle = mau; x.beginPath(); x.moveTo(X, Y + 7); x.lineTo(X - 7, Y - 2); x.lineTo(X - 2.5, Y - 2); x.lineTo(X - 2.5, Y - 9); x.lineTo(X + 2.5, Y - 9); x.lineTo(X + 2.5, Y - 2); x.lineTo(X + 7, Y - 2); x.closePath(); x.fill();
};
SD.veTay = function (x, X, Y, an) { // bàn tay chỉ (vẽ bằng code)
  x.save(); x.translate(X, Y); x.rotate(-0.35); const s = an ? 0.9 : 1; x.scale(s, s);
  x.fillStyle = '#fff'; x.strokeStyle = '#16171a'; x.lineWidth = 2;
  x.beginPath(); x.moveTo(-3, 0); x.lineTo(-3, 16); x.quadraticCurveTo(-11, 12, -12, 18); x.quadraticCurveTo(-6, 26, -1, 34); x.lineTo(13, 34); x.quadraticCurveTo(17, 26, 16, 16);
  x.lineTo(16, 12); x.quadraticCurveTo(13, 9, 11, 12); x.quadraticCurveTo(9, 8, 6, 11); x.quadraticCurveTo(4, 7, 3, 10); x.lineTo(3, 0); x.quadraticCurveTo(0, -4, -3, 0); x.closePath();
  x.fill(); x.stroke(); x.restore();
};

// ===================================================== khởi động trong iframe =====================================================
SD.moc();
window.SD = SD;
