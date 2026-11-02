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
//   dmg   : sát thương 1★ LV1       cd   : giây / đòn                        muc  : cách chọn mục tiêu (game.js MUC): dau | cuoi | gan | dongQuai | mauCao | mauThap | mauDay | chuaHieu | ngauNhien
//   don   : kiểu ra đòn (game.js DON): { k: 'dan', toc, so } đạn bay · { k: 'chem' } đánh ngay · { k: 'tia', xuyen } tia tức thời dừng ở mục tiêu
//   hieu  : danh sách hiệu ứng khi trúng (game.js HIEU): chay | bang | doc | hack | chuoi | hut | day | truyNa ...
//   dac   : skill riêng VÀNG/ĐỎ (game.js DAC_BIET): moiGioi | packet | phatNap ...; `chu` = kỹ năng CHỦ ĐỘNG chọn ô (game.js CHU_DONG), mở theo sao (tu)
//   hit   : loại tia trúng đòn (vfx_hit_<hit>.png: kinetic | frost | flame | electric)    proj : ảnh đạn proj_<proj>.png (mặc định = anh)
//   xoay  : true = ảnh xoay bằng code theo mục tiêu (drone WARP)
//   co    : HỆ SỐ CỠ riêng (1 = cỡ chuẩn C.TUONG_CAO). Tướng cầm súng trông nhỏ hơn nên phóng to hơn chút. Luôn neo chân.
//   nong  : ĐIỂM ĐẦU NÒNG theo hướng ảnh vẽ { s, sw, w, nw, n: [x, y] } — toạ độ px trong ảnh tĩnh <anh>_<dir>.png (khung 112).
//           Hướng lật gương (se, e, ne) tự đối xứng x. Đo bằng script (điểm xa nhất của vũ khí theo hướng nhìn) rồi xem bằng mắt.
//           ARC = mũi kiếm. WARP (xoay): chỉ cần `s` (toạ độ trong warp.png), xoay theo góc.
const TUONG = {
  // ---- TRẮNG: đòn hệ đơn giản ----
  scorch: { bac: 'trang', ten: 'SCORCH', chuc: 'PYRO MERC', hanh: 'Plasma', kieu: 'Heat Trail', mo: 'Burns the lane under the front foe.',
    dmg: 24, cd: 0.8, muc: 'dau', hit: 'flame', co: 1.08,
    nong: { s: [32, 104], sw: [27, 96], w: [22, 81], nw: [27, 75], n: [78, 74] },
    don: { k: 'dan', toc: 900 },
    hieu: [{ k: 'chay', r: { 1: 22, 3: 27 }, T: { 1: 2, 3: 2.7 }, dps: 10, n: { 1: 3, 5: 4 } }] },
  frost:  { bac: 'trang', ten: 'FROST', chuc: 'CRYOMANCER', hanh: 'Cryo', kieu: 'Chill', mo: 'Slows; 3 chills shatter.',
    dmg: 18, cd: 1.0, muc: 'dau', hit: 'frost', co: 0.95,
    nong: { s: [29, 60], sw: [20, 57], w: [15, 58], nw: [24, 49], n: [83, 38] },
    don: { k: 'dan', toc: 800 },
    hieu: [{ k: 'bang', cham: { 1: 0.10, 3: 0.125 }, max: 3, T: { 1: 1.5, 3: 2 }, voR: { 1: 30, 5: 40 }, voDmg: 0.3 }] },
  arc:    { bac: 'trang', ten: 'ARC', chuc: 'VOLT BLADE', hanh: 'Voltage', kieu: 'Chain Slash', mo: '3rd slash chains lightning.',
    dmg: 30, cd: 0.9, muc: 'gan', hit: 'electric', co: 0.90,
    nong: { s: [13, 84], sw: [16, 64], w: [11, 60], nw: [15, 56], n: [95, 59] },
    don: { k: 'chem' },
    hieu: [{ k: 'chuoi', moi: 3, nhay: { 1: 1, 3: 2 }, r: { 1: 85, 5: 100 }, he: 0.35 }] },
  venom:  { bac: 'trang', ten: 'VENOM', chuc: 'TOX BEAST', hanh: 'Toxin', kieu: 'Toxin Stack', mo: 'Stacking poison on the toughest.',
    dmg: 13, cd: 1.0, muc: 'mauCao', hit: 'kinetic', co: 1.14,
    nong: { s: [53, 104], sw: [21, 95], w: [17, 80], nw: [29, 38], n: [53, 24] },
    don: { k: 'dan', toc: 820 },
    hieu: [{ k: 'doc', moi: 1, max: { 1: 5, 3: 6 }, T: { 1: 4, 3: 5 }, dps: 3, lan: { 1: 0, 7: 2 } }] },
  // ---- LAM ----
  lance:  { bac: 'lam', ten: 'LANCE', chuc: 'RAIL SNIPER', hanh: 'Laser', kieu: 'Pierce', mo: 'Rail pierces the line.',
    dmg: 70, cd: 2.0, muc: 'mauCao', hit: 'kinetic', co: 1.12,
    nong: { s: [31, 104], sw: [22, 101], w: [22, 88], nw: [29, 73], n: [59, 31] },
    don: { k: 'tia', xuyen: { 1: 1, 3: 2 } },
    hieu: [],
    dac: { k: 'phatNap', ten: 'FOCUS', tu: 7, moi: 3, he: 2.5, xuyen: 3, ketLieu: 0 } },
  // ---- TÍM ----
  warp:   { bac: 'tim', ten: 'WARP', chuc: 'VOID DRONE', hanh: 'Void', kieu: 'Void Push', mo: 'Void orbs push foes back.',
    dmg: 16, cd: 1.2, muc: 'cuoi', hit: 'kinetic', xoay: true, co: 0.92,
    nong: { s: [65, 100] },
    don: { k: 'dan', toc: 760 },
    hieu: [{ k: 'day', lui: { 1: 6, 7: 12 }, r: { 1: 0, 3: 22 } }, { k: 'hut', tu: 5, moi: 5, r: 60, T: 1.2 }] },
  // ---- VÀNG: cơ chế khác hẳn + kỹ năng chủ động chọn ô ----
  miner:  { bac: 'vang', anh: 'broker', ten: 'BROKER', chuc: 'DATA BROKER', hanh: 'Nanite', kieu: 'Mana Broker', mo: 'Kills near its row → Energy. Tap: TRADE.',
    dmg: 8, cd: 1.4, muc: 'dau', hit: 'kinetic', co: 1.08,
    nong: { s: [77, 86], sw: [55, 86], w: [34, 85], nw: [34, 75], n: [35, 72] },
    don: { k: 'dan', toc: 820 },
    hieu: [],
    dac: { k: 'moiGioi', ten: 'MANA', hang: 1.5, luong: { 1: 1, 3: 2, 5: 3, 7: 4 }, tranDot: { 1: 12, 3: 18, 5: 26, 7: 36 },
      chotLoi: { tu: 7, ten: 'TAKE PROFIT', hoan: 0.3, cd: 10 },
      chu: [{ k: 'giaoDich', tu: 3, ten: 'TRADE', cd: 20, T: 8, them: 2, chon: 'ke' },
        { k: 'hoanDoi', tu: 5, ten: 'SWAP', cd: 20, chon: 'cungSao' }] } },
  glitch: { bac: 'vang', ten: 'GLITCH', chuc: 'CRT HACKER', hanh: 'Hack', kieu: 'Packet Swap', mo: 'Marks + locks. Merge beside: pick 1 of 2.',
    dmg: 16, cd: 1.1, muc: 'chuaHieu', mucHieu: 'hack', hit: 'kinetic', co: 0.96,
    nong: { s: [57, 70], w: [28, 54], n: [39, 23] },
    don: { k: 'dan', toc: 900 },
    hieu: [{ k: 'hack', moi: 1, T: { 1: 3, 3: 4 }, them: { 1: 0.10, 5: 0.15 }, khoaMoi: 6, choang: 0.6 }],
    dac: { k: 'packet', ten: 'PACKET SWAP', swapTu: 5, rerollTu: 7, choT: 4,
      chu: [{ k: 'copyBuffer', tu: 3, ten: 'COPY BUFFER', cd: 15, T: 5, he: 0.35, chon: 'ke' }] } },
};
const TUONG_IDS = Object.keys(TUONG);
const BO_MAC_DINH = ['scorch', 'frost', 'arc', 'lance', 'glitch'];
const BO_AI = ['scorch', 'frost', 'lance', 'warp', 'arc'];   // đội hình dựng sẵn của bàn AI (PVP: AI MIRROR · CO-OP: đồng đội)
const AF_AI = 'overclock';                                    // Archfiend của bàn AI
// tên file ảnh của tướng (demo/assets/v3/<anh>.png ...)
const TEN_FILE = (id) => (TUONG[id] && TUONG[id].anh) || id;

