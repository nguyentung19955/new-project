// ASTRAL ARSENAL — ĐƯỜNG ĐUA (RACE TRACK, theo Destiny Child Defense War) — người dùng chốt 11/11 "làm y như DCDW".
//  Thiết kế: docs/demo-hop-tuong/tuvan/che-do-dcdw/THIET-KE.md §2.1. Dùng lại khung chedo-c.js / chedo-d.js (CD.phat, CDD.nhanMoc, BXH, CDUI/CDDUI).
//  · Bàn CO-OP (bạn + đồng đội máy dùng CÙNG bộ bài của bạn), bộ bài + cấp thẻ thật, 3 tim CHUNG. Đồng hồ 8:00, KHÔNG chia wave:
//    quái ra liên tục theo nhịp cố định; máu quái = nền × (1 + k · số quái đã diệt); trùm nhỏ mỗi 2 phút. Hết giờ hoặc hết tim = dừng, GIỮ điểm.
//  · ĐIỂM = tổng "cân nặng" quái đã diệt (con tách ra không tính). Thưởng theo MỐC ĐIỂM TUẦN (1 lần / tuần, ghi cờ TRƯỚC khi phát), đặt lại thứ Hai.
//  · TẤT ĐỊNH: chuỗi quái (loại, làn, thời điểm, trùm nhỏ) sinh bằng rngHat(hạt TUẦN) — mọi người cùng chuỗi trong tuần; không Math.random trong file này.
//    Hạt TRẬN (G.hat: triệu hồi, kỹ năng) vẫn ngẫu nhiên mỗi lượt như trận thường — nếu cố định theo tuần thì cả tuần triệu hồi ra y hệt.
//  · HIỆU NĂNG: tối đa DDC.tran quái sống cùng lúc — quá trần thì con chưa ra DỒN máu + cân nặng vào con ra kế tiếp.
//  · G.wave trong trận = "chặng" 20 s (chỉ để mana mỗi mạng tăng dần như trận thường) — không hiện bảng WAVE, không lịch trùm 10 wave.
//  · Lưu: khoá con mới turret_kt.cd.dd { tuan, best, bestT, all, nhan }. Gộp hồ sơ Firebase: số lớn nhất, cờ mốc OR (cùng tuần).
//  · MỌI SỐ Ở DDC LÀ TẠM (chọn bằng bot tools/thap-bot-tran.js --che dd) — chờ người dùng duyệt.
'use strict';

const DDC = {
  gio: 480, tim: 3, prep: 5, chang: 20,                         // chang: giây mỗi "chặng" (G.wave +1 → mana mỗi mạng tăng như trận thường)
  tran: 34,                                                     // trần quái sống cùng lúc (cả 2 làn)
  hp0: 110, k: 0.015, g0: 270, mu: 4,                           // máu 1 con thường = hp0 × hệ số loại × (1 + k · g) × (1 + (g / g0)^mu), g = số đã diệt
                                                                //   (phần (g/g0)^mu: sau ~g0 mạng máu tăng dốc → bộ mạnh không dọn hết được mọi con)
  nhip: (t) => Math.max(0.45, 1.5 - 1.05 * t / 480),            // giây giữa 2 con (2 làn luân phiên): 1,5 → 0,45 (~550 con / 8 phút)
  can: { bo: 1, bay: 1, bay_bang: 1, tach: 2, khong_lo: 4, que_tach: 5, trum: 30 }, // cân nặng = điểm
  trumMoi: 120, trumHp: 25,                                     // trùm nhỏ mỗi 120 s; máu = trumHp × máu 1 con thường lúc đó
  moc: {                                                        // mốc ĐIỂM tuần → thưởng (thay nguồn tuần của Săn Trùm / Vô tận / Thử thách tuần)
    100: [{ vang: 1000 }, { ngoc: 50 }], 250: [{ ngoc: 50 }], 400: [{ vang: 2000 }, { tt: 1 }],
    550: [{ ngoc: 60 }, { ruong: 'hh', n: 1 }], 700: [{ vang: 2000 }, { tt: 1 }], 850: [{ ruong: 'hh', n: 2 }, { tt: 1 }],
  },
  ICON: 'ua_ic_sk',
};

const DD = {
  cho: null, // cấu hình chờ batDau kế tiếp
  st() {
    const c = CD.st(); let s = c.dd;
    if (!s || typeof s !== 'object' || Array.isArray(s)) s = c.dd = {};
    for (const k of ['tuan', 'best', 'bestT', 'all']) s[k] = Math.max(0, +s[k] || 0);
    if (!s.nhan || typeof s.nhan !== 'object') s.nhan = {};
    const tu = KT.tuan(); if (s.tuan !== tu) { s.tuan = tu; s.best = 0; s.bestT = 0; s.nhan = {}; }
    return s;
  },
  hat(tu) { return (KT.bam('dd:' + tu) | 0) || 1; },
  cauHinh(tu) { tu = tu || KT.tuan(); return { tuan: tu, hat: this.hat(tu) }; },
  vao() {
    if (typeof UI === 'undefined' || UI.chon.length !== 5) { try { UI.nhac('Pick 5 turrets'); } catch (e) { } return false; }
    if (!TT.tnMo('dd')) { TTUI.toast(TT.tnChu('dd')); return false; }
    const c = this.cauHinh(); this.cho = c; UI.che = 'coop';
    try { TTUI.dong(); } catch (e) { }
    UI.vao();
    if (this.cho === c) { this.cho = null; return false; } // không vào được (bản mới đang nạp…)
    return true;
  },
  // hệ số máu hiện tại so với máu wave của game (sinhQuai nhân mauWave(G.wave) × hệ số loại)
  heSo(g) { return (1 + DDC.k * g) * (1 + Math.pow(g / DDC.g0, DDC.mu)); },
  hs(d) { return DDC.hp0 * this.heSo(d.giet) / mauWave(Math.max(1, G.wave)); },
  song() { let n = 0; for (const E of G.quai) if (!E.chet) n++; return n; },
  // loại quái thứ n (chỉ theo RNG tuần + thời điểm ra → chuỗi cố định trong tuần)
  loai(d, t) {
    const n = d.n++, x = d.r();
    let id = 'bo';
    if (t >= 20 && x < 0.2) id = 'bay';
    else if (t >= 150 && x < 0.33) id = 'bay_bang';
    else if (t >= 90 && x < 0.46) id = 'tach';
    if (t >= 45 && n % 8 === 7) id = 'khong_lo';
    if (t >= 300 && n % 13 === 6) id = 'que_tach';
    return { id, p: n % G.duong.length };
  },
  sinh(d, t) {
    const q = this.loai(d, t), can = DDC.can[q.id] || 1;
    if (this.song() >= DDC.tran) { d.don += QUAI[q.id].hp; d.donCan += can; return; } // quá trần: dồn vào con sau
    d._hs = 1 + d.don / QUAI[q.id].hp;
    let E; try { E = sinhQuai(q.id, q.p, 0, 1); } finally { d._hs = 1; }
    if (E) { E.ddW = can + d.donCan; d.don = 0; d.donCan = 0; }
  },
  trum(d) {
    const be = typeof trumBe === 'function' ? trumBe(10) : CD.dsTrum(), id = be[Math.floor(d.rT() * be.length)], p = d.nT++ % G.duong.length;
    const E = sinhTrum(id, p, DDC.trumHp * this.hs(d) / (30 * (1 + G.wave / 35)));
    if (E) E.ddW = DDC.can.trum;
  },
  // mỗi bước mô phỏng (trước capNhat): hết giờ → dừng; tới nhịp → sinh quái / trùm nhỏ
  buoc() {
    const d = G.dd; if (!d || d.t0 == null || G.ketThuc || !G.ban.length) return;
    const t = G.t - d.t0;
    G.wave = 1 + Math.floor(t / DDC.chang); G.tWave = 0; G.cho = 0; // chặng theo ĐỒNG HỒ (không theo "sân trống" như wave thường) → mana mỗi mạng như nhau với mọi bộ
    if (t >= DDC.gio) { d.het = true; ketThuc(true, 'Time up'); return; }
    while (d.tKe <= t) { this.sinh(d, d.tKe); d.tKe += DDC.nhip(d.tKe); }
    if (t >= d.tTrum) { d.tTrum += DDC.trumMoi; this.trum(d); }
  },
  conGio() { const d = G.dd; return !d ? 0 : d.t0 == null ? DDC.gio : Math.max(0, DDC.gio - (G.t - d.t0)); },
  // hết lượt: kỷ lục tuần + mốc (ghi cờ TRƯỚC khi phát) → { diem, giet, t, moi, cu, ra, moc }
  ket(c, x) {
    const s = this.st(), ra0 = { vang: 0, ngoc: 0, the: [], tt: 0 };
    if (c.tuan !== s.tuan) return Object.assign({ cu: true, ra: ra0, moc: [] }, x); // trận bắt đầu tuần trước: không tính
    const moi = x.diem > s.best || (x.diem === s.best && s.best > 0 && x.t < s.bestT);
    if (moi) { s.best = x.diem; s.bestT = x.t; }
    s.all = Math.max(s.all, x.diem);
    const m = CDD.nhanMoc(s, DDC.moc, s.best, 'cddd', 'race');
    KT.luu();
    if (moi && x.diem > 0) BXH.ghi('dd', x.diem, x.t);
    return Object.assign({ moi, ra: m.ra, moc: m.moc }, x);
  },
};

