// Dữ liệu game: hệ, vũ khí, hero, quái, vùng, trang bị. Mọi con số cân bằng nằm ở đây.
// ===== MỤC LỤC BẢNG CÂN BẰNG (đợt 4, YEU-CAU-4-RESET-CAN-BANG.md; tính thử số liệu: node tools/can-bang/tinh.js) =====
//   Vũ khí: G.WTYPES (đòn gốc), G.STAGE_MULT (hệ số cấp), G.VK_MOI (giá linh khí nâng / đổi hệ) — nhịp, hệ số từng nhát: G.MOVES (js/moves.js)
//   Mài, lò: G.sharpenCost / G.sharpenFull, G.MAX_SHARPEN, G.FORGE_CAP, G.FORGE_UP; đá tôi đổi quặng: G.DA_TOI_QUANG
//   Nhân vật: G.HEROES.smith (máu, mana gốc), G.LVL_HP, G.LVL_DMG, G.xpNeed, G.MAX_LEVEL, G.SKILLS (cây kỹ năng), G.ZED_DAY (bạn dạy)
//   Chưởng: G.CHUONG (js/chuong.js) · Skill bộ: G.SKILL_BO · Nâng bộ: G.BO_MOI
//   Quái, trùm: G.ROLES, G.STAGE_K, G.stageStats, G.MINI_HP, G.BOSS_HP_OF, G.DIFF2 · Khuyên dùng: G.STAGE_REC, G.grindMult
//   Ép đồ (bậc vũ khí, đá nâng bậc): G.EP_DO · Ải theo ngày: G.AI_NGAY (đợt 6)
//   Thu nhập: G.LINHKHI (linh khí hạ tinh anh / trùm), G.ROI_MOI + G.DROP (thưởng thay đồ rơi), G.stageStats (kinh nghiệm, vàng qua ải),
//     G.DOI_NL (đổi vàng lấy nguyên liệu); quặng / nguyên liệu qua ải: js/stage.js settle (3 + sao + 2 × vùng quặng, 5 + ải nguyên liệu)
(function () {
  const G = (window.G = window.G || {});
  G.W = 480;
  G.H = 270;
  G.GY0 = 142; // mép trên của dải mặt đất
  G.GY1 = 236; // mép dưới của dải mặt đất

  // Đợt 6 (quyết định Q2): sàn, tường, nền ngoài và cỏ mép của vùng RỪNG GIÀ lát bằng tile 16×16 (ảnh gd-nen-rung-*; js/room_art.js).
  // ĐÂY LÀ CHỖ DUY NHẤT để tắt: đổi true thành false là Rừng già vẽ bằng code y như trước. Thiếu tệp ảnh thì game cũng tự vẽ bằng code.
  // Thử nhanh không cần sửa code: thêm ?tile=0 vào cuối địa chỉ trang.
  G.TILE_RUNG = true;
  if (typeof location !== 'undefined' && /[?&]tile=0(&|$)/.test(location.search || '')) G.TILE_RUNG = false;
  // Vũ khí cũ còn sót (14/10, docs/review/ke-hoach-cai-thien/vu-khi-cu-con-sot/YEU-CAU.md): mặc định KHÔNG còn vẽ hình cũ ở bất kỳ đâu
  // (vũ khí bay ở làng, giáo tre Phi Thương, biểu tượng nút vẽ code, icon vũ khí cũ lúc chờ ảnh, nhân vật / người làng / nhà vẽ code lúc chờ ảnh,
  // sậy, áo phơi vẽ code). 15/10 don-tep B: bỏ cờ ?vkcu=1 (G.VK_CU) cùng các nhánh vẽ cũ.
  // 14/10 (YEU-CAU-MOC-HO-HIEU-UNG-NEN.md): sàn, tường, nền ngoài, phủ mép của HANG BIỂN và LÂU ĐÀI CỔ lát bằng ảnh (gd-nen-bien-*, gd-nen-lau-*;
  // js/room_art.js tileVung), cùng chuẩn bộ Rừng. Thiếu tệp bắt buộc thì vẽ code như cũ. Tắt: ?nentile=0 (hoặc G.NEN_TILE = false).
  G.NEN_TILE = true;
  if (typeof location !== 'undefined' && /[?&]nentile=0(&|$)/.test(location.search || '')) G.NEN_TILE = false;
  // BƯỚC 3 — VÙNG 4 SÔNG SÂU (docs/ke-hoach/buoc-3/KE-HOACH.md, phiên 1 "khung chạy bằng hình tạm"). G.VUNG4 = true: thêm vùng thứ 4 (mã 'song',
  // chỉ số 3) vào G.REGIONS và mọi bảng theo vùng / theo ải (15 → 20 ải). Tắt: ?vung4=0 (hoặc G.VUNG4 = false trước khi nạp) → game y hệt 3 vùng.
  if (G.VUNG4 === undefined) { let tat = false; try { tat = typeof location !== 'undefined' && /[?&]vung4=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; } G.VUNG4 = !tat; }

  G.EL = {
    fire: { name: 'Lửa', col: '#ff7a2a', col2: '#ffd23f', dark: '#a8320a' },
    poison: { name: 'Độc', col: '#6fcf3a', col2: '#c2f58a', dark: '#2f6b1a' },
    ice: { name: 'Băng', col: '#7fd4ff', col2: '#e9f9ff', dark: '#2b6ea3' },
  };
  G.ELS = ['fire', 'poison', 'ice'];
  // Trùm kháng hệ X thì yếu với WEAK[X]
  G.WEAK = { fire: 'ice', ice: 'poison', poison: 'fire' };

  // LƯU Ý (V35): "cd" dưới đây KHÔNG phải nhịp đánh thật trong trận. Nó chỉ là số dự phòng cho lối đánh cũ
  // (combat.js startAttack/doHit, chỉ chạy khi thiếu moves.js). Nhịp thật là thời gian từng nhát trong G.MOVES (moves.js):
  // kiếm 0,30 + 0,30 + 0,46 giây; giáo 0,38/0,34/0,34 + quét 0,52; búa 0,8; cung 0,38 đứng yên / 0,45 vừa chạy.
  // Tính sát thương mỗi giây (DPS) phải dùng G.MOVES, không dùng "cd". Không đổi số ở đây.
  G.WTYPES = {
    sword: { name: 'Kiếm', dmg: 9, cd: 0.36, reach: 32, depth: 17, special: 'Trảm Nguyệt' },
    // Sửa góp ý 3 (càng chậm hoặc càng phải áp sát thì mỗi đòn càng mạnh): cung 9 -> 11 mỗi phát (vẫn dưới kiếm) nhưng tên xuyên và
    // mưa tên yếu đi hẳn (G.MOVES.bow), để cung an toàn nhất có sát thương mỗi giây thấp nhất, cả khi đánh một con lẫn cả cụm;
    // búa 23 -> 22 (vẫn mạnh nhất mỗi đòn).
    // Cân bằng phải cày: giáo 11 -> 10,7, búa 22 -> 21,3. Sau khi gộp "tám hướng" (đòn cận chiến tự ngắm quái gần nhất) kiếm mạnh
    // vượt hẳn (kiếm 84,6 so với giáo 71, búa 74 trên bia tập) nên kiếm 10 -> 9 và cung 11 -> 11,4 (mỗi phát vẫn dưới một nhát kiếm):
    // cung thấp hơn kiếm 19% trên bia tập, khoảng 29% trên quái mới thật (tests/dps.py, 8 và 12 hạt giống).
    bow: { name: 'Phi tiêu', dmg: 11.4, cd: 0.5, ranged: true, special: 'Mưa Phi Tiêu' }, // 14/10: tên mới ngay từ bảng (trước là Cung / Mưa Tên rồi đổi ở dưới)
    spear: { name: 'Thương', dmg: 10.7, cd: 0.44, reach: 56, depth: 12, special: 'Phi Thương' },
    hammer: { name: 'Búa', dmg: 21.3, cd: 0.8, reach: 32, depth: 25, stagger: 0.4, special: 'Địa Chấn' },
  };
  G.WKEYS = ['sword', 'bow', 'spear', 'hammer'];
  // BỐN BẬC MÀU của vũ khí (thay ba bậc Sắt, Bạc, Linh cũ). mult: hệ số sát thương gốc; maxStage: mốc tiến hóa cao nhất
  // (2 là Thành hình, 3 là Thức tỉnh); affixes: số dòng phụ; power: có thêm một dòng mạnh riêng. col: màu chữ, frame: màu khung ô đồ.
  G.RARITY = [
    { key: 'thuong', name: 'Thường', mult: 1, maxStage: 2, affixes: 0, power: false, col: '#d6d2c8', frame: '#8f8c86', bg: '#34323a' },
    { key: 'lam', name: 'Lam', mult: 1.15, maxStage: 3, affixes: 1, power: false, col: '#6fb2ff', frame: '#3f86e8', bg: '#1c2f52' },
    { key: 'tim', name: 'Tím', mult: 1.3, maxStage: 3, affixes: 2, power: false, col: '#c88cff', frame: '#9a4fe0', bg: '#33204f' },
    { key: 'vang', name: 'Vàng', mult: 1.5, maxStage: 3, affixes: 2, power: true, col: '#ffd24a', frame: '#f0b020', bg: '#4a3812' },
  ];
  G.TIERS = G.RARITY; // tên cũ, giữ cho mã và bài kiểm tra cũ
  // Vũ khí Vàng của vùng sau có sát thương gốc cao hơn: vùng 1 x1,5; vùng 2 x1,6; vùng 3 x1,7 (w.gold = 0, 1, 2).
  G.GOLD_MULT = [1.5, 1.6, 1.7];
  G.FAMILIES = 1; // đợt 2: mỗi loại vũ khí chỉ còn một dòng vẽ code (js/weapon_art.js); trước là 10
  // Phiên cân bằng (báo cáo tester mục 2): mốc cũ 30/120/300 làm vũ khí Thức tỉnh ngay ải 1-5 (bot: Thức tỉnh ở 2-2..2-4), dấu ấn
  // về sau bỏ phí. Đề xuất của tester là 60/400/1.200, nhưng đo 8 lượt tests/campaign.py thì lúc vào 3-5 kiếm mới có ~740-1.020
  // dấu ấn (Thức tỉnh rơi ra sau cả chiến dịch), nên mốc cuối 900: Mầm ở 1-1..1-2, Thành hình quanh 2-5..3-2, Thức tỉnh quanh 3-4..3-5.
  // Bản lưu cũ được chuyển đổi khi nạp (js/linhkhi.js, LK.chuyenBanLuu): dấu ấn kéo giãn theo từng đoạn, không vũ khí nào tụt bậc.
  G.MARKS = [60, 400, 900];
  G.MARKS_CU = [30, 120, 300]; // mốc của bản lưu cũ (chỉ dùng để chuyển đổi)
  G.STAGE_NAMES = ['Trắng', 'Mầm', 'Thành hình', 'Thức tỉnh'];
  // Mỗi mốc tiến hóa tăng sát thương gốc. Trước là +4/+8/+12% (bỏ cả lớp tiến hoá chỉ mất 5% Sức mạnh); nay +8/+18/+30% (~10-11%).
  G.STAGE_MULT = [1, 1.08, 1.18, 1.3];
  // Dấu ấn thừa: vũ khí đã Thức tỉnh, cứ mỗi bấy nhiêu dấu ấn của hệ chính vượt mốc cuối thì đổi ra 1 nguyên liệu vùng
  // (Độc ra Gỗ linh, Băng ra Vảy cá, Lửa ra Đá lửa), tự động, ghi ở màn kết quả.
  G.LK_THUA = 100;
  G.LK_THUA_MAT = { poison: 0, ice: 1, fire: 2 };
  G.PROC = [0, 0.2, 0.5, 1];
  // NGUỒN LINH KHÍ (góp ý của chủ dự án: kiếm linh khí bằng cách hạ tinh anh và trùm, quái thường thỉnh thoảng rơi linh khí để nhặt).
  //  - Hạ tinh anh, trùm nhỏ, trùm vùng: vũ khí kết liễu luôn nhận bấy nhiêu dấu ấn. Hệ: hệ quái đang dính lúc gục (cách dùng của bé),
  //    không dính gì thì hệ của vùng (Rừng già Độc, Hang biển Băng, Lâu đài cổ Lửa).
  //  - Quái thường: tỉ lệ drop rơi một viên linh khí của vùng nằm trên sàn, nhặt (đi lại gần) thì vũ khí đang cầm nhận orb dấu ấn.
  //  - Vẫn giữ luật cũ: kết liễu quái thường đang dính hiệu ứng hệ thì vũ khí nhận 1 dấu ấn của hệ đó.
  G.LINHKHI = { elite: 5, mini: 10, boss: 20, drop: 0, orb: 3 }; // drop 0: chủ dự án bỏ viên rơi từ quái thường (tinh anh, trùm đã đủ)

  // ===== HỆ THỐNG MỚI ĐỢT 1 (13/10/2026, docs/review/ke-hoach-cai-thien/he-thong-moi/YEU-CAU-1-VU-KHI.md) =====
  //  - Đúng 4 vũ khí cố định: Kiếm, Thương (giáo), Búa, Phi tiêu (loại 'bow'). Nút đổi vũ khí xoay vòng 4 món.
  //  - Nâng vũ khí bằng LINH KHÍ (một túi chung sv.linhKhi, nhận khi hạ tinh anh, trùm, kết liễu quái đang dính hệ):
  //    Trắng → Mầm (chọn hệ Lửa/Độc/Băng) → Thành hình → Thức tỉnh. Đổi hệ sau đó tốn linh khí. Không còn bậc màu, dòng phụ, dòng vũ khí.
  //  - Không rơi vũ khí, quần áo nữa: thay bằng linh khí / vàng (G.ROI_MOI). Trang phục chỉ còn 4 bộ của Zed, mỗi bộ nâng 3 cấp
  //    bằng linh khí + vàng (G.BO_MOI; skill của từng cấp làm ở đợt 3, móc rỗng G.boSkill trong js/vk_moi.js).
  //  - Luật, chuyển bản lưu cũ, giao diện: js/vk_moi.js và js/vk_moi_lang.js.
  // Đợt 2 (YEU-CAU-2-DON-CU.md): bỏ cờ quay lui ?hethongcu=1 — luật cũ không còn (cờ G.HE_MOI đã xoá khi dọn code 13/10).
  G.VK_MOI = {
    loai: ['sword', 'spear', 'hammer', 'bow'], // 4 vũ khí (thứ tự hiện trong bảng)
    // Thứ tự xoay vòng của bản lưu mới: kiếm rồi phi tiêu như hai món đầu game cũ (ải hướng dẫn dạy đổi sang phi tiêu).
    // Người chơi đổi được vũ khí cầm đầu ("Cầm đầu" ở Ông Thợ Rèn / Hành trang); bản lưu cũ: món đang mang lên trước.
    thuMacDinh: ['sword', 'bow', 'spear', 'hammer'],
    family: { sword: 0, spear: 0, hammer: 0, bow: 0 }, // dòng cố định (đợt 2: mỗi loại một dòng; hình chính dùng bộ zed-vk)
    // Linh khí để lên Mầm, Thành hình, Thức tỉnh.
    // Đợt 4 (soát cân bằng, tools/can-bang/tinh.js): 60/340/500 → 100/400/800 (cộng dồn 100/500/1.300). Linh khí nay là MỘT túi chung,
    // lại thêm phần thưởng thay đồ rơi, nên thu nhập gấp ~2-3 lần dấu ấn của một vũ khí ở luật cũ: giá cũ cho Mầm ngay sau ải 1-1,
    // Thức tỉnh ngay đầu vùng hai. Giá mới: Mầm sau ~2 ải, Thành hình quanh trùm vùng 1, Thức tỉnh (món chính) quanh 2-1..2-4.
    // Đợt 5 (bot chơi thật, tests/cay.py): 100/400/800 cho Thành hình ở 2-3 (mục tiêu: quanh trùm vùng 1) vì bot thu ~45-65 linh khí
    // mỗi lượt và chỉ cày ~10 lượt hết vùng một (mô hình đợt 4 tính cày nhiều hơn) → Thành hình 400 → 300 (cộng dồn 100/400/1.200).
    gia: [100, 300, 800],
    // Đổi hệ khi đang ở Mầm / Thành hình / Thức tỉnh (giữ nguyên cấp).
    doiHe: [0, 20, 60, 120],
  };
  // Bỏ bậc màu: mọi vũ khí là bậc 0 (hệ số 1, không dòng phụ) nhưng lên được tới Thức tỉnh. Bù phần hệ số bậc cũ (Lam x1,15 … Vàng x1,5)
  // bằng hệ số cấp cao hơn (cũ +8/+18/+30%).
  G.SWAP_CD = 0.75; // chờ giữa hai lần đổi vũ khí: 4 món xoay vòng nên ngắn hơn (luật cũ 1,5)
  G.RARITY[0].maxStage = 3;
  G.STAGE_MULT = [1, 1.15, 1.35, 1.6];
  // Nâng cấp bộ trang phục Zed: 3 cấp, mỗi cấp tốn linh khí + vàng (giống nhau cho cả 4 bộ).
  // Đợt 4 (soát cân bằng): vàng 300/800/1.800 → 500/1.500/3.000 (mô hình tools/can-bang/tinh.js: giữa vùng hai đã dư ~7.000 vàng không có
  // chỗ tiêu); thêm MẢNH TRÙM (manh) ở cấp 2, 3 — mảnh trùm của vùng mở bộ đó (bộ Ninja dùng mảnh Mộc Tinh), mỗi lần hạ trùm vùng +3 mảnh:
  // cấp 1 nâng được ngay khi vừa có bộ (15/10: bộ vùng phải MUA bằng vàng trước, G.BO_MUA), cấp 2 cần 3 mảnh (đủ ngay lần hạ trùm đầu), cấp 3 cần 6 mảnh (phải cày lại trùm vùng thêm 2 lần).
  // Mảnh trùm trước đây chỉ dùng để nâng bậc Vàng (đã bỏ ở đợt 1) nên đang vô dụng.
  G.BO_MOI = {
    max: 3,
    // 15/10 (bo-do-mua): vàng cấp 1 500 → 300 để bù phần vàng phải bỏ ra MUA bộ vùng (G.BO_MUA): mô hình tools/can-bang/tinh.js
    // (có mua bộ) 33 → 32 lượt so với 30 lượt khi bộ được tặng; bot tests/cay.py --node: tổng thời gian lệch < 2% (bảng ở bo-do-mua/bao-cao.md).
    gia: [{ lk: 80, vang: 300, manh: 0 }, { lk: 200, vang: 1500, manh: 3 }, { lk: 400, vang: 3000, manh: 6 }],
    vungManh: { ninja: 0, rung: 0, bien: 1, lau: 2 }, // mảnh trùm của vùng nào
  };
  // ===== HỆ THỐNG MỚI ĐỢT 3: SKILL RIÊNG CỦA 4 BỘ TRANG PHỤC (docs/review/ke-hoach-cai-thien/he-thong-moi/YEU-CAU-3-SKILL-BO.md) =====
  // BẢNG HẰNG SỐ DUY NHẤT để chỉnh cân bằng skill bộ. Mỗi bộ 3 skill theo thứ tự cấp 1, 2, 3; cấp sau giữ skill cấp trước.
  // Skill chỉ có tác dụng khi ĐANG MẶC bộ đó (G.zedBo()). Luật trong trận + hiệu ứng: js/bo_skill.js (G.boSk); mô tả trong bảng nâng bộ
  // tự ghép từ các số dưới đây (đổi số là mô tả đổi theo). Thời gian tính bằng giây, tỉ lệ 0,3 = 30%, khoảng cách bằng điểm ảnh game.
  // Cờ tắt toàn bộ skill bộ: thêm ?skillbo=0 vào địa chỉ trang (G.SKILL_BO_BAT = false; nâng bộ vẫn được, chỉ không có tác dụng).
  G.SKILL_BO = {
    ninja: [
      { ma: 'bongLuot', ten: 'Bóng lướt', cuaSo: 1, them: 0.3 },          // lộn xong, đòn đầu tiên trong cuaSo giây +them sát thương
      // Đợt 4: thêm hồi 4 giây (trước không hồi: lộn hồi ~1 giây nên lộn liên tục gần như lúc nào cũng có bóng hút quái)
      // 14/10 (bước 1, mục 3): trum = tỉ lệ lần trùm nhỏ / trùm vùng chọn mục tiêu ra chiêu mà nhắm vào bóng (khi có bóng); chiêu đang ra không đổi
      { ma: 'phanThan', ten: 'Phân thân', giay: 1.5, hoi: 4, trum: 0.3 }, // lộn để lại bóng đứng tại chỗ giay giây, quái thường nhắm vào bóng; hồi hoi giây
      { ma: 'amSat', ten: 'Ám sát', hoi: 4 },                             // đánh trúng từ sau lưng quái: chắc chắn chí mạng (x2), hồi hoi giây
    ],
    rung: [
      { ma: 'nhuaRung', ten: 'Nhựa rừng', dung: 1, hoi: 0.01 },           // đứng yên >= dung giây: hồi hoi x máu tối đa mỗi giây
      { ma: 'gaiDoc', ten: 'Gai độc', chong: 1, satThuong: 0.5 },         // quái đánh trúng Zed: chong lớp độc, độc tính theo satThuong x đòn vũ khí đang cầm
      { ma: 'bayDayLeo', ten: 'Bẫy dây leo', giay: 1.5, trum: 0.4 },      // đòn giữ rồi thả trói chân quái trúng đòn giay giây (trùm: giay x trum)
    ],
    bien: [
      // Đợt 4: khiên đỡ tối đa toiDa x máu tối đa mỗi lần (0,25) — trước chặn trọn cả đòn trùm vùng ba (~150-195 gốc, ~50-60% máu Zed)
      // mỗi 10 giây. Đòn quái thường (~15-20% máu) vẫn bị chặn trọn; đòn to hơn thì khiên vỡ, phần vượt vẫn trúng.
      // Đợt 5 (bot đo, tests/cay.py): 10 giây / 25% → 15 giây / 10%. Người chơi né tốt chỉ trúng ~1 đòn mỗi 20-40 giây nên khiên hồi kịp
      // chặn gần MỌI đòn: bot đo khiên ăn 57-63% tổng sát thương ở vùng ba, thắng Hồ Tinh 21/40 so với 2/24 khi không có khiên
      // (cùng bản lưu). Số mới: khiên ăn ~25-30% sát thương, thắng 9/40 — vẫn là skill thủ mạnh nhất nhưng không gánh cả vùng ba.
      { ma: 'khienNuoc', ten: 'Khiên nước', hoi: 15, toiDa: 0.1 },        // có 1 lớp khiên chặn 1 đòn (tối đa toiDa x máu tối đa); vỡ thì sau hoi giây có lại (vào ải có sẵn)
      { ma: 'songDoi', ten: 'Sóng dội', banKinh: 40, day: 24 },           // lộn đẩy lùi quái trong banKinh ra thêm day điểm ảnh (trùm không bị đẩy)
      // 14/10 (bước 1, mục 3): trum = phần hiệu lực lên trùm nhỏ / trùm vùng (0,5: chậm còn 1 − 0,5 × (1 − cham) = 0,75 tốc độ đi và nhịp ra chiêu)
      { ma: 'thuyTrieu', ten: 'Thuỷ triều', giay: 2, banKinh: 60, cham: 0.5, trum: 0.5 }, // khiên vỡ: quái trong banKinh chậm còn cham x tốc độ trong giay giây
    ],
    lau: [
      { ma: 'giapBac', ten: 'Giáp bạc', giam: 0.1 },                      // giảm giam sát thương nhận (nhân sau giảm sát thương sẵn có)
      { ma: 'phanDon', ten: 'Phản đòn', cuaSo: 0.2, phan: 0.5 },          // lộn trong cuaSo giây trước khi đòn quái trúng: phản lại phan x sát thương đòn đó
      { ma: 'khiThe', ten: 'Khí thế', mau: 0.3, them: 0.25 },             // máu dưới mau x tối đa: +them sát thương tới hết ải, mỗi ải 1 lần (chữ bay báo)
    ],
  };
  G.SKILL_BO_BAT = true;
  try { if (typeof location !== 'undefined' && /[?&]skillbo=0(&|$)/.test(location.search || '')) G.SKILL_BO_BAT = false; } catch (e) { /* giữ mặc định */ }
  // Phần thưởng thay đồ rơi (r = vùng 0..2). Giữ tổng giá trị tương đương: món cũ tính theo giá Bà Hàng Xén mua lại
  // (vũ khí Thường 20, Lam 60, Tím 150, Vàng 400; trang phục 10/30/80/200), 1 linh khí = 4 vàng (G.upg.VAL.lk). Bảng so: bao-cao-1.md.
  G.ROI_MOI = {
    vk: { vang: [20, 25, 35], lk: [4, 6, 8] },        // tinh anh (35%) và qua ải thường (50%): trước rơi 1 vũ khí
    trum: { vangDau: 300, lkDau: 25, vang: 130, lk: 12 }, // trùm vùng: lần đầu (trước chắc chắn Vàng), đánh lại (trước Tím, 12% Vàng)
    ruong: { lk: [9, 12, 16] },                       // rương báu: lựa chọn "vũ khí mới" thành túi linh khí
    ao: { vang: [14, 18, 24] },                       // quái thường (1,2%) / tinh anh (12%) trước rơi 1 món trang phục
    aoTrum: { vang: [30, 32, 35] },                   // trùm nhỏ (35%) trước rơi trang phục Lam trở lên
    aoTrumVung: 110,                                  // trùm vùng trước rơi trang phục Tím (75%) / Vàng (25%)
    bua: 30,                                          // bùa cũ của tinh anh (trang phục Lam)
  };
  // Vùng 4 (G.VUNG4): phần tử thứ 4 nối theo đường tăng của 3 vùng cũ — số xuất phát, phiên cân bằng (bước 3 phiên 4) đo lại bằng bot.
  if (G.VUNG4) { const R4 = G.ROI_MOI; R4.vk.vang.push(45); R4.vk.lk.push(10); R4.ruong.lk.push(20); R4.ao.vang.push(30); R4.aoTrum.vang.push(38); }
  // Dòng phụ: bậc Lam có 1, Tím và Vàng có 2.
  // ===== HỆ THỐNG MỚI ĐỢT 6: ÉP ĐỒ (BẬC) + ẢI THEO NGÀY (docs/review/ke-hoach-cai-thien/he-thong-moi/YEU-CAU-6-EP-DO-AI-NGAY.md) =====
  // BẢNG HẰNG SỐ DUY NHẤT của ép đồ. Luật + giao diện: js/ep_do.js (G.epDo). Mô hình số liệu: node tools/can-bang/tinh.js (mục 6).
  // Trục "Bậc" (ép đồ) độc lập với trục "Cấp" hệ (Trắng/Mầm/Thành hình/Thức tỉnh). Chữ "Trắng" của trục Bậc luôn ghi "Bậc Trắng".
  // Cờ tắt: ?epdo=0 (G.EP_DO_BAT = false): bậc không có tác dụng (×1), không rơi đá, ẩn thẻ Ép đồ; dữ liệu bậc trong bản lưu giữ nguyên.
  // 15/10 sua-can-bang (docs/review/ke-hoach-cai-thien/sua-can-bang/YEU-CAU.md): 3 mục chủ game chọn — bớt quái thường ải 2-2…2-5, 3-2, 3-4
  // (G.STAGE_K, trùm giữ nguyên), Bổ rìu san hô Ngư Tinh mảnh 1,4 → 1,0 (js/chieu_trum.js), dòng Hút máu giảm nửa (G.EP_DO).
  // (15/10 don-tep B: bỏ cờ quay lui ?cbcu=1 / G.CB_CU.)
  G.EP_DO = {
    ten: ['Trắng', 'Xanh lam', 'Xanh lục', 'Tím', 'Vàng', 'Đỏ', 'Rực lửa'],
    mau: ['#d9dde4', '#5798ff', '#69c96b', '#b27bff', '#ffd166', '#f05b55', '#ff7c3e'], // 16/10 thang màu khung ô (góp ý ChatGPT mục 4)
    // TỔNG sức mạnh vũ khí theo bậc (sát thương × phần phụ của loại). Sát thương thật = tong / (1 + phu.giaTri × bậc), để phần phụ
    // (kiếm tốc đánh, thương tầm, búa choáng, phi tiêu xuyên) cộng lại đúng bằng tong: Rực lửa ≈ ×1,75.
    tong: [1, 1.08, 1.17, 1.28, 1.4, 1.55, 1.75],
    phu: {
      sword: { ma: 'tocDanh', ten: 'tốc đánh', moi: 0.025, giaTri: 0.025 },   // mỗi bậc +2,5% tốc đánh (tính trọn vào sức mạnh)
      spear: { ma: 'tam', ten: 'tầm đánh', moi: 0.03, giaTri: 0.015 },        // mỗi bậc +3% tầm (tính một nửa)
      hammer: { ma: 'choang', ten: 'thời gian choáng', moi: 0.08, giaTri: 0.012 }, // mỗi bậc +8% choáng
      bow: { ma: 'xuyen', ten: 'sát thương xuyên', moi: 0.05, giaTri: 0.015, them1: 5 }, // mỗi bậc +5% sát thương con sau; từ Đỏ xuyên thêm 1 quái
    },
    // Giá MỖI LẦN ÉP lên bậc b (thành công hay thất bại đều mất): đá nâng bậc, vàng, mảnh trùm [vùng 1, 2, 3].
    gia: [null, { da: 3, vang: 100 }, { da: 6, vang: 200 }, { da: 10, vang: 350 }, { da: 16, vang: 550 }, { da: 25, vang: 800, manh: [0, 1, 0] }, { da: 40, vang: 1200, manh: [0, 0, 2] }],
    tiLe: [1, 1, 0.9, 0.75, 0.6, 0.45, 0.3], // tỉ lệ thành công khi ép LÊN bậc b
    tutTu: 4,       // ép lên bậc >= tutTu (Vàng, Đỏ, Rực lửa) mà thất bại thì tụt 1 bậc (bùa giữ bậc chặn)
    mayMan: 0.1,    // điểm may mắn: mỗi lần thất bại +10% tỉ lệ cho món đó ở lần ép lên đúng bậc đó; thành công về 0
    dongTu: 3,      // từ bậc Tím mỗi bậc mở 1 dòng hiệu ứng: số dòng = max(0, bậc − 2)
    // Bảng dòng hiệu ứng. goc = giá trị ở bậc Tím (q ngẫu nhiên 0,8–1,2 lúc ra dòng); giá trị thật = goc × heSo[bậc hiện tại] × q.
    // Dòng chỉ có tác dụng khi ĐANG CẦM vũ khí đó.
    dong: [
      { ma: 'chiMang', ten: 'Chí mạng', goc: 0.04 },
      { ma: 'stChiMang', ten: 'Sát thương chí mạng', goc: 0.15 },
      { ma: 'trum', ten: 'Sát thương lên trùm, tinh anh', goc: 0.08 },
      { ma: 'hutMau', ten: 'Hút máu', goc: 0.006 }, // sua-can-bang: 0,012 → 0,006
      { ma: 'tocDanh', ten: 'Tốc đánh', goc: 0.04 },
      { ma: 'hoiChieu', ten: 'Giảm hồi chiêu đặc biệt', goc: 0.06 },
      { ma: 'linhKhi', ten: 'Linh khí nhận', goc: 0.05 },
      { ma: 'stHe', ten: 'Sát thương hệ', goc: 0.06 },
      { ma: 'giamST', ten: 'Giảm sát thương nhận', goc: 0.03 },
    ],
    heSo: [0, 0, 0, 1, 1.25, 1.6, 2],
    hutToiDa: 0.01,  // hút máu: mỗi đòn hồi tối đa 1% máu tối đa (sua-can-bang: 0,02 → 0,01)
    // Đổi dòng (tẩy luyện): luôn thành công, ít đá hơn giá ép lên bậc kế. Theo bậc hiện tại.
    doiDong: [null, null, null, { da: 3, vang: 150 }, { da: 5, vang: 250 }, { da: 8, vang: 400 }, { da: 12, vang: 600 }],
    // Đá nâng bậc rơi từ trùm (mỗi lần hạ; lần đầu hạ ải đó nhiều hơn; độ khó 2 ×1,5). Theo vùng [1, 2, 3].
    roi: { mini: [1, 1, 2], miniDau: [2, 2, 3], vung: [3, 4, 5], vungDau: [6, 8, 10], kho2: 1.5 },
    bua: { trumVung: 0.1, thuongNhan: 600 }, // bùa giữ bậc: trùm vùng 10%; thương nhân trong ải bán 600 vàng (ải ngày Đá Bậc khó: G.AI_NGAY)
  };
  if (G.VUNG4) { const R4 = G.EP_DO.roi; R4.mini.push(2); R4.miniDau.push(4); R4.vung.push(6); R4.vungDau.push(12); } // vùng 4: số xuất phát
  G.EP_DO_BAT = true;
  try { if (typeof location !== 'undefined' && /[?&]epdo=0(&|$)/.test(location.search || '')) G.EP_DO_BAT = false; } catch (e) { /* giữ mặc định */ }
  // ẢI THEO NGÀY: giờ máy người chơi, đổi ngày lúc 00:00. thu: 0 = Chủ nhật … 6 = Thứ 7 (Date.getDay). Mở sau khi hạ trùm vùng 1.
  // Mỗi ải 3 lượt / ngày (trừ lượt khi THẮNG). Mức k (dễ / vừa / khó) mở khi đã hạ trùm vùng k + 1; quái theo ải trùm của vùng đó.
  // Thưởng ≈ 1,5–2 lần một lượt ải thường cùng vùng (so ở tools/can-bang/tinh.js mục 6). Cờ tắt: ?aingay=0 (G.AI_NGAY_BAT = false).
  G.AI_NGAY = {
    luot: 3,
    ai: {
      da: { ten: 'Ải Đá Bậc', thu: [6, 0, 1, 3], thuong: { da: [3, 5, 8], bua: [0, 0, 0.1] } },  // T7, CN, T2, T4
      mai: { ten: 'Ải Đá Mài', thu: [2, 5, 6, 0], thuong: { quang: [14, 18, 22] } },            // T3, T6, T7, CN (đá mài = quặng)
      vang: { ten: 'Ải Vàng', thu: [4, 5, 6, 0], thuong: { vang: [520, 800, 1100] } },           // T5, T6, T7, CN
    },
    thuTu: ['da', 'mai', 'vang'],
    muc: ['Dễ', 'Vừa', 'Khó'],
    dot: 5,          // số đợt quái (đợt cuối có 1 tinh anh)
    xp: 0.5,         // kinh nghiệm = 0,5 × kinh nghiệm ải trùm của vùng đó
  };
  G.AI_NGAY_BAT = true;
  try { if (typeof location !== 'undefined' && /[?&]aingay=0(&|$)/.test(location.search || '')) G.AI_NGAY_BAT = false; } catch (e) { /* giữ mặc định */ }
  // ===== LUYỆN VŨ KHÍ 1–15 (16/10, docs/review/ke-hoach-cai-thien/luyen-vu-khi/THIET-KE.md; chủ game chọn Q1-A, Q2-A, Q3-A) =====
  // MỘT đường nâng mỗi vũ khí (luyện riêng từng món) thay cho cấp hệ + mài + lò + ép đồ. Luôn thành công, không tụt cấp, không bùa.
  // Luật + chuyển bản lưu + bảng tối thiểu: js/luyen.js (G.luyen). Mô hình số: tools/can-bang/tinh.js --luyen (và mo_hinh.js của bản thiết kế).
  // cap[L]: M = sức mạnh vũ khí so với Luyện 1 (thay STAGE_MULT × (1 + 0,08 × mài) × bậc ép); giá để lên cấp L từ L − 1: v vàng,
  // lk linh khí, r nguyên liệu rèn (NLR), nl [vùng, số] nguyên liệu vùng, m [vùng, số] mảnh trùm. Trần ×5,7 (Q1-A: giữ đường sức mạnh như nay).
  // Cờ tắt: ?luyen=0 (G.LUYEN_BAT = false) → luật, ví, giao diện cũ y như trước (bản lưu giữ cả trường cũ).
  G.LUYEN = {
    cap: [
      null,
      { M: 1.00 },
      { M: 1.15, v: 100, lk: 10, r: 5 },
      { M: 1.35, v: 150, lk: 80, r: 10, nl: [0, 4] },               // 3: Mầm — chọn hệ
      { M: 1.55, v: 250, lk: 40, r: 15, nl: [0, 3] },
      { M: 1.75, v: 350, lk: 50, r: 20, nl: [0, 3] },               // trần trước Mộc Tinh
      { M: 2.05, v: 500, lk: 160, r: 28, nl: [0, 6], m: [0, 1] },   // 6: Thành hình — cần mảnh Mộc Tinh
      { M: 2.35, v: 600, lk: 60, r: 32, nl: [1, 4] },
      { M: 2.65, v: 700, lk: 70, r: 38, nl: [1, 4] },
      { M: 3.00, v: 850, lk: 100, r: 45, nl: [1, 8] },              // 9: Tinh luyện (phần phụ của loại); trần trước Ngư Tinh
      { M: 3.35, v: 950, lk: 80, r: 50, nl: [1, 4], m: [1, 1] },    // cần mảnh Ngư Tinh
      { M: 3.70, v: 1000, lk: 90, r: 55, nl: [2, 5] },
      { M: 4.50, v: 1350, lk: 290, r: 65, nl: [2, 10] },            // 12: Thức tỉnh; trần trước Hồ Tinh (bot phiên 1: xem dưới)
      { M: 4.90, v: 1300, lk: 100, r: 70, nl: [2, 6], m: [2, 1] },  // cần mảnh Hồ Tinh; trần trước Thuồng Luồng
      { M: 5.30, v: 1450, lk: 120, r: 75, nl: [0, 6], m: [3, 1] },  // cần mảnh Thuồng Luồng (vùng 4 không có nguyên liệu riêng: Gỗ linh)
      { M: 5.70, v: 1850, lk: 200, r: 90, nl: [1, 10], m: [3, 2] }, // 15: Viên mãn (Vảy cá)
    ],
    // Cấp Luyện tối đa theo số trùm vùng đã hạ (0..4: chưa hạ, Mộc Tinh, Ngư Tinh, Hồ Tinh, Thuồng Luồng); cấp đầu tiên vượt mỗi mốc
    // (6, 10, 13, 14) cần mảnh của trùm đó. Phiên 1 (bot 8 lượt, sau luật trùm công bằng của tư vấn 2): thiết kế 11 trước Hồ Tinh và cấp 12
    // cần mảnh Hồ Tinh làm bot kẹt ở cấp 11 cả vùng 3 (ải 3-5 chơi 9,1 lần > 9, tổng 44 lần so với 39) vì bot thật lên Thức tỉnh từ 3-2 →
    // trần trước Hồ Tinh 12, mảnh Hồ Tinh chuyển sang cấp 13 (39 lần, 181 phút; luật cũ 39 lần, 184 phút). Bảng: luyen-vu-khi/bao-cao-1.md.
    tran: [5, 9, 12, 13, 15],
    hinhThai: [3, 6, 12],       // cấp lên Mầm (chọn hệ), Thành hình, Thức tỉnh
    phuTu: 9,                   // từ cấp 9 (Tinh luyện): phần phụ của loại
    phu: { sword: 0.10, spear: 0.12, hammer: 0.30, bow: 0.20 }, // tốc đánh / tầm / choáng / sát thương xuyên (phi tiêu xuyên thêm xuyenThem quái)
    xuyenThem: 1,
    phuSt: 0.06,                // phần phụ chiếm ~6% trong M (sát thương = M / 1,06 từ cấp 9, như ép đồ: tổng / (1 + phần phụ))
    vm: { chiMang: 0.08, trum: 0.16, hoiChieu: 0.12 }, // dòng Viên mãn (cấp 15): chí mạng / sát thương lên trùm, tinh anh / giảm hồi chiêu đặc biệt
    vmMacDinh: 'chiMang',
    khung: [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 6], // màu khung ô (ảnh gd-o-ep-0..6) theo cấp Luyện
    manhDau: 2,                 // hạ trùm vùng LẦN ĐẦU (độ khó 1): thêm bấy nhiêu mảnh (3 → 5), thưởng bảo đảm
    buaTrum: 0.1,               // trùm vùng: 10% thêm 6 NLR (bùa giữ bậc cũ quy ra NLR)
    tutToiDa: 0.07,             // chuyển bản lưu cũ: không ai tụt Sức mạnh quá 7%
  };
  G.LUYEN_TRAN = G.LUYEN.tran; // tên trong THIET-KE.md mục 5.2
  G.QUY_DOI = { da: 2, bua: 6 };  // 1 đá nâng bậc = 2 NLR, 1 bùa giữ bậc = 6 NLR (quặng 1:1)
  // Ải Rèn (gộp Ải Đá Bậc + Ải Đá Mài): T2, T3, T4, T6, T7, CN; NLR theo mức Dễ / Vừa / Khó
  G.AI_NGAY.ai.ren = { ten: 'Ải Rèn', thu: [1, 2, 3, 5, 6, 0], thuong: { nlr: [14, 19, 25] } };
  G.LUYEN_BAT = true;
  try { if (typeof location !== 'undefined' && /[?&]luyen=0(&|$)/.test(location.search || '')) G.LUYEN_BAT = false; } catch (e) { /* giữ mặc định */ }
  if (G.LUYEN_BAT) G.AI_NGAY.thuTu = ['ren', 'vang'];
  // Bỏ tụt bậc cho CẢ luật cũ (ép hỏng từ Vàng trở lên chỉ giữ bậc), ẩn bùa (không rơi ở trùm / Ải Đá Bậc, thương nhân không bán).
  // Cờ bật lại: ?tutbac=1 (G.TUT_BAC = true).
  G.TUT_BAC = false;
  try { if (typeof location !== 'undefined' && /[?&]tutbac=1(&|$)/.test(location.search || '')) G.TUT_BAC = true; } catch (e) { /* giữ mặc định */ }
  if (!G.TUT_BAC) { G.EP_DO.tutTu = 99; G.EP_DO.bua.trumVung = 0; G.AI_NGAY.ai.da.thuong.bua = [0, 0, 0]; }
  // Cộng quặng (thưởng ải, rương, thương nhân, việc ngày, thành tựu…): js/luyen.js thay bằng bản đổi ra NLR khi cờ Luyện bật
  G.themQuang = function (sv, n) { if (sv && n > 0) sv.ore = (typeof sv.ore === 'number' && isFinite(sv.ore) ? sv.ore : 0) + n; };
  G.chuQuang = () => '+{0} quặng';
  G.AFFIX = {
    mana: 'Mỗi đòn trúng hồi thêm 1 mana',
    crit: '10% cơ hội gây gấp đôi sát thương',
    reach: 'Tầm đánh xa hơn 15%',
  };
  // Dòng mạnh riêng của bậc Vàng (mỗi món có một dòng).
  G.POWER = {
    boss: { name: 'Diệt yêu', desc: 'Gây thêm 20% sát thương lên tinh anh và trùm' },
    proc: { name: 'Thấm hệ', desc: 'Tỉ lệ gây hiệu ứng hệ tăng thêm 25%' },
    first: { name: 'Mở màn', desc: 'Đòn đầu lên quái còn đầy máu gây gấp đôi sát thương' },
  };
  // ĐẶC TRƯNG HỆ THEO CẤP: Trắng chỉ có chỉ số; Mầm có hiệu ứng hệ nhẹ (tỉ lệ G.PROC, vệt chém nhuốm màu) nhưng chưa có luật hệ;
  // Thành hình mở đặc trưng 1 (thứ để lại trên sân); Thức tỉnh mở đặc trưng 2 (phản ứng dây chuyền).
  G.HE_FEATURES = {
    fire: [
      { name: 'Vệt cháy', desc: 'Nhát kết, đòn giữ rồi thả và đòn Đặc biệt nổ ra, để lại vệt cháy đốt quái đi qua' },
      { name: 'Nổ lan', desc: 'Quái đang cháy mà chết thì nổ, đốt và làm cháy quái đứng gần' },
    ],
    poison: [
      { name: 'Vũng độc', desc: 'Nhát kết, đòn giữ rồi thả và đòn Đặc biệt để lại vũng độc, quái đứng trong bị thêm tầng Độc' },
      { name: 'Lây độc', desc: 'Quái đang trúng độc mà chết thì độc lây sang quái bên cạnh' },
    ],
    ice: [
      { name: 'Gai băng', desc: 'Nhát kết, đòn giữ rồi thả và đòn Đặc biệt mọc gai băng trên đất, gây sát thương và làm chậm' },
      { name: 'Băng vỡ', desc: 'Quái đang đóng băng bị đánh thì lớp băng vỡ, mảnh văng trúng quái quanh đó' },
    ],
  };
  // Mốc tiến hóa st (0..3) của hệ el đã mở những đặc trưng nào: trả về số đặc trưng (0, 1 hoặc 2).
  G.heFeatures = (st) => (st >= 3 ? 2 : st >= 2 ? 1 : 0);
  // TỈ LỆ THƯỞNG (trước là tỉ lệ rơi vũ khí; đợt 1 đổi thành vàng + linh khí G.ROI_MOI.vk, đợt 2 bỏ bảng bậc rơi cũ).
  G.DROP = {
    elite: 0.35,      // cơ hội tinh anh cho thưởng
    stage: 0.5,       // cơ hội nhận thưởng khi qua một ải thường (trùm nhỏ)
  };
  // Chữ nối vào tên theo nhánh và mốc (khớp với js/weapon_art.js).
  G.NAME_WORDS = {
    fire: ['Than Hồng', 'Xích Diệm', 'Hỏa Thần'],
    poison: ['Rêu Xanh', 'Nọc Rừng', 'Độc Vương'],
    ice: ['Sương Giá', 'Hàn Ngọc', 'Băng Đế'],
  };

  G.HEROES = {
    smith: {
      name: 'Cu Tí', hp: 100, mana: 100, speed: 1, fav: ['sword', 'hammer'],
      passive: 'Nhận linh khí nhanh hơn 20%',
      skill: 'Chưởng', skillDesc: 'Nét riêng: chưởng đẩy lùi quái mạnh (lực tay thợ rèn)', // trước là Nung (js/chuong.js)
      unlock: 'Có sẵn',
    },
    hunter: {
      name: 'Cu Tèo', hp: 75, mana: 90, speed: 1.15, fav: ['bow', 'spear'],
      passive: 'Gây thêm 25% sát thương lên mục tiêu bị choáng, đóng băng, giữ chân hoặc lộ điểm yếu',
      skill: 'Chưởng', skillDesc: 'Nét riêng: chưởng bay xa hơn 30% và nhanh hơn 25%', // trước là Đặt bẫy
      unlock: 'Hạ Mộc Tinh',
    },
    healer: {
      name: 'Cái Bống', hp: 85, mana: 130, speed: 1, fav: ['spear', 'bow'],
      passive: 'Hiệu ứng bạn gây ra kéo dài hơn 30%',
      skill: 'Chưởng', skillDesc: 'Nét riêng: chưởng trúng quái thì hồi 1,5% máu (tối đa 3 lần mỗi phát)', // trước là Bình thuốc
      unlock: 'Hạ Ngư Tinh',
    },
    wrestler: {
      name: 'Cu Lì', hp: 140, mana: 80, speed: 0.9, fav: ['hammer', 'spear'],
      passive: 'Giảm 25% sát thương nhận vào, phản lại 50% sát thương cận chiến',
      skill: 'Chưởng', skillDesc: 'Nét riêng: chưởng tầm gần (60%) mà to (rộng gấp rưỡi), mạnh hơn 15%', // trước là Gồng
      unlock: 'Hạ Hồ Tinh',
    },
  };
  G.HKEYS = ['smith', 'hunter', 'healer', 'wrestler'];

  // ZED (YEU-CAU-2, 12/10): chỉ còn MỘT nhân vật chơi được tên Zed. Zed dùng hình và dữ liệu của Cu Tí: khoá nội bộ vẫn là 'smith'
  // (bản lưu, hình, cây chưởng đều theo khoá này), chỉ đổi TÊN HIỂN THỊ. Ba bạn Cu Tèo, Cái Bống, Cu Lì vẫn bị yêu tinh bắt,
  // vẫn được cứu sau mỗi trùm vùng và ngồi chơi ở sân đình (NPC), nhưng không chơi được nữa: khi được cứu, bạn đó DẠY Zed nét riêng
  // của mình (nội tại + nét riêng của chưởng + sở trường một vũ khí), cấp đúng 1 lần, lưu ở save.zed.hoc.
  // Đợt 2 (YEU-CAU-2-DON-CU.md): bỏ cờ ?zed=0 — Zed là nhân vật duy nhất (cờ G.ZED đã xoá khi dọn code 13/10).
  // Nét mỗi bạn dạy Zed. Số đã hạ so với khi bạn đó còn chơi được, vì Zed gom đủ cả ba (bản gốc ghi trong ngoặc).
  G.ZED_DAY = {
    hunter: {
      boss: 'Mộc Tinh', fav: 'bow',
      cc: 1.15,                      // +15% sát thương lên quái bị choáng, đóng băng, giữ chân, lộ điểm yếu (gốc +25%)
      chRange: 1.2, chSpeed: 1.2,    // chưởng bay xa hơn 20%, nhanh hơn 20% (gốc 30% / 25%)
      noiTai: '+15% sát thương lên quái bị choáng, đóng băng, giữ chân hoặc lộ điểm yếu',
      chuong: 'chưởng bay xa hơn 20%, nhanh hơn 20%',
      ngan: ['Đánh quái bị khống chế +15%', 'Chưởng xa, nhanh hơn 20%; phi tiêu +10%'], // dòng ngắn ở bảng kết quả
    },
    healer: {
      boss: 'Ngư Tinh', fav: 'spear',
      statusDur: 1.2,                // hiệu ứng Zed gây ra kéo dài hơn 20% (gốc 30%)
      chHeal: 0.01, chHealMax: 3,    // chưởng trúng quái hồi 1% máu, tối đa 3 lần mỗi phát (gốc 1,5%)
      noiTai: 'hiệu ứng gây ra kéo dài hơn 20%',
      chuong: 'chưởng trúng quái thì hồi 1% máu (tối đa 3 lần mỗi phát)',
      ngan: ['Hiệu ứng gây ra lâu hơn 20%', 'Chưởng trúng hồi 1% máu; thương +10%'],
    },
    wrestler: {
      boss: 'Hồ Tinh', fav: null,
      dr: 0.12, reflect: 0.3,        // giảm 12% sát thương nhận, phản 30% sát thương cận chiến (gốc 25% / 50%)
      chSize: 1.3, chArea: 1.2, chDmg: 1.1, // chưởng to hơn 30%, vùng nổ/mây rộng hơn 20%, mạnh hơn 10%; KHÔNG rút tầm (gốc 60% tầm)
      noiTai: 'giảm 12% sát thương nhận vào, phản lại 30% sát thương cận chiến',
      chuong: 'chưởng to hơn 30%, nổ rộng hơn 20%, mạnh hơn 10%',
      ngan: ['Giảm 12% sát thương, phản 30% đòn gần', 'Chưởng to hơn 30%, mạnh hơn 10%'],
    },
  };
  const tvz = (x) => (G.tv ? G.tv(x) : x); // dịch nếu đã nạp js/ngon_ngu.js
  G.ZED_DAY_KEYS = ['hunter', 'healer', 'wrestler'];
  // Bạn k đã dạy Zed chưa
  G.zedHoc = function (k, sv) {
    sv = sv || G.save;
    return !!(sv && sv.zed && typeof sv.zed === 'object' && sv.zed.hoc && sv.zed.hoc[k]);
  };
  // Em bé key có được tính các nét đã học không (Zed = khoá smith)
  G.zedLa = (key) => key === 'smith';
  // Sở trường vũ khí (+10% sát thương) của em bé key: Zed thêm cung khi Cu Tèo dạy, giáo khi Cái Bống dạy
  G.favOf = function (key) {
    const H = G.HEROES[key] || G.HEROES.smith, f = H.fav.slice();
    if (G.zedLa(key)) for (const k of G.ZED_DAY_KEYS) { const d = G.ZED_DAY[k]; if (d.fav && G.zedHoc(k) && !f.includes(d.fav)) f.push(d.fav); }
    return f;
  };
  // Dòng nội tại đầy đủ (Zed: nội tại gốc + các nét đã học)
  G.passiveOf = function (key) {
    const H = G.HEROES[key] || G.HEROES.smith;
    if (!G.zedLa(key)) return H.passive;
    const ds = [tvz(H.passive)];
    for (const k of G.ZED_DAY_KEYS) if (G.zedHoc(k)) ds.push(tvz(G.ZED_DAY[k].noiTai));
    return ds.join('; ');
  };
  G.skillDescOf = function (key) {
    const H = G.HEROES[key] || G.HEROES.smith;
    if (!G.zedLa(key)) return H.skillDesc;
    const ds = [];
    for (const k of G.ZED_DAY_KEYS) if (G.zedHoc(k)) ds.push(tvz(G.ZED_DAY[k].chuong));
    return ds.length ? tvz(H.skillDesc) + '; ' + ds.join('; ') : H.skillDesc;
  };
  // BỘ ZED MỚI (13/10/2026, docs/review/ke-hoach-cai-thien/zed-tich-hop): hình Zed vẽ từ bộ ảnh mới (js/zed_moi.js), vũ khí 4 cấp gắn
  // theo neo, cung đổi thành PHI TIÊU (chỉ đổi tên và hình; nhịp, sát thương, cách giữ y như cung). Đợt 2: bỏ cờ ?zedmoi=0, luôn bật.
  G.WTYPES.bow.name = 'Phi tiêu'; G.WTYPES.bow.special = 'Mưa Phi Tiêu';
  // ZED CẦM VŨ KHÍ LÚC ĐỨNG / ĐI / CHẠY (13/10/2026, docs/review/ke-hoach-cai-thien/zed-cam-vk): js/zed_moi.js vẽ vũ khí trong tay phải ở
  // hàng đứng/đi/chạy (hàng dung_<loại>, di_<loại>, chay_<loại> của tấm thân); lộn/trúng đòn/chết ẩn vũ khí. Tắt: ?camvk=0 (tay không như trước).
  G.CAM_VK = true;
  try { if (typeof location !== 'undefined' && /[?&]camvk=0(&|$)/.test(location.search || '')) G.CAM_VK = false; } catch (e) { /* giữ mặc định */ }
  // VIỀN VŨ KHÍ THEO BẬC ÉP ĐỒ + ÁNH THEO CẤP MÀI (15/10/2026, docs/review/ke-hoach-cai-thien/vien-vk-bac): js/vien_vk.js vẽ viền / hào quang màu bậc
  // quanh hình vũ khí (trên tay Zed và trong ô), vệt trắng lướt theo cấp mài. Chỉ đổi HÌNH.
  // 16/10 (docs/review/ke-hoach-cai-thien/vu-khi-chatgpt/bao-cao-A.md): chủ game chọn bậc ép đồ CHỈ hiện ở KHUNG Ô ĐỒ → mặc định TẮT viền /
  // hào quang / đốm / ánh mài trên vũ khí; mọi ô vũ khí vẽ khung ô màu bậc + số bậc (G.KHUNG_BAC, js/ep_do.js E.o, js/vk_moi.js VM.icon).
  // Bật lại bản cũ (viền trên vũ khí, không có số bậc ở ô): ?vienvk=1.
  G.VIEN_VK = false;
  try { if (typeof location !== 'undefined' && /[?&]vienvk=1(&|$)/.test(location.search || '')) G.VIEN_VK = true; } catch (e) { /* giữ mặc định */ }
  G.KHUNG_BAC = !G.VIEN_VK;
  // NẮM CHUÔI THẬT (15/10/2026, docs/review/ke-hoach-cai-thien/vk-khop-tay/bao-cao.md, js/zed_moi.js): nắm tay ôm chuôi + lớp ngón tay trước;
  // thương hai tay (tay phải đuôi cán, tay trái thân cán); phi tiêu to ×1,3 và kẹp ở ngón. Chỉ đổi HÌNH. Tắt từng phần như trước:
  // ?namchuoi=0 (tất cả), ?thuong2tay=0 (hàng thương), ?phitieuto=0 (phi tiêu cầm + bay).
  G.NAM_CHUOI = true; G.THUONG_2TAY = true; G.PHI_TIEU_TO = true;
  try {
    const q = (typeof location !== 'undefined' && location.search) || '';
    if (/[?&]namchuoi=0(&|$)/.test(q)) G.NAM_CHUOI = false;
    if (/[?&]thuong2tay=0(&|$)/.test(q)) G.THUONG_2TAY = false;
    if (/[?&]phitieuto=0(&|$)/.test(q)) G.PHI_TIEU_TO = false;
  } catch (e) { /* giữ mặc định */ }
  // NẮM TAY TỪ ẢNH + CHẠY HAI TAY (16/10/2026, docs/review/ke-hoach-cai-thien/vk-khop-tay/bao-cao-2.md, js/zed_moi.js): lớp ngón cắt từ ảnh nắm tay
  // ôm cán (lòng bàn tay sau cán, ngón trước cán); chạy cầm thương / búa bằng hàng chạy hai tay. Chỉ đổi HÌNH. Tắt: ?ngonanh=0 (về lớp ngón
  // tự vẽ), ?chay2tay=0 (về hàng chạy cũ).
  G.NGON_ANH = true; G.CHAY_2TAY = true;
  try {
    const q = (typeof location !== 'undefined' && location.search) || '';
    if (/[?&]ngonanh=0(&|$)/.test(q)) G.NGON_ANH = false;
    if (/[?&]chay2tay=0(&|$)/.test(q)) G.CHAY_2TAY = false;
  } catch (e) { /* giữ mặc định */ }
  // ĐÒN ZED MỚI QUAY THEO HƯỚNG NHẮM (13/10/2026, docs/review/ke-hoach-cai-thien/zed-8-huong): js/zed_moi.js xoay vũ khí đâm/ném quanh nắm tay
  // theo góc nhắm thật (kẹp ±75°, quá thì nghiêng nhẹ thân trên), chém/quét/nện nghiêng đường vung tối đa ±35°; vệt/hiệu ứng (js/fx.js aimed)
  // xoay cùng góc. Chỉ đổi HÌNH. Tắt: ?huongvk=0 (vũ khí chỉ vẽ ngang theo neo như trước).
  G.HUONG_VK = true;
  try { if (typeof location !== 'undefined' && /[?&]huongvk=0(&|$)/.test(location.search || '')) G.HUONG_VK = false; } catch (e) { /* giữ mặc định */ }
  // SỬA BÓP EO / VẶN NGƯỜI KHI CHẠY + CHÉM (13/10/2026, docs/review/ke-hoach-cai-thien/zed-eo-sua): js/zed_moi.js cho chân luôn cùng hướng
  // thân trên (chạy ngược hướng chém → chạy lùi), ghép ở giữa đùi, vùng nối giãn ngang khớp bề rộng. Chỉ đổi HÌNH. Tắt: ?eosua=0 (ghép như trước).
  G.EO_SUA = true;
  try { if (typeof location !== 'undefined' && /[?&]eosua=0(&|$)/.test(location.search || '')) G.EO_SUA = false; } catch (e) { /* giữ mặc định */ }
  // TRANG PHỤC ZED (13/10/2026, docs/review/ke-hoach-cai-thien/zed-bo-rung): mỗi bộ = nguyên bộ hình Zed mặc sẵn bộ đó (js/zed_moi.js
  // chọn tấm theo bộ đang mặc; vũ khí, nhịp, neo như nhau). Lưu ở save.zed.bo ('ninja' | 'rung'; không có = 'ninja') và save.zed.boMo
  // (các bộ đã có). 15/10 23:08: hạ trùm vùng Rừng già chỉ MỞ BÁN bộ Rừng ở Cô Thợ May (mua bằng vàng, G.BO_MUA bên dưới; js/stage.js);
  // bản lưu cũ đã có bộ thì giữ nguyên (js/engine.js fixSave). ?bocu=1: hạ trùm là có bộ như trước.
  // Mở rồi mặc được ở mọi vùng. Cờ thử: ?zedbo=rung / ?zedbo=bien / ?zedbo=lau (mặc ngay bộ đó, không cần mở khoá, không ghi vào bản lưu).
  // Bộ 3 'bien' (docs/review/ke-hoach-cai-thien/zed-bo-bien) mở bán khi hạ trùm Hang biển — cùng đường mở bán/mua/báo như bộ Rừng.
  G.ZED_BO = {
    ninja: { ten: 'Ninja Bóng Đêm', tam: 'zed-moi' },
    rung: { ten: 'Thợ Săn Rừng', tam: 'zed-rung', vung: 'Rừng già' },
    // bộ 3 "Biển" (13/10/2026, docs/review/ke-hoach-cai-thien/zed-bo-bien): mở bán khi hạ trùm vùng Hang biển (vùng thứ 2), như bộ Rừng
    bien: { ten: 'Chiến Binh Biển', tam: 'zed-bien', vung: 'Hang biển' },
    // bộ 4 "Lâu đài cổ" (13/10/2026, docs/review/ke-hoach-cai-thien/zed-bo-lau): mở bán khi hạ trùm vùng Lâu đài cổ (vùng thứ 3), như bộ Rừng/Biển
    lau: { ten: 'Hiệp Sĩ Lâu Đài', tam: 'zed-lau', vung: 'Lâu đài cổ' },
  };
  G.ZED_BO_KEYS = ['ninja', 'rung', 'bien', 'lau'];
  G.ZED_BO_THU = null;
  try { const m = typeof location !== 'undefined' && /[?&]zedbo=([a-z]+)(&|$)/.exec(location.search || ''); if (m && G.ZED_BO[m[1]]) G.ZED_BO_THU = m[1]; } catch (e) { /* giữ mặc định */ }
  // chỉ số vùng của bộ (vùng có trùm mở bộ đó); không tìm thấy tên vùng thì lấy vùng đầu tiên
  G.zedBoVung = function (k) {
    const B = G.ZED_BO[k];
    if (!B || !B.vung || !G.REGIONS) return -1;
    const i = G.REGIONS.findIndex((r) => r && r.name === B.vung);
    return i >= 0 ? i : 0;
  };
  // zedBoMo: bộ Cu Tí ĐÃ CÓ (đã mua, hoặc bản lưu cũ đã được tặng) → mặc / nâng cấp được. Lưu ở save.zed.boMo.
  G.zedBoMo = function (k, sv) {
    if (k === 'ninja') return true;
    sv = sv || G.save;
    return !!(sv && sv.zed && typeof sv.zed === 'object' && sv.zed.boMo && sv.zed.boMo[k]);
  };
  // MUA BỘ BẰNG VÀNG (chủ game 15/10 23:08, docs/review/ke-hoach-cai-thien/bo-do-mua): hạ trùm vùng không tặng bộ nữa mà chỉ MỞ BÁN bộ đó
  // ở Cô Thợ May (thẻ "Mua", js/vk_moi_lang.js); mua xong mới mặc / nâng cấp. Ninja có sẵn. Giá chốt theo bot (tests/cay.py --node,
  // tools/can-bang/tinh.js; bảng ở bo-do-mua/bao-cao.md): người chơi bình thường mua được bộ vùng trong lúc cày vùng kế tiếp.
  // Bản lưu cũ (chưa có cờ save.zed.boMua) giữ nguyên mọi bộ đã có (js/engine.js fixSave). Cờ quay lui: ?bocu=1 (G.BO_MUA_BAT = false:
  // hạ trùm là có bộ như cũ, không có thẻ Mua).
  G.BO_MUA = { gia: { ninja: 0, rung: 1500, bien: 3000, lau: 5000 } };
  G.BO_MUA_BAT = true;
  try { if (typeof location !== 'undefined' && /[?&]bocu=1(&|$)/.test(location.search || '')) G.BO_MUA_BAT = false; } catch (e) { /* giữ mặc định */ }
  G.zedBoGia = (k) => Math.max(0, (G.BO_MUA && G.BO_MUA.gia && G.BO_MUA.gia[k]) | 0);
  // đã hạ trùm vùng của bộ (mọi độ khó)
  G.zedBoHa = function (k, sv) {
    sv = sv || G.save;
    const r = G.zedBoVung(k);
    return r >= 0 && !!(sv && ((sv.stars && sv.stars[r + '-4']) || (sv.stars2 && sv.stars2[r + '-4'])));
  };
  // bộ đang bày bán / mua được ở Cô Thợ May (đã mở bán; bộ đã có cũng tính là đã mở)
  G.zedBoBan = function (k, sv) {
    if (k === 'ninja' || G.zedBoMo(k, sv)) return true;
    sv = sv || G.save;
    const z = sv && sv.zed && typeof sv.zed === 'object' ? sv.zed : null;
    return !!((z && z.boBan && z.boBan[k]) || G.zedBoHa(k, sv));
  };
  // bộ đang mặc (cờ thử ?zedbo= đè lên bản lưu)
  G.zedBo = function (sv) {
    if (G.ZED_BO_THU) return G.ZED_BO_THU;
    sv = sv || G.save;
    const b = sv && sv.zed && typeof sv.zed === 'object' ? sv.zed.bo : null;
    return b && G.ZED_BO[b] && G.zedBoMo(b, sv) ? b : 'ninja';
  };
  G.HEROES.smith.name = 'Cu Tí';
  G.HEROES.smith.skillDesc = 'Nét riêng: chưởng đẩy lùi quái mạnh';

  // Cây kỹ năng: 3 nhánh, mỗi nhánh 5 nút, phải mở theo thứ tự trong nhánh.
  G.SKILLS = {
    atk: {
      name: 'Công',
      nodes: [
        'Sát thương +8%', 'Đòn đặc biệt tốn ít hơn 5 mana', 'Sát thương +15% lên quái đang dính hiệu ứng',
        'Sát thương +8%', '10% cơ hội chí mạng gấp đôi',
      ],
    },
    def: {
      name: 'Thủ',
      nodes: [
        'Máu tối đa +10%', 'Lăn né hồi nhanh hơn 25%', 'Hồi 8% máu mỗi khi qua phòng',
        'Giảm 30% thời gian dính hiệu ứng', 'Giảm 10% sát thương nhận vào',
      ],
    },
    elem: {
      name: 'Hệ',
      nodes: [
        'Mana tối đa +20', 'Mỗi đòn trúng hồi thêm 1 mana', 'Nổ khói và Sốc nhiệt mạnh hơn 30%',
        'Đòn đầu sau khi đổi vũ khí chắc chắn gây hiệu ứng', 'Hiệu ứng bạn gây ra kéo dài hơn 25%',
      ],
    },
  };
  G.SKEYS = ['atk', 'def', 'elem'];
  // CÀY NÂNG CẤP: trần cấp hero 30 -> 40 (cấp 31-40 cho thêm máu, sát thương, 3 điểm kỹ năng), để người chơi đã chạm trần ở cuối
  // vùng ba vẫn còn đường cày lên mạnh hơn thay vì phải trông vào may rủi.
  G.MAX_LEVEL = 40;
  // Cân bằng phải cày: lên cấp chậm hơn trước (40 + 25 x cấp) để cấp hero còn tăng tới cuối vùng ba.
  G.xpNeed = (lvl) => 50 + 50 * lvl;
  // Mỗi cấp hero: sát thương +1,5% và máu +3,5% (trước là 1% và 3%), để cày lên cấp thấy rõ là mạnh lên.
  G.LVL_DMG = 0.015;
  // Đợt 4 (soát cân bằng, tools/can-bang/tinh.js): máu mỗi cấp 3,5% → 6%. Đợt 1 bỏ quần áo cũ (áo vùng ba Vàng +187 máu, ~15% giảm sát thương)
  // mà chưa bù máu: ở vùng ba trùm (150-195 mỗi đòn gốc) hạ Zed cấp 40 (260 máu) trong 2 đòn, và Sức mạnh tối đa (491) không với tới
  // khuyên dùng 3-5 (560). Nay Zed cấp 32 ~315 máu, đòn trùm vùng ba ~50-60% máu như thiết kế cũ; Sức mạnh cấp 40 đủ khuyên dùng.
  G.LVL_HP = 0.06;

  G.REGIONS = [
    {
      name: 'Rừng già', el: 'poison', boss: 'moc', bossName: 'Mộc Tinh', mat: 'Gỗ linh', mini: 'Nấm Chúa',
      sky: ['#16261c', '#1f3a28', '#2c5234'], ground: '#3d5a2a', ground2: '#34502a', deco: '#1a2f1c',
      skin: ['#6b8f3a', '#4d6b28', '#c9d67a'], rescue: 'hunter',
    },
    {
      name: 'Hang biển', el: 'ice', boss: 'ngu', bossName: 'Ngư Tinh', mat: 'Vảy cá', mini: 'Cua Đá',
      sky: ['#0d1826', '#132a40', '#1c3f5c'], ground: '#48586a', ground2: '#3d4c5e', deco: '#0f2233',
      skin: ['#5f8fb0', '#3c6788', '#cfe8f5'], rescue: 'healer',
    },
    {
      name: 'Lâu đài cổ', el: 'fire', boss: 'ho', bossName: 'Hồ Tinh', mat: 'Đá lửa', mini: 'Hổ Lửa',
      sky: ['#2a1410', '#4a2016', '#70301c'], ground: '#6b4a38', ground2: '#5c3f30', deco: '#2e1812',
      skin: ['#c0603a', '#8f3f24', '#ffd0a0'], rescue: 'wrestler',
    },
  ];
  // Vùng 4 Sông sâu (G.VUNG4; KE-HOACH.md mục 1.1). Không thêm nguyên liệu mới (Q2 = A): mat chỉ là chữ chung, ải vùng 4 cho lần lượt nguyên liệu
  // của 3 vùng cũ (G.matAi). rescue null: ba bạn đã được cứu hết. ma: mã vùng (ảnh gd-*-song-*, quái vung 'song').
  if (G.VUNG4) G.REGIONS.push({
    name: 'Sông sâu', ma: 'song', el: 'poison', boss: 'thuong', bossName: 'Thuồng Luồng', mat: 'Nguyên liệu', matChung: true, mini: 'Cá Trê',
    sky: ['#0b1a1c', '#123034', '#1b4a4c'], ground: '#3e5148', ground2: '#35463e', deco: '#0e2224',
    skin: ['#4a7a6a', '#2f5248', '#ffc878'], rescue: null,
  });
  // Nguyên liệu (chỉ số trong sv.mats) ải i của vùng r cho: 3 vùng cũ cho nguyên liệu của vùng; vùng 4 lần lượt Đá lửa, Gỗ linh, Vảy cá, Đá lửa, Gỗ linh.
  G.matAi = (r, i) => (r < 3 ? r | 0 : ((i | 0) + 2) % 3);

  // Vai trò quái. hp và dmg là hệ số nhân với chỉ số chuẩn của ải.
  G.ROLES = {
    rusher: { name: 'Lính xông', hp: 1, dmg: 1, speed: 44, r: 8, marks: 1 },
    swarm: { name: 'Bầy nhỏ', hp: 0.9, dmg: 0.6, speed: 60, r: 9, marks: 1 }, // một con là cả bầy (hình vẽ cả đàn)
    shield: { name: 'Khiên', hp: 1.7, dmg: 1.1, speed: 26, r: 10, armor: 0.45, marks: 1 },
    archer: { name: 'Xạ thủ', hp: 0.7, dmg: 0.85, speed: 38, r: 7, marks: 1, shotCd: 3, wind: 0.7, shotSpd: 118 }, // bắn mỗi 3 giây, ngắm 0,7 giây, đạn bay 118
    nimble: { name: 'Nhanh nhẹn', hp: 0.7, dmg: 0.85, speed: 78, r: 7, marks: 1 },
    elite: { name: 'Tinh anh', hp: 5, dmg: 1.3, speed: 40, r: 12, marks: 5 },
    kami: { name: 'Cảm tử', hp: 0.55, dmg: 1.4, speed: 48, r: 7, marks: 1 },
    bomber: { name: 'Đặt bom', hp: 0.75, dmg: 1.1, speed: 34, r: 8, marks: 1 },
    spiky: { name: 'Gai', hp: 1.1, dmg: 0.9, speed: 26, r: 7, marks: 1 },
  };
  // Quái mới theo vùng (js/mobs.js): mỗi vai có một con riêng ở từng vùng [Rừng già, Hang biển, Lâu đài cổ].
  G.MOB_ART = {
    rusher: ['heoCon', 'cua', 'linhMa'], swarm: ['ongVo', 'caCon', 'doiThan'], shield: ['boHung', 'oc', 'tuongDa'],
    archer: ['hoaBaoTu', 'haiQuy', 'denLong'], nimble: ['chonBong', 'caChuon', 'meoDen'], kami: ['namPhong', 'caNoc', 'huLua'],
    bomber: ['socNo', 'sua', 'tieuYeu'], spiky: ['nhimDoc', 'nhim', 'nhimThan'],
    elite: [['heoNanh', 'namPhongChua'], ['cuaTuong', 'caNocChua'], ['tuongMa', 'huChua']],
    mini: ['namChua', 'cuaDa', 'hoLua'], boss: { moc: 'mocTinh', ngu: 'nguTinh', ho: 'hoTinh' },
  };
  // Vùng 4 — HÌNH TẠM (phiên 1): mọi vai, tinh anh, trùm nhỏ, trùm vùng MƯỢN con của Hang biển (cùng kỹ năng riêng của con đó: Cá Trê tạm là
  // Cua Đá, Thuồng Luồng tạm là Ngư Tinh); phòng cũng dựng theo Hang biển (G.vungVe). js/vung4.js nhuộm quái xanh rêu và phủ màu nước đục lên nền.
  // Các phiên sau thay bằng mã quái / theme mới (raiCa, diaTrau, baBa, cocTia, ranNuoc, echPhinh, maDa, traiGai, raiCaChua, cocChua, caTre,
  // thuongLuong — KE-HOACH.md mục 2) rồi đặt G.VUNG4_MUON = null.
  G.VUNG4_MUON = null;
  if (G.VUNG4) {
    const M4 = G.MOB_ART;
    for (const k of ['rusher', 'swarm', 'shield', 'archer', 'nimble', 'kami', 'bomber', 'spiky', 'mini']) M4[k].push(M4[k][1]);
    M4.elite.push(M4.elite[1].slice());
    M4.boss.thuong = M4.boss.ngu;
    G.VUNG4_MUON = 1; // vùng gốc của hình tạm (Hang biển): js/sprite_custom.js tải ảnh vùng này khi chọn vùng 4
    // Bước 3 phiên 2A (docs/review/ke-hoach-cai-thien/vung-4-2a/bao-cao.md): 8 quái thường vùng 4 có mã + kỹ năng riêng (js/ky_nang_quai.js),
    // hình tạm = ảnh con gần giống nhuộm màu (KN.TAM) tới khi có ảnh thật. Tinh anh / trùm nhỏ / trùm vùng vẫn mượn Hang biển (phiên 3A / 3B).
    // Tắt riêng phần này: ?quaisong=0 (G.QUAI_SONG = false) → 8 vai mượn Hang biển như phiên 1.
    if (G.QUAI_SONG === undefined) { let tat = false; try { tat = typeof location !== 'undefined' && /[?&]quaisong=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; } G.QUAI_SONG = !tat; }
    if (G.QUAI_SONG) {
      const MOI = { rusher: 'raiCa', swarm: 'diaTrau', shield: 'baBa', archer: 'cocTia', nimble: 'ranNuoc', kami: 'echPhinh', bomber: 'maDa', spiky: 'traiGai' };
      for (const k in MOI) M4[k][3] = MOI[k];
    }
    // Bước 3 phiên 3A (docs/review/ke-hoach-cai-thien/vung-4-3a/bao-cao.md): 2 tinh anh + trùm nhỏ vùng 4 có mã + chiêu riêng (js/chieu_trum.js,
    // js/boss.js khối trùm nhỏ), hình tạm = con gần giống nhuộm màu (MA.hinhTam). Tắt riêng: ?trumsong=0 (G.TRUM_SONG = false) → mượn Hang biển như phiên 1.
    if (G.TRUM_SONG === undefined) { let tat = false; try { tat = typeof location !== 'undefined' && /[?&]trumsong=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; } G.TRUM_SONG = !tat; }
    if (G.TRUM_SONG) { M4.elite[3] = ['raiCaChua', 'cocChua']; M4.mini[3] = 'caTre'; }
  }
  // Vùng dùng để VẼ (theme phòng, nền, hình vẽ code dự phòng) của vùng r: vùng 4 còn mượn hình thì vẽ như vùng mượn.
  G.vungVe = (r) => (r === 3 && G.VUNG4_MUON != null ? G.VUNG4_MUON : r);
  // Dấu hiệu ngẫu nhiên của tinh anh (biểu tượng nhỏ trên đầu).
  G.ELITE_TRAITS = {
    nhanh: { name: 'Nhanh', desc: 'Chạy và ra đòn nhanh hơn' },
    giap: { name: 'Bọc giáp', desc: 'Giảm 35% sát thương mọi phía' },
    no: { name: 'Nổ khi chết', desc: 'Chết thì nổ: tránh xa vòng đỏ' },
    hut: { name: 'Hút máu', desc: 'Đánh trúng bé thì hồi máu' },
  };

  // Chỉ số chuẩn theo ải. r: vùng 0..2, i: ải 0..4, diff: 0 thường, 1 độ khó thứ hai.
  const HP_RANGE = [[60, 115], [130, 230], [250, 370]];
  const DMG_RANGE = [[8, 12], [12, 17], [18, 24]];
  if (G.VUNG4) { HP_RANGE.push([390, 520]); DMG_RANGE.push([24, 30]); } // vùng 4: số xuất phát (KE-HOACH.md mục 5)
  // CÂN BẰNG PHẢI CÀY: hệ số riêng của từng ải (15 ải, theo thứ tự 1-1 .. 3-5) nhân thêm vào chỉ số trên.
  // mob: [máu, sát thương] quái thường; boss: [máu, sát thương] trùm nhỏ (ải 1-4) hoặc trùm vùng (ải 5).
  // Phiên cân bằng (báo cáo tester mục 4): sát thương quái thường trước đây răng cưa (ải đầu vùng đánh đau hơn ải cuối vùng trước
  // tới +63%, 3-1..3-4 cao hơn cả 3-5). Nay một đường đều: từ ải 1-2 mỗi ải +16% (đòn gốc 13,5 · 15,7 · 18,2 · 21,1 | 24,4 ·
  // 28,4 · 32,9 · 38,2 · 44,3), vùng ba +13%, riêng 3-4 +5% (50 · 56,5 · 63,8 · 67 · 72). Máu quái 3-4 cũng hạ
  // 1,7 → 1,62: bot không cày (tests/campaign.py) hay kẹt ở 3-4. Cột máu: bỏ bước
  // nhảy +45% ở đầu vùng ba (3-1, 3-2 hạ); vùng hai +10% máu (đánh lâu hơn một chút thay cho phần khó
  // bị bỏ, để tổng thời gian cày không ngắn đi quá 25%; máu trùm vùng hai tăng theo). Đã thử +8% máu vùng ba: bot không cày
  // (tests/campaign.py) lại kẹt 9-12 lượt ở 3-4/3-5 nên bỏ.
  G.STAGE_K = {
    // Đợt 5 (bot đo, tests/cay.py --kd): ải thường vùng ba dễ hơn cả Ngư Tinh (bot cần Sức mạnh ~267 / 286 / 319 ở 3-1 / 3-2 / 3-3 so với
    // ~337 ở 2-5) — 3-1, 3-2 máu và sát thương x1,12, 3-3 x1,08 (cột trùm nhỏ của ba ải này hạ tương ứng, xem dưới).
    mob: [[1.12, 1.29], [1.2, 1.5], [1.24, 1.57], [1.23, 1.655], [1.27, 1.76], [1.45, 2.03], [1.41, 1.9], [1.45, 2.02], [1.17, 1.97], [1.02, 1.91], [1.64, 3.11], [1.57, 2.93], [1.8, 3.28], [1.43, 2.62], [1.29, 3.0]],
    // Sát thương trùm = sát thương quái thường của ải (đã nhân cột mob) x cột boss (js/boss.js makeBoss), nên hệ số bị nhân hai lần.
    // GĐ2 (V5, Q2): hạ riêng cột sát thương trùm nhỏ ải 2-1 (2,95 -> 2,0) và 3-1..3-4 (4,54/4,28/4,43/4,74 -> 2,0/2,1/2,0/1,8)
    // để mỗi đòn gốc không mạnh hơn trùm vùng cùng vùng (Ngư Tinh ~155, Hồ Tinh ~232) và ~45% máu bé vừa đủ khuyên dùng. Cột máu giữ nguyên.
    // Phiên cân bằng: cột trùm tính lại theo cột quái mới để đòn trùm giữ như cũ, trừ:
    //  - trùm nhỏ vùng hai đều dần 62 · 72 · 86 · 100 (trước 71 · 71 · 90 · 133, Cua Đá ải 2-4 đánh gần bằng Ngư Tinh);
    //  - Ngư Tinh (ải 2-5) 155 → 112 mỗi đòn gốc (mục 14: trước ~49% máu bé vừa đủ khuyên dùng, ải kẹt 8-12 lượt);
    //  - trùm nhỏ vùng ba 150 · 162 · 175 · 188; Hồ Tinh 232 → 195 mỗi đòn gốc (trước ~61% máu bé ở ải 3-5, bot không cày
    //    thua 3-5 tới 12 lần liền; nay ~50%, ngang Ngư Tinh).
    //  Máu trùm nhỏ vùng ba (mục 4): 8.670 · 9.260 · 10.380 · 11.790 → ~6.300 · 6.800 · 7.300 · 7.800, đều thấp hơn Hồ Tinh (8.620).
    //  Vùng hai: máu quái +10% nên Cua Đá cũng +10% máu; Ngư Tinh giữ máu cũ (~7.420, cột trùm 1,27 → 1,155).
    // Đợt 5 (bot đo): Ngư Tinh (ải 2-5) là bậc khó vọt (bot cần Sức mạnh ~337, ải 2-4 ~248, ải 3-1 ~267): máu 1,155 → 0,96, sát thương
    // 2,53 → 1,98 (đòn gốc ~112 → ~88; đo lại lần 2: 1,04 / 2,15 vẫn cần ~291, bot cày 7+ lượt ở 2-5). Trùm nhỏ vùng ba đánh một đòn 80-110% máu Zed ở cấp người chơi tới vùng ba (bot đo): đòn gốc
    // ~150 · 162 · 175 · 188 → ~125 · 135 · 145 · 155 (x0,83; ba ải đầu đã tính cả x1,12 / x1,12 / x1,08 của cột quái).
    boss: [[1.12, 1.29], [1.2, 1.5], [1.24, 1.76], [1.23, 1.67], [1.27, 1.86], [1.32, 2.54], [1.614, 2.861], [1.664, 2.933], [1.612, 3.232], [1.318, 2.706], [1.44, 2.22], [1.452, 2.363], [1.17, 2.11], [1.337, 2.65], [1.29, 2.71]],
  };
  // Vùng 4 (ải 16..20): hệ số ải xuất phát [1,3; 3,0] cho quái thường; cột trùm theo mức vùng ba (đòn trùm nhỏ ~165–210, Thuồng Luồng ~215 gốc).
  if (G.VUNG4) for (let i = 0; i < 5; i++) { G.STAGE_K.mob.push([1.3, 3.0]); G.STAGE_K.boss.push(i < 4 ? [1.3, 2.3] : [1.3, 2.4]); }
  // sua-can-bang: số cũ của các ải đã bớt quái. Độ khó 2 luôn dùng số cũ (chưa chọn đổi).
  G.STAGE_K_CU = { 6: [[1.58, 2.14], [1.44, 2.54]], 7: [[1.63, 2.27], [1.48, 2.61]], 8: [[1.44, 2.43], [1.31, 2.62]], 9: [[1.4, 2.61], [0.96, 1.98]], 11: [[1.74, 3.25], [1.31, 2.13]], 13: [[1.62, 2.98], [1.18, 2.33]] };
  G.STAGE_K_K2 = { mob: G.STAGE_K.mob.map((x) => x.slice()), boss: G.STAGE_K.boss.map((x) => x.slice()) };
  for (const k in G.STAGE_K_CU) {
    const [m, b] = G.STAGE_K_CU[k];
    G.STAGE_K_K2.mob[k] = m.slice(); G.STAGE_K_K2.boss[k] = b.slice();
  }
  // Độ khó thứ hai: [máu, sát thương] nhân thêm theo vùng. Trước là x2,2 máu, x1,5 sát thương cho mọi vùng; nay quái thường đã mạnh
  // theo ải, nên vùng sau nhân ít hơn để người chơi đã cày đầy (cấp 30, vũ khí Vàng) vẫn với tới được.
  G.DIFF2 = [[1.6, 1.5], [1.3, 1.3], [1.1, 1.15]];
  if (G.VUNG4) G.DIFF2.push([1.1, 1.15]);
  G.stageStats = function (r, i, diff) {
    const t = i / 4;
    const k = diff ? G.DIFF2[r][0] : 1;
    const kd = diff ? G.DIFF2[r][1] : 1;
    const n = r * 5 + i;
    const SK = (diff && G.STAGE_K_K2) || G.STAGE_K; // độ khó 2: cột cũ (sua-can-bang chỉ đổi độ khó 1)
    const mk = SK.mob[n] || [1, 1], bk = SK.boss[n] || [1, 1];
    return {
      hp: (HP_RANGE[r][0] + (HP_RANGE[r][1] - HP_RANGE[r][0]) * t) * k * mk[0],
      dmg: (DMG_RANGE[r][0] + (DMG_RANGE[r][1] - DMG_RANGE[r][0]) * t) * kd * mk[1],
      bossHp: bk[0], bossDmg: bk[1], // trùm của ải: nhân thêm vào máu và sát thương (js/boss.js)
      xp: Math.round((100 + 60 * n) * (diff ? 1.5 : 1)),
      gold: Math.round((80 + 30 * n) * (diff ? 1.5 : 1)),
    };
  };
  // SỨC MẠNH KHUYÊN DÙNG của từng ải (15 ải). So với G.power() (js/combat.js): đủ số này thì bot thắng phần lớn lượt chơi
  // (đo bằng tests/cay.py). Độ khó thứ hai cần gấp căn bậc hai của (máu x sát thương) nhân thêm của G.DIFF2.
  // Cày nâng cấp (bỏ Quyết tâm, sức mạnh tính cả vũ khí thứ hai): đo lại bằng bot, Ngư Tinh 395 -> 420, đầu vùng ba theo đó,
  // ải 3-4 495 -> 525, Hồ Tinh 515 -> 620 (bot học đủ điểm kỹ năng thì mạnh hơn trước ở cùng con số, nên trùm cuối cần cày thêm).
  // Phiên cân bằng (mục 6): ải 1-1 100 → 95 (người mới 98 không còn bị tô vàng ở ải hướng dẫn); Mộc Tinh 225 → 215 (bot ở 226 thắng
  // ngay lần đầu, cày tới 225 mất ~7 lượt); Hồ Tinh 620 → 560 (bản lưu 544 đã thắng 3/3).
  // Đo lại sau khi làm phẳng đường khó (tests/cay.py 6 lượt): bot tới vùng ba đã dư sức (qua ngay lần đầu), còn Ngư Tinh phải cày
  // gần 7 lượt; nên Ngư Tinh 420 → 405, vùng ba 425/445/475/525 → 440/480/520/540, 1-4 150 → 160, 2-1..2-4 245/270/315/345 →
  // 255/280/330/360: phần cày dời từ ải trùm sang các ải thường (mỗi ải tối đa ~7 lượt, tổng thời gian không ngắn đi quá 25%).
  // Đợt 5 (hệ thống mới, bot chơi thật: tests/cay.py --kd): số cũ (… 255 · 405 · 440 … 560) đo từ luật cũ (bậc màu, quần áo cộng máu).
  // Bot hệ thống mới thắng 75% ở Sức mạnh thấp hơn nhiều từ ải 1-5 (vùng ba ~270-450 so với 440-560), nên bot nghe lời khuyên phải cày
  // 6-8 lượt thừa ở gần như mọi ải (75 lượt, 4,2 giờ). Đo lại sau khi sửa Khiên nước, Ngư Tinh, quái vùng ba: lấy Sức mạnh bot thắng ~75%
  // (khớp đường hồi quy thắng/thua trên bản lưu thật và tỉ lệ thắng lần thử đầu ở số này, 12 lượt chiến dịch).
  // 14/10 (bước 1 làm chắc, mục 5): bot cân bằng chạy trong Node (tests/cay.py --node --kd=4, 6 lượt + 6 lượt "lieu", sau khi có kỹ năng
  // riêng quái vùng): Sức mạnh thắng 75% lệch rõ (> 15%) ở 2-2 (217), 2-3 (262), 3-3 (414), 3-5 (524) → nâng; 2-4, 2-5, 3-1, 3-2, 3-4 nâng
  // vừa đủ để dãy vẫn tăng dần (đo 275 / 306 / 350 / 360 / > 418). Cũ: [95, 105, 125, 140, 175, 180, 185, 220, 240, 275, 285, 315, 355, 400, 435].
  G.STAGE_REC = [95, 105, 125, 140, 175, 180, 215, 260, 275, 305, 310, 330, 410, 420, 520];
  if (G.VUNG4) G.STAGE_REC.push(540, 565, 595, 630, 690); // vùng 4: số xuất phát (bot phiên 4 chốt)
  // Khuyên dùng độ khó 2 = khuyên dùng thường × hệ số theo vùng. Trước: √(máu × sát thương của G.DIFF2) = 1,55 · 1,30 · 1,12.
  // 14/10 (bước 1, mục 5): bot đo (tests/cay.py --kho2 --kd=4) cần ~1,55 · ~1,5 · ~1,33 lần Sức mạnh ải thường cùng chỗ → vùng 2, 3 lệch
  // > 15%: dùng hệ số riêng G.DIFF2_REC (chỉ đổi con số khuyên dùng, quái độ khó 2 giữ nguyên G.DIFF2). null = như cũ.
  G.DIFF2_REC = [null, 1.5, 1.33];
  if (G.VUNG4) G.DIFF2_REC.push(1.33);
  G.stageRec = function (r, i, diff) {
    const v = G.STAGE_REC[r * 5 + i] || 100;
    const k = G.DIFF2_REC && G.DIFF2_REC[r] ? G.DIFF2_REC[r] : Math.sqrt(G.DIFF2[r][0] * G.DIFF2[r][1]);
    return diff ? Math.round((v * k) / 5) * 5 : v;
  };
  // Thưởng khi cày: sức mạnh vượt quá 130% khuyên dùng thì kinh nghiệm và vàng giảm dần, thấp nhất còn 40%.
  G.grindMult = function (power, rec) {
    const q = rec > 0 ? power / rec : 1;
    return q <= 1.3 ? 1 : Math.max(0.4, Math.round((1 - (q - 1.3) * 1.2) * 20) / 20);
  };
  // Phòng vuông: số đợt quái và hệ số điểm mỗi đợt (so với phòng dài trước đây).
  // start: phòng Bắt đầu [ải 1-2, ải 3-5]; early: ải 1-3; late: ải 4-5; maxPerWave: số quái tối đa một đợt;
  // stagger: nửa sau của một đợt hiện ra chậm hơn bấy nhiêu giây.
  G.ROOM_WAVES = { start: [1, 2], early: 3, late: 4, challenge: 2, pts: 0.85, ptsLate: 0.85, maxPerWave: 7, stagger: 2, challengeTime: 30, maxAlive: 4 };
  // maxAlive: phòng thường chỉ có tối đa bấy nhiêu quái cùng lúc (tinh anh tính là hai), số còn lại chờ mọc nối tiếp.
  // Độ dẹt của vùng nguy hiểm và vũng hệ: cao bằng bấy nhiêu lần rộng. Trước là 0,6 (nhìn ngang), nay tròn hơn cho sàn nhìn từ trên.
  G.ZK = 0.85;
  // 14/10 trum-chet-pha3 (docs/review/ke-hoach-cai-thien/trum-chet-pha3): trùm vùng chết bằng ảnh (bỏ hiệu ứng chết vẽ tay), hiệu ứng trùm chạy
  // đều nhịp (căn tâm từng khung, giữ ~12 khung/giây, mờ vào/ra), chiêu tròn đối xứng quanh tâm trùm. Chỉ đổi HÌNH và vị trí cho đối xứng,
  // không đổi sát thương / thời gian chiêu. (15/10 don-tep B: bỏ cờ tắt ?trumcu=1 / G.TRUM_MOI.)
  // 14/10 ky-nang-trum-rieng: 10 chiêu lặp kiểu của trùm vùng / trùm nhỏ / tinh anh đổi sang chiêu mới (js/chieu_trum.js). 15/10 don-tep B: bỏ cờ ?chieucu=1.
  // 15/10 cua-tuong-kho (docs/review/ke-hoach-cai-thien/cua-tuong-kho): Cua Đá không còn chỗ đứng an toàn (đuổi tới mép, chiêu nhắm theo em bé,
  // Tường tinh thể nhốt em bé, đá rơi dọc chân tường). Cờ tắt: ?cuade=1 (hoặc G.CUA_MOI = false) → Cua Đá y hệt cũ. Số liệu: G.CUA_SO (js/boss.js).
  if (G.CUA_MOI === undefined) { let cu = false; try { cu = typeof location !== 'undefined' && /[?&]cuade=1(&|$)/.test(location.search || ''); } catch (e) { cu = false; } G.CUA_MOI = !cu; }
  // 15/10 noi-gian-manh (docs/review/ke-hoach-cai-thien/noi-gian-manh): NỔI GIẬN / HÓA CUỒNG thấy và cảm được — mọi hệ số ở bảng này
  // (js/boss.js, js/chieu_trum.js, js/mobs.js đọc; hình: js/noi_gian.js). (15/10 don-tep B: bỏ cờ tắt ?giancu=1 / G.NOI_GIAN_BAT.)
  // Mảng [pha 1, pha 2, pha 3] của trùm vùng (pha 2 "nổi giận" ≤ 66% máu, pha 3 "hóa cuồng" ≤ 33%); trùm nhỏ [pha 1, pha 2] (pha 2 ≤ nguong).
  // Mọi hệ số so với pha 1. toc: tốc ra chiêu (cử động + báo trước) · nghi: × nghỉ giữa chiêu của pha 1 · noi: [xác suất nối ≥ 2 chiêu, nối 3 chiêu] ·
  // noiNghi: nghỉ (giây) giữa hai chiêu nối · sat: × sát thương (satTrum: riêng một trùm) · diChuyen: × tốc đi · met: × thời gian mệt sau chiêu lớn · dan: × tốc đạn bay.
  // san: sàn công bằng khi nổi giận — báo trước tối thiểu (giây) của vùng thường / vùng to hoặc nhiều đợt; danMax: trần × tốc đạn.
  // chieu: số đòn mỗi chiêu theo pha (mỗi chiêu một cách tăng: so = số đạn / cột / quả, dot = số đợt, hang = số hàng, vong = số vòng, ...).
  G.NOI_GIAN = {
    // sat, satTrum, dan, satDot, tinhAnh.sat: đã HẠ sau khi đo bằng bot cân bằng (docs/review/ke-hoach-cai-thien/noi-gian-manh/bao-cao.md).
    // Số yêu cầu: sat [1, 1,1, 1,2] / trùm nhỏ [1, 1,1] / tinh anh 1,1, đạn tối đa × 1,25. Với số đó bot (đủ Sức mạnh khuyên dùng) thắng trùm
    // tụt 30–60 điểm % (Mộc Tinh, Cua Đá, Hổ Lửa, Hồ Tinh) → hạ sát thương, GIỮ NGUYÊN tốc, nối chiêu, số đòn (cũ → mới):
    // trùm vùng sat 1,1 / 1,2 → 0,5 / 0,45; trùm nhỏ 1,1 → 0,7; tinh anh 1,1 → 0,85; đạn 1,15 / 1,25 → 1,1 / 1,15; nhát của đợt thêm × 0,5.
    // Mỗi nhát nhẹ hơn nhưng nhanh, dày, dồn dập hơn hẳn (sát thương mỗi giây của trùm vẫn cao hơn pha 1). G.STAGE_REC giữ nguyên.
    // satTrum (tuỳ chọn): hệ số riêng một trùm, vd { moc: [1, 0.7, 0.6] } — hiện không dùng.
    vung: { toc: [1, 1.3, 1.55], nghi: [1, 0.7, 0.5], noi: [[0, 0], [0.35, 0], [0.6, 0.2]], noiNghi: 0.3, sat: [1, 0.5, 0.45], diChuyen: [1, 1.2, 1.4], met: [1, 0.8, 0.6], dan: [1, 1.1, 1.15] },
    nho: { nguong: 0.5, toc: [1, 1.3], nghi: [1, 0.65], noi: [[0, 0], [0.4, 0]], noiNghi: 0.3, sat: [1, 0.7], diChuyen: [1, 1], met: [1, 1], dan: [1, 1.1] },
    tinhAnh: { nguong: 0.35, toc: 1.3, hoi: 0.6, sat: 0.85 },
    san: { bao: 0.45, baoTo: 0.6, danMax: 1.25 },
    nhamLai: false, // đợt thêm nhắm lại chỗ em bé? (false: đánh lại đúng hướng đợt đầu; chiêu có nham: true trong chieu thì luôn nhắm lại)
    satDot: 0.5, // × sát thương mỗi nhát của ĐỢT THÊM (đợt 2, 3 của một chiêu: quật lại, phun lại, vồ lại...) so với nhát chính
    chieu: {
      // Mộc Tinh
      mocQuat: { dot: [1, 2, 3] }, // c1 Quật cành: số lần quật (lần 2 quật ngược ra sau lưng, lần 3 quật lại phía trước)
      mocRe: { hang: [1, 2, 2], dot: [1, 2, 3], nham: true }, // c2 Rễ đâm: hàng gai (như cũ) + đợt rễ đâm lại nhắm theo em bé
      mocQua: { so: [5, 7, 8] }, // c3 Mưa quả độc: số quả (cũ 5 / 5 / 6)
      mocBua: { so: [5, 7, 8] }, // c4 Bùa bay: số lá bùa (cũ 5)
      mocGai: { vong: [3, 4, 5] }, // c5 Rừng gai (pha 3): số vòng gai lan (cũ 3; vòng 4, 5 lan lại từ trong, khe đổi chỗ)
      // Ngư Tinh
      nguRiu: { dot: [1, 2, 3], nham: true }, // c1 Bổ rìu san hô: số nhát bổ (nhát thêm: vết nứt mới nhắm lại, không văng mảnh)
      nguSong: { tuong: [1, 2, 3] }, // c2 Sóng thần: số bức tường nước (cũ 1 / 2 / 2; đo bot: [1, 3, 4] làm Ngư Tinh tụt mạnh)
      nguPhun: { dot: [1, 2, 3], gai: [3, 4, 5] }, // c3 Phun băng: số lần phun (cùng hướng), số ô gai băng mỗi lần
      nguCot: { so: [6, 8, 10] }, // c4 Cột nước đuổi: số cột (cũ 6)
      nguXoay: { vong: [0, 1, 2] }, // c5 Xoáy hút (pha 3): số vòng sóng bung thêm sau cú nổ giữa
      // Hồ Tinh
      hoHoa: { so: [5, 7, 8] }, // c1 Hồ hoả: số cầu lửa (cũ 5 / 6 / 8)
      hoVo: { lan: [1, 3, 4] }, // c2 Vồ nhảy: số lần nhảy (cũ 1 / 2 / 2)
      hoQuat: { dot: [1, 2, 3] }, // c3 Quạt đuôi: số lần quạt (cùng hướng)
      hoPhan: { lao: [4, 5, 6] }, // c4 Hồ ly phân thân: số lượt lao (cũ 4; lượt 5, 6 là bóng giả lao ngược lại)
      hoBao: { dot: [3, 4, 5] }, // c5 Bão hồ hoả (pha 3): số đợt cầu lửa (cũ 3)
      // Trùm nhỏ [pha 1, pha 2]
      nhoDon: { dot: [1, 1] }, // đòn thường (không phải chiêu): không thêm nhát — đo bot: thêm nhát làm Cua Đá tụt 50 điểm % (đặt [1, 2] để bật)
      cuaDap: { dot: [1, 2] }, // Cua Đá Đập càng rung sàn: đập thêm một lần
      cuaTuong: { dot: [1, 2] }, // Cua Đá Tường tinh thể: tường vỡ bắn thêm một loạt mảnh (lệch nửa hàng)
      namHang: { dot: [1, 2], nham: true }, // Nấm Chúa Hàng nấm độc: thêm một hàng nhắm lại
      namMe: { so: [3, 4] }, // Nấm Chúa Nấm mẹ đẻ con: số nấm con
      hoVoLua: { dot: [1, 2], nham: true }, // Hổ Lửa Vồ lửa: vồ thêm một lần nhắm lại
      hoPhun: { dot: [1, 2] }, // Hổ Lửa Gầm phun lửa: phun thêm một lần (cùng hướng)
    },
  };
  // 16/10 tư vấn 2 (docs/review/ke-hoach-cai-thien/tu-van-2/bao-cao.md): LUẬT CÔNG BẰNG cho trùm vùng, trùm nhỏ, tinh anh. Cờ tắt:
  // ?trumcongbang=0 (G.TRUM_CONG_BANG = false) → y hệt trước. Luật (js/boss.js G.congBang + chỗ gọi ở js/chieu_trum.js, js/mobs.js,
  // js/thuong_luong.js): đòn NẶNG (≥ nang × sát thương gốc) báo trước ≥ baoNang giây (đòn nhẹ giữ như cũ); đòn nặng hụt → trùm nghỉ
  // nghiSauHut giây không ra đòn mới; hai đòn nhắm lại chỗ Cu Tí trong một chiêu cách nhau ≥ nghiNham (nhẹ) / nghiHut (nặng) giây tính từ
  // lúc đòn trước nổ; không ra chiêu mới khi vùng báo của chính nó (báo ≤ choTre giây; dài hơn là bẫy: nấm con, vòm thân) còn chưa nổ và chưa qua nghiNham giây sau lần nổ cuối.
  // ng: nổi giận / hóa cuồng đổi nhịp chứ không chỉ nhanh hơn — tốc ra chiêu tối đa +15%, nghỉ giữa chiêu ngắn đi tối đa ~13%; nối chiêu
  // (dồn 2–3 chiêu, nghỉ noiNghi) xong thì nghỉ dài hơn (× (1 + sauNoi × số chiêu đã nối)). mau: × máu trùm bù lại sau khi đo bot.
  if (G.TRUM_CONG_BANG === undefined) { let tat = false; try { tat = typeof location !== 'undefined' && /[?&]trumcongbang=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; } G.TRUM_CONG_BANG = !tat; }
  G.CONG_BANG = {
    nang: 1.2, baoNang: 0.7, cotChia: 2, // cotChia: Cột nước đuổi (Ngư Tinh) — cột sau chỉ báo khi cột trước đã phun, số cột ÷ cotChia cho chiêu không quá dài
    nghiSauHut: 0.7, nghiHut: 0.65, nghiNham: 0.35, choTre: 1.6,
    ng: {
      vung: { toc: [1, 1.08, 1.15], nghi: [1, 0.92, 0.87], diChuyen: [1, 1.08, 1.15], met: [1, 0.9, 0.85], noiNghi: 0.45 },
      nho: { toc: [1, 1.12], nghi: [1, 0.9], noiNghi: 0.45 },
      tinhAnh: { toc: 1.12, hoi: 0.95, bung: 0.8 }, // bung: nổi giận thì bung chiêu riêng sau tối đa bấy nhiêu giây (đổi nhịp)
      sauNoi: 0.5, baoTo: 0.7,
    },
    // Bù máu sau khi đo bot (docs/review/ke-hoach-cai-thien/tu-van-2/bao-cao.md mục 6): trùm vùng theo loại, trùm nhỏ theo hình (mini: còn lại).
    mau: { moc: 1.45, ngu: 1.4, ho: 1.3, thuong: 1.3, cuaDa: 1.15, caTre: 1.2, mini: 1 },
  };
  if (G.TRUM_CONG_BANG) {
    const N = G.NOI_GIAN, C = G.CONG_BANG.ng;
    Object.assign(N.vung, C.vung); Object.assign(N.nho, C.nho);
    N.tinhAnh.toc = C.tinhAnh.toc; N.tinhAnh.hoi = C.tinhAnh.hoi;
    N.san.baoTo = C.baoTo; // đợt thêm của chiêu (vùng to / nhiều đợt) khi nổi giận: báo trước ≥ 0,7 giây
  }
  // Lăn né: tốc độ ngang (điểm ảnh mỗi giây) và tỉ lệ chiều dọc so với chiều ngang (bằng tỉ lệ lúc đi bộ).
  G.DODGE = { vx: 195, ky: 0.75 };
  G.MINI_HP = 12; // máu trùm nhỏ = hệ số x máu quái thường
  G.BOSS_HP = 24; // máu boss vùng = hệ số x máu quái thường
  // Hồ Tinh né nhiều nên ít lúc đánh trúng, cho ít máu hơn để trận không kéo quá 3 phút.
  G.BOSS_HP_OF = { moc: 20, ngu: 20, ho: 14 };
  if (G.VUNG4) G.BOSS_HP_OF.thuong = 20;
  // Số ải (5 mỗi vùng) và số ải phải qua để mở Độ khó 2 của ba vùng đầu (giữ "hạ Hồ Tinh" như cũ — Q8 = A).
  G.SO_AI = () => G.REGIONS.length * 5;

  // Đợt 2: bỏ G.GEAR (mũ, áo, bùa đời cũ) và G.SETS (bộ 2 món cũ) — bảng hoàn tiền nằm ở js/vk_moi.js.

  G.CURSES = [
    { id: 'frail', name: 'Máu tối đa giảm 20% đến hết ải' },
    { id: 'dry', name: 'Không dùng được bình máu đến hết ải' },
    { id: 'haste', name: 'Quái nhanh hơn 15% đến hết ải' },
  ];

  // Chi phí mài từ cấp n lên n+1 (mat: số nguyên liệu vùng, vùng nào xem G.sharpenFull)
  // Cày nâng cấp: quặng tối đa 16 mỗi lần (mài +11..+15 không đòi hàng chục quặng), +7..+9 tốn 5 nguyên liệu.
  G.sharpenCost = function (n) {
    return { ore: Math.min(16, 2 + n * 2), gold: 50 * (n + 1), mat: n >= 7 ? 5 : n >= 5 ? 3 : 0 };
  };
  // CÀY NÂNG CẤP: mài tối đa +10 -> +15. Lò cấp 4 (cần đá lửa của Lâu đài cổ) mài được tới +15.
  G.MAX_SHARPEN = 15;
  G.FORGE_CAP = [0, 3, 6, 10, 15];
  G.FORGE_UP = [null, { gold: 200, mat: [6, 0, 0] }, { gold: 600, mat: [0, 6, 0] }, { gold: 1500, ore: 20, mat: [0, 0, 10] }];
  // Chi phí mài đầy đủ (dạng trả được): mài lên +6..+9 tốn vảy cá (vùng hai cày được), lên +10..+15 tốn đá lửa (vùng ba).
  // Trước đây +7 trở lên đã đòi đá lửa nên ở vùng hai người chơi kẹt ở +7, vàng và vảy cá dồn lại không tiêu được.
  G.sharpenFull = function (n) {
    const c = G.sharpenCost(n), cost = { ore: c.ore, gold: c.gold, mat: [0, 0, 0] };
    // Phiên cân bằng (mục 3): mài +9 lên +10 nay tốn đá lửa (trước tốn vảy cá vùng hai: người chơi ở vùng ba kẹt vì thiếu vảy cá).
    // Đợt 4: mài +5 lên +6 tốn gỗ linh (trước vảy cá). Gỗ linh chỉ còn dùng nâng lò cấp 2 (6 món) nên dồn hàng trăm không có chỗ tiêu;
    // lò cấp 2 mài tới +6, đúng lúc đang ở vùng một nên gỗ linh có sẵn.
    if (c.mat) cost.mat[n < 6 ? 0 : n < 9 ? 1 : 2] = c.mat;
    return cost;
  };
  // Đợt 4: ĐÁ TÔI bỏ hẳn (chỉ dùng cho Tôi lại / nâng bậc Tím, Vàng / nâng bậc trang phục — đều bỏ ở đợt 1, 2). Chỗ nào trước cho
  // 1 đá tôi nay cho bấy nhiêu quặng (quặng là thứ thiếu nhất khi mài); đá tôi còn trong bản lưu đổi ra quặng cùng tỉ lệ (js/vk_moi.js).
  G.DA_TOI_QUANG = 6;
  // Đợt 2: bỏ G.TIER_UP, G.goldCost (nâng bậc Lam / Tím / Vàng ở Ông Thợ Rèn của luật cũ).
  // ĐỔI VÀNG LẤY NGUYÊN LIỆU VÙNG ĐÃ QUA (mục 3): Bà Hàng Xén (thẻ Nguyên liệu) và Thương nhân trong ải bán nguyên liệu của vùng
  // đã hạ trùm, giá gia vàng một món. Giới hạn: kho hàng có tối đa max lượt; mỗi ải thắng (cả chơi lại) thêm them lượt.
  // Không theo ngày giờ máy (không lách được bằng chỉnh đồng hồ, không cần mạng). Bản lưu cũ chưa có thì nhận sẵn batDau lượt.
  G.DOI_NL = { gia: 150, max: 10, them: 2, batDau: 5 };
  // 14/10 (bước 1 làm chắc, mục 4): Bà Hàng Xén BÁN QUẶNG (chỗ tiêu vàng). gia vàng / 1 quặng: cao hơn một chút so với giá quặng sẵn có
  // (Thương nhân trong ải: 3 quặng 100 vàng ≈ 33 vàng / quặng); moiNgay: tối đa bấy nhiêu quặng mỗi ngày (theo ngày trên máy, đặt lại lúc
  // nửa đêm; chỉnh lùi giờ máy không hồi lượt) để không thay được việc cày (một ải thắng cho 4-12 quặng). Bản lưu: sv.banQuang = { cuoi, n }.
  // Cờ tắt: ?banquang=0 (G.BAN_QUANG_BAT = false).
  G.BAN_QUANG = { gia: 40, moiNgay: 15 };
  G.BAN_QUANG_BAT = true;
  try { if (typeof location !== 'undefined' && /[?&]banquang=0(&|$)/.test(location.search || '')) G.BAN_QUANG_BAT = false; } catch (e) { /* giữ mặc định */ }

  // 14/10 (bước 1 làm chắc, mục 6): viết lại theo hệ mới (4 vũ khí, linh khí túi chung Trắng → Thức tỉnh, ép đồ 7 bậc, bộ đồ vùng);
  // bỏ câu dấu ấn / khoá nhánh 60 dấu ấn / dấu ấn thừa của luật cũ. Thứ tự giữ nguyên (js/village.js đọc HINTS[0..5]).
  G.HINTS = [
    'Kết liễu quái đang dính hiệu ứng hệ thì được thêm linh khí. Tinh anh, trùm và viên linh khí quái rơi cho nhiều linh khí hơn.',
    'Linh khí vào một túi chung. Cu Tí mang đủ 4 vũ khí (Kiếm, Thương, Búa, Phi tiêu); ở Ông Thợ Rèn dùng linh khí nâng từng món: Trắng → Mầm (chọn Lửa, Độc hoặc Băng) → Thành hình → Thức tỉnh.',
    'Trùm học theo bạn (từ ải thứ hai): dùng một hệ quá nhiều thì nó kháng hệ đó, nhưng yếu với hệ khắc chế (đánh bằng hệ khắc chế mạnh hơn 50%).',
    'Kháng Lửa thì yếu Băng. Kháng Băng thì yếu Độc. Kháng Độc thì yếu Lửa.',
    // GĐ2 (V16, Q8): câu cũ "Lửa hợp với bầy quái" sai số đo (đánh đám Độc vẫn mạnh hơn Lửa). Chỉ sửa câu, chưa đổi số Lửa.
    'Lửa đốt cháy; từ Thức tỉnh, quái đang cháy mà chết thì nổ lan sang con đứng gần. Độc cộng dồn tầng, mạnh với quái trâu, trùm và cả bầy đông. Băng làm chậm, đủ tầng thì đóng băng, hợp với quái nhanh.',
    // GĐ2 (V48): ghi rõ phản ứng chỉ có giữa hai vũ khí khác hệ, và tương tác ẩn Độc - Băng.
    'Lửa gặp Độc gây Nổ khói. Lửa gặp Băng gây Sốc nhiệt. Độc gặp Băng không phản ứng, nhưng Băng làm Độc tan chậm một nửa. Phản ứng chỉ có giữa hai vũ khí khác hệ (đổi vũ khí khi quái còn dính hệ cũ); chưởng không gây phản ứng với vũ khí.',
    'Hạ trùm bằng hệ khắc chế nó để nhận sao thứ ba.',
    'Vũ khí có bảy bậc ép đồ: Trắng, Xanh lam, Xanh lục, Tím, Vàng, Đỏ, Rực lửa. Ép ở Ông Thợ Rèn (thẻ Ép đồ) bằng đá nâng bậc rơi từ trùm.',
    'Thành hình mở đặc trưng hệ thứ nhất, Thức tỉnh mở đặc trưng thứ hai.',
    'Mỗi ải có Sức mạnh khuyên dùng. Số đỏ là bé còn yếu: chơi lại ải cũ để lên cấp, kiếm linh khí, quặng, nguyên liệu và đá nâng bậc, rồi nâng cấp, mài và ép đồ vũ khí.',
    'Thiếu nguyên liệu của vùng đã qua? Bà Hàng Xén (thẻ Nguyên liệu) và Thương nhân trong ải đổi vàng lấy nguyên liệu. Thiếu quặng thì mua ở thẻ Quặng của Bà Hàng Xén (mỗi ngày có hạn).',
    'Hạ trùm vùng thì Cô Thợ May bày bán bộ đồ của vùng đó (thẻ Mua, trả bằng vàng). Mua xong cô nâng bộ bằng linh khí, vàng và mảnh trùm; mỗi cấp bộ mở một skill riêng, chỉ có tác dụng khi đang mặc bộ đó.',
  ];
})();

