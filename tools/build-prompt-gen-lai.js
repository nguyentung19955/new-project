// Sinh prompt GEN LẠI các ảnh dựng xương vẽ sai (sai loài / thiếu hoặc sai vũ khí bản sắc / lệch phong cách).
// Dùng chung STYLE BIBLE + LOCK / NEGATIVE + tư thế A-pose quay phải nền #FF00FF của tools/build-prompt-dung-xuong.js,
// mỗi khối thêm đoạn "FIX" nhấn mạnh điều đã sai ở ảnh cũ và NEGATIVE riêng cho mã đó.
// Chạy: node tools/build-prompt-gen-lai.js  →  docs/PROMPT-GEN-LAI.txt
const fs = require('fs'), path = require('path');
const D = require('./build-prompt-dung-xuong.js');
const ROOT = path.join(__dirname, '..');

// nhóm: skip = đang trong CD_SKIP (js/tu-cu-dong.js) · ban-sac = vũ khí gắn với bản sắc / vai trò (không sửa game theo ảnh được)
// · lai-rong = quái bị vẽ lai rồng (đang dùng được, nên gen lại)
// why: ảnh hiện tại sai gì (tiếng Việt, cho người dùng) · fix: câu nhấn mạnh cho AI · neg: NEGATIVE riêng
const NOT_DRAGON = ['dragon', 'dragon head', 'horns', 'antlers', 'dragon whiskers', 'dragon scales on the head', 'wings'];
const FIX = {
  // ----- 18 mã trong CD_SKIP
  rua: { g: 'skip', why: 'rồng con xanh đeo mai rùa — sai loài',
    fix: 'a real TORTOISE: a big round domed SHELL covering the whole back, four short stumpy elephant-like legs, a small turtle head with a beak mouth poking out of the shell — NOT a dragon, NO horns, NO wings, NO long tail', neg: [...NOT_DRAGON, 'long dragon tail', 'standing on two legs'] },
  phuthuy: { g: 'skip', why: 'rồng con xanh, không cành san hô — sai loài + thiếu vật cầm',
    fix: 'a JELLYFISH spirit: a round translucent bell-shaped dome head and many wavy tentacles hanging below instead of legs, ONE tentacle holding a small red coral branch held away from the body — NOT a dragon, NO horns, NO legs, NO human body, NOT a mermaid', neg: [...NOT_DRAGON, 'legs', 'human body', 'mermaid', 'fish tail'] },
  chimbao: { g: 'skip', why: 'rồng con hồng có cánh — sai loài',
    fix: 'a real BIRD: feathered body, a pointed BEAK, two feathered bird wings spread wide, bird talons, a fan of tail feathers, blue-grey feathers (NOT pink) — NOT a dragon, NO horns, NO scales, NO dragon tail', neg: [...NOT_DRAGON.filter((x) => x !== 'wings'), 'bat wings', 'pink body', 'scales', 'dragon tail'] },
  nongnoc: { g: 'skip', why: 'rồng con xanh — sai loài',
    fix: 'a real TADPOLE: a small round black blob body with ONE big shiny eye and a thin wiggly tail, NO legs, NO arms — NOT a dragon, NO horns, NO spikes, NOT green', neg: [...NOT_DRAGON, 'legs', 'arms', 'green body', 'spikes'] },
  ran: { g: 'skip', why: 'rồng con xanh lá — sai loài',
    fix: 'a real SNAKE: a long legless body in an S-curve, smooth round snake head, forked red tongue, yellow belly stripes, NO legs, NO arms — NOT a dragon, NO horns, NO mane, NO whiskers', neg: [...NOT_DRAGON, 'legs', 'arms', 'claws', 'mane'] },
  thachtinh: { g: 'skip', why: 'người có sừng, không phải golem đá — sai loài',
    fix: 'a STONE GOLEM made of grey cracked boulders with green moss, blocky rock limbs, big round stone fists, a rock head with two glowing yellow eyes and no hair — NOT a human, NO horns, NO skin, NO clothes', neg: ['human', 'skin', 'horns', 'hair', 'clothes', 'dragon'] },
  dacon: { g: 'skip', why: 'rồng con xanh — sai loài',
    fix: 'a small round grey ROCK creature: one round pebble body with big cute eyes, stubby stone arms and legs — NOT a dragon, NO horns, NO tail, NO wings, NOT green', neg: [...NOT_DRAGON, 'tail', 'green body'] },
  linhan: { g: 'skip', why: 'người có sừng, KHÔNG cầm giáo — thiếu vũ khí',
    fix: 'a goblin soldier HOLDING A LONG BRONZE SPEAR in the front hand (the whole spear visible, tip pointing forward-up, away from the body) and a round wooden shield in the back hand — the spear must be in the image, NOT a dragon', neg: ['empty hands', 'sword', 'dragon', 'wings', 'human face'] },
  cungan: { g: 'skip', why: 'rồng / người có sừng, không có cung — sai loài + thiếu vũ khí',
    fix: 'a GREY WOLF standing on hind legs with a wolf head (long snout, pointed ears, fangs), bushy tail, HOLDING A WOODEN BOW in the front hand with an arrow nocked and drawn back by the other hand — the bow and arrow clearly visible, NOT a dragon, NO horns, NOT a human', neg: [...NOT_DRAGON, 'human face', 'empty hands', 'sword', 'spear'] },
  voichien: { g: 'skip', why: 'người có sừng — sai loài',
    fix: 'a real ELEPHANT on four thick legs: long trunk, big floppy ears, two tusks with bronze caps, a red and gold saddle tower on its back — NOT a human, NO horns, NOT standing on two legs', neg: ['human', 'standing on two legs', 'horns', 'dragon', 'arms holding weapons'] },
  camap: { g: 'skip', why: 'rồng con xanh có vây cá — sai loài',
    fix: 'a real SHARK: a grey torpedo shark body with a big dorsal fin, side fins, a crescent tail fin it stands on, a toothy shark grin — NOT a dragon, NO horns, NO legs, NO arms, NOT a mermaid', neg: [...NOT_DRAGON, 'legs', 'arms', 'mermaid', 'human torso'] },
  cua: { g: 'skip', why: 'rồng con đỏ có 1 càng — sai loài',
    fix: 'a real CRAB with TWO big pincers and a wide round SHELL, eight thin jointed walking legs on the sides, two eyes on short stalks, tiny bronze helmet on the shell, NO tail (ignore the tail in the RIG POSE line) — NOT a dragon, NO horns, NO dragon head', neg: [...NOT_DRAGON, 'tail', 'only one claw', 'human body'] },
  cao: { g: 'skip', why: 'rồng con hồng có sừng — sai loài',
    fix: 'a real FOX: orange fur, a pointed fox snout, two big pointed fox ears, a big fluffy fox tail with a white tip, standing on hind legs — NOT a dragon, NO horns, NO scales, NOT pink', neg: [...NOT_DRAGON, 'scales', 'pink body'] },
  hotinh: { g: 'skip', why: 'rồng nhiều tay cầm giáo — sai loài (boss)',
    fix: 'a WHITE FOX demon with a fox head (pointed snout, tall fox ears), standing on two legs, exactly NINE fluffy white fox tails fanned out behind, two normal arms with one empty clawed hand raised — NOT a dragon, NO horns, NO spear, NO extra arms', neg: [...NOT_DRAGON, 'spear', 'weapon', 'extra arms', 'many arms', 'scales'] },
  chantinh: { g: 'skip', why: 'người-rồng cầm giáo — sai loài + sai vũ khí (boss)',
    fix: 'a big green OGRE (troll): fat round belly, tusks, ONE short horn, loincloth, HOLDING A HUGE STONE CLUB in the front hand (swung like an axe) — NOT a dragon, NO wings, NO tail, NO spear', neg: ['dragon', 'dragon head', 'wings', 'tail', 'scales', 'spear', 'sword'] },
  nguphu: { g: 'skip', why: 'vẽ thành tiên cá cầm đinh ba — sai loài',
    fix: 'a HUMAN fisherman with TWO HUMAN LEGS and bare feet (NOT a fish tail), a fishing net over one shoulder, HOLDING a three-pronged fish spear in the front hand — NOT a mermaid, NO fish tail, NO scales', neg: ['mermaid', 'merman', 'fish tail', 'scales', 'fins on the body'] },
  tre: { g: 'skip', why: 'kiếm cắm đất bên cạnh, tay không cầm gì — vũ khí rời',
    fix: 'the boy HOLDS the long green BAMBOO POLE with his front hand (fingers wrapped around it), the pole pointing forward-up, away from the body — the pole is IN HIS HAND, not stuck in the ground; NO sword', neg: ['sword', 'weapon stuck in the ground', 'weapon lying beside him', 'empty hands'] },
  dotnuong: { g: 'skip', why: 'kiểu 3D bóng, cầm giáo — lệch phong cách + sai vũ khí',
    fix: 'FLAT 2D chibi cel-shaded drawing with thick dark outlines and flat colors, exactly like the other characters — NOT 3D, NOT glossy, NOT a render; HOLDING a curved MACHETE in the front hand and a burning torch in the back hand — NO spear', neg: ['3D render', 'glossy', 'plastic', 'realistic lighting', 'soft shading', 'spear', 'lance'] },
  // ----- vũ khí là bản sắc / vai trò: ảnh khác vũ khí nhưng KHÔNG sửa game theo ảnh được
  xathu: { g: 'ban-sac', why: 'cầm đao, không có cung — Xạ Thủ là lớp cung thủ duy nhất bắn quái bay ở đầu game (vai trò Tầm xa)',
    fix: 'HOLDING A BIG WOODEN BOW in the front hand with an ARROW nocked and drawn back by the other hand, the whole bow and arrow clearly visible and away from the body — NO saber, NO sword', neg: ['saber', 'sword', 'machete', 'empty hands'] },
  adv: { g: 'ban-sac', why: 'cầm kiếm — An Dương Vương gắn với nỏ thần Linh Quang (nội tại "Nỏ Linh Quang" bắn xuyên hàng)',
    fix: 'HOLDING THE MAGIC CROSSBOW horizontally in the front hand (bronze crossbow with a golden turtle-claw trigger), aimed forward — the crossbow clearly visible; NO sword', neg: ['sword', 'saber', 'spear', 'empty hands'] },
  caolo: { g: 'ban-sac', why: 'cầm kiếm trong vỏ — Cao Lỗ là người chế nỏ thần (dòng Cao Lỗ xuyên giáp)',
    fix: 'HOLDING A WIDE MECHANICAL CROSSBOW horizontally in the front hand with visible bronze gears and a crank — NO sword, NO scabbard', neg: ['sword', 'scabbard', 'sheathed sword', 'empty hands'] },
  thoren: { g: 'ban-sac', why: 'cầm giáo — Thợ Rèn gắn với búa lò rèn',
    fix: 'HOLDING A GIANT BLACKSMITH SLEDGEHAMMER with a red-hot glowing head in the front hand — NO spear', neg: ['spear', 'lance', 'sword', 'empty hands'] },
  thienloi: { g: 'ban-sac', why: 'cầm kiếm ngang — Thiên Lôi gắn với lưỡi / búa tầm sét (nội tại "Búa Tầm Sét", R "Búa Thiên Lôi")',
    fix: 'HOLDING A GIANT STONE THUNDER AXE (lưỡi tầm sét) on a short staff in the front hand — NO sword', neg: ['sword', 'saber', 'spear', 'empty hands'] },
  thachsanh: { g: 'ban-sac', why: 'cầm giáo — Thạch Sanh là tiều phu: rìu đốn củi (Q "Rìu Đốn Củi") + cung tên vàng',
    fix: 'HOLDING A HUGE WOODCUTTER AXE with a wide blade in the front hand, a round moon-lute slung on the back — NO spear', neg: ['spear', 'lance', 'sword', 'empty hands'] },
  potaoapui: { g: 'ban-sac', why: 'cầm giáo — Pơ Tao Apui (Vua Lửa) giữ gươm thần (nội tại "Gươm Thần Gia Rai", Q "Gươm Lửa")',
    fix: 'HOLDING A LARGE FLAMING SACRED SWORD in the front hand — NO spear', neg: ['spear', 'lance', 'trident', 'empty hands'] },
  cdt: { g: 'ban-sac', why: 'cầm giáo — Chử Đồng Tử gắn với gậy thần + nón thần (nội tại / Q "Gậy Thần")',
    fix: 'HOLDING A TALL SACRED WOODEN STAFF (a plain staff with NO blade) in the front hand and the glowing conical hat in the back hand — NO spear, NO blade on the staff', neg: ['spear', 'spear tip', 'blade', 'lance', 'sword'] },
  // ----- quái bị vẽ lai rồng (đang chạy được, nên gen lại cho đúng loài)
  casau: { g: 'lai-rong', why: 'rồng con hồng mõm cá sấu, có sừng — lai rồng',
    fix: 'a real CROCODILE: long flat green body on four short legs, a long flat toothy snout, bumpy back scales, a long thick tail — NOT a dragon, NO horns, NO wings, NOT pink', neg: [...NOT_DRAGON, 'pink body', 'standing on two legs'] },
  doi: { g: 'lai-rong', why: 'rồng con có cánh dơi — lai rồng',
    fix: 'a real BAT: a small furry purple body, big pointed bat ears, a tiny pug nose with fangs, two leathery bat wings — NOT a dragon, NO horns, NO scales, NO long tail', neg: NOT_DRAGON.filter((x) => x !== 'wings').concat(['scales', 'long tail', 'feathers']) },
  echme: { g: 'lai-rong', why: 'ếch có đuôi rồng, đội mũ — lệch loài',
    fix: 'a real TOAD: a fat round green body with a yellow belly, warts, a wide mouth, bent froggy back legs, NO tail (ignore the tail in the RIG POSE line), NO hat — NOT a dragon', neg: ['tail', 'dragon tail', 'hat', 'helmet', 'horns', 'dragon'] },
};
const GROUPS = [
  ['1. Ảnh vẽ sai đang bị chặn (CD_SKIP trong js/tu-cu-dong.js)', 'skip'],
  ['2. Vũ khí là bản sắc / vai trò — game giữ vũ khí cũ, ảnh phải vẽ lại', 'ban-sac'],
  ['3. Quái vẽ lai rồng — đang dùng được, nên gen lại cho đúng loài', 'lai-rong'],
];

