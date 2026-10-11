// Kiểm họ trang Đồ / Giao diện / Làng / Phòng (mỗi ô một món)
const lib = require('./lib.js');
exports.chay = async (b, base, trang, lo, png, tuy) => {
  const p = await lib.moTrang(b, `${base}/tools/${trang}/index.html`);
  const iLo = await p.evaluate((id) => LO.findIndex((l) => l.id === id), lo); await p.selectOption('#chonLo', String(iLo)); await p.waitForTimeout(200);
  if (tuy && tuy.truoc) await p.evaluate(tuy.truoc);
  await p.setInputFiles('#chonAnh', png);
  await p.waitForFunction(() => !document.getElementById('buoc3').hidden, null, { timeout: 60000 });
  await p.waitForTimeout(500);
  const kq = await p.evaluate(() => {
    const ds = L.ds.map((m, i) => i).filter((i) => KQ[i]);
    const mon = ds.map((i) => { const K = KQ[i], s = K.src, g = K.g; let n = 0; for (let j = 3; j < s.px.length; j += 4) if (s.px[j]) n++;
      return { i, x0: g.x0, y0: g.y0, x1: g.x1, y1: g.y1, n, px: Array.from(s.px), w: s.w, h: s.h }; });
    let xuat = null;
    try { const hb = haiBan(ds); xuat = JSON.stringify(hb); } catch (e) { xuat = 'LỖI ' + e; }
    return { tong: L.ds.length, co: ds.length, mon, xuat, ghi: MAP.ghi, loi: MAP.loi, W: SEG.W, H: SEG.H };
  });
  kq.kiem = await lib.kiemDs(p); kq.loiTrang = p.loi;
  if (tuy && tuy.chup) { await p.locator('#cvGoc').scrollIntoViewIfNeeded(); await p.locator('#cvGoc').screenshot({ path: tuy.chup }); }
  if (tuy && tuy.chup2) { await p.locator('#dsMon').scrollIntoViewIfNeeded(); await p.locator('#dsMon').screenshot({ path: tuy.chup2 }); }
  if (tuy && tuy.chupKq) await p.screenshot({ path: tuy.chupKq, fullPage: true });
  await p.context().close();
  return kq;
};
// So hình tách được với hình thật: nằm trong ô, không dính nền
exports.soThat = (kq, that, odd) => {
  const ra = [];
  for (const m of kq.mon) {
    const t = that[m.i], trongO = m.x0 >= t.ox0 && m.y0 >= t.oy0 && m.x1 <= t.ox1 && m.y1 <= t.oy1;
    const lechKhung = Math.max(Math.abs(m.x0 - t.x0), Math.abs(m.y0 - t.y0), Math.abs(m.x1 - t.x1), Math.abs(m.y1 - t.y1));
    // điểm còn giữ màu nền lạ
    let dinh = 0; const mauLa = Object.values(odd || {}).map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
    ra.push({ i: m.i, trongO, lechKhung, tlDiem: +(m.n / t.n).toFixed(3) });
  }
  return ra;
};
