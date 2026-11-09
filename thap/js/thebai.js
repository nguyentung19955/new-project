// TURRET MERGE — CẤP THẺ NGOÀI TRẬN kiểu DCDW (Destiny Child: Defense War) — xem docs/demo-hop-tuong/DCDW-TANG-SUC-MANH.md
//  · Mỗi thẻ (ụ) có CẤP: cấp đầu theo độ hiếm (Thường 1 · Hiếm 3 · Sử thi 6 · Huyền thoại 9 · Cổ đại 11), tối đa 15.
//  · Lên cấp = đủ BẢN SAO (thẻ trùng) + VÀNG. Cấp càng cao càng cần nhiều bản sao / vàng.
//  · Mỗi cấp trên cấp đầu: +% sát thương (và độ mạnh hỗ trợ ×½) — hsThe() trong data.js.
//  · Nguồn bản sao + vàng: TÚI THƯỞNG cuối mỗi trận (mọi chế độ, trừ hướng dẫn / trận thử ?mana=).
//  · Lưu localStorage 'turret_the' {v, vang, c: {id: {lv, n}}}. Bản lưu cũ (bộ bài, kỷ lục…) không đụng tới;
//    lần đầu: tặng vàng khởi đầu + quy đổi kỷ lục cũ → vàng (không xoá gì).
'use strict';

const THE = {
  lvDau: { trang: 1, xanh: 3, tim: 6, vang: 9, do: 11 },
  lvMax: 15,
  // 08/11 (người dùng duyệt, CHATGPT-SPEC A0): thẻ VÀNG / ĐỎ lên tới LV17 (2 cấp mới cần thêm bản sao + vàng ở cuối bảng); bậc khác vẫn tối đa 15
  lvMaxBac: { vang: 17, do: 17 },
  maxLv(bac) { return (this.lvMaxBac && this.lvMaxBac[bac]) || this.lvMax; },
  pct: { trang: 0.04, xanh: 0.05, tim: 0.07, vang: 0.05, do: 0.05 }, // VÀNG/ĐỎ (08/11): theo VAI TRÒ — Tấn công +5% ST +2% tốc · Hỗ trợ +4% · Đặc biệt/Khống chế +3% mỗi cấp (CAP_VD trong data.js) // +sát thương mỗi cấp trên cấp đầu (MAX ≈ +56–63% mọi bậc)
  // bản sao cần cho lần lên cấp thứ k+1 (k = số cấp đã lên kể từ cấp đầu)
  saoCan: {
    trang: [2, 4, 8, 15, 25, 40, 60, 90, 130, 180, 240, 320, 420, 550],
    xanh: [2, 4, 7, 12, 20, 32, 48, 70, 100, 140, 190, 250],
    tim: [2, 3, 5, 8, 12, 18, 26, 36, 50],
    vang: [1, 2, 3, 5, 8, 12, 18, 26],
    do: [1, 2, 3, 5, 8, 12],
  },
  // vàng cho cấp L → L+1 (theo cấp TUYỆT ĐỐI như DCDW/Random Dice: thẻ hiếm khởi đầu cao nên lên cấp đắt ngay)
  vangCan: [0, 20, 50, 100, 200, 400, 800, 1500, 2500, 4000, 6000, 9000, 13000, 18000, 25000, 35000, 50000],
  // túi thưởng: tỉ lệ độ hiếm mỗi lượt rút + số bản sao mỗi lượt
  // (06/11 người dùng: đỏ + vàng phải cày như DCDW — xem tuvan/shop/KINH-TE.md) trước 55/28/12/4,5/0,5
  tiLe: [['trang', 58], ['xanh', 29], ['tim', 11], ['vang', 1.8], ['do', 0.2]],
  soBan: { trang: [3, 6], xanh: [2, 4], tim: [1, 2], vang: [1, 1], do: [1, 1] },
  kyNang: KY_NANG_CAP, // bảng kỹ năng theo cấp thẻ (data.js)
};

