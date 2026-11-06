// TURRET MERGE — MÀN CHỌN BỘ BÀI (P1-01, P1-02): 6 bộ khởi đầu soạn tay (tên, 5 ụ + chỉ huy, 1 dòng lối chơi, nút TRY DECK)
// + lọc theo vai trò + ô tìm kiếm (lưu bộ lọc cuối). Khoá bộ sưu tập 85 ụ cho tới khi xong/bỏ qua hướng dẫn (huongdan.js).
// Chỉ bọc UI.veChon — không sửa ui.js. Hình: ảnh ChatGPT có sẵn (khung_tt, khung_chon, h2_chip, h2_lcd, nut_nho).
'use strict';

const BOBAI = {
  KEY: 'turret_loc',
  // 6 nguyên mẫu (theo TU-VAN-TOAN-GAME mục 2C): đơn mục tiêu, nổ lan, khống chế, kinh tế mana, combo/liên kết, hỗ trợ co-op
  DS: [ // đợt vai trò (TU-VAN-VAI-TRO mục 6C): mỗi bộ ghi rõ cơ cấu Tấn công / Hỗ trợ / Đặc biệt
    { id: 'san_trum', ten: 'BOSS HUNTER', che: 'SOLO · PVP', cc: '3A · 1 SUP · 1 SP', deck: ['sungluc', 'tia', 'nemesis', 'phagiap', 'doc'], mv: 'dahlia',
      plan: 'Breaker exposes the boss for its neighbours, Venom marks it; Sniper, Revolver and Nemesis delete it.' },
    { id: 'no_lan', ten: 'BLAST ZONE', che: 'SOLO · CO-OP', cc: '4A · 1 SP', deck: ['canon', 'mortar', 'no5', 'cuuvi', 'bomhen'], mv: 'dahlia',
      plan: 'Four splash guns clear crowds; Time Bomb weakens each pack before the shells land.' },
    { id: 'dong_bang', ten: 'DEEP FREEZE', che: 'SOLO · PVP', cc: '2A · 2 SUP · 1 SP', deck: ['kiembang', 'baotuyet', 'lanhgia', 'lophanung', 'bang'], mv: 'eve',
      plan: 'Frost freezes the lead, Chiller and Cryo Reactor keep everyone slow; Ice Blade and Blizzard punish slowed enemies.' },
    { id: 'mana', ten: 'MANA ENGINE', che: 'SOLO', cc: '3A · 2 SP', deck: ['hutmana', 'nangluong', 'laser', 'mana', 'nhanmana'], mv: 'hero',
      plan: 'Mana Core and Mana Doubler bank mana, Mana Leech adds more; Energy Cannon hits harder the more you hold.' },
    { id: 'combo', ten: 'CHAIN COMBO', che: 'SOLO · CO-OP', cc: '2A · 1 SUP · 2 SP', deck: ['lienket', 'combo', 'dongbo', 'mimic', 'nhanban'], mv: 'hero',
      plan: 'Fill the board with twins: Chain Link and Combo Core grow, Sync Cannon buffs every same-star Attack turret on the board.' },
    { id: 'ho_tro', ten: 'SHIELD WALL', che: 'CO-OP', cc: '2A · 2 SUP · 1 SP', deck: ['set', 'lien', 'radar', 'khien', 'haoquang'], mv: 'eve',
      plan: 'Tesla and Gatling carry; Radar speeds the guns next to it, Shield Gen guards them, Holy Halo saves a leak.' },
  ],
  VAI: [['all', 'ALL'], ['tc', 'ATTACK'], ['ht', 'SUPPORT'], ['db', 'SPECIAL']],
  loc: { vai: 'all', q: '' },

  doc() { try { const l = JSON.parse(localStorage.getItem(this.KEY) || 'null'); if (l && typeof l === 'object') this.loc = { vai: this.VAI.some(v => v[0] === l.vai) ? l.vai : 'all', q: typeof l.q === 'string' ? l.q.slice(0, 40) : '' }; } /* bản lưu cũ/hỏng: vai lạ → ALL (không thì lưới trống) */ catch (e) { } },
  luu() { try { localStorage.setItem(this.KEY, JSON.stringify(this.loc)); } catch (e) { } },
  hopLe(a) { return a.deck.every(id => SKILLS[id] && G.rosterMap[id]) && MAVUONG[a.mv]; },

  // thanh lọc: chip vai trò + ô tìm — đặt ngay trên lưới thẻ (ngoài vùng cuộn)
  dungLoc() {
    if (document.getElementById('bb-loc')) return;
    const luoi = document.getElementById('chon-luoi'); if (!luoi) return;
    const d = document.createElement('div'); d.id = 'bb-loc';
    const dem = { all: 0, tc: 0, ht: 0, db: 0 }; // số ụ theo vai (đợt vai trò: 40 / 18 / 27)
    for (const r of G.roster || []) { const sk = SKILLS[r.id]; if (!sk) continue; dem.all++; if (dem[sk.vai] != null) dem[sk.vai]++; }
    d.innerHTML = '<div class="bb-chip">' + this.VAI.map(([k, t]) => '<button type="button" data-bbvai="' + k + '">' + t + ' <small>' + dem[k] + '</small></button>').join('') + '</div>' +
      '<input id="bb-tim" type="search" placeholder="Search" autocomplete="off" spellcheck="false" enterkeyhint="search">';
    luoi.parentNode.insertBefore(d, luoi);
    d.addEventListener('click', (e) => { const b = e.target.closest('[data-bbvai]'); if (!b) return; e.stopPropagation(); this.loc.vai = b.dataset.bbvai; this.luu(); SND.nut(); this.ap(); });
    const o = d.querySelector('#bb-tim'); o.value = this.loc.q;
    o.addEventListener('input', () => { this.loc.q = o.value; this.luu(); this.ap(); });
  },
  // ẩn/hiện thẻ theo bộ lọc (không dựng lại lưới) — tiêu đề nhóm trống cũng ẩn
  ap() {
    const luoi = document.getElementById('chon-luoi'); if (!luoi) return;
    document.querySelectorAll('#bb-loc [data-bbvai]').forEach(b => b.classList.toggle('on', b.dataset.bbvai === this.loc.vai));
    const q = this.loc.q.trim().toLowerCase(), vai = this.loc.vai;
    let tong = 0;
    luoi.querySelectorAll('.luoi').forEach(g => {
      let n = 0;
      g.querySelectorAll('.c[data-id]').forEach(c => {
        const id = c.dataset.id, r = G.rosterMap[id], sk = SKILLS[id];
        let ok = vai === 'all' || (sk && sk.vai === vai);
        if (ok && q) { const ho = (typeof HO_CUA !== 'undefined' && HO_CUA[id] && HO[HO_CUA[id].ho]) ? HO[HO_CUA[id].ho].ten : ''; ok = [r.ten, r.ten_vi, r.kyNang, r.kyNang_vi, id, ho].some(s => s && String(s).toLowerCase().includes(q)); }
        c.hidden = !ok; if (ok) n++;
      });
      g.hidden = !n; tong += n;
      const h = g.previousElementSibling; if (h && h.classList.contains('nhom')) h.hidden = !n;
    });
    let ko = document.getElementById('bb-trong');
    if (!tong) { if (!ko) { ko = document.createElement('div'); ko.id = 'bb-trong'; luoi.appendChild(ko); } ko.textContent = 'No turret matches. Clear the search or pick ALL.'; ko.hidden = false; }
    else if (ko) ko.hidden = true;
  },

  // dải 6 bộ khởi đầu (cuộn ngang) — mục đầu tiên trong vùng cuộn
  veDai() {
    const luoi = document.getElementById('chon-luoi'); if (!luoi) return;
    const d = document.createElement('div'); d.id = 'bb-dai';
    d.innerHTML = '<div class="bb-dau"><b>STARTER DECKS</b><span>try one, then swap cards</span></div><div class="bb-hang"></div>';
    const h = d.querySelector('.bb-hang');
    for (const a of this.DS) {
      if (!this.hopLe(a)) continue;
      const dung = UI.chon.length === 5 && a.deck.every(id => UI.chon.includes(id)) && UI.mv === a.mv;
      const c = document.createElement('div'); c.className = 'bb-the' + (dung ? ' chon' : '');
      c.innerHTML = '<div class="bb-ten"><b>' + a.ten + '</b><small>' + a.che + '</small></div>' +
        '<div class="bb-u">' + a.deck.map(id => '<img ' + (typeof srcTai === 'function' ? srcTai() : 'src') + '="' + iconOf(id) + '" alt="' + G.rosterMap[id].ten + '" title="' + G.rosterMap[id].ten + '">').join('') +
        '<img class="bb-mv" src="' + mvIcURL(a.mv) + '" alt="' + MAVUONG[a.mv].ten + '" title="' + MAVUONG[a.mv].ten + '"></div>' +
        '<p>' + (a.cc ? '<b>' + a.cc + '</b> · ' : '') + a.plan + '</p>' +
        '<button type="button" class="nut-xep" data-act="bb-thu" data-bb="' + a.id + '">' + (dung ? 'IN USE' : 'TRY DECK') + '</button>';
      h.appendChild(c);
    }
    luoi.insertBefore(d, luoi.firstChild);
    if (this._cuon != null) h.scrollLeft = this._cuon;
    h.addEventListener('scroll', () => { this._cuon = h.scrollLeft; }, { passive: true });
  },
  thu(id) {
    const a = this.DS.find(x => x.id === id); if (!a || !this.hopLe(a)) return;
    UI.chon = a.deck.slice(); UI.mv = a.mv;
    try { localStorage.setItem('turret_bo', JSON.stringify({ chon: UI.chon, mv: UI.mv, che: UI.che })); } catch (e) { }
    SND.nut(); UI.veChon();
    UI.nhac(a.ten + ' loaded — tap PLAY or swap cards');
  },

  // khoá bộ sưu tập trước khi xong/bỏ qua hướng dẫn
  veKhoa() {
    const luoi = document.getElementById('chon-luoi'), mo = typeof HD === 'undefined' || HD.moKhoa();
    document.getElementById('chon').classList.toggle('hd-khoa', !mo);
    if (mo || !luoi) return;
    const k = document.createElement('div'); k.id = 'bb-khoa';
    k.innerHTML = '<b>85 TURRETS LOCKED</b><span>Finish the short tutorial (or skip it) to open the full collection. The starter decks above are ready now.</span>' +
      '<div><button type="button" class="nut-xep" data-act="hd-choi">PLAY TUTORIAL</button><button type="button" class="nut-xep" data-act="hd-boqua">SKIP TUTORIAL</button></div>';
    const dai = document.getElementById('bb-dai');
    luoi.insertBefore(k, dai ? dai.nextSibling : luoi.firstChild);
  },
};

