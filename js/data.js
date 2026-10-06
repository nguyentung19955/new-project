'use strict';

// ============================================================
//  NÚI CAO NƯỚC DÂNG · DỮ LIỆU GAME
//  Bản đồ, tướng Văn Lang (6 cơ bản + 8 thần Sử thi + 6 Huyền thoại), kỹ năng,
//  trang bị, Lò đúc đồng, quân Thủy Tinh, boss, Núi Tản Viên,
//  Nước Dâng và chiến dịch dọc sông Đà.
//  Muốn cân bằng game / thêm nội dung thì chủ yếu sửa file này.
//  Số liệu ghi "đề xuất" trong GAMEPLAY.md cần chơi thử để cân bằng.
// ============================================================

// Bản thiết kế vẽ ở khung 932 × 430 (điện thoại cầm ngang). Game dùng hệ
// tọa độ logic 1280 × 590 cùng tỉ lệ: tọa độ thiết kế × DK.
const DK = 1280 / 932;
// màu hex + độ trong suốt an toàn: '#fff' → '#ffffff' trước khi ghép 'aa' (tránh lỗi addColorStop)
const hexA = (c, aa) => {
  if (/^#[0-9a-f]{3}$/i.test(c)) c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
  else if (!/^#[0-9a-f]{6}$/i.test(c)) c = '#ffffff';
  return c + aa;
};

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
    [0, 0, 932, 104],         // thanh trên + dải gợi ý hợp thể + chỗ cho đầu tướng
    [0, 0, 120, 140],         // (cũ: bảng Triệu hồi) — chừa góc trái trên
    [270, 46, 660, 80],       // dải "đợt sắp tới"
    [300, 330, 632, 430],     // hàng thẻ tướng dưới đáy
    [0, 340, 932, 430],       // mép dưới màn hình
  ],
  // Lưới ô đặt tướng (tọa độ thiết kế): khoảng cách ô, dải cách tim sông
  buildGrid: { sx: 46, sy: 33, minD: 40, maxD: 98, spacing: 70 },   // spacing: khoảng cách tối thiểu giữa 2 ô (thiết kế)
  slots: [],      // [x, y] tọa độ logic (sinh trong game.js)
  slotTier: [],   // (bỏ ở v36: mọi ô như nhau)
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
  bonusDmgPct: '% Sát thương', pierce: '% Xuyên giáp', mpen: '% Xuyên kháng phép', str: 'Sức mạnh', agi: 'Nhanh nhẹn', int: 'Trí tuệ',
  hp: 'Máu', regen: 'Hồi máu/s', cleave: 'Chém lan', cdr: '% Giảm hồi chiêu', dr: '% Giảm sát thương nhận',
  goldOnKill: 'Vàng mỗi quái hạ',
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
        info: (n) => `Đóng băng mọi quái trong tầm 2 giây (boss 1 giây), x3 sát thương +${n}` },
    ],
  },

  // ---------------- 10 TƯỚNG HUYỀN THOẠI (đề xuất, số liệu cần cân bằng) ----------------
  giong: {
    legend: 'legendary', name: 'Thánh Gióng', mount: 'ngua_sat', attr: 'str', attack: 'melee', wclass: 'blade', dmgType: 'phys',
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
      { id: 'g_r', name: 'Bay Về Trời', active: { cooldown: 20, cast: 'skyride', mana: 120 },
        info: (n) => `Cưỡi ngựa sắt bay dọc cả dòng sông, đánh mọi quái trên bản đồ (cả quái bay): x4 sát thương +${n * 2}` },
    ],
  },
  llq: {
    legend: 'legendary', name: 'Lạc Long Quân', attr: 'str', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Con Rồng', title: 'Vua rồng biển, không sợ nước dâng', color: '#E25A3A',
    attrs: { str: 28, agi: 16, int: 16 }, gain: { str: 3.2, agi: 1.6, int: 1.6 },
    base: { damage: 12, range: 150, cooldown: 1.0 },
    look: { aura: '#5AB4D6', weapon: { type: 'none' } },
    trait: { name: 'Con Rồng', desc: 'Khi máu dưới 50%: rồng nổi giận, +30% sát thương' },
    skills: [
      { id: 'l_q', name: 'Vuốt Rồng', active: { cooldown: 5, cast: 'claw', mana: 40 },
        info: (n) => `Cào hai đường vuốt nước: 2 lần x1.5 sát thương +${(n * 0.5).toFixed(0)}` },
      { id: 'l_w', name: 'Vảy Rồng',
        info: (n) => `Giảm ${Math.round(Math.min(50, 15 + n * 0.4))}% sát thương nhận, +${(n * 0.1).toFixed(1)} hồi máu`,
        apply: (s, n) => { s.dr += Math.min(50, 15 + n * 0.4); s.regen += n * 0.1; } },
      { id: 'l_e', name: 'Gầm Biển', active: { cooldown: 10, cast: 'seawave', mana: 90 },
        info: (n) => `Sóng lớn quanh mình (tầm x1.2) đẩy lùi quái và gây x1.5 sát thương +${n}` },
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
    legend: 'epic', name: 'Thạch Sanh', attr: 'agi', attack: 'melee', wclass: 'blade', dmgType: 'phys',
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
        info: () => 'Tiếng đàn làm quái trong tầm đứng nghe nhạc: choáng 1.5 giây (boss 0.6 giây), cần từ 2 quái' },
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
        info: (n) => `+${Math.round(15 + n * 0.2)}% tốc bắn`,
        apply: (s, n) => { s.haste += 15 + n * 0.2; } },
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
        info: (n) => `Đá núi trồi lên hất tung quái: choáng 1 giây, x2 sát thương +${n}; bãi đá làm chậm 35% trong 3.5 giây` },
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
        info: (n) => `Sen nở trên tướng yếu nhất trong 200: hồi ${(6 + n * 0.06).toFixed(1)}% máu/giây trong 5 giây` },
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
      { id: 'b_q', name: 'Bánh Chưng', active: { cooldown: 10, cast: 'feast', mana: 50 },
        info: (n) => `Chia bánh cho tướng trong 170: hồi ${Math.round(12 + n * 0.15)}% máu, +20% sát thương trong 6 giây` },
      { id: 'b_w', name: 'Bánh Giầy',
        info: (n) => `Tướng đứng gần +${(2 + n * 0.08).toFixed(1)} hồi máu/giây`,
        apply: (s, n) => { s.regenAura = 2 + n * 0.08; } },
      { id: 'b_e', name: 'Ruộng Lúa', active: { cooldown: 10, cast: 'ricefield', mana: 80 },
        info: (n) => `Lúa mọc làm chậm 40% quái trong vùng 4 giây, ${(8 + n * 0.3).toFixed(0)} sát thương/giây` },
      { id: 'b_r', name: 'Lễ Tổ Tiên', active: { cooldown: 30, cast: 'ancestor', mana: 120 },
        info: () => 'Khi có tướng dưới 50% máu: toàn quân hồi đầy máu, bất tử 2 giây' },
    ],
  },
  // ---------------- 4 TƯỚNG THẦN MỚI (v27): đủ chuỗi Thường → Sử thi → Huyền thoại ----------------
  lachau: {
    legend: 'epic', name: 'Lạc Hầu', attr: 'str', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Giữ trận', title: 'Thủ lĩnh bộ Lạc, búa đá và khiên đồng', color: '#E25A3A',
    attrs: { str: 28, agi: 12, int: 15 }, gain: { str: 3.2, agi: 1.1, int: 1.5 },
    base: { damage: 11, range: 145, cooldown: 1.2 },
    look: { aura: '#D9A84E', bulk: 1.12, weapon: { type: 'cleaver', color: '#B8853A' } },
    trait: { name: 'Lệnh Lạc Hầu', desc: 'Tướng đứng kề nhận ít hơn 15% sát thương' },
    skills: [
      { id: 'h_q', name: 'Trống Hiệu Triệu', active: { cooldown: 12, cast: 'rally', mana: 50 },
        info: (n) => `Gõ trống trận: tướng trong 180 (cả mình) +${Math.round(25 + n * 0.15)}% tốc đánh trong 5 giây` },
      { id: 'h_w', name: 'Giáp Da Tê Gai',
        info: (n) => `Bị đánh thì phản ${Math.round(Math.min(80, 30 + n * 0.3))}% sát thương lại quái gần nhất · +${Math.min(40, Math.floor(n / 3))} sức mạnh`,
        apply: (s, n) => { s.thorns = Math.min(80, 30 + n * 0.3); s.str += Math.min(40, Math.floor(n / 3)); } },
      { id: 'h_e', name: 'Đá Lăn Phong Châu', active: { cooldown: 9, cast: 'boulder', mana: 70 },
        info: (n) => `Lăn tảng đá ngược dòng 300: đè mọi quái trên đường lăn x2 sát thương +${n}, đẩy lùi` },
      { id: 'h_r', name: 'Lời Thề Bộ Lạc', active: { cooldown: 24, cast: 'oath', mana: 110 },
        info: () => 'Toàn quân trên sân giảm 30% sát thương nhận và hồi 3% máu/giây trong 6 giây' },
    ],
  },
  thansan: {
    legend: 'epic', name: 'Thần Săn Ba Vì', attr: 'agi', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Săn mồi', title: 'Thợ săn được núi Ba Vì truyền phép, vuốt hổ dao lá', color: '#7FC24A',
    attrs: { str: 18, agi: 28, int: 13 }, gain: { str: 1.9, agi: 3.3, int: 1.3 },
    base: { damage: 6, range: 145, cooldown: 0.8 },
    look: { aura: '#5FB84A', weapon: { type: 'daggers', color: '#E8E0C0' } },
    trait: { name: 'Mắt Rừng', desc: 'Đánh quái đang bị làm chậm hoặc choáng: +25% sát thương' },
    skills: [
      { id: 's_q', name: 'Lao Tẩm Độc', active: { cooldown: 6, cast: 'venomspear', mana: 40 },
        info: (n) => `Phóng lao vào quái xa nhất (tầm x1.6): x1.5 sát thương +${n}, độc ${(6 + n * 0.25).toFixed(0)}/giây trong 6 giây, chậm 35%` },
      { id: 's_w', name: 'Nanh Hổ',
        info: (n) => `+${Math.round(10 + Math.min(20, n * 0.1))}% chí mạng, +${Math.min(40, Math.round(n * 0.3))}% tốc đánh`,
        apply: (s, n) => { s.crit += 10 + Math.min(20, n * 0.1); s.haste += Math.min(40, n * 0.3); } },
      { id: 's_e', name: 'Gọi Hổ Ba Vì', active: { cooldown: 9, cast: 'tiger', mana: 60 },
        info: (n) => `Hổ thần vồ 3 quái yếu máu nhất: x2 sát thương +${n}; quái thường dưới 20% máu chết ngay` },
      { id: 's_r', name: 'Cuộc Săn Lớn', active: { cooldown: 18, cast: 'greathunt', mana: 100 },
        info: () => 'Đánh dấu mọi quái trong tầm x2 trong 8 giây: nhận thêm 25% sát thương từ mọi tướng, hạ được +3 vàng' },
    ],
  },
  adv: {
    legend: 'legendary', name: 'An Dương Vương', attr: 'agi', attack: 'arrow', proj: 'bolt', wclass: 'bow', dmgType: 'phys',
    role: 'Nỏ thần', title: 'Vua Âu Lạc, thành Cổ Loa và nỏ Linh Quang', color: '#7FC24A',
    attrs: { str: 18, agi: 30, int: 16 }, gain: { str: 1.8, agi: 3.4, int: 1.6 },
    base: { damage: 10, range: 190, cooldown: 0.9 },
    look: { aura: '#FFD66B', weapon: { type: 'crossbow', color: '#E0B030' } },
    trait: { name: 'Nỏ Linh Quang', desc: 'Mỗi phát bắn thứ 4 xuyên cả hàng quái, x2 sát thương' },
    skills: [
      { id: 'v_q', name: 'Tên Đồng Nảy', active: { cooldown: 5, cast: 'ricochet', mana: 40 },
        info: (n) => `Mũi tên nảy qua 5 quái liên tiếp: x1.3 sát thương +${(n * 0.5).toFixed(0)}, mỗi lần nảy giảm 10%` },
      { id: 'v_w', name: 'Thành Ốc Cổ Loa',
        info: (n) => `Bắn ${Math.min(4, 2 + Math.floor(n / 50))} mũi tên · xuyên thêm ${Math.round(Math.min(40, 15 + n * 0.1))}% giáp · +20% sát thương lên quái bay`,
        apply: (s, n) => { s.arrows = Math.min(4, 2 + Math.floor(n / 50)); s.pierce += Math.min(40, 15 + n * 0.1); s.airPct += 20; } },
      { id: 'v_e', name: 'Lũy Nỏ Cổ Loa', active: { cooldown: 14, cast: 'volley', mana: 70 },
        info: () => 'Tướng đánh xa trong 220 (cả mình) bắn thêm 1 mũi tên mỗi lần trong 6 giây' },
      { id: 'v_r', name: 'Linh Quang Thần Nỏ', active: { cooldown: 14, cast: 'linhquang', mana: 110 },
        info: (n) => `Ba phát xuyên hàng hình quạt: mỗi phát x4 sát thương chuẩn +${(n * 1.5).toFixed(0)}` },
    ],
  },
  mau: {
    legend: 'legendary', name: 'Mẫu Thượng Ngàn', attr: 'int', attack: 'magic', proj: 'petal', wclass: 'staff', dmgType: 'magic',
    role: 'Mẹ rừng', title: 'Bà chúa núi rừng, cây lá nghe lời', color: '#A88CE8',
    attrs: { str: 17, agi: 14, int: 30 }, gain: { str: 1.7, agi: 1.4, int: 3.4 },
    base: { damage: 11, range: 165, cooldown: 1.25, slow: 15 },
    look: { aura: '#5FD06A', weapon: { type: 'staff', color: '#5A3A1A', orb: '#7FE07A', glow: '#5FD06A' } },
    trait: { name: 'Mẹ Rừng', desc: 'Tướng đứng gần +10% sát thương và +2 hồi máu/giây' },
    skills: [
      { id: 'm_q', name: 'Dây Rừng Trói', active: { cooldown: 7, cast: 'vines', mana: 45 },
        info: (n) => `Dây leo trói 4 quái đi đầu trong tầm 1.6 giây (boss 0.5), x1 sát thương +${(n * 0.5).toFixed(0)}` },
      { id: 'm_w', name: 'Rễ Ngàn Năm',
        info: (n) => `Làm chậm ${Math.round(Math.min(45, 20 + n * 0.2))}% · +${(n * 0.5).toFixed(1)} sát thương phép`,
        apply: (s, n) => { s.slow = Math.max(s.slow, Math.min(45, 20 + n * 0.2)); s.damage += n * 0.5; } },
      { id: 'm_e', name: 'Cây Đa Thần', active: { cooldown: 12, cast: 'sacredtree', mana: 80 },
        info: (n) => `Trồng cây đa 6 giây: quái quanh cây chậm 30%; tướng trong 170 hồi ${(3 + n * 0.03).toFixed(1)}% máu/giây` },
      { id: 'm_r', name: 'Rừng Thiêng Nổi Giận', active: { cooldown: 22, cast: 'forestwrath', mana: 120 },
        info: (n) => `Rễ cây trồi khắp bờ sông: mọi quái dưới đất bị trói 1.8 giây (boss 0.6), x2 sát thương +${n}; toàn quân hồi 20% máu` },
    ],
  },
};
const BASIC_HEROES = ['lactuong', 'lucsi', 'xathu', 'thosan', 'thaymo', 'thansuong'];
const LEGEND_HEROES = ['thachsanh', 'lachau', 'thansan', 'caolo', 'antiem', 'tiendung', 'langlieu', 'cdt',
  'giong', 'llq', 'kimquy', 'adv', 'auco', 'mau'];
