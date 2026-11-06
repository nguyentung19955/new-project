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
//  · CHẠY NỀN / VÀO LẠI (điện thoại ngưng JS khi ẩn app → bàn của người vắng KHÔNG thể tự chạy trên máy họ):
//    – Người ẩn app gửi 'an' (vắng) + ngừng ảnh chụp/ping. Máy CÒN LẠI chờ 6 s ('an') / 12 s (im lặng) rồi cho AI lái bàn người vắng
//      NGAY TRÊN MÁY MÌNH; máy còn lại nắm quyền trận (tự chạy wave, tính 3 tim chung, tự kết thúc trận) dù không phải host.
//      Ảnh chụp của máy còn lại kèm: ai=1, b2 = bàn người vắng do AI xây, ht = tim chung, e = kết quả (nếu trận đã xong).
//    – Người vắng quay lại (hiện tab / pageshow / có mạng lại / mở lại game → tự REJOIN): dải nhỏ "Reconnecting…" (không chặn),
//      đọc state + ảnh chụp bạn → đặt wave, tim, CẢ 2 bàn (gồm phần AI đã xây) → gửi 'lai' → bạn trả bàn ("PARTNER IS BACK").
//      Trận đã xong khi vắng → hiện màn kết quả. Phòng đã mất (host thoát) → chơi tiếp ngoại tuyến với AI.
//    – Luật database hiện có chỉ cho host ghi state/meta → không đổi meta.host; "quyền host" chuyển tạm sang máy còn lại
//      bằng cờ thay (wave/tim/kết thúc chạy ở máy đó, gửi qua ảnh chụp của chính mình).
//  · Tốc độ khoá 1× khi chơi online; nút tạm dừng = tạm dừng CHUNG.
// Chỉ BỌC hàm có sẵn (trieu/ghep/nangCap/dungMV/wavMoi/lot/ketThuc/aiBan + chuDong của SKILLS) — chơi offline không đổi gì.
'use strict';

