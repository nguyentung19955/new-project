// TURRET MERGE — CHỐNG GIẬT KHI RA SKILL (đo: tools/thap-do-giat.js · báo cáo: docs/demo-hop-tuong/tuvan/giat_skill/BAO-CAO.md)
// Nguyên nhân giật đo được: lần ĐẦU một hình xuất hiện (trùm/hướng nhìn trùm, dải chiêu Freezer, hào quang buff, khoảnh khắc đặc biệt…)
// game phải THU NHỎ dải ảnh gốc về đúng cỡ màn (REN.coDai / REN.co / SIG.khung / REN.mip) — 5–21 ms MỖI dải, nhiều dải dồn 1 khung
// (trùm tung chiêu: 30–60 ms). Ảnh tải lười giữa trận còn phải giải mã đồng bộ ở lần vẽ đầu (iPhone).
// Cách chữa (KHÔNG đổi luật chơi / sát thương / thời điểm):
//  1) Ngân sách dựng ảnh mỗi khung (REN._xay): đã tốn > NGAN ms thu nhỏ trong khung này → vẽ tạm từ ảnh gốc / cỡ đã có, xếp việc dựng
//     vào hàng "nóng" (REN.nong) — hàng nóng chạy theo THỜI GIAN (≤ NONG ms/khung) thay vì 1 việc/khung.
//  2) Dải khung (coDai) giữa trận KHÔNG dựng một lèo: dựng TỪNG KHUNG một việc nhỏ (~1 ms) trong hàng nóng; trong lúc chờ vẽ từ dải gốc.
//  3) Làm nóng trước: trùm của wave này/wave sau (mọi hướng nhìn + dải đánh + chớp trắng + quái nó gọi + hình chiêu) khi còn ≥ 1 wave;
//     ảnh tình huống (hào quang buff, tia, đĩa…) tải + GIẢI MÃ nền ngay sau khi trận chạy; ảnh tải lười chỉ dùng khi đã decode() xong.
'use strict';
(() => {
  if (typeof REN === 'undefined') return;
  const NS = window.NS = { NGAN: 4, NONG: 3, NONG_MAX: 40, daNong: new Set(), _tKt: 0, _tLuoi: 0, thongKe: { hoan: 0, dung: 0 } };
  const now = () => performance.now();
  const trongTran = () => typeof G !== 'undefined' && G.ban && G.ban.length && !(typeof TAI !== 'undefined' && TAI.cho) && !REN._dangNong;

  // ---------- 1) ngân sách dựng ảnh mỗi khung ----------
  REN._xay = 0;
  const veGoc = REN.ve;
  REN.ve = function () { this._xay = 0; if (NS.amThanh) try { NS.amThanh(); } catch (e) { } return veGoc.apply(this, arguments); };
  const vnGoc = REN.veNho;
  REN.veNho = function () { const t0 = now(); try { return vnGoc.apply(this, arguments); } finally { this._xay += now() - t0; } };
  REN.hetNgan = function () { return trongTran() && this._xay > NS.NGAN; };
  // hàng nóng theo thời gian: chạy việc tới khi tốn NONG ms (ít nhất 1 việc); việc tự xếp lại (chờ ảnh) không chạy lại trong cùng khung
  REN.chayNong = function () {
    const t0 = now(), n0 = this._nong.length; this._dangNong = true;
    try { for (let i = 0; i < n0 && this._nong.length; i++) { const f = this._nong.shift(); try { f(); } catch (e) { } if (now() - t0 > NS.NONG) break; } }
    finally { this._dangNong = false; }
  };
  const xep = (key, fn) => { if (REN._nong.length > 400) return; REN.nong(key, fn); };

  // ---------- 2) dải khung: dựng từng khung trong hàng nóng ----------
  const daiKey = (ten, m, bien) => 'dai|' + ten + '|' + m + '|' + (bien || '');
  const daiCo = new Map(); // ten|bien → các cỡ m đã dựng (cỡ gần nhất làm hình tạm)
  const ghiCo = (ten, bien, m) => { const k = ten + '|' + (bien || ''); let s = daiCo.get(k); if (!s) daiCo.set(k, s = new Set()); s.add(m); };
  // dải gốc dùng tạm: gắn nf/fm/gap đúng như REN.khung tự suy ra (không đổi hình), REN.khung0 cắt khung trực tiếp từ dải gốc
  const daiGoc = (a) => { if (!a || !a.width) return null; if (a.nf == null) { const n = Math.max(1, Math.round(a.width / a.height)); a.nf = n; a.fm = a.width / n; a.gap = 0; } return a; };
  REN.nongDai = function (ten, px, bien) {
    const k = this.s * this.dpr, m = Math.max(2, Math.round(px * k)), key = daiKey(ten, m, bien);
    if (this.cache[key] || this._cacheCu[key]) return;
    const st = { c: null, i: 0, n: 0, lan: 0 };
    const buoc = () => {
      if (this.cache[key] || this._cacheCu[key]) return;
      if (Math.round(px * this.s * this.dpr) !== m) return; // đổi cỡ màn giữa chừng: bỏ (donCache đã xoá)
      const a = this.img(ten);
      if (!a) { if (++st.lan < 240 && !(this.thieu && this.thieu.has(ten))) this._nong.push(buoc); return; } // ảnh chưa về: chờ
      if (bien === 'trang') {
        const b = this.cGet(daiKey(ten, m, ''));
        if (!b) { if (++st.lan < 240) { this.nongDai(ten, px, ''); this._nong.push(buoc); } return; }
        this.cSet(key, this.toBien(b, 'trang')); ghiCo(ten, bien, m); return;
      }
      if (!st.c) {
        st.n = Math.max(1, Math.round(a.width / a.height));
        const c = document.createElement('canvas'); c.width = st.n * (m + 2); c.height = m; c.nf = st.n; c.fm = m; c.gap = 2; st.c = c; st.x = this.c2d(c);
      }
      const fw = a.width / st.n, i = st.i++;
      vnGoc.call(this, st.x, a, Math.round(i * fw), 0, Math.round(fw), a.height, i * (m + 2), 0, m, m);
      if (st.i < st.n) this._nong.unshift(buoc); // khung kế tiếp: ngay việc sau (cùng khung nếu còn ngân sách)
      else { this.cSet(key, st.c); ghiCo(ten, bien, m); }
    };
    xep(key + '|n', buoc);
  };
  const cdGoc = REN.coDai;
  REN.coDai = function (ten, px, bien) {
    const k = this.s * this.dpr, m = Math.max(2, Math.round(px * k)), key = daiKey(ten, m, bien);
    const c = this.cGet(key); if (c) return c;
    if (!trongTran()) { const r = cdGoc.apply(this, arguments); if (r) ghiCo(ten, bien, m); return r; }
    // giữa trận: không dựng một lèo — xếp dựng từng khung, trả hình tạm (cỡ gần nhất đã có / dải gốc / chưa có chớp trắng)
    NS.thongKe.hoan++;
    this.nongDai(ten, px, bien);
    const s = daiCo.get(ten + '|' + (bien || ''));
    if (s) { let best = -1; for (const q of s) if (best < 0 || Math.abs(q - m) < Math.abs(best - m)) best = q; const c2 = best > 0 && this.cGet(daiKey(ten, best, bien)); if (c2) return c2; }
    if (bien) return null;
    return daiGoc(this.img(ten));
  };

  // ảnh thu nhỏ 1 cỡ (REN.co): quá ngân sách khung → vẽ tạm từ ảnh gốc (người gọi luôn vẽ theo cỡ logic tự tính) + xếp dựng
  const coGoc = REN.co;
  REN.co = function (ten, px, bien) {
    if (!this.hetNgan()) return coGoc.apply(this, arguments);
    const k = this.s * this.dpr, n = Math.max(2, Math.round(px * k)), key = ten + '|' + n + '|' + (bien || '');
    const c = this.cGet(key); if (c) return c;
    NS.thongKe.hoan++;
    xep('co|' + key, () => coGoc.call(this, ten, px, bien));
    if (bien === 'trang' || bien === 'den') return null;
    return this.img(ten);
  };
  // chuỗi mip: quá ngân sách → dùng tầng lớn hơn đã có (GPU thu thêm 1 bậc), tầng thiếu dựng trong hàng nóng
  const mipGoc = REN.mip;
  REN.mip = function (a, can) {
    if (!a || !(can > 0) || !this.hetNgan()) return mipGoc.apply(this, arguments);
    const ch = a._mip || (a._mip = [a]);
    let i = 0;
    for (;;) {
      const c = ch[i], d = Math.min(c.width, c.height);
      if (d / 2 < can || d < 8) return c;
      if (!ch[i + 1]) { NS.thongKe.hoan++; xep(null, () => mipGoc.call(this, a, can)); return c; }
      i++;
    }
  };
  // khoảnh khắc đặc biệt: khung chưa thu nhỏ + quá ngân sách → vẽ thẳng từ dải (SIG.k đã hỗ trợ khi khung() trả null)
  if (typeof SIG !== 'undefined' && SIG.khung) {
    const skGoc = SIG.khung;
    SIG.khung = function (ten, a, m, i, ctx, w, h) {
      if (!REN.hetNgan()) return skGoc.apply(this, arguments);
      const tf = ctx.getTransform(), kk = Math.hypot(tf.a, tf.b), dw = w * kk;
      if (dw >= m[1] * 0.92 && h * kk >= m[2] * 0.92) return null;
      const q = Math.min(m[1], Math.max(4, Math.round(Math.pow(2, Math.ceil(Math.log2(dw) * 8) / 8))));
      const c = REN.cGet('sig|' + ten + '|' + i + '|' + q); if (c) return c;
      NS.thongKe.hoan++;
      const M = ctx.getTransform(); xep('sig|' + ten + '|' + i + '|' + q, () => { const x = REN.ctxNong(); x.setTransform(M); skGoc.call(SIG, ten, a, m, i, x, w, h); });
      return null;
    };
  }

  // khoảnh khắc đặc biệt (chỉ là HÌNH, không phải luật): > 3 cái bắt đầu cùng 1 khung → cái thứ 4+ lùi 60 ms mỗi cái (≤ 0,3 s)
  // → không dồn mọi dải lớn + thu nhỏ khung vào 1 khung hình khi nhiều ụ đỏ/vàng kích hoạt cùng lúc
  if (typeof SIG !== 'undefined' && SIG.them && SIG.cap) {
    const themGoc = SIG.them, capGoc = SIG.cap;
    SIG._hoan = [];
    SIG.them = function () {
      const m = themGoc.apply(this, arguments);
      if (this._kh !== REN.t) { this._kh = REN.t; this._nKh = 0; }
      if (++this._nKh > 3 && trongTran()) { const i = this.ds.indexOf(m); if (i >= 0) { this.ds.splice(i, 1); m._cho = Math.min(0.3, (this._nKh - 3) * 0.06); this._hoan.push(m); } }
      return m;
    };
    SIG.cap = function (dt) {
      if (!G.ban.length) this._hoan.length = 0;
      for (let i = this._hoan.length - 1; i >= 0; i--) { const m = this._hoan[i]; m._cho -= dt || 0; if (m._cho <= 0) { this._hoan.splice(i, 1); if (this.ds.length > 24) this.ds.shift(); this.ds.push(m); } }
      return capGoc.apply(this, arguments);
    };
  }

  // ảnh tô màu (FXU.mau: vòng/vệt PNG tô theo màu ụ, mỗi màu dựng 1 canvas cỡ gốc): quá ngân sách → khung này bỏ qua, dựng trong hàng nóng
  if (typeof FXU !== 'undefined' && FXU.mau) {
    const mauGoc = FXU.mau;
    FXU.mau = function (ten, mau) {
      if (this._mau[ten + mau]) return this._mau[ten + mau];
      if (REN.hetNgan()) { NS.thongKe.hoan++; xep('mau|' + ten + mau, () => mauGoc.call(FXU, ten, mau)); return null; }
      const t0 = now(); try { return mauGoc.apply(this, arguments); } finally { REN._xay += now() - t0; }
    };
  }
  // chữ số sát thương: dựng sẵn 0–9 cho 2 kiểu hay gặp nhất (thường / chí mạng) ngay đầu trận
  NS.nongSo = function () { for (const [m, px] of [['#E9E8E2', 12], ['#F7D65B', 24]]) xep('so|' + m + px + '|' + REN.s * REN.dpr, () => REN.chuSo && REN.chuSo('0123456789', m, px)); };

  // âm thanh (tổng hợp WebAudio: mỗi tiếng dựng 5–20 nút, 0,2–1,2 ms): nhiều skill cùng khung → mọi tiếng dồn 1 khung (~6 ms).
  // Mỗi khung chỉ dựng tiếng tới khi tốn 2,5 ms; phần còn lại phát ở khung sau (trễ ≤ vài chục ms, tai không nhận ra); quá 0,25 s thì bỏ.
  // Tiếng giống nhau đã có giới hạn giọng/tần suất riêng (sound.js LIM) — không đổi.
  if (typeof SND !== 'undefined' && Array.isArray(SND.danhSach)) {
    const hang = []; let khung = -1, tonKhung = 0;
    const phat = (f, a) => { const t0 = now(); try { f.apply(SND, a); } catch (e) { } tonKhung += now() - t0; };
    NS.amThanh = () => { // gọi đầu mỗi khung vẽ
      khung = REN.t; tonKhung = 0; const h = now();
      while (hang.length && tonKhung < 2.5) { const [f, a, t] = hang.shift(); if (h - t < 250) phat(f, a); }
    };
    for (const k of SND.danhSach) {
      const f = SND[k]; if (typeof f !== 'function') continue;
      SND[k] = function () {
        if (!trongTran()) return f.apply(SND, arguments);
        if (khung !== REN.t) { khung = REN.t; tonKhung = 0; }
        if (tonKhung >= 2.5) { if (hang.length < 40) hang.push([f, arguments, now()]); return; }
        phat(f, arguments);
      };
    }
  }

  // ---------- 3a) ảnh tải lười giữa trận: chỉ dùng khi đã GIẢI MÃ xong (không giải mã đồng bộ ở lần vẽ đầu) ----------
  const taiGoc = REN.taiAnh;
  REN.taiAnh = function (ten) {
    const a = taiGoc.apply(this, arguments);
    if (a && a.decode && !a._cv) {
      a._chuaGiai = true;
      // giải mã xong giữa trận → chép sang canvas trong hàng nóng luôn (không đợi lần vẽ đầu = đúng lúc ra chiêu)
      const xong = () => { a._chuaGiai = false; if (trongTran() || (G.ban && G.ban.length)) xep('cp|' + ten, () => REN.img(ten)); };
      // decode() treo / lỗi (Safari iOS: ảnh lớn, đầu trận nhiều ảnh cùng giải mã, trang vừa quay lại từ nền):
      // TRƯỚC 09/11: quá 1,5 s thì chép thẳng ảnh CHƯA giải mã → Safari vẽ RỖNG → canvas trong suốt bị giữ VĨNH VIỄN (REN.anh._cv;
      // TAI.giao/sanSang thấy _cv là coi như xong) → ụ CHƯA TỪNG CHƠI vào trận chỉ còn ngôi sao (Fusion Archive, người dùng 09/11).
      // NAY: không bao giờ chép ảnh chưa giải mã — treo quá 6 s / decode lỗi → bỏ Image đó, TẢI LẠI bản mới (?r=) rồi giải mã lại;
      // sau 3 lần vẫn hỏng mới chép thẳng (cách cũ) để không kẹt null mãi (08/11: "chơi tướng mới phải thoát ra vào lại").
      a.addEventListener('load', () => {
        a._tVe = now(); let x = false;
        const ok = () => { if (!x) { x = true; xong(); } };
        const hong = () => {
          if (x) return; x = true;
          if (REN.anh[ten] !== a) return;
          if ((a._lan || 0) >= 3) { xong(); return; }
          a.onload = a.onerror = null; a._chuaGiai = false; clearTimeout(a._hen);
          REN.taiAnh(ten, (a._lan || 0) + 1); // Image mới (_chuaGiai = true) thay chỗ — REN.img trả null tới khi bản mới giải mã xong
        };
        try { a.decode().then(ok, hong); } catch (e) { ok(); }
        setTimeout(hong, 6000);
      }, { once: true });
      a.addEventListener('error', () => { a._chuaGiai = false; }, { once: true });
    }
    return a;
  };
  const imgGoc = REN.img;
  REN.img = function (ten) {
    const a = this.anh[ten];
    if (!a || a._cv) return imgGoc.apply(this, arguments);
    if (a._chuaGiai) return null; // chưa giải mã xong: KHÔNG chép (Safari chép ảnh chưa giải mã = canvas rỗng giữ vĩnh viễn)
    a._chuaGiai = false;
    if (!(a.complete && a.naturalWidth && !a._loi)) return imgGoc.apply(this, arguments);
    // lần đầu dùng: chép ảnh đã giải mã sang canvas (ảnh lớn: vài ms) — tính vào ngân sách khung; hết ngân sách → chép trong hàng nóng
    if (this.hetNgan()) { NS.thongKe.hoan++; xep('cp|' + ten, () => imgGoc.call(this, ten)); return null; }
    const t0 = now(); try { return imgGoc.apply(this, arguments); } finally { this._xay += now() - t0; }
  };

  // ---------- 3b) làm nóng trùm sắp tới ----------
  const K8b = typeof K8 !== 'undefined' ? K8 : {};
  NS.nongTrum = function (id, p) {
    if (!id || typeof TRUM === 'undefined' || !TRUM[id]) return true;
    const E = { id, trum: id, d: { co: 86, trum: true, to: true }, p: p || 0 };
    let du = true;
    const t0 = REN.tenQuai ? REN.tenQuai(E) : 'trum_' + id; if (!REN.img(t0)) du = false;
    const kc = t0.endsWith('_8') ? K8b[E.d.anh || E.id] || 1 : 1, co = 86 * kc;
    const ds = [t0];
    for (const v of ['s', 'b']) { const t = REN.tenHuong && REN.tenHuong(t0, v); if (t) ds.push(t); }
    const tl = REN.tenTrai && REN.tenTrai(t0); if (tl) ds.push(tl);
    const td = REN.tenDanh && REN.tenDanh(E); if (td) ds.push(td);
    else if (typeof TRUM_ATK !== 'undefined' && TRUM_ATK.has(id)) { REN.img('trum_' + id + '_atk_16'); du = false; }
    for (const t of ds) REN.nongDai(t, t === td && typeof ATK_K !== 'undefined' ? co * ATK_K : co);
    REN.nongDai(t0, co, 'trang');
    if (typeof TRUM_THU_TU !== 'undefined' && TRUM_THU_TU.includes(id)) REN.nongDai('trum_' + id, 86); // dải 4 khung lúc tung chiêu
    if (id === 'twin_core' && typeof TRM !== 'undefined') REN.nongDai(t0, Math.round(86 * TRM.CON_CO) * kc);
    if (id === 'janus') xep('xam|de_chung', () => REN.banXam && REN.banXam('de_chung')); // hoá đá ụ: bản xám của đế (getImageData cả ảnh)
    if (id === 'hive') for (const t of ['quai_bay_8']) REN.nongDai(t, 50 * (K8b.bay || 1)); // drone
    if (id === 'freezer' && typeof BANGFX !== 'undefined') {
      BANGFX.napTruoc();
      const B = G.ban[0], S = B ? Math.min(B.cw, B.ch) : 40;
      REN.nongDai(BANGFX.ANH.vong, BANGFX.CO_VONG); REN.nongDai(BANGFX.ANH.song, BANGFX.CO_SONG); REN.nongDai(BANGFX.ANH.khoi, S * BANGFX.KHOI_K);
    }
    if (typeof TRUM_FX !== 'undefined' && TRUM_FX.has(id)) { const f = REN.img('fx_trum_' + id); if (f) xep('mip|fx_trum_' + id, () => REN.mip(f, 100 * REN.s * REN.dpr)); else du = false; }
    return du;
  };
  // mỗi 0,5 s: trùm của wave hiện tại (chưa ra) + wave kế → làm nóng (mỗi trùm 1 lần / trận; ảnh chưa tải → thử lại lần sau)
  NS.kiemTra = function () {
    if (!trongTran() || typeof trumCuaWave !== 'function' || typeof coTrum !== 'function') return;
    const t = now(); if (t - NS._tKt < 500) return; NS._tKt = t;
    const ds = new Set();
    for (const w of [G.wave, G.wave + 1]) if (w > 0 && coTrum(w)) for (let p = 0; p < (G.che === 'coop' ? 2 : 1); p++) ds.add(trumCuaWave(w, p));
    for (const h of G.hang || []) if (h.trum) ds.add(h.trum);
    if (typeof TRUM_DBG !== 'undefined' && TRUM_DBG) ds.add(TRUM_DBG);
    for (const id of ds) { const k = id + '|' + REN.s * REN.dpr; if (NS.daNong.has(k)) continue; if (NS.nongTrum(id)) NS.daNong.add(k); }
    // 3c) ảnh tình huống (REN.LUOI): tải + giải mã nền 3 s sau khi trận chạy (1 luồng, nhường khi cuộn/tải trận)
    if (!NS._tLuoi) { NS._tLuoi = t; NS.nongSo(); }
    else if (NS._tLuoi > 0 && t - NS._tLuoi > 3000 && typeof TAI !== 'undefined' && TAI.ds && TAI.nap) {
      NS._tLuoi = -1;
      const d = TAI.ds(); let co = 0;
      for (const ten of NS.dsLuoi()) { const a = REN.anh[ten]; if (a && (a._cv || (a.complete && a.naturalWidth))) continue; d.anh(ten); co++; }
      const ds = d.ket();
      if (co) TAI.nap(ds, null, 1, true).then(() => { for (const it of ds) if (it.ten) xep('cp|' + it.ten, () => REN.img(it.ten)); }, () => { });
    }
  };
  NS.dsLuoi = function () {
    const ds = new Set();
    if (typeof BVX !== 'undefined' && BVX.LOAI) for (const k in BVX.LOAI) if (BVX.LOAI[k].anh) ds.add(BVX.LOAI[k].anh);
    for (const t of ['fx_dien', 'fx_laser_trung', 'fx_khoi_doc', 'fx_bang_vo', 'fx_link', 'fx_awaken', 'pandora_dia', 'hu_hoden', 'hu_khoa', 'hu_luoicua', 'hu_trangkhuyet', 'hu_vongbang', 'hu_cauvong', 'hu_min', 'hu_manhguong']) ds.add(t);
    return [...ds].filter(t => REN.LUOI.test(t));
  };
  NS._imgGoc = imgGoc; NS._mipGoc = mipGoc; NS._xep = xep; NS._trongTran = trongTran;
  const ve2 = REN.ve;
  REN.ve = function () { const r = ve2.apply(this, arguments); try { NS.kiemTra(); } catch (e) { } return r; };
  // trận mới: làm nóng lại từ đầu
  if (typeof UI !== 'undefined' && UI.vaoTran) {
    const vt = UI.vaoTran;
    UI.vaoTran = function () { NS.daNong.clear(); NS._tLuoi = 0; if (NS.am) NS.am.moi(); return vt.apply(this, arguments); };
  }
})();

