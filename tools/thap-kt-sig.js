// TURRET MERGE — chụp dải khung (mỗi 80 ms) 10 khoảnh khắc ĐẶC BIỆT (js/sigfx.js) trong TRẬN (bước mô phỏng cố định) và
// trên trang hồ sơ ụ (Test range = iframe ?preview=<id>, thời gian thật) ở 390×844 DPR 3. Ghi lỗi trang + đo fps.
// Chạy: python3 -m http.server 8765 (gốc repo) rồi  node tools/thap-kt-sig.js [thư_mục_ra]   → <ra>/raw/*.json (dataURL) — ghép bằng thap-kt-sig-ghep.py
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const OUT = process.argv[2] || 'docs/demo-hop-tuong/tuvan/sig';
fs.mkdirSync(OUT + '/raw', { recursive: true });
const BASE = 'http://localhost:8765/thap/';
const CANH = [ // id, sao, cách kích hoạt, ô vùng chụp (logic) [x, y, w, h]
  ['marionette', 4, 'nap', null], ['ngaithoigian', 4, 'chu', null], ['blackhole', 4, 'nap', null], ['ronglua', 4, 'chu', null], ['leviathan', 4, 'chu', null],
  ['hydra', 7, 'nap', null], ['pandora', 3, 'ghep', null], ['hasao', 3, 'w5', null], ['vughep', 3, 'vua', null], ['chuato', 4, 'chu', null],
];
if (process.env.ONLY) CANH.splice(0, CANH.length, ...CANH.filter(c => process.env.ONLY.split(',').includes(c[0])));
const SO = 16, MS = 80, SO_RIENG = { marionette: 48, blackhole: 44, ronglua: 22, leviathan: 24, chuato: 24, pandora: 20 };

function dung(id, sao, kieu) { // trong trang: dựng cảnh + kích hoạt; trả vùng chụp
  const B = G.ban[0], p0 = G.duong[0]; B.tim = 1e9; B.mana = 1e6;
  G.quai.length = 0; G.hang.length = 0; G.hu = G.hu.filter(o => o.k === 'truyNaVe'); FX.reset(); SIG.ds.length = 0; G.cho = 0; G.tWave = 3;
  for (let i = 0; i < B.t.length; i++) B.t[i] = null;
  const dat = (o, id2, s) => { const T = sinhU(taoU(B, id2, s, o)); B.t[o] = T; return T; };
  const T = dat(7, id, sao);
  for (const [o, id2] of [[6, 'canon'], [8, 'tia'], [2, 'set'], [12, 'canon']]) dat(o, id2, sao <= 3 ? sao : 3);
  const Q = []; for (let i = 0; i < 9; i++) { const E = sinhQuai(i === 4 ? 'khong_lo' : 'bo', 0, p0.len * (0.28 + i * 0.05), 60); E.vao = 1; Q.push(E); }
  for (const E of Q) [E.x, E.y, E.goc] = viTri(p0, E.s);
  const c = B.o[7];
  if (kieu === 'nap') T.nap = 1;
  if (kieu === 'chu') {
    T.nap = 1; T.napDay = 0;
    if (id === 'chuato') { SKILLS.chuato.sinh(G, T); for (let i = 0; i < 6; i++) T.bay.push({ x: c.x + 20 * Math.cos(i), y: c.y + 20 * Math.sin(i), g: i, r: 0, cd: 9, vang: false, ra: 1 }); }
    for (let i = 0; i < 3; i++) { chupTruoc(); capNhat(BUOC); }
    SKILLS[id].chuDong(G, B, T);
  }
  if (kieu === 'ghep') SKILLS[id].ghep(G, B, { id, sao }, { o: 7 }, T);
  if (kieu === 'w5') { T.da5Dau = 1; T.da5 = new Set(); T.w5 = -1; B.t[6].sao = 5; for (const X of B.t) if (X && X !== B.t[6] && X !== T) X.sao = 2; }
  if (kieu === 'vua') { const b = B.t[6]; b.sao = sao; T.sao = sao; SKILLS.vughep.ghepDB.lam(G, B, T, b); }
  window._T = T;
  return 1;
}

