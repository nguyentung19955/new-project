// TURRET MERGE — KINH TẾ NGOÀI TRẬN kiểu DCDW: VÀNG (có sẵn, thebai.js) + NGỌC (mới, chỉ kiếm bằng chơi — KHÔNG có nạp tiền).
//  · CỬA HÀNG: Daily Specials 6 ô (đổi lúc 0 giờ máy, hạt giống = ngày + mã người chơi) · 3 RƯƠNG (Thường = vàng, Vàng / Thần thoại = ngọc,
//    tỉ lệ công khai + bảo hiểm) · đổi ngọc → vàng.
//  · VÒNG QUAY: 1 lượt miễn phí/ngày + tối đa 5 lượt ngọc; ô JACKPOT (Huyền thoại; Cổ đại chỉ ở lượt ngọc, 0,3%).
//  · NHIỆM VỤ ngày (3/ngày + thưởng đủ 3) · ĐIỂM DANH 7 ngày · THÀNH TỰU 1 lần · SỰ KIỆN TUẦN (ụ Huyền thoại nổi bật, thang điểm).
//  · Cân bằng "phải cày" như DCDW (người dùng 06/11: đỏ + vàng phải cày): docs/demo-hop-tuong/tuvan/shop/KINH-TE.md.
//  · Lưu localStorage 'turret_kt' (ngọc nằm cùng vàng trong 'turret_the'); di chuyển bản cũ không xoá gì; chép lên hồ sơ Firebase
//    profiles/{uid}/kt khi đã đăng nhập (bản có bộ đếm lưu lớn hơn thắng, cờ đã nhận OR, cấp thẻ lấy lớn nhất → không nhận 2 lần).
//  · Mọi kết quả quay/mở rương TẤT ĐỊNH theo hạt giống (mã người chơi + bộ đếm) → tải lại trang không quay lại được.
'use strict';

