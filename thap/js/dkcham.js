// TURRET MERGE — CHẠM ở màn XÂY BỘ BÀI kiểu DCDW / Random Dice (người dùng: "ấn tướng ở dòng deck trên cùng là bỏ ra khỏi deck,
//  hoặc nên như nào để user không khó chịu"). Nhanh + dễ sửa sai, không bảng hỏi:
//  · Chạm ụ ở HÀNG BỘ BÀI = bỏ ngay (chân dung co + mờ 180 ms), ô thành ổ trống (nut_cong.png), thẻ lưới hết mờ, đếm 4/5.
//    Các ô KHÁC giữ nguyên chỗ (bộ bài theo VỊ TRÍ: DC.o = 5 ô, null = trống; UI.chon = DC.o bỏ trống — mọi code cũ vẫn đọc UI.chon).
//  · Chạm thẻ LƯỚI: chưa trong bộ + còn ô trống → bay vào ô vừa bỏ (hoặc ô trống đầu tiên).
//    Chưa trong bộ + bộ đủ 5 → CHẾ ĐỘ ĐỔI: thẻ nhấc lên, 5 ô sáng nhịp (khung_chon.png) — chạm 1 ô = thay ụ đó; chạm chỗ khác / chạm lại thẻ = huỷ.
//    Đã trong bộ → ô của nó sáng 1 nhịp (không đổi gì); chạm lại trong 1,5 s = bỏ (như chạm ô).
//  · GIỮ ~400 ms (ô hoặc thẻ, không xê dịch) = trang chi tiết ụ (UP.mo). Kéo-thả (js/dkkeo.js) giữ nguyên: thả lên ô = thay.
//  · Luật: tối đa 1 Mythic, không trùng. Sai luật = ô gây lỗi lắc ngắn + ửng đỏ, không chữ.
//  · PLAY: mờ khi < 5 (không disabled → chạm được) — chạm = các ổ trống nhịp. Bộ mẫu PRESET 1–6 = 6 bộ của người chơi, TỰ LƯU sau mỗi thay đổi.
//    RANDOM: còn ổ trống = lấp ổ trống; đủ 5 = quay lại cả bộ.
//  Màn bộ bài dùng chung cho SOLO / CO-OP / PVP / ONLINE (sảnh: nút DECK → cùng màn) → một chỗ sửa là đủ (QUY-TAC-HINH 6).
//  Hình: chỉ ảnh có sẵn (nut_cong, khung_chon, chân dung) — code chỉ dịch/phóng/mờ/lọc màu ngắn (QUY-TAC-HINH 1–3). Hợp đồng DOM quy tắc 10 giữ.
'use strict';
const DC = {
  o: [null, null, null, null, null], trongCuoi: -1, cho: null, nhay: { id: null, t: 0 }, _ke: null, pre: null, PKEY: 'turret_pre',
  GIU_TT: 400,
  $: (id) => document.getElementById(id),
  giam: () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches),
  gon: (o) => o.filter(Boolean),
  oS: () => [...document.querySelectorAll('#chon-bo .o-bo')],
  bac: (id) => (G.rosterMap[id] && G.rosterMap[id].bac) || 'trang',
  coSan: () => !!(typeof G !== 'undefined' && G.rosterMap && G.roster && G.roster.length && typeof SKILLS !== 'undefined'),
  // đang ở màn bộ bài (không bộ sưu tập, không trong trận); `upMo` = cho phép khi trang chi tiết đang mở
  dangDeck(upMo) {
    const c = this.$('chon');
    if (!c || c.hidden || !c.classList.contains('xem-dk') || c.classList.contains('bst') || (G.ban && G.ban.length)) return false;
    return upMo || !(typeof UP !== 'undefined' && UP.el && !UP.el.hidden);
  },
  rung(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { } },
  am() { try { SND.nut(); } catch (e) { } },

  // ---------- bộ bài theo vị trí ----------
  // khớp DC.o với UI.chon (ai đó đổi UI.chon: RANDOM, bộ mẫu, trang chi tiết, kéo-thả, online…)
  khop() {
    const ch = UI.chon.filter((x, i, a) => x && G.rosterMap[x] && a.indexOf(x) === i).slice(0, 5);
    if (!this._dau) { // lần đầu: lấy lại vị trí ổ trống từ bộ mẫu đã lưu (turret_bo chỉ lưu bộ dồn)
      this._dau = 1;
      try { const l = JSON.parse(localStorage.getItem(this.PKEY) || 'null'), d = l && Array.isArray(l.ds) && l.ds[l.cur | 0]; if (d && Array.isArray(d.o) && this.gon(d.o).join() === ch.join()) this._ke = d.o.slice(0, 5); } catch (e) { }
    }
    const cu = this.o, gon = this.gon(cu);
    let moi = null;
    if (this._ke && this.gon(this._ke).join() === ch.join()) moi = this._ke.slice(0, 5);
    else if (gon.length === ch.length && gon.every((x, i) => x === ch[i])) moi = cu;
    else if (ch.length === 5 && ch.filter(x => !gon.includes(x)).length > 1) moi = ch.slice(); // cả bộ mới (bộ mẫu, RANDOM)
    else {
      moi = [null, null, null, null, null];
      cu.forEach((x, i) => { if (x && ch.includes(x)) moi[i] = x; else if (x) this.trongCuoi = i; });
      for (const x of ch) if (!moi.includes(x)) {
        const i = this.trongCuoi >= 0 && !moi[this.trongCuoi] ? this.trongCuoi : moi.indexOf(null);
        if (i < 0) break; moi[i] = x; if (i === this.trongCuoi) this.trongCuoi = -1;
      }
    }
    while (moi.length < 5) moi.push(null);
    this._ke = null;
    const doi = moi.join() !== cu.join();
    this.o = moi; UI.chon = this.gon(moi);
    if (this.trongCuoi >= 0 && moi[this.trongCuoi]) this.trongCuoi = -1;
    return doi;
  },
  // xếp lại DOM 5 ô theo DC.o (ui.js vẽ ô dồn trái) + ổ trống có nut_cong
  xepO() {
    const b = this.$('chon-bo'); if (!b) return;
    const ns = [...b.querySelectorAll(':scope > .o-bo')]; if (ns.length !== 5) return;
    const co = new Map(ns.filter(n => n.dataset.id).map(n => [n.dataset.id, n])), trong = ns.filter(n => !n.dataset.id);
    const sau = b.querySelector(':scope > .o-mv');
    this.o.forEach((id, i) => {
      const n = (id && co.get(id)) || trong.shift(); if (!n) return;
      n.dataset.slot = i;
      if (b.children[i] !== n) b.insertBefore(n, b.children[i] || sau || null);
      if (!n.dataset.id) {
        n.setAttribute('aria-label', 'Empty slot');
        if (!n.querySelector(':scope > img.dc-cong')) { const im = document.createElement('img'); im.className = 'dc-cong'; im.src = 'assets/nut_cong.png'; im.alt = ''; im.draggable = false; n.appendChild(im); }
      } else n.setAttribute('aria-label', ((G.rosterMap[n.dataset.id] || {}).ten || '') + ': tap to remove, hold for details');
    });
  },
  // PLAY: mờ (không disabled) khi thiếu
  nutChoi() {
    const nv = this.$('nut-vao'); if (!nv) return;
    const thieu = UI.chon.length !== 5;
    nv.disabled = false; nv.classList.toggle('dc-tat', thieu); nv.setAttribute('aria-disabled', thieu ? 'true' : 'false');
  },
  // áp bộ mới theo vị trí + vẽ lại + lưu
  dat(o) {
    this._ke = o.slice(0, 5); UI.chon = this.gon(o);
    if (typeof HM !== 'undefined') { HM.armed = -1; HM.luuBo(); }
    UI.veBoChon();
  },

  // ---------- bộ mẫu PRESET 1–6 (tự lưu) ----------
  sach(d) { // bộ đọc từ máy: lọc ụ lạ / trùng / Mythic thứ 2
    const o = [null, null, null, null, null]; let coDo = false; const da = [];
    (Array.isArray(d && d.o) ? d.o : []).slice(0, 5).forEach((id, i) => {
      if (!id || !SKILLS[id] || !G.rosterMap[id] || da.includes(id)) return;
      if (this.bac(id) === 'do') { if (coDo) return; coDo = true; }
      o[i] = id; da.push(id);
    });
    return { o, mv: (d && MAVUONG[d.mv]) ? d.mv : (MAVUONG[UI.mv] ? UI.mv : 'hero') };
  },
  napPre() {
    if (this.pre || !this.coSan() || typeof BOBAI === 'undefined') return;
    let l = null; try { l = JSON.parse(localStorage.getItem(this.PKEY) || 'null'); } catch (e) { }
    if (l && Array.isArray(l.ds) && l.ds.length === 6) {
      this.pre = { cur: Math.max(0, Math.min(5, l.cur | 0)), ds: l.ds.map(d => this.sach(d)) };
      return;
    }
    // lần đầu: 6 bộ khởi đầu; bộ đang dùng = bộ mẫu trùng nó, không thì ghi vào bộ 1
    const ds = BOBAI.DS.filter(a => BOBAI.hopLe(a)).slice(0, 6).map(a => ({ o: a.deck.slice(0, 5), mv: a.mv }));
    while (ds.length < 6) ds.push({ o: [null, null, null, null, null], mv: UI.mv });
    let cur = ds.findIndex(d => d.o.length === UI.chon.length && d.o.every(x => UI.chon.includes(x)) && d.mv === UI.mv);
    if (cur < 0) { cur = 0; ds[0] = { o: this.o.slice(), mv: UI.mv }; }
    this.pre = { cur, ds: ds.map(d => this.sach(d)) };
    this.luuPre();
  },
  luuPre() {
    if (!this.pre) return;
    const d = this.pre.ds[this.pre.cur], o = this.o.slice();
    if (d && d.o.join() === o.join() && d.mv === UI.mv && this._daLuu) return;
    this.pre.ds[this.pre.cur] = { o, mv: UI.mv }; this._daLuu = 1;
    try { localStorage.setItem(this.PKEY, JSON.stringify(this.pre)); } catch (e) { }
  },
  chonPre(i) {
    this.napPre(); if (!this.pre || i < 0 || i > 5) return;
    this.huyDoi();
    if (i === this.pre.cur) { this.nhipO(this.oS()); return; }
    this.luuPre();
    this.pre.cur = i; const d = this.sach(this.pre.ds[i]);
    UI.mv = d.mv; this.trongCuoi = -1;
    this.dat(d.o); if (typeof HM !== 'undefined') HM.ve();
    this.am(); this.rung(6);
    this.nhipO(this.oS().filter(o => o.dataset.id));
  },
  vePre() {
    const p = this.$('dkd-pre'); if (!p || !this.pre) return;
    const h = '<span class="dkd-pre-t">PRESET</span>' + this.pre.ds.map((d, i) => '<button class="hm-chip dkd-so' + (i === this.pre.cur ? ' on' : '') + '" data-act="dc-pre" data-i="' + i + '" aria-pressed="' + (i === this.pre.cur) + '" aria-label="Deck preset ' + (i + 1) + '">' + (i + 1) + '</button>').join('');
    if (p._dc !== h || !p.querySelector('[data-act="dc-pre"]')) { p.innerHTML = h; p._dc = h; }
  },

  // ---------- phản hồi ở ô (ảnh có sẵn; code chỉ phóng/mờ/lọc màu ngắn) ----------
  lop(o, c, ms) { if (!o) return; o.classList.remove(c); void o.offsetWidth; o.classList.add(c); clearTimeout(o['_' + c]); o['_' + c] = setTimeout(() => o.classList.remove(c), ms); },
  nhipO(ds) { if (this.giam()) return; ds.forEach(o => this.lop(o, 'dc-nhip', 520)); },
  sang(o) { this.lop(o, 'dc-sang', 620); },
  sai(i) { // luật Mythic: ô gây lỗi lắc + ửng đỏ
    const o = this.oS()[i]; this.lop(o, 'dc-sai', 420); this.rung([12, 40, 12]); this.am();
  },
  iDo() { return this.o.findIndex(x => x && this.bac(x) === 'do'); },
  // chân dung cũ co + mờ tại ô i
  co(id, i) {
    const o = this.oS()[i], w = this.$('wrap'); if (!o || !w || this.giam()) return;
    const rw = w.getBoundingClientRect(), k = rw.width / (typeof W !== 'undefined' ? W : rw.width), b = o.getBoundingClientRect();
    const im = document.createElement('img'); im.className = 'dc-ma'; im.src = thumbOf(id); im.alt = '';
    const s = Math.min(b.width, b.height) / k * 0.84;
    im.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + ((b.left + b.width / 2 - rw.left) / k - s / 2) + 'px;top:' + ((b.top + b.height / 2 - rw.top) / k - s / 2) + 'px';
    w.appendChild(im);
    const an = im.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.55)' }], { duration: 180, easing: 'cubic-bezier(0.4, 0, 1, 1)' });
    an.onfinish = () => im.remove();
  },
  // chân dung bay thẻ lưới → ô i (thay HM.bay: ô theo vị trí)
  bay(id, i) {
    const o = this.oS()[i]; if (!o) return;
    const xong = () => this.sang(o);
    const the = document.querySelector('#chon-luoi .c[data-id="' + id + '"]:not([hidden])'), w = this.$('wrap');
    if (this.giam() || !the || !w) return xong();
    const rw = w.getBoundingClientRect(), k = rw.width / W, a = the.getBoundingClientRect(), b = o.getBoundingClientRect();
    if (a.bottom < rw.top || a.top > rw.bottom || !a.width) return xong();
    const im = document.createElement('img'); im.className = 'hm-bay'; im.src = portraitOf(id);
    const s = 56, x0 = (a.left + a.width / 2 - rw.left) / k - s / 2, y0 = (a.top + a.height * 0.45 - rw.top) / k - s / 2, x1 = (b.left + b.width / 2 - rw.left) / k - s / 2, y1 = (b.top + b.height / 2 - rw.top) / k - s / 2;
    im.style.left = x0 + 'px'; im.style.top = y0 + 'px'; w.appendChild(im);
    o.classList.add('dc-cho'); // ô chưa hiện ảnh cho tới khi chân dung bay tới
    const an = im.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: 'translate(' + (x1 - x0) + 'px,' + (y1 - y0) + 'px) scale(.9)' }], { duration: 230, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
    an.onfinish = an.oncancel = () => { im.remove(); o.classList.remove('dc-cho'); xong(); };
  },

  // ---------- thao tác ----------
  boO(i) {
    const id = this.o[i]; if (!id) return;
    this.huyDoi();
    const o = this.o.slice(); o[i] = null; this.trongCuoi = i;
    this.co(id, i);
    this.dat(o); this.am(); this.rung(6);
    if (!this.giam()) this.lop(this.oS()[i], 'dc-vao', 260);
  },
  them(id) {
    if (UI.chon.includes(id)) return;
    const l = DK.loi(UI.chon, id);
    if (l) { const d = this.iDo(); if (this.bac(id) === 'do' && d >= 0) this.sai(d); return; }
    const o = this.o.slice(), i = this.trongCuoi >= 0 && !o[this.trongCuoi] ? this.trongCuoi : o.indexOf(null);
    if (i < 0) return;
    o[i] = id; this.trongCuoi = -1;
    const du = this.gon(o).length === 5;
    this.dat(o); this.am(); this.rung(6);
    this.bay(id, i);
    if (du && typeof HM !== 'undefined') HM.duBo();
  },
  // chế độ đổi (bộ đủ 5)
  batDoi(id) {
    const hop = this.o.map((_, i) => !!DK.thuThe(id, i).bo);
    if (!hop.some(Boolean)) { const d = this.iDo(); if (d >= 0) this.sai(d); return; }
    this.huyDoi(true);
    this.cho = id;
    const the = document.querySelector('#chon-luoi .c[data-id="' + id + '"]'); if (the) the.classList.add('dc-nhac');
    const b = this.$('chon-bo'); if (b) b.classList.add('dc-doi');
    this.oS().forEach((o, i) => {
      o.classList.toggle('dc-hop', hop[i]);
      if (hop[i] && !o.querySelector(':scope > img.dc-vien')) { const v = document.createElement('img'); v.className = 'dc-vien'; v.src = 'assets/khung_chon.png'; v.alt = ''; v.draggable = false; o.appendChild(v); }
    });
    this.am(); this.rung(6);
  },
  huyDoi(lang) {
    if (this.cho == null && !document.querySelector('.dc-nhac, #chon-bo.dc-doi')) return;
    this.cho = null;
    document.querySelectorAll('#chon-luoi .dc-nhac').forEach(c => c.classList.remove('dc-nhac'));
    const b = this.$('chon-bo'); if (b) b.classList.remove('dc-doi');
    document.querySelectorAll('#chon-bo .dc-vien').forEach(v => v.remove());
    this.oS().forEach(o => o.classList.remove('dc-hop'));
  },
  doiVao(i) {
    const id = this.cho; if (id == null) return;
    const r = DK.thuThe(id, i);
    if (!r.bo) { const d = this.iDo(); this.sai(d >= 0 && d !== i ? d : i); return; } // ô khác đang giữ Mythic
    const cu = this.o[i];
    this.huyDoi();
    const o = this.o.slice(); o[i] = id;
    if (cu) this.co(cu, i);
    this.dat(o); this.am(); this.rung(6);
    this.bay(id, i);
  },
  // chạm thẻ lưới
  chamThe(c) {
    const id = c.dataset.id;
    if (!SKILLS[id] || c.classList.contains('khoa')) { if (typeof UP !== 'undefined') UP.mo(id, c); return; } // ụ chưa có: trang chi tiết như cũ
    if (UI.chon.includes(id)) {
      const i = this.o.indexOf(id), t = performance.now();
      if (this.nhay.id === id && t - this.nhay.t < 1500) { this.nhay = { id: null, t: 0 }; return this.boO(i); }
      this.nhay = { id, t }; this.sang(this.oS()[i]); this.am(); return;
    }
    this.nhay = { id: null, t: 0 };
    if (UI.chon.length < 5) return this.them(id);
    return this.batDoi(id);
  },
  chamO(o) {
    const i = this.oS().indexOf(o); if (i < 0) return;
    if (this.cho != null) return this.doiVao(i);
    if (this.o[i]) return this.boO(i);
    this.nhipO([o]); // ổ trống: nhịp nhẹ
  },
  // PLAY khi thiếu: các ổ trống nhịp
  giuc() { this.nhipO(this.oS().filter(o => !o.dataset.id)); this.rung([8, 30, 8]); this.am(); },
  // RANDOM: lấp ổ trống / quay lại cả bộ
  ngauNhien() {
    this.huyDoi();
    if (UI.chon.length >= 5) { this.trongCuoi = -1; UI.chon = deckNgauNhien(); if (typeof HM !== 'undefined') HM.luuBo(); UI.veBoChon(); this.am(); this.nhipO(this.oS()); return; }
    const o = this.o.slice(), co = G.roster.filter(r => SKILLS[r.id] && !UI.chon.includes(r.id));
    let coDo = UI.chon.some(x => this.bac(x) === 'do'); const moi = [];
    for (let i = 0; i < 5; i++) {
      if (o[i]) continue;
      while (co.length) { const r = co.splice(Math.floor(Math.random() * co.length), 1)[0]; if (r.bac === 'do') { if (coDo) continue; coDo = true; } o[i] = r.id; moi.push(i); break; }
    }
    this.trongCuoi = -1;
    this.dat(o); this.am();
    const os = this.oS(); this.nhipO(moi.map(i => os[i]));
    if (UI.chon.length === 5 && typeof HM !== 'undefined') HM.duBo();
  },
};

