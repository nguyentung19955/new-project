// TURRET MERGE — kiểm Leviathan (06/11): dải khung TIDAL BREATH mới (đầu rồng băng rơi từ trời → phun → bay lên) trong TRẬN SOLO
// + Test range (trang hồ sơ ụ) + cận cảnh tấm ABYSS ở 8 / 56 / 100 + vòng nuốt khi chọn ụ + dòng bảng xem nhanh EN/VI. iPhone 13 (390×844, DPR 3).
// Chạy: python3 -m http.server 8765 (gốc repo) rồi node tools/thap-kt-leviathan.js [ra]  → <ra>/raw_*.png + ket-qua.json (ghép: tools/thap-kt-leviathan-ghep.py)
const fs = require('fs');
const { chromium, devices } = require('playwright');
const OUT = process.argv[2] || 'docs/demo-hop-tuong/tuvan/leviathan';
fs.mkdirSync(OUT + '/raw', { recursive: true });
const BASE = 'http://localhost:8765/thap/';
(async () => {
  const b = await chromium.launch(), errs = [], kq = {};
  const moTrang = async (url, lang) => {
    const p = await b.newPage({ ...devices['iPhone 13'] });
    p.on('pageerror', e => errs.push(url + ' ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource|firebase/i.test(m.text())) errs.push(url + ' console ' + m.text()); });
    if (lang) await p.addInitScript((l) => { try { localStorage.setItem('tm_lang', l); localStorage.setItem('thap_lang', l); } catch (e) { } }, lang);
    await p.goto(BASE + url, { waitUntil: 'load' });
    return p;
  };
  const p = await moTrang('?mode=solo&deck=leviathan,saochep,canon,tia,set&wave=6&fill=5&mana=99999&notut=1');
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length && !TAI.cho, null, { timeout: 30000 });
  await p.waitForTimeout(4500); // màn giới thiệu trùm tự đóng
  await p.evaluate(() => { SIG._tNap = -9; SIG.nap(); ['fx_bang_trung', 'fx_leviathan_trung', 'fx_leviathan_hieu'].forEach(t => REN.img(t)); });
  await p.waitForFunction(() => Object.keys(SIG_META).filter(k => REN.anh[k]).every(k => REN.img(k)) && REN.img('fx_bang_trung') && REN.img('fx_leviathan_trung') && REN.img('fx_leviathan_hieu'), null, { timeout: 20000 });
  // dựng cảnh: Leviathan 4★ ô 7 + 9 quái trên đường, tung TIDAL BREATH
  const cat = async (ten, vung) => { const o = { path: OUT + '/raw/' + ten + '.png' }; if (vung) o.clip = vung; await p.screenshot(o); };
  await p.evaluate(() => {
    const B = G.ban[0], p0 = G.duong[0]; B.tim = 1e9; B.mana = 1e6; G.dung = true;
    G.quai.length = 0; G.hang.length = 0; G.hu = G.hu.filter(o => o.k === 'truyNaVe' || o.k === 'sigDuoi'); FX.reset(); SIG.ds.length = 0; G.cho = 0; G.tWave = 3;
    for (let i = 0; i < B.t.length; i++) B.t[i] = null;
    const dat = (o, id2, s) => { const T = sinhU(taoU(B, id2, s, o)); B.t[o] = T; return T; };
    const T = dat(7, 'leviathan', 4); T.vuc = 56; dat(3, 'leviathan', 3).vuc = 8; dat(11, 'leviathan', 5).vuc = 100;
    for (const [o, id2] of [[6, 'canon'], [8, 'tia'], [2, 'set'], [12, 'canon']]) dat(o, id2, 3);
    for (let i = 0; i < 9; i++) { const E = sinhQuai(i === 4 ? 'khong_lo' : 'bo', 0, p0.len * (0.28 + i * 0.05), 60); E.vao = 1; [E.x, E.y, E.goc] = viTri(p0, E.s); }
    window._T = T; REN.ve(0.016, 1);
  });
  await p.waitForTimeout(300);
  await p.evaluate(() => REN.ve(0.016, 1));
  // tấm ABYSS cận cảnh (3 ô: 8 / 56 / 100) — toạ độ CSS của ô
  const vungO = await p.evaluate(() => { const r = REN.cv.getBoundingClientRect(), B = G.ban[0], k = r.width / W; return [3, 7, 11].map(o => { const c = B.o[o]; return { x: r.left + (c.x - B.cw * 0.6) * k, y: r.top + (c.y - B.ch * 0.6) * k, width: B.cw * 1.2 * k, height: B.ch * 1.2 * k }; }); }).catch(async () => null);
  if (vungO) for (let i = 0; i < 3; i++) await cat('abyss_' + [8, 56, 100][i], vungO[i]);
  kq.tag = await p.evaluate(() => [3, 7, 11].map(o => JSON.stringify(DEMKN.lay(G.ban[0].t[o], G.ban[0]))));
  // dải khung TIDAL BREATH: 80 ms/khung, 30 khung (≈ 2.4 s: rơi → phun 1.4 s → bay lên)
  await p.evaluate(() => { const T = window._T, B = G.ban[0]; T.nap = 1; T.napDay = 0; for (let i = 0; i < 3; i++) { chupTruoc(); capNhat(BUOC); } window._r = [SKILLS.leviathan.chuDong(G, B, T), G.hu.map(o => o.k).join(',')]; });
  kq.cast = await p.evaluate(() => window._r);
  // chụp ngay trong trang (canvas → PNG) sau mỗi bước mô phỏng cố định: không lẫn vòng rAF
  await p.evaluate(() => SIG.cap(0)); // bắt khoảnh khắc ngay khung đầu
  kq.cv = await p.evaluate(() => { const r = REN.cv.getBoundingClientRect(); REN.cv.style.visibility = 'hidden'; return [r.left, r.top, r.width, r.height]; });
  await p.waitForTimeout(150); await p.screenshot({ path: OUT + '/raw/nen.png' }); await p.evaluate(() => { REN.cv.style.visibility = ''; });
  const fr = await p.evaluate(() => { const out = []; for (let i = 0; i < 60; i++) { let n = Math.round(0.04 / BUOC); while (n--) { chupTruoc(); capNhat(BUOC); } REN.ve(0.04, 1); out.push([REN.cv.toDataURL('image/png'), SIG.ds.map(m => m.k + ':' + m.t.toFixed(2)).join('+')]); } return out; });
  fr.forEach(([d, s], i) => { fs.writeFileSync(OUT + '/raw/tho_' + String(i).padStart(2, '0') + '.png', Buffer.from(d.split(',')[1], 'base64')); });
  kq.thoKhung = fr.map(f => f[1]);
  kq.thoDs = await p.evaluate(() => SIG.ds.map(m => m.k).join('+'));
  // chọn ụ → vòng nuốt + dòng xem nhanh
  await p.evaluate(() => { G.dung = false; const T = window._T; UI.moTT('leviathan', T); });
  await p.waitForTimeout(600);
  kq.kn_en = await p.evaluate(() => document.querySelector('#tt .tt-kn').textContent);
  await cat('chon_vong');
  await p.close();
  // Test range (trang hồ sơ ụ) — chụp vài khung khi khoảnh khắc chạy
  const q = await moTrang('index.html?preview=leviathan&star=4&dpr=3&notut=1');
  await q.waitForFunction(() => typeof SIG !== 'undefined' && G.ban && G.ban.length, null, { timeout: 30000 }).catch(() => { });
  const t0 = Date.now(); let n = 0;
  while (Date.now() - t0 < 26000 && n < 6) { const co = await q.evaluate(() => SIG.ds.some(m => m.k === 'tho')).catch(() => false); if (co) { await q.screenshot({ path: OUT + '/raw/test_' + n + '.png' }); n++; await q.waitForTimeout(260); } else await q.waitForTimeout(100); }
  kq.testKhung = n;
  await q.close();
  // VI: dòng xem nhanh
  const v = await moTrang('?mode=solo&deck=leviathan,canon,tia,set,lien&wave=6&fill=5&mana=99999&notut=1&lang=vi', 'vi');
  await v.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && !TAI.cho, null, { timeout: 30000 });
  await v.waitForTimeout(1200);
  kq.kn_vi = await v.evaluate(() => { const B = G.ban[0]; const T = sinhU(taoU(B, 'leviathan', 4, 7)); B.t[7] = T; T.vuc = 56; UI.moTT('leviathan', T); return new Promise(ok => setTimeout(() => ok([document.querySelector('#tt .tt-kn').textContent, NN.t(SKILLS.leviathan.mo(T))]), 700)); });
  await v.close();
  kq.errs = errs;
  fs.writeFileSync(OUT + '/raw/ket-qua.json', JSON.stringify(kq, null, 1));
  console.log(JSON.stringify(kq, null, 1));
  await b.close();
})();
