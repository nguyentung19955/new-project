// TURRET MERGE — rà soát animation THEO BẬC (docs/demo-hop-tuong/tuvan/anim-bac/RA-SOAT.md)
// Mỗi ụ 2 dải khung ở 390×844 (DPR 2): 'atk' = 1★ đánh thường (8 khung × 0,08 s sau phát trúng đầu),
// 'sk' = 5★ + chiêu/nạp đầy (10 khung × 0,14 s quanh SỰ KIỆN CHIÊU đầu tiên: T.nap tụt / T.sang bật / hiệu ứng sân dài ≥ 0,5 s / p2fx / SIG / lắc màn).
// Hai lượt mô phỏng giống hệt nhau: lượt 1 không vẽ để tìm thời điểm sự kiện, lượt 2 vẽ + chụp (có cả pha báo trước).
// Chạy (gốc repo): python3 -m http.server 8813 &  ·  NODE_PATH=/opt/npm-tools/node_modules node tools/thap-anim-bac.js
//   TE=id:giây (ép thời điểm sự kiện) · OUT=thư mục (mặc định /dev/shm/anim/s) · CHI=blackhole,overlord · PHA=atk|sk · BASE=url · Q=?diu=0 (thêm tham số URL)
'use strict';
const fs = require('fs');
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8813/thap/';
const OUT = process.env.OUT || '/dev/shm/anim/s';
const TE = Object.fromEntries((process.env.TE || '').split(',').filter(Boolean).map(x => [x.split(':')[0], +x.split(':')[1]])); // ép thời điểm sự kiện: TE=cobac:1.92
const CHI = process.env.CHI ? process.env.CHI.split(',') : null;
const PHA = process.env.PHA ? process.env.PHA.split(',') : ['atk', 'sk'];
fs.mkdirSync(OUT, { recursive: true });

