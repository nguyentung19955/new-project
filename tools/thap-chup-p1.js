// TURRET MERGE — CHỤP DẢI KHUNG "CẢM GIÁC CHẠM P1" (tuvan/vfx/p1): triệu hồi, ghép, ghép sai, mốc 3/5/7★, power-up, rương, chí mạng,
// bàn 15 ụ bận Full vs Minimal + ĐO khung (JS mỗi khung REN._viec, trung bình / p95) Full vs Minimal (và bản gốc nếu BASE_GOC).
// Chạy (gốc repo): python3 -m http.server 8765 &   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-chup-p1.js
//   env: OUT (mặc định docs/demo-hop-tuong/tuvan/vfx/p1/)  CHI=summon,merge,...  BASE_GOC=http://localhost:8766/thap/ (đo bản trước)
// Hồ sơ iPhone 13: 390×844, DPR 3. Dải khung trận dùng ĐỒNG HỒ ẢO (performance.now + requestAnimationFrame do kịch bản bước) → đúng mốc ms.
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/vfx/p1/';
fs.mkdirSync(OUT, { recursive: true });
const CHI = process.env.CHI ? process.env.CHI.split(',') : null;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function moTrang(b, url, cfg, base) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  if (cfg) await ctx.addInitScript((c) => { try { localStorage.setItem('tm_camgiac', JSON.stringify(c)); } catch (e) { } }, cfg);
  const p = await ctx.newPage(); p._loi = [];
  p.on('pageerror', e => p._loi.push(e.message)); p.on('console', m => { if (m.type() === 'error') p._loi.push('console: ' + m.text().slice(0, 200)); });
  await p.goto((base || BASE) + url, { waitUntil: 'load', timeout: 120000 });
  if (!/mode=/.test(url)) { await p.waitForFunction(() => typeof KTUI !== 'undefined' && typeof TAI !== 'undefined' && !TAI.cho, null, { timeout: 120000 }); await sleep(2500); return { ctx, p }; }
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && typeof TAI !== 'undefined' && !TAI.cho, null, { timeout: 120000 });
  await p.evaluate(() => { G.debug.dpr = 3; REN.coLai(); });
  if (/mode=/.test(url)) { await p.waitForFunction(() => !G.dung, null, { timeout: 30000 }).catch(() => { }); }
  await sleep(1200);
  return { ctx, p };
}
// đồng hồ ảo: performance.now / rAF do __buoc(ms) điều khiển (16,7 ms / bước)
function DONGHO() {
  if (window.__vt != null) return;
  const p0 = performance.now.bind(performance); window.__vt = p0(); const q = [];
  performance.now = () => window.__vt;
  window.requestAnimationFrame = (f) => { q.push(f); return q.length; };
  window.__buoc = (ms) => { const n = Math.max(1, Math.round(ms / 16.667)); for (let i = 0; i < n; i++) { window.__vt += ms / n; const fs = q.splice(0); for (const f of fs) { try { f(window.__vt); } catch (e) { console.error(e); } } } };
  // cắt vùng canvas trận (nền + trận) quanh (x,y) toạ độ logic, cỡ w×h logic → canvas nhỏ
  window.__cat = (x, y, w, h) => {
    const k = REN.s * REN.dpr, cv = document.getElementById('cv'), nen = document.getElementById('cv-nen');
    const rc = cv.getBoundingClientRect(), rn = nen.getBoundingClientRect(), sx = cv.width / rc.width;
    const c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k); const g = c.getContext('2d');
    const X = (x - w / 2) * k + (REN.ox || 0) * 0, Y = (y - h / 2) * k;
    // toạ độ logic → điểm ảnh canvas: REN dùng setTransform(k) gốc 0 → điểm ảnh = logic × k
    g.fillStyle = '#111'; g.fillRect(0, 0, c.width, c.height);
    if (nen.width > 2) { const sn = nen.width / rn.width; g.drawImage(nen, X + (rc.left - rn.left) * sn, Y + (rc.top - rn.top) * sn, c.width, c.height, 0, 0, c.width, c.height); }
    g.drawImage(cv, X, Y, c.width, c.height, 0, 0, c.width, c.height);
    return c;
  };
  window.__dai = (ds, nhan, tieuDe) => { // ghép dải ngang + nhãn ms (ảnh kiểm, không phải ảnh game)
    const w = ds[0].width, h = ds[0].height, s = document.createElement('canvas'); s.width = w * ds.length + 4 * (ds.length - 1); s.height = h + 44;
    const g = s.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, s.width, s.height);
    g.font = 'bold 26px sans-serif'; g.fillStyle = '#fff'; g.fillText(tieuDe || '', 8, 30);
    ds.forEach((c, i) => { g.drawImage(c, i * (w + 4), 44); g.fillStyle = '#ffe14a'; g.font = 'bold 24px sans-serif'; g.fillText(nhan[i], i * (w + 4) + 8, 44 + h - 10); });
    return s.toDataURL('image/png');
  };
}
async function luu(p, ten, url) { fs.writeFileSync(OUT + ten + '.png', Buffer.from(url.split(',')[1], 'base64')); console.log('  ảnh', OUT + ten + '.png'); }

