'use strict';

// ============================================================
//  NÚI CAO NƯỚC DÂNG · DỮ LIỆU GAME
//  Bản đồ, tướng Văn Lang (6 cơ bản + 10 huyền thoại), kỹ năng,
//  trang bị, Lò đúc đồng, quân Thủy Tinh, boss, Núi Tản Viên,
//  Nước Dâng và chiến dịch dọc sông Đà.
//  Muốn cân bằng game / thêm nội dung thì chủ yếu sửa file này.
//  Số liệu ghi "đề xuất" trong GAMEPLAY.md cần chơi thử để cân bằng.
// ============================================================

// Bản thiết kế vẽ ở khung 932 × 430 (điện thoại cầm ngang). Game dùng hệ
// tọa độ logic 1280 × 590 cùng tỉ lệ: tọa độ thiết kế × DK.
const DK = 1280 / 932;

const CONFIG = {
  W: 1280,
  H: 590,
  startGold: 220,
  startLives: 20,
  sellRatio: 0.6,     // bán tướng hoàn 60% giá triệu hồi + 60% vàng đã nâng cấp
  chestCost: 90,      // Hũ báu
  waveBreak: 10,      // giây nghỉ giữa hai đợt
  maxLevel: 25,
  totalWaves: 30,
  bagSize: 40,        // sức chứa túi đồ
  maxLegends: 2,      // tối đa 2 tướng Huyền thoại trên sân
  // Vùng bị giao diện che (tọa độ thiết kế 932×430): không đặt tướng ở đây
  hudZones: [
    [0, 0, 932, 84],          // thanh trên + chỗ cho đầu tướng
    [0, 0, 120, 270],         // bảng Triệu hồi
    [270, 46, 660, 80],       // dải "đợt sắp tới"
    [0, 262, 932, 430],       // bảng điều khiển dưới
    [846, 70, 932, 220],      // thành Phong Châu
  ],
  // Lưới ô đặt tướng (tọa độ thiết kế): khoảng cách ô, dải cách tim sông
  buildGrid: { sx: 46, sy: 33, minD: 40, maxD: 98 },
  slots: [],      // [x, y] tọa độ logic (sinh trong game.js)
  slotTier: [],   // 0 = Thấp (sát sông), 1 = Giữa, 2 = Cao (sườn núi)
  tierCounts: [15, 16],     // số ô bậc Thấp, Giữa (còn lại là Cao)
};

const TIER_NAMES = ['Thấp', 'Giữa', 'Cao'];

// --- Nâng cấp bằng vàng (đề xuất, cần cân bằng)
const COSTS = {
  level: (L) => 20 + 10 * L,                 // cấp L -> L+1
  unlock: [0, 60, 150, 300],                 // mở khóa Q W E R
  unlockReq: [1, 1, 3, 6],                   // cấp tướng cần để mở
  evo: [100, 250, 500],                      // ★ ★★ ★★★
  evoReq: [5, 10, 15],
  enhance: { common: 20, rare: 40, epic: 80, legendary: 150 },   // × (cấp hiện tại + 1)
  promote: { common: 120, rare: 300, epic: 600 },
  scrap: { common: 15, rare: 35, epic: 80, legendary: 200 },
  legend: { epic: 180, legendary: 260 },
};

// 6 ô đồ: 3 ô trang phục (đổi ngoại hình) + 3 ô phụ kiện
const GEAR_SLOTS = ['weapon', 'helmet', 'armor'];
const ACC_SLOTS = ['acc1', 'acc2', 'acc3'];
const SLOTS = [...GEAR_SLOTS, ...ACC_SLOTS];
const SLOT_NAMES = { weapon: 'Vũ khí', helmet: 'Mũ', armor: 'Giáp', acc: 'Phụ kiện',
                     acc1: 'Phụ kiện', acc2: 'Phụ kiện', acc3: 'Phụ kiện' };
const WCLASS_NAMES = { blade: 'Rìu / dao', bow: 'Nỏ', staff: 'Gậy' };

const ATTRS = {
  str: { name: 'Sức mạnh',   short: 'SỨC', color: '#E25A3A', desc: '+máu, +hồi máu' },
  agi: { name: 'Nhanh nhẹn', short: 'NHA', color: '#7FC24A', desc: '+tốc đánh' },
  int: { name: 'Trí tuệ',    short: 'TRÍ', color: '#A88CE8', desc: '+sức mạnh kỹ năng, -hồi chiêu, +năng lượng' },
};

const RARITY = {
  common:    { name: 'Thường',      color: '#8A8478', weight: 60, mult: 1 },
  rare:      { name: 'Hiếm',        color: '#4FA3D9', weight: 28, mult: 1.5 },
  epic:      { name: 'Sử thi',      color: '#A86CE0', weight: 10, mult: 2.2 },
  legendary: { name: 'Huyền thoại', color: '#F0A030', weight: 3,  mult: 3.2 },
};
const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary'];

const STAT_NAMES = {
  damage: 'Sát thương', range: 'Tầm', haste: '% Tốc đánh', crit: '% Chí mạng',
  bonusDmgPct: '% Sát thương', str: 'Sức mạnh', agi: 'Nhanh nhẹn', int: 'Trí tuệ',
  hp: 'Máu', regen: 'Hồi máu/s', cleave: 'Chém lan', cdr: '% Giảm hồi chiêu', dr: '% Giảm sát thương nhận',
};

// Sức mạnh gốc của kỹ năng: không còn tăng theo số quái hạ mà tăng theo
// cấp tướng (mua bằng vàng), rồi nhân thêm theo cấp kỹ năng (+25%/cấp) và Trí tuệ
const skillN = (level) => 15 + 10 * level;

