'use strict';

// ============================================================
//  DỮ LIỆU GAME: bản đồ, tướng, kỹ năng, trang bị, quái
//  Muốn cân bằng game / thêm nội dung thì chủ yếu sửa file này.
// ============================================================

const CONFIG = {
  W: 540,            // kích thước logic (dọc, tỉ lệ 9:16)
  H: 960,
  startGold: 220,
  startLives: 20,
  sellRatio: 0.6,    // bán tướng hoàn lại 60% giá
  chestCost: 90,     // giá mở rương đồ ngẫu nhiên
  pathWidth: 46,
  // Đường đi của quái (các điểm gấp khúc)
  path: [[-30, 150], [440, 150], [440, 350], [100, 350], [100, 550],
         [440, 550], [440, 750], [270, 750], [270, 1000]],
  // Ô đặt tướng
  slots: [[220, 250], [40, 250], [510, 250], [270, 450], [35, 450], [510, 450],
          [270, 650], [510, 650], [150, 660], [165, 800], [375, 815]],
  // Bậc tiến hóa theo số mạng hạ gục -> tướng to hơn, có sao, hào quang
  tiers: [0, 25, 75, 150],
};

const SLOTS = ['weapon', 'helmet', 'armor'];
const SLOT_NAMES = { weapon: 'Vũ khí', helmet: 'Mũ', armor: 'Giáp' };

const RARITY = {
  common:    { name: 'Thường',      color: '#bdc3c7', weight: 60 },
  rare:      { name: 'Hiếm',        color: '#3498db', weight: 28 },
  epic:      { name: 'Sử thi',      color: '#9b59b6', weight: 10 },
  legendary: { name: 'Huyền thoại', color: '#f39c12', weight: 3 },
};

const STAT_NAMES = {
  damage: 'Sát thương', range: 'Tầm đánh', haste: '% Tốc đánh', crit: '% Chí mạng',
  bonusDmgPct: '% Sát thương',
};

// ------------------------------------------------------------
//  TƯỚNG
//  Mỗi kỹ năng có `unlock` = số mạng cần để mở khóa.
//  apply(stats, since, kills): since = số mạng đã giết kể từ khi mở khóa
//  -> kỹ năng tiếp tục "lớn lên" theo số quái giết được.
//  active: kỹ năng chủ động, tự kích hoạt theo hồi chiêu (xem SKILL_CASTS trong game.js)
// ------------------------------------------------------------
const HEROES = {
  knight: {
    name: 'Hiệp Sĩ', cost: 70, attack: 'melee',
    desc: 'Cận chiến, chém lan. Càng giết càng hung bạo.',
    base: { damage: 16, range: 110, cooldown: 0.9 },
    look: { skin: '#f1c27d', cloth: '#7f8c8d', hair: '#5d4037', aura: '#e74c3c',
            weapon: { type: 'sword', color: '#95a5a6' } },
    skills: [
      { id: 'bloodlust', name: 'Huyết Chiến', unlock: 0,
        info: (n) => `+${(n * 0.4).toFixed(1)} sát thương (mỗi mạng +0.4)`,
        apply: (s, n) => { s.damage += n * 0.4; } },
      { id: 'cleave', name: 'Chém Xoáy', unlock: 10,
        info: (n) => `Chém lan ${Math.round(Math.min(1, 0.5 + n * 0.005) * 100)}% sát thương lên mọi quái trong tầm (tối đa 100%)`,
        apply: (s, n) => { s.cleave = Math.min(1, 0.5 + n * 0.005); } },
      { id: 'frenzy', name: 'Cuồng Nộ', unlock: 40,
        info: (n) => `+${Math.min(60, Math.round(n * 0.5))}% tốc đánh (tối đa 60%)`,
        apply: (s, n) => { s.haste += Math.min(60, n * 0.5); } },
      { id: 'judgement', name: 'Phán Quyết', unlock: 100,
        info: (n) => `Mỗi 8s giáng sét vào quái máu cao nhất: x4 sát thương +${n * 2}`,
        active: { cooldown: 8, cast: 'judgement' } },
    ],
  },
  archer: {
    name: 'Cung Thủ', cost: 55, attack: 'arrow',
    desc: 'Tầm xa, bắn nhiều mũi tên. Mắt càng tinh khi săn nhiều.',
    base: { damage: 9, range: 170, cooldown: 0.6 },
    look: { skin: '#e0ac69', cloth: '#6b8e23', hair: '#3e2723', aura: '#2ecc71',
            helmet: { type: 'hood', color: '#556b2f' },
            weapon: { type: 'bow', color: '#8e5a2b' } },
    skills: [
      { id: 'hawkeye', name: 'Mắt Ưng', unlock: 0,
        info: (n) => `+${(n * 0.25).toFixed(1)} sát thương, +${Math.min(80, Math.round(n * 0.4))} tầm`,
        apply: (s, n) => { s.damage += n * 0.25; s.range += Math.min(80, n * 0.4); } },
      { id: 'multishot', name: 'Đa Tiễn', unlock: 10,
        info: (n) => `Bắn ${Math.min(5, 2 + Math.floor(n / 40))} mũi tên (thêm 1 mũi mỗi 40 mạng, tối đa 5)`,
        apply: (s, n) => { s.arrows = Math.min(5, 2 + Math.floor(n / 40)); } },
      { id: 'poison', name: 'Tên Độc', unlock: 30,
        info: (n) => `Trúng tên gây độc ${(3 + n * 0.12).toFixed(1)} sát thương/giây trong 3s`,
        apply: (s, n) => { s.poison = 3 + n * 0.12; } },
      { id: 'arrowrain', name: 'Mưa Tên', unlock: 80,
        info: (n) => `Mỗi 10s trút mưa tên vùng rộng: x2 sát thương +${(n * 0.5).toFixed(0)}`,
        active: { cooldown: 10, cast: 'arrowrain' } },
    ],
  },
  mage: {
    name: 'Pháp Sư', cost: 85, attack: 'magic',
    desc: 'Cầu lửa nổ lan. Hấp thụ linh hồn để phép mạnh dần.',
    base: { damage: 20, range: 140, cooldown: 1.4, splash: 35 },
    look: { skin: '#f5d0a9', cloth: '#2c3e50', hair: '#ecf0f1', aura: '#8e44ad',
            helmet: { type: 'wizard', color: '#2c3e50' },
            weapon: { type: 'staff', color: '#6d4c41', orb: '#e67e22' } },
    skills: [
      { id: 'soulsiphon', name: 'Hấp Thụ Linh Hồn', unlock: 0,
        info: (n) => `+${(n * 0.5).toFixed(1)} sát thương phép (mỗi mạng +0.5)`,
        apply: (s, n) => { s.damage += n * 0.5; } },
      { id: 'bigfire', name: 'Hỏa Cầu Lớn', unlock: 10,
        info: (n) => `Bán kính nổ ${Math.round(Math.min(110, 45 + n * 0.4))} (tối đa 110)`,
        apply: (s, n) => { s.splash = Math.min(110, 45 + n * 0.4); } },
      { id: 'frost', name: 'Băng Sương', unlock: 35,
        info: (n) => `Làm chậm ${Math.round(Math.min(55, 25 + n * 0.2))}% trong 1.5s`,
        apply: (s, n) => { s.slow = Math.min(55, 25 + n * 0.2); } },
      { id: 'meteor', name: 'Thiên Thạch', unlock: 90,
        info: (n) => `Mỗi 12s gọi thiên thạch: x5 sát thương +${n * 2} vùng lớn`,
        active: { cooldown: 12, cast: 'meteor' } },
    ],
  },
};

