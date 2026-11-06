// TURRET MERGE — GIAO DIỆN CẤP THẺ kiểu DCDW (dữ liệu: thebai.js)
//  · Lưới bộ sưu tập / xây bộ bài: mỗi thẻ có "LV n" (góc trên-trái) + thanh bản sao n/m dưới thẻ (đầy = xanh lục như DCDW)
//    + mũi tên nâng cấp khi đủ bản sao + vàng.
//  · Trang ụ (chạm thẻ): hàng CARD LEVEL — LV, thanh bản sao, % sát thương hiện tại → sau khi lên, nút LEVEL UP (giá vàng).
//  · Màn kết quả (mọi chế độ, cả online): túi thưởng — vàng + bản sao nhận được.
//  Hình: chỉ ảnh có sẵn (h2_tag khung thanh, tai_day/loi_khuc_day dải đầy, ui_nangcap, ngoc_vang = vàng, nut_lon_xanh/thep). Code chỉ đặt chữ số + mức đầy.
'use strict';

const TBUI = {
  so: (v) => Math.floor(v).toLocaleString('en-US'),
  thanh(t) {
    const p = t.max ? 100 : Math.min(100, Math.round(t.n / Math.max(1, t.can) * 100)), du = t.max || t.n >= t.can;
    return '<span class="tb-sb' + (du ? ' du' : '') + '"><span class="tb-day tai-day" style="--p:' + p + '%"><img src="assets/' + (du ? 'loi_khuc_day' : 'tai_day') + '.png" alt="" draggable="false"></span>' +
      '<b>' + (t.max ? 'MAX' : t.n + '/' + t.can) + '</b></span>';
  },
  // gắn LV + thanh vào 1 thẻ lưới (idempotent)
  ganThe(c) {
    const id = c && c.dataset.id; if (!id || !SKILLS[id] || !G.rosterMap[id]) return;
    const t = THEBAI.the(id), h = '<span class="tb-lv">LV' + t.lv + '</span>' + this.thanh(t) + (THEBAI.nangDuoc(t) ? '<img class="tb-up" src="assets/ui_nangcap.png" alt="" draggable="false">' : '');
    let w = c.querySelector(':scope > .tb-w');
    if (!w) { w = document.createElement('span'); w.className = 'tb-w'; c.appendChild(w); }
    if (w._h !== h) { w._h = h; w.innerHTML = h; }
  },
  capLuoi() { document.querySelectorAll('#chon-luoi .c[data-id]').forEach(c => this.ganThe(c)); },

  // hàng CARD LEVEL trên trang ụ
  hang(id) {
    if (!SKILLS[id]) return '';
    const t = THEBAI.the(id), vang = THEBAI.doc().vang, pc = (v) => '+' + Math.round(v * 100) + '%';
    const ht = SKILLS[id].vai === 'ht' && !SKILLS[id].dmg, ten = ht ? 'support' : 'damage', k = ht ? 0.5 : 1;
    let phu, nut;
    if (t.max) { phu = pc(t.pct * k) + ' ' + ten + ' · max level'; nut = '<button class="tb-nut" disabled><b>MAX</b></button>'; }
    else {
      const thieu = t.n < t.can ? 'Need ' + (t.can - t.n) + ' more cop' + (t.can - t.n > 1 ? 'ies' : 'y') : vang < t.vang ? 'Need ' + this.so(t.vang - vang) + ' more gold' : '';
      phu = (thieu || (pc(t.pct * k) + ' → ' + pc(t.pctSau * k) + ' ' + ten));
      nut = '<button class="tb-nut" data-up="tbnang"' + (THEBAI.nangDuoc(t) ? '' : ' disabled') + '><b>LEVEL UP</b><small><img src="assets/ngoc_vang.png" alt="">' + this.so(t.vang) + '</small></button>';
    }
    return '<div class="tb-cap" data-id="' + id + '"><div class="tb-cap-lv"><small>CARD LV</small><b>' + t.lv + '</b><em>/' + THE.lvMax + '</em></div>' +
      '<div class="tb-cap-giua">' + this.thanh(t) + '<small>' + phu + '</small><small class="tb-vi"><img src="assets/ngoc_vang.png" alt="">' + this.so(vang) + '</small></div>' + nut + '</div>';
  },

  // túi thưởng ở màn kết quả
  veThuong(k) {
    const m = typeof KQ !== 'undefined' && KQ.m; if (!m) return;
    const r = THEBAI.thuong(k, m), chi = document.getElementById('kq-chi'); if (!chi) return;
    let d = chi.querySelector('.tb-kq');
    if (!r) { if (d) d.remove(); return; }
    if (!d) { d = document.createElement('div'); d.className = 'tb-kq'; chi.insertBefore(d, chi.querySelector('.kq-xem') || null); }
    d.innerHTML = '<small>REWARDS</small><div class="tb-kq-h"><span class="tb-kq-v"><img src="assets/ngoc_vang.png" alt="">+' + this.so(r.vang) + '</span>' +
      r.the.slice(0, 6).map(x => '<span class="tb-kq-t"><i class="ot-mini" data-id="' + x.id + '"><img class="po" src="' + portraitOf(x.id) + '" alt="' + ((G.rosterMap[x.id] || {}).ten || '') + '" draggable="false"></i><b>×' + x.n + '</b></span>').join('') + '</div>';
    if (typeof OT !== 'undefined' && OT.quet) try { OT.quet(d); } catch (e) { }
  },
};

(function () {
  if (typeof THEBAI === 'undefined') return;
  THEBAI.doc();
  // lưới thẻ: gắn khi dựng + khi lưới đổi (lớp khác dựng lại thẻ)
  const goc = UI.theChon;
  UI.theChon = function (r) { const c = goc.apply(this, arguments); try { TBUI.ganThe(c); } catch (e) { } return c; };
  const veGoc = UI.veChon;
  UI.veChon = function () { const x = veGoc.apply(this, arguments); try { TBUI.capLuoi(); } catch (e) { } return x; };
  // trang ụ: hàng CARD LEVEL ngay trên 4 thông số
  if (typeof UP !== 'undefined') {
    const h = UP.html;
    UP.html = function (id) { const s = h.apply(this, arguments); try { return s.replace('<div class="up-spec">', TBUI.hang(id) + '<div class="up-spec">'); } catch (e) { return s; } };
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-up="tbnang"]'); if (!b) return;
    e.stopPropagation();
    const id = UP && UP.id; if (!id || !THEBAI.nang(id)) return;
    try { SND.nang(4); } catch (er) { }
    UP.ve(id, 0); TBUI.capLuoi();
    const n = UP.el && UP.el.querySelector('.tb-cap'); if (n) { n.classList.remove('tb-len'); void n.offsetWidth; n.classList.add('tb-len'); }
  }, true);
  // màn kết quả: túi thưởng (chạy sau ketqua.js + ketqua-onl.js)
  const kq = UI.ketQua;
  UI.ketQua = function (k) { const x = kq.apply(this, arguments); try { TBUI.veThuong(k); TBUI.capLuoi(); } catch (e) { console.error('TBUI', e); } return x; };
})();
