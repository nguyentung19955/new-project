// Sinh prompt VIDEO (AI tạo video từ ảnh: Kling, Hailuo, Runway, Veo…) cho mọi tướng / quái / boss.
// Mỗi nhân vật vài video ngắn ~5 giây, mỗi video MỘT động tác, khung đầu = ảnh tĩnh của nhân vật (ảnh docs/PROMPT-DUNG-XUONG.txt
// hoặc assets/packs/<mã>/idle.png phóng to + thêm lề nền #FF00FF). Video tải về đặt tên <mã>-<động tác>.mp4 rồi cắt khung.
// Dữ liệu dùng chung: thẻ nhận diện tướng (tools/hero-id.js), loại vũ khí + dáng quái (tools/build-prompt-dung-xuong.js),
// mô tả quái / boss (tools/build-prompts.js) — đọc thẳng từ mã nguồn để khỏi chép hai nơi.
// Chạy: node tools/build-prompt-video.js  →  docs/PROMPT-VIDEO.txt (+ .md)
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '..');
const ctx = { console, window: {}, document: { createElement: () => ({ getContext: () => ({}) }) }, Image: function () {}, localStorage: { getItem() {}, setItem() {} }, navigator: {} };
vm.createContext(ctx);
for (const f of ['art', 'data', 'enemies2']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f + '.js'), 'utf8').replace(/^(const|let) /gm, 'var '), ctx);
const { HEROES, ENEMIES } = ctx;
const { HERO_ID } = require('./hero-id.js');

// lấy hằng `const NAME = …;` trong một file nguồn (quét tới dấu ; ngoài chuỗi / ngoặc)
function grab(file, name) {
  const SRC = fs.readFileSync(path.join(__dirname, file), 'utf8');
  const start = SRC.search(new RegExp(`^const ${name} = `, 'm'));
  if (start < 0) { console.error('Không tìm thấy', name, 'trong tools/' + file); process.exit(1); }
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
}
const EL = grab('build-prompts.js', 'EL'), REDO_ENEMY = grab('build-prompts.js', 'REDO_ENEMY'), REDO_BOSS = grab('build-prompts.js', 'REDO_BOSS');
const HERO_WEAPON = grab('build-prompt-dung-xuong.js', 'HERO_WEAPON'), FOE = grab('build-prompt-dung-xuong.js', 'FOE');

// ── khối chung ──
const FIXED = 'CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.';
const SAME = 'CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.';
const BG = 'BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.';
const LOOP = 'TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).';
const NEG = 'NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.';

// động tác đánh theo loại vũ khí (tướng)
const ATTACK = {
  kiem: (w) => `ATTACK: holding the ${w}, the character pulls it back behind the shoulder (wind-up), then slashes it forward in ONE fast arc with a single short white swoosh, the arm fully extended at the end, then returns to the starting pose.`,
  riu: (w) => `ATTACK: holding the ${w} with a firm grip, the character raises it high behind the head (wind-up), then chops it down and forward in ONE strong arc with a single short swoosh, the head of the weapon stays attached to its handle, then returns to the starting pose.`,
  giao: (w) => `ATTACK: holding the ${w}, the character draws it back (wind-up), then thrusts it straight forward to the right with a small lunge step, arm extended, then pulls it back to the starting pose.`,
  cung: (w) => `ATTACK: with the ${w}, the character nocks an arrow, draws the string back to the cheek (the arrow always visible on the string), releases — the arrow flies off to the right and out of frame — then lowers the bow back to the starting pose.`,
  no: (w) => `ATTACK: the character raises the ${w} level, aims to the right, shoots — a small projectile flies off to the right and out of frame, the weapon kicks back a little — then lowers it back to the starting pose.`,
  'gay-phep': (w) => `ATTACK: the character raises the ${w} (wind-up), a small glow gathers at its tip, then swings / points it forward to the right releasing ONE small magic orb that flies off to the right and out of frame, then returns to the starting pose.`,
  'tay-khong': (w) => `ATTACK: the character leans back (wind-up), then strikes forward to the right (${w}) with one quick motion and a small hit spark, then returns to the starting pose.`,
};
// quái / boss theo dáng
const WALK = {
  human: 'WALK: walking in place (treadmill walk, NOT moving across the frame), facing right, 4 clear steps: front leg forward, legs together body highest, back leg forward, legs together — a smooth loop, arms swinging slightly.',
  spirit: 'WALK: floating / gliding in place facing right (NOT moving across the frame), gentle bobbing up and down, robes and limbs swaying — a smooth loop.',
  beast: 'WALK: walking in place on all legs (treadmill walk, NOT moving across the frame), facing right, a clear 4-step gait, head bobbing slightly — a smooth loop.',
  serpent: 'WALK: slithering in place facing right (NOT moving across the frame), the body rippling in a smooth S-wave from head to tail — a smooth loop.',
  fly: 'WALK: hovering in place facing right (NOT moving across the frame), wings flapping fully up and down in a steady rhythm, body at the same height — a smooth loop.',
  rider: 'WALK: the mount walks in place (treadmill walk, NOT moving across the frame), facing right, the rider bobbing with each step — a smooth loop.',
};
const FOE_ATTACK = {
  human: 'ATTACK: rears back (wind-up), then lunges forward to the right striking with its weapon / fists in ONE fast motion with a small hit spark, then returns to the starting pose.',
  spirit: 'ATTACK: draws back, then lashes forward to the right in ONE fast motion with a small hit spark, then returns to the starting pose.',
  beast: 'ATTACK: crouches back (wind-up), then pounces / bites forward to the right in ONE fast motion with a small hit spark, then returns to the starting pose.',
  serpent: 'ATTACK: coils back, then strikes forward to the right with the head in ONE fast snap, mouth open, then returns to the starting pose.',
  fly: 'ATTACK: pulls back in the air, then dives forward to the right with talons / beak in ONE fast swoop, then returns to the starting hover.',
  rider: 'ATTACK: the rider raises the weapon and thrusts / swings it forward to the right in ONE fast motion while the mount rears slightly, then returns to the starting pose.',
};

