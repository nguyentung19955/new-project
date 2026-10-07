// Sinh bộ prompt Gemini (mỗi ảnh một prompt tự đủ) từ dữ liệu game + mô tả trong docs/PROMPT_GEMINI_V94.md.
// Chạy: node tools/build-prompts.js  →  docs/PROMPT_GEMINI_FULL.md (+ .txt) + (tùy chọn) trang HTML có nút sao chép.
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '..');
const ctx = { console, window: {}, document: { createElement: () => ({ getContext: () => ({}) }) }, Image: function () {}, localStorage: { getItem() {}, setItem() {} }, navigator: {} };
vm.createContext(ctx);
for (const f of ['art', 'data', 'enemies2']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f + '.js'), 'utf8').replace(/^(const|let) /gm, 'var '), ctx);
const { HEROES, ENEMIES, LEGACY, RUNES } = ctx;
const packs = new Set(fs.readdirSync(path.join(ROOT, 'assets/packs')).filter((d) => ['idle.png', 'walk1.png'].some((f) => fs.existsSync(path.join(ROOT, 'assets/packs', d, f)))));
const md = fs.readFileSync(path.join(ROOT, 'docs/PROMPT_GEMINI_V94.md'), 'utf8');

// mô tả nhân vật đã viết trong docs (dòng thứ 2 của khối HERO SHEET)
const DESC = {};
for (const m of md.matchAll(/### [^\n]*\(`(\w+)`\)[^\n]*\n```\n[^\n]*\n([^\n]+)\n```/g)) DESC[m[1]] = m[2];
const ICONS = {}, RELICS = {};
for (const m of md.matchAll(/^\| (\w+) \| ([^|\n]+) \|$/gm)) {
  const parts = m[2].split(' · ').map((x) => x.trim());
  if (parts.length === 4) ICONS[m[1]] = parts; else if (parts.length === 3) RELICS[m[1]] = parts;
}
const ENEMY_DESC = {};
for (const m of md.matchAll(/^\| (yeutinh|dacon|linhan) \| ([^|\n]+) \|$/gm)) ENEMY_DESC[m[1]] = m[2];
// v101: Kim + Mộc (chưa có trong docs)
Object.assign(DESC, {
  giaodong: 'Dũng Sĩ Giáo Đồng: young bronze-age spearman, silver-grey tunic with bronze plates, bronze helmet with a short feather, round bronze shield. Weapon: long bronze spear. Cast effect: spinning spear with silver sparks.',
  chuongdong: 'Thầy Chuông Đồng: elderly village ritual master, white-grey robe with bronze zigzag trims, small cap. Weapon: staff with a ringing bronze bell hanging on top. Cast effect: golden sound rings from the bell.',
  nghedong: 'Nghê Đồng: cute bronze guardian lion-dog of a village temple (Vietnamese nghê), standing upright, curly bronze mane, silver-white chest plate, small bell collar. Weapon: none, fights with paws. Cast effect: bronze shockwave from a roar.',
  mychau: 'Mỵ Châu: gentle Au Lac princess in a white goose-feather cloak over a silver-white dress, pearl hairpins, small silver crown. Weapon: none, throws glowing white feathers. Cast effect: white feathers turning into small birds.',
  kylan: 'Kỳ Lân Vàng: majestic cute qilin standing upright, silver-white and gold scales, single golden horn, flowing white mane, cloud patterns on legs. Weapon: none, horn and hooves. Cast effect: golden auspicious clouds and fire.',
  thienloi: 'Thiên Lôi: thunder god with a stern friendly face, silver armor with lightning patterns, dark storm-cloud cape, small helmet with wings. Weapon: stone thunder axe on a short staff crackling with blue lightning. Cast effect: blue lightning bolts.',
  tre: 'Dũng Sĩ Tre Làng: wiry village youth, green shirt and brown trousers, green headband, bamboo leaves tucked in the belt. Weapon: long bamboo staff. Cast effect: swirling bamboo leaves.',
  ongthoi: 'Thợ Săn Ống Thổi: highland hunter in a green and brown woven loincloth with leaf patterns, feather in the hair, quiver of darts. Weapon: long bamboo blowgun. Cast effect: green poison darts in a fan.',
  sodua: 'Sọ Dừa: cheerful boy half-hidden in a big green coconut shell like armor, kind eyes peeking out, small flute at the belt. Weapon: none, throws green coconuts. Cast effect: coconut shell glowing open.',
  cuoi: 'Chú Cuội: cheerful young woodcutter of the moon legend, green tunic with leaf patterns, carrying a tiny magic banyan sapling on his back, crescent-moon pendant. Weapon: woodcutter axe. Cast effect: banyan leaves spiraling with moonlight.',
  melua: 'Mẹ Lúa (Rice Mother goddess): kind goddess in a leaf-green and golden-rice robe, crown of golden rice ears, long black hair with rice stalks. Weapon: staff topped with a bundle of golden rice ears. Cast effect: golden rice grains swirling.',
});
Object.assign(ICONS, {
  langlieu: ['square banh chung rice cake', 'round white banh giay', 'rice field with water', 'ancestor altar with incense'],
  giaodong: ['bronze spear thrust', 'bronze spear tip', 'spear stance silhouette', 'spinning spear'],
  chuongdong: ['ringing bronze bell with sound waves', 'bell sound wave rings', 'bronze talisman', 'temple bell with golden light'],
  nghedong: ['guardian lion pounce', 'bronze shield', 'bronze claw', 'temple roof shaking with a roar'],
  mychau: ['white feathers flying like birds', 'goose-feather cloak', 'jade well with water', 'crossbow with a turtle-claw trigger'],
  kylan: ['golden qilin horn', 'golden scales', 'auspicious clouds with a banner', 'qilin breathing golden fire'],
  thienloi: ['lightning strike', 'thunder axe', 'axe smashing down', 'sky lightning storm'],
  tre: ['bamboo staff hitting', 'ivory bamboo stalk', 'green bamboo hedge', 'bamboo grove sweeping'],
  ongthoi: ['poison dart', 'sticky poison sap', 'hunter eye in the forest', 'rain of darts'],
  sodua: ['exploding green coconut', 'bamboo flute with notes', 'coconut shell opening with light', 'coconuts raining'],
  cuoi: ['woodcutter axe chop', 'magic banyan leaf', 'flying banyan tree', 'moon with wind swirls'],
  melua: ['golden rice field', 'bowl of new rice', 'golden straw rope', 'shower of golden grain'],
});
Object.assign(RELICS, {
  kylan: ['golden qilin horn', 'golden scale', 'five-color auspicious cloud'],
  thienloi: ['stone thunder axe', 'storm cloud', 'heavenly silver armor'],
  cuoi: ['magic banyan tree', 'woodcutter axe', 'crescent moon palace'],
  melua: ['golden rice ear', 'ripe rice field', 'pot of new rice'],
});

const EL = { kim: ['METAL', 'silver-white #D9DDE0 with bronze-gold accents'], moc: ['WOOD', 'leaf green #5FB84A with brown wood accents'],
  thuy: ['WATER', 'water blue #5AB4D6 with white accents'], hoa: ['FIRE', 'flame red-orange #E0452C with gold accents'], tho: ['EARTH', 'earth ochre #C99A3C with brown accents'] };
const RAR = { undefined: 'common hero: simple clothes, few details', epic: 'epic hero: richer costume with a purple-silver trim and a small aura', legendary: 'legendary hero: most ornate, gold trim, small crown or halo' };
const STYLE = 'STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.';
const BG = 'BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.';

const clean = (d) => d.replace(/\s*Element [A-Z]+[^.]*\.\s*/g, ' ').replace(/\s*Rarity:[^.]*\.?/g, '').replace(/\s+/g, ' ').trim();
const heroPrompt = (t) => {
  const h = HEROES[t], [E, pal] = EL[h.el];
  const ranged = h.attack !== 'melee';
  const effect = (DESC[t].match(/Cast effect: ([^.]+)\./) || [])[1];
  const desc = clean(DESC[t]).replace(/\s*Cast effect:[^.]*\./, '');
  return `Create ONE image: a 768x512 character sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x2 grid of six equal 256x256 cells.
CHARACTER: ${desc}
COLORS: element ${E} — the main outfit color is ${pal}. ${RAR[h.legend]}.
CELLS (same character, same size and proportions in cells 1-5, facing RIGHT in 3/4 view, feet on the same baseline): [1] idle holding the weapon [2] wind-up [3] ${ranged ? 'shooting / casting forward, the projectile leaving the hand' : 'strike with ONE short pale motion swoosh'} [4] casting the skill: ${effect || 'a small element-colored effect'} (small, inside the cell) [5] full body facing the viewer [6] portrait, head and shoulders, big and centered.
${STYLE}
${BG}`;
};
const enemyPrompt = (t) => `Create ONE image: a 576x192 enemy sprite row for a cute mobile tower-defense game based on Vietnamese folk legends, three equal 192x192 cells in one row.
CREATURE: ${ENEMY_DESC[t]}. Cute-but-mischievous chibi monster facing RIGHT.
CELLS (same creature, same size): ${REDO_FLY.has(k) ? '[1] flying, wings up [2] flying, wings down [3] diving attack' : '[1] walk step A [2] walk step B (opposite legs) [3] attack'}.
${STYLE}
${BG}`;
const iconPrompt = (t) => `Create ONE image: a 512x128 row of four equal 128x128 square game skill icons for the hero ${HEROES[t].name}, one icon per cell, left to right:
${ICONS[t].map((x, i) => `[${i + 1}] ${x}`).join('  ')}.
Each icon: one bold simple symbol, centered, thick dark-brown outline #2A1608, flat colors with the element color ${EL[HEROES[t].el][1]}, no character body, no text.
${BG}`;
const relicPrompt = (t) => `Create ONE image: a 384x128 row of three equal 128x128 square treasure icons for ${HEROES[t].name}, one per cell, left to right:
${RELICS[t].map((x, i) => `[${i + 1}] ${x}`).join('  ')}.
Each icon: one bold simple object, centered, gold rim, thick dark-brown outline #2A1608, flat colors in ${EL[HEROES[t].el][1]}, no text.
${BG}`;
const RUNE_SYM = {
  nui: ['#D9844A', 'crossed swords · heart · spring water · pickaxe · bronze shield · demon mask · cactus spikes · sledgehammer · skull · falling mountain · stone shield · volcano'],
  gio: ['#6FCB8A', 'wind swirl · four-point star · target · burst · eagle · spiral · coin · blood drop · trap · tornado · lightning bolt · eye'],
  sam: ['#7FA8F0', 'radiant sun · hourglass · water drop · crystal ball · amulet eye · bottle · flame · crescent moon · wind chime · thunder cloud · skull spirit · bell'],
};
const runePrompt = (k) => `Create ONE image: a 512x384 sheet, invisible 4x3 grid of twelve equal 128x128 cells, one round carved stone-and-bronze rune seal per cell, rim color ${RUNE_SYM[k][0]}, symbol carved in the middle, left to right, top to bottom:
${RUNE_SYM[k][1]}.
Thick dark-brown outline #2A1608, flat colors, no text.
${BG}`;

const need = Object.keys(HEROES).filter((t) => !packs.has(t));
const tier = (t) => (HEROES[t].legend === 'legendary' ? 2 : HEROES[t].legend === 'epic' ? 1 : 0);
need.sort((a, b) => tier(a) - tier(b));
const missingDesc = need.filter((t) => !DESC[t]);
if (missingDesc.length) { console.error('Thiếu mô tả:', missingDesc); process.exit(1); }
const items = [];
// v145: đổi tên game → "Thần Thoại Việt": ảnh nền menu mới + logo chữ (đặt lên đầu danh sách)
const MENU_ART = `Create ONE image: a 1792x832 wide landscape key-art illustration (about 2.15:1, full bleed, no border) for the MAIN MENU background of a cute mobile tower-defense game based on Vietnamese folk legends of Van Lang and Au Lac.
STYLE: Dong Son bronze drum art style (Vietnamese trong dong): engraved bronze surfaces, concentric rings, a sun-star with pointed rays, flying Lac birds, zigzag and circle-dot bands, warm bronze gold #C9963A with dark green patina #2F6B5E accents, thick dark-brown outline #2A1608, flat cartoon shading. Characters are cute chibi (head about 1/3 of the body, big round dark-brown eyes with two white highlights), same look as the game heroes.
SKY: a huge engraved Dong Son bronze drum face fills the upper sky like a giant sun disc: a glowing 14-ray sun-star in the center, rings of flying Lac birds and zigzag bands around it, warm golden dawn light.
SCENE (one unified epic scene, many legends together):
- center: Son Tinh (mountain god, green-brown robe, raising a mountain range with his hands) facing Thuy Tinh (water god, blue robe, riding a big rising wave with a dragon shape) — mountains climb on one side, waves rise on the other;
- Thanh Giong as a young giant hero on a galloping iron horse breathing fire, swinging an uprooted bamboo cane;
- Lac Long Quan (dragon lord) and Au Co (fairy with bird wings) together, a small golden dragon coiling in the clouds and a white crane-bird above;
- the Co Loa spiral citadel with King An Duong Vuong holding the magic crossbow with the golden turtle claw, the golden turtle Kim Quy beside him;
- Thach Sanh with his axe and magic lute, a defeated python-spirit coil in the background;
- foreground: Red River rice fields, bamboo, a stilt house with a boat-shaped roof.
COMPOSITION (very important): keep the LEFT HALF (0-45% of the width) calm and open — soft sky, drum-face glow, distant hills only, no characters and no busy details there — because the game title text is placed on it. Put all main characters between 35% and 70% of the width. The RIGHT 30% of the width will be covered by a menu panel: only low-detail background there (waves, mountains, clouds). Keep the bottom 12% simple (ground, water). Readable at phone size, strong silhouettes, warm golden light against teal water.
NO text, NO letters, NO numbers, NO logo, NO watermark, NO frame.`;
const LOGO = `Create ONE image: a 1024x384 game title logo that reads exactly "Thần Thoại Việt" (Vietnamese, with correct diacritics: Thần = T-h-ầ-n, Thoại = T-h-o-ạ-i, Việt = V-i-ệ-t), one or two lines, big and centered.
LETTERS: thick bold carved bronze letters like engraved Dong Son bronze, warm gold #F2D27A to bronze #B8852A with dark green patina #2F6B5E edges, thick dark-brown outline #2A1608, small zigzag and circle-dot bands engraved inside the strokes, slight 3D bevel.
DECOR: behind the letters a thin half bronze-drum ring with a small sun-star and two flying Lac birds; a small mountain on the left end and a small wave curl on the right end. Keep the decoration small; the words must be the most readable thing.
Cute mobile-game look, flat cel shading, no gradients except the metal sheen, no glow outside the letters.
${BG.replace(' No text, no numbers, no labels,', ' No other text, no numbers, no labels,')}`;
// ảnh nền mới đã thay xong thì tạo file đánh dấu assets/ui/.nen-menu-ttv để ẩn prompt này
if (!fs.existsSync(path.join(ROOT, 'assets/ui/.nen-menu-ttv'))) items.push({ group: '0. Ảnh nền menu — Thần Thoại Việt', file: 'nen-menu.jpg', title: 'Nền menu chính (key-art nhiều truyền thuyết, chừa nửa trái cho chữ tựa)', text: MENU_ART });
if (!fs.existsSync(path.join(ROOT, 'assets/ui/logo-tua.png'))) items.push({ group: '0. Ảnh nền menu — Thần Thoại Việt', file: 'logo-tua.png', title: 'Logo chữ "Thần Thoại Việt" (tùy chọn — AI hay viết sai dấu; sai thì bỏ, game dùng chữ HTML)', text: LOGO });
const tierName = ['Thường', 'Tím', 'Vàng'];
for (const t of need.filter((x) => tier(x) === 0)) items.push({ group: '1. Tướng Thường (ưu tiên: xuất hiện mỗi trận)', file: `${t}.png`, title: `${HEROES[t].name} · ${tierName[tier(t)]} · ${EL[HEROES[t].el][0]}`, text: heroPrompt(t) });
for (const t of ['yeutinh', 'dacon', 'linhan'].filter((x) => !packs.has(x))) items.push({ group: '2. Quái còn thiếu', file: `${t}.png`, title: ENEMIES[t].name, text: enemyPrompt(t) });
for (const t of need.filter((x) => tier(x) === 1)) items.push({ group: '3. Tướng Tím', file: `${t}.png`, title: `${HEROES[t].name} · Tím · ${EL[HEROES[t].el][0]}`, text: heroPrompt(t) });
for (const t of need.filter((x) => tier(x) === 2)) items.push({ group: '4. Tướng Vàng', file: `${t}.png`, title: `${HEROES[t].name} · Vàng · ${EL[HEROES[t].el][0]}`, text: heroPrompt(t) });
for (const t of Object.keys(ICONS).filter((x) => HEROES[x] && !fs.existsSync(path.join(ROOT, 'assets/packs', x, 'sk-q.png'))).sort((a, b) => tier(a) - tier(b))) items.push({ group: '5. Icon kỹ năng (tùy chọn)', file: `icon-${t}.png`, title: `Icon kỹ năng ${HEROES[t].name}`, text: iconPrompt(t) });
for (const t of Object.keys(LEGACY).filter((x) => RELICS[x] && !fs.existsSync(path.join(ROOT, 'assets/packs', x, 'tk-1.png')))) items.push({ group: '6. Icon Thần Khí (tùy chọn)', file: `than-khi-${t}.png`, title: `Thần Khí ${HEROES[t].name}`, text: relicPrompt(t) });
for (const k of Object.keys(RUNE_SYM).filter((b) => !fs.existsSync(path.join(ROOT, 'assets/runes', `${b[0]}_${{ nui: 'dmg', gio: 'haste', sam: 'power' }[b]}.png`)))) items.push({ group: '7. Icon Ấn Phù (tùy chọn)', file: `an-phu-${k}.png`, title: `Ấn Phù nhánh ${k}`, text: runePrompt(k) });
// v121: bản đồ + nút giao diện phong cách trống đồng Đông Sơn
const DRUM = 'Dong Son bronze drum art style (Vietnamese trong dong): engraved bronze surfaces, concentric rings, a sun-star with pointed rays, flying Lac birds, zigzag and circle-dot bands, warm bronze gold #C9963A with dark green patina #2F6B5E accents, thick dark-brown outline #2A1608, flat cartoon shading for a cute mobile game';
const MAP_DESC = {
  song: 'a calm riverside of the Da river: grass fields, a wide blue river along the top edge with sandy banks, scattered reeds',
  dam: 'a lotus marsh: shallow green water patches, lotus leaves and pink lotus flowers, reeds, muddy islets',
  rung: 'an ancient ironwood forest floor: dark green moss, roots, ferns, fallen leaves, small mushrooms',
  hang: 'a deep cave floor: brown-grey stone, cracks, glowing crystals, stalagmites, small bones',
  dong: 'golden rice paddies of the Red River delta: rice field plots with earthen dikes, a few water buffalo tracks',
  bien: 'a tropical East Sea shore: warm sand, turquoise sea along the top edge, shells, palm shadows',
  thanh: 'grounds of an ancient Au Lac citadel: packed earth, grass, low earthen walls, bronze banners at the edges',
};
const mapPrompt = (k) => `Create ONE image: a 1792x832 top-down game map background (bird's-eye view, slightly tilted) for a cute mobile tower-defense game, ${MAP_DESC[k]}.
IMPORTANT: draw NO road, NO path, NO trail, NO dashed lines anywhere. The middle of the image must stay EMPTY open ground with even texture (no buildings, no characters, no big objects) — the game draws its own winding road on top. Put details only near the four edges.
Subtle Dong Son bronze-drum motifs (sun-star, Lac birds, zigzag bands) worked softly into the ground texture or carved stones at the corners. Soft daylight, gentle colors, no text, no watermark, no frame, full bleed.`;
for (const k of Object.keys(MAP_DESC).filter((x) => !fs.existsSync(path.join(ROOT, 'assets/maps', `nen-${x}.jpg`)))) items.push({ group: '8. Nền bản đồ (trống đồng)', file: `nen-${k}.png`, title: `Nền bản đồ · ${k}`, text: mapPrompt(k) });
const UI_SHEETS = {
  'ui-nen-nut': ['round bronze drum-face button plate with a sun-star center and ring of Lac birds (empty center)', 'wide rectangular bronze button plate with zigzag border (empty middle for text)', 'square bronze panel corner frame with circle-dot border (empty middle)', 'small round bronze coin-shaped badge (empty center)'],
  'ui-tran-1': ['play triangle carved in a bronze drum disc', 'pause (two bars) carved in a bronze drum disc', 'fast-forward double arrow carved in a bronze drum disc', 'open eye carved in a bronze drum disc'],
  'ui-tran-2': ['menu (three bronze bars) on a drum disc', 'upward arrow over a bronze anvil (auto upgrade)', 'bronze shield with a small sun (auto equip)', 'cracked clay jar (sell / trash)'],
  'ui-tran-3': ['bronze drum with a mallet (summon hero)', 'two hands joining over a glowing star (fusion)', 'green mountain rising from water (raise mountain)', 'bronze left arrow (back)'],
  'ui-menu-1': ['crossed bronze spear and axe (march out)', 'three warrior helmets (heroes)', 'carved round stone seal (runes)', 'bronze treasure chest (treasury)'],
  'ui-menu-2': ['bronze gear wheel (settings)', 'rolled bamboo scroll book (encyclopedia)', 'small bronze drum trophy (ranking)', 'woven cloth bag (inventory)'],
  'ui-tai-nguyen': ['round bronze coin with square hole (gold)', 'red heart with bronze rim (lives)', 'silver ingot boat shape (treasury silver)', 'yin-yang disc in bronze ring (cultivation)'],
};
const uiPrompt = (k) => `Create ONE image: a 512x128 row of four equal 128x128 square game UI icons, one per cell, left to right:
${UI_SHEETS[k].map((x, i) => `[${i + 1}] ${x}`).join('  ')}.
${DRUM}. Each icon: one bold centered symbol, readable at 40 px, no text, no letters, no numbers.
${BG}`;
for (const k of Object.keys(UI_SHEETS).filter((x) => !fs.existsSync(path.join(ROOT, 'assets/ui', `${x}-1.png`)))) items.push({ group: '9. Nút giao diện (trống đồng)', file: `${k}.png`, title: `Nút · ${k}`, text: uiPrompt(k) });
// v121: quái / boss cũ chỉ có 1 dáng (đi không cử động) → gen lại đủ dáng theo phong cách chung.
// Bản đổi màu (camapden, thietky, chanlua, tuongthuy) tự sinh lại từ ảnh gốc bằng tools/make-variants.py.
const sameFrames = (k) => { try { return fs.readFileSync(path.join(ROOT, 'assets/packs', k, 'walk1.png')).equals(fs.readFileSync(path.join(ROOT, 'assets/packs', k, 'walk2.png'))); } catch (e) { return true; } };
const REDO_ENEMY = {
  camap: 'Cá Mập: grey river shark monster swimming upright on its tail fin, toothy grin, bronze ring on the fin',
  cao: 'Cáo: sly orange fox spirit standing on hind legs, fluffy tail with a white tip, little bronze bell collar',
  cua: 'Cua: big red river crab soldier walking sideways, huge claws, tiny bronze helmet',
  // v142: mọi quái hình người → quái vật (giữ vai trò, đổi hình)
  kybinh: 'Quỷ Cưỡi Lợn: small grey-green goblin with tusks and tiny horns riding a charging dark-brown ghost wild boar with curved white tusks, glowing red eyes and a bristly mane, goblin holds a short bronze spear, NO human, NO horse',
  voichien: 'Voi Chiến: grey war elephant with a red and gold saddle tower, bronze tusk caps, small banner',
  // v140: quái vẽ trước 06/10 (nét mảnh, khác phong cách chibi viền đậm hiện tại) → gen lại
  tom: 'Tôm Binh: orange river-shrimp soldier walking on small legs, tiny bronze helmet, round bronze shield with a star, short spear',
  casau: 'Cá Sấu: chubby green crocodile walking on four short legs, bumpy back scales, toothy grin, bronze ring on the tail',
  rua: 'Rùa Giáp: big slow tortoise walking on four legs, dark green shell with bronze spikes and a zigzag rim, stern eyebrows',
  phuthuy: 'Sứa Tinh: translucent teal jellyfish spirit floating upright, round bell-shaped head with two big glowing cyan eyes and a small grumpy mouth, wavy tentacles tangled with green seaweed, holds a small coral branch with one tentacle, NO human',
  chimbao: 'Chim Bão: blue-grey storm bird flying with wide wings, small lightning sparks on the wing tips, angry eyes',
  echme: 'Ếch Mẹ: big fat green mother toad with a yellow belly, warts on the back, wide mouth, hopping',
  nongnoc: 'Nòng Nọc: small round black tadpole with a wiggly tail and one big shiny eye, swimming',
  giaolong: 'Giao Long Con: young green water dragon slithering, small horns, whiskers, little fins, curled tail',
  yeutinh: 'Yêu Tinh Rừng: small green forest goblin with pointy ears, leaf loincloth, wooden club',
  ran: 'Rắn Độc: green venomous snake slithering in S-curves, yellow belly stripes, forked red tongue, small fangs',
  doi: 'Dơi Hang: purple cave bat flying, big ears, tiny fangs, red eyes, leathery wings',
  thachtinh: 'Thạch Tinh: stocky grey stone golem of the cave, cracked rock body with moss, glowing yellow eyes, big stone fists',
  dacon: 'Đá Con: small round grey rock creature with big cute eyes, stubby arms and legs, running',
  linhan: 'Quỷ Giáo: small grey-green goblin soldier with pointy ears, two small horns, tusks and red eyes, dark red leather vest, small leather cap, round wooden shield, long bronze spear, NO human face',
  cungan: 'Sói Cung Thủ: grey wolf demon standing on hind legs, wolf head with yellow eyes and sharp fangs, bushy tail, brown-green leather vest, quiver of arrows on the back, drawing a wooden bow, NO human',
  muc: 'Mực Tinh: pink squid spirit floating upright, big angry eyes, eight curly tentacles, small ink drops',
};
const REDO_ENEMY_FORCE = new Set(['tom', 'casau', 'rua', 'phuthuy', 'chimbao', 'echme', 'nongnoc', 'giaolong', 'yeutinh', 'ran', 'doi', 'thachtinh', 'dacon', 'linhan', 'cungan', 'muc', 'kybinh']);
const REDO_FLY = new Set(['doi', 'chimbao']);
const REDO_BOSS = {
  anvuong: 'Quỷ Vương Ân: demon king with dark blue skin, big curved water-buffalo horns, fangs and glowing yellow eyes, black armor with gold trim, riding a black demon steed with a flaming red mane and glowing eyes, big halberd, war drum on the saddle, NO human face',
  chantinh: 'Chằn Tinh: big green ogre demon of the banyan forest, tusks, horn, loincloth, huge stone club',
  haba: 'Hà Bá: giant old catfish spirit standing upright on a fish tail, long drooping whisker-beard, wrinkled dark green-blue skin, fish-scale robe, coral and seashell crown, trident, NO human',
  ngutinh: 'Ngư Tinh: monstrous blue-green fish demon of the East Sea rising from waves, many sharp teeth, fin spikes',
  thuongluong: 'Thuồng Luồng: long green water dragon serpent coiling out of the river, horns, whiskers, bronze scales on the belly',
  thuytinh: 'Thủy Tinh: water demon king with a blue sea-dragon head (horns, whiskers, fangs), silver-blue scaly body, fin crest on the back, silver-blue armor and fish-scale cape, crown of waves, trident, NO human face',
  trieuda: 'Hổ Vương Triệu Đà: tiger-headed demon general, orange tiger head with black-red flame stripes, long fangs and glowing eyes, clawed paws, dark red and black armor, tiger tail, big curved sword, NO human face',
  daibang: 'Đại Bàng Tinh: giant golden-brown eagle demon of the cave, spread wings, sharp talons, fierce red eyes, flying',
  hotinh: 'Hồ Tinh Chín Đuôi: white nine-tailed fox demon standing on hind legs, nine fluffy tails fanned out, sly red eyes, purple fox-fire flames',
};
// có đủ dáng nhưng nét cũ, nhỏ, lệch phong cách chung; cắt xong bản mới thì tạo file assets/packs/<mã>/.redo để bỏ khỏi danh sách
const REDO_FORCE = new Set(['daibang', 'trieuda', 'hotinh', 'anvuong', 'haba', 'thuytinh']);
const redoEnemyPrompt = (k) => `Create ONE image: a 576x192 enemy sprite row for a cute mobile tower-defense game based on Vietnamese folk legends, three equal 192x192 cells in one row.
CREATURE: ${REDO_ENEMY[k]}. Cute-but-mischievous chibi monster facing RIGHT.
CELLS (same creature, same size): ${REDO_FLY.has(k) ? '[1] flying, wings up [2] flying, wings down [3] diving attack' : '[1] walk step A [2] walk step B (opposite legs) [3] attack'}.
${STYLE}
${BG}`;
const redoBossPrompt = (k) => `Create ONE image: a 512x512 boss sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 2x2 grid of four equal 256x256 cells.
BOSS: ${REDO_BOSS[k]}. Big, menacing but still cute chibi boss facing RIGHT.
CELLS (same character, same size, left to right, top to bottom): [1] walk step A [2] walk step B (opposite legs) [3] attack swing [4] rage: body glowing red-orange, roaring.
${STYLE}
${BG}`;
const redone = (k) => fs.existsSync(path.join(ROOT, 'assets/packs', k, '.redo'));
for (const k of Object.keys(REDO_ENEMY).filter((x) => REDO_ENEMY_FORCE.has(x) ? !redone(x) : sameFrames(x))) items.push({ group: '10. Quái gen lại (đủ dáng)', file: `${k}.png`, title: `Quái · ${ENEMIES[k].name}`, text: redoEnemyPrompt(k) });
for (const k of Object.keys(REDO_BOSS).filter((x) => REDO_FORCE.has(x) ? !fs.existsSync(path.join(ROOT, 'assets/packs', x, '.redo')) : sameFrames(x))) items.push({ group: '11. Boss gen lại (đủ dáng)', file: `${k}.png`, title: `Boss · ${ENEMIES[k].name}`, text: redoBossPrompt(k) });
// v140: icon đồ vật (đang vẽ bằng code) — mỗi tấm 4–5 ô, cắt bằng: python3 tools/cat-items.py <ảnh> <mã tấm>
const ITEM_STYLE = 'cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots)';
const RAR_LOOK = [['thuong', 'COMMON: plain dull bronze and wood, no gems'], ['hiem', 'RARE: polished bronze with blue trim and one small blue gem'],
  ['su-thi', 'EPIC: silver and purple trim, purple gem, faint purple glow'], ['huyen-thoai', 'LEGENDARY: ornate gold with a sun-star engraving, red gem, small golden glow']];
const KIND_LOOK = { riu: 'a short bronze battle axe (Rìu Đồng)', no: 'a bamboo crossbow (Nỏ Tre)', gay: 'a shaman staff with a carved head (Gậy Thầy Mo)', mu: 'a feathered warrior headdress hat (Mũ Lông Chim)', giap: 'a sleeveless warrior tunic / chest armor (Áo Giáp)' };
const SET_LOOK = {
  'lac-long': 'Lạc Long Quân dragon set: jade-green dragon scales, sea-wave patterns, pearl accents',
  'son-tinh': 'Sơn Tinh mountain set: grey carved stone and earth-brown, small green moss, mountain-peak shapes',
  'chim-lac': 'Lac bird set: cream-white feathers on bronze, Lac bird head shapes, long tail feathers',
  'trong-dong': 'bronze drum set: shiny gold-bronze with drum-face sun-star rings and circle-dot bands',
  'ngua-sat': 'Thánh Gióng iron horse set: black iron with glowing red-orange fire manes and ember sparks',
};
const SET_PIECE = { riu: 'axe', no: 'crossbow', gay: 'staff', mu: 'helmet', giap: 'chest armor' };
const ACC = [
  ['vuot-ho', 'tiger claw on a cord'], ['gang-da', 'brown leather glove'], ['dai', 'woven belt with a bronze buckle'], ['dep-co', 'pair of straw sandals'],
  ['khan', 'red cloth headband scarf'], ['khan-hien-gia', 'indigo sage turban with a small bronze pin'], ['mat-ngoc', 'jade eye-shaped amulet'], ['ngoc-sinh-luc', 'glowing green life jade'],
  ['mat-trong', 'flat bronze drum face with sun-star'], ['dui-trong', 'wooden drum mallet with a cloth grip'], ['sung-te', 'rhino horn'], ['long-chim-lac', 'single long Lac bird feather'],
  ['vay-ca', 'shiny silver-blue fish scale'], ['hat-lua', 'handful of golden rice grains'],
];
const SINH_LE = [['voi-chin-nga', 'small cute elephant with nine tusks and a red saddle cloth'], ['ga-chin-cua', 'proud rooster with nine spurs and a red comb'],
  ['ngua-chin-hong-mao', 'small horse with a flowing nine-colored red mane'], ['ngoc-hoi-sinh', 'glowing red-gold revival pearl with a phoenix shape inside']];
// chia 4–5 ô mỗi tấm, không để tấm lẻ 1–3 ô
const chunk = (a) => { const out = []; let i = 0; while (i < a.length) { const left = a.length - i; const n = left === 5 || left === 10 ? 5 : left > 5 && left % 4 && left % 4 < 4 && left <= 7 ? left - 4 : 4; out.push(a.slice(i, i + Math.min(n, 5))); i += Math.min(n, 5); } return out; };
const ACC_GHEP = [
  ['trong-dong', 'Dong Son bronze drum, full drum with frogs on top'], ['song-riu-cuong-no', 'two crossed red-glowing battle axes'], ['gay-tam-gioi', 'staff with three rings of sky, earth and water'], ['gay-thoi-khong', 'staff topped with a spinning hourglass and stars'],
  ['giap-dong-bat-diet', 'heavy bronze chest armor with a shield emblem'], ['luoi-hai-chi-tu', 'dark scythe with a curved blade and purple glow'], ['mui-sung-pha-giap', 'sharp horn spearhead cracking a shield'], ['riu-quet-song', 'wide axe with a water-wave blade'],
  ['cung-mat-chim', 'bow with a bird eye on the grip'], ['bua-chim-lac', 'bronze Lac bird talisman on a red string'], ['ao-vay-ca', 'shirt covered in silver fish scales'], ['ngoc-tran-thuy', 'blue water-sealing jade with a calm wave inside'],
  ['luoi-danh-ca', 'folded fishing net with floats'], ['ngoc-minh-chau', 'radiant white sea pearl on a shell'], ['vuot-kim-quy', 'golden turtle claw crossbow trigger'], ['riu-than-thach-sanh', 'heavenly golden axe of Thạch Sanh with light rays'],
  ['ao-long-vu-au-co', 'white feather cloak of Âu Cơ with a golden clasp'],
];
const ITEM_SHEETS = {};
for (const [k, look] of Object.entries(KIND_LOOK)) ITEM_SHEETS[`do-${k}`] = { title: `Đồ thường · ${k} (4 độ hiếm)`, cells: RAR_LOOK.map(([r, rl]) => [`do_${k}_${r}.png`, `${look}, ${rl}`]) };
for (const [k, look] of Object.entries(SET_LOOK)) ITEM_SHEETS[`bo-${k}`] = { title: `Đồ bộ · ${k} (5 món)`, cells: Object.keys(SET_PIECE).map((pc) => [`bo-${k}_${pc}.png`, `${SET_PIECE[pc]} of the ${look}`]) };
chunk(ACC).forEach((c, i) => { ITEM_SHEETS[`phu-kien-${i + 1}`] = { title: `Phụ kiện ${i + 1}`, cells: c.map(([f, d]) => [`phu-kien_${f}.png`, d]) }; });
ITEM_SHEETS['sinh-le'] = { title: 'Sính lễ của boss', cells: SINH_LE.map(([f, d]) => [`sinh-le_${f}.png`, `${d}, legendary treasure, small golden glow`]) };
chunk(ACC_GHEP).forEach((c, i) => { ITEM_SHEETS[`do-ghep-${i + 1}`] = { title: `Đồ ghép ${i + 1}`, cells: c.map(([f, d]) => [`do-ghep_${f}.png`, `${d}, rare magical crafted item, slightly glowing`]) }; });
// v140: thêm nút giao diện cho các chỗ còn dùng emoji
const UI_SHEETS2 = {
  'ui-tran-4': ['golden star with a plus sign (merge stars)', 'tunic with an upward arrow (equip gear)', 'bronze padlock (locked)', 'two circular arrows (reroll / refresh)'],
  'ui-tran-5': ['glowing bronze oil lamp (hint / tip)', 'infinity loop made of bronze rope (endless mode)', 'two crossed bronze swords (battle)', 'green check mark on a bronze disc (done)'],
  'ui-huy-chuong': ['gold medal with a red ribbon', 'silver medal with a blue ribbon', 'bronze medal with a green ribbon', 'small golden crown (top rank)'],
};
const sheetPrompt = (cells, what) => `Create ONE image: a ${cells.length * 128}x128 row of ${cells.length} equal 128x128 square ${what}, one per cell, left to right:
${cells.map((x, i) => `[${i + 1}] ${x}`).join('  ')}.
${what.includes('UI') ? DRUM : ITEM_STYLE}. Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
${BG}`;
const done = (f) => fs.existsSync(path.join(ROOT, 'assets', f));
const sheetsJson = {};
for (const [k, v] of Object.entries(UI_SHEETS2)) {
  sheetsJson[k] = { dir: 'ui', files: v.map((_, i) => `${k}-${i + 1}.png`) };
  if (!done(`ui/${k}-1.png`)) items.push({ group: '12. Nút giao diện thêm (trống đồng)', file: `${k}.png`, title: `Nút · ${k}`, text: sheetPrompt(v, 'game UI icons') });
}
for (const [k, v] of Object.entries(ITEM_SHEETS)) {
  sheetsJson[k] = { dir: '', files: v.cells.map((c) => c[0]) };
  if (!v.cells.every((c) => done(c[0]))) items.push({ group: '13. Icon đồ vật', file: `${k}.png`, title: v.title, text: sheetPrompt(v.cells.map((c) => c[1]), 'game item icons') });
}
fs.writeFileSync(path.join(ROOT, 'tools/item-sheets.json'), JSON.stringify(sheetsJson, null, 1));
items.forEach((it, i) => { it.n = i + 1; });
const noIcon = need.filter((x) => !ICONS[x]);  // tướng mới chưa có mô tả icon
if (noIcon.length) console.error('Chưa có mô tả icon:', noIcon.join(', '));

// Markdown
let out = `# Prompt Gemini đầy đủ — mỗi ảnh một prompt (${items.length} ảnh)\n\n`;
out += 'Mỗi khối dán **riêng một lần** vào Gemini (đính kèm `docs/mau-lac-tuong.png` làm mẫu nét vẽ nếu được), tải ảnh về và đặt **đúng tên file** ghi trên khối. Gen theo thứ tự từ trên xuống: phần 0 (nền menu tên mới) và 1–4 là cần thiết, phần 5–7 là tùy chọn.\n\n> **Phần 0 — đổi tên game thành \"Thần Thoại Việt\" (v145):** ảnh nền menu mới thay `assets/ui/nen-menu.jpg` (ảnh cũ chủ đề Sơn Tinh – Thủy Tinh, đang dùng tạm). Logo chữ là tùy chọn: AI hay viết sai dấu tiếng Việt — kiểm tra kỹ từng dấu (ầ, ạ, ệ); sai thì bỏ, game tự hiện chữ HTML. Có ảnh đúng thì xoá nền magenta, lưu `assets/ui/logo-tua.png`. Các ảnh cảnh khác (nền thắng/thua, truyện) hiện không có chữ tên game nên không cần gen lại.\n\n';
let g = '';
for (const it of items) {
  if (it.group !== g) { g = it.group; out += `\n## ${g}\n`; }
  out += `\n### ${it.n}. ${it.title} → \`${it.file}\`\n\`\`\`\n${it.text}\n\`\`\`\n`;
}
fs.writeFileSync(path.join(ROOT, 'docs/PROMPT_GEMINI_FULL.md'), out);
// Văn bản thường (.txt): không ký hiệu Markdown, mỗi prompt kẹp giữa hai đường kẻ để dễ chép
let txt = `PROMPT GEMINI ĐẦY ĐỦ — MỖI ẢNH MỘT PROMPT (${items.length} ảnh)\n`;
txt += 'Mỗi khối dán riêng một lần vào Gemini (đính kèm docs/mau-lac-tuong.png làm mẫu nét vẽ nếu được), tải ảnh về và đặt đúng tên file ghi trên khối.\n';
g = '';
for (const it of items) {
  if (it.group !== g) { g = it.group; txt += `\n\n${'='.repeat(60)}\n${g.toUpperCase()}\n${'='.repeat(60)}\n`; }
  txt += `\n${it.n}. ${it.title}  ->  Tên file: ${it.file}\n${'-'.repeat(60)}\n${it.text}\n${'-'.repeat(60)}\n`;
}
fs.writeFileSync(path.join(ROOT, 'docs/PROMPT_GEMINI_FULL.txt'), txt);
fs.writeFileSync(path.join(ROOT, 'docs/prompts.json'), JSON.stringify(items, null, 1));
console.log('items', items.length, 'heroes', need.length);
