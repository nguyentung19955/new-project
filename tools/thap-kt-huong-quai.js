// Pass 5 — kiểm thử HƯỚNG NHÌN quái/trùm (quaianim.js): mỗi chế độ (SOLO/CO-OP/PVP) × 12 loại quái/trùm,
// đặt 1 con giữa MỖI đoạn đường (xuống / ngang / lên), chụp 4 lần cách 140 ms → tools/thap-huong-ghep.py ghép thành dải.
// + 1 lần qua góc rẽ (8 khung × 50 ms) + fps với 60 quái. Chạy: python3 -m http.server 8765 (gốc repo) rồi
//   OUT=docs/demo-hop-tuong/tuvan/huongquai/ node tools/thap-kt-huong-quai.js
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.OUT || 'shots/huongquai/';
const W = 390, H = 844;
const QUAI = ['bo', 'bay', 'bay_bang', 'khong_lo', 'tach', 'que_tach'];
const TRUM = ['freezer', 'janus', 'joker_king', 'mad_crown', 'nightmare', 'octopus'];
const fps = (p, ms) => p.evaluate((ms) => new Promise(ok => { let n = 0, t0 = performance.now(), mx = 0, last = t0; const f = (t) => { n++; mx = Math.max(mx, t - last); last = t; if (t - t0 < ms) requestAnimationFrame(f); else ok({ fps: +(n * 1000 / (t - t0)).toFixed(1), maxFrame: +mx.toFixed(1) }); }; requestAnimationFrame(f); }), ms);
(async () => {
  fs.mkdirSync(OUT + 'raw/', { recursive: true });
  // raster GPU (swiftshader): máy kiểm thử 2 nhân CPU — raster phần mềm mặc định tự nó chỉ ~45 fps kể cả trước Pass 5
  const b = await chromium.launch(), bg = await chromium.launch({ args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const kq = { errs: [], cap: [] };
  for (const mode of ['solo', 'coop', 'pvp']) {
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
    p.on('pageerror', e => kq.errs.push(mode + ': ' + e.message));
    await p.goto(`http://localhost:8765/thap/?mode=${mode}&deck=lien,canon,bang,tia,set&wave=3&nointro=1`, { waitUntil: 'load' });
    await p.waitForTimeout(2500);
    await p.evaluate(() => { UI.canhBaoTrum = () => {}; G.cho = 1e9; G.hang.length = 0; for (const B of G.ban) { B.tim = 1e9; B.t.fill(null); B.ai = false; } G.quai.length = 0; });
    for (const id of [...QUAI, ...TRUM]) {
      const ds = await p.evaluate(([id, laTrum]) => {
        G.quai.length = 0; const ra = [];
        G.duong.forEach((pd, pi) => pd.segs.forEach((g, si) => {
          if (G.chung && pi === 1 && si > 0) return; // co-op: hành lang chung chỉ chụp 1 lần
          const s = g.s0 + g.len * (laTrum ? 0.5 : 0.45);
          const E = laTrum ? sinhTrum(id, pi) : sinhQuai(id, pi, s); E.s = s; E.vao = 1; E.knT = 1e9; E._t0 = -99;
          const huong = Math.abs(g.dx) > Math.abs(g.dy) ? (g.dx > 0 ? 'phai' : 'trai') : (g.dy > 0 ? 'xuong' : 'len');
          ra.push({ uid: E.uid, huong, pi, si });
        }));
        document.querySelectorAll('.canh-bao-trum, #canh-bao-trum').forEach(e => e.remove());
        return ra;
      }, [id, TRUM.includes(id)]);
      await p.waitForTimeout(700);
      for (let k = 0; k < 4; k++) {
        const pos = await p.evaluate(() => { const r = document.getElementById('cv').getBoundingClientRect(); return G.quai.map(E => ({ uid: E.uid, x: r.left + E.x / W * r.width, y: r.top + E.y / H * r.height, co: E.d.co * r.width / W })); });
        const f = `${mode}_${id}_${k}.png`; await p.screenshot({ path: OUT + 'raw/' + f });
        kq.cap.push({ mode, id, k, f, ds: ds.map(d => ({ ...d, ...pos.find(q => q.uid === d.uid) })) });
        await p.waitForTimeout(140);
      }
    }
    // qua góc rẽ: 3 loại, đặt ngay trước góc đầu tiên, chụp 8 lần × 50 ms
    for (const id of ['bo', 'bay', 'octopus']) {
      await p.evaluate(([id, laTrum]) => {
        G.quai.length = 0; const g = G.duong[0].segs[0];
        const E = laTrum ? sinhTrum(id, 0) : sinhQuai(id, 0, 0); E.s = g.len - (laTrum ? 6 : 12); E.vao = 1; E.knT = 1e9; E._t0 = -99;
      }, [id, TRUM.includes(id)]);
      await p.waitForTimeout(60);
      for (let k = 0; k < 8; k++) {
        const pos = await p.evaluate(() => { const r = document.getElementById('cv').getBoundingClientRect(); const E = G.quai[0]; return { x: r.left + E.x / W * r.width, y: r.top + E.y / H * r.height, co: E.d.co * r.width / W, hv: E._hv, hl: E._hl }; });
        const f = `${mode}_re_${id}_${k}.png`; await p.screenshot({ path: OUT + 'raw/' + f });
        kq.cap.push({ mode, id, k, f, re: 1, ds: [{ huong: 're ' + pos.hv + (pos.hv === 's' ? pos.hl : ''), ...pos }] });
        await p.waitForTimeout(50);
      }
    }
    await p.close();
  }
  // fps: 60 quái (12 loại) rải khắp các đường, đang đi qua góc — trình duyệt raster GPU (chụp màn ở đó rất chậm nên chỉ đo fps)
  for (const mode of ['solo', 'coop', 'pvp']) {
    const p = await bg.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
    p.on('pageerror', e => kq.errs.push(mode + ' fps: ' + e.message));
    await p.goto(`http://localhost:8765/thap/?mode=${mode}&deck=lien,canon,bang,tia,set&wave=3&nointro=1`, { waitUntil: 'load' });
    await p.waitForTimeout(2500);
    await p.evaluate(() => { UI.canhBaoTrum = () => {}; G.cho = 1e9; G.hang.length = 0; for (const B of G.ban) { B.tim = 1e9; B.t.fill(null); B.ai = false; } });
    await p.evaluate(([Q, T]) => {
      G.quai.length = 0; const ids = [...Q, ...Q, ...Q, ...Q, ...Q, ...Q, ...Q, ...Q, ...Q]; // 54 quái + 6 trùm
      ids.forEach((id, i) => { const pi = i % G.duong.length, pd = G.duong[pi]; const E = sinhQuai(id, pi, pd.len * ((i * 0.618) % 0.5)); E.vao = 1; });
      T.forEach((id, i) => { const pi = i % G.duong.length, E = sinhTrum(id, pi); E.s = G.duong[pi].len * (0.05 + i * 0.07); E.vao = 1; E.knT = 1e9; });
      document.querySelectorAll('.canh-bao-trum, #canh-bao-trum').forEach(e => e.remove());
    }, [QUAI, TRUM]);
    await p.waitForTimeout(1200);
    await p.evaluate(() => { const o = REN.veQuai; window._tq = []; REN.veQuai = function (c) { const t0 = performance.now(); o.call(this, c); _tq.push(performance.now() - t0); }; });
    kq['fps_' + mode] = { ...(await fps(p, 4000)), quai: await p.evaluate(() => G.quai.filter(E => !E.chet).length), veQuaiMs: await p.evaluate(() => { const a = _tq.slice(5).sort((x, y) => x - y); return { tb: +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(2), p95: +a[Math.floor(a.length * 0.95)].toFixed(2) }; }) };
    await p.screenshot({ path: OUT + `fps60_${mode}.png`, timeout: 60000 }).catch(() => {});
    await p.close();
  }
  fs.writeFileSync(OUT + 'raw/cap.json', JSON.stringify(kq.cap));
  delete kq.cap; console.log(JSON.stringify(kq, null, 1));
  fs.writeFileSync(OUT + 'ketqua.json', JSON.stringify(kq, null, 1));
  await b.close(); await bg.close();
})();
