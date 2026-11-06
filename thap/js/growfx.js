// TURRET MERGE — GROW-UP / WAKE-UP kiểu DCDW: MỖI DẠNG ĐỔI CÁCH ĐÁNH (docs/demo-hop-tuong/DCDW-WAKEUP-GROWUP.md + thap-art/TU-VAN-WAKEUP.txt)
//  1) đạn/hiệu ứng trúng RIÊNG theo dạng (vẽ bằng code, hướng PHẢI, tròn tuyệt đối): đổi QUỸ ĐẠO hoặc HÌNH VA CHẠM, không chỉ sáng hơn
//  2) vòng đo 3 CUNG quanh ĐẦU súng (khe hở nằm dưới huy hiệu sao): cung đầy dần tới dạng sau, gần tới thì nháy 2 Hz
//  3) khoảnh khắc biến hình 0–650 ms: báo trước (vòng siết) → nén (đầu co 1–2 px, lõi nạp) → chớp + sóng tròn → đổi ảnh đầu _s1/_s2/_s3 → lắng + PHÁT BẮN ĐẦU
//     ĐÚNG 1 chữ ngắn (tên dạng, vd "Supernova!", không có thì "Awakened!") + âm thanh; ụ chu kỳ (nạp/xả) chỉ nảy 300 ms, chữ to chỉ lần đầu
//  4) giới hạn dễ nhìn: nét 2–4 px, hạt có trần, hiệu ứng ụ nằm trong ô, huy hiệu sao luôn ở trên cùng
// Nạp CUỐI (sau ui.js / tuongmoi-ui.js). Chạy được trong mô phỏng node (tools/thap-sim-moi.js) — phần vẽ tự bỏ qua khi không có document.
'use strict';

const GFX = { coDOM: typeof document !== 'undefined' };
const G_IDS = ['overlord', 'hopbi', 'tienhoa', 'lophanung', 'soi', 'orbital', 'cuongno', 'ngoisao', 'lienket', 'dongbo', 'hydra', 'cuuvi', 'ngaithoigian', 'ronglua', 'luoicheo'];
const gdU = (T) => T.gd || 1;
// hẹn 1 việc sau d giây THỜI GIAN TRẬN (đi theo tốc độ game, đúng luật) — dùng cho nhát chém thứ 2, tiếng vọng thời gian…
HU.gTre = { het(G, o) { if (!o.T || conTren(o.T)) { G.dangBan = o.T || null; o.fn(); } } };
function treU(T, d, fn) { G.hu.push({ k: 'gTre', t: 0, song: d, T, fn }); }
// ảnh hiệu ứng v2 (tờ G1–G4 / T): có → vẽ theo điểm neo (fxu-meta), trả true; chưa cắt → false (giữ cách vẽ cũ)
function gV(ctx, ten, x, y, w, goc, al) { return typeof FXU !== 'undefined' && FXU.co(ten) && FXU.veNeo(ctx, ten, x, y, w, goc, al); }
function gCo(ten) { return typeof FXU !== 'undefined' && FXU.co(ten) && !!REN.img(ten); } // có trong bảng + ảnh đã nạp
function gocTo(x, y, E) { return Math.atan2(E.y - y, E.x - x); }
// cột sáng từ trên trời xuống (x,y): chỉ dài 'dai' px phía trên mục tiêu, mờ dần lên trên → không đè ngang cả bàn ụ
function cotTroi(ctx, x, y, dai, w, mau, loi, al) { // = 2 lớp tia PNG (fx_laser_tia tô màu + lõi) — thay gradient + stroke vẽ code
  PX.tia(ctx, x, y - dai, x, y, w * 0.55, mau, al * 0.6);
  PX.tia(ctx, x, y - dai * 0.7, x, y, Math.max(1, w * 0.18), loi, al);
}

// =====================================================================================================
// 1) SPRITE ĐẠN VẼ BẰNG CODE (đăng ký vào REN.anh như ảnh thường → veDan / REN.co dùng được; vệt màu MAU_VET)
// =====================================================================================================
GFX.gen = {}; // tên sprite g_* → hàm lấy ẢNH PNG (ChatGPT) có sẵn, tô màu nếu cần — KHÔNG còn dựng hình bằng canvas path
function anhPNG(ten, png, vet, mau) {
  if (vet && typeof MAU_VET !== 'undefined') MAU_VET[ten] = vet;
  if (!GFX.coDOM) return;
  if (typeof FXU !== 'undefined' && FXU.THAY[ten] && FXU.co(FXU.THAY[ten])) return; // đã có ảnh riêng của ụ (tờ G/T, fxu.js THAY)
  GFX.gen[ten] = () => {
    const c = mau ? PX.mau(png, mau) : REN.img(png); if (!c) return null; // ảnh gốc chưa nạp → lần sau thử lại
    REN.anh[ten] = { _cv: c, complete: true, naturalWidth: c.width, naturalHeight: c.height };
    return c;
  };
  if (REN.CO_DINH) REN.CO_DINH.add(ten);
}
if (GFX.coDOM && typeof REN !== 'undefined') { // sprite g_*: không bao giờ tải file assets/g_*.png
  const imgGoc = REN.img;
  REN.img = function (ten) { if (GFX.gen[ten]) { const a = this.anh[ten]; return a && a._cv ? a._cv : GFX.gen[ten](); } return imgGoc.call(this, ten); };
}
GFX.taoSprite = function () {
  // (đã thay bằng PNG v2 ở fxu.js FXU.THAY: g_the_tim, g_xi_vang, g_ho_cam, g_ngoi, g_bot, g_bot_lon — chỉ giữ màu vệt)
  MAU_VET.g_the_tim = '#c77dff'; MAU_VET.g_xi_vang = '#ffb43a'; MAU_VET.g_ho_cam = '#ffa020'; MAU_VET.g_ngoi = '#ffc23a'; MAU_VET.g_bot = MAU_VET.g_bot_lon = '#7fdcff';
  anhPNG('g_hoi', 'fx_hopbi_trung', '#d9a8ff');               // Hộp Bí Ẩn dạng 2: chùm bài bí ẩn
  anhPNG('g_xi_nong', 'fx_cuuvi_dan', '#ff8a1a');             // Hộp Tiến Hoá dạng 2: xỉ nóng chảy (cầu lửa cam)
  anhPNG('g_kim_bang', 'fx_kiembang_dan', '#bff4ff');         // Lò Phản Ứng Băng: kim băng
  anhPNG('g_tia_lam', 'fx_bang_dan', '#9fe6ff');              // Vệ Tinh dạng 2: tia lam
  anhPNG('g_dan_cam', 'fx_cuongno_dan', '#ff7a2a');           // Cuồng Nộ dạng 2
  anhPNG('g_dan_do', 'fx_lien_dan', '#ff3a2a');               // Cuồng Nộ dạng 3
  anhPNG('g_sao_nho', 'fx_hasao_dan', '#ffe46b');             // Pháo Ngôi Sao: mảnh sao
  anhPNG('g_sao_choi', 'fx_anhsang_dan', '#fff0a0');          // Pháo Ngôi Sao dạng 3: sao chổi
  anhPNG('g_vong_tim', 'vong_xich', '#c77dff');               // Chuỗi Liên Kết: vòng xích tím
  anhPNG('g_xi_vang2', 'fx_haoquang_dan', '#ffe46b');         // Pháo Đồng Bộ: viên vàng có vành
  anhPNG('g_kim_ngoc', 'fx_tia_dan', '#2ee89a');              // Hydra dạng 1: kim ngọc lục bảo
  anhPNG('g_ho_xanh', 'fx_cuuvi_dan', '#7fd8ff', '#7fd8ff');  // Cửu Vĩ dạng 3: lửa hồ ly xanh (tô màu PNG)
  anhPNG('g_kim_gio', 'fx_khoathoigian_dan', '#ffd86a');      // Ngai Thời Gian: kim đồng hồ
  anhPNG('g_vong_ngoc', 'fx_vong_mong', '#45e0c8', '#45e0c8'); // Resonance Grid: vòng ngọc lam
};
// vệt hạt theo đạn (d.vetG = { mau, n hạt/giây, k }) — móc vào TVX.dan (mọi đạn đi qua mỗi bước)
const _tvxDan = TVX.dan;
TVX.dan = function (d, dt) {
  _tvxDan.call(this, d, dt);
  const v = d.vetG; if (!v || Math.random() > dt * (v.n || 24)) return;
  const yy = d.y - (d.z || 0);
  if (v.k === 'than') FX.hat1('than', d.x + rnd(-2, 2), yy + rnd(-2, 2), rnd(-10, 10), rnd(-20, -6), 0.4, 5, v.mau);
  else FX.hat1('lua', d.x + rnd(-2, 2), yy + rnd(-2, 2), rnd(-14, 14), rnd(-14, 14), 0.25, v.co || 6, v.mau);
};

