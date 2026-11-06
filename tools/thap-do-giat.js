// TURRET MERGE — ĐO GIẬT KHI RA SKILL (frame hitch quanh khoảnh khắc kỹ năng / trùm / ghép / chỉ huy / nhiều skill cùng lúc).
// Chạy (gốc repo): python3 -m http.server 8765 &   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-do-giat.js [nhom,...]
//   env: OUT=thư mục (mặc định docs/demo-hop-tuong/tuvan/giat_skill/)  TAG=truoc|sau  CPU=1 (CDP throttle hệ số)  TRACE=1 (CDP trace nhóm nặng)
// Hồ sơ: iPhone 13 (390×844, DPR 3, isMobile, hasTouch) trên Chromium (máy đo không có WebKit). Ép DPR 3 (G.debug.dpr) — không cho tự lùi 2×.
// Cách đo: vòng rAF riêng chạy SAU vòng game mỗi khung → ghi khoảng khung (dt), thời gian JS của khung game (REN._viec),
//   + "nhãn" việc xảy ra trong khung: ảnh chép/giải mã lần đầu (REN.img), ảnh tải lười giữa trận (REN.taiAnh), thu nhỏ ảnh (REN.veNho/mip),
//   âm thanh (mọi hàm SND.*), hiệu ứng sân mới (G.hu), khoảnh khắc đặc biệt (SIG.ds), hạt (FX.hat), DOM đổi (MutationObserver), long task.
// Mỗi "khoảnh khắc" = khung kích hoạt + 20 khung sau → khung tệ nhất, số khung rớt (dt > 1.5 × khung chuẩn), việc nặng nhất trong đó.
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/giat_skill/';
const TAG = process.env.TAG || 'do';
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ---------- cài máy đo trong trang ----------
function CAI() {
  if (window.__DO) return;
  const D = window.__DO = { f: [], tag: [], scale: 0, scaleN: 0, mut: 0, mutT: new Set(), lt: [], on: true, cv: 0, gc: 0 };
  const now = () => performance.now();
  const tag = (s) => { D.tag.push(s); };
  D.tagf = tag;
  const boc = (o, k, fn) => { const g = o[k]; if (typeof g !== 'function' || g.__do) return; const w = fn(g); w.__do = 1; o[k] = w; };
  // ảnh: chép canvas lần đầu (giải mã đồng bộ) — chỉ tính khi thật sự chép
  boc(REN, 'img', g => function (ten) {
    const a = this.anh[ten]; const chep = !(a && a._cv);
    const t0 = now(); const r = g.apply(this, arguments); const ms = now() - t0;
    if (chep && ms > 0.8) tag('img:' + ten + ':' + ms.toFixed(1));
    return r;
  });
  boc(REN, 'taiAnh', g => function (ten) { if (G.ban.length && !TAI.cho) tag('tai:' + ten); return g.apply(this, arguments); });
  boc(REN, 'veNho', g => function () { const t0 = now(); const r = g.apply(this, arguments); D.scale += now() - t0; D.scaleN++; return r; });
  boc(REN, 'mip', g => function (a, can) {
    const n0 = a && a._mip ? a._mip.length : 0; const t0 = now(); const r = g.apply(this, arguments); const n1 = a && a._mip ? a._mip.length : 0;
    if (n1 > Math.max(1, n0)) { D.scale += now() - t0; D.scaleN++; } return r;
  });
  for (const k of ['co', 'coDai', 'banTrang', 'banXam', 'toMauA']) boc(REN, k, g => function () { const t0 = now(); const r = g.apply(this, arguments); const ms = now() - t0; if (ms > 1.5) tag('co:' + k + ':' + String(arguments[0]).slice(0, 40) + ':' + ms.toFixed(1)); return r; });
  // âm thanh: mọi hàm SND
  for (const k of Object.keys(SND)) if (typeof SND[k] === 'function' && !/^(bat|tat|ghi|doc|vol|tk|TK|unlock|mo|nhac)$/.test(k))
    boc(SND, k, g => function () { const t0 = now(); const r = g.apply(this, arguments); const ms = now() - t0; tag('snd:' + k + (ms > 1 ? ':' + ms.toFixed(1) : '')); return r; });
  // lệnh vẽ trên canvas chính: số lệnh + diện tích phủ (megapixel thiết bị) — thước đo tải GPU không phụ thuộc máy đo
  D.nv = 0; D.dt = 0; D.dtL = 0; D.fl = 0;
  { const x = REN.ctx, g = x.drawImage;
    x.drawImage = function (im) { D.nv++; const n = arguments.length; const w = n >= 9 ? arguments[7] : n >= 5 ? arguments[3] : im.width, h = n >= 9 ? arguments[8] : n >= 5 ? arguments[4] : im.height; const t = this.getTransform(); const a = Math.abs(w * h * (t.a * t.d - t.b * t.c)) / 1e6; D.dt += a; if (this.globalCompositeOperation === 'lighter') D.dtL += a; const t0 = now(); const r = g.apply(this, arguments); const d = now() - t0; if (d > 2) D.fl += d; return r; };
    // mọi lệnh khác của canvas chính (save/restore/fill…): 1 lệnh > 2 ms = máy đo raster bản ghi lệnh (CPU), không phải việc của game
    for (const k of ['save', 'restore', 'fillRect', 'fill', 'stroke', 'fillText', 'strokeText', 'setTransform', 'clip', 'putImageData', 'getImageData', 'clearRect', 'beginPath']) { const f = x[k]; if (typeof f !== 'function') continue; x[k] = function () { const t0 = now(); const r = f.apply(this, arguments); const d = now() - t0; if (d > 2) D.fl += d; return r; }; } }
  // DOM
  new MutationObserver((ms) => { D.mut += ms.length; for (const m of ms) { const e = m.target.nodeType === 1 ? m.target : m.target.parentElement; const id = e && e.closest && e.closest('[id]'); if (id) D.mutT.add(id.id); } })
    .observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) D.lt.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: false }); } catch (e) { }
  const seenHu = new WeakSet(), seenSig = new WeakSet(), seenA = new WeakSet();
  D.nhanh = {}; // dải khung FX: tên → [số khung, thời lượng ngắn nhất (s)]
  const soKhung = (ten) => { const a = REN.anh[ten] || REN.anh['fx_' + ten]; const w = a && (a.naturalWidth || a.width), h = a && (a.naturalHeight || a.height); return w && h ? Math.max(1, Math.round(w / h)) : 0; };
  let tr = 0, mem0 = performance.memory ? performance.memory.usedJSHeapSize : 0;
  const vong = (t) => {
    if (!D.on) return;
    const dt = tr ? t - tr : 0; tr = t;
    const tags = D.tag.splice(0);
    for (const o of (G.hu || [])) if (o && typeof o === 'object' && !seenHu.has(o)) { seenHu.add(o); if (o.k !== 'sigDuoi') tags.push('hu:' + o.k + (o.T && o.T.id ? '/' + o.T.id : '')); }
    if (typeof FX !== 'undefined' && FX.anim) for (const A of FX.anim) if (!seenA.has(A)) { seenA.add(A); const n = soKhung(A.ten); const k = A.ten; const c = D.nhanh[k]; if (!c || A.song < c[1]) D.nhanh[k] = [n, +(+A.song).toFixed(3)]; }
    if (typeof SIG !== 'undefined') for (const o of SIG.ds) if (!seenSig.has(o)) { seenSig.add(o); tags.push('sig:' + o.k); }
    let gc = 0; if (performance.memory) { const m = performance.memory.usedJSHeapSize; if (m < mem0 - 2e6) gc = +((mem0 - m) / 1e6).toFixed(1); mem0 = m; }
    D.f.push({ t: +t.toFixed(1), dt: +dt.toFixed(1), v: +Math.max(0, (REN._viec || 0) - D.fl).toFixed(1), vt: +(REN._viec || 0).toFixed(1), fl: +D.fl.toFixed(1), sc: +D.scale.toFixed(1), scn: D.scaleN, mut: D.mut, mt: [...D.mutT].slice(0, 6), nv: D.nv, mp: +D.dt.toFixed(1), mpL: +D.dtL.toFixed(1), hat: typeof FX !== 'undefined' && FX.hat ? FX.hat.length : 0, hu: (G.hu || []).length, gc, tags });
    if ((REN._viec || 0) > 15 && window.__CHI) D.f[D.f.length - 1].ham = Object.entries(D.ham).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => k + ' ' + v.toFixed(1));
    D.ham = {}; D.nv = 0; D.dt = 0; D.dtL = 0; D.fl = 0;
    D.scale = 0; D.scaleN = 0; D.mut = 0; D.mutT.clear();
    requestAnimationFrame(vong);
  };
  requestAnimationFrame(vong);
  D.danh = (s) => tag('@' + s);
  // CHI=1: bấm giờ mọi hàm của các đối tượng game (tổng theo khung) → khung JS > 15 ms ghi 10 hàm tốn nhất
  D.ham = {};
  if (window.__CHI) {
    const BO = new Set(['G', 'SND', 'Math', 'JSON', 'D', 'TEXT', 'SKILLS', 'TAI', 'CH', 'LUAT', 'PX']);
    for (const ten of 'BANGFX BP BUFF BVX CHT CORE DEMKN FX FXU GF GFX GLYPH GROW HB HO HOTRO HT HU HUD2 KG KHUNG MAT ND OT PX QUAI REN SIG ST SUP TBUI THE THEBAI TIENUI TRM TVB TVX UI VT VX'.split(' ')) {
      let o; try { o = (0, eval)(ten); } catch (e) { continue; } if (!o || typeof o !== 'object' || o === window) continue;
      for (const k of Object.keys(o)) { let f; try { f = o[k]; } catch (e) { continue; } if (typeof f !== 'function' || f.__do || /^[A-Z]/.test(k)) continue;
        const nm = ten + '.' + k; if (ten === 'REN' && /^(ve|ve0)$/.test(k)) continue; const w = function () { const t0 = now(); try { return f.apply(this, arguments); } finally { const d = now() - t0; if (d > 0.05) D.ham[nm] = (D.ham[nm] || 0) + d; } }; w.__do = 1; try { o[k] = w; } catch (e) { } }
    }
    for (const k of ['capNhat', 'capNhatU', 'capNhatQuai', 'capNhatTrum', 'trung']) if (typeof window[k] === 'function' && !window[k].__do) { const f = window[k]; const w = function () { const t0 = now(); try { return f.apply(this, arguments); } finally { const d = now() - t0; D.ham[k] = (D.ham[k] || 0) + d; } }; w.__do = 1; window[k] = w; }
  } // đánh dấu khoảnh khắc từ kịch bản
}

