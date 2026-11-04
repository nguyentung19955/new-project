// TURRET MERGE — vẽ: mọi hình là ảnh ChatGPT trong assets/; code chỉ vẽ hạt, quầng sáng, bóng, chữ, thanh máu
'use strict';

const REN = {
  cv: null, ctx: null, s: 1, dpr: 1, anh: {}, nen: null, xam: {}, trang: {}, cham: {}, cache: {}, t: 0, thieu: new Set(),

  init(cv) {
    this.cv = cv; this.ctx = cv.getContext('2d');
    this.coLai();
    addEventListener('resize', () => this.coLai());
  },
  coLai() {
    const vw = innerWidth, vh = innerHeight;
    this.s = Math.min(vw / W, vh / H);
    this.dpr = Math.min(2.5, devicePixelRatio || 1);
    const wrap = document.getElementById('wrap');
    wrap.style.transform = 'translate(-50%,-50%) scale(' + this.s + ')';
    this.cv.width = Math.round(W * this.s * this.dpr); this.cv.height = Math.round(H * this.s * this.dpr);
    this.cv.style.width = W + 'px'; this.cv.style.height = H + 'px';
    this.cache = {};
    if (G.ban.length) this.lamNen();
  },

  // ---------- ảnh ----------
  img(ten) {
    let a = this.anh[ten];
    if (!a) {
      a = new Image(); a.decoding = 'async';
      a.onerror = () => { a._loi = true; this.thieu.add(ten); };
      a.onload = () => { if (this._choNen) this.lamNen(); };
      a.src = 'assets/' + ten + '.png';
      this.anh[ten] = a;
    }
    return a.complete && a.naturalWidth && !a._loi ? a : null;
  },
  napTruoc(ds) { return Promise.all(ds.map(t => new Promise(ok => { this.img(t); const a = this.anh[t]; if (a.complete) ok(); else { a.addEventListener('load', ok, { once: true }); a.addEventListener('error', ok, { once: true }); } }))); },
  // bản trắng (chớp khi trúng đòn) / bản xám (hoá đá) — dựng 1 lần, dùng lại
  banTrang(ten) {
    if (this.trang[ten]) return this.trang[ten];
    const a = this.img(ten); if (!a) return null;
    const c = document.createElement('canvas'); c.width = a.naturalWidth; c.height = a.naturalHeight;
    const x = c.getContext('2d'); x.drawImage(a, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
    return (this.trang[ten] = c);
  },
  banXam(ten) {
    if (this.xam[ten]) return this.xam[ten];
    const a = this.img(ten); if (!a) return null;
    const c = document.createElement('canvas'); c.width = a.naturalWidth; c.height = a.naturalHeight;
    const x = c.getContext('2d'); x.drawImage(a, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
    for (let i = 0; i < p.length; i += 4) { const l = (p[i] * 0.3 + p[i + 1] * 0.59 + p[i + 2] * 0.11) * 0.85 + 18; p[i] = l * 1.02; p[i + 1] = l; p[i + 2] = l * 0.94; }
    x.putImageData(d, 0, 0);
    return (this.xam[ten] = c);
  },
  // ảnh đã thu nhỏ sẵn đúng cỡ vẽ (px logic) — vẽ 1:1 nhanh hơn nhiều trên điện thoại; bien: '' | 'xam' | 'trang' | 'den'
  co(ten, px, bien) {
    const k = this.s * this.dpr, n = Math.max(2, Math.round(px * k)), key = ten + '|' + n + '|' + (bien || '');
    let c = this.cache[key]; if (c) return c;
    const a = bien === 'xam' ? this.banXam(ten) : bien === 'trang' ? this.banTrang(ten) : this.img(ten);
    if (!a) return null;
    const w = a.width, h = a.height, nw = Math.max(2, Math.round(n * w / Math.max(w, h))), nh = Math.max(2, Math.round(n * h / Math.max(w, h)));
    c = document.createElement('canvas'); c.width = nw; c.height = nh;
    const x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
    if (bien === 'den') { x.filter = 'blur(' + Math.max(1, n / 40) + 'px)'; x.drawImage(a, 0, 0, nw, nh); x.filter = 'none'; x.globalCompositeOperation = 'source-in'; x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, 0, nw, nh); }
    else x.drawImage(a, 0, 0, nw, nh);
    if (Object.keys(this.cache).length > 900) this.cache = {};
    return (this.cache[key] = c);
  },
  // vẽ ảnh thu nhỏ sẵn ở tâm (0,0) với cỡ px
  ve1(ctx, ten, px, bien, ox, oy) { const c = this.co(ten, px, bien); if (!c) return false; const h = px * c.height / c.width; ctx.drawImage(c, (ox || 0) - px / 2, (oy || 0) - h / 2, px, h); return true; },
  // chấm sáng mềm theo màu (hạt) — dựng sẵn để không tạo gradient mỗi khung
  cham1(mau) {
    if (this.cham[mau]) return this.cham[mau];
    const c = document.createElement('canvas'); c.width = c.height = 32;
    const x = c.getContext('2d'), g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, mau); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 32, 32);
    return (this.cham[mau] = c);
  },

  // ---------- vẽ ảnh tiện ích ----------
  anhGiua(ctx, ten, x, y, co, goc, alpha) {
    const a = typeof ten === 'string' ? this.img(ten) : ten; if (!a) return false;
    const w = co, h = co * (a.height / a.width);
    if (alpha != null) ctx.globalAlpha = alpha;
    if (goc) { ctx.save(); ctx.translate(x, y); ctx.rotate(goc); ctx.drawImage(a, -w / 2, -h / 2, w, h); ctx.restore(); }
    else ctx.drawImage(a, x - w / 2, y - h / 2, w, h);
    if (alpha != null) ctx.globalAlpha = 1;
    return true;
  },
  // dải khung ngang (fx_* 6 khung, quai_* / trum_* 4 khung)
  khung(ctx, ten, f, x, y, co, goc, banAnh) {
    const a = banAnh || this.img(ten); if (!a) return false;
    const n = Math.round(a.width / a.height), fw = a.width / n;
    f = ((f % n) + n) % n;
    ctx.save(); ctx.translate(x, y); if (goc) ctx.rotate(goc);
    ctx.drawImage(a, f * fw, 0, fw, a.height, -co / 2, -co / 2, co, co);
    ctx.restore(); return true;
  },
  // tia lặp ảnh dọc đoạn thẳng (tia_laser, tia_set); keo = kéo giãn một ảnh (vệt đạn)
  tia(ctx, ten, x0, y0, x1, y1, rong, lech, keo) {
    const a = this.img(ten); if (!a) return;
    const L = Math.hypot(x1 - x0, y1 - y0); if (L < 1) return;
    ctx.save(); ctx.translate(x0, y0); ctx.rotate(Math.atan2(y1 - y0, x1 - x0));
    if (keo) { ctx.drawImage(a, 0, -rong / 2, L, rong); ctx.restore(); return; }
    const tw = a.width * (rong / a.height);
    let x = -((lech || 0) % tw); if (x > 0) x -= tw;
    while (x < L) {
      const x0c = Math.max(0, x), x1c = Math.min(L, x + tw);
      const sx = ((x0c - x) / tw) * a.width, sw = ((x1c - x0c) / tw) * a.width;
      if (sw > 0.5) ctx.drawImage(a, sx, 0, sw, a.height, x0c, -rong / 2, x1c - x0c, rong);
      x += tw;
    }
    ctx.restore();
  },
  // sét gấp khúc: chia đoạn, rung ngẫu nhiên theo hạt giống (đổi mỗi ~50 ms)
  set(ctx, x0, y0, x1, y1, rong, seed) {
    const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.round(L / 22));
    const nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
    let r = seed * 9301 + 49297; const rn = () => { r = (r * 9301 + 49297) % 233280; return r / 233280 - 0.5; };
    const pts = [[x0, y0]];
    for (let i = 1; i < n; i++) { const u = i / n, j = rn() * Math.min(26, L * 0.18); pts.push([x0 + (x1 - x0) * u + nx * j, y0 + (y1 - y0) * u + ny * j]); }
    pts.push([x1, y1]);
    for (let i = 0; i < pts.length - 1; i++) this.tia(ctx, 'tia_set', pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], rong, 0, true);
    ctx.strokeStyle = 'rgba(255,255,230,.9)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x0, y0);
    for (const p of pts) ctx.lineTo(p[0], p[1]); ctx.stroke();
  },

  // ---------- nền tĩnh (khay + đường) dựng 1 lần ----------
  lamNen() {
    const c = this.nen || (this.nen = document.createElement('canvas'));
    const k = this.s * this.dpr;
    c.width = this.cv.width; c.height = this.cv.height;
    const x = c.getContext('2d');
    x.setTransform(k, 0, 0, k, 0, 0);
    // sàn xưởng máy tối (gradient + quầng tối viền)
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1c1e22'); g.addColorStop(0.5, '#25272b'); g.addColorStop(1, '#17181b');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    const v = x.createRadialGradient(W / 2, H * 0.45, 120, W / 2, H * 0.45, 560);
    v.addColorStop(0, 'rgba(255,255,255,0.05)'); v.addColorStop(1, 'rgba(0,0,0,0.55)');
    x.fillStyle = v; x.fillRect(0, 0, W, H);
    let du = true;
    // khay bàn máy móc xám (bóng đổ dưới khay)
    for (const B of G.ban) {
      x.save(); x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 18; x.shadowOffsetY = 8;
      const kh = this.img('khay');
      if (kh) x.drawImage(kh, B.x, B.y, B.w, B.h); else { du = false; x.fillStyle = '#3a3d42'; x.fillRect(B.x, B.y, B.w, B.h); }
      x.restore();
    }
    // đường đi: ghép ảnh đường thẳng + góc
    const th = this.img('duong_thang'), gc = this.img('duong_goc');
    if (!th || !gc) du = false;
    const daVe = new Set();
    for (const p of G.duong) {
      const pts = p.pts;
      for (let i = 0; i < pts.length - 1; i++) {
        const key = pts[i] + '|' + pts[i + 1];
        if (daVe.has(key)) continue; daVe.add(key);
        let [ax, ay] = pts[i], [bx, by] = pts[i + 1];
        const L = Math.hypot(bx - ax, by - ay), dx = (bx - ax) / L, dy = (by - ay) / L;
        const goc0 = i > 0, goc1 = i < pts.length - 2;
        const chung = G.chung && i === 1; // hành lang chung co-op bắt đầu từ tâm ngã ba
        const a0 = goc0 && !chung ? DUONG_RONG / 2 : (i === 0 ? -6 : 0), a1 = goc1 ? DUONG_RONG / 2 : -10;
        this.veDoanDuong(x, th, ax + dx * a0, ay + dy * a0, bx - dx * a1, by - dy * a1);
      }
      if (!G.chung) for (let i = 1; i < pts.length - 1; i++) this.veGoc(x, gc, pts[i - 1], pts[i], pts[i + 1]);
    }
    if (G.chung) { // ngã ba co-op: vẽ lại hành lang chung đè lên làn dọc
      const p = G.duong[0], [ax, ay] = p.pts[1], [bx, by] = p.pts[2];
      this.veDoanDuong(x, th, ax, ay, bx + 10, by);
    }
    this._choNen = !du;
  },
  veDoanDuong(x, th, ax, ay, bx, by) {
    const L = Math.hypot(bx - ax, by - ay); if (L < 1) return;
    x.save(); x.translate(ax, ay); x.rotate(Math.atan2(by - ay, bx - ax) - Math.PI / 2);
    x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = 10;
    if (!th) { x.fillStyle = '#44474d'; x.fillRect(-DUONG_RONG / 2, 0, DUONG_RONG, L); x.restore(); return; }
    const tl = th.height * (DUONG_RONG / th.width);
    for (let y = 0; y < L; y += tl) {
      const h = Math.min(tl, L - y);
      x.drawImage(th, 0, 0, th.width, th.height * (h / tl), -DUONG_RONG / 2, y, DUONG_RONG, h);
    }
    x.restore();
  },
  veGoc(x, gc, p0, p1, p2) {
    if (!gc) return;
    const din = [Math.sign(p1[0] - p0[0]), Math.sign(p1[1] - p0[1])], dout = [Math.sign(p2[0] - p1[0]), Math.sign(p2[1] - p1[1])];
    const can = [[-din[0], -din[1]], dout];
    let up = [0, -1], rt = [1, 0];
    for (let k = 0; k < 4; k++) {
      const ok = (a, b) => a[0] === b[0] && a[1] === b[1];
      if ((ok(up, can[0]) && ok(rt, can[1])) || (ok(up, can[1]) && ok(rt, can[0]))) {
        x.save(); x.translate(p1[0], p1[1]); x.rotate(k * Math.PI / 2);
        x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = 10;
        x.drawImage(gc, -DUONG_RONG / 2, -DUONG_RONG / 2, DUONG_RONG, DUONG_RONG); x.restore(); return;
      }
      up = [-up[1], up[0]]; rt = [-rt[1], rt[0]];
    }
  },

  coU(T) { const B = G.ban[T.ban]; return Math.min(B.cw, B.ch) * 0.98; },
  coDau(T) { const m = (window.ART_META || {})[T.id] || { s: 1 }; return this.coU(T) * 0.82 * m.s; },

  // ---------- khung hình ----------
  ve(dt) {
    this.t += dt;
    const ctx = this.ctx, k = this.s * this.dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (this.nen) ctx.drawImage(this.nen, 0, 0); else { ctx.fillStyle = '#222'; ctx.fillRect(0, 0, this.cv.width, this.cv.height); }
    ctx.setTransform(k, 0, 0, k, FX.rungX * k, FX.rungY * k);
    if (!G.ban.length) return;
    this.veCongLoi(ctx);
    this.veNhanBan(ctx);
    for (const o of G.hu) if ((o.k === 'may' || o.k === 'hoden') && HU[o.k].ve) HU[o.k].ve(ctx, o, this);
    this.veQuai(ctx);
    this.veO(ctx);
    for (const o of G.hu) if (o.k === 'tuong') HU.tuong.ve(ctx, o, this);
    this.veLaser(ctx);
    this.veDan(ctx);
    for (const o of G.hu) if (o.k !== 'may' && o.k !== 'hoden' && o.k !== 'tuong' && HU[o.k] && HU[o.k].ve) HU[o.k].ve(ctx, o, this);
    this.veFx(ctx);
    this.veKeo(ctx);
    this.veChu(ctx);
    if (FX.chop > 0) { ctx.globalAlpha = Math.min(0.6, FX.chop); ctx.fillStyle = FX.chopMau; ctx.fillRect(-20, -20, W + 40, H + 40); ctx.globalAlpha = 1; }
  },

  veCongLoi(ctx) {
    const t = this.t, daLoi = new Set();
    for (const p of G.duong) {
      const [x, y] = p.pts[0];
      // cổng sinh: vòng ngoài đứng yên, lõi xoáy quay (cắt tròn rồi xoay chính ảnh)
      const a = this.img('cong'), co = 56;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const gl = ctx.createRadialGradient(x, y, 4, x, y, 46); gl.addColorStop(0, 'rgba(170,60,255,.45)'); gl.addColorStop(1, 'rgba(170,60,255,0)');
      ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, 46, 0, 7); ctx.fill(); ctx.restore();
      if (a) {
        ctx.drawImage(a, x - co / 2, y - co / 2, co, co);
        ctx.save(); ctx.beginPath(); ctx.arc(x, y, co * 0.3, 0, 7); ctx.clip();
        ctx.translate(x, y); ctx.rotate(-t * 2.2); ctx.drawImage(a, -co / 2, -co / 2, co, co); ctx.restore();
      }
      const e = p.pts[p.pts.length - 1], key = e + '';
      if (daLoi.has(key)) continue; daLoi.add(key);
      const l = this.img('loi'), cl = 60, bob = Math.sin(t * 2.4) * 1.5;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g2 = ctx.createRadialGradient(e[0], e[1] - 8, 2, e[0], e[1] - 8, 44); g2.addColorStop(0, 'rgba(90,240,255,' + (0.45 + 0.15 * Math.sin(t * 3)) + ')'); g2.addColorStop(1, 'rgba(90,240,255,0)');
      ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(e[0], e[1] - 8, 44, 0, 7); ctx.fill(); ctx.restore();
      if (l) ctx.drawImage(l, e[0] - cl / 2, e[1] - cl / 2 - 6 + bob, cl, cl);
    }
  },
  veNhanBan(ctx) {
    ctx.font = '800 10px "Be Vietnam Pro",sans-serif'; ctx.textAlign = 'left';
    for (const B of G.ban) {
      if (G.ban.length < 2) break;
      const s = B.ten, w = ctx.measureText(s).width + 14;
      const x = B.x + B.w - w - 10, y = B.y + 1;
      ctx.fillStyle = B.i === 0 ? 'rgba(40,140,255,.85)' : (G.che === 'pvp' ? 'rgba(220,40,50,.85)' : 'rgba(40,190,120,.85)');
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y - 6, w, 14, 5) : ctx.rect(x, y - 6, w, 14); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillText(s, x + 7, y + 4.5);
    }
  },

  veQuai(ctx) {
    for (const E of G.quai) {
      const co = E.d.co * (E.trum ? 1 : 1), bay = E.d.bay;
      let sc = 1, al = 1;
      if (E.chet) { if (E.tChet >= 0.25) continue; sc = 1 + E.tChet * 1.6; al = 1 - E.tChet / 0.25; }
      sc *= 0.6 + 0.4 * E.vao;
      const oy = bay ? -6 + Math.sin(E.bob) * 2.5 : 0;
      // bóng tiếp đất
      ctx.globalAlpha = 0.45 * al;
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(E.x + 2, E.y + co * 0.2 + (bay ? 6 : 0), co * 0.32 * (bay ? 0.8 : 1), co * 0.14, 0, 0, 7); ctx.fill();
      ctx.globalAlpha = al;
      const ten = E.trum ? 'trum_' + E.trum : 'quai_' + (E.d.anh || E.id);
      let f;
      if (E.trum) f = E.bao ? 3 : [0, 1, 2, 1][Math.floor(E.khung * 0.8) % 4];
      else f = Math.floor(E.khung) % 4;
      const goc = E.trum ? 0 : E.goc - Math.PI / 2;
      const x = E.x, y = E.y + oy, cv = co * sc;
      if (E.bao) { // trùm báo trước: quầng màu chiêu
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const gg = ctx.createRadialGradient(x, y, 4, x, y, co * 0.9); const m = TRUM[E.trum].mau;
        gg.addColorStop(0, m + 'aa'); gg.addColorStop(1, m + '00');
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(this.t * 20); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x, y, co * 0.9, 0, 7); ctx.fill(); ctx.restore();
        ctx.globalAlpha = al;
      }
      if (E.cham > 0 && !E.d.khangCham) { // bị chậm: quầng băng dưới chân
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5 * al;
        this.anhGiua(ctx, this.cham1('#7fdcff'), x, y, co * 1.1); ctx.restore(); ctx.globalAlpha = al;
      }
      const dai = this.co(ten, co * 4);
      if (!dai || !this.khung(ctx, ten, f, x, y, cv, goc, dai)) { ctx.fillStyle = '#a040ff'; ctx.beginPath(); ctx.arc(x, y, co * 0.3, 0, 7); ctx.fill(); }
      if (E.flash > 0 || E.chet) {
        const w = this.co(ten, co * 4, 'trang');
        if (w) { ctx.globalAlpha = (E.chet ? 0.8 * al : E.flash / 0.09) * 0.85; this.khung(ctx, ten, f, x, y, cv, goc, w); }
      }
      if (E.docT > 0 && Math.random() < 0.06) FX.hat1('lua', x + rnd(-8, 8), y, 0, -20, 0.5, 6, '#9dff5a');
      ctx.globalAlpha = 1;
      // thanh máu
      if (!E.chet && E.hp < E.max && !E.trum) {
        const w = Math.max(18, co * 0.55), yy = y - co * 0.42;
        ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(x - w / 2 - 1, yy - 1, w + 2, 5);
        ctx.fillStyle = E.docT > 0 ? '#7cff4a' : (E.cham > 0 && !E.d.khangCham ? '#6fd8ff' : '#ff4a4a');
        ctx.fillRect(x - w / 2, yy, w * clamp(E.hp / E.max, 0, 1), 3);
      }
      if (E.trum && !E.chet) {
        const w = 70, yy = y - co * 0.55;
        ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(x - w / 2 - 2, yy - 2, w + 4, 8);
        ctx.fillStyle = TRUM[E.trum].mau; ctx.fillRect(x - w / 2, yy, w * clamp(E.hp / E.max, 0, 1), 4);
        if (E.bao) { // đường ngắm tới ụ bị nhắm
          const B = G.ban[E.ban];
          ctx.save(); ctx.strokeStyle = TRUM[E.trum].mau; ctx.globalAlpha = 0.7; ctx.lineWidth = 2; ctx.setLineDash([5, 6]); ctx.lineDashOffset = -this.t * 60;
          for (const T of B.t) if (T && E.bao.muc.includes(T.uid)) { const c = B.o[T.o]; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(c.x, c.y); ctx.stroke(); }
          ctx.restore();
        }
      }
    }
  },

  veO(ctx) {
    const keo = UI.keo;
    for (const B of G.ban) {
      for (let i = 0; i < 15; i++) {
        const T = B.t[i]; if (!T) continue;
        if (keo && keo.T === T && keo.dang) { // ô gốc khi đang kéo: bóng mờ
          this.veU(ctx, T, B.o[i].x, B.o[i].y, { alpha: 0.25 }); continue;
        }
        let o = {};
        if (keo && keo.dang && keo.T.ban === B.i) {
          if (hopLeGhep(keo.T, T)) o.dich = true; else o.alpha = 0.45;
        }
        this.veU(ctx, T, B.o[i].x, B.o[i].y, o);
      }
    }
    // ụ bay vào nhau khi ghép
    for (const b of G.bay) {
      const u = Math.min(1, b.t / 0.16), e = u * u;
      const x = b.x0 + (b.x1 - b.x0) * e, y = b.y0 + (b.y1 - b.y0) * e - Math.sin(u * Math.PI) * 18;
      this.veU(ctx, { id: b.id, sao: b.sao, bac: b.bac, goc: -Math.PI / 2, rx: 0, st: {}, ban: 0, o: 0, aurora: 0, buf: {} }, x, y, { scale: 1 - u * 0.3, ghost: true });
    }
  },

  // vẽ 1 ụ: bóng · vòng bậc · bệ · đầu súng xoay (giật lùi) · lớp phủ trạng thái · xúc xắc sao
  veU(ctx, T, x, y, o) {
    o = o || {};
    const B = G.ban[T.ban] || G.ban[0];
    const S = Math.min(B.cw, B.ch) * 0.98 * (o.scale || 1);
    let sx = 1, sy = 1, oy = 0, aPillar = 0;
    const an = T.anim;
    if (an && an.k === 'tha') { // thả rơi: rơi xuống → bẹp → nảy
      const t = an.t;
      if (t < 0.2) { const u = t / 0.2; oy = -80 * (1 - u * u); sy = 1.15; sx = 0.88; }
      else { const u = (t - 0.2) / 0.4; const k = Math.exp(-6 * u) * Math.cos(u * 18); sx = 1 + 0.28 * k; sy = 1 - 0.28 * k; }
      if (t >= 0.2 && !an.dat) { an.dat = true; FX.bui(x, y + S * 0.3, 9, S * 0.35); FX.vong1(x, y, 6, S * 0.75, '#ffffff', 0.3, 3); SND.dat(); if (T.bac === 'vang' || T.bac === 'do') { FX.tiaLua(x, y, 18, TIERS[T.bac].mau, 220, 12); FX.lac(3); } }
      if (T.bac === 'vang' || T.bac === 'do') aPillar = Math.max(0, 1 - t / 0.6);
    } else if (an && an.k === 'no') { // bật ra sau ghép: phóng to quá đà rồi về
      const u = an.t / 0.5; const e = 1 - Math.exp(-7 * u) * Math.cos(u * 12);
      sx = sy = Math.max(0.05, e);
    }
    const al = o.alpha != null ? o.alpha : 1;
    ctx.globalAlpha = al;
    if (aPillar > 0) { // cột sáng (vàng/đỏ)
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = aPillar * 0.9;
      const g = ctx.createLinearGradient(x, y - 260, x, y);
      const m = TIERS[T.bac].mau; g.addColorStop(0, m + '00'); g.addColorStop(0.7, m + 'aa'); g.addColorStop(1, '#ffffffee');
      ctx.fillStyle = g; ctx.fillRect(x - S * 0.32, y - 260, S * 0.64, 260); ctx.restore(); ctx.globalAlpha = al;
    }
    // bóng tiếp đất
    ctx.fillStyle = 'rgba(0,0,0,.45)';
    ctx.beginPath(); ctx.ellipse(x + 3, y + S * 0.12 + 4, S * 0.46 * sx, S * 0.34 * sy, 0, 0, 7); ctx.fill();
    if (o.dich) { // đích ghép hợp lệ: quầng nháy
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.55 + 0.35 * Math.sin(this.t * 10);
      this.anhGiua(ctx, this.cham1(TIERS[T.bac].mau), x, y, S * 1.9); ctx.restore(); ctx.globalAlpha = al;
    }
    if (T.st.lua > 0 || B.cuong > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35; this.anhGiua(ctx, this.cham1('#ff7a2a'), x, y, S * 1.6); ctx.restore(); ctx.globalAlpha = al; }
    ctx.save(); ctx.translate(x, y + oy); ctx.scale(sx, sy);
    const da = T.st.da;
    // vòng bậc (sau bệ, ló viền + ngọc); vàng/đỏ ánh lấp lánh
    // thân tĩnh (bệ + vòng bậc + xúc xắc sao) dựng sẵn 1 ảnh → mỗi khung chỉ 1 lần vẽ
    const than = this.than(T, S, da);
    if (than) ctx.drawImage(than, -S * 0.75, -S * 0.75, S * 1.5, S * 1.5);
    const R = S * 1.1;
    if (T.bac === 'tim' || T.bac === 'vang' || T.bac === 'do') { // vòng bậc lấp lánh: vàng/đỏ mạnh hơn, đỏ có than hồng bay lên
      const manh = T.bac === 'vang' ? 0.45 : T.bac === 'do' ? 0.6 : T.bac === 'tim' ? 0.25 : 0.15;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * manh * (0.5 + 0.5 * Math.sin(this.t * 3 + (T.pha || 0)));
      this.ve1(ctx, 'tier_ring_' + T.bac, R); ctx.restore();
      if (T.bac === 'do' && !o.ghost && Math.random() < 0.08) FX.hat1('than', x + rnd(-S * 0.5, S * 0.5), y + rnd(-S * 0.2, S * 0.4), rnd(-6, 6), -26, 0.9, 5, '#ff6a2a');
    }
    // nạp năng lượng (overlord, tường, hố đen, mana): vòng sáng quanh bệ
    if (T.nap > 0.02 && !o.ghost && (T.id === 'overlord' || T.id === 'wallgen' || T.id === 'blackhole' || T.id === 'mana')) {
      const m = T.id === 'overlord' ? '#ff5040' : T.id === 'mana' ? '#c77dff' : T.id === 'blackhole' ? '#ff3b9b' : '#7ffcff';
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = m; ctx.lineWidth = 2.2; ctx.globalAlpha = al * 0.85;
      ctx.beginPath(); ctx.arc(0, 0, S * 0.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * T.nap); ctx.stroke();
      if (T.nap > 0.8) { ctx.globalAlpha = al * (T.nap - 0.8) * 4 * (0.6 + 0.4 * Math.sin(this.t * 30)); this.anhGiua(ctx, this.cham1(m), 0, 0, S * 1.5); }
      ctx.restore(); ctx.globalAlpha = al;
    }
    // vòng quét nâng cấp
    if (T.lvSang > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#7dff6a'; ctx.lineWidth = 3; ctx.globalAlpha = T.lvSang;
      const a0 = (1 - T.lvSang) * Math.PI * 4;
      ctx.beginPath(); ctx.arc(0, 0, S * 0.56, a0, a0 + Math.PI * 1.2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, S * (0.3 + (1 - T.lvSang) * 0.5), 0, 7); ctx.stroke(); ctx.restore(); ctx.globalAlpha = al;
    }
    // đầu súng
    const m = (window.ART_META || {})[T.id] || { s: 1 };
    const D = S * 0.82 * m.s;
    const dau = this.co(T.id + '_nong', D, da ? 'xam' : '');
    if (dau) {
      ctx.save();
      let goc = T.goc;
      if (T.id === 'mana') { goc = 0; const p = 1 + 0.04 * Math.sin(this.t * 3 + T.pha) + 0.1 * T.sang; ctx.translate(0, -2 + Math.sin(this.t * 2 + T.pha) * 1.6); ctx.scale(p, p); }
      if (T.id === 'mimic') goc = T.goc;
      // bóng đầu súng đổ xuống bệ (ánh sáng từ trên-trái, cố định)
      const bx = 2 - Math.cos(goc) * (T.rx || 0) * 0, by = 3;
      ctx.save(); ctx.translate(bx, by); ctx.rotate(goc); ctx.translate(T.rx || 0, 0); this.ve1(ctx, T.id + '_nong', D, 'den'); ctx.restore();
      ctx.rotate(goc); ctx.translate(T.rx || 0, 0);
      ctx.drawImage(dau, -D / 2, -D / 2, D, D);
      // ánh sáng phụ: mimic cầu vồng, mana phát sáng, tesla cuộn nạp, laser nóng
      let sang = 0;
      if (T.id === 'mana') sang = 0.15 + 0.15 * Math.sin(this.t * 3) + T.sang * 0.6;
      if (T.id === 'set' && T.cd < 0.18 && !da) sang = (0.18 - T.cd) * 4;
      if (T.id === 'laser' && T.las && T.las.on) sang = 0.2 + T.las.ramp * 0.5;
      if (T.id === 'overlord') sang = T.nap * T.nap * 0.7;
      if (T.aurora > 0 || T.id === 'mimic') sang = Math.max(sang, 0.25 + 0.2 * Math.sin(this.t * 4 + T.pha));
      if (T.chop > 0) sang = Math.max(sang, T.chop * 3);
      if (sang > 0 && !da) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * Math.min(1, sang); ctx.drawImage(dau, -D / 2, -D / 2, D, D); }
      ctx.restore();
      if (T.id === 'mimic' || T.aurora > 0) { // ánh cầu vồng chạy vòng
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * 0.5;
        const mau = ['#ff4b8a', '#ffd23f', '#4bff9a', '#4fb8ff', '#c77dff'];
        const k = Math.floor(this.t * 3 + (T.pha || 0)) % 5;
        const a = this.t * 2.5 + (T.pha || 0);
        this.anhGiua(ctx, this.cham1(mau[k]), Math.cos(a) * S * 0.3, Math.sin(a) * S * 0.3, S * 0.7);
        ctx.restore(); ctx.globalAlpha = al;
      }
    }
    // tesla: cuộn sáng ở đầu nòng trước khi phóng
    if (T.id === 'set' && T.cd < 0.18 && !da && !o.ghost) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (0.18 - T.cd) * 5;
      this.anhGiua(ctx, this.cham1('#fff27a'), Math.cos(T.goc) * D * 0.4, Math.sin(T.goc) * D * 0.4, S * 0.8); ctx.restore(); ctx.globalAlpha = al;
    }
    // lớp phủ trạng thái
    if (T.st.bang > 0) { ctx.globalAlpha = al * 0.95; this.ve1(ctx, 'phu_bang', S * 1.12); ctx.globalAlpha = al; }
    if (da) this.ve1(ctx, 'phu_da', S * 1.15);
    if (T.st.lua > 0) { const f = 1 + 0.06 * Math.sin(this.t * 22); ctx.save(); ctx.scale(f, 1 / f); this.ve1(ctx, 'phu_lua', S * 1.2, '', 0, -2); ctx.restore(); }
    if (T.st.ngam > 0) { ctx.save(); ctx.rotate(this.t * 2); const f = 1.25 - 0.2 * (1 - T.st.ngam / 1.4); ctx.globalAlpha = al * (0.6 + 0.4 * Math.sin(this.t * 24)); this.anhGiua(ctx, 'phu_ngam', 0, 0, S * f); ctx.restore(); ctx.globalAlpha = al; }
    if (B.khien > 0 && !o.ghost) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.25 + 0.1 * Math.sin(this.t * 5); ctx.strokeStyle = '#9fe6ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, S * 0.56, 0, 7); ctx.stroke(); ctx.restore(); ctx.globalAlpha = al; }
    ctx.restore();
    // chấm sao sáng nhấp nháy nhẹ
    ctx.globalAlpha = 1;
  },
  // thân ụ dựng sẵn: bệ + vòng bậc + ô xúc xắc sao (bố cục 1–7 như mặt xúc xắc)
  than(T, S, da) {
    const k = this.s * this.dpr, n = Math.round(S * 1.5 * k), key = 'than|' + T.id + '|' + T.sao + '|' + T.bac + '|' + (da ? 1 : 0) + '|' + n;
    let c = this.cache[key]; if (c) return c;
    const de = da ? this.banXam(T.id + '_de') : this.img(T.id + '_de'), vr = this.img('tier_ring_' + T.bac);
    if (!de || !vr) return null;
    c = document.createElement('canvas'); c.width = c.height = n;
    const x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
    const q = n / (S * 1.5); x.scale(q, q); x.translate(S * 0.75, S * 0.75);
    const SB = S * 0.86, R = S * 1.1;
    x.drawImage(de, -SB / 2, -SB / 2, SB, SB);
    x.drawImage(vr, -R / 2, -R / 2, R, R);
    this.veSao(x, -S * 0.44, S * 0.26, T.sao, T.bac, 1, true);
    return (this.cache[key] = c);
  },
  veSao(ctx, x, y, n, bac, al) {
    const co = 17, r = 2.1, d = 4.6;
    ctx.globalAlpha = al * 0.9;
    ctx.fillStyle = 'rgba(12,14,18,.88)'; ctx.strokeStyle = TIERS[bac].mau; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - co / 2, y - co / 2, co, co, 4) : ctx.rect(x - co / 2, y - co / 2, co, co); ctx.fill(); ctx.stroke();
    const P = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
      6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]], 7: [[-1, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [1, 1]] }[n] || [];
    const g = this.cham1(TIERS[bac].mau);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * 0.7;
    for (const [a, b] of P) ctx.drawImage(g, x + a * d - 5, y + b * d - 5, 10, 10);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = al;
    ctx.fillStyle = '#fff';
    for (const [a, b] of P) { ctx.beginPath(); ctx.arc(x + a * d, y + b * d, r * (n === 7 && !a && !b ? 1 : 1), 0, 7); ctx.fill(); }
  },

  veLaser(ctx) {
    for (const B of G.ban) for (const T of B.t) {
      if (!T || T.id !== 'laser' || !T.las || !T.las.on || T.st.bang > 0 || T.st.da) continue;
      const E = T.las.E; if (!E || E.chet) continue;
      const [x, y] = dauNong(T), r = T.las.ramp;
      const w = 6 + r * 10 + Math.sin(this.t * 60) * 1.5;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.85 + 0.15 * Math.sin(this.t * 47);
      this.tia(ctx, 'tia_laser', x, y, E.x, E.y, w, this.t * 500);
      ctx.globalAlpha = 0.9;
      this.khung(ctx, 'fx_laser_trung', 1 + Math.floor(this.t * 20) % 3, E.x, E.y, 30 + r * 26, this.t * 3);
      this.anhGiua(ctx, this.cham1('#ff7af0'), x, y, 22 + r * 14);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
  },
  veDan(ctx) {
    for (const d of G.dan) {
      const z = d.z || 0;
      if (d.cong) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(d.x, d.y + 4, 6 + z * 0.02, 3, 0, 0, 7); ctx.fill(); }
      const co = d.co * (1 + z / 140);
      ctx.globalCompositeOperation = d.img === 'dan_phao' ? 'source-over' : 'lighter';
      if (!this.anhGiua(ctx, d.img, d.x, d.y - z, co, d.goc)) { ctx.fillStyle = '#ffd060'; ctx.beginPath(); ctx.arc(d.x, d.y - z, 3, 0, 7); ctx.fill(); }
      ctx.globalCompositeOperation = 'source-over';
    }
  },
  veFx(ctx) {
    ctx.globalCompositeOperation = 'lighter';
    for (const a of FX.anim) {
      const f = Math.min(5, Math.floor(a.t / a.song * 6));
      ctx.globalAlpha = 1;
      this.khung(ctx, 'fx_' + a.ten, f, a.x, a.y, a.co, a.goc);
    }
    for (const v of FX.vong) {
      const u = v.t / v.song, e = 1 - (1 - u) * (1 - u);
      ctx.globalAlpha = 1 - u; ctx.strokeStyle = v.mau; ctx.lineWidth = v.day * (1 - u) + 0.5;
      ctx.beginPath(); ctx.arc(v.x, v.y, Math.max(0.5, v.r0 + (v.r1 - v.r0) * e), 0, 7); ctx.stroke();
    }
    const lua = this.img('tia_lua');
    for (const p of FX.hat) {
      const u = p.t / p.song;
      if (p.k === 'khoi') continue;
      if (p.k === 'bui') continue;
      ctx.globalAlpha = 1 - u;
      const c = p.co * (p.k === 'than' ? 1 : 1 - u * 0.5);
      if (p.k === 'lua' && lua && (p.mau === '#ffb060' || p.mau === '#ffd080')) ctx.drawImage(lua, p.x - c / 2, p.y - c / 2, c, c);
      else ctx.drawImage(this.cham1(p.mau), p.x - c, p.y - c, c * 2, c * 2);
    }
    ctx.globalCompositeOperation = 'source-over';
    // khói + bụi (hoà trộn thường)
    for (const p of FX.hat) {
      const u = p.t / p.song;
      if (p.k === 'khoi') { ctx.globalAlpha = 0.55 * (1 - u * 0.6); this.anhGiua(ctx, 'khoi_' + Math.min(3, Math.floor(u * 4)), p.x, p.y, p.co * (0.8 + u * 0.9), p.xoay); }
      else if (p.k === 'bui') { ctx.globalAlpha = 0.5 * (1 - u); ctx.fillStyle = '#9a9690'; ctx.beginPath(); ctx.arc(p.x, p.y, p.co * (0.6 + u * 0.7), 0, 7); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  },
  veKeo(ctx) {
    const k = UI.keo; if (!k || !k.dang) return;
    const T = k.T;
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(k.x + 10, k.y + 22, 24, 12, 0, 0, 7); ctx.fill();
    this.veU(ctx, T, k.x, k.y - 10, { scale: 1.12 });
  },
  veChu(ctx) {
    ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    for (const c of FX.chu) {
      const u = c.t / c.song;
      let sc = 1, y = c.y - u * 26;
      if (c.kieu === 'crit') sc = 1 + 0.6 * Math.max(0, 1 - u * 5);
      if (c.kieu === 'to') { sc = u < 0.15 ? 0.5 + u / 0.15 * 0.7 : 1.2 - Math.min(0.2, (u - 0.15)); y = c.y - u * 18; }
      ctx.globalAlpha = u > 0.7 ? (1 - u) / 0.3 : 1;
      ctx.font = '900 ' + Math.round(c.co * sc) + 'px "Be Vietnam Pro",sans-serif';
      ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(0,0,0,.85)';
      if (c.kieu === 'mana') { this.anhGiua(ctx, 'ui_mana', c.x - ctx.measureText(c.s).width / 2 - 8, y - c.co * 0.35, 14); }
      ctx.strokeText(c.s, c.x, y); ctx.fillStyle = c.mau; ctx.fillText(c.s, c.x, y);
    }
    ctx.globalAlpha = 1;
  },
};
