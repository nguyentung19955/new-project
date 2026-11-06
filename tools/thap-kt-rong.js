// TURRET MERGE — kiểm 2 ĐẦU RỒNG TỪ Ụ (06/11): Leviathan TIDAL BREATH (băng) + Wyrm Engine DRAGON DIVE (lửa) + nón lửa Wyrm theo khung.
// Đầu rồng trồi lên từ ô ụ → gầm → luồng (dải 16 khung) từ miệng tới đường → quét dọc đường → chìm lại. iPhone 13 (390×844, DPR 3).
// Cảnh: SOLO (ụ mình), CO-OP (ụ đồng đội), PVP (ụ đối thủ), REDUCE FLASH + EFFECTS gọn, Test range (trang hồ sơ ụ), demo Turret File.
// Chạy: python3 -m http.server 8765 (gốc repo) rồi node tools/thap-kt-rong.js [ra] → <ra>/raw/*.png + ket-qua.json; ghép: python3 tools/thap-kt-rong-ghep.py [ra]
const fs = require('fs');
const { chromium, devices } = require('playwright');
const OUT = process.argv[2] || 'docs/demo-hop-tuong/tuvan/rong';
fs.mkdirSync(OUT + '/raw', { recursive: true });
const BASE = 'http://localhost:8765/thap/';
(async () => {
  const b = await chromium.launch(), errs = [], kq = {};
  const moTrang = async (url, cg) => {
    const p = await b.newPage({ ...devices['iPhone 13'] });
    p.on('pageerror', e => errs.push(url + ' ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource|firebase/i.test(m.text())) errs.push(url + ' console ' + m.text()); });
    if (cg) await p.addInitScript((c) => { try { localStorage.setItem('tm_camgiac', c); } catch (e) { } }, cg);
    await p.goto(BASE + url, { waitUntil: 'load' });
    return p;
  };
  // 1 cảnh: id ụ, sao, bàn (0 = mình, 1 = đồng đội / đối thủ), chế độ, tên ra; nKhung khung × 40 ms
  const canh = async ({ ten, mode, id, sao, ban, cg, nKhung, non }) => {
    const deck = id + ',canon,tia,set,saochep';
    const p = await moTrang(`?mode=${mode}&deck=${deck}&deck2=${deck}&wave=6&fill=5&mana=99999&notut=1`, cg);
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length && !TAI.cho, null, { timeout: 30000 });
    await p.waitForTimeout(4500);
    await p.evaluate(() => { SIG._tNap = -9; SIG.nap(); ['fx_bang_trung', 'fx_leviathan_trung', 'fx_ronglua_trung', 'wyrm_rong', 'fx_wyrm_lua', 'lev_rong', 'fx_lev_bang', 'fx_ronglua_dan'].forEach(t => REN.img(t)); });
    await p.waitForFunction(() => ['wyrm_rong', 'fx_wyrm_lua', 'lev_rong', 'fx_lev_bang', 'fx_leviathan_trung', 'fx_ronglua_trung'].every(k => REN.img(k)) && Object.keys(SIG_META).filter(k => REN.anh[k]).every(k => REN.img(k)), null, { timeout: 20000 });
    const r = await p.evaluate(({ id, sao, ban, non }) => {
      const B = G.ban[ban], p0 = G.duong.find(q => q.ban === B.i) || G.duong[0]; for (const X of G.ban) { X.tim = 1e9; X.mana = 1e6; } G.dung = true;
      G.quai.length = 0; G.hang.length = 0; G.hu = G.hu.filter(o => o.k === 'truyNaVe' || o.k === 'sigDuoi'); FX.reset(); SIG.ds.length = 0; G.cho = 0; G.tWave = 3;
      for (let i = 0; i < B.t.length; i++) B.t[i] = null;
      const dat = (o, id2, s) => { const T = sinhU(taoU(B, id2, s, o)); B.t[o] = T; return T; };
      // nón thường: ụ ở ô gần đường nhất (nón tầm ~110 px); chiêu: ô giữa (7)
      let oU = 7, sGan = 0, dGan = 1e9;
      for (let o = 0; o < 15; o++) { if (!non && o !== 7) continue; const c = B.o[o]; for (let s = 0; s < p0.len; s += 4) { const [x, y] = viTri(p0, s), d = Math.hypot(x - c.x, y - c.y); if (d < dGan) { dGan = d; sGan = s; oU = o; } } }
      const T = dat(oU, id, sao); if (id === 'leviathan') T.vuc = 56;
      for (const [o, id2] of [[6, 'canon'], [8, 'tia'], [2, 'set'], [12, 'canon']]) if (o !== oU) dat(o, id2, 3);
      for (let i = 0; i < 9; i++) { const E = sinhQuai(i === 4 ? 'khong_lo' : 'bo', ban, non ? sGan + (i - 4) * 8 : p0.len * (0.28 + i * 0.05), 60); E.vao = 1; [E.x, E.y, E.goc] = viTri(p0, E.s); }
      window._T = T; window._B = B; REN.ve(0.016, 1);
      return { che: G.che, nBan: G.ban.length, dGan: Math.round(dGan) };
    }, { id, sao, ban, non });
    await p.waitForTimeout(300);
    let kqC = { r };
    if (non) { // nón lửa thường: chạy mô phỏng thật để ụ tự phun (khung bắt lửa → chảy → tàn)
      kqC.khung = await p.evaluate(() => { const out = []; for (let i = 0; i < 28; i++) { let n = Math.round(0.04 / BUOC); while (n--) { if (i >= 18) { G.quai.length = 0; G.hang.length = 0; } chupTruoc(); capNhat(BUOC); } REN.ve(0.04, 1); out.push([REN.cv.toDataURL('image/png'), (_T.phun || 0).toFixed(2)]); } return out; });
    } else {
      kqC.cast = await p.evaluate(({ id }) => { const T = window._T, B = window._B; T.nap = 1; T.napDay = 0; for (let i = 0; i < 3; i++) { chupTruoc(); capNhat(BUOC); } return [SKILLS[id].chuDong(G, B, T), G.hu.map(o => o.k).join(',')]; }, { id });
      await p.evaluate(() => SIG.cap(0));
      kqC.khung = await p.evaluate((n) => { const out = []; for (let i = 0; i < n; i++) { let k = Math.round(0.04 / BUOC); while (k--) { chupTruoc(); capNhat(BUOC); } REN.ve(0.04, 1); out.push([REN.cv.toDataURL('image/png'), SIG.ds.filter(m => m.k === 'tho' || m.k === 'rong').map(m => m.k + ':' + m.t.toFixed(2) + (m.tHet != null ? '/het' : '')).join('+')]); } return out; }, nKhung || 62);
      kqC.hpQuai = await p.evaluate(() => G.quai.filter(E => !E.chet).length);
    }
    kqC.khung.forEach(([d], i) => fs.writeFileSync(`${OUT}/raw/${ten}_${String(i).padStart(2, '0')}.png`, Buffer.from(d.split(',')[1], 'base64')));
    kqC.khung = kqC.khung.map(f => f[1]);
    await p.close();
    return kqC;
  };
  const CANH = [
    { ten: 'lev_solo', mode: 'solo', id: 'leviathan', sao: 4, ban: 0 },
    { ten: 'wyrm_solo', mode: 'solo', id: 'ronglua', sao: 3, ban: 0 },
    { ten: 'wyrm_non', mode: 'solo', id: 'ronglua', sao: 3, ban: 0, non: true },
    { ten: 'wyrm_non5', mode: 'solo', id: 'ronglua', sao: 5, ban: 0, non: true },
    { ten: 'lev_coop', mode: 'coop', id: 'leviathan', sao: 4, ban: 1, nKhung: 40 },
    { ten: 'wyrm_pvp', mode: 'pvp', id: 'ronglua', sao: 3, ban: 1, nKhung: 40 },
    { ten: 'wyrm_gon', mode: 'solo', id: 'ronglua', sao: 3, ban: 0, cg: JSON.stringify({ fx: 'gon', flash: true }), nKhung: 40 },
  ];
  const CHI = process.env.CHI ? process.env.CHI.split(',') : null; // CHI=wyrm_non,lev_solo — chỉ chạy vài cảnh
  for (const c of CANH) if (!CHI || CHI.includes(c.ten)) kq[c.ten] = await canh(c);
  if (CHI && !CHI.includes('test')) { kq.errs = errs; console.log(JSON.stringify({ errs, cast: CANH.filter(c => kq[c.ten]).map(c => kq[c.ten].cast || kq[c.ten].khung.slice(0, 24).join(' ')) }, null, 1)); await b.close(); return; }
  // Test range (trang hồ sơ ụ): chụp vài khung khi khoảnh khắc chạy
  for (const id of ['leviathan', 'ronglua']) {
    const q = await moTrang(`index.html?preview=${id}&star=4&dpr=3&notut=1`);
    await q.waitForFunction(() => typeof SIG !== 'undefined' && G.ban && G.ban.length, null, { timeout: 30000 }).catch(() => { });
    const t0 = Date.now(); let n = 0;
    while (Date.now() - t0 < 26000 && n < 4) { const co = await q.evaluate(() => SIG.ds.some(m => (m.k === 'tho' || m.k === 'rong') && m.t > 0.25)).catch(() => false); if (co) { await q.screenshot({ path: `${OUT}/raw/test_${id}_${n}.png` }); n++; await q.waitForTimeout(220); } else await q.waitForTimeout(80); }
    kq['test_' + id] = n;
    await q.close();
  }
  kq.errs = errs;
  fs.writeFileSync(OUT + '/raw/ket-qua.json', JSON.stringify(kq, null, 1));
  console.log(JSON.stringify({ errs, cast: CANH.map(c => kq[c.ten] && (kq[c.ten].cast || kq[c.ten].khung.join(' '))), test: [kq.test_leviathan, kq.test_ronglua] }, null, 1));
  await b.close();
})();
