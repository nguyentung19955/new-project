// TURRET MERGE — CHỈ HUY MỚI (08/11): QUICK TUNE · DRAG NET (Trắng) · TWIN SIGNAL (Xanh) · CROSSFIRE (Tím) · NEXUS LINK (Vàng).
// Thiết kế: docs/demo-hop-tuong/tuvan/chi-huy-moi/THIET-KE.md · số trong data.js (MAVUONG.<id>).
// LUẬT (thuần, tất định — không Math.random; online: gói 'mv' mang ô đích o):
//  · keHoach(B, d, o, e): đích của lần dùng. o = ô chạm (TWIN/CROSSFIRE/NEXUS); o không có → tự chọn đích tốt nhất (AI, bàn máy) theo điểm, hoà → ô nhỏ.
//    Không có đích hợp lệ → null (CH.trangThai = 'dich', không trừ mana).
//  · Hiệu lực = B.chm (mảng {k, con, …}); đồng hồ con giảm trong CH.tick (dừng lúc nghỉ giữa wave khi bàn trống quái, như RAGE).
//  · Buff gắn với THÂN ụ (tham chiếu T): ghép = thân mới → mất buff; tăng sao tại chỗ / Teleporter giữ thân → giữ; biến tại chỗ
//    không phải ghép (Copycat, hộp, trùm biến…) đi qua giuKhiBien → CHM.thay(T, N) chuyển buff sang thân mới.
//  · Ụ băng/đá không nhận buff lúc dùng; dây NEXUS đứt vĩnh viễn khi ụ Hỗ trợ bị băng/đá, rời hàng/cột, sát bên, hoặc mất thân.
//  · TWIN: 1 trong 2 ụ mất thân (bị ghép) → cả cặp hết buff ngay.
//  · DRAG NET: quái mà bàn bắn được (banDuocQuai) chậm 25 % (trùm 12 %), gộp nhân với chậm có sẵn, trần 90 % (trùm 50 %); kháng chậm → không bị.
//  · Ụ Hỗ trợ không bao giờ bắn: chỉ là nguồn dây NEXUS (không nhận buff Tấn công).
'use strict';
const CHM = {
  KHOA: { tech: 1, luoi: 1, twin: 1, thap: 1, nexus: 1 },
  env() { return { G, SKILLS, MAVUONG }; },
  hang: (o) => (o / 5) | 0, cot: (o) => o % 5,
  kc(a, b) { return Math.abs(this.hang(a) - this.hang(b)) + Math.abs(this.cot(a) - this.cot(b)); },
  thang(a, b) { return a !== b && (this.hang(a) === this.hang(b) || this.cot(a) === this.cot(b)); }, // cùng hàng hoặc cùng cột
  khoaT(T) { return !!(T && T.st && (T.st.da || T.st.bang > 0)); },
  laTC(T, e) { const sk = e.SKILLS[T.id]; return !!(sk && sk.vai !== 'ht' && sk.dmg > 0); }, // ụ Tấn công (có sát thương)
  laHT(T, e) { const sk = e.SKILLS[T.id]; return !!(sk && sk.vai === 'ht'); },
  song(B, T) { return !!T && B.t[T.o] === T; },
  // ---------- đích ----------
  dsTech(B, d, e) { return B.t.filter(T => T && this.laTC(T, e) && T.sao <= d.saoToi && !this.khoaT(T)); },
  twinCua(B, T, e) { // anh em gần nhất (cùng loại + cùng sao, không băng/đá); hoà → ô nhỏ
    if (!T || !this.laTC(T, e) || this.khoaT(T)) return null;
    let best = null;
    for (const P of B.t) if (P && P !== T && P.id === T.id && P.sao === T.sao && !this.khoaT(P) && (!best || this.kc(T.o, P.o) < this.kc(T.o, best.o))) best = P;
    return best;
  },
  thapCua(B, o, d, e) { // chữ thập qua ô o: ụ Tấn công nhận buff + số loại ụ khác nhau
    const ds = [], loai = new Set();
    for (let i = 0; i < 15; i++) { if (i !== o && !this.thang(i, o)) continue; const T = B.t[i]; if (!T) continue; loai.add(T.id); if (this.laTC(T, e) && !this.khoaT(T)) ds.push(T); }
    return ds.length ? { o, ds, n: loai.size, dmg: Math.min(d.dmgMax, d.dmgLoai * loai.size) } : null;
  },
  dayCua(B, T, d, e) { // dây NEXUS: Hỗ trợ cùng hàng/cột, không kề, không băng/đá — gần nhất trước, hoà → ô nhỏ; tối đa d.day
    if (!T || !this.laTC(T, e) || this.khoaT(T)) return null;
    const L = B.t.filter(S => S && S !== T && this.laHT(S, e) && !this.khoaT(S) && this.thang(S.o, T.o) && this.kc(S.o, T.o) > 1);
    L.sort((a, b) => this.kc(a.o, T.o) - this.kc(b.o, T.o) || a.o - b.o);
    return L.length ? L.slice(0, d.day) : null;
  },
  giaTriDay(S, d) { return d.dmgDay + d.dmgSao * S.sao; },
  // kế hoạch 1 lần dùng (o: ô chạm; undefined = tự chọn)
  keHoach(B, d, o, e) {
    e = e || this.env();
    const tu = o == null || o < 0;
    if (d.khoa === 'tech') { const ds = this.dsTech(B, d, e); return ds.length ? { ds } : null; }
    if (d.khoa === 'luoi') return {};
    if (d.khoa === 'twin') {
      if (!tu) { const T = B.t[o], P = this.twinCua(B, T, e); return P ? { o, a: T, b: P } : null; }
      let best = null, bv = -1;
      for (const T of B.t) { const P = T && this.twinCua(B, T, e); if (!P) continue; const v = T.sao * 100 + ((e.SKILLS[T.id].dmg || 0) | 0); if (v > bv) { bv = v; best = { o: T.o, a: T, b: P }; } }
      return best;
    }
    if (d.khoa === 'thap') {
      if (!tu) return o >= 0 && o < 15 ? this.thapCua(B, o, d, e) : null;
      let best = null, bv = -1;
      for (let i = 0; i < 15; i++) { const k = this.thapCua(B, i, d, e); if (!k) continue; const v = k.dmg * k.ds.reduce((s, T) => s + T.sao, 0); if (v > bv + 1e-9) { bv = v; best = k; } }
      return best;
    }
    if (d.khoa === 'nexus') {
      if (!tu) { const T = B.t[o], L = this.dayCua(B, T, d, e); return L ? { o, T, day: L } : null; }
      let best = null, bv = -1;
      for (const T of B.t) { const L = T && this.dayCua(B, T, d, e); if (!L) continue; const v = L.reduce((s, S) => s + this.giaTriDay(S, d), 0) * (1 + T.sao); if (v > bv + 1e-9) { bv = v; best = { o: T.o, T, day: L }; } }
      return best;
    }
    return null;
  },
  // ô hợp lệ để chạm (chế độ ngắm — UI)
  oHopLe(B, d, e) { e = e || this.env(); const ra = []; for (let i = 0; i < 15; i++) if (this.keHoach(B, d, i, e)) ra.push(i); return ra; },
  // ---------- áp dụng ----------
  apDung(B, d, k) {
    const L = B.chm || (B.chm = []);
    for (let i = L.length - 1; i >= 0; i--) if (L[i].k === d.khoa) L.splice(i, 1); // dùng lại: thay hiệu lực cũ (không cộng dồn)
    const h = { k: d.khoa, con: d.hieuLuc, max: d.hieuLuc };
    if (d.khoa === 'tech') { h.ds = k.ds.slice(); h.toc = d.toc; }
    else if (d.khoa === 'luoi') { h.cham = d.cham; h.chamTrum = d.chamTrum; }
    else if (d.khoa === 'twin') { h.a = k.a; h.b = k.b; h.dmg = d.dmg; }
    else if (d.khoa === 'thap') { h.o = k.o; h.ds = k.ds.slice(); h.n = k.n; h.dmg = k.dmg; }
    else if (d.khoa === 'nexus') { h.T = k.T; h.day = k.day.slice(); h.d = d; }
    L.push(h);
    return h;
  },
  // thân ụ bị thay tại chỗ (không phải ghép) → buff đi theo thân mới
  thay(T, N) {
    if (!T || !N || T === N || typeof G === 'undefined' || !G.ban) return;
    for (const B of G.ban) for (const h of B.chm || []) {
      if (h.ds) { const i = h.ds.indexOf(T); if (i >= 0) h.ds[i] = N; }
      if (h.a === T) h.a = N; if (h.b === T) h.b = N; if (h.T === T) h.T = N;
      if (h.day) { const i = h.day.indexOf(T); if (i >= 0) h.day[i] = N; }
    }
  },
  // đồng hồ (CH.tick gọi khi KHÔNG dừng đồng hồ)
  tick(B, dt) {
    const L = B.chm; if (!L || !L.length) return;
    for (let i = L.length - 1; i >= 0; i--) { L[i].con -= dt; if (L[i].con <= 0) L.splice(i, 1); }
  },
  con(B, khoa) { for (const h of B.chm || []) if (h.k === khoa) return h.con; return 0; },
  // buff mỗi bước logic (game.js capNhatBan, sau hỗ trợ): vào nhóm cộng gộp T.buf
  buf(B) {
    const L = B.chm; if (!L || !L.length) return;
    for (let i = L.length - 1; i >= 0; i--) {
      const h = L[i];
      if (h.k === 'tech') { for (const T of h.ds) if (this.song(B, T) && !this.khoaT(T)) { T.buf.toc += h.toc; } }
      else if (h.k === 'twin') {
        if (!this.song(B, h.a) || !this.song(B, h.b)) { L.splice(i, 1); continue; } // ghép 1 trong 2 → cả cặp hết
        for (const T of [h.a, h.b]) if (!this.khoaT(T)) { T.buf.dmg += h.dmg; } // ụ khoá giữa chừng: không cộng (như QUICK TUNE / NEXUS — AUDIT F13)
      } else if (h.k === 'thap') { for (const T of h.ds) if (this.song(B, T) && !this.khoaT(T)) { T.buf.dmg += h.dmg; } }
      else if (h.k === 'nexus') {
        const T = h.T; if (!this.song(B, T)) { L.splice(i, 1); continue; } // ghép ụ chủ lực → hết
        h.day = h.day.filter(S => this.song(B, S) && !this.khoaT(S) && this.thang(S.o, T.o) && this.kc(S.o, T.o) > 1); // đứt thì không nối lại
        let dm = 0; for (const S of h.day) dm += this.giaTriDay(S, h.d);
        if (h.day.length && !this.khoaT(T)) { T.buf.dmg += dm; T.buf.toc += h.d.tocDay * h.day.length; }
      }
    }
  },
  // dòng nguồn buff cho bảng chi tiết ụ (buff.js): them(k, v, chữ)
  nhanBuff(B, T, them) {
    for (const h of (B && B.chm) || []) {
      const s = ' ' + Math.ceil(h.con) + 's';
      if (h.k === 'tech' && h.ds.includes(T) && !this.khoaT(T)) them('toc', h.toc, 'Commander QUICK TUNE' + s);
      else if (h.k === 'twin' && (h.a === T || h.b === T) && !this.khoaT(T)) them('dmg', h.dmg, 'Commander TWIN SIGNAL' + s);
      else if (h.k === 'thap' && h.ds.includes(T) && !this.khoaT(T)) them('dmg', h.dmg, 'Commander CROSSFIRE' + s);
      else if (h.k === 'nexus' && h.T === T && h.day.length) { let dm = 0; for (const S of h.day) dm += this.giaTriDay(S, h.d); them('dmg', dm, 'Commander NEXUS LINK' + s); them('toc', h.d.tocDay * h.day.length, 'Commander NEXUS LINK' + s); }
    }
  },
  // DRAG NET: hệ số chậm thêm cho quái E (0 = không); game.js capNhatQuai gộp nhân + trần
  chamQuai(E) {
    if (typeof G === 'undefined' || !G.ban) return 0;
    let c = 0;
    for (const B of G.ban) for (const h of B.chm || []) if (h.k === 'luoi' && h.con > 0 && typeof banDuocQuai === 'function' && banDuocQuai(B, E)) c = Math.max(c, E.trum ? h.chamTrum : h.cham);
    return c;
  },
  gopCham(E, cham, them) { // gộp nhân, trần 90 % (trùm 50 %); không làm giảm chậm sẵn có
    if (!(them > 0) || E.d.khangCham) return cham;
    return Math.max(cham, Math.min(E.trum ? 0.5 : 0.9, 1 - (1 - cham) * (1 - them)));
  },
};
if (typeof module !== 'undefined') module.exports = CHM;

