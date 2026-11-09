// TURRET MERGE — RÀ SOÁT THIẾT KẾ 09/11 (người dùng duyệt). css/rasoat.css đi kèm.
//  1) KHOÁ DỌC: web không khoá cứng được → (a) manifest "orientation":"portrait" (đã có), (b) thử screen.orientation.lock('portrait')
//     khi vào toàn màn / chạy như app (PWA) — bọc try/catch, trình duyệt từ chối thì thôi, (c) điện thoại nằm ngang (con trỏ thô +
//     chiều cao nhỏ) → lớp phủ toàn màn "Xoay dọc máy để chơi" + TẠM DỪNG trận (G.dung, như khi ẩn tab); xoay lại → chạy tiếp.
//     Chơi online / co-op không tạm dừng (đồng bộ mạng) — chỉ phủ màn. Máy tính màn rộng (con trỏ chuột) giữ nguyên.
//     Hình: chỉ ảnh có sẵn (nen_menu, khung_bang, icon-192 xoay bằng transform) — icon "điện thoại xoay" riêng chờ gen
//     (prompt: docs/demo-hop-tuong/HINH-VE-CODE-AUDIT.md mục RÀ SOÁT 09/11); có ảnh chỉ cần đổi XD.IC.
//  2) NÚT "i" trên thẻ ụ (màn bộ bài / bộ sưu tập, ui.js theChon): chạm = trang chi tiết (UP.mo). Chạm thẻ / giữ thẻ / kéo thả giữ nguyên.
'use strict';
const XD = {
  IC: 'assets/icon/icon-192.png',
  mo: false, _dung: false,
  mq: (typeof matchMedia === 'function') ? matchMedia('(orientation: landscape) and (pointer: coarse) and (max-height: 540px)') : null,
  ngang() {
    if (this.mq && this.mq.matches) return true;
    // dự phòng (trình duyệt không hỗ trợ pointer media query): máy cảm ứng, ngang, thấp
    const t = (navigator.maxTouchPoints || 0) > 0 && !(typeof matchMedia === 'function' && matchMedia('(pointer: fine)').matches);
    return t && innerWidth > innerHeight && innerHeight <= 540;
  },
  t(s) { return typeof NN !== 'undefined' && NN.t ? NN.t(s) : s; },
  dung() {
    let el = document.getElementById('xoay-doc'); if (el) return el;
    el = document.createElement('div'); el.id = 'xoay-doc'; el.hidden = true; el.setAttribute('role', 'alertdialog'); el.setAttribute('aria-live', 'assertive');
    el.innerHTML = '<div class="xd-tam"><span class="xd-ic"><img src="' + this.IC + '" alt="" draggable="false"></span>' +
      '<span class="xd-chu"><b data-nn-giu="1">' + this.t('ROTATE TO PLAY') + '</b><span data-nn-giu="1">' + this.t('Turret Merge is played in portrait only') + '</span>' +
      '<small data-nn-giu="1" hidden>' + this.t('The battle is paused until you rotate back') + '</small></span></div>';
    // nuốt mọi chạm khi đang phủ (không chạm xuyên xuống bàn chơi)
    for (const ev of ['pointerdown', 'pointerup', 'click', 'touchstart', 'touchmove']) el.addEventListener(ev, (e) => { e.stopPropagation(); if (e.cancelable && ev !== 'touchstart') e.preventDefault(); }, { passive: false });
    document.body.appendChild(el); return el;
  },
  trongTran() { return typeof G !== 'undefined' && G.ban && G.ban.length > 0 && !G.ketThuc; },
  online() { return (typeof ONS !== 'undefined' && !!ONS.on) || (typeof ONL !== 'undefined' && !!ONL.dangTran); },
  kt() {
    const n = this.ngang();
    if (n === this.mo) { if (n) this.tamDung(); return; }
    this.mo = n;
    const el = this.dung(); el.hidden = !n;
    document.documentElement.classList.toggle('xoay-ngang', n);
    if (n) this.tamDung(); else this.chayLai();
  },
  tamDung() {
    if (!this.trongTran() || this.online() || G.dung) { this.hienChu(); return; }
    G.dung = true; this._dung = true;
    try { if (typeof UI !== 'undefined' && UI.huyKeo) UI.huyKeo(); } catch (e) { }
    this.hienChu();
  },
  hienChu() { const s = document.querySelector('#xoay-doc small'); if (s) s.hidden = !this._dung; },
  chayLai() {
    if (this._dung) {
      this._dung = false;
      const menu = document.getElementById('dung'); // menu TẠM DỪNG của người chơi đang mở → để người chơi tự bấm tiếp tục
      if (typeof G !== 'undefined' && G.ban && G.ban.length && !G.ketThuc && (!menu || menu.hidden)) G.dung = false;
    }
    this.hienChu();
  },
  khoa() { // thử khoá dọc — chỉ được khi đang toàn màn / chạy như app; lỗi thì bỏ qua
    try {
      const app = document.fullscreenElement || document.webkitFullscreenElement || (typeof matchMedia === 'function' && (matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches)) || navigator.standalone;
      if (!app || !screen.orientation || typeof screen.orientation.lock !== 'function') return;
      const p = screen.orientation.lock('portrait'); if (p && p.catch) p.catch(() => { });
    } catch (e) { }
  },
  init() {
    const lai = () => { this.kt(); };
    if (this.mq) { if (this.mq.addEventListener) this.mq.addEventListener('change', lai); else if (this.mq.addListener) this.mq.addListener(lai); }
    addEventListener('resize', lai); addEventListener('orientationchange', () => { lai(); setTimeout(lai, 300); });
    if (screen.orientation && screen.orientation.addEventListener) screen.orientation.addEventListener('change', lai);
    document.addEventListener('fullscreenchange', () => this.khoa()); document.addEventListener('webkitfullscreenchange', () => this.khoa());
    addEventListener('pointerdown', () => { if (!this._daKhoa) { this._daKhoa = true; this.khoa(); } }, { capture: true, once: true });
    // trận bắt đầu trong lúc máy đang ngang (vd. bấm CHƠI rồi xoay) → kiểm lại định kỳ nhẹ (1 lần/giây, chỉ đọc media query)
    setInterval(() => { if (this.mo) this.tamDung(); }, 1000);
    this.khoa(); this.kt();
  },
};

// ---------- 2 · nút "i" trên thẻ: mở chi tiết (bọc ngoài cùng HM.bam — dkcham.js biến chạm thẻ thành "nhấc thẻ") ----------
const RSI = {
  init() {
    if (typeof HM === 'undefined' || !HM.bam || HM.__rsi) return; HM.__rsi = 1;
    const bam = HM.bam;
    HM.bam = function (e) {
      const i = e.target && e.target.closest && e.target.closest('#chon-luoi .the-i');
      if (i) {
        const c = i.closest('.c[data-id]'); e.stopImmediatePropagation(); e.preventDefault();
        if (c && !(typeof DK !== 'undefined' && DK.vuaKeo && DK.vuaKeo())) {
          try { if (typeof DC !== 'undefined' && DC.cho != null) DC.huyDoi(); } catch (er) { }
          try { SND.nut(); } catch (er) { }
          HM.noi = c.dataset.id; if (typeof UP !== 'undefined') UP.mo(c.dataset.id, c); else if (HM.moXem) HM.moXem(c.dataset.id);
        }
        return;
      }
      return bam.apply(this, arguments);
    };
  },
};

(function () {
  const chay = () => { try { XD.init(); } catch (e) { console.error('XD', e); } try { RSI.init(); } catch (e) { console.error('RSI', e); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', chay, { once: true }); else chay();
})();
