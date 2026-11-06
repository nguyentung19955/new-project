// TURRET MERGE — Copycat ≠ Twin Maker trên bàn (390×844 DPR3): đặt Twin Maker, Copycat, 1 bản sao Copycat (banSao) + ụ thật cùng loại,
// chụp bàn SOLO / CO-OP / PVP (bàn mình + bàn bạn/đối thủ). ?ucu=1 = bộ đầu cũ (không áp vì saochep là ảnh mới) → dùng OLD=1 để nạp *_v2old.
// Chạy: python3 -m http.server 8765 & ; NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-copycat.js [thư mục ra]
const { chromium } = require('playwright');
const OUT = (process.argv[2] || '/tmp/claude-0/s/cc') + '/';
require('fs').mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch();
  const errs = [];
  for (const mode of ['solo', 'coop', 'pvp']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(mode + ' pageerror ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push(mode + ' console ' + m.text()); });
    p.on('response', r => { if (r.status() >= 400) errs.push(mode + ' HTTP ' + r.status() + ' ' + r.url()); });
    if (process.env.OLD) await p.route(/assets\/(nho\/)?saochep(_nong)?\.png/, (r) => r.continue({ url: r.request().url().replace('.png', '_v2old.png') }));
    await p.goto('http://localhost:8765/thap/?mode=' + mode + '&deck=sinhdoi,saochep,canon,bang,tia&wave=1&mana=0', { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length && !TAI.cho, null, { timeout: 30000 });
    await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 }); await p.waitForTimeout(800);
    await p.evaluate(() => {
      G.quai = [];
      for (const B of G.ban) {
        for (let i = 0; i < 15; i++) B.t[i] = null;
        const put = (o, id, s) => { B.t[o] = sinhU(taoU(B, id, s, o)); B.t[o].vxA = null; return B.t[o]; };
        put(5, 'sinhdoi', 2); put(6, 'saochep', 2); put(7, 'sinhdoi', 2); put(8, 'saochep', 2);
        put(10, 'canon', 2); put(11, 'canon', 2).banSao = true; put(12, 'bang', 1); put(13, 'bang', 1).banSao = true;
      }
      G.dung = false;
    });
    await p.waitForTimeout(1200);
    await p.screenshot({ path: OUT + mode + (process.env.OLD ? '_truoc' : '') + '.png' });
    await ctx.close();
  }
  await b.close();
  console.log(errs.length ? errs.join('\n') : '✓ không lỗi trang');
  process.exit(errs.length ? 1 : 0);
})();
