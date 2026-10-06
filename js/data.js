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
  agi: { name: 'Nhanh nhẹn', short: 'TỐC', color: '#7FC24A', desc: '+tốc đánh' },
  int: { name: 'Trí tuệ',    short: 'TRÍ', color: '#A88CE8', desc: '+sức mạnh kỹ năng, -hồi chiêu, +năng lượng' },
};

// v92: tướng không chia Sức/Tốc/Trí nữa — bản sắc theo NGŨ HÀNH.
// Ba thuộc tính (sức mạnh / nhanh nhẹn / trí tuệ) vẫn là chỉ số thân thể; sát thương cộng theo thuộc tính cao nhất của tướng.
const heroMain = (def) => (def._main ||= Object.keys(ATTRS).reduce((a, b) => (def.attrs[b] > def.attrs[a] ? b : a)));
// hệ của mỗi hành: cộng sẵn cho mọi tướng thuộc hành đó
// v93: mỗi hành còn có hiệu ứng trạng thái riêng khi đánh thường (el: thiêu đốt, đóng băng, làm chậm, choáng, chặn, hồi máu, câm lặng)
const ELEM_TRAIT = {
  kim:  { name: 'Sắc bén',   fx: 'Câm lặng', desc: '+10% xuyên giáp, +5% chí mạng · 12% câm lặng quái 2 giây (không dùng được kỹ năng)',
    apply: (s) => { s.pierce += 10; s.crit += 5; s.el.silence = 12; } },
  moc:  { name: 'Sinh sôi',  fx: 'Hồi máu', desc: '+8% máu, +1 hồi máu / giây · 20% mỗi đòn hồi 2% máu cho mình và tướng kề',
    apply: (s) => { s.hpPct += 8; s.regen += 1; s.el.heal = 20; } },
  thuy: { name: 'Nhu thủy',  fx: 'Làm chậm · Đóng băng', desc: '+15% hồi năng lượng, −5% hồi chiêu · đòn đánh làm chậm 15%, 8% đóng băng 1 giây',
    apply: (s) => { s.elMana += 15; s.cdr += 5; s.el.slow = 15; s.el.freeze = 8; } },
  hoa:  { name: 'Bùng cháy', fx: 'Thiêu đốt', desc: '+8% sát thương · 25% thiêu đốt 3 giây (30% sát thương mỗi giây)',
    apply: (s) => { s.bonusDmgPct += 8; s.el.burn = 25; } },
  tho:  { name: 'Vững chãi', fx: 'Choáng · Chặn', desc: '+10% máu, −5% sát thương nhận · 8% choáng 0,6 giây, 15% chặn hẳn đòn đánh vào mình',
    apply: (s) => { s.hpPct += 10; s.dr += 5; s.el.stun = 8; s.el.block = 15; } },
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
    name: 'Lạc Tướng', cost: 70, attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Chém lan', title: 'Tướng giữ làng, rìu đồng chém lan', color: '#E25A3A',
    attrs: { str: 24, agi: 14, int: 12 }, gain: { str: 2.8, agi: 1.4, int: 1.2 },
    base: { damage: 6, range: 145, cooldown: 1.0 },
    look: { aura: '#e74c3c', weapon: { type: 'axe', color: '#D9A84E' } },
    skills: [
      { id: 'bash', name: 'Bổ Rìu Đồng', active: { cooldown: 6, cast: 'bash', mana: 45 },
        info: (n) => `Bổ rìu đồng xuống làm choáng quái 1 giây, x2 sát thương +${(n * 0.6).toFixed(0)}` },
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
    name: 'Lực Sĩ Núi', cost: 80, attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Trâu bò', title: 'Người gánh núi, kéo quái về bằng dây mây', color: '#E25A3A',
    attrs: { str: 25, agi: 11, int: 14 }, gain: { str: 3.0, agi: 1.0, int: 1.5 },
    base: { damage: 10, range: 140, cooldown: 1.25 },
    look: { aura: '#8bc34a', bulk: 1.12, weapon: { type: 'cleaver', color: '#9E9A90' } },
    skills: [
      { id: 'hook', name: 'Ném Đá Tảng', active: { cooldown: 7, cast: 'hook', mana: 50 },
        info: (n) => `Ném tảng đá trúng quái đi xa nhất, hất nó lùi lại, gây ${40 + Math.round(n * 1.5)} sát thương` },
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
    name: 'Xạ Thủ Văn Lang', cost: 55, attack: 'arrow', proj: 'arrow', wclass: 'bow', dmgType: 'phys',
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
    name: 'Thợ Săn Rừng', cost: 75, attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Chí mạng', title: 'Dao găm lá rừng, đòn chí mạng', color: '#7FC24A',
    attrs: { str: 16, agi: 24, int: 12 }, gain: { str: 1.8, agi: 3.0, int: 1.2 },
    base: { damage: 2, range: 140, cooldown: 0.85 },
    look: { aura: '#9b59b6', weapon: { type: 'daggers', color: '#dfe6e9' } },
    skills: [
      { id: 'shadowstep', name: 'Bước Lá Rừng', active: { cooldown: 6, cast: 'shadowstep', mana: 45 },
        info: (n) => `Lướt tới quái xa nhất trong tầm gấp đôi, đâm giáo: x2 sát thương +${(n * 0.5).toFixed(0)}` },
      { id: 'hiddenblade', name: 'Giáo Ẩn',
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
    name: 'Thầy Mo Lửa', cost: 85, attack: 'magic', proj: 'fireball', wclass: 'staff', dmgType: 'magic',
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
    name: 'Thần Sương Núi', cost: 80, attack: 'frost', proj: 'frostbolt', wclass: 'staff', dmgType: 'magic',
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
    legend: 'legendary', name: 'Thánh Gióng', mount: 'ngua_sat', attack: 'melee', wclass: 'blade', dmgType: 'phys',
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
    legend: 'legendary', name: 'Lạc Long Quân', attack: 'melee', wclass: 'blade', dmgType: 'phys',
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
    legend: 'legendary', name: 'Thần Kim Quy', attack: 'melee', wclass: 'blade', dmgType: 'phys',
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
    legend: 'epic', name: 'Thạch Sanh', attack: 'melee', wclass: 'blade', dmgType: 'phys',
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
    legend: 'epic', name: 'Cao Lỗ', attack: 'arrow', proj: 'bolt', wclass: 'bow', dmgType: 'phys',
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
    legend: 'epic', name: 'Mai An Tiêm', attack: 'arrow', proj: 'melon', wclass: 'bow', dmgType: 'phys',
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
    legend: 'legendary', name: 'Âu Cơ', attack: 'magic', proj: 'feather', wclass: 'staff', dmgType: 'magic',
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
    legend: 'epic', name: 'Chử Đồng Tử', attack: 'magic', proj: 'orb', wclass: 'staff', dmgType: 'magic',
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
    legend: 'epic', name: 'Tiên Dung', attack: 'magic', proj: 'petal', wclass: 'staff', dmgType: 'magic',
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
    legend: 'epic', name: 'Lang Liêu', attack: 'magic', proj: 'rice', wclass: 'staff', dmgType: 'magic',
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
  // ================= v101: ĐỢT HÀNH KIM + MỘC — đủ 60 tướng (mỗi hành 4 Thường / 4 Tím / 4 Vàng) =================
  giaodong: {
    name: 'Dũng Sĩ Giáo Đồng', cost: 70, attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Xuyên giáp', title: 'Giáo đồng Đông Sơn, đâm xuyên giáp giặc', color: '#D9DDE0',
    attrs: { str: 22, agi: 16, int: 12 }, gain: { str: 2.4, agi: 1.8, int: 1.2 },
    base: { damage: 7, range: 145, cooldown: 1.0 },
    look: { aura: '#E8E8F0', weapon: { type: 'staff', color: '#B8853A' } },
    skills: [
      { id: 'gd_q', name: 'Đâm Xuyên', active: { cooldown: 7, cast: 'bash', mana: 45 },
        info: (n) => `Đâm mạnh: choáng mục tiêu, x2 sát thương +${(n * 0.6).toFixed(0)}` },
      { id: 'gd_w', name: 'Mũi Giáo Đồng',
        info: (n) => `+${(8 + n * 0.2).toFixed(1)}% xuyên giáp`, apply: (s, n) => { s.pierce += 8 + n * 0.2; } },
      { id: 'gd_e', name: 'Thế Giáo',
        info: (n) => `+${(3 + n * 0.08).toFixed(1)}% chí mạng`, apply: (s, n) => { s.crit += 3 + n * 0.08; } },
      { id: 'gd_r', name: 'Giáo Xoáy', active: { cooldown: 14, cast: 'chop', mana: 100 },
        info: (n) => `Xoáy giáo một nhát: x3 sát thương +${n}` },
    ],
  },
  chuongdong: {
    name: 'Thầy Chuông Đồng', cost: 75, attack: 'magic', proj: 'orb', wclass: 'staff', dmgType: 'magic',
    role: 'Trấn yểm', title: 'Rung chuông đồng trấn yểm tà ma', color: '#D9DDE0',
    attrs: { str: 14, agi: 13, int: 23 }, gain: { str: 1.4, agi: 1.3, int: 2.9 },
    base: { damage: 5, range: 165, cooldown: 1.3 },
    look: { aura: '#F2E6B0', weapon: { type: 'staff', color: '#8a6a3a', orb: '#E0B030' } },
    skills: [
      { id: 'cg_q', name: 'Chuông Trấn Yểm', active: { cooldown: 14, cast: 'tigerroar', mana: 60 },
        info: () => 'Rung chuông: quái quanh mình choáng 1 giây, câm lặng 3 giây' },
      { id: 'cg_w', name: 'Tiếng Chuông Ngân',
        info: (n) => `+${(8 + n * 0.2).toFixed(1)}% xuyên kháng phép`, apply: (s, n) => { s.mpen += 8 + n * 0.2; } },
      { id: 'cg_e', name: 'Bùa Đồng',
        info: (n) => `+${(6 + n * 0.15).toFixed(1)}% sức mạnh kỹ năng`, apply: (s, n) => { s.skillPct += 6 + n * 0.15; } },
      { id: 'cg_r', name: 'Hồi Chuông Thiêng', active: { cooldown: 18, cast: 'lute', mana: 100 },
        info: () => 'Hồi chuông làm quái quanh mình đứng sững 1,5 giây (boss 0,6 giây)' },
    ],
  },
  nghedong: {
    legend: 'epic', name: 'Nghê Đồng', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Linh thú', title: 'Linh thú bằng đồng canh cửa đình làng', color: '#D9DDE0',
    attrs: { str: 27, agi: 14, int: 14 }, gain: { str: 2.9, agi: 1.4, int: 1.4 },
    base: { damage: 11, range: 145, cooldown: 1.2 },
    look: { aura: '#F2D27A', bulk: 1.1, weapon: { type: 'none' } },
    trait: { name: 'Linh Thú Giữ Đền', desc: '−10% sát thương nhận, phản 20% sát thương' },
    traitApply: (s) => { s.dr += 10; s.thorns += 20; },
    skills: [
      { id: 'ng2_q', name: 'Nghê Vồ', active: { cooldown: 6, cast: 'tiger', mana: 50 },
        info: (n) => `Lao vào 3 quái yếu nhất, x2 sát thương +${n}` },
      { id: 'ng2_w', name: 'Khiên Đồng', active: { cooldown: 14, cast: 'goldshell', mana: 70 },
        info: (n) => `Khiên ${Math.round(20 + n * 0.25)}% máu cho tướng quanh mình` },
      { id: 'ng2_e', name: 'Móng Đồng',
        info: (n) => `Đánh lan ${Math.round(30 + n * 0.4)}% sát thương`, apply: (s, n) => { s.cleave += 0.3 + n * 0.004; } },
      { id: 'ng2_r', name: 'Gầm Rung Đình', active: { cooldown: 18, cast: 'drumquake', mana: 120 },
        info: (n) => `Tiếng gầm rung chuông đình: choáng quái quanh mình 1,5 giây, x3 sát thương +${n * 2}` },
    ],
  },
  mychau: {
    legend: 'epic', name: 'Mỵ Châu', attack: 'magic', proj: 'feather', wclass: 'staff', dmgType: 'magic',
    role: 'Đánh dấu', title: 'Công chúa Âu Lạc, áo lông ngỗng rắc đường', color: '#D9DDE0',
    attrs: { str: 14, agi: 17, int: 26 }, gain: { str: 1.4, agi: 1.7, int: 3.0 },
    base: { damage: 9, range: 170, cooldown: 1.15 },
    look: { aura: '#F7F3FC', weapon: { type: 'none' } },
    trait: { name: 'Áo Lông Ngỗng', desc: 'Đòn đánh rắc lông ngỗng: quái trúng nhận thêm 25% sát thương từ mọi tướng 2 giây' },
    traitApply: (s) => { s.markHit = 2; },
    skills: [
      { id: 'mc_q', name: 'Lông Ngỗng Bay', active: { cooldown: 10, cast: 'birds', mana: 60 },
        info: (n) => `Lông ngỗng hóa đàn chim lao xuống quái, x2 sát thương +${n}` },
      { id: 'mc_w', name: 'Áo Lông Trắng',
        info: (n) => `+${(5 + n * 0.15).toFixed(1)}% sức mạnh kỹ năng, +3% chí mạng`, apply: (s, n) => { s.skillPct += 5 + n * 0.15; s.crit += 3; } },
      { id: 'mc_e', name: 'Giếng Ngọc', active: { cooldown: 12, cast: 'lotus', mana: 60 },
        info: (n) => `Nước giếng ngọc hồi dần ${Math.round(30 + n * 0.3)}% máu cho tướng yếu nhất` },
      { id: 'mc_r', name: 'Nỏ Thần Lẫy Rùa', active: { cooldown: 18, cast: 'turtlearrow', mana: 120 },
        info: (n) => `Bắn mũi nỏ thần vào quái giáp dày nhất: x5 sát thương +${n * 2}` },
    ],
  },
  kylan: {
    legend: 'legendary', name: 'Kỳ Lân Vàng', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Điềm lành', title: 'Linh thú điềm lành, xuất hiện khi đất nước thái bình', color: '#D9DDE0',
    attrs: { str: 30, agi: 18, int: 16 }, gain: { str: 3.3, agi: 1.9, int: 1.6 },
    base: { damage: 14, range: 150, cooldown: 1.0 },
    look: { aura: '#FFE08A', bulk: 1.12, weapon: { type: 'none' } },
    trait: { name: 'Điềm Lành', desc: 'Toàn quân +15% xuyên giáp; bản thân +20% máu' },
    traitApply: (s) => { s.hpPct += 20; },
    skills: [
      { id: 'kl_q', name: 'Sừng Kỳ Lân', active: { cooldown: 6, cast: 'claw', mana: 50 },
        info: (n) => `Húc sừng: x2.5 sát thương +${n}` },
      { id: 'kl_w', name: 'Vảy Vàng',
        info: (n) => `+${(10 + n * 0.2).toFixed(1)}% máu, −3% sát thương nhận`, apply: (s, n) => { s.hpPct += 10 + n * 0.2; s.dr += 3; } },
      { id: 'kl_e', name: 'Điềm Lành Giáng', active: { cooldown: 14, cast: 'rally', mana: 70 },
        info: (n) => `Tướng xung quanh +${Math.round(25 + n * 0.15)}% tốc đánh 5 giây` },
      { id: 'kl_r', name: 'Kỳ Lân Phun Lửa', active: { cooldown: 20, cast: 'dragonbeam', mana: 130 },
        info: (n) => `Phun lửa vàng một dải: x5 sát thương +${n * 2}` },
    ],
  },
  thienloi: {
    legend: 'legendary', name: 'Thiên Lôi', attack: 'magic', proj: 'orb', wclass: 'staff', dmgType: 'magic',
    role: 'Sấm sét', title: 'Thần sấm cầm lưỡi tầm sét, chỉ đâu đánh đấy', color: '#D9DDE0',
    attrs: { str: 18, agi: 14, int: 30 }, gain: { str: 1.8, agi: 1.4, int: 3.4 },
    base: { damage: 12, range: 175, cooldown: 1.2, splash: 30 },
    look: { aura: '#BFD8FF', weapon: { type: 'staff', color: '#8A8070', orb: '#BFD8FF', glow: '#7FA8F0' } },
    trait: { name: 'Búa Tầm Sét', desc: '20% mỗi đòn: sét lan 3 quái' },
    traitApply: (s) => { s.lg.chainHit = Math.max(s.lg.chainHit || 0, 20); },
    skills: [
      { id: 'tl2_q', name: 'Sấm Sét', active: { cooldown: 7, cast: 'nova', mana: 55 },
        info: (n) => `Sét nổ giữa bầy quái: x2.5 sát thương +${n}` },
      { id: 'tl2_w', name: 'Lưỡi Tầm Sét',
        info: (n) => `+${(n * 0.5).toFixed(1)} sát thương phép · vùng nổ ${Math.round(Math.min(100, 40 + n * 0.4))}`,
        apply: (s, n) => { s.damage += n * 0.5; s.splash = Math.min(100, 40 + n * 0.4); } },
      { id: 'tl2_e', name: 'Búa Thiên Lôi', active: { cooldown: 12, cast: 'judgement', mana: 80 },
        info: (n) => `Giáng búa sấm lên quái nhiều máu nhất: x4 sát thương +${n * 2}` },
      { id: 'tl2_r', name: 'Thiên Lôi Giáng Thế', active: { cooldown: 22, cast: 'meteor', mana: 130 },
        info: (n) => `Sét trời giáng xuống: x5 sát thương +${n * 2} vùng lớn` },
    ],
  },
  tre: {
    name: 'Dũng Sĩ Tre Làng', cost: 65, attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Đánh nhanh', title: 'Lũy tre làng, gậy tre đánh giặc', color: '#5FB84A',
    attrs: { str: 20, agi: 18, int: 12 }, gain: { str: 2.2, agi: 2.0, int: 1.2 },
    base: { damage: 6, range: 145, cooldown: 0.9 },
    look: { aura: '#7FC24A', weapon: { type: 'staff', color: '#D4DC70' } },
    skills: [
      { id: 'tr_q', name: 'Gậy Tre Đập', active: { cooldown: 7, cast: 'bash', mana: 45 },
        info: (n) => `Đập gậy tre: choáng mục tiêu, x2 sát thương +${(n * 0.6).toFixed(0)}` },
      { id: 'tr_w', name: 'Tre Ngà',
        info: (n) => `+${(8 + n * 0.15).toFixed(1)}% tốc đánh`, apply: (s, n) => { s.haste += 8 + n * 0.15; } },
      { id: 'tr_e', name: 'Lũy Tre Xanh',
        info: (n) => `+5% máu, +${(1 + n * 0.05).toFixed(1)} hồi máu/giây`, apply: (s, n) => { s.hpPct += 5; s.regen += 1 + n * 0.05; } },
      { id: 'tr_r', name: 'Quét Tre', active: { cooldown: 14, cast: 'bamboo', mana: 100 },
        info: (n) => `Quét bụi tre quanh mình: đánh mọi quái trong tầm, x2 sát thương +${n}` },
    ],
  },
  ongthoi: {
    name: 'Thợ Săn Ống Thổi', cost: 70, attack: 'arrow', proj: 'arrow', wclass: 'bow', dmgType: 'phys',
    role: 'Kim độc', title: 'Ống thổi kim độc của thợ săn núi rừng', color: '#5FB84A',
    attrs: { str: 14, agi: 22, int: 13 }, gain: { str: 1.4, agi: 2.7, int: 1.3 },
    base: { damage: 5, range: 175, cooldown: 0.95 },
    look: { aura: '#5FD06A', weapon: { type: 'crossbow', color: '#5A7A2A' } },
    skills: [
      { id: 'ot2_q', name: 'Kim Độc', active: { cooldown: 8, cast: 'venomspear', mana: 50 },
        info: (n) => `Thổi kim độc vào quái đi xa nhất: x2 sát thương +${n}, độc` },
      { id: 'ot2_w', name: 'Nhựa Độc',
        info: (n) => `+${(n * 0.3).toFixed(1)} sát thương · quái trúng không được hồi máu 3 giây`, apply: (s, n) => { s.damage += n * 0.3; s.noHeal = 3; } },
      { id: 'ot2_e', name: 'Mắt Rừng',
        info: (n) => `+${(4 + n * 0.1).toFixed(1)}% chí mạng`, apply: (s, n) => { s.crit += 4 + n * 0.1; } },
      { id: 'ot2_r', name: 'Mưa Kim Độc', active: { cooldown: 16, cast: 'arrowrain', mana: 100 },
        info: (n) => `Mưa kim độc xuống vùng quái đông: x2 sát thương +${n}` },
    ],
  },
  sodua: {
    legend: 'epic', name: 'Sọ Dừa', attack: 'magic', proj: 'melon', wclass: 'staff', dmgType: 'magic',
    role: 'Ẩn thân', title: 'Chàng trai ẩn trong vỏ dừa, tài giỏi thổi sáo', color: '#5FB84A',
    attrs: { str: 15, agi: 15, int: 26 }, gain: { str: 1.5, agi: 1.5, int: 3.0 },
    base: { damage: 8, range: 165, cooldown: 1.25, splash: 30 },
    look: { aura: '#7FC24A', weapon: { type: 'none' } },
    trait: { name: 'Vỏ Dừa Thần', desc: '−10% sát thương nhận; tướng đứng gần +2 hồi máu/giây' },
    traitApply: (s) => { s.dr += 10; s.regenAura = Math.max(s.regenAura || 0, 2); },
    skills: [
      { id: 'sd_q', name: 'Quả Dừa Nổ', active: { cooldown: 7, cast: 'melon', mana: 50 },
        info: (n) => `Ném quả dừa nổ vùng: x2 sát thương +${n}` },
      { id: 'sd_w', name: 'Tiếng Sáo Chăn Dê',
        info: (n) => `+${(6 + n * 0.15).toFixed(1)}% sức mạnh kỹ năng`, apply: (s, n) => { s.skillPct += 6 + n * 0.15; } },
      { id: 'sd_e', name: 'Hóa Chàng Trai', active: { cooldown: 18, cast: 'flowerheal', mana: 90 },
        info: (n) => `Hồi ${Math.round(25 + n * 0.3)}% máu cho mọi tướng quanh mình` },
      { id: 'sd_r', name: 'Mưa Dừa', active: { cooldown: 20, cast: 'melonrain', mana: 120 },
        info: (n) => `Dừa rơi khắp trận, x2 sát thương +${n}` },
    ],
  },
  cuoi: {
    legend: 'legendary', name: 'Chú Cuội', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Cây đa thần', title: 'Chú Cuội ôm cây đa thần bay lên cung trăng', color: '#5FB84A',
    attrs: { str: 30, agi: 18, int: 15 }, gain: { str: 3.3, agi: 1.9, int: 1.5 },
    base: { damage: 14, range: 150, cooldown: 1.0 },
    look: { aura: '#7FE07A', weapon: { type: 'axe', color: '#9E9A90' } },
    trait: { name: 'Lá Đa Cải Tử', desc: 'Mỗi 5 giây hồi 4% máu tướng quanh mình; gục lần đầu mỗi đợt sống lại với 30% máu' },
    traitApply: (s) => { s.lg.healAura = Math.max(s.lg.healAura || 0, 4); s.lg.reviveOnce = Math.max(s.lg.reviveOnce || 0, 30); },
    skills: [
      { id: 'cu_q', name: 'Rìu Đốn Củi', active: { cooldown: 7, cast: 'chop', mana: 55 },
        info: (n) => `Bổ rìu một nhát: x3 sát thương +${n}` },
      { id: 'cu_w', name: 'Lá Đa Thần',
        info: (n) => `+10% máu, +${(1.5 + n * 0.05).toFixed(1)} hồi máu/giây`, apply: (s, n) => { s.hpPct += 10; s.regen += 1.5 + n * 0.05; } },
      { id: 'cu_e', name: 'Cây Đa Bay', active: { cooldown: 14, cast: 'sacredtree', mana: 80 },
        info: (n) => `Cây đa thần mọc giữa trận: hồi máu tướng, làm chậm quái` },
      { id: 'cu_r', name: 'Cung Trăng Gọi Gió', active: { cooldown: 22, cast: 'forestwrath', mana: 130 },
        info: (n) => `Gió trăng quật mọi quái dưới đất: x3 sát thương +${n * 2}` },
    ],
  },
  melua: {
    legend: 'legendary', name: 'Mẹ Lúa', attack: 'magic', proj: 'rice', wclass: 'staff', dmgType: 'magic',
    role: 'Mùa vàng', title: 'Thần Lúa nuôi người Việt, mùa vàng no ấm', color: '#5FB84A',
    attrs: { str: 16, agi: 15, int: 31 }, gain: { str: 1.6, agi: 1.5, int: 3.5 },
    base: { damage: 11, range: 175, cooldown: 1.25, splash: 30 },
    look: { aura: '#F2D27A', weapon: { type: 'staff', color: '#7A5232', orb: '#F2D27A', glow: '#C8E070' } },
    trait: { name: 'Mùa Vàng', desc: 'Mỗi quái hạ +1 vàng; tướng đứng gần +10% sát thương' },
    traitApply: (s) => { s.goldOnKill += 1; },
    skills: [
      { id: 'ml_q', name: 'Đồng Lúa', active: { cooldown: 9, cast: 'ricefield', mana: 55 },
        info: (n) => `Lúa mọc làm chậm 40% quái trong vùng 4 giây, ${(8 + n * 0.3).toFixed(0)} sát thương/giây` },
      { id: 'ml_w', name: 'Cơm Mới', active: { cooldown: 12, cast: 'feast', mana: 60 },
        info: (n) => `Tướng trong 170 hồi ${Math.round(12 + n * 0.15)}% máu, +20% sát thương 6 giây` },
      { id: 'ml_e', name: 'Rơm Trói', active: { cooldown: 12, cast: 'vines', mana: 80 },
        info: (n) => `Rơm vàng trói 4 quái đi xa nhất, x2 sát thương +${n}` },
      { id: 'ml_r', name: 'Mùa Vàng', active: { cooldown: 22, cast: 'flowerrain', mana: 130 },
        info: (n) => `Mưa thóc vàng xuống vùng quái: x4 sát thương +${n * 2}` },
    ],
  },
  // ================= v100: ĐỢT HÀNH THỔ — đủ 4 tướng mỗi bậc, ghép CÙNG HÀNH =================
  dapde: {
    name: 'Người Đắp Đê', cost: 75, attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Chắn lũ', title: 'Cuốc đất đắp đê, giữ làng trước mùa lũ', color: '#C99A3C',
    attrs: { str: 24, agi: 11, int: 13 }, gain: { str: 2.7, agi: 1.1, int: 1.3 },
    base: { damage: 8, range: 140, cooldown: 1.25 },
    look: { aura: '#C99A3C', bulk: 1.08, weapon: { type: 'axe', color: '#8A8070' } },
    skills: [
      { id: 'dd_q', name: 'Nện Cuốc', active: { cooldown: 7, cast: 'bash', mana: 45 },
        info: (n) => `Nện cuốc xuống: choáng mục tiêu, x2 sát thương +${(n * 0.6).toFixed(0)}` },
      { id: 'dd_w', name: 'Đê Vững',
        info: (n) => `+6% máu, −${(4 + n * 0.08).toFixed(1)}% sát thương nhận`, apply: (s, n) => { s.hpPct += 6; s.dr += 4 + n * 0.08; } },
      { id: 'dd_e', name: 'Đắp Đê Chắn Lũ', active: { cooldown: 14, cast: 'goldshell', mana: 70 },
        info: (n) => `Khiên ${Math.round(20 + n * 0.25)}% máu cho tướng quanh mình` },
      { id: 'dd_r', name: 'Đất Rung Đê Vỡ', active: { cooldown: 16, cast: 'quake', mana: 110 },
        info: (n) => `Dậm đất: choáng quái quanh mình, x2 sát thương +${n}` },
    ],
  },
  chantrau: {
    name: 'Trẻ Chăn Trâu', cost: 65, attack: 'arrow', proj: 'bolt', wclass: 'bow', dmgType: 'phys',
    role: 'Choáng xa', title: 'Ná cao su, sỏi bờ đê, sáo trúc lưng trâu', color: '#C99A3C',
    attrs: { str: 15, agi: 21, int: 13 }, gain: { str: 1.5, agi: 2.6, int: 1.3 },
    base: { damage: 5, range: 170, cooldown: 0.95 },
    look: { aura: '#E8C27A', weapon: { type: 'crossbow', color: '#7A5232' } },
    skills: [
      { id: 'ct_q', name: 'Sỏi Nảy', active: { cooldown: 6, cast: 'ricochet', mana: 45 },
        info: (n) => `Viên sỏi nảy qua 5 quái, x1.3 sát thương +${(n * 0.5).toFixed(0)}` },
      { id: 'ct_w', name: 'Sỏi Trúng Đầu',
        info: (n) => `${(4 + n * 0.06).toFixed(1)}% choáng 0,5 giây mỗi đòn`, apply: (s, n) => { s.stunChance += 4 + n * 0.06; } },
      { id: 'ct_e', name: 'Sáo Trúc Lưng Trâu',
        info: (n) => `+${(8 + n * 0.15).toFixed(1)}% tốc đánh`, apply: (s, n) => { s.haste += 8 + n * 0.15; } },
      { id: 'ct_r', name: 'Cả Xóm Ra Đồng', active: { cooldown: 18, cast: 'volley', mana: 100 },
        info: () => 'Tướng đánh xa quanh mình bắn thêm 1 tia trong 6 giây' },
    ],
  },
  ongdung: {
    legend: 'epic', name: 'Ông Đùng', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Khổng lồ', title: 'Người khổng lồ gánh đất đắp núi, bước chân thành ao', color: '#A8784A',
    attrs: { str: 28, agi: 12, int: 14 }, gain: { str: 3.0, agi: 1.2, int: 1.4 },
    base: { damage: 12, range: 145, cooldown: 1.3 },
    look: { aura: '#C99A3C', bulk: 1.18, weapon: { type: 'cleaver', color: '#8A8070' } },
    trait: { name: 'Gánh Núi Đắp Sông', desc: '+20% máu, mỗi đòn thứ 5 choáng mục tiêu' },
    traitApply: (s) => { s.hpPct += 20; s.lg.stunEvery = s.lg.stunEvery ? Math.min(s.lg.stunEvery, 5) : 5; },
    skills: [
      { id: 'od_q', name: 'Gánh Đá', active: { cooldown: 10, cast: 'boulder', mana: 60 },
        info: (n) => `Ném tảng đá lăn đè hàng quái, x4 sát thương +${n * 2}` },
      { id: 'od_w', name: 'Thân Khổng Lồ',
        info: (n) => `+${(8 + n * 0.2).toFixed(1)}% máu, phản 10% sát thương`, apply: (s, n) => { s.hpPct += 8 + n * 0.2; s.thorns += 10; } },
      { id: 'od_e', name: 'Bước Chân Thành Ao', active: { cooldown: 10, cast: 'quake', mana: 60 },
        info: (n) => `Dậm chân: choáng quái quanh mình, x2 sát thương +${n}` },
      { id: 'od_r', name: 'Dựng Núi', active: { cooldown: 18, cast: 'pillar', mana: 120 },
        info: (n) => `Núi đá trồi lên: choáng quái quanh mục tiêu 1,5 giây, x3 sát thương +${n * 2}` },
    ],
  },
  thocong: {
    legend: 'epic', name: 'Thổ Công', attack: 'magic', proj: 'orb', wclass: 'staff', dmgType: 'magic',
    role: 'Giữ nhà', title: 'Thần đất giữ nhà, phù hộ người trong ngõ', color: '#D9A84E',
    attrs: { str: 16, agi: 13, int: 26 }, gain: { str: 1.6, agi: 1.3, int: 3.0 },
    base: { damage: 8, range: 165, cooldown: 1.3 },
    look: { aura: '#F2D27A', weapon: { type: 'staff', color: '#7A5232', orb: '#F2D27A' } },
    trait: { name: 'Giữ Đất Giữ Nhà', desc: 'Tướng đứng gần giảm 10% sát thương nhận' },
    skills: [
      { id: 'tg_q', name: 'Phù Hộ', active: { cooldown: 9, cast: 'staffheal', mana: 55 },
        info: (n) => `Hồi máu tướng yếu nhất quanh mình ${Math.round(25 + n * 0.3)}%` },
      { id: 'tg_w', name: 'Hương Hỏa',
        info: (n) => `+${(6 + n * 0.15).toFixed(1)}% sức mạnh kỹ năng`, apply: (s, n) => { s.skillPct += 6 + n * 0.15; } },
      { id: 'tg_e', name: 'Khiên Đất', active: { cooldown: 14, cast: 'goldshell', mana: 70 },
        info: (n) => `Khiên ${Math.round(20 + n * 0.25)}% máu cho tướng quanh mình` },
      { id: 'tg_r', name: 'Thổ Địa Hiển Linh', active: { cooldown: 22, cast: 'flowerheal', mana: 120 },
        info: (n) => `Hồi ${Math.round(25 + n * 0.3)}% máu cho mọi tướng quanh mình` },
    ],
  },
  tanvien: {
    legend: 'legendary', name: 'Sơn Tinh', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Dời non', title: 'Tản Viên Sơn Thánh, nước dâng bao nhiêu núi cao bấy nhiêu', color: '#5FB84A',
    attrs: { str: 33, agi: 15, int: 18 }, gain: { str: 3.5, agi: 1.5, int: 1.8 },
    base: { damage: 15, range: 150, cooldown: 1.05 },
    look: { aura: '#7FC24A', bulk: 1.1, weapon: { type: 'staff', color: '#D9A84E' } },
    trait: { name: 'Núi Cao Nước Dâng', desc: '+25% máu, đánh quái hành Thủy +30% sát thương' },
    traitApply: (s) => { s.hpPct += 25; s.vsThuy = 30; },
    skills: [
      { id: 'sn_q', name: 'Dời Non', active: { cooldown: 9, cast: 'boulder', mana: 60 },
        info: (n) => `Dời cả quả đồi lăn đè hàng quái, x4 sát thương +${n * 2}` },
      { id: 'sn_w', name: 'Núi Tản Viên',
        info: (n) => `+${(10 + n * 0.2).toFixed(1)}% máu, −4% sát thương nhận`, apply: (s, n) => { s.hpPct += 10 + n * 0.2; s.dr += 4; } },
      { id: 'sn_e', name: 'Đắp Núi Chặn Nước', active: { cooldown: 12, cast: 'pillar', mana: 80 },
        info: (n) => `Núi trồi lên: choáng quái quanh mục tiêu 1,5 giây, x3 sát thương +${n * 2}` },
      { id: 'sn_r', name: 'Núi Cao Bấy Nhiêu', active: { cooldown: 20, cast: 'mothermountain', mana: 130 },
        info: (n) => `Đá núi trồi lên hất tung quái: choáng 1 giây, x2 sát thương +${n}, để lại bãi đá làm chậm` },
    ],
  },
  maudia: {
    legend: 'legendary', name: 'Mẫu Địa', attack: 'magic', proj: 'orb', wclass: 'staff', dmgType: 'magic',
    role: 'Mẹ Đất', title: 'Địa Tiên Thánh Mẫu, nuôi muôn loài từ lòng đất', color: '#C99A3C',
    attrs: { str: 17, agi: 14, int: 31 }, gain: { str: 1.7, agi: 1.4, int: 3.5 },
    base: { damage: 11, range: 170, cooldown: 1.3, splash: 30 },
    look: { aura: '#E8C27A', weapon: { type: 'staff', color: '#5A3A1A', orb: '#E8C27A', glow: '#C99A3C' } },
    trait: { name: 'Địa Tiên Thánh Mẫu', desc: 'Tướng đứng gần +10% máu tối đa' },
    skills: [
      { id: 'md_q', name: 'Đất Nứt', active: { cooldown: 8, cast: 'quake', mana: 55 },
        info: (n) => `Đất nứt quanh mình: choáng quái, x2 sát thương +${n}` },
      { id: 'md_w', name: 'Mạch Đất Hồi Sinh', active: { cooldown: 12, cast: 'lotus', mana: 60 },
        info: (n) => `Mạch đất hồi dần ${Math.round(30 + n * 0.3)}% máu cho tướng yếu nhất` },
      { id: 'md_e', name: 'Rễ Thiêng', active: { cooldown: 12, cast: 'vines', mana: 80 },
        info: (n) => `Rễ cây trói 4 quái đi xa nhất, x2 sát thương +${n}` },
      { id: 'md_r', name: 'Núi Mẹ', active: { cooldown: 22, cast: 'mothermountain', mana: 130 },
        info: (n) => `Đá núi trồi lên hất tung quái: choáng 1 giây, x2 sát thương +${n}, để lại bãi đá làm chậm` },
    ],
  },
  // ================= v97: ĐỢT HÀNH THỦY — đủ 4 tướng mỗi bậc, ghép CÙNG HÀNH =================
  chodo: {
    name: 'Chàng Chèo Đò', cost: 70, attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Quét lan', title: 'Mái chèo đò ngang, quét sóng quét quân', color: '#5AB4D6',
    attrs: { str: 21, agi: 16, int: 13 }, gain: { str: 2.3, agi: 1.8, int: 1.3 },
    base: { damage: 7, range: 140, cooldown: 1.05 },
    look: { aura: '#5AB4D6', weapon: { type: 'staff', color: '#7A5232' } },
    skills: [
      { id: 'cd_q', name: 'Mái Chèo Đập', active: { cooldown: 7, cast: 'bash', mana: 45 },
        info: (n) => `Đập mái chèo: choáng mục tiêu, x2 sát thương +${(n * 0.6).toFixed(0)}` },
      { id: 'cd_w', name: 'Quét Chèo',
        info: (n) => `Quét lan ${Math.round(25 + n * 0.4)}% sát thương`, apply: (s, n) => { s.cleave += 0.25 + n * 0.004; } },
      { id: 'cd_e', name: 'Thân Sông Nước',
        info: (n) => `+5% máu, −${(3 + n * 0.06).toFixed(1)}% sát thương nhận`, apply: (s, n) => { s.hpPct += 5; s.dr += 3 + n * 0.06; } },
      { id: 'cd_r', name: 'Đò Ngang Vượt Sóng', active: { cooldown: 16, cast: 'seawave', mana: 110 },
        info: (n) => `Sóng cuộn quanh mình đẩy lùi quái, x3 sát thương +${n}` },
    ],
  },
  haisen: {
    name: 'Cô Hái Sen', cost: 75, attack: 'magic', proj: 'petal', wclass: 'staff', dmgType: 'magic',
    role: 'Hồi máu', title: 'Thuyền thúng giữa đầm sen, hạt sen ngọt lành', color: '#F2A0C0',
    attrs: { str: 14, agi: 15, int: 22 }, gain: { str: 1.4, agi: 1.5, int: 2.9 },
    base: { damage: 5, range: 165, cooldown: 1.25 },
    look: { aura: '#FF9EC4', weapon: { type: 'none' } },
    skills: [
      { id: 'hs_q', name: 'Sen Thơm', active: { cooldown: 10, cast: 'lotus', mana: 50 },
        info: (n) => `Sen nở trên tướng yếu nhất, hồi dần ${Math.round(30 + n * 0.3)}% máu` },
      { id: 'hs_w', name: 'Hạt Sen',
        info: (n) => `+${(n * 0.35).toFixed(1)} sát thương · đòn đánh làm chậm ${Math.round(15 + n * 0.15)}%`,
        apply: (s, n) => { s.damage += n * 0.35; s.netSlow = Math.max(s.netSlow, 15 + n * 0.15); } },
      { id: 'hs_e', name: 'Hương Sen',
        info: (n) => `Tướng đứng gần +${(1.2 + n * 0.05).toFixed(1)} hồi máu/giây`, apply: (s, n) => { s.regenAura = 1.2 + n * 0.05; } },
      { id: 'hs_r', name: 'Mưa Đầm Sen', active: { cooldown: 16, cast: 'blizzard', mana: 110 },
        info: (n) => `Mưa lạnh quanh mình: làm chậm, đóng băng quái, x2 sát thương +${n}` },
    ],
  },
  lyngu: {
    legend: 'epic', name: 'Lý Ngư Tướng Quân', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Vượt Vũ Môn', title: 'Cá chép vượt Vũ Môn, thành tướng giữ sông', color: '#E8843A',
    attrs: { str: 25, agi: 20, int: 13 }, gain: { str: 2.7, agi: 2.2, int: 1.3 },
    base: { damage: 11, range: 145, cooldown: 0.95 },
    look: { aura: '#FFB04A', weapon: { type: 'staff', color: '#E0B030' } },
    trait: { name: 'Vượt Vũ Môn', desc: 'Máu dưới 50%: +25% tốc đánh' },
    traitApply: (s, h) => { if (h && h.hp < (h.hpMaxLast || 1) * 0.5) s.haste += 25; },
    skills: [
      { id: 'ly_q', name: 'Ngọn Giáo Vũ Môn', active: { cooldown: 12, cast: 'judgement', mana: 60 },
        info: (n) => `Đâm quái nhiều máu nhất: x4 sát thương +${n * 2}` },
      { id: 'ly_w', name: 'Vảy Chép Vàng',
        info: (n) => `+${(5 + n * 0.1).toFixed(1)}% chí mạng, +25% sát thương chí mạng`, apply: (s, n) => { s.crit += 5 + n * 0.1; s.critMult += 0.25; } },
      { id: 'ly_e', name: 'Quẫy Đuôi', active: { cooldown: 10, cast: 'whalespout', mana: 60 },
        info: (n) => `Quẫy nước: quái trong tầm chậm 40% 2 giây, x1.6 sát thương +${(n * 0.6).toFixed(0)}` },
      { id: 'ly_r', name: 'Hóa Rồng', active: { cooldown: 18, cast: 'dragonbeam', mana: 120 },
        info: (n) => `Cá chép hóa rồng phun nước một dải: x5 sát thương +${n * 2}` },
    ],
  },
  truongchi: {
    legend: 'epic', name: 'Trương Chi', attack: 'magic', proj: 'orb', wclass: 'staff', dmgType: 'magic',
    role: 'Mê hoặc', title: 'Chàng đánh cá hát hay, tiếng sáo vang mặt sông', color: '#7FA8F0',
    attrs: { str: 14, agi: 16, int: 27 }, gain: { str: 1.4, agi: 1.6, int: 3.1 },
    base: { damage: 9, range: 170, cooldown: 1.2 },
    look: { aura: '#9EDDF2', weapon: { type: 'staff', color: '#8a6a3a', orb: '#BFE8F8' } },
    trait: { name: 'Tiếng Sáo Sông Thao', desc: 'Đòn đánh làm chậm 30%, 10% làm quái mê đứng yên' },
    traitApply: (s) => { s.el.slow = Math.max(s.el.slow || 0, 30); s.el.stun = Math.max(s.el.stun || 0, 10); },
    skills: [
      { id: 'tc_q', name: 'Khúc Sáo Mê Hồn', active: { cooldown: 12, cast: 'lute', mana: 60 },
        info: () => 'Tiếng sáo làm quái quanh mình đứng mê 1,5 giây (boss 0,6 giây)' },
      { id: 'tc_w', name: 'Lời Ca Sông Nước',
        info: (n) => `+${(6 + n * 0.15).toFixed(1)}% sức mạnh kỹ năng`, apply: (s, n) => { s.skillPct += 6 + n * 0.15; } },
      { id: 'tc_e', name: 'Sương Khói Mặt Sông', active: { cooldown: 12, cast: 'blizzard', mana: 80 },
        info: (n) => `Sương lạnh quanh mình: làm chậm, đóng băng quái, x2 sát thương +${n}` },
      { id: 'tc_r', name: 'Khúc Ca Cuối', active: { cooldown: 22, cast: 'tidegate', mana: 130 },
        info: (n) => `Tiếng hát cuốn ngược quái trong tầm, chậm 50% 3 giây, x3 sát thương +${n * 2}` },
    ],
  },
  halong: {
    legend: 'legendary', name: 'Rồng Mẹ Hạ Long', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Rồng giữ biển', title: 'Rồng Mẹ dẫn đàn rồng con phun ngọc thành đảo giữ biển', color: '#5AD6C8',
    attrs: { str: 31, agi: 15, int: 15 }, gain: { str: 3.3, agi: 1.5, int: 1.5 },
    base: { damage: 14, range: 150, cooldown: 1.1 },
    look: { aura: '#7FE8E0', bulk: 1.15, weapon: { type: 'none' } },
    trait: { name: 'Đàn Rồng Hạ Long', desc: '+30% máu, đòn đánh lan 30% sát thương' },
    traitApply: (s) => { s.hpPct += 30; s.cleave += 0.3; },
    skills: [
      { id: 'hl_q', name: 'Sóng Vịnh', active: { cooldown: 8, cast: 'seawave', mana: 55 },
        info: (n) => `Sóng vịnh đẩy lùi quái quanh mình, x3 sát thương +${n}` },
      { id: 'hl_w', name: 'Vảy Ngọc',
        info: (n) => `+${(10 + n * 0.2).toFixed(1)}% máu, phản 15% sát thương`, apply: (s, n) => { s.hpPct += 10 + n * 0.2; s.thorns += 15; } },
      { id: 'hl_e', name: 'Phun Ngọc Thành Đảo', active: { cooldown: 14, cast: 'boulder', mana: 80 },
        info: (n) => `Phun ngọc hóa đảo đá lăn đè hàng quái, x4 sát thương +${n * 2}` },
      { id: 'hl_r', name: 'Đàn Rồng Giáng Hạ', active: { cooldown: 20, cast: 'dragonbeam', mana: 130 },
        info: (n) => `Đàn rồng phun nước một dải: x5 sát thương +${n * 2}` },
    ],
  },
  longnu: {
    legend: 'legendary', name: 'Long Nữ Động Đình', attack: 'magic', proj: 'orb', wclass: 'staff', dmgType: 'magic',
    role: 'Long châu', title: 'Long Nữ hồ Động Đình, mẹ của Lạc Long Quân', color: '#5AB4D6',
    attrs: { str: 16, agi: 15, int: 31 }, gain: { str: 1.6, agi: 1.5, int: 3.5 },
    base: { damage: 12, range: 175, cooldown: 1.2, slow: 15 },
    look: { aura: '#9EDDF2', weapon: { type: 'staff', color: '#E8F4FF', orb: '#5AD6C8', glow: '#5AB4D6' } },
    trait: { name: 'Ngọc Long Nữ', desc: 'Tướng đứng gần +10% sát thương phép, +10% hồi năng lượng' },
    skills: [
      { id: 'ln_q', name: 'Long Châu', active: { cooldown: 7, cast: 'nova', mana: 55 },
        info: (n) => `Ngọc rồng nổ giữa bầy quái: x2.5 sát thương +${n}` },
      { id: 'ln_w', name: 'Nước Động Đình', active: { cooldown: 12, cast: 'lotus', mana: 60 },
        info: (n) => `Nước hồ hồi dần ${Math.round(30 + n * 0.3)}% máu cho tướng yếu nhất` },
      { id: 'ln_e', name: 'Băng Long', active: { cooldown: 12, cast: 'blizzard', mana: 80 },
        info: (n) => `Hơi rồng lạnh quanh mình: làm chậm, đóng băng quái, x2 sát thương +${n}` },
      { id: 'ln_r', name: 'Long Cung Nổi Sóng', active: { cooldown: 22, cast: 'tidegate', mana: 130 },
        info: (n) => `Sóng long cung cuốn ngược mọi quái trong tầm, chậm 50% 3 giây, x3 sát thương +${n * 2}` },
    ],
  },
  // ================= v96: ĐỢT HÀNH HỎA — đủ 4 tướng mỗi bậc (2 cận chiến + 2 đánh xa), ghép CÙNG HÀNH =================
  dotnuong: {
    name: 'Chàng Đốt Nương', cost: 70, attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Vệt lửa', title: 'Dao phát rẫy, lửa đốt nương làm rẫy trên núi', color: '#E25A3A',
    attrs: { str: 21, agi: 17, int: 12 }, gain: { str: 2.3, agi: 2.0, int: 1.2 },
    base: { damage: 7, range: 140, cooldown: 0.95 },
    look: { aura: '#FF7A3A', weapon: { type: 'axe', color: '#9E9A90' } },
    skills: [
      { id: 'dn_q', name: 'Dao Phát Rẫy', active: { cooldown: 7, cast: 'forgehammer', mana: 50 },
        info: (n) => `Chém mạnh: x2.2 sát thương +${(n * 0.8).toFixed(0)}, đốt mục tiêu 3 giây` },
      { id: 'dn_w', name: 'Lửa Nương',
        info: (n) => `Đòn đánh để lại vệt lửa trên sông, ${Math.round(15 + n * 0.3)}% sát thương mỗi giây`, apply: (s, n) => { s.fireTrail += 0.15 + n * 0.003; } },
      { id: 'dn_e', name: 'Khói Rẫy',
        info: (n) => `+${(6 + n * 0.15).toFixed(1)}% tốc đánh`, apply: (s, n) => { s.haste += 6 + n * 0.15; } },
      { id: 'dn_r', name: 'Cháy Rừng', active: { cooldown: 14, cast: 'forgeblast', mana: 110 },
        info: (n) => `Lửa bùng quanh mình: x4 sát thương +${n * 2}, đốt mọi quái trúng` },
    ],
  },
  denroi: {
    name: 'Cô Thả Đèn Trời', cost: 75, attack: 'magic', proj: 'fireball', wclass: 'staff', dmgType: 'magic',
    role: 'Mưa lửa', title: 'Thả đèn trời ước nguyện, đèn rơi thành mưa lửa', color: '#FFB04A',
    attrs: { str: 14, agi: 15, int: 22 }, gain: { str: 1.4, agi: 1.5, int: 2.9 },
    base: { damage: 5, range: 165, cooldown: 1.25, splash: 25 },
    look: { aura: '#FFB04A', weapon: { type: 'staff', color: '#8a6a3a', orb: '#FFD66B' } },
    skills: [
      { id: 'dr_q', name: 'Đèn Trời Rơi', active: { cooldown: 7, cast: 'lanterns', mana: 50 },
        info: (n) => `3 đèn trời rơi xuống 3 quái: x1.5 sát thương +${(n * 0.6).toFixed(0)}, thiêu đốt` },
      { id: 'dr_w', name: 'Bấc Đèn',
        info: (n) => `+${(n * 0.4).toFixed(1)} sát thương · vùng nổ ${Math.round(Math.min(80, 30 + n * 0.35))}`,
        apply: (s, n) => { s.damage += n * 0.4; s.splash = Math.min(80, 30 + n * 0.35); } },
      { id: 'dr_e', name: 'Ước Nguyện',
        info: (n) => `+${(6 + n * 0.15).toFixed(1)}% sức mạnh kỹ năng`, apply: (s, n) => { s.skillPct += 6 + n * 0.15; } },
      { id: 'dr_r', name: 'Ngàn Đèn Bay', active: { cooldown: 16, cast: 'birds', mana: 110 },
        info: (n) => `Ngàn đèn lửa lao xuống quái quanh mình, x2 sát thương +${n}` },
    ],
  },
  potaoapui: {
    legend: 'epic', name: 'Vua Lửa Pơtao Apui', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Xuyên giáp', title: 'Vua Lửa Gia Rai giữ gươm thần trên cao nguyên', color: '#E0452C',
    attrs: { str: 26, agi: 16, int: 14 }, gain: { str: 2.8, agi: 1.7, int: 1.4 },
    base: { damage: 11, range: 145, cooldown: 1.1 },
    look: { aura: '#FF6A3A', bulk: 1.08, weapon: { type: 'axe', color: '#E0B030' } },
    trait: { name: 'Gươm Thần Gia Rai', desc: '+20% xuyên giáp, 35% mỗi đòn thiêu đốt' },
    traitApply: (s) => { s.pierce += 20; s.el.burn = Math.max(s.el.burn || 0, 35); },
    skills: [
      { id: 'pa_q', name: 'Gươm Lửa', active: { cooldown: 12, cast: 'judgement', mana: 60 },
        info: (n) => `Chém quái nhiều máu nhất: x4 sát thương +${n * 2}` },
      { id: 'pa_w', name: 'Lời Thề Núi Lửa',
        info: (n) => `+${(6 + n * 0.15).toFixed(1)}% sát thương, +5% máu`, apply: (s, n) => { s.bonusDmgPct += 6 + n * 0.15; s.hpPct += 5; } },
      { id: 'pa_e', name: 'Vòng Lửa', active: { cooldown: 12, cast: 'forgeblast', mana: 80 },
        info: (n) => `Vòng lửa quanh mình: x4 sát thương +${n * 2}, đốt` },
      { id: 'pa_r', name: 'Núi Lửa Thức Giấc', active: { cooldown: 20, cast: 'meteor', mana: 120 },
        info: (n) => `Đá lửa từ núi lửa rơi xuống: x5 sát thương +${n * 2}` },
    ],
  },
  baahoa: {
    legend: 'epic', name: 'Bà Hỏa', attack: 'magic', proj: 'fireball', wclass: 'staff', dmgType: 'magic',
    role: 'Hỏa hoạn', title: 'Bà Hỏa đi đến đâu, lửa bén đến đó', color: '#C8302A',
    attrs: { str: 15, agi: 15, int: 27 }, gain: { str: 1.5, agi: 1.5, int: 3.1 },
    base: { damage: 9, range: 165, cooldown: 1.2, splash: 30 },
    look: { aura: '#E0452C', weapon: { type: 'staff', color: '#3A1A10', orb: '#FF6A3A', glow: '#E0452C' } },
    trait: { name: 'Hỏa Hoạn', desc: 'Quái đang bị thiêu đốt nhận thêm 20% sát thương' },
    traitApply: (s) => { s.burnAmp = 20; },
    skills: [
      { id: 'bh_q', name: 'Đốm Lửa', active: { cooldown: 6, cast: 'firepillar', mana: 55 },
        info: (n) => `Cột lửa thiêu quái: x1.8 sát thương +${(n * 0.8).toFixed(0)}` },
      { id: 'bh_w', name: 'Lửa Lan',
        info: (n) => `Quái trúng nổ bị đốt ${(4 + n * 0.2).toFixed(1)} máu/giây · vùng nổ ${Math.round(Math.min(90, 35 + n * 0.4))}`,
        apply: (s, n) => { s.poison = 4 + n * 0.2; s.splash = Math.min(90, 35 + n * 0.4); } },
      { id: 'bh_e', name: 'Khói Mù', active: { cooldown: 12, cast: 'smokecloud', mana: 70 },
        info: (n) => `Khói đen quanh mục tiêu: chậm 30%, câm lặng 2 giây, x1.5 sát thương +${n}` },
      { id: 'bh_r', name: 'Biển Lửa', active: { cooldown: 20, cast: 'firestorm', mana: 120 },
        info: (n) => `Biển lửa trong tầm: x2 sát thương +${n * 2}, thiêu 4 giây` },
    ],
  },
  kinhduong: {
    legend: 'legendary', name: 'Kinh Dương Vương', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Vua Xích Quỷ', title: 'Vua nước Xích Quỷ, cha của Lạc Long Quân', color: '#E0452C',
    attrs: { str: 30, agi: 16, int: 16 }, gain: { str: 3.3, agi: 1.7, int: 1.6 },
    base: { damage: 14, range: 150, cooldown: 1.0 },
    look: { aura: '#FF6A3A', bulk: 1.1, weapon: { type: 'axe', color: '#E0B030' } },
    trait: { name: 'Vua Xích Quỷ', desc: 'Toàn quân +8% sát thương khi Kinh Dương Vương trên sân' },
    skills: [
      { id: 'kd_q', name: 'Kiếm Xích Quỷ', active: { cooldown: 7, cast: 'chop', mana: 55 },
        info: (n) => `Chém một nhát rực lửa: x3 sát thương +${n}` },
      { id: 'kd_w', name: 'Dòng Dõi Thần Nông',
        info: (n) => `+${(10 + n * 0.2).toFixed(1)}% máu, +${(1 + n * 0.04).toFixed(1)} hồi máu/giây`, apply: (s, n) => { s.hpPct += 10 + n * 0.2; s.regen += 1 + n * 0.04; } },
      { id: 'kd_e', name: 'Lệnh Vua', active: { cooldown: 14, cast: 'rally', mana: 70 },
        info: (n) => `Tướng xung quanh +${Math.round(25 + n * 0.15)}% tốc đánh 5 giây` },
      { id: 'kd_r', name: 'Hỏa Long Giáng Thế', active: { cooldown: 20, cast: 'dragonbeam', mana: 130 },
        info: (n) => `Rồng lửa phun một dải: x5 sát thương +${n * 2}` },
    ],
  },
  viemde: {
    legend: 'legendary', name: 'Viêm Đế Thần Nông', attack: 'magic', proj: 'fireball', wclass: 'staff', dmgType: 'magic',
    role: 'Lửa nuôi dân', title: 'Vua Lửa dạy dân cày cấy, nếm trăm thứ cỏ', color: '#FFB04A',
    attrs: { str: 16, agi: 14, int: 31 }, gain: { str: 1.6, agi: 1.4, int: 3.5 },
    base: { damage: 12, range: 175, cooldown: 1.25, splash: 35 },
    look: { aura: '#FFB04A', weapon: { type: 'staff', color: '#7A5232', orb: '#FFB04A', glow: '#FF8A3A' } },
    trait: { name: 'Lửa Nuôi Muôn Dân', desc: 'Mỗi quái Viêm Đế hạ: mọi tướng hồi 2% máu' },
    skills: [
      { id: 'vd_q', name: 'Ngọn Lửa Đầu Tiên', active: { cooldown: 6, cast: 'firepillar', mana: 55 },
        info: (n) => `Cột lửa thiêu quái: x1.8 sát thương +${(n * 0.8).toFixed(0)}` },
      { id: 'vd_w', name: 'Bách Thảo',
        info: (n) => `+${(6 + n * 0.15).toFixed(1)}% sức mạnh kỹ năng · tướng đứng gần +${(1.5 + n * 0.05).toFixed(1)} hồi máu/giây`,
        apply: (s, n) => { s.skillPct += 6 + n * 0.15; s.regenAura = 1.5 + n * 0.05; } },
      { id: 'vd_e', name: 'Cày Lửa', active: { cooldown: 14, cast: 'firestorm', mana: 80 },
        info: (n) => `Lửa cày qua quái trong tầm: x2 sát thương +${n * 2}, thiêu 4 giây` },
      { id: 'vd_r', name: 'Viêm Đế Giáng Hỏa', active: { cooldown: 22, cast: 'meteor', mana: 130 },
        info: (n) => `Mặt trời lửa rơi xuống: x5 sát thương +${n * 2} vùng lớn` },
    ],
  },
  // ================= v94: 11 TƯỚNG DÂN GIAN MỚI — mỗi hành đủ cận chiến + đánh xa ở cả 3 bậc =================
  // ---- Thường
  thoren: {
    name: 'Thợ Rèn Đông Sơn', cost: 75, attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Thiêu đốt', title: 'Búa nung đỏ lửa lò rèn trống đồng', color: '#E25A3A',
    attrs: { str: 23, agi: 13, int: 12 }, gain: { str: 2.6, agi: 1.4, int: 1.2 },
    base: { damage: 8, range: 140, cooldown: 1.15 },
    look: { aura: '#FF7A3A', bulk: 1.08, weapon: { type: 'cleaver', color: '#C87A3A' } },
    skills: [
      { id: 'ren_q', name: 'Búa Nung Đỏ', active: { cooldown: 7, cast: 'forgehammer', mana: 50 },
        info: (n) => `Bổ búa nung: x2.2 sát thương +${(n * 0.8).toFixed(0)}, đốt mục tiêu 3 giây` },
      { id: 'ren_w', name: 'Lò Lửa Đông Sơn',
        info: (n) => `+${(4 + n * 0.1).toFixed(1)}% sát thương`, apply: (s, n) => { s.bonusDmgPct += 4 + n * 0.1; } },
      { id: 'ren_e', name: 'Áo Đồng Mới Rèn',
        info: (n) => `+${(6 + n * 0.15).toFixed(1)}% máu, −3% sát thương nhận`, apply: (s, n) => { s.hpPct += 6 + n * 0.15; s.dr += 3; } },
      { id: 'ren_r', name: 'Nổ Lò Rèn', active: { cooldown: 14, cast: 'forgeblast', mana: 110 },
        info: (n) => `Lò rèn nổ tung quanh mình: x4 sát thương +${n * 2}, đốt mọi quái trúng` },
    ],
  },
  nguphu: {
    name: 'Ngư Phủ Sông Đà', cost: 70, attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Trói chân', title: 'Chài lưới, xiên cá, quen sóng thác', color: '#5AB4D6',
    attrs: { str: 20, agi: 18, int: 12 }, gain: { str: 2.2, agi: 2.0, int: 1.2 },
    base: { damage: 7, range: 145, cooldown: 1.0 },
    look: { aura: '#5AB4D6', weapon: { type: 'staff', color: '#8a6a3a' } },
    skills: [
      { id: 'ng_q', name: 'Quăng Chài', active: { cooldown: 8, cast: 'netthrow', mana: 45 },
        info: (n) => `Quăng chài trói ${n >= 15 ? 5 : 4} quái 1,2 giây, x1.2 sát thương +${(n * 0.5).toFixed(0)}` },
      { id: 'ng_w', name: 'Xiên Cá',
        info: (n) => `+${(4 + n * 0.1).toFixed(1)}% chí mạng, +20% sát thương chí mạng`, apply: (s, n) => { s.crit += 4 + n * 0.1; s.critMult += 0.2; } },
      { id: 'ng_e', name: 'Sóng Vỗ Mạn Thuyền',
        info: (n) => `Đòn đánh làm chậm ${Math.round(20 + n * 0.2)}%`, apply: (s, n) => { s.netSlow = Math.max(s.netSlow, 20 + n * 0.2); } },
      { id: 'ng_r', name: 'Thuyền Nan Lướt Sóng', active: { cooldown: 16, cast: 'seawave', mana: 110 },
        info: (n) => `Sóng cuộn quanh mình đẩy lùi và gây x3 sát thương +${n}` },
    ],
  },
  thogom: {
    name: 'Thợ Gốm Phù Lãng', cost: 70, attack: 'arrow', proj: 'melon', wclass: 'bow', dmgType: 'phys',
    role: 'Phá giáp', title: 'Ném bình gốm nung, đất vỡ giáp tan', color: '#C99A3C',
    attrs: { str: 17, agi: 20, int: 14 }, gain: { str: 1.8, agi: 2.4, int: 1.4 },
    base: { damage: 6, range: 165, cooldown: 1.35, splash: 30 },
    look: { aura: '#C99A3C', weapon: { type: 'none' } },
    skills: [
      { id: 'gm_q', name: 'Bình Gốm Nổ', active: { cooldown: 7, cast: 'potbomb', mana: 50 },
        info: (n) => `Ném bình gốm: x2 sát thương +${(n * 0.8).toFixed(0)} vùng 70, choáng 0,6 giây` },
      { id: 'gm_w', name: 'Đất Nung',
        info: (n) => `+${(n * 0.3).toFixed(1)} sát thương · vùng vỡ ${Math.round(Math.min(90, 35 + n * 0.4))}`,
        apply: (s, n) => { s.damage += n * 0.3; s.splash = Math.min(90, 35 + n * 0.4); } },
      { id: 'gm_e', name: 'Men Rạn',
        info: (n) => `Mỗi đòn giảm ${(1 + n * 0.03).toFixed(1)} giáp quái (cộng 3 lần)`, apply: (s, n) => { s.shred = Math.max(s.shred, 1 + n * 0.03); } },
      { id: 'gm_r', name: 'Lò Gốm Ngàn Năm', active: { cooldown: 16, cast: 'boulder', mana: 110 },
        info: (n) => `Lăn khối đất nung đè cả hàng quái, x4 sát thương +${n * 2}` },
    ],
  },
  thaylang: {
    name: 'Thầy Lang Lá Thuốc', cost: 75, attack: 'magic', proj: 'petal', wclass: 'staff', dmgType: 'magic',
    role: 'Hồi máu', title: 'Lá thuốc nam, cứu người giữa trận', color: '#5FB84A',
    attrs: { str: 15, agi: 13, int: 23 }, gain: { str: 1.5, agi: 1.3, int: 2.9 },
    base: { damage: 5, range: 160, cooldown: 1.3 },
    look: { aura: '#5FD06A', weapon: { type: 'staff', color: '#6A4A2A', orb: '#7FE07A' } },
    skills: [
      { id: 'tl_q', name: 'Thuốc Nam', active: { cooldown: 9, cast: 'herbheal', mana: 50 },
        info: (n) => `Hồi ${Math.round(20 + n * 0.3)}% máu cho tướng yếu nhất, 8% cho tướng xung quanh` },
      { id: 'tl_w', name: 'Lá Ngón',
        info: (n) => `+${(n * 0.3).toFixed(1)} sát thương · quái trúng không được hồi máu 3 giây`, apply: (s, n) => { s.damage += n * 0.3; s.noHeal = 3; } },
      { id: 'tl_e', name: 'Hương Rừng',
        info: (n) => `Tướng đứng gần +${(1.5 + n * 0.06).toFixed(1)} hồi máu/giây`, apply: (s, n) => { s.regenAura = 1.5 + n * 0.06; } },
      { id: 'tl_r', name: 'Cứu Mệnh', active: { cooldown: 24, cast: 'flowerheal', mana: 120 },
        info: (n) => `Hồi ${Math.round(25 + n * 0.3)}% máu cho mọi tướng quanh mình` },
    ],
  },
  // ---- Tím
  trongdong: {
    legend: 'epic', name: 'Thần Trống Đồng', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Hiệu triệu', title: 'Tiếng trống đồng gọi quân, sấm rền mặt trận', color: '#E0B030',
    attrs: { str: 26, agi: 14, int: 15 }, gain: { str: 2.8, agi: 1.4, int: 1.5 },
    base: { damage: 11, range: 145, cooldown: 1.15 },
    look: { aura: '#F2D27A', bulk: 1.1, weapon: { type: 'cleaver', color: '#E0B030' } },
    trait: { name: 'Hồi Trống Thiêng', desc: 'Tướng đứng gần +10% tốc đánh' },
    skills: [
      { id: 'td_q', name: 'Gõ Trống Trận', active: { cooldown: 12, cast: 'rally', mana: 60 },
        info: (n) => `Tướng xung quanh +${Math.round(25 + n * 0.15)}% tốc đánh 5 giây` },
      { id: 'td_w', name: 'Âm Vang',
        info: (n) => `${(5 + n * 0.05).toFixed(1)}% choáng mỗi đòn`, apply: (s, n) => { s.stunChance += 5 + n * 0.05; } },
      { id: 'td_e', name: 'Mặt Trời Trống Đồng',
        info: (n) => `Chém lan ${Math.round(30 + n * 0.4)}% sát thương`, apply: (s, n) => { s.cleave += 0.3 + n * 0.004; } },
      { id: 'td_r', name: 'Sấm Đồng', active: { cooldown: 18, cast: 'drumquake', mana: 120 },
        info: (n) => `Trống sấm rền: choáng mọi quái quanh mình 1,5 giây, x3 sát thương +${n * 2}` },
    ],
  },
  caong: {
    legend: 'epic', name: 'Thần Cá Ông', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Che chắn', title: 'Cá Ông cứu thuyền chài giữa biển động', color: '#5AB4D6',
    attrs: { str: 28, agi: 12, int: 15 }, gain: { str: 3.0, agi: 1.2, int: 1.5 },
    base: { damage: 9, range: 140, cooldown: 1.3 },
    look: { aura: '#9EDDF2', bulk: 1.14, weapon: { type: 'none' } },
    trait: { name: 'Hộ Ngư Dân', desc: 'Tướng đứng kề giảm 10% sát thương nhận; bản thân +15% máu' },
    traitApply: (s) => { s.hpPct += 15; },
    skills: [
      { id: 'co_q', name: 'Phun Vòi Nước', active: { cooldown: 9, cast: 'whalespout', mana: 50 },
        info: (n) => `Phun nước: quái trong tầm chậm 40% 2 giây, x1.6 sát thương +${(n * 0.6).toFixed(0)}` },
      { id: 'co_w', name: 'Hộ Thuyền', active: { cooldown: 14, cast: 'goldshell', mana: 70 },
        info: (n) => `Khiên ${Math.round(20 + n * 0.25)}% máu cho tướng quanh mình` },
      { id: 'co_e', name: 'Da Cá Voi',
        info: (n) => `−${(4 + n * 0.08).toFixed(1)}% sát thương nhận, phản ${Math.round(10 + n * 0.2)}%`,
        apply: (s, n) => { s.dr += 4 + n * 0.08; s.thorns += 10 + n * 0.2; } },
      { id: 'co_r', name: 'Triều Cường', active: { cooldown: 18, cast: 'seawave', mana: 120 },
        info: (n) => `Sóng lớn đẩy lùi quái quanh mình, x3 sát thương +${n}` },
    ],
  },
  ongtao: {
    legend: 'epic', name: 'Ông Táo', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Đốt cháy', title: 'Thần bếp cưỡi cá chép, lửa than không tắt', color: '#E0452C',
    attrs: { str: 22, agi: 20, int: 15 }, gain: { str: 2.4, agi: 2.2, int: 1.5 },
    base: { damage: 10, range: 145, cooldown: 1.0 },
    look: { aura: '#FF8A3A', weapon: { type: 'daggers', color: '#3A2A1A' } },
    trait: { name: 'Bếp Lửa Nhà Nam', desc: '35% mỗi đòn thiêu đốt quái 3 giây' },
    traitApply: (s) => { s.el.burn = Math.max(s.el.burn || 0, 35); },
    skills: [
      { id: 'ot_q', name: 'Kẹp Than Hồng', active: { cooldown: 7, cast: 'forgehammer', mana: 50 },
        info: (n) => `Kẹp than: x2.2 sát thương +${(n * 0.8).toFixed(0)}, đốt mục tiêu 3 giây` },
      { id: 'ot_w', name: 'Ba Ông Đầu Rau',
        info: (n) => `+${(6 + n * 0.15).toFixed(1)}% sát thương`, apply: (s, n) => { s.bonusDmgPct += 6 + n * 0.15; } },
      { id: 'ot_e', name: 'Tấu Trình Thiên Đình', active: { cooldown: 14, cast: 'judgement', mana: 80 },
        info: (n) => `Giáng đòn lên quái nhiều máu nhất: x4 sát thương +${n * 2}` },
      { id: 'ot_r', name: 'Cá Chép Hóa Rồng', active: { cooldown: 18, cast: 'dragonbeam', mana: 120 },
        info: (n) => `Cá chép hóa rồng lửa phun một dải: x5 sát thương +${n * 2}` },
    ],
  },
  // ---- Vàng
  matroi: {
    legend: 'legendary', name: 'Nữ Thần Mặt Trời', attack: 'magic', proj: 'fireball', wclass: 'staff', dmgType: 'magic',
    role: 'Thiêu rụi', title: 'Nữ thần dắt mặt trời qua bầu trời mỗi ngày', color: '#FFB04A',
    attrs: { str: 16, agi: 14, int: 30 }, gain: { str: 1.6, agi: 1.4, int: 3.4 },
    base: { damage: 12, range: 170, cooldown: 1.25, splash: 30 },
    look: { aura: '#FFB04A', weapon: { type: 'staff', color: '#E0B030', orb: '#FFE08A', glow: '#FFB04A' } },
    trait: { name: 'Vầng Dương', desc: '+20% sát thương lên quái bay, đòn đánh đốt 30% quái trúng' },
    traitApply: (s) => { s.airPct += 20; s.el.burn = Math.max(s.el.burn || 0, 30); },
    skills: [
      { id: 'mt_q', name: 'Cột Nắng', active: { cooldown: 6, cast: 'firepillar', mana: 55 },
        info: (n) => `Cột nắng thiêu quái: x1.8 sát thương +${(n * 0.8).toFixed(0)}` },
      { id: 'mt_w', name: 'Nắng Hạ',
        info: (n) => `+${(n * 0.5).toFixed(1)} sát thương phép · vùng nổ ${Math.round(Math.min(100, 40 + n * 0.4))}`,
        apply: (s, n) => { s.damage += n * 0.5; s.splash = Math.min(100, 40 + n * 0.4); } },
      { id: 'mt_e', name: 'Quạ Lửa Ba Chân', active: { cooldown: 12, cast: 'birds', mana: 80 },
        info: (n) => `Đàn quạ lửa lao xuống quái quanh mình, x2 sát thương +${n}` },
      { id: 'mt_r', name: 'Nhật Thực', active: { cooldown: 22, cast: 'meteor', mana: 130 },
        info: (n) => `Mặt trời rơi xuống: x5 sát thương +${n * 2} vùng lớn` },
    ],
  },
  mauthoai: {
    legend: 'legendary', name: 'Mẫu Thoải', attack: 'magic', proj: 'orb', wclass: 'staff', dmgType: 'magic',
    role: 'Khống chế', title: 'Thánh Mẫu cai quản sông nước, Thủy Cung', color: '#5AB4D6',
    attrs: { str: 16, agi: 15, int: 30 }, gain: { str: 1.6, agi: 1.5, int: 3.4 },
    base: { damage: 11, range: 170, cooldown: 1.25, slow: 15 },
    look: { aura: '#9EDDF2', weapon: { type: 'staff', color: '#E8F4FF', orb: '#9EDDF2', glow: '#5AB4D6' } },
    trait: { name: 'Thủy Cung Thánh Mẫu', desc: 'Tướng đứng gần +15% hồi năng lượng' },
    skills: [
      { id: 'mth_q', name: 'Sóng Bạc', active: { cooldown: 8, cast: 'seawave', mana: 55 },
        info: (n) => `Sóng bạc quanh mình đẩy lùi quái, x3 sát thương +${n}` },
      { id: 'mth_w', name: 'Nước Thánh', active: { cooldown: 12, cast: 'lotus', mana: 60 },
        info: (n) => `Sen nước thánh hồi dần ${Math.round(30 + n * 0.3)}% máu cho tướng yếu nhất` },
      { id: 'mth_e', name: 'Băng Ngọc', active: { cooldown: 12, cast: 'blizzard', mana: 80 },
        info: (n) => `Mưa băng quanh mình: làm chậm, đóng băng quái, x2 sát thương +${n}` },
      { id: 'mth_r', name: 'Long Cung Mở Cửa', active: { cooldown: 24, cast: 'tidegate', mana: 130 },
        info: (n) => `Mở cửa Thủy Cung: cuốn ngược mọi quái trong tầm, chậm 50% 3 giây, x3 sát thương +${n * 2}` },
    ],
  },
  trutroi: {
    legend: 'legendary', name: 'Thần Trụ Trời', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Chống trời', title: 'Người khổng lồ đắp cột chống trời, tách trời khỏi đất', color: '#C99A3C',
    attrs: { str: 32, agi: 10, int: 15 }, gain: { str: 3.4, agi: 1.0, int: 1.5 },
    base: { damage: 13, range: 145, cooldown: 1.35 },
    look: { aura: '#C99A3C', bulk: 1.2, weapon: { type: 'cleaver', color: '#8A8070' } },
    trait: { name: 'Chống Trời', desc: '+25% máu, chặn thêm 10% đòn đánh' },
    traitApply: (s) => { s.hpPct += 25; s.el.block = (s.el.block || 0) + 10; },
    skills: [
      { id: 'tt_q', name: 'Dậm Đất', active: { cooldown: 8, cast: 'quake', mana: 55 },
        info: (n) => `Dậm chân: choáng quái quanh mình, x2 sát thương +${n}` },
      { id: 'tt_w', name: 'Cột Đá', active: { cooldown: 14, cast: 'pillar', mana: 70 },
        info: (n) => `Đá mọc từ đất: choáng quái quanh mục tiêu 1,5 giây, x3 sát thương +${n * 2}` },
      { id: 'tt_e', name: 'Thân Đá Núi',
        info: (n) => `+${(8 + n * 0.2).toFixed(1)}% máu, −${(5 + n * 0.08).toFixed(1)}% sát thương nhận`,
        apply: (s, n) => { s.hpPct += 8 + n * 0.2; s.dr += 5 + n * 0.08; } },
      { id: 'tt_r', name: 'Đội Đá Vá Trời', active: { cooldown: 20, cast: 'boulder', mana: 130 },
        info: (n) => `Ném tảng đá trời lăn đè cả hàng quái, x5 sát thương +${n * 2}` },
    ],
  },
  ongho: {
    legend: 'legendary', name: 'Chúa Sơn Lâm', attack: 'melee', wclass: 'blade', dmgType: 'phys',
    role: 'Kết liễu', title: 'Ông Ba Mươi, chúa tể núi rừng', color: '#E8843A',
    attrs: { str: 22, agi: 30, int: 12 }, gain: { str: 2.4, agi: 3.4, int: 1.2 },
    base: { damage: 12, range: 145, cooldown: 0.85 },
    look: { aura: '#E8843A', weapon: { type: 'daggers', color: '#F2EEE0' } },
    trait: { name: 'Chúa Tể Núi Rừng', desc: 'Đánh quái dưới 30% máu: +40% sát thương' },
    traitApply: (s) => { s.execPct = 40; },
    skills: [
      { id: 'oh_q', name: 'Vồ Mồi', active: { cooldown: 6, cast: 'tiger', mana: 50 },
        info: (n) => `Lao vào 3 quái yếu nhất, x2 sát thương +${n}` },
      { id: 'oh_w', name: 'Tiếng Gầm Rừng', active: { cooldown: 14, cast: 'tigerroar', mana: 70 },
        info: () => 'Gầm vang: choáng quái quanh mình 1 giây, câm lặng 3 giây' },
      { id: 'oh_e', name: 'Bước Chân Rừng',
        info: (n) => `+${Math.round(10 + n * 0.2)}% tốc đánh, +${(1 + n * 0.03).toFixed(1)} hồi máu/giây`,
        apply: (s, n) => { s.haste += 10 + n * 0.2; s.regen += 1 + n * 0.03; } },
      { id: 'oh_r', name: 'Đại Săn', active: { cooldown: 18, cast: 'greathunt', mana: 120 },
        info: (n) => `Cả rừng đi săn: đánh dấu quái, x4 sát thương +${n * 2}` },
    ],
  },
  // ---------------- 4 TƯỚNG THẦN MỚI (v27): đủ chuỗi Thường → Sử thi → Huyền thoại ----------------
  lachau: {
    legend: 'epic', name: 'Lạc Hầu', attack: 'melee', wclass: 'blade', dmgType: 'phys',
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
    legend: 'epic', name: 'Thần Săn Ba Vì', attack: 'melee', wclass: 'blade', dmgType: 'phys',
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
    legend: 'legendary', name: 'An Dương Vương', attack: 'arrow', proj: 'bolt', wclass: 'bow', dmgType: 'phys',
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
    legend: 'legendary', name: 'Mẫu Thượng Ngàn', attack: 'magic', proj: 'petal', wclass: 'staff', dmgType: 'magic',
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
const BASIC_HEROES = ['lactuong', 'lucsi', 'xathu', 'thosan', 'thaymo', 'thansuong', 'thoren', 'nguphu', 'thogom', 'thaylang', 'dotnuong', 'denroi', 'chodo', 'haisen', 'dapde', 'chantrau', 'giaodong', 'chuongdong', 'tre', 'ongthoi'];
// v94: quân triệu hồi mỗi ải = 6 tướng gốc + 2 trong 4 tướng thường mới (đổi theo ải) — giữ tỉ lệ ghép sao không quá thấp
// v100: nhóm luân phiên theo ải — mỗi nhóm đủ 4 tướng Thường của một hành để ghép cùng hành (Hỏa / Thủy / Thổ), nhóm cuối: Mộc mới
const NEW_GROUPS = [['thoren', 'dotnuong', 'denroi'], ['nguphu', 'chodo', 'haisen'], ['thogom', 'dapde', 'chantrau'], ['giaodong', 'chuongdong'], ['thaylang', 'tre', 'ongthoi']];
const NEW_BASICS = NEW_GROUPS.flat();
const summonPool = (level) => [...BASIC_HEROES.slice(0, 6), ...NEW_GROUPS[(level || 0) % NEW_GROUPS.length]];
const LEGEND_HEROES = ['thachsanh', 'lachau', 'thansan', 'caolo', 'antiem', 'tiendung', 'langlieu', 'cdt', 'trongdong', 'caong', 'ongtao', 'potaoapui', 'baahoa', 'lyngu', 'truongchi', 'ongdung', 'thocong', 'nghedong', 'mychau', 'sodua',
  'giong', 'llq', 'kimquy', 'adv', 'auco', 'mau', 'matroi', 'mauthoai', 'trutroi', 'ongho', 'kinhduong', 'viemde', 'halong', 'longnu', 'tanvien', 'maudia', 'kylan', 'thienloi', 'cuoi', 'melua'];
for (const id of LEGEND_HEROES) HEROES[id].cost = COSTS.legend[HEROES[id].legend];

// HỢP THỂ (v34): hai tướng ★★★ đúng công thức kéo vào nhau → một thần mới.
// Thường + Thường → thần Sử thi (tím); thần tím Thần tinh ★★★ + thần tím → thần Huyền thoại (vàng).
// Thần mới giữ cấp, đồ, thuộc tính và nội tại của CẢ HAI bên (cây phả hệ h.lineage).
const FUSION = [
  // Thường → Sử thi
  // Sử thi → Huyền thoại
  // v94: tướng dân gian mới
  { a: 'nguphu', b: 'thansuong', to: 'caong', why: 'ngư phủ gặp sương biển: Cá Ông cứu thuyền' },
  { a: 'thaylang', b: 'thosan', to: 'antiem', why: 'lá thuốc + tay rừng trồng được dưa hấu' },
  { a: 'ongtao', b: 'tiendung', to: 'matroi', why: 'lửa bếp + tiên nữ: Nữ Thần Mặt Trời' },
  // v96: HÀNH HỎA ghép cùng hành — 4 Thường → 4 Tím → 4 Vàng
  { a: 'thaymo', b: 'denroi', to: 'tiendung', why: 'lửa thiêng + đèn trời thành tiên nữ' },
  { a: 'thoren', b: 'thaymo', to: 'ongtao', why: 'lửa lò rèn + lửa thiêng thành ba ông đầu rau' },
  { a: 'dotnuong', b: 'thoren', to: 'potaoapui', why: 'lửa rẫy + lò rèn đúc gươm thần Vua Lửa' },
  { a: 'denroi', b: 'dotnuong', to: 'baahoa', why: 'đèn trời + lửa rẫy: Bà Hỏa' },
  { a: 'potaoapui', b: 'baahoa', to: 'giong', why: 'gươm lửa + hỏa hoạn hun đúc Thánh Gióng' },
  { a: 'potaoapui', b: 'ongtao', to: 'kinhduong', why: 'vua lửa + thần bếp: Kinh Dương Vương' },
  { a: 'baahoa', b: 'tiendung', to: 'viemde', why: 'lửa trời + tiên nữ: Viêm Đế Thần Nông' },
  // v97: HÀNH THỦY ghép cùng hành
  { a: 'thansuong', b: 'chodo', to: 'cdt', why: 'sương sớm + chàng chèo đò nghèo: Chử Đồng Tử' },
  { a: 'nguphu', b: 'chodo', to: 'lyngu', why: 'lưới chài + mái chèo vớt được cá chép vượt Vũ Môn' },
  { a: 'haisen', b: 'nguphu', to: 'truongchi', why: 'đầm sen + thuyền chài: chàng Trương Chi' },
  { a: 'lyngu', b: 'caong', to: 'llq', why: 'cá chép hóa rồng + thần biển: Lạc Long Quân' },
  { a: 'lyngu', b: 'cdt', to: 'halong', why: 'rồng chép + đầm Nhất Dạ: Rồng Mẹ Hạ Long' },
  { a: 'truongchi', b: 'caong', to: 'longnu', why: 'tiếng hát + biển cả: Long Nữ Động Đình' },
  // v100: HÀNH THỔ ghép cùng hành
  { a: 'lucsi', b: 'dapde', to: 'lachau', why: 'sức núi + người đắp đê thành thủ lĩnh bộ Lạc' },
  { a: 'thogom', b: 'lucsi', to: 'langlieu', why: 'đất nung + sức trai nấu bánh chưng bánh giầy' },
  { a: 'dapde', b: 'chantrau', to: 'ongdung', why: 'đắp đê + chăn trâu: người khổng lồ Ông Đùng' },
  { a: 'thogom', b: 'chantrau', to: 'thocong', why: 'bếp đất + ngõ xóm: Thổ Công giữ nhà' },
  { a: 'langlieu', b: 'thocong', to: 'auco', why: 'lễ vật đất trời + thần đất: Mẹ Âu Cơ' },
  { a: 'ongdung', b: 'lachau', to: 'trutroi', why: 'người khổng lồ + sức bộ Lạc: Thần Trụ Trời' },
  { a: 'lachau', b: 'langlieu', to: 'tanvien', why: 'thủ lĩnh bộ Lạc + lễ vật dâng vua: Sơn Tinh' },
  { a: 'thocong', b: 'ongdung', to: 'maudia', why: 'thần đất + người gánh núi: Mẫu Địa' },
  // v101: HÀNH KIM ghép cùng hành
  { a: 'chuongdong', b: 'lactuong', to: 'trongdong', why: 'chuông đồng + tướng Lạc gọi Thần Trống Đồng' },
  { a: 'xathu', b: 'giaodong', to: 'caolo', why: 'tay nỏ + giáo đồng thành người chế nỏ thần' },
  { a: 'lactuong', b: 'giaodong', to: 'nghedong', why: 'hai dũng sĩ đồng canh đình: Nghê Đồng' },
  { a: 'xathu', b: 'chuongdong', to: 'mychau', why: 'cung tên + chuông đồng thành Mỵ Châu' },
  { a: 'caolo', b: 'trongdong', to: 'kimquy', why: 'nỏ thần + trống đồng: Thần Kim Quy' },
  { a: 'caolo', b: 'mychau', to: 'adv', why: 'nỏ thần + công chúa: An Dương Vương' },
  { a: 'nghedong', b: 'trongdong', to: 'kylan', why: 'linh thú + trống trời: Kỳ Lân Vàng' },
  { a: 'nghedong', b: 'mychau', to: 'thienloi', why: 'linh thú + lông ngỗng trắng gọi Thiên Lôi' },
  // v101: HÀNH MỘC ghép cùng hành
  { a: 'thosan', b: 'tre', to: 'thachsanh', why: 'tay rừng + gậy tre thành chàng tiều phu' },
  { a: 'thosan', b: 'ongthoi', to: 'thansan', why: 'hai thợ săn núi rừng: Thần Săn Ba Vì' },
  { a: 'tre', b: 'ongthoi', to: 'sodua', why: 'tre làng + rừng núi: chàng Sọ Dừa' },
  { a: 'thansan', b: 'antiem', to: 'mau', why: 'rừng thiêng + vườn trái: Mẫu Thượng Ngàn' },
  { a: 'thachsanh', b: 'sodua', to: 'cuoi', why: 'tiều phu + vỏ dừa thần: Chú Cuội' },
  { a: 'antiem', b: 'sodua', to: 'melua', why: 'dưa hấu + dừa xanh nuôi mùa lúa: Mẹ Lúa' },
  { a: 'caong', b: 'cdt', to: 'mauthoai', why: 'cá thần + đầm Nhất Dạ: Mẫu Thoải' },
  { a: 'thansan', b: 'thachsanh', to: 'ongho', why: 'thần săn + dũng sĩ rừng: Chúa Sơn Lâm' },
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
// v86: tướng Tím / Vàng phải MUA bằng Ngân khố (lưu theo tài khoản) mới hợp thể / thăng thần ra được trong trận
const OWN_COST = { epic: 1200, legendary: 3000 };
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
  // v78: cửa hàng trước trận (trả bằng Ngân khố): Huyền thoại hiếm (3%) và đắt
  prepPrice: { common: 80, rare: 240, epic: 800, legendary: 3500 },
  prepWeights: [45, 36, 16, 3],
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
                recipe: { parts: ['mat_trong', 'dui_trong', 'bua_chim_lac'], cost: 1200 },
                stats: { damage: 10, hp: 150 }, hasteAura: 20, look: { aura: '#F2D27A' },
                desc: 'Hào quang: tăng 20% tốc đánh cho các tướng đứng xung quanh' },
  song_riu:   { name: 'Song Rìu Cuồng Nộ', slot: 'acc', rarity: 'epic',
                recipe: { parts: ['vuot_ho', 'gang_da'], cost: 150 },
                stats: { damage: 22, haste: 25, cleave: 0.25 }, look: { aura: '#e74c3c' } },
  gay_tam_gioi: { name: 'Gậy Tam Giới', slot: 'acc', rarity: 'legendary',
                recipe: { parts: ['gay_thoi_khong', 'dai', 'dep_co'], cost: 1200 },
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
  // v78: đồ Huyền thoại mới — chỉ đúc được từ 2 món Sử thi đã đúc + nhiều vàng
  ngoc_minh_chau: { name: 'Ngọc Minh Châu', slot: 'acc', rarity: 'legendary',
                recipe: { parts: ['ngoc_tran_thuy', 'gay_thoi_khong'], cost: 1800 }, stats: { int: 20, mpen: 25, range: 30, cdr: 10 },
                desc: 'Viên ngọc sáng của biển: phép xuyên kháng, hồi chiêu nhanh', look: { aura: '#9EDDF2' } },
  vuot_kim_quy: { name: 'Vuốt Kim Quy', slot: 'acc', rarity: 'legendary',
                recipe: { parts: ['cung_mat_chim', 'mui_sung'], cost: 1800 }, stats: { agi: 20, crit: 20, pierce: 20, range: 25 },
                desc: 'Vuốt rùa thần làm lẫy nỏ: chí mạng và xuyên giáp cao', look: { aura: '#F2D27A' } },
  rui_than:   { name: 'Rìu Thần Thạch Sanh', slot: 'acc', rarity: 'legendary',
                recipe: { parts: ['song_riu', 'riu_quet'], cost: 1800 }, stats: { str: 20, damage: 30, cleave: 30 },
                desc: 'Rìu thiên thần trao: chém lan rất mạnh', look: { aura: '#FF9A3A' } },
  ao_long_vu: { name: 'Áo Lông Vũ Âu Cơ', slot: 'acc', rarity: 'legendary',
                recipe: { parts: ['ao_vay_ca', 'giap_bat_diet'], cost: 1800 }, stats: { hp: 450, dr: 15, regen: 8 },
                desc: 'Áo lông tiên: rất trâu, tự hồi máu', look: { aura: '#F7EEF2' } },
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
  auco: 'tho', cdt: 'thuy', tiendung: 'hoa', langlieu: 'tho', lachau: 'tho', thansan: 'moc', adv: 'kim', mau: 'moc',
  thoren: 'hoa', nguphu: 'thuy', thogom: 'tho', thaylang: 'moc', trongdong: 'kim', caong: 'thuy', ongtao: 'hoa',
  matroi: 'hoa', mauthoai: 'thuy', trutroi: 'tho', ongho: 'moc',
  dotnuong: 'hoa', denroi: 'hoa', potaoapui: 'hoa', baahoa: 'hoa', kinhduong: 'hoa', viemde: 'hoa',
  chodo: 'thuy', haisen: 'thuy', lyngu: 'thuy', truongchi: 'thuy', halong: 'thuy', longnu: 'thuy',
  dapde: 'tho', chantrau: 'tho', ongdung: 'tho', thocong: 'tho', tanvien: 'tho', maudia: 'tho',
  giaodong: 'kim', chuongdong: 'kim', nghedong: 'kim', mychau: 'kim', kylan: 'kim', thienloi: 'kim',
  tre: 'moc', ongthoi: 'moc', sodua: 'moc', cuoi: 'moc', melua: 'moc' };
for (const id in HERO_EL) HEROES[id].el = HERO_EL[id];
// v101: màu chủ đạo của tướng = màu ngũ hành (giao diện + hình gen)
const EL_HERO_COLOR = { kim: '#D9DDE0', moc: '#5FB84A', thuy: '#5AB4D6', hoa: '#E0452C', tho: '#C99A3C' };
for (const id in HEROES) if (HEROES[id].el) HEROES[id].color = EL_HERO_COLOR[HEROES[id].el];
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
  'h.lactuong':  { hero: 'lactuong', hint: 'Rìu cần người gánh núi', desc: 'Đứng kề Lực Sĩ Núi: Bổ Rìu Đồng choáng thêm 0,5 giây' },
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
  'r.gay_tam_gioi':  { item: 'gay_tam_gioi', hint: 'Ba cõi hợp một', desc: 'Có tướng của 3 hành khác nhau trên sân: +5 mọi thuộc tính nữa' },
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
  if (n > lv.waves && n % 10 === 0) { const B = endlessBosses(); return B[(n / 10 + (level || 0)) % B.length]; }
  return null;
}
// v70: chơi vô tận — mỗi 10 đợt đổi sang quân của một chương khác, boss lấy từ mọi chương
function endlessBosses() {
  if (typeof ROSTERS === 'undefined') return BOSS_ORDER;
  const out = [];
  for (const lv of LEVELS) for (const id of Object.values(lv.bosses || {})) if (!out.includes(id)) out.push(id);
  return out.length ? out : BOSS_ORDER;
}
function rosterFor(n, level) {
  const lv = LEVELS[level || 0] || {};
  const own = lv.roster || 'thuy';
  if (typeof ROSTERS === 'undefined') return null;
  if (!lv.waves || n <= lv.waves) return ROSTERS[own];
  const keys = Object.keys(ROSTERS);
  const k = Math.floor((n - lv.waves - 1) / 10) + 1;          // đợt vô tận 1–10: chương kế tiếp, 11–20: chương sau nữa…
  return ROSTERS[keys[(keys.indexOf(own) + k) % keys.length]];
}
const waveKind = (n, level) => (bossAt(n, level) ? 'boss'
  : AIR_WAVES.includes(n) || (n > 27 && (n % 10 === 4 || n % 10 === 7)) ? 'air' : n % 10 === 5 ? 'champion' : 'normal');

function buildWave(n, level) {
  const list = [];
  const e = effWave(n, level);
  const count = 8 + Math.floor(e * 1.6);
  const kind = waveKind(n, level);
  // v48: quân theo chương (ROSTERS trong enemies2.js); mặc định quân Thủy Tinh
  const ro = rosterFor(n, level);
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

// ===== v91: BẢNG ẤN PHÙ (rune tài khoản) =====
// 3 nhánh × 12 ấn = 36. Mỗi nhánh: 3 hàng chỉ số (tối đa 5 cấp) + 1 hàng 3 ấn kỹ năng (tối đa 3 cấp).
// Mua bằng Ngân khố, áp cho mọi tướng trong mọi trận. Hàng sau mở khi nhánh đã đủ điểm.
const RUNE_BRANCHES = [
  { id: 'nui', name: 'Ấn Núi', sub: 'sức mạnh · bền bỉ', color: '#D9844A' },
  { id: 'gio', name: 'Ấn Gió', sub: 'tốc độ · chí mạng', color: '#6FCB8A' },
  { id: 'sam', name: 'Ấn Sấm', sub: 'phép thuật · năng lượng', color: '#7FA8F0' },
];
const RUNE_ROW_NEED = [0, 4, 10, 18];          // điểm đã đặt trong nhánh để mở hàng 1..4
const RUNE_ROW_COST = [40, 70, 110];           // giá mỗi cấp ấn chỉ số = giá hàng × cấp
const RUNE_SKILL_COST = [700, 1400, 2400];     // giá 3 cấp ấn kỹ năng
const RUNES = [
  // --- Ấn Núi
  { id: 'n_dmg', br: 'nui', row: 0, ic: '⚔', name: 'Lực Núi', max: 5, per: 2, stat: 'bonusDmgPct', fmt: (v) => `+${v}% sát thương` },
  { id: 'n_hp', br: 'nui', row: 0, ic: '❤', name: 'Gân Đá', max: 5, per: 3, stat: 'hpPct', fmt: (v) => `+${v}% máu tối đa` },
  { id: 'n_regen', br: 'nui', row: 0, ic: '✚', name: 'Suối Nguồn', max: 5, per: 0.4, stat: 'regen', fmt: (v) => `+${v.toFixed(1)} hồi máu / giây` },
  { id: 'n_pen', br: 'nui', row: 1, ic: '⛏', name: 'Phá Giáp', max: 5, per: 3, stat: 'pierce', fmt: (v) => `+${v}% xuyên giáp` },
  { id: 'n_dr', br: 'nui', row: 1, ic: '🛡', name: 'Da Đồng', max: 5, per: 1.5, stat: 'dr', fmt: (v) => `−${v}% sát thương nhận` },
  { id: 'n_boss', br: 'nui', row: 1, ic: '👹', name: 'Diệt Chúa', max: 5, per: 3, stat: 'bossPct', fmt: (v) => `+${v}% sát thương lên boss` },
  { id: 'n_thorn', br: 'nui', row: 2, ic: '🌵', name: 'Gai Đá', max: 5, per: 4, stat: 'thorns', fmt: (v) => `phản ${v}% sát thương nhận` },
  { id: 'n_stun', br: 'nui', row: 2, ic: '💫', name: 'Búa Tạ', max: 5, per: 1, stat: 'stunChance', fmt: (v) => `${v}% choáng 0,5 giây mỗi đòn` },
  { id: 'n_elite', br: 'nui', row: 2, ic: '☠', name: 'Săn Tướng', max: 5, per: 4, fx: 'eliteDmg', fmt: (v) => `+${v}% sát thương lên tinh anh, tướng địch` },
  { id: 'n_exec', br: 'nui', row: 3, ic: '🪨', name: 'Núi Đè', max: 3, per: [6, 9, 12], skill: true,
    fmt: (v) => `Đòn đánh hạ gục ngay quái thường còn dưới ${v}% máu` },
  { id: 'n_shield', br: 'nui', row: 3, ic: '⛰', name: 'Giáp Đá', max: 3, per: [10, 15, 20], skill: true,
    fmt: (v) => `Đầu mỗi đợt, mọi tướng nhận khiên ${v}% máu tối đa (8 giây)` },
  { id: 'n_quake', br: 'nui', row: 3, ic: '🌋', name: 'Đất Rung', max: 3, per: [8, 7, 6], skill: true,
    fmt: (v) => `Mỗi đòn thứ ${v}: chấn động quanh mục tiêu, 60% sát thương và làm chậm 30%` },
  // --- Ấn Gió
  { id: 'g_haste', br: 'gio', row: 0, ic: '💨', name: 'Gió Lướt', max: 5, per: 3, stat: 'haste', fmt: (v) => `+${v}% tốc đánh` },
  { id: 'g_crit', br: 'gio', row: 0, ic: '✦', name: 'Mắt Sắc', max: 5, per: 1, stat: 'crit', fmt: (v) => `+${v}% tỉ lệ chí mạng` },
  { id: 'g_range', br: 'gio', row: 0, ic: '🎯', name: 'Tầm Xa', max: 5, per: 2, stat: 'rangePct', fmt: (v) => `+${v}% tầm đánh` },
  { id: 'g_critd', br: 'gio', row: 1, ic: '💥', name: 'Đòn Hiểm', max: 5, per: 8, stat: 'critMult', mul: 0.01, fmt: (v) => `+${v}% sát thương chí mạng` },
  { id: 'g_air', br: 'gio', row: 1, ic: '🦅', name: 'Bắt Chim', max: 5, per: 4, stat: 'airPct', fmt: (v) => `+${v}% sát thương lên quái bay` },
  { id: 'g_slow', br: 'gio', row: 1, ic: '🌀', name: 'Gió Ngược', max: 5, per: 3, fx: 'slow', fmt: (v) => `đòn đánh làm chậm ${v}% trong 1 giây` },
  { id: 'g_gold', br: 'gio', row: 2, ic: '🪙', name: 'Gió Lộc', max: 5, per: 0.4, stat: 'goldOnKill', fmt: (v) => `+${v.toFixed(1)} vàng mỗi quái hạ` },
  { id: 'g_leech', br: 'gio', row: 2, ic: '🩸', name: 'Hút Sinh Lực', max: 5, per: 1.5, fx: 'leech', fmt: (v) => `hồi máu bằng ${v}% sát thương gây ra` },
  { id: 'g_cc', br: 'gio', row: 2, ic: '🪤', name: 'Thừa Thắng', max: 5, per: 4, fx: 'ccDmg', fmt: (v) => `+${v}% sát thương lên quái đang chậm / choáng` },
  { id: 'g_storm', br: 'gio', row: 3, ic: '🌪', name: 'Gió Lốc', max: 3, per: [1, 2, 3], skill: true,
    fmt: (v) => `Đòn chí mạng bắn thêm ${v} lưỡi gió vào quái gần (60% sát thương)` },
  { id: 'g_frenzy', br: 'gio', row: 3, ic: '⚡', name: 'Nhanh Như Gió', max: 3, per: [4, 6, 8], skill: true,
    fmt: (v) => `Hạ quái: +${v}% tốc đánh 3 giây, cộng dồn 5 lần` },
  { id: 'g_eye', br: 'gio', row: 3, ic: '👁', name: 'Mắt Ưng', max: 3, per: [0, 25, 50], skill: true,
    fmt: (v) => `Đòn đầu tiên trúng mỗi quái luôn chí mạng${v ? ` (+${v}% sát thương chí mạng)` : ''}` },
  // --- Ấn Sấm
  { id: 's_power', br: 'sam', row: 0, ic: '✺', name: 'Linh Lực', max: 5, per: 3, stat: 'skillPct', fmt: (v) => `+${v}% sức mạnh kỹ năng` },
  { id: 's_cdr', br: 'sam', row: 0, ic: '⏳', name: 'Thời Khắc', max: 5, per: 2, stat: 'cdr', fmt: (v) => `−${v}% hồi chiêu` },
  { id: 's_mregen', br: 'sam', row: 0, ic: '💧', name: 'Mạch Linh', max: 5, per: 6, fx: 'manaRegen', fmt: (v) => `+${v}% hồi năng lượng` },
  { id: 's_mpen', br: 'sam', row: 1, ic: '🔮', name: 'Xuyên Phép', max: 5, per: 3, stat: 'mpen', fmt: (v) => `+${v}% xuyên kháng phép` },
  { id: 's_mres', br: 'sam', row: 1, ic: '🧿', name: 'Bùa Hộ Mệnh', max: 5, per: 3, stat: 'magicRes', fmt: (v) => `−${v}% sát thương phép nhận` },
  { id: 's_mmax', br: 'sam', row: 1, ic: '🔋', name: 'Bình Linh', max: 5, per: 12, fx: 'maxMana', fmt: (v) => `+${v} năng lượng tối đa` },
  { id: 's_dot', br: 'sam', row: 2, ic: '🔥', name: 'Lửa Độc', max: 5, per: 6, fx: 'dot', fmt: (v) => `+${v}% sát thương thiêu đốt / độc` },
  { id: 's_kmana', br: 'sam', row: 2, ic: '🌙', name: 'Hút Hồn', max: 5, per: 2, fx: 'killMana', fmt: (v) => `hạ quái hồi ${v} năng lượng` },
  { id: 's_free', br: 'sam', row: 2, ic: '🎐', name: 'Phúc Thần', max: 5, per: 2, fx: 'freeCast', fmt: (v) => `${v}% dùng chiêu không tốn năng lượng` },
  { id: 's_chain', br: 'sam', row: 3, ic: '🌩', name: 'Sấm Truyền', max: 3, per: [8, 11, 14], skill: true,
    fmt: (v) => `${v}% mỗi đòn phóng sét lan 3 quái (50% sát thương phép)` },
  { id: 's_soul', br: 'sam', row: 3, ic: '💀', name: 'Hồn Nổ', max: 3, per: [8, 12, 16], skill: true,
    fmt: (v) => `Quái bị hạ nổ tung, gây ${v}% máu tối đa của nó lên quái xung quanh` },
  { id: 's_echo', br: 'sam', row: 3, ic: '🔔', name: 'Vang Vọng', max: 3, per: [15, 22, 30], skill: true,
    fmt: (v) => `${v}% dùng chiêu được hoàn lại 50% năng lượng` },
];
const RUNE_BY = Object.fromEntries(RUNES.map((r) => [r.id, r]));
const runeVal = (r, lv) => !lv ? 0 : Array.isArray(r.per) ? r.per[lv - 1] : +(r.per * lv).toFixed(2);
const runeCost = (r, lv) => r.skill ? RUNE_SKILL_COST[lv - 1] : RUNE_ROW_COST[r.row] * lv;   // giá cũ (bằng Ngân khố, v91) — chỉ dùng để hoàn tiền
const runeBranchPts = (lvs, br) => RUNES.reduce((a, r) => a + (r.br === br ? lvs[r.id] || 0 : 0), 0);
// v95: Ấn Phù RIÊNG TỪNG TƯỚNG, khắc bằng điểm Tu Vi (không dùng Ngân khố). Ấn chỉ số 1 điểm / cấp, ấn kỹ năng 3 điểm / cấp.
const runePt = (r) => (r.skill ? 3 : 1);
const runeSpent = (lvs) => RUNES.reduce((a, r) => a + (lvs && lvs[r.id] || 0) * runePt(r), 0);
function runeFxOf(lvs) {
  const fx = { stat: {}, fx: {}, sk: {} };
  for (const r of RUNES) {
    const lv = (lvs && lvs[r.id]) || 0;
    if (!lv) continue;
    const v = runeVal(r, lv);
    if (r.skill) fx.sk[r.id] = v;
    else if (r.stat) fx.stat[r.stat] = (fx.stat[r.stat] || 0) + v * (r.mul || 1);
    else fx.fx[r.fx] = (fx.fx[r.fx] || 0) + v;
  }
  return fx;
}
// hiệu lực ấn trong trận theo loại tướng (null = không có ấn: bot mô phỏng, chế độ thử)
let RUNE_MAP = null;
function setRunes(map) {
  if (!map) { RUNE_MAP = null; return; }
  RUNE_MAP = {};
  for (const t in map) RUNE_MAP[t] = runeFxOf(map[t]);
}
const runeFx = (h) => (RUNE_MAP && h ? RUNE_MAP[h.type] || null : null);

// ===== v95: TU VI — cấp tướng ngoài trận (theo tài khoản), lên bằng số quái tướng đó hạ =====
// "Cấp" trong trận vẫn như cũ (mất khi hết trận); Tu Vi giữ mãi, mỗi bậc cho 3 điểm Ấn Phù cho chính tướng đó.
const TUVI_RANKS = ['Tân Binh', 'Dũng Sĩ', 'Hiệp Sĩ', 'Tráng Sĩ', 'Tướng Quân', 'Đại Tướng', 'Danh Tướng', 'Thần Tướng', 'Thánh Tướng', 'Bất Tử'];
const TUVI_XP = [0, 30, 80, 160, 280, 450, 680, 980, 1380, 1900];      // Tu Vi tích lũy để đạt bậc 1..10
const TUVI_PTS = 3;                                                      // điểm Ấn mỗi bậc
const TUVI_KILL = { normal: 1, elite: 3, big: 8, boss: 25 };            // Tu Vi mỗi quái hạ (tướng ghép chia 50% cho tướng nguyên liệu)
const TUVI_LOSE = 0.6;                                                   // thua / bỏ trận: nhận 60%
const tuviLevel = (xp) => TUVI_XP.reduce((a, need, i) => ((xp || 0) >= need ? i + 1 : a), 1);
const tuviRank = (xp) => TUVI_RANKS[tuviLevel(xp) - 1];
const tuviPoints = (xp) => tuviLevel(xp) * TUVI_PTS;
const tuviNext = (xp) => { const l = tuviLevel(xp); return l >= TUVI_XP.length ? null : TUVI_XP[l]; };

// v92: gợi ý tướng khắc chế cho mỗi ải (theo hành của quái, quái bay, giáp dày, quái nhanh)
// v98: tách phần tính theo bộ quái để dùng cả cho chế độ vô tận (khi sang bộ quái mới)
const ROSTER_NAMES = { thuy: 'Thủy quân Thủy Tinh', rung: 'Yêu tinh rừng Chằn Tinh', hang: 'Hang Đại Bàng', an: 'Giặc Ân',
  bien: 'Thủy quái Biển Đông', trieu: 'Quân Triệu Đà' };
const rosterKeyOf = (R) => (typeof ROSTERS === 'undefined' ? null : Object.keys(ROSTERS).find((k) => ROSTERS[k] === R) || null);
function rosterCounters(R, bosses, pool, hint) {
  const foes = [...new Set([...(bosses || []), ...(R ? [R.base, R.air, R.champ, ...(R.fast || []), ...R.list.map((x) => x[2])] : [])])]
    .filter((k) => k && ENEMIES[k]);
  const tally = {};
  for (const k of foes) { const el = ENEMIES[k].el; if (el) tally[el] = (tally[el] || 0) + (ENEMIES[k].boss ? 3 : 1); }
  const main = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0] || null;
  const ce = main ? EL_ORDER.find((c) => EL_KHAC[c] === main) : null;
  const out = [];
  const add = (t, why) => { if (t && !out.some((o) => o.t === t) && out.length < 4) out.push({ t, why }); };
  if (ce) {
    const els = pool.filter((t) => HEROES[t].el === ce);
    add(els.find((t) => !HEROES[t].legend), `khắc hành ${ELEMENTS[main].name}`);
    add(els.find((t) => HEROES[t].legend), `khắc hành ${ELEMENTS[main].name}`);
  }
  if (foes.some((k) => ENEMIES[k].flying)) add(pool.find((t) => HEROES[t].legend && HEROES[t].attack === 'arrow') || 'xathu', 'bắn quái bay');
  if (foes.some((k) => ENEMIES[k].armor >= 10)) add(pool.find((t) => HEROES[t].legend && HEROES[t].dmgType === 'magic') || 'thaymo', 'phép xuyên giáp dày');
  if (R && R.fast && R.fast.length) add('thansuong', 'làm chậm quái nhanh');
  for (const t of hint || []) add(t, 'hợp bản đồ');
  return { main, ce, list: out, foes };
}
function levelCounters(i, owned) {
  const lv = LEVELS[i] || {};
  const R = typeof ROSTERS !== 'undefined' ? ROSTERS[lv.roster || 'thuy'] : null;
  const pool = [...summonPool(i), ...LEGEND_HEROES.filter((t) => !owned || owned.has(t))];
  return rosterCounters(R, Object.values(lv.bosses || {}), pool, lv.hint);
}

// ===== v92: THẦN KHÍ — mỗi tướng Vàng có 3 hệ thống nâng cấp riêng mang bản sắc hành của mình =====
// Mỗi hệ 5 cấp: cấp nào cũng cộng chỉ số; cấp 3 và cấp 5 mở hiệu ứng riêng. Mua bằng Ngân khố, lưu theo tài khoản.
// Hiệu ứng (fx): burnHit đốt · splashHit đòn lan · stunEvery choáng mỗi n đòn · chainHit sét lan · slowHit làm chậm ·
// manaOnHit hồi năng lượng mỗi đòn · lowHpDr giảm sát thương khi máu thấp · reviveOnce hồi sinh mỗi đợt ·
// waveShield khiên đầu đợt · healAura hồi máu đồng đội mỗi 5 giây. (stat: cộng thẳng vào chỉ số)
const LEGACY_COST = [400, 700, 1100, 1600, 2400];
const LEGACY_MAX = 5;
const LEGACY = {
  giong: [
    { id: 'giap', name: 'Giáp Sắt', ic: '🛡', desc: 'Bộ giáp sắt vua Hùng rèn cho cậu bé làng Phù Đổng',
      per: { hpPct: 8, dr: 2 }, ms: [{ lv: 3, fx: 'lowHpDr', v: 25, t: 'Máu dưới 40%: giảm thêm 25% sát thương nhận' }, { lv: 5, fx: 'reviveOnce', v: 40, t: 'Gục lần đầu mỗi đợt: đứng dậy với 40% máu' }] },
    { id: 'gay', name: 'Gậy Tre Đằng Ngà', ic: '🎋', desc: 'Roi sắt gãy, nhổ bụi tre làng quật giặc',
      per: { bonusDmgPct: 6, cleave: 0.04 }, ms: [{ lv: 3, fx: 'stunEvery', v: 6, t: 'Mỗi đòn thứ 6 choáng mục tiêu 0,8 giây' }, { lv: 5, fx: 'splashHit', v: 40, t: 'Quét tre: mỗi đòn lan 40% sát thương quanh mục tiêu' }] },
    { id: 'ngua', name: 'Ngựa Sắt', ic: '🐎', desc: 'Ngựa sắt phun lửa, vó in thành ao hồ',
      per: { haste: 5, rangePct: 3 }, ms: [{ lv: 3, fx: 'burnHit', v: 20, t: 'Ngựa phun lửa: đòn đánh thiêu đốt 20% sát thương/giây trong 3 giây' }, { lv: 5, stat: 'fireTrail', v: 0.3, t: 'Vó lửa: đòn đánh để lại vệt lửa trên sông' }] },
  ],
  llq: [
    { id: 'vay', name: 'Vảy Rồng', ic: '🐉', desc: 'Vảy rồng Lạc Việt, sóng nào cũng không xuyên thủng',
      per: { hpPct: 8, magicRes: 3 }, ms: [{ lv: 3, fx: 'waveShield', v: 20, t: 'Đầu mỗi đợt nhận khiên 20% máu' }, { lv: 5, fx: 'reviveOnce', v: 30, t: 'Gục lần đầu mỗi đợt: hóa rồng đứng dậy với 30% máu' }] },
    { id: 'kiem', name: 'Kiếm Thủy Long', ic: '🗡', desc: 'Thanh kiếm chém Ngư Tinh nơi biển Đông',
      per: { bonusDmgPct: 6, crit: 2 }, ms: [{ lv: 3, fx: 'chainHit', v: 15, t: '15% mỗi đòn: sóng sét lan 3 quái' }, { lv: 5, stat: 'critMult', v: 0.5, t: '+50% sát thương chí mạng' }] },
    { id: 'cung', name: 'Thủy Cung', ic: '🌊', desc: 'Long cung dưới biển, nơi rồng thiêng ngự',
      per: { skillPct: 5, cdr: 2 }, ms: [{ lv: 3, fx: 'slowHit', v: 20, t: 'Đòn đánh làm chậm 20% trong 1 giây' }, { lv: 5, fx: 'healAura', v: 4, t: 'Mỗi 5 giây hồi 4% máu cho tướng quanh mình' }] },
  ],
  kimquy: [
    { id: 'mai', name: 'Mai Thần', ic: '🐢', desc: 'Mai rùa vàng che chở thành Cổ Loa',
      per: { hpPct: 10, dr: 2 }, ms: [{ lv: 3, fx: 'waveShield', v: 25, t: 'Đầu mỗi đợt nhận khiên 25% máu' }, { lv: 5, stat: 'thorns', v: 30, t: 'Phản 30% sát thương nhận' }] },
    { id: 'mong', name: 'Móng Vàng', ic: '🪝', desc: 'Móng rùa thần trao làm lẫy nỏ',
      per: { pierce: 5, bonusDmgPct: 4 }, ms: [{ lv: 3, fx: 'stunEvery', v: 5, t: 'Mỗi đòn thứ 5 choáng mục tiêu 0,8 giây' }, { lv: 5, stat: 'bossPct', v: 30, t: '+30% sát thương lên boss' }] },
    { id: 'ho', name: 'Linh Khí Hồ Gươm', ic: '💠', desc: 'Linh khí hồ Tả Vọng, nơi rùa thần trở về',
      per: { skillPct: 5, regen: 1 }, ms: [{ lv: 3, fx: 'healAura', v: 3, t: 'Mỗi 5 giây hồi 3% máu cho tướng quanh mình' }, { lv: 5, fx: 'manaOnHit', v: 3, t: 'Mỗi đòn hồi 3 năng lượng' }] },
  ],
  adv: [
    { id: 'no', name: 'Nỏ Liên Châu', ic: '🏹', desc: 'Nỏ bắn một phát mười mũi tên',
      per: { haste: 5, bonusDmgPct: 4 }, ms: [{ lv: 3, stat: 'arrows', v: 1, t: 'Bắn thêm 1 mũi tên mỗi đòn' }, { lv: 5, stat: 'critMult', v: 0.4, t: '+40% sát thương chí mạng' }] },
    { id: 'thanh', name: 'Thành Ốc Cổ Loa', ic: '🏯', desc: 'Chín vòng thành xoắn ốc giữ nước Âu Lạc',
      per: { rangePct: 4, pierce: 4 }, ms: [{ lv: 3, fx: 'slowHit', v: 15, t: 'Đòn đánh làm chậm 15% trong 1 giây' }, { lv: 5, stat: 'airPct', v: 40, t: '+40% sát thương lên quái bay' }] },
    { id: 'ao', name: 'Long Bào Âu Lạc', ic: '👘', desc: 'Áo vua dựng nước, quân dân một lòng',
      per: { hpPct: 8, goldOnKill: 0.5 }, ms: [{ lv: 3, fx: 'waveShield', v: 15, t: 'Đầu mỗi đợt nhận khiên 15% máu' }, { lv: 5, stat: 'bossPct', v: 25, t: '+25% sát thương lên boss' }] },
  ],
  auco: [
    { id: 'boc', name: 'Bọc Trăm Trứng', ic: '🥚', desc: 'Bọc trứng nở trăm con, tổ tiên người Việt',
      per: { hpPct: 8, regen: 1 }, ms: [{ lv: 3, fx: 'healAura', v: 4, t: 'Mỗi 5 giây hồi 4% máu cho tướng quanh mình' }, { lv: 5, fx: 'reviveOnce', v: 35, t: 'Gục lần đầu mỗi đợt: đứng dậy với 35% máu' }] },
    { id: 'canh', name: 'Cánh Tiên', ic: '🪽', desc: 'Đôi cánh tiên nữ dòng Thần Nông',
      per: { skillPct: 6, cdr: 2 }, ms: [{ lv: 3, fx: 'manaOnHit', v: 2, t: 'Mỗi đòn hồi 2 năng lượng' }, { lv: 5, fx: 'chainHit', v: 20, t: '20% mỗi đòn: phấn tiên lan 3 quái' }] },
    { id: 'nui', name: 'Núi Mẹ', ic: '⛰', desc: 'Năm mươi con theo mẹ lên núi',
      per: { dr: 2, magicRes: 3 }, ms: [{ lv: 3, fx: 'stunEvery', v: 7, t: 'Mỗi đòn thứ 7 choáng mục tiêu 0,8 giây' }, { lv: 5, fx: 'splashHit', v: 35, t: 'Đòn đánh lan 35% sát thương quanh mục tiêu' }] },
  ],
  mau: [
    { id: 'rung', name: 'Rừng Thiêng', ic: '🌳', desc: 'Đại ngàn ba miền, nơi Mẫu cai quản',
      per: { hpPct: 6, regen: 1.2 }, ms: [{ lv: 3, fx: 'healAura', v: 5, t: 'Mỗi 5 giây hồi 5% máu cho tướng quanh mình' }, { lv: 5, fx: 'waveShield', v: 25, t: 'Đầu mỗi đợt nhận khiên 25% máu' }] },
    { id: 'day', name: 'Dây Leo Ngàn Năm', ic: '🌿', desc: 'Dây rừng quấn chặt chân giặc',
      per: { bonusDmgPct: 5, skillPct: 3 }, ms: [{ lv: 3, fx: 'slowHit', v: 25, t: 'Đòn đánh làm chậm 25% trong 1 giây' }, { lv: 5, fx: 'stunEvery', v: 6, t: 'Mỗi đòn thứ 6 trói chân mục tiêu 0,8 giây' }] },
    { id: 'hoa', name: 'Hoa Trái Sơn Lâm', ic: '🍃', desc: 'Hoa trái nuôi muôn dân, độc dược trị giặc',
      per: { goldOnKill: 0.5, skillPct: 3 }, ms: [{ lv: 3, fx: 'manaOnHit', v: 2, t: 'Mỗi đòn hồi 2 năng lượng' }, { lv: 5, fx: 'burnHit', v: 25, t: 'Độc hoa: đòn đánh gây độc 25% sát thương/giây trong 3 giây' }] },
  ],
};
Object.assign(LEGACY, {
  matroi: [
    { id: 'vang', name: 'Vầng Dương', ic: '☀', desc: 'Mặt trời nữ thần dắt qua bầu trời mỗi ngày',
      per: { bonusDmgPct: 6, crit: 2 }, ms: [{ lv: 3, fx: 'burnHit', v: 25, t: 'Đòn đánh thiêu đốt 25% sát thương/giây trong 3 giây' }, { lv: 5, stat: 'critMult', v: 0.5, t: '+50% sát thương chí mạng' }] },
    { id: 'qua', name: 'Quạ Lửa Ba Chân', ic: '🐦', desc: 'Quạ vàng ba chân sống trong mặt trời',
      per: { haste: 5, rangePct: 3 }, ms: [{ lv: 3, fx: 'chainHit', v: 15, t: '15% mỗi đòn: lửa lan 3 quái' }, { lv: 5, stat: 'airPct', v: 40, t: '+40% sát thương lên quái bay' }] },
    { id: 'xiem', name: 'Xiêm Y Ráng Chiều', ic: '👘', desc: 'Áo dệt từ ráng mây lúc hoàng hôn',
      per: { hpPct: 8, magicRes: 3 }, ms: [{ lv: 3, fx: 'waveShield', v: 20, t: 'Đầu mỗi đợt nhận khiên 20% máu' }, { lv: 5, fx: 'reviveOnce', v: 30, t: 'Gục lần đầu mỗi đợt: mặt trời mọc lại với 30% máu' }] },
  ],
  mauthoai: [
    { id: 'ngoc', name: 'Ngọc Thủy Cung', ic: '💧', desc: 'Viên ngọc trấn giữ long cung',
      per: { skillPct: 6, cdr: 2 }, ms: [{ lv: 3, fx: 'manaOnHit', v: 2, t: 'Mỗi đòn hồi 2 năng lượng' }, { lv: 5, fx: 'chainHit', v: 20, t: '20% mỗi đòn: nước lan 3 quái' }] },
    { id: 'song', name: 'Sóng Thánh', ic: '🌊', desc: 'Sóng dâng theo lệnh Thánh Mẫu',
      per: { bonusDmgPct: 5, rangePct: 3 }, ms: [{ lv: 3, fx: 'slowHit', v: 25, t: 'Đòn đánh làm chậm 25% trong 1 giây' }, { lv: 5, fx: 'stunEvery', v: 6, t: 'Mỗi đòn thứ 6 đóng băng mục tiêu 0,8 giây' }] },
    { id: 'sen', name: 'Đài Sen Trắng', ic: '🪷', desc: 'Đài sen Thánh Mẫu ngự giữa sông',
      per: { hpPct: 8, regen: 1 }, ms: [{ lv: 3, fx: 'healAura', v: 5, t: 'Mỗi 5 giây hồi 5% máu cho tướng quanh mình' }, { lv: 5, fx: 'waveShield', v: 25, t: 'Đầu mỗi đợt nhận khiên 25% máu' }] },
  ],
  trutroi: [
    { id: 'cot', name: 'Cột Đá Chống Trời', ic: '🗿', desc: 'Cột đá đắp cao tách trời khỏi đất',
      per: { hpPct: 10, dr: 2 }, ms: [{ lv: 3, fx: 'lowHpDr', v: 30, t: 'Máu dưới 40%: giảm thêm 30% sát thương nhận' }, { lv: 5, stat: 'thorns', v: 30, t: 'Phản 30% sát thương nhận' }] },
    { id: 'tay', name: 'Tay Đội Trời', ic: '✋', desc: 'Đôi tay khổng lồ nâng cả bầu trời',
      per: { bonusDmgPct: 6, cleave: 0.05 }, ms: [{ lv: 3, fx: 'stunEvery', v: 5, t: 'Mỗi đòn thứ 5 choáng mục tiêu 0,8 giây' }, { lv: 5, fx: 'splashHit', v: 40, t: 'Mỗi đòn lan 40% sát thương quanh mục tiêu' }] },
    { id: 'dat', name: 'Đất Mẹ', ic: '⛰', desc: 'Đất đá vụn rơi xuống thành núi đồi',
      per: { regen: 1.2, magicRes: 3 }, ms: [{ lv: 3, fx: 'waveShield', v: 25, t: 'Đầu mỗi đợt nhận khiên 25% máu' }, { lv: 5, fx: 'reviveOnce', v: 40, t: 'Gục lần đầu mỗi đợt: đứng dậy với 40% máu' }] },
  ],
  ongho: [
    { id: 'vuot', name: 'Vuốt Hổ', ic: '🐯', desc: 'Móng vuốt chúa sơn lâm',
      per: { bonusDmgPct: 6, crit: 2 }, ms: [{ lv: 3, stat: 'critMult', v: 0.4, t: '+40% sát thương chí mạng' }, { lv: 5, fx: 'splashHit', v: 35, t: 'Vồ lan 35% sát thương quanh mục tiêu' }] },
    { id: 'van', name: 'Vằn Rừng', ic: '🌿', desc: 'Bộ lông vằn ẩn mình giữa lau sậy',
      per: { haste: 5, regen: 1 }, ms: [{ lv: 3, fx: 'slowHit', v: 20, t: 'Đòn đánh làm chậm 20% trong 1 giây' }, { lv: 5, fx: 'manaOnHit', v: 3, t: 'Mỗi đòn hồi 3 năng lượng' }] },
    { id: 'nui', name: 'Núi Rừng Tây Bắc', ic: '⛰', desc: 'Lãnh địa ngàn dặm của Ông Ba Mươi',
      per: { hpPct: 8, dr: 2 }, ms: [{ lv: 3, fx: 'lowHpDr', v: 25, t: 'Máu dưới 40%: giảm thêm 25% sát thương nhận' }, { lv: 5, fx: 'reviveOnce', v: 35, t: 'Gục lần đầu mỗi đợt: đứng dậy với 35% máu' }] },
  ],
});
Object.assign(LEGACY, {
  kinhduong: [
    { id: 'kiem', name: 'Kiếm Xích Quỷ', ic: '⚔', desc: 'Thanh kiếm đỏ rực của vua nước Xích Quỷ',
      per: { bonusDmgPct: 6, crit: 2 }, ms: [{ lv: 3, fx: 'burnHit', v: 20, t: 'Đòn đánh thiêu đốt 20% sát thương/giây trong 3 giây' }, { lv: 5, fx: 'splashHit', v: 35, t: 'Mỗi đòn lan 35% sát thương quanh mục tiêu' }] },
    { id: 'ngai', name: 'Ngai Vàng Xích Quỷ', ic: '👑', desc: 'Ngai vua phương Nam, con cháu Thần Nông',
      per: { hpPct: 8, dr: 2 }, ms: [{ lv: 3, fx: 'waveShield', v: 20, t: 'Đầu mỗi đợt nhận khiên 20% máu' }, { lv: 5, fx: 'reviveOnce', v: 35, t: 'Gục lần đầu mỗi đợt: đứng dậy với 35% máu' }] },
    { id: 'ho', name: 'Hồ Động Đình', ic: '🌊', desc: 'Nơi vua gặp Long Nữ, mẹ của Lạc Long Quân',
      per: { regen: 1.2, skillPct: 5 }, ms: [{ lv: 3, fx: 'healAura', v: 4, t: 'Mỗi 5 giây hồi 4% máu cho tướng quanh mình' }, { lv: 5, fx: 'stunEvery', v: 6, t: 'Mỗi đòn thứ 6 choáng mục tiêu 0,8 giây' }] },
  ],
  viemde: [
    { id: 'lua', name: 'Lửa Thần Nông', ic: '🔥', desc: 'Ngọn lửa đầu tiên dạy dân nấu chín',
      per: { bonusDmgPct: 6, skillPct: 3 }, ms: [{ lv: 3, fx: 'burnHit', v: 25, t: 'Đòn đánh thiêu đốt 25% sát thương/giây trong 3 giây' }, { lv: 5, fx: 'chainHit', v: 20, t: '20% mỗi đòn: lửa lan 3 quái' }] },
    { id: 'cay', name: 'Cày Thần', ic: '🌾', desc: 'Lưỡi cày đầu tiên của người trồng lúa',
      per: { rangePct: 4, goldOnKill: 0.5 }, ms: [{ lv: 3, fx: 'slowHit', v: 20, t: 'Đòn đánh làm chậm 20% trong 1 giây' }, { lv: 5, stat: 'bossPct', v: 30, t: '+30% sát thương lên boss' }] },
    { id: 'thao', name: 'Bách Thảo', ic: '🌿', desc: 'Trăm thứ cỏ thuốc Thần Nông đã nếm',
      per: { hpPct: 8, regen: 1 }, ms: [{ lv: 3, fx: 'healAura', v: 4, t: 'Mỗi 5 giây hồi 4% máu cho tướng quanh mình' }, { lv: 5, fx: 'manaOnHit', v: 3, t: 'Mỗi đòn hồi 3 năng lượng' }] },
  ],
});
Object.assign(LEGACY, {
  halong: [
    { id: 'vay', name: 'Vảy Ngọc Rồng', ic: '💎', desc: 'Vảy rồng mẹ lấp lánh như ngọc',
      per: { hpPct: 10, dr: 2 }, ms: [{ lv: 3, fx: 'waveShield', v: 25, t: 'Đầu mỗi đợt nhận khiên 25% máu' }, { lv: 5, stat: 'thorns', v: 30, t: 'Phản 30% sát thương nhận' }] },
    { id: 'dao', name: 'Ngọc Thành Đảo', ic: '🏝', desc: 'Ngọc rồng phun ra hóa nghìn hòn đảo',
      per: { bonusDmgPct: 6, cleave: 0.05 }, ms: [{ lv: 3, fx: 'stunEvery', v: 6, t: 'Mỗi đòn thứ 6 choáng mục tiêu 0,8 giây' }, { lv: 5, fx: 'splashHit', v: 40, t: 'Mỗi đòn lan 40% sát thương quanh mục tiêu' }] },
    { id: 'vinh', name: 'Vịnh Hạ Long', ic: '🌊', desc: 'Nơi rồng mẹ hạ xuống giữ biển',
      per: { regen: 1.2, magicRes: 3 }, ms: [{ lv: 3, fx: 'slowHit', v: 20, t: 'Đòn đánh làm chậm 20% trong 1 giây' }, { lv: 5, fx: 'reviveOnce', v: 35, t: 'Gục lần đầu mỗi đợt: đứng dậy với 35% máu' }] },
  ],
  longnu: [
    { id: 'chau', name: 'Long Châu', ic: '🔮', desc: 'Viên ngọc rồng của Long Nữ',
      per: { skillPct: 6, cdr: 2 }, ms: [{ lv: 3, fx: 'manaOnHit', v: 2, t: 'Mỗi đòn hồi 2 năng lượng' }, { lv: 5, fx: 'chainHit', v: 20, t: '20% mỗi đòn: nước lan 3 quái' }] },
    { id: 'dong', name: 'Hồ Động Đình', ic: '🌊', desc: 'Hồ lớn nơi Long Nữ gặp Kinh Dương Vương',
      per: { bonusDmgPct: 5, rangePct: 3 }, ms: [{ lv: 3, fx: 'slowHit', v: 25, t: 'Đòn đánh làm chậm 25% trong 1 giây' }, { lv: 5, fx: 'stunEvery', v: 6, t: 'Mỗi đòn thứ 6 đóng băng mục tiêu 0,8 giây' }] },
    { id: 'mang', name: 'Xiêm Ngọc Long Cung', ic: '🐚', desc: 'Áo dệt từ ngọc trai dưới long cung',
      per: { hpPct: 8, regen: 1 }, ms: [{ lv: 3, fx: 'healAura', v: 4, t: 'Mỗi 5 giây hồi 4% máu cho tướng quanh mình' }, { lv: 5, fx: 'waveShield', v: 25, t: 'Đầu mỗi đợt nhận khiên 25% máu' }] },
  ],
});
Object.assign(LEGACY, {
  tanvien: [
    { id: 'nui', name: 'Núi Tản Viên', ic: '⛰', desc: 'Ngọn núi thiêng, nước dâng bao nhiêu núi cao bấy nhiêu',
      per: { hpPct: 10, dr: 2 }, ms: [{ lv: 3, fx: 'waveShield', v: 25, t: 'Đầu mỗi đợt nhận khiên 25% máu' }, { lv: 5, fx: 'reviveOnce', v: 40, t: 'Gục lần đầu mỗi đợt: đứng dậy với 40% máu' }] },
    { id: 'gay', name: 'Gậy Thần Dời Non', ic: '🦯', desc: 'Cây gậy phép dời đồi chuyển núi',
      per: { bonusDmgPct: 6, cleave: 0.05 }, ms: [{ lv: 3, fx: 'stunEvery', v: 5, t: 'Mỗi đòn thứ 5 choáng mục tiêu 0,8 giây' }, { lv: 5, fx: 'splashHit', v: 40, t: 'Mỗi đòn lan 40% sát thương quanh mục tiêu' }] },
    { id: 'le', name: 'Sính Lễ Vua Hùng', ic: '🐘', desc: 'Voi chín ngà, gà chín cựa, ngựa chín hồng mao',
      per: { haste: 5, regen: 1 }, ms: [{ lv: 3, fx: 'slowHit', v: 20, t: 'Đòn đánh làm chậm 20% trong 1 giây' }, { lv: 5, stat: 'bossPct', v: 30, t: '+30% sát thương lên boss' }] },
  ],
  maudia: [
    { id: 'dat', name: 'Mạch Đất', ic: '🌋', desc: 'Mạch đất nuôi muôn loài',
      per: { skillPct: 6, cdr: 2 }, ms: [{ lv: 3, fx: 'healAura', v: 5, t: 'Mỗi 5 giây hồi 5% máu cho tướng quanh mình' }, { lv: 5, fx: 'chainHit', v: 20, t: '20% mỗi đòn: đất nứt lan 3 quái' }] },
    { id: 're', name: 'Rễ Thiêng', ic: '🌳', desc: 'Rễ cây cổ thụ ăn sâu lòng đất',
      per: { bonusDmgPct: 5, rangePct: 3 }, ms: [{ lv: 3, fx: 'slowHit', v: 25, t: 'Đòn đánh làm chậm 25% trong 1 giây' }, { lv: 5, fx: 'stunEvery', v: 6, t: 'Mỗi đòn thứ 6 trói chân mục tiêu 0,8 giây' }] },
    { id: 'ngoc', name: 'Ngọc Địa Phủ', ic: '💠', desc: 'Viên ngọc giữ dưới lòng đất sâu',
      per: { hpPct: 8, magicRes: 3 }, ms: [{ lv: 3, fx: 'waveShield', v: 20, t: 'Đầu mỗi đợt nhận khiên 20% máu' }, { lv: 5, fx: 'manaOnHit', v: 3, t: 'Mỗi đòn hồi 3 năng lượng' }] },
  ],
});
Object.assign(LEGACY, {
  kylan: [
    { id: 'sung', name: 'Sừng Kỳ Lân', ic: '🦄', desc: 'Chiếc sừng xua tà, báo điềm lành',
      per: { bonusDmgPct: 6, crit: 2 }, ms: [{ lv: 3, fx: 'stunEvery', v: 6, t: 'Mỗi đòn thứ 6 choáng mục tiêu 0,8 giây' }, { lv: 5, fx: 'splashHit', v: 35, t: 'Mỗi đòn lan 35% sát thương quanh mục tiêu' }] },
    { id: 'vay', name: 'Vảy Vàng', ic: '✨', desc: 'Vảy vàng sáng như mặt trời mọc',
      per: { hpPct: 10, dr: 2 }, ms: [{ lv: 3, fx: 'waveShield', v: 25, t: 'Đầu mỗi đợt nhận khiên 25% máu' }, { lv: 5, fx: 'reviveOnce', v: 35, t: 'Gục lần đầu mỗi đợt: đứng dậy với 35% máu' }] },
    { id: 'may', name: 'Mây Lành', ic: '☁', desc: 'Mây ngũ sắc theo bước kỳ lân',
      per: { haste: 5, regen: 1 }, ms: [{ lv: 3, fx: 'slowHit', v: 20, t: 'Đòn đánh làm chậm 20% trong 1 giây' }, { lv: 5, stat: 'bossPct', v: 30, t: '+30% sát thương lên boss' }] },
  ],
  thienloi: [
    { id: 'bua', name: 'Búa Tầm Sét', ic: '🔨', desc: 'Lưỡi búa đá trời giáng xuống kẻ ác',
      per: { bonusDmgPct: 6, skillPct: 3 }, ms: [{ lv: 3, fx: 'stunEvery', v: 6, t: 'Mỗi đòn thứ 6 choáng mục tiêu 0,8 giây' }, { lv: 5, fx: 'burnHit', v: 25, t: 'Sét đốt 25% sát thương/giây trong 3 giây' }] },
    { id: 'may', name: 'Mây Giông', ic: '⛈', desc: 'Mây đen kéo theo mỗi lần thần nổi giận',
      per: { rangePct: 4, cdr: 2 }, ms: [{ lv: 3, fx: 'slowHit', v: 20, t: 'Đòn đánh làm chậm 20% trong 1 giây' }, { lv: 5, stat: 'airPct', v: 40, t: '+40% sát thương lên quái bay' }] },
    { id: 'giap', name: 'Giáp Thiên Đình', ic: '🛡', desc: 'Giáp trời Ngọc Hoàng ban cho',
      per: { hpPct: 8, magicRes: 3 }, ms: [{ lv: 3, fx: 'waveShield', v: 20, t: 'Đầu mỗi đợt nhận khiên 20% máu' }, { lv: 5, fx: 'manaOnHit', v: 3, t: 'Mỗi đòn hồi 3 năng lượng' }] },
  ],
  cuoi: [
    { id: 'da', name: 'Cây Đa Thần', ic: '🌳', desc: 'Cây đa có lá cải tử hoàn sinh',
      per: { hpPct: 10, regen: 1.2 }, ms: [{ lv: 3, fx: 'lowHpDr', v: 25, t: 'Máu dưới 40%: giảm thêm 25% sát thương nhận' }, { lv: 5, fx: 'waveShield', v: 25, t: 'Đầu mỗi đợt nhận khiên 25% máu' }] },
    { id: 'riu', name: 'Rìu Tiều Phu', ic: '🪓', desc: 'Lưỡi rìu Cuội đốn củi trong rừng',
      per: { bonusDmgPct: 6, crit: 2 }, ms: [{ lv: 3, stat: 'critMult', v: 0.4, t: '+40% sát thương chí mạng' }, { lv: 5, fx: 'splashHit', v: 35, t: 'Mỗi đòn lan 35% sát thương quanh mục tiêu' }] },
    { id: 'trang', name: 'Cung Trăng', ic: '🌙', desc: 'Nơi Cuội ngồi gốc cây đa nhìn xuống',
      per: { skillPct: 5, cdr: 2 }, ms: [{ lv: 3, fx: 'manaOnHit', v: 2, t: 'Mỗi đòn hồi 2 năng lượng' }, { lv: 5, fx: 'slowHit', v: 25, t: 'Đòn đánh làm chậm 25% trong 1 giây' }] },
  ],
  melua: [
    { id: 'bong', name: 'Bông Lúa Vàng', ic: '🌾', desc: 'Bông lúa trĩu hạt mùa gặt',
      per: { skillPct: 6, goldOnKill: 0.5 }, ms: [{ lv: 3, fx: 'healAura', v: 4, t: 'Mỗi 5 giây hồi 4% máu cho tướng quanh mình' }, { lv: 5, fx: 'chainHit', v: 20, t: '20% mỗi đòn: thóc lan 3 quái' }] },
    { id: 'dong', name: 'Cánh Đồng Mẹ', ic: '🌱', desc: 'Đồng lúa bát ngát nuôi muôn nhà',
      per: { bonusDmgPct: 5, rangePct: 3 }, ms: [{ lv: 3, fx: 'slowHit', v: 25, t: 'Đòn đánh làm chậm 25% trong 1 giây' }, { lv: 5, fx: 'stunEvery', v: 6, t: 'Mỗi đòn thứ 6 trói mục tiêu 0,8 giây' }] },
    { id: 'com', name: 'Nồi Cơm Mới', ic: '🍚', desc: 'Nồi cơm gạo mới thơm cả xóm',
      per: { hpPct: 8, regen: 1 }, ms: [{ lv: 3, fx: 'waveShield', v: 20, t: 'Đầu mỗi đợt nhận khiên 20% máu' }, { lv: 5, fx: 'manaOnHit', v: 3, t: 'Mỗi đòn hồi 3 năng lượng' }] },
  ],
});
const LEGACY_STAT = { hpPct: '% máu', dr: '% giảm sát thương nhận', bonusDmgPct: '% sát thương', cleave: ' lan đòn', haste: '% tốc đánh',
  rangePct: '% tầm đánh', magicRes: '% kháng phép', crit: '% chí mạng', skillPct: '% sức mạnh kỹ năng', cdr: '% giảm hồi chiêu',
  pierce: '% xuyên giáp', regen: ' hồi máu / giây', goldOnKill: ' vàng mỗi quái hạ' };
const legacyPerText = (sys, lv) => Object.entries(sys.per).map(([k, v]) => {
  const x = v * lv; return k === 'cleave' ? `+${Math.round(x * 100)}% lan đòn` : `+${+x.toFixed(1)}${LEGACY_STAT[k]}`; }).join(', ');
// cấp thần khí trong trận (null = không áp: bot mô phỏng)
let LEGACY_LV = null;
function setLegacy(map) { LEGACY_LV = map || null; }