for (const id of LEGEND_HEROES) HEROES[id].cost = COSTS.legend[HEROES[id].legend];

// HỢP THỂ (v34): hai tướng ★★★ đúng công thức kéo vào nhau → một thần mới.
// Thường + Thường → thần Sử thi (tím); thần tím Thần tinh ★★★ + thần tím → thần Huyền thoại (vàng).
// Thần mới giữ cấp, đồ, thuộc tính và nội tại của CẢ HAI bên (cây phả hệ h.lineage).
const FUSION = [
  // Thường → Sử thi
  { a: 'thaymo', b: 'thansuong', to: 'cdt', why: 'lửa gặp sương thành mây mưa sông Hồng' },
  { a: 'lactuong', b: 'lucsi', to: 'lachau', why: 'hai dũng sĩ hợp thành thủ lĩnh bộ Lạc' },
  { a: 'lactuong', b: 'thosan', to: 'thachsanh', why: 'rìu đồng + tay rừng thành chàng tiều phu' },
  { a: 'thosan', b: 'xathu', to: 'thansan', why: 'thợ săn + cung thủ thành thần săn Ba Vì' },
  { a: 'xathu', b: 'lucsi', to: 'caolo', why: 'tay nỏ + sức khỏe thành người chế nỏ thần' },
  { a: 'thosan', b: 'thaymo', to: 'antiem', why: 'đốt rẫy làm nương, đảo hoang thành vườn' },
  { a: 'thansuong', b: 'xathu', to: 'tiendung', why: 'sương mỏng + gió tên thành quạt tiên' },
  { a: 'lucsi', b: 'thaymo', to: 'langlieu', why: 'sức trai + lửa bếp nấu bánh chưng' },
  // Sử thi → Huyền thoại
  { a: 'thachsanh', b: 'lachau', to: 'giong', why: 'sức người cả làng hun đúc Thánh Gióng' },
  { a: 'thansan', b: 'cdt', to: 'llq', why: 'núi rừng gặp sông biển: Lạc Long Quân' },
  { a: 'lachau', b: 'caolo', to: 'kimquy', why: 'giữ thành + nỏ thần: Thần Kim Quy' },
  { a: 'caolo', b: 'antiem', to: 'adv', why: 'nỏ thần + đất trù phú dựng nước Âu Lạc' },
  { a: 'tiendung', b: 'langlieu', to: 'auco', why: 'tiên nữ + lễ vật đất trời: Mẹ Âu Cơ' },
  { a: 'thansan', b: 'langlieu', to: 'mau', why: 'rừng thiêng + lúa nương: Mẫu Thượng Ngàn' },
];
// tương thích: ASCEND[x] = các thần x có thể hợp thành; ascendSources(t) = các tướng ghép ra t
const ASCEND = {};
for (const f of FUSION) for (const x of [f.a, f.b]) (ASCEND[x] = ASCEND[x] || []).push(f.to);
const ASCEND_FROM = {};
for (const f of FUSION) if (!ASCEND_FROM[f.to]) ASCEND_FROM[f.to] = f.a;
const ascendSources = (t) => { const f = FUSION.find((x) => x.to === t); return f ? [f.a, f.b] : []; };
const fusionFor = (a, b) => FUSION.find((f) => (f.a === a && f.b === b) || (f.a === b && f.b === a)) || null;
const fusionPartner = (x, to) => { const f = FUSION.find((y) => y.to === to && (y.a === x || y.b === x)); return f ? (f.a === x ? f.b : f.a) : null; };
// TRIỆU HỒI NGẪU NHIÊN: giá tăng theo số lần đã gọi trong ải
Object.assign(COSTS, { summon: (n) => Math.min(220, 60 + 6 * n) });
// sức mạnh theo sao ghép của tướng Thường (★ / ★★ / ★★★): sát thương ×, máu và kỹ năng tăng ít hơn
const MERGE_MULT = [1, 1, 1.8, 3.2];
// thêm cho tướng thần (đã gồm ★★★ của các tướng Thường đã ghép): hợp thể 2 thần tím ra vàng
const FUSE_MULT = { epic: 1.3, legendary: 2.0 };
// cân bằng riêng từng thần (vì mỗi cặp ghép gộp nội tại khác nhau): đo bằng sim/cmp4.js
const FUSE_ADJ = { cdt: 1.069, lachau: 0.96, thachsanh: 0.45, thansan: 0.516, caolo: 0.969, antiem: 0.692, tiendung: 1.068, langlieu: 1.54, giong: 0.904, llq: 0.755, kimquy: 1.371, adv: 0.599, auco: 1.398, mau: 0.416 };
// lên vàng cần thần tím Thần tinh ★★★ (đủ sao rồi mới hóa thân), giá cao hơn bậc sao cuối
Object.assign(COSTS, { ascend: { epic: 300, legendary: 1200 }, ascendTier: 3, ascendTier2: 3 });
// Thần lực: hệ số sát thương và máu của tướng đã thăng thần (kỹ năng +một nửa mức này)
const ASCEND_POWER = { epic: 1.15, legendary: 1.6 };
// Thần tinh của tướng thần Huyền thoại mạnh hơn Sử thi (nhân chỉ số mỗi bậc sao)
const ASC_EVO_MULT = { epic: 1, legendary: 1.5 };
// Sau Thăng thần, bộ kỹ năng mới học lại bằng VÀNG: mở khóa W/E/R đắt hơn, nâng cấp trả vàng
Object.assign(COSTS, {
  unlockAsc: [0, 150, 300, 500],
  skillGold: (i, lv) => (i === 3 ? 300 : 120) * lv,     // nâng từ cấp lv lên lv+1
  statPt: 2,                                          // 1 điểm kỹ năng thừa = +2 thuộc tính chính
});
// CỬA HÀNG (v24): 6 món đồ trang phục / phụ kiện ngẫu nhiên, làm mới miễn phí mỗi đợt,
// làm mới tay tốn vàng (tăng dần trong đợt). Độ hiếm tốt dần theo đợt.
// v66: Ngân khố — thưởng sau trận, tiêu trước trận
const PREP = {
  winBase: 120, winPerLevel: 25, winPerStar: 40, losePerWave: 4, minShow: 1,
  goldCost: 150, goldAmount: 150, jarCost: 250, kingCost: 700, livesCost: 200, livesAmount: 5,
  heroCost: { epic: 900, legendary: 2000 },
};
const SHOP = {
  slots: 6,
  reroll: (n) => 20 + 10 * n,
  price: { common: 70, rare: 170, epic: 400, legendary: 900 },
  // trọng số độ hiếm theo đợt [Thường, Hiếm, Sử thi, Huyền thoại]
  weights: (w) => [Math.max(10, 60 - w * 2.5), 30 + Math.min(10, w), Math.min(35, 4 + w * 1.4), Math.min(18, Math.max(0, w - 8) * 0.9)],
  accChance: 0.3,       // tỉ lệ một ô là phụ kiện nguyên liệu (giá gốc)
};
// HŨ BÁU: 3 loại, hũ to chắc chắn ra đồ xịn hơn. Mở đủ 5 hũ bất kỳ thì hũ kế chắc chắn Sử thi trở lên.
const JARS = [
  { id: 'small', name: 'Hũ báu', cost: 90, min: 'common', desc: 'Đồ ngẫu nhiên, mọi độ hiếm' },
  { id: 'big', name: 'Hũ đồng', cost: 240, min: 'rare', desc: 'Chắc chắn Hiếm trở lên' },
  { id: 'king', name: 'Hũ Vua Hùng', cost: 600, min: 'epic', set: 0.35, desc: 'Sử thi trở lên, 35% ra đồ bộ' },
];
const JAR_PITY = 5;
const unlockCost = (h, i) => (h.from ? COSTS.unlockAsc[i] : COSTS.unlock[i]);

