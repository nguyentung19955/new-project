// TURRET MERGE — KÉO THẢ ở màn XÂY BỘ BÀI (HUD mượt A, js/home.js).
//  · Thẻ trong lưới → 1 trong 5 ô: ô trống = thêm, ô có ụ = đổi (ụ cũ về lưới). Ô → lưới / vuốt nhanh xuống = bỏ khỏi bộ. Ô → ô = đổi chỗ.
//  · Bắt đầu kéo: giữ 280 ms không xê dịch (< 8 px), hoặc (chuột) đi bất kỳ hướng > 8 px. Cảm ứng trên thẻ lưới: xê dịch > 8 px trước khi giữ đủ
//    = CUỘN (bất kể hướng — 07/11 người dùng: vuốt/cuộn hay bị hiểu nhầm thành kéo ụ vào bộ), vuốt nhanh không bao giờ thành kéo;
//    (trước: giữ 150 ms hoặc đi ngang > 8 px = kéo). Cảm ứng đi dọc = cuộn lưới (tự cuộn, có quán tính);
//    đang cuộn mà ngón tay kéo lên khỏi mép trên lưới (về phía bộ bài) = nhấc thẻ dưới điểm chạm lên kéo luôn.
//  · iOS Safari: lưới ở màn bộ bài đặt touch-action:none và TỰ cuộn → Safari không giành cử chỉ (trước đây pan-y → Safari cuộn + pointercancel = mất kéo).
//  · HỢP ĐỒNG DOM (QUY-TAC-HINH.md quy tắc 10): thẻ lưới = phần tử [data-id] trong #chon-luoi; ô bộ bài = [data-slot="0..4"] trong #chon-bo
//    (có data-id khi có ụ); ô chỉ huy = [data-slot="mv"]. Bắt sự kiện ở window (ủy quyền) → sống qua mọi lần vẽ lại; không dựa tên lớp.
//  · Chạm (không kéo) = trang chi tiết ụ (home.js gọi UP.mo); DK.vuaKeo() chặn cú click sinh ra sau khi thả.
//  Hình (QUY-TAC-HINH.md): bóng ma = ảnh khung độ hiếm + chân dung + đế sáng chon_de_xanh (PNG có sẵn); ô hợp lệ = khung_chon.png;
//  thả sai = lắc ảnh + thông báo (UI.nhac, tấm h2_tam_do). Code chỉ dịch/phóng/mờ ảnh (transform, 60 fps).
'use strict';
const DK = {
  GIU: 280, NGUONG: 8, VE: 180,
  d: null, keo: null, _chan: 0,
  giam: () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches),
  vuaKeo() { return performance.now() < this._chan; },
  moDuoc() { const c = document.getElementById('chon'); return c && !c.hidden && c.classList.contains('xem-dk') && !c.classList.contains('bst') && !(typeof UP !== 'undefined' && UP.el && !UP.el.hidden); },
  bac: (id) => (G.rosterMap[id] && G.rosterMap[id].bac) || 'trang',
  oS() { const a = [...document.querySelectorAll('#chon-bo [data-slot]:not([data-slot="mv"])')]; return a.length ? a : [...document.querySelectorAll('#chon-bo .o-bo')]; },
  oMV: () => document.querySelector('#chon-bo [data-slot="mv"], #chon-bo .o-mv'),
  theCua(t) { const c = t && t.closest && t.closest('#chon-luoi [data-id]'); return c && !c.closest('[data-act="bb-thu"], [data-act^="hd-"]') ? c : null; },
  oCua(t) { const o = t && t.closest && t.closest('#chon-bo [data-slot][data-id], #chon-bo .o-bo[data-id]'); return o && o.dataset.slot !== 'mv' ? o : null; },
  luoiDK() { const l = document.getElementById('chon-luoi'); return this.moDuoc() && l ? l : null; },

  // luật bộ bài (giống UI.chonU + tuongmoi-ui.js): trả về câu báo lỗi hoặc ''
  loi(deck, id) {
    if (!SKILLS[id]) return TEXT.ui.soon;
    if (deck.includes(id)) return 'Already in your deck';
    if (deck.length >= 5) return TEXT.ui.deckFull;
    if (this.bac(id) === 'do' && deck.some(x => this.bac(x) === 'do')) return TEXT.ui.oneMythic;
    return '';
  },
  // bộ bài mới nếu thả `id` (từ lưới) vào ô i — null + câu lỗi nếu sai luật
  thuThe(id, i) {
    const bo = UI.chon.slice();
    if (bo.includes(id)) { // ụ đã trong bộ: kéo từ lưới = dời sang ô i (đổi chỗ)
      const j = bo.indexOf(id); if (i >= bo.length) i = bo.length - 1;
      if (i === j) return { bo: null, loi: '' };
      [bo[i], bo[j]] = [bo[j], bo[i]]; return { bo };
    }
    const bot = i < bo.length ? bo.filter((_, k) => k !== i) : bo;
    const l = this.loi(bot, id); if (l) return { bo: null, loi: l };
    if (i < bo.length) bo[i] = id; else bo.push(id);
    return { bo };
  },
  thuO(j, i) { // ô j → ô i
    const bo = UI.chon.slice(); if (i === j) return { bo: null };
    if (i >= bo.length) { const [x] = bo.splice(j, 1); bo.push(x); return { bo }; }
    [bo[i], bo[j]] = [bo[j], bo[i]]; return { bo };
  },

  // ---------- con trỏ ----------
  xuong(e) {
    if (this.keo && this.keo.ra) { this.don(); this._chan = 0; } // ghost đang bay về/vào ô → kết thúc ngay, nhận cú kéo mới (không nuốt cú chạm)
    if (this.d || this.keo || e.button > 0 || !e.isPrimary || !this.moDuoc()) return;
    this.dungQT();
    const c = this.theCua(e.target), o = !c && this.oCua(e.target);
    const l = document.getElementById('chon-luoi'), trongLuoi = !!(l && e.target.closest && e.target.closest('#chon-luoi') && !e.target.closest('#bb-dai'));
    if (!c && !o && !(trongLuoi && e.pointerType === 'touch')) return;
    const the = c && SKILLS[c.dataset.id] && !c.classList.contains('khoa') ? c : null;
    const el = the || o;
    this.d = { el, id: el ? el.dataset.id : '', tu: o ? 'o' : (the ? 'the' : 'cuon'), j: o ? this.oS().indexOf(o) : -1,
      x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t0: performance.now(), pid: e.pointerId, loai: e.pointerType,
      cuon: false, st0: l ? l.scrollTop : 0, mau: [[performance.now(), e.clientY]] };
    clearTimeout(this._gt);
    if (el) this._gt = setTimeout(() => { if (this.d && !this.keo && !this.d.cuon && this.d.el) this.batDau(); }, this.GIU);
  },
  di(e) {
    const d = this.d;
    if (d && e.pointerId === d.pid && !this.keo) {
      if (e.cancelable && d.loai === 'touch') e.preventDefault();
      const dx = e.clientX - d.x0, dy = e.clientY - d.y0, ax = Math.abs(dx), ay = Math.abs(dy), t = performance.now();
      d.x = e.clientX; d.y = e.clientY;
      if (d.cuon) return this.cuonTay(e, t);
      if (ax < this.NGUONG && ay < this.NGUONG) return;
      // thẻ lưới + cảm ứng: xê dịch trước khi giữ đủ = cuộn lưới (mọi hướng; kéo chỉ khi giữ lâu hoặc kéo lên khỏi mép trên lưới).
      // Chuột/bút: đi bất kỳ hướng = kéo. Ô bộ bài: bất kỳ hướng = kéo (hàng bộ bài không cuộn; vuốt nhanh xuống = bỏ)
      if (d.tu === 'cuon' || (d.tu === 'the' && d.loai === 'touch')) { clearTimeout(this._gt); d.cuon = true; d.y0c = e.clientY; return this.cuonTay(e, t); }
      if (!d.el) { this.huyD(); return; }
      this.batDau(); return;
    }
    const k = this.keo; if (!k || e.pointerId !== k.pid) return;
    if (e.cancelable) e.preventDefault();
    const t = performance.now();
    k.x = e.clientX; k.y = e.clientY; k.mau.push([t, k.y]); while (k.mau.length > 2 && t - k.mau[1][0] > 100) k.mau.shift();
    if (!k.raf) k.raf = requestAnimationFrame(() => { k.raf = 0; this.veMa(); });
  },
  // tự cuộn lưới theo ngón tay (lưới touch-action:none ở màn bộ bài)
  cuonTay(e, t) {
    const d = this.d, l = document.getElementById('chon-luoi'); if (!l) return;
    d.mau.push([t, e.clientY]); while (d.mau.length > 2 && t - d.mau[1][0] > 100) d.mau.shift();
    if (typeof TAI_CUON !== 'undefined') TAI_CUON = performance.now(); // taitai.js: đợt nạp nền nhường khi đang cuộn
    // mép trên lưới: đo 1 lần lúc bắt đầu cuộn (trước: getBoundingClientRect sau khi ghi scrollTop = ép bố cục mỗi pointermove)
    if (d.lTop == null) d.lTop = l.getBoundingClientRect().top;
    // kéo lên khỏi mép trên lưới (về phía bộ bài) = nhấc thẻ dưới điểm chạm
    if (d.el && d.tu === 'the' && e.clientY < d.lTop - 10 && e.clientY < d.y0) { d.cuon = false; if (d.raf) { cancelAnimationFrame(d.raf); d.raf = 0; } l.scrollTop = d.st0; this.batDau(); return; } // trả lưới về chỗ cũ: người chơi muốn kéo, không muốn cuộn
    // gom các pointermove trong 1 khung hình → ghi scrollTop 1 lần / khung
    d.cy = e.clientY;
    if (!d.raf) d.raf = requestAnimationFrame(() => { d.raf = 0; if (this.d === d && d.cuon) l.scrollTop = d.st0 - (d.cy - d.y0); });
  },
  len(e) {
    const d = this.d;
    if (d && e.pointerId === d.pid && !this.keo) {
      if (d.cuon) { if (d.raf) { cancelAnimationFrame(d.raf); d.raf = 0; const l = document.getElementById('chon-luoi'); if (l) l.scrollTop = d.st0 - (d.cy - d.y0); } this._chan = performance.now() + 350; this.quanTinh(); }
      this.huyD(); return; // chạm thường → click → home.js mở chi tiết
    }
    const k = this.keo; if (!k || e.pointerId !== k.pid) return;
    if (e.type === 'pointercancel') { this.ve(); return; }
    k.x = e.clientX; k.y = e.clientY; this.tha();
  },
  quanTinh() {
    const d = this.d, l = document.getElementById('chon-luoi'); if (!d || !l || d.mau.length < 2) return;
    const a = d.mau[0], b = d.mau[d.mau.length - 1];
    if (performance.now() - b[0] > 80) return;
    let v = -(b[1] - a[1]) / Math.max(16, b[0] - a[0]); // px/ms (dương = cuộn xuống)
    if (Math.abs(v) < 0.1) return;
    v = Math.max(-4, Math.min(4, v));
    let t0 = performance.now();
    const buoc = (t) => {
      const dt = Math.min(40, t - t0); t0 = t;
      l.scrollTop += v * dt; v *= Math.pow(0.95, dt / 16);
      if (Math.abs(v) < 0.02 || l.scrollTop <= 0 || l.scrollTop >= l.scrollHeight - l.clientHeight) { this._qt = 0; return; }
      this._qt = requestAnimationFrame(buoc);
    };
    this._qt = requestAnimationFrame(buoc);
  },
  dungQT() { if (this._qt) { cancelAnimationFrame(this._qt); this._qt = 0; } },
  huyD() { clearTimeout(this._gt); this.d = null; },

  // ---------- kéo ----------
  batDau() {
    const d = this.d; clearTimeout(this._gt); if (!d || !d.el) return;
    this.d = null;
    const w = document.getElementById('wrap'); if (!w) return;
    const rw = w.getBoundingClientRect(), s = rw.width / W, r = d.el.getBoundingClientRect();
    // bóng ma: cùng cỡ ô bộ bài lớn (70 × 85 logic), ảnh khung độ hiếm + chân dung + đế sáng
    // 07/11: ô vuông giống lưới — khung vuông chung o_vien_trang + viền mảnh màu bậc (css/otoigian.css), bỏ khung bậc Pass 9
    const mw = 76, mh = 76;
    const ma = document.createElement('div'); ma.className = 'dk-ma dk-ma-ot'; ma.style.setProperty('--otc', ({ trang: '#c9d1dc', xanh: '#3fa2ff', tim: '#b061ff', vang: '#ffc83a', do: '#ff4040' })[this.bac(d.id)] || '#c9d1dc');
    ma.style.width = mw + 'px'; ma.style.height = mh + 'px'; ma.style.setProperty('--khh', mh + 'px');
    const kh = typeof anhUrl === 'function' ? anhUrl('o_vien_trang') : 'assets/o_vien_trang.png';
    ma.innerHTML = '<img class="dk-ma-de" src="assets/chon_de_xanh.png" alt=""><div class="dk-ma-in"><img class="dk-ma-po" src="' + portraitOf(d.id) + '" alt="" draggable="false">' + (kh ? '<img class="dk-ma-kh" src="' + kh + '" alt="" draggable="false">' : '') + '</div>';
    w.appendChild(ma);
    const cx = (r.left + r.width / 2 - rw.left) / s, cy = (r.top + Math.min(r.height, r.width * 1.2) / 2 - rw.top) / s;
    const k = this.keo = { ...d, ma, s, rw, mw, mh, ox: cx, oy: cy, // tâm gốc (logic px)
      dx: (d.x - rw.left) / s - cx, dy: (d.y - rw.top) / s - cy, x: d.x, y: d.y, mau: [[d.t0, d.y0], [performance.now(), d.y]], tren: -1, raf: 0 };
    this.soLan = (this.soLan || 0) + 1;
    d.el.classList.add('dk-nguon');
    document.documentElement.classList.add('dk-dang-keo');
    // ô hợp lệ sáng khung (khung_chon.png)
    const os = this.oS(); k.hop = os.map((o, i) => k.tu === 'o' ? i !== k.j : !!this.thuThe(k.id, i).bo);
    os.forEach((o, i) => { const v = document.createElement('img'); v.className = 'dk-vien'; v.src = 'assets/khung_chon.png'; v.alt = ''; o.appendChild(v); o.classList.toggle('dk-hop', k.hop[i]); });
    document.getElementById('chon-bo').classList.add('dk-keo');
    if (k.tu === 'o') document.getElementById('chon-luoi').classList.add('dk-nhan');
    try { SND.nut(); } catch (e) { }
    try { navigator.vibrate && navigator.vibrate(8); } catch (e) { }
    if (!this.giam()) ma.animate([{ transform: this.tf(k.ox, k.oy, 1) }, { transform: this.tf(k.ox, k.oy, 1.08) }], { duration: 90, easing: 'ease-out' });
    this.veMa();
  },
  tf(x, y, sc) { const k = this.keo; return 'translate3d(' + (x - k.mw / 2) + 'px,' + (y - k.mh / 2) + 'px,0) scale(' + sc + ')'; },
  diem() { const k = this.keo; return { x: (k.x - k.rw.left) / k.s - k.dx * 0.4, y: (k.y - k.rw.top) / k.s - k.dy * 0.4 }; },
  veMa() {
    const k = this.keo; if (!k) return;
    const p = this.diem(); k.ma.style.transform = this.tf(p.x, p.y, 1.08);
    const i = this.oDuoi(); if (i === k.tren) return;
    const os = this.oS(); if (k.tren >= 0 && os[k.tren]) os[k.tren].classList.remove('dk-tren');
    k.tren = i; if (i >= 0 && os[i]) os[i].classList.add('dk-tren');
    const l = document.getElementById('chon-luoi'); if (l) l.classList.toggle('dk-tren-luoi', k.tu === 'o' && this.trenLuoi());
  },
  // ô dưới ngón tay (vùng chạm nới 12 px mỗi bên)
  oDuoi() {
    const k = this.keo, x = k.x, y = k.y, n = 12 * k.s;
    if (this.trenMV()) return -1;
    let best = -1, bd = 1e9;
    this.oS().forEach((o, i) => {
      const r = o.getBoundingClientRect();
      if (x < r.left - n || x > r.right + n || y < r.top - n * 1.5 || y > r.bottom + n * 1.5) return;
      const dd = Math.abs(x - (r.left + r.right) / 2); if (dd < bd) { bd = dd; best = i; }
    });
    return best;
  },
  trenMV() { const m = this.oMV(), r = m && m.getBoundingClientRect(), k = this.keo; return !!r && r.width > 0 && k.x >= r.left && k.x <= r.right && k.y >= r.top - 6 * k.s && k.y <= r.bottom + 6 * k.s; },
  laMV() {
    const m = this.oMV();
    if (m && !this.giam()) m.animate([0, -6, 6, -4, 4, 0].map(dx => ({ transform: 'translateX(' + dx + 'px)' })), { duration: 260, easing: 'linear' });
    if (m) { m.classList.add('dk-lac'); setTimeout(() => m.classList.remove('dk-lac'), 300); }
    return this.sai('Commander slot · tap it to change commander');
  },
  trenLuoi() { const l = document.getElementById('chon-luoi'), r = l && l.getBoundingClientRect(); return !!r && this.keo.y > r.top - 8 * this.keo.s; },

  tha() {
    const k = this.keo; if (!k || k.ra) return;
    k.ra = true;
    if (k.raf) { cancelAnimationFrame(k.raf); k.raf = 0; }
    this.veMa();
    // thả lên ô CHỈ HUY (ô thứ 6): không nhận ụ → ô lắc ngắn + nhắc, ụ về chỗ
    if (this.trenMV()) return this.laMV();
    const i = k.tren;
    if (k.tu === 'the') {
      if (i < 0) return this.ve();
      const t = this.thuThe(k.id, i);
      if (!t.bo) { if (t.loi) return this.sai(t.loi); return this.ve(); }
      return this.dat(t.bo, k.id, i);
    }
    // từ ô bộ bài
    if (i >= 0) { const t = this.thuO(k.j, i); return t.bo ? this.dat(t.bo, k.id, Math.min(i, t.bo.length - 1)) : this.ve(); }
    // vuốt nhanh xuống (tốc độ trung bình ~100 ms cuối, px/ms) = bỏ khỏi bộ
    const m0 = k.mau[0], vy = (k.y - m0[1]) / Math.max(16, performance.now() - m0[0]);
    const vuotXuong = vy > 0.45 && (k.y - k.y0) > 30 * k.s;
    if (this.trenLuoi() || vuotXuong) { const bo = UI.chon.filter(x => x !== k.id); return this.bo(bo); }
    return this.ve();
  },
  // đặt bộ mới; bóng ma bay vào ô rồi biến mất, ô nảy (hm-xung)
  dat(bo, id, i) {
    const k = this.keo, truoc = UI.chon.length;
    UI.chon = bo; UI.veBoChon();
    if (typeof HM !== 'undefined') { HM.noi = id; HM.armed = -1; HM.luuBo(); HM.ve(); }
    try { SND.nut(); } catch (e) { }
    const o = this.oS()[UI.chon.indexOf(id)];
    const xong = () => { if (this.keo !== k) return; this.don(); if (o) { o.classList.remove('hm-xung'); void o.offsetWidth; o.classList.add('hm-xung'); setTimeout(() => o.classList.remove('hm-xung'), 300); } };
    if (UI.chon.length === 5 && truoc < 5 && typeof HM !== 'undefined') HM.duBo();
    if (UI.chon.length === 5 && UI.chon.filter(x => SKILLS[x] && SKILLS[x].vai === 'tc').length < 2) UI.nhac(TEXT.ui.need2Atk);
    if (!o || this.giam()) return xong();
    const r = o.getBoundingClientRect(), p = this.diem(), x1 = (r.left + r.width / 2 - k.rw.left) / k.s, y1 = (r.top + r.height / 2 - k.rw.top) / k.s;
    const a = k.ma.animate([{ transform: this.tf(p.x, p.y, 1.08), opacity: 1 }, { transform: this.tf(x1, y1, 0.92), opacity: 0.9 }], { duration: 140, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'forwards' });
    a.onfinish = xong;
  },
  bo(bo) {
    const k = this.keo;
    UI.chon = bo; UI.veBoChon();
    if (typeof HM !== 'undefined') { HM.armed = -1; HM.luuBo(); HM.ve(); }
    try { SND.nut(); } catch (e) { }
    if (this.giam()) return this.don();
    const p = this.diem();
    const a = k.ma.animate([{ transform: this.tf(p.x, p.y, 1.08), opacity: 1 }, { transform: this.tf(p.x, p.y + 30, 0.6), opacity: 0 }], { duration: 180, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' });
    a.onfinish = () => this.don(k);
  },
  // thả sai luật: lắc ảnh 3 nhịp + thông báo, rồi về chỗ
  sai(loi) {
    const k = this.keo; UI.nhac(loi);
    try { SND.nut(); } catch (e) { }
    try { navigator.vibrate && navigator.vibrate([12, 40, 12]); } catch (e) { }
    if (this.giam()) return this.ve();
    const p = this.diem();
    const a = k.ma.animate([0, -7, 7, -5, 5, 0].map(dx => ({ transform: this.tf(p.x + dx, p.y, 1.08) })), { duration: 240, easing: 'linear', fill: 'forwards' });
    a.onfinish = () => { if (this.keo === k) this.ve(); };
  },
  // về chỗ cũ 180 ms
  ve() {
    const k = this.keo; if (!k) return;
    k.ra = true;
    if (this.giam()) return this.don();
    const p = this.diem();
    const a = k.ma.animate([{ transform: this.tf(p.x, p.y, 1.08), opacity: 1 }, { transform: this.tf(k.ox, k.oy, 1), opacity: 0.6 }], { duration: this.VE, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'forwards' });
    a.onfinish = () => this.don(k);
  },
  don(kk) {
    const k = this.keo; if (!k || (kk && kk !== k)) return;
    this.keo = null; this._chan = performance.now() + 350;
    k.ma.remove();
    k.el.classList.remove('dk-nguon');
    document.querySelectorAll('.dk-nguon').forEach(x => x.classList.remove('dk-nguon'));
    document.querySelectorAll('#chon-bo .dk-vien').forEach(v => v.remove());
    this.oS().forEach(o => o.classList.remove('dk-hop', 'dk-tren'));
    const b = document.getElementById('chon-bo'); if (b) b.classList.remove('dk-keo');
    const l = document.getElementById('chon-luoi'); if (l) l.classList.remove('dk-nhan', 'dk-tren-luoi');
    document.documentElement.classList.remove('dk-dang-keo');
  },
};

(function () {
  if (typeof UP_XEM !== 'undefined' && UP_XEM) return; // khung xem trước Test range không có màn bộ bài
  if (typeof UI === 'undefined') return;
  addEventListener('pointerdown', (e) => { try { DK.xuong(e); } catch (er) { console.error('DK', er); } }, true);
  addEventListener('pointermove', (e) => { try { DK.di(e); } catch (er) { console.error('DK', er); } }, { capture: true, passive: false });
  addEventListener('pointerup', (e) => { try { DK.len(e); } catch (er) { console.error('DK', er); } }, true);
  addEventListener('pointercancel', (e) => { try { DK.len(e); } catch (er) { console.error('DK', er); } }, true);
  // iOS Safari / Chrome cảm ứng: đang kéo thì chặn cuộn trang + lưới
  addEventListener('touchmove', (e) => { if ((DK.keo || (DK.d && DK.d.loai === 'touch')) && e.cancelable) e.preventDefault(); }, { capture: true, passive: false });
  // giữ lâu: không menu ảnh / không bôi chữ / không kéo ảnh gốc của trình duyệt
  addEventListener('contextmenu', (e) => { if (e.target.closest && e.target.closest('#chon-luoi [data-id], #chon-bo [data-slot], #chon-bo .o-bo') && DK.moDuoc()) e.preventDefault(); }, true);
  addEventListener('dragstart', (e) => { if (e.target.closest && e.target.closest('#chon')) e.preventDefault(); }, true);
  addEventListener('blur', () => { if (DK.keo) DK.ve(); DK.huyD(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && DK.keo) DK.ve(); });

  // trang chi tiết: bộ đã đủ 5 mà ụ chưa trong bộ → nút báo "Deck full", không bấm được (bỏ 1 ụ trước)
  if (typeof UP !== 'undefined') {
    const capGoc = UP.capNutBo;
    UP.capNutBo = function () {
      const r = capGoc.apply(this, arguments);
      try {
        if (!this.mv && this.id && upCo(this.id) && !UI.chon.includes(this.id) && this.el) {
          const nut = this.el.querySelector('.up-nut'), l = DK.loi(UI.chon, this.id);
          if (l) { nut.disabled = true; nut.querySelector('.up-nut-so').textContent = UI.chon.length >= 5 ? 'Deck full · remove one first' : l; }
        }
      } catch (e) { }
      return r;
    };
  }
})();
