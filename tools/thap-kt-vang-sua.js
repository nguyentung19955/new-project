// TURRET MERGE — kiểm SỬA 12 ỤN VÀNG CŨ THEO DCDW (docs/demo-hop-tuong/tuvan/tuong_vang/CHATGPT-PLAN.txt mục 4 + DCDW-LEGEND.md)
//  1 Werewolf: mỗi lần sinh/ghép = Thường hoặc THỨC TỈNH theo xác suất (30% LV9 → 39% LV15, trần 50%), không lớn dần; chỉ thức tỉnh luôn chí mạng
//  2 Rainbow: co-op/solo quái trên vệt nhận THÊM sát thương · PVP vệt trên đường ĐỐI THỦ, quái ở đó nhận ÍT hơn · vệt hết khi rời (cvT giảm)
//  3 Orbital: ghép Vệ Tinh → MỌI Vệ Tinh trên bàn thức tỉnh 23 s (LV15 29 s), bắn loạt bom (số bom theo sao); không còn Vệ Tinh → bắn phá dự phòng
//  4 Sync Cannon (Dana): mọi ụ Tấn công CÙNG SAO trên cả bàn +sát thương (không cần kề); PVP đối thủ −sát thương nhẹ
//  5 Railgun: chỉ HÀNG/CỘT ĐẦY Railgun (+200% / +150%), hàng dở dang & ụ khác loại không tính, ô đá không tính
//  6 Wall Projector: ghép → TƯỜNG VÀNG (6 s, nổ ×6) · 7 Scrap Forge: chữ "feed" · 8 Merge King: vàng theo xác suất ~10% · MK+MK +1★
//  9 Twin Maker: ~10% ụ sinh đôi +1★ (không quá 7★) · 10 Star Cannon: theo tổng ★ HIỆN TẠI (sao giảm → mất thưởng)
//  11 Evolver: chờ lâu hơn khi sao cao; 7★ bom XỊT (không đổi, không tác dụng); bị giảm sao → đếm lại; Copycat chép giữ y hệt · 12 Mirror Gate: không gắn nhãn Bari
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-vang-sua.js
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const LOI = [];
const ok = (dk, ten, chi) => { if (dk) console.log('  ✓ ' + ten); else { console.log('  ✗ ' + ten + (chi ? ' — ' + chi : '')); LOI.push(ten); } };

async function moTran(b, mode, deck) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); p.errs = [];
  p.on('pageerror', e => p.errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/WebSocket|ERR_CONNECTION_REFUSED|favicon/.test(m.text())) p.errs.push('console ' + m.text().slice(0, 200)); });
  await p.goto(BASE + '?mode=' + mode + '&deck=' + deck + '&deck2=canon,lien,set,bang,tia&wave=1&mana=0&notut=1', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length && typeof TAI !== 'undefined' && !TAI.cho, null, { timeout: 45000 });
  await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 }); await sleep(600);
  await p.evaluate(() => {
    window.__seed = (s) => { let x = s >>> 0; Math.random = () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; };
    window.__xoa = () => { G.quai = []; G.dan.length = 0; G.hu.length = 0; G.cho = 999; for (const B of G.ban) for (let i = 0; i < 15; i++) B.t[i] = null; UI.keo = null; UI.chonGhep = null; };
    window.__dat = (B, o, id, s) => { const T = sinhU(taoU(B, id, s, o)); T.vxA = null; T.goc = -Math.PI / 2; B.t[o] = T; return T; };
    G.dung = true; // dừng vòng game: chỉ chạy logic ta gọi
  });
  return { ctx, p };
}

