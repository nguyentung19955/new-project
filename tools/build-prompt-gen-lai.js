// Sinh prompt GEN LẠI các ảnh dựng xương vẽ sai + bảng rà soát đủ 90 ảnh.
// Nguyên tắc (người dùng, nhánh vu-khi-theo-anh): vật cầm trên tay phải HỢP danh tính / nghề / truyền thuyết của nhân vật
// (lái đò → mái chèo, thợ gốm → bình gốm, thần linh hiền / công chúa không cầm kiếm giáo…); linh thú phải vẽ ra thú, không phải người.
// Ảnh không hợp → gen lại (mã nằm trong CD_SKIP của js/tu-cu-dong.js — game hiện bộ ảnh cũ, dữ liệu game giữ vật đúng);
// ảnh hợp dù khác dữ liệu cũ → giữ ảnh, game sửa theo ảnh.
// Dùng chung STYLE BIBLE + LOCK / NEGATIVE + tư thế A-pose quay phải nền #FF00FF của tools/build-prompt-dung-xuong.js;
// mỗi khối thêm dòng "!!! FIX" (điều ảnh cũ sai + vật đúng phải cầm) và NEGATIVE riêng.
// Chạy: node tools/build-prompt-gen-lai.js  →  docs/PROMPT-GEN-LAI.txt + bảng 90 mã trong docs/xem-truoc-cu-dong/README.md
const fs = require('fs'), path = require('path');
const D = require('./build-prompt-dung-xuong.js');
const ROOT = path.join(__dirname, '..');

