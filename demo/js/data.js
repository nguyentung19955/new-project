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
// tướng (hero) cyberpunk hình người; ảnh mới (nếu người dùng thả vào demo/assets/units/<id>.png) được ưu tiên; không có thì vẽ procedural bằng canvas
// kỹ năng theo docs/demo-hop-tuong/tu-van-chatgpt-ky-nang.txt (ChatGPT thiết kế, 02/11/2026): kieu = tên nội tại, dmg/cd ở 1 sao; tam = tầm bắn (px, từ tâm ô) theo docs/demo-hop-tuong/tu-van-chatgpt-tam-ban.txt
const TUONG = {
  scorch: { tip: [57, 38], tam: 255, ten: 'SCORCH', chuc: 'PYRO MERC', hanh: 'Plasma', kieu: 'Heat Trail', mo: 'Burns lanes with lingering plasma trails.', dmg: 24, cd: 0.8 },
  frost:  { tip: [48, 12], tam: 290, ten: 'FROST', chuc: 'CRYOMANCER', hanh: 'Cryo', kieu: 'Chill Meter', mo: 'Stacks chill, then shatters clustered enemies.', dmg: 18, cd: 1.0 },
  arc:    { tip: [60, 13], tam: 245, ten: 'ARC', chuc: 'VOLT BLADE', hanh: 'Voltage', kieu: 'Chain Rhythm', mo: 'Every third slash unleashes chain lightning.', dmg: 32, cd: 0.9 },
  lance:  { tip: [64, 37], tam: 360, ten: 'LANCE', chuc: 'RAIL SNIPER', hanh: 'Laser', kieu: 'Focus Lock', mo: 'Piercing rail shots punish high-HP targets.', dmg: 95, cd: 2.5 },
  warp:   { tip: [48, 37], tam: 300, ten: 'WARP', chuc: 'VOID WITCH', hanh: 'Void', kieu: 'Gravity Knot', mo: 'Groups enemies inside compact gravity fields.', dmg: 14, cd: 1.4 },
  miner:  { tip: [52, 20], tam: 340, ten: 'BROKER', chuc: 'DATA BROKER', hanh: 'Nanite', kieu: 'Bounty', mo: 'Marks enemies for bonus Energy on defeat.', dmg: 10, cd: 1.25 },
  glitch: { tip: [55, 39], tam: 320, ten: 'GLITCH', chuc: 'NETRUNNER', hanh: 'Hack', kieu: 'Breach', mo: 'Exposes enemy weak points with EMP breaches.', dmg: 16, cd: 1.1 },
  venom:  { tip: [56, 38], tam: 275, ten: 'VENOM', chuc: 'TOX ASSASSIN', hanh: 'Toxin', kieu: 'Toxic Bloom', mo: 'Stacks toxins that spread when targets fall.', dmg: 13, cd: 1.0 },
};
const TUONG_IDS = Object.keys(TUONG);
const BO_MAC_DINH = ['scorch', 'frost', 'arc', 'lance', 'glitch'];

const QUAI = {
  thuong: { ten: 'DRONE', hp: 1, spd: 52, thuong: 3, co: 34 },
  nhanh:  { ten: 'SKITTER', hp: 0.6, spd: 92, thuong: 3, co: 31 },
  trau:   { ten: 'BULWARK', hp: 3.2, spd: 34, thuong: 7, co: 40 },
};
// mỗi 10 đợt một boss, xoay vòng; mỗi boss 2 kỹ năng (chính + phụ) có cảnh báo trước (tele giây); hp = máu ở vòng 1
const BOSS = [
  { id: 'firewall', ten: 'FIREWALL', knTen: 'HEAT LOCKDOWN', mo: 'Overheats grid lanes and shields passing drones.', mau: '#ff3b3b', hp: 9000,
    kn: [{ k: 'lockdown', ten: 'HEAT LOCKDOWN', cd: 12, tele: 1.4 }, { k: 'ember', ten: 'EMBER SWEEP', cd: 18, tele: 1.1 }] },
  { id: 'overclock', ten: 'OVERCLOCK', knTen: 'TIME SURGE', mo: 'Accelerates the swarm and spawns clock echoes.', mau: '#ffb31a', hp: 40000,
    kn: [{ k: 'surge', ten: 'TIME SURGE', cd: 13, tele: 1.3 }, { k: 'split', ten: 'CLOCK SPLIT', cd: 20, tele: 1.5 }] },
  { id: 'corruptor', ten: 'CORRUPTOR', knTen: 'DATA INFECTION', mo: 'Corrupts attack timing and siphons linked damage.', mau: '#c04dff', hp: 165000,
    kn: [{ k: 'infect', ten: 'DATA INFECTION', cd: 14, tele: 1.6 }, { k: 'link', ten: 'PARASITE LINK', cd: 19, tele: 1.2 }] },
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
