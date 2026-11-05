// TURRET MERGE — LÕI NHÀ CHÍNH: số tim còn lại ngay trên lõi (huy hiệu ♥ + số), lõi chớp đỏ / rung / nứt dần khi mất tim.
// Tách riêng file: render.js chỉ gọi CORE.veLoi() (vẽ lõi) và CORE.veHud() (vẽ huy hiệu, trên cùng).
// SOLO: 1 lõi · CO-OP: 1 lõi chung (luật: 1 quái lọt = thua → hiện 1 tim chung) · PVP: mỗi bên 1 lõi, tim riêng.
'use strict';

const CORE = {
  st: {}, _nut: {}, _do: {},
  // các bàn dồn về lõi này (đầu mút đường đi)
  banCua(key) { const ds = []; for (const p of G.duong) if (p.pts[p.pts.length - 1] + '' === key && !ds.includes(p.ban)) ds.push(p.ban); return ds; },
  timMax() { return G.che === 'coop' ? 1 : G.che === 'pvp' ? LUAT.timPvp : LUAT.timSolo; },
  timCon(key) {
    if (G.che === 'coop') return this._coopLot ? 0 : 1;
    const ds = this.banCua(key), B = G.ban[ds[0]];
    return B ? Math.max(0, B.tim) : 0;
  },
  // trạng thái hiệu ứng mỗi lõi; tự phát hiện mất tim bằng cách so số hiện tại với số đang hiển thị
  lay(key) {
    let s = this.st[key];
    const con = this.timCon(key);
    if (!s || s.van !== G._vanCore) { s = this.st[key] = { hien: con, cu: con, chop: 0, rung: 0, nhip: 0, cuon: 1, van: G._vanCore }; }
    if (con < s.hien) { s.cu = s.hien; s.hien = con; s.chop = 1; s.rung = 1; s.nhip = 1; s.cuon = 0; }
    else if (con > s.hien) { s.cu = s.hien; s.hien = con; s.nhip = 0.6; s.cuon = 0; }
    return s;
  },
  capNhat(s, dt) {
    s.chop = Math.max(0, s.chop - dt * 1.6); s.rung = Math.max(0, s.rung - dt * 2.6);
    s.nhip = Math.max(0, s.nhip - dt * 2.4); s.cuon = Math.min(1, s.cuon + dt * 4.5);
  },
  // mức hư hại 0..1 (0 = đủ tim)
  hu(s) { const m = this.timMax(); return G.che === 'coop' ? (s.hien ? 0 : 1) : 1 - s.hien / m; },

  // lõi đã cắt sẵn + vết nứt theo mức (vết nứt chỉ vẽ trên phần đặc của ảnh: source-atop)
  loiNut(ren, px, muc) {
    const key = px + '|' + muc + '|' + ren.s + '|' + ren.dpr;
    if (this._nut[key]) return this._nut[key];
    const a = ren.co('loi', px, ''); if (!a) return null;
    const c = document.createElement('canvas'); c.width = a.width; c.height = a.height;
    const x = c.getContext('2d'); x.drawImage(a, 0, 0);
    if (muc > 0) {
      const w = c.width, h = c.height, k = w / 60;
      const VET = [
        [[0.50, 0.30], [0.44, 0.42], [0.53, 0.50], [0.46, 0.62], [0.52, 0.72]],
        [[0.62, 0.36], [0.70, 0.46], [0.63, 0.55], [0.72, 0.66]],
        [[0.38, 0.40], [0.31, 0.50], [0.39, 0.58], [0.33, 0.70]],
        [[0.53, 0.50], [0.60, 0.53]], [[0.46, 0.62], [0.39, 0.64]],
      ];
      const n = muc >= 2 ? VET.length : 2;
      x.globalCompositeOperation = 'source-atop'; x.lineJoin = x.lineCap = 'round';
      for (let i = 0; i < n; i++) {
        const v = VET[i]; x.beginPath(); v.forEach(([u, t], j) => j ? x.lineTo(u * w, t * h) : x.moveTo(u * w, t * h));
        x.strokeStyle = 'rgba(20,6,10,.85)'; x.lineWidth = 2.6 * k; x.stroke();
        x.strokeStyle = muc >= 2 ? 'rgba(255,80,60,.95)' : 'rgba(255,170,120,.85)'; x.lineWidth = 0.9 * k; x.stroke();
      }
      // lõi tối dần
      x.fillStyle = 'rgba(40,0,10,' + (muc >= 2 ? 0.28 : 0.14) + ')'; x.fillRect(0, 0, w, h);
    }
    if (Object.keys(this._nut).length > 40) this._nut = {};
    return (this._nut[key] = c);
  },
  // bóng đỏ của lõi (chớp đỏ khi mất tim / cảnh báo)
  loiDo(ren, px) {
    const key = px + '|' + ren.s + '|' + ren.dpr;
    if (this._do[key]) return this._do[key];
    const a = ren.co('loi', px, ''); if (!a) return null;
    const c = document.createElement('canvas'); c.width = a.width; c.height = a.height;
    const x = c.getContext('2d'); x.drawImage(a, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#ff2a2a'; x.fillRect(0, 0, c.width, c.height);
    return (this._do[key] = c);
  },

  // gọi từ REN.veCongLoi thay cho đoạn vẽ lõi; trả true = đã vẽ
  veLoi(ctx, ren, e, key) {
    const s = this.lay(key), t = ren.t, d = this.hu(s), px = 60;
    const sap = s.hien === 1 && !G.ketThuc, canh = sap ? (0.5 + 0.5 * Math.sin(t * 5)) * (G.che === 'coop' ? 0.5 : 1) : 0;
    const rx = s.rung > 0 ? Math.sin(t * 70) * 3.2 * s.rung : 0, ry = s.rung > 0 ? Math.cos(t * 55) * 1.4 * s.rung : 0;
    const x = e[0] + rx, bob = Math.sin(t * 2.4) * 1.5 * (1 - d * 0.6), y = e[1] - 6 + bob + ry;
    // quầng sáng: xanh lam → đỏ theo mức hư hại; mờ dần khi yếu
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const nen = (0.24 + 0.06 * Math.sin(t * 3)) / 0.6 * (1 - d * 0.45);
    ctx.globalAlpha = nen * (1 - d);
    ctx.drawImage(ren.glow('loi', [[0, 'rgba(90,240,255,.6)'], [0.05, 'rgba(90,240,255,.6)'], [1, 'rgba(90,240,255,0)']]), e[0] - 44, e[1] - 52, 88, 88);
    ctx.globalAlpha = Math.min(1, nen * d + s.chop * 0.9 + canh * 0.55);
    ctx.drawImage(ren.glow('loi_do', [[0, 'rgba(255,60,50,.6)'], [0.05, 'rgba(255,60,50,.6)'], [1, 'rgba(255,60,50,0)']]), e[0] - 48, e[1] - 56, 96, 96);
    ctx.restore(); ctx.globalAlpha = 1;
    const muc = d <= 0.01 ? 0 : d < 0.6 ? 1 : 2;
    const c = this.loiNut(ren, px, muc);
    if (!c) return false;
    const h = px * c.height / c.width;
    ctx.drawImage(c, x - px / 2, y - h / 2, px, h);
    const aDo = Math.min(0.85, s.chop * 0.85 + canh * 0.22 + d * 0.1);
    if (aDo > 0.01) { const r = this.loiDo(ren, px); if (r) { ctx.globalAlpha = aDo; ctx.drawImage(r, x - px / 2, y - h / 2, px, h); ctx.globalAlpha = 1; } }
    return true;
  },

  // huy hiệu ♥ + số, vẽ sau cùng (không bị quái che); luôn trong khung W×H
  veHud(ctx, ren) {
    if (!G.duong || !G.duong.length) return;
    const dt = ren.dt || 0, t = ren.t, xong = new Set();
    for (const p of G.duong) {
      const e = p.pts[p.pts.length - 1], key = e + '';
      if (xong.has(key)) continue; xong.add(key);
      const s = this.lay(key); this.capNhat(s, dt);
      const sap = s.hien <= 1 && !G.ketThuc, canh = sap ? (0.5 + 0.5 * Math.sin(t * 5)) * (G.che === 'coop' ? 0.5 : 1) : 0;
      const hw = 23, hh = 12;
      const bx = Math.max(hw + 4, Math.min(W - hw - 4, e[0] - 32)), by = Math.max(hh + 4, Math.min(H - hh - 4, e[1] + 16));
      const sc = 1 + 0.35 * Math.sin(Math.min(1, s.nhip) * Math.PI) * (s.nhip > 0 ? 1 : 0);
      ctx.save(); ctx.translate(bx, by); ctx.scale(sc, sc);
      // viền đỏ phát sáng khi còn 1 tim / vừa mất tim
      const vienDo = Math.max(canh, s.chop);
      if (vienDo > 0.02) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = vienDo * 0.8; ctx.drawImage(ren.glow('loi_do', [[0, 'rgba(255,60,50,.6)'], [0.05, 'rgba(255,60,50,.6)'], [1, 'rgba(255,60,50,0)']]), -hw - 14, -hh - 20, hw * 2 + 28, hh * 2 + 40); ctx.restore(); }
      ctx.beginPath(); this.vienTron(ctx, -hw, -hh, hw * 2, hh * 2, hh);
      ctx.fillStyle = s.chop > 0.05 ? 'rgba(70,10,16,.94)' : 'rgba(14,17,24,.92)'; ctx.fill();
      ctx.lineWidth = 1.8; ctx.strokeStyle = s.hien <= 1 ? 'rgba(255,' + Math.round(90 + 60 * (1 - canh)) + ',90,1)' : s.hien < this.timMax() ? '#ffb070' : '#7fe8ff'; ctx.stroke();
      // tim
      if (!ren.ve1(ctx, 'ui_tim', 19, s.hien ? '' : 'xam', -hw + 12, 0.5)) { ctx.fillStyle = '#ff4b5c'; ctx.font = FONT.d(14); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('♥', -hw + 12, 1); }
      // số: cuộn xuống (số cũ trượt lên mờ dần, số mới trồi lên)
      ctx.save(); ctx.beginPath(); ctx.rect(-hw + 22, -hh + 1, hw * 2 - 23, hh * 2 - 2); ctx.clip();
      ctx.font = FONT.d(19); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      const nx = hw - 11, k = s.cuon, mau = s.hien <= 1 ? '#ff6b6b' : '#fff';
      const so = (v, yy, al, m) => { ctx.globalAlpha = al; ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.strokeText(v, nx, yy); ctx.fillStyle = m; ctx.fillText(v, nx, yy); };
      if (k < 1) so(String(s.cu), 1.5 - k * 16, 1 - k, '#fff');
      so(String(s.hien), 1.5 + (1 - k) * 16, k, s.chop > 0.3 ? '#ff4040' : mau);
      ctx.restore();
      ctx.restore(); ctx.globalAlpha = 1;
    }
  },
  vienTron(x, a, b, w, h, r) { x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); },
};

// CO-OP: luật "1 quái lọt = thua" không trừ tim → ghi nhận để lõi chung về 0 và chớp đỏ.
// Mỗi trận mới (batDau) đánh số ván để làm mới trạng thái lõi.
(function () {
  if (typeof lot === 'function') {
    const goc = lot;
    lot = function (E) { if (G.che === 'coop' && !G.ketThuc) CORE._coopLot = true; return goc.apply(this, arguments); };
  }
  if (typeof batDau === 'function') {
    const goc = batDau;
    batDau = function () { G._vanCore = (G._vanCore || 0) + 1; CORE._coopLot = false; CORE.st = {}; return goc.apply(this, arguments); };
  }
  // tim trên thanh trên cùng: tim vừa mất nảy đỏ rồi xám đi (cùng lúc với lõi)
  const st = document.createElement('style');
  st.textContent = '#tb-tim img:not(.mat) + img.mat{animation:timMat .6s ease-out}@keyframes timMat{0%{opacity:1;filter:drop-shadow(0 0 6px #ff3030);transform:scale(1.45)}100%{}}';
  document.head.appendChild(st);
})();