const KTC = {
  // ---- Daily Specials: giá vàng MỖI bản sao + số bản mỗi ô ----
  spGia: { trang: 25, xanh: 80, tim: 500, vang: 12000, do: 60000 },
  spSo: { trang: [20, 40], xanh: [6, 12], tim: [2, 4], vang: [1, 1], do: [1, 1] },
  spDoNgay: 1 / 7,             // ô cuối là Cổ đại ~1 ngày/tuần, còn lại Huyền thoại
  spFree: [{ vang: 100 }, { ngoc: 5 }, { the: { bac: 'trang', n: 5 } }, { the: { bac: 'xanh', n: 2 } }],
  // ---- Rương: tỉ lệ % độ hiếm MỖI thẻ; bảo hiểm ----
  ruong: {
    thuong: { ten: 'NORMAL CHEST', gia: { vang: 2000 }, so: 6, tiLe: { trang: 62, xanh: 29, tim: 8.5, vang: 0.5, do: 0 } },
    vang: { ten: 'GOLD CHEST', gia: { ngoc: 500 }, so: 8, tiLe: { trang: 44, xanh: 36, tim: 16, vang: 3.8, do: 0.2 }, bao: { tim: 1 }, pityV: 10, pityD: 120 },
    than: { ten: 'MYTHIC CHEST', gia: { ngoc: 6000 }, so: 12, tiLe: { trang: 30, xanh: 38, tim: 24, vang: 7, do: 1 }, bao: { do: 1, vang: 2 } },
  },
  ruongBan: { trang: [4, 8], xanh: [2, 4], tim: [1, 2], vang: [1, 1], do: [1, 1] },
  doiVang: [{ ngoc: 100, vang: 1000 }, { ngoc: 500, vang: 5500 }, { ngoc: 1500, vang: 18000 }],
  // ---- Vòng quay 8 ô (trọng số; JACKPOT: miễn phí 0,5 = Huyền thoại · lượt ngọc 1,0 = 70% Huyền thoại / 30% Cổ đại) ----
  vq: [
    { r: { vang: 200 }, w: 30 }, { r: { the: { bac: 'trang', n: 10 } }, w: 16 }, { r: { ngoc: 10 }, w: 14 }, { r: { vang: 800 }, w: 14 },
    { r: { the: { bac: 'xanh', n: 4 } }, w: 12 }, { r: { ngoc: 40 }, w: 6 }, { r: { the: { bac: 'tim', n: 2 } }, w: 7.5 }, { r: { the: { bac: 'vang', n: 1 } }, w: 0.5, wTra: 1.0, jack: 1 },
  ],
  vqGia: 100, vqMax: 5,
  // ---- Nhiệm vụ ngày ----
  nv: [
    { id: 'thang1', ten: 'Win 1 battle', can: 1, k: 'thang', r: { vang: 300 } },
    { id: 'tran3', ten: 'Play 3 battles', can: 3, k: 'tran', r: { vang: 400 } },
    { id: 'ghep30', ten: 'Merge 30 times', can: 30, k: 'ghep', r: { ngoc: 10 } },
    { id: 'wave15', ten: 'Reach wave 15', can: 15, k: 'wave', max: 1, r: { ngoc: 10 } },
    { id: 'trieu50', ten: 'Summon 50 turrets', can: 50, k: 'trieu', r: { vang: 300 } },
    { id: 'coop1', ten: 'Play CO-OP or ONLINE', can: 1, k: 'coop', r: { ngoc: 15 } },
    { id: 'pvp1', ten: 'Play 1 PVP battle', can: 1, k: 'pvp', r: { ngoc: 15 } },
    { id: 'trum2', ten: 'Defeat 2 bosses', can: 2, k: 'trum', r: { ngoc: 15 } },
    { id: 'sao5', ten: 'Make 3 turrets of 5★+', can: 3, k: 'sao5', r: { vang: 400 } },
  ],
  nvBonus: { ngoc: 20 },
  // ---- Điểm danh 7 ngày (không cần liên tiếp; ngày 7 = Rương Vàng, KHÔNG bảo đảm Cổ đại) ----
  dn: [{ vang: 300 }, { ngoc: 10 }, { ruong: 'thuong' }, { ngoc: 20 }, { vang: 1000 }, { ngoc: 30 }, { ruong: 'vang' }],
  // ---- Thành tựu 1 lần (ngọc) ----
  tt: [
    { id: 'thang', ten: 'First victory', k: 'thang', can: 1, r: { ngoc: 20 } },
    { id: 'trum', ten: 'First boss kill', k: 'trum', can: 1, r: { ngoc: 30 } },
    { id: 'sao7', ten: 'First 7★ turret', k: 'sao7', can: 1, r: { ngoc: 50 } },
    { id: 'w30', ten: 'Reach wave 30', k: 'wave', can: 30, r: { ngoc: 50 } },
    { id: 'w50', ten: 'Reach wave 50', k: 'wave', can: 50, r: { ngoc: 100 } },
    { id: 'w70', ten: 'Reach wave 70', k: 'wave', can: 70, r: { ngoc: 200 } },
    { id: 'nang', ten: 'Level up a card', k: 'nang', can: 1, r: { ngoc: 20 } },
    { id: 'ruong', ten: 'Open a chest', k: 'ruong', can: 1, r: { ngoc: 20 } },
  ],
  // ---- CHỖ ĐỂ DÀNH cho bán hàng sau này (đang TRỐNG / ẨN — không có mã thanh toán): gói ngọc + hàng PREMIUM của thang sự kiện ----
  goiNgoc: [],          // vd. { id: 'gem_500', ngoc: 500, sku: 'com.turretmerge.gem500' } — thẻ "GEM PACKS" chỉ hiện khi mảng có phần tử
  skPremium: null,      // vd. [[100, { ruong: 'vang' }], …] — hàng premium của Event Pass, ẩn khi null
  // ---- Sự kiện tuần: điểm mỗi trận = wave + 10 nếu thắng + 5/trùm (tối đa 60) ----
  skMax: 60,
  sk: [
    [40, { vang: 500 }], [100, { the: { su: 1, n: 1 } }], [180, { ruong: 'thuong' }], [280, { ngoc: 30 }], [400, { the: { su: 1, n: 1 } }],
    [550, { ruong: 'vang' }], [750, { ngoc: 60 }], [1000, { the: { su: 1, n: 2 } }], [1300, { ruong: 'vang' }], [1700, { the: { bac: 'do', n: 1 } }],
  ],
};