// g: loai = sai loài (thú / quái vẽ thành rồng con hoặc người) · vat = vật cầm không hợp nhân vật (hoặc vũ khí rời / thiếu / lệch phong cách)
// why: ảnh hiện tại sai gì (tiếng Việt) · fix: câu nhấn mạnh cho AI · neg: NEGATIVE riêng
const NO_W = ['sword', 'saber', 'spear', 'blade', 'lance', 'glaive'];
const NOT_DRAGON = ['dragon', 'dragon head', 'horns', 'antlers', 'dragon whiskers', 'dragon scales on the head', 'wings'];
const FIX = {
  // ----- đợt 1: 18 mã CD_SKIP cũ + 8 tướng vũ khí bản sắc + 3 quái lai rồng
  rua: { g: 'loai', why: 'rồng con xanh đeo mai rùa — sai loài',
    fix: 'a real TORTOISE: a big round domed SHELL covering the whole back, four short stumpy elephant-like legs, a small turtle head with a beak mouth poking out of the shell — NOT a dragon, NO horns, NO wings, NO long tail', neg: [...NOT_DRAGON, 'long dragon tail', 'standing on two legs'] },
  phuthuy: { g: 'loai', why: 'rồng con xanh, không cành san hô — sai loài + thiếu vật cầm',
    fix: 'a JELLYFISH spirit: a round translucent bell-shaped dome head and many wavy tentacles hanging below instead of legs, ONE tentacle holding a small red coral branch held away from the body — NOT a dragon, NO horns, NO legs, NO human body, NOT a mermaid', neg: [...NOT_DRAGON, 'legs', 'human body', 'mermaid', 'fish tail'] },
  chimbao: { g: 'loai', why: 'rồng con hồng có cánh — sai loài',
    fix: 'a real BIRD: feathered body, a pointed BEAK, two feathered bird wings spread wide, bird talons, a fan of tail feathers, blue-grey feathers (NOT pink) — NOT a dragon, NO horns, NO scales, NO dragon tail', neg: [...NOT_DRAGON.filter((x) => x !== 'wings'), 'bat wings', 'pink body', 'scales', 'dragon tail'] },
  nongnoc: { g: 'loai', why: 'rồng con xanh — sai loài',
    fix: 'a real TADPOLE: a small round black blob body with ONE big shiny eye and a thin wiggly tail, NO legs, NO arms — NOT a dragon, NO horns, NO spikes, NOT green', neg: [...NOT_DRAGON, 'legs', 'arms', 'green body', 'spikes'] },
  ran: { g: 'loai', why: 'rồng con xanh lá — sai loài',
    fix: 'a real SNAKE: a long legless body in an S-curve, smooth round snake head, forked red tongue, yellow belly stripes, NO legs, NO arms — NOT a dragon, NO horns, NO mane, NO whiskers', neg: [...NOT_DRAGON, 'legs', 'arms', 'claws', 'mane'] },
  thachtinh: { g: 'loai', why: 'người có sừng, không phải golem đá — sai loài',
    fix: 'a STONE GOLEM made of grey cracked boulders with green moss, blocky rock limbs, big round stone fists, a rock head with two glowing yellow eyes and no hair — NOT a human, NO horns, NO skin, NO clothes', neg: ['human', 'skin', 'horns', 'hair', 'clothes', 'dragon'] },
  dacon: { g: 'loai', why: 'rồng con xanh — sai loài',
    fix: 'a small round grey ROCK creature: one round pebble body with big cute eyes, stubby stone arms and legs — NOT a dragon, NO horns, NO tail, NO wings, NOT green', neg: [...NOT_DRAGON, 'tail', 'green body'] },
  linhan: { g: 'vat', why: 'người có sừng, KHÔNG cầm giáo — thiếu vũ khí',
    fix: 'a goblin soldier HOLDING A LONG BRONZE SPEAR in the front hand (the whole spear visible, tip pointing forward-up, away from the body) and a round wooden shield in the back hand — the spear must be in the image, NOT a dragon', neg: ['empty hands', 'sword', 'dragon', 'wings', 'human face'] },
  cungan: { g: 'loai', why: 'rồng / người có sừng, không có cung — sai loài + thiếu vũ khí',
    fix: 'a GREY WOLF standing on hind legs with a wolf head (long snout, pointed ears, fangs), bushy tail, HOLDING A WOODEN BOW in the front hand with an arrow nocked and drawn back by the other hand — the bow and arrow clearly visible, NOT a dragon, NO horns, NOT a human', neg: [...NOT_DRAGON, 'human face', 'empty hands', 'sword', 'spear'] },
  voichien: { g: 'loai', why: 'người có sừng — sai loài',
    fix: 'a real ELEPHANT on four thick legs: long trunk, big floppy ears, two tusks with bronze caps, a red and gold saddle tower on its back — NOT a human, NO horns, NOT standing on two legs', neg: ['human', 'standing on two legs', 'horns', 'dragon', 'arms holding weapons'] },
  camap: { g: 'loai', why: 'rồng con xanh có vây cá — sai loài',
    fix: 'a real SHARK: a grey torpedo shark body with a big dorsal fin, side fins, a crescent tail fin it stands on, a toothy shark grin — NOT a dragon, NO horns, NO legs, NO arms, NOT a mermaid', neg: [...NOT_DRAGON, 'legs', 'arms', 'mermaid', 'human torso'] },
  cua: { g: 'loai', why: 'rồng con đỏ có 1 càng — sai loài',
    fix: 'a real CRAB with TWO big pincers and a wide round SHELL, eight thin jointed walking legs on the sides, two eyes on short stalks, tiny bronze helmet on the shell, NO tail (ignore the tail in the RIG POSE line) — NOT a dragon, NO horns, NO dragon head', neg: [...NOT_DRAGON, 'tail', 'only one claw', 'human body'] },
  cao: { g: 'loai', why: 'rồng con hồng có sừng — sai loài',
    fix: 'a real FOX: orange fur, a pointed fox snout, two big pointed fox ears, a big fluffy fox tail with a white tip, standing on hind legs — NOT a dragon, NO horns, NO scales, NOT pink', neg: [...NOT_DRAGON, 'scales', 'pink body'] },
  hotinh: { g: 'loai', why: 'rồng nhiều tay cầm giáo — sai loài (boss)',
    fix: 'a WHITE FOX demon with a fox head (pointed snout, tall fox ears), standing on two legs, exactly NINE fluffy white fox tails fanned out behind, two normal arms with one empty clawed hand raised — NOT a dragon, NO horns, NO spear, NO extra arms', neg: [...NOT_DRAGON, 'spear', 'weapon', 'extra arms', 'many arms', 'scales'] },
  chantinh: { g: 'loai', why: 'người-rồng cầm giáo — sai loài + sai vũ khí (boss)',
    fix: 'a big green OGRE (troll): fat round belly, tusks, ONE short horn, loincloth, HOLDING A HUGE STONE CLUB in the front hand (swung like an axe) — NOT a dragon, NO wings, NO tail, NO spear', neg: ['dragon', 'dragon head', 'wings', 'tail', 'scales', 'spear', 'sword'] },
  nguphu: { g: 'loai', why: 'vẽ thành tiên cá cầm đinh ba — sai loài',
    fix: 'a HUMAN fisherman with TWO HUMAN LEGS and bare feet (NOT a fish tail), a fishing net over one shoulder, HOLDING a three-pronged fish spear in the front hand — NOT a mermaid, NO fish tail, NO scales', neg: ['mermaid', 'merman', 'fish tail', 'scales', 'fins on the body'] },
  tre: { g: 'vat', why: 'kiếm cắm đất bên cạnh, tay không cầm gì — vũ khí rời',
    fix: 'the boy HOLDS the long green BAMBOO POLE with his front hand (fingers wrapped around it), the pole pointing forward-up, away from the body — the pole is IN HIS HAND, not stuck in the ground; NO sword', neg: ['sword', 'weapon stuck in the ground', 'weapon lying beside him', 'empty hands'] },
  dotnuong: { g: 'vat', why: 'kiểu 3D bóng, cầm giáo — lệch phong cách + sai vũ khí',
    fix: 'FLAT 2D chibi cel-shaded drawing with thick dark outlines and flat colors, exactly like the other characters — NOT 3D, NOT glossy, NOT a render; HOLDING a curved MACHETE in the front hand and a burning torch in the back hand — NO spear', neg: ['3D render', 'glossy', 'plastic', 'realistic lighting', 'soft shading', 'spear', 'lance'] },
  xathu: { g: 'vat', why: 'cầm đao, không có cung — Xạ Thủ là lớp cung thủ duy nhất bắn quái bay ở đầu game (vai trò Tầm xa)',
    fix: 'HOLDING A BIG WOODEN BOW in the front hand with an ARROW nocked and drawn back by the other hand, the whole bow and arrow clearly visible and away from the body — NO saber, NO sword', neg: ['saber', 'sword', 'machete', 'empty hands'] },
  adv: { g: 'vat', why: 'cầm kiếm — An Dương Vương gắn với nỏ thần Linh Quang (nội tại "Nỏ Linh Quang" bắn xuyên hàng)',
    fix: 'HOLDING THE MAGIC CROSSBOW horizontally in the front hand (bronze crossbow with a golden turtle-claw trigger), aimed forward — the crossbow clearly visible; NO sword', neg: ['sword', 'saber', 'spear', 'empty hands'] },
  caolo: { g: 'vat', why: 'cầm kiếm trong vỏ — Cao Lỗ là người chế nỏ thần (dòng Cao Lỗ xuyên giáp)',
    fix: 'HOLDING A WIDE MECHANICAL CROSSBOW horizontally in the front hand with visible bronze gears and a crank — NO sword, NO scabbard', neg: ['sword', 'scabbard', 'sheathed sword', 'empty hands'] },
  thoren: { g: 'vat', why: 'cầm giáo — Thợ Rèn gắn với búa lò rèn',
    fix: 'HOLDING A GIANT BLACKSMITH SLEDGEHAMMER with a red-hot glowing head in the front hand — NO spear', neg: ['spear', 'lance', 'sword', 'empty hands'] },
  thienloi: { g: 'vat', why: 'cầm kiếm ngang — Thiên Lôi gắn với lưỡi / búa tầm sét (nội tại "Búa Tầm Sét", R "Búa Thiên Lôi")',
    fix: 'HOLDING A GIANT STONE THUNDER AXE (lưỡi tầm sét) on a short staff in the front hand — NO sword', neg: ['sword', 'saber', 'spear', 'empty hands'] },
  thachsanh: { g: 'vat', why: 'cầm giáo — Thạch Sanh là tiều phu: rìu đốn củi (Q "Rìu Đốn Củi") + cung tên vàng',
    fix: 'HOLDING A HUGE WOODCUTTER AXE with a wide blade in the front hand, a round moon-lute slung on the back — NO spear', neg: ['spear', 'lance', 'sword', 'empty hands'] },
  potaoapui: { g: 'vat', why: 'cầm giáo — Pơ Tao Apui (Vua Lửa) giữ gươm thần (nội tại "Gươm Thần Gia Rai", Q "Gươm Lửa")',
    fix: 'HOLDING A LARGE FLAMING SACRED SWORD in the front hand — NO spear', neg: ['spear', 'lance', 'trident', 'empty hands'] },
  cdt: { g: 'vat', why: 'cầm giáo — Chử Đồng Tử gắn với gậy thần + nón thần (nội tại / Q "Gậy Thần")',
    fix: 'HOLDING A TALL SACRED WOODEN STAFF (a plain staff with NO blade) in the front hand and the glowing conical hat in the back hand — NO spear, NO blade on the staff', neg: ['spear', 'spear tip', 'blade', 'lance', 'sword'] },
  casau: { g: 'loai', why: 'rồng con hồng mõm cá sấu, có sừng — lai rồng',
    fix: 'a real CROCODILE: long flat green body on four short legs, a long flat toothy snout, bumpy back scales, a long thick tail — NOT a dragon, NO horns, NO wings, NOT pink', neg: [...NOT_DRAGON, 'pink body', 'standing on two legs'] },
  doi: { g: 'loai', why: 'rồng con có cánh dơi — lai rồng',
    fix: 'a real BAT: a small furry purple body, big pointed bat ears, a tiny pug nose with fangs, two leathery bat wings — NOT a dragon, NO horns, NO scales, NO long tail', neg: NOT_DRAGON.filter((x) => x !== 'wings').concat(['scales', 'long tail', 'feathers']) },
  echme: { g: 'loai', why: 'ếch có đuôi rồng, đội mũ — lệch loài',
    fix: 'a real TOAD: a fat round green body with a yellow belly, warts, a wide mouth, bent froggy back legs, NO tail (ignore the tail in the RIG POSE line), NO hat — NOT a dragon', neg: ['tail', 'dragon tail', 'hat', 'helmet', 'horns', 'dragon'] },
  // ----- đợt 2 (rà lại cả 90: vật cầm phải hợp danh tính / nghề / truyền thuyết)
  // linh thú bị vẽ thành NGƯỜI mặc đồ thú
  kimquy: { g: 'loai', why: 'người đuôi rồng cầm đinh ba — Kim Quy là RÙA VÀNG thần',
    fix: 'a giant GOLDEN TURTLE god (a real turtle body on four legs with a big golden domed shell, wise old turtle head, small crown), ONE front claw raised and glowing — NOT a human, NO trident, NO weapon, NOT a dragon', neg: ['human body', 'human face', 'trident', 'spear', 'weapon', 'dragon tail', 'horns'] },
  nghedong: { g: 'loai', why: 'người cầm song kiếm — Nghê Đồng là LINH THÚ bằng đồng (chó-sư tử canh đình)',
    fix: 'a BRONZE NGHE guardian BEAST (like a Vietnamese temple lion-dog) standing on four legs, curly bronze mane, big round eyes, open mouth, bronze-green patina — NOT a human, NO swords, NO weapon', neg: ['human body', 'human face', 'sword', 'swords', 'weapon', 'standing on two legs'] },
  kylan: { g: 'loai', why: 'người đội mũ kỳ lân cầm giáo — Kỳ Lân là LINH THÚ',
    fix: 'a golden QILIN (ky lan) BEAST on four hooved legs: deer-like body with golden scales, flowing mane, a single small horn, a fluffy tail — NOT a human, NO spear, NO weapon', neg: ['human body', 'human face', 'spear', 'weapon', 'armor on a person', 'standing on two legs'] },
  halong: { g: 'loai', why: 'người đội mũ rồng cầm giáo — Rồng Mẹ Hạ Long là RỒNG',
    fix: 'a big gentle MOTHER DRAGON (long serpentine Vietnamese dragon body in an open S-curve, mane, whiskers, a glowing pearl held in one front claw) — NOT a human, NO spear, NO weapon', neg: ['human body', 'human face', 'spear', 'weapon', 'person in a dragon costume'] },
  caong: { g: 'loai', why: 'người râu cầm giáo — Cá Ông là CÁ VOI thần',
    fix: 'a kind giant WHALE spirit (a chubby blue-grey whale body upright on its tail, flippers, a small water spout, a gentle old face with a short beard) — NOT a human, NO spear, NO weapon', neg: ['human body', 'human legs', 'spear', 'weapon'] },
  ongho: { g: 'loai', why: 'người khăn vàng cầm kiếm — Chúa Sơn Lâm (Ông Ba Mươi) là HỔ',
    fix: 'a big striped TIGER standing on four legs: orange fur with black stripes, white chest, claws, fangs, the 王 mark on the forehead — NOT a human, NO sword, NO weapon', neg: ['human body', 'human face', 'sword', 'weapon', 'clothes'] },
  thuongluong: { g: 'loai', why: 'người sừng đuôi rồng cầm giáo rìu — Thuồng Luồng là THUỒNG LUỒNG (rắn nước khổng lồ)',
    fix: 'a giant water SERPENT monster: a long scaly legless body in an S-curve, flat serpent head with fins, NO arms, NO legs — NOT a human, NO weapon', neg: ['human body', 'arms', 'legs', 'weapon', 'spear', 'axe'] },
  daibang: { g: 'loai', why: 'người-rồng có cánh cầm giáo — Đại Bàng Tinh là CHIM ĐẠI BÀNG khổng lồ',
    fix: 'a giant EAGLE demon: feathered body, hooked beak, huge feathered wings spread, big talons, fierce eyes — NOT a human, NOT a dragon, NO spear, NO weapon', neg: [...NOT_DRAGON.filter((x) => x !== 'wings'), 'human body', 'spear', 'weapon'] },
  // vật cầm không hợp nhân vật (dân thường / nghề nghiệp / thần linh hiền cầm kiếm, giáo)
  thansuong: { g: 'vat', why: 'cầm giáo — Thần Sương là thần sương núi, phép băng',
    fix: 'holding a small glowing ICE CRYSTAL in the cupped front hand (frost mist around it) — NO spear, NO weapon', neg: [...NO_W] },
  antiem: { g: 'vat', why: 'cầm giáo — Mai An Tiêm là người trồng dưa trên đảo',
    fix: 'holding ONE big striped green WATERMELON in the front hand ready to throw — NO spear, NO weapon', neg: [...NO_W] },
  auco: { g: 'vat', why: 'cầm giáo — Âu Cơ là Mẹ Tiên (bọc trăm trứng)',
    fix: 'a gentle fairy MOTHER holding a CRANE-FEATHER WAND in the front hand and a small cloth pouch of eggs in the back hand — NO spear, NO weapon', neg: [...NO_W] },
  tiendung: { g: 'vat', why: 'cầm kiếm — Tiên Dung là công chúa (quạt tiên, mưa hoa)',
    fix: 'a gentle PRINCESS holding a big round silk FAN in the front hand — NO sword, NO weapon', neg: [...NO_W] },
  langlieu: { g: 'vat', why: 'cầm giáo — Lang Liêu là hoàng tử hiền làm bánh chưng',
    fix: 'a humble prince holding a TRAY with a square BANH CHUNG cake (green leaf-wrapped) in the front hand — NO spear, NO weapon', neg: [...NO_W] },
  mychau: { g: 'vat', why: 'cầm kiếm — Mỵ Châu là công chúa (áo lông ngỗng)',
    fix: 'a gentle PRINCESS in a white goose-feather cloak, the front hand open scattering white feathers — NO sword, NO weapon', neg: [...NO_W] },
  sodua: { g: 'vat', why: 'cầm giáo — Sọ Dừa là chàng trai hiền thổi sáo',
    fix: 'holding a green COCONUT in the front hand (ready to throw) and a bamboo flute tucked in the belt — NO spear, NO weapon', neg: [...NO_W] },
  dapde: { g: 'vat', why: 'giáp vàng cầm gậy chĩa đầu thú — Người Đắp Đê là nông dân đắp đê',
    fix: 'a sturdy FARMER (simple brown clothes, NO golden armor, NO helmet) holding a wooden SHOVEL / HOE in the front hand — NO spear, NO trident, NO weapon', neg: [...NO_W, 'trident', 'golden armor', 'helmet'] },
  ongdung: { g: 'vat', why: 'cầm giáo — Ông Đùng là người khổng lồ gánh đất',
    fix: 'a kind GIANT holding a long bamboo CARRYING POLE with two baskets of earth in the front hand — NO spear, NO weapon', neg: [...NO_W] },
  thocong: { g: 'vat', why: 'cầm đại đao — Thổ Công là thần đất giữ nhà hiền lành',
    fix: 'a kind old earth god holding a short BAMBOO STAFF with a gourd tied on top in the front hand — NO guandao, NO blade, NO weapon', neg: [...NO_W, 'guandao', 'halberd'] },
  maudia: { g: 'vat', why: 'nam giới cầm kiếm — Mẫu Địa là Thánh MẪU (nữ thần đất)',
    fix: 'a gentle MOTHER GODDESS (a WOMAN, earthy brown-gold dress) holding a clay JAR of seeds in the front hand — NO sword, NO weapon, NOT a man', neg: [...NO_W, 'man', 'male', 'beard'] },
  chodo: { g: 'vat', why: 'giáp cầm đao — Chàng Chèo Đò là người lái đò',
    fix: 'a simple FERRYMAN (plain clothes, NO armor) holding a long wooden boat OAR in the front hand — NO saber, NO sword, NO weapon', neg: [...NO_W, 'armor'] },
  truongchi: { g: 'vat', why: 'giáp cầm giáo — Trương Chi là chàng đánh cá hát hay thổi sáo',
    fix: 'a poor FISHERMAN singer (plain clothes, NO armor) holding a long BAMBOO FLUTE in the front hand — NO spear, NO weapon', neg: [...NO_W, 'armor'] },
  longnu: { g: 'vat', why: 'nam giới cầm kiếm — Long Nữ là nữ thần rồng (ngọc rồng)',
    fix: 'a graceful DRAGON LADY (a WOMAN with small dragon horns and flowing sea-blue robes) holding a big glowing DRAGON PEARL with both hands — NO sword, NO weapon, NOT a man', neg: [...NO_W, 'man', 'male'] },
  viemde: { g: 'vat', why: 'cầm giáo ngắn — Viêm Đế Thần Nông là thần nông (dạy cày cấy)',
    fix: 'a farming god holding a FARMING HOE whose blade glows with fire in the front hand — NO spear, NO weapon', neg: [...NO_W] },
  ongtao: { g: 'vat', why: 'cầm đại đao — Ông Táo là thần bếp',
    fix: 'a kind old kitchen god holding long iron FIRE TONGS gripping a glowing coal in the front hand — NO guandao, NO blade, NO weapon', neg: [...NO_W, 'guandao', 'halberd'] },
  matroi: { g: 'vat', why: 'cầm giáo — Nữ Thần Mặt Trời dắt mặt trời',
    fix: 'a sun GODDESS holding a golden SUN SCEPTER (a staff topped with a radiant sun disc) in the front hand — NO spear, NO weapon', neg: [...NO_W] },
  mauthoai: { g: 'vat', why: 'nam giới cầm giáo — Mẫu Thoải là Thánh MẪU sông nước',
    fix: 'a water MOTHER GODDESS (a WOMAN in white-blue robes) holding a silver WATER-LADLE STAFF in the front hand — NO spear, NO weapon, NOT a man', neg: [...NO_W, 'man', 'male'] },
  trutroi: { g: 'vat', why: 'cầm kiếm — Thần Trụ Trời là người khổng lồ đắp cột chống trời',
    fix: 'a huge GIANT holding a thick stone SKY PILLAR (a column) in the front hand like a club — NO sword, NO weapon', neg: [...NO_W] },
  mau: { g: 'vat', why: 'nam giới cầm kiếm — Mẫu Thượng Ngàn là bà chúa núi rừng',
    fix: 'a forest MOTHER GODDESS (a WOMAN in green leafy robes with a flower crown) holding a blossoming FLOWER BRANCH in the front hand — NO sword, NO weapon, NOT a man', neg: [...NO_W, 'man', 'male'] },
};