// ------------------------------------------------------------
//  TRANG BỊ
//  `look` quyết định hình dạng tướng khi mặc (render.js vẽ theo look)
//  `for` giới hạn vũ khí theo loại tướng; mũ/giáp ai cũng mặc được.
//  `set`: mặc đủ bộ sẽ kích hoạt hiệu ứng bộ (xem SETS)
// ------------------------------------------------------------
const ITEMS = {
  // --- Vũ khí Hiệp Sĩ
  iron_sword:   { name: 'Kiếm Sắt', slot: 'weapon', for: 'knight', rarity: 'common',
                  stats: { damage: 5 }, look: { type: 'sword', color: '#d5dbdb' } },
  great_axe:    { name: 'Đại Phủ', slot: 'weapon', for: 'knight', rarity: 'rare',
                  stats: { damage: 11, haste: -10 }, look: { type: 'axe', color: '#7f8c8d' } },
  flame_blade:  { name: 'Hỏa Kiếm', slot: 'weapon', for: 'knight', rarity: 'epic',
                  stats: { damage: 14, crit: 10 }, look: { type: 'sword', color: '#e67e22', glow: '#ff6b00' } },
  dragon_blade: { name: 'Long Kiếm', slot: 'weapon', for: 'knight', rarity: 'legendary', set: 'dragon',
                  stats: { damage: 24, crit: 10 }, look: { type: 'greatsword', color: '#2ecc71', glow: '#00ff88' } },
  // --- Vũ khí Cung Thủ
  hunter_bow:   { name: 'Cung Thợ Săn', slot: 'weapon', for: 'archer', rarity: 'common',
                  stats: { damage: 3, range: 15 }, look: { type: 'bow', color: '#a0522d' } },
  elven_bow:    { name: 'Cung Tiên Tộc', slot: 'weapon', for: 'archer', rarity: 'rare',
                  stats: { damage: 6, range: 35 }, look: { type: 'longbow', color: '#27ae60' } },
  storm_bow:    { name: 'Cung Bão Tố', slot: 'weapon', for: 'archer', rarity: 'epic',
                  stats: { damage: 9, haste: 20 }, look: { type: 'longbow', color: '#3498db', glow: '#74b9ff' } },
  dragon_bow:   { name: 'Long Cung', slot: 'weapon', for: 'archer', rarity: 'legendary', set: 'dragon',
                  stats: { damage: 15, haste: 20, range: 30 }, look: { type: 'longbow', color: '#2ecc71', glow: '#00ff88' } },
  // --- Vũ khí Pháp Sư
  oak_staff:    { name: 'Gậy Sồi', slot: 'weapon', for: 'mage', rarity: 'common',
                  stats: { damage: 5 }, look: { type: 'staff', color: '#8d6e63', orb: '#f1c40f' } },
  crystal_staff:{ name: 'Gậy Pha Lê', slot: 'weapon', for: 'mage', rarity: 'rare',
                  stats: { damage: 10, range: 20 }, look: { type: 'staff', color: '#b0bec5', orb: '#00cec9', glow: '#81ecec' } },
  void_staff:   { name: 'Trượng Hư Không', slot: 'weapon', for: 'mage', rarity: 'epic',
                  stats: { damage: 18, crit: 8 }, look: { type: 'staff', color: '#2d3436', orb: '#a29bfe', glow: '#6c5ce7' } },
  dragon_staff: { name: 'Long Trượng', slot: 'weapon', for: 'mage', rarity: 'legendary', set: 'dragon',
                  stats: { damage: 28 }, look: { type: 'staff', color: '#145a32', orb: '#2ecc71', glow: '#00ff88' } },
  // --- Mũ
  leather_cap:  { name: 'Mũ Da', slot: 'helmet', rarity: 'common',
                  stats: { range: 5 }, look: { type: 'cap', color: '#8e5a2b' } },
  iron_helm:    { name: 'Mũ Sắt', slot: 'helmet', rarity: 'rare',
                  stats: { damage: 4 }, look: { type: 'helm', color: '#95a5a6', plume: '#c0392b' } },
  horned_helm:  { name: 'Mũ Sừng Quỷ', slot: 'helmet', rarity: 'epic',
                  stats: { damage: 6, crit: 8 }, look: { type: 'horned', color: '#4a4a4a' } },
  arcane_hat:   { name: 'Nón Thiên Văn', slot: 'helmet', rarity: 'rare',
                  stats: { haste: 12 }, look: { type: 'wizard', color: '#6c5ce7' } },
  dragon_crown: { name: 'Vương Miện Rồng', slot: 'helmet', rarity: 'legendary', set: 'dragon',
                  stats: { damage: 8, crit: 5 }, look: { type: 'crown', color: '#f1c40f', gem: '#2ecc71' } },
  // --- Giáp
  leather_armor:{ name: 'Giáp Da', slot: 'armor', rarity: 'common',
                  stats: { haste: 5 }, look: { type: 'leather', color: '#a0522d' } },
  chain_mail:   { name: 'Giáp Xích', slot: 'armor', rarity: 'rare',
                  stats: { damage: 5 }, look: { type: 'plate', color: '#95a5a6' } },
  mage_robe:    { name: 'Áo Choàng Pháp', slot: 'armor', rarity: 'epic',
                  stats: { damage: 6, haste: 15 }, look: { type: 'robe', color: '#8e44ad', trim: '#f1c40f', cape: '#5b2c6f' } },
  royal_plate:  { name: 'Giáp Hoàng Gia', slot: 'armor', rarity: 'epic',
                  stats: { damage: 10, crit: 5 }, look: { type: 'plate', color: '#f1c40f', cape: '#c0392b' } },
  dragon_armor: { name: 'Long Giáp', slot: 'armor', rarity: 'legendary', set: 'dragon',
                  stats: { damage: 12, haste: 10 }, look: { type: 'plate', color: '#27ae60', cape: '#145a32' } },
};