const THEBAI = {
  KEY: 'turret_the',
  d: null,
  doc() {
    if (this.d) return this.d;
    let d = null;
    try { d = JSON.parse(localStorage.getItem(this.KEY) || 'null'); } catch (e) { try { localStorage.setItem(this.KEY + '_hong', localStorage.getItem(this.KEY)); } catch (e2) { } }
    if (!d || typeof d !== 'object' || !d.c) {
      // DI CHUYỂN bản lưu cũ: chưa có cấp thẻ → mọi thẻ ở cấp đầu, vàng khởi đầu + quy đổi kỷ lục
      let best = 0;
      try { const b = JSON.parse(localStorage.getItem('turret_best') || '{}') || {}; for (const k in b) best = Math.max(best, (b[k] && b[k].wave) | 0); } catch (e) { }
      d = { v: 1, vang: 300 + Math.min(3000, best * 50), c: {}, moi: 1 };
    }
    d.vang = Math.max(0, Math.floor(+d.vang || 0));
    this.d = d; this.luu();
    return d;
  },
  luu() { try { localStorage.setItem(this.KEY, JSON.stringify(this.d)); } catch (e) { } },
  bac(id) { const r = typeof G !== 'undefined' && G.rosterMap && G.rosterMap[id]; return (r && r.bac) || 'trang'; },
  // trạng thái 1 thẻ: lv (tuyệt đối), n (bản sao đang có), can (bản sao cần), vang (vàng cần), max
  the(id) {
    const d = this.doc(), b = this.bac(id), dau = THE.lvDau[b], o = d.c[id] || {};
    const lvM = THE.maxLv(b), lv = Math.max(dau, Math.min(lvM, (o.lv | 0) || dau)), n = Math.max(0, o.n | 0), k = lv - dau;
    const max = lv >= lvM || k >= THE.saoCan[b].length;
    return { id, bac: b, lv, dau, n, k, max, can: max ? 0 : THE.saoCan[b][k], vang: max ? 0 : THE.vangCan[lv], pct: k * THE.pct[b], pctSau: (k + 1) * THE.pct[b] };
  },
  coThe(t) { return !t.max && t.n >= t.can; },          // đủ bản sao (thanh xanh đầy — như DCDW)
  nangDuoc(t) { return this.coThe(t) && this.doc().vang >= t.vang; },
  nang(id) {
    const t = this.the(id); if (!this.nangDuoc(t)) return false;
    const d = this.doc();
    d.vang -= t.vang; d.c[id] = { lv: t.lv + 1, n: t.n - t.can };
    this.luu(); return true;
  },
  // số cấp đã lên trên cấp đầu (dùng trong trận: B.capThe)
  bonus(id) { return this.the(id).k; },
  bonusDeck(deck) { const m = {}; for (const id of deck || []) m[id] = this.bonus(id); return m; },
  // máy (bạn máy co-op / đối thủ PVP): cùng mức trung bình với bộ bài người chơi → độ khó PVP giữ công bằng
  capMay(deck) {
    const ds = (typeof UI !== 'undefined' && UI.chon && UI.chon.length) ? UI.chon : [];
    const tb = ds.length ? Math.floor(ds.reduce((a, id) => a + this.bonus(id), 0) / ds.length) : 0;
    const m = {}; for (const id of deck || []) m[id] = Math.min(tb, THE.maxLv(this.bac(id)) - THE.lvDau[this.bac(id)]); return m;
  },
  capBan(i, deck, def) {
    if (typeof G !== 'undefined' && G.debug && G.debug.cap2 && i === 1) return Object.assign({}, G.debug.cap2);
    if (typeof G !== 'undefined' && G.debug && G.debug.cap0 && i === 0) return Object.assign({}, G.debug.cap0); // online: đúng mức đã gửi cho bạn
    if (i === 0 && !(def && def.ai)) return this.bonusDeck(deck);
    return this.capMay(deck);
  },
  // online: gửi kèm cấp thẻ trong chuỗi bộ bài ("a,b,c,d,e,#xxxxx" — base36 mỗi ô; bản cũ tự lọc bỏ mục '#')
  maHoa(deck) { return '#' + (deck || []).map(id => Math.min(35, this.bonus(id)).toString(36)).join(''); },
  giaiMa(ds, deck) {
    const m = (ds || []).find(x => typeof x === 'string' && x[0] === '#'); if (!m) return null;
    const r = {}; (deck || []).forEach((id, i) => { const v = parseInt(m[i + 1] || '0', 36); r[id] = Math.max(0, Math.min(14, v | 0)); });
    return r;
  },
  // nhãn thẻ trong trận (07/11 người dùng: bỏ chữ LV): cấp trận 1 → '' (không hiện), mỗi lần nâng trong trận '+1'/'+2'/'+3', tối đa (lv ≥ 5) → 'MAX'
  nhanTran(B, id) {
    const lv = (B && B.lv && B.lv[id]) || 1;
    return lv >= 5 ? ((typeof TEXT !== 'undefined' && TEXT.ui && TEXT.ui.max) || 'MAX') : lv > 1 ? '+' + (lv - 1) : '';
  },

  // ---------- TÚI THƯỞNG cuối trận ----------
  rut(rng) {
    let x = rng() * 100;
    for (const [b, w] of THE.tiLe) { if (x < w) return b; x -= w; }
    return 'trang';
  },
  thuong(k, m) {
    if (!m || m.tut || m._thuong) return m && m._thuong;
    if (typeof G !== 'undefined' && G.debug && (G.debug.mana || G.debug.auto || G.debug.wave)) return null; // trận thử (?mana=…): không thưởng
    const wave = Math.max(1, (k && k.wave) || G.wave || 1), rng = Math.random;
    const vang = 10 * wave + 40 * (m.trum || 0) + (k && k.thang ? 150 : 0);
    const luot = Math.min(10, 1 + Math.floor(wave / 4));
    const co = (G.roster || []).filter(r => SKILLS[r.id]);
    const gom = {};
    for (let i = 0; i < luot; i++) {
      const b = this.rut(rng);
      const trong = (m.deck || []).filter(id => this.bac(id) === b);
      const ds = trong.length && rng() < 0.5 ? trong : co.filter(r => r.bac === b).map(r => r.id);
      if (!ds.length) continue;
      const id = ds[Math.floor(rng() * ds.length)], [a, c] = THE.soBan[b];
      gom[id] = (gom[id] || 0) + a + Math.floor(rng() * (c - a + 1));
    }
    const d = this.doc();
    if (typeof KT !== 'undefined' && KT.cong) KT.cong('vang', vang, 'battle'); else d.vang += vang; // mối nối tiền tệ (kinhte.js)
    for (const id in gom) { const t = this.the(id); d.c[id] = { lv: t.lv, n: t.n + gom[id] }; }
    delete d.moi;
    this.luu();
    m._thuong = { vang, the: Object.entries(gom).map(([id, n]) => ({ id, n })).sort((a, b) => TIERS[this.bac(b.id)].thuTu - TIERS[this.bac(a.id)].thuTu) };
    return m._thuong;
  },
};

