// TURRET MERGE — HƯỚNG DẪN LẦN ĐẦU (P0-01): trận SOLO có hướng dẫn, bộ 5 ụ cố định + chỉ huy REINFORCE.
// Từng bước: triệu hồi → ghép cùng ụ cùng sao → chạm xem thông tin → nút chỉ huy → cảnh báo trùm → hạ trùm wave 10 = xong.
// Bỏ qua được; tiến độ lưu localStorage 'turret_hd'; bộ sưu tập 85 ụ mở sau khi xong (hoặc bỏ qua).
// Chỉ bọc (wrap) hàm có sẵn — không đổi luật chơi thường. Hình: chỉ ảnh ChatGPT có sẵn (khung_tt, h2_canh_bao, nut_nho).
// Kiểm thử: ?tut=1 = chạy lại từ đầu · ?notut=1 = không tự vào hướng dẫn · ?mode=… (debug) không bao giờ vào hướng dẫn.
'use strict';

const HD = {
  KEY: 'turret_hd',
  DECK: ['canon', 'lien', 'bang', 'set', 'sungluc'], MV: 'hero',
  WAVE_TRUM: 10,
  st: { xong: false, boQua: false, buoc: {} },
  dang: false, i: -1, t0: 0, dem: 0, el: null, ketTut: false,
  // mỗi bước: id, chữ chính, chữ phụ, nơi đặt bảng ('tren' = trên đường đi, 'duoi' = trên hàng nút), đích chỉ mũi tên
  BUOC: [
    { id: 'muc', chu: 'Stop enemies reaching your CORE', phu: 'Each enemy that gets through costs a life. You have 3.', noi: 'tren', ok: true },
    { id: 'trieu', chu: 'Tap SUMMON twice', phu: 'A random turret from your deck appears. Each summon costs +10 mana.', noi: 'tren', dich: '#nut-trieu', can: 2 },
    { id: 'ghep', chu: 'Drag a turret onto its twin', phu: 'Same turret + same ★ = merge: a RANDOM turret from your deck with +1★.', noi: 'tren', dich: 'cap' },
    { id: 'tt', chu: 'Tap a turret (no drag)', phu: 'Its card shows what it does and its star skills.', noi: 'tren', dich: 'u' },
    { id: 'mv', chu: 'Tap your COMMANDER', phu: 'REINFORCE: two free turrets. Costs mana, doubles each use, then cools down.', noi: 'tren', dich: '#the-mv' },
    { id: 'tudo', chu: 'Keep summoning and merging', phu: 'Tap a card below to upgrade that turret with mana. Hold it to read it. Boss at wave 10.', noi: 'tren', ok: true, tu: 7 },
    { id: 'trum', chu: 'BOSS incoming!', phu: 'Bosses use skills and cost 2 lives if they get through. Merge up, use your commander.', noi: 'tren', ok: true, tu: 6, cho: true },
  ],

  doc() { try { const s = JSON.parse(localStorage.getItem(this.KEY) || 'null'); if (s && typeof s === 'object') this.st = Object.assign({ xong: false, boQua: false, buoc: {} }, s); } catch (e) { } },
  luu() { try { localStorage.setItem(this.KEY, JSON.stringify(this.st)); } catch (e) { } },
  moKhoa() { return !!(this.st.xong || this.st.boQua); },

  dung() {
    const w = document.getElementById('wrap'); if (!w || this.el) return;
    const d = document.createElement('div'); d.id = 'hd'; d.hidden = true;
    d.innerHTML = '<div class="hd-the"><small class="hd-so"></small><b class="hd-chu"></b><span class="hd-phu"></span><em class="hd-dat" hidden></em>' +
      '<div class="hd-nut"><button class="nut-xep hd-ok" type="button">GOT IT</button><button class="nut-xep hd-bo" type="button" data-act="bo">SKIP TUTORIAL</button></div></div>' +
      '<img class="hd-mui" src="assets/h2_canh_bao.webp?v=5cf92aa4" alt="">';
    w.appendChild(d); this.el = d;
    d.querySelector('.hd-ok').addEventListener('click', (e) => { e.stopPropagation(); this.xongBuoc(); });
    // nút BỎ QUA mang data-act="bo": UI.bam (bắt ở document) đưa về màn chọn như nút QUIT; ở đây chỉ ghi trạng thái trước
    d.querySelector('.hd-bo').addEventListener('click', () => this.boQua());
    // thanh nhỏ khi chơi tự do: tiến độ + bỏ qua
    const g = document.createElement('div'); g.id = 'hd-gon'; g.hidden = true;
    g.innerHTML = '<span>TUTORIAL · beat the wave ' + this.WAVE_TRUM + ' boss</span><button class="nut-xep" type="button" data-act="bo">SKIP</button>';
    w.appendChild(g); this.gon = g;
    g.querySelector('button').addEventListener('click', () => this.boQua());
  },

  batDau() {
    this.dung();
    this.dang = true; this.ketTut = false; this.i = -1; this.dem = 0;
    UI.chon = this.DECK.slice(); UI.mv = this.MV; UI.che = 'solo';
    batDau('solo', this.DECK, this.MV);
    this.toi(0);
  },
  // tới bước kế tiếp chưa xong (bước đã xong ở lần trước được bỏ qua; 'trum' luôn chờ cảnh báo trùm)
  toi(i) {
    while (i < this.BUOC.length && this.st.buoc[this.BUOC[i].id] && !this.BUOC[i].cho) i++;
    this.i = i; this.t0 = G.t; this.dem = 0; this.daDat = false; this.boChi();
    const b = this.BUOC[i];
    if (!b || b.cho) { this.an(); this.hienGon(true); return; }
    this.hien(b);
  },
  xongBuoc() {
    const b = this.BUOC[this.i]; if (!b) return;
    this.st.buoc[b.id] = true; this.luu();
    if (b.id === 'trum') { this.i = this.BUOC.length; this.an(); this.hienGon(true); return; }
    this.toi(this.i + 1);
  },
  boQua() {
    this.st.boQua = true; this.luu();
    this.ket();
  },
  ket() { this.dang = false; this.ketTut = false; this.an(); this.hienGon(false); this.boChi(); },

  hien(b) {
    const d = this.el; if (!d) return;
    // màn mở đầu trận (vaotran.js) còn mở → chưa hiện bảng hướng dẫn (trước đây 2 bảng chồng lên nhau); hiện khi nó đóng
    if (typeof VT !== 'undefined' && VT.mo) {
      d.hidden = true; this._choVT = b;
      clearTimeout(this._hVT); this._hVT = setTimeout(() => { if (this._choVT === b && this.dang && this.BUOC[this.i] === b) { this._choVT = null; this.t0 = G.t; this.hien(b); } }, 150);
      return;
    }
    this._choVT = null;
    const so = this.BUOC.filter(x => !x.cho).length, n = Math.min(so, this.BUOC.indexOf(b) + 1);
    d.querySelector('.hd-so').textContent = 'TUTORIAL ' + n + '/' + so;
    d.querySelector('.hd-chu').textContent = b.chu + (b.can ? ' (' + this.dem + '/' + b.can + ')' : '');
    d.querySelector('.hd-phu').textContent = b.phu;
    d.querySelector('.hd-ok').hidden = !b.ok;
    d.querySelector('.hd-dat').hidden = true;
    d.className = 'hd-' + b.noi; d.hidden = false;
    this.hienGon(false);
    if (b.dich && b.dich[0] === '#') { const t = document.querySelector(b.dich); if (t) t.classList.add('hd-nhan'); }
    this.chiMui();
    requestAnimationFrame(() => fitText(d.querySelector('.hd-chu'), 17, 12));
  },
  an() { if (this.el) this.el.hidden = true; },
  hienGon(c) { if (this.gon) this.gon.hidden = !(c && this.dang && !G.ketThuc); },
  boChi() { document.querySelectorAll('.hd-nhan').forEach(e => e.classList.remove('hd-nhan')); },

  // mũi tên (ảnh chevron xoay 180°) chỉ xuống đích: nút DOM hoặc ô ụ trên bàn
  chiMui() {
    const b = this.BUOC[this.i], m = this.el && this.el.querySelector('.hd-mui'); if (!m) return;
    let x = null, y = null;
    if (b && b.dich && b.dich[0] === '#') {
      const t = document.querySelector(b.dich), w = document.getElementById('wrap');
      if (t && w) { const r = t.getBoundingClientRect(), rw = w.getBoundingClientRect(), k = rw.width / W; x = (r.left + r.width / 2 - rw.left) / k; y = (r.top - rw.top) / k; }
    } else if (b && (b.dich === 'cap' || b.dich === 'u')) {
      const B = G.ban[0], T = b.dich === 'cap' ? (this.cap && this.cap[0]) : B && B.t.find(Boolean);
      if (B && T && B.t[T.o] === T) { const c = B.o[T.o]; x = c.x; y = c.y - B.ch * 0.45; }
    }
    if (x == null) { m.hidden = true; return; }
    m.hidden = false; m.style.left = Math.round(x - 20) + 'px'; m.style.top = Math.round(y - 50) + 'px';
  },

  // tìm cặp ghép hợp lệ (cùng ụ, cùng sao) trên bàn người chơi
  timCap(B) {
    const ts = B.t.filter(T => T && !T.st.bang && !T.st.da);
    for (const a of ts) for (const c of ts) if (a !== c && a.id === c.id && a.sao === c.sao && a.sao < LUAT.saoMax) return [a, c];
    return null;
  },

  // ~30 lần/giây (theo UI.capNhat)
  nhip() {
    if (!this.dang || !G.ban.length) return;
    if (G.ketThuc) { this.an(); this.hienGon(false); this.boChi(); return; }
    const b = this.BUOC[this.i], B = G.ban[0];
    // giữ wave 1 lại cho tới khi người chơi đã triệu hồi + ghép (một khái niệm mỗi lần, không bị ép)
    if (G.wave === 0 && b && (b.id === 'muc' || b.id === 'trieu' || b.id === 'ghep')) G.cho = Math.max(G.cho, 0.6);
    // xong hướng dẫn: hạ (hoặc vượt qua) trùm wave 10
    if (G.wave >= this.WAVE_TRUM && !G.laTrum && !G.quai.some(e => e.trum && !e.chet)) {
      this.st.xong = true; this.luu(); this.ketTut = true;
      ketThuc(true, 'Tutorial cleared — all 85 turrets unlocked');
      this.dang = false; this.an(); this.hienGon(false); this.boChi(); return;
    }
    if (!b) return;
    if (b.id === 'muc' && G.t - this.t0 > 6) return this.xongBuoc();
    if (b.tu && b.id !== 'trum' && G.t - this.t0 > b.tu) return this.xongBuoc();
    if (b.id === 'trum' && !this.el.hidden && G.t - this.t0 > b.tu) return this.xongBuoc();
    if (b.id === 'ghep' && !this.daDat) {
      // DỰNG SẴN của hướng dẫn (ghi rõ trên bảng): nếu chưa có cặp thì đặt thêm 1 ụ giống hệt — không giả là may mắn
      this.daDat = true;
      let cap = this.timCap(B);
      if (!cap) {
        const a = B.t.find(T => T && T.sao === 1) || trieu(B, true, this.DECK[0]);
        const c = a && trieu(B, true, a.id);
        if (a && c) { a.sao = c.sao = 1; cap = [a, c]; const d = this.el.querySelector('.hd-dat'); d.textContent = 'Tutorial setup: a matching pair was placed for you.'; d.hidden = false; }
      }
      this.cap = cap;
    }
    if (b.id === 'ghep' && this.cap && !(B.t[this.cap[0].o] === this.cap[0])) this.cap = this.timCap(B);
    if (b.id === 'mv' && !this.daDat) {
      this.daDat = true;
      if (B.mana < B.mv.gia || B.mv.cd > 0) { B.mana = Math.max(B.mana, B.mv.gia); B.mv.cd = 0; const d = this.el.querySelector('.hd-dat'); d.textContent = 'Tutorial: mana topped up for this step.'; d.hidden = false; }
    }
    if (!this.el.hidden) this.chiMui();
  },
  // sự kiện từ các hàm được bọc
  su(k) {
    if (!this.dang) return;
    const b = this.BUOC[this.i]; if (!b) return;
    if (k === 'trieu' && b.id === 'trieu') { this.dem++; if (this.dem >= b.can) this.xongBuoc(); else this.hien(b); }
    else if (k === 'ghep' && b.id === 'ghep') this.xongBuoc();
    else if (k === 'tt' && b.id === 'tt') this.xongBuoc();
    else if (k === 'mv' && b.id === 'mv') this.xongBuoc();
    else if (k === 'trum' && b.id === 'trum') { setTimeout(() => { if (this.dang && this.BUOC[this.i] === b) { this.t0 = G.t; this.hien(b); } }, 2300); }
  },
};

