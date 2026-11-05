// TURRET MERGE — LÕI NHÀ CHÍNH: tim còn lại = 3 khúc năng lượng trên vòng chân lõi (ảnh loi_vong_*), lõi chớp đỏ / rung / nứt dần khi mất tim.
// Tách riêng file: render.js chỉ gọi CORE.veLoi() (vẽ lõi) và CORE.veHud() (vẽ huy hiệu, trên cùng).
// SOLO: 1 lõi · CO-OP: 1 lõi chung, 3 tim CHUNG (giữ ở bàn 0) · PVP: mỗi bên 1 lõi, tim riêng.
'use strict';

const CORE = {
  st: {}, _nut: {}, _do: {},
  // các bàn dồn về lõi này (đầu mút đường đi)
  banCua(key) { const ds = []; for (const p of G.duong) if (p.pts[p.pts.length - 1] + '' === key && !ds.includes(p.ban)) ds.push(p.ban); return ds; },
  timMax() { return G.che === 'coop' ? LUAT.timCoop : G.che === 'pvp' ? LUAT.timPvp : LUAT.timSolo; },
  timCon(key) {
    if (G.che === 'coop') return G.ban[0] ? Math.max(0, G.ban[0].tim) : 0;
    const ds = this.banCua(key), B = G.ban[ds[0]];
    return B ? Math.max(0, B.tim) : 0;
  },
  // trạng thái hiệu ứng mỗi lõi; tự phát hiện mất tim bằng cách so số hiện tại với số đang hiển thị
  lay(key) {
    let s = this.st[key];
    const con = this.timCon(key);
    if (!s || s.van !== G._vanCore) { s = this.st[key] = { hien: con, cu: con, chop: 0, rung: 0, nhip: 0, cuon: 1, van: G._vanCore }; }
    if (con < s.hien) { s.cu = s.hien; s.hien = con; s.xa = 1; s.chop = 1; s.rung = 1; s.nhip = 1; s.cuon = 0; }
    else if (con > s.hien) { s.cu = s.hien; s.hien = con; s.nhip = 0.6; s.cuon = 0; }
    return s;
  },
  capNhat(s, dt) {
    s.chop = Math.max(0, s.chop - dt * 1.6); s.rung = Math.max(0, s.rung - dt * 2.6);
    s.nhip = Math.max(0, s.nhip - dt * 2.4); s.cuon = Math.min(1, s.cuon + dt * 4.5);
  },
  // mức hư hại 0..1 (0 = đủ tim)
  hu(s) { return 1 - s.hien / this.timMax(); },

  // lõi đã cắt sẵn + vết nứt theo mức (vết nứt chỉ vẽ trên phần đặc của ảnh: source-atop)
  loiNut(ren, px, muc) {
    // ảnh ChatGPT lõi hư: loi_hu2 (còn 1 tim, nứt đỏ) dùng nguyên ảnh; loi_hu1 (còn 2 tim) ảnh gen gần như chưa thấy nứt
    // → dùng làm nền + giữ 2 vết nứt cam mảnh vẽ code bên trên để người chơi vẫn đọc được "đã mất 1 tim"
    if (muc >= 2) { const b = ren.co('loi_hu2', px, ''); if (b) return b; }
    const nen = muc === 1 && ren.co('loi_hu1', px, '') ? 'loi_hu1' : 'loi';
    const key = px + '|' + muc + '|' + ren.s + '|' + ren.dpr + '|' + nen;
    if (this._nut[key]) return this._nut[key];
    const a = ren.co(nen, px, ''); if (!a) return null;
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
    const sap = s.hien === 1 && !G.ketThuc, canh = sap ? (0.5 + 0.5 * Math.sin(t * 5)) : 0;
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
    this.veVong(ctx, ren, s, x, y);
    return true;
  },

  // 3 TIM = 3 KHÚC NĂNG LƯỢNG trên vòng chân lõi (trái · giữa · phải, ảnh ChatGPT raw_core_ring.png).
  // Sáng = loi_vong_*_sang, mất = loi_vong_*_tat; khúc vừa mất: bản sáng loé (lighter) rồi mờ dần + tia vỡ loi_vong_no phóng to & tắt.
  // Còn 1 tim → khúc cuối thở nhịp. Toạ độ khớp vòng ngoài của lõi 60 px (tâm lõi x, y). Ảnh lưu 3× cỡ vẽ.
  VONG: [['trai', -20.2, 15.9], ['giua', 0, 27.7], ['phai', 20.2, 15.9]],
  veVong(ctx, ren, s, x, y) {
    const n = this.timMax(); if (n !== 3) return;
    const t = ren.t, con = s.hien, cu = Math.max(s.cu, con), sap = con === 1 && !G.ketThuc, xa = s.xa || 0;
    for (let i = 0; i < 3; i++) {
      const [ten, dx, dy] = this.VONG[i], sang = ren.img('loi_vong_' + ten + '_sang'), tat = ren.img('loi_vong_' + ten + '_tat');
      if (!sang || !tat) continue;
      const w = sang.width / 3, h = sang.height / 3, cx = x + dx, cy = y + dy;
      if (i < con) {
        ctx.globalAlpha = sap ? 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(t * 6)) : 1;
        ctx.drawImage(sang, cx - w / 2, cy - h / 2, w, h); ctx.globalAlpha = 1;
      } else {
        ctx.drawImage(tat, cx - w / 2, cy - h / 2, w, h);
        if (i < cu && xa > 0) {
          ctx.globalAlpha = xa; ctx.drawImage(sang, cx - w / 2, cy - h / 2, w, h);
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = xa * xa;
          ctx.drawImage(sang, cx - w / 2, cy - h / 2, w, h);
          const no = ren.img('loi_vong_no');
          if (no) { const k = 18 + (1 - xa) * 22; ctx.globalAlpha = Math.min(1, xa * 1.4); ctx.drawImage(no, cx - k / 2, cy - k / 2, k, k); }
          ctx.restore(); ctx.globalAlpha = 1;
        }
      }
    }
  },

  // gọi sau cùng mỗi khung: chỉ cập nhật trạng thái chớp/rung/mất tim (3 tim vẽ trên vòng chân lõi trong veLoi → veVong)
  veHud(ctx, ren) {
    if (!G.duong || !G.duong.length) return;
    const dt = ren.dt || 0, xong = new Set();
    for (const p of G.duong) {
      const key = p.pts[p.pts.length - 1] + '';
      if (xong.has(key)) continue; xong.add(key);
      const s = this.lay(key); this.capNhat(s, dt);
      s.xa = Math.max(0, (s.xa || 0) - dt * 1.5);
    }
  },
};

// Mỗi trận mới (batDau) đánh số ván để làm mới trạng thái lõi.
(function () {
  if (typeof batDau === 'function') {
    const goc = batDau;
    batDau = function () { G._vanCore = (G._vanCore || 0) + 1; CORE.st = {}; return goc.apply(this, arguments); };
  }
  // tim trên thanh trên cùng: tim vừa mất nảy đỏ rồi xám đi (cùng lúc với lõi)
  const st = document.createElement('style');
  st.textContent = '#tb-tim img:not(.mat) + img.mat{animation:timMat .6s ease-out}@keyframes timMat{0%{opacity:1;filter:drop-shadow(0 0 6px #ff3030);transform:scale(1.45)}100%{}}';
  document.head.appendChild(st);
})();
