'use strict';

// ============================================================
//  DỮ LIỆU GAME: bản đồ, tướng, kỹ năng, trang bị, cửa hàng, quái
//  Muốn cân bằng game / thêm nội dung thì chủ yếu sửa file này.
//  Lối chơi lấy cảm hứng từ Dota 1 (3 thuộc tính, QWER, 6 ô đồ,
//  ghép đồ, boss hang), nhưng tên, hình và chỉ số là thiết kế riêng.
// ============================================================

const CONFIG = {
  W: 540,            // kích thước logic (dọc, tỉ lệ 9:16)
  H: 960,
  startGold: 220,
  startLives: 20,
  sellRatio: 0.6,    // bán tướng hoàn lại 60% giá
  chestCost: 90,     // giá rương đồ ngẫu nhiên
  waveBreak: 10,     // giây nghỉ giữa hai đợt (tự gọi đợt kế)
  pathWidth: 46,
  maxLevel: 25,
  // Đường đi của quái (các điểm gấp khúc)
  path: [[-30, 150], [440, 150], [440, 350], [100, 350], [100, 550],
         [440, 550], [440, 750], [270, 750], [270, 1000]],
  // Vị trí đặt tướng: lưới ẩn dọc hai bên đường (sinh trong game.js).
  // sx/sy: khoảng cách ô; minD/maxD: dải cách tim đường được phép đặt
  buildGrid: { sx: 62, sy: 56, y0: 98, minY: 118, minD: 52, maxD: 108 },
  slots: [],
  // Bậc tiến hóa theo số mạng hạ gục -> tướng to hơn, có sao, hào quang
  tiers: [0, 25, 75, 150],
};

// Kinh nghiệm cần để đạt cấp L (tích lũy)
const xpForLevel = (L) => 20 * (L - 1) * L;

// 6 ô đồ kiểu Dota: 3 ô trang phục (đổi ngoại hình) + 3 ô phụ kiện
const GEAR_SLOTS = ['weapon', 'helmet', 'armor'];
const ACC_SLOTS = ['acc1', 'acc2', 'acc3'];
const SLOTS = [...GEAR_SLOTS, ...ACC_SLOTS];
const SLOT_NAMES = { weapon: 'Vũ khí', helmet: 'Mũ', armor: 'Giáp', acc: 'Phụ kiện',
                     acc1: 'Phụ kiện', acc2: 'Phụ kiện', acc3: 'Phụ kiện' };
const WCLASS_NAMES = { blade: 'Cận chiến', bow: 'Cung', staff: 'Trượng' };

const ATTRS = {
  str: { name: 'Sức mạnh',   short: 'SỨC', color: '#e0533d', desc: '+máu, +hồi máu' },
  agi: { name: 'Nhanh nhẹn', short: 'NHA', color: '#4cbb5e', desc: '+tốc đánh' },
  int: { name: 'Trí tuệ',    short: 'TRÍ', color: '#4a90e2', desc: '+sức mạnh kỹ năng, -hồi chiêu' },
};

const RARITY = {
  common:    { name: 'Thường',      color: '#bdc3c7', weight: 60 },
  rare:      { name: 'Hiếm',        color: '#3498db', weight: 28 },
  epic:      { name: 'Sử thi',      color: '#9b59b6', weight: 10 },
  legendary: { name: 'Huyền thoại', color: '#f39c12', weight: 3 },
};

const STAT_NAMES = {
  damage: 'Sát thương', range: 'Tầm', haste: '% Tốc đánh', crit: '% Chí mạng',
  bonusDmgPct: '% Sát thương', str: 'Sức mạnh', agi: 'Nhanh nhẹn', int: 'Trí tuệ',
  hp: 'Máu', regen: 'Hồi máu/s', cleave: 'Chém lan', cdr: '% Giảm hồi chiêu',
};

