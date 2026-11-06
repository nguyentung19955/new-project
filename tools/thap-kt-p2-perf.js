// VFX P2 — đo thời gian khung (iPhone 13, CPU chậm ×4) với bàn đầy ụ chiêu lớn đang ra chiêu cùng lúc.
// node tools/thap-kt-p2-perf.js [BASE] → in p50/p95/max ms của 1 bước (capNhat + REN.ve) qua 240 khung.
const { chromium, devices } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8765/thap/';
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ ...devices['iPhone 13'] }), errs = [];
  p.on('pageerror', e => errs.push(e.message));
  const deck = 'overlord,blackhole,lophanung,orbital,tienhoa';
  await p.goto(`${BASE}?mode=solo&deck=${deck}&wave=6&fill=5&mana=99999&notut=1`, { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length && !TAI.cho, null, { timeout: 40000 });
  await p.waitForTimeout(5000);
  const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const kq = await p.evaluate(() => {
    const B = G.ban[0], p0 = G.duong.find(q => q.ban === B.i) || G.duong[0]; B.tim = 1e9; G.dung = true;
    G.quai.length = 0; G.hang.length = 0;
    const ids = ['overlord', 'blackhole', 'lophanung', 'orbital', 'tienhoa', 'khoathoigian', 'ngaithoigian', 'haoquang', 'xuonganh', 'lualien', 'overlord', 'blackhole', 'orbital', 'lophanung', 'lualien'];
    for (let o = 0; o < 15; o++) B.t[o] = sinhU(taoU(B, ids[o], 4, o));
    let seed = 1; const rn = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const sinh = () => { for (let i = 0; i < 30; i++) { const E = sinhQuai(i % 9 === 4 ? 'khong_lo' : 'bo', 0, p0.len * (0.15 + rn() * 0.7), 3000); E.vao = 1; [E.x, E.y, E.goc] = viTri(p0, E.s); } };
    sinh();
    for (let i = 0; i < 6; i++) { chupTruoc(); capNhat(BUOC); }
    const ts = [];
    for (let f = 0; f < 240; f++) {
      if (f % 40 === 0) { for (const T of B.t) if (T) { T.nap = 1; if (SKILLS[T.id].chuDong) try { SKILLS[T.id].chuDong(G, B, T); } catch (e) { } } SKILLS.orbital.thucTinh(G, B); if (G.quai.filter(E => !E.chet).length < 15) sinh(); }
      const t0 = performance.now(); let n = Math.round(1 / 60 / BUOC) || 1; while (n--) { chupTruoc(); capNhat(BUOC); } REN.ve(1 / 60, 1); ts.push(performance.now() - t0);
    }
    ts.sort((a, b) => a - b); const q = (x) => +ts[Math.floor(x * (ts.length - 1))].toFixed(2);
    return { p50: q(0.5), p95: q(0.95), max: q(1), tb: +(ts.reduce((a, b) => a + b, 0) / ts.length).toFixed(2), hu: G.hu.length };
  });
  console.log(JSON.stringify({ BASE, ...kq, errs }));
  await b.close();
})();
