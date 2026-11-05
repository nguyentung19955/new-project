// TURRET MERGE — HIỆU ỨNG ĐÁNH v2 THEO TỪNG Ụ (ảnh ChatGPT, docs/demo-hop-tuong/HIEU-UNG-U-MOI.md)
// MỘT BẢNG dữ liệu: id ụ → cách dùng 4 ảnh (dan / no / trung / hieu) + tia + ảnh thay thế.
// Ảnh nào có trong FXU_META (sinh bởi tools/thap-cat-fxv2.py khi cắt tờ) thì dùng; chưa có → giữ hiệu ứng cũ.
// → tờ mới về: chạy lại script cắt là tự nối, không cần sửa code (chỉ thêm dòng CFG nếu cần chỉnh cỡ/neo).
// Code CHỈ đặt vị trí / xoay / phóng / mờ / tô màu ảnh PNG (thap/QUY-TAC-HINH.md mục 3).
'use strict';

const FXU = {
  // chỉnh riêng từng ụ (mặc định: đạn xoay theo hướng bay, rộng = d.co × k)
  //  k: hệ số cỡ đạn · kn: cỡ chớp nòng · kt: cỡ nổ trúng · tron: đạn tròn/vật lăn (không xoay theo hướng, tự lăn q°/s)
  CFG: {
    canon: { k: 1.8 }, phagiap: { k: 1.8 }, mortar: { k: 2.3 }, bomhen: { k: 2.3 }, min: { k: 2.2 }, bua: { k: 2.4 }, nam: { k: 2.4 }, loren: { k: 2.3 },
    lien: { k: 2.3 }, phun: { k: 2.4 }, sungluc: { k: 2.2 }, xucxac: { k: 2.6 }, tia: { k: 2.6 }, no5: { k: 2.3 },
    docton: { k: 2.4 }, bang: { k: 2.3 }, kiembang: { k: 2.4 }, baotuyet: { k: 2.3 }, khoathoigian: { k: 2.2 }, guongcong: { k: 2.3 },
    khien: { k: 2.2 }, taylo: { k: 2.3 }, anhsang: { k: 2.2 }, aten: { k: 2.3 }, haoquang: { k: 2.3 }, hasao: { k: 2.3 },
    nemesis: { k: 2.3 }, nhatthuc: { k: 2.3 }, marionette: { k: 2.3 }, drone: { k: 2.0 }, chuato: { k: 2.0 }, kepha: { k: 2.3 },
    nhieusong: { k: 2.3 }, wallgen: { k: 2.2 }, khoisinh: { k: 2.3 }, leviathan: { k: 2.1 }, cuongno: { k: 2.3 }, cuuvi: { k: 2.3 },
    hopbi: { k: 2.3 }, tienhoa: { k: 2.2 }, soi: { k: 2.4 },
  },
  // ảnh cũ (canvas code / ảnh chung lệch đầu mới) → ảnh v2. Chỉ thay khi ảnh v2 đã cắt.
  THAY: {
    ic_bom: 'fx_bomhen_hieu', hu_min: 'fx_min_hieu', hu_khoa: 'fx_khoathoigian_hieu', hu_manhguong: 'fx_guongcong_dan',
    hu_trangkhuyet: 'fx_nhatthuc_hieu', drone_nong: 'fx_drone_hieu',
    // sprite đạn growfx (trước vẽ bằng canvas) — dạng 1
    g_the_tim: 'fx_hopbi_dan', g_ho_cam: 'fx_cuuvi_dan', g_ngoi: 'fx_chuato_dan', g_bot: 'fx_leviathan_dan', g_bot_lon: 'fx_leviathan_dan', g_xi_vang: 'fx_tienhoa_dan',
  },
  DAN_CHUNG: new Set(['dan_phao', 'dan_lien', 'dan_tia', 'dan_bang', 'dan_doc', 'tia_lua']),
  NO_CHUNG: new Set(['no_phao', 'dien', 'bang_vo', 'laser_trung']),
  co: (ten) => typeof FXU_META !== 'undefined' && !!FXU_META[ten],
  ten(T, cot) { if (!T || !T.id) return null; const t = 'fx_' + T.id + '_' + cot; return this.co(t) ? t : null; },
  cfg(id) { return this.CFG[id] || {}; },
  // ảnh cần nạp cho bộ bài (lười theo bộ bài → nhẹ bộ nhớ iOS)
  dsAnh(bans) {
    const ds = ['fx_vet_trang', 'fx_cham_trang', 'fx_vong_mong', 'fx_than', 'fx_bui'].filter(t => this.co(t));
    ds.push('fx_laser_tia', 'fx_tia_sao', 'tai_day', 'fx_vong_trieu'); // ảnh nền của PX (vẽ hiệu ứng chỉ bằng PNG)
    for (const k of ['cham', 'dong', 'doc', 'chay', 'choang', 'yeu', 'cauvong', 'khienvang']) if (this.co('fx_st_' + k)) ds.push('fx_st_' + k);
    for (const b of bans) for (const id of b.deck) for (const c of ['dan', 'no', 'trung', 'hieu', 'tia']) if (this.co('fx_' + id + '_' + c)) ds.push('fx_' + id + '_' + c);
    for (const k in this.THAY) if (this.co(this.THAY[k]) && !ds.includes(this.THAY[k])) ds.push(this.THAY[k]);
    return ds;
  },
  // ảnh trắng tô màu (hạt / vòng / vệt chung T22) — dựng 1 lần mỗi màu
  _mau: {},
  mau(ten, mau) {
    const key = ten + mau; if (this._mau[key]) return this._mau[key];
    const a = REN.img(ten); if (!a) return null;
    const c = document.createElement('canvas'); c.width = a.width; c.height = a.height;
    const x = c.getContext('2d'); x.drawImage(a, 0, 0);
    x.globalCompositeOperation = 'source-atop'; x.globalAlpha = 0.78; x.fillStyle = mau; x.fillRect(0, 0, c.width, c.height);
    return (this._mau[key] = c);
  },
  donMau() { this._mau = {}; },
  // vẽ ảnh tại (x,y) theo điểm neo của ảnh (FXU_META: thân đạn / mép nòng), rộng w
  veNeo(ctx, ten, x, y, w, goc, al) {
    const m = FXU_META[ten], a = REN.img(ten); if (!a || !m) return false;
    const h = w * m[1] / m[0], im = REN.mip(a, Math.max(w, h) * REN.s * REN.dpr);
    ctx.save(); ctx.translate(x, y); if (goc) ctx.rotate(goc); if (al != null) ctx.globalAlpha = al;
    ctx.drawImage(im, -m[2] * w, -m[3] * h, w, h); ctx.restore();
    return true;
  },
};

