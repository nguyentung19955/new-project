// Rà soát vẽ tay — khu BOARD: chụp trước/sau các màn trên bàn ở 390×844 DPR3 + đo fps + lỗi trang.
// Chạy: python3 -m http.server 8765 (gốc repo) rồi  BASE=http://localhost:8765 OUT=docs/demo-hop-tuong/tuvan/vetay/board/sau_ node tools/thap-kt-vetay-board.js
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765', OUT = process.env.OUT || 'shots/';
const fps = (p, ms) => p.evaluate((ms) => new Promise(ok => { let n = 0; const t0 = performance.now(); const f = (t) => { n++; if (t - t0 < ms) requestAnimationFrame(f); else ok(Math.round(n * 1000 / (t - t0))); }; requestAnimationFrame(f); }), ms);
(async () => {
  const b = await chromium.launch(); const kq = {};
  const CANH = [
    ['solo', 'solo', 'lophanung,radar,lien,bang,canon'],
    ['coop', 'coop', 'chuato,orbital,lienket,dongbo,hydra'],
    ['pvp', 'pvp', 'leviathan,cuuvi,lophanung,hopbi,tienhoa'],
  ];
  for (const [ten, mode, deck] of CANH) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: +(process.env.DPR || 3) });
    const errs = []; p.on('pageerror', e => errs.push(e.message + ' @ ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
    await p.goto(`${BASE}/thap/?mode=${mode}&deck=${deck}&mana=3000&wave=6&notut=1&deck2=khoisinh,ngaithoigian,luoicheo,lien,canon`, { waitUntil: 'load' });
    await p.waitForTimeout(3500);
    for (let i = 0; i < 2; i++) { await p.mouse.click(195, 470); await p.waitForTimeout(700); } // bỏ màn giới thiệu trận
    // bày bàn: 1 ụ mỗi loại + vài ụ cao sao, nạp năng lượng, có quái
    await p.evaluate(() => {
      const B = G.ban[0]; G.debug.nointro = true;
      B.deck.forEach((id, i) => { B.lv[id] = 1; const T = sinhU(taoU(B, id, 1 + (i % 3) * 2, [0, 1, 5, 7, 9][i])); B.t[T.o] = T; T.nap = 0.6; });
      { const T = sinhU(taoU(B, B.deck[2], 3, 11)); B.t[11] = T; }
    });
    await p.waitForTimeout(2500);
    await p.screenshot({ path: OUT + ten + '_ban.' + (process.env.EXT || 'png') });
    // chạm ụ đầu (bảng thông tin + vùng hỗ trợ nếu là ụ hỗ trợ)
    const c = await p.evaluate(() => { const B = G.ban[0], o = B.o[1], r = $('#cv').getBoundingClientRect(), k = r.width / 430; return [r.left + o.x * k, r.top + o.y * k]; });
    await p.mouse.click(c[0], c[1]); await p.waitForTimeout(400);
    await p.screenshot({ path: OUT + ten + '_cham.png' });
    // kéo ghép: giữ ụ ô 0 rê lên ô 11
    const c0 = await p.evaluate(() => { const B = G.ban[0], o = B.o[0], r = $('#cv').getBoundingClientRect(), k = r.width / 430; return [r.left + o.x * k, r.top + o.y * k, r.left + B.o[11].x * k, r.top + B.o[11].y * k]; });
    await p.mouse.move(c0[0], c0[1]); await p.mouse.down(); await p.mouse.move((c0[0] + c0[2]) / 2, (c0[1] + c0[3]) / 2, { steps: 6 }); await p.waitForTimeout(250);
    await p.screenshot({ path: OUT + ten + '_keo.png' });
    await p.mouse.up();
    kq[ten] = { fps: await fps(p, 3000), errs: errs.slice(0, 5) };
    await p.close();
  }
  console.log(JSON.stringify(kq));
  await b.close();
})();
