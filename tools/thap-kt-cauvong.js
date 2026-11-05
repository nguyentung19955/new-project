// Kiểm vệt CẦU VỒNG (HU.cauvong, ụ Rainbow) + hơi thở Leviathan (sigfx tho) qua GÓC RẼ của làn — SOLO / CO-OP / PVP.
// Mỗi góc rẽ: đặt 1 vệt cầu vồng tâm ở góc, chụp vùng phóng to; + dải "đầu vệt" mọc qua góc (6 khung).
// Chạy (gốc repo): python3 -m http.server 8765 &  rồi  TAG=truoc OUT=docs/demo-hop-tuong/tuvan/cauvong/ node tools/thap-kt-cauvong.js
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.OUT || 'shots/cauvong/', TAG = process.env.TAG || 'sau';
const W = 390, H = 844, DPR = 3;
const fps = (p, ms) => p.evaluate((ms) => new Promise(ok => { let n = 0, t0 = performance.now(); const f = (t) => { n++; if (t - t0 < ms) requestAnimationFrame(f); else ok(+(n * 1000 / (t - t0)).toFixed(1)); }; requestAnimationFrame(f); }), ms);
(async () => {
  fs.mkdirSync(OUT + 'raw/', { recursive: true });
  const b = await chromium.launch(), bg = await chromium.launch({ args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const kq = { errs: [], goc: [], fps: {} };
  for (const mode of ['solo', 'coop', 'pvp']) {
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: DPR });
    p.on('pageerror', e => kq.errs.push(mode + ': ' + e.message));
    await p.goto(`http://localhost:${process.env.PORT || 8765}/thap/?mode=${mode}&deck=lien,canon,bang,tia,set&wave=3&nointro=1`, { waitUntil: 'load' });
    await p.waitForTimeout(2500);
    await p.evaluate(() => { UI.canhBaoTrum = () => {}; G.cho = 1e9; G.hang.length = 0; for (const B of G.ban) { B.tim = 1e9; B.t.fill(null); B.ai = false; } G.quai.length = 0; G.hu.length = 0; });
    // tất cả góc rẽ (khớp giữa 2 đoạn) của mọi làn, bỏ trùng toạ độ
    const goc = await p.evaluate(() => {
      const ra = [], da = new Set();
      G.duong.forEach((pd, pi) => pd.segs.forEach((g, si) => {
        if (si === 0) return; const k = Math.round(g.x0) + ',' + Math.round(g.y0); if (da.has(k)) return; da.add(k);
        ra.push({ pi, si, x: g.x0, y: g.y0, sJ: g.s0 });
      }));
      return ra;
    });
    const R = await p.evaluate(() => { const r = document.getElementById('cv').getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width / W, h: r.height / H }; });
    const vet = (pi, s0, L, t) => p.evaluate(([pi, s0, L, t]) => {
      const pd = G.duong[pi]; const pts = []; for (let s = s0; s <= s0 + L; s += 8) pts.push(viTri(pd, s));
      G.hu.push({ k: 'cauvong', t, song: 1e9, pts, p: pd, s0, L, k2: 0.05, cham: 0, pvp: false, T: null, B: G.ban[0] });
    }, [pi, s0, L, t]);
    // 1) vệt đứng yên, tâm ở góc rẽ (giống ụ Rainbow 7★: dài 160)
    await p.evaluate(() => { G.hu.length = 0; });
    for (const g of goc) await vet(g.pi, g.sJ - 80, 160, 2);
    await p.evaluate(() => { G.dung = true; });
    await p.waitForTimeout(300);
    for (const [i, g] of goc.entries()) {
      const c = { x: R.l + (g.x - 70) * R.w, y: R.t + (g.y - 70) * R.h, width: 140 * R.w, height: 140 * R.h };
      const f = `${TAG}_${mode}_goc${i}.png`; await p.screenshot({ path: OUT + 'raw/' + f, clip: c });
      kq.goc.push({ mode, i, f, pi: g.pi, si: g.si });
    }
    await p.screenshot({ path: OUT + `raw/${TAG}_${mode}_toan.png` });
    // 2) đầu vệt mọc qua góc đầu tiên (6 khung)
    const g0 = goc[0];
    for (let k = 0; k < 6; k++) {
      await p.evaluate(() => { G.hu.length = 0; });
      await vet(g0.pi, g0.sJ - 50, 100, 0.12 + k * 0.07);
      await p.waitForTimeout(60);
      const c = { x: R.l + (g0.x - 70) * R.w, y: R.t + (g0.y - 70) * R.h, width: 140 * R.w, height: 140 * R.h };
      await p.screenshot({ path: OUT + `raw/${TAG}_${mode}_dau${k}.png`, clip: c });
    }
    await p.close();
  }
  // fps: 4 vệt cầu vồng chạy (không dừng) trên mỗi làn
  for (const mode of ['solo', 'coop', 'pvp']) {
    const p = await bg.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: DPR });
    p.on('pageerror', e => kq.errs.push(mode + ' fps: ' + e.message));
    await p.goto(`http://localhost:${process.env.PORT || 8765}/thap/?mode=${mode}&deck=lien,canon,bang,tia,set&wave=3&nointro=1`, { waitUntil: 'load' });
    await p.waitForTimeout(2500);
    await p.evaluate(() => {
      G.cho = 1e9; G.hang.length = 0; G.quai.length = 0; G.hu.length = 0;
      G.duong.forEach((pd) => { for (let j = 0; j < 4; j++) { const s0 = pd.len * (0.1 + j * 0.2), L = 160; const pts = []; for (let s = s0; s <= s0 + L; s += 8) pts.push(viTri(pd, s)); G.hu.push({ k: 'cauvong', t: 0, song: 1e9, pts, p: pd, s0, L, k2: 0.05, cham: 0, pvp: false, T: null, B: G.ban[0] }); } });
    });
    await p.waitForTimeout(1000);
    kq.fps[mode] = await fps(p, 4000);
    await p.close();
  }
  fs.writeFileSync(OUT + `raw/${TAG}_cap.json`, JSON.stringify(kq.goc));
  delete kq.goc; console.log(JSON.stringify(kq));
  fs.writeFileSync(OUT + `${TAG}_ketqua.json`, JSON.stringify(kq, null, 1));
  await b.close(); await bg.close();
})();
