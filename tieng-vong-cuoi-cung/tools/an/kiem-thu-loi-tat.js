// Kiểm lối tắt P05 ↔ P09 (phiên "an", ChatGPT 02/11) bằng engine thật (Playwright):
//  leo dây từ T3 P09 lên P05; P05 đi ngang qua lỗ sàn mỏng không rơi; P05 bám dây đi xuống P09; Chuông Lưu không đổi; "Passage Opened".
// Chạy: (cd tieng-vong-cuoi-cung && python3 -m http.server 8765 &) ; node tools/an/kiem-thu-loi-tat.js   (ảnh chụp: ANH_DIR, mặc định /tmp)
const {chromium} = require('playwright');
const path = require('path');
const ANH = process.env.ANH_DIR || '/tmp';
(async () => {
  const b = await chromium.launch(); let hong = 0;
  const ok = (t, d, c) => { if (!d) hong++; console.log((d ? 'ĐẠT ' : 'LỖI ') + t + (c !== undefined ? ' – ' + JSON.stringify(c) : '')); };
  const pg = await b.newPage({viewport:{width:844, height:390}}); const loi = [];
  pg.on('pageerror', e => loi.push(e.message));
  await pg.goto('http://localhost:8765/game/vung-1/index.html?tu=1&moi=1&an=1&an_moi=1');
  await pg.waitForFunction(() => window.TV && TV.xong && window.MocAn && MocAn.bat, null, {timeout:30000});
  await pg.evaluate(async () => { await TV.choi(true); TV.buoc(20, ''); });
  // giữ phím tới khi đổi phòng (chuyển cảnh chạy bất đồng bộ)
  const giu = (phim, toi, max) => pg.evaluate(async ([phim, toi, max]) => {
    for (let i = 0; i < max && !(TV.V1.G.id === toi && !TV.V1.G.chuyen); i++){ TV.buoc(1, phim); if (i % 10 === 0) await new Promise(r => setTimeout(r, 0)); }
    for (let i = 0; i < 40; i++){ TV.buoc(1, ''); await new Promise(r => setTimeout(r, 0)); }
    const {E} = TV; return {id:TV.V1.G.id, cot:+(E.pl.x / 48 + 0.3).toFixed(1), hang:+((E.pl.y + E.pl.h) / 48).toFixed(1), dat:E.pl.onGround, leo:!!E.pl.leo,
      ket:E.collide(E.pl.x, E.pl.y, E.pl.w, E.pl.h)};
  }, [phim, toi, max]);

  // 1) P09: đứng trên T3 cạnh dây cột 10, giữ ↑ → leo lên trần → sang P05
  await pg.evaluate(async () => { const {V1} = TV, p = await V1.layPhong('P09'); V1.vaoPhong(p, null, {x:10 * 48 + 24, y:11 * 48}); V1.camDat(); TV.buoc(20, ''); });
  let r = await giu('u', 'P05', 900);
  ok('P09 → leo dây cột 10 lên → tới P05', r.id === 'P05', r);
  ok('…ở P05 không kẹt trong đá, đứng / bám dây được', !r.ket && (r.dat || r.leo), r);
  ok('…"Passage Opened" lối tắt P05↔P09 (không tính Secret Found)', await pg.evaluate(() => MocAn.A.daTim('v1-loi-tat-p05-p09') && MocAn.A.dem('vung-1').timThay === 0));
  // leo tiếp lên khỏi lỗ, rồi nhảy sang trái đứng trên sàn
  r = await pg.evaluate(async () => { const {E} = TV; for (let i = 0; i < 300 && E.pl.y + E.pl.h > 12.6 * 48; i++) TV.buoc(1, 'u'); TV.buoc(2, 'u,l,j'); TV.buoc(1, 'l'); for (let i = 0; i < 25; i++) TV.buoc(1, "l"); TV.buoc(30, '');
    return {id:TV.V1.G.id, cot:+(E.pl.x / 48).toFixed(1), hang:+((E.pl.y + E.pl.h) / 48).toFixed(1), dat:E.pl.onGround}; });
  ok('…leo lên khỏi lỗ rồi nhảy ra đứng trên sàn P05 (hàng 13)', r.id === 'P05' && r.dat && Math.abs(r.hang - 13) < 0.2, r);
  await pg.screenshot({path:path.join(ANH, 'an-loi-tat-p05.png')});

  // 2) P05: đi ngang từ cột 5 qua lỗ (cột 9–11) sang cột 14 – không rơi
  r = await pg.evaluate(async () => {
    const {V1, E} = TV, p = await V1.layPhong('P05'); V1.vaoPhong(p, null, {x:5 * 48 + 24, y:13 * 48}); V1.camDat(); TV.buoc(20, '');
    const y0 = E.pl.y; let maxY = y0;
    for (let i = 0; i < 200 && E.pl.x < 14 * 48; i++){ TV.buoc(1, 'r'); maxY = Math.max(maxY, E.pl.y); }
    return {id:V1.G.id, cot:+(E.pl.x / 48).toFixed(1), roi:Math.round(maxY - y0)};
  });
  ok('P05: đi ngang qua lỗ sàn mỏng không rơi (đường chính P04→P06 như cũ)', r.id === 'P05' && r.cot >= 13 && r.roi <= 4, r);

  // 3) P05: đứng trên lỗ bấm ↓ bám dây, leo xuống → P09
  await pg.evaluate(async () => { const {V1} = TV, p = await V1.layPhong('P05'); V1.vaoPhong(p, null, {x:10 * 48 + 24, y:13 * 48}); V1.camDat(); TV.buoc(20, ''); });
  r = await giu('d', 'P09', 900);
  ok('P05: bám dây trong lỗ leo xuống → tới P09', r.id === 'P09' && !r.ket, r);

  // 4) Chuông Lưu P05 + bia chỉ đường không đổi chỗ
  r = await pg.evaluate(async () => { const p = await TV.V1.layPhong('P05'); return {chuong:p.chuong_luu, bang:p.bang_chi_duong, cua:p.cua.map(c => c.id)}; });
  ok('P05: Chuông Lưu (15,12) + bia (6,12) giữ nguyên, có thêm cửa P05-day', r.chuong.cot === 15 && r.chuong.hang === 12 && r.bang.cot === 6 && r.cua.includes('P05-day'), r);
  ok('Không lỗi JS', !loi.length, loi);
  console.log('Hỏng', hong); await b.close(); process.exit(hong ? 1 : 0);
})();