// ------------------------------------------------------------
//  TƯỚNG VĂN LANG
//  attr: thuộc tính chính (cộng thẳng vào sát thương)
//  attack: melee | arrow | magic | frost  · proj: hình viên đạn
//  skills Q W E R: active = chủ động (tự dùng khi đủ năng lượng),
//    apply(s, n) = nội tại. Q mở sẵn, W/E/R mở khóa bằng vàng.
//  legend: 'epic' | 'legendary' (tướng huyền thoại) · trait: đặc trưng riêng
// ------------------------------------------------------------
const HEROES = {
  lactuong: {
    name: 'Lạc Tướng', cost: 70, attr: 'str', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Chém lan', title: 'Tướng giữ làng, rìu đồng chém lan', color: '#E25A3A',
    attrs: { str: 24, agi: 14, int: 12 }, gain: { str: 2.8, agi: 1.4, int: 1.2 },
    base: { damage: 6, range: 145, cooldown: 1.0 },
    look: { aura: '#e74c3c', weapon: { type: 'axe', color: '#D9A84E' } },
    skills: [
      { id: 'bash', name: 'Khiên Đồng', active: { cooldown: 6, cast: 'bash', mana: 45 },
        info: (n) => `Đập khiên đồng làm choáng quái 1 giây, x2 sát thương +${(n * 0.6).toFixed(0)}` },
      { id: 'bloodlust', name: 'Rìu Lốc Xoáy',
        info: (n) => `Chém lan ${Math.round(Math.min(1, 0.5 + n * 0.005) * 100)}% lên mọi quái trong tầm · +${(n * 0.4).toFixed(1)} sát thương`,
        apply: (s, n) => { s.damage += n * 0.4; s.cleave += Math.min(1, 0.5 + n * 0.005); } },
      { id: 'frenzy', name: 'Hùng Khí',
        info: (n) => `+${Math.min(60, Math.round(n * 0.5))}% tốc đánh`,
        apply: (s, n) => { s.haste += Math.min(60, n * 0.5); } },
      { id: 'judgement', name: 'Sấm Tản Viên', active: { cooldown: 10, cast: 'judgement', mana: 90 },
        info: (n) => `Gọi sấm núi Tản đánh quái máu cao nhất: x4 sát thương +${n * 2}` },
    ],
  },
  lucsi: {
    name: 'Lực Sĩ Núi', cost: 80, attr: 'str', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Trâu bò', title: 'Người gánh núi, kéo quái về bằng dây mây', color: '#E25A3A',
    attrs: { str: 25, agi: 11, int: 14 }, gain: { str: 3.0, agi: 1.0, int: 1.5 },
    base: { damage: 10, range: 140, cooldown: 1.25 },
    look: { aura: '#8bc34a', bulk: 1.12, weapon: { type: 'cleaver', color: '#9E9A90' } },
    skills: [
      { id: 'hook', name: 'Dây Mây', active: { cooldown: 7, cast: 'hook', mana: 50 },
        info: (n) => `Quăng dây mây kéo quái đi xa nhất lùi lại, gây ${40 + Math.round(n * 1.5)} sát thương` },
      { id: 'fleshheap', name: 'Gánh Núi',
        info: (n) => `+${Math.min(60, Math.floor(n / 2))} sức mạnh`,
        apply: (s, n) => { s.str += Math.min(60, Math.floor(n / 2)); } },
      { id: 'stench', name: 'Bụi Đá',
        info: (n) => `Bụi đá quanh mình: quái mất ${(8 + n * 0.15).toFixed(1)} máu mỗi giây`,
        apply: (s, n) => { s.stench = 8 + n * 0.15; } },
      { id: 'devour', name: 'Vùi Đá', active: { cooldown: 18, cast: 'devour', mana: 95 },
        info: (n) => `Chôn sống quái thường máu cao nhất trong tầm. Với boss: x6 sát thương +${n * 2}` },
    ],
  },
  xathu: {
    name: 'Xạ Thủ Văn Lang', cost: 55, attr: 'agi', attack: 'arrow', proj: 'arrow', wclass: 'bow', dmgType: 'phys',
    role: 'Tầm xa', title: 'Nỏ tre bắn được quái bay', color: '#7FC24A',
    attrs: { str: 15, agi: 22, int: 14 }, gain: { str: 1.6, agi: 2.8, int: 1.4 },
    base: { damage: 0, range: 175, cooldown: 1.0 },
    look: { aura: '#2ecc71', weapon: { type: 'crossbow', color: '#8e5a2b' } },
    skills: [
      { id: 'pierce', name: 'Tên Xuyên Thấu', active: { cooldown: 7, cast: 'pierce', mana: 40 },
        info: (n) => `Bắn mũi tên xuyên qua mọi quái trên đường bay: x2 sát thương +${(n * 0.8).toFixed(0)}` },
      { id: 'multishot', name: 'Đa Tiễn',
        info: (n) => `Bắn ${Math.min(5, 2 + Math.floor(n / 40))} mũi tên · +${(n * 0.25).toFixed(1)} sát thương · +${Math.min(80, Math.round(n * 0.4))} tầm`,
        apply: (s, n) => { s.arrows = Math.min(5, 2 + Math.floor(n / 40)); s.damage += n * 0.25; s.range += Math.min(80, n * 0.4); } },
      { id: 'poison', name: 'Tên Tẩm Nhựa Độc',
        info: (n) => `Trúng tên mất ${(3 + n * 0.12).toFixed(1)} máu/giây trong 3 giây`,
        apply: (s, n) => { s.poison = 3 + n * 0.12; } },
      { id: 'arrowrain', name: 'Mưa Tên', active: { cooldown: 10, cast: 'arrowrain', mana: 85 },
        info: (n) => `Trút mưa tên vùng rộng: x2 sát thương +${(n * 0.5).toFixed(0)}` },
    ],
  },
  thosan: {
    name: 'Thợ Săn Rừng', cost: 75, attr: 'agi', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Chí mạng', title: 'Dao găm lá rừng, đòn chí mạng', color: '#7FC24A',
    attrs: { str: 16, agi: 24, int: 12 }, gain: { str: 1.8, agi: 3.0, int: 1.2 },
    base: { damage: 2, range: 140, cooldown: 0.85 },
    look: { aura: '#9b59b6', weapon: { type: 'daggers', color: '#dfe6e9' } },
    skills: [
      { id: 'shadowstep', name: 'Bước Lá Rừng', active: { cooldown: 6, cast: 'shadowstep', mana: 45 },
        info: (n) => `Lướt tới quái xa nhất trong tầm gấp đôi, chém chữ X: x2 sát thương +${(n * 0.5).toFixed(0)}` },
      { id: 'hiddenblade', name: 'Dao Ẩn',
        info: (n) => `+${(n * 0.35).toFixed(1)} sát thương`,
        apply: (s, n) => { s.damage += n * 0.35; } },
      { id: 'critical', name: 'Đòn Chí Mạng',
        info: (n) => `+${Math.round(15 + Math.min(25, n * 0.1))}% cơ hội chí mạng, chí mạng x${(2.2 + Math.min(1.3, n * 0.008)).toFixed(1)}`,
        apply: (s, n) => { s.crit += 15 + Math.min(25, n * 0.1); s.critMult = 2.2 + Math.min(1.3, n * 0.008); } },
      { id: 'assassinate', name: 'Săn Mồi', active: { cooldown: 14, cast: 'assassinate', mana: 100 },
        info: (n) => `Đánh dấu rồi vồ quái máu cao nhất: x6 sát thương +${n * 3}` },
    ],
  },
  thaymo: {
    name: 'Thầy Mo Lửa', cost: 85, attr: 'int', attack: 'magic', proj: 'fireball', wclass: 'staff', dmgType: 'magic',
    role: 'Nổ lan', title: 'Gọi lửa thiêng, nổ lan và đốt cháy', color: '#A88CE8',
    attrs: { str: 14, agi: 12, int: 24 }, gain: { str: 1.4, agi: 1.2, int: 3.0 },
    base: { damage: 6, range: 145, cooldown: 1.6, splash: 35 },
    look: { aura: '#e67e22', weapon: { type: 'staff', color: '#6d4c41', orb: '#e67e22' } },
    skills: [
      { id: 'firepillar', name: 'Cột Lửa', active: { cooldown: 7, cast: 'firepillar', mana: 55 },
        info: (n) => `Gọi cột lửa đốt cháy quái: x1.8 sát thương +${(n * 0.8).toFixed(0)}` },
      { id: 'soulsiphon', name: 'Đuốc Linh Hồn',
        info: (n) => `+${(n * 0.5).toFixed(1)} sát thương phép · bán kính nổ ${Math.round(Math.min(110, 45 + n * 0.4))}`,
        apply: (s, n) => { s.damage += n * 0.5; s.splash = Math.min(110, 45 + n * 0.4); } },
      { id: 'burn', name: 'Lửa Thiêu',
        info: (n) => `Quái trúng nổ bị đốt ${(4 + n * 0.15).toFixed(1)} máu/giây trong 3 giây`,
        apply: (s, n) => { s.poison = 4 + n * 0.15; } },
      { id: 'meteor', name: 'Hỏa Sơn', active: { cooldown: 12, cast: 'meteor', mana: 110 },
        info: (n) => `Đá lửa rơi từ trời: x5 sát thương +${n * 2} vùng lớn` },
    ],
  },
  thansuong: {
    name: 'Thần Sương Núi', cost: 80, attr: 'int', attack: 'frost', proj: 'frostbolt', wclass: 'staff', dmgType: 'magic',
    role: 'Làm chậm', title: 'Sương lạnh đỉnh núi, làm chậm và đóng băng', color: '#A88CE8',
    attrs: { str: 15, agi: 13, int: 22 }, gain: { str: 1.6, agi: 1.4, int: 2.8 },
    base: { damage: 2, range: 155, cooldown: 1.2, slow: 15 },
    look: { aura: '#74b9ff', weapon: { type: 'staff', color: '#cfd8dc', orb: '#aee9ff', glow: '#74b9ff' } },
    skills: [
      { id: 'nova', name: 'Vòng Sương', active: { cooldown: 8, cast: 'nova', mana: 55 },
        info: (n) => `Nổ sương quanh mục tiêu: ${60 + n} sát thương, làm chậm 60%` },
      { id: 'icebolt', name: 'Mũi Sương Giá',
        info: (n) => `+${(n * 0.45).toFixed(1)} sát thương`,
        apply: (s, n) => { s.damage += n * 0.45; } },
      { id: 'permafrost', name: 'Hơi Lạnh Đỉnh Núi',
        info: (n) => `Làm chậm ${Math.round(Math.min(50, 20 + n * 0.25))}%`,
        apply: (s, n) => { s.slow = Math.max(s.slow, Math.min(50, 20 + n * 0.25)); } },
      { id: 'blizzard', name: 'Mù Sương Tản Viên', active: { cooldown: 16, cast: 'blizzard', mana: 115 },
        info: (n) => `Đóng băng mọi quái trong tầm 2 giây, x3 sát thương +${n}` },
    ],
  },

  // ---------------- 10 TƯỚNG HUYỀN THOẠI (đề xuất, số liệu cần cân bằng) ----------------
  giong: {
    legend: 'legendary', name: 'Thánh Gióng', attr: 'str', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Vươn vai', title: 'Gậy tre ngà, ngựa sắt phun lửa', color: '#E25A3A',
    attrs: { str: 30, agi: 16, int: 12 }, gain: { str: 3.4, agi: 1.6, int: 1.2 },
    base: { damage: 14, range: 150, cooldown: 1.0 },
    look: { aura: '#FFB04A', weapon: { type: 'staff', color: '#D4DC70' } },
    trait: { name: 'Vươn Vai', desc: 'Mỗi đợt đứng trên sân, Gióng to thêm: +5% máu và sát thương (tối đa 10 lần)' },
    skills: [
      { id: 'g_q', name: 'Gậy Tre Ngà', active: { cooldown: 6, cast: 'bamboo', mana: 45 },
        info: (n) => `Quật gậy tre lan ra mọi quái trong tầm, choáng 0.6 giây, x1.6 sát thương +${n}` },
      { id: 'g_w', name: 'Giáp Sắt',
        info: (n) => `Giảm ${Math.round(Math.min(60, 20 + n * 0.5))}% sát thương nhận vào`,
        apply: (s, n) => { s.dr += Math.min(60, 20 + n * 0.5); } },
      { id: 'g_e', name: 'Ngựa Sắt Phun Lửa', active: { cooldown: 9, cast: 'firetrail', mana: 80 },
        info: (n) => `Để lại vệt lửa dọc đường quái đi trong 4 giây: ${(10 + n * 0.5).toFixed(0)} sát thương/giây` },
      { id: 'g_r', name: 'Bay Về Trời', active: { cooldown: 16, cast: 'skyride', mana: 110 },
        info: (n) => `Lướt dọc dòng sông, đánh mọi quái trên quãng đường: x4 sát thương +${n * 2}` },
    ],
  },
  llq: {
    legend: 'legendary', name: 'Lạc Long Quân', attr: 'str', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Con Rồng', title: 'Vua rồng biển, không sợ nước dâng', color: '#E25A3A',
    attrs: { str: 28, agi: 16, int: 16 }, gain: { str: 3.2, agi: 1.6, int: 1.6 },
    base: { damage: 12, range: 150, cooldown: 1.0 },
    look: { aura: '#5AB4D6', weapon: { type: 'none' } },
    trait: { name: 'Con Rồng', desc: 'Không bị sa lầy khi ô ngập nước; đứng trên ô ngập còn được +30% sát thương' },
    skills: [
      { id: 'l_q', name: 'Vuốt Rồng', active: { cooldown: 5, cast: 'claw', mana: 40 },
        info: (n) => `Cào hai đường vuốt nước: 2 lần x1.5 sát thương +${(n * 0.5).toFixed(0)}` },
      { id: 'l_w', name: 'Vảy Rồng',
        info: (n) => `Giảm ${Math.round(Math.min(50, 15 + n * 0.4))}% sát thương nhận, +${(n * 0.1).toFixed(1)} hồi máu`,
        apply: (s, n) => { s.dr += Math.min(50, 15 + n * 0.4); s.regen += n * 0.1; } },
      { id: 'l_e', name: 'Gầm Biển', active: { cooldown: 10, cast: 'seawave', mana: 90 },
        info: (n) => `Sóng lớn cuốn qua đường, đẩy lùi quái và gây x1.5 sát thương +${n}` },
      { id: 'l_r', name: 'Hóa Rồng', active: { cooldown: 15, cast: 'dragonbeam', mana: 110 },
        info: (n) => `Phun nước kèm sét theo đường thẳng: x5 sát thương phép +${n * 2}, choáng 0.5 giây` },
    ],
  },
  kimquy: {
    legend: 'legendary', name: 'Thần Kim Quy', attr: 'str', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Che chắn', title: 'Rùa vàng hộ thành, che chở đồng đội', color: '#E25A3A',
    attrs: { str: 30, agi: 10, int: 18 }, gain: { str: 3.2, agi: 1.0, int: 1.8 },
    base: { damage: 8, range: 140, cooldown: 1.3 },
    look: { aura: '#F2D27A', bulk: 1.1, weapon: { type: 'none' } },
    trait: { name: 'Mai Thần', desc: 'Tướng đứng kề nhận ít hơn 30% sát thương' },
    skills: [
      { id: 'k_q', name: 'Mai Vàng', active: { cooldown: 9, cast: 'goldshell', mana: 60 },
        info: (n) => `Khiên mai rùa cho tướng trong 170: chặn ${Math.round(20 + n * 0.25)}% máu tối đa` },
      { id: 'k_w', name: 'Móng Thần',
        info: () => 'Tướng đứng gần xuyên 20% giáp quái',
        apply: (s) => { s.pierceAura = 20; } },
      { id: 'k_e', name: 'Địa Chấn', active: { cooldown: 10, cast: 'quake', mana: 90 },
        info: (n) => `Dậm đất làm choáng quái trong tầm 1.2 giây, x1.5 sát thương +${n}` },
      { id: 'k_r', name: 'Kim Quy Hộ Thành', active: { cooldown: 40, cast: 'guardcity', mana: 120 },
        info: () => 'Trong 5 giây, quái lọt vào thành không trừ mạng (chỉ dùng khi quái sắp lọt)' },
    ],
  },
  thachsanh: {
    legend: 'legendary', name: 'Thạch Sanh', attr: 'agi', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Diệt boss', title: 'Rìu đốn củi, đàn thần và niêu cơm', color: '#7FC24A',
    attrs: { str: 20, agi: 28, int: 14 }, gain: { str: 2.0, agi: 3.2, int: 1.4 },
    base: { damage: 10, range: 150, cooldown: 0.9 },
    look: { aura: '#F2D27A', weapon: { type: 'axe', color: '#B8853A' } },
    trait: { name: 'Niêu Cơm Thần', desc: 'Tướng đứng gần hồi năng lượng nhanh hơn 50%' },
    skills: [
      { id: 't_q', name: 'Rìu Đốn Củi', active: { cooldown: 5, cast: 'chop', mana: 40 },
        info: (n) => `Bổ rìu cực mạnh: x3 sát thương +${n}` },
      { id: 't_w', name: 'Cung Tên Vàng',
        info: () => 'Bắn được quái bay, x2 sát thương lên quái bay',
        apply: (s) => { s.canAir = true; s.airMult = 2; } },
      { id: 't_e', name: 'Đàn Thần', active: { cooldown: 11, cast: 'lute', mana: 90 },
        info: () => 'Tiếng đàn làm quái trong tầm đứng nghe nhạc: choáng 1.5 giây' },
      { id: 't_r', name: 'Diệt Chằn Tinh', active: { cooldown: 14, cast: 'slayer', mana: 100 },
        info: (n) => `Đòn cực mạnh: x8 sát thương +${n * 3}, x3 lên boss` },
    ],
  },
  caolo: {
    legend: 'epic', name: 'Cao Lỗ', attr: 'agi', attack: 'arrow', proj: 'bolt', wclass: 'bow', dmgType: 'phys',
    role: 'Xuyên giáp', title: 'Người chế nỏ thần, tên xuyên giáp', color: '#7FC24A',
    attrs: { str: 16, agi: 26, int: 14 }, gain: { str: 1.6, agi: 3.0, int: 1.4 },
    base: { damage: 6, range: 185, cooldown: 0.95 },
    look: { aura: '#F2D27A', weapon: { type: 'crossbow', color: '#B8853A' } },
    trait: { name: 'Xuyên Giáp', desc: 'Đòn đánh bỏ qua 50% giáp' },
    skills: [
      { id: 'c_q', name: 'Nỏ Liên Châu', active: { cooldown: 5, cast: 'triple', mana: 40 },
        info: (n) => `Bắn 3 mũi cùng lúc vào 3 quái: mỗi mũi x1.5 sát thương +${(n * 0.5).toFixed(0)}` },
      { id: 'c_w', name: 'Lẫy Thần',
        info: (n) => `+${Math.round(20 + n * 0.4)}% tốc bắn`,
        apply: (s, n) => { s.haste += 20 + n * 0.4; } },
      { id: 'c_e', name: 'Tên Móng Rùa', active: { cooldown: 8, cast: 'turtlearrow', mana: 70 },
        info: (n) => `Tên móng rùa xuyên giáp toàn phần: x3 sát thương chuẩn +${n}` },
      { id: 'c_r', name: 'Nỏ Thần', active: { cooldown: 14, cast: 'divinebow', mana: 100 },
        info: (n) => `Một phát xuyên cả hàng quái: x6 sát thương chuẩn +${n * 2}` },
    ],
  },
  antiem: {
    legend: 'epic', name: 'Mai An Tiêm', attr: 'agi', attack: 'arrow', proj: 'melon', wclass: 'bow', dmgType: 'phys',
    role: 'Kiếm vàng', title: 'Ném dưa hấu, đảo trù phú', color: '#7FC24A',
    attrs: { str: 18, agi: 22, int: 16 }, gain: { str: 1.8, agi: 2.6, int: 1.6 },
    base: { damage: 4, range: 170, cooldown: 1.15, splash: 30 },
    look: { aura: '#3EDC4E', weapon: { type: 'none' } },
    trait: { name: 'Đảo Trù Phú', desc: '+20 vàng mỗi đợt' },
    skills: [
      { id: 'a_q', name: 'Ném Dưa Hấu', active: { cooldown: 6, cast: 'melon', mana: 40 },
        info: (n) => `Ném quả dưa to: x1.5 sát thương +${n} quanh mục tiêu, làm chậm 50%` },
      { id: 'a_w', name: 'Hạt Giống Vàng',
        info: (n) => `Hạ quái được thêm ${Math.round(1 + n * 0.05)} vàng`,
        apply: (s, n) => { s.goldOnKill += Math.round(1 + n * 0.05); } },
      { id: 'a_e', name: 'Chim Thần', active: { cooldown: 9, cast: 'birds', mana: 70 },
        info: (n) => `Đàn chim mổ 6 lần vào quái trong tầm, mỗi lần x1 sát thương +${(n * 0.5).toFixed(0)}` },
      { id: 'a_r', name: 'Mưa Dưa', active: { cooldown: 18, cast: 'melonrain', mana: 110 },
        info: (n) => `Dưa rơi khắp bản đồ: mọi quái nhận x2 sát thương +${n} và bị làm chậm` },
    ],
  },
  auco: {
    legend: 'legendary', name: 'Âu Cơ', attr: 'int', attack: 'magic', proj: 'feather', wclass: 'staff', dmgType: 'magic',
    role: 'Hồi máu', title: 'Mẹ Tiên, bọc trăm trứng', color: '#A88CE8',
    attrs: { str: 16, agi: 14, int: 28 }, gain: { str: 1.6, agi: 1.4, int: 3.2 },
    base: { damage: 10, range: 160, cooldown: 1.3 },
    look: { aura: '#FF9EC4', weapon: { type: 'none' } },
    trait: { name: 'Mẹ Tiên', desc: 'Hồi máu từ từ cho tướng xung quanh (2% máu/giây)' },
    skills: [
      { id: 'u_q', name: 'Hoa Tiên', active: { cooldown: 7, cast: 'flowerheal', mana: 50 },
        info: (n) => `Hồi ${Math.round(25 + n * 0.3)}% máu cho tướng trong 180` },
      { id: 'u_w', name: 'Lông Vũ Tiên',
        info: (n) => `Bắn ${Math.min(4, 2 + Math.floor(n / 50))} lông vũ mỗi lần đánh`,
        apply: (s, n) => { s.arrows = Math.min(4, 2 + Math.floor(n / 50)); } },
      { id: 'u_e', name: 'Núi Mẹ', active: { cooldown: 10, cast: 'mothermountain', mana: 90 },
        info: (n) => `Đá trồi lên làm chậm 50% quái trong vùng 4 giây, ${(12 + n * 0.4).toFixed(0)} sát thương/giây` },
      { id: 'u_r', name: 'Bọc Trăm Trứng', active: { cooldown: 20, cast: 'hundredeggs', mana: 120 },
        info: () => 'Nở đàn Lạc Tử chặn đường quái trong 6 giây' },
    ],
  },
  cdt: {
    legend: 'epic', name: 'Chử Đồng Tử', attr: 'int', attack: 'magic', proj: 'orb', wclass: 'staff', dmgType: 'magic',
    role: 'Hồi sinh', title: 'Gậy thần, nón thần, thành một đêm', color: '#A88CE8',
    attrs: { str: 16, agi: 14, int: 26 }, gain: { str: 1.6, agi: 1.4, int: 3.0 },
    base: { damage: 8, range: 160, cooldown: 1.3 },
    look: { aura: '#9EDDF2', weapon: { type: 'staff', color: '#8a6a3a', orb: '#9EDDF2' } },
    trait: { name: 'Gậy Thần', desc: 'Hồi sinh ngay 1 tướng gục gần nhất (hồi chiêu 40 giây)' },
    skills: [
      { id: 'd_q', name: 'Gậy Thần', active: { cooldown: 7, cast: 'staffheal', mana: 45 },
        info: (n) => `Hồi ${Math.round(35 + n * 0.3)}% máu cho tướng yếu nhất trong 200` },
      { id: 'd_w', name: 'Nón Thần',
        info: () => 'Tướng đứng gần chặn 50% đòn bắn từ xa của quái',
        apply: (s) => { s.blockAura = 50; } },
      { id: 'd_e', name: 'Sóng Sông Hồng', active: { cooldown: 9, cast: 'redriver', mana: 80 },
        info: (n) => `Sóng sông làm chậm 50% quái trong tầm 3 giây, x1.5 sát thương +${n}` },
      { id: 'd_r', name: 'Thành Một Đêm', active: { cooldown: 22, cast: 'nightcastle', mana: 120 },
        info: () => 'Dựng thành chặn đường quái trong 6 giây' },
    ],
  },
  tiendung: {
    legend: 'epic', name: 'Tiên Dung', attr: 'int', attack: 'magic', proj: 'petal', wclass: 'staff', dmgType: 'magic',
    role: 'Đẩy lùi', title: 'Công chúa quạt tiên, mưa hoa', color: '#A88CE8',
    attrs: { str: 14, agi: 16, int: 26 }, gain: { str: 1.4, agi: 1.6, int: 3.0 },
    base: { damage: 9, range: 160, cooldown: 1.2 },
    look: { aura: '#FF9EC4', weapon: { type: 'none' } },
    trait: { name: 'Đôi Uyên Ương', desc: 'Đứng cạnh Chử Đồng Tử thì cả hai +20% sát thương phép' },
    skills: [
      { id: 'n_q', name: 'Quạt Tiên', active: { cooldown: 7, cast: 'fan', mana: 45 },
        info: (n) => `Gió quạt đẩy lùi quái trong tầm, x1.2 sát thương +${n}` },
      { id: 'n_w', name: 'Ánh Ngọc',
        info: () => 'Tướng đứng gần +15% sát thương phép',
        apply: (s) => { s.magicAura = 15; } },
      { id: 'n_e', name: 'Sen Hồng', active: { cooldown: 9, cast: 'lotus', mana: 60 },
        info: (n) => `Hồi ${Math.round(20 + n * 0.3)}% máu cho tướng trong 180` },
      { id: 'n_r', name: 'Mưa Hoa Tiên', active: { cooldown: 15, cast: 'flowerrain', mana: 110 },
        info: (n) => `Hoa rơi vùng lớn: x4 sát thương phép +${n * 2}, hồi 30% máu cho tướng gần` },
    ],
  },
  langlieu: {
    legend: 'epic', name: 'Lang Liêu', attr: 'int', attack: 'magic', proj: 'rice', wclass: 'staff', dmgType: 'magic',
    role: 'Hỗ trợ', title: 'Bánh chưng bánh giầy, lễ vật đất trời', color: '#A88CE8',
    attrs: { str: 18, agi: 12, int: 24 }, gain: { str: 1.8, agi: 1.2, int: 2.8 },
    base: { damage: 8, range: 155, cooldown: 1.3 },
    look: { aura: '#7FC24A', weapon: { type: 'none' } },
    trait: { name: 'Lễ Vật Đất Trời', desc: 'Tướng đứng gần +10% máu tối đa' },
    skills: [
      { id: 'b_q', name: 'Bánh Chưng', active: { cooldown: 9, cast: 'banhchung', mana: 50 },
        info: (n) => `Khiên cho tướng trong 170: chặn ${Math.round(20 + n * 0.25)}% máu tối đa` },
      { id: 'b_w', name: 'Bánh Giầy',
        info: (n) => `Tướng đứng gần +${(2 + n * 0.08).toFixed(1)} hồi máu/giây`,
        apply: (s, n) => { s.regenAura = 2 + n * 0.08; } },
      { id: 'b_e', name: 'Ruộng Lúa', active: { cooldown: 10, cast: 'ricefield', mana: 80 },
        info: (n) => `Lúa mọc làm chậm 40% quái trong vùng 4 giây, ${(8 + n * 0.3).toFixed(0)} sát thương/giây` },
      { id: 'b_r', name: 'Lễ Tổ Tiên', active: { cooldown: 30, cast: 'ancestor', mana: 120 },
        info: () => 'Toàn quân hồi đầy máu, bất tử 2 giây' },
    ],
  },
};
const BASIC_HEROES = ['lactuong', 'lucsi', 'xathu', 'thosan', 'thaymo', 'thansuong'];
const LEGEND_HEROES = ['giong', 'llq', 'kimquy', 'thachsanh', 'caolo', 'antiem', 'auco', 'cdt', 'tiendung', 'langlieu'];
for (const id of LEGEND_HEROES) HEROES[id].cost = COSTS.legend[HEROES[id].legend];

