// TURRET MERGE — HUD MƯỢT B: HUD TRONG TRẬN GỌN (docs/demo-hop-tuong/thap-art/TU-VAN-HUD-MUOT.txt §3D/§3E/§4)
//  · Bàn của mình to hơn + căn giữa vùng chơi (data.js boCuc); CO-OP/PVP: bàn đồng đội / đối thủ gọn ở trên.
//  · XEM NHANH (11/2026, người dùng: inspect_dung_game.png): chạm ụ → CHỈ dải gọn (chân dung · tên màu độ hiếm + ★ · 1 dòng kỹ năng
//    · 2 số DMG / RATE). KHÔNG còn nút › / tấm mở rộng / Details / tạm dừng trong trận — trận luôn chạy (mọi chế độ).
//    Đóng: chạm ngoài / chạm lại ụ / bắt đầu kéo / tự ẩn ~4 s. (Ghi chú cũ bên dưới về tấm mở rộng: không còn dùng.)
//    Vị trí cũ: dải ~60 px. Không che ô nào:
//      SOLO = ngay trên khay dưới (dưới làn đường dưới); CO-OP/PVP = ngay dưới thanh trên (đè bàn gọn phía trên, chưa tới ô).
//    Nút › → TẤM MỞ RỘNG (đủ 4 số, nguồn buff, mốc sao, Details ›) + nút đóng; SOLO trượt lên từ đáy (che khay, không che ô),
//    CO-OP/PVP thả xuống từ trên (che bàn gọn). Không phủ nền mờ lên bàn: bàn vẫn chạm/ghép được; chạm ụ khác = đổi nội dung,
//    chạm chỗ trống = đóng. Tấm mở rộng không tự đóng; dải tự ẩn sau ~4 s như cũ.
//  · Mana: số chạy lên/xuống 220–350 ms (gộp cập nhật, không lăn liên tục). Triệu hồi khi bàn đầy: chỉ chữ FULL + lắc khi chạm.
//  · Băng WAVE đầu wave: dải mỏng ngay dưới thanh trên ≤ 0,7 s rồi thu vào ô WAVE (không còn băng thứ 2 giữa bàn).
//  · Nhãn bàn: chỉ bàn đồng đội / đối thủ có nhãn (bàn của mình to ở dưới — không cần chữ "You").
//  Chỉ chữ/số + ảnh PNG có sẵn (khung_tt, h2_tam, mui_tiep, ic_*); QUY-TAC-HINH.md.
'use strict';
const HB = {
  // ---------- vị trí theo chế độ (toạ độ logic 430×860) ----------
  oBan(B) { // mép trên/dưới VÙNG Ô của bàn (không tính viền khay)
    return { tren: B.o[0].y - B.ch / 2, duoi: B.o[14].y + B.ch / 2 };
  },
  hai() { return G.ban.length > 1; },
  tran() { return G.ban.length && !$('#top').hidden && !(typeof SD !== 'undefined' && SD.dang); },
  dat(tt, rong) {
    const B0 = G.ban[0]; if (!B0) return;
    const DUOI = 674, TREN = 60; // mép trên khay dưới (#duoi) · dưới thanh trên + tấm tim đối thủ
    tt.classList.toggle('hb-tren', this.hai());
    tt.style.height = ''; tt.style.bottom = ''; tt.style.maxHeight = '';
    if (!rong) { tt.style.top = (this.hai() ? TREN : DUOI - 64) + 'px'; return; } // dải 60 px
    if (this.hai()) { // thả xuống từ trên, dừng trước hàng ô đầu của bàn mình
      tt.style.top = TREN + 'px'; tt.style.maxHeight = Math.max(200, Math.round(this.oBan(B0).tren - 8) - TREN) + 'px';
    } else { // trượt lên từ đáy, không lên quá làn đường dưới (dưới hàng ô cuối)
      const p = G.duong[0], yl = p ? Math.max(...p.pts.map(q => q[1])) : this.oBan(B0).duoi + 40;
      const top = Math.round(Math.max(this.oBan(B0).duoi + 12, yl + 26));
      tt.style.top = 'auto'; tt.style.bottom = '6px'; tt.style.maxHeight = (H - 6 - top) + 'px';
    }
  },
  // ---------- dải xem nhanh ----------
  dung(tt) {
    if (tt._hb) return;
    tt._hb = 1;
    const than = tt.querySelector('.tt-than');
    const so = document.createElement('div'); so.className = 'hb-so'; than.insertBefore(so, tt.querySelector('.tt-so'));
    // (đã BỎ nút › mở tấm lớn trong trận — người dùng: chỉ xem gọn, không dừng trận, không Details)
    const dong = document.createElement('button'); dong.className = 'hb-dong'; dong.type = 'button'; dong.setAttribute('aria-label', 'Close');
    dong.textContent = 'CLOSE'; // chữ thay icon (QUY-TAC 1: không dùng ký tự ✕ giả icon) — chờ icon close A12/c2
    tt.appendChild(dong);
    const chan = (e) => { e.stopPropagation(); };
    for (const b of [dong]) { b.addEventListener('pointerdown', chan); b.addEventListener('pointerup', chan); }
    dong.addEventListener('click', (e) => { e.stopPropagation(); this.dongHet(); });
    // ẩn #tt (bất kỳ chỗ nào trong game) → tắt nền mờ + về dạng dải
    new MutationObserver(() => { if (tt.hidden) tt.classList.remove('hb-rong', 'hb-vao'); }).observe(tt, { attributes: true, attributeFilter: ['hidden'] });
  },
  moRong(rong) {
    rong = false; // trong trận chỉ có dải xem gọn (không tấm lớn, không tạm dừng)
    const tt = $('#tt'); if (tt.hidden) return;
    tt.classList.toggle('hb-rong', rong);
    this.dat(tt, rong);
    if (rong) UI.ttHet = 0; // đang đọc: không tự đóng
    else UI.ttHet = performance.now() + 4000;
    if (typeof ST !== 'undefined') try { ST.ve(); } catch (e) { }
  },
  dongHet() { const tt = $('#tt'); tt.hidden = true; UI.ttHet = 0; UI.xemU = null; },
  soNgan(id, T) { // 2 số: DMG · RATE (trong trận, số thực) — ngoài ra lấy dòng số gốc
    if (T && typeof statThuc === 'function') {
      const s = statThuc(T), f = (v) => (typeof ST !== 'undefined' ? ST.so(v) : Math.round(v));
      // BẢN SAO Copycat: luôn hiện dấu Copycat (PNG) + % sức mạnh — cả sau khi biến hình (Hộp Bí Ẩn / Tiến Hoá / Xáo Trộn…) — MA-TRAN.md
      const bs = T.banSao ? '<span class="hb-bs"><img src="assets/nho/saochep.webp?v=3be146d4" alt=""><small>COPY</small><b>' + Math.round(heSaoChep(G.ban[T.ban]) * 100) + '%</b></span>' : '';
      if (s.coDmg) return '<span><small>DMG</small><b>' + f(s.dmg) + '</b></span><span><small>RATE</small><b>' + (s.frozen ? '0' : s.toc.toFixed(2)) + '</b><i>/s</i></span>' + bs;
      const sk = SKILLS[T.id]; if (sk && sk.vai === 'ht' && typeof hoTroTT === 'function') { const h = hoTroTT(T); if (h) return bs + '<span class="ht">' + ST.esc(h.dong.replace(' (current)', '')) + '</span>'; }
      if (bs) return bs;
    }
    const d = $('#tt .tt-so .d-so'), s = d ? d.textContent.replace(/^\s*\d+\s*★?\s*·\s*LV\s*\d+(\+\d+)?(\s*·\s*)?/, '') : ''; // bỏ "N★ · LVn" (sao đã có cạnh tên)
    return s ? '<span class="ht">' + (typeof ST !== 'undefined' ? ST.esc(s) : s) + '</span>' : '';
  },
  veSo() {
    const tt = $('#tt'); if (tt.hidden || !tt.classList.contains('hb-qi')) return;
    const X = UI.xemU, el = tt.querySelector('.hb-so'); if (!el) return;
    const h = this.soNgan(this._id, X && X.T && G.ban[X.T.ban] && G.ban[X.T.ban].t[X.T.o] === X.T ? X.T : null);
    if (el._h !== h) { el._h = h; el.innerHTML = h; }
    // Leviathan: dòng kỹ năng = số ABYSS sống (đúng số trên tấm xoáy vực đáy ô) + gợi ý vòng nuốt xanh (hieuung.js veChon)
    const kn = tt.querySelector('.tt-kn'), LT = X && X.T && X.T.id === 'leviathan' && G.ban[X.T.ban] && G.ban[X.T.ban].t[X.T.o] === X.T ? X.T : null;
    if (kn && LT) { const n = Math.min(100, LT.vuc || 0), s = 'ABYSS ' + n + '/100 · +' + 4 * n + '% damage · devours enemies inside the cyan ring — place it next to the path to eat more'; if (kn._lev !== s) { kn._lev = s; kn.textContent = s; } }
    else if (kn) kn._lev = null;
  },
  mo(tt, id, T) {
    this.dung(tt);
    this._id = id;
    tt.classList.add('hb-qi'); tt.classList.remove('hb-rong');
    // tên + ★ (số sao trong trận) trên 1 dòng; dòng vai trò/độ hiếm ẩn (đã có ở tấm mở rộng)
    const sao = tt.querySelector('.hb-sao') || (() => { const b = document.createElement('b'); b.className = 'hb-sao'; tt.querySelector('.tt-dau').insertBefore(b, tt.querySelector('.tt-bac')); return b; })();
    sao.innerHTML = T ? T.sao + '<img src="assets/ui_sao.webp?v=bae43e7e" alt="">' : ''; sao.hidden = !T;
    const so = tt.querySelector('.hb-so'); so._h = null;
    this.veSo();
    this.dat(tt, false);
    tt.classList.remove('hb-vao'); void tt.offsetWidth; tt.classList.add('hb-vao');
    if (typeof fitText === 'function') fitText(tt.querySelector('.tt-ten'), 15, 11);
  },
  // ---------- mana chạy số ----------
  mana() {
    const B = G.ban[0], el = $('#mana'); if (!B || !el) return;
    const dich = Math.floor(B.mana), now = performance.now();
    if (this._mH == null || !this.tran()) { this._mH = dich; this._mT = now; return; }
    if (dich !== this._mD) { this._m0 = this._mH; this._mD = dich; this._mT = now; this._mDur = clamp(220 + Math.abs(dich - this._m0) * 2, 220, 350); }
    const u = clamp((now - this._mT) / (this._mDur || 260), 0, 1), e = 1 - Math.pow(1 - u, 3);
    this._mH = Math.round(this._m0 + (dich - this._m0) * e);
    if (u >= 1) this._mH = dich;
    const s = String(this._mH); if (el.textContent !== s) el.textContent = s;
  },
};