// ===================== BƯỚC 2 — PHIÊN B: VIỆC HÔM NAY (việc làng hằng ngày của Anh Mõ) =====================
// docs/ke-hoach/buoc-2/KE-HOACH.md mục 1.2 (bảng thưởng, 22 mẫu việc). Mã chạy: js/viec_ngay.js. Cờ quay lui ?viecngay=0.
// Chỉ có SỐ và CHỮ ở đây; điều kiện mở từng mẫu, cách đếm tiến độ nằm trong js/viec_ngay.js (theo mã mẫu).
// thuong: [mức 1, mức 2, mức 3] theo trùm vùng cao nhất đã hạ (chưa hạ Mộc Tinh = mức 1, đã hạ Mộc Tinh = 2, đã hạ Ngư Tinh = 3).
// Mỗi việc: { v: vàng, q: quặng }. Rương ngày (xong 3/3): { da: đá nâng bậc, lk: linh khí }. Rương tuần (đủ tuanCan ngày): { bua, da }.
// Mẫu: m mã · nhom (3 việc một ngày khác nhóm) · muc 0 Dễ / 1 Vừa / 2 Khó · can số cần · chu câu việc ({0} = số cần, {1} = tham số) · icon ô trong tấm B8.
(function () {
  const G = window.G;
  G.VIEC_NGAY = {
    moSau: '0-1', // mở khi đã qua ải Rừng già 2 (cùng lúc Cô Thợ May ra mặt) — Q1 = a
    soViec: 3, doiMoiNgay: 1, tuanCan: 5, // Q8 = a (1 lần đổi miễn phí), Q9 = a (5/7 ngày)
    thuong: [
      [{ v: 60, q: 2 }, { v: 120, q: 3 }, { v: 200, q: 4 }], // việc Dễ
      [{ v: 90, q: 3 }, { v: 180, q: 4 }, { v: 300, q: 6 }], // việc Vừa
      [{ v: 120, q: 4 }, { v: 240, q: 6 }, { v: 400, q: 8 }], // việc Khó
    ],
    ruongNgay: [{ da: 2, lk: 8 }, { da: 3, lk: 12 }, { da: 4, lk: 16 }],
    ruongTuan: [{ bua: 1, da: 5 }, { bua: 1, da: 8 }, { bua: 1, da: 12 }],
    mau: [
      { m: 'haQuai', nhom: 'haQuai', muc: 0, can: 30, chu: 'Hạ {0} quái', icon: 0 },
      { m: 'haTinhAnh', nhom: 'haQuai', muc: 1, can: 3, chu: 'Hạ {0} tinh anh', icon: 1 },
      { m: 'haLoai', nhom: 'so', muc: 0, can: 8, chu: 'Hạ {0} con {1}', icon: 0 },
      { m: 'timDiemYeu', nhom: 'so', muc: 2, can: 1, chu: 'Tìm ra điểm yếu của {0} quái mới trong sổ', icon: 5 },
      { m: 'quaAi', nhom: 'quaAi', muc: 0, can: 2, chu: 'Qua {0} ải bất kỳ', icon: 2 },
      { m: 'khongBinh', nhom: 'quaAi', muc: 1, can: 1, chu: 'Qua {0} ải không dùng bình máu', icon: 4 },
      { m: 'baSao', nhom: 'quaAi', muc: 2, can: 1, chu: 'Qua {0} ải đạt 3 sao', icon: 3 },
      { m: 'trumKhac', nhom: 'trum', muc: 2, can: 1, chu: 'Hạ {0} trùm bằng hệ khắc chế (sao thứ ba)', icon: 5 },
      { m: 'veVung', nhom: 'quaAi', muc: 0, can: 1, chu: 'Về thăm {1}: qua {0} ải ở đó', icon: 2 },
      { m: 'kho2', nhom: 'quaAi', muc: 2, can: 1, chu: 'Qua {0} ải độ khó 2', icon: 3 },
      { m: 'aiNgay', nhom: 'aiNgay', muc: 1, can: 1, chu: 'Thắng {0} lượt Ải ngày', icon: 11 },
      { m: 'heKet', nhom: 'he', muc: 1, can: 15, chu: 'Kết liễu {0} quái bằng đòn {1}', icon: 5 },
      { m: 'dinhHe', nhom: 'he', muc: 0, can: 25, chu: 'Hạ {0} quái đang dính cháy, độc hoặc chậm', icon: 5 },
      { m: 'phanUng', nhom: 'he', muc: 2, can: 5, chu: 'Gây {0} lần phản ứng hệ (Nổ lan, Lây độc, Băng vỡ)', icon: 6 },
      { m: 'vuKhi', nhom: 'vuKhi', muc: 0, can: 12, chu: 'Hạ {0} quái bằng {1}', icon: 0 },
      { m: 'doiVk', nhom: 'vuKhi', muc: 0, can: 10, chu: 'Đổi vũ khí giữa trận {0} lần', icon: 0 },
      { m: 'dacBiet', nhom: 'chieu', muc: 0, can: 10, chu: 'Dùng đòn Đặc biệt {0} lần', icon: 8 },
      { m: 'chuong', nhom: 'chieu', muc: 0, can: 15, chu: 'Bắn Chưởng {0} lần', icon: 8 },
      { m: 'ne', nhom: 'chieu', muc: 0, can: 20, chu: 'Lộn né {0} lần', icon: 7 },
      { m: 'ruong', nhom: 'phong', muc: 0, can: 2, chu: 'Mở {0} rương báu', icon: 9 },
      { m: 'thuThach', nhom: 'phong', muc: 1, can: 1, chu: 'Thắng {0} phòng thử thách', icon: 3 },
      { m: 'nangCap', nhom: 'lang', muc: 0, can: 1, chu: 'Nâng cấp {0} lần ở làng (mài, ép đồ, học điểm…)', icon: 10 },
    ],
  };
  G.VIEC_NGAY_BAT = true;
  try { if (typeof location !== 'undefined' && /[?&]viecngay=0(&|$)/.test(location.search || '')) G.VIEC_NGAY_BAT = false; } catch (e) { /* giữ mặc định */ }
})();

