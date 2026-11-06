// TURRET MERGE — HỆ THỐNG HỖ TRỢ CHUNG (docs/demo-hop-tuong/thap-art/TU-VAN-VAI-TRO.txt mục 5 + 6)
//  · Ụ Hỗ trợ (vai 'ht') KHÔNG BAO GIỜ bắn; chỉ buff ô theo hình (mặc định 4 ô thẳng; Resonance Grid = 4 ô chéo).
//  · Không tự buff, không buff ụ Hỗ trợ khác; sk.chiTC = chỉ buff ụ Tấn công.
//  · Đường cong sao chung HOTRO.K (1★ 1.00 → 3★ 1.45 → 5★ 1.90 → 7★ 2.35) × cấp nâng (LV +6%/cấp); mốc 5★ = tiện ích phụ, 7★ = chiêu riêng (MOC_RIENG).
//  · Cùng 1 loại ụ hỗ trợ (nhiều bản sao) → lấy bản MẠNH NHẤT; khác loại cùng nhóm → cộng rồi KẸP TRẦN (HOTRO.CAP).
//  · Các nhóm không nhân nhau (cộng trong nhóm, kẹp trần) — trần riêng cho tốc bắn / sát thương / chí mạng / sát thương chí mạng / chậm / giết ngay.
//  · Sát thương có điều kiện (quái bị LỘ / đang chậm / trên vệt cầu vồng / đòn liên tiếp) tính CHUNG trần sát thương với buff sát thương thường.
//  · Suy yếu quái (nhận thêm sát thương) từ MỌI nguồn cộng lại, trần 25% (HOTRO.VULN).
// game.js gọi HOTRO.apDung(B) mỗi bước (sau mốc sao chung), HOTRO.vuln(E) + HOTRO.dkHeSo(T,E) + HOTRO.khiTrung(...) trong trung().
'use strict';