// ---------- ảnh thay thế: REN.img trả ảnh v2 cho tên cũ ----------
if (typeof REN !== 'undefined') {
  const imgGoc = REN.img;
  REN.img = function (ten) { const t = FXU.THAY[ten]; return imgGoc.call(this, t && FXU.co(t) ? t : ten); };
  for (const k in FXU.THAY) if (FXU.co(FXU.THAY[k]) && typeof GFX !== 'undefined' && GFX.gen) { delete GFX.gen[k]; delete REN.anh[k]; }
}

// ---------- vật trên đường / kỹ năng: gắn ụ gây ra (để biết dùng ảnh của ụ nào khi vẽ) ----------
if (typeof G !== 'undefined') {
  const push0 = Array.prototype.push;
  G.hu.push = function (...a) { for (const o of a) if (o && o.T === undefined && G.dangBan) o._T = G.dangBan; return push0.apply(this, a); };
}

// ---------- vệt tỉa (tiaTia): tia v2 của ụ cuộn dọc đường bắn + viên đạn v2 bay theo (không còn đường kẻ code) ----------
if (typeof HU !== 'undefined' && HU.tiaTia) {
  const veCu = HU.tiaTia.ve;
  HU.tiaTia.ve = function (ctx, o, R) {
    const T = o.T || o._T, tia = FXU.ten(T, 'tia'), dan = FXU.ten(T, 'dan'), vet = FXU.co('fx_vet_trang');
    if (!tia && !dan && !vet) return veCu.call(this, ctx, o, R);
    const u = Math.min(1, o.t / o.song);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - u * u;
    if (tia) R.tia(ctx, tia, o.x0, o.y0, o.x1, o.y1, 15 * (1 - u * 0.5), R.t * 420);
    else if (vet) R.tia(ctx, FXU.mau('fx_vet_trang', o.mau || '#ffd080'), o.x0, o.y0, o.x1, o.y1, 12 * (1 - u * 0.5), 0, true);
    ctx.globalCompositeOperation = 'source-over';
    if (dan) { // đạn nhìn thấy được bay hết đường bắn trong 70% thời gian vệt
      const p = Math.min(1, u / 0.7), g = Math.atan2(o.y1 - o.y0, o.x1 - o.x0);
      FXU.veNeo(ctx, dan, o.x0 + (o.x1 - o.x0) * p, o.y0 + (o.y1 - o.y0) * p, 30 * (FXU.cfg(T.id).k || 2.3) / 2.3, g, p < 1 ? 1 : 0);
    }
    ctx.globalAlpha = 1;
  };
}

