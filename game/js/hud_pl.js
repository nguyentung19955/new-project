// HUD PIXELLAB (05/11/2026, docs/review/ke-hoach-cai-thien/pixellab-hud/bao-cao.md)
// Chủ game: "Nhớ hud theo pixel lab nhé" — bộ HUD trong trận vẽ bằng PixelLab cho hợp vũ khí và quái nấm PixelLab.
// Ảnh: game/art/custom/gd-pl-<tên>.sprite.json, CÙNG cỡ game (rong × cao), cùng "vien" 9 mảnh với ảnh cũ gd-<tên>.
// Mã chỉ ĐỔI MÃ ẢNH: nơi nào hỏi gd-<tên> thì nhận gd-pl-<tên> (nếu ảnh PixelLab đã nạp; chưa nạp thì vẫn ảnh cũ như trước).
// Bố cục, vùng chạm, chữ (EN / VI), luật chơi: KHÔNG đổi.
// Cờ quay lui: ?hudcu=1 (G.HUD_CU = true) → HUD cũ y như trước ngày 05/11. Thêm 05/11/2026; xoá khi chủ game chốt HUD PixelLab.
(function () {
  const G = (typeof window !== 'undefined') ? (window.G = window.G || {}) : (globalThis.G = globalThis.G || {});
  if (G.HUD_CU === undefined) { let bat = false; try { bat = typeof location !== 'undefined' && /[?&]hudcu=1(&|$)/.test(location.search || ''); } catch (e) { bat = false; } G.HUD_CU = bat; }
  // Danh sách mã có bản PixelLab (giữ khớp với tools trong docs/review/ke-hoach-cai-thien/pixellab-hud/dung_hud_pl.py)
  const BO = [
    'gd-vong-thuong', 'gd-vong-fire', 'gd-vong-poison', 'gd-vong-ice', 'gd-vong-ngoc', 'gd-vong-sat', 'gd-nut-vuong', 'gd-can-de', 'gd-can-num', 'gd-o-vk-0', 'gd-nut-doi',
    'gd-nut-danh-sword', 'gd-nut-danh-spear', 'gd-nut-danh-hammer', 'gd-nut-danh-bow',
    'gd-nut-dac-biet-sword', 'gd-nut-dac-biet-spear', 'gd-nut-dac-biet-hammer', 'gd-nut-dac-biet-bow',
    'gd-nut-chuong-fire', 'gd-nut-chuong-poison', 'gd-nut-chuong-ice', 'gd-nut-ne', 'gd-nut-binh-mau', 'gd-nut-tam-dung',
    'gd-khung-mau', 'gd-khung-mana', 'gd-khung-xp', 'gd-ruot-thanh', 'gd-ruot-thanh-trum', 'gd-khung-trum', 'gd-khung-trum-nho', 'gd-khung-tinh-anh',
    'gd-khung-mau-quai', 'gd-khung-nho', 'gd-khung-vach-lk', 'gd-sao', 'gd-tt-chay', 'gd-tt-doc', 'gd-tt-bang',
  ];
  const DOI = new Map(BO.map((ma) => [ma, 'gd-pl-' + ma.slice(3)]));
  const HUD_PL = (G.hudPl = { BO, DOI, bat: () => G.HUD_CU !== true, maPl: (ma) => DOI.get(ma) || null });
  let lan = 0;
  function noi() {
    const SC = G.spriteCustom;
    if (!SC || !SC.gdSan) { if (lan++ < 200 && typeof setTimeout !== 'undefined') setTimeout(noi, 25); return; }
    if (SC._hudPl) return;
    SC._hudPl = true;
    const goc = SC.gdSan;
    SC.gdSan = function (ma) {
      const pl = HUD_PL.bat() ? DOI.get(ma) : null;
      if (pl && SC.gd[pl]) { const g = goc(pl); if (g) return g; } // ảnh PixelLab chưa về: dùng ảnh cũ trong lúc chờ (không vẽ code)
      return goc(ma);
    };
  }
  noi();
})();
