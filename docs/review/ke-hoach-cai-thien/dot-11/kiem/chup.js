// Chụp ảnh cho báo cáo Đợt 11. node chup.js <trang mới> <trang cũ> <thư mục ảnh thử> <thư mục ra>
const { chromium } = require('playwright');
const [MOI, CU, ANH, RA] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const mo = async (tep, vp, dsf) => { const c = await b.newContext({ viewport: vp, deviceScaleFactor: dsf || 1 }); const p = await c.newPage(); await p.route(/^https?:/, (r) => r.abort()); await p.goto('file://' + tep); return p; };
  const chon = (p, v) => p.evaluate((v) => { const o = document.getElementById('chonHu'); o.value = v; o.dispatchEvent(new Event('change')); }, String(v));
  const nap = async (p, png) => { await p.setInputFiles('#chonAnh', png); await p.waitForFunction(() => !document.getElementById('buoc3').hidden); await p.waitForTimeout(700); };
  // SAU: trang mới, lô gộp 4 hàng (máy tính)
  let p = await mo(MOI, { width: 1100, height: 1200 });
  await p.evaluate(() => { document.querySelector('#oPrompt').closest('details').open = true; });
  await p.screenshot({ path: RA + '/sau-buoc-1-lo-gop.png', clip: { x: 0, y: 0, width: 1100, height: 620 } });
  await nap(p, ANH + '/lo-4x4.png'); await p.evaluate(() => { document.querySelector('#oPrompt').closest('details').open = false; });
  await p.evaluate(() => chonHang(2)); await p.waitForTimeout(400);
  await p.screenshot({ path: RA + '/sau-lo-gop-4-hang.png', fullPage: true });
  await nap(p, ANH + '/lo-4x4-hang-3-trong.png'); await p.evaluate(() => chonHang(2)); await p.waitForTimeout(300);
  await p.locator('#buoc3').screenshot({ path: RA + '/sau-lo-gop-hang-hong.png' });
  // danh sách ô chọn (ô chọn của trình duyệt không chụp được khi mở, nên in danh sách ra một khung)
  await p.evaluate(() => { const o = document.getElementById('chonHu'), d = document.createElement('div'); d.id = 'inDs'; d.style.cssText = 'position:absolute;left:0;top:0;z-index:99;width:760px;background:#1a120a;color:#fff0c4;font:500 13px/1.55 system-ui;padding:14px;border:2px solid #a8752f';
    d.innerHTML = '<b style="color:#f6dc92">Danh sách trong ô chọn hiệu ứng (bước 1)</b>' + [...o.children].map((g) => `<div style="color:#f6dc92;font-weight:700;margin-top:8px">${g.label}</div>` + [...g.children].slice(0, 16).map((x) => `<div style="padding-left:14px">${x.textContent}</div>`).join('') + (g.children.length > 16 ? `<div style="padding-left:14px;color:#a9c2b4">… (còn ${g.children.length - 16} mục lẻ nữa, như cũ)</div>` : '')).join(''); document.body.appendChild(d); });
  await p.locator('#inDs').screenshot({ path: RA + '/sau-o-chon-nhom-lo-gop.png' });
  // SAU: iPhone
  p = await mo(MOI, { width: 390, height: 844 }, 2);
  await nap(p, ANH + '/lo-4x4.png');
  await p.screenshot({ path: RA + '/sau-lo-gop-iphone.png', fullPage: true });
  // TRƯỚC: trang cũ, một dải lẻ
  p = await mo(CU, { width: 1100, height: 1200 });
  const i = await p.evaluate(() => HU.findIndex((q) => q.ma === 'hu-dan-bot')); await chon(p, i); await nap(p, ANH + '/dai-1.png');
  await p.screenshot({ path: RA + '/truoc-gen-le-1-dai.png', fullPage: true });
  await b.close();
})();
