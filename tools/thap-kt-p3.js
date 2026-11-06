// TURRET MERGE — VFX P3: kiểm toán + dải khung hiệu ứng đánh/chiêu của các ụ NGOÀI P2 và rồng (docs/demo-hop-tuong/tuvan/vfx-p3/).
// Mỗi ụ: cảnh không đầu iPhone 13 (DPR 3) — ụ ở ô sát đường, 2 ô kề là Mana Core (không bắn, để ụ hỗ trợ có chỗ buff), 8 quái đứng yên
// (máu vô hạn). Pha 'atk' = 1★ đánh thường; pha 'sk' = 4★ (+ kỹ năng chủ động nếu có / nạp đầy). Ghi lại: số "ảnh tĩnh bật" (FX.anim mot),
// dải khung (FX.anim thường, SIG, fx7, p2fx…), loại G.hu; chụp DẢI 8 khung quanh quái đầu (hoặc ụ, nếu ụ hỗ trợ) → <OUT>/<id>_<pha>.jpg
// Chạy (gốc repo): python3 -m http.server 8765 &  ·  NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-p3.js
//   OUT=thư mục (mặc định docs/demo-hop-tuong/tuvan/vfx-p3/strips) · CHI=canon,set · KHONG_ANH=1 (chỉ số liệu) · BASE=url · CG='{"fx":"gon"}'
//   MODE=coop|pvp (ụ đặt ở bàn 1 = bàn đồng đội / đối thủ) → kiểm đồng bộ chế độ.
'use strict';
const fs = require('fs');
const { chromium, devices } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/vfx-p3/strips';
const CHI = process.env.CHI ? process.env.CHI.split(',') : null;
const MODE = process.env.MODE || 'solo';
const BO = new Set(['overlord', 'blackhole', 'lophanung', 'khoathoigian', 'ngaithoigian', 'tienhoa', 'orbital', 'haoquang', 'xuonganh', 'khoisinh', 'lualien', 'saochep', 'leviathan', 'ronglua']);
fs.mkdirSync(OUT, { recursive: true });

function DUNG() {
  window.__P3 = function (id, sao, chuDong, banI, chup) {
    const B = G.ban[banI], p0 = G.duong.find(q => q.ban === B.i) || G.duong[0];
    for (const X of G.ban) { X.tim = 1e9; X.mana = 1e6; } G.dung = true;
    G.quai.length = 0; G.hang.length = 0; G.hu.length = 0; FX.reset(); if (typeof SIG !== 'undefined') SIG.ds.length = 0; G.cho = 0; G.tWave = 3; G.t = 100;
    for (let i = 0; i < B.t.length; i++) B.t[i] = null;
    // ô sát đường nhất
    let OU = 7, dmin = 1e9; B.o.forEach((c, i) => { for (let s = 80; s < p0.len - 80; s += 6) { const [x, y] = viTri(p0, s), d = Math.hypot(x - c.x, y - c.y); if (d < dmin) { dmin = d; OU = i; } } });
    const T = sinhU(taoU(B, id, sao, OU)); B.t[OU] = T; if (!chuDong) T.nap = Math.max(T.nap || 0, 0.9);
    const c7 = B.o[OU]; let nk = 0; B.o.forEach((c, i) => { if (i !== OU && nk < 2 && Math.hypot(c.x - c7.x, c.y - c7.y) < Math.max(B.cw, B.ch) * 1.2) { B.t[i] = sinhU(taoU(B, 'mana', 1, i)); nk++; } });
    let s0 = 0, dm = 1e9; for (let s = 80; s < p0.len - 80; s += 4) { const [x, y] = viTri(p0, s), d = Math.hypot(x - c7.x, y - c7.y); if (d < dm) { dm = d; s0 = s; } }
    for (let i = 0; i < 8; i++) { const E = sinhQuai('bo', banI, s0 + (i - 3.5) * 20, 60); E.vao = 1; E.max = E.hp = 1e12; E.d = Object.assign({}, E.d, { v: 0 }); [E.x, E.y, E.goc] = viTri(p0, E.s); }
    const tk = { pop: 0, nong: 0, dai: {}, hu: {}, sig: {} }, seen = new WeakSet(), out = [];
    const ghi = () => {
      for (const a of FX.anim) { if (seen.has(a)) continue; seen.add(a); if (a.mot === 'trung') tk.pop++; else if (a.mot === 'no') tk.nong++; else tk.dai[a.ten] = (tk.dai[a.ten] || 0) + 1; }
      for (const o of G.hu) { if (seen.has(o)) continue; seen.add(o); tk.hu[o.k] = (tk.hu[o.k] || 0) + 1; }
      if (typeof SIG !== 'undefined') for (const s of SIG.ds) { if (seen.has(s)) continue; seen.add(s); const n = s.k || s.ten || '?'; tk.sig[n] = (tk.sig[n] || 0) + 1; }
    };
    let t = 0, daCD = false, tChup = -1, nChup = 0;
    const DAI = 4.2, k = REN.s * REN.dpr, CO = 190;
    const ho = SKILLS[id] && SKILLS[id].ht; // ụ hỗ trợ: cắt quanh ụ
    while (t < DAI) {
      if (chuDong && !daCD && t >= 0.3) { daCD = true; T.nap = 1; T.napDay = 0; try { SKILLS[id].chuDong(G, B, T); } catch (e) { } }
      for (const E of G.quai) { E.hp = E.max; E.chet = false; }
      chupTruoc(); capNhat(BUOC); FX.capNhat(BUOC); t += BUOC; ghi();
      if (chup && tChup < 0 && (tk.pop + Object.keys(tk.dai).length + Object.keys(tk.hu).length > 0 || t > 0.9) && t > 0.25) tChup = t;
      if (chup && tChup >= 0 && nChup < 8 && t >= tChup + nChup * 0.07) {
        REN.ve(0.016, 1); nChup++;
        const E = G.quai[3] || G.quai[0], tam = ho || !E ? c7 : { x: E.x * 0.65 + c7.x * 0.35, y: E.y * 0.65 + c7.y * 0.35 };
        const cv = window.__dai || (window.__dai = document.createElement('canvas')), w = Math.round(CO * k / 3);
        if (nChup === 1) { cv.width = w * 8; cv.height = w; }
        cv.getContext('2d').drawImage(REN.cv, (tam.x - CO / 2) * k, (tam.y - CO / 2) * k, CO * k, CO * k, (nChup - 1) * w, 0, w, w);
      }
    }
    if (!chup) REN.ve(0.016, 1);
    return { tk, anh: chup && nChup ? window.__dai.toDataURL('image/jpeg', 0.72) : null };
  };
}

