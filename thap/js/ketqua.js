// TURRET MERGE — MÀN KẾT QUẢ (P0-07): wave đạt được, số trùm đã hạ, nguyên nhân thua (quái/trùm lọt nhiều nhất),
// bộ bài đã chơi, kỷ lục cá nhân (localStorage 'turret_best'), nút RETRY SAME DECK / EDIT DECK. Không có phần thưởng giả.
// Chỉ bọc batDau / lot / chet / UI.ketQua — không đổi luật chơi. Hình: khung_bang (bảng), h2_lcd (ô số), ảnh thẻ có sẵn.
'use strict';

const KQ = {
  KEY: 'turret_best',
  m: null, // trận hiện tại: { che, deck, mv, tut, lot: {key: tim}, trum }
  best() { try { return JSON.parse(localStorage.getItem(this.KEY) || '{}') || {}; } catch (e) { return {}; } },
  luuBest(b) { try { localStorage.setItem(this.KEY, JSON.stringify(b)); } catch (e) { } },
  tenKey(k) { return k.startsWith('trum:') ? 'Boss ' + TRUM[k.slice(5)].ten : (QUAI[k] ? QUAI[k].ten : k); },
  // gợi ý MỘT việc nên thử tiếp theo, theo thứ làm mất nhiều tim nhất
  meo(k) {
    if (!k) return 'Upgrade the turret you summon most by tapping its card below the board.';
    if (k.startsWith('trum:')) return 'Bosses: merge to higher ★ before wave ' + LUAT.songTrum + ' and save mana for your commander.';
    return ({
      bay: 'Fast Flyers: add rapid fire (Gatling, Scatter) or a slow (Frost).',
      bay_bang: 'Frost Flyers ignore slows: bring raw damage or Tesla chains.',
      khong_lo: 'Giants: heavy single-target turrets (Sniper, Revolver) and Armor Breaker.',
      que_tach: 'Big Splitters: splash (Cannon, Mortar) cleans up the pieces.',
      tach: 'Splitters burst into 5: splash damage (Cannon, Mortar) handles them.',
      nho: 'Spawnlings: splash or chain damage clears swarms.',
      bo: 'Crawlers slipped through: summon earlier and merge pairs right away.',
    })[k] || 'Try swapping one card for a turret with a different role.';
  },
};

