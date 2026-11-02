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
//   hieu  : danh sách hiệu ứng khi trúng (game.js HIEU): chay | bang | doc | hack | khoa | chuoi | hut | truyNa ...
//   dac   : skill riêng (VÀNG/ĐỎ, game.js DAC_BIET): taoMana | cayGhep | phatNap (tuSao) | moiGioi (BROKER) | hacker (GLITCH) ...
//   dac.ky: kỹ năng CHỦ ĐỘNG theo ô (chạm tướng trên bàn → chọn kỹ năng → chọn ô): k, tuSao, cd, chon: 'ke' (ô kề) | 'cungSao' (tướng cùng sao)
//   hit   : loại tia trúng đòn (vfx_hit_<hit>.png: kinetic | frost | flame | electric)    proj : ảnh đạn proj_<proj>.png (mặc định = anh)
//   xoay  : true = ảnh xoay bằng code theo mục tiêu (drone)                                 tip  : điểm nòng cũ (khung 64) — lệch nhẹ điểm phát đạn
// HIỂN THỊ TƯỚNG (bản "ổn định"):
//   co    : hệ số cỡ riêng (tướng cầm súng trông nhỏ hơn → phóng to hơn), giữ neo chân
//   nong  : ĐIỂM ĐẦU NÒNG trong ảnh tĩnh 112×112 theo hướng vẽ (s, sw, w, nw, n) — hướng lật gương (se, e, ne) tự đối xứng x.
//           Đo bằng script Python (điểm xa nhất của vũ khí theo hướng nhìn) rồi chỉnh tay. ARC = mũi kiếm. Đạn / tia / chớp nòng xuất phát ở đây.
//   khung : hộp phần hình của ảnh hướng S [x0, y0, x1, y1] (để tính tỉ lệ hiển thị giống nhau ở game.js và render.js)
//   xoay  : true = drone xoay ảnh bằng code (WARP) — nong = { r } (đầu nòng cách tâm r × cạnh ảnh theo hướng bắn)
const TUONG = {
  // ---- TRẮNG: đòn hệ đơn giản ----
  scorch: { bac: 'trang', ten: 'SCORCH', chuc: 'PYRO MERC', hanh: 'Plasma', kieu: 'Heat Trail', mo: 'Fire bolts leave a burning trail.',
    dmg: 24, cd: 0.8, muc: 'dau', hit: 'flame', co: 1.08, khung: [26, 22, 85, 104],
    nong: { s: [32, 96], sw: [28, 97], w: [22, 84], nw: [28, 82], n: [56, 34] },
    don: { k: 'dan', toc: 900 },
    hieu: [{ k: 'chay', r: { 1: 22, 3: 27 }, T: { 1: 2, 3: 2.7 }, dps: 10, n: { 1: 3, 5: 4 } }] },
  frost:  { bac: 'trang', ten: 'FROST', chuc: 'CRYOMANCER', hanh: 'Cryo', kieu: 'Chill', mo: 'Slows; 3 chills shatter the pack.',
    dmg: 18, cd: 1.0, muc: 'chuaHieu', mucHieu: 'chill', hit: 'frost', co: 0.95, khung: [19, 22, 92, 104],
    nong: { s: [29, 58], sw: [23, 56], w: [14, 55], nw: [24, 44], n: [86, 44] },
    don: { k: 'dan', toc: 800 },
    hieu: [{ k: 'bang', cham: { 1: 0.08, 3: 0.10 }, max: 3, T: { 1: 1.5, 3: 2 }, voR: { 1: 30, 5: 42 }, voDmg: 0.3 }] },
  arc:    { bac: 'trang', ten: 'ARC', chuc: 'VOLT BLADE', hanh: 'Voltage', kieu: 'Chain Slash', mo: 'Melee slash; every 3rd chains lightning.',
    dmg: 30, cd: 0.9, muc: 'gan', hit: 'electric', co: 0.90, khung: [9, 22, 101, 104],
    nong: { s: [11, 78], sw: [17, 46], w: [11, 59], nw: [15, 56], n: [95, 62] },
    don: { k: 'chem' },
    hieu: [{ k: 'chuoi', moi: 3, nhay: { 1: 1, 3: 2 }, r: { 1: 85, 5: 105 }, he: 0.35 }] },
  venom:  { bac: 'trang', ten: 'VENOM', chuc: 'TOX BEAST', hanh: 'Toxin', kieu: 'Toxin Stack', mo: 'Stacking poison (5, ★3: 6) that spreads.',
    dmg: 13, cd: 1.0, muc: 'mauCao', hit: 'kinetic', co: 1.14, khung: [28, 22, 83, 104],
    nong: { s: [56, 102], sw: [26, 100], w: [17, 75], nw: [27, 39], n: [55, 23] },
    don: { k: 'dan', toc: 820, so: 2 },
    hieu: [{ k: 'doc', moi: 1, max: { 1: 5, 3: 6 }, T: { 1: 4, 3: 5 }, dps: 3, lan: { 1: 0, 7: 2 } }] },
  // ---- LAM ----
  lance:  { bac: 'lam', ten: 'LANCE', chuc: 'RAIL SNIPER', hanh: 'Laser', kieu: 'Pierce', mo: 'Rail pierces the line; ★7 every 3rd shot is a focus rail.',
    dmg: 80, cd: 2.0, muc: 'mauCao', hit: 'kinetic', co: 1.12, khung: [27, 22, 84, 104],
    nong: { s: [33, 104], sw: [23, 103], w: [22, 93], nw: [29, 76], n: [57, 40] },
    don: { k: 'tia', xuyen: { 1: 1, 3: 2, 5: 3 } },
    hieu: [],
    dac: { k: 'phatNap', ten: 'FOCUS RAIL', tuSao: 7, moi: 3, he: 2.5, xuyen: 4 } },
  // ---- TÍM ----
  warp:   { bac: 'tim', ten: 'WARP', chuc: 'VOID DRONE', hanh: 'Void', kieu: 'Void Pull', mo: 'Hits the last foe; void field drags foes back.',
    dmg: 16, cd: 1.2, muc: 'cuoi', hit: 'kinetic', xoay: true, co: 0.92,
    nong: { r: 0.42 },
    don: { k: 'dan', toc: 760 },
    hieu: [{ k: 'hut', moi: { 1: 4, 5: 3 }, r: { 1: 60, 3: 75 }, T: { 1: 1.4, 5: 2 } }] },
  // ---- VÀNG: cơ chế theo Ô (chạm tướng → chọn kỹ năng → chọn ô) ----
  miner:  { bac: 'vang', anh: 'broker', ten: 'BROKER', chuc: 'DATA BROKER', hanh: 'Nanite', kieu: 'Market', mo: 'Energy when foes die near her (2 tiles). ★3 TRADE · ★5 SWAP · ★7 TAKE PROFIT.',
    dmg: 8, cd: 1.4, muc: 'dau', hit: 'kinetic', co: 1.08, khung: [26, 22, 85, 104],
    nong: { s: [30, 82], sw: [34, 82], w: [28, 73], nw: [35, 80], n: [36, 76] },
    don: { k: 'dan', toc: 820 },
    hieu: [],
    dac: { k: 'moiGioi', ten: 'MARKET', vung: 2.6, luong: { 1: 1, 3: 2, 5: 3, 7: 4 }, nghi: 0.5,
      ky: [
        { k: 'giaoDich', tuSao: 3, ten: 'TRADE', mo: 'Pick an adjacent hero: its kills give +Energy for 8s', cd: 20, T: 8, them: { 3: 2, 5: 3, 7: 4 }, chon: 'ke' },
        { k: 'hoanDoi', tuSao: 5, ten: 'SWAP', mo: 'Swap places with a hero of the same rank', cd: 20, chon: 'cungSao' },
      ],
      chotLoi: { tuSao: 7, ten: 'TAKE PROFIT', hoan: 0.3, nghi: 10 } } },
  glitch: { bac: 'vang', ten: 'GLITCH', chuc: 'NETRUNNER', hanh: 'Hack', kieu: 'Mark & Lock', mo: 'Marks foes; every 6th hit locks one. ★3 COPY · ★5 PACKET SWAP · ★7 REROLL.',
    dmg: 16, cd: 1.0, muc: 'dau', hit: 'kinetic', co: 0.96, khung: [17, 22, 94, 104],
    nong: { s: [56, 70], w: [28, 53], n: [37, 23] },
    don: { k: 'dan', toc: 900 },
    hieu: [{ k: 'khoa', danhDau: 0.12, T: 3, moi: 6, choang: { 1: 0.6, 5: 0.9 }, tatElite: 3 }],
    dac: { k: 'hacker', ten: 'BREACH',
      ky: [{ k: 'copyBuffer', tuSao: 3, ten: 'COPY', mo: 'Copy a buffer onto an adjacent hero: +30% attack speed 5s', cd: 15, T: 5, he: 0.3, chon: 'ke' }],
      packetSwap: { tuSao: 5, ten: 'PACKET SWAP' }, reroll: { tuSao: 7, ten: 'REROLL', lan: 1 } } },
};
const TUONG_IDS = Object.keys(TUONG);
// CỜ HIỂN THỊ: sheet idle/attack của ChatGPT không nhất quán giữa các khung (thừa tay/gậy, đầu-thân đổi) → TẮT mặc định, tướng vẽ bằng ẢNH TĨNH.
// Có file <anh>_atk_<dir>.png thì đổi sang ảnh đó ~DOI_ATK giây lúc ra đòn (không có thì bỏ qua).
const HIEN = { SHEET_IDLE: false, SHEET_ATTACK: false, ANH_ATK: true, NHUN: 0.8, VIEN_BAC: true };
const BO_MAC_DINH = ['scorch', 'frost', 'arc', 'lance', 'glitch'];
const DS_BAC = ['trang', 'lam', 'tim', 'vang', 'do'];
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

