// TURRET MERGE — TIẾN TRÌNH NGƯỜI CHƠI ĐỢT 1 (docs/demo-hop-tuong/tuvan/tien-trinh/THIET-KE.md §2–§3, người dùng chốt 09/11):
//  · CẤP PHI CÔNG (cấp tài khoản): XP mỗi trận = wave đạt + 3 × trùm hạ + 10 nếu thắng (mọi chế độ, trừ hướng dẫn / trận thử ?mana=).
//    XP lên cấp L → L+1 = 20 + 15·L, tối đa cấp 30; sau 30 mỗi 1 000 XP = 1 "cấp danh vọng" (Rương Thường + 300 vàng).
//    Thưởng mỗi cấp: 150·L vàng + 20 ngọc; cấp 5/10/…/30 thêm Rương Vàng; cấp 6 tặng CHỌN 1 TRONG 3 thẻ Vàng (1 bản).
//  · KHOÁ BẬC Ụ theo cấp: Trắng + Xanh ngay sau hướng dẫn · Tím cấp 3 · Vàng cấp 6 · Đỏ cấp 12 VÀ kỷ lục ≥ wave 30.
//    Ụ khoá vẫn xem được (thẻ tối + điều kiện mở — chỉ nêu điều kiện, không chỉ cách chơi); bộ bài không nhận ụ khoá.
//  · NGƯỜI CHƠI CŨ (có bản lưu trước bản này): cấp khởi điểm theo kỷ lục (≥30 → 12 · ≥20 → 8 · ≥10 → 5 · còn lại 3);
//    mọi ụ đang nằm trong bộ bài / 6 bộ mẫu lúc chuyển được GIỮ (dùng tiếp dù bậc chưa mở) → không ai mất ụ đang dùng.
//    Cấp đã có lúc chuyển không phát thưởng lại (không cộng tiền ồ ạt).
//  · HÀNH TRÌNH 7 NGÀY (mục tiêu = KẾT QUẢ, không nói cách; không có Đỏ) · NHIỆM VỤ TUẦN (mở cấp 8, 5 việc × 20 ngọc + đủ 5 = 40 ngọc + 1 bản Vàng).
//  · Lưu: turret_kt.cp (khoá mới, giá trị mặc định, không xoá gì); gộp hồ sơ Firebase: XP/cấp/đếm lấy lớn nhất, cờ đã nhận OR.
//  Hình: chỉ ảnh có sẵn (khung hàng nhiệm vụ, thanh tai_day, khung thẻ) — ảnh ổ khoá chờ gen (TTA.khoa = '' → chỉ chữ; HINH-VE-CODE-AUDIT.md).
'use strict';

const TTA = { khoa: '' }; // ảnh ổ khoá trên thẻ ụ khoá: '' = chưa có ảnh (prompt ở docs/demo-hop-tuong/HINH-VE-CODE-AUDIT.md §TIẾN TRÌNH)

const TTC = {
  capMax: 30,
  xpCan: (L) => 20 + 15 * L,                       // XP để lên L → L+1
  moBac: { trang: 0, xanh: 0, tim: 3, vang: 6, do: 12 }, doWave: 30,
  quyDoi: [[30, 12], [20, 8], [10, 5]], cuCap: 3,  // người chơi cũ: kỷ lục → cấp khởi điểm
  thuongCap: (L) => (L % 5 === 0 ? [{ vang: 150 * L, ngoc: 20 }, { ruong: 'vang' }] : [{ vang: 150 * L, ngoc: 20 }]),
  danhVong: { xp: 1000, r: [{ vang: 300 }, { ruong: 'thuong' }] },
  quaVang: { cap: 6, bac: 'vang', n: 1 },
  // HÀNH TRÌNH 7 NGÀY: [khoá đếm, cần, chữ, (mục tiêu thay thế cùng độ khó)] — đếm từ lúc bắt đầu hành trình (người chơi cũ cũng phải chơi để đạt).
  //  Ngày đã qua vẫn làm bù được (đếm cộng dồn, không hết hạn). Ngày 5/6 dễ nghẽn (tư vấn tien-trinh/CHATGPT-THU-PHI.md) → đạt 1 trong 2 mục tiêu.
  hj: [
    { r: { vang: 500, ngoc: 30, the: { bac: 'xanh', n: 10 } }, v: [['trum', 1, 'Defeat the wave 10 boss'], ['tran', 3, 'Play 3 battles'], ['wave', 15, 'Reach wave 15']] },
    { r: { vang: 800, ngoc: 30, ruong: 'thuong' }, v: [['wave', 18, 'Reach wave 18'], ['sao', 4, 'Have a 4★ turret'], ['nang', 2, 'Level up 2 cards']] },
    { r: { ngoc: 40, chon: { bac: 'tim', n: 4 } }, v: [['coop', 1, 'Finish a CO-OP battle'], ['trumKhac', 2, 'Defeat 2 different bosses'], ['wave', 20, 'Reach wave 20']] },
    { r: { vang: 1500, ngoc: 40 }, v: [['wave', 22, 'Reach wave 22'], ['sao', 5, 'Have a 5★ turret'], ['sp', 1, 'Buy a Daily Specials item']] },
    { r: { ruong: 'vang' }, v: [['wave', 25, 'Reach wave 25'], ['trumMax', 2, 'Defeat the wave 20 boss'], ['sao5x', 2, 'Have two 5★ turrets at once', ['sao5t', 6, 'Make 6 turrets of 5★+ in total']]] },
    { r: { vang: 2000, ngoc: 50 }, v: [['pvp', 1, 'Play a PVP battle'], ['nvd', 3, 'Complete 3 daily quests'], ['cap', 9, 'Reach Pilot Level 9', ['tran', 25, 'Play 25 battles']]] },
    { r: { chon: { bac: 'vang', n: 2 } }, v: [['wave', 30, 'Reach wave 30'], ['trumKhac', 4, 'Defeat 4 different bosses'], ['nangV', 1, 'Level up a Legendary card']] },
  ],
  // NHIỆM VỤ TUẦN (reset thứ Hai, mở cấp 8): mỗi việc 20 ngọc, đủ 5 = 40 ngọc + 1 bản Vàng ngẫu nhiên → +140 ngọc/tuần
  nvtCap: 8, nvtR: { ngoc: 20 }, nvtBonus: { ngoc: 40, the: { bac: 'vang', n: 1 } },
  nvt: [
    { id: 'tran', can: 15, ten: 'Play 15 battles' },
    { id: 'trum', can: 8, ten: 'Defeat 8 bosses' },
    { id: 'gan', can: 3, ten: 'Finish 3 battles within 5 waves of your best' },
    { id: 'sao5', can: 10, ten: 'Make 10 turrets of 5★+' },
    { id: 'nvd', can: 12, ten: 'Complete 12 daily quests' },
  ],
};

