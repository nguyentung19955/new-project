// TURRET MERGE — NGUỒN MẢNH (bản sao) thẻ VÀNG (Huyền thoại) / ĐỎ (Cổ đại) — người dùng 09/11: "cơ chế kiếm thêm mảnh ụ Vàng, Đỏ — Đỏ khó kiếm hơn".
//  Gắn thêm vào kinh tế sẵn có (kinhte.js / kinhte-ui.js / thebai-ui.js), không đổi luật cũ:
//   1) MỐC WAVE SOLO lần đầu (kỷ lục Solo, cả bản cũ turret_best.solo) → bản sao Vàng; wave 50/60/70 thêm bản Đỏ.
//   2) HẠ TRÙM LẦN ĐẦU: mỗi trùm (12) = 1 bản Vàng; hạ đủ 12 trùm = 1 bản Đỏ.
//   3) NHIỆM VỤ NGÀY mới "Reach wave 30" = 1 bản Vàng (vào bể 3 nhiệm vụ/ngày).
//   4) LÒ RÈN (SHOP): 30 bản 1 thẻ Sử thi + 2 000 vàng → 1 bản Vàng ngẫu nhiên (3/tuần) · 10 bản 1 thẻ Vàng + 10 000 vàng → 1 bản Đỏ ngẫu nhiên (1/tuần).
//  Rương / Daily Specials / vòng quay / sự kiện tuần giữ nguyên (đã có Vàng/Đỏ — bảng ở docs/demo-hop-tuong/tuvan/shop/KINH-TE.md §7).
//  Lưu: turret_kt.mh (thêm khoá mới, bản cũ không mất gì); gộp hồ sơ Firebase: cờ OR, kỷ lục lấy lớn nhất. Thẻ ngẫu nhiên chọn bằng KT.cho
//  (hạt giống = mã người chơi + khoá + bộ đếm lưu) và ghi ngay → tải lại không đổi kết quả.
'use strict';

const MHC = {
  moc: [ // mốc wave Solo (lần đầu)
    { w: 20, r: [{ the: { bac: 'vang', n: 1 } }] },
    { w: 30, r: [{ the: { bac: 'vang', n: 2 } }] },
    { w: 40, r: [{ the: { bac: 'vang', n: 3 } }] },
    { w: 50, r: [{ the: { bac: 'vang', n: 3 } }, { the: { bac: 'do', n: 1 } }] },
    { w: 60, r: [{ the: { bac: 'vang', n: 4 } }, { the: { bac: 'do', n: 1 } }] },
    { w: 70, r: [{ the: { bac: 'vang', n: 5 } }, { the: { bac: 'do', n: 2 } }] },
  ],
  trum: { the: { bac: 'vang', n: 1 } },   // mỗi trùm hạ lần đầu
  trumDu: { the: { bac: 'do', n: 1 } },   // hạ đủ mọi trùm
  ren: [
    { k: 'tv', tu: 'tim', can: 30, gia: 2000, ra: 'vang', tuan: 3 },
    { k: 'vd', tu: 'vang', can: 10, gia: 10000, ra: 'do', tuan: 1 },
  ],
  nv: { id: 'wave30', ten: 'Reach wave 30', can: 30, k: 'wave', max: 1, kl: 28, r: { the: { bac: 'vang', n: 1 } } }, // kl: chỉ vào bể khi kỷ lục ≥ 28 (tien-trinh §3.4)
  // ẤN VÀNG (tien-trinh §6.3, người dùng chốt 6:1): 6 bản Vàng thừa (nhiều thẻ, trừ thẻ đích) + 20 000 vàng → 1 bản Vàng TỰ CHỌN, 1 lần/tuần.
  //  Bản lấy tự động theo thứ tự: thẻ đã MAX → thẻ ngoài bộ bài → thẻ trong bộ; trong mỗi nhóm lấy chồng nhiều bản trước.
  an: { k: 'an', can: 6, gia: 20000, tuan: 1 },
};

