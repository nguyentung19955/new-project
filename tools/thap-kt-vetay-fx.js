// TURRET MERGE — rà soát VẼ TAY vùng FX (docs/demo-hop-tuong/VE-TAY-RASOAT-fx.md): chụp các màn của vùng FX
// (bàn có ụ grow-up + quái/trùm, hiệu ứng kỹ năng ép, ô hỗ trợ, trang ụ Test range) + đo fps + bắt lỗi trang.
// Chạy: python3 -m http.server 8765 (gốc phục vụ) rồi  BASE=http://localhost:8765/thap/ OUT=thu-muc/ node tools/thap-kt-vetay-fx.js
const { chromium } = require('playwright');
const OUT = process.env.OUT || 'shots/', BASE = process.env.BASE || 'http://localhost:8765/thap/';
const W = 390, H = 844, DPR = +(process.env.DPR || 3);
const cho = (p, ms) => p.waitForTimeout(ms);
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const moi = async (q) => {
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: DPR });
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load/.test(m.text())) errs.push('console ' + m.text()); });
    await p.goto(BASE + q, { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length, null, { timeout: 20000 });
    await cho(p, 2500); await p.mouse.click(195, 485); await cho(p, 1800); // bỏ màn 'Tap to start'
    return p;
  };
  // ---------- A) trận: ụ grow-up (vòng đo 3 cung, cung nạp) + quái máu vơi + trùm báo chiêu ----------
  let p = await moi('?mode=solo&deck=ngaithoigian,cuongno,soi,ronglua,hydra&wave=9&fill=10&mana=99999');
  await p.evaluate(() => {
    const B = G.ban[0], p0 = G.duong[0]; B.tim = 1e9; G.quai.length = 0;
    const ds = B.t.filter(t => t); ds.forEach((T, i) => { T.sao = [2, 4, 5, 7, 3, 6, 7, 1, 5, 4][i % 10]; T.nap = 0.6; });
    for (let i = 0; i < 7; i++) { const E = sinhQuai(i % 3 ? 'bo' : 'khong_lo', 0, p0.len * (0.1 + i * 0.1), 1); E.vao = 1; E.chan = 1e9; E.hp = E.max * (0.3 + 0.1 * i); if (i === 2) E.cham = 5; if (i === 4) E.docT = 5; }
    const Tb = sinhTrum('mad_crown', 0); Tb.vao = 1; Tb.s = p0.len * 0.45; Tb.chan = 1e9; Tb.hp = Tb.max * 0.6; Tb.bao = { t: 0, song: 99, muc: ds.slice(0, 2).map(T => T.uid) }; Tb.knT = 99;
    G.ngung = false;
  });
  await cho(p, 1200); await p.evaluate(() => { G.dung = true; });
  await p.screenshot({ path: OUT + 'A_tran.png' });
  // fps trong trận (bỏ dừng, đo 3 s)
  await p.evaluate(() => { G.dung = false; });
  const fps = await p.evaluate(() => new Promise(ok => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else ok(n / ((performance.now() - t0) / 1000)); }; requestAnimationFrame(f); }));
  await p.close();
  // ---------- B) hiệu ứng kỹ năng ép (skills / skills3 / skills4 / skills5 / growfx) ----------
  p = await moi('?mode=solo&deck=ngaithoigian,pandora,marionette,chuato,khoisinh&wave=6&fill=10&mana=99999');
  await p.evaluate(() => {
    const B = G.ban[0], p0 = G.duong[0]; B.tim = 1e9; G.quai.length = 0; G.hu.length = 0;
    const Q = []; for (let i = 0; i < 9; i++) { const E = sinhQuai(i % 3 ? 'bo' : 'khong_lo', 0, p0.len * (0.08 + i * 0.1), 1e6); E.vao = 1; E.chan = 1e9; E.thr = 0.1 + i * 0.05; Q.push(E); }
    const ds = B.t.filter(t => t), T = ds[0], c = B.o[T.o], T2 = ds[1] || T, c2 = B.o[T2.o];
    ds.forEach((X, i) => { X.sao = 7; X.gd = 3; });
    const push = (o) => { try { G.hu.push(o); } catch (e) { console.error(e); } };
    push({ k: 'khoa', t: 0, song: 30, E: Q[2], B, T, hp: Q[2].hp, don: 0, pct: 1, x: Q[2].x, y: Q[2].y });
    push({ k: 'gTam', t: 0.1, song: 30, E: Q[0], mau: '#4bff9a' });
    push({ k: 'gGiao', t: 0.1, song: 30, E: Q[5], B, T, dmg: 0, x: Q[5].x, y: Q[5].y });
    push({ k: 'gNoSao', t: 0.1, song: 0.32, x: Q[6].x, y: Q[6].y });
    push({ k: 'gVuot', t: 0.05, song: 0.3, x: Q[7].x, y: Q[7].y, goc: 0.3, n: 3, mau: '#ff4b3e' });
    push({ k: 'gDauGio', t: 0.1, song: 0.6, x: Q[8].x, y: Q[8].y });
    push({ k: 'gTiaVang', t: 0.05, song: 0.4, x0: c.x, y0: c.y, x1: Q[3].x, y1: Q[3].y });
    push({ k: 'gKim', t: 0.05, song: 0.4, x0: c2.x, y0: c2.y, x1: Q[4].x, y1: Q[4].y, ma: true });
    push({ k: 'gXem', t: 0.3, song: 1.3, x: Q[1].x, y: Q[1].y, r: 30 });
    push({ k: 'gDauAn', t: 0.1, song: 0.5, x: Q[3].x + 20, y: Q[3].y });
    push({ k: 'pandora', t: 0.4, song: 1.6, B, o: T2.o, chon: [2], sao: 7, da: true });
    push({ k: 'chich', t: 0.05, song: 0.3, x0: c.x, y0: c.y, x1: Q[6].x, y1: Q[6].y, vang: true });
    push({ k: 'cungSang', t: 0.2, song: 0.6, x0: c.x, y0: c.y, x1: c2.x, y1: c2.y });
    push({ k: 'tiaTia', t: 0.05, song: 0.3, x0: c2.x, y0: c2.y, x1: Q[1].x, y1: Q[1].y, mau: '#7ffcff' });
    push({ k: 'hydraTia', t: 0.05, song: 0.5, x0: c.x, y0: c.y, x1: Q[8].x, y1: Q[8].y });
    push({ k: 'gCot', t: 0.1, song: 0.55, x: Q[4].x, y: Q[4].y, r: 40, seed: 3 });
    G.ngung = false; window._T = T;
  });
  await cho(p, 120); await p.evaluate(() => { G.dung = true; });
  await p.screenshot({ path: OUT + 'B_kynang.png' });
  await p.evaluate(() => { G.dung = false; const B = G.ban[0], T = _T; G.hu.push({ k: 'rewind', t: 0.1, song: 0.6, B, T, keo: [] }); VX.trieu(T); });
  await cho(p, 200); await p.evaluate(() => { G.dung = true; });
  await p.screenshot({ path: OUT + 'B2_rewind_trieu.png' });
  await p.close();
  // ---------- C) ụ hỗ trợ (support.js): bấm giữ → dây + khung góc + nhãn ----------
  p = await moi('?mode=solo&deck=radar,lanhgia,cuongno,soi,hydra&wave=3&fill=10&mana=99999');
  await p.evaluate(() => { const B = G.ban[0]; const T = B.t.find(t => t && laHoTro(t)); if (T) UI.xemHT = { T, t0: performance.now() - 600, giu: true }; });
  await cho(p, 300); await p.evaluate(() => { G.dung = true; });
  await p.screenshot({ path: OUT + 'C_hotro.png' });
  await p.close();
  // ---------- D) Test range (skilldemo.js) trong trang ụ ----------
  p = await moi('?mode=solo&deck=ngaithoigian,cuongno,soi,ronglua,hydra&wave=3&fill=3');
  const coUP = await p.evaluate(() => { try { G.dung = true; UP.mo('ngaithoigian'); return true; } catch (e) { return String(e); } });
  await cho(p, 3500);
  await p.screenshot({ path: OUT + 'D_testrange.png' });
  await p.close();
  console.log(JSON.stringify({ fps: +fps.toFixed(1), coUP, errs: errs.slice(0, 12) }));
  await b.close();
})();
