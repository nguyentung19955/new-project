// Sinh bộ prompt Gemini (mỗi ảnh một prompt tự đủ) từ dữ liệu game + mô tả trong docs/PROMPT_GEMINI_V94.md.
// Chạy: node tools/build-prompts.js  →  docs/PROMPT_GEMINI_FULL.md (+ .txt), docs/PROMPT-CAN-GEN.txt (chỉ ảnh còn phải gen) + (tùy chọn) trang HTML có nút sao chép.
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

// v178: chuẩn phong cách chibi thần thoại Việt nhắc lại trong TỪNG prompt (người dùng hay dán prompt lẻ) + câu cấm.
const LOCK_STYLE = 'STYLE LOCK: Vietnamese-mythology CHIBI game art like the attached style sample — chibi body 2.5 to 3 heads tall (big head about 1/3 of the height, big expressive eyes, short body and short limbs), thick clean dark-brown outline, flat cel shading, bright colors; Van Lang / Au Lac / Dong Son costume and weapons (bronze-drum patterns, Lac-bird feather headdress, loincloth, ao the, bronze spear, bronze axe, crossbow), never Chinese, Japanese, Korean or Western fantasy style.';
const LOCK_ONE = 'ONE CHARACTER, SAME DESIGN: exactly ONE character in each cell (no clones, no second person, no helpers or crowd), and it is the SAME character in every cell — same face, hair, outfit colors, weapon and proportions, only the pose changes. Draw cell 1 as the model sheet and copy that design into every other cell.';
const LOCK_BODY_HUMAN = 'ANATOMY: exactly one head, two arms, two legs, hands with five fingers (simplified is fine), arms and legs attached at the right joints, nothing missing or extra; the WHOLE body from the top of the head (and headdress) to the feet is inside the cell with empty margin — never cropped by the cell edge. No text, letters, numbers, signature or watermark anywhere.';
const LOCK_BODY_CREATURE = 'ANATOMY: correct, readable body for this creature — the right number of heads, legs, wings and tails as described, nothing missing, extra or melted together; the WHOLE body including tail, wings and horns is inside the cell with empty margin — never cropped by the cell edge. No text, letters, numbers, signature or watermark anywhere.';
const NEG_CHAR = 'NEGATIVE (do NOT draw): two or more characters in one cell, duplicated / cloned character, extra people, a different-looking character between cells, extra limbs, extra fingers, missing arms, missing legs, cropped feet or head, body cut by the cell edge, twisted or broken body, text, letters, numbers, captions, speech bubbles, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render, tall anime proportions, Chinese armor, Japanese samurai or kimono, Korean hanbok, Western knight armor, magenta on the character, floor shadow.';
const LOCK_FX = 'STYLE LOCK: cartoon VFX matching chibi Vietnamese-mythology game art (Dong Son bronze-drum flavor), the SAME effect in every frame. NEGATIVE (do NOT draw): characters, people, faces, hands, text, letters, numbers, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render.';
const charLock = (creature) => `${LOCK_STYLE}${creature ? ' Non-human monsters and beasts are chibi too: round, chunky, cute-but-fierce, the same line art.' : ''}\n${LOCK_ONE}\n${creature ? LOCK_BODY_CREATURE : LOCK_BODY_HUMAN}\n${NEG_CHAR}`;
// thẻ nhận diện cũ ghi "head about 1/N of the height" (dáng cao gầy) → quy về chibi 2.5–3 đầu, khác nhau bằng dáng / bề ngang / mảng hình
const chibiBody = (b) => b.replace(/head about 1\/(\d) of the height/, (_, n) => +n <= 3
  ? 'CHIBI about 2.5 heads tall (head about 2/5 of the height)'
  : `CHIBI about 3 heads tall (head about 1/3 of the height)${+n >= 6 ? ' — show the big / tall build with a larger overall size, broader shoulders and a slightly longer chibi body, NOT by shrinking the head' : ''}`);

// Khối chuẩn đặt ở đầu các file prompt (PROMPT-CAN-GEN, PROMPT-GUI-AI, PROMPT_GEMINI_FULL) — bản gọn của nó nằm trong từng prompt (charLock).
const STYLE_SAMPLE = 'docs/mau-luoi/vi-du-hero12-lactuong.png';
const STYLE_BIBLE = `${'='.repeat(60)}
STYLE BIBLE / CHUẨN PHONG CÁCH (áp dụng cho MỌI ảnh nhân vật bên dưới)
${'='.repeat(60)}
ẢNH MẪU PHONG CÁCH: đính kèm ${STYLE_SAMPLE} (tấm Lạc Tướng 12 khung đạt chuẩn; bản 1 nhân vật: docs/mau-lac-tuong.png) cùng mọi prompt và ghi thêm câu:
  "Match the art style, chibi proportions and line art of the attached style sample exactly, but draw the NEW character described below."

1. NHÂN VẬT NGƯỜI / TƯỚNG: CHIBI cao 2.5–3 đầu (đầu to ~1/3 chiều cao, mắt to, thân và tay chân ngắn), viền nâu sẫm đậm và sạch, tô cel-shading phẳng, màu tươi.
   Tướng già / to cao / gầy vẫn là chibi — khác nhau bằng bề ngang, dáng đứng, cỡ người, râu tóc, mảng hình đặc trưng, KHÔNG thu nhỏ đầu thành người thật.
2. CHẤT VIỆT: trang phục / vũ khí thần thoại Việt thời Văn Lang – Âu Lạc, văn hoá Đông Sơn: hoa văn trống đồng (mặt trời, chim Lạc, răng cưa, vòng tròn chấm),
   khố, áo the, váy đụp, mũ lông chim, giáo đồng, rìu đồng, dao găm, nỏ thần, khiên đồng. KHÔNG phong cách Trung Quốc / Nhật / Hàn / phương Tây (không giáp Tàu, kimono, samurai, hanbok, hiệp sĩ).
3. QUÁI / BOSS / THÚ: vẫn chibi tròn trịa, mập mạp, "dễ thương mà dữ", cùng nét vẽ với tướng.
4. GIẢI PHẪU: đúng 1 đầu, 2 tay, 2 chân, bàn tay 5 ngón (vẽ đơn giản được), tay chân nối đúng khớp, không thiếu / thừa chi. Thú, rồng, hồn ma: đúng số đầu / chân / cánh / đuôi như mô tả.
   TOÀN THÂN (từ đỉnh mũ lông tới bàn chân) luôn nằm trọn trong ô, chừa lề ~8% — không cắt mất chân / đầu.
5. MỖI Ô ĐÚNG MỘT NHÂN VẬT: không nhân bản 2–3 người trong một ô, không thêm người phụ / đám đông. CÙNG MỘT NHÂN VẬT ở mọi ô: cùng mặt, tóc, màu áo, vũ khí, tỉ lệ — chỉ khác tư thế.
6. TUYỆT ĐỐI KHÔNG chữ, số, chữ ký, watermark, logo, nhãn, khung, đường lưới, bóng chữ trong ảnh.
7. NỀN hồng tím #FF00FF phẳng tuyệt đối (hiệu ứng ghi BLACK thì nền đen #000000), không bóng đổ ra nền, không dùng màu hồng tím trên nhân vật.
8. VŨ KHÍ & CHUYỂN ĐỘNG ĐÁNH: vũ khí cùng cỡ, cùng hình ở mọi khung, luôn nằm trong tay (không biến mất, không nhân đôi, không bay lơ lửng).
   Cung: khung 5 lắp tên → khung 6 kéo dây tới má, mũi tên LUÔN thấy trên dây → khung 7 buông, tên vừa rời cung → khung 8 thu tay. Nỏ tương tự (mũi tên trong rãnh).
   Kiếm / rìu / giáo / gậy phép: khung 5 giơ cao ra sau → khung 6 giữa đường vung (một vệt mờ duy nhất) → khung 7 cuối đường vung, tay duỗi → khung 8 thu về; đầu vũ khí đi theo MỘT cung tròn mượt.

ENGLISH SUMMARY FOR THE AI: Vietnamese-mythology CHIBI game art (2.5-3 heads tall, big head and eyes, short limbs, thick clean dark-brown outline, flat cel shading, bright colors),
Van Lang / Au Lac / Dong Son costume and weapons, never Chinese / Japanese / Korean / Western style. Exactly ONE character per cell and the SAME character design in every cell,
correct anatomy (1 head, 2 arms, 2 legs, 5 fingers), whole body inside the cell, no text / letters / numbers / watermark, flat magenta #FF00FF background.

QUY TRÌNH NÊN LÀM (giảm sai nhân vật giữa các ô):
  B1. Gen trước một ảnh "character sheet" 1 nhân vật đứng thẳng (dán prompt + câu: "First draw ONLY ONE full-body character, standing, on flat magenta #FF00FF — no grid, no text").
  B2. Duyệt ảnh đó theo danh sách kiểm tra bên dưới; sai thì gen lại B1, đúng thì giữ.
  B3. Gen tấm nhiều khung: đính kèm ảnh B1 làm ẢNH THAM CHIẾU + ảnh lưới docs/mau-luoi/<kiểu>.png + ảnh mẫu phong cách, dán prompt đầy đủ và ghi thêm:
      "Use the first attached image as the exact character reference — same face, hair, outfit colors, weapon and proportions in every cell."

KIỂM TRA TRƯỚC KHI NHẬN ẢNH (sai 1 dòng → gen lại, đừng cắt):
  [ ] Mỗi ô đúng 1 nhân vật (không nhân bản 2–3 người, không người phụ)
  [ ] Đủ đầu, 2 tay, 2 chân, nối đúng khớp; toàn thân nằm trọn trong ô, không bị cắt chân / đầu
  [ ] Các ô giống nhau: cùng mặt, tóc, màu áo, vũ khí, tỉ lệ (không như 2 người khác nhau)
  [ ] Không có chữ, số, chữ ký, watermark, khung, đường lưới
  [ ] Đúng chibi 2.5–3 đầu, chất Việt (Đông Sơn), không ra kiểu Trung / Nhật / Hàn / Tây
  [ ] Nền hồng tím #FF00FF phẳng, không bóng đổ, không màu hồng tím trên nhân vật
  [ ] Hàng đánh: vũ khí còn nguyên ở mọi khung; cung có mũi tên trên dây (khung 5–6) và tên vừa bay ra (khung 7); đường vung kiếm / gậy liền mạch
`;

