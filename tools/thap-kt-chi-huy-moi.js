// TURRET MERGE — KIỂM CHỈ HUY MỚI (08/11): QUICK TUNE · DRAG NET (Trắng) · TWIN SIGNAL (Xanh) · CROSSFIRE (Tím) · NEXUS LINK (Vàng).
//   Thiết kế: docs/demo-hop-tuong/tuvan/chi-huy-moi/THIET-KE.md · luật: thap/js/chihuy-moi.js (CHM) + chihuy.js.
//   Kiểm: luật từng kỹ năng · đích sai không trừ mana · giá ×2 + hồi chiêu · băng/đá · ghép mất buff / tại chỗ giữ (TWIN — người dùng chốt)
//   · tất định (không Math.random, cùng bàn → cùng kết quả) · gói online 'mv' mang ô đích (khứ hồi) · AI tự dùng · cách có (miễn phí / wave / ngọc)
//   · bản lưu cũ · chạm thẻ → chạm ô (chế độ ngắm) · ảnh 390×844 / 844×390 / 667×375 (bảng chọn, khay, VFX mỗi kỹ năng, trang chi tiết).
// Chạy: python3 -m http.server <cổng> ở gốc repo · BASE=http://localhost:<cổng>/thap/ node tools/thap-kt-chi-huy-moi.js
'use strict';
const path = require('path'), fs = require('fs');
let pw; try { pw = require('playwright'); } catch (e) { console.log('SKIP (không có playwright)'); process.exit(0); }
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const SHOTS = process.env.SHOTS || path.join(__dirname, '..', 'tests', 'chi-huy-moi', 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
let loi = 0; const ok = (dk, ten, chi) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (dk || chi == null ? '' : ' — ' + JSON.stringify(chi))); if (!dk) loi++; };
const MOI = ['tech', 'tide', 'twin', 'hawk', 'weaver'];
const deck5 = ['tia', 'radar', 'canon', 'soi', 'bang'];

async function mo(br, w, h, url, initLS) {
  const ctx = await br.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(([ls]) => { try { if (ls) for (const k in ls) localStorage.setItem(k, ls[k]); } catch (e) { } }, [initLS || null]);
  const p = await ctx.newPage(); p._errs = []; p.on('pageerror', e => p._errs.push(e.message));
  try { await p.goto(BASE + url, { waitUntil: 'load', timeout: 90000 }); }
  catch (e) { console.log('SKIP (không mở được ' + BASE + ')'); await br.close(); process.exit(0); }
  await p.waitForFunction(() => typeof G !== 'undefined' && G.roster && G.roster.length > 0 && typeof CHMU !== 'undefined', null, { timeout: 60000 });
  await p.waitForFunction(() => { const t = document.getElementById('tai'); return !t || t.hidden; }, null, { timeout: 60000 }).catch(() => { });
  await p.waitForTimeout(1200);
  return p;
}
const tran = (mv, che) => '?mode=' + (che || 'solo') + '&deck=' + deck5.join(',') + '&af=' + mv + '&notut=1&seed=7&nointro=1';
async function vaoTran(br, w, h, mv, che) {
  const p = await mo(br, w, h, tran(mv, che));
  await p.waitForFunction(() => G.ban && G.ban[0] && G.ban[0].t && document.querySelector('#the-mv'), null, { timeout: 30000 });
  await p.waitForTimeout(1200);
  return p;
}
// dựng bàn: [[ô, id, sao, {bang, da}]…] — xoá bàn, dừng trận (luật kiểm bằng gọi thẳng)
const DUNG = `window.dung = (ds, i) => { const B = G.ban[i || 0]; B.mana = 5000; B.mv.cd = 0; B.chm = []; for (let o = 0; o < 15; o++) B.t[o] = null;
  for (const [o, id, sao, st] of ds) { const T = taoU(B, id, sao, o); if (st) Object.assign(T.st, st); B.t[o] = T; } return B; };
  window.buoc = (B, n, dt) => { for (let k = 0; k < (n || 1); k++) { CH.tick(B, dt || 0.1); capNhatBan(B, 0); } };`;