// ===================================================== GIAO DIỆN (trình duyệt) =====================================================
// Chế độ NGẮM (TWIN / CROSSFIRE / NEXUS): chạm thẻ chỉ huy → ô hợp lệ có vòng màu chỉ huy + dải chữ; chạm ô hợp lệ → dùng (dungMV(B, o));
//  chạm lại thẻ / chạm chỗ khác / 6 s → huỷ, KHÔNG trừ mana. Hình: chỉ PNG có sẵn (fx_vong_mong, sup_link, sup_link_vang) + icon kỹ năng
//  cmd_ic_<id> + lưới cmd_fx_luoi; thiếu ảnh → bỏ qua (luật không phụ thuộc hình). Buff có thời hạn: dấu icon nhỏ trên ụ SUỐT thời gian;
//  lúc dùng: chớp vòng (FX.vong1) trên ụ nhận. DRAG NET: lưới đặt dọc TIM ĐƯỜNG của bàn.
const CHMU = {
  ngam: null, CHU: { twin: 'Tap a turret that has a twin', thap: 'Tap a cell: its row and column', nexus: 'Tap your main Attack turret' },
  a(n) { return typeof anhUrl === 'function' ? anhUrl(n) : 'assets/' + n + '.png'; },
  bat(B) {
    const d = MAVUONG[B.mv.id]; if (!d || !d.chon) return false;
    if (this.ngam) { this.huy(); return true; }
    if (CH.trangThai(B) !== 'san') return true; // lý do đã báo (tien-ui.js)
    const ds = CHM.oHopLe(B, d); if (!ds.length) return true;
    this.ngam = { B, d, ds, t0: performance.now() };
    let g = document.getElementById('chm-goi');
    if (!g) { g = document.createElement('div'); g.id = 'chm-goi'; g.innerHTML = '<img alt=""><b></b><small>Tap the commander to cancel</small>'; $('#wrap').appendChild(g); }
    g.querySelector('img').src = mvIcURL(B.mv.id); g.querySelector('b').textContent = this.CHU[d.khoa] || 'Tap a cell';
    g.style.setProperty('--mm', d.mau);
    const du = $('#duoi'); if (du) g.style.bottom = Math.round($('#wrap').offsetHeight - du.offsetTop + 6) + 'px';
    g.hidden = false;
    $('#the-mv').classList.add('chm-ngam');
    clearTimeout(this._t); this._t = setTimeout(() => this.huy(), 6000);
    return true;
  },
  huy() { this.ngam = null; clearTimeout(this._t); const g = document.getElementById('chm-goi'); if (g) g.hidden = true; const te = document.getElementById('the-mv'); if (te) te.classList.remove('chm-ngam'); },
  oTai(B, x, y) { let best = -1, bd = 1e9; for (let i = 0; i < 15; i++) { const c = B.o[i], dd = Math.hypot(c.x - x, c.y - y); if (Math.abs(c.x - x) < B.cw * 0.55 && Math.abs(c.y - y) < B.ch * 0.55 && dd < bd) { bd = dd; best = i; } } return best; },
  // chạm khi đang ngắm (lắng nghe ở pha bắt, trước kéo-ghép của canvas)
  cham(e) {
    const n = this.ngam; if (!n) return;
    const te = document.getElementById('the-mv');
    if (te && e.target && te.contains(e.target)) return; // chạm thẻ: ui.js 'mv' → huỷ
    if (!e.target || e.target.id !== 'cv' || G.ketThuc || G.dung || G.ban[0] !== n.B) { this.huy(); return; }
    const [x, y] = UI.diemLogic(e), o = this.oTai(n.B, x, y);
    e.stopImmediatePropagation(); e.preventDefault();
    if (o >= 0 && n.ds.includes(o)) { this.huy(); dungMV(n.B, o); }
    else { this.huy(); if (typeof TIENUI !== 'undefined') TIENUI.bay('NOT A VALID TARGET', 'tn-bay tn-do'); }
  },
  // ---------- vẽ ----------
  im(n, mau) { return typeof PX !== 'undefined' ? PX.mau(n, mau) : null; },
  daiNoi(ctx, im, x0, y0, x1, y1, day, al) { // dải PNG kéo giãn giữa 2 điểm (sup_link)
    if (!im) return; const L = Math.hypot(x1 - x0, y1 - y0); if (L < 2) return;
    PX.ve(ctx, im, (x0 + x1) / 2, (y0 + y1) / 2, L, day, Math.atan2(y1 - y0, x1 - x0), al);
  },
  dau(ctx, B, T, ic, t) { // icon nhỏ góc trên-trái ô = buff đang chạy
    const c = B.o[T.o], C = Math.min(B.cw, B.ch), s = C * 0.34;
    PX.ve(ctx, REN.img(ic), c.x - C * 0.36, c.y - C * 0.34, s, s, 0, 0.82 + 0.18 * Math.sin(t * 5));
  },
  veDuoi(ctx) { // dưới ụ: vòng ô hợp lệ khi ngắm · dây TWIN / NEXUS · lưới DRAG NET
    if (typeof G === 'undefined' || !G.ban) return;
    const t = REN.t || 0, n = this.ngam;
    if (n && G.ban[0] === n.B) {
      const C = Math.min(n.B.cw, n.B.ch), vm = this.im('fx_vong_mong', n.d.mau);
      for (const o of n.ds) { const c = n.B.o[o], k = 1 + 0.06 * Math.sin(t * 7 + o); PX.ve(ctx, vm, c.x, c.y, C * 1.05 * k, C * 1.05 * k, 0, 0.9); }
    }
    for (const B of G.ban) for (const h of B.chm || []) {
      const al = Math.min(1, h.con / 0.6, (h.max - h.con) / 0.25 + 0.3);
      if (h.k === 'twin' && CHM.song(B, h.a) && CHM.song(B, h.b)) { const a = B.o[h.a.o], b = B.o[h.b.o]; this.daiNoi(ctx, REN.img('sup_link'), a.x, a.y, b.x, b.y, Math.min(B.cw, B.ch) * 0.22, al * (0.75 + 0.25 * Math.sin(t * 6))); }
      else if (h.k === 'nexus' && CHM.song(B, h.T)) { const c = B.o[h.T.o]; for (const S of h.day) { const s = B.o[S.o]; this.daiNoi(ctx, REN.img('sup_link_vang'), s.x, s.y, c.x, c.y, Math.min(B.cw, B.ch) * 0.24, al * (0.8 + 0.2 * Math.sin(t * 5 + S.o))); } }
      else if (h.k === 'thap' && h.max - h.con < 0.7) { // chớp chữ thập lúc dùng (0,7 s)
        const c = B.o[h.o], u = (h.max - h.con) / 0.7, im = this.im('sup_link', MAVUONG.hawk.mau), dd = Math.min(B.cw, B.ch) * 0.5;
        this.daiNoi(ctx, im, B.o[this.hangDau(h.o)].x - B.cw * 0.5, c.y, B.o[this.hangDau(h.o) + 4].x + B.cw * 0.5, c.y, dd, 1 - u);
        this.daiNoi(ctx, im, c.x, B.o[h.o % 5].y - B.ch * 0.5, c.x, B.o[h.o % 5 + 10].y + B.ch * 0.5, dd, 1 - u);
      } else if (h.k === 'luoi') this.veLuoi(ctx, B, h, al);
    }
  },
  hangDau(o) { return o - (o % 5); },
  veLuoi(ctx, B, h, al) { // lưới dọc tim đường của bàn (làn có ban === B.i)
    const im = REN.img('cmd_fx_luoi') || this.im('fx_vong_mong', MAVUONG.tide.mau); if (!im) return;
    const C = Math.min(B.cw, B.ch) * 0.62, buoc = C * 1.05, t = REN.t || 0;
    for (const p of G.duong) {
      if (p.ban !== B.i) continue;
      for (let s = buoc * 0.5; s < p.len; s += buoc) { const v = viTri(p, s); PX.ve(ctx, im, v[0], v[1], C * 1.25, C, v[2], al * (0.42 + 0.08 * Math.sin(t * 3 + s * 0.05))); } // ô lưới nằm dọc theo hướng đường
    }
  },
  veTren(ctx) { // trên ụ: icon buff đang chạy
    if (typeof G === 'undefined' || !G.ban) return;
    const t = REN.t || 0;
    for (const B of G.ban) for (const h of B.chm || []) {
      const ic = MAVUONG[B.mv.id] && MAVUONG[B.mv.id].khoa === h.k ? MAVUONG[B.mv.id].icon : null; if (!ic) continue;
      if (h.k === 'tech' || h.k === 'thap') { for (const T of h.ds) if (CHM.song(B, T)) this.dau(ctx, B, T, ic, t); }
      else if (h.k === 'twin') { if (CHM.song(B, h.a)) this.dau(ctx, B, h.a, ic, t); if (CHM.song(B, h.b)) this.dau(ctx, B, h.b, ic, t); }
      else if (h.k === 'nexus' && CHM.song(B, h.T) && h.day.length) this.dau(ctx, B, h.T, ic, t);
    }
  },
  // vừa dùng (CH.dung ok): chớp vòng trên ụ nhận (chỉ hình)
  chop(B, r) {
    const h = r && r.hl; if (!h || typeof FX === 'undefined') return;
    const d = MAVUONG[r.id], L = h.ds || (h.k === 'twin' ? [h.a, h.b] : h.k === 'nexus' ? [h.T].concat(h.day) : []);
    for (const T of L) { const c = B.o[T.o]; FX.vong1(c.x, c.y, 6, 34, d.mau, 0.4, 4); }
    if (h.k === 'luoi') for (const p of G.duong) if (p.ban === B.i) { const v = viTri(p, p.len * 0.5); FX.vong1(v[0], v[1], 10, 60, d.mau, 0.4, 5); }
  },
};
if (typeof window !== 'undefined') {
  addEventListener('pointerdown', (e) => { try { CHMU.cham(e); } catch (er) { console.error('CHMU', er); } }, true);
  addEventListener('load', () => {
    try { if (typeof UI !== 'undefined' && UI.mv && typeof mvCo === 'function' && !mvCo(UI.mv)) UI.mv = 'hero'; } catch (e) { } // bản lưu chọn chỉ huy chưa mở → REINFORCE
    if (typeof REN !== 'undefined' && REN.veO) { const _vo = REN.veO; REN.veO = function (ctx) { try { CHMU.veDuoi(ctx); } catch (e) { } const r = _vo.apply(this, arguments); try { CHMU.veTren(ctx); } catch (e) { } return r; }; }
    if (typeof CH !== 'undefined') { const _d = CH.dung; CH.dung = function (B) { const r = _d.apply(this, arguments); if (r && r.ok && typeof G !== 'undefined' && G.ban && G.ban.includes(B)) { try { CHMU.chop(B, r); } catch (e) { } } return r; }; }
    if (typeof batDau === 'function') { const _bd = batDau; batDau = function () { CHMU.huy(); return _bd.apply(this, arguments); }; }
  });
}