const clean = (d) => d.replace(/\s*Element [A-Z]+[^.]*\.\s*/g, ' ').replace(/\s*Rarity:[^.]*\.?/g, '').replace(/\s+/g, ' ').trim();
const heroPrompt = (t) => (HERO_ID[t] ? heroIdPrompt(t) : heroPromptOld(t));
const heroPromptOld = (t) => {
  const h = HEROES[t], [E, pal] = EL[h.el];
  const ranged = h.attack !== 'melee';
  const effect = (DESC[t].match(/Cast effect: ([^.]+)\./) || [])[1];
  const desc = clean(DESC[t]).replace(/\s*Cast effect:[^.]*\./, '');
  return `Create ONE image: a 768x512 character sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x2 grid of six equal 256x256 cells.
CHARACTER: ${desc}
COLORS: element ${E} — the main outfit color is ${pal}. ${RAR[h.legend]}.
CELLS (same character, same size and proportions in cells 1-5, facing RIGHT in 3/4 view, feet on the same baseline): [1] idle holding the weapon [2] wind-up [3] ${ranged ? 'shooting / casting forward, the projectile leaving the hand' : 'strike with ONE short pale motion swoosh'} [4] casting the skill: ${effect || 'a small element-colored effect'} (small, inside the cell) [5] full body facing the viewer [6] portrait, head and shoulders, big and centered.
${STYLE}
${charLock(false)}
${BG}`;
};
const enemyPrompt = (t) => `Create ONE image: a 576x192 enemy sprite row for a cute mobile tower-defense game based on Vietnamese folk legends, three equal 192x192 cells in one row.
CREATURE: ${ENEMY_DESC[t]}. Cute-but-mischievous chibi monster facing RIGHT.
CELLS (same creature, same size): ${REDO_FLY.has(k) ? '[1] flying, wings up [2] flying, wings down [3] diving attack' : '[1] walk step A [2] walk step B (opposite legs) [3] attack'}.
${STYLE}
${charLock(true)}
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

// v151: tướng vẽ lại cho dễ phân biệt — thẻ nhận diện ở tools/hero-id.js (dáng, mảng hình đặc trưng, màu riêng).
const { HERO_ID, CONFUSE } = require('./hero-id.js');
const HERO_STYLE = 'STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.\n'
  + 'DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: everyone stays CHIBI (2.5-3 heads tall), so show age and build through BODY width, posture and size, and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.\n'
  + 'FACE: keep the big chibi head and big eyes, but give this hero the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape) so it is not a generic face.';
// v178: chuyển động đánh theo loại vũ khí — cung không mất tên, kéo cung / vung kiếm / vung gậy phép mượt qua 4 khung.
const weaponKind = (w, ranged) => /longbow|\bbow\b/i.test(w) ? 'bow' : /crossbow/i.test(w) ? 'crossbow' : /slingshot|blowgun/i.test(w) ? 'shooter'
  : /staff|wand|scepter|stick|book|lantern|pearl|fan|flute|ladle|umbrella|branch/i.test(w) ? 'staff'
  : !ranged && /sword|axe|spear|knife|knives|hammer|glaive|machete|hoe|oar|shovel|tongs|mallet|bamboo|pole|torch|club/i.test(w) ? 'swing' : '';
const ATTACK_ROW = {
  bow: ['bow shot, a smooth 4-frame draw-and-release', '[5] nock: bow raised in front, ONE arrow placed on the string, string still straight [6] full draw: string pulled back to the cheek, bow bent, the SAME arrow clearly visible lying on the string and the bow [7] release: string snapping forward, that arrow just leaving the bow, a short motion streak behind it [8] follow-through: bow arm still extended, string straight, drawing hand open behind, returning toward idle',
    'BOW AND ARROW CONTINUITY: the bow is the same size and shape in every frame and is never missing; in frames 5-6 the arrow is ALWAYS visible on the string (never vanished, never two arrows), in frame 7 it is visible just in front of the bow; the drawing hand moves back step by step (frame 5 near the bow, frame 6 at the cheek), the bow arm stays steady.'],
  crossbow: ['crossbow shot, a smooth 4-frame aim-and-shoot', '[5] load: crossbow held at the hip, ONE bolt placed in the groove, string cocked [6] aim: crossbow raised to the shoulder, bolt clearly visible in the groove [7] shoot: string snapped forward, the bolt just leaving the front with a short motion streak, small recoil [8] recover: crossbow lowering back toward idle',
    'CROSSBOW CONTINUITY: the crossbow is the same size and shape in every frame and always held with both hands; the bolt is ALWAYS visible in frames 5-6 and just in front of the crossbow in frame 7.'],
  shooter: ['shooting forward, a smooth 4-frame aim-and-shoot', '[5] load: ammo placed in the weapon, weight back [6] aim: weapon raised and pulled / breath drawn, the ammo clearly visible [7] shoot: the ammo just leaving the weapon with a short motion streak [8] recover: returning toward idle',
    'WEAPON CONTINUITY: the weapon is the same size and shape in every frame and always held in the hand; the ammo is visible in frames 5-7 (loaded, then just leaving).'],
  staff: ['magic attack with the weapon, a smooth 4-frame cast', '[5] wind-up: weapon raised up and back over the shoulder, weight on the back foot [6] swing: weapon sweeping forward in a smooth arc, a small glow gathering at its tip, ONE short pale motion trail [7] cast: weapon pointing forward at full reach, the small magic shot just leaving the tip [8] recover: weapon coming back toward the idle pose',
    'WEAPON CONTINUITY: the weapon stays the same length, shape and color in every frame, always gripped in the hand (never floating, bent, doubled or disappearing); its tip moves along one smooth arc from frame 5 to frame 7.'],
  swing: ['melee swing, a smooth 4-frame strike', '[5] wind-up: weapon raised high behind the head / shoulder, weight on the back foot [6] mid-swing: body twisting forward, weapon half way along its arc, ONE short pale motion swoosh following the blade [7] strike: weapon at the end of the arc in front, arm fully extended, front knee bent [8] recover: weapon pulled back toward the idle pose',
    'WEAPON CONTINUITY: the weapon stays the same length, shape and color in every frame, always gripped in the hand (never floating, bent, doubled or disappearing); the blade moves along one smooth arc from frame 5 to frame 7, only frame 6 has the swoosh.'],
};
const heroIdPrompt = (t) => {
  const h = HERO_ID[t], [E] = EL[HEROES[t].el];
  const ranged = HEROES[t].attack !== 'melee';
  const wk = ATTACK_ROW[weaponKind(h.weapon, ranged)];
  const row2 = wk ? `ROW 2 — ${wk[0]}: ${wk[1]}.` : `ROW 2 — ${ranged ? 'attack (shooting / casting forward)' : 'melee attack'}: [5] prepare: weight back, ${ranged ? 'drawing / aiming' : 'weapon pulled back'} [6] swing: body twisting forward, ${ranged ? 'about to release' : 'weapon moving with ONE short pale motion swoosh'} [7] hit: full extension, ${ranged ? 'the projectile leaving the hand / weapon' : 'weapon at the end of the swing'} [8] recover: returning toward the idle pose.`;
  const avoid = CONFUSE.filter((g) => g.heroes.includes(t));
  const avoidTxt = avoid.length ? `\nMUST NOT look like the generic ${avoid.map((g) => `"${g.look}"`).join(' or ')} shared by other heroes — keep only what is listed here.` : '';
  return `Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero ${HEROES[t].name} so it is easy to tell apart from the other heroes.
