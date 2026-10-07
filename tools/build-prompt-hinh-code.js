// Sinh prompt gen ảnh cho MỌI thứ trong game còn VẼ BẰNG CODE (canvas / SVG / emoji / CSS) mà chưa có ảnh trong assets/.
// - Chỉ lấy mục CHƯA có ảnh: đối chiếu với js/asset-list.js (danh sách ảnh thật game tải).
// - Tên file ghi trên từng khối = đường dẫn trong assets/ đúng như code đang tìm (asset(), hasAsset(), uiE(), assetUrl()…).
// - Dùng chung STYLE BIBLE / LOCK / NEGATIVE / DRUM / BG với tools/build-prompts.js (đọc thẳng mã nguồn, không chép hai nơi);
//   prompt đã có trong file tổng (docs/prompts.json, docs/PROMPT-HIEU-UNG.txt, docs/PROMPT-CAN-GEN.txt) thì dùng lại nguyên văn.
// - Ghi thêm tên tấm mới vào tools/cat-anh-them.json (khóa "hc-…") để tools/cat-anh.html tự nhận và cắt đúng tên.
// Chạy: node tools/build-prompt-hinh-code.js  →  docs/PROMPT-THAY-HINH-CODE.txt (+ .md), rồi tự chạy tools/build-cat-anh.js
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ctx = { console, window: {}, document: { createElement: () => ({ getContext: () => ({}) }) }, Image: function () {}, localStorage: { getItem() {}, setItem() {} }, navigator: {} };
vm.createContext(ctx);
for (const f of ['art', 'data', 'enemies2']) vm.runInContext(rd(`js/${f}.js`).replace(/^(const|let) /gm, 'var '), ctx);
const { HEROES } = ctx;
// ảnh đang có (js/asset-list.js)
const aw = {}; vm.runInNewContext(rd('js/asset-list.js'), { window: aw });
const HAVE = new Set(aw.ASSET_LIST);
const have = (p) => HAVE.has(p);

// ---- hằng dùng chung từ tools/build-prompts.js
const SRC = rd('tools/build-prompts.js');
const grab = (name, env = {}) => {
  const start = SRC.search(new RegExp(`^const ${name} = `, 'm'));
  if (start < 0) { console.error('Không tìm thấy', name, 'trong tools/build-prompts.js'); process.exit(1); }
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
  return vm.runInNewContext('(' + SRC.slice(from, i) + ')', env);
};
const STYLE_SAMPLE = grab('STYLE_SAMPLE');
const STYLE_BIBLE = grab('STYLE_BIBLE', { STYLE_SAMPLE });
const DRUM = grab('DRUM'), BG = grab('BG'), ITEM_STYLE = grab('ITEM_STYLE'), LOCK_STYLE = grab('LOCK_STYLE'), NEG_CHAR = grab('NEG_CHAR');
const EL = grab('EL');
const SCENE_STYLE = grab('SCENE_STYLE');
const UI_FRAMES = grab('UI_FRAMES');
const framePrompt = grab('framePrompt', { UI_FRAMES, DRUM, BG });
const IC_SHEETS = grab('IC_SHEETS');
const icPrompt = grab('icPrompt', { BG });
const SPOT_LOOK = grab('SPOT_LOOK');
const SPOT_SHEETS = grab('SPOT_SHEETS', { SPOT_LOOK });
const spotPrompt = grab('spotPrompt', { DRUM, BG });
const NO_TEXT = 'No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.';