function DUNG() {
  window.__AB = function (id, sao, chuDong, chup, tSuKien) {
    const B = G.ban[0], p0 = G.duong.find(q => q.ban === B.i) || G.duong[0];
    for (const X of G.ban) { X.tim = 1e9; X.mana = 1e6; } G.dung = true;
    G.quai.length = 0; G.hang.length = 0; G.hu.length = 0; FX.reset(); if (typeof VX !== 'undefined') { VX.ds.length = 0; VX.hens.length = 0; } if (typeof SIG !== 'undefined') SIG.ds.length = 0; G.cho = 0; G.tWave = 3; G.t = 100;
    for (let i = 0; i < B.t.length; i++) B.t[i] = null;
    let OU = 7, dmin = 1e9; B.o.forEach((c, i) => { const d = Math.abs(c.x - W / 2) - c.y * 3; if (d < dmin) { dmin = d; OU = i; } }); // ô hàng dưới, giữa → quái trên đoạn đường ĐÁY nằm ngang, hiệu ứng không bị cắt mép màn
    const T = sinhU(taoU(B, id, sao, OU)); B.t[OU] = T;
    const c7 = B.o[OU]; let nk = 0;
    B.o.forEach((c, i) => { if (i !== OU && nk < 2 && SKILLS[id].vai === 'ht' && Math.hypot(c.x - c7.x, c.y - c7.y) < Math.max(B.cw, B.ch) * 1.2) { B.t[i] = sinhU(taoU(B, 'bua', 1, i)); nk++; } });
    let s0 = 0, dm = 1e9; for (let s = 80; s < p0.len - 80; s += 4) { const [x, y] = viTri(p0, s), d = Math.hypot(x - c7.x, y - c7.y); if (d < dm) { dm = d; s0 = s; } }
    for (let i = 0; i < 8; i++) { const E = sinhQuai('bo', 0, s0 + (i - 3.5) * 20, 60); E.vao = 1; E.max = E.hp = 1e12; E.d = Object.assign({}, E.d, { v: 0 }); [E.x, E.y, E.goc] = viTri(p0, E.s); }
    if (chuDong) { if (T.nap != null) T.nap = Math.max(T.nap || 0, 0.97); if (T.bhT != null || id === 'blackhole') T.bhT = 0.97; }
    const seen = new WeakSet(); for (const o of G.hu) seen.add(o);
    let t = 0, daCD = false, tE = -1, tam = null, nap0 = T.nap || 0, sang0 = T.sang || 0, lac0 = FX.lacT || 0;
    const DAI = chup ? (tSuKien >= 0 ? tSuKien + 2.6 : 5.6) : 12, k = REN.s * REN.dpr;
    const DO = G.rosterMap[id] && G.rosterMap[id].bac === 'do', CO = chuDong ? (DO ? 320 : 230) : 150, N = chuDong ? 10 : 8, DT = chuDong ? (DO ? 0.24 : 0.14) : 0.08;
    let nChup = 0; const t0 = chuDong ? Math.max(0.05, tSuKien - 0.28) : -1;
    let dauTrung = -1;
    const cv = window.__dai || (window.__dai = document.createElement('canvas')); const w = Math.round(CO * k / 1.6), COT = chuDong ? 5 : 4, HANG = Math.ceil(N / COT);
    if (chup) { cv.width = w * COT + 4 * (COT - 1); cv.height = w * HANG + 4 * (HANG - 1); const x = cv.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, cv.width, cv.height); }
    const E3 = G.quai[3];
    const tk = { hat: 0, vong: 0, anim: 0, hu: {}, sig: 0, dsg: 0 }, daA = new WeakSet(); // độ phức tạp: đỉnh hạt / vòng, số dải nổ, loại hiệu ứng sân
    while (t < DAI) {
      if (chuDong && !daCD && t >= 0.3 && t < 7 && SKILLS[id].chuDong) { T.nap = 1; T.napDay = 0; let ok = false; try { ok = SKILLS[id].chuDong(G, B, T) !== false; } catch (e) { } if (ok) daCD = true; } // chiêu chưa đủ điều kiện (Chúa Tổ chưa có drone) → thử lại bước sau
      for (const E of G.quai) { E.hp = E.max; E.chet = false; }
      chupTruoc(); capNhat(BUOC); FX.capNhat(BUOC); t += BUOC;
      tk.hat = Math.max(tk.hat, FX.hat.length); tk.vong = Math.max(tk.vong, FX.vong.length); for (const a of FX.anim) if (!daA.has(a)) { daA.add(a); tk.anim++; }
      for (const o of G.hu) if (o.k !== 'sigDuoi') tk.hu[o.k] = 1; if (typeof SIG !== 'undefined') tk.sig = Math.max(tk.sig, SIG.ds.length);
      // dò sự kiện
      let moi = null;
      for (const o of G.hu) { if (o.k === 'cbQuay' && o.da && !o._abDa) { o._abDa = 1; if (!moi) moi = { x: null }; } if (seen.has(o)) continue; seen.add(o); if (!moi && (o.k === 'p2fx' || (o.song || 0) >= 0.5) && o.k !== 'ping') moi = o; }
      const napTut = nap0 > 0.9 && (T.nap || 0) < 0.4, sangBat = (T.sang || 0) > sang0 + 0.5;
      nap0 = T.nap || 0; sang0 = T.sang || 0;
      if (!chup && chuDong && tE < 0 && t > 0.25 && (moi || napTut || sangBat || (typeof SIG !== 'undefined' && SIG.ds.length) || (FX.lacT || 0) !== lac0)) {
        tE = t; if (moi && moi.x != null) tam = { x: moi.x, y: moi.y };
      }
      if (!chuDong && dauTrung < 0 && t > 1.4 && (FX.anim.length || G.hu.length || G.hang.length)) dauTrung = t;
      if (chup) {
        const tc = chuDong ? t0 + nChup * DT : (dauTrung >= 0 ? dauTrung + nChup * DT : 1e9);
        if (nChup < N && t >= tc) {
          REN.ve(0.016, 1); nChup++;
          let c = window.__abTam || (E3 ? { x: E3.x * 0.6 + c7.x * 0.4, y: E3.y * 0.6 + c7.y * 0.4 } : c7);
          c = { x: Math.max(CO / 2, Math.min(W - CO / 2, c.x)), y: Math.max(CO / 2, Math.min(H - CO / 2, c.y)) };
          const dx = ((nChup - 1) % COT) * (w + 4), dy = Math.floor((nChup - 1) / COT) * (w + 4), x2 = cv.getContext('2d');
          if (REN.nen.width > 2) { const kn = REN.nen.width / W; x2.drawImage(REN.nen, (c.x - CO / 2) * kn, (c.y - CO / 2) * kn, CO * kn, CO * kn, dx, dy, w, w); }
          x2.drawImage(REN.cv, (c.x - CO / 2) * k, (c.y - CO / 2) * k, CO * k, CO * k, dx, dy, w, w);
        }
      }
    }
    if (!chup) { window.__abTam = null; return { tE, tam, tk: Object.assign(tk, { hu: Object.keys(tk.hu) }) }; }
    return { anh: nChup ? cv.toDataURL('image/jpeg', 0.8) : null, n: nChup };
  };
}

