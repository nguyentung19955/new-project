// Sinh prompt ảnh DỰNG XƯƠNG: mỗi nhân vật MỘT ảnh tĩnh duy nhất (toàn thân, quay phải, tư thế A-pose chiến đấu,
// tay + vũ khí tách khỏi thân, nền #FF00FF) để kéo thả vào tools/dung-xuong.html.
// Dùng chung dữ liệu với tools/build-prompts.js: thẻ nhận diện tướng (tools/hero-id.js), mô tả quái / boss gen lại
// (REDO_ENEMY, REDO_BOSS) và các khối STYLE LOCK / ANATOMY / NEGATIVE — đọc thẳng từ mã nguồn build-prompts.js để khỏi chép hai nơi.
// Chạy: node tools/build-prompt-dung-xuong.js  →  docs/PROMPT-DUNG-XUONG.txt (+ .md)
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '..');
const ctx = { console, window: {}, document: { createElement: () => ({ getContext: () => ({}) }) }, Image: function () {}, localStorage: { getItem() {}, setItem() {} }, navigator: {} };
vm.createContext(ctx);
for (const f of ['art', 'data', 'enemies2']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f + '.js'), 'utf8').replace(/^(const|let) /gm, 'var '), ctx);
const { HEROES, ENEMIES } = ctx;
const { HERO_ID } = require('./hero-id.js');

// lấy các hằng một dòng / khối {…} trong build-prompts.js
const SRC = fs.readFileSync(path.join(__dirname, 'build-prompts.js'), 'utf8');
const grab = (name) => {
  const start = SRC.search(new RegExp(`^const ${name} = `, 'm'));
  if (start < 0) { console.error('Không tìm thấy', name, 'trong tools/build-prompts.js'); process.exit(1); }
  // quét tới dấu ; đầu tiên ngoài chuỗi / ngoặc
  let i = SRC.indexOf('= ', start) + 2, depth = 0, q = null;
  const from = i;
  for (; i < SRC.length; i++) {
    const c = SRC[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === "'" || c === '"' || c === '`') q = c;
    else if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) depth--;
    else if (c === ';' && depth === 0) break;
  }
  return vm.runInNewContext('(' + SRC.slice(from, i) + ')');
};
const EL = grab('EL'), RAR = grab('RAR'), REDO_ENEMY = grab('REDO_ENEMY'), REDO_BOSS = grab('REDO_BOSS'), chibiBody = grab('chibiBody');
// khối chuẩn của file tổng, đổi "cell" (lưới nhiều ô) → "image" (một ảnh)
const toImage = (s) => s.replace(/ in one cell/g, ' in the image').replace(/ in each cell/g, ' in the image').replace(/inside the cell/g, 'inside the image')
  .replace(/the cell edge/g, 'the image edge').replace(/, a different-looking character between cells/, '').replace(/, grid lines, cell borders, frames/, ', grid lines, borders, frames');
const LOCK_STYLE = toImage(grab('LOCK_STYLE')), LOCK_BODY_HUMAN = toImage(grab('LOCK_BODY_HUMAN')), LOCK_BODY_CREATURE = toImage(grab('LOCK_BODY_CREATURE')), NEG_CHAR = toImage(grab('NEG_CHAR'));
const LOCK_ONE = 'ONE CHARACTER, ONE POSE: exactly ONE character in ONE single still image — no clones, no second person, no helpers or crowd, no extra views, no model sheet, no grid, no frames.';
const NEG_RIG = 'NEGATIVE FOR RIGGING (do NOT draw): multiple poses, sprite sheet, grid, turnaround, character sheet, back view, front view, pure side view, crossed arms, hands on hips covering the waist, arms touching the body, legs together or crossed, weapon behind the body, weapon across the chest or face, weapon cut off by the image edge, cape / cloak / scarf / sleeves covering the arms or legs, long flowing hair over the arms, ground, floor, cast shadow, motion blur, speed lines, magic effects, glow, aura, particles, sparkles, smoke, fire or water splashes around the character.';
const CANVAS = 'CANVAS: square 1024x1024, the character centered horizontally, about 85% of the image height from the top of the head (or headdress) to the soles, the soles touching an invisible line at about 92% of the height, empty magenta margin on every side (nothing touches the edge).';
const BG = 'BACKGROUND: perfectly flat pure magenta #FF00FF (or fully transparent) everywhere — no ground, no floor, no cast shadow, no gradient, no vignette, no text, no watermark. Never use magenta on the character.';

