// Test tool vẽ pixel tools/ve-pixel.html (claude/tool-pixel). Chạy: node tests/ve-pixel/ve-pixel.test.js
// 1. tools/build-ve-pixel.js: danh sách mã (DANH-SACH.md + mã đã có) + bảng màu; tools/ve-pixel-ds.js trong repo khớp nguồn
// 2. tool (file://, Chromium): thêm nhiều mã một lần → sprite đạt quy chuẩn (cỡ, động tác, số khung); đọc mô tả đúng từ
//    (không khớp "rắn" trong "trắng"); vẽ tay bằng chuột + hoàn tác; bản nháp lưu / mở lại; xuất goi-pixel.zip đúng cấu trúc
// 3. nguồn .txt trong zip qua được tools/build-pixel.js --check --strict và dựng ra ĐÚNG TỪNG ĐIỂM ẢNH như PNG của tool
// 4. mở lại zip trong tool (nạp lại để vẽ tiếp) giữ nguyên khung; chụp 1920×934 · 844×390 → tests/ve-pixel/shots/
const path = require('path');
const fs = require('fs');
const os = require('os');
const zlib = require('zlib');
const { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '../..');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const ok = (c, m) => { if (!c) throw new Error('FAIL: ' + m); console.log('  ✓ ' + m); };
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 've-pixel-'));

// zip không nén / deflate → Map tên → Buffer
function unzip(buf) {
  const out = new Map();
  let e = buf.length - 22; while (buf.readUInt32LE(e) !== 0x06054b50) e--;
  let p = buf.readUInt32LE(e + 16);
  for (let i = 0; i < buf.readUInt16LE(e + 10); i++) {
    const meth = buf.readUInt16LE(p + 10), csz = buf.readUInt32LE(p + 20), nl = buf.readUInt16LE(p + 28), xl = buf.readUInt16LE(p + 30), cl = buf.readUInt16LE(p + 32), lo = buf.readUInt32LE(p + 42);
    const name = buf.subarray(p + 46, p + 46 + nl).toString('utf8'); p += 46 + nl + xl + cl;
    const ds = lo + 30 + buf.readUInt16LE(lo + 26) + buf.readUInt16LE(lo + 28), d = buf.subarray(ds, ds + csz);
    out.set(name, meth === 8 ? zlib.inflateRawSync(d) : d);
  }
  return out;
}
// PNG RGBA 8-bit (lọc 0 hoặc bất kỳ) → { w, h, px }
function decodePNG(b) {
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20), ct = b[25];
  let p = 8; const idat = [];
  while (p < b.length) { const n = b.readUInt32BE(p), t = b.toString('ascii', p + 4, p + 8); if (t === 'IDAT') idat.push(b.subarray(p + 8, p + 8 + n)); p += 12 + n; }
  const raw = zlib.inflateSync(Buffer.concat(idat)), bpp = ct === 6 ? 4 : 3, st = w * bpp, px = Buffer.alloc(w * h * 4);
  let prev = Buffer.alloc(st);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (st + 1)], row = Buffer.from(raw.subarray(y * (st + 1) + 1, (y + 1) * (st + 1)));
    for (let i = 0; i < st; i++) {
      const a = i >= bpp ? row[i - bpp] : 0, u = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      const pa = Math.abs(u - c), pb = Math.abs(a - c), pc = Math.abs(a + u - 2 * c);
      row[i] = (row[i] + [0, a, u, (a + u) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? u : c][f]) & 255;
    }
    for (let x = 0; x < w; x++) for (let k = 0; k < 4; k++) px[(y * w + x) * 4 + k] = k < bpp ? row[x * bpp + k] : 255;
    prev = row;
  }
  return { w, h, px };
}

