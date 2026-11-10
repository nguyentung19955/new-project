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
  nguon: { trang: 'Any chest', xanh: 'Any chest', tim: 'Gold Chest', vang: 'Gold Chest · Event', do: 'Mythic Chest' },
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
  co(id) { return !!(id && ADMIN.la() && SKILLS[id]) || this.coThat(id); }, // ADMIN: sở hữu ẢO đủ ụ (không ghi sh.co / bản sao)
  coThat(id) { // sở hữu theo dữ liệu thật
    if (!id) return false;
    if (SHC.khoiDau.includes(id)) return true;
    const h = this.st(); if (h.co[id]) return true;
    try { const d = THEBAI.doc(); if (d.c && d.c[id]) return true; } catch (e) { }
    try { const t = KT.doc().cp; if (t && t.giu && t.giu[id]) return true; } catch (e) { }
    return false;
  },
  // NHÃN NEW (10/11 người dùng: "nhận tướng mới thì lần đầu vào deck hiện new ở thẻ đó"): sh.moi = ụ vừa SỞ HỮU lần đầu, chưa xem.
  //  Mất khi chạm/xem thẻ (xem nhanh / trang ụ) hoặc đưa vào bộ bài. Người cũ chuyển đổi: moi = {} (không NEW hàng loạt).
  dsMoi() { const h = this.st(); return Object.keys(h.moi).filter(id => SKILLS[id] && this.co(id)); },
  xemMoi(id) {
    let h; try { h = this.st(); } catch (e) { return false; }
    if (!id || !h.moi[id]) return false;
    delete h.moi[id]; try { KT.luu(true); } catch (e) { }
    try { document.querySelectorAll('#chon-luoi .c[data-id="' + id + '"]').forEach(c => c.classList.remove('sh-moi-c')); } catch (e) { }
    try { SHUI.cham(); } catch (e) { }
    return true;
  },
  // ghi sở hữu (gọi khi nhận bản sao); trả true nếu là ụ MỚI
  themCo(id) { if (!id || this.coThat(id)) return false; const h = this.st(); h.co[id] = 1; h.moi[id] = 1; return true; },
  moVoi(id, L) { if (L < this.capMoBac(id)) return false; return THEBAI.bac(id) !== 'do' || TT.kyLuc() >= TTC.doWave; },
  mo(id) { return ADMIN.la() || this.moVoi(id, TT.cap()); },
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
    if (!this.dsCo().length) return ra; // chưa nạp danh sách ụ
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
  // chấm đỏ (kt-cham, như nút SHOP/QUESTS) trên DECK + COLLECTION ở HOME khi còn ụ mới chưa xem
  cham() {
    let co = false; try { co = SH.dsMoi().length > 0; } catch (e) { }
    for (const n of document.querySelectorAll('#hm .hm-tab [data-act="hm-deck"], #hm .hm-tab [data-act="hm-bst"]')) {
      let i = n.querySelector(':scope > .sh-cham');
      if (!i) { if (!co || typeof KTA === 'undefined' || !KTA.cham) continue; i = document.createElement('img'); i.className = 'kt-cham sh-cham'; i.alt = ''; i.src = KTUI.a(KTA.cham); n.appendChild(i); }
      i.hidden = !co;
    }
  },
  // nhãn "NEW!" cho thẻ mới trong rương / túi trận
  moi: '<i class="sh-moi">NEW!</i>',

  // lớp phủ MỞ RƯƠNG ở màn kết quả (Rương Trận + rương mốc/trùm vừa nhận)
  phuKq(html, cls) {
    const kq = document.getElementById('wrap'); if (!kq) return null; // trong #wrap, trên #ketqua (z 22) và mọi bảng giới thiệu trong trận
    let p = document.getElementById('sh-phu');
    if (!p) { p = document.createElement('div'); p.id = 'sh-phu'; kq.appendChild(p); }
    p.className = 'kt-phu sh-phu ' + (cls || ''); p.innerHTML = '<div class="kt-phu-nen"></div><div class="kt-phu-tam">' + html + '</div>'; p.hidden = false;
    try { OT.quet(p); } catch (e) { }
    return p;
  },
  dongKq() { const p = document.getElementById('sh-phu'); if (p) { p.hidden = true; p.innerHTML = ''; } try { clearTimeout(KTUI._lat); KTUI._ruong = null; } catch (e) { } },
  // Rương Trận ở ô REWARDS của màn kết quả: ảnh rương + nút OPEN; thẻ mới có "NEW!"
  veKq(r) {
    const d = document.querySelector('#ketqua .tb-kq'); if (!d || !r) return;
    this._kq = r;
    d.querySelectorAll('.tb-kq-t:not(.mh-kq-t)').forEach((e, i) => { const x = r.the[i]; if (x && x.moi && !e.querySelector('.sh-moi')) e.insertAdjacentHTML('beforeend', this.moi); });
    if (!d.querySelector('.sh-kq-ru')) {
      const h = d.querySelector('.tb-kq-h');
      const b = '<button class="sh-kq-ru" data-act="sh-kq-mo" aria-label="Open battle chest"><img src="' + KTUI.a(KTA.ru.tran) + '" alt=""><b>OPEN</b></button>';
      if (h) h.insertAdjacentHTML('afterbegin', b);
    }
  },
  moKq() {
    const r = this._kq; if (!r) return;
    const tran = { k: 'tran', ten: 'BATTLE CHEST', the: r.the.map(x => ({ id: x.id, n: x.n, bac: x.bac || THEBAI.bac(x.id), moi: x.moi })).sort((a, b) => TIERS[a.bac].thuTu - TIERS[b.bac].thuTu) };
    KTUI.nhan({ vang: r.vang, ngoc: 0, the: [], ru: [tran].concat(this._kqRu || []) }, '', { phu: (h, c) => this.phuKq(h, c), dong: 'sh-dong' });
  },
};

