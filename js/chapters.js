'use strict';

// ============================================================
//  CHƯƠNG TRUYỆN DÂN GIAN (v48): mỗi chương vài ải, 3 khung truyện mở đầu (vẽ bằng chính
//  hình tướng / quái trong game ghép lên nền theo chủ đề), quân và boss riêng.
// ============================================================

// ải mới nối sau 8 ải Sơn Tinh – Thủy Tinh
LEVELS.push(
  { name: 'Miếu Chằn Tinh', map: 'rung1', shape: 'vongve', roster: 'rung', waves: 15, hp: 1.0, bosses: { 15: 'chantinh' },
    desc: 'Đêm canh miếu thay Lý Thông. Yêu tinh rừng kéo đến, Chằn Tinh hiện hình cuối đêm.', hint: ['thosan', 'xathu', 'lactuong'] },
  { name: 'Gốc Đa Cổ Thụ', map: 'rung2', shape: 'caucheo', roster: 'rung', waves: 20, hp: 1.05, bosses: { 10: 'chantinh', 20: 'chantinh' },
    desc: 'Rắn độc và Thạch Tinh giữ gốc đa nơi Thạch Sanh lớn lên.', hint: ['thaymo', 'thansuong', 'xathu'] },
  { name: 'Hang Đại Bàng', map: 'hang1', shape: 'deodoc', roster: 'hang', waves: 20, hp: 1.1, bosses: { 10: 'chantinh', 20: 'daibang' },
    desc: 'Lần theo vết máu xuống hang sâu cứu công chúa Quỳnh Nga. Đại Bàng Tinh bay: cần tướng bắn xa.', hint: ['xathu', 'thaymo', 'thansuong'] },
  { name: 'Làng Phù Đổng', map: 'dong1', shape: 'ruongdoc', roster: 'an', waves: 15, hp: 1.1, bosses: { 15: 'anvuong' },
    desc: 'Giặc Ân tràn vào làng. Cậu bé Gióng vươn vai thành tráng sĩ.', hint: ['lactuong', 'lucsi', 'xathu'] },
  { name: 'Đồng Trâu', map: 'dong2', shape: 'songsong', roster: 'an', waves: 20, hp: 1.15, bosses: { 10: 'anvuong', 20: 'anvuong' },
    desc: 'Quỷ lợn rừng và voi chiến giặc Ân dàn trận giữa đồng. Nhổ tre quật giặc!', hint: ['thaymo', 'lucsi', 'thansuong'] },
  { name: 'Biển Đông', map: 'bien1', shape: 'bendo', roster: 'bien', waves: 20, hp: 1.2, bosses: { 10: 'ngutinh', 20: 'ngutinh' },
    desc: 'Ngư Tinh nuốt thuyền bè ngoài khơi. Cá Mập Yêu bơi rất nhanh, Cua Khổng Lồ mai cứng.', hint: ['thansuong', 'xathu', 'thosan'] },
  { name: 'Đầm Xác Cáo', map: 'song4', shape: 'haicong', roster: 'rung', waves: 20, hp: 1.25, bosses: { 10: 'hotinh', 20: 'hotinh' },
    desc: 'Hồ Tinh chín đuôi ẩn trong đầm lớn. Kháng phép cao: mang tướng đánh vật lý.', hint: ['lactuong', 'thosan', 'xathu'] },
  { name: 'Thành Ốc Cổ Loa', map: 'thanh1', shape: 'xoanoc', roster: 'trieu', waves: 25, hp: 1.3, bosses: { 12: 'trieuda', 25: 'trieuda' },
    desc: 'Thành xoắn như hình ốc: đường giặc đi rất dài. Giữ lấy thành trong cùng!', hint: ['xathu', 'thaymo', 'lucsi'] },
  { name: 'Biển Mộ Dạ', map: 'bien2', shape: 'cong3', roster: 'trieu', waves: 20, hp: 1.35, bosses: { 10: 'trieuda', 20: 'trieuda' },
    desc: 'An Dương Vương chạy về biển, Rùa Vàng rẽ nước đón vua. Trận cuối với quân Triệu Đà.', hint: ['xathu', 'lactuong', 'thansuong'] },
);
// claude/ban-do-moi: đăng ký sẵn bản đồ dạng đường của mọi ải vào MAPS (tool bản đồ pixel duyệt MAPS)
if (typeof levelMapId === 'function') LEVELS.forEach((_, i) => levelMapId(i));