(async () => {
  const br = await pw.chromium.launch();
  // =============================== 1) LUẬT ===============================
  let p = await vaoTran(br, 844, 390, 'tech');
  await p.evaluate(DUNG);
  const R = (f) => p.evaluate(f);
  // dữ liệu + bậc
  const dl = await R(() => ({ bac: Object.keys(MAVUONG).map(id => [id, mvBac(id)]), sx: mvDS() }));
  const dem = {}; for (const [, b] of dl.bac) dem[b] = (dem[b] || 0) + 1;
  ok(dem.trang === 2 && dem.xanh === 2 && dem.tim === 2 && dem.vang === 2, 'mỗi bậc Trắng/Xanh/Tím/Vàng có 2 chỉ huy', dem);
  ok(JSON.stringify(dl.bac.slice(0, 3)) === JSON.stringify([['hero', 'xanh'], ['dahlia', 'tim'], ['eve', 'vang']]), '3 chỉ huy cũ giữ bậc', dl.bac);

  // QUICK TUNE
  let r = await R(() => { G.dung = false; G.cho = 0; const B = G.ban[0]; B.mv = { id: 'tech', gia: MAVUONG.tech.gia, cd: 0 };
    dung([[0, 'tia', 1], [1, 'lien', 2], [2, 'canon', 3], [3, 'radar', 1], [4, 'tia', 2, { bang: 5 }]]);
    const m0 = B.mana, ok1 = dungMV(B), cd = B.mv.cd; buoc(B, 1, 0.01);
    return { ok1, tru: m0 - B.mana, gia: B.mv.gia, cd, t0: B.t[0].buf.toc, t1: B.t[1].buf.toc, t2: B.t[2].buf.toc, ht: B.t[3].buf.toc, bang: (B.chm[0].ds || []).includes(B.t[4]) }; });
  ok(r.ok1 && r.tru === 25 && r.gia === 50 && r.cd === 20, 'QUICK TUNE: trừ 25, giá ×2 → 50, hồi chiêu 20 s', r);
  ok(r.t0 >= 0.4 && r.t1 >= 0.4 && r.t2 < 0.4 && !r.bang, 'QUICK TUNE: +40% tốc cho 1★–2★ Tấn công; 3★ và ụ băng không nhận', r);
  r = await R(() => { const B = G.ban[0]; buoc(B, 101, 0.1); return { con: CHM.con(B, 'tech'), t0: B.t[0].buf.toc }; });
  ok(r.con === 0 && r.t0 < 0.4, 'QUICK TUNE: hết sau 10 s', r);
  r = await R(() => { const B = dung([[0, 'tia', 3], [3, 'radar', 1]]); B.mv.gia = 25; return { tt: CH.trangThai(B), m: B.mana, ok: dungMV(B), m2: B.mana }; });
  ok(r.tt === 'dich' && !r.ok && r.m === r.m2, 'QUICK TUNE: không có ụ 1★–2★ → "NO TARGET", không trừ mana', r);

  // DRAG NET
  r = await R(() => { const B = G.ban[0]; B.mv = { id: 'tide', gia: 30, cd: 0 }; dung([[6, 'tia', 1]]);
    const E = { d: { v: 40 }, cham: 0, trum: false }, Eb = { d: { v: 40 }, cham: 0, trum: true }, Ek = { d: { v: 40, khangCham: true }, cham: 0 };
    const ok1 = dungMV(B); const h = B.chm.find(x => x.k === 'luoi');
    return { ok1, c: CHM.gopCham(E, 0, h.cham), cb: CHM.gopCham(Eb, 0, h.chamTrum), cap: CHM.gopCham(E, 0.88, h.cham), capB: CHM.gopCham(Eb, 0.45, h.chamTrum), k: CHM.gopCham(Ek, 0, h.cham), giu: CHM.gopCham(E, 0.95, h.cham), con: h.con }; });
  ok(r.ok1 && Math.abs(r.c - 0.25) < 1e-9 && Math.abs(r.cb - 0.12) < 1e-9 && r.con === 6, 'DRAG NET: chậm 25% (trùm 12%) trong 6 s', r);
  ok(Math.abs(r.cap - 0.9) < 1e-9 && Math.abs(r.capB - 0.5) < 1e-9 && r.k === 0 && r.giu === 0.95, 'DRAG NET: gộp nhân, trần 90% (trùm 50%), kháng chậm không bị, không làm giảm chậm sẵn có', r);
  r = await R(() => { // quái thật trên làn bàn 0 đi chậm hơn đúng 25 %
    const B = G.ban[0], p0 = G.duong.findIndex(d => d.ban === 0); G.quai.length = 0;
    const E = sinhQuai('bo', p0, 40); E.vao = 1; const s0 = E.s; capNhatQuai(0.1); const d1 = E.s - s0;
    B.chm = []; const E2 = sinhQuai('bo', p0, 40); E2.vao = 1; G.quai = [E2]; const s1 = E2.s; capNhatQuai(0.1); const d0 = E2.s - s1; G.quai.length = 0;
    return { p0, ti: d1 / d0 };
  });
  ok(r.p0 >= 0 && Math.abs(r.ti - 0.75) < 0.02, 'DRAG NET: quái thật trên làn mình đi bằng 75% tốc độ', r);

  // TWIN SIGNAL
  r = await R(() => { const B = G.ban[0]; B.mv = { id: 'twin', gia: 35, cd: 0 };
    dung([[0, 'tia', 3], [2, 'tia', 3], [4, 'tia', 3], [10, 'lien', 2], [12, 'radar', 3], [14, 'radar', 3]]);
    const m0 = B.mana, sai = dungMV(B, 10), sai2 = dungMV(B, 12), m1 = B.mana, dung1 = dungMV(B, 0); buoc(B, 1, 0.01);
    const h = B.chm[0]; return { sai, sai2, tru0: m0 - m1, ok: dung1, a: h.a.o, b: h.b.o, d0: B.t[0].buf.dmg, d2: B.t[2].buf.dmg, d4: B.t[4].buf.dmg }; });
  ok(!r.sai && !r.sai2 && r.tru0 === 0, 'TWIN: ụ không có anh em / ụ Hỗ trợ → không dùng, không trừ mana', r);
  ok(r.ok && r.a === 0 && r.b === 2 && r.d0 >= 0.6 && r.d2 >= 0.6 && r.d4 < 0.6, 'TWIN: cặp gần nhất (ô 0 + ô 2) +60% sát thương, ụ thứ 3 không', r);
  r = await R(() => { const B = G.ban[0]; const T = B.t[2]; nangSao(B, T, 1, 'test'); buoc(B, 1, 0.01); // tăng sao tại chỗ: KHÔNG phải ghép
    const s1 = { sao: B.t[2].sao, d0: B.t[0].buf.dmg, d2: B.t[2].buf.dmg, con: CHM.con(B, 'twin') };
    // Teleporter: đổi chỗ (cùng thân)
    const a = B.t[0], c = B.t[4]; B.t[0] = c; B.t[4] = a; c.o = 0; a.o = 4; buoc(B, 1, 0.01);
    const s2 = { d4: B.t[4].buf.dmg, con: CHM.con(B, 'twin') };
    // Copycat / biến tại chỗ (giuKhiBien): thân mới nhận buff
    const N = chuyenU(B, B.t[2], 'lien', B.t[2].sao); buoc(B, 1, 0.01);
    const s3 = { id: B.t[2].id, d2: B.t[2].buf.dmg, con: CHM.con(B, 'twin') };
    return { s1, s2, s3 }; });
  ok(r.s1.sao === 4 && r.s1.d2 >= 0.6 && r.s1.con > 0, 'TWIN: Merge King / +★ tại chỗ KHÔNG phải ghép → giữ buff', r.s1);
  ok(r.s2.d4 >= 0.6 && r.s2.con > 0, 'TWIN: Teleporter đổi chỗ → giữ buff', r.s2);
  ok(r.s3.d2 >= 0.6 && r.s3.con > 0, 'TWIN: biến tại chỗ (Copycat…) → thân mới giữ buff', r.s3);
  r = await R(() => { const B = dung([[0, 'tia', 3], [2, 'tia', 3], [5, 'tia', 3]]); B.mv = { id: 'twin', gia: 35, cd: 0 };
    dungMV(B, 0); buoc(B, 1, 0.01); const a0 = B.t[0].buf.dmg;
    const N = ghep(B, B.t[5], B.t[2], true); buoc(B, 1, 0.01); // ghép 1 trong 2 ụ
    return { a0, ghep: !!N, con: CHM.con(B, 'twin'), d0: B.t[0] ? B.t[0].buf.dmg : -1, dN: B.t[2] ? B.t[2].buf.dmg : -1 }; });
  ok(r.a0 >= 0.6 && r.ghep && r.con === 0 && r.d0 < 0.6 && r.dN < 0.6, 'TWIN: ghép 1 trong 2 ụ → CẢ CẶP mất buff, ụ mới không thừa hưởng', r);

  // CROSSFIRE
  r = await R(() => { const B = G.ban[0]; B.mv = { id: 'hawk', gia: 45, cd: 0 };
    dung([[5, 'tia', 2], [6, 'lien', 2], [8, 'canon', 2], [2, 'soi', 2], [12, 'radar', 2], [0, 'tia', 5], [9, 'bang', 2, { da: true }]]);
    const ok1 = dungMV(B, 7); buoc(B, 1, 0.01); const h = B.chm[0];
    return { ok1, n: h.n, dmg: h.dmg, d5: B.t[5].buf.dmg, d6: B.t[6].buf.dmg, d2: B.t[2].buf.dmg, d0: B.t[0].buf.dmg, ht: B.t[12].buf.dmg, da: h.ds.includes(B.t[9]) }; });
  ok(r.ok1 && r.n === 7 - 1 && Math.abs(r.dmg - 1) < 1e-9, 'CROSSFIRE: đếm loại khác nhau trong hàng+cột (6 loại → trần +100%)', r);
  ok(r.d5 >= 1 && r.d6 >= 1 && r.d2 >= 1 && r.d0 < 1 && !r.da, 'CROSSFIRE: ụ Tấn công trong chữ thập nhận, ngoài chữ thập / ụ đá không', r);
  r = await R(() => { const B = dung([[5, 'tia', 2], [6, 'tia', 2], [7, 'lien', 2]]); B.mv = { id: 'hawk', gia: 45, cd: 0 }; dungMV(B, 7); return { n: B.chm[0].n, dmg: B.chm[0].dmg }; });
  ok(r.n === 2 && Math.abs(r.dmg - 0.4) < 1e-9, 'CROSSFIRE: 2 loại → +40%', r);

  // NEXUS LINK
  r = await R(() => { const B = G.ban[0]; B.mv = { id: 'weaver', gia: 50, cd: 0 };
    dung([[6, 'tia', 4], [7, 'radar', 7], [8, 'radar', 5], [9, 'chimang', 3], [1, 'radar', 2], [11, 'radar', 1], [5, 'radar', 1]]);
    const sai = dungMV(B, 8); const ok1 = dungMV(B, 6); buoc(B, 1, 0.01); const h = B.chm[0];
    return { sai, ok1, day: h.day.map(S => S.o), dmg: B.t[6].buf.dmg, toc: B.t[6].buf.toc }; });
  ok(!r.sai && r.ok1, 'NEXUS: chạm ụ Hỗ trợ → không dùng; chạm ụ Tấn công → dùng', r);
  ok(JSON.stringify(r.day) === JSON.stringify([8, 9]), 'NEXUS: chỉ Hỗ trợ cùng hàng/cột KHÔNG kề (ô 7, 1, 11, 5 kề → bỏ), gần nhất trước', r);
  r = await R(() => { const B = G.ban[0]; const T = B.t[6]; const d0 = T.buf.dmg;
    B.t[8].st.bang = 3; buoc(B, 1, 0.01); const day1 = B.chm[0].day.map(S => S.o);
    B.t[8].st.bang = 0; buoc(B, 1, 0.01); const day2 = B.chm[0].day.map(S => S.o);
    return { d0, day1, day2 }; });
  ok(r.day1.join() === '9' && r.day2.join() === '9', 'NEXUS: Hỗ trợ bị băng → dây đứt, hết băng không nối lại', r);
  r = await R(() => { const B = dung([[6, 'tia', 4], [8, 'radar', 5], [1, 'tia', 4]]); B.mv = { id: 'weaver', gia: 50, cd: 0 }; dungMV(B, 6); buoc(B, 1, 0.01);
    const d0 = B.t[6].buf.dmg; ghep(B, B.t[1], B.t[6], true); buoc(B, 1, 0.01); return { d0, con: CHM.con(B, 'nexus'), dN: B.t[6] ? B.t[6].buf.dmg : -1 }; });
  ok(Math.abs(r.d0 - 0.4) < 0.05 && r.con === 0 && r.dN < 0.39, 'NEXUS: 1 dây 5★ = +40% · ghép ụ chủ lực → hết', r);
  r = await R(() => { const B = dung([[0, 'tia', 4], [2, 'radar', 7], [3, 'radar', 7], [4, 'radar', 7], [10, 'radar', 7]]); B.mv = { id: 'weaver', gia: 50, cd: 0 }; dungMV(B, 0); buoc(B, 1, 0.01);
    return { n: B.chm[0].day.length, toc: B.t[0].buf.toc }; });
  ok(r.n === 3, 'NEXUS: tối đa 3 dây', r);
  // hỗ trợ không bắn
  r = await R(() => { const B = dung([[0, 'tia', 4], [2, 'radar', 7]]); B.mv = { id: 'weaver', gia: 50, cd: 0 }; dungMV(B, 0); buoc(B, 5, 0.1); return { cd: B.t[2].banLan || 0, dmg: SKILLS.radar.dmg }; });
  ok(!r.dmg && !r.cd, 'Ụ Hỗ trợ vẫn không bắn khi là nguồn dây NEXUS', r);

  // hồi chiêu / đồng hồ dừng giữa wave
  r = await R(() => { const B = dung([[0, 'tia', 1]]); B.mv = { id: 'tech', gia: 25, cd: 0 }; dungMV(B); const a = dungMV(B); G.cho = 3; G.quai.length = 0; const c0 = CHM.con(B, 'tech'); CH.tick(B, 1); const c1 = CHM.con(B, 'tech'); G.cho = 0; return { a, c0, c1 }; });
  ok(!r.a && r.c0 === r.c1, 'Chạm 2 lần liền → lần 2 bị hồi chiêu; đồng hồ tác dụng dừng lúc nghỉ giữa wave', r);

  // =============================== 2) TẤT ĐỊNH ===============================
  r = await R(() => {
    const goc = Math.random; let goi = 0; Math.random = () => { goi++; return goc(); };
    const ra = [];
    try {
      for (const mv of ['tech', 'tide', 'twin', 'hawk', 'weaver']) {
        const lan = [];
        for (let k = 0; k < 2; k++) {
          const B = dung([[0, 'tia', 2], [2, 'tia', 2], [6, 'lien', 3], [7, 'radar', 4], [8, 'canon', 2], [9, 'chimang', 3], [11, 'soi', 1], [13, 'radar', 2]]);
          B.mv = { id: mv, gia: MAVUONG[mv].gia, cd: 0 }; G.cho = 0;
          const c0 = goi; CH.dung(B); const cg = goi - c0; CHM.buf(B); CH.tick(B, 0.5);
          lan.push(JSON.stringify((B.chm || []).map(h => [h.k, h.o, (h.ds || []).map(T => T.o), h.a && h.a.o, h.b && h.b.o, h.T && h.T.o, (h.day || []).map(S => S.o), h.n, h.con])) + '|' + cg);
        }
        ra.push([mv, lan[0] === lan[1], lan[0]]);
      }
    } finally { Math.random = goc; }
    return ra;
  });
  for (const [mv, cung, s] of r) ok(cung && /\|0$/.test(s), 'tất định ' + mv + ': cùng bàn → cùng đích + hiệu lực, không gọi Math.random', s);
  ok(!p._errs.length, 'luật: không lỗi trang', p._errs);
  await p.context().close();

  // =============================== 3) ONLINE + AI ===============================
  p = await vaoTran(br, 844, 390, 'hawk', 'coop');
  await p.evaluate(DUNG);
  r = await p.evaluate(() => {
    const gui = []; ONS.on = true; ONS.me = 'a'; ONS.thay = null; ONS.gui = (k, d) => gui.push([k, JSON.parse(JSON.stringify(d))]);
    const bo = [[5, 'tia', 2], [6, 'lien', 2], [8, 'canon', 2], [2, 'soi', 2]];
    const B0 = dung(bo, 0), B1 = dung(bo, 1); B1.net = true; B1.mv = { id: 'hawk', gia: 45, cd: 0 }; B0.mv = { id: 'hawk', gia: 45, cd: 0 };
    dungMV(B0, 7); const g = gui.find(x => x[0] === 'mv');
    ONS.nhan({ u: 'b', k: 'mv', d: JSON.stringify(g[1]) });
    const h0 = B0.chm[0], h1 = (B1.chm || [])[0];
    ONS.on = false;
    return { g: g && g[1], o0: h0.o, o1: h1 && h1.o, n0: h0.n, n1: h1 && h1.n, ds0: h0.ds.map(T => T.o).join(), ds1: h1 && h1.ds.map(T => T.o).join(), m1: B1.mana };
  });
  ok(r.g && r.g.o === 7, 'online: gói mv mang ô đích o = 7', r.g);
  ok(r.o1 === 7 && r.n1 === r.n0 && r.ds1 === r.ds0, 'online khứ hồi: bàn con rối áp đúng ô, đúng ụ, đúng số loại', r);
  r = await p.evaluate(() => { // gói cũ không có o → tự chọn (không lỗi)
    const B1 = G.ban[1]; B1.chm = []; B1.mv.cd = 0; B1.mv.gia = 45; ONS.on = true; ONS.me = 'a'; ONS.nhan({ u: 'b', k: 'mv', d: JSON.stringify({ m: 100 }) }); ONS.on = false;
    return { co: (B1.chm || []).length, m: B1.mana }; });
  ok(r.co === 1 && r.m === 100, 'online: gói cũ không có ô → tự chọn đích, mana theo gói', r);
  // AI
  r = await p.evaluate(() => {
    const ra = {};
    for (const mv of ['tech', 'tide', 'twin', 'hawk', 'weaver']) {
      const B = dung([[0, 'tia', 2], [2, 'tia', 2], [6, 'lien', 3], [8, 'radar', 4], [9, 'chimang', 3]], 1); B.net = false; B.ai = true;
      B.mv = { id: mv, gia: MAVUONG[mv].gia, cd: 0 }; B.mana = 900; B.aiT = 0; G.cho = 0; G.dung = false;
      const goc = Math.random; Math.random = () => 0; try { aiBan(B, 0.1); } finally { Math.random = goc; }
      ra[mv] = (B.chm || []).map(h => h.k).join() + ':' + B.mv.gia;
    }
    return ra;
  });
  ok(MOI.every(mv => r[mv] && r[mv].split(':')[0] === MAVUONG_KHOA[mv]), 'AI tự dùng cả 5 chỉ huy mới (tự chọn đích)', r);
  ok(!p._errs.length, 'online/AI: không lỗi trang', p._errs);
  await p.context().close();

  // =============================== 4) CÁCH CÓ + BẢN LƯU CŨ ===============================
  p = await mo(br, 390, 844, 'index.html?notut=1', { turret_bo: JSON.stringify({ chon: deck5, mv: 'weaver', che: 'solo' }) });
  r = await p.evaluate(() => ({ mv: UI.mv, co: Object.fromEntries(Object.keys(MAVUONG).map(id => [id, mvCo(id)])) }));
  ok(r.mv === 'hero', 'bản lưu chọn chỉ huy chưa mở (weaver) → về REINFORCE', r.mv);
  ok(['hero', 'dahlia', 'eve', 'tech', 'tide'].every(id => r.co[id]) && !r.co.twin && !r.co.hawk && !r.co.weaver, 'miễn phí: 3 cũ + 2 Trắng · khoá: TWIN / CROSSFIRE / NEXUS', r.co);
  await p.evaluate(() => { HM.di('dk'); HM.moMVs(); }); await p.waitForTimeout(700);
  r = await p.evaluate(() => ({ hang: [...document.querySelectorAll('.hm-mvh')].map(e => e.querySelector('[data-id]').dataset.id), khoa: [...document.querySelectorAll('.hm-mvh.khoa')].map(e => e.querySelector('[data-id]').dataset.id), mua: [...document.querySelectorAll('.hm-mv-mua')].map(e => e.dataset.id + ':' + e.textContent) }));
  ok(r.hang.length === 8 && r.khoa.join() === 'twin,hawk,weaver' && r.mua.join() === 'twin:150,hawk:400,weaver:1000', 'bảng chọn: 8 chỉ huy, 3 khoá có nút giá ngọc 150/400/1000', r);
  await p.screenshot({ path: path.join(SHOTS, '390x844-chon-khoa.png') });
  r = await p.evaluate(() => { THEBAI.doc().ngoc = 100; const a = HM.mvMua('twin'); const n1 = KT.ngoc; THEBAI.doc().ngoc = 500; const b = HM.mvMua('twin'); return { a, n1, b, n2: KT.ngoc, co: mvCo('twin'), luu: JSON.parse(localStorage.getItem('turret_kt')).mvMo }; });
  ok(!r.a && r.n1 === 100 && r.b && r.n2 === 350 && r.co && r.luu.twin === 1, 'mở bằng ngọc: thiếu ngọc → không mở; đủ → trừ 150, lưu turret_kt.mvMo', r);
  r = await p.evaluate(() => { KT.doc().tk.wave = 30; return { hawk: mvCo('hawk'), weaver: mvCo('weaver') }; });
  ok(r.hawk && !r.weaver, 'kỷ lục wave 30 → mở CROSSFIRE (NEXUS cần wave 50)', r);
  r = await p.evaluate(() => { document.querySelector('.hm-mv-mua') ; HM.dong(true); HM.moMVs(); const el = document.querySelector('[data-act="hm-mv-chon"][data-id="weaver"]'); el.click(); return UI.mv; });
  ok(r !== 'weaver', 'chạm chỉ huy đang khoá → không chọn được', r);
  r = await p.evaluate(() => { const g = KT.gop ? 1 : 0; return g; });
  ok(!p._errs.length, 'cách có: không lỗi trang', p._errs);
  await p.context().close();
  p = await mo(br, 390, 844, 'index.html?notut=1', { turret_bo: JSON.stringify({ chon: deck5, mv: 'dahlia', che: 'solo' }) });
  ok(await p.evaluate(() => UI.mv) === 'dahlia', 'bản lưu cũ (RAGE) nạp nguyên vẹn');
  await p.context().close();

  // =============================== 5) GIAO DIỆN + ẢNH ===============================
  const KB = { // bàn mẫu cho ảnh VFX
    tech: { bo: [[1, 'tia', 1], [2, 'lien', 2], [3, 'canon', 1], [6, 'set', 2], [7, 'radar', 2], [8, 'sungluc', 4], [12, 'tia', 1]] },
    tide: { bo: [[6, 'tia', 3], [8, 'lien', 3]] },
    twin: { bo: [[6, 'lien', 3], [8, 'lien', 3], [12, 'canon', 2], [2, 'radar', 2]], o: 6 },
    hawk: { bo: [[6, 'lien', 2], [7, 'sungluc', 2], [8, 'set', 2], [2, 'canon', 2], [12, 'tia', 2], [0, 'radar', 1]], o: 7 },
    weaver: { bo: [[1, 'lien', 4], [3, 'radar', 5], [11, 'chimang', 4], [7, 'set', 2], [13, 'radar', 2]], o: 1 },
  };
  for (const [w, h] of [[390, 844], [844, 390], [667, 375]]) {
    const tag = w + 'x' + h;
    for (const mv of MOI) {
      p = await vaoTran(br, w, h, mv);
      await p.evaluate(DUNG);
      await p.evaluate((k) => { const B = dung(k.bo); B.mana = 400; G.cho = 0; G.dung = false; }, KB[mv]);
      await p.waitForTimeout(500);
      const te = await p.evaluate(() => { const e = document.querySelector('#the-mv'), v = e.querySelector(':scope > img.ov'); return { b: e.dataset.otb, ov: v ? v.getAttribute('src') : '' }; });
      ok(te.b === await p.evaluate((m) => mvBac(m), mv) && te.ov.includes('o_vien_' + te.b), tag + ' ' + mv + ': thẻ khay viền bậc ' + te.b, te);
      if (KB[mv].o != null) { // chạm thẻ → ngắm → chạm ô
        await p.click('#the-mv'); await p.waitForTimeout(350);
        const ng = await p.evaluate(() => ({ ds: CHMU.ngam && CHMU.ngam.ds, goi: !document.getElementById('chm-goi').hidden, m: G.ban[0].mana }));
        ok(ng.ds && ng.ds.includes(KB[mv].o) && ng.goi && ng.m >= 400, tag + ' ' + mv + ': chạm thẻ → chế độ ngắm (chưa trừ mana)', ng);
        if (mv === 'twin') await p.screenshot({ path: path.join(SHOTS, tag + '-ngam-twin.png') });
        const pt = await p.evaluate((o) => { const B = G.ban[0], c = B.o[o], r = $('#cv').getBoundingClientRect(); return [r.left + c.x / W * r.width, r.top + c.y / H * r.height]; }, KB[mv].o);
        await p.mouse.click(pt[0], pt[1]);
      } else await p.click('#the-mv');
      await p.waitForTimeout(250);
      const dd = await p.evaluate(() => ({ k: (G.ban[0].chm || []).map(h => h.k).join(), ng: !!CHMU.ngam, x2: G.ban[0].mv.gia === MAVUONG[G.ban[0].mv.id].gia * 2 }));
      ok(dd.k && !dd.ng && dd.x2, tag + ' ' + mv + ': dùng được bằng chạm (hiệu lực ' + dd.k + ')', dd);
      await p.waitForTimeout(mv === 'hawk' ? 200 : 2600);
      await p.screenshot({ path: path.join(SHOTS, tag + '-vfx-' + mv + '.png') });
      if (KB[mv].o != null && w === 844) { // huỷ ngắm: chạm lại thẻ, không trừ mana
        await p.evaluate(() => { const B = G.ban[0]; B.mv.cd = 0; B.mana = 999; });
        await p.click('#the-mv'); await p.waitForTimeout(250); await p.click('#the-mv'); await p.waitForTimeout(250);
        const hu = await p.evaluate(() => ({ ng: !!CHMU.ngam, m: G.ban[0].mana }));
        ok(!hu.ng && hu.m >= 999, tag + ' ' + mv + ': chạm lại thẻ → huỷ ngắm, không trừ mana', hu);
      }
      ok(!p._errs.length, tag + ' ' + mv + ': không lỗi trang (trận)', p._errs);
      await p.context().close();
    }
    // bảng chọn + trang chi tiết (đã mở hết)
    p = await mo(br, w, h, 'index.html?notut=1', { turret_bo: JSON.stringify({ chon: deck5, mv: 'tech', che: 'solo' }), turret_kt: JSON.stringify({ v: 1, tk: { wave: 15 } }) });
    await p.evaluate(() => { HM.di('dk'); HM.moMVs(); }); await p.waitForTimeout(800);
    await p.screenshot({ path: path.join(SHOTS, tag + '-chon.png') });
    for (const mv of ['tech', 'twin', 'weaver']) {
      await p.evaluate((m) => { HM.dong(true); UP.moMV(m); }, mv); await p.waitForTimeout(900);
      const up = await p.evaluate(() => ({ b: UP.el.dataset.bac, ten: UP.el.querySelector('.up-ten').textContent, nut: UP.el.querySelector('.up-nut-chu').textContent }));
      ok(up.b === await p.evaluate((m) => mvBac(m), mv), tag + ' trang ' + mv + ': màu bậc ' + up.b + ' · nút "' + up.nut + '"', up);
      if (mv !== 'tech') await p.screenshot({ path: path.join(SHOTS, tag + '-trang-' + mv + '.png') });
    }
    ok(!p._errs.length, tag + ': không lỗi trang (menu)', p._errs);
    await p.context().close();
  }
  await br.close();
  console.log(loi ? '✗ ' + loi + ' lỗi' : '✓ CHỈ HUY MỚI: đạt');
  process.exit(loi ? 1 : 0);
})();
const MAVUONG_KHOA = { tech: 'tech', tide: 'luoi', twin: 'twin', hawk: 'thap', weaver: 'nexus' };
