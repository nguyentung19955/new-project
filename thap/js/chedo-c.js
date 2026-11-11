// ASTRAL ARSENAL — GIAI ĐOẠN C: LEO THÁP (TOWER CLIMB) · SĂN TRÙM (BOSS HUNT) · TINH THỂ ĐỎ + ẤN ĐỎ · THỬ THÁCH NGẮN (QUICK TRIALS)
//  Thiết kế: docs/demo-hop-tuong/tuvan/che-do-c/THIET-KE.md. Thưởng = rương / mảnh của hệ gacha thu thập (KT.cho → rương, chỉ ụ trong bể rơi).
//  · Trận chế độ C = trận SOLO (bàn, bộ bài, cấp thẻ thật) + tham số G.cd: wave đầu/cuối, mana đầu, trùm cố định, luật sinh quái, đồng hồ trùm.
//  · TẤT ĐỊNH: thành phần wave sinh bằng rngHat(hạt tầng) — không Math.random trong file này; hạt trận cố định (G.hat) → lịch chiêu trùm như nhau.
//  · Không ghi kỷ lục Solo / mốc wave / điểm sự kiện / nhiệm vụ theo wave, không Rương Trận (bắt đầu ở wave cao sẽ phá các mốc đó) — chỉ thưởng LẦN ĐẦU
//    (ghi cờ trước khi phát) + XP phi công lần đầu.  [Săn Trùm / Thử thách ngắn giữ nguyên như vậy.]
//  · 10/11 NGƯỜI DÙNG CHỐT "BỎ SOLO": LEO THÁP là chế độ một mình CHÍNH — mở ngay sau hướng dẫn (bỏ khoá cấp 5), HOME PLAY vào thẳng tầng kế,
//    và trận Leo Tháp nhận mọi thứ trước đây của trận Solo, đo theo TẦNG (che 'thap', KQ.m.thap = { t, qua, thang }):
//    nhiệm vụ ngày / Hành trình / nhiệm vụ tuần (kinhte.js, tientrinh.js), XP phi công mỗi trận, điểm sự kiện, thành tựu + mốc Huyền thoại theo tầng
//    (manh.js), RƯƠNG TRẬN NHỎ mỗi lần thắng tầng (thebai.js), Hộp lên cấp. Không ghi kỷ lục Solo (turret_best) — kỷ lục cũ giữ nguyên.
//  · Lưu: turret_kt.cd (khoá con mới) + turret_kt.mh.tt (Tinh thể Đỏ). Gộp hồ sơ Firebase: cờ OR, số lớn nhất.
'use strict';

const CDC = {
  prep: 5,                                                     // giây chuẩn bị trước wave đầu
  mana: (W) => Math.max(100, Math.floor(0.6 * 27 * W * W / 10) * 10), // 27·W² ≈ mana bot tích tới wave W (tools/thap-sim-che-do-c.js) × 0,6
  // luật sinh quái (chỉ đổi lúc sinh — không móc sát thương)
  dot: {
    DONG: { ten: 'Horde', mo: '+40% enemies, −25% HP each', n: 1.4, hp: 0.75 },
    NHANH: { ten: 'Swift', mo: 'Enemies +25% speed, −15% HP', v: 1.25, hp: 0.85 },
    KHONGLO: { ten: 'Giants', mo: 'Every 3rd enemy is a Giant', kl: 3 },
    DAY: { ten: 'Thick Hide', mo: 'Enemies +30% HP', hp: 1.3 },
    BAY: { ten: 'Sky Raid', mo: 'Half of the enemies fly', bay: 0.5 },
    MONG: { ten: 'Glass Core', mo: 'Only 1 life', tim: 1 },
  },
  thap: {
    so: 100, xp: (t) => 5 + Math.floor(t / 5),
    w: (t) => 5 + Math.floor(0.62 * (t - 1)),                 // wave đầu của tầng t (tầng 100: 66–70)
    luat: [[], ['DONG'], ['NHANH'], ['KHONGLO'], ['DAY'], ['BAY'], ['MONG'], ['NHANH', 'KHONGLO'], ['DONG', 'DAY'], []],
    hs: (t) => (t > 90 ? 1.2 + (t - 91) * 0.2 : 1),             // chương 10: máu ×1,2 → ×3,0
    thuong(t) {
      const r = [{ vang: 50 + 10 * t }];
      if (t % 5 === 0) r.push({ ngoc: t > 70 ? 30 : 20 });
      if (t % 10 === 0) r.push(t <= 30 ? { ruong: 'thuong' } : t <= 60 ? { ruong: 'vang' } : t <= 90 ? { ruong: 'hh', n: 1 } : { ruong: 'hh', n: 2 }); // 10/11 người dùng: thưởng ải to quá (Rương Vàng từ tầng 10) → tầng 10–30 Rương Thường, 40–60 Vàng, 70–90 HH×1, 100 HH×2
      if (t === 50) r.push({ tt: 3 }); if (t === 100) r.push({ tt: 5 });
      return r;
    },
  },
  san: {
    veNgay: 3, muaMax: 2, giaVe: 3000, gio: 90, bac: 10, xp: (b) => 5 + 2 * b,
    hsT: { 8: 2, 9: 4, 10: 8 },
    thuong: (b) => (b <= 3 ? [{ vang: 300 }] : b <= 6 ? [{ vang: 1000 }, { ngoc: 15 }] : b === 7 ? [{ ruong: 'vang' }] : [{ vang: 2000 }, { ngoc: 30 }]), // 10/11: bậc 7 lần đầu HH → Vàng (giảm thưởng)
    du: (b) => (b <= 3 ? [{ ruong: 'thuong' }] : b <= 6 ? [{ ruong: 'vang' }] : b === 7 ? [{ ruong: 'hh', n: 3 }] : b === 10 ? [{ tt: 2 }] : null),
    tuan: { 3: [{ vang: 2000 }], 5: [{ ngoc: 50 }], 7: [{ ruong: 'hh', n: 1 }], 9: [{ tt: 1 }] },
  },
  thu: [
    { ten: 'First Stand', w0: 1, w1: 8, dot: [], r: [{ ruong: 'thuong' }] },
    { ten: 'Boss Gate', w0: 6, w1: 10, trum: 1, dot: [], r: [{ ngoc: 30 }, { ruong: 'thuong' }] },
    { ten: 'Swarm Line', w0: 8, w1: 13, dot: ['DONG'], r: [{ vang: 1000 }, { ruong: 'thuong' }] },
    { ten: 'Giant Steps', w0: 10, w1: 15, dot: ['KHONGLO'], r: [{ ruong: 'vang' }] },
    { ten: 'Glass Core', w0: 12, w1: 17, dot: ['MONG'], r: [{ ngoc: 40 }, { vang: 1000 }] },
    { ten: 'Sky Storm', w0: 15, w1: 20, trum: 1, dot: ['BAY', 'NHANH'], r: [{ ruong: 'vang' }] },
  ],
  thuXp: 20,
  bo: { san: 1, thu: 1, thap: 1 },                             // 11/11 người dùng chốt BỎ Săn Trùm + Thử thách ngắn, rồi (18:41) BỎ cả LEO THÁP (chế độ như DCDW): ẩn khỏi GAME MODE, không vào được; bản lưu cd.san / cd.thu / cd.thap giữ nguyên
  // Tinh thể Đỏ → ẤN ĐỎ (Lò rèn): 15 tinh thể + 50 000 vàng → 1 bản Đỏ tự chọn trong các Đỏ đã mở / đã có
  anDo: { tt: 15, vang: 50000 },
  ICON: { thap: 'ua_ts_xp', san: 'ua_ic_trum', thu: 'ua_ic_nv', tt: 'ua_ts_do' },
};