// ======================= BƯỚC 2 — PHIÊN C: THÀNH TỰU + DANH HIỆU (docs/ke-hoach/buoc-2/KE-HOACH.md mục 1.3) =======================
// Khối riêng của Phiên C (Phiên A / B thêm khối của mình ở cuối tệp, không sửa khối này). Luật + giao diện ở js/thanh_tuu.js.
// Mỗi thành tựu: ma (mã lưu ở G.save.tt), ten, cach (cách đạt), cap ('dong' | 'bac' | 'vang'), hinh (ô 0..15 của tấm ảnh B12 gd-huy-hinh,
// chưa có ảnh thì vẽ code), dk (điều kiện, js/thanh_tuu.js đọc), th (thưởng MỘT lần khi bấm Nhận: vang, lk = linh khí, da = đá nâng bậc,
// bua = bùa giữ bậc, quang = quặng, dh = mã danh hiệu). Tổng thưởng cả game: 1.800 vàng, 130 linh khí, 19 đá, 6 bùa, 10 quặng (xem báo cáo).
// Hình B12: 0 chim Lạc · 1 bé · 2 sọ quái · 3 sao · 4 bình máu · 5 hai vũ khí · 6 mầm · 7 kiếm Thức tỉnh · 8 ba hệ · 9 đe · 10 lửa · 11 đá mài
//           12 sổ mở · 13 lịch mặt trời · 14 rương · 15 vương miện
(function () {
  const G = window.G;
  G.THANH_TUU = {
    CAP: { dong: { ten: 'Đồng', mau: '#d08a4a', toi: '#6a3a1a' }, bac: { ten: 'Bạc', mau: '#d8dce4', toi: '#5a606e' }, vang: { ten: 'Vàng', mau: '#ffd24a', toi: '#7a5a10' } },
    DS: [
      { ma: 'buocDau', ten: 'Bước đầu', cach: 'Qua ải hướng dẫn', cap: 'dong', hinh: 1, dk: { k: 'huongDan' }, th: { vang: 100, dh: 'tanBinh' } },
      { ma: 'cuuTeo', ten: 'Cứu bạn đầu tiên', cach: 'Hạ Mộc Tinh, cứu Cu Tèo', cap: 'dong', hinh: 0, dk: { k: 'cuu', vung: 0 }, th: { lk: 10, dh: 'cuuBan' } },
      { ma: 'cuuBong', ten: 'Cứu Cái Bống', cach: 'Hạ Ngư Tinh, cứu Cái Bống', cap: 'bac', hinh: 0, dk: { k: 'cuu', vung: 1 }, th: { lk: 20 } },
      { ma: 'cuuLi', ten: 'Cứu Cu Lì', cach: 'Hạ Hồ Tinh, cứu Cu Lì', cap: 'vang', hinh: 15, dk: { k: 'cuu', vung: 2 }, th: { lk: 30, dh: 'anhHung' } },
      { ma: 'quai100', ten: 'Diệt yêu', cach: 'Hạ 100 quái', cap: 'dong', hinh: 2, dk: { k: 'dem', dem: 'quai', can: 100 }, th: { vang: 200 } },
      { ma: 'quai1000', ten: 'Trừ yêu', cach: 'Hạ 1.000 quái', cap: 'bac', hinh: 2, dk: { k: 'dem', dem: 'quai', can: 1000 }, th: { da: 3 } },
      { ma: 'quai5000', ten: 'Khắc tinh yêu quái', cach: 'Hạ 5.000 quái', cap: 'vang', hinh: 2, dk: { k: 'dem', dem: 'quai', can: 5000 }, th: { bua: 1, dh: 'khacTinh' } },
      { ma: 'tinhAnh50', ten: 'Săn tinh anh', cach: 'Hạ 50 tinh anh', cap: 'bac', hinh: 5, dk: { k: 'dem', dem: 'tinhAnh', can: 50 }, th: { da: 3 } },
      { ma: 'sao15', ten: 'Mười lăm sao', cach: 'Tổng 15 sao (độ khó thường)', cap: 'dong', hinh: 3, dk: { k: 'sao', can: 15 }, th: { vang: 300 } },
      { ma: 'sao45', ten: 'Trọn sao', cach: 'Đủ 45 sao ở 15 ải độ khó thường', cap: 'vang', hinh: 3, dk: { k: 'sao', can: 45 }, th: { bua: 1, dh: 'saoSang' } },
      { ma: 'kho2', ten: 'Gan dạ', cach: 'Qua 1 ải độ khó 2', cap: 'bac', hinh: 5, dk: { k: 'kho2', can: 1 }, th: { da: 5 } },
      { ma: 'kho2Trum', ten: 'Không sợ trùm', cach: 'Hạ Hồ Tinh ở độ khó 2', cap: 'vang', hinh: 15, dk: { k: 'kho2Ai', ai: '2-4' }, th: { bua: 1, dh: 'khongSo' } },
      { ma: 'khongBinh', ten: 'Không cần thuốc', cach: 'Qua 10 ải không dùng bình máu', cap: 'bac', hinh: 4, dk: { k: 'dem', dem: 'khongBinh', can: 10 }, th: { vang: 300 } },
      { ma: 'khacChe', ten: 'Biết người biết ta', cach: 'Hạ trùm bằng hệ khắc chế 10 lần', cap: 'bac', hinh: 8, dk: { k: 'dem', dem: 'khacChe', can: 10 }, th: { lk: 15, dh: 'quanSu' } },
      { ma: 'khongKip', ten: 'Nhanh hơn trùm', cach: 'Hạ một trùm vùng khi nó chưa kịp kháng hệ nào', cap: 'vang', hinh: 10, dk: { k: 'dem', dem: 'khongKip', can: 1 }, th: { lk: 20, dh: 'tiaChop' } },
      { ma: 'mam', ten: 'Mầm non', cach: 'Nâng 1 vũ khí lên Mầm', cap: 'dong', hinh: 6, dk: { k: 'vkCap', cap: 1, so: 1 }, th: { vang: 100 } },
      { ma: 'thucTinh1', ten: 'Thức tỉnh', cach: 'Nâng 1 vũ khí lên Thức tỉnh', cap: 'bac', hinh: 7, dk: { k: 'vkCap', cap: 3, so: 1 }, th: { da: 3 } },
      { ma: 'thucTinh4', ten: 'Bốn món thần binh', cach: 'Cả 4 vũ khí lên Thức tỉnh', cap: 'vang', hinh: 7, dk: { k: 'vkCap', cap: 3, so: 4 }, th: { bua: 1, dh: 'chuThanBinh' } },
      { ma: 'baHe', ten: 'Đủ ba hệ', cach: 'Có vũ khí Thức tỉnh hệ Lửa, Độc và Băng (cùng lúc hoặc lần lượt)', cap: 'vang', hinh: 8, dk: { k: 'baHe' }, th: { lk: 20 } },
      { ma: 'epTim', ten: 'Ép đồ lên Tím', cach: 'Ép 1 vũ khí lên bậc Tím', cap: 'dong', hinh: 9, dk: { k: 'ep', bac: 3 }, th: { da: 2 } },
      { ma: 'epDo', ten: 'Rực lửa', cach: 'Ép 1 vũ khí lên bậc Rực lửa', cap: 'vang', hinh: 10, dk: { k: 'ep', bac: 6 }, th: { dh: 'thoRen' } },
      { ma: 'mai10', ten: 'Mài sắc', cach: 'Mài 1 vũ khí lên +10', cap: 'bac', hinh: 11, dk: { k: 'mai', can: 10 }, th: { quang: 10 } },
      { ma: 'cap20', ten: 'Lớn khôn', cach: 'Cu Tí lên cấp 20', cap: 'bac', hinh: 1, dk: { k: 'cap', can: 20 }, th: { vang: 300 } },
      { ma: 'cap40', ten: 'Trưởng thành', cach: 'Cu Tí lên cấp 40', cap: 'vang', hinh: 15, dk: { k: 'cap', can: 40 }, th: { dh: 'daiHiep' } },
      { ma: 'boDo', ten: 'Tủ đồ', cach: 'Có đủ 4 bộ trang phục', cap: 'bac', hinh: 14, dk: { k: 'boDo', can: 4 }, th: { lk: 15 } },
      { ma: 'chuongDay', ten: 'Chưởng đầy', cach: 'Học đầy 1 cây chưởng', cap: 'bac', hinh: 10, dk: { k: 'chuongDay' }, th: { vang: 300 } },
      { ma: 'so12', ten: 'Chép sổ', cach: '12 trang Sổ yêu quái đạt ★', cap: 'dong', hinh: 12, dk: { k: 'soSao', sao: 1, can: 12 }, th: { vang: 200 } },
      { ma: 'soDu', ten: 'Sổ đủ trang', cach: 'Cả 36 trang Sổ yêu quái đạt ★★', cap: 'vang', hinh: 12, dk: { k: 'soSao', sao: 2, can: 36 }, th: { bua: 1, dh: 'nhaYeuQuaiHoc' } },
      { ma: 'viec7', ten: 'Chăm chỉ', cach: 'Nhận rương ngày 7 lần', cap: 'bac', hinh: 13, dk: { k: 'ruongNgay', can: 7 }, th: { da: 3, dh: 'chamNgoan' } },
      { ma: 'viec30', ten: 'Siêng năng', cach: 'Nhận rương ngày 30 lần', cap: 'vang', hinh: 13, dk: { k: 'ruongNgay', can: 30 }, th: { bua: 1, dh: 'conNgoan' } },
    ],
    // Danh hiệu: chỉ để khoe, KHÔNG cộng sức mạnh. tu: 'tt' (nhận thưởng thành tựu có dh) | 'so' (Sổ yêu quái, Phiên A: so.vung[vung] có bit)
    DH: {
      tanBinh: { ten: 'Tân binh', cap: 'dong' }, cuuBan: { ten: 'Người cứu bạn', cap: 'dong' }, anhHung: { ten: 'Anh hùng làng', cap: 'vang' },
      khacTinh: { ten: 'Khắc tinh yêu quái', cap: 'vang' }, saoSang: { ten: 'Sao sáng', cap: 'vang' }, khongSo: { ten: 'Không biết sợ', cap: 'vang' },
      quanSu: { ten: 'Quân sư nhí', cap: 'bac' }, tiaChop: { ten: 'Tia chớp', cap: 'vang' }, chuThanBinh: { ten: 'Chủ thần binh', cap: 'vang' },
      thoRen: { ten: 'Thợ rèn lửa', cap: 'vang' }, daiHiep: { ten: 'Đại hiệp nhí', cap: 'vang' }, nhaYeuQuaiHoc: { ten: 'Nhà yêu quái học', cap: 'vang' },
      chamNgoan: { ten: 'Chăm ngoan', cap: 'bac' }, conNgoan: { ten: 'Con ngoan trò giỏi', cap: 'vang' },
      thoSan0: { ten: 'Thợ săn Rừng già', cap: 'bac', tu: 'so', vung: 0, bit: 1 }, thoSan1: { ten: 'Thợ săn Hang biển', cap: 'bac', tu: 'so', vung: 1, bit: 1 },
      thoSan2: { ten: 'Thợ săn Lâu đài cổ', cap: 'bac', tu: 'so', vung: 2, bit: 1 },
      bacThay0: { ten: 'Bậc thầy Rừng già', cap: 'vang', tu: 'so', vung: 0, bit: 2 }, bacThay1: { ten: 'Bậc thầy Hang biển', cap: 'vang', tu: 'so', vung: 1, bit: 2 },
      bacThay2: { ten: 'Bậc thầy Lâu đài cổ', cap: 'vang', tu: 'so', vung: 2, bit: 2 },
    },
  };
})();

