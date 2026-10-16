// BƯỚC 2 — PHIÊN 0: NỀN CHUNG "SỰ KIỆN" + NGÀY + BẢN LƯU (docs/ke-hoach/buoc-2/KE-HOACH.md mục 2, mục 4 "Phiên 0", Phụ lục kỹ thuật)
// Ba hệ của Bước 2 (Sổ yêu quái — Phiên A, Việc hôm nay — Phiên B, Thành tựu — Phiên C) chỉ NGHE sự kiện ở đây, không phải sửa combat.js / stage.js.
// Mọi chỗ móc đều BỌC TỪ BÊN NGOÀI hàm có sẵn (gọi hàm cũ trước, rồi mới phát sự kiện; lỗi của người nghe không bao giờ làm hỏng trận).
//
// Nạp sau js/stage.js, trước js/village_scene.js (index.html). Cờ quay lui ?sukien=0 (G.SU_KIEN_BAT = false): không bọc gì, không phát gì,
// không đụng bản lưu (dữ liệu so / nv / tt có sẵn giữ nguyên), các thẻ mới ở Ông Từ / Anh Mõ tự ẩn (js/village.js).
//
// API (chi tiết + ví dụ: docs/ke-hoach/buoc-2/bao-cao-phien-0.md)
//   G.suKien.on(ten, fn) → hàm gỡ        G.suKien.off(ten, fn)        G.suKien.phat(ten, duLieu)        G.suKien.bat()
//   Tên sự kiện (G.suKien.TEN): vaoAi, vaoPhong, gapQuai, haQuai, phanUng, lonNe, dacBiet, doiVk, chuong, moRuong, thuThach, hetAi, nangCap
//   G.ngay.homNay() → { key:'YYYY-MM-DD', thu:0..6 (0 = CN), d }   G.ngay.dauTuan(key?) → 'YYYY-MM-DD' (thứ Hai)   G.ngay.thuTuan(key?) → 0..6 (0 = T2)
//   G.ngay.cong(key, n) · G.ngay.sau(a, b) (a > b) · G.ngay.conLaiGiay() · G.ngay.bam(chuoi) → số 32 bit · G.ngay.ngauNhien(hat) → hàm 0..1 có định
//   Bản lưu: bọc G.fixSave tạo / sửa G.save.so, .nv, .tt (rỗng, an toàn; sai kiểu thì dựng lại riêng phần đó, KHÔNG đụng phần cũ).
//   KHÔNG thêm vào G.newSave (cờ một lần "bu" của Phiên A / C sẽ bị vòng "thiếu gì thì bù" chép sang bản cũ — xem ghi chú ở js/engine.js).
(function () {
  'use strict';
  const G = window.G;
  if (!G) return;
  if (G.SU_KIEN_BAT === undefined) { let tat = false; try { tat = /[?&]sukien=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; } G.SU_KIEN_BAT = !tat; }
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const obj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  const ngayHop = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

  // ---------- ngày (dùng chung với ải ngày: cùng giờ máy, đổi lúc 0 giờ) ----------
  const keyCua = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const tuKey = (k) => { const a = String(k).split('-').map(Number); return new Date(a[0], a[1] - 1, a[2], 12); }; // 12 giờ trưa: đổi giờ mùa hè không lệch ngày
  const N = (G.ngay = {});
  N.key = keyCua;
  N.homNay = function () {
    if (G.aiNgay && G.aiNgay.homNay) { try { return G.aiNgay.homNay(); } catch (e) { /* tính lại bên dưới */ } }
    const d = new Date(); return { key: keyCua(d), thu: d.getDay(), d };
  };
  N.cong = (k, n) => { const d = tuKey(k); d.setDate(d.getDate() + (n | 0)); return keyCua(d); };
  N.thuTuan = (k) => (tuKey(k || N.homNay().key).getDay() + 6) % 7; // 0 = thứ Hai … 6 = Chủ nhật
  N.dauTuan = (k) => { k = k || N.homNay().key; return N.cong(k, -N.thuTuan(k)); };
  N.sau = (a, b) => ngayHop(a) && (!ngayHop(b) || a > b); // chống chỉnh lùi giờ máy: chỉ tiến khi ngày mới > ngày lớn nhất đã thấy
  N.conLaiGiay = function () {
    if (G.aiNgay && G.aiNgay.conLaiGiay) return G.aiNgay.conLaiGiay();
    const d = new Date(), m = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1); return Math.max(0, Math.round((m - d) / 1000));
  };
  N.bam = function (s) { s = String(s); let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; };
  N.ngauNhien = function (hat) { // mulberry32: cùng hạt giống ra cùng dãy (không đụng G.rnd của trận)
    let a = (typeof hat === 'number' ? hat : N.bam(hat)) >>> 0;
    return function () { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };

  // ---------- bus sự kiện ----------
  const TEN = ['vaoAi', 'vaoPhong', 'gapQuai', 'haQuai', 'phanUng', 'lonNe', 'dacBiet', 'doiVk', 'chuong', 'moRuong', 'thuThach', 'hetAi', 'nangCap'];
  const nghe = {};
  const K = (G.suKien = { TEN, goc: {} });
  K.bat = () => G.SU_KIEN_BAT !== false;
  K.on = function (ten, fn) {
    if (typeof fn !== 'function') return () => {};
    (nghe[ten] || (nghe[ten] = [])).push(fn);
    return () => K.off(ten, fn);
  };
  K.off = function (ten, fn) { const a = nghe[ten]; if (!a) return; const i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); };
  K.phat = function (ten, d) {
    if (!K.bat()) return;
    const a = nghe[ten];
    if (!a || !a.length) return;
    for (const fn of a.slice()) {
      try { fn(d || {}); } catch (e) { console.error('Linh Khí: lỗi khi nghe sự kiện "' + ten + '" (bỏ qua)', e); }
    }
  };
  const phat = K.phat;
  // Chấm đỏ của người làng (js/village_scene.js checkNews gọi): Ông Từ ('tu') / Anh Mõ ('mo') có thẻ mới nào báo "có thưởng chờ nhận".
  // Thẻ tự khai báo bằng hàm .cham(sv) gắn trên hàm vẽ của thẻ (G.villageApi.PANELS.so.cham = …), xem js/village.js THE_NGUOI.
  K.chamNguoi = function (k, sv) {
    if (!K.bat()) return false;
    const VA = G.villageApi, ds = VA && VA.THE_NGUOI && VA.THE_NGUOI[k];
    if (!ds) return false;
    for (const t of ds) {
      const fn = VA.PANELS && VA.PANELS[t[0]];
      try { if (VA.theMo(t[0]) && fn && typeof fn.cham === 'function' && fn.cham(sv || G.save)) return true; } catch (e) { /* thẻ lỗi: coi như không có chấm */ }
    }
    return false;
  };

  // ---------- bản lưu: so / nv / tt ----------
  const so01 = (v) => (v ? 1 : 0);
  const nguyen = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.floor(num(v, lo))));
  const MAX_KHOA = 300; // chặn bản lưu phình to vì dữ liệu lạ (giới hạn 400 KB của mây)
  const catKhoa = (o) => { const ks = Object.keys(o); for (let i = MAX_KHOA; i < ks.length; i++) delete o[ks[i]]; return o; };
  const banMoi = (v) => typeof v.v === 'number' && v.v > 1; // định dạng mới hơn bản này: để nguyên, không sửa lùi
  function suaSo(sv) {
    let o = sv.so;
    if (!obj(o)) o = sv.so = {};
    if (banMoi(o)) return;
    o.v = 1;
    if (!obj(o.q)) o.q = {};
    for (const m of Object.keys(o.q)) {
      const t = o.q[m];
      if (!obj(t)) { delete o.q[m]; continue; }
      t.g = so01(t.g); t.h = nguyen(t.h, 0, 1e9); t.k = so01(t.k); t.n = nguyen(t.n, 0, 7);
    }
    catKhoa(o.q);
    if (!obj(o.vung)) o.vung = {};
    for (const r of Object.keys(o.vung)) { if (!/^\d{1,2}$/.test(r)) delete o.vung[r]; else o.vung[r] = nguyen(o.vung[r], 0, 3); }
    if (o.bu === 1 || o.bu === true) o.bu = 1; else delete o.bu;
  }
  function suaNv(sv) {
    let o = sv.nv;
    if (!obj(o)) o = sv.nv = {};
    if (banMoi(o)) return;
    o.v = 1;
    o.hat = nguyen(o.hat, 0, 2147483647);
    if (!o.hat) o.hat = 1 + Math.floor(Math.random() * 2147483646); // hạt giống riêng của bản lưu: tạo MỘT lần, đi theo bản lưu lên mây
    if (!ngayHop(o.cuoi)) o.cuoi = '';
    const ds = Array.isArray(o.ds) ? o.ds : [];
    o.ds = ds.filter((v) => obj(v) && typeof v.m === 'string' && v.m).slice(0, 3).map((v) => {
      const x = v.x == null || typeof v.x === 'string' || (typeof v.x === 'number' && isFinite(v.x)) ? (v.x == null ? null : v.x) : null;
      const can = nguyen(v.can, 1, 1e6);
      return Object.assign(v, { m: v.m, x, can, d: nguyen(v.d, 0, can), nhan: so01(v.nhan) });
    });
    o.doi = so01(o.doi); o.ruong = so01(o.ruong); o.tuanNhan = so01(o.tuanNhan);
    if (typeof o.hom !== 'string') o.hom = '';
    if (!obj(o.tuan)) o.tuan = {};
    if (!ngayHop(o.tuan.ma)) o.tuan.ma = '';
    const ng = Array.isArray(o.tuan.ngay) ? o.tuan.ngay : [];
    o.tuan.ngay = ng.map((v) => Math.floor(num(v, -1))).filter((v, i, a) => v >= 0 && v <= 6 && a.indexOf(v) === i).sort((a, b) => a - b);
    o.demRuong = nguyen(o.demRuong, 0, 1e6);
  }
  function suaTt(sv) {
    let o = sv.tt;
    if (!obj(o)) o = sv.tt = {};
    if (banMoi(o)) return;
    o.v = 1;
    if (!obj(o.dem)) o.dem = {};
    for (const k of Object.keys(o.dem)) { const v = num(o.dem[k], -1); if (v < 0) delete o.dem[k]; else o.dem[k] = Math.min(1e12, Math.floor(v)); }
    catKhoa(o.dem);
    for (const k of ['xong', 'nhan']) {
      if (!obj(o[k])) o[k] = {};
      for (const m of Object.keys(o[k])) { if (o[k][m]) o[k][m] = 1; else delete o[k][m]; }
      catKhoa(o[k]);
    }
    if (typeof o.dh !== 'string' || !o.dh) delete o.dh;
    if (o.bu === 1 || o.bu === true) o.bu = 1; else delete o.bu;
  }
  K.suaBanLuu = function (sv) { // từng phần riêng: một phần lỗi thì dựng lại phần đó, các phần khác vẫn sửa
    if (!obj(sv)) return sv;
    for (const [k, f] of [['so', suaSo], ['nv', suaNv], ['tt', suaTt]]) {
      try { f(sv); } catch (e) { console.error('Linh Khí: lỗi khi sửa phần "' + k + '" của bản lưu (dựng lại phần này)', e); try { sv[k] = {}; f(sv); } catch (e2) { delete sv[k]; } }
    }
    return sv;
  };

  if (!K.bat()) return; // ?sukien=0: không bọc hàm nào, không đụng bản lưu

  if (G.fixSave && !G.fixSave.suKienBoc) {
    const goc = G.fixSave;
    G.fixSave = function () {
      const r = goc.apply(this, arguments);
      try { if (obj(r)) K.suaBanLuu(r); } catch (e) { console.error('Linh Khí: lỗi khi sửa phần Bước 2 của bản lưu (bỏ qua)', e); }
      return r;
    };
    G.fixSave.suKienBoc = true;
  }
  // Bản lưu đang dùng (đã nạp trước tệp này? thường là chưa — main.js mới gọi G.loadSave) cũng có đủ ba phần
  try { if (obj(G.save)) K.suaBanLuu(G.save); } catch (e) { /* bỏ qua */ }

  // ---------- móc vào trận ----------
  const run = () => (G.getRun ? G.getRun() : null);
  const loaiTrum = (e) => (e.isBoss ? (e.kind === 'mini' ? 'nho' : 'vung') : null);
  const heVk = (e) => { // hiệu ứng hệ ĐANG DÍNH do vũ khí gây (bỏ phần do chưởng: e.st.ch), như G.kill tính linh khí
    const st = e.st || {}, chs = st.ch || {};
    return { fire: st.fire > 0 && !chs.fire, poison: st.poisonN > 0 && !chs.poison, ice: (st.iceN > 0 || st.frozen > 0) && !chs.ice };
  };
  const thongTin = (e) => ({ e, ma: e.art || e.name || '', ten: e.name || '', vai: e.role || '', tinhAnh: e.role === 'elite', trum: loaiTrum(e) });

  // hạ quái (combat.js G.kill): bỏ quái phụ do trùm gọi ra (e.add) và ảo ảnh (e.illusion)
  if (G.kill && !G.kill.suKienBoc) {
    const goc = G.kill;
    K.goc.kill = goc;
    G.kill = function (e, o) {
      if (!e || e.dead) return goc.apply(this, arguments);
      let truoc = null;
      try { if (!e.illusion && !e.add) { const W = G.getWorld ? G.getWorld() : null, P = W && W.P; truoc = { he: heVk(e), w: (o && o.w) || (P && G.curW ? G.curW(P) : null), vung: W ? W.region : 0 }; } } catch (x) { truoc = null; }
      const r = goc.apply(this, arguments);
      if (truoc && e.dead) {
        const S = run();
        phat('haQuai', Object.assign(thongTin(e), {
          el: (o && o.el) || null, // hệ của đòn kết liễu
          ch: !!(o && o.ch), // bị chưởng kết liễu
          he: truoc.he, // { fire, poison, ice }: đang dính hiệu ứng hệ do vũ khí
          w: truoc.w, wType: truoc.w ? truoc.w.type : null, vung: truoc.vung,
          S, aiNgay: !!(S && S.aiNgay), diff: S ? S.diff | 0 : 0,
        }));
      }
      return r;
    };
    G.kill.suKienBoc = true;
  }

  // phản ứng hệ: Nổ lan, Lây độc (G.moves.onKill), Băng vỡ (G.moves.onHit) — chỉ vũ khí Thức tỉnh (đặc trưng 2)
  const M = G.moves;
  if (M && M.onKill && !M.onKill.suKienBoc) {
    const goc = M.onKill;
    M.onKill = function (e, o, w) {
      let loai = null;
      try {
        const W = G.getWorld ? G.getWorld() : null, P = W && W.P, HE = G.HE;
        if (w && e && !e.illusion && P && M.heOf && HE) {
          const h = M.heOf(P, w), chs = (e.st && e.st.ch) || {};
          if (h && h.lv >= HE.f2) {
            if (h.el === 'fire' && e.st.fire > 0 && !chs.fire) loai = 'noLan';
            else if (h.el === 'poison' && e.st.poisonN > 0 && !chs.poison) loai = 'layDoc';
          }
        }
      } catch (x) { loai = null; }
      const r = goc.apply(this, arguments);
      if (loai) phat('phanUng', { loai, e, w, S: run() });
      return r;
    };
    M.onKill.suKienBoc = true;
  }
  if (M && M.onHit && !M.onHit.suKienBoc) {
    const goc = M.onHit;
    M.onHit = function (e, d, el, o) {
      const truoc = !!(e && e.mvShat);
      const r = goc.apply(this, arguments);
      if (e && !truoc && e.mvShat) phat('phanUng', { loai: 'bangVo', e, w: o && o.w, S: run() });
      return r;
    };
    M.onHit.suKienBoc = true;
  }

  // bắn chưởng (G.chuong.fire: mọi đường bắn trong js/chuong.js gọi CH.fire)
  if (G.chuong && G.chuong.fire && !G.chuong.fire.suKienBoc) {
    const goc = G.chuong.fire;
    G.chuong.fire = function (P) {
      const r = goc.apply(this, arguments);
      if (r) phat('chuong', { P, cay: P && P.ch ? P.ch.cay : null, S: run() });
      return r;
    };
    G.chuong.fire.suKienBoc = true;
  }

  // vào ải (G.startStage: Lái Đò, Chơi lại, Ải tiếp theo, ải ngày, khôi phục lượt dở của js/luu_luot.js)
  if (G.startStage && !G.startStage.suKienBoc) {
    const goc = G.startStage;
    G.startStage = function (r, i, diff, o) {
      const kq = goc.apply(this, arguments);
      const S = run();
      if (S) { theo.S = null; phat('vaoAi', { S, r: S.r, i: S.i, diff: S.diff | 0, aiNgay: S.aiNgay || null, tut: !!S.tut }); }
      return kq;
    };
    G.startStage.suKienBoc = true;
  }

  // hết ải thường: G.onStageEnd do js/bang_vang.js gán SAU tệp này → giữ hàm được gán (Bảng vàng) ở "trong", stage.js luôn gọi qua lớp bọc.
  // Lớp bọc gọi hàm cũ TRƯỚC (kỷ lục, dòng báo của Bảng vàng), rồi phát 'hetAi'.
  function duLieuHet(S, R, win) {
    const note = (R && R.starNote) || [];
    return {
      S, R, win: !!win, r: S.r, i: S.i, diff: S.diff | 0, aiNgay: S.aiNgay || null, tut: !!S.tut, quit: !!S.quit,
      stars: R ? R.stars | 0 : 0, starNote: note, khongBinh: !S.usedPotion, khacChe: !!note[2],
      kills: S.loot ? S.loot.kills | 0 : 0, trumVung: S.i === 4 && !S.aiNgay,
    };
  }
  {
    let trong = Object.prototype.hasOwnProperty.call(G, 'onStageEnd') ? G.onStageEnd : null;
    const boc = function (S, R) {
      let kq;
      if (typeof trong === 'function') kq = trong.apply(this, arguments);
      try { if (S) phat('hetAi', duLieuHet(S, R, R && R.win)); } catch (e) { console.error('Linh Khí: lỗi khi phát sự kiện hết ải (bỏ qua)', e); }
      return kq;
    };
    boc.suKienBoc = true;
    try {
      Object.defineProperty(G, 'onStageEnd', { configurable: true, enumerable: true, get: () => boc, set: (f) => { trong = f === boc ? trong : f; } });
      Object.defineProperty(K.goc, 'onStageEnd', { enumerable: true, get: () => trong }); // cho kiểm thử: hàm Bảng vàng đang nằm trong
    } catch (e) { /* không đặt được thì thôi phát hetAi cho ải thường */ }
  }
  // hết ải ngày: stage.js settle trả sớm, KHÔNG gọi G.onStageEnd → bọc G.aiNgay.thuong (gọi đúng một lần mỗi lượt)
  if (G.aiNgay && G.aiNgay.thuong && !G.aiNgay.thuong.suKienBoc) {
    const goc = G.aiNgay.thuong;
    G.aiNgay.thuong = function (S, R, win) {
      const an = S && S.aiNgay, truoc = an && win ? G.aiNgay.luot(an.loai) : 0;
      const kq = goc.apply(this, arguments);
      try {
        if (S) {
          const d = duLieuHet(S, R, win);
          d.tinhLuot = !!(an && win && truoc > 0 && G.aiNgay.luot(an.loai) < truoc); // thắng có tính lượt (có thưởng)
          phat('hetAi', d);
        }
      } catch (e) { console.error('Linh Khí: lỗi khi phát sự kiện hết ải ngày (bỏ qua)', e); }
      return kq;
    };
    G.aiNgay.thuong.suKienBoc = true;
  }

  // ---------- đọc thay đổi mỗi khung (G.tick): gặp quái, lộn né, đặc biệt, đổi vũ khí, mở rương, thắng thử thách, vào phòng ----------
  // Chỉ so vài con số, không vẽ, không ghi bản lưu.
  const theo = { S: null, W: null, P: null, dodge: 0, spec: 0, cur: -1, ch: null, chW: null };
  let daGap = new WeakSet(), daRuong = new WeakSet();
  function docKhung() {
    const S = run();
    if (!S || G.scene !== G.StageScene || !S.W || !S.P) { theo.S = null; return; }
    const W = S.W, P = S.P;
    if (theo.S !== S) { Object.assign(theo, { S, W: null, P: null, ch: null, chW: null }); daGap = new WeakSet(); daRuong = new WeakSet(); }
    if (theo.W !== W) { theo.W = W; phat('vaoPhong', { S, W, id: S.idx, loai: W.type }); }
    if (theo.P !== P) { theo.P = P; theo.dodge = num(P.dodgeT, 0); theo.spec = num(P.specCd, 0); theo.cur = P.cur | 0; }
    // gặp quái: quái có mặt trong phòng bé đang đứng (kể cả đợt mọc sau)
    for (const e of W.ents) {
      if (!e || e.dead || e.add || e.illusion || daGap.has(e)) continue;
      daGap.add(e);
      phat('gapQuai', Object.assign(thongTin(e), { vung: W.region, S }));
    }
    const dg = num(P.dodgeT, 0), sp = num(P.specCd, 0), cur = P.cur | 0;
    if (dg > 0 && theo.dodge <= 0) phat('lonNe', { P, S });
    if (sp > theo.spec + 0.01) phat('dacBiet', { P, S });
    if (cur !== theo.cur) phat('doiVk', { P, S, tu: theo.cur, sang: cur });
    theo.dodge = dg; theo.spec = sp; theo.cur = cur;
    // rương báu: vật 'chest' vừa được dùng (đã chọn phần thưởng)
    for (const pr of W.props) if (pr && pr.type === 'chest' && pr.used && !daRuong.has(pr)) { daRuong.add(pr); phat('moRuong', { S, prop: pr }); }
    // phòng thử thách: S.challenge vừa về null trong khi phòng đã dọn và đồng hồ còn > 0 (stage.js clearRoom cho thưởng)
    if (S.challenge) { theo.ch = S.challenge; theo.chW = W; }
    else if (theo.ch) {
      const c = theo.ch, w0 = theo.chW;
      theo.ch = null; theo.chW = null;
      if (w0 === W && W.cleared && W.type === 'challenge' && c.t > 0) phat('thuThach', { S, W, conGiay: c.t });
    }
  }
  if (G.tick && !G.tick.suKienBoc) {
    const goc = G.tick;
    G.tick = function () {
      const r = goc.apply(this, arguments);
      try { docKhung(); } catch (e) { /* đọc thay đổi lỗi: bỏ qua, không làm đứng game */ }
      return r;
    };
    G.tick.suKienBoc = true;
  }

  // ---------- nâng cấp ở làng: bọc G.persist, so dấu vân tay các thứ nâng được (mài, cấp vũ khí, bậc ép, lò, điểm kỹ năng, chưởng, bộ) ----------
  function vanTay(sv) {
    const v = { mai: 0, vk: 0, ep: 0, lo: num(sv.forge, 0), diem: 0, chuong: 0, bo: 0, da: num(sv.daBac, 0), luyen: 0 };
    for (const w of sv.weapons || []) {
      if (!w) continue;
      v.mai += num(w.sharpen, 0);
      v.luyen += num(w.luyen, 0); // Luyện (js/luyen.js)
      try { v.vk += G.wStage ? G.wStage(w) : 0; } catch (e) { /* bỏ qua */ }
      v.ep += G.epDo && G.epDo.bac ? G.epDo.bac(w) : 0;
    }
    for (const k in sv.heroes || {}) {
      const h = sv.heroes[k]; if (!h) continue;
      if (h.sk) v.diem += num(h.sk.atk, 0) + num(h.sk.def, 0) + num(h.sk.elem, 0);
      if (h.ch && h.ch.n) for (const id in h.ch.n) v.chuong += num(h.ch.n[id], 0);
    }
    if (obj(sv.boCap)) for (const k in sv.boCap) v.bo += num(sv.boCap[k], 0);
    return v;
  }
  let vtCu = null, svCu = null;
  if (G.persist && !G.persist.suKienBoc) {
    const goc = G.persist;
    G.persist = function () {
      try {
        const sv = G.save;
        if (G.scene === G.Village && obj(sv)) {
          const vt = vanTay(sv);
          if (vtCu && svCu === sv) {
            const loai = ['mai', 'vk', 'ep', 'lo', 'diem', 'chuong', 'bo', 'luyen'].filter((k) => vt[k] > vtCu[k]);
            if (!loai.length && vt.da < vtCu.da) loai.push('ep'); // ép hỏng / giữ bậc: không lên bậc nhưng đã tốn đá
            vtCu = vt;
            if (loai.length) phat('nangCap', { loai });
          } else { vtCu = vt; svCu = sv; }
        } else { vtCu = null; svCu = null; }
      } catch (e) { vtCu = null; }
      return goc.apply(this, arguments);
    };
    G.persist.suKienBoc = true;
  }
})();