const MH = {
  tran: null, // id trùm bàn người chơi đã hạ trong trận này
  // ---------- lưu / di chuyển ----------
  st() {
    const s = KT.doc();
    let m = s.mh;
    if (!m || typeof m !== 'object') {
      m = s.mh = { sw: 0, moc: {}, tr: {}, trn: {}, bo: 0, ren: { tuan: 0, n: {} }, renN: 0 };
      try { const b = JSON.parse(localStorage.getItem('turret_best') || '{}') || {}; m.sw = (b.solo && b.solo.wave) | 0; } catch (e) { } // kỷ lục Solo cũ → mốc nhận được ngay
      KT.luu(true);
    }
    for (const k of ['moc', 'tr', 'trn']) if (!m[k] || typeof m[k] !== 'object') m[k] = {};
    if (!m.ren || typeof m.ren !== 'object' || !m.ren.n) m.ren = { tuan: 0, n: {} };
    m.sw = Math.max(0, m.sw | 0); m.bo = m.bo ? 1 : 0; m.renN = Math.max(0, m.renN | 0);
    return m;
  },
  gop(ra, x) { ra.vang += x.vang || 0; ra.ngoc += x.ngoc || 0; ra.the.push(...(x.the || [])); return ra; },
  phat(ds, khoa) { const ra = { vang: 0, ngoc: 0, the: [] }; ds.forEach((r, i) => this.gop(ra, KT.cho(r, khoa + ':' + i, 'achieve'))); return ra; },
  // ---------- 1) mốc wave Solo ----------
  mocDs() { const m = this.st(); return MHC.moc.map(o => ({ w: o.w, r: o.r, t: Math.min(o.w, m.sw), can: o.w, xong: m.sw >= o.w, da: !!m.moc[o.w] })); },
  mocNhan(w) {
    const o = this.mocDs().find(x => x.w === +w); if (!o || !o.xong || o.da) return null;
    this.st().moc[o.w] = 1; const ra = this.phat(o.r, 'mhm' + o.w); KT.luu(); return ra;
  },
  // ---------- 2) trùm ----------
  dsTrum() { return (typeof TRUM_POOL !== 'undefined' ? TRUM_POOL : typeof TRUM_THU_TU !== 'undefined' ? TRUM_THU_TU : []).filter(id => typeof TRUM === 'undefined' || TRUM[id]); },
  trumDs() { const m = this.st(); return this.dsTrum().map(id => ({ id, ten: (TRUM[id] || {}).ten || id, ha: !!m.tr[id], da: !!m.trn[id] })); },
  trumNhan() { // nhận mọi trùm đã hạ chưa nhận
    const m = this.st(), ds = this.trumDs().filter(x => x.ha && !x.da); if (!ds.length) return null;
    const ra = { vang: 0, ngoc: 0, the: [] };
    for (const x of ds) { m.trn[x.id] = 1; this.gop(ra, this.phat([MHC.trum], 'mht' + x.id)); }
    KT.luu(); return Object.assign(ra, { ten: ds.map(x => x.ten) });
  },
  boXong() { const ds = this.trumDs(); return ds.length > 0 && ds.every(x => x.ha); },
  boNhan() { const m = this.st(); if (m.bo || !this.boXong()) return null; m.bo = 1; const ra = this.phat([MHC.trumDu], 'mhb'); KT.luu(); return ra; },
  // ---------- 4) lò rèn ----------
  renTuan() { const m = this.st(), t = KT.tuan(); if (m.ren.tuan !== t) m.ren = { tuan: t, n: {} }; return m.ren; },
  // ---------- ẤN VÀNG ----------
  anNguon(dich) { // danh sách bản sẽ lấy: [{id, n}] (tổng = can) hoặc null nếu thiếu
    const bo = (typeof UI !== 'undefined' && UI.chon) || [], ds = KT.dsBac('vang').filter(id => id !== dich).map(id => ({ id, t: THEBAI.the(id) })).filter(x => x.t.n > 0);
    const nhom = (x) => (x.t.max ? 0 : bo.includes(x.id) ? 2 : 1);
    ds.sort((a, b) => nhom(a) - nhom(b) || b.t.n - a.t.n || (a.id < b.id ? -1 : 1));
    let con = MHC.an.can; const lay = [];
    for (const x of ds) { if (!con) break; const n = Math.min(con, x.t.n); lay.push({ id: x.id, n }); con -= n; }
    return con ? null : lay;
  },
  anTong() { return KT.dsBac('vang').reduce((a, id) => a + THEBAI.the(id).n, 0); },
  anTt() {
    const rt = this.renTuan(), dung = rt.n.an | 0, con = Math.max(0, MHC.an.tuan - dung), co = this.anTong();
    return { dung, con, co, duVang: KT.vang >= MHC.an.gia, duoc: con > 0 && co >= MHC.an.can && KT.vang >= MHC.an.gia && KT.dsBac('vang').some(id => !!this.anNguon(id)) };
  },
  an(dich) {
    const t = this.anTt(); if (!t.duoc || !KT.dsBac('vang').includes(dich)) return null;
    const lay = this.anNguon(dich); if (!lay) return null;
    const m = this.st(), rt = this.renTuan();
    for (const x of lay) KT.themBan(x.id, -x.n);
    KT.cong('vang', -MHC.an.gia, 'exchange');
    rt.n.an = (rt.n.an | 0) + 1; m.renN++;
    const ra = this.phat([{ the: { id: dich, n: 1 } }], 'mha' + m.renN);
    KT.luu(); return Object.assign(ra, { lay });
  },
  renDs() {
    const rt = this.renTuan(), vang = KT.vang;
    return MHC.ren.map(c => {
      const the = KT.dsBac(c.tu).map(id => ({ id, n: THEBAI.the(id).n })).filter(x => x.n >= c.can).sort((a, b) => b.n - a.n);
      const dung = rt.n[c.k] | 0, con = Math.max(0, c.tuan - dung);
      return Object.assign({}, c, { the, dung, con, duVang: vang >= c.gia, duoc: con > 0 && the.length > 0 && vang >= c.gia });
    });
  },
  ren(k, id) {
    const c = this.renDs().find(x => x.k === k); if (!c || !c.duoc || !c.the.some(x => x.id === id)) return null;
    const m = this.st(), rt = this.renTuan();
    KT.themBan(id, -c.can); KT.cong('vang', -c.gia, 'exchange');
    rt.n[k] = (rt.n[k] | 0) + 1; m.renN++;
    const ra = this.phat([{ the: { bac: c.ra, n: 1 } }], 'mhr' + m.renN);
    KT.luu(); return ra;
  },
  // ---------- hết trận: ghi kỷ lục / trùm rồi tự nhận mọi thứ mới mở ----------
  tuDong() {
    const ds = [];
    for (const o of this.mocDs()) if (o.xong && !o.da) { const ra = this.mocNhan(o.w); if (ra) ds.push({ nhan: 'SOLO WAVE ' + o.w, w: o.w, ra }); }
    const t = this.trumNhan(); if (t) ds.push({ nhan: 'FIRST KILL', ra: t });
    const b = this.boNhan(); if (b) ds.push({ nhan: 'ALL BOSSES', ra: b });
    return ds;
  },
  coNhan() {
    return this.mocDs().some(o => o.xong && !o.da) || this.trumDs().some(x => x.ha && !x.da) || (!this.st().bo && this.boXong());
  },
};