// Rà cả 90 ảnh dựng xương (assets/<mã>.png): [vật cầm / dáng trong ẢNH, vật hợp lý theo danh tính / nghề / truyền thuyết]
// Mã có trong FIX = gen lại (đang chặn bằng CD_SKIP, game giữ vật đúng); còn lại = giữ ảnh (game sửa theo ảnh nếu khác dữ liệu cũ).
const TABLE = {
  // tướng Thường
  lactuong: ['rìu đồng', 'rìu xéo Đông Sơn'], lucsi: ['tay không (giáo đeo lưng)', 'tay không / tảng đá'], xathu: ['đao', 'cung'],
  thosan: ['cung + ống tên', 'cung / dao săn — cung hợp thợ săn → game đổi sang cung'], thaymo: ['gậy đầu rồng lửa', 'gậy hồ lô lửa'],
  thansuong: ['giáo', 'tinh thể băng / phép sương'], giaodong: ['giáo đồng', 'giáo đồng'], chuongdong: ['chiêng đồng', 'chuông / chiêng'],
  tre: ['kiếm cắm đất, tay không', 'sào tre cầm tay'], ongthoi: ['nỏ', 'ống thổi / nỏ săn — vẫn là vũ khí săn bắn xa'],
  thachsanh: ['giáo', 'rìu tiều phu'], antiem: ['giáo', 'quả dưa hấu'], sodua: ['giáo', 'quả dừa / sáo'], cuoi: ['đòn gánh + giỏ', 'rìu / đòn gánh tiều phu — hợp'],
  melua: ['liềm + gùi lúa', 'bó lúa / liềm — hợp'], thaylang: ['gậy chống', 'gậy chống'], dapde: ['giáp vàng + gậy chĩa đầu thú', 'xẻng / cuốc nông dân'],
  chantrau: ['gậy đầu trâu', 'gậy chăn trâu / ná — gậy hợp → game đổi cận chiến'], ongdung: ['giáo', 'đòn gánh đất'], thogom: ['bình gốm + đĩa gốm', 'bình gốm — khớp game (ném bình)'],
  chodo: ['giáp + đao', 'mái chèo'], haisen: ['tay không, lư đồng bên cạnh', 'ô lá sen / bông sen — không cầm vũ khí, hợp'], nguphu: ['tiên cá + đinh ba', 'người + chĩa ba / lưới'],
  dotnuong: ['giáo (kiểu 3D bóng)', 'dao rựa + đuốc'], denroi: ['đèn lồng', 'đèn trời'],
  // tướng Tím
  caolo: ['kiếm trong vỏ', 'nỏ máy'], cdt: ['giáo', 'gậy thần + nón'], tiendung: ['kiếm', 'quạt tiên'], langlieu: ['giáo', 'mâm bánh chưng'],
  nghedong: ['NGƯỜI cầm song kiếm', 'linh thú Nghê bằng đồng'], mychau: ['kiếm', 'áo lông ngỗng, tay rắc lông'], thocong: ['đại đao', 'gậy tre hồ lô'],
  truongchi: ['giáp + giáo', 'sáo trúc'], potaoapui: ['giáo', 'gươm thần (lửa)'], baahoa: ['đuốc lửa', 'lửa trong tay — hợp'],
  trongdong: ['trống cầm tay', 'dùi trống / trống'], caong: ['NGƯỜI cầm giáo', 'cá voi thần'], ongtao: ['đại đao', 'kẹp than / quạt bếp'],
  lachau: ['búa / rìu đá', 'búa đá + khiên đồng'], thansan: ['đao', 'giáo / dao săn — đao rừng hợp thợ săn'], lyngu: ['giáo', 'đao cán dài — tướng võ, hợp'],
  giong: ['giáo', 'gậy sắt / tre — hợp'], ongho: ['NGƯỜI cầm kiếm', 'hổ'],
  // tướng Vàng
  llq: ['giáo', 'kiếm / giáo — vua rồng chiến binh, hợp'], kimquy: ['NGƯỜI đuôi rồng cầm đinh ba', 'rùa vàng thần'], adv: ['kiếm', 'nỏ thần Linh Quang'],
  auco: ['giáo', 'đũa lông hạc / bọc trứng'], kylan: ['NGƯỜI cầm giáo', 'linh thú kỳ lân'], thienloi: ['kiếm cầm ngang', 'lưỡi / búa tầm sét'],
  cuoi_: null, mau: ['NAM cầm kiếm', 'nữ thần cầm cành hoa'], matroi: ['giáo', 'quyền trượng mặt trời'], mauthoai: ['NAM cầm giáo', 'nữ thần, gậy gáo nước'],
  trutroi: ['kiếm', 'cột trời'], kinhduong: ['đại đao lưỡi lá', 'kiếm / đao — vua chiến binh, hợp'], viemde: ['giáo ngắn', 'cuốc lửa'],
  halong: ['NGƯỜI đội mũ rồng cầm giáo', 'rồng'], longnu: ['NAM cầm kiếm', 'nữ thần cầm ngọc rồng'], tanvien: ['giáo', 'giáo / gậy — thần núi chiến đấu, hợp'],
  maudia: ['NAM cầm kiếm', 'nữ thần cầm chum hạt giống'], thoren: ['giáo', 'búa rèn'],
  // quái
  camap: ['rồng con vây cá', 'cá mập'], cao: ['rồng con hồng', 'cáo'], cua: ['rồng con 1 càng', 'cua'], kybinh: ['người đầu lợn rừng', 'quỷ lợn rừng — hợp (game đổi tên)'],
  voichien: ['người có sừng', 'voi chiến'], tom: ['tôm có càng', 'tôm, càng — hợp'], casau: ['rồng hồng mõm cá sấu', 'cá sấu'], rua: ['rồng con mai rùa', 'rùa'],
  phuthuy: ['rồng con', 'sứa tinh + cành san hô'], chimbao: ['rồng con có cánh', 'chim bão'], echme: ['ếch đuôi rồng đội mũ', 'ếch'], nongnoc: ['rồng con', 'nòng nọc'],
  giaolong: ['rồng con', 'giao long — hợp'], yeutinh: ['yêu tinh lá rừng, tay không', 'yêu tinh rừng — hợp'], ran: ['rồng con', 'rắn'], doi: ['rồng cánh dơi', 'dơi'],
  thachtinh: ['người có sừng', 'golem đá'], dacon: ['rồng con', 'đá con'], linhan: ['người có sừng, không giáo', 'quỷ giáo cầm giáo + khiên'], cungan: ['rồng/người, không cung', 'sói cầm cung'],
  muc: ['bạch tuộc', 'mực / bạch tuộc — hợp'],
  // boss
  anvuong: ['quỷ vương sừng cầm kích', 'kích — hợp'], chantinh: ['người-rồng cầm giáo', 'chằn tinh cầm chuỳ đá'], haba: ['quỷ sừng cầm giáo', 'đinh ba / giáo — hợp'],
  ngutinh: ['ngư tinh cầm đinh ba', 'hợp'], thuongluong: ['người sừng đuôi rồng cầm giáo rìu', 'thuồng luồng (rắn nước)'], thuytinh: ['thủy thần cầm giáo', 'đinh ba / giáo — hợp'],
  trieuda: ['hổ vương cầm kích', 'kích / đao — hợp'], daibang: ['người-rồng có cánh cầm giáo', 'chim đại bàng'], hotinh: ['rồng nhiều tay cầm giáo', 'hồ ly chín đuôi'],
};
delete TABLE.cuoi_;

