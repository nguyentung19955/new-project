// TURRET MERGE — HIỂN THỊ BUFF RÕ RÀNG (theo docs/demo-hop-tuong/thap-art/TU-VAN-BUFF.txt)
// "Biểu tượng nhỏ cho biết CÁI GÌ · chạm cho biết AI · bảng cho biết BAO NHIÊU & TỪ ĐÂU · hiệu ứng proc cho biết LÚC NÀO thật sự trúng"
//  (A) lúc thường: tối đa 2 ký hiệu 12×12 ở GÓC TRÊN-TRÁI ô của ụ ĐƯỢC buff (thứ 3+ → "+N"), không viền vàng, không số %
//  (B) chạm ụ hỗ trợ: viền nét đứt trắng ô nguồn, ô đích tô nhạt + viền màu, dây mảnh nối qua khe — tĩnh, tắt ≤100 ms khi bỏ chọn
//  (C) proc: chí mạng số vàng nảy nhẹ, giết ngay = đầu lâu tím + tro, chậm = viền băng + bông tuyết trên quái, khiên chặn = lục giác,
//      tẩy = chữ thập trắng quét, mana = tinh thể bạc hà ở máy sinh mana
'use strict';

// 8 loại hiệu ứng: màu nhấn + hình ký hiệu (KHÔNG dựa vào màu đơn thuần)
const BUFF = {
  toc:   { ten: 'Fire rate',    mau: '#FFB547' }, // ba mũi tên >>>
  dmg:   { ten: 'Damage',       mau: '#FF7654' }, // lưỡi kiếm
  crit:  { ten: 'Crit chance',  mau: '#F7D65B' }, // sao 4 cánh + chấm giữa
  cham:  { ten: 'Shots slow',   mau: '#78D9F5' }, // bông tuyết 6 cánh
  chet:  { ten: 'Instant kill', mau: '#BA94F2' }, // đầu lâu góc cạnh
  mana:  { ten: 'Mana',         mau: '#58D9AD' }, // tinh thể thoi
  khien: { ten: 'Shield',       mau: '#73A9FF' }, // khiên lục giác
  taylo: { ten: 'Cleanse',      mau: '#E8E5C8' }, // chữ thập 4 cánh + vòng nhỏ
};
const BUFF_THU_TU = ['tam', 'khien', 'chet', 'toc', 'dmg', 'crit', 'cham', 'mana', 'taylo']; // ưu tiên hiển thị lúc thường
const SUP_LOAI = { radar: 'toc', chimang: 'crit', lanhgia: 'cham', khuech: 'dmg', tuthan: 'chet', mana: 'mana', nhanmana: 'mana', hutmana: 'mana', khien: 'khien', taylo: 'taylo' };
// giá trị hiệu lực của ụ hỗ trợ (để bảng thông tin tách: gốc 1★ LV1 / phần sao / phần cấp / mốc sao)
const SUP_GIA = { radar: (T) => SKILLS.radar.them(T), chimang: (T) => SKILLS.chimang.them(T), lanhgia: (T) => SKILLS.lanhgia.cham(T), khuech: (T) => SKILLS.khuech.them(T), tuthan: (T) => SKILLS.tuthan.tile(T) };

