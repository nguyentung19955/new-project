// TURRET MERGE — KIỂM VUỐT/CUỘN KHÔNG BỊ HIỂU NHẦM THÀNH KÉO Ụ VÀO BỘ (người dùng 07/11: "vuốt/cuộn danh sách thẻ hay bị kéo nhầm tướng vào deck").
//  Cảm ứng thật (CDP Input.dispatchTouchEvent) ở 390×844 (isMobile, hasTouch, DPR 3):
//   · màn XÂY BỘ BÀI: vuốt ngang / dọc / chéo / vuốt nhanh / chạm-nghỉ-rồi-vuốt (200 ms) trên thẻ lưới → lưới cuộn (dọc), bộ bài KHÔNG đổi,
//     không có kéo (DK.keo) lúc nào; GIỮ 320 ms rồi kéo lên ô trống → vẫn thêm được; chạm nhanh → thêm (dkcham.js) như cũ;
//   · màn BỘ SƯU TẬP: vuốt dọc → cuộn, bộ bài không đổi, không mở trang ụ; chạm → mở trang ụ;
//   · chuột (máy tính 1280×800): kéo thẻ lưới vào ô trống vẫn được ngay (không cần giữ).
//  Chạy: (trong thap/) python3 -m http.server 8766 &  ·  node tools/thap-kt-vuot-deck.js [http://localhost:8766/]
//  Ra mã 1 nếu trượt.
'use strict';
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd(), '/opt/npm-tools/node_modules'] }));
const URL = process.argv[2] || process.env.BASE || 'http://localhost:8766/';
const kq = []; const ok = (ten, d, ghi) => { kq.push([ten, !!d]); console.log((d ? '  ✓ ' : '  ✗ ') + ten + (ghi ? ' (' + ghi + ')' : '')); };
const ngu = (ms) => new Promise(r => setTimeout(r, ms));

const moDeck = async (p) => {
  await p.goto(URL + 'index.html?notut=1&nointro=1', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof HM !== 'undefined' && typeof UI !== 'undefined' && typeof DK !== 'undefined' && document.querySelector('[data-act="hm-deck"]'), null, { timeout: 45000 });
  await ngu(1500);
  await p.evaluate(() => HM.di('dk')); await ngu(800);
  const sk = await p.$('[data-act="hd-boqua"]'); if (sk) { await sk.click().catch(() => { }); await ngu(600); }
  await p.waitForFunction(() => DK.moDuoc(), null, { timeout: 30000 });
};
const st = (p) => p.evaluate(() => {
  const r = el => { const b = el.getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; };
  const l = document.getElementById('chon-luoi'), lr = l.getBoundingClientRect();
  return { deck: UI.chon.slice(), top: l.scrollTop, lTop: lr.top, lBot: lr.bottom, o: [...document.querySelectorAll('#chon-bo [data-slot]:not([data-slot="mv"])')].map(o => [...r(o), o.dataset.id || '']),
    cards: [...document.querySelectorAll('#chon-luoi [data-id]')].filter(c => { const b = c.getBoundingClientRect(); return b.width > 0 && b.top > lr.top + 4 && b.bottom < lr.bottom - 4 && !c.classList.contains('khoa') && SKILLS[c.dataset.id]; }).map(c => [c.dataset.id, ...r(c)]) };
});

