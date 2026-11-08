// TURRET MERGE — KIỂM LUẬT nhóm B (người dùng duyệt 08/11 — docs/demo-hop-tuong/tuvan/ghi-chu-nguoi-dung/TOM-TAT.md):
//   Sói Máy (bắn 1 nòng / 3 nòng thức tỉnh) · Hydra (đầu = sao, chuỗi đạn, không power-up, chạm tốn mana, 7★ súng máy) · Nemesis (phán quyết 10 đòn)
//   · Chúa Tổ (drone bay vòng, công thức hồi) · Rồng Máy (thiêu 0.15D × giây/2 × sao) · Hố Đen (chỉ giữ chân, nghiền, SINGULARITY 30 mana)
//   · Lõi Khởi Sinh (dấu cộng, lượt, tự huỷ, GENESIS 30 mana) · Thuỷ Quái (tinh anh +3, trùm +10) · Hào Quang Thánh bị bỏ + bù thẻ / bộ bài / gộp hồ sơ.
// Phần 1: luật thuần (chạy trong trang, bước mô phỏng cố định, không đồng hồ thật). Phần 2: chụp 844×390 + dọc 390×844 (trận + trang ụ).
// Chạy (gốc repo): python3 -m http.server 8765 &  NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-do-nhomb.js
//   BASE=http://localhost:8765/thap/ · OUT=thư mục ảnh (mặc định tests/do-nhomb/shots/) · CHUP=0 bỏ phần chụp
'use strict';
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.env.OUT || path.join(__dirname, '..', 'tests', 'do-nhomb', 'shots');
const LOI = []; let dat = 0;
const kt = (ten, ok, chi) => { if (ok) { dat++; console.log('  ✓ ' + ten); } else { LOI.push(ten + ' — ' + chi); console.log('  ✗ ' + ten + ' — ' + chi); } };

// ---------------- chạy trong trang ----------------
function PG() {
  window.KB = {
    moi(deck) { // bàn trống, không wave, không quái, bước tay
      G.dung = true; G.cho = 1e9; G.hang.length = 0; G.quai.length = 0; G.hu.length = 0; G.dan.length = 0; G.wave = 20;
      const B = G.ban[0]; B.t.fill(null); B.tim = 1e9; B.mana = 1000; B.ai = false;
      if (deck) deck.forEach((id, i) => { B.deck[i] = id; B.lv[id] = 1; });
      B.capThe = {}; return B;
    },
    dat(o, id, sao) { const B = G.ban[0]; const T = sinhU(taoU(B, id, sao, o)); B.t[o] = T; return T; },
    quai(id, k, hs, dung) { const p = G.duong.findIndex(q => q.ban === 0), P = G.duong[p]; const E = sinhQuai(id || 'bo', p, P.len * (k == null ? 0.5 : k), hs || 1); E.vao = 1; if (dung !== false) E.d = Object.assign({}, E.d, { v: 0 }); [E.x, E.y, E.goc] = viTri(P, E.s); return E; },
    gan(T, id, hs) { // quái đứng yên ở quãng đường gần ụ T nhất
      const p = G.duong.findIndex(q => q.ban === 0), P = G.duong[p], c = tamU(T); let bs = 0, bd = 1e9;
      for (let s = 0; s < P.len; s += 4) { const [x, y] = viTri(P, s), d = Math.hypot(x - c.x, y - c.y); if (d < bd) { bd = d; bs = s; } }
      return this.quai(id, bs / P.len, hs);
    },
    buoc(s) { const n = Math.round(s / BUOC); for (let i = 0; i < n; i++) capNhat(BUOC); },
  };
}