(async () => {
  const b = await chromium.launch(), errs = [];
  const p = await b.newPage({ ...devices['iPhone 13'] });
  p.on('pageerror', e => errs.push(e.message));
  if (process.env.CG) await p.addInitScript((c) => { try { localStorage.setItem('tm_camgiac', c); } catch (e) { } }, process.env.CG);
  await p.goto(BASE + '?mode=' + MODE + '&deck=canon,tia,set,lien,mana&deck2=canon,tia,set,lien,mana&wave=6&fill=5&mana=99999&notut=1', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length && !TAI.cho, null, { timeout: 40000 });
  await p.waitForTimeout(4000);
  await p.evaluate(DUNG);
  const ids = (await p.evaluate(() => G.roster.map(u => u.id))).filter(id => !BO.has(id) && (!CHI || CHI.includes(id)));
  // nạp trước ảnh của mọi ụ
  await p.evaluate((ids) => { for (const id of ids) for (const s of ['dan', 'trung', 'no', 'hieu', 'dan2', 'dan3', 'trung3', 'dacbiet', 'tia', 'sk', 'vang', 'thuc']) if (typeof FXU !== 'undefined' && FXU.co('fx_' + id + '_' + s)) REN.img('fx_' + id + '_' + s); REN.img('fx_cham_trang'); }, ids);
  await p.waitForTimeout(3000);
  const banI = MODE === 'solo' ? 0 : 1, KQ = {};
  for (const id of ids) {
    const cd = await p.evaluate((id) => !!SKILLS[id].chuDong, id);
    for (const [pha, sao, chuDong] of [['atk', 1, false], ['sk', 4, cd]]) {
      // chạy 2 lần: lần 1 làm ấm (dựng dải / giải mã ảnh), lần 2 chụp
      await p.evaluate(([id, sao, chuDong, banI]) => window.__P3(id, sao, chuDong, banI, false), [id, sao, chuDong, banI]);
      const r = await p.evaluate(([id, sao, chuDong, banI, chup]) => window.__P3(id, sao, chuDong, banI, chup), [id, sao, chuDong, banI, !process.env.KHONG_ANH]);
      if (r.anh) fs.writeFileSync(`${OUT}/${id}_${pha}${MODE !== 'solo' ? '_' + MODE : ''}.jpg`, Buffer.from(r.anh.split(',')[1], 'base64'));
      (KQ[id] = KQ[id] || {})[pha] = r.tk;
    }
    const a = KQ[id].atk, s = KQ[id].sk;
    console.log(id.padEnd(13), 'pop', String(a.pop).padStart(3), String(s.pop).padStart(3), 'nong', String(a.nong).padStart(3), '| dai', Object.keys(Object.assign({}, a.dai, s.dai)).join(',').slice(0, 60), '| hu', Object.keys(Object.assign({}, a.hu, s.hu)).join(','), '| sig', Object.keys(s.sig).join(','));
  }
  fs.writeFileSync(OUT + '/ket-qua' + (MODE !== 'solo' ? '-' + MODE : '') + '.json', JSON.stringify({ KQ, errs }, null, 1));
  console.log('loi trang:', errs.length, errs.slice(0, 5));
  await b.close();
})();
