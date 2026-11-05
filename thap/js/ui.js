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
    this.docDebug();
    REN.init($('#cv')); // đặt khung + canvas NGAY (không đợi roster) — F5 Safari: fetch treo từng để #wrap lệch, màn đen
    let r = null;
    try { // tối đa 4 s (Safari đôi khi treo fetch lúc nạp lại trang) → dùng bản nhúng meta.js
      const ac = typeof AbortController !== 'undefined' ? new AbortController() : null, hen = ac && setTimeout(() => ac.abort(), 4000);
      const res = await fetch('assets/roster.json', { cache: 'no-cache', signal: ac ? ac.signal : undefined }); if (res.ok) r = await res.json(); clearTimeout(hen);
    } catch (e) { }
    G.roster = applyText(r || window.ROSTER_EMBED || []);
    SND.nutNhan(); // nhãn nút NHẠC/SFX theo trạng thái đã lưu
    document.querySelectorAll('[data-t]').forEach(e => { const v = TEXT.ui[e.dataset.t]; if (typeof v === 'string') e.innerHTML = v; });
    G.rosterMap = {}; for (const x of G.roster) G.rosterMap[x.id] = x;
    try { const l = JSON.parse(localStorage.getItem('turret_bo') || 'null'); if (l && l.chon) { this.chon = l.chon.filter(id => SKILLS[id] && G.rosterMap[id]); this.mv = MAVUONG[l.mv] ? l.mv : 'hero'; this.che = l.che || 'solo'; } } catch (e) { }
    this.veChon();
    document.addEventListener('click', (e) => this.bam(e));
    this.ganCham();
    TAI.napMenu(); // màn tải: mọi ảnh của menu (logo, nền, thẻ, phi công, khung) + ảnh nền trận cố định — thanh tiến độ thật
    // vòng lặp: mô phỏng bước cố định (BUOC) + bộ tích luỹ; vẽ NỘI SUY giữa 2 trạng thái → mượt ở mọi tần số màn hình.
    // Tăng tốc 2×/3× = nhiều bước hơn mỗi khung (cùng BUOC nhỏ). Sau khi chuyển tab: kẹp thời gian bù.
    let tr = -1, tichLuy = 0, alpha = 1;
    const vong = (n) => {
      if (tr < 0) tr = n;
      let thuc = (n - tr) / 1000; tr = n;
      if (!(thuc > 0)) thuc = 0; else if (thuc > 0.1) thuc = 0.1;
      if (!G.dung && !TAI.cho && G.ban.length) { // TAI.cho: đang tải ảnh của trận → đứng yên dưới màn tải
        const k = G.tocDo || 1, toiDa = Math.ceil(k * 0.1 / BUOC) + 1;
        tichLuy += thuc * k;
        let so = 0;
        while (tichLuy >= BUOC && so < toiDa) { chupTruoc(); capNhat(BUOC); tichLuy -= BUOC; so++; }
        if (tichLuy >= BUOC) tichLuy = BUOC * 0.999; // máy quá chậm: bỏ phần nợ, không "xoáy chết"
        alpha = tichLuy / BUOC;
        FX.giam = k > 1 ? 1 / Math.sqrt(k) : 1;
        FX.capNhat(thuc * (k > 1 ? Math.sqrt(k) : 1)); // hiệu ứng theo thời gian thực (nhanh lên êm khi tăng tốc)
      }
      if (!TAI.cho) REN.ve(G.dung ? 0 : thuc, alpha); // đang tải: không vẽ (không bao giờ lộ hình thiếu ảnh)
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
    if (q.get('seed')) d.seed = +q.get('seed'); // PVP: hạt giống wave
    if (q.get('fill')) d.fill = +q.get('fill');
    if (q.get('auto')) d.auto = true;
    if (q.get('af')) d.af = q.get('af');
    if (q.get('speed')) G.tocDo = +q.get('speed');
    if (q.get('dpr')) d.dpr = +q.get('dpr'); // kiểm thử: ép độ phân giải vẽ
    if (q.get('log')) d.log = true; // in bộ đếm bộ nhớ canvas (REN.boNho) mỗi 10 s
    if (q.get('ios')) REN.laIOS = true; // giả lập giới hạn bộ nhớ iOS (nền ≤ 2×, ngân sách đệm nhỏ)
    if (q.get('hongkhay')) d.hongKhay = +q.get('hongkhay'); // kiểm thử: N lần tải khay.png đầu tiên giả lỗi
  },

  // ---------- màn chọn bộ bài ----------
  veChon() {
    const luoi = $('#chon-luoi'); luoi.innerHTML = '';
    const ds = G.roster.slice();
    if (this.xep === 'ten') ds.sort((a, b) => (SKILLS[b.id] ? 1 : 0) - (SKILLS[a.id] ? 1 : 0) || a.ten.localeCompare(b.ten, 'en'));
    let nhom = this.xep === 'bac' ? TIER_LIST.map(t => [t, ds.filter(r => r.bac === t)]) : [[null, ds]];
    if (this.xep === 'ho') { // SORT: FAMILY — mỗi họ 1 nhóm, trong họ xếp Trắng → Đỏ
      nhom = HO_THU_TU.map(k => ['ho:' + k, ds.filter(r => HO_CUA[r.id] && HO_CUA[r.id].ho === k).sort((a, b) => TIERS[a.bac].thuTu - TIERS[b.bac].thuTu)]);
      const le = ds.filter(r => !HO_CUA[r.id]); if (le.length) nhom.push([null, le]);
    }
    for (const [bac, rs] of nhom) {
      if (bac && bac.startsWith('ho:')) {
        const F = HO[bac.slice(3)], h = document.createElement('div'); h.className = 'nhom'; h.style.setProperty('--m', F.mau);
        h.innerHTML = '<img class="nh-i" src="assets/h2_ngoc.png" alt=""><b>' + F.ten + '</b><span>' + F.bac.map((x, i) => '<img class="nh-ngoc' + (x.length ? '' : ' gap') + '" src="assets/ngoc_' + TIER_LIST[i] + '.png" alt="">').join('') + ' ' + F.bac.filter(x => x.length).length + '/5 tiers</span>';
        luoi.appendChild(h);
      } else if (bac) {
        const h = document.createElement('div'); h.className = 'nhom'; h.style.setProperty('--m', TIERS[bac].mau);
        const co = rs.filter(r => SKILLS[r.id]).length;
        h.innerHTML = '<img class="nh-i" src="assets/ngoc_' + bac + '.png" alt=""><b>' + TIERS[bac].ten + '</b><span>' + co + '/' + rs.length + ' ' + TEXT.ui.playable + (bac === 'do' ? ' · ' + TEXT.ui.maxOneMythic : '') + '</span>';
        luoi.appendChild(h);
      }
      const g = document.createElement('div'); g.className = 'luoi';
      for (const r of rs) g.appendChild(this.theChon(r));
      luoi.appendChild(g);
    }
    $('#nut-xep').textContent = this.xep === 'bac' ? TEXT.ui.sortTier : this.xep === 'ho' ? TEXT.ui.sortFamily : TEXT.ui.sortName;
    const mv = $('#chon-mv'); mv.innerHTML = '';
    for (const [id, d] of Object.entries(MAVUONG)) {
      const b = document.createElement('button'); b.className = 'mv' + (this.mv === id ? ' chon' : ''); b.dataset.act = 'mv-chon'; b.dataset.id = id;
      b.style.setProperty('--mm', d.mau);
      b.innerHTML = mvArt(id) + '<div><b>' + d.ten + '</b><span>' + d.mo + '</span></div>';
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
  nhac(s) { const c = $('#chon-goi-nhac') || (() => { const d = document.createElement('div'); d.id = 'chon-goi-nhac'; d.style.cssText = 'position:absolute;left:50%;top:120px;transform:translateX(-50%);z-index:20;padding:8px 22px;border:0 solid transparent;border-image:url(assets/h2_tam_do.png) 30 44 fill / 10px 18px stretch;text-shadow:0 1px 0 #000;font-weight:900;font-size:13px;white-space:nowrap;text-align:center;pointer-events:none;transition:opacity .4s'; document.getElementById('wrap').appendChild(d); return d; })(); c.textContent = s; c.style.opacity = 1; clearTimeout(this._nh); this._nh = setTimeout(() => c.style.opacity = 0, 1300); },

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
        '<span class="lv">LV1</span><span class="gia"><img src="assets/ui_nangcap.png" alt=""><b>100</b></span>';
      bo.appendChild(d);
    }
    // dải đoạn tới trùm: 1 ô / wave trong chu kỳ, ô cuối = trùm
    const seg = $('#tb-seg'); if (seg) { seg.innerHTML = ''; for (let i = 1; i <= LUAT.songTrum; i++) { const c = document.createElement('i'); if (i === LUAT.songTrum) c.className = 'boss'; seg.appendChild(c); } this._segW = -1; }
    const mv = MAVUONG[B.mv.id];
    $('#the-mv .mv-ic').innerHTML = mvArt(B.mv.id); $('#the-mv').style.setProperty('--mm', mv.mau); $('#the-mv .mv-ten').textContent = mv.ten; fitText($('#the-mv .mv-ten'), 12, 8);
    // nạp trước ảnh của mọi ụ trong các bộ bài + quái/trùm/hiệu ứng
    const ds = ['de_chung', 'sup_ring', 'sup_link', 'sup_link_vang', 'sup_khung', 'sup_radar', 'sup_chimang', 'sup_lanhgia', 'sup_khuech', 'sup_tuthan', 'sup_mana', 'sup_khien', 'sup_taylo', 'phu_bang', 'phu_da', 'phu_lua', 'phu_ngam', 'dan_phao', 'dan_bang', 'dan_lien', 'dan_doc', 'dan_tia', 'tia_laser', 'tia_set',
      'fx_no_phao', 'fx_bang_vo', 'fx_dien', 'fx_khoi_doc', 'fx_chop_nong', 'fx_laser_trung', 'mimic_nong'];
    ds.push('khung_chon', 'h2_vong_do', 'nhan_kn', 'h2_vfx_ghep'); // kéo ghép (keoghep.js)
    ds.push('fx_summon', 'fx_merge', 'fx_starup', 'fx_evolve', 'fx_link', 'fx_bingo', 'fx_awaken');
    for (const b of G.ban) if (b.mv && MAVUONG[b.mv.id]) ds.push(MAVUONG[b.mv.id].anh); // chân dung chỉ huy (cut-in) — chỉ chỉ huy đang ra trận
    for (const b of G.ban) for (const id of b.deck) { ds.push(id + '_nong', 'nho/' + id); if (laGrow(id) && STAGE_K[id]) ds.push(id + '_nong_s1', id + '_nong_s2', id + '_nong_s3'); }
    for (const b of G.ban) for (const id of b.deck) ds.push('glyph/' + id); // biểu tượng nhận diện (ảnh ChatGPT, bóng trắng)
    // ảnh ChatGPT thay hình vẽ code trên canvas: huy hiệu sao, ngọc độ hiếm, icon buff, lõi hư, mũi tên đường, bảng tên bàn
    ds.push('tier_ring_trang', 'tier_ring_xanh', 'tier_ring_tim', 'tier_ring_vang', 'tier_ring_do', 'sao_hex', 'sao_hex7', 'ngoc_trang', 'ngoc_xanh', 'ngoc_tim', 'ngoc_vang', 'ngoc_do', 'loi_hu1', 'loi_hu2', 'duong_mui', 'hud_ten_ban', 'fx_vong_lv', 'vong_xich', 'fx_vong_trieu', 'hat_tuyet', 'pandora_dia', 'hu_hoden', 'hu_khoa', 'hu_luoicua', 'hu_manhguong', 'hu_trangkhuyet', 'hu_min', 'hu_cauvong',
      'ic_toc', 'ic_dmg', 'ic_crit', 'ic_cham', 'ic_chet', 'ic_mana', 'ic_khien', 'ic_taylo', 'ic_sao', 'ic_bom', 'ic_truyna');
    if (typeof BVX !== 'undefined') ds.push(...BVX.ANH); // hào quang buff (buffvfx.js)
    for (const q of Object.keys(QUAI)) ds.push('quai_' + (QUAI[q].anh || q));
    for (const t of TRUM_THU_TU) ds.push('trum_' + t);
    if (typeof QUAI8 !== 'undefined') { for (const q of QUAI8) ds.push('quai_' + q + '_8'); for (const t of TRUM8) ds.push('trum_' + t + '_8'); } // dải 8 khung mượt
    if (REN.dsHuong) ds.push(...REN.dsHuong()); // dải hướng nhìn ngang/sau (quaianim.js, Pass 5)
    if (typeof FXU !== 'undefined') { ds.push(...FXU.dsAnh(G.ban)); FXU.donMau(); } // hiệu ứng đánh v2 của các ụ trong bộ bài (fxu.js)
    REN.chiGiu(ds); // bỏ ảnh/bộ đệm của bộ bài trận trước
    TAI.tran(REN.boLuoi ? REN.boLuoi(ds) : ds); // màn tải trận: đợi ảnh giải mã xong (img.decode) rồi mới chạy — trừ ảnh tình huống (REN.LUOI: tải khi vẽ lần đầu)
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
      // (bỏ số đếm '×n ụ trên bàn' dưới thẻ — DCDW không hiện, người chơi tưởng là số sao / bộ đếm của kỹ năng)
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
    const seg = $('#tb-seg');
    if (seg) {
      if (seg.hidden !== !!trum) seg.hidden = !!trum;
      const vt = ((Math.max(1, G.wave) - 1) % LUAT.songTrum) + 1; // vị trí wave hiện tại trong chu kỳ 1..10
      if (vt !== this._segW) { this._segW = vt; [...seg.children].forEach((c, i) => { c.classList.toggle('on', i + 1 < vt); c.classList.toggle('cur', i + 1 === vt); }); }
    }
    if (trum) { chu($('#tb-trum-chu'), TRUM[trum.trum].ten); if (tm.hidden) tm.hidden = false; cao($('#tb-trum-mau i'), 'width', (Math.round(trum.hp / trum.max * 400) / 4) + '%'); }
    else { if (!tm.hidden) tm.hidden = true; const con = LUAT.songTrum - (Math.max(1, G.wave) % LUAT.songTrum); chu($('#tb-trum-chu'), con === LUAT.songTrum ? TEXT.ui.bossWave : TEXT.ui.bossIn(con)); }
    // tim
    const key = G.che + B.tim + (G.ban[1] ? G.ban[1].tim : '');
    if (key !== this._timKey) {
      this._timKey = key;
      const el = $('#tb-tim'); el.innerHTML = '';
      {
        const max = G.che === 'pvp' ? LUAT.timPvp : G.che === 'coop' ? LUAT.timCoop : LUAT.timSolo; // co-op: 3 đèn tim chung
        const mk = (n, cls) => { let s = ''; for (let i = 0; i < max; i++) s += '<i class="den' + (i < n ? '' : ' mat') + '"></i>'; return s; }; // đèn báo tim
        if (G.che === 'pvp') el.innerHTML = '<div class="doi"><div><span class="doi-thu">' + TEXT.ui.rival + '</span>' + mk(G.ban[1].tim) + '</div><div><span class="ban">' + TEXT.ui.you + '</span>' + mk(B.tim) + '</div></div>';
        else el.innerHTML = mk(B.tim);
      }
    }
    if (this.ttHet && performance.now() > this.ttHet) { $('#tt').hidden = true; this.ttHet = 0; }
  },
  bangWave(w, trum) {
    const b = $('#bang-wave');
    b.querySelector('b').textContent = TEXT.ui.wave + ' ' + w; const sp = b.querySelector('span'); sp.textContent = trum ? TEXT.ui.bossComing : (w === 1 ? TEXT.ui.wave1Hint : ''); sp.hidden = !sp.textContent;
    b.hidden = false; b.classList.remove('chay'); void b.offsetWidth; fitText(b.querySelector('b'), 32, 16); b.classList.add('chay');
    clearTimeout(this._bw); this._bw = setTimeout(() => b.hidden = true, 1700);
  },
  canhBaoTrum(id) {
    const b = $('#canh-bao');
    b.querySelector('b').textContent = TRUM[id].ten; b.querySelector('span').textContent = TRUM[id].kn + ': ' + TRUM[id].mo;
    b.hidden = false; b.classList.remove('chay'); void b.offsetWidth; fitText(b.querySelector('b'), 26, 14); b.classList.add('chay');
    SND.canhBao();
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
    tt.querySelector('.tt-so').innerHTML = this.ttChiTiet(id, T, sk, tier);
    this.xemU = T ? { T } : null; // ụ đang chọn: hieuung.js hiện dây liên kết / bingo của nó
    // trong trận: không che bàn của mình (solo: ngay dưới bàn; co-op/pvp: đè lên bàn đồng đội/đối thủ phía trên)
    const B0 = G.ban[0], tran = G.ban.length && !$('#top').hidden;
    tt.style.top = !tran ? '300px' : (G.ban.length > 1 ? '60px' : Math.round(B0.y + B0.h + 8) + 'px');
    tt.style.zIndex = $('#chon').hidden ? 8 : 12; // màn chọn: nổi trên bảng chọn
    tt.hidden = false;
    fitText(tt.querySelector('.tt-ten'), 18, 12);
    this.ttHet = performance.now() + (giu ? 3600 : 3200);
  },

  // bảng thông tin chỉ huy (Ma vương): chân dung + kỹ năng + giá/hồi chiêu
  moTTMV(id) {
    const d = MAVUONG[id]; if (!d) return;
    const tt = $('#tt'), B = G.ban[0], an = tt.querySelector('.tt-anh');
    tt.style.setProperty('--m', d.mau);
    an.onerror = () => { an.onerror = null; an.src = mvIcURL(id); };
    an.src = 'assets/' + d.anh + '.png';
    tt.querySelector('.tt-ten').textContent = d.ten; tt.querySelector('.tt-ten').style.color = d.mau;
    tt.querySelector('.tt-bac').textContent = 'COMMANDER';
    tt.querySelector('.tt-phu').textContent = 'Archfiend skill · tap the button to cast';
    tt.querySelector('.tt-kn').textContent = d.mo;
    const gia = B ? B.mv.gia : d.gia, cd = B ? B.mv.cd : 0;
    tt.querySelector('.tt-so').innerHTML = '<div class="d-so">Cost ' + gia + ' mana (doubles each use) · cooldown ' + d.cd + 's' + (cd > 0 ? ' · ready in ' + Math.ceil(cd) + 's' : '') + '</div>';
    this.xemU = null;
    const tran = G.ban.length && !$('#top').hidden;
    tt.style.top = !tran ? '300px' : (G.ban.length > 1 ? '60px' : Math.round(B.y + B.h + 8) + 'px');
    tt.style.zIndex = $('#chon').hidden ? 8 : 12;
    tt.hidden = false; fitText(tt.querySelector('.tt-ten'), 18, 12);
    this.ttHet = performance.now() + 3600;
  },
  // cut-in khi dùng kỹ năng Ma vương: dải ngang (trong khung 430) ~2,2 s: trượt vào 300 ms → giữ ~1,6 s (chân dung trôi nhẹ,
  // vệt sáng quét, chữ tên kỹ năng dập từng chữ) → trượt ra 300 ms. Chỉ là lớp phủ: kỹ năng nổ ngay, trận vẫn chạy.
  // Đặt trên vùng đường/hàng ụ phía trên (không che nút triệu hồi / hàng thẻ). Chạm dải để bỏ qua.
  cutIn(id, B) {
    const d = MAVUONG[id], c = $('#cutin'); if (!d || !c) return;
    const po = c.querySelector('.ci-po');
    po.onerror = () => { po.onerror = null; po.src = mvIcURL(id); po.classList.add('fb'); };
    po.classList.remove('fb'); po.src = 'assets/' + d.anh + '.png';
    c.querySelector('.ci-ki').src = mvIcURL(id);
    const b = c.querySelector('b');
    b.textContent = ''; b.style.fontSize = '';
    [...String(d.ten)].forEach((ch, i) => { const e = document.createElement('i'); e.textContent = ch; e.style.animationDelay = (0.26 + i * 0.045).toFixed(3) + 's'; b.appendChild(e); });
    c.querySelector('span').textContent = d.mo;
    c.style.setProperty('--mm', d.mau);
    const h = 132, y = B ? B.y - 110 : 150; // phủ đường + hàng ụ trên của bàn người chơi
    c.style.top = Math.round(clamp(y, 64, H - 200 - h)) + 'px';
    c.hidden = false; c.classList.remove('chay', 'ra'); void c.offsetWidth;
    fitText(b, 34, 16); fitText(c.querySelector('span'), 12, 8);
    c.classList.add('chay');
    const TONG = 2200, RA = 300;
    clearTimeout(this._ci); clearTimeout(this._ci2);
    const ra = () => { clearTimeout(this._ci); clearTimeout(this._ci2); c.classList.add('ra'); this._ci2 = setTimeout(() => { c.hidden = true; c.classList.remove('chay', 'ra'); }, RA); };
    this._ci = setTimeout(ra, TONG - RA);
    c.onpointerdown = (e) => { e.stopPropagation(); if (!c.classList.contains('ra')) ra(); };
  },

  // dòng chi tiết bảng thông tin: chỉ số · tốc bắn · họ kỹ năng · mốc sao · grow-up
  ttChiTiet(id, T, sk, tier) {
    if (!sk) return TEXT.ui.comingSoon;
    const esc = (v) => String(v).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const L = [];
    let so = '';
    if (T) {
      so = T.sao + '★ · LV' + (G.ban[T.ban].lv[id] || 1);
      if (sk.dmg) so += ' · ' + TEXT.ui.dmg + ' ' + Math.round(dmgU(T));
      const tc = tocTT(id, T); if (tc) so += ' · ' + tc;
      if (sk.mo && !(SUP_GIA[id])) so += ' · ' + sk.mo(T); // ụ hỗ trợ: hiệu lực hiện tại nằm ở dòng ký hiệu bên dưới (đã gồm mốc sao)
      if (T.st.da) so += ' · ' + TEXT.ui.stoned;
      if (T.st.bang > 0) so += ' · ' + TEXT.ui.frozen;
      if (T.st.lua > 0) so += ' · ' + TEXT.ui.burning;
      if (sk.chuDong) so += ' · ' + (T.nap >= 1 ? TEXT.ui.readyTap : TEXT.ui.charge(Math.round(T.nap * 100)));
    } else {
      so = TEXT.ui.baseDmg(Math.round((sk.dmg || 0) * tier.hs), tier.hs);
      const tc = tocTT(id, null); if (tc) so += ' · ' + tc;
    }
    L.push('<div class="d-so">' + esc(so) + '</div>');
    if (T) {
      // ụ hỗ trợ: hiệu lực HIỆN TẠI + tầm + số ụ đang nhận + tách gốc/sao/cấp (đúng công thức)
      const h = hoTroTT(T);
      if (h) L.push('<div class="d-buff"><img src="' + REN.kyHieuURL(h.k) + '" alt=""><span><b style="color:' + BUFF[h.k].mau + '">' + esc(h.dong) + '</b> · ' + esc(h.tam) + '<br><small>' + esc(h.tach) + '</small></span></div>');
      // buff ĐANG NHẬN: tổng cuối + từng nguồn + cách cộng
      const nh = buffTongHop(T);
      if (nh.length) L.push('<div class="d-nhan">EFFECTS ON ' + esc(G.rosterMap[id].ten.toUpperCase()) + ':' + nh.map(r => '<div class="d-buff"><img src="' + REN.kyHieuURL(r.k) + '" alt=""><span><b style="color:' + BUFF[r.k].mau + '">' + BUFF[r.k].ten + (r.cach === 'charges' ? ' ×' + r.tong : r.cach === 'timed' ? '' : ' +' + (r.k === 'chet' ? (r.tong * 100).toFixed(1) : Math.round(r.tong * 100)) + '%') + '</b> <small>[' + esc(r.nguon.join(', ')) + ']' + (r.nguon.length > 1 ? ' · ' + r.cach : '') + '</small></span></div>').join('') + '</div>');
    } else if (SUP_LOAI[id] && SUP_GIA[id]) L.push('<div class="d-buff"><img src="' + REN.kyHieuURL(SUP_LOAI[id]) + '" alt=""><span>' + BUFF[SUP_LOAI[id]].ten + ' to ' + (sk.tamChu || '4 adjacent cells (N/E/S/W)') + '</span></div>');
    // (bỏ dòng chữ grow-up: người chơi tự khám phá; vòng 3 cung quanh đầu vẫn còn)
    if (false) {
      const g = GROW[id];
      let d = '<b style="color:' + g.mau + '">GROW-UP</b> ';
      if (T) { const st = g.gd(T); d += 'stage ' + st.s + '/3 <b style="color:' + g.mau + '">' + g.ten[st.s - 1] + '</b> · ' + Math.round(clamp(st.p, 0, 1) * 100) + '% · '; }
      else d += g.ten.join(' → ') + ' · ';
      L.push('<div class="d-grow">' + d + esc(g.dk) + '</div>');
    }
    // họ kỹ năng: "Family: FROST ★ Tier 1/5 → next: Ice Blade (spreads slow…)" + thang 5 bậc (ô trống = chưa có ụ)
    const h = hoTT(id);
    if (h) {
      let d = '<b style="color:' + h.mau + '">' + TEXT.ui.family + ': ' + h.ten + '</b> ★ ' + TEXT.ui.tierOf(h.bac);
      d += h.sau ? ' → ' + TEXT.ui.next + ': <b>' + esc(h.sau) + '</b>' + (h.sauMoi ? ' (' + esc(h.sauMoi) + ')' : '') : ' · ' + TEXT.ui.top;
      if (h.moi) d += ' · <i>' + esc(h.moi) + '</i>';
      L.push('<div class="d-ho">' + d + '</div>');
      L.push('<div class="d-thang">' + h.nac.map((n, i) => '<span class="' + (i + 1 === h.bac ? 'cur' : n.gap ? 'gap' : '') + '" style="--m:' + TIERS[n.bac].mau + '">' +
        (n.gap ? '—' : esc(n.ten.join('/'))) + '</span>').join('<em>›</em>') + '</div>');
    }
    // mốc sao 3★/5★/7★
    const mm = mocCua(id).map(m => '<span class="' + (T && T.sao >= m.n ? 'co' : '') + '">' + m.n + '★ ' + esc(m.ten) + '</span> ' + esc(m.mo)).join(' · ');
    L.push('<div class="d-moc">' + mm + '</div>');
    return L.join('');
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
      case 'xep': this.xep = this.xep === 'bac' ? 'ho' : this.xep === 'ho' ? 'ten' : 'bac'; this.veChon(); break;
      case 'ngaunhien': this.chon = deckNgauNhien(); SND.nut(); this.veBoChon(); break;
      case 'vao': this.vao(); break;
      case 'trieu': if (B && !G.ketThuc) { if (trieu(B)) SND.trieu(); } break;
      case 'nang': if (this._boQuaBam) { this._boQuaBam = false; break; } if (B) { if (nangCap(B, el.dataset.id)) { el.classList.remove('sang'); void el.offsetWidth; el.classList.add('sang'); } } break;
      case 'mv': if (this._boQuaMV) { this._boQuaMV = false; break; } if (B) dungMV(B); break;
      case 'tocdo': G.tocDo = G.tocDo >= 3 ? 1 : G.tocDo + 1; el.textContent = G.tocDo + '×'; break;
      case 'dung': this.huyKeo(); G.dung = true; $('#dung').hidden = false; $('#tt').hidden = true; break;
      case 'tiep': G.dung = false; $('#dung').hidden = true; break;
      case 'amthanh': SND.batTat(); SND.nut(); break;
      case 'nhac': SND.batTatNhac(); SND.nut(); break;
      case 'bo': case 'doibo':
        G.ban = []; G.quai = []; G.dung = false; SND.nhac(0);
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
  // điểm thả khi kéo = tâm đầu ụ (chạm: nằm TRÊN ngón tay ~0,6 ô để không bị che; chuột: đúng con trỏ)
  diemKeo(k) { return [k.x, k.y - (k.lech || 0)]; },
  // huỷ kéo / bỏ chọn chạm–chạm an toàn (thả ngoài, touchcancel, mất capture, tạm dừng, ẩn tab)
  huyKeo() {
    this.keo = null; this.chonGhep = null;
    if (this.xemHT) { this.xemHT.giu = false; this.xemHT.het = performance.now() + 600; }
  },
  ganCham() {
    const cv = $('#cv');
    this.chonGhep = null; // chế độ chạm–chạm: { T, t0 }
    cv.addEventListener('pointerdown', (e) => {
      if (!G.ban.length || G.ketThuc || G.dung) return;
      if (this.keo) return; // ngón thứ 2 khi đang kéo: bỏ qua (không tạo thao tác thứ 2)
      SND.mo();
      const [x, y] = this.diemLogic(e), T = this.uTai(x, y);
      if (!T) { $('#tt').hidden = true; this.xemHT = null; this.chonGhep = null; return; }
      if (laHoTro(T)) { SND.hoTro(); if (!this.xemHT || this.xemHT.T !== T || !this.xemHT.giu && this.xemHT.het < performance.now()) this.xemHT = { T, t0: performance.now(), giu: true }; else { this.xemHT.giu = true; this.xemHT.het = 0; } }
      else this.xemHT = null;
      try { cv.setPointerCapture(e.pointerId); } catch (er) { }
      const B = G.ban[0], C = Math.min(B.cw, B.ch);
      this.keo = { T, x, y, x0: x, y0: y, dang: false, id: e.pointerId, lech: e.pointerType === 'mouse' ? 0 : Math.round(C * 0.6) };
    });
    cv.addEventListener('pointermove', (e) => {
      const k = this.keo; if (!k || e.pointerId !== k.id) return;
      const [x, y] = this.diemLogic(e); k.x = x; k.y = y;
      if (!k.dang && Math.hypot(x - k.x0, y - k.y0) > 7) {
        if (k.T.st.bang > 0) { FX.chu1(x, y - 20, TEXT.fx.frozen, '#7fdcff', 12); this.keo = null; return; }
        k.dang = true; $('#tt').hidden = true; this.xemHT = null; this.chonGhep = null;
      }
    });
    const het = (e) => {
      const k = this.keo; if (!k || (e && e.pointerId !== k.id)) return;
      this.keo = null;
      if (this.xemHT && this.xemHT.giu) { this.xemHT.giu = false; this.xemHT.het = performance.now() + 2400; }
      const B = G.ban[0];
      if (!B || G.ketThuc || G.dung || B.t[k.T.o] !== k.T) { this.chonGhep = null; return; }
      if (!k.dang) {
        // chạm–chạm: đã chọn 1 ụ → chạm ô đang sáng = ghép; chạm lại chính nó = bỏ chọn
        const c = this.chonGhep && typeof KG !== 'undefined' ? KG.nguon() : null;
        if (c && c !== k.T && hopLeGhep(c, k.T)) { this.chonGhep = null; $('#tt').hidden = true; ghep(B, c, k.T); return; }
        if (c && c === k.T) { this.chonGhep = null; $('#tt').hidden = true; return; }
        this.chonGhep = null;
        const sk = SKILLS[k.T.id];
        if (sk.chuDong && k.T.nap >= 1 && !k.T.st.bang && !k.T.st.da) { sk.chuDong(G, B, k.T); return; } // ụ ĐỎ: chạm khi nạp đầy = dùng kỹ năng chủ động
        this.moTT(k.T.id, k.T);
        if (!k.T.st.bang && B.t.some(N => N && N !== k.T && hopLeGhep(k.T, N))) this.chonGhep = { T: k.T, t0: performance.now() };
        return;
      }
      // kéo: chỉ ghép khi thả đúng lên ô HỢP LỆ; mọi chỗ khác = huỷ (không ghép)
      const [hx, hy] = this.diemKeo(k), D = this.uTai(hx, hy);
      if (D && D !== k.T) {
        if (hopLeGhep(k.T, D)) ghep(B, k.T, D);
        else { const c = B.o[D.o]; FX.chu1(c.x, c.y - 22, k.T.sao !== D.sao ? TEXT.fx.diffStar : TEXT.fx.diffType, '#ff9a9a', 12); }
      }
    };
    cv.addEventListener('pointerup', het);
    cv.addEventListener('pointercancel', (e) => { if (!this.keo || e.pointerId === this.keo.id) this.huyKeo(); });
    cv.addEventListener('lostpointercapture', (e) => { if (this.keo && e.pointerId === this.keo.id) setTimeout(() => { if (this.keo && this.keo.id === e.pointerId) this.huyKeo(); }, 0); });
    cv.addEventListener('touchcancel', () => this.huyKeo());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.huyKeo(); });
    addEventListener('blur', () => { if (this.keo) this.huyKeo(); });
    // giữ thẻ ở hàng dưới → bảng thông tin (không nâng cấp)
    const bo = $('#bo-the');
    bo.addEventListener('pointerdown', (e) => { const d = e.target.closest('.the'); if (!d) return; clearTimeout(this.giu); this.giu = setTimeout(() => { this._boQuaBam = true; this.moTT(d.dataset.id, null, true); }, 480); });
    // giữ nút Ma vương → bảng thông tin chỉ huy (chạm nhanh = dùng kỹ năng)
    const nm = $('#the-mv');
    nm.addEventListener('pointerdown', () => { clearTimeout(this.giu); this._boQuaMV = false; this.giu = setTimeout(() => { this._boQuaMV = true; this.moTTMV(G.ban[0] && G.ban[0].mv.id); }, 480); });
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) nm.addEventListener(ev, () => clearTimeout(this.giu));
    const huy = () => clearTimeout(this.giu);
    bo.addEventListener('pointerup', huy); bo.addEventListener('pointerleave', huy); bo.addEventListener('pointercancel', huy);
    // nút SUMMON: nắp phím lún xuống ngay khi chạm (iOS không tự bật :active) — chỉ chuyển động khi người chơi bấm
    const nt = $('#nut-trieu');
    nt.addEventListener('pointerdown', () => nt.classList.add('an'));
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) nt.addEventListener(ev, () => nt.classList.remove('an'));
    // giữ thẻ ở màn chọn → thông tin
    const luoi = $('#chon-luoi');
    luoi.addEventListener('contextmenu', (e) => e.preventDefault());
  },
};

