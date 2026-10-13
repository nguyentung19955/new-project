// Dữ liệu game: hệ, vũ khí, hero, quái, vùng, trang bị. Mọi con số cân bằng nằm ở đây.
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
    bow: { name: 'Cung', dmg: 11.4, cd: 0.5, ranged: true, special: 'Mưa Tên' },
    spear: { name: 'Giáo', dmg: 10.7, cd: 0.44, reach: 56, depth: 12, special: 'Phi Thương' },
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
  // Đợt 2 (YEU-CAU-2-DON-CU.md): bỏ cờ quay lui ?hethongcu=1 — luật cũ không còn. G.HE_MOI luôn true (giữ tên cho mã/công cụ còn đọc).
  G.HE_MOI = true;
  G.VK_MOI = {
    loai: ['sword', 'spear', 'hammer', 'bow'], // 4 vũ khí (thứ tự hiện trong bảng)
    // Thứ tự xoay vòng của bản lưu mới: kiếm rồi phi tiêu như hai món đầu game cũ (ải hướng dẫn dạy đổi sang phi tiêu).
    // Người chơi đổi được vũ khí cầm đầu ("Cầm đầu" ở Ông Thợ Rèn / Hành trang); bản lưu cũ: món đang mang lên trước.
    thuMacDinh: ['sword', 'bow', 'spear', 'hammer'],
    family: { sword: 0, spear: 0, hammer: 0, bow: 0 }, // dòng cố định (đợt 2: mỗi loại một dòng; hình chính dùng bộ zed-vk)
    // Linh khí để lên Mầm, Thành hình, Thức tỉnh. Cộng dồn 60 / 400 / 900 = đúng mốc dấu ấn cũ G.MARKS của MỘT vũ khí.
    gia: [60, 340, 500],
    // Đổi hệ khi đang ở Mầm / Thành hình / Thức tỉnh (giữ nguyên cấp).
    doiHe: [0, 20, 60, 120],
  };
  // Bỏ bậc màu: mọi vũ khí là bậc 0 (hệ số 1, không dòng phụ) nhưng lên được tới Thức tỉnh. Bù phần hệ số bậc cũ (Lam x1,15 … Vàng x1,5)
  // bằng hệ số cấp cao hơn (cũ +8/+18/+30%).
  G.SWAP_CD = 0.75; // chờ giữa hai lần đổi vũ khí: 4 món xoay vòng nên ngắn hơn (luật cũ 1,5)
  G.RARITY[0].maxStage = 3;
  G.STAGE_MULT = [1, 1.15, 1.35, 1.6];
  // Nâng cấp bộ trang phục Zed: 3 cấp, mỗi cấp tốn linh khí + vàng (giống nhau cho cả 4 bộ).
  G.BO_MOI = {
    max: 3,
    gia: [{ lk: 80, vang: 300 }, { lk: 200, vang: 800 }, { lk: 400, vang: 1800 }],
  };
  // ===== HỆ THỐNG MỚI ĐỢT 3: SKILL RIÊNG CỦA 4 BỘ TRANG PHỤC (docs/review/ke-hoach-cai-thien/he-thong-moi/YEU-CAU-3-SKILL-BO.md) =====
  // BẢNG HẰNG SỐ DUY NHẤT để chỉnh cân bằng skill bộ. Mỗi bộ 3 skill theo thứ tự cấp 1, 2, 3; cấp sau giữ skill cấp trước.
  // Skill chỉ có tác dụng khi ĐANG MẶC bộ đó (G.zedBo()). Luật trong trận + hiệu ứng: js/bo_skill.js (G.boSk); mô tả trong bảng nâng bộ
  // tự ghép từ các số dưới đây (đổi số là mô tả đổi theo). Thời gian tính bằng giây, tỉ lệ 0,3 = 30%, khoảng cách bằng điểm ảnh game.
  // Cờ tắt toàn bộ skill bộ: thêm ?skillbo=0 vào địa chỉ trang (G.SKILL_BO_BAT = false; nâng bộ vẫn được, chỉ không có tác dụng).
  G.SKILL_BO = {
    ninja: [
      { ma: 'bongLuot', ten: 'Bóng lướt', cuaSo: 1, them: 0.3 },          // lộn xong, đòn đầu tiên trong cuaSo giây +them sát thương
      { ma: 'phanThan', ten: 'Phân thân', giay: 1.5 },                    // lộn để lại bóng đứng tại chỗ giay giây, quái thường nhắm vào bóng
      { ma: 'amSat', ten: 'Ám sát', hoi: 4 },                             // đánh trúng từ sau lưng quái: chắc chắn chí mạng (x2), hồi hoi giây
    ],
    rung: [
      { ma: 'nhuaRung', ten: 'Nhựa rừng', dung: 1, hoi: 0.01 },           // đứng yên >= dung giây: hồi hoi x máu tối đa mỗi giây
      { ma: 'gaiDoc', ten: 'Gai độc', chong: 1, satThuong: 0.5 },         // quái đánh trúng Zed: chong lớp độc, độc tính theo satThuong x đòn vũ khí đang cầm
      { ma: 'bayDayLeo', ten: 'Bẫy dây leo', giay: 1.5, trum: 0.4 },      // đòn giữ rồi thả trói chân quái trúng đòn giay giây (trùm: giay x trum)
    ],
    bien: [
      { ma: 'khienNuoc', ten: 'Khiên nước', hoi: 10 },                    // có 1 lớp khiên chặn trọn 1 đòn; vỡ thì sau hoi giây có lại (vào ải có sẵn)
      { ma: 'songDoi', ten: 'Sóng dội', banKinh: 40, day: 24 },           // lộn đẩy lùi quái trong banKinh ra thêm day điểm ảnh (trùm không bị đẩy)
      { ma: 'thuyTrieu', ten: 'Thuỷ triều', giay: 2, banKinh: 60, cham: 0.5 }, // khiên vỡ: quái trong banKinh chậm còn cham x tốc độ trong giay giây
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
  // Dòng phụ: bậc Lam có 1, Tím và Vàng có 2.
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
      passive: 'Vũ khí nhận dấu ấn nhanh hơn 20%',
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
  // Đợt 2 (YEU-CAU-2-DON-CU.md): bỏ cờ ?zed=0 — Zed là nhân vật duy nhất. G.ZED luôn true (giữ tên cho mã/công cụ còn đọc).
  G.ZED = true;
  // Nét mỗi bạn dạy Zed. Số đã hạ so với khi bạn đó còn chơi được, vì Zed gom đủ cả ba (bản gốc ghi trong ngoặc).
  G.ZED_DAY = {
    hunter: {
      boss: 'Mộc Tinh', fav: 'bow',
      cc: 1.15,                      // +15% sát thương lên quái bị choáng, đóng băng, giữ chân, lộ điểm yếu (gốc +25%)
      chRange: 1.2, chSpeed: 1.2,    // chưởng bay xa hơn 20%, nhanh hơn 20% (gốc 30% / 25%)
      noiTai: '+15% sát thương lên quái bị choáng, đóng băng, giữ chân hoặc lộ điểm yếu',
      chuong: 'chưởng bay xa hơn 20%, nhanh hơn 20%',
      ngan: ['Đánh quái bị khống chế +15%', 'Chưởng xa, nhanh hơn 20%; cung +10%'], // dòng ngắn ở bảng kết quả
    },
    healer: {
      boss: 'Ngư Tinh', fav: 'spear',
      statusDur: 1.2,                // hiệu ứng Zed gây ra kéo dài hơn 20% (gốc 30%)
      chHeal: 0.01, chHealMax: 3,    // chưởng trúng quái hồi 1% máu, tối đa 3 lần mỗi phát (gốc 1,5%)
      noiTai: 'hiệu ứng gây ra kéo dài hơn 20%',
      chuong: 'chưởng trúng quái thì hồi 1% máu (tối đa 3 lần mỗi phát)',
      ngan: ['Hiệu ứng gây ra lâu hơn 20%', 'Chưởng trúng hồi 1% máu; giáo +10%'],
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
  G.ZED_MOI = true;
  G.WTYPES.bow.name = 'Phi tiêu'; G.WTYPES.bow.special = 'Mưa Phi Tiêu';
  // ZED CẦM VŨ KHÍ LÚC ĐỨNG / ĐI / CHẠY (13/10/2026, docs/review/ke-hoach-cai-thien/zed-cam-vk): js/zed_moi.js vẽ vũ khí trong tay phải ở
  // hàng đứng/đi/chạy (hàng dung_<loại>, di_<loại>, chay_<loại> của tấm thân); lộn/trúng đòn/chết ẩn vũ khí. Tắt: ?camvk=0 (tay không như trước).
  G.CAM_VK = true;
  try { if (typeof location !== 'undefined' && /[?&]camvk=0(&|$)/.test(location.search || '')) G.CAM_VK = false; } catch (e) { /* giữ mặc định */ }
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
  // (các bộ đã mở). Bộ Rừng mở khi hạ trùm vùng Rừng già (js/stage.js; bản lưu cũ đã có sao ải trùm Rừng thì tự mở, js/engine.js fixSave).
  // Mở rồi mặc được ở mọi vùng. Cờ thử: ?zedbo=rung / ?zedbo=bien / ?zedbo=lau (mặc ngay bộ đó, không cần mở khoá, không ghi vào bản lưu).
  // Bộ 3 'bien' (docs/review/ke-hoach-cai-thien/zed-bo-bien) mở khi hạ trùm Hang biển — cùng đường mở khoá/mở bù/báo như bộ Rừng.
  G.ZED_BO = {
    ninja: { ten: 'Ninja Bóng Đêm', tam: 'zed-moi' },
    rung: { ten: 'Thợ Săn Rừng', tam: 'zed-rung', vung: 'Rừng già' },
    // bộ 3 "Biển" (13/10/2026, docs/review/ke-hoach-cai-thien/zed-bo-bien): mở khi hạ trùm vùng Hang biển (vùng thứ 2), như bộ Rừng
    bien: { ten: 'Chiến Binh Biển', tam: 'zed-bien', vung: 'Hang biển' },
    // bộ 4 "Lâu đài cổ" (13/10/2026, docs/review/ke-hoach-cai-thien/zed-bo-lau): mở khi hạ trùm vùng Lâu đài cổ (vùng thứ 3), như bộ Rừng/Biển
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
  G.zedBoMo = function (k, sv) {
    if (k === 'ninja') return true;
    sv = sv || G.save;
    return !!(sv && sv.zed && typeof sv.zed === 'object' && sv.zed.boMo && sv.zed.boMo[k]);
  };
  // bộ đang mặc (cờ thử ?zedbo= đè lên bản lưu)
  G.zedBo = function (sv) {
    if (G.ZED_BO_THU) return G.ZED_BO_THU;
    sv = sv || G.save;
    const b = sv && sv.zed && typeof sv.zed === 'object' ? sv.zed.bo : null;
    return b && G.ZED_BO[b] && G.zedBoMo(b, sv) ? b : 'ninja';
  };
  G.HEROES.smith.name = 'Zed';
  G.HEROES.smith.skillDesc = 'Nét riêng: chưởng đẩy lùi quái mạnh';
  // Nhân vật chơi được: chỉ còn Zed
  G.HKEYS_CHOI = ['smith'];

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
  G.LVL_HP = 0.035;

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
    mob: [[1.12, 1.29], [1.2, 1.5], [1.24, 1.57], [1.23, 1.655], [1.27, 1.76], [1.45, 2.03], [1.58, 2.14], [1.63, 2.27], [1.44, 2.43], [1.4, 2.61], [1.46, 2.78], [1.55, 2.9], [1.67, 3.04], [1.62, 2.98], [1.29, 3.0]],
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
    boss: [[1.12, 1.29], [1.2, 1.5], [1.24, 1.76], [1.23, 1.67], [1.27, 1.86], [1.32, 2.54], [1.44, 2.54], [1.48, 2.61], [1.31, 2.62], [1.155, 2.53], [1.44, 3.0], [1.31, 2.87], [1.17, 2.74], [1.18, 2.81], [1.29, 2.71]],
  };
  // Độ khó thứ hai: [máu, sát thương] nhân thêm theo vùng. Trước là x2,2 máu, x1,5 sát thương cho mọi vùng; nay quái thường đã mạnh
  // theo ải, nên vùng sau nhân ít hơn để người chơi đã cày đầy (cấp 30, vũ khí Vàng) vẫn với tới được.
  G.DIFF2 = [[1.6, 1.5], [1.3, 1.3], [1.1, 1.15]];
  G.stageStats = function (r, i, diff) {
    const t = i / 4;
    const k = diff ? G.DIFF2[r][0] : 1;
    const kd = diff ? G.DIFF2[r][1] : 1;
    const n = r * 5 + i;
    const mk = G.STAGE_K.mob[n] || [1, 1], bk = G.STAGE_K.boss[n] || [1, 1];
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
  G.STAGE_REC = [95, 110, 135, 160, 215, 255, 280, 330, 360, 405, 440, 480, 520, 540, 560];
  G.stageRec = function (r, i, diff) {
    const v = G.STAGE_REC[r * 5 + i] || 100;
    return diff ? Math.round((v * Math.sqrt(G.DIFF2[r][0] * G.DIFF2[r][1])) / 5) * 5 : v;
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
  // Lăn né: tốc độ ngang (điểm ảnh mỗi giây) và tỉ lệ chiều dọc so với chiều ngang (bằng tỉ lệ lúc đi bộ).
  G.DODGE = { vx: 195, ky: 0.75 };
  G.MINI_HP = 12; // máu trùm nhỏ = hệ số x máu quái thường
  G.BOSS_HP = 24; // máu boss vùng = hệ số x máu quái thường
  // Hồ Tinh né nhiều nên ít lúc đánh trúng, cho ít máu hơn để trận không kéo quá 3 phút.
  G.BOSS_HP_OF = { moc: 20, ngu: 20, ho: 14 };

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
    if (c.mat) cost.mat[n < 9 ? 1 : 2] = c.mat;
    return cost;
  };
  // Đợt 2: bỏ G.TIER_UP, G.goldCost (nâng bậc Lam / Tím / Vàng ở Ông Thợ Rèn của luật cũ).
  // ĐỔI VÀNG LẤY NGUYÊN LIỆU VÙNG ĐÃ QUA (mục 3): Bà Hàng Xén (thẻ Nguyên liệu) và Thương nhân trong ải bán nguyên liệu của vùng
  // đã hạ trùm, giá gia vàng một món. Giới hạn: kho hàng có tối đa max lượt; mỗi ải thắng (cả chơi lại) thêm them lượt.
  // Không theo ngày giờ máy (không lách được bằng chỉnh đồng hồ, không cần mạng). Bản lưu cũ chưa có thì nhận sẵn batDau lượt.
  G.DOI_NL = { gia: 150, max: 10, them: 2, batDau: 5 };

  G.HINTS = [
    'Kết liễu quái đang dính hiệu ứng thì vũ khí nhận dấu ấn của hệ đó.',
    'Đủ 60 dấu ấn của một hệ, vũ khí khóa theo nhánh hệ đó và bắt đầu tiến hóa.',
    'Trùm học theo bạn (từ ải thứ hai): dùng một hệ quá nhiều thì nó kháng hệ đó, nhưng yếu với hệ khắc chế (đánh bằng hệ khắc chế mạnh hơn 50%).',
    'Kháng Lửa thì yếu Băng. Kháng Băng thì yếu Độc. Kháng Độc thì yếu Lửa.',
    // GĐ2 (V16, Q8): câu cũ "Lửa hợp với bầy quái" sai số đo (đánh đám Độc vẫn mạnh hơn Lửa). Chỉ sửa câu, chưa đổi số Lửa.
    'Lửa đốt cháy; từ Thức tỉnh, quái đang cháy mà chết thì nổ lan sang con đứng gần. Độc cộng dồn tầng, mạnh với quái trâu, trùm và cả bầy đông. Băng làm chậm, đủ tầng thì đóng băng, hợp với quái nhanh.',
    // GĐ2 (V48): ghi rõ phản ứng chỉ có giữa hai vũ khí khác hệ, và tương tác ẩn Độc - Băng.
    'Lửa gặp Độc gây Nổ khói. Lửa gặp Băng gây Sốc nhiệt. Độc gặp Băng không phản ứng, nhưng Băng làm Độc tan chậm một nửa. Phản ứng chỉ có giữa hai vũ khí khác hệ (đổi vũ khí khi quái còn dính hệ cũ); chưởng không gây phản ứng với vũ khí.',
    'Hạ trùm bằng hệ khắc chế nó để nhận sao thứ ba.',
    'Vũ khí có bốn bậc: Thường, Lam, Tím, Vàng. Trùm vùng lần đầu bị hạ chắc chắn rơi một vũ khí Vàng.',
    'Thành hình mở đặc trưng hệ thứ nhất, Thức tỉnh mở đặc trưng thứ hai. Bậc Thường chỉ lên tới Thành hình.',
    'Mỗi ải có Sức mạnh khuyên dùng. Số đỏ là bé còn yếu: chơi lại ải cũ để lên cấp, kiếm quặng và nguyên liệu, rồi mài và nâng bậc vũ khí.',
    'Thiếu nguyên liệu của vùng đã qua? Bà Hàng Xén (thẻ Nguyên liệu) và Thương nhân trong ải đổi vàng lấy nguyên liệu.',
    'Vũ khí đã Thức tỉnh: dấu ấn thừa của hệ chính tự đổi ra nguyên liệu vùng (Độc ra Gỗ linh, Băng ra Vảy cá, Lửa ra Đá lửa).',
  ];
})();