const SKILL_KEYS = ['Q', 'W', 'E', 'R'];
const SKILL_MAX = [4, 4, 4, 3];
const skillMult = (lv) => 1 + 0.25 * (Math.max(1, lv) - 1);   // mỗi cấp kỹ năng +25% hiệu lực
// cấp tướng cần để kỹ năng thứ i đạt cấp L
const skillReqLevel = (i, L) => (i === 3 ? [0, 6, 11, 16][L] || 99 : [0, 1, 3, 5, 7][L] || 99);

// ------------------------------------------------------------
//  TRANG BỊ (3 ô trang phục) — `look` đổi hình dạng tướng khi mặc
// ------------------------------------------------------------
const ITEMS = {
  // --- Rìu / dao (tướng cận chiến)
  riu_dong:   { name: 'Rìu Đồng', slot: 'weapon', wclass: 'blade', rarity: 'common',
                stats: { damage: 5 }, look: { type: 'axe', color: '#C89A4A' } },
  riu_chien:  { name: 'Rìu Chiến', slot: 'weapon', wclass: 'blade', rarity: 'rare',
                stats: { damage: 12, haste: -10 }, look: { type: 'axe', color: '#9E9A90' } },
  riu_lua:    { name: 'Rìu Lửa', slot: 'weapon', wclass: 'blade', rarity: 'epic',
                stats: { damage: 14, crit: 10 }, look: { type: 'axe', color: '#e67e22', glow: '#ff6b00' } },
  long_riu:   { name: 'Long Rìu', slot: 'weapon', wclass: 'blade', rarity: 'legendary', set: 'laclong',
                stats: { damage: 24, crit: 10 }, look: { type: 'greataxe', color: '#2ecc71', glow: '#00ff88' } },
  // --- Nỏ
  no_tre:     { name: 'Nỏ Tre', slot: 'weapon', wclass: 'bow', rarity: 'common',
                stats: { damage: 3, range: 15 }, look: { type: 'crossbow', color: '#C8A040' } },
  no_lim:     { name: 'Nỏ Gỗ Lim', slot: 'weapon', wclass: 'bow', rarity: 'rare',
                stats: { damage: 6, range: 35 }, look: { type: 'crossbow', color: '#6A3A1A' } },
  no_bao:     { name: 'Nỏ Bão', slot: 'weapon', wclass: 'bow', rarity: 'epic',
                stats: { damage: 9, haste: 20 }, look: { type: 'crossbow', color: '#3498db', glow: '#74b9ff' } },
  long_no:    { name: 'Long Nỏ', slot: 'weapon', wclass: 'bow', rarity: 'legendary', set: 'laclong',
                stats: { damage: 15, haste: 20, range: 30 }, look: { type: 'crossbow', color: '#2ecc71', glow: '#00ff88' } },
  // --- Gậy
  gay_mo:     { name: 'Gậy Thầy Mo', slot: 'weapon', wclass: 'staff', rarity: 'common',
                stats: { damage: 5 }, look: { type: 'staff', color: '#8d6e63', orb: '#9EDDF2' } },
  gay_ngoc:   { name: 'Gậy Ngọc', slot: 'weapon', wclass: 'staff', rarity: 'rare',
                stats: { damage: 10, range: 20 }, look: { type: 'staff', color: '#b0bec5', orb: '#00cec9', glow: '#81ecec' } },
  truong_hu_khong: { name: 'Trượng Hư Không', slot: 'weapon', wclass: 'staff', rarity: 'epic',
                stats: { damage: 18, crit: 8 }, look: { type: 'staff', color: '#2d3436', orb: '#a29bfe', glow: '#6c5ce7' } },
  long_truong:{ name: 'Long Trượng', slot: 'weapon', wclass: 'staff', rarity: 'legendary', set: 'laclong',
                stats: { damage: 28 }, look: { type: 'staff', color: '#145a32', orb: '#2ecc71', glow: '#00ff88' } },
  // --- Mũ
  mu_long_chim: { name: 'Mũ Lông Chim', slot: 'helmet', rarity: 'common',
                stats: { range: 5, agi: 2 }, look: { type: 'feather', color: '#B8402A' } },
  mu_dong:    { name: 'Mũ Đồng', slot: 'helmet', rarity: 'rare',
                stats: { str: 5, hp: 60 }, look: { type: 'helm', color: '#B8853A', plume: '#c0392b' } },
  mu_sung:    { name: 'Mũ Sừng', slot: 'helmet', rarity: 'epic',
                stats: { damage: 6, crit: 8 }, look: { type: 'horned', color: '#5A4632' } },
  non_mo:     { name: 'Nón Thầy Mo', slot: 'helmet', rarity: 'rare',
                stats: { int: 6, cdr: 8 }, look: { type: 'wizard', color: '#6c3fa0' } },
  mu_lac_long:{ name: 'Mũ Lạc Long', slot: 'helmet', rarity: 'legendary', set: 'laclong',
                stats: { damage: 8, str: 5, agi: 5, int: 5 }, look: { type: 'crown', color: '#F2D27A', gem: '#2ecc71' } },
  // --- Giáp
  ao_vai:     { name: 'Áo Vải', slot: 'armor', rarity: 'common',
                stats: { haste: 5, hp: 40 }, look: { type: 'leather', color: '#a0522d' } },
  giap_dong:  { name: 'Giáp Đồng', slot: 'armor', rarity: 'rare',
                stats: { str: 6, hp: 80 }, look: { type: 'plate', color: '#B8853A' } },
  ao_choang_mo: { name: 'Áo Choàng Mo', slot: 'armor', rarity: 'epic',
                stats: { int: 10, haste: 10 }, look: { type: 'robe', color: '#6c3fa0', trim: '#F2D27A', cape: '#4a2a70' } },
  giap_vua:   { name: 'Giáp Vua', slot: 'armor', rarity: 'epic',
                stats: { damage: 10, str: 8, hp: 100 }, look: { type: 'plate', color: '#F2D27A', cape: '#B8301E' } },
  giap_vay_rong: { name: 'Giáp Vảy Rồng', slot: 'armor', rarity: 'legendary', set: 'laclong',
                stats: { damage: 12, haste: 10, hp: 150 }, look: { type: 'plate', color: '#1F7A78', cape: '#145a32' } },

  // ------------------------------------------------------------
  //  PHỤ KIỆN — mua ở Lò đúc đồng, ghép thành đồ mạnh
  // ------------------------------------------------------------
  vuot_ho:    { name: 'Vuốt Hổ', slot: 'acc', rarity: 'common', price: 120, stats: { damage: 10 },
                desc: 'Nguyên liệu: Song Rìu Cuồng Nộ, Lưỡi Hái Chí Tử' },
  gang_da:    { name: 'Găng Da', slot: 'acc', rarity: 'common', price: 110, stats: { haste: 12 },
                desc: 'Nguyên liệu: Song Rìu Cuồng Nộ' },
  dai:        { name: 'Đai', slot: 'acc', rarity: 'common', price: 100, stats: { str: 8 },
                desc: 'Nguyên liệu: Gậy Tam Giới, Giáp Đồng Bất Diệt' },
  dep_co:     { name: 'Dép Cỏ', slot: 'acc', rarity: 'common', price: 100, stats: { agi: 8 },
                desc: 'Nguyên liệu: Gậy Tam Giới, Lưỡi Hái Chí Tử' },
  khan:       { name: 'Khăn', slot: 'acc', rarity: 'common', price: 100, stats: { int: 8 },
                desc: 'Nguyên liệu: Gậy Tam Giới' },
  khan_hien_gia: { name: 'Khăn Hiền Giả', slot: 'acc', rarity: 'common', price: 130, stats: { int: 10, cdr: 5 },
                desc: 'Nguyên liệu: Gậy Thời Không' },
  mat_ngoc:   { name: 'Mắt Ngọc', slot: 'acc', rarity: 'common', price: 120, stats: { range: 25 },
                desc: 'Nguyên liệu: Gậy Thời Không' },
  ngoc_sinh_luc: { name: 'Ngọc Sinh Lực', slot: 'acc', rarity: 'common', price: 130, stats: { hp: 200, regen: 2 },
                desc: 'Nguyên liệu: Giáp Đồng Bất Diệt' },
  mat_trong:  { name: 'Mặt Trống', slot: 'acc', rarity: 'common', price: 120, stats: { hp: 80, str: 4 },
                desc: 'Nguyên liệu: Trống Đồng' },
  dui_trong:  { name: 'Dùi Trống', slot: 'acc', rarity: 'common', price: 110, stats: { damage: 6 },
                desc: 'Ghép với Mặt Trống để đúc Trống Đồng' },

  trong_dong: { name: 'Trống Đồng', slot: 'acc', rarity: 'legendary',
                recipe: { parts: ['mat_trong', 'dui_trong'], cost: 150 },
                stats: { damage: 10, hp: 150 }, hasteAura: 20, look: { aura: '#F2D27A' },
                desc: 'Hào quang: tăng 20% tốc đánh cho các tướng đứng xung quanh' },
  song_riu:   { name: 'Song Rìu Cuồng Nộ', slot: 'acc', rarity: 'epic',
                recipe: { parts: ['vuot_ho', 'gang_da'], cost: 150 },
                stats: { damage: 22, haste: 25, cleave: 0.25 }, look: { aura: '#e74c3c' } },
  gay_tam_gioi: { name: 'Gậy Tam Giới', slot: 'acc', rarity: 'legendary',
                recipe: { parts: ['dai', 'dep_co', 'khan'], cost: 150 },
                stats: { str: 15, agi: 15, int: 15 }, look: { aura: '#f1c40f' } },
  gay_thoi_khong: { name: 'Gậy Thời Không', slot: 'acc', rarity: 'epic',
                recipe: { parts: ['khan_hien_gia', 'mat_ngoc'], cost: 150 },
                stats: { int: 16, cdr: 20, range: 30 }, look: { aura: '#4a90e2' } },
  giap_bat_diet: { name: 'Giáp Đồng Bất Diệt', slot: 'acc', rarity: 'epic',
                recipe: { parts: ['ngoc_sinh_luc', 'dai'], cost: 150 },
                stats: { str: 15, hp: 500, regen: 6 }, look: { aura: '#2ecc71' } },
  luoi_hai:   { name: 'Lưỡi Hái Chí Tử', slot: 'acc', rarity: 'epic',
                recipe: { parts: ['vuot_ho', 'dep_co'], cost: 200 },
                stats: { damage: 30, crit: 15 }, look: { aura: '#c0392b' } },

  // --- Sính lễ: bảo vật riêng của từng boss (chọn trong bảng thưởng)
  voi_chin_nga: { name: 'Voi Chín Ngà', slot: 'acc', rarity: 'legendary', bossOnly: true,
                desc: 'Sính lễ của Thuồng Luồng: sức voi chín ngà, đòn đánh có 15% làm choáng 0.5 giây',
                stats: { str: 25, hp: 500, regen: 8 }, stunChance: 15, look: { aura: '#C8A040' } },
  ga_chin_cua: { name: 'Gà Chín Cựa', slot: 'acc', rarity: 'legendary', bossOnly: true,
                desc: 'Sính lễ của Hà Bá: gà gáy sáng, đánh nhanh và hiểm',
                stats: { agi: 20, haste: 30, crit: 12 }, look: { aura: '#E25A3A' } },
  ngua_hong_mao: { name: 'Ngựa Chín Hồng Mao', slot: 'acc', rarity: 'legendary', bossOnly: true,
                desc: 'Sính lễ của Thủy Tinh: ngựa thần phi xa, chiêu thức hồi nhanh',
                stats: { int: 20, cdr: 15, damage: 25, range: 25 }, look: { aura: '#FF8A5A' } },
  ngoc_hoi_sinh: { name: 'Ngọc Hồi Sinh', slot: 'acc', rarity: 'legendary', bossOnly: true, revive: true,
                stats: {}, desc: 'Khi gục sẽ hồi sinh ngay với đầy máu (dùng 1 lần)' },
};

