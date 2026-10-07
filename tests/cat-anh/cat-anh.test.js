// Test tool cắt ảnh trên máy người dùng: tools/cat_anh.py (Python) và tools/cat-anh.html (trình duyệt).
// Ảnh mẫu tự sinh (tests/cat-anh/tao-anh-mau.py): nền hồng tím, tên lệch, lưới lệch / sai cỡ, thiếu khung, khung trùng.
// 1) Bản Python cho ra ĐÚNG TỪNG ĐIỂM ẢNH như tools cũ (cat-sheet.py / cat-fx.py / cat-icons.py) chạy trên bản lưới chuẩn.
// 2) Bản HTML (Chromium) cho ra cùng bộ file, cùng cỡ, điểm ảnh gần như trùng bản Python (chỉ khác bảng 256 màu).
// Chạy: node tests/cat-anh/cat-anh.test.js
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cat-anh-'));
const VAO = path.join(TMP, 'ảnh game'), CHUAN = path.join(TMP, 'chuan'), REF = path.join(TMP, 'ref');
let fail = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
const py = (args, opt = {}) => execFileSync('python3', args, { cwd: ROOT, ...opt }).toString();

py([path.join(__dirname, 'tao-anh-mau.py'), VAO, CHUAN]);

// ── kết quả mẫu: tools cũ chạy trong bản sao (không đụng assets/ và js/render.js thật) ──
fs.mkdirSync(path.join(REF, 'tools'), { recursive: true }); fs.mkdirSync(path.join(REF, 'js'));
for (const f of ['cat-sheet.py', 'cat-fx.py', 'cat-icons.py']) fs.copyFileSync(path.join(ROOT, 'tools', f), path.join(REF, 'tools', f));
fs.writeFileSync(path.join(REF, 'js', 'render.js'), 'const PACK_FRAMES = {};\n');
const old = (tool, args) => py([path.join(REF, 'tools', tool), ...args], { cwd: CHUAN, env: { ...process.env, CAT_FX_OUT: path.join(REF, 'assets') } });
for (const [f, code, kind] of [['thaymo', 'thaymo', 'hero12'], ['dotnuong', 'dotnuong', 'hero12'], ['denroi', 'denroi', 'hero12'], ['tom', 'tom', 'enemy6'], ['trieuda', 'trieuda', 'boss9'], ['xathu', 'xathu', 'hero12']])
  old('cat-sheet.py', [f + '.png', code, kind]);
old('cat-fx.py', ['dai', 'trung-kim.png', 'trung-kim']);
old('cat-fx.py', ['dai', 'no-tho.png', 'no-tho']);
old('cat-fx.py', ['hat', 'dan-he.png', 'dan-kim', 'dan-moc', 'dan-thuy', 'dan-hoa', 'dan-tho', '--mau']);
old('cat-icons.py', ['icon-thaymo.png', 'thaymo']);
const walk = (d, pre = '') => fs.existsSync(d) ? fs.readdirSync(d).flatMap((f) => fs.statSync(path.join(d, f)).isDirectory() ? walk(path.join(d, f), pre + f + '/') : [pre + f]) : [];
const refFiles = walk(path.join(REF, 'assets')).sort();

// so từng cặp ảnh (một lần gọi Python): {same, size, alphaDiff (tỉ lệ điểm lệch trong/đục), meanDiff, maxDiff, mode}
const cmpAll = (pairs) => JSON.parse(py(['-c', `
import json, sys
import numpy as np
from PIL import Image
res = []
for pa, pb in json.load(sys.stdin):
    A = Image.open(pa); B = Image.open(pb)
    if A.size != B.size: res.append({'same': False, 'size': [A.size, B.size], 'mode': [A.mode, B.mode]}); continue
    a = np.asarray(A.convert('RGBA')).astype(int); b = np.asarray(B.convert('RGBA')).astype(int)
    a[a[..., 3] == 0] = 0; b[b[..., 3] == 0] = 0
    d = np.abs(a - b)
    res.append({'same': bool((d == 0).all()), 'size': [A.size, B.size], 'alphaDiff': float(((a[..., 3] > 127) != (b[..., 3] > 127)).mean()), 'meanDiff': float(d.mean()), 'maxDiff': int(d.max()), 'mode': [A.mode, B.mode]})
print(json.dumps(res))`], { input: JSON.stringify(pairs), maxBuffer: 1 << 26 }));