const ONS = {
  on: false, o: null, host: false, seed: 1, ban: null, me: null, code: null,
  hostWave: 0, banVao: false, toiVao: false, rx: 0, dungChung: false, mat: null, ping: 0, lech: 0, soAct: 0, _apDung: 0, _tuHost: false,
  thay: null, _dungBan: false, AN_HAN: 12000, AN_AN: 6000, _banAn: 0, _an: 0, _offT: 0, _choDB: false, _dangDB: false, _dbXong: 0, _endMe: null, // thay = { t, vinh }: bàn đồng đội đang do AI lái (vinh = bạn đã bấm rời → không trả lại)
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
    this._banAn = 0; this._an = 0; this._offT = 0; this._canhT = 0; this._choDB = !!o.laiVao; this._dangDB = false; this._dbXong = 0; this._endMe = null;
    if (typeof ONL !== 'undefined') ONL._giuPhong = false;
    G.tocDo = 1;
    UI.che = 'coop';
    this.on = true;
    const hop = (d) => { d = (d || []).filter(id => SKILLS[id] && G.rosterMap[id]); return d.length === 5 ? d : (UI.chon.length === 5 ? UI.chon.slice() : deckNgauNhien()); };
    G.debug.deck2 = hop(o.deckBan);
    G.debug.cap2 = typeof THEBAI !== 'undefined' ? THEBAI.giaiMa(o.deckBan, G.debug.deck2) : null; // cấp thẻ của bạn (không có = bản cũ → cấp đầu)
    if (!G.debug.cap2) G.debug.cap2 = {};
    G.debug.cap0 = typeof THEBAI !== 'undefined' ? THEBAI.giaiMa(o.deckMe, hop(o.deckMe)) : null;
    batDau('coop', hop(o.deckMe), MAVUONG[o.mvMe] ? o.mvMe : 'hero');
    delete G.debug.deck2; delete G.debug.cap2; delete G.debug.cap0;
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
    if (!this._vis) { // ẩn app → báo 'an'; quay lại → tính lại ân hạn từ bây giờ + tự đồng bộ lại (canh → dongBoLai)
      this._vis = (e) => this.khiHien(e);
      document.addEventListener('visibilitychange', this._vis); addEventListener('pageshow', this._vis); addEventListener('pagehide', this._vis);
    }
    if (!this._raf) { this._raf = true; UI.moiKhung.push(() => { if (this.on) this.canh(); }); } // canh trong vòng rAF chung của UI
  },
  // vào lại giữa trận (tải lại trang / REJOIN): đặt wave / tim / bàn từ dữ liệu trên máy chủ
  khoiPhuc() { this.dongBoLai(true); },
  // ẩn / hiện app (visibilitychange, pagehide, pageshow)
  khiHien(e) {
    if (!this.on) return;
    const an = document.hidden || (e && e.type === 'pagehide');
    if (an) { if (!this._an) { this._an = Date.now(); if (!this._offT) this._offT = this._an; this.gui('an'); } return; }
    if (this._an) { this._an = 0; this.rx = Math.max(this.rx, Date.now() - 2000); } // canh() thấy _offT → dongBoLai
  },
  // ĐỒNG BỘ LẠI sau khi vắng (vaoLai = vừa mở lại trang). Bạn đã cho AI lái bàn mình → lấy toàn bộ trạng thái chung từ bạn.
  dongBoLai(vaoLai) {
    if (this._dangDB || !this.on || G.ketThuc) return;
    this._dangDB = true; this._choDB = true; this.baoNho('Reconnecting…', 0);
    const goc = this.goc(), js = (x) => { try { return x ? JSON.parse(x) : null; } catch (e) { return null; } };
    const xong = () => { this._dangDB = false; this._choDB = false; this._dbXong = Date.now(); };
    Promise.all([NET.get(goc + 'meta'), NET.get(goc + 'state'), NET.get(goc + 'snap/' + this.me), NET.get(goc + 'snap/' + this.ban)]).then(([m, st, sa, sb]) => {
      if (!this.on) return xong();
      const a = js(sa), b = js(sb);
      if (!m) { // phòng đã mất (host thoát / dọn phòng) → chơi tiếp ngoại tuyến, AI giữ bàn bạn
        xong(); if (G.ketThuc) return;
        this.diNgoai(); if (typeof ONL !== 'undefined') { ONL.roiPhong(); ONL.dangTran = false; }
        this.baoNho('Partner left — playing offline with AI', 3000); return;
      }
      const end = (st && st.end) || (b && b.e);
      if (end || G.ketThuc) { // trận đã xong khi mình vắng → màn kết quả
        xong(); this.anBao(); if (G.ketThuc) return;
        this._tuHost = true;
        try { ketThuc(!!end.thang, end.ly || TEXT.end.coopOut); } finally { this._tuHost = false; }
        return;
      }
      const aiToi = !!(b && b.ai);
      if (vaoLai || aiToi) {
        const w = Math.max(st && st.wave || 0, b && b.w || 0, vaoLai && a && a.w || 0);
        if (!vaoLai) { G.quai = []; G.hang = []; } // quái cũ của lúc ngủ: bỏ, chạy lại wave hiện tại cho khớp
        if (w) { G.wave = Math.max(0, w - 1); G.cho = Math.min(G.cho > 0 ? G.cho : 0.5, 0.5); if (!this.host) this.hostWave = w; }
        const tim = aiToi && b.ht != null ? b.ht : st && st.tim != null ? st.tim : b && b.ht;
        if (tim != null && G.ban[0]) G.ban[0].tim = tim;
        const toi = aiToi && b.b2 ? b.b2 : a;
        if (toi) this.apAnh(G.ban[0], toi, true);
        if (b) this.apAnh(G.ban[1], b, true);
        if (this.host) this.ghiState();
      }
      this.banVao = true; this.rx = Date.now(); xong();
      this.gui('lai'); this.chupAnh();
      this.baoNho(aiToi ? 'Back in the match' : '', 1500);
      console.log('[ONS] đồng bộ lại' + (aiToi ? ' (bạn đã cho AI lái bàn mình)' : '') + ' wave ' + G.wave);
    }).catch((e) => { console.warn('[ONS] đồng bộ lại', e && (e.code || e.message)); xong(); this._offT = this._offT || Date.now(); });
  },
  // dải chữ nhỏ trên cùng (tấm h2_lcd có sẵn) — không chặn, không chạm. ms = 0 → giữ tới khi gọi lại
  baoNho(s, ms) {
    let el = document.getElementById('ons-bao');
    if (!s) { this.anBao(); return; }
    if (!el) { el = document.createElement('div'); el.id = 'ons-bao'; document.getElementById('wrap').appendChild(el); }
    if (el.textContent !== s) el.textContent = s;
    el.hidden = false; el.classList.remove('an');
    clearTimeout(this._baoT); if (ms) this._baoT = setTimeout(() => this.anBao(), ms);
  },
  anBao() { const el = document.getElementById('ons-bao'); if (el) { el.classList.add('an'); clearTimeout(this._baoT2); this._baoT2 = setTimeout(() => { el.hidden = true; }, 260); } },
  // rời / hết trận online (ly: 'leave' | 'ai' | 'end')
  ketThucMang(ly) {
    if (!this.on) return;
    if (ly === 'leave' || ly === 'ai') this.gui('bye');
    this.on = false;
    for (const f of this._off.splice(0)) try { f(); } catch (e) { }
    for (const t of this._tm.splice(0)) clearInterval(t);
    this.mat = null; this.dungChung = false; this._dungBan = false; this.anMat();
    if (this._choDB || (document.getElementById('ons-bao') || {}).textContent === 'Reconnecting…') this.anBao();
    this._choDB = false; this._dangDB = false;
  },

  // ---------------------------------------------------------------- vòng canh (mỗi khung hình)
  canh() {
    if (!this.on) return;
    if (!G.ban.length) { this.ketThucMang('leave'); return; }
    const dangTai = (typeof TAI !== 'undefined' && TAI.cho) || (typeof VT !== 'undefined' && VT.mo);
    if (!dangTai && !this.toiVao) { this.toiVao = true; NET.update(this.goc() + 'pl/' + this.me, { vao: true }); this.gui('vao'); }
    let now = Date.now();
    // máy MÌNH vừa bị đơ / ngưng JS (khung hình cách nhau > 3 s) → mình mới là người vắng: không tính im lặng của bạn, đồng bộ lại
    if (this._canhT && now - this._canhT > 3000) { this.rx = Math.max(this.rx, now - 2000); if (this.toiVao && !this._offT) this._offT = now; }
    this._canhT = now;
    const im = now - this.rx;
    // bạn kia bấm tạm dừng rồi mất tích → bỏ tạm dừng (trận của mình không bao giờ bị kẹt vì bạn kia)
    if (this.dungChung && this._dungBan && (im > 4000 || this.thay)) { this.dungChung = false; this._dungBan = false; this.hienDung(false); }
    // không được tự dừng riêng một máy (bảng thông tin, …) — chỉ dừng khi: tạm dừng chung / màn mở đầu / màn tải. Mất kết nối KHÔNG dừng.
    const phaiDung = this.dungChung;
    if (!dangTai && !G.ketThuc) {
      if (phaiDung && !G.dung) G.dung = true;
      else if (!phaiDung && G.dung) G.dung = false;
    }
    G.tocDo = 1;
    // MÌNH mất mạng / đang ẩn: không tính im lặng của bạn (không cướp bàn bạn chỉ vì mình vắng); có mạng lại → đồng bộ lại
    const toiVang = !NET.noi || document.hidden;
    if (toiVang) { this.rx = Math.max(this.rx, now - 2000); if (!this._offT && this.toiVao) this._offT = now; }
    if (!G.ketThuc && !NET.noi && this.toiVao) this.baoNho('Reconnecting…', 0);
    else if (this._offT && !toiVang && !this._dangDB && !G.ketThuc) { this._offT = 0; this.dongBoLai(false); }
    if (!G.ketThuc && this.toiVao) {
      // nhãn trạng thái (không chặn): mình mất mạng / bạn im lặng > 4 s
      this.mat = !NET.noi ? { ly: 'toi' } : im > 4000 && !this.thay ? { ly: 'im' } : null;
      // bạn ẩn app ('an') > 6 s, hoặc im lặng > 12 s → AI lái bàn bạn trên máy mình. Trả bàn CHỈ khi bạn gửi 'lai' (đã đồng bộ lại).
      if (!this.thay && !toiVang && (this.banVao || now - this.t0 > 25000) && (im > this.AN_HAN || (this._banAn && now - this._banAn > this.AN_AN))) this.thayAI(false);
    }
    this.veHUD();
  },

  // ---------------------------------------------------------------- nhận
  nhan(v) {
    if (!v || v.u === this.me) return;
    this.rx = Date.now(); this.soAct++;
    let d = null; try { d = v.d ? JSON.parse(v.d) : null; } catch (e) { d = null; }
    const B1 = G.ban[1]; if (!B1 || !this.on) return;
    // AI đang lái bàn bạn: bỏ hành động cũ/lạc của bạn — chỉ nhận 'lai' (bạn đã đồng bộ lại → trả bàn) và 'bye'
    if (this.thay && v.k !== 'bye' && v.k !== 'lai') return;
    // (_banAn chỉ xoá khi bạn gửi 'lai' — hành động lạc gửi ngay sau khi ẩn app không được tính là "đã về")
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
        case 'an': this._banAn = Date.now(); break; // bạn ẩn app (điện thoại sẽ ngưng JS của bạn ấy)
        case 'lai': this._banAn = 0; if (this.thay && !this.thay.vinh) this.traBan(); break;
      }
    } catch (e) { console.error('[ONS] áp hành động', v.k, e); }
    this._apDung--;
  },
  apTrieu(B1, d) {
    if (!d || d.o == null || !G.rosterMap[d.id]) return;
    if (!d.f) B1.gia += LUAT.giaTrieuTang;
    if (B1.t[d.o]) { const T = B1.t[d.o]; if (T.id === d.id && T.sao === d.s) return; }
    const T = taoU(B1, d.id, d.s || 1, d.o); B1.t[d.o] = T;
    if (d.vg) T.vang = true; if (d.th) T.thuc = true; // dạng quay lúc sinh (Merge King vàng / Sói thức tỉnh) theo máy bạn
    VX.trieu(T);
  },
  // trạng thái 1 ô gửi qua mạng: [id, sao, cờ] — cờ: g vàng · w thức tỉnh · c bản sao · S đá · e<ép xung> · l<lò>
  oTT(T) {
    if (!T) return 0;
    let f = (T.vang ? 'g' : '') + (T.thuc ? 'w' : '') + (T.banSao ? 'c' : '') + (T.st && T.st.da ? 'S' : '');
    if (T.epxung) f += 'e' + Math.round(T.epxung * 100) + ';'; if (T.lo) f += 'l' + T.lo + ';';
    return [T.id, T.sao, f];
  },
  datO(B, o, s) {
    if (s === undefined) return;
    if (!s) { B.t[o] = null; return; }
    const [id, sao, f] = s; if (!G.rosterMap[id]) return;
    let T = B.t[o];
    if (!T || T.id !== id) { T = taoU(B, id, sao, o); B.t[o] = T; }
    T.sao = sao; T.o = o;
    const c = String(f || ''), so = (k) => { const m = c.match(new RegExp(k + '(\\d+);')); return m ? +m[1] : 0; };
    if (T.id === 'vughep') T.vang = c.includes('g');
    if (T.id === 'soi') T.thuc = c.includes('w');
    T.banSao = c.includes('c'); T.st.da = c.includes('S');
    T.epxung = so('e') / 100; if (T.id === 'loren') T.lo = so('l');
  },
  apGhep(B1, d) {
    if (!d) return;
    if (d.db) { // ghép ĐẶC BIỆT: chạy đúng kỹ năng (hình ảnh), rồi chốt 2 ô theo máy bạn — KHÔNG đi đường ghép thường (mất ụ / chạy kỹ năng khi ghép thừa)
      const a = B1.t[d.a], b = B1.t[d.b];
      if (a && b && a !== b && ghepDBHop(a, b)) { try { ghep(B1, a, b); } catch (e) { console.warn('[ONS] ghép đặc biệt', e); } }
      this.datO(B1, d.a, d.sa); this.datO(B1, d.b, d.sb);
      return;
    }
    const a = B1.t[d.a], b = B1.t[d.b];
    if (a && b && a !== b) {
      const cl = a.id === b.id && a.id === d.id && ghepDBHop(a, b); // ghép đặc biệt CÙNG LOẠI (Merge King + Merge King): tất định → chạy y hệt (cùng hiệu ứng/nhãn)
      const deck = B1.deck; B1.deck = [d.id]; // ụ ra = đúng ụ bạn kia nhận được (pick trong bộ 1 phần tử)
      G._pdEp = Array.isArray(d.pd) ? d.pd : null; // Pandora: đúng phép máy bạn đã quay
      try { ghep(B1, a, b, !cl); } finally { B1.deck = deck; G._pdEp = null; }
    }
    const T = B1.t[d.b];
    if (!T || T.id !== d.id || T.sao !== d.s) { if (G.rosterMap[d.id]) B1.t[d.b] = taoU(B1, d.id, d.s, d.b); }
    if (B1.t[d.b] && d.vg != null && B1.t[d.b].id === 'vughep') B1.t[d.b].vang = !!d.vg; // cờ vàng Merge King theo đúng máy bạn kia
    if (B1.t[d.b] && d.bs != null) B1.t[d.b].banSao = !!d.bs; // bản sao Copycat: −50% + huy hiệu, như máy bạn kia
    if (B1.t[d.b] && d.da != null) B1.t[d.b].st.da = !!d.da; // ô ĐÁ: Merge King lên đá giữ đá · đá + đá ra đá (theo đúng máy bạn kia)
    if (B1.t[d.a] && d.a !== d.b && !d.giuA) B1.t[d.a] = null;
    // Twin Maker: ụ sinh đôi đúng ô/loại/sao của máy bạn kia (bàn con rối không tự bốc — sinhDoi() trả null cho B.net)
    if (d.tw && d.tw.o != null && G.rosterMap[d.tw.id]) {
      const X = B1.t[d.tw.o];
      if (X && d.tw.o === d.a && !(X.id === d.tw.id && X.sao === d.tw.s)) B1.t[d.tw.o] = null; // ô ụ kéo vừa trống bên kia
      if (!B1.t[d.tw.o]) sinhDoi(B1, d.tw.s, d.b, { o: d.tw.o, id: d.tw.id });
    }
  },
  // ---------------------------------------------------------------- ảnh chụp bàn (mỗi 1 s) + mã băm
  oCua(B) { return B.t.map(T => T ? T.id + ':' + T.sao : ''); },
  bam(c) { let h = 2166136261; const s = c.join('|'); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); },
  anhBan(B) { const c = this.oCua(B); return { c, h: this.bam(c), f: B.t.map(T => (T && this.oTT(T)[2]) || ''), lv: B.lv, m: Math.round(B.mana), g: B.gia, mv: [B.mv.gia, Math.round(B.mv.cd * 10) / 10] }; },
  chupAnh() {
    if (!this.on || !G.ban.length || this._an || this._choDB) return; // đang ẩn / chờ đồng bộ lại: không ghi đè ảnh cũ bằng bàn lạc hậu
    const v = Object.assign({ w: G.wave, tk: Math.round(G.t * 60), ht: G.ban[0].tim }, this.anhBan(G.ban[0]));
    if (this.thay && G.ban[1]) { v.ai = 1; v.b2 = this.anhBan(G.ban[1]); } // AI đang lái bàn bạn → gửi kèm để bạn lấy lại khi về
    if (this._endMe) v.e = this._endMe;
    NET.set(this.goc() + 'snap/' + this.me, JSON.stringify(v)).catch(() => { });
    if (typeof ONL !== 'undefined' && ONL.code && (this._luuT = (this._luuT || 0) + 1) % 10 === 0) ONL.luuPhong(); // mốc "còn trong trận" (tự REJOIN khi mở lại game)
  },
  nhanAnh(s) {
    if (!s || !this.on) return;
    if (s === this._sAnh) return; // cùng ảnh cũ (nghe lại sau khi nối mạng) ≠ bạn còn sống
    this._sAnh = s; this.rx = Date.now();
    let v; try { v = JSON.parse(s); } catch (e) { return; }
    // bạn đang cho AI lái bàn MÌNH (mình vắng mà không hay — vd. mạng chập / máy đơ) → tự đồng bộ lại từ bạn (cách nhau ≥ 4 s).
    // Mình cũng đang cho AI lái bàn bạn (cả 2 tưởng bên kia vắng) → ảnh mới này chứng tỏ bạn còn đây: trả bàn trước.
    if (v.ai && !this._dangDB && !G.ketThuc && Date.now() - this._dbXong > 4000) { if (this.thay && !this.thay.vinh) this.traBan(); this.dongBoLai(false); return; }
    if (this.thay) return; // AI đang lái bàn này: chờ bạn gửi 'lai' rồi mới nhận ảnh
    if (v.e && !G.ketThuc && !this.host) { this.dongBoLai(false); return; } // bạn (đang giữ quyền) đã kết thúc trận
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
        if (id && B.t[i] && B.t[i].id === id) B.t[i].sao = +sao || 1; // cùng loại, lệch sao: chỉ sửa sao (giữ đá / bản sao / ép xung / dạng)
        else B.t[i] = id && G.rosterMap[id] ? taoU(B, id, +sao || 1, i) : null;
        sua++;
      }
      if (sua && !khoiPhuc) this.lech++;
    }
    if (Array.isArray(v.f)) for (let i = 0; i < 15; i++) { const T = B.t[i]; if (T && !T.anim && v.c[i] === T.id + ':' + T.sao && (this.oTT(T)[2] || '') !== (v.f[i] || '')) this.datO(B, i, [T.id, T.sao, v.f[i]]); } // cờ ô (đá, bản sao, dạng…) theo máy bạn
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
  guiPing() { if (!this.on || this._an) return; this._pingT = Date.now(); NET.set(this.goc() + 'ping/' + this.me, { t: this._pingT, e: this._pingThay || 0 }).catch(() => { }); },
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
      if (self.on && T && B === G.ban[0]) { const v = { o: T.o, id: T.id, s: T.sao, f: mienPhi ? 1 : 0 }; if (T.vang) v.vg = 1; if (T.thuc) v.th = 1; self.gui('tr', v); }
      return T;
    });
    g('ghep', (goc) => function (B, a, b, ep) {
      const ao = a && a.o, bo = b && b.o, laToi = self.on && b && b.ban === 0 && !self._apDung;
      const db = laToi && !ep && a && b ? !!ghepDBHop(a, b) : false; // ghép ĐẶC BIỆT (Teleporter / Copycat / Overclock / Forge / Merge King)
      if (laToi) { G.ban[0]._tw = null; G.ban[0]._pd = null; }
      const r = goc.apply(this, arguments);
      if (laToi && r) {
        const T = G.ban[0].t[bo] || r, v = { a: ao, b: bo, id: T.id, s: T.sao, giuA: G.ban[0].t[ao] ? 1 : 0, vg: T.vang ? 1 : 0, bs: T.banSao ? 1 : 0, da: T.st && T.st.da ? 1 : 0 };
        if (db) { v.db = 1; v.sa = self.oTT(G.ban[0].t[ao]); v.sb = self.oTT(G.ban[0].t[bo]); } // trạng thái đúng của CẢ 2 ô sau ghép đặc biệt
        const pd = G.ban[0]._pd; if (pd) v.pd = pd; // Pandora: phép đã quay
        const tw = G.ban[0]._tw; if (tw) v.tw = tw; // Twin Maker: ụ sinh đôi (ô/loại/sao) — bạn kia tạo y hệt, không bốc lại
        self.gui('gh', v);
      }
      if (laToi) { G.ban[0]._tw = null; G.ban[0]._pd = null; }
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
        // bạn đang vắng (AI lái): ghi kết quả vào ảnh chụp của mình + GIỮ phòng để bạn về còn thấy màn kết quả
        if (self.on && self.thay && !self.thay.vinh) { self._endMe = { thang: !!thang, ly: String(ly || '').slice(0, 80) }; self.chupAnh(); if (typeof ONL !== 'undefined') ONL._giuPhong = true; }
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
      lech: this.lech, soAct: this.soAct, toi: B0 && this.oCua(B0), ban: B1 && this.oCua(B1), anhBan: this._anh && this._anh.c, ketThuc: G.ketThuc, thay: this.thay && (this.thay.vinh ? 'bye' : 'im'), ai: !!(B1 && B1.ai && !B1.net), im: Date.now() - this.rx,
      an: !!this._an, choDB: this._choDB, banAn: !!this._banAn, bao: (document.getElementById('ons-bao') || {}).hidden === false ? document.getElementById('ons-bao').textContent : '' };
  },
};
