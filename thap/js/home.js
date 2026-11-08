// TURRET MERGE — HUD mượt A (TU-VAN-HUD-MUOT.txt §3A HOME + §3B DECK BUILDER + §4 chuyển động).
//  #chon = MENU (mọi file khác vẫn coi "#chon hiện" = đang ở menu). Bên trong 2 màn:
//   · .hm HOME: hồ sơ + kỷ lục, logo, ảnh lớn (chỉ huy đang dùng), chọn CHẾ ĐỘ (1 bảng: SOLO / CO-OP / PVP / ONLINE), nút PLAY, DECK / COLLECTION.
//   · .dk XÂY BỘ BÀI: BACK + tiêu đề + PRESETS; 5 ô + ô chỉ huy thứ 6 (chạm = chọn chỉ huy); tìm + FILTER; lưới 3 cột; PLAY dính đáy.
//  Bảng trượt dưới (#hm-mo): chế độ · cài đặt (nhạc/SFX/âm lượng, hồ sơ, hướng dẫn) · bộ mẫu (presets) · bộ lọc (vai trò/độ hiếm/sắp xếp)
//   · chỉ huy · XEM NHANH thẻ (ADD/REMOVE + DETAILS → trang ụ). Chỉ dời chỗ — không bỏ tính năng nào.
//  Hình: chỉ ảnh ChatGPT có sẵn (QUY-TAC-HINH.md); ảnh Pass 7 (raw_p7_*) chờ gen — xem đầu css/hudmuot-a.css.
'use strict';
const HM = {
  KEY: 'turret_hm',
  CHE: {
    // mo: 1 câu cho bảng GAME MODE (tư vấn C §B6) — nói rõ 4 chế độ khác nhau thế nào (CO-OP/PVP trên máy = bạn máy; ONLINE = phòng bạn bè qua mã)
    solo: { ten: 'SOLO', ic: 'ic_solo', phu: () => TEXT.ui.soloSub, mo: 'Just you · 1 board · 3 lives' },
    coop: { ten: 'CO-OP', ic: 'ic_coop', phu: () => TEXT.ui.coopSub, mo: 'Team up with an AI ally · 3 shared lives' },
    pvp: { ten: 'PVP', ic: 'ic_pvp', phu: () => TEXT.ui.pvpSub, mo: 'Outlast an AI rival on the same waves' },
    online: { ten: 'ONLINE', ic: 'ic_coop', phu: () => 'Co-op with a friend', mo: 'Friend room · join with a 4-letter code' },
  },
  ICHE: {}, // ảnh biểu tượng chế độ riêng (E32, khi có) — trống = dùng ic_solo/ic_coop/ic_pvp
  che: 'solo', bac: 'all', armed: -1, noi: null, bst: false, sheet: null,
  giam: () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  esc: (v) => String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
  doc() { try { const l = JSON.parse(localStorage.getItem(this.KEY) || 'null'); if (l) { if (this.CHE[l.che]) this.che = l.che; if (l.bac === 'all' || (typeof TIERS !== 'undefined' && typeof l.bac === 'string' && TIERS[l.bac])) this.bac = l.bac; } } catch (e) { } },
  luu() { try { localStorage.setItem(this.KEY, JSON.stringify({ che: this.che, bac: this.bac })); } catch (e) { } },
  luuBo() { try { localStorage.setItem('turret_bo', JSON.stringify({ chon: UI.chon, mv: UI.mv, che: UI.che })); } catch (e) { } },
  el: (id) => document.getElementById(id),

  // ---------- chuyển màn HOME ↔ DECK ----------
  di(xem, bst) {
    const c = this.el('chon'); if (!c) return;
    this.dong(true); this.armed = -1;
    const toi = xem === 'dk';
    this.bst = toi && !!bst;
    c.classList.toggle('bst', this.bst);
    if (c.classList.contains('xem-dk') !== toi) {
      c.classList.toggle('xem-dk', toi); c.classList.toggle('xem-hm', !toi);
      if (toi && !this.giam()) { // các thẻ đầu lưới vào lần lượt 20 ms/thẻ (tối đa 100 ms)
        const ds = [...document.querySelectorAll('#chon-luoi .c:not([hidden])')].slice(0, 6);
        ds.forEach((x, i) => { x.style.animationDelay = Math.min(100, i * 20) + 'ms'; x.classList.remove('hm-vao'); void x.offsetWidth; x.classList.add('hm-vao'); });
        setTimeout(() => ds.forEach(x => { x.classList.remove('hm-vao'); x.style.animationDelay = ''; }), 520);
      }
    }
    this.el('dk-tde').textContent = this.bst ? 'COLLECTION' : 'BUILD DECK';
    if (toi) { const l = this.el('chon-luoi'); if (l && this._cuonVe !== xem) l.scrollTop = 0; }
    this._cuonVe = xem;
    this.ve();
    // trang ụ mở sẵn Test range khi ở màn bộ bài (unitpage.js đợi #chon hiện)
  },
  ve() { this.veHome(); this.veDeck(); },

  veHome() {
    const m = this.CHE[this.che];
    this.el('hm-che-ic').src = (typeof anhUrl === 'function' ? anhUrl(m.ic) : 'assets/' + m.ic + '.png');
    this.el('hm-che-ten').textContent = m.ten;
    const n = UI.chon.length;
    this.el('hm-choi-phu').textContent = n === 5 ? m.phu() : 'Choose ' + (5 - n) + ' more turret' + (5 - n > 1 ? 's' : '');
    this.el('hm-choi').classList.toggle('thieu', n !== 5); // tư vấn C §B1: ảnh nút tắt khi bộ bài chưa đủ (chạm vẫn mở màn bộ bài)
    this.el('hm-deck-so').textContent = n + '/5';
    this.el('hm-deck-u').innerHTML = UI.chon.map(id => '<img src="' + iconOf(id) + '" alt="">').join('');
    let co = 0; for (const r of G.roster || []) if (SKILLS[r.id]) co++;
    this.el('hm-bst-so').textContent = co + ' TURRETS';
    const an = this.el('hm-anh'), d = MAVUONG[UI.mv] || MAVUONG.hero;
    const src = 'assets/hero/home_' + d.anh + '.webp'; if (an.getAttribute('src') !== src) { an.onerror = () => { an.onerror = null; an.src = 'assets/' + d.anh + '.png'; }; an.src = src; } // ảnh nét 1260 px (3× 420 css)
    try { this.el('hm-best').textContent = (typeof TK !== 'undefined' && TK.ho) ? TK.ho.bestWave || 0 : 0; } catch (e) { }
  },

  veDeck() {
    const m = this.CHE[this.che], n = UI.chon.length;
    const nv = this.el('nut-vao'); if (nv) nv.disabled = n !== 5;
    this.el('dk-choi-phu').textContent = n === 5 ? m.ten + ' · ' + m.phu() : (5 - n) + ' more to go';
    // ô đang chờ đổi
    document.querySelectorAll('#chon-bo .o-bo').forEach((o, i) => o.classList.toggle('hm-armed', i === this.armed));
    // chỉ huy = ô thứ 6 cuối hàng bộ bài (khung chỉ huy the_khung_mv + chân dung + biểu tượng kỹ năng); chạm = bảng chọn chỉ huy.
    //  (dải "ụ nổi bật" + hàng chỉ huy riêng đã bỏ — người dùng: không cần; chạm thẻ/ô đã mở trang chi tiết)
    this.veMV6();
    // số bộ lọc đang bật
    const so = (BOBAI.loc.vai !== 'all' ? 1 : 0) + (this.bac !== 'all' ? 1 : 0) + (UI.xep !== 'bac' ? 1 : 0), b = this.el('dk-loc-so');
    if (b) { b.hidden = !so; b.textContent = so; }
  },

  veMV6() {
    const b = this.el('chon-bo'); if (!b) return;
    let o = b.querySelector(':scope > .o-mv');
    if (!o) { o = document.createElement('button'); o.className = 'o-mv'; o.dataset.act = 'hm-mv6'; }
    o.dataset.slot = 'mv'; // hợp đồng kéo-thả: ô chỉ huy (dkkeo.js không nhận ụ vào đây)
    if (o !== b.lastElementChild) b.appendChild(o);
    const d = MAVUONG[UI.mv] || MAVUONG.hero;
    o.setAttribute('aria-label', 'Commander: ' + d.ten + ' (tap to change)');
    o.style.setProperty('--mm', d.mau);
    if (o.dataset.mv === UI.mv) return;
    o.dataset.mv = UI.mv;
    const kh = (typeof KHUNG !== 'undefined') ? KHUNG.url(typeof mvBac === 'function' ? mvBac(UI.mv) : 'mv') : 'assets/the_khung_mv.webp?v=0aae27e6'; // khung theo bậc chỉ huy (08/11)
    const sa = typeof srcTai === 'function' ? srcTai() : 'src';
    o.innerHTML = '<span class="o-mv-po"><img class="po" ' + sa + '="' + (typeof anhUrl === 'function' ? anhUrl(d.anh) : 'assets/' + d.anh + '.png') + '" alt="" draggable="false" onerror="this.onerror=null;this.src=\'' + mvIcURL(UI.mv) + '\'"></span>' +
      '<img class="o-mv-kh" ' + sa + '="' + kh + '" alt="" draggable="false"><img class="o-mv-ki" ' + sa + '="' + mvIcURL(UI.mv) + '" alt="" draggable="false">';
  },

  // ---------- bảng trượt ----------
  mo(loai, html) {
    const mo = this.el('hm-mo'), tam = this.el('hm-tam');
    tam.className = 'hm-tam hm-tam-' + loai; tam.innerHTML = '<i class="hm-keo"></i>' + html;
    this.sheet = loai;
    mo.hidden = false; mo.classList.remove('ra'); void mo.offsetWidth; mo.classList.add('vao');
  },
  dong(ngay) {
    const mo = this.el('hm-mo'); if (!mo || mo.hidden) { this.sheet = null; return; }
    this.sheet = null;
    if (ngay || this.giam()) { mo.hidden = true; mo.classList.remove('vao', 'ra'); return; }
    mo.classList.remove('vao'); mo.classList.add('ra');
    clearTimeout(this._dg); this._dg = setTimeout(() => { if (!this.sheet) { mo.hidden = true; mo.classList.remove('ra'); } }, 200);
  },
  dau(t, phu) { return '<div class="hm-tam-dau"><b>' + t + '</b>' + (phu ? '<small>' + phu + '</small>' : '') + '<button class="hm-ic hm-ic1 hm-dong" data-act="hm-dong" aria-label="Close"><img src="assets/p7_ic_dong.webp?v=14f619f0" alt=""></button></div>'; },

  moChe() {
    this.mo('che', this.dau('GAME MODE') + '<div class="hm-ds">' + Object.entries(this.CHE).map(([k, m]) =>
      '<button class="hm-hang hm-chec' + (k === this.che ? ' on' : '') + '" data-act="hm-che-chon" data-che="' + k + '" aria-pressed="' + (k === this.che) + '"><img src="' + (typeof anhUrl === 'function' ? anhUrl((this.ICHE[k] || m.ic)) : 'assets/' + (this.ICHE[k] || m.ic) + '.png') + '" alt=""><span><b>' + m.ten + '</b><small>' + this.esc(m.mo || m.phu()) + '</small></span>' + (k === this.che ? '<em>SELECTED</em>' : '') + '</button>').join('') + '</div>');
  },
  chonChe(k) {
    if (!this.CHE[k]) return;
    this.che = k; if (k !== 'online') UI.che = k;
    document.querySelectorAll('#chon .che').forEach(b => b.classList.toggle('chon', b.dataset.che === UI.che));
    this.luu(); this.luuBo(); SND.nut(); this.dong(); this.ve();
  },

  // tư vấn C §B5: mỗi hàng = nhãn · thanh trượt · số % · nút bật/tắt nhỏ (chữ ON/OFF theo data-t do SND.nutNhan đặt)
  moCai() {
    const am = (k, n, act) => { const v = Math.round(SND.amLuong(k) * 100); return '<div class="hm-am hm-am2"><span>' + n + '</span><input type="range" min="0" max="100" data-hmam="' + k + '" value="' + v + '" aria-label="' + n + ' volume"><output data-hmso="' + k + '">' + v + '%</output><button class="hm-nut2 hm-bat" data-act="' + act + '"></button></div>'; };
    const mo = typeof HD === 'undefined' || HD.moKhoa();
    this.mo('cai', this.dau('SETTINGS') +
      am('nhac', 'MUSIC', 'nhac') + am('sfx', 'SFX', 'amthanh') +
      '<div class="hm-cai2"><button class="hm-nut2" data-act="tk-mo">PILOT PROFILE</button><button class="hm-nut2" data-act="hd-choi">' + (mo ? 'REPLAY TUTORIAL' : 'PLAY TUTORIAL') + '</button><button class="hm-nut2 hm-cre-nut" data-act="hm-cre">CREDITS</button></div>');
    SND.nutNhan();
    this.el('hm-tam').querySelectorAll('[data-hmam]').forEach(r => {
      r.addEventListener('input', () => { SND.amLuong(r.dataset.hmam, r.value / 100); const o = this.el('hm-tam').querySelector('[data-hmso="' + r.dataset.hmam + '"]'); if (o) o.textContent = r.value + '%'; });
      r.addEventListener('change', () => { if (r.dataset.hmam === 'sfx') SND.nut(); });
    });
  },

  // GHI CÔNG (v4 âm thanh): mẫu SFX CC BY 4.0 (Oculus Audio Pack 01) bắt buộc ghi tác giả / nguồn / giấy phép — xem
  // docs/demo-hop-tuong/tuvan/am-thanh-anime/sfx/LICENSES.md + CHON.md. Dòng giấy phép giữ nguyên tiếng Anh (data-nn-giu).
  moCre() {
    this.mo('cre', this.dau('CREDITS') + '<div class="hm-cre">' +
      '<b>SOUND EFFECTS</b>' +
      '<p class="hm-cre-by" data-nn-giu>"Oculus Audio Pack 01" by Oculus VR, LLC<br>developers.meta.com/vr/downloads/package/oculus-audio-pack-1/<br>Licensed under CC BY 4.0 · creativecommons.org/licenses/by/4.0/</p>' +
      '<p>Changes: trimmed, volume-normalised and layered with other sounds.</p>' +
      '<p>Used for: breakthrough, jackpot, critical hit, button tap, back button, support pulse, victory and defeat.</p>' +
      '<p>All other sound effects are CC0 (public domain):</p>' +
      '<p class="hm-cre-by" data-nn-giu>Kenney (kenney.nl) · jaggedstone · rubberduck · starninjas · Pixel-boy / Sparklin Labs (Superpowers) · Electricity Game Sound Pack (OpenGameArt) · Wyzowl sfx-kit · AtomCut Library</p>' +
      '<p>Music and the remaining sounds are generated live in the game.</p>' +
      '</div>');
  },

  moPre() {
    const ds = BOBAI.DS.filter(a => BOBAI.hopLe(a));
    this.mo('pre', this.dau('PRESET DECKS', 'Load one, then swap cards') + '<div class="hm-ds">' + ds.map(a => {
      const dung = UI.chon.length === 5 && a.deck.every(id => UI.chon.includes(id)) && UI.mv === a.mv;
      // tư vấn C §B4: tên 15 · chế độ 11 · 5 ụ nhỏ · 1 dòng lối chơi · 1 chữ LOAD bên phải (IN USE khi đang dùng)
      return '<button class="hm-hang hm-pre' + (dung ? ' on' : '') + '" data-act="hm-pre-chon" data-bb="' + a.id + '"><span class="hm-pre-chu"><b>' + a.ten + '</b><small>' + this.esc(a.che) + '</small></span>' +
        '<em>' + (dung ? 'IN USE' : 'LOAD') + '</em>' +
        '<span class="hm-pre-u">' + (typeof OT !== 'undefined' ? OT.hang(a.deck, a.mv) : a.deck.map(id => '<img ' + (typeof srcTai === 'function' ? srcTai() : 'src') + '="' + iconOf(id) + '" alt="' + this.esc(G.rosterMap[id].ten) + '">').join('') + '<img class="mv" src="' + mvIcURL(a.mv) + '" alt="">') + '</span>' +
        '<span class="hm-pre-mo">' + this.esc(a.plan) + '</span></button>';
    }).join('') + '</div>');
  },

  moLoc() {
    const chip = (act, k, t, on) => '<button class="hm-chip' + (on ? ' on' : '') + '" data-act="' + act + '" data-k="' + k + '">' + t + '</button>';
    const dem = { all: 0, tc: 0, ht: 0, db: 0 }; for (const r of G.roster || []) { const sk = SKILLS[r.id]; if (!sk) continue; dem.all++; if (dem[sk.vai] != null) dem[sk.vai]++; }
    this.mo('loc', this.dau('FILTER & SORT') +
      '<div class="hm-loc-nh">ROLE</div><div class="hm-chips c2">' + BOBAI.VAI.map(([k, t]) => chip('hm-loc-vai', k, t + ' <small>' + dem[k] + '</small>', BOBAI.loc.vai === k)).join('') + '</div>' +
      '<div class="hm-loc-nh">RARITY</div><div class="hm-chips c3">' + chip('hm-loc-bac', 'all', 'ALL', this.bac === 'all') + TIER_LIST.map(t => chip('hm-loc-bac', t, '<img src="assets/ngoc_' + t + '.png" alt="">' + TIERS[t].ten, this.bac === t)).join('') + '</div>' +
      '<div class="hm-loc-nh">SORT</div><div class="hm-chips c3">' + [['bac', 'RARITY'], ['ho', 'FAMILY'], ['ten', 'NAME']].map(([k, t]) => chip('hm-loc-xep', k, t, UI.xep === k)).join('') + '</div>' +
      '<div class="hm-cai2"><button class="hm-nut2" data-act="hm-loc-xoa">RESET</button><button class="hm-nut2 vang" data-act="hm-dong">' + this.soLoc() + '</button></div>');
  },
  // tư vấn C §B3: nút xác nhận nói rõ kết quả ("SHOW 37 TURRETS") thay cho DONE
  soLoc() {
    const l = this.el('chon-luoi'); if (!l) return 'DONE';
    const n = [...l.querySelectorAll('.c[data-id]')].filter(c => !c.hidden && c.style.display !== 'none' && c.offsetParent !== null).length;
    return n ? 'SHOW ' + n + ' TURRET' + (n > 1 ? 'S' : '') : 'NO MATCHES';
  },
  locLai() { if (this.sheet === 'loc') { const s = this.el('hm-tam').scrollTop; this.moLoc(); this.el('hm-tam').scrollTop = s; this.el('hm-mo').classList.add('vao'); } this.veDeck(); },

  // nhãn bậc chỉ huy (chữ TEXT.tier — đã có bản Việt; màu TIERS) — 08/11
  mvBacNhan(id) { if (typeof mvBac !== 'function') return ''; const t = TIERS[mvBac(id)]; return '<i class="mv-bac" style="color:' + t.mau + '">' + this.esc(t.ten) + '</i>'; },
  moMVs() {
    this.mo('mvs', this.dau('COMMANDER', 'One skill per match, tap its card in battle') + '<div class="hm-ds">' + (typeof mvDS === 'function' ? mvDS() : Object.keys(MAVUONG)).map(id => [id, MAVUONG[id]]).map(([id, d]) =>
      // 08/11: ô chân dung tối giản viền theo BẬC chỉ huy + vương miện (OT.miniMV) + nhãn bậc màu TIERS (như trang ụ); xếp theo bậc
      '<div class="hm-hang hm-mvh' + (id === UI.mv ? ' on' : '') + '" style="--mm:' + d.mau + '" data-bac="' + (typeof mvBac === 'function' ? mvBac(id) : '') + '"><button class="hm-mvh-chon" data-act="hm-mv-chon" data-id="' + id + '"><span class="hm-mvh-po">' + (typeof OT !== 'undefined' ? OT.miniMV(id) : '<img src="' + mvIcURL(id) + '" alt="">') + '</span><span>' + this.mvBacNhan(id) + '<b>' + this.esc(d.ten) + '</b><small>' + this.esc(d.mo) + '</small></span>' + (id === UI.mv ? '<em>SELECTED</em>' : '') + '</button>' +
      '<button class="hm-ct" data-act="hm-mv-ct" data-id="' + id + '">DETAILS</button></div>').join('') + '</div>');
  },

  // XEM NHANH 1 ụ: chân dung + tên + độ hiếm/vai + 1 dòng kỹ năng + THÊM/BỎ + DETAILS (trang ụ đầy đủ)
  moXem(id, tuO) {
    const r = G.rosterMap[id]; if (!r) return;
    this.noi = id; this.veDeck();
    const t = TIERS[r.bac], sk = SKILLS[id], trong = UI.chon.includes(id);
    let nut;
    if (this.bst) nut = '';
    else if (!sk) nut = '<button class="hm-nut2" disabled>COMING SOON</button>';
    else if (trong) nut = '<button class="hm-nut2" data-act="hm-bo" data-id="' + id + '">REMOVE</button>';
    else nut = '<button class="hm-nut2 vang" data-act="hm-them" data-id="' + id + '">' + (this.armed >= 0 && UI.chon[this.armed] ? 'SWAP IN' : 'ADD TO DECK') + '</button>';
    const ghi = tuO && trong ? '<div class="hm-xem-ghi">Close this, then pick a turret below to swap this slot.</div>' : (this.armed >= 0 && !trong && !this.bst ? '<div class="hm-xem-ghi">Replaces ' + this.esc(G.rosterMap[UI.chon[this.armed]] ? G.rosterMap[UI.chon[this.armed]].ten : '') + '</div>' : '');
    this.mo('xem', '<div class="hm-xem" style="--m:' + t.mau + '"><span class="hm-xem-po"><img src="' + portraitOf(id) + '" alt=""></span>' +
      '<span class="hm-xem-chu"><b>' + this.esc(r.ten) + '</b><small><em style="color:' + t.mau + '">' + this.esc(t.ten) + '</em> · ' + this.esc(sk ? TEXT.ui.role[sk.vai] : TEXT.ui.soon) + '</small><span class="hm-xem-kn">' + this.esc(r.kyNang || '') + '</span></span></div>' +
      ghi + '<div class="hm-cai2">' + nut + '<button class="hm-nut2" data-act="hm-ct" data-id="' + id + '">DETAILS</button></div>');
    const im = this.el('hm-tam').querySelector('.hm-xem-po img'); if (typeof MAT !== 'undefined' && im) im.complete ? MAT.fit(im) : im.addEventListener('load', () => MAT.fit(im), { once: true });
  },

  // thêm (hoặc đổi vào ô đang chờ) — theo đúng luật bộ bài của UI.chonU (1 ĐỎ…)
  them(id) {
    const truoc = UI.chon.slice(), cu = this.armed >= 0 ? UI.chon[this.armed] : null;
    if (cu) {
      const i = this.armed; UI.chon.splice(i, 1);
      UI.chonU(id);
      if (UI.chon.includes(id)) { UI.chon.splice(UI.chon.indexOf(id), 1); UI.chon.splice(i, 0, id); UI.veBoChon(); }
      else { UI.chon = truoc; UI.veBoChon(); return; }
    } else {
      if (UI.chon.length >= 5) { UI.nhac('Deck full — tap a slot above to swap it'); return; }
      UI.chonU(id);
      if (!UI.chon.includes(id)) return;
    }
    this.armed = -1; this.noi = id; this.luuBo();
    const ve = () => this.bay(id); this.dong(); ve(); this.ve();
    SND.nut();
    if (UI.chon.length === 5 && truoc.length < 5) this.duBo();
  },
  bo(id) { const i = UI.chon.indexOf(id); if (i < 0) return; UI.chon.splice(i, 1); this.armed = -1; this.luuBo(); UI.veBoChon(); SND.nut(); this.dong(); this.ve(); },

  // ảnh chân dung bay từ thẻ trong lưới → ô bộ bài (260–320 ms, FAST_OUT); giảm chuyển động: chỉ sáng ô 120 ms
  bay(id) {
    const i = UI.chon.indexOf(id), o = document.querySelectorAll('#chon-bo .o-bo')[i];
    if (!o) return;
    const xung = () => { o.classList.remove('hm-xung'); void o.offsetWidth; o.classList.add('hm-xung'); setTimeout(() => o.classList.remove('hm-xung'), 300); };
    const the = document.querySelector('#chon-luoi .c[data-id="' + id + '"]:not([hidden])'), w = this.el('wrap');
    if (this.giam() || !the || !w) { xung(); return; }
    const rw = w.getBoundingClientRect(), k = rw.width / W, a = the.getBoundingClientRect(), b = o.getBoundingClientRect();
    if (a.bottom < rw.top || a.top > rw.bottom) { xung(); return; }
    const im = document.createElement('img'); im.className = 'hm-bay'; im.src = portraitOf(id);
    const s = 56, x0 = (a.left + a.width / 2 - rw.left) / k - s / 2, y0 = (a.top + a.height * 0.4 - rw.top) / k - s / 2, x1 = (b.left + b.width / 2 - rw.left) / k - s / 2, y1 = (b.top + b.height / 2 - rw.top) / k - s / 2;
    im.style.left = x0 + 'px'; im.style.top = y0 + 'px'; w.appendChild(im);
    const an = im.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + (x1 - x0) + 'px,' + (y1 - y0) + 'px) scale(.85)', opacity: 1 }], { duration: 290, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
    an.onfinish = () => { im.remove(); xung(); };
  },
  // đủ 5: vệt sáng quét dọc thanh bộ bài — đã bỏ (vệt 4 khung giật), xem css/chonthe.css
  duBo() { if (this.giam()) return; const b = this.el('chon-bo'); b.classList.remove('hm-du'); void b.offsetWidth; b.classList.add('hm-du'); setTimeout(() => b.classList.remove('hm-du'), 700); },

  choi() {
    if (UI.chon.length !== 5) {
      if (!this.el('chon').classList.contains('xem-dk') || this.bst) this.di('dk');
      UI.nhac('Pick 5 turrets'); return;
    }
    if (this.che === 'online') { if (typeof ONL !== 'undefined') ONL.moBang(); return; }
    UI.che = this.che; this.luuBo(); UI.vao();
  },

  bam(e) {
    const el = e.target.closest && e.target.closest('[data-act]');
    // vừa kéo thả (js/dkkeo.js) → nuốt cú click sinh ra khi nhả tay
    if (typeof DK !== 'undefined' && DK.vuaKeo() && e.target.closest && e.target.closest('#chon-bo, #chon-luoi')) { e.stopImmediatePropagation(); e.preventDefault(); return; }
    // ô bộ bài: chạm ô có ụ = mở trang chi tiết (nút ADD/REMOVE ở đáy); ô trống = gợi ý. Đổi/bỏ/xếp lại = kéo thả.
    const o = e.target.closest && e.target.closest('#chon-bo .o-bo');
    if (o && this.el('chon').classList.contains('xem-dk')) {
      e.stopImmediatePropagation(); e.preventDefault();
      const i = [...o.parentNode.children].indexOf(o), id = UI.chon[i];
      this.armed = -1;
      if (!id) { this.veDeck(); UI.nhac('Drag or tap a turret below'); return; }
      this.noi = id; this.veDeck();
      if (typeof UP !== 'undefined') UP.mo(id, o); return;
    }
    // thẻ trong lưới: chạm = trang chi tiết ụ (có ADD TO DECK / REMOVE); kéo thẻ lên ô = thêm/đổi (js/dkkeo.js)
    const c = e.target.closest && e.target.closest('#chon-luoi .c[data-id]');
    if (c && !(el && el.dataset.act === 'bb-thu') && !(el && /^hd-/.test(el.dataset.act))) {
      e.stopImmediatePropagation(); e.preventDefault();
      const id = c.dataset.id; this.noi = id; this.veDeck();
      if (typeof UP !== 'undefined') UP.mo(id, c); else this.moXem(id);
      return;
    }
    if (!el) return;
    const a = el.dataset.act; if (!a.startsWith('hm-')) return;
    e.stopImmediatePropagation();
    switch (a) {
      case 'hm-che': SND.nut(); this.moChe(); break;
      case 'hm-che-chon': this.chonChe(el.dataset.che); break;
      case 'hm-choi': SND.mo(); this.choi(); break;
      case 'hm-deck': SND.nut(); this.di('dk'); break;
      case 'hm-bst': SND.nut(); this.di('dk', true); break;
      case 'hm-ve': SND.nut(); this.di('hm'); break;
      case 'hm-cai': SND.nut(); this.moCai(); break;
      case 'hm-cre': SND.nut(); this.moCre(); break;
      case 'hm-pre': SND.nut(); this.moPre(); break;
      case 'hm-pre-chon': this.dong(); BOBAI.thu(el.dataset.bb); this.noi = UI.chon[0]; this.armed = -1; this.ve(); this.duBo(); break;
      case 'hm-loc': SND.nut(); this.moLoc(); break;
      case 'hm-loc-vai': BOBAI.loc.vai = el.dataset.k; BOBAI.luu(); SND.nut(); BOBAI.ap(); this.locLai(); break;
      case 'hm-loc-bac': this.bac = el.dataset.k; this.luu(); SND.nut(); BOBAI.ap(); this.locLai(); break;
      case 'hm-loc-xep': UI.xep = el.dataset.k; SND.nut(); UI.veChon(); this.locLai(); break;
      case 'hm-loc-xoa': BOBAI.loc.vai = 'all'; BOBAI.loc.q = ''; BOBAI.luu(); this.bac = 'all'; this.luu(); { const t = this.el('bb-tim'); if (t) t.value = ''; } UI.xep = 'bac'; UI.veChon(); this.locLai(); break;
      case 'hm-mv6': SND.nut(); this.moMVs(); break; // ô chỉ huy (thứ 6): chạm = bảng chọn 1 trong 3 chỉ huy, mỗi hàng có DETAILS
      case 'hm-mvs': SND.nut(); if (typeof UP !== 'undefined') UP.moMV(UI.mv, el); else this.moMVs(); break; // hàng chỉ huy: chạm = trang chi tiết (đổi chỉ huy bằng mũi tên + Use commander)
      case 'hm-mv-chon': UI.mv = el.dataset.id; this.luuBo(); SND.nut(); this.dong(); this.ve(); break;
      case 'hm-mv-ct': { const id = el.dataset.id, r = el.getBoundingClientRect(); this.dong(true); if (typeof UP !== 'undefined') UP.moMV(id, r); break; }
      case 'hm-noi': { const id = el.dataset.id; if (id && typeof UP !== 'undefined') { SND.nut(); UP.mo(id, el); } else if (!id) UI.nhac('Tap a turret below'); break; }
      case 'hm-them': this.them(el.dataset.id); break;
      case 'hm-bo': this.bo(el.dataset.id); break;
      case 'hm-ct': { const id = el.dataset.id, c2 = document.querySelector('#chon-luoi .c[data-id="' + id + '"]') || el; this.dong(true); if (typeof UP !== 'undefined') UP.mo(id, c2); break; }
      case 'hm-dong': SND.nut(); this.dong(); break;
    }
  },
};