// ---------- vẽ ký hiệu (code, nét 1.5 px) ----------
function veKyHieu(x, k, r, mau) { // x: ctx đã dời về tâm; r: nửa cạnh vùng ký hiệu
  x.strokeStyle = mau; x.fillStyle = mau; x.lineWidth = r * 0.36; x.lineCap = 'round'; x.lineJoin = 'round';
  const L = (pts, kin, to) => { x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0] * r, p[1] * r) : x.moveTo(p[0] * r, p[1] * r)); if (kin) x.closePath(); to ? x.fill() : x.stroke(); };
  if (k === 'toc') { for (const dx of [-0.62, 0, 0.62]) L([[dx - 0.3, -0.6], [dx + 0.25, 0], [dx - 0.3, 0.6]]); }
  else if (k === 'dmg') { L([[0.85, -0.85], [0.35, -0.75], [-0.45, 0.05], [-0.05, 0.45], [0.75, -0.35]], true, true); L([[-0.45, 0.45], [-0.85, 0.85]]); L([[-0.75, 0.15], [-0.15, 0.75]]); }
  else if (k === 'crit') { L([[0, -1], [0.22, -0.22], [1, 0], [0.22, 0.22], [0, 1], [-0.22, 0.22], [-1, 0], [-0.22, -0.22]], true, true); x.fillStyle = '#151A20'; x.beginPath(); x.arc(0, 0, r * 0.16, 0, 7); x.fill(); }
  else if (k === 'cham') { for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + Math.PI / 2, c = Math.cos(a), s = Math.sin(a); L([[-c, -s], [c, s]]); for (const sg of [-1, 1]) { const px = c * 0.55 * sg, py = s * 0.55 * sg; L([[px - s * 0.28, py + c * 0.28], [px, py], [px + s * 0.28, py - c * 0.28]]); } } }
  else if (k === 'chet') { x.beginPath(); x.moveTo(-0.8 * r, -0.1 * r); x.lineTo(-0.6 * r, -0.8 * r); x.lineTo(0.6 * r, -0.8 * r); x.lineTo(0.8 * r, -0.1 * r); x.lineTo(0.45 * r, 0.3 * r); x.lineTo(0.45 * r, 0.85 * r); x.lineTo(-0.45 * r, 0.85 * r); x.lineTo(-0.45 * r, 0.3 * r); x.closePath(); x.fill();
    x.fillStyle = '#151A20'; x.fillRect(-0.55 * r, -0.4 * r, 0.38 * r, 0.32 * r); x.fillRect(0.17 * r, -0.4 * r, 0.38 * r, 0.32 * r); x.fillRect(-0.06 * r, 0.05 * r, 0.12 * r, 0.25 * r); }
  else if (k === 'mana') { L([[0, -1], [0.7, -0.15], [0, 1], [-0.7, -0.15]], true, true); x.strokeStyle = '#151A20'; x.lineWidth = r * 0.18; L([[-0.7, -0.15], [0.7, -0.15]]); }
  else if (k === 'khien') { const h = []; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + Math.PI / 6; h.push([Math.cos(a) * 0.9, Math.sin(a) * 0.9]); } L(h, true); L([[0, -0.45], [0, 0.45]]); }
  else if (k === 'taylo') { L([[0, -1], [0.18, -0.18], [1, 0], [0.18, 0.18], [0, 1], [-0.18, 0.18], [-1, 0], [-0.18, -0.18]], true, true); x.lineWidth = r * 0.16; x.beginPath(); x.arc(0, 0, r * 0.55, 0, 7); x.stroke(); }
}
Object.assign(REN, {
  // tấm ký hiệu 12×12 (px logic): nền than #151A20 92%, viền màu trên/trái 1 px, ký hiệu 8×8 ở giữa — dựng sẵn đúng điểm ảnh
  kyHieu(k, px, rong) {
    const kk = this.s * this.dpr, n = Math.max(8, Math.round(px * kk)), key = 'kh|' + k + '|' + n + (rong ? 'r' : '');
    let c = this.cache[key]; if (c) return c;
    c = document.createElement('canvas'); c.width = c.height = n;
    const x = this.c2d(c), q = n / px, B = BUFF[k], m = B ? B.mau : '#ffffff';
    x.scale(q, q);
    x.globalAlpha = rong ? 0.7 : 0.93; x.fillStyle = '#151A20';
    x.beginPath(); x.roundRect ? x.roundRect(0, 0, px, px, px * 0.22) : x.rect(0, 0, px, px); x.fill();
    x.globalAlpha = 1; x.strokeStyle = m; x.lineWidth = 1; x.beginPath(); x.moveTo(0.5, px - 2); x.lineTo(0.5, 0.5); x.lineTo(px - 2, 0.5); x.stroke(); // viền màu trên + trái
    x.translate(px / 2, px / 2);
    if (rong) x.globalAlpha = 0.45;
    veKyHieu(x, k, px * 0.34, m);
    return (this.cache[key] = c);
  },
  // ảnh ký hiệu cho bảng DOM (data URL, dựng 1 lần)
  kyHieuURL(k) {
    this._khu = this._khu || {}; if (this._khu[k]) return this._khu[k];
    const c = document.createElement('canvas'); c.width = c.height = 36; const x = c.getContext('2d');
    x.fillStyle = '#151A20'; x.beginPath(); x.roundRect ? x.roundRect(0, 0, 36, 36, 8) : x.rect(0, 0, 36, 36); x.fill();
    x.strokeStyle = BUFF[k].mau; x.lineWidth = 2.5; x.beginPath(); x.moveTo(1.5, 30); x.lineTo(1.5, 1.5); x.lineTo(30, 1.5); x.stroke();
    x.translate(18, 18); veKyHieu(x, k, 11, BUFF[k].mau);
    return (this._khu[k] = c.toDataURL());
  },
  // (A) ký hiệu buff lúc thường trên ụ ĐƯỢC buff: góc trên-trái ô, 2 ô 12×12 cách 2 px, thứ 3+ thành "+N"; xuất hiện nảy 1 lần ~170 ms
  veBuffNho(ctx, T, x, y) {
    const ds = buffLoai(T), now = VX.t;
    const nho = T._bgT || (T._bgT = {});
    for (const k of ds) if (nho[k] == null) nho[k] = now;
    for (const k in nho) if (!ds.includes(k)) delete nho[k];
    if (!ds.length) return;
    const X = UI.xemHT, uuTien = X && X.T && SUP_LOAI[X.T.id]; // đang soi ụ hỗ trợ: ký hiệu của nó lên đầu
    if (uuTien && ds.includes(uuTien)) { ds.splice(ds.indexOf(uuTien), 1); ds.unshift(uuTien); }
    const n = ds.length > 2 ? 1 : ds.length;
    for (let i = 0; i < n; i++) {
      const k = ds[i], u = clamp((now - nho[k]) / 0.17, 0, 1), s = u < 1 ? 1.35 - 0.35 * VX.eo(u) : 1;
      ctx.globalAlpha = 0.92 * Math.min(1, u * 2.5);
      const c = this.kyHieu(k === 'tam' ? 'toc' : k, 12), px = x + i * 14 + 6, py = y + 6;
      ctx.drawImage(c, px - 6 * s, py - 6 * s, 12 * s, 12 * s);
    }
    if (ds.length > 2) { // "+N"
      const px = x + 14, w = 13;
      ctx.globalAlpha = 0.92; ctx.fillStyle = '#151A20'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(px, y, w, 12, 3) : ctx.rect(px, y, w, 12); ctx.fill();
      ctx.font = '900 8.5px ' + FONT.display; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#E9E8E2';
      ctx.fillText('+' + (ds.length - 1), px + w / 2, y + 6.5); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    }
    ctx.globalAlpha = 1;
  },
  // (B) chạm ụ hỗ trợ: thay khung góc vàng + nhãn nổi to bằng vùng tác dụng + dây mảnh tĩnh (TU-VAN-BUFF mục 6)
  veHoTro(ctx) {
    const X = UI.xemHT; if (!X) return;
    const B = G.ban[X.T.ban], T = X.T;
    if (!B || B.t[T.o] !== T) { UI.xemHT = null; return; }
    const now = performance.now(), e = (now - X.t0) / 1000;
    const con = X.giu || (now < UI.ttHet && !$('#tt').hidden);
    if (!con) { X.tat = X.tat || now; } else X.tat = 0;
    const tat = X.tat ? 1 - (now - X.tat) / 100 : 1; // tắt trong 100 ms
    if (tat <= 0) { UI.xemHT = null; return; }
    const k = SUP_LOAI[T.id], mau = BUFF[k].mau, c = B.o[T.o], cw = B.cw, ch = B.ch, C = Math.min(cw, ch);
    const vao = clamp(e / 0.1, 0, 1) * tat;
    const oVuong = (o, edge, dash, fill, a) => {
      ctx.globalAlpha = a;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(o.x - cw / 2 + 2.5, o.y - ch / 2 + 2.5, cw - 5, ch - 5, 6) : ctx.rect(o.x - cw / 2 + 2.5, o.y - ch / 2 + 2.5, cw - 5, ch - 5);
      if (fill) { ctx.fillStyle = fill; ctx.globalAlpha = a * 0.2; ctx.fill(); ctx.globalAlpha = a; }
      ctx.setLineDash(dash || []); ctx.strokeStyle = edge; ctx.lineWidth = dash ? 1.5 : 1.8; ctx.stroke(); ctx.setLineDash([]);
    };
    // đích: ô kề theo đúng luật (oHoTro = 4 ô thẳng, 5★ thêm 4 ô chéo); ụ Khiên/Tẩy: các ụ đang có khiên / đang dính hiệu ứng xấu
    let dich;
    if (k === 'khien') dich = B.t.filter(N => N && N !== T && N.khien > 0).map(N => ({ o: N.o, N }));
    else if (k === 'taylo') dich = B.t.filter(N => N && N !== T && (N.st.bang > 0 || N.st.da || N.st.lua > 0 || N.st.kep > 0)).map(N => ({ o: N.o, N }));
    else if (k === 'mana') dich = [];
    else { dich = []; const cc = T.o % 5, hh = (T.o / 5) | 0, cheo = loaiMoc(T.id) === 'ht' && mocChung(T, 5);
      for (const [dc, dh] of [[-1, 0], [1, 0], [0, -1], [0, 1]].concat(cheo ? [[-1, -1], [1, -1], [-1, 1], [1, 1]] : [])) { const c2 = cc + dc, h2 = hh + dh; if (c2 >= 0 && c2 < 5 && h2 >= 0 && h2 < 3) dich.push({ o: h2 * 5 + c2, N: B.t[h2 * 5 + c2] }); } }
    // 1) ô đích: hợp lệ = tô 20% + viền màu; trống / không nhận = viền xám nét đứt
    for (const d of dich) { const hop = d.N && !d.N.st.da; oVuong(B.o[d.o], hop ? mau : '#7d8590', hop ? null : [4, 4], hop ? mau : null, vao * (hop ? 1 : 0.7)); }
    // 2) dây mảnh tĩnh qua khe: lõi màu 1 px alpha .7 trên lớp than 3 px; chạy 1 nhịp sáng ~150 ms khi vừa chạm
    for (const d of dich) {
      if (!d.N || d.N.st.da) continue;
      const n = B.o[d.o], dx = n.x - c.x, dy = n.y - c.y, L = Math.hypot(dx, dy) || 1, r0 = C * 0.36;
      const x0 = c.x + dx / L * r0, y0 = c.y + dy / L * r0, x1 = n.x - dx / L * r0, y1 = n.y - dy / L * r0;
      ctx.globalAlpha = vao * 0.85; ctx.strokeStyle = '#0b0d10'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.globalAlpha = vao * 0.7; ctx.strokeStyle = mau; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      const p = e / 0.15;
      if (p < 1) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - p) * tat; this.anhGiua(ctx, this.cham1(mau), x0 + (x1 - x0) * p, y0 + (y1 - y0) * p, 10); ctx.globalCompositeOperation = 'source-over'; }
    }
    // 3) ô nguồn: viền nét đứt trắng-xám 1.5 px bên trong ô (không dùng vàng)
    oVuong(c, '#e6ebf2', [5, 3], null, vao);
    ctx.globalAlpha = 1;
  },
});

