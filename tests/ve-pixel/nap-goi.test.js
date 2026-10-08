// Test NẠP GÓI PIXEL trong game (claude/tool-pixel, js/pixel-goi.js). Chạy: node tests/ve-pixel/nap-goi.test.js
// Gói tạo bằng chính tools/ve-pixel.html (headless) vào thư mục tạm — không ghi gì vào assets/ hay js/ thật.
// 1. Cài đặt (ngoài trận) có dòng "Gói pixel": nút Pixel bật/tắt (lưu trên máy), Nạp gói (.zip); không có trong bảng Tạm dừng
// 2. zip hỏng / không phải gói / ảnh sai cỡ → báo lỗi, không lưu; gói tốt → kiểm tra, lưu IndexedDB, dùng ngay khi bật pixel:
//    mã chưa có pixel (tướng + quái chọn tự động) vẽ bằng ảnh trong gói, mã có sẵn (giong) bị gói ghi đè; mã ngoài gói (chodo) vẫn như cũ
// 3. tải lại trang: gói vẫn còn (IndexedDB); Gỡ gói → về như cũ; pixel tắt → gói không dùng (hình cũ)
// 4. chụp Cài đặt 1920×934 · 844×390 → tests/ve-pixel/shots/
const path = require('path');
const fs = require('fs');
const os = require('os');
const ROOT = path.resolve(__dirname, '../..');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const ok = (c, m) => { if (!c) throw new Error('FAIL: ' + m); console.log('  ✓ ' + m); };
let chromium;
try { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); } catch (e) { console.log('SKIP: không có playwright'); process.exit(0); }
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'nap-goi-'));

