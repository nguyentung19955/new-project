// TURRET MERGE — đếm việc vẽ canvas MỖI KHUNG (không phụ thuộc tốc độ máy đo): số lệnh drawImage, diện tích điểm ảnh vẽ,
//   số lần bật shadowBlur / ctx.filter / 'lighter', gradient tạo mới, đổi DOM — quy ra theo nơi gọi (hàm trong js/).
// Chạy: python3 -m http.server 8765 (gốc repo) rồi node tools/thap-kt-hieunang-dem.js [tên=truy-vấn-thêm ...]
const { chromium } = require('playwright');
const PORT = process.env.PORT || 8765, MS = +(process.env.MS || 3000), MODE = process.env.MODE || 'pvp', AUTO = process.env.AUTO !== '0';
// BAN=cobac (đợt 3 — "giật" Lucky Slot): bàn 0 = 8 ụ BAN (sao SAO, mặc định 6) + ụ khác của DECK; WAVE đổi đợt (mặc định 15). Vd:
//   BAN=cobac MODE=solo WAVE=66 node tools/thap-kt-hieunang-dem.js ios=1
const BAN = process.env.BAN || '', SAO = +(process.env.SAO || 6), WAVE = process.env.WAVE || 15;
const DECK = BAN ? BAN + ',lualien,chuato,canon,lien' : 'lualien,chuato,leviathan,khoisinh,hopca', DECK2 = 'cobac,bienmau,nhieusong,lien,canon';
const bien = process.argv.slice(2).map(s => { const i = s.indexOf('='); return [s.slice(0, i), s.slice(i + 1)]; });
if (!bien.length) bien.push(['goc', '']);
const TIEM = () => {
  const P = CanvasRenderingContext2D.prototype, D = window.__D = { bat: false, n: {}, px: {}, noi: {}, noiPx: {} };
  const noi = () => { const s = new Error().stack.split('\n'); for (let i = 3; i < s.length; i++) { const m = s[i].match(/at (?:Object\.|REN\.)?([\w.$]+)? ?\(?.*\/js\/([\w-]+\.js):(\d+)/); if (m && !/^(veNho|thuNho|anhGiua|mip|khung0|ve)$/.test(m[1] || '')) return (m[1] || '?') + '@' + m[2] + ':' + m[3]; } return '?'; };
  const dem = (k, px) => { if (!D.bat) return; D.n[k] = (D.n[k] || 0) + 1; if (px) D.px[k] = (D.px[k] || 0) + px; };
  const g = P.drawImage;
  P.drawImage = function (im, ...a) {
    if (D.bat) {
      const t = this.getTransform(); const sx = Math.hypot(t.a, t.b), sy = Math.hypot(t.c, t.d);
      let w, h; if (a.length >= 8) { w = a[6]; h = a[7]; } else if (a.length >= 4) { w = a[2]; h = a[3]; } else { w = im.width; h = im.height; }
      const px = Math.abs(w * sx * h * sy), dich = this.canvas === (window.REN && REN.cv) ? 'chinh' : 'phu';
      dem('drawImage_' + dich, px);
      if (Math.random() < 0.25) { const k = noi(); D.noi[k] = (D.noi[k] || 0) + 4; D.noiPx[k] = (D.noiPx[k] || 0) + px * 4; }
      if (this.shadowBlur > 0 && this.shadowColor !== 'rgba(0, 0, 0, 0)') { dem('drawImage+shadow', px); D.noi['SHADOW ' + noi()] = (D.noi['SHADOW ' + noi()] || 0) + 1; }
      if (this.filter && this.filter !== 'none') { dem('drawImage+filter', px); const k = 'FILTER ' + this.filter + ' ' + noi(); D.noi[k] = (D.noi[k] || 0) + 1; }
    }
    return g.call(this, im, ...a);
  };
  for (const f of ['fill', 'stroke', 'fillRect', 'fillText', 'strokeText', 'clearRect', 'clip', 'getImageData', 'putImageData', 'createRadialGradient', 'createLinearGradient', 'createPattern', 'save']) {
    const o = P[f]; P[f] = function (...a) {
      if (D.bat) { dem(f); if ((this.shadowBlur > 0) && /fill|stroke/.test(f)) { dem(f + '+shadow'); const k = 'SHADOW ' + f + ' ' + noi(); D.noi[k] = (D.noi[k] || 0) + 1; } if (this.filter && this.filter !== 'none' && /fill|stroke/.test(f)) dem(f + '+filter'); if (f === 'getImageData' || f === 'createPattern') { const k = f + ' ' + noi(); D.noi[k] = (D.noi[k] || 0) + 1; } if (f === 'clearRect' || f === 'fillRect') { const t = this.getTransform(); D.px[f] = (D.px[f] || 0) + Math.abs(a[2] * a[3] * t.a * t.d); } }
      return o.apply(this, a);
    };
  }
};
(async () => {
  const b = await chromium.launch();
  const kq = {};
  for (const [ten, them] of bien) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await ctx.addInitScript(TIEM);
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    const ds = them.split('&').filter(Boolean), js = ds.filter(x => x.startsWith('js:')).map(x => decodeURIComponent(x.slice(3))), q = ds.filter(x => !x.startsWith('js:')).join('&');
    await p.goto(`http://localhost:${PORT}/thap/?notut=1&mode=${MODE}&deck=${DECK}&deck2=${DECK2}&wave=${WAVE}&mana=2500${AUTO ? '&auto=1' : ''}${q ? '&' + q : ''}`, { waitUntil: 'load' });
    await p.waitForFunction(() => window.G && G.ban && G.ban.length && !(window.TAI && TAI.cho), null, { timeout: 30000 }).catch(() => {});
    await p.waitForTimeout(1500);
    await p.evaluate(([BAN, SAO]) => {
      const B = G.ban[0];
      if (BAN) { // 8 ụ BAN rải đều + ụ khác của bộ bài (bàn 15 ô đầy)
        const kh = ['lualien', 'chuato', 'canon', 'lien'];
        for (let o = 0; o < 15; o++) { const id = o % 2 === 0 ? BAN : kh[(o >> 1) % 4]; if (!SKILLS[id]) continue; B.lv[id] = Math.max(B.lv[id] || 1, id === BAN ? 1 : 9); B.t[o] = sinhU(taoU(B, id, id === BAN ? SAO : 4, o)); }
        B.mana = 2524; B.tim = 1e9; G.debug.auto = false; ketThuc = () => {}; return; // đo cảnh đông: không kết thúc trận giữa chừng
      }
      const ids = ['lualien', 'lualien', 'lualien', 'chuato', 'lualien', 'lualien', 'lualien', 'leviathan', 'lualien', 'lualien', 'khoisinh', 'lualien', 'lualien', 'hopca', 'lualien'];
      ids.forEach((id, o) => { B.lv[id] = Math.max(B.lv[id] || 1, 9); const T = sinhU(taoU(B, id, 4, o)); if (id === 'lualien') T.lc = 30 + (o * 7) % 61; B.t[o] = T; });
      const B2 = G.ban[1]; if (B2) { const i2 = ['cobac', 'bienmau', 'nhieusong', 'lien', 'canon']; for (let o = 0; o < 13; o++) { const id = i2[o % 5]; if (!SKILLS[id]) continue; B2.lv[id] = B2.lv[id] || 1; B2.t[o] = sinhU(taoU(B2, id, 3, o)); } }
      B.mana = 2524; B.tim = 1e9; if (B2) B2.tim = 1e9; G.debug.auto = false; // giữ nguyên bàn 11 Ember (không tự ghép)
    }, [BAN, SAO]);
    for (const s of js) await p.evaluate(s);
    await p.waitForTimeout(3000);
    const r = await p.evaluate((ms) => new Promise(ok => {
      let dom = 0; const tg = {}; const mo = new MutationObserver(l => { dom += l.length; for (const m of l) { const e = m.target.nodeType === 1 ? m.target : m.target.parentElement; const k = (e && (e.id || e.className || e.tagName)) + ':' + m.type + (m.attributeName ? '.' + m.attributeName : ''); tg[k] = (tg[k] || 0) + 1; } });
      mo.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
      const D = window.__D; D.n = {}; D.px = {}; D.noi = {}; D.noiPx = {}; D.bat = true; let n = 0, viec = 0; const t0 = performance.now();
      const f = (t) => { n++; viec += (REN._viec || 0); if (t - t0 < ms) requestAnimationFrame(f); else {
        D.bat = false; mo.disconnect();
        const MP = (REN.cv.width * REN.cv.height);
        const per = o => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => [k, +(v / n).toFixed(1)]));
        const perPx = o => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => [k, +(v / n / MP).toFixed(2)]));
        ok({ khung: n, cv: REN.cv.width + 'x' + REN.cv.height, jsKhung: +(viec / n).toFixed(1), lenh: per(D.n), manHinh: perPx(D.px), noi: per(D.noi), noiManHinh: perPx(D.noiPx), dom: +(dom / n).toFixed(1), domNoi: per(tg), hu: G.hu.length, quai: G.quai.length, ember: G.ban[0].t.filter(T => T && T.id === 'lualien').length, hat: FX.hat.length, chu: FX.chu.length, ban: G.ban[0].t.filter(T => T).map(T => T.id).join(',') });
      } };
      requestAnimationFrame(f);
    }), MS);
    kq[ten] = { ...r, errs: errs.slice(0, 3) };
    if (process.env.SHOT) await p.screenshot({ path: process.env.SHOT + '/' + MODE + '_' + ten + '.png' });
    console.log(ten, JSON.stringify(kq[ten], null, process.env.GON ? 0 : 1));
    await ctx.close();
  }
  await b.close();
})();