const KT = {
  KEY: 'turret_kt', V: 1,
  s: null, tran: null,
  // ---------- tiện ích tất định ----------
  bam(str) { let h = 2166136261 >>> 0; str = String(str); for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; },
  rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; },
  bay: () => (KT._bay ? KT._bay() : new Date()), // thử nghiệm đặt giờ giả
  ngayCua(d) { return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); },
  // hôm nay (giờ máy); lùi đồng hồ không mở lại phần đã nhận (dùng ngày lớn nhất từng thấy)
  ngay() { const n = this.ngayCua(this.bay()), s = this.doc(); if (n > (s.ngayMax | 0)) { s.ngayMax = n; } return Math.max(n, s.ngayMax | 0); },
  soNgay(n) { const y = Math.floor(n / 10000), m = Math.floor(n / 100) % 100, d = n % 100; return Math.round(Date.UTC(y, m - 1, d) / 864e5); },
  tuan() { return Math.floor((this.soNgay(this.ngay()) + 3) / 7); }, // tuần bắt đầu thứ Hai
  conLai(tuan) { // ms tới 0 giờ hôm sau / thứ Hai tới
    const d = this.bay(), t = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    if (tuan) { const th = (d.getDay() + 6) % 7; t.setDate(t.getDate() + (6 - th)); }
    return Math.max(0, t - d);
  },
  dongHo(ms) { const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60, p = (v) => (v < 10 ? '0' : '') + v; return h >= 48 ? (typeof NN !== 'undefined' && NN.vi && NN.vi() ? Math.floor(h / 24) + 'n ' + (h % 24) + 'g' : Math.floor(h / 24) + 'd ' + (h % 24) + 'h') : p(h) + ':' + p(m) + ':' + p(x); },

  // ---------- lưu / di chuyển ----------
  moi() { return { v: this.V, pid: Math.random().toString(36).slice(2, 10), n: 0, ngayMax: 0, sp: {}, ru: { pv: 0, pd: 0, mo: 0 }, vq: {}, nv: {}, dn: { ngay: 0, so: 0 }, sk: {}, tt: {}, tk: { thang: 0, trum: 0, sao7: 0, wave: 0, nang: 0, ruong: 0 }, mvMo: {} }; }, // mvMo: chỉ huy đã mở bằng ngọc (08/11)
  doc() {
    if (this.s) return this.s;
    let s = null;
    try { s = JSON.parse(localStorage.getItem(this.KEY) || 'null'); } catch (e) { try { localStorage.setItem(this.KEY + '_hong', localStorage.getItem(this.KEY)); } catch (e2) { } }
    const m = this.moi();
    if (!s || typeof s !== 'object') {
      s = m;
      // bản cũ: kỷ lục wave + số trận thắng → mở thành tựu đã đạt (người chơi cũ nhận ngọc ngay, không mất gì)
      try { const b = JSON.parse(localStorage.getItem('turret_best') || '{}') || {}; for (const k in b) s.tk.wave = Math.max(s.tk.wave, (b[k] && b[k].wave) | 0); } catch (e) { }
      try { const h = JSON.parse(localStorage.getItem('tm_hoso') || 'null'); if (h) { s.tk.wave = Math.max(s.tk.wave, h.bestWave | 0); s.tk.thang = h.wins | 0; } } catch (e) { }
    }
    for (const k in m) if (s[k] === undefined || s[k] === null || typeof s[k] !== typeof m[k]) s[k] = m[k];
    for (const k in m.tk) s.tk[k] = Math.max(0, +s.tk[k] || 0);
    for (const k of ['pv', 'pd', 'mo']) s.ru[k] = Math.max(0, s.ru[k] | 0);
    s.v = this.V;
    this.s = s;
    const d = THEBAI.doc(); if (typeof d.ngoc !== 'number' || !(d.ngoc >= 0)) { d.ngoc = Math.max(0, Math.floor(+d.ngoc || 0)); THEBAI.luu(); }
    this.luu(true);
    return s;
  },
  luu(nhe) {
    const s = this.s; if (!s) return;
    if (!nhe) s.n = (s.n | 0) + 1;
    try { localStorage.setItem(this.KEY, JSON.stringify(s)); } catch (e) { }
    THEBAI.luu();
    if (!nhe) this.dayLen();
    try { if (typeof KTUI !== 'undefined') KTUI.capNhat(); } catch (e) { }
  },
  get vang() { return THEBAI.doc().vang; },
  get ngoc() { return THEBAI.doc().ngoc | 0; },
  du(gia) { return (!gia.vang || this.vang >= gia.vang) && (!gia.ngoc || this.ngoc >= gia.ngoc); },
  tra(gia) { if (!this.du(gia)) return false; if (gia.vang) this.cong('vang', -gia.vang, 'shop'); if (gia.ngoc) this.cong('ngoc', -gia.ngoc, 'shop'); return true; },

  // ---------- bộ sưu tập ----------
  dsBac(b) { return (typeof G !== 'undefined' && G.roster || []).filter(r => SKILLS[r.id] && r.bac === b).map(r => r.id).sort(); },
  // chọn thẻ của 1 bậc (ưu tiên thẻ chưa max) bằng rng cho trước
  chonThe(b, r) {
    const ds = this.dsBac(b); if (!ds.length) return null;
    const chua = ds.filter(id => !THEBAI.the(id).max), bo = chua.length ? chua : ds;
    return bo[Math.floor(r() * bo.length)];
  },
  suKien() { // ụ Huyền thoại nổi bật của tuần (như nhau với mọi người chơi)
    const ds = this.dsBac('vang'); if (!ds.length) return null;
    const t = this.tuan(); return ds[this.bam('su:' + t) % ds.length];
  },
  // ---------- MỐI NỐI TIỀN TỆ (sẵn cho bán ngọc sau này — người dùng 06/11: "sau này đẩy lên store", CHƯA có mã thanh toán) ----------
  // MỌI lần cộng vàng/ngọc đi qua đây, kèm nhãn nguồn. Sau này IAP / quảng cáo thưởng / biên nhận máy chủ chỉ cần gọi
  // KT.cong('ngoc', n, 'iap') rồi KT.luu(). Nhãn: quest login achieve event wheel shop chest battle exchange · để dành: iap ad pass
  NGUON: ['quest', 'login', 'achieve', 'event', 'wheel', 'shop', 'chest', 'battle', 'exchange', 'iap', 'ad', 'pass', 'other'],
  cong(loai, so, nguon) {
    so = Math.floor(+so || 0); if (!so || (loai !== 'vang' && loai !== 'ngoc')) return 0;
    const d = THEBAI.doc(), s = this.doc(), ng = this.NGUON.includes(nguon) ? nguon : 'other';
    if (loai === 'vang') d.vang = Math.max(0, d.vang + so); else d.ngoc = Math.max(0, (d.ngoc | 0) + so);
    const t = s.nguon || (s.nguon = {}); const k = loai + ':' + ng; t[k] = (t[k] || 0) + so; // tổng theo nguồn (không lưu lịch sử dài)
    return so;
  },
  // ---------- phát thưởng ----------
  // r = {vang} | {ngoc} | {the:{id|bac|su, n}} | {ruong}; trả về danh sách đã nhận (để vẽ) — rương: kết quả mở
  cho(r, khoa, nguon) {
    const ra = { vang: 0, ngoc: 0, the: [], ruong: null };
    if (r.vang) ra.vang = this.cong('vang', r.vang, nguon);
    if (r.ngoc) ra.ngoc = this.cong('ngoc', r.ngoc, nguon);
    if (r.the) {
      let id = r.the.id || (r.the.su ? this.suKien() : null);
      if (!id && r.the.bac) id = this.chonThe(r.the.bac, this.rng(this.bam(this.s.pid + ':' + (khoa || 'q') + ':' + this.s.n)));
      if (id) { this.themBan(id, r.the.n || 1); ra.the.push({ id, n: r.the.n || 1 }); }
    }
    if (r.ruong) ra.ruong = this.moRuong(r.ruong, true);
    return ra;
  },
  themBan(id, n) { const d = THEBAI.doc(), t = THEBAI.the(id); d.c[id] = { lv: t.lv, n: t.n + n }; },

  // ---------- DAILY SPECIALS ----------
  spTao(ngay) {
    const r = this.rng(this.bam(this.doc().pid + ':sp:' + ngay)), ds = [];
    ds.push({ free: 1, r: KTC.spFree[Math.floor(r() * KTC.spFree.length)] });
    const bac = ['trang', 'xanh', r() < 0.5 ? 'xanh' : 'tim', 'tim', r() < KTC.spDoNgay ? 'do' : 'vang'];
    const dung = new Set();
    for (const b of bac) {
      let id = null;
      for (let i = 0; i < 6 && (!id || dung.has(id)); i++) id = this.chonThe(b, r);
      if (!id) continue; dung.add(id);
      const [a, c] = KTC.spSo[b], n = a + Math.floor(r() * (c - a + 1));
      ds.push({ id, bac: b, n, gia: { vang: Math.round(n * KTC.spGia[b] / 10) * 10 } });
    }
    return ds;
  },
  sp() { const s = this.doc(), ng = this.ngay(); if (s.sp.ngay !== ng) s.sp = { ngay: ng, mua: [] }; return this.spTao(ng).map((o, i) => Object.assign(o, { i, da: !!s.sp.mua[i] })); },
  spMua(i) {
    const o = this.sp()[i]; if (!o || o.da) return null;
    if (!o.free && !this.tra(o.gia)) return null;
    this.s.sp.mua[i] = 1;
    const ra = o.free ? this.cho(o.r, 'spf' + this.s.sp.ngay, 'shop') : (this.themBan(o.id, o.n), { vang: 0, ngoc: 0, the: [{ id: o.id, n: o.n }] });
    this.luu(); return ra;
  },

  // ---------- RƯƠNG (gacha) ----------
  rutBac(tiLe, r) { let x = r() * 100; for (const b of TIER_LIST) { const w = tiLe[b] || 0; if (x < w) return b; x -= w; } return 'trang'; },
  moRuong(k, mienPhi) {
    const C = KTC.ruong[k], s = this.doc(); if (!C) return null;
    if (!mienPhi && !this.tra(C.gia)) return null;
    const r = this.rng(this.bam(s.pid + ':ru:' + s.ru.mo + ':' + k));
    const bac = []; for (let i = 0; i < C.so; i++) bac.push(this.rutBac(C.tiLe, r));
    const tt = (b) => TIERS[b].thuTu, dat = (b) => { // thay thẻ thấp nhất bằng bậc b
      let j = 0; for (let i = 1; i < bac.length; i++) if (tt(bac[i]) < tt(bac[j])) j = i; bac[j] = b;
    };
    const dem = (b) => bac.filter(x => tt(x) >= tt(b)).length;
    // bảo đảm: Cổ đại / Huyền thoại đúng số bản · Sử thi = ít nhất 1 thẻ từ Sử thi trở lên
    if (C.bao) for (const b of ['do', 'vang', 'tim']) {
      const can = C.bao[b] || 0, co = () => (b === 'tim' ? dem('tim') : bac.filter(x => x === b).length);
      for (let i = 0; i < bac.length && can && co() < can; i++) dat(b);
    }
    let pityV = false, pityD = false;
    if (C.pityD) { if (!bac.includes('do') && s.ru.pd + 1 >= C.pityD) { dat('do'); pityD = true; } s.ru.pd = bac.includes('do') ? 0 : s.ru.pd + 1; }
    if (C.pityV) { if (dem('vang') === 0 && s.ru.pv + 1 >= C.pityV) { dat('vang'); pityV = true; } s.ru.pv = dem('vang') ? 0 : s.ru.pv + 1; }
    const gom = {};
    for (const b of bac) { const id = this.chonThe(b, r); if (!id) continue; const [a, c] = KTC.ruongBan[b]; gom[id] = (gom[id] || 0) + a + Math.floor(r() * (c - a + 1)); }
    const the = Object.entries(gom).map(([id, n]) => ({ id, n, bac: THEBAI.bac(id) })).sort((a, b) => tt(a.bac) - tt(b.bac));
    for (const x of the) this.themBan(x.id, x.n);
    s.ru.mo++; s.tk.ruong++;
    if (!mienPhi) this.luu();
    return { k, the, pityV, pityD };
  },
  // xác suất CÓ ÍT NHẤT 1 thẻ bậc ≥ b trong 1 rương (để hiện cho người chơi)
  coIt(k, b) { const C = KTC.ruong[k]; let p = 0; for (const x of TIER_LIST) if (TIERS[x].thuTu >= TIERS[b].thuTu) p += C.tiLe[x] || 0; return 1 - Math.pow(1 - p / 100, C.so); },
  doi(i) { const o = KTC.doiVang[i]; if (!o || !this.tra({ ngoc: o.ngoc })) return null; this.cong('vang', o.vang, 'exchange'); this.luu(); return { vang: o.vang, ngoc: 0, the: [] }; },

  // ---------- VÒNG QUAY ----------
  vq() { const s = this.doc(), ng = this.ngay(); if (s.vq.ngay !== ng) s.vq = { ngay: ng, free: 0, tra: 0 }; return s.vq; },
  vqQuay(tra) {
    const v = this.vq();
    if (tra) { if (v.tra >= KTC.vqMax || !this.tra({ ngoc: KTC.vqGia })) return null; v.tra++; }
    else { if (v.free) return null; v.free = 1; }
    const r = this.rng(this.bam(this.s.pid + ':vq:' + v.ngay + ':' + (tra ? 't' + v.tra : 'f')));
    const w = KTC.vq.map(o => tra && o.wTra ? o.wTra : o.w), tong = w.reduce((a, b) => a + b, 0);
    let x = r() * tong, o = 0; while (o < w.length - 1 && x >= w[o]) { x -= w[o]; o++; }
    let rw = KTC.vq[o].r;
    if (KTC.vq[o].jack && tra && r() < 0.3) rw = { the: { bac: 'do', n: 1 } };
    const ra = this.cho(rw, 'vq' + v.ngay + (tra ? 't' + v.tra : 'f'), 'wheel');
    this.luu(); return { o, ra };
  },
  vqTiLe(tra) { const w = KTC.vq.map(o => tra && o.wTra ? o.wTra : o.w), t = w.reduce((a, b) => a + b, 0); return w.map(x => x / t * 100); },

  // ---------- NHIỆM VỤ NGÀY ----------
  nv() {
    const s = this.doc(), ng = this.ngay();
    if (s.nv.ngay !== ng) {
      const r = this.rng(this.bam(s.pid + ':nv:' + ng)), bo = KTC.nv.map(q => q.id), ds = [];
      while (ds.length < 3 && bo.length) ds.push(bo.splice(Math.floor(r() * bo.length), 1)[0]);
      s.nv = { ngay: ng, ds, tien: {}, nhan: {}, bonus: 0 };
    }
    return s.nv.ds.map(id => { const q = KTC.nv.find(x => x.id === id), t = Math.min(q.can, s.nv.tien[id] | 0); return Object.assign({}, q, { t, xong: t >= q.can, da: !!s.nv.nhan[id] }); });
  },
  nvNhan(id) {
    const q = this.nv().find(x => x.id === id); if (!q || !q.xong || q.da) return null;
    this.s.nv.nhan[id] = 1; const ra = this.cho(q.r, 'nv' + id, 'quest'); this.luu(); return ra;
  },
  nvBonus() { const ds = this.nv(); if (this.s.nv.bonus || !ds.every(q => q.da)) return null; this.s.nv.bonus = 1; const ra = this.cho(KTC.nvBonus, 'nvb', 'quest'); this.luu(); return ra; },

  // ---------- ĐIỂM DANH ----------
  dn() { const s = this.doc(), ng = this.ngay(); return { i: s.dn.so % 7, duoc: s.dn.ngay !== ng, so: s.dn.so }; },
  dnNhan() {
    const t = this.dn(); if (!t.duoc) return null;
    this.s.dn = { ngay: this.ngay(), so: this.s.dn.so + 1 };
    const ra = this.cho(KTC.dn[t.i], 'dn' + t.so, 'login'); this.luu(); return ra;
  },

  // ---------- THÀNH TỰU ----------
  tt() { const s = this.doc(); return KTC.tt.map(a => ({ ...a, t: Math.min(a.can, s.tk[a.k] | 0), xong: (s.tk[a.k] | 0) >= a.can, da: !!s.tt[a.id] })); },
  ttNhan(id) { const a = this.tt().find(x => x.id === id); if (!a || !a.xong || a.da) return null; this.s.tt[id] = 1; const ra = this.cho(a.r, 'tt' + id, 'achieve'); this.luu(); return ra; },

  // ---------- SỰ KIỆN TUẦN ----------
  sk() { const s = this.doc(), t = this.tuan(); if (s.sk.tuan !== t) s.sk = { tuan: t, diem: 0, nhan: {} }; return s.sk; },
  skDs() { const e = this.sk(); return KTC.sk.map(([d, r], i) => ({ i, d, r, xong: e.diem >= d, da: !!e.nhan[i] })); },
  skNhan(i) { const m = this.skDs()[i]; if (!m || !m.xong || m.da) return null; this.s.sk.nhan[i] = 1; const ra = this.cho(m.r, 'sk' + this.s.sk.tuan + ':' + i, 'event'); this.luu(); return ra; },

  // ---------- trận đấu → nhiệm vụ / sự kiện / thành tựu (mọi chế độ) ----------
  batTran(che) { this.tran = { che, onl: typeof ONS !== 'undefined' && !!ONS.on, ghep: 0, trieu: 0, sao5: 0, sao7: 0, xong: 0 }; },
  ketTran(k, m) {
    const tr = this.tran || { che: m && m.che, ghep: 0, trieu: 0, sao5: 0, sao7: 0 };
    if (tr.xong) return null; tr.xong = 1;
    const s = this.doc(), wave = Math.max(1, (k && k.wave) | 0), trum = (m && m.trum) | 0, thang = !!(k && k.thang), che = tr.onl ? 'online' : (tr.che || (m && m.che) || 'solo');
    this.nv(); const nv = s.nv, cong = (key, v) => { for (const id of nv.ds) { const q = KTC.nv.find(x => x.id === id); if (q.k !== key) continue; nv.tien[id] = q.max ? Math.max(nv.tien[id] | 0, v) : (nv.tien[id] | 0) + v; } };
    cong('tran', 1); if (thang) cong('thang', 1); cong('ghep', tr.ghep); cong('trieu', tr.trieu); cong('wave', wave); cong('trum', trum); cong('sao5', tr.sao5);
    if (che === 'coop' || che === 'online') cong('coop', 1); if (che === 'pvp') cong('pvp', 1);
    const diem = Math.min(KTC.skMax, wave + (thang ? 10 : 0) + 5 * trum); this.sk().diem += diem;
    s.tk.thang += thang ? 1 : 0; s.tk.trum += trum; s.tk.sao7 += tr.sao7; s.tk.wave = Math.max(s.tk.wave, wave);
    this.luu(); return { diem };
  },
  // có gì nhận được (chấm đỏ HOME)
  coNhan() {
    const nv = this.nv(), tt = this.tt(), sk = this.skDs(), sp = this.sp();
    return {
      shop: sp.some(o => o.free && !o.da),
      vq: !this.vq().free,
      nv: this.dn().duoc || nv.some(q => q.xong && !q.da) || (nv.every(q => q.da) && !this.s.nv.bonus) || tt.some(a => a.xong && !a.da),
      sk: sk.some(m => m.xong && !m.da),
    };
  },

  // ---------- chép lên hồ sơ Firebase (nếu đã đăng nhập) ----------
  goi() { return JSON.stringify({ kt: this.s, the: THEBAI.doc() }); },
  dayLen() {
    clearTimeout(this._hen);
    this._hen = setTimeout(() => {
      try {
        if (typeof NET === 'undefined' || !NET.ok || !NET.user || this._keoUid !== NET.user.uid) return;
        const g = this.goi(); if (g.length > 60000) return;
        NET.update('profiles/' + NET.user.uid, { kt: g, at: NET.TS }).catch(() => { });
      } catch (e) { }
    }, 2500);
  },
  // tải bản trên mạng 1 lần mỗi tài khoản rồi gộp (tất định: bản có bộ đếm lưu n lớn hơn làm gốc; cờ đã nhận OR; cấp thẻ lấy lớn nhất)
  keoVe() {
    if (typeof NET === 'undefined' || !NET.ok || !NET.user || this._keoUid === NET.user.uid || this._dangKeo) return;
    const uid = NET.user.uid; this._dangKeo = 1;
    NET.get('profiles/' + uid + '/kt').then((v) => {
      this._dangKeo = 0; this._keoUid = uid;
      let o = null; try { o = v ? JSON.parse(v) : null; } catch (e) { }
      if (o && o.kt && o.the) this.gop(o);
      this.dayLen();
    }).catch(() => { this._dangKeo = 0; });
  },
  gop(o) {
    const s = this.doc(), d = THEBAI.doc(), xa = o.kt, xd = o.the;
    const goc = (xa.n | 0) > (s.n | 0) ? { a: xa, d: xd, b: s, e: d } : { a: s, d: d, b: xa, e: xd };
    const a = JSON.parse(JSON.stringify(goc.a)), dd = JSON.parse(JSON.stringify(goc.d)), b = goc.b;
    a.ngayMax = Math.max(a.ngayMax | 0, b.ngayMax | 0);
    const or = (x, y) => { if (!x || !y) return; for (const k in y) if (y[k]) x[k] = y[k]; };
    if (b.sp && a.sp && b.sp.ngay === a.sp.ngay) or(a.sp.mua, b.sp.mua);
    if (b.vq && a.vq && b.vq.ngay === a.vq.ngay) { a.vq.free = a.vq.free || b.vq.free; a.vq.tra = Math.max(a.vq.tra | 0, b.vq.tra | 0); }
    if (b.nv && a.nv && b.nv.ngay === a.nv.ngay) { or(a.nv.nhan, b.nv.nhan); a.nv.bonus = a.nv.bonus || b.nv.bonus; }
    if (b.dn && a.dn) { if ((b.dn.so | 0) > (a.dn.so | 0)) a.dn = b.dn; }
    if (b.sk && a.sk && b.sk.tuan === a.sk.tuan) { or(a.sk.nhan, b.sk.nhan); a.sk.diem = Math.max(a.sk.diem | 0, b.sk.diem | 0); }
    or(a.tt, b.tt);
    a.mvMo = a.mvMo || {}; or(a.mvMo, b.mvMo); // chỉ huy đã mở: OR (không bao giờ mất)
    a.ru = a.ru || {}; for (const k of ['mo']) a.ru[k] = Math.max(a.ru[k] | 0, (b.ru || {})[k] | 0);
    for (const k in (b.tk || {})) a.tk[k] = Math.max(a.tk[k] | 0, b.tk[k] | 0);
    for (const id in (goc.e.c || {})) { const x = dd.c[id] || { lv: 0, n: 0 }, y = goc.e.c[id]; if ((y.lv | 0) > (x.lv | 0)) dd.c[id] = y; }
    a.n = Math.max(s.n | 0, xa.n | 0) + 1;
    a.pid = s.pid; // hạt giống của máy này giữ nguyên (cửa hàng hôm nay không đổi giữa chừng)
    this.s = null; try { localStorage.setItem(this.KEY, JSON.stringify(a)); } catch (e) { }
    dd.doi = Object.assign({}, xd && xd.doi, d && d.doi, dd.doi); // thẻ đích bù thẻ đã bỏ: giữ lựa chọn đã có (thebai.js)
    THEBAI.d = dd; try { if (THEBAI.boThe) THEBAI.boThe(); } catch (e) { } THEBAI.luu(); this.doc(); this.luu(true);
    try { if (typeof TBUI !== 'undefined') TBUI.capLuoi(); } catch (e) { }
  },
};

