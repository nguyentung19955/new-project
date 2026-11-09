// TURRET MERGE — chụp hiệu ứng TÍCH TỤ (thay vòng xanh nạp chiêu, 09/11 — claude/demo-hop-tuong "chỉ 2 ụ bấm tay")
//   mỗi ụ một hàng: nạp 0.3 / 0.7 / 0.95 / đầy + ô thứ 5 = khoảnh khắc XẢ · dọc 390×844 (iPhone, DPR 3) · thêm 1 ảnh trận Black Hole + Chrono Throne + Hive Queen
// chạy (gốc repo): python3 -m http.server 8765 &  NODE_PATH=/opt/npm-tools/node_modules OUT=tests/tichtu/shots/ node tools/thap-chup-tichtu.js
'use strict';
const fs = require('fs');
const { chromium, devices } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/thap/', OUT = process.env.OUT || 'tests/tichtu/shots/';
const IDS = (process.env.IDS || 'blackhole,thacmana,chuato,overlord').split(',');
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(), errs = [];
  const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE + '?mode=solo&deck=blackhole,ngaithoigian,chuato,canon,lien&wave=12&mana=99999&nointro=1&notut=1', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length, null, { timeout: 60000 });
  await p.waitForTimeout(4500); // chờ màn tải biến mất
  const dung = (ban) => p.evaluate((ban) => {
    G.hang.length = 0; G.quai.length = 0; G.hu.length = 0; G.dan.length = 0; G.cho = 1e9; G.ketThuc = null; G.dung = false;
    const B = G.ban[0]; B.tim = 1e9; B.t.fill(null);
    for (const [o, id, sao, nap] of ban) { const T = sinhU(taoU(B, id, sao, o)); B.t[o] = T; T.nap = nap; if (id === 'chuato') T.bay = [{}, {}, {}]; }
    const p0 = G.duong[0];
    for (let i = 0; i < 6; i++) { const E = sinhQuai('bo', 0, p0.len * (0.1 + i * 0.05), 400); E.vao = 1; E.chan = 1e9; }
    document.querySelectorAll('#nd-gt,#tt').forEach(e => e.hidden = true);
  }, ban);
  const dungHinh = () => p.evaluate(() => { G.dung = true; }); // đứng hình nạp (vẽ vẫn chạy) — sau khi ụ hiện xong
  const giu = (ban) => p.evaluate((ban) => { const B = G.ban[0]; for (const [o, , , nap] of ban) if (B.t[o]) B.t[o].nap = nap; }, ban);
  await dung(IDS.map((id, i) => [i, id, 5, 0.5])); await p.waitForTimeout(3000); // khởi động: nạp ảnh các ụ (màn tải ảnh lần đầu)
  for (const id of IDS) {
    const ban = [[5, id, 5, 0.3], [6, id, 5, 0.7], [7, id, 5, 0.95], [8, id, 5, 1], [9, id, 5, 1]];
    await dung(ban);
    for (let i = 0; i < 12; i++) { await giu(ban); await p.waitForTimeout(100); } // ụ hiện xong (hoạt ảnh xuất hiện), giữ mức nạp
    await dungHinh(); await giu(ban);
    await p.waitForTimeout(400);
    await p.evaluate(() => { G.ban[0].t[9].nap = 0; }); // ô 9: vừa ra chiêu → XẢ
    await p.waitForTimeout(140);
    await giu(ban.slice(0, 4));
    await p.screenshot({ path: OUT + 'tichtu_' + id + '.png' });
  }
  // trận thật: Black Hole + Chrono Throne + Hive Queen (dọc), chạy 6 s
  await p.evaluate(() => {
    G.hang.length = 0; G.quai.length = 0; G.hu.length = 0; G.cho = 1e9; G.dung = false;
    const B = G.ban[0]; B.t.fill(null); B.mana = 5000;
    [[6, 'blackhole', 5, 0.9], [7, 'ngaithoigian', 5, 0.8], [8, 'chuato', 5, 0.6], [2, 'canon', 4, 0], [12, 'lien', 4, 0]].forEach(([o, id, s, n]) => { const T = sinhU(taoU(B, id, s, o)); B.t[o] = T; T.nap = n; });
    G.cho = 0;
  });
  await p.waitForTimeout(6000);
  await p.screenshot({ path: OUT + 'tran_bh_chrono_hive.png' });
  const tt = await p.evaluate(() => G.ban[0].t.filter(Boolean).map(T => [T.id, +T.nap.toFixed(2), T.tuPhatN || 0]));
  console.log(JSON.stringify(tt), errs.length ? 'ERR ' + errs.join(' | ') : 'không lỗi trang');
  await b.close();
})();