// ===================== BƯỚC 2 — PHIÊN A: SỔ YÊU QUÁI (js/so_yeu_quai.js) — khối riêng, các phiên khác không sửa =====================
// docs/ke-hoach/buoc-2/KE-HOACH.md mục 1.1. Mỗi trang: [mã hình quái (js/monster_art.js, trùng e.art), vùng 0..2, loại, hệ khắc chế].
//   loại: 'thuong' (quái thường) · 'tinhanh' · 'trumnho' · 'trum' (trùm vùng: điểm yếu = đạt sao thứ ba khi hạ, hệ để null).
//   Hệ khắc chế của quái thường / tinh anh / trùm nhỏ CHỈ ĐỂ GHI SỔ, không đổi sát thương (QUYET-DINH.md, Q3 = a).
//   Quy tắc: Bầy nhỏ → Lửa, Khiên → Độc, Xạ thủ + Nhanh nhẹn → Băng; vai khác → hệ khắc hệ của vùng (Rừng già Lửa, Hang biển Độc, Lâu đài cổ Băng).
// Thưởng (bấm Nhận ở Ông Từ, mỗi nấc một lần):
//   ★ đã hạ: vang[loại][vùng] · ★★ tìm ra điểm yếu: lk[loại] linh khí · ★★★ thuần thục (hạ đủ can[loại] con): da[loại] đá nâng bậc
//   Vùng: mọi trang ★★ → vungDa[vùng] đá nâng bậc + danh hiệu "Thợ săn <vùng>"; mọi trang ★★★ → danh hiệu "Bậc thầy <vùng>" (chỉ danh hiệu).
//   Cả game (một lần): 2.640 vàng, 198 linh khí, 46 đá nâng bậc — xem docs/ke-hoach/buoc-2/bao-cao-phien-A.md (bảng cân bằng trước / sau).
// Vùng mới (Bước 3) chỉ cần thêm dòng vào trang (vùng 3…) và một số vào vang / vungDa: sổ tự có thêm một mục.
(function () {
  const G = (window.G = window.G || {});
  G.SO_YQ = {
    trang: [
      ['heoCon', 0, 'thuong', 'fire'], ['ongVo', 0, 'thuong', 'fire'], ['boHung', 0, 'thuong', 'poison'], ['hoaBaoTu', 0, 'thuong', 'ice'],
      ['chonBong', 0, 'thuong', 'ice'], ['namPhong', 0, 'thuong', 'fire'], ['socNo', 0, 'thuong', 'fire'], ['nhimDoc', 0, 'thuong', 'fire'],
      ['heoNanh', 0, 'tinhanh', 'fire'], ['namPhongChua', 0, 'tinhanh', 'fire'], ['namChua', 0, 'trumnho', 'fire'], ['mocTinh', 0, 'trum', null],
      ['cua', 1, 'thuong', 'poison'], ['caCon', 1, 'thuong', 'fire'], ['oc', 1, 'thuong', 'poison'], ['haiQuy', 1, 'thuong', 'ice'],
      ['caChuon', 1, 'thuong', 'ice'], ['caNoc', 1, 'thuong', 'poison'], ['sua', 1, 'thuong', 'poison'], ['nhim', 1, 'thuong', 'poison'],
      ['cuaTuong', 1, 'tinhanh', 'poison'], ['caNocChua', 1, 'tinhanh', 'poison'], ['cuaDa', 1, 'trumnho', 'poison'], ['nguTinh', 1, 'trum', null],
      ['linhMa', 2, 'thuong', 'ice'], ['doiThan', 2, 'thuong', 'fire'], ['tuongDa', 2, 'thuong', 'poison'], ['denLong', 2, 'thuong', 'ice'],
      ['meoDen', 2, 'thuong', 'ice'], ['huLua', 2, 'thuong', 'ice'], ['tieuYeu', 2, 'thuong', 'ice'], ['nhimThan', 2, 'thuong', 'ice'],
      ['tuongMa', 2, 'tinhanh', 'ice'], ['huChua', 2, 'tinhanh', 'ice'], ['hoLua', 2, 'trumnho', 'ice'], ['hoTinh', 2, 'trum', null],
    ],
    vang: { thuong: [20, 40, 60], tinhanh: [50, 80, 120], trumnho: [80, 120, 180], trum: [150, 250, 400] },
    lk: { thuong: 3, tinhanh: 6, trumnho: 10, trum: 20 },
    da: { thuong: 0, tinhanh: 1, trumnho: 2, trum: 3 },
    can: { thuong: 30, tinhanh: 10, trumnho: 5, trum: 3 },
    vungDa: [5, 8, 12],
  };
  // Cùng bảng dạng danh sách đối tượng (js/thanh_tuu.js của Phiên C đọc G.SO_YQ.ds[i].ma để đếm trang sổ "Chép sổ" / "Sổ đủ trang")
  G.SO_YQ.ds = G.SO_YQ.trang.map((t) => ({ ma: t[0], vung: t[1], loai: t[2], he: t[3] }));
})();