// (nón lửa Wyrm Engine: skills5.js HU.nonLua đã vẽ thẳng ảnh fx_ronglua_dan cho mọi dạng)

// (ong máy Hive Queen: skills5.js veDrone đã vẽ thẳng ảnh fx_chuato_dan/hieu)

// =====================================================================================================
// PX — bộ vẽ HIỆU ỨNG CHỈ BẰNG ẢNH PNG (thay mọi arc/stroke/fill/gradient của vùng FX, VE-TAY-RASOAT-fx.md)
// Code chỉ: đặt vị trí / xoay / phóng / mờ / tô màu ảnh PNG ChatGPT; cung tiến độ = ảnh vòng + mặt nạ cắt (clip) vô hình.
//   vong  → fx_vong_mong (vòng sáng trắng T22, vòng nằm ở 78% bán kính ảnh) tô màu
//   cung  → vong + clip hình quạt a0..a1     · tia  → fx_laser_tia (tia trắng) tô màu, kéo/lặp theo đoạn thẳng
//   cham  → fx_cham_trang tô màu (quầng/hạt)  · sao  → fx_tia_sao tô màu     · bong → fx_cham_trang tô đen (bóng mềm)
// =====================================================================================================
const PX = {
  K_VONG: 2.56, // cỡ ảnh fx_vong_mong / bán kính vòng thấy được
  mau(ten, mau) { return typeof FXU !== 'undefined' && REN.img(ten) ? (mau ? FXU.mau(ten, mau) : REN.img(ten)) : null; },
  ve(ctx, im, x, y, w, h, goc, al) {
    if (!im || !(w > 0.3)) return false;
    im = REN.mip(im, Math.max(w, h) * REN.s * REN.dpr);
    if (al != null) { if (al <= 0.01) return false; ctx.globalAlpha = Math.min(1, al); }
    if (goc) { ctx.save(); ctx.translate(x, y); ctx.rotate(goc); ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore(); }
    else ctx.drawImage(im, x - w / 2, y - h / 2, w, h);
    return true;
  },
  vong(ctx, x, y, r, w, mau, al) { if (!(r > 0.5)) return; const s = r * this.K_VONG; this.ve(ctx, this.mau('fx_vong_mong', mau), x, y, s, s, 0, al == null ? null : al * Math.min(1, 0.55 + (w || 2) * 0.18)); },
  // cung tròn a0→a1 (chiều kim đồng hồ; nguoc = ngược) = ảnh vòng bị cắt bởi hình quạt (mặt nạ vô hình)
  // (dựng sẵn từng cung vào bộ đệm theo góc lượng tử 1/128 vòng → mỗi khung chỉ 1 drawImage, không clip mỗi khung)
  _cung: new Map(),
  cung(ctx, x, y, r, a0, a1, nguoc, w, mau, al) {
    if (!(r > 0.5) || Math.abs(a1 - a0) < 0.003 || (al != null && al <= 0.01)) return;
    const vm = this.mau('fx_vong_mong', mau); if (!vm) return;
    const q = Math.PI / 64, b0 = Math.round(a0 / q), b1 = Math.round(a1 / q), S = r * this.K_VONG, n = Math.max(8, Math.round(S * REN.s * REN.dpr));
    const key = mau + '|' + n + '|' + b0 + '|' + b1 + '|' + (nguoc ? 1 : 0);
    let c = this._cung.get(key);
    if (!c) {
      if (this._cung.size > 600) this._cung.clear();
      c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d'), h = n / 2;
      g.beginPath(); g.moveTo(h, h); g.arc(h, h, h, b0 * q, b1 * q, !!nguoc); g.closePath(); g.clip(); // mặt nạ cắt quạt (vô hình)
      g.drawImage(REN.mip(vm, n), 0, 0, n, n);
      // cắt sát khung bao của cung (vòng sáng nằm trong 0.55–1.0 bán kính ảnh) → vẽ ít điểm ảnh hơn mỗi khung
      let x0 = n, y0 = n, x1 = 0, y1 = 0; const A0 = b0 * q, A1 = b1 * q, d = nguoc ? (A1 > A0 ? A1 - A0 - 2 * Math.PI : A1 - A0) : (A1 < A0 ? A1 - A0 + 2 * Math.PI : A1 - A0);
      for (let i = 0; i <= 24; i++) { const a = A0 + d * i / 24; for (const k of [0.55, 1]) { const px = h + Math.cos(a) * h * k, py = h + Math.sin(a) * h * k; x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py); } }
      x0 = Math.max(0, Math.floor(x0) - 1); y0 = Math.max(0, Math.floor(y0) - 1); x1 = Math.min(n, Math.ceil(x1) + 1); y1 = Math.min(n, Math.ceil(y1) + 1);
      const t = document.createElement('canvas'); t.width = Math.max(1, x1 - x0); t.height = Math.max(1, y1 - y0); t.getContext('2d').drawImage(c, -x0, -y0);
      c.width = c.height = 0; t.bx = x0 / n; t.by = y0 / n; t.bw = t.width / n; t.bh = t.height / n; c = t; this._cung.set(key, c);
    }
    if (al != null) ctx.globalAlpha = Math.min(1, al * Math.min(1, 0.55 + (w || 2) * 0.18));
    ctx.drawImage(c, x - S / 2 + c.bx * S, y - S / 2 + c.by * S, c.bw * S, c.bh * S);
  },
  // đoạn thẳng sáng (dây, tia, đường ngắm): kéo dãn 1 ảnh; lech != null → lặp ảnh trượt theo lech (nhìn như chạy)
  tia(ctx, x0, y0, x1, y1, w, mau, al, lech) {
    const im = this.mau('fx_laser_tia', mau); if (!im) return;
    if (al != null) { if (al <= 0.01) return; ctx.globalAlpha = Math.min(1, al); }
    REN.tia(ctx, im, x0, y0, x1, y1, Math.max(3, (w || 2) * 3.2), lech || 0, lech == null);
  },
  // đường cong qua các điểm [[x,y],…] = nối các đoạn tia
  duong(ctx, pts, w, mau, al) { for (let i = 1; i < pts.length; i++) this.tia(ctx, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], w, mau, al); },
  cham(ctx, x, y, co, mau, al) { this.ve(ctx, this.mau('fx_cham_trang', mau), x, y, co, co, 0, al); },
  sao(ctx, x, y, co, mau, al, goc) { this.ve(ctx, this.mau('fx_tia_sao', mau), x, y, co, co, goc, al); },
  bong(ctx, x, y, w, h, al) { this.ve(ctx, this.mau('fx_cham_trang', '#000000'), x, y, w, h, 0, al); },
  // thanh máu nhỏ trên đầu quái/trùm: nền = tai_day tô đen, mức đầy = tai_day tô màu CẮT theo tỉ lệ (QUY-TAC mục 3)
  thanh(ctx, x, y, w, h, p, mau, khung) {
    const nen = this.mau('tai_day', '#000000'), day = this.mau('tai_day', mau); if (!nen || !day) return;
    ctx.globalAlpha = 0.75; ctx.drawImage(REN.mip(nen, w * REN.s * REN.dpr), x - 1, y - 1, w + 2, h + 2);
    p = clamp(p, 0, 1); ctx.globalAlpha = 1;
    if (p > 0.002) { const a = REN.mip(day, w * REN.s * REN.dpr); ctx.drawImage(a, 0, 0, a.width * p, a.height, x, y, w * p, h); }
    if (khung) { const k = REN.img(khung); if (k) { const kw = w + h * 2.6, kh = kw * k.height / k.width; ctx.drawImage(REN.mip(k, kw * REN.s * REN.dpr), x + w / 2 - kw / 2, y + h / 2 - kh / 2, kw, kh); } }
  },
};
// (REN.cham1 = fx_cham_trang PNG tô màu: đã làm ở render.js — vùng board)