// Hiệu ứng bộ: mặc đủ `pieces` món cùng set -> cộng chỉ số + biến hình
const SETS = {
  dragon: {
    name: 'Bộ Rồng', pieces: 3,
    desc: '+30% sát thương, mọc cánh rồng & hào quang xanh',
    apply: (s) => { s.bonusDmgPct += 30; },
    look: { wings: '#1e8449', aura: '#2ecc71' },
  },
};

// ------------------------------------------------------------
//  QUÁI
// ------------------------------------------------------------
const ENEMIES = {
  grunt:  { name: 'Yêu Tinh', hp: 32,  speed: 48, gold: 4,  size: 13, color: '#6ab04c', drop: 0.03 },
  runner: { name: 'Sói Hoang', hp: 22, speed: 92, gold: 5,  size: 12, color: '#a4b0be', drop: 0.03 },
  tank:   { name: 'Quỷ Đá',   hp: 140, speed: 30, gold: 12, size: 19, color: '#786fa6', drop: 0.08 },
  boss:   { name: 'Chúa Quỷ', hp: 900, speed: 26, gold: 80, size: 28, color: '#c0392b', drop: 1, boss: true, lives: 5 },
};

const waveHpMult = (n) => Math.pow(1.14, n - 1);

function buildWave(n) {
  const list = [];
  const count = 6 + Math.floor(n * 1.8);
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let type = 'grunt';
    if (n >= 4 && r < 0.18) type = 'tank';
    else if (n >= 2 && r < 0.45) type = 'runner';
    list.push({ type, gap: type === 'runner' ? 0.45 : 0.85 });
  }
  if (n % 5 === 0) {
    for (let i = 0; i < Math.floor(n / 5); i++) list.push({ type: 'boss', gap: 2.5 });
  }
  return list;
}
