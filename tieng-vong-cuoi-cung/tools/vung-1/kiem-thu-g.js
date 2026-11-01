// Luồng G – kiểm nhanh mục đích địa hình mới:
//  1) P09: đứng ở miệng giếng (cột 16) sau bia chắn 12 giây → đạn Kèn Câm không trúng; cùng chỗ đó khi GỠ bia (thử) → có trúng.
//  2) Rễ Móc Mộ: mọi rễ có ≥ 0,6 s nứt báo trước; chỉ ra ở pha 2.
const {chromium} = require('playwright');
(async () => {
  const b = await chromium.launch(), pg = await b.newPage({viewport:{width:960, height:540}}); const loi = []; let hong = 0;
  pg.on('pageerror', e => loi.push(e.message));
  const ok = (t, d, c) => { if (!d) hong++; console.log((d ? 'ĐẠT ' : 'LỖI ') + t + ' – ' + JSON.stringify(c)); };
  await pg.goto('http://localhost:8765/game/vung-1/index.html?tu=1&moi=1'); await pg.waitForFunction(() => window.TV && TV.xong);
  await pg.evaluate(() => TV.choi(true));
  const dung = (id, cot, hang, giay, goBia) => pg.evaluate(async ([id, cot, hang, giay, goBia]) => {
    const {V1, G, E} = TV, pl = E.pl; V1.vaoPhong(await V1.layPhong(id), null, {x:cot * 48 + 24, y:(hang + 1) * 48}); V1.camDat();
    if (goBia) for (const [c, r] of goBia) E.BD.L[r][c] = '.';
    let trung = 0;
    for (let i = 0; i < giay * 60; i++){ pl.hp = 6; for (const k of V1.KEYS) V1.ep[k] = 0; TV.mot(); if (pl.hp < 6) trung++; }
    return {trung, chet:E.QUAI.filter(q => q.dead).length, kenSong:E.QUAI.some(q => q.def.id === 'ken' && !q.dead)};
  }, [id, cot, hang, giay, goBia]);
  let r = await dung('P09', 16, 16, 12); ok('P09: đứng miệng giếng sau bia chắn 12 s – không trúng đạn kèn', r.trung === 0 && r.kenSong, r);
  r = await dung('P09', 16, 16, 12, [[22, 15], [23, 15], [22, 16], [23, 16]]); ok('P09: cùng chỗ đó khi gỡ bia (thử) – kèn bắn trúng → bia có tác dụng', r.trung > 0, r);
  r = await dung('P09', 19, 8, 12); ok('P09: tuyến cao (T4, trên đầu kèn) 12 s – không trúng đạn kèn', r.trung === 0, r);
  r = await pg.evaluate(async () => {
    const {V1, G, E} = TV, pl = E.pl; G.luu.kho.chuong_vo = 3; G.luu.trumHa = false;
    V1.vaoPhong(await V1.layPhong('P12'), null, {x:30 * 48, y:17 * 48}); V1.camDat(); TV.buoc(60, '');
    const q = G.trum, kq = {re1:0, re2:0, baoMin:999};
    const p0 = G.nguy.push; G.nguy.push = function(n){ if (n.loai === 're'){ if (q.pha >= 2) kq.re2++; else kq.re1++; kq.baoMin = Math.min(kq.baoMin, n.bao); } return p0.call(this, n); };
    for (let i = 0; i < 60 * 70; i++){ pl.hp = 6; pl.iframes = 99; if (i === 60 * 30){ q.hp = q.def.mau * 0.45; q.def.trung(q, 1, 1); } TV.mot(); }
    delete G.nguy.push; return kq;
  });
  ok('Rễ Móc Mộ: không ra ở pha 1, có ra ở pha 2, mỗi rễ báo nứt ≥ 0,6 s (36 khung)', r.re1 === 0 && r.re2 >= 3 && r.baoMin >= 36, r);
  console.log('Lỗi JS:', loi.length ? loi.join('\n') : 'không', '· hỏng', hong); await b.close();
})();