// loại buff đang có trên ụ (duy nhất theo loại, theo thứ tự ưu tiên)
function buffLoai(T) {
  const n = T.nguon || [], co = new Set();
  for (const s of n) if (s.v > 0.0005) co.add(s.k);
  if (T.tocT > 0) co.add('tam');
  if (T.epxung > 0 || T.aurora > 0) co.add(T.epxung > 0 ? 'toc' : 'dmg');
  const B = G.ban[T.ban];
  if (B && B.cuong > 0) co.add('dmg');
  if (T.khien > 0 || (B && B.khien > 0)) co.add('khien');
  return BUFF_THU_TU.filter(k => co.has(k));
}
// tổng hợp buff nhận được: [{k, tong, cach, nguon:[chuỗi]}] — dùng cho bảng thông tin
function buffTongHop(T) {
  const ra = {}, B = G.ban[T.ban], ten = (X) => (TEXT.turret[X.id] ? TEXT.turret[X.id].name : X.id) + ' ' + X.sao + '★';
  const them = (k, v, nguon, cach) => { const r = ra[k] || (ra[k] = { k, tong: 0, nguon: [], cach: cach || 'adds up' }); if (cach === 'highest') r.tong = Math.max(r.tong, v); else r.tong += v; r.nguon.push(nguon + ' +' + (k === 'chet' ? (v * 100).toFixed(1) : Math.round(v * 100)) + '%'); r.cach = cach || r.cach; };
  for (const s of T.nguon || []) if (s.v > 0.0005) them(s.k, s.v, ten(s.T), s.k === 'cham' ? 'highest' : null);
  if (T.tocT > 0) them('toc', T.tocV, 'Speed boost ' + T.tocT.toFixed(0) + 's');
  if (T.epxung > 0) them('toc', T.epxung, 'Overclock');
  if (T.aurora > 0) them('dmg', 0.5, 'Mimic merge ' + T.aurora.toFixed(0) + 's');
  if (B && B.cuong > 0) them('dmg', 1, 'Archfiend RAGE ' + B.cuong.toFixed(0) + 's');
  const ds = Object.values(ra);
  if (T.khien > 0) ds.push({ k: 'khien', tong: T.khien, nguon: ['blocks ' + T.khien + ' boss/rival skill'], cach: 'charges' });
  if (B && B.khien > 0) ds.push({ k: 'khien', tong: 1, nguon: ['board shield ' + B.khien.toFixed(1) + 's'], cach: 'timed' });
  return ds;
}
// dòng chi tiết ụ hỗ trợ: hiệu lực hiện tại + tầm + số ụ đang nhận + tách gốc/sao/cấp/mốc (đúng công thức trong skills)
function hoTroTT(T) {
  const id = T.id, k = SUP_LOAI[id], fn = SUP_GIA[id]; if (!k || !fn) return null;
  const B = G.ban[T.ban], lv0 = B.lv[id];
  const cu = (sao, lv) => { B.lv[id] = lv; const v = fn(Object.assign({}, T, { sao })); B.lv[id] = lv0; return v; };
  const lv = lv0 || 1, goc = cu(1, 1), saoV = cu(T.sao, 1), lvV = cu(T.sao, lv), he = heSoHT(T), hien = lvV * he;
  const pc = (v) => (id === 'tuthan' ? (v * 100).toFixed(1) : Math.round(v * 100)) + '%';
  const cheo = mocChung(T, 5) && loaiMoc(id) === 'ht';
  const nhan = oHoTro(B, T).filter(N => N && N !== T && !N.st.da).length;
  return { k, dong: BUFF[k].ten + ' +' + pc(hien) + ' (current)', tam: (cheo ? '8 cells around (N/E/S/W + diagonals)' : '4 adjacent cells (N/E/S/W)') + ' · affecting ' + nhan + '/' + (cheo ? 8 : 4),
    tach: 'Base 1★ LV1 +' + pc(goc) + ' · stars +' + pc(saoV - goc) + ' · LV' + lv + ' +' + pc(lvV - saoV) + (he > 1 ? ' · milestone ×' + he : '') };
}