// ARCHFIEND (ô thẻ thứ 6): kỹ năng chủ động dùng Energy, giá tăng sau mỗi lần dùng, có hồi chiêu. Chọn ở màn chọn tướng; bot AI cũng dùng.
//   k: 'tocDanh' = cả bàn đánh nhanh hơn (he) trong T giây · 'tuongLua' = xoá hiệu ứng trùm/tinh anh trên tướng + chặn hiệu ứng mới trong T giây
//   gia(n): giá lần dùng thứ n (n = số lần đã dùng) · cd: hồi chiêu (giây) · anh: chân dung tạm (portrait_<anh>.png)
const ARCHFIEND = {
  overclock: { ten: 'OVERCLOCK', mo: 'All heroes +35% attack speed, 6s', mau: '#ffb31a', anh: 'warp', k: 'tocDanh', he: 0.35, T: 6, cd: 30,
    gia: (n) => Math.round(40 * Math.pow(1.6, n)) },
  firewall:  { ten: 'FIREWALL', mo: 'Cleanse + block boss/elite effects, 6s', mau: '#3ce7ff', anh: 'glitch', k: 'tuongLua', T: 6, cd: 35,
    gia: (n) => Math.round(30 * Math.pow(1.6, n)) },
};
const AF_IDS = Object.keys(ARCHFIEND);