(function () {
  HD.doc();
  const q = new URLSearchParams(location.search);
  if (q.get('tut')) { HD.st = { xong: false, boQua: false, buoc: {} }; HD.luu(); }

  // ---- bọc hàm có sẵn (gọi bản gốc trước, chỉ quan sát) ----
  const trieuGoc = trieu;
  trieu = function (B, mienPhi) { const T = trieuGoc.apply(this, arguments); if (T && !mienPhi && G.ban[0] === B) HD.su('trieu'); return T; };
  const ghepGoc = ghep;
  ghep = function (B, a, b, ep) { const r = ghepGoc.apply(this, arguments); if (r && !ep && B === G.ban[0]) HD.su('ghep'); return r; };
  const mvGoc = dungMV;
  dungMV = function (B) { const r = mvGoc.apply(this, arguments); if (r && B === G.ban[0]) HD.su('mv'); return r; };
  const moTTGoc = UI.moTT;
  UI.moTT = function (id, T) { const r = moTTGoc.apply(this, arguments); if (T) HD.su('tt'); return r; };
  const cbGoc = UI.canhBaoTrum;
  UI.canhBaoTrum = function () { const r = cbGoc.apply(this, arguments); HD.su('trum'); return r; };
  const capGoc = UI.capNhat;
  UI.capNhat = function () { const r = capGoc.apply(this, arguments); try { HD.nhip(); } catch (e) { console.error('HD', e); } return r; };

  // rời trận (QUIT / đổi bộ) giữa hướng dẫn: dừng hướng dẫn, giữ tiến độ các bước đã xong
  document.addEventListener('click', (e) => {
    const el = e.target.closest && e.target.closest('[data-act]'); if (!el) return;
    const a = el.dataset.act;
    if ((a === 'bo' || a === 'doibo') && HD.dang) HD.ket();
    if (a === 'hd-choi') { e.stopPropagation(); HD.batDau(); }
    if (a === 'hd-boqua') { e.stopPropagation(); HD.boQua(); if (UI.veChon) UI.veChon(); }
  }, true);

  // lần đầu mở game: vào thẳng trận hướng dẫn (không bắt chọn 5/85)
  const initGoc = UI.init;
  UI.init = async function () {
    const r = await initGoc.apply(this, arguments);
    HD.dung();
    // mở từ link mời CO-OP (?room= / ?phong= / #room=): vào thẳng phòng, hướng dẫn để lần mở sau (không ép trước khi vào phòng)
    const moi = /^[A-Za-z]{4}$/.test(q.get('room') || q.get('phong') || new URLSearchParams(String(location.hash).slice(1)).get('room') || new URLSearchParams(String(location.hash).slice(1)).get('phong') || '');
    if (!G.debug.mode && !HD.moKhoa() && !q.get('notut') && !moi) HD.batDau();
    return r;
  };
})();
