// ASTRAL ARSENAL — màn QUESTS tách 3 THẺ CON (người dùng duyệt 11/11 23:56): REWARDS · DAILY · ACHIEVEMENTS.
//  Chỉ đổi cách BÀY (không đổi số thưởng, không đổi luật): bọc KTUI.ve_nv SAU CÙNG (sau tientrinh.js / manh.js), cắt chuỗi HTML theo từng mục
//  (<div class="kt-muc">) rồi xếp vào thẻ: REWARDS = Daily Login + 7-Day Journey · DAILY = Daily Quests + Weekly Quests ·
//  ACHIEVEMENTS = Legendary & Mythic + Achievements (+ mục lạ nếu có). Thẻ không chọn vẫn nằm trong DOM (hidden) → bấm / bộ đếm giờ / kiểm thử cũ không đổi.
//  Chấm đỏ: thẻ còn nút nhận được (kt-slot vang chưa disabled, nút CLAIM DAY, chấm kt-cham của Hành trình). Mở QUESTS → thẻ đầu tiên có chấm đỏ (không có: REWARDS).
'use strict';
const NVT = {
  the: null, // thẻ đang xem; null = chọn lại khi mở màn
  DS: [['rw', 'REWARDS'], ['dn', 'DAILY'], ['tt', 'ACHIEVEMENTS']],
  nhom(t) { return /^(DAILY LOGIN|7-DAY JOURNEY)/.test(t) ? 'rw' : /^(DAILY QUESTS|WEEKLY QUESTS)/.test(t) ? 'dn' : 'tt'; },
  coNhan(h) { return /class="kt-slot vang"(?![^>]*disabled)/.test(h) || /kt-dn-nut" data-act="kt-dn">/.test(h) || /class="kt-cham"/.test(h); },
  ve(h) {
    const mk = '<div class="kt-muc">', ds = h.split(mk), g = { rw: ds[0], dn: '', tt: '' };
    for (let i = 1; i < ds.length; i++) { const m = /^<b>([^<]*)/.exec(ds[i]); g[this.nhom(m ? m[1] : '')] += mk + ds[i]; }
    const co = {}; for (const [k] of this.DS) co[k] = this.coNhan(g[k]);
    if (!this.the || !g[this.the]) this.the = (this.DS.find(([k]) => co[k] && g[k]) || this.DS[0])[0];
    const cham = typeof KTA !== 'undefined' && KTA.cham ? '<img class="kt-cham" src="' + KTUI.a(KTA.cham) + '" alt="">' : '';
    return '<div class="nvt-thanh">' + this.DS.map(([k, ten]) => '<button class="hm-nut2' + (k === this.the ? ' vang' : '') + '" data-act="nvt-the" data-id="' + k + '" aria-pressed="' + (k === this.the) + '"><b>' + ten + '</b>' + (co[k] ? cham : '') + '</button>').join('') + '</div>' +
      this.DS.map(([k]) => '<div class="nvt-nhom" data-nvt="' + k + '"' + (k === this.the ? '' : ' hidden') + '>' + g[k] + '</div>').join('');
  },
};
(function () {
  if (typeof KTUI === 'undefined' || !KTUI.ve_nv) return;
  const g = KTUI.ve_nv;
  KTUI.ve_nv = function () { const h = g.apply(this, arguments); try { return NVT.ve(h); } catch (e) { console.error('NVT', e); return h; } };
  const mt = KTUI.moTab;
  KTUI.moTab = function (k) { if (!this.mo || this.tab !== 'nv' || (k && k !== 'nv')) NVT.the = null; return mt.apply(this, arguments); }; // mở lại màn: chọn lại thẻ có chấm đỏ
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-act="nvt-the"]'); if (!b) return;
    e.stopPropagation(); try { SND.nut(); } catch (er) { }
    NVT.the = b.dataset.id; KTUI.ve(); const t = document.getElementById('kt-than'); if (t) t.scrollTop = 0;
  }, true);
  document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('[data-act="kt-tab"], [data-act="kt-mo"]')) NVT.the = null; }, true); // đổi thẻ chính / mở từ HOME: chọn lại
  if (typeof VI_MAU !== 'undefined') Object.assign(VI_MAU, { 'DAILY': 'HẰNG NGÀY' });
})();