const DDUI = {
  gio(s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); },
  nhanMoc: (m) => CDUI.so(m) + ' PTS',
  // bảng trước trận: luật + mốc tuần + bảng xếp hạng tuần + START
  mo() {
    const s = DD.st();
    let h = CDUI.dau(DDC.ICON, 'RACE TRACK', 'WEEK ' + s.tuan + ' · RESETS IN ' + KT.dongHo(KT.conLai(true)));
    h += '<div class="cd-ct"><div class="cd-so"><span><small>TIME</small><b>' + this.gio(DDC.gio) + '</b></span><span><small>LIVES</small><b>' + DDC.tim + '</b></span><span><small>WEEK BEST</small><b>' + (s.best ? CDUI.so(s.best) : '—') + '</b></span></div>' +
      '<p class="kt-chu cd-luat">You and an AI ally hold the track for 8 minutes. No waves: enemies never stop, and every kill makes the next ones tougher. A mini boss comes every 2 minutes. Score = enemies defeated.</p>' +
      '<small class="cd-nh">WEEKLY MILESTONES</small>' + CDDUI.dsMoc(DDC.moc, s.nhan, null, this.nhanMoc) + '</div>';
    h += CDDUI.bxhKhung('dd');
    CDUI.phu(h + CDUI.nut('<button class="hm-nut2 vang" data-act="dd-vao"><b>START RACE</b></button>'), 'cdd-p cdd-dd');
    CDDUI.bxhVe('dd');
  },
  // thẻ ở đầu tab EVENT (HOME → EVENT): PLAY + bảng xếp hạng
  theSk() {
    const mo = TT.tnMo('dd'), s = DD.st();
    return '<div class="cdd-sk"><img src="' + CDUI.a(DDC.ICON) + '" alt=""><span><b>RACE TRACK</b><small>' + (mo ? 'Week ' + s.tuan + ' · best ' + (s.best ? CDUI.so(s.best) : '—') : CDUI.esc(TT.tnChu('dd'))) + '</small></span>' +
      '<button class="hm-nut2" data-act="cdd-lb"><b>RANKS</b></button><button class="hm-nut2 vang" data-act="dd-sk"' + (mo ? '' : ' disabled') + '><b>PLAY</b></button></div>';
  },
  // nhãn giữa thanh trên: đồng hồ + điểm (thay "BOSS IN N"); thanh = thời gian còn lại (trùm ở sân: giữ thanh máu trùm của HUD)
  //  trùm ở sân: HUD ẩn thanh trên (băng chiêu trùm thay chỗ) → hiện nhãn nhỏ #dd-chip (khuôn .cd-chip của chế độ C) để vẫn thấy đồng hồ + điểm
  chip() {
    const d = G.dd; let e = document.getElementById('dd-chip');
    if (!d || !G.ban.length || G.ketThuc) { if (e && !e.hidden) e.hidden = true; return; }
    const con = DD.conGio(), t = this.gio(con) + ' · ' + CDUI.so(d.diem) + ' PTS', tc = document.getElementById('tb-trum-chu');
    if (tc && tc.textContent !== t) tc.textContent = t;
    const nh = document.querySelector('#tb-wave [data-t="wave"]'), so = document.getElementById('tb-so'); // ô trái: KO + số quái đã diệt (thay WAVE n — chế độ này không chia wave)
    if (nh && nh.dataset.dd !== '1') { nh.dataset.dd = '1'; nh.textContent = 'KO'; }
    if (so && so.textContent !== String(d.giet)) so.textContent = d.giet;
    const top = document.getElementById('top'), trum = G.quai.some(x => x.trum && !x.chet);
    if (trum && top && (this._dem = (this._dem | 0) + 1) % 12 === 1) this._an = getComputedStyle(top).visibility === 'hidden'; // đo thưa (12 khung/lần) — chỉ khi có trùm
    if (trum && this._an) { // thanh trên đang bị băng chiêu trùm thay chỗ
      const wr = document.getElementById('wrap');
      if (!e && wr) { e = document.createElement('div'); e.id = 'dd-chip'; e.className = 'cd-chip'; wr.appendChild(e); }
      if (e) { if (e._t !== t) { e._t = t; e.textContent = t; } e.classList.toggle('gap', con <= 30); if (e.hidden) e.hidden = false; }
      return;
    }
    if (e && !e.hidden) e.hidden = true;
    if (trum) return;
    this._an = false; this._dem = 0;
    const f = document.querySelector('#ha-thanh .f'); if (f) { const w = (con / DDC.gio * 100).toFixed(1) + '%'; if (f.style.width !== w) f.style.width = w; }
  },
  kq(k, c) {
    const kq = document.getElementById('ketqua'), chi = document.getElementById('kq-chi'); if (!kq || !chi || !k.dd) return;
    const r = DD.ket(c, k.dd), s = DD.st(), tim = G.ban[0] ? Math.max(0, G.ban[0].tim | 0) : 0;
    const dich = (x) => (typeof NN !== 'undefined' && NN.t ? NN.t(x) : x);
    const phu = document.getElementById('kq-phu'); if (phu) phu.textContent = dich('RACE TRACK · WEEK ' + c.tuan) + ' · ' + this.gio(r.t) + (k.ly && !k.dd.het ? ' · ' + dich(k.ly) : '');
    const ten = document.getElementById('kq-ten'); if (ten) ten.textContent = k.dd.het ? 'TIME UP!' : 'RACE OVER';
    kq.classList.toggle('dd-tt', !k.dd.het); // hết tim / bỏ cuộc: khung trung tính (css/chedo-d.css) — không phải thua, không phải thắng
    const so = document.getElementById('kq-so'), chuSo = 'SCORE <b>' + CDUI.so(r.diem) + '</b>';
    if (so) { so.innerHTML = chuSo; setTimeout(() => { if (G.ketThuc === k && !kq.hidden) { so.innerHTML = chuSo; try { NN.quet(so); } catch (e) { } } }, 800); } // sau hoạt ảnh đếm WAVE của ketqua.js
    const o = (nhan, v, em) => '<div class="kq-o"><small>' + nhan + '</small><b>' + v + '</b>' + (em ? '<em>' + em + '</em>' : '') + '</div>';
    let th;
    if (r.cu) th = '<small>LAST WEEK\'S RACE · NOT COUNTED</small>';
    else if (CDDUI.coThuong(r.ra)) th = '<small>MILESTONE REWARDS · ' + this.nhanMoc(Math.max.apply(null, r.moc)) + '</small>' + CDDUI.thuongHtml(r.ra);
    else th = '<small>' + (r.moi ? 'NEW WEEKLY BEST' : 'NO NEW MILESTONE') + '</small>';
    chi.innerHTML = '<div class="kq-hang">' + o('WEEK BEST', s.best ? CDUI.so(s.best) : '—', r.moi ? 'NEW BEST' : '') + o('KILLS', CDUI.so(r.giet)) + o('LIVES', tim + '/' + DDC.tim) + '</div><div class="tb-kq cd-kq dd-xd">' + th + '</div>';
    try { OT.quet(chi); } catch (e) { }
    DD.lap = true;
    const lai = kq.querySelector('[data-act="choilai"]'); if (lai) lai.textContent = 'RACE AGAIN';
    return r;
  },
};