// Bộ đồ: mặc đủ `pieces` món cùng bộ -> cộng chỉ số + biến hình
const SETS = {
  laclong: {
    name: 'Bộ Lạc Long', pieces: 3,
    desc: '+30% sát thương, mọc cánh rồng: dòng dõi Lạc Long Quân',
    apply: (s) => { s.bonusDmgPct += 30; },
    look: { wings: '#1e8449', aura: '#2ecc71' },
  },
};

// ------------------------------------------------------------
//  QUÂN THỦY TINH
//  armor: giáp · mr: % kháng phép · speed: px logic / giây
// ------------------------------------------------------------
const ENEMIES = {
  tom:     { name: 'Tôm Binh', hp: 60, speed: 40, gold: 4, size: 13, color: '#F28A4A', drop: 0.03,
             armor: 2, mr: 0, short: 'Đi bầy đông', desc: 'Đi thành bầy đông. Dễ bị sát thương lan.' },
  casau:   { name: 'Cá Sấu', hp: 46, speed: 74, gold: 5, size: 14, color: '#5E9A3A', drop: 0.03,
             armor: 3, mr: 10, enrage: { below: 0.5, speed: 1.6 }, short: 'Nhanh, dưới 50% máu hóa điên',
             desc: 'Bơi nhanh; máu dưới 50% thì hóa điên, chạy nhanh gấp rưỡi. Nên làm chậm.' },
  rua:     { name: 'Rùa Giáp', hp: 320, speed: 23, gold: 14, size: 18, color: '#6A7A4A', drop: 0.08,
             armor: 14, mr: 40, stunResist: 0.5, short: 'Giáp và kháng phép rất cao, kháng choáng',
             desc: 'Mai rất cứng nên cả sát thương vật lý lẫn phép đều bị giảm mạnh. Bị choáng ngắn hơn.' },
  phuthuy: { name: 'Phù Thủy Nước', hp: 90, speed: 34, gold: 9, size: 13, color: '#3A8A9A', drop: 0.06,
             armor: 1, mr: 30, ranged: { range: 135, dmg: 12, cd: 2.4 }, heal: { cd: 4, pct: 0.12, radius: 110 },
             short: 'Bắn tướng từ xa, hồi máu quái xung quanh',
             desc: 'Phun nước bắn tướng từ xa và hồi máu cho quái xung quanh. Nên hạ trước.' },
  chimbao: { name: 'Chim Bão', hp: 55, speed: 56, gold: 7, size: 13, color: '#8A9AAA', drop: 0.04,
             armor: 0, mr: 25, flying: true, short: 'Bay: chỉ tướng đánh xa và tướng phép bắn được',
             desc: 'Bay trên không: chỉ tướng đánh xa và tướng phép bắn được.' },
  echme:   { name: 'Ếch Mẹ', hp: 150, speed: 32, gold: 8, size: 16, color: '#7AAA3A', drop: 0.05,
             armor: 5, mr: 10, split: { type: 'nongnoc', count: 3 }, short: 'Chết tách 3 Nòng Nọc',
             desc: 'Chết thì tách thành 3 Nòng Nọc bơi rất nhanh.' },
  nongnoc: { name: 'Nòng Nọc', hp: 30, speed: 64, gold: 2, size: 8, color: '#4A5A2A', drop: 0,
             armor: 2, mr: 0, minion: true, desc: 'Nở ra từ Ếch Mẹ.' },
  giaolong:{ name: 'Giao Long Con', hp: 45, speed: 68, gold: 3, size: 11, color: '#3A8A5A', drop: 0,
             armor: 2, mr: 60, minion: true, desc: 'Do Thủy Tinh gọi ra. Kháng phép cao.' },

  // --- Boss
  thuongluong: { name: 'Thuồng Luồng', hp: 1300, speed: 20, gold: 150, size: 30, color: '#3A7A4A',
            drop: 1, boss: true, lives: 5, armor: 12, mr: 25, reward: 'voi_chin_nga',
            slam: { range: 160, dmg: 55, cd: 6, stun: 1.2 }, summon: { cd: 9, count: 2, type: 'tom' },
            enrage: { below: 0.5, speed: 1.3 }, tags: ['Quẫy đuôi choáng tướng', 'Hóa điên'],
            short: 'Quẫy đuôi làm choáng tướng, gọi Tôm Binh, hóa điên khi dưới 50% máu',
            desc: 'Quẫy đuôi làm choáng tướng, gọi Tôm Binh, hóa điên khi dưới 50% máu. Lọt vào thành: mất 5 mạng.',
            tip: 'Giữ khoảng cách: tướng đánh xa đứng ngoài tầm quẫy đuôi 160.' },
  haba:    { name: 'Hà Bá', hp: 1100, speed: 21, gold: 190, size: 28, color: '#2A6A7A',
            drop: 1, boss: true, lives: 5, armor: 14, mr: 20, reward: 'ga_chin_cua',
            reincarnate: { pct: 0.6, delay: 2.5 }, summon: { cd: 8, count: 3, type: 'tom' },
            tags: ['Gọi lính liên tục', 'Hồi sinh 1 lần'],
            short: 'Gọi lính liên tục; bị hạ lần đầu sẽ lặn xuống nước rồi trồi lên với 60% máu',
            desc: 'Chúa sông già: áo vảy cá, mũ kết vỏ sò, tay cầm đinh ba. Gọi lính liên tục; bị hạ lần đầu sẽ lặn xuống nước rồi trồi lên với 60% máu.',
            tip: 'Giữ chiêu R cho lần Hà Bá trồi lên với 60% máu.' },
  thuytinh:{ name: 'Thủy Tinh', hp: 1200, speed: 22, gold: 170, size: 28, color: '#3A6AB0',
            drop: 1, boss: true, lives: 5, armor: 6, mr: 50, reward: 'ngua_hong_mao',
            burnAura: { radius: 150, dps: 10 }, phaseSummon: { type: 'giaolong', count: 4 }, slowResist: 0.5,
            tempFlood: { count: 3, time: 8 }, tags: ['Hô mưa gọi gió', 'Gọi Giao Long', 'Ngập tạm 3 ô'],
            short: 'Hô mưa gọi gió gây sát thương tướng đứng gần; mỗi lần mất 25% máu gọi 4 Giao Long Con và làm ngập tạm 3 ô trong 8 giây',
            desc: 'Thần nước nổi giận. Hô mưa gọi gió gây sát thương tướng đứng gần. Mỗi lần mất 25% máu gọi 4 Giao Long Con (kháng phép cao) và làm ngập tạm 3 ô trong 8 giây.',
            tip: 'Đặt tướng vật lý chặn Giao Long Con: chúng kháng phép rất cao.' },
};
const BOSS_ORDER = ['thuongluong', 'haba', 'thuytinh'];