// QUÁI THƯỜNG = 4 BỌ đơn giản (không kỹ năng) — ảnh demo/assets/v3/bug_<anh>_walk.png (1 hàng 6 khung vuông 112px, đầu hướng xuống = hướng đi, 10fps).
// TINH ANH (elite) = 4 loại có cơ chế riêng (từ wave 5, cả PvP và co-op) — elite_<anh>_walk.png (6 khung vuông 128px).
//   hp: hệ số máu so với quái chuẩn của wave · spd: px/giây (đường ngang cũ) · co: chiều cao hiển thị (px) · thuong: Energy khi giết
//   tu: wave bắt đầu xuất hiện · nang: trọng số xuất hiện
const QUAI = {
  scuttle: { ten: 'SCUTTLE', anh: 'bug_scuttle', hp: 1.0, spd: 52, thuong: 3, co: 27, tu: 1, nang: 6 },
  dart:    { ten: 'DART', anh: 'bug_dart', hp: 0.65, spd: 83, thuong: 3, co: 26, tu: 3, nang: 3 },
  shell:   { ten: 'SHELL', anh: 'bug_shell', hp: 2.8, spd: 34, thuong: 6, co: 30, tu: 5, nang: 2, chongDay: 0.5 },
  gnat:    { ten: 'GNAT', anh: 'bug_gnat', hp: 0.5, spd: 68, thuong: 2, co: 26, tu: 2, nang: 2 },
  // ---- TINH ANH: tinhAnh = loại cơ chế (game.js TINH_ANH) ----
  mantis:  { ten: 'PRISM MANTIS', anh: 'elite_mantis', hp: 6, spd: 40, thuong: 10, co: 38, tinhAnh: 'phanXa', chuKy: 6, bao: 0.7 },
  jammer:  { ten: 'JAMMER BEETLE', anh: 'elite_jammer', hp: 6, spd: 38, thuong: 10, co: 38, tinhAnh: 'gayNhieu', chuKy: 12, bao: 1.0, T: 3 },
  brood:   { ten: 'BROOD CARRIER', anh: 'elite_brood', hp: 7, spd: 34, thuong: 10, co: 40, tinhAnh: 'apTrung', con: 3, conHp: 0.35 },
  cicada:  { ten: 'PHASE CICADA', anh: 'elite_cicada', hp: 5, spd: 48, thuong: 10, co: 36, tinhAnh: 'lechPha', chuKy: 9, bao: 0.8, T: 1.2 },
};
const BO_IDS = ['scuttle', 'dart', 'shell', 'gnat'];
const ELITE_IDS = ['mantis', 'jammer', 'brood', 'cicada'];
const ELITE = { TU: 5, so: (w) => (w < 5 ? 0 : Math.min(3, 1 + Math.floor((w - 5) / 15))) };   // số tinh anh mỗi wave thường
// mỗi 10 đợt một boss, xoay vòng; mỗi boss 2 kỹ năng (chính + phụ) có cảnh báo trước (tele giây); hp = máu ở vòng 1
const BOSS = [
  { id: 'firewall', ten: 'FIREWALL', knTen: 'SHIELD WALL', mo: 'Raises a firewall shield and burns a hero row.', mau: '#ff3b3b', hp: 9000,
    kn: [{ k: 'khien', ten: 'SHIELD WALL', cd: 11, tele: 1.2, T: 4, luong: 0.12 }, { k: 'lockdown', ten: 'FIRE ROW', cd: 16, tele: 1.5 }] },
  { id: 'overclock', ten: 'OVERCLOCK', knTen: 'OVERDRIVE', mo: 'Speeds itself up, then overclocks the swarm.', mau: '#ffb31a', hp: 40000,
    kn: [{ k: 'tangToc', ten: 'OVERDRIVE', cd: 12, tele: 1.0, T: 4, he: 0.5 }, { k: 'surge', ten: 'CLOCK PULSE', cd: 17, tele: 1.3, T: 5 }] },
  { id: 'corruptor', ten: 'CORRUPTOR', knTen: 'DATA INFECTION', mo: 'Infects 2 heroes (slow attacks) and grows a healing cocoon.', mau: '#c04dff', hp: 165000,
    kn: [{ k: 'infect', ten: 'DATA INFECTION', cd: 13, tele: 1.5, T: 5, so: 2 }, { k: 'ken', ten: 'COCOON', cd: 18, tele: 1.0, T: 4, hp: 0.05, hoi: 0.08 }] },
];
// BỐ CỤC MÀN DỌC kiểu DCDW (toạ độ logic): rộng luôn 390, CAO co giãn theo màn (ui.js tính H = cao màn / scale).
// 2 bàn sát nhau (khe GAP + nhãn), phần cao dư dùng làm BÀN TO HƠN (ô cao hơn, tối đa ô cao = 1.25 × ô rộng) — game.js boCuc(H) tính lại.
// Làn quái dọc bên trái x 8..54, bàn x 61..384: ô rộng 61 (bước 63), ô cao co giãn 52..74.
const CAU_HINH = {
  W: 390, H: 844, H_MIN: 660, H_MAX: 960,
  COT: 5, HANG: 3, O: 61, OH: 66, KHE: 2, BUOC_X: 63, BUOC_Y: 68,
  BAN_X: 61, BAN_W: 323, BAN_H: 212, VIEN: 4, BAN_AI_Y: 80, BAN_NG_Y: 420,
  LAN_X0: 8, LAN_X1: 54, LAN_THUA: 8, LAN_GIUA: 4,   // làn dài hơn bàn 8px ở 2 đầu ngoài, 4px ở giữa 2 bàn
  TOP_H: 64, DUOI_H: 200, DUOI_DAY: 6, NHAN: 14, GAP: 6, OH_MAX_TL: 1.25,
  LAN_AI: null, LAN_NG: null, DUOI_Y: 0, GIUA_Y: 0,   // tính trong game.js boCuc(H)
  TUONG_TL: 0.82,       // tướng (hệ số 1.0) cao 82% chiều cao ô, neo chân gần đáy ô; rộng ≤ ô + 8 (không đè ô bên quá 4px)
  TUONG_CAO: 54, TUONG_RONG: 69, CHAN: 5,
  TL: 63 / 70,          // tỉ lệ không gian so với bản ngang cũ — nhân bán kính vùng hiệu ứng
  // ra đòn: ảnh tĩnh, đạn phát gần như ngay (TAC_DONG), giật lùi 2px ~90ms, chớp nòng 70ms
  TAC_DONG: 0.03, GIU_KHUNG: 0, GIAT_T: 0.09, CHOP_T: 0.07, DOI_ATK: 0.12,
  HIT_STOP: { tia: 0.03, chuoi: 0.025 },
  FX_NHO_MAX: 16,
  DAI_CU: 1272,
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
  // loại bọ: chọn theo trọng số QUAI[k].nang trong các bọ đã mở (QUAI[k].tu ≤ wave); tinh anh theo ELITE.so(w)
  // Energy thưởng khi xong wave (cả 2 bàn đều nhận)
  thuongDot: (w) => 15 + 5 * w,
  // TRÙM mỗi 10 wave: 3 trùm (BOSS) lần lượt FIREWALL → OVERCLOCK → CORRUPTOR → lặp lại (vòng 2); wave 70 = TRÙM CUỐI (CORRUPTOR)
  // máu trùm = máu quái thường wave đó × BOI_BOSS[trùm] × NHAN_VONG^vòng (× CUOI ở wave 70)
  BOI_BOSS: [45, 55, 65],
  NHAN_VONG: 1.3,
  CUOI: 2,
  mauBoss: (w, idx, vong, cuoi) => COOP.mauQuai(w) * COOP.BOI_BOSS[idx] * Math.pow(COOP.NHAN_VONG, vong) * (cuoi ? COOP.CUOI : 1),
};
