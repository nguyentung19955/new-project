// TURRET MERGE — QA NGÂM (soak): bot chơi THẬT hàng trăm trận qua đúng code game, kiểm bất biến mỗi bước.
// Chế độ: SOLO (tới wave 70), CO-OP (2 bot), PVP (bot đấu bot), ONLINE CO-OP (2 trình duyệt + máy chủ giả), tốc 1×/2×/3×.
// Bộ bài: ngẫu nhiên trong 93 ụ (nghiêng về ụ đặc biệt / biến hình / vàng & đỏ mới) + bộ thật của người chơi.
// Mỗi trận có hạt giống → tái lập: SEED=<hạt> CHE=<che> node tools/thap-qa-ngam.js (in lại đúng trận đó).
// Chạy (gốc repo):
//   python3 -m http.server 8765 &
//   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-online-mock-server.js 8787 &      (chỉ cần cho ONLINE)
//   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-qa-ngam.js                         (mặc định 300 trận)
// Biến môi trường: SO=300 (số trận) · LUONG=2 (số trang chạy song song) · CHE=solo,coop,pvp,online · SEED0=1 (hạt đầu)
//   SEED=<n> (chỉ 1 trận) · NHIN=8 (số trận chụp ảnh iPhone 13 mỗi ~8 s trận) · PHUT=240 (trần thời gian) · OUT=thư mục báo cáo
//   TAILAP=12 (số trận chạy lại so băm tái lập) · ONLINE=4 (số trận online) · KHONG_DAI=1 (bỏ trận dài tới wave 70)
// Ra: OUT/ket-qua.json (mọi trận + lỗi), OUT/loi.txt (gọn), ảnh OUT/anh/. Mã thoát 1 nếu có lỗi.
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const MOCK = +(process.env.MOCK || 8787);
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/qa-ngam/chay/';
const SO = +(process.env.SO || 300), LUONG = +(process.env.LUONG || 2), SEED0 = +(process.env.SEED0 || 1);
const CHE = (process.env.CHE || 'solo,coop,pvp').split(',');
const NHIN = +(process.env.NHIN != null ? process.env.NHIN : 8), TAILAP = +(process.env.TAILAP != null ? process.env.TAILAP : 12);
const PHUT = +(process.env.PHUT || 240), ONLINE = +(process.env.ONLINE != null ? process.env.ONLINE : 4);
const DO = require('./thap-kt-tran-do.js');
const TRANG = fs.readFileSync(path.join(__dirname, 'thap-qa-ngam-trang.js'), 'utf8');
fs.mkdirSync(OUT + 'anh/', { recursive: true }); try { fs.unlinkSync(OUT + 'tran.jsonl'); } catch (e) { }
const T0 = Date.now();
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const mb = (a) => function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

// ---------- bộ bài ----------
// ụ đặc biệt / biến hình / ghép kéo / vàng & đỏ mới — trọng số cao
const DAC_BIET = ['saochep', 'hopbi', 'tienhoa', 'vughep', 'mauhut', 'loren', 'dichchuyen', 'tron', 'nhanban', 'sinhdoi', 'soi', 'xaotron', 'pandora',
  'nangsao', 'hasao', 'mimic', 'epxung', 'guongcong', 'marionette', 'khoisinh', 'leviathan', 'bienmau', 'luutru', 'xuonganh', 'hopca', 'lualien', 'nguyenrua',
  'thanhdia', 'ngoisao', 'chuato', 'ronglua', 'taylo', 'cuuvi', 'hydra', 'ngaithoigian', 'nhatthuc', 'haoquang', 'luoicheo', 'nemesis', 'bomhen', 'khien'];