// TIẾN HOÁ: chỉ số mỗi bậc sao (cộng dồn sẵn, không cộng từng bậc).
// Tướng thăng thần giữ ★★★ của tướng gốc rồi tiến hoá tiếp 3 bậc Thần tinh (đắt hơn, mạnh hơn).
const EVO_BONUS = {
  base: [{}, { dmg: 15, hp: 10 }, { dmg: 30, hp: 20, haste: 10 }, { dmg: 50, hp: 35, haste: 20, skill: 10 }],
  asc:  [{}, { dmg: 20, hp: 15, skill: 10 }, { dmg: 45, hp: 30, haste: 10, skill: 20 }, { dmg: 80, hp: 50, haste: 20, skill: 35 }],
};
// Thần tinh: thần Sử thi (tím) và Huyền thoại (vàng) có mốc cấp và giá riêng, nối tiếp nhau
// Thường ★ cấp 5/10/15 → tím Thần tinh cấp 16/18/20 → vàng Thần tinh cấp 21/23/25
Object.assign(COSTS, {
  evoAsc: { epic: [300, 600, 1000], legendary: [1500, 2200, 3200] },
  evoReqAsc: { epic: [16, 18, 20], legendary: [21, 23, 25] },
});
const ascRank = (h) => HEROES[h.type].legend || 'epic';
const evoCost = (h, t) => (h.from ? COSTS.evoAsc[ascRank(h)][t] : COSTS.evo[t]);
const evoReq = (h, t) => (h.from ? COSTS.evoReqAsc[ascRank(h)][t] : COSTS.evoReq[t]);
// dòng mô tả một bậc sao
function evoText(b) {
  const out = [];
  if (b.dmg) out.push(`+${b.dmg}% sát thương`);
  if (b.hp) out.push(`+${b.hp}% máu`);
  if (b.haste) out.push(`+${b.haste}% tốc đánh`);
  if (b.skill) out.push(`+${b.skill}% kỹ năng`);
  return out.join(' · ');
}

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
                stats: { damage: 12, haste: -10, pierce: 8 }, look: { type: 'axe', color: '#9E9A90' } },
  riu_lua:    { name: 'Rìu Lửa', slot: 'weapon', wclass: 'blade', rarity: 'epic',
                stats: { damage: 14, crit: 10, pierce: 10 }, look: { type: 'axe', color: '#e67e22', glow: '#ff6b00' } },
  long_riu:   { name: 'Long Rìu', slot: 'weapon', wclass: 'blade', rarity: 'legendary', set: 'laclong',
                stats: { damage: 24, crit: 10, pierce: 20 }, look: { type: 'greataxe', color: '#2ecc71', glow: '#00ff88' } },
  // --- Nỏ
  no_tre:     { name: 'Nỏ Tre', slot: 'weapon', wclass: 'bow', rarity: 'common',
                stats: { damage: 3, range: 15 }, look: { type: 'crossbow', color: '#C8A040' } },
  no_lim:     { name: 'Nỏ Gỗ Lim', slot: 'weapon', wclass: 'bow', rarity: 'rare',
                stats: { damage: 6, range: 35 }, look: { type: 'crossbow', color: '#6A3A1A' } },
  no_bao:     { name: 'Nỏ Bão', slot: 'weapon', wclass: 'bow', rarity: 'epic',
                stats: { damage: 9, haste: 20, pierce: 10 }, look: { type: 'crossbow', color: '#3498db', glow: '#74b9ff' } },
  long_no:    { name: 'Long Nỏ', slot: 'weapon', wclass: 'bow', rarity: 'legendary', set: 'laclong',
                stats: { damage: 15, haste: 20, range: 30, pierce: 20 }, look: { type: 'crossbow', color: '#2ecc71', glow: '#00ff88' } },
  // --- Gậy
  gay_mo:     { name: 'Gậy Thầy Mo', slot: 'weapon', wclass: 'staff', rarity: 'common',
                stats: { damage: 5 }, look: { type: 'staff', color: '#8d6e63', orb: '#9EDDF2' } },
  gay_ngoc:   { name: 'Gậy Ngọc', slot: 'weapon', wclass: 'staff', rarity: 'rare',
                stats: { damage: 10, range: 20, mpen: 8 }, look: { type: 'staff', color: '#b0bec5', orb: '#00cec9', glow: '#81ecec' } },
  truong_hu_khong: { name: 'Trượng Hư Không', slot: 'weapon', wclass: 'staff', rarity: 'epic',
                stats: { damage: 18, crit: 8, mpen: 15 }, look: { type: 'staff', color: '#2d3436', orb: '#a29bfe', glow: '#6c5ce7' } },
  long_truong:{ name: 'Long Trượng', slot: 'weapon', wclass: 'staff', rarity: 'legendary', set: 'laclong',
                stats: { damage: 28, mpen: 25 }, look: { type: 'staff', color: '#145a32', orb: '#2ecc71', glow: '#00ff88' } },
  // --- Mũ
  mu_long_chim: { name: 'Mũ Lông Chim', slot: 'helmet', rarity: 'common',
                stats: { range: 5, agi: 2 }, look: { type: 'feather', color: '#B8402A' } },
  mu_dong:    { name: 'Mũ Đồng', slot: 'helmet', rarity: 'rare',
                stats: { str: 5, hp: 60 }, look: { type: 'helm', color: '#B8853A', plume: '#c0392b' } },
  mu_sung:    { name: 'Mũ Sừng', slot: 'helmet', rarity: 'epic',
                stats: { damage: 6, crit: 8, pierce: 8 }, look: { type: 'horned', color: '#5A4632' } },
  non_mo:     { name: 'Nón Thầy Mo', slot: 'helmet', rarity: 'rare',
                stats: { int: 6, cdr: 8, mpen: 8 }, look: { type: 'wizard', color: '#6c3fa0' } },
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
  khan_hien_gia: { name: 'Khăn Hiền Giả', slot: 'acc', rarity: 'common', price: 130, stats: { int: 8, cdr: 5, mpen: 8 },
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
                stats: { int: 16, cdr: 20, range: 30, mpen: 12 }, look: { aura: '#4a90e2' } },
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

