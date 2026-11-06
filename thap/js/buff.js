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
const SUP_LOAI = { radar: 'toc', chimang: 'crit', lanhgia: 'cham', khuech: 'dmg', tuthan: 'chet', mana: 'mana', nhanmana: 'mana', hutmana: 'mana', khien: 'khien', taylo: 'taylo',
  phagiap: 'dmg', bua: 'crit', tron: 'toc', nangsao: 'toc', hasao: 'dmg', guongcong: 'khien', dongbo: 'dmg', cauvong: 'dmg', lophanung: 'cham' }; // đợt vai trò: 9 ụ mới thành Hỗ trợ
// giá trị hiệu lực của ụ hỗ trợ (để bảng thông tin tách: gốc 1★ LV1 / phần sao / phần cấp / mốc sao)
const SUP_GIA = { radar: (T) => SKILLS.radar.them(T), chimang: (T) => SKILLS.chimang.them(T), lanhgia: (T) => SKILLS.lanhgia.cham(T), khuech: (T) => SKILLS.khuech.buoc(T) * SKILLS.khuech.max(T),
  phagiap: (T) => SKILLS.phagiap.k(T), bua: (T) => SKILLS.bua.cd(T), tron: (T) => SKILLS.tron.them(T), nangsao: (T) => SKILLS.nangsao.them(T), hasao: (T) => SKILLS.hasao.k(T),
  guongcong: (T) => SKILLS.guongcong.khang(T), dongbo: (T) => SKILLS.dongbo.v(T, 1), cauvong: (T) => SKILLS.cauvong.k(T), lophanung: (T) => SKILLS.lophanung.cham(T), tuthan: (T) => SKILLS.tuthan.tile(T) };

