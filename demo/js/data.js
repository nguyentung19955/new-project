// DEMO "NEON GRID — Merge Defense" (cyberpunk) — DỮ LIỆU: tướng, bậc, Archfiend, quái, trùm, bố cục.
// NGUYÊN TẮC: bám Destiny Child: Defense War (DCDW). Thêm tướng mới = thêm 1 mục trong TUONG (+ ảnh trong demo/assets/v3/), KHÔNG sửa logic.
// Kỹ năng ghép từ các "loại hành vi" có tham số (game.js: MUC, DON, HIEU, DAC_BIET). Cách viết: docs/demo-hop-tuong/TIEN-DO-V3.md.
'use strict';
// HỆ (màu đạn / hiệu ứng trúng đòn) — chỉ là màu VFX, KHÔNG có tương khắc (DCDW không có hệ nguyên tố)
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
// 5 BẬC TƯỚNG theo MÀU (= độ hiếm DCDW Common/Rare/Epic/Legendary/Ancient). Bậc KHÔNG ảnh hưởng tỉ lệ triệu hồi (triệu hồi đều nhau trong bộ 5).
// TRẮNG/LAM/TÍM: đòn hệ lặp lại được (lửa, băng, độc, sét, hack...). VÀNG: cơ chế khác hẳn (tạo mana, ghép đặc biệt...). ĐỎ: skill mạnh nhất.
const BAC = {
  trang: { ten: 'COMMON',    viet: 'TRẮNG', mau: '#dfe6f2', toi: '#2a303c', thu: 1 },
  lam:   { ten: 'RARE',      viet: 'LAM',   mau: '#4aa8ff', toi: '#0a2240', thu: 2 },
  tim:   { ten: 'EPIC',      viet: 'TÍM',   mau: '#b56dff', toi: '#26103e', thu: 3 },
  vang:  { ten: 'LEGENDARY', viet: 'VÀNG',  mau: '#ffc93a', toi: '#3a2a06', thu: 4 },
  do:    { ten: 'ANCIENT',   viet: 'ĐỎ',    mau: '#ff4646', toi: '#3e0a0a', thu: 5 },
};
// Tham số theo sao: số (cố định) hoặc { 1: a, 3: b, 5: c } = giá trị của mốc sao cao nhất ≤ sao hiện tại (game.js: theoSao).
// Mỗi tướng:
//   bac   : khoá trong BAC          hanh : khoá trong HANH (màu VFX)       anh : tên file ảnh trong demo/assets/v3 (mặc định = id)
//   dmg   : sát thương 1★ LV1       cd   : giây / đòn                        muc  : cách chọn mục tiêu (game.js MUC): dau | dongQuai | mauCao | mauThap | mauDay | chuaHieu | ngauNhien
//   don   : kiểu ra đòn (game.js DON): { k: 'dan', toc, so } đạn bay · { k: 'chem' } đánh ngay · { k: 'tia', xuyen } tia tức thời dừng ở mục tiêu
//   hieu  : danh sách hiệu ứng khi trúng (game.js HIEU): chay | bang | doc | hack | chuoi | hut | truyNa ...
//   dac   : skill riêng (VÀNG/ĐỎ, game.js DAC_BIET): taoMana | cayGhep | phatNap ...
//   hit   : loại tia trúng đòn (vfx_hit_<hit>.png: kinetic | frost | flame | electric)    proj : ảnh đạn proj_<proj>.png (mặc định = anh)
//   xoay  : true = ảnh xoay bằng code theo mục tiêu (drone)                                 tip  : điểm nòng cũ (khung 64) — lệch nhẹ điểm phát đạn
const TUONG = {
  scorch: { bac: 'trang', ten: 'SCORCH', chuc: 'PYRO MERC', hanh: 'Plasma', kieu: 'Heat Trail', mo: 'Leaves burning plasma on the lane.',
    dmg: 24, cd: 0.8, tip: [57, 38], muc: 'dau', hit: 'flame',
    don: { k: 'dan', toc: 900 },
    hieu: [{ k: 'chay', r: { 1: 22, 3: 27 }, T: { 1: 2, 5: 2.7 }, dps: 10, n: { 1: 3, 5: 4 } }] },
  frost:  { bac: 'trang', ten: 'FROST', chuc: 'CRYOMANCER', hanh: 'Cryo', kieu: 'Chill Meter', mo: 'Slows; 3 chills shatter the pack.',
    dmg: 18, cd: 1.0, tip: [48, 12], muc: 'chuaHieu', mucHieu: 'chill', hit: 'frost',
    don: { k: 'dan', toc: 800 },
    hieu: [{ k: 'bang', cham: 0.10, max: 3, T: { 1: 3, 3: 4 }, voR: { 1: 30, 5: 42 }, voDmg: 0.3 }] },
  venom:  { bac: 'lam', ten: 'VENOM', chuc: 'TOX ASSASSIN', hanh: 'Toxin', kieu: 'Toxin Stack', mo: 'Stacking poison that spreads.',
    dmg: 13, cd: 1.0, tip: [56, 38], muc: 'mauDay', hit: 'kinetic',
    don: { k: 'dan', toc: 820, so: 2 },
    hieu: [{ k: 'doc', moi: 1, max: 4, T: { 1: 4, 3: 5 }, dps: 3, lan: { 1: 2, 5: 3 } }] },
  glitch: { bac: 'lam', ten: 'GLITCH', chuc: 'NETRUNNER', hanh: 'Hack', kieu: 'Breach', mo: 'Every 3rd hit: +damage taken, stun.',
    dmg: 16, cd: 1.1, tip: [55, 39], muc: 'chuaHieu', mucHieu: 'hack', hit: 'kinetic',
    don: { k: 'dan', toc: 900 },
    hieu: [{ k: 'hack', moi: 3, T: { 1: 4, 3: 5.5 }, them: { 1: 0.15, 5: 0.2 }, choang: 0.35 }] },
  arc:    { bac: 'tim', ten: 'ARC', chuc: 'VOLT BLADE', hanh: 'Voltage', kieu: 'Chain Rhythm', mo: 'Every 3rd slash chains lightning.',
    dmg: 32, cd: 0.9, tip: [60, 13], muc: 'dongQuai', hit: 'electric',
    don: { k: 'chem' },
    hieu: [{ k: 'chuoi', moi: 3, nhay: { 1: 2, 3: 3 }, r: { 1: 85, 5: 105 }, he: 0.35 }] },
  // ---- VÀNG: cơ chế khác hẳn ----
  warp:   { bac: 'vang', ten: 'WARP', chuc: 'VOID WITCH', hanh: 'Void', kieu: 'Warp Gate', mo: 'Merge 2 WARPs → +1 rank to an ally (keeps its type).',
    dmg: 14, cd: 1.3, tip: [48, 37], muc: 'dongQuai', hit: 'kinetic', xoay: true,
    don: { k: 'dan', toc: 760 },
    hieu: [{ k: 'hut', moi: 4, r: { 1: 60, 3: 75 }, T: { 1: 1.4, 5: 2 } }],
    dac: { k: 'cayGhep', ten: 'WARP GATE' } },
  miner:  { bac: 'vang', anh: 'broker', ten: 'BROKER', chuc: 'DATA BROKER', hanh: 'Nanite', kieu: 'Mana Feed', mo: 'Makes Energy every 7s. Weak shots.',
    dmg: 8, cd: 1.4, tip: [52, 20], muc: 'dau', hit: 'kinetic',
    don: { k: 'dan', toc: 820 },
    hieu: [],
    dac: { k: 'taoMana', ten: 'MANA FEED', chuKy: 7, luong: { 1: 4, 2: 7, 3: 11, 4: 16, 5: 22, 6: 29, 7: 38 }, theoLv: 0.25 } },
  // ---- ĐỎ: skill mạnh nhất ----
  lance:  { bac: 'do', ten: 'LANCE', chuc: 'RAIL SNIPER', hanh: 'Laser', kieu: 'Deadline', mo: 'Every 4th rail: DEADLINE ×3, executes weak foes.',
    dmg: 95, cd: 2.2, tip: [64, 37], muc: 'mauCao', hit: 'kinetic',
    don: { k: 'tia', xuyen: { 1: 1, 3: 2 } },
    hieu: [],
    dac: { k: 'phatNap', ten: 'DEADLINE', moi: 4, he: { 1: 3, 5: 3.5, 7: 4 }, xuyen: 4, ketLieu: { 1: 0.15, 5: 0.2 } } },
};
const TUONG_IDS = Object.keys(TUONG);
const BO_MAC_DINH = ['scorch', 'frost', 'arc', 'lance', 'glitch'];
const BO_AI = ['scorch', 'frost', 'lance', 'warp', 'arc'];   // đội hình dựng sẵn của bàn AI (PVP: AI MIRROR · CO-OP: đồng đội)
const AF_AI = 'overclock';                                    // Archfiend của bàn AI
// tên file ảnh của tướng (demo/assets/v3/<anh>.png ...)
const TEN_FILE = (id) => (TUONG[id] && TUONG[id].anh) || id;