// tư thế dựng xương theo dáng cơ thể
const POSE = {
  human: 'RIG POSE (combat A-pose): full body from head to feet, standing in a 3/4 view turned to the RIGHT (facing the right side of the image, the chest slightly toward the viewer); feet planted shoulder-width apart with a clear gap of magenta between the two legs, knees very slightly bent; BOTH arms held away from the body (clear gap under each armpit, elbows slightly bent), hands not covering the belly or chest; the weapon held in the FRONT hand (the hand nearer the right side of the image), fully visible, clearly separated from the body and the head with magenta between them, not crossing the body (a second item or a shield goes in the BACK hand, also held out away from the body); shoulders, elbows, wrists, hips and knees all visible — nothing covers a joint.',
  spirit: 'RIG POSE (combat A-pose): full body from head to feet (or to the floating base), upright in a 3/4 view turned to the RIGHT (facing the right side of the image); if it has legs, feet apart with a clear magenta gap between them; BOTH arms held away from the body (clear gap under each armpit, elbows slightly bent); the held item in the FRONT hand, fully visible, separated from the body and the head; floating hair, robes and veils stay short and behind the body, never over the arms or legs; shoulders, elbows, wrists and hips visible.',
  beast: 'RIG POSE: full body in a 3/4 view turned to the RIGHT (head on the right side of the image), standing still on all legs, legs slightly spread so each leg is a separate shape with magenta gaps between them; tail held up and away from the body, not overlapping the legs; head, neck, every leg and the tail clearly visible and not overlapping each other; mouth closed or slightly open.',
  serpent: 'RIG POSE: full body in a 3/4 view, head on the RIGHT side of the image, the long body laid out in one loose open S-curve that never crosses or overlaps itself, the tail tip visible; head raised, small limbs / fins (if any) held away from the body.',
  fly: 'RIG POSE: full body in a 3/4 view turned to the RIGHT, hovering upright, BOTH wings fully spread up and out, not overlapping the body or the head; legs / talons hanging down apart from each other and visible; tail spread behind.',
  rider: 'RIG POSE: full body of the rider AND the mount in a 3/4 view turned to the RIGHT, the mount standing still with its four legs spread apart (magenta gaps between the legs), the rider sitting upright with both arms held away from the body and the weapon in the front hand, separated from the bodies; tail and mane short, not covering the legs.',
};
const KEEP = 'Keep the SIGNATURE SHAPE but place it so it covers no joint: big props, capes, wings, drums, baskets, halos and trees sit BEHIND the body or to the side with magenta gaps; any cape or scarf is short (above the knees) and does not cover the arms.';