// ---------- 5) LÀM NÓNG LÚC RẢNH: tờ ảnh lớn của trận được chép + đẩy lên GPU TRƯỚC khi hiệu ứng cần (tuvan/giat-ghep) ----------
// Đo (tools/thap-do-giat-ghep.js, iPhone 13 + CPU ×4): khung 40–85 ms ngay sau ghép đặc biệt / Mad Crown / chỉ huy / chiêu đỏ lần đầu =
// lần ĐẦU vẽ một tờ ảnh lớn (p2_overlord 4608×288, fx_evo_xit 4096×256, fxb_toc / fxb_khien 1248×312, quai_khong_lo_8 2552×319,
// sig_*…): REN.img chép ảnh sang canvas (giải mã 3–22 ms) + lần vẽ đầu TỪ canvas mới (trình duyệt đẩy cả tờ lên GPU, 20–50 ms).
// Chữa (không đổi luật / hình): sau khi trận chạy, mỗi khung còn dư thời gian làm 1 việc nhỏ: chép 1 tờ của trận (UI.dsTran: ụ
// trong bộ, hiệu ứng v2/P2, hào quang buff, khoảnh khắc đặc biệt, chỉ huy) rồi vẽ thử nó (thu nhỏ chất lượng cao) vào canvas 2×2 điểm →
// tờ đã lên GPU + có sẵn mipmap → lần vẽ thật sau đó không còn chi phí lần đầu. Quái: chỉ loại sẽ ra trong ≤ 2 wave tới (+ dải thu nhỏ đúng cỡ qua hàng nóng). Trùm: mục 3b sẵn có.
// requestIdleCallback nếu có (Android/Chrome); Safari iOS không có → chạy ngay sau khung vẽ khi khung trước nhẹ (< 12 ms).
(() => {
  if (typeof REN === 'undefined' || typeof NS === 'undefined') return;
  const now = () => performance.now();
  const AM = NS.am = { ds: [], quai: new Set(), _co: new Set(), _trum: new Set(), thongKe: { lam: 0, ms: 0, max: 0, nang: [] }, _t: 0, _cho: false, _khung: 0, BAT: true };
  let mini = null;
  const veThu = (c) => {
    if (!mini) { const m = document.createElement('canvas'); m.width = m.height = 2; mini = m.getContext('2d'); }
    // thu nhỏ CHẤT LƯỢNG CAO như lúc vẽ thật (REN.min) → trình duyệt dựng luôn chuỗi mipmap của tờ (chi phí lần đầu lớn nhất)
    mini.imageSmoothingEnabled = true; mini.imageSmoothingQuality = 'high'; mini.globalAlpha = 0.01; mini.drawImage(c, 0, 0, 2, 2);
  };
  const laTrum = (t) => /^(fx_)?trum_/.test(t);
  const laQuai = (t) => /^quai_/.test(t);
  // trận mới (UI.vaoTran): danh sách lập lại khi trận đã chạy (G.ban có bàn + ảnh đã tải)
  AM.moi = function () { this.ds.length = 0; this.quai.clear(); this._lap = false; this._t0 = now(); this._co = new Set(); this._trum = new Set(); };
  const themTen = (t) => { if (!AM._co.has(t)) { AM._co.add(t); AM.ds.push({ t, lan: 0 }); } };
  AM.lap = function () {
    this._lap = true; this.ds.length = 0; this._co = new Set(); this._trum = new Set();
    let ds = []; try { ds = UI.dsTran(G.ban); } catch (e) { }
    if (typeof NS.dsLuoi === 'function') ds = ds.concat(NS.dsLuoi()); // ảnh tình huống (đã tải nền ở mục 3c)
    // tờ P2 (vfxp2.js) của ụ trong bộ bài: Overlord / Black Hole / Rewind / Halo / Genesis / Ember / Copycat…
    if (typeof P2 !== 'undefined' && P2.TO) for (const B of G.ban) for (const id of B.deck || []) if (P2.TO[id]) ds.push(P2.TO[id]);
    if (typeof P3 !== 'undefined' && P3.M) for (const B of G.ban) for (const id of B.deck || []) if (P3.M['p3_' + id]) ds.push('p3_' + id); // tờ P3 (vfxp3.js) khi đã có
    for (const t of ds) if (!laTrum(t) && !laQuai(t)) themTen(t);
  };
  // trùm của wave này / wave sau (cùng cách mục 3b): mọi tờ trum_<id>* / fx_trum_<id> đã tải
  AM.themTrum = function () {
    if (typeof trumCuaWave !== 'function' || typeof coTrum !== 'function') return;
    for (const w of [G.wave, G.wave + 1]) if (w > 0 && coTrum(w)) for (let p = 0; p < (G.che === 'coop' ? 2 : 1); p++) {
      const id = trumCuaWave(w, p); if (!id || this._trum.has(id)) continue;
      this._trum.add(id);
      for (const t in REN.anh) if (t.startsWith('trum_' + id) || t === 'fx_trum_' + id) this.ds.unshift({ t, lan: 0 });
    }
  };
  // ảnh tải lười giữa trận (REN.taiAnh): cũng làm nóng khi tải xong
  const taiGoc = REN.taiAnh;
  REN.taiAnh = function (ten) { const a = taiGoc.apply(this, arguments); try { if (AM._lap && NS._trongTran() && !laTrum(ten) && !laQuai(ten)) themTen(ten); } catch (e) { } return a; };
  // quái sẽ ra trong ≤ 2 wave tới (data.js taoWave: bay ≥ w2, khong_lo ≥ w4, tach ≥ w6, bay_bang ≥ w8, que_tach ≥ w30)
  const MOC_QUAI = { bo: 1, bay: 2, khong_lo: 4, tach: 6, nho: 6, bay_bang: 8, que_tach: 30 };
  AM.themQuai = function () {
    if (typeof QUAI === 'undefined') return;
    const w = (G.wave || 1) + 2;
    for (const id in QUAI) {
      if (this.quai.has(id) || !((MOC_QUAI[id] || 1) <= w)) continue;
      this.quai.add(id);
      const E = { id, d: QUAI[id] }, t0 = REN.tenQuai ? REN.tenQuai(E) : 'quai_' + (QUAI[id].anh || id);
      const kc = t0.endsWith('_8') && typeof K8 !== 'undefined' ? K8[QUAI[id].anh || id] || 1 : 1, co = QUAI[id].co * kc;
      const ten = [t0]; for (const v of ['s', 'b']) { const t = REN.tenHuong && REN.tenHuong(t0, v); if (t) ten.push(t); }
      const tl = REN.tenTrai && REN.tenTrai(t0); if (tl) ten.push(tl);
      for (const t of ten) this.ds.unshift({ t, co, lan: 0 }); // quái lên trước (sắp ra thật)
    }
  };
  // 1 việc: chép tờ sang canvas + vẽ thử; quái: thêm dải thu nhỏ đúng cỡ (hàng nóng tự rải theo khung)
  AM.mot = function () {
    const it = this.ds.shift(); if (!it) return false;
    const t = it.t, a = REN.anh[t];
    if (!a || a._loi) return true; // không thuộc trận này / lỗi tải: bỏ
    if ((!a._cv && !(a.complete && a.naturalWidth)) || a._chuaGiai) { if (++it.lan < 40) this.ds.push(it); return true; } // chưa tải xong: để sau
    if (!it.b && a._cv && a._cv._am && !it.co) return true; // đã làm nóng
    const W0 = a._cv ? a._cv.width : a.naturalWidth, H0 = a._cv ? a._cv.height : a.naturalHeight;
    if (!it.b && !it.co && W0 * H0 < 65536 && W0 < 1024) return true; // ảnh nhỏ: lần đầu rẻ (< 1 ms) — không chép trước (giữ bộ nhớ như cũ)
    // chia 1 tờ thành nhiều việc nhỏ ở các khung khác nhau (mỗi việc 1 phần chi phí lần đầu): 0 chép sang canvas · 1 vẽ thử
    // (lên GPU + mipmap) · 2–3 tầng mip ½ và ¼ (tờ hiệu ứng) · 4 dải thu nhỏ của quái (hàng nóng tự rải tiếp)
    const t0 = now(); it.b = it.b || 0;
    try {
      if (it.b === 0) { if (!a._cv) NS._imgGoc.call(REN, t); it.b = 1; this.ds.unshift(it); }
      else {
        const c = a._cv || NS._imgGoc.call(REN, t);
        const laMip = c && /^(p2_|p3_|fx_|sig_)/.test(t) && c.height >= 96 && c.width / c.height >= 3;
        if (it.b === 1) { if (c && c.width && !c._am) veThu(c); if (c) c._am = 1; it.b = laMip ? 2 : 4; }
        // tờ hiệu ứng vẽ qua chuỗi mip (REN.khungMuot / hieuung.khung: P2, fx_*, sig_*): 2 tầng đầu dựng từ TỜ LỚN là phần đắt
        // nhất (20–60 ms ×4 CPU, đo p2_copycat / p2_halo) → dựng sẵn; tầng nhỏ hơn dựng từ tầng ¼ (rẻ) khi cần
        else if (it.b === 2) { NS._mipGoc.call(REN, c, Math.ceil(c.height / 2)); it.b = 3; }
        else if (it.b === 3) { NS._mipGoc.call(REN, c, Math.ceil(c.height / 4)); it.b = 4; }
        else if (it.b === 4) { if (it.co) { REN.nongDai(t, it.co); REN.nongDai(t, it.co, 'trang'); } it.b = 5; }
        if (it.b < 5 && c) this.ds.unshift(it);
      }
    } catch (e) { }
    const ms = now() - t0; this.thongKe.lam++; this.thongKe.ms += ms; if (ms > this.thongKe.max) this.thongKe.max = ms; if (ms > 20 && this.thongKe.nang.length < 30) this.thongKe.nang.push(t + ' ' + Math.round(ms));
    return true;
  };
  AM.chay = function (han) {
    if (!this.BAT || !NS._trongTran() || G.ketThuc || G.dung) return;
    if (!this._lap) { if (typeof TAI !== 'undefined' && TAI.doi) return; this.lap(); }
    const t = now(); if (t - this._t > 500) { this._t = t; this.themQuai(); this.themTrum(); }
    if (!this.ds.length) return;
    const t0 = now();
    do { if (!this.mot()) break; } while (this.ds.length && now() - t0 < han);
  };
  AM.RIC = typeof requestIdleCallback === 'function';
  let tKhung = 0;
  // gọi sau mỗi khung vẽ (dv = ms khung này)
  AM.sauKhung = function (dv) {
    if (this.ds.length || !this._lap || now() - this._t > 500) {
      if (this.RIC) { if (!this._cho) { this._cho = true; requestIdleCallback((d) => { this._cho = false; if (d.timeRemaining() > 3) this.chay(Math.max(2, d.timeRemaining() - 2)); }, { timeout: 400 }); } }
      else if (dv < 12 && tKhung < 12) this.chay(2); // Safari: khung này + khung trước nhẹ → 1 việc (≤ 2 ms thêm; tờ lớn: chỉ 1 lần mỗi trận)
    }
    tKhung = dv;
  };
  const veGoc = REN.ve;
  REN.ve = function () {
    const a = now(); const r = veGoc.apply(this, arguments);
    try { AM.sauKhung(now() - a); } catch (e) { }
    return r;
  };
  // đổi cỡ màn / dpr: dải thu nhỏ quái phải dựng lại cỡ mới
  addEventListener('resize', () => { AM.quai.clear(); });
})();

