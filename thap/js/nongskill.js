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
  REN.ve = function () { this._xay = 0; return veGoc.apply(this, arguments); };
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

  // ---------- 3a) ảnh tải lười giữa trận: chỉ dùng khi đã GIẢI MÃ xong (không giải mã đồng bộ ở lần vẽ đầu) ----------
  const taiGoc = REN.taiAnh;
  REN.taiAnh = function (ten) {
    const a = taiGoc.apply(this, arguments);
    if (a && a.decode && !a._cv) {
      a._chuaGiai = true;
      a.addEventListener('load', () => { a.decode().then(() => { a._chuaGiai = false; }, () => { a._chuaGiai = false; }); }, { once: true });
      a.addEventListener('error', () => { a._chuaGiai = false; }, { once: true });
    }
    return a;
  };
  const imgGoc = REN.img;
  REN.img = function (ten) {
    const a = this.anh[ten];
    if (!a || a._cv) return imgGoc.apply(this, arguments);
    if (a._chuaGiai) return null;
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
    for (const t of ds) REN.nongDai(t, co);
    REN.nongDai(t0, co, 'trang');
    if (typeof TRUM_THU_TU !== 'undefined' && TRUM_THU_TU.includes(id)) REN.nongDai('trum_' + id, 86); // dải 4 khung lúc tung chiêu
    if (id === 'twin_core' && typeof TRM !== 'undefined') REN.nongDai(t0, Math.round(86 * TRM.CON_CO) * kc);
    if (id === 'janus') xep('xam|de_chung', () => REN.banXam && REN.banXam('de_chung')); // hoá đá ụ: bản xám của đế (getImageData cả ảnh)
    if (id === 'hive') for (const t of ['quai_bay_8', 'quai_bay_side_8', 'quai_bay_back_8']) REN.nongDai(t, 50 * (K8b.bay || 1)); // drone
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
    if (!NS._tLuoi) NS._tLuoi = t;
    else if (NS._tLuoi > 0 && t - NS._tLuoi > 3000 && typeof TAI !== 'undefined' && TAI.ds && TAI.nap) {
      NS._tLuoi = -1;
      const d = TAI.ds(); let co = 0;
      for (const ten of NS.dsLuoi()) { const a = REN.anh[ten]; if (a && (a._cv || (a.complete && a.naturalWidth))) continue; d.anh(ten); co++; }
      if (co) TAI.nap(d.ket(), null, 1, true).catch(() => { });
    }
  };
  NS.dsLuoi = function () {
    const ds = new Set();
    if (typeof BVX !== 'undefined' && BVX.LOAI) for (const k in BVX.LOAI) if (BVX.LOAI[k].anh) ds.add(BVX.LOAI[k].anh);
    for (const t of ['fx_dien', 'fx_laser_trung', 'fx_khoi_doc', 'fx_bang_vo', 'fx_link', 'fx_awaken', 'pandora_dia', 'hu_hoden', 'hu_khoa', 'hu_luoicua', 'hu_trangkhuyet', 'hu_vongbang', 'hu_cauvong', 'hu_min', 'hu_manhguong']) ds.add(t);
    return [...ds].filter(t => REN.LUOI.test(t));
  };
  const ve2 = REN.ve;
  REN.ve = function () { const r = ve2.apply(this, arguments); try { NS.kiemTra(); } catch (e) { } return r; };
  // trận mới: làm nóng lại từ đầu
  if (typeof UI !== 'undefined' && UI.vaoTran) {
    const vt = UI.vaoTran;
    UI.vaoTran = function () { NS.daNong.clear(); NS._tLuoi = 0; return vt.apply(this, arguments); };
  }
})();