// v49: số đợt và máu quái tăng dần theo ải; boss mỗi 10 đợt (lần lượt theo chương) + boss cuối ở đợt cuối
const LEVEL_WAVES_V49 = [15, 20, 20, 25, 25, 30, 30, 30, 25, 30, 30, 30, 35, 35, 35, 35, 35];
// v54: thêm 10 đợt mỗi ải để có thời gian / vàng nâng tướng; máu quái kéo giãn theo waveScale nên đợt cuối mạnh như cũ
const LEVEL_WAVES = LEVEL_WAVES_V49.map((w) => w + 10);
// v136: ải 4–8 tăng dần 1,3 → 1,7 (trước nhảy thẳng 1,2 → 1,7 ở ải 4, người mới kẹt ở đây)
const LONG_HP = (i) => (i < 3 ? 1.2 : i < 8 ? 1.2 + (i - 2) * 0.1 : i < 15 ? 1.55 : 1.35);   // ải dài hơn → nhiều vàng hơn → tăng máu quái để giữ độ khó (chạy bot v54)
const LEVEL_HP = [1.0, 1.0, 1.1, 1.25, 1.35, 1.4, 1.5, 1.65, 1.5, 1.55, 1.65, 1.45, 1.7, 1.35, 1.4, 1.55, 1.45];   // chỉnh theo bot v51 (quân mỗi chương mạnh yếu khác nhau)
const LEVEL_BOSS = [   // [boss giữa trận (lần lượt), boss cuối]
  [['thuongluong'], 'thuongluong'], [['thuongluong'], 'haba'], [['thuongluong'], 'haba'], [['thuongluong', 'haba'], 'thuytinh'],
  [['thuongluong', 'haba'], 'thuytinh'], [['thuongluong', 'haba'], 'thuytinh'], [['thuongluong', 'thuytinh', 'haba'], 'thuytinh'], [['thuongluong', 'haba'], 'thuytinh'],
  [['chantinh'], 'chantinh'], [['chantinh'], 'chantinh'], [['chantinh', 'daibang'], 'daibang'],
  [['anvuong'], 'anvuong'], [['anvuong'], 'anvuong'],
  [['ngutinh'], 'ngutinh'], [['hotinh', 'chantinh'], 'hotinh'],
  [['anvuong', 'trieuda'], 'trieuda'], [['ngutinh', 'trieuda'], 'trieuda'],
];
LEVELS.forEach((lv, i) => {
  if (LEVEL_WAVES[i] === undefined) return;
  lv.waves = LEVEL_WAVES[i];
  lv.waveScale = (LEVEL_WAVES_V49[i] - 1) / (LEVEL_WAVES[i] - 1);
  lv.hp = LEVEL_HP[i] * LONG_HP(i);
  const [mid, last] = LEVEL_BOSS[i];
  lv.bosses = {};
  for (let w = 10, k = 0; w < lv.waves; w += 10, k++) lv.bosses[w] = mid[k % mid.length];
  lv.bosses[lv.waves] = last;
});
// Khó: hệ số máu theo ải (thêm cho các chương mới)
HARD.table = [1.6, 1.7, 1.8, 1.75, 1.6, 1.45, 1.4, 1.35, 1.35, 1.35, 1.3, 1.3, 1.3, 1.25, 1.25, 1.25, 1.2];