const isHero = (k) => !!D.HEROES[k];
const isBoss = (k) => !!D.REDO_BOSS[k];
// chèn đoạn FIX ngay sau dòng đầu (tên nhân vật) để AI đọc trước, NEGATIVE riêng nối sau khối NEGATIVE chung
function prompt(k) {
  const f = FIX[k];
  const base = isHero(k) ? D.heroPrompt(k) : D.foePrompt(k, isBoss(k) ? D.REDO_BOSS[k] : D.REDO_ENEMY[k], isBoss(k));
  const lines = base.split('\n');
  const fix = `!!! FIX — the previous image of this character was WRONG. This time draw: ${f.fix}. This FIX line wins over anything below.`;
  const neg = `NEGATIVE FOR THIS CHARACTER (do NOT draw): ${f.neg.join(', ')}.`;
  const at = lines.findIndex((l) => l.startsWith('NEGATIVE FOR RIGGING'));
  lines.splice(at + 1, 0, neg);
  lines.splice(1, 0, fix);
  return lines.join('\n');
}
const weapon = (k) => (isHero(k) ? D.wkLine(D.HERO_WEAPON[k]) : D.wkLine(D.FOE[k].slice(1)));
const title = (k) => (isHero(k) ? `Tướng · ${D.HEROES[k].name}` : `${isBoss(k) ? 'Boss' : 'Quái'} · ${D.ENEMIES[k].name}`);

