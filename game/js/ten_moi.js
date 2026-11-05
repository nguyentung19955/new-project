// TÊN MỚI TALESWORN (05/11/2026, phiên B "chữ, tên, tiếng Anh"). Nạp ngay sau js/ngon_ngu_en.js.
//
// Hướng đã chốt: cổ tích châu Âu "The Unwritten Tales" (docs/tu-van-toan-cau/huong-c-co-tich-chau-au.md mục 8 +
// docs/tu-van-toan-cau/chatgpt-05-11/tu-van-chatgpt.txt). Tệp này CHỈ đổi chữ hiển thị: mã nội bộ (khoá 'smith', 'moc', tên tệp
// ảnh, khoá bản lưu…) giữ nguyên. Máy đổi tên nằm ở js/ngon_ngu.js (G.ten): chữ nào sắp vẽ lên màn hình cũng đi qua bảng dưới đây.
//   G.ten.them('vi' | 'en', [[cũ, mới, tuỳ chọn], …])   đổi một cụm chữ ở bất cứ đâu trong câu (đúng ranh giới từ)
//   G.ten.thay('vi', { 'câu cũ': 'câu mới' })            đổi nguyên câu (bản tiếng Việt)
//   G.ngonNgu.them({ 'câu Việt cũ': 'câu Anh mới' })     đổi nguyên câu (bản tiếng Anh) — chỉ nạp khi KHÔNG có ?ten=cu
// Cờ quay lui ?ten=cu: bỏ qua cả tệp này (tên, chữ cũ Việt Nam: Cu Tí, Mộc Tinh, Rừng già, chưởng…) và js/truyen.js dùng lời truyện cũ.
// Bảng đối chiếu đầy đủ: docs/review/ke-hoach-cai-thien/talesworn-b-chu/bao-cao.md
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.ten || G.ten.cu) return;
  const R = { rieng: true }; // (chỉ để đọc cho dễ: tên riêng giữ nguyên chữ hoa của tên mới)
  void R;
  const HOA = { hoa: true }, CS = { cs: true };

  // ---------------- TIẾNG VIỆT ----------------
  // Thứ tự quan trọng: cụm dài / đặc biệt đứng TRƯỚC cụm ngắn nằm trong nó.
  G.ten.them('vi', [
    // tên game
    ['Linh Khí: Cuốn Sách Bị Xé', 'Talesworn'], ['Linh Khí', 'Talesworn', CS],
    // nhân vật chính, ba bạn, bé Sen
    ['Cu Tí', 'Rowan'], ['Zed', 'Rowan', CS],
    ['Cu Tèo', 'Jory'], ['Cái Bống', 'Liesel'], ['Cu Lì', 'Otto'],
    ['Bé Sen', 'Lettie'], ['Sen', 'Lettie', CS],
    // người làng
    ['Chú Lái Đò', 'Bác Hob'], ['Ông Thợ Rèn', 'Bác Dorran'], ['Thợ Rèn', 'Bác Dorran', { cs: true, truoc: 'Ông ' }],
    ['Bà Hàng Xén', 'Bà Marrow'], ['Cô Thợ May', 'Cô Odile'], ['Cụ Đồ', 'Thầy Quill'], ['Ông Từ', 'Ông Ambrose'],
    ['anh Mõ', 'anh Tom', CS], ['Anh Mõ', 'Anh Tom'],
    ['Cốc cốc cốc', 'Nghe đây, nghe đây'], ['Cốc cốc', 'Nghe đây'],
    // làng
    ['Gốc đa', 'Gốc sồi', HOA], ['cây đa', 'cây sồi già', HOA], ['lá đa', 'lá sồi', HOA],
    ['sân đình', 'sân làng', HOA], ['Đình làng', 'Nhà Kể Chuyện', HOA], ['ở đình', 'ở Nhà Kể Chuyện', CS], ['về đình', 'về Nhà Kể Chuyện', CS],
    // vùng
    ['Rừng già', 'Rừng Gai'], ['Hang biển', 'Hang Chìm'], ['Lâu đài cổ', 'Lâu đài Than Hồng'], ['Sông sâu', 'Đầm Sương'],
    ['Bộ Rừng Già', 'Bộ Rừng Gai', CS], ['Bộ Hang Biển', 'Bộ Hang Chìm', CS],
    // trùm vùng, trùm nhỏ, trận cuối
    ['Mộc Tinh', 'Lão Cây Gai'], ['Ngư Tinh', 'Hiệp Sĩ Mực'], ['Hồ Tinh', 'Phù Thuỷ Cáo'], ['Thuồng Luồng', 'Lindworm'], ['Hắc Long', 'Rồng Mực'],
    ['Nấm Chúa', 'Vua Nấm Độc'], ['Cua Đá', 'Cua Pha Lê'], ['Hổ Lửa', 'Sư Tử Than'], ['Cá Trê', 'Lão Cá Trê', { truoc: 'Lão ', sau: ' Râu' }],
    // quái mang dấu Việt Nam / châu Á (hình giữ nguyên, chỉ đổi tên)
    ['Đèn Lồng Ma', 'Ma Đèn Sắt'], ['Mèo Đen Hai Đuôi', 'Mèo Phù Thuỷ'], ['Tiểu Yêu Ném Pháo', 'Yêu Tinh Ném Bom'], ['Ma Da Tóc Rong', 'Tinh Nước Đầm'],
    ['Ba Ba Mai Đồng', 'Rùa Cắn'],
    // 3 quái nấm vẽ lại bằng PixelLab (05/11, docs/review/ke-hoach-cai-thien/quai-nam-moi-ai/bao-cao.md): tên theo hình mới, mã heoCon / hoaBaoTu giữ nguyên
    ['Heo Rừng Con', 'Quỷ Lùn Mũ Gai'], ['Heo Con', 'Quỷ Lùn Mũ Gai', CS], ['Hoa Phun Bào Tử', 'Bông Bào Tử'], ['Hoa Bào Tử', 'Bông Bào Tử', CS],
    // trang phục (giữ tên tiếng Anh như bảng mục 8 dòng 44)
    ['Ninja Bóng Đêm', 'Shadow Garb'], ['Thợ Săn Rừng', 'Huntsman'], ['Chiến Binh Biển', 'Tidewarden'], ['Hiệp Sĩ Lâu Đài', 'Castle Knight'],
    // thuật ngữ
    ['Sổ yêu quái', 'Trang Quái Vật', HOA], ['yêu tinh', 'quái vật', HOA],
    ['Suối hồi', 'Suối Ước', HOA],
    ['Mảnh trống', 'Trang sách', HOA], ['mảnh mặt trời', 'Trang Bìa', HOA], ['Trống đồng', 'Sách Lớn', CS],
    // chiêu "chưởng" → Đạn Mực (tư vấn ChatGPT mục 3.3: đổi tên và nhận diện hoàn toàn)
    ['Hỏa chưởng', 'Đạn Mực Lửa', HOA], ['Hoả chưởng', 'Đạn Mực Lửa', HOA], ['Độc chưởng', 'Đạn Mực Độc', CS], ['Băng chưởng', 'Đạn Mực Băng', HOA],
    ['độc chưởng', 'độc đạn mực', CS], ['Cây chưởng', 'Cây Đạn Mực', HOA], ['điểm chưởng', 'điểm đạn mực', HOA], ['chưởng', 'đạn mực', HOA],
  ]);

  // Nguyên câu (tiếng Việt). Câu cốt truyện cũ nằm ở js/truyen.js đã có bản mới riêng; ở đây là câu lẻ ở các tệp khác.
  const CAU = [
    // [câu Việt cũ, câu Việt mới, câu Anh mới]
    ['Vũ khí lớn lên theo bạn. Yêu tinh học theo bạn.', 'Vũ khí ghi nhớ. Kẻ thù học hỏi.', 'Your blade remembers. Your enemies learn.'],
    ['Cốc cốc cốc! Làng nước nghe đây!', 'Nghe đây, nghe đây! Hollin có tin mới!', 'Hear ye, hear ye! News for Hollin!'],
    ['Cốc cốc cốc! Làng nước nghe đây! Cần chỉnh gì cứ bảo anh.', 'Nghe đây, nghe đây! Cần chỉnh gì cứ bảo anh.', 'Hear ye, hear ye! Need anything changed? Just ask.'],
    ['Cốc cốc! Việc làng hôm nay đây. Xong việc nào thì bấm Nhận nhé.', 'Nghe đây! Việc làng hôm nay đây. Xong việc nào thì bấm Nhận nhé.', "Hear ye! Here are today's jobs. Tap Claim when one is done."],
    ['Có gì cứ gọi anh Mõ!', 'Có gì cứ gọi anh Tom!', 'Need anything? Just call Tom!'],
    ['Bảng vàng treo ở đình, phải có mạng mới xem được, con ạ.', 'Bảng vàng treo ở Nhà Kể Chuyện, phải có mạng mới xem được, con ạ.', 'The Leaderboard hangs in the Storyhouse. You need a connection to see it, child.'],
    ['Đêm xuống, yêu tinh có thể thức dậy mạnh hơn. Muốn thử sức thì gặp chú, chạm "Độ khó 2" nhé!', 'Đêm xuống, quái vật thức dậy mạnh hơn. Muốn thử sức thì gặp bác, chạm "Độ khó 2" nhé!', 'At night the tale-beasts wake stronger. Want a challenge? Tap "Veteran" on my map!'],
    ['Lên đò đi cháu, nước đang êm.', 'Lên đò đi cháu, nước đang êm.', 'Hop aboard, child. The water is calm.'],
    ['Cảm ơn Cu Tí đã cứu tớ! Bố bảo cậu là khách quen của đò nhà tớ.', 'Cảm ơn Rowan đã cứu tớ! Bố bảo cậu là khách quen của đò nhà tớ.', 'Thank you for saving me, Rowan! Dad says you ride our ferry more than anyone.'],
    ['Nghe nói trên Núi Sét sấm nổ suốt đêm... Cu Tí đi thì mang áo mưa nha!', 'Nghe nói trên Núi Bão sấm nổ suốt đêm... Rowan đi thì mang áo mưa nha!', 'They say thunder roars all night on Stormpeak... Bring a raincoat, Rowan!'],
    ['Bố tớ chèo đò giỏi nhất làng đấy!', 'Bố tớ chèo đò giỏi nhất làng đấy!', 'My dad is the best ferryman in Hollin!'],
    ['{0} ngoạm mảnh trống lớn nhất rồi lặn mất!', '{0} ngoạm Trang Bìa rồi lặn mất!', '{0} snatched the Cover and dived away!'],
    ['Phi tiêu mặt trời', 'Phi tiêu sao', 'Star Darts'],
    ['Nón lá', 'Mũ rơm', 'Straw Hat'], ['Nón lá rừng', 'Mũ rơm rừng', 'Forest Straw Hat'],
    ['Khẽ thôi, các bé đang chơi trong sân. Còn {0} bạn bị yêu tinh bắt: hạ trùm vùng để cứu, bạn ấy sẽ dạy cháu.', 'Khẽ thôi, các bạn đang chơi trong sân. Còn {0} bạn bị quái vật bắt: hạ trùm vùng để cứu, bạn ấy sẽ dạy cháu.', 'Hush, the children are playing. {0} friends are still held by tale-beasts: beat a region boss to free one, and they will teach you.'],
    ['Khẽ thôi, các bé đang chơi trong sân.', 'Khẽ thôi, các bạn đang chơi trong sân.', 'Hush, the children are playing.'],
    // Phúc lành: tên theo truyền thuyết Việt → tên cổ tích châu Âu tự đặt (luật chơi giữ nguyên)
    ['Gươm Hồ Gươm', 'Gươm Ánh Trăng', 'Moonlit Blade'],
    ['Nỏ thần Kim Quy', 'Phi Tiêu Nảy', "Hunter's Ricochet"],
    ['Gậy tre Thánh Gióng', 'Móc Khổng Lồ', "Giant's Hook"],
    ['Rìu Thạch Sanh', 'Nhát Bổ Tiều Phu', "Woodcutter's Swing"],
    ['Trống đồng Đông Sơn', 'Gai Ngủ Say', 'Sleeping Thorn'],
    ['Ngựa sắt Thánh Gióng', 'Lông Chim Lửa', 'Firebird Feather'],
    ['Sơn Tinh dời núi', 'Cú Đẩy Khổng Lồ', "Giant's Shove"],
    ['Sóng Thủy Tinh', 'Hài Bảy Dặm', 'Seven-League Boots'],
    ['Cá chép Ông Táo', 'Áo Choàng Gương', 'Mirror Cloak'],
    ['Áo lá Mẫu Thượng Ngàn', 'Áo Choàng Gai', 'Briar Cloak'],
    ['Than hồng Ông Táo', 'Than Lò Sưởi', 'Hearth Embers'],
    ['Hỏa long Lạc Long Quân', 'Tia Lửa Rồng', "Dragon's Spark"],
    ['Nọc Chằn tinh', 'Nồi Thuốc Phù Thuỷ', "Witch's Brew"],
    ['Sương Mẫu Thoải', 'Hơi Thở Nữ Hoàng Băng', "Frost Queen's Breath"],
    // Thẻ Truyện (Tale Cards): CHƯA làm tính năng, chỉ chừa tên
    ['Thẻ Truyện', 'Thẻ Truyện', 'Tale Cards'],
  ];
  const vi = {}, en = {};
  for (const c of CAU) { if (c[1] !== c[0]) vi[c[0]] = c[1]; en[c[0]] = c[2]; en[c[1]] = c[2]; }
  G.ten.thay('vi', vi);
  if (G.ngonNgu) G.ngonNgu.them(en);

  // ---------------- TIẾNG ANH ----------------
  G.ten.thay('en', { 'Linh Khí': 'Talesworn', 'LINH KHÍ': 'TALESWORN', 'We read every note to make Linh Khí better.': 'We read every note to make Talesworn better.' });
  // Chạy SAU khi đã tra từ điển: đổi các tên tiếng Anh cũ (Moc Tinh, Old Forest, Cu Ti, Palm, Spirit…) sang tên mới.
  G.ten.them('en', [
    // "Linh Khí" viết hoa trong bản Anh cũ là TIỀN (linh khí) → Ink; tên game nằm ở câu riêng (G.ten.thay('en') dưới)
    ['Linh Khí', 'Ink', CS], ['Linh Khi', 'Talesworn', CS],
    // nhân vật
    ["Cu Ti's", "Rowan's"], ['Cu Ti', 'Rowan'], ['Cu Tí', 'Rowan'], ['Zed', 'Rowan', CS],
    ['Cu Teo', 'Jory'], ['Cu Tèo', 'Jory'], ['Cai Bong', 'Liesel'], ['Cái Bống', 'Liesel'], ['Cu Li', 'Otto'], ['Cu Lì', 'Otto'],
    ['Little Sen', 'Lettie'], ['Sen', 'Lettie', CS],
    ['the Ferryman', 'Hob', CS], ['The Ferryman', 'Hob', CS], ['Ferryman', 'Hob', CS],
    ['the Smith', 'Master Dorran', CS], ['The Smith', 'Master Dorran', CS], ['the Old Scholar', 'Master Quill', CS],
    ['the Blacksmith', 'Master Dorran', CS], ['The Blacksmith', 'Master Dorran', CS], ['Blacksmith', 'Master Dorran', CS],
    ['the Peddler', 'Granny Marrow', CS], ['The Peddler', 'Granny Marrow', CS], ['Peddler', 'Granny Marrow', CS],
    ['the Tailor', 'Odile', CS], ['The Tailor', 'Odile', CS], ['Tailor', 'Odile', CS],
    ['the Scholar', 'Master Quill', CS], ['The Scholar', 'Master Quill', CS], ['Scholar', 'Master Quill', CS],
    ['the Shrine Keeper', 'Old Ambrose', CS], ['the Temple Keeper', 'Old Ambrose', CS], ['Shrine Keeper', 'Old Ambrose', CS], ['Temple Keeper', 'Old Ambrose', CS],
    ['the Town Crier', 'Crier Tom', CS], ['Town Crier', 'Crier Tom', CS],
    ['your kid', 'Rowan', CS], ['Your kid', 'Rowan', CS], ['Zalo, email', 'email', CS],
    ['Knock knock knock', 'Hear ye, hear ye'], ['Knock knock', 'Hear ye'], ['Clack clack', 'Hear ye'],
    // làng
    ['Banyan tree', 'Old Oak', CS], ['Banyan', 'Old Oak', CS], ['the banyan', 'the old oak', CS], ['banyan', 'old oak', CS],
    ['Village Yard', 'Village Green', CS], ['courtyard', 'village green', CS],
    // vùng
    ['the Old Forest', 'Thornwood', CS], ['Old Forest', 'Thornwood', CS], ['Forest Set', 'Thornwood Set', CS],
    ['Sea Cave Set', 'Grotto Set', CS], ['the Sea Cave', 'the Drowned Grotto', CS], ['Sea Cave', 'Drowned Grotto', CS],
    ['the Ancient Castle', 'Emberhold', CS], ['the Old Castle', 'Emberhold', CS], ['Ancient Castle', 'Emberhold', CS], ['Old Castle', 'Emberhold', CS], ['Castle Set', 'Emberhold Set', CS],
    ['the Deep River', 'Mirefen', CS], ['Deep River', 'Mirefen', CS],
    // trùm
    ['Moc Tinh', 'Grimbark', CS], ['the Tree Spirit', 'Grimbark', CS], ['The Tree Spirit', 'Grimbark', CS], ['Tree Spirit', 'Grimbark', CS],
    ['Ngu Tinh', 'Sir Inkmaw', CS], ['the Fish Spirit', 'Sir Inkmaw', CS], ['The Fish Spirit', 'Sir Inkmaw', CS], ['Fish Spirit', 'Sir Inkmaw', CS],
    ['Ho Tinh', 'Vulpina', CS], ['the Fox Spirit', 'Vulpina', CS], ['The Fox Spirit', 'Vulpina', CS], ['Fox Spirit', 'Vulpina', CS],
    ['the River Serpent', 'the Lindworm', CS], ['The River Serpent', 'The Lindworm', CS], ['River Serpent', 'Lindworm', CS], ['Thuong Luong', 'Lindworm', CS],
    ['Mushroom King', 'Toadstool King', CS], ['Boar Piglet', 'Thorncap Goblin', CS], ['Boar charges straight', 'Thorncap Goblin charges straight', CS],
    ['Spore Flower', 'Spore Puff', CS], ['Spore flower', 'Spore Puff', CS], ['Rock Crab', 'Crystal Crab', CS], ['Fire Tiger', 'Cinder Lion', CS], ['Whisker Catfish', 'Old Mudwhisker', CS],
    ['Black Dragon', 'Inkwyrm', CS],
    // quái
    ['Ghost Lantern', 'Lantern Wisp', CS], ['Two-Tailed Cat', "Witch's Cat", CS], ['Firecracker Imp', 'Goblin Bomber', CS],
    ['Weed-hair River Imp', 'Bog Nixie', CS], ['Bronze-shell Turtle', 'Snapper Turtle', CS], ['Pole Otter', 'Otter Poler', CS],
    ['Rusty Ghost Soldier', 'Rusted Knight', CS], ['Ghost General', 'Phantom Captain', CS],
    // trang phục
    ['Night Ninja', 'Shadow Garb', CS], ['Forest Hunter', 'Huntsman', CS], ['Sea Warrior', 'Tidewarden', CS],
    // thuật ngữ
    ['Monster Book', 'Bestiary', CS], ['Monster book', 'Bestiary', CS], ['monster book', 'bestiary', CS],
    ['Healing Spring', 'Wishing Spring', CS], ['demons', 'tale-beasts', CS], ['demon', 'tale-beast', CS], ['Demons', 'Tale-beasts', CS],
    ['Shuriken Rain', 'Star Rain', CS], ['Shuriken pouch', 'Dart pouch', CS], ['Shuriken', 'Star Darts', CS], ['shuriken', 'darts', CS],
    // hình thái vũ khí: White / Sprout / Formed / Awakened
    ['Plain', 'White', { cs: true, sau: ' hats' }],
    // "Palm" (chưởng) → Ink Bolt
    ['Fire Palm', 'Fire Bolt', CS], ['Poison Palm', 'Poison Bolt', CS], ['Ice Palm', 'Ice Bolt', CS],
    ['Spirit palm', 'ink bolt', CS], ['Palm trees', 'Ink Bolt trees', CS], ['Palm tree', 'Ink Bolt tree', CS],
    ['Palm points', 'Ink Bolt points', CS], ['Palm point', 'Ink Bolt point', CS], ['Palms', 'Ink Bolts', CS], ['Palm', 'Ink Bolt', CS], ['palms', 'ink bolts', CS], ['palm', 'ink bolt', CS],
    // tiền "Spirit" (linh khí) → Ink. Gỗ linh (Spirit Wood) và Bùa linh (Spirit Charm) giữ nguyên.
    ['Spirit Wood', 'Spirit Wood', CS], ['Spirit wood', 'Spirit Wood', CS], ['spirit wood', 'Spirit Wood', CS], ['Spirit Charm', 'Spirit Charm', CS],
    ['Spirit orbs', 'ink drops', CS], ['Spirit orb', 'ink drop', CS], ['spirit orbs', 'ink drops', CS], ['spirit orb', 'ink drop', CS],
    ['spirit energy', 'ink', CS], ['Weapon Spirit', 'Weapon Ink', CS], ['Spirit', 'Ink', CS], ['spirit', 'ink', CS],
  ]);
})();