// ---------- 4) băng chữ DOM: cut-in chỉ huy, băng báo trùm, băng WAVE (bổ sung 06/11 — đo tools/thap-do-giat-goi.js) ----------
// Mỗi lần hiện, fitText thu cỡ chữ từng bước 0,5 px và MỖI bước bắt trình duyệt dựng lại bố cục (tới ~40 lần):
// cut-in Hero 25–32 ms ngay khung dùng chỉ huy, báo trùm 3–13 ms (băng UI + băng hudtop đo 2 lần). Ở đây (chỉ trong các băng này):
// tìm nhị phân (~6 lần đo, cùng kết quả) + nhớ theo chữ/khung/cỡ màn (lần sau chỉ 1 lần đo kiểm); số → 0 ('WAVE 23' dùng chung 'WAVE 47');
// đo trước lúc vào trận (băng ẩn, mỗi khung 1 việc): cut-in chỉ huy của người chơi + tên mọi trùm.
(() => {
  if (typeof UI === 'undefined') return;
  const NHO = new Map();
  function fitNhanh(el, max, min) {
    if (!el) return;
    const tran = () => el.scrollWidth > el.clientWidth + 0.5 || el.scrollHeight > el.clientHeight + 0.5;
    const key = (el.id || el.className || el.tagName) + '|' + (el.parentNode && el.parentNode.id) + '|' + el.parentNode.className + '|' + el.textContent.replace(/[0-9]/g, '0') + '|' + innerWidth + 'x' + innerHeight + '|' + max + '|' + min;
    const v = NHO.get(key);
    if (v) { el.style.fontSize = v + 'px'; if (v <= min || !tran()) return; }
    el.style.fontSize = max + 'px';
    let f = max;
    if (tran()) {
      el.style.fontSize = min + 'px';
      if (tran()) f = min;
      else { let lo = Math.round(min * 2), hi = Math.round(max * 2) - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; el.style.fontSize = (m / 2) + 'px'; if (tran()) hi = m - 1; else lo = m; } f = lo / 2; }
      el.style.fontSize = f + 'px';
    }
    if (el.clientWidth > 0 && (!document.fonts || document.fonts.status === 'loaded')) { if (NHO.size > 400) NHO.clear(); NHO.set(key, f); }
  }
  const boc = (o, k) => { const f = o && o[k]; if (typeof f !== 'function') return; o[k] = function () { const cu = window.fitText; window.fitText = fitNhanh; try { return f.apply(this, arguments); } finally { window.fitText = cu; } }; };
  for (const k of ['cutIn', 'canhBaoTrum', 'bangWave']) boc(UI, k);
  if (typeof HT !== 'undefined') boc(HT, 'cbHien');
  // đo trước (băng ẩn — visibility:hidden vẫn có bố cục)
  const viec = [];
  const doCutIn = () => {
    const B = G.ban[0], c = document.getElementById('cutin'); if (!B || !B.mv || B.ai || !c || !c.hidden || !UI.cutIn) return;
    c.style.visibility = 'hidden';
    try { UI.cutIn(B.mv.id, B); } catch (e) { }
    clearTimeout(UI._ci); clearTimeout(UI._ci2); c.hidden = true; c.classList.remove('chay', 'ra'); c.style.visibility = '';
  };
  const doTrum = (id) => () => {
    const b = document.getElementById('canh-bao'), fb = b && b.querySelector('b'); if (!fb || !b.hidden || !TRUM[id]) return;
    const cu = fb.textContent, cl = b.className;
    b.style.visibility = 'hidden'; b.hidden = false;
    try { fb.textContent = TRUM[id].ten; fitNhanh(fb, 26, 14); b.classList.add('cb-den'); fitNhanh(fb, 28, 13); } catch (e) { }
    fb.textContent = cu; b.className = cl; fb.style.fontSize = ''; b.hidden = true; b.style.visibility = '';
  };
  const chay = () => {
    if (!viec.length) return;
    const san = typeof G !== 'undefined' && G.ban.length && !(typeof TAI !== 'undefined' && (TAI.cho || TAI.doi));
    if (san) { const f = viec.shift(); try { f(); } catch (e) { } }
    if (viec.length) requestAnimationFrame(chay);
  };
  if (typeof TAI !== 'undefined' && TAI.tran) {
    const tr = TAI.tran;
    TAI.tran = function () {
      const r = tr.apply(this, arguments);
      if (!viec.length) { viec.push(doCutIn); for (const id of (typeof TRUM_POOL !== 'undefined' ? TRUM_POOL : Object.keys(TRUM))) viec.push(doTrum(id)); requestAnimationFrame(chay); }
      return r;
    };
  }
})();
