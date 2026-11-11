// TURRET MERGE — so HÌNH từng họ hiệu ứng đã chuyển sang GPU (KE-HOACH.md mục 13, phiên W4) với đúng bản dựng CPU cũ của nó, TRONG CÙNG 1 khung GL:
//   mỗi ca vẽ 2 lần cạnh nhau trên nền đặc — trái = đường GPU (ảnh ảo kiểu tô 4 / 5 'color', mặt nạ matNa, dải dựng trên GPU GLR.dungG, quạt GLR.quat),
//   phải = canvas THẬT dựng bằng hàm dựng CPU cũ (c._dungLai — đúng phép canvas 2D) rồi tải lên như ảnh thường → khác nhau chỉ còn do công thức shader / lọc.
//   In mỗi ca: số điểm ảnh lệch > 24 / > 60 mức, lệch trung bình, lệch sắc độ trung bình (°) ở điểm đủ đậm; lưu ảnh từng trang vào OUT.
// Chạy (gốc repo): python3 -m http.server 8765 &   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-gl-hieuung.js <nhãn> "<query thêm>"
//   BASE=http://localhost:8765/thap/ · OUT=thư-mục · KHUNG=240 (khung trận trước khi so) · D1 / D2 = 2 bộ bài (mặc định có Rồng Máy + ụ hỗ trợ) · DPR=3
const { chromium } = require('playwright');
const fs = require('fs');
const [nhan = 'hu', them = 'gl=1'] = process.argv.slice(2);
const BASE = process.env.BASE || 'http://localhost:' + (process.env.PORT || 8765) + '/thap/', OUT = process.env.OUT || '.', KHUNG = +(process.env.KHUNG || 240);
const D1 = process.env.D1 || 'ronglua,lualien,leviathan,overlord,nhatthuc', D2 = process.env.D2 || 'lophanung,orbital,wallgen,vungdoc,drone';
(async () => {
  const b = await chromium.launch({ args: ['--enable-gpu-rasterization', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: +(process.env.DPR || 3), isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => {
    const mb = (a) => function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    Math.random = mb(12345); window.__vt = 1000; performance.now = () => window.__vt; Date.now = () => 1.7e12 + window.__vt;
    window.__raf = []; window.requestAnimationFrame = (f) => { window.__raf.push(f); return window.__raf.length; }; window.cancelAnimationFrame = () => { };
    window.__buoc = (n) => { for (let i = 0; i < n; i++) { window.__vt += 1000 / 60; const cb = window.__raf; window.__raf = []; for (const f of cb) { try { f(window.__vt); } catch (e) { window.__loi = String(e && e.stack || e); } } } };
  });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(`${BASE}index.html?notut=1&mode=coop&deck=${D1}&deck2=${D2}&wave=25&speed=1&fill=1&auto=1&net=0&seed=777&mana=99999&${them}`, { waitUntil: 'load' });
  for (let i = 0; i < 400; i++) { const ok = await p.evaluate(() => { window.__buoc(2); return typeof G !== 'undefined' && G.ban && G.ban.length > 0 && !(typeof TAI !== 'undefined' && (TAI.cho || TAI.doi)); }); if (ok && i > 20) break; await p.waitForTimeout(40); }
  await p.evaluate(() => { try { clearTimeout(VT._h); VT.dong(); } catch (e) { } G.dung = false; ketThuc = () => { }; });
  for (let f = 0; f < KHUNG; f += 30) { await p.evaluate(() => window.__buoc(30)); await p.waitForTimeout(10); }
  const kq = await p.evaluate(async () => {
    if (!GLR.aoBat()) return { loi: 'ảnh ảo không bật: ' + JSON.stringify(GLR.thongTin().aoLyDo) };
    for (const B of G.ban) B.tim = 1e9; // (trận vẫn chạy để khung nào cũng được vẽ; mọi ca vẽ đè lên 1 nền đặc nên trạng thái trận không ảnh hưởng)
    const cpu = (v) => { const c = document.createElement('canvas'); c.width = v.width; c.height = v.height; if (v._dungLai(c) === false) return null; return c; };
    const nen = REN.toMauDac('#20242c'), X0 = () => GLR.x, W = GLR.cv.width, H = GLR.cv.height, NUA = Math.floor(W / 2) - 6;
    const ca = []; // { ten, w, h, gl(X, x, y), cpu(X, x, y) }
    const anh = (ten, v, sx) => { if (!v) return; const w = Math.min(NUA - 4, v.width - (sx || 0)), h = v.height; let c2 = null; ca.push({ ten, w, h, gl: (X, x, y) => X.drawImage(v, sx || 0, 0, w, h, x, y, w, h), cpu: (X, x, y) => { c2 = c2 || cpu(v); if (c2) X.drawImage(c2, sx || 0, 0, w, h, x, y, w, h); } }); };
    // 1) hoà 'color' — REN.toMau theo màu ụ hỗ trợ (≥ 6 ụ khác nhau), HU.toMau trên ảnh gốc
    const mauU = {}; for (const id of ['radar', 'chimang', 'lanhgia', 'tuthan', 'khien', 'taylo', 'hasao', 'cauvong', 'lophanung', 'mana']) if (SUP[id]) mauU[id] = SUP[id];
    for (const id in mauU) { const S = mauU[id]; anh('toMau sup_khung ' + id + ' ' + S.mau, REN.toMau('sup_khung', S.mau)); anh('toMau sup_ring ' + id, REN.toMau('sup_ring', S.mau)); anh('toMau ' + S.link + ' ' + id, REN.toMau(S.link, S.mau)); }
    for (const m of ['#ff4b3e', '#6fe0ff', '#c77dff', '#4bffb0', '#ffd23f', '#ffffff', '#202020']) { anh('fx_link ' + m, REN.toMau('fx_link', m)); anh('fx_evolve ' + m, VX.toMau(REN.img('fx_evolve'), m)); anh('fx_awaken ' + m, VX.toMau(REN.img('fx_awaken'), m), 0); }
    if (typeof BVX !== 'undefined' && BVX.tenVong) for (const k of ['max', 'dmg', 'toc', 'crit']) { const t = BVX.tenVong(k), c = t && REN.img(t); if (c && c._ao) anh('vong buff ' + k, c); } // vòng buff (buffvfx.js) = phủ màu kiểu 1
    // 2) mặt nạ matNa (+ hoà 'color' trên dải đã che)
    const mn1 = VX.matNa('fx_summon', 0.52, 0.66), mn2 = VX.matNa('fx_starup', 0.6, 0.76);
    anh('matNa fx_summon', mn1); anh('matNa fx_starup', mn2);
    for (const m of ['#cfe8ff', '#ffd23f', '#b04bff', '#ff4b3e']) anh('toMau(matNa fx_summon) ' + m, VX.toMau(mn1, m));
    // 3) hoà 'color' trên bản TRẮNG của đầu ụ (kiểu 5)
    for (const B of G.ban) for (const id of B.deck.slice(0, 3)) { const tr = REN.co(id + '_nong', 60, 'trang'); if (tr && tr._ao) anh('toMau(trang ' + id + ')', VX.toMau(tr, '#7fe0ff')); }
    // 4) dải dựng trên GPU: vệt lửa Rồng Máy (8 dải, so 2 dải + tàn than) + dải nổ / chớp nòng camgiac của bộ bài
    const rd = typeof VXM !== 'undefined' && VXM.rongDai && VXM.rongDai(); if (rd) for (const i of [0, 3, 6, 7]) { anh('rong dai[' + i + '] trai', rd[i], 0); anh('rong dai[' + i + '] phai', rd[i], rd[i].width - (NUA - 4)); }
    if (typeof CG !== 'undefined' && CG.K3) for (const B of G.ban) for (const id of B.deck) for (const k of ['trung', 'no']) { const t = 'fx_' + id + '_' + k; if (typeof FXU !== 'undefined' && FXU.co(t) && REN.img(t)) { CG.K3._khung = -1; const s = CG.K3.dai(t, k); if (s && s._veG) { anh('camgiac ' + t + ' trai', s, 0); if (s.width > NUA) anh('camgiac ' + t + ' phai', s, s.width - (NUA - 4)); } } }
    // 5) cung PX.cung: quạt GPU ↔ ảnh cung nướng sẵn (đường 2D cũ, gọi qua ngữ cảnh bọc không có cờ laGL)
    const boc = (X) => ({ get globalAlpha() { return X.globalAlpha; }, set globalAlpha(v) { X.globalAlpha = v; }, drawImage() { return X.drawImage.apply(X, arguments); } });
    const kk = REN.s * REN.dpr, cung = (ten, r, a0, a1, ng, mau, im) => ca.push({ ten, w: Math.ceil(r * 2.6 * kk), h: Math.ceil(r * 2.6 * kk),
      gl: (X, x, y) => { X.save(); X.translate(x + r * 1.3 * kk, y + r * 1.3 * kk); X.scale(kk, kk); PX.cung(X, 0, 0, r, a0, a1, ng, 2, mau, 1, im && im()); X.restore(); },
      cpu: (X, x, y) => { X.save(); X.translate(x + r * 1.3 * kk, y + r * 1.3 * kk); X.scale(kk, kk); PX.cung(boc(X), 0, 0, r, a0, a1, ng, 2, mau, 1, im && im()); X.restore(); } });
    for (const [p0, r] of [[0.07, 22], [0.25, 22], [0.4, 30], [0.62, 30], [0.83, 38], [0.97, 38]]) cung('cung hoi ' + p0, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p0, false, PX.HOI_MAU + '~', () => PX.anhHoi(PX.HOI_MAU));
    cung('cung nguoc', 30, 0.4, 2.2, true, '#ffb43a'); cung('cung xuoi vang', 30, 1.0, 3.9, false, '#ffd23f'); cung('cung nho', 12, -1, 1.3, false, '#6fe0ff');
    // ---- vẽ từng trang, đọc điểm ảnh ngay sau khung ----
    const trang = []; let tr = { ds: [], y: 6 };
    for (const c of ca) { if (tr.y + c.h + 6 > H) { trang.push(tr); tr = { ds: [], y: 6 }; } c.y = tr.y; tr.y += c.h + 6; tr.ds.push(c); } if (tr.ds.length) trang.push(tr);
    const xong0 = GLR.xong.bind(GLR); let ve = null;
    GLR.xong = function () { if (this.dangVe && ve) { const X = X0(); X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; try { ve(X); } catch (e) { window.__loi = String(e && e.stack || e); } X.restore(); } return xong0(); };
    const ra = [], hinh = [], doc = document.createElement('canvas'); doc.width = W; doc.height = H; const dx = doc.getContext('2d', { willReadFrequently: true });
    const sac = (r, g, b) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b); if (mx - mn < 24) return -1; const q = mx === r ? ((g - b) / (mx - mn)) % 6 : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4; return (q * 60 + 360) % 360; };
    for (const T of trang) {
      ve = (X) => { X.drawImage(nen, 0, 0, W, H); for (const c of T.ds) { c.gl(X, 4, c.y); c.cpu(X, NUA + 10, c.y); } };
      for (let i = 0; i < 40; i++) { window.__buoc(1); if (i % 10 === 9) await new Promise(r => setTimeout(r, 5)); } // đủ khung cho ngân sách tải + giải mã nền
      window.__buoc(1); dx.clearRect(0, 0, W, H); dx.drawImage(GLR.cv, 0, 0); hinh.push(doc.toDataURL('image/png'));
      for (const c of T.ds) {
        const a = dx.getImageData(4, c.y, c.w, c.h).data, q = dx.getImageData(NUA + 10, c.y, c.w, c.h).data; let n24 = 0, n60 = 0, tong = 0, ve1 = 0, sN = 0, sT = 0;
        for (let i = 0; i < a.length; i += 4) { const d = Math.max(Math.abs(a[i] - q[i]), Math.abs(a[i + 1] - q[i + 1]), Math.abs(a[i + 2] - q[i + 2])); tong += d; if (d > 24) n24++; if (d > 60) n60++;
          if (Math.abs(q[i] - 32) + Math.abs(q[i + 1] - 36) + Math.abs(q[i + 2] - 44) > 90) { ve1++; const s1 = sac(a[i], a[i + 1], a[i + 2]), s2 = sac(q[i], q[i + 1], q[i + 2]); if (s1 >= 0 && s2 >= 0) { const e = Math.abs(s1 - s2); sT += Math.min(e, 360 - e); sN++; } } }
        ra.push({ ten: c.ten, co: c.w + 'x' + c.h, hinh: ve1, n24, n60, tb: +(tong / (a.length / 4)).toFixed(2), sac: sN ? +(sT / sN).toFixed(2) : null });
      }
    }
    ve = null; GLR.xong = xong0;
    return { ra, hinh, bn: GLR.bn, loi: window.__loi || '' };
  });
  if (kq.hinh) { kq.hinh.forEach((d, i) => fs.writeFileSync(`${OUT}/${nhan}_${i}.png`, Buffer.from(d.split(',')[1], 'base64'))); kq.anh = kq.hinh.map((d, i) => `${OUT}/${nhan}_${i}.png`); delete kq.hinh; }
  kq.errs = errs.slice(0, 5);
  if (kq.ra) { for (const r of kq.ra) console.log((r.n60 > Math.max(40, r.hinh * 0.004) || (r.sac != null && r.sac > 6) ? '✗ ' : '✓ ') + JSON.stringify(r).replace(/"/g, '')); delete kq.ra; }
  console.log(JSON.stringify(kq));
  await b.close();
})();