// ---------- THẺ ĐÃ BỎ (người dùng 08/11: bỏ Hào Quang Thánh 'haoquang' khỏi bộ bài + gacha) ----------
// Không xoá mã kỹ năng (SKILLS.haoquang vẫn nạp, không ai gọi được) — chỉ lọc khỏi danh sách ụ lúc nạp (ui.js) → mọi chỗ dùng G.roster/rosterMap
// (bộ bài, gacha, cửa hàng, bộ ngẫu nhiên, ảnh chụp bàn online — datO bỏ qua id lạ) tự không còn thấy nó.
// BÙ cho người đã có thẻ: chuyển sang 1 thẻ Đỏ khác (tất định: thẻ Đỏ ĐẦU TIÊN theo thứ tự roster mà người chơi CHƯA có; có hết → thẻ Đỏ đầu tiên),
//   giữ CẤP (lấy cấp lớn hơn) + CỘNG bản sao → không mất gì. Thẻ đích lưu ở d.doi để lần sau / máy khác (gộp hồ sơ Firebase) ra cùng thẻ.
//   Bộ bài đã lưu (turret_bo, bộ mẫu turret_pre) có thẻ bỏ → thay bằng thẻ đích ở đúng ô.
const THE_BO = ['haoquang'];
Object.assign(THEBAI, {
  BO: THE_BO,
  laBo(id) { return THE_BO.includes(id); },
  dsDo() { return (typeof G !== 'undefined' && G.roster || []).filter(r => r.bac === 'do' && !THE_BO.includes(r.id) && typeof SKILLS !== 'undefined' && SKILLS[r.id]).map(r => r.id); },
  dich(d, id) { // thẻ đích của thẻ bỏ id trong dữ liệu d
    d.doi = d.doi || {};
    const cu = d.doi[id]; if (cu && !THE_BO.includes(cu) && this.dsDo().includes(cu)) return cu;
    const ds = this.dsDo(); if (!ds.length) return null;
    const co = (x) => { const o = d.c && d.c[x]; return !!(o && ((o.lv | 0) > 0 || (o.n | 0) > 0)); };
    return (d.doi[id] = ds.find(x => !co(x)) || ds[0]);
  },
  // chuyển thẻ bỏ trong dữ liệu thẻ d (mặc định: bản đang dùng) + bộ bài đã lưu. Trả true nếu có đổi.
  boThe(d) {
    const minh = !d; d = d || this.doc(); let doi = false;
    if (!this.dsDo().length) return false; // chưa nạp danh sách ụ
    for (const id of THE_BO) {
      const o = d.c && d.c[id];
      if (o) { const t = this.dich(d, id); if (!t) continue; const x = d.c[t] || {}; d.c[t] = { lv: Math.max(x.lv | 0, o.lv | 0), n: (x.n | 0) + (o.n | 0) }; delete d.c[id]; doi = true; }
    }
    if (minh) {
      if (doi) this.luu();
      const thay = (ds) => Array.isArray(ds) ? ds.map(x => THE_BO.includes(x) ? this.dich(d, x) || x : x) : ds;
      try { const l = JSON.parse(localStorage.getItem('turret_bo') || 'null'); if (l && Array.isArray(l.chon) && l.chon.some(x => THE_BO.includes(x))) { l.chon = thay(l.chon); localStorage.setItem('turret_bo', JSON.stringify(l)); this.luu(); } } catch (e) { }
      try { const l = JSON.parse(localStorage.getItem('turret_pre') || 'null'); if (l && Array.isArray(l.ds) && l.ds.some(p => p && Array.isArray(p.o) && p.o.some(x => THE_BO.includes(x)))) { l.ds.forEach(p => { if (p && Array.isArray(p.o)) p.o = thay(p.o); }); localStorage.setItem('turret_pre', JSON.stringify(l)); this.luu(); } } catch (e) { }
    }
    return doi;
  },
  // bộ bài của NGƯỜI KHÁC (online, bản cũ còn gửi thẻ bỏ): thay bằng thẻ Đỏ đầu tiên chưa có trong bộ đó (tất định, 2 máy như nhau)
  doiBo(deck) {
    if (!Array.isArray(deck)) return deck;
    return deck.map(x => { if (!THE_BO.includes(x)) return x; const t = this.dsDo().find(y => !deck.includes(y)); return t || x; });
  },
});