// =====================================================================================================
// 2) VÒNG ĐO 3 CUNG quanh đầu súng
// =====================================================================================================
// tiến độ TRONG dạng hiện tại: f 0..1 tới dạng sau · dạng 3 có thời hạn → con (phần còn lại), conS (giây còn lại)
function tienDo(T) {
  const g = GROW[T.id], st = g.gd(T), s = st.s, v = st.v || [], p = clamp(st.p, 0, 1), B = G.ban[T.ban];
  let f;
  if (s === 1) f = p / (v[0] || 1); else if (s === 2) f = v[0] != null ? (p - v[0]) / ((v[1] != null ? v[1] : 1) - v[0]) : p; else f = 1;
  const r = { s, f: clamp(f, 0, 1) };
  switch (T.id) {
    case 'orbital': { const n = B ? demCungLoai(B, 'orbital') : 1; if (s === 1) r.f = Math.min(1, n / 2); else if (s === 2) r.f = 1; /* sẵn sàng: GHÉP 1 Vệ Tinh → bắn phá (cung nháy 2 Hz) */ if (s === 3 && T.thucT > 0) { r.con = clamp(T.thucT / (T.thucMax || 23), 0, 1); r.conS = T.thucT; } else if (s === 3 && B) { r.con = clamp(B.phao / 12, 0, 1); r.conS = B.phao; } break; }
    case 'cuongno': if (s === 1) r.f = 0; else if (s === 2) r.f = 0.5; else { const dai = ms(T, 5) ? 7 : 5; r.con = clamp(T.cuongT / dai, 0, 1); r.conS = T.cuongT; } break;
    case 'ngaithoigian': { const q = (T.sao - 1) / 6; r.f = s === 1 ? q / 0.5 : s === 2 ? (q - 0.5) / 0.5 : 1; break; }
    case 'cuuvi': if (s === 3) r.con = (T.duoi || 0) / 9; break;
    case 'overlord': if (s === 3) r.f = clamp((T.nap - 0.8) / 0.2, 0, 1); break;
    case 'lophanung': if (s === 3 && T.bungT > 0) { r.con = clamp(T.bungT / 1.6, 0, 1); r.conS = T.bungT; } break;
  }
  r.f = clamp(r.f, 0, 1);
  return r;
}
GFX.tienDo = tienDo;
// 3 cung = 3 dạng, ôm quanh đầu súng, chừa khe ở 2 huy hiệu góc trên (loại ụ trái · số sao phải) và ở đáy:
//   dạng 1 = cung TRÁI dâng từ đáy lên · dạng 2 = cung PHẢI dâng từ đáy lên · dạng 3 = cung "vương miện" trên đỉnh, sáng từ trái sang phải
function cungGauge(B, r) {
  const C = Math.min(B.cw, B.ch), d = C * 0.34, dx = B.cw / 2 - d / 2 - 1.5, dy = B.ch / 2 - d / 2 - 1.5;
  const aB = Math.atan2(dy, dx), h = Math.asin(Math.min(0.95, (d * 0.5 + 2.5) / r)), day = 10 * Math.PI / 180, P = Math.PI;
  let top0 = aB - P + h, top1 = -aB - h; if (top1 - top0 < 0.3) { const m = -P / 2; top0 = m - 0.15; top1 = m + 0.15; }
  return [[P / 2 + day, P + aB - h, false], [P / 2 - day, -aB + h, true], [top0, top1, false]];
}
function veGauge(ctx, T, S, al, R) {
  if (GFX.tat || !laGrow(T.id) || T.st.da) return;
  if (SKILLS[T.id] && SKILLS[T.id].bomDem) return veEvoBom(ctx, T, S, al, R); // Evolver: BOM HẸN GIỜ đếm ngược thay vòng nạp
  const g = GROW[T.id], m = g.mau, td = tienDo(T), s = T.gd || td.s, r = S * 0.455, t = VX.t, Bn = G.ban[T.ban];
  if (!Bn) return;
  const B = T.vxB, tt = B ? VX.t - B.t0 : 9;
  const siet = B && B.len && tt < 0.22 ? 1 - 0.08 * VX.eo(Math.min(1, tt / 0.1)) : 1; // báo trước: vòng SIẾT lại
  const R0 = r * siet, CG = cungGauge(Bn, R0 * (S > 0 ? 1 : 1));
  ctx.save(); // 3 cung = ảnh vòng fx_vong_mong cắt quạt (mặt nạ vô hình) — không còn arc/stroke vẽ code
  for (let i = 0; i < 3; i++) {
    const [a0, a1, nguoc] = CG[i];
    let k = 0, nhay = 1;
    if (s > i + 1) k = 1;
    else if (s === i + 1) { if (s < 3) { k = td.f; if (td.f >= 0.85) nhay = 0.55 + 0.45 * Math.sin(t * Math.PI * 4); } else { k = td.con != null ? td.con : 1; if (td.conS != null && td.conS < 0.8) nhay = Math.sin(t * Math.PI * 8) > 0 ? 1 : 0.35; } }
    if (s === 3 && (i < 2 || td.con == null)) continue; // dạng 3: không vẽ vòng đầy quanh ụ (chỉ cung thời hạn còn lại)
    if (k <= 0.003) continue;
    const a2 = a0 + (a1 - a0) * k;
    ctx.globalCompositeOperation = 'lighter'; PX.cung(ctx, 0, 0, R0, a0, a2, nguoc, s === i + 1 && s < 3 && td.f >= 0.85 ? 2.8 : 2.2, m, al * 0.9 * nhay);
  }
  // dạng 3: đốm sáng chạy vòng (sống động, nhỏ)
  // ụ ĐỎ có kỹ năng chủ động: vòng hồi chiêu xanh lá bên trong (đầy = thở nhẹ, chạm để dùng)
  const sk = SKILLS[T.id];
  if (sk && sk.chuDong && T.sao >= 3) {
    PX.vongHoi(ctx, T, T.nap, R0 - 4.2, al, t, true); // vòng hồi chiêu xanh lá chung (fxu.js)
  }
  ctx.restore(); ctx.globalAlpha = al; ctx.globalCompositeOperation = 'source-over';
}
// bỏ vòng tiến độ cũ dưới bệ (thay bằng vòng 3 cung) — giữ hào quang dạng 3
VX.duoiDau = function (ctx, T, S, al, R) {
  if (!laGrow(T.id) || T.st.da) return;
  const g = GROW[T.id], m = g.mau;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  if (T.gd === 3 && g.khongAnh && !g.dauMoi) { ctx.globalAlpha = al * (0.24 + 0.08 * Math.sin(this.t * 6)); REN.anhGiua(ctx, REN.cham1(m), 0, 0, S * 1.1); }
  if (T.gd === 3) {
    const B = T.vxB, vao = B && B.len ? clamp((this.t - B.t0 - 0.33) / 0.25, 0, 1) : 1;
    const aw = m === '#ff4b3e' || m === '#ff5040' || m === '#ffd23f' || m === '#ffe46b' ? REN.img('fx_awaken') : this.toMau(REN.img('fx_awaken'), m);
    if (aw) this.khung(ctx, aw, (this.t * 7 + (T.pha || 0)) % 6, 0, 0, S * 1.02, this.t * 0.6, al * 0.3 * vao);
  }
  ctx.restore(); ctx.globalAlpha = al;
};
// ---- EVOLVER (Moa): BOM HẸN GIỜ đếm ngược trên ụ (thay vòng nạp / vòng kỹ năng) · 7★ = bom XỊT → nổ hụt 1 lần + XÁC BOM ở giữa ụ ----
//  ảnh ChatGPT: evo_bom (huy hiệu bom, ô số trống) · evo_xacbom (xác bom cháy) · fx_evo_xit (dải 16 khung nổ hụt) — docs/demo-hop-tuong/tuvan/evolver/CAN-VE.json
//  chưa có ảnh → tạm fx_bomhen_hieu (bom đồng hồ có sẵn) / bản tối của nó / fx_bomhen_trung + fx_bui. CHỈ con số là chữ vẽ code (QUY-TAC-HINH mục 3).
const EVO = {
  co: { evo_bom: true, fx_evo_xit: true, evo_xacbom: true }, // ảnh ChatGPT đã về (đặt true khi file có trong assets — tránh tải thử file chưa có → 404)
  bom: () => EVO.co.evo_bom && REN.img('evo_bom') ? 'evo_bom' : 'fx_bomhen_hieu',
  xac: () => EVO.co.evo_xacbom && REN.img('evo_xacbom') ? 'evo_xacbom' : null,
  xit: () => EVO.co.fx_evo_xit && REN.img('fx_evo_xit') ? 'fx_evo_xit' : null,
  so: { evo_bom: [0, 0.035, 0.25], fx_bomhen_hieu: [-0.04, 0.06, 0.26] }, // ô số trên ảnh: [dx, dy, cỡ chữ] theo cỡ huy hiệu
};
function veEvoBom(ctx, T, S, al, R) {
  const t = VX.t;
  ctx.save(); ctx.globalCompositeOperation = 'source-over';
  if (T.sao >= LUAT.saoMax) { // 7★ xịt: nổ hụt (0–1.1 s sau khi lên 7★) rồi xác bom cố định ở giữa
    const u = T.xitV != null ? t - T.xitV : 9, ka = clamp((u - 0.3) / 0.35, 0, 1), xac = EVO.xac();
    if (ka > 0) {
      if (xac) R.anhGiua(ctx, xac, 0, S * 0.04, S * 0.56, 0, al * ka);
      else { const c = R.toMauA(EVO.bom(), '#1c1612', 0.72); if (c.width > 1) { ctx.globalAlpha = al * ka; R.anhGiua(ctx, c, 0, S * 0.04, S * 0.5); } }
      if (!xac && Math.sin(t * 2.1 + (T.pha || 0)) > 0.2) { ctx.globalAlpha = al * ka * 0.35; R.anhGiua(ctx, 'fx_bui', S * 0.06, -S * 0.16 - ((t * 9) % 6), S * 0.26); } // khói mỏng (ảnh tạm)
    }
    if (u < 1.1) {
      const xit = EVO.xit();
      if (xit) VX.khung(ctx, REN.img(xit), Math.min(15.99, u / 1.1 * 16), 0, 0, S * 1.25, 0, al);
      else {
        if (u < 0.35) R.anhGiua(ctx, 'fx_bomhen_trung', 0, 0, S * (0.35 + u * 1.4), 0, al * (1 - u / 0.35));
        const v = clamp((u - 0.12) / 0.98, 0, 1); R.anhGiua(ctx, 'fx_bui', 0, -S * 0.1 * v, S * (0.4 + 0.6 * v), 0, al * 0.85 * (1 - v));
      }
    }
    ctx.restore(); ctx.globalAlpha = al; return;
  }
  const con = SKILLS.tienhoa.con(T), n = Math.max(0, Math.ceil(con - 1e-6)), cuoi = con <= 3;
  const ph = cuoi ? (con * 2) % 1 : con % 1;                     // nhịp "tích": mỗi giây (3 s cuối: mỗi nửa giây)
  const nay = 1 + (cuoi ? 0.12 : 0.05) * Math.pow(Math.max(0, ph - 0.7) / 0.3, 2);
  const rung = cuoi ? Math.sin(t * 38) * 0.12 * (1.2 - con / 3) : 0;
  const d = S * 0.56 * nay, bx = S * 0.31, by = S * 0.27, ten = EVO.bom(), so = EVO.so[ten] || EVO.so.evo_bom;
  ctx.translate(bx, by); ctx.rotate(rung);
  R.anhGiua(ctx, ten, 0, 0, d, 0, al);
  if (cuoi && ph > 0.55) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * 0.35 * (ph - 0.55) / 0.45; R.anhGiua(ctx, R.cham1('#ff5a3c'), 0, 0, d * 1.1); ctx.globalCompositeOperation = 'source-over'; }
  const f = Math.round(d * so[2] * 10) / 10;
  ctx.globalAlpha = al; ctx.font = '900 ' + f + 'px ' + FONT.display; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(1.4, f * 0.2); ctx.strokeStyle = '#05070a'; ctx.strokeText(String(n), d * so[0], d * so[1]);
  ctx.fillStyle = cuoi ? '#ff6a4a' : '#ffe9a8'; ctx.fillText(String(n), d * so[0], d * so[1]);
  ctx.restore(); ctx.globalAlpha = al;
}
function moVeThem(id) {
  const sk = SKILLS[id]; if (!sk || sk._gfxVe) return;
  const goc = sk.veThem; sk._gfxVe = true;
  sk.veThem = function (ctx, T, S, al, R, B) { if (goc) { ctx.save(); goc.call(this, ctx, T, S, al, R, B); ctx.restore(); ctx.globalAlpha = al; ctx.globalCompositeOperation = 'source-over'; } veGauge(ctx, T, S, al, R); };
}