const HOTRO = {
  K: [1, 1, 1.2, 1.45, 1.65, 1.9, 2.1, 2.35],
  CAP: { toc: 0.45, dmg: 0.35, crit: 0.20, cdmg: 0.50, cham: 0.35, chet: 0.15 },
  VULN: 0.25, CHAM_TRUM: 0.15,
  // ĐỘ MẠNH THEO BẬC (06/11 đo bậc, tools/thap-sim-tier.js): hỗ trợ bậc cao buff mạnh hơn hẳn + được nới trần (trần nhóm × hệ số của nguồn bậc cao nhất)
  BAC: { trang: 1, xanh: 1.5, tim: 2.0, vang: 2.3, do: 2.8 },
  CAP_BAC: { trang: 1, xanh: 1.1, tim: 1.3, vang: 1.5, do: 1.7 },
  NHOM: ['toc', 'dmg', 'crit', 'cdmg', 'cham', 'chet'],
  // nhóm có điều kiện / đặc biệt (không vào T.buf thường): lo (vs quái LỘ), lanh (vs quái chậm), vet (vs quái trên cầu vồng), amp (mỗi đòn liên tiếp),
  //   soc (choáng khi chí mạng, giây), xuyen (chí mạng xuyên), khang (kháng khống chế, xác suất), ngNguong (ngưỡng giết ngay), chacCrit
  k(T) { const B = G.ban[T.ban]; return this.K[clamp(T.sao | 0, 1, 7)] * (this.BAC[T.bac] || 1) * (1 + 0.06 * (((B && B.lv[T.id]) || 1) - 1)) * this.kThe(B, T); },
  // cấp thẻ: giá trị buff theo bảng THE.kyNang (hỗ trợ) — thẻ chưa có mục: +½ % sát thương mỗi cấp như cũ
  kThe(B, T) { const h = KY_NANG_CAP[T.id] ? knHe(B, T.id) : 1 + 0.5 * (hsThe(B, T.id) - 1); return h; }, // bản sao Copycat của ụ hỗ trợ: buff giữ nguyên như trước (% sao chép chỉ áp vào sát thương)
  // TRẦN HIỆU DỤNG khi ụ T là nguồn duy nhất (chữ hiển thị = số thật sau kẹp trần — VFX P0, REVIEW-VFX-93 IX):
  //  nhóm có điều kiện (lo/lanh/vet/amp) chung trần sát thương · khang 35% × bậc · cham: đòn trúng kẹp 35% (khiTrung, không nhân bậc)
  tran(T, k) {
    const c = this.CAP_BAC[T && T.bac] || 1;
    if (k === 'khang') return 0.35 * c;
    if (k === 'cham') return this.CAP.cham;
    const g = k === 'lo' || k === 'lanh' || k === 'vet' || k === 'amp' ? 'dmg' : k;
    return this.CAP[g] != null ? this.CAP[g] * c : Infinity;
  },
  hd(T, k, v) { return Math.min(v, this.tran(T, k)); },
  laHT: (T) => !!(T && SKILLS[T.id] && SKILLS[T.id].vai === 'ht'),
  // ô tác dụng của ụ hỗ trợ (chỉ số ô) — 4 ô thẳng mặc định, sk.huong(T) cho hình riêng
  oDich(T) {
    const sk = SKILLS[T.id] || {}, c = T.o % 5, h = (T.o / 5) | 0, ds = [];
    if (sk.toanBan) { for (let i = 0; i < 15; i++) if (i !== T.o) ds.push(i); return ds; } // Pháo Đồng Bộ (Dana): cả bàn
    for (const [dc, dh] of (sk.huong ? sk.huong(T) : [[-1, 0], [1, 0], [0, -1], [0, 1]])) { const cc = c + dc, hh = h + dh; if (cc >= 0 && cc < 5 && hh >= 0 && hh < 3) ds.push(hh * 5 + cc); }
    return ds;
  },
  nhan(T, N) { // N có nhận buff của T không
    if (!N || N === T || N.st.da) return false;
    const vN = SKILLS[N.id] ? SKILLS[N.id].vai : '';
    if (vN === 'ht') return false;
    if (SKILLS[T.id].chiTC && vN !== 'tc') return false;
    return true;
  },
  // ụ kề có thuộc loại hỗ trợ id không (dùng cho kháng khống chế / Star Breaker…)
  keCo(B, N, id) { for (const T of B.t) if (T && T.id === id && !T.st.da && !(T.st.bang > 0) && this.oDich(T).includes(N.o)) return T; return null; },

  // nhịp ping nhẹ (xung ~180 ms) tới các ô ĐANG nhận buff — hiệu ứng có sẵn HU.ping
  nhip(G, B, T, dt, rgb, chuKy, quay) {
    if (quay) T.goc += dt * quay; else xoayDau(T, null, dt);
    T.nhip = (T.nhip || 0) + dt / chuKy;
    if (T.nhip >= 1) { T.nhip = 0; const sk0 = SKILLS[T.id], ke = this.oDich(T).map(o => B.t[o]).filter(N => !(sk0.toanBan && N && !sk0.khop(T, N))).filter(N => this.nhan(T, N) || (N && N !== T && SKILLS[T.id].hoTro && !SKILLS[T.id].chiTC && !N.st.da)); if (ke.length) G.hu.push({ k: 'ping', t: 0, song: 0.18, T, ke, rgb }); }
  },
  apDung(B, dt) {
    if (dt && B.halo > 0) B.halo = Math.max(0, B.halo - dt);
    const goc = new Map();
    for (const N of B.t) if (N) N.ht = null;
    for (const T of B.t) {
      if (!T || T.st.bang > 0 || T.st.da || T.st.cam > 0) continue; // cam: bị STATIC JAMMER câm (trum.js)
      const sk = SKILLS[T.id]; if (!sk.hoTro) continue;
      if (sk.vai !== 'ht') { for (const N of oHoTro(B, T)) if (N && N !== T && !N.st.da) sk.hoTro(G, T, N); continue; } // ụ không phải hỗ trợ (Sói 7★…): cộng thẳng như cũ
      for (const o of this.oDich(T)) {
        const N = B.t[o]; if (!this.nhan(T, N)) continue;
        const ra = {}; sk.hoTro(G, T, N, ra);
        let m = goc.get(N); if (!m) goc.set(N, m = {});
        for (const k in ra) { if (!(ra[k] > 0)) continue; const r = m[k] || (m[k] = {}); if (!r[T.id] || r[T.id].v < ra[k]) r[T.id] = { v: ra[k], T }; }
      }
    }
    for (const [N, m] of goc) {
      const ht = N.ht = { daMax: {} };
      let capB = 1; for (const k in m) for (const id in m[k]) capB = Math.max(capB, this.CAP_BAC[m[k][id].T.bac] || 1);
      ht.capDmg = this.CAP.dmg * capB; // trần sát thương (thường + có điều kiện) theo nguồn bậc cao nhất
      for (const k in m) {
        const ds = Object.values(m[k]);
        let tong = k === 'cham' || k === 'xuyen' || k === 'soc' || k === 'ngNguong' ? Math.max(...ds.map(d => d.v)) : ds.reduce((a, d) => a + d.v, 0);
        const capB = Math.max(...ds.map(d => this.CAP_BAC[d.T.bac] || 1)), cap = this.CAP[k] != null ? this.CAP[k] * capB : null;
        if (cap != null && tong > cap) { tong = cap; ht.daMax[k] = 1; }
        if (k === 'khang' && tong > 0.35 * capB) { tong = 0.35 * capB; ht.daMax[k] = 1; }
        if (this.NHOM.includes(k)) {
          if (k === 'cham') N.buf.cham = Math.max(N.buf.cham, tong); else N.buf[k] = (N.buf[k] || 0) + tong;
          const tl = ds.reduce((a, d) => a + d.v, 0) || 1;
          for (const d of ds) N.nguon.push({ k, v: k === 'cham' ? d.v : tong * d.v / tl, T: d.T });
        } else {
          ht[k] = tong;
          if (k === 'lo' || k === 'lanh' || k === 'vet' || k === 'amp') for (const d of ds) N.nguon.push({ k: 'dmg', v: Math.min(ht.capDmg, k === 'amp' ? d.v * 5 : d.v), T: d.T, dk: k }); // nhãn hiển thị: không vượt trần sát thương (đòn thật kẹp ở dkHe)
          if (k === 'khang') for (const d of ds) N.nguon.push({ k: 'khien', v: d.v, T: d.T, dk: k });
        }
      }
      if (ht.xuyen) N.buf.xuyen = Math.max(N.buf.xuyen || 0, ht.xuyen);
      ht.dmg = N.buf.dmg > 0 ? Math.min(ht.capDmg, (m.dmg ? Object.values(m.dmg).reduce((a, d) => a + d.v, 0) : 0)) : 0; // phần sát thương do hỗ trợ (để chia trần với sát thương có điều kiện)
      N.buf.dkHien = Math.min(Math.max(0, ht.capDmg - ht.dmg), (ht.lo || 0) + (ht.lanh || 0) + (ht.vet || 0) + (ht.amp || 0) * 3); // cho hào quang buff (buffvfx)
    }
  },
  // suy yếu quái: cộng mọi nguồn, trần 25%
  vuln(E) {
    let v = 0;
    if (E.yeu > 0 && E.tpT > 0) v += E.tpK || 0;   // Toxic Pool 5★ CORROSION
    if (E.vmT > 0) v += E.vmK || 0;                // Venom: dấu độc
    if (E.ywT > 0) v += E.ywK || 0;                // Time Bomb: nổ làm yếu
    if (E.cvT > 0) v += E.cvK || 0;                // Rainbow: vệt cầu vồng
    if (E.loT > 0 && E.loV) v += E.loV;            // Breaker 7★: lộ điểm yếu
    if (E.fbT > 0) v += 0.15;                      // (cũ) Frost 5★ FROSTBITE
    if (E.azT > 0) v += 0.10;                      // Cryo Reactor 7★ ABSOLUTE ZERO
    if (E.truyNa) v += 0.15;                       // Bounty Beacon: quái truy nã +15% (10 → 15, đo bậc 06/11)
    return Math.min(this.VULN, v);
  },
  // hệ số sát thương có điều kiện của ụ T lên quái E (đã chia trần với buff sát thương thường)
  dkHeSo(T, E) {
    const h = T.ht; if (!h) return 1;
    let b = 0;
    if (h.lo && E.loT > 0) b += h.lo;
    if (h.lanh && E.chamT > 0 && E.cham > 0) b += h.lanh;
    if (h.vet && E.cvT > 0) b += h.vet;
    if (h.amp) { // Amplifier: cộng dồn THEO TỪNG QUÁI (đòn liên tiếp vào cùng quái), nghỉ 1.5 s → về 0; 7★ nghỉ 3 s
      const M = T._amp || (T._amp = new Map()), x = M.get(E.uid), het = Math.max(h.ampGiu ? 3 : 1.5, 1.3 / Math.max(0.05, tocU(T))); // ụ bắn chậm (Revolver 0.6/s, Sniper…) vẫn cộng dồn được: cửa sổ ≥ 1 nhịp bắn
      const n = x && G.t - x.t < het ? Math.min(h.ampMax || 5, x.n + 1) : 0;
      M.set(E.uid, { n, t: G.t }); if (M.size > 40) for (const [k, v] of M) if (G.t - v.t > het) M.delete(k);
      b += h.amp * n;
    }
    if (!b) return 1;
    return 1 + Math.min(b, Math.max(0, (h.capDmg || this.CAP.dmg) - (h.dmg || 0)));
  },
  // sau khi tính chí mạng: chậm khi trúng (trần thường 35% / trùm 15%), giết ngay (ngưỡng máu), choáng khi chí mạng
  khiTrung(T, E, dmg, crit, o) {
    const b = T.buf, h = T.ht || {};
    if (b.cham > 0 && !E.d.khangCham) { E.chamT = Math.max(E.chamT, 2); E.cham = Math.max(E.cham, Math.min(b.cham, E.trum ? this.CHAM_TRUM : this.CAP.cham)); } // quái kháng chậm: không đồng hồ chậm (Ice Blade không coi là 'đang chậm')
    if (b.chet > 0 && Math.random() < b.chet) {
      if (E.trum) dmg += Math.min(dmg, E.max * 0.01); // trùm: không giết ngay — thêm 1 đòn nhỏ có trần 1% máu tối đa
      else if ((!E.d.to || h.chetTo) && (E.hp - dmg) / E.max < (E.d.to ? 0.15 : (h.ngNguong || 0.25))) { dmg = Math.max(dmg, E.hp + 1); VX.chem(E); }
    }
    if (T._dongChac && !E.trum && !E.d.khangCham) { T._dongChac = false; E.chan = Math.max(E.chan, 0.8); FX.no('bang_vo', E.x, E.y, 56, 0.35); } // Chiller 7★ FLASH FREEZE
    if (crit && h.soc && !E.trum && (!E.d.to || h.socTo) && !(E.socMien > G.t)) { E.chan = Math.max(E.chan, h.soc); E.socMien = G.t + 3; FX.vong1(E.x, E.y, 4, 22, '#ffd080', 0.25, 2); }
    return dmg;
  },
  // kháng khống chế (Mirror Gate kề): true = chặn
  khang(B, X) {
    const M = B && X && this.keCo(B, X, 'guongcong'); if (!M) return false;
    const p = Math.min(0.35, SKILLS.guongcong.khang(M));
    if (Math.random() >= p) return false;
    const c = B.o[X.o]; VX.chanKhien(B, X); FX.chu1(c.x, c.y - 18, 'RESIST', '#bff6ff', 11);
    return true;
  },
  // mô tả hình tác dụng cho bảng thông tin
  tamChu(T) { const sk = SKILLS[T.id] || {}; return sk.tamChu || ('4 adjacent cells (N/E/S/W)' + (sk.chiTC ? ' · Attack turrets only' : '')); },
};

