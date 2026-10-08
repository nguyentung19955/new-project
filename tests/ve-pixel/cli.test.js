// Test CLI tool vẽ pixel tools/ve-pixel.js + lõi tools/ve-pixel-core.js + thư viện mẫu vẽ tay tools/pixel/thu-vien.js.
// Chạy: node tests/ve-pixel/cli.test.js — mọi thứ ghi vào thư mục tạm (không đụng assets/, js/, tools/pixel/src thật).
// 1. thư viện: tools/pixel/thu-vien.js có mọi nguồn của nhánh chính; mỗi mẫu (trừ vfx — bảng màu riêng) dựng bằng lõi
//    TRÙNG TỪNG ĐIỂM ẢNH với tools/build-pixel.js
// 2. --spec → --out zip (đúng cấu trúc) + --xem (ảnh từng mã + tong-quan.png); ve_tay ghi đè điểm ảnh; thay bộ phận + đổi màu
// 3. spec sai → mã thoát 1 + mã lỗi rõ (E_MA, E_NHOM, E_KHOA, E_BO_PHAN, E_GIA_TRI, E_HANH, E_CO, E_MAU_TV, E_THAY, E_DOI_MAU,
//    E_VE_TAY, E_DONG_TAC, E_TRUNG, E_SPEC_JSON), không ghi file
// 4. --nap: ghi nguồn + build-pixel (thư mục tạm) → manifest game có mã; không ghi đè nguồn có sẵn trừ khi --ghi-de
// 5. --mau: bộ mẫu tools/pixel/mau/ dựng lại khớp bản trong repo; mẫu có ngưỡng: lệch bản vẽ tay (giải PNG) ≤ ngưỡng
const path = require('path');
const fs = require('fs');
const os = require('os');
const zlib = require('zlib');
const { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '../..');
const CLI = path.join(ROOT, 'tools/ve-pixel.js');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 've-pixel-cli-'));
const ok = (c, m) => { if (!c) throw new Error('FAIL: ' + m); console.log('  ✓ ' + m); };
const run = (...a) => spawnSync(process.execPath, [CLI, ...a], { encoding: 'utf8', cwd: ROOT });
const spec = (name, j) => { const f = path.join(TMP, name + '.json'); fs.writeFileSync(f, typeof j === 'string' ? j : JSON.stringify(j)); return f; };
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
function decodePNG(b) {   // RGBA 8-bit, mọi bộ lọc
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20), st = w * 4; let p = 8; const idat = [];
  while (p < b.length) { const n = b.readUInt32BE(p), t = b.toString('ascii', p + 4, p + 8); if (t === 'IDAT') idat.push(b.subarray(p + 8, p + 8 + n)); p += 12 + n; }
  const raw = zlib.inflateSync(Buffer.concat(idat)), px = Buffer.alloc(w * h * 4); let prev = Buffer.alloc(st);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (st + 1)], row = Buffer.from(raw.subarray(y * (st + 1) + 1, (y + 1) * (st + 1)));
    for (let i = 0; i < st; i++) { const a = i >= 4 ? row[i - 4] : 0, u = prev[i], c = i >= 4 ? prev[i - 4] : 0, pa = Math.abs(u - c), pb = Math.abs(a - c), pc = Math.abs(a + u - 2 * c); row[i] = (row[i] + [0, a, u, (a + u) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? u : c][f]) & 255; }
    row.copy(px, y * st); prev = row;
  }
  return { w, h, px };
}
const lechPNG = (a, b) => { if (a.w !== b.w || a.h !== b.h) return 1; let k = 0, t = 0; for (let i = 0; i < a.px.length; i += 4) { const A = a.px[i + 3] > 0, B = b.px[i + 3] > 0; if (!A && !B) continue; t++; if (A !== B || a.px[i] !== b.px[i] || a.px[i + 1] !== b.px[i + 1] || a.px[i + 2] !== b.px[i + 2]) k++; } return t ? k / t : 0; };