// ------------------------------------------------------------
//  ĐỒ MỚI (v15): 4 phụ kiện, 8 đồ ghép, 4 bộ đồ (Sơn Tinh, Chim Lạc,
//  Trống Đồng, Ngựa Sắt). fx: hiệu ứng đặc biệt cộng vào chỉ số tướng.
// ------------------------------------------------------------
Object.assign(ITEMS, {
  sung_te:    { name: 'Sừng Tê', slot: 'acc', rarity: 'common', price: 120, stats: { damage: 6, pierce: 8 },
                desc: 'Nguyên liệu: Mũi Sừng Phá Giáp, Rìu Quét Sông' },
  long_chim_lac: { name: 'Lông Chim Lạc', slot: 'acc', rarity: 'common', price: 110, stats: { range: 15, agi: 4 },
                desc: 'Nguyên liệu: Cung Mắt Chim, Bùa Chim Lạc' },
  vay_ca:     { name: 'Vảy Cá', slot: 'acc', rarity: 'common', price: 110, stats: { hp: 100, dr: 4 },
                desc: 'Nguyên liệu: Áo Vảy Cá, Ngọc Trấn Thủy, Lưới Đánh Cá' },
  hat_lua:    { name: 'Hạt Lúa', slot: 'acc', rarity: 'common', price: 100, stats: { hp: 60, regen: 1 },
                desc: 'Nguyên liệu: Bồ Lúa Thần' },

  mui_sung:   { name: 'Mũi Sừng Phá Giáp', slot: 'acc', rarity: 'epic', counter: 'rua',
                recipe: { parts: ['sung_te', 'vuot_ho'], cost: 150 }, stats: { damage: 18, pierce: 15 }, fx: { shred: 5 },
                desc: 'Đòn đánh giảm 5 giáp mục tiêu (cộng dồn 3 lần)', look: { aura: '#C8BFA8' } },
  riu_quet:   { name: 'Rìu Quét Sông', slot: 'acc', rarity: 'epic', counter: 'tom',
                recipe: { parts: ['sung_te', 'gang_da'], cost: 150 }, stats: { damage: 10, haste: 10 }, fx: { spread: 35 },
                desc: 'Đòn đánh lan 35% sát thương ra quái xung quanh', look: { aura: '#5AB4D6' } },
  cung_mat_chim: { name: 'Cung Mắt Chim', slot: 'acc', rarity: 'epic', counter: 'chimbao',
                recipe: { parts: ['long_chim_lac', 'mat_ngoc'], cost: 150 }, stats: { range: 35 }, fx: { airPct: 50 },
                desc: '+50% sát thương lên quái bay', look: { aura: '#F2E6C8' } },
  bua_chim_lac: { name: 'Bùa Chim Lạc', slot: 'acc', rarity: 'epic', counter: 'chimbao',
                recipe: { parts: ['long_chim_lac', 'khan'], cost: 150 }, stats: { int: 6 }, fx: { hitAir: 1 },
                desc: 'Tướng cận chiến đánh được quái bay', look: { aura: '#FFE08A' } },
  ao_vay_ca:  { name: 'Áo Vảy Cá', slot: 'acc', rarity: 'epic', counter: 'phuthuy',
                recipe: { parts: ['vay_ca', 'ngoc_sinh_luc'], cost: 150 }, stats: { hp: 250 }, fx: { magicRes: 35 },
                desc: 'Giảm 35% sát thương phép nhận vào (Phù Thủy Nước, mưa của Thủy Tinh)', look: { aura: '#5AB4D6' } },
  ngoc_tran_thuy: { name: 'Ngọc Trấn Thủy', slot: 'acc', rarity: 'epic', counter: 'phuthuy',
                recipe: { parts: ['vay_ca', 'mat_ngoc'], cost: 150 }, stats: { range: 20, int: 6, mpen: 15 }, fx: { noHeal: 3 },
                desc: 'Quái bị đánh không được hồi máu trong 3 giây', look: { aura: '#2F6FB0' } },
  luoi_ca:    { name: 'Lưới Đánh Cá', slot: 'acc', rarity: 'epic', counter: 'casau',
                recipe: { parts: ['vay_ca', 'dep_co'], cost: 150 }, stats: { agi: 8 }, fx: { netSlow: 20 },
                desc: 'Đòn đánh làm chậm 20% trong 1 giây', look: { aura: '#8C7A5A' } },
  bo_lua:     { name: 'Bồ Lúa Thần', slot: 'acc', rarity: 'epic',
                recipe: { parts: ['hat_lua', 'dai'], cost: 150 }, stats: { str: 6, hp: 100, goldOnKill: 3 },
                desc: '+3 vàng mỗi quái hạ', look: { aura: '#E8D070' } },
});

