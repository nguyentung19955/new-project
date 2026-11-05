// TURRET MERGE — PHÒNG CO-OP ONLINE (2 người): Create room → mã 4 chữ + link chia sẻ, Join bằng mã; sảnh chờ hiện bộ bài +
// chỉ huy + READY của cả 2; cả 2 READY → chủ phòng bấm giờ → cả 2 vào CÙNG một trận có hạt giống (dongbo.js lo phần trong trận).
// Phòng cũ hơn 2 giờ (meta.at) = bỏ qua. Hết trận: chủ phòng XOÁ phòng.
// Dữ liệu:  turretmerge/rooms/{CODE}/ meta{host,at,st,seed,k0} · members/{uid}=true · khach (uid khách) · pl/{uid} · act · snap · ping · state
// Hình: chỉ ảnh có sẵn (khung_bang, khung_tt, h2_lcd, nut_lon_*, the_khung_*, af_*, pilot_*, led_xanh, h2_tam_xanh) — QUY-TAC-HINH.md.
'use strict';

const ONL = {
  CHU: 'ABCDEFGHJKLMNPQRSTUVWXYZ', // không I / O (dễ nhầm với 1 / 0)
  HET_HAN: 2 * 3600e3, // phòng bỏ dở quá 2 giờ: coi như không còn
  code: null, host: false, meta: null, khach: null, pl: {}, state: null, _off: [], dangTran: false,
  me() { return NET.user && NET.user.uid; },
  ban() { const me = this.me(); if (!this.meta) return null; return this.host ? this.khach : this.meta.host; },
  luuPhong() { try { if (this.code) localStorage.setItem('tm_phong', JSON.stringify({ code: this.code, at: Date.now() })); else localStorage.removeItem('tm_phong'); } catch (e) { } },
  phongCu() { try { const v = JSON.parse(localStorage.getItem('tm_phong') || 'null'); return v && Date.now() - v.at < this.HET_HAN ? v : null; } catch (e) { return null; } },

  init() {
    // nút ONLINE ở hàng chế độ (cạnh CO-OP / SOLO / PVP)
    const che = document.querySelector('#chon .chon-che');
    if (che && !document.getElementById('onl-nut')) {
      const b = document.createElement('button'); b.className = 'che onl-che'; b.id = 'onl-nut'; b.dataset.act = 'onl-mo';
      b.innerHTML = '<b>ONLINE</b><span>Co-op with a friend</span>';
      che.insertBefore(b, che.firstChild.nextSibling);
    }
    // mạng chập chờn rồi nối lại: máy chủ đã chạy onDisconnect (on = false) → ghi lại on = true + đăng ký lại
    NET.khiNoi((v) => { if (v && this.code && NET.ok) { this.ghiToi({}).catch(() => { }); NET.khiNgat('rooms/' + this.code + '/pl/' + this.me() + '/on', false); } });
    // link mời (?room=ABCD · ?phong=ABCD · #room=ABCD): bỏ qua hướng dẫn/SOLO (huongdan.js), màn tải → vào phòng → thẳng SẢNH
    // đổi bộ bài từ sảnh: rời màn bộ bài (‹) = về lại sảnh
    if (typeof HM !== 'undefined' && HM.di && !HM._onlBoc) {
      const g = HM.di; HM._onlBoc = true;
      HM.di = function (xem) { const r = g.apply(this, arguments); if (xem !== 'dk' && ONL._doiBo) ONL.xongDoiBo(); return r; };
    }
    const moi = this.maMoi();
    if (moi) this.vaoTuMoi(moi);
  },
  maMoi() {
    const q = new URLSearchParams(location.search), h = new URLSearchParams(String(location.hash || '').replace(/^#/, ''));
    const c = q.get('room') || q.get('phong') || h.get('room') || h.get('phong') || '';
    return /^[A-Za-z]{4}$/.test(c) ? c.toUpperCase() : null;
  },
  boMaKhoiURL() { // vào xong: bỏ mã khỏi địa chỉ (tải lại trang không vào phòng lần 2; vào lại trận vẫn qua tm_phong)
    try {
      const u = new URL(location.href); u.searchParams.delete('room'); u.searchParams.delete('phong');
      if (/(^#|&)(room|phong)=/.test(u.hash)) u.hash = '';
      history.replaceState(history.state, '', u.pathname + u.search + u.hash);
    } catch (e) { }
  },
  vaoTuMoi(c) {
    this._moi = c;
    const tai = typeof TAI !== 'undefined' && TAI.bootP ? TAI.bootP : Promise.resolve();
    tai.then(() => {
      if (typeof TAI !== 'undefined' && TAI.hien) { TAI.hien('JOINING ROOM ' + c); TAI.tienDo(1, 1); const s = TAI.el && TAI.el.querySelector('.tai-so'); if (s) s.textContent = ''; }
      if (UI.chon.length !== 5) { UI.chon = deckNgauNhien(); if (UI.veBoChon) UI.veBoChon(); } // người mới: bộ ngẫu nhiên, đổi được ở sảnh (DECK)
      this.vaoPhong(c, true);
    });
  },
  // vào từ link mời hỏng (đầy / hết / không có): báo rõ + CREATE A NEW ROOM / HOME
  loiMoi(s) {
    if (typeof TAI !== 'undefined' && TAI.an) TAI.an();
    this._moi = null; this.boMaKhoiURL();
    this.moBang(); const b = document.querySelector('#onl-bang .onl-bang'); if (b) b.classList.add('moi-loi');
    this.baoLoi(s); NET.san().then(() => this.baoLoi(s)); // moBang tự xoá dòng báo khi mạng sẵn — ghi lại sau
  },
  doiHoSo() { if (this.code && NET.ok) this.ghiToi({}); },

  // ---------- bảng ONLINE (tạo / vào phòng) ----------
  moBang(maSan) {
    let el = document.getElementById('onl-bang');
    if (!el) {
      el = document.createElement('div'); el.id = 'onl-bang'; el.className = 'man phu onl-man';
      el.innerHTML = '<div class="bang onl-bang">' +
        '<div class="bang-ten">ONLINE CO-OP</div>' +
        '<div class="onl-phu">Play together with a friend: same waves, 3 shared lives, each of you builds your own board.</div>' +
        '<div class="bang-nut">' +
        '<button class="nut chinh" data-act="onl-tao"><span class="onl-tao1">CREATE ROOM</span><span class="onl-tao2">CREATE A NEW ROOM</span></button>' +
        '<div class="onl-nho">OR ENTER A ROOM CODE</div>' +
        '<div class="onl-hang"><input id="onl-ma" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABCD"><button class="nut" data-act="onl-vao">JOIN</button></div>' +
        '<button class="nut" data-act="onl-lai" id="onl-lai" hidden>REJOIN MATCH</button>' +
        '<div class="onl-loi" id="onl-loi"></div>' +
        '<button class="nut" data-act="onl-dong"><span class="onl-tao1">BACK</span><span class="onl-tao2">HOME</span></button></div></div>';
      document.getElementById('wrap').appendChild(el);
      el.querySelector('#onl-ma').addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, ''); });
    }
    el.hidden = false;
    el.querySelector('.onl-bang').classList.remove('moi-loi');
    if (maSan) el.querySelector('#onl-ma').value = maSan;
    this.baoLoi(NET.ok ? '' : 'Connecting…');
    NET.san().then((ok) => {
      this.baoLoi(ok ? '' : 'Online unavailable (' + NET.loi + '). Offline modes still work.');
      const cu = this.phongCu();
      if (ok && cu && !this.code) NET.get('rooms/' + cu.code + '/meta').then((m) => {
        el.querySelector('#onl-lai').hidden = !(m && m.st === 'tran' && NET.gio() - (m.at || 0) < this.HET_HAN);
        el.querySelector('#onl-lai').dataset.code = cu.code;
      }).catch(() => { });
    });
  },
  dongBang() { const el = document.getElementById('onl-bang'); if (el) el.hidden = true; },
  baoLoi(s) { for (const id of ['onl-loi', 'sanh-loi']) { const e = document.getElementById(id); if (e) e.textContent = s || ''; } },
  canBo() {
    if (UI.chon.length !== 5) { this.baoLoi('Pick 5 turrets first (tap BACK, then choose your deck).'); return false; }
    return true;
  },
  toi() { // dữ liệu người chơi của mình trong phòng (vào lại trận đang chạy: GIỮ bộ bài + chỉ huy đã ghi, không ghi đè)
    const v = { name: TK.ho.name, av: TK.ho.av, on: true };
    if (!this._laiVao && UI.chon.length === 5) { v.deck = UI.chon.join(','); v.mv = UI.mv; }
    return v;
  },
  ghiToi(them) { return NET.update('rooms/' + this.code + '/pl/' + this.me(), Object.assign(this.toi(), them || {})); },

  taoPhong() {
    if (!this.canBo()) return;
    this._laiVao = false;
    NET.san().then((ok) => {
      if (!ok) return this.baoLoi('Online unavailable (' + NET.loi + ').');
      const thu = (lan, ma) => {
        if (lan > 12) return Promise.reject(new Error('No free room code, try again'));
        let c = ma || ''; if (!c) for (let i = 0; i < 4; i++) c += this.CHU[Math.floor(Math.random() * this.CHU.length)];
        return NET.get('rooms/' + c + '/meta').then((m) => {
          if (m) return thu(lan + 1); // mã đang dùng (kể cả phòng cũ của người khác — luật không cho ghi đè) → mã khác
          const me = this.me();
          // ghi bị từ chối (mã vừa bị người khác lấy / còn dữ liệu cũ không có meta) → thử mã khác
          return NET.set('rooms/' + c, { meta: { host: me, at: NET.TS, st: 'cho', seed: 1 + Math.floor(Math.random() * 1e9), v: 1 }, members: { [me]: true } })
            .then(() => c, () => thu(lan + 1));
        });
      };
      this.baoLoi('Creating room…');
      thu(0).then((c) => { this.host = true; this.batDauSanh(c); }).catch((e) => this.baoLoi('Could not create room: ' + (e.code || e.message)));
    });
  },
  vaoPhong(c, tuMoi) {
    this._laiVao = false;
    c = String(c || '').toUpperCase();
    const loi = (s) => tuMoi ? this.loiMoi(s) : this.baoLoi(s);
    if (!/^[A-Z]{4}$/.test(c)) return loi('Room code = 4 letters.');
    if (!this.canBo()) return tuMoi && this.loiMoi('Pick 5 turrets first.');
    NET.san().then((ok) => {
      if (!ok) return loi('Online unavailable (' + NET.loi + ').');
      this.baoLoi('Joining ' + c + '…');
      NET.get('rooms/' + c + '/meta').then((m) => {
        if (!m || NET.gio() - (m.at || 0) > this.HET_HAN) throw new Error('Room ' + c + ' was not found or has ended.'); // phòng > 2 giờ: bỏ qua
        const me = this.me();
        this._laiVao = m.st === 'tran'; // đã ở trong phòng mà trận đang chạy (mở lại link / rớt mạng) → vào lại trận, giữ bộ bài đã ghi
        if (m.host === me) { this.host = true; return; }
        this.host = false;
        // phòng đã có khách khác → đầy (luật database cũng chặn; kiểm trước để báo rõ)
        return NET.get('rooms/' + c + '/khach').catch(() => null).then((k) => {
          if (k && k !== me) throw new Error('Room ' + c + ' is full.');
          if (!k && m.st === 'tran') throw new Error('Room ' + c + ' has already started.');
          // một lần ghi (nguyên khối): ô khách + danh sách thành viên members/{uid} (luật database kiểm thành viên qua members)
          return NET.update('rooms/' + c, { khach: me, ['members/' + me]: true }).catch(() => { throw new Error('Room ' + c + ' is full.'); });
        });
      }).then(() => {
        this.batDauSanh(c);
        if (tuMoi) { this._moi = null; this.boMaKhoiURL(); if (typeof TAI !== 'undefined' && TAI.an) TAI.an(); }
      }).catch((e) => { this._laiVao = false; loi(e.message || e.code); });
    });
  },

  // ---------- sảnh chờ ----------
  batDauSanh(c) {
    this.thoiNghe(); this.vuaChoi = false; this._khachCo = false; this.khach = null; this.pl = {}; this.meta = null;
    this.code = c; this.luuPhong(); this._thayCho = false; this._daCoMeta = false; this.dangTran = false; this._sauTran = false;
    const goc = 'rooms/' + c + '/', me = this.me();
    this.ghiToi({ ready: false });
    NET.khiNgat(goc + 'pl/' + me + '/on', false);
    this._off.push(NET.nghe(goc + 'meta', 'value', (v) => { this.meta = v; this.capNhatSanh(); }));
    this._off.push(NET.nghe(goc + 'khach', 'value', (v) => { this.khach = v; this.capNhatSanh(); }));
    this._off.push(NET.nghe(goc + 'pl', 'value', (v) => { this.pl = v || {}; this.capNhatSanh(); }));
    this._off.push(NET.nghe(goc + 'state', 'value', (v) => { this.state = v; if (typeof ONS !== 'undefined') ONS.khiState(v); }));
    this.dongBang(); this.veSanh();
  },
  thoiNghe() { for (const f of this._off.splice(0)) try { f(); } catch (e) { } },
  roiPhong() {
    const c = this.code, me = this.me();
    if (typeof ONS !== 'undefined' && ONS.on) ONS.ketThucMang('leave');
    this.thoiNghe();
    if (c) {
      NET.huyKhiNgat('rooms/' + c + '/pl/' + me + '/on');
      if (this.host) NET.remove('rooms/' + c).catch(() => { });
      else NET.update('rooms/' + c, { ['pl/' + me]: null, khach: null, ['members/' + me]: null }).catch(() => { }); // một lần ghi, lúc còn là thành viên
    }
    this.code = null; this.meta = null; this.khach = null; this.pl = {}; this.state = null; this.luuPhong();
    const s = document.getElementById('onl-sanh'); if (s) s.hidden = true;
  },
  // SẢNH đứng riêng (TU-VAN-HUD-MUOT §3F): ‹ thoát (chạm 2 lần) · CO-OP LOBBY · tấm mã phòng (mã to + COPY + SHARE) ·
  //  2 hàng người chơi (chân dung · tên · READY/NOT READY · 5 ụ nhỏ) · 1 dòng luật · nút READY to dính đáy.
  veSanh() {
    let el = document.getElementById('onl-sanh');
    if (!el) {
      el = document.createElement('div'); el.id = 'onl-sanh'; el.className = 'man onl-man sanh7';
      el.innerHTML = '<div class="s7-nen" aria-hidden="true"></div>' +
        '<div class="s7-dau"><button class="s7-lui" data-act="onl-roi" aria-label="Leave room"><img src="assets/ic_lui.png" alt=""></button><b>CO-OP LOBBY</b><i></i></div>' +
        '<section class="s7-moi"><small>ROOM CODE</small><div class="sanh-ma" id="sanh-ma" data-act="onl-copy" role="button" aria-label="Copy room code"></div>' +
        '<div class="s7-nut2"><button class="nut" data-act="onl-copy" id="sanh-copy">COPY CODE</button><button class="nut" data-act="onl-chiase">SHARE LINK</button></div>' +
        '<span class="s7-ok" id="sanh-ok"><img src="assets/chon_huy.png" alt=""><b>COPIED</b></span></section>' +
        '<div class="sanh-ds" id="sanh-ds"></div>' +
        '<div class="s7-luat">CO-OP • 2 PLAYERS • 3 SHARED LIVES</div>' +
        '<div class="sanh-ping" id="sanh-ping"></div>' +
        '<div class="onl-loi" id="sanh-loi"></div>' +
        '<div class="s7-cuoi"><small id="sanh-goi"></small><div class="s7-hang"><button class="nut" data-act="onl-bo" id="sanh-bo">DECK</button><button class="nut chinh" data-act="onl-san" id="sanh-san">READY</button></div></div>';
      document.getElementById('wrap').appendChild(el);
    }
    const moi = el.hidden;
    el.hidden = false;
    if (moi && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) { el.classList.remove('vao'); void el.offsetWidth; el.classList.add('vao'); }
    this._roiCho = 0;
    this.capNhatSanh();
  },
  theNguoi(p, laToi) {
    if (!p) return '<div class="sanh-p trong"><span class="s7-av ghost"><img src="assets/ic_coop.png" alt=""></span><div class="s7-ten"><b>Waiting for teammate<span class="s7-cham"><i>.</i><i>.</i><i>.</i></span></b><small>Send them the code or link</small></div></div>';
    const deck = String(p.deck || '').split(',').filter(id => G.rosterMap[id]);
    const mv = MAVUONG[p.mv] ? p.mv : 'hero';
    return '<div class="sanh-p' + (p.ready ? ' san' : '') + (p.on === false ? ' mat' : '') + '" data-u="' + (laToi ? 'me' : 'ban') + '">' +
      '<span class="s7-av"><img class="sp-av" src="' + TK.avURL(p.av) + '" alt=""></span>' +
      '<div class="s7-ten"><b>' + escTen(p.name) + (laToi ? ' <em>YOU</em>' : '') + '</b>' +
      '<span class="s7-bo">' + (typeof OT !== 'undefined' ? OT.hang(deck, MAVUONG[mv] ? mv : null) : deck.map(id => '<img src="' + iconOf(id) + '" alt="">').join('') + '<img class="mv" src="' + mvIcURL(mv) + '" alt="">') + '</span></div>' +
      '<span class="s7-tt"><i class="sp-led' + (p.on === false ? ' tat' : '') + '"></i><span class="sp-san">' + (p.on === false ? 'OFFLINE' : p.ready ? 'READY' : 'NOT READY') + '</span>' +
      (p.ready ? '<img class="s7-huy" src="assets/chon_huy.png" alt="">' : '') + '</span></div>';
  },
  // COPY: chỉ chép mã 4 chữ; báo "COPIED" 1,2 s
  chepMa() {
    const c = this.code; if (!c) return;
    const ok = () => { const e = document.getElementById('sanh-ok'); if (!e) return; e.classList.remove('hien'); void e.offsetWidth; e.classList.add('hien'); clearTimeout(this._ok); this._ok = setTimeout(() => e.classList.remove('hien'), 1200); };
    try { if (navigator.clipboard) navigator.clipboard.writeText(c).then(ok, () => this.baoLoi('Room code: ' + c)); else this.baoLoi('Room code: ' + c); } catch (e) { this.baoLoi('Room code: ' + c); }
  },
  // thoát sảnh: chạm 2 lần trong 2,5 s (tránh bấm nhầm rời phòng)
  roiHoi() {
    const t = performance.now();
    if (this._roiCho && t - this._roiCho < 2500) { this._roiCho = 0; this.roiPhong(); return; }
    this._roiCho = t; this.baoLoi('Tap ‹ again to leave the room.');
    clearTimeout(this._roiH); this._roiH = setTimeout(() => { if (this._roiCho) { this._roiCho = 0; this.baoLoi(''); } }, 2500);
  },
  capNhatSanh() {
    const el = document.getElementById('onl-sanh'); if (!el || el.hidden && !this.code) return;
    if (this.code && this.meta === null && this._daCoMeta) {
      if (this.vuaChoi || (typeof G !== 'undefined' && G.ketThuc)) { this.roiPhong(); return; } // hết trận: chủ phòng đã dọn phòng — im lặng
      // đang giữa trận mà chủ phòng rời (phòng bị xoá): KHÔNG chặn — bàn chủ phòng giao cho AI, mình chơi tiếp ngoại tuyến
      if (typeof ONS !== 'undefined' && ONS.on && typeof G !== 'undefined' && G.ban.length && !G.ketThuc) { ONS.diNgoai(); this.roiPhong(); this.dangTran = false; return; }
      this.baoLoi('The host closed the room.'); this.roiPhong(); this.hienBangSauRoi('The host closed the room.'); return;
    }
    if (this.meta) this._daCoMeta = true;
    if (this.meta && this.meta.st === 'cho') { this._thayCho = true; this._sauTran = false; }
    const me = this.me(), banId = this.ban();
    el.querySelector('#sanh-ma').textContent = this.code || '';
    const toi = this.pl[me], ban = banId ? this.pl[banId] : null;
    const ds = el.querySelector('#sanh-ds'), hNew = this.theNguoi(toi, true) + this.theNguoi(ban, false);
    if (ds._h !== hNew) { // chỉ vẽ lại khi đổi; người mới vào = hiện dần 240 ms
      const coBan = !!ds.querySelector('[data-u="ban"]');
      ds.innerHTML = hNew; ds._h = hNew;
      if (ban && !coBan) { const r = ds.querySelector('[data-u="ban"]'); if (r) r.classList.add('vao'); }
    }
    const nut = el.querySelector('#sanh-san');
    nut.textContent = toi && toi.ready ? 'CANCEL READY' : 'READY';
    nut.classList.toggle('chinh', !(toi && toi.ready));
    const bo = el.querySelector('#sanh-bo'); if (bo) bo.hidden = !!(toi && toi.ready); // đổi bộ bài: chỉ khi chưa READY
    const goi = el.querySelector('#sanh-goi');
    if (goi) goi.textContent = toi && toi.ready ? (ban && ban.ready ? 'Both ready — launching…' : ban ? 'Waiting for ' + escTen(ban.name) + ' to get ready' : 'Starts when your teammate joins and is ready') : 'Starts when both players are ready';
    el.classList.toggle('ca-hai', !!(toi && ban && toi.ready && ban.ready));
    // khách rời phòng: chủ phòng thấy ô trống lại
    if (this.host && this.khach && !this.pl[this.khach] && this._khachCo) { this.khach = null; }
    if (this.khach && this.pl[this.khach]) this._khachCo = true;
    // cả 2 READY → chủ phòng ghi st = 'tran' (một lần) → cả 2 vào trận
    if (this.meta && this.meta.st === 'cho' && this.host && toi && ban && toi.ready && ban.ready && ban.on !== false && !this._dangBat) {
      this._dangBat = true;
      NET.update('rooms/' + this.code + '/meta', { st: 'tran', k0: NET.khoa(), seed: 1 + Math.floor(Math.random() * 1e9), at: NET.TS })
        .catch((e) => this.baoLoi(e.code || e.message)).then(() => { this._dangBat = false; });
    }
    if (this.meta && this.meta.st === 'tran' && !this.dangTran && !this._sauTran && toi && ban && !el.hidden) this.vaoTran(!this._thayCho); // chưa từng thấy 'cho' = trận đang chạy → vào lại
  },
  vaoTran(laiVao) {
    const me = this.me(), banId = this.ban(), toi = this.pl[me], ban = this.pl[banId];
    if (!toi || !ban) return;
    this.dangTran = true;
    document.getElementById('onl-sanh').hidden = true;
    ONS.batDau({
      code: this.code, host: this.host, seed: this.meta.seed, k0: this.meta.k0, me, ban: banId,
      deckMe: String(toi.deck).split(','), mvMe: toi.mv, deckBan: String(ban.deck).split(','), mvBan: ban.mv, tenBan: ban.name, laiVao: !!laiVao,
    });
  },
  // hết trận / rời trận → về sảnh (PLAY AGAIN) — chủ phòng dọn dữ liệu trận cũ
  veSanhSauTran() {
    this.dangTran = false; this._sauTran = true; this._laiVao = false; // chờ chủ phòng đặt lại st = 'cho' rồi mới tính READY lần mới
    if (!this.code) return false;
    this.ghiToi({ ready: false });
    if (this.host) NET.update('rooms/' + this.code, { act: null, snap: null, state: null, ping: null, 'meta/st': 'cho' }).catch(() => { });
    this.veSanh();
    return true;
  },
  // hết trận: chủ phòng xoá cả phòng (sau vài giây để khách kịp nhận state.end); khách tự rời khi thấy phòng mất
  xoaSauTran() {
    const c = this.code; if (!c) return;
    this.vuaChoi = true;
    if (!this.host) return;
    setTimeout(() => {
      if (this.code !== c) return;
      this.thoiNghe(); NET.huyKhiNgat('rooms/' + c + '/pl/' + this.me() + '/on');
      NET.remove('rooms/' + c).catch((e) => console.warn('[ONL] xoá phòng', e && (e.code || e.message)));
      this.code = null; this.meta = null; this.khach = null; this.pl = {}; this.state = null; this.luuPhong();
    }, 5000);
  },
  hienBangSauRoi(s) { this.moBang(); this.baoLoi(s); },
  // link mời: ?room=ABCD (máy nhận mở → vào thẳng sảnh, xem vaoTuMoi)
  linkMoi() { return location.origin + location.pathname + '?room=' + this.code; },
  chiaSe() {
    const url = this.linkMoi(), text = 'Join my TURRET MERGE co-op room ' + this.code;
    const xong = (s) => this.baoLoi(s);
    if (navigator.share) navigator.share({ title: 'TURRET MERGE co-op', text, url }).catch(() => { });
    else if (navigator.clipboard) navigator.clipboard.writeText(text + ' ' + url).then(() => xong('Invite link copied'), () => xong(url));
    else xong(url);
  },
  // DECK ở sảnh: mở màn bộ bài; nút ‹ của màn bộ bài (hm-ve) đưa về sảnh + ghi bộ mới (khoidong.js gọi xongDoiBo)
  moDoiBo() {
    const el = document.getElementById('onl-sanh'); if (!el || !this.code) return;
    this._doiBo = true; el.hidden = true;
    const c = document.getElementById('chon'); if (c) c.classList.add('onl-doibo'); // ẩn PLAY / PLAY TUTORIAL (đang ở trong phòng)
    if (typeof HM !== 'undefined' && HM.di) HM.di('dk');
  },
  xongDoiBo() {
    if (!this._doiBo) return; this._doiBo = false;
    const c = document.getElementById('chon'); if (c) c.classList.remove('onl-doibo');
    if (!this.code) return;
    if (UI.chon.length === 5) { if (typeof HM !== 'undefined' && HM.luuBo) HM.luuBo(); this.ghiToi({}); }
    this.veSanh();
  },

  bam(a, el) {
    switch (a) {
      case 'onl-mo': SND.nut(); this.moBang(); return true;
      case 'onl-dong': SND.nut(); this.dongBang(); return true;
      case 'onl-tao': SND.nut(); this.taoPhong(); return true;
      case 'onl-vao': SND.nut(); this.vaoPhong(document.getElementById('onl-ma').value); return true;
      case 'onl-lai': {
        SND.nut(); const c = el.dataset.code; if (!c) return true;
        NET.get('rooms/' + c + '/meta').then((m) => {
          if (!m || m.st !== 'tran') return this.baoLoi('That match is over.');
          this.host = m.host === this.me(); this._laiVao = true; this.batDauSanh(c); // sảnh thấy st = 'tran' ngay → vào lại trận (khôi phục từ ảnh chụp)
        });
        return true;
      }
      case 'onl-san': { SND.nut(); const t = this.pl[this.me()]; this.ghiToi({ ready: !(t && t.ready) }); return true; }
      case 'onl-roi': SND.nut(); if (el && el.closest && el.closest('#onl-sanh')) this.roiHoi(); else this.roiPhong(); return true;
      case 'onl-copy': SND.nut(); this.chepMa(); return true;
      case 'onl-chiase': SND.nut(); this.chiaSe(); return true;
      case 'onl-bo': SND.nut(); this.moDoiBo(); return true;
    }
    return false;
  },
};
function escTen(s) { return String(s || '').replace(/[<>&"]/g, '').slice(0, 16); }
