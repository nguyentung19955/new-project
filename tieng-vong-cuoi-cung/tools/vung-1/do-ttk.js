// Luồng G – đo thời gian hạ trùm (TTK) bằng "người chơi máy" đánh liên tục (chém thật, KHÔNG cộng sát thương giả).
// Người chơi máy kiểu "trung bình": áp sát ~70 px, bấm chém (nhả phím giữa các lần), thấy báo đòn thì lùi/nhảy với xác suất,
// có lúc đứng xa hồi lại. Không bao giờ chết (máu được hồi), đếm số lần trúng đòn.
// Chạy: (cd tieng-vong-cuoi-cung && python3 -m http.server 8765) ; node tools/vung-1/do-ttk.js [số trận=5]
const {chromium} = require('playwright');
const SO = +(process.argv[2] || 5);
(async () => {
  const b = await chromium.launch(), pg = await b.newPage({viewport:{width:960, height:540}}); const loi = [];
  pg.on('pageerror', e => loi.push(e.message));
  const kq = [];
  for (let lan = 0; lan < SO; lan++){
    await pg.goto('http://localhost:8765/game/vung-1/index.html?tu=1&moi=1'); await pg.waitForFunction(() => window.TV && TV.xong);
    const r = await pg.evaluate(async seed => {
      const {E, G, V1} = TV, pl = E.pl, T = 48;
      let s = seed * 7919 + 13; const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
      Math.random = rnd;   // trận lặp lại được
      TV.choi(true); G.luu.kho.chuong_vo = 3;
      V1.vaoPhong(await V1.layPhong('P12'), null, {x:30 * T, y:17 * T}); V1.camDat();
      const q = G.trum; let f = 0, trung = 0, hp0 = pl.hp, phaF = -1, chieu = {}, stT = '', reRa = 0;
      const ep = k => { for (const x of V1.KEYS) V1.ep[x] = 0; if (k) k.split(',').forEach(x => x && (V1.ep[x] = 1)); };
      let ne = 0, neDir = 0, xa = 0;
      for (; f < 60 * 240 && q.st !== 'chet' && !q.dead; f++){
        const dx = q.x + q.w / 2 - (pl.x + pl.w / 2), ad = Math.abs(dx);
        // nhận ra báo đòn (giống người: phản ứng trễ ~0,25 s, 70% lần)
        if (q.baoTruoc && !ne && rnd() < 0.05) { ne = 30; neDir = dx > 0 ? -1 : 1; }
        const reGan = G.nguy.some(n => n.loai === 're' && n.bao > 0 && n.bao < 22 && Math.abs(n.x - (pl.x + pl.w / 2)) < 60);
        let k = '';
        if (reGan && pl.onGround && rnd() < 0.5) k = 'j,' + (dx > 0 ? 'r' : 'l');
        else if (ne > 0){ ne--; k = (neDir > 0 ? 'r' : 'l') + (ne === 20 ? ',j' : ''); }
        else if (xa > 0){ xa--; k = ad < 260 ? (dx > 0 ? 'l' : 'r') : ''; }
        else {
          if (ad > 90) k = dx > 0 ? 'r' : 'l';
          else if (f % 14 < 7) k = 'a';                 // chém liên tục, nhả phím giữa các lần
          if (rnd() < 0.002) xa = 60;                   // thỉnh thoảng lùi ra thở
          if (G.nguy.some(n => n.loai === 'song' && Math.abs(n.x - (pl.x + pl.w / 2)) < 70) && pl.onGround) k = 'j';
        }
        ep(k); TV.mot();
        if (pl.hp < hp0) trung += hp0 - pl.hp;
        if (pl.hp < 3 || pl.dead){ pl.dead = false; pl.hp = E.P.maxHp; }
        hp0 = pl.hp;
        if (q.st !== stT){ chieu[q.st] = (chieu[q.st] || 0) + 1; stT = q.st; if (q.st === 'chuyen_pha') phaF = f; }
      }
      reRa = (q.reRa || 0);
      return {giay:+(f / 60).toFixed(1), pha2Tu:+(phaF / 60).toFixed(1), trung, chieu, reRa, ha:q.st === 'chet' || q.dead, mau:q.hp};
    }, lan + 1);
    kq.push(r); console.log('Trận ' + (lan + 1) + ':', JSON.stringify(r));
  }
  const g = kq.map(r => r.giay); console.log('TTK trung bình', (g.reduce((a, v) => a + v, 0) / g.length).toFixed(1), 's · min', Math.min(...g), '· max', Math.max(...g));
  console.log('Lỗi JS:', loi.length ? loi.join('\n') : 'không'); await b.close();
})();
