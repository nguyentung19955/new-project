// TURRET MERGE — đo độ mượt KÉO GHÉP trên máy giả lập yếu: CPU chậm 4× (CDP), DPR 3, 390x844, chạm.
// Bàn đầy 15 ụ (có grow-up/thần thoại) + 40 quái, FX v2. Kéo 1 ụ vòng quanh ~1.6 s rồi thả lên ô ghép hợp lệ;
// ghi thời gian mọi khung (rAF) + hồ sơ CPU (Profiler) → p50/p95/max, số khung > 16.7 / > 50 ms, hàm tốn nhất.
// Chạy: python3 -m http.server 8765 (gốc repo) rồi NODE_PATH=$(npm root -g) OUT=thu-muc/ TAG=sau node tools/thap-kt-muotghep.js [solo|coop|pvp|tap]
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.OUT || '/tmp/muotghep/'; fs.mkdirSync(OUT, { recursive: true });
const TAG = process.env.TAG || 'do', MODE = process.argv[2] || 'solo', SHOTS = !!process.env.SHOTS, THROTTLE = +(process.env.CPU || 4);
(async () => {
  const b = await chromium.launch({ args: (process.env.ARGS || '').split(' ').filter(Boolean) });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
  // đo CÔNG VIỆC LUỒNG CHÍNH mỗi khung = tổng thời gian mọi callback rAF cùng khung (mô phỏng + vẽ + HUD) — máy chủ thử không có GPU
  // nên khoảng cách khung thật bị raster phần mềm chi phối (không giống iPhone); số này là phần game kiểm soát được.
  await ctx.addInitScript(() => {
    const raf = window.requestAnimationFrame.bind(window); window.__J = []; window.__L = [];
    // ĐỒNG HỒ ẢO: bật __VT → mỗi khung rAF = đúng 16,67 ms trò chơi (như máy 60 Hz) dù máy thử raster chậm; đo vẫn bằng giờ thật
    const realNow = performance.now.bind(performance); window.__realNow = realNow; let vt = 0, vtFrame = -1;
    window.__NCT = 8;
    window.__batVT = () => { vt = realNow(); window.__VT = 1; };
    performance.now = () => window.__VT ? vt : realNow();
    let cur = -1, acc = 0; window.__nc = 0;
    const ce = Document.prototype.createElement; Document.prototype.createElement = function (n) { if (n === 'canvas') { __nc++; if (__nc > +(window.__NCT || 30)) { const k = (new Error().stack.split('\n').slice(2, 6).map(l => l.trim().replace(/^at /, '').replace(/http:\/\/localhost:8765\/thap\/js\//, '')).join(' < ')); (window.__S = window.__S || {})[k] = (__S[k] || 0) + 1; }
      if (window.__VT) { const st = new Error().stack.split('\n').slice(2, 7).map(l => l.trim().replace(/^at /, '').replace(/ \(http:\/\/localhost:\d+\/thap\/js\//, '(').replace(/:\d+\)/, ')')).join('<'); const F = (window.__SF = window.__SF || {}); (F[cur] = F[cur] || []).push(st); } } return ce.apply(this, arguments); };
    window.requestAnimationFrame = (cb) => raf((t0) => { if (window.__VT && t0 !== vtFrame) { vtFrame = t0; vt += 1000 / 60; } const t = window.__VT ? vt : t0; if (t !== cur) { if (cur >= 0) __J.push([cur, acc, typeof UI !== 'undefined' && UI.keo && UI.keo.dang ? 1 : 0, __nc]); __nc = 0; cur = t; acc = 0; } const a = realNow(); try { cb(t); } finally { acc += realNow() - a; } });
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) __L.push([e.startTime, e.duration, e.renderStart ? e.renderStart - e.startTime : 0]); }).observe({ type: 'long-animation-frame', buffered: true }); } catch (e) {}
  });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text()); });
  const che = MODE === 'tap' ? 'solo' : MODE;
  await p.goto(`http://localhost:${process.env.PORT || 8765}/thap/?mode=${che}&deck=lien,canon,bang,tia,set&wave=14&mana=99999&deck2=lien,canon,bang,tia,set`, { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length && !TAI.cho, null, { timeout: 60000 });
  await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(1000);
  await p.evaluate((y) => { window.__YEN = y; }, !!process.env.YEN);
  await p.evaluate(() => {
    try { localStorage.setItem('thap_kg_meo', '9'); } catch (e) {}
    // 15 ụ: 2 cặp ghép được (soi 4★ ở 0 & 7, overlord 5★ grow-up ở 1 & 13) + grow-up/thần thoại khác
    const ids = ['soi', 'overlord', 'hopbi', 'tienhoa', 'lophanung', 'orbital', 'cuongno', 'soi', 'ngoisao', 'lienket', 'dongbo', 'hydra', 'cuuvi', 'overlord', 'ronglua'];
    const sao = [4, 5, 5, 5, 5, 3, 3, 4, 3, 3, 3, 5, 5, 5, 5];
    G.hang.length = 0; G.quai.length = 0; G.cho = 1e9;
    for (const B of G.ban) {
      B.tim = 1e9;
      ids.forEach((id, o) => { B.lv[id] = 1; const T = sinhU(taoU(B, id, sao[o], o)); T.vxA = null; T._gs = null; if (laGrow(id)) T._epGd = 3; B.t[o] = T; });
    }
    for (let k = 0; k < G.duong.length; k++) { const p0 = G.duong[k]; const n = Math.ceil(40 / G.duong.length); for (let i = 0; i < n; i++) { const E = sinhQuai(i % 4 ? 'bo' : 'khong_lo', k, p0.len * (0.02 + i * 0.95 / n), 400); E.vao = 1; E.chan = 1e9; } }
    UI.keo = null; UI.chonGhep = null; G.dung = false;
    // YEN=1: bàn đầy + quái đứng yên nhưng ụ KHÔNG bắn → tách riêng chi phí kéo/ghép khỏi nhiễu hiệu ứng giao chiến
    if (window.__YEN) { for (const B of G.ban) for (const T of B.t) if (T) T.cd = 1e9; for (const E of G.quai) E.chan = 1e9; }
  });
  // máy chậm: game tự lùi canvas về 2× sau ~3 s khung nặng (REN.doKhung) — cho lùi TRƯỚC khi đo (DPR=3 ép: DPR3=1)
  await p.evaluate((ep) => { if (ep) { G.debug.dpr = 3; REN.coLai(); } else if (REN.dpr > 2) { REN.dprMax = 2; REN.coLai(); } }, !!process.env.DPR3);
  await p.waitForTimeout(2500); // để mọi ảnh tĩnh dựng xong (như đang chơi)
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE }); if (process.env.TL) console.error('throttle', Date.now());
  await p.waitForTimeout(1500);
  const pos = (o) => p.evaluate((o) => { const B = G.ban[0], c = B.o[o], r = document.querySelector('#cv').getBoundingClientRect(); return [r.left + c.x / W * r.width, r.top + c.y / H * r.height, Math.min(B.cw, B.ch) * 0.6 / H * r.height]; }, o);
  const khung = (n = 1) => p.evaluate((n) => new Promise(ok => { let k = 0; const f = () => (++k >= n ? ok() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
  // ghi khung: rAF đầu tiên (trước vòng game) → khoảng cách giữa 2 khung + thời gian vẽ REN.ve
  await p.evaluate(() => {
    window.__F = []; window.__R = []; let last = 0;
    const f = (t) => { if (last) __F.push([t, t - last, UI.keo && UI.keo.dang ? 1 : 0]); last = t; if (!window.__stop) requestAnimationFrame(f); };
    requestAnimationFrame(f);
    window.__dc = []; const dc0 = REN.donCache.bind(REN); REN.donCache = function () { __dc.push(((performance.now() | 0)) + ' ' + new Error().stack.split('\n').slice(2, 5).map(l => l.trim()).join(' < ')); return dc0(); };
    if (document.fonts) document.fonts.addEventListener('loadingdone', (e) => __dc.push('fonts ' + [...e.fontfaces].map(f => f.family + ' ' + f.weight).join(',')));
    // thời gian từng lớp vẽ (ms giờ thật) mỗi khung → so khung đang kéo với khung thường
    window.__P = {}; window.__PK = { k: {}, t: {}, nk: 0, nt: 0 };
    const boc = (o, ten, nhan) => { const f = o[ten]; if (typeof f !== 'function') return; o[ten] = function () { const a = __realNow(); try { return f.apply(this, arguments); } finally { __P[nhan] = (__P[nhan] || 0) + __realNow() - a; } }; };
    for (const t of ['veDongChay', 'veCongLoi', 'veNhanBan', 'veQuai', 'veO', 'veLaser', 'veDan', 'veFx', 'veKeo', 'veChu', 'lamNen']) boc(REN, t, t);
    boc(VX, 'veDs', 'VX.veDs'); boc(ND, 'veKeo', 'ND.veKeo'); boc(ND, 'veKeoTren', 'ND.veKeoTren'); boc(ND, 'veHuyHieu', 'ND.veHuyHieu'); boc(ND, 'veSoi', 'ND.veSoi');
    if (typeof CORE !== 'undefined') boc(CORE, 'veHud', 'CORE.veHud');
    boc(UI, 'capNhat', 'UI.capNhat'); boc(FX, 'capNhat', 'FX.capNhat'); boc(GF, 'capNhat', 'GF.capNhat'); boc(GF, 'veGhep', 'GF.veGhep'); boc(GF, 'veUCam', 'GF.veUCam'); boc(GF, 'veDuoi', 'GF.veDuoi');
    { const c0 = capNhat; capNhat = function () { const a = __realNow(); try { return c0.apply(this, arguments); } finally { __P.sim = (__P.sim || 0) + __realNow() - a; } }; }
    boc(REN, 've', 'REN.ve');
    { const ve1 = REN.ve; REN.ve = function () { const r = ve1.apply(this, arguments); const g = UI.keo && UI.keo.dang ? 'k' : (GF.mg.length ? 'm' : 't'); const D = __PK[g] = __PK[g] || {}; __PK['n' + g] = (__PK['n' + g] || 0) + 1; for (const k in __P) D[k] = (D[k] || 0) + __P[k]; __P = {}; return r; }; }
    window.__ghep = 0; const g0 = ghep; ghep = function () { const r = g0.apply(this, arguments); if (r) __ghep++; return r; };
    const ve = REN.ve.bind(REN); REN.ve = function (dt, a) { const t0 = __realNow(); const r = ve(dt, a); __R.push(__realNow() - t0); return r; }; __batVT();
  });
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); await cdp.send('Profiler.start');
  const st0 = await p.evaluate(() => G.ban[0].t.map(T => T ? T.id + T.sao : '-').join(' '));
  const tStart = await p.evaluate(() => performance.now());
  const shots = [];
  const clip = await p.evaluate(() => { const B = G.ban[0], r = document.querySelector('#cv').getBoundingClientRect(), k = r.width / W; return { x: Math.max(0, r.left + (B.x - 6) * k), y: Math.max(0, r.top + (B.y - 46) * k), width: (B.w + 12) * k, height: (B.h + 70) * k }; });
  if (MODE === 'tap') {
    for (let r = 0; r < 3; r++) {
      const [x0, y0] = await pos(r ? 13 : 0); await touch('touchStart', x0, y0); await touch('touchEnd', x0, y0); await khung(20);
      const [x1, y1] = await pos(r ? 1 : 7); await touch('touchStart', x1, y1); await touch('touchEnd', x1, y1); await khung(60);
      await p.evaluate((r) => { const B = G.ban[0]; const put = (o, id, s) => { B.t[o] = sinhU(taoU(B, id, s, o)); B.t[o].vxA = null; B.t[o]._gs = null; if (laGrow(id)) B.t[o]._epGd = 3; }; put(0, 'soi', 4); put(7, 'soi', 4); put(1, 'overlord', 5); put(13, 'overlord', 5); }, r);
      await khung(15);
    }
  } else {
    for (let r = 0; r < (process.env.MOT ? 1 : 2); r++) {
      const src = r ? 13 : 0, dst = r ? 1 : 7;
      const [x0, y0] = await pos(src), [xt, yt, lech] = await pos(dst);
      await touch('touchStart', x0, y0);
      await khung(4); // ngón ấn ~65 ms rồi mới rê (như tay thật)
      if (process.env.TL) console.error('keo', r, Date.now());
      const N = 90; // 90 khung (~1,5 s) vòng quanh bàn, 1 điểm chạm / khung
      for (let i = 1; i <= N; i++) {
        const u = i / N, a = u * Math.PI * 2;
        const x = x0 + (xt - x0) * u + Math.sin(a) * 90 * (1 - u), y = y0 + (yt + lech - y0) * u + Math.sin(a * 2) * 60 * (1 - u);
        await touch('touchMove', x, y); await khung(1);
        if (SHOTS && r === 0 && i % 15 === 0) shots.push(await p.screenshot({ path: OUT + `${TAG}_${MODE}_keo${i}.png`, clip }));
      }
      await khung(8);
      await touch('touchEnd', xt, yt + lech);
      if (SHOTS && r === 0) for (let k = 0; k < 8; k++) { await khung(7); await p.screenshot({ path: OUT + `${TAG}_${MODE}_tha${k}.png`, clip }); }
      else await khung(60);
      await p.evaluate(() => { const B = G.ban[0]; const put = (o, id, s) => { B.t[o] = sinhU(taoU(B, id, s, o)); B.t[o].vxA = null; B.t[o]._gs = null; if (laGrow(id)) B.t[o]._epGd = 3; }; put(0, 'soi', 4); put(7, 'soi', 4); put(1, 'overlord', 5); put(13, 'overlord', 5); if (window.__YEN) for (const T of B.t) if (T) T.cd = 1e9; });
      await khung(15);
    }
  }
  const { profile } = await cdp.send('Profiler.stop');
  await p.evaluate(() => { window.__stop = 1; });
  const st1 = await p.evaluate(() => G.ban[0].t.map(T => T ? T.id + T.sao : '-').join(' '));
  const F = await p.evaluate((t0) => __J.filter(f => f[0] > t0).map(f => f[1]), tStart);
  if (process.env.TL) fs.writeFileSync(OUT + `${TAG}_${MODE}_tl.txt`, (await p.evaluate((t0) => __J.filter(f => f[0] > t0).map(f => `${(f[0] - t0) | 0}:${f[1].toFixed(0)}${f[2] ? 'k' : ''}${f[3] ? 'c' + f[3] : ''}`).join(' '), tStart)).replace(/ /g, "\n"));
  if (process.env.TL) console.log(await p.evaluate((t0) => Object.entries(window.__SF || {}).filter(([t, a]) => a.length >= 12).map(([t, a]) => { const c = {}; for (const x of a) c[x] = (c[x] || 0) + 1; return ((+t - t0) | 0) + ' (' + a.length + ')\n   ' + Object.entries(c).sort((x, y) => y[1] - x[1]).slice(0, 6).map(([k, v]) => v + '× ' + k).join('\n   '); }).join('\n'), tStart));
  if (process.env.TL) console.log(await p.evaluate(() => __dc.join('\n')), await p.evaluate(() => window.__batVTt));
  if (process.env.TL) console.log(JSON.stringify(Object.entries(await p.evaluate(() => window.__S || {})).sort((a, b) => b[1] - a[1]).slice(0, 12), null, 1));
  { const PK = await p.evaluate(() => __PK); const bang = {}; for (const g of ['t', 'k', 'm']) { const D = PK[g] || {}, n = PK['n' + g] || 1; for (const k in D) (bang[k] = bang[k] || {})[g] = +(D[k] / n).toFixed(2); } console.log('lop (ms/khung) t=thuong k=keo m=ghep', JSON.stringify(PK.nt), JSON.stringify(PK.nk), JSON.stringify(PK.nm)); console.table(bang); }
  const FI = await p.evaluate((t0) => __F.filter(f => f[0] > t0).map(f => f[1]), tStart);
  const L = await p.evaluate((t0) => __L.filter(f => f[0] > t0), tStart);
  const R = await p.evaluate(() => __R.slice());
  const pc = (a, q) => { const s = a.slice().sort((x, y) => x - y); return +s[Math.min(s.length - 1, Math.floor(q * s.length))].toFixed(1); };
  // hàm tốn nhất (self time)
  const byId = new Map(profile.nodes.map(n => [n.id, n])), self = new Map();
  const dts = profile.timeDeltas; profile.samples.forEach((id, i) => { const n = byId.get(id); const k = n.callFrame.functionName + ' ' + (n.callFrame.url.split('/').pop()) + ':' + (n.callFrame.lineNumber + 1); self.set(k, (self.get(k) || 0) + (dts[i] || 0) / 1000); });
  const tot = [...self.values()].reduce((a, b) => a + b, 0);
  const top = [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => `${(v / tot * 100).toFixed(1)}% ${k}`);
  const kq = { tag: TAG, mode: MODE, cpu: THROTTLE + 'x', dpr: await p.evaluate(() => REN.dpr), frames: F.length,
    p50: pc(F, 0.5), p95: pc(F, 0.95), p99: pc(F, 0.99), max: +Math.max(...F).toFixed(1), over16: F.filter(x => x > 16.7 + 0.5).length, over33: F.filter(x => x > 34).length, over50: F.filter(x => x > 50).length,
    khoangKhungP50: pc(FI, 0.5), loafOver50: L.filter(x => x[1] > 50).length, loafMax: L.length ? +Math.max(...L.map(x => x[1])).toFixed(1) : 0,
    veP95: pc(R, 0.95), veMax: +Math.max(...R).toFixed(1), merged: await p.evaluate(() => __ghep), errs: errs.slice(0, 6), top };
  fs.writeFileSync(OUT + `${TAG}_${MODE}.json`, JSON.stringify({ ...kq, F }, null, 0));
  console.log(JSON.stringify(kq, null, 1));
  await b.close();
})();
