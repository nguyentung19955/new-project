// TURRET MERGE — kiểm KÉO GHÉP + CHẠM–CHẠM ở mọi chế độ sau bản sửa "mượt ghép" (QUY-TAC-HINH mục 6):
// SOLO · CO-OP · PVP (cả ghép ở bàn AI/đồng đội/đối thủ) · ONLINE (2 trình duyệt, máy chủ giả) · Test range (iframe ?preview=).
// iPhone 390x844 DPR 3, chạm CDP. Ghi ảnh giữa lúc kéo + sau khi lộ kết quả, đếm số lần ghép, lỗi trang.
// Chạy: python3 -m http.server 8765 (gốc repo); NODE_PATH=<có ws> node tools/thap-online-mock-server.js 8787 &
//       NODE_PATH=$(npm root -g) OUT=docs/demo-hop-tuong/tuvan/muotghep/ node tools/thap-kt-muotghep-chedo.js
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.OUT || '/tmp/muotghep/'; fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const KQ = {};
(async () => {
  const b = await chromium.launch();
  const moTrang = async (url) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push('pageerror ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text()); });
    if (url) await p.goto(url, { waitUntil: 'load' });
    return { ctx, p, errs };
  };
  const vaoTran = async (p) => {
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length && !TAI.cho, null, { timeout: 60000 });
    await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 30000 }).catch(() => {});
    await sleep(800);
  };
  // bàn 0: soi 4★ ở ô 0 & 7 (kéo), canon 3★ ở 13 & 1 (chạm–chạm); bàn khác: cặp lien 2★ để ghép AI
  const xep = (p) => p.evaluate(() => {
    try { localStorage.setItem('thap_kg_meo', '9'); } catch (e) {}
    window.__ghep = window.__ghep || 0;
    if (!window.__bocG) { window.__bocG = 1; const g0 = ghep; ghep = function (B, a, b) { const r = g0.apply(this, arguments); if (r && b && b.ban === 0) __ghep++; return r; }; }
    for (const B of G.ban) {
      if (B.ai === undefined && B !== G.ban[0] && typeof ONS !== 'undefined' && ONS.on) continue; // bàn đồng đội online: không đụng
      const put = (o, id, s) => { B.lv[id] = B.lv[id] || 1; B.t[o] = sinhU(taoU(B, id, s, o)); B.t[o].vxA = null; B.t[o]._gs = null; };
      if (B === G.ban[0]) { put(0, 'soi', 4); put(7, 'soi', 4); put(13, 'canon', 3); put(1, 'canon', 3); put(5, 'ronglua', 5); put(9, 'overlord', 5); }
      else { put(2, 'lien', 2); put(3, 'lien', 2); }
    }
    UI.keo = null; UI.chonGhep = null;
  });
  const keoGhep = async (p, ctx, ten) => {
    const cdp = await ctx.newCDPSession(p);
    const pos = (o) => p.evaluate((o) => { const B = G.ban[0], c = B.o[o], r = document.querySelector('#cv').getBoundingClientRect(); return [r.left + c.x / W * r.width, r.top + c.y / H * r.height, Math.min(B.cw, B.ch) * 0.6 / H * r.height]; }, o);
    const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
    const khung = (n = 1) => p.evaluate((n) => new Promise(ok => { let k = 0; const f = () => (++k >= n ? ok() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
    if (process.env.CHEDO) await p.evaluate(() => { window.__L = []; const cv = document.querySelector('#cv'); for (const t of ['pointerdown', 'pointerup', 'pointercancel', 'touchstart', 'touchend', 'touchcancel']) cv.addEventListener(t, (e) => __L.push(t + ' keo=' + !!UI.keo + ' ' + (UI.chonGhep ? 'chon' + UI.chonGhep.T.o : '') + ' ' + (e.clientX | 0) + ',' + (e.clientY | 0)), true);
      let v = UI.chonGhep; Object.defineProperty(UI, 'chonGhep', { configurable: true, get() { return v; }, set(x) { if (!x && v) { const B = G.ban[0]; __L.push('XOA chon ' + v.T.o + ' cung=' + (B.t[v.T.o] === v.T) + ' dung=' + G.dung + ' ' + new Error().stack.split('\n').slice(2, 5).map(s => s.trim()).join(' < ')); } v = x; } });
      const ng = KG.nguon.bind(KG); KG.nguon = function () { const c = UI.chonGhep; const r = ng(); if (c && !r && !(UI.keo && UI.keo.dang)) __L.push('nguon xoa: cung=' + (G.ban[0].t[c.T.o] === c.T) + ' dung=' + G.dung + ' kt=' + G.ketThuc + ' tuoi=' + ((performance.now() - c.t0) | 0)); return r; }; });
    const g0 = await p.evaluate(() => __ghep);
    // kéo 0 → 7
    const [x0, y0] = await pos(0), [xt, yt, lech] = await pos(7);
    await touch('touchStart', x0, y0); await khung(4);
    for (let i = 1; i <= 24; i++) { await touch('touchMove', x0 + (xt - x0) * i / 24 + Math.sin(i / 4) * 30, y0 + (yt + lech - y0) * i / 24); await khung(1); }
    await touch('touchMove', xt, yt + lech); await khung(6);
    await p.screenshot({ path: OUT + ten + '_1_dang_keo.png' });
    await touch('touchEnd', xt, yt + lech);
    await sleep(560); await p.screenshot({ path: OUT + ten + '_2_lo_ket_qua.png' });
    await sleep(900);
    const keo = (await p.evaluate(() => __ghep)) - g0;
    // chạm–chạm 13 → 1
    const [a, bb] = await pos(13), [c, d] = await pos(1), [ex, ey] = await pos(14);
    // chạm mồi vào ô trống (Chromium giả lập đôi khi nuốt lần chạm đầu sau chuỗi chạm trước; chạm ô trống = bỏ chọn, vô hại)
    await touch('touchStart', ex, ey); await touch('touchEnd', ex, ey); await sleep(350);
    await touch('touchStart', a, bb); await touch('touchEnd', a, bb); await sleep(650); // > ngưỡng chạm-đúp của Chromium giả lập
    await p.screenshot({ path: OUT + ten + '_3_cham_chon.png' });
    const chon = await p.evaluate(() => UI.chonGhep ? UI.chonGhep.T.id + UI.chonGhep.T.sao + '@' + UI.chonGhep.T.o : null);
    await touch('touchStart', c, d); await touch('touchEnd', c, d); await sleep(1300);
    const cham = (await p.evaluate(() => __ghep)) - g0 - keo;
    // ghép ở bàn khác (AI / đồng đội / đối thủ) — cùng phát lại MAGNETIC FORGE
    const khac = await p.evaluate(() => { let n = 0; for (const B of G.ban) { if (B === G.ban[0] || !B.t[2] || !B.t[3]) continue; if (B.t[2].id === 'lien' && hopLeGhep(B.t[2], B.t[3]) && ghep(B, B.t[2], B.t[3])) n++; } return n; });
    await sleep(300); if (khac) await p.screenshot({ path: OUT + ten + '_4_ban_khac.png' });
    await sleep(900);
    if (process.env.CHEDO) console.log((await p.evaluate(() => __L)).join('\n'));
    return { keo, cham, khac, chon, sau: await p.evaluate(() => G.ban[0].t.map(T => T ? T.id + T.sao : '-').join(' ')), nhoCanvasMB: await p.evaluate(() => { try { return REN.boNho().mb; } catch (e) { return null; } }) };
  };
  const decks = { solo: 'soi,canon,ronglua,overlord,lien', coop: 'soi,canon,ronglua,overlord,lien', pvp: 'soi,canon,ronglua,overlord,lien' };
  for (const m of (process.env.CHEDO || 'solo,coop,pvp').split(',')) {
    const T = await moTrang(`http://localhost:8765/thap/?mode=${m}&deck=${decks[m]}&deck2=lien,canon,bang,tia,set&wave=6&mana=9999`);
    await vaoTran(T.p); await xep(T.p); await sleep(500);
    KQ[m] = { ...(await keoGhep(T.p, T.ctx, m)), errs: T.errs.slice(0, 5) };
    console.log(m, JSON.stringify(KQ[m]));
    await T.ctx.close();
  }
  // ONLINE (máy chủ giả 8787): A tạo phòng, B vào, READY → trận co-op online → kéo ghép ở máy A
  if (!process.env.CHEDO) try {
    const bam = (p, sel) => p.evaluate((s) => document.querySelector(s).click(), sel);
    const URL = 'http://localhost:8787/thap/?net=mock&mockws=ws://localhost:8787&nointro=1&notut=1';
    const mo = async (deck) => { const T = await moTrang(URL); await T.p.waitForFunction(() => typeof UI !== 'undefined' && UI.chon && document.querySelector('#onl-nut') && NET.ok, null, { timeout: 30000 }); await T.p.evaluate((d) => { UI.chon = d; UI.veBoChon(); }, deck); return T; };
    const A = await mo(['soi', 'canon', 'ronglua', 'overlord', 'lien']), Bp = await mo(['drone', 'bao', 'kiembang', 'hydra', 'anhsang']);
    await bam(A.p, '#onl-nut'); await bam(A.p, '[data-act="onl-tao"]');
    await A.p.waitForFunction(() => /^[A-Z]{4}$/.test((document.querySelector('#sanh-ma') || {}).textContent || ''), null, { timeout: 10000 });
    const code = await A.p.textContent('#sanh-ma');
    await bam(Bp.p, '#onl-nut'); await Bp.p.fill('#onl-ma', code); await bam(Bp.p, '[data-act="onl-vao"]');
    await A.p.waitForFunction(() => document.querySelectorAll('#sanh-ds .sanh-p:not(.trong)').length === 2, null, { timeout: 10000 });
    await bam(A.p, '#sanh-san'); await bam(Bp.p, '#sanh-san');
    await A.p.waitForFunction(() => ONS.on && G.ban.length === 2, null, { timeout: 20000 });
    await vaoTran(A.p); await A.p.evaluate(() => { G.ban[0].mana = 9999; }); await xep(A.p); await sleep(500);
    KQ.online = { ...(await keoGhep(A.p, A.ctx, 'online')), errsA: A.errs.slice(0, 5), errsB: Bp.errs.slice(0, 5) };
    await Bp.p.screenshot({ path: OUT + 'online_5_may_B.png' });
    console.log('online', JSON.stringify(KQ.online));
    await A.ctx.close(); await Bp.ctx.close();
  } catch (e) { KQ.online = { loi: String(e).slice(0, 200) }; console.log('online', KQ.online); }
  // Test range (trang ụ): iframe chạy chính game ?preview=<id> — các clip kiểu ghép
  KQ.testRange = {};
  for (const id of process.env.CHEDO ? [] : ['nhanban', 'mimic', 'vughep']) {
    const T = await moTrang('http://localhost:8765/thap/?preview=' + id);
    await sleep(5200); await T.p.screenshot({ path: OUT + 'testrange_' + id + '.png' });
    KQ.testRange[id] = { errs: T.errs.slice(0, 5), ghepFx: await T.p.evaluate(() => typeof GF !== 'undefined' ? GF.mg.length + '/' + (REN._nong ? REN._nong.length : '-') : 'no GF') };
    await T.ctx.close();
  }
  console.log(JSON.stringify(KQ, null, 1));
  if (!process.env.CHEDO) fs.writeFileSync(OUT + 'chedo.json', JSON.stringify(KQ, null, 1));
  await b.close();
})();