(function () {
  if (typeof KT === 'undefined' || typeof THEBAI === 'undefined' || typeof TT === 'undefined') return;
  if (!KT.NGUON.includes('gift')) KT.NGUON.splice(KT.NGUON.length - 1, 0, 'gift');
  // khởi tạo sau khi nạp danh sách ụ: chuyển bản lưu (người cũ giữ ụ) + đánh dấu nhóm đang mở là đã báo
  const sanSang = () => { try { SH.st(); SH.baoMoi(); KT.luu(true); } catch (e) { console.error('SH', e); } };
  if (typeof UI !== 'undefined' && UI.init) { const g = UI.init; UI.init = async function () { const r = await g.apply(this, arguments); sanSang(); try { UI.veChon(); } catch (e) { } return r; }; }
  // gộp hồ sơ Firebase: sở hữu / đã báo / quà = OR
  const gop = KT.gop;
  KT.gop = function (o) {
    let a = null, b = null; try { a = JSON.parse(JSON.stringify(SH.st())); b = o && o.kt && o.kt.sh; } catch (e) { }
    const x = gop.apply(this, arguments);
    try { const s = KT.doc(); if (!s.sh || typeof s.sh !== 'object') s.sh = a; SH.gop(a, b || null); KT.luu(true); } catch (e) { console.error('SH', e); }
    return x;
  };
  // trang ụ: xem rồi → bỏ nhãn NEW
  if (typeof UP !== 'undefined' && UP.mo) { const g = UP.mo; UP.mo = function (id) { SH.xemMoi(id); return g.apply(this, arguments); }; }
  // xem nhanh (HOME) → bỏ NEW; đưa vào bộ bài (chạm / kéo / bộ mẫu / RANDOM — mọi đường đều vẽ lại ô bộ bài) → bỏ NEW
  if (typeof HM !== 'undefined' && HM.moXem) { const g = HM.moXem; HM.moXem = function (id) { SH.xemMoi(id); return g.apply(this, arguments); }; }
  if (typeof DC !== 'undefined' && DC.chamThe) { const g = DC.chamThe; DC.chamThe = function (c) { try { SH.xemMoi(c && c.dataset && c.dataset.id); } catch (e) { } return g.apply(this, arguments); }; } // chạm thẻ ở màn bộ bài (thêm / đổi)
  if (typeof UI !== 'undefined' && UI.veBoChon) { const g = UI.veBoChon; UI.veBoChon = function () { const x = g.apply(this, arguments); try { if (G.roster && G.roster.length) for (const id of UI.chon) SH.xemMoi(id); } catch (e) { } return x; }; }
  // HOME: số ụ ĐÃ CÓ trên nút bộ sưu tập
  if (typeof HM !== 'undefined' && HM.veHome) {
    const g = HM.veHome;
    HM.veHome = function () { const x = g.apply(this, arguments); try { const e = document.getElementById('hm-bst-so'), d = SH.dem(); if (e && d.tong) e.textContent = d.co + '/' + d.tong + ' TURRETS'; SHUI.cham(); } catch (er) { } return x; };
  }
  // ---- màn bộ bài / bộ sưu tập: lọc ĐÃ CÓ / CHƯA CÓ / CHƯA MỞ + xếp theo CẤP PHI CÔNG + đếm ----
  if (typeof BOBAI !== 'undefined') {
    const ap = BOBAI.ap;
    BOBAI.ap = function () {
      const x = ap.apply(this, arguments);
      try {
        const loc = SH.st().loc, luoi = document.getElementById('chon-luoi'); if (!luoi || loc === 'all') return x;
        let tong = 0;
        luoi.querySelectorAll('.luoi').forEach(g => {
          let n = 0;
          g.querySelectorAll('.c[data-id]').forEach(c => { if (!c.hidden && SH.tt(c.dataset.id) !== loc) c.hidden = true; if (!c.hidden) n++; });
          g.hidden = !n; tong += n; const h = g.previousElementSibling; if (h && h.classList.contains('nhom')) h.hidden = !n;
        });
        let ko = document.getElementById('bb-trong');
        if (!tong) { if (!ko) { ko = document.createElement('div'); ko.id = 'bb-trong'; luoi.appendChild(ko); } ko.textContent = 'No turret matches. Open FILTER and tap RESET.'; ko.hidden = false; }
        else if (ko) ko.hidden = true;
      } catch (e) { console.error('SH', e); }
      return x;
    };
  }
  if (typeof UI !== 'undefined' && UI.veChon) {
    const vc = UI.veChon;
    UI.veChon = function () {
      if (this.xep !== 'cap') return vc.apply(this, arguments);
      this.xep = 'bac'; let x; try { x = vc.apply(this, arguments); } finally { this.xep = 'cap'; }
      try { // XẾP THEO CẤP PHI CÔNG: mỗi nhóm 1 tiêu đề "PILOT LV n · chủ đề · đã có x/y"
        const luoi = document.getElementById('chon-luoi'); if (!luoi) return x;
        luoi.querySelectorAll(':scope > .nhom, :scope > .luoi').forEach(e => e.remove());
        const L = TT.cap(), ds = SH.dsCo(), con = new Set(ds), ten = (id) => (G.rosterMap[id] || {}).ten || id;
        const caps = Object.keys(SHC.nhom).map(Number).sort((a, b) => a - b);
        const nhom = caps.map(c => [c, SH.nhomCap(c)]);
        const le = ds.filter(id => !SH.capMo(id)); if (le.length) nhom.push([0, le]);
        for (const [c, rs] of nhom) {
          if (!rs.length) continue; rs.forEach(id => con.delete(id));
          const h = document.createElement('div'), mo = c && c <= L, co = rs.filter(id => SH.co(id)).length;
          h.className = 'nhom sh-nh' + (mo ? '' : ' sh-nh-khoa'); h.style.setProperty('--m', mo ? '#ffd677' : '#8a93a6');
          h.innerHTML = '<img class="nh-i" src="assets/ui_lv.png" alt=""><b>' + (c ? 'PILOT LV ' + c : 'OTHER') + '</b><span>' + (c ? SHC.nhom[c].ten + ' · ' : '') + co + '/' + rs.length + ' OWNED</span>';
          luoi.appendChild(h);
          const g = document.createElement('div'); g.className = 'luoi';
          for (const id of rs.slice().sort((a, b) => TIERS[THEBAI.bac(a)].thuTu - TIERS[THEBAI.bac(b)].thuTu || ten(a).localeCompare(ten(b), 'en'))) g.appendChild(this.theChon(G.rosterMap[id]));
          luoi.appendChild(g);
        }
        const ko = document.getElementById('bb-trong'); if (ko) luoi.appendChild(ko);
        this.veBoChon();
        BOBAI.ap(); TBUI.capLuoi(); TTUI.capLuoi();
        requestAnimationFrame(() => luoi.querySelectorAll('.ten').forEach(e => fitText(e, 10.5, 7)));
        if (typeof DKD !== 'undefined') DKD.ve();
      } catch (e) { console.error('SH', e); }
      return x;
    };
  }
  if (typeof DKD !== 'undefined' && DKD.dem) {
    const dm = DKD.dem;
    DKD.dem = function () {
      const x = dm.apply(this, arguments);
      try { const nh = document.getElementById('dkd-nhan'), d = SH.dem(); if (nh) nh.innerHTML = '<b>OWNED</b> <span>' + d.co + '</span> · <b>UNLOCKED</b> <span>' + d.mo + '</span> · <b>TOTAL</b> <span>' + d.tong + '</span>'; } catch (e) { }
      return x;
    };
  }
  if (typeof HM !== 'undefined' && HM.moLoc) {
    const ml = HM.moLoc;
    HM.moLoc = function () {
      const x = ml.apply(this, arguments);
      try {
        const tam = document.getElementById('hm-tam'), loc = SH.st().loc, chip = (k, t) => '<button class="hm-chip' + (loc === k ? ' on' : '') + '" data-act="sh-loc" data-k="' + k + '">' + t + '</button>';
        const nh = [...tam.querySelectorAll('.hm-loc-nh')].find(e => e.textContent.trim() === 'SORT' || e.textContent.trim() === 'SẮP XẾP') || tam.querySelectorAll('.hm-loc-nh')[2];
        if (nh && !tam.querySelector('[data-act="sh-loc"]')) {
          const d = SH.dem();
          nh.insertAdjacentHTML('beforebegin', '<div class="hm-loc-nh">COLLECTION</div><div class="hm-chips c2 sh-chips">' + chip('all', 'ALL') + chip('co', 'OWNED <small>' + d.co + '</small>') + chip('chua', 'NOT OWNED <small>' + (d.mo - d.co) + '</small>') + chip('khoa', 'LOCKED <small>' + (d.tong - d.mo) + '</small>') + '</div>');
          const xep = nh.nextElementSibling; if (xep && !xep.querySelector('[data-k="cap"]')) { xep.insertAdjacentHTML('beforeend', '<button class="hm-chip' + (UI.xep === 'cap' ? ' on' : '') + '" data-act="hm-loc-xep" data-k="cap">PILOT LV</button>'); xep.classList.replace('c3', 'c2'); }
        }
        const v = tam.querySelector('.hm-cai2 .vang'); if (v) v.textContent = HM.soLoc();
      } catch (e) { console.error('SH', e); }
      return x;
    };
  }
  // ---- màn kết quả: Rương Trận (mở bằng lật thẻ) + rương mốc / trùm vừa nhận ----
  if (typeof TBUI !== 'undefined' && TBUI.veThuong) {
    const vt = TBUI.veThuong;
    TBUI.veThuong = function (k) { const x = vt.apply(this, arguments); try { SHUI._kqRu = []; const m = typeof KQ !== 'undefined' && KQ.m; SHUI.veKq(m && m._thuong); } catch (e) { console.error('SH', e); } return x; };
  }
  if (typeof KTUI !== 'undefined' && KTUI.veKetQua) {
    const vk = KTUI.veKetQua;
    KTUI.veKetQua = function (r) { const x = vk.apply(this, arguments); try { SHUI._kqRu = []; for (const g of (r && r.mh) || []) SHUI._kqRu.push(...((g.ra && g.ra.ru) || [])); } catch (e) { } return x; };
  }
  // giao diện anime B3 (ui-anime.js, UA): nhãn đếm + tiêu đề nhóm bậc theo SỞ HỮU (thay "PLAYABLE n" / "Unlocks at Pilot Level n" của khoá bậc cũ)
  const uaBoc = () => {
    if (typeof UA === 'undefined' || UA._sh) return; UA._sh = 1;
    UA.dem = function () {
      if (!this.bat) return;
      const nh = document.getElementById('dkd-nhan'); if (!nh) return;
      const d = SH.dem(), k = d.co + '/' + d.mo + '/' + d.tong;
      if (nh.dataset.ua !== k || !nh.querySelector('i')) { nh.dataset.ua = k; nh.innerHTML = '<b>OWNED</b> <span>' + d.co + '</span> <i>·</i> <b>UNLOCKED</b> <span>' + d.mo + '</span> <i>·</i> <b>TOTAL</b> <span>' + d.tong + '</span>'; }
    };
    UA.nhom = function () {
      if (!this.bat) return;
      document.querySelectorAll('#chon-luoi > .nhom:not(.sh-nh)').forEach(h => {
        let l = h.nextElementSibling; while (l && !l.classList.contains('luoi')) l = l.nextElementSibling;
        const ds = l ? [...l.querySelectorAll('.c[data-id]')].map(c => c.dataset.id) : []; if (!ds.length) return;
        const b = THEBAI.bac(ds[0]); if (h.dataset.uab !== b) h.dataset.uab = b;
        const co = ds.filter(id => SH.co(id)).length, chu = co < ds.length ? co + '/' + ds.length + ' OWNED' : '';
        let e = h.querySelector(':scope > em.ua-mo');
        if (!chu) { if (e) e.remove(); h.classList.remove('ua-khoa'); return; }
        if (!e) { e = document.createElement('em'); e.className = 'ua-mo'; h.appendChild(e); }
        if (e._c !== chu) { e._c = chu; e.textContent = chu; }
        h.classList.toggle('ua-khoa', co === 0);
      });
    };
    try { UA.nhom(); UA.dem(); } catch (e) { }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(uaBoc, 0)); else uaBoc();
  if (typeof batDau === 'function') { const g = batDau; batDau = function () { try { SHUI.dongKq(); } catch (e) { } return g.apply(this, arguments); }; } // vào trận mới: đóng lớp Rương Trận
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-act^="sh-"]'); if (!b || b.disabled) return;
    const a = b.dataset.act; e.stopPropagation();
    try { SND.nut(); } catch (er) { }
    if (a === 'sh-kq-mo') SHUI.moKq();
    else if (a === 'sh-dong') SHUI.dongKq();
    else if (a === 'sh-loc') { SH.st().loc = b.dataset.k; KT.luu(true); BOBAI.ap(); HM.locLai(); }
  });
  // quà hướng dẫn (Ice Blade): tặng lặng lẽ khi đã xong / bỏ qua hướng dẫn — không bật bảng (tránh chồng bảng lên cấp); thẻ có nhãn NEW! trong bộ sưu tập
  setInterval(() => {
    try { const h = SH.st(); if (h.qua.hd || !TT.hdXong() || !G.roster || !G.roster.length) return; if (SH.tang('hd')) { KT.luu(true); TBUI.capLuoi(); TTUI.capLuoi(); } } catch (e) { }
  }, 900);
})();