// ===================================================== MỐC WAVE CO-OP (đạt LẦN ĐẦU) =====================================================
//  11/11 (người dùng: "Leo tháp xoá", "tham khảo thưởng DCDW"): tiến trình chính = mốc wave CO-OP đạt lần đầu (kiểu DCDW: Infinite Defense
//  thưởng theo wave / trùm mỗi 10 wave), THAY "thưởng lần đầu mỗi tầng" của Leo Tháp. Tổng 7 mốc = tổng thưởng lần đầu 100 tầng cũ
//  (55 500 vàng · 460 ngọc · 3 Rương Thường · 3 Rương Vàng · 5 Rương HH · 8 Tinh thể Đỏ) — SỐ TẠM, chờ duyệt.
//  Tiến độ cũ không mất, không lĩnh 2 lần: tầng đã qua f ≥ TT.tangTuWave(W) (W 10 ≙ tầng 4, 20 ≙ 20, 30 ≙ 36, 40 ≙ 52, 50 ≙ 68, 60 ≙ 84, 70 ≙ 100)
//  → mốc W coi như ĐÃ NHẬN (đã lĩnh thưởng các tầng đó). Lưu: khoá con mới turret_kt.cd.cm { nhan, qd }.
const MOCWC = {
  moc: {
    10: [{ vang: 3000 }, { ngoc: 40 }, { ruong: 'thuong' }], 20: [{ vang: 5000 }, { ngoc: 50 }, { ruong: 'thuong', n: 2 }], 30: [{ vang: 7000 }, { ngoc: 60 }, { ruong: 'vang' }],
    40: [{ vang: 8000 }, { ngoc: 70 }, { ruong: 'vang', n: 2 }, { tt: 3 }], 50: [{ vang: 10000 }, { ngoc: 80 }, { ruong: 'hh', n: 1 }],
    60: [{ vang: 10000 }, { ngoc: 80 }, { ruong: 'hh', n: 2 }], 70: [{ vang: 12500 }, { ngoc: 80 }, { ruong: 'hh', n: 2 }, { tt: 5 }],
  },
};
const MOCW = {
  ds: () => Object.keys(MOCWC.moc).map(Number).sort((a, b) => a - b),
  st() {
    const c = CD.st(); let s = c.cm;
    if (!s || typeof s !== 'object' || Array.isArray(s)) s = c.cm = {};
    if (!s.nhan || typeof s.nhan !== 'object') s.nhan = {};
    if (!s.qd) { s.qd = 1; const f = c.thap.max | 0; for (const w of this.ds()) if (f > 0 && f >= TT.tangTuWave(w)) s.nhan[w] = 1; } // quy đổi 1 lần từ tầng Leo Tháp đã qua
    return s;
  },
  ke() { const s = this.st(); return this.ds().find(w => !s.nhan[w]) || 0; },
  // hết trận CO-OP tới wave w: phát mọi mốc ≤ w chưa nhận (ghi cờ TRƯỚC) → { ra, moc[] }
  nhan(w) {
    const s = this.st(), ra = { vang: 0, ngoc: 0, the: [], tt: 0 }, moc = [];
    for (const m of this.ds()) { if (w < m || s.nhan[m]) continue; s.nhan[m] = 1; moc.push(m); CD.gop(ra, CD.phat(MOCWC.moc[m], 'cdcm' + m, 'coopmoc')); }
    if (moc.length) KT.luu();
    return { ra, moc };
  },
  kq(k) {
    const chi = document.getElementById('kq-chi'); if (!chi || !k) return;
    const r = this.nhan(Math.max(1, k.wave | 0)); if (!r.moc.length) return;
    chi.insertAdjacentHTML('beforeend', '<div class="tb-kq cd-kq dd-xd"><small>FIRST TIME · WAVE ' + Math.max.apply(null, r.moc) + '</small>' + CDDUI.thuongHtml(r.ra) + '</div>');
    try { OT.quet(chi); } catch (e) { }
  },
};

