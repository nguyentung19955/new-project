// TURRET MERGE — giao diện DOM, chạm/kéo ghép, màn chọn bộ bài, vòng lặp chính, tham số kiểm thử
'use strict';

const $ = (s) => document.querySelector(s);
// co chữ cho vừa khung: giảm cỡ chữ tới khi không tràn (tối đa 2 dòng nếu khung cho phép)
function fitText(el, max, min) {
  if (!el) return; let f = max; el.style.fontSize = f + 'px';
  while (f > min && (el.scrollWidth > el.clientWidth + 0.5 || el.scrollHeight > el.clientHeight + 0.5)) { f -= 0.5; el.style.fontSize = f + 'px'; }
}
const UI = {
  keo: null, xemHT: null, chon: [], mv: 'hero', che: 'solo', xep: 'bac', ttHet: 0, giu: null, manaCu: 0,

  // ---------- khởi động ----------
  async init() {
    // roster.json là nguồn dữ liệu chính (id, tên, bậc, kỹ năng); dự phòng bản nhúng trong meta.js
    let r = null;
    try { const res = await fetch('assets/roster.json', { cache: 'no-cache' }); if (res.ok) r = await res.json(); } catch (e) { }
    G.roster = applyText(r || window.ROSTER_EMBED || []);
    document.querySelectorAll('[data-t]').forEach(e => { const v = TEXT.ui[e.dataset.t]; if (typeof v === 'string') e.innerHTML = v; });
    G.rosterMap = {}; for (const x of G.roster) G.rosterMap[x.id] = x;
    this.docDebug();
    REN.init($('#cv'));
    try { const l = JSON.parse(localStorage.getItem('turret_bo') || 'null'); if (l && l.chon) { this.chon = l.chon.filter(id => SKILLS[id] && G.rosterMap[id]); this.mv = MAVUONG[l.mv] ? l.mv : 'hero'; this.che = l.che || 'solo'; } } catch (e) { }
    this.veChon();
    document.addEventListener('click', (e) => this.bam(e));
    this.ganCham();
    REN.napTruoc(['khay', 'duong_thang', 'duong_goc', 'cong', 'loi', 'tia_lua', 'khoi_0', 'khoi_1', 'khoi_2', 'khoi_3', 'ui_mana']);
    // vòng lặp: mô phỏng bước cố định (BUOC) + bộ tích luỹ; vẽ NỘI SUY giữa 2 trạng thái → mượt ở mọi tần số màn hình.
    // Tăng tốc 2×/3× = nhiều bước hơn mỗi khung (cùng BUOC nhỏ). Sau khi chuyển tab: kẹp thời gian bù.
    let tr = -1, tichLuy = 0, alpha = 1;
    const vong = (n) => {
      if (tr < 0) tr = n;
      let thuc = (n - tr) / 1000; tr = n;
      if (!(thuc > 0)) thuc = 0; else if (thuc > 0.1) thuc = 0.1;
      if (!G.dung && G.ban.length) {
        const k = G.tocDo || 1, toiDa = Math.ceil(k * 0.1 / BUOC) + 1;
        tichLuy += thuc * k;
        let so = 0;
        while (tichLuy >= BUOC && so < toiDa) { chupTruoc(); capNhat(BUOC); tichLuy -= BUOC; so++; }
        if (tichLuy >= BUOC) tichLuy = BUOC * 0.999; // máy quá chậm: bỏ phần nợ, không "xoáy chết"
        alpha = tichLuy / BUOC;
        FX.giam = k > 1 ? 1 / Math.sqrt(k) : 1;
        FX.capNhat(thuc * (k > 1 ? Math.sqrt(k) : 1)); // hiệu ứng theo thời gian thực (nhanh lên êm khi tăng tốc)
      }
      REN.ve(G.dung ? 0 : thuc, alpha);
      if (G.ban.length && (this._hud = !this._hud)) this.capNhat(); // HUD (DOM) 30 lần/giây là đủ, đỡ dựng lại bố cục
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
    if (q.get('dpr')) d.dpr = +q.get('dpr'); // kiểm thử: ép độ phân giải vẽ
  },

  // ---------- màn chọn bộ bài ----------
  veChon() {
    const luoi = $('#chon-luoi'); luoi.innerHTML = '';
    const ds = G.roster.slice();
    if (this.xep === 'ten') ds.sort((a, b) => (SKILLS[b.id] ? 1 : 0) - (SKILLS[a.id] ? 1 : 0) || a.ten.localeCompare(b.ten, 'en'));
    const nhom = this.xep === 'bac' ? TIER_LIST.map(t => [t, ds.filter(r => r.bac === t)]) : [[null, ds]];
    for (const [bac, rs] of nhom) {
      if (bac) {
        const h = document.createElement('div'); h.className = 'nhom'; h.style.setProperty('--m', TIERS[bac].mau);
        const co = rs.filter(r => SKILLS[r.id]).length;
        h.innerHTML = '<i></i><b>' + TIERS[bac].ten + '</b><span>' + co + '/' + rs.length + ' ' + TEXT.ui.playable + (bac === 'do' ? ' · ' + TEXT.ui.maxOneMythic : '') + '</span>';
        luoi.appendChild(h);
      }
      const g = document.createElement('div'); g.className = 'luoi';
      for (const r of rs) g.appendChild(this.theChon(r));
      luoi.appendChild(g);
    }
    $('#nut-xep').textContent = this.xep === 'bac' ? TEXT.ui.sortTier : TEXT.ui.sortName;
    const mv = $('#chon-mv'); mv.innerHTML = '';
    for (const [id, d] of Object.entries(MAVUONG)) {
      const b = document.createElement('button'); b.className = 'mv' + (this.mv === id ? ' chon' : ''); b.dataset.act = 'mv-chon'; b.dataset.id = id;
      b.innerHTML = '<img src="assets/' + d.icon + '.png" alt=""><div><b>' + d.ten + '</b><span>' + d.mo + '</span></div>';
      mv.appendChild(b);
    }
    document.querySelectorAll('.che').forEach(b => b.classList.toggle('chon', b.dataset.che === this.che));
    this.veBoChon();
    requestAnimationFrame(() => luoi.querySelectorAll('.ten').forEach(e => fitText(e, 10.5, 7)));
  },
  theChon(r) {
    const c = document.createElement('div');
    const co = !!SKILLS[r.id];
    c.className = 'c' + (co ? '' : ' khoa') + (this.chon.includes(r.id) ? ' chon' : '');
    c.dataset.act = 'chon-u'; c.dataset.id = r.id;
c.style.setProperty('--m', TIERS[r.bac].mau);
    c.innerHTML = cardArt(r.id) +
      '<div class="ten">' + r.ten + '</div>' + (co ? '' : '<div class="sapco">' + TEXT.ui.soon + '</div>');
    return c;
  },
  veBoChon() {
    const b = $('#chon-bo'); b.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const id = this.chon[i], r = id && G.rosterMap[id];
      const o = document.createElement('div'); o.className = 'o-bo';
      if (r) { o.style.setProperty('--m', TIERS[r.bac].mau); o.innerHTML = '<img src="' + portraitOf(id) + '" alt=""><i></i>'; o.dataset.act = 'chon-u'; o.dataset.id = id; }
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
      if (this.chon.length >= 5) return this.nhac(TEXT.ui.deckFull);
      if (r.bac === 'do' && this.chon.some(x => G.rosterMap[x].bac === 'do')) return this.nhac(TEXT.ui.oneMythic);
      this.chon.push(id);
    }
    SND.nut();
    this.veBoChon();
  },
  nhac(s) { const c = $('#chon-goi-nhac') || (() => { const d = document.createElement('div'); d.id = 'chon-goi-nhac'; d.style.cssText = 'position:absolute;left:50%;top:120px;transform:translateX(-50%);z-index:20;background:#b0001a;padding:8px 14px;border-radius:10px;font-weight:900;font-size:13px;white-space:nowrap;text-align:center;pointer-events:none;transition:opacity .4s'; document.getElementById('wrap').appendChild(d); return d; })(); c.textContent = s; c.style.opacity = 1; clearTimeout(this._nh); this._nh = setTimeout(() => c.style.opacity = 0, 1300); },

  vao() {
    if (this.chon.length !== 5) return;
    SND.mo();
    try { localStorage.setItem('turret_bo', JSON.stringify({ chon: this.chon, mv: this.mv, che: this.che })); } catch (e) { }
    batDau(this.che, this.chon, this.mv);
  },
  vaoTran() {
    $('#chon').hidden = true; $('#ketqua').hidden = true; $('#dung').hidden = true;
    $('#top').hidden = false; $('#duoi').hidden = false; $('#tt').hidden = true;
    const nt = $('#nut-tocdo'); if (nt) nt.textContent = G.tocDo + '×';
    const B = G.ban[0];
    const bo = $('#bo-the'); bo.innerHTML = '';
    for (const id of B.deck) {
      const r = G.rosterMap[id];
      const d = document.createElement('button'); d.className = 'the'; d.dataset.act = 'nang'; d.dataset.id = id;
      d.style.setProperty('--m', TIERS[r.bac].mau);
      d.innerHTML = cardArt(id) +
        '<span class="lv">LV1</span><span class="so"></span><span class="gia"><img src="assets/ui_nangcap.png" alt=""><b>100</b></span>';
      bo.appendChild(d);
    }
    const mv = MAVUONG[B.mv.id];
    $('#the-mv .mv-ic').src = 'assets/' + mv.icon + '.png'; $('#the-mv .mv-ten').textContent = mv.ten; fitText($('#the-mv .mv-ten'), 10, 7);
    // nạp trước ảnh của mọi ụ trong các bộ bài + quái/trùm/hiệu ứng
    const ds = ['de_chung', 'sup_ring', 'sup_link', 'sup_link_vang', 'sup_khung', 'sup_radar', 'sup_chimang', 'sup_lanhgia', 'sup_khuech', 'sup_tuthan', 'sup_mana', 'sup_khien', 'sup_taylo', 'phu_bang', 'phu_da', 'phu_lua', 'phu_ngam', 'dan_phao', 'dan_bang', 'dan_lien', 'dan_doc', 'dan_tia', 'tia_laser', 'tia_set',
      'fx_no_phao', 'fx_bang_vo', 'fx_dien', 'fx_khoi_doc', 'fx_chop_nong', 'fx_laser_trung', 'mimic_nong'];
    for (const b of G.ban) for (const id of b.deck) ds.push(id + '_nong');
    for (const q of Object.keys(QUAI)) ds.push('quai_' + (QUAI[q].anh || q));
    for (const t of TRUM_THU_TU) ds.push('trum_' + t);
    REN.napTruoc(ds);
  },

  // ---------- cập nhật HUD mỗi khung ----------
  // chỉ ghi DOM khi giá trị ĐỔI (ghi lại cùng giá trị mỗi khung vẫn bắt trình duyệt dựng lại bố cục/vẽ lại)
  capNhat() {
    const B = G.ban[0];
    const chu = (el, v) => { v = '' + v; if (el._v !== v) { el._v = v; el.textContent = v; } };
    const cao = (el, k, v) => { if (el['_' + k] !== v) { el['_' + k] = v; el.style[k] = v; } };
    const m = Math.floor(B.mana);
    const mEl = $('#mana');
    if (m !== this.manaCu) { chu(mEl, m); if (m > this.manaCu && !this._nay) { this._nay = true; mEl.classList.add('nay'); setTimeout(() => { mEl.classList.remove('nay'); this._nay = false; }, 120); } this.manaCu = m; }
    chu($('#gia-trieu'), B.gia);
    const nt = $('#nut-trieu'), du = B.mana >= B.gia && oTrong(B).length > 0;
    nt.classList.toggle('du', du); nt.classList.toggle('thieu', !du);
    document.querySelectorAll('#bo-the .the').forEach(d => {
      const id = d.dataset.id, lv = B.lv[id];
      chu(d._lv || (d._lv = d.querySelector('.lv')), 'LV' + lv);
      let n = 0; for (const T of B.t) if (T && T.id === id) n++;
      chu(d._so || (d._so = d.querySelector('.so')), n ? '×' + n : '');
      const g = d._g || (d._g = d.querySelector('.gia b'));
      if (lv >= 5) { chu(g, TEXT.ui.max); d.classList.add('max'); d.classList.remove('du', 'thieu'); }
      else { const gia = LUAT.giaNangCap[lv - 1]; chu(g, gia); d.classList.toggle('du', B.mana >= gia); d.classList.toggle('thieu', B.mana < gia); }
    });
    const mv = B.mv, md = MAVUONG[mv.id], te = $('#the-mv');
    chu(te.querySelector('.mv-gia b'), mv.gia);
    cao(te.querySelector('.mv-cd'), 'height', (Math.round(mv.cd / md.cd * 200) / 2) + '%');
    te.classList.toggle('du', mv.cd <= 0 && B.mana >= mv.gia); te.classList.toggle('thieu', !(mv.cd <= 0 && B.mana >= mv.gia));
    chu($('#tb-so'), Math.max(1, G.wave));
    // trùm
    const trum = G.quai.find(e => e.trum && !e.chet && G.duong[e.p].ban === 0) || G.quai.find(e => e.trum && !e.chet);
    const tm = $('#tb-trum-mau');
    if (trum) { chu($('#tb-trum-chu'), TRUM[trum.trum].ten); if (tm.hidden) tm.hidden = false; cao($('#tb-trum-mau i'), 'width', (Math.round(trum.hp / trum.max * 400) / 4) + '%'); }
    else { if (!tm.hidden) tm.hidden = true; const con = LUAT.songTrum - (Math.max(1, G.wave) % LUAT.songTrum); chu($('#tb-trum-chu'), con === LUAT.songTrum ? TEXT.ui.bossWave : TEXT.ui.bossIn(con)); }
    // tim
    const key = G.che + B.tim + (G.ban[1] ? G.ban[1].tim : '');
    if (key !== this._timKey) {
      this._timKey = key;
      const el = $('#tb-tim'); el.innerHTML = '';
      if (G.che === 'coop') el.innerHTML = '<div class="chu">' + TEXT.ui.coopLeak + '</div>';
      else {
        const max = G.che === 'pvp' ? LUAT.timPvp : LUAT.timSolo;
        const mk = (n, cls) => { let s = ''; for (let i = 0; i < max; i++) s += '<img class="' + (i < n ? '' : 'mat') + '" src="assets/ui_tim.png" alt="">'; return s; };
        if (G.che === 'pvp') el.innerHTML = '<div class="doi"><div><span>' + TEXT.ui.rival + '</span>' + mk(G.ban[1].tim) + '</div><div><span>' + TEXT.ui.you + '</span>' + mk(B.tim) + '</div></div>';
        else el.innerHTML = mk(B.tim);
      }
    }
    if (this.ttHet && performance.now() > this.ttHet) { $('#tt').hidden = true; this.ttHet = 0; }
  },
  bangWave(w, trum) {
    const b = $('#bang-wave');
    b.querySelector('b').textContent = TEXT.ui.wave + ' ' + w; const sp = b.querySelector('span'); sp.textContent = trum ? TEXT.ui.bossComing : (w === 1 ? TEXT.ui.wave1Hint : ''); sp.hidden = !sp.textContent;
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
    const e = $('#ketqua'); e.hidden = false; $('#tt').hidden = true;
    e.classList.toggle('thang', k.thang); e.classList.toggle('thua', !k.thang);
    $('#kq-ten').textContent = k.thang ? TEXT.ui.victory : TEXT.ui.defeat;
    $('#kq-so').innerHTML = TEXT.ui.reached(k.wave);
    $('#kq-phu').textContent = k.ly || '';
  },

  // ---------- thông tin ụ ----------
  moTT(id, T, giu) {
    const r = G.rosterMap[id], tt = $('#tt'), tier = TIERS[r.bac], sk = SKILLS[id];
    tt.style.setProperty('--m', tier.mau);
    tt.querySelector('.tt-anh').src = portraitOf(id);
    tt.querySelector('.tt-ten').textContent = r.ten; tt.querySelector('.tt-ten').style.color = tier.mau;
    const bac = tt.querySelector('.tt-bac'); bac.textContent = tier.ten;
    tt.querySelector('.tt-phu').textContent = sk ? TEXT.ui.role[sk.vai] : TEXT.ui.soon;
    tt.querySelector('.tt-kn').textContent = r.kyNang;
    let so = '';
    if (T && sk) {
      so = T.sao + '★ · LV' + G.ban[T.ban].lv[id];
      if (sk.dmg) so += ' · ' + TEXT.ui.dmg + ' ' + Math.round(dmgU(T));
      if (sk.mo) so += ' · ' + sk.mo(T);
      if (T.st.da) so += ' · ' + TEXT.ui.stoned;
      if (T.st.bang > 0) so += ' · ' + TEXT.ui.frozen;
      if (T.st.lua > 0) so += ' · ' + TEXT.ui.burning;
      if (sk.chuDong) so += ' · ' + (T.nap >= 1 ? TEXT.ui.readyTap : TEXT.ui.charge(Math.round(T.nap * 100)));
    } else if (!sk) so = TEXT.ui.comingSoon;
    else so = TEXT.ui.baseDmg(Math.round((sk.dmg || 0) * tier.hs), tier.hs);
    tt.querySelector('.tt-so').textContent = so;
    // trong trận: không che bàn của mình (solo: ngay dưới bàn; co-op/pvp: đè lên bàn đồng đội/đối thủ phía trên)
    const B0 = G.ban[0], tran = G.ban.length && !$('#top').hidden;
    tt.style.top = !tran ? '300px' : (G.ban.length > 1 ? '60px' : Math.round(B0.y + B0.h + 8) + 'px');
    tt.style.zIndex = $('#chon').hidden ? 8 : 12; // màn chọn: nổi trên bảng chọn
    tt.hidden = false;
    fitText(tt.querySelector('.tt-ten'), 18, 12);
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
      case 'tocdo': G.tocDo = G.tocDo >= 3 ? 1 : G.tocDo + 1; el.textContent = G.tocDo + '×'; break;
      case 'dung': G.dung = true; $('#dung').hidden = false; $('#tt').hidden = true; break;
      case 'tiep': G.dung = false; $('#dung').hidden = true; break;
      case 'amthanh': $('#nut-am').textContent = SND.batTat() ? TEXT.ui.soundOn : TEXT.ui.soundOff; break;
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
      if (!T) { $('#tt').hidden = true; this.xemHT = null; return; }
      if (laHoTro(T)) { if (!this.xemHT || this.xemHT.T !== T || !this.xemHT.giu && this.xemHT.het < performance.now()) this.xemHT = { T, t0: performance.now(), giu: true }; else { this.xemHT.giu = true; this.xemHT.het = 0; } }
      else this.xemHT = null;
      cv.setPointerCapture(e.pointerId);
      this.keo = { T, x, y, x0: x, y0: y, dang: false };
    });
    cv.addEventListener('pointermove', (e) => {
      const k = this.keo; if (!k) return;
      const [x, y] = this.diemLogic(e); k.x = x; k.y = y;
      if (!k.dang && Math.hypot(x - k.x0, y - k.y0) > 7) {
        if (k.T.st.bang > 0) { FX.chu1(x, y - 20, TEXT.fx.frozen, '#7fdcff', 12); this.keo = null; return; }
        k.dang = true; $('#tt').hidden = true; this.xemHT = null;
      }
    });
    const het = (e) => {
      const k = this.keo; this.keo = null; if (!k) return;
      if (this.xemHT && this.xemHT.giu) { this.xemHT.giu = false; this.xemHT.het = performance.now() + 2400; }
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
        else { const c = B.o[D.o]; FX.chu1(c.x, c.y - 22, k.T.sao !== D.sao ? TEXT.fx.diffStar : TEXT.fx.diffType, '#ff9a9a', 12); }
      }
    };
    cv.addEventListener('pointerup', het); cv.addEventListener('pointercancel', () => { this.keo = null; if (this.xemHT) { this.xemHT.giu = false; this.xemHT.het = performance.now() + 600; } });
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
