// TURRET MERGE — ĐỒNG BỘ TRẬN CO-OP ONLINE ("lockstep-lite").
//  · Cả 2 máy chạy CÙNG mô phỏng: wave sinh bằng RNG hạt giống chung (meta.seed); chủ phòng (host) quyết định lúc bắt đầu mỗi wave.
//  · Mỗi người chỉ điều khiển bàn của mình (G.ban[0]). Bàn đồng đội (G.ban[1], cờ B.net) là "con rối": dựng lại từ HÀNH ĐỘNG
//    của bạn kia (triệu hồi / ghép / nâng cấp / chỉ huy / kỹ năng chủ động, kèm tick) + ẢNH CHỤP bàn mỗi 1 s (mã băm; lệch → sửa).
//  · 3 tim CHUNG: host giữ (authoritative). Quái lọt làn của khách → khách báo 'l' → host trừ tim → ghi state.tim cho cả 2.
//    Quái lọt làn đồng đội trong máy MÌNH không tính (máy bạn kia mới là gốc của làn đó).
//  · Bạn kia mất kết nối / rời trận: KHÔNG BAO GIỜ dừng hay chặn trận của mình (không bảng che). Im lặng ≥ 12 s (ân hạn cho
//    khoá màn / chuyển tab / mạng chập chờn) → bàn bạn kia tự giao cho AI + nhãn nhỏ "Partner left — AI playing" 3 s + chữ AI
//    trên nhãn bàn đồng đội. Bạn quay lại (nhịp tim mới) → trả bàn lại cho bạn ấy. Bạn bấm rời (bye) → AI ngay, không trả lại.
//    Kết thúc trận: chỉ ở menu tạm dừng (QUIT).
//    Tải lại trang giữa trận → bảng ONLINE có nút REJOIN MATCH (khôi phục bàn từ ảnh chụp, tim + wave từ state).
//  · Tốc độ khoá 1× khi chơi online; nút tạm dừng = tạm dừng CHUNG.
// Chỉ BỌC hàm có sẵn (trieu/ghep/nangCap/dungMV/wavMoi/lot/ketThuc/aiBan + chuDong của SKILLS) — chơi offline không đổi gì.
'use strict';

