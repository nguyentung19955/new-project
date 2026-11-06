// TURRET MERGE — GIAO DIỆN CỬA HÀNG / VÒNG QUAY / NHIỆM VỤ / SỰ KIỆN (dữ liệu + luật: kinhte.js)
//  · HOME: 2 chip VÀNG + NGỌC ở thanh trên; 4 nút bên (SHOP, SPIN | QUESTS, EVENT) có chấm đỏ khi có thứ nhận được.
//  · Màn #kt (trong #chon → các tệp khác vẫn coi là "đang ở menu"): thanh trên (lui, tên, 2 chip) · nội dung cuộn · 4 thẻ dưới.
//  · Mở rương: rương lắc → bung sáng → thẻ lật lần lượt (viền độ hiếm, quầng cho Huyền thoại/Cổ đại) → chạm = bỏ qua → bảng tổng.
//  · Tỉ lệ công khai: nút (i) mỗi rương + vòng quay.
//  Hình: CHỈ ảnh PNG ChatGPT (QUY-TAC-HINH.md). Ảnh riêng cho cửa hàng đang chờ gen (docs/demo-hop-tuong/tuvan/shop/CAN-VE.json)
//  → KTA dưới đây trỏ ảnh có sẵn gần nhất; ảnh mới về chỉ cần đổi tên trong KTA. Code chỉ đặt chữ/số, vị trí, xoay, mờ.
'use strict';
const KTA = {
  vang: 'shop_vang', ngoc: 'shop_ngoc', cham: 'ngoc_do', xong: 'p7_ic_xong', tin: 'p7_ic_tin', lui: 'p7_ic_lui',
  ru: { thuong: 'shop_ru_thuong', vang: 'shop_ru_vang', than: 'shop_ru_than' },       // rương đóng (raw_shop_ruong — tools/thap-lap-shop.py)
  ruMo: { thuong: 'shop_ru_thuong_mo', vang: 'shop_ru_vang_mo', than: 'shop_ru_than_mo' }, // rương mở
  fx: 'shop_fx_mo',                                                                      // dải 16 khung bung sáng (raw_shop_fx_mo)
  khe: 'p1_ruong_khe',                                                                               // khe sáng nắp rương (nhịp 2): '' = chưa có ảnh → chỉ rương sáng lên; chờ raw_p1_ruong_khe (tuvan/vfx/CAN-VE-p1.json)
  bung: 'h2_burst', sao: 'ui_sao', quang: 'fx_vong_lv', lung: 'p7_o_trong', o: 'p7_o_co', oSang: 'p7_o_doi',
  banh: 'shop_banh', banhKhung: 'shop_banh_khung', mui: 'shop_mui',                     // vòng quay 8 ô (raw_shop_vongquay)
  nut: { shop: 'shop_nut_shop', vq: 'shop_nut_vq', nv: 'shop_nut_nv', sk: 'shop_nut_sk' }, // nút HOME (raw_shop_nut)
  banner: 'shop_banner', bannerSk: 'shop_banner_su',                                     // (raw_shop_banner / _su); khung hàng nhiệm vụ: css shop_khung_nv
};
const KTUI = {
  tab: 'shop', mo: false,
  a: (n) => (typeof anhUrl === 'function' ? anhUrl(n) : 'assets/' + n + '.png'),
  so: (v) => Math.floor(v).toLocaleString('en-US'),
  el: (id) => document.getElementById(id),
  TAB: { shop: 'SHOP', vq: 'SPIN', nv: 'QUESTS', sk: 'EVENT' },
  ten: (id) => ((typeof G !== 'undefined' && G.rosterMap[id]) || {}).ten || id,

  // ---------- dựng khung 1 lần ----------
  dung() {
    const chon = this.el('chon'), hm = this.el('hm'); if (!chon || !hm || this.el('kt')) return;
    const dau = hm.querySelector('.hm-dau'), tien = this.el('hm-tien');
    if (dau && tien) tien.insertAdjacentHTML('beforebegin', this.chip('hm'));
    const ben = (ds, l) => '<div class="kt-ben kt-ben-' + l + '">' + ds.map(k => '<button class="kt-nut" data-act="kt-mo" data-tab="' + k + '" aria-label="' + this.TAB[k] + '"><span class="kt-nut-o"><img src="' + this.a(KTA.nut[k]) + '" alt="" draggable="false"></span><b>' + this.TAB[k] + '</b><img class="kt-cham" data-cham="' + k + '" src="' + this.a(KTA.cham) + '" alt="" hidden></button>').join('') + '</div>';
    hm.insertAdjacentHTML('beforeend', ben(['nv', 'sk'], 't') + ben(['shop', 'vq'], 'p'));
    chon.insertAdjacentHTML('beforeend', '<div class="kt" id="kt" hidden><img class="kt-nen" src="assets/nen_deck.jpg" alt="">' +
      '<div class="kt-dau"><button class="hm-ic hm-ic1" data-act="kt-dong" aria-label="Back"><img src="' + this.a(KTA.lui) + '" alt=""></button><b id="kt-tde">SHOP</b>' + this.chip('kt') + '</div>' +
      '<div class="kt-than" id="kt-than"></div>' +
      '<div class="kt-tab">' + Object.keys(this.TAB).map(k => '<button class="hm-nut2" data-act="kt-tab" data-tab="' + k + '"><b>' + this.TAB[k] + '</b><img class="kt-cham" data-cham="' + k + '" src="' + this.a(KTA.cham) + '" alt="" hidden></button>').join('') + '</div>' +
      '<div class="kt-phu" id="kt-phu" hidden></div></div>');
    this.capNhat();
  },
  chip(p) { return '<span class="hm-tien kt-tien" data-kt="vang"><img src="' + this.a(KTA.vang) + '" alt="Gold"><b id="' + p + '-vang">0</b></span><span class="hm-tien kt-tien" data-kt="ngoc"><img src="' + this.a(KTA.ngoc) + '" alt="Gems"><b id="' + p + '-ngoc">0</b></span>'; },
  capNhat() {
    if (!this.el('kt')) return;
    for (const p of ['hm', 'kt']) { const v = this.el(p + '-vang'), n = this.el(p + '-ngoc'); if (v) v.textContent = this.so(KT.vang); if (n) n.textContent = this.so(KT.ngoc); }
    let c = {}; try { c = KT.coNhan(); } catch (e) { }
    document.querySelectorAll('.kt-cham[data-cham]').forEach(x => { x.hidden = !c[x.dataset.cham]; });
  },

  // ---------- mở / đóng / thẻ ----------
  moTab(k) {
    this.dung(); const kt = this.el('kt'); if (!kt) return;
    if (k && this.TAB[k]) this.tab = k;
    try { if (typeof HM !== 'undefined') HM.dong(true); } catch (e) { }
    kt.hidden = false; this.mo = true; this._ngay = KT.ngay();
    kt.querySelectorAll('.kt-tab button').forEach(b => { const on = b.dataset.tab === this.tab; b.classList.toggle('vang', on); b.setAttribute('aria-pressed', on); });
    this.el('kt-tde').textContent = { shop: 'SHOP', vq: 'LUCKY SPIN', nv: 'QUESTS', sk: 'WEEKLY EVENT' }[this.tab];
    this.ve(); this.el('kt-than').scrollTop = 0;
    clearInterval(this._dh); this._dh = setInterval(() => this.dem(), 1000); this.dem();
  },
  dong() { const kt = this.el('kt'); if (kt) kt.hidden = true; this.mo = false; clearInterval(this._dh); this.dongPhu(); this.capNhat(); },
  dem() { // đồng hồ đếm ngược + sang ngày mới khi đang mở
    if (!this.mo) return;
    if (KT.ngay() !== this._ngay) { this._ngay = KT.ngay(); this.ve(); }
    document.querySelectorAll('#kt [data-dh]').forEach(e => { e.textContent = KT.dongHo(KT.conLai(e.dataset.dh === 'tuan')); });
  },
  ve() {
    const t = this.el('kt-than'); if (!t) return;
    const st = t.scrollTop;
    t.innerHTML = this['ve_' + this.tab]();
    t.scrollTop = st;
    try { if (typeof OT !== 'undefined') OT.quet(t); } catch (e) { }
    this.capNhat(); this.dem();
  },
  gia(g, tat) { return '<span class="kt-gia' + (tat ? ' thieu' : '') + '"><img src="' + this.a(g.ngoc ? KTA.ngoc : KTA.vang) + '" alt="">' + this.so(g.ngoc || g.vang) + '</span>'; },
  // 1 phần thưởng nhỏ: ảnh + số
  rIc(r) {
    if (r.vang) return '<span class="kt-r"><img src="' + this.a(KTA.vang) + '" alt=""><b>' + this.so(r.vang) + '</b></span>';
    if (r.ngoc) return '<span class="kt-r"><img src="' + this.a(KTA.ngoc) + '" alt=""><b>' + this.so(r.ngoc) + '</b></span>';
    if (r.ruong) return '<span class="kt-r kt-r-ru"><img src="' + this.a(KTA.ru[r.ruong]) + '" alt="' + KTC.ruong[r.ruong].ten + '"></span>';
    if (r.the) {
      const id = r.the.id || (r.the.su ? KT.suKien() : null);
      if (id) return '<span class="kt-r kt-r-the">' + OT.mini(id) + '<b>×' + r.the.n + '</b></span>';
      return '<span class="kt-r kt-r-the"><i class="kt-bac"><img src="' + this.a('o_vien_' + r.the.bac) + '" alt=""><em>?</em></i><b>×' + r.the.n + '</b></span>';
    }
    return '';
  },
  rTen(r) {
    if (r.vang) return this.so(r.vang) + ' gold'; if (r.ngoc) return this.so(r.ngoc) + ' gems'; if (r.ruong) return KTC.ruong[r.ruong].ten.toLowerCase().replace(/^./, c => c.toUpperCase());
    if (r.the) { const id = r.the.id || (r.the.su ? KT.suKien() : null); return (id ? this.ten(id) : 'Random ' + TIERS[r.the.bac].ten.toLowerCase()) + ' ×' + r.the.n; }
    return '';
  },
  muc(t, phu) { return '<div class="kt-muc"><b>' + t + '</b>' + (phu ? '<small>' + phu + '</small>' : '') + '</div>'; },

  // ---------- SHOP ----------
  ve_shop() {
    const sp = KT.sp(), s = KT.doc();
    let h = '<div class="kt-bn"><img src="' + this.a(KTA.banner) + '" alt=""><div><b>DAILY SPECIALS</b><small>NEW IN <span data-dh="ngay"></span></small></div></div><div class="kt-sp">';
    for (const o of sp) {
      const cls = 'kt-o' + (o.da ? ' da' : '') + (o.free ? ' free' : '') + (o.bac === 'vang' || o.bac === 'do' ? ' hiem' : '');
      if (o.free) h += '<div class="' + cls + '">' + this.rIc(o.r) + '<small>DAILY GIFT</small><button class="hm-nut2 vang" data-act="kt-sp" data-i="' + o.i + '"' + (o.da ? ' disabled' : '') + '><b>' + (o.da ? 'CLAIMED' : 'FREE') + '</b></button></div>';
      else h += '<div class="' + cls + '"><span class="kt-r kt-r-the">' + OT.mini(o.id) + '<b>×' + o.n + '</b></span><small>' + this.ten(o.id) + '</small><button class="hm-nut2' + (o.da ? '' : ' vang') + '" data-act="kt-sp" data-i="' + o.i + '"' + (o.da ? ' disabled' : '') + '>' + (o.da ? '<b>SOLD</b>' : this.gia(o.gia, !KT.du(o.gia))) + '</button></div>';
    }
    h += '</div>' + this.muc('CHESTS') + '<div class="kt-ru">';
    for (const k in KTC.ruong) {
      const C = KTC.ruong[k];
      const phu = k === 'vang' ? 'Legendary in ≤ ' + (C.pityV - s.ru.pv) : k === 'than' ? '1 Mythic + 2 Legendary' : C.so + ' cards';
      h += '<div class="kt-rc kt-rc-' + k + '"><button class="hm-ic hm-ic1 kt-i" data-act="kt-tile" data-k="' + k + '" aria-label="Odds"><img src="' + this.a(KTA.tin) + '" alt=""></button>' +
        '<img class="kt-rc-anh" src="' + this.a(KTA.ru[k]) + '" alt=""><b>' + C.ten + '</b><small>' + phu + '</small>' +
        '<button class="hm-nut2 vang" data-act="kt-ru" data-k="' + k + '">' + this.gia(C.gia, !KT.du(C.gia)) + '</button></div>';
    }
    h += '</div>' + this.muc('GOLD') + '<div class="kt-doi">';
    KTC.doiVang.forEach((o, i) => { h += '<div class="kt-o kt-o-doi"><span class="kt-r"><img src="' + this.a(KTA.vang) + '" alt=""><b>' + this.so(o.vang) + '</b></span><button class="hm-nut2 vang" data-act="kt-doi" data-i="' + i + '">' + this.gia({ ngoc: o.ngoc }, KT.ngoc < o.ngoc) + '</button></div>'; });
    h += '</div>';
    // GÓI NGỌC (để dành cho bản lên store): chỉ hiện khi KTC.goiNgoc có gói — hiện tại trống → không hiện, không có mã thanh toán
    if (KTC.goiNgoc.length) h += this.muc('GEM PACKS') + '<div class="kt-doi">' + KTC.goiNgoc.map(g => '<div class="kt-o kt-o-doi"><span class="kt-r"><img src="' + this.a(KTA.ngoc) + '" alt=""><b>' + this.so(g.ngoc) + '</b></span><button class="hm-nut2" disabled><b>SOON</b></button></div>').join('') + '</div>';
    return h + '<p class="kt-chu">Gems are earned only by playing: quests, login, events, achievements.</p>';
  },
  // ---------- VÒNG QUAY ----------
  ve_vq() {
    const v = KT.vq(), g = this._goc || 0;
    let h = '<div class="kt-vq"><img class="kt-vq-khung" src="' + this.a(KTA.banhKhung) + '" alt=""><div class="kt-vq-banh" id="kt-banh" style="transform:rotate(' + g + 'deg)"><img class="kt-vq-anh" src="' + this.a(KTA.banh) + '" alt="">';
    KTC.vq.forEach((o, i) => { h += '<span class="kt-vq-o" style="--a:' + (i * 45 + 22.5) + 'deg">' + (o.jack ? '<span class="kt-r kt-r-jack"><img src="' + this.a(KTA.sao) + '" alt=""><b>JACKPOT</b></span>' : this.rIc(o.r)) + '</span>'; });
    h += '</div><img class="kt-vq-mui" src="' + this.a(KTA.mui) + '" alt=""></div>';
    h += '<div class="kt-vq-nut"><button class="hm-nut2 vang" data-act="kt-quay" data-tra="0"' + (v.free ? ' disabled' : '') + '><b>' + (v.free ? 'FREE IN' : 'FREE SPIN') + '</b>' + (v.free ? '<small data-dh="ngay"></small>' : '') + '</button>' +
      '<button class="hm-nut2 vang" data-act="kt-quay" data-tra="1"' + (v.tra >= KTC.vqMax ? ' disabled' : '') + '>' + this.gia({ ngoc: KTC.vqGia }, KT.ngoc < KTC.vqGia) + '<small>' + (KTC.vqMax - v.tra) + '/' + KTC.vqMax + ' LEFT</small></button></div>' +
      '<button class="kt-lk" data-act="kt-tile" data-k="vq"><img src="' + this.a(KTA.tin) + '" alt="">ODDS</button>';
    return h;
  },
  // ---------- NHIỆM VỤ ----------
  ve_nv() {
    const dn = KT.dn(), nv = KT.nv(), s = KT.doc();
    let h = this.muc('DAILY LOGIN', 'DAY ' + (dn.i + 1) + ' / 7') + '<div class="kt-dn">';
    KTC.dn.forEach((r, i) => {
      const da = i < dn.i || (i === dn.i && !dn.duoc), nay = i === dn.i && dn.duoc;
      h += '<div class="kt-dn-o' + (da ? ' da' : '') + (nay ? ' nay' : '') + '"><small>DAY ' + (i + 1) + '</small>' + this.rIc(r) + (da ? '<img class="kt-tick" src="' + this.a(KTA.xong) + '" alt="">' : '') + '</div>';
    });
    h += '</div><button class="hm-nut2 vang kt-dn-nut" data-act="kt-dn"' + (dn.duoc ? '' : ' disabled') + '><b>' + (dn.duoc ? 'CLAIM DAY ' + (dn.i + 1) : 'NEXT IN') + '</b>' + (dn.duoc ? '' : '<small data-dh="ngay"></small>') + '</button>';
    h += this.muc('DAILY QUESTS', 'NEW IN <span data-dh="ngay"></span>');
    for (const q of nv) h += this.hangNv(q.ten, q, q.r, 'kt-nv', q.id);
    const tatCa = nv.every(q => q.da);
    h += this.hangNv('Complete all 3 quests', { t: nv.filter(q => q.da).length, can: 3, xong: tatCa, da: !!s.nv.bonus }, KTC.nvBonus, 'kt-nvb', 'b');
    h += this.muc('ACHIEVEMENTS');
    for (const a of KT.tt().sort((x, y) => (y.xong && !y.da) - (x.xong && !x.da) || x.da - y.da)) h += this.hangNv(a.ten, a, a.r, 'kt-tt', a.id);
    return h;
  },
  hangNv(ten, q, r, act, id) {
    const t = { n: q.t, can: q.can, max: false }, nut = q.da ? '<img class="kt-tick" src="' + this.a(KTA.xong) + '" alt="Claimed">' : '<button class="kt-slot' + (q.xong ? ' vang' : '') + '" data-act="' + act + '" data-id="' + id + '"' + (q.xong ? '' : ' disabled') + '><b>' + (q.xong ? 'CLAIM' : this.so(q.t) + '/' + this.so(q.can)) + '</b></button>';
    return '<div class="kt-h' + (q.da ? ' da' : q.xong ? ' xong' : '') + '">' + this.rIc(r) + '<div class="kt-h-g"><b>' + ten + '</b>' + TBUI.thanh(t) + '</div>' + nut + '</div>';
  },
  // ---------- SỰ KIỆN ----------
  ve_sk() {
    const id = KT.suKien(), e = KT.sk(), ds = KT.skDs(), cuoi = KTC.sk[KTC.sk.length - 1][0];
    let h = '<div class="kt-skd"><img class="kt-skd-bn" src="' + this.a(KTA.bannerSk) + '" alt="">' + (id ? OT.mini(id) : '') + '<div><small>FEATURED TURRET</small><b>' + (id ? this.ten(id) : '') + '</b><small>ENDS IN <span data-dh="tuan"></span></small></div></div>';
    h += '<div class="kt-skp"><b>' + this.so(e.diem) + '</b><small>EVENT POINTS</small>' + TBUI.thanh({ n: Math.min(e.diem, cuoi), can: cuoi, max: false }) + '<p class="kt-chu">Every battle in any mode: wave reached + 10 for a win + 5 per boss (max ' + KTC.skMax + ').</p></div>';
    for (const m of ds) h += this.hangNv(this.rTen(m.r), { t: Math.min(e.diem, m.d), can: m.d, xong: m.xong, da: m.da }, m.r, 'kt-sk', m.i);
    return h;
  },

  // ---------- lớp phủ: tỉ lệ / thưởng / mở rương ----------
  phu(html, cls) { const p = this.el('kt-phu'); p.className = 'kt-phu ' + (cls || ''); p.innerHTML = '<div class="kt-phu-nen" data-act="kt-phu-dong"></div><div class="kt-phu-tam">' + html + '</div>'; p.hidden = false; try { OT.quet(p); } catch (e) { } return p; },
  dongPhu() { const p = this.el('kt-phu'); if (p) { p.hidden = true; p.innerHTML = ''; } clearTimeout(this._lat); this._ruong = null; },
  tiLe(k) {
    const pc = (v) => (v >= 10 ? v.toFixed(0) : v >= 1 ? v.toFixed(1) : v.toFixed(2)) + '%';
    let h;
    if (k === 'vq') {
      const a = KT.vqTiLe(false), b = KT.vqTiLe(true);
      h = '<b class="kt-phu-t">SPIN ODDS</b><table class="kt-bang"><tr><th></th><th>FREE</th><th>GEMS</th></tr>' + KTC.vq.map((o, i) => '<tr><td>' + (o.jack ? 'Jackpot' : this.rTen(o.r)) + '</td><td>' + pc(a[i]) + '</td><td>' + pc(b[i]) + '</td></tr>').join('') + '</table>' +
        '<p class="kt-chu">Jackpot: free spin = 1 Legendary copy. Gem spin = Legendary (70%) or Mythic (30%) → Mythic ' + pc(b[7] * 0.3) + ' per gem spin.</p>';
    } else {
      const C = KTC.ruong[k], s = KT.doc();
      h = '<b class="kt-phu-t">' + C.ten + ' · ' + C.so + ' CARDS</b><table class="kt-bang"><tr><th></th><th>PER CARD</th><th>≥1 IN CHEST</th></tr>' +
        TIER_LIST.map(b => '<tr class="b-' + b + '"><td>' + TIERS[b].ten + '</td><td>' + pc(C.tiLe[b] || 0) + '</td><td>' + pc(KT.coIt(k, b) * 100) + '</td></tr>').join('') + '</table>';
      const g = [];
      if (C.bao && C.bao.tim) g.push('At least 1 Epic or better.');
      if (C.bao && C.bao.do) g.push('Guaranteed ' + C.bao.do + ' Mythic + ' + C.bao.vang + ' Legendary.');
      if (C.pityV) g.push('Pity: a Legendary at least every ' + C.pityV + ' Gold Chests (now ' + s.ru.pv + '/' + C.pityV + ').');
      if (C.pityD) g.push('Pity: a Mythic at least every ' + C.pityD + ' Gold Chests (now ' + s.ru.pd + '/' + C.pityD + ').');
      h += '<p class="kt-chu">' + g.join(' ') + ' Copies per card: Common 4–8, Rare 2–4, Epic 1–2, Legendary/Mythic 1.</p>';
    }
    this.phu(h + '<button class="hm-nut2 vang kt-ok" data-act="kt-phu-dong"><b>OK</b></button>', 'kt-tl');
  },
  // bảng nhận thưởng (gộp vàng/ngọc/thẻ)
  nhan(ra, tde) {
    if (!ra) return;
    if (ra.ruong) { this.moRuongAnim(ra.ruong, ra); return; }
    const ds = []; if (ra.vang) ds.push(this.rIc({ vang: ra.vang })); if (ra.ngoc) ds.push(this.rIc({ ngoc: ra.ngoc }));
    for (const x of ra.the || []) ds.push('<span class="kt-r kt-r-the">' + OT.mini(x.id) + '<b>×' + x.n + '</b><small>' + this.ten(x.id) + '</small></span>');
    try { SND.nang(3); } catch (e) { }
    this.phu('<b class="kt-phu-t">' + (tde || 'YOU GOT') + '</b><div class="kt-nhan">' + ds.join('') + '</div><button class="hm-nut2 vang kt-ok" data-act="kt-phu-dong"><b>OK</b></button>', 'kt-nh');
  },
  // MỞ RƯƠNG 4 nhịp (REVIEW-VFX-93 §VI.H, tuvan/vfx/p1): chốt bật 0,28 s → khe sáng 0,28 s (rương VÀNG/THẦN 0,42 s) → nắp mở + bung
  //  → thẻ bay ra khỏi rương rồi lật 0,24 s/thẻ → tổng; chạm = bỏ qua. Trước đây lắc 0,9 s mới mở.
  moRuongAnim(r, them) {
    const giam = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this._ruong = { r, b: 0, them };
    const the = r.the.map((x, i) => '<span class="kt-lat b-' + x.bac + '" data-i="' + i + '"><img class="kt-lat-q" src="' + this.a(KTA.quang) + '" alt=""><img class="kt-lat-l" src="' + this.a(KTA.lung) + '" alt=""><span class="kt-lat-m">' + OT.mini(x.id) + '<b>×' + x.n + '</b></span></span>').join('');
    const p = this.phu('<div class="kt-mr" data-act="kt-boqua"><div class="kt-mr-ru"><span class="kt-mr-fx"><img src="' + this.a(KTA.fx) + '" alt=""></span><img class="kt-mr-anh" src="' + this.a(KTA.ru[r.k]) + '" alt="">' + (KTA.khe ? '<img class="kt-mr-khe" src="' + this.a(KTA.khe) + '" alt="">' : '') + '</div>' +
      '<b class="kt-phu-t">' + KTC.ruong[r.k].ten + '</b><div class="kt-mr-the">' + the + '</div><small class="kt-mr-cham">TAP TO SKIP</small>' +
      '<div class="kt-mr-tong" hidden></div></div>', 'kt-mo');
    const mr = p.querySelector('.kt-mr');
    const hiem = r.k !== 'thuong', T1 = giam ? 40 : 280, T2 = giam ? 40 : hiem ? 420 : 280;
    mr.classList.add('chot'); try { SND.nut(); } catch (e) { }
    const lat = (i) => {
      const c = mr.querySelectorAll('.kt-lat'); if (!this._ruong || this._ruong.r !== r) return;
      if (i >= c.length) return this.tongRuong();
      c[i].classList.add('mo'); this._ruong.b = i + 1;
      try { const b = r.the[i].bac; if (b === 'vang' || b === 'do') SND.nang(5); else SND.nut(); } catch (e) { }
      this._lat = setTimeout(() => lat(i + 1), giam ? 60 : 240);
    };
    this._lat = setTimeout(() => {
      if (!this._ruong || this._ruong.r !== r) return;
      mr.classList.remove('chot'); mr.classList.add('khe'); try { SND.nang(hiem ? 3 : 2); } catch (e) { }
      this._lat = setTimeout(() => {
        if (!this._ruong || this._ruong.r !== r) return;
        mr.classList.remove('khe'); mr.classList.add('bung', 'bay'); this.el('kt-phu').querySelector('.kt-mr-anh').src = this.a(KTA.ruMo[r.k]);
        this._lat = setTimeout(() => lat(0), giam ? 50 : 360);
      }, T2);
    }, T1);
  },
  boQua() {
    const x = this._ruong; if (!x) return;
    clearTimeout(this._lat);
    const mr = this.el('kt-phu').querySelector('.kt-mr'); if (!mr) return;
    if (mr.querySelector('.kt-mr-tong:not([hidden])')) return;
    mr.classList.remove('lac', 'chot', 'khe'); mr.classList.add('bung', 'bay');
    mr.querySelector('.kt-mr-anh').src = this.a(KTA.ruMo[x.r.k]);
    mr.querySelectorAll('.kt-lat').forEach(c => c.classList.add('mo'));
    this.tongRuong();
  },
  tongRuong() {
    const x = this._ruong; if (!x) return;
    const mr = this.el('kt-phu').querySelector('.kt-mr'), t = mr.querySelector('.kt-mr-tong');
    const dem = {}; for (const c of x.r.the) dem[c.bac] = (dem[c.bac] || 0) + c.n;
    let h = '<div class="kt-mr-dem">' + TIER_LIST.filter(b => dem[b]).map(b => '<span class="b-' + b + '"><img src="' + this.a('ngoc_' + b) + '" alt="">' + TIERS[b].ten + ' ×' + dem[b] + '</span>').join('') + '</div>';
    if (x.r.pityV) h += '<small>Pity: Legendary guaranteed!</small>';
    if (x.r.pityD) h += '<small>Pity: Mythic guaranteed!</small>';
    t.innerHTML = h + '<button class="hm-nut2 vang kt-ok" data-act="kt-phu-dong"><b>OK</b></button>';
    t.hidden = false; mr.classList.add('xong'); mr.removeAttribute('data-act');
    try { TBUI.capLuoi(); } catch (e) { }
  },
  // vòng quay: quay tới ô o (ô o nằm dưới mũi tên ở đỉnh)
  quay(tra) {
    if (this._quay) return;
    const kq = KT.vqQuay(tra); if (!kq) { this.ve(); return; }
    const b = this.el('kt-banh'), giam = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cu = this._goc || 0, dich = cu - (cu % 360) + 360 * 5 + (360 - kq.o * 45 - 22.5 + 360) % 360 + ((this.bam = (this.bam || 0) + 1) % 2 ? 9 : -9);
    this._goc = dich; this._quay = 1;
    try { SND.nut(); } catch (e) { }
    if (b) { b.style.transition = 'transform ' + (giam ? 0.2 : 3.6) + 's cubic-bezier(.12,.72,.18,1)'; void b.offsetWidth; b.style.transform = 'rotate(' + dich + 'deg)'; }
    setTimeout(() => { this._quay = 0; this.ve(); this.nhan(kq.ra, kq.ra.the.some(x => THEBAI.bac(x.id) === 'do') ? 'JACKPOT!' : 'YOU WON'); }, giam ? 300 : 3800);
  },
  // màn kết quả: điểm sự kiện (gọn — 1 dòng trong ô REWARDS)
  veKetQua(r) {
    const d = document.querySelector('#ketqua .tb-kq'); if (!d || !r || !r.diem) return;
    let e = d.querySelector('.kt-kq'); if (!e) { e = document.createElement('small'); e.className = 'kt-kq'; d.appendChild(e); }
    e.textContent = 'EVENT +' + r.diem + ' PTS';
  },

  bam_(e) {
    const b = e.target.closest && e.target.closest('[data-act^="kt-"]'); if (!b || b.disabled) return;
    const a = b.dataset.act; e.stopPropagation();
    const nut = () => { try { SND.nut(); } catch (er) { } };
    switch (a) {
      case 'kt-mo': nut(); this.moTab(b.dataset.tab); break;
      case 'kt-dong': nut(); this.dong(); break;
      case 'kt-tab': nut(); this.moTab(b.dataset.tab); break;
      case 'kt-phu-dong': if (this._ruong && !this.el('kt-phu').querySelector('.kt-mr-tong:not([hidden])')) { this.boQua(); break; } this.dongPhu(); this.ve(); break;
      case 'kt-boqua': this.boQua(); break;
      case 'kt-tile': nut(); this.tiLe(b.dataset.k); break;
      case 'kt-sp': { const ra = KT.spMua(+b.dataset.i); if (ra) { this.ve(); this.nhan(ra); } else this.lac(b); break; }
      case 'kt-ru': { const r = KT.moRuong(b.dataset.k); if (r) { this.ve(); this.moRuongAnim(r); } else this.lac(b); break; }
      case 'kt-doi': { const ra = KT.doi(+b.dataset.i); if (ra) { this.ve(); this.nhan(ra); } else this.lac(b); break; }
      case 'kt-quay': this.quay(b.dataset.tra === '1'); break;
      case 'kt-dn': { const ra = KT.dnNhan(); this.ve(); this.nhan(ra); break; }
      case 'kt-nv': { const ra = KT.nvNhan(b.dataset.id); this.ve(); this.nhan(ra); break; }
      case 'kt-nvb': { const ra = KT.nvBonus(); this.ve(); this.nhan(ra); break; }
      case 'kt-tt': { const ra = KT.ttNhan(b.dataset.id); this.ve(); this.nhan(ra); break; }
      case 'kt-sk': { const ra = KT.skNhan(+b.dataset.id); this.ve(); this.nhan(ra); break; }
    }
  },
  lac(b) { b.classList.remove('kt-lac'); void b.offsetWidth; b.classList.add('kt-lac'); },
};

(function () {
  if (typeof KT === 'undefined') return;
  const lam = () => { try { KTUI.dung(); KTUI.capNhat(); } catch (e) { console.error('KTUI', e); } };
  if (document.getElementById('hm')) lam(); else document.addEventListener('DOMContentLoaded', lam);
  document.addEventListener('click', (e) => KTUI.bam_(e));
  // HOME vẽ lại → cập nhật chip + chấm đỏ; vào trận → đóng màn cửa hàng
  if (typeof HM !== 'undefined') { const v = HM.veHome; HM.veHome = function () { const x = v.apply(this, arguments); try { lam(); } catch (e) { } return x; }; }
  if (typeof batDau === 'function') { const g = batDau; batDau = function () { try { if (KTUI.mo) KTUI.dong(); } catch (e) { } return g.apply(this, arguments); }; }
})();