// ===================================================== GIAO DIỆN =====================================================
const MHUI = {
  icBac(b, n) { return '<span class="kt-r kt-r-the"><i class="kt-bac"><img src="' + KTUI.a('o_vien_' + b) + '" alt=""><em>?</em></i><b>×' + n + '</b></span>'; },
  chip(b, n) { return '<i class="mh-chip"><img src="' + KTUI.a('ngoc_' + b) + '" alt="' + TIERS[b].ten + '">×' + n + '</i>'; }, // ngọc bậc (như bảng tổng mở rương)
  // 1 hàng như hàng nhiệm vụ: ổ tròn = phần thưởng hiếm nhất, phần còn lại thành chip nhỏ cạnh tên
  hang(ten, q, ds, act, id) {
    const tt = (r) => TIERS[r.the.bac].thuTu, chinh = ds.slice().sort((a, b) => tt(b) - tt(a))[0], phu = ds.filter(r => r !== chinh);
    const nut = q.da ? '<img class="kt-tick" src="' + KTUI.a(KTA.xong) + '" alt="Claimed">' : '<button class="kt-slot' + (q.xong ? ' vang' : '') + '" data-act="' + act + '" data-id="' + id + '"' + (q.xong ? '' : ' disabled') + '><b>' + (q.xong ? 'CLAIM' : KTUI.so(q.t) + '/' + KTUI.so(q.can)) + '</b></button>';
    return '<div class="kt-h' + (q.da ? ' da' : q.xong ? ' xong' : '') + '">' + this.icBac(chinh.the.bac, chinh.the.n) + '<div class="kt-h-g"><b>' + ten + (phu.length ? ' ' + phu.map(r => this.chip(r.the.bac, r.the.n)).join('') : '') + '</b>' + TBUI.thanh({ n: q.t, can: q.can, max: false }) + '</div>' + nut + '</div>';
  },
  ve_nv() {
    const m = MH.st(), tr = MH.trumDs(), ha = tr.filter(x => x.ha).length, chua = tr.some(x => x.ha && !x.da);
    let h = KTUI.muc('LEGENDARY & MYTHIC', 'BEST SOLO WAVE ' + m.sw);
    for (const o of MH.mocDs()) h += this.hang('Solo: wave ' + o.w, o, o.r, 'kt-mhm', o.w);
    h += this.hang('First kill of each boss', { t: ha, can: tr.length, xong: chua, da: !chua && tr.length > 0 && tr.every(x => x.da) }, [MHC.trum], 'kt-mht', 't');
    h += '<div class="mh-trum">' + tr.map(x => '<i class="' + (x.ha ? 'ha' : '') + '" title="' + x.ten + '"><img src="assets/trum_' + x.id + '_portrait.png" alt="' + x.ten + '" loading="lazy" draggable="false"></i>').join('') + '</div>';
    h += this.hang('Defeat all ' + tr.length + ' bosses', { t: ha, can: tr.length, xong: MH.boXong(), da: !!m.bo }, [MHC.trumDu], 'kt-mhb', 'b');
    return h;
  },
  ve_shop() {
    let h = KTUI.muc('SHARD FORGE', 'RESETS MONDAY');
    for (const c of MH.renDs()) {
      const q = { t: c.dung, can: c.tuan };
      const kh = KTUI.khoaNut ? KTUI.khoaNut('ren:' + c.k, 'kt-slot') : ''; // khoá theo cấp (tientrinh.js)
      const nut = kh || '<button class="kt-slot' + (c.duoc ? ' vang' : '') + '" data-act="kt-mhr" data-id="' + c.k + '"' + (c.duoc ? '' : ' disabled') + '><b>' + (c.con ? 'TRADE' : 'DONE') + '</b></button>';
      h += '<div class="kt-h mh-ren' + (kh ? ' tt-khoa-h' : '') + '">' + this.icBac(c.ra, 1) + '<div class="kt-h-g"><b>' + c.can + ' copies of one <span>' + TIERS[c.tu].ten + '</span> ' + this.chip(c.tu, c.can) + '</b>' +
        '<small class="mh-gia"><img src="' + KTUI.a(KTA.vang) + '" alt="">' + KTUI.so(c.gia) + ' · ' + q.t + '/' + q.can + ' THIS WEEK</small></div>' + nut + '</div>';
    }
    // ẤN VÀNG: 6 bản Vàng thừa + 20 000 vàng → 1 bản Vàng tự chọn
    const a = MH.anTt(), C = MHC.an, kh = KTUI.khoaNut ? KTUI.khoaNut('ren:an', 'kt-slot') : '';
    h += '<div class="kt-h mh-ren mh-an' + (kh ? ' tt-khoa-h' : '') + '">' + this.icBac('vang', 1) + '<div class="kt-h-g"><b>Legendary Seal ' + this.chip('vang', C.can) + ' → 1 of your choice</b>' +
      '<small class="mh-gia"><img src="' + KTUI.a(KTA.vang) + '" alt="">' + KTUI.so(C.gia) + ' · ' + a.dung + '/' + C.tuan + ' THIS WEEK · YOU HAVE ' + a.co + '</small></div>' +
      (kh || '<button class="kt-slot' + (a.duoc ? ' vang' : '') + '" data-act="kt-mha" data-id="an"' + (a.duoc ? '' : ' disabled') + '><b>' + (a.con ? 'PICK' : 'DONE') + '</b></button>') + '</div>';
    return h;
  },
  chonAn() { // bảng chọn thẻ Vàng đích (thẻ nào cũng được, kể cả chưa có bản)
    const ds = KT.dsBac('vang').filter(id => !!MH.anNguon(id)).map(id => '<button class="mh-the" data-act="kt-mhan" data-id="' + id + '">' + OT.mini(id) + '<b>×' + THEBAI.the(id).n + '</b><small>' + KTUI.ten(id) + '</small></button>').join('');
    KTUI.phu('<b class="kt-phu-t">LEGENDARY SEAL</b><p class="kt-chu">Trade ' + MHC.an.can + ' spare Legendary copies + ' + KTUI.so(MHC.an.gia) + ' gold → 1 copy of the Legendary you pick. Spare copies come from maxed cards first, then cards outside your deck.</p><div class="mh-chon">' + ds + '</div>' +
      '<button class="hm-nut2 kt-ok" data-act="kt-phu-dong"><b>CANCEL</b></button>', 'kt-tl mh-p');
  },
  chon(k) { // bảng chọn thẻ đem rèn
    const c = MH.renDs().find(x => x.k === k); if (!c) return;
    const ds = c.the.map(x => '<button class="mh-the" data-act="kt-mhc" data-k="' + k + '" data-id="' + x.id + '">' + OT.mini(x.id) + '<b>×' + x.n + '</b><small>' + KTUI.ten(x.id) + '</small></button>').join('');
    KTUI.phu('<b class="kt-phu-t">PICK A CARD</b><p class="kt-chu">Trade ' + c.can + ' copies + ' + KTUI.so(c.gia) + ' gold → 1 random <span>' + TIERS[c.ra].ten + '</span></p><div class="mh-chon">' + ds + '</div>' +
      '<button class="hm-nut2 kt-ok" data-act="kt-phu-dong"><b>CANCEL</b></button>', 'kt-tl mh-p');
  },
  // màn kết quả: thêm thẻ thưởng mốc / trùm vào ô REWARDS + 1 dòng nhãn
  veKetQua(r) {
    const d = document.querySelector('#ketqua .tb-kq'); if (!d || !r || !r.mh || !r.mh.length) return;
    const hang = d.querySelector('.tb-kq-h'), gom = {};
    for (const g of r.mh) for (const x of g.ra.the || []) gom[x.id] = (gom[x.id] || 0) + x.n;
    if (hang && !hang.querySelector('.mh-kq-t')) (hang.querySelector('.tb-kq-v') || hang).insertAdjacentHTML(hang.querySelector('.tb-kq-v') ? 'afterend' : 'afterbegin', Object.entries(gom).map(([id, n]) => '<span class="tb-kq-t mh-kq-t"><i class="ot-mini" data-id="' + id + '"><img class="po" src="' + portraitOf(id) + '" alt="" draggable="false"></i><b>×' + n + '</b></span>').join(''));
    let e = d.querySelector('.mh-kq'); if (!e) { e = document.createElement('small'); e.className = 'kt-kq mh-kq'; d.appendChild(e); }
    const w = r.mh.filter(g => g.w).map(g => g.w), ten = (w.length ? ['SOLO WAVE ' + w.join('/')] : []).concat(r.mh.filter(g => !g.w).map(g => g.nhan));
    e.textContent = ten.join(' · ');
    try { if (typeof OT !== 'undefined' && OT.quet) OT.quet(d); } catch (er) { }
  },
  // trang ụ: thẻ Vàng/Đỏ ghi "kiếm ở đâu"
  NGUON: {
    vang: 'Battle rewards · Gold Chest · Daily Specials · Solo wave 20–70 · first boss kills · daily quest · Shard Forge · Legendary Seal',
    do: 'Mythic / Gold Chest · Daily Specials (~1 day a week) · Solo wave 50, 60, 70 · defeat all bosses · event 3,600 pts · Shard Forge',
  },
  nguon(id) { const b = THEBAI.bac(id); return this.NGUON[b] ? '<div class="mh-nguon"><small>WHERE TO GET</small><span>' + this.NGUON[b] + '</span></div>' : ''; },
};

