// TURRET MERGE — giao diện DOM, chạm/kéo ghép, màn chọn bộ bài, vòng lặp chính, tham số kiểm thử
'use strict';

const $ = (s) => document.querySelector(s);
const UI = {
  keo: null, chon: [], mv: 'hero', che: 'solo', xep: 'bac', ttHet: 0, giu: null, manaCu: 0,

  // ---------- khởi động ----------
  async init() {
    // roster.json là nguồn dữ liệu chính (id, tên, bậc, kỹ năng); dự phòng bản nhúng trong meta.js
    let r = null;
    try { const res = await fetch('assets/roster.json', { cache: 'no-cache' }); if (res.ok) r = await res.json(); } catch (e) { }
    G.roster = r || window.ROSTER_EMBED || [];
    G.rosterMap = {}; for (const x of G.roster) G.rosterMap[x.id] = x;
    REN.init($('#cv'));
    this.docDebug();
    try { const l = JSON.parse(localStorage.getItem('turret_bo') || 'null'); if (l && l.chon) { this.chon = l.chon.filter(id => SKILLS[id] && G.rosterMap[id]); this.mv = MAVUONG[l.mv] ? l.mv : 'hero'; this.che = l.che || 'solo'; } } catch (e) { }
    this.veChon();
    document.addEventListener('click', (e) => this.bam(e));
    this.ganCham();
    REN.napTruoc(['khay', 'duong_thang', 'duong_goc', 'cong', 'loi', 'tia_lua', 'khoi_0', 'khoi_1', 'khoi_2', 'khoi_3', 'ui_mana']);
    let tr = performance.now();
    const vong = (n) => {
      let dt = Math.min(0.05, (n - tr) / 1000); tr = n;
      if (!G.dung && G.ban.length) { const k = G.tocDo; const buoc = k > 1 ? 2 : 1; for (let i = 0; i < buoc; i++) capNhat(dt * k / buoc); }
      REN.ve(G.dung ? 0 : dt);
      if (G.ban.length) this.capNhat();
      requestAnimationFrame(vong);
    };
    requestAnimationFrame(vong);
    if (G.debug.mode) { // ?mode=solo|coop|pvp → vào thẳng trận (kiểm thử)
      if (G.debug.deck) this.chon = G.debug.deck;
      else if (this.chon.length < 5) this.chon = deckNgauNhien();
      this.che = G.debug.mode; if (G.debug.af) this.mv = G.debug.af;
      this.vao();
    }
  },
  docDebug() {
    const q = new URLSearchParams(location.search), d = G.debug;
    if (q.get('mode')) d.mode = q.get('mode');
    if (q.get('deck')) d.deck = q.get('deck').split(',').filter(id => SKILLS[id]);
    if (q.get('deck2')) d.deck2 = q.get('deck2').split(',').filter(id => SKILLS[id]);
    if (q.get('wave')) d.wave = +q.get('wave');
    if (q.get('mana')) d.mana = +q.get('mana');
    if (q.get('fill')) d.fill = +q.get('fill');
    if (q.get('auto')) d.auto = true;
    if (q.get('af')) d.af = q.get('af');
    if (q.get('speed')) G.tocDo = +q.get('speed');
  },

  // ---------- màn chọn bộ bài ----------
  veChon() {
    const luoi = $('#chon-luoi'); luoi.innerHTML = '';
    const ds = G.roster.slice();
    if (this.xep === 'ten') ds.sort((a, b) => (SKILLS[b.id] ? 1 : 0) - (SKILLS[a.id] ? 1 : 0) || a.ten.localeCompare(b.ten, 'vi'));
    const nhom = this.xep === 'bac' ? TIER_LIST.map(t => [t, ds.filter(r => r.bac === t)]) : [[null, ds]];
    for (const [bac, rs] of nhom) {
      if (bac) {
        const h = document.createElement('div'); h.className = 'nhom'; h.style.setProperty('--m', TIERS[bac].mau);
        const co = rs.filter(r => SKILLS[r.id]).length;
        h.innerHTML = '<i></i>' + TIERS[bac].ten + ' · ' + TIERS[bac].tenDai + ' <span>' + co + '/' + rs.length + ' chơi được' + (bac === 'do' ? ' · tối đa 1 ụ đỏ' : '') + '</span>';
        luoi.appendChild(h);
      }
      const g = document.createElement('div'); g.className = 'luoi';
      for (const r of rs) g.appendChild(this.theChon(r));
      luoi.appendChild(g);
    }
    $('#nut-xep').textContent = this.xep === 'bac' ? 'XẾP: THEO BẬC' : 'XẾP: THEO TÊN';
    const mv = $('#chon-mv'); mv.innerHTML = '';
    for (const [id, d] of Object.entries(MAVUONG)) {
      const b = document.createElement('button'); b.className = 'mv' + (this.mv === id ? ' chon' : ''); b.dataset.act = 'mv-chon'; b.dataset.id = id;
      b.innerHTML = '<img src="assets/' + d.icon + '.png" alt=""><div><b>' + d.ten + '</b><span>' + d.mo + '</span></div>';
      mv.appendChild(b);
    }
    document.querySelectorAll('.che').forEach(b => b.classList.toggle('chon', b.dataset.che === this.che));
    this.veBoChon();
  },
  theChon(r) {
    const c = document.createElement('div');
    const co = !!SKILLS[r.id];
    c.className = 'c' + (co ? '' : ' khoa') + (this.chon.includes(r.id) ? ' chon' : '');
    c.dataset.act = 'chon-u'; c.dataset.id = r.id;
    c.innerHTML = '<div class="nen"></div><img class="anh" loading="lazy" src="assets/nho/' + r.id + '.png" alt="" onerror="this.style.visibility=\'hidden\'">' +
      '<img class="khung" src="assets/tier_card_' + r.bac + '.png" alt=""><div class="ten" style="color:' + TIERS[r.bac].mau + '">' + r.ten + '</div>' + (co ? '' : '<div class="sapco">SẮP CÓ</div>');
    return c;
  },
  veBoChon() {
    const b = $('#chon-bo'); b.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const id = this.chon[i], r = id && G.rosterMap[id];
      const o = document.createElement('div'); o.className = 'o-bo';
      if (r) { o.style.setProperty('--m', TIERS[r.bac].mau); o.innerHTML = '<img src="assets/nho/' + id + '.png" alt=""><i></i>'; o.dataset.act = 'chon-u'; o.dataset.id = id; }
      b.appendChild(o);
    }
    $('#chon-dem').textContent = this.chon.length + '/5';
    $('#nut-vao').disabled = this.chon.length !== 5;
    document.querySelectorAll('.c').forEach(c => c.classList.toggle('chon', this.chon.includes(c.dataset.id)));
  },
  chonU(id) {
    const r = G.rosterMap[id];
    if (!SKILLS[id]) { this.moTT(id, null, true); return; }
    const i = this.chon.indexOf(id);
    if (i >= 0) this.chon.splice(i, 1);
    else {
      if (this.chon.length >= 5) return this.nhac('Bộ bài đã đủ 5 ụ');
      if (r.bac === 'do' && this.chon.some(x => G.rosterMap[x].bac === 'do')) return this.nhac('Chỉ được 1 ụ ĐỎ (Cổ đại) trong bộ');
      this.chon.push(id);
    }
    SND.nut();
    this.veBoChon();
  },
  nhac(s) { const c = $('#chon-goi-nhac') || (() => { const d = document.createElement('div'); d.id = 'chon-goi-nhac'; d.style.cssText = 'position:absolute;left:50%;top:120px;transform:translateX(-50%);z-index:20;background:#b0001a;padding:8px 14px;border-radius:10px;font-weight:900;font-size:13px;pointer-events:none;transition:opacity .4s'; document.getElementById('wrap').appendChild(d); return d; })(); c.textContent = s; c.style.opacity = 1; clearTimeout(this._nh); this._nh = setTimeout(() => c.style.opacity = 0, 1300); },

  vao() {
    if (this.chon.length !== 5) return;
    SND.mo();
    try { localStorage.setItem('turret_bo', JSON.stringify({ chon: this.chon, mv: this.mv, che: this.che })); } catch (e) { }
    batDau(this.che, this.chon, this.mv);
  },
  vaoTran() {
    $('#chon').hidden = true; $('#ketqua').hidden = true; $('#dung').hidden = true;
    $('#top').hidden = false; $('#duoi').hidden = false; $('#tt').hidden = true;
    const B = G.ban[0];
    const bo = $('#bo-the'); bo.innerHTML = '';
    for (const id of B.deck) {
      const r = G.rosterMap[id];
      const d = document.createElement('button'); d.className = 'the'; d.dataset.act = 'nang'; d.dataset.id = id;
      d.innerHTML = '<div class="nen"></div><img class="anh" src="assets/nho/' + id + '.png" alt=""><img class="khung" src="assets/tier_card_' + r.bac + '.png" alt="">' +
        '<span class="lv">LV1</span><span class="so"></span><span class="gia"><img src="assets/ui_nangcap.png" alt=""><b>100</b></span>';
      bo.appendChild(d);
    }
    const mv = MAVUONG[B.mv.id];
    $('#the-mv .mv-ic').src = 'assets/' + mv.icon + '.png'; $('#the-mv .mv-ten').textContent = mv.ten;
    // nạp trước ảnh của mọi ụ trong các bộ bài + quái/trùm/hiệu ứng
    const ds = ['tier_ring_trang', 'tier_ring_xanh', 'tier_ring_tim', 'tier_ring_vang', 'tier_ring_do', 'phu_bang', 'phu_da', 'phu_lua', 'phu_ngam', 'dan_phao', 'dan_bang', 'dan_lien', 'dan_doc', 'dan_tia', 'tia_laser', 'tia_set',
      'fx_no_phao', 'fx_bang_vo', 'fx_dien', 'fx_khoi_doc', 'fx_chop_nong', 'fx_laser_trung', 'mimic_de', 'mimic_nong'];
    for (const b of G.ban) for (const id of b.deck) ds.push(id + '_de', id + '_nong');
    for (const q of Object.keys(QUAI)) ds.push('quai_' + (QUAI[q].anh || q));
    for (const t of TRUM_THU_TU) ds.push('trum_' + t);
    REN.napTruoc(ds);
  },

  // ---------- cập nhật HUD mỗi khung ----------
  capNhat() {
    const B = G.ban[0];
    const m = Math.floor(B.mana);
    const mEl = $('#mana');
    if (m !== this.manaCu) { mEl.textContent = m; if (m > this.manaCu) { mEl.classList.remove('nay'); void mEl.offsetWidth; mEl.classList.add('nay'); setTimeout(() => mEl.classList.remove('nay'), 120); } this.manaCu = m; }
    $('#gia-trieu').textContent = B.gia;
    const nt = $('#nut-trieu'), du = B.mana >= B.gia && oTrong(B).length > 0;
    nt.classList.toggle('du', du); nt.classList.toggle('thieu', !du);
    document.querySelectorAll('#bo-the .the').forEach(d => {
      const id = d.dataset.id, lv = B.lv[id];
      d.querySelector('.lv').textContent = 'LV' + lv;
      const n = B.t.filter(T => T && T.id === id).length;
      d.querySelector('.so').textContent = n ? '×' + n : '';
      const g = d.querySelector('.gia b');
      if (lv >= 5) { g.textContent = 'MAX'; d.classList.add('max'); d.classList.remove('du', 'thieu'); }
      else { const gia = LUAT.giaNangCap[lv - 1]; g.textContent = gia; d.classList.toggle('du', B.mana >= gia); d.classList.toggle('thieu', B.mana < gia); }
    });
    const mv = B.mv, md = MAVUONG[mv.id], te = $('#the-mv');
    te.querySelector('.mv-gia b').textContent = mv.gia;
    te.querySelector('.mv-cd').style.height = (mv.cd / md.cd * 100) + '%';
    te.classList.toggle('du', mv.cd <= 0 && B.mana >= mv.gia); te.classList.toggle('thieu', !(mv.cd <= 0 && B.mana >= mv.gia));
    $('#tb-so').textContent = Math.max(1, G.wave);
    // trùm
    const trum = G.quai.find(e => e.trum && !e.chet && G.duong[e.p].ban === 0) || G.quai.find(e => e.trum && !e.chet);
    if (trum) { $('#tb-trum-chu').textContent = TRUM[trum.trum].ten; $('#tb-trum-mau').hidden = false; $('#tb-trum-mau i').style.width = (trum.hp / trum.max * 100) + '%'; }
    else { $('#tb-trum-mau').hidden = true; const con = LUAT.songTrum - (Math.max(1, G.wave) % LUAT.songTrum); $('#tb-trum-chu').textContent = con === LUAT.songTrum ? 'WAVE TRÙM!' : 'TRÙM SAU ' + con + ' WAVE'; }
    // tim
    const key = G.che + B.tim + (G.ban[1] ? G.ban[1].tim : '');
    if (key !== this._timKey) {
      this._timKey = key;
      const el = $('#tb-tim'); el.innerHTML = '';
      if (G.che === 'coop') el.innerHTML = '<div class="chu">LỌT 1 QUÁI<br>LÀ THUA</div>';
      else {
        const max = G.che === 'pvp' ? LUAT.timPvp : LUAT.timSolo;
        const mk = (n, cls) => { let s = ''; for (let i = 0; i < max; i++) s += '<img class="' + (i < n ? '' : 'mat') + '" src="assets/ui_tim.png" alt="">'; return s; };
        if (G.che === 'pvp') el.innerHTML = '<div class="doi"><div>ĐỐI THỦ ' + mk(G.ban[1].tim) + '</div><div>BẠN ' + mk(B.tim) + '</div></div>';
        else el.innerHTML = mk(B.tim);
      }
    }
    if (this.ttHet && performance.now() > this.ttHet) { $('#tt').hidden = true; this.ttHet = 0; }
  },
  bangWave(w, trum) {
    const b = $('#bang-wave');
    b.querySelector('b').textContent = 'WAVE ' + w; b.querySelector('span').textContent = trum ? 'TRÙM ĐANG TỚI!' : (w === 1 ? 'Triệu hồi & ghép ụ súng!' : '');
    b.hidden = false; b.classList.remove('chay'); void b.offsetWidth; b.classList.add('chay');
    clearTimeout(this._bw); this._bw = setTimeout(() => b.hidden = true, 1700);
  },
  canhBaoTrum(id) {
    const b = $('#canh-bao');
    b.querySelector('b').textContent = TRUM[id].ten; b.querySelector('span').textContent = TRUM[id].kn + ': ' + TRUM[id].mo;
    b.hidden = false; b.classList.remove('chay'); void b.offsetWidth; b.classList.add('chay');
    SND.bao();
    clearTimeout(this._cb); this._cb = setTimeout(() => b.hidden = true, 2200);
  },
  ketQua(k) {
    const e = $('#ketqua'); e.hidden = false;
    e.classList.toggle('thang', k.thang); e.classList.toggle('thua', !k.thang);
    $('#kq-ten').textContent = k.thang ? 'CHIẾN THẮNG' : 'THẤT BẠI';
    $('#kq-so').innerHTML = 'Trụ tới <b>WAVE ' + k.wave + '</b>';
    $('#kq-phu').textContent = k.ly || '';
  },

  // ---------- thông tin ụ ----------
  moTT(id, T, giu) {
    const r = G.rosterMap[id], tt = $('#tt'), tier = TIERS[r.bac], sk = SKILLS[id];
    tt.querySelector('.tt-khung').src = 'assets/tier_card_' + r.bac + '.png';
    tt.querySelector('.tt-anh').src = 'assets/nho/' + id + '.png';
    tt.querySelector('.tt-ten').textContent = r.ten; tt.querySelector('.tt-ten').style.color = tier.mau;
    const bac = tt.querySelector('.tt-bac'); bac.textContent = tier.ten + ' · ' + tier.tenDai; bac.style.color = tier.mau; bac.style.border = '1px solid ' + tier.mau;
    tt.querySelector('.tt-phu').textContent = 'Theo thẻ DCDW: ' + r.dcdw + (sk ? ' · ' + ({ tc: 'Tấn công', ht: 'Hỗ trợ', db: 'Đặc biệt' }[sk.vai]) : ' · SẮP CÓ');
    tt.querySelector('.tt-kn').textContent = r.kyNang;
    let so = '';
    if (T && sk) {
      so = T.sao + '★ · LV' + G.ban[T.ban].lv[id];
      if (sk.dmg) so += ' · Sát thương ' + Math.round(dmgU(T));
      if (sk.mo) so += ' · ' + sk.mo(T);
      if (T.st.da) so += ' · HOÁ ĐÁ (ghép với đá cùng sao)';
      if (T.st.bang > 0) so += ' · ĐÓNG BĂNG';
      if (T.st.lua > 0) so += ' · ĐANG CHÁY';
      if (sk.chuDong) so += T.nap >= 1 ? ' · ĐÃ ĐẦY: CHẠM Ụ ĐỂ DÙNG' : ' · nạp ' + Math.round(T.nap * 100) + '%';
    } else if (!sk) so = 'Ụ này sẽ mở ở bản cập nhật sau.';
    else so = 'Sát thương gốc ' + Math.round((sk.dmg || 0) * tier.hs) + ' · ×' + tier.hs + ' theo bậc';
    tt.querySelector('.tt-so').textContent = so;
    tt.style.top = G.ban.length && !$('#top').hidden ? '470px' : '300px';
    tt.hidden = false;
    this.ttHet = performance.now() + (giu ? 2600 : 2200);
  },

  // ---------- nút bấm ----------
  bam(e) {
    const el = e.target.closest('[data-act]'); if (!el) return;
    const a = el.dataset.act, B = G.ban[0];
    SND.mo();
    switch (a) {
      case 'chon-u': this.chonU(el.dataset.id); break;
      case 'mv-chon': this.mv = el.dataset.id; SND.nut(); this.veChon(); break;
      case 'che': this.che = el.dataset.che; SND.nut(); document.querySelectorAll('.che').forEach(b => b.classList.toggle('chon', b.dataset.che === this.che)); break;
      case 'xep': this.xep = this.xep === 'bac' ? 'ten' : 'bac'; this.veChon(); break;
      case 'ngaunhien': this.chon = deckNgauNhien(); SND.nut(); this.veBoChon(); break;
      case 'vao': this.vao(); break;
      case 'trieu': if (B && !G.ketThuc) { if (trieu(B)) SND.nut(); } break;
      case 'nang': if (this._boQuaBam) { this._boQuaBam = false; break; } if (B) { if (nangCap(B, el.dataset.id)) { el.classList.remove('sang'); void el.offsetWidth; el.classList.add('sang'); } } break;
      case 'mv': if (B) dungMV(B); break;
      case 'tocdo': G.tocDo = G.tocDo === 1 ? 2 : 1; el.textContent = G.tocDo + '×'; break;
      case 'dung': G.dung = true; $('#dung').hidden = false; break;
      case 'tiep': G.dung = false; $('#dung').hidden = true; break;
      case 'amthanh': $('#nut-am').textContent = 'ÂM THANH: ' + (SND.batTat() ? 'BẬT' : 'TẮT'); break;
      case 'bo': case 'doibo':
        G.ban = []; G.quai = []; G.dung = false;
        $('#dung').hidden = true; $('#ketqua').hidden = true; $('#top').hidden = true; $('#duoi').hidden = true; $('#chon').hidden = false; this.veChon(); break;
      case 'choilai': batDau(this.che, this.chon, this.mv); break;
    }
  },

  // ---------- chạm / kéo ghép trên bàn ----------
  diemLogic(e) { const r = $('#cv').getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; },
  uTai(x, y) {
    const B = G.ban[0]; if (!B) return null;
    let best = null, bd = 1e9;
    for (let i = 0; i < 15; i++) { const T = B.t[i]; if (!T) continue; const c = B.o[i], d = Math.hypot(c.x - x, c.y - y); if (d < Math.min(B.cw, B.ch) * 0.6 && d < bd) { bd = d; best = T; } }
    return best;
  },
  ganCham() {
    const cv = $('#cv');
    cv.addEventListener('pointerdown', (e) => {
      if (!G.ban.length || G.ketThuc) return;
      SND.mo();
      const [x, y] = this.diemLogic(e), T = this.uTai(x, y);
      if (!T) { $('#tt').hidden = true; return; }
      cv.setPointerCapture(e.pointerId);
      this.keo = { T, x, y, x0: x, y0: y, dang: false };
    });
    cv.addEventListener('pointermove', (e) => {
      const k = this.keo; if (!k) return;
      const [x, y] = this.diemLogic(e); k.x = x; k.y = y;
      if (!k.dang && Math.hypot(x - k.x0, y - k.y0) > 7) {
        if (k.T.st.bang > 0) { FX.chu1(x, y - 20, 'ĐÓNG BĂNG', '#7fdcff', 12); this.keo = null; return; }
        k.dang = true; $('#tt').hidden = true;
      }
    });
    const het = (e) => {
      const k = this.keo; this.keo = null; if (!k) return;
      const B = G.ban[0];
      if (!k.dang) {
        if (B.t[k.T.o] !== k.T) return;
        const sk = SKILLS[k.T.id];
        if (sk.chuDong && k.T.nap >= 1 && !k.T.st.bang && !k.T.st.da) { sk.chuDong(G, B, k.T); return; } // ụ ĐỎ: chạm khi nạp đầy = dùng kỹ năng chủ động
        this.moTT(k.T.id, k.T); return;
      }
      const D = this.uTai(k.x, k.y);
      if (D && D !== k.T && B.t[k.T.o] === k.T) {
        if (hopLeGhep(k.T, D)) ghep(B, k.T, D);
        else { const c = B.o[D.o]; FX.chu1(c.x, c.y - 22, k.T.sao !== D.sao ? 'KHÁC SAO' : 'KHÁC LOẠI', '#ff9a9a', 12); }
      }
    };
    cv.addEventListener('pointerup', het); cv.addEventListener('pointercancel', () => { this.keo = null; });
    // giữ thẻ ở hàng dưới → bảng thông tin (không nâng cấp)
    const bo = $('#bo-the');
    bo.addEventListener('pointerdown', (e) => { const d = e.target.closest('.the'); if (!d) return; clearTimeout(this.giu); this.giu = setTimeout(() => { this._boQuaBam = true; this.moTT(d.dataset.id, null, true); }, 480); });
    const huy = () => clearTimeout(this.giu);
    bo.addEventListener('pointerup', huy); bo.addEventListener('pointerleave', huy); bo.addEventListener('pointercancel', huy);
    // giữ thẻ ở màn chọn → thông tin
    const luoi = $('#chon-luoi');
    luoi.addEventListener('contextmenu', (e) => e.preventDefault());
  },
};

UI.init();
