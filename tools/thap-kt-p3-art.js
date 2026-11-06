// TURRET MERGE — VFX P3 tờ ChatGPT (assets/p3_<ụ>.png, tools/thap-cat-p3.py): kiểm MỖI ụ trong 20 ụ có tờ CHẠY tờ đó trong trận thật
// (báo → nổ → tan), mọi chế độ + Turret File (?preview=<ụ>), EFFECTS Minimal + REDUCE FLASH vẫn dùng tờ (rút thời gian / mờ loé).
// Cảnh: iPhone 13 (DPR 3), ụ ở ô sát đường, 8 quái đứng yên máu vô hạn; mô phỏng 1/60 s + VẼ mỗi bước (như máy thật) → ghi dãy khung tờ p3 đã vẽ.
// Kích điều kiện bằng CHÍNH hàm trận: Wall Projector = SKILLS.wallgen.ghep (tường vàng), Nine-Tail SKILLS.cuuvi.xa (đủ 9 đuôi), Blizzard nạp 95 %, Eclipse ban đêm, Mystery Box còn 1,6 s,
// Reaper Pillar = VX.chem (giết ngay), Guillotine/ụ khác chưa nổ trúng sau 2,5 s → FXU.pop('fx_<ụ>_trung') (đúng lệnh trận gọi).
// Dải 8 khung (chọn theo khung tờ trải đều min→max) → <OUT>/<ụ>[_coop|_pvp|_gon].jpg.  Thoát mã 1 nếu ụ nào không chạy tờ / lỗi trang.
// Chạy (gốc repo): python3 -m http.server 8765 &  ·  NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-p3-art.js
//   OUT=thư mục (mặc định docs/demo-hop-tuong/tuvan/vfx-p3/strips-art) · CHI=canon,set · MODE=solo|coop|pvp|preview · GON=1 (Minimal + Reduce Flash)
'use strict';
const fs = require('fs');
const { chromium, devices } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/vfx-p3/strips-art';
const MODE = process.env.MODE || 'solo', GON = !!process.env.GON;
const TAT = ['canon', 'wallgen', 'bomhen', 'min', 'ngoisao', 'soi', 'railgun', 'nemesis', 'nhatthuc', 'cuuvi', 'hydra', 'aten', 'baotuyet', 'mortar', 'hopbi', 'tuthan', 'maychem', 'set', 'vungdoc', 'bang'];
const IDS = process.env.CHI ? process.env.CHI.split(',') : TAT;
const DUOI = (MODE === 'solo' ? '' : '_' + MODE) + (GON ? '_gon' : '');
fs.mkdirSync(OUT, { recursive: true });

