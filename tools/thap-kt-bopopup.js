// TURRET MERGE — kiểm "bỏ chú thích/popup chữ trong trận" (js/bopopup.js) ở SOLO / CO-OP / PVP (390×844 DPR3).
// Chạy (gốc repo): python3 -m http.server 8765 &  ;  NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-bopopup.js
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/bopopup/';
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const DECK = 'canon,bang,tia,set,lien';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const errs = [], loi = [];
  for (const che of ['solo', 'coop', 'pvp']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
    await ctx.addInitScript(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true, boQua: true, buoc: {} })); localStorage.setItem('tm_goiy_nang', '0'); } catch (e) { } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(che + ' :: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push(che + ' console :: ' + m.text()); });
    await p.goto(`${BASE}?mode=${che}&deck=${DECK}&wave=2&notut=1&nointro=1&goiy=1`, { waitUntil: 'load' });
    await p.waitForFunction(() => typeof UI !== 'undefined' && G.ban.length && !(typeof TAI !== 'undefined' && TAI.cho), null, { timeout: 40000 }).catch(() => { });
    await sleep(2500);
    // ghi mọi chữ nổi đã VẼ (sau bộ lọc) + chữ bay DOM
    await p.evaluate(() => {
      window._chu = []; const g = FX.chu1; FX.chu1 = function (x, y, s) { const r = g.apply(this, arguments); if (r) window._chu.push(r.s); return r; };
      window._bay = []; new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.classList && (n.classList.contains('tn-bay') || n.id === 'chon-goi-nhac')) window._bay.push(n.textContent); }))).observe(document.getElementById('wrap'), { childList: true, subtree: true });
      const B = G.ban[0]; for (let i = 0; i < 15; i++) B.t[i] = null;
      const dat = (o, id, sao) => { B.t[o] = sinhU(taoU(B, id, sao, o)); };
      dat(5, 'canon', 1); dat(6, 'bang', 1); dat(8, 'canon', 2); dat(9, 'canon', 1);
      window._goiTip = !document.getElementById('tn-goi') || document.getElementById('tn-goi').hidden;
    });
    const keo = async (a, c, ten) => {
      const [p1, p2] = await p.evaluate(([a, c]) => { const B = G.ban[0], r = document.getElementById('cv').getBoundingClientRect(); const f = (o) => [r.left + B.o[o].x / W * r.width, r.top + B.o[o].y / H * r.height]; return [f(a), f(c)]; }, [a, c]);
      await p.mouse.move(p1[0], p1[1]); await p.mouse.down();
      for (let i = 1; i <= 8; i++) { await p.mouse.move(p1[0] + (p2[0] - p1[0]) * i / 8, p1[1] + (p2[1] - p1[1]) * i / 8); await sleep(30); }
      await sleep(200); await p.screenshot({ path: OUT + che + '_' + ten + '_giu.png' });
      await p.mouse.up(); await sleep(380); await p.screenshot({ path: OUT + che + '_' + ten + '_tha.png' }); await sleep(600);
    };
    await keo(5, 6, 'khacloai');   // khác loại
    await keo(9, 8, 'khacsao');    // khác sao
    const ghepSai = await p.evaluate(() => [G.ban[0].t[5] && G.ban[0].t[5].id, G.ban[0].t[6] && G.ban[0].t[6].id, G.ban[0].t[8] && G.ban[0].t[8].sao]);
    // triệu hồi 0 mana
    await p.evaluate(() => { G.ban[0].mana = 0; G.dung = true; });
    await sleep(100);
    await p.click('#nut-trieu'); await sleep(90);
    const chop = await p.evaluate(() => document.getElementById('mana-hop').classList.contains('bp-chop')); await p.evaluate(() => { G.dung = false; });
    await p.screenshot({ path: OUT + che + '_trieu_0mana.png' }); await sleep(700);
    // bàn đầy
    await p.evaluate(() => { const B = G.ban[0]; for (let i = 0; i < 15; i++) if (!B.t[i]) B.t[i] = sinhU(taoU(B, B.deck[i % 5], 1 + (i % 3), i)); B.mana = 500; });
    await sleep(400); await p.click('#nut-trieu'); await sleep(250);
    const day = await p.evaluate(() => { const n = document.getElementById('nut-trieu'), f = n.querySelector('.tn-full'); return { day: n.classList.contains('tn-day'), op: getComputedStyle(n).opacity, chuHien: !!(f && f.offsetParent) }; });
    await p.screenshot({ path: OUT + che + '_bandau.png' });
    // xem nhanh (inspect strip) của 1 ụ
    await p.evaluate(() => { const T = G.ban[0].t.find(Boolean); UI.moTT(T.id, T); }); await sleep(400);
    await p.screenshot({ path: OUT + che + '_xemnhanh.png' });
    const kq = await p.evaluate(() => ({ chu: window._chu.filter(s => !/^[+−\-]?[0-9]/.test(s)), bay: window._bay.filter(s => s), tip: window._goiTip, tt: (document.getElementById('tt') || {}).textContent || '' }));
    console.log(che, JSON.stringify({ ghepSai, chop, day, ...kq, tt: kq.tt.slice(0, 120) }));
    if (kq.chu.some(s => /DIFFER|FULL|MANA|MERGE|TAP|FROZEN/i.test(s))) loi.push(che + ': chữ nổi ' + kq.chu);
    if (kq.bay.length) loi.push(che + ': chữ bay ' + kq.bay);
    if (!chop) loi.push(che + ': mana không chớp');
    if (!day.day || day.chuHien || +day.op > 0.6) loi.push(che + ': bàn đầy ' + JSON.stringify(day));
    if (ghepSai[0] !== 'canon' || ghepSai[1] !== 'bang' || ghepSai[2] !== 2) loi.push(che + ': ghép sai vẫn ghép ' + ghepSai);
    // bật BATTLE HINTS → chữ cũ hiện lại
    await p.evaluate(() => { BP.dat(true); window._chu = []; const B = G.ban[0]; for (let i = 0; i < 15; i++) B.t[i] = null; B.t[5] = sinhU(taoU(B, 'canon', 1, 5)); B.t[6] = sinhU(taoU(B, 'bang', 1, 6)); });
    await keo(5, 6, 'goiy_bat');
    const bat = await p.evaluate(() => { const r = window._chu.slice(); BP.dat(false); return r; });
    console.log(che, 'hints ON →', JSON.stringify(bat));
    if (!bat.some(s => /DIFFER/.test(s))) loi.push(che + ': bật gợi ý không hiện lại');
    await ctx.close();
  }
  await b.close();
  console.log('page errors:', errs.length ? errs : 'none');
  console.log(loi.length ? 'LỖI:\n' + loi.join('\n') : 'XANH');
  process.exit(loi.length || errs.length ? 1 : 0);
})();