// ---------- hành động trong trang ----------
function HD() {
  window.__datBan = (ids, sao, quai) => {
    G.hang.length = 0; G.quai.length = 0; G.cho = 1e9;
    for (const B of G.ban) {
      B.tim = 1e9;
      for (let o = 0; o < 15; o++) {
        const id = ids[o % ids.length]; if (!id) { B.t[o] = null; continue; }
        B.lv[id] = B.lv[id] || 1;
        const s = typeof sao === 'function' ? sao(id, o) : sao;
        const T = sinhU(taoU(B, id, s, o)); T.vxA = null; T._gs = null; B.t[o] = T;
      }
    }
    window.__themQuai(quai == null ? 20 : quai);
  };
  window.__themQuai = (n) => {
    for (let pi = 0; pi < G.duong.length; pi++) { const p0 = G.duong[pi]; for (let i = 0; i < n; i++) { const E = sinhQuai(i % 5 ? 'bo' : 'khong_lo', pi, p0.len * (0.05 + (i / n) * 0.8), 1); E.vao = 1; E.hp = E.max = 1e9; } }
  };
  window.__giuQuai = () => { // giữ quái sống + đủ đông (kỹ năng cần mục tiêu)
    for (const E of G.quai) if (!E.trum && E.hp < 1e8) E.hp = E.max = 1e9;
    if (G.quai.filter(E => !E.chet).length < 10) window.__themQuai(12);
  };
  // kích hoạt kỹ năng của mọi ụ loại id trên mọi bàn (giống skilldemo: chủ động = nạp đầy + chuDong; nạp = gần đầy)
  window.__kich = (id, chi1) => {
    let n = 0;
    for (const B of G.ban) for (const T of B.t) {
      if (!T || T.id !== id) continue;
      const sk = SKILLS[id], k = typeof SD_K !== 'undefined' ? SD_K[id] : null;
      if (id === 'cuuvi') { T.duoi = 8; try { sk.themDuoi ? sk.themDuoi(T, 1) : (T.duoi = 9, sk.xa(T)); } catch (e) { T.duoi = 9; } }
      else if (id === 'soi') { T.sao = Math.max(T.sao, 5); T.giet = 60; T._epGd = 0; }
      else if (sk.chuDong) { T.nap = 1; try { sk.chuDong(G, B, T); } catch (e) { } }
      else if (k && k.kieu === 'phu' && k.truoc) { k.truoc(T); T.tuoi += 3.1; }
      else if (typeof T.nap === 'number') T.nap = 0.999;
      else if (k && k.truoc) k.truoc(T);
      n++; if (chi1) return n;
    }
    return n;
  };
  // ghép 2 ụ cùng loại cùng sao trên bàn b (dùng hàm ghep thật → VX.ghep + kỹ năng khi ghép)
  window.__ghep = (id, sao, bi) => {
    const B = G.ban[bi || 0];
    const a = sinhU(taoU(B, id, sao, 0)); const b = sinhU(taoU(B, id, sao, 1)); B.t[0] = a; B.t[1] = b; a.vxA = b.vxA = null;
    return !!ghep(B, a, b, true);
  };
  window.__trum = (id) => { const E = sinhTrum(id, 0); E.s = 70; E.vao = 1; E.knT = 0.2; E.hp = E.max = 1e9; return E.uid; };
  window.__mv = (id) => { const B = G.ban[0]; B.mv = B.mv || {}; if (id) B.mv.id = id; G.mana = 1e6; B.mana = 1e6; try { if (B.mv) { B.mv.cd = 0; B.mv.t = 0; } dungMV(B); } catch (e) { return String(e); } return 'ok'; };
}

