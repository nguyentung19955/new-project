// Test nền tảng PIXEL ART (claude/pixel-nen-tang). Chạy: node tests/pixel/pixel.test.js
// 1. tools/build-pixel.js: nguồn thật hợp lệ (--strict); nguồn lỗi (màu ngoài bảng màu, ký tự chưa khai báo, sai cỡ,
//    thiếu động tác, tràn khung) bị chặn; dựng ra thư mục tạm: PNG đúng cỡ, JSON, manifest theo nhóm
// 2. game ?pixel=1: không lỗi console; mã có pixel (giong · tanvien · chodo · tom · ô nền · icon ngũ hành) vẽ pixel,
//    mã chưa có (lactuong · casau · hành Hỏa) giữ hình cũ; không bật thì không dùng pixel
// 3. chụp 1920×934 · 844×390 · 667×375 · dọc 390×844 + phóng to vùng sprite → tests/pixel/shots/ (xem tận mắt)
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync, spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '../..');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const ok = (c, m) => { if (!c) throw new Error('FAIL: ' + m); console.log('  ✓ ' + m); };
const BUILD = path.join(ROOT, 'tools', 'build-pixel.js');
const bp = require(BUILD);

// ---------------------------------------------------------------- 1. tool
console.log('— build-pixel');
const real = spawnSync(process.execPath, [BUILD, '--check', '--strict'], { encoding: 'utf8' });
ok(real.status === 0, `nguồn thật hợp lệ (--check --strict)${real.status ? '\n' + real.stdout + real.stderr : ''}`);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pixel-'));
const mk = (group, code, text) => { fs.mkdirSync(path.join(tmp, 'src', group), { recursive: true }); fs.writeFileSync(path.join(tmp, 'src', group, code + '.txt'), text); };
const icon = (size, colors, grid, extra = '') => `name: Thử\nsize: ${size}\ncolors:\n${colors}\npart o\n${grid}\nend\n${extra}anim main fps=1\nframe main\n  use o\nend\n`;
const g16 = (ch) => Array.from({ length: 16 }, () => ch.repeat(16)).join('\n');
const check = (only) => spawnSync(process.execPath, [BUILD, '--check', '--src', path.join(tmp, 'src'), only], { encoding: 'utf8' });
mk('icon', 'mau-la', icon('16x16', '  a = tim-hong-la', g16('a')));
let r = check('mau-la');
ok(r.status === 1 && /không có trong bảng màu/.test(r.stderr), 'màu ngoài bảng màu → lỗi');
mk('icon', 'ky-tu-la', icon('16x16', '  a = la', g16('a').replace('aaaa', 'aaZa')));
r = check('ky-tu-la');
ok(r.status === 1 && /ký tự 'Z'.*chưa khai báo/.test(r.stderr), 'ký tự chưa khai báo màu → lỗi');
mk('icon', 'sai-co', icon('20x20', '  a = la', Array.from({ length: 20 }, () => 'a'.repeat(20)).join('\n')));
r = check('sai-co');
ok(r.status === 1 && /kích thước 20x20 sai/.test(r.stderr), 'sai kích thước theo nhóm → lỗi');
mk('tuong', 'thieu', icon('32x32', '  a = la', Array.from({ length: 32 }, () => 'a'.repeat(32)).join('\n')).replace(/anim main[\s\S]*/, 'anim idle fps=2\nframe idle\n  use o\nend\nframe idle\n  use o\nend\n'));
r = check('thieu');
ok(r.status === 1 && /động tác "attack" cần 3–4 khung/.test(r.stderr), 'tướng thiếu động tác bắt buộc → lỗi');
mk('icon', 'tran', icon('16x16', '  a = la', 'aaaa\naaaa').replace('  use o', '  use o 14 0'));
r = check('tran');
ok(r.status === 1 && /tràn ra ngoài khung/.test(r.stderr), 'đóng dấu tràn khung → lỗi');
// rot với khung không vuông (lỗi báo từ vfx-kenney: trước đây TypeError) — 180 chạy được, 90 / 45 báo lỗi rõ
const rect = (cmd) => `name: Thử\nsize: 160x90\ncolors:\n  a = la\n  b = son\npart o\nab\nend\nanim main fps=1\nframe main\n  use o 3 2\n  ${cmd}\nend\n`;
fs.mkdirSync(path.join(tmp, 'src-rot', 'canh'), { recursive: true });
fs.writeFileSync(path.join(tmp, 'src-rot', 'canh', 'rot-180.txt'), rect('rot 180'));
r = spawnSync(process.execPath, [BUILD, '--src', path.join(tmp, 'src-rot'), '--out', path.join(tmp, 'rot-out'), '--quiet'], { encoding: 'utf8' });
ok(r.status === 0 && !/TypeError/.test(r.stderr), 'rot 180 với khung không vuông (160x90) chạy được');
const rb = fs.readFileSync(path.join(tmp, 'rot-out', 'assets/pixel/canh/rot-180.png'));
const px = require('zlib').inflateSync(rb.subarray(rb.indexOf('IDAT') + 4, rb.indexOf('IEND') - 8));
const at = (x, y) => px.subarray(y * (160 * 4 + 1) + 1 + x * 4, y * (160 * 4 + 1) + 1 + x * 4 + 4);
ok(at(156, 87)[0] === 0x35 && at(155, 87)[0] === 0x92, 'rot 180: pixel (3,2)→(156,87), (4,2)→(155,87)');
mk('canh', 'rot-90', rect('rot 90'));
r = check('rot-90');
ok(r.status === 1 && /không vuông/.test(r.stderr) && !/TypeError/.test(r.stderr), 'rot 90 khung không vuông → lỗi rõ, không crash');
mk('canh', 'rot-45', rect('rot 45'));
r = check('rot-45');
ok(r.status === 1 && /bội của 90/.test(r.stderr), 'rot 45 → lỗi rõ');
fs.rmSync(path.join(tmp, 'src'), { recursive: true });
// dựng nguồn thật ra thư mục tạm (không ghi vào assets/, js/ thật)
const out = path.join(tmp, 'out');
r = spawnSync(process.execPath, [BUILD, '--out', out, '--quiet'], { encoding: 'utf8' });
ok(r.status === 0, 'dựng ra thư mục tạm');
const pngWH = (f) => { const b = fs.readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
const gj = JSON.parse(fs.readFileSync(path.join(out, 'assets/pixel/tuong/giong.json'), 'utf8'));
ok(gj.w === 32 && gj.h === 32 && ['idle', 'attack', 'cast', 'hurt', 'die'].every((a) => gj.anims[a] && gj.anims[a].n >= 1), `giong.json: 32×32, đủ 5 động tác (${Object.keys(gj.anims)})`);
ok(String(pngWH(path.join(out, 'assets/pixel/tuong/giong.png'))) === String([32 * gj.n, 32]), `giong.png là dải ${gj.n} khung 32×32`);
ok(fs.existsSync(path.join(out, 'assets/pixel/tuong/chodo-chan-dung.png')), 'có chân dung chodo-chan-dung.png');
ok(String(pngWH(path.join(out, 'assets/pixel/nen/co.png'))) === '16,16' && String(pngWH(path.join(out, 'assets/pixel/icon/hanh-kim.png'))) === '16,16', 'ô nền / icon 16×16');
for (const g of Object.keys(bp.GROUP_SIZES)) ok(fs.existsSync(path.join(out, 'js/pixel', g + '.js')), `manifest nhóm js/pixel/${g}.js`);
// bản trong repo khớp nguồn (quên chạy build trước khi commit → lỗi)
for (const g of Object.keys(bp.GROUP_SIZES)) {
  ok(fs.readFileSync(path.join(out, 'js/pixel', g + '.js'), 'utf8') === fs.readFileSync(path.join(ROOT, 'js/pixel', g + '.js'), 'utf8'), `js/pixel/${g}.js khớp nguồn (đã chạy build-pixel)`);
}
for (const f of ['tuong/giong.png', 'tuong/tanvien.png', 'tuong/chodo.png', 'quai/tom.png', 'nen/nuoc.png']) {
  ok(fs.readFileSync(path.join(out, 'assets/pixel', f)).equals(fs.readFileSync(path.join(ROOT, 'assets/pixel', f))), `assets/pixel/${f} khớp nguồn`);
}
const list = fs.readFileSync(path.join(ROOT, 'js/asset-list.js'), 'utf8');
ok(['pixel/tuong/giong.png', 'pixel/tuong/giong-chan-dung.png', 'pixel/nen/co.png', 'pixel/icon/hanh-moc.png'].every((f) => list.includes(`"${f}"`)), 'js/asset-list.js có ảnh pixel');
fs.rmSync(tmp, { recursive: true });

// ---------------------------------------------------------------- 2–3. game
let chromium;
try { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); } catch (e) { console.log('SKIP: không có playwright'); process.exit(0); }

