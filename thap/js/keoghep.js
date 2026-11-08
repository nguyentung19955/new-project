// TURRET MERGE — KÉO GHÉP (TU-VAN-TOAN-GAME P0-02) + KẾT QUẢ GHÉP (P0-03).
//  · Đang kéo / đã chạm chọn 1 ụ: CHỈ ô ghép được (hopLeGhep — cùng loại + cùng sao, + Mimic/Copycat/Blender/Overclock/… ghepDB)
//    được đóng khung xanh (khung_chon, S10); ô không ghép được bị làm mờ; rê lên ô hợp lệ = vòng chọn sup_ring;
//    rê lên ô sai = vòng đỏ h2_vong_do. Toàn bộ là ẢNH ChatGPT (QUY-TAC-HINH): code chỉ đặt vị trí / phóng / mờ.
//  · Đầu ụ đang kéo nằm TRÊN ngón tay (lệch ~0,6 ô) và điểm thả = tâm đầu ụ → luôn thấy ô đích.
//  · Huỷ an toàn: thả ngoài ô hợp lệ, pointercancel/touchcancel, mất capture, tạm dừng, ẩn tab, ụ nguồn biến mất.
//  · Chế độ chạm–chạm: chạm 1 ụ (chọn, 4 s) → chạm ô đang sáng để ghép; chạm lại ụ đó / ô trống = bỏ chọn.
//  · Kết quả: lúc ụ mới lộ ra (VX.TRE_LO) hiện tấm tên ụ mới + số sao to trên ô (~1 s); mẹo lần đầu "Random type, +1★".
//  Không đổi luật / bộ đếm giờ: chỉ bọc ghep() để hẹn hiển thị theo đồng hồ hiệu ứng có sẵn (VX.hen).
'use strict';