// ARCHFIEND (ô thẻ thứ 6): kỹ năng chủ động dùng Energy, giá tăng sau mỗi lần dùng, có hồi chiêu. Chọn ở màn chọn tướng; bot AI cũng dùng.
//   k: 'tocDanh' = cả bàn đánh nhanh hơn (he) trong T giây · 'tuongLua' = xoá hiệu ứng trùm trên tướng + chặn hiệu ứng mới trong T giây
//   gia(n): giá lần dùng thứ n (n = số lần đã dùng) · cd: hồi chiêu (giây) · anh: chân dung tạm (portrait_<anh>.png)
const ARCHFIEND = {
  overclock: { ten: 'OVERCLOCK', mo: 'All heroes +35% attack speed, 6s', mau: '#ffb31a', anh: 'warp', k: 'tocDanh', he: 0.35, T: 6, cd: 30,
    gia: (n) => Math.round(40 * Math.pow(1.6, n)) },
  firewall:  { ten: 'FIREWALL', mo: 'Cleanse + block boss effects, 6s', mau: '#3ce7ff', anh: 'glitch', k: 'tuongLua', T: 6, cd: 35,
    gia: (n) => Math.round(30 * Math.pow(1.6, n)) },
};
const AF_IDS = Object.keys(ARCHFIEND);

