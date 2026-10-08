// Test icon kỹ năng riêng từng chiêu (claude/icon-ky-nang-rieng). Chạy: node tests/ve-pixel/ky-nang.test.js
// 1. tools/pixel/spec/ky-nang.json đúng bằng bảng thiết kế tools/build-ky-nang-spec.js (quên chạy lại → báo)
// 2. mọi tướng trong game đủ Q W E R; cùng tướng không hai chiêu trùng hình chính
// 3. tools/kiem-ky-nang.js: không cặp icon nào giống ≥ 50% điểm ảnh (trừ hai bản vẽ tay với nhau)
// 4. khung theo phím: Q đồng · W bạc · E ngọc · R vàng + ngọc son ở góc — cả 40 bản vẽ tay
// 5. ảnh trong game assets/pixel/ky-nang/<mã>.png khớp đúng điểm ảnh tool sinh (quên --nap → báo)
// Chỉ đọc file, không ghi gì vào assets/ hay js/.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '../..');
const ok = (c, m) => { if (!c) throw new Error('FAIL: ' + m); console.log('  ✓ ' + m); };

const { taoSpec } = require(path.join(ROOT, 'tools/build-ky-nang-spec.js'));
const { kiem } = require(path.join(ROOT, 'tools/kiem-ky-nang.js'));
const { loadCore } = require(path.join(ROOT, 'tools/ve-pixel.js'));

// PNG RGBA 8 bit (build-pixel) → [w, h, Buffer RGBA]
function docPNG(buf) {
  let p = 8, w, h; const idat = [];
  while (p < buf.length) {
    const n = buf.readUInt32BE(p), t = buf.toString('ascii', p + 4, p + 8), d = buf.subarray(p + 8, p + 8 + n);
    if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); if (d[8] !== 8 || d[9] !== 6) throw new Error('PNG không phải RGBA 8 bit'); }
    if (t === 'IDAT') idat.push(d);
    p += 12 + n;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat)), bpp = 4, st = w * bpp, out = Buffer.alloc(st * h);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (st + 1)], src = raw.subarray(y * (st + 1) + 1, (y + 1) * (st + 1));
    for (let i = 0; i < st; i++) {
      const a = i >= bpp ? out[y * st + i - bpp] : 0, b = y ? out[(y - 1) * st + i] : 0, c = i >= bpp && y ? out[(y - 1) * st + i - bpp] : 0;
      const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
      const pr = f === 0 ? 0 : f === 1 ? a : f === 2 ? b : f === 3 ? (a + b) >> 1 : pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      out[y * st + i] = (src[i] + pr) & 255;
    }
  }
  return [w, h, out];
}

const K = loadCore();
const specF = path.join(ROOT, 'tools/pixel/spec/ky-nang.json');
// 1
const t = taoSpec();
ok(!t.loi.length, `bảng thiết kế hợp lệ (${t.loi.join('; ') || 'không lỗi'})`);
ok(fs.readFileSync(specF, 'utf8') === t.txt, 'spec ky-nang.json khớp bảng thiết kế (sửa bảng thì chạy node tools/build-ky-nang-spec.js)');
const spec = JSON.parse(t.txt).ma;
// 2
const ctx = { console, window: {}, document: {}, localStorage: { getItem() {}, setItem() {} }, navigator: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/data.js'), 'utf8') + ';this.HEROES = HEROES;', ctx);
const tuong = Object.keys(ctx.HEROES);
const ma = new Set(spec.map((s) => s.ma));
ok(tuong.every((h) => 'qwer'.split('').every((k) => ma.has(`ky-nang/${h}_${k}`))), `${tuong.length} tướng đủ icon Q W E R (${spec.length} mã)`);
for (const h of tuong) {
  const v = spec.filter((s) => s.ma.startsWith(`ky-nang/${h}_`) && s.bo_phan).map((s) => s.bo_phan.vat).filter((x) => x && x !== 'khong');
  if (new Set(v).size !== v.length) ok(false, `${h}: trùng hình chính ${v.join(', ')}`);
}
ok(true, 'cùng tướng không hai chiêu trùng hình chính');
const sinh = spec.filter((s) => !s.mau);
ok(new Set(sinh.map((s) => s.bo_phan.vat || s.bo_phan.vat2)).size >= 150, `200 icon sinh dùng ≥ 150 hình chính khác nhau (${new Set(sinh.map((s) => s.bo_phan.vat || s.bo_phan.vat2)).size})`);
// 3
const r = K.docSpec(spec);
ok(!r.loi.length, `spec dựng được (${r.items.length} icon)`);
const kq = kiem(r.items, spec, 0.5);
ok(!kq.loi.length, `không cặp icon trùng (giống nhất ${(kq.cap[0].giong * 100).toFixed(0)}% ${kq.cap[0].a} ~ ${kq.cap[0].b})${kq.loi.length ? ': ' + kq.loi.slice(0, 5).join(' | ') : ''}`);
// 4
const KN = K.KN;
let saiKhung = [];
for (const it of r.items) {
  const f = it.anims[0].frames[0], pk = KN.PHIM[it.code.slice(-1)];
  const mau = (x, y) => K.PAL[f.get(x, y) - 1].name;
  if (mau(5, 1) !== pk.mau[0] || mau(5, 2) !== pk.mau[1] || mau(5, 22) !== pk.mau[2] || mau(11, 1) !== pk.mau[3]) saiKhung.push(it.code);
  if (pk.goc && mau(1, 1) !== 'son-sang') saiKhung.push(it.code + ' (góc R)');
}
ok(!saiKhung.length, `khung theo phím đúng cho cả 240 icon (Q đồng · W bạc · E ngọc · R vàng)${saiKhung.length ? ': ' + saiKhung.slice(0, 6).join(', ') : ''}`);
// 5
const lech = [];
for (const it of r.items) {
  const f = path.join(ROOT, 'assets/pixel/ky-nang', it.code + '.png');
  if (!fs.existsSync(f)) { lech.push(it.code + ' (thiếu ảnh)'); continue; }
  const [w, , d] = docPNG(fs.readFileSync(f)), g = it.anims[0].frames[0];
  let khac = 0;
  for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
    const v = g.get(x, y), i = (y * w + x) * 4;
    if (!v) { if (d[i + 3]) khac++; continue; }
    const c = K.PAL[v - 1].rgb; if (d[i] !== c[0] || d[i + 1] !== c[1] || d[i + 2] !== c[2] || d[i + 3] !== 255) khac++;
  }
  if (khac) lech.push(`${it.code} (${khac} điểm)`);
}
ok(!lech.length, `ảnh trong game khớp tool sinh — 240/240${lech.length ? ' — lệch: ' + lech.slice(0, 6).join(', ') + ' (chạy: node tools/ve-pixel.js --spec tools/pixel/spec/ky-nang.json --nap --ghi-de)' : ''}`);
ok(/<script src="ve-pixel-ky-nang\.js"><\/script>\s*<script src="ve-pixel-core\.js">/.test(fs.readFileSync(path.join(ROOT, 'tools/ve-pixel.html'), 'utf8')), 'trang tools/ve-pixel.html nạp bộ sinh icon kỹ năng trước lõi');
console.log('ky-nang.test: ĐẠT');
