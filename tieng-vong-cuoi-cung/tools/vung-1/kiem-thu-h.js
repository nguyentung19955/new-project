// Luồng H – kiểm nhanh: Vọng Tàn báo trước ≥ 0,5 s trước khi sóng ra + sóng chạy tới đúng tam; sóng âm Hồn Vải xuyên tường; không lỗi JS.
// Chạy: (cd tieng-vong-cuoi-cung && python3 -m http.server 8765) ; node tools/vung-1/kiem-thu-h.js
const {chromium} = require('playwright');
(async () => {
  const b = await chromium.launch(), pg = await b.newPage({viewport:{width:960, height:540}}); const loi = []; let hong = 0;
  pg.on('pageerror', e => loi.push(e.message));
  const ok = (t, d, c) => { if (!d) hong++; console.log((d ? 'ĐẠT ' : 'LỖI ') + t + ' – ' + JSON.stringify(c)); };
  await pg.goto('http://localhost:8765/game/vung-1/index.html?tu=1&moi=1'); await pg.waitForFunction(() => window.TV && TV.xong);
  await pg.evaluate(() => TV.choi(true));
  let r = await pg.evaluate(async () => {
    const {V1, E} = TV, pl = E.pl; V1.vaoPhong(await V1.layPhong('P11'), null, {x:200, y:200});
    const q = E.QUAI.find(q => q.def.id === 'tan'); for (const o of E.QUAI) if (o !== q){ o.dead = true; o.hoiT = -1e9; }
    pl.x = q.x - 130; pl.y = q.y + q.h - pl.h; q.face = -1; V1.camDat();
    let bd = -1, songRa = -1, xaNhat = 0, bao = 0;
    for (let i = 0; i < 600; i++){
      pl.hp = E.P.maxHp; pl.iframes = 999; TV.buoc(1, '');
      if (q.st === 'danh' && bd < 0) bd = i;
      if (bd >= 0 && songRa < 0 && V1 && window.VeChieuQuai && q.st === 'danh' && q.kDanh < q.def.chieu.chan_dong) bao++;
      const n = E.NO.find(n => n.dat); if (n){ if (songRa < 0) songRa = i; xaNhat = Math.max(xaNhat, n.t * n.ch.toc_song); }
      if (songRa >= 0 && !n) break;
    }
    return {baoKhung:songRa - bd, xaNhat, tam:q.def.chieu.tam};
  });
  ok('Vọng Tàn: từ lúc vào đòn tới khi sóng ra ≥ 0,5 s (30 khung)', r.baoKhung >= 30, r);
  ok('Vọng Tàn: sóng chạy tới đúng tầm tam (dải nứt báo trước khớp tầm)', r.xaNhat >= r.tam, r);
  r = await pg.evaluate(() => {
    const E = TV.E;
    // bắn thử một sóng âm xuyên qua ô đặc
    const T = E.BD.T; let cot = -1, hang = -1;
    for (let r = 2; r < E.BD.HANG - 2 && cot < 0; r++) for (let c = 4; c < E.BD.COT - 4; c++) if (E.tile(c, r) === '#' && E.tile(c - 3, r) !== '#' && E.tile(c + 3, r) !== '#'){ cot = c; hang = r; break; }
    if (cot < 0) return {khongThayTuong:true};
    E.DAN.length = 0; E.pl.x = -9999;
    E.DAN.push({x:(cot - 3) * T + T / 2, y:hang * T + T / 2, vx:4.2, huong:1, t:0, song:150, w:28, h:60, dmg:1, ch:{xuyen_tuong:true, ve:'song'}});
    let quaTuong = false; for (let i = 0; i < 60 && E.DAN.length; i++){ TV.buoc(1, ''); if (E.DAN[0] && E.DAN[0].x > (cot + 1) * T) quaTuong = true; }
    return {quaTuong, cot, hang};
  });
  ok('Hồn Vải: sóng âm (xuyen_tuong) đi qua tường', r.quaTuong, r);
  ok('Không có lỗi JS', !loi.length, loi);
  console.log('Hỏng', hong); await b.close();
})();
