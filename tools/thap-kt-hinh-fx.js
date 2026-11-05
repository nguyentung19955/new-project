// TURRET MERGE — ép các hiệu ứng đã đổi sang ảnh ChatGPT (S4/S5/S2) để chụp + bắt lỗi: Chrono Lock, lưỡi cưa, mìn, bom, cầu vồng,
// sóng trăng, Bounty $, vòng xích Clamp, vòng lên cấp, vòng triệu hồi, gương Mirror Gate, vòng băng Cryo, tuyết Blizzard.
// Chạy: python3 -m http.server 8765 (gốc repo) rồi OUT=thu-muc/ node tools/thap-kt-hinh-fx.js 390 844
const { chromium } = require('playwright');
const OUT = process.env.OUT || 'shots/';
const W = +(process.argv[2] || 390), H = +(process.argv[3] || 844);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text()); });
  await p.goto('http://localhost:8765/thap/?mode=solo&deck=guongcong,lophanung,kepha,nhatthuc,baotuyet&wave=6&fill=5&mana=99999', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length, null, { timeout: 15000 }); await p.waitForTimeout(2000);
  await p.evaluate(() => {
    const B = G.ban[0], p0 = G.duong[0]; B.tim = 1e9; G.quai.length = 0; G.hu = G.hu.filter(o => o.k === 'truyNaVe');
    const Q = []; for (let i = 0; i < 8; i++) { const E = sinhQuai(i % 3 ? 'bo' : 'khong_lo', 0, p0.len * (0.12 + i * 0.09), 1e6); E.vao = 1; E.chan = 1e9; Q.push(E); }
    Q[1].truyNa = true; Q[3].truyNa = true;
    const T = B.t.find(t => t); const c = B.o[T.o];
    G.hu.push({ k: 'khoa', t: 0, song: 30, E: Q[2], B, T, hp: Q[2].hp, don: 0, pct: 1, x: Q[2].x, y: Q[2].y });
    G.hu.push({ k: 'dia', t: 0, song: 30, x: c.x, y: c.y, E: Q[4], B, T, n: 2, max: 99, b: 0, dmg: 0, goc: 0, vet: [], da: [] });
    const [mx, my] = viTri(p0, p0.len * 0.5); G.hu.push({ k: 'min', t: 0, song: 30, x: mx, y: my, r: 30, dmg: 0, B, sao3: true });
    G.hu.push({ k: 'bom', t: 0, song: 30, E: Q[5], x: Q[5].x, y: Q[5].y, r: 30, dmg: 0, B, T });
    const pts = []; for (let s = p0.len * 0.6; s <= p0.len * 0.85; s += 8) pts.push(viTri(p0, s));
    G.hu.push({ k: 'cauvong', t: 0.6, song: 30, pts, k2: 0.1, pvp: false, T, B });
    G.hu.push({ k: 'non', t: 0.15, song: 0.5, x: c.x, y: c.y, L: 100, g: -Math.PI / 2 });
    G.hu.push({ k: 'tuyet', t: 0, song: 1.4, B });
    for (const X of B.t) if (X) { if (X.id === 'kepha') X.st.kep = 30; X.nap = 1; }
    const L = B.t.filter(t => t)[3]; if (L) L.lvSang = 0.7;
    window._T = T;
  });
  await p.waitForTimeout(250);
  await p.evaluate(() => { G.dung = true; });
  await p.screenshot({ path: OUT + W + '_20-fx-ep.png' });
  await p.evaluate(() => { G.dung = false; VX.trieu(_T); });
  await p.waitForTimeout(160); await p.evaluate(() => { G.dung = true; });
  await p.screenshot({ path: OUT + W + '_21-fx-trieu.png' });
  console.log(W, 'ERR', JSON.stringify(errs.slice(0, 8)));
  await b.close();
})();