// ===================================================== CÚP PVP · TÚI THẮNG · ĐỒNG ĐỘI CHO NGƯỜI MỚI (theo DCDW, người dùng chốt 11/11 19:06) =====================================================
//  · CÚP: thắng PVP +30, thua −20 (không âm). Mốc cúp CAO NHẤT đạt lần đầu → thưởng 1 lần (ghi cờ trước khi phát). Lưu: turret_kt.cd.cup { c, max, nhan }.
//  · ĐỐI THỦ MÁY theo cúp (CUPC.doKho): bậc ụ được dùng + cấp thẻ → người mới 0 cúp gặp bộ Trắng / Xanh cấp đầu.
//  · TÚI THẮNG: thắng PVP → Rương Trận rơi với xác suất CUPC.pRuong, TẤT ĐỊNH theo hạt trận (rngHat); thua PVP: chỉ vàng. Game chưa có khe rương hẹn giờ
//    → rương mở ngay như cũ (KHÔNG dựng khe / trần 4 rương).
//  · CO-OP: chơi và nhận thưởng KHÔNG giới hạn như cũ (người dùng 19:08 bác "3 lượt thưởng / ngày" — không làm).
//  · NGƯỜI MỚI (cấp phi công ≤ MOIC.cap): đồng đội máy CO-OP dùng bộ cố định toàn ụ gây sát thương Trắng / Xanh (MOIC.bo) thay vì ngẫu nhiên.
const CUPC = {
  thang: 30, thua: 20, pRuong: 0.6,
  moc: {
    100: [{ vang: 500 }, { ruong: 'thuong' }], 200: [{ vang: 1000 }, { ngoc: 20 }], 300: [{ ngoc: 30 }, { ruong: 'thuong', n: 2 }], 500: [{ vang: 2000 }, { ruong: 'vang' }],
    700: [{ vang: 3000 }, { ngoc: 50 }], 1000: [{ ruong: 'vang', n: 2 }, { tt: 1 }], 1300: [{ vang: 5000 }, { ruong: 'hh', n: 1 }], 1600: [{ ngoc: 80 }, { ruong: 'hh', n: 1 }],
    2000: [{ vang: 8000 }, { ruong: 'hh', n: 2 }, { tt: 2 }], 2500: [{ vang: 10000 }, { ruong: 'hh', n: 3 }, { tt: 3 }],
  },
  // [từ cúp, bậc cao nhất của bộ đối thủ, cấp thẻ: số = trần so với mức trung bình của người chơi · 'tb' = bằng · 'tb+1', hệ số MANA đối thủ nhận khi diệt quái]
  doKho: [[0, 'xanh', 0, 0.6], [200, 'tim', 2, 0.8], [500, 'vang', 'tb', 1], [1000, 'do', 'tb', 1], [2000, 'do', 'tb+1', 1]],
};
const CUP = {
  st() {
    const c = CD.st(); let s = c.cup;
    if (!s || typeof s !== 'object' || Array.isArray(s)) s = c.cup = {};
    s.c = Math.max(0, s.c | 0); s.max = Math.max(s.c, s.max | 0); if (!s.nhan || typeof s.nhan !== 'object') s.nhan = {};
    return s;
  },
  ds: () => Object.keys(CUPC.moc).map(Number).sort((a, b) => a - b),
  ke() { const s = this.st(); return this.ds().find(m => !s.nhan[m]) || 0; },
  muc(c) { let m = CUPC.doKho[0]; for (const x of CUPC.doKho) if (c >= x[0]) m = x; return m; },
  // bộ + cấp thẻ của đối thủ máy theo cúp (bốc bằng deckNgauNhien của game — như deckDoiThu: ≥ 3 ụ gây sát thương, ≤ 1 hỗ trợ)
  doiThu(c) {
    const m = this.muc(c), tt = TIERS[m[1]].thuTu, tru = (G.roster || []).filter(r => TIERS[r.bac].thuTu > tt).map(r => r.id);
    let d = null;
    for (let lan = 0; lan < 40; lan++) { const x = deckNgauNhien(tru); if (x.length === 5 && x.filter(id => SKILLS[id].dmg && SKILLS[id].vai !== 'ht').length >= 3 && x.filter(id => SKILLS[id].vai === 'ht').length <= 1) { d = x; break; } }
    if (!d) d = deckNgauNhien(tru);
    const cm = THEBAI.capMay(d), cap = {};
    for (const id of d) cap[id] = typeof m[2] === 'number' ? Math.min(cm[id] | 0, m[2]) : m[2] === 'tb+1' ? Math.min((cm[id] | 0) + 1, THE.maxLv(THEBAI.bac(id)) - THE.lvDau[THEBAI.bac(id)]) : cm[id] | 0;
    return { deck: d, cap, mana: m[3] };
  },
  roi(hat) { return rngHat(((hat | 0) * 7919 + 4421) | 0)() < CUPC.pRuong; }, // túi thắng: tất định theo hạt trận
  // hết trận PVP: đổi cúp + mốc lần đầu → { d, c, ra, moc }
  ket(thang) {
    const s = this.st(), c0 = s.c;
    s.c = Math.max(0, s.c + (thang ? CUPC.thang : -CUPC.thua)); s.max = Math.max(s.max, s.c);
    const ra = { vang: 0, ngoc: 0, the: [], tt: 0 }, moc = [];
    for (const m of this.ds()) { if (s.max < m || s.nhan[m]) continue; s.nhan[m] = 1; moc.push(m); CD.gop(ra, CD.phat(CUPC.moc[m], 'cdcup' + m, 'cup')); }
    KT.luu();
    return { d: s.c - c0, c: s.c, ra, moc };
  },
  kq(k) {
    const chi = document.getElementById('kq-chi'); if (!chi || !k) return;
    const r = this.ket(!!k.thang), ke = this.ke();
    let h = '<div class="tb-kq cd-kq dd-xd"><small>CUPS ' + CDUI.so(r.c) + ' (' + (r.d >= 0 ? '+' : '−') + Math.abs(r.d) + ')' + (ke ? ' · NEXT PRIZE ' + CDUI.so(ke) : '') + '</small>';
    if (r.moc.length) h += '<small>CUP MILESTONE · ' + CDUI.so(Math.max.apply(null, r.moc)) + '</small>' + CDDUI.thuongHtml(r.ra);
    chi.insertAdjacentHTML('beforeend', h + '</div>');
    try { OT.quet(chi); } catch (e) { }
  },
};
const MOIC = { cap: 5, bo: ['tia', 'lien', 'set', 'sungluc', 'laser', 'mortar', 'phun', 'maychem'] };
// bộ cố định của đồng đội máy cho người mới: 5 ụ gây sát thương Trắng / Xanh đầu tiên trong MOIC.bo
function boDongDoiMoi() { const d = MOIC.bo.filter(id => SKILLS[id] && G.rosterMap[id] && SKILLS[id].dmg && SKILLS[id].vai !== 'ht' && TIERS[G.rosterMap[id].bac].thuTu <= TIERS.xanh.thuTu).slice(0, 5); return d.length === 5 ? d : null; }

