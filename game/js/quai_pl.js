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
// 05/11 pixellab-quai-vung-1-2 (docs/review/ke-hoach-cai-thien/pixellab-quai-vung-1-2/bao-cao.md): mọi quái thường, tinh anh, trùm nhỏ, trùm vùng
// của Rừng Gai (vùng 1) và Hang Chìm (vùng 2) cũng vẽ lại bằng PixelLab (bảng V12 dưới đây), cùng cách: chỉ đổi HÌNH, mã quái giữ nguyên.
//   - Hàng thêm trong tấm mới (game/js/sprite_custom.js chỉ đọc 9 hàng chuẩn, nên đọc ở đây từ tệp): tele_<chiêu> / atk_<chiêu> (vd tele_c2,
//     atk_chieu1) = động tác riêng của chiêu đó; phase = gầm chuyển pha. Lúc quái ra chiêu có hàng riêng, vẽ bằng một "bản nhìn" của tấm (chung ảnh)
//     mà hàng báo đòn / đánh trỏ sang hàng riêng → thời điểm, nhịp khung do game tính y như cũ.
//   - Hiệu ứng (bảng HU): ảnh hiệu ứng ChatGPT riêng của các quái này đổi sang dải khung PixelLab hu-pl-<tên> (CÙNG cỡ khung, điểm neo, số khung,
//     thời lượng, xoay, lặp như tệp cũ — chỉ khác ảnh). Ảnh mới chưa tải xong thì vẽ ảnh cũ. ?quaipl=0 tắt cả quái lẫn hiệu ứng mới.
(function () {
  'use strict';
  const G = window.G;
  if (!G) return;
  if (G.QUAI_PL === undefined) { let tat = false; try { tat = typeof location !== 'undefined' && /[?&]quaipl=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; } G.QUAI_PL = !tat; }
  const SC = G.spriteCustom, MA = G.monsterArt;
  const MOI = ['thorncapGoblin', 'sporePuff', 'toadstoolKing'];
  // Vùng 1 Rừng Gai + vùng 2 Hang Chìm (mã quái cũ → mã tấm PixelLab mới)
  const V12 = {
    ongVo: 'thimbleWasp', boHung: 'acornBeetle', chonBong: 'hoodWeasel', namPhong: 'puffcap', socNo: 'pineconeSquirrel', nhimDoc: 'briarHedgehog',
    heoNanh: 'tuskBoar', namPhongChua: 'puffcapKing', mocTinh: 'grimbark',
  };
  // Hiệu ứng riêng của các quái đó: mã cũ → mã dải khung PixelLab
  const HU = {};
  for (const k of ['cau-dat-lan', 'gai-re', 'qua-doc-roi', 'nut-re-moc', 'dan-qua-no']) HU['hu-' + k] = 'hu-pl-' + k;
  // Khác 3 quái nấm: tấm mới mang THẲNG mã quái cũ (tệp "quai_moi"), tấm ChatGPT cũ là <mã>-plcu chỉ nạp khi ?quaipl=0 (js/sprite_custom.js,
  // game/build.py quai_cu_cua) — người chơi không phải tải hai bản. Nên V12 KHÔNG nằm trong THAY; ở đây chỉ thêm hàng riêng của chiêu (banCua).
  const QP = (G.quaiPl = { MOI, V12, HU, THAY: { heoCon: 'thorncapGoblin', hoaBaoTu: 'sporePuff', namChua: (G.slice && G.slice.anhTrum) || 'toadstoolKing' }, TRUM: { namChua: (G.slice && G.slice.anhTrum) || 'toadstoolKing' } });
  const FA = G.fxAnh;
  if (FA && FA.ds && G.QUAI_PL === false) for (const k in HU) if (FA.remove) FA.remove(HU[k]);
  if (FA && FA.ds && G.QUAI_PL !== false) {
    // Đổi mã hiệu ứng khi vẽ: ảnh PixelLab đã sẵn thì dùng, chưa thì xin tải và vẽ ảnh cũ (cùng cỡ / neo / số khung nên không lệch).
    const goc = {};
    for (const n of ['get', 'co', 'lapCham']) if (typeof FA[n] === 'function') goc[n] = FA[n];
    for (const n of ['ve', 'veK', 'veO', 'veAffine']) if (typeof FA[n] === 'function') goc[n] = FA[n];
    const doi = (ma) => {
      const m = HU[ma];
      if (!m) return ma;
      const a = FA.ds[m];
      if (!a) return ma;
      if (a.ready) return m;
      if (goc.co) goc.co(m); // xin tải (js/fx_anh.js can())
      return ma;
    };
    QP.doiHu = doi;
    for (const n of ['get', 'co', 'lapCham']) if (goc[n]) FA[n] = function (ma) { arguments[0] = doi(ma); return goc[n].apply(this, arguments); };
    for (const n of ['ve', 'veK', 'veO', 'veAffine']) if (goc[n]) FA[n] = function (c, ma) { arguments[1] = doi(ma); return goc[n].apply(this, arguments); };
  }
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
  // Hàng thêm (tele_<chiêu>, atk_<chiêu>, phase) đọc từ tệp gốc trong G.customSpriteData (sprite_custom.js chỉ nạp 9 hàng chuẩn)
  const THEM = new Set();
  function themHang(sp) {
    if (!sp || THEM.has(sp.ma)) return;
    THEM.add(sp.ma);
    const ds = Array.isArray(G.customSpriteData) ? G.customSpriteData : [];
    const tep = ds.find((t) => t && t.ma === sp.ma);
    const dtac = tep && tep.dong_tac;
    if (!dtac) return;
    for (const k in dtac) {
      if (sp.dt[k] || !/^(tele|atk)_(c\d|chieu\d)$|^phase$/.test(k)) continue;
      const a = dtac[k];
      sp.dt[k] = { hang: a.hang | 0, so: Math.max(1, a.so | 0), giay: +a.giay > 0 ? +a.giay : 0.6, lap: !!a.lap, mo: null };
    }
  }
  // Bản nhìn của tấm cho một chiêu: hàng báo đòn / đánh trỏ sang hàng riêng của chiêu (chung ảnh, chung bộ nhớ đệm)
  const banChieu = new Map();
  function banCua(sp, n) {
    if (!n || n === 'idle' || n === 'move') return sp;
    themHang(sp);
    const dt = sp.dt;
    let tele = null, atk = null;
    if (/^(c\d|chieu\d)$/.test(n)) { tele = dt['tele_' + n] || null; atk = dt['atk_' + n] || null; }
    else if ((n === 'phase2' || n === 'phase3') && dt.phase) tele = dt.phase;
    if (!tele && !atk) return sp;
    let b = banChieu.get(sp);
    if (!b) { b = {}; banChieu.set(sp, b); }
    if (!b[n] || b[n].img !== sp.img || b[n].ready !== sp.ready) {
      b[n] = Object.assign(Object.create(Object.getPrototypeOf(sp)), sp, { dt: Object.assign({}, dt, tele ? { tele } : null, atk ? { atk } : null) });
    }
    return b[n];
  }
  QP.banCua = banCua;
  const draw0 = MA.draw;
  MA.draw = function (c, id, x, y, o) {
    const sp = tamMoi(id);
    if (!sp) {
      // quái vùng 1–2 (tấm mới đã mang mã cũ): ra chiêu có hàng riêng thì vẽ bằng bản nhìn trỏ sang hàng đó
      const s0 = V12[id] ? SC.ds[id] : null;
      const v = s0 && s0.ready ? banCua(s0, o && o.anim) : s0;
      if (!v || v === s0) return draw0.apply(this, arguments);
      SC.ds[id] = v;
      try { return draw0.apply(this, arguments); } finally { SC.ds[id] = s0; }
    }
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