// loại vũ khí (cho tool chọn chuyển động): kiem | riu | giao | cung | no | gay-phep | tay-khong
const WK = {
  kiem: 'kiếm', riu: 'rìu', giao: 'giáo', cung: 'cung', no: 'nỏ', 'gay-phep': 'gậy phép', 'tay-khong': 'tay không',
};
const HERO_WEAPON = {
  lactuong: ['riu'], xathu: ['cung'], giaodong: ['giao', 'khiên ở tay sau, giơ ra ngang, không che thân'], chuongdong: ['gay-phep', 'gậy chuông'],
  nghedong: ['tay-khong', 'vồ / cắn'], mychau: ['tay-khong', 'rải lông ngỗng'], kylan: ['tay-khong', 'sừng + móng'], thienloi: ['riu', 'búa đá sấm'],
  trongdong: ['gay-phep', 'hai dùi trống — vung như chày'], kimquy: ['tay-khong', 'vuốt vàng'], caolo: ['no'], adv: ['no', 'nỏ thần'],
  thosan: ['kiem', 'hai dao găm cầm ngược'], tre: ['giao', 'sào tre'], ongthoi: ['no', 'ống thổi — bắn thẳng như nỏ'], thachsanh: ['riu'],
  antiem: ['tay-khong', 'ném dưa hấu'], sodua: ['tay-khong', 'ném dừa'], cuoi: ['riu', 'rìu tiều phu'], melua: ['gay-phep', 'bó lúa'],
  thaylang: ['gay-phep', 'gậy chống'], ongho: ['tay-khong', 'vuốt + nanh'], thansan: ['giao', 'giáo săn tre'], mau: ['gay-phep', 'cành hoa'],
  thansuong: ['tay-khong', 'tinh thể băng trong tay'], chodo: ['giao', 'mái chèo — vung như giáo'], haisen: ['gay-phep', 'ô lá sen'],
  nguphu: ['giao', 'chĩa ba'], truongchi: ['gay-phep', 'sáo trúc'], cdt: ['gay-phep', 'gậy thiêng + nón phép'], lyngu: ['giao', 'đao cán dài vây cá'],
  llq: ['kiem'], halong: ['tay-khong', 'ngọc + đuôi'], longnu: ['tay-khong', 'ngọc rồng hai tay'], caong: ['tay-khong', 'húc thân'],
  mauthoai: ['gay-phep', 'gậy gáo nước'], thaymo: ['gay-phep', 'gậy hồ lô lửa'], giong: ['giao', 'bụi tre cháy — vung như giáo'],
  tiendung: ['gay-phep', 'quạt tròn'], dotnuong: ['kiem', 'dao rựa (tay trước) + đuốc (tay sau)'], denroi: ['gay-phep', 'đèn trời'],
  potaoapui: ['kiem', 'kiếm lửa'], baahoa: ['tay-khong', 'quả cầu lửa trong lòng bàn tay'], kinhduong: ['kiem', 'kiếm đồng bản rộng'],
  viemde: ['gay-phep', 'cuốc lửa'], thoren: ['riu', 'búa tạ'], ongtao: ['gay-phep', 'kẹp than'], matroi: ['gay-phep', 'quyền trượng mặt trời'],
  lucsi: ['tay-khong', 'ném tảng đá'], auco: ['gay-phep', 'đũa lông hạc'], langlieu: ['gay-phep', 'mâm bánh chưng'], dapde: ['giao', 'xẻng — vung như giáo'],
  chantrau: ['no', 'súng cao su — bắn thẳng như nỏ'], ongdung: ['giao', 'đòn gánh — vung như giáo'], thocong: ['gay-phep', 'gậy tre hồ lô'],
  tanvien: ['gay-phep', 'sách phép + núi nhỏ trên tay'], maudia: ['gay-phep', 'chum hạt giống'], thogom: ['tay-khong', 'ném nồi gốm'],
  trutroi: ['giao', 'cột trời — vung như chày'], lachau: ['giao', 'cán cờ'],
};
// quái / boss: dáng + vũ khí
const FOE = {
  tom: ['human', 'giao', 'giáo ngắn + khiên'], casau: ['beast', 'tay-khong'], rua: ['beast', 'tay-khong'], phuthuy: ['spirit', 'gay-phep', 'cành san hô'],
  chimbao: ['fly', 'tay-khong'], echme: ['beast', 'tay-khong'], nongnoc: ['serpent', 'tay-khong'], giaolong: ['serpent', 'tay-khong'],
  yeutinh: ['human', 'riu', 'chuỳ gỗ — vung như rìu'], ran: ['serpent', 'tay-khong'], doi: ['fly', 'tay-khong'], thachtinh: ['human', 'tay-khong', 'nắm đấm đá'],
  dacon: ['human', 'tay-khong'], linhan: ['human', 'giao', 'giáo + khiên tròn'], cungan: ['human', 'cung'], muc: ['spirit', 'tay-khong', 'xúc tu'],
  kybinh: ['rider', 'giao', 'giáo ngắn, cưỡi lợn rừng'], voichien: ['beast', 'tay-khong'], camap: ['spirit', 'tay-khong'], cua: ['beast', 'tay-khong', 'càng'],
  cao: ['human', 'tay-khong', 'vuốt'],
  anvuong: ['rider', 'giao', 'kích, cưỡi ngựa quỷ'], chantinh: ['human', 'riu', 'chuỳ đá — vung như rìu'], haba: ['human', 'giao', 'đinh ba'],
  ngutinh: ['spirit', 'tay-khong'], thuongluong: ['serpent', 'tay-khong'], thuytinh: ['human', 'giao', 'đinh ba'], trieuda: ['human', 'kiem', 'đao cong lớn'],
  daibang: ['fly', 'tay-khong', 'vuốt'], hotinh: ['human', 'gay-phep', 'lửa hồ ly (không vẽ lửa — chỉ bàn tay giơ ra)'],
};
for (const t of Object.keys(HEROES)) if (!HERO_WEAPON[t] || !HERO_ID[t]) { console.error('Thiếu dữ liệu vũ khí / thẻ nhận diện cho tướng', t); process.exit(1); }
for (const k of [...Object.keys(REDO_ENEMY), ...Object.keys(REDO_BOSS)]) if (!FOE[k]) { console.error('Thiếu dáng / vũ khí cho', k); process.exit(1); }
const wkLine = ([code, note]) => `Loại vũ khí: ${code} (${WK[code]}${note ? ' — ' + note : ''})`;

