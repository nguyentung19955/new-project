// TURRET MERGE — kiểm CỘNG HƯỞNG KỸ NĂNG ĐẶC BIỆT × NHAU (rà soát toàn bộ, docs/demo-hop-tuong/tuvan/conghuong2/BANG.md)
//  · Copycat giữ DẠNG ụ gốc (Merge King vàng, Sói thức tỉnh — DCDW Shamash chép Werewolf thức tỉnh) + buff trên thân Copycat (Aurora, Ép Xung)
//  · ô ĐÁ không tính bingo Railgun / chuỗi Chain Link · Teleporter hoàn thành bingo
//  · Star Breaker: bùng tốc chỉ khi GHÉP THẬT (ghép thường / Merge King), không khi Copycat / Overclock
//  · online: ghép đặc biệt trên bàn con rối (Teleporter / Copycat / Overclock / Merge King lên Pandora) đúng trạng thái 2 ô, không chạy kỹ năng khi ghép thừa;
//    Pandora quay đúng phép máy bạn; ảnh chụp bàn giữ cờ (đá / bản sao / ép xung / dạng); 'tr' mang dạng · bàn con rối: Hộp Bí Ẩn / Tiến Hoá chờ ảnh chụp
//  · Mad Crown biến ụ: chạy hook sinh bằng RNG trùm (tất định)
//  · kéo chạm thật 390×844 + dải khung → SHOTS (mặc định docs/demo-hop-tuong/tuvan/conghuong2/)
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-conghuong2.js   (SHOTS=0: không chụp)
const { chromium } = require('playwright');
const fs = require('fs');
let sharp = null; try { sharp = require('sharp'); } catch (e) { }
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const SHOTS = process.env.SHOTS === '0' ? null : (process.env.SHOTS || 'docs/demo-hop-tuong/tuvan/conghuong2/');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const LOI = [];
const ok = (dk, ten, chi) => { if (dk) console.log('  ✓ ' + ten); else { console.log('  ✗ ' + ten + (chi ? ' — ' + chi : '')); LOI.push(ten); } };

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: SHOTS ? 3 : 1, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/WebSocket|ERR_CONNECTION_REFUSED|favicon/.test(m.text())) errs.push('console ' + m.text().slice(0, 200)); });
  await p.goto(BASE + '?mode=solo&deck=vughep,dichchuyen,saochep,railgun,soi&wave=1&mana=0&notut=1', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length && typeof TAI !== 'undefined' && !TAI.cho, null, { timeout: 45000 });
  await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 }); await sleep(800);

  // dựng bàn: ds = [[o, id, sao, 'da'|'bang'|'' , vang]]
  const dung = (ds) => p.evaluate((ds) => {
    try { localStorage.setItem('thap_kg_meo', '9'); } catch (e) { }
    G.quai = []; G.dan.length = 0; G.wave = Math.max(G.wave, 1); G.cho = 999;
    for (const B of G.ban) for (let i = 0; i < 15; i++) B.t[i] = null;
    const B = G.ban[0];
    for (const [o, id, s, k, v] of ds) { const T = sinhU(taoU(B, id, s, o)); T.vxA = null; T.goc = -Math.PI / 2; if (k === 'da') T.st.da = true; if (k === 'bang') T.st.bang = 999; if (id === 'vughep') T.vang = !!v; if (id === 'soi') T.thuc = !!v; B.t[o] = T; }
    UI.keo = null; UI.chonGhep = null; G.dung = false;
  }, ds);
  const o = (i) => p.evaluate((i) => { const T = G.ban[0].t[i]; return T ? { id: T.id, sao: T.sao, da: !!T.st.da, bang: T.st.bang > 0 } : null; }, i);
  const hop = (a, c) => p.evaluate(([a, c]) => hopLeGhep(G.ban[0].t[a], G.ban[0].t[c]), [a, c]);
  const ghepO = (a, c) => p.evaluate(([a, c]) => { const B = G.ban[0]; return !!ghep(B, B.t[a], B.t[c]); }, [a, c]);
  const dem = () => p.evaluate(() => G.ban[0].t.filter(Boolean).length);

  const ev = (f, x) => p.evaluate(f, x);
  console.log('— luật (logic)');
  // 1 Copycat giữ dạng
  let r = await ev(() => {
    const B = G.ban[0], st = (T) => T && { id: T.id, vang: !!T.vang, thuc: !!T.thuc, bs: !!T.banSao, au: T.aurora > 0, ep: T.epxung || 0 };
    const lam = (id, f, fa) => { for (let i = 0; i < 15; i++) B.t[i] = null; const a = sinhU(taoU(B, 'saochep', 3, 0)); Object.assign(a, fa || {}); const X = sinhU(taoU(B, id, 3, 1)); Object.assign(X, f); B.t[0] = a; B.t[1] = X; ghep(B, a, X); return st(B.t[0]); };
    const n = (id, f) => { let k = 0; for (let i = 0; i < 12; i++) { const s = lam(id, f); if (s.vang || s.thuc) k++; } return k; };
    return { g: n('vughep', { vang: true }), g0: n('vughep', { vang: false }), w: n('soi', { thuc: true }), w0: n('soi', { thuc: false }), au: lam('canon', {}, { aurora: 8, epxung: 0.65 }) };
  });
  ok(r.g === 12 && r.g0 === 0, 'Copycat chép Merge King: giữ đúng vàng / không vàng', JSON.stringify(r));
  ok(r.w === 12 && r.w0 === 0, 'Copycat chép Sói: giữ đúng thức tỉnh (DCDW: Shamash chép Werewolf thức tỉnh)', JSON.stringify(r));
  ok(r.au && r.au.bs && r.au.au && r.au.ep === 0.65, 'Copycat có buff Aurora + Ép Xung → bản sao giữ buff', JSON.stringify(r.au));
  // 2 đá không tính bingo / chuỗi; Teleporter hoàn thành bingo
  await dung([[0, 'railgun', 2], [1, 'railgun', 2], [2, 'railgun', 2, 'da'], [3, 'railgun', 2], [4, 'railgun', 2]]);
  r = await ev(() => SKILLS.railgun.bingo(G.ban[0], G.ban[0].t[0]));
  ok(r.ngang === 4, 'Railgun: ô đá không tính vào bingo hàng', JSON.stringify(r));
  await dung([[0, 'lienket', 2], [1, 'lienket', 2, 'da'], [2, 'lienket', 2]]);
  r = await ev(() => SKILLS.lienket.nhom(G.ban[0], G.ban[0].t[0]));
  ok(r === 1, 'Chain Link: ô đá cắt chuỗi', 'chuỗi ' + r);
  await dung([[0, 'railgun', 2], [1, 'railgun', 2], [2, 'railgun', 2], [3, 'railgun', 2], [9, 'railgun', 3], [4, 'dichchuyen', 3]]);
  await ghepO(4, 9); r = await ev(() => SKILLS.railgun.bingo(G.ban[0], G.ban[0].t[0]));
  ok(r.ngang === 5, 'Teleporter đổi chỗ → đủ hàng bingo Railgun', JSON.stringify(r));
  // 3 Star Breaker: bùng tốc chỉ khi ghép thật
  const surge = async (ds, a, c, o2) => { await dung(ds); await ghepO(a, c); return ev((o) => { const T = G.ban[0].t[o]; return !!(T && T.tocT > 0); }, o2); };
  ok(!(await surge([[6, 'hasao', 3], [7, 'canon', 2], [8, 'saochep', 2]], 8, 7, 7)), 'Star Breaker: Copycat chép ụ cạnh nó → KHÔNG bùng tốc (không phải ghép)');
  ok(!(await surge([[6, 'hasao', 3], [7, 'canon', 2], [8, 'epxung', 2]], 8, 7, 7)), 'Star Breaker: Overclock lên ụ cạnh nó → KHÔNG bùng tốc');
  ok(await surge([[6, 'hasao', 3], [7, 'canon', 2], [8, 'vughep', 2]], 8, 7, 7), 'Star Breaker: Merge King nâng sao ụ cạnh nó → bùng tốc (đối chứng)');
  // 4 đối chứng giữ nguyên: Twin + Mimic → 1 ụ thêm; Mimic + Combo đếm, Merge King lên Combo không đếm
  await dung([[0, 'sinhdoi', 2], [1, 'mimic', 2]]); await ghepO(0, 1); await sleep(100);
  ok((await dem()) === 2, 'Twin Maker + Mimic: đúng 1 ụ sinh đôi');
  r = await ev(() => { const B = G.ban[0]; B.combo = 0; for (let i = 0; i < 15; i++) B.t[i] = null; B.t[0] = taoU(B, 'combo', 2, 0); B.t[1] = taoU(B, 'mimic', 2, 1); ghep(B, B.t[0], B.t[1]);
    for (let i = 0; i < 15; i++) B.t[i] = null; B.t[0] = taoU(B, 'vughep', 2, 0); B.t[1] = taoU(B, 'combo', 2, 1); ghep(B, B.t[0], B.t[1]); return B.combo; });
  ok(r === 1, 'COMBO: Mimic + Combo đếm, Merge King lên Combo không đếm', 'combo ' + r);
  // 5 Mad Crown: biến ụ có chạy hook sinh, tất định theo RNG trùm
  r = await ev(() => {
    const B = G.ban[0]; const deck = B.deck; B.deck = ['vughep']; const kq = [];
    for (let k = 0; k < 2; k++) { for (let i = 0; i < 15; i++) B.t[i] = null; const T = taoU(B, 'canon', 3, 2); B.t[2] = T; B.khien = 0;
      const E = { trum: 'mad_crown', x: 100, y: 100, bao: { muc: [T.uid], muc2: [] }, rng: rngHat(4242) }; thucHienChieu(E, B); const N = B.t[2]; kq.push(N && N.id + ':' + typeof N.vang + ':' + N.vang); }
    B.deck = deck; return kq;
  });
  ok(r[0] === r[1] && /vughep:boolean/.test(r[0]), 'Mad Crown biến ra Merge King: có quay vàng (hook sinh), 2 lần cùng RNG ra như nhau', JSON.stringify(r));
  // 6 online
  r = await ev(() => {
    if (typeof ONS === 'undefined' || !ONS.apGhep) return null;
    const B1 = G.ban[0], R = {}, clr = () => { for (let i = 0; i < 15; i++) B1.t[i] = null; }, o = (i) => { const T = B1.t[i]; return T ? T.id + T.sao + ONS.oTT(T)[2].replace(/h\d+;n\d+;/g, "") /* bỏ trường mũi tên+số của Pháo La Bàn (co-che-moi) — kiểm riêng ở chỗ khác */ : '-'; };
    const pd = () => G.hu.filter(h => h.k === 'pandora').length;
    clr(); B1.t[0] = taoU(B1, 'dichchuyen', 2, 0); B1.t[7] = taoU(B1, 'canon', 2, 7); B1.t[7].st.da = true;
    ONS.apGhep(B1, { a: 0, b: 7, id: 'dichchuyen', s: 2, giuA: 1, db: 1, sa: ['canon', 2, 'S'], sb: ['dichchuyen', 2, ''] }); R.tp = o(0) + ' ' + o(7);
    clr(); B1.t[0] = taoU(B1, 'saochep', 3, 0); B1.t[1] = taoU(B1, 'soi', 3, 1); B1.t[1].thuc = true;
    ONS.apGhep(B1, { a: 0, b: 1, id: 'soi', s: 3, giuA: 1, db: 1, sa: ['soi', 3, 'wc'], sb: ['soi', 3, 'w'] }); R.cc = o(0) + ' ' + o(1);
    clr(); B1.t[0] = taoU(B1, 'vughep', 3, 0); B1.t[1] = taoU(B1, 'pandora', 3, 1); let n0 = pd();
    ONS.apGhep(B1, { a: 0, b: 1, id: 'pandora', s: 4, giuA: 0, db: 1, sa: 0, sb: ['pandora', 4, ''] }); R.mk = o(0) + ' ' + o(1) + ' quay' + (pd() - n0);
    clr(); B1.t[0] = taoU(B1, 'epxung', 3, 0); B1.t[1] = taoU(B1, 'canon', 3, 1);
    ONS.apGhep(B1, { a: 0, b: 1, id: 'canon', s: 3, giuA: 0, db: 1, sa: 0, sb: ['canon', 3, 'e65;'] }); R.oc = o(0) + ' ' + o(1);
    clr(); B1.t[0] = taoU(B1, 'pandora', 2, 0); B1.t[1] = taoU(B1, 'pandora', 2, 1);
    ONS.apGhep(B1, { a: 0, b: 1, id: 'canon', s: 3, giuA: 0, pd: [4] }); const h = G.hu.filter(h => h.k === 'pandora').pop(); R.pd = h ? h.chon.join() : '';
    clr(); B1.t[3] = taoU(B1, 'canon', 2, 3); B1.t[3].st.da = true; B1.t[3].banSao = true;
    const c = ONS.oCua(B1); c[3] = 'canon:3'; ONS.apAnh(B1, { c, h: ONS.bam(c), f: c.map((x, i) => i === 3 ? 'cS' : '') }, false); R.snap = o(3);
    clr(); ONS.apTrieu(B1, { o: 5, id: 'soi', s: 1, f: 1, th: 1 }); R.tr = o(5);
    // bàn con rối: Hộp Bí Ẩn đầy giờ → chờ ảnh chụp (không tự quay)
    clr(); const H = taoU(B1, 'hopbi', 2, 4); H.tuoi = 999; B1.t[4] = H; const on = ONS.on; B1.net = true; ONS.on = true;
    try { SKILLS.hopbi.capNhat(G, B1, H, 0.1); } finally { ONS.on = on; B1.net = false; } R.box = o(4);
    G.hu = G.hu.filter(h => h.k !== 'pandora');
    return R;
  });
  ok(r && r.tp === 'canon2S dichchuyen2', 'online: Teleporter trên bàn con rối đổi chỗ đúng (không mất ụ đá)', JSON.stringify(r && r.tp));
  ok(r && r.cc === 'soi3wc soi3w', 'online: Copycat trên bàn con rối = bản sao Sói thức tỉnh, giữ ụ gốc', JSON.stringify(r && r.cc));
  ok(r && r.mk === '- pandora4 quay0', 'online: Merge King lên Pandora (con rối) → +1★, KHÔNG quay hộp thừa', JSON.stringify(r && r.mk));
  ok(r && r.oc === '- canon3e65;', 'online: Overclock (con rối) → ụ giữ nguyên, +65% ép xung', JSON.stringify(r && r.oc));
  ok(r && r.pd === '4', 'online: Pandora con rối mở đúng phép máy bạn quay', JSON.stringify(r && r.pd));
  ok(r && r.snap === 'canon3cS', 'online: ảnh chụp lệch sao → chỉ sửa sao, giữ cờ đá + bản sao', JSON.stringify(r && r.snap));
  ok(r && r.tr === 'soi1w', "online: 'tr' mang dạng Sói thức tỉnh", JSON.stringify(r && r.tr));
  ok(r && r.box === 'hopbi2', 'online: Hộp Bí Ẩn trên bàn con rối chờ ảnh chụp (không tự mở ra ụ khác)', JSON.stringify(r && r.box));

  // kéo chạm thật + dải khung
  console.log('— kéo chạm (390×844)');
  const cdp = await ctx.newCDPSession(p);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' || type === 'touchCancel' ? [] : [{ x, y, id: 1 }] });
  const pos = (i) => p.evaluate((i) => { const B = G.ban[0], c = B.o[i], r = document.querySelector('#cv').getBoundingClientRect(); return [r.left + c.x / W * r.width, r.top + c.y / H * r.height, Math.min(B.cw, B.ch) * 0.6 / H * r.height]; }, i);
  const khung = async (anh, ten) => {
    if (!SHOTS) return;
    const bb = await p.evaluate(() => { const B = G.ban[0], r = document.querySelector('#cv').getBoundingClientRect(); const x0 = r.left + B.x / W * r.width, y0 = r.top + B.y / H * r.height; return [x0, y0, B.w / W * r.width, B.h / H * r.height]; });
    const pad = 14, clip = { x: Math.max(0, bb[0] - pad), y: Math.max(0, bb[1] - pad - 30), width: Math.min(390, bb[2] + pad * 2), height: bb[3] + pad * 2 + 30 };
    anh.push({ buf: await p.screenshot({ clip }), ten });
  };
  const dai = async (anh, file) => {
    if (!SHOTS || !sharp || !anh.length) return;
    fs.mkdirSync(SHOTS, { recursive: true });
    const m = await Promise.all(anh.map(x => sharp(x.buf).metadata())), w = m[0].width, h = m[0].height, gap = 18;
    const W2 = anh.length * w + (anh.length - 1) * gap;
    await sharp({ create: { width: W2, height: h, channels: 3, background: '#101418' } }).composite(anh.map((x, i) => ({ input: x.buf, left: i * (w + gap), top: 0 }))).png().toFile(SHOTS + file);
    console.log('    dải khung: ' + SHOTS + file + ' (' + anh.map(x => x.ten).join(' → ') + ')');
  };
  const keo = async (a, c, anh, tenGiua) => {
    const [x0, y0] = await pos(a), [x1, y1, lech] = await pos(c);
    await touch('touchStart', x0, y0);
    for (let i = 1; i <= 8; i++) { await touch('touchMove', x0 + (x1 - x0) * i / 8, y0 + (y1 + lech - y0) * i / 8); await sleep(25); }
    await sleep(220); if (anh) await khung(anh, tenGiua);
    const sang = await p.evaluate((c) => { const k = UI.keo; const B = G.ban[0]; return !!(k && k.T && hopLeGhep(k.T, B.t[c])); }, c);
    await touch('touchEnd', x1, y1 + lech); await sleep(80);
    return sang;
  };
  await p.evaluate(() => { G.tocDo = 1; });
  // A: Copycat chép Sói thức tỉnh
  await dung([[6, 'saochep', 3], [8, 'soi', 3, '', 1], [2, 'canon', 2], [12, 'lien', 1]]);
  let anh = []; await sleep(300); await khung(anh, '1 Copycat 3★ + Sói thức tỉnh 3★');
  ok(await keo(6, 8, anh, '2 cầm Copycat lên Sói'), 'kéo Copycat: ô Sói cùng sao sáng');
  await sleep(1000); await khung(anh, '3 bản sao Sói thức tỉnh');
  r = await o(6); let r2 = await ev(() => { const T = G.ban[0].t[6]; return T && { thuc: !!T.thuc, bs: !!T.banSao }; });
  ok(r && r.id === 'soi' && r2.thuc && r2.bs, 'kéo thật: bản sao Sói thức tỉnh', JSON.stringify([r, r2]));
  await dai(anh, 'dai-copycat-soi-thuctinh.png');
  // B: Teleporter đưa Railgun vào hàng → bingo
  await dung([[5, 'railgun', 2], [6, 'railgun', 2], [7, 'railgun', 2], [8, 'railgun', 2], [14, 'railgun', 3], [9, 'dichchuyen', 3]]);
  anh = []; await sleep(300); await khung(anh, '1 hàng giữa 4/5 Railgun');
  ok(await keo(9, 14, anh, '2 Teleporter lên Railgun 3★'), 'kéo Teleporter: Railgun cùng sao sáng');
  await sleep(1000); await khung(anh, '3 đủ hàng 5/5 BINGO');
  r = await ev(() => SKILLS.railgun.bingo(G.ban[0], G.ban[0].t[5]));
  ok(r.ngang === 5, 'kéo thật: Teleporter hoàn thành bingo', JSON.stringify(r));
  await dai(anh, 'dai-teleporter-bingo.png');
  // C: đá phá bingo (Janus) — hàng 5 Railgun có 1 ô đá → 4/5
  await dung([[5, 'railgun', 2], [6, 'railgun', 2], [7, 'railgun', 2, 'da'], [8, 'railgun', 2], [9, 'railgun', 2], [1, 'vughep', 2]]);
  anh = []; await sleep(300); await khung(anh, '1 hàng 5 Railgun, 1 ô ĐÁ → 4/5');
  r = await ev(() => SKILLS.railgun.bingo(G.ban[0], G.ban[0].t[5]));
  ok(r.ngang === 4, 'đá giữa hàng: bingo 4/5', JSON.stringify(r));
  ok(await keo(1, 7, anh, '2 Merge King lên ô đá'), 'kéo Merge King: ô đá Railgun sáng');
  await sleep(1000); await khung(anh, '3 đá 3★ — vẫn đá, vẫn 4/5');
  await dai(anh, 'dai-da-pha-bingo.png');
  // D: Copycat chép Merge King VÀNG → bản sao vàng nâng +2★
  await dung([[6, 'saochep', 2], [7, 'vughep', 2, '', 1], [11, 'canon', 2], [3, 'lien', 1]]);
  anh = []; await sleep(300); await khung(anh, '1 Copycat 2★ + Merge King VÀNG 2★');
  await keo(6, 7, anh, '2 Copycat lên MK vàng'); await sleep(900); await khung(anh, '3 bản sao MK vàng');
  r2 = await ev(() => { const T = G.ban[0].t[6]; return T && { id: T.id, vang: !!T.vang, bs: !!T.banSao }; });
  ok(r2 && r2.id === 'vughep' && r2.vang && r2.bs, 'kéo thật: bản sao Merge King vàng', JSON.stringify(r2));
  ok(await keo(6, 11, anh, '4 bản sao MK lên Pháo 2★'), 'kéo bản sao MK: Pháo cùng sao sáng');
  await sleep(900); await khung(anh, '5 Pháo 4★ (+2★)');
  r = await o(11); ok(r && r.id === 'canon' && r.sao === 4, 'kéo thật: bản sao MK vàng nâng +2★', JSON.stringify(r));
  await dai(anh, 'dai-copycat-mk-vang.png');
  // E: Star Breaker — Copycat cạnh nó không bùng, Merge King bùng
  await dung([[7, 'hasao', 3], [6, 'canon', 2], [11, 'saochep', 2], [8, 'set', 2], [13, 'vughep', 2]]);
  anh = []; await sleep(300); await khung(anh, '1 Star Breaker giữa');
  await keo(11, 6, anh, '2 Copycat chép Pháo cạnh SB'); await sleep(900); await khung(anh, '3 không bùng tốc');
  const tt = await ev(() => [G.ban[0].t[6], G.ban[0].t[11]].map(T => T && T.tocT > 0));
  await keo(13, 8, anh, '4 Merge King lên Tesla cạnh SB'); await sleep(900); await khung(anh, '5 Tesla 3★ bùng tốc');
  const t8 = await ev(() => G.ban[0].t[8] && G.ban[0].t[8].tocT > 0);
  ok(!tt[0] && !tt[1] && t8, 'kéo thật: Star Breaker chỉ bùng với ghép thật', JSON.stringify([tt, t8]));
  await dai(anh, 'dai-starbreaker-ghep-that.png');

  ok(!errs.length, 'không lỗi trang', errs.slice(0, 3).join(' | '));
  await b.close();
  console.log(LOI.length ? 'TRƯỢT cộng hưởng 2: ' + LOI.length + ' lỗi' : 'XANH cộng hưởng 2');
  process.exit(LOI.length ? 1 : 0);
})().catch(e => { console.log('✗ ' + (e.stack || e)); process.exit(1); });
