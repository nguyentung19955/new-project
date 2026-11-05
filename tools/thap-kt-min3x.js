// TURRET MERGE — đo ẢNH BỊ PHÓNG trên màn 3× (iPhone 430×932 DPR 3, ép ?dpr=3 để máy chậm không lùi về 2×).
// Mọi drawImage lên canvas: tỉ lệ = điểm ảnh màn / điểm ảnh PNG gốc (lần theo cả ảnh thu nhỏ sẵn trong bộ đệm); DOM: <img>, nền, border-image.
// Chạy: python3 -m http.server 8765 (ở gốc repo) rồi  node tools/thap-kt-min3x.js /tmp/do.json [430 932]   (QUICK=1: 3 trận)
// Kết quả: all{tên: r (tỉ lệ lớn nhất), rx, ry, dev (cỡ màn lớn nhất), png, st (chỗ vẽ)}, dom, mem (REN.boNho mỗi màn), errs.
// Đạt: r ≤ 1.05 (tia/dải kéo dài: chỉ xét chiều ngang tia). Quy tắc: thap/QUY-TAC-HINH.md mục 5.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
function DO() {
  const P = CanvasRenderingContext2D.prototype, orig = P.drawImage;
  const REC = (window.__AU = {}); // ten -> {r: max ratio, px: max device size, png: [w,h]}
  const tagOf = (s) => {
    if (s instanceof HTMLImageElement) {
      const m = /assets\/(.+?)\.(png|jpg|webp)/.exec(s.src || ''); if (!m) return null;
      return { n: m[1], f: 1, w: s.naturalWidth, h: s.naturalHeight };
    }
    if (s && s.__t) return s.__t;
    return null;
  };
  P.drawImage = function (s, ...a) {
    try {
      const t = tagOf(s);
      if (t) {
        let sw, sh, dw, dh;
        const W = s.naturalWidth || s.width, H = s.naturalHeight || s.height;
        if (a.length === 2) { sw = W; sh = H; dw = W; dh = H; }
        else if (a.length === 4) { sw = W; sh = H; dw = a[2]; dh = a[3]; }
        else { sw = a[2]; sh = a[3]; dw = a[6]; dh = a[7]; }
        const m = this.getTransform(), kx = Math.hypot(m.a, m.b), ky = Math.hypot(m.c, m.d);
        const rx = Math.abs(kx * dw / sw) * t.f, ry = Math.abs(ky * dh / sh) * t.f, r = Math.max(rx, ry);
        const cv = this.canvas, main = cv && cv.id === 'cv';
        if (main || r > 1.05) {
          const e = REC[t.n] || (REC[t.n] = { r: 0, rx: 0, ry: 0, rmin: 0, dev: 0, png: [t.w, t.h], via: '' }); if (rx > e.rx) e.rx = rx; if (ry > e.ry) e.ry = ry; const mn = Math.min(rx, ry); if (mn > e.rmin) e.rmin = mn;
          const dev = Math.max(Math.abs(kx * dw), Math.abs(ky * dh));
          if (r > e.r) { e.r = r; e.via = main ? 'main' : 'off'; e.st = (new Error().stack || '').split('\n').slice(2, 4).map(x => x.trim().replace(/^at /, '').replace(/https?:\/\/[^/]+\/thap\//, '')).join(' < '); }
          if (main && dev > e.dev) e.dev = dev;
          if (main) { const P = window.__POS || (window.__POS = {}); const xs = [], ys = []; for (const [u, v] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { const px = (a.length === 2 ? a[0] : a.length === 4 ? a[0] : a[4]) + u * dw, py = (a.length === 2 ? a[1] : a.length === 4 ? a[1] : a[5]) + v * dh; xs.push(m.a * px + m.c * py + m.e); ys.push(m.b * px + m.d * py + m.f); } P[t.n] = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), performance.now()]; }
        }
        if (cv && !main) {
          const area = Math.abs(dw * dh);
          if (!cv.__t || area > (cv.__ta || 0) || cv.__tw !== cv.width) { cv.__t = { n: t.n, f: r, w: t.w, h: t.h }; cv.__ta = area; cv.__tw = cv.width; }
        }
      }
    } catch (e) {}
    return orig.call(this, s, ...a);
  };
  // DOM: <img> + background-image + border-image
  window.__AUDOM = () => {
    const dpr = devicePixelRatio, out = {};
    const put = (n, r, dev, png, how) => { const e = out[n] || (out[n] = { r: 0, dev: 0, png, how }); if (r > e.r) { e.r = r; e.how = how; } if (dev > e.dev) e.dev = dev; };
    const nat = {};
    const natOf = (u) => nat[u];
    for (const el of document.querySelectorAll('*')) {
      for (const ps of [null, '::before', '::after']) {
        const cs = getComputedStyle(el, ps);
        if (ps && (cs.content === 'none' || cs.content === 'normal')) continue;
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const rc = el.getBoundingClientRect(); if (!rc.width || !rc.height) continue;
        if (el.closest('[hidden]')) continue;
        let w = rc.width, h = rc.height;
        // pseudo: dùng cỡ CSS × tỉ lệ khung cha
        const sc = (document.getElementById('wrap').getBoundingClientRect().width / document.getElementById('wrap').offsetWidth) || 1;
        if (ps) { const pw = parseFloat(cs.width), ph = parseFloat(cs.height); if (pw > 0) w = pw * sc; if (ph > 0) h = ph * sc; }
        if (!ps && el.tagName === 'IMG' && el.naturalWidth) {
          const m = /assets\/(.+?)\.(png|jpg|webp)/.exec(el.src); if (m) {
            const r = Math.max(w * dpr / el.naturalWidth, h * dpr / el.naturalHeight);
            put(m[1], r, Math.max(w, h) * dpr, [el.naturalWidth, el.naturalHeight], 'img');
          }
        }
        const bi = cs.backgroundImage; if (bi && bi !== 'none') {
          const m = /assets\/(.+?)\.(png|jpg|webp)/.exec(bi); if (m) out['?bg:' + m[1]] = out['?bg:' + m[1]] || { bg: [], png: null }, out['?bg:' + m[1]].bg.push([w, h, cs.backgroundSize]);
        }
        const bo = cs.borderImageSource; if (bo && bo !== 'none') {
          const m = /assets\/(.+?)\.(png|jpg|webp)/.exec(bo); if (m) {
            const sl = cs.borderImageSlice.split(/\s+/).map(parseFloat), bw = cs.borderImageWidth.split(/\s+/);
            out['?bo:' + m[1]] = out['?bo:' + m[1]] || { bo: [] }; out['?bo:' + m[1]].bo.push([sl, bw, [cs.borderTopWidth, cs.borderRightWidth], sc, w, h]);
          }
        }
      }
    }
    return out;
  };
}

const OUT = process.argv[2], VW = +(process.argv[3] || 430), VH = +(process.argv[4] || 932);
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const INST = '(' + DO.toString() + ')();';
const ROSTER = JSON.parse(fs.readFileSync(path.join(process.env.THAP || path.join(__dirname, '../thap'), 'assets/roster.json'))).map(e => e.id);
(async () => {
  const br = await chromium.launch();
  const all = {}, dom = {}, errs = [], mem = [];
  const merge = (src) => { for (const k in src) { const e = src[k], o = all[k]; if (!o || e.r > o.r) all[k] = Object.assign({}, e, { dev: Math.max(e.dev, o ? o.dev : 0) }); else o.dev = Math.max(o.dev, e.dev); } };
  const mergeDom = (src) => { for (const k in src) { if (k[0] === '?') { (dom[k] = dom[k] || { bg: [], bo: [] }); dom[k].bg.push(...(src[k].bg || [])); dom[k].bo.push(...(src[k].bo || [])); continue; } const e = src[k], o = dom[k]; if (!o || e.r > o.r) dom[k] = e; } };
  async function run(url, fn) {
    const ctx = await br.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const pg = await ctx.newPage();
    pg.on('pageerror', e => errs.push(url + ' :: ' + String(e)));
    await pg.addInitScript(INST);
    await pg.goto(BASE + url + (url.includes('?') ? '&' : '?') + 'dpr=3');
    await pg.waitForTimeout(2500);
    if (fn) await fn(pg);
    merge(await pg.evaluate(() => window.__AU));
    mergeDom(await pg.evaluate(() => window.__AUDOM()));
    mem.push([url, await pg.evaluate(() => typeof REN !== 'undefined' && REN.boNho ? REN.boNho() : null)]);
    await ctx.close();
  }
  const decks = []; for (let i = 0; i < ROSTER.length; i += 5) { const d = ROSTER.slice(i, i + 5); while (d.length < 5) d.push(ROSTER[d.length]); decks.push(d); }
  const only = process.env.QUICK ? decks.slice(0, 3) : decks;
  // menu / chọn bộ
  await run('?notut=1', async pg => { await pg.waitForTimeout(800); const b = await pg.$('[data-che=solo]'); if (b) { await b.click().catch(() => {}); await pg.waitForTimeout(1200); } await pg.evaluate(() => { window.__AUDOM0 = 1; }); });
  const modes = ['solo', 'coop', 'pvp'];
  for (let i = 0; i < only.length; i++) {
    const mode = modes[i % 3], d = only[i].join(',');
    await run(`?notut=1&mode=${mode}&deck=${d}&fill=6&auto=1&speed=3&mana=2000&wave=${[9, 10, 20, 30][i % 4]}`, async pg => {
      for (let k = 0; k < 6; k++) { await pg.waitForTimeout(1500); await pg.evaluate(() => { try { if (typeof dungMV === 'function' && G.ban[0]) { G.ban[0].mana = 9999; dungMV(G.ban[0]); } } catch (e) {} }); }
      // mở bảng thông tin ụ
      await pg.evaluate(() => { try { const B = G.ban[0], T = B.t.find(Boolean); if (T && UI.moTT) UI.moTT(T.id, T); } catch (e) {} });
      await pg.waitForTimeout(800);
    });
    process.stderr.write('.');
  }
  fs.writeFileSync(OUT, JSON.stringify({ all, dom, errs, mem }, null, 1));
  await br.close();
})();
