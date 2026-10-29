'use strict';
/* =====================================================================================================================
   vfx.js – VỆT CHÉM tách khỏi sprite: cung pixel 3 màu (bạc sáng · kem · xanh mũ sáng) vẽ theo ĐÚNG hộp chém của engine.
   Cung = một dải elip NẰM TRONG hộp (không vượt mép), mỗi đòn một góc quét riêng. Vẽ theo lưới điểm sprite (2 px logic) để hợp
   nét pixel của Lam; hiện suốt pha ra đòn: 2 bước đầu quét nhanh ra, sau đó mỏng dần. Hộp, sát thương, thời điểm KHÔNG đổi.
   Tắt bằng ?vfx=0. Thêm: tia trúng (điểm ảnh) + vòng nảy pogo.
   LAM CHIBI v3 – chém 1/2/3: KHÔNG dùng cung theo hộp mà vẽ cung âm thanh đã duyệt THEO HÌNH đang hiện (vfx-lam.js, do
   code/xuat_vfx_lam.py tính từ bản xem thử): điểm sprite 1:1 (×ti_le), pixel bậc thang, lật gương khi quay trái.
     chém 1: hình 3 cung ")" amber + viền cyan → hình 4 cyan mờ → tắt · chém 2: cung chéo thấp → cao, như vậy
     chém 3: hình 3–4 vòng sáng quanh chuông · hình 5 sóng âm kép + vòng đứt · hình 6 dư âm cyan mờ (vòng ngoài dịch ra 4 điểm)
   Bị đánh: chớp trắng ấm 3 bước (50 ms) – index.html vẽ bóng trắng của hình; đẩy lùi do engine (hurt).
   ===================================================================================================================== */