// dải khung theo mốc ms sau hành động act (chạy trong trang), cắt quanh ô o của bàn 0
async function dai(p, ten, tieuDe, act, moc, o, co) {
  const url = await p.evaluate(async ([act, moc, o, co, tieuDe]) => {
    const ds = [], nhan = []; let t = 0;
    const B = G.ban[0];
    const c = eval(act)(B); const oo = c != null ? c : o; const q = B.o[oo], C = Math.min(B.cw, B.ch) * (co || 2.2);
    for (const m of moc) { window.__buoc(m - t); t = m; ds.push(window.__cat(q.x, q.y - C * 0.1, C, C)); nhan.push(m + ' ms'); }
    return window.__dai(ds, nhan, tieuDe);
  }, [act, moc, o, co, tieuDe]);
  await luu(p, ten, url);
}
const BAN = (ids, sao) => `((B) => { G.hang.length = 0; G.quai.length = 0; G.cho = 1e9; B.tim = 1e9; for (let o = 0; o < 15; o++) B.t[o] = null; ${ids ? `const ds = ${JSON.stringify(ids)}; ds.forEach((x, o) => { if (!x) return; const T = sinhU(taoU(B, x[0], x[1], o)); T.vxA = null; T._gs = null; B.t[o] = T; });` : ''} })(G.ban[0])`;

