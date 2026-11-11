// TURRET MERGE — đo + kiểm tối ưu hiển thị cảnh CO-OP nặng cuối trận (11/11, "giật co-op wave 38").
// LÁI TẤT ĐỊNH: đồng hồ ảo + rAF do công cụ bơm + Math.random tách 2 dòng (luật / hình) → cùng hạt giống ra cùng trạng thái G ở mọi bản code.
//   · HASH=1800,3600 KHONGVE=1 : băm trạng thái luật (mana, ụ, quái, đạn…) sau N bước mô phỏng thuần — so 2 bản code phải GIỐNG HỆT
//   · HASH=450,900            : như trên nhưng có vẽ (REN.ve / FX / HUD chạy mỗi khung)
//   · BENCH=15                : ms vẽ + tô 1 khung ở đúng trạng thái đó (trung vị);  TN="tên=js;;…" đo thêm từng biến thể (js trả về hàm hoàn tác)
//   · SHOT=1 OUT=thư-mục      : chụp màn ở đúng trạng thái đó (so hình 2 bản code)
//   · DEM=1                   : đếm lệnh vẽ 1 khung theo nhóm (drawImage 2D + điểm ảnh đích, lệnh không-ảnh, draw call WebGL) — chỉ số độc lập máy
//   · THUC=25                 : sau các bước trên, chạy 25 s THỜI GIAN THỰC (rAF thật) → khoảng khung trung vị/p95/p99/max, số khung > 33 ms
//   · Q=gl=1 | Q=gl=0         : ép bật / tắt lớp WebGL (js/gl/glr.js); GLTT=1 in GLR.thongTin(); KHONGGL=1 chặn WebGL (kiểm dự phòng 2D); DPR=2
// Chạy (gốc repo): python3 -m http.server 8765 &   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-hieunang-coop.js <A|B|C|D> <nhãn>
//   BASE=http://localhost:8765/thap/ (đổi để trỏ bản code khác) · KHUNG=1200 · cảnh: A = video người dùng (wave 38, DRAG NET), B = nhiều đạn/hiệu ứng wave 55,
//   C = bocap + cuuvi + hydra wave 45, D = đường đặc quái wave 35 (≈ 100 quái). Bản đo khung hình thời gian thực: xem docs/demo-hop-tuong/tuvan/hieu-nang/BAO-CAO.md.
const { chromium } = require('playwright');
const fs = require('fs');
const [canh = 'A', nhan = 'truoc'] = process.argv.slice(2);
const BASE = process.env.BASE || 'http://localhost:' + (process.env.PORT || 8765) + '/thap/', KHUNG = +(process.env.KHUNG || 1200), OUT = process.env.OUT || '.';
const CANH = {
  A: { wave: 38, d1: 'nguyenrua,sinhdoi,khoisinh,lualien,chuato', d2: 'leviathan,cobac,ronglua,chuato,overlord', sao: 4 },
  B: { wave: 55, d1: 'cobac,leviathan,ronglua,chuato,overlord', d2: 'cobac,leviathan,ronglua,chuato,overlord', sao: 5 },
  C: { wave: 45, d1: 'bocap,cuuvi,hydra,cobac,leviathan', d2: 'bocap,cuuvi,hydra,khoisinh,sinhdoi', sao: 4 },
  D: { wave: 35, d1: 'cobac,vughep,sinhdoi,saochep,tudo', d2: 'lualien,mauhut,lien,lanhgia,phagiap', sao: 3, af: 'tide', quai: 90, ds: ['tach', 'nho', 'nho', 'que_tach', 'nho', 'khong_lo', 'bay', 'nho', 'tach', 'nho'], u2: 10, b1: ['cobac', 'vughep', 'cobac', 'vughep', 'cobac', 'sinhdoi', 'cobac', 'vughep', 'cobac', 'vughep', 'cobac', 'sinhdoi', 'vughep', 'sinhdoi', 'tudo'] },
};
const C = CANH[canh];
(async () => {
  // WebGL (js/gl/glr.js): máy đo không có GPU thật → GPU phần mềm SwiftShader; Q=gl=1 ép bật (mặc định game chỉ bật khi có GPU thật), Q=gl=0 tắt.
  //   KHONGGL=1: chặn getContext('webgl…') trả null (kiểm đường dự phòng 2D). DPR=2 đổi mật độ điểm ảnh. GLTT=1 in GLR.thongTin().
  const b = await chromium.launch({ args: ['--enable-gpu-rasterization', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'].concat(process.env.KHONGGPU ? ['--disable-gpu', '--disable-software-rasterizer'] : []) });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: +(process.env.DPR || 3), isMobile: true, hasTouch: true });
  if (process.env.KHONGGL) await ctx.addInitScript(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (k) { return /webgl/.test(k) ? null : g.apply(this, arguments); }; });
  await ctx.addInitScript(() => {
    const mb = (a) => function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    window.__mb = mb; Math.random = mb(12345);
    window.__now = performance.now.bind(performance); window.__vt = 1000;
    performance.now = () => window.__vt; Date.now = () => 1.7e12 + window.__vt;
    window.__rafGoc = window.requestAnimationFrame.bind(window);
    window.__raf = []; window.requestAnimationFrame = (f) => { window.__raf.push(f); return window.__raf.length; }; window.cancelAnimationFrame = () => { };
    window.__f = 0;
    window.__buoc = (n, C) => { for (let i = 0; i < n; i++) {
      window.__vt += 1000 / 60; window.__f++;
      const cb = window.__raf; window.__raf = []; for (const f of cb) { try { f(window.__vt); } catch (e) { window.__loi = String(e && e.stack || e); } } } return window.__f; };
    window.__giu = (C) => {
      for (const B of G.ban) { B.tim = 1e9; if (B.mana < 5000) B.mana = 99999; B.mv.gia = 1; const h = (B.chm || []).find(h => h.k === 'luoi'); if (!h) { B.mv.cd = 0; try { dungMV(B); } catch (e) { } } else if (h.con < 1.5) h.con = h.max - 1; }
      if (G.wave > C.wave) G.wave = C.wave;
      let n = 0; for (const E of G.quai) if (!E.chet && !E.trum) n++; window.__bu = (window.__bu | 0); if (n < (C.quai || 35) && G.t > 2) { const ids = C.ds || Object.keys(QUAI); sinhQuai(ids[window.__bu % ids.length], window.__bu % G.duong.length, 0, 1); window.__bu++; }
      for (const E of G.quai) if (!E.trum && !E.chet) { if (E.s < G.duong[E.p].len * 0.85) { if (!E._m) { E._m = E.max; E.max *= 3000; } E.hp = Math.max(E.hp, E.max * 0.5); } else if (E._m && E.hp > E._m) E.hp = E._m; }
    };
    window.__bam = () => { // băm trạng thái luật
      let h = 2166136261 >>> 0; const them = (v) => { const s = typeof v === 'number' ? (Number.isInteger(v) ? String(v) : v.toPrecision(12)) : String(v); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } h ^= 124; h = Math.imul(h, 16777619) >>> 0; };
      them(G.t); them(G.wave); them(G.tWave); them(G.uid); them(G.quai.length); them(G.dan.length); them(G.hu.length); them(G.hang.length);
      for (const B of G.ban) { them(B.mana); them(B.tim); them(B.gia); them(B.mv.cd); them(B.dem.giet); for (const id in B.lv) them(id + B.lv[id]);
        for (const T of B.t) { if (!T) { them('-'); continue; } them(T.id); them(T.sao); them(T.cd); them(T.nap); them(T.goc); them(T.uid); them(T.st.bang); them(T.st.da ? 1 : 0); them(T.buf.dmg); them(T.buf.toc); them(T.banLan || 0); for (const k of ['lc', 'sting', 'dem', 'diem', 'tich', 'stack', 'gd', 'dang', 'huong']) if (typeof T[k] === 'number') them(k + T[k]); } }
      for (const E of G.quai) { them(E.id); them(E.uid); them(E.hp); them(E.s); them(E.p); them(E.cham); them(E.doc); them(E.chet ? 1 : 0); }
      for (const d of G.dan) { them(d.x); them(d.y); them(d.dmg || 0); }
      for (const o of G.hu) { them(o.k); them(o.t); }
      return h.toString(16);
    };
  });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(`${BASE}index.html?notut=1&mode=coop&deck=${C.d1}&deck2=${C.d2}&wave=${C.wave}&fill=1&auto=1&net=0&ios=1&seed=777&af=tide&mana=99999${process.env.Q ? '&' + process.env.Q : ''}`, { waitUntil: 'load' });
  for (let i = 0; i < 400; i++) { const ok = await p.evaluate(() => { window.__buoc(2); return typeof G !== 'undefined' && G.ban && G.ban.length > 0 && !(typeof TAI !== 'undefined' && (TAI.cho || TAI.doi)); }); if (ok && i > 20) break; await p.waitForTimeout(40); }
  await p.evaluate((C) => {
    ketThuc = () => { }; try { VT.dong(); } catch (e) { } G.dung = false;
    window.__gr = window.__mb(999); Math.random = window.__gr; G.uid = 100000;
    G.ban.forEach((B) => { B.tim = 1e9; B.mana = 99999; B.mv.id = 'tide'; B.mv.gia = 1; for (let o = 0; o < 15; o++) { if (B.i === 1 && C.u2 && o >= C.u2) { B.t[o] = null; continue; } const id = B.i === 0 && C.b1 ? C.b1[o] : B.deck[o % 5]; B.lv[id] = 5; B.t[o] = sinhU(taoU(B, id, C.b1 && B.i === 0 ? 1 + (o % 6) : C.sao + (o % 2), o)); } });
    G.quai.length = 0; G.dan.length = 0; G.hu.length = 0; G.hang.length = 0; G.t = 0; G.tWave = 0; G.cho = 1.2; G.wave = C.wave - 1; G.uid = 200000; G.laTrum = false; G.dotTu = 0; G._lt = null; G.bay.length = 0;
    for (const B of G.ban) { B.chm = []; B._rl = {}; B.tdN = 0; B.aiT = 0.8; B.mv.cd = 0; }
    try { Object.defineProperty(TAI, 'doi', { get: () => false, set() { }, configurable: true }); } catch (e) { }
    Math.random = window.__mb(555); window.__f = 0; window.__bu = 0; window.__vt = 500000; REN.t = 100; if (typeof VX !== 'undefined') VX.t = 100;
    window.__b = 0; const lite = () => JSON.stringify([G.t, G.uid, G.ban.map(B => [B.mana, B.mv.cd, B.t.map(T => T && [T.id, T.sao, T.cd, T.nap, T.goc, T.uid])]), G.quai.map(E => [E.uid, E.hp, E.s]), G.dan.length, G.hu.length]);
    const c0 = capNhat; capNhat = function (dt) { const r = Math.random; Math.random = window.__gr;
      if (window.__soat && window.__sau) { const s = lite(); if (s !== window.__sau && !window.__lech) { const a = JSON.parse(window.__sau), b = JSON.parse(s); window.__lech = 'bước ' + window.__b + ': ' + JSON.stringify(a).slice(0, 0) + (() => { for (let i = 0; i < a.length; i++) if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) { if (i === 2) for (let j = 0; j < 2; j++) for (let k = 0; k < 15; k++) if (JSON.stringify(a[2][j][2][k]) !== JSON.stringify(b[2][j][2][k])) return 'ụ ' + j + '/' + k + ' ' + JSON.stringify(a[2][j][2][k]) + ' → ' + JSON.stringify(b[2][j][2][k]); return 'mục ' + i + ' ' + JSON.stringify(a[i]).slice(0, 200) + ' → ' + JSON.stringify(b[i]).slice(0, 200); } })(); } }
      try { if (++window.__b % 6 === 0) window.__giu(C); return c0(dt); } finally { Math.random = r; if (window.__soat) window.__sau = lite(); } };
    if (window.__khongVe) { REN.ve = () => { }; UI.capNhat = () => { }; FX.capNhat = () => { }; }
  }, C);
  if (process.env.KHONGVE) await p.evaluate(() => { REN.ve = () => { }; UI.capNhat = () => { }; });
  if (process.env.DUMP0) fs.writeFileSync(process.env.DUMP0, await p.evaluate(() => { const seen = new WeakSet(); return JSON.stringify({ G: Object.fromEntries(Object.keys(G).filter(k => !['roster', 'rosterMap'].includes(k)).map(k => [k, G[k]])) }, (k, v) => { if (typeof v === 'function') return undefined; if (v && typeof v === 'object') { if (seen.has(v)) return '~'; seen.add(v); if (v.nodeType) return 'DOM'; } return v; }, 1); }));
  if (process.env.SOAT) await p.evaluate(() => { window.__soat = 1; });
  if (process.env.JS) await p.evaluate(process.env.JS);
  const moc = (process.env.HASH || '').split(',').filter(Boolean).map(Number), bam = {};
  let f = 0; const t0 = Date.now();
  if (process.env.KHONGVE) { // mô phỏng thuần: chạy MỘT mạch (không nhường cho setTimeout / tải ảnh chen giữa) → tất định tuyệt đối
    const r = await p.evaluate(([n, C, moc]) => { const kq = {}; for (let i = 1; i <= n; i++) { window.__buoc(1, C); if (moc.includes(i)) kq[i] = window.__bam() + ' t=' + G.t.toFixed(3) + ' q=' + G.quai.length + ' d=' + G.dan.length + ' hu=' + G.hu.length; } return kq; }, [KHUNG, C, moc]);
    Object.assign(bam, r); f = KHUNG;
  }
  while (f < KHUNG) {
    const tiep = Math.min(KHUNG, ...moc.filter(m => m > f), f + 30);
    await p.evaluate(([n, C]) => window.__buoc(n, C), [tiep - f, C]); f = tiep;
    if (moc.includes(f)) bam[f] = await p.evaluate(() => window.__bam() + ' t=' + G.t.toFixed(3) + ' q=' + G.quai.length + ' d=' + G.dan.length + ' hu=' + G.hu.length + ' u=' + G.ban.map(B => B.t.filter(Boolean).map(T => T.id.slice(0, 2) + T.sao).join('')).join('/'));
    await p.waitForTimeout(process.env.KHONGVE ? 1 : 15); // cho ảnh tải / setTimeout chạy giữa các cụm khung
  }
  if (process.env.DBG) console.log(await p.evaluate(() => JSON.stringify({ dung: G.dung, cho: !!TAI.cho, doi: !!TAI.doi, raf: window.__raf.length, f: window.__f, vt: window.__vt, kt: G.ketThuc, gcho: G.cho, loi: window.__loi })));
  if (process.env.DUMP) fs.writeFileSync(process.env.DUMP, await p.evaluate(() => JSON.stringify({ bam: window.__bam(), t: G.t, tw: G.tWave, hang: G.hang.length, uid: G.uid, them: G.ban.map(B => B.t.map(T => T && ['lc', 'sting', 'dem', 'diem', 'tich', 'stack', 'gd', 'dang', 'huong'].map(k => T[k]))), tim: G.ban.map(B => B.tim), ban: G.ban.map(B => ({ mana: B.mana, gia: B.gia, cd: B.mv.cd, giet: B.dem.giet, lv: B.lv, t: B.t.map(T => T && { id: T.id, sao: T.sao, cd: T.cd, nap: T.nap, goc: T.goc, uid: T.uid, st: T.st, buf: T.buf, banLan: T.banLan }) })), quai: G.quai.map(E => ({ id: E.id, uid: E.uid, hp: E.hp, s: E.s, p: E.p, cham: E.cham, doc: E.doc, chet: E.chet })), dan: G.dan.map(d => [d.x, d.y, d.dmg]), hu: G.hu.map(o => [o.k, o.t]) }, null, 1)));
  if (process.env.KV) console.log('KV', JSON.stringify(await p.evaluate(() => window.__kv)));
  if (process.env.SOAT) console.log('LỆCH NGOÀI BƯỚC:', await p.evaluate(() => window.__lech || 'không'));
  if (process.env.HUK) console.log('HU', await p.evaluate(() => { const m = {}; for (const o of G.hu) m[o.k] = (m[o.k] || 0) + 1; return JSON.stringify(m) + ' fx:' + JSON.stringify(Object.fromEntries(Object.keys(FX).filter(k => Array.isArray(FX[k])).map(k => [k, FX[k].length]))) + ' vx:' + (VX.ds ? VX.ds.length : 0); }));
  const kq = { canh, nhan, khung: KHUNG, giay: ((Date.now() - t0) / 1000).toFixed(1), bam, loi: await p.evaluate(() => window.__loi || ''), errs: errs.slice(0, 3) };
  if (process.env.GLTT) kq.gl = await p.evaluate(() => typeof GLR === 'undefined' ? null : GLR.thongTin());
  if (process.env.DEM) kq.dem = await p.evaluate(() => {
    // ĐẾM LỆNH VẼ 1 KHUNG ở đúng trạng thái này (chỉ số độc lập máy): theo nhóm (quái / ụ / laser / đạn / hiệu ứng / thanh máu / sự kiện / khác) —
    //   anh = số drawImage 2D, px = điểm ảnh đích của chúng (triệu), dacBiet = drawImage kèm filter / bóng / kiểu hoà màu khác source-over|lighter,
    //   vec = lệnh không-ảnh (fill, stroke, chữ, clip, putImageData…) kèm tên; gl = { lenh (draw call), o (ảnh), px } của lớp WebGL nếu bật.
    const P = CanvasRenderingContext2D.prototype, goc = {}, kq = {}, lop = [];
    let nhom = 'khac';
    const N = (k) => kq[k] || (kq[k] = { anh: 0, px: 0, dacBiet: 0, vec: 0, loai: {} });
    const boc = (o, ten, nh) => { const f = o && o[ten]; if (typeof f !== 'function') return; o[ten] = function () { const cu = nhom; nhom = nh; try { return f.apply(this, arguments); } finally { nhom = cu; } }; lop.push(() => { o[ten] = f; }); };
    boc(REN, 'veQuai', 'quai'); boc(REN, 'veO', 'u'); boc(REN, 'veLaser', 'laser'); boc(REN, 'veDan', 'dan'); boc(REN, 'veFx', 'hieuung'); boc(PX, 'thanh', 'thanhmau'); boc(REN, 'thanhAnh', 'thanhmau');
    boc(VX, 'veDs', 'sukien'); boc(REN, 'veChu', 'chu'); boc(REN, 'gopLop', 'goplop'); if (typeof CHMU !== 'undefined') boc(CHMU, 'veLuoi', 'luoi');
    for (const k in HU) if (HU[k] && HU[k].ve) boc(HU[k], 've', 'hieuung');
    goc.drawImage = P.drawImage;
    const dI = function (im, a1, a2, a3, a4, a5, a6, a7, a8) {
      const n = arguments.length, g = N(nhom); let dw, dh; if (n >= 9) { dw = a7; dh = a8; } else if (n >= 5) { dw = a3; dh = a4; } else { dw = im.width; dh = im.height; }
      const m = P.getTransform.call(this); g.anh++; g.px += Math.abs(dw * dh * (m.a * m.d - m.b * m.c));
      if ((this.filter && this.filter !== 'none') || this.shadowBlur > 0 || (this.globalCompositeOperation !== 'source-over' && this.globalCompositeOperation !== 'lighter')) g.dacBiet++;
      return goc.drawImage.apply(this, arguments);
    };
    P.drawImage = dI;
    // lớp hiệu ứng (REN._lopX) có drawImage riêng gọi thẳng bản gốc → đếm ở đó bằng cách bọc lại
    const lx = REN._lopX; let lxGoc = null;
    if (lx && Object.prototype.hasOwnProperty.call(lx, 'drawImage')) { lxGoc = lx.drawImage; lx.drawImage = function (im, a1, a2, a3, a4, a5, a6, a7, a8) { const n = arguments.length, g = N(nhom); let dw, dh; if (n >= 9) { dw = a7; dh = a8; } else if (n >= 5) { dw = a3; dh = a4; } else { dw = im.width; dh = im.height; } const m = P.getTransform.call(this); g.anh++; g.px += Math.abs(dw * dh * (m.a * m.d - m.b * m.c)); if ((this.filter && this.filter !== 'none') || this.shadowBlur > 0 || (this.globalCompositeOperation !== 'source-over' && this.globalCompositeOperation !== 'lighter')) g.dacBiet++; return lxGoc.apply(this, arguments); }; }
    const VEC = ['fill', 'stroke', 'fillRect', 'strokeRect', 'fillText', 'strokeText', 'clip', 'putImageData', 'getImageData'];
    const lxV = {};
    for (const f of VEC) { goc[f] = P[f]; P[f] = function () { const g = N(nhom); g.vec++; g.loai[f] = (g.loai[f] || 0) + 1; return goc[f].apply(this, arguments); };
      if (lx && Object.prototype.hasOwnProperty.call(lx, f)) { const h = lxV[f] = lx[f]; lx[f] = function () { const g = N(nhom); g.vec++; g.loai[f] = (g.loai[f] || 0) + 1; return h.apply(this, arguments); }; } }
    if (typeof GLR !== 'undefined') { GLR.demPx = true; GLR.thieu = {}; }
    REN.noiSuy(1); try { REN.ve0(); } finally { REN.traLai(); }
    P.drawImage = goc.drawImage; if (lxGoc) lx.drawImage = lxGoc; for (const f of VEC) { P[f] = goc[f]; if (lxV[f]) lx[f] = lxV[f]; } for (const f of lop) f();
    let anh = 0, px = 0, vec = 0; for (const k in kq) { anh += kq[k].anh; px += kq[k].px; vec += kq[k].vec; kq[k].px = +(kq[k].px / 1e6).toFixed(3); }
    const r = { tong: { anh, px: +(px / 1e6).toFixed(2), vec }, nhom: kq };
    if (typeof GLR !== 'undefined' && GLR.hien) { r.gl = { lenh: GLR.dem.lenh, o: GLR.dem.o, tai: GLR.dem.tai, px: +(GLR.dem.px / 1e6).toFixed(3), thieu: GLR.thieu }; GLR.demPx = false; }
    return r;
  });
  if (process.env.THUC) kq.thuc = await p.evaluate(([giay, C]) => new Promise((xong) => {
    // KHUNG HÌNH THỜI GIAN THỰC: rAF thật của trình duyệt, đồng hồ trận chạy theo thời gian thật; khoảng khung (ms) trung vị / p95 / p99 / max, số khung > 33 / 50 ms
    const raf = window.__rafGoc, now = window.__now, ds = [], ln = []; let t0 = now(), tr = t0, n = 0;
    const vong = () => {
      const t = now(), dt = t - tr; tr = t; if (++n > 30) ds.push(dt);
      window.__vt += Math.min(dt, 100); window.__f++;
      const cb = window.__raf; window.__raf = []; for (const f of cb) { try { f(window.__vt); } catch (e) { window.__loi = String(e && e.stack || e); } }
      if (typeof GLR !== 'undefined' && GLR.hien) ln.push(GLR.dem.lenh);
      if (t - t0 < giay * 1000) raf(vong);
      else { const a = ds.slice().sort((x, y) => x - y), q = (u) => +a[Math.min(a.length - 1, Math.floor(a.length * u))].toFixed(1);
        xong({ khung: a.length, tb: +(ds.reduce((s, v) => s + v, 0) / ds.length).toFixed(1), tv: q(0.5), p95: q(0.95), p99: q(0.99), max: +a[a.length - 1].toFixed(1), hon33: ds.filter(v => v > 33.4).length, hon50: ds.filter(v => v > 50).length, hon100: ds.filter(v => v > 100).length,
          lenhGL: ln.length ? +(ln.reduce((s, v) => s + v, 0) / ln.length).toFixed(1) : 0, lenhGLmax: ln.length ? Math.max(...ln) : 0 }); }
    };
    raf(vong);
  }), [+process.env.THUC, C]);
  if (process.env.BENCH) {
    const tn = [['goc', '']].concat((process.env.TN || '').split(';;').filter(Boolean).map(s => { const i = s.indexOf('='); return [s.slice(0, i), s.slice(i + 1)]; }));
    kq.bench = {};
    const do1 = (js) => p.evaluate(([n, js]) => { let hoan = null; if (js) hoan = (0, eval)(js);
        const x = REN.ctx, ts = []; for (let i = 0; i < n + 2; i++) { const t0 = window.__now(); REN.noiSuy(1); try { REN.ve0(); } finally { REN.traLai(); } x.getImageData(0, 0, 1, 1); if (typeof GLR !== 'undefined' && GLR.hien) { GLR.gl.finish(); GLR.gl.readPixels(0, 0, 1, 1, GLR.gl.RGBA, GLR.gl.UNSIGNED_BYTE, new Uint8Array(4)); } const t1 = window.__now(); if (i >= 2) ts.push(t1 - t0); }
        if (typeof hoan === 'function') hoan(); ts.sort((a, b) => a - b); return ts[ts.length >> 1]; }, [+process.env.BENCH, js]);
    await do1('');
    for (const [ten, js] of tn) {
      if (ten === 'goc') { const a = []; for (let i = 0; i < 3; i++) a.push(await do1('')); a.sort((x, y) => x - y); kq.bench.goc = +a[1].toFixed(2); continue; }
      const g1 = await do1(''), v = await do1(js), g2 = await do1('');
      kq.bench[ten] = +(kq.bench.goc - ((g1 + g2) / 2 - v)).toFixed(2); // quy về cùng gốc: gốc − (mức giảm đo cặp)
    }
  }
  console.log(JSON.stringify(kq, null, 1));
  if (process.env.SAUJS) await p.evaluate(process.env.SAUJS); // chạy JS ngay trước khi chụp (vd ẩn bớt lớp canvas để soi)
  if (process.env.SHOT) await p.screenshot({ path: `${OUT}/lai_${canh}_${nhan}.png` });
  if (process.env.GHI) { const fk = `${OUT}/${process.env.GHI}.json`; let cu = {}; try { cu = JSON.parse(fs.readFileSync(fk)); } catch (e) { } cu[canh] = Object.assign(cu[canh] || {}, kq); fs.writeFileSync(fk, JSON.stringify(cu, null, 1)); }
  await b.close();
})();
