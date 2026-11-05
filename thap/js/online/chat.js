// TURRET MERGE — CHAT NHANH (sảnh ONLINE + trận CO-OP/PVP online).
//  · Nút CHAT nhỏ cạnh nhãn ALLY/RIVAL (trong trận) hoặc góc phải đầu sảnh → bảng gọn: 8 câu soạn sẵn + 4 biểu cảm
//    (+ ô chữ tự do ≤ 60 ký tự CHỈ ở sảnh, lọc từ xấu). Giới hạn 1 tin / 2 s. Không bao giờ dừng trận.
//  · Tin hiện thành bong bóng ~3 s trên tên/bàn người gửi + nhật ký nhỏ ở sảnh. Tắt chat (MUTE) trong SETTINGS.
//  · Dữ liệu: rooms/<code>/chat/<khoá> = { u, t:'q'|'e'|'x', v, at } — giữ 30 tin mới nhất (người gửi xoá tin cũ).
//    Luật database đang chạy chưa có nhánh chat → ghi bị từ chối thì tự gửi qua kênh hành động có sẵn rooms/<code>/act (k:'ch').
//  · Hình: chỉ ảnh có sẵn (khung_tt = bảng, h2_tam = bong bóng, h2_chip = nút CHAT, nut_lon_thep = nút câu, ic_* = biểu cảm tạm).
//    Ảnh riêng cho chat cần gen: HINH-VE-CODE-AUDIT.md "Pass 11 — chat" (raw_p11_*.png).
'use strict';