const TT = {
  tr: null, // trận đang chơi: sao lớn nhất + số ụ 5★ cùng lúc (bàn người chơi)
  // ---------- cấp / XP ----------
  xpTong(L) { let x = 0; for (let l = 1; l < Math.min(L, TTC.capMax); l++) x += TTC.xpCan(l); return x; },
  capTuXp(xp) { let L = 1; while (L < TTC.capMax && xp >= this.xpTong(L + 1)) L++; return L; },
  cap() { return this.capTuXp(this.st().xp); },
  thanhXp() { // tiến độ trong cấp hiện tại
    const xp = this.st().xp, L = this.capTuXp(xp);
    if (L >= TTC.capMax) { const d = xp - this.xpTong(TTC.capMax); return { L, n: d % TTC.danhVong.xp, can: TTC.danhVong.xp, max: true }; }
    return { L, n: xp - this.xpTong(L), can: TTC.xpCan(L), max: false };
  },
  kyLuc() { const s = KT.doc(); let w = s.tk.wave | 0; try { if (typeof MH !== 'undefined') w = Math.max(w, MH.st().sw | 0); } catch (e) { } return w; },

  // ---------- lưu / di chuyển ----------
  laCu(s) {
    if ((s.n | 0) > 0 || (s.tk.wave | 0) > 0) return true;
    for (const k of ['turret_best', 'tm_hoso', 'turret_bo', 'turret_pre']) { try { const v = localStorage.getItem(k); if (v && v !== '{}' && v !== 'null') return true; } catch (e) { } }
    try { const h = JSON.parse(localStorage.getItem('turret_hd') || 'null'); if (h && (h.xong || h.boQua)) return true; } catch (e) { }
    try { const d = THEBAI.doc(); if (!d.moi || Object.keys(d.c || {}).length) return true; } catch (e) { }
    return false;
  },
  boDangDung() { // mọi ụ trong bộ bài đang chọn + 6 bộ mẫu (bản lưu)
    const ds = new Set();
    try { const l = JSON.parse(localStorage.getItem('turret_bo') || 'null'); if (l && Array.isArray(l.chon)) l.chon.forEach(x => x && ds.add(x)); } catch (e) { }
    try { const l = JSON.parse(localStorage.getItem('turret_pre') || 'null'); if (l && Array.isArray(l.ds)) l.ds.forEach(p => p && Array.isArray(p.o) && p.o.forEach(x => x && ds.add(x))); } catch (e) { }
    try { if (typeof UI !== 'undefined' && UI.chon) UI.chon.forEach(x => x && ds.add(x)); } catch (e) { }
    return ds;
  },
  capQuyDoi(kl) { let c = TTC.cuCap; for (const [w, L] of TTC.quyDoi) if (kl >= w) { c = Math.max(c, L); break; } return c; },
  taoMoi(s) {
    const cu = this.laCu(s), L = cu ? this.capQuyDoi(this.kyLuc()) : 1, giu = {};
    if (cu) for (const id of this.boDangDung()) giu[id] = 1;
    const t = { v: 1, xp: this.xpTong(L), cu: cu ? L : 0, giu, nhanCap: L, dv: 0, qv: L >= TTC.quaVang.cap ? 1 : 0, daMo: { trang: 1, xanh: 1 }, bao: [],
      hj: { ngay0: KT.soNgay(KT.ngay()), nhan: {}, chon: 1 }, dem: {}, trk: {}, nvt: {} };
    for (const b of ['tim', 'vang', 'do']) if (this.bacMoVoi(b, L)) t.daMo[b] = 1;
    return t;
  },
  st() {
    const s = KT.doc(); let t = s.cp;
    if (!t || typeof t !== 'object' || Array.isArray(t)) { t = s.cp = this.taoMoi(s); try { localStorage.setItem(KT.KEY, JSON.stringify(s)); } catch (e) { } }
    t.xp = Math.max(0, Math.floor(+t.xp || 0)); t.nhanCap = Math.max(1, t.nhanCap | 0); t.dv = Math.max(0, t.dv | 0); t.qv = t.qv ? 1 : 0; t.cu = t.cu | 0;
    for (const k of ['giu', 'daMo', 'dem', 'trk', 'nvt']) if (!t[k] || typeof t[k] !== 'object' || Array.isArray(t[k])) t[k] = {};
    if (!Array.isArray(t.bao)) t.bao = [];
    if (!t.hj || typeof t.hj !== 'object') t.hj = { ngay0: KT.soNgay(KT.ngay()), nhan: {}, chon: 1 };
    if (!t.hj.nhan || typeof t.hj.nhan !== 'object') t.hj.nhan = {};
    if (!(t.hj.ngay0 > 0)) t.hj.ngay0 = KT.soNgay(KT.ngay());
    return t;
  },

  // ---------- khoá bậc ----------
  bacMoVoi(b, L) { const c = TTC.moBac[b] | 0; return L >= c && (b !== 'do' || this.kyLuc() >= TTC.doWave); },
  bacMo(b) { return this.bacMoVoi(b, this.cap()); },
  khoa(id) {
    if (!id || typeof SKILLS === 'undefined' || !SKILLS[id]) return false;
    const t = this.st(); if (t.giu[id]) return false;
    return !this.bacMo(THEBAI.bac(id));
  },
  dk(b) { return b === 'do' ? 'Pilot Level ' + TTC.moBac.do + ' and best wave ' + TTC.doWave : 'Pilot Level ' + TTC.moBac[b]; },
  chuKhoa(id) { return 'Unlocks at ' + this.dk(THEBAI.bac(id)); },
  locMo(ds) { return (ds || []).filter(id => !this.khoa(id)); },
  // chạy fn với G.roster chỉ còn ụ đã mở (bộ ngẫu nhiên của NGƯỜI CHƠI; bộ máy co-op/PVP không đổi)
  voiMo(fn) {
    const goc = G.roster; G.roster = goc.filter(r => !this.khoa(r.id));
    try { return fn(); } finally { G.roster = goc; }
  },

  // ---------- phát thưởng ----------
  gom(ra, x) { if (!x) return ra; ra.vang += x.vang || 0; ra.ngoc += x.ngoc || 0; ra.the.push(...(x.the || [])); if (x.ruong) ra.the.push(...x.ruong.the.map(c => ({ id: c.id, n: c.n }))); return ra; },
  phat(ds, khoa, nguon) { const ra = { vang: 0, ngoc: 0, the: [] }; ds.forEach((r, i) => this.gom(ra, KT.cho(r, khoa + ':' + i, nguon || 'level'))); return ra; },
  // lên cấp (gọi sau khi cộng XP): phát thưởng các cấp mới, mở bậc mới, xếp thông báo
  xetCap() {
    const t = this.st(), L = this.cap(), bao = { cap: [], ra: { vang: 0, ngoc: 0, the: [] }, mo: [], qv: 0 };
    for (let l = t.nhanCap + 1; l <= L; l++) { this.gom(bao.ra, this.phat(TTC.thuongCap(l), 'cap' + l)); bao.cap.push(l); }
    if (L > t.nhanCap) t.nhanCap = L;
    if (L >= TTC.capMax) { const co = Math.floor((t.xp - this.xpTong(TTC.capMax)) / TTC.danhVong.xp); while (t.dv < co) { t.dv++; this.gom(bao.ra, this.phat(TTC.danhVong.r, 'dv' + t.dv)); bao.dv = t.dv; } }
    for (const b of ['tim', 'vang', 'do']) if (!t.daMo[b] && this.bacMo(b)) { t.daMo[b] = 1; bao.mo.push(b); }
    if (bao.cap.includes(TTC.quaVang.cap) && !t.qv) bao.qv = 1;
    if (bao.cap.length || bao.mo.length || bao.dv) { t.bao.push(bao); if (t.bao.length > 6) t.bao.splice(0, t.bao.length - 6); }
    return bao;
  },
  // chọn 1 trong 3 (tất định theo hạt giống): ưu tiên thẻ chưa max
  ba(bac, khoa) {
    const ds = KT.dsBac(bac); if (!ds.length) return [];
    const r = KT.rng(KT.bam(KT.doc().pid + ':chon:' + khoa)), chua = ds.filter(id => !THEBAI.the(id).max), bo = (chua.length >= 3 ? chua : ds).slice(), ra = [];
    while (ra.length < 3 && bo.length) ra.push(bo.splice(Math.floor(r() * bo.length), 1)[0]);
    return ra;
  },

  // ---------- hành trình 7 ngày ----------
  hjNgay() { return Math.max(1, Math.min(7, KT.soNgay(KT.ngay()) - this.st().hj.ngay0 + 1)); }, // ngày đã mở tới
  giaTri(k) { const t = this.st(); if (k === 'cap') return this.cap(); if (k === 'trumKhac') return Object.keys(t.trk).length; return t.dem[k] | 0; },
  hjDs() {
    const t = this.st(), mo = this.hjNgay();
    return TTC.hj.map((d, i) => {
      const mt = ([k, can, ten]) => { const n = Math.min(can, this.giaTri(k)); return { k, can, ten, t: n, xong: n >= can }; };
      const v = d.v.map(x => { const a = mt(x); if (x[3]) { a.alt = mt(x[3]); a.xong = a.xong || a.alt.xong; } return a; }); // có mục tiêu thay thế: đạt 1 trong 2
      return { i, ngay: i + 1, r: d.r, v, mo: i + 1 <= mo, xong: v.every(x => x.xong), da: !!t.hj.nhan[i + 1] };
    });
  },
  hjHet() { return this.hjDs().every(d => d.da); },
  hjNhan(ngay, chonId) {
    const d = this.hjDs()[ngay - 1]; if (!d || !d.mo || !d.xong || d.da) return null;
    const r = d.r;
    if (r.chon) { const ba = this.ba(r.chon.bac, 'hj' + ngay); if (!ba.includes(chonId)) return null; }
    this.st().hj.nhan[ngay] = 1;
    const ds = []; if (r.vang) ds.push({ vang: r.vang }); if (r.ngoc) ds.push({ ngoc: r.ngoc }); if (r.the) ds.push({ the: r.the }); if (r.ruong) ds.push({ ruong: r.ruong });
    const ra = this.phat(ds, 'hj' + ngay, 'journey');
    if (r.chon) { KT.themBan(chonId, r.chon.n); ra.the.push({ id: chonId, n: r.chon.n }); }
    KT.luu(); return ra;
  },
  qvNhan(id) {
    const t = this.st(); if (t.qv || this.cap() < TTC.quaVang.cap || !this.ba(TTC.quaVang.bac, 'qv').includes(id)) return null;
    t.qv = 1; KT.themBan(id, TTC.quaVang.n); KT.luu(); return { vang: 0, ngoc: 0, the: [{ id, n: TTC.quaVang.n }] };
  },

  // ---------- nhiệm vụ tuần ----------
  nvtMo() { return this.cap() >= TTC.nvtCap; },
  nvtSt() { const t = this.st(), w = KT.tuan(); if (t.nvt.tuan !== w) t.nvt = { tuan: w, tien: {}, nhan: {}, bonus: 0 }; return t.nvt; },
  nvtDs() { const e = this.nvtSt(); return TTC.nvt.map(q => { const n = Math.min(q.can, e.tien[q.id] | 0); return Object.assign({}, q, { t: n, xong: n >= q.can, da: !!e.nhan[q.id] }); }); },
  nvtCong(id, v) { if (!this.nvtMo() || !v) return; const e = this.nvtSt(); e.tien[id] = (e.tien[id] | 0) + v; },
  nvtNhan(id) { const q = this.nvtDs().find(x => x.id === id); if (!q || !q.xong || q.da || !this.nvtMo()) return null; this.nvtSt().nhan[id] = 1; const ra = KT.cho(TTC.nvtR, 'nvt' + id, 'quest'); KT.luu(); return ra; },
  nvtBonus() { const e = this.nvtSt(); if (e.bonus || !this.nvtMo() || !this.nvtDs().every(q => q.da)) return null; e.bonus = 1; const ra = this.phat([{ ngoc: TTC.nvtBonus.ngoc }, { the: TTC.nvtBonus.the }], 'nvtb' + e.tuan, 'quest'); KT.luu(); return ra; },

  // ---------- hết trận ----------
  ketTran(k, m, klTruoc, tran, trums) {
    const t = this.st(), wave = Math.max(1, (k && k.wave) | 0), trum = (m && m.trum) | 0, thang = !!(k && k.thang);
    const che = tran && tran.onl ? 'online' : ((tran && tran.che) || (m && m.che) || 'solo'), tr = this.tr || {};
    const xp = wave + 3 * trum + (thang ? 10 : 0), capTruoc = this.cap();
    t.xp += xp;
    const d = t.dem, mx = (key, v) => { d[key] = Math.max(d[key] | 0, v | 0); }, cg = (key, v) => { d[key] = (d[key] | 0) + (v | 0); };
    cg('tran', 1); cg('trum', trum); cg('sao5t', (tran && tran.sao5) | 0); mx('wave', wave); mx('trumMax', trum); mx('sao', tr.sao); mx('sao5x', tr.s5);
    if (che === 'coop' || che === 'online') cg('coop', 1); if (che === 'pvp') cg('pvp', 1);
    for (const id of trums || []) t.trk[id] = 1;
    this.nvtCong('tran', 1); this.nvtCong('trum', trum); this.nvtCong('sao5', (tran && tran.sao5) | 0);
    if (wave >= Math.max(1, (klTruoc | 0) - 5)) this.nvtCong('gan', 1);
    this.tr = null;
    const bao = this.xetCap();
    return { xp, cap: this.cap(), len: this.cap() > capTruoc, bao };
  },
  coNhan() {
    const t = this.st();
    if (!t.qv && this.cap() >= TTC.quaVang.cap) return true;
    if (this.hjDs().some(d => d.mo && d.xong && !d.da)) return true;
    if (this.nvtMo()) { const ds = this.nvtDs(); if (ds.some(q => q.xong && !q.da) || (ds.every(q => q.da) && !this.nvtSt().bonus)) return true; }
    return false;
  },
  // gộp hồ sơ Firebase (sau KT.gop): a = bản máy trước gộp, b = bản mạng
  gop(a, b) {
    const t = this.st();
    for (const y of [a, b]) {
      if (!y || typeof y !== 'object') continue;
      t.xp = Math.max(t.xp, Math.floor(+y.xp || 0)); t.nhanCap = Math.max(t.nhanCap, y.nhanCap | 0); t.dv = Math.max(t.dv, y.dv | 0);
      t.qv = t.qv || (y.qv ? 1 : 0); t.cu = Math.max(t.cu, y.cu | 0);
      for (const k of ['giu', 'daMo', 'trk']) for (const i in (y[k] || {})) if (y[k][i]) t[k][i] = 1;
      for (const i in (y.dem || {})) t.dem[i] = Math.max(t.dem[i] | 0, y.dem[i] | 0);
      if (y.hj) { if (y.hj.ngay0 > 0) t.hj.ngay0 = Math.min(t.hj.ngay0, y.hj.ngay0); for (const i in (y.hj.nhan || {})) if (y.hj.nhan[i]) t.hj.nhan[i] = 1; }
      if (y.nvt && y.nvt.tuan === KT.tuan()) { const e = this.nvtSt(); for (const i in (y.nvt.tien || {})) e.tien[i] = Math.max(e.tien[i] | 0, y.nvt.tien[i] | 0); for (const i in (y.nvt.nhan || {})) if (y.nvt.nhan[i]) e.nhan[i] = 1; e.bonus = e.bonus || (y.nvt.bonus ? 1 : 0); }
    }
    // bản mạng của bản game cũ (chưa có tt) mà kỷ lục cao → quy đổi như người chơi cũ (không ai tụt cấp khi đổi máy)
    if (b === undefined || b === null) {
      const L = this.capQuyDoi(this.kyLuc());
      if (this.cap() < L) { t.xp = Math.max(t.xp, this.xpTong(L)); t.nhanCap = Math.max(t.nhanCap, L); t.cu = Math.max(t.cu, L); if (L >= TTC.quaVang.cap) t.qv = 1; for (const id of this.boDangDung()) t.giu[id] = 1; }
      for (const bb of ['tim', 'vang', 'do']) if (this.bacMo(bb)) t.daMo[bb] = 1;
    }
  },
};

