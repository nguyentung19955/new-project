// TURRET MERGE — XEM TRÙM ở màn ngoài (HOME → nút BOSSES cạnh DECK / COLLECTION; người dùng 09/11: "không có phần xem thông tin về boss").
//  Bảng trượt dưới của home.js (HM.mo): danh sách 12 trùm → chạm 1 trùm = trang chi tiết (ALL BOSSES để quay lại).
//  Số liệu lấy từ code thật, không chép tay: tên/chiêu/mô tả = TRUM (data.js + trum.js), wave xuất hiện = trumTuWave (trum.js)
//  + thứ tự CO-OP cố định TRUM_THU_TU (game.js: tới wave TRUM_COOP_CO_DINH), máu = công thức sinhTrum (game.js) × hệ số TRUM_MOI.hp,
//  nhịp chiêu = capNhatTrum (max(6, 10 − wave/15) s, báo 1,4 s). Hình: chân dung trum_<id>_portrait.png có sẵn (TRUM_CHANDUNG).
//  "Chưa gặp": kỷ lục wave (hồ sơ TK / tm_hoso / KT) < wave xuất hiện → chân dung mờ + "REACH WAVE N" (vẫn đọc được thông tin).
//  Act 'tx-*' (không phải 'hm-*': home.js nuốt mọi act hm-* lạ) — nghe riêng ở pha capture.
'use strict';
const TX = {
  // tên Việt (Tiếng Việt: hiện nhỏ dưới tên riêng tiếng Anh, như trang ụ)
  VI: { mad_crown: 'Vương Miện Điên', freezer: 'Kẻ Đóng Băng', janus: 'Khối Janus', joker_king: 'Vua Hề', nightmare: 'Ác Mộng', octopus: 'Mắt Bạch Tuộc',
    hive: 'Mẹ Tổ Ong', jammer: 'Kẻ Gây Nhiễu', prism: 'Giám Ngục Lăng Kính', twin_core: 'Lõi Song Sinh', patcher: 'Khổng Lồ Vá Víu', leech: 'Đỉa Sao' },
  // kiểu chiêu (code: twin_core chỉ tách khi chết; prism chỉ niệm để dựng lại khiên)
  KIEU: { twin_core: 'ON DEATH', prism: 'PASSIVE' },
  MOC: [10, 30, 50, 70], // wave in máu trong trang chi tiết
  ds() { return typeof TRUM_POOL !== 'undefined' ? TRUM_POOL.slice() : TRUM_THU_TU.slice(); },
  tu(id) { return typeof trumTuWave === 'function' ? trumTuWave(id) : LUAT.songTrum; },
  coop(id) { const i = TRUM_THU_TU.indexOf(id), w = (i + 1) * LUAT.songTrum; return i >= 0 && w <= (typeof TRUM_COOP_CO_DINH !== 'undefined' ? TRUM_COOP_CO_DINH : 59) ? w : 0; },
  // máu trùm ở wave w (SOLO/CO-OP — PVP đột tử có hệ số riêng): đúng sinhTrum + trum.js
  mau(id, w) {
    const g = typeof G !== 'undefined' ? G : null, cu = g && g.che; let m;
    if (g) g.che = 'solo'; try { m = mauWave(w); } finally { if (g) g.che = cu; }
    let hp = Math.round(m * 30 * (1 + w / 35));
    if (typeof TRUM_MOI !== 'undefined' && TRUM_MOI[id]) hp = Math.round(hp * TRUM_MOI[id].hp);
    return hp;
  },
  so(n) { const f = (v, u) => (v >= 100 ? Math.round(v) : v >= 10 ? Math.round(v * 10) / 10 : Math.round(v * 100) / 100) + u; return n >= 1e9 ? f(n / 1e9, 'B') : n >= 1e6 ? f(n / 1e6, 'M') : n >= 1e4 ? f(n / 1e3, 'K') : String(n); },
  nhip(w) { return Math.round(Math.max(6, 10 - w / 15) * 10) / 10; },
  best() {
    let b = 0;
    try { if (typeof TK !== 'undefined' && TK.ho) b = Math.max(b, TK.ho.bestWave | 0); } catch (e) { }
    try { const h = JSON.parse(localStorage.getItem('tm_hoso') || 'null'); if (h) b = Math.max(b, h.bestWave | 0); } catch (e) { }
    try { if (typeof KT !== 'undefined' && KT.doc) b = Math.max(b, (KT.doc().tk || {}).wave | 0); } catch (e) { }
    return b;
  },
  hp() { return typeof NN !== 'undefined' && NN.vi && NN.vi() ? 'MÁU' : 'HP'; },
  anh(id) { return 'assets/trum_' + id + '_portrait.png'; },
  e: (v) => String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
  tenVi(id) { return typeof NN !== 'undefined' && NN.vi && NN.vi() && this.VI[id] ? '<i class="tx-vi" data-nn-giu="1">' + this.VI[id] + '</i>' : ''; },

  moDS() {
    const best = this.best();
    const hang = this.ds().map(id => {
      const T = TRUM[id], w = this.tu(id), khoa = best < w;
      return '<button class="hm-hang tx-hang' + (khoa ? ' khoa' : '') + '" data-act="tx-ct" data-id="' + id + '" style="--tm:' + T.mau + '">' +
        '<span class="tx-po"><img src="' + this.anh(id) + '" alt="" draggable="false"></span>' +
        '<span class="tx-chu"><b>' + this.e(T.ten) + '</b>' + this.tenVi(id) +
        '<span class="tx-kn"><em>' + this.e(T.kn) + '</em></span>' +
        '<small class="tx-mo">' + this.e(T.mo) + '</small></span>' +
        '<span class="tx-phai"><small>' + (khoa ? 'REACH WAVE ' + w : 'FROM WAVE ' + w) + '</small><i data-nn-giu="1">' + this.hp() + '</i><strong>' + this.so(this.mau(id, w)) + '</strong></span></button>';
    }).join('');
    HM.mo('trum', HM.dau('BOSSES', 'A boss every ' + LUAT.songTrum + ' waves · tap one for details') + '<div class="hm-ds tx-ds">' + hang + '</div>');
  },

  moCT(id) {
    const T = TRUM[id]; if (!T) return;
    const w = this.tu(id), co = this.coop(id), khoa = this.best() < w, kieu = this.KIEU[id] || 'ACTIVE';
    const moc = this.MOC.filter(x => x >= w); if (moc[0] !== w) moc.unshift(w);
    const dong = (a, b) => '<div class="tx-dong"><span>' + a + '</span><b>' + b + '</b></div>';
    const h = '<div class="tx-ct' + (khoa ? ' khoa' : '') + '" style="--tm:' + T.mau + '">' +
      '<div class="tx-ct-dau"><span class="tx-po tx-po-to"><img src="' + this.anh(id) + '" alt="" draggable="false"></span>' +
        '<span class="tx-chu"><b>' + this.e(T.ten) + '</b>' + this.tenVi(id) + (khoa ? '<small class="tx-khoa">REACH WAVE ' + w + '</small>' : '') + '</span></div>' +
      '<div class="hm-loc-nh">SKILL</div>' +
      '<div class="tx-o"><div class="tx-kn"><em>' + this.e(T.kn) + '</em><i>' + kieu + '</i></div><p>' + this.e(T.mo) + '</p>' +
        (kieu === 'ACTIVE' ? '<small>Casts every ' + this.nhip(w) + ' s · red target marks 1.4 s before</small>' : '') + '</div>' +
      '<div class="hm-loc-nh">APPEARS</div>' +
      '<div class="tx-o"><p>Solo &amp; PvP: random boss from wave ' + w + '</p>' + (co ? '<p>Co-op: wave ' + co + '</p>' : '') + '</div>' +
      '<div class="hm-loc-nh">HP BY WAVE</div>' +
      '<div class="tx-o tx-mau">' + moc.map(x => dong('WAVE ' + x, this.so(this.mau(id, x)))).join('') + '</div>' +
      '<div class="hm-loc-nh">EVERY BOSS</div>' +
      '<div class="tx-o"><p>Gets through: −2 lives</p><p>Defeat: ×12 kill mana</p></div>' +
      '<div class="hm-cai2"><button class="hm-nut2" data-act="tx-ds">ALL BOSSES</button></div></div>';
    HM.mo('trum', HM.dau('BOSSES') + h);
    const t = document.getElementById('hm-tam'); if (t) t.scrollTop = 0;
  },

  nutHome() { // nút thứ 3 cạnh DECK / COLLECTION
    const tab = document.querySelector('#hm .hm-tab'); if (!tab || tab.querySelector('[data-act="tx-mo"]')) return;
    tab.classList.add('tx-3');
    const b = document.createElement('button'); b.dataset.act = 'tx-mo';
    b.innerHTML = '<b>BOSSES</b><small>' + this.ds().length + ' BOSSES</small>';
    tab.appendChild(b);
  },
};

(function () {
  if (typeof HM === 'undefined' || typeof TRUM === 'undefined') return;
  const dat = () => { try { TX.nutHome(); } catch (e) { console.error('TX', e); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', dat, { once: true }); else dat();
  window.addEventListener('click', (e) => {
    const el = e.target.closest && e.target.closest('[data-act^="tx-"]'); if (!el) return;
    e.stopImmediatePropagation(); e.preventDefault();
    try {
      const a = el.dataset.act; if (typeof SND !== 'undefined') SND.nut();
      if (a === 'tx-mo' || a === 'tx-ds') { const lai = a === 'tx-ds'; TX.moDS(); if (lai) document.getElementById('hm-mo').classList.add('vao'); }
      else if (a === 'tx-ct') { TX.moCT(el.dataset.id); }
    } catch (er) { console.error('TX', er); }
  }, true);
})();
