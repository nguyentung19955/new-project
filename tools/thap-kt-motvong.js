// TURRET MERGE — kiểm MỘT VÒNG (06/11): bàn Leviathan ×5 + Wyrm + Combo Core + Werewolf + Hive Queen (iPhone 13, DPR 3)
// chạy (gốc repo): python3 -m http.server 8765 &  ·  NODE_PATH=/opt/npm-tools/node_modules OUT=docs/demo-hop-tuong/tuvan/mot-vong/ TEN=sau node tools/thap-kt-motvong.js
//  BASE=http://localhost:8766 TEN=truoc → chụp bản cũ để so. Ra: <TEN>_ban.png (bàn), <TEN>_ban_crop.png, <TEN>_tt_en.png / _tt_vi.png (bảng chạm), <TEN>_file_<lang>.png (trang ụ)
const { chromium, devices } = require('playwright');
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/mot-vong/', TEN = process.env.TEN || 'sau', BASE = process.env.BASE || 'http://localhost:8765';
const DECK = 'leviathan,ronglua,combo,soi,chuato';
const BAN = [ // [ô, id, sao, nap]
  [0, 'leviathan', 3, 0.45], [1, 'leviathan', 4, 1], [2, 'leviathan', 5, 0.8], [3, 'leviathan', 7, 0.25], [4, 'leviathan', 7, 1],
  [5, 'ronglua', 5, 0.6], [6, 'combo', 4, 0], [7, 'soi', 5, 0], [8, 'chuato', 5, 0], [9, 'ronglua', 7, 1],
  [10, 'combo', 7, 0], [11, 'chuato', 7, 0], [12, 'soi', 3, 0], [13, 'leviathan', 2, 0], [14, 'chuato', 2, 0],
];
(async () => {
  const b = await chromium.launch();
  const errs = [];
  for (const lang of ['en', 'vi']) {
    const ctx = await b.newContext({ ...devices['iPhone 13'] });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(lang + ': ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load/.test(m.text())) errs.push(lang + ' console: ' + m.text()); });
    await p.goto(BASE + '/thap/?mode=solo&deck=' + DECK + '&wave=20&mana=99999&lang=' + lang, { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length, null, { timeout: 60000 });
    await p.waitForTimeout(2500);
    const box = await p.evaluate((BAN) => {
      G.hang.length = 0; G.quai.length = 0; G.hu.length = 0; G.dan.length = 0; G.cho = 1e9; G.ketThuc = null;
      const B = G.ban[0]; B.tim = 1e9; B.t.fill(null); B.combo = 12;
      for (const [o, id, sao, nap] of BAN) { const T = sinhU(taoU(B, id, sao, o)); B.t[o] = T; T.nap = nap; if (id === 'leviathan') T.vuc = 30; if (id === 'soi' && sao >= 5) T.thuc = true; }
      const p0 = G.duong[0];
      for (let i = 0; i < 8; i++) { const E = sinhQuai('bo', 0, p0.len * (0.05 + i * 0.03), 400); E.vao = 1; E.chan = 1e9; }
      document.querySelectorAll('#nd-gt').forEach(e => e.hidden = true);
      // khung bao bàn (px CSS)
      const r = document.getElementById('cv').getBoundingClientRect(), k = r.width / W;
      const xs = B.o.map(c => c.x), ys = B.o.map(c => c.y);
      return { x: r.left + (Math.min(...xs) - B.cw * 0.6) * k, y: r.top + (Math.min(...ys) - B.ch * 0.6) * k, w: (Math.max(...xs) - Math.min(...xs) + B.cw * 1.2) * k, h: (Math.max(...ys) - Math.min(...ys) + B.ch * 1.2) * k };
    }, BAN);
    await p.waitForTimeout(1200);
    await p.evaluate(() => { for (const T of G.ban[0].t) if (T && T.id === 'leviathan' && T.sao >= 3 && T.o !== 0 && T.o !== 3 && T.o !== 2) T.nap = 1; G.dung = true; });
    await p.waitForTimeout(200);
    if (lang === 'en') {
      await p.screenshot({ path: OUT + TEN + '_ban.png' });
      await p.screenshot({ path: OUT + TEN + '_ban_crop.png', clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.min(390, box.w), height: box.h } });
    }
    await p.evaluate(() => { G.dung = false; });
    // bảng chạm: Leviathan 4★ đầy chiêu
    for (const [o, ten] of [[1, 'lev'], [6, 'combo'], [7, 'soi']]) {
      await p.evaluate((o) => { const T = G.ban[0].t[o]; UI.moTT(T.id, T); }, o);
      await p.waitForTimeout(500);
      const tt = await p.$('#tt');
      if (tt) await tt.screenshot({ path: OUT + TEN + '_tt_' + ten + '_' + lang + '.png' }).catch(() => { });
      const dong = await p.evaluate(() => { const d = document.querySelector('#tt .d-mv'); return d ? d.textContent : null; });
      console.log(lang, ten, '→', dong);
      await p.evaluate(() => { if (UI.dongTT) UI.dongTT(); else { const t = document.getElementById('tt'); if (t) t.hidden = true; } });
      await p.waitForTimeout(200);
    }
    // Turret File (trang ụ) Leviathan → Details
    await p.evaluate(() => { G.dung = true; UP.mo('leviathan'); });
    await p.waitForTimeout(800);
    await p.evaluate(() => { const m = document.querySelector('[data-up="more"]'); if (m) m.click(); });
    await p.waitForTimeout(800);
    await p.evaluate(() => { const s = [...document.querySelectorAll('.up-muc')].find(x => /icons|Biểu tượng/i.test(x.textContent)); if (s) s.scrollIntoView(); });
    await p.waitForTimeout(400);
    await p.screenshot({ path: OUT + TEN + '_file_' + lang + '.png' });
    await ctx.close();
  }
  console.log('ERR', JSON.stringify(errs.slice(0, 10)));
  await b.close();
  process.exit(errs.length ? 1 : 0);
})();
