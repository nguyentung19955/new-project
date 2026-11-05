// TURRET MERGE — BẢNG THÔNG TIN GỌN (pass 2):
//  · Khi bảng #tt mở: KHÔNG hiện thêm dải tên nổi (#nd-dai) — trùng và che bảng.
//  · Nội dung: tên + độ hiếm + vai trò · 1 dòng kỹ năng ngắn · 4 ô số (Damage gốc/+% · Rate · Crit · DPS — js/statthuc.js)
//    · nguồn buff (chỉ khi có) · 1 dòng grow-up (chỉ ụ grow) · 3 chip mốc 3★/5★/7★ · nút "Details ›" → trang chi tiết ụ.
//  · Đoạn dài (họ kỹ năng, ATTACK BY STAGE, mô tả mốc) chỉ còn ở trang chi tiết (js/unitpage.js).
'use strict';
(() => {
  if (typeof UI === 'undefined') return;
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const tran = () => G.ban.length && !$('#top').hidden;

  UI.ttChiTiet = function (id, T, sk, tier) {
    if (!sk) return '<div class="d-so">' + esc(TEXT.ui.comingSoon) + '</div>';
    const L = [];
    if (!T) { // ngoài trận / thẻ: số gốc 1 dòng
      let so = TEXT.ui.baseDmg(Math.round((sk.dmg || 0) * tier.hs), tier.hs);
      const tc = tocTT(id, null); if (tc) so += ' · ' + tc;
      if (!sk.dmg && SUP_LOAI[id] && SUP_GIA[id]) so = BUFF[SUP_LOAI[id]].ten + ' → ' + (sk.tamChu || '4 adjacent cells');
      L.push('<div class="d-so">' + esc(so) + '</div>');
    } else {
      // ô số + nguồn buff do statthuc.js chèn (.st-live). Ụ không có sát thương & không phải hỗ trợ: 1 dòng hiệu lực
      const coLive = sk.dmg || (sk.vai === 'ht' && hoTroTT(T));
      let so = T.sao + '★ · LV' + (G.ban[T.ban].lv[id] || 1);
      if (!coLive && sk.mo) { try { so += ' · ' + sk.mo(T); } catch (e) { } }
      if (sk.chuDong) so += ' · ' + (T.nap >= 1 ? TEXT.ui.readyTap : TEXT.ui.charge(Math.round(T.nap * 100)));
      L.push('<div class="d-so g1">' + esc(so) + '</div>');
    }
    if (false) { // (bỏ dòng chữ grow-up — người chơi tự khám phá)
      const g = GROW[id];
      let d = '<b style="color:' + g.mau + '">GROW-UP</b> ';
      if (T) { const st = g.gd(T); d += st.s + '/3 <b style="color:' + g.mau + '">' + esc(g.ten[st.s - 1]) + '</b> · ' + Math.round(clamp(st.p, 0, 1) * 100) + '%'; }
      else d += esc(g.ten.join(' → '));
      L.push('<div class="d-grow g1">' + d + '</div>');
    }
    // mốc sao: 3 chip nhỏ
    L.push('<div class="d-chip">' + mocCua(id).map(m => '<span class="' + (T && T.sao >= m.n ? 'co' : '') + '" title="' + esc(m.mo) + '"><b>' + m.n + '★</b>' + esc(m.ten) + '</span>').join('') +
      '<a class="tt-ct" data-ct="' + esc(id) + '" role="button">Details ›</a></div>');
    return L.join('');
  };

  // 1 dòng kỹ năng ngắn (câu đầu) + ẩn dải tên nổi khi bảng đang mở
  const moGoc = UI.moTT;
  UI.moTT = function (id, T, giu) {
    const r = moGoc.apply(this, arguments);
    const kn = $('#tt .tt-kn'), s = (G.rosterMap[id] && G.rosterMap[id].kyNang) || '';
    if (kn) { kn.textContent = s.split(/(?<=\.)\s/)[0]; kn.title = s; }
    if (typeof ND !== 'undefined') ND.anDai();
    $('#tt').classList.add('gon');
    return r;
  };
  const moMVGoc = UI.moTTMV;
  UI.moTTMV = function () { const r = moMVGoc.apply(this, arguments); $('#tt').classList.add('gon'); if (typeof ND !== 'undefined') ND.anDai(); return r; };

  // "Details ›" → trang chi tiết; trong trận tạm dừng rồi chạy lại khi đóng
  document.addEventListener('click', (e) => {
    const a = e.target.closest('.tt-ct'); if (!a || typeof UP === 'undefined') return;
    e.stopPropagation();
    const dangTran = tran();
    if (dangTran && !G.dung) { G.dung = true; UI._dungVi = true; }
    $('#tt').hidden = true; UI.ttHet = 0;
    UP.mo(a.dataset.ct, a);
    UP.el.classList.toggle('tran', !!dangTran);
  }, true);
  if (typeof UP !== 'undefined') {
    const dongGoc = UP.dong;
    UP.dong = function () { const r = dongGoc.apply(this, arguments); if (UI._dungVi) { UI._dungVi = false; if ($('#dung').hidden) G.dung = false; } if (this.el) this.el.classList.remove('tran'); return r; };
  }
})();