async function open(w, h, query) {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|ERR_|net::|Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.route('**/firebase-config.js*', (rr) => rr.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
  await page.addInitScript(() => { localStorage.setItem('nuicao.v1', JSON.stringify({ unlocked: 17, storySeen: true, settings: { skipStory: true } })); });
  await page.goto('file://' + path.join(ROOT, 'index.html') + query);
  await page.waitForTimeout(800);
  if (query && !open.menuShot) open.menuShot = {};
  if (query && !open.menuShot[w]) {   // màn menu khi bật pixel: logo + nút giữ font cũ (góp ý tester)
    open.menuShot[w] = 1;
    await page.screenshot({ path: path.join(SHOT, `pixel-menu-${w}x${h}.png`) });
    const f = await page.evaluate(() => ({ logo: getComputedStyle(document.querySelector('#menu-logo')).fontFamily,
      btn: [...document.querySelectorAll('#menu button')].map((b) => getComputedStyle(b).fontFamily).join('|') }));
    ok(!/Handjet|VT323/.test(f.logo) && !/Handjet|VT323/.test(f.btn), `[${w}x${h}] menu: logo + nút giữ font cũ khi bật pixel`);
  }
  await page.evaluate(() => ui.playLevel(0, false));
  await page.waitForSelector('#prep:not([hidden])');
  await page.click('[data-act=prep-go]');
  await page.waitForTimeout(400);
  return { browser, page, errors };
}
const TYPES = ['giong', 'tanvien', 'chodo', 'lactuong'];
async function setup(page) {
  return page.evaluate((types) => {
    game.gold += 99999;
    const free = game.freeSlots();
    types.forEach((t, i) => game.spawnHero(free[i], t));
    for (let i = 0; i < 4; i++) { game.spawn('tom', 120 + i * 70); }
    game.spawn('casau', 420);
    // một tướng đang đánh để thấy khung ra đòn
    const g = game.heroes.find((h) => h && h.type === 'tanvien'); if (g) g.swing = 0.5;
    return game.heroes.filter(Boolean).map((h) => ({ type: h.type, x: h.x, y: h.y }));
  }, TYPES);
}

(async () => {
  // không bật: không dùng pixel
  {
    const { browser, page, errors } = await open(844, 390, '');
    await setup(page);
    await page.waitForTimeout(600);
    const s = await page.evaluate(() => ({ on: pixelOn(), seen: [...PX.seen], cls: document.documentElement.className, url: heroImgUrl('giong', 'head') }));
    ok(!s.on && !s.seen.length && !/pixel/.test(s.cls) && !/pixel\//.test(s.url), 'không có ?pixel=1: tắt, không vẽ pixel');
    ok(!errors.length, 'không lỗi console (tắt pixel) ' + errors.join(' | '));
    await browser.close();
  }
  for (const [w, h, tag] of [[1920, 934, '1920x934'], [844, 390, '844x390'], [667, 375, '667x375'], [390, 844, 'doc-390x844']]) {
    console.log(`— ?pixel=1 ${tag}`);
    const { browser, page, errors } = await open(w, h, '?pixel=1');
    const heroes = await setup(page);
    await page.waitForTimeout(900);
    await page.evaluate(() => { game.paused = true; });
    await page.waitForTimeout(200);
    const s = await page.evaluate(() => ({ on: pixelOn(), seen: [...PX.seen], cls: document.documentElement.className,
      head: heroImgUrl('giong', 'head'), headOld: heroImgUrl('lactuong', 'head'), kim: elIcon('kim'), hoa: elIcon('hoa'),
      sm: pxSmoothOff() }));
    ok(s.on && /pixel/.test(s.cls), `[${tag}] bật pixel bằng ?pixel=1`);
    for (const k of ['tuong/giong', 'tuong/tanvien', 'tuong/chodo', 'quai/tom', 'nen/co', 'nen/nuoc']) ok(s.seen.includes(k), `[${tag}] vẽ pixel: ${k}`);
    ok(!s.seen.includes('tuong/lactuong') && !s.seen.includes('quai/casau'), `[${tag}] mã chưa có pixel (lactuong, casau) giữ hình cũ`);
    ok(/pixel\/tuong\/giong-chan-dung\.png/.test(s.head) && !/pixel\//.test(s.headOld), `[${tag}] chân dung giao diện: giong pixel, lactuong hình cũ`);
    ok(/pixel\/icon\/hanh-kim\.png/.test(s.kim) && !/pixel\//.test(s.hoa), `[${tag}] icon ngũ hành: Kim pixel, Hỏa (chưa vẽ) hình cũ`);
    ok(s.sm, `[${tag}] ảnh pixel vẽ không làm mịn (nearest-neighbor)`);
    ok(!errors.length, `[${tag}] không lỗi console ${errors.join(' | ')}`);
    const wf = await page.evaluate(() => getComputedStyle(document.querySelector('#tb-wave')).fontFamily);
    ok(!/VT323/.test(wf), `[${tag}] "Đợt N · …" không dùng font số đều VT323 (${wf})`);
    await page.screenshot({ path: path.join(SHOT, `pixel-${tag}.png`) });
    // phóng to vùng tướng đầu tiên + quái
    const pts = await page.evaluate((hs) => hs.map((p) => ({ x: p.x * view.scale + view.ox, y: p.y * view.scale + view.oy })), heroes);
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    const cx = Math.max(0, Math.min(w - 10, Math.min(...xs) - 60)), cy = Math.max(0, Math.min(...ys) - 110);
    await page.screenshot({ path: path.join(SHOT, `pixel-${tag}-zoom.png`), clip: { x: cx, y: cy, width: Math.min(w - cx, Math.max(...xs) - Math.min(...xs) + 140), height: Math.min(h - cy, Math.max(...ys) - Math.min(...ys) + 140) } });
    // giao diện: thẻ chợ tướng + Anh Hùng dùng ảnh pixel
    await page.evaluate(() => { const m = game.ensureMarket(); m.types[0] = 'chodo'; m.types[1] = 'thoren'; game.paused = false; });
    await page.waitForTimeout(500);
    const card = await page.evaluate(() => { const i = document.querySelector('#deck img[src*="pixel/tuong/chodo"]'); return i ? { ok: i.complete && i.naturalWidth === 32 || i.naturalWidth > 0, r: i.getBoundingClientRect().toJSON() } : null; });
    ok(card && card.ok, `[${tag}] thẻ chợ: Chèo Đò dùng chân dung pixel`);
    const dk = await page.evaluate(() => document.querySelector('#deck').getBoundingClientRect().toJSON());
    await page.screenshot({ path: path.join(SHOT, `pixel-${tag}-cho.png`), clip: { x: Math.max(0, dk.x), y: Math.max(0, dk.y), width: Math.min(w, dk.width), height: Math.min(h - Math.max(0, dk.y), dk.height) } });
    await page.evaluate(() => ui.showRoster('giong', true));
    await page.waitForTimeout(500);
    const ro = await page.evaluate(() => ({ cv: !!document.querySelector('#roster #ro-cv'), seen: PX.seen.size }));
    ok(ro.cv, `[${tag}] Anh Hùng: Thánh Gióng vẽ cả người pixel lên canvas`);
    await page.screenshot({ path: path.join(SHOT, `pixel-${tag}-anh-hung.png`) });
    await browser.close();
  }
  console.log('pixel: ĐẠT');
})().catch((e) => { console.error(e); process.exit(1); });