// =====================================================================================================
// 3) BIẾN HÌNH 0–650 ms (thời gian thực VX.t; luật chơi đổi dạng NGAY khi đạt ngưỡng — không có khoảng dừng sát thương)
// =====================================================================================================
VX.bien = function (T, tu, den) {
  const g = GROW[T.id], len = den > tu, daGap = !!T['_gfx' + den];
  const ngan = !len || (g.lap && daGap); // ụ chu kỳ: lần sau chỉ nảy 300 ms
  T.vxB = { t0: this.t, tu, den, len, ngan, dai: !len ? 0.26 : ngan ? 0.3 : 0.65 };
  if (!len) return;
  T['_gfx' + den] = true;
  const B = G.ban[T.ban], cB = () => { const X = G.ban[T.ban]; return X && X.t[T.o] === T ? X.o[T.o] : null; };
  const ta = !B || !B.ai || G.che === 'pvp';
  if (ta) SND.gNap();
  this.hen(ngan ? 0.08 : 0.22, () => { if (ta && cB()) SND.gKhoa(den === 3 && !ngan); });
  // phát bắn đầu tiên sau khi lắng (bằng chứng đã đổi cách đánh)
  this.hen(ngan ? 0.2 : 0.52, () => { if (cB() && T.cd > 0.02) T.cd = 0.01; });
  if (ngan) return;
  // ĐÚNG 1 chữ cho mỗi lần biến hình: tên riêng của dạng (Supernova!, Fused Head!…) nếu có, không thì 'Awakened!'
  // (không hiện chữ biến hình — người chơi tự khám phá; chỉ giữ hiệu ứng hình + âm thanh)
};
// 'WHITE WYRM' → 'White Wyrm!' (chữ hoa-thường ngắn như HUD)
function tenBien(s) { return s ? s.toLowerCase().replace(/(^|[\s-])(\S)/g, (a, b, c) => b + c.toUpperCase()).replace(/!*$/, '!') : ''; }
function goChuBien(T) { if (GFX.coDOM) for (let i = FX.chu.length - 1; i >= 0; i--) if (FX.chu[i].chuT === T) FX.chu.splice(i, 1); }
// chữ biến hình duy nhất của ụ: chống trùng (cùng ụ trong ~1 s chỉ 1 chữ — chữ mới thay chữ cũ), luôn vẽ trên cùng, kẹp trong màn
function chuBien(T, s, mau) {
  return; // bỏ nhãn chữ nổi trên ô (như nhanU) — biến hình đã có hiệu ứng ảnh
  if (G._treNhan) { VX.hen(G._treNhan, () => chuBien(T, s, mau)); return; } // đang ghép: hiện lúc kết quả lộ ra
  const B = G.ban[T.ban]; if (!B || B.t[T.o] !== T) return;
  if (GFX.coDOM && FX.chu.some(q => q.chuT === T && q.s === s && q.t < 1)) return; // cùng chữ vừa hiện (<1 s): giữ nguyên, không nhân đôi
  goChuBien(T); // mỗi ụ chỉ 1 chữ biến hình: chữ mới thay chữ cũ, không chồng
  T.nhanT = G.t; // chặn luôn nhãn kỹ năng thường (FUSED BEAM, METEOR…) ngay sau đó
  const c = B.o[T.o], n = FX.chu1(c.x, Math.max(34, c.y - 30), s, mau || TIERS[T.bac].mau, 11, 'nhan');
  if (n) { n.vien = TIERS[T.bac].mau; n.chuT = T; }
}
// vẽ: chữ biến hình chỉ hiện từ lúc đổi ảnh đầu (≥300 ms) và nằm trên mọi chữ khác
if (GFX.coDOM && typeof REN !== 'undefined' && REN.veChu && !REN._gfxChu) {
  const goc = REN.veChu; REN._gfxChu = true;
  REN.veChu = function (ctx) {
    const ds = FX.chu, an = (c) => { const T = c.chuT, B = T && T.vxB; return !!(B && B.len && !B.ngan && VX.t - B.t0 < 0.3); };
    const tren = ds.filter(c => c.chuT), con = ds.filter(c => !c.chuT);
    FX.chu = con.concat(tren.filter(c => !an(c)));
    try { goc.call(this, ctx); } finally { FX.chu = ds; }
  };
}
VX.veBien = function (ctx, T, C, al, da, R) {
  const B = T.vxB; if (!B) return false;
  const tt = this.t - B.t0;
  if (tt > B.dai) { T.vxB = null; return false; }
  const e = this.eo;
  if (!B.len) { const u = tt / B.dai; R.veDauLop(ctx, T.id, B.tu, C, al * (1 - u), 1, da); R.veDauLop(ctx, T.id, B.den, C, al * u, 1, da); return true; }
  if (B.ngan) { // 300 ms: nén 80 ms → chớp 60 ms → dạng mới nảy 1.06 → 1
    if (tt < 0.12) { const sc = 1 - 0.05 * e(tt / 0.08); R.veDauLop(ctx, T.id, B.tu, C, al, sc, da); if (tt > 0.08) R.veDauLop(ctx, T.id, B.tu, C, al * 0.8, sc, false, 'trang'); }
    if (tt >= 0.1) { const u = (tt - 0.1) / 0.2, sc = 0.94 + 0.12 * Math.sin(Math.min(1, u) * Math.PI * 0.75); R.veDauLop(ctx, T.id, B.den, C, al * e(u * 2), sc, da); }
    return true;
  }
  // 0–100 báo trước (đầu giữ nguyên, vòng ngoài siết — veBienNgoai) · 100–220 NÉN: co 5% + tối + lõi nạp
  if (tt < 0.33) {
    const u = clamp((tt - 0.1) / 0.12, 0, 1), sc = 1 - 0.05 * e(u), mo = tt < 0.22 ? 1 : 1 - (tt - 0.22) / 0.11;
    R.veDauLop(ctx, T.id, B.tu, C, al * mo, sc, da);
    if (u > 0) R.veDauLop(ctx, T.id, B.tu, C, al * 0.45 * u * mo, sc, da, 'den');
    // 220–330: bóng TRẮNG (chớp) của dạng cũ
    if (tt >= 0.22) R.veDauLop(ctx, T.id, B.tu, C, al * 0.9 * (1 - (tt - 0.22) / 0.11), sc, false, 'trang');
  }
  // 330–520: ĐỔI ẢNH ĐẦU — dạng mới bung 0.9 → 1.05 · 520–650: lắng về 1
  if (tt >= 0.3) {
    const u = (tt - 0.3) / 0.22, sc = tt < 0.52 ? 0.9 + 0.15 * e(u) : 1.05 - 0.05 * e((tt - 0.52) / 0.13);
    R.veDauLop(ctx, T.id, B.den, C, al * e(Math.min(1, u * 1.8)), sc, da);
    if (tt < 0.4) R.veDauLop(ctx, T.id, B.den, C, al * 0.7 * (1 - (tt - 0.3) / 0.1), sc, false, 'trang');
  }
  // lõi nạp (100–330)
  if (tt > 0.1 && tt < 0.33) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * Math.min(1, (tt - 0.1) / 0.12) * 0.8; R.anhGiua(ctx, R.cham1(GROW[T.id].mau), 0, 0, C * (0.18 + 0.3 * Math.min(1, (tt - 0.1) / 0.12))); ctx.restore(); }
  return true;
};
VX.veBienNgoai = function (ctx, T, x, y, S) {
  const B = T.vxB; if (!B || !B.len) return;
  const tt = this.t - B.t0, m = GROW[T.id].mau, e = this.eo, C = S / 0.98;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  if (B.ngan) {
    const u = tt / B.dai; this.vong(ctx, x, y, S * (0.42 + 0.5 * e(u)), 2.6 * (1 - u) + 0.6, m, (1 - u) * 0.85);
    if (tt < 0.14) { ctx.globalAlpha = (1 - tt / 0.14) * 0.45; REN.anhGiua(ctx, REN.cham1(m), x, y, S * 0.8); }
  } else {
    // 0–100: vòng báo trước SIẾT vào đầu
    if (tt < 0.12) { const u = tt / 0.1; this.vong(ctx, x, y, S * (0.62 - 0.18 * e(u)), 2, m, 0.25 + 0.6 * Math.min(1, u)); }
    // 100–220: 6 vệt năng lượng hút vào lõi
    if (tt > 0.08 && tt < 0.24) {
      const u = (tt - 0.08) / 0.16, al6 = 0.7 * (1 - Math.abs(u - 0.5) * 1.4);
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.3, r1 = S * (0.62 - 0.32 * u), r0 = r1 - S * 0.12; PX.tia(ctx, x + Math.cos(a) * r1, y + Math.sin(a) * r1, x + Math.cos(a) * r0, y + Math.sin(a) * r0, 2, m, al6); } // vệt hút = tia PNG
    }
    // 220–330: CHỚP + sóng tròn 0.4 → 1.1 ô + 8 gai
    if (tt >= 0.22 && tt < 0.56) {
      const u = (tt - 0.22) / 0.34, r = S * (0.4 + 0.7 * e(u));
      if (tt < 0.33) { ctx.globalAlpha = 0.55 * (1 - (tt - 0.22) / 0.11); REN.anhGiua(ctx, REN.cham1('#ffffff'), x, y, S * 1.05); }
      const nb = typeof FXU !== 'undefined' && ['fx_' + T.id + (B.den === 3 ? '_trung3' : '_trung'), 'fx_' + T.id + '_trung'].find(t => FXU.co(t));
      if (nb) { gV(ctx, nb, x, y, S * (0.6 + 0.5 * e(u)), u * 0.5, (1 - u) * 0.95); this.vong(ctx, x, y, r, 2.4 * (1 - u) + 0.6, m, (1 - u) * 0.6); } // nổ biến hình riêng của ụ (tờ G/T)
      else { this.vong(ctx, x, y, r, 3.6 * (1 - u) + 1, m, (1 - u) * 0.9);
      this.vong(ctx, x, y, r * 0.86, 1.4, '#ffffff', (1 - u) * 0.6); }
      if (!nb) for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + Math.PI / 8; PX.sao(ctx, x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.95, S * 0.16 * (1 - u) + 3, '#ffffff', (1 - u) * 0.8, a); } // 8 gai = lấp lánh PNG
      if (!B.no) { B.no = true; FX.tiaLua(x, y, 3, '#ffffff', 170, 8); FX.tiaLua(x, y, 6, m, 160, 9); }
    }
    // 330–650: quầng màu ụ lắng dần
    if (tt >= 0.33) { const u = (tt - 0.33) / 0.32; ctx.globalAlpha = (1 - u) * 0.35; REN.anhGiua(ctx, REN.cham1(m), x, y, S * 0.95); }
  }
  ctx.restore(); ctx.globalAlpha = 1;
  // huy hiệu sao + biểu tượng loại: lớp huy hiệu (nhandien.js) vẽ SAU VX.veDs → luôn trên cùng; bản cũ không có lớp đó thì tự vẽ lại
  if (typeof ND === 'undefined') REN.veHuyHieu(ctx, x + C * 0.31, y - C * 0.31, T.sao, C * 0.3);
};

// =====================================================================================================
// 4) ĐÒN ĐÁNH THEO DẠNG — 15 ụ
// =====================================================================================================
const ATK = {}; // mô tả cho bảng thông tin: ATK[id] = [dạng1, dạng2, dạng3]
const P = {};