// ---- prompt đã có trong file tổng
const PJ = JSON.parse(rd('docs/prompts.json'));
const byFile = Object.fromEntries(PJ.map((x) => [x.file, x]));
// khối "Tên file: X.png" / "lưu tên: X.png" + phần giữa hai đường gạch (PROMPT-HIEU-UNG.txt, PROMPT-CAN-GEN.txt)
const FXDOC = {};
for (const f of ['docs/PROMPT-HIEU-UNG.txt', 'docs/PROMPT-CAN-GEN.txt']) {
  const L = rd(f).split('\n');
  L.forEach((ln, i) => {
    const m = ln.match(/(?:Tên file|lưu tên): ([\w.-]+)\.png/);
    if (!m) return;
    let j = i + 1; while (j < L.length && !/^-{20,}/.test(L[j])) j++;
    let k = j + 1; while (k < L.length && !/^-{20,}/.test(L[k])) k++;
    const cut = (L.slice(i, j).join('\n').match(/cat-fx\.py[^\n|`]*/) || [''])[0].trim();
    const head = /^#\d+ · /.test(ln) ? ln.replace(/^#\d+ · /, '').replace(/ · ảnh .*/, '') : (L[i - 1] || '').trim();
    if (!FXDOC[m[1]]) FXDOC[m[1]] = { text: L.slice(j + 1, k).join('\n').trim(), cut, head, src: f };
  });
}
const ALL_DOCS = ['docs/PROMPT-GUI-AI.txt', 'docs/PROMPT_GEMINI_FULL.txt', 'docs/PROMPT-CAN-GEN.txt', 'docs/PROMPT-HIEU-UNG.txt', 'docs/PROMPT-FOOOCUS.txt']
  .filter((f) => fs.existsSync(path.join(ROOT, f))).map((f) => [f, rd(f)]);
const inDocs = (names) => {
  const hit = ALL_DOCS.filter(([, s]) => names.some((n) => s.includes(n))).map(([f]) => f.replace('docs/', ''));
  return hit.length ? 'CÓ — ' + hit.join(', ') : 'CHƯA';
};

// ============================================================ DANH MỤC
// mỗi mục = MỘT ảnh gửi AI. files: đường dẫn trong assets/ theo thứ tự ô (null = ô bỏ). cat: cách tools/cat-anh.html cắt
//   ['vat', {dir,size}] tách từng vật theo thứ tự đọc · ['khung', {dir,max}] giữ tỉ lệ · 'cu' = tên đã có sẵn trong cat-anh · 'thang' = đặt thẳng
const ITEMS = [];
const add = (o) => ITEMS.push(o);
const G = {
  A: 'A. Bản đồ · ô đặt tướng · công trình',
  B: 'B. Thanh máu · khung HUD trong trận',
  C: 'C. Đạn bay',
  D: 'D. Hiệu ứng chiêu / trúng đòn / vfx',
  E: 'E. Triệu hồi · vật ném',
  F: 'F. Icon UI (trạng thái, tài nguyên, chỉ số)',
  G: 'G. Khung · nút · nền panel',
  H: 'H. Tướng · đồ (icon kỹ năng, đồ ghép)',
  I: 'I. Màn hình (kết quả, chương, menu, truyện, núi)',
};

// ---- A. ô đặt tướng (hiện ở MỌI ải, 10–12 ô mỗi bản đồ)
for (const [k, v] of Object.entries(SPOT_SHEETS)) add({
  g: 'A', pri: 1, save: 'hc-' + k, title: v.title, files: v.cells.map((c) => `${v.dir}/${c[0]}`),
  where: 'js/render.js:573-648 (drawSpot: đế tướng, chưa có ảnh thì vẽ elip + vòng trống đồng)', size: '≈27×18 px trên màn 844×390 (≈40×27 ở 1920×934)',
  frames: 'tĩnh · 1 ảnh / trạng thái', text: spotPrompt(v.cells.map((c) => c[1])), cat: ['vat', { dir: v.dir, size: 128 }],
});

// ---- B. thanh máu + dải thông báo + sao thần
const FR = (k, g, pri, where, size, frames) => {
  const v = UI_FRAMES[k];
  add({ g, pri, save: 'hc-' + k, title: v.title, files: v.files.map((f) => 'ui/' + f), where, size, frames, text: framePrompt(k), cat: ['khung', { dir: 'ui', max: v.max }] });
};
FR('thanh-mau', 'B', 1, 'js/main.js:702-710 (máu tướng) · js/render.js:2278-2298 (máu quái / boss) · thanh boss HTML #bossbar', 'tướng 22×3 · quái 16–40×2 · boss ~300×10 px (844×390)', '3 khung tĩnh (boss · tướng · quái); ruột thanh vẫn vẽ code');
FR('dai-thong-bao', 'B', 3, 'js/main.js:1138 (banner tên chiêu lớn / boss tới)', '≈260×44 px', '1 ảnh tĩnh, chữ vẽ code đè lên');
add({ g: 'B', pri: 3, save: 'hc-sao-than-tinh', title: 'Sao Thần tinh trên đầu tướng thần', files: ['ui_than-tinh.png'],
  where: 'js/main.js:714-721 (★ trên đầu tướng; tướng thần dùng ui_than-tinh.png)', size: '8×8 px (vẽ 16 px để nét)', frames: '1 ảnh tĩnh',
  text: `Create ONE image: a 256x256 square game UI icon, one element centered: a small five-pointed star made of glowing orange-gold bronze with a tiny red sun-star gem in the middle and a thin dark-brown outline #2A1608 — the "god star" rank mark shown above a hero's head.
${DRUM}. One bold simple shape readable at 8-12 px: no fine engraving, thick outline, fills about 80% of the image. ${NO_TEXT}
${BG}`, cat: ['vat', { dir: '', size: 64 }] });

// ---- C. đạn (PROMPT-HIEU-UNG.txt D · PROMPT-CAN-GEN.txt) — tên tấm đã có sẵn trong cat-anh
const FX = (save, g, pri, files, where, size, frames, title) => {
  const d = FXDOC[save];
  if (!d) { console.error('Thiếu khối prompt cho', save); process.exit(1); }
  add({ g, pri, save, title: title || d.head.replace(/^[A-Z]\d+\.\s*/, ''), files, where, size, frames, text: d.text, cat: 'cu', cutNote: d.cut, src: d.src });
};
const DAN1 = ['fireball', 'frostbolt', 'arrow', 'bolt', 'orb'], DAN2 = ['feather', 'petal', 'melon', 'rice', 'evil'];
FX('dan-he', 'C', 1, ['kim', 'moc', 'thuy', 'hoa', 'tho'].map((e) => `fx/dan-${e}.png`), 'js/main.js:390-466 drawProjectile (đạn theo hệ khi loại đạn chưa có ảnh riêng)', '7–12 px', '1 ảnh / hệ, game tự xoay theo hướng bay', 'Đạn bay theo hệ (Kim · Mộc · Thủy · Hỏa · Thổ)');
FX('dan-1', 'C', 2, DAN1.map((k) => `fx/dan_${k}.png`), 'js/main.js:394 fx/dan_<loại>.png (cầu lửa · băng · tên · tên nỏ vàng · cầu phép)', '7–12 px', '1 ảnh / loại', 'Đạn riêng 1: cầu lửa · mũi băng · mũi tên · tên nỏ · cầu phép');
FX('dan-2', 'C', 2, DAN2.map((k) => `fx/dan_${k}.png`), 'js/main.js:394 fx/dan_<loại>.png (lông vũ · cánh hoa · dưa hấu · hạt lúa · phép quái)', '7–12 px', '1 ảnh / loại', 'Đạn riêng 2: lông vũ · cánh hoa · dưa hấu · hạt lúa · phép quái');

// ---- D. vfx (dải 6 khung)
const ELS = [['kim', 'Kim'], ['moc', 'Mộc'], ['thuy', 'Thủy'], ['hoa', 'Hỏa'], ['tho', 'Thổ']];
for (const [e] of ELS) FX(`trung-${e}`, 'D', 1, [`vfx/trung-${e}.png`], 'js/main.js:1028 drawFxArt impact (đạn trúng quái)', '34–46 px', 'dải 6 khung (1536×256)');
for (const [e] of ELS) FX(`vong-chieu-${e}`, 'D', 2, [`vfx/vong-chieu-${e}.png`], 'js/main.js:1036 drawFxArt cast (vòng dưới chân khi tung chiêu)', '55–80 px', 'dải 6 khung');
for (const [e] of ELS) FX(`no-${e}`, 'D', 3, [`vfx/no-${e}.png`], 'js/main.js:1028 (đạn nổ lan)', '50–90 px', 'dải 6 khung');
FX('chet-quai', 'D', 1, ['vfx/chet-quai.png'], 'js/main.js:1044, 1822 (quái chết: 8 chấm code + khói)', '≈34 px', 'dải 6 khung');
FX('chet-boss', 'D', 3, ['vfx/chet-boss.png'], 'js/main.js:1044 (boss chết)', '≈90 px', 'dải 6 khung');
const VFX_USE = {
  'slash-gold': ['slash / xslash / claw — chém của 30 tướng cận chiến', 1, '22–34 px'], 'hit-spark': ['bash — đòn choáng', 2, '30×12 px'], dust: ['die — bụi khi chết (dự phòng chet-quai)', 3, '34 px'],
  'fire-burst': ['explosion — nổ lửa', 2, 'theo bán kính chiêu'], 'fire-pillar': ['pillar — cột lửa Thầy Mo', 2, '26×73 px'], 'ice-ring': ['nova — vòng băng', 2, 'theo bán kính'],
  freeze: ['snow — mù sương / đóng băng', 2, 'theo bán kính'], 'water-wave': ['wave — sóng nước', 2, 'theo bán kính'], lightning: ['bolt — sét', 2, '≈170 px cao'],
  heal: ['heal — hồi máu', 2, 'vòng + dấu cộng'], 'shield-gold': ['dome — khiên vàng', 3, 'nửa elip bán kính'], rocks: ['rockfall / cracks — đá rơi, nứt đất', 3, '29×21 px'],
  coins: ['drop — rơi đồ', 3, '11 px'], 'music-notes': ['notes — nốt nhạc (Trương Chi, Thạch Sanh)', 3, '12 px'], 'spawn-ring': ['summon — đặt tướng / triệu hồi', 1, '30×21 px'],
  'flood-rise': ['floodrise — nước dâng cả màn', 3, 'toàn màn'], 'mountain-rise': ['raise — mọc núi', 3, '34×24 px'],
  ring: ['ring — vòng sóng toả (lên cấp, đánh lan)', 1, 'theo bán kính'], streak: ['streak / beam — tia bắn thẳng', 2, 'đường 4 px'], afterimage: ['afterimage — bóng lướt', 3, '5 bóng 9×21 px'],
  hook: ['hook — ném đá tảng / móc kéo', 3, 'dây + đầu 7 px'], sweep: ['sweep — quét gậy tre', 2, 'cung bán kính'], vortex: ['vortex — xoáy', 3, '30 px'], revive: ['revive — hồi sinh', 3, '25×92 px'],
  volley: ['volley — loạt tên bắn lên', 3, '6 nét'], warn: ['warn — vùng cảnh báo', 2, 'elip bán kính'], rain: ['rain — mưa tên', 2, '22 nét trên vùng'], mark: ['mark — dấu săn mục tiêu', 3, '21–34 px'], meteor: ['meteor — thiên thạch / Hỏa Sơn', 3, '20 px + đuôi'],
};
for (const [k, [u, pri, size]] of Object.entries(VFX_USE)) FX(k, 'D', pri, [`vfx/${k}.png`], `js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (${u})`, size, 'dải 6 khung', `Hiệu ứng ${k} · ${u.split(' — ')[1]}`);

// ---- E. triệu hồi + vật ném (ảnh rời, kiểu chibi)
const DON = { 'trieu-hoi_cay-da-than': ['Cây Đa Thần (Mẫu Thượng Ngàn)', 'js/main.js:500-519 (vòng + thân + 4 tán lá code)', '34×60 px'],
  'trieu-hoi_ngua-sat': ['Ngựa sắt (Thánh Gióng)', 'js/main.js:1092, 1522 (hộp xám + lửa)', '25×14 px'], 'trieu-hoi_giong-bay': ['Gióng bay về trời', 'js/main.js:1554 (chấm cam)', '18–32 px'],
  'trieu-hoi_ho-ba-vi': ['Hổ Ba Vì vồ', 'js/main.js:1653 (khối cam sọc)', '21×13 px'], 'trieu-hoi_chim-lac': ['Chim Lạc', 'js/main.js:1673 (nét chữ V)', '9–15 px'],
  'trieu-hoi_chim-than': ['Chim Thần (Mai An Tiêm)', 'js/main.js:1673 (nét chữ V)', '9–15 px'], 'hieu-ung_da-lan': ['Đá lăn Phong Châu (Lạc Hầu)', 'js/main.js:1546 (elip đá)', '24×20 px'],
  'hieu-ung_den-troi': ['Đèn trời ném', 'js/main.js:1080, 1632 (code luôn vẽ quả dưa xanh)', '11–20 px'], 'hieu-ung_chai': ['Chai ném (Ngư Phủ)', 'js/main.js:1080, 1632', '11–20 px'],
  'hieu-ung_binh-gom': ['Bình gốm ném (Thợ Gốm)', 'js/main.js:1080, 1632', '11–20 px'], 'hieu-ung_dua-hau': ['Dưa hấu ném (An Tiêm, Sọ Dừa)', 'js/main.js:1080, 1632', '11–20 px'] };
for (const [k, [t, w, s]] of Object.entries(DON)) FX(k, 'E', k.startsWith('hieu-ung') ? 2 : 3, [`${k}.png`], w, s, '1 ảnh rời, game tự xoay / lật', t);
// triệu hồi là nhân vật / con vật: thêm khoá phong cách chibi + câu cấm chung của file tổng
for (const it of ITEMS) if (it.save.startsWith('trieu-hoi_') && !it.text.includes('STYLE LOCK'))
  it.text += `\n${LOCK_STYLE} Animals and spirits are chibi too: round, chunky, cute-but-fierce, the same line art.\n${NEG_CHAR.replace(/ in one cell/g, ' in the image').replace(/, a different-looking character between cells/, '').replace(/the cell edge/g, 'the image edge')}`;

// ---- F. icon nhỏ (chỉ số / trạng thái) — prompt nhóm 17 của file tổng
const IC_WHERE = {
  'ic-trang-thai-1': ['js/ui.js:78-133 ic() → thanh boss (js/ui.js:2207-2223): chậm · choáng · đốt · độc · đóng băng — chưa có ảnh thì vẽ SVG IC_SVG', 1],
  'ic-trang-thai-3': ['js/ui.js:78-133 ic() → thẻ boss / tinh anh trên thanh boss (js/ui.js:2213, 2560) + câm lặng · lặn', 1],
};
for (const [k, v] of Object.entries(IC_SHEETS)) add({
  g: 'F', pri: (IC_WHERE[k] || [0, 2])[1], save: 'hc-' + k, title: 'Icon nhỏ · ' + k, files: v.map(([n]) => `ui/ic-${n}.png`),
  where: (IC_WHERE[k] || ['js/ui.js uiE() — ' + k])[0] + ' · bảng chỗ dùng: docs/ICON-NHO.md', size: '12–14 px trên thanh boss (vẽ 128, cắt 64)', frames: 'tĩnh',
  text: icPrompt(v), cat: ['vat', { dir: 'ui', size: 64 }],
  note: ['ic-trang-thai-1', 'ic-trang-thai-3'].includes(k) ? 'Tấm cũ trong assets/chua-dung/ cắt hỏng (ra 7 vật thay vì 5 / 4) → gen lại, mỗi ô MỘT vật rời, không chữ dưới icon.' : '',
});
// icon vẽ tay ui_<tên>.png (uiIc / applyUiArt / sceneArt) — chỉ hiện khi bật "Dùng ảnh AI" trong Cài đặt; tắt thì là chữ ✦ / SVG
const UI_IC = [
  ['ui_dong-vang.png', 'gold coin of the battle: a round gold coin with a square hole and a sun-star engraving', 'js/ui.js:596 applyUiArt — vàng trên thanh trên cùng (đang là đồng CSS)'],
  ['ui_goi-som.png', 'call the next wave early: a small bronze war horn with two speed lines', 'js/ui.js:2172 nút gọi đợt sớm'],
  ['ui_da-kham-pha.png', 'discovered: an open bronze-bound book with a small sparkle', 'js/ui.js:258 dấu đã khám phá (Bách khoa)'],
  ['ui_luyen-the.png', 'body training: a stone dumbbell with a fist', 'js/ui.js:2321 luyện thể tướng'],
  ['ui_tay-luyen.png', 'reset training: a bronze washing basin with a circular arrow', 'js/ui.js:3935 tẩy luyện'],
  ['ui_hu-dong.png', 'bronze jar: a round lidded bronze urn with drum patterns', 'js/ui.js:3846 nút Hũ đồng'],
  ['ui_hu-vua-hung.png', 'Hung King jar: a tall golden bronze urn with a sun-star and red cloth seal', 'js/ui.js:3846 nút Hũ Vua Hùng · js/render.js:473 sính lễ'],
  ['ui_kho-lua.png', 'rice storehouse: a small stilt granary with a thatched roof full of golden rice', 'js/render.js:473 sceneArt(kholua) — thẻ thưởng kho lúa'],
];
add({ g: 'F', pri: 3, save: 'hc-ui-ic', title: 'Icon vẽ tay ui_*.png (gọi sớm · khám phá · luyện · hũ · kho lúa · đồng vàng)', files: UI_IC.map((x) => x[0]),
  where: UI_IC.map((x) => `${x[0]}: ${x[2]}`).join(' · '), size: '16–22 px (thẻ thưởng 100–300 px)', frames: 'tĩnh',
  text: `Create ONE image: a 1024x512 game UI icon sheet, an invisible 4x2 grid of eight equal 256x256 cells, one icon per cell, read left to right, top to bottom:
${UI_IC.map((x, i) => `[${i + 1}] ${x[1]}`).join('  ')}.
${ITEM_STYLE}. Each icon: one bold centered object filling about 80% of its cell, readable at 20 px, empty magenta margin around it, nothing touching another cell. ${NO_TEXT}
${BG}`, cat: ['vat', { dir: '', size: 128 }], note: 'Chỉ hiện khi người chơi bật "Dùng ảnh AI" (Cài đặt); tắt thì game vẫn dùng ký hiệu / SVG.' });

// ---- G. khung / nút / nền panel (CSS gradient hiện tại) — nhóm 21 file tổng
FR('khung-bang', 'G', 1, 'js/ui.js:37-53 UI_SKIN → css biến --sk-khung-bang (mọi bảng / popup: Cài đặt, Túi đồ, Lò đúc…)', 'bảng 300–800 px (9-slice)', '1 khung');
FR('nut-chu-nhat', 'G', 1, 'js/ui.js:37-53 UI_SKIN nut-vang-* / nut-dong-* (nút Vào trận, Xuất quân, Mua…)', 'nút 120–240×36–48 px', '3 trạng thái × 2 màu');
FR('nut-tron', 'G', 2, 'js/ui.js:37-53 UI_SKIN nut-tron-* (nút đóng / quay lại / tạm dừng)', '36–44 px', '3 trạng thái');
FR('khung-thanh-day', 'G', 1, 'js/ui.js:37-53 UI_SKIN khung-thanh-day (thanh chợ tướng dưới đáy trận)', '≈700×70 px', '1 khung');
FR('khung-the-cho', 'G', 1, 'js/ui.js:37-53 UI_SKIN the-cho-* + nut-doi-cho (thẻ tướng trong chợ trận)', '≈80×64 px', '3 trạng thái thẻ + nút đổi');

// ---- H. icon kỹ năng 19 tướng còn vẽ SVG (ART.skill) — code tìm ky-nang_<tên>_<q|w|e|r>.png
const SK_HINT = {
  adv: ['a bronze arrow bouncing between two targets with motion arcs', 'a small spiral Co Loa citadel wall seen from above', 'a fan of five crossbow bolts flying up from a bronze rampart', 'a glowing golden turtle-claw crossbow with radiant light'],
  auco: ['a pink fairy flower with a green healing sparkle', 'one white fairy feather with a soft glow', 'a gentle green mountain with a mother-shape silhouette', 'a big golden egg sack with many small eggs inside'],
  giong: ['a bamboo stalk with ivory joints swung like a club', 'an iron chest armor plate', 'an iron horse head breathing a trail of fire', 'a hero silhouette flying up into the sky on an iron horse with a light beam'],
  kimquy: ['a golden turtle shell', 'a golden turtle claw', 'cracked ground with a shockwave', 'a golden turtle shell shield over a small citadel'],
  llq: ['a green dragon claw slash with three claw marks', 'shiny jade dragon scales', 'a big roaring sea wave', 'a dragon head breathing a blue beam'],
  mau: ['green forest vines tying in a knot', 'thick old tree roots', 'a sacred banyan tree', 'an angry forest: dark trees with glowing eyes and falling leaves'],
  antiem: ['a watermelon slice flying', 'a golden seed sprouting', 'a magic bird carrying a seed', 'many watermelons raining down'],
  caolo: ['three crossbow bolts in a row', 'a bronze crossbow trigger mechanism', 'an arrow with a turtle-claw arrowhead', 'a giant glowing divine crossbow'],
  cdt: ['a magic walking staff with a green heal glow', 'a conical magic hat (non la) with sparkles', 'a red river wave', 'a citadel appearing overnight under a crescent moon'],
  lachau: ['a bronze war drum with sound rings', 'spiky rhino-hide armor', 'a big round boulder rolling with dust', 'three raised fists with a sun-star behind (tribe oath)'],
  lactuong: ['a bronze axe chopping down with an impact spark', 'a bronze axe spinning in a whirlwind', 'a roaring warrior aura: red-gold flame around a fist', 'a lightning bolt striking from a storm cloud over a mountain'],
  lucsi: ['a big boulder thrown with a motion arc', 'a strong shoulder carrying a small mountain', 'a cloud of rock dust', 'a pile of rocks burying the ground'],
  thachsanh: ['a woodcutter axe chopping a log', 'a golden bow with a golden arrow', 'a magic lute (dan) with music notes', 'a broken ogre horn with a slash mark'],
  thansan: ['a spear tip dripping green poison', 'a sharp tiger fang', 'a roaring tiger head', 'a hunting horn with crossed spears'],
  thansuong: ['a frosty white mist ring', 'a sharp ice shard', 'a cold wind swirl over a snowy mountain peak', 'a thick fog blizzard swirl'],
  thaymo: ['a tall fire pillar', 'a spirit torch with a blue-orange flame', 'burning flames on the ground', 'a fiery volcano erupting meteors'],
  thosan: ['a footstep made of green leaves with a dash trail', 'a hidden spear among leaves', 'a red critical-hit burst on a target', 'a hunting dagger with a red target mark'],
  tiendung: ['a round fairy fan with sparkles', 'a shining jewel', 'a pink lotus flower', 'many fairy flower petals raining'],
  xathu: ['an arrow piercing through two shields', 'three arrows flying in a fan', 'an arrow tip dripping dark poison resin', 'a rain of arrows falling from the sky'],
};
const slugify = (name) => name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const KEYS = ['q', 'w', 'e', 'r'];
for (const t of Object.keys(HEROES).filter((x) => !have(`packs/${x}/sk-q.png`))) {
  const h = HEROES[t], sl = slugify(h.name), hint = SK_HINT[t];
  if (!hint) { console.error('Thiếu gợi ý icon kỹ năng cho', t); process.exit(1); }
  add({ g: 'H', pri: 2, save: 'icon-' + t, title: `Icon kỹ năng · ${h.name}`, files: KEYS.map((k) => `ky-nang_${sl}_${k}.png`),
    where: 'js/ui.js:149-155 skillIcon() + js/render.js:468 skillPngPath() — chưa có ảnh thì vẽ SVG ART.skill (bảng kỹ năng, thẻ tướng, thanh chiêu trong trận)', size: '28–44 px', frames: '4 icon tĩnh (Q · W · E · R)',
    text: `Create ONE image: a 512x128 row of four equal 128x128 square game skill icons for the hero ${h.name} (Vietnamese folk legend), one icon per cell, left to right:
${h.skills.map((s, i) => `[${i + 1}] «${s.name}»: ${hint[i]}`).join('  ')}.
Each icon: one bold simple symbol, centered, fills about 80% of the cell, thick dark-brown outline #2A1608, flat cel shading, main color ${EL[h.el][1]}, small Dong Son bronze-drum accents; no character body, no face. ${NO_TEXT}
${BG}`, cat: 'cu', cutNote: `kiểu icon4 → packs/${t}/sk-q…sk-r.png`,
    note: `cat-anh cắt ra packs/${t}/sk-q…r.png; khi gộp, session điều phối thêm '${t}' vào SKILL_PACK (js/render.js:465) để game dùng (hoặc đổi tên thành ky-nang_${sl}_q…r.png ở gốc assets/).` });
}
const RAGE = ['camap', 'camapden', 'casau', 'kybinh', 'ran', 'ranbang', 'thietky'];
// (rage.png thiếu không làm game vẽ code — quái dùng khung đi thường — nên không đưa vào prompt; ghi ở phần cuối)

// ---- H. đồ ghép (icon vẽ SVG NEW_ITEM_ART) — nhóm 13 file tổng
const SHEETS = JSON.parse(rd('tools/item-sheets.json'));
for (const k of ['do-ghep-1', 'do-ghep-2', 'do-ghep-3']) {
  const p = byFile[k + '.png'];
  if (!p || !SHEETS[k]) continue;
  add({ g: 'H', pri: 2, save: 'hc-' + k, title: p.title, files: SHEETS[k].files, where: 'js/ui.js itemIcon() — túi đồ, Lò đúc, công thức ghép (chưa có ảnh thì SVG NEW_ITEM_ART)', size: '24–48 px', frames: 'tĩnh',
    text: p.text, cat: ['vat', { dir: '', size: 128 }] });
}
// ---- I. núi Tản Viên bậc 2 + 5 (bậc 1, 3, 4 đã có ảnh)
const NUI = [['ban-do_nui-2.png', 'stage 2 "Đồi Nhỏ": a small rocky green hill, a bit bigger than a mound, a few rocks and two small trees'],
  ['ban-do_nui-5.png', 'stage 5 "Núi Thần": a giant sacred mountain with misty cliffs, lingzhi mushrooms on the slopes and warm golden light glowing at the peak']];
add({ g: 'I', pri: 3, save: 'hc-nui', title: 'Núi Tản Viên · bậc 2 + bậc 5', files: NUI.map((x) => x[0]), where: 'js/ui.js:4127 render_mountain → sceneArt(mountain2 / mountain5), js/render.js:474 (bậc 1, 3, 4 đã có ảnh)', size: 'ô 100 px cao', frames: '2 ảnh tĩnh',
  text: `Create ONE image: a 1024x512 sheet, an invisible 2x1 grid of two equal 512x512 cells, one mountain per cell, left to right:
${NUI.map((x, i) => `[${i + 1}] ${x[1]}`).join('  ')}.
Both drawn as a single standalone map object seen from a 3/4 top-down view, same camera, same painterly cute style as the other mountain stages (Gò Đất, Núi Non, Núi Cao already exist — match them), soft dark-brown outline, rich colors, Dong Son flavor; the whole mountain inside its cell with an empty margin. NOT a round medallion, NOT a coin, NOT a badge, no circular frame. ${NO_TEXT}
${BG}`, cat: ['vat', { dir: '', size: 512 }], note: 'Chỉ hiện khi bật "Dùng ảnh AI". Đính kèm assets/ban-do_nui-1.png / -3 / -4 làm ảnh mẫu để cùng nét.' });

// ---- I. màn hình (tranh nền) — nhóm 0 / 18 / 19 / 20 của file tổng
const SCN = (file, g, pri, where, size, alt) => {
  const p = byFile[file] || byFile[alt];
  if (!p) { console.error('Thiếu prompt cảnh', file); process.exit(1); }
  add({ g, pri, save: file.split('/').pop().replace(/\.\w+$/, ''), title: p.title, files: [file], where, size, frames: '1 tranh', text: p.text, cat: 'thang' });
};
for (const ch of ['sontinh', 'thachsanh', 'giong', 'llq', 'adv']) for (const w of ['thang', 'thua'])
  if (byFile[`scenes/${w}-${ch}.png`]) SCN(`scenes/${w}-${ch}.png`, 'I', 2, 'js/ui.js màn kết quả (finishLevel) — chưa có ảnh thì ghép SVG storyScene()', 'nền màn kết quả ≈844×390');
for (const ch of ['sontinh', 'thachsanh', 'giong', 'llq', 'adv']) SCN(`scenes/chuong-${ch}.png`, 'I', 2, 'js/ui.js:1280 showCampaign() — nền bản đồ chọn ải (SVG storyScene)', 'khung bản đồ chương ≈800×300');
SCN('scenes/nen-man-phu.png', 'I', 1, 'js/ui.js:52 loadUiSkins → css --sk-nen-man-phu (Chuẩn bị · Kết quả · Phần thưởng)', 'toàn màn');
SCN('ui/logo-tua.png', 'I', 3, 'js/ui.js:360 logo menu (chưa có ảnh thì chữ CSS gradient) — TUỲ CHỌN: logo là chữ, AI hay sai dấu; sai thì bỏ', '≈420×110 px', 'logo-tua.png');

// ================================================================ LỌC: chỉ giữ mục còn thiếu
for (const it of ITEMS) {
  it.miss = it.files.filter((f) => f && !have(f) && !(it.g === 'H' && have(f.replace(/^ky-nang_[^_]+_(\w)\.png$/, `packs/${it.save.slice(5)}/sk-$1.png`))));
  it.prompt = inDocs([...new Set([it.save, ...it.files.map((f) => f.split('/').pop().replace(/\.\w+$/, ''))])].filter((n) => n.length > 3));
}
const KEEP = ITEMS.filter((it) => it.miss.length).sort((a, b) => a.pri - b.pri || a.g.localeCompare(b.g));
KEEP.forEach((it, i) => { it.n = i + 1; });

// ================================================================ tên mới cho tools/cat-anh.html
const THEM = path.join(__dirname, 'cat-anh-them.json');
// giữ nguyên định dạng file (mỗi mục một dòng): bỏ dòng "hc-…" cũ, chèn dòng mới trước dấu } cuối
const py = (v) => (Array.isArray(v) ? '[' + v.map(py).join(', ') + ']' : v && typeof v === 'object' ? '{' + Object.entries(v).map(([k, x]) => JSON.stringify(k) + ': ' + py(x)).join(', ') + '}' : JSON.stringify(v));
const old = fs.readFileSync(THEM, 'utf8').split('\n').filter((l) => !/^\s*"(hc-|_hc")/.test(l));
const end = old.lastIndexOf('}');
const body = old.slice(0, end).join('\n').replace(/,\s*$/, '');
const rows = [`  "_hc": ${JSON.stringify('Khóa hc-… sinh tự động bởi tools/build-prompt-hinh-code.js (prompt docs/PROMPT-THAY-HINH-CODE.txt) — đừng sửa tay.')}`];
for (const it of KEEP) if (Array.isArray(it.cat)) {
  const [kind, spec] = it.cat, dir = spec.dir;
  const files = it.files.map((f) => (f && it.miss.includes(f) ? (dir ? f.slice(dir.length + 1) : f) : null));
  rows.push(`  ${JSON.stringify(it.save)}: ${py([kind, Object.assign({ dir }, kind === 'vat' ? { size: spec.size } : { max: spec.max }, { files }), `${G[it.g].slice(3)} · ${it.title}`])}`);
}
fs.writeFileSync(THEM, body + ',\n' + rows.join(',\n') + '\n}\n');

// ================================================================ XUẤT
const LINE = '='.repeat(60), DASH = '-'.repeat(60);
const counts = {};
for (const it of KEEP) { const c = counts[it.g] || (counts[it.g] = { blocks: 0, files: 0 }); c.blocks++; c.files += it.miss.length; }
const total = KEEP.reduce((s, it) => s + it.miss.length, 0);
const cutText = (it) => it.cat === 'thang' ? `không cần cắt — đổi tên đúng "${it.files[0]}" rồi để vào zip (đúng thư mục)`
  : it.cat === 'cu' ? `tools/cat-anh.html nhận sẵn tên ${it.save}.png${it.cutNote ? ` (${it.cutNote})` : ''}`
    : `tools/cat-anh.html nhận tên ${it.save}.png → tách ${it.files.length} vật theo thứ tự đọc (trái→phải, trên→dưới)`;
const DIRECTIVE = `${LINE}
CHỈ THỊ CHO AI / INSTRUCTIONS FOR THE AI
${LINE}
EN: Each block between the dashed lines is ONE separate request — generate exactly ONE image per block, at the size written in the block.
Follow the cell layout exactly (one element per cell, same size, empty margin, nothing crosses into another cell). Background: perfectly flat
pure magenta #FF00FF (or fully transparent) unless the block says BLACK #000000 or full-bleed painting. Never write text, letters, numbers,
labels, signatures or watermarks; never draw grid lines or cell borders. Style: cute chibi Vietnamese-mythology game art, Dong Son bronze drum.
VI: Mỗi khối giữa hai đường gạch là MỘT yêu cầu riêng — gen đúng MỘT ảnh cho mỗi khối, đúng kích thước ghi trong khối. Làm đúng bố cục ô
(mỗi ô một vật, cùng cỡ, chừa lề, không lấn sang ô khác). Nền hồng tím phẳng #FF00FF (hoặc trong suốt), trừ khi khối ghi nền ĐEN #000000 hoặc
tranh tràn viền. Tuyệt đối không chữ, số, nhãn, chữ ký, watermark, không kẻ lưới / viền ô. Phong cách chibi thần thoại Việt, trống đồng Đông Sơn.
`;
const GUIDE = `${LINE}
HƯỚNG DẪN NGƯỜI DÙNG: GEN → CẮT → GỬI ZIP
${LINE}
1. Gen theo thứ tự số khối (ưu tiên: thứ người chơi thấy nhiều nhất ở trên). Chép phần giữa hai đường gạch, dán vào AI tạo ảnh.
   Khối có nhân vật / con vật: đính kèm ảnh mẫu phong cách ${STYLE_SAMPLE} kèm câu "Match the art style and line art of the attached style sample".
2. Lưu ảnh ĐÚNG "Lưu ảnh tên" ghi trên khối (vd hc-de-tuong.png, dan-he.png, icon-xathu.png, thua-sontinh.png).
3. Mở tools/cat-anh.html (Chrome / Edge, chạy trên máy), kéo thả cả thư mục ảnh vào → tool tự nhận tên, xoá nền hồng tím, tách từng ô,
   đặt đúng đường dẫn trong assets/ (dòng "Tên file" của khối). Ô báo đỏ "tìm thấy N vật, cần M" = ảnh sai số ô → gen lại khối đó.
   Khối ghi "Cắt: không cần cắt" (tranh nền kết quả / chương / nền màn phụ / logo): ĐỪNG kéo vào cat-anh (tool có thể nhận nhầm
   "thua-giong" thành tướng Gióng) — đổi tên đúng "Tên file" rồi bỏ thẳng vào zip theo đúng thư mục (vd scenes/thua-sontinh.png).
4. Bấm "Tải zip" trong tool, gửi zip lại cho Claude: Claude giải nén vào assets/, chạy node tools/build-asset-list.js, kiểm tra trong game.
5. Kiểm tra trước khi nhận ảnh: đúng số ô · mỗi ô một vật · không chữ / số / watermark · nền phẳng · không cắt mất mép vật.
`;
const head = (it) => `#${it.n} · ${it.title} · nhóm ${it.g} · ưu tiên ${it.pri}
Lưu ảnh tên: ${it.save}.png   ·   Cắt: ${cutText(it)}
Tên file (trong assets/, đúng như code đang tìm): ${it.files.map((f) => (f ? (it.miss.includes(f) ? f : f + ' (đã có, bỏ qua)') : '—')).join(' · ')}
Chỗ dùng: ${it.where}
Cỡ hiện trên màn: ${it.size}   ·   Khung: ${it.frames}
Đã có prompt trong file tổng: ${it.prompt}${it.note ? `\nGhi chú: ${it.note}` : ''}`;
const SUMMARY = [`Tổng: ${KEEP.length} ảnh gửi AI → ${total} file trong assets/ (chỉ mục CHƯA có ảnh; đối chiếu js/asset-list.js)`,
  ...Object.keys(G).filter((g) => counts[g]).map((g) => `  ${G[g]}: ${counts[g].blocks} ảnh gửi AI · ${counts[g].files} file`)].join('\n');
const PRIO = `ƯU TIÊN (người chơi thấy nhiều nhất trước):
  1 = thấy liên tục trong MỌI trận / mọi màn (ô đặt tướng, thanh máu, đạn theo hệ, trúng đòn, quái chết, khung bảng / nút / thanh chợ, icon trạng thái, nền màn phụ)
  2 = thấy thường xuyên (đạn riêng, vòng chiêu, chém, icon kỹ năng, tranh chương / kết quả)
  3 = hiếm (chiêu riêng của vài tướng, boss chết, dải thông báo, icon ui_* chỉ hiện khi bật "Dùng ảnh AI", núi Tản Viên, logo tuỳ chọn…)`;
const NOHOOK = `${LINE}
CÒN VẼ BẰNG CODE NHƯNG CODE CHƯA CÓ CHỖ NHẬN ẢNH (chưa tạo prompt — cần nối code trước, xem GAMEPLAY.md)
${LINE}
- Trên bản đồ: vòng tầm đánh, vòng chọn / gợi ý ô đặt, đường nối tương sinh (js/main.js:328-351, js/render.js:650-699); gợn nước, mũi tên dòng chảy,
  dấu chân, cọc đầu đường (js/maps.js:307-396); mực nước dâng (js/render.js:559-568); viền / cỏ bờ đường (js/maps.js:232-303).
- Trên tướng / quái: bóng đổ, hào quang hạng, cột sáng tung chiêu, sao ★ hạng, huy hiệu cấp, chấm hệ (js/main.js:702-805, 943-968);
  bia mộ chờ hồi sinh (js/main.js:652-669); mũi tên ghép (js/main.js:610-629); dấu trạng thái trên đầu quái (sao choáng, khối băng, rễ trói, mây câm…);
  hào quang boss, vòng tinh anh, hạt biến thể (js/render.js:2072-2325); cánh rồng Lạc Long Quân (js/render.js:1626-1664).
- Vật trong trận: đồng xu rơi khi giết quái, hộp rơi đồ, số sát thương bay (js/main.js:1125-1837); khiên Kim Quy trên thành (js/main.js:573-591);
  Thành Một Đêm (js/main.js:544-549); vùng lửa / lúa / đá (js/main.js:474-532).
- Ảnh code có tìm nhưng KHÔNG phải hình code (thiếu thì dùng ảnh khác, không cần gấp): khung giận packs/<quái>/rage.png của ${RAGE.join(', ')};
  khung hoạt hình nhiều ảnh packs/<id>/{idle,attack,cast,walk}_N.png; tiles/castle-phong-chau.png (chương Sơn Tinh, thiếu thì không vẽ gì).
- Giao diện HTML (SVG / emoji / CSS, chưa có hook): icon vai trò 7 màu (js/roles.js:96); nút đóng ✕ / quay lại ‹, dấu ✓, ↑ nâng kỹ năng, núi (ICON ui.js:19-32);
  khoá chợ mở / đóng (MK_LOCK ui.js:63); SVG_LOCK / SVG_SK (ui.js:69-70); sách Bách khoa, trống đồng cảm ơn (ui.js:4164, 1569); nén bạc Ngân khố (.bac CSS);
  nút 💬 trò chuyện, ≡ menu, mắt ẩn / hiện giao diện, x1 / x2 tốc độ (index.html:35-40); ngăn kéo 🎒 🔯 📖 ⏸ ✉ 🏳 (index.html:61-67);
  ⚒ Lò đúc, ⛺ Nghỉ chân, ☀ nhiệm vụ ngày, 🤝 Cùng giữ thành, ⚜ Thần Khí, 📜 Công thức, 🍄 Linh Chi, ⛰ bồi đất, 🎁 quà (ui.js nhiều chỗ);
  sao ★ bậc tướng 1–3 (ui.js:1823…4086); icon chương khi thua 👹 🔥 🌊 🏹 ♾ (js/chapters.js CH_THEME.ic); màn xoay ngang sceneArt('rotate');
  khung kim loại .metal / .inset / tab .seg / đinh tán / hoa văn menu (css); ruột thanh máu boss, máu / năng lượng tướng, thanh tiến độ (css).
  Nhiều chỗ đã có ảnh nhưng code chưa dùng: ⚔ ui-tran-5-3, ▲ ui-tran-4-2, ↻ ui-tran-4-4, bạc ui-tai-nguyen-3, 🔥 ic-kho — chỉ cần nối code, không cần gen.
`;
const block = (it) => `${head(it)}\n${DASH}\n${it.text}\n${DASH}\n`;
let txt = `PROMPT THAY HÌNH VẼ BẰNG CODE — ${KEEP.length} ảnh (sinh bằng: node tools/build-prompt-hinh-code.js — đừng sửa tay)
${SUMMARY}

${DIRECTIVE}
${GUIDE}
${PRIO}

${STYLE_BIBLE}
`;
for (const g of Object.keys(G)) {
  const list = KEEP.filter((it) => it.g === g);
  if (!list.length) continue;
}
// in theo thứ tự ưu tiên, có tiêu đề nhóm ưu tiên
for (const p of [1, 2, 3]) {
  const list = KEEP.filter((it) => it.pri === p);
  if (!list.length) continue;
  txt += `\n${LINE}\nƯU TIÊN ${p} — ${list.length} ảnh\n${LINE}\n\n` + list.map(block).join('\n');
}
txt += '\n' + NOHOOK;
fs.writeFileSync(path.join(ROOT, 'docs/PROMPT-THAY-HINH-CODE.txt'), txt);

// bản .md: bảng tóm tắt + bảng mục + prompt trong khối code
const md = [`# Prompt thay hình vẽ bằng code — ${KEEP.length} ảnh`, '', '> Sinh bằng `node tools/build-prompt-hinh-code.js` — đừng sửa tay. Bản chép-dán: `docs/PROMPT-THAY-HINH-CODE.txt`.', '',
  '## Tóm tắt theo nhóm', '', '| Nhóm | Ảnh gửi AI | File trong assets/ |', '|---|---|---|',
  ...Object.keys(G).filter((g) => counts[g]).map((g) => `| ${G[g]} | ${counts[g].blocks} | ${counts[g].files} |`), `| **Tổng** | **${KEEP.length}** | **${total}** |`, '',
  '## Hướng dẫn', '', '```', DIRECTIVE + GUIDE + PRIO, '```', '',
  '## Danh sách', '', '| # | Ưu tiên | Nhóm | Mục | Lưu ảnh tên | File thiếu | Cỡ trên màn | Đã có prompt tổng |', '|---|---|---|---|---|---|---|---|',
  ...KEEP.map((it) => `| ${it.n} | ${it.pri} | ${it.g} | ${it.title} | \`${it.save}.png\` | ${it.miss.length} | ${it.size} | ${it.prompt.startsWith('CÓ') ? 'có' : 'chưa'} |`), '',
  '## Prompt', '', ...KEEP.map((it) => `### #${it.n} · ${it.title}\n\n\`\`\`\n${head(it)}\n\`\`\`\n\n\`\`\`\n${it.text}\n\`\`\`\n`),
  '## Còn vẽ code nhưng chưa có chỗ nhận ảnh', '', '```', NOHOOK, '```', '', '## Style bible', '', '```', STYLE_BIBLE, '```', ''].join('\n');
fs.writeFileSync(path.join(ROOT, 'docs/PROMPT-THAY-HINH-CODE.md'), md);
console.log(SUMMARY);
require('child_process').execFileSync(process.execPath, [path.join(__dirname, 'build-cat-anh.js')], { stdio: 'inherit' });
