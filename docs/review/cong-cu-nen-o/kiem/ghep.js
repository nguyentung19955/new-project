// Ghép ảnh kiểm: trái = bản cũ, phải = bản mới, cùng một ảnh lưới có 2 ô nền lạ.
const lib = require('./lib.js'), fs = require('fs');
const TEN = { 'tach-quai': 'Tách Quái', 'tach-anh-hung': 'Tách Anh Hùng', 'tach-do': 'Tách Đồ', 'tach-giao-dien': 'Tách Giao Diện', 'tach-giao-dien-nho': 'Tách Giao Diện (lô Biểu tượng nhỏ mới của phiên C2)', 'tach-lang': 'Tách Làng', 'tach-phong': 'Tách Phòng', 'tach-hieu-ung': 'Tách Hiệu Ứng (mép Mềm)', 'tach-hieu-ung-sac': 'Tách Hiệu Ứng (mép Sắc)' };
(async () => {
  const S = __dirname, b = await lib.mo(), KQ = JSON.parse(fs.readFileSync(S + '/kq/ket-qua.json')), ra = process.argv[2];
  const u = (f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
  for (const t in TEN) {
    const k = KQ[t], p = await b.newPage({ viewport: { width: 1500, height: 200 } });
    const cot = (ten, nhan, mau) => { const r = k[ten + '-la']; return `<div class="cot"><h2 style="color:${mau}">${nhan}: tìm ${r.co}/${r.tong} hình, ${r.hong.length ? r.hong.length + ' hình tách sai' : 'mọi hình tách đúng'}${r.ghi.length ? '<br><small>Trang ghi: “' + r.ghi[0] + '”</small>' : ''}</h2><img src="${u(`${S}/kq/${t}-${ten}-la.png`)}"><p>Kết quả tách:</p><div class="nen"><img src="${u(`${S}/kq/${t}-${ten}-la-kq.png`)}"></div></div>`; };
    await p.setContent(`<style>body{margin:0;padding:14px;background:#1c2024;color:#eee;font:15px/1.4 sans-serif}h1{font-size:20px;margin:0 0 10px}h2{font-size:16px;margin:0 0 8px;min-height:44px}.hang{display:flex;gap:14px}.cot{flex:1;min-width:0}img{max-width:100%;display:block;image-rendering:pixelated}.nen{background:#2e3a30;padding:6px}p{margin:8px 0 4px}small{color:#ddd;font-weight:normal}</style>
      <h1>${TEN[t]} · lưới ${k.luoi} · 2 ô có nền khác màu (hồng nhạt, trắng ngà) giữa tấm nền hồng tím, vạch đen dày 12 điểm</h1>
      <div class="hang">${cot('cu', 'TRƯỚC khi sửa', '#ff8a7a')}${cot('moi', 'SAU khi sửa', '#8fe08a')}</div>`);
    await p.waitForTimeout(300);
    await p.screenshot({ path: `${ra}/anh-kiem-${t}.png`, fullPage: true }); await p.close();
  }
  await b.close();
})();