const GROUPS = [
  ['1. Sai loài — thú / quái / linh thú bị vẽ thành rồng con hoặc thành người', 'loai'],
  ['2. Vật cầm không hợp nhân vật — kiếm / giáo trong tay dân thường, nghề nghiệp, thần linh hiền; vũ khí rời / thiếu; lệch phong cách', 'vat'],
];
const isHero = (k) => !!D.HEROES[k];
const isBoss = (k) => !!D.REDO_BOSS[k];
const nameOf = (k) => (D.HEROES[k] || D.ENEMIES[k]).name;
// chèn dòng FIX ngay sau dòng đầu (tên nhân vật) để AI đọc trước, NEGATIVE riêng nối sau khối NEGATIVE chung
function prompt(k) {
  const f = FIX[k];
  const base = isHero(k) ? D.heroPrompt(k) : D.foePrompt(k, isBoss(k) ? D.REDO_BOSS[k] : D.REDO_ENEMY[k], isBoss(k));
  const lines = base.split('\n');
  const at = lines.findIndex((l) => l.startsWith('NEGATIVE FOR RIGGING'));
  lines.splice(at + 1, 0, `NEGATIVE FOR THIS CHARACTER (do NOT draw): ${f.neg.join(', ')}.`);
  lines.splice(1, 0, `!!! FIX — the previous image of this character was WRONG. This time draw: ${f.fix}. This FIX line wins over anything below.`);
  return lines.join('\n');
}
const weapon = (k) => (isHero(k) ? D.wkLine(D.HERO_WEAPON[k]) : D.wkLine(D.FOE[k].slice(1)));
const kindName = (k) => (isHero(k) ? `Tướng ${D.HEROES[k].legend === 'legendary' ? 'Vàng' : D.HEROES[k].legend === 'epic' ? 'Tím' : 'Thường'}` : isBoss(k) ? 'Boss' : 'Quái');

