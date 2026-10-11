// Kiểm 2: chạy tấm thử qua Tách Phòng: bản trước đợt 4 (8802), bản mới "Tự do", bản mới "Theo bảng". Lưu ảnh kết quả + số đo.
const { chromium } = require('playwright'); const fs = require('fs');
const ANH = process.argv[2], RA = process.argv[3];
const lay = () => KQ.map((K, i) => K && { i, ma: L.ds[i].ma, w: K.out.w, h: K.out.h, px: Array.from(K.out.px), url: K.out.cv.toDataURL('image/png'), bm: K.out.bm || null, tep: JSON.stringify(phanTep(i, false, false)) }).filter(Boolean);
(async () => {
  const b = await chromium.launch(); const kq = {};
  for (const [ten, cong, kieu] of [['goc', 8802, null], ['tu-do', 8801, 'tu-do'], ['bang', 8801, 'bang']]) {
    const p = await b.newPage(); const loi = []; p.on('pageerror', (e) => loi.push(e.message));
    await p.goto(`http://localhost:${cong}/tools/tach-phong/index.html`); await p.waitForTimeout(800);
    await p.setInputFiles('#chonAnh', ANH); await p.waitForFunction(() => KQ.filter(Boolean).length > 0, null, { timeout: 20000 });
    if (kieu) { await p.selectOption('#kieuGiam', kieu); await p.waitForTimeout(500); }
    kq[ten] = { ds: await p.evaluate(lay), kiem: await p.evaluate(() => [...document.querySelectorAll('#dsKiem li')].map((l) => l.textContent)), loi };
    await p.close();
  }
  await b.close();
  const V = [0x14, 0x18, 0x2e];
  const dem = (d) => { const m = new Map(); let vien = 0, dac = 0; for (let i = 0; i < d.px.length; i += 4) if (d.px[i + 3]) { dac++; const k = (d.px[i] << 16) | (d.px[i + 1] << 8) | d.px[i + 2]; m.set(k, (m.get(k) || 0) + 1); if (d.px[i] === V[0] && d.px[i + 1] === V[1] && d.px[i + 2] === V[2]) vien++; } return { mau: m.size, vien, dac }; };
  // số cạnh (hai điểm kề nhau khác màu) = thước đo chi tiết còn lại
  const canh = (d) => { let n = 0; const k = (x, y) => { const i = (y * d.w + x) * 4; return d.px[i + 3] ? (d.px[i] << 16) | (d.px[i + 1] << 8) | d.px[i + 2] : -1; }; for (let y = 0; y < d.h; y++) for (let x = 0; x < d.w; x++) { if (x + 1 < d.w && k(x, y) !== k(x + 1, y)) n++; if (y + 1 < d.h && k(x, y) !== k(x, y + 1)) n++; } return n; };
  const so = { giong_tung_byte: true, hinh: [] };
  kq.goc.ds.forEach((g, j) => {
    if (!['gd-vat-ruong', 'gd-vat-ban-tho'].includes(g.ma)) { const t0 = kq['tu-do'].ds[j]; if (g.tep !== t0.tep) so.giong_tung_byte = false; so.hinh_khac_giong = (so.hinh_khac_giong || 0) + (g.tep === t0.tep ? 1 : 0); return; }
    const t = kq['tu-do'].ds[j], m = kq.bang.ds[j];
    const bang = g.tep === t.tep && g.px.length === t.px.length && g.px.every((v, i) => v === t.px[i]); if (!bang) so.giong_tung_byte = false;
    let alpha = 0; for (let i = 3; i < g.px.length; i += 4) if ((g.px[i] > 0) !== (m.px[i] > 0)) alpha++;
    so.hinh.push({ ma: g.ma, co: g.w + '×' + g.h, tu_do_giong_goc: bang, tu_do: Object.assign(dem(t), { canh: canh(t) }), theo_bang: Object.assign(dem(m), { canh: canh(m) }), bm: m.bm, diem_lech_hinh_bong: alpha });
    for (const [n, d] of [['tu-do', t], ['bang', m]]) fs.writeFileSync(`${RA}/${g.ma}-${n}.png`, Buffer.from(d.url.split(',')[1], 'base64'));
  });
  so.kiem_theo_bang = kq.bang.kiem; so.kiem_tu_do = kq['tu-do'].kiem; so.loi = { goc: kq.goc.loi, tu_do: kq['tu-do'].loi, bang: kq.bang.loi };
  fs.writeFileSync(`${RA}/so-do.json`, JSON.stringify(so, null, 1)); console.log(JSON.stringify(so, null, 1));
})();