BODY: ${chibiBody(h.body)}.
SIGNATURE SHAPE: ${h.mark}.
COLORS: main ${h.colors[0]}, second ${h.colors[1]}, accent ${h.colors[2]} (element ${E}). ${RAR[HEROES[t].legend]}, but keep the silhouette above.
FACE: ${h.face}.
OUTFIT: ${h.outfit}. WEAPON / ITEM: ${h.weapon}.${avoidTxt}
CELLS (facing RIGHT in 3/4 view; in every full-body cell the ${h.kind === 'spirit' ? 'feet (or floating base)' : 'feet'} stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] ${h.pose} [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
${row2}
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: ${h.fx} (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.${wk ? '\n' + wk[2] : ''}
${HERO_STYLE}
${charLock(h.kind !== 'human')}
${BG}`;
};
// kiểm tra: mọi tướng có thẻ, không hai tướng trùng màu chính hay mảng hình đặc trưng
{
  const miss = Object.keys(HEROES).filter((t) => !HERO_ID[t]);
  if (miss.length) { console.error('Thiếu thẻ nhận diện (tools/hero-id.js):', miss.join(', ')); process.exit(1); }
  const seen = {};
  for (const [t, h] of Object.entries(HERO_ID)) {
    if (!HEROES[t]) { console.error('Thẻ nhận diện thừa:', t); process.exit(1); }
    for (const f of ['kind', 'body', 'mark', 'face', 'outfit', 'weapon', 'pose', 'fx']) if (!h[f]) { console.error('Thiếu', f, 'của', t); process.exit(1); }
    for (const key of ['c:' + h.colors[0].toLowerCase(), 'm:' + h.mark.toLowerCase()]) {
      if (seen[key]) { console.error('Trùng', key, t, seen[key]); process.exit(1); }
      seen[key] = t;
    }
  }
}

const need = Object.keys(HEROES).filter((t) => !packs.has(t));
const tier = (t) => (HEROES[t].legend === 'legendary' ? 2 : HEROES[t].legend === 'epic' ? 1 : 0);
need.sort((a, b) => tier(a) - tier(b));
const missingDesc = need.filter((t) => !DESC[t] && !HERO_ID[t]);
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
// v151: vẽ lại MỌI tướng cho dễ phân biệt — nhóm dễ nhầm trước, rồi Thường → Tím → Vàng.
// Cắt bằng python3 tools/cat-sheet.py <ảnh> <mã> hero12 — lệnh cắt tự tạo assets/packs/<mã>/.v2 để ẩn prompt.
const confuseRank = (t) => { const i = CONFUSE.findIndex((g) => g.heroes.includes(t)); return i < 0 ? 99 : i; };
const redraw = Object.keys(HERO_ID).filter((t) => packs.has(t) && !fs.existsSync(path.join(ROOT, 'assets/packs', t, '.v2')))
  .sort((a, b) => confuseRank(a) - confuseRank(b) || tier(a) - tier(b));
for (const t of redraw) {
  const g = CONFUSE[confuseRank(t)];
  items.push({ group: '0B. Tướng vẽ lại cho dễ phân biệt', file: `${t}.png`, title: `${HEROES[t].name} · ${tierName[tier(t)]} · ${EL[HEROES[t].el][0]}${g ? ` · nhóm dễ nhầm: ${g.name}` : ''}`, text: heroIdPrompt(t), cut: `python3 tools/cat-sheet.py <ảnh> ${t} hero12` });
}
for (const t of need.filter((x) => tier(x) === 0)) items.push({ group: '1. Tướng Thường (ưu tiên: xuất hiện mỗi trận)', file: `${t}.png`, title: `${HEROES[t].name} · ${tierName[tier(t)]} · ${EL[HEROES[t].el][0]}`, text: heroPrompt(t), cut: `python3 tools/cat-sheet.py <ảnh> ${t} ${HERO_ID[t] ? 'hero12' : 'hero'}` });
for (const t of ['yeutinh', 'dacon', 'linhan'].filter((x) => !packs.has(x))) items.push({ group: '2. Quái còn thiếu', file: `${t}.png`, title: ENEMIES[t].name, text: enemyPrompt(t) });
for (const t of need.filter((x) => tier(x) === 1)) items.push({ group: '3. Tướng Tím', file: `${t}.png`, title: `${HEROES[t].name} · Tím · ${EL[HEROES[t].el][0]}`, text: heroPrompt(t), cut: `python3 tools/cat-sheet.py <ảnh> ${t} ${HERO_ID[t] ? 'hero12' : 'hero'}` });
for (const t of need.filter((x) => tier(x) === 2)) items.push({ group: '4. Tướng Vàng', file: `${t}.png`, title: `${HEROES[t].name} · Vàng · ${EL[HEROES[t].el][0]}`, text: heroPrompt(t), cut: `python3 tools/cat-sheet.py <ảnh> ${t} ${HERO_ID[t] ? 'hero12' : 'hero'}` });
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
// v151: quái 3×2 = 6 khung (đi 4 + đánh 2), boss 3×3 = 9 khung (đi 4 + đánh 3 + nổi giận 2) — cắt bằng tools/cat-sheet.py enemy6 / boss9
const ANIM_RULES = 'ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.';
const redoEnemyPrompt = (k) => `Create ONE image: a 576x384 enemy animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x2 grid of six equal 192x192 cells, read left to right, top to bottom.
CREATURE: ${REDO_ENEMY[k]}. Cute-but-mischievous chibi monster facing RIGHT, the body fills about 80% of the cell height, ${REDO_FLY.has(k) ? 'flying at the same height in every cell' : 'feet on the same invisible baseline near the bottom of every cell'}.
CELLS: ${REDO_FLY.has(k) ? '[1] flying, wings fully up [2] wings half down [3] wings fully down [4] wings half up (a smooth 4-frame flap loop) [5] attack wind-up: pulling back, eyes narrowed [6] diving attack: lunging forward' : '[1] walk: right foot forward [2] walk: passing, body slightly higher [3] walk: left foot forward [4] walk: passing, body slightly higher (a smooth 4-frame walk loop) [5] attack wind-up: rearing back [6] attack: lunging forward with the bite / claw / weapon'}.
${ANIM_RULES}
${STYLE}
${charLock(true)}
${BG}`;
const redoBossPrompt = (k) => `Create ONE image: a 768x768 boss animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x3 grid of nine equal 256x256 cells, read left to right, top to bottom.
BOSS: ${REDO_BOSS[k]}. Big, menacing but still cute chibi boss facing RIGHT, the body fills about 85% of the cell height, feet on the same invisible baseline near the bottom of every cell.
CELLS: [1] walk: front foot forward [2] walk: passing, body higher [3] walk: back foot forward [4] walk: passing, body higher (a smooth 4-frame walk loop) [5] attack wind-up: weapon raised high [6] attack swing: weapon coming down with ONE short pale swoosh [7] attack impact: weapon low, small dust burst [8] rage: body glowing red-orange, roaring, arms wide [9] rage: same, stronger glow, head thrown back.
${ANIM_RULES}
${STYLE}
${charLock(true)}
${BG}`;
const redone = (k) => fs.existsSync(path.join(ROOT, 'assets/packs', k, '.redo'));
for (const k of Object.keys(REDO_ENEMY).filter((x) => REDO_ENEMY_FORCE.has(x) ? !redone(x) : sameFrames(x))) items.push({ group: '10. Quái gen lại (đủ dáng)', file: `${k}.png`, title: `Quái · ${ENEMIES[k].name}`, text: redoEnemyPrompt(k), cut: `python3 tools/cat-sheet.py <ảnh> ${k} enemy6` });
for (const k of Object.keys(REDO_BOSS).filter((x) => REDO_FORCE.has(x) ? !fs.existsSync(path.join(ROOT, 'assets/packs', x, '.redo')) : sameFrames(x))) items.push({ group: '11. Boss gen lại (đủ dáng)', file: `${k}.png`, title: `Boss · ${ENEMIES[k].name}`, text: redoBossPrompt(k), cut: `python3 tools/cat-sheet.py <ảnh> ${k} boss9` });
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
// v156: đế đặt tướng (ô trên bản đồ) + kết cấu đường quái đi + cổng thành theo chủ đề — đang vẽ bằng code, có ảnh thì game tự dùng
const SPOT_LOOK = 'a low round pedestal / plinth seen from a 3/4 top-down view, so it looks like a FLAT WIDE ELLIPSE (about 3 wide : 2 tall, the top face fills ~75% of the cell width), short visible side rim only a few pixels thick, the top face is EMPTY and flat (a hero stands on it), carved Dong Son bronze-drum ring pattern (sun-star in the middle, circle-dot band, zigzag rim) engraved very lightly on the top face';
const SPOT_SHEETS = {
  'de-tuong': { title: 'Đế đặt tướng · 5 trạng thái', dir: 'tiles', cells: [
    ['de-tuong-thuong.png', `${SPOT_LOOK}, plain weathered grey-brown stone with dull bronze inlay, calm (normal empty spot)`],
    ['de-tuong-san-sang.png', `${SPOT_LOOK}, same stone but the bronze inlay softly glows warm cream-white (ready to place a hero), faint light on the top face only`],
    ['de-tuong-chon.png', `${SPOT_LOOK}, same stone with a bright gold rim glowing around the top edge and a golden sun-star (selected spot)`],
    ['de-tuong-ngap.png', `${SPOT_LOOK}, the stone half sunk under shallow blue river water, ripples and a few duckweed leaves on the water around it (flooded spot)`],
    ['de-tuong-nui.png', `${SPOT_LOOK}, the stone pushed up on a small green-brown rocky mountain mound with grass tufts on the sides, top face still flat and empty (raised mountain spot)`],
  ] },
  'de-tuong-chu-de': { title: 'Đế đặt tướng · theo chủ đề bản đồ', dir: 'tiles', cells: [
    ['de-tuong-co.png', `${SPOT_LOOK}, made of packed earth with a ring of short green grass and two tiny reeds (river / marsh / rice-field maps)`],
    ['de-tuong-dat.png', `${SPOT_LOOK}, a flat old tree-stump slice with roots and moss around the rim (forest map)`],
    ['de-tuong-da.png', `${SPOT_LOOK}, dark cave stone slab with two small blue glowing crystals at the rim (cave map)`],
    ['de-tuong-cat.png', `${SPOT_LOOK}, pale sandstone with small seashells and a bit of sand at the rim (sea shore map)`],
    ['de-tuong-gach.png', `${SPOT_LOOK}, fitted old red-brown bricks and a bronze rim like a citadel tower base (citadel map)`],
  ] },
};
const spotPrompt = (cells) => `Create ONE image: a ${cells.length * 128}x128 row of ${cells.length} equal 128x128 square game map tiles for a cute mobile tower-defense game, one per cell, left to right:
${cells.map((x, i) => `[${i + 1}] ${x}`).join('  ')}.
${DRUM}. All cells: the same camera angle, the same size and the same ellipse shape, centered in the cell, readable at 50 px, no characters on top, no text, no letters, no numbers.
${BG}`;
for (const [k, v] of Object.entries(SPOT_SHEETS)) {
  sheetsJson[k] = { dir: v.dir, files: v.cells.map((c) => c[0]) };
  if (!v.cells.every((c) => done(`${v.dir}/${c[0]}`))) items.push({ group: '14. Đế đặt tướng (ô trên bản đồ)', file: `${k}.png`, title: v.title, text: spotPrompt(v.cells.map((c) => c[1])), cut: `python3 tools/cat-items.py <ảnh> ${k}` });
}
const ROAD_TEX = {
  nuoc: 'calm shallow river water seen from straight above: blue-teal water with soft light ripples, a few tiny duckweed leaves, gentle darker patches (Sông / Đầm maps)',
  dat: 'a worn forest dirt trail seen from straight above: packed brown earth, small pebbles, a few fallen dry leaves and thin root bits (Rừng map)',
  da: 'old cave floor paving seen from straight above: irregular rounded grey-brown flagstones with dark gaps and a little moss (Hang map)',
  de: 'the top of an earthen rice-field dike seen from straight above: packed light-brown clay, faint footprints, tiny grass tufts (Đồng map)',
  cat: 'wet beach sand seen from straight above: darker damp sand with ripple marks, tiny shell bits, a few foam traces (Biển map)',
  gach: 'an ancient citadel road seen from straight above: worn brown-grey fired bricks and stone slabs in a running bond, chipped edges, moss in the joints (Thành map)',
};
const roadPrompt = (k) => `Create ONE image: a 512x512 SEAMLESS TILEABLE texture (the left edge continues the right edge, the top edge continues the bottom edge, no visible seam when repeated) for the road of a cute mobile tower-defense game: ${ROAD_TEX[k]}.
Flat even lighting, no strong shadows, no perspective, no vignette, no single big object, no border, no road markings, no dashed lines. Soft hand-painted cartoon look matching a Dong Son bronze-drum themed game, medium contrast so characters walking on it stay readable. No text, no watermark, full bleed.`;
for (const k of Object.keys(ROAD_TEX)) {
  sheetsJson[`duong-${k}`] = { dir: 'tiles', files: [`duong-${k}.jpg`], texture: 512 };
  if (!done(`tiles/duong-${k}.jpg`)) items.push({ group: '15. Đường quái đi (kết cấu lặp 512×512)', file: `duong-${k}.png`, title: `Kết cấu đường · ${k}`, text: roadPrompt(k), cut: `python3 tools/cat-items.py <ảnh> duong-${k}` });
}
const GATE_CELLS = [
  ['cong-phong-chau.png', 'the gate tower of Phong Chau capital: a wooden-and-earth fortress gate with a dark arched doorway, a bronze drum disc above the door, a red banner on top'],
  ['cong-ban-rung.png', 'a forest village gate: a stilt house with a thatched roof behind a bamboo palisade gate, small red cloth on a pole'],
  ['cong-hang.png', 'a cave mouth gate: a dark rocky cave entrance framed by stalactites and two carved stone pillars with bronze rings'],
  ['cong-lang-tre.png', 'a Vietnamese bamboo village gate (cong lang): two bamboo posts with a curved thatched-and-tile roof, a red plaque with a golden sun-star'],
  ['cong-co-loa.png', 'the spiral citadel of Co Loa: a small round earthen wall ring with a stone gate tower in the middle, red flag on top'],
];
sheetsJson['cong-thanh'] = { dir: 'tiles', files: GATE_CELLS.map((c) => c[0]) };
if (!GATE_CELLS.every((c) => done(`tiles/${c[0]}`))) items.push({ group: '16. Cổng thành cuối đường (theo chủ đề)', file: 'cong-thanh.png', title: 'Cổng thành · 5 chủ đề',
  text: `Create ONE image: a 640x128 row of 5 equal 128x128 square game map buildings for a cute mobile tower-defense game, one per cell, left to right, all seen from the same 3/4 top-down view, the doorway facing the viewer, the base sitting near the bottom of the cell:
${GATE_CELLS.map((c, i) => `[${i + 1}] ${c[1]}`).join('  ')}.
${DRUM}. Each building: one bold readable shape at 60 px, no characters, no text, no letters, no numbers.
${BG}`, cut: 'python3 tools/cat-items.py <ảnh> cong-thanh' });
// v163: icon NHỎ (chỉ số, trạng thái, tiền tệ, ngũ hành…) đang vẽ bằng SVG/emoji — hiện ở 13–20 px nên nét phải rất to, ít chi tiết.
// Cắt: python3 tools/cat-items.py <ảnh> <mã tấm>  → assets/ui/ic-<tên>.png (64 px). Bảng kê chỗ dùng: docs/ICON-NHO.md
const IC_SHEETS = {
  'ic-chi-so-1': [['giap', 'armor: a sturdy bronze kite shield'], ['khang-phep', 'magic resistance: a glowing purple orb inside a bronze ring'], ['toc-chay', 'move speed: one green-brown straw sandal with three speed lines'], ['toc-danh', 'attack speed: a yellow lightning bolt'], ['sat-thuong', 'damage: a short bronze sword pointing up-right']],
  'ic-chi-so-2': [['mau', 'health: a big red blood drop'], ['chi-mang', 'critical hit: an orange-red spiky burst star'], ['tam-danh', 'attack range: a red and cream round target with an arrow in the center'], ['hoi-chieu', 'cooldown: a bronze hourglass with blue sand'], ['nang-luong', 'energy / mana: a big blue water drop with a white sparkle']],
  'ic-chi-so-3': [['suc-manh', 'strength: a clenched orange fist'], ['nhanh-nhen', 'agility: a green Lac bird feather'], ['tri-tue', 'intelligence: an open blue bamboo scroll book'], ['giam-sat-thuong', 'damage reduction: a teal shield with a white downward arrow'], ['xuyen-giap', 'armor penetration: a bronze spear tip cracking through a small shield']],
  'ic-trang-thai-1': [['cham', 'slowed: a small brown snail'], ['choang', 'stunned: three yellow stars circling in a ring'], ['dot', 'burning: an orange-red flame'], ['doc', 'poisoned: a green poison drop with a tiny skull'], ['dong-bang', 'frozen: a light-blue ice crystal snowflake']],
  'ic-trang-thai-2': [['sa-lay', 'stuck in mud: brown mud puddle with two bubbles'], ['khien', 'shield: a glowing cyan bubble dome'], ['hoi-mau', 'healing: a green plus cross with a glow'], ['noi-gian', 'enraged: a red angry vein mark (four curved strokes)'], ['bay', 'flying: one white feathered wing']],
  'ic-trang-thai-3': [['boss', 'boss: a red demon crown with two small horns'], ['cam-lang', 'silenced: a cream speech bubble crossed by a red slash'], ['tinh-anh', 'elite: a purple faceted gem'], ['lan', 'diving underwater: two blue wave lines with bubbles']],
  'ic-tien-te': [['tui-vang', 'gold reward: a small cloth pouch with a gold coin on it'], ['diem-ky-nang', 'skill point: a yellow star on a dark-green bronze disc'], ['diem-an-phu', 'rune point: a small grey carved stone seal with a golden sun mark'], ['luc-chien', 'combat power: two crossed bronze swords'], ['cap-do', 'level up: two green upward chevrons']],
  'ic-khac': [['kho', 'hard mode: a cream skull with red glowing eyes'], ['nuoc-dang', 'flood rising: blue water waves with an upward arrow'], ['khac-che', 'element counter: an orange arrow hitting a small yellow spark'], ['nang-cap', 'upgrade: a fat green upward arrow'], ['xuyen-phep', 'magic penetration: a purple glowing spear tip piercing a ring']],
  'ic-ngu-hanh': [['hanh-kim', 'Metal element: a silver-white bronze axe blade on a round grey disc'], ['hanh-moc', 'Wood element: a green sprouting leaf on a round green disc'], ['hanh-thuy', 'Water element: two blue waves on a round blue disc'], ['hanh-hoa', 'Fire element: an orange flame on a round red disc'], ['hanh-tho', 'Earth element: a brown mountain peak on a round ochre disc']],
};
const icPrompt = (cells) => `Create ONE image: a ${cells.length * 128}x128 row of ${cells.length} equal 128x128 square TINY game UI icons (status / stat icons), one per cell, left to right:
${cells.map(([, d], i) => `[${i + 1}] ${d}`).join('  ')}.
Dong Son bronze-drum style kept minimal: warm bronze gold #C9963A and dark green patina #2F6B5E accents, flat cartoon shading for a cute mobile game, at most one tiny zigzag or circle-dot accent (no rings, no birds, no busy engraving). These icons are shown VERY SMALL (16-20 px on a phone): one big simple silhouette that fills about 80% of the cell, VERY thick dark-brown outline #2A1608, at most 2-3 flat colors, no thin lines, no tiny details, no background shapes unless described, high contrast, no text, no letters, no numbers.
${BG}`;
for (const [k, v] of Object.entries(IC_SHEETS)) {
  sheetsJson[k] = { dir: 'ui', size: 64, files: v.map(([n]) => `ic-${n}.png`) };
  if (!v.every(([n]) => done(`ui/ic-${n}.png`))) items.push({ group: '17. Icon nhỏ (chỉ số, trạng thái, tiền tệ)', file: `${k}.png`, title: `Icon nhỏ · ${k}`, text: icPrompt(v), cut: `python3 tools/cat-items.py <ảnh> ${k}` });
}
fs.writeFileSync(path.join(ROOT, 'tools/item-sheets.json'), JSON.stringify(sheetsJson, null, 1));

// ============================================================
// v163: thành phần giao diện còn vẽ bằng code (rà bằng ảnh chụp Playwright các màn: kết quả, chọn ải, chuẩn bị, trận, Nghỉ chân, sính lễ).
// Không gồm icon nhỏ chỉ số / trạng thái / tiền tệ (nhánh khác làm). Game tự dùng ảnh khi có file, chưa có thì giữ hình vẽ bằng code.
// Tranh cảnh: full bleed, đặt thẳng vào assets/scenes/. Khung / nút / thanh: nền hồng tím, cắt bằng python3 tools/cat-khung.py <ảnh> <mã>.
const SCENE_STYLE = 'Painterly cute mobile-game illustration in the same family as the main menu key art: warm Dong Son bronze-drum motifs (sun-star, Lac birds, zigzag bands) worked into the scenery, soft cel shading, rich but readable colors, chibi characters with big round eyes and thick dark-brown outlines #2A1608. No text, no letters, no numbers, no UI, no frame, no watermark, full bleed.';
const CH_SCENE = {
  sontinh: { name: 'Sơn Tinh – Thủy Tinh (Phong Châu citadel of the Hung Kings by the Da river)',
    win: 'Sơn Tinh, the mountain god in a leafy green-brown robe with a stone crown, stands on a green mountain that has just risen above the river, raising his arms; the flood water recedes, sun-star breaks through the clouds, Phong Châu citadel with bronze roofs safe and dry, villagers cheering on the walls',
    lose: 'night storm over Phong Châu citadel: the flood of Thủy Tinh breaks the earthen walls, the bronze gate half under water, broken banners floating, giant water snake and dark waves curling around the towers, lightning in purple clouds; sad but not gory' },
  thachsanh: { name: 'Thạch Sanh (forest temple and highland village)',
    win: 'Thạch Sanh, young woodcutter hero with bare chest, red headband and a bronze axe and bow, stands victorious in front of the old forest temple at dawn; the ogre Chằn Tinh lies defeated (cartoon stars over its head) in the background, villagers and their stilt house safe, fireflies turning into morning light',
    lose: 'night in the ancient forest: the green ogre Chằn Tinh and little forest goblins swarm into the stilt-house village and the small temple, temple doors broken open, torches knocked over, eerie green mist and glowing red eyes among the banyan roots; spooky but cute, no gore' },
  giong: { name: 'Thánh Gióng (Phù Đổng village, Red River delta rice fields)',
    win: 'Saint Gióng, giant young warrior in iron armor riding a fire-breathing iron horse, holding an uprooted bamboo, at sunset over golden rice fields; the Ân invaders flee in the distance, Phù Đổng village gate with bamboo hedge safe, villagers waving',
    lose: 'Phù Đổng village under attack: Ân invader soldiers in horned helmets and the Ân King on a dark warhorse charge through the bamboo village gate, thatched roofs on fire, red smoke over the rice fields, a broken bamboo hedge; dramatic but not gory' },
  llq: { name: 'Lạc Long Quân (East Sea coast, dragon king)',
    win: 'Lạc Long Quân, the dragon lord in jade-green scale armor with a pearl crown, stands on a sea rock above calm turquoise water at sunrise, a friendly sea dragon spirit coiling behind him; the giant fish demon Ngư Tinh defeated sinking far away, fishing boats returning safely to the shore village',
    lose: 'stormy East Sea: the giant fish demon Ngư Tinh with huge jaws rises from black waves, sharks and crab monsters crash onto the shore, fishing boats smashed, the stilt-house fishing village flooded by surging waves, lightning; scary but cute, no gore' },
  adv: { name: 'An Dương Vương (spiral Cổ Loa citadel)',
    win: 'King An Dương Vương in red royal robe and golden crown holds the magic crossbow on the spiral walls of Cổ Loa citadel, the Golden Turtle god Kim Quy smiling beside him, bronze arrows of light raining on the fleeing Triệu army, sun-star sky, banners flying',
    lose: 'Cổ Loa citadel falls at dusk: Triệu Đà soldiers and war elephants pour through the broken spiral earthen walls, watchtowers burning, the magic crossbow lying broken on the ground, fallen bronze banners, orange smoke in the sky; dramatic but not gory' },
};
const resultPrompt = (k, win) => `Create ONE image: a 768x832 portrait illustration (full bleed) for the ${win ? 'VICTORY' : 'DEFEAT'} result screen of a cute mobile tower-defense game based on Vietnamese folk legends, chapter ${CH_SCENE[k].name}.
SCENE: ${CH_SCENE[k][win ? 'win' : 'lose']}.
COMPOSITION: main subject in the lower 2/3, keep the top-left corner calm (a small label is drawn there), readable at 320 px wide. ${win ? 'Mood: triumphant, warm golden light.' : 'Mood: dark and tense, cold or fiery shadows, but still cute and family-friendly.'}
${SCENE_STYLE}`;
const CAMP_DESC = {
  sontinh: 'the Da river valley seen from above: winding blue river, green Tản Viên mountains, rice terraces, small bronze-roofed villages and Phong Châu citadel at the far right',
  thachsanh: 'an ancient misty forest seen from above: giant banyan tree, a small temple, a dark cave mouth in rocky hills, a stilt-house village',
  giong: 'Red River delta rice fields seen from above: golden paddies with dikes, bamboo groves, Phù Đổng village, Sóc mountain in the distance',
  llq: 'the East Sea coast seen from above: turquoise sea with islands of Hạ Long, sandy beaches, coral, a fishing village, a lake shaped like a fox (Hồ Tây)',
  adv: 'the spiral Cổ Loa citadel seen from above: three spiral earthen walls, moats, bronze banners, villages and fields around, the sea far to the right',
};
const campPrompt = (k) => `Create ONE image: a 1280x768 illustrated campaign map background (bird's-eye view, slightly tilted, like a painted fantasy map) for the level-select screen of a cute mobile tower-defense game, chapter ${CH_SCENE[k].name}: ${CAMP_DESC[k]}.
Keep the middle band fairly calm (the game draws level badges and a dotted route on top). Subtle Dong Son bronze-drum border ornaments at the corners only.
${SCENE_STYLE}`;
for (const [k, v] of Object.entries(CH_SCENE)) for (const win of [false, true]) {
  const f = `scenes/${win ? 'thang' : 'thua'}-${k}.png`;
  if (!done(f)) items.push({ group: '18. Tranh kết quả theo chương (thay SVG)', file: f, title: `${win ? 'Thắng' : 'Thua'} · ${v.name.split(' (')[0]}`, cut: `đặt thẳng vào assets/${f}`, text: resultPrompt(k, win) });
}
for (const k of Object.keys(CH_SCENE)) {
  const f = `scenes/chuong-${k}.png`;
  if (!done(f)) items.push({ group: '19. Nền bản đồ chọn ải theo chương', file: f, title: `Bản đồ chương · ${CH_SCENE[k].name.split(' (')[0]}`, cut: `đặt thẳng vào assets/${f}`, text: campPrompt(k) });
}
const NEN_PHU = `Create ONE image: a 1792x832 wide background texture (full bleed) for secondary screens (prepare for battle, results, rewards) of a cute mobile tower-defense game based on Vietnamese folk legends.
CONTENT: a dark aged bronze drum surface seen from the front, very low contrast: faint concentric rings, a dim sun-star in the center, Lac birds and zigzag bands engraved softly, warm dark brown #1A140E to deep patina green #16231F, a soft vignette. It must stay DARK and calm so white and gold text is readable on top.
No text, no letters, no numbers, no UI, no frame, no watermark.`;
if (!done('scenes/nen-man-phu.png')) items.push({ group: '20. Nền màn phụ (Chuẩn bị / Kết quả / Phần thưởng)', file: 'scenes/nen-man-phu.png', title: 'Nền đồng tối cho màn phụ', cut: 'đặt thẳng vào assets/scenes/nen-man-phu.png', text: NEN_PHU });
// tấm khung / nút / thanh — cols × rows ô bằng nhau, tên file theo thứ tự ô; max = cạnh dài nhất sau khi cắt
const UI_FRAMES = {
  'khung-bang': { cols: 1, rows: 1, max: 384, size: '1024x1024', title: 'Khung bảng / popup (giấy dó viền đồng, 9 mảnh)', cells: [
    'one square panel frame: thick bronze border with ornate Dong Son corner pieces (sun-star discs) and PLAIN straight edges between the corners (so the frame can be stretched as 9-slice), the inside filled with flat dark aged paper #17130F with very faint fiber texture; corners take about 22% of the width'], files: ['khung-bang.png'] },
  'nut-chu-nhat': { cols: 3, rows: 2, max: 384, size: '1536x512', title: 'Nút chữ nhật vàng + đồng · thường / nhấn / khóa', cells: [
    'wide rectangular GOLD button (3:1), polished gold-bronze with a zigzag border and small sun-star studs at both ends, empty smooth middle for text — NORMAL state, bright with a top highlight',
    'the same GOLD button — PRESSED state: slightly darker, highlight moved to the bottom, looks pushed in by 2 px',
    'the same GOLD button — DISABLED state: desaturated grey-brown, dull, no shine',
    'wide rectangular BRONZE button (3:1), dark brown-bronze with patina-green trims and a circle-dot border, empty middle — NORMAL state',
    'the same BRONZE button — PRESSED state: darker, pushed in',
    'the same BRONZE button — DISABLED state: grey, dull'],
    files: ['nut-vang-thuong.png', 'nut-vang-nhan.png', 'nut-vang-khoa.png', 'nut-dong-thuong.png', 'nut-dong-nhan.png', 'nut-dong-khoa.png'] },
  'nut-tron': { cols: 3, rows: 1, max: 160, size: '768x256', title: 'Nút tròn (quay lại / đóng) · thường / nhấn / khóa', cells: [
    'round bronze drum-face button with a ring of Lac birds on the rim and an EMPTY dark center (an icon is drawn on top) — NORMAL',
    'the same round button — PRESSED: darker, pushed in',
    'the same round button — DISABLED: grey and dull'],
    files: ['nut-tron-thuong.png', 'nut-tron-nhan.png', 'nut-tron-khoa.png'] },
  'thanh-mau': { cols: 1, rows: 3, max: 512, size: '1024x384', title: 'Khung thanh máu boss / tướng / quái', cells: [
    'very long thin BOSS health bar frame (about 8:1): dark iron and red-bronze with a small horned demon-mask cap on the left end and a spiked cap on the right end; the inside of the bar is an EMPTY flat magenta slot',
    'long thin HERO health bar frame (about 8:1): slim polished bronze with tiny sun-star rivets at both ends; the inside is an EMPTY flat magenta slot',
    'long thin ENEMY health bar frame (about 8:1): slim dark iron with tiny claw tips at both ends; the inside is an EMPTY flat magenta slot'],
    files: ['thanh-mau-boss.png', 'thanh-mau-tuong.png', 'thanh-mau-quai.png'] },
  'khung-thanh-day': { cols: 1, rows: 1, max: 1200, size: '1600x320', title: 'Khung thanh đáy (chợ tướng trong trận)', cells: [
    'one very wide low tray frame (5:1) for the bottom bar of a game screen: carved bronze rim with a zigzag band, small Lac birds at both ends, a slightly raised center, the inside filled with flat dark bronze #1E1810 (cards are drawn on top)'],
    files: ['khung-thanh-day.png'] },
  'khung-the-cho': { cols: 4, rows: 1, max: 192, size: '1024x256', title: 'Khung thẻ chợ tướng + nút đổi', cells: [
    'landscape card frame (5:4) of plain bronze with rounded corners and an EMPTY magenta window inside (a hero portrait is drawn there) — NORMAL',
    'the same card frame glowing gold with sparkles — CAN MERGE (ghép)',
    'the same card frame dull grey-brown and cracked — NOT ENOUGH GOLD',
    'small square bronze button plate with rounded corners and an EMPTY dark center — REROLL button base'],
    files: ['the-cho-thuong.png', 'the-cho-ghep.png', 'the-cho-thieu.png', 'nut-doi-cho.png'] },
  'dai-thong-bao': { cols: 1, rows: 1, max: 768, size: '1536x256', title: 'Dải thông báo (tên chiêu lớn, boss tới)', cells: [
    'one long horizontal ribbon banner (6:1): deep red cloth with gold-bronze edges, folded swallow-tail ends, small sun-star medallions at both ends, the long middle EMPTY and plain for text'],
    files: ['dai-thong-bao.png'] },
  'huy-hieu-ai': { cols: 3, rows: 1, max: 160, size: '768x256', title: 'Huy hiệu ải trên bản đồ · mở / đang chọn / khóa', cells: [
    'round level badge: bronze drum disc with a sun-star rim and an EMPTY flat center (a number is drawn on top) — OPEN',
    'the same badge glowing bright gold with a soft halo — SELECTED',
    'the same badge as dark grey stone, cracked, no glow — LOCKED'],
    files: ['ai-mo.png', 'ai-chon.png', 'ai-khoa.png'] },
};
const framePrompt = (k) => { const v = UI_FRAMES[k]; const [W, H] = v.size.split('x').map(Number);
  return `Create ONE image: a ${v.size} game UI sheet${v.cols * v.rows > 1 ? `, an invisible ${v.cols}x${v.rows} grid of ${v.cols * v.rows} equal ${W / v.cols}x${H / v.rows} cells, one element per cell, read left to right, top to bottom` : ', one element centered'}:
${v.cells.map((x, i) => (v.cells.length > 1 ? `[${i + 1}] ${x}` : x)).join('\n')}.
${DRUM}. Same lighting and the same bronze palette in every cell; elements fill about 90% of their cell; straight, symmetric, front view (no perspective), no text, no letters, no numbers, no icons inside.
${BG}`; };
const framesJson = {};
for (const [k, v] of Object.entries(UI_FRAMES)) {
  framesJson[k] = { cols: v.cols, rows: v.rows, max: v.max, dir: 'ui', files: v.files };
  if (!v.files.every((f) => done('ui/' + f))) items.push({ group: '21. Khung / nút / thanh giao diện (trống đồng, nền hồng tím)', file: `${k}.png`, title: v.title, cut: `python3 tools/cat-khung.py ${k}.png ${k}`, text: framePrompt(k) });
}
fs.writeFileSync(path.join(ROOT, 'tools/ui-frames.json'), JSON.stringify(framesJson, null, 1));
items.forEach((it, i) => { it.n = i + 1; });
const noIcon = need.filter((x) => !ICONS[x]);  // tướng mới chưa có mô tả icon
if (noIcon.length) console.error('Chưa có mô tả icon:', noIcon.join(', '));

// Markdown
let out = `# Prompt Gemini đầy đủ — mỗi ảnh một prompt (${items.length} ảnh)\n\n`;
out += 'Mỗi khối dán **riêng một lần** vào Gemini (đính kèm `docs/mau-lac-tuong.png` làm mẫu nét vẽ nếu được), tải ảnh về và đặt **đúng tên file** ghi trên khối. Gen theo thứ tự từ trên xuống: phần 0 (nền menu tên mới) và 1–4 là cần thiết, phần 5–7 là tùy chọn.\n\n> **Phần 0B — vẽ lại tướng cho dễ phân biệt:** mỗi tướng có dáng, mảng hình và màu riêng (thẻ nhận diện `tools/hero-id.js`, so sánh nhóm dễ nhầm ở `docs/tuong-de-nham.png`). Mỗi tấm 12 khung chuyển động (4×3: thở ×3 + chân dung · đánh ×4 · chiêu ×3 + bị đánh); cắt bằng `python3 tools/cat-sheet.py <ảnh> <mã> hero12` — lệnh cắt tự tạo `assets/packs/<mã>/.v2` để ẩn prompt tướng đó và tự ghi số khung vào `js/render.js` (nhớ tăng phiên bản game). Quái gen lại cắt bằng `enemy6` (3×2), boss bằng `boss9` (3×3); lệnh cắt ghi ngay dưới tên mỗi khối.\n\n> **Phần 0 — đổi tên game thành \"Thần Thoại Việt\" (v145):** ảnh nền menu mới thay `assets/ui/nen-menu.jpg` (ảnh cũ chủ đề Sơn Tinh – Thủy Tinh, đang dùng tạm). Logo chữ là tùy chọn: AI hay viết sai dấu tiếng Việt — kiểm tra kỹ từng dấu (ầ, ạ, ệ); sai thì bỏ, game tự hiện chữ HTML. Có ảnh đúng thì xoá nền magenta, lưu `assets/ui/logo-tua.png`. Các ảnh cảnh khác (nền thắng/thua, truyện) hiện không có chữ tên game nên không cần gen lại.\n\n';
let g = '';
for (const it of items) {
  if (it.group !== g) { g = it.group; out += `\n## ${g}\n`; }
  out += `\n### ${it.n}. ${it.title} → \`${it.file}\`\n${it.cut ? `Cắt: \`${it.cut}\`\n` : ''}\`\`\`\n${it.text}\n\`\`\`\n`;
}
fs.writeFileSync(path.join(ROOT, 'docs/PROMPT_GEMINI_FULL.md'), out);
// Văn bản thường (.txt): không ký hiệu Markdown, mỗi prompt kẹp giữa hai đường kẻ để dễ chép
let txt = `PROMPT GEMINI ĐẦY ĐỦ — MỖI ẢNH MỘT PROMPT (${items.length} ảnh)\n`;
txt += 'Mỗi khối dán riêng một lần vào Gemini (đính kèm docs/mau-lac-tuong.png làm mẫu nét vẽ nếu được), tải ảnh về và đặt đúng tên file ghi trên khối.\n';
txt += '\n' + STYLE_BIBLE;
g = '';
for (const it of items) {
  if (it.group !== g) { g = it.group; txt += `\n\n${'='.repeat(60)}\n${g.toUpperCase()}\n${'='.repeat(60)}\n`; }
  txt += `\n${it.n}. ${it.title}  ->  Tên file: ${it.file}${it.cut ? `  ->  Cắt: ${it.cut}` : ''}\n${'-'.repeat(60)}\n${it.text}\n${'-'.repeat(60)}\n`;
}
fs.writeFileSync(path.join(ROOT, 'docs/PROMPT_GEMINI_FULL.txt'), txt);
fs.writeFileSync(path.join(ROOT, 'docs/prompts.json'), JSON.stringify(items, null, 1));
console.log('items', items.length, 'heroes', need.length);

// Bộ xuất cho AI khác / họa sĩ (docs/CHUAN-ANIMATION.md): mỗi dòng một nhân vật, prompt đầy đủ — mở bằng Excel / Google Sheets.
// Có cả tướng đã có ảnh (để vẽ lại bằng công cụ khác), không phụ thuộc danh sách "còn thiếu" ở trên.
const csvCell = (v) => `"${String(v).replace(/"/g, '""')}"`;
const csv = (rows) => '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
const heroRows = [['ma', 'ten', 'bac', 'he', 'kieu_luoi', 'kich_thuoc', 'ten_file', 'lenh_cat', 'prompt']];
for (const t of Object.keys(HERO_ID).sort((a, b) => tier(a) - tier(b) || HEROES[a].el.localeCompare(HEROES[b].el)))
  heroRows.push([t, HEROES[t].name, tierName[tier(t)], { kim: 'Kim', moc: 'Mộc', thuy: 'Thủy', hoa: 'Hỏa', tho: 'Thổ' }[HEROES[t].el], 'hero12 (4x3, ô 192)', '768x576', `${t}.png`, `python3 tools/cat-sheet.py ${t}.png ${t} hero12`, heroIdPrompt(t)]);
fs.writeFileSync(path.join(ROOT, 'docs/prompts-tuong.csv'), csv(heroRows));
const foeRows = [['ma', 'ten', 'loai', 'kieu_luoi', 'kich_thuoc', 'ten_file', 'lenh_cat', 'prompt']];
for (const k of Object.keys(REDO_ENEMY)) foeRows.push([k, ENEMIES[k].name, REDO_FLY.has(k) ? 'Quái bay' : 'Quái', 'enemy6 (3x2, ô 192)', '576x384', `${k}.png`, `python3 tools/cat-sheet.py ${k}.png ${k} enemy6`, redoEnemyPrompt(k)]);
for (const k of Object.keys(REDO_BOSS)) foeRows.push([k, ENEMIES[k].name, 'Boss', 'boss9 (3x3, ô 256)', '768x768', `${k}.png`, `python3 tools/cat-sheet.py ${k}.png ${k} boss9`, redoBossPrompt(k)]);
fs.writeFileSync(path.join(ROOT, 'docs/prompts-quai.csv'), csv(foeRows));
console.log('csv tướng', heroRows.length - 1, '· quái / boss', foeRows.length - 1);
// Bản chữ thường của hai CSV trên: mỗi nhân vật một khối, chép từng khối dán vào AI.
const blk = (rows, title) => `${title}\n${'='.repeat(60)}\n` + rows.slice(1).map((r) => {
  const o = Object.fromEntries(rows[0].map((k, i) => [k, r[i]]));
  return `\n${o.ten} (${o.ma}) · ${o.bac || o.loai}${o.he ? ' · ' + o.he : ''} · ảnh ${o.kich_thuoc} · lưu tên: ${o.ten_file}\n${'-'.repeat(60)}\n${o.prompt}\n${'-'.repeat(60)}\n`;
}).join('');
fs.writeFileSync(path.join(ROOT, 'docs/PROMPT-GUI-AI.txt'), 'PROMPT GỬI AI TẠO ẢNH — mỗi khối là một ảnh. Chép phần giữa hai đường kẻ, dán vào AI, đính kèm ảnh lưới docs/mau-luoi/ (tướng: hero12.png · quái: enemy6.png hoặc enemy6-bay.png · boss: boss9.png) và thêm câu: "the attached grid is only a layout guide — do NOT draw its numbers, lines or labels". Lưu ảnh về đúng tên ghi trên khối. Chuẩn đầy đủ: docs/CHUAN-ANIMATION.txt\n\n' + STYLE_BIBLE + '\n'
  + blk(heroRows, `TƯỚNG (${heroRows.length - 1})`) + '\n\n' + blk(foeRows, `QUÁI + BOSS (${foeRows.length - 1})`));

// v175: docs/PROMPT-CAN-GEN.txt — CHỈ những ảnh CÒN PHẢI GEN (gửi thẳng cho AI tạo ảnh, có chỉ thị rõ ở đầu file).
// Tướng: mọi tướng chưa có assets/packs/<mã>/.v2 (cat-sheet.py hero12 tự tạo) — vẽ MỚI hoàn toàn, thay ảnh cũ.
// Quái / boss: như nhóm 10–11 ở trên (chưa .redo hoặc chỉ có 1 dáng). Hiệu ứng theo hệ: chưa có file trong assets/fx|vfx.
const EL_EN = { kim: 'METAL', moc: 'WOOD', thuy: 'WATER', hoa: 'FIRE', tho: 'EARTH' };
const EL_VI = { kim: 'Kim', moc: 'Mộc', thuy: 'Thủy', hoa: 'Hỏa', tho: 'Thổ' };
const FX_EL = {
  kim: { dan: 'a spinning silver-white metal blade shard with a bronze edge and a tiny golden spark tail, pointing RIGHT',
    trung: 'silver-white star sparks and tiny metal shards flying out from the center, a sharp white cross flash',
    no: 'a burst of silver blades and golden sun-star rays exploding outward, sharp metal shards, a bright white core',
    vong: 'silver-white and pale gold, a ring of small sword-blade shapes pointing outward' },
  moc: { dan: 'a glowing green leaf dart with a small curling vine and two tiny leaves behind it, pointing RIGHT',
    trung: 'green leaves and small yellow pollen dots bursting out, a soft green flash',
    no: 'thorny green vines and leaves bursting up from the ground in a ring, flowers blooming, green spores',
    vong: 'fresh green with brown wood, a ring of leaves and tiny sprouts' },
  thuy: { dan: 'a blue water orb with a white swirl inside and a short splashing water tail, flying RIGHT',
    trung: 'a blue water splash: droplets flying out in a crown shape, white foam',
    no: 'a blue water geyser splash: a ring of big waves bursting outward, droplets and white foam',
    vong: 'light blue and white, a ring of curling waves and droplets' },
  hoa: { dan: 'a red-orange fireball with a yellow core and a short flickering flame tail, flying RIGHT',
    trung: 'a small fire burst: orange flames and embers popping out, a yellow flash',
    no: 'a fiery explosion: orange-red fireball, flames and embers, then dark smoke puffs',
    vong: 'red-orange and gold, a ring of small flames' },
  tho: { dan: 'a golden-brown rock clod with small cracks and a dusty trail, flying RIGHT',
    trung: 'a dust puff with small brown pebbles bouncing out, a yellow-brown flash',
    no: 'an earth eruption: rock chunks and dirt blasting up in a ring, a dust cloud',
    vong: 'ochre yellow and earth brown, a ring of small rocks and mountain-peak shapes' },
};
const FXS = (a) => fs.existsSync(path.join(ROOT, 'assets', a));
const STRIP6 = (eff, bg) => `Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames (frame 1 = start, frames 3-4 = strongest, frame 6 = almost gone).
EFFECT: ${eff}.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked. Readable at 50 px.
${LOCK_FX}
${bg === 'black' ? 'BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every frame with at least 6% empty margin; nothing crosses into another frame.'
    : 'BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. Never use magenta or pink on the effect. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Centered in every frame with at least 6% empty margin; nothing crosses into another frame.'}`;
const fxGen = [];
const ELS = ['kim', 'moc', 'thuy', 'hoa', 'tho'];
if (ELS.some((e) => !FXS(`fx/dan-${e}.png`))) fxGen.push({ g: 'dan', file: 'dan-he.png', title: 'Đạn bay theo hệ (5 ô: Kim · Mộc · Thủy · Hỏa · Thổ)', size: '1280x256',
  cut: `python3 tools/cat-fx.py hat dan-he.png ${ELS.map((e) => 'dan-' + e).join(' ')} --mau`,
  text: `Create ONE image: a 1280x256 row of five equal 256x256 square cells, one small flying magic projectile per cell, left to right, all pointing RIGHT where they have a direction, one per Vietnamese five-element (ngu hanh):
${ELS.map((e, i) => `[${i + 1}] ${EL_EN[e]}: ${FX_EL[e].dan}.`).join('\n')}
Each projectile centered, about 60% of the cell, bold and readable at 20 px, the five clearly different in shape and color.
STYLE: cute mobile-game art matching chibi heroes of a Vietnamese folk-legend tower-defense game: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), a small bright glow core, about 10-15 flat colors per projectile, no gradients.
${LOCK_FX}
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. Never use magenta or pink on the projectiles. No text, no numbers, no labels, no grid lines, no borders, no watermark. At least 8% empty margin in every cell; nothing crosses into another cell.` });
for (const e of ELS) if (!FXS(`vfx/trung-${e}.png`)) fxGen.push({ g: 'trung', file: `trung-${e}.png`, title: `Trúng đòn hệ ${EL_VI[e]} (đạn chạm quái)`, size: '1536x256', cut: `python3 tools/cat-fx.py dai trung-${e}.png trung-${e}`,
  text: STRIP6(`a SMALL ${EL_EN[e]} hit spark when a projectile strikes an enemy: ${FX_EL[e].trung}. [1] tiny flash at the center [2] flash opening [3] full burst [4] pieces flying outward [5] pieces small and scattered [6] last faint bits`, 'black') });
for (const e of ELS) if (!FXS(`vfx/no-${e}.png`)) fxGen.push({ g: 'no', file: `no-${e}.png`, title: `Vụ nổ hệ ${EL_VI[e]} (đạn nổ lan)`, size: '1536x256', cut: `python3 tools/cat-fx.py dai no-${e}.png no-${e}`,
  text: STRIP6(`a ${EL_EN[e]} area explosion seen from the front, slightly from above: ${FX_EL[e].no}. [1] small bright core on the ground [2] blast growing [3] biggest blast [4] blast breaking apart [5] debris and smoke thinning [6] faint smoke`, 'black') });
for (const e of ELS) if (!FXS(`vfx/vong-chieu-${e}.png`)) fxGen.push({ g: 'vong', file: `vong-chieu-${e}.png`, title: `Vòng chiêu / hào quang hệ ${EL_VI[e]} (dưới chân tướng khi tung chiêu)`, size: '1536x256', cut: `python3 tools/cat-fx.py dai vong-chieu-${e}.png vong-chieu-${e}`,
  text: STRIP6(`a ${EL_EN[e]} magic casting circle on the ground under a hero, drawn as a PERFECT ROUND circle seen from directly above (the game flattens it into an ellipse): a bronze-drum sun-star in the middle, concentric rings with circle-dot bands, colors ${FX_EL[e].vong}. [1] thin ring appearing [2] ring growing, symbols drawing in [3] full bright circle with small rising sparkles [4] circle turned a little, still bright [5] dimmer [6] faint ring fading`, 'black') });
if (!FXS('vfx/chet-quai.png')) fxGen.push({ g: 'chet', file: 'chet-quai.png', title: 'Quái chết (khói tan)', size: '1536x256', cut: 'python3 tools/cat-fx.py dai chet-quai.png chet-quai',
  text: STRIP6('a small cartoon monster defeat poof: [1] small white flash star [2] round puff of pale grey-blue smoke with a thick outline [3] bigger cloud puff with two tiny spinning stars [4] cloud breaking into three small puffs, a tiny cute ghost wisp rising from the top [5] puffs shrinking, wisp higher and fading [6] last tiny puff', 'magenta') });
if (!FXS('vfx/chet-boss.png')) fxGen.push({ g: 'chet', file: 'chet-boss.png', title: 'Boss chết (nổ lớn + cột sáng)', size: '1536x256', cut: 'python3 tools/cat-fx.py dai chet-boss.png chet-boss',
  text: STRIP6('a BIG boss defeat burst: [1] bright white-gold flash in the center [2] golden bronze-drum sun-star with many rays exploding outward [3] shockwave ring and a tall column of golden light rising, sparks flying [4] smoke clouds rolling out at the base, light column at its brightest [5] column thinning, golden sparkles falling [6] faint sparkles and thin smoke', 'black') });

const canHero = Object.keys(HERO_ID).filter((t) => !fs.existsSync(path.join(ROOT, 'assets/packs', t, '.v2')))
  .sort((a, b) => tier(a) - tier(b) || HEROES[a].el.localeCompare(HEROES[b].el));
const canEnemy = Object.keys(REDO_ENEMY).filter((x) => REDO_ENEMY_FORCE.has(x) ? !redone(x) : sameFrames(x));
const canBoss = Object.keys(REDO_BOSS).filter((x) => REDO_FORCE.has(x) ? !redone(x) : sameFrames(x));
const NEW_ART = 'NEW ART: this is a brand-new drawing that REPLACES the old picture completely. Do NOT reuse or copy any old design; do NOT skip it because an older picture exists.';
const blkC = (n, head, file, size, cut, text) => `\n#${n} · ${head} · ảnh ${size} · lưu tên: ${file}\nCắt: ${cut}\n${'-'.repeat(60)}\n${text}\n${'-'.repeat(60)}\n`;
let nC = 0, can = '';
const secC = (title) => `\n\n${'='.repeat(60)}\n${title}\n${'='.repeat(60)}\n`;
if (canHero.length) {
  can += secC(`PHẦN 1 — TƯỚNG: ${canHero.length} tấm hero12 (4x3 = 12 khung, ảnh 768x576) — đính kèm docs/mau-luoi/hero12.png`)
    + 'Mỗi tấm = 12 khung animation: hàng 1 đứng thở (3 khung) + chân dung · hàng 2 đánh thường (4 khung) · hàng 3 tung chiêu (3 khung) + trúng đòn.\n';
  for (const t of canHero) can += blkC(++nC, `${HEROES[t].name} (${t}) · ${tierName[tier(t)]} · ${EL_VI[HEROES[t].el]}`, `${t}.png`, '768x576', `python3 tools/cat-sheet.py ${t}.png ${t} hero12`, `${NEW_ART}\n${heroIdPrompt(t)}`);
}
if (canEnemy.length) {
  can += secC(`PHẦN 2 — QUÁI: ${canEnemy.length} tấm enemy6 (3x2 = 6 khung, ảnh 576x384) — đính kèm docs/mau-luoi/enemy6.png (quái bay: enemy6-bay.png)`);
  for (const k of canEnemy) can += blkC(++nC, `${ENEMIES[k].name} (${k}) · ${REDO_FLY.has(k) ? 'Quái bay' : 'Quái'}`, `${k}.png`, '576x384', `python3 tools/cat-sheet.py ${k}.png ${k} enemy6`, `${NEW_ART}\n${redoEnemyPrompt(k)}`);
}
if (canBoss.length) {
  can += secC(`PHẦN ${canEnemy.length ? 3 : 2} — BOSS: ${canBoss.length} tấm boss9 (3x3 = 9 khung, ảnh 768x768) — đính kèm docs/mau-luoi/boss9.png`)
    + 'Mỗi tấm = 9 khung animation: đi (4 khung) · đánh (3 khung) · nổi giận (2 khung).\n';
  for (const k of canBoss) can += blkC(++nC, `${ENEMIES[k].name} (${k}) · Boss`, `${k}.png`, '768x768', `python3 tools/cat-sheet.py ${k}.png ${k} boss9`, `${NEW_ART}\n${redoBossPrompt(k)}`);
}
const fxCount = (g) => fxGen.filter((x) => x.g === g).length;
if (fxGen.length) {
  can += secC(`PHẦN HIỆU ỨNG — ${fxGen.length} ảnh: đạn theo ngũ hành ${fxCount('dan')} · trúng đòn ${fxCount('trung')} · vụ nổ ${fxCount('no')} · vòng chiêu ${fxCount('vong')} · quái / boss chết ${fxCount('chet')}`)
    + 'Không cần ảnh lưới. Dải hiệu ứng = 6 khung vuông 256x256 một hàng (ảnh 1536x256), khung 1 = bắt đầu → khung 6 = tắt.\n'
    + 'Game đã có chỗ nhận (v175): đạn tướng dùng fx/dan-<hệ>.png khi loại đạn chưa có ảnh riêng; đạn trúng → vfx/trung-<hệ>.png (đạn nổ lan → vfx/no-<hệ>.png);\n'
    + 'tung chiêu → vfx/vong-chieu-<hệ>.png dưới chân; quái chết → vfx/chet-quai.png, boss chết → vfx/chet-boss.png. Chưa có ảnh thì vẽ bằng code như cũ.\n';
  for (const x of fxGen) can += blkC(++nC, x.title, x.file, x.size, x.cut, x.text);
}
const DIRECTIVE = `PROMPT CẦN GEN — THẦN THOẠI VIỆT (${nC} ảnh)
${'='.repeat(60)}
INSTRUCTIONS FOR THE AI (read first)
- This file lists ONLY images that STILL HAVE TO BE GENERATED. Every block below is a REQUIRED new image. Nothing here is optional and nothing here is finished yet.
- REDRAW EVERYTHING in this list from scratch, INCLUDING heroes / bosses that already have an older picture: the new image REPLACES the old one completely. Do not conclude that the set is "already complete", "enough" or "only optional extras remain" — that is wrong for this list.
- Each character prompt is ONE sprite sheet with MANY ANIMATION FRAMES on an invisible grid exactly as written in the block: hero = 4x3 grid, 12 frames, 768x576 (idle 3 + portrait, attack 4, skill 3 + hurt); enemy = 3x2 grid, 6 frames, 576x384 (walk 4, attack 2); boss = 3x3 grid, 9 frames, 768x768 (walk 4, attack 3, rage 2). Effect strips = 6 frames in one row, 1536x256; projectile sheet = 5 cells, 1280x256.
- STYLE for every character: Vietnamese-mythology CHIBI (2.5-3 heads tall), ONE character per cell, the SAME character in every cell, correct anatomy, whole body inside the cell, no text anywhere — see STYLE BIBLE below and the STYLE LOCK / NEGATIVE lines in each block. Attach ${STYLE_SAMPLE} as the style sample.
- Every hero must look clearly DIFFERENT from the others (build, age, signature shape, main color) while staying chibi — follow BODY / SIGNATURE SHAPE / FACE in each block.
- Return EVERY image, one file per block, saved with EXACTLY the file name written after "lưu tên:". Work through the list in order until the last block (#${nC}); if you can only make some per reply, continue with the next block number in the next reply.
- Background: perfectly flat pure magenta #FF00FF (effect blocks that say BLACK use pure black #000000). Do NOT draw numbers, labels, grid lines, cell borders, frames, floor shadows, text or watermarks. The attached grid image (docs/mau-luoi/hero12.png / enemy6.png / enemy6-bay.png / boss9.png) is only a layout guide — do NOT draw its numbers, lines or labels.

CHỈ THỊ CHO AI (đọc trước)
- File này CHỈ gồm những ảnh CÒN PHẢI GEN. Mỗi khối bên dưới là MỘT ảnh BẮT BUỘC phải vẽ mới. Không có khối nào là tùy chọn, không có khối nào đã xong.
- VẼ MỚI TOÀN BỘ danh sách, KỂ CẢ tướng / boss đã có ảnh cũ: ảnh mới THAY THẾ HOÀN TOÀN ảnh cũ. KHÔNG được kết luận "bộ ảnh đã đủ", "không còn nhóm bắt buộc", "chỉ còn tùy chọn" — với danh sách này kết luận đó là SAI.
- Mỗi prompt nhân vật là MỘT sprite sheet NHIỀU KHUNG ANIMATION theo đúng lưới ghi trong khối: tướng 4x3 = 12 khung 768x576 (đứng thở 3 + chân dung, đánh 4, chiêu 3 + trúng đòn); quái 3x2 = 6 khung 576x384 (đi 4, đánh 2); boss 3x3 = 9 khung 768x768 (đi 4, đánh 3, nổi giận 2). Dải hiệu ứng 6 khung một hàng 1536x256; tấm đạn 5 ô 1280x256.
- Phong cách mọi nhân vật: CHIBI thần thoại Việt (2.5–3 đầu), mỗi ô MỘT nhân vật, CÙNG một nhân vật ở mọi ô, đủ tay chân, toàn thân trong ô, không chữ — xem STYLE BIBLE bên dưới và dòng STYLE LOCK / NEGATIVE trong từng khối. Đính kèm ${STYLE_SAMPLE} làm mẫu phong cách.
- Mỗi tướng phải KHÁC RÕ các tướng khác (bề ngang, tuổi, mảng hình đặc trưng, màu chính) nhưng vẫn chibi — làm theo BODY / SIGNATURE SHAPE / FACE trong khối.
- Trả về ĐỦ TỪNG FILE, mỗi khối một file, đặt ĐÚNG tên ghi sau "lưu tên:". Làm lần lượt tới khối cuối (#${nC}); mỗi lượt chỉ ra được vài ảnh thì lượt sau làm tiếp từ số khối kế tiếp.
- Nền hồng tím phẳng tuyệt đối #FF00FF (khối hiệu ứng ghi BLACK thì nền đen #000000). KHÔNG vẽ số, nhãn, đường lưới, viền ô, khung, bóng dưới chân, chữ, watermark. Ảnh lưới đính kèm (docs/mau-luoi/…) chỉ để xem bố cục — không vẽ lại số / vạch của nó.

TÓM TẮT: tướng ${canHero.length} · quái ${canEnemy.length} · boss ${canBoss.length} (${canBoss.join(', ') || '—'}) · hiệu ứng ${fxGen.length} (đạn ${fxCount('dan')}, trúng đòn ${fxCount('trung')}, vụ nổ ${fxCount('no')}, vòng chiêu ${fxCount('vong')}, chết ${fxCount('chet')})
Đã xong, KHÔNG có trong file: quái / boss đã gen lại (có assets/packs/<mã>/.redo hoặc đã đủ dáng). Tướng cắt xong bằng cat-sheet.py hero12 sẽ tự rời danh sách (.v2).
Sinh lại: node tools/build-prompts.js · Chuẩn đầy đủ: docs/CHUAN-ANIMATION.txt · Cắt: lệnh ghi trên từng khối (chạy trong thư mục dự án).

${STYLE_BIBLE}`;
fs.writeFileSync(path.join(ROOT, 'docs/PROMPT-CAN-GEN.txt'), DIRECTIVE + can);
console.log('PROMPT-CAN-GEN', nC, '· tướng', canHero.length, '· quái', canEnemy.length, '· boss', canBoss.length, '· hiệu ứng', fxGen.length);
