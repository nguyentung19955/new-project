#!/usr/bin/env node
'use strict';
// CLI tool vẽ pixel (claude/tool-pixel) — cho session Claude tự chạy, không cần bấm tay. Định dạng spec: docs/pixel/SPEC.md
//   node tools/ve-pixel.js --spec <file.json|thư mục> [--out goi-pixel.zip] [--xem <thư mục>] [--nap [--ghi-de]]
//       --out   đóng gói goi-pixel.zip (nạp tay trong game: Cài đặt → Gói pixel)
//       --xem   ảnh phóng to từng mã (<nhóm>-<mã>.png) + tong-quan.png (mọi mã) để xem bằng công cụ Read
//       --nap   ghi nguồn tools/pixel/src/<nhóm>/<mã>.txt rồi chạy tools/build-pixel.js --strict → game tự dùng khi mở
//               (assets/pixel, js/pixel/<nhóm>.js, js/asset-list.js). Không ghi đè nguồn có sẵn trừ khi thêm --ghi-de.
//               --src DIR / --goc DIR: thư mục nguồn / gốc repo khác (test)
//   node tools/ve-pixel.js --mau [--mau-dir DIR] [--chi <chuỗi>]   dựng lại bộ mẫu input→output tools/pixel/mau/<nhóm>/
//   node tools/ve-pixel.js --thu-vien [nhóm/mã | nhóm] [--loai vk]    liệt kê mẫu vẽ tay / bộ phận trong thư viện
// Mã thoát: 0 đạt · 1 spec lỗi (in từng dòng "E_…: …") · 2 sai cách gọi / lỗi build.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const os = require('os');
const { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');

function loadCore() {
  const w = {};
  new Function('window', fs.readFileSync(path.join(__dirname, 've-pixel-ds.js'), 'utf8'))(w);
  require('./pixel/thu-vien.js');
  const K = require('./ve-pixel-core.js')(w.VE_PIXEL_DS, globalThis.VE_PIXEL_TV || {});
  K.DS_MA = w.VE_PIXEL_DS.ma;
  return K;
}

// ---------------------------------------------------------------- chuyển ảnh → pixel (claude/pixel-con-lai)
// spec "anh": { "tep": "assets/ui/nen-menu.jpg", "cat": [x, y, w, h] (điểm ảnh nguồn, hoặc tỉ lệ 0..1), "vua": "phu" | "chua",
//   "lam_net": 0..3, "so_mau", "khu_nhieu", "vien", "nen_trong" } → đọc + cắt + thu nhỏ (trung bình vùng BOX) bằng python3 Pillow
//   thành RGBA đúng cỡ "co", lõi tuAnh() lượng tử về bảng màu.
const PY_ANH = `
import sys, json
from PIL import Image, ImageFilter
a = json.loads(sys.argv[1]); im = Image.open(a['tep']).convert('RGBA')
c = a.get('cat')
if c:
    if all(v <= 1 for v in c): c = [c[0] * im.width, c[1] * im.height, c[2] * im.width, c[3] * im.height]
    im = im.crop((int(c[0]), int(c[1]), int(c[0] + c[2]), int(c[1] + c[3])))
W, H = a['w'], a['h']
if a.get('vua') == 'chua':
    k = min(W / im.width, H / im.height); nw, nh = max(1, round(im.width * k)), max(1, round(im.height * k))
    sm = im.resize((nw, nh), Image.BOX); out = Image.new('RGBA', (W, H), (0, 0, 0, 0)); out.paste(sm, ((W - nw) // 2, H - nh)); im = out
else:
    k = max(W / im.width, H / im.height); nw, nh = max(W, round(im.width * k)), max(H, round(im.height * k))
    im = im.resize((nw, nh), Image.BOX); x, y = (nw - W) // 2, (nh - H) // 2; im = im.crop((x, y, x + W, y + H))
for _ in range(int(a.get('lam_net', 0))): im = im.filter(ImageFilter.UnsharpMask(radius=1, percent=80, threshold=2))
sys.stdout.buffer.write(im.tobytes())
`;
function docAnh(K, list) {
  for (const sp of list) {
    if (!sp || !sp.anh || typeof sp.anh !== 'object') continue;
    const g = String(sp.ma || '').split('/')[0], d = (K.DS_MA || []).find((x) => x.k === sp.ma) || {};
    const [w, h] = K.coMacDinh(g, sp.co || d.co).split('x').map(Number);
    const tep = path.resolve(ROOT, sp.anh.tep || '');
    if (!sp.anh.tep || !fs.existsSync(tep)) { sp.anh.loi = 'không thấy tệp'; continue; }
    const r = spawnSync('python3', ['-c', PY_ANH, JSON.stringify({ ...sp.anh, tep, w, h })], { maxBuffer: 1 << 26 });
    if (r.status || !r.stdout || r.stdout.length !== w * h * 4) { sp.anh.loi = String(r.stderr || 'python3 / Pillow lỗi').trim().split('\n').pop(); continue; }
    Object.defineProperty(sp.anh, 'rgba', { value: new Uint8Array(r.stdout), enumerable: false });
  }
}

// ---------------------------------------------------------------- ảnh RGBA + PNG (đồng bộ)
class Anh {
  constructor(w, h, bg) { this.w = w; this.h = h; this.d = Buffer.alloc(w * h * 4); if (bg) this.fill(0, 0, w, h, bg); }
  fill(x, y, w, h, c) { for (let j = Math.max(0, y); j < Math.min(this.h, y + h); j++) for (let i = Math.max(0, x); i < Math.min(this.w, x + w); i++) this.d.set(c, (j * this.w + i) * 4); }
  png() {
    const raw = Buffer.alloc((this.w * 4 + 1) * this.h);
    for (let y = 0; y < this.h; y++) this.d.copy(raw, y * (this.w * 4 + 1) + 1, y * this.w * 4, (y + 1) * this.w * 4);
    const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
    const crc = (b) => { let c = 0xffffffff; for (const x of b) c = CRC[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
    const ch = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
    const hd = Buffer.alloc(13); hd.writeUInt32BE(this.w, 0); hd.writeUInt32BE(this.h, 4); hd[8] = 8; hd[9] = 6;
    return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), ch('IHDR', hd), ch('IDAT', zlib.deflateSync(raw, { level: 9 })), ch('IEND', Buffer.alloc(0))]);
  }
}
// chữ 3×5 (mã, nhóm, số) cho ảnh tổng
const FONT = { a: '7d7d5', b: '6d6d6', c: '74447', d: '65556', e: '74747', f: '74744', g: '74557', h: '55755', i: '72227', j: '11157', k: '55655', l: '44447', m: '57755', n: '75555', o: '75557', p: '75744', q: '75571', r: '75655', s: '74717', t: '72222', u: '55557', v: '55552', w: '55775', x: '55255', y: '55722', z: '71247',
  0: '75557', 1: '26227', 2: '71747', 3: '71717', 4: '55711', 5: '74717', 6: '74757', 7: '71111', 8: '75757', 9: '75717', '/': '11244', '-': '00700', _: '00007', '.': '00002', ':': '02020', '%': '51245', ' ': '00000', '(': '24442', ')': '42224', '=': '07070', '<': '12421', '>': '42124' };
