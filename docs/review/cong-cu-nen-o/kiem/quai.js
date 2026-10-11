// Kiểm trang Quái / Anh hùng (tấm 8 cột) và trang Hiệu ứng (một hàng khung)
const lib = require('./lib.js');
exports.chayQ = async (b, base, trang, sel, idx, png, tuy) => {
  const p = await lib.moTrang(b, `${base}/tools/${trang}/index.html`);
  await p.selectOption('#' + sel, String(idx)); await p.waitForTimeout(200);
  await p.evaluate(() => { window.__kq = {}; window.__tep = [];
    const tt = tuTim; window.tuTim = (...a) => { const k = tt(...a); window.__kq.k = k; window.__kq.W = a[0].W; window.__kq.H = a[0].H; return k; };
    window.taiXuong = (ten, blob) => { blob.text().then((t) => window.__tep.push([ten, t])); }; });
  if (tuy && tuy.truoc) await p.evaluate(tuy.truoc);
  await p.setInputFiles('#chonAnh', png);
  await p.waitForFunction(() => window.__kq.k, null, { timeout: 90000 });
  await p.waitForTimeout(500);
  const kq = await p.evaluate(() => { const k = window.__kq.k, mon = (k.khung || []).map(({ r, c, f }) => { const h = (k.hinh || {})[r + ',' + c]; let n = 0; if (h) for (let j = 3; j < h.px.length; j += 4) if (h.px[j]) n++;
      return { i: r * 8 + c, x0: f.x0, y0: f.y0, x1: f.x1, y1: f.y1, n }; });
    return { tong: SO.reduce((a, b) => a + b, 0), co: mon.length, mon, loi: k.loi || [], ghi: k.ghi || [] }; });
  kq.kiem = await lib.kiemDs(p);
  if (tuy && tuy.chup) { await p.locator('#cvGoc').scrollIntoViewIfNeeded(); await p.locator('#cvGoc').screenshot({ path: tuy.chup }); }
  if (tuy && tuy.chup2) { await p.locator('#cvTam').scrollIntoViewIfNeeded(); await p.locator('#cvTam').screenshot({ path: tuy.chup2 }); }
  await p.click('#nutTaiJson'); await p.waitForTimeout(2500);
  kq.xuat = JSON.stringify(await p.evaluate(() => window.__tep.sort()));
  kq.soTep = await p.evaluate(() => window.__tep.length);
  kq.loiTrang = p.loi; await p.context().close(); return kq;
};
exports.chayH = async (b, base, idx, png, tuy) => {
  const p = await lib.moTrang(b, `${base}/tools/tach-hieu-ung/index.html`);
  await p.selectOption('#chonHu', String(idx)); await p.waitForTimeout(200);
  if (tuy && tuy.mep) await p.evaluate((v) => { document.getElementById('kieuMep').value = v; }, tuy.mep);
  await p.evaluate(() => { window.__kq = {}; window.__tep = [];
    const tn = tachNen; window.tachNen = (...a) => { const r = tn(...a); window.__kq.P = r.P; window.__kq.W = a[0].W; window.__kq.H = a[0].H; return r; };
    const tk = timKhung; window.timKhung = (...a) => { const K = tk(...a); window.__kq.K = K; return K; };
    window.taiXuong = (ten, blob) => { blob.text().then((t) => window.__tep.push([ten, t])); }; });
  await p.setInputFiles('#chonAnh', png);
  await p.waitForFunction(() => window.__kq.K, null, { timeout: 90000 });
  await p.waitForTimeout(500);
  const kq = await p.evaluate(() => { const { K, P, W } = window.__kq;
    const mon = K.o.map((c, i0) => { const i = Math.floor(((c.x0 + c.x1) / 2 / W) * Q.so); let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0; for (let y = c.y0 + 10; y <= c.y1 - 10; y++) for (let x = c.x0 + 10; x <= c.x1 - 10; x++) if (P[(y * W + x) * 4 + 3] >= 128) { n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      return { i, x0, y0, x1, y1, n }; });
    return { tong: Q.so, co: mon.filter((m) => m.n > 0).length, mon, loi: K.loi, ghi: K.ghi }; });
  kq.kiem = await lib.kiemDs(p);
  if (tuy && tuy.chup) { await p.locator('#cvGoc').scrollIntoViewIfNeeded(); await p.locator('#cvGoc').screenshot({ path: tuy.chup }); }
  if (tuy && tuy.chup2) { await p.locator('#cvTam').scrollIntoViewIfNeeded(); await p.locator('#cvTam').screenshot({ path: tuy.chup2 }); }
  await p.click('#nutTaiJson'); await p.waitForTimeout(2500);
  kq.xuat = JSON.stringify(await p.evaluate(() => window.__tep.sort()));
  kq.soTep = await p.evaluate(() => window.__tep.length);
  kq.loiTrang = p.loi; await p.context().close(); return kq;
};
