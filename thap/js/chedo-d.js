// ASTRAL ARSENAL — GIAI ĐOẠN D: VÔ TẬN (ENDLESS, nối tiếp tầng 100 LEO THÁP) · THỬ THÁCH TUẦN (WEEKLY CHALLENGE) · BẢNG XẾP HẠNG (LEADERBOARD)
//  Thiết kế: docs/demo-hop-tuong/tuvan/che-do-d/THIET-KE.md. Dùng lại khung chế độ C (chedo-c.js): CD.dsQuai / CD.apDot / CD.phat (Tinh thể Đỏ),
//  bảng GAME MODE (HM.CHE), lớp phủ TTUI.phu, ô thưởng KTUI.rIc.
//  · VÔ TẬN gắn vào LEO THÁP (người dùng 09/11: bỏ Solo, Leo Tháp là chế độ một mình chính): thắng tầng 100 → hỏi FINISH / ENDLESS, đánh tiếp
//    trên cùng bàn từ wave 71. CHỖ HOOK vào chedo-c.js (chỉ đọc, không sửa file đó): CD.st().thap (mở khoá), CD.vao('thap', 100) (vào từ GAME MODE),
//    G.cd (cấu hình tầng 100: hsQ ×3 giữ nguyên), CD.dsQuai / CD.apDot (sinh quái + đột biến ghi lên G.cd), ketThuc(true) do CD.kiem gọi khi
//    hết tầng → bọc ketThuc ở đây; màn kết quả: CDUI.ketQua (thưởng lần đầu tầng 100) chạy trước, khối ENDLESS nối sau.
//  · TẤT ĐỊNH: wave của Vô tận / Thử thách tuần sinh bằng rngHat có hạt — không Math.random trong file này.
//  · Thưởng theo MỐC TUYỆT ĐỐI (1 lần / tuần, ghi cờ TRƯỚC khi phát), không theo thứ hạng. Bảng xếp hạng chỉ để xem.
//  · Lưu: khoá con mới turret_kt.cd.vt (Vô tận) + turret_kt.cd.tw (Thử thách tuần) + turret_kt.cd.lb (điểm chờ gửi) — không đổi khoá cũ.
'use strict';

const CDDC = {
  ICON: { tw: 'ua_ic_sk', vt: 'ua_ts_mana', tt: 'ua_ts_do' },
  beDot: ['NHANH', 'DAY', 'DONG', 'KHONGLO', 'BAY'], // đột biến lúc sinh quái (bảng CDC.dot) — không Glass Core
  vt: {
    w0: 70, tang: 100,                                          // Vô tận bắt đầu sau wave cuối của tầng 100 Leo Tháp (wave 66–70)
    coTrum: (w) => (w <= 90 ? w % 5 === 0 : w <= 100 ? w % 2 === 0 : true),
    dotTu: 101, dotMoi: 10,                                     // từ wave 101: +1 đột biến mỗi 10 wave
    moc: { 80: [{ vang: 2000 }], 90: [{ ngoc: 30 }], 100: [{ tt: 1 }], 110: [{ ngoc: 50 }], 120: [{ ruong: 'hh', n: 1 }] },
  },
  tw: {
    bat: true,                                                  // 10/11: bật (GAME MODE + HOME → EVENT), kiểm tools/thap-kt-thu-thach-tuan.js
    cap: 8, wMax: 50, soDot: 2, capThe: 5, mana: 100, tim: 3,
    bo: ['vang', 'tim', 'tim', 'xanh', 'trang'],               // 1 Vàng + 2 Tím + 1 Xanh + 1 Trắng (không Đỏ)
    moc: { 15: [{ vang: 1000 }], 25: [{ ngoc: 30 }], 35: 'vang', 45: [{ tt: 1 }] },
  },
  lb: { top: 50, wMax: { tw: 51, vt: 999, vtAll: 999 }, choMs: 8000 }, // w tối đa theo rules (§3.2) · đọc quá choMs → ngoại tuyến
};

// ===================================================== LƯU =====================================================
const CDD = {
  st() {
    const c = CD.st(), o = (k) => (c[k] && typeof c[k] === 'object' && !Array.isArray(c[k]) ? c[k] : (c[k] = {}));
    const v = o('vt'); for (const k of ['best', 'bestT', 'tuan', 'tBest', 'tBestT']) v[k] = Math.max(0, +v[k] || 0); if (!v.nhan || typeof v.nhan !== 'object') v.nhan = {};
    const t = o('tw'); for (const k of ['tuan', 'best', 'bestT']) t[k] = Math.max(0, +t[k] || 0); if (!t.nhan || typeof t.nhan !== 'object') t.nhan = {};
    o('lb');
    const tu = KT.tuan();
    if (v.tuan !== tu) { v.tuan = tu; v.tBest = 0; v.tBestT = 0; v.nhan = {}; }
    if (t.tuan !== tu) { t.tuan = tu; t.best = 0; t.bestT = 0; t.nhan = {}; }
    return c;
  },
  // so 2 kết quả: wave cao hơn tốt hơn; bằng wave → thời gian ngắn hơn
  hon: (w, t, w0, t0) => w > w0 || (w === w0 && w0 > 0 && t < t0),
  phat(ds, khoa, nguon) { return CD.phat(ds, khoa, nguon); },
  // mốc tuần: phát mọi mốc ≤ wave chưa nhận (ghi cờ trước) → { ra, moc[] }
  nhanMoc(s, bang, w, khoa, nguon, doiMoc) {
    const ra = { vang: 0, ngoc: 0, the: [], tt: 0 }, moc = [];
    for (const m of Object.keys(bang).map(Number).sort((a, b) => a - b)) {
      if (w < m || s.nhan[m]) continue;
      s.nhan[m] = 1; moc.push(m);
      CD.gop(ra, this.phat(doiMoc ? doiMoc(m, bang[m]) : bang[m], khoa + s.tuan + ':' + m, nguon));
    }
    return { ra, moc };
  },
};

