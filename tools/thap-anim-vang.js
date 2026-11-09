// TURRET MERGE — chụp hiệu ứng ụ VÀNG / TÍM (chữ ký js/vangsig.js) theo KỊCH BẢN THẬT: đòn trúng (khung bám điểm trúng) + khoảnh khắc
// kỹ năng (ghép thật bằng ghep(), xung hỗ trợ có ụ Tấn công cùng sao kề, Hoà âm tăng, PHÁN QUYẾT sau 10 đòn…). 390×844, DPR 2.
// Mỗi ụ 1 dải: 6 khung "trúng" (0,06 s) + 8 khung "kỹ năng" (0,09 s). So trước/sau: Q='&vsig=0' (tắt chữ ký Vàng/Tím).
// Chạy (gốc repo): python3 -m http.server 8813 &  ·  NODE_PATH=/opt/npm-tools/node_modules node tools/thap-anim-vang.js
//   CHI=id,id · OUT=/dev/shm/anim/vs · Q='&vsig=0' · BASE=url
'use strict';
const fs = require('fs');
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8813/thap/';
const OUT = process.env.OUT || '/dev/shm/anim/vs';
const DS = ['nemesis', 'mauhut', 'bienmau', 'hopca', 'vughep', 'aten', 'sinhdoi', 'saochep', 'luutru', 'xuonganh', 'nguyenrua', 'tudo', 'dongbo', 'hasao',
  'nhanban', 'lienket', 'kepha', 'xaotron', 'epxung', 'nhieusong', 'tienhoa', 'orbital', 'loren', 'luoicheo', 'guongcong', 'thanhdia', 'congap'];
const CHI = process.env.CHI ? process.env.CHI.split(',') : DS;
fs.mkdirSync(OUT, { recursive: true });

// kịch bản kỹ năng: 'ghep' = 2 ụ cùng loại cùng sao, ghép thật · 'ghepVao:X' = kéo ụ lên ụ X cùng sao (ghép đặc biệt) ·
// 'xung' = ụ hỗ trợ + 3 ụ Tấn công cùng sao (chờ nhịp) · 'hoa' = thêm ụ cùng sao kề (Hoà âm) · 'nm' = PHÁN QUYẾT · 'nuot' = Máu tăng ·
// 'kho' = Archive mốc 10 (ghép 2 Gatling) · 'chuoi' = 3 ụ Chuỗi kề nhau
const KB = { nemesis: 'nm', mauhut: 'nuot', hopca: 'hoa', dongbo: 'xung', hasao: 'xung', luutru: 'kho', lienket: 'chuoi', epxung: 'ghepVao:lien', saochep: 'ghepVao:lien', vughep: 'ghepVao:lien', tudo: 'ghepVao:canon', aten: 'doc', bienmau: 'trung2' };

