// TURRET MERGE — kiểm COPYCAT chép ô ĐÁ (Janus / trùm hoá đá) và ô BĂNG (Freezer) — docs/demo-hop-tuong/tuvan/copycat-da/DCDW.md
//  · Copycat khoẻ kéo lên ô đá / băng CÙNG SAO → ô Copycat thành bản sao THƯỜNG (không đá, không băng) đúng loại thật, % sao chép theo cấp thẻ
//  · ô đá / băng giữ nguyên · khác sao: không · Copycat đang đá / băng: không dùng kỹ năng · Copycat không chép Copycat
//  · chạy đúng ở SOLO / CO-OP / PVP (cùng hàm luật) + bàn con rối ONLINE (ONS.apGhep mang cờ đá) + kéo chạm thật: ô đá SÁNG khi cầm Copycat
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-copycat-da.js
'use strict';
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const LOI = [];
const ok = (dk, ten, chi) => { if (dk) console.log('  ✓ ' + ten); else { console.log('  ✗ ' + ten + (chi ? ' — ' + chi : '')); LOI.push(ten); } };

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/WebSocket|ERR_CONNECTION_REFUSED|favicon|Firebase|firebase/.test(m.text())) errs.push('console ' + m.text().slice(0, 200)); });
  const vao = async (mode) => {
    await p.goto(BASE + '?mode=' + mode + '&deck=saochep,canon,set,lien,tia&wave=1&mana=0&notut=1', { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length && typeof TAI !== 'undefined' && !TAI.cho, null, { timeout: 45000 });
    await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 }); await sleep(600);
  };
  // luật (chạy trong trang): trả kết quả từng ca
  const luat = () => p.evaluate(() => {
    const B = G.ban[0], R = {};
    G.quai = []; G.dan.length = 0; G.cho = 999;
    const clr = () => { for (const X of G.ban) for (let i = 0; i < 15; i++) X.t[i] = null; };
    const dat = (o, id, s, k) => { const T = sinhU(taoU(B, id, s, o)); if (k === 'da') T.st.da = true; if (k === 'bang') T.st.bang = 999; B.t[o] = T; return T; };
    const o = (i) => { const T = B.t[i]; return T ? T.id + T.sao + (T.st.da ? 'S' : '') + (T.st.bang > 0 ? 'B' : '') + (T.banSao ? 'c' : '') : '-'; };
    clr(); dat(0, 'saochep', 1); dat(1, 'canon', 1, 'da'); dat(2, 'set', 2, 'da');
    R.hopDa = hopLeGhep(B.t[0], B.t[1]); R.khacSao = hopLeGhep(B.t[0], B.t[2]);
    ghep(B, B.t[0], B.t[1]); R.sauDa = o(0) + ' ' + o(1);
    R.he = Math.round(heSaoChep(B) * 100); R.dmgOk = !!(B.t[0] && B.t[0].banSao && B.t[0].st && !B.t[0].st.da);
    clr(); dat(0, 'saochep', 3); dat(1, 'lien', 3, 'bang');
    R.hopBang = hopLeGhep(B.t[0], B.t[1]); ghep(B, B.t[0], B.t[1]); R.sauBang = o(0) + ' ' + o(1);
    clr(); dat(0, 'saochep', 2, 'da'); dat(1, 'canon', 2); dat(2, 'saochep', 2, 'bang'); dat(3, 'canon', 2, 'da');
    R.cdDa = hopLeGhep(B.t[0], B.t[1]) || hopLeGhep(B.t[2], B.t[1]);
    R.daDa = hopLeGhep(B.t[0], B.t[3]); // Copycat đá + đá cùng sao = luật ĐÁ + ĐÁ (khối đá), không phải chép
    clr(); dat(0, 'saochep', 2); dat(1, 'saochep', 2, 'da');
    R.chepCC = hopLeGhep(B.t[0], B.t[1]);
    // vẫn chép ụ khoẻ như cũ (đối chứng)
    clr(); dat(0, 'saochep', 2); dat(1, 'tia', 2); ghep(B, B.t[0], B.t[1]); R.khoe = o(0) + ' ' + o(1);
    clr();
    return R;
  });
  for (const mode of ['solo', 'coop', 'pvp']) {
    console.log('— luật ' + mode.toUpperCase());
    await vao(mode);
    const r = await luat();
    ok(r.hopDa === true, mode + ': Copycat 1★ → đá 1★: ghép được', JSON.stringify(r));
    ok(r.khacSao === false, mode + ': Copycat → đá khác sao: không');
    ok(r.sauDa === 'canon1c canon1S', mode + ': kết quả = bản sao Pháo THƯỜNG 1★ (không đá), ô đá giữ nguyên', r.sauDa);
    ok(r.dmgOk && r.he >= 50, mode + ': bản sao dùng % sao chép theo cấp thẻ (' + r.he + '%)');
    ok(r.hopBang === true && r.sauBang === 'lien3c lien3B', mode + ': Copycat → ô băng cùng sao: bản sao thường, băng giữ nguyên', r.sauBang);
    ok(r.cdDa === false, mode + ': Copycat đang đá / băng: không dùng kỹ năng chép');
    ok(r.daDa === true, mode + ': Copycat đá + đá cùng sao: vẫn theo luật đá + đá');
    ok(r.chepCC === false, mode + ': Copycat không chép Copycat (kể cả đá)');
    ok(r.khoe === 'tia2c tia2', mode + ': đối chứng — chép ụ khoẻ như cũ', r.khoe);
  }

  console.log('— ONLINE (bàn con rối)');
  await vao('solo');
  let r = await p.evaluate(() => {
    if (typeof ONS === 'undefined' || !ONS.apGhep) return null;
    const B1 = G.ban[0]; for (let i = 0; i < 15; i++) B1.t[i] = null;
    const o = (i) => { const T = B1.t[i]; return T ? T.id + T.sao + ONS.oTT(T)[2].replace(/h\d+;n\d+;/g, "") /* bỏ trường mũi tên+số của Pháo La Bàn (co-che-moi) — kiểm riêng ở chỗ khác */ : '-'; };
    B1.t[0] = taoU(B1, 'saochep', 2, 0); B1.t[7] = taoU(B1, 'canon', 2, 7); B1.t[7].st.da = true;
    ONS.apGhep(B1, { a: 0, b: 7, id: 'canon', s: 2, giuA: 1, db: 1, sa: ['canon', 2, 'c'], sb: ['canon', 2, 'S'] });
    const s = o(0) + ' ' + o(7); for (let i = 0; i < 15; i++) B1.t[i] = null; return s;
  });
  ok(r && /^canon2c? /.test(r) && !/^canon2\S*S/.test(r) && / canon2\S*S/.test(r), 'online: Copycat chép đá trên bàn con rối = bản sao thường, đá giữ nguyên', JSON.stringify(r));

  console.log('— kéo chạm (390×844)');
  const cdp = await ctx.newCDPSession(p);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' || type === 'touchCancel' ? [] : [{ x, y, id: 1 }] });
  const pos = (i) => p.evaluate((i) => { const B = G.ban[0], c = B.o[i], r = document.querySelector('#cv').getBoundingClientRect(); return [r.left + c.x / W * r.width, r.top + c.y / H * r.height, Math.min(B.cw, B.ch) * 0.6 / H * r.height]; }, i);
  await p.evaluate(() => {
    try { localStorage.setItem('thap_kg_meo', '9'); } catch (e) { }
    G.quai = []; G.dan.length = 0; G.cho = 999; G.tocDo = 1;
    const B = G.ban[0]; for (let i = 0; i < 15; i++) B.t[i] = null;
    const d = (o, id, s, da) => { const T = sinhU(taoU(B, id, s, o)); T.vxA = null; T.goc = -Math.PI / 2; if (da) T.st.da = true; B.t[o] = T; };
    d(6, 'saochep', 1); d(4, 'canon', 1, 1); d(11, 'lien', 2); UI.keo = null; UI.chonGhep = null; G.dung = false;
  });
  await sleep(300);
  const [x0, y0] = await pos(6), [x1, y1, lech] = await pos(4);
  await touch('touchStart', x0, y0);
  for (let i = 1; i <= 8; i++) { await touch('touchMove', x0 + (x1 - x0) * i / 8, y0 + (y1 + lech - y0) * i / 8); await sleep(25); }
  await sleep(220);
  const sang = await p.evaluate(() => { const k = UI.keo, B = G.ban[0]; if (!k || !k.T) return null; const L = []; for (let i = 0; i < 15; i++) if (B.t[i] && B.t[i] !== k.T && hopLeGhep(k.T, B.t[i])) L.push(i); return L.join(); });
  ok(sang === '4', 'cầm Copycat 1★: đúng ô đá 1★ sáng (ô 2★ không)', JSON.stringify(sang));
  await touch('touchEnd', x1, y1 + lech); await sleep(900);
  r = await p.evaluate(() => { const B = G.ban[0], f = (T) => T ? T.id + T.sao + (T.st.da ? 'S' : '') + (T.banSao ? 'c' : '') : '-'; return f(B.t[6]) + ' ' + f(B.t[4]); });
  ok(r === 'canon1c canon1S', 'kéo thật: thả Copycat lên đá → bản sao Pháo thường, đá còn nguyên', r);

  ok(!errs.length, 'không lỗi trang', errs.slice(0, 3).join(' | '));
  await b.close();
  console.log(LOI.length ? 'TRƯỢT copycat-đá: ' + LOI.length + ' lỗi' : 'XANH copycat-đá');
  process.exit(LOI.length ? 1 : 0);
})().catch(e => { console.log('✗ ' + (e.stack || e)); process.exit(1); });