// ===================================================== VÔ TẬN =====================================================
const VOTAN = {
  cho: false,  // trận tầng 100 kế tiếp tự vào Vô tận khi qua (vào từ GAME MODE → ENDLESS)
  moKhoa() { try { return CD.st().thap.max >= CDDC.vt.tang || CDD.st().vt.best > 0; } catch (e) { return false; } },
  laTang100: () => !!(G.cd && G.cd.loai === 'thap' && G.cd.id === CDDC.vt.tang),
  on() { return !!(G.vt && G.vt.on); },
  coTrum(w) { return w > CDDC.vt.w0 && CDDC.vt.coTrum(w); },
  trumKe(w) { let x = w + 1; while (!this.coTrum(x) && x < w + 20) x++; return x; },
  // trùm của wave w > 70: bốc tuần tự theo hạt trận, không lặp liền
  trum(w) {
    const L = G.vt.tr || (G.vt.tr = { w: CDDC.vt.w0, cu: null, ds: {} });
    while (L.w < w) {
      L.w++; if (!this.coTrum(L.w)) continue;
      const be = typeof trumBe === 'function' ? trumBe(L.w) : CD.dsTrum(), r = rngHat(((G.hat || 1) * 2246822519 + L.w * 3266489917 + 11) | 0);
      let id, lan = 0; do id = be[Math.floor(r() * be.length)]; while (id === L.cu && be.length > 1 && ++lan < 20);
      L.ds[L.w] = L.cu = id;
    }
    return L.ds[w] || CD.dsTrum()[0];
  },
  // đột biến đang có ở wave w: +1 mỗi 10 wave từ 101, bốc theo (tuần, chặng) — như nhau với mọi người trong tuần
  dot(w) {
    if (w < CDDC.vt.dotTu) return [];
    const n = Math.min(CDDC.beDot.length, 1 + Math.floor((w - CDDC.vt.dotTu) / CDDC.vt.dotMoi)), con = CDDC.beDot.slice(), ds = [];
    for (let i = 0; i < n; i++) { const r = rngHat(KT.bam('vt:' + (G.vt.tuan || KT.tuan()) + ':' + i)); ds.push(con.splice(Math.floor(r() * con.length), 1)[0]); }
    return ds;
  },
  bat(tu) {
    G.vt = { on: true, tu: !!tu, tuan: KT.tuan(), tr: null };
    if (G.cd) { G.cd.het = false; G.vt.dot0 = (G.cd.dot || []).slice(); } // CD.kiem thôi gọi "hết tầng"
    try { FX.chu1(W / 2, H / 2 - 40, 'ENDLESS', '#71E4EE', 30, 'to'); } catch (e) { }
    try { UI.nhac('ENDLESS · wave ' + (CDDC.vt.w0 + 1) + '+'); } catch (e) { }
  },
  wave() {
    G.wave++;
    const w = G.wave, r = rngHat(((G.hat || 1) * 2654435761 + w * 40503 + 17) | 0);
    const c = G.cd || {}; CD.apDot(c, (G.vt.dot0 || []).concat(this.dot(w))); // đột biến ghi lên G.cd → bọc sinhQuai của chedo-c áp; hsQ tầng 100 giữ nguyên
    const trum = this.coTrum(w) ? this.trum(w) : null;
    if (trum) {
      G.hang.push({ t: G.t + 1.5, trum, p: 0, hs: (c.hsT || 1) * (c.hsQ || 1) });
      const kem = w <= 100 ? ['bo', 'bo', 'bo', 'bo'] : CD.dsQuai(w, r, c).slice(0, 12);
      kem.forEach((q, i) => G.hang.push({ t: G.t + 3 + i * 1.1, id: q, p: 0 }));
    } else {
      const ds = CD.dsQuai(w, r, c), dur = 13;
      ds.forEach((q, i) => G.hang.push({ t: G.t + 0.3 + (i / ds.length) * dur + r() * 0.3, id: q, p: 0 }));
    }
    G.tWave = 0; G.laTrum = !!trum;
    UI.bangWave(w, G.laTrum);
    SND.nhac(G.laTrum ? 2 : 1); SND.wave(w, G.laTrum);
  },
  // hết lượt Vô tận (hết tim / bỏ cuộc): ghi kỷ lục + mốc tuần → { w, t, moiAll, moiTuan, ra, moc }
  ket(w, t) {
    const s = CDD.st().vt, moiAll = CDD.hon(w, t, s.best, s.bestT), moiTuan = CDD.hon(w, t, s.tBest, s.tBestT);
    if (moiAll) { s.best = w; s.bestT = t; }
    if (moiTuan) { s.tBest = w; s.tBestT = t; }
    const m = CDD.nhanMoc(s, CDDC.vt.moc, s.tBest, 'cdvt', 'endless');
    KT.luu();
    if (moiTuan) BXH.ghi('vt', w, t); if (moiAll) BXH.ghi('vtAll', w, t);
    return { w, t, moiAll, moiTuan, ra: m.ra, moc: m.moc };
  },
};

// ===================================================== THỬ THÁCH TUẦN =====================================================
const TTUAN = {
  cho: null,   // cấu hình chờ batDau kế tiếp
  hat(tu) { return (KT.bam('tw:' + tu) | 0) || 1; },
  // bộ tuần: tất định theo hạt tuần, từ TOÀN roster có kỹ năng (cho mượn) — ≥ 3 ụ gây sát thương
  bo(tu) {
    const r = rngHat(this.hat(tu) ^ 0x5bd1e995), roster = (G.roster || []).filter(x => SKILLS[x.id]);
    const theo = (b) => roster.filter(x => x.bac === b).map(x => x.id).sort();
    const dmg = (id) => SKILLS[id].dmg && SKILLS[id].vai !== 'ht';
    let ds = [];
    for (let lan = 0; lan < 40; lan++) {
      ds = []; for (const b of CDDC.tw.bo) { const be = theo(b).filter(id => !ds.includes(id)); if (be.length) ds.push(be[Math.floor(r() * be.length)]); }
      if (ds.filter(dmg).length >= 3) break;
    }
    const mvs = typeof mvDS === 'function' ? mvDS() : Object.keys(MAVUONG);
    return { ds, mv: mvs[Math.floor(r() * mvs.length)] };
  },
  dot(tu) { const r = rngHat(this.hat(tu) ^ 0x2c1b3c6d), con = CDDC.beDot.slice(), ds = []; for (let i = 0; i < CDDC.tw.soDot; i++) ds.push(con.splice(Math.floor(r() * con.length), 1)[0]); return ds; },
  cauHinh(tu) {
    tu = tu || KT.tuan();
    const b = this.bo(tu), c = CD.apDot({ loai: 'tw', tuan: tu, hat: this.hat(tu), deck: b.ds, mv: b.mv, w1: CDDC.tw.wMax, tim: CDDC.tw.tim, M: CDDC.tw.mana }, this.dot(tu));
    return c;
  },
  vangTuan(c) { return c.deck.find(id => THEBAI.bac(id) === 'vang'); },
  // vào trận (không đổi bộ bài / chỉ huy đã lưu của người chơi: bộ tuần chỉ thay lúc batDau)
  vao() {
    if (!TT.tnMo('tw')) { TTUI.toast(TT.tnChu('tw')); return false; }
    const c = this.cauHinh(); if (c.deck.length !== 5) return false;
    if (typeof TAI !== 'undefined' && TAI.verMoi && !TAI.trongOnl()) { TAI.napLaiMoi(); return false; }
    this.cho = c; UI.che = 'solo';
    try { TTUI.dong(); } catch (e) { }
    try { SND.mo(); } catch (e) { }
    batDau('solo', UI.chon, UI.mv);
    return true;
  },
  wave() {
    const c = G.tw;
    if (G.wave >= c.w1) { c.het = true; G.cho = 0.25; return; } // hết wave: chờ dọn sân
    G.wave++;
    const w = G.wave, r = rngHat((c.hat * 2654435761 + w * 40503) | 0), trum = w % LUAT.songTrum === 0 ? trumCuaWave(w, 0) : null;
    if (trum) {
      G.hang.push({ t: G.t + 1.5, trum, p: 0 });
      for (let i = 0; i < 4; i++) G.hang.push({ t: G.t + 3 + i * 1.2, id: 'bo', p: 0 });
    } else {
      const ds = CD.dsQuai(w, r, c), dur = 13;
      ds.forEach((q, i) => G.hang.push({ t: G.t + 0.3 + (i / ds.length) * dur + r() * 0.3, id: q, p: 0 }));
    }
    G.tWave = 0; G.laTrum = !!trum;
    UI.bangWave(w, G.laTrum);
    SND.nhac(G.laTrum ? 2 : 1); SND.wave(w, G.laTrum);
  },
  kiem() { const c = G.tw; if (c && c.het && !G.ketThuc && !G.hang.length && !G.quai.some(e => !e.chet)) ketThuc(true, 'Weekly challenge cleared'); },
  // điểm: wave đạt được (qua wave 50 = 51)
  ket(c, thang) {
    const s = CDD.st().tw, w = thang ? c.w1 + 1 : Math.max(1, G.wave), t = Math.max(1, Math.round(G.t));
    if (c.tuan !== s.tuan) return { w, t, cu: true, ra: { vang: 0, ngoc: 0, the: [], tt: 0 }, moc: [] }; // trận bắt đầu tuần trước: không tính
    const moi = CDD.hon(w, t, s.best, s.bestT); if (moi) { s.best = w; s.bestT = t; }
    const gv = this.vangTuan(c);
    const m = CDD.nhanMoc(s, CDDC.tw.moc, s.best, 'cdtw', 'weekly', (k, r) => r === 'vang' ? (gv && SH.trongPool(gv) ? [{ the: { id: gv, n: 1 } }] : [{ ruong: 'hh', n: 1 }]) : r);
    KT.luu();
    if (moi) BXH.ghi('tw', w, t);
    return { w, t, moi, ra: m.ra, moc: m.moc };
  },
};