const VFX = (() => {
  const OPT = {bat: DC_Q.get('vfx') !== '0'};
  const MAU = ['#eef1f0', '#f1e4c4', '#6c93bf'];   // lõi bạc sáng (ngoài) → kem → xanh mũ sáng (trong)
  const D = 2;                                      // cỡ điểm vệt = 1 điểm sprite = 2 px logic
  // tâm elip (tỉ lệ trong hộp, mặt phải), bán kính (tỉ lệ cỡ hộp), góc quét a0 → a1 (độ; 0 = trước, 90 = xuống, −90 = lên)
  const CUNG = {
    1: {cx:0.06, cy:0.5,  rx:0.92, ry:0.5,  a0:-80, a1:70},    // ngang ra trước
    2: {cx:0.12, cy:0.62, rx:0.86, ry:0.62, a0:75,  a1:-95},   // chéo dưới → trên
    3: {cx:0.1,  cy:1.0,  rx:0.88, ry:1.0,  a0:-100, a1:-5},   // bổ từ trên xuống mặt đất (hộp thấp)
    4: {cx:0.5,  cy:0.0,  rx:0.5,  ry:1.0,  a0:150, a1:30},    // pogo: bát úp xuống dưới chân
    5: {cx:0.45, cy:1.0,  rx:0.55, ry:1.0,  a0:-10, a1:-170},  // hất: vòm lên trên đầu
    6: {cx:0.06, cy:0.5,  rx:0.92, ry:0.5,  a0:-85, a1:80}     // trên không: như nhát 1, quét rộng hơn
  };
  const TIA = [], VONG = [];
  const LAM = typeof VFX_LAM !== 'undefined' ? VFX_LAM : null;
  let chop = 0;                                     // bước chớp trắng còn lại (bị đánh)
  // cung âm thanh Lam chibi theo hình; true = đòn này do bảng LAM lo (kể cả hình không có điểm → không vẽ cung cũ)
  function veLamChibi(g, camX){
    const HA = HoatAnh.A, C = HA.clip, st = HA.st, pl = DongCo.pl;
    if (!LAM || !C || C.tam || !st || !st.n || st.n > 3 || st.ten !== C.ten || !LAM[C.ten]) return false;
    const ds = LAM[C.ten][HA.k]; if (!ds) return true;
    const s = C.ti_le, fx = Math.round(pl.x + pl.w / 2 - camX), fy = Math.round(pl.y + pl.h), lat = pl.face < 0;
    for (const [x, y, m] of ds){
      const dx = x - LAM.neo[0];
      g.fillStyle = LAM.mau[m]; g.fillRect(lat ? fx - (dx + 1) * s : fx + dx * s, fy + (y - LAM.neo[1]) * s, s, s);
    }
    return true;
  }
  function veCung(g, hb, n, face, t, ac, camX){
    const c = CUNG[n]; if (!c) return;
    const quet = Math.min(1, (t + 1) / 2);             // 2 bước đầu: quét ra
    const day = 0.34 * (1 - 0.6 * Math.max(0, (t - 1) / Math.max(1, ac - 2)));   // bề dày (tỉ lệ bán kính) mỏng dần
    const RX = c.rx * hb.w, RY = c.ry * hb.h;
    const CX = face > 0 ? hb.x + c.cx * hb.w : hb.x + hb.w - c.cx * hb.w, CY = hb.y + c.cy * hb.h;
    const a0 = c.a0 * Math.PI / 180, a1 = c.a1 * Math.PI / 180, aMax = a0 + (a1 - a0) * quet;
    const x0 = Math.floor(hb.x / D) * D, y0 = Math.floor(hb.y / D) * D;
    for (let y = y0; y < hb.y + hb.h; y += D) for (let x = x0; x < hb.x + hb.w; x += D){
      const px = x + D / 2, py = y + D / 2;
      if (px < hb.x || px > hb.x + hb.w || py < hb.y || py > hb.y + hb.h) continue;
      const u = (px - CX) * face / RX, v = (py - CY) / RY, r = Math.hypot(u, v);
      if (r > 1 || r < 1 - day) continue;
      const a = Math.atan2(v, u);
      const s = (a - a0) / (a1 - a0), sm = (aMax - a0) / (a1 - a0);
      if (s < 0 || s > sm) continue;
      const dd = day * (0.3 + 0.7 * Math.sin(Math.PI * s / Math.max(0.01, sm)));   // hai đầu cung nhọn, giữa dày
      const q = (1 - r) / Math.max(0.0001, dd);
      if (q > 1) continue;
      g.fillStyle = q < 0.34 ? MAU[0] : q < 0.67 ? MAU[1] : MAU[2];
      g.fillRect(x - camX, y, D, D);
    }
  }
  function suKien(ds){
    if (chop > 0) chop--;
    for (const e of ds){
      if (e.k === 'bi-danh') chop = 3;
      if (e.k === 'trung') for (let i = 0; i < 8; i++){ const a = (i / 8) * Math.PI * 2 + 0.3;
        TIA.push({x:e.x, y:e.y, vx:Math.cos(a) * (2 + (i % 2) * 2), vy:Math.sin(a) * (2 + (i % 2) * 2) - 0.6, t:10 + (i % 3) * 2}); }
      if (e.k === 'nay') VONG.push({x:e.x, y:e.y, t:0});
    }
  }
  function buoc(){
    for (let i = TIA.length - 1; i >= 0; i--){ const p = TIA[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.18; if (--p.t <= 0) TIA.splice(i, 1); }
    for (let i = VONG.length - 1; i >= 0; i--) if (++VONG[i].t > 12) VONG.splice(i, 1);
  }
  function ve(g, camX){
    const E = DongCo, pl = E.pl;
    if (OPT.bat && pl.atkN && !pl.dead && !veLamChibi(g, camX)){
      const hb = E.atkBox(pl, pl.atkN, pl.atkT, pl.face, {x:0, y:0, w:0, h:0});
      if (hb) veCung(g, hb, pl.atkN, pl.face, pl.atkT - E.ATK[pl.atkN].su, E.ATK[pl.atkN].ac, camX);
    }
    for (const p of TIA){ g.fillStyle = p.t > 6 ? MAU[0] : MAU[1]; g.fillRect(Math.round((p.x - camX) / D) * D, Math.round(p.y / D) * D, D, D); }
    for (const v of VONG){   // vòng nảy pogo: elip điểm thưa nở ra
      const R = 10 + v.t * 3; g.fillStyle = v.t < 6 ? MAU[0] : MAU[2];
      for (let i = 0; i < 20; i++){ const a = i / 20 * Math.PI * 2; g.fillRect(Math.round((v.x + Math.cos(a) * R - camX) / D) * D, Math.round((v.y + Math.sin(a) * R * 0.4) / D) * D, D, D); }
    }
  }
  return {ve, suKien, buoc, OPT, CUNG, chopTrang: () => chop > 0};
})();
