// TURRET MERGE — TÀI KHOẢN: khách ẩn danh mặc định + "Sign in with Google" + tên hiển thị + ảnh đại diện (chân dung phi công)
// + thống kê (wave cao nhất, số trận thắng, số trận). Hồ sơ: Realtime Database  turretmerge/profiles/{uid}  (+ bản sao trong máy).
// Không có mạng / chưa bật Firebase → hồ sơ chỉ lưu trong máy, game vẫn chơi bình thường.
// Hình: chỉ ảnh có sẵn (khung_bang, khung_tt, h2_lcd, nut_lon_*, nut_nho, pilot_*.png) — QUY-TAC-HINH.md.
'use strict';

const TK = {
  KEY: 'tm_hoso',
  AV: ['laser', 'canon', 'bang', 'doc', 'drone', 'bao', 'kiembang', 'lien', 'hydra', 'cuuvi', 'anhsang', 'aten'],
  ho: null, // { name, av, bestWave, wins, games }
  avURL(av) { return 'assets/pilot_' + (TK.AV.includes(av) ? av : 'laser') + '.png'; },
  tenMacDinh(uid) { return 'Pilot-' + String(uid || Math.random().toString(36).slice(2)).replace(/[^A-Za-z0-9]/g, '').slice(-4).toUpperCase(); },
  docMay() { try { return JSON.parse(localStorage.getItem(this.KEY) || 'null'); } catch (e) { return null; } },
  luuMay() { try { localStorage.setItem(this.KEY, JSON.stringify(this.ho)); } catch (e) { } },
  sach(h) {
    h = h || {};
    return {
      name: String(h.name || '').replace(/[<>&"]/g, '').trim().slice(0, 16) || this.tenMacDinh(NET.user && NET.user.uid),
      av: TK.AV.includes(h.av) ? h.av : 'laser',
      bestWave: Math.max(0, Math.min(999, +h.bestWave || 0)), wins: Math.max(0, +h.wins || 0), games: Math.max(0, +h.games || 0),
    };
  },

  init() {
    this.ho = this.sach(this.docMay());
    this.veChip();
    NET.khiDoiTK((u) => this.taiHoSo(u));
    // tải SDK + đăng nhập khách NGẦM sau khi menu hiện (không chặn lần mở game đầu)
    setTimeout(() => NET.san().then(() => this.veChip()), 1500);
  },
  taiHoSo(u) {
    if (!u) return;
    if (this._uid === u.uid) { this.luuMay2(); this.veChip(); if (this.mo) this.veBang(); return; } // cùng tài khoản (vd. khách → nối Google): giữ chỉnh sửa trong máy
    this._uid = u.uid;
    NET.get('profiles/' + u.uid).then((v) => {
      const may = this.ho;
      if (v) this.ho = this.sach(Object.assign({}, v, { bestWave: Math.max(v.bestWave || 0, may.bestWave), wins: Math.max(v.wins || 0, may.wins), games: Math.max(v.games || 0, may.games) }));
      else this.ho = this.sach(Object.assign({}, may, { name: /^Pilot-/.test(may.name) && u.name ? u.name.slice(0, 16) : may.name }));
      this.luuMay(); this.luuMay2(); this.veChip(); if (this.mo) this.veBang();
    }).catch((e) => { NET.loi = e.code || e.message; this.veChip(); });
  },
  luuMay2() {
    this.luuMay();
    if (!NET.ok || !NET.user) return Promise.resolve();
    const h = this.ho;
    return NET.update('profiles/' + NET.user.uid, { name: h.name, av: h.av, bestWave: h.bestWave, wins: h.wins, games: h.games, g: !NET.user.anon, at: NET.TS }) // update: giữ các ô khác (deck, tiến độ… nếu phần khác của game ghi)
      .catch((e) => { NET.loi = e.code || e.message; });
  },
  // gọi khi hết trận (mọi chế độ)
  ghiTran(thang, wave) {
    const h = this.ho; h.games++; if (thang) h.wins++; h.bestWave = Math.max(h.bestWave, wave || 0);
    this.luuMay2(); this.veChip();
  },

  // ---------- giao diện ----------
  veChip() {
    let c = document.getElementById('tk-chip');
    const dau = document.querySelector('#chon .chon-dau');
    if (!c && dau) {
      c = document.createElement('button'); c.id = 'tk-chip'; c.dataset.act = 'tk-mo';
      c.innerHTML = '<img alt=""><span><b></b><small></small></span>';
      dau.appendChild(c);
    }
    if (!c) return;
    c.querySelector('img').src = this.avURL(this.ho.av);
    c.querySelector('b').textContent = this.ho.name;
    const u = NET.user;
    c.querySelector('small').textContent = !NET.ok ? (NET.loi ? 'OFFLINE' : '…') : u && !u.anon ? 'GOOGLE' : 'GUEST';
    c.classList.toggle('google', !!(u && !u.anon));
  },
  moBang() {
    this.mo = true;
    let el = document.getElementById('tk-bang');
    if (!el) {
      el = document.createElement('div'); el.id = 'tk-bang'; el.className = 'man phu onl-man';
      el.innerHTML = '<div class="bang onl-bang">' +
        '<div class="bang-ten">PILOT PROFILE</div>' +
        '<div class="tk-dau"><img class="tk-av" alt=""><div class="tk-ten-hop"><input id="tk-ten" maxlength="16" autocomplete="off" spellcheck="false"><small id="tk-loai"></small></div></div>' +
        '<div class="tk-so"><div><b id="tk-w">0</b><span>BEST WAVE</span></div><div><b id="tk-th">0</b><span>WINS</span></div><div><b id="tk-tr">0</b><span>MATCHES</span></div></div>' +
        '<div class="onl-nho">CHOOSE AVATAR</div><div class="tk-avs"></div>' +
        '<div class="bang-nut"><button class="nut" data-act="tk-google" id="tk-google">SIGN IN WITH GOOGLE</button>' +
        '<button class="nut" data-act="tk-xuat" id="tk-xuat" hidden>SIGN OUT</button>' +
        '<div class="onl-loi" id="tk-loi"></div>' +
        '<button class="nut chinh" data-act="tk-dong">SAVE</button></div></div>';
      document.getElementById('wrap').appendChild(el);
      el.querySelector('#tk-ten').addEventListener('input', (e) => { this._tenGo = e.target.value; });
      const g = el.querySelector('.tk-avs');
      for (const a of this.AV) { const b = document.createElement('button'); b.className = 'tk-a'; b.dataset.act = 'tk-av'; b.dataset.av = a; b.innerHTML = '<img src="' + this.avURL(a) + '" alt="">'; g.appendChild(b); }
    }
    el.hidden = false;
    NET.san().then(() => this.veBang());
    this.veBang();
  },
  veBang() {
    const el = document.getElementById('tk-bang'); if (!el) return;
    const h = this.ho, u = NET.user;
    el.querySelector('.tk-av').src = this.avURL(h.av);
    const ip = el.querySelector('#tk-ten'); if (document.activeElement !== ip) ip.value = this._tenGo != null ? this._tenGo : h.name;
    el.querySelector('#tk-w').textContent = h.bestWave; el.querySelector('#tk-th').textContent = h.wins; el.querySelector('#tk-tr').textContent = h.games;
    el.querySelectorAll('.tk-a').forEach(b => b.classList.toggle('chon', b.dataset.av === h.av));
    el.querySelector('#tk-loai').textContent = !NET.ok ? 'Offline — profile saved on this device' : u.anon ? 'Guest account (this device)' : 'Google: ' + (u.email || u.name);
    el.querySelector('#tk-google').hidden = !NET.ok || !u || !u.anon;
    el.querySelector('#tk-xuat').hidden = !NET.ok || !u || u.anon;
    el.querySelector('#tk-loi').textContent = NET.ok ? '' : (NET.loi ? 'Online unavailable: ' + NET.loi : 'Connecting…');
  },
  dongBang() {
    const el = document.getElementById('tk-bang'); if (!el) return;
    const ip = el.querySelector('#tk-ten'); this.ho.name = this.sach({ name: ip.value }).name; this._tenGo = null;
    el.hidden = true; this.mo = false; this.luuMay2(); this.veChip();
    if (typeof ONL !== 'undefined') ONL.doiHoSo();
  },
  bam(a, el) {
    switch (a) {
      case 'tk-mo': SND.nut(); this.moBang(); return true;
      case 'tk-dong': SND.nut(); this.dongBang(); return true;
      case 'tk-av': SND.nut(); this.ho.av = el.dataset.av; this.veBang(); this.veChip(); return true;
      case 'tk-google':
        SND.nut();
        NET.dangNhapGoogle().then(() => { this.veBang(); this.veChip(); })
          .catch((e) => { const l = document.getElementById('tk-loi'); if (l) l.textContent = 'Google sign-in failed: ' + (e.code || e.message); });
        return true;
      case 'tk-xuat': SND.nut(); NET.dangXuat().then(() => { this.veBang(); this.veChip(); }); return true;
    }
    return false;
  },
};
