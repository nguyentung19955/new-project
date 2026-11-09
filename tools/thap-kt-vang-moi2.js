// TURRET MERGE — kiểm 4 Ụ VÀNG MỚI ĐỢT 2 (thap/js/skills7.js): Blood Circuit · Hex Saboteur · Sanctum · Prism Thief
//  · Blood Circuit: kéo lên MỌI ụ (mọi sao/loại) · ra sao = max (không tự lên sao) · cùng sao +VAMP · khác sao −2 VAMP + xung · tất định
//  · Hex Saboteur: PVP −1★ (1★ → tê liệt, không xoá) · khiên / Mirror Gate chặn lúc trúng · hồi chung 8 s · CO-OP đồng đội +1★ (không bao giờ −)
//    · SOLO nguyền quái đầu · cùng hạt → cùng kết quả (online)
//  · Sanctum: xuất hiện → tẩy + khiên ô kề (5★: 8 ô) · Prism Thief: ghép cùng màu → COMBO, khác màu → không
//  · cấp thẻ (KY_NANG_CAP) · cờ online VAMP/COMBO · RANDOM bỏ ụ chưa có hình · AI dùng Blood Circuit khi kẹt bàn · trang ụ "now → next"
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-vang-moi2.js
//   SHOTS=thư mục (mặc định docs/demo-hop-tuong/tuvan/tuong_vang/dot2/; SHOTS=0: không chụp) — bộ sưu tập + dải khung SOLO / CO-OP / PVP
const { chromium } = require('playwright');
const fs = require('fs');
let sharp = null; try { sharp = require('sharp'); } catch (e) { }
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const SHOTS = process.env.SHOTS === '0' ? null : (process.env.SHOTS || 'docs/demo-hop-tuong/tuvan/tuong_vang/dot2/');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const LOI = [];
const ok = (dk, ten, chi) => { if (dk) console.log('  ✓ ' + ten); else { console.log('  ✗ ' + ten + (chi ? ' — ' + chi : '')); LOI.push(ten); } };
const MOI = ['mauhut', 'nguyenrua', 'thanhdia', 'bienmau'];

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: SHOTS ? 3 : 1, hasTouch: true, isMobile: true });
  const errs = [];
  const mo = async (q) => {
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push('pageerror ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/WebSocket|ERR_CONNECTION_REFUSED|favicon/.test(m.text())) errs.push('console ' + m.text().slice(0, 200)); });
    await p.goto(BASE + q, { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.roster && G.roster.length && typeof TAI !== 'undefined' && !TAI.cho, null, { timeout: 45000 });
    await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 }); await sleep(800);
    return p;
  };
  const khung = async (p, anh, ten, bi) => {
    if (!SHOTS) return;
    const bb = await p.evaluate((bi) => { const B = G.ban[bi], r = document.querySelector('#cv').getBoundingClientRect(); return [r.left + B.x / W * r.width, r.top + B.y / H * r.height, B.w / W * r.width, B.h / H * r.height]; }, bi || 0);
    const pad = 14, clip = { x: Math.max(0, bb[0] - pad), y: Math.max(0, bb[1] - pad - 30), width: Math.min(390 - Math.max(0, bb[0] - pad), bb[2] + pad * 2), height: bb[3] + pad * 2 + 30 };
    anh.push({ buf: await p.screenshot({ clip }), ten });
  };
  const dai = async (anh, file) => {
    if (!SHOTS || !sharp || !anh.length) return;
    fs.mkdirSync(SHOTS, { recursive: true });
    const m = await Promise.all(anh.map(x => sharp(x.buf).metadata())), w = Math.max(...m.map(x => x.width)), h = Math.max(...m.map(x => x.height)), gap = 18;
    await sharp({ create: { width: anh.length * w + (anh.length - 1) * gap, height: h, channels: 3, background: '#101418' } }).composite(anh.map((x, i) => ({ input: x.buf, left: i * (w + gap), top: 0 }))).png().toFile(SHOTS + file);
    console.log('    dải khung: ' + SHOTS + file + ' (' + anh.map(x => x.ten).join(' → ') + ')');
  };
  // dựng bàn bi: ds = [[o, id, sao, k]]  k: 'da' | 'bang' | 'khien'
  const DUNG = (ds, bi) => { // chạy trong trang
    G.quai = []; G.dan.length = 0; G.hu.length = 0; G.wave = Math.max(G.wave, 1); G.cho = 999;
    const B = G.ban[bi || 0]; for (let i = 0; i < 15; i++) B.t[i] = null;
    for (const [o, id, s, k] of ds) { const T = sinhU(taoU(B, id, s, o)); T.vxA = null; T.goc = -Math.PI / 2; if (k === 'da') T.st.da = true; if (k === 'bang') T.st.bang = 999; if (k === 'khien') T.khien = 1; B.t[o] = T; }
    UI.keo = null; UI.chonGhep = null; G.dung = false;
  };
  const buoc = (p, giay) => p.evaluate((g) => { G.dung = true; for (let t = 0; t < g; t += 1 / 30) capNhat(1 / 30); G.dung = false; }, giay);

  // ======================================================= SOLO (logic + Blood Circuit / Sanctum / Prism / Hex solo)
  let p = await mo('?mode=solo&deck=mauhut,nguyenrua,thanhdia,bienmau,canon&wave=3&mana=0&notut=1');
  await p.evaluate(`window.DUNG = ${DUNG.toString()}`);
  console.log('— SOLO');
  r = await p.evaluate(() => ['mauhut', 'nguyenrua', 'thanhdia', 'bienmau'].map(id => [id, !!SKILLS[id], G.rosterMap[id] && G.rosterMap[id].bac, THEBAI.the(id).lv, !!KY_NANG_CAP[id], TEXT.turret[id] && TEXT.turret[id].name]));
  ok(r.every(x => x[1] && x[2] === 'vang' && x[3] === 9 && (x[4] || x[0] === 'bienmau') && x[5]), '4 ụ: SKILLS + bậc vàng + thẻ LV9 + KY_NANG_CAP (Prism 08/11: trần cộng dồn riêng) + tên', JSON.stringify(r));
  // Blood Circuit
  // 08/11: Blood Circuit làm lại — ĐÁNH DẤU (không di chuyển) → nuốt → Máu; luật đầy đủ ở tools/thap-kt-vang-g2.js
  r = await p.evaluate(() => {
    DUNG([[0, 'mauhut', 2], [1, 'canon', 5], [2, 'mauhut', 3], [3, 'canon', 3, 'da'], [5, 'mauhut', 6], [6, 'bienmau', 7]]);
    const B = G.ban[0], out = {};
    out.hop = [hopLeGhep(B.t[0], B.t[1]), hopLeGhep(B.t[2], B.t[3]), hopLeGhep(B.t[5], B.t[6]), hopLeGhep(B.t[1], B.t[0])];
    ghep(B, B.t[0], B.t[1]); out.a = [B.t[0] && B.t[0].id, B.t[1] && B.t[1].sao, B.t[0] && B.t[0].mh && B.t[0].mh.o];
    return out;
  });
  ok(r.hop[0] && !r.hop[1] && !r.hop[2] && !r.hop[3], 'Blood Circuit: đánh dấu được ụ khác sao/loại; không ô đá, không 7★; chỉ ụ KÉO là Blood Circuit', JSON.stringify(r.hop));
  ok(r.a[0] === 'mauhut' && r.a[1] === 5 && r.a[2] === 1, 'Blood Circuit kéo lên ụ 5★: chỉ đánh dấu (2 ụ giữ nguyên chỗ, sao)', JSON.stringify(r.a));
  // cấp thẻ
  r = await p.evaluate(() => { const B = G.ban[0]; DUNG([[0, 'mauhut', 1], [1, 'nguyenrua', 1], [2, 'bienmau', 1], [3, 'thanhdia', 1]]); const k0 = [knThe(B, 'mauhut') / 100, SKILLS.nguyenrua.p(B.t[1]), SKILLS.bienmau.tran(B.t[2]), SKILLS.thanhdia.k(B.t[3])];
    B.capThe = Object.assign({}, B.capThe, { mauhut: 6, nguyenrua: 6, bienmau: 6, thanhdia: 6 }); const k6 = [knThe(B, 'mauhut') / 100, SKILLS.nguyenrua.p(B.t[1]), SKILLS.bienmau.tran(B.t[2]), SKILLS.thanhdia.k(B.t[3])];
    B.t[1].sao = 7; const p7 = SKILLS.nguyenrua.p(B.t[1]); B.capThe = {}; return { k0, k6, p7 }; });
  ok(r.k0[0] === 0.3 && r.k0[2] === 10 && r.k6[2] === 16 && +r.k0[1].toFixed(3) === 0.35 && Math.abs(r.p7 - 0.77) < 1e-9 && r.k6[3] > r.k0[3], 'cấp thẻ: Blood Rite 30%, Hex 35% (7★ 77%), Prism trần 10 → 16 (LV15), Sanctum tăng', JSON.stringify(r)); 
  // Sanctum
  r = await p.evaluate(() => {
    DUNG([[6, 'canon', 2, 'bang'], [8, 'canon', 2, 'da'], [2, 'lien', 2], [12, 'lien', 3], [3, 'canon', 2]]); const B = G.ban[0];
    B.t[2].st.kep = 4; const S = sinhU(taoU(B, 'thanhdia', 1, 7)); B.t[7] = S; capNhatBan(B, 0.02);
    const a = [6, 8, 2, 12].map(o => ({ o, bang: B.t[o].st.bang > 0, da: !!B.t[o].st.da, kep: B.t[o].st.kep > 0, khien: B.t[o].khien })), dm = B.t[12].buf.dmg, d3 = B.t[3].khien;
    DUNG([[2, 'lien', 2, 'bang'], [6, 'lien', 2]]); const S5 = sinhU(taoU(B, 'thanhdia', 5, 7)); B.t[7] = S5; capNhatBan(B, 0.02);
    return { a, dm, d3, cheo: B.t[2].st.bang > 0, k5: B.t[2].khien };
  });
  ok(r.a.every(x => !x.bang && !x.da && !x.kep && x.khien === 1), 'Sanctum xuất hiện: tẩy băng/đá/kẹp + khiên 1 lần cho 4 ô kề', JSON.stringify(r.a));
  ok(r.dm > 0.09 && r.d3 === 0, 'Sanctum: ụ Tấn công kề +sát thương; ô không kề không có khiên (1★)', JSON.stringify([r.dm, r.d3]));
  ok(!r.cheo && r.k5 === 1, 'Sanctum 5★: tẩy + khiên cả ô CHÉO', JSON.stringify(r));
  // Prism Thief
  r = await p.evaluate(() => { // 08/11 Prism Thief: màu cố định + HỢP THỂ (vuốt 4 màu)
    DUNG([[0, 'bienmau', 2, '', ], [1, 'bienmau', 2], [2, 'bienmau', 2], [3, 'bienmau', 2]]); const B = G.ban[0]; B.pmCd = 0;
    [0, 1, 2, 3].forEach(q => { B.t[q].pm = q; B.t[q].pms = 1; });
    const mau0 = B.t[0].pm; capNhatBan(B, 1.5); return { giu: B.t[0].pm === mau0, ok: SKILLS.bienmau.mach(B, [0, 1, 2, 3]), n: B.t[3] && B.t[3].pf };
  });
  ok(r.giu && r.ok && r.n === 1, 'Prism Thief: màu không đổi theo thời gian · vuốt 4 màu → HỢP THỂ (mặt nạ 4 màu)', JSON.stringify(r));
  // Hex solo
  r = await p.evaluate(() => { DUNG([[0, 'nguyenrua', 2], [1, 'nguyenrua', 2]]); const B = G.ban[0]; B.hexCd = 0; const E = sinhQuai('bo', 0, G.duong[0].len * 0.3, 1); E.vao = 1; E.hp = E.max = 1e9; ghep(B, B.t[0], B.t[1]); const c1 = G.hu.filter(o => o.k === 'hexBay').length; B.t[2] = sinhU(taoU(B, 'nguyenrua', 2, 2)); B.t[3] = sinhU(taoU(B, 'nguyenrua', 2, 3)); ghep(B, B.t[2], B.t[3]); return { c1, c2: G.hu.filter(o => o.k === 'hexBay').length, cd: B.hexCd - G.t }; });
  ok(r.c1 === 1 && r.cd > 7, 'Hex SOLO: ghép → 1 âm thoa bay, hồi chung 8 s', JSON.stringify(r));
  await buoc(p, 1.6);
  r = await p.evaluate(() => { const E = G.quai.find(E => !E.chet); return E ? { cham: E.cham, yw: E.ywT > 0 } : null; });
  ok(r && r.cham >= 0.3 && r.yw, 'Hex SOLO: quái đầu bị chậm 30% + yếu', JSON.stringify(r));
  // RANDOM / AI / cờ online / trang ụ
  r = await p.evaluate(() => { const cu = SK7.CHUA_ANH.has('mauhut'); SK7.CHUA_ANH.add('mauhut'); let co = 0; for (let i = 0; i < 300; i++) if (deckNgauNhien().includes('mauhut')) co++; if (!cu) SK7.CHUA_ANH.delete('mauhut'); return co; });
  ok(r === 0, 'RANDOM: ụ chưa có hình không vào bộ ngẫu nhiên', String(r));
  r = await p.evaluate(() => {
    const ds = [[0, 'mauhut', 2]]; const id = ['canon', 'lien', 'bang', 'tia', 'set', 'phun', 'doc'];
    for (let o = 1; o < 15; o++) ds.push([o, id[o % 7], 1 + Math.floor(o / 7)]);
    DUNG(ds); const B = G.ban[0]; B.ai = true; B.aiT = 0; const n0 = B.t.filter(Boolean).length; aiBan(B, 0.1); B.ai = false;
    return { n0, n1: B.t.filter(Boolean).length, con: !!B.t.find(T => T && T.id === 'mauhut') };
  });
  ok(r.n1 === r.n0 && r.con, 'AI: bàn đầy không cặp ghép → Blood Circuit ĐÁNH DẤU ụ sao thấp (08/11: nuốt sau vài giây)', JSON.stringify(r));
  r = await p.evaluate(() => { DUNG([[0, 'mauhut', 2], [1, 'bienmau', 2], [2, 'lien', 2]]); const B = G.ban[0]; const M = B.t[0], P = B.t[1]; M.mau = 4; P.pm = 3; P.pms = 2; ghep(B, M, B.t[2]);
    const f = [ONS.oTT(M)[2], ONS.oTT(P)[2]]; M.mau = 0; M.mh = null; P.pm = 0; P.pms = 0; ONS.datO(B, 0, ['mauhut', 2, f[0]]); ONS.datO(B, 1, ['bienmau', 2, f[1]]); return { f, mau: M.mau, mh: M.mh && M.mh.o, pm: P.pm, pms: P.pms }; });
  ok(r.mau === 4 && r.mh === 2 && r.pm === 3 && r.pms === 2, 'online: cờ ô mang Máu / dấu (Mạch Máu) và màu / cộng dồn (Prism), datO dựng lại đúng', JSON.stringify(r));

  // dải khung SOLO
  if (SHOTS) {
    let anh = [];
    await p.evaluate(() => { DUNG([[6, 'mauhut', 3], [7, 'canon', 3], [8, 'thanhdia', 4], [2, 'lien', 3, 'bang'], [12, 'bienmau', 4], [13, 'bienmau', 4], [11, 'nguyenrua', 3]]); G.ban[0].vamp = 4; G.cho = 999; for (let i = 0; i < 8; i++) { const E = sinhQuai('bo', 0, G.duong[0].len * (0.1 + i * 0.08), 3); E.vao = 1; } });
    await sleep(700); await khung(p, anh, '1 bàn: Blood Circuit 3★ · Sanctum · Prism ×2 · Hex');
    await p.evaluate(() => { const B = G.ban[0]; ghep(B, B.t[6], B.t[7]); }); await sleep(450); await khung(p, anh, '2 Blood Circuit hiến Cannon 3★ (+1 VAMP)');
    await sleep(900); await khung(p, anh, '3 ra ụ 3★ ngẫu nhiên');
    await p.evaluate(() => { const B = G.ban[0]; B.t[3] = sinhU(taoU(B, 'thanhdia', 2, 3)); B.t[3].goc = -Math.PI / 2; }); await sleep(250); await khung(p, anh, '4 Sanctum mới: tẩy băng + khiên');
    await p.evaluate(() => { const B = G.ban[0], a = B.t[12], c = B.t[13]; c.tuoi = a.tuoi + ((a.uid % 3) - (c.uid % 3)); ghep(B, a, c); }); await sleep(400); await khung(p, anh, '5 Prism cùng màu: COMBO');
    await dai(anh, 'dai-solo.png');
  }
  await p.close();

  // ======================================================= PVP (Hex Saboteur hit rival; shield / Mirror Gate)
  p = await mo('?mode=pvp&deck=nguyenrua,mauhut,thanhdia,bienmau,canon&deck2=canon,lien,guongcong,bang,tia&wave=3&mana=0&notut=1');
  await p.evaluate(`window.DUNG = ${DUNG.toString()}`);
  console.log('— PVP');
  r = await p.evaluate(() => {
    const B = G.ban[0], D = G.ban[1], out = { tru: 0, te: 0, mat: 0, hut: 0, lan: 0, xau: 0 };
    B.ai = false;
    for (let k = 0; k < 30; k++) {
      DUNG([[0, 'nguyenrua', 3], [1, 'nguyenrua', 3]], 0); DUNG([[k % 2 ? 4 : 7, 'canon', k % 2 ? 1 : 4]], 1); D.ai = false;
      B.hexCd = 0; B.hexN = k; const X = D.t.find(Boolean), s0 = X.sao;
      ghep(B, B.t[0], B.t[1]); G.dung = true; for (let t = 0; t < 1.6; t += 1 / 30) capNhat(1 / 30);
      const Y = D.t[X.o]; out.lan++;
      if (!Y) out.mat++; else if (Y.sao === s0 - 1) out.tru++; else if (Y.hexT > 0) out.te++; else if (Y.sao !== s0) out.xau++; else out.hut++;
    }
    // khiên chặn lúc trúng
    DUNG([[0, 'nguyenrua', 6], [1, 'nguyenrua', 6]], 0); DUNG([[7, 'canon', 5, 'khien']], 1); B.hexCd = 0;
    ghep(B, B.t[0], B.t[1]); for (let t = 0; t < 1.6; t += 1 / 30) capNhat(1 / 30); out.khien = [D.t[7].sao, D.t[7].khien];
    // Mirror Gate sẵn sàng → phản (ụ mình bị kẹp), ụ đối thủ giữ sao
    DUNG([[0, 'nguyenrua', 6], [1, 'nguyenrua', 6], [2, 'canon', 4]], 0); DUNG([[7, 'canon', 5], [8, 'guongcong', 3]], 1); D.t[8].nap = 1; B.hexCd = 0;
    const dk0 = B.deck; B.deck = ['canon']; ghep(B, B.t[0], B.t[1]); B.deck = dk0; /* ụ ra cố định (ra Sanctum thì nó tẩy luôn kẹp — kết quả phụ thuộc may rủi) */ for (let t = 0; t < 1.6; t += 1 / 30) capNhat(1 / 30); out.guong = [D.t[7].sao, D.t[8].nap, B.t.some(T => T && T.st.kep > 0)];
    // hồi chung: ghép lần 2 trong 8 s bị bỏ
    DUNG([[0, 'nguyenrua', 2], [1, 'nguyenrua', 2], [2, 'nguyenrua', 2], [3, 'nguyenrua', 2]], 0); DUNG([[7, 'canon', 5]], 1); B.hexCd = 0; G.hu.length = 0;
    ghep(B, B.t[0], B.t[1]); ghep(B, B.t[2], B.t[3]); out.cd = G.hu.filter(o => o.k === 'hexBay').length;
    G.dung = false; return out;
  });
  ok(r.mat === 0 && r.xau === 0, 'Hex PVP: không bao giờ xoá ụ / không đổi sao sai', JSON.stringify(r));
  ok(r.tru > 3 && r.te > 1 && r.hut > 3, 'Hex PVP 3★ (45%): có trúng −1★, có tê liệt 1★, có trượt', JSON.stringify(r));
  ok(r.khien[0] === 5 && r.khien[1] === 0, 'Hex PVP: khiên chặn lúc trúng (giữ sao, mất khiên)', JSON.stringify(r.khien));
  ok(r.guong[0] === 5 && r.guong[1] < 0.5 && r.guong[2], 'Hex PVP: Mirror Gate chặn + PHẢN (ụ mình bị kẹp)', JSON.stringify(r.guong));
  ok(r.cd === 1, 'Hex: hồi chung 8 s — ghép thứ 2 bị bỏ (tất định)', String(r.cd));
  // tất định: 2 lần cùng hạt → cùng đích, cùng kết quả
  r = await p.evaluate(() => { const B = G.ban[0], D = G.ban[1], ra = []; for (let k = 0; k < 2; k++) { DUNG([[0, 'nguyenrua', 4], [1, 'nguyenrua', 4]], 0); DUNG([[5, 'canon', 3], [6, 'lien', 4], [7, 'bang', 5], [8, 'tia', 2]], 1); B.hexCd = 0; B.hexN = 11; G.hu.length = 0; ghep(B, B.t[0], B.t[1]); const h = G.hu.find(o => o.k === 'hexBay'); ra.push(h.o + ':' + h.cuoc); } return ra; });
  ok(r[0] === r[1], 'Hex tất định: cùng hạt → cùng đích + cùng kết quả', JSON.stringify(r));
  if (SHOTS) {
    let anh = [];
    await p.evaluate(() => { G.dung = false; DUNG([[6, 'nguyenrua', 5], [7, 'nguyenrua', 5], [2, 'canon', 3]], 0); DUNG([[5, 'canon', 4], [6, 'lien', 5], [7, 'bang', 3], [8, 'tia', 4], [12, 'set', 2]], 1); G.ban[0].hexCd = 0; G.ban[0].hexN = 2; G.ban[1].ai = false; });
    await sleep(500); await khung(p, anh, '1 bàn mình: 2 Hex 5★', 0); await khung(p, anh, '1b bàn đối thủ', 1);
    await p.evaluate(() => { const B = G.ban[0]; ghep(B, B.t[6], B.t[7]); }); await sleep(800); await khung(p, anh, '2 âm thoa bay sang đối thủ', 1);
    await sleep(900); await khung(p, anh, '3 trúng: −1★ / tê liệt', 1);
    await dai(anh, 'dai-pvp-hex.png');
  }
  await p.close();

  // ======================================================= CO-OP (Hex: 09/11 thôi +1★ — ụ BẮN của đồng đội +50% tốc bắn 6 s theo xác suất; không bao giờ đổi sao)
  p = await mo('?mode=coop&deck=nguyenrua,mauhut,thanhdia,bienmau,canon&deck2=canon,lien,guongcong,bang,tia&wave=3&mana=0&notut=1');
  await p.evaluate(`window.DUNG = ${DUNG.toString()}`);
  console.log('— CO-OP');
  r = await p.evaluate(() => {
    const B = G.ban[0], D = G.ban[1], out = { len: 0, giu: 0, doiSao: 0 };
    for (let k = 0; k < 20; k++) {
      DUNG([[0, 'nguyenrua', 5], [1, 'nguyenrua', 5]], 0); DUNG([[5, 'canon', 3], [6, 'lien', 7]], 1); D.ai = false;
      D.t[5].tocT = 0; D.t[6].tocT = 0;
      B.hexCd = 0; B.hexN = k; ghep(B, B.t[0], B.t[1]); G.dung = true; for (let t = 0; t < 1.6; t += 1 / 30) capNhat(1 / 30);
      if (D.t[5].sao !== 3 || D.t[6].sao !== 7) out.doiSao++;
      if (D.t[5].tocT > 0 || D.t[6].tocT > 0) out.len++; else out.giu++;
    }
    G.dung = false; return out;
  });
  ok(r.doiSao === 0 && r.len > 3 && r.giu > 1, 'Hex CO-OP: ụ bắn của đồng đội +50% tốc bắn 6 s theo xác suất, không bao giờ đổi ★ (thôi +1★ 09/11)', JSON.stringify(r));
  if (SHOTS) {
    let anh = [];
    await p.evaluate(() => { DUNG([[6, 'nguyenrua', 6], [7, 'nguyenrua', 6], [8, 'thanhdia', 3]], 0); DUNG([[6, 'canon', 3]], 1); G.ban[0].hexCd = 0; G.ban[0].hexN = 1; G.ban[1].ai = false; });
    await sleep(500); await khung(p, anh, '1 2 Hex 6★ (80%)', 0); await khung(p, anh, '1b đồng đội: Cannon 3★', 1);
    await p.evaluate(() => { const B = G.ban[0]; ghep(B, B.t[6], B.t[7]); }); await sleep(800); await khung(p, anh, '2 âm thoa sang đồng đội', 1);
    await sleep(900); await khung(p, anh, '3 đồng đội +1★', 1);
    await dai(anh, 'dai-coop-hex.png');
  }
  await p.close();

  // ======================================================= bộ sưu tập + trang ụ (card LV now → next)
  p = await mo('?notut=1');
  r = await p.evaluate(() => {
    const out = {};
    for (const id of ['mauhut', 'nguyenrua', 'thanhdia', 'bienmau']) { const d = THEBAI.doc(); d.c[id] = { lv: 9, n: 0 }; UP.mo(id); const el = document.querySelector('.tb-cap-giua'); out[id] = el ? [...el.querySelectorAll('small:not(.tb-vi)')].map(x => x.textContent).join(' · ') : ''; try { UP.dong && UP.dong(); } catch (e) { } }
    return out;
  });
  ok(/Devour time 0% → [-−]4%/.test(r.mauhut) && /Hex 35% → 37%/.test(r.nguyenrua) && /\+23% → \+23\.9%/.test(r.thanhdia) && r.bienmau !== undefined, 'trang ụ: hàng CARD LV "now → next" cho 4 ụ', JSON.stringify(r));
  if (SHOTS) {
    await p.evaluate(() => { const b = document.querySelector('[data-act="hm-bst"]'); if (b) b.click(); });
    await sleep(1200);
    try { await p.locator('text=SKIP TUTORIAL').first().click({ timeout: 2000 }); await sleep(1000); } catch (e) { }
    await p.evaluate(() => { const c = document.querySelector('#chon-luoi [data-id="mauhut"]'); if (c) c.scrollIntoView({ block: 'center' }); });
    await sleep(900); fs.mkdirSync(SHOTS, { recursive: true }); await p.screenshot({ path: SHOTS + 'bosuutap.png' });
    for (const id of ['mauhut', 'nguyenrua', 'thanhdia', 'bienmau']) { await p.evaluate((id) => { UP.mo(id); }, id); await sleep(900); await p.screenshot({ path: SHOTS + 'trang_' + id + '.png' }); await p.evaluate(() => { try { UP.dong && UP.dong(); } catch (e) { } }); await sleep(300); }
  }
  r = await p.evaluate(() => ['mauhut', 'nguyenrua', 'thanhdia', 'bienmau'].map(id => !!document.querySelector('#chon-luoi [data-id="' + id + '"]')));
  ok(r.every(Boolean), 'bộ sưu tập: có thẻ 4 ụ mới', JSON.stringify(r));
  await p.evaluate(() => { localStorage.removeItem('turret_the'); });
  ok(!errs.length, 'không lỗi trang', errs.slice(0, 3).join(' | '));
  await b.close();
  console.log(LOI.length ? '✗ ' + LOI.length + ' lỗi' : '✓ XANH');
  process.exit(LOI.length ? 1 : 0);
})();