// Bộ đồ v15: 3 món (vũ khí theo loại tướng, mũ, giáp), cùng hành. Rơi từ quái
// tinh anh và boss ở độ hiếm Sử thi, thăng phẩm lên Huyền thoại được.
const SET_ITEMS = {
  sontinh: { el: 'tho', color: '#8C7A5A', glow: '#C99A3C', names: ['Rìu Đá Tản Viên', 'Nỏ Đá Núi', 'Gậy Đá Núi', 'Mũ Đá Núi', 'Giáp Đá Núi'],
    helmet: { str: 8, hp: 120 }, armor: { hp: 220, dr: 5 } },
  chimlac: { el: 'kim', color: '#F2E6C8', glow: '#FFF1C4', names: ['Rìu Chim Lạc', 'Nỏ Chim Lạc', 'Gậy Chim Lạc', 'Mũ Lông Lạc', 'Áo Lông Lạc'],
    helmet: { agi: 8, range: 10 }, armor: { agi: 6, haste: 10 } },
  drum:    { el: 'kim', color: '#C8943A', glow: '#F2D27A', names: ['Rìu Mặt Trống', 'Nỏ Mặt Trống', 'Gậy Dùi Trống', 'Mũ Trống Đồng', 'Giáp Trống Đồng'],
    helmet: { int: 8, cdr: 5 }, armor: { int: 6, hp: 150 } },
  nguasat: { el: 'hoa', color: '#3A3030', glow: '#E0452C', names: ['Rìu Ngựa Sắt', 'Nỏ Ngựa Sắt', 'Gậy Ngựa Sắt', 'Mũ Bờm Lửa', 'Giáp Sắt Đen'],
    helmet: { str: 5, damage: 6 }, armor: { damage: 8, hp: 120 } },
};
for (const [set, d] of Object.entries(SET_ITEMS)) {
  const base = { rarity: 'epic', set };
  ITEMS[set + '_riu'] = { ...base, name: d.names[0], slot: 'weapon', wclass: 'blade', stats: { damage: 16, crit: 5, pierce: 12 }, look: { type: 'axe', color: d.color, glow: d.glow } };
  ITEMS[set + '_no'] = { ...base, name: d.names[1], slot: 'weapon', wclass: 'bow', stats: { damage: 10, haste: 10, range: 15, pierce: 10 }, look: { type: 'crossbow', color: d.color, glow: d.glow } };
  ITEMS[set + '_gay'] = { ...base, name: d.names[2], slot: 'weapon', wclass: 'staff', stats: { damage: 18, mpen: 12 }, look: { type: 'staff', color: d.color, orb: d.glow, glow: d.glow } };
  ITEMS[set + '_mu'] = { ...base, name: d.names[3], slot: 'helmet', stats: d.helmet, look: { type: 'helm', color: d.color } };
  ITEMS[set + '_giap'] = { ...base, name: d.names[4], slot: 'armor', stats: d.armor, look: { type: 'plate', color: d.color } };
}

// Bộ đồ: mặc 2 / 3 món cùng bộ. apply(s, n, k): n = số món, k = 1.5 khi
// đủ bộ cùng hành với tướng ("Thiên mệnh": hiệu ứng 3 món mạnh thêm 50%).
const SETS = {
  laclong: {
    name: 'Bộ Lạc Long', el: 'thuy', pieces: 3, fit: 'mọi tướng', color: '#2ecc71',
    ids: { blade: 'long_riu', bow: 'long_no', staff: 'long_truong', helmet: 'mu_lac_long', armor: 'giap_vay_rong' },
    p2: '+10% sát thương', p3: '+30% sát thương, mọc cánh rồng', look3: 'Cánh rồng xanh ngọc',
    desc: '+30% sát thương, mọc cánh rồng: dòng dõi Lạc Long Quân',
    apply: (s, n, k) => { if (n >= 2) s.bonusDmgPct += 10; if (n >= 3) s.bonusDmgPct += 30 * k - 10; },
    look: { wings: '#1e8449', aura: '#2ecc71' },
  },
  sontinh: {
    name: 'Bộ Sơn Tinh', el: 'tho', pieces: 3, fit: 'tướng chặn đường', color: '#C99A3C',
    p2: '+15% máu', p3: '−15% sát thương nhận, quái chạm vào bị chậm 20%', look3: 'Khối núi đá lơ lửng sau lưng',
    apply: (s, n, k) => { if (n >= 2) s.hpPct += 15; if (n >= 3) { s.dr += 15 * k; s.touchSlow = 20 * k; } },
  },
  chimlac: {
    name: 'Bộ Chim Lạc', el: 'kim', pieces: 3, fit: 'tướng đánh xa', color: '#F2E6C8',
    p2: '+10% tầm', p3: '+40% sát thương lên quái bay, tên bay vòng cung', look3: 'Cánh lông chim Lạc trắng vàng',
    apply: (s, n, k) => { if (n >= 2) s.rangePct += 10; if (n >= 3) { s.airMult += 0.4 * k; s.curve = 1; } },
  },
  drum: {
    name: 'Bộ Trống Đồng', el: 'kim', pieces: 3, fit: 'tướng phép, hỗ trợ', color: '#F2D27A',
    p2: '+10% sức mạnh kỹ năng', p3: 'Hào quang +10% sát thương cho tướng trong 2 ô', look3: 'Mặt trống đồng xoay sau lưng',
    apply: (s, n, k) => { if (n >= 2) s.skillPct += 10; if (n >= 3) s.drumAura = 10 * k; },
  },
  nguasat: {
    name: 'Bộ Ngựa Sắt', el: 'hoa', pieces: 3, fit: 'tướng cận chiến', color: '#E0452C',
    p2: '+10% tốc đánh', p3: 'Đòn đánh để lại vệt lửa trên sông 2 giây', look3: 'Bờm lửa, giáp sắt đen ánh đỏ',
    apply: (s, n, k) => { if (n >= 2) s.haste += 10; if (n >= 3) s.fireTrail = 0.25 * k; },
  },
};
for (const [set, d] of Object.entries(SET_ITEMS)) {
  SETS[set].ids = { blade: set + '_riu', bow: set + '_no', staff: set + '_gay', helmet: set + '_mu', armor: set + '_giap' };
  SETS[set].glow = d.glow;
}
const SET_ORDER = ['laclong', 'sontinh', 'chimlac', 'drum', 'nguasat'];

// ------------------------------------------------------------
//  NGŨ HÀNH (v15). Hành không thay hệ Sức mạnh / Nhanh nhẹn / Trí tuệ mà
//  chồng lên: hệ quyết định chỉ số, hành quyết định khắc chế và đội hình.
// ------------------------------------------------------------
const ELEMENTS = {
  kim:  { name: 'Kim',  color: '#D9DDE0' },
  moc:  { name: 'Mộc',  color: '#5FB84A' },
  thuy: { name: 'Thủy', color: '#2F6FB0' },
  hoa:  { name: 'Hỏa',  color: '#E0452C' },
  tho:  { name: 'Thổ',  color: '#C99A3C' },
};
const EL_ORDER = ['kim', 'moc', 'thuy', 'hoa', 'tho'];
const EL_KHAC = { kim: 'moc', moc: 'tho', tho: 'thuy', thuy: 'hoa', hoa: 'kim' };   // a khắc EL_KHAC[a]
const EL_SINH = { kim: 'thuy', thuy: 'moc', moc: 'hoa', hoa: 'tho', tho: 'kim' };   // a sinh EL_SINH[a]
const ELEM = {
  khac: 30,        // đánh quái thuộc hành mình khắc: +30% sát thương
  biKhac: -20,     // đánh quái thuộc hành khắc mình: −20%
  sinh: 10,        // đứng kề tướng thuộc hành sinh ra mình: +10%, tối đa 2 lần
  sinhMax: 2,
  full: 10,        // đủ 5 hành trên sân: toàn quân +10%
  adj: 115,        // "đứng kề": khoảng cách giữa hai ô (px logic)
  item: { same: 10, sinh: 5, khac: -10 },    // hành đồ so với hành tướng: % chỉ số gốc
};
const HERO_EL = { lactuong: 'kim', lucsi: 'tho', xathu: 'kim', thosan: 'moc', thaymo: 'hoa', thansuong: 'thuy',
  giong: 'hoa', llq: 'thuy', kimquy: 'kim', thachsanh: 'moc', caolo: 'kim', antiem: 'moc',
  auco: 'tho', cdt: 'thuy', tiendung: 'hoa', langlieu: 'tho', lachau: 'tho', thansan: 'moc', adv: 'kim', mau: 'moc' };