const BO_THAT = [ // bộ thật người chơi hay dùng: Star Cannon (vàng hỗ trợ) + Mystery Box + Leviathan/đỏ + Evolver + Copycat
  ['ngoisao', 'hopbi', 'leviathan', 'tienhoa', 'saochep'], ['ngoisao', 'hopbi', 'blackhole', 'tienhoa', 'saochep'],
  ['ngoisao', 'hopbi', 'ronglua', 'tienhoa', 'saochep'], ['ngoisao', 'hopbi', 'chuato', 'tienhoa', 'saochep'],
  ['ngoisao', 'hopbi', 'khoisinh', 'tienhoa', 'saochep'], ['ngoisao', 'saochep', 'leviathan', 'vughep', 'mauhut'],
];
function taoBo(r, ROS, tru) {
  const ds = [], DO = new Set(ROS.filter(x => x.bac === 'do').map(x => x.id));
  const w = (x) => (DAC_BIET.includes(x.id) ? 4 : 1) * (x.bac === 'vang' || x.bac === 'do' ? 2 : 1);
  let coDo = false;
  while (ds.length < 5) {
    const L = ROS.filter(x => !ds.includes(x.id) && !(tru || []).includes(x.id) && !(coDo && DO.has(x.id)));
    let s = L.reduce((a, x) => a + w(x), 0) * r(), x = L[0];
    for (const y of L) { s -= w(y); if (s <= 0) { x = y; break; } }
    ds.push(x.id); if (DO.has(x.id)) coDo = true;
  }
  return ds;
}
function taoTran(seed, ROS, MV) {
  const r = mb(seed * 7919 + 13);
  const che = CHE[seed % CHE.length];
  const bo = r() < 0.3 ? BO_THAT[Math.floor(r() * BO_THAT.length)].slice() : taoBo(r, ROS);
  const cfg = { seed, che, deck: bo, deck2: taoBo(r, ROS), mv: MV[Math.floor(r() * MV.length)], toc: [1, 2, 3][Math.floor(r() * 3)], veMoi: 20, botMay: 0.5, dbP: 0.3 + r() * 0.4 };
  const k = r();
  if (!process.env.KHONG_DAI && k < 0.18) { cfg.kieu = 'dai'; cfg.batTu = true; cfg.wMax = 72; }                  // dài: bất tử tới wave 70+
  else if (k < 0.40) { cfg.kieu = 'muon'; cfg.wave = 30 + Math.floor(r() * 36); cfg.fill = 4 + Math.floor(r() * 3); cfg.mana = 3000; cfg.batTu = r() < 0.5; cfg.wMax = cfg.wave + 12; } // vào muộn: bàn đầy, trùm mới
  else { cfg.kieu = 'thuong'; cfg.wMax = 45; }                                                                       // thường: tới khi thua / wave 45
  if (che === 'pvp') { cfg.wMax = Math.min(cfg.wMax + 10, 75); cfg.batTu1 = r() < 0.75; }
  // cấp thẻ cố định theo hạt giống (không phụ thuộc bộ sưu tập đã lên sau các trận trước → tái lập)
  cfg.cap0 = {}; for (const id of cfg.deck) cfg.cap0[id] = Math.floor(r() * 11);
  cfg.cap2 = {}; for (const id of cfg.deck2) cfg.cap2[id] = Math.floor(r() * 11);
  return cfg;
}