// ---- OVERLORD (Jacheongbi): nạp im lặng → dạng 2 tia lửa điện nhảy mỗi 1.2 s → dạng 3 CỘT SÉT từ trời + vết cháy ----
ATK.overlord = ['Silent charge (static sparks)', 'Arc sparks jump to the nearest enemy every 1.2s (×1.2)', 'Thunder blast becomes a SKY PILLAR + scorch ring + 4 aftershock arcs'];
P.overlord = () => {
  const sk = SKILLS.overlord, cn = sk.capNhat;
  sk.capNhat = function (G, B, T, dt) {
    const r = cn.call(this, G, B, T, dt);
    if (T.gd === 2) {
      T._arc = (T._arc == null ? 0.5 : T._arc) - dt * (1 + T.buf.toc);
      if (T._arc <= 0) {
        T._arc = 1.2; const [x, y] = dauNong(T);
        let M = null, best = 180; for (const E of dsMucTieu(B)) if (!E.chet) { const L = Math.hypot(E.x - x, E.y - y); if (L < best) { best = L; M = E; } }
        if (M) { trung(M, dmgU(T) * 1.2, { B, mau: '#ffb090' }); G.hu.push({ k: 'gArc', t: 0, song: 0.16, x0: x, y0: y, E: M, x1: M.x, y1: M.y, seed: Math.random() * 99 }); FX.tiaLua(M.x, M.y, 3, '#ffb090', 120, 6); if (!B.ai) SND.gArc(); }
      }
    } else if (T.gd === 1 && GFX.coDOM && Math.random() < dt * 3) { const c = tamU(T); FX.hat1('lua', c.x + rnd(-10, 10), c.y + rnd(-10, 10), rnd(-20, 20), rnd(-20, 20), 0.15, 4, '#ff8a6a'); }
    return r;
  };
  const sc = HU.sam.cap;
  HU.sam.cap = function (G, o, dt) {
    const da = o.da, r = sc.call(this, G, o, dt);
    if (!da && o.da) { G.hu.push({ k: 'gCot', t: 0, song: 0.55, x: o.x, y: o.y, r: o.r, seed: Math.random() * 99 }); G.hu.push({ k: 'gXem', t: 0, song: 1.3, x: o.x, y: o.y, r: Math.min(64, o.r * 0.7) }); SND.gCot(); }
    return r;
  };
};
HU.gArc = { ve(ctx, o, R) { const u = o.t / o.song; if (o.E && !o.E.chet) { o.x1 = o.E.x; o.y1 = o.E.y; } ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - u * u; R.set(ctx, o.x0, o.y0, o.x1, o.y1, 12, o.seed + Math.floor(R.t / 0.04)); if (!gV(ctx, 'fx_overlord_dan2', o.x1, o.y1, 26 * (1 - u * 0.5), Math.atan2(o.y1 - o.y0, o.x1 - o.x0), 1 - u * u)) R.anhGiua(ctx, R.cham1('#ff6a4a'), o.x1, o.y1, 22 * (1 - u)); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; } };
HU.gCot = { // CỘT SÉT: tia dọc từ đỉnh màn xuống (rộng → mảnh), lõi trắng, 6 tia sét toả ở chân cột, sóng tròn
  ve(ctx, o, R) {
    const u = o.t / o.song, w = 54 * Math.pow(1 - u, 0.6) + 4, nhip = Math.floor(R.t / 0.04);
    ctx.globalCompositeOperation = 'lighter';
    if (gCo('fx_overlord_dan3')) { // cột sét = ảnh dan3 (gốc ở dưới, đặt dọc) + 4 dư chấn dacbiet quanh tâm (tờ G1)
      const im = REN.img('fx_overlord_dan3'), h = 150 * (1 - u * 0.25), ww = h * im.width / im.height;
      PX.ve(ctx, im, o.x, o.y - h * 0.45, ww, h, 0, 1 - u);
      if (gCo('fx_overlord_dacbiet')) for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + o.seed, L = o.r * (0.35 + 0.3 * VX.eo(u)); gV(ctx, 'fx_overlord_dacbiet', o.x + Math.cos(a) * L, o.y + Math.sin(a) * L, 30 * (1 - u * 0.4), a, (1 - u) * 0.9); }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; return;
    }
    cotTroi(ctx, o.x, o.y, 150, w, '#ff5040', '#ffd0ff', 1 - u);
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + o.seed, L = o.r * (0.45 + 0.35 * ((i * 37) % 10) / 10); R.set(ctx, o.x, o.y, o.x + Math.cos(a) * L, o.y + Math.sin(a) * L, 10, o.seed * 7 + nhip + i); }
    VX.vong(ctx, o.x, o.y, o.r * (0.3 + 0.7 * VX.eo(u * 1.4)), 3.5 * (1 - u) + 0.5, '#ff7a6a', (1 - u) * 0.9);
    R.anhGiua(ctx, R.cham1('#ffffff'), o.x, o.y, 70 * (1 - u));
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};
HU.gXem = { duoi: true, ve(ctx, o, R) { const u = o.t / o.song, a = u < 0.1 ? u / 0.1 : 1 - u; if (gV(ctx, 'fx_overlord_trung3', o.x, o.y, o.r * 2.1 * (0.85 + 0.15 * VX.eo(Math.min(1, u * 4))), 0, a * 0.85)) { ctx.globalAlpha = 1; return; } PX.bong(ctx, o.x, o.y, o.r * 2.2, o.r * 2.2, a * 0.5); ctx.globalCompositeOperation = 'lighter'; PX.vong(ctx, o.x, o.y, o.r, 2.5, '#ff5a2a', a * 0.7); ctx.globalAlpha = a * 0.35; R.anhGiua(ctx, R.cham1('#ff5a2a'), o.x, o.y, o.r * 1.4); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; } }; // vết cháy = PNG tô đen + vòng PNG

// ---- HỘP BÍ ẨN (Daron) / HỘP TIẾN HOÁ (Moa): ụ không bắn → thêm "đòn chọc" nhỏ đổi theo dạng, dạng 3 báo sắp mở ----
ATK.hopbi = ['Violet card shard poke (single, ~0.3× dmg)', '3-way spread of spinning "?" bolts at 3 enemies', 'Stops shooting — confetti sparks: about to open'];
ATK.tienhoa = ['Amber pellet poke', 'Molten gold slug: ember trail + 20 px splash', 'Thin golden spark BEAM (continuous ticks) — almost a new turret'];
function chocU(G, B, T, dt) {
  const s = gdU(T), c = tamU(T), dmg = hsU(T.id, T.sao, B) * 0.3 * (1 + T.buf.dmg) * (B.cuong > 0 ? 2 : 1), hop = T.id === 'hopbi'; // QA Tím: đòn chọc cũng ăn buff sát thương + RAGE ×2 như mọi ụ
  T._pk = (T._pk == null ? 0.6 : T._pk) - dt * (1 + T.buf.toc);
  if (s === 3 && hop) { if (T._pk <= 0) { T._pk = 0.25; if (GFX.coDOM) FX.hat1('lua', c.x + rnd(-12, 12), c.y + rnd(-12, 8), rnd(-40, 40), rnd(-80, -30), 0.5, 6, pick(['#ff4b8a', '#ffd23f', '#4bff9a', '#4fb8ff', '#c77dff'])); } return; }
  if (s === 3) { // Hộp Tiến Hoá: tia vàng mảnh liên tục
    if (T._pk > 0) return; T._pk = 0.2; const E = quaiDau(B); if (!E) return;
    trung(E, dmg * 0.22, { B, T, mau: '#ffe46b', im: Math.random() < 0.7 }); G.hu.push({ k: 'gTiaVang', t: 0, song: 0.24, T, E, x0: c.x, y0: c.y - 4, x1: E.x, y1: E.y, mong: true });
    return;
  }
  if (T._pk > 0) return;
  T._pk = s === 1 ? 1.4 : 1.2;
  const ds = s === 2 ? quaiTheoDau(B).slice(0, 3) : [quaiDau(B)];
  ds.forEach((E, i) => {
    if (!E) return;
    const a = gocTo(c.x, c.y, E) + (s === 2 ? (i - 1) * 0.35 : 0), x0 = c.x + Math.cos(a) * 10, y0 = c.y + Math.sin(a) * 10;
    const img = hop ? (s === 2 ? 'g_hoi' : 'g_the_tim') : (s === 2 ? 'g_xi_nong' : 'g_xi_vang'), mau = hop ? '#d9a8ff' : '#ffb43a';
    banDan({ img, x: x0, y: y0, muc: E, px: E.x, py: E.y, sp: s === 2 ? 420 : 480, co: s === 2 ? 18 : 15, B, T, vetG: s === 2 ? { mau: hop ? '#c77dff' : '#ff8a1a', n: 26, k: hop ? 'lua' : 'than' } : null,
      trung(G, d, M) {
        if (M) trung(M, dmg * (s === 2 ? 0.8 : 1), { B, mau });
        if (hop) { FX.vong1(d.x, d.y, 3, s === 2 ? 16 : 12, '#c77dff', 0.22, 2); if (s === 2) FX.chu1(d.x, d.y - 10, '?', '#e8c8ff', 13); }
        else if (s === 2) { noLan(d.x, d.y, 20, dmg * 0.4, B, { phu: true, mau }); FX.no('no_phao', d.x, d.y, 30, 0.2); FX.tiaLua(d.x, d.y, 3, '#ffb43a', 120, 6); }
        else FX.tiaLua(d.x, d.y, 2, '#ffd36a', 100, 5);
      } });
  });
  if (!B.ai) SND[hop ? 'gThe' : (s === 2 ? 'gNung' : 'gThe')]();
}
P.hopbi = P.tienhoa = (id) => { const sk = SKILLS[id], cn = sk.capNhat; sk.capNhat = function (G, B, T, dt) { const r = cn.call(this, G, B, T, dt); if (conTren(T) && B.t[T.o] === T) chocU(G, B, T, dt); return r; }; };
HU.gTiaVang = { // tia vàng mảnh (Hộp Tiến Hoá dạng 3 / Pháo Đồng Bộ dạng 3): lõi trắng 1.5 px + quầng vàng 3–4 px
  ve(ctx, o, R) {
    const u = o.t / o.song; if (o.E && !o.E.chet) { o.x1 = o.E.x; o.y1 = o.E.y; }
    if (o.T && conTren(o.T) && !o.mong) [o.x0, o.y0] = dauNong(o.T);
    ctx.globalCompositeOperation = 'lighter'; // tia vàng = 2 lớp tia PNG tô màu
    const id = o.T && o.T.id, tv = id && gCo('fx_' + id + '_tia') && REN.img('fx_' + id + '_tia');
    if (tv) { // tia riêng của ụ (B2: fx_tienhoa_tia / fx_dongbo_tia) cuộn dọc đường + đầu dan3 + nổ trung3
      ctx.globalAlpha = 1 - u; R.tia(ctx, tv, o.x0, o.y0, o.x1, o.y1, o.mong ? 9 : 12, R.t * 420);
      gV(ctx, 'fx_' + id + '_dan3', o.x1, o.y1, o.mong ? 20 : 26, Math.atan2(o.y1 - o.y0, o.x1 - o.x0), (1 - u) * 0.9);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; return;
    }
    PX.tia(ctx, o.x0, o.y0, o.x1, o.y1, o.mong ? 3 : 4, '#ffd23f', (1 - u) * (o.mong ? 0.6 : 0.85));
    PX.tia(ctx, o.x0, o.y0, o.x1, o.y1, 1.5, '#fffbe0', 1 - u);
    ctx.globalAlpha = 1 - u; R.anhGiua(ctx, R.cham1('#ffe46b'), o.x1, o.y1, (o.mong ? 14 : 22) * (1 - u * 0.5));
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};

// ---- LÒ PHẢN ỨNG BĂNG: nhịp hào quang = vòng sương → + kim băng → sàn lưới lục giác + BÃO BĂNG lấp lưới ----
ATK.lophanung = ['Each aura tick: a thin frost ring sweeps out', 'Ring + 3 ice needles fly to the slowest enemies', 'Hex frost lattice floor; ICE STORM fills it white, enemies shatter into shards'];
// sàn băng = ảnh PNG hu_vongbang (vòng gạch băng ChatGPT S4) + fx_lanhgia_hieu (xoáy sương) — thay lưới lục giác vẽ code
// chờ ảnh sàn lưới lục giác: raw_p4_fx_1 ô 'luoi_bang'
function veSanBang(ctx, x, y, r, al, goc) {
  if (gCo('fx_lophanung_hieu')) { const im = REN.img('fx_lophanung_hieu'); PX.ve(ctx, im, x, y, r * 2, r * 2 * im.height / im.width, goc * 0.2, al); return; } // lưới lục giác băng (tờ T21)
  const lg = REN.img('fx_lanhgia_hieu'); if (lg) PX.ve(ctx, lg, x, y, r * 2, r * 2 * lg.height / lg.width, goc, al * 0.55);
  const vb = REN.img('hu_vongbang'); if (vb) PX.ve(ctx, vb, x, y, r * 2.1, r * 2.1, -goc, al);
}
P.lophanung = () => {
  const sk = SKILLS.lophanung, cn = sk.capNhat, cd = sk.chuDong, vt = sk.veThem;
  sk.capNhat = function (G, B, T, dt) {
    const r = cn.call(this, G, B, T, dt);
    if (T.tick === 0.4) { // vừa có 1 nhịp hào quang
      const s = gdU(T), c = tamU(T), R0 = this.r(T);
      G.hu.push({ k: 'gSuong', t: 0, song: 0.45, x: c.x, y: c.y, r: R0, s });
      if (s >= 2) {
        const ds = quaiTrongTam(B, T, R0).filter(E => !E.chet).sort((a, b) => b.cham - a.cham).slice(0, 3);
        for (const E of ds) banDan({ img: 'g_kim_bang', x: c.x, y: c.y, muc: E, px: E.x, py: E.y, sp: 560, co: 16, B, T: null, trung(G, d, M) { FX.no('bang_vo', d.x, d.y, 22, 0.18); } });
        if (ds.length && !B.ai) SND.gBang();
      }
    }
    return r;
  };
  sk.chuDong = function (G, B, T) {
    const ok = cd.call(this, G, B, T);
    if (ok) { const c = tamU(T); G.hu.push({ k: 'gBaoLuoi', t: 0, song: 0.6, x: c.x, y: c.y, r: this.r(T) * 1.6 }); for (const E of quaiTrongTam(B, T, this.r(T) * 1.6)) for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; FX.hat1('lua', E.x, E.y, Math.cos(a) * 140, Math.sin(a) * 140, 0.3, 7, '#dffaff'); } }
    return ok;
  };
  sk.veThem = function (ctx, T, S, al, R, B) {
    vt.call(this, ctx, T, S, al, R, B);
    if (gdU(T) === 3 && GFX.coDOM) { const r = Math.min(this.r(T), S * 0.95); ctx.globalCompositeOperation = 'lighter'; veSanBang(ctx, 0, 0, r, al * (0.3 + 0.1 * Math.sin(R.t * Math.PI * 2)), R.t * 0.15); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = al; }
  };
};
HU.gSuong = { duoi: true, ve(ctx, o, R) { const u = o.t / o.song, r = o.r * (0.25 + 0.75 * VX.eo(u)); ctx.globalCompositeOperation = 'lighter'; if (o.s >= 2 && gV(ctx, 'fx_lophanung_dacbiet', o.x, o.y, r * 1.8, 0, (1 - u) * 0.6)) { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; return; } VX.vong(ctx, o.x, o.y, r, o.s >= 3 ? 3 : 2, o.s >= 3 ? '#ffffff' : '#bff4ff', (1 - u) * (o.s >= 2 ? 0.55 : 0.4)); if (o.s >= 3) VX.vong(ctx, o.x, o.y, r * 0.9, 1.5, '#7fdcff', (1 - u) * 0.5); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; } };
HU.gBaoLuoi = { ve(ctx, o, R) { if (!GFX.coDOM) return; const u = o.t / o.song; ctx.globalCompositeOperation = 'lighter'; veSanBang(ctx, o.x, o.y, o.r, (1 - u) * 0.85, u); if (gV(ctx, 'fx_lophanung_dan3', o.x, o.y, o.r * 1.3, u * Math.PI, (1 - u) * 0.8)) { ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; return; } ctx.globalAlpha = (1 - u) * 0.35; R.anhGiua(ctx, R.cham1('#dffaff'), o.x, o.y, o.r * 2); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; } };

