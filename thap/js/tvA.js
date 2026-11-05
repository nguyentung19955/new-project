// TURRET MERGE — tư vấn toàn bộ phần A (§B19): KHO / BỘ BÀI giữ nguyên vị trí cuộn khi vào/ra trang ụ.
//  Lưu scrollTop lúc mở trang ụ, trả lại khi đóng (kể cả khi lưới bị vẽ lại); nếu đã lướt sang ụ khác (‹ ›) mà thẻ ụ đó
//  đang khuất thì cuộn vừa đủ cho thẻ hiện ra (không nhảy về đầu danh sách).
'use strict';
// §B2/E08: ô bộ bài CÓ ỤI dùng khung tv_o_co.png (cửa sổ trong suốt, không thanh qua mặt) thay khung độ hiếm dày
(() => {
  if (typeof UI === 'undefined' || !UI.veBoChon) return;
  const doi = () => document.querySelectorAll('#chon-bo .o-bo[data-id] > img.kh').forEach(k => { if (!/tv_o_co/.test(k.getAttribute('src'))) k.src = 'assets/tv_o_co.png'; });
  const goc = UI.veBoChon;
  UI.veBoChon = function () { const r = goc.apply(this, arguments); doi(); return r; };
  doi();
})();
(() => {
  if (typeof UP === 'undefined' || typeof HM === 'undefined') return;
  const luoi = () => document.getElementById('chon-luoi');
  const moGoc = UP.mo, dongGoc = UP.dong;
  UP.mo = function () { const l = luoi(); if (l && (!this.el || this.el.hidden)) this._tvCuon = l.scrollTop; return moGoc.apply(this, arguments); };
  UP.dong = function () {
    const id = this.id, st = this._tvCuon, r = dongGoc.apply(this, arguments), l = luoi();
    if (l && st != null) {
      l.scrollTop = st; this._tvCuon = null;
      const c = id && l.querySelector('.c[data-id="' + id + '"]:not([hidden])');
      if (c) { const a = c.getBoundingClientRect(), b = l.getBoundingClientRect(); if (a.top < b.top || a.bottom > b.bottom) c.scrollIntoView({ block: 'nearest' }); }
    }
    return r;
  };
})();