// ------------------------------------------------------------
//  TƯỚNG
//  attr: thuộc tính chính (cộng thẳng vào sát thương, như Dota)
//  attrs/gain: chỉ số gốc và lượng tăng mỗi cấp
//  skills: 4 kỹ năng Q W E R. `unlock` = số quái phải hạ để mở.
//    apply(stats, n): nội tại, n = số quái đã hạ kể từ khi mở -> lớn dần
//    active: chủ động, tự kích hoạt khi hồi chiêu xong (SKILL_CASTS trong game.js)
// ------------------------------------------------------------
const HEROES = {
  knight: {
    name: 'Hiệp Sĩ', cost: 70, attr: 'str', attack: 'melee', wclass: 'blade',
    role: 'Chém lan',
    attrs: { str: 22, agi: 14, int: 12 }, gain: { str: 2.6, agi: 1.4, int: 1.2 },
    base: { damage: 6, range: 145, cooldown: 1.0 },
    look: { skin: '#f1c27d', cloth: '#7f8c8d', hair: '#5d4037', aura: '#e74c3c',
            weapon: { type: 'sword', color: '#95a5a6' } },
    skills: [
      { id: 'bash', name: 'Đập Khiên', icon: '🔰', unlock: 0,
        info: (n) => `Đập khiên làm choáng quái 1 giây, gây x2 sát thương +${(n * 0.6).toFixed(0)}`,
        active: { cooldown: 6, cast: 'bash' } },
      { id: 'bloodlust', name: 'Huyết Chiến', icon: '🩸', unlock: 10,
        info: (n) => `Chém lan ${Math.round(Math.min(1, 0.5 + n * 0.005) * 100)}% lên mọi quái trong tầm · +${(n * 0.4).toFixed(1)} sát thương (mỗi quái +0.4)`,
        apply: (s, n) => { s.damage += n * 0.4; s.cleave += Math.min(1, 0.5 + n * 0.005); } },
      { id: 'frenzy', name: 'Cuồng Nộ', icon: '💢', unlock: 40,
        info: (n) => `+${Math.min(60, Math.round(n * 0.5))}% tốc đánh (tối đa 60%)`,
        apply: (s, n) => { s.haste += Math.min(60, n * 0.5); } },
      { id: 'judgement', name: 'Phán Quyết', icon: '⚡', unlock: 90,
        info: (n) => `Giáng sét vào quái máu cao nhất: x4 sát thương +${n * 2}`,
        active: { cooldown: 10, cast: 'judgement' } },
    ],
  },
  butcher: {
    name: 'Đồ Tể', cost: 80, attr: 'str', attack: 'melee', wclass: 'blade',
    role: 'Móc kéo',
    attrs: { str: 25, agi: 11, int: 14 }, gain: { str: 3.0, agi: 1.0, int: 1.5 },
    base: { damage: 10, range: 140, cooldown: 1.25 },
    look: { skin: '#d7a985', cloth: '#6d4c41', hair: null, aura: '#8bc34a', bulk: 1.15,
            weapon: { type: 'cleaver', color: '#b0bec5' } },
    skills: [
      { id: 'hook', name: 'Móc Xích', icon: '🔗', unlock: 0,
        info: (n) => `Móc quái đi xa nhất kéo lùi về sau, gây ${40 + Math.round(n * 1.5)} sát thương`,
        active: { cooldown: 7, cast: 'hook' } },
      { id: 'fleshheap', name: 'Chồng Thịt', icon: '🍖', unlock: 10,
        info: (n) => `+${Math.min(60, Math.floor(n / 2))} sức mạnh (mỗi 2 quái +1, tối đa 60)`,
        apply: (s, n) => { s.str += Math.min(60, Math.floor(n / 2)); } },
      { id: 'stench', name: 'Mùi Hôi Thối', icon: '🤢', unlock: 35,
        info: (n) => `Quái quanh mình mất ${(8 + n * 0.15).toFixed(1)} máu mỗi giây`,
        apply: (s, n) => { s.stench = 8 + n * 0.15; } },
      { id: 'devour', name: 'Nuốt Chửng', icon: '👄', unlock: 90,
        info: (n) => `Nuốt sống quái thường máu cao nhất trong tầm. Với boss: x6 sát thương +${n * 2}`,
        active: { cooldown: 18, cast: 'devour' } },
    ],
  },
  archer: {
    name: 'Cung Thủ', cost: 55, attr: 'agi', attack: 'arrow', wclass: 'bow',
    role: 'Tầm xa',
    attrs: { str: 15, agi: 22, int: 14 }, gain: { str: 1.6, agi: 2.8, int: 1.4 },
    base: { damage: 0, range: 170, cooldown: 1.0 },
    look: { skin: '#e0ac69', cloth: '#6b8e23', hair: '#3e2723', aura: '#2ecc71',
            helmet: { type: 'hood', color: '#556b2f' },
            weapon: { type: 'bow', color: '#8e5a2b' } },
    skills: [
      { id: 'pierce', name: 'Tên Xuyên Thấu', icon: '💫', unlock: 0,
        info: (n) => `Bắn mũi tên xuyên qua mọi quái trên đường bay: x2 sát thương +${(n * 0.8).toFixed(0)}`,
        active: { cooldown: 7, cast: 'pierce' } },
      { id: 'multishot', name: 'Mắt Ưng · Đa Tiễn', icon: '🏹', unlock: 10,
        info: (n) => `Bắn ${Math.min(5, 2 + Math.floor(n / 40))} mũi tên · +${(n * 0.25).toFixed(1)} sát thương · +${Math.min(80, Math.round(n * 0.4))} tầm`,
        apply: (s, n) => { s.arrows = Math.min(5, 2 + Math.floor(n / 40)); s.damage += n * 0.25; s.range += Math.min(80, n * 0.4); } },
      { id: 'poison', name: 'Tên Độc', icon: '☠', unlock: 30,
        info: (n) => `Trúng tên mất ${(3 + n * 0.12).toFixed(1)} máu/giây trong 3 giây`,
        apply: (s, n) => { s.poison = 3 + n * 0.12; } },
      { id: 'arrowrain', name: 'Mưa Tên', icon: '🌧', unlock: 80,
        info: (n) => `Trút mưa tên vùng rộng: x2 sát thương +${(n * 0.5).toFixed(0)}`,
        active: { cooldown: 10, cast: 'arrowrain' } },
    ],
  },
  assassin: {
    name: 'Sát Thủ', cost: 75, attr: 'agi', attack: 'melee', wclass: 'blade',
    role: 'Chí mạng',
    attrs: { str: 16, agi: 24, int: 12 }, gain: { str: 1.8, agi: 3.0, int: 1.2 },
    base: { damage: 2, range: 140, cooldown: 0.85 },
    look: { skin: '#e0ac69', cloth: '#2c2c3e', hair: '#111111', aura: '#9b59b6',
            helmet: { type: 'mask', color: '#3d2c5a' },
            weapon: { type: 'daggers', color: '#dfe6e9' } },
    skills: [
      { id: 'shadowstep', name: 'Bước Bóng Đêm', icon: '👣', unlock: 0,
        info: (n) => `Lướt tới quái xa nhất trong tầm gấp đôi, chém chữ X: x2 sát thương +${(n * 0.5).toFixed(0)}`,
        active: { cooldown: 6, cast: 'shadowstep' } },
      { id: 'hiddenblade', name: 'Lưỡi Dao Ẩn', icon: '🗡', unlock: 10,
        info: (n) => `+${(n * 0.35).toFixed(1)} sát thương (mỗi quái +0.35)`,
        apply: (s, n) => { s.damage += n * 0.35; } },
      { id: 'critical', name: 'Đòn Chí Mạng', icon: '💥', unlock: 35,
        info: (n) => `+${Math.round(15 + Math.min(25, n * 0.1))}% cơ hội chí mạng, chí mạng x${(2.2 + Math.min(1.3, n * 0.008)).toFixed(1)}`,
        apply: (s, n) => { s.crit += 15 + Math.min(25, n * 0.1); s.critMult = 2.2 + Math.min(1.3, n * 0.008); } },
      { id: 'assassinate', name: 'Ám Sát', icon: '🎯', unlock: 90,
        info: (n) => `Đánh dấu rồi đâm lén quái máu cao nhất: x6 sát thương +${n * 3}`,
        active: { cooldown: 14, cast: 'assassinate' } },
    ],
  },
  mage: {
    name: 'Pháp Sư Lửa', cost: 85, attr: 'int', attack: 'magic', wclass: 'staff',
    role: 'Nổ lan',
    attrs: { str: 14, agi: 12, int: 24 }, gain: { str: 1.4, agi: 1.2, int: 3.0 },
    base: { damage: 6, range: 140, cooldown: 1.6, splash: 35 },
    look: { skin: '#f5d0a9', cloth: '#5d1f1f', hair: '#ecf0f1', aura: '#e67e22',
            helmet: { type: 'wizard', color: '#7b241c' },
            weapon: { type: 'staff', color: '#6d4c41', orb: '#e67e22' } },
    skills: [
      { id: 'firepillar', name: 'Cột Lửa', icon: '🔥', unlock: 0,
        info: (n) => `Phun cột lửa dưới chân quái: x1.8 sát thương +${(n * 0.8).toFixed(0)} và đốt cháy`,
        active: { cooldown: 7, cast: 'firepillar' } },
      { id: 'soulsiphon', name: 'Hấp Thụ Linh Hồn', icon: '👻', unlock: 10,
        info: (n) => `+${(n * 0.5).toFixed(1)} sát thương phép · bán kính nổ ${Math.round(Math.min(110, 45 + n * 0.4))}`,
        apply: (s, n) => { s.damage += n * 0.5; s.splash = Math.min(110, 45 + n * 0.4); } },
      { id: 'burn', name: 'Lửa Thiêu', icon: '♨', unlock: 35,
        info: (n) => `Quái trúng nổ bị đốt ${(4 + n * 0.15).toFixed(1)} máu/giây trong 3 giây`,
        apply: (s, n) => { s.poison = 4 + n * 0.15; } },
      { id: 'meteor', name: 'Thiên Thạch', icon: '☄', unlock: 90,
        info: (n) => `Gọi thiên thạch: x5 sát thương +${n * 2} vùng lớn`,
        active: { cooldown: 12, cast: 'meteor' } },
    ],
  },
  frost: {
    name: 'Pháp Sư Băng', cost: 80, attr: 'int', attack: 'frost', wclass: 'staff',
    role: 'Làm chậm',
    attrs: { str: 15, agi: 13, int: 22 }, gain: { str: 1.6, agi: 1.4, int: 2.8 },
    base: { damage: 2, range: 150, cooldown: 1.2, slow: 15 },
    look: { skin: '#f1d3b3', cloth: '#1f4e79', hair: '#dfe6e9', aura: '#74b9ff',
            helmet: { type: 'hood', color: '#5dade2' },
            weapon: { type: 'staff', color: '#cfd8dc', orb: '#aee9ff', glow: '#74b9ff' } },
    skills: [
      { id: 'nova', name: 'Vòng Băng', icon: '💠', unlock: 0,
        info: (n) => `Nổ băng quanh mục tiêu: ${60 + n} sát thương, làm chậm 60%`,
        active: { cooldown: 8, cast: 'nova' } },
      { id: 'icebolt', name: 'Băng Tiễn', icon: '❄', unlock: 10,
        info: (n) => `+${(n * 0.45).toFixed(1)} sát thương (mỗi quái +0.45)`,
        apply: (s, n) => { s.damage += n * 0.45; } },
      { id: 'permafrost', name: 'Băng Giá', icon: '🧊', unlock: 35,
        info: (n) => `Làm chậm ${Math.round(Math.min(50, 20 + n * 0.25))}% (tối đa 50%)`,
        apply: (s, n) => { s.slow = Math.max(s.slow, Math.min(50, 20 + n * 0.25)); } },
      { id: 'blizzard', name: 'Bão Tuyết', icon: '🌨', unlock: 90,
        info: (n) => `Đóng băng mọi quái trong tầm 2 giây, x3 sát thương +${n}`,
        active: { cooldown: 16, cast: 'blizzard' } },
    ],
  },
};
const SKILL_KEYS = ['Q', 'W', 'E', 'R'];