// ===================================================== BẢNG XẾP HẠNG =====================================================
//  Realtime Database turretmerge/lb/{tw|vt}/{tuần}/{uid} · lb/vtAll/{uid} = { n, av, w, t, k, at, v }. Chưa có rules / ngoại tuyến → chỉ kỷ lục cá nhân.
const BXH = {
  _c: {}, _dang: {}, // bộ đệm đọc: duong → { at, ds } · bảng đang gửi
  duong(b, tu) { return b === 'vtAll' ? 'lb/vtAll' : 'lb/' + b + '/' + (tu || KT.tuan()); },
  k: (w, t) => w * 100000 + 99999 - Math.min(99999, Math.max(0, t | 0)),
  san() { return !!(typeof NET !== 'undefined' && NET.ok && NET.kieu === 'firebase' && NET.user && NET.user.uid && NET._db); },
  // chờ NET khởi động (taikhoan.js gọi NET.san() sau 1,5 s) — không chờ quá choMs
  sanSang() {
    if (this.san()) return Promise.resolve(true);
    if (typeof NET === 'undefined' || !NET.san) return Promise.resolve(false);
    return Promise.race([Promise.resolve(NET.san()).then(() => this.san(), () => false), new Promise(ok => setTimeout(() => ok(false), CDDC.lb.choMs))]);
  },
  // giờ máy chủ = firebase.database.ServerValue.TIMESTAMP (rules: at === now)
  ts() { try { const s = NET._fb && NET._fb.database && NET._fb.database.ServerValue; if (s && s.TIMESTAMP) return s.TIMESTAMP; } catch (e) { } return NET.TS; },
  ten() {
    let n = 'Pilot', av = 'laser';
    try { n = String(TK.ho.name || '').trim() || n; if (typeof TK.ho.av === 'string' && TK.ho.av) av = TK.ho.av; } catch (e) { }
    return { n: Array.from(n).slice(0, 16).join(''), av: av.slice(0, 24) };
  },
  // bản ghi đúng rules §3.2: n 1–16 ký tự, av ≤ 24, w 1…51 (tuần) / 1…999, t ≥ 6·w và < 100000, k = w·100000 + 99999 − t, at = giờ máy chủ, v số
  banGhi(b, w, t) {
    const ten = this.ten(), W = Math.max(1, Math.min(CDDC.lb.wMax[b] || 999, w | 0)), T = Math.min(99999, Math.max(W * 6, t | 0));
    return { n: ten.n, av: ten.av, w: W, t: T, k: this.k(W, T), at: this.ts(), v: 1 };
  },
  // ghi điểm (kỷ lục mới). Lưu hàng chờ trong máy → gửi lại khi mở bảng (mạng ngắt trong trận / rules chưa có)
  ghi(b, w, t) {
    try { if (G.debug && (G.debug.mana || G.debug.wave || G.debug.auto || G.debug.fill)) return; } catch (e) { } // trận thử: không gửi
    const lb = CDD.st().lb; lb[b] = { w, t, tuan: KT.tuan() }; KT.luu();
    this.gui();
  },
  gui() {
    if (!this.san()) return Promise.resolve(false);
    const lb = CDD.st().lb, ds = [];
    for (const b of ['tw', 'vt', 'vtAll']) {
      const x = lb[b]; if (!x || !x.w) continue;
      if (b !== 'vtAll' && x.tuan !== KT.tuan()) { delete lb[b]; continue; }
      if (this._dang[b] === x) continue; // đang gửi (chỉ trong bộ nhớ, không lưu)
      const v = this.banGhi(b, x.w, x.t), p = this.duong(b, x.tuan);
      let pr; this._dang[b] = x;
      try { pr = Promise.resolve(NET.set(p + '/' + NET.user.uid, v)); } catch (e) { pr = Promise.reject(e); }
      ds.push(pr.then(() => { if (this._dang[b] === x) delete this._dang[b]; if (lb[b] === x) delete lb[b]; KT.luu(); delete this._c[p]; return true; },
        (e) => { if (this._dang[b] === x) delete this._dang[b]; this.loi = (e && (e.code || e.message)) || 'err'; return false; })); // lỗi quyền / mạng: giữ hàng chờ, thử lại lần mở bảng sau
    }
    return Promise.all(ds);
  },
  // đọc top 50: Promise<{ off, ds:[{uid,n,av,w,t,k}] }> — lỗi quyền / chưa đăng nhập / quá giờ → { off } (bảng hiện kỷ lục cá nhân)
  doc(b) {
    const p = this.duong(b), c = this._c[p];
    if (c && Date.now() - c.at < 60000) return Promise.resolve({ ds: c.ds });
    return this.sanSang().then((ok) => {
      if (!ok) return { off: true };
      try { this.gui(); } catch (e) { }
      let q;
      try { q = NET._ref(p).orderByChild('k').limitToLast(CDDC.lb.top).once('value'); } catch (e) { q = Promise.reject(e); }
      const het = new Promise((ok2, hong) => setTimeout(() => hong({ code: 'timeout' }), CDDC.lb.choMs));
      return Promise.race([q, het]).then((s) => {
        const ds = [];
        s.forEach((x) => { const v = x.val() || {}; ds.push({ uid: x.key, n: String(v.n || '?').slice(0, 16), av: typeof v.av === 'string' ? v.av : '', w: v.w | 0, t: v.t | 0, k: +v.k || 0 }); });
        ds.sort((a, b2) => b2.k - a.k); this._c[p] = { at: Date.now(), ds };
        // điểm chờ gửi đã thấp hơn điểm của mình trên máy chủ (cài lại máy…) → bỏ, khỏi bị rules (k chỉ tăng) từ chối mãi
        try { const lb = CDD.st().lb, x = lb[b], toi = ds.find(y => y.uid === NET.user.uid); if (x && toi && toi.k >= this.k(x.w, Math.max(x.w * 6, x.t | 0)) && (b === 'vtAll' || x.tuan === KT.tuan())) { delete lb[b]; KT.luu(); } } catch (e) { }
        return { ds };
      }, (e) => { this.loi = (e && (e.code || e.message)) || 'err'; return { off: true, loi: this.loi }; });
    });
  },
  // hạng của mình trong ds (1-based) hoặc 0
  hang(ds) { const uid = typeof NET !== 'undefined' && NET.user && NET.user.uid; if (!uid) return 0; const i = (ds || []).findIndex(x => x.uid === uid); return i < 0 ? 0 : i + 1; },
  // kỷ lục của mình cho bảng b
  cuaToi(b) { const s = CDD.st(); return b === 'tw' ? { w: s.tw.best, t: s.tw.bestT } : b === 'vt' ? { w: s.vt.tBest, t: s.vt.tBestT } : { w: s.vt.best, t: s.vt.bestT }; },
};