// ═══ 1. bản Python ═══
console.log('cat_anh.py (Python):');
const out = py(['tools/cat_anh.py', VAO]);
const RA = path.join(VAO, 'da-cat');
const pyFiles = walk(path.join(RA, 'assets')).sort();
ok(out.includes('không nhận ra') && /anh-la\.png/.test(fs.readFileSync(path.join(RA, 'bao-cao.html'), 'utf8')), 'ảnh tên lạ: báo "không nhận ra" trong bảng và bao-cao.html');
ok(!pyFiles.some((f) => f === 'thaymo.png'), 'bỏ qua thư mục da-cat/ cũ nằm trong thư mục ảnh');
ok(fs.existsSync(path.join(VAO, 'da-cat.zip')), 'có da-cat.zip để gửi');
ok(JSON.stringify(refFiles.filter((f) => !f.startsWith('.'))) === JSON.stringify(pyFiles), `cùng bộ file với tools cũ (${pyFiles.length} file: packs/<mã>/… · vfx/ · fx/ · .v2)`);
let exact = 0;
const refPng = refFiles.filter((f) => !f.endsWith('.v2'));
cmpAll(refPng.map((f) => [path.join(REF, 'assets', f), path.join(RA, 'assets', f)])).forEach((r, i) => {
  if (r.same) exact++; else ok(false, `${refPng[i]} khác tools cũ ${JSON.stringify(r)}`);
});
ok(exact === refFiles.filter((f) => !f.endsWith('.v2')).length, `${exact} ảnh trùng từng điểm với tools cũ (gồm tướng lệch lề 860×700 so với bản lưới chuẩn, tướng 1024×768)`);
const pf = JSON.parse(fs.readFileSync(path.join(RA, 'pack-frames.json'), 'utf8'));
const refPf = JSON.parse(fs.readFileSync(path.join(REF, 'js', 'render.js'), 'utf8').match(/PACK_FRAMES = (\{.*\});/)[1]);
ok(JSON.stringify(Object.keys(pf).sort().map((k) => [k, pf[k]])) === JSON.stringify(Object.keys(refPf).sort().map((k) => [k, refPf[k]])), 'pack-frames.json = PACK_FRAMES tools cũ ghi vào js/render.js');
ok(/denroi[^\n]*sai lưới[^\n]*đã dò lưới/.test(out), 'ảnh lệch lề / sai cỡ: báo "sai lưới → đã dò lưới"');
ok(/xathu[^\n]*thiếu khung attack_2/.test(out) && /xathu[^\n]*cast_1 và cast_2 giống hệt/.test(out), 'báo thiếu khung và 2 khung giống hệt');
ok(/Dotnuong \(1\)\.PNG → dotnuong/.test(out) && /denroi\.png\.png → denroi/.test(out) && /Triệu Đà\.png → trieuda/.test(out) && /no_tho\.png → no-tho/.test(out), 'nhận tên lệch: "(1)", chữ hoa, .png.png, tên tiếng Việt có dấu, _ thay -');

// --ghep: chép vào assets + ghi PACK_FRAMES
const G = path.join(TMP, 'ghep'); fs.mkdirSync(path.join(G, 'js'), { recursive: true });
fs.writeFileSync(path.join(G, 'js', 'render.js'), 'a\nconst PACK_FRAMES = {"cu":{"walk":4}};\nb\n');
py(['tools/cat_anh.py', '--ghep', path.join(VAO, 'da-cat.zip')], { env: { ...process.env, CAT_SHEET_RENDER: path.join(G, 'js', 'render.js'), CAT_ANH_ASSETS: path.join(G, 'assets') } });
const rj = fs.readFileSync(path.join(G, 'js', 'render.js'), 'utf8');
ok(fs.existsSync(path.join(G, 'assets', 'packs', 'thaymo', 'idle_1.png')) && /"cu":\{"walk":4\}/.test(rj) && /"thaymo":\{"idle":3,"attack":4,"cast":3,"hurt":1\}/.test(rj), '--ghep da-cat.zip: chép assets/ và thêm mã vào PACK_FRAMES (giữ mã cũ)');