// cảnh mỗi nhân vật: [đuôi tên file, tên động tác, nội dung]
function heroClips(t) {
  const h = HERO_ID[t], [code] = HERO_WEAPON[t], el = EL[HEROES[t].el][0];
  return [
    ['tho', 'Đứng thở (idle)', `IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.`],
    ['danh', 'Đánh thường', ATTACK[code](h.weapon)],
    ['chieu', 'Tung chiêu', `SKILL: the character gathers power (a small ${el.toLowerCase()}-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: ${h.fx} — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.`],
    ['trung', 'Trúng đòn', 'HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.'],
  ];
}
function foeClips(k, boss) {
  const [kind] = FOE[k];
  const c = [['di', 'Đi (4 bước, lặp)', WALK[kind]], ['danh', 'Đánh', FOE_ATTACK[kind]]];
  if (boss) c.push(['gian', 'Nổi giận', 'RAGE: the boss roars with its head thrown back, arms / wings / body spread wide, its body glowing red-orange more and more strongly, a few small embers around it, then the glow settles and it returns to the starting pose.']);
  return c;
}
const clip = (name, who, action) => `Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate ${who} — 2D chibi game character animation for a mobile game sprite.
${action}
${FIXED}
${SAME}
${BG}
${LOOP}
${NEG}`;

const tierName = ['Thường', 'Tím', 'Vàng'];
const tier = (t) => (HEROES[t].legend === 'legendary' ? 2 : HEROES[t].legend === 'epic' ? 1 : 0);
const groups = [];
for (let i = 0; i < 3; i++) groups.push({ name: `${i + 1}. Tướng ${tierName[i]}`, items: Object.keys(HEROES).filter((t) => tier(t) === i).map((t) => ({
  code: t, title: `${HEROES[t].name} · ${tierName[i]} · ${EL[HEROES[t].el][0]}`, img: `${t}.png`,
  clips: heroClips(t).map(([s, n, a]) => ({ file: `${t}-${s}.mp4`, name: n, text: clip(n, `the hero ${HEROES[t].name} (holding: ${HERO_ID[t].weapon})`, a) })) })) });
const foes = (src, boss) => Object.keys(src).map((k) => ({
  code: k, title: `${boss ? 'Boss' : 'Quái'} · ${ENEMIES[k].name}`, img: `${k}.png`,
  clips: foeClips(k, boss).map(([s, n, a]) => ({ file: `${k}-${s}.mp4`, name: n, text: clip(n, `the ${boss ? 'boss monster' : 'monster'} ${ENEMIES[k].name}`, a) })) }));
groups.push({ name: '4. Quái', items: foes(REDO_ENEMY, false) }, { name: '5. Boss', items: foes(REDO_BOSS, true) });
for (const t of Object.keys(HEROES)) if (!HERO_ID[t] || !HERO_WEAPON[t]) { console.error('Thiếu dữ liệu cho tướng', t); process.exit(1); }

