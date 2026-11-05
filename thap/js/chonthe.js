// TURRET MERGE — hiệu ứng thẻ ĐÃ CHỌN ở màn chọn bộ bài (ảnh ChatGPT, css/chonthe.css).
//  Thẻ đã chọn: <i.sel-v> quầng lặp + <i.sel-d> đế sáng; vừa thêm vào bộ: <i.sel-b> bùng 1 lần trên thẻ VÀ trên ô thanh bộ bài.
//  Bỏ chọn: mờ nhanh rồi gỡ phần tử (chỉ ≤ 5 thẻ có hoạt ảnh → cuộn lưới vẫn 60 fps).
'use strict';
(() => {
  if (typeof UI === 'undefined') return;
  const CAM = { vang: 1, do: 1 };
  const bacOf = (id) => (G.rosterMap && G.rosterMap[id] && G.rosterMap[id].bac) || 'trang';
  const giam = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gan = (c) => {
    if (!c || c.querySelector(':scope > .sel-v:not(.tat)')) return;
    c.querySelectorAll(':scope > .sel-v, :scope > .sel-d').forEach(e => e.remove());
    const v = document.createElement('i'); v.className = 'sel-v';
    const d = document.createElement('i'); d.className = 'sel-d' + (CAM[bacOf(c.dataset.id)] ? ' cam' : '');
    c.prepend(d); c.append(v);
  };
  const go = (c) => {
    const ds = c.querySelectorAll(':scope > .sel-v:not(.tat), :scope > .sel-d:not(.tat)');
    if (!ds.length) return;
    ds.forEach(e => e.classList.add('tat'));
    setTimeout(() => ds.forEach(e => { if (!c.classList.contains('chon') || e.classList.contains('tat')) e.remove(); }), giam() ? 0 : 180);
  };
  const bung = (el) => {
    if (!el || giam()) return;
    el.querySelectorAll(':scope > .sel-b').forEach(e => e.remove());
    const b = document.createElement('i'); b.className = 'sel-b'; el.append(b);
    if (el.classList.contains('c')) el.classList.add('co-bung');
    setTimeout(() => { b.remove(); el.classList.remove('co-bung'); }, 480);
  };
  // thẻ dựng lại (lọc / sắp xếp / vẽ lại màn) — đã chọn thì có quầng ngay, không bùng
  const theGoc = UI.theChon;
  UI.theChon = function (r) { const c = theGoc.apply(this, arguments); if (this.chon.includes(r.id)) gan(c); return c; };
  let truoc = UI.chon.slice();
  const boGoc = UI.veBoChon;
  UI.veBoChon = function () {
    const r = boGoc.apply(this, arguments);
    const moi = this.chon.filter(id => !truoc.includes(id));
    truoc = this.chon.slice();
    document.querySelectorAll('#chon-luoi .c').forEach(c => { if (c.classList.contains('chon')) gan(c); else go(c); });
    for (const id of moi) {
      document.querySelectorAll('#chon-luoi .c[data-id="' + id + '"]').forEach(bung);
      bung($('#chon-bo').querySelector('.o-bo[data-id="' + id + '"]'));
    }
    return r;
  };
  if (!$('#chon').hidden && UI.veChon && G.roster && G.roster.length) UI.veChon();
})();