async function luat(b) {
  const p = await b.newPage({ viewport: { width: 844, height: 390 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE + '?mode=solo&deck=soi,hydra,nemesis,chuato,lien&mana=0&notut=1&seed=777', { waitUntil: 'load', timeout: 90000 });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length, null, { timeout: 60000 });
  await p.waitForTimeout(800);
  await p.evaluate(PG);
  const R = (f, a) => p.evaluate(f, a);

  console.log('— Sói Máy');
  let r = await R(() => {
    KB.moi(['soi', 'lien', 'canon', 'set', 'tia']);
    const T = KB.dat(7, 'soi', 1); T.thuc = false; const E = KB.gan(T, 'bo', 1e6);
    const n = []; const m = SKILLS.soi.mot; SKILLS.soi.mot = function (G, B, X, Q, k) { n.push([G.t, k]); return m.apply(this, arguments); };
    KB.buoc(0.5); n.length = 0; KB.buoc(18);
    const thuong = n.length, kThuong = n.every(x => x[1] === 1);
    G.quai.length = 0; G.dan.length = 0; G.ban[0].t[7] = null;
    const W = KB.dat(7, 'soi', 1); W.thuc = true; KB.gan(W, 'bo', 1e6); KB.buoc(0.5); n.length = 0; KB.buoc(12);
    SKILLS.soi.mot = m;
    const cach = []; for (let i = 1; i < n.length; i++) cach.push(+(n[i][0] - n[i - 1][0]).toFixed(3));
    return { thuong, kThuong, tt: n.length, kTT: n.every(x => x[1] === 0.5), cach: cach.slice(0, 6), crit: !!SKILLS.soi.luonCrit(W) };
  });
  kt('thường: 1 viên 1.0D mỗi 1.8 s (18 s ≈ 10 viên)', r.thuong >= 9 && r.thuong <= 11 && r.kThuong, JSON.stringify(r));
  kt('thức tỉnh: loạt 3 × 0.5D cách 0.1 s, loạt mỗi 1.2 s (12 s ≈ 30 viên), luôn chí mạng', r.tt >= 27 && r.tt <= 33 && r.kTT && r.crit && r.cach.every(x => Math.abs(x - 0.1) < 0.02 || Math.abs(x - 1.0) < 0.05) && r.cach.filter(x => x < 0.5).length === 4, JSON.stringify(r));

  console.log('— Hydra');
  r = await R(() => {
    const B = KB.moi(['hydra', 'lien', 'canon', 'set', 'tia']);
    const T = KB.dat(7, 'hydra', 3); for (let i = 0; i < 4; i++) KB.gan(T, 'bo', 1e6);
    const n = []; const m = SKILLS.hydra.mot; SKILLS.hydra.mot = function (G, B, X, Q, i, he) { n.push([+G.t.toFixed(3), i, +he.toFixed(3)]); return m.apply(this, arguments); };
    KB.buoc(0.3); n.length = 0; KB.buoc(2.4 * 4 + 0.01);
    const thuong = n.slice(); B.mana = 100; const nc = nangCap(B, 'hydra');
    T.nap = 1; const ok = SKILLS.hydra.chuDong(G, B, T), mana = B.mana, dai = T.hyA;
    const T7 = KB.dat(12, 'hydra', 7); T7.nap = 1; B.mana = 44; const thieu = SKILLS.hydra.chuDong(G, B, T7); B.mana = 45; const du = SKILLS.hydra.chuDong(G, B, T7);
    n.length = 0; KB.buoc(8); const may = n.filter(x => x[2] === 0.45).length;
    SKILLS.hydra.mot = m;
    return { thuong: thuong.slice(0, 7), soThuong: thuong.length, nc, ok, mana, dai, thieu, du, mana7: B.mana, may, nap: T7.nap, cd: SKILLS.hydra.cd };
  });
  const c0 = r.thuong.slice(r.thuong.findIndex(x => x[1] === 0)); const cach = c0.length > 3 ? [+(c0[1][0] - c0[0][0]).toFixed(2), +(c0[2][0] - c0[1][0]).toFixed(2), +(c0[3][0] - c0[2][0]).toFixed(2)] : [];
  kt('3★: 3 đầu bắn nối tiếp cách 0.18 s, mỗi viên 0.59D, nghỉ 1.9 s', c0.length >= 6 && Math.abs(cach[0] - 0.18) < 0.02 && Math.abs(cach[1] - 0.18) < 0.02 && Math.abs(cach[2] - 1.9) < 0.05 && c0.every(x => x[2] === 0.59) && c0[0][1] === 0 && c0[1][1] === 1 && c0[2][1] === 2, JSON.stringify(r));
  kt('không có POWER-UP mana trong trận (nangCap = false)', r.nc === false, JSON.stringify(r));
  kt('chạm 3★: tốn 10 + 5×3 = 25 mana, kéo dài 4 + 1.5 = 5.5 s (LV9)', r.ok && r.mana === 75 && Math.abs(r.dai - 5.5) < 1e-6, JSON.stringify(r));
  kt('7★: 44 mana không đủ, 45 mana dùng được → SÚNG MÁY 10 viên/s × 0.45D trong 7.5 s (≈75 viên), hồi 20 s', r.thieu === false && r.du === true && r.mana7 === 0 && r.may >= 72 && r.may <= 77 && r.cd === 20, JSON.stringify(r));

  console.log('— Nemesis');
  r = await R(() => {
    const B = KB.moi(['nemesis', 'lien', 'canon', 'set', 'tia']); const S = SKILLS.nemesis;
    const T = KB.dat(7, 'nemesis', 3);
    for (let i = 0; i < 10; i++) S.ghi(T, i < 3); const a = [T.nmToc, T.nmDmg];
    for (let i = 0; i < 10; i++) S.ghi(T, i < 5); const b = [T.nmToc, T.nmDmg];
    for (let i = 0; i < 200; i++) S.ghi(T, false); for (let i = 0; i < 200; i++) S.ghi(T, true);
    const c = [T.nmToc, T.nmDmg];
    const E = KB.gan(T, 'bo', 1e6); const x = SKILLS.nemesis.x; // kết liễu cũ đã bỏ
    E.hp = E.max * 0.01; const h0 = E.hp; S.danh(G, B, T, E); const songSot = !E.chet || E.hp > 0 || h0 > dmgU(T) + E.max * S.p(T);
    B.capThe = { nemesis: 8 }; const b17 = [S.buocToc(T), S.buocDmg(T)];
    return { a, b, c, x: typeof x, songSot, b17 };
  });
  kt('10 đòn 7 thường / 3 tinh anh → +4% tốc', Math.abs(r.a[0] - 0.04) < 1e-9 && r.a[1] === 0, JSON.stringify(r));
  kt('hoà 5–5 → +6% sát thương', Math.abs(r.b[1] - 0.06) < 1e-9, JSON.stringify(r));
  kt('trần +40% tốc / +60% sát thương', Math.abs(r.c[0] - 0.4) < 1e-9 && Math.abs(r.c[1] - 0.6) < 1e-9, JSON.stringify(r));
  kt('LV17: +5.6% / +8.4% mỗi phán quyết', Math.abs(r.b17[0] - 0.056) < 1e-9 && Math.abs(r.b17[1] - 0.084) < 1e-9, JSON.stringify(r));
  kt('bỏ kết liễu máu thấp (không còn SKILLS.nemesis.x)', r.x === 'undefined', JSON.stringify(r));

  console.log('— Chúa Tổ');
  r = await R(() => {
    const B = KB.moi(['chuato', 'lien', 'canon', 'set', 'tia']); const S = SKILLS.chuato;
    B.capThe = { chuato: -2 }; // thẻ Đỏ LV9 (cấp đầu Đỏ = 11)
    const T = KB.dat(7, 'chuato', 7);
    const ck7 = S.chuKy(T, 7), ck1 = S.chuKy(T, 1);
    B.capThe = { chuato: 6 }; const ck17 = S.chuKy(T, 7); B.capThe = { chuato: -2 };
    KB.buoc(ck7 - 0.2); const truoc = T.bay.length;
    const E = KB.gan(T, 'bo', 1e6); const hp0 = E.hp;
    const lao = []; const push = G.hu.push; KB.buoc(0.3); for (const o of G.hu) if (o.k === 'hiveLao' && o.T === T) lao.push(o.dmg);
    const motCon = dmgU(T) * (0.70 + 0.15 * 7) * (1 + 0.08 * 6);
    KB.buoc(1); const hp1 = E.hp;
    // SWARM
    KB.buoc(2); const coBay = T.bay.length; T.nap = 1; const sw = S.chuDong(G, B, T);
    return { ck7, ck1, ck17, truoc, lao: lao.length, dung: lao.every(d => Math.abs(d - motCon) < 1e-6), mat: hp0 - hp1, motCon, coBay, sw, nhanh: T.nhanh };
  });
  kt('hồi 7★ thả đủ 7: 14 / 1.9 = 7.37 s (LV9); thả 1: 14 s; LV17: 7.37 / 1.16 = 6.35 s', Math.abs(r.ck7 - 14 / 1.9) < 1e-6 && Math.abs(r.ck1 - 14) < 1e-6 && Math.abs(r.ck17 - 14 / 1.9 / 1.16) < 1e-6, JSON.stringify(r));
  kt('drone bay vòng = sao, đủ bầy + có quái → thả cả 7, mỗi con (0.70+0.15×7)D × (1 + 0.08×6)', r.truoc === 6 && r.lao === 7 && r.dung && r.mat > r.motCon * 6.9, JSON.stringify(r));
  kt('SWARM (3★+) thả drone đang có, lần nạp kế 1.5 s/drone', r.sw === true && r.coBay >= 1 && r.nhanh === 7, JSON.stringify(r));

  console.log('— Rồng Máy');
  r = await R(() => {
    const B = KB.moi(['ronglua', 'lien', 'canon', 'set', 'tia']);
    const T = KB.dat(7, 'ronglua', 7); const E = KB.gan(T, 'bo', 1e6);
    KB.buoc(1.5);
    return { chayD: E.chayD, mong: 0.075 * 7 * dmgU(T), T3: E.chayT };
  });
  // 08/11 Lò Phản Ứng (thap-kt-rong-may.js): D gồm thưởng NHIỆT (+0.2%/nhiệt) lúc nhịp phun → so D lúc đo lệch < 1%
  kt('thiêu 3 s tổng 0.15D × 1.5 × sao (ST/giây = 0.075 × sao × D), nguồn mạnh nhất, làm mới thời gian', Math.abs(r.chayD - r.mong) < 0.01 * r.mong && r.T3 > 2.5, JSON.stringify(r));

  console.log('— Hố Đen');
  r = await R(() => {
    const B = KB.moi(['blackhole', 'lien', 'canon', 'set', 'tia']); const S = SKILLS.blackhole;
    const T = KB.dat(7, 'blackhole', 3);
    const E = KB.gan(T, 'bo', 1e6); E.d = Object.assign({}, E.d, { v: 40 }); const E2 = KB.gan(T, 'bo', 1e6); E2.d = Object.assign({}, E2.d, { v: 40 }); E2.s += 6;
    T.bhT = 0.999; KB.buoc(BUOC * 2);
    const ho = G.hu.find(o => o.k === 'hoden' && o.T === T); if (!ho) return { ho: false };
    const s0 = E.s, hp0 = E.hp; KB.buoc(0.6); const s1 = E.s;
    KB.buoc(0.7); const mat = hp0 - E.hp, mong = dmgU(T) * (2.0 + 0.6 * 3);
    B.mana = 29; T.nap = 1; const thieu = S.chuDong(G, B, T); B.mana = 30; const du = S.chuDong(G, B, T);
    return { ho: true, r: ho.r, giu: s1 === s0, lui: s1 < s0, mat, mong, thieu, du, mana: B.mana, A: T.bhA };
  });
  kt('bán kính 64 + 4×sao, CHỈ giữ chân (không kéo lùi trên đường)', r.ho && r.r === 76 && r.giu && !r.lui, JSON.stringify(r));
  kt('nghiền (2.0 + 0.6×sao)D', r.ho && r.mat >= r.mong * 0.999 && r.mat < r.mong * 2.2 + 1, JSON.stringify(r));
  kt('SINGULARITY COLLAPSE: 30 mana (29 không đủ)', r.thieu === false && r.du === true && r.mana === 0 && r.A === true, JSON.stringify(r));

  console.log('— Lõi Khởi Sinh');
  r = await R(() => {
    const B = KB.moi(['khoisinh', 'lien', 'canon', 'set', 'tia']); const S = SKILLS.khoisinh;
    B.capThe = { khoisinh: -2 };
    const K = KB.dat(7, 'khoisinh', 2); const g = S.g(K);
    B.capThe = { khoisinh: 6 }; const g17 = S.g(K); B.capThe = { khoisinh: -2 };
    const a = KB.dat(2, 'lien', 3), b = KB.dat(6, 'lien', 2), c = KB.dat(8, 'lien', 2), d = KB.dat(12, 'lien', 4), xa = KB.dat(0, 'lien', 1);
    KB.buoc(g + 0.05); const lan1 = [a.sao, b.sao, c.sao, d.sao, xa.sao, K.luot];
    KB.buoc(g + 0.05); const lan2 = [a.sao, b.sao, c.sao, d.sao, K.luot, B.t[7] === K];
    // chờ không mất lượt + hạ sao / tăng sao
    const B2 = KB.moi(); const K2 = KB.dat(7, 'khoisinh', 5); const da = KB.dat(2, 'lien', 1); da.st.da = true;
    KB.buoc(g * 2); const cho = [K2.luot, K2.sinhT >= S.g(K2) - 1e-6];
    K2.sao = 3; KB.buoc(BUOC); const ha = K2.luot; K2.sao = 6; KB.buoc(BUOC); const tang = K2.luot;
    // GENESIS
    B2.mana = 29; K2.nap = 1; const thieu = S.chuDong(G, B2, K2); B2.mana = 30; const du = S.chuDong(G, B2, K2);
    const moi = B2.t[6]; // ô trống kề nhỏ nhất của 7 (2 bị chiếm): 6
    return { g, g17, lan1, lan2, cho, ha, tang, thieu, du, mana: B2.mana, moi: moi ? [moi.id, moi.sao] : null };
  });
  kt('chu kỳ 12 s ÷ (1 + 0.03×(cấp−9)): LV9 12 s, LV17 9.68 s', Math.abs(r.g - 12) < 0.01 && Math.abs(r.g17 - 9.68) < 0.01, JSON.stringify(r));
  kt('+1★ ụ kề (dấu cộng) sao thấp nhất, hoà → ô số nhỏ hơn (ô 6 trước ô 8), ô chéo không tính', r.lan1[1] === 3 && r.lan1[2] === 2 && r.lan1[0] === 3 && r.lan1[4] === 1 && r.lan1[5] === 1, JSON.stringify(r));
  kt('hết lượt (2★ = 2 lượt) → tự huỷ, ô trống', r.lan2[2] === 3 && r.lan2[4] === 0 && r.lan2[5] === false, JSON.stringify(r));
  kt('không có ụ hợp lệ (đá) → chờ, không mất lượt', r.cho[0] === 5 && r.cho[1], JSON.stringify(r));
  kt('bị hạ sao → lượt = min(lượt, sao); tăng sao không hồi lượt', r.ha === 3 && r.tang === 3, JSON.stringify(r));
  kt('GENESIS 30 mana → 1 ụ 1★ vào ô trống kề số nhỏ nhất', r.thieu === false && r.du === true && r.mana === 0 && r.moi && r.moi[1] === 1 && r.moi[0] !== 'khoisinh', JSON.stringify(r));

  console.log('— Thuỷ Quái');
  r = await R(() => {
    const B = KB.moi(['leviathan', 'lien', 'canon', 'set', 'tia']);
    const T = KB.dat(7, 'leviathan', 3); T.vuc = 0;
    const E = KB.gan(T, 'khong_lo', 1); const big = !!E.d.to; G.dangBan = T; trung(E, E.hp + 10, { B, T, crit: false });
    const a = T.vuc;
    const M = KB.gan(T, 'bo', 1); trung(M, M.hp + 10, { B, T, crit: false }); const b = T.vuc;
    const N = KB.dat(8, 'leviathan', 1);
    return { big, a, b, moi: N.vuc };
  });
  kt('giết tinh anh +3 ABYSS (quái thường không cộng khi giết), ụ mới = 0', r.big && r.a === 3 && r.b === 3 && r.moi === 0, JSON.stringify(r));
  r = await R(() => {
    const B = KB.moi(['leviathan', 'lien', 'canon', 'set', 'tia']);
    const T = KB.dat(7, 'leviathan', 3); T.vuc = 0;
    let E = null; try { E = sinhTrum('freezer', G.duong.findIndex(q => q.ban === 0)); } catch (e) { }
    if (!E) return { E: false };
    E.vao = 1; trung(E, E.hp + 10, { B, T, crit: false });
    return { E: true, trum: !!E.trum, vuc: T.vuc };
  }).catch(e => ({ loi: String(e) }));
  kt('giết trùm +10 ABYSS', r.trum && r.vuc === 10, JSON.stringify(r));

  console.log('— Hào Quang Thánh bị bỏ');
  r = await R(() => ({ map: !!G.rosterMap.haoquang, roster: G.roster.some(x => x.id === 'haoquang'), bo: THEBAI.BO }));
  kt('không còn trong danh sách ụ (bộ bài / gacha / cửa hàng)', !r.map && !r.roster, JSON.stringify(r));
  await p.close();

  // bù thẻ + bộ bài đã lưu: chạy lại trang với bản lưu cũ có Hào Quang
  const p2 = await b.newPage({ viewport: { width: 844, height: 390 } });
  p2.on('pageerror', e => errs.push('p2: ' + e.message));
  await p2.addInitScript(() => {
    if (sessionStorage.getItem('kb_da')) return; sessionStorage.setItem('kb_da', '1');
    localStorage.setItem('turret_the', JSON.stringify({ v: 1, vang: 500, c: { haoquang: { lv: 13, n: 4 }, chuato: { lv: 12, n: 1 } } }));
    localStorage.setItem('turret_bo', JSON.stringify({ chon: ['set', 'lien', 'radar', 'khien', 'haoquang'], mv: 'hero', che: 'solo' }));
    localStorage.setItem('turret_pre', JSON.stringify({ cur: 0, ds: [{ ten: 'A', o: ['haoquang', 'lien', 'set', 'radar', 'khien'] }] }));
  });
  await p2.goto(BASE + '?notut=1', { waitUntil: 'load', timeout: 90000 });
  await p2.waitForFunction(() => typeof G !== 'undefined' && G.rosterMap && Object.keys(G.rosterMap).length > 10 && typeof UI !== 'undefined', null, { timeout: 60000 });
  await p2.waitForTimeout(800);
  r = await p2.evaluate(() => {
    const d = JSON.parse(localStorage.getItem('turret_the')), bo = JSON.parse(localStorage.getItem('turret_bo')), pre = JSON.parse(localStorage.getItem('turret_pre'));
    const dich = d.doi && d.doi.haoquang;
    // gộp hồ sơ Firebase: bản trên mạng vẫn còn thẻ Hào Quang
    const xa = { kt: Object.assign({}, KT.doc(), { n: 9999 }), the: { v: 1, vang: 1, c: { haoquang: { lv: 15, n: 2 } } } };
    KT.gop(JSON.parse(JSON.stringify(xa)));
    const d2 = THEBAI.doc();
    return { dich, conHao: !!d.c.haoquang, lvDich: dich && d.c[dich], chon: bo.chon, uiChon: UI.chon.slice(), pre: pre.ds[0].o, doDau: THEBAI.dsDo()[0],
      sau: { conHao: !!d2.c.haoquang, dich2: d2.doi && d2.doi.haoquang, lv: d2.c[dich] }, doiBo: THEBAI.doiBo(['haoquang', 'lien', 'chuato']) };
  });
  kt('bù: thẻ Hào Quang → thẻ Đỏ đầu tiên CHƯA có, giữ cấp 13 + bản sao 4', r.dich && r.dich !== 'chuato' && !r.conHao && r.lvDich && r.lvDich.lv === 13 && r.lvDich.n === 4, JSON.stringify(r));
  kt('bộ bài đã lưu + bộ mẫu: Hào Quang → thẻ đích, đúng ô', r.chon[4] === r.dich && r.uiChon.includes(r.dich) && r.pre.includes(r.dich) && !r.pre.includes('haoquang'), JSON.stringify(r));
  kt('gộp hồ sơ Firebase còn Hào Quang → chuyển sang CÙNG thẻ đích, cấp lớn hơn (15)', !r.sau.conHao && r.sau.dich2 === r.dich && r.sau.lv && r.sau.lv.lv === 15, JSON.stringify(r));
  kt('bộ bài người khác (online, bản cũ) → thay bằng thẻ Đỏ đầu tiên chưa có trong bộ', r.doiBo[0] !== 'haoquang' && r.doiBo[0] !== 'chuato' && r.doiBo.length === 3, JSON.stringify(r));
  await p2.close();
  kt('không lỗi trang', !errs.length, errs.slice(0, 5).join(' | '));
}

// ---------------- chụp ảnh ----------------
async function chup(b) {
  fs.mkdirSync(OUT, { recursive: true });
  const ds = [];
  for (const [w, h] of [[844, 390], [390, 844]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: w < h, hasTouch: true });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(BASE + '?mode=solo&deck=soi,hydra,nemesis,chuato,khoisinh&mana=0&notut=1&seed=99', { waitUntil: 'load', timeout: 90000 });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length, null, { timeout: 60000 });
    await p.waitForTimeout(1500); await p.evaluate(PG);
    await p.evaluate(() => { try { if (typeof VT !== 'undefined' && VT.mo) VT.dong(); } catch (e) { } }); await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 15000 }).catch(() => { }); await p.waitForTimeout(600);
    for (const [ten, dat] of [
      ['A', [[0, 'soi', 3, 0], [1, 'soi', 5, 1], [2, 'hydra', 3], [3, 'hydra', 5], [4, 'hydra', 7], [5, 'nemesis', 4], [6, 'chuato', 4], [7, 'chuato', 7], [8, 'khoisinh', 3], [9, 'lien', 2], [10, 'blackhole', 5], [11, 'ronglua', 5], [12, 'leviathan', 4], [13, 'lien', 1], [14, 'hydra', 1]]],
    ]) {
      await p.evaluate((dat) => {
        G.dung = false; G.cho = 1e9; G.hang.length = 0; G.quai.length = 0; G.hu.length = 0; G.dan.length = 0;
        const B = G.ban[0]; B.tim = 1e9; B.mana = 500; B.t.fill(null);
        for (const [o, id, s, tt] of dat) { if (!B.deck.includes(id)) B.lv[id] = 1; const T = sinhU(taoU(B, id, s, o)); if (tt != null) T.thuc = !!tt; B.t[o] = T; }
        const p0 = G.duong.findIndex(q => q.ban === 0), P = G.duong[p0];
        for (let i = 0; i < 16; i++) { const E = sinhQuai(i % 5 === 0 ? 'khong_lo' : 'bo', p0, P.len * (0.05 + i * 0.055), 80); E.vao = 1; }
      }, dat);
      await p.waitForTimeout(4200);
      const f1 = path.join(OUT, `tran_${w}x${h}_${ten}.png`); await p.screenshot({ path: f1 }); ds.push(f1);
      await p.evaluate(() => { const B = G.ban[0]; for (const o of [4, 7, 10]) { const T = B.t[o]; if (T && SKILLS[T.id].chuDong) { T.nap = 1; SKILLS[T.id].chuDong(G, B, T); } } });
      await p.waitForTimeout(900);
      const f2 = path.join(OUT, `tran_${w}x${h}_${ten}_chudong.png`); await p.screenshot({ path: f2 }); ds.push(f2);
    }
    // bảng thông tin ụ (chạm Hydra 7★)
    const c = await p.evaluate(() => { const B = G.ban[0]; G.dung = true; const o = B.o[4]; return { x: o.x * REN.s + REN.ox, y: o.y * REN.s + REN.oy }; }).catch(() => null);
    if (c && isFinite(c.x)) { await p.mouse.click(c.x, c.y); await p.waitForTimeout(500); const f = path.join(OUT, `tran_${w}x${h}_info.png`); await p.screenshot({ path: f }); ds.push(f); }
    // trang ụ (bộ sưu tập) của từng ụ đổi luật
    await p.goto(BASE + '?notut=1', { waitUntil: 'load', timeout: 90000 });
    await p.waitForFunction(() => typeof UP !== 'undefined' && typeof G !== 'undefined' && G.rosterMap && Object.keys(G.rosterMap).length > 10, null, { timeout: 60000 });
    await p.waitForTimeout(1200);
    for (const id of ['soi', 'hydra', 'nemesis', 'chuato', 'blackhole', 'khoisinh', 'ronglua', 'leviathan']) {
      await p.evaluate((id) => { try { HM.dong(true); } catch (e) { } UP.mo(id); }, id).catch(e => errs.push('UP.mo ' + id + ': ' + e.message));
      await p.waitForTimeout(1600);
      const f = path.join(OUT, `trang_${w}x${h}_${id}.png`); await p.screenshot({ path: f }); ds.push(f);
      await p.evaluate(() => { const t = document.querySelector('#up .up-than') || document.querySelector('.up-than'); if (t) t.scrollTop = t.scrollHeight * 0.42; }); await p.waitForTimeout(500);
      const f2 = path.join(OUT, `trang_${w}x${h}_${id}_kn.png`); await p.screenshot({ path: f2 }); ds.push(f2);
    }
    kt(`chụp ${w}×${h} không lỗi trang`, !errs.length, errs.slice(0, 4).join(' | '));
    await ctx.close();
  }
  console.log('ẢNH:\n  ' + ds.join('\n  '));
}

(async () => {
  const b = await chromium.launch();
  try { await luat(b); if (process.env.CHUP !== '0') await chup(b); }
  catch (e) { LOI.push('lỗi chạy: ' + (e && e.stack || e)); console.log(e); }
  await b.close();
  console.log(LOI.length ? '✗ thap-kt-do-nhomb: ' + LOI.length + ' lỗi / ' + (dat + LOI.length) : '✓ thap-kt-do-nhomb: đạt ' + dat);
  process.exit(LOI.length ? 1 : 0);
})();
