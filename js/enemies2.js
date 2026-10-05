'use strict';

// ============================================================
//  QUÁI & BOSS CÁC TRUYỆN DÂN GIAN MỚI (v48) — dữ liệu + hình tự vẽ (SVG, chân tại (ax, ay), quay mặt sang phải)
//  Dùng lại cơ chế có sẵn: ranged (bắn tướng), heal, split (chết tách con), flying (bay), enrage (hóa điên),
//  slam (đập choáng tướng), summon (gọi lính), reincarnate (hồi sinh 1 lần), phaseSummon (mất 25% máu gọi con),
//  burnAura (đốt tướng đứng gần), stunResist / slowResist.
//  Chương: Thạch Sanh (rừng, hang) · Thánh Gióng (đồng lúa, giặc Ân) · Lạc Long Quân (biển) · An Dương Vương (Cổ Loa, quân Triệu)
// ============================================================

// ---------- dữ liệu quái
const E2 = (o) => ({ armor: 0, mr: 0, drop: 0.04, size: 14, ...o });
Object.assign(ENEMIES, {
  // Thạch Sanh
  yeutinh: E2({ name: 'Yêu Tinh Rừng', hp: 64, speed: 46, gold: 4, color: '#6E9E3E', armor: 2, mr: 10, drop: 0.03,
    short: 'Đi bầy đông', desc: 'Tay sai của Chằn Tinh, kéo đến từng bầy.' }),
  ran: E2({ name: 'Rắn Độc', hp: 48, speed: 78, gold: 5, color: '#7A9A2A', armor: 1, mr: 15, enrage: { below: 0.5, speed: 1.5 },
    short: 'Trườn rất nhanh, dưới 50% máu càng nhanh', desc: 'Trườn nhanh qua đường rừng; bị thương thì lồng lên chạy nhanh hơn. Nên làm chậm.' }),
  doi: E2({ name: 'Dơi Hang', hp: 42, speed: 62, gold: 5, color: '#5E4A70', mr: 20, flying: true,
    short: 'Bay: chỉ tướng đánh xa và tướng phép bắn được', desc: 'Bầy dơi trong hang Chằn Tinh, bay trên đầu tướng cận chiến.' }),
  thachtinh: E2({ name: 'Thạch Tinh', hp: 260, speed: 24, gold: 12, color: '#8A8270', armor: 16, mr: 10, drop: 0.08, size: 18,
    stunResist: 0.4, split: { type: 'dacon', count: 2 }, short: 'Giáp đá dày, vỡ ra 2 Đá Con',
    desc: 'Đá núi thành tinh: giáp rất dày, bị choáng ngắn hơn; vỡ ra 2 Đá Con khi bị hạ. Dùng sát thương phép.' }),
  dacon: E2({ name: 'Đá Con', hp: 50, speed: 40, gold: 2, color: '#9A9280', armor: 6, drop: 0, minion: true, desc: 'Vỡ ra từ Thạch Tinh.' }),
  // Thánh Gióng / An Dương Vương
  linhan: E2({ name: 'Lính Giáo', hp: 80, speed: 40, gold: 5, color: '#8A3A2A', armor: 6, mr: 5, drop: 0.03,
    short: 'Giáp vừa, đi hàng đông', desc: 'Bộ binh cầm giáo, mặc giáp đồng.' }),
  cungan: E2({ name: 'Cung Thủ Giặc', hp: 70, speed: 36, gold: 7, color: '#5A6A3A', armor: 2, mr: 10, drop: 0.05,
    ranged: { range: 150, dmg: 14, cd: 2.2 }, short: 'Bắn tên vào tướng từ xa', desc: 'Đứng xa bắn tên vào tướng. Nên hạ trước.' }),
  kybinh: E2({ name: 'Kỵ Binh', hp: 120, speed: 70, gold: 8, color: '#7A5232', armor: 8, mr: 5, drop: 0.05, size: 16,
    enrage: { below: 0.5, speed: 1.4 }, short: 'Phi ngựa rất nhanh, giáp dày', desc: 'Phi ngựa xông thẳng vào thành; dưới 50% máu thúc ngựa nhanh hơn.' }),
  voichien: E2({ name: 'Voi Chiến', hp: 520, speed: 20, gold: 20, color: '#8A847E', armor: 16, mr: 20, drop: 0.12, size: 24, lives: 3,
    stunResist: 0.6, slowResist: 0.4, slam: { range: 90, dmg: 30, cd: 7, stun: 0.8 },
    short: 'Rất trâu, giẫm làm choáng tướng, lọt thành mất 3 mạng',
    desc: 'Voi mang bành chiến: máu và giáp rất dày, khó làm chậm / choáng, giẫm đất làm choáng tướng gần. Lọt thành mất 3 mạng.' }),
  // Lạc Long Quân
  camap: E2({ name: 'Cá Mập Yêu', hp: 70, speed: 80, gold: 6, color: '#6A8A9A', armor: 3, mr: 10, enrage: { below: 0.5, speed: 1.5 },
    short: 'Bơi rất nhanh, dưới 50% máu hóa điên', desc: 'Lính của Ngư Tinh, lao vun vút trên sóng.' }),
  muc: E2({ name: 'Mực Tinh', hp: 95, speed: 32, gold: 9, color: '#D87A9A', armor: 1, mr: 30, drop: 0.06,
    ranged: { range: 140, dmg: 12, cd: 2.2 }, short: 'Phun mực bắn tướng từ xa', desc: 'Phun mực đen bắn tướng từ xa.' }),
  cua: E2({ name: 'Cua Khổng Lồ', hp: 240, speed: 26, gold: 12, color: '#D8603A', armor: 18, mr: 30, drop: 0.08, size: 18, stunResist: 0.4,
    short: 'Mai cứng: giáp và kháng phép cao', desc: 'Mai cua dày: giảm mạnh cả sát thương vật lý lẫn phép.' }),
  cao: E2({ name: 'Cáo Con', hp: 40, speed: 72, gold: 2, color: '#E8843A', armor: 2, mr: 30, drop: 0, minion: true, desc: 'Do Hồ Tinh hoá ra.' }),
  // --- Boss
  chantinh: E2({ name: 'Chằn Tinh', hp: 1500, speed: 18, gold: 170, size: 32, color: '#6A8A42', drop: 1, boss: true, lives: 5, armor: 14, mr: 20,
    reward: 'voi_chin_nga', slam: { range: 150, dmg: 60, cd: 6, stun: 1.2 }, summon: { cd: 9, count: 3, type: 'yeutinh' }, enrage: { below: 0.4, speed: 1.3 },
    roar: { cd: 11, radius: 200, silence: 3, name: 'Chằn Tinh gầm!' },
    tags: ['Đập búa choáng tướng', 'Gọi Yêu Tinh'], short: 'Đập búa đá choáng tướng gần, gầm làm tướng không dùng được chiêu 3 giây, gọi Yêu Tinh, hóa điên khi dưới 40% máu',
    desc: 'Con quỷ ăn thịt người ở gốc đa, mỗi năm bắt dân nộp một người. Đập búa đá làm choáng tướng, gọi Yêu Tinh. Lọt vào thành: mất 5 mạng.',
    tip: 'Tướng đánh xa đứng ngoài tầm búa 150; Thạch Sanh cầm rìu thần chém Chằn Tinh rất đau.' }),
  daibang: E2({ name: 'Đại Bàng Tinh', hp: 1000, speed: 30, gold: 170, size: 30, color: '#6A4A2A', drop: 1, boss: true, lives: 5, armor: 6, mr: 30, flying: true,
    reward: 'ga_chin_cua', summon: { cd: 7, count: 3, type: 'doi' }, enrage: { below: 0.5, speed: 1.4 },
    swoop: { cd: 8, range: 260, stun: 2.5, dmg: 40, name: 'Đại Bàng cắp người!' },
    tags: ['Bay', 'Gọi Dơi Hang'], short: 'Bay; sà xuống cắp tướng mạnh nhất (choáng 2,5 giây); gọi Dơi Hang',
    desc: 'Chim khổng lồ cắp công chúa Quỳnh Nga về hang. Bay trên trời nên tướng cận chiến không với tới.',
    tip: 'Mang nhiều tướng bắn xa (Xạ Thủ, Cao Lỗ, An Dương Vương) và tướng phép.' }),
  anvuong: E2({ name: 'Tướng Giặc Ân', hp: 1400, speed: 22, gold: 190, size: 30, color: '#2A2A2A', drop: 1, boss: true, lives: 5, armor: 12, mr: 25,
    reward: 'ngua_hong_mao', summon: { cd: 7, count: 3, type: 'linhan' }, burnAura: { radius: 140, dps: 9, kind: 'drum', color: '#E8B83A' },
    speedAura: { radius: 170, pct: 0.3 }, dash: { cd: 10, mult: 2.6, dur: 1.2, name: 'Thúc ngựa xông lên!' },
    tags: ['Trống trận', 'Gọi Lính Giáo'], short: 'Trống trận đốt tướng gần và thúc quân quanh mình chạy nhanh hơn 30%; thúc ngựa lao tới; gọi Lính Giáo',
    desc: 'Tướng giặc Ân cưỡi ngựa đen, thúc trống trận tràn vào đất Văn Lang. Tướng đứng gần mất máu theo nhịp trống.',
    tip: 'Thánh Gióng nhổ tre đánh giặc: đặt Thánh Gióng giữa đường để quét quân.' }),
  ngutinh: E2({ name: 'Ngư Tinh', hp: 1200, speed: 22, gold: 180, size: 30, color: '#3A7A8A', drop: 1, boss: true, lives: 5, armor: 10, mr: 30,
    reward: 'voi_chin_nga', reincarnate: { pct: 0.6, delay: 2.5 }, summon: { cd: 8, count: 2, type: 'camap' },
    split: { type: 'camap', count: 3 }, dash: { cd: 9, mult: 2.4, dur: 1, name: 'Ngư Tinh quẫy sóng!' },
    tags: ['Lặn hồi sinh', 'Gọi Cá Mập'], short: 'Quẫy sóng lao tới; bị hạ lần đầu lặn rồi trồi lên với 60% máu; chết đứt làm 3 khúc (3 Cá Mập)',
    desc: 'Cá thành tinh ở biển Đông, há miệng nuốt thuyền bè. Lạc Long Quân nung khối sắt ném vào họng nó.',
    tip: 'Giữ chiêu mạnh cho lần Ngư Tinh trồi lên.' }),
  hotinh: E2({ name: 'Hồ Tinh Chín Đuôi', hp: 1100, speed: 30, gold: 180, size: 28, color: '#F2F6FA', drop: 1, boss: true, lives: 5, armor: 6, mr: 45,
    reward: 'ga_chin_cua', phaseSummon: { type: 'cao', count: 4 }, burnAura: { radius: 130, dps: 10, kind: 'fire', color: '#C85AFF' }, enrage: { below: 0.3, speed: 1.4 },
    blink: { at: [0.7, 0.4], dist: 160, name: 'Hồ Tinh hoá ảo ảnh!' },
    tags: ['Lửa ma', 'Hoá Cáo Con'], short: 'Lửa ma đốt tướng gần; ở 70% và 40% máu hoá ảo ảnh nhảy xa trên đường; mất 25% máu hoá 4 Cáo Con',
    desc: 'Cáo trắng chín đuôi nghìn năm tuổi ở đầm Xác Cáo (Hồ Tây). Kháng phép cao.',
    tip: 'Dùng sát thương vật lý; tướng cận chiến chặn Cáo Con.' }),
  trieuda: E2({ name: 'Triệu Đà', hp: 1500, speed: 22, gold: 200, size: 30, color: '#2A3A5A', drop: 1, boss: true, lives: 5, armor: 16, mr: 20,
    reward: 'ngua_hong_mao', summon: { cd: 7, count: 2, type: 'kybinh' }, phaseSummon: { type: 'linhan', count: 4 },
    speedAura: { radius: 170, pct: 0.25 }, disarm: { at: 0.5, dur: 6, name: 'Lẫy nỏ thần bị tráo!' },
    tags: ['Gọi Kỵ Binh', 'Giáp dày'], short: 'Giáp dày, thúc quân quanh mình nhanh hơn; còn nửa máu thì tráo vũ khí tướng mạnh nhất (choáng 6 giây); gọi Kỵ Binh và Lính Giáo',
    desc: 'Vua nước Nam Việt đem quân đánh Âu Lạc. Thua mãi vì nỏ thần, bèn cho con là Trọng Thủy sang ở rể dò la.',
    tip: 'Trong thành xoắn ốc Cổ Loa đường quái rất dài: đặt tướng ở các vòng trong để đánh nhiều lần.' }),
});
Object.assign(ENEMY_EL, { yeutinh: 'moc', ran: 'moc', doi: 'thuy', thachtinh: 'tho', dacon: 'tho', linhan: 'kim', cungan: 'moc', kybinh: 'hoa',
  voichien: 'tho', camap: 'thuy', muc: 'thuy', cua: 'kim', cao: 'hoa', chantinh: 'moc', daibang: 'kim', anvuong: 'kim', ngutinh: 'thuy', hotinh: 'hoa', trieuda: 'kim' });