const ONS = {
  on: false, o: null, host: false, seed: 1, ban: null, me: null, code: null,
  hostWave: 0, banVao: false, toiVao: false, rx: 0, dungChung: false, mat: null, ping: 0, lech: 0, soAct: 0, _apDung: 0, _tuHost: false,
  thay: null, _dungBan: false, AN_HAN: 12000, // thay = { t, vinh }: bàn đồng đội đang do AI lái (vinh = bạn đã bấm rời → không trả lại)
  _off: [], _tm: [], _pingT: 0, _pingThay: 0,
  goc() { return 'rooms/' + this.code + '/'; },
  gui(k, d) {
    if (!this.on) return;
    const v = { u: this.me, k, tk: Math.round(G.t * 60) }; if (d !== undefined) v.d = JSON.stringify(d);
    NET.set(this.goc() + 'act/' + NET.khoa(), v).catch((e) => console.warn('[ONS] gửi', k, e && (e.code || e.message)));
  },

  // ---------------------------------------------------------------- vào trận
  batDau(o) {
    this.o = o; this.code = o.code; this.host = o.host; this.seed = o.seed || 1; this.me = o.me; this.ban = o.ban;
    this.hostWave = 0; this.banVao = false; this.toiVao = false; this.rx = Date.now(); this.dungChung = false; this.mat = null; this.lech = 0; this.soAct = 0; this._tuHost = false; this._end = null; this.t0 = Date.now();
    this.thay = null; this._dungBan = false; this._sAnh = null; this._tPing = null;
    G.tocDo = 1;
    UI.che = 'coop';
    this.on = true;
    const hop = (d) => { d = (d || []).filter(id => SKILLS[id] && G.rosterMap[id]); return d.length === 5 ? d : (UI.chon.length === 5 ? UI.chon.slice() : deckNgauNhien()); };
    G.debug.deck2 = hop(o.deckBan);
    batDau('coop', hop(o.deckMe), MAVUONG[o.mvMe] ? o.mvMe : 'hero');
    delete G.debug.deck2;
    const B1 = G.ban[1];
    B1.net = true; B1.ten = escTen(o.tenBan) || 'ALLY';
    const mvB = MAVUONG[o.mvBan] ? o.mvBan : 'hero'; B1.mv = { id: mvB, gia: MAVUONG[mvB].gia, cd: 0 };
    const goc = this.goc();
    NET.update(goc + 'pl/' + this.me, { on: true, vao: false });
    // hành động của bạn kia: chỉ nhận từ mốc k0 của trận (vào lại giữa trận: từ bây giờ, bàn khôi phục từ ảnh chụp)
    this._off.push(NET.nghe(goc + 'act', 'child_added', (v) => this.nhan(v), { sau: o.laiVao ? NET.khoa() : (o.k0 || null) }));
    this._off.push(NET.nghe(goc + 'snap/' + this.ban, 'value', (v) => this.nhanAnh(v)));
    this._off.push(NET.nghe(goc + 'ping/' + this.ban, 'value', (v) => this.nhanPing(v)));
    this._off.push(NET.nghe(goc + 'pl/' + this.ban + '/on', 'value', (v) => { if (v === false) this.matBan('off'); }));
    this._tm.push(setInterval(() => this.chupAnh(), 1000));
    this._tm.push(setInterval(() => this.guiPing(), 2000));
    if (o.laiVao) this.khoiPhuc();
    this.veHUD();
    if (!this._vis) { // quay lại từ khoá màn / tab ẩn: tính lại ân hạn từ bây giờ (không coi bạn kia là đã rời chỉ vì MÌNH vừa ngủ)
      this._vis = () => { if (!document.hidden && this.on) this.rx = Math.max(this.rx, Date.now() - 2000); };
      document.addEventListener('visibilitychange', this._vis); addEventListener('pageshow', this._vis);
    }
    if (!this._raf) { const f = () => { this.canh(); this._raf = requestAnimationFrame(f); }; this._raf = requestAnimationFrame(f); }
  },
  // vào lại giữa trận: đặt wave / tim / bàn từ dữ liệu trên máy chủ
  khoiPhuc() {
    const goc = this.goc();
    Promise.all([NET.get(goc + 'state'), NET.get(goc + 'snap/' + this.me), NET.get(goc + 'snap/' + this.ban)]).then(([st, a, b]) => {
      // bạn kia có thể đã tự chạy wave khi mình vắng (AI lái bàn mình) → lấy wave lớn hơn giữa state và ảnh chụp của bạn
      let wb = 0; try { wb = b ? (JSON.parse(b).w || 0) : 0; } catch (e) { }
      if (st || wb) { const w = Math.max(st && st.wave || 0, wb); this.hostWave = w; G.wave = Math.max(0, (w || 1) - 1); if (st && st.tim != null) G.ban[0].tim = st.tim; }
      if (a) this.apAnh(G.ban[0], JSON.parse(a), true);
      if (b) this.apAnh(G.ban[1], JSON.parse(b), true);
      if (!this.host) this.hostWave = Math.max(this.hostWave, G.wave + 1); // wave hiện tại của host chạy lại ngay ở máy mình
      this.banVao = true;
    }).catch(() => { });
  },
  // rời / hết trận online (ly: 'leave' | 'ai' | 'end')
  ketThucMang(ly) {
    if (!this.on) return;
    if (ly === 'leave' || ly === 'ai') this.gui('bye');
    this.on = false;
    for (const f of this._off.splice(0)) try { f(); } catch (e) { }
    for (const t of this._tm.splice(0)) clearInterval(t);
    this.mat = null; this.dungChung = false; this._dungBan = false; this.anMat();
  },

  // ---------------------------------------------------------------- vòng canh (mỗi khung hình)
  canh() {
    if (!this.on) return;
    if (!G.ban.length) { this.ketThucMang('leave'); return; }
    const dangTai = (typeof TAI !== 'undefined' && TAI.cho) || (typeof VT !== 'undefined' && VT.mo);
    if (!dangTai && !this.toiVao) { this.toiVao = true; NET.update(this.goc() + 'pl/' + this.me, { vao: true }); this.gui('vao'); }
    const now = Date.now(), im = now - this.rx;
    // bạn kia bấm tạm dừng rồi mất tích → bỏ tạm dừng (trận của mình không bao giờ bị kẹt vì bạn kia)
    if (this.dungChung && this._dungBan && (im > 4000 || this.thay)) { this.dungChung = false; this._dungBan = false; this.hienDung(false); }
    // không được tự dừng riêng một máy (bảng thông tin, …) — chỉ dừng khi: tạm dừng chung / màn mở đầu / màn tải. Mất kết nối KHÔNG dừng.
    const phaiDung = this.dungChung;
    if (!dangTai && !G.ketThuc) {
      if (phaiDung && !G.dung) G.dung = true;
      else if (!phaiDung && G.dung) G.dung = false;
    }
    G.tocDo = 1;
    if (!G.ketThuc && this.toiVao) {
      // nhãn trạng thái (không chặn): mình mất mạng / bạn im lặng > 4 s
      this.mat = !NET.noi ? { ly: 'toi' } : im > 4000 && !this.thay ? { ly: 'im' } : null;
      if (!this.thay && im > this.AN_HAN && (this.banVao || now - this.t0 > 25000)) this.thayAI(false);
      else if (this.thay && !this.thay.vinh && NET.noi && im < 2500 && now - this.thay.t > 3000) this.traBan();
    }
    this.veHUD();
  },

  // ---------------------------------------------------------------- nhận
  nhan(v) {
    if (!v || v.u === this.me) return;
    this.rx = Date.now(); this.soAct++;
    let d = null; try { d = v.d ? JSON.parse(v.d) : null; } catch (e) { d = null; }
    const B1 = G.ban[1]; if (!B1 || !this.on) return;
    if (this.thay && v.k !== 'bye') { if (this.thay.vinh) return; this.traBan(); } // bạn quay lại (hành động mới) → trả bàn
    this._apDung++;
    try {
      switch (v.k) {
        case 'tr': this.apTrieu(B1, d); break;
        case 'gh': this.apGhep(B1, d); break;
        case 'nc': if (d && B1.lv[d.id] != null) { B1.lv[d.id] = d.lv; for (const T of B1.t) if (T && T.id === d.id) T.lvSang = 1; } break;
        case 'mv': { const mv = B1.mv; mv.cd = 0; B1.mana = Math.max(B1.mana, mv.gia); CH_HOP(B1); if (d && d.m != null) B1.mana = d.m; break; }
        case 'cd': { const T = d && B1.t[d.o]; const sk = T && SKILLS[T.id]; if (sk && sk.chuDong) { T.nap = 1; T.st.bang = 0; T.st.da = false; this._cd = 1; try { sk.chuDong(G, B1, T); } finally { this._cd = 0; } } break; }
        case 'w': if (!this.host && d) { this.hostWave = Math.max(this.hostWave, d.n); if (G.wave < d.n) { G.cho = 0; wavMoi(); } } break;
        case 'l': if (this.host && d) this.truTim(d.n, d.id); break;
        case 'vao': this.banVao = true; break;
        case 'pa': this.dungChung = !!(d && d.v); this._dungBan = this.dungChung; this.hienDung(this.dungChung); break;
        case 'bye': this.thayAI(true); break;
      }
    } catch (e) { console.error('[ONS] áp hành động', v.k, e); }
    this._apDung--;
  },
  apTrieu(B1, d) {
    if (!d || d.o == null || !G.rosterMap[d.id]) return;
    if (!d.f) B1.gia += LUAT.giaTrieuTang;
    if (B1.t[d.o]) { const T = B1.t[d.o]; if (T.id === d.id && T.sao === d.s) return; }
    const T = taoU(B1, d.id, d.s || 1, d.o); B1.t[d.o] = T;
    VX.trieu(T);
  },
  apGhep(B1, d) {
    if (!d) return;
    const a = B1.t[d.a], b = B1.t[d.b];
    if (a && b && a !== b) {
      const deck = B1.deck; B1.deck = [d.id]; // ụ ra = đúng ụ bạn kia nhận được (pick trong bộ 1 phần tử)
      try { ghep(B1, a, b, true); } finally { B1.deck = deck; }
    }
    const T = B1.t[d.b];
    if (!T || T.id !== d.id || T.sao !== d.s) { if (G.rosterMap[d.id]) B1.t[d.b] = taoU(B1, d.id, d.s, d.b); }
    if (B1.t[d.a] && d.a !== d.b && !d.giuA) B1.t[d.a] = null;
  },
  // ---------------------------------------------------------------- ảnh chụp bàn (mỗi 1 s) + mã băm
  oCua(B) { return B.t.map(T => T ? T.id + ':' + T.sao : ''); },
  bam(c) { let h = 2166136261; const s = c.join('|'); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); },
  chupAnh() {
    if (!this.on || !G.ban.length) return;
    const B = G.ban[0], c = this.oCua(B);
    const v = { w: G.wave, tk: Math.round(G.t * 60), c, h: this.bam(c), lv: B.lv, m: Math.round(B.mana), g: B.gia, mv: [B.mv.gia, Math.round(B.mv.cd * 10) / 10] };
    NET.set(this.goc() + 'snap/' + this.me, JSON.stringify(v)).catch(() => { });
  },
  nhanAnh(s) {
    if (!s || !this.on) return;
    if (s === this._sAnh) return; // cùng ảnh cũ (nghe lại sau khi nối mạng) ≠ bạn còn sống
    this._sAnh = s; this.rx = Date.now();
    if (this.thay) return; // AI đang lái bàn này: chờ nhịp tim mới (canh → traBan) rồi mới nhận ảnh
    let v; try { v = JSON.parse(s); } catch (e) { return; }
    this._anh = v;
    const B1 = G.ban[1]; if (!B1) return;
    // host vừa quay lại (khoá màn / mất mạng) mà khách đã tự chạy wave xa hơn → nhảy tới wave của khách (không chờ, không dồn quái)
    if (this.host && v.w > G.wave + 1 && !G.ketThuc) { G.wave = v.w - 1; G.cho = 0; }
    this.apAnh(B1, v, false);
  },
  apAnh(B, v, khoiPhuc) {
    if (!v || !Array.isArray(v.c)) return;
    const c = this.oCua(B);
    if (this.bam(c) !== v.h || khoiPhuc) {
      let sua = 0;
      for (let i = 0; i < 15; i++) {
        if (c[i] === v.c[i]) continue;
        if (B.t[i] && B.t[i].anim) continue; // đang chạy hoạt ảnh ghép/triệu hồi: chờ ảnh chụp sau
        const [id, sao] = (v.c[i] || '').split(':');
        B.t[i] = id && G.rosterMap[id] ? taoU(B, id, +sao || 1, i) : null; sua++;
      }
      if (sua && !khoiPhuc) this.lech++;
    }
    if (v.lv) for (const k in v.lv) if (B.lv[k] != null) B.lv[k] = v.lv[k];
    if (v.m != null) B.mana = v.m;
    if (v.g != null) B.gia = v.g;
    if (Array.isArray(v.mv)) { B.mv.gia = v.mv[0]; B.mv.cd = v.mv[1]; }
  },

  // ---------------------------------------------------------------- tim chung (host giữ)
  khiState(v) {
    if (!this.on || !v) return;
    if (!this.host && v.tim != null && G.ban[0]) G.ban[0].tim = v.tim;
    if (!this.host && v.end && !G.ketThuc) { this._tuHost = true; ketThuc(!!v.end.thang, v.end.ly || TEXT.end.coopOut); this._tuHost = false; }
  },
  truTim(n, id) {
    const B = G.ban[0]; if (!B || G.ketThuc) return;
    B.tim = Math.max(0, B.tim - (n || 1));
    FX.chu1(W - 60, (G.duong[0].pts[2] || [0, 300])[1] - 26, '−' + (n || 1) + ' LIFE', '#ff4b3e', 20, 'to'); FX.sang(0.3, '#ff2030');
    this.ghiState();
    if (B.tim <= 0) ketThuc(false, TEXT.end.coopOut);
  },
  ghiState(end) {
    if (!this.host || !this.on) return;
    if (end) this._end = end;
    const v = { tim: G.ban[0].tim, wave: G.wave }; if (this._end) v.end = this._end;
    NET.set(this.goc() + 'state', v).catch(() => { });
  },

  // ---------------------------------------------------------------- ping
  guiPing() { if (!this.on) return; this._pingT = Date.now(); NET.set(this.goc() + 'ping/' + this.me, { t: this._pingT, e: this._pingThay || 0 }).catch(() => { }); },
  nhanPing(v) {
    if (!v || !this.on) return;
    const k = v.t + ':' + v.e; if (k === this._tPing) return; // giá trị cũ gửi lại khi nối mạng ≠ nhịp tim mới
    this._tPing = k; this.rx = Date.now();
    if (v.e && v.e === this._pingT) this.ping = Date.now() - this._pingT; // vòng đi-về
    if (v.t && v.t !== this._pingThay) { this._pingThay = v.t; NET.set(this.goc() + 'ping/' + this.me, { t: this._pingT || 0, e: v.t }).catch(() => { }); }
  },

  // ---------------------------------------------------------------- bạn kia mất kết nối / rời trận (không bao giờ chặn trận của mình)
  matBan(ly) { if (ly === 'bye') this.thayAI(true); }, // giữ tên cũ (gọi từ phong.js / bài kiểm)
  // bàn đồng đội → AI lái; mình tự giữ wave + tim (khách thôi chờ host). vinh = bạn đã rời hẳn.
  thayAI(vinh) {
    if (!this.on || G.ketThuc) return;
    const B1 = G.ban[1]; if (!B1) return;
    if (this.thay) { if (vinh) this.thay.vinh = true; return; }
    this.thay = { t: Date.now(), vinh: !!vinh };
    B1.net = false; B1.ai = true; B1.aiT = 0; B1.aiThay = true;
    if (!this.host) this.hostWave = Math.max(this.hostWave, G.wave);
    if (this.dungChung && this._dungBan) { this.dungChung = false; this._dungBan = false; this.hienDung(false); G.dung = false; }
    this.mat = null; this.anMat();
    this.bao(B1, 'PARTNER LEFT — AI PLAYING', '#ffd25a');
    console.log('[ONS] bàn đồng đội → AI (' + (vinh ? 'rời trận' : 'im lặng ' + Math.round((Date.now() - this.rx) / 1000) + ' s') + ')');
  },
  // bạn quay lại trong trận → trả bàn (ảnh chụp kế tiếp của bạn ấy sửa lại bàn)
  traBan() {
    const B1 = G.ban[1]; if (!this.thay || this.thay.vinh || !B1) return;
    this.thay = null; B1.net = true; B1.ai = false; B1.aiThay = false; this._sAnh = null;
    this.bao(B1, 'PARTNER IS BACK', '#63d68b');
    console.log('[ONS] bạn quay lại → trả bàn');
  },
  // nhãn nhỏ trên bàn đồng đội ~3 s (chữ trên tấm nhãn có sẵn nhan_kn) — không chặn, không chạm
  bao(B, s, mau) { if (typeof FX === 'undefined' || !B) return; const c = FX.chu1(B.x + B.w / 2, B.y + 34, s, mau, 13, 'nhan'); if (c) c.song = 3; },
  // phòng bị xoá giữa trận (chủ phòng rời): AI giữ bàn đồng đội, mình chơi tiếp NGOẠI TUYẾN (tạm dừng do bạn bấm thì bỏ)
  diNgoai() {
    this.thayAI(true);
    const giuDung = this.dungChung && !this._dungBan;
    this.ketThucMang('end');
    if (!giuDung) { this.hienDung(false); G.dung = false; }
  },
  veMat() { }, // bảng che cũ (PARTNER LEFT / CONTINUE WITH AI) đã bỏ
  anMat() { const el = document.getElementById('onl-mat'); if (el) el.remove(); },
  choiVoiAI() { this.thayAI(true); },

  // ---------------------------------------------------------------- tạm dừng chung + HUD
  hienDung(v) { const d = document.getElementById('dung'); if (d) d.hidden = !v; if (typeof UI !== 'undefined' && v) UI.huyKeo(); },
  // tên đồng đội + độ trễ hiện ngay trên nhãn bàn đồng đội (tấm tên thép có sẵn, render.js veNhanBan) — không thêm khung mới
  veHUD() {
    const B1 = G.ban[1];
    if (!this.on || !B1 || !this.o) return;
    B1.ten = (escTen(this.o.tenBan) || 'ALLY') + (this.thay ? ' · AI' : this.mat ? ' · OFFLINE' : this.ping ? ' · ' + this.ping + ' ms' : '');
  },


  // bấm nút (pha bắt sự kiện sớm — chặn hành vi offline khi đang online)
  bamTruoc(e) {
    const el = e.target.closest && e.target.closest('[data-act]'); if (!el) return;
    const a = el.dataset.act;
    if (a === 'ons-ai') { e.stopImmediatePropagation(); SND.nut(); this.choiVoiAI(); return; }
    if (a === 'ons-het') { e.stopImmediatePropagation(); SND.nut(); this.ketThucMang('leave'); if (typeof ONL !== 'undefined') ONL.roiPhong(); this.anMat(); G.dung = false; ketThuc(false, 'Online match ended'); return; }
    // sau trận online (phòng đã xoá): PLAY ONLINE AGAIN → menu + bảng ONLINE; EDIT DECK → menu
    if (!this.on && typeof ONL !== 'undefined' && ONL.vuaChoi && (a === 'choilai' || a === 'doibo') && G.ketThuc) {
      e.stopImmediatePropagation(); ONL.vuaChoi = false; if (ONL.code) ONL.roiPhong();
      G.ban = []; G.quai = []; G.dung = false; SND.nhac(0);
      for (const id of ['ketqua', 'top', 'duoi', 'dung']) { const x = document.getElementById(id); if (x) x.hidden = true; }
      document.getElementById('chon').hidden = false; UI.veChon();
      if (a === 'choilai') ONL.moBang();
      return;
    }
    if (!this.on && !(typeof ONL !== 'undefined' && ONL.code && a === 'choilai' && ONL.dangTran)) {
      if (typeof ONL !== 'undefined' && ONL.code && ONL.dangTran && (a === 'doibo' || a === 'bo')) { ONL.roiPhong(); ONL.dangTran = false; }
      return;
    }
    if (a === 'tocdo') { e.stopImmediatePropagation(); G.tocDo = 1; el.textContent = '1×'; return; }
    if (a === 'dung') { e.stopImmediatePropagation(); UI.huyKeo(); this.dungChung = true; this.hienDung(true); this.gui('pa', { v: 1 }); return; }
    if (a === 'tiep') { e.stopImmediatePropagation(); this.dungChung = false; this.hienDung(false); this.gui('pa', { v: 0 }); return; }
    if (a === 'bo') { this.ketThucMang('leave'); if (typeof ONL !== 'undefined') ONL.roiPhong(); return; } // để ui.js đưa về menu
    if (a === 'choilai' && typeof ONL !== 'undefined' && ONL.code) {
      e.stopImmediatePropagation();
      this.ketThucMang('end');
      G.ban = []; G.quai = []; G.dung = false; SND.nhac(0);
      for (const id of ['ketqua', 'top', 'duoi', 'dung']) { const x = document.getElementById(id); if (x) x.hidden = true; }
      document.getElementById('chon').hidden = false; UI.veChon();
      ONL.veSanhSauTran();
      return;
    }
    if (a === 'doibo') { this.ketThucMang('end'); if (typeof ONL !== 'undefined') ONL.roiPhong(); }
  },

  // ---------------------------------------------------------------- bọc hàm luật chơi
  boc() {
    const self = this;
    const g = (ten, f) => { const goc = window[ten]; if (typeof goc !== 'function') return; window[ten] = f(goc); };
    // AI không lái bàn con rối
    g('aiBan', (goc) => function (B, dt) { if (B && B.net) return; return goc.apply(this, arguments); });
    g('trieu', (goc) => function (B, mienPhi, idEp) {
      if (self.on && B && B.net) return null; // bàn con rối chỉ nhận ụ từ hành động 'tr' của bạn kia (kể cả ụ do chỉ huy / kỹ năng gọi)
      const T = goc.apply(this, arguments);
      if (self.on && T && B === G.ban[0]) self.gui('tr', { o: T.o, id: T.id, s: T.sao, f: mienPhi ? 1 : 0 });
      return T;
    });
    g('ghep', (goc) => function (B, a, b, ep) {
      const ao = a && a.o, bo = b && b.o, laToi = self.on && b && b.ban === 0 && !self._apDung;
      const r = goc.apply(this, arguments);
      if (laToi && r) { const T = G.ban[0].t[bo] || r; self.gui('gh', { a: ao, b: bo, id: T.id, s: T.sao, giuA: G.ban[0].t[ao] ? 1 : 0 }); }
      return r;
    });
    g('nangCap', (goc) => function (B, id) {
      const r = goc.apply(this, arguments);
      if (self.on && r && B === G.ban[0]) self.gui('nc', { id, lv: B.lv[id] });
      return r;
    });
    g('dungMV', (goc) => {
      window.CH_HOP = (B) => goc(B); // áp chỉ huy cho bàn con rối (không gửi lại)
      return function (B) {
        const r = goc.apply(this, arguments);
        if (self.on && r && B === G.ban[0]) self.gui('mv', { m: Math.round(B.mana) });
        return r;
      };
    });
    // wave: hạt giống chung; khách chờ host; khách đổi làn (làn 0 luôn là của mình)
    g('wavMoi', (goc) => function () {
      if (!self.on) return goc.apply(this, arguments);
      if (!self.host && !self.thay && self.hostWave <= G.wave) { G.cho = 0.1; return; } // host vắng (AI lái bàn host) → khách tự chạy wave
      if (self.host && G.wave === 0 && !self.banVao && Date.now() - self.t0 < 25000) { G.cho = 0.1; return; }
      const r0 = Math.random, h0 = G.hang.length;
      Math.random = rngHat((self.seed || 1) * 1009 + (G.wave + 1) * 7919);
      let r; try { r = goc.apply(this, arguments); } finally { Math.random = r0; }
      if (!self.host) for (let i = h0; i < G.hang.length; i++) G.hang[i].p = 1 - G.hang[i].p;
      if (self.host) { self.gui('w', { n: G.wave }); self.ghiState(); }
      return r;
    });
    g('lot', (goc) => function (E) {
      if (!self.on) return goc.apply(this, arguments);
      const p = G.duong[E.p];
      if ((!p || p.ban !== 0) && !self.thay) { E.chet = true; E.tChet = 1; return; } // làn đồng đội: máy bạn kia tính (AI lái thì máy mình tính)
      if (self.host) { const r = goc.apply(this, arguments); self.ghiState(); return r; }
      const n = E.tim || 1, r = goc.apply(this, arguments); // khách: trừ tạm ở máy mình (host sẽ ghi số đúng)
      if (p && p.ban === 0) self.gui('l', { n, id: E.trum || E.id });
      return r;
    });
    g('ketThuc', (goc) => function (thang, ly) {
      if (self.on && !self.host && !self._tuHost && !self.thay) return; // khách: chỉ host kết thúc trận (host vắng → mình tự kết thúc)
      const daXong = !!G.ketThuc;
      const r = goc.apply(this, arguments);
      if (!daXong && G.ketThuc) {
        if (self.on && self.host) { self.ghiState({ thang: !!thang, ly: ly || '' }); }
        if (self.on) {
          if (typeof ONL !== 'undefined') ONL.xoaSauTran(); // chủ phòng xoá phòng sau 5 s
          setTimeout(() => self.ketThucMang('end'), 1500);
          setTimeout(() => { // màn kết quả online: chơi lại = mở bảng ONLINE (tạo / vào phòng mới), đổi bộ = về menu
            const l = document.querySelector('#ketqua [data-act="choilai"]'), d = document.querySelector('#ketqua [data-act="doibo"]');
            if (l) l.textContent = 'PLAY ONLINE AGAIN'; if (d) d.textContent = 'EDIT DECK';
          }, 1200);
        }
        if (typeof TK !== 'undefined') TK.ghiTran(!!thang, G.wave);
      }
      return r;
    });
    // kỹ năng chủ động (ụ ĐỎ)
    for (const id in SKILLS) {
      const sk = SKILLS[id]; if (!sk || typeof sk.chuDong !== 'function' || sk._onl) continue;
      const goc = sk.chuDong; sk._onl = true;
      sk.chuDong = function (Gx, B, T) {
        const r = goc.apply(this, arguments);
        if (self.on && B === G.ban[0] && !self._cd && T) self.gui('cd', { o: T.o });
        return r;
      };
    }
  },
  // bài kiểm: tóm tắt trạng thái
  tom() {
    const B0 = G.ban[0], B1 = G.ban[1];
    return { on: this.on, host: this.host, wave: G.wave, hostWave: this.hostWave, tim: B0 && B0.tim, dung: G.dung, mat: this.mat && this.mat.ly, ping: this.ping,
      lech: this.lech, soAct: this.soAct, toi: B0 && this.oCua(B0), ban: B1 && this.oCua(B1), anhBan: this._anh && this._anh.c, ketThuc: G.ketThuc, thay: this.thay && (this.thay.vinh ? 'bye' : 'im'), ai: !!(B1 && B1.ai && !B1.net), im: Date.now() - this.rx };
  },
};
