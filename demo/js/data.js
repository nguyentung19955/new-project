// DEMO "NEON GRID — Merge Defense" (cyberpunk) — DỮ LIỆU: tướng, bậc, Archfiend, quái, trùm, bố cục.
// TƯỚNG: làm lại từ đầu (03/11/2026); 04/11 gắn 3 tướng bộ v4 (SENTINEL, PULSE, ANCHOR) — ảnh demo/assets/v4/, định dạng ghi chú trong khối TUONG.
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
  Stitch:  { mau: '#ff6f91', toi: '#3a0a18', sang: '#ffd0dc', ten: 'STITCH' },   // PATCHWORK (BIẾN HÌNH)
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
//   dmg   : sát thương 1★ LV1       cd   : giây / đòn (02/11: nhịp chậm như DCDW — cd cũ ×1.7, LANCE 2.5s; dmg cũ ×1.5 để DPS không tụt quá; OVERCLOCK vẫn +35%)                        muc  : cách chọn mục tiêu (game.js MUC): dau | cuoi | gan | dongQuai | mauCao | mauThap | mauDay | chuaHieu | ngauNhien
//   keBuff: HỖ TRỢ 4 Ô KỀ (trên/dưới/trái/phải, không chéo): { k: 'tocDanh'|'chiMang'|'satThuong'|'lamCham', gt: số hoặc theo sao (0.2 = +20%) }
//           cộng dồn từ nhiều tướng hỗ trợ, trần CAU_HINH.KE_TRAN. chiMang = tỉ lệ đòn ×CHI_MANG_HE; lamCham = đòn của ô được buff làm chậm quái.
//   tam   : CẬN CHIẾN — tầm (ô) tới quái; ngoài ra ô phải sát hành lang (CAU_HINH.TAM_CAN_CHIEN)
//   don   : kiểu ra đòn (game.js DON): { k: 'dan', toc, so } đạn bay · { k: 'chem' } đánh ngay · { k: 'tia', xuyen } tia tức thời dừng ở mục tiêu
//   hieu  : danh sách hiệu ứng khi trúng (game.js HIEU): chay | bang | doc | hack | chuoi | hut | day | truyNa ...
//   dac   : skill riêng VÀNG/ĐỎ (game.js DAC_BIET): moiGioi | packet | phatNap ...; `chu` = kỹ năng CHỦ ĐỘNG chọn ô (game.js CHU_DONG), mở theo sao (tu)
//   hit   : loại tia trúng đòn (vfx_hit_<hit>.png: kinetic | frost | flame | electric)    proj : ảnh đạn proj_<proj>.png (mặc định = anh)
//   xoay  : true = ảnh xoay bằng code theo mục tiêu (drone WARP)
//   co    : HỆ SỐ CỠ riêng (1 = cỡ chuẩn C.TUONG_CAO). Tướng cầm súng trông nhỏ hơn nên phóng to hơn chút. Luôn neo chân.
//   nong  : ĐIỂM ĐẦU NÒNG theo hướng ảnh vẽ { s, sw, w, nw, n: [x, y] } — toạ độ px trong ảnh tĩnh <anh>_<dir>.png (khung 112).
//           Hướng lật gương (se, e, ne) tự đối xứng x. Đo bằng script (điểm xa nhất của vũ khí theo hướng nhìn) rồi xem bằng mắt.
//           ARC = mũi kiếm. WARP (xoay): chỉ cần `s` (toạ độ trong warp.png), xoay theo góc.
//   px    : TƯỚNG PIXEL ART (03/11, PATCHWORK là tướng đầu tiên) — ảnh trong demo/assets/v3/pixel/, render.js vePixel (không smoothing, scale nguyên):
//           dir8 : { file, o: cạnh ô, thuTu: [hướng của từng ô theo thứ tự trong ảnh] }      ảnh đứng yên 8 hướng (1 hàng)
//           idle : { <hướng>: { file, o, ms } }   sheet thở (ô vuông o, ms/khung) — chỉ hướng có sheet, hướng khác đứng ảnh tĩnh dir8
//           atk  : { file: { <d>: tên }, w, h, nhip: [ms từng khung], trung: chỉ số khung gây sát thương,
//                    huong: { s|se|e|ne|n|nw|w|sw: [d, lật gương 0/1] } }   — sát thương ra ĐÚNG đầu khung `trung` (game.js), không đánh nhanh hơn cả chuỗi
//           to   : hệ số cỡ khi ở dạng BIẾN HÌNH (v.toT > 0)
//           (04/11, bộ v4) thu  : thư mục ảnh trong demo/assets/ (vd. 'v4'); mặc định v3/pixel
//                          atk.file là CHUỖI = 1 sheet tấn công 8 hàng (thứ tự hàng = dir8.thuTu, 8 ảnh thật — KHÔNG lật gương) × n khung, ô vuông atk.o
//                          neo  : [x, y] CHÂN cố định trong ô sheet (đứng & tấn công đã căn chung bằng script → chuyển đứng↔tấn công không nhảy)
//                          nong : (tuỳ chọn) { <hướng>: [x, y] } điểm ra đòn trong ô sheet; không có thì ước lượng giữa thân + lệch theo hướng
//   hoTro : HỖ TRỢ KHÔNG BẮN (ANCHOR) { cd: giây giữa 2 lần phát sóng (chỉ hiệu ứng, theo tốc đánh), cot: true = vẽ CỘT NEO cạnh nhân vật }
//   don { k: 'luu', T, cao, r, so } : NÉM LỰU ĐẠN vòng cung (T giây, cao × cao ô) → nổ lan r ô, tối đa so quái (PULSE)
//           Neo chân: đáy phần hình + tâm chân (đo hàng đáy khung 0 mỗi ảnh) đặt đúng chỗ chân các tướng khác.
// ẢNH BỘ v4 (04/11): demo/assets/v4/<id>_dung.png (8 ô 192×192 1 hàng: s se e ne n nw w sw) + <id>_tc.png (8 hàng × 4 khung, ô 192).
// Ghép bằng script từ docs/demo-hop-tuong/nguon-tuong/moi/ (ảnh PixelLab, KHÔNG sửa pixel): ảnh đứng 128 đặt tại (32,32) trong ô; khung tấn công dịch theo
// độ lệch (dx,dy) tìm được để khung 0 khớp nhất ảnh đứng cùng hướng (so alpha + màu, thử ±24px), cùng độ dịch cho cả 4 khung → chân chung (96,147).
const V4 = (id, them) => Object.assign({ thu: 'v4', dir8: { file: id + '_dung', o: 192, thuTu: ['s', 'se', 'e', 'ne', 'n', 'nw', 'w', 'sw'] },
  atk: { file: id + '_tc', o: 192, nhip: [70, 70, 70, 70], trung: 1 }, neo: [96, 147] }, them || {});
