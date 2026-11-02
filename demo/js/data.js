// DEMO "NEON GRID — Merge Defense" (cyberpunk) — dữ liệu unit, quái, boss. Game nguyên bản theo thể loại merge defense.
'use strict';
// phe / nguyên tố cyber: màu neon chính (mau), màu tối (toi), màu sáng (sang)
const HANH = {
  Plasma:  { mau: '#ff6a2a', toi: '#3a1206', sang: '#ffd2a8', ten: 'PLASMA' },
  Cryo:    { mau: '#5ee7ff', toi: '#06303a', sang: '#dffaff', ten: 'CRYO' },
  Voltage: { mau: '#ffe24a', toi: '#3a3006', sang: '#fff8c8', ten: 'VOLTAGE' },
  Laser:   { mau: '#ff3c8e', toi: '#3a0620', sang: '#ffc8de', ten: 'LASER' },
  Void:    { mau: '#a35cff', toi: '#1e0a3a', sang: '#e2ccff', ten: 'VOID' },
  Nanite:  { mau: '#4d8dff', toi: '#081a3a', sang: '#cfe0ff', ten: 'NANITE' },
  Hack:    { mau: '#00ffa3', toi: '#003a26', sang: '#c8ffe8', ten: 'HACK' },
  Toxin:   { mau: '#b4ff2a', toi: '#2a3a06', sang: '#ecffc8', ten: 'TOXIN' },
};
// ảnh mới (nếu người dùng thả vào demo/assets/units/<id>.png) được ưu tiên; không có thì vẽ procedural bằng canvas
const TUONG = {
  scorch: { tip: [60, 36], ten: 'SCORCH', hanh: 'Plasma', kieu: 'Burn', mo: 'Plasma jets set targets ablaze — damage over time.', dmg: 9, cd: 0.9 },
  frost:  { tip: [44, 26], ten: 'FROST', hanh: 'Cryo', kieu: 'Slow', mo: 'Cryo bursts hit an area and slow everything inside.', dmg: 6, cd: 1.0 },
  arc:    { tip: [32, 12], ten: 'ARC', hanh: 'Voltage', kieu: 'Chain', mo: 'Lightning jumps between nearby enemies.', dmg: 8, cd: 1.1 },
  lance:  { tip: [63, 34], ten: 'LANCE', hanh: 'Laser', kieu: 'Sniper', mo: 'Locks on the toughest target. x2.5 damage to bosses.', dmg: 20, cd: 1.6 },
  warp:   { tip: [32, 26], ten: 'WARP', hanh: 'Void', kieu: 'Boost', mo: 'Time-dilation field: adjacent units attack faster.', dmg: 4, cd: 1.0 },
  miner:  { tip: [60, 35], ten: 'MINER', hanh: 'Nanite', kieu: 'Credits', mo: 'Mines Energy over time, bonus Energy on kills.', dmg: 5, cd: 1.0 },
  glitch: { tip: [56, 37], ten: 'GLITCH', hanh: 'Hack', kieu: 'EMP', mo: 'EMP shots can stun and mark targets to take more damage.', dmg: 12, cd: 1.2 },
  venom:  { tip: [52, 23], ten: 'VENOM', hanh: 'Toxin', kieu: 'Multi', mo: 'Fires toxic needles at several enemies at once.', dmg: 7, cd: 0.8 },
};
const TUONG_IDS = Object.keys(TUONG);
const BO_MAC_DINH = ['scorch', 'frost', 'arc', 'lance', 'glitch'];

const QUAI = {
  thuong: { ten: 'DRONE', hp: 1, spd: 52, thuong: 3, co: 34 },
  nhanh:  { ten: 'SKITTER', hp: 0.6, spd: 92, thuong: 3, co: 31 },
  trau:   { ten: 'BULWARK', hp: 3.2, spd: 34, thuong: 7, co: 40 },
};
// mỗi 10 đợt một boss, xoay vòng; kỹ năng: hoada (khoá unit), doicho (xáo lưới), hoimau (hồi giáp)
const BOSS = [
  { id: 'firewall', ten: 'FIREWALL', kn: 'hoada', knTen: 'LOCKDOWN', mo: 'Locks units — they cannot fire for a while', cd: 6, mau: '#ff3b3b' },
  { id: 'overclock', ten: 'OVERCLOCK', kn: 'doicho', knTen: 'SCRAMBLE', mo: 'Scrambles the grid, swapping unit positions', cd: 5, mau: '#ffb31a' },
  { id: 'corruptor', ten: 'CORRUPTOR', kn: 'hoimau', knTen: 'REPAIR', mo: 'Restores its armor and patches nearby enemies', cd: 4, mau: '#c04dff' },
];
const CAU_HINH = {
  W: 844, H: 390, COT: 5, HANG: 3, O: 64, KHE: 6,
  SAO_MAX: 7, BAC_MAX: 5, MANG: 3, LK_DAU: 100,
  giaTrieu: (n) => 10 + 6 * n,                         // giá Summon lần thứ n (n = số lần đã triệu)
  giaBac: (b) => [80, 160, 300, 500, 800][b],          // giá nâng cấp b → b+1
  heSoSao: (s) => Math.pow(2.2, s - 1),
  heSoBac: (b) => 1 + 0.4 * b,
  mauDot: (w) => 18 * Math.pow(1.21, w - 1) * (1 + 0.03 * w),
};
