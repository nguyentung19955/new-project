// TURRET MERGE — MÀN MỞ ĐẦU TRẬN kiểu DCDW (thay ND.gioiThieu cũ 1,5 s bị chạy NGẦM dưới màn tải nên người chơi không kịp thấy).
//  · Chỉ bắt đầu khi màn tải trận đã tắt (TAI.cho = false); thời gian trận ĐỨNG YÊN (G.dung) tới khi màn này đóng.
//  · Thứ tự ~3,8 s, chạm bất kỳ đâu để bỏ qua: (a) TRÙM CỦA TRẬN (wave 10/20/30: dải 8 khung trum_<id>_8.png chạy tại chỗ,
//    tên, 1 dòng mối đe doạ) → (b) BỘ BÀI: 5 thẻ ụ + thẻ chỉ huy trượt vào → (c) CO-OP/PVP: bộ bài đồng đội / đối thủ.
//  · Chỉ dùng ảnh ChatGPT có sẵn: bang_trum_nen / bang_wave_nen (băng tiêu đề), khung_bang (tấm), the_khung_<bậc> + the_khung_mv
//    (khung thẻ), h2_tam_mong (tấm chữ "chạm để bắt đầu"), glyph/<id>. Code chỉ đặt chữ + vị trí/phóng/mờ/cắt khung ảnh PNG.
//  · Chip "Boss in N" trên ray: thêm chân dung trùm sắp tới (khung 0 của dải 8 khung, cắt bằng background-position).
'use strict';
const VT = {
  TONG: 4.0,          // giây — tự đóng (≥ 3 s đọc kịp; chạm CONTINUE / bất kỳ đâu để vào ngay)
  SO_TRUM: 3,         // số trùm xem trước
  NGUY: { mad_crown: 'Scrambles 3 turrets', freezer: 'Freezes your best turret', janus: 'Petrifies 1 turret',
    joker_king: 'Forces a merge', nightmare: 'Snipes your top turret', octopus: 'Burns 3 turrets' },
  CHU: { boss: 'BOSSES THIS MATCH', wave: 'WAVE', you: 'YOUR DECK', ally: 'ALLY DECK', rival: 'RIVAL DECK', bossPvp: 'SAME WAVES & BOSSES FOR BOTH', allyLane: 'Ally lane', cmd: 'CMDR', tap: 'TAP TO START' },
  el: null, mo: false,

  // trùm của làn đường p ở wave w — CÙNG lịch với trận (game.js trumCuaWave: SOLO/PVP ngẫu nhiên theo hạt giống, CO-OP cố định tới wave 59)
  trumO(w, p) { return trumCuaWave(w, p); },
  lanCuaToi() { const i = (G.duong || []).findIndex(d => d.ban === 0); return i < 0 ? 0 : i; },
  // các wave trùm sắp tới (tính từ wave hiện tại)
  dsTrum(n) {
    const ck = LUAT.songTrum, ds = [];
    for (let w = (Math.floor(G.wave / ck) + 1) * ck; ds.length < n && w <= LUAT.waveMax; w += ck) ds.push(w);
    return ds;
  },
  sprite(id) { return 'url(assets/trum_' + id + (typeof TRUM8 !== 'undefined' && TRUM8.has(id) ? '_8' : '') + '.png)'; },
  soKhung(id) { return typeof TRUM8 !== 'undefined' && TRUM8.has(id) ? 8 : 4; },

  theU(B, id, i) {
    const r = G.rosterMap[id] || { bac: 'trang', ten: id }, mau = ND.mau(B, id);
    const anh = hasPilot(id) ? '<img class="vt-po pilot" src="' + portraitOf(id) + '" alt="">' : '<img class="vt-po" src="' + iconOf(id) + '" alt="">';
    return '<div class="vt-the" style="--i:' + i + '"><div class="vt-kh">' + anh + '<img class="vt-khung" src="' + KHUNG.url(r.bac) + '" alt=""></div>' +
      '<div class="vt-ten"><b style="color:' + (mau || '#fff') + '">' + r.ten + '</b></div></div>';
  },
  theMV(B, i) {
    const d = MAVUONG[B.mv.id];
    return '<div class="vt-the vt-cmd" style="--i:' + i + '"><div class="vt-kh"><img class="vt-po pilot" src="' + (typeof anhUrl === 'function' ? anhUrl(d.anh) : 'assets/' + d.anh + '.png') + '" alt="" onerror="this.onerror=null;this.src=\'' + mvIcURL(B.mv.id) + '\';this.classList.remove(\'pilot\')">' +
      '<img class="vt-khung" src="' + KHUNG.url('mv') + '" alt=""></div><div class="vt-ten"><b style="color:' + d.mau + '">' + d.ten + '</b></div></div>';
  },
  boBai(B, nhan, tre) {
    return '<section class="vt-bo" style="--t:' + tre + 's"><div class="vt-bang xanh"><b>' + nhan + '</b></div><div class="vt-hang">' +
      B.deck.map((id, i) => this.theU(B, id, i)).join('') + this.theMV(B, 5) + '</div></section>';
  },
  // HUD mượt C (TU-VAN-HUD-MUOT §3G): 1 trùm LỚN (trùm gần nhất: dải 8 khung chạy tại chỗ, WAVE, tên, 1 dòng mối đe doạ)
  //  + 2 ô nhỏ trùm sắp tới + (CO-OP/PVP) 1 dải bộ bài đồng đội / đối thủ + nút CONTINUE đếm ngược. Bộ bài của mình không nhắc lại.
  dung() {
    const ds = this.dsTrum(this.SO_TRUM), toi = this.lanCuaToi(), coop = G.che === 'coop' && G.duong.length > 1;
    const tt = (w, i) => {
      const id = this.trumO(w, toi), T = TRUM[id], nf = this.soKhung(id);
      const dd = coop ? (() => { const id2 = this.trumO(w, 1 - toi); return id2 !== id ? '<span class="vt-dd"><i style="background-image:' + this.sprite(id2) + ';--nf:' + this.soKhung(id2) + '"></i>' + this.CHU.allyLane + ': ' + TRUM[id2].ten + '</span>' : ''; })() : '';
      return '<div class="vt-tt' + (i === 0 ? ' dau' : '') + '" style="--i:' + i + ';--m:' + T.mau + '"><span class="vt-w">' + this.CHU.wave + ' ' + w + '</span>' +
        '<i class="vt-sp" style="background-image:' + this.sprite(id) + ';--nf:' + nf + '"></i><div class="vt-chu"><span class="vt-w2">' + this.CHU.wave + ' ' + w + '</span><b>' + T.ten + '</b><span class="vt-ng">' + (this.NGUY[id] || T.kn) + '</span>' + dd + '</div></div>';
    };
    let h = '<div class="vt-bang do"><b>' + (G.che === 'pvp' ? this.CHU.bossPvp : this.CHU.boss) + '</b></div>';
    if (ds.length) h += tt(ds[0], 0);
    if (ds.length > 1) h += '<div class="vt-sau">' + ds.slice(1).map((w, i) => tt(w, i + 1)).join('') + '</div>';
    if (G.ban[1]) { // bộ bài đồng đội / đối thủ: 1 dải gọn
      const B = G.ban[1], mv = MAVUONG[B.mv.id];
      h += '<div class="vt-doi"><small>' + (G.che === 'pvp' ? this.CHU.rival : this.CHU.ally) + '</small><span>' +
        B.deck.map(id => { const r = G.rosterMap[id] || { bac: 'trang' }; return '<i class="vt-mini"><img class="po" src="' + thumbOf(id) + '" alt=""><img class="kh" src="' + KHUNG.url(r.bac) + '" alt=""></i>'; }).join('') +
        (mv ? '<i class="vt-mini"><img class="po" src="' + (typeof anhUrl === 'function' ? anhUrl(mv.anh) : 'assets/' + mv.anh + '.png') + '" alt=""><img class="kh" src="' + KHUNG.url('mv') + '" alt=""></i>' : '') + '</span></div>';
    }
    h += '<div class="vt-cham"><b>CONTINUE</b><small class="vt-dem"></small></div>';
    this.el.innerHTML = '<div class="vt-cot">' + h + '</div>';
    this.el.classList.add('vt7');
    this.el.classList.toggle('hai', !!G.ban[1]);
  },
  // đếm ngược trên nút CONTINUE (chữ, không vẽ)
  dem() {
    const e = this.el && this.el.querySelector('.vt-dem'); if (!e || !this.mo) return;
    const con = Math.max(0, Math.ceil(this.TONG - (performance.now() - this.t0) / 1000));
    e.textContent = 'Auto-start in ' + con + 's'; this._d = setTimeout(() => this.dem(), 250);
  },
  batDau() {
    if (!this.el || !G.ban.length) return;
    clearTimeout(this._h); cancelAnimationFrame(this._raf);
    this.mo = true; G.dung = true; // thời gian trận đứng yên tới khi màn này đóng
    this.el.hidden = true; this.el.classList.remove('vao', 'ra');
    const cho = () => {
      if (!this.mo) return;
      if (typeof TAI !== 'undefined' && TAI.cho) { this._raf = requestAnimationFrame(cho); return; } // còn màn tải: chưa chạy đồng hồ
      this.dung();
      this.el.hidden = false; void this.el.offsetWidth; this.el.classList.add('vao');
      this.el.querySelectorAll('.vt-ten b, .vt-tt b').forEach(b => fitText(b, parseFloat(getComputedStyle(b).fontSize), b.closest('.vt-sau') ? 13 : 6.5)); // ô trùm nhỏ: xuống dòng, không thu < 13 px (tư vấn C) // sau khi hiện (đo được bề rộng)
      this.t0 = performance.now(); this.dem();
      this._h = setTimeout(() => this.dong(), this.TONG * 1000);
    };
    cho();
  },
  dong() {
    if (!this.mo) return;
    this.mo = false; clearTimeout(this._h); clearTimeout(this._d); cancelAnimationFrame(this._raf);
    this.el.classList.add('ra');
    if (G.ban.length && $('#dung').hidden) G.dung = false;
    setTimeout(() => { if (!this.mo) { this.el.hidden = true; this.el.classList.remove('vao', 'ra'); this.el.innerHTML = ''; } }, 240);
  },

  // ---------- chip "Boss in N": chân dung trùm sắp tới / trùm đang chạy ----------
  chip() {
    const ch = $('#tb-trum'); if (!ch || !G.ban.length) return;
    let s = ch._vt;
    if (!s) { s = ch._vt = document.createElement('i'); s.className = 'vt-chip'; ch.insertBefore(s, ch.firstChild); }
    const song = G.quai.find(e => e.trum && !e.chet && G.duong[e.p] && G.duong[e.p].ban === 0) || G.quai.find(e => e.trum && !e.chet);
    let id = song && song.trum;
    if (!id) { const ck = LUAT.songTrum, w = G.wave > 0 && G.wave % ck === 0 && G.laTrum ? G.wave : (Math.floor(G.wave / ck) + 1) * ck; id = this.trumO(w, this.lanCuaToi()); }
    if (s._id !== id) { s._id = id; s.style.backgroundImage = this.sprite(id); s.style.setProperty('--nf', this.soKhung(id)); ch.classList.add('co-vt'); }
  },
};

(() => {
  if (typeof UI === 'undefined' || typeof ND === 'undefined') return;
  if (/[?&]nointro\b/.test(location.search)) G.debug.nointro = true;
  // lớp phủ dùng lại phần tử #nd-gt cũ (cùng chỗ trong #wrap, unitpage.css đã ẩn nó ở khung xem trước)
  const el = $('#nd-gt');
  if (el) { el.innerHTML = ''; el.classList.add('vt'); VT.el = el; el.onpointerdown = (e) => { e.stopPropagation(); e.preventDefault(); VT.dong(); }; }
  ND.gioiThieu = function () { if (!G.debug.nointro) VT.batDau(); };
  const capGoc = UI.capNhat;
  UI.capNhat = function () { const r = capGoc.apply(this, arguments); try { VT.chip(); } catch (e) { console.error('VT', e); } return r; };
  // rời trận giữa chừng (về menu / chơi lại) → đóng màn mở đầu, không giữ G.dung
  const vaoGoc = UI.vaoTran;
  UI.vaoTran = function () { if (VT.mo) { VT.mo = false; clearTimeout(VT._h); cancelAnimationFrame(VT._raf); } return vaoGoc.apply(this, arguments); };
})();