// ---- kiểm tra: đủ 90 mã, FIX ⊂ TABLE, CD_SKIP trong game = đúng các mã gen lại
const ALL = [...Object.keys(D.HEROES), ...Object.keys(D.REDO_ENEMY), ...Object.keys(D.REDO_BOSS)].filter((k) => fs.existsSync(path.join(ROOT, 'assets', k + '.png')));
const die = (m) => { console.error(m); process.exit(1); };
for (const k of ALL) if (!TABLE[k]) die('Thiếu dòng rà soát cho ' + k);
for (const k of Object.keys(FIX)) { if (!TABLE[k]) die('FIX không có trong bảng: ' + k); if (!isHero(k) && !D.FOE[k]) die('Không có dữ liệu prompt cho ' + k); }
const skipSrc = fs.readFileSync(path.join(ROOT, 'js/tu-cu-dong.js'), 'utf8').match(/const CD_SKIP = new Set\(\[([\s\S]*?)\]\)/)[1];
const SKIP = new Set([...skipSrc.matchAll(/'([\w-]+)'/g)].map((m) => m[1]));
const miss = Object.keys(FIX).filter((k) => !SKIP.has(k)), extra = [...SKIP].filter((k) => !FIX[k]);
if (miss.length || extra.length) die(`CD_SKIP lệch danh sách gen lại — thiếu: ${miss} · thừa: ${extra}`);

