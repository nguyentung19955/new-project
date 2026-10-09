// Dữ liệu game: hệ, vũ khí, hero, quái, vùng, trang bị. Mọi con số cân bằng nằm ở đây.
(function () {
  const G = (window.G = window.G || {});
  G.W = 480;
  G.H = 270;
  G.GY0 = 142; // mép trên của dải mặt đất
  G.GY1 = 236; // mép dưới của dải mặt đất

  G.EL = {
    fire: { name: 'Lửa', col: '#ff7a2a', col2: '#ffd23f', dark: '#a8320a' },
    poison: { name: 'Độc', col: '#6fcf3a', col2: '#c2f58a', dark: '#2f6b1a' },
    ice: { name: 'Băng', col: '#7fd4ff', col2: '#e9f9ff', dark: '#2b6ea3' },
  };
  G.ELS = ['fire', 'poison', 'ice'];
  // Trùm kháng hệ X thì yếu với WEAK[X]
  G.WEAK = { fire: 'ice', ice: 'poison', poison: 'fire' };

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
  G.FAMILIES = 10; // mỗi loại vũ khí có 10 dòng (hình và tên do js/weapon_art.js giữ)
  G.MARKS = [30, 120, 300];
  G.STAGE_NAMES = ['Trắng', 'Mầm', 'Thành hình', 'Thức tỉnh'];
  // Mỗi mốc tiến hóa tăng nhẹ sát thương gốc.
  G.STAGE_MULT = [1, 1.04, 1.08, 1.12];
  G.PROC = [0, 0.2, 0.5, 1];
  // NGUỒN LINH KHÍ (góp ý của chủ dự án: kiếm linh khí bằng cách hạ tinh anh và trùm, quái thường thỉnh thoảng rơi linh khí để nhặt).
  //  - Hạ tinh anh, trùm nhỏ, trùm vùng: vũ khí kết liễu luôn nhận bấy nhiêu dấu ấn. Hệ: hệ quái đang dính lúc gục (cách dùng của bé),
  //    không dính gì thì hệ của vùng (Rừng già Độc, Hang biển Băng, Lâu đài cổ Lửa).
  //  - Quái thường: tỉ lệ drop rơi một viên linh khí của vùng nằm trên sàn, nhặt (đi lại gần) thì vũ khí đang cầm nhận orb dấu ấn.
  //  - Vẫn giữ luật cũ: kết liễu quái thường đang dính hiệu ứng hệ thì vũ khí nhận 1 dấu ấn của hệ đó.
  G.LINHKHI = { elite: 5, mini: 10, boss: 20, drop: 0, orb: 3 }; // drop 0: chủ dự án bỏ viên rơi từ quái thường (tinh anh, trùm đã đủ)
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
  // VŨ KHÍ RƠI. Rương và tinh anh: bậc ngẫu nhiên theo vùng [Thường, Lam, Tím], không bao giờ ra Vàng.
  // Trùm vùng (ải 5, 10, 15): lần đầu hạ chắc chắn rơi 1 vũ khí Vàng; đánh lại thì 12% Vàng, còn lại Tím.
  G.DROP = {
    // hàng thứ tư chỉ dùng khi chơi lại một ải Lâu đài cổ đã qua (chơi lại thì bảng rơi lên một hàng: G.DROP.againBonus)
    table: [[0.72, 0.24, 0.04], [0.52, 0.38, 0.10], [0.36, 0.44, 0.20], [0.24, 0.46, 0.30]],
    againBonus: 1,
    elite: 0.35,      // cơ hội tinh anh rơi vũ khí
    stage: 0.5,       // cơ hội nhận vũ khí khi qua một ải thường (trùm nhỏ)
    bossAgain: 0.12,  // cơ hội ra Vàng khi đánh lại trùm vùng
  };
  // Chữ nối vào tên theo nhánh và mốc (khớp với js/weapon_art.js).
  G.NAME_WORDS = {
    fire: ['Than Hồng', 'Xích Diệm', 'Hỏa Thần'],
    poison: ['Rêu Xanh', 'Nọc Rừng', 'Độc Vương'],
    ice: ['Sương Giá', 'Hàn Ngọc', 'Băng Đế'],
  };

  G.HEROES = {
    smith: {
      name: 'Thợ Rèn', hp: 100, mana: 100, speed: 1, fav: ['sword', 'hammer'],
      passive: 'Vũ khí nhận dấu ấn nhanh hơn 20%',
      skill: 'Chưởng', skillDesc: 'Nét riêng: chưởng đẩy lùi quái mạnh (lực tay thợ rèn)', // trước là Nung (js/chuong.js)
      unlock: 'Có sẵn',
    },
    hunter: {
      name: 'Thợ Săn', hp: 75, mana: 90, speed: 1.15, fav: ['bow', 'spear'],
      passive: 'Gây thêm 25% sát thương lên mục tiêu bị choáng, đóng băng, giữ chân hoặc lộ điểm yếu',
      skill: 'Chưởng', skillDesc: 'Nét riêng: chưởng bay xa hơn 30% và nhanh hơn 25%', // trước là Đặt bẫy
      unlock: 'Hạ Mộc Tinh',
    },
    healer: {
      name: 'Thầy Lang', hp: 85, mana: 130, speed: 1, fav: ['spear', 'bow'],
      passive: 'Hiệu ứng bạn gây ra kéo dài hơn 30%',
      skill: 'Chưởng', skillDesc: 'Nét riêng: chưởng trúng quái thì hồi 1,5% máu (tối đa 3 lần mỗi phát)', // trước là Bình thuốc
      unlock: 'Hạ Ngư Tinh',
    },
    wrestler: {
      name: 'Đô Vật', hp: 140, mana: 80, speed: 0.9, fav: ['hammer', 'spear'],
      passive: 'Giảm 25% sát thương nhận vào, phản lại 50% sát thương cận chiến',
      skill: 'Chưởng', skillDesc: 'Nét riêng: chưởng tầm gần (60%) mà to (rộng gấp rưỡi), mạnh hơn 15%', // trước là Gồng
      unlock: 'Hạ Hồ Tinh',
    },
  };
  G.HKEYS = ['smith', 'hunter', 'healer', 'wrestler'];

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
  G.STAGE_K = {
    mob: [[1.12, 1.29], [1.2, 1.5], [1.24, 1.66], [1.23, 1.66], [1.27, 1.81], [1.32, 2.95], [1.44, 2.32], [1.48, 2.49], [1.31, 2.91], [1.27, 3.02], [1.7, 4.54], [1.66, 4.28], [1.67, 4.43], [1.7, 4.74], [1.29, 3.11]],
    boss: [[1.12, 1.29], [1.2, 1.5], [1.24, 1.66], [1.23, 1.66], [1.27, 1.81], [1.32, 2.95], [1.44, 2.32], [1.48, 2.49], [1.31, 2.91], [1.27, 3.02], [1.7, 4.54], [1.66, 4.28], [1.67, 4.43], [1.7, 4.74], [1.29, 3.11]],
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
  G.STAGE_REC = [100, 110, 135, 150, 225, 245, 270, 315, 345, 420, 425, 445, 475, 525, 620];
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

  G.GEAR = {
    // Mũ: giảm thời gian dính một hệ. Áo: máu và giảm sát thương.
    helm: {
      h_r1: { name: 'Nón lá rừng', res: 'poison', pct: 0.25, cost: { mat: [6, 0, 0], gold: 80 } },
      h_r2: { name: 'Mũ da cá', res: 'ice', pct: 0.25, cost: { mat: [0, 6, 0], gold: 200 } },
      h_r3: { name: 'Khăn đá lửa', res: 'fire', pct: 0.25, cost: { mat: [0, 0, 6], gold: 400 } },
      h_moc: { name: 'Mũ sừng gỗ', res: 'poison', pct: 0.4, set: 'moc', cost: { shard: [1, 0, 0], mat: [8, 0, 0], gold: 150 } },
      h_ngu: { name: 'Mũ vây cá', res: 'ice', pct: 0.4, set: 'ngu', cost: { shard: [0, 1, 0], mat: [0, 8, 0], gold: 350 } },
      h_ho: { name: 'Mũ tai cáo', res: 'fire', pct: 0.4, set: 'ho', cost: { shard: [0, 0, 1], mat: [0, 0, 8], gold: 600 } },
    },
    armor: {
      a_r1: { name: 'Áo vải thô', hp: 20, dr: 0, cost: { mat: [8, 0, 0], gold: 100 } },
      a_r2: { name: 'Áo da biển', hp: 50, dr: 0.04, cost: { mat: [0, 8, 0], gold: 250 } },
      a_r3: { name: 'Áo giáp đá', hp: 90, dr: 0.06, cost: { mat: [0, 0, 8], gold: 500 } },
      a_moc: { name: 'Áo vỏ cây', hp: 45, dr: 0.08, set: 'moc', cost: { shard: [2, 0, 0], mat: [10, 0, 0], gold: 200 } },
      a_ngu: { name: 'Áo vảy', hp: 85, dr: 0.1, set: 'ngu', cost: { shard: [0, 2, 0], mat: [0, 10, 0], gold: 450 } },
      a_ho: { name: 'Áo lông trắng', hp: 130, dr: 0.1, set: 'ho', cost: { shard: [0, 0, 2], mat: [0, 0, 10], gold: 800 } },
    },
    charm: {
      c_leech: { name: 'Bùa hút máu', desc: 'Kết liễu quái thì hồi 2% máu' },
      c_ember: { name: 'Bùa tàn lửa', desc: 'Quái đang cháy nhận thêm 15% sát thương' },
      c_mist: { name: 'Bùa sương', desc: 'Lăn né xuyên qua quái cộng cho nó 1 tầng Băng' },
      c_greed: { name: 'Bùa tham', desc: 'Nhận thêm 25% vàng, máu tối đa giảm 10%' },
      c_spirit: { name: 'Bùa linh', desc: 'Kết liễu quái đang dính hiệu ứng hồi thêm 5 mana' },
    },
  };
  G.SETS = {
    moc: 'Bộ Mộc Tinh: đứng yên 2 giây thì bắt đầu hồi máu',
    ngu: 'Bộ Ngư Tinh: lăn né xuyên qua quái cộng cho nó 1 tầng Băng',
    ho: 'Bộ Hồ Tinh: sau khi lăn né, đòn kế tiếp mạnh hơn 60%',
  };

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
  // Chi phí mài đầy đủ (dạng trả được): +5..+9 tốn vảy cá (vùng hai cày được), +10..+14 tốn đá lửa (vùng ba).
  // Trước đây +7 trở lên đã đòi đá lửa nên ở vùng hai người chơi kẹt ở +7, vàng và vảy cá dồn lại không tiêu được.
  G.sharpenFull = function (n) {
    const c = G.sharpenCost(n), cost = { ore: c.ore, gold: c.gold, mat: [0, 0, 0] };
    if (c.mat) cost.mat[n < 10 ? 1 : 2] = c.mat;
    return cost;
  };
  // Nâng bậc vũ khí (giữ nguyên dấu ấn và tiến hóa): chi phí để lên Lam (1) và Tím (2).
  // Nấc cuối lên Vàng cần mảnh trùm, thứ chỉ trùm vùng rơi: xem G.goldCost.
  G.TIER_UP = [null, { gold: 150, ore: 4, mat: [6, 0, 0] }, { gold: 450, stones: 1, mat: [0, 8, 0] }, null];
  // Lên Vàng bằng mảnh của trùm vùng r (0..2); dùng mảnh trùm vùng nào thì nhận sát thương gốc Vàng của vùng đó.
  G.goldCost = function (r) {
    const shard = [0, 0, 0];
    shard[r] = 4;
    return { gold: 800 + 300 * r, stones: 2, shard };
  };

  G.HINTS = [
    'Kết liễu quái đang dính hiệu ứng thì vũ khí nhận dấu ấn của hệ đó.',
    'Đủ 30 dấu ấn của một hệ, vũ khí khóa theo nhánh hệ đó và bắt đầu tiến hóa.',
    'Trùm học theo bạn: dùng một hệ quá nhiều thì nó kháng hệ đó, nhưng yếu với hệ khắc chế.',
    'Kháng Lửa thì yếu Băng. Kháng Băng thì yếu Độc. Kháng Độc thì yếu Lửa.',
    'Lửa hợp với bầy quái, Độc hợp với quái trâu và trùm, Băng hợp với quái nhanh.',
    'Lửa gặp Độc gây Nổ khói. Lửa gặp Băng gây Sốc nhiệt.',
    'Hạ trùm bằng hệ khắc chế nó để nhận sao thứ ba.',
    'Vũ khí có bốn bậc: Thường, Lam, Tím, Vàng. Trùm vùng lần đầu bị hạ chắc chắn rơi một vũ khí Vàng.',
    'Thành hình mở đặc trưng hệ thứ nhất, Thức tỉnh mở đặc trưng thứ hai. Bậc Thường chỉ lên tới Thành hình.',
    'Mỗi ải có Sức mạnh khuyên dùng. Số đỏ là bé còn yếu: chơi lại ải cũ để lên cấp, kiếm quặng và nguyên liệu, rồi mài và nâng bậc vũ khí.',
  ];
})();