// ===================================================== GIAO DIỆN =====================================================
const CDDUI = {
  bxh: { tw: 'tw', vt: 'vt' }, // bảng đang xem trong từng màn
  esc: (v) => CDUI.esc(v), a: (n) => CDUI.a(n), so: (v) => CDUI.so(v),
  wTen(b, w) { return b === 'tw' && w > CDDC.tw.wMax ? 'CLEAR' : String(w); },
  // dải mốc tuần: mỗi mốc = WAVE m + phần thưởng, đã nhận → tick
  dsMoc(bang, nhan, doi) {
    return '<div class="cdd-moc">' + Object.keys(bang).map(Number).map(m => {
      const r = doi ? doi(m, bang[m]) : bang[m];
      return '<span class="cdd-m' + (nhan[m] ? ' da' : '') + '"><small>WAVE ' + m + '</small><i>' + r.map(x => CDUI.rIc(x)).join('') + '</i>' + (nhan[m] ? '<img class="cdd-tick" src="' + this.a(KTA.xong) + '" alt="Claimed">' : '') + '</span>';
    }).join('') + '</div>';
  },
  // bảng xếp hạng: 3 bảng (tab) Thử thách tuần · Vô tận tuần này · Vô tận mọi thời đại + dòng HẠNG CỦA BẠN; danh sách điền sau khi đọc xong
  TAB: [['tw', 'WEEKLY'], ['vt', 'ENDLESS · WEEK'], ['vtAll', 'ENDLESS · ALL']],
  bxhKhung(b) {
    return '<div class="cdd-bxh"><div class="cdd-tab">' + this.TAB.map(([k, ten]) => '<button class="cdd-tb' + (k === b ? ' on' : '') + '" data-act="cdd-tab" data-id="' + k + '">' + ten + '</button>').join('') + '</div>' +
      '<div class="cdd-toi" id="cdd-toi"></div><div class="cdd-ds" id="cdd-ds" data-b="' + b + '"><p class="cdd-cho">LOADING…</p></div></div>';
  },
  bxhVe(b) {
    const el = document.getElementById('cdd-ds'); if (!el) return;
    el.dataset.b = b; el.innerHTML = '<p class="cdd-cho">LOADING…</p>';
    const toi = BXH.cuaToi(b), ten = BXH.ten(), uid = (typeof NET !== 'undefined' && NET.user && NET.user.uid) || null;
    const hang = (i, n, av, w, la) => '<div class="cdd-h' + (la ? ' toi' : '') + '"><i>' + i + '</i><img src="' + (typeof TK !== 'undefined' ? TK.avURL(av) : '') + '" alt=""><b>' + this.esc(n) + '</b><em>' + (w ? 'WAVE ' + this.wTen(b, w) : '—') + '</em></div>';
    const dongToi = (hg, wm) => { const w = Math.max(toi.w | 0, wm | 0), t = document.getElementById('cdd-toi'); if (t) t.innerHTML = '<small>YOUR RANK</small><b>' + hg + '</b><small>YOUR BEST</small><b>' + (w ? 'WAVE ' + this.wTen(b, w) : '—') + '</b>'; };
    dongToi('…');
    BXH.doc(b).then((r) => {
      if (!document.getElementById('cdd-ds') || el.dataset.b !== b) return;
      if (r.off) { dongToi('—'); el.innerHTML = '<p class="cdd-off">NOT CONNECTED · personal best only</p>' + hang('—', ten.n, ten.av, toi.w, true); try { OT.quet(el.parentNode); } catch (e) { } return; }
      const ds = r.ds || [], hg = BXH.hang(ds), ngoai = !hg && toi.w && ds.length >= CDDC.lb.top;
      let h = ds.map((x, i) => hang(i + 1, x.n, x.av, x.w, x.uid === uid)).join('');
      if (!hg) h += hang(ngoai ? CDDC.lb.top + '+' : '—', ten.n, ten.av, toi.w, true);
      dongToi(hg ? '#' + hg : ngoai ? CDDC.lb.top + '+' : '—', hg ? ds[hg - 1].w : 0); // kỷ lục máy chủ (máy mới / cài lại) khi máy chưa có
      el.innerHTML = (ds.length ? '' : '<p class="cdd-cho">' + (b === 'vtAll' ? 'No scores yet' : 'No scores yet this week') + '</p>') + h;
      try { OT.quet(el.parentNode); } catch (e) { }
      const o = el.querySelector('.cdd-h.toi'); if (o && hg > 4) el.scrollTop = Math.max(0, o.offsetTop - el.clientHeight / 2);
    });
  },
  // bảng xếp hạng riêng (HOME → EVENT → RANKS)
  bxhMo(b) {
    b = b || 'tw'; this.bxh.rieng = b;
    CDUI.phu(CDUI.dau('ua_ic_trum', 'LEADERBOARD', 'TOP ' + CDDC.lb.top + ' · VIEW ONLY') + this.bxhKhung(b) + CDUI.nut(''), 'cdd-p cdd-lb');
    this.bxhVe(b);
  },
  // thẻ trong HOME → EVENT: Thử thách tuần (PLAY / khoá cấp) + nút bảng xếp hạng
  theSk() {
    if (!CDDC.tw.bat) return '';
    const mo = TT.tnMo('tw'), s = CDD.st().tw;
    return '<div class="cdd-sk"><img src="' + this.a(CDDC.ICON.tw) + '" alt=""><span><b>WEEKLY CHALLENGE</b><small>' + (mo ? 'Week ' + KT.tuan() + ' · best ' + (s.best ? this.wTen('tw', s.best) : '—') : this.esc(TT.tnChu('tw'))) + '</small></span>' +
      '<button class="hm-nut2" data-act="cdd-lb"><b>RANKS</b></button><button class="hm-nut2 vang" data-act="cdd-sk-tw"' + (mo ? '' : ' disabled') + '><b>' + (mo ? 'PLAY' : 'LV ' + CDDC.tw.cap) + '</b></button></div>';
  },

  // ---------- VÔ TẬN ----------
  votan() {
    const s = CDD.st().vt, b = this.bxh.vt;
    let h = CDUI.dau(CDDC.ICON.vt, 'ENDLESS', 'BEST WAVE ' + (s.best || '—') + ' · THIS WEEK ' + (s.tBest || '—'));
    h += '<div class="cd-ct"><b class="cd-ct-t">TOWER FLOOR ' + CDDC.vt.tang + ' → ENDLESS</b>' +
      '<p class="kt-chu cd-luat">Clear floor ' + CDDC.vt.tang + ' and keep going from wave ' + (CDDC.vt.w0 + 1) + '. Bosses every 5 waves, every 2 after 90, every wave after 100 · +1 mutation every 10 waves from ' + CDDC.vt.dotTu + '</p>' +
      '<small class="cd-nh">WEEKLY MILESTONES · RESETS IN ' + KT.dongHo(KT.conLai(true)) + '</small>' + this.dsMoc(CDDC.vt.moc, s.nhan) + '</div>';
    h += this.bxhKhung(b);
    CDUI.phu(h + CDUI.nut('<button class="hm-nut2 vang" data-act="cdd-vt-vao"><b>START · FLOOR ' + CDDC.vt.tang + '</b></button>'), 'cdd-p cdd-vt');
    this.bxhVe(b);
  },
  // ---------- THỬ THÁCH TUẦN ----------
  tuan() {
    const s = CDD.st().tw, c = TTUAN.cauHinh(), b = this.bxh.tw, gv = TTUAN.vangTuan(c);
    let h = CDUI.dau(CDDC.ICON.tw, 'WEEKLY CHALLENGE', 'WEEK ' + c.tuan + ' · RESETS IN ' + KT.dongHo(KT.conLai(true)));
    h += '<div class="cdd-bo">' + c.deck.map(id => '<span class="cdd-u b-' + THEBAI.bac(id) + '">' + OT.mini(id) + '</span>').join('') +
      '<span class="cdd-mv"><img src="' + mvIcURL(c.mv) + '" alt=""><small>' + this.esc(MAVUONG[c.mv].ten) + '</small></span></div>';
    h += '<div class="cd-ct"><div class="cd-so"><span><small>WAVES</small><b>1–' + c.w1 + '</b></span><span><small>CARD LEVEL</small><b>+' + CDDC.tw.capThe + '</b></span><span><small>LIVES</small><b>' + c.tim + '</b></span><span><small>BEST</small><b>' + (s.best ? this.wTen('tw', s.best) : '—') + '</b></span></div>' +
      '<p class="kt-chu cd-luat">' + this.esc(CDUI.dotChu(c.dot)) + '</p>' +
      '<small class="cd-nh">WEEKLY MILESTONES</small>' + this.dsMoc(CDDC.tw.moc, s.nhan, (m, r) => r === 'vang' ? (gv && SH.trongPool(gv) ? [{ the: { id: gv, n: 1 } }] : [{ ruong: 'hh', n: 1 }]) : r) + '</div>';
    h += this.bxhKhung(b);
    CDUI.phu(h + CDUI.nut('<button class="hm-nut2 vang" data-act="cdd-tw-vao"><b>START · WEEK ' + c.tuan + '</b></button>'), 'cdd-p cdd-tw');
    this.bxhVe(b);
  },

  // ---------- hỏi khi thắng tầng 100 Leo Tháp ----------
  hoi() {
    const wr = document.getElementById('wrap'); if (!wr) return;
    let p = document.getElementById('cdd-hoi');
    if (!p) { p = document.createElement('div'); p.id = 'cdd-hoi'; p.className = 'kt-phu cdd-hoi'; wr.appendChild(p); }
    p.innerHTML = '<div class="kt-phu-nen"></div><div class="kt-phu-tam">' + CDUI.dau(CDDC.ICON.vt, 'FLOOR ' + CDDC.vt.tang + ' CLEARED', 'THE TOWER IS YOURS') +
      '<p class="kt-chu cd-luat">ENDLESS: keep this board and fight on from wave ' + (CDDC.vt.w0 + 1) + '. Bosses come faster, enemy HP keeps rising. Your clear still counts.</p>' +
      '<div class="cd-nut"><button class="hm-nut2" data-act="cdd-hoi-xong"><b>FINISH</b></button><button class="hm-nut2 vang" data-act="cdd-hoi-vt"><b>ENDLESS</b></button></div></div>';
    p.hidden = false;
    try { OT.quet(p); } catch (e) { }
  },
  hoiDong() { const p = document.getElementById('cdd-hoi'); if (p) { p.hidden = true; p.innerHTML = ''; } },

  // ---------- trong trận: nhãn giữa thanh trên ----------
  chip() {
    const top = document.getElementById('top'); if (!top) return;
    const vt = VOTAN.on() && G.ban.length && !G.ketThuc;
    if (!vt) return;
    if (G.quai.some(x => x.trum && !x.chet)) return; // trùm ở sân: giữ máu trùm của HUD
    const ke = VOTAN.trumKe(G.wave), con = ke - G.wave;
    const t = 'ENDLESS · ' + (G.laTrum ? 'BOSS WAVE' : 'BOSS IN ' + con), tc = document.getElementById('tb-trum-chu');
    if (tc && tc.textContent !== t) tc.textContent = t;
    const f = document.querySelector('#ha-thanh .f'); if (f) { const w = (Math.max(0, Math.min(1, 1 - (con - 1) / 5)) * 100) + '%'; if (f.style.width !== w) f.style.width = w; }
  },

  // ---------- màn kết quả ----------
  thuongHtml(ra) {
    const ic = []; if (ra.vang) ic.push(KTUI.rIc({ vang: ra.vang })); if (ra.ngoc) ic.push(KTUI.rIc({ ngoc: ra.ngoc })); if (ra.tt) ic.push(CDUI.ttIc(ra.tt));
    for (const x of ra.the || []) ic.push(KTUI.rIc({ the: { id: x.id, n: x.n } }));
    this._ru = ra.ru ? ra.ru.slice() : [];
    return '<div class="tb-kq-h cd-kq-h">' + (this._ru.length ? '<button class="sh-kq-ru" data-act="cdd-kq-mo" aria-label="Open chest"><img src="' + this.a(KTA.ru[this._ru[0].k] || KTA.ru.thuong) + '" alt=""><b>OPEN' + (this._ru.length > 1 ? ' ×' + this._ru.length : '') + '</b></button>' : '') + ic.join('') + '</div>';
  },
  coThuong: (ra) => !!(ra && (ra.vang || ra.ngoc || ra.tt || (ra.the || []).length || (ra.ru || []).length)),
  kqVotan(k) {
    const r = VOTAN.ket(k.vt.w, k.vt.t), chi = document.getElementById('kq-chi'); if (!chi) return r;
    const phu = document.getElementById('kq-phu'); if (phu) phu.textContent = 'ENDLESS · REACHED WAVE ' + r.w;
    const s = CDD.st().vt;
    const o = (nhan, so, moi) => '<span' + (moi ? ' class="moi"' : '') + '><small>' + nhan + '</small><b>' + so + '</b>' + (moi ? '<em>NEW</em>' : '') + '</span>';
    let h = '<div class="cdd-kq"><div class="cdd-kq-so"><img src="' + this.a(CDDC.ICON.vt) + '" alt="">' + o('ENDLESS', 'W' + r.w) + o('THIS WEEK', s.tBest, r.moiTuan) + o('ALL TIME', s.best, r.moiAll) + '</div>';
    if (this.coThuong(r.ra)) h += '<small>WEEKLY MILESTONE · WAVE ' + r.moc.join(' · ') + '</small>' + this.thuongHtml(r.ra);
    h += '</div>';
    chi.insertAdjacentHTML('beforeend', h);
    try { OT.quet(chi); } catch (e) { }
    return r;
  },
  kqTuan(k, c) {
    const kq = document.getElementById('ketqua'); if (!kq) return;
    const r = TTUAN.ket(c, k.thang), chi = document.getElementById('kq-chi'); if (!chi) return r;
    const phu = document.getElementById('kq-phu'); if (phu) phu.textContent = (typeof NN !== 'undefined' && NN.t ? NN.t('WEEKLY CHALLENGE · WEEK ' + c.tuan) : 'WEEKLY CHALLENGE · WEEK ' + c.tuan) + (!k.thang && k.ly ? ' · ' + k.ly : '');
    const s = CDD.st().tw, tim = G.ban[0] ? Math.max(0, G.ban[0].tim | 0) : 0;
    const o = (nhan, so, em) => '<div class="kq-o"><small>' + nhan + '</small><b>' + so + '</b>' + (em ? '<em>' + em + '</em>' : '') + '</div>';
    let th;
    if (r.cu) th = '<small>LAST WEEK\'S CHALLENGE · NOT COUNTED</small>';
    else if (this.coThuong(r.ra)) th = '<small>WEEKLY MILESTONE · WAVE ' + r.moc.join(' · ') + '</small>' + this.thuongHtml(r.ra);
    else th = '<small>' + (r.moi ? 'NEW WEEKLY BEST' : 'NO NEW MILESTONE') + '</small>';
    chi.innerHTML = '<div class="kq-hang">' + o('WAVE', this.wTen('tw', r.w)) + o('WEEK BEST', s.best ? this.wTen('tw', s.best) : '—', r.moi ? 'NEW BEST' : '') + o('LIVES', tim + '/' + c.tim) + '</div><div class="tb-kq cd-kq">' + th + '</div>';
    try { OT.quet(chi); } catch (e) { }
    TTUAN.lap = c;
    const lai = kq.querySelector('[data-act="choilai"]'); if (lai) lai.textContent = 'RETRY · WEEKLY';
    const sua = kq.querySelector('[data-act="doibo"]'); if (sua) sua.textContent = 'HOME';
    return r;
  },
  moKq() {
    const ru = this._ru || []; if (!ru.length) return;
    this._ru = [];
    const b = document.querySelector('#ketqua [data-act="cdd-kq-mo"]'); if (b) b.remove();
    KTUI.nhan({ vang: 0, ngoc: 0, the: [], ru }, '', { phu: (h, c) => SHUI.phuKq(h, c), dong: 'sh-dong' });
  },
};

