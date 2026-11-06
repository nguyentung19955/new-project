// Dải khung 2 khoảnh khắc nặng (nhiều skill cùng 1 khung · trùm Freezer tung chiêu) — bản cũ/mới cạnh nhau.
// node tools/thap-do-giat-chup.js <BASE> <tag>   → docs/demo-hop-tuong/tuvan/giat_skill/khung_<tag>_<cảnh>.png (dải 6 ảnh)
'use strict';
const { chromium } = require('playwright');
const sharp = require('sharp');
const BASE = process.argv[2] || 'http://localhost:8765/thap/', TAG = process.argv[3] || 'sau';
const OUT = 'docs/demo-hop-tuong/tuvan/giat_skill/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  for (const canh of ['cungluc', 'freezer']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); const loi = []; p.on('pageerror', e => loi.push(e.message));
    const deck = canh === 'cungluc' ? 'blackhole,overlord,hydra,cuuvi,ronglua' : 'blackhole,hydra,canon,set,bang';
    await p.goto(BASE + '?mode=solo&deck=' + deck + '&wave=20&mana=0&notut=1&seed=7', { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban[0] && !TAI.cho, null, { timeout: 120000 });
    await p.evaluate((c) => {
      G.debug.dpr = 3; REN.coLai(); G.hang.length = 0; G.quai.length = 0; G.cho = 1e9; const B = G.ban[0]; B.tim = 1e9;
      for (let o = 0; o < 15; o++) { const id = B.deck[o % 5]; const T = sinhU(taoU(B, id, c === 'cungluc' ? 7 : 4, o)); T.vxA = null; B.t[o] = T; }
      const p0 = G.duong[0]; for (let i = 0; i < 20; i++) { const E = sinhQuai(i % 5 ? 'bo' : 'khong_lo', 0, p0.len * (0.05 + i / 25), 1); E.vao = 1; E.hp = E.max = 1e9; }
      if (c === 'freezer' && window.NS) NS.nongTrum('freezer');
    }, canh);
    await sleep(5000);
    const clip = await p.evaluate(() => { const B = G.ban[0], r = document.querySelector('#cv').getBoundingClientRect(), k = r.width / W; return { x: Math.max(0, r.left), y: Math.max(0, r.top + (B.y - 260) * k), width: Math.min(390, r.width), height: Math.min(844, (B.h + 300) * k) }; });
    if (canh === 'cungluc') await p.evaluate(() => { for (const B of G.ban) for (const T of B.t) { if (!T) continue; const sk = SKILLS[T.id]; if (sk.chuDong) { T.nap = 1; try { sk.chuDong(G, B, T); } catch (e) { } } else if (T.id === 'cuuvi') { T.duoi = 8; try { sk.themDuoi(T, 1); } catch (e) { T.duoi = 9; } } else T.nap = 0.999; } });
    else { await p.evaluate(() => { const E = sinhTrum('freezer', 0); E.s = 70; E.vao = 1; E.knT = 0.2; E.hp = E.max = 1e9; }); await p.waitForFunction(() => G.quai.some(E => E.trum === 'freezer' && E.bao), null, { timeout: 20000 }); await p.waitForFunction(() => G.hu.some(o => o.k === 'bangPhep'), null, { timeout: 20000 }); }
    const anh = [];
    for (let i = 0; i < 6; i++) { anh.push(await p.screenshot({ clip, type: 'png' })); await sleep(canh === 'cungluc' ? 260 : 330); }
    const m = await sharp(anh[0]).metadata(); const w = Math.round(m.width / 2), h = Math.round(m.height / 2);
    const nho = await Promise.all(anh.map(a => sharp(a).resize(w, h).png().toBuffer()));
    await sharp({ create: { width: w * 6 + 50, height: h, channels: 3, background: '#111' } }).composite(nho.map((x, i) => ({ input: x, left: i * (w + 10), top: 0 }))).jpeg({ quality: 82 }).toFile(OUT + 'khung_' + TAG + '_' + canh + '.jpg');
    console.log(canh, TAG, 'lỗi trang:', loi.length, loi.slice(0, 2).join(' | '));
    await ctx.close();
  }
  await b.close();
})();
