// TURRET MERGE — chụp clip hướng dẫn kỹ năng của MỌI ụ (390×844): mỗi chú thích 1 khung (+ khung số liệu cuối vòng),
// ghi lỗi trang, sự kiện chờ bị trượt (SD.thieu), chữ chú thích → OUT/<id>.png (dải) + OUT/kq.json.
// Chạy: BASE=http://localhost:8765/thap/ OUT=/tmp/hd node tools/thap-chup-huongdan.js [id,id…] [sao=4]
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = (process.env.OUT || '/tmp/hd').replace(/\/?$/, '/');
const SAO = process.argv[3] || '4', J = +(process.env.J || 4);
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const br = await chromium.launch();
  let ids = process.argv[2] && process.argv[2] !== 'all' ? process.argv[2].split(',') : null;
  if (!ids) { const p = await br.newPage(); await p.goto(BASE + 'index.html?preview=lien&notut=1'); await p.waitForFunction(() => window.SD && SD.ks && window.ROSTER_EMBED, null, { timeout: 60000 }); ids = await p.evaluate(() => ROSTER_EMBED.filter(r => SKILLS[r.id]).map(r => r.id)); await p.close(); }
  const kq = fs.existsSync(OUT + 'kq.json') ? JSON.parse(fs.readFileSync(OUT + 'kq.json')) : {};
  const hang = ids.slice();
  async function moTrang() {
    const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const p = await ctx.newPage(); p.errs = [];
    p.on('pageerror', e => p.errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) p.errs.push(m.text().slice(0, 160)); });
    await p.goto(BASE + 'index.html?preview=lien&star=' + SAO + '&notut=1&lang=' + (process.env.LANG_TM || 'en'));
    await p.waitForFunction(() => window.SD && SD.id && SD.ks, null, { timeout: 300000 });
    await p.waitForTimeout(1500); p.ctx = ctx; return p;
  }
  async function lam(p, id) {
    p.errs.length = 0; const errs = p.errs;
    try {
      await p.evaluate(([id, s]) => { SD.bat(id, +s, 0); SD.thieu = []; SD.xep(); }, [id, SAO]);
      const info = await p.evaluate(() => ({ dai: SD.ks.dai, ts: SD.ks.c.map(c => c[0]) }));
      const times = info.ts.map((t, i) => Math.min(info.dai - 2.6, (info.ts[i + 1] != null ? Math.min(t + 1.1, info.ts[i + 1] - 0.05) : t + 1.1)));
      times.push(info.dai - 1.3); times.push(info.dai - 0.15);
      const lap = await p.evaluate(() => SD.lap), shots = [];
      for (const t of times) {
        await p.waitForFunction(([t, lap]) => SD.t >= t || SD.lap !== lap, [t, lap], { timeout: 60000, polling: 16 });
        const r = await p.evaluate(() => { const c = REN.cv.getBoundingClientRect(), k = c.width / W; let cap = ''; try { const o = SD.t >= SD.ks.dai - 2.4 ? null : SD.cauChu(); cap = o ? o.chu : '(end card)'; } catch (e) { } return { x: c.x, y: c.y + 112 * k, w: c.width, h: 420 * k, t: SD.t, cap }; });
        shots.push({ t: r.t, cap: r.cap, b: (await p.screenshot({ clip: { x: r.x, y: r.y, width: r.w, height: r.h }, type: 'jpeg', quality: 80 })).toString('base64') });
      }
      const extra = await p.evaluate(() => ({ thieu: SD.thieu || [], moSao: SD.moSao, moc: (SD.mocChu() || {}).chu || '', caps: SD.ks.c.map(c => { let v = c[1]; if (typeof v === 'function') { try { v = v(SD.T || {}, (SD.T || {}).sao || SD.sao); } catch (e) { v = 'ERR ' + e.message; } } return [c[0], v]; }) }));
      const png = await p.evaluate(async ([shots, id]) => {
        const ims = await Promise.all(shots.map(s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/jpeg;base64,' + s.b; })));
        const w = ims[0].width, h = ims[0].height, cv = document.createElement('canvas'); cv.width = w * ims.length + 6 * (ims.length - 1); cv.height = h + 30;
        const x = cv.getContext('2d'); x.fillStyle = '#0d0f12'; x.fillRect(0, 0, cv.width, cv.height);
        ims.forEach((im, i) => { x.drawImage(im, i * (w + 6), 0); x.fillStyle = '#ffe46b'; x.font = 'bold 18px sans-serif'; x.fillText(id + ' t=' + shots[i].t.toFixed(1), i * (w + 6) + 8, h + 22); });
        return cv.toDataURL('image/jpeg', 0.8).split(',')[1];
      }, [shots, id]);
      fs.writeFileSync(OUT + id + '.jpg', Buffer.from(png, 'base64'));
      kq[id] = { errs: errs.slice(), ...extra, frames: shots.map(s => [+s.t.toFixed(2), s.cap]) };
    } catch (e) { kq[id] = { errs: errs.concat(['CHỤP LỖI: ' + e.message.slice(0, 200)]) }; }
    fs.writeFileSync(OUT + 'kq.json', JSON.stringify(kq, null, 1));
    console.log(id, (kq[id].errs || []).length ? 'ERR ' + kq[id].errs.join(' | ').slice(0, 200) : 'ok', (kq[id].thieu || []).length ? 'THIẾU ' + kq[id].thieu.join(',') : '');
  }
  await Promise.all(Array.from({ length: J }, async () => { const p = await moTrang(); while (hang.length) await lam(p, hang.shift()); await p.ctx.close(); }));
  fs.writeFileSync(OUT + 'kq.json', JSON.stringify(kq, null, 1));
  await br.close();
})();