const LINE = '='.repeat(60), DASH = '-'.repeat(60);
const total = Object.keys(FIX).length, keep = ALL.filter((k) => !FIX[k]);
const row = (k) => `${k} · ${nameOf(k)} · ảnh: ${TABLE[k][0]} · hợp lý: ${TABLE[k][1]} · ${FIX[k] ? 'GEN LẠI' : 'giữ'}`;
let txt = `PROMPT GEN LẠI ẢNH DỰNG XƯƠNG — ${total} / ${ALL.length} ảnh (sinh bằng: node tools/build-prompt-gen-lai.js — đừng sửa tay)
${GROUPS.map(([n, g]) => `  ${n}: ${Object.values(FIX).filter((f) => f.g === g).length}`).join('\n')}
  Giữ ảnh: ${keep.length}

Nguyên tắc: vật cầm trên tay phải HỢP danh tính / nghề / truyền thuyết (lái đò → mái chèo, thợ gốm → bình gốm, thần linh hiền /
công chúa không cầm kiếm giáo); linh thú vẽ ra thú, không vẽ người mặc đồ thú. Mã gen lại đang nằm trong CD_SKIP (js/tu-cu-dong.js):
game hiện bộ ảnh cũ (packs/) và giữ kiểu đánh / đạn / tên kỹ năng theo vật đúng — gen ảnh mới xong thì bỏ mã khỏi CD_SKIP, soát rig.

${LINE}
TÓM TẮT CẢ ${ALL.length} MÃ (mã · tên · vật trong ảnh · vật hợp lý · quyết định)
${LINE}
GEN LẠI (${total}):
${ALL.filter((k) => FIX[k]).map((k) => '  ' + row(k)).join('\n')}
GIỮ (${keep.length}):
${keep.map((k) => '  ' + row(k)).join('\n')}

${LINE}
CÁCH DÙNG
${LINE}
Giống docs/PROMPT-DUNG-XUONG.txt: mỗi khối giữa hai đường gạch là MỘT ảnh — chép nguyên khối dán vào AI tạo ảnh (đính kèm ảnh mẫu
phong cách docs/mau-lac-tuong.png nếu được), lưu đúng "Tên file" (= mã trong game) vào assets/, ghi đè ảnh cũ.
Dòng "!!! FIX" nói điều ảnh cũ đã vẽ sai và vật đúng phải cầm — kiểm tra kỹ đúng điều đó trước khi lưu.
Sau khi thay ảnh: bỏ mã khỏi CD_SKIP trong js/tu-cu-dong.js, soát lại rig trong js/rigs.js (tools/rig-tay.html), chạy lại script này.
`;
for (const [name, g] of GROUPS) {
  const ks = ALL.filter((k) => FIX[k] && FIX[k].g === g);
  txt += `\n${LINE}\n${name.toUpperCase()} (${ks.length})\n${LINE}\n`;
  for (const k of ks) txt += `\n### ${kindName(k)} · ${nameOf(k)}\nTên file: ${k}.png\n${weapon(k)}\nẢnh cũ sai: ${FIX[k].why}\n${DASH}\n${prompt(k)}\n${DASH}\n`;
}
// bảng 90 mã trong README xem trước (giữa 2 dòng đánh dấu)
const md = `<!-- bang-90 (node tools/build-prompt-gen-lai.js — đừng sửa tay) -->
## Rà soát cả ${ALL.length} ảnh: vật cầm có hợp nhân vật không (gen lại ${total} · giữ ${keep.length})

| Mã | Tên | Vật / dáng trong ảnh | Vật hợp lý | Quyết định |
|---|---|---|---|---|
${ALL.map((k) => `| ${k} | ${nameOf(k)} | ${TABLE[k][0]} | ${TABLE[k][1]} | ${FIX[k] ? '**gen lại** — ' + FIX[k].why : 'giữ'} |`).join('\n')}
<!-- /bang-90 -->`;
if (require.main === module) {
  fs.writeFileSync(path.join(ROOT, 'docs/PROMPT-GEN-LAI.txt'), txt);
  const rp = path.join(ROOT, 'docs/xem-truoc-cu-dong/README.md');
  let r = fs.readFileSync(rp, 'utf8');
  r = /<!-- bang-90/.test(r) ? r.replace(/<!-- bang-90[\s\S]*?<!-- \/bang-90 -->/, md) : r.replace(/\n## /, `\n${md}\n\n## `);
  fs.writeFileSync(rp, r);
  console.log('docs/PROMPT-GEN-LAI.txt + bảng README:', GROUPS.map(([, g]) => `${g} ${Object.values(FIX).filter((f) => f.g === g).length}`).join(' · '), '· gen lại', total, '· giữ', keep.length);
}
module.exports = { FIX, TABLE, prompt };