const CD = {
  cho: null,   // cấu hình chờ batDau kế tiếp
  cuoi: null,  // cấu hình trận C vừa chơi (nút chơi lại / tầng kế)
  lap: null,   // cấu hình cho nút RETRY / NEXT ở màn kết quả
  // ---------- lưu ----------
  st() {
    const s = KT.doc(); let c = s.cd;
    if (!c || typeof c !== 'object' || Array.isArray(c)) c = s.cd = {};
    const o = (k) => (c[k] && typeof c[k] === 'object' && !Array.isArray(c[k]) ? c[k] : (c[k] = {}));
    const th = o('thap'); th.max = Math.max(0, th.max | 0); if (!th.nhan || typeof th.nhan !== 'object') th.nhan = {};
    const sa = o('san'); for (const k of ['da', 'du', 'tuanNhan']) if (!sa[k] || typeof sa[k] !== 'object') sa[k] = {};
    const tu = o('thu'); if (!tu.da || typeof tu.da !== 'object') tu.da = {};
    return c;
  },
  mh() { const m = typeof MH !== 'undefined' ? MH.st() : (KT.doc().mh || {}); m.tt = Math.max(0, m.tt | 0); return m; },
  tt() { return this.mh().tt; },

  // ---------- trùm đã hạ (mọi chế độ) ----------
  dsTrum() { return (typeof TRUM_POOL !== 'undefined' ? TRUM_POOL : typeof TRUM_THU_TU !== 'undefined' ? TRUM_THU_TU : []).filter(id => typeof TRUM === 'undefined' || TRUM[id]); },
  trumHa() {
    const ha = {};
    try { for (const id in (MH.st().tr || {})) ha[id] = 1; } catch (e) { }
    try { for (const id in (TT.st().trk || {})) ha[id] = 1; } catch (e) { }
    try { for (const k in this.st().san.da) ha[k.split(':')[0]] = 1; } catch (e) { }
    return this.dsTrum().filter(id => ha[id] || ADMIN.la());
  },

  // ---------- cấu hình trận ----------
  hat(s) { return (KT.bam('cd:' + s) | 0) || 1; },
  apDot(c, ds) {
    c.dot = ds.slice(); c.hpQ = 1; c.v = 1; c.n = 1; c.kl = 0; c.bay = 0;
    for (const k of ds) { const d = CDC.dot[k]; if (!d) continue; if (d.hp) c.hpQ *= d.hp; if (d.v) c.v *= d.v; if (d.n) c.n *= d.n; if (d.kl) c.kl = d.kl; if (d.bay) c.bay = d.bay; if (d.tim) c.tim = d.tim; }
    return c;
  },
  trumTang(t, w) { const be = typeof trumBe === 'function' ? trumBe(w) : this.dsTrum(); return be[(Math.floor(t / 10) - 1 + be.length * 10) % be.length]; },
  cauHinh(loai, id, b) {
    let c;
    if (loai === 'thap') {
      const t = id, w0 = CDC.thap.w(t), w1 = w0 + 4;
      c = { loai, id: t, w0, w1, hsQ: CDC.thap.hs(t), hsT: 1, trum: t % 10 === 0 ? this.trumTang(t, w1) : null, tim: 3 };
      this.apDot(c, CDC.thap.luat[Math.floor((t - 1) / 10)] || []);
    } else if (loai === 'san') {
      const w1 = b <= 7 ? 10 * b : 70;
      c = { loai, id, bac: b, w0: w1 - 4, w1, hsQ: 1, hsT: CDC.san.hsT[b] || 1, trum: id, tim: 3 };
      this.apDot(c, []);
    } else if (loai === 'thu') {
      const d = CDC.thu[id - 1]; if (!d) return null;
      c = { loai, id, w0: d.w0, w1: d.w1, hsQ: 1, hsT: 1, trum: null, tim: 3 };
      this.apDot(c, d.dot);
      if (d.trum) c.trum = (typeof trumBe === 'function' ? trumBe(d.w1) : this.dsTrum())[id % 3];
    } else return null;
    c.M = CDC.mana(c.w0);
    c.hat = this.hat(loai + ':' + id + ':' + (b | 0));
    return c;
  },

  // ---------- trạng thái từng chế độ ----------
  thapMo(t) { return t >= 1 && t <= CDC.thap.so && (t <= this.st().thap.max + 1 || ADMIN.la()); },
  thapKe() { return Math.min(CDC.thap.so, this.st().thap.max + 1); },
  sanSt() {
    const sa = this.st().san, ng = KT.ngay(), tu = KT.tuan();
    if (sa.ngay !== ng) { sa.ngay = ng; sa.dung = 0; sa.mua = 0; }
    if (sa.tuan !== tu) { sa.tuan = tu; sa.tuanMax = 0; sa.tuanNhan = {}; }
    sa.dung = Math.max(0, sa.dung | 0); sa.mua = Math.max(0, sa.mua | 0); sa.tuanMax = Math.max(0, sa.tuanMax | 0);
    return sa;
  },
  ve() { const sa = this.sanSt(); return Math.max(0, CDC.san.veNgay + sa.mua - sa.dung); },
  veMua() {
    const sa = this.sanSt(); if (sa.mua >= CDC.san.muaMax) return false;
    if (!KT.tra({ vang: CDC.san.giaVe })) { try { UI.nhac('Not enough gold'); } catch (e) { } return false; }
    sa.mua++; KT.luu(); return true;
  },
  trumTuan() { const ds = this.dsTrum(); return ds.length ? ds[((KT.tuan() % ds.length) + ds.length) % ds.length] : null; },
  bacMo(id) { if (ADMIN.la()) return CDC.san.bac; const da = this.st().san.da; let b = 1; while (b < CDC.san.bac && da[id + ':' + b]) b++; return b; }, // bậc cao nhất được chọn
  thuMo(i) { return i === 1 || !!this.st().thu.da[i - 1] || ADMIN.la(); },
  thuKe() { for (let i = 1; i <= CDC.thu.length; i++) if (!this.st().thu.da[i]) return i; return CDC.thu.length; },

  // ---------- vào trận ----------
  // luyen = Săn Trùm hết vé: đánh luyện tập (không thưởng, không mở bậc)
  vao(loai, id, b) {
    if (typeof UI === 'undefined' || UI.chon.length !== 5) { try { UI.nhac('Pick 5 turrets'); } catch (e) { } return false; }
    if (CDC.bo[loai]) return false;
    const c = this.cauHinh(loai, id, b); if (!c) return false;
    if (loai === 'thap' && !this.thapMo(id)) return false;
    if (loai === 'thu' && !this.thuMo(id)) return false;
    if (loai === 'san') {
      if (!this.trumHa().includes(id) || b > this.bacMo(id)) return false;
      if (this.ve() > 0) c.tieuVe = 1; else c.luyen = true; // vé trừ lúc trận bắt đầu (apDung)
    }
    this.cho = c;
    UI.che = 'solo';
    try { if (typeof TTUI !== 'undefined') TTUI.dong(); } catch (e) { }
    UI.vao();
    if (this.cho === c) { this.cho = null; return false; } // không vào được (bản mới đang nạp…)
    return true;
  },
  apDung(c) {
    const B = G.ban[0]; if (!B) return;
    G.cd = Object.assign({}, c, { het: false, tTrum: null });
    G.wave = c.w0 - 1; G.cho = CDC.prep;
    B.mana = c.M; B.tim = c.tim;
    if (c.tieuVe) { const sa = this.sanSt(); if (this.ve() > 0) sa.dung++; else G.cd.luyen = true; KT.luu(); }
    this.cuoi = c;
  },
  // danh sách quái 1 wave thường (giống taoWave ở data.js, RNG có hạt) + luật sinh
  dsQuai(w, r, c) {
    let n = Math.min(32, 9 + Math.floor(w * 0.75)); n = Math.round(n * (c.n || 1));
    const ds = [];
    for (let i = 0; i < n; i++) {
      let id = 'bo'; const x = r();
      if (w >= 2 && x < 0.2) id = 'bay';
      else if (w >= 8 && x < 0.33) id = 'bay_bang';
      else if (w >= 6 && x < 0.46) id = 'tach';
      if (w >= 4 && i % 7 === 6) id = 'khong_lo';
      if (w >= 30 && i % 9 === 4) id = 'que_tach';
      if (c.kl && i % c.kl === c.kl - 1) id = 'khong_lo';
      if (c.bay && id === 'bo' && r() < c.bay) id = w >= 8 && r() < 0.4 ? 'bay_bang' : 'bay';
      ds.push(id);
    }
    return ds;
  },
  wave() {
    const c = G.cd;
    if (G.wave >= c.w1) { c.het = true; G.cho = 0.25; return; } // hết wave: chờ dọn sân (CD.kiem)
    G.wave++;
    const w = G.wave, r = rngHat((c.hat * 2654435761 + w * 40503) | 0), trum = w === c.w1 && c.trum;
    if (trum) {
      G.hang.push({ t: G.t + 1.5, trum: c.trum, p: 0, hs: c.hsT * c.hsQ });
      for (let i = 0; i < 4; i++) G.hang.push({ t: G.t + 3 + i * 1.2, id: 'bo', p: 0 });
    } else {
      const ds = this.dsQuai(w, r, c), dur = 13;
      ds.forEach((q, i) => G.hang.push({ t: G.t + 0.3 + (i / ds.length) * dur + r() * 0.3, id: q, p: 0 }));
    }
    G.tWave = 0; G.laTrum = !!trum;
    UI.bangWave(w, G.laTrum);
    SND.nhac(G.laTrum ? 2 : 1); SND.wave(w, G.laTrum);
  },
  // mỗi bước: thắng khi hết wave + sân sạch; Săn Trùm: hết giờ = thua
  kiem() {
    const c = G.cd; if (!c || G.ketThuc || !G.ban.length) return;
    if (c.loai === 'san' && c.tTrum != null && G.t - c.tTrum > CDC.san.gio && G.quai.some(e => e.trum && !e.chet)) { ketThuc(false, 'Time up — the boss survived'); return; }
    if (c.het && !G.hang.length && !G.quai.some(e => !e.chet)) ketThuc(true, this.tenTran(c) + ' cleared');
  },
  conGio() { const c = G.cd; if (!c || c.loai !== 'san' || c.tTrum == null) return null; return Math.max(0, CDC.san.gio - (G.t - c.tTrum)); },

  // ---------- tên ----------
  tenTrum(id) { return (typeof TRUM !== 'undefined' && TRUM[id] && TRUM[id].ten) || id; },
  tenTran(c) {
    if (c.loai === 'thap') return 'Floor ' + c.id;
    if (c.loai === 'san') return 'Hunt tier ' + c.bac;
    return 'Trial ' + c.id;
  },
  tenCheDo(c) { return { thap: 'TOWER CLIMB', san: 'BOSS HUNT', thu: 'QUICK TRIALS' }[c.loai]; },

  // ---------- thưởng ----------
  phat(ds, khoa, nguon) {
    const ra = { vang: 0, ngoc: 0, the: [], tt: 0 };
    (ds || []).forEach((r, i) => {
      if (r.tt) { const m = this.mh(); m.tt += r.tt; m.ttNhan = (m.ttNhan | 0) + r.tt; ra.tt += r.tt; return; }
      TT.gom(ra, KT.cho(r, khoa + ':' + i, nguon));
    });
    return ra;
  },
  gop(a, b) { if (!b) return a; a.vang += b.vang || 0; a.ngoc += b.ngoc || 0; a.tt += b.tt || 0; a.the.push(...(b.the || [])); if (b.ru) (a.ru = a.ru || []).push(...b.ru); return a; },
  // gọi khi trận C kết thúc (thắng thật, không luyện tập): ghi cờ TRƯỚC rồi phát; trả {ra, xp, moi}
  thang(c) {
    const s = this.st(), ra = { vang: 0, ngoc: 0, the: [], tt: 0 }; let xp = 0, moi = false; const nhan = [];
    if (c.loai === 'thap') {
      const t = c.id;
      if (!s.thap.nhan[t]) { s.thap.nhan[t] = 1; moi = true; this.gop(ra, this.phat(CDC.thap.thuong(t), 'cdt' + t, 'tower')); xp += CDC.thap.xp(t); }
      s.thap.max = Math.max(s.thap.max, t);
    } else if (c.loai === 'san') {
      const k = c.id + ':' + c.bac;
      if (!s.san.da[k]) { s.san.da[k] = 1; moi = true; this.gop(ra, this.phat(CDC.san.thuong(c.bac), 'cds' + k, 'hunt')); xp += CDC.san.xp(c.bac); }
      const du = CDC.san.du(c.bac);
      if (du && !s.san.du[c.bac] && this.dsTrum().every(id => s.san.da[id + ':' + c.bac])) { s.san.du[c.bac] = 1; this.gop(ra, this.phat(du, 'cdsd' + c.bac, 'hunt')); nhan.push('ALL BOSSES · TIER ' + c.bac); }
      const sa = this.sanSt();
      if (c.id === this.trumTuan()) {
        sa.tuanMax = Math.max(sa.tuanMax, c.bac);
        for (const m in CDC.san.tuan) if (+m <= sa.tuanMax && !sa.tuanNhan[m]) { sa.tuanNhan[m] = 1; this.gop(ra, this.phat(CDC.san.tuan[m], 'cdw' + sa.tuan + ':' + m, 'hunt')); nhan.push('BOSS OF THE WEEK · TIER ' + m); }
      }
    } else if (c.loai === 'thu') {
      if (!s.thu.da[c.id]) { s.thu.da[c.id] = 1; moi = true; this.gop(ra, this.phat(CDC.thu[c.id - 1].r, 'cdu' + c.id, 'trial')); xp += CDC.thuXp; }
    }
    let len = null;
    if (xp) { try { const t = TT.st(), cap0 = TT.cap(); t.xp += xp; TT.xetCap(); len = TT.cap() > cap0 ? TT.cap() : null; } catch (e) { console.error('CD', e); } }
    KT.luu();
    return { ra, xp, moi, len, nhan };
  },

  // ---------- ẤN ĐỎ ----------
  anDoTt() {
    const ds = KT.dsPool ? KT.dsPool('do') : [];
    const mo = typeof TT === 'undefined' || TT.tnMo('renDo');
    return { mo, tt: this.tt(), duTt: this.tt() >= CDC.anDo.tt, duVang: KT.vang >= CDC.anDo.vang, ds, duoc: mo && ds.length > 0 && this.tt() >= CDC.anDo.tt && KT.vang >= CDC.anDo.vang };
  },
  anDo(id) {
    const t = this.anDoTt(); if (!t.duoc || !t.ds.includes(id)) return null;
    const m = this.mh(); m.tt -= CDC.anDo.tt; m.anDoN = (m.anDoN | 0) + 1;
    KT.cong('vang', -CDC.anDo.vang, 'exchange');
    const ra = KT.cho({ the: { id, n: 1 } }, 'cdad' + m.anDoN, 'exchange');
    KT.luu(); return { vang: 0, ngoc: 0, the: ra.the };
  },

  // ---------- gộp hồ sơ Firebase ----------
  gopHs(a, b, ma, mb) {
    const s = this.st();
    for (const y of [a, b]) {
      if (!y || typeof y !== 'object') continue;
      if (y.thap) { s.thap.max = Math.max(s.thap.max, y.thap.max | 0); for (const k in (y.thap.nhan || {})) if (y.thap.nhan[k]) s.thap.nhan[k] = 1; }
      if (y.san) {
        for (const k of ['da', 'du']) for (const i in (y.san[k] || {})) if (y.san[k][i]) s.san[k][i] = 1;
        const sa = this.sanSt();
        if (y.san.ngay === sa.ngay) { sa.dung = Math.max(sa.dung, y.san.dung | 0); sa.mua = Math.max(sa.mua, y.san.mua | 0); }
        if (y.san.tuan === sa.tuan) { sa.tuanMax = Math.max(sa.tuanMax, y.san.tuanMax | 0); for (const i in (y.san.tuanNhan || {})) if (y.san.tuanNhan[i]) sa.tuanNhan[i] = 1; }
      }
      if (y.thu) for (const i in (y.thu.da || {})) if (y.thu.da[i]) s.thu.da[i] = 1;
    }
    const m = this.mh();
    for (const y of [ma, mb]) if (y && typeof y === 'object') { m.tt = Math.max(m.tt, y.tt | 0); m.ttNhan = Math.max(m.ttNhan | 0, y.ttNhan | 0); m.anDoN = Math.max(m.anDoN | 0, y.anDoN | 0); }
  },
};