// đợi phông → canvas không bao giờ vẽ bằng phông dự phòng; VÀ đợi mọi <script> phía sau (glyph.js, nhandien.js, …) chạy xong:
// trước đây khi phông đã có trong bộ đệm, UI.init chạy giữa lúc các file sau còn đang tải → vòng vẽ gọi ND.* →
// 'ReferenceError: ND is not defined' → đường đi rơi về bản vẽ dự phòng xám phẳng.
Promise.all([FONT.ready, new Promise(ok => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', ok, { once: true }) : ok())]).then(() => UI.init());

// ★ trong chữ DOM → ảnh ngôi sao ChatGPT (sao_chu.png, raw_p4_ui_1) — QUY-TAC-HINH §1: không dùng ký tự để giả icon (rà soát vẽ tay, pass 4 UI).
//  Bọc mọi nút chữ có '★' trong #wrap (menu, trang ụ/chỉ huy, bảng thông tin, kết quả, hướng dẫn…); alt="★" giữ nghĩa khi sao chép/đọc màn hình.
(() => {
  const SAO = 'assets/sao_chu.png', BO = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'OPTION', 'TITLE']);
  const doi = (t) => {
    const p = t.parentNode; if (!p || BO.has(p.nodeName) || p.closest('svg')) return;
    const ph = t.nodeValue.split('★'); if (ph.length < 2) return;
    const f = document.createDocumentFragment();
    ph.forEach((x, i) => { if (i) { const im = document.createElement('img'); im.className = 'sao-chu'; im.src = SAO; im.alt = '★'; f.appendChild(im); } if (x) f.appendChild(document.createTextNode(x)); });
    p.replaceChild(f, t);
  };
  const quet = (n) => {
    if (n.nodeType === 3) { if (n.nodeValue.indexOf('★') >= 0) doi(n); return; }
    if (n.nodeType !== 1 || BO.has(n.nodeName) || n.textContent.indexOf('★') < 0) return;
    const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT), ds = [];
    while (w.nextNode()) if (w.currentNode.nodeValue.indexOf('★') >= 0) ds.push(w.currentNode);
    ds.forEach(doi);
  };
  const bat = () => {
    const wrap = document.getElementById('wrap'); if (!wrap) return;
    quet(wrap);
    new MutationObserver((ms) => { for (const m of ms) { if (m.type === 'characterData') quet(m.target); else m.addedNodes.forEach(quet); } })
      .observe(wrap, { childList: true, characterData: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bat); else bat();
})();