for (const k of Object.keys(FIX)) if (!isHero(k) && !D.FOE[k]) { console.error('Không có dữ liệu prompt cho', k); process.exit(1); }
const LINE = '='.repeat(60), DASH = '-'.repeat(60);
const total = Object.keys(FIX).length;
let txt = `PROMPT GEN LẠI ẢNH DỰNG XƯƠNG — ${total} ảnh (sinh bằng: node tools/build-prompt-gen-lai.js — đừng sửa tay)
${GROUPS.map(([n, g]) => `  ${n}: ${Object.values(FIX).filter((f) => f.g === g).length}`).join('\n')}

${LINE}
CÁCH DÙNG
${LINE}
Giống docs/PROMPT-DUNG-XUONG.txt: mỗi khối giữa hai đường gạch là MỘT ảnh — chép nguyên khối dán vào AI tạo ảnh (đính kèm ảnh mẫu
phong cách docs/mau-lac-tuong.png nếu được), lưu đúng "Tên file" (= mã trong game) vào assets/, ghi đè ảnh cũ.
Dòng "!!! FIX" nói điều ảnh cũ đã vẽ sai — kiểm tra kỹ đúng điều đó trước khi lưu (sai loài / thiếu vũ khí / vũ khí rời / 3D bóng → gen lại).
Sau khi thay ảnh: bỏ mã khỏi CD_SKIP trong js/tu-cu-dong.js (nhóm 1), soát lại rig trong js/rigs.js (tools/rig-tay.html),
chạy node tools/build-asset-list.js nếu đổi tên file.
`;
for (const [name, g] of GROUPS) {
  const ks = Object.keys(FIX).filter((k) => FIX[k].g === g);
  txt += `\n${LINE}\n${name.toUpperCase()} (${ks.length})\n${LINE}\n`;
  for (const k of ks) txt += `\n### ${title(k)}\nTên file: ${k}.png\n${weapon(k)}\nẢnh cũ sai: ${FIX[k].why}\n${DASH}\n${prompt(k)}\n${DASH}\n`;
}
if (require.main === module) {
  fs.writeFileSync(path.join(ROOT, 'docs/PROMPT-GEN-LAI.txt'), txt);
  console.log('docs/PROMPT-GEN-LAI.txt:', GROUPS.map(([n, g]) => `${g} ${Object.values(FIX).filter((f) => f.g === g).length}`).join(' · '), '· tổng', total);
}
module.exports = { FIX, prompt };
