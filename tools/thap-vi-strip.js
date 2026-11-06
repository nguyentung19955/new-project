// TURRET MERGE — dải khung clip kỹ năng (Tiếng Việt): node tools/thap-vi-strip.js <id> [sao=3] [t1,t2,...] [gd] → docs/demo-hop-tuong/tuvan/ngonngu/<id>_s<sao>_strip.png
const { chromium } = require('playwright');
const fs = require('fs');
const [id, star = '3', ts = '0.5,1.8,2.8,3.6,4.8,6.6', gd = '0'] = process.argv.slice(2);
const times = ts.split(',').map(Number);
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/ngonngu/';
(async () => {
  const br = await chromium.launch();
  const p = await br.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(`http://localhost:8765/thap/index.html?preview=${encodeURIComponent(id)}&star=${star}&notut=1&lang=${process.env.LANG_TM || "vi"}${+gd ? '&gd=' + gd : ''}`);
  await p.waitForFunction(() => window.SD && SD.id && SD.ks);
  // restart the loop cleanly once fonts/images are warm
  await p.waitForTimeout(1500); await p.evaluate(() => SD.xep());
  const lap = await p.evaluate(() => SD.lap);
  const shots = [];
  for (const t of times) {
    await p.waitForFunction(([t, lap]) => SD.t >= t || SD.lap !== lap, [t, lap], { timeout: 30000, polling: 16 });
    const r = await p.evaluate(() => { const c = REN.cv.getBoundingClientRect(), k = c.width / W; return { x: c.x, y: c.y + 150 * k, w: c.width, h: 380 * k, t: SD.t, cap: (SD.cauChu() || {}).chu }; });
    shots.push({ t: r.t, cap: r.cap, b: (await p.screenshot({ clip: { x: r.x, y: r.y, width: r.w, height: r.h } })).toString('base64') });
  }
  const q = await br.newPage();
  const png = await q.evaluate(async (shots) => {
    const ims = await Promise.all(shots.map(s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s.b; })));
    const w = ims[0].width, h = ims[0].height, cv = document.createElement('canvas'); cv.width = w * ims.length + 8 * (ims.length - 1); cv.height = h + 34;
    const x = cv.getContext('2d'); x.fillStyle = '#0d0f12'; x.fillRect(0, 0, cv.width, cv.height);
    ims.forEach((im, i) => { x.drawImage(im, i * (w + 8), 0); x.fillStyle = '#ffe46b'; x.font = 'bold 22px sans-serif'; x.fillText('t=' + shots[i].t.toFixed(1) + 's', i * (w + 8) + 10, h + 26); });
    return cv.toDataURL('image/png').split(',')[1];
  }, shots);
  const f = OUT + id.replace(':', '_') + '_s' + star + (+gd ? 'g' + gd : '') + '_strip.png';
  fs.writeFileSync(f, Buffer.from(png, 'base64'));
  console.log(f, errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no errors'); shots.forEach(s => console.log('  ' + s.t.toFixed(2) + '  ' + s.cap));
  await br.close();
})();
