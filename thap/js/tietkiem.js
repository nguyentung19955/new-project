// TURRET MERGE — TIẾT KIỆM PIN / CHỐNG NÓNG MÁY (docs/demo-hop-tuong/tuvan/nong/BAO-CAO.md)
//  Cài đặt "POWER SAVE" (mặc định TẮT, localStorage tm_tietkiem): 30 khung/giây · canvas trận ≤ 2× · nửa số hạt hiệu ứng.
//  Tự GỢI Ý 1 lần (mỗi máy) khi trận nặng kéo dài (REN.doKhung báo): tấm nhỏ trên cùng, 2 nút, tự ẩn sau 10 s.
//  Áp dụng mọi chế độ (SOLO / CO-OP / PVP / ONLINE / Test range) vì dùng chung vòng lặp UI + REN + FX.
//  Chỉ chữ + ảnh PNG có sẵn (h2_tam_mong, nút hm-nut2) — không vẽ hình mới (QUY-TAC-HINH.md).
'use strict';
const TKP = {
  KEY: 'tm_tietkiem', KEY_GY: 'tm_tietkiem_goiy',
  _on: null, _nang: 0, _daGoi: false,
  on() { if (this._on === null) { try { this._on = localStorage.getItem(this.KEY) === '1'; } catch (e) { this._on = false; } } return this._on; },
  apDung() {
    const on = this.on();
    if (typeof FX !== 'undefined') FX.MAX_HAT = on ? 160 : 320;
    if (typeof REN !== 'undefined') { REN.dprMax = on ? 2 : null; REN._ft = REN._fv = null; REN._cham = 0; if (REN.cv) REN.coLai(); }
  },
  dat(v) { this._on = !!v; try { localStorage.setItem(this.KEY, v ? '1' : '0'); } catch (e) { } this.apDung(); this.nhan(); },
  nhan() { document.querySelectorAll('[data-act="tk-pin"]').forEach(e => { e.textContent = 'POWER SAVE: ' + (this.on() ? 'ON' : 'OFF'); }); },
  // REN.doKhung gọi mỗi khung trận: nang = khung dài hơn mục tiêu (máy đang gồng). ~20 s nặng (cộng dồn) → gợi ý 1 lần
  baoNang(dt, nang) {
    if (this._daGoi || this.on()) return;
    this._nang = nang ? this._nang + dt : Math.max(0, this._nang - dt * 0.25);
    if (this._nang > 20) this.goiY();
  },
  goiY() {
    this._daGoi = true;
    try { if (localStorage.getItem(this.KEY_GY)) return; localStorage.setItem(this.KEY_GY, '1'); } catch (e) { }
    if (document.documentElement.classList.contains('up-xem')) return; // khung xem trước (trang ụ): không gợi ý
    const w = document.getElementById('wrap'); if (!w || document.getElementById('tk-goiy')) return;
    const d = document.createElement('div'); d.id = 'tk-goiy'; d.className = 'hm-p-tam';
    d.innerHTML = '<span>Phone getting warm? Power save: 30 FPS, lighter effects.</span>' +
      '<button class="hm-nut2 vang" data-act="tk-bat">TURN ON</button><button class="hm-nut2" data-act="tk-bo">NO</button>';
    w.appendChild(d);
    const an = () => { if (d.parentNode) d.remove(); };
    d.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; e.stopPropagation(); try { SND.nut(); } catch (er) { } if (b.dataset.act === 'tk-bat') this.dat(true); an(); });
    setTimeout(an, 10000);
  },
};
window.TKP = TKP;
(() => {
  TKP.apDung();
  // nút trong Cài đặt (sảnh) — cùng kiểu BATTLE HINTS / CHAT
  if (typeof HM !== 'undefined' && HM.moCai) {
    const g = HM.moCai;
    HM.moCai = function () {
      const r = g.apply(this, arguments);
      const h = document.querySelector('#hm-tam .hm-cai2');
      if (h && !h.querySelector('[data-act="tk-pin"]')) h.insertAdjacentHTML('beforeend', '<button class="hm-nut2" data-act="tk-pin"></button>');
      TKP.nhan(); return r;
    };
  }
  document.addEventListener('click', (e) => {
    const el = e.target.closest && e.target.closest('[data-act="tk-pin"]'); if (!el) return;
    e.stopImmediatePropagation(); TKP.dat(!TKP.on()); try { SND.nut(); } catch (er) { }
  }, true);
})();
