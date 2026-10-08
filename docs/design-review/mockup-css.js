// Mockup thẩm mỹ (designer, v233): chèn CSS tạm vào game thật rồi chụp trước/sau. Cần nen-menu-px.png (nen-menu.jpg thu 534×248, 64 màu, phóng nearest ×3) cạnh file này. Không phải code game.
const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const URL = 'file:///home/user/new-project/index.html';
const SAVE = { unlocked: 20, storySeen: true, settings: { skipStory: true }, owned: ['giong','llq','kimquy','thachsanh','caolo'], kho: 50000 };
const PX = fs.readFileSync(__dirname + '/nen-menu-px.png').toString('base64');
// dải hoa văn trống đồng Đông Sơn (vòng tròn chấm + răng cưa), 24×12 lặp ngang
const STRIP = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="12" shape-rendering="crispEdges"><rect width="24" height="12" fill="#2A1C10"/><path d="M0 12 L4 8 L8 12 L12 8 L16 12 L20 8 L24 12Z" fill="#7A5420"/><rect x="0" y="0" width="24" height="1" fill="#C9963A"/><circle cx="12" cy="4" r="3" fill="none" stroke="#D9A84E" stroke-width="1"/><rect x="11" y="3" width="2" height="2" fill="#F2D27A"/><rect x="2" y="3" width="2" height="2" fill="#9A6A28"/><rect x="20" y="3" width="2" height="2" fill="#9A6A28"/></svg>`);
const CSS = `
body, body * { font-variant-numeric: lining-nums tabular-nums !important; font-feature-settings: "lnum" 1, "tnum" 1 !important; }
/* menu */
#menu .keyart, #menu-art img { image-rendering: pixelated !important; }
#menu::after { content:''; position:absolute; inset:0; pointer-events:none; z-index:1;
  background: radial-gradient(ellipse 70% 75% at 40% 45%, transparent 55%, #0B0704CC 100%), linear-gradient(180deg, transparent 70%, #0B0704AA 100%); }
#menu > *:not(.bgart) { z-index: 2; }
#menu .mc-nav { background: #160F09F2 !important; border: 3px solid #8C6A2E !important; box-shadow: 0 0 0 3px #1A110A, 0 0 40px #F2B44A33, 0 12px 30px #000c !important; }
#menu .mc-nav::before, #menu .mc-nav::after { content:''; position:absolute; left:6px; right:6px; height:12px; background:url("${STRIP}") repeat-x; background-size:auto 100%; image-rendering:pixelated; }
#menu .mc-nav::before { top:6px; } #menu .mc-nav::after { bottom:6px; transform:scaleY(-1); }
#menu .orn2 { opacity:0; }
#menu .mc-btn.main { filter: drop-shadow(0 0 10px #FFB44A88); }
#menu .mc-subs { gap: 8px !important; }
#menu .mc-sub { min-height: 40px; padding: 0 10px !important; background:#2A1C10 !important; border:2px solid #6A4E22 !important; border-radius:2px; text-decoration:none !important; color:#F2D27A !important; flex:1 1 0; min-width:0; white-space:nowrap; font-size:.9em; justify-content:center; display:flex; align-items:center; gap:4px; }

/* trong trận */
#game { filter: saturate(1.12) contrast(1.08) sepia(.08); }
#mockvig { position:absolute; inset:0; pointer-events:none; z-index:5; background: radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, #0B0704D0 100%), linear-gradient(180deg,#FFD08A14,#3A200A1A); mix-blend-mode: normal; }
#topbar { border-bottom: 0 !important; }
#topbar::after { content:''; position:absolute; left:0; right:0; bottom:-12px; height:12px; background:url("${STRIP}") repeat-x; background-size:auto 100%; image-rendering:pixelated; pointer-events:none; }
#topbar .btn { min-height: 40px; min-width: 40px; }
#deck { box-shadow: 0 -6px 18px #000a; }
`;
(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  for (const [w, h] of [[1920, 934], [844, 390]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    await p.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, (r) => { try { const u = r.request().url(); const body = require('child_process').execFileSync('curl', ['-sS', '-m', '20', '-A', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36', u]); r.fulfill({ body, contentType: /googleapis/.test(u) ? 'text/css' : 'font/woff2' }); } catch (e) { r.abort(); } });
    await p.addInitScript((s) => localStorage.setItem('nuicao.v1', JSON.stringify(s)), SAVE);
    await p.goto(URL); await p.waitForTimeout(1800);
    const tag = `${w}x${h}`;
    await p.screenshot({ path: `mock/${tag}-menu-truoc.png` });
    await p.addStyleTag({ content: CSS });
    await p.evaluate((px) => { document.querySelectorAll('#menu-art img').forEach((i) => { i.src = 'data:image/png;base64,' + px; }); }, PX);
    await p.waitForTimeout(500);
    await p.screenshot({ path: `mock/${tag}-menu-sau.png` });
    // trận: cùng cảnh, trước rồi sau
    await p.evaluate(() => { ui.hideOverlays(); ui.startLevel(2); document.querySelector('[data-act=prep-go]').click(); });
    await p.waitForTimeout(800);
    await p.evaluate(() => { const g = ui.game; g.gold = 99999; const T = ['lactuong', 'xathu', 'thaymo', 'thansuong', 'thachsanh', 'caolo', 'giong', 'llq'];
      let k = 0; for (let s = 0; s < 40 && k < T.length; s++) { if (!g.heroes[s] && g.canPlace(s, T[k]) === true) { g.spawnHero(s, T[k], { tier: 1 + (k % 3) }); k++; } }
      g.running = true; g.startWave(); });
    await p.waitForTimeout(2500);
    await p.evaluate(() => { const g = ui.game; Object.keys(ENEMIES).filter((k) => !ENEMIES[k].boss).slice(0, 8).forEach((k, i) => { try { g.spawn(k, 80 + i * 50); } catch (e) {} }); g.spawn('thuongluong', 40); });
    await p.waitForTimeout(1500);
    await p.evaluate(() => { ui.game.running = false; document.querySelectorAll('#banner,#dialogue').forEach((e) => e.hidden = true); });
    await p.waitForTimeout(300);
    // tắt CSS mockup để chụp "trước"
    await p.evaluate(() => { const s = [...document.querySelectorAll('style')].pop(); s.disabled = true; });
    await p.waitForTimeout(200);
    await p.screenshot({ path: `mock/${tag}-tran-truoc.png` });
    await p.evaluate(() => { const s = [...document.querySelectorAll('style')].pop(); s.disabled = false; const v = document.createElement('div'); v.id = 'mockvig'; document.getElementById('game').parentElement.appendChild(v); });
    await p.waitForTimeout(300);
    await p.screenshot({ path: `mock/${tag}-tran-sau.png` });
    await ctx.close();
  }
  await b.close();
})();
