// TURRET MERGE — TRANG HỒ SƠ Ụ (ngoài trận, kiểu màn chi tiết thẻ của DCDW)
// Mở từ màn chọn bộ bài: chạm thẻ = mở hồ sơ; nút nhỏ góc thẻ = thêm/bỏ nhanh khỏi bộ bài.
// Toàn bộ nội dung đọc từ dữ liệu sẵn có (roster, TEXT, SKILLS, SUP, HO, MOC, GROW, STAGE_K…) → ụ mới tự có trang.
// Xem trước TRỰC TIẾP = iframe chạy chính game ở chế độ ?preview=<id> (đúng hiệu ứng thật), cắt khung quanh bàn.
'use strict';

const UP_Q = new URLSearchParams(location.search);
const UP_XEM = UP_Q.get('preview');

// ===================================================== chữ hiển thị =====================================================
// sentence case: từ IN HOA ≥2 chữ → thường (giữ PvP, HP, LV…), viết hoa chữ đầu câu
const UP_GIU = { PVP: 'PvP', HP: 'HP', LV: 'LV', AI: 'AI', ID: 'ID', OK: 'OK', BINGO: 'bingo' };
function upSC(s) {
  if (s == null) return '';
  s = String(s).replace(/\b[A-Z][A-Z'’]+\b/g, (w) => UP_GIU[w] || w.toLowerCase());
  return s.replace(/^([^A-Za-z0-9]*)([a-z])/, (m, a, b) => a + b.toUpperCase());
}
const upEsc = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const upTen = (id) => (TEXT.turret[id] && TEXT.turret[id].name) || (G.rosterMap[id] && G.rosterMap[id].ten) || id;
const upCo = (id) => !!(SKILLS[id] && G.rosterMap[id]);

const UP_TXT = {
  back: 'Back', file: (i, n) => 'File ' + i + ' / ' + n,
  add: 'Add to deck', remove: 'Remove from deck', deck: (n) => 'Deck ' + n + '/5', locked: 'Not playable yet',
  role: { tc: 'Attack', ht: 'Support', ctl: 'Control', db: 'Special' },
  roleMo: {
    tc: 'Deals the damage. Build your deck around 2 or more of these.',
    ht: 'Never attacks. Boosts the turrets next to it (up, down, left, right unless stated); stronger at 3/5/7★. Copies of the same Support don’t stack, and each buff type has a cap.',
    ctl: 'Its merge hits the rival in PvP, or helps your ally in co-op.',
    db: 'Bends the rules: freezes, marks, mana, odd merges, swaps or transformations. Little or no direct damage.',
  },
  target: { dau: 'Lead enemy', mau: 'Toughest enemy', ngau: 'Random enemy', tu: 'Own pattern', khong: 'Does not shoot' },
  sec: { skill: 'Skill', test: 'Test range', stars: 'Star levels', grow: 'Forms', foot: 'Buff footprint', merge: 'Merge rules', modes: 'Modes and deck', family: 'Family ladder', pair: 'Partners and counters' },
};

// ===================================================== dữ liệu suy ra =====================================================
function upVai(id) {
  const sk = SKILLS[id]; if (!sk) return null;
  if (sk.vai === 'db' && /PVP|rival/i.test((TEXT.turret[id] || {}).skill || '')) return 'ctl';
  return UP_TXT.role[sk.vai] ? sk.vai : 'db';
}
function upNham(id) {
  const sk = SKILLS[id] || {};
  if (!sk.dmg) return UP_TXT.target.khong;
  if (sk.chonMuc || NHIP[id]) return UP_TXT.target.tu;
  return UP_TXT.target[sk.nham] || UP_TXT.target.dau;
}
function upTam(id) { const sk = SKILLS[id] || {}; return typeof sk.tam === 'number' ? 'Melee · ' + sk.tam + ' px' : 'Whole path'; }

// chạy fn(B) trên một bàn tạm (màn chọn không có trận) — mọi công thức chỉ số dùng G.ban[T.ban]
function upBanTam(id, fn) {
  const cu = G.ban;
  try { const B = taoBan(boCuc('solo').ban[0], 0, [id], 'hero'); G.ban = [B]; return fn(B); }
  catch (e) { return null; }
  finally { G.ban = cu; }
}
// bảng ★1→★7: sát thương · tốc bắn · dòng kỹ năng
function upBangSao(id) {
  const sk = SKILLS[id]; if (!sk) return [];
  return upBanTam(id, (B) => {
    const ra = [];
    for (let s = 1; s <= 7; s++) {
      const T = taoU(B, id, s, 7); B.t.fill(null); B.t[7] = T; T.nguon = [];
      try { mocBuf(B); } catch (e) { }
      let dmg = null, toc = '', kn = '';
      try { if (sk.dmg) dmg = Math.round(dmgU(T)); } catch (e) { }
      try { toc = tocTT(id, T) || ''; } catch (e) { }
      try { kn = SUP[id] ? SUP[id].chu(T) : sk.mo ? sk.mo(T) : ''; } catch (e) { kn = ''; }
      ra.push({ s, dmg, toc, kn: upSC(kn) });
    }
    return ra;
  }) || [];
}
// ô được buff (lệch [cột, hàng] so với ụ) ở 1–4★ và từ 5★
function upDauChan(id) {
  const sk = SKILLS[id]; if (!sk || !sk.hoTro || !SUP_LOAI[id]) return null;
  const ke = [[0, -1], [1, 0], [0, 1], [-1, 0]], cheo = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  const goc = sk.huong ? sk.huong() : ke;
  const co5 = loaiMoc(id) === 'ht' && !(MOC_RIENG[id] && MOC_RIENG[id][5]) && !sk.huong;
  return { k: SUP_LOAI[id], a: goc, b: co5 ? ke.concat(cheo) : null };
}
// ghép: luật chung + luật riêng
function upLuatGhep(id) {
  const sk = SKILLS[id] || {}, ten = upTen(id), L = [];
  const mo1 = upBanTam(id, (B) => { const T = taoU(B, id, 1, 7); B.t[7] = T; return sk.mo ? sk.mo(T) : ''; }) || '';
  if (id === 'mimic') L.push(['Joker merge', 'Merges with any turret of the same star. The result gets +50% attack for 8s.']);
  else if (sk.ghepDB) L.push(['Special merge', upSC(mo1 || (TEXT.turret[id] || {}).skill) + '.']);
  if (sk.ghep) L.push(['Merge trigger', upSC((TEXT.turret[id] || {}).skill || mo1) + '.']);
  L.push(['Normal merge', 'Two ' + ten + ' of the same star merge into a random turret from your deck at +1★. Max 7★.']);
  if (typeof THAO_TUNG_SAO !== 'undefined' && THAO_TUNG_SAO.has(id)) L.push(['Star-shaping', 'Max 2 star-shaping turrets per deck.']);
  L.push(['Stone', 'If Janus Cube petrifies it, it only merges with stone of the same star.']);
  return L;
}
function upCheDo(id) {
  const t = (TEXT.turret[id] || {}).skill || '', L = [], sk = SKILLS[id] || {}, r = G.rosterMap[id];
  const pv = t.match(/PVP:?\s*([^;.]*)/i), co = t.match(/Co-op:?\s*([^;.]*)/i), so = t.match(/Solo:?\s*([^;.]*)/i);
  if (pv) L.push(['PvP', upSC(pv[1].trim()) || 'Affects the rival board.']);
  if (co) L.push(['Co-op', upSC(co[1].trim()) || 'Helps your ally.']);
  if (so) L.push(['Solo', upSC(so[1].trim())]);
  if (!L.length) L.push(['All modes', 'Works the same in solo, co-op and PvP.']);
  if (r && r.bac === 'do') L.push(['Mythic', 'Max 1 Mythic per deck.' + (sk.chuDong ? ' Tap it on the board when charged to fire its active skill.' : '')]);
  if (sk.vai === 'tc') L.push(['Deck tip', 'Take at least 2 attack turrets.']);
  return L;
}
// gợi ý cặp đôi theo họ / loại buff (chỉ chọn ụ đang chơi được)
const UP_HOP = {
  frost: ['kiembang', 'lanhgia', 'aten'], poison: ['aten', 'vungdoc', 'khuech'], blast: ['khuech', 'radar', 'chimang'], energy: ['radar', 'khuech', 'dongbo'],
  heavy: ['khuech', 'chimang', 'phagiap'], rapid: ['radar', 'tuthan', 'chimang'], crit: ['chimang', 'thaukinh', 'radar'], amp: ['tia', 'sungluc', 'railgun'],
  trap: ['bang', 'baotuyet', 'khuech'], execute: ['radar', 'lien', 'phun'], mana: ['nangluong', 'loa', 'nhanban'], summon: ['vughep', 'mimic', 'dongbo'],
  star: ['dongbo', 'ngoisao', 'mimic'], joker: ['vughep', 'nangsao', 'dongbo'], guard: ['soi', 'tia', 'overlord'], transform: ['nangsao', 'vughep', 'mimic'],
};
const UP_HT_HOP = { toc: ['lien', 'phun', 'cuongno'], crit: ['soi', 'bua', 'cuongno'], cham: ['kiembang', 'lophanung', 'bang'], dmg: ['tia', 'sungluc', 'railgun'], chet: ['phun', 'lien', 'maychem'], mana: ['nangluong', 'hutmana', 'loa'], khien: ['soi', 'overlord', 'tia'], taylo: ['soi', 'tia', 'overlord'] };
function upCapDoi(id) {
  const h = HO_CUA[id], k = SUP_LOAI[id];
  let ds = (k ? UP_HT_HOP[k] : null) || (h ? UP_HOP[h.ho] : null) || ['khuech', 'radar', 'mimic'];
  if (h) for (const b of HO[h.ho].bac) ds = ds.concat(b);
  const ra = [];
  for (const x of ds) if (x !== id && upCo(x) && !ra.includes(x)) ra.push(x);
  return ra.slice(0, 3).map(x => {
    let ly = 'Good pair';
    if (SUP_LOAI[x] && !SUP_LOAI[id]) ly = 'Gives it ' + BUFF[SUP_LOAI[x]].ten.toLowerCase();
    else if (k && !SUP_LOAI[x]) ly = 'Uses your ' + BUFF[k].ten.toLowerCase();
    else if (h && HO_CUA[x] && HO_CUA[x].ho === h.ho) ly = 'Same family';
    return { id: x, ly };
  });
}
function upKhac(id) {
  const h = HO_CUA[id], sk = SKILLS[id] || {}, tot = [], so = [];
  const T = { blast: 'Swarms and splitters', energy: 'Groups (hits chain)', heavy: 'Giants and bosses', frost: 'Fast runners', poison: 'Tanky waves', rapid: 'Steady streams',
    crit: 'Single tough targets', trap: 'Crowded paths', execute: 'Small enemies', amp: 'Bosses (they take more damage)', mana: 'Long games', summon: 'Filling the board fast',
    star: 'Late waves', joker: 'Fixing bad merges', guard: 'Boss skills', transform: 'Lucky streaks' };
  if (h && T[h.ho]) tot.push(T[h.ho]);
  if (sk.nham === 'mau' && !tot.includes(T.heavy)) tot.push(T.heavy);
  if (/\bslows\b|freez|chill/i.test((TEXT.turret[id] || {}).skill || '') || (h && h.ho === 'frost') || SUP_LOAI[id] === 'cham') so.push('Frost Flyers ignore slow.');
  if (typeof sk.tam === 'number') so.push('Only hits enemies close to it: place it next to the path.');
  if (sk.ghep || sk.ghepDB) so.push('Joker King can force a merge before you are ready.');
  if (sk.hoTro && SUP_LOAI[id]) so.push('Freezer and Janus Cube can lock it: keep a Cleanser or Shield Gen.');
  if (G.rosterMap[id] && G.rosterMap[id].bac === 'do') so.push('Nightmare snipes your highest-star turret: −1★.');
  if (!so.length) so.push('Octopus Eyes burns turrets: −1★ unless cleansed.');
  if (!tot.length) tot.push('Most waves');
  return { tot, so: so.slice(0, 2) };
}
function upSoSeri(id) { const i = G.roster.findIndex(r => r.id === id); return 'TM-' + String(i + 1).padStart(3, '0'); }

// ===================================================== trang =====================================================
// trang chỉ huy: thời lượng + giải thích (tiếng Anh như phần còn lại của giao diện)
const UP_MV = {
  hero: { lau: 'Instant', dl: [['Effect', 'Summons two free 1★ turrets from your deck into empty cells'], ['Board full', 'Fills only the empty cells left'], ['Best with', 'Merge-trigger turrets: more copies to merge']] },
  dahlia: { lau: '10s', dl: [['Effect', 'Every turret on your board deals double damage'], ['Stacks with', 'Stars, card levels and support buffs'], ['Best with', 'Cast it as a boss arrives']] },
  eve: { lau: '8s', dl: [['Effect', 'Clears freeze, stone and burn from every turret'], ['Shield', 'Blocks every boss skill for 8 seconds'], ['Best with', 'Boss waves that lock your turrets']] },
};
const UP = {
  id: null, ds: [], sao: 3, dungXem: false,
  giam: () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches),

  // HUD mượt C (TU-VAN-HUD-MUOT §3C): 1 màn không cuộn — hero tràn viền (phi công + đầu súng) · tên + 1 dòng meta · 4 thông số 2×2 ·
  //  thẻ kỹ năng 1–2 dòng (chạm = bảng CHI TIẾT trượt lên: mọi mục cũ) · hàng TEST RANGE (chạm = bảng thử bắn trượt lên) · nút Add/Remove dính đáy.
  //  iframe Test range nằm cố định trong bảng thử bắn (không bao giờ chuyển chỗ trong DOM — chuyển chỗ = nạp lại); chỉ chạy khi bảng mở.
  dung() {
    if (this.el) return this.el;
    const el = document.createElement('div'); el.id = 'up'; el.className = 'man up7'; el.hidden = true;
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Turret file');
    const x = '<button class="up-x" data-up="dongtam" aria-label="Close"><img src="assets/ic_lui.png" alt=""></button>';
    el.innerHTML =
      '<div class="up-nen" aria-hidden="true"></div>' +
      '<div class="up-dau"><button class="up-lui" data-up="dong" aria-label="Back"><img src="assets/ic_lui.png" alt=""></button>' +
      '<div class="up-so"></div><span class="up-mui"><button data-up="truoc" aria-label="Previous"><img class="lat" src="assets/mui_tiep.png" alt=""></button>' +
      '<button data-up="sau" aria-label="Next"><img src="assets/mui_tiep.png" alt=""></button></span></div>' +
      '<div class="up-than"><div class="up-noi"><div class="up-a"></div></div></div>' +
      '<div class="up-cuoi"><button class="up-nut" data-up="bo"><b class="up-nut-chu"></b><small class="up-nut-so"></small></button></div>' +
      '<div class="up-man" data-up="dongtam" aria-hidden="true"></div>' +
      '<section class="up-tam up-ct" aria-label="Details"><div class="up-tam-dau"><b class="up-tam-ten"></b>' + x + '</div><div class="up-tam-than"><div class="up-b"></div></div></section>' +
      '<section class="up-tam up-ts" aria-label="Test range"><div class="up-tam-dau"><b class="up-ts-ten">Test range</b>' + x + '</div><div class="up-tam-than">' + this.tvHTML() + '</div></section>';
    document.getElementById('wrap').appendChild(el);
    el.addEventListener('click', (e) => this.bam(e));
    this.vuot(el.querySelector('.up-than'));
    addEventListener('popstate', () => { if (!el.hidden) this.dong(true); });
    addEventListener('keydown', (e) => {
      if (el.hidden) return;
      if (e.key === 'Escape') { if (this.tam) this.dongTam(); else this.dong(); }
      else if (!this.tam && e.key === 'ArrowRight') this.buoc(1); else if (!this.tam && e.key === 'ArrowLeft') this.buoc(-1);
    });
    this.el = el; return el;
  },
  // danh sách theo đúng thứ tự đang hiện trên màn chọn (xếp theo bậc / họ / tên)
  danhSach() {
    const ds = [...document.querySelectorAll('#chon-luoi .c')].map(c => c.dataset.id).filter(Boolean);
    return ds.length ? ds : G.roster.map(r => r.id);
  },
  mo(id, tu) {
    const el = this.dung();
    this.ds = this.danhSach();
    const moi = el.hidden;
    this.ve(id, 0);
    if (moi) this.hien(el);
    try { SND.nut(); } catch (e) { }
  },
  hien(el) {
    clearTimeout(this._ra); el.classList.remove('ra');
    el.hidden = false; el.querySelector('.up-than').scrollTop = 0;
    try { history.pushState({ up: 1 }, ''); this._ls = true; } catch (e) { this._ls = false; }
    if (!this.giam()) { el.classList.remove('vao'); void el.offsetWidth; el.classList.add('vao'); }
  },
  dong(tuLS) {
    if (!this.el || this.el.hidden) return;
    const el = this.el;
    this.dongTam(true); this.id = null;
    if (this.ifr) this.guiXem({ dung: true });
    if (!tuLS && this._ls) { this._ls = false; try { history.back(); } catch (e) { } }
    this._ls = false;
    const an = () => { el.hidden = true; el.classList.remove('ra', 'vao'); };
    if (this.giam()) an(); else { el.classList.remove('vao'); el.classList.add('ra'); clearTimeout(this._ra); this._ra = setTimeout(an, 190); }
    this._an = true; setTimeout(() => { this._an = false; }, 0);
    if (typeof UI !== 'undefined' && UI.veBoChon) UI.veBoChon();
  },
  buoc(d) {
    if (this.mv) { const ds = Object.keys(MAVUONG), j = (ds.indexOf(this.mv) + d + ds.length) % ds.length; this.veMV(ds[j], d); return; }
    if (!this.ds.length) return;
    const i = this.ds.indexOf(this.id), j = (i + d + this.ds.length) % this.ds.length;
    this.ve(this.ds[j], d);
  },
  // bảng trượt lên: 'ct' = chi tiết · 'ts' = Test range
  moTam(k) {
    if (!this.el) return;
    this.tam = k;
    this.el.classList.toggle('mo-ct', k === 'ct'); this.el.classList.toggle('mo-ts', k === 'ts');
    if (k === 'ct') this.el.querySelector('.up-ct .up-tam-than').scrollTop = 0;
    if (k === 'ts') { this.khungXem(); requestAnimationFrame(() => this.khungXem()); }
    this.guiXem({ dung: this.canDung() }); this.nutPhat();
    try { SND.nut(); } catch (e) { }
  },
  dongTam(im) {
    if (!this.el || !this.tam) return;
    this.tam = null; this.el.classList.remove('mo-ct', 'mo-ts');
    this.guiXem({ dung: true });
    if (!im) try { SND.nut(); } catch (e) { }
  },
  bam(e) {
    const b = e.target.closest('[data-up]'); if (!b) return;
    const a = b.dataset.up;
    if (a === 'dong') this.dong();
    else if (a === 'truoc') this.buoc(-1);
    else if (a === 'sau') this.buoc(1);
    else if (a === 'more') this.moTam('ct');
    else if (a === 'test') this.moTam('ts');
    else if (a === 'dongtam') this.dongTam();
    else if (a === 'mo') { this.dongTam(true); this.ve(b.dataset.id, 1); }
    else if (a === 'sao') { this.chonSao(+b.dataset.s); if (b.dataset.mo) this.moTam('ts'); }
    else if (a === 'gd') this.chonGd(+b.dataset.g);
    else if (a === 'phat') { this.dungXem = !this.dungXem; this.guiXem({ dung: this.canDung() }); this.nutPhat(); }
    else if (a === 'bo' && this.mv) { UI.mv = this.mv; if (UI.veChon) UI.veChon(); this.capNutBo(); this.nhay(b); try { SND.nut(); } catch (e) { } }
    else if (a === 'bo') {
      if (!upCo(this.id)) return;
      UI.chonU(this.id); this.capNutBo(); this.nhay(b);
    }
  },
  // nút chính: chớp vàng tại chỗ 90 ms (ảnh nút, không vẽ)
  nhay(b) { if (this.giam()) return; b.classList.remove('nhay'); void b.offsetWidth; b.classList.add('nhay'); },
  // vuốt ngang ở thân trang → ụ trước / sau
  vuot(el) {
    let x0 = null, y0 = 0, t0 = 0;
    el.addEventListener('pointerdown', (e) => { x0 = e.clientX; y0 = e.clientY; t0 = performance.now(); });
    el.addEventListener('pointerup', (e) => {
      if (x0 == null) return; const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6 && performance.now() - t0 < 700) this.buoc(dx < 0 ? 1 : -1);
    });
    el.addEventListener('pointercancel', () => { x0 = null; });
  },
  capNutBo() {
    const nut = this.el.querySelector('.up-nut'), chu = nut.querySelector('.up-nut-chu'), so = nut.querySelector('.up-nut-so');
    if (this.mv) { // trang chỉ huy: dùng chỉ huy này
      const dang = UI.mv === this.mv;
      chu.textContent = dang ? 'Selected' : 'Use commander'; so.textContent = dang ? '' : 'Current: ' + upSC(String((MAVUONG[UI.mv] || MAVUONG.hero).ten).toLowerCase());
      nut.disabled = false; nut.classList.toggle('bo', dang); return;
    }
    const gl = this.el.querySelector('.up-gl');
    if (gl && typeof ND !== 'undefined' && ND.url && typeof GLYPH !== 'undefined') { // biểu tượng nhận diện (glyph.js): màu khoá = ô trong bộ bài
      try { const k = UI.chon.indexOf(this.id); gl.src = ND.url(this.id, k >= 0 ? ND.KEY[k % 5] : null, 48); gl.hidden = k < 0; } catch (e) { gl.hidden = true; }
    }
    const id = this.id, co = upCo(id), trong = UI.chon.includes(id);
    chu.textContent = !co ? UP_TXT.locked : trong ? UP_TXT.remove : UP_TXT.add;
    so.textContent = co ? UP_TXT.deck(UI.chon.length) : '';
    nut.disabled = !co; nut.classList.toggle('bo', trong);
  },

  // ---------- dựng nội dung 1 ụ ----------
  ve(id, huong) {
    const r = G.rosterMap[id]; if (!r) return;
    this.id = id; this.mv = null;
    const el = this.el, tier = TIERS[r.bac] || TIERS.trang, sk = SKILLS[id], co = !!sk;
    el.style.setProperty('--m', tier.mau); el.style.setProperty('--m2', tier.mau2); el.dataset.bac = r.bac; el.classList.remove('la-mv');
    const i = this.ds.indexOf(id);
    el.querySelector('.up-so').innerHTML = 'Turret file <span>' + (i + 1) + ' / ' + this.ds.length + '</span>';
    const noi = el.querySelector('.up-noi');
    noi.querySelector('.up-a').innerHTML = this.html(id, r, tier, sk);
    el.querySelector('.up-b').innerHTML = this.chiTiet(id, r, tier, sk);
    el.querySelector('.up-tam-ten').textContent = upTen(id);
    el.querySelector('.up-ts-ten').textContent = upTen(id) + ' · test range';
    el.querySelector('.up-tv').classList.toggle('tat', !co); el.querySelector('.up-sd-sao').hidden = !co;
    const sb = el.querySelector('.up-tv-sao'); if (sb) sb.hidden = false;
    el.querySelector('.up-than').scrollTop = 0;
    if (huong && !this.giam()) { noi.classList.remove('trai', 'phai'); void noi.offsetWidth; noi.classList.add(huong > 0 ? 'phai' : 'trai'); }
    this.capNutBo();
    // xem trước = clip minh hoạ kỹ năng (skilldemo.js): mặc định 4★; ụ đổi dạng có thêm nút Stage
    this.sao = co ? 4 : 1; this.gd = 0;
    const gdc = el.querySelector('.up-sd-gd');
    if (gdc) {
      const coGd = co && typeof laGrow === 'function' && laGrow(id);
      gdc.hidden = !coGd;
      gdc.innerHTML = coGd ? ['All', 'Stage 1', 'Stage 2', 'Stage 3'].map((t, g) => '<button data-up="gd" data-g="' + g + '"' + (g === 0 ? ' class="chon"' : '') + '>' + t + '</button>').join('') : '';
    }
    this.ganXem(id);
    this.chonSao(this.sao, true);
    requestAnimationFrame(() => fitText(noi.querySelector('.up-ten'), 30, 18));
  },

  // ---------- trang CHỈ HUY (chạm thẻ chỉ huy ở màn chọn): cùng khuôn với trang ụ ----------
  moMV(id, tu) {
    if (!MAVUONG[id]) return;
    const el = this.dung(), moi = el.hidden;
    this.veMV(id, 0);
    if (moi) this.hien(el);
  },
  veMV(id, huong) {
    const d = MAVUONG[id]; if (!d) return;
    this.mv = id; this.id = null;
    const el = this.el, ds = Object.keys(MAVUONG), i = ds.indexOf(id);
    el.style.setProperty('--m', d.mau); el.style.setProperty('--m2', d.mau); el.dataset.bac = 'mv'; el.classList.add('la-mv');
    el.querySelector('.up-so').innerHTML = 'Commander <span>' + (i + 1) + ' / ' + ds.length + '</span>';
    const noi = el.querySelector('.up-noi');
    const tt = UP_MV[id] || {}, ten = upSC(String(d.ten).toLowerCase());
    noi.querySelector('.up-a').innerHTML =
      '<section class="up-hero"><div class="up-pi"><img src="assets/' + d.anh + '.png" alt=""></div><span class="up-seri">CMD-0' + (i + 1) + '</span>' +
      '<div class="up-mam cmd"><img class="up-vong cmd" src="assets/h2_mv_huy.png" alt=""><img class="up-mvic" src="' + mvIcURL(id) + '" alt=""></div></section>' +
      '<div class="up-bien"><div class="up-ten">' + upEsc(ten) + '</div><div class="up-meta"><b>COMMANDER</b> • ACTIVE SKILL • ' + upEsc(d.cd) + 'S COOLDOWN</div></div>' +
      '<div class="up-spec">' + this.o('Cost', d.gia + ' mana') + this.o('Cooldown', d.cd + 's') + this.o('Next cost', '×2 per use') + this.o('Lasts', tt.lau || '—') + '</div>' +
      this.theKN('Commander skill', upSC(d.mo) + '.', '') + this.hangTest();
    el.querySelector('.up-b').innerHTML =
      this.muc(1, 'Skill', '<p class="up-mo">' + upEsc(upSC(d.mo)) + '.</p><p class="up-phu"><b>How to cast.</b> Tap the commander button during a battle. The mana cost doubles after each use.</p>') +
      this.muc(2, 'How it works', '<dl class="up-dl">' + (tt.dl || []).map(([a, b]) => '<dt>' + upEsc(a) + '</dt><dd>' + upEsc(b) + '</dd>').join('') + '</dl>');
    el.querySelector('.up-tam-ten').textContent = ten;
    el.querySelector('.up-ts-ten').textContent = ten + ' · test range';
    el.querySelector('.up-tv').classList.remove('tat');
    el.querySelectorAll('.up-sao-chon').forEach(e => { e.hidden = true; });
    const sb = el.querySelector('.up-tv-sao'); if (sb) sb.hidden = true;
    el.querySelector('.up-than').scrollTop = 0;
    if (huong && !this.giam()) { noi.classList.remove('trai', 'phai'); void noi.offsetWidth; noi.classList.add(huong > 0 ? 'phai' : 'trai'); }
    this.capNutBo();
    this.ganXem('mv:' + id);
    requestAnimationFrame(() => fitText(noi.querySelector('.up-ten'), 30, 18));
  },

  // thẻ kỹ năng (1–2 dòng) — chạm = bảng chi tiết
  theKN(nhan, chu, them) {
    return '<button class="up-kn" data-up="more"><small>' + upEsc(nhan) + them + '</small><span class="up-kn-chu">' + upEsc(chu) + '</span>' +
      '<em>More<img src="assets/mui_tiep.png" alt=""></em></button>';
  },
  hangTest() {
    return '<button class="up-hang-ts" data-up="test"><img class="ic" src="assets/ic_phat.png" alt=""><b>Test range</b><span>Watch it fire</span><img class="mt" src="assets/mui_tiep.png" alt=""></button>';
  },
  // màn chính trang ụ
  html(id, r, tier, sk) {
    const ten = upTen(id), vai = upVai(id), h = hoTT(id), grow = sk && laGrow(id);
    const kd = Math.min(1.3, (REN.kDau ? REN.kDau(id) : 0.8) / 0.714); // tỉ lệ đầu so với bệ (bệ = 71.4% cạnh ô)
    const P = [];
    // HERO tràn viền: phi công (khung mặt FACE_BOX — khung.js) mờ dần về phải/dưới bằng mặt nạ; đầu súng trên bệ ở góc phải dưới
    P.push('<section class="up-hero"><div class="up-pi"><img src="' + portraitOf(id) + '" alt="" onerror="this.onerror=null;this.src=\'' + iconOf(id) + '\'"></div>' +
      '<span class="up-seri">' + upSoSeri(id) + '</span>' +
      '<div class="up-mam"><img class="up-vong" src="assets/tier_ring_' + r.bac + '.png" alt=""><div class="up-u" style="--kd:' + kd.toFixed(3) + '"><img class="de" src="assets/de_chung.png" alt="">' +
      '<img class="dau" src="assets/' + id + '_nong.png" alt="" onerror="this.onerror=null;this.src=\'' + iconOf(id) + '\';this.classList.add(\'fb\')"></div><img class="up-gl" alt="" hidden></div></section>');
    // tên + MỘT dòng meta (độ hiếm • vai trò • bậc họ)
    const meta = ['<b>' + upEsc(String(tier.ten).toUpperCase()) + '</b>'];
    if (vai) meta.push(UP_TXT.role[vai].toUpperCase());
    if (h) meta.push('TIER ' + h.bac);
    if (grow) meta.push('GROW-UP');
    if (sk && sk.chuDong) meta.push('ACTIVE');
    if (!sk) meta.push('COMING SOON');
    P.push('<div class="up-bien"><div class="up-ten">' + upEsc(ten) + '</div><div class="up-meta">' + meta.join(' • ') + '</div></div>');
    // 4 thông số 2×2
    const bs = sk ? upBangSao(id) : [];
    const s1 = bs[0] || {};
    const tam = sk ? (typeof sk.tam === 'number' ? 'Melee' : 'Whole path') : '—';
    const ht = sk && !sk.dmg && SUP_LOAI[id] && BUFF[SUP_LOAI[id]]; // ụ hỗ trợ: thay sát thương/tốc bắn bằng loại buff + ô được buff
    P.push('<div class="up-spec">' + (ht
      ? this.o('Boosts', upSC(BUFF[SUP_LOAI[id]].ten)) + this.o('Buffs', sk.huong ? '4 diagonals' : '4 neighbours') + this.o('From 5★', (upDauChan(id) || {}).b ? '+ diagonals' : 'Same cells') + this.o('Target', upNham(id))
      : this.o('Damage', s1.dmg != null ? s1.dmg : '—') + this.o('Fire rate', s1.toc ? upSC(s1.toc).replace(' shots/s', '/s') : '—') +
        this.o('Range', tam) + this.o('Target', sk ? upNham(id) : '—')) + '</div>');
    // kỹ năng 1 dòng + Test range
    P.push(this.theKN(SUP_LOAI[id] ? 'Support skill' : 'Skill', upSC(r.kyNang || '') + '.', grow ? ' · 3 forms' : ''));
    if (sk) P.push(this.hangTest());
    return P.join('');
  },
  // bảng CHI TIẾT: mọi thông tin cũ (không xoá, chỉ để sau 1 chạm)
  chiTiet(id, r, tier, sk) {
    const vai = upVai(id), h = hoTT(id), grow = sk && laGrow(id), P = [];
    const bs = sk ? upBangSao(id) : [], s1 = bs[0] || {}, moi = HO_MOI[id];
    let n = 1;
    P.push(this.muc(n++, UP_TXT.sec.skill,
      '<p class="up-mo">' + upEsc(upSC(r.kyNang || '')) + '.</p>' +
      (vai ? '<p class="up-phu"><b>' + UP_TXT.role[vai] + '.</b> ' + UP_TXT.roleMo[vai] + '</p>' : '') +
      (moi ? '<p class="up-phu"><b>Its twist:</b> ' + upEsc(upSC(moi)) + '.</p>' : '') +
      (s1.kn ? '<div class="up-so1">' + s1.kn.split(/\s·\s/).map(x => '<span>' + upEsc(x) + '</span>').join('') + '</div>' : '') +
      (sk ? '<dl class="up-dl"><dt>Reach</dt><dd>' + upEsc(upTam(id)) + '</dd><dt>Target</dt><dd>' + upEsc(upNham(id)) + '</dd>' +
        (h ? '<dt>Family</dt><dd>' + upEsc(upSC(h.ten)) + ' · tier ' + h.bac + ' of 5</dd>' : '') + '</dl>' : '')));
    if (sk) {
      const moc = {}; for (const m of mocCua(id)) moc[m.n] = m;
      P.push(this.muc(n++, UP_TXT.sec.stars,
        '<div class="up-bang"><div class="up-hang dau"><span>★</span><span>Damage</span><span>Rate</span><span>Effect</span></div>' +
        bs.map(x => '<button class="up-hang' + (moc[x.s] ? ' moc' : '') + '" data-up="sao" data-mo="1" data-s="' + x.s + '"><span class="s">' + x.s + '</span><span>' + (x.dmg != null ? x.dmg : '—') + '</span><span>' + upEsc(x.toc ? x.toc.replace(' shots/s', '/s') : '—') + '</span><span class="kn">' + upEsc(x.kn || '—') + '</span>' +
          (moc[x.s] ? '<em><b>' + x.s + '★ unlock · ' + upEsc(upSC(moc[x.s].ten)) + '.</b> ' + upEsc(upSC(moc[x.s].mo)) + '.</em>' : '') + '</button>').join('') +
        '</div><p class="up-ghi">Values at card level 1, no buffs. Each in-battle level-up adds +18% damage. Tap a row to test it.</p>'));
      if (grow) P.push(this.muc(n++, UP_TXT.sec.grow, this.growHTML(id)));
      const dc = upDauChan(id);
      if (dc) P.push(this.muc(n++, UP_TXT.sec.foot, this.chanHTML(id, dc)));
      P.push(this.muc(n++, UP_TXT.sec.merge, '<dl class="up-dl">' + upLuatGhep(id).map(([a, b]) => '<dt>' + upEsc(a) + '</dt><dd>' + upEsc(b) + '</dd>').join('') + '</dl>'));
      P.push(this.muc(n++, UP_TXT.sec.modes, '<dl class="up-dl">' + upCheDo(id).map(([a, b]) => '<dt>' + upEsc(a) + '</dt><dd>' + upEsc(b) + '</dd>').join('') + '</dl>'));
      if (h) P.push(this.muc(n++, UP_TXT.sec.family, this.hoHTML(id, h)));
      const cd = upCapDoi(id), kh = upKhac(id);
      P.push(this.muc(n++, UP_TXT.sec.pair,
        (cd.length ? '<div class="up-cap">' + cd.map(x => this.theNho(x.id, x.ly)).join('') + '</div>' : '') +
        '<dl class="up-dl"><dt>Strong vs</dt><dd>' + upEsc(kh.tot.join(' · ')) + '</dd><dt>Watch out</dt><dd>' + kh.so.map(upEsc).join('<br>') + '</dd></dl>'));
    } else {
      P.push(this.muc(n++, 'Status', '<p class="up-phu">This turret is designed but not in the game yet. It will unlock in a future update.</p>' + (h ? this.hoHTML(id, h) : '')));
    }
    return P.join('');
  },
  tvHTML() {
    return '<div class="up-tv"><div class="up-tv-khung"></div><i class="g tl"></i><i class="g tr"></i><i class="g bl"></i><i class="g br"></i>' +
      '<div class="up-tv-chu"><span class="rec">Live</span></div><b class="up-tv-sao"></b>' +
      '<button class="up-phat" data-up="phat" aria-label="Pause preview"></button><div class="up-tv-tat">No test footage yet</div></div>' +
      '<div class="up-sao-chon up-sd-sao" role="group" aria-label="Preview star level">' + [1, 4, 7].map(s => '<button data-up="sao" data-s="' + s + '" class="moc">' + s + '★</button>').join('') + '</div>' +
      '<div class="up-sao-chon up-sd-gd" role="group" aria-label="Preview stage" hidden></div>';
  },
  o(k, v) { return '<div><small>' + k + '</small><b>' + upEsc(v) + '</b></div>'; },
  muc(n, ten, noi) { return '<section class="up-muc"><h3>' + ten + '</h3>' + noi + '</section>'; },
  theNho(id, ly) {
    const r = G.rosterMap[id], m = r ? TIERS[r.bac].mau : '#9aa6b4';
    return '<button class="up-the" data-up="mo" data-id="' + id + '" style="--c:' + m + '"><img src="' + portraitOf(id) + '" alt=""><b>' + upEsc(upTen(id)) + '</b><span>' + upEsc(ly) + '</span></button>';
  },
  growHTML(id) {
    const g = GROW[id], anh = !!(window.STAGE_K && STAGE_K[id]);
    // điều kiện chia theo dạng nếu chuỗi tách được thành 3 phần
    let ph = String(g.dk).split(/\s+\/\s+|\s+·\s+/);
    if (ph.length === 2) ph = ['Starting form'].concat(ph);
    if (ph.length !== 3) ph = null;
    return '<div class="up-gd">' + g.ten.map((t, k) =>
      '<div class="up-gd1" style="--g:' + g.mau + '"><div class="anh"><img class="de" src="assets/de_chung.png" alt=""><img class="dau s' + (k + 1) + (anh ? '' : ' loc') + '" src="assets/' + id + '_nong' + (anh ? '_s' + (k + 1) : '') + '.png" alt="" onerror="this.onerror=null;this.src=\'' + iconOf(id) + '\'"></div>' +
      '<b>' + (k + 1) + ' · ' + upEsc(upSC(t)) + '</b>' + (ph && ph[k] ? '<span>' + upEsc(upSC(ph[k])) + '</span>' : '') + '</div>').join('<img class="up-mt" src="assets/mui_tiep.png" alt="›">') + '</div>' +
      '<p class="up-phu">' + upEsc(upSC(g.dk)) + '.</p>' + (g.lap ? '<p class="up-ghi">Cycles back to stage 1 after it fires.</p>' : '');
  },
  chanHTML(id, dc) {
    const anh = REN.kyHieuURL ? REN.kyHieuURL(dc.k) : '', mau = (BUFF[dc.k] || {}).mau || '#fff';
    const luoi = (ds) => {
      let s = '<div class="up-luoi">';
      for (let hh = 0; hh < 3; hh++) for (let c = 0; c < 5; c++) {
        const dx = c - 2, dy = hh - 1, la = dx === 0 && dy === 0, co = ds.some(([a, b]) => a === dx && b === dy);
        s += '<i class="' + (la ? 'u' : co ? 'b' : '') + '">' + (la ? '<img src="' + iconOf(id) + '" alt="">' : co && anh ? '<img src="' + anh + '" alt="">' : '') + '</i>';
      }
      return s + '</div>';
    };
    let tam = 'the 4 cells next to it (up, down, left, right)';
    if (SKILLS[id].huong) tam = 'only the 4 diagonal cells';
    let v1 = '', v7 = '';
    const bs = upBangSao(id); if (bs.length) { v1 = bs[0].kn; v7 = bs[6].kn; }
    return '<div class="up-chan" style="--b:' + mau + '"><figure>' + luoi(dc.a) + '<figcaption>1–4★</figcaption></figure>' +
      (dc.b ? '<figure>' + luoi(dc.b) + '<figcaption>5★ and up</figcaption></figure>' : '') + '</div>' +
      '<p class="up-phu"><b style="color:' + mau + '">' + upEsc(BUFF[dc.k].ten) + '</b> for ' + tam + (dc.b ? '. From 5★ it also reaches the diagonals' : '') + '.' +
      (v1 ? ' ' + upEsc(v1) + ' at 1★, ' + upEsc(v7) + ' at 7★.' : '') + '</p>';
  },
  hoHTML(id, h) {
    const F = HO[HO_CUA[id].ho];
    return '<div class="up-thang">' + F.bac.map((ds, k) => {
      const c = TIERS[TIER_LIST[k]].mau;
      if (!ds.length) return '<div class="nac gap" style="--c:' + c + '"><small>' + upSC(TIERS[TIER_LIST[k]].ten) + '</small><span>Open slot</span></div>';
      return '<div class="nac" style="--c:' + c + '"><small>' + upSC(TIERS[TIER_LIST[k]].ten) + '</small>' + ds.map(x =>
        x === id ? '<span class="cur"><img src="' + iconOf(x) + '" alt="">' + upEsc(upTen(x)) + '</span>' : '<button data-up="mo" data-id="' + x + '"><img src="' + iconOf(x) + '" alt="">' + upEsc(upTen(x)) + '</button>').join('') + '</div>';
    }).join('') + '</div>' + (h.sau ? '<p class="up-phu">Next up: <b>' + upEsc(h.sau) + '</b>' + (h.sauMoi ? ' — ' + upEsc(upSC(h.sauMoi)) : '') + '.</p>' : '<p class="up-phu">Top of its family.</p>');
  },

  // ---------- xem trước trực tiếp (iframe = chính game ở chế độ preview) ----------
  // dừng clip khi: người xem bấm dừng · khung ra khỏi màn hình · tab ẩn · trang hồ sơ đóng (iframe nạp sẵn lúc ẩn)
  canDung() { return !!(this.dungXem || this.tam !== 'ts' || document.hidden || !this.el || this.el.hidden); },
  // NẠP SẴN Test range: khi màn chọn rảnh, dựng khung trang hồ sơ (ẩn) + iframe → ảnh trận tải trước, mở trang ụ là chạy ngay
  //  (iframe KHÔNG bao giờ bị chuyển chỗ trong DOM — chuyển chỗ = trình duyệt nạp lại từ đầu).
  chuanBi() {
    if (this.ifr || UP_XEM) return;
    try { if (navigator.connection && navigator.connection.saveData) return; } catch (e) { }
    const el = this.dung(); if (!el.hidden) return;
    const id = ((typeof UI !== 'undefined' && UI.chon) || []).find(x => SKILLS[x] && G.rosterMap[x]) || (G.roster || []).map(r => r.id).find(x => SKILLS[x]);
    if (!id) return;
    if (!this.sao) this.sao = 4;
    this.ganXem(id);
  },
  ganXem(id) {
    const tv = this.el.querySelector('.up-tv'); if (!tv) return;
    if (!SKILLS[id] && !/^mv:/.test(id)) { this.guiXem({ dung: true }); return; }
    this._xemId = id;
    if (!this.ifr) {
      const f = document.createElement('iframe');
      f.className = 'up-ifr'; f.title = 'Live preview'; f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1;
      f.src = 'index.html?preview=' + encodeURIComponent(id) + '&star=' + this.sao + '&dpr=2&notut=1';
      this.ifr = f;
    } else this.guiXem({ id, sao: this.sao, gd: this.gd });
    if (!this.ifr.parentNode) { tv.querySelector('.up-tv-khung').appendChild(this.ifr); this.theoDoiXem(tv); }
    this.khungXem(); requestAnimationFrame(() => this.khungXem());
    if (this.giam() && this._lanDau !== false) { this.dungXem = true; this._lanDau = false; }
    this.guiXem({ dung: this.canDung() }); this.nutPhat();
  },
  // khung cắt: bàn 3×3 + đường trên + dải chú thích (toạ độ logic y 150…530), co theo bề rộng khung
  khungXem() {
    const kh = this.el && this.el.querySelector('.up-tv-khung'); if (!kh || !this.ifr) return;
    const k = (kh.clientWidth || 344) / 430;
    kh.style.setProperty('--k', k.toFixed(4)); kh.style.height = Math.round(380 * k) + 'px'; this.ifr.style.top = (-150 * k) + 'px';
  },
  // ra khỏi màn hình / ẩn tab → dừng clip (đỡ tốn pin); quay lại → chạy tiếp (trừ khi người xem đã bấm dừng)
  theoDoiXem(tv) {
    if (this._io) return;
    const cap = () => this.guiXem({ dung: this.canDung() });
    this._thay = true;
    if ('IntersectionObserver' in window) { this._io = new IntersectionObserver((es) => { this._thay = es[es.length - 1].isIntersecting; cap(); }, { threshold: 0.05 }); this._io.observe(tv); }
    else this._io = true;
    document.addEventListener('visibilitychange', cap);
    addEventListener('resize', () => this.khungXem());
    const kh = tv.querySelector('.up-tv-khung');
    if (kh && 'ResizeObserver' in window) new ResizeObserver(() => this.khungXem()).observe(kh);
  },
  chonGd(g) {
    this.gd = g || 0;
    this.el.querySelectorAll('[data-up="gd"]').forEach(b => b.classList.toggle('chon', +b.dataset.g === this.gd));
    this.guiXem({ id: this.id, sao: this.sao, gd: this.gd });
    if (this.dungXem) { this.dungXem = false; this.guiXem({ dung: false }); this.nutPhat(); }
  },
  guiXem(d) { try { if (this.ifr && this.ifr.contentWindow) this.ifr.contentWindow.postMessage({ tmXem: d }, '*'); } catch (e) { } },
  nutPhat() { const b = this.el.querySelector('.up-phat'); if (b) { b.classList.toggle('dung', this.dungXem); b.setAttribute('aria-label', this.dungXem ? 'Play preview' : 'Pause preview'); } },
  chonSao(s, lanDau) {
    if (!SKILLS[this.id]) return;
    this.sao = s;
    this.el.querySelectorAll('[data-up="sao"]').forEach(b => b.classList.toggle('chon', +b.dataset.s === s));
    const t = this.el.querySelector('.up-tv-sao'); if (t) t.textContent = s + '★';
    if (!lanDau) { this.guiXem({ id: this.id, sao: s, gd: this.gd }); if (this.dungXem) { this.dungXem = false; this.guiXem({ dung: false }); this.nutPhat(); } }
  },
};

