// Chạy kiểm cả 7 trang: bản cũ (cổng 8766) và bản mới (cổng 8765), ảnh nền đều và ảnh có 2 ô nền lạ.
const lib = require('./lib.js'), D = require('./do.js'), Qm = require('./quai.js'), fs = require('fs');
const HONG = '#FA8FAD', NGA = '#F2E9E2';
const boQ = (so) => { const b = []; so.forEach((n, r) => { for (let c = n; c < 8; c++) b.push(r * 8 + c); }); return b; };
const TRANG = {
  'tach-quai': { kieu: 'q', sel: 'chonQuai', idx: 0, lo: 'quái đầu danh sách, lưới 8 × 6', cfg: { W: 1536, H: 1024, C: 8, R: 6, n: 48, bo: boQ([6, 6, 4, 6, 4, 8]), bg: '#FF00FF' }, odd: { 4: HONG, 47: NGA } },
  'tach-anh-hung': { kieu: 'q', sel: 'chonNV', idx: 0, lo: 'em bé đầu danh sách, lưới 8 × 7', cfg: { W: 1536, H: 1344, C: 8, R: 7, n: 56, bo: boQ([6, 6, 4, 6, 4, 8, 6]), bg: '#FF00FF' }, odd: { 4: HONG, 47: NGA } },
  'tach-do': { kieu: 'd', lo: 'tp-hats', cfg: { W: 1536, H: 1024, C: 5, R: 3, n: 13, bg: '#FF00FF' }, odd: { 4: HONG, 12: NGA } },
  'tach-giao-dien': { kieu: 'd', lo: 'nut', cfg: { W: 1536, H: 1024, C: 5, R: 4, n: 18, bg: '#FF00FF' }, odd: { 4: HONG, 12: NGA } },
  'tach-giao-dien-nho': { kieu: 'd', trang: 'tach-giao-dien', lo: 'nho', cfg: { W: 1536, H: 1024, C: 6, R: 5, n: 30, bg: '#FF00FF' }, odd: { 4: HONG, 12: NGA } },
  'tach-lang': { kieu: 'd', lo: 'dao-cu', cfg: { W: 1536, H: 1024, C: 5, R: 3, n: 12, bg: '#FF00FF' }, odd: { 4: HONG, 10: NGA } },
  'tach-phong': { kieu: 'd', lo: 'vat', cfg: { W: 1536, H: 1024, C: 6, R: 3, n: 18, bg: '#FF00FF' }, odd: { 4: HONG, 12: NGA } },
  'tach-hieu-ung': { kieu: 'h', idx: 0, mep: 'mem', lo: 'hiệu ứng đầu danh sách, 1 hàng 6 khung, mép Mềm', cfg: { W: 1536, H: 320, C: 6, R: 1, n: 6, bg: '#FF00FF' }, odd: { 1: HONG, 3: NGA } },
  'tach-hieu-ung-sac': { kieu: 'h', idx: 0, mep: 'sac', lo: 'hiệu ứng đầu danh sách, 1 hàng 6 khung, mép Sắc', cfg: { W: 1536, H: 320, C: 6, R: 1, n: 6, bg: '#FF00FF' }, odd: { 1: HONG, 3: NGA } },
};
(async () => {
  const S = __dirname, b = await lib.mo(), chi = process.argv[2] ? process.argv[2].split(',') : Object.keys(TRANG), KQ = {};
  for (const t of chi) {
    const T = TRANG[t], ra = (KQ[t] = { lo: T.lo, odd: T.odd, luoi: T.cfg.C + '×' + T.cfg.R });
    const anh = {};
    for (const [a, o] of [['deu0', { ...T.cfg, noise: 0 }], ['deu', { ...T.cfg, noise: 4 }], ['la', { ...T.cfg, noise: 4, odd: T.odd }]]) anh[a] = { png: `${S}/anh/${t}-${a}.png`, that: await lib.dung(b, o, `${S}/anh/${t}-${a}.png`) };
    for (const [ten, base] of [['cu', 'http://localhost:8766'], ['moi', 'http://localhost:8765']]) for (const a of ['deu0', 'deu', 'la']) {
      const tuy = { chup: `${S}/kq/${t}-${ten}-${a}.png`, chup2: `${S}/kq/${t}-${ten}-${a}-kq.png`, mep: T.mep };
      const k = T.kieu === 'd' ? await D.chay(b, base, T.trang || t, T.lo, anh[a].png, tuy) : T.kieu === 'q' ? await Qm.chayQ(b, base, t, T.sel, T.idx, anh[a].png, tuy) : await Qm.chayH(b, base, T.idx, anh[a].png, tuy);
      const that = anh[a].that, so = k.mon.map((m) => { const q = that[m.i]; return { o: m.i + 1, trongO: m.x0 >= q.ox0 && m.y0 >= q.oy0 && m.x1 <= q.ox1 && m.y1 <= q.oy1, lech: Math.max(Math.abs(m.x0 - q.x0), Math.abs(m.y0 - q.y0), Math.abs(m.x1 - q.x1), Math.abs(m.y1 - q.y1)), tl: +(m.n / q.n).toFixed(3) }; });
      const hong = so.filter((s) => !s.trongO || s.lech > 4 || s.tl > 1.03 || s.tl < 0.95);
      ra[ten + '-' + a] = { co: k.co, tong: k.tong, the: k.kiem.the, sha: lib.sha(k.xuat), dai: k.xuat.length, hong, so, loiTrang: k.loiTrang, ghi: k.kiem.ds.filter((x) => /nền khác/.test(x)), kiem: k.kiem.ds, xuat: k.xuat };
      console.log(t, ten, a, `tìm ${k.co}/${k.tong}`, k.kiem.the, 'xuất', lib.sha(k.xuat), k.xuat.length, 'lỗi trang', k.loiTrang.length, '| hình hỏng:', hong.map((s) => `ô${s.o}(${s.trongO ? '' : 'ngoài ô,'}lệch ${s.lech},tl ${s.tl})`).join(' ') || 'không', '|', ra[ten + '-' + a].ghi.join(''));
    }
    for (const a of ['deu0', 'deu']) { ra['giong-' + a] = ra['cu-' + a].xuat === ra['moi-' + a].xuat; console.log(t, a, 'tệp xuất cũ = mới từng byte:', ra['giong-' + a], '(' + ra['moi-' + a].dai + ' ký tự)'); }
    for (const k in ra) if (ra[k] && ra[k].xuat) delete ra[k].xuat;
  }
  const f = `${S}/kq/ket-qua.json`, cu = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f)) : {};
  fs.writeFileSync(f, JSON.stringify({ ...cu, ...KQ }, null, 1));
  await b.close();
})();
