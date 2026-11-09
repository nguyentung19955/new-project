// ASTRAL ARSENAL (Turret Merge) — GACHA THU THẬP: SỞ HỮU Ụ + MỞ NHÓM THEO CẤP PHI CÔNG (người dùng chốt 09/11 18:11–18:19:
//  "đây là game gacha thu thập thẻ bài, phải thu thập dần dần" — kiểu Destiny Child: Defense War). Thiết kế + số liệu:
//  docs/demo-hop-tuong/tuvan/gacha-thu-thap/BANG-MO-NHOM.md · kinh tế docs/demo-hop-tuong/tuvan/shop/KINH-TE.md §11 · kiểm tools/thap-kt-so-huu.js.
//  · SỞ HỮU: chỉ ụ ĐÃ CÓ (≥ 1 bản sao từng nhận) mới vào bộ bài / bộ mẫu / bộ ngẫu nhiên. Người mới có sẵn 10 ụ (8 Trắng + 2 Xanh, SHC.khoiDau);
//    hướng dẫn + Hành trình 7 ngày tặng thêm ụ cụ thể (SHC.qua). Sở hữu = turret_kt.sh.co[id] ∪ có mục trong turret_the.c ∪ cp.giu (tientrinh) ∪ ụ khởi đầu.
//  · MỞ NHÓM: mỗi cấp phi công mở 1 NHÓM ụ cụ thể (SHC.nhom, 3–6 ụ có chủ đề chung) vào "bể rơi" của rương / cửa hàng / thưởng;
//    ụ chưa mở KHÔNG rơi. Đỏ cần thêm kỷ lục ≥ wave 30 (TTC.doWave). Ụ đã có luôn nhận thêm bản sao (để lên cấp thẻ) dù nhóm chưa mở.
//  · 3 TRẠNG THÁI trên lưới bộ bài / bộ sưu tập: ĐÃ CÓ · CHƯA CÓ (mờ + nguồn kiếm) · CHƯA MỞ (mờ + "PILOT LV n"); chạm vẫn mở trang ụ.
//  · NGƯỜI CHƠI CŨ: không mất gì — mọi ụ có bản sao/cấp thẻ, đang trong bộ bài / bộ mẫu lúc chuyển → sở hữu (ghi vào sh.co một lần).
//  · Lưu turret_kt.sh = { v, co:{id:1}, moi:{id:1}, bao:{id:1}, qua:{k:1}, loc }; gộp hồ sơ Firebase: OR.
//  · Không đổi luật trong trận; bộ máy (bạn co-op / đối thủ PVP) không đổi; online gửi bộ bài như cũ.
'use strict';