(function () {
  if (typeof UI === 'undefined' || typeof BOBAI === 'undefined') return;
  HM.doc();
  // bấm: pha capture ở window (trước ui.js / unitpage.js / online) — chỉ nuốt nút hm-*, ô bộ bài, thẻ lưới
  window.addEventListener('click', (e) => { try { HM.bam(e); } catch (er) { console.error('HM', er); } }, true);
  // nút nhấn: lún 0.965 trong 75 ms, nhả 120 ms (iOS không tự bật :active)
  document.addEventListener('pointerdown', (e) => { const b = e.target.closest && e.target.closest('#chon button, #hm-mo button'); if (b && !b.disabled) { b.classList.add('hm-an'); const tha = () => { b.classList.remove('hm-an'); removeEventListener('pointerup', tha); removeEventListener('pointercancel', tha); }; addEventListener('pointerup', tha); addEventListener('pointercancel', tha); } }, true);
  // rời trận → HOME (QUIT); CHANGE DECK → màn bộ bài
  document.addEventListener('click', (e) => {
    const el = e.target.closest && e.target.closest('[data-act]'); if (!el) return;
    if (el.dataset.act === 'bo') HM.di('hm');
    else if (el.dataset.act === 'doibo') HM.di('dk');
  }, true);

  // lọc thêm theo ĐỘ HIẾM (bảng FILTER) sau bộ lọc vai trò / tìm kiếm của bobai.js
  const apGoc = BOBAI.ap.bind(BOBAI);
  BOBAI.ap = function () {
    apGoc();
    const luoi = document.getElementById('chon-luoi'); if (!luoi || HM.bac === 'all') return;
    let tong = 0;
    luoi.querySelectorAll('.luoi').forEach(g => {
      let n = 0;
      g.querySelectorAll('.c[data-id]').forEach(c => { if (!c.hidden && G.rosterMap[c.dataset.id].bac !== HM.bac) c.hidden = true; if (!c.hidden) n++; });
      g.hidden = !n; tong += n; const h = g.previousElementSibling; if (h && h.classList.contains('nhom')) h.hidden = !n;
    });
    let ko = document.getElementById('bb-trong');
    if (!tong) { if (!ko) { ko = document.createElement('div'); ko.id = 'bb-trong'; luoi.appendChild(ko); } ko.textContent = 'No turret matches. Open FILTER and tap RESET.'; ko.hidden = false; }
    else if (ko) ko.hidden = true;
  };
  // vẽ lại màn chọn: ô tìm dời vào hàng TÌM + FILTER; thẻ bỏ nút + nhỏ (chạm thẻ = xem nhanh)
  const veGoc = UI.veChon;
  UI.veChon = function () {
    const r = veGoc.apply(this, arguments);
    try {
      const t = document.getElementById('bb-tim'), o = document.getElementById('dk-o');
      if (t && o && t.parentNode !== o) { t.placeholder = 'Search turrets…'; o.appendChild(t); }
      document.querySelectorAll('#chon-luoi .c').forEach(c => { c.setAttribute('aria-label', (G.rosterMap[c.dataset.id] || {}).ten + ': details'); });
      if (HM.bac !== 'all') BOBAI.ap();
      HM.ve();
    } catch (e) { console.error('HM', e); }
    return r;
  };
  const boGoc = UI.veBoChon;
  UI.veBoChon = function () { const r = boGoc.apply(this, arguments); try { HM.ve(); } catch (e) { } return r; };
  // vào trận: đóng bảng trượt
  const vaoGoc = UI.vaoTran;
  UI.vaoTran = function () { HM.dong(true); return vaoGoc.apply(this, arguments); };
  // chế độ đã lưu (ONLINE nhớ riêng; SOLO/CO-OP/PVP theo UI.che của bộ đã lưu)
  const initGoc = UI.init;
  UI.init = async function () {
    const r = await initGoc.apply(this, arguments);
    if (HM.che !== 'online' && HM.CHE[UI.che]) HM.che = UI.che;
    try { HM.ve(); } catch (e) { console.error('HM', e); }
    return r;
  };
  // chip hồ sơ (Firebase) + nút ONLINE: dời vào HOME
  const sau = () => {
    if (typeof TK !== 'undefined' && TK.veChip) {
      const g = TK.veChip.bind(TK);
      // TK tạo chip trong #chon .chon-dau (màn bộ bài) → dời sang hàng hồ sơ của HOME
      TK.veChip = function () { const r = g(), c = document.getElementById('tk-chip'), o = document.getElementById('hm-tk'); if (c && o && c.parentNode !== o) o.appendChild(c); try { HM.veHome(); } catch (e) { } return r; };
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sau, { once: true }); else sau();
})();