(async () => {
  const b = await chromium.launch();
  const errs = [];
  // ---------- cảm ứng 390×844 ----------
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await moDeck(p);
    const cdp = await ctx.newCDPSession(p);
    const t = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y]) => ({ x, y, id: 1, radiusX: 4, radiusY: 4, force: 1 })) });
    // vuốt: a → a+(dx,dy) trong n bước, mỗi bước ms; nghi = chờ trước khi đi. Trả về: có kéo (DK.keo) lúc nào không
    const vuot = async (a, dx, dy, { n = 12, ms = 16, nghi = 0 } = {}) => {
      let keo = false;
      await t('touchStart', [a]); if (nghi) await ngu(nghi);
      for (let i = 1; i <= n; i++) { await t('touchMove', [[a[0] + dx * i / n, a[1] + dy * i / n]]); await ngu(ms); if (await p.evaluate(() => !!DK.keo)) keo = true; }
      await t('touchEnd', []); await ngu(600);
      if (await p.evaluate(() => !!DK.keo)) keo = true;
      return keo;
    };
    const datLai = async (n) => { await p.evaluate((n) => { const ds = G.roster.filter(r => SKILLS[r.id]).map(r => r.id); UI.chon = ds.slice(0, n); UI.veBoChon(); document.getElementById('chon-luoi').scrollTop = 0; if (typeof UP !== 'undefined' && UP.el && !UP.el.hidden && UP.dong) UP.dong(); }, n); await ngu(300); };
    await datLai(3);
    await p.screenshot({ path: '/tmp/vuot-deck-390.png' }).catch(() => { });
    const CA = [
      ['ngang-phai', 110, 0, {}], ['ngang-trai', -110, 0, {}], ['ngang-cham', 90, 6, { n: 15, ms: 30 }],
      ['doc-len', 0, -160, {}], ['doc-xuong', 0, 120, {}], ['cheo', 70, -50, {}],
      ['vuot-nhanh', 0, -150, { n: 5, ms: 8 }], ['ngang-nhanh', 120, 4, { n: 4, ms: 8 }],
      ['cham-nghi-200ms-roi-vuot', 0, -140, { nghi: 200 }], ['cham-nghi-200ms-roi-ngang', 100, 0, { nghi: 200 }],
    ];
    for (const [ten, dx, dy, o] of CA) {
      await datLai(3);
      if (dy > 0) await p.evaluate(() => { document.getElementById('chon-luoi').scrollTop = 200; }), await ngu(150);
      const s0 = await st(p);
      // thẻ ở giữa lưới (để vuốt không ra khỏi lưới)
      const mid = (s0.lTop + s0.lBot) / 2, c = s0.cards.slice().sort((a, b) => Math.abs(a[2] - mid) - Math.abs(b[2] - mid) + 0.01 * (Math.abs(a[1] - 195) - Math.abs(b[1] - 195)))[0];
      const keo = await vuot([c[1], c[2]], dx, dy, o);
      const s1 = await st(p);
      const moUP = await p.evaluate(() => typeof UP !== 'undefined' && UP.el && !UP.el.hidden);
      ok('deck ' + ten + ': không kéo, bộ không đổi', !keo && JSON.stringify(s1.deck) === JSON.stringify(s0.deck) && !moUP, 'kéo=' + keo + ' bộ ' + s0.deck.length + '→' + s1.deck.length + (moUP ? ' mở trang ụ' : ''));
      if (Math.abs(dy) >= 100) ok('deck ' + ten + ': lưới cuộn', Math.abs(s1.top - s0.top) > 40, 'scrollTop ' + s0.top + '→' + s1.top);
    }
    // giữ lâu rồi kéo vào ô trống: vẫn thêm được
    await datLai(3);
    { const s0 = await st(p), o = s0.o.find(x => !x[2]), c = s0.cards.find(x => !s0.deck.includes(x[0]));
      await t('touchStart', [[c[1], c[2]]]); await ngu(320);
      await t('touchMove', [[c[1] + (o[0] - c[1]) / 14, c[2] + (o[1] - c[2]) / 14]]); // đi ngay sau khi giữ đủ (giữ yên lâu = trang chi tiết)
      const daKeo = await p.evaluate(() => !!DK.keo);
      for (let i = 2; i <= 14; i++) { await t('touchMove', [[c[1] + (o[0] - c[1]) * i / 14, c[2] + (o[1] - c[2]) * i / 14]]); await ngu(16); }
      await ngu(40); await t('touchEnd', []); await ngu(600);
      const s1 = await st(p);
      const moUP = await p.evaluate(() => typeof UP !== 'undefined' && UP.el && !UP.el.hidden);
      ok('deck giữ 320 ms + kéo vào ô trống: thêm', daKeo && s1.deck.length === 4 && s1.deck.includes(c[0]), 'kéo=' + daKeo + ' bộ ' + s1.deck.join(',') + (moUP ? ' (mở trang ụ)' : ''));
      await p.screenshot({ path: '/tmp/vuot-deck-390-keo.png' }).catch(() => { }); }
    // kéo nhanh thẳng lên khỏi mép trên lưới (về phía bộ bài) vẫn là kéo (hành vi cũ giữ nguyên)
    await datLai(3);
    { const s0 = await st(p), o = s0.o.find(x => !x[2]), c = s0.cards.filter(x => !s0.deck.includes(x[0])).sort((a, b) => a[2] - b[2])[0];
      await t('touchStart', [[c[1], c[2]]]); await ngu(10);
      for (let i = 1; i <= 14; i++) { await t('touchMove', [[c[1] + (o[0] - c[1]) * i / 14, c[2] + (o[1] - c[2]) * i / 14]]); await ngu(16); }
      await ngu(40); await t('touchEnd', []); await ngu(600);
      const s1 = await st(p);
      ok('deck kéo thẳng lên khỏi lưới vào ô trống: thêm', s1.deck.includes(c[0]), 'bộ ' + s1.deck.join(',')); }
    // chạm nhanh: thêm vào ô trống (dkcham.js)
    await datLai(3);
    { const s0 = await st(p), c = s0.cards.find(x => !s0.deck.includes(x[0]));
      await t('touchStart', [[c[1], c[2]]]); await ngu(60); await t('touchEnd', []); await ngu(600);
      const s1 = await st(p); ok('deck chạm: thêm như cũ', s1.deck.length === 4 && s1.deck.includes(c[0])); }
    // ---------- BỘ SƯU TẬP ----------
    await datLai(5);
    await p.evaluate(() => HM.di('dk', true)); await ngu(800);
    { const s0 = await st(p), mid = (s0.lTop + s0.lBot) / 2, c = s0.cards.sort((a, b) => Math.abs(a[2] - mid) - Math.abs(b[2] - mid))[0];
      await p.screenshot({ path: '/tmp/vuot-bst-390.png' }).catch(() => { });
      for (const [ten, dx, dy] of [['doc-len', 0, -160], ['ngang', 110, 0], ['cheo', 60, -80]]) {
        const a = await st(p);
        await vuot([c[1], c[2]], dx, dy);
        const s1 = await st(p), moUP = await p.evaluate(() => typeof UP !== 'undefined' && UP.el && !UP.el.hidden);
        ok('bst ' + ten + ': bộ không đổi, không mở trang ụ', JSON.stringify(s1.deck) === JSON.stringify(s0.deck) && !moUP, moUP ? 'mở trang ụ' : '');
        if (dy) ok('bst ' + ten + ': lưới cuộn', Math.abs(s1.top - a.top) > 40, 'scrollTop ' + a.top + '→' + s1.top);
        if (moUP) await p.evaluate(() => UP.dong && UP.dong());
        await p.evaluate(() => { document.getElementById('chon-luoi').scrollTop = 0; }); await ngu(200);
      }
      const s2 = await st(p), c2 = s2.cards[0];
      await t('touchStart', [[c2[1], c2[2]]]); await ngu(60); await t('touchEnd', []); await ngu(700);
      ok('bst chạm: mở trang ụ', await p.evaluate(() => typeof UP !== 'undefined' && UP.el && !UP.el.hidden)); }
    await ctx.close();
  }
  // ---------- chuột (máy tính) ----------
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await moDeck(p);
    await p.evaluate(() => { const ds = G.roster.filter(r => SKILLS[r.id]).map(r => r.id); UI.chon = ds.slice(0, 3); UI.veBoChon(); }); await ngu(300);
    const s0 = await st(p), o = s0.o.find(x => !x[2]), c = s0.cards.find(x => !s0.deck.includes(x[0]));
    await p.mouse.move(c[1], c[2]); await p.mouse.down(); await ngu(40);
    for (let i = 1; i <= 14; i++) { await p.mouse.move(c[1] + (o[0] - c[1]) * i / 14, c[2] + (o[1] - c[2]) * i / 14); await ngu(16); }
    await ngu(40); await p.mouse.up(); await ngu(600);
    const s1 = await st(p);
    ok('chuột kéo ngay (không giữ) vào ô trống: thêm', s1.deck.includes(c[0]), 'bộ ' + s1.deck.join(','));
    await ctx.close();
  }
  if (errs.length) ok('không lỗi trang', false, errs[0]);
  await b.close();
  const hong = kq.filter(x => !x[1]);
  console.log((hong.length ? '✗ ' : '✓ ') + 'vuốt deck/bộ sưu tập ' + (kq.length - hong.length) + '/' + kq.length);
  process.exit(hong.length ? 1 : 0);
})().catch(e => { console.log('✗ kẹt: ' + e.message); process.exit(1); });