const SHC = {
  // 10 ụ khởi đầu: đủ vai — bắn thường (Gatling, Revolver), bắn tỉa (Sniper), làm chậm (Frost), lan (Tesla), sinh mana (Mana Core),
  // đánh dấu (Venom), hỗ trợ (Armor Breaker, Amplifier), tia ramp (Laser). Bộ hướng dẫn (tia, lien, bang, set, sungluc) nằm trong đây.
  khoiDau: ['tia', 'lien', 'sungluc', 'bang', 'set', 'mana', 'doc', 'phagiap', 'khuech', 'laser'],
  // quà ụ CỤ THỂ: hướng dẫn + Hành trình 7 ngày (ngày 1 / 4 / 6) — tặng thẳng (không phải rơi ngẫu nhiên)
  qua: { hd: 'kiembang', hj1: 'cuongno', hj4: 'bao', hj6: 'epxung' },
  // NHÓM MỞ THEO CẤP PHI CÔNG: cấp → { ten (chủ đề), ds }. Cấp 1 = khởi đầu. Đỏ từ cấp 12 (thêm kỷ lục wave 30).
  nhom: {
    1: { ten: 'Starter Arsenal', ds: ['tia', 'lien', 'sungluc', 'bang', 'set', 'mana', 'doc', 'phagiap', 'khuech', 'laser'] },
    2: { ten: 'Spread & Traps', ds: ['phun', 'bomhen', 'kiembang', 'vungdoc'] },
    3: { ten: 'Critical Strike', ds: ['xucxac', 'bua', 'nam', 'chimang', 'cuongno'] },
    4: { ten: 'Heavy Fire', ds: ['maychem', 'mortar', 'radar', 'no5', 'bao'] },
    5: { ten: 'Frost & Mana', ds: ['lanhgia', 'nhanmana', 'hutmana', 'baotuyet', 'santhuong'] },
    6: { ten: 'First Legends', ds: ['min', 'lienket', 'epxung', 'railgun', 'soi', 'aten'] },
    7: { ten: 'Merge Bonus', ds: ['drone', 'loa', 'nhanban', 'anhsang'] },
    8: { ten: 'One Big Shot', ds: ['nangluong', 'docton', 'thaukinh', 'nemesis'] },
    9: { ten: 'Guardians', ds: ['khien', 'taylo', 'nhieusong', 'thanhdia'] },
    10: { ten: 'Teamwork', ds: ['tuthan', 'nayda', 'dongbo', 'hydra'] },
    11: { ten: 'Tricksters', ds: ['mimic', 'tron', 'dichchuyen', 'xaotron'] },
    12: { ten: 'Eternal Frost', ds: ['kepha', 'nhatthuc', 'lophanung'] },
    13: { ten: 'Starlight', ds: ['nangsao', 'ngoisao', 'hasao'] },
    14: { ten: 'Firestorm', ds: ['cuuvi', 'bienmau', 'overlord'] },
    15: { ten: 'Path Control', ds: ['khoathoigian', 'wallgen', 'marionette', 'blackhole'] },
    16: { ten: 'Swarm', ds: ['combo', 'sinhdoi', 'chuato'] },
    17: { ten: 'Merge Workshop', ds: ['luutru', 'congap', 'vughep'] },
    18: { ten: 'Star Forge', ds: ['loren', 'hopca', 'khoisinh'] },
    19: { ten: 'Resonance', ds: ['cauvong', 'xuonganh', 'luoicheo', 'thacmana'] },
    20: { ten: 'Big Guns', ds: ['canon', 'orbital', 'leviathan'] },
    21: { ten: 'Shapeshifters', ds: ['hopbi', 'tienhoa', 'saochep'] },
    22: { ten: 'Dark Wards', ds: ['guongcong', 'nguyenrua', 'ngaithoigian'] },
    23: { ten: 'Dragonfire', ds: ['lualien', 'mauhut', 'ronglua'] },
    24: { ten: 'Wild Cards', ds: ['tudo', 'pandora', 'cobac'] },
  },
  // nhãn nguồn kiếm (thẻ CHƯA CÓ) theo bậc — chỉ nêu nơi rơi, không nêu cách chơi
  nguon: {
    trang: 'Chests · Battle chest', xanh: 'Chests · Battle chest', tim: 'Gold Chest · Battle chest',
    vang: 'Gold Chest · Event', do: 'Mythic Chest · Rare drop',
  },
};