// ===================================================== móc vào màn chọn =====================================================
if (!UP_XEM) {
  // iframe xem trước báo "đã nghe" → gửi lại trạng thái hiện tại (tin gửi lúc iframe còn đang nạp bị mất → trước đây khung đứng đen)
  addEventListener('message', (e) => {
    if (!e.data || !e.data.tmXemSS || !UP.ifr || e.source !== UP.ifr.contentWindow) return;
    UP.guiXem({ id: UP._xemId, sao: UP.sao, gd: UP.gd || 0, dung: UP.canDung() });
  });
  // nạp sẵn Test range ~1.5 s sau khi màn chọn hiện (đã tải xong menu, không trong trận)
  let rnh = 0; const hen = setInterval(() => {
    const c = document.getElementById('chon');
    const ok = typeof TAI !== 'undefined' && TAI.daBoot && !TAI.cho && c && !c.hidden && !(G.ban && G.ban.length);
    rnh = ok ? rnh + 1 : 0;
    if (UP.ifr) clearInterval(hen); else if (rnh >= 3) { clearInterval(hen); try { UP.chuanBi(); } catch (e) { console.warn('UP.chuanBi', e); } }
  }, 500);
  // thẻ chỉ huy ở màn chọn: chạm = chọn (như cũ) + mở trang chỉ huy
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act="mv-chon"]'); if (!el) return;
    const r = el.getBoundingClientRect(), id = el.dataset.id;
    setTimeout(() => UP.moMV(id, r), 0);
  }, true);
  // thẻ ở màn chọn: chạm = mở hồ sơ; nút nhỏ góc phải = thêm/bỏ nhanh
  const _theChonGoc = UI.theChon;
  UI.theChon = function (r) {
    const c = _theChonGoc.call(this, r);
    c.dataset.act = 'xem-u';
    c.setAttribute('role', 'button'); c.setAttribute('aria-label', r.ten + ': open file');
    if (SKILLS[r.id]) { const q = document.createElement('button'); q.className = 'up-q'; q.dataset.act = 'chon-u'; q.dataset.id = r.id; q.setAttribute('aria-label', 'Add or remove ' + r.ten); c.appendChild(q); }
    return c;
  };
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]'); if (!el || el.dataset.act !== 'xem-u') return;
    UP.mo(el.dataset.id, el);
  });
}