function DUNG() {
  if (!REN.__p3) { REN.__p3 = 1; const km = REN.khungMuot; REN.khungMuot = function (ctx, ten, f, x, y) { if (window.__ghi && typeof ten === 'string' && ten.startsWith('p3_')) window.__ghi.push({ ten, f: Math.floor(f), x, y }); return km.apply(this, arguments); }; }
  window.__ART = function (id, banI, DAI) {
    const B = G.ban[banI], p0 = G.duong.find(q => q.ban === B.i) || G.duong[0];
    for (const X of G.ban) { X.tim = 1e9; X.mana = 1e6; } G.dung = true;
    G.quai.length = 0; G.hang.length = 0; G.hu.length = 0; FX.reset(); if (typeof SIG !== 'undefined') SIG.ds.length = 0; G.cho = 0; G.tWave = 3; G.t = 100;
    for (const X of G.ban) for (let i = 0; i < X.t.length; i++) X.t[i] = null; // bàn khác trống: hồ FX.anim không bị ụ bàn kia đẩy ra
    let OU = 7, dmin = 1e9; B.o.forEach((c, i) => { for (let s = 80; s < p0.len - 80; s += 6) { const [x, y] = viTri(p0, s), d = Math.hypot(x - c.x, y - c.y); if (d < dmin) { dmin = d; OU = i; } } });
    const sao = 4, T = sinhU(taoU(B, id, sao, OU)); B.t[OU] = T;
    const c7 = B.o[OU]; let nk = 0;
    // Reaper Pillar = hỗ trợ: ụ kề bắn thật (canon) — còn lại: 2 Mana Core (không bắn)
    B.o.forEach((c, i) => { if (i !== OU && nk < 2 && Math.hypot(c.x - c7.x, c.y - c7.y) < Math.max(B.cw, B.ch) * 1.2) { B.t[i] = sinhU(taoU(B, id === 'tuthan' ? 'canon' : 'mana', 1, i)); nk++; } });
    let s0 = 0, dm = 1e9; for (let s = 80; s < p0.len - 80; s += 4) { const [x, y] = viTri(p0, s), d = Math.hypot(x - c7.x, y - c7.y); if (d < dm) { dm = d; s0 = s; } }
    for (let i = 0; i < 8; i++) { const E = sinhQuai('bo', banI, s0 + (i - 3.5) * 20, 60); E.vao = 1; E.max = E.hp = 1e12; E.d = Object.assign({}, E.d, { v: 0 }); [E.x, E.y, E.goc] = viTri(p0, E.s); }
    // điều kiện ra tờ (hàm trận)
    if (id === 'baotuyet') T.nap = 0.95;
    if (id === 'nhatthuc') { T.dem = true; T.doiT = 30; }
    if (id === 'hopbi') T.tuoi = SKILLS.hopbi.can(T) - 1.6; // 1,6 s trước khi mở (nạp ≥ 85 %: rung trong tờ → bật nắp)
    const ghi = window.__ghi = [], dt = 1 / 60, k = REN.s * REN.dpr, CO = ['wallgen', 'nhatthuc', 'baotuyet'].includes(id) ? 260 : 190;
    const anh = [], cv0 = document.createElement('canvas'); let tam = null, ep = '', t = 0;
    while (t < DAI) {
      if (id === 'wallgen' && t >= 0.2 && !ep) { ep = 'ghep'; SKILLS.wallgen.ghep(G, B, T, T); }
      if (id === 'cuuvi' && t >= 0.2 && !ep) { ep = 'xa'; SKILLS.cuuvi.xa(T); }
      if (id === 'tuthan' && t >= 0.4 && !ep) { ep = 'chem'; const E = G.quai[3]; E.daChem = false; VX.chem(E); }
      if (id === 'min' && t >= 2.5 && !ep) { const o = G.hu.find(h => h.k === 'min' && h.t > 0.3); if (o) { ep = 'buoc'; const E = G.quai[3]; o.x = E.x; o.y = E.y; } } // mìn dời xuống chân quái (quái thử đứng yên) → HU.min.cap tự nổ
      if (P3.TRUNG[id] && id !== 'tuthan' && t >= 2.5 && !ghi.some(q => q.ten === 'p3_' + id) && !ep) { ep = 'pop'; const E = G.quai[3]; FXU.pop('fx_' + id + '_trung', E.x, E.y, 44, 0.3); }
      for (const E of G.quai) { E.hp = E.max; E.chet = false; }
      const n0 = ghi.length;
      if (typeof chupTruoc === 'function') chupTruoc(); capNhat(dt); FX.capNhat(dt); t += dt;
      REN.ve(dt, 1);
      if (ghi.length > n0) {
        const g = ghi.filter((q, i) => i >= n0 && q.ten === 'p3_' + id);
        if (g.length && !tam) { const q = g[0]; tam = Math.abs(q.x) < 60 && Math.abs(q.y) < 60 ? { x: c7.x, y: c7.y } : { x: q.x, y: q.y }; }
        if (g.length && anh.length < 700) {
          const c = document.createElement('canvas'), w = Math.round(CO * k / 3); c.width = c.height = w;
          c.getContext('2d').drawImage(REN.cv, (tam.x - CO / 2) * k, (tam.y - CO / 2) * k, CO * k, CO * k, 0, 0, w, w);
          anh.push({ c, f: Math.max(...g.map(q => q.f)), t });
        }
      }
      if (ghi.length && t > 0.5 && id !== 'bomhen' && id !== 'wallgen' && anh.length && t - anh[anh.length - 1].t > 1.2) break;
    }
    const cua = ghi.filter(q => q.ten === 'p3_' + id).map(q => q.f), kq = { ep, n: cua.length, min: cua.length ? Math.min(...cua) : -1, max: cua.length ? Math.max(...cua) : -1, khac: new Set(cua).size, dau: cua.slice(0, 4), lac: ghi.filter(q => q.ten !== 'p3_' + id).length };
    // dải 8 khung: khung tờ trải đều min → max theo thời gian
    if (anh.length) {
      const w = anh[0].c.width, out = document.createElement('canvas'); out.width = w * 8; out.height = w; const o = out.getContext('2d');
      let j = 0; for (let i = 0; i < 8; i++) { const v = kq.min + (kq.max - kq.min) * i / 7; while (j < anh.length - 1 && anh[j].f < v) j++; o.drawImage(anh[j].c, i * w, 0); }
      kq.anh = out.toDataURL('image/jpeg', 0.8);
    }
    return kq;
  };
}

