// ANIMATION HYBRID — đo thời gian khung (iPhone 13, CPU chậm ×4): 15 ụ đủ nhóm chuyển động + TRÙM + trạng thái (chậm/độc/băng), 30 quái.
// node tools/thap-kt-anim-perf.js [BASE] [tat]  → p50/p95/max ms của 1 khung (capNhat + REN.ve) qua 240 khung.
//  tat = 1: tắt anim.js (AN.tat) để so cùng bản; BASE trỏ bản live (thap/ của nhánh xuất bản) để so với bản đang chạy.
const { chromium, devices } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8765/thap/', TAT = process.argv[3] === '1';
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ ...devices['iPhone 13'] }), errs = [];
  p.on('pageerror', e => errs.push(e.message));
  const deck = 'canon,set,nam,cuuvi,soi', deck2 = 'canon,set,nam,cuuvi,soi';
  await p.goto(`${BASE}?mode=solo&deck=${deck}&wave=6&fill=5&mana=99999&notut=1`, { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length && !TAI.cho, null, { timeout: 40000 });
  await p.waitForTimeout(5000);
  const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const kq = await p.evaluate((TAT) => {
    if (typeof AN !== 'undefined') AN.tat = TAT;
    const B = G.ban[0], p0 = G.duong.find(q => q.ban === B.i) || G.duong[0]; B.tim = 1e9; G.dung = true;
    G.quai.length = 0; G.hang.length = 0;
    const ids = ['canon', 'set', 'lien', 'sungluc', 'laser', 'mana', 'railgun', 'bang', 'doc', 'khoathoigian', 'blackhole', 'tienhoa', 'drone', 'khuech', 'cuuvi'];
    for (let o = 0; o < 15; o++) B.t[o] = sinhU(taoU(B, ids[o], 4, o));
    let seed = 1; const rn = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const sinh = () => { for (let i = 0; i < 30; i++) { const E = sinhQuai(i % 9 === 4 ? 'khong_lo' : 'bo', 0, p0.len * (0.15 + rn() * 0.7), 3000); E.vao = 1; [E.x, E.y, E.goc] = viTri(p0, E.s); } };
    sinh();
    try { const tid = Object.keys(TRUM)[0], pi = G.duong.indexOf(p0); const E = sinhTrum(tid, pi < 0 ? 0 : pi); E.vao = 1; E.s = p0.len * 0.5; [E.x, E.y, E.goc] = viTri(p0, E.s); E.hp = E.max = 1e9; } catch (e) { console.log('trum', e.message); }
    for (let i = 0; i < G.quai.length; i++) { const E = G.quai[i]; if (i % 3 === 0) E.cham = 99; if (i % 4 === 1) E.docT = 99; }
    B.t[3].st.bang = 0; 
    for (let i = 0; i < 6; i++) { chupTruoc(); capNhat(BUOC); }
    for (let f = 0; f < 90; f++) { if (f % 40 === 0) for (const T of B.t) if (T) T.nap = 1; let n = Math.round(1 / 60 / BUOC) || 1; while (n--) { chupTruoc(); capNhat(BUOC); } FX.capNhat(1 / 60); REN.ve(1 / 60, 1); } // làm ấm (giải mã ảnh, dựng dải) — đo trạng thái ổn định
    const ts = [];
    for (let f = 0; f < 240; f++) {
      if (f % 40 === 0) { for (const T of B.t) if (T) { T.nap = 1; if (SKILLS[T.id].chuDong) try { SKILLS[T.id].chuDong(G, B, T); } catch (e) { } } if (G.quai.filter(E => !E.chet).length < 15) sinh(); }
      const t0 = performance.now(); let n = Math.round(1 / 60 / BUOC) || 1; while (n--) { chupTruoc(); capNhat(BUOC); } FX.capNhat(1 / 60); REN.ve(1 / 60, 1); ts.push(performance.now() - t0);
    }
    ts.sort((a, b) => a - b); const q = (x) => +ts[Math.floor(x * (ts.length - 1))].toFixed(2);
    return { an: typeof AN !== 'undefined' && !AN.tat, trum: G.quai.some(E => E.trum), p50: q(0.5), p95: q(0.95), max: q(1), tb: +(ts.reduce((a, b) => a + b, 0) / ts.length).toFixed(2), hu: G.hu.length };
  }, TAT);
  console.log(JSON.stringify({ BASE, ...kq, errs }));
  await b.close();
})();
