// Sinh bộ prompt Gemini (mỗi ảnh một prompt tự đủ) từ dữ liệu game + mô tả trong docs/PROMPT_GEMINI_V94.md.
// Chạy: node tools/build-prompts.js  →  docs/PROMPT_GEMINI_FULL.md + (tùy chọn) trang HTML có nút sao chép.
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '..');
const ctx = { console, window: {}, document: { createElement: () => ({ getContext: () => ({}) }) }, Image: function () {}, localStorage: { getItem() {}, setItem() {} }, navigator: {} };
vm.createContext(ctx);
for (const f of ['art', 'data', 'enemies2']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f + '.js'), 'utf8').replace(/^(const|let) /gm, 'var '), ctx);
const { HEROES, ENEMIES, LEGACY, RUNES } = ctx;
const packs = new Set(fs.readdirSync(path.join(ROOT, 'assets/packs')));
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
CELLS (same creature, same size): [1] walk step A [2] walk step B (opposite legs) [3] attack.
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
const tierName = ['Thường', 'Tím', 'Vàng'];
for (const t of need.filter((x) => tier(x) === 0)) items.push({ group: '1. Tướng Thường (ưu tiên: xuất hiện mỗi trận)', file: `${t}.png`, title: `${HEROES[t].name} · ${tierName[tier(t)]} · ${EL[HEROES[t].el][0]}`, text: heroPrompt(t) });
for (const t of ['yeutinh', 'dacon', 'linhan'].filter((x) => !packs.has(x))) items.push({ group: '2. Quái còn thiếu', file: `${t}.png`, title: ENEMIES[t].name, text: enemyPrompt(t) });
for (const t of need.filter((x) => tier(x) === 1)) items.push({ group: '3. Tướng Tím', file: `${t}.png`, title: `${HEROES[t].name} · Tím · ${EL[HEROES[t].el][0]}`, text: heroPrompt(t) });
for (const t of need.filter((x) => tier(x) === 2)) items.push({ group: '4. Tướng Vàng', file: `${t}.png`, title: `${HEROES[t].name} · Vàng · ${EL[HEROES[t].el][0]}`, text: heroPrompt(t) });
for (const t of Object.keys(ICONS).filter((x) => HEROES[x]).sort((a, b) => tier(a) - tier(b))) items.push({ group: '5. Icon kỹ năng (tùy chọn)', file: `icon-${t}.png`, title: `Icon kỹ năng ${HEROES[t].name}`, text: iconPrompt(t) });
for (const t of Object.keys(LEGACY).filter((x) => RELICS[x])) items.push({ group: '6. Icon Thần Khí (tùy chọn)', file: `than-khi-${t}.png`, title: `Thần Khí ${HEROES[t].name}`, text: relicPrompt(t) });
for (const k of Object.keys(RUNE_SYM)) items.push({ group: '7. Icon Ấn Phù (tùy chọn)', file: `an-phu-${k}.png`, title: `Ấn Phù nhánh ${k}`, text: runePrompt(k) });
items.forEach((it, i) => { it.n = i + 1; });
const noIcon = need.filter((x) => !ICONS[x]);  // tướng mới chưa có mô tả icon
if (noIcon.length) console.error('Chưa có mô tả icon:', noIcon.join(', '));

// Markdown
let out = `# Prompt Gemini đầy đủ — mỗi ảnh một prompt (${items.length} ảnh)\n\n`;
out += 'Mỗi khối dán **riêng một lần** vào Gemini (đính kèm `docs/mau-lac-tuong.png` làm mẫu nét vẽ nếu được), tải ảnh về và đặt **đúng tên file** ghi trên khối. Gen theo thứ tự từ trên xuống: phần 1–4 là cần thiết, phần 5–7 là tùy chọn.\n\n';
let g = '';
for (const it of items) {
  if (it.group !== g) { g = it.group; out += `\n## ${g}\n`; }
  out += `\n### ${it.n}. ${it.title} → \`${it.file}\`\n\`\`\`\n${it.text}\n\`\`\`\n`;
}
fs.writeFileSync(path.join(ROOT, 'docs/PROMPT_GEMINI_FULL.md'), out);
fs.writeFileSync(path.join(ROOT, 'docs/prompts.json'), JSON.stringify(items, null, 1));
console.log('items', items.length, 'heroes', need.length);