(() => {
  if (typeof UI === 'undefined') return;
  const moGoc = UI.moTT;
  UI.moTT = function (id, T, giu) {
    const r = moGoc.apply(this, arguments);
    const tt = $('#tt');
    if (HB.tran() && !tt.hidden) { HB.mo(tt, id, T); this.ttHet = performance.now() + 4000; }
    else tt.classList.remove('hb-qi', 'hb-rong', 'hb-tren');
    return r;
  };
  const mvGoc = UI.moTTMV;
  UI.moTTMV = function () {
    const r = mvGoc.apply(this, arguments);
    const tt = $('#tt');
    if (HB.tran() && !tt.hidden) { HB.mo(tt, null, null); this.ttHet = performance.now() + 4000; }
    else tt.classList.remove('hb-qi', 'hb-rong', 'hb-tren');
    return r;
  };
  const capGoc = UI.capNhat;
  UI.capNhat = function () { const r = capGoc.apply(this, arguments); try { HB.mana(); } catch (e) { } return r; };
  const vaoGoc = UI.vaoTran;
  UI.vaoTran = function () { HB._mH = null; const r = vaoGoc.apply(this, arguments); const tt = $('#tt'); tt.classList.remove('hb-qi', 'hb-rong'); return r; };
  setInterval(() => { if (!G.ban.length || document.hidden) return; try { HB.veSo(); } catch (e) { } }, 250); // ngoài trận / ẩn tab: nghỉ
  // mana chạy mượt cả khi HUD chỉ cập nhật 30 lần/giây — chạy trong vòng rAF chung của UI (không mở vòng rAF riêng: chống nóng máy)
  UI.moiKhung.push(() => { if (G.ban.length) HB.mana(); });
  // Triệu hồi khi bàn đầy: chạm → chỉ lún (nutlun.css), không lắc
})();
window.HB = HB;
