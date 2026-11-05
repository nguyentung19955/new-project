// TURRET MERGE — P0-05 THANH TRÊN dễ đọc khi khủng hoảng + P0-04 huy hiệu (docs/demo-hop-tuong/thap-art/TU-VAN-TOAN-GAME.txt mục 5, P0-04, P0-05).
//  · Ray thép h2_rail giãn rộng 330 (2 nửa ảnh gốc, chỉ giãn 1 dải phẳng 6 px cạnh tấm thông gió — không méo bu-lông) → 3 khoang:
//    WAVE N (icon chevron h2_canh_bao) | BOSS IN N (chân dung trùm của vaotran.js) | ♥ N/3 (ht_tim = ui_tim thu nhỏ).
//  · Cảnh báo trùm: CHỈ khoang Boss đập (phóng ảnh/chữ), không đổi cả ray. Băng WAVE / băng trùm ≤0,7 s rồi trượt lên ray.
//  · CO-OP: tấm treo dưới khoang tim "SHARED" (3 tim chung). PVP: khoang = YOU, tấm treo đỏ = RIVAL (mỗi bên 1 dòng riêng).
//  · P0-04: thẻ trong trận — icon VAI TRÒ góc trên-trái, LV góc trên-phải (chỉ trên thẻ), số ụ trên bàn góc dưới-phải;
//    ụ trên bàn — chỉ còn SAO SỐ TO góc trên-phải + biểu tượng nhận diện góc trên-trái; bỏ ngọc độ hiếm (độ hiếm = khung thẻ).
//  Chỉ chữ/số DOM + vị trí/phóng/mờ/cắt ảnh PNG có sẵn (thap/QUY-TAC-HINH.md).
'use strict';
const HT = {
  BW_MS: 700,   // băng wave / trùm: tổng thời gian che bàn
  CANH_MS: 2600, // khoang Boss đập sau cảnh báo
  CHU: { shared: 'SHARED', you: 'YOU', rival: 'RIVAL', lives: 'Lives' },
  _k: '', _t1: 0, _t2: 0,

  dung() {
    const top = $('#top'); if (!top || top._ht) return; top._ht = 1;
    const w = $('#tb-wave');
    if (w && !w.querySelector('.ht-ic')) { const i = document.createElement('img'); i.className = 'ht-ic'; i.alt = ''; i.src = 'assets/h2_canh_bao.png'; w.insertBefore(i, w.firstChild); }
    if (!$('#ht-phu')) { const p = document.createElement('div'); p.id = 'ht-phu'; p.hidden = true; top.appendChild(p); }
    const tim = $('#tb-tim'); if (tim) tim.setAttribute('aria-label', this.CHU.lives);
  },

  // tim: thay 3 đèn bằng ♥ N/3 (chữ số to); PVP 2 dòng tách riêng (khoang = bạn, tấm treo = đối thủ)
  tim() {
    const B = G.ban[0]; if (!B) return;
    const pvp = G.che === 'pvp', coop = G.che === 'coop';
    const max = pvp ? LUAT.timPvp : coop ? LUAT.timCoop : LUAT.timSolo;
    const B1 = G.ban[1], k = G.che + '|' + B.tim + '|' + (B1 ? B1.tim : '');
    const el = $('#tb-tim'), phu = $('#ht-phu');
    if (k === this._k && el.querySelector('.ht-n')) return;
    const cu = this._tim; this._k = k; this._tim = B.tim;
    const so = (n, ai) => (ai ? '<span class="ht-ai">' + ai + '</span>' : '') + '<img class="ht-tim" src="assets/ht_tim.png" alt=""><b class="ht-n' + (n <= 1 ? ' nguy' : '') + '">' + n + '</b><span class="ht-max">/' + max + '</span>';
    el.innerHTML = so(B.tim, pvp ? this.CHU.you : '');
    el.classList.toggle('nguy', B.tim <= 1); el.classList.toggle('pvp', pvp);
    if (cu != null && B.tim < cu) HUD2.motLan2(el, 'ht-mat', 500);
    if (pvp && B1) { phu.className = 'do'; phu.innerHTML = so(B1.tim, this.CHU.rival); phu.hidden = false; }
    else if (coop) { phu.className = 'xanh'; phu.innerHTML = '<span class="ht-ai">' + this.CHU.shared + '</span>'; phu.hidden = false; }
    else phu.hidden = true;
  },

  // băng: hiện ≤0,7 s rồi trượt lên ray + chớp khoang tương ứng
  bang(el, lop, khoang) {
    el.classList.remove('chay', 'ht-bw', 'ht-cb'); void el.offsetWidth; el.classList.add(lop);
    clearTimeout(el._ht); el._ht = setTimeout(() => { el.hidden = true; el.classList.remove(lop); if (khoang) khoang(); }, this.BW_MS);
  },
  nayWave() { const w = $('#tb-wave'); if (w) HUD2.motLan2(w, 'ht-nay', 420); },
  canh() {
    const g = $('#tb-giua'); if (!g) return;
    g.classList.remove('ht-canh'); void g.offsetWidth; g.classList.add('ht-canh');
    clearTimeout(this._t2); this._t2 = setTimeout(() => g.classList.remove('ht-canh'), this.CANH_MS);
  },
};

