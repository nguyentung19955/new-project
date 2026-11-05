// TURRET MERGE — ĐO ĐỘ NÉT trên mọi màn (iPhone DPR 3): ảnh bị phóng / canvas thiếu điểm ảnh / lọc làm mềm.
// Chạy: python3 -m http.server 8765 (ở gốc repo) rồi  node tools/thap-kt-net.js /tmp/net.json [390 844]   (QUICK=1: ít trận hơn)
// Mỗi màn (tải, nhà, bảng chế độ/chỉ huy/bộ mẫu/xem ụ, bộ bài, bộ sưu tập, hồ sơ ụ + khung xem trước, hồ sơ chỉ huy, hồ sơ phi công,
// sảnh online, trận SOLO/CO-OP/PVP + bảng ụ, kết quả):
//  - <img>: điểm ảnh màn (cỡ hiển thị × DPR) / điểm ảnh PNG, mỗi chiều → cờ nếu > 1.05
//  - background-image: theo background-size (cover/contain/px/%), border-image: bề rộng viền màn / số slice PNG
//  - canvas: canvas.width / (cỡ CSS × DPR) → cờ nếu < 0.98 (canvas vẽ thiếu điểm ảnh rồi bị kéo giãn)
//  - drawImage: tỉ lệ = điểm ảnh màn / điểm ảnh PNG (lần theo cả bộ đệm thu nhỏ), canvas trong DOM nhân thêm cỡ hiển thị
//  - filter blur/contrast, transform scale > 1 tĩnh trên phần tử có ảnh, imageSmoothingQuality ≠ high
// Ngưỡng 1.05 (QUY-TAC-HINH mục 5). Ảnh trong tools/thap-kt-net-bo.json (đã liệt kê CAN-VE-LAI.md) đánh "raw" thay vì cờ.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
function DO() {
  const P = CanvasRenderingContext2D.prototype, orig = P.drawImage;
  const REC = (window.__AU = {});
  window.__SMQ = {};
  const tagOf = (s) => {
    if (s instanceof HTMLImageElement) { const m = /assets\/(.+?)\.(png|jpg|jpeg|webp)/.exec(s.src || ''); if (!m) return null; return { n: m[1], f: 1, w: s.naturalWidth, h: s.naturalHeight }; }
    if (s && s.__t) return s.__t;
    return null;
  };
  P.drawImage = function (s, ...a) {
    try {
      const t = tagOf(s);
      if (t) {
        let sw, sh, dw, dh;
        const W = s.naturalWidth || s.width, H = s.naturalHeight || s.height;
        if (a.length === 2) { sw = W; sh = H; dw = W; dh = H; } else if (a.length === 4) { sw = W; sh = H; dw = a[2]; dh = a[3]; } else { sw = a[2]; sh = a[3]; dw = a[6]; dh = a[7]; }
        const m = this.getTransform(), kx = Math.hypot(m.a, m.b), ky = Math.hypot(m.c, m.d);
        const cv = this.canvas; let kd = 1;
        if (cv && cv.isConnected && cv.getBoundingClientRect) { const r = cv.getBoundingClientRect(); if (r.width && cv.width) kd = r.width * devicePixelRatio / cv.width; }
        const rx = Math.abs(kx * dw / sw) * t.f * (cv.isConnected ? kd : 1), ry = Math.abs(ky * dh / sh) * t.f * (cv.isConnected ? kd : 1), r = Math.max(rx, ry);
        if (this.imageSmoothingQuality !== 'high' && r > 0.3) window.__SMQ[t.n] = this.imageSmoothingQuality + (this.imageSmoothingEnabled ? '' : '/off');
        if (cv.isConnected && r > 1.05) {
          const e = REC[t.n] || (REC[t.n] = { r: 0, rx: 0, ry: 0, dev: 0, png: [t.w, t.h], cv: cv.id || cv.className || 'canvas' });
          if (rx > e.rx) e.rx = rx; if (ry > e.ry) e.ry = ry;
          const dev = Math.max(Math.abs(kx * dw * kd), Math.abs(ky * dh * kd)); if (dev > e.dev) e.dev = dev;
          if (r > e.r) { e.r = r; e.st = (new Error().stack || '').split('\n').slice(2, 4).map(x => x.trim().replace(/^at /, '').replace(/https?:\/\/[^/]+\/thap\//, '')).join(' < '); }
        }
        if (cv && !cv.isConnected) {
          const area = Math.abs(dw * dh);
          if (!cv.__t || area > (cv.__ta || 0) || cv.__tw !== cv.width) { cv.__t = { n: t.n, f: Math.max(Math.abs(kx * dw / sw), Math.abs(ky * dh / sh)) * t.f, w: t.w, h: t.h }; cv.__ta = area; cv.__tw = cv.width; }
        }
      }
    } catch (e) { }
    return orig.call(this, s, ...a);
  };
  const NAT = (window.__NAT = {});
  const natOf = (u) => { if (NAT[u]) return NAT[u]; const i = new Image(); i.src = u; NAT[u] = i; return i; };
  const px = (v, ref) => /%$/.test(v) ? parseFloat(v) / 100 * ref : parseFloat(v);
  window.__AUDOM = (man) => {
    const dpr = devicePixelRatio, out = [];
    const put = (o) => { o.man = man; out.push(o); };
    for (const el of document.querySelectorAll('*')) {
      if (el.closest('[hidden]')) continue;
      const cs0 = getComputedStyle(el); if (cs0.display === 'none' || cs0.visibility === 'hidden') continue;
      const rc = el.getBoundingClientRect(); if (!rc.width || !rc.height) continue;
      if (rc.bottom < 0 || rc.top > innerHeight || rc.right < 0 || rc.left > innerWidth) continue;
      const sc = el.offsetWidth ? rc.width / el.offsetWidth : 1;
      const id = el.id ? '#' + el.id : (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : el.tagName);
      if (el.tagName === 'CANVAS' && el.width) {
        const k = el.width / (rc.width * dpr), k2 = el.height / (rc.height * dpr);
        put({ loai: 'canvas', n: id, r: 1 / Math.min(k, k2), dev: [Math.round(rc.width * dpr), Math.round(rc.height * dpr)], png: [el.width, el.height] });
      }
      if (el.tagName === 'IMG' && el.naturalWidth) {
        const m = /assets\/(.+?)\.(png|jpg|jpeg|webp)/.exec(el.currentSrc || el.src); if (m) {
          // object-fit
          let w = rc.width, h = rc.height; const of = cs0.objectFit;
          if (of === 'contain' || of === 'cover') { const k = (of === 'cover' ? Math.max : Math.min)(w / el.naturalWidth, h / el.naturalHeight); w = el.naturalWidth * k; h = el.naturalHeight * k; }
          put({ loai: 'img', n: m[1], el: id, rx: w * dpr / el.naturalWidth, ry: h * dpr / el.naturalHeight, dev: [Math.round(w * dpr), Math.round(h * dpr)], png: [el.naturalWidth, el.naturalHeight] });
        }
      }
      for (const ps of [null, '::before', '::after']) {
        const cs = ps ? getComputedStyle(el, ps) : cs0;
        if (ps && (cs.content === 'none' || cs.content === 'normal')) continue;
        if (cs.display === 'none') continue;
        let w = rc.width / sc, h = rc.height / sc;
        if (ps) { const pw = parseFloat(cs.width), ph = parseFloat(cs.height); if (!(pw > 0) || !(ph > 0)) continue; w = pw; h = ph; }
        const f = cs.filter; if (f && f !== 'none' && /blur\(/.test(f) && (cs.backgroundImage !== 'none' || el.tagName === 'IMG')) put({ loai: 'filter', n: id + (ps || ''), f });
        const bi = cs.backgroundImage;
        if (bi && bi !== 'none') {
          const urls = [...bi.matchAll(/url\("?([^")]+)"?\)/g)].map(x => x[1]); const sizes = cs.backgroundSize.split(',').map(s => s.trim());
          urls.forEach((u, i) => {
            const m = /assets\/(.+?)\.(png|jpg|jpeg|webp)/.exec(u); if (!m) return;
            const im = natOf(u); if (!im.naturalWidth) { put({ loai: 'bg?', n: m[1] }); return; }
            const nw = im.naturalWidth, nh = im.naturalHeight; let s = (sizes[i] || sizes[0] || 'auto').split(/\s+/); let bw, bh;
            if (s[0] === 'cover' || s[0] === 'contain') { const k = (s[0] === 'cover' ? Math.max : Math.min)(w / nw, h / nh); bw = nw * k; bh = nh * k; }
            else { bw = s[0] === 'auto' ? null : px(s[0], w); bh = (s[1] || 'auto') === 'auto' ? null : px(s[1], h); if (bw == null && bh == null) { bw = nw; bh = nh; } else if (bw == null) bw = bh * nw / nh; else if (bh == null) bh = bw * nh / nw; }
            put({ loai: 'bg', n: m[1], el: id + (ps || ''), rx: bw * sc * dpr / nw, ry: bh * sc * dpr / nh, dev: [Math.round(bw * sc * dpr), Math.round(bh * sc * dpr)], png: [nw, nh] });
          });
        }
        const bo = cs.borderImageSource;
        if (bo && bo !== 'none') {
          const m = /assets\/(.+?)\.(png|jpg|jpeg|webp)/.exec(bo); if (m) {
            const u = /url\("?([^")]+)"?\)/.exec(bo)[1], im = natOf(u);
            const sl = cs.borderImageSlice.replace('fill', '').trim().split(/\s+/), bwv = cs.borderImageWidth.split(/\s+/);
            const bws = [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].map(parseFloat);
            // 9 vùng: cột [trái, giữa, phải] × hàng [trên, giữa, dưới]; mỗi vùng tỉ lệ = cỡ màn / cỡ PNG theo từng chiều
            const fill = /fill/.test(cs.borderImageSlice), nw = im.naturalWidth, nh = im.naturalHeight;
            if (!nw) { put({ loai: 'bg?', n: m[1] }); continue; }
            const S = [], D = [];
            for (let k = 0; k < 4; k++) {
              const sv = sl[k] != null ? sl[k] : sl[k >= 2 ? k - 2 : 0] != null ? sl[k >= 2 ? k - 2 : 0] : sl[0];
              const wv = bwv[k] != null ? bwv[k] : bwv[k >= 2 ? k - 2 : 0] != null ? bwv[k >= 2 ? k - 2 : 0] : bwv[0];
              const sp = /%$/.test(sv) ? parseFloat(sv) / 100 * (k % 2 ? nw : nh) : parseFloat(sv);
              const dp = /px$/.test(wv) ? parseFloat(wv) : /%$/.test(wv) ? parseFloat(wv) / 100 * (k % 2 ? w : h) : wv === 'auto' ? sp : parseFloat(wv) * bws[k];
              S.push(sp); D.push(dp);
            }
            const cs_ = [S[3], nw - S[3] - S[1], S[1]], cd_ = [D[3], w - D[3] - D[1], D[1]];
            const rs_ = [S[0], nh - S[0] - S[2], S[2]], rd_ = [D[0], h - D[0] - D[2], D[2]];
            let rx = 0, ry = 0;
            // vùng giữa (cột giữa / hàng giữa) cố ý kéo giãn theo 1 chiều (dải trơn) → chỉ xét mép/góc; nếu cả 2 mép = 0
            // (vd. slice "0 30": cả chiều cao là "hàng giữa") thì hàng/cột giữa chính là tỉ lệ thật của chiều đó
            const ci = (cs_[0] > 0.5 || cs_[2] > 0.5) ? [0, 2] : [1], rj = (rs_[0] > 0.5 || rs_[2] > 0.5) ? [0, 2] : [1];
            for (const i of ci) if (cs_[i] > 0.5 && cd_[i] > 0.5) rx = Math.max(rx, cd_[i] * sc * dpr / cs_[i]);
            for (const j of rj) if (rs_[j] > 0.5 && rd_[j] > 0.5) ry = Math.max(ry, rd_[j] * sc * dpr / rs_[j]);
            if (!fill && ci[0] === 1) rx = 0; if (!fill && rj[0] === 1) ry = 0;
            put({ loai: 'border', n: m[1], el: id + (ps || ''), rx, ry, dev: [Math.round(w * sc * dpr), Math.round(h * sc * dpr)], png: [nw, nh], sl: cs.borderImageSlice, bw: cs.borderImageWidth });
          }
        }
      }
    }
    return out;
  };
}

const OUT = process.argv[2] || '/tmp/net.json', VW = +(process.argv[3] || 390), VH = +(process.argv[4] || 844);
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const INST = '(' + DO.toString() + ')();';
const THAP = process.env.THAP || path.join(__dirname, '../thap');
const ROSTER = JSON.parse(fs.readFileSync(path.join(THAP, 'assets/roster.json'))).map(e => e.id);
const BO = (() => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, 'thap-kt-net-bo.json'))); } catch (e) { return {}; } })();
const LS = (deck) => `try{localStorage.setItem('turret_hd',JSON.stringify({xong:true,boQua:true,buoc:{}}));localStorage.setItem('turret_bo',JSON.stringify({chon:${JSON.stringify(deck)},mv:'hero',che:'solo'}));}catch(e){}`;
(async () => {
  const br = await chromium.launch();
  const rows = [], errs = [], fpsOut = [], smq = {};
  const shot = process.env.SHOT; // thư mục: chụp mỗi màn
  async function man(ten, url, fn, deck) {
    const ctx = await br.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const pg = await ctx.newPage();
    pg.on('pageerror', e => errs.push(ten + ' :: ' + String(e)));
    await pg.addInitScript(LS(deck || ROSTER.slice(0, 5)));
    await pg.addInitScript(INST);
    await pg.goto(BASE + url);
    const lay = async (nhan) => {
      for (const fr of pg.frames()) {
        try {
          const d = await fr.evaluate((n) => window.__AUDOM ? window.__AUDOM(n) : [], nhan);
          const au = await fr.evaluate(() => window.__AU || {});
          const sq = await fr.evaluate(() => window.__SMQ || {}); Object.assign(smq, sq);
          let k = 1; // khung con: nhân thêm tỉ lệ hiển thị của iframe
          if (fr !== pg.mainFrame()) { const h = await fr.frameElement(); const bb = await h.boundingBox(); const iw = await fr.evaluate(() => innerWidth); const idpr = await fr.evaluate(() => devicePixelRatio); k = bb ? bb.width * 3 / (iw * idpr) : 1; d.forEach(o => { if (o.rx) { o.rx *= k; o.ry *= k; } if (o.r) o.r *= k; o.ifr = 1; }); }
          for (const o of d) rows.push(o);
          for (const n in au) rows.push({ loai: 'draw', n, man: nhan, rx: au[n].rx * k, ry: au[n].ry * k, dev: [Math.round(au[n].dev * k)], png: au[n].png, el: au[n].cv, st: au[n].st, ifr: fr !== pg.mainFrame() ? 1 : undefined });
        } catch (e) { }
      }
      if (shot) await pg.screenshot({ path: path.join(shot, VW + '-' + nhan + '.png') }).catch(() => { });
    };
    await fn(pg, lay);
    await ctx.close();
  }
  const W8 = (pg, ms) => pg.waitForTimeout(ms);
  const act = (pg, a, sel) => pg.evaluate(([a, sel]) => { const e = document.querySelector(sel || '[data-act="' + a + '"]'); if (e) e.click(); return !!e; }, [a, sel]);
  // tải + nhà + bảng trượt + bộ bài + bộ sưu tập + hồ sơ
  await man('menu', '?notut=1', async (pg, lay) => {
    await W8(pg, 350); await lay('tai');
    await W8(pg, 3500); await lay('nha');
    for (const [a, n] of [['hm-che', 'bang-che'], ['hm-mvs', 'bang-chihuy'], ['hm-pre', 'bang-bomau'], ['hm-loc', 'bang-loc'], ['hm-cai', 'bang-caidat']]) {
      if (await act(pg, a)) { await W8(pg, 700); await lay(n); await act(pg, 'hm-dong'); await W8(pg, 500); }
    }
    await act(pg, 'hm-deck'); await W8(pg, 1200); await lay('bobai');
    await pg.evaluate(() => { const l = document.querySelector('#chon-luoi'); if (l) l.scrollTop = 600; }); await W8(pg, 500); await lay('bobai-cuon');
    await pg.evaluate(() => { const c = document.querySelector('#chon-luoi .c[data-id]'); if (c && HM.moXem) HM.moXem(c.dataset.id); }); await W8(pg, 800); await lay('xem-u'); await act(pg, 'hm-dong'); await W8(pg, 400);
    await act(pg, 'hm-ve'); await W8(pg, 500); await act(pg, 'hm-bst'); await W8(pg, 1200); await lay('bosuutap');
    await pg.evaluate(() => { const l = document.querySelector('#chon-luoi'); if (l) l.scrollTop = 99999; }); await W8(pg, 600); await lay('bosuutap-cuoi');
  });
  const ids = process.env.QUICK ? ROSTER.slice(0, 3) : ROSTER.filter((x, i) => i % 9 === 0);
  for (const id of ids) {
    await man('hoso-' + id, '?notut=1', async (pg, lay) => {
      await W8(pg, 3000);
      await pg.evaluate((id) => { const c = document.querySelector('#chon-luoi .c[data-id="' + id + '"]'); UP.mo(id, c); }, id);
      await W8(pg, 3500); await lay('hoso-u');
      await pg.evaluate(() => { const s = document.querySelector('.up, #up, [class*="up-cuon"]'); const sc = [...document.querySelectorAll('*')].find(e => e.scrollHeight > e.clientHeight + 50 && /up/.test(e.className)); if (sc) sc.scrollTop = 99999; });
      await W8(pg, 800); await lay('hoso-u-cuoi');
    });
  }
  await man('chihuy', '?notut=1', async (pg, lay) => {
    await W8(pg, 3000);
    await pg.evaluate(() => { const id = Object.keys(MAVUONG)[0]; UP.moMV(id); }); await W8(pg, 2500); await lay('hoso-chihuy');
  });
  await man('phicong', '?notut=1', async (pg, lay) => {
    await W8(pg, 3000); await act(pg, 'hm-cai'); await W8(pg, 500); await act(pg, 'tk-mo'); await W8(pg, 1200); await lay('hoso-phicong');
  });
  await man('sanh', '?notut=1', async (pg, lay) => {
    await W8(pg, 3000); await pg.evaluate(() => { try { PHONG.moBang(); } catch (e) { } }); await W8(pg, 1500); await lay('sanh');
  });
  // trận
  const decks = []; for (let i = 0; i < ROSTER.length; i += 5) { const d = ROSTER.slice(i, i + 5); while (d.length < 5) d.push(ROSTER[d.length]); decks.push(d); }
  const only = process.env.QUICK ? decks.slice(0, 3) : decks;
  const modes = ['solo', 'coop', 'pvp'];
  for (let i = 0; i < only.length; i++) {
    const mode = modes[i % 3], d = only[i];
    await man('tran-' + mode, `?notut=1${process.env.DPR3 ? '&dpr=3' : ''}&mode=${mode}&deck=${d.join(',')}&fill=6&auto=1&speed=3&mana=2000&wave=${[9, 10, 20, 30][i % 4]}`, async (pg, lay) => {
      for (let k = 0; k < 5; k++) { await W8(pg, 1500); await pg.evaluate(() => { try { if (typeof dungMV === 'function' && G.ban[0]) { G.ban[0].mana = 9999; dungMV(G.ban[0]); } } catch (e) { } }); }
      if (i < 3) { // fps (đo khung thật trên trình duyệt headless — chỉ so tương đối)
        const f = await pg.evaluate(() => new Promise(ok => { let n = 0; const t0 = performance.now(); const g = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(g); else ok({ fps: n / ((performance.now() - t0) / 1000), dpr: REN.dpr, cv: [REN.cv.width, REN.cv.height] }); }; requestAnimationFrame(g); }));
        fpsOut.push(Object.assign({ mode }, f));
      }
      await lay('tran-' + mode);
      await pg.evaluate(() => { try { const B = G.ban[0], T = B.t.find(Boolean); if (T && UI.moTT) UI.moTT(T.id, T); } catch (e) { } });
      await W8(pg, 800); await lay('tran-' + mode + '-bangu');
      if (i < 3) { await pg.evaluate(() => { try { UI.dongTT && UI.dongTT(); ketThuc(true); } catch (e) { } }); await W8(pg, 2500); await lay('ketqua-' + mode); }
    }, d);
    process.stderr.write('.');
  }
  // gộp: mỗi ảnh lấy tỉ lệ lớn nhất
  const best = {};
  for (const o of rows) {
    if (o.loai === 'bg?') continue;
    // tia / dải kéo dài (đạn tia, laser, liên kết, vệt): ảnh cố ý kéo theo chiều dài → chỉ xét chiều ngang tia (chiều nhỏ hơn)
    const DAI = /(_tia|^dan_tia|^fx_link|^fx_vet_trang|_day)$/.test(o.n) && o.loai === 'draw';
    const r = o.r || (DAI ? Math.min(o.rx || 0, o.ry || 0) : Math.max(o.rx || 0, o.ry || 0));
    const k = o.loai + ':' + o.n + (o.loai === 'canvas' ? '@' + o.man : '');
    if (!best[k] || r > best[k].r) best[k] = Object.assign({}, o, { r });
  }
  const list = Object.values(best).sort((a, b) => b.r - a.r);
  const co = list.filter(o => (o.loai === 'canvas' ? o.r > 1.02 : o.r > 1.05) || o.loai === 'filter').map(o => Object.assign(o, { raw: BO[o.n] || Object.entries(BO).filter(([k]) => k.endsWith('_*') && !k.startsWith('fx_<') && o.n.startsWith(k.slice(0, -1))).map(([, v]) => v)[0] || BO[o.n.replace(/_[a-z0-9]+$/, '_*')] || (/^pilot_/.test(o.n) && BO['pilot_*']) || (/_nong$/.test(o.n) && BO['*_nong']) || (/^sig_/.test(o.n) && BO['sig_*']) || (/^fx_.*_(trung|no|dan|hieu)\d?$/.test(o.n) && BO['fx_<u>_*']) || undefined }));
  const brd = [...new Set(rows.filter(o => o.loai === 'border').map(o => [o.n, o.el, o.sl, (o.png || []).join('x')].join(' | ')))].sort();
  fs.writeFileSync(OUT, JSON.stringify({ vw: VW, vh: VH, co, all: list, brd, fps: fpsOut, smq, errs }, null, 1));
  console.log(VW + 'x' + VH + ': ' + list.length + ' mục, cờ ' + co.length + ' (đã liệt kê CAN-VE-LAI ' + co.filter(o => o.raw).length + ', CHƯA liệt kê ' + co.filter(o => !o.raw).length + (co.filter(o => !o.raw).length ? ': ' + co.filter(o => !o.raw).map(o => o.n).join(',') : '') + '), lỗi trang ' + errs.length + ', fps ' + JSON.stringify(fpsOut.map(f => Math.round(f.fps) + '@' + f.dpr)));
  await br.close();
})();
