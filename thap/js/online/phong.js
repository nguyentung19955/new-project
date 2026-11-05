// TURRET MERGE — PHÒNG CO-OP ONLINE (2 người): Create room → mã 4 chữ + link chia sẻ, Join bằng mã; sảnh chờ hiện bộ bài +
// chỉ huy + READY của cả 2; cả 2 READY → chủ phòng bấm giờ → cả 2 vào CÙNG một trận có hạt giống (dongbo.js lo phần trong trận).
// Dữ liệu:  turretmerge/rooms/{CODE}/ meta{host,at,st,seed,k0} · members/{uid}=true · khach (uid khách) · pl/{uid} · act · snap · ping · state
// Hình: chỉ ảnh có sẵn (khung_bang, khung_tt, h2_lcd, nut_lon_*, the_khung_*, af_*, pilot_*, led_xanh, h2_tam_xanh) — QUY-TAC-HINH.md.
'use strict';

const ONL = {
  CHU: 'ABCDEFGHJKLMNPQRSTUVWXYZ', // không I / O (dễ nhầm với 1 / 0)
  code: null, host: false, meta: null, khach: null, pl: {}, state: null, _off: [], dangTran: false,
  me() { return NET.user && NET.user.uid; },
  ban() { const me = this.me(); if (!this.meta) return null; return this.host ? this.khach : this.meta.host; },
  luuPhong() { try { if (this.code) localStorage.setItem('tm_phong', JSON.stringify({ code: this.code, at: Date.now() })); else localStorage.removeItem('tm_phong'); } catch (e) { } },
  phongCu() { try { const v = JSON.parse(localStorage.getItem('tm_phong') || 'null'); return v && Date.now() - v.at < 6 * 3600e3 ? v : null; } catch (e) { return null; } },

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
    // link mời: ?phong=ABCD → mở bảng online và vào phòng
    const q = new URLSearchParams(location.search).get('phong');
    if (q && /^[A-Za-z]{4}$/.test(q)) setTimeout(() => { this.moBang(q.toUpperCase()); this.vaoPhong(q.toUpperCase()); }, 400);
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
        '<button class="nut chinh" data-act="onl-tao">CREATE ROOM</button>' +
        '<div class="onl-nho">OR ENTER A ROOM CODE</div>' +
        '<div class="onl-hang"><input id="onl-ma" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABCD"><button class="nut" data-act="onl-vao">JOIN</button></div>' +
        '<button class="nut" data-act="onl-lai" id="onl-lai" hidden>REJOIN MATCH</button>' +
        '<div class="onl-loi" id="onl-loi"></div>' +
        '<button class="nut" data-act="onl-dong">BACK</button></div></div>';
      document.getElementById('wrap').appendChild(el);
      el.querySelector('#onl-ma').addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, ''); });
    }
    el.hidden = false;
    if (maSan) el.querySelector('#onl-ma').value = maSan;
    this.baoLoi(NET.ok ? '' : 'Connecting…');
    NET.san().then((ok) => {
      this.baoLoi(ok ? '' : 'Online unavailable (' + NET.loi + '). Offline modes still work.');
      const cu = this.phongCu();
      if (ok && cu && !this.code) NET.get('rooms/' + cu.code + '/meta').then((m) => {
        el.querySelector('#onl-lai').hidden = !(m && m.st === 'tran');
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
  toi() { // dữ liệu người chơi của mình trong phòng
    return { name: TK.ho.name, av: TK.ho.av, deck: UI.chon.join(','), mv: UI.mv, on: true };
  },
  ghiToi(them) { return NET.update('rooms/' + this.code + '/pl/' + this.me(), Object.assign(this.toi(), them || {})); },

  taoPhong() {
    if (!this.canBo()) return;
    NET.san().then((ok) => {
      if (!ok) return this.baoLoi('Online unavailable (' + NET.loi + ').');
      const thu = (lan, ma) => {
        if (lan > 12) return Promise.reject(new Error('No free room code, try again'));
        let c = ma || ''; if (!c) for (let i = 0; i < 4; i++) c += this.CHU[Math.floor(Math.random() * this.CHU.length)];
        return NET.get('rooms/' + c + '/meta').then((m) => {
          const cu = m && Date.now() - (m.at || 0) > 6 * 3600e3; // phòng bỏ dở > 6 giờ: xoá rồi dùng lại mã (luật cho phép)
          if (m && !cu) { if (lan > 8) throw new Error('No free room code, try again'); return thu(lan + 1); } // mã đang có người dùng → mã khác
          const me = this.me();
          if (cu) return NET.remove('rooms/' + c).then(() => thu(lan + 1, c), () => thu(lan + 1));
          return Promise.resolve().then(() => NET.set('rooms/' + c, { meta: { host: me, at: NET.TS, st: 'cho', seed: 1 + Math.floor(Math.random() * 1e9), v: 1 }, members: { [me]: true } })).then(() => c);
        });
      };
      this.baoLoi('Creating room…');
      thu(0).then((c) => { this.host = true; this.batDauSanh(c); }).catch((e) => this.baoLoi('Could not create room: ' + (e.code || e.message)));
    });
  },
  vaoPhong(c) {
    c = String(c || '').toUpperCase();
    if (!/^[A-Z]{4}$/.test(c)) return this.baoLoi('Room code = 4 letters.');
    if (!this.canBo()) return;
    NET.san().then((ok) => {
      if (!ok) return this.baoLoi('Online unavailable (' + NET.loi + ').');
      this.baoLoi('Joining ' + c + '…');
      NET.get('rooms/' + c + '/meta').then((m) => {
        if (!m) throw new Error('Room ' + c + ' not found');
        const me = this.me();
        if (m.host === me) { this.host = true; return; }
        this.host = false;
        // phòng đã có khách khác → đầy (luật database cũng chặn; kiểm trước để báo rõ)
        return NET.get('rooms/' + c + '/khach').catch(() => null).then((k) => {
          if (k && k !== me) throw new Error('Room ' + c + ' is full');
          // một lần ghi (nguyên khối): ô khách + danh sách thành viên members/{uid} (luật database kiểm thành viên qua members)
          return NET.update('rooms/' + c, { khach: me, ['members/' + me]: true }).catch(() => { throw new Error('Room ' + c + ' is full'); });
        });
      }).then(() => this.batDauSanh(c)).catch((e) => this.baoLoi(e.message || e.code));
    });
  },

  // ---------- sảnh chờ ----------
  batDauSanh(c) {
    this.thoiNghe();
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
  veSanh() {
    let el = document.getElementById('onl-sanh');
    if (!el) {
      el = document.createElement('div'); el.id = 'onl-sanh'; el.className = 'man phu onl-man';
      el.innerHTML = '<div class="bang onl-bang sanh">' +
        '<div class="onl-nho">ROOM CODE</div><div class="sanh-ma" id="sanh-ma"></div>' +
        '<button class="nut" data-act="onl-chiase">SHARE INVITE LINK</button>' +
        '<div class="sanh-ds" id="sanh-ds"></div>' +
        '<div class="sanh-ping" id="sanh-ping"></div>' +
        '<div class="onl-loi" id="sanh-loi"></div>' +
        '<div class="bang-nut"><button class="nut chinh" data-act="onl-san" id="sanh-san">READY</button>' +
        '<button class="nut" data-act="onl-roi">LEAVE ROOM</button></div></div>';
      document.getElementById('wrap').appendChild(el);
    }
    el.hidden = false;
    this.capNhatSanh();
  },
  theNguoi(p, laToi) {
    if (!p) return '<div class="sanh-p trong"><div class="sp-cho">Waiting for a friend…<br><small>Share the code or link</small></div></div>';
    const deck = String(p.deck || '').split(',').filter(id => G.rosterMap[id]);
    const mv = MAVUONG[p.mv] ? p.mv : 'hero';
    return '<div class="sanh-p' + (p.ready ? ' san' : '') + (p.on === false ? ' mat' : '') + '">' +
      '<div class="sp-dau"><img class="sp-av" src="' + TK.avURL(p.av) + '" alt=""><b>' + escTen(p.name) + (laToi ? ' (YOU)' : '') + '</b>' +
      '<i class="sp-led' + (p.on === false ? ' tat' : '') + '"></i><span class="sp-san">' + (p.ready ? 'READY' : 'NOT READY') + '</span></div>' +
      '<div class="sp-bo">' + deck.map(id => '<span class="sp-u" style="--m:' + TIERS[G.rosterMap[id].bac].mau + '"><img src="' + portraitOf(id) + '" alt=""><img class="kh" src="assets/the_khung_' + G.rosterMap[id].bac + '.png" alt="" onerror="this.remove()"></span>').join('') +
      '<span class="sp-mv">' + mvArt(mv) + '</span></div></div>';
  },
  capNhatSanh() {
    const el = document.getElementById('onl-sanh'); if (!el || el.hidden && !this.code) return;
    if (this.code && this.meta === null && this._daCoMeta) { this.baoLoi('The host closed the room.'); this.roiPhong(); this.hienBangSauRoi('The host closed the room.'); return; }
    if (this.meta) this._daCoMeta = true;
    if (this.meta && this.meta.st === 'cho') { this._thayCho = true; this._sauTran = false; }
    const me = this.me(), banId = this.ban();
    el.querySelector('#sanh-ma').textContent = this.code || '';
    const toi = this.pl[me], ban = banId ? this.pl[banId] : null;
    el.querySelector('#sanh-ds').innerHTML = this.theNguoi(toi, true) + this.theNguoi(ban, false);
    const nut = el.querySelector('#sanh-san');
    nut.textContent = toi && toi.ready ? 'NOT READY' : 'READY';
    nut.classList.toggle('chinh', !(toi && toi.ready));
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
    this.dangTran = false; this._sauTran = true; // chờ chủ phòng đặt lại st = 'cho' rồi mới tính READY lần mới
    if (!this.code) return false;
    this.ghiToi({ ready: false });
    if (this.host) NET.update('rooms/' + this.code, { act: null, snap: null, state: null, ping: null, 'meta/st': 'cho' }).catch(() => { });
    this.veSanh();
    return true;
  },
  hienBangSauRoi(s) { this.moBang(); this.baoLoi(s); },
  chiaSe() {
    const url = location.origin + location.pathname + '?phong=' + this.code;
    const xong = (s) => this.baoLoi(s);
    if (navigator.share) navigator.share({ title: 'TURRET MERGE co-op', text: 'Join my TURRET MERGE room ' + this.code, url }).catch(() => { });
    else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => xong('Link copied: ' + url), () => xong(url));
    else xong(url);
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
          this.host = m.host === this.me(); this.batDauSanh(c); // sảnh thấy st = 'tran' ngay → vào lại trận (khôi phục từ ảnh chụp)
        });
        return true;
      }
      case 'onl-san': { SND.nut(); const t = this.pl[this.me()]; this.ghiToi({ ready: !(t && t.ready) }); return true; }
      case 'onl-roi': SND.nut(); this.roiPhong(); return true;
      case 'onl-chiase': SND.nut(); this.chiaSe(); return true;
    }
    return false;
  },
};
function escTen(s) { return String(s || '').replace(/[<>&"]/g, '').slice(0, 16); }
