// Test tool dựng xương tools/dung-xuong.html (Chromium qua Playwright) với ảnh tướng / quái / boss có sẵn trong assets/packs:
// tự đoán xương, đủ khung đúng lưới, xuất zip đúng cấu trúc assets/packs/<mã>/ + pack-frames.json (ghép được bằng cat_anh.py --ghep),
// chân thẳng hàng, không khung nào trùng hệt khung khác, tấm sheet đúng cỡ lưới và cat-anh.html cắt lại được, rig .json lưu / nạp lại được.
// Chạy: node tests/dung-xuong/dung-xuong.test.js   (ảnh khung mẫu lưu ra thư mục tạm — in đường dẫn ở cuối)
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const { chromium } = require('/opt/node-tools/node_modules/playwright');

const ROOT = path.join(__dirname, '..', '..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'dung-xuong-'));
let fail = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
const py = (args, opt = {}) => execFileSync('python3', args, { cwd: ROOT, ...opt }).toString();
const anh = (c) => { const d = path.join(ROOT, 'assets', 'packs', c); return path.join(d, fs.existsSync(path.join(d, 'idle.png')) ? 'idle.png' : 'walk1.png'); };
// tướng: rìu, cung, gậy phép, kiếm, nỏ · quái · boss
const MA = [['lactuong', 'hero12'], ['xathu', 'hero12'], ['thaymo', 'hero12'], ['llq', 'hero12'], ['adv', 'hero12'], ['tom', 'enemy6'], ['chantinh', 'boss9']];
const LUOI = {
  hero12: ['idle_1', 'idle_2', 'idle_3', 'head', 'attack_1', 'attack_2', 'attack_3', 'attack_4', 'cast_1', 'cast_2', 'cast_3', 'hurt'],
  enemy6: ['walk_1', 'walk_2', 'walk_3', 'walk_4', 'attack_1', 'attack_2'],
  boss9: ['walk_1', 'walk_2', 'walk_3', 'walk_4', 'attack_1', 'attack_2', 'attack_3', 'rage_1', 'rage_2'],
};
const SHEET = { hero12: [768, 576], enemy6: [576, 384], boss9: [768, 768] };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const errs = []; page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + path.join(ROOT, 'tools', 'dung-xuong.html'));
  // tên file như người dùng đặt: mã tướng, tên tiếng Việt có dấu
  const tenFile = { thaymo: 'Thầy Mo Lửa.png' };
  await page.setInputFiles('#chon-anh', MA.map(([c]) => ({ name: tenFile[c] || c + '.png', mimeType: 'image/png', buffer: fs.readFileSync(anh(c)) })));
  await page.waitForFunction(() => window.__xong === true, null, { timeout: 180000 });

  console.log('Đoán xương:');
  ok(!errs.length, 'không lỗi JavaScript' + (errs.length ? ': ' + errs.join(' | ') : ''));
  const info = await page.evaluate(() => window.__dungXuong.ITEMS.map((it) => {
    const J = it.rig.joints, inside = Object.values(J).every(([x, y]) => x >= -2 && y >= -2 && x <= it.src.w + 2 && y <= it.src.h + 2);
    const cnt = {}; for (const v of it.nhan) cnt[v] = (cnt[v] || 0) + 1;
    return { ma: it.ma, kind: it.kind, kieu: it.rig.kieu, err: it.err || null, inside, nJ: Object.keys(J).length, parts: Object.keys(cnt).map(Number).filter((k) => k > 0).sort((a, b) => a - b),
      head: J.dau[1] < J.co[1] && J.co[1] < J.hong[1] && J.hong[1] < J.banT[1], khung: it.khung, kerr: it.ket.err };
  }));
  for (const [i, [c, kind]] of MA.entries()) {
    const f = info[i];
    ok(f.ma === c && f.kind === kind && !f.err, `${c}: nhận mã từ tên file, lưới ${f.kind}${f.err ? ' — LỖI ' + f.err : ''}`);
    ok(f.nJ === 17 && f.inside && f.head, `${c}: đủ 17 khớp trong ảnh, đầu → cổ → hông → chân đúng thứ tự từ trên xuống`);
    ok(f.parts.includes(1) && f.parts.includes(2) && f.parts.filter((p) => p >= 3 && p <= 10).length >= 6, `${c}: chia vùng đủ thân, đầu, tay, chân (${f.parts.join(',')})`);
    ok(!f.kerr.length, `${c}: không khung nào trùng hệt khung khác` + (f.kerr.length ? ': ' + f.kerr.join('; ') : ''));
  }
  ok(info[0].kieu === 'vung' && info[1].kieu === 'cung' && info[2].kieu === 'phep' && info[3].kieu === 'vung' && info[4].kieu === 'no', 'chọn bộ đánh theo vũ khí: rìu / kiếm vung · cung kéo dây · gậy phép · nỏ');
  for (const i of [0, 1, 2, 3]) ok(info[i].parts.includes(11), `${MA[i][0]}: tìm thấy vũ khí (vùng nhô dài ngoài thân)`);

  // ── xuất zip (chỉ lưới chuẩn) ──
  console.log('Xuất zip:');
  const zipB64 = await page.evaluate(async () => { const z = await window.__dungXuong.taoZip(window.__dungXuong.ITEMS, false); let s = ''; for (let i = 0; i < z.length; i += 8192) s += String.fromCharCode(...z.subarray(i, i + 8192)); return btoa(s); });
  const ZIP = path.join(TMP, 'da-dung-xuong.zip'); fs.writeFileSync(ZIP, Buffer.from(zipB64, 'base64'));
  const res = JSON.parse(py(['-c', `
import json, sys, zipfile, io
import numpy as np
from PIL import Image
z = zipfile.ZipFile(sys.argv[1]); out = {'names': z.namelist(), 'frames': json.loads(z.read('pack-frames.json')), 'alias': json.loads(z.read('alias.json')), 'img': {}}
for n in z.namelist():
    if not n.endswith('.png'): continue
    im = Image.open(io.BytesIO(z.read(n))).convert('RGBA'); a = np.asarray(im)[..., 3]
    rows = np.where((a > 60).any(1))[0]; cols = np.where((a > 60).any(0))[0]
    # tâm bàn chân: trung vị cột có hình ở 6% hàng dưới cùng
    bot = a[int(a.shape[0] * 0.94):] > 60; fc = np.where(bot.any(0))[0]
    sig = np.asarray(im.resize((32, 32), Image.BILINEAR)).astype(float)
    out['img'][n] = {'size': im.size, 'top': int(rows[0]), 'bot': int(rows[-1]), 'w': im.size[0], 'foot': float(np.median(fc)) / im.size[0] if len(fc) else -1, 'sig': sig.ravel()[::7].tolist()}
print(json.dumps(out))`, ZIP], { maxBuffer: 1 << 28 }));
  for (const [c, kind] of MA) {
    const want = LUOI[kind].map((n) => `assets/packs/${c}/${n}.png`);
    ok(want.every((n) => res.names.includes(n)) && res.names.filter((n) => n.startsWith(`assets/packs/${c}/`) && n.endsWith('.png')).length === want.length, `${c}: đủ ${want.length} khung ${kind}, đúng tên assets/packs/${c}/…`);
    if (kind === 'hero12') ok(res.names.includes(`assets/packs/${c}/.v2`), `${c}: có dấu .v2 (bộ 12 khung)`);
    const fr = res.frames[c], wantF = kind === 'hero12' ? { idle: 3, attack: 4, cast: 3, hurt: 1 } : kind === 'enemy6' ? { walk: 4, attack: 2 } : { walk: 4, attack: 3, rage: 2 };
    ok(JSON.stringify(fr) === JSON.stringify(wantF), `${c}: pack-frames.json ${JSON.stringify(fr)}`);
    const body = LUOI[kind].filter((n) => n !== 'head').map((n) => res.img[`assets/packs/${c}/${n}.png`]);
    const H = body[0].size[1];
    ok(body.every((b) => b.size[1] === H) && H <= 480 && H >= 200, `${c}: mọi khung toàn thân cùng chiều cao ${H} px (≤ 480, cắt chung mép như cat-anh)`);
    const tol = Math.max(3, Math.round(0.02 * H));   // ≤ 2% chiều cao (ảnh quái đang sải bước: chân nhấc có thể hụt tầm với)
    const gaps = body.map((b) => H - 1 - b.bot);
    ok(gaps.every((g) => g <= tol), `${c}: chân thẳng hàng — mọi khung chạm cùng đường đáy (hụt nhiều nhất ${Math.max(...gaps)} px, cho phép ${tol})`);
    const hd = res.img[`assets/packs/${c}/head.png`];
    if (kind === 'hero12') ok(hd && hd.size[1] <= 240 && hd.size[1] > 60, `${c}: chân dung head.png ${hd && hd.size.join('×')}`);
    // không khung nào trùng hệt (so ảnh 32×32 như cat-anh)
    const names = LUOI[kind].filter((n) => n !== 'head'); let same = [];
    for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) {
      const a = res.img[`assets/packs/${c}/${names[i]}.png`].sig, b = res.img[`assets/packs/${c}/${names[j]}.png`].sig;
      let d = 0; for (let k = 0; k < a.length; k++) d += Math.abs(a[k] - b[k]); if (d / a.length < 1.5) same.push(names[i] + '=' + names[j]);
    }
    ok(!same.length, `${c}: không cặp khung nào giống hệt nhau` + (same.length ? ': ' + same.join(', ') : ''));
  }
  ok(res.alias['assets/packs/lactuong/idle.png'.replace('assets/', '')] === 'packs/lactuong/idle_1.png' && res.alias['packs/tom/walk1.png'] === 'packs/tom/walk_1.png', 'alias.json: tên cũ (idle, walk1…) trỏ về khung đại diện như cat-anh');

  // ── ghép bằng cat_anh.py --ghep (vào bản sao assets + render.js) ──
  console.log('Ghép (cat_anh.py --ghep):');
  const A = path.join(TMP, 'assets'), R = path.join(TMP, 'render.js'); fs.writeFileSync(R, 'const PACK_FRAMES = {"cu":{"idle":3}};\n');
  const outG = py(['tools/cat_anh.py', '--ghep', ZIP], { env: { ...process.env, CAT_ANH_ASSETS: A, CAT_SHEET_RENDER: R } });
  const pf = JSON.parse(fs.readFileSync(R, 'utf8').match(/PACK_FRAMES = (\{.*\});/)[1]);
  ok(/Đã chép \d+ file/.test(outG) && pf.cu && pf.lactuong && pf.lactuong.attack === 4 && pf.chantinh.rage === 2, 'ghép được: chép ảnh + PACK_FRAMES có mã mới, giữ mã cũ');
  ok(fs.existsSync(path.join(A, 'packs', 'lactuong', 'idle.png')) && fs.existsSync(path.join(A, 'packs', 'xathu', 'attack_3.png')), 'tạo lại tên cũ từ alias.json (packs/lactuong/idle.png)');

  // ── tấm sheet PNG → cat-anh.html cắt lại được ──
  console.log('Tấm sheet:');
  const sheets = await page.evaluate(() => window.__dungXuong.ITEMS.map((it) => { const c = window.__dungXuong.veSheet(it, 1); return { ma: it.ma, kind: it.kind, w: c.width, h: c.height, url: c.toDataURL('image/png') }; }));
  const VAO = path.join(TMP, 'sheet'); fs.mkdirSync(VAO);
  for (const s of sheets) {
    ok(s.w === SHEET[s.kind][0] && s.h === SHEET[s.kind][1], `${s.ma}: sheet ${s.w}×${s.h} đúng lưới ${s.kind}`);
    fs.writeFileSync(path.join(VAO, s.ma + '.png'), Buffer.from(s.url.split(',')[1], 'base64'));
  }
  const big = await page.evaluate(() => { const c = window.__dungXuong.veSheet(window.__dungXuong.ITEMS[0]); return [c.width, c.height]; });
  ok(big[0] === 1536 && big[1] === 1152, `nút "Tải tấm sheet" xuất ô gấp đôi (${big.join('×')}, cùng tỉ lệ lưới)`);
  const p2 = await browser.newPage();
  await p2.goto('file://' + path.join(ROOT, 'tools', 'cat-anh.html'));
  await p2.setInputFiles('#chon-anh', sheets.map((s) => ({ name: s.ma + '.png', mimeType: 'image/png', buffer: fs.readFileSync(path.join(VAO, s.ma + '.png')) })));
  await p2.waitForFunction(() => window.__xong === true && window.__catAnh.ITEMS.every((i) => i.done), null, { timeout: 180000 });
  const cut = await p2.evaluate(() => window.__catAnh.ITEMS.map((it) => ({ key: it.key, err: it.ket.err, n: Object.keys(it.ket.files).length })));
  for (const c of cut) {
    const kind = MA.find((m) => m[0] === c.key)[1];
    ok(!c.err.length && c.n === LUOI[kind].length, `cat-anh cắt sheet ${c.key}: ${c.n} khung, không lỗi${c.err.length ? ' — ' + c.err.join('; ') : ''}`);
  }

  // ── rig .json: lưu → sửa khớp → nạp lại ──
  console.log('Rig .json:');
  const rt = await page.evaluate(() => {
    const it = window.__dungXuong.ITEMS[0], j = JSON.parse(JSON.stringify(window.__dungXuong.rigJson(it)));
    const old = JSON.stringify(it.rig.joints), oldN = it.nhan.slice();
    j.khop.tayT = [j.khop.tayT[0] + 5, j.khop.tayT[1]];
    napRig(it, j); window.__dungXuong.capNhat(it);
    const same = it.nhan.every((v, i) => v === oldN[i]);
    return { moved: it.rig.joints.tayT[0], was: JSON.parse(old).tayT[0], same, khung: it.khung.length, fields: Object.keys(j).sort().join(',') };
  });
  ok(Math.abs(rt.moved - rt.was - 5) < 1e-6 && rt.same && rt.khung >= 12, `nạp lại rig: khớp + vùng giữ đúng, dựng lại ${rt.khung} khung (${rt.fields})`);

  // ── giao diện: kéo khớp bằng chuột, tô vùng bằng cọ ──
  console.log('Giao diện:');
  await page.evaluate(() => window.__dungXuong.chon(window.__dungXuong.ITEMS[1]));
  await page.waitForTimeout(200); await page.$eval('#ve', (e) => e.scrollIntoView({ block: 'center' }));
  const kq = await page.evaluate(() => { const it = window.__dungXuong.ITEMS[1], cv = document.getElementById('ve'), r = cv.getBoundingClientRect(), k = r.width / cv.width * SC;
    return { x: r.left + it.rig.joints.goiP[0] * k, y: r.top + it.rig.joints.goiP[1] * k, k, old: it.rig.joints.goiP.slice() }; });
  await page.mouse.move(kq.x, kq.y); await page.mouse.down(); await page.mouse.move(kq.x + 12, kq.y + 6, { steps: 4 }); await page.mouse.up();
  await page.waitForFunction(() => document.getElementById('cho').textContent === '', null, { timeout: 30000 });
  const moved = await page.evaluate(() => window.__dungXuong.ITEMS[1].rig.joints.goiP);
  ok(Math.abs(moved[0] - kq.old[0] - 12 / kq.k) < 2, `kéo chấm "gối phải" bằng chuột: khớp dời ${(moved[0] - kq.old[0]).toFixed(1)} px ảnh, dựng lại khung`);
  await page.check('input[name=che-do][value=to]'); await page.selectOption('#bo-phan', '11');
  const truoc = await page.evaluate(() => window.__dungXuong.ITEMS[1].nhan.filter((v) => v === 11).length);
  const tam = await page.evaluate(() => { const it = window.__dungXuong.ITEMS[1], cv = document.getElementById('ve'), r = cv.getBoundingClientRect(), k = r.width / cv.width * SC; return { x: r.left + it.rig.joints.hong[0] * k, y: r.top + it.rig.joints.hong[1] * k }; });
  await page.mouse.move(tam.x, tam.y); await page.mouse.down(); await page.mouse.move(tam.x + 10, tam.y, { steps: 3 }); await page.mouse.up();
  const sau = await page.evaluate(() => window.__dungXuong.ITEMS[1].nhan.filter((v) => v === 11).length);
  ok(sau > truoc, `tô vùng "Vũ khí" bằng cọ: +${sau - truoc} điểm`);
  await page.click('#hoan-tac'); await page.waitForTimeout(300);
  await page.waitForFunction(() => document.getElementById('cho').textContent === '', null, { timeout: 30000 });
  const lui = await page.evaluate(() => window.__dungXuong.ITEMS[1].nhan.filter((v) => v === 11).length);
  ok(lui === truoc, 'nút Hoàn tác trả lại vùng cũ');
  await page.check('input[name=che-do][value=khop]');

  // ── ảnh mẫu để xem bằng mắt ──
  const MAU = path.join(TMP, 'mau'); fs.mkdirSync(MAU);
  for (const c of ['lactuong', 'xathu', 'thaymo', 'llq', 'chantinh']) {
    const kind = MA.find((m) => m[0] === c)[1];
    py(['-c', `
import sys, zipfile, io
from PIL import Image
z = zipfile.ZipFile(sys.argv[1]); names = sys.argv[3].split(','); H = 240
ims = [Image.open(io.BytesIO(z.read('assets/packs/%s/%s.png' % (sys.argv[2], n)))).convert('RGBA') for n in names]
ims = [im.resize((max(1, round(im.size[0] * H / im.size[1])), H)) for im in ims]
o = Image.new('RGBA', (sum(i.size[0] + 6 for i in ims), H), (98, 150, 86, 255)); x = 0
for im in ims: o.alpha_composite(im, (x, 0)); x += im.size[0] + 6
o.save(sys.argv[4])`, ZIP, c, LUOI[kind].join(','), path.join(MAU, c + '.png')]);
  }
  for (const [vw, vh] of [[1920, 934], [844, 390], [667, 375]]) {
    await page.setViewportSize({ width: vw, height: vh }); await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(MAU, `giao-dien-${vw}x${vh}.png`), fullPage: true });
  }
  await browser.close();
  console.log(`\nẢnh khung mẫu + giao diện: ${MAU}`);
  console.log(fail ? `\n✗ ${fail} kiểm tra hỏng` : '\n✓ Tất cả kiểm tra đạt');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
