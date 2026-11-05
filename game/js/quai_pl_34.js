// QUÁI PIXELLAB VÙNG 3–4 (05/11/2026, docs/review/ke-hoach-cai-thien/pixellab-quai-vung-3-4/bao-cao.md).
// Quái thường, tinh anh, trùm nhỏ, trùm vùng của Lâu đài Than Hồng (vùng 3, 'laudai') và Đầm Sương (vùng 4, 'song') vẽ lại bằng PixelLab
// theo kiểu truyện cổ tích châu Âu (một hướng south-east, động tác dựng bằng khung xương PixelLab; game tự lật khi quay trái).
// Cùng cách với phiên vùng 1–2 (js/quai_pl.js, bảng V12): tấm mới mang THẲNG mã quái cũ (tệp ghi "quai_moi"), tấm ChatGPT cũ là <mã>-plcu
// (mục "quai_cu_cua") chỉ nạp khi ?quaipl=0 (js/sprite_custom.js, game/build.py). CHỈ ĐỔI HÌNH: mã quái, chỉ số, hộp va chạm, thời điểm ra đòn,
// kỹ năng y như cũ. Tệp riêng (không sửa js/quai_pl.js), nạp SAU js/quai_pl.js.
// Hàng thêm trong tấm mới (js/sprite_custom.js chỉ nạp các hàng chuẩn, nên đọc ở đây từ G.customSpriteData):
//   tele_<chiêu> / atk_<chiêu>  : báo đòn / ra đòn riêng từng chiêu (trùm vùng c1..c5, trùm nhỏ chieu1 / chieu2)
//   idle_p2 / idle_p3           : đứng thở ở pha 2 / pha 3 (trùm)
//   tele_p2 / tele_p3           : cảnh chuyển sang pha 2 / pha 3 (cử động 'phase2' / 'phase3')
// Lúc vẽ dựng một "bản nhìn" của tấm (chung ảnh, chung bộ nhớ đệm) mà hàng idle / tele / atk trỏ sang hàng riêng → thời điểm, nhịp khung
// do game tính y như cũ.
// Hiệu ứng PixelLab (POST /vfx) hu-pl34-<tên> (cùng cỡ khung, điểm neo, số khung, thời lượng, xoay, lặp như tệp cũ — chỉ khác ảnh):
//   HU34_RIENG: hiệu ứng chỉ quái / trùm vùng 3–4 dùng → thêm vào G.quaiPl.HU (js/quai_pl.js đổi mã ở mọi chỗ vẽ, ảnh mới chưa tải thì vẽ ảnh cũ).
//   HU34_CHUNG: hiệu ứng dùng chung với quái vùng khác / Rowan → chỉ đổi TRONG LÚC vẽ quái vùng 3–4 (đòn thường vẽ trong G.monsterArt.draw).
// Cờ quay lui: ?quaipl=0 (G.QUAI_PL = false) → tấm cũ + hiệu ứng cũ, y như trước (cùng cờ với js/quai_pl.js).
(function () {
  'use strict';
  const G = window.G;
  if (!G) return;
  if (G.QUAI_PL === undefined) { let tat = false; try { tat = typeof location !== 'undefined' && /[?&]quaipl=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; } G.QUAI_PL = !tat; }
  const SC = G.spriteCustom, MA = G.monsterArt, QP = G.quaiPl, FA = G.fxAnh;
  // mã quái (giữ nguyên) → tên tấm PixelLab (chỉ để ghi chép, "ten_pl" trong tệp)
  const V34 = {
    // vùng 3 Lâu đài Than Hồng
    linhMa: 'rustKnight', doiThan: 'cinderBat', tuongDa: 'gargoyleGuard', denLong: 'wispLantern', meoDen: 'witchCat',
    huLua: 'emberKettle', tieuYeu: 'bombImp', nhimThan: 'emberHedgehog', tuongMa: 'hauntedCaptain', huChua: 'greatCauldron',
    hoLua: 'cinderLion', hoTinh: 'vulpina',
  };
  const HU34_RIENG = { 'hu-bom-phao': 'hu-pl34-bom-phao', 'hu-cau-lua-ma': 'hu-pl34-cau-lua-ma', 'hu-phun-lua-quat': 'hu-pl34-phun-lua-quat',
    'hu-vet-dau': 'hu-pl34-vet-dau', 'hu-bua-tam-giac': 'hu-pl34-bua-tam-giac' };
  const HU34_CHUNG = { 'hu-no-lua': 'hu-pl34-no-lua', 'hu-lua-bung': 'hu-pl34-lua-bung', 'hu-cao-quai': 'hu-pl34-cao-quai', 'hu-lao-bui': 'hu-pl34-lao-bui',
    'hu-quai-dap': 'hu-pl34-quai-dap', 'hu-gai-toa': 'hu-pl34-gai-toa', 'hu-tia-mom': 'hu-pl34-tia-mom' };
  if (G.QUAI_PL === false) {
    if (FA && FA.remove) { for (const k in HU34_RIENG) FA.remove(HU34_RIENG[k]); for (const k in HU34_CHUNG) FA.remove(HU34_CHUNG[k]); }
    return;
  }
  if (!SC || !SC.ds || !MA || typeof MA.draw !== 'function') return;
  if (QP) { QP.V34 = V34; if (QP.HU) Object.assign(QP.HU, HU34_RIENG); QP.HU34_CHUNG = HU34_CHUNG; }

  // ---- hàng thêm (đọc từ tệp gốc) ----
  const HANG_THEM = /^(tele|atk)_(c\d|chieu\d)$|^(idle|tele)_p[23]$/;
  const THEM = new Set();
  function themHang(sp) {
    if (!sp || THEM.has(sp)) return;
    THEM.add(sp);
    const ds = Array.isArray(G.customSpriteData) ? G.customSpriteData : [];
    const tep = ds.find((t) => t && t.ma === sp.ma && t.quai_moi);
    const dtac = tep && tep.dong_tac;
    if (!dtac) return;
    for (const k in dtac) {
      if (sp.dt[k] || !HANG_THEM.test(k)) continue;
      const a = dtac[k];
      sp.dt[k] = { hang: a.hang | 0, so: Math.max(1, a.so | 0), giay: +a.giay > 0 ? +a.giay : 0.6, lap: !!a.lap || /^idle/.test(k), mo: null };
    }
  }
  // hàng nào thay cho idle / tele / atk theo cử động o.anim và pha o.phase (1..3)
  function chonHang(dt, o) {
    const n = o.anim || 'idle', ph = o.phase | 0, map = {};
    let co = false;
    if (ph >= 2) { const k = dt['idle_p' + ph] ? 'idle_p' + ph : dt.idle_p2 ? 'idle_p2' : null; if (k) { map.idle = k; co = true; } }
    if (n === 'phase2' || n === 'phase3') { const k = 'tele_p' + n.slice(5); if (dt[k]) { map.tele = k; co = true; } }
    if (/^c\d$|^chieu\d$/.test(n)) {
      if (dt['tele_' + n]) { map.tele = 'tele_' + n; co = true; }
      if (dt['atk_' + n]) { map.atk = 'atk_' + n; co = true; }
    }
    return co ? map : null;
  }
  const nho = new Map(); // sp → { khoá: bản nhìn }
  function banNhin(sp, map) {
    const key = (map.idle || '') + '|' + (map.tele || '') + '|' + (map.atk || '');
    let b = nho.get(sp);
    if (!b) { b = {}; nho.set(sp, b); }
    let v = b[key];
    if (!v || v.img !== sp.img || v.ready !== sp.ready) { // ảnh được giải phóng / tải lại → dựng lại bản nhìn
      const dt = Object.assign({}, sp.dt);
      for (const k of ['idle', 'tele', 'atk']) if (map[k] && sp.dt[map[k]]) dt[k] = sp.dt[map[k]];
      v = b[key] = Object.assign(Object.create(Object.getPrototypeOf(sp)), sp, { dt });
    }
    return v;
  }
  const FXK = Object.keys(HU34_CHUNG), fxLuu = new Array(FXK.length);
  const draw0 = MA.draw;
  MA.draw = function (c, id, x, y, o) {
    if (!V34[id]) return draw0.apply(this, arguments);
    const sp = SC.ds[id];
    const moi = !!(sp && sp.ready && sp.dt && sp.ma === id);
    if (moi) themHang(sp);
    const map = moi && o ? chonHang(sp.dt, o) : null;
    const ds = FA && FA.ds;
    if (ds) for (let i = 0; i < FXK.length; i++) { const k = FXK[i], a = ds[HU34_CHUNG[k]]; fxLuu[i] = ds[k]; if (a && a.ready) ds[k] = a; else if (a && FA.co) FA.co(HU34_CHUNG[k]); }
    if (map) SC.ds[id] = banNhin(sp, map);
    try { return draw0.apply(this, arguments); } finally {
      if (map) SC.ds[id] = sp;
      if (ds) for (let i = 0; i < FXK.length; i++) { if (fxLuu[i]) ds[FXK[i]] = fxLuu[i]; fxLuu[i] = null; }
    }
  };
  if (QP) { QP.chonHang34 = chonHang; QP.themHang34 = themHang; }
})();
