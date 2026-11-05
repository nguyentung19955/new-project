// TURRET MERGE — chụp các màn phần "tư vấn C" (hệ thiết kế §A + B1 B3 B4 B5 B6 B13–B18) ở 320×700, 360×780, 390×844, 430×932.
// Báo: chữ < 13 px logic (khung 430 → ≈ 12 px ở màn 390) trên các màn này, chữ bị cắt (scrollWidth > clientWidth), lỗi trang.
// Chạy (gốc repo):  python3 -m http.server 8765 &  ·  NODE_PATH=/opt/npm-tools/node_modules node tools/thap-online-mock-server.js 8787 &
//                   OUT=docs/demo-hop-tuong/tuvan/tvC/sau/ [DPR=3] node tools/thap-kt-tvc.js
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.OUT || '';
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const MOCK = +(process.env.MOCK || 8787);
const SIZES = (process.env.SIZES || '320x700,360x780,390x844,430x932').split(',').map(s => s.split('x').map(Number));
const DECK = 'canon,bang,tia,set,lien';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
if (OUT) fs.mkdirSync(OUT, { recursive: true });
const ev = (js) => (p) => p.evaluate(js);
const MAN = [
  { url: BASE + '?notut=1', buoc: [
    ['b1_home', ev(() => HM.di('hm'))],
    ['b1_home_du', ev(() => { UI.chon = ['canon', 'bang', 'tia', 'set', 'lien']; UI.veBoChon(); HM.ve(); })],
    ['b6_mode', ev(() => HM.moChe())],
    ['b5_settings', ev(() => { HM.dong(true); HM.moCai(); })],
    ['b3_filter', ev(() => { HM.dong(true); HM.di('dk'); HM.moLoc(); })],
    ['b3_filter_atk', ev(() => { BOBAI.loc.vai = 'tc'; BOBAI.ap(); HM.locLai(); })],
    ['b4_presets', ev(() => { BOBAI.loc.vai = 'all'; BOBAI.ap(); HM.dong(true); HM.moPre(); })],
    ['b13_unit_common', ev(() => { HM.dong(true); UP.mo('canon'); })],
    ['b14_unit_mythic', ev(() => UP.ve('blackhole', 0))],
    ['b15_commander', ev(() => UP.veMV(Object.keys(MAVUONG)[1], 0))],
  ] },
  ...['solo', 'coop', 'pvp'].map(m => ({ url: `${BASE}?mode=${m}&deck=${DECK}&notut=1`, cho: 600, buoc: [
    ['b17_boss_' + m, async p => { await p.waitForFunction(() => typeof VT !== 'undefined' && VT.mo, null, { timeout: 20000 }).catch(() => { }); await p.evaluate(() => { VT.TONG = 999; }); await sleep(1400); }],
    ['b18_win_' + m, ev(() => { VT.dong && VT.dong(); G.dung = false; ketThuc(true); })],
    ['b18_lose_' + m, ev(() => { document.getElementById('ketqua').hidden = true; G.ketThuc = false; G.het = false; ketThuc(false, TEXT.end.coreDown); })],
  ] })),
];

