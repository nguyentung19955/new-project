// Bộ sinh nguồn icon kỹ năng Lô 28–33 (claude/pixel-ky-nang-2): node tools/pixel/src/ky-nang/_nguon/gen.js tools/pixel/src/ky-nang/_nguon/lo/l28.js …
// Ghi đè tools/pixel/src/ky-nang/<tướng>-<q|w|e|r>.txt. build-pixel bỏ qua thư mục này (chỉ đọc *.txt cấp nhóm).
// Sinh nguồn tools/pixel/src/ky-nang/<mã>.txt từ hình 18×18 (vật liệu tự đổ bóng 3 tông) + khung chung 24×24.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../../../../..');
const OUT = path.join(ROOT, 'tools/pixel/src/ky-nang');
// khung: k viền · h đồng sáng (trên-trái) · D đồng · d đồng tối (dưới-phải) · y đinh vàng · E vành ngũ hành · B nền
const KHUNG = [
'.kkkkkkkkkkkkkkkkkkkkkk.',
'khhhhhhhhhhyyhhhhhhhhhDk',
'khDDDDDDDDDDDDDDDDDDDDdk',
'khDEEEEEEEEEEEEEEEEEEDdk',
'khDEBBBBBBBBBBBBBBBBEDdk',
'khDEBBBBBBBBBBBBBBBBEDdk',
'khDEBBBBBBBBBBBBBBBBEDdk',
'khDEBBBBBBBBBBBBBBBBEDdk',
'khDEBBBBBBBBBBBBBBBBEDdk',
'khDEBBBBBBBBBBBBBBBBEDdk',
'khDEBBBBBBBBBBBBBBBBEDdk',
'kyDEBBBBBBBBBBBBBBBBEDyk',
'kyDEBBBBBBBBBBBBBBBBEDyk',
'khDEBBBBBBBBBBBBBBBBEDdk',
'khDEBBBBBBBBBBBBBBBBEDdk',
'khDEBBBBBBBBBBBBBBBBEDdk',
'khDEBBBBBBBBBBBBBBBBEDdk',
'khDEBBBBBBBBBBBBBBBBEDdk',
'khDEBBBBBBBBBBBBBBBBEDdk',
'khDEBBBBBBBBBBBBBBBBEDdk',
'khDEEEEEEEEEEEEEEEEEEDdk',
'khDDDDDDDDDDDDDDDDDDDDdk',
'kDddddddddddyydddddddddk',
'.kkkkkkkkkkkkkkkkkkkkkk.',
];
// hình 18×18 đặt tại (3,3): phủ cả vành E (x3..20) — vành chỉ lộ nơi hình để trống
const EL = {
  kim:  { E: 'sat-sang', B: 'sat-toi', ten: 'Kim' },
  moc:  { E: 'la-ma', B: 'la-toi', ten: 'Mộc' },
  thuy: { E: 'nuoc', B: 'cham-toi', ten: 'Thủy' },
  hoa:  { E: 'son-sang', B: 'son-toi', ten: 'Hỏa' },
  tho:  { E: 'dong-sang', B: 'dat-toi', ten: 'Thổ' },
};
// vật liệu: [tối, gốc, sáng] — tự đổ bóng (sáng mép trên/trái, tối mép dưới/phải)
const MAT = {
  m: ['sat-toi', 'sat', 'sat-sang'],   // sắt
  M: ['sat', 'sat-sang', 'bac'],       // bạc
  b: ['dong-toi', 'dong', 'dong-sang'],// đồng
  g: ['dong', 'vang-nghe', 'vang-sang'], // vàng
  f: ['son', 'lua', 'lua-sang'],       // lửa
  F: ['lua', 'lua-sang', 'vang-sang'], // lửa lõi
  r: ['son-toi', 'son', 'son-sang'],   // son đỏ
  w: ['cham', 'nuoc', 'nuoc-sang'],    // nước
  W: ['nuoc', 'nuoc-sang', 'troi'],    // bọt / băng
  j: ['cham', 'ngoc', 'ngoc-sang'],    // ngọc
  l: ['la-toi', 'la', 'la-ma'],        // lá
  L: ['la', 'la-ma', 'la-sang'],       // lá non
  e: ['dat-toi', 'dat', 'dat-sang'],   // đất / gỗ
  s: ['toi', 'sat', 'sat-sang'],       // đá xám
  u: ['reu-toi', 'reu', 'reu-sang'],   // núi rêu
  c: ['trang-xam', 'trang', 'sang'],   // trắng
  p: ['tim-toi', 'tim', 'tim-sang'],   // tím
  a: ['dat-sang', 'cat', 'vang-sang'], // rơm / tre khô
  n: ['da-toi', 'da', 'da-sang'],      // da
  x: ['khoi', 'toi', 'sat'],           // khói đen
  h: ['cham-toi', 'cham', 'cham-sang'],// chàm
};
// màu đơn (không đổ bóng)
const FIX = { '0': 'vien', '1': 'toi', '2': 'sang', '3': 'lua-sang', '4': 'vang-sang', '5': 'nuoc-sang', '6': 'troi',
  '7': 'bac', '8': 'son-sang', '9': 'la-sang', '*': 'vang-nghe', '+': 'lua', '~': 'nuoc', '^': 'ngoc-sang', '%': 'hong',
  '=': 'khoi', '!': 'tim-sang', '@': 'trang', '$': 'son', '&': 'dong-sang', '?': 'cat', ':': 'trang-xam', ';': 'cham-sang',
  '<': 'dat', '>': 'sat-sang', '"': 'la-ma', "'": 'dat-sang', '-': 'son-toi', ',': 'dong' };