(() => {
  if (typeof UI === 'undefined') return;
  HT.dung();
  const vaoGoc = UI.vaoTran;
  UI.vaoTran = function () {
    const r = vaoGoc.apply(this, arguments);
    HT._k = ''; HT._tim = null; const g = $('#tb-giua'); if (g) g.classList.remove('ht-canh');
    // P0-04: icon vai trò góc trên-trái thẻ (đã gắn bởi HUD2 — chỉ đánh dấu để CSS đặt lại góc)
    document.querySelectorAll('#bo-the .the').forEach(d => d.classList.add('ht-goc'));
    return r;
  };
  const capGoc = UI.capNhat;
  UI.capNhat = function () { const r = capGoc.apply(this, arguments); try { HT.tim(); } catch (e) { console.error('HT', e); } return r; };

  const bwGoc = UI.bangWave;
  UI.bangWave = function () { const r = bwGoc.apply(this, arguments); clearTimeout(this._bw); const b = $('#bang-wave'); HT.bang(b, 'ht-bw', () => HT.nayWave()); return r; };
  const cbGoc = UI.canhBaoTrum;
  UI.canhBaoTrum = function () { const r = cbGoc.apply(this, arguments); clearTimeout(this._cb); const b = $('#canh-bao'); HT.bang(b, 'ht-cb'); HT.canh(); return r; };

  // P0-04 · ụ trên bàn: bỏ ngọc độ hiếm (độ hiếm chỉ ở khung thẻ)
  if (typeof REN !== 'undefined') REN.anNgoc = true;
  // P0-04 · huy hiệu SAO: neo cố định góc trên-phải, lùi vào trong ô để huy hiệu to không lấn ô bên cạnh
  if (typeof ND !== 'undefined') {
    const xepGoc = ND.xep;
    ND.xep = function (T, x, y, C, hs, al, B) { const h = xepGoc.apply(this, arguments); h.sx -= h.d * 0.12; h.sy += h.d * 0.06; return h; };
  }
  // menu chọn bộ bài: icon góc thẻ = vai trò (cùng chỗ trên-trái như thẻ trong trận)
  const tcGoc = UI.theChon;
  UI.theChon = function (r) {
    const c = tcGoc.apply(this, arguments), sk = SKILLS[r.id], ic = c.querySelector('.ic');
    if (ic && sk && HUD2.VAI[sk.vai]) { ic.src = 'assets/' + HUD2.VAI[sk.vai] + '.png'; ic.classList.add('h2-vai'); c.classList.add('ht-goc'); }
    return c;
  };
})();
window.HT = HT;