(function () {
  BOBAI.doc();
  const veGoc = UI.veChon;
  UI.veChon = function () {
    const r = veGoc.apply(this, arguments);
    try { BOBAI.dungLoc(); BOBAI.veDai(); BOBAI.veKhoa(); BOBAI.ap(); } catch (e) { console.error('BOBAI', e); }
    return r;
  };
  // nút TRY DECK cập nhật nhãn IN USE khi bộ thay đổi
  const boGoc = UI.veBoChon;
  UI.veBoChon = function () {
    const r = boGoc.apply(this, arguments);
    try {
      document.querySelectorAll('#bb-dai .bb-the').forEach(c => {
        const b = c.querySelector('[data-bb]'), a = BOBAI.DS.find(x => x.id === b.dataset.bb); if (!a) return;
        const dung = UI.chon.length === 5 && a.deck.every(id => UI.chon.includes(id)) && UI.mv === a.mv;
        c.classList.toggle('chon', dung); b.textContent = dung ? 'IN USE' : 'TRY DECK';
      });
    } catch (e) { }
    return r;
  };
  document.addEventListener('click', (e) => {
    const el = e.target.closest && e.target.closest('[data-act="bb-thu"]'); if (!el) return;
    e.stopPropagation(); BOBAI.thu(el.dataset.bb);
  }, true);
})();