// QUÁI THƯỜNG chỉ là bọ đơn giản (không kỹ năng); tinh anh / TRÙM mới thiết kế đặc biệt.
const QUAI = {
  // co × TL = chiều cao hiển thị: thường ~27px, nhanh ~24px, trâu ~34px (boss 58 → ~48px)
  thuong: { ten: 'DRONE', hp: 1, spd: 52, thuong: 3, co: 32 },
  nhanh:  { ten: 'SKITTER', hp: 0.6, spd: 92, thuong: 3, co: 29 },
  trau:   { ten: 'BULWARK', hp: 3.2, spd: 34, thuong: 7, co: 41 },
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
// BỐ CỤC MÀN DỌC (toạ độ logic): rộng luôn 390 (lấp đầy bề ngang), CAO co giãn theo màn (ui.js tính H = cao màn / scale).
// Bàn trên neo TRÊN, bàn người chơi + thẻ + SUMMON neo DƯỚI, khoảng giữa co giãn (game.js boCuc(H) tính lại các toạ độ phụ thuộc H).
// Bàn 5×3 như DCDW: ô 56×54 (khe 2, bước 58×56), viền 6 → bàn 302×180 (~77% bề ngang), làn quái dọc bên trái x 12..60.
const CAU_HINH = {
  W: 390, H: 844, H_MIN: 744, H_MAX: 960,
  COT: 5, HANG: 3, O: 56, OH: 54, KHE: 2, BUOC_X: 58, BUOC_Y: 56,
  BAN_X: 70, BAN_W: 302, BAN_H: 180, VIEN: 6, BAN_AI_Y: 92, BAN_NG_Y: 423,
  LAN_X0: 12, LAN_X1: 60, LAN_THUA: 14,      // làn dài hơn bàn 14px mỗi đầu
  TOP_H: 64, DUOI_H: 219, DUOI_DAY: 6,       // HUD trên cao 64; HUD dưới (Energy/SUMMON + thẻ) cao 219, cách đáy 6
  LAN_AI: null, LAN_NG: null, DUOI_Y: 0, GIUA_Y: 0,   // tính trong game.js boCuc(H)
  TUONG_CAO: 39, TUONG_RONG: 50, CHAN: 9,    // tướng cao 39px, rộng ≤ 50 (không đè ô bên), chân cách đáy ô 9px
  TL: 58 / 70,          // tỉ lệ không gian so với bản ngang cũ (bước ô 58 / 70) — nhân cỡ quái + bán kính vùng hiệu ứng
  // attack đọc rõ 3 pha: chuẩn bị khung 0..2 → khung ra đòn 3 (giữ thêm GIU_KHUNG) → thu đòn. Đạn/đòn phát đúng lúc vào khung ra đòn.
  TAC_DONG: 3 / 14, GIU_KHUNG: 0.075,
  HIT_STOP: { tia: 0.03, chuoi: 0.025 },   // hit-stop ngắn cho đòn mạnh (tia LANCE, nhịp sét chuỗi)
  FX_NHO_MAX: 16,       // tối đa 16 hiệu ứng trúng đòn nhỏ cùng lúc
  DAI_CU: 1272,         // chiều dài đường quái bản ngang cũ (px) — tốc độ quái nhân (dài làn / DAI_CU) để thời gian đi hết làn như cũ
  SAO_MAX: 7, BAC_MAX: 5, MANG: 3, LK_DAU: 100,
  giaTrieu: (n) => 10 + 6 * n,                         // giá Summon lần thứ n (n = số lần đã triệu) — tăng dần như DCDW
  giaBac: (b) => [80, 160, 300, 500, 800][b],          // giá nâng cấp LOẠI tướng b → b+1 (áp dụng cho mọi bản sao loại đó)
  heSoSao: (s) => Math.pow(2.2, s - 1),
  heSoBac: (b) => 1 + 0.4 * b,
  mauDot: (w) => 18 * Math.pow(1.21, w - 1) * (1 + 0.03 * w),
};

// ===== CHẾ ĐỘ CO-OP (kiểu Defense War co-op): 2 bàn (trên = ĐỒNG ĐỘI AI, dưới = người chơi), quái đi MỘT đường chung =====
// Đường: sinh ở đầu làn trên → hết làn trên → đường nối → hết làn dưới → trừ mạng chung. Mọi con số dưới đây là núm chỉnh cân bằng (thử nghiệm).
// w = số wave (1..70)
const COOP = {
  DOT_MAX: 70,          // qua (dọn sạch) wave 70 = thắng
  MANG: 10,             // mạng dùng chung
  MAT_QUAI: 1,          // mạng mất khi 1 quái thường lọt
  MAT_BOSS: 3,          // mạng mất khi trùm lọt
  NGHI: 2.5,            // nghỉ giữa 2 wave (giây), sau khi dọn sạch
  AI_NHIP: [1.2, 0.8],  // đồng đội AI làm 1 việc mỗi 1.2–2.0 giây (nhỏ hơn = AI nhanh tay hơn)
  AI_SAT_THUONG: 0.35,  // sát thương đồng đội AI × 0.35 — quái đi qua bàn trên trước, AI mạnh quá thì người chơi không còn gì để bắn
  // số tướng tối đa đồng đội AI đặt trên bàn theo wave (để quái còn xuống tới bàn người chơi): 2 ở wave 1 → đủ 15 ô từ wave 39
  aiOToiDa: (w) => Math.min(15, 2 + Math.floor(w / 3)),
  CHO_TOI_DA: 22,       // quái còn sót quá lâu (giây sau con cuối) thì wave sau vẫn tới (trừ wave trùm)
  CHO_DAU: 2,           // chờ trước wave 1 (giây)
  THOI_GIAN_DUONG: 1.4, // thời gian đi hết cả đường chung = 1.4 × thời gian đi 1 làn bản PVP (quái thường ~34 giây)
  // số quái mỗi wave thường: 6 ở wave 1 → ~41 ở wave 70
  soQuai: (w) => Math.round(6 + 0.5 * w),
  // số quái đi kèm trùm
  soQuaiBoss: (w) => 3 + Math.floor(w / 10),
  // khoảng cách sinh (giây) giữa 2 quái
  khoangSinh: (w) => Math.max(0.45, 1.1 - 0.01 * w),
  // máu quái thường (nhân thêm QUAI[loại].hp): ~41 ở wave 1, ~96 ở 10, ~600 ở 30, ~3.4k ở 50, ~19k ở 70
  mauQuai: (w) => 40 * Math.pow(1.08, w - 1) * (1 + 0.02 * w),
  // tốc độ quái tăng nhẹ theo wave (tối đa +30%)
  tocQuai: (w) => 1 + Math.min(0.3, 0.005 * w),
  // tỉ lệ quái nhanh (SKITTER) / trâu (BULWARK) xuất hiện dần: nhanh từ wave 4, trâu từ wave 8
  tiLe: (w) => ({ nhanh: w < 4 ? 0 : Math.min(0.3, 0.08 + 0.008 * (w - 4)), trau: w < 8 ? 0 : Math.min(0.25, 0.05 + 0.006 * (w - 8)) }),
  // Energy thưởng khi xong wave (cả 2 bàn đều nhận)
  thuongDot: (w) => 15 + 5 * w,
  // TRÙM mỗi 10 wave: 3 trùm (BOSS) lần lượt FIREWALL → OVERCLOCK → CORRUPTOR → lặp lại (vòng 2); wave 70 = TRÙM CUỐI (CORRUPTOR)
  // máu trùm = máu quái thường wave đó × BOI_BOSS[trùm] × NHAN_VONG^vòng (× CUOI ở wave 70)
  BOI_BOSS: [45, 55, 65],
  NHAN_VONG: 1.3,
  CUOI: 2,
  mauBoss: (w, idx, vong, cuoi) => COOP.mauQuai(w) * COOP.BOI_BOSS[idx] * Math.pow(COOP.NHAN_VONG, vong) * (cuoi ? COOP.CUOI : 1),
};
