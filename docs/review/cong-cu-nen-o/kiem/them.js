// Kiểm thêm trên trang Tách Đồ (lô Mũ 5 × 3): các tình huống khó. Mỗi tình huống: ảnh nền đều (cũ = mới từng byte?) và ảnh có ô nền lạ (mới tách đúng?).
const lib = require('./lib.js'), D = require('./do.js'), fs = require('fs');
const HONG = '#FA8FAD', NGA = '#F2E9E2', G = { W: 1536, H: 1024, C: 5, R: 3, n: 13, bg: '#FF00FF', noise: 4 };
const TH = [
  ['Lưới kẻ lệch 14 điểm so với lưới đều', { ...G, lech: 14 }, { 4: HONG, 12: NGA }],
  ['Hình cùng màu với nền ô (mũ hồng trên ô hồng, mũ trắng trên ô trắng ngà)', { ...G, than: { 4: '#f7a8b8', 12: '#f4efe6' } }, { 4: HONG, 12: NGA }],
  ['Nền chung xanh lá #00FF00', { ...G, bg: '#00FF00' }, { 4: HONG, 12: NGA }],
  ['Nền chung xanh dương #0000FF', { ...G, bg: '#0000FF' }, { 4: HONG, 12: NGA }],
  ['Nét kẻ mảnh 4 điểm', { ...G, line: 4 }, { 4: HONG, 12: NGA }],
  ['Không có khung viền ngoài', { ...G, khongVien: true }, { 4: HONG, 12: NGA }],
  ['Ô nền lạ là ô trống (ô 14) và ô góc (ô 1)', G, { 13: HONG, 0: NGA }],
  ['Bốn ô nền lạ, hai ô cùng màu', G, { 1: HONG, 7: HONG, 9: NGA, 11: '#BFE8F2' }],
  ['Ảnh không nhiễu (màu phẳng tuyệt đối)', { ...G, noise: 0 }, { 4: HONG, 12: NGA }],
  ['Ảnh nhiễu mạnh (±10)', { ...G, noise: 10 }, { 4: HONG, 12: NGA }],
  ['Hình to gần kín ô (chạm gần góc ô)', { ...G, co: 1.45 }, { 4: HONG, 12: NGA }],
  ['Ảnh nhỏ 1024 × 683', { ...G, W: 1024, H: 683 }, { 4: HONG, 12: NGA }],
];
(async () => {
  const S = __dirname, b = await lib.mo(), ra = [];
  for (let i = 0; i < TH.length; i++) { if (process.argv[2] && +process.argv[2] !== i) continue;
    const [ten, cfg, odd] = TH[i], fd = `${S}/anh/them-${i}-deu.png`, fl = `${S}/anh/them-${i}-la.png`;
    await lib.dung(b, cfg, fd); const that = await lib.dung(b, { ...cfg, odd }, fl);
    const cu = await D.chay(b, 'http://localhost:8766', 'tach-do', 'tp-hats', fd), moi = await D.chay(b, 'http://localhost:8765', 'tach-do', 'tp-hats', fd);
    const cuL = await D.chay(b, 'http://localhost:8766', 'tach-do', 'tp-hats', fl), la = await D.chay(b, 'http://localhost:8765', 'tach-do', 'tp-hats', fl, { chup: `${S}/kq/them-${i}.png` });
    const do_ = (k) => k.mon.map((m) => { const q = that[m.i]; return { o: m.i + 1, trongO: m.x0 >= q.ox0 && m.y0 >= q.oy0 && m.x1 <= q.ox1 && m.y1 <= q.oy1, lech: Math.max(Math.abs(m.x0 - q.x0), Math.abs(m.y0 - q.y0), Math.abs(m.x1 - q.x1), Math.abs(m.y1 - q.y1)), tl: +(m.n / q.n).toFixed(3) }; }).filter((s) => !s.trongO || s.lech > 4 || s.tl > 1.03 || s.tl < 0.95);
    const r = { ten, hongDeuCu: do_(cu).map((s) => s.o), giong: cu.xuat === moi.xuat, deu: `${moi.co}/${moi.tong}`, cuLa: `${cuL.co}/${cuL.tong}, hỏng ${do_(cuL).length}`, la: `${la.co}/${la.tong}`, hong: do_(la), ghi: la.kiem.ds.filter((x) => /nền khác/.test(x)).join(''), the: la.kiem.the, loi: la.loiTrang.length + moi.loiTrang.length };
    ra.push(r); console.log(JSON.stringify(r));
  }
  if (!process.argv[2]) fs.writeFileSync(`${S}/kq/them.json`, JSON.stringify(ra, null, 1)); await b.close();
})();