// ===================================================== GIAO DIỆN =====================================================
const TTUI = {
  hjChon: 0, // ngày đang xem ở mục Hành trình (0 = tự chọn ngày đầu tiên chưa nhận)
  TIER: (b) => ({ trang: 'COMMON', xanh: 'RARE', tim: 'EPIC', vang: 'LEGENDARY', do: 'MYTHIC' }[b] || b), // tên bậc tiếng Anh cố định → ngonngu.js dịch cả câu (TIERS.ten đã dịch sẵn sẽ làm câu lẫn Việt/Anh)
  // lớp phủ: trong màn cửa hàng/nhiệm vụ → dùng #kt-phu; ở HOME → #tt-phu (cùng kiểu kt-phu)
  phu(html, cls) {
    if (typeof KTUI !== 'undefined' && KTUI.mo) return KTUI.phu(html, cls);
    let p = document.getElementById('tt-phu');
    if (!p) { const chon = document.getElementById('chon'); if (!chon) return null; p = document.createElement('div'); p.id = 'tt-phu'; chon.appendChild(p); }
    p.className = 'kt-phu tt-phu ' + (cls || ''); p.innerHTML = '<div class="kt-phu-nen" data-act="tt-dong"></div><div class="kt-phu-tam">' + html + '</div>'; p.hidden = false;
    try { OT.quet(p); } catch (e) { }
    return p;
  },
  dong() { const p = document.getElementById('tt-phu'); if (p) { p.hidden = true; p.innerHTML = ''; } if (typeof KTUI !== 'undefined' && KTUI.mo) { KTUI.dongPhu(); KTUI.ve(); } },
  nutOk(chu) { return '<button class="hm-nut2 vang kt-ok" data-act="tt-dong"><b>' + (chu || 'OK') + '</b></button>'; },
  dsThuong(ra) {
    const ds = []; if (ra.vang) ds.push(KTUI.rIc({ vang: ra.vang })); if (ra.ngoc) ds.push(KTUI.rIc({ ngoc: ra.ngoc }));
    const gom = {}; for (const x of ra.the || []) gom[x.id] = (gom[x.id] || 0) + x.n;
    for (const id in gom) ds.push('<span class="kt-r kt-r-the">' + OT.mini(id) + '<b>×' + gom[id] + '</b><small>' + KTUI.ten(id) + '</small></span>');
    return ds.join('');
  },
  nhan(ra, tde) {
    if (!ra) return; try { SND.nang(3); } catch (e) { }
    this.phu('<b class="kt-phu-t">' + (tde || 'YOU GOT') + '</b><div class="kt-nhan">' + this.dsThuong(ra) + '</div>' + this.nutOk(), 'kt-nh');
    try { TBUI.capLuoi(); } catch (e) { }
  },
  // bảng chọn 1 trong 3
  chon(bac, n, khoa, act, id, tde) {
    const ds = TT.ba(bac, khoa).map(x => '<button class="mh-the tt-the" data-act="' + act + '" data-k="' + id + '" data-id="' + x + '">' + OT.mini(x) + '<b>×' + n + '</b><small>' + KTUI.ten(x) + '</small></button>').join('');
    this.phu('<b class="kt-phu-t">' + (tde || 'PICK ONE') + '</b><p class="kt-chu">Pick 1 of 3 ' + this.TIER(bac) + ' cards: +' + n + (n > 1 ? ' copies' : ' copy') + '.</p><div class="mh-chon tt-chon">' + ds + '</div>' + this.nutOk('LATER'), 'kt-tl mh-p');
  },
  // thông báo lên cấp / mở khoá (hiện ở HOME sau trận)
  bao() {
    const t = TT.st(); if (!t.bao.length) return false;
    const ds = t.bao.splice(0); KT.luu(true);
    const ra = { vang: 0, ngoc: 0, the: [] }, cap = [], mo = []; let qv = 0, dv = 0;
    for (const b of ds) { TT.gom(ra, b.ra); cap.push(...(b.cap || [])); mo.push(...(b.mo || [])); if (b.qv) qv = 1; if (b.dv) dv = b.dv; }
    let h = '<b class="kt-phu-t">' + (cap.length ? 'PILOT LEVEL ' + Math.max(...cap) : 'PRESTIGE ' + dv) + '</b>';
    if (ra.vang || ra.ngoc || ra.the.length) h += '<div class="kt-nhan">' + this.dsThuong(ra) + '</div>';
    if (mo.length) h += '<p class="tt-mo"><small>NEW TURRETS UNLOCKED</small>' + mo.map(b => '<span class="tt-mo-b b-' + b + '"><img src="' + KTUI.a('ngoc_' + b) + '" alt="">' + this.TIER(b) + '</span>').join('') + '</p>';
    if (qv && !t.qv) h += '<p class="kt-chu">Level ' + TTC.quaVang.cap + ' gift: pick 1 of 3 Legendary cards.</p><button class="hm-nut2 vang kt-ok" data-act="tt-qvmo"><b>PICK</b></button>';
    try { SND.nang(5); } catch (e) { }
    this.phu(h + this.nutOk(), 'kt-nh tt-bao');
    try { TBUI.capLuoi(); } catch (e) { }
    return true;
  },
  // HOME: cấp + thanh XP dưới chip phi công (chạm = mở NHIỆM VỤ)
  veHome() {
    const hm = document.getElementById('hm'); if (!hm) return;
    let e = document.getElementById('tt-cap');
    if (!e) { e = document.createElement('button'); e.id = 'tt-cap'; e.className = 'tt-cap'; e.dataset.act = 'kt-mo'; e.dataset.tab = 'nv'; e.setAttribute('aria-label', 'Pilot level'); hm.appendChild(e); }
    const x = TT.thanhXp(), h = '<b>LV ' + x.L + '</b>' + TBUI.thanh({ n: x.n, can: x.can, max: false });
    if (e._h !== h) { e._h = h; e.innerHTML = h; }
  },
  // mục đầu trong tab NHIỆM VỤ: cấp phi công + hành trình 7 ngày
  ve_dau() {
    const x = TT.thanhXp(), t = TT.st(), L = x.L;
    const ke = ['tim', 'vang', 'do'].find(b => !TT.bacMo(b));
    let h = KTUI.muc('PILOT LEVEL', 'XP: WAVE + 3 PER BOSS + 10 FOR A WIN');
    h += '<div class="tt-box"><b class="tt-L">LV ' + L + '</b><div class="tt-box-g">' + TBUI.thanh({ n: x.n, can: x.can, max: false }) +
      '<small>' + (ke ? 'NEXT: ' + this.TIER(ke) + ' turrets · ' + TT.dk(ke) : L >= TTC.capMax ? 'Every ' + TTC.danhVong.xp + ' XP: prestige reward' : 'NEXT: Level ' + (L + 1) + ' reward') + '</small></div></div>';
    if (!t.qv && L >= TTC.quaVang.cap) h += KTUI.hangNv('Level ' + TTC.quaVang.cap + ' gift: pick 1 of 3 Legendary cards', { t: 1, can: 1, xong: true, da: false }, { the: { bac: TTC.quaVang.bac, n: TTC.quaVang.n } }, 'tt-qvmo', 'qv');
    if (TT.hjHet()) return h;
    const ds = TT.hjDs(), mo = TT.hjNgay();
    let sel = this.hjChon; if (!sel || !ds[sel - 1]) { const d = ds.find(d => d.mo && !d.da); sel = d ? d.ngay : mo; }
    h += KTUI.muc('7-DAY JOURNEY', 'DAY ' + mo + ' / 7');
    h += '<div class="tt-ngay">' + ds.map(d => '<button class="hm-nut2' + (d.ngay === sel ? ' vang' : '') + (d.da ? ' da' : '') + (d.mo ? '' : ' khoa') + '" data-act="tt-hjd" data-id="' + d.ngay + '" aria-pressed="' + (d.ngay === sel) + '" aria-label="Day ' + d.ngay + '"><b>' + d.ngay + '</b>' +
      (d.mo && d.xong && !d.da ? '<img class="kt-cham" src="' + KTUI.a(KTA.cham) + '" alt="">' : '') + '</button>').join('') + '</div>';
    const d = ds[sel - 1];
    for (const v of d.v) h += '<div class="kt-h tt-v' + (v.xong ? ' da' : '') + '"><span class="kt-r tt-so"><b>' + (d.v.indexOf(v) + 1) + '</b></span><div class="kt-h-g"><b>' + v.ten + '</b>' + TBUI.thanh({ n: v.t, can: v.can, max: false }) +
      (v.alt ? '<small class="tt-hoac"><i>or</i><span>' + v.alt.ten + '</span><em>' + KTUI.so(v.alt.t) + '/' + KTUI.so(v.alt.can) + '</em></small>' : '') + '</div>' +
      (v.xong ? '<img class="kt-tick" src="' + KTUI.a(KTA.xong) + '" alt="Done">' : '<button class="kt-slot" disabled><b>' + KTUI.so(v.t) + '/' + KTUI.so(v.can) + '</b></button>') + '</div>';
    const r = d.r, ic = r.chon ? { the: { bac: r.chon.bac, n: r.chon.n } } : r.ruong ? { ruong: r.ruong } : r.the ? r : r.ngoc && !r.vang ? { ngoc: r.ngoc } : { vang: r.vang };
    const ten = ['Day ' + d.ngay + ' reward', r.vang ? KTUI.rTen({ vang: r.vang }) : '', r.ngoc ? KTUI.rTen({ ngoc: r.ngoc }) : '', r.ruong ? KTUI.rTen({ ruong: r.ruong }) : '', r.the ? KTUI.rTen({ the: r.the }) : '', r.chon ? 'Pick 1 of 3 ' + this.TIER(r.chon.bac) + ' ×' + r.chon.n : ''].filter(Boolean).join(' · '); // ' · ' → ngonngu.js dịch từng đoạn
    if (!d.mo) h += '<p class="kt-chu tt-khoa-ngay">' + (d.ngay === mo + 1 ? 'Opens in <span data-dh="ngay"></span>' : 'Opens on day ' + d.ngay) + '</p>';
    h += KTUI.hangNv(ten, { t: d.v.filter(v => v.xong).length, can: 3, xong: d.mo && d.xong, da: d.da }, ic, 'tt-hjb', d.ngay);
    return h;
  },
  ve_tuan() {
    let h = KTUI.muc('WEEKLY QUESTS', TT.nvtMo() ? 'RESETS IN <span data-dh="tuan"></span>' : 'UNLOCKS AT PILOT LEVEL ' + TTC.nvtCap);
    if (!TT.nvtMo()) return h;
    const ds = TT.nvtDs(), e = TT.nvtSt();
    for (const q of ds) h += KTUI.hangNv(q.ten, q, TTC.nvtR, 'tt-nvt', q.id);
    h += KTUI.hangNv('Complete all ' + ds.length + ' weekly quests', { t: ds.filter(q => q.da).length, can: ds.length, xong: ds.every(q => q.da), da: !!e.bonus }, { the: TTC.nvtBonus.the }, 'tt-nvtb', 'b');
    return h;
  },
  // thẻ ụ khoá trên lưới bộ bài / bộ sưu tập: tối + ổ khoá (ảnh, khi có) + điều kiện
  ganKhoa(c, id) {
    if (!c) return c;
    const k = TT.khoa(id); // thêm cả 'khoa' (lớp sẵn có: không kéo, ẩn LV/nút i, đếm 'chơi được' bỏ qua) — chỉ gỡ 'khoa' do mình gắn
    if (k) c.classList.add('tt-khoa', 'khoa'); else if (c.classList.contains('tt-khoa')) c.classList.remove('tt-khoa', 'khoa');
    let n = c.querySelector(':scope > .tt-khoa-n');
    if (!k) { if (n) n.remove(); return c; }
    const b = THEBAI.bac(id), h = (TTA.khoa ? '<img class="tt-khoa-i" src="' + KTUI.a(TTA.khoa) + '" alt="" draggable="false">' : '') + '<b>PILOT</b><b>LV ' + TTC.moBac[b] + '</b>' + (b === 'do' ? '<small>WAVE ' + TTC.doWave + '</small>' : '');
    if (!n) { n = document.createElement('span'); n.className = 'tt-khoa-n'; c.appendChild(n); }
    if (n._h !== h) { n._h = h; n.innerHTML = h; }
    return c;
  },
  capLuoi() { document.querySelectorAll('#chon-luoi .c[data-id]').forEach(c => this.ganKhoa(c, c.dataset.id)); },
};