// Quái tinh anh (từ đợt 6): máu x1.8, thưởng nhiều hơn, thêm một đặc tính
const ELITE_MODS = {
  armored: { name: 'Vỏ Cứng', color: '#C8BFA8', desc: '+10 giáp' },
  regen:   { name: 'Nước Thánh', color: '#3EDC4E', desc: 'Hồi 3% máu mỗi giây' },
  swift:   { name: 'Sóng Cuốn', color: '#9EDDF2', desc: 'Chạy nhanh hơn 40%' },
  shield:  { name: 'Màng Nước', color: '#5AB4D6', desc: 'Khiên chặn sát thương bằng 40% máu' },
};

const waveHpMult = (n) => Math.pow(1.16, n - 1);

// Lịch đợt mặc định: boss ở đợt 10/20/30, đợt bay 7/13/17/24/27,
// Rùa Giáp khổng lồ ở 5/15/25. Nước dâng sau đợt boss 10 và 20.
const AIR_WAVES = [7, 13, 17, 24, 27];
const CHAMPION_WAVES = [5, 15, 25];

// Chiến dịch dọc sông Đà (tên ải là đề xuất)
const LEVELS = [
  { name: 'Bến Sông Đà', waves: 10, hp: 0.75, bosses: { 10: 'thuongluong' },
    desc: 'Bến sông yên bình nơi Thủy Tinh thử quân lần đầu. Mười đợt để làm quen.', hint: ['xathu', 'lactuong', 'thaymo'] },
  { name: 'Thác Bờ', waves: 20, hp: 0.85, bosses: { 10: 'thuongluong', 20: 'haba' },
    desc: 'Thác nước đổ mạnh, quân Thủy Tinh xuôi dòng nhanh hơn.', hint: ['thansuong', 'xathu', 'lucsi'] },
  { name: 'Rừng Lim', waves: 30, hp: 1, bosses: { 10: 'thuongluong', 20: 'haba', 30: 'haba' },
    desc: 'Rừng lim cổ thụ phủ kín hai bờ. Đường quái dài, uốn quanh tán lá rậm.', hint: ['xathu', 'thaymo', 'lucsi'] },
  { name: 'Bãi Phù Sa', waves: 30, hp: 1.08, bosses: { 10: 'thuongluong', 20: 'haba', 30: 'thuytinh' },
    desc: 'Bãi phù sa màu mỡ, Núi Tản Viên mọc nhanh hơn ở đây.', hint: ['lactuong', 'thaymo', 'thansuong'] },
  { name: 'Chân Núi Tản', waves: 30, hp: 1.16, bosses: { 10: 'thuongluong', 20: 'haba', 30: 'thuytinh' },
    desc: 'Dưới chân núi Tản, Sơn Tinh đứng ra chặn nước.', hint: ['thosan', 'xathu', 'thaymo'] },
  { name: 'Đầm Lầy', waves: 30, hp: 1.24, water: 1, bosses: { 10: 'thuongluong', 20: 'haba', 30: 'thuytinh' },
    desc: 'Đầm lầy ngập sẵn: các ô bậc Thấp đã ngập từ đầu trận.', hint: ['llq', 'xathu', 'thansuong'] },
  { name: 'Cửa Sông Hồng', waves: 30, hp: 1.32, bosses: { 10: 'haba', 20: 'thuytinh', 30: 'thuytinh' },
    desc: 'Nơi sông Đà đổ về sông Hồng, nước dâng dữ nhất.', hint: ['cdt', 'tiendung', 'xathu'] },
  { name: 'Thành Phong Châu', waves: 30, hp: 1.4, bosses: { 10: 'thuongluong', 20: 'haba', 30: 'thuytinh' },
    desc: 'Trận cuối giữ kinh đô Văn Lang. Thủy Tinh đích thân dâng nước.', hint: ['giong', 'kimquy', 'thaymo'] },
];
const STAR_RULES = ['Thắng ải', 'Còn ≥ 15 mạng', 'Không mất mạng'];