const CANH = {
  async summon(b) {
    const { ctx, p } = await moTrang(b, '?mode=solo&deck=canon,kiembang,cuongno,aten,blackhole&wave=1&mana=0&notut=1&seed=7');
    await p.evaluate(DONGHO);
    for (const [id, nh] of [['canon', 'TRẮNG'], ['kiembang', 'XANH'], ['aten', 'VÀNG']]) {
      await p.evaluate(BAN(null));
      await p.evaluate(() => window.__buoc(300));
      await dai(p, 'p1_summon_' + id, 'SUMMON ' + nh + ' (' + id + ') — chớp ô, trồi lên, viền bậc từ XANH', `(B) => { for (let o = 0; o < 15; o++) B.t[o] = null; const T = trieu(B, true, '${id}'); return T.o; }`, [0, 50, 100, 150, 200, 260, 320, 390, 460], 7, 1.7);
    }
    await ctx.close(); return p._loi;
  },
  async merge(b) {
    const { ctx, p } = await moTrang(b, '?mode=solo&deck=canon,kiembang,cuongno,aten,lien&wave=1&mana=0&notut=1&seed=7');
    await p.evaluate(BAN([['lien', 1], ['canon', 5]])); await sleep(1500);
    await p.evaluate(DONGHO);
    await p.evaluate(BAN([null, null, null, null, null, null, ['canon', 2], ['canon', 2]]));
    await p.evaluate(() => window.__buoc(300));
    await dai(p, 'p1_merge', 'MERGE 2★+2★ — hút vào tâm, rung nhẹ, SAO MỚI trước (380) rồi đầu súng ngẫu nhiên (470)', `(B) => { ghep(B, B.t[6], B.t[7]); return 7; }`, [0, 100, 200, 260, 330, 400, 460, 520, 600, 720], 7, 1.9);
    // kéo: ô hợp lệ sáng (ảnh tĩnh lúc đang kéo)
    await p.evaluate(BAN([['canon', 1], ['lien', 1], ['canon', 1], null, ['canon', 2], null, ['canon', 1], null, ['lien', 1], null, null, ['canon', 1]]));
    await p.evaluate(() => window.__buoc(300));
    const url = await p.evaluate(() => {
      const B = G.ban[0], T = B.t[0], o = B.o[0];
      UI.keo = { T, x: o.x, y: o.y, x0: o.x, y0: o.y, dang: true, lech: true }; window.__buoc(200);
      const o2 = B.o[2]; UI.keo.x = o2.x; UI.keo.y = o2.y + 8; window.__buoc(200);
      const c = window.__cat(B.x + B.w / 2, B.y + B.h / 2, B.w + 10, B.h + 10); UI.keo = null; window.__buoc(400);
      return window.__dai([c], ['kéo'], 'ĐANG KÉO canon 1★ — chỉ ô ghép được có vòng nam châm');
    });
    await luu(p, 'p1_merge_keo', url);
    await ctx.close(); return p._loi;
  },
  async invalid(b) {
    const { ctx, p } = await moTrang(b, '?mode=solo&deck=canon,kiembang,cuongno,aten,lien&wave=1&mana=0&notut=1&seed=7');
    await p.evaluate(BAN([null, null, null, null, null, null, ['canon', 1], ['lien', 1]]));
    await sleep(1500); // ảnh lien tải + giải mã trong đồng hồ THẬT (TAI.doi chờ theo performance.now)
    await p.evaluate(DONGHO);
    await p.evaluate(() => window.__buoc(100));
    const url = await p.evaluate(() => {
      const B = G.ban[0], T = B.t[6], o = B.o[6], d = B.o[7], ds = [], nh = [];
      UI.keo = { T, x: o.x, y: o.y, x0: o.x, y0: o.y, dang: true, lech: true }; window.__buoc(120);
      UI.keo.x = d.x; UI.keo.y = d.y + 30; window.__buoc(200);
      const C = Math.min(B.cw, B.ch) * 2.6, cx = (o.x + d.x) / 2;
      ds.push(window.__cat(cx, o.y - 10, C, C * 0.8)); nh.push('thả');
      UI.keo = null; let t = 0;
      for (const m of [34, 67, 100, 150, 200, 260, 340]) { window.__buoc(m - t); t = m; ds.push(window.__cat(cx, o.y - 10, C, C * 0.8)); nh.push(m + ' ms'); }
      return window.__dai(ds, nh, 'GHÉP SAI (canon lên lien) — về ô 150 ms, bệ chớp đỏ 1 lần');
    });
    await luu(p, 'p1_invalid', url);
    await ctx.close(); return p._loi;
  },
  async star(b) {
    const { ctx, p } = await moTrang(b, '?mode=solo&deck=canon,kiembang,cuongno,aten,lien&wave=1&mana=0&notut=1&seed=7');
    await p.evaluate(DONGHO);
    await p.evaluate(BAN([['canon', 3], ['canon', 5], ['canon', 7]])); await sleep(1500); await p.evaluate(() => window.__buoc(50));
    for (const n of [3, 5, 7]) {
      await p.evaluate(BAN([null, null, null, null, null, null, null, ['canon', n]]));
      await p.evaluate(() => window.__buoc(300));
      await dai(p, 'p1_sao' + n, 'MỐC ' + n + '★ — ' + (n === 3 ? '3 tia' : n === 5 ? 'vòng 5 cung' : 'vương miện + 7 mảnh sao'), `(B) => { VX.saoLen(B.t[7], ${n}, '', 0); return 7; }`, [0, 60, 120, 200, 300, 420, 560, 700, 880], 7, 1.9);
    }
    await ctx.close(); return p._loi;
  },
  async crit(b) {
    const { ctx, p } = await moTrang(b, '?mode=solo&deck=canon,kiembang,cuongno,aten,lien&wave=3&mana=0&notut=1&seed=7');
    await p.evaluate(DONGHO);
    await p.evaluate(BAN([['canon', 3]]));
    const url = await p.evaluate(() => {
      const B = G.ban[0], T = B.t[0];
      const E = sinhQuai('bo', 0, G.duong[0].len * 0.3, 1); E.vao = 1; E.hp = E.max = 1e9;
      window.__buoc(50);
      const ds = [], nh = []; let t = 0;
      G.dangBan = T; trung(E, 10, { T, crit: true }); G.dangBan = null;
      for (const m of [0, 40, 80, 130, 200, 280]) { window.__buoc(Math.max(1, m - t)); t = m; ds.push(window.__cat(E.x, E.y, 90, 90)); nh.push(m + ' ms'); }
      return window.__dai(ds, nh, 'CHÍ MẠNG — tia sắc nhỏ T2 + số vàng (đòn thường: không tia)');
    });
    await luu(p, 'p1_crit', url);
    await ctx.close(); return p._loi;
  },
  async powerup(b) {
    const { ctx, p } = await moTrang(b, '?mode=solo&deck=canon,kiembang,cuongno,aten,lien&wave=1&mana=0&notut=1&seed=7');
    await p.evaluate(BAN([['canon', 1], ['canon', 2], null, ['kiembang', 1], null, ['canon', 1]]));
    await p.evaluate(() => { G.ban[0].mana = 5000; });
    await sleep(500);
    const the = await p.$('#bo-the .the[data-id="canon"]'); const bb = await the.boundingBox();
    const bd = await p.evaluate(() => { const B = G.ban[0], r = document.getElementById('cv').getBoundingClientRect(), k = r.width / W; return { x: r.left + B.x * k, y: r.top + B.y * k, w: B.w * k, h: B.h * k }; });
    const clip = { x: Math.max(0, bb.x - 30), y: bb.y - 6, width: bb.width + 60, height: bb.height + 12 };
    const anh = [];
    for (let lan = 0; lan < 2; lan++) {
      await p.evaluate(() => { nangCap(G.ban[0], 'canon'); });
      const t0 = Date.now();
      for (let i = 0; i < 5; i++) { anh.push(await p.screenshot({ clip, scale: 'css' })); }
      console.log('  power-up', lan + 1, '5 ảnh trong', Date.now() - t0, 'ms');
      await sleep(900);
    }
    await ghepAnh(p, anh, 'p1_powerup', 'POWER-UP canon ×2 (LV2, LV3): thẻ bùng + vạch nạp + vòng trên mọi ụ cùng loại');
    await ctx.close(); return p._loi;
  },
  async chest(b) {
    const { ctx, p } = await moTrang(b, '?notut=1');
    await sleep(1500);
    const ok = await p.evaluate(() => { try { KTUI.moTab('shop'); KTUI.moRuongAnim({ k: 'vang', the: [{ id: 'canon', n: 5, bac: 'trang' }, { id: 'kiembang', n: 2, bac: 'xanh' }, { id: 'aten', n: 1, bac: 'vang' }] }, {}); return 1; } catch (e) { return String(e); } });
    if (ok !== 1) { console.log('  rương: không mở được', ok); await ctx.close(); return p._loi.concat(['chest ' + ok]); }
    const anh = []; const t0 = Date.now(); const tg = [];
    while (Date.now() - t0 < 2100) { anh.push(await p.screenshot({ clip: { x: 20, y: 150, width: 350, height: 470 }, scale: 'css' })); tg.push(Date.now() - t0); }
    await ghepAnh(p, anh.filter((_, i) => i % Math.max(1, Math.floor(anh.length / 10)) === 0).slice(0, 10), 'p1_chest', 'MỞ RƯƠNG VÀNG 4 nhịp: chốt → khe sáng → nắp mở → thẻ bay ra → lật', tg.filter((_, i) => i % Math.max(1, Math.floor(anh.length / 10)) === 0).slice(0, 10).map(x => x + ' ms'));
    await ctx.close(); return p._loi;
  },
  async ketthuc(b) {
    const { ctx, p } = await moTrang(b, '?mode=solo&deck=canon,kiembang,cuongno,aten,blackhole&wave=8&mana=0&notut=1&seed=7');
    await p.evaluate(() => { const B = G.ban[0]; for (let o = 0; o < 15; o++) { const T = sinhU(taoU(B, B.deck[o % 5], 2 + (o % 3), o)); T.vxA = null; T._gs = null; B.t[o] = T; } });
    await sleep(1200);
    const a0 = await p.screenshot({ scale: 'css' });
    await p.evaluate(() => ketThuc(false, 'test'));
    await sleep(700);
    const a1 = await p.screenshot({ scale: 'css' });
    await ghepAnh(p, [a0, a1], 'p1_thua', 'THUA: bàn giảm bão hoà nhẹ trong 0,9 s trước màn kết quả (không nổ dài)', ['trước', '+700 ms']);
    await ctx.close(); return p._loi;
  },
  async busy(b) {
    const out = {};
    for (const fx of ['full', 'gon']) {
      const { ctx, p } = await moTrang(b, '?mode=solo&deck=blackhole,overlord,hydra,cuuvi,ronglua&wave=30&mana=0&notut=1&seed=7', { fx, flash: false, rung: true });
      await p.evaluate(() => { const B = G.ban[0]; G.hang.length = 0; G.cho = 1e9; B.tim = 1e9; for (let o = 0; o < 15; o++) { const id = B.deck[o % 5]; const T = sinhU(taoU(B, id, 7, o)); T.vxA = null; T._gs = null; B.t[o] = T; }
        for (let pi = 0; pi < G.duong.length; pi++) for (let i = 0; i < 30; i++) { const E = sinhQuai(i % 5 ? 'bo' : 'khong_lo', pi, G.duong[pi].len * (0.05 + i / 30 * 0.8), 1); E.vao = 1; E.hp = E.max = 1e9; } });
      await sleep(4000);
      const url = await p.evaluate(() => { const c = document.createElement('canvas'), cv = document.getElementById('cv'), nen = document.getElementById('cv-nen'); c.width = cv.width; c.height = cv.height; const g = c.getContext('2d'); if (nen.width > 2) g.drawImage(nen, 0, 0, c.width, c.height); g.drawImage(cv, 0, 0); const s = document.createElement('canvas'); s.width = c.width / 3; s.height = c.height / 3; s.getContext('2d').drawImage(c, 0, 0, s.width, s.height); return s.toDataURL('image/png'); });
      await luu(p, 'p1_busy_' + fx, url);
      out[fx] = await p.evaluate(() => ({ hat: FX.hat.length, anim: FX.anim.length, MAX_HAT: FX.MAX_HAT, MAX_ANIM: FX.MAX_ANIM }));
      console.log('  bàn bận', fx, JSON.stringify(out[fx]), 'lỗi', p._loi.slice(0, 2));
      await ctx.close();
    }
    return [];
  },
};
// ghép ảnh chụp màn (Buffer PNG) thành 1 dải
async function ghepAnh(p, anh, ten, tieuDe, nhan) {
  const url = await p.evaluate(async ([ds, tieuDe, nhan]) => {
    const im = await Promise.all(ds.map(b64 => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.src = 'data:image/png;base64,' + b64; })));
    const w = im[0].width, h = im[0].height, s = document.createElement('canvas'); s.width = (w + 4) * im.length; s.height = h + 30;
    const g = s.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, s.width, s.height); g.fillStyle = '#fff'; g.font = 'bold 18px sans-serif'; g.fillText(tieuDe, 6, 21);
    im.forEach((i, k) => { g.drawImage(i, k * (w + 4), 30); if (nhan && nhan[k]) { g.fillStyle = '#ffe14a'; g.fillText(nhan[k], k * (w + 4) + 6, 30 + h - 8); } });
    return s.toDataURL('image/png');
  }, [anh.map(a => a.toString('base64')), tieuDe, nhan || null]);
  await luu(p, ten, url);
}