// ---------- Halo: bất tử ngắn (quái thường lọt không mất tim) · trùm: chỉ giảm nhẹ ----------
const _lotHT = lot;
lot = function (E) {
  const p = G.duong[E.p], B = G.ban[p.ban], BT = G.che === 'coop' ? G.ban[0] : B;
  if (BT && BT.halo > 0 && !E.trum) { E.chet = true; E.tChet = 1; const [x, y] = viTri(p, p.len); FX.chu1(x - 20, y - 26, 'HALO', '#fff6c0', 16, 'to'); FX.vong1(x, y, 6, 40, '#fff6c0', 0.35, 3); return; }
  return _lotHT(E);
};
// Cryo Reactor 5★: trùm trong vùng lạnh tung chiêu chậm hơn 25%
const _capNhatTrumHT = capNhatTrum;
capNhatTrum = function (E, dt) { return _capNhatTrumHT(E, E.tempoT > 0 ? dt * 0.75 : dt); };
// Mirror Gate kề: kháng khống chế (trùm / đối thủ) trước khi khiên bị tiêu
const _chanKhienHT = chanKhien;
chanKhien = function (B, T) { if (HOTRO.khang(B, T)) return true; return _chanKhienHT(B, T); };

// Halo: chiêu TRÙM chỉ bị giảm nhẹ khi khiên bàn đến từ Halo (không huỷ hẳn): chiêu nhiều mục tiêu → còn trúng 1 ụ; Freezer → mọi ụ, nửa thời gian
const _thucHienChieuHT = thucHienChieu;
thucHienChieu = function (E, B) {
  if (!(B && B.halo > 0 && B.khien > 0 && B.khien <= B.halo + 0.05 && E && E.bao)) return _thucHienChieuHT(E, B);
  const k = B.khien, muc = E.bao.muc.slice();
  if (E.trum === 'freezer') { // Freezer nhiều ụ: Halo giữ mọi mục tiêu nhưng HALVE thời gian băng (game.js đọc E.bao.haloA)
    E.bao.haloA = true; B.khien = 0;
    try { _thucHienChieuHT(E, B); } finally { B.khien = k; }
    return;
  }
  for (const T of B.t) if (T && muc.slice(1).includes(T.uid)) { VX.chanKhien(B, T); const c = B.o[T.o]; FX.chu1(c.x, c.y - 18, TEXT.fx.blocked, '#fff6c0', 11); }
  E.bao.muc = muc.slice(0, 1);
  B.khien = 0;
  try { _thucHienChieuHT(E, B); } finally { B.khien = k; }
};
// Star Breaker: ghép ra ụ ở ô kề → bùng tốc 5 s · Shield Gen 7★: chặn xong +20% tốc 4 s
const _ghepHT = ghep;
ghep = function (B, a, b, ep) {
  const o = b ? b.o : null;
  // chỉ GHÉP THẬT (ghép thường, Merge King nâng sao) mới có bùng tốc — Teleporter / Copycat / Overclock / Scrap Forge không phải ghép
  const db = !ep && a && b ? ghepDBHop(a, b) : null, that = !db || db.sk === SKILLS.vughep;
  const r = _ghepHT(B, a, b, ep);
  const R = r && that && o != null ? B.t[o] : null;
  if (R) { const S = HOTRO.keCo(B, R, 'hasao'); if (S && HOTRO.nhan(S, R)) { R.tocT = Math.max(R.tocT, 5); R.tocV = Math.max(R.tocV || 0, SKILLS.hasao.dot(S)); nhanU(R, 'MERGE SURGE', '#ff4b3e'); } }
  return r;
};
const _chanKhienHT2 = chanKhien;
chanKhien = function (B, T) {
  const co = T && T.khien > 0;
  const r = _chanKhienHT2(B, T);
  if (r && co && !(T.khien > 0)) { const S = HOTRO.keCo(B, T, 'khien'); if (S && S.sao >= 7) { T.tocT = Math.max(T.tocT, 4); T.tocV = Math.max(T.tocV || 0, 0.2); } }
  return r;
};
// Venom 5★ CONTAGION: dấu độc chuyền sang quái gần nhất khi quái mang dấu chết
const _lanDocHT = lanDoc;
lanDoc = function (E, B) {
  _lanDocHT(E, B);
  if (!(E.vmLay > 0) || !(E.vmT > 0)) return;
  const Q = dsMucTieu(B || G.ban[0]).filter(Q => Q !== E && !Q.chet && !(Q.vmT > 1)).sort((a, b) => Math.hypot(a.x - E.x, a.y - E.y) - Math.hypot(b.x - E.x, b.y - E.y))[0];
  if (Q && Math.hypot(Q.x - E.x, Q.y - E.y) < 90) { Q.vmT = 5; Q.vmK = E.vmK; Q.vmLay = 1; Q.yeu = Math.max(Q.yeu, 5); G.hu.push({ k: 'tiaPhep', t: 0, song: 0.35, x0: E.x, y0: E.y, x1: Q.x, y1: Q.y, mau: '#9dff5a' }); }
};
// (bỏ SÀN TẤN CÔNG — DCDW: Triệu hồi / kết quả GHÉP / Twin Maker chọn ĐỀU NGẪU NHIÊN trong 5 thẻ bộ bài, không thiên vị vai trò)
