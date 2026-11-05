// QUÁI PIXELLAB — 3 con nấm Thornwood (05/11/2026, docs/review/ke-hoach-cai-thien/pixellab-quai-nam/bao-cao.md).
// Hình do PixelLab vẽ (một hướng south-east, động tác dựng bằng khung xương PixelLab), ghép thành tấm ở game/art/custom/:
//   thorncapGoblin  (Thorncap Goblin)  thay HÌNH Heo Rừng Con  (heoCon, Lính xông vùng Rừng: cào chân rồi húc thẳng)
//   sporePuff       (Spore Puff)       thay HÌNH Hoa Phun Bào Tử (hoaBaoTu, Xạ thủ vùng Rừng: phun 3 hạt bào tử)
//   toadstoolKing   (Toadstool King)   thay hình Nấm Chúa (namChua) ở MỌI ải (05/11 15:41 chủ game duyệt; trước đó chỉ bản thử 5 phút đầu)
//                   — docs/review/ke-hoach-cai-thien/quai-nam-moi-ai/bao-cao.md
// CHỈ ĐỔI HÌNH: mã quái (e.art / b.art) giữ nguyên nên kỹ năng, chỉ số, hộp va chạm, thời điểm ra đòn, hiệu ứng vẽ code y như cũ.
// Cách làm: lúc vẽ quái mang mã cũ, tạm đặt tấm mới vào chỗ tấm cũ trong G.spriteCustom.ds (js/sprite_custom.js không phải sửa) rồi trả lại.
// Toadstool King lúc đứng Fire Guard (js/slice.js): đứng / đi phát hàng 'ne' (giơ gậy lên chắn, một lần) rồi hàng 'noi' (giữ thế chắn, lặp).
// Cờ quay lui: ?quaipl=0 (G.QUAI_PL = false) → không dùng 3 tấm mới, hình y như trước.
(function () {
  'use strict';
  const G = window.G;
  if (!G) return;
  if (G.QUAI_PL === undefined) { let tat = false; try { tat = typeof location !== 'undefined' && /[?&]quaipl=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; } G.QUAI_PL = !tat; }
  const SC = G.spriteCustom, MA = G.monsterArt;
  const MOI = ['thorncapGoblin', 'sporePuff', 'toadstoolKing'];
  const QP = (G.quaiPl = { MOI, THAY: { heoCon: 'thorncapGoblin', hoaBaoTu: 'sporePuff', namChua: (G.slice && G.slice.anhTrum) || 'toadstoolKing' }, TRUM: { namChua: (G.slice && G.slice.anhTrum) || 'toadstoolKing' } });
  if (!SC || !SC.ds || !MA || typeof MA.draw !== 'function') return;
  // Tấm mới không phải con quái riêng: bỏ khỏi danh sách quái (sprite_custom.js tự thêm tấm lạ vào MA.list, dùng cho việc ngày / công cụ).
  if (Array.isArray(MA.list)) for (let i = MA.list.length - 1; i >= 0; i--) if (MOI.indexOf(MA.list[i] && MA.list[i].id) >= 0 && MA.list[i].tuVe) MA.list.splice(i, 1);
  if (G.QUAI_PL === false) { for (const m of MOI) if (SC.remove) SC.remove(m); return; }

  // bản thử 5 phút đầu đang chạy (js/slice.js đặt S.slice ở G.startStage)
  const runSlice = () => { try { const S = G.getRun && G.getRun(); return S && S.slice ? S : null; } catch (e) { return null; } };
  function tamMoi(id) {
    let m = QP.THAY[id];
    if (!m && QP.TRUM[id] && runSlice() && !G.SLICE_ANH_CU) m = QP.TRUM[id];
    if (m && QP.TRUM[id] && G.SLICE_ANH_CU && runSlice()) m = null; // ?slicecu=1 trong bản thử: giữ ảnh mượn cũ như trước
    if (!m || !SC.ds[m]) return null;
    return SC.get(m); // chưa tải xong → null (vẽ tấm cũ), đồng thời xin tải ngay (ảnh rời)
  }
  // Fire Guard: hai bản "nhìn" của tấm vua (chung ảnh, chung bộ nhớ đệm màu) mà hàng đứng / đi trỏ sang hàng dựng khiên / giữ khiên
  const banGuard = new Map();
  function banKhien(sp, ten) {
    let b = banGuard.get(sp);
    if (!b) { b = {}; banGuard.set(sp, b); }
    if (!b[ten] || b[ten].img !== sp.img || b[ten].ready !== sp.ready) { // ảnh được giải phóng / tải lại (bộ nhớ, js/sprite_custom.js) → dựng lại bản nhìn
      const a = sp.dt[ten], r = { hang: a.hang, so: a.so, giay: a.giay, lap: ten === 'noi', mo: null };
      b[ten] = Object.assign(Object.create(Object.getPrototypeOf(sp)), sp, { dt: Object.assign({}, sp.dt, { idle: r, move: r }) });
    }
    return b[ten];
  }
  function guardCua(id, o) {
    if (!QP.TRUM[id] || !o || (o.anim !== 'idle' && o.anim !== 'move')) return null;
    const S = runSlice(), g = S && S.slice && S.slice.guard;
    if (!g || !(g.t > 0)) return null;
    return { tg: Math.max(0, (G.time || 0) - (g.t0 || 0)) };
  }
  const draw0 = MA.draw;
  MA.draw = function (c, id, x, y, o) {
    const sp = tamMoi(id);
    if (!sp) return draw0.apply(this, arguments);
    let ve = sp, o2 = o;
    const gd = guardCua(id, o);
    if (gd && sp.dt.ne && sp.dt.noi) {
      const tRa = sp.dt.ne.giay;
      if (gd.tg < tRa) { ve = banKhien(sp, 'ne'); o2 = Object.assign({}, o, { t: gd.tg }); }
      else { ve = banKhien(sp, 'noi'); o2 = Object.assign({}, o, { t: gd.tg - tRa }); }
    }
    const cu = SC.ds[id];
    SC.ds[id] = ve;
    try { return draw0.call(this, c, id, x, y, o2); } finally { if (cu) SC.ds[id] = cu; else delete SC.ds[id]; }
  };
  QP.tamMoi = tamMoi;
})();
