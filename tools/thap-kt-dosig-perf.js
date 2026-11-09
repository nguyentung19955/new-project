// CHỮ KÝ ĐỎ (js/dosig.js) — đo thời gian khung (iPhone 13, CPU chậm ×4): 15 ụ = 10 ụ Đỏ 5★ + 5 ụ bắn nhanh, 30 quái, mọi ụ ra chiêu mỗi 40 khung.
// node tools/thap-kt-dosig-perf.js [BASE] [Q] → Q='&dosig=0' để đo bản trước (tắt chữ ký). In p50/p95/max/tb ms của 1 bước (capNhat + REN.ve) qua 120 khung.
const { chromium, devices } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8765/thap/', Q = process.argv[3] || '';
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ ...devices['iPhone 13'] }), errs = [];
  p.on('pageerror', e => errs.push(e.message));
  const deck = 'canon,set,nam,cuuvi,soi', deck2 = 'canon,set,nam,cuuvi,soi';
  await p.goto(`${BASE}?mode=solo&deck=${deck}&wave=6&fill=5&mana=99999&notut=1${Q}`, { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length && !TAI.cho, null, { timeout: 40000 });
  await p.waitForTimeout(5000);
  const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const kq = await p.evaluate(() => {
    const B = G.ban[0], p0 = G.duong.find(q => q.ban === B.i) || G.duong[0]; B.tim = 1e9; G.dung = true;
    G.quai.length = 0; G.hang.length = 0;
    const ids = ['blackhole', 'overlord', 'lophanung', 'ngaithoigian', 'chuato', 'leviathan', 'khoisinh', 'ronglua', 'cobac', 'thacmana', 'canon', 'set', 'lien', 'bao', 'laser'];
    for (let o = 0; o < 15; o++) B.t[o] = sinhU(taoU(B, ids[o], 5, o));
    let seed = 1; const rn = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const sinh = () => { for (let i = 0; i < 30; i++) { const E = sinhQuai(i % 9 === 4 ? 'khong_lo' : 'bo', 0, p0.len * (0.15 + rn() * 0.7), 3000); E.vao = 1; [E.x, E.y, E.goc] = viTri(p0, E.s); } };
    sinh();
    for (let i = 0; i < 6; i++) { chupTruoc(); capNhat(BUOC); }
    for (let f = 0; f < 50; f++) { if (f % 40 === 0) for (const T of B.t) if (T) T.nap = 1; let n = Math.round(1 / 60 / BUOC) || 1; while (n--) { chupTruoc(); capNhat(BUOC); } FX.capNhat(1 / 60); REN.ve(1 / 60, 1); } // làm ấm (giải mã ảnh, dựng dải) — đo trạng thái ổn định
    let dsgMs = 0; if (typeof DSG !== 'undefined' && DSG.bat) { const v0 = DSG.ve; DSG.ve = function () { const a = performance.now(); try { return v0.apply(this, arguments); } finally { dsgMs += performance.now() - a; } }; } // thời gian riêng của chữ ký Đỏ
    const ts = [];
    for (let f = 0; f < 120; f++) {
      if (f % 40 === 0) { for (const T of B.t) if (T) { T.nap = 1; if (SKILLS[T.id].chuDong) try { SKILLS[T.id].chuDong(G, B, T); } catch (e) { } } if (G.quai.filter(E => !E.chet).length < 15) sinh(); }
      const t0 = performance.now(); let n = Math.round(1 / 60 / BUOC) || 1; while (n--) { chupTruoc(); capNhat(BUOC); } FX.capNhat(1 / 60); REN.ve(1 / 60, 1); ts.push(performance.now() - t0);
    }
    ts.sort((a, b) => a - b); const q = (x) => +ts[Math.floor(x * (ts.length - 1))].toFixed(2);
    return { dsgTb: +(dsgMs / ts.length).toFixed(2), dsgPhan: +(100 * dsgMs / ts.reduce((a, b) => a + b, 0)).toFixed(1) + '%', hatMax: typeof DSG !== 'undefined' ? DSG.MAX_HAT : 0, p50: q(0.5), p95: q(0.95), max: q(1), tb: +(ts.reduce((a, b) => a + b, 0) / ts.length).toFixed(2), hu: G.hu.length };
  });
  console.log(JSON.stringify({ Q, ...kq, errs }));
  await b.close();
})();
