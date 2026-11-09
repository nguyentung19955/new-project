// TURRET MERGE — chụp TRẬN ĐÔNG (wave 30, bàn đầy, tự chơi) để soi độ dày hiệu ứng (tuvan/anim-bac: dịu nổ Đỏ, Vàng/Tím không lấn Đỏ).
// node tools/thap-chup-trandong.js [Q] [OUT] — Q='&dodiu=0&vsig=0' = bản trước. 390×844 DPR 2; 4 ảnh cách 0,5 s sau ~14 s trận.
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8813/thap/', Q = process.argv[2] || '', OUT = process.argv[3] || '/dev/shm/anim/dong';
require('fs').mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }), errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(`${BASE}?mode=solo&deck=${process.env.DECK || 'overlord,ronglua,leviathan,nemesis,mauhut'}&wave=30&fill=5&auto=1&mana=99999&notut=1${Q}`, { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length && !TAI.cho, null, { timeout: 40000 });
  await p.waitForTimeout(+(process.env.CHO || 30000));
  for (let i = 0; i < 4; i++) { await p.screenshot({ path: `${OUT}/dong${i}.jpg`, type: 'jpeg', quality: 80 }); await p.waitForTimeout(500); }
  console.log(JSON.stringify({ Q, t: await p.evaluate(() => G.t), quai: await p.evaluate(() => G.quai.filter(E => !E.chet).length), vsg: await p.evaluate(() => typeof VSG !== 'undefined' ? VSG.loi || 'ok' : '-'), errs }));
  await b.close();
})();