const KG = {
  CHON_S: 4, // chế độ chạm–chạm: ụ được chọn giữ 4 s
  LO_S: 1.0, // tấm kết quả hiện ~1 s
  ANH: ['khung_chon', 'sup_ring', 'h2_vong_do', 'nhan_kn', 'h2_sao', 'h2_sao_sang', 'h2_vfx_ghep'],
  TXT: { tip: 'Random type, +1★', tipDB: 'Special merge', tipSao: (n) => 'Same turret, +' + n + '★', tipKN: 'Skill, not a merge',
    // Wild Link (game.js saoGhep): luôn hiện (không tính 3 lần mẹo) — sao kết quả, cảnh báo nếu THẤP hơn ụ cao, xác suất +1★ cấp thẻ
    tipTD: (a, b) => { const n = saoGhep(a, b), m = Math.max(a.sao, b.sao), p = Math.round(tdThuong(G.ban[b.ban]) * 100); return 'Wild merge: random ' + n + '★' + (n < m ? ' (−' + (m - n) + '★)' : '') + (n < LUAT.saoMax && p > 0 ? ' · ' + p + '%: ' + (n + 1) + '★' : ''); }, tapTip: 'Tap a glowing turret to merge', tipPM: 'Release: FUSE into 1 mask', huy: 'Cancelled' },
  lo: [], // tấm kết quả đang hiện: { B, o, T, t0 }
  _tip: null,

  soMeo() { try { return +(localStorage.getItem('thap_kg_meo') || 0); } catch (e) { return 9; } },
  ghiMeo() { try { localStorage.setItem('thap_kg_meo', String(this.soMeo() + 1)); } catch (e) { } },
  img(t) { return typeof REN !== 'undefined' ? REN.img(t) : null; },

  // nguồn đang chọn để ghép (kéo hoặc chạm–chạm); hết hạn / ụ biến mất → null
  nguon() {
    const k = UI.keo;
    if (k && k.dang) return k.T;
    const c = UI.chonGhep; if (!c) return null;
    const B = G.ban[0];
    if (!B || B.t[c.T.o] !== c.T || G.ketThuc || G.dung || performance.now() - c.t0 > this.CHON_S * 1000) { UI.chonGhep = null; return null; }
    return c.T;
  },
  // ô đích đang rê (chỉ khi kéo)
  dich() {
    const k = UI.keo; if (!k || !k.dang) return null;
    const [x, y] = UI.diemKeo(k), D = UI.uTai(x, y);
    return D && D !== k.T ? D : null;
  },

  // 9 mảnh: khung_chon (viền nguồn 34 px như hud2.css)
  khung9(ctx, a, x, y, w, h, b) {
    const s = 34, iw = a.width, ih = a.height;
    const sx = [0, s, iw - s, iw], sy = [0, s, ih - s, ih];
    const dx = [x, x + b, x + w - b, x + w], dy = [y, y + b, y + h - b, y + h];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      if (i === 1 && j === 1) continue;
      const sw = sx[i + 1] - sx[i], sh = sy[j + 1] - sy[j], dw = dx[i + 1] - dx[i], dh = dy[j + 1] - dy[j];
      if (sw > 0 && sh > 0 && dw > 0 && dh > 0) ctx.drawImage(a, sx[i], sy[j], sw, sh, dx[i], dy[j], dw, dh);
    }
  },
  // tấm 3 mảnh ngang (nhan_kn): 2 đầu giữ tỉ lệ, giữa kéo dài
  tam3(ctx, a, x, y, w, h) {
    const e = Math.round(a.width * 0.4), de = Math.min(w / 2, e * h / a.height);
    ctx.drawImage(a, 0, 0, e, a.height, x, y, de, h);
    ctx.drawImage(a, e, 0, a.width - 2 * e, a.height, x + de, y, w - 2 * de, h);
    ctx.drawImage(a, a.width - e, 0, e, a.height, x + w - de, y, de, h);
  },

  // ---------- lớp dưới (sau khi vẽ ụ, trước huy hiệu): khung ô hợp lệ + vòng nguồn ----------
  veDuoi(ctx) {
    const src = this.nguon(); if (!src) return;
    const B = G.ban[src.ban]; if (!B || B.t[src.o] !== src) return;
    const t = performance.now() / 1000, nh = 0.5 + 0.5 * Math.sin(t * 7);
    const hover = this.dich(), fr = this.img('khung_chon'), vong = this.img('sup_ring');
    ctx.save();
    if (UI.chonGhep && !(UI.keo && UI.keo.dang) && vong) { // chạm–chạm: vòng chọn quanh ụ nguồn
      const c = B.o[src.o], S = Math.min(B.cw, B.ch) * (0.98 + 0.04 * nh);
      REN.anhGiua(ctx, vong, c.x, c.y, S, 0, 0.95);
    }
    for (let i = 0; i < 15; i++) {
      const N = B.t[i]; if (!N || N === src || !hopLeGhep(src, N)) continue;
      const c = B.o[i], on = hover === N, p = on ? 0 : 3 + 2 * nh;
      if (fr) {
        ctx.globalAlpha = on ? 1 : 0.62 + 0.38 * nh;
        this.khung9(ctx, fr, c.x - B.cw / 2 + p, c.y - B.ch / 2 + p, B.cw - 2 * p, B.ch - 2 * p, on ? 13 : 10);
      }
    }
    ctx.restore(); ctx.globalAlpha = 1;
  },
  // ---------- lớp trên (sau ụ đang kéo): vòng chọn / vòng đỏ ở ô rê + mẹo lần đầu ----------
  veTren(ctx) {
    const src = this.nguon();
    if (src) {
      const B = G.ban[src.ban], hover = this.dich();
      if (B && hover) {
        const c = B.o[hover.o], S = Math.min(B.cw, B.ch);
        if (hopLeGhep(src, hover)) { const v = this.img('sup_ring'); if (v) REN.anhGiua(ctx, v, c.x, c.y, S * 1.06, 0, 1); }
        else { const v = this.img('h2_vong_do'); if (v) REN.anhGiua(ctx, v, c.x, c.y, S * 0.86, 0, 0.95); }
      }
      this.veMeo(ctx, src, hover);
    }
    this.veLo(ctx);
    ctx.globalAlpha = 1;
  },

  // chữ mẹo khi rê src lên hover (đã hợp lệ): ghép thường "Random type, +1★" · ghép đặc biệt thật "Special merge" ·
  //   kỹ năng kéo thả KHÔNG phải ghép (08/11, game.js laGhepThat): Merge King "Same turret, +n★", Copycat / Teleporter / Overclock… "Skill, not a merge"
  chuMeo(src, hover) {
    const db = ghepDBHop(src, hover); if (!db) return laTuDo(src, hover) ? this.TXT.tipTD(src, hover) : this.TXT.tip;
    if (laGhepThat(src, hover)) return this.TXT.tipDB;
    return db.sk.ghepDB.nangTaiCho && db.sk.ghepDB.xemSao ? this.TXT.tipSao(Math.max(1, db.sk.ghepDB.xemSao(db.a, db.b) - db.b.sao)) : this.TXT.tipKN;
  },
  // mẹo trước khi ghép (3 lần đầu): "Random type, +1★" (ghép đặc biệt: "Special merge"); chạm–chạm: hướng dẫn chạm ô sáng
  veMeo(ctx, src, hover) {
    const B = G.ban[src.ban];
    let s = null, c = null;
    const dp = UI.keo && UI.keo.dang && UI.keo.duong; // Prism Thief: đang vuốt đủ 4 ô hợp thể hợp lệ → mẹo hợp thể thay mẹo ghép (skills7.js)
    if (dp && dp.length === 4 && SKILLS.bienmau && SKILLS.bienmau.kiemMach(B, dp).ds) { s = this.TXT.tipPM; c = B.o[dp[3]]; }
    else if (hover && hopLeGhep(src, hover)) { s = this.chuMeo(src, hover); c = B.o[hover.o]; }
    else if (UI.chonGhep && !(UI.keo && UI.keo.dang)) { s = this.TXT.tapTip; c = B.o[src.o]; }
    if (!s) { this._tip = null; return; }
    if (this.soMeo() >= 3 && (s === this.TXT.tip || s === this.TXT.tapTip)) return;
    if (!this._tip || this._tip.s !== s) this._tip = { s, t0: performance.now() };
    const u = Math.min(1, (performance.now() - this._tip.t0) / 140);
    this.tam(ctx, s, c.x, c.y - Math.min(B.cw, B.ch) * 0.78, 13, '#eaf6ff', u, 0.9 + 0.1 * u);
  },
  // tấm chữ (ảnh nhan_kn) + chữ canvas
  // khung bao của tấm chữ (cùng công thức với tam) — dùng để tấm mới THAY tấm cũ chồng lên nó (không bao giờ 2 tấm đè nhau)
  khungTam(s, x, y, px, sc, sao) {
    const im = REN.chuAnh(s, '#ffffff', px), hh = px * 2.1 * sc, bw = sao ? hh * 0.95 : 0, w = Math.min(W - 8, (im.tw + px * 1.6) * sc + bw), cx = clamp(x, w / 2 + 4, W - w / 2 - 4);
    return [cx - w / 2 - (sao ? hh * 0.2 : 0), y - hh * 0.72, Math.max(cx + w / 2, cx - w / 2 + hh * 1.15), y + hh * 0.63];
  },
  tam(ctx, s, x, y, px, mau, al, sc, sao) {
    const a = this.img('nhan_kn'), im = REN.chuAnh(s, mau, px);
    const hh = px * 2.1 * sc, bw = sao ? hh * 0.95 : 0, w = Math.min(W - 8, (im.tw + px * 1.6) * sc + bw), cx = clamp(x, w / 2 + 4, W - w / 2 - 4);
    ctx.globalAlpha = al;
    if (a) this.tam3(ctx, a, cx - w / 2, y - hh / 2, w, hh);
    const q = Math.min(sc, (w - bw - px * 1.2 * sc) / Math.max(1, im.tw)), tx = cx + bw / 2;
    REN.veChuAnh(ctx, im, tx - im.lw * q / 2, y - im.by * q + px * 0.36 * q, im.lw * q, im.lh * q);
    if (sao) { const hb = REN.huyHieuDong(sao, hh * 0.9); if (hb) ctx.drawImage(hb, cx - w / 2 - hh * 0.2, y - hh * 0.72, hh * 1.35, hh * 1.35); }
  },

  // ---------- kết quả ghép: tấm tên + số sao to trên ô, ~1 s ----------
  hien(B, o) {
    const T = B.t[o]; if (!T) return;
    this.lo = this.lo.filter(l => !(l.B === B && l.o === o));
    this.lo.push({ B, o, T, t0: performance.now() });
    if (this.lo.length > 4) this.lo.shift();
    this.boChong();
  },
  // ghép 2 ô cạnh nhau liên tiếp (3×: cách nhau vài chục ms) → tấm tên cũ bị tấm mới đè: tấm MỚI thay luôn tấm cũ chồng lên nó
  // (tính theo khung lớn nhất lúc phóng 1.25 → không đè cả lúc nảy). Mọi chế độ: SOLO / CO-OP / PVP / ONLINE dùng chung KG.
  khungLo(l) {
    const c = l.B.o[l.o], C = Math.min(l.B.cw, l.B.ch), r = G.rosterMap[l.T.id];
    return this.khungTam(r ? r.ten : l.T.id, c.x, c.y + C * 0.36, 12, 1.25, l.T.sao);
  },
  boChong() {
    const giu = [];
    for (let i = this.lo.length - 1; i >= 0; i--) {
      const l = this.lo[i]; let k; try { k = this.khungLo(l); } catch (e) { giu.push(l); continue; }
      if (giu.some(g => g._k && k[0] < g._k[2] && g._k[0] < k[2] && k[1] < g._k[3] && g._k[1] < k[3])) continue;
      l._k = k; giu.push(l);
    }
    this.lo = giu.reverse();
  },
  veLo(ctx) {
    if (!this.lo.length) return;
    const now = performance.now();
    this.lo = this.lo.filter(l => now - l.t0 < this.LO_S * 1000 && l.B.t[l.o] === l.T && G.ban.includes(l.B));
    if (this.lo.length > 1) this.boChong();
    for (const l of this.lo) {
      const u = (now - l.t0) / 1000, c = l.B.o[l.o], C = Math.min(l.B.cw, l.B.ch), r = G.rosterMap[l.T.id];
      const sc = u < 0.12 ? 1.25 - 0.25 * (u / 0.12) : 1, al = u < 0.08 ? u / 0.08 : u > this.LO_S - 0.25 ? (this.LO_S - u) / 0.25 : 1;
      if (!(typeof HUD2 !== 'undefined' && HUD2.bat) && u < 0.24) { // chớp ghép (hud2_13) khi HUD v2 không bật
        const a = this.img('h2_vfx_ghep'); if (a) { const f = u < 0.12 ? 0 : 1, fw = a.width / 2; ctx.globalAlpha = 1 - u / 0.24; ctx.drawImage(a, f * fw, 0, fw, a.height, c.x - C * 0.5, c.y - C * 0.45, C, C * a.height / fw); }
      }
      this.tam(ctx, r ? r.ten : l.T.id, c.x, c.y + C * 0.36, 12, '#ffffff', al, sc, l.T.sao);
    }
  },
};

// ---------- bọc ghep(): hẹn tấm kết quả đúng lúc ụ mới lộ ra (không đổi luật / giờ) ----------
if (typeof ghep === 'function') {
  const g = ghep;
  ghep = function (B, a, b, ep) {
    const B2 = G.ban[b.ban], o = b.o, th = laGhepThat(a, b, ep), r = g.apply(this, arguments);
    if (r && th && B2 && B2 === G.ban[0] && !B2.ai) { // chỉ ghép thật mới có tấm kết quả ghép (Merge King +★ / Copycat / Teleporter: kỹ năng tự hiện nhãn)
      KG.ghiMeo();
      const lo = (r.vxA && r.vxA.lo) || VX.TRE_LO;
      VX.hen(lo, () => KG.hien(B2, o));
    }
    // chỉ bỏ chọn chạm–chạm khi ghép trên BÀN MÌNH — bàn AI đồng đội / đối thủ ghép liên tục ở CO-OP/PVP từng xoá mất ô đang chọn
    if (UI.chonGhep && B2 === G.ban[0]) UI.chonGhep = null;
    return r;
  };
}
// nạp trước ảnh kéo ghép khi vào trận
if (typeof REN !== 'undefined') REN.napTruoc(KG.ANH);