// ===================================================== GIAO DIỆN =====================================================
const CDUI = {
  chon: { thap: 0, chuong: 0, san: null, bac: 1, thu: 0 },
  esc: (v) => String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
  a: (n) => (typeof KTUI !== 'undefined' ? KTUI.a(n) : 'assets/' + n + '.png'),
  so: (v) => (typeof KTUI !== 'undefined' ? KTUI.so(v) : String(v)),
  ttIc(n) { return '<span class="kt-r cd-tt"><img src="' + this.a(CDC.ICON.tt) + '" alt="Red Crystal"><b>' + n + '</b></span>'; },
  rIc(r) { return r.tt ? this.ttIc(r.tt) : KTUI.rIc(r); },
  dsThuong(ds) { return '<div class="cd-thuong">' + ds.map(r => this.rIc(r)).join('') + '</div>'; },
  dotChu(ds) { return ds.length ? ds.map(k => CDC.dot[k].ten + ': ' + CDC.dot[k].mo).join(' · ') : 'No extra rules'; },
  phu(html, cls) { return TTUI.phu(html, 'cd-p ' + (cls || '')); },
  dau(ic, ten, phu) { return '<div class="cd-dau"><img src="' + this.a(ic) + '" alt=""><span><b class="kt-phu-t">' + ten + '</b>' + (phu ? '<small>' + phu + '</small>' : '') + '</span></div>'; },
  nut(chon, act) { return '<div class="cd-nut">' + '<button class="hm-nut2" data-act="tt-dong"><b>CLOSE</b></button>' + chon + '</div>'; },
  thongSo(c) {
    return '<div class="cd-so"><span><small>WAVES</small><b>' + c.w0 + '–' + c.w1 + '</b></span><span><small>START MANA</small><b>' + this.so(c.M) + '</b></span><span><small>LIVES</small><b>' + c.tim + '</b></span></div>';
  },

  mo(loai) { if (CDC.bo[loai]) return; SND.nut(); if (loai === 'thap') this.thap(); else if (loai === 'san') this.san(); else this.thu(); },

  // ---------- LEO THÁP ----------
  thap() {
    const s = CD.st(), ke = CD.thapKe();
    let t = this.chon.thap || ke; if (!CD.thapMo(t)) t = ke; this.chon.thap = t;
    const ch = Math.ceil(t / 10); this.chon.chuong = ch;
    const c = CD.cauHinh('thap', t), da = !!s.thap.nhan[t];
    let h = this.dau(CDC.ICON.thap, 'TOWER CLIMB', 'BEST FLOOR ' + s.thap.max + ' / ' + CDC.thap.so);
    h += '<div class="cd-chuong"><button class="hm-nut2 cd-mui" data-act="cd-ch" data-id="' + (ch - 1) + '"' + (ch > 1 ? '' : ' disabled') + ' aria-label="Previous chapter"><b>‹</b></button>' +
      '<span><b>CHAPTER ' + ch + '</b><small>' + this.esc(ch === 10 ? 'Enemy HP ×1.2–3' : CDC.thap.luat[ch - 1].map(k => CDC.dot[k].ten).join(' + ') || 'No extra rules') + '</small></span>' +
      '<button class="hm-nut2 cd-mui" data-act="cd-ch" data-id="' + (ch + 1) + '"' + (ch < Math.ceil(ke / 10) ? '' : ' disabled') + ' aria-label="Next chapter"><b>›</b></button></div>';
    h += '<div class="cd-luoi">';
    for (let i = 1; i <= 10; i++) {
      const f = (ch - 1) * 10 + i, mo = CD.thapMo(f), xong = !!s.thap.nhan[f], tr = f % 10 === 0;
      h += '<button class="cd-o' + (f === t ? ' on' : '') + (xong ? ' xong' : '') + (mo ? '' : ' khoa') + (tr ? ' trum' : '') + '" data-act="cd-tang" data-id="' + f + '"' + (mo ? '' : ' disabled') + ' aria-label="Floor ' + f + '">' +
        (tr ? '<img class="cd-o-tr" src="assets/trum_' + CD.trumTang(f, CDC.thap.w(f) + 4) + '_portrait.png" alt="" draggable="false">' : '') + '<b>' + f + '</b>' +
        (xong ? '<img class="cd-tick" src="' + this.a(KTA.xong) + '" alt="Cleared">' : !mo ? '<img class="cd-khoa" src="' + this.a('ua_ic_khoa') + '" alt="Locked">' : '') + '</button>';
    }
    h += '</div>';
    h += '<div class="cd-ct"><b class="cd-ct-t">FLOOR ' + t + (c.trum ? ' · BOSS: ' + this.esc(CD.tenTrum(c.trum)) : '') + '</b>' + this.thongSo(c) +
      '<p class="kt-chu cd-luat">' + this.esc(this.dotChu(c.dot)) + (c.hsQ > 1 ? ' · Enemy HP ×' + c.hsQ.toFixed(1) : '') + '</p>' +
      '<small class="cd-nh">' + (da ? 'FIRST CLEAR REWARD CLAIMED' : 'FIRST CLEAR REWARD') + '</small>' + (da ? '' : this.dsThuong(CDC.thap.thuong(t))) + '</div>';
    this.phu(h + this.nut('<button class="hm-nut2 vang" data-act="cd-vao" data-k="thap" data-id="' + t + '"><b>CLIMB · FLOOR ' + t + '</b></button>'), 'cd-thap');
  },

  // ---------- SĂN TRÙM ----------
  san() {
    const s = CD.st(), sa = CD.sanSt(), ha = CD.trumHa(), ds = CD.dsTrum(), tuan = CD.trumTuan();
    let id = this.chon.san; if (!ha.includes(id)) id = ha.includes(tuan) ? tuan : ha[0]; this.chon.san = id;
    const bm = id ? CD.bacMo(id) : 1; let b = this.chon.bac; if (!(b >= 1 && b <= bm)) b = bm; this.chon.bac = b;
    const ve = CD.ve();
    let h = this.dau(CDC.ICON.san, 'BOSS HUNT', 'TICKETS ' + ve + ' / ' + CDC.san.veNgay + ' · RESETS IN ' + KT.dongHo(KT.conLai(false)));
    // trùm tuần
    const tt = Object.keys(CDC.san.tuan).map(Number);
    h += '<div class="cd-tuan"><img src="assets/trum_' + tuan + '_portrait.png" alt="" draggable="false"><span><small>BOSS OF THE WEEK</small><b>' + this.esc(CD.tenTrum(tuan)) + '</b>' +
      '<em>' + tt.map(m => '<i class="' + (sa.tuanNhan[m] ? 'da' : '') + '">T' + m + '</i>').join('') + '</em></span>' + this.ttIc('T9') + '</div>';
    h += '<div class="cd-trum">' + ds.map(x => {
      const co = ha.includes(x), so = CD.bacMo(x) - (s.san.da[x + ':' + CD.bacMo(x)] ? 0 : 1);
      return '<button class="cd-tr' + (x === id ? ' on' : '') + (co ? '' : ' khoa') + (x === tuan ? ' tuan' : '') + '" data-act="cd-trum" data-id="' + x + '"' + (co ? '' : ' disabled') + ' aria-label="' + this.esc(CD.tenTrum(x)) + '"><img src="assets/trum_' + x + '_portrait.png" alt="" draggable="false">' +
        (co ? '<b>' + so + '/10</b>' : '<img class="cd-khoa" src="' + this.a('ua_ic_khoa') + '" alt="Locked">') + '</button>';
    }).join('') + '</div>';
    if (!id) { this.phu(h + '<p class="kt-chu">Defeat a boss once to hunt it.</p>' + this.nut(''), 'cd-san'); return; }
    h += '<div class="cd-bac">' + Array.from({ length: CDC.san.bac }, (_, i) => i + 1).map(x => '<button class="cd-bp' + (x === b ? ' on' : '') + (s.san.da[id + ':' + x] ? ' xong' : '') + '" data-act="cd-bac" data-id="' + x + '"' + (x <= bm ? '' : ' disabled') + '>' + x + '</button>').join('') + '</div>';
    const c = CD.cauHinh('san', id, b), da = !!s.san.da[id + ':' + b], du = CDC.san.du(b), nDu = ds.filter(x => s.san.da[x + ':' + b]).length;
    h += '<div class="cd-ct"><b class="cd-ct-t">' + this.esc(CD.tenTrum(id)) + ' · TIER ' + b + '</b>' + this.thongSo(c) +
      '<p class="kt-chu cd-luat">Defeat the boss within ' + CDC.san.gio + ' s' + (c.hsT > 1 ? ' · Boss HP ×' + c.hsT : '') + '</p>' +
      '<small class="cd-nh">' + (da ? 'FIRST WIN REWARD CLAIMED' : 'FIRST WIN REWARD') + '</small>' + (da ? '' : this.dsThuong(CDC.san.thuong(b))) +
      (du ? '<small class="cd-nh">ALL ' + ds.length + ' BOSSES AT TIER ' + b + ' · ' + nDu + '/' + ds.length + (s.san.du[b] ? ' · CLAIMED' : '') + '</small>' + (s.san.du[b] ? '' : this.dsThuong(du)) : '') + '</div>';
    const mua = sa.mua < CDC.san.muaMax ? '<button class="hm-nut2 cd-ve" data-act="cd-ve"><b>+1 TICKET</b><small><img src="' + this.a(KTA.vang) + '" alt="">' + this.so(CDC.san.giaVe) + '</small></button>' : '';
    this.phu(h + this.nut(mua + '<button class="hm-nut2 vang" data-act="cd-vao" data-k="san" data-id="' + id + '" data-b="' + b + '"><b>' + (ve > 0 ? 'HUNT · 1 TICKET' : 'PRACTICE') + '</b></button>'), 'cd-san');
  },

  // ---------- THỬ THÁCH NGẮN ----------
  thu() {
    const s = CD.st(); let sel = this.chon.thu || CD.thuKe(); if (!CD.thuMo(sel)) sel = CD.thuKe(); this.chon.thu = sel;
    let h = this.dau(CDC.ICON.thu, 'QUICK TRIALS', Object.keys(s.thu.da).length + ' / ' + CDC.thu.length + ' CLEARED');
    h += '<div class="cd-thu">' + CDC.thu.map((d, i) => {
      const n = i + 1, mo = CD.thuMo(n), xong = !!s.thu.da[n];
      return '<button class="cd-th' + (n === sel ? ' on' : '') + (xong ? ' xong' : '') + (mo ? '' : ' khoa') + '" data-act="cd-thu" data-id="' + n + '"' + (mo ? '' : ' disabled') + '><i>' + n + '</i><span><b>' + this.esc(d.ten) + '</b><small>WAVES ' + d.w0 + '–' + d.w1 + (d.trum ? ' · BOSS' : '') + '</small></span>' +
        (xong ? '<img class="cd-tick" src="' + this.a(KTA.xong) + '" alt="Cleared">' : !mo ? '<img class="cd-khoa" src="' + this.a('ua_ic_khoa') + '" alt="Locked">' : this.dsThuong(d.r)) + '</button>';
    }).join('') + '</div>';
    const c = CD.cauHinh('thu', sel);
    h += '<div class="cd-ct">' + this.thongSo(c) + '<p class="kt-chu cd-luat">' + this.esc(this.dotChu(c.dot)) + '</p></div>';
    this.phu(h + this.nut('<button class="hm-nut2 vang" data-act="cd-vao" data-k="thu" data-id="' + sel + '"><b>START · TRIAL ' + sel + '</b></button>'), 'cd-thu-p');
  },

  // ---------- màn kết quả ----------
  ketQua(k, c, rp) {
    const kq = document.getElementById('ketqua'); if (!kq) return;
    try { if (typeof VT !== 'undefined' && VT.mo) VT.dong(); } catch (e) { }
    let r = null;
    if (rp !== undefined) r = rp; // Leo Tháp: đã phát thưởng lần đầu trước chuỗi hết trận
    else if (k.thang && !c.luyen) { try { r = CD.thang(c); } catch (e) { console.error('CD', e); } }
    this._ru = r && r.ra.ru ? r.ra.ru.slice() : [];
    const dich = (x) => (typeof NN !== 'undefined' && NN.t ? NN.t(x) : x); // câu ghép với lý do thua (đã là chữ Việt) → dịch phần của mình trước
    const phu = document.getElementById('kq-phu'); if (phu) phu.textContent = dich(CD.tenCheDo(c) + ' · ' + (c.loai === 'san' ? 'TIER ' + c.bac : CD.tenTran(c).toUpperCase())) + (c.loai === 'san' ? ' · ' + CD.tenTrum(c.id) : '') + (!k.thang && k.ly ? ' · ' + dich(k.ly) : '');
    const chi = document.getElementById('kq-chi'); if (!chi) return;
    const o = (nhan, so) => '<div class="kq-o"><small>' + nhan + '</small><b>' + so + '</b></div>';
    const soW = c.w1 - c.w0 + 1, qua = Math.max(0, Math.min(soW, G.wave - c.w0 + (k.thang ? 1 : 0))), tim = G.ban[0] ? Math.max(0, G.ban[0].tim | 0) : 0;
    let h = '<div class="kq-hang">' + (c.loai === 'san' ? o('TIER', c.bac) + o('TICKETS', CD.ve()) : o(c.loai === 'thap' ? 'FLOOR' : 'TRIAL', c.id) + o('WAVES', qua + '/' + soW)) + o('LIVES', tim + '/' + c.tim) + '</div>';
    let th;
    const lt = rp !== undefined && c.loai === 'thap' && typeof KQ !== 'undefined' && KQ.m && KQ.m.thap;
    if (lt) th = this.thuongThap(k, r);
    else if (c.luyen) th = '<small>PRACTICE · NO REWARD</small>';
    else if (r && (r.ra.vang || r.ra.ngoc || r.ra.tt || r.ra.the.length || (r.ra.ru || []).length)) {
      const ic = []; if (r.ra.vang) ic.push(KTUI.rIc({ vang: r.ra.vang })); if (r.ra.ngoc) ic.push(KTUI.rIc({ ngoc: r.ra.ngoc })); if (r.ra.tt) ic.push(this.ttIc(r.ra.tt));
      th = '<small>' + (r.moi ? 'FIRST CLEAR REWARDS' : 'REWARDS') + '</small><div class="tb-kq-h cd-kq-h">' + (this._ru.length ? '<button class="sh-kq-ru" data-act="cd-kq-mo" aria-label="Open chest"><img src="' + this.a(KTA.ru[this._ru[0].k] || KTA.ru.thuong) + '" alt=""><b>OPEN' + (this._ru.length > 1 ? ' ×' + this._ru.length : '') + '</b></button>' : '') + ic.join('') + '</div>' +
        (r.xp ? '<small class="kt-kq tt-kq">PILOT XP +' + r.xp + (r.len ? ' · LEVEL ' + r.len + '!' : '') + '</small>' : '');
    } else th = '<small>' + (k.thang ? 'NO REWARD · ALREADY CLEARED' : 'NO REWARD') + '</small>';
    chi.innerHTML = h + '<div class="tb-kq cd-kq">' + th + '</div>';
    try { if (typeof OT !== 'undefined' && OT.quet) OT.quet(chi); } catch (e) { }
    // nút: chơi lại / tầng kế
    let lap = c, chu;
    if (c.loai === 'thap') { if (k.thang && c.id < CDC.thap.so) { lap = CD.cauHinh('thap', c.id + 1); chu = 'NEXT · FLOOR ' + (c.id + 1); } else chu = 'RETRY · FLOOR ' + c.id; }
    else if (c.loai === 'thu') { if (k.thang && c.id < CDC.thu.length) { lap = CD.cauHinh('thu', c.id + 1); chu = 'NEXT TRIAL'; } else chu = 'RETRY TRIAL'; }
    else chu = CD.ve() > 0 ? 'HUNT AGAIN · 1 TICKET' : 'PRACTICE AGAIN';
    CD.lap = lap;
    const lai = kq.querySelector('[data-act="choilai"]'); if (lai) lai.textContent = chu;
    const sua = kq.querySelector('[data-act="doibo"]'); if (sua) sua.textContent = 'EDIT DECK';
  },
  // ô thưởng trận Leo Tháp: thưởng lần đầu + Rương Trận nhỏ (thebai.js, chỉ khi thắng) + mốc Huyền thoại theo tầng (manh.js) — 1 nút OPEN mở
  //  tất cả rương; dòng XP phi công (lần đầu + mỗi trận) + điểm sự kiện
  thuongThap(k, r) {
    const bt = KQ.m._thuong || null, x = (typeof KT !== 'undefined' && KT.tran && KT.tran.kq) || {}, mh = x.mh || [], ru = this._ru.slice();
    let vang = (r ? r.ra.vang : 0) + (bt ? bt.vang | 0 : 0), ngoc = r ? r.ra.ngoc : 0; const tt = r ? r.ra.tt : 0;
    for (const g of mh) { if (g.ra) { vang += g.ra.vang || 0; ngoc += g.ra.ngoc || 0; ru.push(...(g.ra.ru || [])); } }
    if (bt && bt.the && bt.the.length) ru.push({ k: 'tran', ten: 'BATTLE CHEST', the: bt.the.map(y => ({ id: y.id, n: y.n, bac: y.bac || THEBAI.bac(y.id), moi: y.moi })).sort((a, b) => TIERS[a.bac].thuTu - TIERS[b.bac].thuTu) });
    this._ru = ru;
    const ic = []; if (vang) ic.push(KTUI.rIc({ vang })); if (ngoc) ic.push(KTUI.rIc({ ngoc })); if (tt) ic.push(this.ttIc(tt));
    const xp = (r ? r.xp : 0) + (x.tt ? x.tt.xp | 0 : 0), len = (x.tt && x.tt.len && x.tt.cap) || (r && r.len) || 0;
    const co = ru.length || ic.length;
    let h = '<small>' + (r && r.moi ? 'FIRST CLEAR REWARDS' : co ? 'REWARDS' : 'NO REWARD') + '</small>';
    if (co) h += '<div class="tb-kq-h cd-kq-h">' + (ru.length ? '<button class="sh-kq-ru" data-act="cd-kq-mo" aria-label="Open chest"><img src="' + this.a(KTA.ru[ru[0].k] || KTA.ru.thuong) + '" alt=""><b>OPEN' + (ru.length > 1 ? ' ×' + ru.length : '') + '</b></button>' : '') + ic.join('') + '</div>';
    if (mh.length) h += '<small class="kt-kq">' + mh.map(g => g.nhan).join(' · ') + '</small>';
    if (xp) h += '<small class="kt-kq tt-kq">PILOT XP +' + xp + (len ? ' · LEVEL ' + len + '!' : '') + '</small>';
    if (x.diem) h += '<small class="kt-kq">EVENT +' + x.diem + ' PTS</small>';
    return h;
  },
  // xong trận hướng dẫn (thắng): nút chơi tiếp = vào tầng Leo Tháp kế (không còn trận Solo)
  sauHd(k) {
    if (!k || !k.thang || typeof KQ === 'undefined' || !KQ.m || !KQ.m.tut || !TT.tnMo('coop')) return;
    const lai = document.querySelector('#ketqua [data-act="choilai"]'); if (!lai) return;
    lai.textContent = 'PLAY CO-OP'; lai.dataset.cdThap = '1'; // 11/11 bỏ Leo Tháp: xong hướng dẫn → trận CO-OP (đồng đội máy) với bộ hướng dẫn
  },
  moKq() {
    const ru = this._ru || []; if (!ru.length) return;
    this._ru = [];
    const b = document.querySelector('#ketqua [data-act="cd-kq-mo"]'); if (b) b.remove();
    KTUI.nhan({ vang: 0, ngoc: 0, the: [], ru }, '', { phu: (h, c) => SHUI.phuKq(h, c), dong: 'sh-dong' });
  },
  // nhãn trong trận (dưới thanh trên): tầng + wave x/5 · Săn Trùm: đồng hồ trùm
  // nhãn giữa thanh trên (thay "BOSS IN N" theo chu kỳ 10 wave): FLOOR t · k/5 — trùm đang ở sân: giữ máu trùm của HUD; Săn Trùm: + đồng hồ
  nhanTren(c) {
    const soW = c.w1 - c.w0 + 1, qua = Math.max(1, Math.min(soW, G.wave - c.w0 + 1));
    return (c.loai === 'san' ? 'TIER ' + c.bac + (c.luyen ? ' · PRACTICE' : '') : (c.loai === 'thap' ? 'FLOOR ' : 'TRIAL ') + c.id) + ' · ' + qua + '/' + soW;
  },
  chip() {
    const c = G.cd, top = document.getElementById('top'); if (!top) return;
    if (top.classList.contains('cd-on') !== !!c) top.classList.toggle('cd-on', !!c);
    top.classList.toggle('cd-ko-trum', !!c && !c.trum);
    let e = document.getElementById('cd-chip');
    if (!c || !G.ban.length) { if (e && !e.hidden) e.hidden = true; return; }
    const trum = !G.ketThuc && G.quai.some(x => x.trum && !x.chet);
    if (!trum) {
      const tc = document.getElementById('tb-trum-chu'), t = this.nhanTren(c); if (tc && tc.textContent !== t) tc.textContent = t;
      const f = document.querySelector('#ha-thanh .f'); if (f) { const soW = c.w1 - c.w0 + 1, w = (Math.max(1, Math.min(soW, G.wave - c.w0 + 1)) / soW * 100) + '%'; if (f.style.width !== w) f.style.width = w; }
    }
    const gio = CD.conGio();
    if (gio == null || !trum || G.ketThuc) { if (e && !e.hidden) e.hidden = true; return; }
    const wr = document.getElementById('wrap'); if (!wr) return;
    if (!e) { e = document.createElement('div'); e.id = 'cd-chip'; e.className = 'cd-chip'; wr.appendChild(e); }
    const t = 'BOSS TIME ' + Math.ceil(gio) + 's';
    if (e._t !== t) { e._t = t; e.textContent = t; }
    e.classList.toggle('gap', gio <= 15);
    if (e.hidden) e.hidden = false;
  },

  // ---------- Ấn Đỏ (Lò rèn trong SHOP) ----------
  anDoHang() { // cùng khuôn hàng LÒ RÈN của manh.js (Ấn Vàng): ô bậc Đỏ · tên + giá · nút
    const t = CD.anDoTt(), kh = KTUI.khoaNut ? KTUI.khoaNut('ren:vd', 'kt-slot') : '';
    const tt = '<i class="mh-chip cd-chip-tt"><img src="' + this.a(CDC.ICON.tt) + '" alt="Red Crystal">×' + CDC.anDo.tt + '</i>';
    const nut = kh || '<button class="kt-slot' + (t.duoc ? ' vang' : '') + '" data-act="cd-ad"' + (t.duoc ? '' : ' disabled') + '><b>PICK</b></button>';
    return '<div class="kt-h mh-an cd-ad' + (kh ? ' tt-khoa-h' : '') + '">' + MHUI.icBac('do', 1) + '<div class="kt-h-g"><b>Red Seal ' + tt + ' → 1 of your choice</b>' +
      '<small class="mh-gia"><img src="' + this.a(KTA.vang) + '" alt="">' + this.so(CDC.anDo.vang) + ' · YOU HAVE ' + t.tt + '/' + CDC.anDo.tt + '</small></div>' + nut + '</div>';
  },
  anDoChon() {
    const t = CD.anDoTt();
    const ds = t.ds.map(x => '<button class="mh-the tt-the" data-act="cd-adc" data-id="' + x + '">' + OT.mini(x) + '<b>×1</b><small>' + KTUI.ten(x) + '</small></button>').join('');
    const h = '<b class="kt-phu-t">RED SEAL</b><p class="kt-chu">Pick 1 Mythic card: +1 copy. Costs ' + CDC.anDo.tt + ' Red Crystals and ' + this.so(CDC.anDo.vang) + ' gold.</p><div class="mh-chon tt-chon">' + ds + '</div>';
    if (KTUI.mo) KTUI.phu(h + '<button class="hm-nut2 kt-ok" data-act="kt-phu-dong"><b>LATER</b></button>', 'kt-tl mh-p');
  },
};