// Đợt có boss không (theo ải đang chơi; vô tận: boss mỗi 10 đợt)
function bossAt(n, level) {
  const lv = LEVELS[level || 0];
  if (lv.bosses[n]) return lv.bosses[n];
  if (n > lv.waves && n % 10 === 0) return BOSS_ORDER[(n / 10) % BOSS_ORDER.length];
  return null;
}
const waveKind = (n, level) => (bossAt(n, level) ? 'boss'
  : AIR_WAVES.includes(n) ? 'air' : CHAMPION_WAVES.includes(n) ? 'champion' : 'normal');

function buildWave(n, level) {
  const list = [];
  const count = 8 + Math.floor(n * 1.6);
  const kind = waveKind(n, level);
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let type = 'tom';
    if (kind === 'air' && r < 0.55) type = 'chimbao';
    else if (n >= 8 && r < 0.1) type = 'echme';
    else if (n >= 3 && r < 0.22) type = 'phuthuy';
    else if (n >= 6 && r < 0.34) type = 'rua';
    else if (n >= 9 && r < 0.42) type = 'chimbao';
    else if (n >= 2 && r < 0.64) type = 'casau';
    const elite = n >= 6 && Math.random() < 0.08 + n * 0.006
      ? Object.keys(ELITE_MODS)[Math.floor(Math.random() * 4)] : null;
    list.push({ type, elite, gap: type === 'casau' || type === 'chimbao' ? 0.45 : 0.8 });
  }
  if (kind === 'champion') list.push({ type: 'rua', elite: 'armored', champion: true, gap: 2 });
  if (kind === 'boss') list.push({ type: bossAt(n, level), gap: 3 });
  return list;
}

// Núi Tản Viên: cao dần qua các đợt, cho vàng, hồi mạng thành, mọc Linh Chi
const MOUNTAIN = {
  stageWaves: 5,               // mỗi 5 đợt lên một giai đoạn (tối đa 5)
  stages: ['Gò Đất', 'Đồi Nhỏ', 'Núi Non', 'Núi Cao', 'Núi Thần'],
  goldPerStage: 15,            // vàng mỗi đợt = giai đoạn × 15
  soilCost: 80,                // Bồi đất: núi cao nhanh thêm 1 bước (mỗi đợt 1 lần)
  herbGold: 40,                // mỗi cây Linh Chi: 40 vàng + hồi 25% máu tướng
};