const TUONG = {
  // 03 SENTINEL — lính gác bắn ổn định (docs/demo-hop-tuong/ho-so-tuong/03-SENTINEL.md): quái đi đầu, tầm toàn đường, 45 dmg, 0,9 đòn/s;
  //   mỗi 3★ thêm ĐÁNH DẤU +10% sát thương nhận vào (dùng hành vi hack: 1★ 0%, 3★ +10%, 6★ +20%). Đạn bắn ra ở đầu khung 1 (giật đầu+thân).
  sentinel: { bac: 'trang', ten: 'SENTINEL', chuc: 'SENTRY', hanh: 'Cryo', kieu: 'Steady shot', mo: 'Steady shots at the lead enemy. Every 3★: mark +10% damage taken.',
    dmg: 45, cd: 1 / 0.9, muc: 'dau', hit: 'kinetic', co: 1.0,
    don: { k: 'dan', toc: 1500 },
    hieu: [{ k: 'hack', moi: 1, T: 2, them: { 1: 0, 3: 0.1, 6: 0.2 } }],
    px: V4('sentinel') },
  // 04 PULSE — nổ lan (04-PULSE.md): quái đi đầu, tầm toàn đường, 24 dmg, 0,85 đòn/s, nổ 0,65 ô, tối đa 5 mục tiêu.
  //   Khung 2 của hoạt ảnh vung tay → sinh quả lựu đạn bay vòng cung (code) tới quái rồi nổ.
  pulse: { bac: 'trang', ten: 'PULSE', chuc: 'GRENADIER', hanh: 'Plasma', kieu: 'Splash grenade', mo: 'Lobs a grenade at the lead enemy: 0.65-tile blast, up to 5 targets.',
    dmg: 24, cd: 1 / 0.85, muc: 'dau', hit: 'flame', co: 1.0,
    don: { k: 'luu', T: 0.45, cao: 0.5, r: 0.65, so: 5 },
    px: V4('pulse', { atk: { file: 'pulse_tc', o: 192, nhip: [70, 70, 70, 70], trung: 2 } }) },
  // 05 ANCHOR — hỗ trợ KHÔNG bắn (05-ANCHOR.md): buff 4 ô kề +8% tốc đánh mỗi 2★ (1★ 8% · 3★ 16% · 5★ 24% · 7★ 32%).
  //   Cột neo là VẬT RIÊNG (render veCotNeo, tạm vẽ code); mỗi 3 giây đưa tay cầm điều khiển ra trước + vòng sóng xanh lục 4 ô kề.
  anchor: { bac: 'trang', ten: 'ANCHOR', chuc: 'ENGINEER', hanh: 'Hack', kieu: 'Support beacon', mo: 'Does not attack. Adjacent heroes (4 tiles) get +8% attack speed per 2★.',
    dmg: 0, cd: 3, muc: 'dau', co: 1.05,
    keBuff: { k: 'tocDanh', gt: { 1: 0.08, 3: 0.16, 5: 0.24, 7: 0.32 } },
    hoTro: { cd: 3, cot: true },
    px: V4('anchor', { atk: { file: 'anchor_tc', o: 192, nhip: [70, 70, 70, 70], trung: 2 } }) },

  // 03/11/2026: ĐÃ XOÁ HẾT tướng cũ (scorch, frost, arc, venom, lance, warp, broker/miner, glitch, patchwork) + ảnh của chúng.
  // Làm lại từ đầu theo docs/demo-hop-tuong/QUY-TRINH-HOAT-ANH.md. Danh sách rỗng → game vẫn chạy, nút SUMMON báo "CHƯA CÓ TƯỚNG".
  //
  // MẪU 1 TƯỚNG MỚI (dán vào đây, ảnh pixel đặt trong demo/assets/v3/pixel/<file>.png; KHÔNG sửa game.js/render.js):
  // tenId: { bac: 'trang', ten: 'TEN', chuc: 'CHỨC DANH', hanh: 'Plasma', kieu: 'Tên kiểu đánh', mo: 'Mô tả ngắn (tiếng Anh, hiện trên thẻ).',
  //   dmg: 30, cd: 1.7, muc: 'dau', hit: 'kinetic', co: 1.0,          // tam: 1.6 → CẬN CHIẾN (chỉ đánh khi đứng ô sát đường)
  //   don: { k: 'dan', toc: 900 },                                     // hoặc { k: 'chem' } · { k: 'tia', xuyen } · { k: 'dap', r, van, cham, T }
  //   hieu: [],                                                        // hiệu ứng khi trúng (game.js HIEU)
  //   // dac: { k: ..., chu: [...] }                                   // chỉ VÀNG/ĐỎ (game.js DAC_BIET / CHU_DONG)
  //   px: {
  //     dir8: { file: 'tenId_8dir', o: 128, thuTu: ['s', 'sw', 'w', 'nw', 'n', 'ne', 'e', 'se'] },             // đứng yên 8 hướng, 1 hàng ô vuông o
  //     idle: { s: { file: 'tenId_idle_s', o: 224, ms: 260 } /* , sw: {...}, ... từng hướng có sheet thở */ },
  //     atk: { file: { s: 'tenId_atk_s' /* , se, e, ne, n, nw, w, sw */ }, w: 224, h: 176,
  //       nhip: [200, 70, 70, 70, 120, 160, 120], trung: 4,          // ms từng khung; sát thương ra ĐÚNG đầu khung `trung`
  //       huong: { s: ['s', 0] /* , e: ['w', 1] = dùng sheet w lật gương */ } },
  //     to: 1.25 } },                                                  // cỡ khi BIẾN HÌNH (nếu có)
  // BO_MAC_DINH / BO_AI tạm lấy 5 tướng đầu; đổi thành danh sách id cụ thể khi đủ tướng.
};
const TUONG_IDS = Object.keys(TUONG);
const BO_MAC_DINH = TUONG_IDS.slice(0, 5);   // (tạm: 5 tướng đầu) bộ chọn sẵn ở màn chọn tướng (người chơi đổi được)
const BO_AI = TUONG_IDS.slice(0, 5);   // (tạm: 5 tướng đầu) đội hình dựng sẵn của bàn AI (PVP: AI MIRROR · CO-OP: đồng đội)
const AF_AI = 'overclock';                                    // Archfiend của bàn AI
// tên file ảnh của tướng (demo/assets/v3/<anh>.png ...)
const TEN_FILE = (id) => (TUONG[id] && TUONG[id].anh) || id;