(function () {
  if (typeof KT === 'undefined' || typeof TT === 'undefined' || typeof batDau !== 'function') return;
  if (typeof UP_XEM !== 'undefined' && UP_XEM) return; // khung xem trước trang ụ: không gắn gì
  for (const n of ['tower', 'hunt', 'trial']) if (!KT.NGUON.includes(n)) KT.NGUON.splice(KT.NGUON.length - 1, 0, n);
  try { CD.st(); } catch (e) { console.error('CD', e); }

  // ---- khoá tính năng (tientrinh.js TTC.tn) ----
  Object.assign(TTC.tn, { thu: { hd: 1, ten: 'QUICK TRIALS' }, thap: { hd: 1, ten: 'TOWER CLIMB' }, san: { cap: 0, trum: 3, ten: 'BOSS HUNT' } }); for (const k in CDC.bo) delete TTC.tn[k]; // chế độ đã bỏ: không báo "mở tính năng" // 10/11: Leo Tháp mở ngay sau hướng dẫn (trước: cấp 5)
  { const g = TT.tnMo; TT.tnMo = function (k) { if (k === 'san') { try { return ADMIN.la() || !!this.st().giuTn.san || CD.trumHa().length >= TTC.tn.san.trum; } catch (e) { return false; } } return g.apply(this, arguments); }; }
  { const g = TT.tnChu; TT.tnChu = function (k) { return k === 'san' ? 'Unlocks after defeating ' + TTC.tn.san.trum + ' different bosses' : g.apply(this, arguments); }; }
  { const g = TTUI.tnNhan; TTUI.tnNhan = function (k) { return k === 'san' ? '<b>' + TTC.tn.san.trum + ' BOSSES</b>' : g.apply(this, arguments); }; }

  // ---- trận ----
  const bd = batDau;
  batDau = function (che) {
    const c = CD.cho; CD.cho = null;
    const laC = !!(c && che === 'solo');
    G.cd = null;
    if (laC) { G.hat = c.hat; G.giuHat = true; G.cd = Object.assign({}, c, { het: false, tTrum: null }); } // đặt trước: màn mở đầu (vaotran.js) có thể dựng ngay trong batDau
    const r = bd.apply(this, arguments);
    if (laC) { try { CD.apDung(c); } catch (e) { console.error('CD', e); G.cd = null; } }
    return r;
  };
  const wm = wavMoi; wavMoi = function () { if (!G.cd) return wm.apply(this, arguments); return CD.wave(); };
  const sq = sinhQuai;
  sinhQuai = function (id, pi, s, hs, gui) {
    const c = G.cd; if (!c) return sq.apply(this, arguments);
    const E = sq.call(this, id, pi, s, (hs || 1) * (c.hpQ || 1) * (c.hsQ || 1), gui);
    if (E && E.d && c.v && c.v !== 1) E.d = Object.assign({}, E.d, { v: E.d.v * c.v });
    return E;
  };
  const st = sinhTrum;
  sinhTrum = function () { const E = st.apply(this, arguments); try { if (G.cd && E && G.cd.tTrum == null) G.cd.tTrum = G.t; } catch (e) { } return E; };
  const lo = lot;
  lot = function (E) { const r = lo.apply(this, arguments); try { if (G.cd && G.cd.loai === 'san' && E && E.trum && !G.ketThuc) ketThuc(false, 'The boss escaped'); } catch (e) { } return r; };
  const cn = capNhat;
  capNhat = function () { const r = cn.apply(this, arguments); try { CD.kiem(); } catch (e) { console.error('CD', e); } return r; };

  // ---- màn kết quả: trận C bỏ qua kỷ lục / túi trận / nhiệm vụ / sự kiện, hiện thưởng lần đầu ----
  if (typeof UI !== 'undefined' && UI.ketQua) {
    const kq = UI.ketQua;
    UI.ketQua = function (k) {
      const c = G.cd;
      if (!c) { const x = kq.apply(this, arguments); try { CDUI.sauHd(k); } catch (e) { console.error('CD', e); } return x; }
      // LEO THÁP (10/11 thay Solo): chạy đủ chuỗi hết trận (nhiệm vụ / XP / sự kiện / Rương Trận nhỏ) với KQ.m.thap; chỉ bỏ kỷ lục Solo
      if (c.loai === 'thap' && !c.luyen && typeof KQ !== 'undefined' && KQ.m && !KQ.m.tut) {
        const soW = c.w1 - c.w0 + 1, qua = Math.max(0, Math.min(soW, G.wave - c.w0 + (k && k.thang ? 1 : 0)));
        let r = null; if (k && k.thang) { try { r = CD.thang(c); } catch (e) { console.error('CD', e); } } // thưởng lần đầu TRƯỚC → nhiệm vụ / mốc thấy tầng mới
        KQ.m.thap = { t: c.id, qua, thang: !!(k && k.thang) };
        try { if (KT.tran) KT.tran.che = 'thap'; } catch (e) { }
        const lb = KQ.luuBest; KQ.luuBest = function () { };
        let x; try { x = kq.apply(this, arguments); } finally { KQ.luuBest = lb; }
        try { CDUI.ketQua(k, c, r); } catch (e) { console.error('CD', e); }
        return x;
      }
      const dw = G.debug.wave, lb = typeof KQ !== 'undefined' ? KQ.luuBest : null;
      G.debug.wave = -1; if (lb) KQ.luuBest = function () { };
      let x;
      try { x = kq.apply(this, arguments); } finally { G.debug.wave = dw; if (lb) KQ.luuBest = lb; if (!dw) delete G.debug.wave; }
      try { CDUI.ketQua(k, c); } catch (e) { console.error('CD', e); }
      return x;
    };
  }
  // HUD trận: bọc SAU cùng (hud-anime.js / tvb.js nạp sau file này) → nhãn giữa thanh trên + đồng hồ trùm ghi đè sau HUD
  const bocHud = () => {
    if (UI._cdHud) return; UI._cdHud = 1;
    const g = UI.capNhat; UI.capNhat = function () { const r = g.apply(this, arguments); try { CDUI.chip(); } catch (e) { } return r; };
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(bocHud, 0)); else setTimeout(bocHud, 0);
  // trùm của trận C: báo trước / chân dung / màn mở đầu chỉ theo trùm của tầng (không theo chu kỳ 10 wave của Solo)
  const tcw = trumCuaWave; trumCuaWave = function (w, p) { const c = G.cd; if (c) return c.trum || tcw.apply(this, arguments); return tcw.apply(this, arguments); };
  if (typeof HT !== 'undefined' && HT.theoDoi) {
    const td = HT.theoDoi;
    HT.theoDoi = function () {
      const c = G.cd; if (!c) return td.apply(this, arguments);
      if (!G.ban.length || G.ketThuc || (typeof VT !== 'undefined' && VT.mo)) return;
      const w = G.wave + 1;
      if (c.trum && w === c.w1 && this._baoW !== w && !G.laTrum && G.wave >= c.w0 && (G.cho > 0 || G.tWave >= LUAT.thoiGianWave - this.TRUM.BAO_TRUOC)) this.bao(w);
      this.demBao();
    };
  }
  if (typeof VT !== 'undefined') {
    const ds = VT.dsTrum; VT.dsTrum = function () { const c = G.cd; if (c) return c.trum ? [c.w1] : []; return ds.apply(this, arguments); };
    const dg = VT.dung;
    VT.dung = function () {
      const c = G.cd; if (!c) return dg.apply(this, arguments);
      const b = this.CHU.boss; this.CHU.boss = CD.tenCheDo(c) + ' · ' + (c.loai === 'san' ? 'TIER ' + c.bac : CD.tenTran(c).toUpperCase());
      try { return dg.apply(this, arguments); } finally { this.CHU.boss = b; }
    };
  }
  // RETRY / NEXT sau trận C (pha capture, trước ketqua.js / ui.js): nạp cấu hình chờ rồi để ui.js gọi batDau như thường
  document.addEventListener('click', (e) => { // xong hướng dẫn → CLIMB · FLOOR n (bộ hướng dẫn đang chọn)
    const el = e.target.closest && e.target.closest('#ketqua [data-act="choilai"][data-cd-thap]'); if (!el) return;
    delete el.dataset.cdThap; if (G.cd || !TT.tnMo('coop')) return;
    UI.che = 'coop'; if (typeof KQ !== 'undefined' && KQ.m) KQ.m.che = 'coop';
    if (typeof HM !== 'undefined') { HM.che = 'coop'; HM.luu(); }
  }, true);
  document.addEventListener('click', (e) => {
    const el = e.target.closest && e.target.closest('#ketqua [data-act="choilai"]'); if (!el || !CD.lap || !G.cd) return;
    const c = CD.lap; CD.lap = null;
    if (c.loai === 'san') { const n = CD.cauHinh('san', c.id, c.bac); if (CD.ve() > 0) n.tieuVe = 1; else n.luyen = true; CD.cho = n; }
    else CD.cho = Object.assign({}, c);
    if (typeof KQ !== 'undefined' && KQ.m) KQ.m.che = 'solo';
    UI.che = 'solo';
  }, true);
  document.addEventListener('click', (e) => { // rời màn kết quả trận C (EDIT DECK / QUIT): không còn cấu hình chờ
    const el = e.target.closest && e.target.closest('[data-act="doibo"], [data-act="bo"]'); if (el) { CD.lap = null; CD.cho = null; }
  }, true);

  // ---- HOME: 3 chế độ mới trong bảng GAME MODE ----
  if (typeof HM !== 'undefined') {
    const ve = () => CD.ve() + '/' + CDC.san.veNgay;
    Object.assign(HM.CHE, {
      thu: { ten: 'QUICK TRIALS', ic: CDC.ICON.thu, phu: () => 'Trial ' + CD.thuKe() + ' · 3–5 min', mo: '6 short challenges · 3–5 minutes' },
      thap: { ten: 'TOWER CLIMB', ic: CDC.ICON.thap, phu: () => 'Floor ' + CD.thapKe() + ' / ' + CDC.thap.so, mo: '100 floors · survive 5 waves' },
      san: { ten: 'BOSS HUNT', ic: CDC.ICON.san, phu: () => 'Tickets ' + ve(), mo: 'Beat a boss you know in 90 s · 3 tickets a day' },
    });
    for (const k in CDC.bo) HM.CHE[k].an = 1; // ẩn khỏi GAME MODE (như SOLO)
    const laC = (k) => (k === 'thap' || k === 'san' || k === 'thu') && !CDC.bo[k];
    const khoa = (k) => TTC.tn[k] && !TT.tnMo(k);
    const cc = HM.chonChe;
    HM.chonChe = function (k) {
      if (!laC(k)) return cc.apply(this, arguments);
      if (khoa(k)) { TTUI.toast(TT.tnChu(k)); return; }
      this.che = k; this.luu(); try { SND.nut(); } catch (e) { } this.dong(); this.ve();
      if (k === 'thap') { this.luuBo(); CDUI.mo('thap'); } // PLAY vào thẳng tầng kế → chọn TOWER CLIMB trong GAME MODE = mở bảng tầng (chơi lại tầng cũ)
    };
    const ch = HM.choi;
    HM.choi = function () {
      if (!laC(this.che)) return ch.apply(this, arguments);
      if (UI.chon.length !== 5) { if (!this.el('chon').classList.contains('xem-dk') || this.bst) this.di('dk'); UI.nhac('Pick 5 turrets'); return; }
      if (khoa(this.che)) { TTUI.toast(TT.tnChu(this.che)); return; }
      this.luuBo();
      if (this.che === 'thap' && CD.st().thap.max < CDC.thap.so) { CD.vao('thap', CD.thapKe()); return; } // 10/11: PLAY = vào thẳng tầng chưa qua thấp nhất
      CDUI.mo(this.che);
    };
    const mc = HM.moChe; // mở bảng: cuộn tới chế độ đang chọn
    HM.moChe = function () { const x = mc.apply(this, arguments); try { const o = document.querySelector('#hm-tam .hm-chec.on'); if (o) o.scrollIntoView({ block: 'nearest' }); } catch (e) { } return x; };
    const ini = UI.init;
    UI.init = async function () {
      const r = await ini.apply(this, arguments);
      try { const l = JSON.parse(localStorage.getItem(HM.KEY) || 'null'); if (l && laC(l.che) && !khoa(l.che) && !G.debug.mode) { HM.che = l.che; HM.ve(); } } catch (e) { }
      return r;
    };
  }

  // ---- SHOP → LÒ RÈN: Ấn Đỏ (sau hàng Ấn Vàng của manh.js) ----
  if (typeof MHUI !== 'undefined' && MHUI.ve_shop) {
    const vs = MHUI.ve_shop;
    MHUI.ve_shop = function () { const h = vs.apply(this, arguments); let a = ''; try { a = CDUI.anDoHang(); } catch (e) { console.error('CD', e); } return h + a; };
  }

  // ---- gộp hồ sơ Firebase ----
  const gp = KT.gop;
  KT.gop = function (o) {
    let a = null, b = null, ma = null, mb = null;
    try { a = JSON.parse(JSON.stringify(CD.st())); b = o && o.kt && o.kt.cd; ma = JSON.parse(JSON.stringify(KT.doc().mh || {})); mb = o && o.kt && o.kt.mh; } catch (e) { }
    const x = gp.apply(this, arguments);
    try { CD.gopHs(a, b, ma, mb); KT.luu(true); } catch (e) { console.error('CD', e); }
    return x;
  };

  // ---- bấm ----
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-act^="cd-"]'); if (!b || b.disabled) return;
    const a = b.dataset.act; e.stopPropagation();
    const nut = () => { try { SND.nut(); } catch (er) { } };
    if (a === 'cd-ch') { nut(); const ke = CD.thapKe(), ch = Math.max(1, Math.min(Math.ceil(ke / 10), +b.dataset.id)); CDUI.chon.chuong = ch; CDUI.chon.thap = Math.min(ke, ch * 10); CDUI.thap(); }
    else if (a === 'cd-tang') { nut(); CDUI.chon.thap = +b.dataset.id; CDUI.thap(); }
    else if (a === 'cd-x') { nut(); TTUI.dong(); }
    else if (a === 'cd-trum') { nut(); CDUI.chon.san = b.dataset.id; CDUI.chon.bac = 0; CDUI.san(); }
    else if (a === 'cd-bac') { nut(); CDUI.chon.bac = +b.dataset.id; CDUI.san(); }
    else if (a === 'cd-ve') { if (CD.veMua()) { nut(); CDUI.san(); try { KTUI.capNhat(); } catch (er) { } } }
    else if (a === 'cd-thu') { nut(); CDUI.chon.thu = +b.dataset.id; CDUI.thu(); }
    else if (a === 'cd-vao') { nut(); const k = b.dataset.k; CD.vao(k, k === 'san' ? b.dataset.id : +b.dataset.id, +b.dataset.b || 0); }
    else if (a === 'cd-kq-mo') { nut(); CDUI.moKq(); }
    else if (a === 'cd-ad') { nut(); CDUI.anDoChon(); }
    else if (a === 'cd-adc') { const ra = CD.anDo(b.dataset.id); try { KTUI.dongPhu(); KTUI.ve(); KTUI.capNhat(); } catch (er) { } if (ra) KTUI.nhan(ra, 'RED SEAL'); }
  });

  // ---- Tiếng Việt (ngonngu.js: từ điển mẫu, # = số) ----
  if (typeof VI_MAU !== 'undefined') Object.assign(VI_MAU, {
    'QUICK TRIALS': 'THỬ THÁCH NGẮN', 'TOWER CLIMB': 'LEO THÁP', 'BOSS HUNT': 'SĂN TRÙM',
    '6 short challenges · 3–5 minutes': '6 thử thách ngắn · 3–5 phút', '100 floors · survive 5 waves': '100 tầng · sống qua 5 wave',
    'Beat a boss you know in 90 s · 3 tickets a day': 'Hạ trùm đã gặp trong 90 giây · 3 vé mỗi ngày',
    'Trial #': 'Thử thách #', '3–5 min': '3–5 phút', 'Floor # / #': 'Tầng # / #', 'Tickets #/#': 'Vé #/#',
    'BEST FLOOR # / #': 'TẦNG CAO NHẤT # / #', 'CHAPTER #': 'CHƯƠNG #', 'FLOOR #': 'TẦNG #', 'BOSS: ': 'TRÙM: ',
    'WAVES': 'ĐỢT', 'START MANA': 'MANA ĐẦU', 'LIVES': 'MẠNG', 'FIRST CLEAR REWARD': 'THƯỞNG LẦN ĐẦU', 'FIRST CLEAR REWARD CLAIMED': 'ĐÃ NHẬN THƯỞNG LẦN ĐẦU',
    'FIRST WIN REWARD': 'THƯỞNG THẮNG LẦN ĐẦU', 'FIRST WIN REWARD CLAIMED': 'ĐÃ NHẬN THƯỞNG THẮNG LẦN ĐẦU',
    'CLIMB · FLOOR #': 'LEO · TẦNG #', 'CLOSE': 'ĐÓNG', 'No extra rules': 'Không luật thêm',
    'Horde': 'Bầy Đông', 'Swift': 'Thần Tốc', 'Giants': 'Khổng Lồ', 'Thick Hide': 'Da Dày', 'Sky Raid': 'Không Kích', 'Glass Core': 'Lõi Thuỷ Tinh',
    '+#% enemies, −#% HP each': '+#% quái, mỗi con −#% máu', 'Enemies +#% speed, −#% HP': 'Quái +#% tốc độ, −#% máu', 'Every 3rd enemy is a Giant': 'Cứ 3 quái có 1 Khổng Lồ',
    'Enemies +#% HP': 'Quái +#% máu', 'Half of the enemies fly': 'Một nửa số quái biết bay', 'Only # life': 'Chỉ # mạng',
    'Horde: +#% enemies, −#% HP each': 'Bầy Đông: +#% quái, mỗi con −#% máu', 'Swift: Enemies +#% speed, −#% HP': 'Thần Tốc: quái +#% tốc độ, −#% máu',
    'Giants: Every 3rd enemy is a Giant': 'Khổng Lồ: cứ 3 quái có 1 Khổng Lồ', 'Thick Hide: Enemies +#% HP': 'Da Dày: quái +#% máu',
    'Sky Raid: Half of the enemies fly': 'Không Kích: một nửa số quái biết bay', 'Glass Core: Only # life': 'Lõi Thuỷ Tinh: chỉ # mạng',
    'Enemy HP ×#.#': 'Máu quái ×#.#', 'Enemy HP ×#.#–#': 'Máu quái ×#.#–#',
    'TICKETS # / # · RESETS IN ': 'VÉ # / # · LÀM MỚI SAU ', 'TICKETS # / #': 'VÉ # / #', 'RESETS IN #:#:#': 'LÀM MỚI SAU #:#:#', 'TICKETS # / # · RESETS IN #:#:#': 'VÉ # / # · LÀM MỚI SAU #:#:#', 'BOSS OF THE WEEK': 'TRÙM CỦA TUẦN', 'TIER #': 'BẬC #', ' · TIER #': ' · BẬC #',
    'Defeat the boss within # s': 'Hạ trùm trong # giây', 'Boss HP ×#': 'Máu trùm ×#', 'ALL # BOSSES AT TIER #': 'ĐỦ # TRÙM Ở BẬC #', 'CLAIMED': 'ĐÃ NHẬN',
    '+1 TICKET': '+1 VÉ', 'HUNT · 1 TICKET': 'SĂN · 1 VÉ', 'PRACTICE': 'LUYỆN TẬP', 'Defeat a boss once to hunt it.': 'Hạ một trùm một lần để săn nó.',
    '# / # CLEARED': 'ĐÃ QUA # / #', 'WAVES #–#': 'ĐỢT #–#', 'BOSS': 'TRÙM', 'START · TRIAL #': 'CHƠI THỬ THÁCH #', 'WAVES #–# · BOSS': 'ĐỢT #–# · TRÙM',
    'First Stand': 'Trận Đầu', 'Boss Gate': 'Cổng Trùm', 'Swarm Line': 'Tuyến Bầy', 'Giant Steps': 'Bước Khổng Lồ', 'Sky Storm': 'Bão Trời',
    'FLOOR': 'TẦNG', 'TRIAL': 'THỬ THÁCH', 'TIER': 'BẬC', 'TICKETS': 'VÉ', 'PRACTICE · NO REWARD': 'LUYỆN TẬP · KHÔNG THƯỞNG',
    'FIRST CLEAR REWARDS': 'THƯỞNG LẦN ĐẦU', 'NO REWARD · ALREADY CLEARED': 'KHÔNG THƯỞNG · ĐÃ QUA', 'NO REWARD': 'KHÔNG THƯỞNG',
    'NEXT · FLOOR #': 'TIẾP · TẦNG #', 'RETRY · FLOOR #': 'CHƠI LẠI · TẦNG #', 'NEXT TRIAL': 'THỬ THÁCH TIẾP', 'RETRY TRIAL': 'CHƠI LẠI',
    'HUNT AGAIN · 1 TICKET': 'SĂN LẠI · 1 VÉ', 'PRACTICE AGAIN': 'LUYỆN TẬP LẠI', 'EDIT DECK': 'SỬA BỘ BÀI',
    'TOWER CLIMB · FLOOR #': 'LEO THÁP · TẦNG #', 'QUICK TRIALS · TRIAL #': 'THỬ THÁCH NGẮN · THỬ THÁCH #',
    'Floor # cleared': 'Đã qua tầng #', 'Trial # cleared': 'Đã qua thử thách #', 'Hunt tier # cleared': 'Đã thắng bậc #',
    'Time up — the boss survived': 'Hết giờ — trùm còn sống', 'The boss escaped': 'Trùm đã thoát',
    'FLOOR # · #/#': 'TẦNG # · #/#', 'TRIAL # · #/#': 'THỬ THÁCH # · #/#', 'TIER # · #/#': 'BẬC # · #/#', 'TIER # · PRACTICE · #/#': 'BẬC # · LUYỆN TẬP · #/#', 'BOSS TIME #s': 'GIỜ TRÙM #s',
    'BOSS HUNT · TIER #': 'SĂN TRÙM · BẬC #',  'TIER # · #s': 'BẬC # · #s', 'TIER # · PRACTICE · #s': 'BẬC # · LUYỆN TẬP · #s',
    'Unlocks after defeating # different bosses': 'Mở sau khi hạ # trùm khác nhau', '# BOSSES': '# TRÙM',
    'Red Seal': 'Ấn Đỏ', 'YOU HAVE #/#': 'ĐANG CÓ #/#', 'RED SEAL': 'ẤN ĐỎ',
    'Pick # Mythic card: +# copy. Costs # Red Crystals and #,# gold.': 'Chọn # thẻ Cổ đại: +# bản. Tốn # Tinh thể Đỏ và #.# vàng.',
    'Pick # Mythic card: +# copy. Costs # Red Crystals and # gold.': 'Chọn # thẻ Cổ đại: +# bản. Tốn # Tinh thể Đỏ và # vàng.',
    'ALL BOSSES · TIER #': 'ĐỦ TRÙM · BẬC #', 'BOSS OF THE WEEK · TIER #': 'TRÙM CỦA TUẦN · BẬC #', 'Red Crystal': 'Tinh thể Đỏ',
    // 10/11 bỏ Solo — Leo Tháp là chế độ một mình chính (nhiệm vụ / điều kiện Đỏ / mốc / hồ sơ theo TẦNG)
    'Clear floor #': 'Qua tầng #', 'Defeat the floor # boss': 'Hạ trùm tầng #', 'Clear floor # or higher': 'Qua tầng # trở lên', 'Clear Tower floor #': 'Qua tầng # Leo Tháp',
    'Play # battles within # floors of your best': 'Chơi # trận cách tầng cao nhất không quá # tầng', 'Have a #★ turret': 'Có một ụ #★', 'Defeat # bosses': 'Hạ # trùm',
    'Pilot Level # and Tower floor #': 'Cấp phi công # và tầng # Leo Tháp', 'Unlocks at Pilot Level # and Tower floor #': 'Mở ở cấp phi công # và tầng # Leo Tháp',
    'Tower: floor #': 'Leo Tháp: tầng #', 'BEST FLOOR #': 'TẦNG CAO NHẤT #', 'BEST FLOOR': 'TẦNG CAO NHẤT', 'OLD BEST WAVE #': 'KỶ LỤC ĐỢT CŨ #',
    'TOWER FLOOR #': 'LEO THÁP TẦNG #', 'TOWER FLOOR #/#': 'LEO THÁP TẦNG #/#', 'TOWER FLOOR #/#/#': 'LEO THÁP TẦNG #/#/#',
    'Locked · clear Tower floor # or unlock with gems': 'Đang khoá · qua tầng # Leo Tháp hoặc mở bằng ngọc', 'Floor # or # gems': 'Tầng # hoặc # ngọc',
    'XP: WAVES + # PER BOSS + WIN BONUS': 'XP: ĐỢT + # MỖI TRÙM + THƯỞNG THẮNG',
    'OPEN ×#': 'MỞ ×#', 'TOWER · PVP': 'LEO THÁP · PVP', 'TOWER · CO-OP': 'LEO THÁP · CO-OP', 'TOWER': 'LEO THÁP', 'PILOT XP +# · LEVEL #!': 'XP PHI CÔNG +# · CẤP #!',
    'Tower floors #–#': 'Leo Tháp tầng #–#', 'Tower floors #, #, #': 'Leo Tháp tầng #, #, #',
    'Battle rewards · Gold Chest · Daily Specials · Tower floors #–# · first boss kills · daily quest · Shard Forge · Legendary Seal': 'Thưởng trận · Rương Vàng · Ưu đãi hôm nay · Leo Tháp tầng #–# · hạ trùm lần đầu · nhiệm vụ ngày · Lò rèn · Ấn Vàng',
    'Mythic / Gold Chest · Daily Specials (~# day a week) · Tower floors #, #, # · defeat all bosses · event #,# pts · Shard Forge': 'Rương Thần thoại / Vàng · Ưu đãi hôm nay (~# ngày/tuần) · Leo Tháp tầng #, #, # · hạ đủ trùm · sự kiện #.# điểm · Lò rèn',
    'Mythic / Gold Chest · Daily Specials (~# day a week) · Tower floors #, #, # · defeat all bosses · event # pts · Shard Forge': 'Rương Thần thoại / Vàng · Ưu đãi hôm nay (~# ngày/tuần) · Leo Tháp tầng #, #, # · hạ đủ trùm · sự kiện # điểm · Lò rèn',
  });
})();