(() => {
  if (typeof UP_XEM !== 'undefined' && UP_XEM) return;
  if (typeof UI === 'undefined' || typeof HM === 'undefined' || typeof DK === 'undefined') return;

  // vẽ ô bộ bài: khớp vị trí → (chuỗi bọc cũ) → xếp DOM theo vị trí + ổ trống + PLAY + lưu bộ mẫu
  const vb = UI.veBoChon;
  UI.veBoChon = function () {
    if (DC.coSan()) DC.khop();
    const r = vb.apply(this, arguments);
    try { DC.xepO(); DC.nutChoi(); DC.napPre(); DC.luuPre(); DC.vePre(); if (DC.cho != null && !UI.chon.length) DC.huyDoi(); } catch (e) { console.error('DC', e); }
    return r;
  };
  const vd = HM.veDeck;
  HM.veDeck = function () { const r = vd.apply(this, arguments); try { DC.nutChoi(); DC.napPre(); DC.vePre(); } catch (e) { } return r; };
  const lb = HM.luuBo;
  HM.luuBo = function () { const r = lb.apply(this, arguments); try { DC.luuPre(); } catch (e) { } return r; };
  if (typeof DKD !== 'undefined') { const dv = DKD.ve; DKD.ve = function () { const r = dv.apply(this, arguments); try { DC.napPre(); DC.vePre(); } catch (e) { } return r; }; }
  // xem nhanh (bảng hm-xem): bay theo ô vị trí
  HM.bay = function (id) { const i = DC.o.indexOf(id); if (i >= 0) DC.bay(id, i); };
  // rời màn bộ bài: huỷ chế độ đổi
  const di = HM.di;
  HM.di = function () { DC.huyDoi(); return di.apply(this, arguments); };

  // ---------- kéo-thả theo vị trí (js/dkkeo.js) ----------
  DK.thuThe = function (id, i) {
    const o = DC.o.slice(), j = o.indexOf(id);
    if (j >= 0) { if (i === j) return { bo: null, loi: '' }; [o[i], o[j]] = [o[j], o[i]]; return { bo: DC.gon(o), pos: o }; }
    const l = this.loi(DC.gon(o.map((x, k) => k === i ? null : x)), id); if (l) return { bo: null, loi: l };
    o[i] = id; return { bo: DC.gon(o), pos: o };
  };
  DK.thuO = function (j, i) {
    const o = DC.o.slice(); if (i === j) return { bo: null };
    [o[i], o[j]] = [o[j], o[i]]; return { bo: DC.gon(o), pos: o };
  };
  // thả: sai luật Mythic = ô Mythic đang có lắc + ửng đỏ (không chữ)
  DK.sai = function () {
    const k = this.keo; const d = DC.iDo(); if (d >= 0) DC.sai(d); else { DC.rung([12, 40, 12]); DC.am(); }
    if (!k) return; if (this.giam()) return this.ve();
    const p = this.diem();
    const a = k.ma.animate([0, -7, 7, -5, 5, 0].map(dx => ({ transform: this.tf(p.x + dx, p.y, 1.08) })), { duration: 240, easing: 'linear', fill: 'forwards' });
    a.onfinish = () => { if (this.keo === k) this.ve(); };
  };
  DK.dat = function (bo, id) {
    const k = this.keo, i = k.tren, r = k.tu === 'o' ? this.thuO(k.j, i) : this.thuThe(id, i);
    const truoc = UI.chon.length;
    if (r.pos) { DC.huyDoi(); DC.trongCuoi = -1; DC._ke = r.pos; } UI.chon = r.bo || bo; UI.veBoChon();
    if (typeof HM !== 'undefined') { HM.noi = id; HM.armed = -1; HM.luuBo(); HM.ve(); }
    DC.am();
    const o = DC.oS()[DC.o.indexOf(id)];
    const xong = () => { if (this.keo !== k) return; this.don(); DC.sang(o); };
    if (UI.chon.length === 5 && truoc < 5 && typeof HM !== 'undefined') HM.duBo();
    if (!o || this.giam()) return xong();
    const rr = o.getBoundingClientRect(), p = this.diem(), x1 = (rr.left + rr.width / 2 - k.rw.left) / k.s, y1 = (rr.top + rr.height / 2 - k.rw.top) / k.s;
    const a = k.ma.animate([{ transform: this.tf(p.x, p.y, 1.08), opacity: 1 }, { transform: this.tf(x1, y1, 0.92), opacity: 0.9 }], { duration: 140, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'forwards' });
    a.onfinish = xong;
  };
  const boGoc = DK.bo;
  DK.bo = function () { DC.huyDoi(); return boGoc.apply(this, arguments); };
  // GIỮ ~400 ms không xê dịch = trang chi tiết; nhả trước 400 ms mà không xê dịch = chạm (kể cả chạm chậm > 150 ms)
  const bd = DK.batDau;
  DK.batDau = function () {
    const d = this.d; if (!d) return bd.apply(this, arguments);
    const giu = Math.hypot(d.x - d.x0, d.y - d.y0) < this.NGUONG;
    bd.apply(this, arguments);
    const k = this.keo; if (!k || !giu) return;
    k.giu = true;
    k.tt = setTimeout(() => {
      if (this.keo !== k || k.ra || Math.hypot(k.x - k.x0, k.y - k.y0) > this.NGUONG) return;
      const el = k.el, id = k.id;
      DC.huyDoi();
      if (!this.giam()) k.ma.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, fill: 'forwards' });
      // chặn cú click sinh ra khi nhả tay (người chơi có thể giữ lâu hơn 350 ms của DK._chan)
      const nha = () => { removeEventListener('pointerup', nha, true); removeEventListener('pointercancel', nha, true); DC._giuNha = 0; DK._chan = performance.now() + 350; };
      DC._giuNha = 1; addEventListener('pointerup', nha, true); addEventListener('pointercancel', nha, true);
      setTimeout(() => { this.don(k); if (DC._giuNha) DK._chan = 1e15; }, this.giam() ? 0 : 90);
      k.ra = true; DC.rung(10);
      if (typeof UP !== 'undefined') { HM.noi = id; UP.mo(id, el); }
    }, Math.max(0, DC.GIU_TT - (performance.now() - d.t0)));
  };
  const tha = DK.tha;
  DK.tha = function () {
    const k = this.keo;
    if (k && !k.ra && k.giu && Math.hypot(k.x - k.x0, k.y - k.y0) <= this.NGUONG) { // nhả tại chỗ = chạm
      clearTimeout(k.tt); k.ra = true; this.don(k);
      try { const el = k.el; if (el && el.isConnected) { if (k.tu === 'o') DC.chamO(el); else DC.chamThe(el); } } catch (e) { console.error('DC', e); }
      return;
    }
    if (k) clearTimeout(k.tt);
    return tha.apply(this, arguments);
  };
  const don = DK.don;
  DK.don = function (kk) { const k = this.keo; if (k && (!kk || kk === k)) clearTimeout(k.tt); return don.apply(this, arguments); };

  // ---------- chạm (window click capture → HM.bam; bọc ngoài cùng, chạy trước ctdeck.js / home.js) ----------
  const bam = HM.bam;
  HM.bam = function (e) {
    const t = e.target; if (!t || !t.closest) return bam.apply(this, arguments);
    if (!DC.dangDeck()) { if (DC.cho != null) DC.huyDoi(); return bam.apply(this, arguments); }
    if (DK.vuaKeo() && t.closest('#chon-bo, #chon-luoi')) return bam.apply(this, arguments); // home.js nuốt click sau thả
    if (typeof CTD !== 'undefined' && CTD.cho != null) return bam.apply(this, arguments);
    const el = t.closest('[data-act]'), a = el && el.dataset.act;
    const nuot = () => { e.stopImmediatePropagation(); e.preventDefault(); };
    if (a === 'dc-pre') { nuot(); DC.chonPre(+el.dataset.i); return; }
    if (a === 'ngaunhien') { nuot(); DC.ngauNhien(); return; }
    if (a === 'hm-choi' && el.id === 'nut-vao' && UI.chon.length !== 5) { nuot(); DC.huyDoi(); DC.giuc(); return; }
    const o = t.closest('#chon-bo .o-bo');
    const c = !o && t.closest('#chon-luoi .c[data-id]');
    const cOk = c && !(el && (a === 'bb-thu' || /^hd-/.test(a)));
    if (DC.cho != null) {
      if (o) { nuot(); DC.chamO(o); return; }
      if (cOk) { nuot(); const id = c.dataset.id; if (id === DC.cho) { DC.huyDoi(); return; } DC.huyDoi(); DC.chamThe(c); return; }
      DC.huyDoi(); if (t.closest('#chon-bo, #chon-luoi, .dk-dem')) { nuot(); return; }
      return bam.apply(this, arguments);
    }
    if (o) { nuot(); DC.chamO(o); return; }
    if (cOk) { nuot(); DC.chamThe(c); return; }
    return bam.apply(this, arguments);
  };

  // ---------- trang chi tiết mở từ màn bộ bài: nút đáy dùng cùng luật vị trí ----------
  if (typeof UP !== 'undefined' && UP.bam) {
    const upBam = UP.bam;
    UP.bam = function (e) {
      const b = e.target.closest && e.target.closest('[data-up="bo"]');
      if (!b || this.mv || !this.id || typeof upCo === 'undefined' || !upCo(this.id) || !(typeof CTD !== 'undefined' && CTD.tuDeck) || !DC.dangDeck(true)) return upBam.apply(this, arguments);
      const id = this.id, sau = (f) => setTimeout(f, DC.giam() ? 0 : 200);
      if (UI.chon.includes(id)) { e.stopImmediatePropagation(); this.dong(); sau(() => DC.boO(DC.o.indexOf(id))); return; }
      const du = UI.chon.length >= 5;
      if (du ? !DC.o.some((_, i) => !!DK.thuThe(id, i).bo) : DK.loi(UI.chon, id)) return upBam.apply(this, arguments); // sai luật: trang tự báo
      e.stopImmediatePropagation(); this.dong();
      sau(() => du ? DC.batDoi(id) : DC.them(id));
    };
  }
  // giữ lâu: không menu ảnh (dkkeo.js chỉ chặn khi DK.moDuoc)
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && DC.cho != null) DC.huyDoi(); });
})();