// ---------- 1 trang ----------
async function moTrang(b, nhin) {
  const ctx = await b.newContext(nhin ? Object.assign({}, devices['iPhone 13']) : { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(TRANG);
  const p = await ctx.newPage();
  const L = { err: [] };
  p.on('pageerror', e => L.err.push('pageerror ' + e.message + ' ' + String(e.stack || '').split('\n').slice(1, 3).join(' | ')));
  p.on('console', m => { if (m.type() === 'error' && !/favicon|ERR_|Failed to load resource/.test(m.text())) L.err.push('console ' + m.text().slice(0, 300)); });
  p.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) L.err.push('HTTP ' + r.status() + ' ' + r.url().replace(BASE, '')); });
  await p.goto(BASE + '?nointro=1&notut=1', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof UI !== 'undefined' && G.roster && G.roster.length && G.rosterMap && typeof __QA !== 'undefined', null, { timeout: 60000 });
  await sleep(500);
  await p.evaluate(() => { __QA.cai(); try { localStorage.setItem('turret_hd', '1'); } catch (e) { } if (typeof HD !== 'undefined') { HD.tat && HD.tat(); } });
  return { ctx, p, L, nhin };
}
async function heap(p) {
  try { const c = await p.context().newCDPSession(p); await c.send('HeapProfiler.collectGarbage'); const m = await c.send('Runtime.getHeapUsage'); await c.detach(); return Math.round(m.usedSize / 1048576 * 10) / 10; } catch (e) { return null; }
}
async function choiTran(W, cfg, ghiBam) {
  const { p, L } = W; L.err.length = 0;
  const t0 = Date.now();
  const v = await p.evaluate((c) => __QA.vaoTran(c), cfg);
  try { await p.waitForFunction(() => __QA.san(), null, { timeout: 60000 }); } catch (e) { return { cfg, v, loi: [{ loai: 'ket-vao-tran', chi: 'không vào được trận (TAI.cho / VT.mo) sau 60 s' }], wall: Date.now() - t0 }; }
  const bam = [];
  let anh = 0, tAnh = 0, r;
  const wallMax = +(process.env.TRAN_S || 240) * 1000;
  if (W.nhin) await p.evaluate(() => __QA.thucBat(true)); // trận chụp ảnh: chơi THẬT theo rAF (hoạt ảnh thời gian thực đúng nhịp)
  for (;;) {
    if (W.nhin) { await sleep(1000); r = await p.evaluate(() => __QA.trangThai()); }
    else r = await p.evaluate(([n]) => __QA.chay(n, 2500), [600]);
    if (ghiBam) bam.push(await p.evaluate(() => __QA.bam()));
    if (W.nhin && r.t - tAnh > 8) { // ảnh iPhone 13 mỗi ~8 s trận (vẽ khung thật rồi chụp)
      tAnh = r.t;
      const f = OUT + 'anh/' + cfg.che + '_s' + cfg.seed + '_w' + r.wave + '_' + (anh++) + '.jpg';
      await p.screenshot({ path: f, type: 'jpeg', quality: 70 });
      const d = await p.evaluate(DO, {}).catch(() => null);
      if (d) for (const k of ['chu', 'anh', 'ngang']) for (const x of d[k].slice(0, 3)) await p.evaluate(([k, x]) => __QA.LOI('man-' + k, x), [k, x]);
    }
    if (r.het || r.wave >= (W.nhin ? Math.min(cfg.wMax, (cfg.wave || 1) + 6) : cfg.wMax) || Date.now() - t0 > wallMax) break;
  }
  if (W.nhin) await p.evaluate(() => __QA.thucBat(false));
  if (r.het) {
    await sleep(1400); // ketThuc → 900 ms → UI.ketQua
    await p.evaluate(() => __QA.ktKetQua());
    if (W.nhin) {
      await sleep(1500); // chờ số chạy xong
      await p.screenshot({ path: OUT + 'anh/' + cfg.che + '_s' + cfg.seed + '_ketqua.jpg', type: 'jpeg', quality: 70 });
      const d = await p.evaluate(DO, {}).catch(() => null);
      if (d) for (const k of ['chu', 'anh', 'ngang']) for (const x of d[k].slice(0, 3)) await p.evaluate(([k, x]) => __QA.LOI('ketqua-' + k, x), [k, x]);
    }
  }
  const tom = await p.evaluate(() => __QA.tom());
  for (const e of L.err) tom.loi.push({ loai: /^HTTP/.test(e) ? 'http' : 'pageerror', chi: e.slice(0, 400), seed: cfg.seed, che: cfg.che });
  return Object.assign({ cfg, v, wall: Date.now() - t0, bam }, tom);
}

