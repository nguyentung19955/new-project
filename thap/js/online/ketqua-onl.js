// TURRET MERGE — MÀN KẾT QUẢ TRẬN ONLINE (co-op + pvp online). Nạp SAU khoidong.js.
//  · Trận online KHÔNG BAO GIỜ ra DEFEAT chỉ vì có người rời: hết trận khi còn tim (bạn rời / phòng đóng / mất mạng)
//    = màn TRUNG TÍNH "MATCH ENDED — Partner left / Connection lost" (giữ wave + kỷ lục, không khiên đỏ, không mẹo nâng cấp).
//    Thua thật chỉ khi tim chung về 0. PVP: đối thủ rời = VICTORY (xử thắng).
//  · Nút online (không bao giờ có RETRY SAME DECK — nút đó chỉ cho SOLO / CO-OP với máy / Test):
//    bạn còn trong phòng → REMATCH (gửi lời mời, cả 2 đồng ý mới bắt đầu, có trạng thái chờ) · BACK TO LOBBY (cùng phòng, đổi bộ ở sảnh) · HOME
//    bạn đã đi → FIND NEW PARTNER · PLAY SOLO · HOME.
//  · Tin nhắn sau trận đi qua kênh act sẵn có (k: 're' mời đấu lại, 'reNo' huỷ, 'sanh' về sảnh, 'bye' rời) — không đổi luật database.
//  · Phòng KHÔNG còn bị chủ phòng xoá 5 s sau trận (để đấu lại / về sảnh); ai bấm HOME / FIND / SOLO thì rời phòng như cũ.
// Hình: chỉ ảnh có sẵn (vong_xich cho màn trung tính, khung nút sẵn có) — QUY-TAC-HINH.md.
'use strict';