// ------------------------------------------------------------
//  TRANG BỊ (3 ô trang phục) — `look` đổi hình dạng tướng khi mặc
//  wclass: vũ khí chỉ hợp với loại tướng dùng loại đó
// ------------------------------------------------------------
const ITEMS = {
  // --- Vũ khí cận chiến
  iron_sword:   { name: 'Kiếm Sắt', slot: 'weapon', wclass: 'blade', rarity: 'common',
                  stats: { damage: 5 }, look: { type: 'sword', color: '#d5dbdb' } },
  great_axe:    { name: 'Đại Phủ', slot: 'weapon', wclass: 'blade', rarity: 'rare',
                  stats: { damage: 12, haste: -10 }, look: { type: 'axe', color: '#7f8c8d' } },
  flame_blade:  { name: 'Hỏa Kiếm', slot: 'weapon', wclass: 'blade', rarity: 'epic',
                  stats: { damage: 14, crit: 10 }, look: { type: 'sword', color: '#e67e22', glow: '#ff6b00' } },
  dragon_blade: { name: 'Long Kiếm', slot: 'weapon', wclass: 'blade', rarity: 'legendary', set: 'dragon',
                  stats: { damage: 24, crit: 10 }, look: { type: 'greatsword', color: '#2ecc71', glow: '#00ff88' } },
  // --- Cung
  hunter_bow:   { name: 'Cung Thợ Săn', slot: 'weapon', wclass: 'bow', rarity: 'common',
                  stats: { damage: 3, range: 15 }, look: { type: 'bow', color: '#a0522d' } },
  elven_bow:    { name: 'Cung Tiên Tộc', slot: 'weapon', wclass: 'bow', rarity: 'rare',
                  stats: { damage: 6, range: 35 }, look: { type: 'longbow', color: '#27ae60' } },
  storm_bow:    { name: 'Cung Bão Tố', slot: 'weapon', wclass: 'bow', rarity: 'epic',
                  stats: { damage: 9, haste: 20 }, look: { type: 'longbow', color: '#3498db', glow: '#74b9ff' } },
  dragon_bow:   { name: 'Long Cung', slot: 'weapon', wclass: 'bow', rarity: 'legendary', set: 'dragon',
                  stats: { damage: 15, haste: 20, range: 30 }, look: { type: 'longbow', color: '#2ecc71', glow: '#00ff88' } },
  // --- Trượng
  oak_staff:    { name: 'Gậy Sồi', slot: 'weapon', wclass: 'staff', rarity: 'common',
                  stats: { damage: 5 }, look: { type: 'staff', color: '#8d6e63', orb: '#f1c40f' } },
  crystal_staff:{ name: 'Gậy Pha Lê', slot: 'weapon', wclass: 'staff', rarity: 'rare',
                  stats: { damage: 10, range: 20 }, look: { type: 'staff', color: '#b0bec5', orb: '#00cec9', glow: '#81ecec' } },
  void_staff:   { name: 'Trượng Hư Không', slot: 'weapon', wclass: 'staff', rarity: 'epic',
                  stats: { damage: 18, crit: 8 }, look: { type: 'staff', color: '#2d3436', orb: '#a29bfe', glow: '#6c5ce7' } },
  dragon_staff: { name: 'Long Trượng', slot: 'weapon', wclass: 'staff', rarity: 'legendary', set: 'dragon',
                  stats: { damage: 28 }, look: { type: 'staff', color: '#145a32', orb: '#2ecc71', glow: '#00ff88' } },
  // --- Mũ
  leather_cap:  { name: 'Mũ Da', slot: 'helmet', rarity: 'common',
                  stats: { range: 5, agi: 2 }, look: { type: 'cap', color: '#8e5a2b' } },
  iron_helm:    { name: 'Mũ Sắt', slot: 'helmet', rarity: 'rare',
                  stats: { str: 5, hp: 60 }, look: { type: 'helm', color: '#95a5a6', plume: '#c0392b' } },
  horned_helm:  { name: 'Mũ Sừng Quỷ', slot: 'helmet', rarity: 'epic',
                  stats: { damage: 6, crit: 8 }, look: { type: 'horned', color: '#4a4a4a' } },
  arcane_hat:   { name: 'Nón Thiên Văn', slot: 'helmet', rarity: 'rare',
                  stats: { int: 6, cdr: 8 }, look: { type: 'wizard', color: '#6c5ce7' } },
  dragon_crown: { name: 'Vương Miện Rồng', slot: 'helmet', rarity: 'legendary', set: 'dragon',
                  stats: { damage: 8, str: 5, agi: 5, int: 5 }, look: { type: 'crown', color: '#f1c40f', gem: '#2ecc71' } },
  // --- Giáp
  leather_armor:{ name: 'Giáp Da', slot: 'armor', rarity: 'common',
                  stats: { haste: 5, hp: 40 }, look: { type: 'leather', color: '#a0522d' } },
  chain_mail:   { name: 'Giáp Xích', slot: 'armor', rarity: 'rare',
                  stats: { str: 6, hp: 80 }, look: { type: 'plate', color: '#95a5a6' } },
  mage_robe:    { name: 'Áo Choàng Pháp', slot: 'armor', rarity: 'epic',
                  stats: { int: 10, haste: 10 }, look: { type: 'robe', color: '#8e44ad', trim: '#f1c40f', cape: '#5b2c6f' } },
  royal_plate:  { name: 'Giáp Hoàng Gia', slot: 'armor', rarity: 'epic',
                  stats: { damage: 10, str: 8, hp: 100 }, look: { type: 'plate', color: '#f1c40f', cape: '#c0392b' } },
  dragon_armor: { name: 'Long Giáp', slot: 'armor', rarity: 'legendary', set: 'dragon',
                  stats: { damage: 12, haste: 10, hp: 150 }, look: { type: 'plate', color: '#27ae60', cape: '#145a32' } },

  // ------------------------------------------------------------
  //  PHỤ KIỆN (3 ô phụ kiện) — mua ở Cửa hàng, ghép thành đồ mạnh
  //  `price`: bán trong cửa hàng; `recipe`: ghép từ các món khác
  //  Đồ ghép có `look.aura` -> tướng có hào quang riêng
  // ------------------------------------------------------------
  power_belt:   { name: 'Đai Khổng Lồ', slot: 'acc', rarity: 'common', price: 120, icon: '🎗',
                  stats: { str: 8 } },
  swift_boots:  { name: 'Giày Linh Hoạt', slot: 'acc', rarity: 'common', price: 120, icon: '👢',
                  stats: { agi: 8 } },
  sage_mantle:  { name: 'Khăn Hiền Giả', slot: 'acc', rarity: 'common', price: 120, icon: '🧣',
                  stats: { int: 8 } },
  iron_claws:   { name: 'Vuốt Sắt', slot: 'acc', rarity: 'common', price: 130, icon: '🦾',
                  stats: { damage: 10 } },
  war_gloves:   { name: 'Găng Chiến', slot: 'acc', rarity: 'common', price: 110, icon: '🧤',
                  stats: { haste: 12 } },
  far_lens:     { name: 'Thấu Kính', slot: 'acc', rarity: 'common', price: 100, icon: '🔍',
                  stats: { range: 25 } },
  life_gem:     { name: 'Ngọc Sinh Lực', slot: 'acc', rarity: 'common', price: 100, icon: '💚',
                  stats: { hp: 200, regen: 2 } },

  twin_fury:    { name: 'Song Phủ Cuồng Nộ', slot: 'acc', rarity: 'epic', icon: '🪓',
                  recipe: { parts: ['iron_claws', 'war_gloves'], cost: 150 },
                  stats: { damage: 22, haste: 25, cleave: 0.25 }, look: { aura: '#e74c3c' } },
  reaper_edge:  { name: 'Lưỡi Hái Chí Tử', slot: 'acc', rarity: 'epic', icon: '⚔',
                  recipe: { parts: ['iron_claws', 'swift_boots'], cost: 200 },
                  stats: { damage: 30, crit: 15 }, look: { aura: '#c0392b' } },
  triad_scepter:{ name: 'Vương Trượng Tam Giới', slot: 'acc', rarity: 'legendary', icon: '🔱',
                  recipe: { parts: ['power_belt', 'swift_boots', 'sage_mantle'], cost: 150 },
                  stats: { str: 15, agi: 15, int: 15 }, look: { aura: '#f1c40f' } },
  time_rod:     { name: 'Gậy Thời Không', slot: 'acc', rarity: 'epic', icon: '⌛',
                  recipe: { parts: ['sage_mantle', 'far_lens'], cost: 150 },
                  stats: { int: 16, cdr: 20, range: 30 }, look: { aura: '#4a90e2' } },
  undying_mail: { name: 'Giáp Bất Diệt', slot: 'acc', rarity: 'epic', icon: '🛡',
                  recipe: { parts: ['life_gem', 'power_belt'], cost: 150 },
                  stats: { str: 15, hp: 500, regen: 6 }, look: { aura: '#2ecc71' } },

  // Chỉ rơi từ boss: gục sẽ hồi sinh ngay (dùng 1 lần)
  phoenix_badge:{ name: 'Huy Hiệu Phượng Hoàng', slot: 'acc', rarity: 'legendary', icon: '🔥',
                  stats: {}, revive: true, bossOnly: true,
                  desc: 'Khi gục sẽ hồi sinh ngay với đầy máu (mất huy hiệu)' },
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
//  ranged: quái bắn tướng; slam/summon: chiêu của boss
// ------------------------------------------------------------
const ENEMIES = {
  grunt:  { name: 'Yêu Tinh', hp: 50,  speed: 48, gold: 4,  xp: 8,  size: 13, color: '#6ab04c', drop: 0.03 },
  runner: { name: 'Sói Hoang', hp: 34, speed: 92, gold: 5,  xp: 8,  size: 12, color: '#a4b0be', drop: 0.03 },
  tank:   { name: 'Quỷ Đá',   hp: 220, speed: 30, gold: 12, xp: 20, size: 19, color: '#786fa6', drop: 0.08 },
  shaman: { name: 'Pháp Sư Quỷ', hp: 70, speed: 42, gold: 8, xp: 16, size: 13, color: '#8e44ad', drop: 0.06,
            ranged: { range: 135, dmg: 10, cd: 2.4 } },
  boss:   { name: 'Thạch Long Gorath', hp: 950, speed: 24, gold: 120, xp: 160, size: 30, color: '#7b3f2a',
            drop: 1, boss: true, lives: 5,
            slam: { range: 160, dmg: 55, cd: 6, stun: 1.2 },
            summon: { cd: 9, count: 2, type: 'grunt' } },
};

const waveHpMult = (n) => Math.pow(1.14, n - 1);

function buildWave(n) {
  const list = [];
  const count = 6 + Math.floor(n * 1.8);
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let type = 'grunt';
    if (n >= 3 && r < 0.12) type = 'shaman';
    else if (n >= 4 && r < 0.28) type = 'tank';
    else if (n >= 2 && r < 0.52) type = 'runner';
    list.push({ type, gap: type === 'runner' ? 0.45 : 0.85 });
  }
  if (n % 5 === 0) list.push({ type: 'boss', gap: 3 });
  return list;
}