const CHAPTERS = [
  { id: 'sontinh', name: 'Sơn Tinh – Thủy Tinh', from: 0, to: 7, title: 'Vua Hùng kén rể', chip: 'Truyền thuyết Sơn Tinh – Thủy Tinh', classic: true },
  { id: 'thachsanh', name: 'Thạch Sanh', from: 8, to: 10, title: 'Thạch Sanh diệt yêu', chip: 'Truyện cổ tích Thạch Sanh', bg: 'rung',
    opener: ['thachsanh', 'Yêu quái hại dân, Thạch Sanh này quyết không tha!'],
    panels: [
      { bg: 'rung', heroes: [['thachsanh', 120, 0.9]], foes: [], tree: true,
        cap: '<b>Thạch Sanh</b> mồ côi, sống dưới gốc đa, được thiên thần dạy đủ võ nghệ. <span class="w">Lý Thông</span> gặp chàng, kết làm anh em để lợi dụng.',
        lead: 'Ngày xưa, ở quận Cao Bình…' },
      { bg: 'dem', heroes: [['thachsanh', 90, 0.9]], foes: [['chantinh', 215, 0.62]],
        cap: 'Đến lượt Lý Thông nộp mình cho <span class="w">Chằn Tinh</span>, hắn lừa Thạch Sanh đi canh miếu thay. Chàng vung búa chém chết con quỷ.',
        lead: 'Chằn Tinh hiện nguyên hình, gầm vang cả khu rừng.' },
      { bg: 'hang', heroes: [['thachsanh', 90, 0.85]], foes: [['daibang', 220, 0.55]],
        cap: '<span class="w">Đại Bàng Tinh</span> cắp công chúa <b>Quỳnh Nga</b> bay về hang. Thạch Sanh bắn trúng cánh nó, lần theo vết máu xuống hang cứu nàng.',
        lead: 'Hãy theo Thạch Sanh diệt trừ yêu quái!' },
    ] },
  { id: 'giong', name: 'Thánh Gióng', from: 11, to: 12, title: 'Gióng đánh giặc Ân', chip: 'Truyền thuyết Thánh Gióng', bg: 'dong',
    opener: ['giong', 'Ta sẽ đánh tan giặc Ân, giữ yên bờ cõi Văn Lang!'],
    panels: [
      { bg: 'dong', heroes: [['giong', 150, 0.55]], foes: [], hut: true,
        cap: 'Đời Hùng Vương thứ sáu, ở làng <b>Phù Đổng</b> có cậu bé lên ba vẫn chẳng biết nói, biết cười, đặt đâu nằm đấy.',
        lead: 'Ngày xưa, ở làng Gióng…' },
      { bg: 'dong', heroes: [['giong', 100, 0.95]], foes: [['linhan', 215, 0.75], ['linhan', 255, 0.7]],
        cap: '<span class="w">Giặc Ân</span> tràn sang. Nghe sứ giả tìm người tài, Gióng cất tiếng xin <b>ngựa sắt, roi sắt, áo giáp sắt</b> rồi vươn vai thành tráng sĩ.',
        lead: 'Cả làng góp gạo nuôi Gióng lớn nhanh như thổi.' },
      { bg: 'nui', heroes: [['giong', 110, 0.95]], foes: [['kybinh', 230, 0.6]],
        cap: 'Roi sắt gãy, Gióng <b>nhổ tre</b> bên đường quật giặc tan tác, rồi cưỡi ngựa bay về trời ở núi Sóc.',
        lead: 'Hãy cùng Gióng đánh tan giặc Ân!' },
    ] },
  { id: 'llq', name: 'Lạc Long Quân', from: 13, to: 14, title: 'Lạc Long Quân diệt yêu', chip: 'Truyền thuyết Lạc Long Quân', bg: 'bien',
    opener: ['llq', 'Yêu tinh biển cả, chớ hòng hại dân Lạc Việt!'],
    panels: [
      { bg: 'bien', heroes: [['llq', 150, 0.9]], foes: [],
        cap: '<b>Lạc Long Quân</b>, nòi Rồng, sức khoẻ vô địch, thường lên cạn giúp dân diệt trừ yêu quái.',
        lead: 'Thuở ấy, đất Lạc Việt còn nhiều yêu tinh…' },
      { bg: 'bien', heroes: [['llq', 90, 0.85]], foes: [['ngutinh', 220, 0.5]],
        cap: 'Ở biển Đông, <span class="w">Ngư Tinh</span> há miệng nuốt thuyền bè. Lạc Long Quân nung đỏ khối sắt ném vào họng nó, chém làm ba khúc.',
        lead: 'Sóng dữ nổi lên giữa biển Đông.' },
      { bg: 'dam', heroes: [['llq', 90, 0.85]], foes: [['hotinh', 215, 0.45]],
        cap: '<span class="w">Hồ Tinh</span> chín đuôi nghìn năm tuổi bắt người ăn thịt. Lạc Long Quân dâng nước đánh tan, nơi ấy thành <b>đầm Xác Cáo</b> — nay là Hồ Tây.',
        lead: 'Hãy theo Lạc Long Quân giữ yên miền sông biển!' },
    ] },
  { id: 'adv', name: 'An Dương Vương', from: 15, to: 16, title: 'Nỏ thần Cổ Loa', chip: 'Truyền thuyết An Dương Vương', bg: 'thanh',
    opener: ['adv', 'Nỏ thần còn đây, giặc Triệu chớ mong vượt thành Cổ Loa!'],
    panels: [
      { bg: 'thanh', heroes: [['adv', 105, 0.85], ['kimquy', 200, 0.6]], foes: [],
        cap: '<b>An Dương Vương</b> xây thành ở Cổ Loa, xây mãi lại đổ. <b>Thần Kim Quy</b> hiện lên giúp, thành xoắn như hình ốc.',
        lead: 'Nước Âu Lạc, thành Cổ Loa…' },
      { bg: 'thanh', heroes: [['adv', 100, 0.85]], foes: [['trieuda', 225, 0.6]],
        cap: 'Kim Quy tặng vuốt làm lẫy <b>nỏ thần</b>, bắn một phát chết hàng nghìn giặc. <span class="w">Triệu Đà</span> thua mãi, cho con là Trọng Thủy sang cầu hôn Mỵ Châu.',
        lead: 'Triệu Đà nuôi mưu đánh tráo lẫy nỏ.' },
      { bg: 'thanh', heroes: [['adv', 80, 0.8]], foes: [['kybinh', 190, 0.55], ['voichien', 260, 0.5]],
        cap: 'Trọng Thủy lén đánh tráo lẫy nỏ thần. <span class="w">Quỷ binh Triệu Đà</span> kéo đến chân thành — hãy giữ Cổ Loa trước khi quá muộn!',
        lead: 'Giữ lấy thành Cổ Loa!' },
    ] },
];
const chapterOf = (lv) => CHAPTERS.find((c) => lv >= c.from && lv <= c.to) || CHAPTERS[0];