// ===================== BƯỚC 2 — PHIÊN E: CHỈNH SỐ THƯỞNG BA HỆ (cân bằng, docs/ke-hoach/buoc-2/bao-cao-phien-E.md) =====================
// Bot Node (tests/cay.py --node --ngay=8 --viec, 24 lượt chiến dịch) với số gốc của Phiên A / B / C: số lần chơi qua 15 ải −12%,
// vàng còn lúc qua 3-5 +29%, đá nâng bậc +30%/ngày → vượt LUAT-CAN-BANG.md. Khối này ĐÈ số (bảng gốc ở các khối trên giữ nguyên để so):
//   Việc hôm nay: vàng mỗi việc còn ~1/2 (mức 3 còn ~40%), quặng ~1/2, rương ngày bớt đá (2/3/4 → 1/1/2; linh khí giữ).
//   Sổ yêu quái: vàng ★ còn 1/2; đá ★★★ trùm nhỏ 2 → 1, trùm vùng 3 → 2; đá thưởng vùng 5/8/12 → 3/5/8.
//   Thành tựu: vàng còn 1/2, đá còn 1/2 (làm tròn lên). Linh khí, bùa, quặng, danh hiệu giữ nguyên.
// Cờ quay lui: ?thuongb2=goc (G.THUONG_B2_GOC = true trước khi nạp data.js) → dùng số gốc của Phiên A / B / C.
(function () {
  const G = window.G;
  let goc = G.THUONG_B2_GOC === true;
  try { if (typeof location !== 'undefined' && /[?&]thuongb2=goc(&|$)/.test(location.search || '')) goc = true; } catch (e) { /* giữ mặc định */ }
  G.THUONG_B2_GOC = goc;
  if (goc) return;
  const V = G.VIEC_NGAY, Y = G.SO_YQ, T = G.THANH_TUU;
  if (V) {
    V.thuong = [
      [{ v: 30, q: 1 }, { v: 50, q: 2 }, { v: 80, q: 2 }], // việc Dễ   (gốc 60/2 · 120/3 · 200/4)
      [{ v: 45, q: 2 }, { v: 75, q: 2 }, { v: 120, q: 3 }], // việc Vừa (gốc 90/3 · 180/4 · 300/6)
      [{ v: 60, q: 2 }, { v: 100, q: 3 }, { v: 160, q: 4 }], // việc Khó (gốc 120/4 · 240/6 · 400/8)
    ];
    V.ruongNgay = [{ da: 1, lk: 8 }, { da: 1, lk: 12 }, { da: 2, lk: 16 }]; // gốc đá 2 / 3 / 4
  }
  if (Y) {
    Y.vang = { thuong: [10, 20, 30], tinhanh: [25, 40, 60], trumnho: [40, 60, 90], trum: [75, 125, 200] }; // gốc ×2
    Y.da = { thuong: 0, tinhanh: 1, trumnho: 1, trum: 2 }; // gốc 0 / 1 / 2 / 3
    Y.vungDa = [3, 5, 8]; // gốc 5 / 8 / 12
  }
  if (T) for (const a of T.DS) { if (a.th.vang) a.th.vang = Math.round(a.th.vang / 2); if (a.th.da) a.th.da = Math.ceil(a.th.da / 2); }
})();