function chu(img, x, y, s, k, c) { for (const ch of String(s).toLowerCase()) { const f = FONT[ch] || FONT[' ']; for (let r = 0; r < 5; r++) { const bits = parseInt(f[r], 16); for (let b = 0; b < 3; b++) if (bits & (4 >> b)) img.fill(x + b * k, y + r * k, k, k, c); } x += 4 * k; } }
const NEN1 = [58, 45, 32, 255], NEN2 = [46, 36, 25, 255], CHU = [237, 226, 200, 255], VANG = [214, 165, 50, 255];
function veKhung(img, K, g, x0, y0, k) {
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    const v = g.get(x, y);
    img.fill(x0 + x * k, y0 + y * k, k, k, v ? [...K.PAL[v - 1].rgb, 255] : ((x + y) & 1 ? NEN1 : NEN2));
  }
}
// ảnh xem một mã: mỗi động tác một hàng (tên + các khung), phóng ×k
function anhMa(K, it, k) {
  const lab = 6 * 2 + 4, pad = 4, cot = Math.max(...it.anims.map((a) => a.frames.length));
  const W = Math.max(pad * 2 + cot * (it.w * k + pad), 8 * 4 * 2 + 20), H = 14 + it.anims.length * (it.h * k + lab + pad) + pad;
  const img = new Anh(W, H, [23, 17, 12, 255]);
  chu(img, pad, 3, `${it.k} ${it.w}x${it.h}`, 2, VANG);
  it.anims.forEach((a, r) => {
    const y = 14 + r * (it.h * k + lab + pad);
    chu(img, pad, y + 2, `${a.name} ${a.frames.length}k ${a.fps}fps`, 2, CHU);
    a.frames.forEach((f, i) => veKhung(img, K, f, pad + i * (it.w * k + pad), y + lab, k));
  });
  return img;
}
const heSo = (it) => Math.max(1, Math.min(8, Math.floor(256 / Math.max(it.w, it.h))));
function xem(K, items, dir) {
  fs.mkdirSync(dir, { recursive: true });
  const anh = items.map((it) => { const a = anhMa(K, it, heSo(it)); fs.writeFileSync(path.join(dir, `${it.g}-${it.code}.png`), a.png()); return a; });
  // ảnh tổng: mỗi mã một hàng, khung đầu mỗi động tác ×3
  const rows = items.map((it) => { const k = Math.max(1, Math.min(3, Math.floor(96 / Math.max(it.w, it.h)))); return { it, k, w: 8 + it.anims.length * (it.w * k + 6) + 220, h: Math.max(it.h * k, 12) + 10 }; });
  const W = Math.max(400, ...rows.map((r) => r.w)), H = rows.reduce((s, r) => s + r.h, 4);
  const tong = new Anh(W, H, [23, 17, 12, 255]);
  let y = 4;
  for (const r of rows) {
    chu(tong, 4, y + 2, r.it.k, 2, VANG);
    r.it.anims.forEach((a, i) => veKhung(tong, K, a.frames[0], 220 + i * (r.it.w * r.k + 6), y, r.k));
    y += r.h;
  }
  fs.writeFileSync(path.join(dir, 'tong-quan.png'), tong.png());
  return anh.length;
}