const SH = {
  _cap: null, // bảng id → cấp mở (dựng 1 lần)
  bang() {
    if (this._cap) return this._cap;
    const m = {}; for (const L in SHC.nhom) for (const id of SHC.nhom[L].ds) if (!m[id]) m[id] = +L;
    return (this._cap = m);
  },
  capMo(id) { return this.bang()[id] || 0; }, // 0 = ụ không có trong bảng (ụ mới thêm sau): mở cùng bậc của nó ở cấp đầu bậc (TTC.moBac)
  capMoBac(id) { const c = this.capMo(id); if (c) return c; const b = THEBAI.bac(id); return Math.max(1, (TTC.moBac[b] | 0) || 1); },
  dsCo() { return (typeof G !== 'undefined' && G.roster || []).filter(r => SKILLS[r.id]).map(r => r.id); },

  // ---------- lưu ----------
  st() {
    const s = KT.doc(); let h = s.sh;
    if (!h || typeof h !== 'object' || Array.isArray(h)) { h = s.sh = this.taoMoi(); try { localStorage.setItem(KT.KEY, JSON.stringify(s)); } catch (e) { } }
    for (const k of ['co', 'moi', 'bao', 'qua']) if (!h[k] || typeof h[k] !== 'object' || Array.isArray(h[k])) h[k] = {};
    if (!['all', 'co', 'chua', 'khoa'].includes(h.loc)) h.loc = 'all';
    return h;
  },
  // chuyển lần đầu: ụ khởi đầu + mọi ụ đang có bản sao/cấp + đang trong bộ bài / 6 bộ mẫu (người chơi cũ không mất gì)
  taoMoi() {
    const h = { v: 1, co: {}, moi: {}, bao: {}, qua: {}, loc: 'all' };
    for (const id of SHC.khoiDau) h.co[id] = 1;
    try { const d = THEBAI.doc(); for (const id in d.c || {}) h.co[id] = 1; } catch (e) { }
    try { for (const id of TT.boDangDung()) h.co[id] = 1; } catch (e) { }
    try { const t = KT.doc().cp; if (t && t.giu) for (const id in t.giu) if (t.giu[id]) h.co[id] = 1; } catch (e) { }
    h.chuyen = 1; // cờ: các nhóm đang mở lúc chuyển không báo lại (xem baoMoi)
    return h;
  },

  // ---------- sở hữu / mở ----------
  co(id) {
    if (!id) return false;
    if (SHC.khoiDau.includes(id)) return true;
    const h = this.st(); if (h.co[id]) return true;
    try { const d = THEBAI.doc(); if (d.c && d.c[id]) return true; } catch (e) { }
    try { const t = KT.doc().cp; if (t && t.giu && t.giu[id]) return true; } catch (e) { }
    return false;
  },
  // ghi sở hữu (gọi khi nhận bản sao); trả true nếu là ụ MỚI
  themCo(id) { if (!id || this.co(id)) return false; const h = this.st(); h.co[id] = 1; h.moi[id] = 1; return true; },
  moVoi(id, L) { if (L < this.capMoBac(id)) return false; return THEBAI.bac(id) !== 'do' || TT.kyLuc() >= TTC.doWave; },
  mo(id) { return this.moVoi(id, TT.cap()); },
  trongPool(id) { return !!(id && SKILLS[id] && (this.mo(id) || this.co(id))); },
  pool(b) { return this.dsCo().filter(id => THEBAI.bac(id) === b && this.trongPool(id)).sort(); },
  // trạng thái thẻ: 'co' ĐÃ CÓ · 'chua' CHƯA CÓ (đã mở) · 'khoa' CHƯA MỞ
  tt(id) { return this.co(id) ? 'co' : this.mo(id) ? 'chua' : 'khoa'; },
  dem() { const ds = this.dsCo(); let co = 0, mo = 0; for (const id of ds) { const c = this.co(id); if (c) co++; if (c || this.mo(id)) mo++; } return { co, mo, tong: ds.length }; },
  nguon(id) { return SHC.nguon[THEBAI.bac(id)] || ''; },
  dk(id) { const L = this.capMoBac(id); return THEBAI.bac(id) === 'do' ? 'Pilot Level ' + L + ' and best wave ' + TTC.doWave : 'Pilot Level ' + L; },
  chuKhoa(id) { return this.tt(id) === 'khoa' ? 'Unlocks at ' + this.dk(id) : 'Not owned yet · ' + this.nguon(id); },
  // nhóm mở ở cấp L (ụ có kỹ năng)
  nhomCap(L) { const n = SHC.nhom[L]; return n ? n.ds.filter(id => SKILLS[id] && G.rosterMap[id]) : []; },
  // ụ vừa vào bể rơi mà chưa báo (lên cấp / đạt wave 30 cho Đỏ) → đánh dấu đã báo
  baoMoi() {
    const h = this.st(), ra = [];
    if (h.chuyen) { for (const id of this.dsCo()) if (this.mo(id)) h.bao[id] = 1; delete h.chuyen; return ra; }
    for (const id of this.dsCo()) if (!h.bao[id] && this.mo(id)) { h.bao[id] = 1; if (this.capMo(id) > 1) ra.push(id); }
    return ra.sort((a, b) => this.capMo(a) - this.capMo(b) || TIERS[THEBAI.bac(a)].thuTu - TIERS[THEBAI.bac(b)].thuTu);
  },
  // quà ụ cụ thể (1 lần): trả { id, n } hoặc null
  tang(k) {
    const h = this.st(), id = SHC.qua[k]; if (!id || h.qua[k] || !SKILLS[id]) return null;
    h.qua[k] = 1; KT.themBan(id, 1); return { id, n: 1 };
  },
  // gộp hồ sơ Firebase (OR)
  gop(a, b) {
    const h = this.st();
    for (const y of [a, b]) { if (!y || typeof y !== 'object') continue; for (const k of ['co', 'bao', 'qua']) for (const i in (y[k] || {})) if (y[k][i]) h[k][i] = 1; }
  },
};

// ===================================================== GIAO DIỆN =====================================================
const SHUI = {
  ten: (id) => (typeof KTUI !== 'undefined' ? KTUI.ten(id) : (G.rosterMap[id] || {}).ten || id),
  // nhãn trên thẻ lưới (3 trạng thái). Trả '' khi đã có.
  nhan(id) {
    const t = SH.tt(id);
    if (t === 'co') return '';
    if (t === 'chua') return '<b class="sh-chua-t">NOT OWNED</b><small>' + SH.nguon(id) + '</small>';
    const L = SH.capMoBac(id);
    return '<i class="sh-o" aria-hidden="true"></i><b>PILOT</b><b>LV ' + L + '</b>' + (THEBAI.bac(id) === 'do' ? '<small>WAVE ' + TTC.doWave + '</small>' : '');
  },
  // danh sách ụ (ảnh + tên) cho bảng lên cấp
  dsU(ds) { return '<span class="sh-ds">' + ds.map(id => '<span class="sh-u b-' + THEBAI.bac(id) + '">' + OT.mini(id) + '<small>' + this.ten(id) + '</small></span>').join('') + '</span>'; },
  // nhãn "NEW!" cho thẻ mới trong rương / túi trận
  moi: '<i class="sh-moi">NEW!</i>',
};