(function () {
  if (typeof THEBAI === 'undefined') return;
  KT.doc();
  // bọc hàm trận (cùng cách ketqua.js): đếm ghép / triệu hồi / sao của BÀN NGƯỜI CHƠI (bàn 0), mọi chế độ kể cả online
  if (typeof batDau === 'function') { const g = batDau; batDau = function (che) { try { KT.batTran(che); } catch (e) { } return g.apply(this, arguments); }; }
  if (typeof ghep === 'function') {
    const g = ghep; ghep = function (B, a, b, ep) {
      const th = laGhepThat(a, b, ep); // chỉ ghép thật mới tính (08/11: Merge King +★ / Copycat / Teleporter… không)
      const r = g.apply(this, arguments);
      try { if (r && !ep && th && KT.tran && b && b.ban === 0 && !(G.ban[0] || {}).ai) { KT.tran.ghep++; const T = G.ban[0].t[b.o]; const sao = (T && T.sao) | 0; if (sao >= 5) KT.tran.sao5++; if (sao >= 7) KT.tran.sao7++; } } catch (e) { }
      return r;
    };
  }
  if (typeof trieu === 'function') { const g = trieu; trieu = function (B) { const r = g.apply(this, arguments); try { if (r && KT.tran && B === G.ban[0] && !B.ai) KT.tran.trieu++; } catch (e) { } return r; }; }
  // lên cấp thẻ → thành tựu
  const nang = THEBAI.nang; THEBAI.nang = function () { const ok = nang.apply(this, arguments); if (ok) { try { KT.doc().tk.nang++; KT.luu(); } catch (e) { } } return ok; };
  // hết trận (chạy sau ketqua.js / ketqua-onl.js / thebai-ui.js): cập nhật nhiệm vụ + điểm sự kiện (không tính hướng dẫn, trận thử ?mana=)
  if (typeof UI !== 'undefined' && UI.ketQua) {
    const kq = UI.ketQua;
    UI.ketQua = function (k) {
      const x = kq.apply(this, arguments);
      try {
        const m = typeof KQ !== 'undefined' && KQ.m, thu = typeof G !== 'undefined' && G.debug && (G.debug.mana || G.debug.auto || G.debug.wave);
        if (m && !m.tut && !thu) { const r = KT.ketTran(k, m); if (r && typeof KTUI !== 'undefined') KTUI.veKetQua(r); }
      } catch (e) { console.error('KT', e); }
      return x;
    };
  }
  // hồ sơ Firebase: thử kéo về khi đã đăng nhập
  setInterval(() => { try { KT.keoVe(); } catch (e) { } }, 4000);
})();