async function choiOnline(b, cfg) {
  const URL = `http://localhost:${MOCK}/thap/?net=mock&mockws=ws://localhost:${MOCK}&nointro=1&notut=1`;
  const mo = async (ten, deck) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    await ctx.addInitScript(TRANG);
    const p = await ctx.newPage(), L = [];
    p.on('pageerror', e => L.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|ERR_|Failed to load/.test(m.text())) L.push('console ' + m.text().slice(0, 300)); });
    await p.goto(URL, { waitUntil: 'load' });
    await p.waitForFunction(() => typeof UI !== 'undefined' && UI.chon && document.querySelector('#onl-nut') && NET.ok && typeof __QA !== 'undefined', null, { timeout: 30000 });
    await p.evaluate((d) => { __QA.cai(); UI.chon = d; UI.veBoChon(); }, deck);
    return { ctx, p, L, ten };
  };
  const A = await mo('A', cfg.deck), B = await mo('B', cfg.deck2);
  const loi = [], t0 = Date.now();
  try {
    await A.p.evaluate(() => ONL.moBang()); await A.p.click('[data-act="onl-tao"]');
    await A.p.waitForFunction(() => /^[A-Z]{4}$/.test((document.querySelector('#sanh-ma') || {}).textContent || ''), null, { timeout: 15000 });
    const code = await A.p.textContent('#sanh-ma');
    await B.p.evaluate(() => ONL.moBang()); await B.p.fill('#onl-ma', code); await B.p.click('[data-act="onl-vao"]');
    await A.p.waitForFunction(() => document.querySelectorAll('#sanh-ds .sanh-p:not(.trong)').length === 2, null, { timeout: 15000 });
    await A.p.click('#sanh-san'); await B.p.click('#sanh-san');
    for (const X of [A, B]) await X.p.waitForFunction(() => ONS.on && G.ban.length === 2 && __QA.san(), null, { timeout: 30000 });
    for (const X of [A, B]) await X.p.evaluate((c) => __QA.thucBat(true, c), Object.assign({}, cfg, { seed: cfg.seed + (X === B ? 1 : 0) }));
    // so 2 máy mỗi 3 s: bàn mình ở máy này = bàn đồng đội ở máy kia (cho phép lệch thoáng qua; lệch 2 lần liền → lỗi)
    let lechCu = 0, wave = 0;
    while (Date.now() - t0 < +(process.env.ONLINE_S || 150) * 1000) {
      await sleep(3000);
      const [a, c] = await Promise.all([A.p.evaluate(() => ({ w: G.wave, kt: !!G.ketThuc, tim: G.ban[0].tim, toi: __QA.oCua(G.ban[0]), ban: __QA.oCua(G.ban[1]), tom: ONS.tom() })), B.p.evaluate(() => ({ w: G.wave, kt: !!G.ketThuc, tim: G.ban[0].tim, toi: __QA.oCua(G.ban[0]), ban: __QA.oCua(G.ban[1]), tom: ONS.tom() }))]);
      wave = a.w;
      const khac = (x, y) => x.reduce((n, v, i) => n + (v !== y[i] ? 1 : 0), 0);
      const k = khac(a.toi, c.ban) + khac(c.toi, a.ban);
      if (k > 2 && lechCu > 2) loi.push({ loai: 'online-lech-ban', chi: 'bàn soi gương lệch ' + k + ' ô hai lần liền (wave ' + a.w + '): A ' + a.toi.join(' ') + ' | B thấy ' + c.ban.join(' '), seed: cfg.seed, che: 'online' });
      lechCu = k;
      if (Math.abs(a.w - c.w) > 1) loi.push({ loai: 'online-lech-wave', chi: 'A wave ' + a.w + ' / B wave ' + c.w, seed: cfg.seed, che: 'online' });
      if (a.tim !== c.tim && !a.kt && !c.kt) loi.push({ loai: 'online-lech-tim', chi: 'tim chung A ' + a.tim + ' / B ' + c.tim, seed: cfg.seed, che: 'online' });
      if (a.tom.thay || c.tom.thay) loi.push({ loai: 'online-giao-ai', chi: 'mạng tốt nhưng bị giao AI: ' + a.tom.thay + '/' + c.tom.thay, seed: cfg.seed, che: 'online' });
      if (a.kt || c.kt) break;
    }
    for (const X of [A, B]) {
      await X.p.evaluate(() => __QA.thucBat(false));
      const t = await X.p.evaluate(() => __QA.tom());
      for (const l of t.loi) loi.push(Object.assign(l, { che: 'online-' + X.ten }));
      for (const e of X.L) loi.push({ loai: 'pageerror', chi: X.ten + ' ' + e.slice(0, 300), seed: cfg.seed, che: 'online' });
    }
    // dedupe
    const thay = new Set(); const L2 = loi.filter(l => { const k = l.loai + l.chi.replace(/\d+/g, '#').slice(0, 80); if (thay.has(k)) return false; thay.add(k); return true; });
    return { cfg, wave, loi: L2, wall: Date.now() - t0 };
  } finally { await A.ctx.close(); await B.ctx.close(); }
}