// QUÁI THƯỜNG = 4 BỌ đơn giản (không kỹ năng). Ảnh: assets/v3/bug_<id>_walk.png (1 hàng 6 khung vuông 112, đầu hướng xuống = hướng đi, 10fps).
//   hp: hệ số máu · spd: tốc độ (px/giây, đơn vị cũ) · thuong: Energy khi chết · co: chiều cao hiển thị (px)
//   tu: xuất hiện từ wave · ti: tỉ lệ khi đã xuất hiện (phần còn lại là SCUTTLE) · dan: ra từng đợt n con · khangDay: giảm bị đẩy lùi (0..1)
const QUAI = {
  scuttle: { ten: 'SCUTTLE', hp: 1.0,  spd: 52, thuong: 3, co: 28, tu: 1, ti: 0 },
  dart:    { ten: 'DART',    hp: 0.65, spd: 83, thuong: 2, co: 27, tu: 3, ti: 0.22, dan: 3 },
  gnat:    { ten: 'GNAT',    hp: 0.5,  spd: 68, thuong: 2, co: 26, tu: 4, ti: 0.18 },
  shell:   { ten: 'SHELL',   hp: 2.8,  spd: 34, thuong: 6, co: 30, tu: 6, ti: 0.16, khangDay: 0.6 },
};
// TINH ANH (từ wave TINH_ANH_TU, cả PVP và co-op; không ra ở wave trùm). Ảnh: assets/v3/elite_<id>_walk.png (6 khung vuông 128).
//   k: cơ chế (game.js TINH_ANH_KN) · cd: chu kỳ (giây) · bao: báo trước (giây) · T: thời gian hiệu lực
const TINH_ANH = {
  mantis: { ten: 'PRISM MANTIS',  hp: 4.5, spd: 44, thuong: 12, co: 40, k: 'phan', cd: 6, bao: 0.7, mau: '#a8c8ff', mo: 'Reflects 1 direct shot every 6s' },
  jammer: { ten: 'JAMMER BEETLE', hp: 5, spd: 40, thuong: 12, co: 38, k: 'khoa', cd: 12, bao: 1.0, T: 3, mau: '#ff4040', mo: 'Locks 1 hero skill for 3s every 12s' },
  brood:  { ten: 'BROOD CARRIER', hp: 4.5, spd: 38, thuong: 10, co: 40, k: 'no', con: 'dart', so: 3, hpCon: 0.06, mau: '#b4ff2a', mo: 'Splits into 3 DARTs on death' },
  cicada: { ten: 'PHASE CICADA',  hp: 4, spd: 50, thuong: 12, co: 38, k: 'pha', cd: 9, bao: 0.8, T: 1.2, mau: '#c79bff', mo: 'Phases out every 9s: dodges shots 1.2s (DoT still hits)' },
};
const TINH_ANH_TU = 5;
const soTinhAnh = (w) => (w < TINH_ANH_TU ? 0 : 1 + Math.floor((w - TINH_ANH_TU) / 12));   // số tinh anh mỗi wave thường
// mỗi 10 đợt một boss, xoay vòng; mỗi boss 2 kỹ năng có cảnh báo trước (tele giây); hp = máu ở vòng 1 (PVP)
const BOSS = [
  { id: 'firewall', ten: 'FIREWALL', knTen: 'FIRE SHIELD', mo: 'Raises a front shield; marks a row with fire.', mau: '#ff3b3b', hp: 9000,
    kn: [{ k: 'khienTruoc', ten: 'FIRE SHIELD', cd: 11, tele: 1.2, T: 4, giam: 0.6 }, { k: 'lockdown', ten: 'HEAT LOCKDOWN', cd: 14, tele: 1.5 }] },
  { id: 'overclock', ten: 'OVERCLOCK', knTen: 'OVERDRIVE', mo: 'Speeds itself up; pulses the swarm faster.', mau: '#ffb31a', hp: 40000,
    kn: [{ k: 'tangToc', ten: 'OVERDRIVE', cd: 12, tele: 1.0, T: 4, he: 0.5 }, { k: 'surge', ten: 'CLOCK PULSE', cd: 16, tele: 1.3, T: 5 }] },
  { id: 'corruptor', ten: 'CORRUPTOR', knTen: 'DATA INFECTION', mo: 'Infects 2 heroes; grows a healing cocoon.', mau: '#c04dff', hp: 165000,
    kn: [{ k: 'infect', ten: 'DATA INFECTION', cd: 13, tele: 1.5, so: 2, T: 5 }, { k: 'ken', ten: 'COCOON', cd: 18, tele: 1.0, T: 4, hoi: 0.08, pha: 0.05 }] },
];
// BỐ CỤC MÀN DỌC kiểu DCDW (toạ độ logic): rộng luôn 390, CAO co giãn theo màn (ui.js tính H = cao màn / scale).
// KHÔNG để khoảng trống giữa 2 bàn: chiều cao dư được dùng làm Ô CAO HƠN (game.js boCuc tính BUOC_Y theo H, kẹp OH_MIN..OH_MAX).
// Bàn 5×3: ô rộng 62 (bước 64), viền 6 → bàn 332px (~85% bề ngang), làn quái dọc bên trái x 8..48.
const CAU_HINH = {
  W: 390, H: 844, H_MIN: 700, H_MAX: 960,
  COT: 5, HANG: 3, O: 62, OH: 76, KHE: 2, BUOC_X: 64, BUOC_Y: 78, OH_MIN: 58, OH_MAX: 78,
  BAN_X: 54, BAN_W: 332, BAN_H: 246, VIEN: 6, BAN_AI_Y: 80, BAN_NG_Y: 400,
  LAN_X0: 8, LAN_X1: 48, LAN_THUA: 12,       // làn dài hơn bàn 12px mỗi đầu
  TOP_H: 64, DUOI_H: 186, DUOI_DAY: 4,       // HUD trên cao 64; HUD dưới (Energy/SUMMON + thẻ) cao 186, cách đáy 4
  KHE_BAN: 30,                               // khoảng tối thiểu giữa 2 bàn (cửa ra làn trên + cổng làn dưới + nhãn PLAYER)
  LAN_AI: null, LAN_NG: null, DUOI_Y: 0, GIUA_Y: 0,   // tính trong game.js boCuc(H)
  // tướng ĐẦY Ô như DCDW: cao = min(TL_CAO × chiều cao ô, CAO_MAX) × hệ số riêng (TUONG[id].co); rộng ≤ ô + 8 (đè ô bên ≤ 4px); chân cách đáy ô CHAN
  TL_CAO: 0.8, CAO_MAX: 58, CHAN: 7, TUONG_CAO: 58, TUONG_RONG: 70,
  TL: 58 / 70,          // tỉ lệ không gian so với bản ngang cũ — nhân bán kính vùng hiệu ứng
  // ANIMATION: SHEET_TUONG = false → TẮT sheet idle/attack (khung ChatGPT không nhất quán). Tướng luôn vẽ bằng ẢNH TĨNH theo hướng
  // (<anh>_<dir>.png), đánh = giật lùi 2px + chớp nòng + đạn. Có ảnh <anh>_atk_<dir>.png thì đổi sang ảnh đó ~ATK_ANH giây lúc ra đòn.
  SHEET_TUONG: false, ATK_ANH: 0.12, GIAT: 2, GIAT_T: 0.09, NHUN: 0.8, CHOP_NONG: 0.07,
  TAC_DONG: 0.05, GIU_KHUNG: 0.075,          // trễ từ lúc quay mặt → đạn ra (ảnh tĩnh: 50ms; bật sheet thì 3/14 giây cho khớp khung ra đòn)
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
if (CAU_HINH.SHEET_TUONG) CAU_HINH.TAC_DONG = 3 / 14;

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
  // tỉ lệ các loại bọ dùng QUAI[id].tu / ti (game.js chonBo); tinh anh: soTinhAnh(w)
  // Energy thưởng khi xong wave (cả 2 bàn đều nhận)
  thuongDot: (w) => 15 + 5 * w,
  // TRÙM mỗi 10 wave: 3 trùm (BOSS) lần lượt FIREWALL → OVERCLOCK → CORRUPTOR → lặp lại (vòng 2); wave 70 = TRÙM CUỐI (CORRUPTOR)
  // máu trùm = máu quái thường wave đó × BOI_BOSS[trùm] × NHAN_VONG^vòng (× CUOI ở wave 70)
  BOI_BOSS: [45, 55, 65],
  NHAN_VONG: 1.3,
  CUOI: 2,
  mauBoss: (w, idx, vong, cuoi) => COOP.mauQuai(w) * COOP.BOI_BOSS[idx] * Math.pow(COOP.NHAN_VONG, vong) * (cuoi ? COOP.CUOI : 1),
};