(function () {
  if (typeof KT === 'undefined' || typeof KTUI === 'undefined') return;
  try { MH.st(); } catch (e) { }
  if (!KTC.nv.some(q => q.id === MHC.nv.id)) KTC.nv.push(MHC.nv); // bể nhiệm vụ ngày (danh sách hôm nay đã lưu → chỉ đổi từ ngày mai)
  // trận: ghi trùm bàn người chơi hạ (cùng điều kiện ketqua.js)
  if (typeof batDau === 'function') { const g = batDau; batDau = function () { MH.tran = {}; return g.apply(this, arguments); }; }
  if (typeof chet === 'function') {
    const g = chet;
    chet = function (E) {
      const da = E && E.chet, r = g.apply(this, arguments);
      try { if (MH.tran && E && !da && E.chet && E.trum && (G.che !== 'pvp' || G.duong[E.p].ban === 0)) MH.tran[E.trum] = 1; } catch (e) { }
      return r;
    };
  }
  const kt = KT.ketTran;
  KT.ketTran = function (k, m) {
    const r = kt.apply(this, arguments); if (!r) return r;
    try {
      const st = MH.st(), wave = Math.max(1, (k && k.wave) | 0), che = (KT.tran && KT.tran.onl) ? 'online' : ((KT.tran && KT.tran.che) || (m && m.che) || 'solo');
      if (che === 'solo') st.sw = Math.max(st.sw, wave);
      for (const id in (MH.tran || {})) if (typeof TRUM === 'undefined' || TRUM[id]) st.tr[id] = 1;
      MH.tran = null;
      KT.luu();
      r.mh = MH.tuDong();
    } catch (e) { console.error('MH', e); }
    return r;
  };
  const co = KT.coNhan;
  KT.coNhan = function () { const c = co.apply(this, arguments); try { if (MH.coNhan()) c.nv = true; } catch (e) { } return c; };
  // gộp hồ sơ Firebase: giữ cờ của cả 2 bản (OR) + kỷ lục lớn nhất → không nhận 2 lần, không mất trùm đã hạ
  const gop = KT.gop;
  KT.gop = function (o) {
    let a = null, b = null; try { a = JSON.parse(JSON.stringify(MH.st())); b = o && o.kt && o.kt.mh; } catch (e) { }
    const x = gop.apply(this, arguments);
    try {
      const m = MH.st();
      for (const y of [a, b]) {
        if (!y || typeof y !== 'object') continue;
        m.sw = Math.max(m.sw, y.sw | 0); m.bo = m.bo || (y.bo ? 1 : 0); m.renN = Math.max(m.renN, y.renN | 0);
        for (const k of ['moc', 'tr', 'trn']) for (const i in (y[k] || {})) if (y[k][i]) m[k][i] = 1;
        if (y.ren && y.ren.tuan === m.ren.tuan) for (const i in (y.ren.n || {})) m.ren.n[i] = Math.max(m.ren.n[i] | 0, y.ren.n[i] | 0);
      }
      KT.luu(true);
    } catch (e) { }
    return x;
  };
  // giao diện
  const vnv = KTUI.ve_nv;
  KTUI.ve_nv = function () { const h = vnv.apply(this, arguments), mk = this.muc('ACHIEVEMENTS'); let t = ''; try { t = MHUI.ve_nv(); } catch (e) { console.error('MHUI', e); } return h.includes(mk) ? h.replace(mk, t + mk) : h + t; };
  const vsp = KTUI.ve_shop;
  KTUI.ve_shop = function () { const h = vsp.apply(this, arguments), mk = this.muc('GOLD'); let t = ''; try { t = MHUI.ve_shop(); } catch (e) { console.error('MHUI', e); } return h.includes(mk) ? h.replace(mk, t + mk) : h + t; };
  const vkq = KTUI.veKetQua;
  KTUI.veKetQua = function (r) { const x = vkq.apply(this, arguments); try { MHUI.veKetQua(r); } catch (e) { console.error('MHUI', e); } return x; };
  if (typeof TBUI !== 'undefined') { const hg = TBUI.hang; TBUI.hang = function (id) { const s = hg.apply(this, arguments); try { return s ? s + MHUI.nguon(id) : s; } catch (e) { return s; } }; }
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-act^="kt-mh"]'); if (!b || b.disabled) return;
    const a = b.dataset.act;
    if (a === 'kt-mhm') { const ra = MH.mocNhan(b.dataset.id); KTUI.ve(); KTUI.nhan(ra); }
    else if (a === 'kt-mht') { const ra = MH.trumNhan(); KTUI.ve(); KTUI.nhan(ra); }
    else if (a === 'kt-mhb') { const ra = MH.boNhan(); KTUI.ve(); KTUI.nhan(ra); }
    else if (a === 'kt-mhr') { try { SND.nut(); } catch (er) { } MHUI.chon(b.dataset.id); }
    else if (a === 'kt-mha') { try { SND.nut(); } catch (er) { } MHUI.chonAn(); }
    else if (a === 'kt-mhan') { const ra = MH.an(b.dataset.id); KTUI.dongPhu(); KTUI.ve(); if (ra) KTUI.nhan(ra, 'SEALED'); try { TBUI.capLuoi(); } catch (er) { } }
    else if (a === 'kt-mhc') { const ra = MH.ren(b.dataset.k, b.dataset.id); KTUI.dongPhu(); KTUI.ve(); if (ra) KTUI.nhan(ra, 'FORGED'); try { TBUI.capLuoi(); } catch (er) { } }
  });
})();