function shade(grid) {
  const H = grid.length, W = grid[0].length, out = [];
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? '.' : grid[y][x];
  for (let y = 0; y < H; y++) { const row = []; for (let x = 0; x < W; x++) {
    const c = grid[y][x];
    if (c === '.' || c === ' ') { row.push(null); continue; }
    if (FIX[c]) { row.push(FIX[c]); continue; }
    const m = MAT[c]; if (!m) throw new Error('ký tự lạ ' + JSON.stringify(c));
    const up = at(x, y - 1) !== c, lf = at(x - 1, y) !== c, dn = at(x, y + 1) !== c, rt = at(x + 1, y) !== c;
    row.push(up ? m[2] : (dn || rt) ? m[0] : lf ? m[2] : m[1]);
  } out.push(row); }
  return out;
}
const CH = 'abcdefghijmnopqrstuvwxyzABCFGHIJKLMNOPQRSTUVWXYZ0123456789';
function build(ic, lo) {
  const g = ic.g; if (g.length !== 18 || g.some((r) => r.length !== 18)) throw new Error(ic.ma + ': lưới phải 18×18 ' + g.map(r=>r.length).join(','));
  const px = shade(g);
  // viền hình: ô trống kề (4 hướng) điểm hình → vien (trừ khi tắt)
  const H = 18, W = 18;
  if (ic.vien !== false) {
    const add = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!px[y][x]) {
      const n = [[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy]) => px[y+dy] && px[y+dy][x+dx] && px[y+dy][x+dx] !== 'vien' && !(ic.khongvien||'').includes(g[y+dy][x+dx]));
      if (n) add.push([x, y]);
    }
    add.forEach(([x, y]) => { px[y][x] = 'vien'; });
  }
  const el = EL[ic.el];
  const used = new Map(); const key = (name) => { if (!used.has(name)) used.set(name, CH[used.size]); return used.get(name); };
  const fk = { k: 'vien', h: 'dong-sang', D: 'dong', d: 'dong-toi', y: 'vang-nghe', E: el.E, B: el.B };
  const khung = KHUNG.map((r) => [...r].map((c) => c === '.' ? '.' : key(fk[c])).join(''));
  const hinh = px.map((r) => r.map((n) => n ? key(n) : '.').join(''));
  const lines = [];
  lines.push(`# Icon kỹ năng ${ic.ten} — ${ic.y}`);
  lines.push(`# Mô tả: ${ic.mota} · hành ${el.ten} (vành + nền màu hành, khung đồng chung icon kỹ năng)`);
  lines.push(`# Nguồn: docs/pixel/DANH-SACH.md ${lo} · ${ic.nguon}`);
  lines.push(`name: ${ic.ten}`, 'size: 24x24', 'colors:');
  for (const [n, c] of used) lines.push(`  ${c} = ${n}`);
  lines.push('part khung', ...khung, 'end', 'part hinh', ...hinh, 'end');
  lines.push('anim main fps=1 loop', 'frame main', '  use khung', '  use hinh 3 3', 'end', '');
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, ic.ma.replace('_', '-') + '.txt'), lines.join('\n'));
}
// bảng DANH-SACH: tên, nguồn
const ds = fs.readFileSync(path.join(ROOT, 'docs/pixel/DANH-SACH.md'), 'utf8');
function info(ma) {
  const ln = ds.split('\n').find((l) => l.startsWith('| `ky-nang/' + ma + '`'));
  if (!ln) throw new Error('không thấy ' + ma);
  const c = ln.split('|').map((s) => s.trim());
  return { ten: c[2], nguon: c[7] };
}
module.exports = { build, info };
if (require.main === module) {
  const files = process.argv.slice(2);
  for (const f of files) { const { lo, icons } = require(path.resolve(f));
    for (const ic of icons) { Object.assign(ic, info(ic.ma), { ...ic }); const i = info(ic.ma); ic.ten = i.ten; ic.nguon = i.nguon; build(ic, lo); }
    console.log(f, icons.length); }
}