(async () => {
  const b = await chromium.launch(), errs = [], hong = [];
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  if (GON) await ctx.addInitScript(() => { try { localStorage.setItem('tm_camgiac', JSON.stringify({ fx: 'gon', flash: true })); } catch (e) { } });
  if (MODE === 'preview') {
    // Turret File → Test range: iframe ?preview=<ụ> chạy CHÍNH code trận; đợi clip lặp và đếm khung tờ p3 đã vẽ
    for (const id of IDS) {
      const p = await ctx.newPage(); p.on('pageerror', e => errs.push(id + ': ' + e.message));
      await p.addInitScript(() => { window.__ghi = []; });
      await p.goto(BASE + '?preview=' + id, { waitUntil: 'load' });
      await p.waitForFunction(() => typeof REN !== 'undefined' && typeof P3 !== 'undefined', null, { timeout: 40000 });
      await p.evaluate(() => { const km = REN.khungMuot; REN.khungMuot = function (ctx, ten, f) { if (typeof ten === 'string' && ten.startsWith('p3_')) window.__ghi.push(Math.floor(f)); return km.apply(this, arguments); }; });
      await p.waitForTimeout(17000);
      const r = await p.evaluate((id) => ({ co: !!P3.co(id), n: window.__ghi.length, khac: new Set(window.__ghi).size }), id);
      console.log(id.padEnd(9), 'preview  tờ', r.co ? 'đã tải' : 'CHƯA', '· khung vẽ', r.n, '· khác', r.khac);
      if (!r.co || !r.n) hong.push(id + ' preview: tờ chưa chạy');
      await p.close();
    }
  } else {
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto(BASE + '?mode=' + MODE + '&deck=canon,tia,set,lien,mana&deck2=canon,tia,set,lien,mana&wave=6&fill=5&mana=99999&notut=1', { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length && !TAI.cho, null, { timeout: 40000 });
    await p.waitForTimeout(3000);
    await p.evaluate(DUNG);
    await p.evaluate(async (ids) => { const ds = []; for (const id of ids) { ds.push('p3_' + id); for (const s of ['dan', 'trung', 'no', 'hieu', 'vang']) if (FXU.co('fx_' + id + '_' + s)) ds.push('fx_' + id + '_' + s); } ds.push('fx_cham_trang'); await REN.napTruoc(ds); }, IDS);
    const banI = MODE === 'solo' ? 0 : 1;
    for (const id of IDS) {
      await p.evaluate(([id, banI]) => window.__ART(id, banI, 3), [id, banI]); // làm ấm (dựng dải / giải mã)
      const r = await p.evaluate(([id, banI]) => window.__ART(id, banI, id === 'bomhen' || id === 'wallgen' ? 9 : 6), [id, banI]);
      if (r.anh) fs.writeFileSync(`${OUT}/${id}${DUOI}.jpg`, Buffer.from(r.anh.split(',')[1], 'base64'));
      // một lần (nổ trúng / bom / mìn / hộp / tường / nhật thực / bão): phải đi từ khung đầu tới khung tan; lặp (vũng độc, hồ ly): ≥ 4 khung khác nhau
      const lap = id === 'vungdoc' || id === 'cuuvi';
      const ok = r.n > 0 && (lap ? r.khac >= 4 : r.min <= 5 && r.max >= 13 && r.khac >= 6);
      console.log((ok ? '✓ ' : '✗ ') + id.padEnd(9), MODE + (GON ? '+gon' : ''), 'khung', r.min + '→' + r.max, '· khác', r.khac, '· lượt vẽ', r.n, r.ep ? '· kích: ' + r.ep : '', '· đầu', r.dau.join(','));
      if (!ok) hong.push(id + ' ' + MODE);
    }
    await p.close();
  }
  console.log('lỗi trang:', errs.length, errs.slice(0, 5));
  if (errs.length) hong.push('lỗi trang');
  await b.close();
  console.log(hong.length ? 'ĐỎ: ' + hong.join(' | ') : 'XANH');
  process.exit(hong.length ? 1 : 0);
})();