(function () {
  if (typeof KT === 'undefined' || typeof TT === 'undefined' || typeof CD === 'undefined' || typeof batDau !== 'function') return;
  if (typeof UP_XEM !== 'undefined' && UP_XEM) return; // khung xem trước trang ụ
  for (const n of ['endless', 'weekly']) if (!KT.NGUON.includes(n)) KT.NGUON.splice(KT.NGUON.length - 1, 0, n);
  try { CDD.st(); } catch (e) { console.error('CDD', e); }

  // ---- khoá tính năng ----
  Object.assign(TTC.tn, { vt: { cap: 0, ten: 'ENDLESS' } }); if (CDDC.tw.bat) TTC.tn.tw = { cap: CDDC.tw.cap, ten: 'WEEKLY CHALLENGE' };
  { const g = TT.tnMo; TT.tnMo = function (k) { if (k === 'vt') { try { return ADMIN.la() || !!this.st().giuTn.vt || VOTAN.moKhoa(); } catch (e) { return false; } } return g.apply(this, arguments); }; }
  { const g = TT.tnChu; TT.tnChu = function (k) { return k === 'vt' ? 'Unlocks after clearing Tower Climb floor ' + CDDC.vt.tang : g.apply(this, arguments); }; }
  { const g = TTUI.tnNhan; TTUI.tnNhan = function (k) { return k === 'vt' ? '<b>FLOOR ' + CDDC.vt.tang + '</b>' : g.apply(this, arguments); }; }

  // ---- trận ----
  const bd = batDau;
  batDau = function (che, deck, mv) {
    const c = TTUAN.cho; TTUAN.cho = null;
    const tu = VOTAN.cho; VOTAN.cho = false;
    G.vt = null; G.tw = null; G.vtTu = false; G.vtHoi = false; G.vtQua = false; CDDUI.hoiDong();
    const laTw = !!(c && che === 'solo');
    if (laTw) { G.hat = c.hat; G.giuHat = true; G.tw = Object.assign({}, c, { het: false }); deck = c.deck; mv = c.mv; }
    else if (tu) G.vtTu = true; // trận tầng 100 vào từ ENDLESS: qua tầng tự vào Vô tận
    const r = bd.call(this, che, deck, mv);
    if (laTw) {
      try {
        const B = G.ban[0];
        if (B) { for (const id of B.deck) B.capThe[id] = CDDC.tw.capThe; B.mana = c.M; B.tim = c.tim; } // cấp thẻ chuẩn hoá: bỏ qua cấp của người chơi
        if (G.ban.length && G.ban[0].deck.join() !== c.deck.join()) G.tw = null;
      } catch (e) { console.error('CDD', e); G.tw = null; }
    }
    return r;
  };
  const wm = wavMoi;
  wavMoi = function () {
    if (G.tw && !G.cd) return TTUAN.wave();
    if (VOTAN.on()) return VOTAN.wave();
    return wm.apply(this, arguments);
  };
  const sq = sinhQuai;
  sinhQuai = function (id, pi, s, hs, gui) {
    const c = G.tw; if (!c || G.cd) return sq.apply(this, arguments);
    const E = sq.call(this, id, pi, s, (hs || 1) * (c.hpQ || 1), gui);
    if (E && E.d && c.v && c.v !== 1) E.d = Object.assign({}, E.d, { v: E.d.v * c.v });
    return E;
  };
  // lịch trùm sau wave 70 (HUD báo trước, ảnh trùm nạp sẵn, màn mở đầu dùng chung)
  const ct = coTrum; coTrum = function (w) { if (VOTAN.on() && w > CDDC.vt.w0) return VOTAN.coTrum(w); return ct.apply(this, arguments); };
  const tcw = trumCuaWave; trumCuaWave = function (w, p) { if (VOTAN.on() && w > CDDC.vt.w0) return VOTAN.trum(w); return tcw.apply(this, arguments); };
  const cn = capNhat; capNhat = function () { const r = cn.apply(this, arguments); try { TTUAN.kiem(); } catch (e) { console.error('CDD', e); } return r; };
  // kết thúc: thắng tầng 100 Leo Tháp → hỏi Vô tận; đang Vô tận: bỏ qua "hết tầng" mỗi khung, hết tim / bỏ cuộc = hết lượt (vẫn THẮNG tầng 100)
  const kt0 = ketThuc;
  ketThuc = function (thang, ly) {
    if (G.ketThuc || G.tw || !G.ban.length) return kt0.apply(this, arguments);
    if (VOTAN.on()) {
      if (thang && !G.vt.xong) return; // CD.kiem / vòng chung gọi ketThuc(true) lúc sân trống — đang Vô tận thì đi tiếp
      G.vt.xong = true; G.vt.on = false;
      const w = Math.max(CDDC.vt.w0 + 1, G.wave), t = Math.max(1, Math.round(G.t));
      if (G.cd) { G.cd.het = true; G.wave = Math.max(G.wave, G.cd.w1); } // màn kết quả tầng: 5/5 wave
      const x = kt0.call(this, true, ly || 'Endless run over');
      if (G.ketThuc) { G.ketThuc.vt = { w, t }; G.ketThuc.wave = w; }
      setTimeout(() => { try { document.documentElement.classList.remove('cg-thua'); } catch (e) { } }, 0); // camgiac.js (bọc sau) tô màn thua theo đối số gốc
      return x;
    }
    if (thang && VOTAN.laTang100() && !G.vtQua) {
      if (G.vtTu) { VOTAN.bat(true); return; }
      if (!G.vtHoi) { G.vtHoi = true; G.dung = true; try { UI.huyKeo(); } catch (e) { } CDDUI.hoi(); }
      return;
    }
    return kt0.apply(this, arguments);
  };
  // bỏ cuộc (menu tạm dừng) khi đang Vô tận: kết thúc lượt, vẫn có màn kết quả (qua tầng 100 + điểm Vô tận)
  document.addEventListener('click', (e) => {
    const el = e.target.closest && e.target.closest('#dung [data-act="bo"]'); if (!el || !VOTAN.on() || G.ketThuc) return;
    e.stopImmediatePropagation(); e.preventDefault();
    G.dung = false; const d = document.getElementById('dung'); if (d) d.hidden = true;
    ketThuc(false, 'Left the Endless run');
  }, true);
  // HUD: báo trước trùm theo lịch Vô tận; nhãn giữa thanh trên
  if (typeof HT !== 'undefined' && HT.theoDoi) {
    const td = HT.theoDoi;
    HT.theoDoi = function () {
      if (!VOTAN.on()) return td.apply(this, arguments);
      if (!G.ban.length || G.ketThuc || (typeof VT !== 'undefined' && VT.mo)) return;
      const w = G.wave + 1;
      if (VOTAN.coTrum(w) && this._baoW !== w && !G.laTrum && (G.cho > 0 || G.tWave >= LUAT.thoiGianWave - this.TRUM.BAO_TRUOC)) this.bao(w);
      this.demBao();
    };
  }
  const bocHud = () => {
    if (UI._cddHud) return; UI._cddHud = 1;
    const g = UI.capNhat; UI.capNhat = function () { const r = g.apply(this, arguments); try { CDDUI.chip(); } catch (e) { } return r; };
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(bocHud, 5), { once: true }); else setTimeout(bocHud, 5);

  // ---- màn kết quả ----
  if (typeof UI !== 'undefined' && UI.ketQua) {
    const kq = UI.ketQua;
    UI.ketQua = function (k) {
      const c = G.tw;
      if (c) { // Thử thách tuần: bỏ kỷ lục Solo / túi trận / nhiệm vụ / sự kiện (như chế độ C)
        const dw = G.debug.wave, lb = typeof KQ !== 'undefined' ? KQ.luuBest : null;
        G.debug.wave = -1; if (lb) KQ.luuBest = function () { };
        let x;
        try { x = kq.apply(this, arguments); } finally { G.debug.wave = dw; if (lb) KQ.luuBest = lb; if (!dw) delete G.debug.wave; }
        try { CDDUI.kqTuan(k, c); } catch (e) { console.error('CDD', e); }
        return x;
      }
      const x = kq.apply(this, arguments);
      if (k && k.vt) { try { CDDUI.kqVotan(k); } catch (e) { console.error('CDD', e); } }
      return x;
    };
  }
  // RETRY sau Thử thách tuần / Vô tận (pha capture, trước ui.js)
  document.addEventListener('click', (e) => {
    const el = e.target.closest && e.target.closest('#ketqua [data-act="choilai"]'); if (!el) return;
    if (G.tw && TTUAN.lap) { TTUAN.cho = TTUAN.cauHinh(); TTUAN.lap = null; UI.che = 'solo'; if (typeof KQ !== 'undefined' && KQ.m) KQ.m.che = 'solo'; }
    else if (G.vtTu) VOTAN.cho = true;
  }, true);
  document.addEventListener('click', (e) => { const el = e.target.closest && e.target.closest('[data-act="doibo"], [data-act="bo"]'); if (el) { TTUAN.cho = null; TTUAN.lap = null; VOTAN.cho = false; } }, true);

  // ---- HOME: 2 chế độ mới trong GAME MODE ----
  if (typeof HM !== 'undefined') {
    Object.assign(HM.CHE, {
      tw: { ten: 'WEEKLY CHALLENGE', ic: CDDC.ICON.tw, phu: () => 'Week ' + KT.tuan() + ' · best ' + (CDD.st().tw.best ? CDDUI.wTen('tw', CDD.st().tw.best) : '—'), mo: 'Same 5 turrets for everyone · new every Monday' },
      vt: { ten: 'ENDLESS', ic: CDDC.ICON.vt, phu: () => 'Best wave ' + (CDD.st().vt.best || '—'), mo: 'After Tower floor 100 · bosses keep coming' },
    });
    if (!CDDC.tw.bat) delete HM.CHE.tw;
    const laD = (k) => k === 'tw' || k === 'vt';
    const khoa = (k) => TTC.tn[k] && !TT.tnMo(k);
    const cc = HM.chonChe;
    HM.chonChe = function (k) {
      if (!laD(k)) return cc.apply(this, arguments);
      if (khoa(k)) { TTUI.toast(TT.tnChu(k)); return; }
      this.che = k; UI.che = 'solo'; this.luu(); try { SND.nut(); } catch (e) { } this.dong(); this.ve();
    };
    const ch = HM.choi;
    HM.choi = function () {
      if (!laD(this.che)) return ch.apply(this, arguments);
      if (khoa(this.che)) { TTUI.toast(TT.tnChu(this.che)); return; }
      if (this.che === 'vt' && UI.chon.length !== 5) { if (!this.el('chon').classList.contains('xem-dk') || this.bst) this.di('dk'); UI.nhac('Pick 5 turrets'); return; }
      if (this.che === 'vt') this.luuBo();
      try { SND.nut(); } catch (e) { }
      if (this.che === 'tw') CDDUI.tuan(); else CDDUI.votan();
    };
    const ini = UI.init;
    UI.init = async function () {
      const r = await ini.apply(this, arguments);
      try { const l = JSON.parse(localStorage.getItem(HM.KEY) || 'null'); if (l && laD(l.che) && !khoa(l.che) && !G.debug.mode) { HM.che = l.che; UI.che = 'solo'; HM.ve(); } } catch (e) { }
      return r;
    };
  }

  // ---- HOME → EVENT: thẻ Thử thách tuần + bảng xếp hạng ở đầu tab sự kiện ----
  if (typeof KTUI !== 'undefined' && KTUI.ve_sk) { const g = KTUI.ve_sk; KTUI.ve_sk = function () { let t = ''; try { t = CDDUI.theSk(); } catch (e) { console.error('CDD', e); } return t + g.apply(this, arguments); }; }

  // ---- gộp hồ sơ Firebase: kỷ lục lấy lớn nhất, cờ mốc OR (cùng tuần) ----
  const gp = KT.gop;
  KT.gop = function (o) {
    let a = null; const b = o && o.kt && o.kt.cd;
    try { a = JSON.parse(JSON.stringify(CD.st())); } catch (e) { }
    const x = gp.apply(this, arguments);
    try {
      const s = CDD.st();
      for (const y of [a, b]) {
        if (!y || typeof y !== 'object') continue;
        const v = y.vt; if (v) { if (CDD.hon(v.best | 0, v.bestT | 0, s.vt.best, s.vt.bestT)) { s.vt.best = v.best | 0; s.vt.bestT = v.bestT | 0; } if (v.tuan === s.vt.tuan) { if (CDD.hon(v.tBest | 0, v.tBestT | 0, s.vt.tBest, s.vt.tBestT)) { s.vt.tBest = v.tBest | 0; s.vt.tBestT = v.tBestT | 0; } for (const i in (v.nhan || {})) if (v.nhan[i]) s.vt.nhan[i] = 1; } }
        const t = y.tw; if (t && t.tuan === s.tw.tuan) { if (CDD.hon(t.best | 0, t.bestT | 0, s.tw.best, s.tw.bestT)) { s.tw.best = t.best | 0; s.tw.bestT = t.bestT | 0; } for (const i in (t.nhan || {})) if (t.nhan[i]) s.tw.nhan[i] = 1; }
      }
      KT.luu(true);
    } catch (e) { console.error('CDD', e); }
    return x;
  };

  // ---- bấm ----
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-act^="cdd-"]'); if (!b || b.disabled) return;
    const a = b.dataset.act; e.stopPropagation();
    const nut = () => { try { SND.nut(); } catch (er) { } };
    if (a === 'cdd-hoi-vt') { nut(); CDDUI.hoiDong(); G.dung = false; VOTAN.bat(false); }
    else if (a === 'cdd-hoi-xong') { nut(); CDDUI.hoiDong(); G.dung = false; G.vtQua = true; ketThuc(true, G.cd ? CD.tenTran(G.cd) + ' cleared' : undefined); }
    else if (a === 'cdd-tab') { nut(); const k = b.dataset.id, p = document.getElementById('tt-phu'); CDDUI.bxh[p && p.classList.contains('cdd-tw') ? 'tw' : p && p.classList.contains('cdd-vt') ? 'vt' : 'rieng'] = k; document.querySelectorAll('.cdd-tb').forEach(x => x.classList.toggle('on', x === b)); CDDUI.bxhVe(k); }
    else if (a === 'cdd-vt-vao') { nut(); if (UI.chon.length !== 5) { UI.nhac('Pick 5 turrets'); return; } VOTAN.cho = true; if (!CD.vao('thap', CDDC.vt.tang)) VOTAN.cho = false; }
    else if (a === 'cdd-tw-vao') { nut(); TTUAN.vao(); }
    else if (a === 'cdd-lb' || a === 'cdd-sk-tw') { // HOME → EVENT: đóng màn cửa hàng/sự kiện rồi mở bảng ở HOME (#tt-phu)
      nut(); try { if (typeof KTUI !== 'undefined' && KTUI.mo) KTUI.dong(); } catch (er) { }
      if (a === 'cdd-lb') CDDUI.bxhMo(CDDUI.bxh.rieng || 'tw');
      else if (!TT.tnMo('tw')) TTUI.toast(TT.tnChu('tw')); else CDDUI.tuan();
    }
    else if (a === 'cdd-kq-mo') { nut(); CDDUI.moKq(); }
  });

  // ---- Tiếng Việt (ngonngu.js: từ điển mẫu, # = số) ----
  if (typeof VI_MAU !== 'undefined') Object.assign(VI_MAU, {
    'WEEKLY CHALLENGE': 'THỬ THÁCH TUẦN', 'ENDLESS': 'VÔ TẬN', 'Same 5 turrets for everyone · new every Monday': 'Cùng 5 ụ cho mọi người · đổi mỗi thứ Hai',
    'After Tower floor # · bosses keep coming': 'Sau tầng # Leo Tháp · trùm dồn dập',
    'Week # · best #': 'Tuần # · cao nhất #', 'Week # · best —': 'Tuần # · cao nhất —', 'Week # · best CLEAR': 'Tuần # · cao nhất QUA', 'Best wave #': 'Wave cao nhất #', 'Best wave —': 'Wave cao nhất —',
    'Unlocks after clearing Tower Climb floor #': 'Mở sau khi qua tầng # Leo Tháp', 'FLOOR # → ENDLESS': 'TẦNG # → VÔ TẬN', 'TOWER FLOOR # → ENDLESS': 'TẦNG THÁP # → VÔ TẬN', 'START · FLOOR #': 'BẮT ĐẦU · TẦNG #',
    'Clear floor # and keep going from wave #. Bosses every # waves, every # after #, every wave after # · +# mutation every # waves from #': 'Qua tầng # rồi đánh tiếp từ wave #. Trùm mỗi # wave, mỗi # wave sau #, wave nào cũng có sau # · +# đột biến mỗi # wave từ wave #',
    'FLOOR # CLEARED': 'ĐÃ QUA TẦNG #', 'THE TOWER IS YOURS': 'BẠN ĐÃ CHINH PHỤC THÁP',
    'ENDLESS: keep this board and fight on from wave #. Bosses come faster, enemy HP keeps rising. Your clear still counts.': 'VÔ TẬN: giữ nguyên bàn, đánh tiếp từ wave #. Trùm đến dày hơn, máu quái tiếp tục tăng. Lần qua tầng vẫn được tính.',
    'BEST WAVE # · THIS WEEK #': 'WAVE CAO NHẤT # · TUẦN NÀY #', 'BEST WAVE — · THIS WEEK —': 'WAVE CAO NHẤT — · TUẦN NÀY —', 'BEST WAVE # · THIS WEEK —': 'WAVE CAO NHẤT # · TUẦN NÀY —',
    'SOLO PAST WAVE #': 'SOLO SAU WAVE #',
    'Bosses every # waves after #, every # after #, every wave after # · +# mutation every # waves from #': 'Trùm mỗi # wave sau wave #, mỗi # wave sau #, wave nào cũng có sau # · +# đột biến mỗi # wave từ wave #',
    'WEEKLY MILESTONES · RESETS IN #d #h': 'MỐC TUẦN · LÀM MỚI SAU #n #g', 'WEEKLY MILESTONES · RESETS IN #:#:#': 'MỐC TUẦN · LÀM MỚI SAU #:#:#', 'WEEKLY MILESTONES': 'MỐC TUẦN',
    'WAVE #': 'ĐỢT #', 'THIS WEEK': 'TUẦN NÀY', 'ALL TIME': 'MỌI THỜI ĐẠI', 'LOADING…': 'ĐANG TẢI…',
    'NOT CONNECTED · personal best only': 'CHƯA KẾT NỐI · chỉ kỷ lục cá nhân', 'No scores yet this week': 'Tuần này chưa có điểm',
    'START': 'BẮT ĐẦU', 'NEW': 'MỚI', 'W#': 'W#', 'START · WEEK #': 'BẮT ĐẦU · TUẦN #',
    'WEEK # · RESETS IN #d #h': 'TUẦN # · LÀM MỚI SAU #n #g', 'WEEK # · RESETS IN #:#:#': 'TUẦN # · LÀM MỚI SAU #:#:#',
    'CARD LEVEL': 'CẤP THẺ', 'BEST': 'CAO NHẤT', 'CLEAR': 'QUA',
    'WAVE # CLEARED': 'ĐÃ QUA WAVE #', 'SOLO VICTORY IS YOURS': 'BẠN ĐÃ THẮNG SOLO',
    'ENDLESS: keep this board and fight on. Bosses come faster, enemy HP keeps rising. Your victory still counts.': 'VÔ TẬN: giữ nguyên bàn và đánh tiếp. Trùm đến dày hơn, máu quái tiếp tục tăng. Trận thắng vẫn được tính.',
    'FINISH': 'KẾT THÚC', 'ENDLESS · wave #+': 'VÔ TẬN · wave #+', 'ENDLESS · BOSS IN #': 'VÔ TẬN · TRÙM SAU #', 'ENDLESS · BOSS WAVE': 'VÔ TẬN · WAVE TRÙM',
    'ENDLESS · REACHED WAVE #': 'VÔ TẬN · ĐẠT WAVE #', 'NEW BEST': 'KỶ LỤC MỚI', 'WEEKLY MILESTONE · WAVE #': 'MỐC TUẦN · WAVE #', 'WEEKLY MILESTONE · WAVE # · #': 'MỐC TUẦN · WAVE # · #',
    'WEEKLY MILESTONE · WAVE # · # · #': 'MỐC TUẦN · WAVE # · # · #',
    'Endless run over': 'Hết lượt Vô tận', 'Left the Endless run': 'Đã rời Vô tận', 'Weekly challenge cleared': 'Đã qua thử thách tuần',
    'WEEKLY CHALLENGE · WEEK #': 'THỬ THÁCH TUẦN · TUẦN #', 'WEEK BEST': 'KỶ LỤC', 'NEW WEEKLY BEST': 'KỶ LỤC TUẦN MỚI', 'NO NEW MILESTONE': 'KHÔNG CÓ MỐC MỚI',
    'LAST WEEK\'S CHALLENGE · NOT COUNTED': 'THỬ THÁCH TUẦN TRƯỚC · KHÔNG TÍNH', 'RETRY · WEEKLY': 'CHƠI LẠI · TUẦN', 'HOME': 'TRANG CHÍNH',
    'Claimed': 'Đã nhận',
    // 10/11 bật Thử thách tuần + bảng xếp hạng 3 tab
    'WEEKLY': 'TUẦN', 'ENDLESS · WEEK': 'VÔ TẬN · TUẦN', 'ENDLESS · ALL': 'VÔ TẬN · MỌI LÚC', 'YOUR RANK': 'HẠNG CỦA BẠN', 'YOUR BEST': 'KỶ LỤC',
    'LEADERBOARD': 'BẢNG XẾP HẠNG', 'TOP # · VIEW ONLY': 'TOP # · CHỈ ĐỂ XEM', 'No scores yet': 'Chưa có điểm', 'RANKS': 'HẠNG', 'LV #': 'CẤP #', 'WEEK #': 'TUẦN #', 'RESETS IN #d #h': 'LÀM MỚI SAU #n #g', 'RESETS IN #:#:#': 'LÀM MỚI SAU #:#:#',
    'WAVE CLEAR': 'WAVE QUA', '#+': '#+',
  });
})();