// ---------------------------------------------------------------- 1. danh sách mã
console.log('— build-ve-pixel');
let r = spawnSync(process.execPath, [path.join(ROOT, 'tools/build-ve-pixel.js'), '--out', path.join(TMP, 'ds.js')], { encoding: 'utf8' });
ok(r.status === 0, 'build-ve-pixel chạy được ' + r.stderr);
ok(fs.readFileSync(path.join(TMP, 'ds.js'), 'utf8') === fs.readFileSync(path.join(ROOT, 'tools/ve-pixel-ds.js'), 'utf8'), 'tools/ve-pixel-ds.js khớp DANH-SACH.md + palette (đã chạy node tools/build-ve-pixel.js)');
const DS = (() => { const w = {}; new Function('window', fs.readFileSync(path.join(TMP, 'ds.js'), 'utf8'))(w); return w.VE_PIXEL_DS; })();
ok(DS.palette.length === 46 && DS.palette[0][0] === 'vien', 'bảng màu 46 màu, đủ màu viền');
const groups = new Set(DS.ma.map((d) => d.k.split('/')[0]));
ok(DS.ma.length > 700 && ['tuong', 'quai', 'boss', 'nen', 'icon', 'ky-nang', 'do', 'an-phu', 'than-khi'].every((g) => groups.has(g)) && !groups.has('vfx'), `${DS.ma.length} mã, đủ nhóm (không gồm vfx)`);
ok(DS.ma.some((d) => d.k === 'tuong/giong' && d.daCo) && DS.ma.filter((d) => d.k.startsWith('tuong/')).every((d) => !!d.daCo === fs.readFileSync(path.join(ROOT, 'js/pixel/tuong.js'), 'utf8').includes(`"${d.k}"`)), 'đánh dấu đúng mã tướng đã có / chưa có pixel');

// ---------------------------------------------------------------- 2. tool
let chromium;
try { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); } catch (e) { console.log('SKIP: không có playwright'); process.exit(0); }
const URL_TOOL = 'file://' + path.join(ROOT, 'tools/ve-pixel.html');
const CODES = ['tuong/lactuong', 'tuong/thaymo', 'tuong/kylan', 'tuong/rongme', 'quai/tom', 'quai/doi', 'boss/thuongluong', 'icon/hanh-hoa', 'ky-nang/lactuong_q', 'do/do_vu-khi_thuong', 'an-phu/g_air', 'nen/co-dam', 'nen/nuoc-bien'];

