// Chụp trang Tách Phòng trên màn hình cỡ điện thoại, đang chọn "Theo bảng màu Linh Khí" (ảnh minh hoạ cho báo cáo).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 430, height: 900 }, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8801/tools/tach-phong/index.html'); await p.waitForTimeout(800);
  await p.setInputFiles('#chonAnh', 'thu/tam-thu-kieu-chatgpt.png'); await p.waitForFunction(() => KQ.filter(Boolean).length > 0); await p.selectOption('#kieuGiam', 'bang'); await p.waitForTimeout(800);
  await p.locator('.tuy').screenshot({ path: process.argv[2] + '/cong-cu-o-chon.png' });
  await p.locator('#dsKiem').screenshot({ path: process.argv[2] + '/cong-cu-ket-qua-kiem.png' });
  await b.close();
})();