(async () => {
  const b = await chromium.launch();
  const { ctx, p } = await moTran(b, 'solo', 'soi,orbital,dongbo,railgun,wallgen');
  const ev = (f, x) => p.evaluate(f, x);
  let r;

  console.log('— 1 Werewolf');
  r = await ev(() => {
    const B = G.ban[0], out = {}; __seed(99);
    for (const k of [0, 6]) { B.capThe = Object.assign({}, B.capThe, { soi: k }); let n = 0; for (let i = 0; i < 6000; i++) if (sinhU(taoU(B, 'soi', 1, 0)).thuc) n++; out['k' + k] = n / 6000; }
    out.cap = SKILLS.soi.tiLe({ capThe: { soi: 99 } });
    B.capThe.soi = 0; __xoa();
    const N = __dat(B, 0, 'soi', 7); N.thuc = false; const A = __dat(B, 1, 'soi', 1); A.thuc = true;
    tienHoaCap(B, N); tienHoaCap(B, A);
    out.n7 = { gd: N.gd, crit: !!SKILLS.soi.luonCrit(N) }; out.a1 = { gd: A.gd, crit: !!SKILLS.soi.luonCrit(A) };
    // ghép 2 Sói → kết quả Sói quay dạng mới (bộ bài chỉ có Sói)
    const deck = B.deck; B.deck = ['soi']; let th = 0, tong = 0;
    for (let i = 0; i < 400; i++) { __xoa(); __dat(B, 0, 'soi', 2).thuc = false; __dat(B, 1, 'soi', 2).thuc = false; const K = ghep(B, B.t[0], B.t[1]); if (K && K.id === 'soi') { tong++; if (K.thuc) th++; } }
    B.deck = deck; out.ghep = th / Math.max(1, tong); out.tong = tong;
    out.txt = TEXT.turret.soi.skill;
    return out;
  });
  ok(Math.abs(r.k0 - 0.30) < 0.025, 'Sói thức tỉnh ~30% ở LV9', String(r.k0));
  ok(Math.abs(r.k6 - 0.39) < 0.025, 'Sói thức tỉnh ~39% ở LV15 (+1.5%/cấp)', String(r.k6));
  ok(r.cap <= 0.5, 'trần 50%', String(r.cap));
  ok(r.n7.gd === 2 && !r.n7.crit, 'Sói THƯỜNG 7★ không lớn thành Alpha, không luôn chí mạng', JSON.stringify(r.n7));
  ok(r.a1.gd === 3 && r.a1.crit, 'Sói THỨC TỈNH 1★: dạng 3, luôn chí mạng', JSON.stringify(r.a1));
  ok(r.tong === 400 && Math.abs(r.ghep - 0.30) < 0.06, 'ghép ra Sói cũng quay thức tỉnh ~30%', JSON.stringify([r.ghep, r.tong]));
  ok(!/GROWS|Pup|Hunter|Alpha/.test(r.txt), 'chữ Sói không còn "lớn dần"', r.txt);

  console.log('— 2 Rainbow (solo = co-op)');
  r = await ev(() => {
    __xoa(); const B = G.ban[0]; G.wave = 3; const C = __dat(B, 7, 'cauvong', 3); C.nap = 1;
    const p0 = G.duong.findIndex(q => q.ban === 0), E = { uid: 9e6, id: 'bo', d: QUAI.bo, hp: 1e6, max: 1e6, p: p0, s: 200, x: 0, y: 0, goc: 0, cham: 0, chamT: 0, doc: 0, docT: 0, chan: 0, flash: 0, chet: false, khung: 0, tim: 1, vao: 1, bob: 0, keo: 0, yeu: 0, ban: 0 };
    [E.x, E.y] = viTri(G.duong[p0], 200); G.quai.push(E);
    SKILLS.cauvong.capNhat(G, B, C, 0.016);
    const o = G.hu.find(h => h.k === 'cauvong'); if (!o) return { loi: 'không vẽ vệt' };
    E.s = o.s0 + 20; [E.x, E.y] = viTri(G.duong[p0], E.s); HU.cauvong.cap(G, o);
    const v = HOTRO.vuln(E), cv = E.cvT;
    capNhatQuai(1.0); // rời vệt 1 s → hết
    return { pvp: o.pvp, v, cv, sau: E.cvT, k2: o.k2 };
  });
  ok(r && !r.pvp && r.v > 0.05 - 1e-9 && r.cv > 0, 'co-op/solo: quái trên vệt nhận THÊM sát thương', JSON.stringify(r));
  ok(r && !(r.sau > 0), 'vệt cầu vồng hết khi quái rời vệt (cvT giảm theo thời gian)', JSON.stringify(r));

  console.log('— 3 Orbital');
  r = await ev(() => {
    const B = G.ban[0], out = {}; __xoa(); G.wave = 3;
    const p0 = G.duong.findIndex(q => q.ban === 0);
    for (let i = 0; i < 4; i++) { const E = { uid: 9e6 + i, id: 'bo', d: QUAI.bo, hp: 1e7, max: 1e7, p: p0, s: 120 + i * 40, x: 0, y: 0, goc: 0, cham: 0, chamT: 0, doc: 0, docT: 0, chan: 0, flash: 0, chet: false, khung: 0, tim: 1, vao: 1, bob: 0, keo: 0, yeu: 0, ban: 0 }; [E.x, E.y] = viTri(G.duong[p0], E.s); G.quai.push(E); }
    const deck = B.deck; B.deck = ['canon']; B.capThe.orbital = 0;
    __dat(B, 0, 'orbital', 2); __dat(B, 1, 'orbital', 2); const X = __dat(B, 5, 'orbital', 3), Y = __dat(B, 9, 'orbital', 7);
    ghep(B, B.t[0], B.t[1]);
    out.thuc = [X.thucT, Y.thucT]; out.phao = B.phao;
    tienHoaCap(B, X); out.gd = X.gd;
    G.hu.length = 0; X.salvo = 0; SKILLS.orbital.capNhat(G, B, X, 0.016); out.bomX = G.hu.filter(h => h.k === 'vetinh').length;
    G.hu.length = 0; Y.salvo = 0; SKILLS.orbital.capNhat(G, B, Y, 0.016); out.bomY = G.hu.filter(h => h.k === 'vetinh').length;
    // LV15: 29 s
    B.capThe.orbital = 6; __dat(B, 0, 'orbital', 2); __dat(B, 1, 'orbital', 2); ghep(B, B.t[0], B.t[1]); out.lv15 = X.thucT;
    // hết giờ
    SKILLS.orbital.capNhat(G, B, X, 40); X.gd = null; tienHoaCap(B, X); out.het = [X.thucT, X.gd];
    // không còn Vệ Tinh nào: dự phòng
    __xoa(); B.capThe.orbital = 0; __dat(B, 0, 'orbital', 2); __dat(B, 1, 'orbital', 2); ghep(B, B.t[0], B.t[1]); out.duPhong = B.phao;
    B.deck = deck; B.phao = 0; G.quai = [];
    return out;
  });
  ok(r.thuc[0] === 23 && r.thuc[1] === 23 && !(r.phao > 0), 'ghép 2 Vệ Tinh → MỌI Vệ Tinh còn trên bàn thức tỉnh 23 s', JSON.stringify(r));
  ok(r.gd === 3, 'Vệ Tinh thức tỉnh dùng dạng 3', String(r.gd));
  ok(r.bomX === 4 && r.bomY === 7, 'loạt bom theo sao: 3★ 4 bom · 7★ 7 bom', JSON.stringify([r.bomX, r.bomY]));
  ok(r.lv15 === 29, 'cấp thẻ: LV15 thức tỉnh 29 s', String(r.lv15));
  ok(r.het[0] === 0 && r.het[1] !== 3, 'hết giờ → về dạng thường', JSON.stringify(r.het));
  ok(r.duPhong > 0, 'không còn Vệ Tinh nào → bắn phá dự phòng', String(r.duPhong));

  console.log('— 4 Sync Cannon (Dana)');
  r = await ev(() => {
    __xoa(); const B = G.ban[0];
    const S = __dat(B, 0, 'dongbo', 3), A = __dat(B, 14, 'canon', 3), C = __dat(B, 13, 'lien', 2), D = __dat(B, 1, 'tia', 3);
    for (const T of B.t) if (T) { T.buf.dmg = 0; T.nguon = []; }
    HOTRO.apDung(B, 0.016);
    return { xa: A.buf.dmg, lech: C.buf.dmg, ke: D.buf.dmg, v: SKILLS.dongbo.v(S), solo: SKILLS.dongbo.heSoDoiThu(B) };
  });
  ok(r.xa > 0.07 && Math.abs(r.xa - r.v) < 1e-9, 'ụ Tấn công CÙNG SAO ở xa (ô 14) vẫn nhận buff', JSON.stringify(r));
  ok(r.lech === 0, 'ụ khác sao không nhận', JSON.stringify(r));
  ok(Math.abs(r.ke - r.xa) < 1e-9, 'ụ kề cùng sao nhận như nhau (không cần kề)', JSON.stringify(r));
  ok(r.solo === 1, 'solo: không giảm sát thương', String(r.solo));

  console.log('— 5 Railgun');
  r = await ev(() => {
    const B = G.ban[0], buf = (T) => { T.buf.dmg = 0; T.buf.toc = 0; SKILLS.railgun.capNhat(G, B, T); return [+T.buf.dmg.toFixed(2), +T.buf.toc.toFixed(2)]; }, out = {};
    __xoa(); for (const o of [5, 6, 7, 8]) __dat(B, o, 'railgun', 2); __dat(B, 9, 'canon', 2); out.thieu = buf(B.t[5]);
    __xoa(); for (const o of [5, 6, 7, 8, 9]) __dat(B, o, 'railgun', 2); out.hang = buf(B.t[5]);
    __xoa(); for (const o of [2, 7, 12]) __dat(B, o, 'railgun', 2); out.cot = buf(B.t[7]);
    __xoa(); for (const o of [2, 7]) __dat(B, o, 'railgun', 2); __dat(B, 12, 'mimic', 2); out.cotMimic = buf(B.t[7]);
    __xoa(); for (const o of [5, 6, 7, 8, 9]) __dat(B, o, 'railgun', 2); B.t[9].st.da = true; out.da = buf(B.t[5]);
    __xoa(); for (const o of [5, 6]) __dat(B, o, 'railgun', 2); out.hai = buf(B.t[5]);
    return out;
  });
  ok(JSON.stringify(r.thieu) === '[0.65,0]', 'hàng 4 Salvo + 1 Cannon: thưởng dở dang 4/5 +65% (08/11)', JSON.stringify(r.thieu));
  ok(JSON.stringify(r.hang) === '[2,0]', 'hàng đầy Railgun: +200% sát thương', JSON.stringify(r.hang));
  ok(JSON.stringify(r.cot) === '[0,1.5]', 'cột đầy Railgun: +150% tốc bắn', JSON.stringify(r.cot));
  ok(JSON.stringify(r.cotMimic) === '[0,0.35]', 'cột có ụ khác loại (Mimic): Mimic không tính — 2/3 Salvo +35% (08/11)', JSON.stringify(r.cotMimic));
  ok(JSON.stringify(r.da) === '[0.65,0]', 'ô đá không tính (4/5 → +65%)', JSON.stringify(r.da));
  ok(JSON.stringify(r.hai) === '[0,0]', 'hàng dở dang: không có thưởng lẻ', JSON.stringify(r.hai));

  console.log('— 6 Wall Projector · 7 Scrap Forge · 12 Mirror Gate');
  r = await ev(() => {
    __xoa(); const B = G.ban[0]; G.wave = 3;
    const deck = B.deck; B.deck = ['canon'];
    __dat(B, 0, 'wallgen', 3); __dat(B, 1, 'wallgen', 3); const tt = dmgU(B.t[0]) * 7;
    ghep(B, B.t[0], B.t[1]);
    const w = G.hu.find(h => h.k === 'tuong' && h.vang);
    B.deck = deck;
    const R = (G.roster || []).find(x => x.id === 'guongcong') || {};
    // chạy hiệu ứng tường vàng tới khi nổ (không lỗi khi T = null)
    let loi = ''; try { if (w) { w.t = w.song; HU.tuong.cap(G, w); } } catch (e) { loi = e.message; }
    return { co: !!w, song: w && w.song, k: w && w.dmg / tt, no: w && w.no, loi, forge: TEXT.turret.loren.skill, gate: TEXT.turret.guongcong.skill, gateDc: R.dcdw || '' };
  });
  ok(r.co && r.song === 6 && r.k > 6 && r.no && !r.loi, 'ghép Máy Dựng Tường → TƯỜNG VÀNG 6 s, nổ > ×6 tường thường', JSON.stringify(r));
  ok(/SAME type/.test(r.forge) && /for good/i.test(r.forge), 'Twin Anvil (08/11): chữ rõ ghép cùng dạng + buff vĩnh viễn', r.forge);
  ok(!/Bari/i.test(r.gate + r.gateDc) && /original/i.test(r.gate + r.gateDc), 'Mirror Gate: ụ riêng, không gọi là Bari', r.gateDc + ' | ' + r.gate);

  console.log('— 8 Merge King · 9 Twin Maker');
  r = await ev(() => {
    const B = G.ban[0], out = {}; __seed(4242); B.capThe.vughep = 0; B.capThe.sinhdoi = 0;
    let v = 0; for (let i = 0; i < 6000; i++) if (sinhU(taoU(B, 'vughep', 1, 0)).vang) v++; out.vang = v / 6000;
    __xoa(); __dat(B, 0, 'vughep', 3).vang = false; __dat(B, 1, 'vughep', 3).vang = false; const K = ghep(B, B.t[0], B.t[1]); out.mk = K && [K.id, K.sao, !!B.t[0]];
    __xoa(); __dat(B, 0, 'vughep', 3).vang = true; __dat(B, 1, 'vughep', 3).vang = false; const K2 = ghep(B, B.t[0], B.t[1]); out.mkv = K2 && [K2.id, K2.sao, !!K2.vang];
    let cao = 0, n = 0, vuot = 0;
    for (let i = 0; i < 1500; i++) {
      const s = 1 + (i % 7 === 6 ? 5 : i % 5); __xoa(); __dat(B, 0, 'sinhdoi', s); __dat(B, 1, 'sinhdoi', s); const cu = new Set(); ghep(B, B.t[0], B.t[1]);
      const tw = B.t.find((T, o) => T && o !== 1); if (!tw) continue; n++; if (tw.sao === s + 1) cao++; if (tw.sao > 7 || tw.sao < s || tw.sao > s + 1) vuot++;
    }
    out.tw = cao / n; out.twN = n; out.vuot = vuot;
    return out;
  });
  ok(Math.abs(r.vang - 0.10) < 0.02, 'Merge King vàng ~10% (theo xác suất, không phải mọi lần)', String(r.vang));
  ok(r.mk && r.mk[0] === 'vughep' && r.mk[1] === 4 && !r.mk[2], 'Merge King + Merge King → Merge King +1★', JSON.stringify(r.mk));
  ok(r.mkv && r.mkv[0] === 'vughep' && r.mkv[1] === 5 && r.mkv[2], 'Merge King VÀNG kéo lên Merge King → +2★ (giữ vàng)', JSON.stringify(r.mkv));
  ok(r.twN > 1400 && Math.abs(r.tw - 0.10) < 0.025 && r.vuot === 0, 'Twin Maker: ~10% ụ sinh đôi +1★, không vượt 7★', JSON.stringify(r));

  console.log('— 10 Star Cannon · 11 Evolver');
  r = await ev(() => {
    const B = G.ban[0], out = {}; __xoa();
    const T = __dat(B, 0, 'ngoisao', 7); for (let o = 1; o <= 6; o++) __dat(B, o, 'mana', 7); __dat(B, 7, 'mana', 1); // 7×7 + 1 = 50 ★
    const buf = () => { T.buf.dmg = 0; T.buf.toc = 0; SKILLS.ngoisao.capNhat(G, B, T); return +T.buf.dmg.toFixed(2); };
    out.d50 = buf(); B.t[7] = null; out.d49 = buf(); __dat(B, 7, 'mana', 1); out.lai = buf();
    __xoa(); out.can = [1, 4, 6].map(s => SKILLS.tienhoa.can({ sao: s, id: 'tienhoa' }));
    // 08/11 TRỨNG: 7★ = trứng cháy (không nở dù bao lâu, không tự cho mana); chạm (chuDong) = +20 mana
    const E7 = __dat(B, 0, 'tienhoa', 7), m0 = B.mana; E7.egg = 999; SKILLS.tienhoa.capNhat(G, B, E7); SKILLS.tienhoa.capNhat(G, B, E7);
    out.e7 = [B.t[0] && B.t[0].id, B.t[0] && B.t[0].sao, B.mana - m0, SKILLS.tienhoa.chay(E7), E7.egg, E7.nap];
    haSao(B, E7, 'test'); SKILLS.tienhoa.capNhat(G, B, E7); out.ha = [E7.sao, SKILLS.tienhoa.chay(E7), B.t[0] === E7];
    SKILLS.tienhoa.chuDong(G, B, E7); out.tai = [B.mana - m0, !B.t[0]];
    __xoa(); const Cp = __dat(B, 0, 'saochep', 7), Ev = __dat(B, 1, 'tienhoa', 7); const N = SKILLS.saochep.ghepDB.lam(G, B, Cp, Ev);
    SKILLS.tienhoa.capNhat(G, B, N); out.chep = [N.id, !!N.banSao, SKILLS.tienhoa.chay(N)];
    __seed(7); let max = 0; for (let i = 0; i < 50; i++) { __xoa(); const E5 = __dat(B, 0, 'tienhoa', 5); E5.egg = 1e4; SKILLS.tienhoa.capNhat(G, B, E5); max = Math.max(max, B.t[0].sao); }
    out.e6 = max;
    return out;
  });
  ok(r.d50 > 3 && r.d49 < 0.01 && r.lai === r.d50, 'Star Cannon: mốc 50★ theo tổng HIỆN TẠI — tụt còn 49★ mất thưởng, lên lại có lại', JSON.stringify(r));
  ok(r.can[0] < r.can[1] && r.can[1] < r.can[2], 'Evolver: sao cao chờ lâu hơn', JSON.stringify(r.can));
  ok(r.e7[0] === 'tienhoa' && r.e7[1] === 7 && r.e7[2] === 0 && r.e7[3] && r.e7[4] === 0, 'Trứng 7★: trứng CHÁY — không nở, không 8★, đếm dừng, không tự cho mana', JSON.stringify(r.e7));
  ok(r.ha[0] === 6 && r.ha[1] && r.ha[2], 'Trứng cháy bị giảm sao: vẫn là trứng cháy (CHATGPT-SPEC B5-14)', JSON.stringify(r.ha));
  ok(r.tai[0] === 20 && r.tai[1], 'chạm trứng cháy: tái chế +20 mana, ô trống', JSON.stringify(r.tai));
  ok(r.chep[0] === 'tienhoa' && r.chep[1] && r.chep[2], 'Copycat chép trứng 7★ → cũng là trứng cháy', JSON.stringify(r.chep));
  ok(r.e6 === 6, 'Trứng 5★ nở: đúng +1★ (không còn +2 BREAKTHROUGH)', String(r.e6));
  ok(!p.errs.length, 'solo: không lỗi trang', p.errs.slice(0, 3).join(' | '));
  await ctx.close();

  console.log('— PVP: Rainbow trên đường đối thủ · Sync Cannon giảm sát thương đối thủ');
  const t2 = await moTran(b, 'pvp', 'cauvong,dongbo,canon,lien,set');
  r = await t2.p.evaluate(() => {
    __xoa(); const B = G.ban[0], D = G.ban[1]; G.wave = 3;
    const pD = G.duong.findIndex(q => q.ban === 1), E = { uid: 9e6, id: 'bo', d: QUAI.bo, hp: 1e6, max: 1e6, p: pD, s: 200, x: 0, y: 0, goc: 0, cham: 0, chamT: 0, doc: 0, docT: 0, chan: 0, flash: 0, chet: false, khung: 0, tim: 1, vao: 1, bob: 0, keo: 0, yeu: 0, ban: 1 };
    [E.x, E.y] = viTri(G.duong[pD], 200); G.quai.push(E);
    const C = __dat(B, 7, 'cauvong', 3); C.nap = 1; SKILLS.cauvong.capNhat(G, B, C, 0.016);
    const o = G.hu.find(h => h.k === 'cauvong'); if (!o) return { loi: 'không vẽ vệt' };
    E.s = o.s0 + 20; [E.x, E.y] = viTri(G.duong[pD], E.s); HU.cauvong.cap(G, o);
    const X = __dat(D, 3, 'canon', 2); X.buf.dmg = 0; const hp = E.hp; trung(E, 100, { T: X, crit: false, B: D, phu: true, im: true });
    const giam = hp - E.hp;
    // Sync Cannon của bàn 0 làm ụ bàn 1 −sát thương
    const d0 = dmgU(X); __dat(B, 0, 'dongbo', 4); const d1 = dmgU(X);
    return { pvp: o.pvp, duong: o.p.ban, cvP: E.cvPT > 0, cvT: !!(E.cvT > 0), giam, kp: o.kp, ti: d1 / d0 };
  });
  ok(r && r.pvp && r.duong === 1 && r.cvP && !r.cvT, 'PVP: vệt cầu vồng vẽ trên đường ĐỐI THỦ', JSON.stringify(r));
  ok(r && Math.abs(r.giam - 100 * (1 - r.kp)) < 1e-6 && r.kp >= 0.1, 'PVP: quái đối thủ trên vệt nhận ÍT sát thương hơn (trâu hơn)', JSON.stringify(r));
  ok(r && r.ti < 0.99 && r.ti > 0.9, 'PVP: Sync Cannon làm ụ đối thủ −sát thương nhẹ', String(r && r.ti));
  ok(!t2.p.errs.length, 'pvp: không lỗi trang', t2.p.errs.slice(0, 3).join(' | '));
  await t2.ctx.close();

  console.log('— trận thật ngắn (solo, 12 ụ vàng đã sửa) — không lỗi');
  const t3 = await moTran(b, 'solo', 'soi,orbital,wallgen,cauvong,dongbo');
  await t3.p.evaluate(() => {
    __xoa(); const B = G.ban[0];
    const ds = [[0, 'soi', 3], [1, 'orbital', 3], [2, 'orbital', 3], [3, 'orbital', 2], [4, 'wallgen', 2], [5, 'wallgen', 2], [6, 'cauvong', 3], [7, 'dongbo', 3], [8, 'railgun', 3], [9, 'tienhoa', 7], [10, 'ngoisao', 3], [11, 'sinhdoi', 2], [12, 'sinhdoi', 2], [13, 'vughep', 2], [14, 'canon', 3]];
    for (const [o, id, s] of ds) __dat(B, o, id, s);
    G.dung = false; G.cho = 0; G.tocDo = 2;
  });
  await sleep(3000);
  await t3.p.evaluate(() => { const B = G.ban[0]; ghep(B, B.t[1], B.t[2]); ghep(B, B.t[4], B.t[5]); ghep(B, B.t[11], B.t[12]); });
  await sleep(6000);
  ok(!t3.p.errs.length, 'trận: không lỗi trang sau ghép Vệ Tinh / Tường / Sinh Đôi', t3.p.errs.slice(0, 3).join(' | '));
  await t3.ctx.close();

  await b.close();
  console.log(LOI.length ? '✗ ' + LOI.length + ' lỗi' : '✓ XANH');
  process.exit(LOI.length ? 1 : 0);
})();
