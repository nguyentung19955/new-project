// TURRET MERGE — kiểm VFX P2 (chiêu lớn có hoạt ảnh thật): chụp chuỗi khung (báo trước → trúng → dư âm) mỗi ụ, iPhone 13 (390×844, DPR 3).
// Chạy (gốc repo): python3 -m http.server 8765 &  ·  NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-p2.js [ra]
//   → <ra>/raw/<cảnh>_NN.jpg (cắt quanh chiêu) + ket-qua.json; ghép dải: python3 tools/thap-kt-p2-ghep.py [ra]. CHI=overlord,cryo chỉ vài cảnh.
const fs = require('fs');
const { chromium, devices } = require('playwright');
const OUT = process.argv[2] || 'docs/demo-hop-tuong/tuvan/vfx-p2';
fs.mkdirSync(OUT + '/raw', { recursive: true });
const BASE = 'http://localhost:8765/thap/';
const CANH = [
  // ten, id, sao, mode, ban, n khung, bước (s), hành động (chuỗi JS chạy trong trang; có T, B, E0), tâm cắt ('T' ụ | 'E' quái đầu | 'hu:<k>')
  { ten: 'overlord', id: 'overlord', sao: 4, n: 34, buoc: 0.05, lam: 'T.nap = 0.9', tam: 'E' },
  { ten: 'overlord_pvp', id: 'overlord', sao: 4, mode: 'pvp', ban: 1, n: 26, buoc: 0.05, lam: 'T.nap = 0.93', tam: 'E' },
  { ten: 'blackhole', id: 'blackhole', sao: 4, n: 34, buoc: 0.11, lam: 'T.nap = 0.999', tam: 'hu:hoden' },
  { ten: 'blackhole_coop', id: 'blackhole', sao: 4, mode: 'coop', ban: 1, n: 20, buoc: 0.18, lam: 'T.nap = 0.999', tam: 'hu:hoden' },
  { ten: 'cryo', id: 'lophanung', sao: 5, n: 26, buoc: 0.045, lam: 'T.nap = 1; SKILLS.lophanung.chuDong(G, B, T)', tam: 'T', co: 300 },
  { ten: 'cryo_gon', id: 'lophanung', sao: 5, n: 20, buoc: 0.05, lam: 'T.nap = 1; SKILLS.lophanung.chuDong(G, B, T)', tam: 'T', co: 300, cg: { fx: 'gon', flash: true } },
  { ten: 'chronolock', id: 'khoathoigian', sao: 4, n: 30, buoc: 0.07, lam: 'if (!SKILLS.khoathoigian.khoa(G, B, T, 4)) throw new Error("khoa=false q=" + quaiTheoDau(B).length)', tam: 'hu:khoa', co: 160 },
  { ten: 'rewind', id: 'ngaithoigian', sao: 3, n: 28, buoc: 0.05, lam: 'T.nap = 1; SKILLS.ngaithoigian.chuDong(G, B, T)', tam: 'T' },
  { ten: 'evolver', id: 'tienhoa', sao: 3, n: 20, buoc: 0.1, lam: '', tam: 'T', co: 120 },
  { ten: 'orbital', id: 'orbital', sao: 3, n: 24, buoc: 0.08, lam: 'SKILLS.orbital.thucTinh(G, B)', tam: 'T', co: 200 },
  { ten: 'halo', id: 'haoquang', sao: 3, n: 30, buoc: 0.11, lam: 'T.nap = 1; SKILLS.haoquang.chuDong(G, B, T)', tam: 'T', co: 300 },
  { ten: 'genesis', id: 'khoisinh', sao: 3, n: 24, buoc: 0.05, lam: 'T.nap = 1; B.t[0] = null; B.t[4] = null; SKILLS.khoisinh.chuDong(G, B, T)', tam: 'T', co: 360 },
  { ten: 'herotile', id: 'xuonganh', sao: 3, n: 26, buoc: 0.06, lam: 'const a = sinhU(taoU(B, "xuonganh", 3, 6)); SKILLS.xuonganh.ghep(G, B, a, T, T)', tam: 'hu:vm1Fx', co: 220 },
  { ten: 'ember', id: 'lualien', sao: 3, n: 22, buoc: 0.04, lam: 'B.t[8] = sinhU(taoU(B, "lualien", 3, 8)); B.t[2] = sinhU(taoU(B, "lualien", 3, 2)); const a = sinhU(taoU(B, "lualien", 3, 6)); a.lc = 5; LUA_ROI.truyen(B, [[a, 6], [T, T.o]])', tam: 'T', co: 220 },
  { ten: 'copycat', id: 'saochep', sao: 3, n: 22, buoc: 0.04, lam: 'B.t[8] = sinhU(taoU(B, "canon", 3, 8)); SKILLS.saochep.ghepDB.lam(G, B, T, B.t[8])', tam: 'T', co: 200 },
];
(async () => {
  const b = await chromium.launch(), errs = [], kq = {};
  const CHI = process.env.CHI ? process.env.CHI.split(',') : null;
  for (const c of CANH) {
    if (CHI && !CHI.includes(c.ten)) continue;
    const p = await b.newPage({ ...devices['iPhone 13'] });
    p.on('pageerror', e => errs.push(c.ten + ' ' + e.message));
    if (c.cg) await p.addInitScript((s) => { try { localStorage.setItem('tm_camgiac', s); } catch (e) { } }, JSON.stringify(c.cg));
    const deck = c.id + ',canon,lualien,xuonganh,saochep';
    await p.goto(`${BASE}?mode=${c.mode || 'solo'}&deck=${deck}&deck2=${deck}&wave=6&fill=5&mana=99999&notut=1`, { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length && !TAI.cho, null, { timeout: 40000 });
    await p.waitForTimeout(4000);
    await p.evaluate(() => { P2.napBo(); for (const k in P2.M) REN.img(k); ['fx_dien', 'fx_bang_vo', 'hu_hoden', 'hu_khoa', 'sig_m01_swirl', 'tier_ring_vang', 'fx_cuuvi_dan', 'fx_orbital_thuc', 'evo_bom', 'fx_evo_xit'].forEach(t => REN.img(t)); });
    await p.waitForTimeout(1500);
    // STANDIN=1: thử đường vẽ tờ 16 khung khi chưa có ảnh P2 (mượn fx_evo_xit — CHỈ để kiểm code, không xuất bản)
    if (process.env.STANDIN) await p.evaluate(() => { const a = REN.img('fx_evo_xit'); if (!a) return; for (const t of Object.values(P2.TO)) { P2.M[t] = [16, 256, 256, 1]; REN.anh[t] = { _cv: a, complete: true, naturalWidth: a.width, naturalHeight: a.height }; } });
    const r = await p.evaluate(({ c }) => {
      const B = G.ban[c.ban || 0], p0 = G.duong.find(q => q.ban === B.i) || G.duong[0]; for (const X of G.ban) { X.tim = 1e9; X.mana = 1e6; } G.dung = true;
      G.quai.length = 0; G.hang.length = 0; G.hu = G.hu.filter(o => o.k === 'sigDuoi'); FX.reset(); if (typeof SIG !== 'undefined') SIG.ds.length = 0; G.cho = 0; G.tWave = 3;
      for (let i = 0; i < B.t.length; i++) B.t[i] = null;
      const T = sinhU(taoU(B, c.id, c.sao, 7)); B.t[7] = T;
      for (const [o, id2] of [[5, 'canon'], [9, 'canon'], [11, 'canon']]) B.t[o] = sinhU(taoU(B, id2, 2, o));
      if (c.id === 'orbital') B.t[6] = sinhU(taoU(B, 'orbital', 3, 6));
      for (let i = 0; i < 10; i++) { const E = sinhQuai(i === 5 ? 'khong_lo' : 'bo', c.ban || 0, p0.len * (0.3 + i * 0.035), 400); E.vao = 1; [E.x, E.y, E.goc] = viTri(p0, E.s); }
      window._T = T; window._B = B; REN.ve(0.016, 1);
      return { che: G.che, nBan: G.ban.length };
    }, { c });
    const cast = await p.evaluate(({ c }) => { const T = window._T, B = window._B; for (let i = 0; i < 6; i++) { chupTruoc(); capNhat(BUOC); } const E0 = quaiDau(B); try { (new Function('G', 'B', 'T', 'E0', c.lam))(G, B, T, E0); } catch (e) { return 'ERR ' + e.message; } return G.hu.map(o => o.k).join(','); }, { c });
    const khung = await p.evaluate(({ c }) => {
      const out = [], k = REN.s * REN.dpr, CO = (c.co || 260);
      let tam = null;
      for (let i = 0; i < c.n; i++) {
        let n = Math.round(c.buoc / BUOC); while (n--) { chupTruoc(); capNhat(BUOC); }
        REN.ve(c.buoc, 1);
        if (!tam || c.tam === 'E') {
          if (c.tam === 'T') tam = G.ban[window._T.ban].o[window._T.o];
          else if (c.tam === 'E') { const E = quaiDau(window._B); const h = G.hu.find(o => o.k === 'sam' || o.k === 'p2fx'); tam = h ? { x: h.x, y: h.y } : E ? { x: E.x, y: E.y } : tam; }
          else { const h = G.hu.find(o => o.k === c.tam.slice(3)); if (h) tam = { x: h.x, y: h.y }; }
        }
        const t = tam || { x: W / 2, y: H / 2 };
        const cv = document.createElement('canvas'); cv.width = cv.height = Math.round(CO * k / 2);
        cv.getContext('2d').drawImage(REN.cv, (t.x - CO / 2) * k, (t.y - CO / 2) * k, CO * k, CO * k, 0, 0, cv.width, cv.height);
        out.push([cv.toDataURL('image/jpeg', 0.85), G.hu.filter(o => /^(sam|hoden|gBaoLuoi|khoa|rewind|p2fx|vm1|gCot|gXem)/.test(o.k)).map(o => o.k + ':' + o.t.toFixed(2)).join(' ')]);
      }
      return out;
    }, { c });
    khung.forEach(([d], i) => fs.writeFileSync(`${OUT}/raw/${c.ten}_${String(i).padStart(2, '0')}.jpg`, Buffer.from(d.split(',')[1], 'base64')));
    kq[c.ten] = { r, cast, khung: khung.map(f => f[1]) };
    await p.close();
  }
  kq.errs = errs;
  fs.writeFileSync(OUT + '/raw/ket-qua.json', JSON.stringify(kq, null, 1));
  console.log(JSON.stringify({ errs, cast: Object.fromEntries(Object.entries(kq).filter(([k]) => k !== 'errs').map(([k, v]) => [k, v.cast])) }, null, 1));
  await b.close();
})();