function DUNG() {
  window.__AV = function (id, kb, chup) {
    const B = G.ban[0], p0 = G.duong.find(q => q.ban === B.i) || G.duong[0];
    for (const X of G.ban) { X.tim = 1e9; X.mana = 1e6; } G.dung = true;
    G.quai.length = 0; G.hang.length = 0; G.hu.length = 0; FX.reset(); if (typeof VX !== 'undefined') VX.reset(); if (typeof SIG !== 'undefined') SIG.ds.length = 0; G.cho = 0; G.tWave = 3; G.t = 100;
    for (let i = 0; i < B.t.length; i++) B.t[i] = null;
    let OU = 7, dmin = 1e9; B.o.forEach((c, i) => { const d = Math.abs(c.x - W / 2) - c.y * 3; if (d < dmin) { dmin = d; OU = i; } });
    const sao = 3, dat = (o, id2, s) => (B.t[o] = sinhU(taoU(B, id2, s || sao, o)));
    const T = dat(OU, id), c7 = B.o[OU], L = OU - 1, R = OU + 1, U = OU - 5;
    let s0 = 0, dm = 1e9; for (let s = 80; s < p0.len - 80; s += 4) { const [x, y] = viTri(p0, s), d = Math.hypot(x - c7.x, y - c7.y); if (d < dm) { dm = d; s0 = s; } }
    for (let i = 0; i < 8; i++) { const E = sinhQuai('bo', 0, s0 + (i - 3.5) * 22, 60); E.vao = 1; E.max = E.hp = 1e12; E.d = Object.assign({}, E.d, { v: 0 }); [E.x, E.y, E.goc] = viTri(p0, E.s); if (kb === 'doc') { E.doc = 50; E.docT = 99; } }
    // theo dõi đòn trúng (cả khi tắt chữ ký) → tâm khung chụp
    let tr = null; const t0 = TVX.trung; TVX.trung = function (X, E) { if (X === T && !tr && G.t > 100.9) tr = { x: E.x, y: E.y, t: G.t }; return t0.apply(this, arguments); };
    const k = REN.s * REN.dpr, CO = 210, w = Math.round(CO * k / 1.6), N1 = 6, N2 = 8, COT = 7;
    const cv = window.__dai || (window.__dai = document.createElement('canvas')); cv.width = w * COT + 4 * (COT - 1); cv.height = w * 2 + 4;
    const x2 = cv.getContext('2d'); x2.fillStyle = '#000'; x2.fillRect(0, 0, cv.width, cv.height);
    let n = 0;
    const chup1 = (c) => {
      c = { x: Math.max(CO / 2, Math.min(W - CO / 2, c.x)), y: Math.max(CO / 2, Math.min(H - CO / 2, c.y)) };
      const dx = (n % COT) * (w + 4), dy = Math.floor(n / COT) * (w + 4);
      if (REN.nen.width > 2) { const kn = REN.nen.width / W; x2.drawImage(REN.nen, (c.x - CO / 2) * kn, (c.y - CO / 2) * kn, CO * kn, CO * kn, dx, dy, w, w); }
      x2.drawImage(REN.cv, (c.x - CO / 2) * k, (c.y - CO / 2) * k, CO * k, CO * k, dx, dy, w, w); n++;
    };
    const buoc = (ve) => { for (const E of G.quai) { E.hp = E.max; E.chet = false; } chupTruoc(); capNhat(BUOC); FX.capNhat(BUOC); REN.ve(BUOC, 1); };
    // ---- pha 1: đòn trúng ----
    let t = 0, tc = -1;
    while (t < 4 && n < N1) { buoc(); t += BUOC; if (tr && tc < 0) tc = tr.t; if (tc >= 0 && chup && G.t >= tc + n * 0.06) chup1({ x: tr.x * 0.85 + c7.x * 0.15, y: tr.y * 0.85 + c7.y * 0.15 }); }
    while (chup && n < N1) chup1(c7);
    TVX.trung = t0;
    // ---- pha 2: kỹ năng ----
    let tam = c7, tK = -1, lam = null;
    const [loai, them] = (kb || 'ghep').split(':');
    if (loai === 'ghep' && /^(orbital|loren|congap|tienhoa)$/.test(id)) dat(OU + 2 <= 14 && (OU + 2) % 5 > OU % 5 ? OU + 2 : OU - 2, id); // ụ cùng loại thứ 3 trên bàn (Orbital thức tỉnh MỌI Vệ Tinh…)
    if (loai === 'ghep' || loai === 'kho') { const a = dat(L, loai === 'kho' ? 'lien' : id), b = loai === 'kho' ? dat(U, 'lien') : T; if (id === 'loren') a.dang = T.dang; /* Twin Anvil: cùng dạng mới ghép được */ if (loai === 'kho') { T.kho = 9; tam = B.o[U]; } lam = () => ghep(B, a, b); }
    else if (loai === 'ghepVao') { const b = dat(R, them); const a = T; tam = B.o[R]; lam = () => ghep(B, a, b); }
    else if (loai === 'xung') { dat(L, 'lien'); dat(R, 'lien'); dat(U, 'lien'); lam = () => { }; }
    else if (loai === 'hoa') { lam = () => { dat(L, 'lien'); dat(R, 'canon'); }; }
    else if (loai === 'nm') { lam = () => { T.nmDem = 9; }; }
    else if (loai === 'nuot') { lam = () => { T.mau = (T.mau || 0) + 15; T.sang = 1; }; } // (chụp: Máu tăng như khi nuốt 1 ụ 3★ — hình đọc theo T.mau)
    else if (loai === 'chuoi') { lam = () => { dat(L, id); dat(R, id); }; }
    else lam = () => { };
    const nm0 = T.nmPhaT || 0; let n2 = 0, tb = 0, mocSK = -1;
    t = 0;
    while (t < 6 && n2 < N2) {
      if (lam && t >= 0.2) { try { lam(); } catch (e) { window.__loi = String(e); } lam = null; tK = G.t; }
      buoc(); t += BUOC; tb += BUOC;
      if (loai === 'nm' && tK >= 0 && mocSK < 0 && (T.nmDem || 0) < 9) mocSK = G.t - 0.05; // phán quyết vừa xảy ra
      if (loai === 'xung' && tK >= 0 && mocSK < 0 && (T.nhip || 0) < 0.02 && t > 0.5) mocSK = G.t - 0.05; // nhịp xung hỗ trợ
      const moc = loai === 'nm' || loai === 'xung' ? mocSK : tK;
      if (chup && moc >= 0 && G.t >= moc + n2 * (/ghep|kho/.test(loai) ? 0.15 : 0.09)) { chup1(tam); n2++; } // ghép: 8 khung × 0,15 s (qua lúc lộ kết quả)
    }
    while (chup && n2 < N2) { chup1(tam); n2++; }
    return chup ? cv.toDataURL('image/jpeg', 0.82) : null;
  };
}

(async () => {
  const b = await chromium.launch(), errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE + '?mode=solo&deck=lien,canon,set,tia,mana&wave=6&fill=5&mana=99999&notut=1' + (process.env.Q || ''), { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length && !TAI.cho, null, { timeout: 40000 });
  await p.waitForTimeout(4000);
  await p.evaluate(DUNG);
  for (const id of CHI) {
    await p.evaluate(([id, kb]) => { G.ban[0].deck = [id, 'lien', 'canon', 'set', 'tia']; window.__AV(id, kb, false); }, [id, KB[id]]); // lượt làm ấm (giải mã ảnh)
    await p.waitForTimeout(300);
    const r = await p.evaluate(([id, kb]) => window.__AV(id, kb, true), [id, KB[id]]);
    if (r) fs.writeFileSync(`${OUT}/${id}.jpg`, Buffer.from(r.split(',')[1], 'base64'));
    console.log(id, await p.evaluate(() => [window.__loi || '', typeof VSG !== 'undefined' && VSG.loi ? 'VSG LOI: ' + VSG.loi : ''].join(' ')));
    await p.evaluate(() => { window.__loi = ''; });
  }
  console.log('loi trang:', errs.length, errs.slice(0, 5));
  await b.close();
})();