// zip không nén từ [{name, data}]
function makeZip(entries) {
  const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const loc = [], cen = []; let off = 0;
  for (const e of entries) {
    const nm = Buffer.from(e.name), d = Buffer.from(e.data), c = crc(d);
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt32LE(c, 14); lh.writeUInt32LE(d.length, 18); lh.writeUInt32LE(d.length, 22); lh.writeUInt16LE(nm.length, 26);
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt32LE(c, 16); ch.writeUInt32LE(d.length, 20); ch.writeUInt32LE(d.length, 24); ch.writeUInt16LE(nm.length, 28); ch.writeUInt32LE(off, 42);
    loc.push(lh, nm, d); cen.push(ch, nm); off += 30 + nm.length + d.length;
  }
  const cs = Buffer.concat(cen), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(cs.length, 12); end.writeUInt32LE(off, 16);
  return Buffer.concat([...loc, cs, end]);
}
function unzip(buf) {
  const out = new Map(); let e = buf.length - 22; while (buf.readUInt32LE(e) !== 0x06054b50) e--;
  let p = buf.readUInt32LE(e + 16);
  for (let i = 0; i < buf.readUInt16LE(e + 10); i++) {
    const csz = buf.readUInt32LE(p + 20), nl = buf.readUInt16LE(p + 28), xl = buf.readUInt16LE(p + 30), cl = buf.readUInt16LE(p + 32), lo = buf.readUInt32LE(p + 42);
    const name = buf.subarray(p + 46, p + 46 + nl).toString(); p += 46 + nl + xl + cl;
    const ds = lo + 30 + buf.readUInt16LE(lo + 26) + buf.readUInt16LE(lo + 28); out.set(name, buf.subarray(ds, ds + csz));
  }
  return out;
}

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  try {
    // tướng + quái chưa có pixel: chọn tự động (không vỡ khi gộp thêm lô pixel)
    const pick = await (await browser.newContext()).newPage();
    await pick.route('**/firebase-config.js*', (rr) => rr.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
    await pick.goto('file://' + path.join(ROOT, 'index.html'));
    const [HERO, QUAI] = await pick.evaluate(() => [Object.keys(HEROES).find((k) => !window.PIXEL_MANIFEST['tuong/' + k]), Object.keys(ENEMIES).find((k) => !ENEMIES[k].boss && !window.PIXEL_MANIFEST['quai/' + k] && !window.PIXEL_MANIFEST['boss/' + k])]);
    await pick.close();
    ok(HERO && QUAI, `mã chưa có pixel để thử: tuong/${HERO}, quai/${QUAI}`);
    // ---- gói tạo bằng tool
    console.log('— tạo gói bằng tools/ve-pixel.html');
    const tp = await (await browser.newContext()).newPage();
    await tp.goto('file://' + path.join(ROOT, 'tools/ve-pixel.html'));
    const bytes = await tp.evaluate(async ([h, q]) => {
      const V = window.__vePixel; V.ITEMS.length = 0;
      V.themMa(['tuong/' + h, 'tuong/giong', 'quai/' + q]);
      const z = await V.goiZip(); return z.errors.length ? z.errors : [...z.data];
    }, [HERO, QUAI]);
    ok(typeof bytes[0] === 'number', 'tool xuất được gói 3 mã ' + (typeof bytes[0] === 'number' ? '' : bytes.join('; ')));
    const GOOD = path.join(TMP, 'goi-pixel.zip');
    fs.writeFileSync(GOOD, Buffer.from(bytes));
    const files = unzip(fs.readFileSync(GOOD));
    // gói bọc trong thư mục (nén lại bằng Windows "Send to → Compressed") cũng nhận
    const WRAP = path.join(TMP, 'goi-boc.zip');
    fs.writeFileSync(WRAP, makeZip([...files].map(([n, d]) => ({ name: 'goi-pixel/' + n, data: d }))));
    // gói lỗi
    const RAC = path.join(TMP, 'rac.zip'); fs.writeFileSync(RAC, Buffer.from('không phải zip'.repeat(5)));
    const KHONGGOI = path.join(TMP, 'khong-goi.zip'); fs.writeFileSync(KHONGGOI, makeZip([{ name: 'anh.png', data: files.get('assets/pixel/tuong/giong.png') }]));
    const SAICO = path.join(TMP, 'sai-co.zip');
    fs.writeFileSync(SAICO, makeZip([...files].map(([n, d]) => ({ name: n, data: n.endsWith(`/${HERO}.json`) ? Buffer.from(JSON.stringify({ ...JSON.parse(d), w: 16 })) : d }))));

    // ---- game
    const ctx = await browser.newContext({ viewport: { width: 844, height: 390 } });
    await ctx.route('**/firebase-config.js*', (rr) => rr.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
    await ctx.addInitScript(() => { if (!localStorage.getItem('nuicao.v1')) localStorage.setItem('nuicao.v1', JSON.stringify({ unlocked: 17, storySeen: true, settings: { skipStory: true } })); });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e.stack || e)));
    page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|ERR_|net::|Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
    const GAME = 'file://' + path.join(ROOT, 'index.html');
    await page.goto(GAME);
    await page.waitForTimeout(700);
    console.log('— Cài đặt');
    await page.evaluate(() => ui.showSettings(false));
    ok(await page.locator('#pxgoi-row').isVisible(), 'Cài đặt có dòng "Gói pixel"');
    ok(/tắt/.test(await page.textContent('#pxgoi-st')) && !(await page.locator('[data-act=pxg-go]').count()), 'chưa nạp gói: ghi "Pixel đang tắt · chưa nạp gói", chưa có nút Gỡ');
    await page.evaluate(() => document.querySelector('#pxgoi-row').scrollIntoView({ block: 'center' }));
    await page.screenshot({ path: path.join(SHOT, 'cai-dat-chua-goi-844x390.png') });
    const nap = async (file) => {
      const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-act=pxg-nap]')]);
      await fc.setFiles(file);
      await page.waitForFunction(() => document.querySelector('#toasts .toast:last-child'), null, { timeout: 5000 });
      await page.waitForTimeout(250);
      const t = await page.evaluate(() => { const el = document.querySelector('#toasts .toast:last-child'); const s = el ? el.textContent : ''; document.querySelectorAll('#toasts .toast').forEach((x) => x.remove()); return s; });
      return t;
    };
    for (const [f, why] of [[RAC, 'không phải file .zip'], [KHONGGOI, 'thiếu goi-pixel.json'], [SAICO, '']]) {
      const t = await nap(f);
      if (f === SAICO) ok(/bỏ 1 mã lỗi/.test(t), `zip có 1 mã sai cỡ ảnh → nạp phần đúng, báo bỏ 1 mã: "${t}"`);
      else ok(/không hợp lệ/.test(t) && t.includes(why), `${path.basename(f)} → báo "${t}"`);
    }
    const s1 = await page.evaluate(() => ({ goi: PXGOI.goi && PXGOI.goi.items.map((i) => i.key) }));
    ok(String(s1.goi.sort()) === String([`quai/${QUAI}`, 'tuong/giong'].sort()), `gói sai cỡ: chỉ nhận 2 mã đúng (${HERO} bị loại)`);
    await page.click('[data-act=pxg-go]');
    await page.waitForTimeout(300);
    ok(await page.evaluate((q) => !PXGOI.goi && !window.PIXEL_MANIFEST['quai/' + q], QUAI), 'Gỡ gói → bỏ mã của gói');
    // gói tốt khi pixel đang tắt: lưu nhưng game vẫn hình cũ
    let t = await nap(WRAP);
    ok(/Đã nạp 3 mã pixel/.test(t) && /bật Pixel/.test(t), `zip bọc thư mục: nạp 3 mã, nhắc bật Pixel ("${t}")`);
    const off = await page.evaluate((h) => ({ on: pixelOn(), e: pxEntry('tuong', h), m: !!window.PIXEL_MANIFEST['tuong/' + h] }), HERO);
    ok(!off.on && off.e === null && off.m, 'pixel tắt: gói đã ghép vào manifest nhưng pxEntry = null (vẽ hình cũ)');

    // bật pixel bằng nút → tải lại trang
    console.log('— bật pixel + dùng gói');
    await Promise.all([page.waitForEvent('load'), page.click('[data-act=pxg-bat]')]);
    await page.waitForTimeout(800);
    await page.evaluate(() => PXGOI.ready);
    const on = await page.evaluate((h) => ({ on: pixelOn(), ls: localStorage.getItem('ttv.pixel'), goi: PXGOI.goi && PXGOI.goi.items.length, gi: window.PIXEL_MANIFEST['tuong/giong'].goi, ts: !!pxEntry('tuong', h), url: window.ASSET_DATA['pixel/tuong/' + h + '.png'] }), HERO);
    ok(on.on && on.ls === '1', 'nút Pixel lưu bật trên máy (localStorage ttv.pixel) → tải lại trang thì pixel bật');
    ok(on.goi === 3 && on.ts && on.gi === 1 && /^blob:/.test(on.url), 'tải lại trang: gói còn trong IndexedDB, 3 mã ghép vào game (ảnh blob:), giong bị gói ghi đè');
    await page.evaluate(() => ui.showSettings(false));
    await page.waitForTimeout(200);
    ok(/Gói «goi-boc\.zip» · 3 mã/.test(await page.textContent('#pxgoi-st')) && (await page.textContent('[data-act=pxg-bat]')).includes('Bật'), 'Cài đặt: "Gói «goi-boc.zip» · 3 mã", nút "Pixel: Bật", có nút Gỡ gói');
    await page.evaluate(() => document.querySelector('#pxgoi-row').scrollIntoView({ block: 'center' }));
    await page.screenshot({ path: path.join(SHOT, 'cai-dat-co-goi-844x390.png') });
    await page.setViewportSize({ width: 1920, height: 934 });
    await page.waitForTimeout(200);
    await page.evaluate(() => document.querySelector('#pxgoi-row').scrollIntoView({ block: 'center' }));
    await page.screenshot({ path: path.join(SHOT, 'cai-dat-co-goi-1920x934.png') });
    const ov = await page.evaluate(() => { const r = document.querySelector('#pxgoi-row').getBoundingClientRect(); return [...document.querySelectorAll('#pxgoi-row button')].every((b) => { const q = b.getBoundingClientRect(); return q.right <= r.right + 1 && q.left >= r.left - 1; }); });
    ok(ov, 'nút trong dòng Gói pixel không lòi ra ngoài');
    await page.setViewportSize({ width: 844, height: 390 });
    await page.click('[data-act=set-close]');

    // vào trận: HERO (chỉ có trong gói) vẽ pixel, chodo (ngoài gói, có sẵn) vẫn pixel cũ, QUAI quái trong gói
    await page.evaluate(() => ui.playLevel(0, false));
    await page.waitForSelector('#prep:not([hidden])');
    await page.click('[data-act=prep-go]');
    await page.waitForTimeout(400);
    await page.evaluate(([h, q]) => { game.gold += 99999; const f = game.freeSlots(); [h, 'giong', 'chodo'].forEach((t, i) => game.spawnHero(f[i], t)); game.spawn(q, 200); game.spawn('tom', 300); }, [HERO, QUAI]);
    await page.waitForTimeout(1200);
    const seen = await page.evaluate(() => [...PX.seen]);
    ok([`tuong/${HERO}`, 'tuong/giong', 'tuong/chodo', `quai/${QUAI}`].every((k) => seen.includes(k)), `trong trận vẽ pixel: ${HERO} + ${QUAI} (từ gói), giong (gói ghi đè), chodo (sẵn có) — ${seen.join(', ')}`);
    const fr = await page.evaluate((h) => { const e = pxEntry('tuong', h); const c = pxFrame(e, 0); return c && [c.width, c.height]; }, HERO);
    ok(String(fr) === '32,32', 'khung sprite từ gói tải được (32×32)');
    // trong trận: bảng Tạm dừng không có dòng gói pixel
    await page.evaluate(() => ui.showSettings(true));
    ok(!(await page.locator('#pxgoi-row').count()), 'bảng Tạm dừng (trong trận) không có dòng Gói pixel (giữ gọn)');
    await page.evaluate(() => { game.paused = true; });
    await page.click('[data-act=set-close]');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SHOT, 'tran-co-goi-844x390.png') });

    // gỡ gói → về như cũ (giong bản sẵn có, tướng thử không còn pixel); tải lại vẫn không có gói
    console.log('— gỡ gói');
    await page.evaluate(() => ui.showSettings(false));
    await page.click('[data-act=pxg-go]');
    await page.waitForTimeout(300);
    const g = await page.evaluate((h) => ({ ts: pxEntry('tuong', h), gi: window.PIXEL_MANIFEST['tuong/giong'], url: window.ASSET_DATA && window.ASSET_DATA['pixel/tuong/giong.png'] }), HERO);
    ok(g.ts === null && g.gi && !g.gi.goi && !g.url, `Gỡ gói: ${HERO} hết pixel, giong trả về bản có sẵn trong game`);
    await page.reload();
    await page.waitForTimeout(600);
    ok(await page.evaluate(async (h) => { await PXGOI.ready; return !PXGOI.goi && !(window.PIXEL_MANIFEST['tuong/' + h]); }, HERO), 'tải lại sau khi gỡ: không còn gói');
    ok(!errors.length, 'không lỗi console ' + errors.join(' | '));
  } finally { await browser.close(); fs.rmSync(TMP, { recursive: true, force: true }); }
  console.log('nap-goi: ĐẠT');
})().catch((e) => { console.error(e); process.exit(1); });