async function moTrang(b, url) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); p._loi = [];
  p.on('pageerror', e => p._loi.push(e.message));
  if (+process.env.CPU > 1) { const c = await ctx.newCDPSession(p); await c.send('Emulation.setCPUThrottlingRate', { rate: +process.env.CPU }); }
  await p.goto(BASE + url, { waitUntil: 'load', timeout: 120000 });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && typeof TAI !== 'undefined' && !TAI.cho, null, { timeout: 120000 });
  await p.evaluate(() => { G.debug.dpr = 3; REN.coLai(); });
  await p.evaluate(HD);
  await sleep(1500);
  return { ctx, p };
}

const khung = (p, n) => p.evaluate((n) => new Promise(ok => { let k = 0; const f = () => (++k >= n ? ok() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);

// ---------- phân tích ----------
function phanTich(F, ten) {
  // khung chuẩn = trung vị dt
  const dts = F.map(f => f.dt).filter(x => x > 0).sort((a, b) => a - b);
  const tv = dts[Math.floor(dts.length / 2)] || 16.7;
  const vs = F.map(f => f.v).sort((a, b) => a - b); const vtv = vs[Math.floor(vs.length / 2)] || 0;
  const ks = []; // khoảnh khắc theo @nhãn
  F.forEach((f, i) => { for (const t of f.tags) if (t[0] === '@') ks.push({ ten: t.slice(1), i }); });
  const kq = [];
  for (let j = 0; j < ks.length; j++) {
    const { ten: kt, i } = ks[j];
    const het = Math.min(F.length, i + 40, j + 1 < ks.length ? ks[j + 1].i : 1e9);
    const W = F.slice(i, het); if (!W.length) continue;
    let xau = W[0]; for (const f of W) if (f.dt > xau.dt) xau = f;
    let vx = W[0]; for (const f of W) if (f.v > vx.v) vx = f;
    const rot = W.filter(f => f.dt > tv * 1.5).length;
    const qua33 = W.filter(f => f.dt > 33.4).length;
    // việc trong các khung tệ (khung tệ nhất + khung trước nó)
    const viec = new Map(); const add = (s) => viec.set(s, (viec.get(s) || 0) + 1);
    for (const f of W) if (f.dt > tv * 1.5 || f.v > vtv + 8) { for (const t of f.tags) if (t[0] !== '@') add(t.replace(/:\d+(\.\d+)?$/, (m) => m)); if (f.sc > 2) add('scale ' + f.sc + 'ms×' + f.scn); if (f.mut > 20) add('dom ' + f.mut + ' ' + f.mt.join('|')); if (f.gc) add('gc ' + f.gc + 'MB'); }
    const vi = F.indexOf(vx); const tg = (f) => (f ? f.tags.filter(t => t[0] !== '@' && !/^snd:(trung|crit|chet|no|phao|lien)$/.test(t)).slice(0, 14).join(' ') + (f.sc > 1 ? ' [scale ' + f.sc + 'ms×' + f.scn + ']' : '') + (f.gc ? ' [gc ' + f.gc + 'MB]' : '') + (f.mut > 10 ? ' [dom ' + f.mut + ' ' + f.mt.join('|') + ']' : '') : '');
    kq.push({ ham: vx.ham, ten: kt, xauDt: xau.dt, xauV: vx.v, xauVi: vi - i, xauTag: tg(vx), truocTag: tg(F[vi - 1]), rot, qua33, hatMax: Math.max(...W.map(f => f.hat)), nvMax: Math.max(...W.map(f => f.nv || 0)), mpMax: Math.max(...W.map(f => f.mp || 0)), mpXau: vx.mp, nvXau: vx.nv, viec: [...viec.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, n]) => n > 1 ? k + ' ×' + n : k) });
  }
  return { ten, khungChuan: tv, viecTV: vtv, n: F.length, kq };
}

// ---------- kịch bản ----------
const RED = ['blackhole', 'overlord', 'leviathan', 'ronglua', 'chuato', 'ngaithoigian', 'khoisinh', 'lophanung'];
const NHOM = {
  // đỏ chủ động: mỗi nhóm 4 ụ đỏ + 1 phụ; lần đầu (first use) rồi lần 2
  do1: { deck: ['blackhole', 'overlord', 'leviathan', 'ronglua', 'canon'], kich: ['blackhole', 'overlord', 'leviathan', 'ronglua'], sao: 7 },
  do2: { deck: ['chuato', 'ngaithoigian', 'khoisinh', 'lophanung', 'canon'], kich: ['chuato', 'ngaithoigian', 'khoisinh', 'lophanung'], sao: 7 },
  vang1: { deck: ['hydra', 'cuuvi', 'ngoisao', 'soi', 'wallgen'], kich: ['hydra', 'cuuvi', 'ngoisao', 'soi', 'wallgen'], sao: 7 },
  vang2: { deck: ['marionette', 'orbital', 'pandora', 'sinhdoi', 'canon'], kich: ['marionette'], ghep: [['orbital', 3], ['pandora', 3], ['sinhdoi', 3], ['canon', 2], ['canon', 5]], sao: 5 },
  trum: { deck: ['blackhole', 'hydra', 'canon', 'set', 'bang'], trum: ['freezer', 'mad_crown', 'janus', 'joker_king', 'octopus', 'nightmare', 'hive', 'jammer', 'prism', 'twin_core', 'patcher', 'leech'], sao: 4 },
  chihuy: { deck: ['canon', 'set', 'bang', 'lien', 'tia'], mv: ['hero', 'dahlia', 'eve'], sao: 3 },
  // muộn trận: bàn đầy ụ nặng, kích hoạt TẤT CẢ cùng 1 khung
  dong: { deck: ['blackhole', 'overlord', 'hydra', 'cuuvi', 'ronglua'], wave: 30, sao: 7, cungLuc: true },
  coop: { mode: 'coop', deck: ['blackhole', 'overlord', 'hydra', 'ngaithoigian', 'leviathan'], deck2: ['chuato', 'khoisinh', 'cuuvi', 'ronglua', 'lophanung'], wave: 40, sao: 7, cungLuc: true },
};

async function chayNhom(b, ten) {
  const N = NHOM[ten];
  const url = '?mode=' + (N.mode || 'solo') + '&deck=' + N.deck.join(',') + (N.deck2 ? '&deck2=' + N.deck2.join(',') : '') + '&wave=' + (N.wave || 15) + '&mana=0&notut=1&seed=7';
  const { ctx, p } = await moTrang(b, url);
  if (process.env.CHI) await p.evaluate(() => { window.__CHI = 1; });
  await p.evaluate(CAI);
  const ids = N.deck2 ? null : N.deck;
  if (N.deck2) await p.evaluate(([a, c, s]) => { // co-op: mỗi bàn bộ riêng
    G.hang.length = 0; G.quai.length = 0; G.cho = 1e9;
    G.ban.forEach((B, bi) => { B.tim = 1e9; const d = bi ? c : a; for (let o = 0; o < 15; o++) { const id = d[o % 5]; B.lv[id] = B.lv[id] || 1; const T = sinhU(taoU(B, id, s, o)); T.vxA = null; B.t[o] = T; } });
    __themQuai(20);
  }, [N.deck, N.deck2, N.sao]);
  else await p.evaluate(([ids, s]) => __datBan(ids, s, 20), [ids, N.sao]);
  await khung(p, 150); // ổn định (ụ vào chỗ, ảnh ụ đã chép)
  const giu = () => p.evaluate(() => __giuQuai());
  const PROF = (process.env.PROF || '').split(',').filter(Boolean); let cdp = null, dangProf = null;
  const xongProf = async () => {
    if (!dangProf) return; const { profile } = await cdp.send('Profiler.stop');
    const byId = new Map(profile.nodes.map(n => [n.id, n])), self = new Map(); let tong = 0;
    profile.samples.forEach((id, i) => { const n = byId.get(id); const k = (n.callFrame.functionName || '(anon)') + ' ' + n.callFrame.url.split('/').pop() + ':' + (n.callFrame.lineNumber + 1); const d = (profile.timeDeltas[i] || 0) / 1000; tong += d; self.set(k, (self.get(k) || 0) + d); });
    console.log('  PROF ' + dangProf + ' (' + (tong | 0) + ' ms mẫu): ' + [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 22).map(([k, v]) => k + ' ' + v.toFixed(0)).join(' · '));
    dangProf = null;
  };
  const TR = (process.env.TRACE || '').split(',').filter(Boolean);
  const danh = async (s) => {
    await xongProf();
    if (p._tr) { await sleep(10); await p.context().tracing ? null : null; }
    if (TR.includes(s)) { await b.startTracing(p, { path: OUT + 'trace_' + s.replace(/[^a-z0-9]/gi, '_') + '.json', categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'v8', 'disabled-by-default-v8.gc', 'blink', 'cc', 'gpu', 'skia', 'disabled-by-default-skia'] }); p._tr = 1; }
    else if (p._tr) { await b.stopTracing(); p._tr = 0; }
    if (PROF.includes(s)) { if (!cdp) { cdp = await p.context().newCDPSession(p); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); } await cdp.send('Profiler.start'); dangProf = s; }
    return p.evaluate((s) => __DO.danh(s), s);
  };
  const cho = async (n) => { for (let k = 0; k < n; k += 30) { await giu(); await khung(p, 30); } };
  if (N.kich) for (const lan of (N.motLan ? [1] : [1, 2])) for (const id of N.kich) { await danh(id + (lan === 1 ? '#1' : '#2')); await p.evaluate((id) => __kich(id), id); await cho(lan === 1 ? 150 : 90); }
  if (N.ghep) for (const lan of (N.motLan ? [1] : [1, 2])) for (const [id, s] of N.ghep) { await danh('ghep:' + id + s + '#' + lan); await p.evaluate(([id, s]) => __ghep(id, s), [id, s]); await cho(150); }
  if (N.trum) for (const id of N.trum) {
    await p.evaluate(() => { G.quai = G.quai.filter(E => !E.trum); });
    // như trận thật: trùm của wave kế được biết trước cả wave → bản có làm nóng (js/nongskill.js) dựng sẵn trong lúc chờ
    await p.evaluate((id) => { if (window.NS && NS.nongTrum) NS.nongTrum(id); }, id); await cho(120);
    await danh('trum:' + id); await p.evaluate((id) => __trum(id), id);
    // đợi chiêu trùm (knT ngắn) — đánh dấu khung chiêu thật
    let thay = false;
    for (let k = 0; k < 14 && !thay; k++) { await khung(p, 15); thay = await p.evaluate((id) => { const E = G.quai.find(E => E.trum === id); return !!(E && (E.bao || E.knT > 3)); }, id); }
    await danh('chieu:' + id); await cho(210);
  }
  if (N.mv) for (const id of N.mv) { await danh('mv:' + id); console.log('  mv', id, await p.evaluate((id) => __mv(id), id)); await cho(150); }
  if (N.cungLuc) {
    for (let r = 1; r <= (N.motLan ? 1 : 3); r++) {
      await danh('cungluc#' + r);
      await p.evaluate(() => { const ids = new Set(); for (const B of G.ban) for (const T of B.t) if (T) ids.add(T.id); for (const id of ids) __kich(id); });
      await cho(180);
    }
  }
  await xongProf(); if (p._tr) { await b.stopTracing(); p._tr = 0; }
  await p.evaluate(() => { __DO.on = false; });
  const F = await p.evaluate(() => __DO.f);
  const LT = await p.evaluate(() => __DO.lt);
  const NH = await p.evaluate(() => __DO.nhanh);
  const loi = p._loi.slice();
  await ctx.close();
  const pt = phanTich(F, ten); pt.loi = loi; pt.nhanh = NH; pt.longTask = LT.length; pt.longTaskMax = LT.length ? Math.max(...LT.map(x => x[1])) : 0;
  fs.writeFileSync(OUT + 'raw_' + TAG + '_' + ten + '.json', JSON.stringify(F));
  return pt;
}