for (const id in HERO_EL) HEROES[id].el = HERO_EL[id];
// hành "rủi ro" của đồ so với tướng: 'same' | 'sinh' | 'khac' | null
function itemRelation(itemEl, heroEl) {
  if (!itemEl || !heroEl) return null;
  if (itemEl === heroEl) return 'same';
  if (EL_SINH[itemEl] === heroEl) return 'sinh';
  if (EL_KHAC[itemEl] === heroEl) return 'khac';
  return null;
}

// Dòng phụ ngẫu nhiên của đồ rơi / đồ trong Hũ báu (đồ mua ở cửa hàng không có)
const AFFIXES = {
  haste: { val: 8,  label: (v) => `+${v}% tốc đánh` },
  boss:  { val: 15, label: (v) => `+${v}% sát thương lên boss` },
  air:   { val: 20, label: (v) => `+${v}% sát thương lên quái bay` },
  cdr:   { val: 8,  label: (v) => `−${v}% hồi chiêu` },
  gold:  { val: 2,  label: (v) => `+${v} vàng mỗi quái hạ` },
  flood: { val: 6, label: (v) => `+${v}% sát thương` },
  range: { val: 10, label: (v) => `+${v}% tầm đánh` },
  crit:  { val: 5,  label: (v) => `+${v}% chí mạng` },
  pen:   { val: 10, label: (v) => `+${v}% xuyên giáp` },
  mpen:  { val: 10, label: (v) => `+${v}% xuyên kháng phép` },
};
const AFFIX_COUNT = { common: 0, rare: 1, epic: 1, legendary: 2 };
Object.assign(COSTS, {
  reroll: (n) => Math.min(400, 50 * Math.pow(2, n)),   // Tẩy luyện: 50, 100, 200, 400…
  temper: (n) => 300 + 100 * n,                         // Tôi luyện đồ Huyền thoại +5
  train: (n) => 200 + 50 * n,                           // Luyện thể tướng cấp 25
});