// ARCHFIEND (ô thẻ thứ 6): kỹ năng chủ động dùng Energy, giá tăng sau mỗi lần dùng, có hồi chiêu. Chọn ở màn chọn tướng; bot AI cũng dùng.
//   k: 'tocDanh' = cả bàn đánh nhanh hơn (he) trong T giây · 'tuongLua' = xoá hiệu ứng trùm/tinh anh trên tướng + chặn hiệu ứng mới trong T giây
//   gia(n): giá lần dùng thứ n (n = số lần đã dùng) · cd: hồi chiêu (giây) · anh: chân dung tạm (portrait_<anh>.png)
// LUẬT NỀN DCDW: mỗi lần dùng Archfiend giá ×2 (giá gốc → ×2 → ×4 ...), trần AF_GIA_TRAN mana
const AF_GIA_TRAN = 1280;
const giaAFx2 = (goc, n) => Math.min(AF_GIA_TRAN, Math.round(goc * Math.pow(2, n)));
const ARCHFIEND = {
  // mat: [x, y, cỡ] (tỉ lệ 0..1 theo ảnh cutin_<id>.png) — vùng MẶT để cắt avatar nhỏ ở cổng + chân dung thẻ khi chưa có archfiend_<id>.png
  overclock: { ten: 'OVERCLOCK', mat: [0.40, 0.30, 0.42], mo: 'All heroes +35% attack speed, 6s', mau: '#ffb31a', anh: null, k: 'tocDanh', he: 0.35, T: 6, cd: 30,
    gia: (n) => giaAFx2(40, n) },
  firewall:  { ten: 'FIREWALL', mat: [0.48, 0.25, 0.42], mo: 'Cleanse + block boss/elite effects, 6s', mau: '#3ce7ff', anh: null, k: 'tuongLua', T: 6, cd: 35,
    gia: (n) => giaAFx2(30, n) },
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
// MỖI BÀN = khay lõm 5×3 + HÀNH LANG SÀN ôm mép TRÁI và mép DƯỚI bàn (quái sinh góc trên trái → xuống dọc mép trái → rẽ chạy dọc mép dưới
// → tới CỔNG / avatar Archfiend ở góc phải). Giữa 2 bàn là THANH GIỮA MỎNG (Round / giờ / tên trùm / cờ đầu hàng).
// game.js boCuc(H) tính ô (gần vuông, OH_MIN..OH_MAX), vị trí 2 bàn, hành lang, thanh giữa theo H.
const CAU_HINH = {
  W: 390, H: 844, H_MIN: 720, H_MAX: 960,
  COT: 5, HANG: 3, O: 64, OH: 70, KHE: 3, BUOC_X: 67, BUOC_Y: 73, OH_MIN: 50, OH_MAX: 70,
  BAN_X: 40, BAN_W: 345, BAN_H: 229, VIEN: 5, BAN_AI_Y: 80, BAN_NG_Y: 400,
  HL_X0: 4, HL_W: 34,                        // hành lang TRÁI: x 4..38 (tâm x 21), sát mép trái bàn
  HL_DAY: 36, HL_DAY_MIN: 32, HL_DAY_MAX: 44, // hành lang DƯỚI bàn: cao 32–44 (co giãn theo màn)
  DAU_SINH: 12,                              // khoảng trên mỗi bàn cho cổng sinh quái (góc trên trái)
  THANH_H: 24, THANH_Y: 0,                   // thanh giữa mỏng giữa 2 bàn (THANH_Y tính trong boCuc)
  TOP_H: 64, DUOI_H: 186, DUOI_DAY: 4,       // HUD trên cao 64; HUD dưới (Mana/SUMMON + thẻ) cao 186, cách đáy 4
  DUONG_AI: null, DUONG_NG: null, DUOI_Y: 0, GIUA_Y: 0,   // tính trong game.js boCuc(H)
  // CỠ TƯỚNG (thử 36–40 → chọn 44 trên ô ~64×70, xem TIEN-DO-V3.md): cao = clamp(TL_CAO × chiều cao ô, CAO_MIN, CAO_MAX) × hệ số riêng (TUONG[id].co)
  // rộng ≤ ô. CHÂN tướng đặt ở TL_CHAN × chiều cao ô tính từ mép trên (0.75 = gần đáy ô như DCDW; khoảng nên dùng 0.72–0.78) → CHAN = khoảng cách chân–đáy ô (game.js boCuc tính lại)
  // BONG: bóng đổ mềm sát chân (elip tối, rộng BONG_W × rộng ô, dẹt BONG_DET, độ đậm BONG_A) để tướng "chạm sàn". KHÔNG còn đế màu bậc trên bàn (bậc chỉ hiện ở thẻ + màn chọn tướng).
  // 02/11 skin bàn: ô theo ảnh skin (~57×47, rộng hơn cao) → chân ở 80%, cao 82% ô để tướng đầy ô như DCDW
  // 04/11 bộ v4: nhân vật cao ~1,2 ô (TL_CAO 1.2), chân đặt GIỮA ô (TL_CHAN 0.62, hơi thấp hơn tâm để đầu không đè ô trên quá nhiều)
  TL_CHAN: 0.62, BONG_W: 0.45, BONG_DET: 0.24, BONG_A: 0.35,
  TL_CAO: 1.2, CAO_MIN: 40, CAO_MAX: 90, CHAN: 17, TUONG_CAO: 44, TUONG_RONG: 64,
  TL: 58 / 70,          // tỉ lệ không gian so với bản ngang cũ — nhân bán kính vùng hiệu ứng
  // ANIMATION (tư vấn ChatGPT bước 3–4): SHEET_TUONG = false → tướng luôn là ẢNH TĨNH theo hướng (<anh>_<dir>.png), dịch NGUYÊN KHỐI bằng code:
  //   idle: nhún ±NHUN px, chu kỳ NHUN_T giây · attack 240ms: lùi LUI px (LUI_T) → lao tới LAO px (LAO_T, đạn phát ĐÚNG lúc này từ đầu nòng) → về (VE_T)
  //   có ảnh <anh>_atk_<dir>.png thì đổi sang ảnh đó ~ATK_ANH giây lúc ra đòn.
  // HƯỚNG QUAY theo quái (game.js chonHuong / buocHuong / capNhatHuong) — chống giật kiểu DCDW:
  //   chỉ đổi hướng khi CHỌN MỤC TIÊU MỚI hoặc quái lệch > LECH độ so với hướng đang nhìn; tối thiểu DOI_MIN giây giữa 2 lần đổi
  //   đổi xa (> 45°) thì đi qua các hướng trung gian, mỗi nấc BUOC giây (cảm giác xoay người)
  //   không có quái > VE_S giây → từ từ quay về MAC_DINH (2 = nhìn xuống, phía hành lang dưới), mỗi nấc BUOC_VE giây
  //   WARP (xoay bằng code): nội suy góc LERP /giây · NHIN: dò mục tiêu mỗi 0.05s
  // 04/11: đổi hướng đi qua lần lượt các hướng kề, mỗi bước 0,05 s (không nhảy cóc, không lật gương — 8 ảnh thật)
  HUONG: { DOI_MIN: 0.25, LECH: 30, BUOC: 0.05, BUOC_VE: 0.12, VE_S: 1.2, MAC_DINH: 2, LERP: 7, NHIN: 0.05 },
  SHEET_TUONG: false, ATK_ANH: 0.12, NHUN: 0.5, NHUN_T: 1.7, LUI: 1.5, LUI_T: 0.07, LAO: 2.5, LAO_T: 0.045, VE_T: 0.125, CHOP_NONG: 0.07,
  TAC_DONG: 0.07, GIU_KHUNG: 0.045,          // đạn ra sau LUI_T (70ms) kể từ lúc bắt đầu đòn
  HIT_FX: 0.12, HIT_PX: 16, SINH_T: 0.22, GOP_T: 0.18,   // trúng đòn 120ms (đỉnh ~12px), summon 220ms, merge 180ms
  HIT_STOP: { tia: 0.03, chuoi: 0.025 },   // hit-stop ngắn cho đòn mạnh (tia LANCE, nhịp sét chuỗi)
  FX_NHO_MAX: 16,       // tối đa 16 hiệu ứng trúng đòn nhỏ cùng lúc
  DAI_CU: 1272,         // chiều dài đường quái bản ngang cũ (px) — tốc độ quái nhân (dài làn / DAI_CU) để thời gian đi hết làn như cũ
  SAO_MAX: 7, BAC_MAX: 5, MANG: 3, LK_DAU: 100,
  giaTrieu: (n) => 10 * (n + 1),                       // LUẬT NỀN DCDW: lần triệu hồi thứ n giá 10n (10, 20, 30...) — n ở đây = số lần ĐÃ triệu, reset đầu trận
  // CẬN CHIẾN (TUONG[id].tam): chỉ ra đòn nếu tâm ô cách TÂM HÀNH LANG ≤ TAM_CAN_CHIEN × cạnh ô (BUOC_X); quái phải trong td.tam ô
  TAM_CAN_CHIEN: 1.25,
  // HỖ TRỢ 4 Ô KỀ (TUONG[id].keBuff): trần tổng buff một ô nhận được (GDD mục 1.4): tốc đánh +150%, sát thương +200%, làm chậm 60%, chí mạng 100%
  KE_TRAN: { tocDanh: 1.5, satThuong: 2.0, lamCham: 0.6, chiMang: 1 }, CHI_MANG_HE: 2,
  giaBac: (b) => [80, 160, 300, 500, 800][b],          // giá nâng cấp LOẠI tướng b → b+1 (áp dụng cho mọi bản sao loại đó)
  heSoSao: (s) => Math.pow(2.2, s - 1),
  heSoBac: (b) => 1 + 0.4 * b,
  mauDot: (w) => 18 * Math.pow(1.21, w - 1) * (1 + 0.03 * w),
};
if (CAU_HINH.SHEET_TUONG) CAU_HINH.TAC_DONG = 3 / 14;

// ===== SKIN BÀN kiểu DCDW (mỗi người chơi một skin bàn riêng) — thế giới NEON FRACTURE =====
// Ảnh ChatGPT vẽ: demo/assets/v3/skin_<id>.png = CẢ KHU BÀN nhìn 82° (khay lõm 5×3 ô + hành lang chữ L dọc mép TRÁI và mép DƯỚI + trang trí viền), nền trong suốt.
// Code chỉ thu nhỏ ĐỀU ảnh (không méo) sao cho LƯỚI 5×3 trong ảnh trùng ô logic; quái đi đúng hành lang trong ảnh (trái → dưới → cổng phải).
// Toạ độ ĐO BẰNG SCRIPT (khe tối giữa các ô / mép khay / sàn hành lang), theo TỈ LỆ 0–1 của ảnh (w × h px):
//   grid: [x0, y0, x1, y1] mép ngoài lưới 5×3
//   lane: x = tâm hành lang TRÁI, y = tâm hành lang DƯỚI, top = đầu hành lang trái (chỗ quái sinh), end = cuối hành lang dưới (cổng),
//         w = bề rộng hành lang trái (tỉ lệ bề ngang ảnh), h = bề cao hành lang dưới (tỉ lệ bề cao ảnh)
// Thêm skin mới = thêm ảnh + 1 mục ở đây (đo lại bằng script). Người chơi chọn ở màn chọn tướng (mặc định 'da'); bàn trên lấy ngẫu nhiên skin khác.
const SKIN = {
  da:    { ten: 'STONE', w: 729, h: 506, grid: [0.2455, 0.2510, 0.8642, 0.6957], lane: { x: 0.1523, y: 0.8281, top: 0.1976, end: 0.83, w: 0.1125, h: 0.154 } },
  bang:  { ten: 'ICE',   w: 728, h: 507, grid: [0.2459, 0.2525, 0.8640, 0.6963], lane: { x: 0.1525, y: 0.8245, top: 0.1972, end: 0.85, w: 0.1126, h: 0.158 } },
  samac: { ten: 'SAND',  w: 729, h: 489, grid: [0.2455, 0.2720, 0.8628, 0.7321], lane: { x: 0.1523, y: 0.8671, top: 0.2168, end: 0.80, w: 0.1125, h: 0.1616 } },
  rung:  { ten: 'FOREST', w: 746, h: 489, grid: [0.2547, 0.2720, 0.8552, 0.7321], lane: { x: 0.1635, y: 0.8671, top: 0.2168, end: 0.82, w: 0.1086, h: 0.1677 } },
};
const SKIN_IDS = Object.keys(SKIN);
CAU_HINH.SKIN_NG = 'da'; CAU_HINH.SKIN_AI = 'bang';   // skin bàn dưới (người chơi) / bàn trên (AI, đồng đội) — ui.js đặt khi vào trận (game.js datSkin)

// ===== CHẾ ĐỘ CO-OP (kiểu Defense War co-op): 2 bàn (trên = ĐỒNG ĐỘI AI, dưới = người chơi), quái đi MỘT đường chung =====
// Đường: sinh ở đầu làn trên → hết làn trên → đường nối → hết làn dưới → trừ mạng chung. Mọi con số dưới đây là núm chỉnh cân bằng (thử nghiệm).
// w = số wave (1..70)
const COOP = {
  DOT_MAX: 70,          // qua (dọn sạch) wave 70 = thắng
  MANG: 1,              // LUẬT NỀN DCDW (Infinite Defense): CHỈ 1 QUÁI LỌT TỚI CỔNG LÀ THUA (trước: 10 mạng)
  MAT_QUAI: 1,          // mạng mất khi 1 quái thường lọt
  MAT_BOSS: 1,          // mạng mất khi trùm lọt
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
