// TURRET MERGE — CHU: CHỮ TRONG TRẬN CỦA BẢN WEBGL = Ô ẢNH KÝ TỰ (bitmap glyph) — tuvan/webgl/KE-HOACH.md mục 11.
// Vì sao: trên iPhone mỗi lần tải canvas → texture tốn 3–50 ms. Trước đây chữ trong trận sinh canvas nhỏ liên tục: số sát thương (REN.chuSo: mỗi ký tự × màu × cỡ = 2 canvas),
//   chữ nổi khác (REN.chuAnh: mỗi chuỗi 1 canvas), chữ vẽ thẳng fillText/strokeText (kho chữ của GLR: mỗi chuỗi × cỡ × màu 1 canvas — "JACKPOT!" phóng dần = mỗi cỡ 1 lần tải),
//   ký tự tấm đếm (DEMKN.kyTu: mỗi ký tự × màu × cỡ).
// Giờ: mỗi (phông, cỡ điểm ảnh) có 1 "mặt chữ" = tờ ký tự TRẮNG (ruột + viền, dựng bằng CHÍNH phông của game — không vẽ hình nào khác), tô màu bằng màu đỉnh của shader
//   (GLR.ve đọc X.nhuom). Tờ dựng sẵn bộ ký tự hay gặp → cả trận 1 lần tải / mặt chữ; ký tự lạ thêm vào tờ (GLR.ban → tải lại đúng 1 tờ). Màu / chuỗi / số mới: KHÔNG tải gì.
//   · cỡ CHÍNH XÁC (số sát thương, chữ nổi, tấm đếm — cỡ rời rạc): tờ đúng cỡ điểm ảnh thiết bị, vẽ 1:1 như cũ;
//   · cỡ THEO BẬC (fillText/strokeText bất kỳ, cỡ chạy theo hoạt ảnh): tờ ở bậc cỡ ≥ cỡ xin (bậc × 1,25), GPU thu nhỏ; nét viền dựng theo tỉ lệ để sau khi thu vẫn đúng độ dày.
// CHỈ HÌNH, chỉ khi lớp GL đang vẽ. ?gl=0 / 2D dự phòng: mọi thứ đi đường cũ (không file nào ở đây chạy). ?chugl=0: tắt riêng phần này (để so).
'use strict';
const CHU = (() => {
  const TAT = (() => { try { return new URLSearchParams(location.search).get('chugl') === '0'; } catch (e) { return false; } })();
  const RONG = 512, BAC = 1.25, BAC_NET = 1.25, MAT_MAX = 28;
  // bộ ký tự dựng sẵn: SO = số sát thương / +N / tấm đếm · CHU = nhãn kỹ năng, tên ụ, JACKPOT… (chữ hoa + thường + dấu hay gặp)
  const SO = '0123456789KMB.,+-×x/%!★:', HOA = 'ACDEFGHIJLNOPQRSTUVWXYZ?\'()', THUONG = 'abcdefghijklmnopqrstuvwxyz', CHU_CAI = HOA + THUONG, BO = [SO, HOA, THUONG]; // K M B nằm ở bộ SO
  let mx = null; const do_ = () => mx || (mx = document.createElement('canvas').getContext('2d'));
  const I = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, al: 1, op: 0, cat: null, trang: 0, nhuom: null }; // "ngữ cảnh" đơn vị (điểm ảnh thiết bị) cho GLR.ve
  const C = {
    tat: TAT, SO, CHU_CAI, DEN: [0, 0, 0, 1], mat: new Map(), _mau: new Map(), _font: new Map(), dem: { mat: 0, to: 0, kyTu: 0, them: 0, ve: 0 },
    // lớp GL đang vẽ khung này (ngoài khung / 2D dự phòng / ?gl=0 → false → đường cũ)
    chay() { return !TAT && typeof GLR !== 'undefined' && GLR.bat && GLR.dangVe && !this._cho(); },
    _cho() { try { return !!(document.fonts && document.fonts.status === 'loading'); } catch (e) { return false; } }, // phông đang về: chưa dựng tờ (dựng bằng phông dự phòng là sai hình)
    xoa() { this.mat.clear(); this._font.clear(); },
    // màu CSS → [r, g, b, a] (0–255, a 0–1); null = không phải màu đặc
    mau(s) {
      if (typeof s !== 'string') return null;
      let m = this._mau.get(s); if (m !== undefined) return m;
      const x = do_(); x.fillStyle = '#010203'; x.fillStyle = s; const v = x.fillStyle; m = null;
      if (typeof v === 'string') {
        if (v[0] === '#' && v.length === 7) { if (v !== '#010203' || /^#010203$/i.test(s.trim())) m = [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16), 1]; }
        else { const q = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?/.exec(v); if (q) m = [+q[1], +q[2], +q[3], q[4] === undefined ? 1 : +q[4]]; }
      }
      if (this._mau.size > 300) this._mau.clear(); this._mau.set(s, m); return m;
    },
    // tách ctx.font → { dau, duoi, px } ('900 ' + 12 + 'px "TM Display",…'); null = không hiểu
    font(f) {
      let p = this._font.get(f); if (p !== undefined) return p;
      const q = /^(.*?)(\d+(?:\.\d+)?)px(\s.*)$/.exec(f); p = q && +q[2] > 0 ? { dau: q[1], duoi: q[3], px: +q[2] } : null;
      if (this._font.size > 300) this._font.clear(); this._font.set(f, p); return p;
    },
    // mặt chữ: phông (dau + P + 'px' + duoi) ở cỡ P ĐIỂM ẢNH THIẾT BỊ. san = bộ ký tự dựng sẵn, net = [độ dày nét (điểm ảnh tờ), kiểu nối] dựng sẵn kèm ruột
    layMat(dau, duoi, P) {
      const key = dau + '|' + duoi + '|' + P; let M = this.mat.get(key); if (M) { M.f = GLR.f; return M; }
      if (this.mat.size >= MAT_MAX) { let cu = null, kc = null; for (const [k, v] of this.mat) if (!cu || v.f < cu.f) { cu = v; kc = k; } this.mat.delete(kc); } // quá nhiều cỡ (đổi cỡ màn…): bỏ mặt lâu không dùng nhất
      const x = do_(); x.font = dau + P + 'px' + duoi; x.textBaseline = 'alphabetic'; x.textAlign = 'left';
      const d = x.measureText('Hg'), as = Math.ceil(Math.max(d.fontBoundingBoxAscent || 0, d.actualBoundingBoxAscent || 0, P * 0.95)) + 1, de = Math.ceil(Math.max(d.fontBoundingBoxDescent || 0, d.actualBoundingBoxDescent || 0, P * 0.3)) + 1;
      M = { key, font: x.font, fontDat: dau + P + 'px' + duoi, P, as, de, to: [], le: null, g: new Map(), adv: new Map(), day: new Map(), goc: new Map(), f: GLR.f };
      this.mat.set(key, M); this.dem.mat++; return M;
    },
    // đo 1 ô ký tự (điểm ảnh của tờ); null = ký tự trống (dấu cách…)
    _do1(M, ch, net, noi) {
      const x = do_(); if (x.font !== M.font) x.font = M.fontDat; x.textBaseline = 'alphabetic'; x.textAlign = 'left';
      const d = x.measureText(ch), l = Math.max(0, Math.ceil(d.actualBoundingBoxLeft || 0)), r = Math.max(Math.ceil(d.width), Math.ceil(d.actualBoundingBoxRight || 0));
      if (!(d.width > 0) || !((d.actualBoundingBoxLeft || 0) + (d.actualBoundingBoxRight || 0) > 0)) return null;
      const le = Math.ceil(net ? net * (noi === 'miter' ? 3 : 0.75) : 0) + 2, as = Math.max(M.as, Math.ceil(d.actualBoundingBoxAscent || 0)), de = Math.max(M.de, Math.ceil(d.actualBoundingBoxDescent || 0));
      return { ch, l, le, as, w: l + r + 2 * le, h: as + de + 2 * le };
    },
    _to(M, w, h) {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d'); x.font = M.fontDat; x.textBaseline = 'alphabetic'; x.textAlign = 'left'; x.fillStyle = '#fff'; x.strokeStyle = '#fff';
      const T = { c, q: x, x: 0, y: 0, hh: 0 }; M.to.push(T); this.dem.to++; return T;
    },
    _in(M, T, o, x, y, net, noi) {
      const q = T.q; if (net) { q.lineWidth = net; q.lineJoin = noi || 'round'; q.strokeText(o.ch, x + o.le + o.l, y + o.le + o.as); } else q.fillText(o.ch, x + o.le + o.l, y + o.le + o.as);
      const g = { p: T.c, T, x, y, w: o.w, h: o.h, ox: o.le + o.l, oy: o.le + o.as }; M.g.set(net ? o.ch + '\n' + net + noi : o.ch, g); this.dem.kyTu++; return g;
    },
    // ô ký tự: net = 0 → ruột; net > 0 → viền dày net (điểm ảnh của tờ), kiểu nối noi. Trả { p (canvas tờ), x, y, w, h, ox, oy } · null = ký tự trống.
    //   Ký tự chưa có: dựng CẢ BỘ của nó (SO / HOA / THUONG) cho kiểu (ruột / viền) này vào 1 TỜ MỚI vừa khít → 1 lần tải / bộ / kiểu, không tải lại tờ cũ.
    //   Ký tự ngoài 2 bộ (hiếm): thêm vào tờ lẻ của mặt chữ + GLR.ban (tải lại riêng tờ lẻ).
    kyTu(M, ch, net, noi) {
      const key = net ? ch + '\n' + net + noi : ch; let g = M.g.get(key); if (g !== undefined) return g;
      let bo = null; for (const q of BO) if (q.indexOf(ch) >= 0) { bo = q; break; }
      if (bo) {
        const ds = []; for (const c of bo) { const o = this._do1(M, c, net, noi); if (o) ds.push(o); else M.g.set(net ? c + '\n' + net + noi : c, null); }
        let k = 0;
        while (k < ds.length) { // xếp kệ: hàng ≤ RONG, tờ cao ≤ RONG
          const vt = []; let x = 0, y = 0, hh = 0, wMax = 0, n = k;
          for (; n < ds.length; n++) { const o = ds[n]; if (x + o.w + 1 > RONG) { y += hh; x = 0; hh = 0; } if (y + o.h + 1 > RONG && n > k) break; vt.push(x, y); x += o.w + 1; if (o.h + 1 > hh) hh = o.h + 1; if (x > wMax) wMax = x; }
          const T = this._to(M, wMax, y + hh);
          for (let i = k; i < n; i++) this._in(M, T, ds[i], vt[(i - k) * 2], vt[(i - k) * 2 + 1], net, noi);
          k = n;
        }
        g = M.g.get(key); if (g === undefined) { g = null; M.g.set(key, null); }
        return g;
      }
      const o = this._do1(M, ch, net, noi); if (!o) { M.g.set(key, null); return null; }
      let T = M.le;
      if (T && T.x + o.w + 1 > T.c.width) { T.y += T.hh; T.x = 0; T.hh = 0; }
      if (!T || T.y + o.h + 1 > T.c.height) T = M.le = this._to(M, RONG, Math.min(RONG, (o.h + 1) * 2));
      g = this._in(M, T, o, T.x, T.y, net, noi); T.x += o.w + 1; if (o.h + 1 > T.hh) T.hh = o.h + 1;
      GLR.ban(T.c); this.dem.them++; // tờ lẻ đã lên GPU thì tải lại (1 lần / khung dù thêm mấy ký tự); chưa lên: vô hại
      return g;
    },
    rong1(M, ch) { let a = M.adv.get(ch); if (a === undefined) { const x = do_(); if (x.font !== M.font) x.font = M.fontDat; a = x.measureText(ch).width; M.adv.set(ch, a); } return a; },
    // bố cục 1 chuỗi (điểm ảnh của tờ): x từng ký tự + tổng rộng. roi = cộng bề rộng từng ký tự (như REN.chuSo); không thì đo theo tiền tố (đúng khoảng cách chữ vẽ liền)
    day(M, s, roi) {
      const key = (roi ? '1' : '0') + s; let d = M.day.get(key); if (d) return d;
      const cs = Array.from(s), xs = new Float32Array(cs.length); let w = 0;
      if (roi || /^[0-9.,+\-KMB%×x ]*$/.test(s)) { for (let i = 0; i < cs.length; i++) { xs[i] = w; w += this.rong1(M, cs[i]); } }
      else { const x = do_(); if (x.font !== M.font) x.font = M.fontDat; let t = ''; for (let i = 0; i < cs.length; i++) { xs[i] = i ? x.measureText(t).width : 0; t += cs[i]; } w = x.measureText(s).width; }
      d = { cs, xs, w }; if (M.day.size > 500) M.day.clear(); M.day.set(key, d); return d;
    },
    // lệch đường gốc: textBaseline bl → alphabetic (điểm ảnh của tờ; cộng vào y)
    gocY(M, bl) {
      if (!bl || bl === 'alphabetic') return 0; let v = M.goc.get(bl); if (v !== undefined) return v;
      const x = do_(); x.font = M.fontDat; x.textBaseline = 'alphabetic'; const a0 = x.measureText('H').actualBoundingBoxAscent; x.textBaseline = bl; const a1 = x.measureText('H').actualBoundingBoxAscent; x.textBaseline = 'alphabetic';
      v = a0 - a1; M.goc.set(bl, v); return v;
    },
    // VẼ 1 lượt (ruột hoặc viền) của chuỗi: (dx, dy) = mép trái + đường gốc alphabetic theo ĐIỂM ẢNH THIẾT BỊ, q = điểm ảnh thiết bị / điểm ảnh tờ, mau = [r, g, b, a]
    veDay(M, D, dx, dy, q, mau, al, op, cat, net, noi) {
      const R = GLR; I.al = al * mau[3]; if (!(I.al > 0)) return; I.op = op | 0; I.cat = cat || null; I.nhuom = mau;
      const cs = D.cs, xs = D.xs, bam = q === 1;
      for (let i = 0; i < cs.length; i++) {
        const g = this.kyTu(M, cs[i], net, noi); if (!g) continue;
        g.T.len = 1; const X = dx + (xs[i] - g.ox) * q, Y = dy - g.oy * q;
        R.ve(I, g.p, g.x, g.y, g.w, g.h, bam ? Math.round(X) : X, bam ? Math.round(Y) : Y, g.w * q, g.h * q);
      }
      I.nhuom = null; I.cat = null; this.dem.ve += cs.length;
    },
    // các tờ của 1 lượt vẽ chuỗi đã trên GPU chưa (chưa: tra() tải ngay nếu còn ngân sách tải của khung, hết thì xếp hàng nạp). 1 = đủ · 0 = đợi (khung sau) · -1 = tờ hỏng (đường cũ)
    //   → chuỗi không bao giờ hiện dở (có viền chưa có ruột / thiếu chữ) trong 1–3 khung tờ mới đang chờ tải
    du(M, D, net, noi) {
      const k = net ? net + noi : '', B = D.to || (D.to = {}); let L = B[k], kq = 1;
      if (!L) { L = B[k] = []; for (const ch of D.cs) { const g = this.kyTu(M, ch, net, noi); if (g && L.indexOf(g.p) < 0) L.push(g.p); } }
      for (const p of L) { if (p._glLoi === GLR.the) return -1; if (!GLR.tra(p, p.width, p.height)) kq = 0; }
      return kq;
    },
    // cỡ theo bậc: bậc nhỏ nhất ≥ P (8 × 1,25ⁿ điểm ảnh)
    bac(P) { let b = 8; while (b < P - 1e-6) b *= BAC; return Math.round(b * 100) / 100; },
    bacNet(L) { let b = 0.5; while (b * Math.sqrt(BAC_NET) < L) b *= BAC_NET; return Math.round(b * 100) / 100; },

    // ---------- 1) fillText / strokeText của ngữ cảnh GL (GLR.veChu gọi trước kho chữ cũ). true = đã vẽ ----------
    veLenh(X, f, args) {
      if (!this.chay()) return false;
      const s = X._s, k = X.a, net = f === 'strokeText', st = net ? s.strokeStyle : s.fillStyle, chu = String(args[0]);
      if (!chu || chu.length > 48) return false;
      const mau = this.mau(st), F = mau && this.font(s.font); if (!F) return false;
      for (let i = 0; i < chu.length; i++) if (chu.charCodeAt(i) > 0x2BFF || chu.charCodeAt(i) < 32) return false; // biểu tượng màu / chữ ngoài bảng thường: đường cũ
      const Pd = F.px * k; if (!(Pd >= 3 && Pd <= 200)) return false;
      const key = F.dau + '|' + F.duoi + '|' + Math.round(Pd * 100) / 100;
      let M = this.mat.get(key), q = 1; // có sẵn mặt đúng cỡ (số sát thương, tấm đếm) → dùng luôn; không thì mặt theo bậc
      if (M) M.f = GLR.f; else { const Pb = this.bac(Pd); q = Pd / Pb; M = this.layMat(F.dau, F.duoi, Pb); }
      let L = 0, noi = '';
      if (net) { L = q === 1 ? Math.round(s.lineWidth * k * 100) / 100 : this.bacNet(s.lineWidth * k / q); noi = s.lineJoin === 'bevel' ? 'bevel' : s.lineJoin === 'miter' ? 'miter' : 'round'; if (!(L > 0) || s.dash) return false; }
      const D = this.day(M, chu, false), ta = s.textAlign;
      let dx = Math.round(k * args[1] + X.e), dy = Math.round(k * args[2] + X.f) + this.gocY(M, s.textBaseline) * q;
      if (ta === 'center') dx -= D.w * q / 2; else if (ta === 'right' || ta === 'end') dx -= D.w * q;
      const d = this.du(M, D, L, noi); if (d < 0) return false; if (!d) return true;
      this.veDay(M, D, dx, dy, q, mau, X.al, X.op, X.cat, L, noi);
      return true;
    },

    // ---------- 2) chữ nổi của REN (REN.chuAnh / veChuAnh): số sát thương, +N, nhãn… — cỡ chính xác, viền 3,5 đơn vị logic rgba(0,0,0,.85) ----------
    VIEN: [0, 0, 0, 0.85],
    // thay cho ảnh chữ: { gl, s, mau, px, tw, lw, lh, by } — cùng các trường bố cục như canvas của REN.chuAnh / số ghép của REN.chuSo
    anh(s, mau, px) {
      const m = this.mau(mau); if (!m) return null;
      for (let i = 0; i < s.length; i++) if (s.charCodeAt(i) > 0x2BFF || s.charCodeAt(i) < 32) return null;
      const k = REN.s * REN.dpr, P = Math.round(px * k * 100) / 100, M = this.layMat('900 ', ' ' + FONT.display, P);
      const so = /^[0-9.KM+]{1,12}$/.test(s), net = Math.round(3.5 * k * 100) / 100;
      const D = this.day(M, s, so), tw = D.w / k;
      return { gl: 1, s, mau, px, m, M, D, net, k, tw, lw: tw + 8, lh: px * 1.35 + 6, by: px + 3 };
    },
    // vẽ ảnh chữ GL vào khung (x, y, w, h) logic như REN.veChuAnh; ctx = GLR.x (không xoay). false = không vẽ được ở đây (ctx 2D / xoay) → REN vẽ bản canvas
    veAnh(ctx, im, x, y, w, h) {
      if (!ctx.laGL || !this.chay() || ctx.b || ctx.c || !(ctx.a > 0) || Math.abs(ctx.d - ctx.a) > 1e-6 * ctx.a || ctx.op > 1) return false;
      const M = im.M; if (this.mat.get(M.key) !== M) return false; // mặt chữ đã bị bỏ (phông về muộn / đổi cỡ màn): REN dựng lại
      M.f = GLR.f;
      const q0 = w / im.lw, kd = ctx.a, q = q0 * kd / im.k; // q0 = phóng của hoạt ảnh nảy · q = điểm ảnh thiết bị / điểm ảnh tờ
      const dx = (x + 4 * q0) * kd + ctx.e, dy = (y + im.by * q0) * kd + ctx.f, qq = Math.abs(q - 1) < 1e-4 ? 1 : q;
      const d1 = this.du(M, im.D, im.net, 'round'), d2 = this.du(M, im.D, 0, ''); if (d1 < 0 || d2 < 0) return false; if (!d1 || !d2) return true;
      this.veDay(M, im.D, dx, dy, qq, this.VIEN, ctx.al, ctx.op, ctx.cat, im.net, 'round');
      this.veDay(M, im.D, dx, dy, qq, im.m, ctx.al, ctx.op, ctx.cat, 0, '');
      return true;
    },
    // ---------- 3) dựng sẵn ở màn mở đầu trận: 2 cỡ số sát thương hay gặp (thường / chí mạng) + cỡ nhãn ----------
    nong() {
      if (TAT || typeof GLR === 'undefined' || !GLR.bat || this._cho() || typeof REN === 'undefined') return 0;
      const k = REN.s * REN.dpr, net = Math.round(3.5 * k * 100) / 100; let n = 0;
      const d = typeof DIU !== 'undefined' && DIU.bat;
      for (const px of [Math.round(12 * (d ? 0.85 : 1)), Math.round(15 * (d ? 1.3 : 1.6) * (d ? 0.85 : 1))]) { // FX.chu1 của số sát thương: cỡ 12 (thường) / 15 (chí mạng) → cỡ vẽ như REN.veChu
        const M = this.layMat('900 ', ' ' + FONT.display, Math.round(px * k * 100) / 100);
        if (!M.to.length) { this.kyTu(M, '0', 0, ''); this.kyTu(M, '0', net, 'round'); n += M.to.length; for (const T of M.to) if (GLR.nap) GLR.nap(T.c); }
      }
      return n;
    },
    thongTin() { const r = []; for (const M of this.mat.values()) r.push(M.P + ':' + M.to.length + 'to/' + M.g.size + 'kt'); return { dem: this.dem, mat: r }; },
  };
  try { if (document.fonts) document.fonts.addEventListener('loadingdone', () => C.xoa()); } catch (e) { } // phông về muộn: dựng lại mọi tờ
  return C;
})();
// màn mở đầu trận: thay việc "dựng 0–9 cho 2 màu" của nongskill.js (20 canvas → 40 lần tải) bằng 2 tờ ký tự; ?gl=0 / chưa bật GL → việc cũ
if (typeof NS !== 'undefined' && NS.nongSo && !NS._chuGL) {
  const goc = NS.nongSo; NS._chuGL = true;
  NS.nongSo = function () { if (!CHU.tat && typeof GLR !== 'undefined' && GLR.bat && !CHU._cho()) { try { CHU.nong(); return; } catch (e) { } } return goc.apply(this, arguments); };
}