// ===================================================== (C) PROC trên đối tượng =====================================================
Object.assign(VX, {
  chem(E) { if (E.daChem) return; E.daChem = true; this.ds.push({ k: 'so', x: E.x, y: E.y - (E.d.co || 40) * 0.45, t0: this.t, dai: 0.42 }); },          // giết ngay: đầu lâu 120 ms → tro tím 300 ms
  chanKhien(B, T) { this.ds.push({ k: 'hex', B, o: T.o, t0: this.t, dai: 0.28 }); },  // khiên chặn: lục giác bung 180 ms + tắt 100 ms
  donSach(B, T) { this.ds.push({ k: 'sach', B, o: T.o, t0: this.t, dai: 0.28 }); },   // tẩy: chữ thập trắng quét
  manaRa(B, T) { this.ds.push({ k: 'mn', B, o: T.o, t0: this.t, dai: 0.45 }); },      // sinh mana: tinh thể bạc hà nhô lên
});
const _veDsCu = VX.veDs;
VX.veDs = function (ctx, R) {
  _veDsCu.call(this, ctx, R);
  for (const e of this.ds) {
    const tt = this.t - e.t0; if (tt < 0) continue;
    if (e.k === 'so') {
      const u = tt / e.dai;
      if (tt < 0.13) { ctx.globalAlpha = 1; const c = R.kyHieu('chet', 16); ctx.drawImage(c, e.x - 8, e.y - 8 - tt * 20, 16, 16); }
      else { const v = (tt - 0.13) / 0.29; ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 6; i++) { const a = i * 1.047 + e.x, r = 4 + 14 * VX.eo(v); ctx.globalAlpha = (1 - v) * 0.8; R.anhGiua(ctx, R.cham1('#BA94F2'), e.x + Math.cos(a) * r, e.y - 3 + Math.sin(a) * r - v * 8, 8 * (1 - v * 0.5)); }
        ctx.restore(); }
      ctx.globalAlpha = 1; continue;
    }
    if (!e.B) continue;
    const c = e.B.o[e.o], S = Math.min(e.B.cw, e.B.ch); if (!c) continue;
    if (e.k === 'hex') {
      const u = tt / e.dai, r = S * (0.3 + 0.22 * VX.eo(Math.min(1, tt / 0.18))), a = tt < 0.18 ? 1 : 1 - (tt - 0.18) / 0.1;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.max(0, a); ctx.strokeStyle = '#73A9FF'; ctx.lineWidth = 1.5;
      ctx.beginPath(); for (let i = 0; i < 6; i++) { const g = i * Math.PI / 3 + Math.PI / 6; i ? ctx.lineTo(c.x + Math.cos(g) * r, c.y + Math.sin(g) * r) : ctx.moveTo(c.x + Math.cos(g) * r, c.y + Math.sin(g) * r); } ctx.closePath(); ctx.stroke();
      ctx.restore();
    } else if (e.k === 'sach') {
      const u = tt / e.dai;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - u; ctx.translate(c.x, c.y - S * 0.1); ctx.rotate(u * 0.8);
      const r = S * (0.2 + 0.25 * VX.eo(u)); veKyHieu(ctx, 'taylo', r, '#E8E5C8'); ctx.restore();
    } else if (e.k === 'mn') {
      const u = tt / e.dai; ctx.globalAlpha = u < 0.25 ? u / 0.25 : 1 - (u - 0.25) / 0.75;
      const ky = R.kyHieu('mana', 12); ctx.drawImage(ky, c.x - S * 0.32 - 6, c.y - S * 0.18 - u * 10 - 6, 12, 12);
    }
    ctx.globalAlpha = 1;
  }
};