// ------------------------------------------------------------
//  HIỆU ỨNG ẨN: hiện "???" kèm gợi ý cho tới lần kích hoạt đầu tiên,
//  sau đó luôn hiển thị và ghi vào Bách khoa (tab Bí truyền).
// ------------------------------------------------------------
const SECRETS = {
  // tướng
  'h.lactuong':  { hero: 'lactuong', hint: 'Rìu cần người gánh núi', desc: 'Đứng kề Lực Sĩ Núi: Khiên Đồng choáng thêm 0,5 giây' },
  'h.lucsi':     { hero: 'lucsi', hint: 'Hai người khỏe gánh được núi', desc: 'Đứng kề Lạc Tướng: Vùi Đá chôn 2 quái' },
  'h.xathu':     { hero: 'xathu', hint: 'Mắt quen trời', desc: 'Mỗi 10 quái bay bị hạ: +1% tầm, tối đa +10% trong trận' },
  'h.thosan':    { hero: 'thosan', hint: 'Thú săn được nuôi thợ săn', desc: 'Săn Mồi hạ gục mục tiêu: hồi ngay 50% năng lượng' },
  'h.thaymo':    { hero: 'thaymo', hint: 'Lửa thử vàng', desc: 'Lửa đốt quái hành Kim kéo dài gấp đôi' },
  'h.thansuong': { hero: 'thansuong', hint: 'Băng vỡ, sương lan', desc: 'Quái chết khi đang đóng băng: vỡ băng, làm chậm quái xung quanh 1,5 giây' },
  'h.giong':     { hero: 'giong', hint: 'Giặc đến nhà', desc: 'Khi thành còn ≤ 5 mạng: Vươn Vai lập tức đạt tối đa' },
  'h.llq':       { hero: 'llq', hint: 'Năm mươi lên núi, năm mươi xuống biển', desc: 'Âu Cơ cùng trên sân: Bọc Trăm Trứng nở thêm 50% Lạc Tử. Nhưng nếu hai người đứng kề nhau, cả hai −10% sát thương' },
  'h.kimquy':    { hero: 'kimquy', hint: 'Rùa vàng giữ thành', desc: 'Thành còn 1 mạng: Kim Quy Hộ Thành tự kích hoạt một lần, kể cả đang hồi chiêu' },
  'h.thachsanh': { hero: 'thachsanh', hint: 'Niêu cơm ăn mãi không hết', desc: 'Đứng gần tướng vừa gục: tướng đó hồi sinh nhanh hơn 50%' },
  'h.caolo':     { hero: 'caolo', hint: 'Móng rùa thần', desc: 'Thần Kim Quy cùng trên sân: Nỏ Thần gây sát thương x2' },
  'h.antiem':    { hero: 'antiem', hint: 'Đảo hoang thành vườn', desc: 'Sau đợt 20: mỗi đợt 10% rơi "dưa vàng" +100 vàng' },
  'h.auco':      { hero: 'auco', hint: 'Mẹ ở trên núi', desc: 'Có từ 2 tướng đứng kề: Hoa Tiên hồi máu cho thêm 1 tướng ở xa' },
  'h.cdt':       { hero: 'cdt', hint: 'Người đánh cá quen sông', desc: 'Gậy Thần hồi cho tướng dưới 25% máu: hồi gấp đôi' },
  'h.tiendung':  { hero: 'tiendung', hint: 'Bãi Tự Nhiên', desc: 'Mưa Hoa Tiên hồi máu gấp đôi cho Chử Đồng Tử' },
  'h.lachau':    { hero: 'lachau', hint: 'Đông người thì vững', desc: 'Có từ 2 tướng đứng kề: Lệnh Lạc Hầu giảm 25% sát thương thay vì 15%' },
  'h.thansan':   { hero: 'thansan', hint: 'Chim sa cá lặn', desc: 'Hạ quái bay: +30% tốc đánh trong 3 giây' },
  'h.adv':       { hero: 'adv', hint: 'Rùa vàng trao móng', desc: 'Thần Kim Quy cùng trên sân: phát Nỏ Linh Quang gây x3 thay vì x2' },
  'h.mau':       { hero: 'mau', hint: 'Cây cùng cội', desc: 'Đứng kề tướng hành Mộc: hào quang Mẹ Rừng gấp đôi' },
  'h.langlieu':  { hero: 'langlieu', hint: 'Đất trời chứng giám', desc: 'Đợt có Thủy Tinh: Lễ Tổ Tiên giảm 50% hồi chiêu' },
  // đồ trang phục Sử thi / Huyền thoại, rút theo hành của món
  'i.kim1':  { el: 'kim', hint: 'Lưỡi đồng tìm chỗ hở', desc: 'Đánh quái dưới 30% máu: bỏ qua thêm 30% giáp' },
  'i.kim2':  { el: 'kim', hint: 'Gõ mãi đá cũng mòn', desc: 'Mỗi đòn thứ 5 liên tiếp vào cùng một quái: gây thêm 50% sát thương' },
  'i.moc1':  { el: 'moc', hint: 'Cây hút nhựa từ đất', desc: 'Hạ quái: hồi 3% máu tối đa' },
  'i.moc2':  { el: 'moc', hint: 'Rễ càng sâu, cây càng vững', desc: 'Đứng yên 10 giây không đổi chỗ: +15% sát thương cho tới khi bị dời' },
  'i.thuy1': { el: 'thuy', hint: 'Cá gặp nước', desc: 'Đứng kề tướng hành Thủy: +10% sát thương' },
  'i.thuy2': { el: 'thuy', hint: 'Nước chảy về chỗ trũng', desc: 'Khi tướng đứng kề gục: hồi 20% máu cho mọi tướng kề còn lại' },
  'i.hoa1':  { el: 'hoa', hint: 'Lửa bén rơm', desc: 'Đòn chí mạng làm cháy mục tiêu 2 giây' },
  'i.hoa2':  { el: 'hoa', hint: 'Lửa thử vàng', desc: 'Khi máu dưới 50%: +20% tốc đánh' },
  'i.tho1':  { el: 'tho', hint: 'Đất lành chim đậu', desc: 'Khi máu dưới 30%: giảm 30% sát thương nhận vào trong 4 giây (hồi 20 giây)' },
  'i.tho2':  { el: 'tho', hint: 'Núi che chở', desc: 'Đứng yên 10 giây: tướng đứng kề giảm 10% sát thương nhận vào' },
  // đồ ghép: hiệu ứng ẩn cố định
  'r.song_riu':      { item: 'song_riu', hint: 'Máu càng nóng, tay càng nhanh', desc: 'Hạ quái: +5% tốc đánh 3 giây, cộng dồn 5 lần' },
  'r.gay_tam_gioi':  { item: 'gay_tam_gioi', hint: 'Ba cõi hợp một', desc: 'Có đủ 3 hệ tướng trên sân: +5 mọi thuộc tính nữa' },
  'r.gay_thoi_khong':{ item: 'gay_thoi_khong', hint: 'Thời gian đứng lại', desc: '10% dùng chiêu không tốn năng lượng' },
  'r.giap_bat_diet': { item: 'giap_bat_diet', hint: 'Đồng không gãy', desc: 'Gục lần đầu mỗi đợt: hồi sinh ngay với 30% máu' },
  'r.luoi_hai':      { item: 'luoi_hai', hint: 'Hái kẻ mạnh trước', desc: 'Chí mạng lên quái tinh anh: x3' },
  'r.trong_dong':    { item: 'trong_dong', hint: 'Trống trận đầu đợt', desc: 'Đầu mỗi đợt: gõ trống, mọi tướng +20% tốc đánh 5 giây' },
  'r.mui_sung':      { item: 'mui_sung', hint: 'Mai cứng cũng vỡ', desc: 'Rùa Giáp bị phá hết giáp: rùa bị choáng 1 giây' },
  'r.riu_quet':      { item: 'riu_quet', hint: 'Một nhát cả bầy', desc: 'Hạ 5 Tôm Binh một lúc: +10 vàng' },
  'r.cung_mat_chim': { item: 'cung_mat_chim', hint: 'Mắt chim nhìn xa', desc: 'Đợt bay: +20% tốc bắn' },
  'r.bua_chim_lac':  { item: 'bua_chim_lac', hint: 'Chim sa cánh', desc: 'Quái bay bị đánh rơi xuống đất 1 giây' },
  'r.ao_vay_ca':     { item: 'ao_vay_ca', hint: 'Vảy cá gặp nước', desc: 'Khi máu dưới 50%: hồi 2% máu mỗi giây' },
  'r.ngoc_tran_thuy':{ item: 'ngoc_tran_thuy', hint: 'Trấn thầy phù thủy', desc: 'Hạ Phù Thủy Nước: quái quanh nó mất 10% máu' },
  'r.luoi_ca':       { item: 'luoi_ca', hint: 'Cá sấu mắc lưới', desc: 'Cá Sấu hóa điên bị lưới giữ chân 1 giây' },
  'r.bo_lua':        { item: 'bo_lua', hint: 'Được mùa', desc: 'Sau đợt 20: mỗi đợt 10% ra "bồ lúa vàng" +100 vàng' },
  // đồ bộ: hiệu ứng ẩn khi đủ bộ
  's.laclong': { set: 'laclong', hint: 'Rồng gặp nước', desc: 'Đòn đánh có 10% phóng sét lan 3 quái' },
  's.sontinh': { set: 'sontinh', hint: 'Núi không đổ', desc: 'Mỗi đợt có 1 lần chặn hoàn toàn đòn đánh gây chết' },
  's.chimlac': { set: 'chimlac', hint: 'Chim Lạc săn bão', desc: 'Hạ Chim Bão: 20% gọi 1 chim Lạc mổ quái gần nhất' },
  's.drum':    { set: 'drum', hint: 'Trống giục quân', desc: 'Khi tướng trong hào quang dùng R: hào quang tăng gấp đôi trong 5 giây' },
  's.nguasat': { set: 'nguasat', hint: 'Ngựa sắt hí vang', desc: 'Hạ 3 quái trong 2 giây: phun lửa thẳng hàng một lần' },
  // quái & boss
  'e.haba':     { enemy: 'haba', hint: 'Vảy hóa đồng', desc: 'Hà Bá bị hạ lần đầu, trồi lên đổi sang hành Kim: dùng tướng Hỏa để khắc' },
  'e.giaolong': { enemy: 'giaolong', hint: 'Vảy năm màu', desc: 'Mỗi Giao Long Con mang 1 hành ngẫu nhiên, nhìn màu vảy để biết' },
  'e.elite':    { enemy: 'rua', hint: 'Mai hai lớp', desc: 'Rùa Giáp khổng lồ có 30% mang thêm một hành phụ: chịu khắc từ cả hai hành' },
};
const SECRET_KEYS = Object.keys(SECRETS);

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
            tempFlood: { count: 3, time: 8 }, tags: ['Hô mưa gọi gió', 'Gọi Giao Long'],
            short: 'Hô mưa gọi gió gây sát thương tướng đứng gần; mỗi lần mất 25% máu gọi 4 Giao Long Con và làm ngập tạm 3 ô trong 8 giây',
            desc: 'Thần nước nổi giận. Hô mưa gọi gió gây sát thương tướng đứng gần. Mỗi lần mất 25% máu gọi 4 Giao Long Con (kháng phép cao) và làm ngập tạm 3 ô trong 8 giây.',
            tip: 'Đặt tướng vật lý chặn Giao Long Con: chúng kháng phép rất cao.' },
};
const BOSS_ORDER = ['thuongluong', 'haba', 'thuytinh'];
// hành của quân Thủy Tinh (Giao Long Con: hành ngẫu nhiên lúc xuất hiện)
const ENEMY_EL = { tom: 'thuy', casau: 'kim', rua: 'tho', phuthuy: 'thuy', chimbao: 'moc', echme: 'thuy', nongnoc: 'thuy',
  giaolong: null, thuongluong: 'thuy', haba: 'thuy', thuytinh: 'thuy' };
for (const id in ENEMY_EL) ENEMIES[id].el = ENEMY_EL[id];

// Quái tinh anh (từ đợt 6): máu x1.8, thưởng nhiều hơn, thêm một đặc tính
const ELITE_MODS = {
  armored: { name: 'Vỏ Cứng', color: '#C8BFA8', desc: '+10 giáp' },
  regen:   { name: 'Nước Thánh', color: '#3EDC4E', desc: 'Hồi 3% máu mỗi giây' },
  swift:   { name: 'Sóng Cuốn', color: '#9EDDF2', desc: 'Chạy nhanh hơn 40%' },
  shield:  { name: 'Màng Nước', color: '#5AB4D6', desc: 'Khiên chặn sát thương bằng 40% máu' },
};

const waveHpMult = (n) => Math.pow(1.16, n - 1);
// v54: đợt "hiệu dụng" — ải dài hơn thì quái mạnh lên chậm hơn (đợt cuối vẫn mạnh như bản cũ)
const effWave = (n, level) => { const lv = LEVELS[level || 0]; const sc = (lv && lv.waveScale) || 1; return 1 + (n - 1) * sc; };

// Lịch đợt mặc định: boss ở đợt 10/20/30, đợt bay 7/13/17/24/27,
// Rùa Giáp khổng lồ ở 5/15/25. Nước dâng sau đợt boss 10 và 20.
const AIR_WAVES = [7, 13, 17, 24, 27];
const CHAMPION_WAVES = [5, 15, 25];