(function () {
  const batGoc = batDau;
  batDau = function (che, deck, mv) {
    KQ.m = { che, deck: deck.slice(), mv, tut: typeof HD !== 'undefined' && HD.dang, lot: {}, trum: 0 };
    return batGoc.apply(this, arguments);
  };
  // lọt: chỉ đếm tim mất của phía người chơi (solo/co-op: tim chung; pvp: làn của mình)
  const lotGoc = lot;
  lot = function (E) {
    try {
      const p = G.duong[E.p], cua = G.che === 'coop' || (p && p.ban === 0);
      if (KQ.m && cua && !E.chet) { const k = E.trum ? 'trum:' + E.trum : E.id; KQ.m.lot[k] = (KQ.m.lot[k] || 0) + (E.tim || 1); }
    } catch (e) { }
    return lotGoc.apply(this, arguments);
  };
  const chetGoc = chet;
  chet = function (E) {
    const da = E.chet, r = chetGoc.apply(this, arguments);
    try { if (KQ.m && !da && E.chet && E.trum && (G.che !== 'pvp' || G.duong[E.p].ban === 0)) KQ.m.trum++; } catch (e) { }
    return r;
  };

  const kqGoc = UI.ketQua;
  UI.ketQua = function (k) {
    const r = kqGoc.apply(this, arguments);
    try { ve(k); } catch (e) { console.error('KQ', e); }
    return r;
  };

  function ve(k) {
    const m = KQ.m || { che: G.che, deck: (G.ban[0] || {}).deck || [], mv: 'hero', lot: {}, trum: 0 };
    const bang = document.querySelector('#ketqua .bang'); if (!bang) return;
    const wave = Math.max(1, k.wave || G.wave);
    // kỷ lục cá nhân theo chế độ (trận hướng dẫn không tính)
    let moi = false, b = KQ.best(), cu = b[m.che] || { wave: 0, trum: 0 };
    if (!m.tut) { if (wave > (cu.wave || 0)) { moi = true; b[m.che] = { wave, trum: m.trum, deck: m.deck, mv: m.mv }; KQ.luuBest(b); } }
    const bestWave = m.tut ? null : Math.max(wave, cu.wave || 0);
    let chi = bang.querySelector('#kq-chi');
    if (!chi) { chi = document.createElement('div'); chi.id = 'kq-chi'; bang.insertBefore(chi, bang.querySelector('.bang-nut')); }
    // HUD mượt C: màn riêng gọn — biểu tượng + VICTORY/DEFEAT + WAVE to (đếm lên) · 2 ô số · 1 thẻ "thử tiếp" · Chi tiết (chạm) · RETRY to + EDIT nhỏ
    const kq = document.getElementById('ketqua'); kq.classList.add('kq7'); kq.classList.remove('mo-ct');
    const o = (nhan, so, phu) => '<div class="kq-o"><small>' + nhan + '</small><b>' + so + '</b>' + (phu ? '<em>' + phu + '</em>' : '') + '</div>';
    // tư vấn C §B18: 3 ô số (trùm hạ · kỷ lục · tim còn) · THUA có màn riêng: chữ "Fell at", nguyên nhân cụ thể, nhãn mẹo "FIX FOR NEXT RUN"
    const timCon = G.ban[0] ? Math.max(0, G.ban[0].tim | 0) : 0, timMax = (G.che === 'pvp' ? LUAT.timPvp : G.che === 'coop' ? LUAT.timCoop : LUAT.timSolo) || 3;
    let h = '<div class="kq-hang">' + o('BOSSES', m.trum) + (m.tut ? '' : o('BEST ' + m.che.toUpperCase(), bestWave, moi ? 'NEW BEST' : '')) + o('LIVES', timCon + '/' + timMax) + '</div>';
    // 06/11 (người chơi): bỏ thẻ huấn luyện 'WHAT BROKE THROUGH / FIX FOR NEXT RUN' và Match details ('WHAT GOT THROUGH') — DCDW gọn:
    // màn kết quả chỉ còn kết quả · 3 ô số · thưởng · nút (vừa một màn, nút luôn thấy)
    chi.innerHTML = h;
    // số wave đếm lên 0 → wave trong ~350 ms (giảm chuyển động: hiện ngay)
    const so = document.querySelector('#kq-so b');
    if (so && !k.thang && so.previousSibling && so.previousSibling.nodeType === 3) so.previousSibling.textContent = 'Fell at ';
    if (so && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      const t0 = performance.now(), D = 350; so.textContent = 'WAVE 0';
      const buoc = (t) => { const x = Math.min(1, (t - t0) / D); so.textContent = 'WAVE ' + Math.round(wave * (1 - Math.pow(1 - x, 3))); if (x < 1) requestAnimationFrame(buoc); };
      setTimeout(() => requestAnimationFrame(buoc), 260);
    }
    // nút: hướng dẫn → chơi lại hướng dẫn / chọn bộ; thường → RETRY SAME DECK / EDIT DECK
    const lai = bang.querySelector('[data-act="choilai"], [data-act="hd-choi"]'), sua = bang.querySelector('[data-act="doibo"]');
    if (m.tut) {
      if (lai) { lai.dataset.act = k.thang ? 'choilai' : 'hd-choi'; lai.textContent = k.thang ? 'PLAY AGAIN' : 'RETRY TUTORIAL'; }
      if (sua) sua.textContent = k.thang ? 'PICK YOUR DECK' : 'SKIP TO DECKS';
      if (sua && !k.thang) sua.dataset.hdbo = '1'; else if (sua) delete sua.dataset.hdbo;
    } else {
      if (lai) { lai.dataset.act = 'choilai'; lai.textContent = 'RETRY SAME DECK'; }
      if (sua) { sua.textContent = 'EDIT DECK'; delete sua.dataset.hdbo; }
    }
  }
  // "SKIP TO DECKS" sau khi thua hướng dẫn = bỏ qua hướng dẫn (mở bộ sưu tập)
  document.addEventListener('click', (e) => {
    const el = e.target.closest && e.target.closest('#ketqua [data-hdbo]'); if (!el) return;
    if (typeof HD !== 'undefined') { HD.st.boQua = true; HD.luu(); HD.ket(); }
  }, true);
  // Retry same deck sau trận thường: luôn dùng đúng bộ vừa chơi (kể cả khi UI.chon đã đổi)
  document.addEventListener('click', (e) => {
    const el = e.target.closest && e.target.closest('#ketqua [data-act="choilai"]'); if (!el || !KQ.m) return;
    if (KQ.m.tut) return; // hướng dẫn đã xong: chơi lại = trận thường với bộ khởi đầu
    UI.chon = KQ.m.deck.slice(); UI.mv = KQ.m.mv; UI.che = KQ.m.che;
  }, true);
})();
