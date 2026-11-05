// TURRET MERGE — chụp trước/sau HUD v2 (docs/demo-hop-tuong/thap-art/TU-VAN-HUD.txt).
// Chạy: python3 -m http.server 8765 (ở gốc repo) rồi OUT=thu-muc/TIEN_TO node tools/thap-kt-hud2.js 390 844
const { chromium } = require('playwright');
const OUT = process.env.OUT || 'shots/';
const W = +(process.argv[2] || 390), H = +(process.argv[3] || 844);
const URL = 'http://localhost:8765/thap/';
const DECK = 'canon,bang,tia,set,lien';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const errs = [];
  const mo = async (q, cho = 1500) => {
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(q + ' :: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push(q + ' :: console ' + m.text()); });
    p.on('response', r => { if (r.status() >= 400) errs.push(q + ' :: HTTP ' + r.status() + ' ' + r.url()); });
    await p.goto(URL + q, { waitUntil: 'load' }); await p.waitForTimeout(cho); return p;
  };
  const chup = (p, ten) => p.screenshot({ path: OUT + W + '_' + ten + '.png' });
  let p = await mo('');
  await chup(p, '01-menu');
  await p.evaluate(() => { const l = document.querySelector('#chon-luoi'); l.scrollTop = 900; });
  await p.waitForTimeout(300); await chup(p, '02-deck');
  await p.close();
  p = await mo('', 1500); await p.evaluate(() => UP.mo('canon')); await p.waitForTimeout(1500); await chup(p, '12-unitpage'); await p.close();
  p = await mo('?mode=solo&deck=' + DECK + '&wave=3&fill=4&mana=260', 2500);
  await chup(p, '03-solo');
  await p.evaluate(() => { const B = G.ban[0]; for (const i of [12, 13, 14]) B.t[i] = null; B.mana = 260; }); await p.waitForTimeout(300); await chup(p, '06a-summon-san');
  let fps = await p.evaluate(() => new Promise(ok => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else ok(n / ((performance.now() - t0) / 1000)); }; requestAnimationFrame(f); }));
  // nhấn Summon (giữ trạng thái nhấn)
  await p.evaluate(() => { const B = G.ban[0]; for (const i of [12, 13, 14]) B.t[i] = null; document.querySelector('#nut-trieu').classList.add('an'); }); await p.waitForTimeout(150); await chup(p, '06-summon-an');
  await p.evaluate(() => { document.querySelector('#nut-trieu').classList.remove('an'); G.ban[0].mana = 0; }); await p.waitForTimeout(300); await chup(p, '07-summon-thieu');
  // bấm thật khi thiếu → rung nhẹ
  await p.evaluate(() => document.querySelector('#nut-trieu').click()); await p.waitForTimeout(60); await chup(p, '07b-summon-thieu-bam');
  // ghép
  await p.evaluate(() => {
    const B = G.ban[0]; B.mana = 999; let a = null, c = null;
    for (const x of B.t) for (const y of B.t) if (!a && x && y && x !== y && hopLeGhep(x, y)) { a = x; c = y; }
    if (!a) { const t = B.t.find(Boolean); const o = B.t.findIndex(v => !v); B.t[o] = sinhU(taoU(B, t.id, t.sao, o)); a = B.t[o]; c = t; }
    UI.xemGhep = ghep(B, a, c);
    if (window.HUD2 && HUD2.ghep) HUD2.ghep(B, a, c);
  });
  await p.waitForTimeout(110); await chup(p, '08a-ghep');
  await p.waitForTimeout(220); await chup(p, '08b-ghep');
  // triệu hồi thật
  await p.evaluate(() => document.querySelector('#nut-trieu').click()); await p.waitForTimeout(90); await chup(p, '08c-trieu');
  // bảng chạm ụ
  await p.waitForTimeout(900);
  await p.evaluate(() => { const T = G.ban[0].t.find(Boolean); UI.moTT(T.id, T); }); await p.waitForTimeout(300); await chup(p, '11-tt');
  await p.evaluate(() => { document.querySelector('#tt').hidden = true; document.querySelector('[data-act="dung"]').click(); }); await p.waitForTimeout(300); await chup(p, '09-tamdung');
  await p.evaluate(() => { document.querySelector('[data-act="tiep"]').click(); ketThuc(false, 'Core destroyed'); }); await p.waitForSelector('#ketqua:not([hidden])', { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(500); await chup(p, '10-ketqua-thua');
  await p.close();
  p = await mo('?mode=solo&deck=' + DECK + '&wave=8&fill=6&mana=40', 2500);
  await p.evaluate(() => { G.ban[0].tim = 1; }); await p.waitForTimeout(600); await chup(p, '03b-solo-1tim');
  await p.close();
  p = await mo('?mode=coop&deck=' + DECK + '&wave=3&fill=3&mana=260', 2500); await chup(p, '04-coop');
  console.log(await p.evaluate(() => { const e = document.elementFromPoint(6, 3); return e && (e.id + '.' + e.className + ' ' + e.tagName); })); await p.close();
  p = await mo('?mode=pvp&deck=' + DECK + '&wave=3&fill=3&mana=260', 2500); await chup(p, '05-pvp'); await p.close();
  console.log(JSON.stringify({ W, fps: Math.round(fps), errs: errs.slice(0, 12) }));
  await b.close();
})();