const head = (file) => `Create ONE image: a single still full-body character illustration for 2D skeletal rigging (cut-out animation) in a cute mobile tower-defense game based on Vietnamese folk legends. File name: ${file}.`;
const tail = (creature) => `${LOCK_STYLE}${creature ? ' Non-human monsters and beasts are chibi too: round, chunky, cute-but-fierce, the same line art.' : ''}
${LOCK_ONE}
${creature ? LOCK_BODY_CREATURE : LOCK_BODY_HUMAN}
${NEG_CHAR}
${NEG_RIG}
${CANVAS}
${BG}`;

const heroPrompt = (t) => {
  const h = HERO_ID[t], [E] = EL[HEROES[t].el];
  const pose = h.kind === 'beast' ? (t === 'halong' ? POSE.serpent : POSE.beast) : h.kind === 'spirit' ? POSE.spirit : t === 'giong' ? POSE.rider : POSE.human;
  return `${head(t + '.png')} Hero: ${HEROES[t].name}.
BODY: ${chibiBody(h.body)}.
SIGNATURE SHAPE: ${h.mark}. ${KEEP}
COLORS: main ${h.colors[0]}, second ${h.colors[1]}, accent ${h.colors[2]} (element ${E}). ${RAR[HEROES[t].legend].replace(' and a small aura', '').replace(' or halo', '')}, no aura, no glow.
FACE: ${h.face}.
OUTFIT: ${h.outfit}. WEAPON / ITEM: ${h.weapon}.
${pose}
${/^ném/.test(HERO_WEAPON[t][1] || '') ? 'THROWN ITEM: ONE of it held in the FRONT hand, arm out away from the body (not on the shoulder, not over the head).\n' : HERO_WEAPON[t][0] === 'tay-khong' && h.kind === 'human' ? 'NO WEAPON: both hands open (or holding the small item named above), held away from the body.\n' : ''}Mood (facial expression only — ignore any weapon or arm placement in it, the RIG POSE above wins): ${h.pose}.
${tail(h.kind !== 'human')}`;
};
const foePrompt = (k, desc, boss) => {
  const [kind] = FOE[k];
  return `${head(k + '.png')} ${boss ? 'BOSS' : 'Enemy'}: ${ENEMIES[k] ? ENEMIES[k].name : k}.
CREATURE: ${desc}.${boss ? ' A boss: bigger, chunkier and more detailed than normal enemies, still chibi.' : ' Cute-but-mischievous chibi monster.'}
${POSE[kind]}
${tail(true)}`;
};

// dùng chung cho tools/build-prompt-gen-lai.js (prompt gen lại ảnh vẽ sai): require() thì chỉ xuất khối chuẩn, không ghi file
module.exports = { HEROES, ENEMIES, HERO_ID, EL, RAR, REDO_ENEMY, REDO_BOSS, chibiBody, LOCK_STYLE, LOCK_BODY_HUMAN, LOCK_BODY_CREATURE, NEG_CHAR,
  LOCK_ONE, NEG_RIG, CANVAS, BG, POSE, KEEP, WK, HERO_WEAPON, FOE, wkLine, head, tail, heroPrompt, foePrompt };