// ---------- khung truyện: nền theo chủ đề + nhân vật lấy từ hình tướng / quái của game (SVG 320×200)
const STORY_BG = {
  rung: ['#8AB8D8', '#3E6A2E', '#2E4A22'], dem: ['#1A2440', '#2E3A2A', '#1E2A18'], hang: ['#2A241C', '#4A4236', '#3A3228'],
  dong: ['#A8D0E8', '#7A9A3E', '#5E7A30'], nui: ['#C8B8E8', '#6A7A4A', '#4A5A32'], bien: ['#7FC8E8', '#2C7AA0', '#D8C890'],
  dam: ['#9AB8C8', '#3E5530', '#2C5A6A'], thanh: ['#E8C8A0', '#6A7A3A', '#4A5A2E'],
};
function storyBackdrop(kind, o) {
  const [sky, mid, ground] = STORY_BG[kind] || STORY_BG.dong;
  let s = `<defs><linearGradient id="sk-${kind}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky}"/><stop offset="1" stop-color="${mid}"/></linearGradient></defs>`
    + `<rect width="320" height="200" fill="url(#sk-${kind})"/>`;
  if (kind === 'dem') s += `<circle cx="260" cy="40" r="16" fill="#F2E6C8"/><circle cx="254" cy="36" r="16" fill="#1A2440" opacity="0.4"/>` + [30, 80, 140, 190].map((x, i) => `<circle cx="${x}" cy="${20 + (i % 2) * 18}" r="1.4" fill="#FFF"/>`).join('');
  if (kind === 'hang') s += `<path d="M0 0 H320 V60 C280 80 240 50 200 70 C160 90 120 56 80 74 C40 90 20 60 0 70 Z" fill="#1A1612"/>` + [40, 120, 200, 280].map((x) => `<path d="M${x - 8} 64 L${x} 96 L${x + 8} 64 Z" fill="#2A241C"/>`).join('');
  if (kind === 'bien') s += `<rect y="96" width="320" height="50" fill="#2C7AA0"/>` + [30, 110, 190, 270].map((x) => `<path d="M${x} 112 q8 -6 16 0 q8 6 16 0" stroke="#BFE8F5" stroke-width="2" fill="none"/>`).join('');
  if (kind === 'nui' || kind === 'dong' || kind === 'thanh' || kind === 'rung') s += `<polygon points="0,130 60,70 110,110 170,60 230,105 290,72 320,96 320,140 0,140" fill="${mid}" opacity="0.8"/>`;
  if (kind === 'dam') s += `<ellipse cx="160" cy="150" rx="200" ry="34" fill="#2C5A6A"/>` + [60, 120, 240].map((x) => `<ellipse cx="${x}" cy="150" rx="12" ry="4" fill="#3E7A3A"/><circle cx="${x + 3}" cy="147" r="3" fill="#F2A0C4"/>`).join('');
  s += `<rect y="140" width="320" height="60" fill="${ground}"/>`;
  if (kind === 'thanh') s += [0, 1, 2].map((i) => `<path d="M${10 + i * 12} ${120 + i * 8} Q160 ${80 + i * 10} ${310 - i * 12} ${120 + i * 8}" stroke="#7E6440" stroke-width="7" fill="none"/>`).join('');
  if (o.tree) s += `<rect x="232" y="60" width="18" height="90" fill="#5A3A1A"/><circle cx="240" cy="56" r="42" fill="#2D4E22"/><circle cx="214" cy="70" r="26" fill="#1E3418"/><circle cx="268" cy="72" r="26" fill="#1E3418"/>`;
  if (o.hut) s += `<rect x="40" y="110" width="60" height="38" fill="#8A6A42" stroke="#3A2A16"/><path d="M28 112 L70 78 L112 112 Z" fill="#B8984A" stroke="#5A4420"/><rect x="62" y="124" width="14" height="24" fill="#2A1A0A"/>`;
  return s;
}
// nhân vật: tướng = ghép các phần SVG của tướng; quái = SVG quái, chân tại đáy khung
function storyHero(type, x, sc) {
  if (typeof ART === 'undefined' || !ART.hero[type]) return '';
  const a = ART.hero[type];
  const [vx, vy, vw, vh] = HERO_VB;
  const w = vw * sc * 0.56, h = vh * sc * 0.56;
  const parts = ['back', 'legs', 'armB', 'body', 'head', 'armF', 'weapon'].map((p) => a[p] || '').join('');
  // chân tướng nằm ở y = 222 trong khung (vy..vy+vh) → đặt chạm đất y = 166
  return `<svg x="${x - w / 2}" y="${166 - h * (222 - vy) / vh}" width="${w}" height="${h}" style="width:${w}px;height:${h}px" viewBox="${vx} ${vy} ${vw} ${vh}">${a.defs || ''}${parts}</svg>`;
}
function storyFoe(type, x, sc) {
  const a = typeof enemyArt === 'function' ? enemyArt(type) : null;
  if (!a) return '';
  const k = ENEMIES[type] && ENEMIES[type].boss ? 1.75 : 2;
  const w = a.w * sc * k, h = a.h * sc * k;
  const inner = a.svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  const fly = ENEMIES[type] && ENEMIES[type].flying ? 40 : 0;
  // quay mặt sang trái (đối diện tướng)
  return `<g transform="translate(${x + w / 2} ${168 - h - fly}) scale(-1 1)"><svg width="${w}" height="${h}" style="width:${w}px;height:${h}px" viewBox="0 0 ${a.w} ${a.h}">${inner}</svg></g>`;
}
function storyScene(p) {
  // claude/xuat-goi-pixel: phông tranh truyện pixel (canh/truyen-nen-<bg>) khi bật pixel
  const pb = typeof pxUrl === 'function' && p.bg && pxUrl('canh', 'truyen-nen-' + p.bg);
  const body = (pb ? `<image href="${pb}" x="0" y="0" width="320" height="200" preserveAspectRatio="xMidYMid slice" style="image-rendering:pixelated"/>` : storyBackdrop(p.bg, p))
    + (p.heroes || []).map(([t, x, sc]) => storyHero(t, x, sc)).join('')
    + (p.foes || []).map(([t, x, sc]) => storyFoe(t, x, sc)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="320" height="200" preserveAspectRatio="xMidYMid slice">${body}</svg>`;
}

// ---------- v163: chủ đề theo chương cho màn thắng / thua, lời nhắc đầu trận, màn chọn phần thưởng
// (trước gắn cứng Sơn Tinh – Thủy Tinh: "Phong Châu thất thủ", "Nước ngập thành", "Vua Hùng ban thưởng"…)
// keep/lost: chữ nhỏ trên thanh đầu · goal: mục tiêu ải · loseTitle/loseTag/winTag: màn kết quả
// fx: hiện tượng vẽ trong tranh thua (water nước lũ, mist sương yêu, fire lửa giặc, wave sóng biển)
// gate: cổng / thành vẽ trong tranh (mapGate trong maps.js) · bar: màu thanh tiến độ · hi: màu số đợt
const CH_THEME = {
  sontinh: { keep: 'Đã giữ thành', lost: 'Thành đã mất', goal: 'giữ thành Phong Châu', foe: 'quân Thủy Tinh',
    loseTitle: 'Phong Châu thất thủ', loseTag: 'Nước ngập thành', winTag: 'Nước rút', ic: '💧', fx: 'water', gate: 'default',
    bar: ['#2C6A86', '#5AB4D6'], hi: '#9EDDF2', edge: '#2C6A86', rewardHead: 'Chọn sính lễ', reward: 'Vua Hùng ban thưởng' },
  thachsanh: { keep: 'Đã giữ làng', lost: 'Làng đã mất', goal: 'giữ miếu và bản làng', foe: 'yêu tinh rừng',
    loseTitle: 'Yêu quái tràn vào làng', loseTag: 'Miếu thất thủ', winTag: 'Yêu quái tan', ic: '👹', fx: 'mist', gate: 'hut',
    bar: ['#3E5A22', '#8AC04A'], hi: '#B8E07A', edge: '#4E7A2E', rewardHead: 'Chọn phần thưởng', reward: 'Dân làng tạ ơn' },
  giong: { keep: 'Đã giữ làng', lost: 'Làng đã mất', goal: 'giữ làng Phù Đổng', foe: 'giặc Ân',
    loseTitle: 'Giặc Ân chiếm làng Phù Đổng', loseTag: 'Lửa giặc cháy làng', winTag: 'Giặc Ân tan', ic: '🔥', fx: 'fire', gate: 'village',
    bar: ['#8A2A12', '#E0702C'], hi: '#FFB070', edge: '#A8401E', rewardHead: 'Chọn phần thưởng', reward: 'Vua Hùng ban thưởng' },
  llq: { keep: 'Đã giữ biển', lost: 'Bờ biển đã mất', goal: 'giữ yên miền sông biển', foe: 'yêu tinh biển',
    loseTitle: 'Yêu tinh biển hoành hành', loseTag: 'Sóng dữ tràn bờ', winTag: 'Biển lặng', ic: '🌊', fx: 'wave', gate: 'hut',
    bar: ['#1F5A6A', '#3EC0C0'], hi: '#8AE8E0', edge: '#1F7A78', rewardHead: 'Chọn phần thưởng', reward: 'Long Cung ban thưởng' },
  adv: { keep: 'Đã giữ thành', lost: 'Thành đã mất', goal: 'giữ thành Cổ Loa', foe: 'quân Triệu Đà',
    loseTitle: 'Cổ Loa thất thủ', loseTag: 'Giặc Triệu vào thành', winTag: 'Nỏ thần giữ thành', ic: '🏹', fx: 'fire', gate: 'citadel',
    bar: ['#6A3A1A', '#D08A3A'], hi: '#F2C07A', edge: '#8C5A2A', rewardHead: 'Chọn phần thưởng', reward: 'An Dương Vương ban thưởng' },
};
// Vô tận: quân đổi chương mỗi 10 đợt → chữ trung tính, tranh vẫn theo bản đồ của ải
const ENDLESS_THEME = { keep: 'Vô tận', lost: 'Hết lượt trụ', goal: 'giữ thành càng lâu càng tốt', foe: 'quân địch',
  loseTitle: 'Thành đã thất thủ', loseTag: 'Vô tận', ic: '♾', bar: ['#5C4620', '#D9B25A'], hi: '#F2D27A', edge: '#8C6A2E' };
function themeOf(level, endless) {
  const ch = chapterOf(level);
  const t = Object.assign({ id: ch.id }, CH_THEME[ch.id] || CH_THEME.sontinh);
  return endless ? Object.assign(t, ENDLESS_THEME, { id: ch.id }) : t;
}
// quái bay / quái khỏe của ải (cho mẹo lần sau, lịch đợt)
function rosterOfLevel(level) {
  const lv = LEVELS[level] || {};
  return (typeof ROSTERS !== 'undefined' && ROSTERS[lv.roster || 'thuy']) || null;
}
// ảnh vẽ tay tranh thắng / thua theo chương (đặt file là game tự dùng, chưa có thì vẽ SVG bên dưới)
const RESULT_FILE = (id, win) => [`scenes/${win ? 'thang' : 'thua'}-${id}.png`, ...(id === 'sontinh' ? SCENE_FILE[win ? 'win' : 'lose'] : [])];
// tranh / khung giao diện luôn dùng khi có file (như ảnh nền menu, nút ui/), không phụ thuộc cài đặt "Dùng ảnh AI" của nhân vật
function resultImg(id, win) {
  const px = typeof pxUrl === 'function' && pxUrl('canh', `${win ? 'thang' : 'thua'}-${id}`);   // claude/xuat-goi-pixel
  if (px) return px;
  for (const p of RESULT_FILE(id, win)) if (asset(p, true)) return assetSrc(p);
  return '';
}
// tranh SVG 330×362 cho chương chưa có ảnh (Sơn Tinh – Thủy Tinh dùng tranh cũ trong art.js)
function resultScene(level, win) {
  const ch = chapterOf(level), th = CH_THEME[ch.id] || CH_THEME.sontinh;
  const bg = ch.bg || 'dong';
  const lv = LEVELS[level] || {};
  const boss = lv.bosses ? lv.bosses[lv.waves] : null;
  const hero = (ch.opener || ['sontinh'])[0];
  const W = 330, H = 362, K = 1.3, Y = H - 200 * K;     // nền truyện 320×200 phóng 1,3 lần kê sát đáy, phía trên là trời
  const [sky, mid0] = STORY_BG[bg] || STORY_BG.dong;
  let s = `<defs><linearGradient id="rs-${bg}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky}"/><stop offset="1" stop-color="${mid0}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#rs-${bg})"/>`;
  if (win) {
    // trời vàng, mặt trời trống đồng toả tia
    s += `<rect width="${W}" height="${Y + 120}" fill="#F2C060" opacity="0.5"/>`
      + Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2; return `<path d="M165 92 L${165 + Math.cos(a) * 190} ${92 + Math.sin(a) * 190}" stroke="#FFE9A8" stroke-width="${i % 2 ? 3 : 6}" opacity="0.5"/>`; }).join('')
      + `<circle cx="165" cy="92" r="40" fill="#E8B04A" stroke="#8C5A1A" stroke-width="3"/><circle cx="165" cy="92" r="28" fill="none" stroke="#8C5A1A" stroke-width="2"/>`
      + Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return `<path d="M${165 + Math.cos(a) * 8} ${92 + Math.sin(a) * 8} L${165 + Math.cos(a + 0.13) * 24} ${92 + Math.sin(a + 0.13) * 24} L${165 + Math.cos(a - 0.13) * 24} ${92 + Math.sin(a - 0.13) * 24} Z" fill="#8C5A1A"/>`; }).join('');
  } else {
    // trời tối theo hiện tượng
    const dark = { mist: '#1A2A1C', fire: '#3A1410', wave: '#0E2230', water: '#0E1820' }[th.fx] || '#1A1410';
    s += `<rect width="${W}" height="${Y + 120}" fill="${dark}" opacity="0.8"/>`;
    if (th.fx === 'fire') s += [60, 150, 250].map((x, i) => `<ellipse cx="${x}" cy="${70 + i * 14}" rx="${70 - i * 8}" ry="26" fill="#2A2420" opacity="0.8"/>`).join('');
    if (th.fx === 'mist') s += `<circle cx="262" cy="52" r="20" fill="#C8E8A0" opacity="0.8"/>` + [[70, 70], [140, 50], [230, 90]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#E04848"/><circle cx="${x + 12}" cy="${y}" r="3" fill="#E04848"/>`).join('');
    if (th.fx === 'wave') s += [40, 120, 210].map((x) => `<path d="M${x - 30} 40 q15 -14 30 0 q15 14 30 0" stroke="#5A7A8A" stroke-width="3" fill="none"/>`).join('') + `<path d="M150 20 l-12 30 h10 l-8 26" stroke="#BFE8F5" stroke-width="3" fill="none"/>`;
  }
  const inner = storyBackdrop(bg, {}).replace(/<rect width="320" height="200" fill="url\(#sk-\w+\)"\/>/, '');   // bỏ trời của khung truyện (đã vẽ trời cao hơn)
  const gate = typeof mapGate === 'function' && th.gate && th.gate !== 'default' ? mapGate(th.gate, 70, 150) : '';
  let mid = inner + gate;
  if (win) mid += storyHero(hero, 175, 1.15) + (hero === 'adv' ? storyHero('kimquy', 255, 0.7) : '');
  else {
    const foe = boss ? storyFoe(boss, 200, boss === 'daibang' || boss === 'ngutinh' ? 0.6 : 0.75) : '';
    if (th.fx !== 'wave') mid += foe;
    if (th.fx === 'fire') mid += [40, 80, 110].map((x, i) => `<path d="M${x} ${150 - i * 6} q-10 -20 0 -40 q4 14 10 6 q6 16 -2 34 z" fill="#E0702C" stroke="#8A2A12" stroke-width="1.5"/><path d="M${x + 2} ${148 - i * 6} q-4 -10 0 -18 q4 8 4 18 z" fill="#FFD66B"/>`).join('');
    if (th.fx === 'mist') mid += `<rect y="120" width="320" height="80" fill="#8AC04A" opacity="0.18"/><ellipse cx="90" cy="150" rx="120" ry="18" fill="#C8E8A0" opacity="0.2"/>`;
    if (th.fx === 'wave') mid += `<path d="M0 150 C40 110 80 170 120 130 C160 100 200 160 240 125 C270 105 300 140 320 120 V200 H0 Z" fill="#1F5A6A" opacity="0.8"/>`
      + [30, 110, 200, 280].map((x) => `<path d="M${x} 140 q10 -12 20 0" stroke="#BFE8F5" stroke-width="2.5" fill="none"/>`).join('');
    if (th.fx === 'wave') mid += foe;     // yêu tinh biển trồi lên trên sóng
  }
  s += `<g transform="translate(${(W - 320 * K) / 2} ${Y}) scale(${K})">${mid}</g>`;
  if (!win) s += `<rect width="${W}" height="${H}" fill="#000" opacity="0.18"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice">${s}</svg>`;
}