// ---------------------------------------------------------------- đọc spec
function docTep(p) {
  const st = fs.statSync(p);
  const files = st.isDirectory() ? fs.readdirSync(p).filter((f) => f.endsWith('.json')).sort().map((f) => path.join(p, f)) : [p];
  const list = [], loi = [];
  for (const f of files) {
    let j;
    try { j = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { loi.push({ ma: 'E_SPEC_JSON', msg: `${path.relative(process.cwd(), f)}: JSON hỏng — ${e.message}` }); continue; }
    const l = Array.isArray(j) ? j : j && Array.isArray(j.ma) ? j.ma : j && typeof j.ma === 'string' ? [j] : null;
    if (!l) loi.push({ ma: 'E_SPEC', msg: `${path.relative(process.cwd(), f)}: cần { "ma": [ … ] }, mảng mã hoặc một mã { "ma": "nhóm/mã" }` });
    else list.push(...l);
  }
  return { list, loi };
}
function inLoi(loi) { for (const l of loi) console.error(`${l.ma}: ${l.msg}`); }

// ---------------------------------------------------------------- nạp vào game: nguồn + build-pixel
function nap(K, items, o) {
  const src = path.resolve(o.src || path.join(ROOT, 'tools/pixel/src')), goc = path.resolve(o.goc || ROOT);
  const loi = [];
  for (const it of items) { const f = path.join(src, it.g, it.code + '.txt'); if (fs.existsSync(f) && !o.ghiDe) loi.push({ ma: 'E_NAP_TON_TAI', msg: `${path.relative(process.cwd(), f)} đã có (bản vẽ tay?) — thêm --ghi-de nếu chắc chắn thay` }); }
  if (loi.length) return { loi };
  const cu = new Map();   // nội dung cũ (--ghi-de) để trả lại khi build lỗi — không để nguồn dở dang
  for (const it of items) { const f = path.join(src, it.g, it.code + '.txt'); cu.set(f, fs.existsSync(f) ? fs.readFileSync(f) : null); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, K.nguonTxt(it) + '\n'); }
  const r = spawnSync(process.execPath, [path.join(ROOT, 'tools/build-pixel.js'), '--strict', '--src', src, '--out', goc, '--quiet'], { encoding: 'utf8' });
  if (r.status) {
    for (const [f, d] of cu) { if (d) fs.writeFileSync(f, d); else fs.rmSync(f, { force: true }); }
    return { loi: [{ ma: 'E_BUILD', msg: 'tools/build-pixel.js --strict báo lỗi (đã gỡ nguồn vừa ghi):\n' + r.stdout + r.stderr }] };
  }
  return { loi: [], files: items.map((it) => path.relative(ROOT, path.join(src, it.g, it.code + '.txt'))) };
}