if (require.main === module) {
const tierName = ['Thường', 'Tím', 'Vàng'];
const tier = (t) => (HEROES[t].legend === 'legendary' ? 2 : HEROES[t].legend === 'epic' ? 1 : 0);
const groups = [];
for (let i = 0; i < 3; i++) groups.push({ name: `${i + 1}. Tướng ${tierName[i]}`, items: Object.keys(HEROES).filter((t) => tier(t) === i).map((t) => ({
  file: `${t}.png`, title: `${HEROES[t].name} · ${tierName[i]} · ${EL[HEROES[t].el][0]}`, weapon: wkLine(HERO_WEAPON[t]), text: heroPrompt(t) })) });
groups.push({ name: '4. Quái', items: Object.keys(REDO_ENEMY).map((k) => ({ file: `${k}.png`, title: `Quái · ${ENEMIES[k].name}`, weapon: wkLine(FOE[k].slice(1)), text: foePrompt(k, REDO_ENEMY[k], false) })) });
groups.push({ name: '5. Boss', items: Object.keys(REDO_BOSS).map((k) => ({ file: `${k}.png`, title: `Boss · ${ENEMIES[k].name}`, weapon: wkLine(FOE[k].slice(1)), text: foePrompt(k, REDO_BOSS[k], true) })) });

const LINE = '='.repeat(60), DASH = '-'.repeat(60);
const DIRECTIVE = `${LINE}
CHỈ THỊ CHO AI / INSTRUCTIONS FOR THE AI
${LINE}
EN: Each block between the dashed lines is ONE separate request. Generate exactly ONE still image per block: ONE character, full body,
turned to the RIGHT in 3/4 view, legs slightly apart, arms and weapon held away from the body, flat magenta #FF00FF (or transparent) background,
square 1024x1024, no grid, no multiple poses, no text, no effects. Never merge blocks, never draw a sprite sheet.
VI: Mỗi khối giữa hai đường gạch là MỘT yêu cầu riêng. Mỗi khối gen đúng MỘT ảnh tĩnh: MỘT nhân vật, toàn thân, nghiêng 3/4 quay sang PHẢI,
chân hơi dạng, tay và vũ khí tách khỏi thân, nền hồng tím phẳng #FF00FF (hoặc trong suốt), khổ vuông 1024×1024, không lưới, không nhiều tư thế,
không chữ, không hiệu ứng. Không gộp khối, không vẽ sprite sheet.

${LINE}
HƯỚNG DẪN NGƯỜI DÙNG — ẢNH DỰNG XƯƠNG (tools/dung-xuong.html)
${LINE}
1. Chép phần giữa hai đường gạch của MỘT khối, dán vào AI tạo ảnh (đính kèm ảnh mẫu phong cách docs/mau-lac-tuong.png nếu được, kèm câu:
   "Match the art style, chibi proportions and line art of the attached style sample exactly, but draw the NEW character described below.").
2. Kiểm tra ảnh (sai 1 dòng → gen lại):
   [ ] Đúng 1 nhân vật, 1 tư thế (không lưới, không nhiều khung, không nhìn từ sau / chính diện)
   [ ] Toàn thân từ đỉnh đầu (mũ lông) tới bàn chân, không bị cắt, có lề quanh
   [ ] Quay sang PHẢI (nghiêng 3/4)
   [ ] Hai chân hơi dạng, thấy rõ khe giữa hai chân
   [ ] Hai tay tách khỏi thân; vũ khí ở tay trước, tách hẳn khỏi thân và đầu, không bị cắt
   [ ] Không áo choàng / khăn / tóc che vai, khuỷu, hông, gối
   [ ] Nền hồng tím #FF00FF phẳng (hoặc trong suốt), không bóng đổ, không mặt đất, không hào quang / hạt bay
   [ ] Không chữ, số, chữ ký, watermark; đúng chibi 2.5–3 đầu, chất Việt (Đông Sơn)
3. Lưu ảnh đúng tên ghi ở dòng "Tên file" (= mã nhân vật trong game, ví dụ thoren.png, trieuda.png) vào một thư mục.
4. Mở tools/dung-xuong.html (đang làm ở nhánh claude/tool-dung-xuong), kéo thả ảnh vào; dòng "Loại vũ khí" cho biết tool chọn bộ chuyển động nào
   (kiem · riu · giao · cung · no · gay-phep · tay-khong).

Thứ tự gen: 1–3 tướng (Thường → Tím → Vàng), rồi 4 quái, 5 boss.
`;

const total = groups.reduce((n, g) => n + g.items.length, 0);
let txt = `PROMPT ẢNH DỰNG XƯƠNG — ${total} ảnh (sinh bằng: node tools/build-prompt-dung-xuong.js — đừng sửa tay)\n`
  + groups.map((g) => `  ${g.name}: ${g.items.length}`).join('\n') + '\n\n' + DIRECTIVE;
let md = `# Prompt ảnh dựng xương (${total} ảnh)\n\nSinh bằng \`node tools/build-prompt-dung-xuong.js\` — đừng sửa tay. Mỗi khối là một ảnh tĩnh, lưu đúng tên file rồi kéo thả vào \`tools/dung-xuong.html\`.\n\n`
  + groups.map((g) => `- ${g.name}: ${g.items.length}`).join('\n') + '\n\n```\n' + DIRECTIVE + '```\n';
for (const g of groups) {
  txt += `\n${LINE}\n${g.name.toUpperCase()} (${g.items.length})\n${LINE}\n`;
  md += `\n## ${g.name} (${g.items.length})\n`;
  for (const it of g.items) {
    txt += `\n### ${it.title}\nTên file: ${it.file}\n${it.weapon}\n${DASH}\n${it.text}\n${DASH}\n`;
    md += `\n### ${it.title}\n\n- Tên file: \`${it.file}\`\n- ${it.weapon}\n\n\`\`\`\n${it.text}\n\`\`\`\n`;
  }
}
fs.writeFileSync(path.join(ROOT, 'docs/PROMPT-DUNG-XUONG.txt'), txt);
fs.writeFileSync(path.join(ROOT, 'docs/PROMPT-DUNG-XUONG.md'), md);
console.log('docs/PROMPT-DUNG-XUONG.txt (+ .md):', groups.map((g) => `${g.name} ${g.items.length}`).join(' · '), '· tổng', total);
}
