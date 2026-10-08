// Bệ đặt tướng (nen/de-tuong-*, 32×32) — VẼ LẠI tay, thiết kế docs/pixel/THIET-KE-LAI.md mục 2.
// Bệ đá trụ tròn nhìn 3/4: mặt trên elip sáng (khắc vành trống đồng), thành bệ tối, viền 1px. Trạng thái đổi màu vành / thêm chi tiết.
// Chạy: node tools/pixel/ve-lai/de.js [--xem DIR]
const { Ve, ghi, png } = require('./ve');

// mat: [tối, gốc, sáng] mặt bệ · thanh: [tối, gốc] thành bệ · vanh: màu vành khắc
function be(o) {
  const v = new Ve(32, 32), cx = 15.5, cy = 14, rx = 13, ry = 7.5, cao = o.cao || 5;
  const [mt, mg, ms] = o.mat, [tt, tg] = o.thanh;
  // thành bệ (trụ) + đáy
  v.ell(cx, cy + cao, rx, ry, tt); v.rect(Math.ceil(cx - rx), cy, rx * 2, cao, tg);
  v.ell(cx, cy + cao - 1, rx, ry, tg);
  for (let x = 3; x < 29; x += 4) v.vl(x, Math.round(cy + Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2)) * ry) + 1, Math.round(cy + cao + Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2)) * ry) - 1, tt);   // mạch đá
  // mặt trên
  v.ell(cx, cy, rx, ry, mg);
  const m = new Ve(32, 32); m.ell(cx, cy, rx, ry, 1);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) if (m.g[y][x]) {
    const d = ((x - cx) / rx) * 0.6 + ((y - cy) / ry) * 0.8;
    if (d < -0.75) v.p(x, y, ms); else if (d > 0.7) v.p(x, y, mt);
  }
  // vành khắc trống đồng + chấm
  v.ring(cx, cy, rx - 3, ry - 2, o.vanh);
  for (let k = 0; k < 12; k++) { const a = (k * Math.PI) / 6; v.p(cx + Math.cos(a) * (rx - 5.5), cy + Math.sin(a) * (ry - 3.6), o.cham || o.vanh); }
  v.p(cx - 0.5, cy, o.tam || o.vanh); v.p(cx + 0.5, cy, o.tam || o.vanh);
  if (o.them) o.them(v, cx, cy, rx, ry);
  v.outline();
  return v;
}
const DA = { mat: ['sat', 'sat-sang', 'bac'], thanh: ['sat-toi', 'sat'] };
const DS = {
  'de-tuong-thuong': ['Bệ đá', 'bệ đá xám, vành khắc đồng', { ...DA, vanh: 'dong', cham: 'dong-sang' }],
  'de-tuong-chon': ['Bệ đang chọn', 'vành vàng nghệ sáng + 4 góc ngắm', { ...DA, vanh: 'vang-nghe', cham: 'vang-sang', tam: 'vang-sang',
    them: (v) => { for (const [x, y, f] of [[1, 3, 0], [27, 3, 1], [1, 25, 2], [27, 25, 3]]) v.stamp([['vvv', 'v..', 'v..'], ['vvv', '..v', '..v'], ['v..', 'v..', 'vvv'], ['..v', '..v', 'vvv']][f], { v: 'vang-sang' }, x + (f % 2 ? 1 : 0), y); } }],
  'de-tuong-san-sang': ['Bệ sẵn sàng', 'vành ngọc sáng: đặt được tướng', { ...DA, vanh: 'ngoc-sang', cham: 'troi', tam: 'troi' }],
  'de-tuong-ngap': ['Bệ ngập nước', 'bệ chìm nửa trong nước, gợn sóng quanh chân', { mat: ['cham-sang', 'sat', 'sat-sang'], thanh: ['cham-toi', 'cham'], vanh: 'nuoc-sang', cao: 3,
    them: (v, cx, cy) => { v.ell(cx, cy + 6, 15, 5, 'nuoc'); v.ell(cx, cy, 13, 7.5, 'sat'); v.ring(cx, cy, 10, 5.5, 'nuoc-sang'); v.p(cx - 0.5, cy, 'nuoc-sang'); v.p(cx + 0.5, cy, 'nuoc-sang');
      v.hl(2, 6, 21, 'troi'); v.hl(25, 29, 21, 'troi'); v.hl(9, 13, 25, 'nuoc-sang'); v.hl(19, 23, 25, 'nuoc-sang'); v.swap('sat', 'cham-sang', (x, y) => y > cy + 3); } }],
  'de-tuong-nui': ['Bệ núi', 'bệ đá cao do Sơn Tinh dựng, rêu phủ mép', { mat: ['reu-toi', 'reu', 'reu-sang'], thanh: ['dat-toi', 'dat'], vanh: 'dong-sang', cao: 9,
    them: (v) => { for (const [x, y] of [[4, 21], [9, 24], [22, 24], [27, 20]]) { v.p(x, y, 'dat-sang'); v.p(x + 1, y, 'dat-sang'); } } }],
  'de-tuong-co': ['Bệ cỏ', 'bệ đá viền cỏ', { mat: ['reu-toi', 'reu', 'reu-sang'], thanh: ['sat-toi', 'sat'], vanh: 'dong' }],
  'de-tuong-dat': ['Bệ đất', 'bệ đất nện', { mat: ['dat', 'dat-sang', 'cat'], thanh: ['dat-toi', 'dat'], vanh: 'dong-toi' }],
  'de-tuong-cat': ['Bệ cát', 'bệ đá cát', { mat: ['dat-sang', 'cat', 'vang-sang'], thanh: ['dat', 'dat-sang'], vanh: 'dong' }],
  'de-tuong-da': ['Bệ đá hang', 'bệ đá tối', { mat: ['sat-toi', 'sat', 'sat-sang'], thanh: ['vien', 'sat-toi'], vanh: 'ngoc' }],
  'de-tuong-gach': ['Bệ gạch', 'bệ gạch son', { mat: ['son-toi', 'son', 'son-sang'], thanh: ['son-toi', 'dat'], vanh: 'dong-sang' }],
};
module.exports = { be, DS };
if (require.main === module) {
  const xem = process.argv.indexOf('--xem') > 0 && process.argv[process.argv.indexOf('--xem') + 1];
  for (const [ma, [ten, mo, o]] of Object.entries(DS)) {
    const v = be(o);
    if (xem) { require('fs').mkdirSync(xem, { recursive: true }); png(v, `${xem}/${ma}.png`, 8, 'la'); }
    else console.log(ghi('nen', ma, ten, 'Bệ đặt tướng: ' + mo, v, { script: 'de' }));
  }
}