for (const id in ENEMY_EL) if (ENEMIES[id]) ENEMIES[id].el = ENEMY_EL[id];
// độ rộng vẽ (render.js gộp vào ENEMY_W)
const ENEMY_W_EXTRA = { yeutinh: 34, ran: 60, doi: 50, thachtinh: 56, dacon: 24, linhan: 38, cungan: 38, kybinh: 64, voichien: 86,
  camap: 66, muc: 42, cua: 58, cao: 40, chantinh: 130, daibang: 140, anvuong: 110, ngutinh: 160, hotinh: 120, trieuda: 104 };

// ---------- bảng quân theo chương: base = quái thường; list = [đợt từ, ngưỡng xác suất cộng dồn, loại];
// air = quái bay cho đợt bay (null: đợt bay thành đợt thường); champ = quái tinh anh đợt 5/15/25; fast = quái đi nhanh (giãn cách ngắn)
const ROSTERS = {
  thuy:  { base: 'tom', air: 'chimbao', champ: 'rua', fast: ['casau', 'chimbao'],
    list: [[8, 0.1, 'echme'], [3, 0.22, 'phuthuy'], [6, 0.34, 'rua'], [9, 0.42, 'chimbao'], [2, 0.64, 'casau']] },
  rung:  { base: 'yeutinh', air: 'doi', champ: 'thachtinh', fast: ['ran', 'doi'],
    list: [[6, 0.1, 'thachtinh'], [3, 0.3, 'ran'], [8, 0.4, 'doi'], [2, 0.5, 'ran']] },
  hang:  { base: 'yeutinh', air: 'doi', champ: 'thachtinh', fast: ['ran', 'doi'],
    list: [[3, 0.16, 'thachtinh'], [2, 0.36, 'doi'], [2, 0.52, 'ran']] },
  an:    { base: 'linhan', air: null, champ: 'voichien', fast: ['kybinh'],
    list: [[9, 0.06, 'voichien'], [3, 0.28, 'cungan'], [5, 0.45, 'kybinh']] },
  bien:  { base: 'tom', air: 'chimbao', champ: 'cua', fast: ['camap', 'chimbao'],
    list: [[3, 0.18, 'muc'], [6, 0.3, 'cua'], [2, 0.55, 'camap'], [8, 0.62, 'echme']] },
  trieu: { base: 'linhan', air: null, champ: 'voichien', fast: ['kybinh'],
    list: [[8, 0.08, 'voichien'], [3, 0.3, 'cungan'], [4, 0.5, 'kybinh']] },
};