// ---------------------------------------------------------------- bộ mẫu input → output (tools/pixel/mau/<nhóm>/)
async function dungBoMau(K, dir, chi) {
  const specs = [];
  for (const g of fs.readdirSync(dir).sort()) { const d = path.join(dir, g); if (fs.statSync(d).isDirectory()) for (const f of fs.readdirSync(d).sort()) if (f.endsWith('.spec.json') && (!chi || f.includes(chi))) specs.push(path.join(d, f)); }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 've-pixel-mau-'));
  const ketQua = [], loi = [];
  try {
    for (const f of specs) {
      const sp = JSON.parse(fs.readFileSync(f, 'utf8')), base = f.replace(/\.spec\.json$/, '');
      const r = K.tuSpec(sp);
      if (r.loi.length) { loi.push(...r.loi.map((l) => ({ ...l, msg: path.basename(f) + ': ' + l.msg }))); continue; }
      const it = r.it;
      const grids = it.anims.flatMap((a) => a.frames);
      fs.writeFileSync(base + '.png', Buffer.from(await K.encodePNG(grids, it.w, it.h)));
      let lech = null;
      if (sp.so_sanh) {
        // bản vẽ tay: dựng nguồn trong thư viện bằng chính tools/build-pixel.js
        const [g, c] = sp.so_sanh.split('/'), sd = path.join(tmp, 'src', g);
        fs.mkdirSync(sd, { recursive: true }); fs.writeFileSync(path.join(sd, c + '.txt'), K.TV[sp.so_sanh].src);
        const b = spawnSync(process.execPath, [path.join(ROOT, 'tools/build-pixel.js'), '--nhap', '--src', path.join(tmp, 'src'), '--out', path.join(tmp, 'out'), '--quiet', sp.so_sanh], { encoding: 'utf8' });
        const png = path.join(tmp, 'out/assets/pixel', sp.so_sanh + '.png');
        if (b.status || !fs.existsSync(png)) { loi.push({ ma: 'E_BUILD', msg: `${path.basename(f)}: không dựng được bản vẽ tay ${sp.so_sanh}: ${b.stderr}` }); continue; }
        fs.copyFileSync(png, base + '-goc.png');
        const goc = K.dungMau(sp.so_sanh);
        lech = K.soSanh(it, goc);
      }
      const a = anhMa(K, it, heSo(it)); fs.writeFileSync(base + '-xem.png', a.png());
      ketQua.push({ f: path.relative(ROOT, f), it, lech, nguong: sp.nguong, so_sanh: sp.so_sanh, sp });
    }
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
  // ảnh tổng: mỗi mẫu một hàng — vẽ tay (trái) | tool sinh (phải), khung đầu mỗi động tác
  if (ketQua.length) {
    const rows = ketQua.map((r) => { const k = Math.max(1, Math.min(3, Math.floor(72 / Math.max(r.it.w, r.it.h)))); const goc = r.so_sanh ? K.dungMau(r.so_sanh) : null; return { ...r, k, goc, h: Math.max(r.it.h * k, 12) + 12 }; });
    const cw = (it, k) => it.anims.length * (it.w * k + 4);
    const W = Math.max(...rows.map((r) => 300 + (r.goc ? cw(r.goc, r.k) + 16 : 0) + cw(r.it, r.k))) + 8, H = rows.reduce((s, r) => s + r.h, 20);
    const t = new Anh(W, H, [23, 17, 12, 255]);
    chu(t, 4, 4, 'mau: ve tay (trai) | tool sinh (phai)', 2, CHU);
    let y = 20;
    for (const r of rows) {
      chu(t, 4, y + 2, path.basename(r.f, '.spec.json'), 2, VANG);
      if (r.lech !== null) chu(t, 4, y + 16, `lech ${(r.lech * 100).toFixed(1)}%`, 2, CHU);
      let x = 300;
      if (r.goc) { r.goc.anims.forEach((a, i) => veKhung(t, K, a.frames[0], x + i * (r.goc.w * r.k + 4), y, r.k)); x += cw(r.goc, r.k) + 16; }
      r.it.anims.forEach((a, i) => veKhung(t, K, a.frames[0], x + i * (r.it.w * r.k + 4), y, r.k));
      y += r.h;
    }
    fs.writeFileSync(path.join(dir, 'tong-quan.png'), t.png());
  }
  return { ketQua, loi };
}

