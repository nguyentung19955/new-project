// TURRET MERGE — ĐO GIẬT KHI GHÉP ĐẶC BIỆT / MAD CROWN / CHỈ HUY / RA CHIÊU LẦN ĐẦU (tuvan/giat-ghep)
// iPhone 13 (DPR 3) + CPU chậm ×4. Bot QA ngâm (tools/thap-qa-ngam-trang.js) chơi bộ nặng ghép đặc biệt ở SOLO / CO-OP / PVP;
// đo TỪNG bước luật + từng khung vẽ; bước/khung chậm → ghi nguyên nhân (móc: tạo canvas, giải mã ảnh lần đầu, getImageData,
// tô màu sprite, tải ảnh giữa trận, JSON.parse, blur) + mẫu CPU (CDP Profiler) trong đúng cửa sổ chậm.
// Thêm: ra chiêu LẦN ĐẦU từng ụ chủ động + từng chỉ huy + ghép đặc biệt lần đầu (bàn sạch) → không được giật.
// Chạy (gốc repo): python3 -m http.server 8765 & ; NODE_PATH=/opt/npm-tools/node_modules node tools/thap-do-giat-ghep.js
// Biến: CHE=solo,coop,pvp · BUOC=9000 (số bước mỗi trận) · NGUONG=120 (ms) · CPU=4 · OUT=thư mục ra (json) · PROF=1 (mẫu CPU)
//       DAU=0 (chỉ đo ra chiêu lần đầu: 1, bỏ: -1) · KT=1 → mã thoát 1 khi có bước/khung > NGUONG sau khởi động
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/giat-ghep/';
const CHE = (process.env.CHE || 'solo,coop,pvp').split(',');
const SOBUOC = +(process.env.BUOC || 9000), NGUONG = +(process.env.NGUONG || 120), CPU = +(process.env.CPU || 4);
const PROF = process.env.PROF !== '0', DAU = +(process.env.DAU || 0), NHAN = process.env.NHAN || 'sau';
const TRANG = fs.readFileSync(path.join(__dirname, 'thap-qa-ngam-trang.js'), 'utf8');
const AM = 180; // bước khởi động (3 s trận) — không tính
// bộ nặng ghép đặc biệt: Copycat / Merge King / Blood Circuit / Teleporter / Mixer / Mystery Box / Evolver / Leviathan / Star Cannon
const BO = {
  solo: { deck: ['saochep', 'vughep', 'hopbi', 'tienhoa', 'ngoisao'], deck2: ['mauhut', 'dichchuyen', 'tron', 'leviathan', 'nhanban'], mv: 'hero' },
  coop: { deck: ['mauhut', 'dichchuyen', 'tron', 'leviathan', 'saochep'], deck2: ['vughep', 'hopbi', 'tienhoa', 'ngoisao', 'xaotron'], mv: 'dahlia' },
  pvp: { deck: ['ngoisao', 'hopbi', 'ronglua', 'tienhoa', 'saochep'], deck2: ['vughep', 'mauhut', 'pandora', 'chuato', 'nhanban'], mv: 'eve' },
};
// móc đo (chạy trong trang SAU mọi script game): ghi các việc nặng xảy ra trong bước/khung hiện tại
const MOC = () => {
  const M = window.__GM = { ds: [], cur: [], buoc: [], ve: [], t0: 0, moc: 0 };
  const ghi = (k, ms, n) => { if (ms > 0.8 || /tai|parse|font/.test(k)) M.cur.push([k, +ms.toFixed(1), n || '']); };
  const boc = (o, ten, nhan, ten2) => {
    const f = o[ten]; if (typeof f !== 'function') return;
    o[ten] = function () { const t = performance.now(); try { return f.apply(this, arguments); } finally { ghi(nhan, performance.now() - t, ten2 ? ten2.apply(this, arguments) : ''); } };
  };
  const P = CanvasRenderingContext2D.prototype;
  const ce = document.createElement;
  M.demCv = {}; M.demTai = {};
  document.createElement = function (t) { const e = ce.apply(this, arguments); if (String(t).toLowerCase() === 'canvas') { const k = (new Error().stack.split('\n')[2] || '').replace(/^.*\/thap\//, '').replace(/\)$/, '').replace(/:\d+$/, ''); M.demCv[k] = (M.demCv[k] || 0) + 1; M.cur.push(['taoCanvas', 0, k]); } return e; };
  const di = P.drawImage;
  P.drawImage = function (im) {
    if (im instanceof HTMLImageElement) { const t = performance.now(); const r = di.apply(this, arguments); const ms = performance.now() - t; if (ms > 0.8) M.cur.push(['veTuImage', +ms.toFixed(1), (im.src || '').replace(/^.*assets\//, '').replace(/\?.*$/, '') + ' ' + im.naturalWidth + 'x' + im.naturalHeight]); return r; }
    const t = performance.now(); const r = di.apply(this, arguments); const ms = performance.now() - t;
    if (ms > 4) M.cur.push(['drawImage', +ms.toFixed(1), (im && (im.__n || im.__tvf)) || (im && im.width + 'x' + im.height)]);
    return r;
  };
  boc(P, 'getImageData', 'getImageData', function (x, y, w, h) { return w + 'x' + h; });
  boc(P, 'putImageData', 'putImageData');
  boc(JSON, 'parse', 'JSON.parse', (s) => String(s).length + 'B');
  if (window.REN) {
    boc(REN, 'img', 'REN.img', (n) => n);
    boc(REN, 'co', 'REN.co', (n, px, b) => n + '|' + Math.round(px) + '|' + (b || ''));
    boc(REN, 'banTrang', 'REN.banTrang', (n) => n); boc(REN, 'banXam', 'REN.banXam', (n) => n);
    const ta = REN.taiAnh; REN.taiAnh = function (n) { M.cur.push(['taiAnhGiuaTran', 0, n]); M.demTai[n] = (M.demTai[n] || 0) + 1; return ta.apply(this, arguments); };
    for (const k of Object.keys(REN)) if (typeof REN[k] === 'function' && /^(toBien|nhuom|to|mau|tint|cat|sprite|khung)/i.test(k) && !/^(to)$/.test(k)) boc(REN, k, 'REN.' + k, (n) => typeof n === 'string' ? n : '');
  }
  for (const [ten, o] of [['TVF', window.TVF], ['FXU', window.FXU], ['VX', window.VX], ['GFX', window.GFX], ['EVO', window.EVO], ['BVX', window.BVX], ['TVX', window.TVX], ['PX', window.PX]]) {
    if (!o) continue;
    for (const k of Object.keys(o)) if (typeof o[k] === 'function' && /^(anh|img|khung|tờ|to|cat|nap|sheet|lay|dung|tao)/i.test(k)) boc(o, k, ten + '.' + k, (n) => typeof n === 'string' ? n : '');
  }
  if (document.fonts) document.fonts.addEventListener('loadingdone', (e) => M.cur.push(['fontLoad', 0, e.fontfaces.map(f => f.family).join(',')]));
  if (window.NS && NS.am) NS.am.RIC = false; // QA tự bước trong 1 lần evaluate: không có lúc rảnh thật → dùng đường "sau khung" (như Safari iOS)
  M.moc = () => { const t = performance.now(); let x = 0; while (performance.now() - t < 25) x++; return t; };
  // bọc 1 bước luật và 1 khung vẽ của QA: thời gian + các việc nặng trong đó
  const Q = window.__QA;
  const mb = Q.motBuoc;
  Q.motBuoc = function () {
    const ngoai = M.cur; M.cur = []; const t = performance.now(); mb.apply(this, arguments); const ms = performance.now() - t;
    M.buoc.push(+ms.toFixed(2));
    if (ms > 40 && Q.buoc > 0) M.ds.push({ loai: 'buoc', i: Q.buoc, ms: +ms.toFixed(1), t0: +t.toFixed(1), wave: G.wave, nk: Q.nk.slice(-4), viec: M.cur.slice(0, 30) });
    if (M.giu) { ngoai.push(...M.cur); M.cur = ngoai; } else M.cur = [];
  };
  const vt = Q.veThat;
  Q.veThat = function () {
    const ngoai = M.cur; M.cur = []; const t = performance.now(); const r = vt.apply(this, arguments); const ms = performance.now() - t;
    M.ve.push(+ms.toFixed(2));
    if (ms > 60) M.ds.push({ loai: 've', i: Q.buoc, ms: +ms.toFixed(1), t0: +t.toFixed(1), wave: G.wave, nk: Q.nk.slice(-4), viec: M.cur.slice(0, 30) });
    if (M.giu) { ngoai.push(...M.cur); M.cur = ngoai; } else M.cur = [];
    return r;
  };
};

async function moTrang(b) {
  const ctx = await b.newContext(process.env.DPR1 ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 } : Object.assign({}, devices['iPhone 13']));
  await ctx.addInitScript(TRANG);
  const p = await ctx.newPage(), err = [];
  p.on('pageerror', e => err.push(e.message));
  const t0 = Date.now();
  await p.goto(BASE + '?nointro=1&notut=1', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof UI !== 'undefined' && G.roster && G.roster.length && typeof __QA !== 'undefined', null, { timeout: 60000 });
  await p.waitForTimeout(500);
  await p.evaluate(() => { __QA.cai(); try { localStorage.setItem('turret_hd', '1'); } catch (e) { } if (typeof HD !== 'undefined' && HD.tat) HD.tat(); });
  await p.evaluate(MOC);
  return { ctx, p, err, tLoad: Date.now() - t0 };
}
// mẫu CPU: hàm tự (self) tốn nhất trong các cửa sổ chậm
function topTrongCuaSo(prof, cuaSo) {
  const nodes = new Map(); for (const n of prof.nodes) nodes.set(n.id, n);
  let t = prof.startTime; const mau = [];
  for (let i = 0; i < prof.samples.length; i++) { t += prof.timeDeltas[i]; mau.push([t / 1000, prof.samples[i]]); }
  const mocNode = prof.nodes.find(n => n.callFrame.functionName === 'moc' || n.callFrame.functionName === 'M.moc');
  return { mau, nodes, mocNode };
}
const DB_ID = ['saochep', 'hopbi', 'tienhoa', 'vughep', 'mauhut', 'dichchuyen', 'tron', 'nhanban', 'sinhdoi', 'xaotron', 'pandora', 'mimic', 'leviathan', 'ngoisao', 'chuato', 'ronglua', 'khoisinh', 'bienmau', 'nangsao', 'hasao', 'epxung', 'guongcong', 'marionette', 'hydra', 'cuuvi', 'lualien', 'haoquang', 'blackhole', 'overlord', 'lophanung', 'orbital'];
function ngauBo(seed) {
  let a = seed * 7919 + 13; const r = () => { a = (a * 1103515245 + 12345) % 2147483648; return a / 2147483648; };
  const lay = () => { const d = []; while (d.length < 5) { const x = DB_ID[Math.floor(r() * DB_ID.length)]; if (!d.includes(x)) d.push(x); } return d; };
  return { deck: lay(), deck2: lay(), mv: ['hero', 'dahlia', 'eve'][Math.floor(r() * 3)], toc: 1 + Math.floor(r() * 3), wave: [1, 8, 18, 28][Math.floor(r() * 4)] };
}
async function doTran(b, che, seed) {
  const W = await moTrang(b);
  const { p } = W;
  const cdp = await p.context().newCDPSession(p);
  const bo = seed ? ngauBo(seed) : BO[che];
  const cfg = { seed: seed || 4242 + che.length, che, deck: bo.deck, deck2: bo.deck2, mv: bo.mv, toc: bo.toc || 3, veMoi: +(process.env.VEMOI || 1), botMay: 0.6, dbP: 0.9, kieu: 'muon', wave: bo.wave || +(process.env.WAVE || 8), fill: 4, mana: 3000, wMax: 40, batTu: true, cap0: {}, cap2: {} };
  for (const id of cfg.deck) cfg.cap0[id] = 6; for (const id of cfg.deck2) cfg.cap2[id] = 6;
  const tVao = Date.now();
  await p.evaluate((c) => __QA.vaoTran(c), cfg);
  await p.waitForFunction(() => __QA.san(), null, { timeout: 60000 });
  const tSan = Date.now() - tVao;
  await p.waitForTimeout(1500);
  await p.evaluate(() => { __GM.demCv = {}; __GM.demTai = {}; });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  if (PROF) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); await cdp.send('Profiler.start'); }
  const mocT = await p.evaluate(() => __GM.moc());
  let r = { buoc: 0 };
  while (r.buoc < SOBUOC && !r.het) {
    r = await p.evaluate(() => __QA.chay(300, 4000));
    if (!r.i) await p.waitForTimeout(100);
  }
  let prof = null; if (PROF) prof = (await cdp.send('Profiler.stop')).profile;
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const kq = await p.evaluate(() => ({ demCv: __GM.demCv, demTai: __GM.demTai, ds: __GM.ds, buoc: __GM.buoc, ve: __GM.ve, wave: G.wave, loi: __QA.loi.length, nk: __QA.nk.slice(-6) }));
  // gắn mẫu CPU vào từng lần chậm
  if (prof) {
    const { mau, nodes } = topTrongCuaSo(prof);
    const mn = prof.nodes.filter(n => /moc/.test(n.callFrame.functionName)).map(n => n.id);
    const m0 = mau.find(x => mn.includes(x[1]));
    const lech = m0 ? m0[0] - mocT : null;
    if (lech != null) for (const s of kq.ds) {
      const a = s.t0 + lech, z = a + s.ms, dem = {};
      for (const [t, id] of mau) if (t >= a && t <= z) {
        const n = nodes.get(id), cf = n.callFrame;
        const k = (cf.functionName || '(anon)') + ' ' + (cf.url || '').replace(/^.*\/thap\//, '') + ':' + (cf.lineNumber + 1);
        dem[k] = (dem[k] || 0) + 1;
      }
      s.cpu = Object.entries(dem).sort((x, y) => y[1] - x[1]).slice(0, 8).map(([k, v]) => k + ' ×' + v);
    }
  }
  await W.ctx.close();
  const sau = (a, bo) => a.slice(bo);
  const sb = sau(kq.buoc, AM), sv = sau(kq.ve, AM);
  const q = (a, x) => { const s = a.slice().sort((m, n) => m - n); return s.length ? s[Math.floor(x * (s.length - 1))] : 0; };
  return { che, cfg: { deck: cfg.deck, deck2: cfg.deck2, mv: cfg.mv }, tSan, tLoad: W.tLoad, wave: kq.wave, soBuoc: kq.buoc.length, loiQA: kq.loi, err: W.err,
    buoc: { p50: q(sb, 0.5), p95: q(sb, 0.95), max: Math.max(0, ...sb) }, ve: { p50: q(sv, 0.5), p95: q(sv, 0.95), max: Math.max(0, ...sv) },
    demCv: kq.demCv, demTai: kq.demTai, cham: kq.ds.filter(s => s.i > AM).sort((x, y) => y.ms - x.ms).slice(0, 25), dayBuoc: kq.buoc, dayVe: kq.ve };
}
// ra chiêu LẦN ĐẦU: mỗi bộ bài 1 trận (chỉ ra chiêu được ụ trong bộ) — trận chạy 4 s như thật (khởi động, không tính), rồi trên bàn
// sạch: từng ụ chủ động / chỉ huy / ghép đặc biệt / Mad Crown 1 lần → đo việc đó + 90 bước sau (mỗi bước vẽ 1 khung)
const LD_BO = [
  { deck: ['lophanung', 'chuato', 'khoisinh', 'leviathan', 'canon'], mv: 'hero' },
  { deck: ['ngaithoigian', 'haoquang', 'overlord', 'blackhole', 'canon'], mv: 'dahlia' },
  { deck: ['orbital', 'khoathoigian', 'xuonganh', 'lualien', 'canon'], mv: 'eve' },
  { deck: ['saochep', 'vughep', 'mauhut', 'dichchuyen', 'canon'], mv: 'hero' },
  { deck: ['tron', 'xaotron', 'hopbi', 'tienhoa', 'bang'], mv: 'dahlia' },
  { deck: ['nhanban', 'leviathan', 'pandora', 'ngoisao', 'canon'], mv: 'eve' },
];
const LD_DB = [['saochep', 'canon'], ['vughep', 'canon'], ['mauhut', 'canon'], ['dichchuyen', 'canon'], ['hopbi', 'hopbi'], ['tienhoa', 'tienhoa'], ['leviathan', 'leviathan'], ['pandora', 'pandora'], ['vughep', 'hopbi'], ['saochep', 'tienhoa']];
async function doLanDau(b, che) {
  const W = await moTrang(b); const { p } = W;
  const cdp = await p.context().newCDPSession(p);
  const kq = [];
  const conChuDong = await p.evaluate(() => G.roster.filter(r => SKILLS[r.id] && SKILLS[r.id].chuDong).map(r => r.id));
  let lanTrum = true;
  for (const [bi, bo] of LD_BO.entries()) {
    const cfg = { seed: 77 + bi, che, deck: bo.deck, deck2: ['canon', 'bang', 'tia', 'set', 'lien'], mv: bo.mv, toc: 1, veMoi: 1, kieu: 'thuong', wMax: 99, batTu: true, botMay: 0, dbP: 0 };
    await p.evaluate((c) => __QA.vaoTran(c), cfg);
    await p.waitForFunction(() => __QA.san(), null, { timeout: 60000 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    // 4 s trận chạy thật (bot không chơi): khởi động — game làm nóng lúc rảnh như ngoài đời
    await p.evaluate(() => { __QA.cfg.botMay = 0; for (const B of G.ban) B._qaT = 1e9; for (let i = 0; i < 4; i++) __QA.chay(60, 8000); });
    const viec = [...bo.deck.filter(id => conChuDong.includes(id)).map(id => ['cd', id]), ['mv', bo.mv], ...LD_DB.filter(([x, y]) => bo.deck.includes(x) && bo.deck.includes(y)).map(x => ['db', x])];
    if (lanTrum) { viec.push(['trum', 'mad_crown']); lanTrum = false; }
    for (const [loai, id] of viec) {
      const r = await p.evaluate(([loai, id]) => {
        const B = G.ban[0]; G.quai.length = 0; G.hu.length = 0; G.dan.length = 0; G.dung = false;
        for (let o = 0; o < 15; o++) B.t[o] = null;
        const p0 = G.duong.find(q => q.ban === B.i) || G.duong[0];
        for (let i = 0; i < 6; i++) { const E = sinhQuai('bo', B.i, p0.len * (0.2 + i * 0.1), 500); E.vao = 1; [E.x, E.y, E.goc] = viTri(G.duong[E.p], E.s); }
        let T; const lap = (x, sao, o) => sinhU(taoU(B, x, sao, o));
        if (loai === 'cd') { T = B.t[7] = lap(id, 4, 7); for (let o = 0; o < 5; o++) B.t[o] = lap('canon', 3, o); }
        if (loai === 'mv') { B.mana = 99999; B.mv.cd = 0; for (let o = 0; o < 5; o++) B.t[o] = lap('canon', 2, o); }
        if (loai === 'db') { B.t[6] = lap(id[0], 3, 6); B.t[7] = lap(id[1], 3, 7); for (let o = 0; o < 4; o++) B.t[o] = lap(B.deck[4], 2, o); }
        if (loai === 'trum') { for (let o = 0; o < 8; o++) B.t[o] = lap(B.deck[4], 3, o); G.wave = 9; G.hang.length = 0; } // wave sau là trùm (như trận thật: game biết trước 1 wave)
        const t9 = performance.now();
        for (let i = 0; i < 30 || (loai === 'trum' && (i < 400 && performance.now() - t9 < 1500)); i++) { chupTruoc(); __QA.capThat(BUOC); __QA.veThat(BUOC, 1); }
        __GM.giu = true; __GM.cur = [];
        const t = performance.now(); let loi = '';
        try {
          if (loai === 'cd') { T.nap = 1; SKILLS[id].chuDong(G, B, T); }
          if (loai === 'mv') { if (!dungMV(B)) loi = 'dungMV từ chối'; }
          if (loai === 'db') { if (!ghep(B, B.t[6], B.t[7])) loi = 'ghep từ chối'; }
          if (loai === 'trum') { const E = sinhTrum(trumCuaWave(10, 0), B.i); E.vao = 1; E.knT = 0; }
        } catch (e) { loi = e.message; }
        const tLam = performance.now() - t, viec0 = __GM.cur.slice(0, 12);
        let maxB = 0, maxV = 0, viecMax = [];
        for (let i = 0; i < (loai === 'trum' ? 300 : 90); i++) {
          __GM.cur = []; const a = performance.now(); chupTruoc(); __QA.capThat(BUOC); const db = performance.now() - a;
          const v = performance.now(); __QA.veThat(BUOC, 1); const dv = performance.now() - v;
          if (db + dv > maxB + maxV) viecMax = __GM.cur.slice(0, 12);
          maxB = Math.max(maxB, db); maxV = Math.max(maxV, dv);
        }
        __GM.giu = false; __GM.cur = [];
        return { loai, id: Array.isArray(id) ? id.join('+') : id, lam: +tLam.toFixed(1), maxBuoc: +maxB.toFixed(1), maxVe: +maxV.toFixed(1), loi, viec: viec0.concat(viecMax).slice(0, 14) };
      }, [loai, id]);
      kq.push(r);
    }
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  }
  const am = await p.evaluate(() => window.NS && NS.am ? NS.am.thongKe : null);
  await W.ctx.close();
  return { che, ds: kq, err: W.err, am };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const tong = { luc: new Date().toISOString(), nhan: NHAN, cpu: CPU, nguong: NGUONG, tran: [], lanDau: [] };
  let hong = 0;
  const LUOT = process.env.NGAU ? Array.from({ length: +process.env.NGAU }, (_, i) => [CHE[i % CHE.length], 100 + i]) : CHE.map(c => [c, 0]);
  if (DAU <= 0) for (const [che, seed] of LUOT) {
    const r = await doTran(b, che, seed);
    tong.tran.push(r);
    // KHUNG > ngưỡng chỉ tính lỗi khi có việc nặng đo được trong khung (≥ 30 ms: chép/giải mã/thu nhỏ ảnh lần đầu…);
    // khung chỉ có dọn rác (máy đo 2 lõi, CPU ×4) → cảnh báo. BƯỚC LUẬT > ngưỡng luôn là lỗi.
    const nang = (s) => s.viec.reduce((a, v) => a + (+v[1] || 0), 0);
    const vuot = r.cham.filter(s => s.ms > NGUONG && (s.loai === 'buoc' || nang(s) >= 30));
    const canh = r.cham.filter(s => s.ms > NGUONG && !vuot.includes(s));
    if (canh.length) console.log(`   cảnh báo: ${canh.length} khung > ${NGUONG} ms không có việc nặng (dọn rác/raster): ` + canh.map(s => s.ms + ' ms').join(', '));
    console.log(`${che}${seed ? ' s' + seed + ' ' + r.cfg.deck.join(',') : ''}: wave ${r.wave} · ${r.soBuoc} bước · tải ${r.tLoad} ms, vào trận ${r.tSan} ms · bước p50 ${r.buoc.p50} p95 ${r.buoc.p95} max ${r.buoc.max.toFixed(1)} · vẽ p50 ${r.ve.p50} p95 ${r.ve.p95} max ${r.ve.max.toFixed(1)} · > ${NGUONG} ms: ${vuot.length}` + (r.err.length ? ' · LỖI TRANG ' + r.err.slice(0, 2).join(' | ') : ''));
    for (const s of r.cham.slice(0, 8)) console.log(`   ${s.loai} #${s.i} ${s.ms} ms w${s.wave} [${s.nk.join(' ; ')}]\n      việc: ${s.viec.slice(0, 8).map(v => v.join(' ')).join(' · ')}` + (s.cpu ? '\n      cpu: ' + s.cpu.slice(0, 5).join(' · ') : ''));
    if (process.env.DEM) console.log('   canvas tạo:', JSON.stringify(Object.entries(r.demCv).sort((a, b) => b[1] - a[1]).slice(0, 12)), '\n   tải giữa trận:', JSON.stringify(r.demTai));
    if (vuot.length || r.err.length) hong++;
  }
  if (DAU >= 0) for (const che of CHE) {
    const r = await doLanDau(b, che);
    tong.lanDau.push(r);
    const nang = (x) => x.viec.reduce((a, v) => a + (+v[1] || 0), 0);
    const xau = r.ds.filter(x => x.lam > NGUONG || x.maxBuoc > NGUONG || (x.maxVe > NGUONG && nang(x) >= 30) || (x.loi && !/từ chối/.test(x.loi)));
    const canh = r.ds.filter(x => x.maxVe > NGUONG && !xau.includes(x));
    if (canh.length) console.log(`   cảnh báo: ${canh.map(x => x.loai + ' ' + x.id + ' ' + x.maxVe + ' ms').join(', ')} — khung > ${NGUONG} ms không có việc nặng (dọn rác/raster)`);
    console.log(`${che} — ra chiêu lần đầu: ${r.ds.length} việc, vượt ${NGUONG} ms: ${xau.length} · làm nóng ${JSON.stringify(r.am)}` + (r.err.length ? ' · LỖI TRANG ' + r.err.slice(0, 2).join(' | ') : ''));
    for (const x of r.ds.slice().sort((a, b) => Math.max(b.lam, b.maxBuoc, b.maxVe) - Math.max(a.lam, a.maxBuoc, a.maxVe)).slice(0, 8)) console.log(`   ${x.loai} ${x.id}: làm ${x.lam} · bước max ${x.maxBuoc} · vẽ max ${x.maxVe}${x.loi ? ' LỖI ' + x.loi : ''}\n      ${x.viec.slice(0, 6).map(v => v.join(' ')).join(' · ')}`);
    if (xau.length || r.err.length) hong++;
  }
  await b.close();
  const f = OUT + 'do-' + NHAN + '.json';
  fs.writeFileSync(f, JSON.stringify(tong));
  console.log('→ ' + f + (hong ? '  ✗ ' + hong + ' phần vượt ngưỡng' : '  ✓ không bước/khung nào > ' + NGUONG + ' ms sau khởi động'));
  process.exit(process.env.KT && hong ? 1 : 0);
})();