(function () {
const O = '#1A120A';   // viền
const svgOf = (w, h, ax, ay, body) => ({ w, h, ax, ay,
  svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><g transform="translate(${ax} ${ay})">${body}</g></svg>` });
// mắt tròn có đốm sáng
const eye = (x, y, r = 2.4, c = '#FFF') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${O}" stroke-width="0.6"/><circle cx="${x + r * 0.25}" cy="${y}" r="${r * 0.5}" fill="${O}"/>`;
const leg = (x, c, len = 7) => `<path d="M${x} -${len} v${len}" stroke="${O}" stroke-width="4.4" stroke-linecap="round"/><path d="M${x} -${len} v${len}" stroke="${c}" stroke-width="2.8" stroke-linecap="round"/>`;

const ENEMY_ART2 = {
  // --- Thạch Sanh: rừng & hang
  yeutinh: svgOf(34, 40, 16, 38,
    leg(-4, '#4E7A2E') + leg(4, '#4E7A2E')
    + `<ellipse cx="0" cy="-15" rx="9" ry="9" fill="#5E8E34" stroke="${O}"/><path d="M-6 -10 q6 5 12 0" fill="#3E6A22"/>`
    + `<circle cx="1" cy="-29" r="9" fill="#6E9E3E" stroke="${O}"/><path d="M-7 -33 l-6 -7 l8 3 z M7 -34 l7 -6 l-4 8 z" fill="#6E9E3E" stroke="${O}" stroke-width="0.8"/>`
    + eye(-2, -30, 2.2, '#FFE08A') + eye(5, -30, 2.2, '#FFE08A') + `<path d="M-2 -24 q3 2 6 0" stroke="${O}" fill="none"/><path d="M-1 -24 l1 2 l1 -2" fill="#FFF"/>`
    + `<path d="M8 -16 l10 -12" stroke="#6A4A2A" stroke-width="2.4" stroke-linecap="round"/><circle cx="18" cy="-29" r="3" fill="#8A6A3A" stroke="${O}"/>`),
  ran: svgOf(56, 22, 28, 18,
    `<path d="M-26 -2 q8 -10 16 -2 q8 8 16 0 q6 -6 12 -4" fill="none" stroke="${O}" stroke-width="8.5" stroke-linecap="round"/>`
    + `<path d="M-26 -2 q8 -10 16 -2 q8 8 16 0 q6 -6 12 -4" fill="none" stroke="#7A9A2A" stroke-width="6.5" stroke-linecap="round"/>`
    + `<path d="M-22 -4 l3 -2 M-12 -6 l2 2 M-2 -2 l2 -2 M8 -4 l2 2" stroke="#3E5A1A" stroke-width="1.2"/>`
    + `<ellipse cx="22" cy="-8" rx="7" ry="5" fill="#8AAA34" stroke="${O}"/>` + eye(24, -10, 1.6, '#FFD66B')
    + `<path d="M28 -7 l6 1 l-3 1 l3 1 l-6 0" stroke="#E04848" stroke-width="0.9" fill="none"/>`),
  doi: svgOf(48, 28, 24, 14,
    `<path d="M-2 -2 q-10 -14 -22 -8 q4 4 2 8 q6 -2 8 4 q4 -6 12 -4 z" fill="#4A3A5A" stroke="${O}"/>`
    + `<path d="M2 -2 q10 -14 22 -8 q-4 4 -2 8 q-6 -2 -8 4 q-4 -6 -12 -4 z" fill="#4A3A5A" stroke="${O}"/>`
    + `<ellipse cx="0" cy="-1" rx="6" ry="7" fill="#5E4A70" stroke="${O}"/><path d="M-4 -7 l-1 -5 l3 3 M4 -7 l1 -5 l-3 3" fill="#5E4A70" stroke="${O}" stroke-width="0.7"/>`
    + eye(-2, -3, 1.6, '#FF5A3A') + eye(3, -3, 1.6, '#FF5A3A') + `<path d="M-1 2 l1 2 l1 -2" fill="#FFF"/>`),
  thachtinh: svgOf(52, 50, 26, 48,
    `<path d="M-12 0 v-8 M12 0 v-8" stroke="${O}" stroke-width="7" stroke-linecap="round"/><path d="M-12 0 v-8 M12 0 v-8" stroke="#7A7262" stroke-width="5" stroke-linecap="round"/>`
    + `<path d="M-20 -8 L-22 -28 L-12 -42 L6 -46 L20 -36 L22 -14 L14 -6 Z" fill="#8A8270" stroke="${O}" stroke-width="1.2"/>`
    + `<path d="M-12 -42 L-4 -30 L6 -46 M-22 -28 L-8 -22 L4 -30 L20 -36 M-8 -22 L-6 -8 M4 -30 L14 -6" stroke="#5E584A" stroke-width="1" fill="none"/>`
    + `<path d="M-2 -28 l10 -2" stroke="${O}" stroke-width="1"/>` + eye(0, -33, 2.4, '#FF8A3A') + eye(10, -34, 2.4, '#FF8A3A')
    + `<path d="M24 -24 q6 2 6 10 l-6 -2 z M-24 -26 q-6 2 -6 10 l6 -2 z" fill="#8A8270" stroke="${O}"/>`),
  dacon: svgOf(22, 20, 11, 18,
    `<path d="M-9 0 L-10 -10 L-4 -16 L6 -15 L10 -7 L7 0 Z" fill="#9A9280" stroke="${O}"/>` + eye(0, -9, 1.8, '#FF8A3A') + eye(5, -9, 1.6, '#FF8A3A')),

  // --- Thánh Gióng / An Dương Vương: quân giặc
  linhan: svgOf(36, 46, 16, 44,
    leg(-4, '#5A4A3A', 9) + leg(4, '#5A4A3A', 9)
    + `<path d="M-8 -9 L-9 -26 L9 -26 L8 -9 Z" fill="#8A3A2A" stroke="${O}"/><path d="M-8 -20 h17" stroke="#C8A040" stroke-width="2"/>`
    + `<circle cx="0" cy="-32" r="7.5" fill="#E8B88A" stroke="${O}"/><path d="M-8 -34 q8 -12 16 0 l-2 -1 h-12 z" fill="#5A5A62" stroke="${O}"/><path d="M0 -44 v-5" stroke="#C8401E" stroke-width="2.4"/>`
    + eye(2, -32, 1.6) + `<path d="M3 -28 h3" stroke="${O}"/>`
    + `<path d="M10 -4 L16 -44" stroke="#6A4A2A" stroke-width="2"/><path d="M14 -44 l2 -7 l2 7 z" fill="#D0D0D0" stroke="${O}" stroke-width="0.6"/>`
    + `<ellipse cx="-9" cy="-18" rx="5" ry="8" fill="#6A5A3A" stroke="${O}"/>`),
  cungan: svgOf(36, 46, 16, 44,
    leg(-4, '#4A4A3A', 9) + leg(4, '#4A4A3A', 9)
    + `<path d="M-8 -9 L-9 -26 L9 -26 L8 -9 Z" fill="#5A6A3A" stroke="${O}"/><path d="M-8 -20 h17" stroke="#8A7A3A" stroke-width="2"/>`
    + `<circle cx="0" cy="-32" r="7.5" fill="#E8B88A" stroke="${O}"/><path d="M-8 -35 q8 -8 16 0 z" fill="#3A3A2A" stroke="${O}"/>`
    + eye(2, -32, 1.6) + `<path d="M12 -40 q8 12 0 24" fill="none" stroke="#7A5A2A" stroke-width="2"/><path d="M12 -40 v24" stroke="#D8D0B8" stroke-width="0.7"/>`
    + `<path d="M-10 -26 l-4 -12" stroke="#7A5A2A" stroke-width="3"/><path d="M-14 -38 l-1 -4 M-12 -38 l0 -4" stroke="#E8DCC0" stroke-width="1"/>`),
  kybinh: svgOf(60, 52, 28, 50,
    `<path d="M-18 0 v-12 M-10 0 v-12 M12 0 v-12 M20 0 v-12" stroke="${O}" stroke-width="4.5" stroke-linecap="round"/><path d="M-18 0 v-12 M-10 0 v-12 M12 0 v-12 M20 0 v-12" stroke="#6A4A2A" stroke-width="3" stroke-linecap="round"/>`
    + `<ellipse cx="0" cy="-16" rx="22" ry="9" fill="#7A5232" stroke="${O}"/><path d="M18 -20 q8 -6 10 -16 l4 2 q0 10 -8 18 z" fill="#7A5232" stroke="${O}"/><ellipse cx="28" cy="-36" rx="6" ry="4" fill="#7A5232" stroke="${O}"/>`
    + `<path d="M24 -40 l2 -4 l2 4" fill="#5A3A1A"/><path d="M-22 -16 q-8 2 -10 10" stroke="#3A2A16" stroke-width="3" fill="none"/>`
    + `<path d="M-6 -24 L-7 -36 L7 -36 L6 -24 Z" fill="#8A3A2A" stroke="${O}"/><circle cx="0" cy="-41" r="6" fill="#E8B88A" stroke="${O}"/><path d="M-7 -43 q7 -10 14 0 z" fill="#5A5A62" stroke="${O}"/>`
    + eye(2, -41, 1.4) + `<path d="M6 -32 L24 -48" stroke="#6A4A2A" stroke-width="2"/><path d="M22 -50 l5 -3 l-2 6 z" fill="#D0D0D0" stroke="${O}" stroke-width="0.6"/>`),
  voichien: svgOf(78, 62, 36, 60,
    `<path d="M-22 0 v-14 M-10 0 v-14 M10 0 v-14 M22 0 v-14" stroke="${O}" stroke-width="9" stroke-linecap="round"/><path d="M-22 0 v-14 M-10 0 v-14 M10 0 v-14 M22 0 v-14" stroke="#7A7470" stroke-width="7" stroke-linecap="round"/>`
    + `<ellipse cx="0" cy="-24" rx="30" ry="16" fill="#8A847E" stroke="${O}" stroke-width="1.2"/>`
    + `<path d="M24 -32 q14 -4 14 10 q0 14 -6 24" fill="none" stroke="${O}" stroke-width="8" stroke-linecap="round"/><path d="M24 -32 q14 -4 14 10 q0 14 -6 24" fill="none" stroke="#8A847E" stroke-width="6" stroke-linecap="round"/>`
    + `<path d="M30 -18 q8 2 10 8" stroke="#F2E6C8" stroke-width="3" stroke-linecap="round" fill="none"/><ellipse cx="18" cy="-30" rx="7" ry="10" fill="#7A746E" stroke="${O}"/>` + eye(28, -34, 1.8)
    + `<path d="M-16 -40 h28 v10 h-28 z" fill="#8A3A2A" stroke="${O}"/><path d="M-16 -34 h28" stroke="#C8A040" stroke-width="2"/><path d="M-12 -40 v-12 M8 -40 v-12" stroke="#5A3A1A" stroke-width="1.6"/><path d="M-14 -52 h24 l-4 -6 h-16 z" fill="#C8A040" stroke="${O}"/>`),

  // --- Lạc Long Quân: biển
  camap: svgOf(64, 30, 32, 24,
    `<path d="M-30 -8 l-8 -10 l2 18 z" fill="#5A7A8A" stroke="${O}"/><ellipse cx="0" cy="-8" rx="26" ry="10" fill="#6A8A9A" stroke="${O}" stroke-width="1.1"/>`
    + `<path d="M-8 -16 l6 -14 l8 14 z" fill="#5A7A8A" stroke="${O}"/><path d="M-20 -4 q20 8 44 -2" fill="#E8EEF2"/>`
    + `<path d="M14 -4 l2 4 l2 -4 l2 4 l2 -4 l2 4" stroke="${O}" stroke-width="0.8" fill="#FFF"/>` + eye(16, -11, 1.8, '#FFF')
    + `<path d="M4 -2 l-4 8 l8 -4" fill="#5A7A8A" stroke="${O}" stroke-width="0.8"/>`),
  muc: svgOf(40, 46, 20, 44,
    [-10, -6, -2, 2, 6, 10].map((x, i) => `<path d="M${x} -14 q${(i % 2 ? 4 : -4)} 8 ${x > 0 ? 3 : -3} 14" fill="none" stroke="${O}" stroke-width="4" stroke-linecap="round"/><path d="M${x} -14 q${(i % 2 ? 4 : -4)} 8 ${x > 0 ? 3 : -3} 14" fill="none" stroke="#C86A8A" stroke-width="2.6" stroke-linecap="round"/>`).join('')
    + `<path d="M-12 -14 q-2 -24 12 -30 q14 6 12 30 z" fill="#D87A9A" stroke="${O}" stroke-width="1.1"/><circle cx="-4" cy="-28" r="2" fill="#B85A7A"/><circle cx="6" cy="-34" r="1.6" fill="#B85A7A"/>`
    + eye(-4, -18, 2.6) + eye(5, -18, 2.6)),
  cua: svgOf(56, 34, 28, 30,
    [-14, -8, 8, 14].map((x) => `<path d="M${x} -8 l${x > 0 ? 6 : -6} 8" stroke="${O}" stroke-width="3.6" stroke-linecap="round"/><path d="M${x} -8 l${x > 0 ? 6 : -6} 8" stroke="#C8502A" stroke-width="2.2" stroke-linecap="round"/>`).join('')
    + `<ellipse cx="0" cy="-12" rx="17" ry="10" fill="#D8603A" stroke="${O}" stroke-width="1.1"/><path d="M-10 -16 q10 -6 20 0" stroke="#F28A5A" stroke-width="2" fill="none"/>`
    + `<path d="M14 -16 q12 -10 10 -20 q-8 -2 -10 6 q4 0 4 4 z" fill="#D8603A" stroke="${O}"/><path d="M-14 -16 q-12 -10 -10 -20 q8 -2 10 6 q-4 0 -4 4 z" fill="#D8603A" stroke="${O}"/>`
    + `<path d="M-4 -20 v-6 M4 -20 v-6" stroke="${O}"/>` + eye(-4, -27, 2) + eye(4, -27, 2)),
  cao: svgOf(40, 30, 18, 28,
    leg(-8, '#C86A2A', 7) + leg(-2, '#C86A2A', 7) + leg(6, '#C86A2A', 7) + leg(12, '#C86A2A', 7)
    + `<path d="M-12 -12 q-14 -8 -12 -20 q8 6 12 8" fill="#E8843A" stroke="${O}"/><ellipse cx="2" cy="-12" rx="13" ry="7" fill="#E8843A" stroke="${O}"/>`
    + `<path d="M12 -16 l8 -2 l2 -10 l-4 4 l-4 -5 l-4 7 z" fill="#E8843A" stroke="${O}"/><path d="M19 -14 l5 1 l-4 3 z" fill="#F2E6C8"/>` + eye(16, -17, 1.4, '#FFD66B')),

  // --- BOSS
  chantinh: svgOf(110, 112, 52, 110,
    `<path d="M-18 0 v-22 M18 0 v-22" stroke="${O}" stroke-width="14" stroke-linecap="round"/><path d="M-18 0 v-22 M18 0 v-22" stroke="#5A7A3A" stroke-width="11" stroke-linecap="round"/>`
    + `<ellipse cx="0" cy="-44" rx="32" ry="28" fill="#6A8A42" stroke="${O}" stroke-width="1.6"/><path d="M-22 -30 q22 14 44 0" fill="#4E6A2E"/><path d="M-24 -26 h48 l-4 10 h-40 z" fill="#6A4A2A" stroke="${O}"/>`
    + `<circle cx="2" cy="-82" r="20" fill="#7A9A4A" stroke="${O}" stroke-width="1.5"/><path d="M-14 -94 l-8 -14 l14 8 z M16 -96 l10 -12 l-4 16 z" fill="#E8DCC0" stroke="${O}"/>`
    + eye(-5, -86, 3.6, '#FFD66B') + eye(9, -86, 3.6, '#FFD66B') + `<path d="M-8 -74 q10 6 20 0 v4 q-10 6 -20 0 z" fill="#3A1A0A" stroke="${O}"/><path d="M-6 -74 l2 4 l2 -4 M6 -74 l2 4 l2 -4" fill="#FFF"/>`
    + `<path d="M28 -50 q16 -6 18 -26" stroke="${O}" stroke-width="11" stroke-linecap="round" fill="none"/><path d="M28 -50 q16 -6 18 -26" stroke="#6A8A42" stroke-width="8" stroke-linecap="round" fill="none"/>`
    + `<path d="M46 -76 L40 -104" stroke="#5A3A1A" stroke-width="4"/><path d="M34 -106 h14 v-8 h-14 z" fill="#8A847E" stroke="${O}"/>`
    + `<path d="M-28 -50 q-14 4 -16 20" stroke="${O}" stroke-width="11" stroke-linecap="round" fill="none"/><path d="M-28 -50 q-14 4 -16 20" stroke="#6A8A42" stroke-width="8" stroke-linecap="round" fill="none"/>`),
  daibang: svgOf(130, 80, 64, 50,
    `<path d="M-6 -14 q-30 -30 -58 -20 q12 6 12 14 q14 -4 20 6 q8 -8 26 0 z" fill="#6A4A2A" stroke="${O}" stroke-width="1.2"/>`
    + `<path d="M6 -14 q30 -30 58 -20 q-12 6 -12 14 q-14 -4 -20 6 q-8 -8 -26 0 z" fill="#6A4A2A" stroke="${O}" stroke-width="1.2"/>`
    + `<path d="M-40 -26 q6 2 10 8 M-26 -30 q4 4 6 10 M40 -26 q-6 2 -10 8 M26 -30 q-4 4 -6 10" stroke="#8A6A3A" fill="none" stroke-width="1.4"/>`
    + `<ellipse cx="0" cy="-8" rx="12" ry="16" fill="#7A5A32" stroke="${O}" stroke-width="1.2"/><path d="M-8 6 l-4 10 M8 6 l4 10" stroke="#E8B83A" stroke-width="3"/>`
    + `<circle cx="4" cy="-26" r="9" fill="#F2E6C8" stroke="${O}"/><path d="M11 -26 q8 2 6 8 l-6 -3 z" fill="#E8B83A" stroke="${O}"/>` + eye(6, -28, 2, '#FF5A3A')
    + `<path d="M-6 -32 q4 -6 10 -2" stroke="#F2E6C8" stroke-width="3" fill="none"/>`),
  anvuong: svgOf(96, 104, 44, 102,
    `<path d="M-22 0 v-16 M-10 0 v-16 M14 0 v-16 M26 0 v-16" stroke="${O}" stroke-width="7" stroke-linecap="round"/><path d="M-22 0 v-16 M-10 0 v-16 M14 0 v-16 M26 0 v-16" stroke="#3A3A3A" stroke-width="5" stroke-linecap="round"/>`
    + `<ellipse cx="2" cy="-24" rx="32" ry="13" fill="#2A2A2A" stroke="${O}"/><path d="M30 -30 q12 -8 14 -24 l6 4 q-2 16 -12 26 z" fill="#2A2A2A" stroke="${O}"/><ellipse cx="44" cy="-56" rx="8" ry="5" fill="#2A2A2A" stroke="${O}"/>`
    + `<path d="M-30 -24 q-10 0 -14 12" stroke="#1A1A1A" stroke-width="4" fill="none"/>`
    + `<path d="M-10 -36 L-12 -62 L14 -62 L12 -36 Z" fill="#6A1A1A" stroke="${O}" stroke-width="1.2"/><path d="M-12 -52 h26" stroke="#C8A040" stroke-width="3"/><path d="M-14 -62 q-10 10 -6 26 l6 -4 z" fill="#8A1A1A" stroke="${O}"/>`
    + `<circle cx="1" cy="-70" r="10" fill="#D8A878" stroke="${O}"/><path d="M-11 -72 q12 -18 24 0 l-2 -2 h-20 z" fill="#C8A040" stroke="${O}"/><path d="M1 -86 v-8" stroke="#C8401E" stroke-width="3"/>`
    + eye(4, -71, 1.8, '#FFF') + `<path d="M-2 -64 q4 3 8 0" stroke="${O}" fill="none"/><path d="M-6 -66 q-4 2 -4 6 M8 -66 q4 2 4 6" stroke="#3A2A16" stroke-width="1.6"/>`
    + `<path d="M14 -56 L40 -96" stroke="#6A4A2A" stroke-width="3"/><path d="M36 -100 l10 -8 l-2 12 z" fill="#D0D0D0" stroke="${O}"/>`),
  ngutinh: svgOf(150, 70, 72, 52,
    `<path d="M-60 -18 l-14 -16 l2 30 z" fill="#2A5A6A" stroke="${O}" stroke-width="1.2"/><ellipse cx="0" cy="-18" rx="60" ry="22" fill="#3A7A8A" stroke="${O}" stroke-width="1.4"/>`
    + `<path d="M-40 -6 q40 18 90 -4" fill="#BFE8F5" opacity="0.6"/><path d="M-20 -38 l10 -18 l12 16 l10 -14 l10 16" fill="#2A5A6A" stroke="${O}"/>`
    + [-40, -28, -16, -4, 8, 20].map((x) => `<path d="M${x} -26 q4 6 0 12" stroke="#2A5A6A" fill="none" stroke-width="1.2"/>`).join('')
    + `<path d="M40 -10 l4 6 l3 -6 l3 6 l3 -6 l3 6 l3 -6" stroke="${O}" fill="#FFF" stroke-width="0.8"/>` + eye(40, -24, 4, '#FFD66B')
    + `<path d="M50 -30 q14 -10 22 -6" stroke="#2A5A6A" stroke-width="2" fill="none"/><path d="M10 -4 l-8 14 l16 -8 z" fill="#2A5A6A" stroke="${O}"/>`),
  hotinh: svgOf(110, 70, 50, 66,
    [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9, -1.15, 1.15].map((a) => `<path d="M-24 -26 q${-30 * Math.cos(a)} ${-26 + 30 * Math.sin(a)} ${-46 * Math.cos(a)} ${-14 + 40 * Math.sin(a)}" stroke="${O}" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M-24 -26 q${-30 * Math.cos(a)} ${-26 + 30 * Math.sin(a)} ${-46 * Math.cos(a)} ${-14 + 40 * Math.sin(a)}" stroke="#F2E6C8" stroke-width="7" stroke-linecap="round" fill="none"/>`).join('')
    + leg(-16, '#E8F2FA', 14) + leg(-6, '#E8F2FA', 14) + leg(12, '#E8F2FA', 14) + leg(22, '#E8F2FA', 14)
    + `<ellipse cx="2" cy="-24" rx="28" ry="12" fill="#F2F6FA" stroke="${O}" stroke-width="1.2"/>`
    + `<path d="M24 -30 l18 -4 l4 -18 l-8 8 l-8 -10 l-8 14 z" fill="#F2F6FA" stroke="${O}"/><path d="M40 -32 l10 2 l-8 5 z" fill="#F2F6FA" stroke="${O}"/>` + eye(36, -36, 2, '#C85AFF')
    + `<circle cx="2" cy="-30" r="3" fill="#C85AFF" opacity="0.8"/>`),
  trieuda: svgOf(90, 100, 42, 98,
    leg(-8, '#3A2A1A', 16) + leg(8, '#3A2A1A', 16)
    + `<path d="M-18 -14 L-20 -54 L20 -54 L18 -14 Z" fill="#2A3A5A" stroke="${O}" stroke-width="1.3"/><path d="M-20 -40 h40" stroke="#C8A040" stroke-width="3"/><circle cx="0" cy="-40" r="4" fill="#C8A040" stroke="${O}"/>`
    + `<path d="M-22 -54 q-14 18 -8 40 l8 -6 z M22 -54 q14 18 8 40 l-8 -6 z" fill="#4A1A1A" stroke="${O}"/>`
    + `<circle cx="0" cy="-66" r="12" fill="#D8A878" stroke="${O}"/><path d="M-14 -68 q14 -22 28 0 l-3 -3 h-22 z" fill="#3A3A3A" stroke="${O}"/><path d="M-6 -86 l6 -10 l6 10 z" fill="#C8A040" stroke="${O}"/>`
    + eye(4, -67, 2) + `<path d="M-6 -58 q6 8 12 0 q-6 4 -12 0" fill="#2A1A0A"/>`
    + `<path d="M20 -44 L36 -90" stroke="#6A4A2A" stroke-width="3"/><path d="M30 -92 q6 -10 14 -4 q-4 8 -12 8 z" fill="#D0D0D0" stroke="${O}"/>`),
};
for (const k in ENEMY_ART2) {
  if (typeof ART === 'undefined') break;
  if (ENEMIES[k] && ENEMIES[k].boss) ART.boss[k] = ENEMY_ART2[k]; else ART.enemy[k] = ENEMY_ART2[k];
}
})();
