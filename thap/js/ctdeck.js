// TURRET MERGE — trang chi tiết ụ mở từ màn BỘ BÀI: bấm "Remove from deck" / "Add to deck" / "Swap into deck"
//  = áp dụng + QUAY VỀ màn bộ bài ngay (giữ vị trí cuộn lưới — tvA.js lo), phản hồi ngắn ở ô bị ảnh hưởng:
//   · bỏ: chân dung cũ mờ dần tại ô đó (~220 ms) · thêm: ô mới nhấc lên kiểu chọn êm (.hm-armed, chonthe.css) ~650 ms
//   · bộ đã đủ 5: về màn bộ bài ở chế độ CHỌN Ô (5 ô nhấc lên) — chạm 1 ô để thay; chạm chỗ khác = huỷ.
//  Mở từ nơi khác (trận, home): giữ như cũ (ở lại trang) + báo ngắn (UI.nhac). Nút Back không đổi.
//  Hình (QUY-TAC-HINH.md): chỉ dùng ảnh có sẵn (chân dung, khung chọn) — code chỉ đổi mờ/vị trí/lớp CSS.
'use strict';
(() => {
  if (typeof UP === 'undefined' || typeof UI === 'undefined' || typeof HM === 'undefined') return;
  const $i = (id) => document.getElementById(id);
  const giam = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const oS = () => [...document.querySelectorAll('#chon-bo .o-bo')];
  const dangDeck = () => { const c = $i('chon'); return !!(c && !c.hidden && c.classList.contains('xem-dk') && !(G.ban && G.ban.length)); };
  const loi = (deck, id) => (typeof DK !== 'undefined' ? DK.loi(deck, id) : '');
  // bộ đầy: có ô nào thay được không (luật 1 Mythic)
  const thayDuoc = (id) => UI.chon.some((_, i) => !loi(UI.chon.filter((__, k) => k !== i), id));
  const CTD = window.CTD = { tuDeck: false, cho: null };

  // ghi nhận nơi mở trang
  const moGoc = UP.mo;
  UP.mo = function () { CTD.tuDeck = dangDeck(); return moGoc.apply(this, arguments); };

  // nút đáy: bộ đầy + mở từ màn bộ bài → "Swap into deck" (về màn bộ bài chọn ô thay) thay vì nút tắt
  const capGoc = UP.capNutBo;
  UP.capNutBo = function () {
    const r = capGoc.apply(this, arguments);
    try {
      if (CTD.tuDeck && !this.mv && this.id && upCo(this.id) && !UI.chon.includes(this.id) && UI.chon.length >= 5 && thayDuoc(this.id)) {
        const nut = this.el.querySelector('.up-nut');
        nut.disabled = false;
        nut.querySelector('.up-nut-chu').textContent = 'Swap into deck';
        nut.querySelector('.up-nut-so').textContent = 'Deck 5/5 · pick a slot';
      }
    } catch (e) { }
    return r;
  };

  // phản hồi ở ô
  const nhac = (o, ms) => { if (!o) return; o.classList.add('hm-armed'); setTimeout(() => { if (CTD.cho == null) o.classList.remove('hm-armed'); }, ms); };
  const mo = (id, i) => { // chân dung cũ mờ dần tại ô i (ảnh có sẵn; code chỉ đổi opacity/scale)
    const o = oS()[i], w = $i('wrap'); if (!o || !w || giam()) return;
    const rw = w.getBoundingClientRect(), k = rw.width / (typeof W !== 'undefined' ? W : rw.width), b = o.getBoundingClientRect();
    const im = document.createElement('img'); im.className = 'ctd-ma'; im.src = portraitOf(id); im.alt = '';
    const s = Math.min(b.width, b.height) / k * 0.82;
    im.style.cssText = 'position:absolute;z-index:15;pointer-events:none;width:' + s + 'px;height:' + s + 'px;object-fit:contain;left:' + ((b.left + b.width / 2 - rw.left) / k - s / 2) + 'px;top:' + ((b.top + b.height / 2 - rw.top) / k - s / 2) + 'px';
    w.appendChild(im);
    const an = im.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.88)' }], { duration: 220, easing: 'ease-out' });
    an.onfinish = () => im.remove();
  };
  const sau = (f) => setTimeout(f, giam() ? 0 : 200); // đợi trang chi tiết trượt ra (190 ms)
  const veLai = () => { HM.armed = -1; HM.luuBo(); UI.veBoChon(); HM.ve(); };

  // chế độ chọn ô (bộ đầy)
  const choO = (id) => {
    CTD.cho = id;
    const b = $i('chon-bo'); if (b) b.classList.add('ctd-cho');
    oS().forEach(o => { if (o.dataset.id) o.classList.add('hm-armed'); });
    UI.nhac('Tap a slot to replace');
  };
  const huyCho = () => {
    if (CTD.cho == null) return; CTD.cho = null;
    const b = $i('chon-bo'); if (b) b.classList.remove('ctd-cho');
    HM.veDeck(); oS().forEach((o, i) => o.classList.toggle('hm-armed', i === HM.armed));
  };
  const veDeckGoc = HM.veDeck;
  HM.veDeck = function () { const r = veDeckGoc.apply(this, arguments); if (CTD.cho != null) oS().forEach(o => { if (o.dataset.id) o.classList.add('hm-armed'); }); return r; };
  // (home.js: window click capture gọi HM.bam(e) lúc chạy → bọc HM.bam để đi trước)
  const hmBamGoc = HM.bam;
  HM.bam = function (e) { if (CTD.cho != null && chamO(e) === false) return; return hmBamGoc.apply(this, arguments); };
  const chamO = (e) => {
    const o = e.target.closest && e.target.closest('#chon-bo .o-bo');
    const id = CTD.cho;
    if (!o || !o.dataset.id || !dangDeck()) { huyCho(); return; }
    e.stopImmediatePropagation(); e.preventDefault();
    if (typeof DK !== 'undefined' && DK.vuaKeo()) { huyCho(); return false; }
    const i = oS().indexOf(o), r = DK.thuThe(id, i);
    if (!r.bo) { UI.nhac(r.loi || TEXT.ui.deckFull); return false; }
    huyCho();
    UI.chon = r.bo; HM.noi = id; veLai(); try { SND.nut(); } catch (er) { }
    nhac(oS()[i], 650);
    return false;
  };

  // nút đáy
  const bamGoc = UP.bam;
  UP.bam = function (e) {
    const b = e.target.closest && e.target.closest('[data-up="bo"]');
    if (!b || this.mv || !this.id || !upCo(this.id)) return bamGoc.apply(this, arguments);
    const id = this.id, trong = UI.chon.includes(id);
    if (!CTD.tuDeck || !dangDeck()) { // mở từ trận / home: ở lại trang như cũ + báo ngắn
      const n0 = UI.chon.length, r = bamGoc.apply(this, arguments);
      if (UI.chon.length !== n0) UI.nhac((trong ? 'Removed from deck' : 'Added to deck') + ' · Deck ' + UI.chon.length + '/5');
      return r;
    }
    if (trong) { // bỏ → về màn bộ bài, ô cũ mờ đi
      const i = UI.chon.indexOf(id);
      UI.chonU(id); if (UI.chon.includes(id)) return;
      this.dong(); veLai(); sau(() => mo(id, i));
      return;
    }
    if (UI.chon.length >= 5) { // đầy → về màn bộ bài, chọn ô để thay
      if (!thayDuoc(id)) return bamGoc.apply(this, arguments);
      try { SND.nut(); } catch (er) { }
      this.dong(); HM.noi = id; HM.ve(); sau(() => choO(id));
      return;
    }
    UI.chonU(id); if (!UI.chon.includes(id)) return; // sai luật: UI.nhac đã báo, ở lại trang
    HM.noi = id; this.dong(); veLai();
    const full = UI.chon.length === 5;
    sau(() => { nhac(oS()[UI.chon.indexOf(id)], 650); if (full) HM.duBo(); });
  };
  // listener click của trang (đã gắn khi dựng) gọi this.bam → dùng bản bọc ở trên
})();