const DO = () => {
  const s = document.getElementById('wrap').getBoundingClientRect().width / 430, loi = [];
  const vis = (e) => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; const cs = getComputedStyle(e); return cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
  const goc = [...document.querySelectorAll('#hm-mo:not([hidden]) .hm-tam, #chon .hm, #up:not([hidden]), #nd-gt:not([hidden]), #ketqua:not([hidden]), #onl-sanh:not([hidden]), #onl-bang:not([hidden])')];
  for (const g of goc) for (const e of g.querySelectorAll('*')) {
    if (!vis(e)) continue;
    const t = [...e.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ');
    if (!t) continue;
    let a = e, an = false; while (a) { if (a.hidden || getComputedStyle(a).display === 'none') { an = true; break; } a = a.parentElement; }
    if (an) continue;
    const fs = parseFloat(getComputedStyle(e).fontSize); // px logic (khung 430); 13 ≈ 12 px trên màn 390
    if (fs > 0 && fs < 12.95) loi.push('chữ ' + fs.toFixed(1) + 'px: ' + t.slice(0, 30) + ' <' + e.className + '>');
  }
  return loi;
};

(async () => {
  const b = await chromium.launch();
  const errs = [], bao = {};
  const ghi = (W, ten, ds) => { for (const x of ds) (bao[x] = bao[x] || []).push(W + ':' + ten); };
  for (const [W, H] of SIZES) {
    const moCtx = async () => {
      const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: +(process.env.DPR || 1) });
      await ctx.addInitScript(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true, boQua: true, buoc: {} })); } catch (e) { } });
      return ctx;
    };
    const ctx = await moCtx();
    for (const m of MAN) {
      const p = await ctx.newPage();
      p.on('pageerror', e => errs.push(W + ' :: ' + e.message));
      await p.goto(m.url, { waitUntil: 'load' });
      await p.waitForFunction(() => typeof UI !== 'undefined' && G.roster && G.roster.length && !(typeof TAI !== 'undefined' && TAI.cho), null, { timeout: 30000 }).catch(() => { });
      await sleep(m.cho || 1800);
      for (const [ten, f] of m.buoc) {
        try { await f(p); } catch (e) { errs.push(W + ' ' + ten + ' :: ' + e.message); }
        await sleep(/b18/.test(ten) ? 1700 : 600);
        ghi(W, ten, await p.evaluate(DO));
        if (OUT) await p.screenshot({ path: `${OUT}${W}_${ten}.jpg`, type: 'jpeg', quality: +(process.env.Q || 80) });
      }
      await p.close();
    }
    await ctx.close();
    // sảnh CO-OP (máy chủ giả)
    const ok = await fetch(`http://localhost:${MOCK}/`).then(() => true).catch(() => false);
    if (!ok) { errs.push('chưa chạy máy chủ giả ' + MOCK); continue; }
    const URL = `${BASE}?net=mock&mockws=ws://localhost:${MOCK}&nointro=1&notut=1`;
    const mo = async (deck) => {
      const c = await moCtx(), p = await c.newPage(); p.on('pageerror', e => errs.push(W + ' lobby :: ' + e.message));
      await p.goto(URL, { waitUntil: 'load' });
      await p.waitForFunction(() => typeof UI !== 'undefined' && UI.chon && NET.ok && typeof ONL !== 'undefined', null, { timeout: 30000 });
      await p.evaluate((d) => { UI.chon = d; UI.veBoChon(); HM.ve(); }, deck); await sleep(500);
      return { c, p };
    };
    const A = await mo(DECK.split(',')), B = await mo(['drone', 'bao', 'kiembang', 'hydra', 'anhsang']);
    const chup = async (ten) => { await sleep(400); ghi(W, ten, await A.p.evaluate(DO)); if (OUT) await A.p.screenshot({ path: `${OUT}${W}_${ten}.jpg`, type: 'jpeg', quality: +(process.env.Q || 80) }); };
    try {
      await A.p.evaluate(() => ONL.moBang()); await chup('b16_online');
      await A.p.click('[data-act="onl-tao"]');
      await A.p.waitForFunction(() => /^[A-Z]{4}$/.test((document.querySelector('#sanh-ma') || {}).textContent || ''), null, { timeout: 10000 });
      const code = await A.p.textContent('#sanh-ma');
      await chup('b16_lobby_cho');
      await B.p.evaluate(() => ONL.moBang()); await B.p.fill('#onl-ma', code); await B.p.click('[data-act="onl-vao"]');
      await A.p.waitForFunction(() => document.querySelectorAll('#sanh-ds .sanh-p:not(.trong)').length === 2, null, { timeout: 10000 });
      await chup('b16_lobby_2');
      await A.p.click('#sanh-san'); await chup('b16_lobby_ready');
    } catch (e) { errs.push(W + ' lobby :: ' + e.message); }
    await A.c.close(); await B.c.close();
  }
  await b.close();
  const ds = Object.entries(bao);
  for (const [k, v] of ds) console.log(k + '   [' + v.length + '× ' + [...new Set(v)].slice(0, 3).join(', ') + (v.length > 3 ? ', …' : '') + ']');
  console.log('\nCHỮ NHỎ/CẮT: ' + ds.length + ' loại  ·  LỖI TRANG: ' + errs.length);
  for (const e of errs) console.log('  ERR ' + e);
  process.exit(ds.length || errs.length ? 1 : 0);
})();
