// TRANG ẢNH — ảnh lớn chia trang ≤ 2048 × 2048 (F4 ổn định 05/11, docs/review/ke-hoach-cai-thien/on-dinh-f4-chia-anh/bao-cao.md)
// Vì sao: iPhone Safari giải mã cả tấm ảnh khi vẽ dù chỉ cắt một ô; tấm thân Rowan 1152 × 12192 = 54 MiB, bản to 1856 × 4060 = 29 MiB,
//   trùm 2988 × 2520 = 29 MiB… Ảnh cạnh > 2048 còn là rủi ro tự đóng tab trên iOS.
// Cách làm: game/build.py (bản web ảnh rời) cắt LẠI KHÔNG MẤT ĐIỂM ẢNH nào (chỉ chép nguyên ô khung) mỗi tấm có cạnh > 2048 thành các trang
//   ≤ 2048 × 2048; tấm thân Rowan / trang phục xếp ô theo NHÓM động tác (chung, kiếm, thương, búa, phi tiêu) để trang nào chỉ chứa ô của một
//   nhóm. Thông số "trang" ghi kèm ảnh: { w, h, cw, ch, cols, rows, p: [[rộng, cao, png, webp, byte, nhóm], …], o: [trang, x, y] mỗi ô }.
// Lúc chạy: đối tượng Image của hình (sp.img / z.img / …) GIỮ NGUYÊN (mọi chỗ vẽ không đổi) nhưng không có ảnh thật — mọi lệnh
//   drawImage(ảnh đó, …) được chuyển sang ô tương ứng ở trang đã giải mã (vá CanvasRenderingContext2D.prototype.drawImage, chỉ bật khi
//   có ảnh chia trang). Chỉ trang cần mới được tải + giải mã: nhóm "chung" + nhóm vũ khí đang mang (tấm thân), mọi trang (trùm, hiệu ứng).
//   Vẽ tới ô của trang chưa có → tải ngay trang đó (khung đó không vẽ, thường chỉ 1–3 khung lần đầu). Trang không vẽ tới trong
//   GIU_MS và đang quá ngân sách thì bỏ (LRU), cần lại thì giải mã lại (tệp đã trong bộ nhớ đệm trình duyệt).
// Quay lui: ?trangcu=1 (G.TRANG_CU) → tải nguyên tấm như trước (tệp nguyên tấm vẫn nằm trên máy chủ). Bản một tệp: không có "trang" → như cũ.
(function () {
  'use strict';
  const G = (window.G = window.G || {});
  if (G.TRANG_CU === undefined) { let cu = false; try { cu = typeof location !== 'undefined' && /[?&]trangcu=1(&|$)/.test(location.search || ''); } catch (e) { cu = false; } G.TRANG_CU = cu; }
  const MAP = new WeakMap(), DS = [];
  const TA = (G.trangAnh = { ds: DS });
  const coCanvas = typeof CanvasRenderingContext2D !== 'undefined' && CanvasRenderingContext2D.prototype && typeof Image !== 'undefined';
  TA.bat = () => !G.TRANG_CU && coCanvas;
  TA.la = (img) => !!(img && MAP.get(img));
  const bayGio = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
  let pxGiu = 0, soMiss = 0, soBo = 0, soTai = 0, soLoi = 0;
  const GIU_MS = 12000; // trang vẽ trong 12 giây gần nhất: không bỏ
  const LUI = [1000, 3000, 9000];
  // ---------- hàng tải trang ----------
  const hang = []; let dang = 0;
  const MAX_DANG = 2;
  function xep(pg, uu) {
    if (pg.tt === 2 || pg.tt === 1) return;
    if (pg.uu == null || uu < pg.uu) pg.uu = uu;
    if (pg.tt === 9) return; // đã trong hàng
    pg.tt = 9; hang.push(pg); bom();
  }
  function bom() {
    while (dang < MAX_DANG && hang.length) {
      hang.sort((a, b) => a.uu - b.uu);
      const pg = hang.shift();
      if (pg.tt !== 9) continue;
      tai(pg);
    }
  }
  function webpDuoc() { try { const R = G.spriteCustom && G.spriteCustom.roi; return !!(R && R.webp === true); } catch (e) { return false; } }
  function tai(pg) {
    pg.tt = 1; dang++; soTai++;
    const img = new Image();
    const url = (pg.webp && webpDuoc() && !pg.boWebp ? pg.webp : pg.png) + (pg.lan ? '?lan=' + pg.lan : '');
    let xong = false;
    const het = (ok) => {
      if (xong) return; xong = true; dang--;
      if (ok && pg.can !== false) {
        pg.img = img; pg.tt = 2; pg.t = bayGio(); pxGiu += pg.w * pg.h;
        const r = pg.r; r.san++; baoCho(r);
      } else if (ok) { // bị huỷ (bỏ cả tấm) trong lúc tải
        try { img.removeAttribute('src'); } catch (e) { /* bỏ qua */ }
        pg.tt = 0; pg.can = true;
      } else {
        soLoi++;
        try { img.removeAttribute('src'); } catch (e) { /* bỏ qua */ }
        if (url.indexOf('.webp') > 0) { pg.boWebp = true; pg.tt = 0; xep(pg, pg.uu); }
        else if ((pg.lan | 0) < LUI.length) { const ms = LUI[pg.lan | 0]; pg.lan = (pg.lan | 0) + 1; pg.tt = 0; setTimeout(() => xep(pg, pg.uu), ms); }
        else { pg.tt = 3; pg.tHong = Date.now(); baoCho(pg.r); }
      }
      bom();
    };
    img.onload = () => {
      if (typeof img.decode === 'function') img.decode().then(() => het(true), () => het(!!(img.complete && img.naturalWidth)));
      else het(true);
    };
    img.onerror = () => het(false);
    setTimeout(() => { if (!xong) { if (img.complete && img.naturalWidth) het(true); else het(false); } }, 45000);
    img.src = url;
  }
  function baoCho(r) { for (let i = r.cho.length - 1; i >= 0; i--) { let xong = true; try { xong = r.cho[i](); } catch (e) { xong = true; } if (xong) r.cho.splice(i, 1); } }
  // ---------- gắn một ảnh chia trang ----------
  // img: đối tượng Image của hình (giữ nguyên); sp: thông số "trang"; ma: mã hình (để ghi lỗi / thống kê)
  TA.gan = function (img, sp, ma, kieu) {
    if (!TA.bat() || !img || !sp || !Array.isArray(sp.p) || !Array.isArray(sp.o)) return null;
    const r = { ma, img, w: sp.w | 0, h: sp.h | 0, cw: sp.cw | 0, ch: sp.ch | 0, cols: sp.cols | 0, rows: sp.rows | 0, o: sp.o, san: 0, cho: [], p: [] };
    if (!(r.w > 0 && r.h > 0 && r.cw > 0 && r.ch > 0)) return null;
    sp.p.forEach((q, i) => r.p.push({ r, i, w: q[0] | 0, h: q[1] | 0, png: q[2], webp: q[3] || null, co: q[4] | 0, nhom: q[5] || '', img: null, tt: 0, t: 0, uu: null }));
    r.nhom = r.p.some((pg) => pg.nhom); r.kieu = kieu === 'tran' ? 'tran' : 'lang'; // tấm thân Zed (trang theo nhóm động tác): được bỏ từng trang; tấm khác chỉ bỏ cả tấm (bộ tải)
    MAP.set(img, r); DS.push(r);
    const dinh = (k, v) => { try { Object.defineProperty(img, k, { configurable: true, get: () => v }); } catch (e) { /* bỏ qua */ } };
    dinh('naturalWidth', r.w); dinh('naturalHeight', r.h); dinh('width', r.w); dinh('height', r.h); dinh('complete', true);
    va();
    return r;
  };
  TA.cua = (img) => MAP.get(img) || null;
  // Tải các trang thuộc nhóm (null: mọi trang) → fn(true) khi đủ, fn(false) nếu có trang hỏng hẳn.
  TA.tai = function (r, nhom, fn, uu) {
    const can = r.p.filter((pg) => !nhom || !pg.nhom || nhom.indexOf(pg.nhom) >= 0);
    let con = 0, loi = false, da = false;
    const kiem = () => {
      if (da) return true;
      let thieu = 0;
      for (const pg of can) { if (pg.tt === 3) loi = true; else if (pg.tt !== 2) thieu++; }
      if (loi) { da = true; if (fn) fn(false); return true; }
      if (!thieu) { da = true; if (fn) fn(true); return true; }
      return false;
    };
    for (const pg of can) if (pg.tt !== 2) { con++; if (pg.tt === 3) { pg.tt = 0; pg.lan = 0; } pg.can = true; xep(pg, uu == null ? 5 : uu); }
    if (!con) { if (fn) fn(true); return; }
    r.cho.push(kiem);
  };
  // Trang chứa điểm (sx, sy) đã có chưa (chưa: xếp tải ngay)
  TA.co = function (img, sx, sy) {
    const r = MAP.get(img);
    if (!r) return true;
    const pg = trangTai(r, sx, sy);
    if (!pg) return false;
    if (pg.tt === 2) { pg.t = bayGio(); return true; }
    xep(pg, 0); return false;
  };
  function trangTai(r, x, y) {
    const c = Math.floor(x / r.cw), h = Math.floor(y / r.ch);
    if (c < 0 || h < 0 || c >= r.cols || h >= r.rows) return null;
    const k = (h * r.cols + c) * 3, i = r.o[k];
    return i >= 0 ? r.p[i] : null;
  }
  // Mọi ô trong vùng (sx, sy, sw, sh) đã có chưa (thiếu: xếp tải ngay). Dùng trước khi dựng hình nhớ (canvas) từ ảnh chia trang.
  TA.du = function (img, sx, sy, sw, sh) {
    const r = MAP.get(img);
    if (!r) return true;
    let ok = true;
    const c0 = Math.max(0, Math.floor(sx / r.cw)), c1 = Math.min(r.cols - 1, Math.floor((sx + sw - 1e-6) / r.cw));
    const h0 = Math.max(0, Math.floor(sy / r.ch)), h1 = Math.min(r.rows - 1, Math.floor((sy + sh - 1e-6) / r.ch));
    for (let h = h0; h <= h1; h++) for (let c = c0; c <= c1; c++) {
      const i = r.o[(h * r.cols + c) * 3];
      if (i < 0) continue;
      const pg = r.p[i];
      if (pg.tt !== 2) { ok = false; xep(pg, 0); } else pg.t = bayGio();
    }
    return ok;
  };
  // Nhóm động tác cần cho tấm thân Zed: 'chung' + nhóm của vũ khí đang mang (trong ải: P.weapons; ngoài ải: 2 vũ khí mang theo save.carry)
  const VK_NHOM = { sword: 'kiem', spear: 'thuong', hammer: 'bua', bow: 'phitieu' };
  // kieu 'lang' (tấm thường: làng, màn chào, thử đồ — chỉ đứng / đi / chạy): 'chung' + 'di-<vũ khí mang theo>'; 'tran' (bản to trong trận):
  // mọi nhóm. Nhóm chưa tải mà vẽ tới thì tải ngay (vd. đòn đánh vẽ ở tấm thường).
  TA.nhomCan = function (kieu) {
    const ds = ['chung'], tran = kieu === 'tran';
    // trong trận: MỌI nhóm (đổi vũ khí / ra đòn lần đầu không được thiếu khung) — bản to Rowan ~30 MiB
    if (tran) return ['chung', 'danh', 'khac'].concat(...Object.keys(VK_NHOM).map((k) => [VK_NHOM[k], 'di-' + VK_NHOM[k]]));
    const them = (w) => { const g = w && VK_NHOM[w.type]; if (!g) return; for (const x of tran ? [g, 'di-' + g] : ['di-' + g]) if (ds.indexOf(x) < 0) ds.push(x); };
    try {
      const run = G.getRun && G.getRun(), P = run && run.P;
      if (P && Array.isArray(P.weapons)) P.weapons.forEach(them);
      else { const sv = G.save; if (sv && Array.isArray(sv.carry) && G.weaponById) sv.carry.forEach((id) => them(G.weaponById(id))); }
    } catch (e) { /* bỏ qua */ }
    if (ds.length <= 2) them({ type: 'sword' });
    return ds;
  };
  // Tải trước: mỗi 1,5 giây, tấm thân Zed đang dùng (có trang đã giải mã) → nạp các trang nhóm cần mà chưa có (đổi vũ khí, vào ải)
  function tuTaiTruoc() {
    if (!DS.length) return;
    const nhL = TA.nhomCan('lang'), nhT = TA.nhomCan('tran');
    for (const r of DS) {
      const nh = r.kieu === 'tran' ? nhT : nhL;
      if (!r.nhom || !r.san || bayGio() - (r.tVe || 0) > 5000) continue; // chỉ tấm vừa được vẽ (trong trận: bản to; ở làng: tấm thường)
      for (const pg of r.p) if (pg.tt === 0 && nh.indexOf(pg.nhom) >= 0) { pg.can = true; xep(pg, 3); }
    }
  }
  if (typeof setInterval === 'function' && coCanvas) setInterval(tuTaiTruoc, 1500);
  // Bỏ mọi trang của một tấm (bộ tải bỏ cả hình, hoặc tấm trang phục không mặc)
  TA.boHet = function (r) {
    if (!r) return 0;
    let n = 0;
    for (const pg of r.p) n += boTrang(pg) ? 1 : 0;
    return n;
  };
  function boTrang(pg) {
    if (pg.tt === 1) { pg.can = false; return false; }
    if (pg.tt === 9) { pg.tt = 0; const i = hang.indexOf(pg); if (i >= 0) hang.splice(i, 1); return false; }
    if (pg.tt !== 2) return false;
    try { pg.img.removeAttribute('src'); } catch (e) { /* bỏ qua */ }
    pg.img = null; pg.tt = 0; pxGiu -= pg.w * pg.h; pg.r.san--; soBo++;
    return true;
  }
  // Dọn: trang không vẽ trong GIU_MS (cũ nhất trước) tới khi tổng (byte, tính rộng × cao × 4) ≤ tran. Trả số trang bỏ.
  TA.don = function (tran, giuMs) {
    if (pxGiu * 4 <= tran) return 0;
    const t = bayGio(), giu = giuMs == null ? GIU_MS : giuMs, ds = [];
    const nhL = TA.nhomCan('lang'), nhT = TA.nhomCan('tran'), can = (pg) => (pg.r.kieu === 'tran' ? nhT : nhL).indexOf(pg.nhom) >= 0;
    for (const r of DS) if (r.nhom) for (const pg of r.p) if (pg.tt === 2 && t - pg.t > giu) ds.push(pg);
    const cu = (pg) => (t - (pg.r.tVe || 0) > 5000 ? 0 : 1); // tấm không còn được vẽ (vd. tấm thường khi đang trong trận) bỏ trước, rồi nhóm không cần
    ds.sort((a, b) => cu(a) - cu(b) || can(a) - can(b) || a.t - b.t);
    let n = 0;
    for (const pg of ds) { if (pxGiu * 4 <= tran) break; if (boTrang(pg)) n++; }
    return n;
  };
  TA.px = () => pxGiu;
  TA.thongKe = () => {
    const d = { so: DS.length, trang: 0, san: 0, dangTai: dang, cho: hang.length, mib: (pxGiu * 4) / 1048576, miss: soMiss, bo: soBo, tai: soTai, loi: soLoi, tam: [] };
    for (const r of DS) { d.trang += r.p.length; d.san += r.san; d.tam.push(r.ma + ' ' + r.san + '/' + r.p.length); }
    return d;
  };
  // ---------- vá drawImage ----------
  let daVa = false;
  function va() {
    if (daVa || !coCanvas) return;
    daVa = true;
    const P = CanvasRenderingContext2D.prototype, goc = P.drawImage;
    P.drawImage = function (img) {
      const r = img && typeof img === 'object' ? MAP.get(img) : undefined;
      if (r === undefined) return goc.apply(this, arguments);
      const n = arguments.length;
      let sx = 0, sy = 0, sw = r.w, sh = r.h, dx, dy, dw = r.w, dh = r.h;
      if (n >= 9) { sx = +arguments[1]; sy = +arguments[2]; sw = +arguments[3]; sh = +arguments[4]; dx = +arguments[5]; dy = +arguments[6]; dw = +arguments[7]; dh = +arguments[8]; }
      else if (n >= 5) { dx = +arguments[1]; dy = +arguments[2]; dw = +arguments[3]; dh = +arguments[4]; }
      else { dx = +arguments[1]; dy = +arguments[2]; }
      if (!(sw > 0 && sh > 0)) return undefined;
      const kx = dw / sw, ky = dh / sh, x1 = Math.min(sx + sw, r.w), y1 = Math.min(sy + sh, r.h), t = bayGio();
      r.tVe = t;
      const c0 = Math.max(0, Math.floor(sx / r.cw)), c1 = Math.min(r.cols - 1, Math.floor((x1 - 1e-6) / r.cw));
      const h0 = Math.max(0, Math.floor(sy / r.ch)), h1 = Math.min(r.rows - 1, Math.floor((y1 - 1e-6) / r.ch));
      for (let h = h0; h <= h1; h++) {
        const cy = h * r.ch, ay = Math.max(sy, cy), by = Math.min(y1, cy + r.ch);
        if (by <= ay) continue;
        for (let c = c0; c <= c1; c++) {
          const k = (h * r.cols + c) * 3, i = r.o[k];
          if (i < 0) continue;
          const cx = c * r.cw, ax = Math.max(sx, cx), bx = Math.min(x1, cx + r.cw);
          if (bx <= ax) continue;
          const pg = r.p[i];
          if (pg.tt !== 2) { soMiss++; xep(pg, 0); continue; }
          pg.t = t;
          goc.call(this, pg.img, r.o[k + 1] + (ax - cx), r.o[k + 2] + (ay - cy), bx - ax, by - ay, dx + (ax - sx) * kx, dy + (ay - sy) * ky, (bx - ax) * kx, (by - ay) * ky);
        }
      }
      return undefined;
    };
  }
})();
