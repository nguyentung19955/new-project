// TURRET MERGE — kiểm CỘNG HƯỞNG KỸ NĂNG với ô ĐÁ / BĂNG (luật DCDW, docs/demo-hop-tuong/tuvan/conghuong/BANG.md)
//  · Merge King (khoẻ) lên ô đá cùng sao → ô đá +1★ (vẫn đá); bản vàng +2★; MK lên MK đá; MK lên ô băng → +1★ vẫn băng
//  · đá + đá cùng sao → khối ĐÁ +1★ (không chạy kỹ năng KHI GHÉP của 2 cục đá: Twin Maker đá không gọi ụ)
//  · Teleporter lên ô đá / băng cùng sao → đổi chỗ, ô kia giữ trạng thái
//  · KHÔNG đổi: Copycat / Overclock / Mimic / Scrap Forge lên đá → không được; ụ đá / băng kéo đi không dùng kỹ năng; đá + ụ khoẻ không ghép
//  · Cleanser tẩy khối đá → ụ thường; online: hành động 'gh' mang cờ đá (ONS.apGhep) → bàn con rối cũng là đá
//  · kéo chạm thật (CDP) 390×844: ô đá sáng là ô ghép được khi cầm Merge King; dải khung ảnh → SHOTS (mặc định docs/demo-hop-tuong/tuvan/conghuong/)
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-conghuong.js   (SHOTS=0: không chụp)
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
let sharp = null; try { sharp = require('sharp'); } catch (e) { }
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const SHOTS = process.env.SHOTS === '0' ? null : (process.env.SHOTS || 'docs/demo-hop-tuong/tuvan/conghuong/');
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
  await p.goto(BASE + '?mode=solo&deck=vughep,dichchuyen,saochep,sinhdoi,canon&wave=1&mana=0&notut=1', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length && typeof TAI !== 'undefined' && !TAI.cho, null, { timeout: 45000 });
  await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 }); await sleep(800);

  // dựng bàn: ds = [[o, id, sao, 'da'|'bang'|'' , vang]]
  const dung = (ds) => p.evaluate((ds) => {
    try { localStorage.setItem('thap_kg_meo', '9'); } catch (e) { }
    G.quai = []; G.dan.length = 0; G.wave = Math.max(G.wave, 1); G.cho = 999;
    for (const B of G.ban) for (let i = 0; i < 15; i++) B.t[i] = null;
    const B = G.ban[0];
    for (const [o, id, s, k, v] of ds) { const T = sinhU(taoU(B, id, s, o)); T.vxA = null; T.goc = -Math.PI / 2; if (k === 'da') T.st.da = true; if (k === 'bang') T.st.bang = 999; if (id === 'vughep') T.vang = !!v; B.t[o] = T; }
    UI.keo = null; UI.chonGhep = null; G.dung = false;
  }, ds);
  const o = (i) => p.evaluate((i) => { const T = G.ban[0].t[i]; return T ? { id: T.id, sao: T.sao, da: !!T.st.da, bang: T.st.bang > 0 } : null; }, i);
  const hop = (a, c) => p.evaluate(([a, c]) => hopLeGhep(G.ban[0].t[a], G.ban[0].t[c]), [a, c]);
  const ghepO = (a, c) => p.evaluate(([a, c]) => { const B = G.ban[0]; return !!ghep(B, B.t[a], B.t[c]); }, [a, c]);
  const dem = () => p.evaluate(() => G.ban[0].t.filter(Boolean).length);

  console.log('— luật (logic)');
  // 1 Merge King lên ô đá cùng sao
  await dung([[0, 'vughep', 3], [1, 'canon', 3, 'da'], [2, 'canon', 4, 'da']]);
  ok(await hop(0, 1), 'Merge King → ô đá cùng sao: ghép được');
  ok(!(await hop(0, 2)), 'Merge King → ô đá khác sao: không');
  await ghepO(0, 1); let r = await o(1);
  ok(r && r.sao === 4 && r.da && r.id === 'canon' && !(await o(0)), 'Merge King lên đá: đá 3★ → 4★, vẫn đá, MK mất', JSON.stringify(r));
  // 2 hai ô đá cùng sao (sau khi nâng) ghép → khối đá +1★
  ok(await hop(1, 2), 'đá 4★ + đá 4★: ghép được');
  await ghepO(1, 2); r = await o(2);
  ok(r && r.sao === 5 && r.da && !(await o(1)), 'đá + đá → khối ĐÁ 5★ (DCDW: 등급 높은 돌덩이)', JSON.stringify(r));
  // 3 MK vàng lên đá +2; MK lên MK đá
  await dung([[0, 'vughep', 2, '', 1], [1, 'canon', 2, 'da'], [3, 'vughep', 2], [4, 'vughep', 2, 'da']]);
  await ghepO(0, 1); r = await o(1); ok(r && r.sao === 4 && r.da, 'Merge King VÀNG lên đá: +2★, vẫn đá', JSON.stringify(r));
  ok(await hop(3, 4), 'Merge King → Merge King đá cùng sao: ghép được');
  await ghepO(3, 4); r = await o(4); ok(r && r.id === 'vughep' && r.sao === 3 && r.da, 'MK lên MK đá: MK đá 3★', JSON.stringify(r));
  // 4 MK lên ô băng → +1★, vẫn băng
  await dung([[0, 'vughep', 2], [1, 'canon', 2, 'bang']]);
  ok(await hop(0, 1), 'Merge King → ô băng cùng sao: ghép được');
  await ghepO(0, 1); r = await o(1); ok(r && r.sao === 3 && r.bang, 'MK lên băng: +1★, vẫn băng', JSON.stringify(r));
  // 5 ụ khoá kéo đi: không dùng kỹ năng
  await dung([[0, 'vughep', 2, 'da'], [1, 'canon', 2], [2, 'vughep', 2, 'bang'], [3, 'dichchuyen', 2, 'da']]);
  ok(!(await hop(0, 1)), 'Merge King ĐÁ kéo lên ụ khoẻ: không');
  ok(!(await hop(2, 1)), 'Merge King BĂNG kéo lên ụ khoẻ: không');
  ok(!(await hop(3, 1)), 'Teleporter ĐÁ kéo lên ụ khoẻ: không');
  // 6 Teleporter đổi chỗ với đá / băng
  await dung([[0, 'dichchuyen', 2], [7, 'canon', 2, 'da'], [5, 'dichchuyen', 3], [9, 'canon', 3, 'bang']]);
  ok(await hop(0, 7), 'Teleporter → ô đá cùng sao: được');
  await ghepO(0, 7); let a = await o(0), c = await o(7);
  ok(a && a.id === 'canon' && a.da && c && c.id === 'dichchuyen' && !c.da, 'Teleporter đổi chỗ với đá: đá sang ô Teleporter, vẫn đá', JSON.stringify([a, c]));
  await ghepO(5, 9); a = await o(5); c = await o(9);
  ok(a && a.id === 'canon' && a.bang && c && c.id === 'dichchuyen', 'Teleporter đổi chỗ với ô băng', JSON.stringify([a, c]));
  // 7 giữ nguyên: Copycat / Overclock / Mimic / Forge lên đá: không; đá + ụ khoẻ cùng loại: không; băng + băng: không
  await dung([[0, 'saochep', 2], [1, 'canon', 2, 'da'], [2, 'epxung', 2], [3, 'mimic', 2], [4, 'canon', 2], [5, 'loren', 2], [6, 'canon', 1, 'da'], [7, 'canon', 3, 'bang'], [8, 'canon', 3, 'bang']]);
  ok(!(await hop(0, 1)), 'Copycat → đá: không (đá không có gì để chép)');
  ok(!(await hop(2, 1)), 'Overclock → đá: không');
  ok(!(await hop(3, 1)), 'Mimic → đá: không');
  ok(!(await hop(6, 5)) && !(await hop(5, 6)), 'Scrap Forge ↔ đá: không');
  ok(!(await hop(4, 1)) && !(await hop(1, 4)), 'đá + ụ khoẻ cùng loại cùng sao: không');
  ok(!(await hop(7, 8)), 'băng + băng: không');
  // 8 đá + đá: không chạy kỹ năng KHI GHÉP (Twin Maker đá không gọi ụ thêm)
  await dung([[0, 'sinhdoi', 2, 'da'], [1, 'sinhdoi', 2, 'da']]);
  await ghepO(0, 1); await sleep(300);
  ok((await dem()) === 1 && (await o(1)).da, 'Twin Maker đá + Twin Maker đá: không gọi ụ sinh đôi, ra 1 khối đá', 'số ụ ' + (await dem()));
  // đối chứng: Twin Maker khoẻ vẫn gọi
  await dung([[0, 'sinhdoi', 2], [1, 'sinhdoi', 2]]);
  await ghepO(0, 1); await sleep(300); ok((await dem()) === 2, 'Twin Maker khoẻ + khoẻ: vẫn gọi ụ sinh đôi (đối chứng)', 'số ụ ' + (await dem()));
  // 9 Cleanser tẩy khối đá → ụ thường cùng sao
  r = await p.evaluate(() => {
    G.quai = []; const B = G.ban[0]; for (let i = 0; i < 15; i++) B.t[i] = null;
    const S = sinhU(taoU(B, 'taylo', 1, 6)); B.t[6] = S; const X = sinhU(taoU(B, 'canon', 5, 7)); X.st.da = true; B.t[7] = X;
    S.nap = 0.999; SKILLS.taylo.capNhat(G, B, S, 1); return { da: !!X.st.da, sao: X.sao };
  });
  ok(r && !r.da && r.sao === 5, 'Cleanser tẩy khối đá 5★ → ụ thường 5★', JSON.stringify(r));
  // 10 online: 'gh' mang cờ đá → bàn con rối
  r = await p.evaluate(() => {
    if (typeof ONS === 'undefined' || !ONS.apGhep) return 'khong-co-ONS';
    const B = G.ban[0]; for (let i = 0; i < 15; i++) B.t[i] = null;
    B.t[0] = taoU(B, 'vughep', 2, 0); B.t[1] = taoU(B, 'canon', 2, 1); B.t[1].st.da = true;
    ONS.apGhep(B, { a: 0, b: 1, id: 'canon', s: 3, giuA: 0, vg: 0, da: 1 });
    const T = B.t[1]; return T && { id: T.id, sao: T.sao, da: !!T.st.da, a: !!B.t[0] };
  });
  ok(r && r.id === 'canon' && r.sao === 3 && r.da && !r.a, 'online apGhep: MK lên đá → con rối 3★ đá', JSON.stringify(r));
  // 11 AI không phí ụ đặc biệt lên ô khoá
  r = await p.evaluate(() => {
    const B = G.ban[0]; for (let i = 0; i < 15; i++) B.t[i] = null;
    for (let i = 0; i < 15; i++) { B.t[i] = taoU(B, ['canon', 'set', 'bang', 'lien', 'tia'][i % 5], 1 + (i % 3) * 2, i); }
    B.t[0] = taoU(B, 'vughep', 2, 0); B.t[1] = taoU(B, 'canon', 2, 1); B.t[1].st.da = true;
    const ai = B.ai, aiT = B.aiT, mana = B.mana; B.ai = true; B.aiT = 0; B.mana = 0;
    try { capNhatU(B, B.t[2], 0.01); } catch (e) { }
    const T = B.t[1]; B.ai = ai; B.aiT = aiT; B.mana = mana;
    return T && { sao: T.sao, mk: !!B.t[0] };
  });
  ok(r && r.sao === 2 && r.mk, 'AI (bàn đầy) không dùng Merge King lên ô đá', JSON.stringify(r));

  // 12 AI không dùng kỹ năng chủ động của ụ ĐỎ đang hoá đá (người chơi cũng không chạm dùng được — ui.js)
  r = await p.evaluate(() => {
    const B = G.ban[0]; for (let i = 0; i < 15; i++) B.t[i] = null;
    const K = taoU(B, 'khoisinh', 3, 0); K.st.da = true; K.nap = 1; B.t[0] = K; B.t[1] = taoU(B, 'mimic', 1, 1);
    const ai = B.ai, aiT = B.aiT, mana = B.mana; B.ai = true; B.aiT = 0; B.mana = 0;
    try { capNhatU(B, B.t[1], 0.01); } catch (e) { }
    B.ai = ai; B.aiT = aiT; B.mana = mana;
    return { nap: K.nap, n: B.t.filter(Boolean).length };
  });
  ok(r && r.nap === 1 && r.n === 2, 'AI không dùng kỹ năng chủ động của ụ đỏ đang hoá đá', JSON.stringify(r));

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
  // A: Merge King lên đá → đá +1★ → ghép 2 đá
  await dung([[6, 'vughep', 2], [7, 'canon', 2, 'da'], [8, 'set', 3, 'da'], [11, 'lien', 1], [3, 'tia', 4]]);
  let anh = []; await sleep(300); await khung(anh, '1 bàn: MK 2★, đá 2★, đá 3★');
  let sang = await keo(6, 7, anh, '2 cầm MK lên đá');
  ok(sang, 'kéo Merge King: ô đá cùng sao là ô ghép được (sáng)');
  await sleep(900); await khung(anh, '3 đá 3★');
  r = await o(7); ok(r && r.sao === 3 && r.da, 'kéo thật: đá 2★ → 3★ vẫn đá', JSON.stringify(r));
  sang = await keo(7, 8, anh, '4 kéo đá lên đá');
  ok(sang, 'kéo đá 3★: ô đá 3★ là ô ghép được');
  await sleep(1200); await khung(anh, '5 khối đá 4★');
  r = await o(8); ok(r && r.sao === 4 && r.da && !(await o(7)), 'kéo thật: đá + đá → khối đá 4★', JSON.stringify(r));
  await dai(anh, 'dai-mk-da-ghep-da.png');
  // B: Teleporter đổi chỗ với đá
  await dung([[2, 'dichchuyen', 2], [12, 'canon', 2, 'da'], [6, 'lien', 2]]);
  anh = []; await sleep(300); await khung(anh, '1 Teleporter 2★ + đá 2★');
  sang = await keo(2, 12, anh, '2 cầm Teleporter lên đá'); ok(sang, 'kéo Teleporter: ô đá cùng sao sáng');
  await sleep(900); await khung(anh, '3 đã đổi chỗ');
  a = await o(2); c = await o(12); ok(a && a.da && a.id === 'canon' && c && c.id === 'dichchuyen', 'kéo thật: Teleporter đổi chỗ với đá', JSON.stringify([a, c]));
  await dai(anh, 'dai-teleporter-da.png');
  // C: Merge King lên ô băng; Copycat lên đá bị từ chối
  await dung([[6, 'vughep', 3], [8, 'canon', 3, 'bang'], [1, 'saochep', 2], [11, 'set', 2, 'da']]);
  anh = []; await sleep(300); await khung(anh, '1 MK 3★ + băng 3★');
  sang = await keo(6, 8, anh, '2 cầm MK lên băng'); ok(sang, 'kéo MK: ô băng cùng sao sáng');
  await sleep(900); await khung(anh, '3 băng 4★');
  r = await o(8); ok(r && r.sao === 4 && r.bang, 'kéo thật: MK lên băng → 4★ vẫn băng', JSON.stringify(r));
  sang = await keo(1, 11, anh, '4 Copycat lên đá: tối'); ok(!sang, 'kéo Copycat: ô đá KHÔNG sáng');
  await sleep(500); await khung(anh, '5 không đổi');
  r = await o(11); ok(r && r.id === 'set' && r.da && (await o(1)), 'Copycat thả lên đá: không gì đổi', JSON.stringify(r));
  await dai(anh, 'dai-mk-bang-copycat-da.png');

  ok(!errs.length, 'không lỗi trang', errs.slice(0, 3).join(' | '));
  await b.close();
  console.log(LOI.length ? 'TRƯỢT cộng hưởng: ' + LOI.length + ' lỗi' : 'XANH cộng hưởng');
  process.exit(LOI.length ? 1 : 0);
})().catch(e => { console.log('✗ ' + (e.stack || e)); process.exit(1); });