(function () {
  if (typeof KT === 'undefined' || typeof THEBAI === 'undefined') return;
  try { TT.st(); } catch (e) { console.error('TT', e); }
  if (!KT.NGUON.includes('level')) KT.NGUON.splice(KT.NGUON.length - 1, 0, 'level', 'journey'); // nhãn nguồn mới (tien-trinh N5)

  // ---- trận: sao lớn nhất + số ụ 5★ cùng lúc trên bàn người chơi ----
  if (typeof batDau === 'function') { const g = batDau; batDau = function () { TT.tr = { sao: 0, s5: 0 }; return g.apply(this, arguments); }; }
  if (typeof ghep === 'function') {
    const g = ghep;
    ghep = function (B, a, b, ep) {
      const th = typeof laGhepThat === 'function' ? laGhepThat(a, b, ep) : true, r = g.apply(this, arguments);
      try {
        if (r && !ep && th && TT.tr && b && b.ban === 0 && G.ban[0] && !G.ban[0].ai) {
          const T = G.ban[0].t[b.o]; TT.tr.sao = Math.max(TT.tr.sao, (T && T.sao) | 0);
          TT.tr.s5 = Math.max(TT.tr.s5, G.ban[0].t.filter(x => x && (x.sao | 0) >= 5).length);
        }
      } catch (e) { }
      return r;
    };
  }
  // ---- hết trận (bọc ngoài KT.ketTran của kinhte.js + manh.js): XP, hành trình, nhiệm vụ tuần ----
  const kt = KT.ketTran;
  KT.ketTran = function (k, m) {
    let kl = 0, tran = null, trums = [];
    try { kl = TT.kyLuc(); tran = KT.tran && Object.assign({}, KT.tran); trums = Object.keys((typeof MH !== 'undefined' && MH.tran) || {}).filter(id => typeof TRUM === 'undefined' || TRUM[id]); } catch (e) { }
    const r = kt.apply(this, arguments); if (!r) return r;
    try { r.tt = TT.ketTran(k, m, kl, tran, trums); KT.luu(); } catch (e) { console.error('TT', e); }
    return r;
  };
  // ---- đếm cho hành trình / nhiệm vụ tuần ----
  const nvNhan = KT.nvNhan;
  KT.nvNhan = function () { const ra = nvNhan.apply(this, arguments); if (ra) { try { const t = TT.st(); t.dem.nvd = (t.dem.nvd | 0) + 1; TT.nvtCong('nvd', 1); KT.luu(true); } catch (e) { } } return ra; };
  const spMua = KT.spMua;
  KT.spMua = function (i) { let free = true; try { const o = KT.sp()[i]; free = !o || !!o.free; } catch (e) { } const ra = spMua.apply(this, arguments); if (ra && !free) { try { const t = TT.st(); t.dem.sp = (t.dem.sp | 0) + 1; KT.luu(true); } catch (e) { } } return ra; };
  const nang = THEBAI.nang;
  THEBAI.nang = function (id) { const ok = nang.apply(this, arguments); if (ok) { try { const t = TT.st(); t.dem.nang = (t.dem.nang | 0) + 1; if (THEBAI.bac(id) === 'vang') t.dem.nangV = (t.dem.nangV | 0) + 1; KT.luu(true); } catch (e) { } } return ok; };
  const co = KT.coNhan;
  KT.coNhan = function () { const c = co.apply(this, arguments); try { if (TT.coNhan()) c.nv = true; } catch (e) { } return c; };
  // ---- gộp hồ sơ Firebase ----
  const gop = KT.gop;
  KT.gop = function (o) {
    let a = null, b = null; try { a = JSON.parse(JSON.stringify(TT.st())); b = o && o.kt && o.kt.cp; } catch (e) { }
    const x = gop.apply(this, arguments);
    try { const s = KT.doc(); if (!s.cp || typeof s.cp !== 'object') s.cp = a; TT.gop(a, b || null); KT.luu(true); } catch (e) { console.error('TT', e); }
    return x;
  };

  // ---- KHOÁ BẬC trong bộ bài ----
  if (typeof UI !== 'undefined') {
    const tc = UI.theChon; UI.theChon = function (r) { const c = tc.apply(this, arguments); try { TTUI.ganKhoa(c, r && r.id); } catch (e) { } return c; };
    const cu = UI.chonU; UI.chonU = function (id) { if (TT.khoa(id) && !UI.chon.includes(id)) { try { SND.nut(); } catch (e) { } return UI.nhac(TT.chuKhoa(id)); } return cu.apply(this, arguments); };
    const vc = UI.veChon; UI.veChon = function () { const x = vc.apply(this, arguments); try { TTUI.capLuoi(); } catch (e) { } return x; };
  }
  if (typeof DK !== 'undefined' && DK.loi) { const l = DK.loi; DK.loi = function (deck, id) { if (TT.khoa(id) && !(deck || []).includes(id)) return TT.chuKhoa(id); return l.apply(this, arguments); }; }
  if (typeof DC !== 'undefined') {
    // chạm ụ khoá: mở trang chi tiết (xem kỹ năng/chỉ số được, nút "Locked" + điều kiện — không bán mở sớm), không vào bộ
    if (DC.chamThe) { const ct = DC.chamThe; DC.chamThe = function (c) { const id = c && c.dataset && c.dataset.id; if (id && TT.khoa(id) && !UI.chon.includes(id)) { this.am(); if (typeof UP !== 'undefined' && UP.mo) UP.mo(id, c); else UI.nhac(TT.chuKhoa(id)); return; } return ct.apply(this, arguments); }; }
    if (DC.ngauNhien) { const nn = DC.ngauNhien; DC.ngauNhien = function () { return TT.voiMo(() => nn.apply(this, arguments)); }; }
  }
  if (typeof BOBAI !== 'undefined' && BOBAI.hopLe) { const hl = BOBAI.hopLe; BOBAI.hopLe = function (a) { return hl.apply(this, arguments) && a.deck.every(id => !TT.khoa(id)); }; }
  if (typeof UP !== 'undefined' && UP.capNutBo) { // trang chi tiết ụ: nút thêm vào bộ → "Locked" + điều kiện
    const cn = UP.capNutBo;
    UP.capNutBo = function () {
      const x = cn.apply(this, arguments);
      try { if (!this.mv && this.id && TT.khoa(this.id) && !UI.chon.includes(this.id)) { const nut = this.el.querySelector('.up-nut'); nut.querySelector('.up-nut-chu').textContent = (typeof UP_TXT !== 'undefined' && UP_TXT.locked) || 'Locked'; nut.querySelector('.up-nut-so').textContent = TT.dk(THEBAI.bac(this.id)); nut.disabled = true; nut.classList.remove('bo'); } } catch (e) { }
      return x;
    };
  }

  // ---- giao diện: HOME, tab NHIỆM VỤ, màn kết quả ----
  if (typeof KTUI !== 'undefined') {
    const vnv = KTUI.ve_nv;
    KTUI.ve_nv = function () {
      let h = vnv.apply(this, arguments), dau = '', tuan = '';
      try { dau = TTUI.ve_dau(); } catch (e) { console.error('TTUI', e); }
      try { tuan = TTUI.ve_tuan(); } catch (e) { console.error('TTUI', e); }
      const mk1 = '<div class="kt-muc"><b>LEGENDARY &', mk2 = this.muc('ACHIEVEMENTS'), mk = h.includes(mk1) ? mk1 : mk2;
      h = h.includes(mk) ? h.replace(mk, tuan + mk) : h + tuan;
      return dau + h;
    };
    const vkq = KTUI.veKetQua;
    KTUI.veKetQua = function (r) {
      const x = vkq.apply(this, arguments);
      try {
        const d = document.querySelector('#ketqua .tb-kq'); if (d && r && r.tt) {
          let e = d.querySelector('.tt-kq'); if (!e) { e = document.createElement('small'); e.className = 'kt-kq tt-kq'; d.appendChild(e); }
          e.textContent = 'PILOT XP +' + r.tt.xp + (r.tt.len ? ' · LEVEL ' + r.tt.cap + '!' : '');
        }
      } catch (e) { }
      return x;
    };
    const cn = KTUI.capNhat;
    KTUI.capNhat = function () { const x = cn.apply(this, arguments); try { TTUI.veHome(); } catch (e) { } return x; };
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-act^="tt-"]'); if (!b || b.disabled) return;
    const a = b.dataset.act, nut = () => { try { SND.nut(); } catch (er) { } };
    e.stopPropagation();
    const veLai = () => { try { if (KTUI.mo) KTUI.ve(); KTUI.capNhat(); TBUI.capLuoi(); } catch (er) { } };
    if (a === 'tt-dong') { TTUI.dong(); veLai(); }
    else if (a === 'tt-hjd') { nut(); TTUI.hjChon = +b.dataset.id; veLai(); }
    else if (a === 'tt-hjb') {
      const d = TT.hjDs()[+b.dataset.id - 1]; if (!d) return;
      if (d.r.chon) { nut(); TTUI.chon(d.r.chon.bac, d.r.chon.n, 'hj' + d.ngay, 'tt-hjc', d.ngay, 'DAY ' + d.ngay + ' REWARD'); return; }
      const ra = TT.hjNhan(d.ngay); veLai(); if (ra) TTUI.nhan(ra);
    }
    else if (a === 'tt-hjc') { const ra = TT.hjNhan(+b.dataset.k, b.dataset.id); TTUI.dong(); veLai(); if (ra) TTUI.nhan(ra); }
    else if (a === 'tt-qvmo') { nut(); TTUI.chon(TTC.quaVang.bac, TTC.quaVang.n, 'qv', 'tt-qvc', 'qv', 'LEVEL ' + TTC.quaVang.cap + ' GIFT'); }
    else if (a === 'tt-qvc') { const ra = TT.qvNhan(b.dataset.id); TTUI.dong(); veLai(); if (ra) TTUI.nhan(ra); }
    else if (a === 'tt-nvt') { const ra = TT.nvtNhan(b.dataset.id); veLai(); if (ra) TTUI.nhan(ra); }
    else if (a === 'tt-nvtb') { const ra = TT.nvtBonus(); veLai(); if (ra) TTUI.nhan(ra); }
  });
  // thông báo lên cấp: khi HOME đang hiện (không trong trận, không lớp phủ khác)
  setInterval(() => {
    try {
      const t = TT.st(); if (!t.bao.length) return;
      const chon = document.getElementById('chon'), hm = document.getElementById('hm'), kt = document.getElementById('kt'), p = document.getElementById('tt-phu'), tam = document.getElementById('hm-tam');
      if (!chon || chon.hidden || !hm || hm.hidden || hm.offsetParent === null || (kt && !kt.hidden) || (p && !p.hidden) || (tam && !tam.hidden && tam.offsetParent !== null) || (G.ban && G.ban.length && !G.ketThuc)) return;
      TTUI.bao();
    } catch (e) { }
  }, 700);
  const lam = () => { try { TTUI.veHome(); } catch (e) { } };
  if (document.getElementById('hm')) lam(); else document.addEventListener('DOMContentLoaded', lam);
})();