const LINE = '='.repeat(60), DASH = '-'.repeat(60);
const nChar = groups.reduce((n, g) => n + g.items.length, 0), nClip = groups.reduce((n, g) => n + g.items.reduce((m, it) => m + it.clips.length, 0), 0);
const GUIDE = `${LINE}
HƯỚNG DẪN — TẠO VIDEO TỪ ẢNH (Kling · Hailuo · Runway · Veo…)
${LINE}
ẢNH ĐẦU VÀO (khung đầu của video), mỗi nhân vật 1 ảnh, dùng chung cho mọi video của nhân vật đó:
  - Ảnh tĩnh gen theo docs/PROMPT-DUNG-XUONG.txt (toàn thân, quay PHẢI, tay + vũ khí tách khỏi thân), hoặc
  - Ảnh có sẵn assets/packs/<mã>/idle.png (quái / boss: walk1.png) — phóng to cao ≥ 720 px và thêm lề nền hồng tím #FF00FF
    khoảng 25% mỗi bên (nhất là phía trên và phía trước) để có chỗ vung vũ khí.
  - Nền hồng tím #FF00FF phẳng, không bóng, không chữ. Khung vuông 1:1 (hoặc dọc 9:16 nếu trang chỉ có tỉ lệ đó).

CÁCH LÀM TRÊN KLING (klingai.com → AI Videos → Image to Video; trang khác tương tự):
  1. Tải ảnh nhân vật lên làm ảnh đầu (Start frame). Có ô End frame (khung cuối) thì tải CHÍNH ảnh đó vào luôn → video kết thúc đúng dáng đứng, lặp mượt.
  2. Chép phần giữa hai đường gạch của MỘT video dán vào ô Prompt. Có ô Negative prompt riêng thì chuyển dòng "NEGATIVE: …" sang ô đó.
  3. Thời lượng 5 giây, chế độ Standard là đủ. Bấm Generate.
  4. Xem lại (sai 1 dòng → tạo lại, thường 2–3 lần có bản tốt):
     [ ] Camera đứng yên, nhân vật không trôi, không phóng to / thu nhỏ
     [ ] Đúng 1 nhân vật, cùng mặt, cùng áo, cùng vũ khí suốt video; vũ khí không biến mất / không nhân đôi
     [ ] Toàn thân luôn trong khung, không bị cắt chân / đầu / vũ khí
     [ ] Nền vẫn hồng tím phẳng, không hiện mặt đất / cảnh / bóng
     [ ] Động tác rõ: có lấy đà → ra đòn → thu về; cuối video về gần dáng đầu
  5. Tải mp4, đặt tên đúng dòng "Tên file" (ví dụ lactuong-danh.mp4) vào một thư mục; gửi cho Claude để cắt khung đưa vào game.

KHUNG GAME LẤY TỪ MỖI VIDEO (tool cắt tự chọn):
  Tướng (lưới hero12):  -tho → idle 3 khung · -danh → attack 4 khung · -chieu → cast 3 khung · -trung → hurt 1 khung · chân dung lấy từ ảnh đầu
  Quái  (lưới enemy6):  -di → walk 4 khung · -danh → attack 2 khung
  Boss  (lưới boss9):   -di → walk 4 khung · -danh → attack 3 khung · -gian → rage 2 khung

Thứ tự làm gợi ý: vài tướng hay dùng trước để thử (Lạc Tướng, Xạ Thủ, Thầy Mo), xem kết quả trong game rồi mới làm tiếp.
`;
let txt = `PROMPT VIDEO — ${nChar} nhân vật · ${nClip} video (sinh bằng: node tools/build-prompt-video.js — đừng sửa tay)\n`
  + groups.map((g) => `  ${g.name}: ${g.items.length} nhân vật · ${g.items.reduce((m, it) => m + it.clips.length, 0)} video`).join('\n') + '\n\n' + GUIDE;
let md = `# Prompt video từ ảnh (${nChar} nhân vật · ${nClip} video)\n\nSinh bằng \`node tools/build-prompt-video.js\` — đừng sửa tay. Mỗi khối là một video ~5 giây, khung đầu = ảnh nhân vật.\n\n`
  + groups.map((g) => `- ${g.name}: ${g.items.length} nhân vật`).join('\n') + '\n\n```\n' + GUIDE + '```\n';
for (const g of groups) {
  txt += `\n${LINE}\n${g.name.toUpperCase()} (${g.items.length})\n${LINE}\n`;
  md += `\n## ${g.name} (${g.items.length})\n`;
  for (const it of g.items) {
    txt += `\n### ${it.title}\nẢnh đầu vào: ${it.img}\n`;
    md += `\n### ${it.title}\n\n- Ảnh đầu vào: \`${it.img}\`\n`;
    for (const c of it.clips) {
      txt += `\n# ${c.name} — Tên file: ${c.file}\n${DASH}\n${c.text}\n${DASH}\n`;
      md += `\n#### ${c.name} — \`${c.file}\`\n\n\`\`\`\n${c.text}\n\`\`\`\n`;
    }
  }
}
fs.writeFileSync(path.join(ROOT, 'docs/PROMPT-VIDEO.txt'), txt);
fs.writeFileSync(path.join(ROOT, 'docs/PROMPT-VIDEO.md'), md);
console.log('docs/PROMPT-VIDEO.txt (+ .md):', groups.map((g) => `${g.name} ${g.items.length}`).join(' · '), `· ${nChar} nhân vật · ${nClip} video`);