// ---------------------------------------------------------------- main
async function main(argv) {
  const has = (f) => argv.includes(f), val = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };
  const K = loadCore();
  if (has('--thu-vien')) {
    const q = argv[argv.indexOf('--thu-vien') + 1], loai = val('--loai');
    if (q && K.TV[q]) { const s = K.mauTV(q); console.log(`${q} — ${s.name} ${s.size.join('x')} (${K.TV[q].nguon})\nđộng tác: ${s.order.map((a) => `${a} ${s.frames.filter((f) => f.anim === a).length}`).join(' · ')}\nbộ phận: ${Object.entries(s.parts).map(([n, r]) => `${n} [${K.loaiPart(n)} ${r[0].length}x${r.length}]`).join(', ')}`); return 0; }
    if (loai) { for (const p of K.boPhanTV(loai).filter((p) => !q || q.startsWith('--') || p.ref.startsWith(q))) console.log(`${p.ref}  ${p.w}x${p.h}`); return 0; }
    for (const k of Object.keys(K.TV).filter((k) => !q || q.startsWith('--') || k.startsWith(q))) console.log(`${k}  ${K.TV[k].nguon}`);
    return 0;
  }
  if (has('--mau')) {
    const dir = path.resolve(val('--mau-dir') || path.join(ROOT, 'tools/pixel/mau'));
    const r = await dungBoMau(K, dir, val('--chi'));
    inLoi(r.loi);
    for (const k of r.ketQua) console.log(`  ${k.f}: ${k.it.k} ${k.it.anims.map((a) => a.name + ' ' + a.frames.length).join(' · ')}${k.lech !== null ? ` · lệch vẽ tay ${(k.lech * 100).toFixed(2)}%${k.nguong != null ? (k.lech <= k.nguong ? ' ≤ ' : ' > ') + (k.nguong * 100) + '%' : ' (chỉ tham khảo)'}` : ''}`);
    const qua = r.ketQua.filter((k) => k.nguong != null && k.lech > k.nguong);
    if (qua.length) console.error(`E_LECH: ${qua.length} mẫu lệch quá ngưỡng`);
    console.log(`ve-pixel --mau: ${r.ketQua.length} mẫu → ${path.relative(process.cwd(), dir)}/ (tong-quan.png)`);
    return r.loi.length || qua.length ? 1 : 0;
  }
  const spec = val('--spec');
  if (!spec) { console.error('Cách dùng: node tools/ve-pixel.js --spec <file.json|thư mục> [--out goi-pixel.zip] [--xem <thư mục>] [--nap [--ghi-de]]\n           node tools/ve-pixel.js --mau · --thu-vien [nhóm/mã] [--loai vk]   (xem docs/pixel/SPEC.md)'); return 2; }
  if (!fs.existsSync(spec)) { console.error(`E_SPEC: không thấy ${spec}`); return 2; }
  const t = docTep(spec);
  docAnh(K, t.list);
  const r = K.docSpec(t.list);
  const loi = [...t.loi, ...r.loi];
  if (loi.length) { inLoi(loi); console.error(`ve-pixel: ${loi.length} lỗi — chưa ghi gì.`); return 1; }
  const items = r.items;
  for (const it of items) { const w = K.kiemTra(it).W; console.log(`  ✓ ${it.k} ${it.w}x${it.h}: ${it.anims.map((a) => a.name + ' ' + a.frames.length).join(' · ')}${w.length ? '  ! ' + w.join('; ') : ''}`); }
  const out = val('--out');
  if (out) { const z = await K.goiZip(items); fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true }); fs.writeFileSync(out, Buffer.from(z.data)); console.log(`  → ${out} (${z.n} mã, ${(z.data.length / 1024).toFixed(1)} KB)`); }
  const xd = val('--xem');
  if (xd) { const n = xem(K, items, xd); console.log(`  → ${xd}/ (${n} ảnh mã + tong-quan.png)`); }
  if (has('--nap')) {
    const n = nap(K, items, { src: val('--src'), goc: val('--goc'), ghiDe: has('--ghi-de') });
    if (n.loi.length) { inLoi(n.loi); return n.loi[0].ma === 'E_BUILD' ? 2 : 1; }
    console.log(`  → nạp vào game: ${n.files.join(', ')} + build-pixel (assets/pixel, js/pixel, js/asset-list.js) — commit cả nguồn lẫn file sinh ra`);
  }
  if (!out && !xd && !has('--nap')) console.log('  (spec hợp lệ — thêm --out / --xem / --nap để ghi kết quả)');
  return 0;
}
if (require.main === module) main(process.argv.slice(2)).then((c) => process.exit(c), (e) => { console.error(e.stack || e); process.exit(2); });
module.exports = { main, loadCore };