(async () => {
  const b = await chromium.launch(), errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE + '?mode=solo&deck=canon,tia,set,lien,mana&wave=6&fill=5&mana=99999&notut=1' + (process.env.Q || ''), { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length && !TAI.cho, null, { timeout: 40000 });
  await p.waitForTimeout(4000);
  await p.evaluate(DUNG);
  const ids = (await p.evaluate(() => G.roster.map(u => u.id))).filter(id => !CHI || CHI.includes(id));
  await p.evaluate((ids) => { for (const id of ids) for (const s of ['dan', 'trung', 'no', 'hieu', 'dan2', 'dan3', 'trung3', 'dacbiet', 'tia', 'sk', 'vang', 'thuc']) if (typeof FXU !== 'undefined' && FXU.co && FXU.co('fx_' + id + '_' + s)) REN.img('fx_' + id + '_' + s); if (typeof P2 !== 'undefined') for (const k in P2.TO) REN.img(P2.TO[k]); }, ids);
  await p.waitForTimeout(3000);
  const KQ = {};
  for (const id of ids) {
    KQ[id] = {};
    for (const pha of PHA) {
      const sk = pha === 'sk', sao = sk ? 5 : 1;
      let tE = -1;
      if (sk) { const r = await p.evaluate(([id, sao]) => { const r = window.__AB(id, sao, true, false, -1); window.__abTam = r.tam; return r; }, [id, sao]); tE = TE[id] != null ? TE[id] : r.tE; KQ[id].tE = tE; KQ[id].sk = r.tk; }
      if (!sk) KQ[id].atk = (await p.evaluate(([id]) => window.__AB(id, 1, false, false, -1), [id])).tk;
      // lượt làm ấm (giải mã ảnh) rồi lượt chụp
      if (sk) await p.evaluate(([id, sao, tE]) => { const g = window.__abTam; window.__AB(id, sao, true, false, tE); window.__abTam = g; }, [id, sao, tE]);
      const r = await p.evaluate(([id, sao, sk, tE]) => { if (!sk) window.__abTam = null; return window.__AB(id, sao, sk, true, sk ? (tE >= 0 ? tE : 1.0) : -1); }, [id, sao, sk, tE]);
      if (r.anh) fs.writeFileSync(`${OUT}/${id}_${pha}.jpg`, Buffer.from(r.anh.split(',')[1], 'base64'));
    }
    console.log(id, KQ[id].tE != null ? 'tE=' + KQ[id].tE.toFixed(2) : '', await p.evaluate(() => typeof DSG !== 'undefined' && DSG.loi ? 'DSG LOI: ' + DSG.loi : ''));
  }
  fs.writeFileSync(OUT + '/ket-qua.json', JSON.stringify({ KQ, errs }, null, 1));
  console.log('loi trang:', errs.length, errs.slice(0, 5));
  await b.close();
})();