(async () => {
  const b = await chromium.launch();
  const errs = [];
  const moTrang = async (url) => {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
    p.on('pageerror', e => errs.push(url.slice(-40) + ' ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource|firebase/i.test(m.text())) errs.push(url.slice(-40) + ' console ' + m.text()); });
    await p.addInitScript(() => { window.__BB = [1e9, 1e9, -1e9, -1e9]; addEventListener('DOMContentLoaded', () => { const t = setInterval(() => { if (typeof SIG === 'undefined') return; clearInterval(t); const k0 = SIG.k; SIG.k = function (ctx, ten, f, x, y, w, o) { const r = k0.apply(this, arguments); if (r && ctx.canvas === REN.cv) { const m = ctx.getTransform(), h = w * (SIG_META[ten][2] / SIG_META[ten][1]), R = Math.max(w, (o && o.h) || h) * 0.6, X = m.a * x + m.c * y + m.e, Y = m.b * x + m.d * y + m.f, K = Math.hypot(m.a, m.b) * R; const B = window.__BB; B[0] = Math.min(B[0], X - K); B[1] = Math.min(B[1], Y - K); B[2] = Math.max(B[2], X + K); B[3] = Math.max(B[3], Y + K); } return r; }; }, 20); }); });
    await p.goto(BASE + url, { waitUntil: 'load' });
    return p;
  };
  const kq = { tran: {}, test: {}, fps: {} };
  // ----- TRẬN -----
  for (const nhom of [CANH.slice(0, 5), CANH.slice(5)].filter(n => n.length)) {
    const deck = nhom.map(c => c[0]).concat(['canon', 'tia', 'set', 'lien']).slice(0, 5).join(',');
    const p = await moTrang('?mode=solo&deck=' + deck + '&wave=6&fill=5&mana=99999&notut=1');
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length && !TAI.cho, null, { timeout: 30000 });
    await p.waitForTimeout(1500);
    await p.evaluate(() => { SIG._tNap = -9; SIG.nap(); });
    await p.waitForFunction(() => Object.keys(SIG_META).filter(k => REN.anh[k]).every(k => REN.img(k)), null, { timeout: 20000 });
    for (const [id, sao, kieu] of nhom) {
      await p.evaluate(([id, sao, kieu, f]) => { window.__BB = [1e9, 1e9, -1e9, -1e9]; G.dung = true; new Function('return ' + f)()(id, sao, kieu); }, [id, sao, kieu, dung.toString()]);
      const fr = await p.evaluate(([SO, MS]) => {
        const out = [], cv = REN.cv, k = REN.s * REN.dpr, o = document.createElement('canvas'); o.width = Math.round(390 * 3 / 3 * 1.0); o.height = Math.round(844 * 1.0);
        let nb = 0, minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
        const step = () => { let n = Math.round(MS / 1000 / BUOC); while (n--) { chupTruoc(); capNhat(BUOC); } REN.ve(MS / 1000, 1); };
        const caps = [];
        for (let i = 0; i < SO; i++) { step(); const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; c.getContext('2d').drawImage(cv, 0, 0); caps.push([c, SIG.ds.map(m => m.k).join('+')]); }
        return caps.map(([c, s]) => [c.toDataURL('image/jpeg', 0.8), s]);
      }, [SO_RIENG[id] || SO, MS]);
      fr.bb = await p.evaluate(() => { const b = window.__BB.slice(); window.__BB = [1e9, 1e9, -1e9, -1e9]; return b; });
      kq.tran[id] = fr; console.log('tran', id, fr.map(f => f[1] || '-').join(' '));
    }
    // chi phí lớp SIG mỗi khung (ms) khi chạy thật 4 s ngay sau khi mọi chiêu nổ (fps tuyệt đối của Chromium headless phần mềm không đại diện điện thoại)
    const fps = await p.evaluate(() => new Promise(ok => { G.dung = false; G.tocDo = 1; for (const T of G.ban[0].t) if (T) T.nap = 1; let n = 0, ms = 0, mx = 0; const v0 = SIG.veTren; SIG.veTren = function (c, R) { const q = performance.now(); v0.call(SIG, c, R); const d = performance.now() - q; ms += d; mx = Math.max(mx, d); }; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 4000) requestAnimationFrame(f); else { SIG.veTren = v0; ok({ fps: n / 4, sigMsTB: +(ms / n).toFixed(2), sigMsMax: +mx.toFixed(1) }); } }; requestAnimationFrame(f); }));
    kq.fps[deck] = fps; console.log('fps', deck, JSON.stringify(fps));
    await p.close();
  }
  // ----- TEST RANGE (trang hồ sơ ụ, iframe preview) -----
  for (const [id, sao] of CANH) {
    const p = await moTrang('index.html?preview=' + id + '&star=' + sao + '&dpr=3&notut=1');
    await p.waitForFunction(() => typeof SIG !== 'undefined' && G.ban && G.ban.length, null, { timeout: 30000 }).catch(() => {});
    const fr = await p.evaluate(([SO, MS]) => new Promise(ok => {
      const cv = REN.cv, caps = []; let t0 = performance.now(), bat = 0;
      const iv = setInterval(() => {
        if (!bat && SIG.ds.some(m => m.k !== 'sigDuoi')) bat = performance.now();
        if (bat) { const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; c.getContext('2d').drawImage(cv, 0, 0); caps.push([c.toDataURL('image/jpeg', 0.8), SIG.ds.map(m => m.k).join('+')]); }
        if (caps.length >= SO || performance.now() - t0 > 26000) { clearInterval(iv); ok(caps); }
      }, MS);
    }), [SO_RIENG[id] || SO, MS]);
    fr.bb = await p.evaluate(() => window.__BB);
    kq.test[id] = fr; console.log('test', id, fr.length, fr.map(f => f[1] || '-').join(' '));
    await p.close();
  }
  for (const k of ['tran', 'test']) for (const id in kq[k]) fs.writeFileSync(path.join(OUT, 'raw', k + '_' + id + '.json'), JSON.stringify({ fr: kq[k][id], bb: kq[k][id].bb }));
  fs.writeFileSync(path.join(OUT, 'ket-qua.json'), JSON.stringify({ errs, fps: kq.fps }, null, 1));
  console.log('ERR', errs.length, JSON.stringify(errs.slice(0, 10)));
  await b.close();
})();