(function () {
  if (typeof KT === 'undefined' || typeof TT === 'undefined' || typeof CD === 'undefined' || typeof CDD === 'undefined' || typeof batDau !== 'function') return;
  if (typeof UP_XEM !== 'undefined' && UP_XEM) return; // khung xem trước trang ụ
  if (!KT.NGUON.includes('race')) KT.NGUON.splice(KT.NGUON.length - 1, 0, 'race');
  try { DD.st(); } catch (e) { console.error('DD', e); }
  TTC.tn.dd = { hd: 1, ten: 'RACE TRACK' }; // mở sau hướng dẫn

  // ---- trận ----
  const bd = batDau;
  batDau = function (che, deck, mv) {
    const c = DD.cho; DD.cho = null; DD.lap = false; G.dd = null;
    try { const nh = document.querySelector('#tb-wave [data-t="wave"]'); if (nh && nh.dataset.dd) { delete nh.dataset.dd; nh.textContent = TEXT.ui.wave; } } catch (e) { } // trả nhãn WAVE cho chế độ khác
    if (!c || che !== 'coop') return bd.apply(this, arguments);
    G.dd = Object.assign({}, c, { t0: null, tKe: 0, tTrum: DDC.trumMoi, n: 0, nT: 0, giet: 0, diem: 0, don: 0, donCan: 0, _hs: 1, het: false,
      r: rngHat((c.hat * 2654435761 + 97) | 0), rT: rngHat((c.hat * 2246822519 + 131) | 0) });
    const d2 = G.debug.deck2;
    if (!d2) G.debug.deck2 = deck.slice();     // đồng đội máy dùng cùng bộ bài (điểm không phụ thuộc bộ ngẫu nhiên của máy)
    let r; try { r = bd.call(this, che, deck, mv); } finally { if (!d2) delete G.debug.deck2; }
    try { G.cho = DDC.prep; G.ban[0].tim = DDC.tim; } catch (e) { console.error('DD', e); G.dd = null; }
    return r;
  };
  const wm = wavMoi;
  wavMoi = function () {
    const d = G.dd; if (!d) return wm.apply(this, arguments);
    G.tWave = 0; G.laTrum = false; // không bảng WAVE, không hàng sinh theo wave (chặng G.wave do DD.buoc đặt theo đồng hồ)
    if (d.t0 == null) { G.wave = 1; d.t0 = G.t; try { SND.nhac(1); } catch (e) { } try { FX.chu1(W / 2, H / 2 - 40, 'GO!', '#71E4EE', 30, 'to'); } catch (e) { } }
  };
  const sq = sinhQuai;
  sinhQuai = function (id, pi, s, hs, gui) {
    const d = G.dd; if (!d) return sq.apply(this, arguments);
    return sq.call(this, id, pi, s, (hs || 1) * DD.hs(d) * (d._hs || 1), gui); // cả con tách ra: máu theo số đã diệt, không theo chặng
  };
  const ch = chet;
  chet = function (E, B) {
    const d = G.dd, da = !E || E.chet, r = ch.apply(this, arguments);
    if (d && !da && E.chet && E.ddW) { d.giet++; d.diem += E.ddW; }
    return r;
  };
  // mana mỗi mạng: công thức GỐC 10 + 2·(chặng − 1) — không nhân hệ số "bù ít quái" của wave thường (11/11 cân bằng wave), vì Đường Đua vốn đông quái
  if (typeof manaGietGoc === 'function') { const mg = manaGiet; manaGiet = function (w) { return G.dd ? manaGietGoc(w) : mg.apply(this, arguments); }; }
  const cn = capNhat;
  capNhat = function () { if (G.dd) { try { DD.buoc(); } catch (e) { console.error('DD', e); } } return cn.apply(this, arguments); };
  const ct = coTrum; coTrum = function (w) { return G.dd ? false : ct.apply(this, arguments); };
  // hết giờ = xong lượt (thắng); hết tim / bỏ cuộc = dừng sớm — điểm vẫn giữ
  const kt0 = ketThuc;
  ketThuc = function (thang, ly) {
    const d = G.dd; if (!d || G.ketThuc || !G.ban.length) return kt0.apply(this, arguments);
    const x = kt0.call(this, true, d.het ? 'Time up' : d.bo ? 'Left the race · score kept' : 'Out of lives · score kept'); // luôn "không thua": hết tim / bỏ cuộc dùng khung TRUNG TÍNH (DDUI.kq)
    setTimeout(() => { try { document.documentElement.classList.remove('cg-thua'); } catch (e) { } }, 0); // camgiac.js tô màn thua theo đối số gốc của lot()
    if (G.ketThuc) G.ketThuc.dd = { het: !!d.het, diem: d.diem, giet: d.giet, t: Math.max(1, Math.min(DDC.gio, Math.round(d.t0 == null ? 0 : G.t - d.t0))) };
    return x;
  };
  // bỏ cuộc (menu tạm dừng): kết thúc lượt, vẫn có màn kết quả + điểm
  document.addEventListener('click', (e) => {
    const el = e.target.closest && e.target.closest('#dung [data-act="bo"]'); if (!el || !G.dd || G.ketThuc || !G.ban.length) return;
    e.stopImmediatePropagation(); e.preventDefault();
    G.dung = false; const p = document.getElementById('dung'); if (p) p.hidden = true;
    G.dd.bo = true; ketThuc(false);
  }, true);
  // HUD: không báo trước trùm theo chu kỳ wave; màn mở đầu không có danh sách trùm
  if (typeof HT !== 'undefined' && HT.theoDoi) { const td = HT.theoDoi; HT.theoDoi = function () { if (G.dd) return; return td.apply(this, arguments); }; }
  if (typeof VT !== 'undefined' && VT.dsTrum) {
    const ds = VT.dsTrum; VT.dsTrum = function () { return G.dd ? [] : ds.apply(this, arguments); };
    if (VT.dung) { const dg = VT.dung; VT.dung = function () { if (!G.dd) return dg.apply(this, arguments); const b = this.CHU.boss; this.CHU.boss = 'RACE TRACK · 8:00'; try { return dg.apply(this, arguments); } finally { this.CHU.boss = b; } }; }
  }
  const bocHud = () => {
    if (UI._ddHud) return; UI._ddHud = 1;
    const g = UI.capNhat; UI.capNhat = function () { const r = g.apply(this, arguments); try { DDUI.chip(); } catch (e) { } return r; };
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(bocHud, 10), { once: true }); else setTimeout(bocHud, 10);

  // ---- màn kết quả: bỏ kỷ lục wave CO-OP / túi trận / nhiệm vụ theo wave (như chế độ C, D) ----
  if (typeof UI !== 'undefined' && UI.ketQua) {
    const kq = UI.ketQua;
    UI.ketQua = function (k) {
      const c = G.dd; if (!c) return kq.apply(this, arguments);
      const dw = G.debug.wave, lb = typeof KQ !== 'undefined' ? KQ.luuBest : null;
      G.debug.wave = -1; if (lb) KQ.luuBest = function () { };
      let x;
      try { x = kq.apply(this, arguments); } finally { G.debug.wave = dw; if (lb) KQ.luuBest = lb; if (!dw) delete G.debug.wave; }
      try { DDUI.kq(k, c); } catch (e) { console.error('DD', e); }
      return x;
    };
  }
  document.addEventListener('click', (e) => { // RACE AGAIN (pha capture, trước ui.js)
    const el = e.target.closest && e.target.closest('#ketqua [data-act="choilai"]'); if (!el || !G.dd || !DD.lap) return;
    DD.cho = DD.cauHinh(); UI.che = 'coop'; if (typeof KQ !== 'undefined' && KQ.m) KQ.m.che = 'coop';
  }, true);
  document.addEventListener('click', (e) => { const el = e.target.closest && e.target.closest('[data-act="doibo"], [data-act="bo"]'); if (el) { DD.cho = null; DD.lap = false; } }, true);

  // ---- HOME: mục RACE TRACK trong GAME MODE ----
  if (typeof HM !== 'undefined') {
    HM.CHE.dd = { ten: 'RACE TRACK', ic: DDC.ICON, phu: () => 'Week best ' + (DD.st().best ? CDUI.so(DD.st().best) : '—'), mo: '8 minutes with an AI ally · beat your weekly score' };
    const khoa = () => !TT.tnMo('dd');
    const cc = HM.chonChe;
    HM.chonChe = function (k) {
      if (k !== 'dd') return cc.apply(this, arguments);
      if (khoa()) { TTUI.toast(TT.tnChu('dd')); return; }
      this.che = 'dd'; UI.che = 'coop'; this.luu(); try { SND.nut(); } catch (e) { } this.dong(); this.ve();
    };
    const ch2 = HM.choi;
    HM.choi = function () {
      if (this.che !== 'dd') return ch2.apply(this, arguments);
      if (khoa()) { TTUI.toast(TT.tnChu('dd')); return; }
      if (UI.chon.length !== 5) { if (!this.el('chon').classList.contains('xem-dk') || this.bst) this.di('dk'); UI.nhac('Pick 5 turrets'); return; }
      UI.che = 'coop'; this.luuBo();
      try { SND.nut(); } catch (e) { }
      DDUI.mo();
    };
    const ini = UI.init;
    UI.init = async function () {
      const r = await ini.apply(this, arguments);
      try { const l = JSON.parse(localStorage.getItem(HM.KEY) || 'null'); if (l && l.che === 'dd' && !khoa() && !G.debug.mode) { HM.che = 'dd'; UI.che = 'coop'; HM.ve(); } } catch (e) { }
      return r;
    };
  }
  // ---- MỐC WAVE CO-OP: phát ở màn kết quả trận CO-OP thật (không phải Đường Đua / hướng dẫn / trận thử ?mana ?wave) ----
  if (!KT.NGUON.includes('coopmoc')) KT.NGUON.splice(KT.NGUON.length - 1, 0, 'coopmoc');
  try { MOCW.st(); } catch (e) { console.error('MOCW', e); }
  if (typeof UI !== 'undefined' && UI.ketQua) {
    const kq2 = UI.ketQua;
    UI.ketQua = function (k) {
      const x = kq2.apply(this, arguments);
      try { if (G.che === 'coop' && !G.dd && !(typeof KQ !== 'undefined' && KQ.m && KQ.m.tut) && !(G.debug && (G.debug.mana || G.debug.wave || G.debug.fill))) MOCW.kq(k); } catch (e) { console.error('MOCW', e); }
      return x;
    };
  }
  if (typeof HM !== 'undefined' && HM.CHE.coop) {
    // ---- HƯỚNG DẪN là một bản riêng: mục TUTORIAL trong GAME MODE = chơi lại trận hướng dẫn (huongdan.js HD.batDau, bộ + luật cố định của nó) ----
    if (typeof HD !== 'undefined') {
      HM.CHE.hd = { ten: 'TUTORIAL', ic: 'ic_solo', phu: () => '', mo: 'One guided battle: summon, merge, commander, boss · replay any time' };
      const cc2 = HM.chonChe;
      HM.chonChe = function (k) { if (k !== 'hd') return cc2.apply(this, arguments); try { SND.nut(); } catch (e) { } this.dong(true); HD.batDau(); };
    }
  }
  { // gộp hồ sơ Firebase: cờ mốc OR
    const gp2 = KT.gop;
    KT.gop = function (o) {
      let a = null; const b = o && o.kt && o.kt.cd && o.kt.cd.cm;
      try { a = JSON.parse(JSON.stringify(MOCW.st())); } catch (e) { }
      const x = gp2.apply(this, arguments);
      try { const s = MOCW.st(); for (const y of [a, b]) if (y && typeof y === 'object') for (const i in (y.nhan || {})) if (y.nhan[i]) s.nhan[i] = 1; KT.luu(true); } catch (e) { console.error('MOCW', e); }
      return x;
    };
  }

  // ---- CÚP PVP + đối thủ theo cúp · đồng đội cố định cho người mới · túi thắng ----
  for (const n of ['cup']) if (!KT.NGUON.includes(n)) KT.NGUON.splice(KT.NGUON.length - 1, 0, n);
  try { CUP.st(); } catch (e) { console.error('CUP', e); }
  {
    const bd2 = batDau;
    batDau = function (che, deck, mv) {
      const tu = G.debug.deck2 || G.debug.cap2 || (typeof ONS !== 'undefined' && ONS.on) || (typeof HD !== 'undefined' && HD.dang) || G.dd || DD.cho;
      let dat = false, hsM = 1;
      try {
        if (!tu && che === 'pvp') { const x = CUP.doiThu(CUP.st().c); G.debug.deck2 = x.deck; G.debug.cap2 = x.cap; hsM = x.mana; dat = true; }
        else if (!tu && che === 'coop' && TT.cap() <= MOIC.cap) { const d = boDongDoiMoi(); if (d) { G.debug.deck2 = d; dat = true; } }
      } catch (e) { console.error('CUP', e); }
      try { return bd2.apply(this, arguments); } finally { G.cupM = hsM; if (dat) { delete G.debug.deck2; delete G.debug.cap2; } }
    };
    // đối thủ máy ở mức cúp thấp nhận ít mana hơn mỗi mạng (G.cupM < 1) — chỉ đọc / ghi trạng thái trận, tất định
    const ch2 = chet;
    chet = function (E, B) {
      const B1 = G.che === 'pvp' && G.cupM < 1 && G.ban[1] && G.ban[1].ai ? G.ban[1] : null, m0 = B1 ? B1.mana : 0, n0 = B1 ? B1.manaNay : 0;
      const r = ch2.apply(this, arguments);
      if (B1 && B1.mana > m0) { const bo = (B1.mana - m0) * (1 - G.cupM); B1.mana -= bo; B1.manaNay = Math.max(n0, B1.manaNay - bo); }
      return r;
    };
    // Rương Trận (thebai.js): PVP = túi thắng (thắng + trúng xác suất tất định mới có thẻ; không thì chỉ vàng) · CO-OP giữ như cũ
    const th = THEBAI.thuong;
    THEBAI.thuong = function (k, m) {
      if (!m || m.tut || m._thuong || G.dd) return th.apply(this, arguments);
      const khong = m.che === 'pvp' && !(k && k.thang && CUP.roi(G.hat));
      if (!khong) return th.apply(this, arguments);
      const sl = THEBAI.soLuot; THEBAI.soLuot = () => 0;
      try { return th.apply(this, arguments); } finally { THEBAI.soLuot = sl; }
    };
    const kq3 = UI.ketQua;
    UI.ketQua = function (k) {
      const tut = typeof KQ !== 'undefined' && KQ.m && KQ.m.tut, thu = G.debug && (G.debug.mana || G.debug.wave || G.debug.fill);
      const kq0 = document.getElementById('ketqua'); if (kq0) kq0.classList.remove('dd-tt');
      if (G.dd || tut || thu || !G.ban.length) return kq3.apply(this, arguments);
      const x = kq3.apply(this, arguments);
      try { if (G.che === 'pvp') CUP.kq(k); } catch (e) { console.error('CUP', e); }
      return x;
    };
    if (typeof HM !== 'undefined') {
      // GAME MODE: dòng CO-OP / PVP ngắn (≤ 2 dòng) + mốc kế / cúp; HOME: ô BEST → CUPS
      if (HM.CHE.coop) Object.defineProperty(HM.CHE.coop, 'mo', { configurable: true, get() { let w = 0; try { w = MOCW.ke(); } catch (e) { } return 'AI ally · 3 shared lives' + (w ? ' · next prize: wave ' + w : ''); } });
      if (HM.CHE.pvp) {
        Object.defineProperty(HM.CHE.pvp, 'mo', { configurable: true, get() { let c = 0, ke = 0; try { c = CUP.st().c; ke = CUP.ke(); } catch (e) { } return 'Beat an AI rival · cups ' + CDUI.so(c) + (ke ? ' · next prize: ' + CDUI.so(ke) : ''); } });
        HM.CHE.pvp.phu = () => 'Cups ' + CDUI.so(CUP.st().c);
      }
      const vh = HM.veHome;
      HM.veHome = function () {
        const r = vh.apply(this, arguments);
        try { const b = this.el('hm-best'), nh = b && b.previousElementSibling; if (b) b.textContent = CDUI.so(CUP.st().c); if (nh && nh.dataset.cup !== '1') { nh.dataset.cup = '1'; nh.textContent = 'CUPS'; } } catch (e) { }
        return r;
      };
    }
    // gộp hồ sơ Firebase: cúp lấy lớn nhất, cờ mốc OR
    const gp3 = KT.gop;
    KT.gop = function (o) {
      let a = null; const cd = o && o.kt && o.kt.cd, b = cd && cd.cup;
      try { a = JSON.parse(JSON.stringify(CUP.st())); } catch (e) { }
      const x = gp3.apply(this, arguments);
      try {
        const s = CUP.st();
        for (const y of [a, b]) if (y && typeof y === 'object') { s.c = Math.max(s.c, y.c | 0); s.max = Math.max(s.max, y.max | 0, s.c); for (const i in (y.nhan || {})) if (y.nhan[i]) s.nhan[i] = 1; }
        KT.luu(true);
      } catch (e) { console.error('CUP', e); }
      return x;
    };
  }
  // hướng dẫn: màn mở đầu trận chỉ nói tới trùm wave 10 của hướng dẫn (không liệt kê trùm wave 20 / 30)
  if (typeof VT !== 'undefined' && VT.dsTrum && typeof HD !== 'undefined') { const ds3 = VT.dsTrum; VT.dsTrum = function () { return HD.dang ? [HD.WAVE_TRUM] : ds3.apply(this, arguments); }; }

  // ---- HOME → EVENT: thẻ Đường Đua + bảng xếp hạng ở đầu tab sự kiện ----
  if (typeof KTUI !== 'undefined' && KTUI.ve_sk) { const g = KTUI.ve_sk; KTUI.ve_sk = function () { let t = ''; try { t = DDUI.theSk(); } catch (e) { console.error('DD', e); } return t + g.apply(this, arguments); }; }

  // ---- gộp hồ sơ Firebase: kỷ lục lấy lớn nhất, cờ mốc OR (cùng tuần) ----
  const gp = KT.gop;
  KT.gop = function (o) {
    let a = null; const b = o && o.kt && o.kt.cd && o.kt.cd.dd;
    try { a = JSON.parse(JSON.stringify(DD.st())); } catch (e) { }
    const x = gp.apply(this, arguments);
    try {
      const s = DD.st();
      for (const y of [a, b]) {
        if (!y || typeof y !== 'object') continue;
        s.all = Math.max(s.all, y.all | 0);
        if (y.tuan !== s.tuan) continue;
        const d = y.best | 0, t = y.bestT | 0;
        if (d > s.best || (d === s.best && d > 0 && t < s.bestT)) { s.best = d; s.bestT = t; }
        for (const i in (y.nhan || {})) if (y.nhan[i]) s.nhan[i] = 1;
      }
      KT.luu(true);
    } catch (e) { console.error('DD', e); }
    return x;
  };

  // ---- bấm ----
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-act^="dd-"]'); if (!b || b.disabled) return;
    const a = b.dataset.act; e.stopPropagation();
    try { SND.nut(); } catch (er) { }
    if (a === 'dd-vao') DD.vao();
    else if (a === 'dd-sk') { // HOME → EVENT: đóng màn sự kiện rồi mở bảng Đường Đua ở HOME (#tt-phu)
      try { if (typeof KTUI !== 'undefined' && KTUI.mo) KTUI.dong(); } catch (er) { }
      if (!TT.tnMo('dd')) TTUI.toast(TT.tnChu('dd')); else if (UI.chon.length !== 5) UI.nhac('Pick 5 turrets'); else DDUI.mo();
    }
  });

  // ---- Tiếng Việt (ngonngu.js: từ điển mẫu, # = số) ----
  if (typeof VI_MAU !== 'undefined') Object.assign(VI_MAU, {
    // 11/11 bỏ Leo Tháp + hướng dẫn riêng + mốc wave CO-OP
    'Reach wave #': 'Đạt wave #', 'PLAY CO-OP': 'CHƠI CO-OP', 'CO-OP: wave #': 'CO-OP: wave #', 'BEST WAVE #': 'WAVE CAO NHẤT #', 'BEST WAVE': 'WAVE CAO NHẤT',
    'Pilot Level # and wave #': 'Cấp phi công # và wave #', 'Unlocks at Pilot Level # and wave #': 'Mở ở cấp phi công # và wave #',
    'Locked · reach wave # or unlock with gems': 'Đang khoá · đạt wave # hoặc mở bằng ngọc', 'Wave # or # gems': 'Wave # hoặc # ngọc',
    'Play # battles within # waves of your best': 'Chơi # trận cách wave cao nhất không quá # wave', 'CO-OP · PVP': 'CO-OP · PVP',
    'FIRST TIME · WAVE #': 'LẦN ĐẦU · WAVE #', 'TUTORIAL': 'HƯỚNG DẪN', 'One guided battle: summon, merge, commander, boss · replay any time': 'Một trận có hướng dẫn: triệu hồi, ghép, chỉ huy, trùm · chơi lại bất cứ lúc nào',
    'Battle rewards · Gold Chest · Daily Specials · CO-OP wave milestones · first boss kills · daily quest · Shard Forge · Legendary Seal': 'Thưởng trận · Rương Vàng · Ưu đãi hôm nay · mốc wave CO-OP · hạ trùm lần đầu · nhiệm vụ ngày · Lò rèn · Ấn Vàng',
    'Mythic / Gold Chest · Daily Specials (~# day a week) · CO-OP waves #, #, # · defeat all bosses · event #,# pts · Shard Forge': 'Rương Thần thoại / Vàng · Ưu đãi hôm nay (~# ngày/tuần) · CO-OP wave #, #, # · hạ đủ trùm · sự kiện #.# điểm · Lò rèn',
    'Mythic / Gold Chest · Daily Specials (~# day a week) · CO-OP waves #, #, # · defeat all bosses · event # pts · Shard Forge': 'Rương Thần thoại / Vàng · Ưu đãi hôm nay (~# ngày/tuần) · CO-OP wave #, #, # · hạ đủ trùm · sự kiện # điểm · Lò rèn',
    // 11/11 19:06 cúp PVP · túi thắng · lượt thưởng CO-OP
    'CUPS': 'CÚP', 'Cups #': 'Cúp #', 'Cups #,#': 'Cúp #.#', 'CUPS # (+#)': 'CÚP # (+#)', 'CUPS # (−#)': 'CÚP # (−#)', 'CUPS #,# (+#)': 'CÚP #.# (+#)', 'CUPS #,# (−#)': 'CÚP #.# (−#)',
    'CUPS # (+#) · NEXT PRIZE #': 'CÚP # (+#) · MỐC KẾ #', 'CUPS # (−#) · NEXT PRIZE #': 'CÚP # (−#) · MỐC KẾ #', 'CUPS # (+#) · NEXT PRIZE #,#': 'CÚP # (+#) · MỐC KẾ #.#', 'CUPS # (−#) · NEXT PRIZE #,#': 'CÚP # (−#) · MỐC KẾ #.#',
    'CUPS #,# (+#) · NEXT PRIZE #,#': 'CÚP #.# (+#) · MỐC KẾ #.#', 'CUPS #,# (−#) · NEXT PRIZE #,#': 'CÚP #.# (−#) · MỐC KẾ #.#',
    'CUP MILESTONE · #': 'MỐC CÚP · #', 'CUP MILESTONE · #,#': 'MỐC CÚP · #.#',
    'Beat an AI rival · cups #': 'Thắng đối thủ máy · cúp #', 'Beat an AI rival · cups # · next prize: #': 'Thắng đối thủ máy · cúp # · mốc kế: #', 'Beat an AI rival · cups # · next prize: #,#': 'Thắng đối thủ máy · cúp # · mốc kế: #.#',
    'Beat an AI rival · cups #,# · next prize: #,#': 'Thắng đối thủ máy · cúp #.# · mốc kế: #.#', 'Beat an AI rival · cups #,#': 'Thắng đối thủ máy · cúp #.#',
    'AI ally · # shared lives': 'Đồng đội máy · # mạng chung', 'AI ally · # shared lives · next prize: wave #': 'Đồng đội máy · # mạng chung · mốc kế: wave #',
    'RACE TRACK': 'ĐƯỜNG ĐUA', '8 minutes with an AI ally · beat your weekly score': '8 phút cùng đồng đội máy · vượt điểm tuần của bạn',
    'Week best #': 'Điểm tuần #', 'Week best #,#': 'Điểm tuần #.#', 'Week best —': 'Điểm tuần —',
    'Week # · best #,#': 'Tuần # · cao nhất #.#',
    'You and an AI ally hold the track for # minutes. No waves: enemies never stop, and every kill makes the next ones tougher. A mini boss comes every # minutes. Score = enemies defeated.':
      'Bạn và đồng đội máy giữ đường đua trong # phút. Không chia đợt: quái ra liên tục, mỗi con bị diệt làm các con sau trâu hơn. Trùm nhỏ xuất hiện mỗi # phút. Điểm = số quái đã diệt.',
    'TIME': 'THỜI GIAN', 'KO': 'HẠ', 'TIME UP!': 'HẾT GIỜ!', 'RACE OVER': 'KẾT THÚC ĐUA', 'RACE TRACK · WEEK # · #:#': 'ĐƯỜNG ĐUA · TUẦN # · #:#', 'START RACE': 'BẮT ĐẦU ĐUA', 'RACE AGAIN': 'ĐUA LẠI', 'SCORE': 'ĐIỂM', 'KILLS': 'DIỆT', 'GO!': 'XUẤT PHÁT!',
    '# PTS': '# ĐIỂM', '#,# PTS': '#.# ĐIỂM', '#:# · # PTS': '#:# · # ĐIỂM', '#:# · #,# PTS': '#:# · #.# ĐIỂM',
    'RACE TRACK · WEEK #': 'ĐƯỜNG ĐUA · TUẦN #', 'RACE TRACK · #:#': 'ĐƯỜNG ĐUA · #:#', 'RACE TRACK · WEEK': 'ĐƯỜNG ĐUA · TUẦN',
    'Time up': 'Hết giờ', 'Out of lives · score kept': 'Hết mạng · giữ điểm', 'Left the race · score kept': 'Đã rời đường đua · giữ điểm',
    'LAST WEEK\'S RACE · NOT COUNTED': 'LƯỢT ĐUA TUẦN TRƯỚC · KHÔNG TÍNH',
    'MILESTONE REWARDS · # PTS': 'THƯỞNG MỐC · # ĐIỂM', 'MILESTONE REWARDS · #,# PTS': 'THƯỞNG MỐC · #.# ĐIỂM',
  });
})();