// ===================================================== chế độ XEM TRƯỚC (bên trong iframe) =====================================================
if (UP_XEM) {
  document.documentElement.classList.add('up-xem');
  G.debug.nointro = true;
  // khung xem trước KHÔNG dựng lưới 85 thẻ của màn chọn (85 chân dung ≈ 6 MB tải thừa → Test range đen rất lâu trên 4G)
  //  (khoá bằng getter/setter: các file nạp sau — bobai… — bọc UI.veChon cũng không dựng lại được → không tải thêm ~30 icon)
  // trang hồ sơ ẩn (display:none) → iframe co về 0×0 → REN.coLai dựng canvas 0×0 (lỗi drawImage, mở lại trang vẫn ĐEN).
  //  Khung xem trước luôn 430×860 → bỏ qua lần đổi cỡ về 0.
  { const coLaiGoc = REN.coLai; REN.coLai = function () { if (!innerWidth || !innerHeight) return; return coLaiGoc.apply(this, arguments); }; }
  Object.defineProperty(UI, 'veChon', { configurable: true, get() { return function () { }; }, set() { } });
  for (const k in SND) if (typeof SND[k] === 'function') SND[k] = function () { };
  for (const k of ['bangWave', 'canhBaoTrum', 'ketQua', 'cutIn', 'nhac']) UI[k] = function () { };
  ketThuc = function () { };
  lot = function (E) { E.chet = true; E.tChet = 1; };   // quái lọt: chỉ biến mất, không mất tim
  try { Storage.prototype.setItem = function () { }; } catch (e) { } // không ghi đè lựa chọn / âm thanh của người chơi
  const UPX = {
    id: null, sao: 3, t: 0, tq: 0, tk: 0, tr: 0,
    bat(id, sao) {
      if (!SKILLS[id] || !G.rosterMap[id]) return;
      this.id = id; this.sao = clamp(sao || 3, 1, 7);
      const deck = [id].concat(['lien', 'canon', 'set', 'bang', 'sungluc'].filter(x => x !== id && SKILLS[x])).slice(0, 5);
      batDau('solo', deck, 'hero');
      G.cho = 1e9; G.wave = 6; G.tocDo = 1; G.dung = !!this.dungMuon;
      this.xep(); G.quai.length = 0; this.tq = 0.2; this.tk = 0; this.tr = 0;
    },
    kieu(id) {
      const sk = SKILLS[id];
      if (sk.hoTro && SUP_LOAI[id]) return 'ht';
      if (id === 'mimic' || sk.ghepDB || sk.ghep) return 'ghep';
      if (sk.chuDong) return 'chu';
      if (!sk.dmg) return 'phu';
      return 'tc';
    },
    // xếp bàn theo kiểu ụ
    xep() {
      const B = G.ban[0], id = this.id, s = this.sao, k = this.kieu(id);
      B.t.fill(null); G.dan.length = 0; G.hu.length = 0; UI.xemHT = null; UI.xemU = null; B.mana = 999; B.gia = 10; FX.reset(); VX.reset();
      const dat = (o, x, sao) => { const T = sinhU(taoU(B, x, sao, o)); B.t[o] = T; return T; };
      this.T = dat(7, id, s);
      if (k === 'ht') {
        const ke = SKILLS[id].huong ? [1, 3, 11, 13] : [2, 6, 8, 12];
        ke.forEach((o, i) => dat(o, i % 2 ? 'canon' : 'lien', Math.max(1, s - 1)));
      } else if (k === 'ghep') {
        const ms = Math.min(s, 6); this.T.sao = ms;
        let p = (id === 'mimic' || SKILLS[id].ghepDB) ? 'lien' : id;
        this.P = dat(8, p, ms);
        if (!hopLeGhep(this.T, this.P)) this.P = dat(8, id, ms);
        dat(2, 'lien', 2); dat(12, 'canon', 2);
      } else if (k === 'phu') { dat(6, 'lien', s); dat(8, 'canon', s); }
      for (const T of B.t) if (T) T.gd = null;
      // máu quái theo sức bắn của bàn → mỗi quái chịu vài phát (thấy rõ hiệu ứng, không chết tức thì)
      let dps = 0; for (const T of B.t) if (T) { try { const sk = SKILLS[T.id]; if (sk.dmg) dps += dmgU(T) * Math.min(4, tocU(T)); } catch (e) { } }
      this.hp = Math.max(60, dps * 3.2);
      this.k = k;
    },
    tick(dt) {
      if (!this.id || !G.ban.length) return;
      const B = G.ban[0];
      this.tq -= dt; this.tk += dt; this.tr += dt;
      const song = G.quai.filter(E => !E.chet).length;
      if (this.tq <= 0 && song < 12) {
        this.tq = 0.8 + Math.random() * 0.5; this.n = (this.n || 0) + 1;
        const loai = this.n % 7 === 0 ? 'khong_lo' : this.n % 3 === 0 ? 'bay' : 'bo';
        const E = sinhQuai(loai, 0, 50 + Math.random() * 40, 1); E.max = E.hp = Math.round(this.hp * QUAI[loai].hp);
      }
      if (this.k === 'ghep' && this.tk > 3.6) {
        this.tk = -2.4; // ghép → xem kết quả ~2.4 s → xếp lại
        const a = this.T, b = this.P;
        if (a && b && B.t[a.o] === a && B.t[b.o] === b && hopLeGhep(a, b)) ghep(B, a, b); else this.xep();
        this._xepLai = true;
      } else if (this.k === 'ghep' && this._xepLai && this.tk > 0) { this._xepLai = false; this.xep(); this.tk = 0; }
      if (this.k === 'chu' && this.tk > 5) {
        this.tk = 0; const T = B.t[7];
        if (T && T.id === this.id) { T.nap = 1; try { SKILLS[this.id].chuDong(G, B, T); } catch (e) { } }
      }
      if (this.k === 'ht' && this.tk > 3.4) {
        this.tk = 0; const T = B.t[7], n = performance.now();
        if (T && T.id === this.id) UI.xemHT = { T, t0: n, giu: false, het: n + 2400 };
      }
      if (this.tr > 26) { this.tr = 0; this.xep(); } // ụ biến hình / tiến hoá: định kỳ về lại ban đầu
    },
  };
  const _capNhatGoc = capNhat;
  capNhat = function (dt) { _capNhatGoc(dt); if (!window.SD) try { UPX.tick(dt); } catch (e) { } };
  // clip minh hoạ kỹ năng (skilldemo.js) — nạp sau mọi script của trang; lỗi nạp → giữ cảnh thử bắn cũ (UPX)
  const napSD = () => { const sc = document.createElement('script'); sc.src = 'js/skilldemo.js'; document.body.appendChild(sc); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', napSD); else napSD();
  const batXem = (id, sao, gd) => (window.SD ? SD.bat(id, sao, gd) : UPX.bat(id, sao));
  // UI.init có thể đã chạy trước khi file này nạp (phông sẵn) → chờ roster + canvas sẵn sàng rồi dựng cảnh
  //  yêu cầu đến TRƯỚC khi sẵn sàng (trang mẹ đã chuyển ụ) → giữ lại, chạy ụ đó thay ụ trong URL
  let san = false, choYC = null;
  const cho = setInterval(() => {
    const q = choYC || { id: UP_XEM, sao: +UP_Q.get('star') || 4, gd: +UP_Q.get('gd') || 0 };
    if (G.rosterMap && (G.rosterMap[q.id] || /^mv:/.test(q.id)) && REN.cv && (window.SD || performance.now() > 4000)) {
      clearInterval(cho); san = true;
      if (window.SD) SD.dungMuon = !!UPX.dungMuon;
      if (!UPX.id && !(window.SD && SD.id)) batXem(q.id, q.sao || 4, q.gd || 0);
    }
  }, 60);
  addEventListener('message', (e) => {
    const d = e.data && e.data.tmXem; if (!d) return;
    if (d.dung != null) { UPX.dungMuon = !!d.dung; if (window.SD) SD.dungMuon = !!d.dung; if (G.ban.length) G.dung = !!d.dung; }
    if (d.id) { if (san) batXem(d.id, d.sao, d.gd); else choYC = d; }
  });
  try { if (parent !== window) parent.postMessage({ tmXemSS: 1 }, '*'); } catch (e) { }
}