// ═══ 2. bản HTML trong Chromium ═══
(async () => {
  console.log('cat-anh.html (trình duyệt):');
  const { chromium } = require('/opt/node-tools/node_modules/playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
  await page.goto('file://' + path.join(ROOT, 'tools', 'cat-anh.html'));
  const names = await page.evaluate(() => ['Thaymo (1).PNG', 'trung-kim.png.png', 'Thầy Mo Lửa.png', 'thaymo_v2.png', 'dan_he.png', 'trieu da.png', 'tromg-kim.png', 'anh-la.png', 'icon-thaymo copy.png'].map((f) => window.__catAnh.nhanDien(f)));
  const pyNames = JSON.parse(py(['-c', `
import importlib.util, json
s = importlib.util.spec_from_file_location('c', 'tools/cat_anh.py'); m = importlib.util.module_from_spec(s); s.loader.exec_module(m)
print(json.dumps([list(m.nhan_dien(f)) for f in ['Thaymo (1).PNG', 'trung-kim.png.png', 'Thầy Mo Lửa.png', 'thaymo_v2.png', 'dan_he.png', 'trieu da.png', 'tromg-kim.png', 'anh-la.png', 'icon-thaymo copy.png']]))`]));
  ok(JSON.stringify(names) === JSON.stringify(pyNames), 'đoán tên file giống hệt bản Python ' + JSON.stringify(names.map((n) => n[0])));
  // gửi dạng buffer: Playwright bỏ qua im lặng file có đường dẫn tiếng Việt ("ảnh game")
  const inputs = fs.readdirSync(VAO).filter((f) => /\.(png|PNG)$/.test(f)).sort().map((f) => ({ name: f, mimeType: 'image/png', buffer: fs.readFileSync(path.join(VAO, f)) }));
  await page.setInputFiles('#chon-anh', inputs);
  await page.waitForFunction(() => window.__xong === true && window.__catAnh.ITEMS.every((i) => i.done), null, { timeout: 120000 });
  const b64 = await page.evaluate(async () => { const z = await window.__catAnh.zipBytes(); let s = ''; for (let i = 0; i < z.length; i += 32768) s += String.fromCharCode(...z.subarray(i, i + 32768)); return btoa(s); });
  const H = path.join(TMP, 'html'); fs.mkdirSync(H);
  fs.writeFileSync(path.join(H, 'da-cat.zip'), Buffer.from(b64, 'base64'));
  py(['-c', 'import zipfile, sys; z = zipfile.ZipFile(sys.argv[1]); assert z.testzip() is None; z.extractall(sys.argv[2])', path.join(H, 'da-cat.zip'), H]);
  const hFiles = walk(path.join(H, 'assets')).sort();
  ok(JSON.stringify(hFiles) === JSON.stringify(pyFiles), `zip hợp lệ, cùng bộ ${hFiles.length} file với bản Python`);
  ok(JSON.stringify(JSON.parse(fs.readFileSync(path.join(H, 'pack-frames.json'), 'utf8'))) === JSON.stringify(Object.fromEntries(Object.keys(pf).sort().reverse().map((k) => [k, pf[k]]))) || Object.keys(JSON.parse(fs.readFileSync(path.join(H, 'pack-frames.json'), 'utf8'))).sort().join() === Object.keys(pf).sort().join(), 'pack-frames.json cùng mã');
  let worst = { meanDiff: 0, alphaDiff: 0 }, bad = 0, exactPng = 0, nPng = 0;
  const pyPng = pyFiles.filter((f) => !f.endsWith('.v2'));
  const rs = cmpAll(pyPng.map((f) => [path.join(RA, 'assets', f), path.join(H, 'assets', f)]));
  for (const [i, f] of pyPng.entries()) {
    const r = rs[i];
    if (JSON.stringify(r.size[0]) !== JSON.stringify(r.size[1])) { bad++; console.log('    cỡ khác', f, r.size); continue; }
    if (r.alphaDiff > 0.003 || r.meanDiff > 1.5) { bad++; console.log('    lệch', f, JSON.stringify(r)); }
    if (r.mode[0] !== 'P') { nPng++; if (r.maxDiff <= 1) exactPng++; }
    if (r.meanDiff > worst.meanDiff) worst = { ...r, f };
  }
  ok(bad === 0, `mọi ảnh cùng cỡ, mặt nạ trong suốt và màu gần trùng bản Python (lệch nhất ${worst.f}: trung bình ${worst.meanDiff && worst.meanDiff.toFixed(2)}/255)`);
  ok(exactPng === nPng, `ảnh không nén bảng màu (vfx/, fx/) trùng bản Python tới ±1 (${exactPng}/${nPng})`);
  const txt = await page.textContent('#ds');
  ok(/không nhận ra tên file/.test(txt) && /đã dò lưới/.test(txt) && /thiếu khung attack_2/.test(txt) && /giống hệt/.test(txt), 'trang báo: tên lạ, sai lưới đã dò, thiếu khung, khung trùng');
  const anim = async () => page.evaluate(() => [...document.querySelectorAll('canvas.chay')].map((c) => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0; for (let i = 3; i < d.length; i += 4) h = (h * 31 + d[i]) % 1e9; return h; }));
  const a1 = await anim(); await page.waitForTimeout(400); const a2 = await anim();
  ok(a1.length === 8 && a1.every((h, i) => h !== 0 && h !== a2[i]), 'mỗi tấm nhân vật / dải hiệu ứng có khung xem trước đang chạy animation (8)');
  // chọn tay mã cho ảnh tên lạ
  await page.locator('.the', { hasText: 'anh-la.png' }).locator('input').fill('chet-quai');
  await page.locator('.the', { hasText: 'anh-la.png' }).locator('input').dispatchEvent('change');
  await page.waitForFunction(() => window.__xong === true && window.__catAnh.ITEMS.every((i) => i.done));
  ok(await page.evaluate(() => window.__catAnh.ITEMS.find((i) => i.path.includes('anh-la')).ket.kind === 'dai'), 'gõ mã tay cho ảnh tên lạ → cắt lại theo mã đó');
  await page.setViewportSize({ width: 390, height: 800 });
  const wide = await page.evaluate(() => [document.documentElement.scrollWidth, [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > 392).map((e) => e.tagName + '.' + e.className).slice(0, 5)]);
  ok(wide[0] <= 392, 'không tràn ngang ở bề rộng điện thoại ' + (wide[0] > 392 ? JSON.stringify(wide) : ''));
  fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.screenshot({ path: path.join(__dirname, 'shots', 'cat-anh.png'), fullPage: false });
  ok(errs.length === 0, 'không lỗi JS ' + errs.join(' | '));
  await browser.close();
  // bat + đường dẫn mặc định
  const bat = fs.readFileSync(path.join(ROOT, 'tools', 'cat-anh.bat'), 'utf8');
  ok(/cat_anh\.py/.test(bat) && /chcp 65001/.test(bat) && !/[^\x00-\x7f]/.test(bat), 'cat-anh.bat gọi cat_anh.py, bật UTF-8, chỉ chữ ASCII (cmd không lỗi dấu)');
  ok(fs.readFileSync(path.join(ROOT, 'tools', 'cat_anh.py'), 'utf8').includes("MAC_DINH_VAO = 'D:\\\\ảnh game'"), 'mặc định đọc D:\\ảnh game');
  console.log(fail ? `\n${fail} lỗi` : '\nTất cả đạt'); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