const KQO = {
  ctx: null,   // trận online đang/vừa chơi: { che, code, host, me, ban, tenBan, k0, roi: {wave, vinh} | null, phongMat }
  ket: null,   // ảnh chụp lúc hết trận: { t, k, wave, tim, thang, ly, loai: 'thang'|'thua'|'trung', vi: 'roi'|'mang'|'' }
  sau: null,   // sau trận: { toiRe, banRe, banO: 'kq'|'sanh'|'roi', off: [] }
  _trongONS: false,

  ten() { return (this.ctx && escTen(this.ctx.tenBan)) || 'Your partner'; },
  laPvp() { return !!(this.ctx && this.ctx.che === 'pvp'); },
  // bạn còn ở đó để đấu lại?
  banCon() {
    const c = this.ctx, s = this.sau; if (!c || !s) return false;
    if (c.phongMat || (c.roi && c.roi.vinh) || s.banO === 'roi') return false;
    if (typeof ONL === 'undefined' || ONL.code !== c.code || !ONL.meta) return false;
    const p = ONL.pl && ONL.pl[c.ban];
    return !!(p && p.on !== false);
  },

  // ---------------------------------------------------------------- hết trận: phân loại
  chup(thang, ly) {
    const c = this.ctx; if (!c) return;
    const B = G.ban[0], tim = B ? Math.max(0, B.tim | 0) : 0;
    const vi = (c.roi || c.phongMat) ? 'roi' : (typeof NET !== 'undefined' && !NET.noi) ? 'mang' : '';
    let loai = thang ? 'thang' : 'thua';
    if (!thang && this.laPvp() && vi === 'roi') loai = 'thang'; // PVP: đối thủ bỏ trận = xử thắng
    else if (!thang && tim > 0) loai = 'trung';                // còn tim mà trận dừng = không phải thua
    let k = null; try { k = NET.khoa(); } catch (e) { }
    this.ket = { t: Date.now(), k, wave: Math.max(1, G.wave), tim, thang, ly, loai, vi };
    if (loai !== (thang ? 'thang' : 'thua')) { G.ketThuc.thang = loai === 'thang'; G.ketThuc.onl = loai; }
  },

  // ---------------------------------------------------------------- vẽ màn kết quả (chạy SAU ketqua.js)
  ve(k) {
    const kq = document.getElementById('ketqua'); if (!kq) return;
    const bang = kq.querySelector('.bang'), nut = bang && bang.querySelector('.bang-nut'); if (!nut) return;
    const ket = this.ket, cu = nut.querySelectorAll('[data-act="choilai"], [data-act="hd-choi"], [data-act="doibo"]');
    if (!ket || !this.ctx) { // trận offline: trả lại nút cũ
      kq.classList.remove('kqo', 'trung');
      for (const b of cu) b.hidden = false;
      const r = nut.querySelector('.kqo-nut'); if (r) r.remove();
      const t = bang.querySelector('#kqo-tt'); if (t) t.remove();
      const ic = bang.querySelector('.kq-ic'); if (ic && ic.dataset.goc) { ic.src = ic.dataset.goc; delete ic.dataset.goc; }
      return;
    }
    kq.classList.add('kqo');
    kq.classList.toggle('trung', ket.loai === 'trung');
    kq.classList.toggle('thang', ket.loai === 'thang'); kq.classList.toggle('thua', ket.loai === 'thua');
    const ic = bang.querySelector('.kq-ic');
    if (ic) { if (!ic.dataset.goc) ic.dataset.goc = ic.getAttribute('src'); ic.src = ket.loai === 'trung' ? 'assets/vong_xich.webp?v=9254774a' : ic.dataset.goc; }
    const ten = document.getElementById('kq-ten'), phu = document.getElementById('kq-phu');
    const so = document.querySelector('#kq-so b');
    const wRoi = this.ctx.roi ? Math.max(1, this.ctx.roi.wave) : ket.wave, ban = this.ten();
    let viec = '', chu = '';
    if (ket.loai === 'trung') {
      ten.textContent = 'MATCH ENDED';
      chu = ket.vi === 'mang' ? 'Connection lost' : ket.vi === 'roi' ? (this.laPvp() ? 'Opponent left' : 'Partner left') : 'Match stopped early';
      viec = ket.vi === 'mang' ? 'You lost connection at wave ' + ket.wave + '. Your wave and best record are saved.'
        : ket.vi === 'roi' ? ban + ' left at wave ' + wRoi + '. Your wave and best record are saved.'
          : 'The online match stopped at wave ' + ket.wave + ' with lives left. Your wave and best record are saved.';
    } else if (ket.loai === 'thang' && this.laPvp() && ket.vi === 'roi') {
      ten.textContent = TEXT.ui.victory; chu = 'Opponent left — you win by forfeit';
      viec = ban + ' left at wave ' + wRoi + ' — you win by forfeit.';
    } else if (this.ctx.roi || this.ctx.phongMat) {
      viec = (this.laPvp() ? ban + ' left' : ban + ' left at wave ' + wRoi + ' — AI took over') ;
    }
    if (chu && phu) phu.textContent = chu;
    // "Fell at" chỉ cho thua thật
    if (so && ket.loai !== 'thua' && so.previousSibling && so.previousSibling.nodeType === 3) so.previousSibling.textContent = 'Reached ';
    // một dòng "chuyện gì xảy ra" khi có người rời (không mẹo huấn luyện — màn kết quả gọn, 06/11)
    let meo = bang.querySelector('#kq-chi .kq-meo');
    if (viec) {
      if (!meo) { meo = document.createElement('div'); meo.className = 'kq-meo'; const chi = bang.querySelector('#kq-chi'), hang = chi && chi.querySelector('.kq-hang'); if (chi) chi.insertBefore(meo, hang ? hang.nextSibling : chi.firstChild); }
      meo.innerHTML = '<small>WHAT HAPPENED</small><span class="kqo-viec"></span>';
      meo.querySelector('.kqo-viec').textContent = viec;
    } else if (meo) meo.remove();
    for (const b of cu) b.hidden = true;
    this.batSau();
    this.veNut();
  },

  // nút + dòng trạng thái (vẽ lại mỗi khi bạn đổi trạng thái)
  veNut() {
    const kq = document.getElementById('ketqua'); if (!kq || kq.hidden || !this.ket) return;
    const bang = kq.querySelector('.bang'), nut = bang.querySelector('.bang-nut');
    let row = nut.querySelector('.kqo-nut');
    if (!row) { row = document.createElement('div'); row.className = 'kqo-nut'; nut.appendChild(row); }
    let tt = bang.querySelector('#kqo-tt');
    if (!tt) { tt = document.createElement('div'); tt.id = 'kqo-tt'; nut.parentNode.insertBefore(tt, nut); }
    const s = this.sau || {}, ban = this.ten(), con = this.banCon();
    const b = (act, chu, chinh) => '<button class="nut' + (chinh ? ' chinh' : '') + '" data-act="' + act + '">' + chu + '</button>';
    let h, t = '';
    if (con && s.banO !== 'sanh') {
      const re = s.toiRe ? b('kqo-re', 'WAITING FOR ' + ban.toUpperCase() + '…', true) : b('kqo-re', s.banRe ? 'ACCEPT REMATCH' : 'REMATCH', true);
      h = re + b('kqo-sanh', 'BACK TO LOBBY') + b('kqo-nha', 'HOME');
      t = s.toiRe ? 'Rematch request sent — tap again to cancel' : s.banRe ? ban + ' wants a rematch' : 'Same room, same decks · change your deck in the lobby';
    } else if (con) {
      h = b('kqo-sanh', 'BACK TO LOBBY', true) + b('kqo-nha', 'HOME');
      t = ban + ' is waiting in the lobby';
    } else {
      h = b('kqo-moi', 'FIND NEW PARTNER', true) + b('kqo-solo', 'PLAY SOLO') + b('kqo-nha', 'HOME');
      t = (this.laPvp() ? 'Your opponent' : ban) + ' left the room';
    }
    if (row._h !== h) { row.innerHTML = h; row._h = h; } // .bang-nut xếp ngược (column-reverse) → nút chính ở trên cùng
    row.querySelector('[data-act="kqo-re"]') && row.querySelector('[data-act="kqo-re"]').classList.toggle('cho', !!s.toiRe);
    tt.textContent = t;
  },

  // ---------------------------------------------------------------- sau trận: nghe bạn kia (act / meta / pl)
  goc() { return 'rooms/' + this.ctx.code + '/'; },
  batSau() {
    if (this.sau) return;
    this.sau = { toiRe: false, banRe: false, banO: 'kq', off: [] };
    const c = this.ctx;
    try { localStorage.removeItem('tm_phong'); } catch (e) { } // trận đã xong: không hiện REJOIN MATCH cho trận này
    if (typeof ONL === 'undefined' || ONL.code !== c.code || c.phongMat || typeof NET === 'undefined' || !NET.ok) { this.sau.banO = 'roi'; return; }
    ONL.ghiToi({ ready: false }).catch(() => { }); // bỏ READY cũ: sảnh không tự bắt đầu khi một người còn ở màn kết quả
    const goc = this.goc();
    this.sau.off.push(NET.nghe(goc + 'act', 'child_added', (v) => this.nhan(v), { sau: this.ket.k || null }));
    this.sau.off.push(NET.nghe(goc + 'meta', 'value', (v) => this.khiMeta(v)));
    this.sau.off.push(NET.nghe(goc + 'pl', 'value', () => this.veNut()));
  },
  donSau() { const s = this.sau; this.sau = null; if (s) for (const f of s.off) try { f(); } catch (e) { } },
  nhan(v) {
    const s = this.sau; if (!s || !v || v.u === this.ctx.me) return;
    if (v.k === 're') s.banRe = true;
    else if (v.k === 'reNo') s.banRe = false;
    else if (v.k === 'sanh') { s.banO = 'sanh'; s.banRe = false; s.toiRe = false; }
    else if (v.k === 'bye') { s.banO = 'roi'; s.banRe = false; s.toiRe = false; }
    else return;
    this.thuBat(); this.veNut();
  },
  khiMeta(v) {
    const s = this.sau; if (!s) return;
    if (!v) { s.banO = 'roi'; s.toiRe = false; s.banRe = false; this.veNut(); return; } // phòng đã đóng
    if (v.st === 'tran' && v.k0 && v.k0 !== this.ctx.k0) { // chủ phòng bắt đầu trận đấu lại
      if (s.toiRe) { this.batDauLai(v); return; }
    }
    if (v.st === 'cho' && s.banO === 'kq') { s.banO = 'sanh'; s.banRe = false; s.toiRe = false; } // chủ phòng đã về sảnh
    this.veNut();
  },
  guiSau(k) {
    if (!this.ctx || typeof NET === 'undefined' || !NET.ok) return Promise.resolve();
    return NET.set(this.goc() + 'act/' + NET.khoa(), { u: this.ctx.me, k, tk: 0 }).catch((e) => console.warn('[KQO] gửi', k, e && (e.code || e.message)));
  },
  // cả 2 đồng ý → chủ phòng dọn dữ liệu trận cũ + ghi st = 'tran' với k0 / hạt giống mới → cả 2 vào trận
  thuBat() {
    const s = this.sau; if (!s || !s.toiRe || !s.banRe || !this.ctx.host || s.dangBat) return;
    const cho = Math.max(0, 1800 - (Date.now() - this.ket.t)); // để dongbo.js dọn trận cũ xong (ketThucMang sau 1,5 s)
    s.dangBat = true;
    setTimeout(() => {
      if (this.sau !== s) return;
      NET.update('rooms/' + this.ctx.code, { act: null, snap: null, state: null, ping: null,
        'meta/st': 'tran', 'meta/k0': NET.khoa(), 'meta/seed': 1 + Math.floor(Math.random() * 1e9), 'meta/at': NET.TS })
        .catch((e) => { s.dangBat = false; console.warn('[KQO] đấu lại', e && (e.code || e.message)); });
    }, cho);
  },
  batDauLai(meta) {
    this.donSau();
    if (typeof ONS !== 'undefined' && ONS.on) ONS.ketThucMang('end');
    ONL.meta = meta; ONL.dangTran = false; ONL._sauTran = false; ONL.vuaChoi = false; ONL.luuPhong();
    const kq = document.getElementById('ketqua'); if (kq) kq.hidden = true;
    ONL.vaoTran(false);
  },

  // ---------------------------------------------------------------- bấm nút
  veMenu() {
    if (typeof ONS !== 'undefined' && ONS.on) ONS.ketThucMang('end');
    G.ban = []; G.quai = []; G.dung = false; SND.nhac(0);
    for (const id of ['ketqua', 'top', 'duoi', 'dung']) { const x = document.getElementById(id); if (x) x.hidden = true; }
    document.getElementById('chon').hidden = false; UI.veChon();
  },
  roi() { // rời phòng hẳn
    this.donSau();
    if (typeof ONL !== 'undefined' && ONL.code) { ONL.dangTran = false; ONL.roiPhong(); }
    this.ctx = null; this.ket = null;
  },
  bam(a) {
    const s = this.sau;
    switch (a) {
      case 'kqo-re':
        if (!s || !this.banCon()) { this.veNut(); return; }
        s.toiRe = !s.toiRe; this.guiSau(s.toiRe ? 're' : 'reNo').then(() => this.thuBat()); this.veNut(); return;
      case 'kqo-sanh': {
        const c = this.ctx; this.guiSau('sanh'); this.donSau();
        this.veMenu();
        if (typeof ONL !== 'undefined' && ONL.code === c.code && ONL.veSanhSauTran()) { this.ctx = null; this.ket = null; return; }
        this.ctx = null; this.ket = null; if (typeof ONL !== 'undefined') ONL.moBang(); return;
      }
      case 'kqo-moi': this.guiSau('bye'); this.roi(); this.veMenu(); if (typeof ONL !== 'undefined') ONL.moBang(); return;
      case 'kqo-solo': {
        const m = (typeof KQ !== 'undefined' && KQ.m) || {}, deck = (m.deck && m.deck.length === 5 ? m.deck : UI.chon).slice(), mv = m.mv || UI.mv;
        this.guiSau('bye'); this.roi(); this.veMenu();
        UI.chon = deck; UI.mv = mv; UI.che = 'solo'; batDau('solo', deck, mv); return;
      }
      case 'kqo-nha': this.guiSau('bye'); this.roi(); this.veMenu(); return;
    }
  },

  // ---------------------------------------------------------------- bọc
  boc() {
    const self = this;
    // vào trận online: nhớ ngữ cảnh. Trận offline mới: xoá ngữ cảnh online cũ
    const onsBat = ONS.batDau;
    ONS.batDau = function (o) {
      self.donSau(); self.ket = null;
      self.ctx = { che: o.che || 'coop', code: o.code, host: o.host, me: o.me, ban: o.ban, tenBan: o.tenBan, k0: o.k0, roi: null, phongMat: false };
      self._trongONS = true;
      try { return onsBat.apply(this, arguments); } finally { self._trongONS = false; }
    };
    const bd = window.batDau;
    window.batDau = function () {
      if (!self._trongONS) { self.donSau(); self.ctx = null; self.ket = null; }
      return bd.apply(this, arguments);
    };
    // bạn rời / im lặng → AI lái (dongbo.js): nhớ wave lúc bạn đi; bạn quay lại → xoá
    if (ONS.thayAI) { const g = ONS.thayAI; ONS.thayAI = function () { const r = g.apply(this, arguments); if (self.ctx && ONS.thay) self.ctx.roi = { wave: G.wave, vinh: !!ONS.thay.vinh }; return r; }; }
    if (ONS.traBan) { const g = ONS.traBan; ONS.traBan = function () { const r = g.apply(this, arguments); if (self.ctx && !ONS.thay) self.ctx.roi = null; return r; }; }
    if (ONS.diNgoai) { const g = ONS.diNgoai; ONS.diNgoai = function () { if (self.ctx) self.ctx.phongMat = true; return g.apply(this, arguments); }; }
    // hết trận: phân loại (bọc NGOÀI cùng — sau dongbo.js)
    const kt = window.ketThuc;
    window.ketThuc = function (thang, ly) {
      const da = !!G.ketThuc, r = kt.apply(this, arguments);
      if (!da && G.ketThuc && self.ctx) try { self.chup(thang, ly); } catch (e) { console.error('[KQO] chup', e); }
      return r;
    };
    // phòng giữ lại sau trận (đấu lại / về sảnh) — chỉ đánh dấu vừa chơi
    ONL.xoaSauTran = function () { if (this.code) this.vuaChoi = true; };
    const kq = UI.ketQua;
    UI.ketQua = function (k) { const r = kq.apply(this, arguments); try { self.ve(k); } catch (e) { console.error('[KQO] ve', e); } return r; };
    window.addEventListener('click', (e) => {
      const el = e.target.closest && e.target.closest('#ketqua [data-act^="kqo-"]'); if (!el) return;
      e.stopImmediatePropagation(); try { SND.nut(); } catch (er) { }
      try { self.bam(el.dataset.act); } catch (er) { console.error('[KQO] bấm', er); }
    }, true);
  },
};

(function () {
  const chay = () => { try { if (typeof ONS !== 'undefined' && typeof ONL !== 'undefined') KQO.boc(); } catch (e) { console.error('[KQO] boc', e); } };
  // khoidong.js bọc ở DOMContentLoaded → mình đăng ký sau nên chạy sau (bọc ngoài cùng)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', chay, { once: true }); else setTimeout(chay, 0);
})();