module.exports = { chayNhom, NHOM, phanTich, OUT };
if (require.main === module) (async () => {
  const ds = (process.argv[2] || Object.keys(NHOM).join(',')).split(',');
  const b = await chromium.launch({ args: ['--enable-precise-memory-info'].concat(process.env.GPU ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--enable-accelerated-2d-canvas', '--enable-zero-copy'] : []) });
  const KQ = {};
  for (const ten of ds) {
    const t0 = Date.now();
    try { KQ[ten] = await chayNhom(b, ten); } catch (e) { KQ[ten] = { loi: [String(e.stack || e)] }; }
    const r = KQ[ten];
    console.log('== ' + ten + ' (' + ((Date.now() - t0) / 1000 | 0) + ' s) khung chuẩn ' + r.khungChuan + ' ms, JS TV ' + r.viecTV + ' ms, long task ' + r.longTask + (r.loi && r.loi.length ? ' LỖI ' + r.loi.slice(0, 3).join(' | ') : ''));
    for (const k of r.kq || []) { console.log('  ' + k.ten.padEnd(22) + ' xấu ' + String(k.xauDt).padStart(6) + ' ms  JS ' + String(k.xauV).padStart(6) + '  rớt ' + k.rot + '  >33 ' + k.qua33 + '  hạt ' + k.hatMax + '  vẽ ' + k.nvMax + '/' + k.mpMax + 'MP (khung xấu ' + k.nvXau + '/' + k.mpXau + ')  | ' + k.viec.join(', ')); if (k.xauV > 8) console.log('      ↳ khung JS xấu (+' + k.xauVi + '): ' + k.xauTag + (k.truocTag ? '  ‖ trước: ' + k.truocTag : '')); if (k.ham) console.log('      ↳ hàm: ' + k.ham.join(' · ')); }
  }
  fs.writeFileSync(OUT + 'kq_' + TAG + '.json', JSON.stringify(KQ, null, 1));
  await b.close();
})();
