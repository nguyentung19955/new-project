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
    sword: { name: 'Kiếm', dmg: 10, cd: 0.36, reach: 32, depth: 17, special: 'Chém lướt' },
    bow: { name: 'Cung', dmg: 9, cd: 0.5, ranged: true, special: 'Mưa tên' },
    spear: { name: 'Giáo', dmg: 11, cd: 0.44, reach: 50, depth: 12, special: 'Lao tới' },
    hammer: { name: 'Búa', dmg: 23, cd: 0.8, reach: 32, depth: 25, stagger: 0.4, special: 'Nện đất' },
  };
  G.WKEYS = ['sword', 'bow', 'spear', 'hammer'];
  G.TIERS = [
    { name: 'Sắt', mult: 1, maxStage: 2, col: '#b9c0c9' },
    { name: 'Bạc', mult: 1.2, maxStage: 3, col: '#e8eef5' },
    { name: 'Linh', mult: 1.4, maxStage: 3, col: '#ffe9a3' },
  ];
  G.MARKS = [30, 120, 300];
  G.STAGE_NAMES = ['Trắng', 'Mầm', 'Thành hình', 'Thức tỉnh'];
  G.PROC = [0, 0.2, 0.5, 1];
  G.AFFIX = {
    mana: 'Mỗi đòn trúng hồi thêm 1 mana',
    crit: '10% cơ hội gây gấp đôi sát thương',
    reach: 'Tầm đánh xa hơn 15%',
  };
  G.NAME_WORDS = {
    fire: ['Than Hồng', 'Xích Diệm', 'Tàn Tro'],
    poison: ['Rêu Xanh', 'Nọc Rừng', 'Gai Độc'],
    ice: ['Sương Giá', 'Hàn Ngọc', 'Tuyết Trắng'],
  };

  G.HEROES = {
    smith: {
      name: 'Thợ Rèn', hp: 100, mana: 100, speed: 1, fav: ['sword', 'hammer'],
      passive: 'Vũ khí nhận dấu ấn nhanh hơn 20%',
      skill: 'Nung', skillDesc: 'Phủ Lửa lên vũ khí trong 6 giây',
      unlock: 'Có sẵn',
    },
    hunter: {
      name: 'Thợ Săn', hp: 75, mana: 90, speed: 1.15, fav: ['bow', 'spear'],
      passive: 'Gây thêm 25% sát thương lên mục tiêu bị choáng, đóng băng, mắc bẫy hoặc lộ điểm yếu',
      skill: 'Đặt bẫy', skillDesc: 'Bẫy giữ chân quái 2 giây và gây hiệu ứng theo hệ vũ khí',
      unlock: 'Hạ Mộc Tinh',
    },
    healer: {
      name: 'Thầy Lang', hp: 85, mana: 130, speed: 1, fav: ['spear', 'bow'],
      passive: 'Hiệu ứng bạn gây ra kéo dài hơn 30%',
      skill: 'Bình thuốc', skillDesc: 'Tạo vũng Độc 5 giây, đứng trong vũng thì hồi máu',
      unlock: 'Hạ Ngư Tinh',
    },
    wrestler: {
      name: 'Đô Vật', hp: 140, mana: 80, speed: 0.9, fav: ['hammer', 'spear'],
      passive: 'Giảm 25% sát thương nhận vào, phản lại 50% sát thương cận chiến',
      skill: 'Gồng', skillDesc: '3 giây giảm 60% sát thương, đẩy lùi quái xung quanh',
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
  G.MAX_LEVEL = 30;
  G.xpNeed = (lvl) => 40 + 25 * lvl;

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
    swarm: { name: 'Bầy nhỏ', hp: 0.34, dmg: 0.6, speed: 60, r: 5, marks: 0.34 },
    shield: { name: 'Khiên', hp: 1.7, dmg: 1.1, speed: 26, r: 10, armor: 0.45, marks: 1 },
    archer: { name: 'Xạ thủ', hp: 0.7, dmg: 0.9, speed: 38, r: 7, marks: 1 },
    nimble: { name: 'Nhanh nhẹn', hp: 0.7, dmg: 0.85, speed: 78, r: 7, marks: 1 },
    elite: { name: 'Tinh anh', hp: 5, dmg: 1.3, speed: 40, r: 12, marks: 5 },
  };

  // Chỉ số chuẩn theo ải. r: vùng 0..2, i: ải 0..4, diff: 0 thường, 1 độ khó thứ hai.
  const HP_RANGE = [[60, 115], [130, 230], [250, 370]];
  const DMG_RANGE = [[8, 12], [12, 17], [18, 24]];
  G.stageStats = function (r, i, diff) {
    const t = i / 4;
    const k = diff ? 2.2 : 1;
    const kd = diff ? 1.5 : 1;
    const n = r * 5 + i;
    return {
      hp: (HP_RANGE[r][0] + (HP_RANGE[r][1] - HP_RANGE[r][0]) * t) * k,
      dmg: (DMG_RANGE[r][0] + (DMG_RANGE[r][1] - DMG_RANGE[r][0]) * t) * kd,
      xp: Math.round((100 + 60 * n) * (diff ? 1.5 : 1)),
      gold: Math.round((80 + 30 * n) * (diff ? 1.5 : 1)),
    };
  };
  // Phòng vuông: số đợt quái và hệ số điểm mỗi đợt (so với phòng dài trước đây).
  // start: phòng Bắt đầu [ải 1-2, ải 3-5]; early: ải 1-3; late: ải 4-5; maxPerWave: số quái tối đa một đợt.
  G.ROOM_WAVES = { start: [1, 2], early: 3, late: 4, challenge: 2, pts: 0.75, ptsLate: 0.85, maxPerWave: 7, challengeTime: 30 };
  // Độ dẹt của vùng nguy hiểm và vũng hệ: cao bằng bấy nhiêu lần rộng. Trước là 0,6 (nhìn ngang), nay tròn hơn cho sàn nhìn từ trên.
  G.ZK = 0.85;
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

  // Chi phí mài từ cấp n lên n+1
  G.sharpenCost = function (n) {
    return { ore: 2 + n * 2, gold: 50 * (n + 1), mat: n >= 5 ? 3 : 0 };
  };
  G.FORGE_CAP = [0, 3, 6, 10];
  G.FORGE_UP = [null, { gold: 200, mat: [6, 0, 0] }, { gold: 600, mat: [0, 6, 0] }];
  // Nâng bậc vũ khí (giữ nguyên dấu ấn): chi phí để lên bậc 1 (Bạc) và bậc 2 (Linh)
  G.TIER_UP = [null, { gold: 200, shard: [1, 0, 0] }, { gold: 500, shard: [0, 1, 0], stones: 1 }];

  G.HINTS = [
    'Kết liễu quái đang dính hiệu ứng thì vũ khí nhận dấu ấn của hệ đó.',
    'Đủ 30 dấu ấn của một hệ, vũ khí khóa theo nhánh hệ đó và bắt đầu tiến hóa.',
    'Trùm học theo bạn: dùng một hệ quá nhiều thì nó kháng hệ đó, nhưng yếu với hệ khắc chế.',
    'Kháng Lửa thì yếu Băng. Kháng Băng thì yếu Độc. Kháng Độc thì yếu Lửa.',
    'Lửa hợp với bầy quái, Độc hợp với quái trâu và trùm, Băng hợp với quái nhanh.',
    'Lửa gặp Độc gây Nổ khói. Lửa gặp Băng gây Sốc nhiệt.',
    'Hạ trùm bằng hệ khắc chế nó để nhận sao thứ ba.',
  ];
})();