try {
  // ---------------------------------------------------------------- 1. thư viện
  console.log('— thư viện mẫu vẽ tay');
  let r = spawnSync(process.execPath, [path.join(ROOT, 'tools/build-thu-vien.js'), '--khong-nhanh', '--out', path.join(TMP, 'tv.js')], { encoding: 'utf8' });
  ok(r.status === 0, 'build-thu-vien chạy được');
  const { loadCore } = require(CLI);
  const K = loadCore();
  const srcMain = [];
  (function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else if (/^[a-z0-9]+([-_][a-z0-9]+)*\.txt$/.test(f.name)) srcMain.push(path.relative(path.join(ROOT, 'tools/pixel/src'), p).replace(/\.txt$/, '').split(path.sep).join('/')); } })(path.join(ROOT, 'tools/pixel/src'));
  ok(srcMain.every((k) => K.TV[k]), `tools/pixel/thu-vien.js có đủ ${srcMain.length} nguồn nhánh chính (đã chạy node tools/build-thu-vien.js)`);
  const groups = new Set(Object.keys(K.TV).map((k) => k.split('/')[0]));
  ok(Object.keys(K.TV).length > srcMain.length && ['tuong', 'quai', 'boss', 'nen', 'icon', 'ky-nang', 'an-phu'].every((g) => groups.has(g)), `thư viện gồm cả nhánh pixel chưa gộp: ${Object.keys(K.TV).length} mẫu (${[...groups].join(', ')})`);
  // mọi mẫu (trừ vfx) dựng bằng lõi trùng build-pixel
  const keys = Object.keys(K.TV).filter((k) => !k.startsWith('vfx/'));
  for (const k of keys) { const [g, c] = k.split('/'); fs.mkdirSync(path.join(TMP, 'tvsrc', g), { recursive: true }); fs.writeFileSync(path.join(TMP, 'tvsrc', g, c + '.txt'), K.TV[k].src); }
  r = spawnSync(process.execPath, [path.join(ROOT, 'tools/build-pixel.js'), '--nhap', '--src', path.join(TMP, 'tvsrc'), '--out', path.join(TMP, 'tvout'), '--quiet'], { encoding: 'utf8' });
  ok(r.status === 0, 'build-pixel dựng được mọi mẫu trong thư viện ' + (r.status ? r.stderr.slice(0, 600) : ''));
  (async () => {
    let khac = [];
    for (const k of keys) {
      const m = K.dungMau(k), grids = m.anims.flatMap((a) => a.frames);
      const a = decodePNG(Buffer.from(await K.encodePNG(grids, m.w, m.h))), b = decodePNG(fs.readFileSync(path.join(TMP, 'tvout/assets/pixel', k + '.png')));
      const j = JSON.parse(fs.readFileSync(path.join(TMP, 'tvout/assets/pixel', k + '.json'), 'utf8'));
      if (lechPNG(a, b) > 0 || m.ax !== j.ax || m.ay !== j.ay || Object.keys(j.anims).join() !== m.anims.map((x) => x.name).join()) khac.push(k);
    }
    ok(!khac.length, `${keys.length} mẫu thư viện dựng bằng lõi trùng từng điểm ảnh + điểm neo + động tác với build-pixel ${khac.slice(0, 5).join(', ')}`);
    const vk = K.boPhanTV('vk');
    ok(vk.length > 50 && vk.some((p) => p.ref === 'tuong/giong:gay'), `bộ phận theo loại: ${vk.length} vũ khí (có tuong/giong:gay)`);

    // ---------------------------------------------------------------- 2. --spec --out --xem
    console.log('— --spec / --out / --xem');
    const vt = Array.from({ length: 32 }, (_, y) => (y === 2 ? '.'.repeat(5) + 'zz' + '.'.repeat(25) : '.'.repeat(32)));
    const good = spec('good', { ma: [
      { ma: 'tuong/thu-gay', mau: 'tuong/giong', thay: { 'gay*': 'tuong/tanvien:gay*' }, doi_mau: { son: 'cham' }, dong_tac: { idle: { fps: 4 } }, ve_tay: { mau: { z: 'sang' }, khung: { 'idle.0': vt } } },
      { ma: 'quai/thu-mo-ta', mo: 'bộ xương, giáp đồng, giáo', hanh: 'tho' },
      { ma: 'icon/thu-icon', co: '16x16', bo_phan: { khung: 'tron', hinh: 'set', mauHinh: 'vang' } },
      { ma: 'nen/thu-nen', bo_phan: { nen: 'gach', mauNen: 'son' } },
    ] });
    r = run('--spec', good, '--out', path.join(TMP, 'o', 'goi.zip'), '--xem', path.join(TMP, 'xem'));
    ok(r.status === 0 && /✓ tuong\/thu-gay/.test(r.stdout), 'spec hợp lệ (mẫu + thay + đổi màu + vẽ tay · mô tả · bộ phận) → mã thoát 0 ' + r.stderr);
    const z = unzip(fs.readFileSync(path.join(TMP, 'o', 'goi.zip')));
    ok(JSON.parse(z.get('goi-pixel.json')).ma.length === 4 && ['tuong/thu-gay', 'quai/thu-mo-ta', 'icon/thu-icon', 'nen/thu-nen'].every((k) => z.get(`assets/pixel/${k}.png`) && z.get(`assets/pixel/${k}.json`) && z.get(`tools/pixel/src/${k}.txt`)), 'zip: goi-pixel.json + PNG + JSON + nguồn .txt mỗi mã');
    const tj = JSON.parse(z.get('assets/pixel/tuong/thu-gay.json')), tp = decodePNG(z.get('assets/pixel/tuong/thu-gay.png'));
    const at = (x, y) => [...tp.px.subarray((y * tp.w + x) * 4, (y * tp.w + x) * 4 + 4)];
    ok(tj.anims.idle.fps === 4 && String(at(5, 2)) === '245,238,216,255' && String(at(6, 2)) === '245,238,216,255', 've_tay: idle.0 điểm (5,2),(6,2) màu "sang"; dong_tac idle fps 4');
    const goc = K.dungMau('tuong/giong'), cham = K.PAL[K.PI['cham'] - 1].rgb.join(), son = K.PAL[K.PI['son'] - 1].rgb.join();
    let coCham = 0, coSon = 0; for (let i = 0; i < tp.px.length; i += 4) { const c = [...tp.px.subarray(i, i + 3)].join(); if (c === cham) coCham++; if (c === son) coSon++; }
    ok(coCham > 20 && coSon === 0 && goc.anims[0].frames.length === tj.anims.idle.n, `doi_mau son → chàm (${coCham} điểm chàm, 0 điểm son)`);
    ok(fs.existsSync(path.join(TMP, 'xem', 'tong-quan.png')) && fs.existsSync(path.join(TMP, 'xem', 'tuong-thu-gay.png')) && decodePNG(fs.readFileSync(path.join(TMP, 'xem', 'tuong-thu-gay.png'))).w > 200, '--xem: ảnh phóng to từng mã + tong-quan.png');
    fs.copyFileSync(path.join(TMP, 'xem', 'tong-quan.png'), path.join(__dirname, 'shots', 'cli-tong-quan.png'));
    // nguồn trong zip qua build-pixel --strict
    for (const [n, d] of z) if (n.startsWith('tools/')) { const f = path.join(TMP, 'zsrc', n.replace('tools/pixel/src/', '')); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, d); }
    r = spawnSync(process.execPath, [path.join(ROOT, 'tools/build-pixel.js'), '--check', '--src', path.join(TMP, 'zsrc')], { encoding: 'utf8' });
    ok(r.status === 0 && /thu-gay.*mép hình/.test(r.stdout), 'nguồn .txt trong zip qua build-pixel; 2 điểm vẽ tay lơ lửng → build-pixel cảnh báo viền ' + r.stderr);
    ok(/thu-gay[^\n]*! [^\n]*điểm chạm nền/.test(run('--spec', good).stdout), 'CLI cũng in cảnh báo viền cho mã đó (!)');
    r = run('--spec', good);
    ok(r.status === 0 && /spec hợp lệ/.test(r.stdout), 'chỉ --spec: kiểm tra, không ghi gì');

    // ---------------------------------------------------------------- 3. spec sai
    console.log('— spec sai');
    const BAD = [
      ['E_SPEC_JSON', '{ "ma": [ '],
      ['E_SPEC', { abc: 1 }],
      ['E_MA', [{ ma: 'Tuong/Giong' }]],
      ['E_NHOM', [{ ma: 'linh-tinh/abc' }]],
      ['E_KHOA', [{ ma: 'tuong/abc', mau_sac: 'do' }]],
      ['E_BO_PHAN', [{ ma: 'tuong/abc', bo_phan: { canh_tay: 'x' } }]],
      ['E_GIA_TRI', [{ ma: 'tuong/abc', bo_phan: { vk: 'sung' } }]],
      ['E_HANH', [{ ma: 'tuong/abc', hanh: 'gio' }]],
      ['E_CO', [{ ma: 'tuong/abc', co: '40x40' }]],
      ['E_MAU_TV', [{ ma: 'tuong/abc', mau: 'tuong/khong-co' }]],
      ['E_THAY', [{ ma: 'tuong/abc', mau: 'tuong/giong', thay: { gay: 'tuong/giong:khong-co' } }]],
      ['E_DOI_MAU', [{ ma: 'tuong/abc', mau: 'tuong/giong', doi_mau: { son: 'hong-phan' } }]],
      ['E_VE_TAY', [{ ma: 'tuong/abc', ve_tay: { mau: { z: 'sang' }, khung: { 'idle.0': ['..'] } } }]],
      ['E_DONG_TAC', [{ ma: 'tuong/abc', dong_tac: { bay: { fps: 3 } } }]],
      ['E_TRUNG', [{ ma: 'tuong/abc' }, { ma: 'tuong/abc' }]],
    ];
    for (const [code, j] of BAD) {
      const out = path.join(TMP, 'bad-' + code + '.zip');
      r = run('--spec', spec('bad-' + code, j), '--out', out);
      ok(r.status === 1 && r.stderr.includes(code + ':') && !fs.existsSync(out), `${code}: mã thoát 1, không ghi zip — ${r.stderr.split('\n')[0].slice(0, 110)}`);
    }
    r = run('--spec', path.join(TMP, 'khong-co.json'));
    ok(r.status === 2 && /E_SPEC/.test(r.stderr), 'thiếu file spec → mã thoát 2');
    // spec là thư mục
    fs.mkdirSync(path.join(TMP, 'dir'));
    fs.writeFileSync(path.join(TMP, 'dir', 'a.json'), JSON.stringify({ ma: 'quai/thu-a', mo: 'rắn' }));
    fs.writeFileSync(path.join(TMP, 'dir', 'b.json'), JSON.stringify([{ ma: 'quai/thu-b', mo: 'hổ' }]));
    r = run('--spec', path.join(TMP, 'dir'));
    ok(r.status === 0 && /quai\/thu-a/.test(r.stdout) && /quai\/thu-b/.test(r.stdout), '--spec thư mục: gộp mọi *.json');

    // ---------------------------------------------------------------- 4. --nap
    console.log('— --nap');
    const SRC = path.join(TMP, 'nap', 'tools/pixel/src'), GOC = path.join(TMP, 'nap');
    fs.mkdirSync(SRC, { recursive: true });
    const napSpec = spec('nap', [{ ma: 'tuong/thu-nap', mau: 'tuong/giong', doi_mau: { son: 'tim' } }, { ma: 'icon/thu-nap', bo_phan: { hinh: 'tim' } }]);
    r = run('--spec', napSpec, '--nap', '--src', SRC, '--goc', GOC);
    ok(r.status === 0, '--nap chạy được ' + r.stderr);
    const man = fs.readFileSync(path.join(GOC, 'js/pixel/tuong.js'), 'utf8');
    ok(fs.existsSync(path.join(SRC, 'tuong/thu-nap.txt')) && /"tuong\/thu-nap"/.test(man) && fs.existsSync(path.join(GOC, 'assets/pixel/tuong/thu-nap.png')) && fs.existsSync(path.join(GOC, 'assets/pixel/tuong/thu-nap-chan-dung.png')), '--nap: nguồn tools/pixel/src + assets/pixel + manifest js/pixel/tuong.js (game tự dùng khi mở)');
    // js/asset-list.js: build-pixel chỉ dựng lại khi ghi vào repo thật (--goc mặc định) — không thử ở thư mục tạm
    r = run('--spec', napSpec, '--nap', '--src', SRC, '--goc', GOC);
    ok(r.status === 1 && /E_NAP_TON_TAI/.test(r.stderr), 'nạp lại mà không --ghi-de → E_NAP_TON_TAI (không đè bản vẽ tay)');
    r = run('--spec', napSpec, '--nap', '--ghi-de', '--src', SRC, '--goc', GOC);
    ok(r.status === 0, '--ghi-de: ghi đè được');

    // ---------------------------------------------------------------- 5. --mau
    console.log('— bộ mẫu input → output');
    const MD = path.join(TMP, 'mau');
    fs.cpSync(path.join(ROOT, 'tools/pixel/mau'), MD, { recursive: true, filter: (s) => fs.statSync(s).isDirectory() || s.endsWith('.spec.json') });
    r = run('--mau', '--mau-dir', MD);
    ok(r.status === 0, '--mau dựng lại bộ mẫu ' + r.stderr);
    const specs = []; for (const g of fs.readdirSync(MD)) if (fs.statSync(path.join(MD, g)).isDirectory()) for (const f of fs.readdirSync(path.join(MD, g))) if (f.endsWith('.spec.json')) specs.push([g, f.replace('.spec.json', '')]);
    ok(specs.length >= 10 && new Set(specs.map((s) => s[0])).size >= 6, `${specs.length} mẫu, ${new Set(specs.map((s) => s[0])).size} nhóm`);
    let cu = [];
    for (const [g, n] of specs) for (const suf of ['.png', '-goc.png', '-xem.png']) {
      const a = path.join(MD, g, n + suf), b = path.join(ROOT, 'tools/pixel/mau', g, n + suf);
      if (fs.existsSync(a) !== fs.existsSync(b) || (fs.existsSync(a) && !fs.readFileSync(a).equals(fs.readFileSync(b)))) cu.push(g + '/' + n + suf);
    }
    ok(!cu.length, 'ảnh mẫu trong repo khớp spec (đã chạy node tools/ve-pixel.js --mau) ' + cu.join(', '));
    let nNguong = 0;
    for (const [g, n] of specs) {
      const sp = JSON.parse(fs.readFileSync(path.join(MD, g, n + '.spec.json'), 'utf8'));
      if (sp.nguong == null) continue;
      const l = lechPNG(decodePNG(fs.readFileSync(path.join(MD, g, n + '.png'))), decodePNG(fs.readFileSync(path.join(MD, g, n + '-goc.png'))));
      if (l > sp.nguong) throw new Error(`FAIL: mẫu ${g}/${n} lệch bản vẽ tay ${(l * 100).toFixed(2)}% > ${sp.nguong * 100}%`);
      nNguong++;
    }
    ok(nNguong >= 8, `${nNguong} mẫu dựng từ thư viện: lệch bản vẽ tay (giải PNG, so từng điểm) dưới ngưỡng`);
    console.log('cli: ĐẠT');
    fs.rmSync(TMP, { recursive: true, force: true });
  })().catch((e) => { console.error(e); fs.rmSync(TMP, { recursive: true, force: true }); process.exit(1); });
} catch (e) { console.error(e); fs.rmSync(TMP, { recursive: true, force: true }); process.exit(1); }