(async () => {
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 934 }, acceptDownloads: true });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e.stack || e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.goto(URL_TOOL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    console.log('— tool');
    const codes = await page.evaluate((cs) => cs.filter((k) => window.__vePixel.DS.ma.some((d) => d.k === k)), CODES);
    ok(codes.length >= 10, `mã thử có trong danh sách (${codes.length}/${CODES.length})`);
    // chọn nhiều mã bằng giao diện: lọc nhóm tướng, tích 3 mã, bấm Thêm
    await page.selectOption('#nhom', 'tuong');
    await page.fill('#tim', 'lactuong');
    await page.check('#ds input[data-k="tuong/lactuong"]');
    await page.fill('#tim', 'thaymo');
    await page.check('#ds input[data-k="tuong/thaymo"]');
    await page.fill('#tim', '');
    await page.click('#b-them');
    let n = await page.evaluate(() => window.__vePixel.ITEMS.length);
    ok(n === 2, 'chọn nhiều mã trên danh sách → thêm 2 mã một lần');
    n = await page.evaluate((cs) => window.__vePixel.themMa(cs), codes);
    const info = await page.evaluate(() => window.__vePixel.ITEMS.map((it) => ({ k: it.k, w: it.w, h: it.h, opt: it.opt, E: window.__vePixel.kiemTra(it).E, W: window.__vePixel.kiemTra(it).W, anims: Object.fromEntries(it.anims.map((a) => [a.name, a.frames.length])) })));
    ok(info.length === codes.length, `thêm cả lô ${codes.length} mã (không trùng)`);
    for (const it of info) ok(!it.E.length && !it.W.length, `${it.k} ${it.w}×${it.h} đạt quy chuẩn: ${JSON.stringify(it.anims)}${it.E.concat(it.W).join('; ')}`);
    const by = Object.fromEntries(info.map((i) => [i.k, i]));
    ok(['idle', 'attack', 'cast', 'hurt', 'die'].every((a) => by['tuong/lactuong'].anims[a]), 'tướng: idle · attack · cast · hurt · die');
    ok(['walk', 'attack', 'hurt', 'die'].every((a) => by['quai/tom'].anims[a]) && by['boss/thuongluong'].w >= 48 && by['boss/thuongluong'].anims.rage, 'quái: walk · attack · hurt · die; boss ≥48 px có rage');
    ok(by['tuong/lactuong'].opt.mau === 'tuong/lactuong' && by['quai/tom'].opt.mau === 'quai/tom', 'mã đã có bản vẽ tay (thư viện) → mặc định dựng từ bản vẽ tay');
    const hm0 = await page.evaluate(() => { const V = window.__vePixel, d = (k) => V.DS.ma.find((x) => x.k === k); const o = (k) => V.K.hieuMoTa(`${d(k).mo} · hành ${d(k).hanh}`, k.split('/')[0], { ...V.K.defOpts(k.split('/')[0]), __ten: d(k).ten }).o;
      return { lt: o('tuong/lactuong'), tl: o('boss/thuongluong'), kl: o('tuong/kylan'), ic: V.K.hieuMoTa('hành Hỏa', 'icon', V.K.defOpts('icon')).o, kn: V.K.hieuMoTa('Lạc Tướng · Q «Bổ Rìu Đồng» · a bronze axe chopping', 'ky-nang', V.K.defOpts('ky-nang')).o }; });
    ok(hm0.lt.mu === 'long' && hm0.lt.vk === 'riu' && hm0.lt.dang === 'nguoi' && hm0.lt.hanh === 'kim', 'mô tả Lạc Tướng: mũ lông chim + rìu + hành Kim, dáng người ("trắng" không bị đọc thành "rắn")');
    ok(hm0.tl.dang === 'ran' && hm0.kl.dang === 'thu', 'Thuồng Luồng → dáng rắn; Kỳ Lân → dáng thú');
    ok(hm0.ic.hinh === 'lua' && hm0.kn.hinh === 'riu', 'icon Hỏa → lửa; kỹ năng Bổ Rìu → rìu');
    const hm = await page.evaluate(() => window.__vePixel.hieuMoTa('khăn vàng, giáp sắt, áo choàng đỏ, gậy sắt, hành Hỏa', 'tuong', {}).o);
    ok(hm.mu === 'khan' && hm.mauMu === 'vang' && hm.ao === 'giap' && hm.mauAo === 'sat' && hm.choang === 'son' && hm.vk === 'gay' && hm.mauVk === 'sat' && hm.hanh === 'hoa', 'mô tả "khăn vàng, giáp sắt, áo choàng đỏ, gậy sắt, hành Hỏa" → đúng bộ phận + màu');

    // vẽ tay: chọn mã đầu, bút màu trắng, kéo trên lưới; hoàn tác
    await page.evaluate(() => window.__vePixel.select(0));
    await page.waitForTimeout(100);
    const before = await page.evaluate(() => [...window.__vePixel.ITEMS[0].anims[0].frames[0].d].join(','));
    await page.click('#pal button[title="sang"]');
    const box = await page.locator('#cv').boundingBox();
    const cellPx = box.width / 32;
    await page.mouse.move(box.x + cellPx * 2.5, box.y + cellPx * 2.5);
    await page.mouse.down();
    await page.mouse.move(box.x + cellPx * 6.5, box.y + cellPx * 2.5, { steps: 4 });
    await page.mouse.up();
    const drawn = await page.evaluate(() => { const f = window.__vePixel.ITEMS[0].anims[0].frames[0]; return [2, 3, 4, 5, 6].map((x) => window.__vePixel.PAL[f.get(x, 2) - 1]?.name); });
    ok(drawn.every((c) => c === 'sang'), 'kéo bút trên lưới tô 5 điểm liền (2..6, 2) màu "sang"');
    await page.click('#b-undo');
    ok(await page.evaluate(() => [...window.__vePixel.ITEMS[0].anims[0].frames[0].d].join(',')) === before, 'hoàn tác (↶) trả lại khung cũ');
    await page.click('#cv', { position: { x: cellPx * 2.5, y: cellPx * 2.5 }, button: 'right' });
    await page.click('[data-t="xo"]');
    await page.click('#b-them-k');
    const nf = await page.evaluate(() => window.__vePixel.ITEMS[0].anims[0].frames.length);
    ok(nf === 4, 'thêm khung idle (3 → 4)');
    await page.click('#b-xoa-k');

    // bản nháp: tự lưu localStorage → tải lại trang vẫn còn
    await page.waitForTimeout(700);
    await page.reload();
    const sau = await page.evaluate(() => window.__vePixel.ITEMS.length);
    ok(sau === codes.length, `tải lại trang: bản nháp tự lưu còn đủ ${sau} mã`);
    // lưu nháp ra file → mở lại
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#b-luu')]);
    const nhap = path.join(TMP, 've-pixel-nhap.json');
    await dl.saveAs(nhap);
    ok(JSON.parse(fs.readFileSync(nhap, 'utf8')).items.length === codes.length, 'nút Lưu nháp tải ve-pixel-nhap.json');
    await page.evaluate(() => { window.__vePixel.ITEMS.length = 0; window.__vePixel.renderAll(); });
    await page.setInputFiles('#f-mo', nhap);
    await page.waitForTimeout(300);
    ok(await page.evaluate(() => window.__vePixel.ITEMS.length) === codes.length, 'Mở nháp (.json) nạp lại đủ mã');

    // chụp tool (đang vẽ tướng)
    await page.evaluate(() => window.__vePixel.select(0));
    await page.click('#b-pv-all');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SHOT, 'tool-1920x934.png') });
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SHOT, 'tool-844x390.png') });
    await page.screenshot({ path: path.join(SHOT, 'tool-844x390-ca-trang.png'), fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(overflow <= 1, `844×390: không tràn ngang (${overflow}px)`);
    await page.setViewportSize({ width: 1920, height: 934 });

    // ---------------------------------------------------------------- 3. xuất zip
    console.log('— xuất goi-pixel.zip');
    const [dz] = await Promise.all([page.waitForEvent('download'), page.click('#b-zip')]);
    ok(dz.suggestedFilename() === 'goi-pixel.zip', 'nút Xuất tải goi-pixel.zip');
    const zipFile = path.join(TMP, 'goi-pixel.zip');
    await dz.saveAs(zipFile);
    const files = unzip(fs.readFileSync(zipFile));
    const head = JSON.parse(files.get('goi-pixel.json'));
    ok(head.loai === 'goi-pixel-ttv' && head.phienBan === 1 && head.ma.length === codes.length, `goi-pixel.json: loại, phiên bản, ${head.ma.length} mã`);
    for (const k of codes) {
      const [g, c] = k.split('/'), j = JSON.parse(files.get(`assets/pixel/${g}/${c}.json`)), png = files.get(`assets/pixel/${g}/${c}.png`);
      if (!png || png.readUInt32BE(16) !== j.w * j.n || png.readUInt32BE(20) !== j.h || j.code !== c || j.group !== g) throw new Error('FAIL: ' + k + ' PNG/JSON sai');
      if (['tuong', 'quai', 'boss'].includes(g) && (!j.cd || !files.get(`assets/pixel/${g}/${c}-chan-dung.png`))) throw new Error('FAIL: ' + k + ' thiếu chân dung');
      if (!files.get(`tools/pixel/src/${g}/${c}.txt`)) throw new Error('FAIL: ' + k + ' thiếu nguồn .txt');
    }
    ok(true, 'mỗi mã: assets/pixel/<nhóm>/<mã>.png (dải n khung) + .json (code, group, w, h, anims) + chân dung (tướng/quái/boss) + tools/pixel/src/<nhóm>/<mã>.txt');

    // nguồn .txt → build-pixel --strict → PNG trùng từng điểm ảnh với PNG của tool
    const SRC = path.join(TMP, 'x');
    for (const [name, d] of files) { fs.mkdirSync(path.dirname(path.join(SRC, name)), { recursive: true }); fs.writeFileSync(path.join(SRC, name), d); }
    r = spawnSync(process.execPath, [path.join(ROOT, 'tools/build-pixel.js'), '--strict', '--src', path.join(SRC, 'tools/pixel/src'), '--out', path.join(TMP, 'out'), '--quiet'], { encoding: 'utf8' });
    ok(r.status === 0, 'nguồn .txt trong zip qua build-pixel --strict' + (r.status ? '\n' + r.stdout + r.stderr : ''));
    let same = 0;
    for (const k of codes) {
      for (const suf of ['.png', ...(['tuong', 'quai', 'boss'].includes(k.split('/')[0]) ? ['-chan-dung.png'] : [])]) {
        const a = decodePNG(files.get(`assets/pixel/${k}${suf}`)), b = decodePNG(fs.readFileSync(path.join(TMP, 'out/assets/pixel', k + suf)));
        if (a.w !== b.w || a.h !== b.h || !a.px.equals(b.px)) throw new Error(`FAIL: ${k}${suf} khác bản build-pixel dựng`);
        same++;
      }
      const ja = JSON.parse(files.get(`assets/pixel/${k}.json`)), jb = JSON.parse(fs.readFileSync(path.join(TMP, 'out/assets/pixel', k + '.json'), 'utf8'));
      if (JSON.stringify({ ...ja, name: 0 }) !== JSON.stringify({ ...jb, name: 0 })) throw new Error(`FAIL: ${k}.json khác build-pixel: ${JSON.stringify(ja)} / ${JSON.stringify(jb)}`);
    }
    ok(same > codes.length, `${same} ảnh + JSON của tool trùng từng điểm ảnh với bản build-pixel dựng từ nguồn`);

    // mở lại zip trong tool → khung giữ nguyên
    const snap = await page.evaluate(() => Object.fromEntries(window.__vePixel.ITEMS.map((it) => [it.k, it.anims.map((a) => a.name + ':' + a.frames.map((f) => [...f.d].join('')).join('|')).join('/')])));
    await page.evaluate(() => { window.__vePixel.ITEMS.length = 0; window.__vePixel.renderAll(); });
    await page.setInputFiles('#f-mo', zipFile);
    await page.waitForTimeout(500);
    const back = await page.evaluate(() => Object.fromEntries(window.__vePixel.ITEMS.map((it) => [it.k, it.anims.map((a) => a.name + ':' + a.frames.map((f) => [...f.d].join('')).join('|')).join('/')])));
    ok(Object.keys(back).length === codes.length && codes.every((k) => back[k] === snap[k]), 'Mở zip đã xuất: đủ mã, mọi khung trùng khít (vẽ tiếp được)');
    // mã lỗi (thiếu khung bắt buộc) không vào zip
    const bad = await page.evaluate(async () => { const it = window.__vePixel.ITEMS.find((t) => t.g === 'tuong'); it.anims = it.anims.filter((a) => a.name !== 'attack'); const z = await window.__vePixel.goiZip(); return { e: z.errors, n: z.n }; });
    ok(bad.e.length === 1 && /attack/.test(bad.e[0]) && bad.n === codes.length - 1, 'mã thiếu động tác bắt buộc bị chặn khỏi zip, báo lỗi rõ');
    // mẫu vẽ tay trong giao diện: thay bộ phận + đổi màu
    await page.evaluate(() => { const V = window.__vePixel; V.ITEMS.length = 0; V.themMa(['tuong/giong']); V.select(0); });
    ok(await page.evaluate(() => getComputedStyle(document.getElementById('opts')).display === 'none' && document.getElementById('mau-tv').value === 'tuong/giong'), 'mã có bản vẽ tay: chọn sẵn "Mẫu vẽ tay", ẩn ô bộ phận sinh tự động');
    await page.selectOption('#thay-p', 'gay'); await page.selectOption('#thay-r', 'tuong/tanvien:gay'); await page.click('#b-thay');
    await page.selectOption('#dm-a', 'son'); await page.selectOption('#dm-b', 'cham'); await page.click('#b-dm');
    const mo = await page.evaluate(() => window.__vePixel.ITEMS[0].opt);
    ok(mo.thay.gay === 'tuong/tanvien:gay' && mo.doiMau.son === 'cham', 'giao diện: thay gậy bằng gậy Sơn Tinh + đổi son → chàm');
    await page.setViewportSize({ width: 844, height: 390 }); await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(SHOT, 'tool-mau-ve-tay-844x390.png'), fullPage: true });
    await page.setViewportSize({ width: 1920, height: 934 }); await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(SHOT, 'tool-mau-ve-tay-1920x934.png') });
    ok(!errors.length, 'không lỗi console ' + errors.join(' | '));
    fs.writeFileSync(path.join(SHOT, 'goi-pixel.zip'), fs.readFileSync(zipFile));
  } finally { await browser.close(); fs.rmSync(TMP, { recursive: true, force: true }); }
  console.log('ve-pixel: ĐẠT');
})().catch((e) => { console.error(e); process.exit(1); });