// Chiến dịch dọc sông Đà (tên ải là đề xuất)
// Chế độ Khó (v42): máu quái nhân thêm theo từng ải
const HARD = {
  // hệ số máu quái theo ải (đã chạy bot cân bằng: người chơi mặc đồ tốt về đích còn ~10–15 mạng)
  table: [1.6, 1.7, 1.8, 1.75, 1.6, 1.45, 1.4, 1.35],
  hp(level) { return this.table[Math.min(level, this.table.length - 1)]; },
};
// ============================================================
//  BẢN ĐỒ (v48): mỗi ải một đường đi riêng (đường cong SVG, toạ độ thiết kế 932×430,
//  chỉ dùng M / C / S) + chủ đề nền. end = vị trí thành / cổng cuối đường.
//  theme: song (sông), rung (đường rừng), hang (hang núi), dong (đồng lúa), bien (bờ biển), thanh (Cổ Loa)
// ============================================================
const MAPS = {
  song1: { theme: 'song', d: 'M -20 210 C 100 210 150 120 280 128 S 450 240 580 214 S 740 140 880 160', end: [899, 156] },
  song2: { theme: 'song', d: 'M -20 150 C 120 150 160 290 300 290 S 470 150 600 160 S 760 290 880 250', end: [899, 246] },
  song3: { theme: 'song', d: 'M -20 280 C 90 280 120 140 240 140 S 360 300 470 300 S 580 140 700 150 S 840 230 880 220', end: [899, 216] },
  song4: { theme: 'dam', d: 'M -20 190 C 140 100 260 300 400 220 S 560 120 660 230 S 800 300 880 200', end: [899, 196] },
  rung1: { theme: 'rung', d: 'M -20 130 C 160 130 180 300 340 300 S 520 120 660 150 S 800 300 880 260', end: [899, 256] },
  rung2: { theme: 'rung', d: 'M -20 300 C 140 300 120 150 260 140 S 420 270 520 270 S 640 130 760 150 S 860 230 880 230', end: [899, 226] },
  hang1: { theme: 'hang', d: 'M -20 250 C 80 250 100 140 200 140 S 300 300 400 300 S 500 140 600 140 S 700 300 800 290 S 870 200 880 200', end: [899, 196] },
  dong1: { theme: 'dong', d: 'M -20 310 C 140 310 160 310 220 300 C 270 290 260 150 320 140 C 420 130 520 140 580 150 C 640 160 620 290 690 300 C 760 310 820 300 880 290', end: [899, 286] },
  dong2: { theme: 'dong', d: 'M -20 160 C 120 160 200 160 250 200 S 280 300 380 300 S 520 300 560 240 S 600 150 700 150 S 840 170 880 170', end: [899, 166] },
  bien1: { theme: 'bien', d: 'M 60 60 C 80 160 200 180 320 190 S 520 260 600 300 S 780 320 880 280', end: [899, 276] },
  bien2: { theme: 'bien', d: 'M -20 120 C 160 100 260 200 360 280 S 560 330 640 260 S 760 130 880 150', end: [899, 146] },
  song5: { theme: 'song', d: 'M -20 300 C 140 300 120 150 260 140 S 420 270 520 270 S 640 130 760 150 S 860 230 880 230', end: [899, 226] },
  cuasong: { theme: 'bien', d: 'M -20 150 C 120 130 220 220 330 260 S 520 300 600 250 S 720 150 880 170', end: [899, 166] },
  thanh1: { theme: 'thanh', d: 'M -20 200 C 100 80 400 66 580 100 S 790 250 640 320 S 300 340 250 240 S 380 150 470 205', end: [470, 205], center: true },
};
const MAP_THEMES = {
  song: { ground: '#3A5A28', grass: '#4E7434', dot: '#2C4620', water: true, bank: '#8A7650', deco: ['tree', 'tree', 'rock', 'reed', 'hut'], gate: 'castle' },
  dam:  { ground: '#3E5530', grass: '#56703A', dot: '#2E3E22', water: true, bank: '#6E6040', deco: ['reed', 'reed', 'lotus', 'tree', 'rock'], gate: 'castle' },
  rung: { ground: '#2E4A22', grass: '#3E6A2E', dot: '#203818', water: false, road: '#7A6040', roadEdge: '#4E3C26', deco: ['tree', 'tree', 'tree', 'bush', 'rock'], gate: 'hut' },
  hang: { ground: '#4A4236', grass: '#5A5040', dot: '#2E2820', water: false, road: '#2A2420', roadEdge: '#1A1612', deco: ['rock', 'rock', 'crystal', 'bones', 'stalag'], gate: 'cave' },
  dong: { ground: '#5E7A30', grass: '#7A9A3E', dot: '#4A6224', water: false, road: '#A08A5A', roadEdge: '#6E5E3C', deco: ['rice', 'rice', 'rice', 'buffalo', 'tree'], gate: 'village' },
  bien: { ground: '#D8C890', grass: '#E8DCA8', dot: '#B8A870', water: true, sea: true, bank: '#C8B47A', deco: ['palm', 'shell', 'rock', 'boat', 'palm'], gate: 'castle' },
  thanh:{ ground: '#4A5A2E', grass: '#5E7038', dot: '#36441E', water: true, bank: '#7E6A48', deco: ['tree', 'rock', 'hut', 'banner'], gate: 'citadel' },
};

const LEVELS = [
  { name: 'Bến Sông Đà', map: 'song1', waves: 10, hp: 0.75, bosses: { 10: 'thuongluong' },
    desc: 'Bến sông yên bình nơi Thủy Tinh thử quân lần đầu. Mười đợt để làm quen.', hint: ['xathu', 'lactuong', 'thaymo'] },
  { name: 'Thác Bờ', map: 'song2', waves: 20, hp: 0.85, bosses: { 10: 'thuongluong', 20: 'haba' },
    desc: 'Thác nước đổ mạnh, quân Thủy Tinh xuôi dòng nhanh hơn.', hint: ['thansuong', 'xathu', 'lucsi'] },
  { name: 'Rừng Lim', map: 'song3', waves: 30, hp: 1, bosses: { 10: 'thuongluong', 20: 'haba', 30: 'haba' },
    desc: 'Rừng lim cổ thụ phủ kín hai bờ. Đường quái dài, uốn quanh tán lá rậm.', hint: ['xathu', 'thaymo', 'lucsi'] },
  { name: 'Bãi Phù Sa', map: 'song4', waves: 30, hp: 1.08, bosses: { 10: 'thuongluong', 20: 'haba', 30: 'thuytinh' },
    desc: 'Bãi phù sa màu mỡ, Núi Tản Viên mọc nhanh hơn ở đây.', hint: ['lactuong', 'thaymo', 'thansuong'] },
  { name: 'Chân Núi Tản', map: 'song5', waves: 30, hp: 1.16, bosses: { 10: 'thuongluong', 20: 'haba', 30: 'thuytinh' },
    desc: 'Dưới chân núi Tản, Sơn Tinh đứng ra chặn nước.', hint: ['thosan', 'xathu', 'thaymo'] },
  { name: 'Đầm Lầy', map: 'song4', waves: 30, hp: 1.24, water: 1, bosses: { 10: 'thuongluong', 20: 'haba', 30: 'thuytinh' },
    desc: 'Đầm lầy: quái máu dày hơn.', hint: ['lactuong', 'xathu', 'thansuong'] },
  { name: 'Cửa Sông Hồng', map: 'cuasong', waves: 30, hp: 1.32, bosses: { 10: 'haba', 20: 'thuytinh', 30: 'thuytinh' },
    desc: 'Nơi sông Đà đổ về sông Hồng, nước dâng dữ nhất.', hint: ['thansuong', 'thaymo', 'xathu'] },
  { name: 'Thành Phong Châu', map: 'song1', waves: 30, hp: 1.4, bosses: { 10: 'thuongluong', 20: 'haba', 30: 'thuytinh' },
    desc: 'Trận cuối giữ kinh đô Văn Lang. Thủy Tinh đích thân dâng nước.', hint: ['lactuong', 'lucsi', 'thaymo'] },
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
  : AIR_WAVES.includes(n) || (n > 27 && (n % 10 === 4 || n % 10 === 7)) ? 'air' : n % 10 === 5 ? 'champion' : 'normal');

function buildWave(n, level) {
  const list = [];
  const e = effWave(n, level);
  const count = 8 + Math.floor(e * 1.6);
  const kind = waveKind(n, level);
  // v48: quân theo chương (ROSTERS trong enemies2.js); mặc định quân Thủy Tinh
  const ro = (typeof ROSTERS !== 'undefined' && ROSTERS[(LEVELS[level || 0] || {}).roster || 'thuy']) || null;
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let type = ro ? ro.base : 'tom';
    if (kind === 'air' && ro && ro.air && r < 0.55) type = ro.air;
    else if (ro) { for (const [from, p, t] of ro.list) if (e >= from && r < p) { type = t; break; } }
    const elite = e >= 6 && Math.random() < 0.08 + e * 0.006
      ? Object.keys(ELITE_MODS)[Math.floor(Math.random() * 4)] : null;
    const fast = ro ? ro.fast.includes(type) : false;
    list.push({ type, elite, gap: fast ? 0.45 : 0.8 });
  }
  if (kind === 'champion') list.push({ type: ro ? ro.champ : 'rua', elite: 'armored', champion: true, gap: 2 });
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
