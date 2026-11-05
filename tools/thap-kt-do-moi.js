// TURRET MERGE kiểm thử Playwright — chạy: python3 -m http.server 8765 (ở gốc repo) rồi OUT=thu-muc/ node tools/thap-kt-do-moi.js 390 844
// 4 ụ Đỏ mới ở 1/4/7★ (tự nhiên, không ép dạng) + kỹ năng chủ động
const { chromium } = require('playwright');
const OUT = '' + (process.env.OUT || 'shots/') + '';
const W = +(process.argv[2] || 390), H = +(process.argv[3] || 844);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await p.goto('http://localhost:8765/thap/?mode=solo&deck=lien,canon,bang,tia,set&wave=12&mana=99999', { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  for (const [nhom, ids] of [['A', ['chuato', 'leviathan', 'ronglua']], ['B', ['khoisinh', 'chuato', 'ronglua']]]) {
    await p.evaluate((ids) => {
      G.hang.length = 0; G.quai.length = 0; G.hu.length = 0; G.dan.length = 0; G.cho = 1e9; G.dung = false;
      const B = G.ban[0]; B.tim = 1e9; B.t.fill(null);
      ids.forEach((id, r) => { if (!B.deck.includes(id)) B.deck[r] = id; B.lv[id] = 1; [1, 4, 7].forEach((sao, k) => { const T = sinhU(taoU(B, id, sao, r * 5 + k * 2)); B.t[r * 5 + k * 2] = T; }); });
      if (ids[0] === 'khoisinh') for (const o of [1, 3, 6, 8]) { B.t[o] = sinhU(taoU(B, 'lien', 1 + (o % 3), o)); }
      const p0 = G.duong[0]; for (let i = 0; i < 14; i++) { const E = sinhQuai(i % 4 === 0 ? 'khong_lo' : 'bo', 0, p0.len * (0.03 + i * 0.065), 60); E.vao = 1; }
    }, ids);
    await p.waitForTimeout(6500); // drone kịp đẻ, Leviathan kịp nuốt
    await p.screenshot({ path: OUT + `do_${W}_${nhom}_thuong.png`, clip: { x: 0, y: 200, width: W, height: 330 } });
    // dùng kỹ năng chủ động của ụ 7★ mỗi hàng
    await p.evaluate(() => { const B = G.ban[0]; for (const o of [4, 9, 14]) { const T = B.t[o]; if (T && SKILLS[T.id].chuDong) { T.nap = 1; SKILLS[T.id].chuDong(G, B, T); } } });
    await p.waitForTimeout(350);
    await p.screenshot({ path: OUT + `do_${W}_${nhom}_chudong1.png`, clip: { x: 0, y: 200, width: W, height: 330 } });
    await p.waitForTimeout(450);
    await p.screenshot({ path: OUT + `do_${W}_${nhom}_chudong2.png`, clip: { x: 0, y: 200, width: W, height: 330 } });
  }
  // bảng thông tin (chạm ụ) — Wyrm Engine 7★ + dòng ATTACK BY STAGE
  const c = await p.evaluate(() => { const B = G.ban[0]; return B.o[14]; });
  await p.mouse.click(c.x, c.y); await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + `do_${W}_info.png` });
  console.log(W, 'ERR', JSON.stringify(errs.slice(0, 8)));
  await b.close();
})();