// ---- SÓI MÁY (Warwolf): 1 vuốt cam → 2 vuốt chéo (lao tới) → THỨC TỈNH: 2 nhát chí mạng siêu nhanh, 3 vệt đỏ thẫm, mỗi 4 đòn LƯỚT tới ----
ATK.soi = ['(unused — no Pup stage any more)', 'NORMAL Werewolf: X-shaped double slash (two hits), head lunges', 'AWAKENED Werewolf (chance on summon/merge): twin fast always-crit slashes, triple crimson claw marks, wide frenzy splash, every 4th hit DASHES to the target'];
P.soi = () => {
  const sk = SKILLS.soi;
  sk.ban = function (G, B, T, E) {
    const s = gdU(T), dmg = dmgU(T), c = tamU(T);
    T.chop = 0.08;
    const hit = (k, n, mau) => { if (E.chet) return; trung(E, dmg * k, { B }); noLan(E.x, E.y, T.thuc ? 32 : 22, dmg * (T.thuc ? 0.6 : 0.4) * k, B, { phu: true }); G.hu.push({ k: 'gVuot', t: 0, song: n === 3 ? 0.26 : 0.22, x: E.x, y: E.y, goc: T.goc, n, mau, lech: Math.random() }); };
    if (s === 1) { T.rv += 300; hit(1, 1, '#ffb43a'); SND.gVuot(1); }
    else if (s === 2) { T.rv += 520; hit(0.5, 2, '#ff6a2a'); treU(T, 0.07, () => hit(0.5, 2, '#ff6a2a')); SND.gVuot(2); }
    else {
      T.rv += 420; hit(0.55, 3, '#ff2a3a'); treU(T, 0.06, () => hit(0.55, 3, '#ff2a3a')); SND.gVuot(3);
      if (T.banLan % 4 === 0) { G.hu.push({ k: 'gLuot', t: 0, song: 0.24, x0: c.x, y0: c.y, x1: E.x, y1: E.y, T }); if (TVX.duocLac(0.8)) FX.lac(1.4); }
    }
  };
};
HU.gVuot = { // vệt vuốt: cung tròn (bán kính 15–18 px) quét nhanh; n=2 chéo chữ X, n=3 ba vệt song song lõi trắng
  ve(ctx, o, R) {
    const u = o.t / o.song, quet = Math.min(1, u * 4), a = 1 - Math.max(0, (u - 0.35) / 0.65);
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.goc + Math.PI / 2); ctx.globalCompositeOperation = 'lighter';
    // vệt vuốt = ảnh PNG fx_soi_hieu (3 vết cào ChatGPT) tô màu, mở dần bằng phóng + mờ (thay cung arc vẽ code)
    const v23 = o.n >= 2 && gCo('fx_soi_dan' + o.n) && REN.img('fx_soi_dan' + o.n);
    if (v23) { const k = (o.n === 3 ? 44 : 36) * (0.6 + 0.4 * quet); PX.ve(ctx, v23, 0, 0, k, k * v23.height / v23.width, -Math.PI / 2, a); ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; return; } // tờ G2
    const vu = REN.img('fx_soi_hieu'), vm = o.mau && o.mau !== '#ff4b3e' ? PX.mau('fx_soi_hieu', o.mau) : vu, k = (o.n === 3 ? 40 : 32) * (0.6 + 0.4 * quet);
    if (vm) { if (o.n === 2) { PX.ve(ctx, vm, 0, 0, k, k, 0.55, a); PX.ve(ctx, vm, 0, 0, k, k, -0.55 + Math.PI / 2, a); } else PX.ve(ctx, vm, 0, 0, k, k, o.n === 1 ? 0 : 0.25, a); }
    ctx.globalAlpha = a * 0.4; R.anhGiua(ctx, R.cham1(o.mau), 0, 0, (o.n === 3 ? 30 : 22) * (1 - u * 0.5));
    ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.lineCap = 'butt';
  },
};
HU.gLuot = { // lướt tới: 3 bóng đầu sói đỏ mờ dọc đường đi + vệt
  ve(ctx, o, R) {
    const u = o.t / o.song, T = o.T; ctx.globalCompositeOperation = 'lighter';
    PX.tia(ctx, o.x0, o.y0, o.x1, o.y1, 4, '#ff2a3a', (1 - u) * 0.6);
    if (gCo('fx_soi_dacbiet')) { for (let i = 1; i <= 3; i++) { const k = i / 3.5; gV(ctx, 'fx_soi_dacbiet', o.x0 + (o.x1 - o.x0) * k, o.y0 + (o.y1 - o.y0) * k, 34, Math.atan2(o.y1 - o.y0, o.x1 - o.x0), (1 - u) * 0.5 * (1 - k * 0.4)); } }
    else if (T && conTren(T)) for (let i = 1; i <= 3; i++) { const k = i / 3.5, x = o.x0 + (o.x1 - o.x0) * k, y = o.y0 + (o.y1 - o.y0) * k; ctx.globalAlpha = (1 - u) * 0.35 * (1 - k * 0.4); ctx.save(); ctx.translate(x, y); ctx.rotate(T.goc); R.veDauLop(ctx, 'soi', 3, G.ban[T.ban].cw * 0.8, (1 - u) * 0.4, 1, false, 'trang'); ctx.restore(); }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};

// ---- VỆ TINH (Mafdet): tia lam → tia + vòng ngắm trước khi trúng → GHÉP: mọi Vệ Tinh thức tỉnh, mỗi phát = 3 GIÁO TRỜI có tâm ngắm đỏ (không nổ lan) ----
// (QA vàng-đỏ: Vệ Tinh là ụ ĐẶC BIỆT không bắn thường — chữ cũ tả đạn từng dạng không có thật; P.orbital.ban bên dưới không bao giờ chạy)
ATK.orbital = ['STANDBY: no normal shots', 'UPLINK: 2+ Orbitals on board — merging two awakens every Orbital', 'AWAKENED (23s after an Orbital merge, every Orbital on the board): a salvo of 3–7 sky bombs every 1.8s, 34 px blasts'];
P.orbital = () => {
  const sk = SKILLS.orbital, bg = sk.ban;
  sk.ban = function (G, B, T, E) {
    const s = gdU(T);
    if (s === 1) return bg.call(this, G, B, T, E);
    const dmg = dmgU(T);
    if (s === 2) {
      giat(T, 0.5); chopNong(T, 22); SND.lien();
      G.hu.push({ k: 'gTam', t: 0, song: 0.22, E, mau: '#9fe6ff' });
      danThang(B, T, E, 'g_tia_lam', 620, 24, (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#9fe6ff' }); FX.no('dien', d.x, d.y, 30, 0.2); FX.vong1(d.x, d.y, 4, 18, '#9fe6ff', 0.22, 2); });
      return;
    }
    giat(T, 0.7); chopNong(T, 26);
    const ds = [E, ...quaiTheoDau(B).filter(Q => Q !== E)].slice(0, 3);
    while (ds.length < 3) ds.push(E);
    ds.forEach((Q, i) => G.hu.push({ k: 'gGiao', t: -i * 0.07, song: 0.6, E: Q, B, T, dmg: dmg * 0.34, x: Q.x + rnd(-4, 4), y: Q.y }));
    if (!B.ai) SND.gTam();
  };
};
HU.gTam = { // vòng ngắm = ảnh PNG fx_tia_hieu (tâm ngắm ChatGPT) tô màu, xoay + co về quái (thay vòng + 4 vạch vẽ code)
  ve(ctx, o, R) { const E = o.E; if (!E) return; const u = o.t / o.song, r = 22 - 10 * VX.eo(u); ctx.globalCompositeOperation = 'lighter';
    const im = gCo('fx_orbital_dacbiet') ? REN.img('fx_orbital_dacbiet') : PX.mau('fx_tia_hieu', o.mau); if (im) PX.ve(ctx, im, E.x, E.y, r * 2.4, r * 2.4 * im.height / im.width, u * 1.5, 0.9 * (1 - u * 0.5));
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; },
};
HU.gGiao = { // giáo trời: 0–0.25 s tâm ngắm ĐỎ bám quái → tia dọc từ đỉnh màn → trúng 1 quái (theo DCDW: bom to nhưng không nổ lan)
  cap(G, o) {
    if (o.t < 0) return false;
    if (!o.da && o.E && !o.E.chet) { o.x = o.E.x; o.y = o.E.y; }
    if (!o.da && o.t >= 0.25) {
      o.da = true; if (o.E && !o.E.chet) trung(o.E, o.dmg, { B: o.B, mau: '#9fe6ff' });
      FX.no('dien', o.x, o.y, 30, 0.2); FX.tiaLua(o.x, o.y, 3, '#dff8ff', 150, 7); if (!o.B.ai) SND.gLance();
    }
    return false;
  },
  ve(ctx, o, R) {
    if (o.t < 0) return;
    ctx.globalCompositeOperation = 'lighter';
    if (!o.da) { const u = o.t / 0.25, r = 20 - 8 * VX.eo(u), im = REN.img(gCo('fx_orbital_dacbiet') ? 'fx_orbital_dacbiet' : 'fx_nhieusong_hieu'); if (im) PX.ve(ctx, im, o.x, o.y, r * 2.6, r * 2.6 * im.height / im.width, -u * 2, 0.95); } // tâm ngắm đỏ = PNG
    else {
      const u = (o.t - 0.25) / 0.35, a = Math.max(0, 1 - u), y1 = o.y;
      if (gCo('fx_orbital_dan3')) { // giáo trời = ảnh dan3 (đặt dọc) + nổ trung3 (tờ G1)
        const im = REN.img('fx_orbital_dan3'), h = 110, ww = h * im.width / im.height;
        PX.ve(ctx, im, o.x, y1 - h * 0.42, ww, h, 0, a);
        gV(ctx, 'fx_orbital_trung3', o.x, o.y, 46 * (0.7 + 0.3 * VX.eo(Math.min(1, u * 2))), 0, a);
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; return;
      }
      cotTroi(ctx, o.x, y1, 110, 12 * a + 3, '#5fd4ff', '#dff8ff', a);
      VX.vong(ctx, o.x, o.y, 8 + 22 * VX.eo(u * 1.5), 3 * a + 0.5, '#9fe6ff', a * 0.9);
      R.anhGiua(ctx, R.cham1('#9fe6ff'), o.x, o.y, 26 * a);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};

// ---- CUỒNG NỘ (Danu): vạch vàng → đạn cam + tàn lửa → FRENZY: 2 nòng xen kẽ đạn đỏ-trắng, chớp đôi, vỏ đạn văng, nổ lửa nhỏ ----
ATK.cuongno = ['Yellow tracer', 'RAGE: orange rounds with an ember trail', 'FRENZY: twin alternating red-white rounds, double muzzle flash, ejected casings, fire-burst hits'];
P.cuongno = () => {
  const sk = SKILLS.cuongno, bg = sk.ban;
  sk.ban = function (G, B, T, E) {
    const s = gdU(T); if (s === 1) return bg.call(this, G, B, T, E);
    const dmg = dmgU(T);
    if (s === 2) {
      giat(T, 0.5); const [x, y] = dauNong(T); FX.no('chop_nong', x, y, 24, 0.07, T.goc); SND.lien();
      danThang(B, T, E, 'g_dan_cam', 700, 16, (G, d, M) => { if (M) trung(M, dmg, { B }); FX.tiaLua(d.x, d.y, 2, '#ff7a3a', 120, 7); }).vetG = { mau: '#ff7a2a', n: 30, k: 'than' };
      return;
    }
    giat(T, 0.35); T._nong = -(T._nong || 1);
    const [x, y] = dauNong(T), nx = -Math.sin(T.goc) * 4 * T._nong, ny = Math.cos(T.goc) * 4 * T._nong;
    FX.no('chop_nong', x + nx, y + ny, 26, 0.07, T.goc + rnd(-0.08, 0.08)); FX.no('chop_nong', x - nx * 0.5, y - ny * 0.5, 18, 0.06, T.goc);
    if (GFX.coDOM) { const c = tamU(T), sx = -Math.sin(T.goc), sy = Math.cos(T.goc); FX.hat1('lua', c.x + sx * 6, c.y + sy * 6, sx * 70 + rnd(-10, 10), sy * 70 - 30, 0.35, 4, '#ffd060'); }
    SND.lien();
    banDan({ img: 'g_dan_do', x: x + nx, y: y + ny, muc: E, px: E.x, py: E.y, sp: 780, co: 19, B, T, trung(G, d, M) { if (M) trung(M, dmg, { B, mau: '#ffb0a0' }); FX.no('no_phao', d.x, d.y, 24, 0.16); FX.tiaLua(d.x, d.y, 2, '#ff4a2a', 130, 6); } });
  };
};

// ---- PHÁO NGÔI SAO (Darby): mảnh sao → cặp sao + vệt lấp lánh → SUPERNOVA: sao chổi + nổ hình sao, cứ phát thứ 5 gọi THIÊN THẠCH ----
ATK.ngoisao = ['Small star shard', 'NOVA: star shards in PAIRS with a sparkle trail', 'SUPERNOVA: shooting-star comets, star-shaped bursts; every 5th shot a METEOR falls on the toughest enemy'];
P.ngoisao = () => {
  const sk = SKILLS.ngoisao;
  sk.ban = function (G, B, T, E) {
    const s = gdU(T), dmg = dmgU(T);
    giat(T, 0.7); chopNong(T, s === 3 ? 30 : 22); SND.gSao(s);
    if (s === 1) { danThang(B, T, E, 'g_sao_nho', 560, 15, (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#ffe46b' }); G.hu.push({ k: 'gLap', t: 0, song: 0.22, x: d.x, y: d.y, r: 10 }); }); return; }
    if (s === 2) {
      const ban1 = (lech) => { if (E.chet || !conTren(T)) return; const [x, y] = dauNong(T), nx = -Math.sin(T.goc) * lech, ny = Math.cos(T.goc) * lech;
        banDan({ img: 'g_sao_nho', x: x + nx, y: y + ny, muc: E, px: E.x, py: E.y, sp: 600, co: 15, B, T, vetG: { mau: '#fff0a0', n: 34, co: 5 }, trung(G, d, M) { if (M) trung(M, dmg * 0.5, { B, mau: '#ffe46b' }); G.hu.push({ k: 'gLap', t: 0, song: 0.24, x: d.x, y: d.y, r: 12 }); } }); };
      ban1(4); treU(T, 0.06, () => ban1(-4)); return;
    }
    T._sc = (T._sc || 0) + 1;
    if (T._sc % 5 === 0) { const M = quaiMauNhat(B) || E; G.hu.push({ k: 'gThienThach', t: 0, song: 0.42, E: M, B, T, dmg: dmg * 1.2, x: M.x, y: M.y }); nhanU(T, 'METEOR', '#ffe46b'); return; }
    danThang(B, T, E, 'g_sao_choi', 640, 32, (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#fff0a0' }); G.hu.push({ k: 'gNoSao', t: 0, song: 0.32, x: d.x, y: d.y }); FX.tiaLua(d.x, d.y, 5, '#ffe46b', 170, 7); }).vetG = { mau: '#fff6c0', n: 40, co: 6 };
  };
};
HU.gLap = { ve(ctx, o, R) { const u = o.t / o.song, r = o.r * (0.6 + 0.6 * u); ctx.globalCompositeOperation = 'lighter'; if (gV(ctx, 'fx_ngoisao_trung', o.x, o.y, r * 2.6, u * 0.6, 1 - u)) { ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; return; } PX.sao(ctx, o.x, o.y, r * 2, '#fff6c0', 1 - u, u); ctx.globalAlpha = 1 - u; R.anhGiua(ctx, R.cham1('#ffe46b'), o.x, o.y, r * 2); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; } }; // lấp lánh = fx_tia_sao PNG
HU.gNoSao = { // nổ sao = ảnh PNG fx_hasao_trung (ngôi sao vỡ ChatGPT) nở ra + 5 lấp lánh fx_tia_sao toả (thay sao5 vẽ code)
  ve(ctx, o, R) { const u = o.t / o.song, r = 8 + 22 * VX.eo(u), a = 1 - u; ctx.globalCompositeOperation = 'lighter';
    const im = REN.img(gCo('fx_ngoisao_trung3') ? 'fx_ngoisao_trung3' : 'fx_hasao_trung'); if (im) PX.ve(ctx, im, o.x, o.y, r * 2.2, r * 2.2 * im.height / im.width, u * 0.6, a);
    for (let i = 0; i < 5; i++) { const g = -Math.PI / 2 + i * Math.PI * 2 / 5 + u * 0.6, q = r * 1.25; PX.sao(ctx, o.x + Math.cos(g) * q, o.y + Math.sin(g) * q, 8 * a + 3, '#fff6c0', a); }
    ctx.globalAlpha = a * 0.6; R.anhGiua(ctx, R.cham1('#ffe46b'), o.x, o.y, r * 2.2); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; },
};
HU.gThienThach = { // thiên thạch: rơi chéo từ trên-phải xuống (0.3 s, có vòng báo trên đất) → nổ sao + lan 36 px
  cap(G, o) {
    if (!o.da && o.E && !o.E.chet) { o.x = o.E.x; o.y = o.E.y; }
    if (!o.da && o.t >= 0.3) { o.da = true; if (o.E && !o.E.chet) trung(o.E, o.dmg, { B: o.B, mau: '#fff0a0' }); noLan(o.x, o.y, 36, o.dmg * 0.4, o.B, { phu: true, mau: '#ffe46b' }); FX.no('no_phao', o.x, o.y, 64, 0.3); FX.tiaLua(o.x, o.y, 8, '#ffe46b', 200, 8); G.hu.push({ k: 'gNoSao', t: 0, song: 0.38, x: o.x, y: o.y }); if (TVX.duocLac(0.8)) FX.lac(1.5); SND.no(0.5); }
    return false;
  },
  ve(ctx, o, R) {
    if (o.da) return; const u = o.t / 0.3, x = o.x + (1 - u) * 90, y = o.y - (1 - u) * 160;
    if (gCo('fx_ngoisao_dacbiet')) { // tờ G1: bóng báo (fx_ngoisao_hieu) trên đất + thiên thạch rơi chéo (ảnh hướng xuống-phải → lật ngang)
      gV(ctx, 'fx_ngoisao_hieu', o.x, o.y, 34 - 8 * u, 0, 0.5 + 0.4 * u);
      const im = REN.img('fx_ngoisao_dacbiet'), w = 46; ctx.save(); ctx.translate(x, y); ctx.scale(-1, 1); PX.ve(ctx, im, 0, 0, w, w * im.height / im.width, 0.15, 1); ctx.restore();
      ctx.globalAlpha = 1; return;
    }
    ctx.globalCompositeOperation = 'lighter'; VX.vong(ctx, o.x, o.y, 16 - 6 * u, 2, '#ffe46b', 0.5 + 0.4 * u);
    ctx.globalAlpha = 1; ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(160, -90)); const im = REN.co('g_sao_choi', 54); if (im) ctx.drawImage(im, -27, -9, 54, 18); ctx.restore();
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};

// ---- CHUỖI LIÊN KẾT (Won): vòng tím rỗng → vòng + dây xích nối nòng theo đạn → CHAIN MASTER: xích (chuỗi mắt TRÒN) quật sang quái kế ----
ATK.lienket = ['Hollow violet ring bolt', 'LINKED: the bolt drags a chain tether from the barrel', 'CHAIN MASTER: on hit a chain of ring links lashes a 2nd enemy (×0.5)'];
P.lienket = () => {
  const sk = SKILLS.lienket;
  sk.ban = function (G, B, T, E) {
    const s = gdU(T), dmg = dmgU(T), n = T.chuoi || 1;
    giat(T, 0.6); const [x, y] = dauNong(T); FX.no('chop_nong', x, y, 22, 0.08, T.goc); SND.set();
    const d = danThang(B, T, E, 'g_vong_tim', 600, 15 + 2 * Math.min(4, n), (G, d, M) => {
      if (M) trung(M, dmg, { B, mau: '#d9a8ff' }); FX.vong1(d.x, d.y, 4, 14 + 3 * Math.min(4, n), '#c77dff', 0.22, 2);
      if (s >= 3 && M) {
        let Q = null, best = 90; for (const X of dsMucTieu(B)) if (X !== M && !X.chet) { const dd = Math.hypot(X.x - M.x, X.y - M.y); if (dd < best) { best = dd; Q = X; } }
        if (Q) { trung(Q, dmg * 0.5, { B, mau: '#d9a8ff' }); G.hu.push({ k: 'gXich', t: 0, song: 0.3, M, Q, x0: M.x, y0: M.y, x1: Q.x, y1: Q.y }); if (!B.ai) SND.gXich(); }
      }
    });
    if (s >= 2) G.hu.push({ k: 'gDay', t: 0, song: 2, d, T });
  };
};
function veXich(ctx, x0, y0, x1, y1, r, buoc, mau, al, lech) { // chuỗi mắt xích = ảnh PNG vong_xich (xích tím ChatGPT) đặt dọc đoạn thẳng
  if (gCo('fx_lienket_dacbiet')) { const ix = REN.img('fx_lienket_dacbiet'); if (al != null) ctx.globalAlpha = Math.min(1, al); REN.tia(ctx, ix, x0, y0, x1, y1, Math.max(8, r * 3.4), 0, false); return; } // mắt xích tờ G3 lặp dọc dây
  const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.floor(L / buoc)), im = PX.mau('vong_xich', mau === '#c77dff' ? null : mau) || REN.img('vong_xich'); if (!im) return;
  for (let i = 0; i <= n; i++) { const k = i / n; PX.ve(ctx, im, x0 + (x1 - x0) * k, y0 + (y1 - y0) * k + (lech ? Math.sin(k * Math.PI) * lech : 0), r * 2.6, r * 2.6, 0, al * (i % 2 ? 0.75 : 1)); }
}
HU.gDay = { cap(G, o) { if (!G.dan.includes(o.d)) { o.dut = o.dut == null ? o.t : o.dut; return o.t - o.dut > 0.08; } return !conTren(o.T); },
  ve(ctx, o, R) { if (!conTren(o.T)) return; const [x0, y0] = dauNong(o.T), a = o.dut != null ? 1 - (o.t - o.dut) / 0.08 : 0.85; ctx.globalCompositeOperation = 'lighter'; veXich(ctx, x0, y0, o.d.x, o.d.y, 2.2, 7, '#c77dff', a * 0.8); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; } };
HU.gXich = { ve(ctx, o, R) { const u = o.t / o.song; if (!o.Q.chet) { o.x1 = o.Q.x; o.y1 = o.Q.y; } const e = Math.min(1, u * 4), x1 = o.x0 + (o.x1 - o.x0) * e, y1 = o.y0 + (o.y1 - o.y0) * e;
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - u) * 0.5; R.anhGiua(ctx, R.cham1('#c77dff'), x1, y1, 30); veXich(ctx, o.x0, o.y0, x1, y1, 3.2, 7, '#e8c8ff', 1 - u * u, 6 * (1 - u)); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; } };

// ---- PHÁO ĐỒNG BỘ (Cosmem): viên vàng → viên + sóng nhịp ở nòng (mọi Pháo Đồng Bộ đập cùng nhịp 1 s) → FULL SYNC: tia vàng tức thì hội tụ ----
// (QA vàng-đỏ: Pháo Đồng Bộ là ụ HỖ TRỢ không bắn — chữ cũ tả đạn/tia không có thật)
ATK.dongbo = ['OFFLINE: no same-star Attack neighbour (no shots — Support)', 'SYNCED: 1–2 same-star Attack neighbours get +damage; pulses on a 1s beat', 'FULL SYNC: 3+ matched neighbours — the biggest +damage (5★: +fire rate too)'];
P.dongbo = () => {
  const sk = SKILLS.dongbo, vt = sk.veThem;
  sk.ban = function (G, B, T, E) {
    const s = gdU(T), dmg = dmgU(T);
    giat(T, 0.8); const [x, y] = chopNong(T, 26);
    if (s < 3) {
      SND.tia();
      danThang(B, T, E, 'g_xi_vang2', 640, 16 + (T.dong || 0), (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#ffe46b' }); FX.no('dien', d.x, d.y, 24, 0.18); if (s === 2) FX.vong1(d.x, d.y, 4, 18, '#ffe46b', 0.22, 2); });
      if (s === 2) G.hu.push({ k: 'gSong', t: 0, song: 0.3, x, y, goc: T.goc });
    } else {
      trung(E, dmg, { B, mau: '#ffe46b' });
      G.hu.push({ k: 'gTiaVang', t: 0, song: 0.2, T, E, x0: x, y0: y, x1: E.x, y1: E.y });
      FX.vong1(E.x, E.y, 4, 22, '#ffe46b', 0.25, 2); FX.tiaLua(E.x, E.y, 4, '#fff6c0', 150, 6); if (!B.ai) SND.gVang();
    }
  };
  sk.veThem = function (ctx, T, S, al, R, B) {
    if (vt) vt.call(this, ctx, T, S, al, R, B);
    if (gdU(T) >= 2) { const k = Math.max(0, 1 - (G.t % 1) / 0.28); if (k > 0) { ctx.globalCompositeOperation = 'lighter'; VX.vong(ctx, 0, 0, S * (0.3 + 0.06 * (1 - k)), 2, '#ffe46b', al * k * 0.7); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = al; } }
  };
};
HU.gSong = { ve(ctx, o, R) { const u = o.t / o.song, im = gCo('fx_dongbo_dacbiet') ? REN.img('fx_dongbo_dacbiet') : PX.mau('fx_nhieusong_dan', '#ffe46b'); if (!im) return; ctx.globalCompositeOperation = 'lighter'; // sóng âm = PNG fx_nhieusong_dan tô vàng
  for (let i = 0; i < 3; i++) { const r = 6 + i * 6 + u * 14; PX.ve(ctx, im, o.x + Math.cos(o.goc) * r, o.y + Math.sin(o.goc) * r, r * 1.6, r * 1.6 * im.height / im.width, o.goc, (1 - u) * (0.9 - i * 0.22)); } ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; } };

// ---- HYDRA: kim ngọc bay (1–3★) → quạt kim tức thì so le 40 ms + dấu ấn lục giác (4–6★) → 7★ HỢP ĐẦU: tia xuyên khổng lồ + phù văn dọc tia ----
ATK.hydra = ['1–3 barrels fire flying emerald NEEDLES at different enemies', 'Fan of instant needles, staggered 40 ms, each leaves a hex rune mark', 'FUSED HEAD: one giant piercing beam through the whole line, runes along the beam'];
P.hydra = () => {
  const sk = SKILLS.hydra;
  sk.ban = function (G, B, T, E) {
    const s = gdU(T), n = this.nong(T), ds = quaiTheoDau(B).slice(0, n), dmg = dmgU(T) * 0.55, c = tamU(T), R0 = REN.coDau(T) * 0.4;
    if (!ds.includes(E)) ds[0] = E;
    giat(T, 0.5 + 0.1 * n); SND.lien();
    ds.forEach((Q, i) => {
      const lech = n > 1 ? (i / (n - 1) - 0.5) * 1.1 : 0, g = T.goc + lech, x = c.x + Math.cos(g) * R0, y = c.y + Math.sin(g) * R0;
      if (s === 1) {
        FX.no('chop_nong', x, y, 14, 0.07, gocTo(x, y, Q));
        banDan({ img: 'g_kim_ngoc', x, y, muc: Q, px: Q.x, py: Q.y, sp: 640, co: 16, B, T, trung(G, d, M) { if (M) trung(M, dmg, { B, mau: '#7dffc4' }); FX.tiaLua(d.x, d.y, 2, '#7dffc4', 110, 6); } });
      } else treU(T, i * 0.04, () => {
        if (Q.chet) return; trung(Q, dmg, { B, mau: '#7dffc4' });
        G.hu.push({ k: 'tiaTia', t: 0, song: 0.16, x0: x, y0: y, x1: Q.x, y1: Q.y, mau: '#2ee89a' }); G.hu.push({ k: 'gDauAn', t: 0, song: 0.34, x: Q.x, y: Q.y });
        FX.no('chop_nong', x, y, 16, 0.07, gocTo(x, y, Q));
      });
    });
  };
  const vt = HU.hydraTia.ve;
  HU.hydraTia.ve = function (ctx, o, R) {
    vt.call(this, ctx, o, R);
    const u = o.t / o.song, L = Math.hypot(o.x1 - o.x0, o.y1 - o.y0), g = Math.atan2(o.y1 - o.y0, o.x1 - o.x0);
    ctx.globalCompositeOperation = 'lighter';
    for (let s = 50; s < Math.min(L, 520); s += 46) { const x = o.x0 + Math.cos(g) * s, y = o.y0 + Math.sin(g) * s; ctx.save(); ctx.translate(x, y); ctx.rotate(s * 0.05 + u * 3); veLucGiac(ctx, 7 * (1 - u * 0.5), '#bfffe4', (1 - u) * 0.8); ctx.restore(); }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  };
};
function veLucGiac(ctx, r, mau, al) { PX.vong(ctx, 0, 0, r, 2, mau, al); PX.sao(ctx, 0, 0, r * 1.4, mau, al * 0.8); } // dấu ấn = vòng + lấp lánh PNG (thay lục giác lineTo vẽ code)
HU.gDauAn = { ve(ctx, o, R) { const u = o.t / o.song; if (gV(ctx, 'fx_hydra_dacbiet', o.x, o.y, 18 + 10 * VX.eo(u), u * 2, 1 - u)) { ctx.globalAlpha = 1; return; } ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(u * 2); ctx.globalCompositeOperation = 'lighter'; veLucGiac(ctx, 6 + 6 * VX.eo(u), '#2ee89a', 1 - u); veLucGiac(ctx, 3 + 3 * u, '#ffffff', (1 - u) * 0.8); ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; } };

// ---- CỬU VĨ (Nine-Tail): lửa hồ ly cam thẳng → lửa hồ ly bay UỐN LƯỢN có vệt lửa → 7★: lửa xanh-trắng uốn lượn nổ vòng 26 px ----
ATK.cuuvi = ['Straight orange foxfire orb', 'BLAZING TAILS: foxfire curls in a wavy path with a flame trail, tail-flick on hit', '7★: blue-white foxfire curls and bursts in a 26 px ring'];
P.cuuvi = () => {
  const sk = SKILLS.cuuvi;
  sk.ban = function (G, B, T, E) {
    const s = gdU(T), dmg = dmgU(T); giat(T, 0.6); const [x, y] = chopNong(T, 22); SND.gHo();
    if (s === 1) { danThang(B, T, E, 'g_ho_cam', 500, 18, (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#ffc070' }); FX.no('no_phao', d.x, d.y, 22, 0.16); FX.tiaLua(d.x, d.y, 2, '#ffa020', 110, 6); }); return; }
    G.hu.push({ k: 'gHoBay', t: 0, song: 2.5, x, y, x0: x, y0: y, E, B, T, dmg, xanh: s === 3, pha: Math.random() < 0.5 ? 1 : -1, vet: [], s: 0 });
  };
};
HU.gHoBay = { // lửa hồ ly uốn lượn: chạy theo đường thẳng tới quái + lệch ngang hình sin (biên độ giảm dần khi gần)
  cap(G, o, dt) {
    if (!o.E || o.E.chet) { const ds = dsMucTieu(o.B).filter(E => !E.chet); o.E = ds.length ? ds[0] : null; if (!o.E) return true; }
    const dx = o.E.x - o.x0, dy = o.E.y - o.y0, L = Math.hypot(dx, dy) || 1;
    o.s += dt * 470; const k = Math.min(1, o.s / L), bien = 18 * Math.sin(k * Math.PI) * o.pha, w = Math.sin(k * Math.PI * 2);
    o.x = o.x0 + dx * k - dy / L * bien * w; o.y = o.y0 + dy * k + dx / L * bien * w;
    o.vet.push(o.x, o.y); if (o.vet.length > 16) o.vet.splice(0, 2);
    if (k >= 1) {
      G.dangBan = o.T; trung(o.E, o.dmg, { B: o.B, mau: o.xanh ? '#cff4ff' : '#ffc070' });
      if (o.xanh) { noLan(o.E.x, o.E.y, 26, o.dmg * 0.35, o.B, { phu: true, mau: '#cff4ff' }); FX.no('dien', o.E.x, o.E.y, 36, 0.2); FX.vong1(o.E.x, o.E.y, 4, 26, '#9fe8ff', 0.25, 3); }
      else { FX.no('no_phao', o.E.x, o.E.y, 28, 0.18); FX.tiaLua(o.E.x, o.E.y, 3, '#ffa020', 130, 7); }
      if (o.T && conTren(o.T)) o.T.sang = Math.max(o.T.sang, 0.3);
      return true;
    }
    return false;
  },
  ve(ctx, o, R) {
    const m = o.xanh ? '#9fe8ff' : '#ffa020';
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i + 1 < o.vet.length; i += 2) { const a = (i + 2) / o.vet.length; ctx.globalAlpha = a * 0.55; R.anhGiua(ctx, R.cham1(m), o.vet[i], o.vet[i + 1], 13 * a); }
    ctx.globalAlpha = 1; const n = o.vet.length, g = n >= 4 ? Math.atan2(o.vet[n - 1] - o.vet[n - 3], o.vet[n - 2] - o.vet[n - 4]) : 0;
    if (gV(ctx, o.xanh ? 'fx_cuuvi_dan3' : 'fx_cuuvi_dan2', o.x, o.y, 26, g, 1)) { ctx.globalCompositeOperation = 'source-over'; return; } const im = REN.co(o.xanh ? 'g_ho_xanh' : 'g_ho_cam', 22); if (im) { ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(g); ctx.drawImage(im, -11, -7.3, 22, 14.7); ctx.restore(); }
    ctx.globalCompositeOperation = 'source-over';
  },
};

// ---- NGAI THỜI GIAN (Chronos): kim đồng hồ xuyên → + đóng dấu mặt đồng hồ 12 vạch (chậm nhẹ) → 7★: xuyên cả đường + TIẾNG VỌNG đánh lại 40% sau 0.3 s ----
ATK.ngaithoigian = ['Piercing clock-hand dart', 'Dart stamps a 12-tick clock ring on the first enemy (slight slow)', 'THRONE: needle pierces the whole line + a TIME ECHO re-hits it 0.3s later (40%)'];
P.ngaithoigian = () => {
  const sk = SKILLS.ngaithoigian;
  sk.ban = function (G, B, T, E) {
    const s = gdU(T); giat(T, 1); const [x, y] = chopNong(T, 28); SND.gKim();
    const g = gocTo(x, y, E), L = s === 3 ? 720 : Math.hypot(E.x - x, E.y - y) + 60, x1 = x + Math.cos(g) * L, y1 = y + Math.sin(g) * L, dmg = dmgU(T);
    const ds = quaiTrenDoan(B, x, y, x1, y1, 10);
    for (const Q of ds) trung(Q, dmg, { B, mau: '#ffb0a0' });
    G.hu.push({ k: 'gKim', t: 0, song: 0.2, x0: x, y0: y, x1, y1, s });
    if (s >= 2 && ds.length) { const Q = ds.sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0]; G.hu.push({ k: 'gDauGio', t: 0, song: 0.45, E: Q, x: Q.x, y: Q.y }); if (!Q.d.khangCham) { Q.cham = Math.max(Q.cham, 0.08); Q.chamT = Math.max(Q.chamT, 1); } }
    if (s === 3) treU(T, 0.3, () => { for (const Q of quaiTrenDoan(B, x, y, x1, y1, 12)) trung(Q, dmg * 0.4, { B, mau: '#ff9aa0' }); G.hu.push({ k: 'gKim', t: 0, song: 0.24, x0: x, y0: y, x1, y1, ma: true }); if (!B.ai) SND.gEcho(); });
  };
};
HU.gKim = { // kim đồng hồ bay vụt dọc tia + vệt mảnh (ma: bóng đỏ mờ của tiếng vọng)
  ve(ctx, o, R) {
    const u = o.t / o.song, e = Math.min(1, u * 2.5), x = o.x0 + (o.x1 - o.x0) * e, y = o.y0 + (o.y1 - o.y0) * e, g = Math.atan2(o.y1 - o.y0, o.x1 - o.x0);
    ctx.globalCompositeOperation = 'lighter';
    PX.tia(ctx, o.x0, o.y0, x, y, o.ma ? 3 : 2, o.ma ? '#ff6a7a' : '#ffd86a', (1 - u) * (o.ma ? 0.5 : 0.8), o.ma ? R.t * 40 : null); // vệt = tia PNG
    ctx.globalAlpha = (1 - u * u) * (o.ma ? 0.55 : 1); if (gV(ctx, o.ma ? 'fx_ngaithoigian_dacbiet' : o.s === 3 ? 'fx_ngaithoigian_dan3' : 'fx_ngaithoigian_dan', x, y, o.ma ? 30 : 32, g + (o.ma ? Math.PI / 4 : 0), (1 - u * u) * (o.ma ? 0.55 : 1))) { ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; return; } const im = REN.co('g_kim_gio', 30); if (im) { ctx.save(); ctx.translate(x, y); ctx.rotate(g); ctx.drawImage(im, -15, -3.75, 30, 7.5); ctx.restore(); }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};
HU.gDauGio = { ve(ctx, o, R) { const E = o.E, x = E && !E.chet ? E.x : o.x, y = E && !E.chet ? E.y : o.y, u = o.t / o.song, r = 13 + 6 * VX.eo(u); // dấu đồng hồ = PNG fx_st_tua tô vàng, xoay (thay vòng + 12 vạch + kim vẽ code)
  const im = gCo('fx_ngaithoigian_hieu') ? REN.img('fx_ngaithoigian_hieu') : PX.mau('fx_st_tua', '#ffd86a'); if (!im) return; ctx.globalCompositeOperation = 'lighter'; PX.ve(ctx, im, x, y, r * 2.3, r * 2.3 * im.height / im.width, u * 6, 1 - u); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; } };

// ---- RỒNG MÁY (Wyrm Engine, skills5.js): nón lửa CAM → nón lửa XANH (+30% quái to) → nón TRẮNG viền xanh dài hơn + vệt cháy 4 s ----
ATK.ronglua = ['Orange flame cone, burns 3s', 'BLUE flame cone: +30% vs big enemies, sparks at the cone edge', 'WHITE flame with blue rim: longer cone, burning trail stays 4s'];
// ---- LƯỚI CỘNG HƯỞNG (hỗ trợ chéo): dạng 2 ụ chéo trúng có vòng ngọc lam · dạng 3 cứ phát thứ 3 của ụ chéo bắn thêm 1 đạn vọng ngọc lam ----
ATK.luoicheo = ['Diagonal damage buff (no shot)', 'HUMMING: buffed diagonal turrets’ hits flash a teal spark ring', 'RESONANCE: every 3rd shot of each diagonal turret fires an extra teal echo bolt'];
P.luoicheo = () => {
  const sk = SKILLS.luoicheo, cn = sk.capNhat;
  sk.capNhat = function (G, B, T, dt) { const r = cn.call(this, G, B, T, dt); const s = gdU(T); if (s >= 2) for (const o of oCheo(T.o)) { const N = B.t[o]; if (N && !N.st.da) { N._luoiT = G.t; N._luoiS = s; } } return r; };
  const tb = TVX.ban, tt = TVX.trung;
  TVX.ban = function (T) {
    tb.call(this, T);
    if (T._luoiS === 3 && G.t - T._luoiT < 0.1 && T.banLan % 3 === 0 && T.muc && !T.muc.chet && conTren(T)) {
      const [x, y] = dauNong(T), E = T.muc;
      banDan({ img: 'g_vong_ngoc', x, y, muc: E, px: E.x, py: E.y, sp: 640, co: 11, B: G.ban[T.ban], T: null, trung(G, d) { FX.vong1(d.x, d.y, 3, 13, '#45e0c8', 0.22, 2); } });
    }
  };
  TVX.trung = function (T, E, crit) {
    tt.call(this, T, E, crit);
    if (T && T._luoiS >= 2 && G.t - T._luoiT < 0.1 && G.t - (T._luoiH || -9) > 0.22) { T._luoiH = G.t; FX.vong1(E.x, E.y, 3, 14, '#45e0c8', 0.2, 2); FX.hat1('lua', E.x, E.y, rnd(-50, 50), rnd(-50, 50), 0.2, 5, '#45e0c8'); }
  };
};
// ---- 3 ụ Đỏ đợt 3 (chuato / leviathan / khoisinh) đổi dạng theo sao: đã vẽ riêng trong skills5.js (drone hoàng gia, bọt lớn, hoa sen) ----
ATK.chuato = ['Stinger shots + up to 3–4 orbiting drones', 'HIVE: drones perch on neighbours (+10% fire rate)', 'ROYAL HIVE: every 5th drone is gold ×3'];
ATK.leviathan = ['Bubble shot, 30 px splash', 'Bubble shot + wider splash ring; devours big enemies', 'ABYSS LORD: big double-ring bubbles; devours flyers'];
ATK.khoisinh = ['3 rotating gold rings, raises your lowest turret', 'BLOSSOM: steel lotus petals, neighbours +15% damage', 'LOTUS OF LIFE: white star core, each raise also seeds a free 1★'];

// =====================================================================================================
// 5) BẢNG THÔNG TIN: dòng "Attack per stage" (dạng hiện tại tô sáng)
// =====================================================================================================
GFX.ATK = ATK;
if (typeof UI !== 'undefined' && UI.ttChiTiet) {
  const tc = UI.ttChiTiet;
  UI.ttChiTiet = function (id, T, sk, tier) {
    const s = tc.call(this, id, T, sk, tier);
    if (!ATK[id] || !laGrow(id)) return s;
    const esc = (v) => String(v).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const g = GROW[id], cur = T ? GROW[id].gd(T).s : 0;
    const d = '<div class="d-grow"><b style="color:' + g.mau + '">ATTACK BY STAGE</b> ' + ATK[id].map((a, i) => '<span style="' + (cur === i + 1 ? 'color:' + g.mau + ';font-weight:800' : 'opacity:.75') + '">' + (i + 1) + ' ' + esc(a) + '</span>').join(' · ') + '</div>';
    const k = s.indexOf('<div class="d-grow">'), e = k >= 0 ? s.indexOf('</div>', k) + 6 : -1;
    return e > 0 ? s.slice(0, e) + d + s.slice(e) : s + d;
  };
}

// =====================================================================================================
// 6) ĐĂNG KÝ + chế độ kiểm thử: G.debug.gd = 1..3 (ép mọi ụ grow-up) hoặc T._epGd (ép 1 ụ)
// =====================================================================================================
for (const id of Object.keys(P)) if (SKILLS[id]) { try { P[id](id); } catch (e) { console.error('growfx', id, e); } }
for (const id of Object.keys(GROW)) if (SKILLS[id]) {
  moVeThem(id);
  const g = GROW[id], f = g.gd;
  if (!g._gfxEp) { g._gfxEp = true; g.gd = (T) => { const r = f(T), ep = T._epGd || (G.debug && G.debug.gd); if (ep) r.s = ep; return r; }; }
}
// =====================================================================================================
// 7) ĐẦU v2 (85 đầu vẽ lại): ảnh dạng _s1/_s2/_s3 cũ không khớp đầu mới → cả 3 dạng dùng ĐẦU MỚI <id>_nong
//    (artscale.js STAGE_DAU_MOI = hệ số cỡ dạng 1/2/3). Dạng 2/3: quầng viền = bóng của CHÍNH ảnh đầu (REN.co 'trang')
//    tô màu dạng, to hơn đầu một chút, vẽ cộng sáng ngay dưới đầu; dạng 3 thêm fx_awaken như cũ. Không vẽ hình bằng code.
//    Khi có ảnh dạng mới: đưa id về STAGE_K/STAGE_TIP (artscale.js) → tự dùng lại ảnh _s.
// =====================================================================================================
const SDM = window.STAGE_DAU_MOI || {};
const laDauMoi = (id) => !!(SDM[id] && !(window.STAGE_K && STAGE_K[id]));
for (const id of Object.keys(SDM)) if (GROW[id] && laDauMoi(id)) { GROW[id].khongAnh = true; GROW[id].dauMoi = true; }
if (GFX.coDOM && typeof REN !== 'undefined') {
  const kGoc = REN.dauK, veGoc = REN.veDauLop;
  REN.dauK = function (id, gd) { return gd && laDauMoi(id) ? this.kDau(id) * SDM[id][gd - 1] : kGoc.call(this, id, gd); };
  REN.veDauLop = function (ctx, id, gd, C, al, sc, da, bien) {
    if (gd >= 2 && !bien && !da && laDauMoi(id) && GROW[id] && !GFX.tat) {
      const D = C * this.dauK(id, gd) * (sc || 1) * (gd === 3 ? 1.13 : 1.08), tr = this.co(this.dauTen(id, gd), D, 'trang'), q = tr && VX.toMau(tr, GROW[id].mau);
      if (q) {
        const a0 = ctx.globalAlpha, op = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (gd === 3 ? 0.5 + 0.15 * Math.sin(VX.t * 5) : 0.34);
        ctx.drawImage(q, -D / 2, -D / 2, D, D); ctx.globalCompositeOperation = op; ctx.globalAlpha = a0;
      }
    }
    return veGoc.call(this, ctx, id, gd, C, al, sc, da, bien);
  };
}
if (GFX.coDOM && typeof REN !== 'undefined') GFX.taoSprite();
window.GFX = GFX;