// ký hiệu buff = icon ChatGPT ic_<loại>.png (8 loại đều có ảnh) — thư viện ký hiệu vector vẽ code ĐÃ XOÁ (QUY-TAC-HINH mục 1)
// tương thích (skills3.js, tuongmoi-ui.js gọi veKyHieu): vẽ icon PNG ic_<k> quanh tâm, bán kính r
function veKyHieu(x, k, r) { const ic = REN.img('ic_' + k); if (ic) x.drawImage(ic, -r * 1.2, -r * 1.2, r * 2.4, r * 2.4); }
Object.assign(REN, {
  // tấm ký hiệu px (logic): thu nhỏ sẵn ic_<k>.png; chưa tải → canvas rỗng
  kyHieu(k, px, rong) {
    const ic = this.img('ic_' + k); if (!ic) return this.rong();
    const kk = this.s * this.dpr, n = Math.max(8, Math.round(px * kk)), key = 'kh|' + k + '|' + n + (rong ? 'r' : '');
    let c = this.cache[key]; if (c) return c;
    c = document.createElement('canvas'); c.width = c.height = n;
    const x = this.c2d(c);
    if (rong) x.globalAlpha = 0.5;
    this.veNho(x, ic, 0, 0, ic.width, ic.height, 0, 0, n, n);
    return (this.cache[key] = c);
  },
  // ảnh ký hiệu cho bảng DOM
  kyHieuURL(k) { return (typeof anhUrl === 'function' ? anhUrl('ic_' + k) : 'assets/' + 'ic_' + k + '.png'); },
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
      ctx.globalAlpha = 0.92; // chỉ chữ "+N" có viền tối (không tấm nền vẽ code)
      ctx.font = '900 8.5px ' + FONT.display; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#E9E8E2';
      ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(5,7,10,.9)'; ctx.strokeText('+' + (ds.length - 1), px + w / 2, y + 6.5);
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
    // ô = ảnh ChatGPT: đích hợp lệ = khung_chon (9 mảnh), đích trống/không nhận = h2_vong_xam mờ, nguồn = sup_ring (không viền/nét đứt vẽ code)
    const fr = this.img('khung_chon'), xam = this.img('h2_vong_xam'), vong = this.img('sup_ring');
    const oVuong = (o, hop, a) => {
      ctx.globalAlpha = a;
      if (hop) { if (fr && typeof KG !== 'undefined') KG.khung9(ctx, fr, o.x - cw / 2 + 3, o.y - ch / 2 + 3, cw - 6, ch - 6, 10); }
      else if (xam) this.anhGiua(ctx, xam, o.x, o.y, C * 0.6, 0, a * 0.6);
    };
    // đích: ô kề theo đúng luật (oHoTro = 4 ô thẳng, 5★ thêm 4 ô chéo); ụ Khiên/Tẩy: các ụ đang có khiên / đang dính hiệu ứng xấu
    let dich;
    if (SKILLS[T.id] && SKILLS[T.id].vai === 'ht' && typeof HOTRO !== 'undefined') dich = HOTRO.oDich(T).map(o => ({ o, N: B.t[o] && (HOTRO.nhan(T, B.t[o]) || !SKILLS[T.id].chiTC && B.t[o] !== T) ? B.t[o] : null })); // hỗ trợ: đúng hình ô (hotro.js)
    else if (k === 'khien') dich = B.t.filter(N => N && N !== T && N.khien > 0).map(N => ({ o: N.o, N }));
    else if (k === 'taylo') dich = B.t.filter(N => N && N !== T && (N.st.bang > 0 || N.st.da || N.st.lua > 0 || N.st.kep > 0)).map(N => ({ o: N.o, N }));
    else if (k === 'mana') dich = [];
    else { dich = []; const cc = T.o % 5, hh = (T.o / 5) | 0, cheo = loaiMoc(T.id) === 'ht' && mocChung(T, 5);
      for (const [dc, dh] of (SKILLS[T.id].huong ? SKILLS[T.id].huong(T) : [[-1, 0], [1, 0], [0, -1], [0, 1]].concat(cheo ? [[-1, -1], [1, -1], [-1, 1], [1, 1]] : []))) { const c2 = cc + dc, h2 = hh + dh; if (c2 >= 0 && c2 < 5 && h2 >= 0 && h2 < 3) dich.push({ o: h2 * 5 + c2, N: B.t[h2 * 5 + c2] }); } }
    // 1) ô đích: hợp lệ = tô 20% + viền màu; trống / không nhận = viền xám nét đứt
    for (const d of dich) { const hop = d.N && !d.N.st.da; oVuong(B.o[d.o], hop, vao * (hop ? 1 : 0.7)); }
    // 2) dây mảnh tĩnh qua khe: lõi màu 1 px alpha .7 trên lớp than 3 px; chạy 1 nhịp sáng ~150 ms khi vừa chạm
    for (const d of dich) {
      if (!d.N || d.N.st.da) continue;
      const n = B.o[d.o], dx = n.x - c.x, dy = n.y - c.y, L = Math.hypot(dx, dy) || 1, r0 = C * 0.36;
      const x0 = c.x + dx / L * r0, y0 = c.y + dy / L * r0, x1 = n.x - dx / L * r0, y1 = n.y - dy / L * r0;
      ctx.globalAlpha = vao * 0.85; this.tia(ctx, this.toMauA('sup_link', mau, 0.5), x0, y0, x1, y1, 6, 0, true); // dây = sup_link PNG tô màu
      const p = e / 0.15;
      if (p < 1) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - p) * tat; this.anhGiua(ctx, this.cham1(mau), x0 + (x1 - x0) * p, y0 + (y1 - y0) * p, 10); ctx.globalCompositeOperation = 'source-over'; }
    }
    // 3) ô nguồn: viền nét đứt trắng-xám 1.5 px bên trong ô (không dùng vàng)
    if (vong) this.anhGiua(ctx, vong, c.x, c.y, C * 1.02, 0, vao);
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
  const o = HOTRO.oDich(T), nhan = o.filter(i => HOTRO.nhan(T, B.t[i])).length, max = SKILLS[id].vai === 'ht' && T.ht !== undefined ? null : null;
  const capNote = o.some(i => B.t[i] && B.t[i].ht && B.t[i].ht.daMax && B.t[i].ht.daMax[k]) ? ' · CAP reached on a neighbour' : '';
  return { k, dong: BUFF[k].ten + ' +' + pc(hien) + ' (current)', tam: HOTRO.tamChu(T) + ' · affecting ' + nhan + '/' + o.length + ' cells' + capNote,
    tach: 'Base 1★ LV1 +' + pc(goc) + ' · stars +' + pc(saoV - goc) + ' · power-up +' + (lv - 1) + ' +' + pc(lvV - saoV) + (he > 1 ? ' · milestone ×' + he : '') };
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
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.max(0, a); // khiên chặn = ic_khien PNG bung ra
      const ic = R.img('ic_khien'); if (ic) R.anhGiua(ctx, ic, c.x, c.y, r * 2);
      ctx.restore();
    } else if (e.k === 'sach') {
      const u = tt / e.dai;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - u; ctx.translate(c.x, c.y - S * 0.1); ctx.rotate(u * 0.8);
      const r = S * (0.2 + 0.25 * VX.eo(u)), ic = R.co('ic_taylo', S * 0.9); if (ic) ctx.drawImage(ic, -r, -r, r * 2, r * 2); ctx.restore();
    } else if (e.k === 'mn') {
      const u = tt / e.dai; ctx.globalAlpha = u < 0.25 ? u / 0.25 : 1 - (u - 0.25) / 0.75;
      const ky = R.kyHieu('mana', 12); ctx.drawImage(ky, c.x - S * 0.32 - 6, c.y - S * 0.18 - u * 10 - 6, 12, 12);
    }
    ctx.globalAlpha = 1;
  }
};
