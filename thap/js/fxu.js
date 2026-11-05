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

// ---------- Wyrm Engine dạng 1: nón lửa PNG thay sprite canvas anhNon ----------
if (typeof HU !== 'undefined' && HU.nonLua) {
  const veCu = HU.nonLua.ve;
  HU.nonLua.ve = function (ctx, o, R) {
    const T = o.T; if (!(T.phun > 0)) return;
    const gd = T.gd || gdSao(T);
    if (gd !== 1 || !FXU.co('fx_ronglua_dan') || !REN.img('fx_ronglua_dan')) return veCu.call(this, ctx, o, R);
    const goc = SKILLS.ronglua.goc(T), L = SKILLS.ronglua.tam(T), [x, y] = dauNong(T), al = Math.min(1, T.phun / 0.3);
    const m = FXU_META.fx_ronglua_dan, im = REN.mip(REN.img('fx_ronglua_dan'), L * REN.s * REN.dpr);
    const hh = Math.max(L * m[1] / m[0], 2 * L * Math.tan(goc / 2) * 0.95);
    ctx.save(); ctx.translate(x, y); ctx.rotate(T.goc);
    for (let i = 0; i < 2; i++) { // 2 lớp lệch pha + rung nhẹ như cũ
      const f = 1 + 0.06 * Math.sin(R.t * (31 + i * 17) + i);
      ctx.globalAlpha = al * (i ? 0.45 : 1); ctx.save(); ctx.rotate(0.05 * Math.sin(R.t * 13 + i * 2));
      if (i) ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(im, -2, -hh * f / 2, L * f, hh * f); ctx.restore();
    }
    ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  };
}

// ---------- Hive Queen: ong máy PNG thay veDrone (vẽ code) ----------
if (typeof veDrone === 'function') {
  const veCu = veDrone;
  // eslint-disable-next-line no-global-assign
  veDrone = function (ctx, R, x, y, k, vang, pha, al) {
    const ten = vang && FXU.co('fx_chuato_hieu') ? 'fx_chuato_hieu' : 'fx_chuato_dan';
    if (!FXU.co(ten) || !R.img(ten)) return veCu(ctx, R, x, y, k, vang, pha, al);
    const w = 20 * k * (vang ? 1.15 : 1) * (1 + 0.05 * Math.sin(pha * 0.7)); // vỗ cánh = nhịp phóng nhẹ của chính ảnh
    R.anhGiua(ctx, ten, x, y, w, 0.15 * Math.sin(pha * 0.13), al == null ? 1 : al);
  };
}