// ĐO KHUNG: bàn 15 ụ 7★ + 30 quái/làn, kỹ năng đỏ tự chạy — 10 s, JS mỗi khung (REN._viec) trung bình / p95
async function doKhung(b, base, fx) {
  const { ctx, p } = await moTrang(b, '?mode=solo&deck=blackhole,overlord,hydra,cuuvi,ronglua&wave=30&mana=0&notut=1&seed=7', fx ? { fx, flash: false, rung: true } : null, base);
  await p.evaluate(() => { const B = G.ban[0]; G.hang.length = 0; G.cho = 1e9; B.tim = 1e9; for (let o = 0; o < 15; o++) { const id = B.deck[o % 5]; const T = sinhU(taoU(B, id, 7, o)); T.vxA = null; T._gs = null; B.t[o] = T; }
    for (let pi = 0; pi < G.duong.length; pi++) for (let i = 0; i < 30; i++) { const E = sinhQuai(i % 5 ? 'bo' : 'khong_lo', pi, G.duong[pi].len * (0.05 + i / 30 * 0.8), 1); E.vao = 1; E.hp = E.max = 1e9; } });
  await sleep(3000);
  const r = await p.evaluate(() => new Promise(ok => {
    const v = [], dts = []; let tr = 0, n = 0;
    const f = (t) => { if (tr) dts.push(t - tr); tr = t; v.push(REN._viec || 0); for (const E of G.quai) if (!E.trum && E.hp < 1e8) E.hp = E.max = 1e9; if (++n < 600) requestAnimationFrame(f); else ok({ v, dts }); };
    requestAnimationFrame(f);
  }));
  await ctx.close();
  const s = (a) => { a = a.slice().sort((x, y) => x - y); return { tb: +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(2), p95: +a[Math.floor(a.length * 0.95)].toFixed(2) }; };
  return { js: s(r.v), dt: s(r.dts), loi: p._loi.slice(0, 3) };
}

(async () => {
  const b = await chromium.launch();
  const loi = {};
  for (const k of Object.keys(CANH)) { if (CHI && !CHI.includes(k)) continue; console.log('▶', k); try { const l = await CANH[k](b); if (l && l.length) loi[k] = l.slice(0, 3); } catch (e) { loi[k] = [e.message.split('\n')[0]]; console.log('  LỖI', e.message.split('\n')[0]); } }
  if (!CHI || CHI.includes('do')) {
    const kq = {};
    for (let lan = 0; lan < (+process.env.LAN || 2); lan++) {
      if (process.env.BASE_GOC) { const r = await doKhung(b, process.env.BASE_GOC, null); (kq.goc = kq.goc || []).push(r); console.log('  đo bản GỐC', JSON.stringify(r)); }
      for (const fx of ['full', 'can', 'gon']) { const r = await doKhung(b, BASE, fx); (kq[fx] = kq[fx] || []).push(r); console.log('  đo', fx, JSON.stringify(r)); }
    }
    fs.writeFileSync(OUT + 'do-khung.json', JSON.stringify(kq, null, 1));
  }
  console.log('lỗi trang:', JSON.stringify(loi));
  await b.close();
})();
