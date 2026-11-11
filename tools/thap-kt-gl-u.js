// TURRET MERGE — Ô Ụ của bản WebGL: ảnh CÙNG trạng thái (bệ mọi bậc, huy hiệu 1★–7★, hoá đá, đóng băng, tấm đếm, đang KÉO, đang GHÉP) + đếm canvas tạo / texture tải trong lúc kéo–ghép.
// Dùng để so `?gl=1` ↔ `?gl=0` ↔ `?gl=1&gla=0` (KE-HOACH.md mục 13). Lái tất định như thap-kt-tai-gl.js (đồng hồ ảo + rAF do công cụ bơm) → 2 lần chạy ra cùng trạng thái.
// Chạy (gốc repo): python3 -m http.server 8765 &   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-gl-u.js <nhãn> "<query thêm, vd gl=1>"
//   BASE=http://localhost:8765/thap/ (hoặc PORT=8765) · OUT=thư-mục ảnh (mặc định .) · DPR=3 · JS="…" chạy trong trang sau khi dựng cảnh (vd giấu đầu ụ: JS="REN.veDauLop = () => { }")
// Cảnh (bàn mình, 15 ô): hàng 1 = Trắng 1★ · Xanh 2★ · Tím 3★ · Vàng 4★ · Đỏ 5★ — hàng 2 = Đỏ 6★ · Vàng 7★ · Trắng hoá đá · Xanh đóng băng · Leviathan (tấm đếm) —
//   hàng 3 = 2 ụ Đỏ 2★ giống nhau (kéo ô 10 → ô 11 rồi thả = ghép) · Khởi Sinh 3★ · Tím 7★ · trống. Không quái, không wave, bot đứng yên.
// Ảnh: <nhãn>_tinh.png (đứng yên) · _keo.png (đang kéo, bằng chính đường pointerdown / pointermove của game trên #cv) · _ghep1 / _ghep2 / _ghep3.png (hoạt ảnh ghép ~200 / 430 / 1100 ms).
// In JSON: ids, canvas có điểm ảnh tạo ra + texture tải từ canvas / Image trong 3 pha (đứng yên 60 khung · kéo · ghép) kèm khoá / nơi tạo, lỗi trang.
const { chromium } = require('playwright');
const [nhan = 'thu', them = 'gl=1'] = process.argv.slice(2);
const BASE = process.env.BASE || 'http://localhost:' + (process.env.PORT || 8765) + '/thap/', OUT = process.env.OUT || '.';
(async () => {
  const b = await chromium.launch({ args: ['--enable-gpu-rasterization', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: +(process.env.DPR || 3), isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => {
    const mb = (a) => function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    window.__mb = mb; Math.random = mb(12345);
    window.__vt = 1000; performance.now = () => window.__vt; Date.now = () => 1.7e12 + window.__vt;
    window.__raf = []; window.requestAnimationFrame = (f) => { window.__raf.push(f); return window.__raf.length; }; window.cancelAnimationFrame = () => { };
    window.__f = 0; window.__up = []; window.__cv = [];
    window.__buoc = (n) => { for (let i = 0; i < n; i++) { window.__vt += 1000 / 60; window.__f++; if (window.__moiKhung) window.__moiKhung(); const cb = window.__raf; window.__raf = []; for (const f of cb) { try { f(window.__vt); } catch (e) { window.__loi = String(e && e.stack || e); } } } };
    const goc = document.createElement.bind(document);
    document.createElement = function (ten, o) { const e = goc(ten, o); if (typeof ten === 'string' && ten.toLowerCase() === 'canvas') { e.__tao = String(new Error().stack).split('\n').slice(2, 5).map(s => s.trim().replace(/^at /, '').replace(/https?:\/\/[^/]+\/thap\/js\//, '').replace(/\?[^:]*/, '').replace(/:\d+\)?$/, '')).join('<'); e.__f = window.__f; window.__cv.push(e); } return e; };
    window.__moc = () => { const gl = typeof GLR !== 'undefined' && GLR.gl; if (!gl || gl.__boc) return; gl.__boc = 1;
      for (const f of ['texImage2D', 'texSubImage2D']) { const g = gl[f].bind(gl); gl[f] = function () { const im = arguments[arguments.length - 1];
        if (im && typeof im === 'object' && (im.tagName === 'CANVAS' || im.tagName === 'IMG')) window.__up.push([window.__f, im.tagName === 'IMG' ? 'anh' : 'cv', (im._khoa != null ? String(im._khoa) : '') + ' ' + (im.naturalWidth || im.width) + 'x' + (im.naturalHeight || im.height) + (im._glD || im._nhap ? ' D' : (im._glV | 0) ? ' B' : '') + (im.__tao ? ' [' + im.__tao + ']' : '')]);
        return g.apply(null, arguments); }; } };
    // pha [f0, f1]: canvas CÓ ĐIỂM ẢNH tạo trong pha (canvas ảo 0×0 không tính) + texture tải
    window.__pha = (f0) => { const cv = window.__cv.filter(c => c.__f > f0 && c.width > 0 && !c._tha && !c._ao), up = window.__up.filter(u => u[0] > f0), nh = (a) => { const m = {}; for (const k of a) m[k] = (m[k] || 0) + 1; return Object.entries(m).sort((x, y) => y[1] - x[1]).slice(0, 12).map(e => e[1] + '× ' + e[0]); };
      return { canvas: cv.length, noiTao: nh(cv.map(c => c.__tao + ' ' + c.width + 'x' + c.height)), taiCanvas: up.filter(u => u[1] === 'cv').length, taiAnh: up.filter(u => u[1] === 'anh').length, khoa: nh(up.map(u => u[1] + ' ' + u[2])) }; };
  });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(`${BASE}index.html?notut=1&mode=coop&deck=leviathan,khoisinh,cobac,bocap,sinhdoi&deck2=leviathan,ronglua,nemesis,khoisinh,vughep&wave=5&net=0&ios=1&seed=777&mana=99999&${them}`, { waitUntil: 'load' });
  for (let i = 0; i < 400; i++) { const ok = await p.evaluate(() => { window.__buoc(2); if (typeof GLR !== 'undefined' && GLR.gl) window.__moc(); return typeof G !== 'undefined' && G.ban && G.ban.length > 0 && !(typeof TAI !== 'undefined' && (TAI.cho || TAI.doi)); }); if (ok && i > 20) break; await p.waitForTimeout(40); }
  const chay = async (n) => { for (let f = 0; f < n;) { const k = Math.min(15, n - f); await p.evaluate((k) => window.__buoc(k), k); f += k; await p.waitForTimeout(25); } };
  const kq = { nhan, them };
  kq.ids = await p.evaluate(() => {
    ketThuc = () => { }; try { clearTimeout(VT._h); VT.dong(); } catch (e) { } G.dung = false;
    try { Object.defineProperty(TAI, 'doi', { get: () => false, set() { }, configurable: true }); } catch (e) { }
    const ids = {}; for (const id in G.rosterMap) { const r = G.rosterMap[id]; if (r && r.bac && !ids[r.bac] && REN.DE_RIENG[id] && !(typeof laGrow === 'function' && laGrow(id)) && !(SKILLS[id] && (SKILLS[id].veDau || SKILLS[id].deAnh)) && id !== 'canon') ids[r.bac] = id; }
    const B = G.ban[0], dat = (o, id, sao) => { B.lv[id] = B.lv[id] || 5; const T = sinhU(taoU(B, id, sao, o)); B.t[o] = T; return T; };
    Math.random = window.__mb(999);
    for (let o = 0; o < 15; o++) B.t[o] = null;
    dat(0, ids.trang, 1); dat(1, ids.xanh, 2); dat(2, ids.tim, 3); dat(3, ids.vang, 4); dat(4, ids.do, 5);
    dat(5, ids.do, 6); dat(6, ids.vang, 7); const da = dat(7, ids.trang, 3), bang = dat(8, ids.xanh, 2), lv = dat(9, 'leviathan', 4); lv.vuc = 120;
    dat(10, ids.do, 2); dat(11, ids.do, 2); dat(12, 'khoisinh', 3); dat(13, ids.tim, 7);
    G.quai.length = 0; G.dan.length = 0; G.hu.length = 0; G.hang.length = 0;
    window.__moiKhung = () => { G.cho = 99; for (const X of G.ban) { X.tim = 1e9; X.mana = 99999; X.aiT = 1e9; } da.st.da = 99; bang.st.bang = 99; };
    Math.random = window.__mb(555); window.__vt = 500000; window.__f = 0; G.t = 0; REN.t = 100; if (typeof VX !== 'undefined') VX.t = 100; // đồng hồ ảo về mốc cố định: hoạt ảnh theo thời gian cùng pha ở mọi lần chạy
    return ids;
  });
  if (process.env.JS) await p.evaluate(process.env.JS); // JS="REN.veDauLop = () => { }": giấu đầu ụ để nhìn rõ bệ + viền bậc
  for (let i = 0; i < 12; i++) { await chay(30); await p.waitForTimeout(120); } // cho ảnh của ụ ngoài bộ bài tải xong
  let f0 = await p.evaluate(() => window.__f); await chay(60);
  kq.tinh = await p.evaluate((f0) => window.__pha(f0), f0);
  await p.screenshot({ path: OUT + '/' + nhan + '_tinh.png' });
  // KÉO bằng đường của game: pointerdown ở ô 10, pointermove tới ô 11 (ngón tay: ụ nhấc lên trên ngón `lech`), giữ
  f0 = await p.evaluate(() => {
    const cv = document.querySelector('#cv'), r = cv.getBoundingClientRect(), B = G.ban[0], a = B.o[10], c = B.o[11], C = Math.min(B.cw, B.ch), lech = Math.round(C * 0.6);
    const ev = (k, x, y) => cv.dispatchEvent(new PointerEvent(k, { pointerId: 7, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: r.left + x / W * r.width, clientY: r.top + y / H * r.height }));
    window.__ev = ev; window.__dich = [c.x, c.y + lech];
    const f = window.__f; ev('pointerdown', a.x, a.y); window.__buoc(6);
    for (let i = 1; i <= 8; i++) { ev('pointermove', a.x + (c.x - a.x) * i / 8, a.y + (c.y + lech - a.y) * i / 8); window.__buoc(2); }
    return f;
  });
  await chay(20);
  kq.keoDang = await p.evaluate(() => !!(UI.keo && UI.keo.dang));
  await p.screenshot({ path: OUT + '/' + nhan + '_keo.png' });
  await chay(40);
  kq.keo = await p.evaluate((f0) => window.__pha(f0), f0);
  f0 = await p.evaluate(() => { const f = window.__f; window.__ev('pointerup', window.__dich[0], window.__dich[1]); return f; });
  await chay(12); await p.screenshot({ path: OUT + '/' + nhan + '_ghep1.png' });
  await chay(14); await p.screenshot({ path: OUT + '/' + nhan + '_ghep2.png' });
  await chay(40); await p.screenshot({ path: OUT + '/' + nhan + '_ghep3.png' });
  kq.ghep = await p.evaluate((f0) => Object.assign(window.__pha(f0), { o10: G.ban[0].t[10] ? G.ban[0].t[10].id : null, o11: G.ban[0].t[11] ? G.ban[0].t[11].id + G.ban[0].t[11].sao : null }), f0);
  kq.gl = await p.evaluate(() => typeof GLR === 'undefined' ? null : { bat: GLR.bat, hien: GLR.hien, ao: GLR.bat && GLR.aoBat ? GLR.aoBat() : false, thieu: GLR.thieu });
  kq.loi = await p.evaluate(() => window.__loi || ''); kq.errs = errs.slice(0, 5);
  console.log(JSON.stringify(kq, null, 1));
  await b.close();
})();