const CHAT = {
  CAU: ['Nice!', 'Help my lane!', 'Merge now', 'Boss incoming', 'Save mana', 'Thanks!', 'Hurry up!', 'GG'],
  // biểu cảm tạm = icon có sẵn (thay bằng p11_emo_* khi có ảnh gen)
  EMO: { vui: 'ic_sao', ok: 'chon_huy', no: 'ic_bom', toang: 'ic_chet' },
  XAU: ['fuck', 'shit', 'bitch', 'cunt', 'dick', 'asshole', 'nigger', 'fag', 'đm', 'dm', 'vcl', 'vl', 'cc', 'địt', 'dit me', 'lồn', 'lon', 'cặc', 'buồi', 'đéo', 'deo'],
  GIU: 30, CACH: 2000, HIEN: 3000,
  code: null, me: null, keys: [], log: [], _off: [], _t0: null, _gui: 0, dungAct: false, mo: false,
  mute() { try { return localStorage.getItem('tm_chat_mute') === '1'; } catch (e) { return false; } },
  datMute(v) { try { localStorage.setItem('tm_chat_mute', v ? '1' : '0'); } catch (e) { } if (v) this.dong(); this.veLog(); },

  // ---------------------------------------------------------------- vào / rời phòng
  bat(code) {
    if (this.code === code) return;
    this.tat();
    this.code = code; this.me = NET.user && NET.user.uid; this.keys = []; this.log = []; this._t0 = NET.khoa();
    const goc = 'rooms/' + code + '/';
    // tin lưu sẵn (≤ 30) → nhật ký sảnh; chỉ tin MỚI (khoá ≥ lúc vào) mới bật bong bóng
    this._off.push(NET.nghe(goc + 'chat', 'child_added', (v, k) => this.nhan(v, k)));
    this._off.push(NET.nghe(goc + 'act', 'child_added', (v, k) => { if (v && v.k === 'ch') { let d = null; try { d = JSON.parse(v.d); } catch (e) { } if (d) this.nhan({ u: v.u, t: d.t, v: d.v }, k); } }, { sau: this._t0 }));
    this.veNut();
  },
  tat() {
    for (const f of this._off.splice(0)) try { f(); } catch (e) { }
    this.code = null; this.keys = []; this.log = []; this.dong();
    const n = document.getElementById('chat-nut'); if (n) n.hidden = true;
    document.querySelectorAll('.chat-bong').forEach(e => e.remove());
    this.veLog();
  },

  // ---------------------------------------------------------------- gửi
  sach(s) {
    s = String(s || '').replace(/[<>&"\u0000-\u001f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
    for (const w of this.XAU) {
      const re = new RegExp('(^|[^\\p{L}])(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?=$|[^\\p{L}])', 'giu');
      s = s.replace(re, (m, a, b) => a + '*'.repeat(b.length));
    }
    return s;
  },
  conCho() { return Math.max(0, this.CACH - (Date.now() - this._gui)); },
  gui(t, v) {
    if (!this.code || !NET.ok) return false;
    if (this.conCho() > 0) { this.baoCho(); return false; }
    if (t === 'x') { v = this.sach(v); if (!v) return false; }
    if (t === 'q' && !this.CAU.includes(v)) return false;
    if (t === 'e' && !this.EMO[v]) return false;
    this._gui = Date.now();
    const goc = 'rooms/' + this.code + '/', k = NET.khoa(), me = this.me = NET.user && NET.user.uid;
    const quaAct = () => NET.set(goc + 'act/' + NET.khoa(), { u: me, k: 'ch', tk: 0, d: JSON.stringify({ t, v }) }).catch(() => { });
    if (this.dungAct) quaAct();
    else NET.set(goc + 'chat/' + k, { u: me, t, v, at: NET.TS }).then(() => this.don(), () => { this.dungAct = true; quaAct(); });
    this.veNut(); setTimeout(() => this.veNut(), this.CACH + 50);
    return true;
  },
  // giữ 30 tin mới nhất: người gửi xoá phần cũ
  don() {
    if (this.keys.length <= this.GIU || !this.code) return;
    const goc = 'rooms/' + this.code + '/chat/';
    for (const k of this.keys.splice(0, this.keys.length - this.GIU)) NET.remove(goc + k).catch(() => { });
  },
  baoCho() {
    const p = document.getElementById('chat-bang'); if (!p) return;
    const e = p.querySelector('.chat-cho'); if (e) { e.textContent = 'Wait ' + Math.ceil(this.conCho() / 1000) + ' s'; clearTimeout(this._bc); this._bc = setTimeout(() => { e.textContent = ''; }, 900); }
  },

  // ---------------------------------------------------------------- nhận
  nhan(v, k) {
    if (!v || !v.u || !k || this.keys.includes(k)) return;
    this.keys.push(k); this.keys.sort();
    const m = { u: v.u, t: v.t, v: v.t === 'x' ? this.sach(v.v) : v.v, k };
    if (m.t === 'q' && !this.CAU.includes(m.v)) return;
    if (m.t === 'e' && !this.EMO[m.v]) return;
    if (!m.v) return;
    this.log.push(m); this.log.sort((a, b) => a.k < b.k ? -1 : 1); if (this.log.length > this.GIU) this.log.splice(0, this.log.length - this.GIU);
    this.veLog();
    const laToi = m.u === (NET.user && NET.user.uid);
    if (k >= this._t0 && (laToi || !this.mute())) { this.bong(m, laToi); if (!laToi && typeof SND !== 'undefined' && SND.nut) try { SND.nut(); } catch (e) { } }
  },
  ten(u) { const p = typeof ONL !== 'undefined' && ONL.pl && ONL.pl[u]; return p && p.name ? escTen(p.name) : (u === (NET.user && NET.user.uid) ? 'You' : 'Partner'); },
  noiDung(m) { return m.t === 'e' ? '<img src="assets/' + this.EMO[m.v] + '.png" alt="' + m.v + '">' : '<span>' + m.v.replace(/[<>&"]/g, '') + '</span>'; },

  // bong bóng ~3 s: sảnh = trên hàng người chơi; trận = trên nhãn bàn (đồng đội / đối thủ) hoặc trên bàn mình
  bong(m, laToi) {
    const wrap = document.getElementById('wrap'); if (!wrap) return;
    let x, y, cha = wrap;
    const sanh = document.getElementById('onl-sanh');
    const trongTran = typeof ONS !== 'undefined' && ONS.on && G.ban && G.ban.length > 1;
    if (!trongTran && sanh && !sanh.hidden) {
      const hang = sanh.querySelector('.sanh-p[data-u="' + (laToi ? 'me' : 'ban') + '"]'); if (!hang) return;
      cha = hang; x = null;
    } else if (trongTran) {
      const B = laToi ? G.ban[0] : G.ban[1];
      x = Math.min(B.x + B.w - 12, W - 12); y = B.y - 12;
      if (laToi) { y = B.y + 6; } // bàn mình: góc trên-phải khay bàn
    } else return;
    const cu = cha.querySelector(':scope > .chat-bong'); if (cu) cu.remove();
    const b = document.createElement('div');
    b.className = 'chat-bong' + (m.t === 'e' ? ' emo' : '') + (cha === wrap ? ' tran' : '') + (laToi ? ' toi' : '');
    b.innerHTML = this.noiDung(m);
    if (cha === wrap) { b.style.right = Math.round(W - x) + 'px'; b.style.top = Math.round(y - 30) + 'px'; }
    cha.appendChild(b);
    setTimeout(() => b.remove(), this.HIEN);
  },
  veLog() {
    const el = document.getElementById('chat-log'); if (!el) return;
    const me = NET.user && NET.user.uid, mute = this.mute();
    const ds = this.log.filter(m => m.u === me || !mute).slice(-4);
    const h = ds.map(m => '<div class="chat-dong' + (m.u === me ? ' toi' : '') + '"><b>' + this.ten(m.u) + '</b>' + this.noiDung(m) + '</div>').join('');
    if (el._h !== h) { el._h = h; el.innerHTML = h; el.scrollTop = el.scrollHeight; }
    el.hidden = !ds.length;
  },

  // ---------------------------------------------------------------- nút CHAT + bảng
  veNut() {
    const wrap = document.getElementById('wrap'); if (!wrap) return;
    const sanh = document.getElementById('onl-sanh');
    // sảnh: nút ở ô trống bên phải tiêu đề + nhật ký nhỏ dưới 2 hàng người chơi
    if (sanh && !sanh.querySelector('#chat-nut-s')) {
      const o = sanh.querySelector('.s7-dau i');
      if (o) { const b = document.createElement('button'); b.className = 'chat-nut'; b.id = 'chat-nut-s'; b.dataset.act = 'chat-mo'; b.textContent = 'CHAT'; o.appendChild(b); }
      const ds = sanh.querySelector('#sanh-ds');
      if (ds && !sanh.querySelector('#chat-log')) { const l = document.createElement('div'); l.id = 'chat-log'; l.hidden = true; ds.after(l); }
      this.veLog();
    }
    for (const b of document.querySelectorAll('.chat-nut')) b.classList.toggle('cho', this.conCho() > 0);
  },
  // nút trong trận: bên trái nhãn ALLY / RIVAL (tvb.js nhan) — gọi mỗi khung hình khi trận online chạy
  veNutTran() {
    let n = document.getElementById('chat-nut');
    const co = !!this.code && typeof ONS !== 'undefined' && ONS.on && G.ban && G.ban.length > 1 && !G.ketThuc && !document.getElementById('top').hidden;
    if (!n && co) { n = document.createElement('button'); n.id = 'chat-nut'; n.className = 'chat-nut tran'; n.dataset.act = 'chat-mo'; n.textContent = 'CHAT'; document.getElementById('wrap').appendChild(n); }
    if (!n) return;
    if (n.hidden !== !co) n.hidden = !co;
    if (!co) { const s = document.getElementById('onl-sanh'); if (this.mo && (!s || s.hidden)) this.dong(); return; }
    if (this.mo) { const p = document.getElementById('chat-bang'); if (p && p.classList.contains('sanh')) this.dong(); } // bảng của sảnh còn mở khi vào trận
    const B = G.ban[1], chu = G.che === 'pvp' ? 'RIVAL' : 'ALLY';
    const tw = this._tw || (this._tw = {});
    // cùng phép tính bề rộng tấm tên hud_ten_ban (178×70) như TVB.nhan: chữ + đầu 74 px + đuôi 32 px (thu về cao 22) + 6
    if (tw[chu] == null) { const c = document.createElement('canvas').getContext('2d'); c.font = FONT.u(14, 800); tw[chu] = Math.ceil(c.measureText(chu).width + (74 + 32) * 22 / 70 + 6); }
    const x0 = Math.min(B.x + B.w - tw[chu] - 8, W - tw[chu] - 6), y = Math.round(B.y - 11 + 2);
    const k = x0 + ',' + y; if (n._k !== k) { n._k = k; n.style.right = Math.round(W - x0 + 4) + 'px'; n.style.top = y + 'px'; }
  },
  moBang() {
    if (!this.code) return;
    let p = document.getElementById('chat-bang');
    const sanh = document.getElementById('onl-sanh'), oSanh = !!(sanh && !sanh.hidden);
    if (!p) {
      p = document.createElement('div'); p.id = 'chat-bang';
      document.getElementById('wrap').appendChild(p);
    }
    p.innerHTML = '<div class="chat-dau"><b>QUICK CHAT</b><small class="chat-cho"></small><button class="chat-x" data-act="chat-dong" aria-label="Close"><img src="assets/p7_ic_dong.png" alt=""></button></div>' +
      '<div class="chat-cau">' + this.CAU.map(c => '<button data-act="chat-q" data-v="' + c + '">' + c + '</button>').join('') + '</div>' +
      '<div class="chat-emo">' + Object.entries(this.EMO).map(([k, f]) => '<button data-act="chat-e" data-v="' + k + '" aria-label="' + k + '"><img src="assets/' + f + '.png" alt=""></button>').join('') + '</div>' +
      (oSanh ? '<div class="chat-go"><input id="chat-chu" maxlength="60" autocomplete="off" placeholder="Type a message…" enterkeyhint="send"><button data-act="chat-x">SEND</button></div>' : '') +
      (this.mute() ? '<div class="chat-tat">Chat is muted (SETTINGS). You can still send.</div>' : '');
    p.classList.toggle('sanh', oSanh);
    p.hidden = false; this.mo = true;
    const o = p.querySelector('#chat-chu');
    if (o) o.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); this.guiChu(); } });
  },
  dong() { const p = document.getElementById('chat-bang'); if (p) p.hidden = true; this.mo = false; },
  guiChu() { const o = document.getElementById('chat-chu'); if (!o) return; if (this.gui('x', o.value)) { o.value = ''; this.dong(); } },
  bam(a, el) {
    switch (a) {
      case 'chat-mo': if (this.mo) this.dong(); else this.moBang(); return true;
      case 'chat-dong': this.dong(); return true;
      case 'chat-q': if (this.gui('q', el.dataset.v)) this.dong(); return true;
      case 'chat-e': if (this.gui('e', el.dataset.v)) this.dong(); return true;
      case 'chat-x': this.guiChu(); return true;
      case 'chat-mute': this.datMute(!this.mute()); el.textContent = 'CHAT: ' + (this.mute() ? 'OFF' : 'ON'); return true;
    }
    return false;
  },

  init() {
    // theo phòng: vào sảnh → bật; rời phòng → tắt
    const bd = ONL.batDauSanh, rp = ONL.roiPhong, xs = ONL.xoaSauTran;
    ONL.batDauSanh = function (c) { const r = bd.apply(this, arguments); try { CHAT.bat(c); } catch (e) { console.error('[CHAT]', e); } return r; };
    ONL.roiPhong = function () { const r = rp.apply(this, arguments); try { CHAT.tat(); } catch (e) { } return r; };
    ONL.xoaSauTran = function () { const r = xs.apply(this, arguments); setTimeout(() => { if (!ONL.code) CHAT.tat(); }, 5500); return r; };
    const cs = ONL.capNhatSanh;
    ONL.capNhatSanh = function () { const r = cs.apply(this, arguments); try { CHAT.veNut(); CHAT.veLog(); } catch (e) { } return r; };
    // SETTINGS: thêm nút CHAT: ON/OFF
    if (typeof HM !== 'undefined' && HM.moCai) {
      const mc = HM.moCai;
      HM.moCai = function () {
        const r = mc.apply(this, arguments);
        const h = document.querySelector('#hm-tam .hm-cai2');
        if (h && !h.querySelector('[data-act="chat-mute"]')) { const b = document.createElement('button'); b.className = 'hm-nut2'; b.dataset.act = 'chat-mute'; b.textContent = 'CHAT: ' + (CHAT.mute() ? 'OFF' : 'ON'); h.appendChild(b); }
        return r;
      };
    }
    const f = () => { try { this.veNutTran(); } catch (e) { } requestAnimationFrame(f); };
    requestAnimationFrame(f);
  },
};