(async () => {
  const b = await chromium.launch();
  const W0 = await moTrang(b, false);
  const { ROS, MV } = await W0.p.evaluate(() => ({ ROS: G.roster.filter(r => SKILLS[r.id]).map(r => ({ id: r.id, bac: r.bac })), MV: Object.keys(MAVUONG) }));
  console.log('ụ chơi được:', ROS.length, '· chỉ huy:', MV.join(','));
  let ds = [];
  if (process.env.SEED) { const c = taoTran(+process.env.SEED, ROS, MV); if (process.env.CHE1) c.che = process.env.CHE1; if (process.env.THEM) Object.assign(c, JSON.parse(process.env.THEM)); ds = [c]; }
  else for (let i = 0; i < SO; i++) ds.push(taoTran(SEED0 + i, ROS, MV));
  const KQ = [], HEAP = [];
  const workers = [W0]; for (let i = 1; i < LUONG; i++) workers.push(await moTrang(b, false));
  let ke = 0, xong = 0, nhinCon = NHIN;
  const tong = ds.length;
  const chay = async (W, wi) => {
    let n = 0;
    while (ke < ds.length && Date.now() - T0 < PHUT * 60000) {
      const cfg = ds[ke++];
      let WW = W;
      if (nhinCon > 0 && cfg.seed % 7 === 3) { nhinCon--; WW = await moTrang(b, true); }
      let kq;
      if (WW !== W) cfg.chu = true;
      try { kq = await choiTran(WW, cfg, cfg.seed % Math.max(1, Math.round(tong / Math.max(1, TAILAP))) === 0); }
      catch (e) { kq = { cfg, loi: [{ loai: 'ngoai-le-node', chi: String(e.message).slice(0, 300), seed: cfg.seed, che: cfg.che }] }; try { await W.ctx.close(); } catch (er) { } W = workers[wi] = await moTrang(b, false); }
      if (WW !== W) await WW.ctx.close();
      else if (++n % 10 === 0) { const h = await heap(W.p); HEAP.push({ w: wi, n, mb: h }); }
      KQ.push(kq); xong++;
      fs.appendFileSync(OUT + 'tran.jsonl', JSON.stringify(Object.assign({}, kq, { bam: undefined })) + '\n');
      const nl = (kq.loi || []).length;
      console.log(`[${xong}/${tong}] s${cfg.seed} ${cfg.che} ${cfg.kieu} ${cfg.toc}× bộ=${cfg.deck.join(',')} → wave ${kq.wave} ${kq.kt ? (kq.kt.thang ? 'THẮNG' : 'thua') : ''} ${Math.round((kq.wall || 0) / 1000)}s` + (nl ? '  ✗ ' + kq.loi.map(l => l.loai).join(',') : ''));
      if (W.L && WW === W && n % 25 === 0) { try { await W.ctx.close(); } catch (e) { } W = workers[wi] = await moTrang(b, false); } // trang mới mỗi 25 trận (đo rò bộ nhớ theo từng chặng)
    }
  };
  await Promise.all(workers.map((W, i) => chay(W, i)));
  // ---------- ONLINE CO-OP: 2 trình duyệt + máy chủ giả, bot ở cả 2 máy, so 2 bàn soi gương ----------
  for (let i = 0; i < ONLINE && Date.now() - T0 < PHUT * 60000; i++) {
    const seed = 9000 + SEED0 + i, r = mb(seed);
    const cfg = { seed, che: 'online', kieu: 'online', deck: r() < 0.5 ? BO_THAT[i % BO_THAT.length].slice() : taoBo(r, ROS), deck2: taoBo(r, ROS), toc: 1, dbP: 0.4 };
    let kq;
    try { kq = await choiOnline(b, cfg); } catch (e) { kq = { cfg, loi: [{ loai: 'online-ngoai-le', chi: String(e.message).slice(0, 300), seed, che: 'online' }] }; }
    KQ.push(kq);
    console.log(`[online ${i + 1}/${ONLINE}] s${seed} bộ=${cfg.deck.join(',')} + ${cfg.deck2.join(',')} → wave ${kq.wave}` + ((kq.loi || []).length ? '  ✗ ' + kq.loi.map(l => l.loai).join(',') : ''));
  }
  // ---------- tái lập: chạy lại các trận đã ghi băm ----------
  const TL = [];
  const coBam = KQ.filter(k => k.bam && k.bam.length).slice(0, TAILAP);
  if (coBam.length) {
    const W = await moTrang(b, false);
    for (const k of coBam) {
      const k2 = await choiTran(W, k.cfg, true);
      const n = Math.min(k.bam.length, k2.bam.length); let lech = -1;
      for (let i = 0; i < n; i++) if (k.bam[i] !== k2.bam[i]) { lech = i; break; }
      TL.push({ seed: k.cfg.seed, che: k.cfg.che, khop: lech < 0 && k.bam.length === k2.bam.length, lech, n });
      console.log('tái lập s' + k.cfg.seed + ' ' + k.cfg.che + ': ' + (lech < 0 ? 'KHỚP ' + n + ' mốc' : 'LỆCH ở mốc ' + lech + ' (bước ' + (lech + 1) * 600 + ')'));
    }
    await W.ctx.close();
  }
  await b.close();
  // ---------- tổng hợp ----------
  const LOI = {};
  for (const k of KQ) for (const l of (k.loi || [])) { const key = l.loai + ' | ' + String(l.chi).replace(/\d+(\.\d+)?/g, '#').slice(0, 160); (LOI[key] = LOI[key] || { n: 0, mau: l, seeds: [] }).n++; if (LOI[key].seeds.length < 8) LOI[key].seeds.push(k.cfg.seed + ':' + k.cfg.che); }
  for (const t of TL) if (!t.khop) { const key = 'khong-tai-lap | ' + t.che; (LOI[key] = LOI[key] || { n: 0, mau: { loai: 'khong-tai-lap', chi: 'cùng hạt giống → khác kết quả (lệch từ mốc ' + t.lech + ')' }, seeds: [] }).n++; LOI[key].seeds.push(t.seed + ':' + t.che); }
  const theoChe = {}; for (const k of KQ) { const c = k.cfg.che; const x = theoChe[c] = theoChe[c] || { tran: 0, waveMax: 0, waveTong: 0, thang: 0 }; x.tran++; x.waveMax = Math.max(x.waveMax, k.wave || 0); x.waveTong += k.wave || 0; if (k.kt && k.kt.thang) x.thang++; }
  const maxObj = {}; for (const k of KQ) if (k.max) for (const [a, v] of Object.entries(k.max)) maxObj[a] = Math.max(maxObj[a] || 0, v);
  const tomTat = { luc: new Date().toISOString(), phut: +((Date.now() - T0) / 60000).toFixed(1), tran: KQ.length, theoChe, maxObj, heap: HEAP, taiLap: TL, loi: LOI };
  fs.writeFileSync(OUT + 'ket-qua.json', JSON.stringify({ tomTat, tran: KQ.map(k => Object.assign({}, k, { bam: undefined })) }, null, 1));
  const txt = Object.entries(LOI).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => `${v.n}×  ${k}\n     vd: ${v.seeds.join(' ')}\n     ${JSON.stringify(v.mau.nk || []).slice(0, 600)}`).join('\n');
  fs.writeFileSync(OUT + 'loi.txt', txt + '\n');
  console.log('\n==== ' + KQ.length + ' trận, ' + tomTat.phut + ' phút ====');
  console.log(JSON.stringify(theoChe)); console.log('đỉnh đối tượng:', JSON.stringify(maxObj)); console.log('heap MB:', HEAP.map(h => h.w + ':' + h.n + '=' + h.mb).join(' '));
  console.log(Object.keys(LOI).length ? '✗ LỖI:\n' + txt : '✓ XANH — không lỗi');
  process.exit(Object.keys(LOI).length ? 1 : 0);
})();
