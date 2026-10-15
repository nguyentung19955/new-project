// BỘ ZED MỚI (13/10/2026) — docs/review/ke-hoach-cai-thien/zed-tich-hop/YEU-CAU.md
// Vẽ Zed bằng bộ ảnh mới: thân (game/art/custom/zed-moi.sprite.json, mỗi động tác 1 hàng, khung 48×48 game, net 2, chân [24,45])
// + vũ khí 4 loại × 4 cấp (zed-vk.sprite.json) gắn theo NEO từng khung (điểm cầm + góc; dựng bằng docs/anh-goc/zed/dung-zed-game.py,
// cách ghép = docs/anh-goc/zed/gan-vk/ghep-thu-vk.py đã duyệt): vẽ người → vũ khí xoay quanh điểm cầm (vũ khí SAU người khi neo ghi sau=1)
// → vẽ lại nắm tay (hàng "hang_tay" của tấm) đè lên cán. Quay trái: lật cả người lẫn vũ khí. Hình vũ khí theo cấp G.wStage (Trắng..Thức tỉnh),
// nhuộm nhẹ màu hệ khi vũ khí đang mang hệ.
// Chỉ ĐỌC đồng hồ đòn (atkT, hitAt, castT, specT, dodgeT, hurtT, mv.kind…): nhịp đánh, thời lượng, combo trong moves.js / combat.js giữ nguyên.
// Khung ★ (tư thế chạm) của mỗi đòn rơi đúng lúc u = hitAt (bảng MOC dưới đây). Sửa hai lỗi chọn khung cũ: chưởng chia đúng castT 0,3
// (L3, trước chia 0,4), búa nện ★ ở 0,35 (L1, trước 0,45).
// Phi tiêu (thay cung): ném tay không; viên phi tiêu bay là ảnh vk-phi-tieu cấp hiện tại, xoay khi bay.
// Trang phục (13/10/2026, docs/review/ke-hoach-cai-thien/zed-bo-rung, zed-bo-bien, zed-bo-lau): tấm thân chọn theo G.zedBo() — 'ninja' = zed-moi,
// 'rung' = zed-rung, 'bien' = zed-bien, 'lau' = zed-lau (cùng chuẩn, neo dùng lại của bộ ninja); thử nhanh: ?zedbo=rung, ?zedbo=bien, ?zedbo=lau.
// Luôn bật (đợt 2 bỏ cờ ?zedmoi=0 / ?zed=0). Ảnh chưa tải xong → lớp vẽ bên trong (G.art.hero) vẽ tạm cho tới khi có.
// CẦM VŨ KHÍ LÚC ĐỨNG / ĐI / CHẠY (13/10/2026, docs/review/ke-hoach-cai-thien/zed-cam-vk/YEU-CAU.md): hàng dung/di/chay vẽ vũ khí đang cầm
// trong TAY PHẢI (cùng tay lúc chém) theo hàng neo riêng dung_<loại>, di_<loại>, chay_<loại> của tấm thân (cùng ảnh thân, neo + nắm tay riêng;
// dựng bằng docs/anh-goc/zed/gan-vk/cam-vk.py + dung-zed-game.py). Lộn, trúng đòn, chết: không vũ khí. Tắt: ?camvk=0 (G.CAM_VK, js/data.js).
// ĐÒN QUAY THEO HƯỚNG NHẮM (13/10/2026, docs/review/ke-hoach-cai-thien/zed-8-huong/YEU-CAU.md): góc nhắm thật P.aimRel (độ, so với hướng
// mặt sau khi lật, dương = chúc xuống; js/moves.js setAim) chốt lúc ra đòn → đâm/ném: cộng vào góc vũ khí, xoay quanh nắm tay, kẹp ±75°,
// quá ±75° thì nghiêng thân trên quanh eo tối đa 12°; chém/quét/nện: nghiêng cả đường vung tối đa ±35°. Vào thế êm (làm mượt theo thời
// gian + nối góc như gocMuot). Ném phi tiêu / đấm tay không (không có neo vũ khí): cánh tay đang duỗi (bảng TAY) xoay quanh gốc tay cùng góc.
// Vệt/hiệu ứng: mũi vũ khí (doiTip) đã xoay theo; js/fx.js aimed() hỏi G.zedMoi.lechHinh. Tắt: ?huongvk=0.
// VIỀN VŨ KHÍ THEO BẬC ÉP ĐỒ + ÁNH THEO CẤP MÀI (15/10/2026, docs/review/ke-hoach-cai-thien/vien-vk-bac/YEU-CAU.md): veVk gọi G.vienVk.truoc/sau
// (js/vien_vk.js) quanh ảnh vũ khí, mọi hàng có vũ khí (đứng/đi/chạy/chém/phi tiêu đang cầm). Tắt: ?vienvk=0.
// SỬA BÓP EO / VẶN NGƯỜI KHI CHẠY + CHÉM (13/10/2026, docs/review/ke-hoach-cai-thien/zed-eo-sua/YEU-CAU.md): chân luôn cùng hướng thân trên
// (hướng chém); chạy ngược hướng chém → chạy LÙI (hàng chạy phát ngược thứ tự khung, nhịp ×0,8). Đường ghép dời xuống giữa đùi (đai + hông +
// đùi trên của khung đòn), vùng nối 5 hàng nguồn: nửa hẹp hơn giãn ngang dần cho khớp mép nửa kia, nửa trên đè nửa dưới. Số đo từng khung cả
// 4 bộ: G.ZED_EO phiên bản 2 (docs/anh-goc/zed/cat-than.py). Chỉ đổi HÌNH. Tắt: ?eosua=0 (G.EO_SUA, js/data.js) → cách ghép cũ.
(function () {
  const G = window.G;
  const SC = G.spriteCustom;
  if (!SC) return;
  const laZed = (o) => !!o && (o.key === 'smith' || !o.key);
  const lay = (ma) => {
    const z = SC.zed && SC.zed[ma];
    if (!z) return null;
    if (!z.ready && SC.canAnh) SC.canAnh(ma);
    return z.ready && z.img ? z : null;
  };
  // Tấm thân theo trang phục đang mặc (js/data.js G.zedBo: 'ninja' → zed-moi, 'rung' → zed-rung, 'bien' → zed-bien, 'lau' → zed-lau).
  // Tấm bộ khác chưa tải xong (zed-rung, zed-bien, zed-lau là ảnh tải sau) thì vẽ tạm bằng bộ ninja. Vũ khí (zed-vk), nhịp, neo, cách ghép y như nhau ở mọi bộ.
  const layThan = () => {
    let ma = 'zed-moi';
    try { const b = G.zedBo ? G.zedBo() : 'ninja'; if (G.ZED_BO && G.ZED_BO[b]) ma = G.ZED_BO[b].tam; } catch (e) { ma = 'zed-moi'; }
    const z = (ma !== 'zed-moi' && lay(ma)) || lay('zed-moi');
    if (z) z._ma = z === SC.zed['zed-moi'] ? 'zed-moi' : ma;
    return z;
  };
  // ---------- CHẠY + CHÉM: ghép ở thắt lưng (13/10/2026, docs/review/ke-hoach-cai-thien/zed-chay-danh/YEU-CAU.md mục C) ----------
  // Đang chạy mà ra đòn ở hàng thân trên thẳng (G.ZED_EO.hang): chân = khung CHẠY hiện tại (nhịp P.chayT không reset), thân trên + tay +
  // vũ khí + nắm tay = khung ĐÒN hiện tại, hai nửa khớp tại điểm eo từng khung (G.ZED_EO, js/zed_eo_data.js, dựng bằng
  // docs/anh-goc/zed/cat-than.py). Chân quay theo hướng chạy (o.mdx), thân trên theo hướng chém (o.face) → chạy trái chém phải được.
  // Hàng cúi/khuỵu (kiếm 3, búa, quét, đặc biệt) không ghép: vẽ toàn thân hàng đòn (combat chậm lại, js/moves.js CHAY_DANH_CFG).
  // Bật khi G.CHAY_DANH là 'than' (mặc định) hoặc 'eo' và G.CHAY_DANH_MOI (tắt bằng ?chaydanh=0 → cách cũ).
  const BO_MA = { 'zed-moi': 'moi', 'zed-rung': 'rung', 'zed-bien': 'bien', 'zed-lau': 'lau' };
  const eoBat = () => G.CHAY_DANH_MOI !== false && !!G.ZED_EO && (G.CHAY_DANH === 'than' || G.CHAY_DANH === 'eo');
  const coEo = (ten) => eoBat() && G.ZED_EO.hang.indexOf(ten) >= 0;
  // Sửa bóp eo / vặn người (zed-eo-sua): cần dữ liệu phiên bản 2 (mỗi khung [y, x, c, l, r]). Tắt ?eosua=0.
  const eoSua = () => G.EO_SUA !== false && !!G.ZED_EO && G.ZED_EO.phien_ban >= 2;
  const LUI_NHIP = 0.8; // chạy lùi: nhịp chân chậm lại
  // Chân có chạy ngược hướng mặt (hướng chém) không — cùng phép thử như eoTinh cũ.
  const nguocMat = (o) => { const f = o.face < 0 ? -1 : 1, md = o.mdx || 0; return Math.abs(md) > 0.2 && (md > 0 ? 1 : -1) !== f; };
  // Phép kéo vùng nối (y hệt keo_noi trong cat-than.py): { tren, l, r, L, R } — tren = nửa trên được kéo (nửa dưới nếu false); [l, r] mép
  // nửa được kéo, [L, R] mép đích, đều theo cột nguồn của khung CHẠY (nửa trên đã dời dx). null: không kéo (khớp sẵn / không đo được / quá xa).
  function keoNoi(eA, eR, dx) {
    const Z = G.ZED_EO;
    if (eA[3] < 0 || eR[3] < 0) return null;
    const lA = eA[3] + dx, rA = eA[4] + dx, lR = eR[3], rR = eR[4], wA = rA - lA + 1, wR = rR - lR + 1;
    if (wA === wR && lA === lR) return null;
    const tren = wA < wR, l = tren ? lA : lR, r = tren ? rA : rR, L = tren ? lR : lA, R = tren ? rR : rA;
    if ((R - L + 1) / (r - l + 1) > (Z.keo_toi_da || 1.8) || Math.max(Math.abs(L - l), Math.abs(R - r)) > (Z.doi_toi_da || 10)) return null;
    return { tren, l, r, L, R };
  }
  // Số liệu ghép một khung: eA, eR = điểm eo [y, x] (ô 96 nguồn) khung đòn / khung chạy; ox, oy = dời nửa trên (điểm ảnh game,
  // hệ toạ độ đã lật theo mặt); rel = -1 khi chân quay ngược mặt (chạy ngược hướng chém); kc = bù 1 điểm ảnh khi lật chân.
  function eoTinh(T, s, o) {
    const B = G.ZED_EO.bo[BO_MA[T._ma] || 'moi'] || G.ZED_EO.bo.moi;
    const eA = B[s.ten] && B[s.ten][s.i], eR = B.chay && B.chay[s.eo.i];
    if (!eA || !eR) return null;
    // cách mới: chân không lật (luôn cùng hướng thân trên), ngang khớp tâm hông, dọc khớp đường cắt giữa đùi
    if (s.eo.moi && eA.length >= 5 && eR.length >= 5) {
      const dx = eR[1] - eA[1];
      return { eA, eR, rel: 1, kc: 0, moi: true, ox: dx / 2, oy: (eR[2] - eA[2]) / 2, K: keoNoi(eA, eR, dx) };
    }
    const f = o.face < 0 ? -1 : 1, md = o.mdx || 0;
    const rel = Math.abs(md) > 0.2 && (md > 0 ? 1 : -1) !== f ? -1 : 1;
    const kc = rel < 0 ? ((f > 0 ? 1 : 0) - (f < 0 ? 1 : 0)) * f : 0;
    const Lx = kc + rel * (eR[1] / 2 - 24);
    return { eA, eR, rel, kc, ox: Lx - (eA[1] / 2 - 24), oy: (eR[0] - eA[0]) / 2 };
  }
  const kep = (v, a, b) => (v < a ? a : v > b ? b : v);
  const VK_LOAI = { sword: 'kiem', spear: 'thuong', hammer: 'bua', bow: 'phitieu' };
  // Mốc tiến độ u bắt đầu từng khung. ★ = khung đứng ở mốc hitAt (đánh dấu trong chú thích).
  const MOC = {
    kiem_1: [0, 0.22, 0.45, 0.65, 0.82], // ★ khung 3 ở 0,45 (0,30 s)
    kiem_2: [0, 0.22, 0.45, 0.65, 0.82], // ★ khung 3 ở 0,45 (0,30 s)
    kiem_3: [0, 0.2, 0.45, 0.6, 0.75, 0.88], // ★ khung 3 ở 0,45 (0,46 s)
    thuong_1: [0, 0.22, 0.45, 0.55, 0.7, 0.85], // ★ khung 3 ở 0,45
    thuong_2: [0, 0.22, 0.45, 0.55, 0.7, 0.85],
    thuong_3: [0, 0.22, 0.45, 0.55, 0.7, 0.85],
    thuong_quet: [0, 0.22, 0.45, 0.55, 0.7, 0.85], // ★ khung 3 ở 0,45 (0,52 s)
    bua_nen: [0, 0.15, 0.35, 0.5, 0.62, 0.74, 0.85, 0.93], // ★ khung 3 ở 0,35 = hitAt búa (sửa L1)
    bua_nen_dat: [0, 0.2, 0.45, 0.6, 0.75, 0.88], // vào từ u 0,36 (khung 2 giáng xuống), ★ khung 3 ở 0,45
    phitieu: [0, 0.22, 0.45, 0.6, 0.75, 0.88], // ★ khung 3 ở 0,45 (đạn sinh lúc chạm), 0,38 / 0,45 s như cung
    phitieu_chum: [0, 0.45, 0.6, 0.72, 0.84, 0.94], // thả: vào từ u 0,45, phi tiêu bay ngay → khung ném (2) hiện ngay lúc thả
    chuong: [0, 0.12, 0.25, 0.4, 0.6, 0.8], // castT 0,3 (sửa L3), đạn sinh ngay khi bấm
    db_kiem: [0, 0.12, 0.25, 0.4, 0.6, 0.8], // specT 0,35, hiệu ứng sinh ngay khi bấm
    db_thuong: [0, 0.12, 0.25, 0.4, 0.6, 0.8],
    db_bua: [0, 0.12, 0.25, 0.4, 0.6, 0.8],
    db_phitieu: [0, 0.12, 0.25, 0.4, 0.6, 0.8],
    dam: [0, 0.22, 0.45, 0.65, 0.82], // ★ khung 3 ở 0,45 (0,30 s)
  };
  const DB = { sword: 'db_kiem', spear: 'db_thuong', hammer: 'db_bua', bow: 'db_phitieu' };
  const GIU = { spear: 'thuong_giu', hammer: 'bua_giu', bow: 'phitieu_ngam' };
  const DI_BO = 0.6; // đi chậm hơn 60% tốc độ chạy đầy (đẩy cần nhẹ, bị làm chậm) → hàng ĐI BỘ

  function khungMot(D, ten, u) {
    const a = D.dong_tac[ten], m = MOC[ten];
    u = kep(u || 0, 0, 1);
    if (m && m.length === a.so) { let i = 0; while (i < a.so - 1 && u + 1e-6 >= m[i + 1]) i++; return i; }
    return Math.min(a.so - 1, Math.floor(u * a.so));
  }
  // 15/10: chủ dự án thấy dáng đứng / đi / chạy của em bé hơi nhanh → các hàng LẶP (dung*, di*, chay*) chạy chậm lại ×NHIP_LAP.
  // Đòn đánh, lộn, trúng đòn… KHÔNG đổi (khớp mốc ra đòn). Cờ ?chaynhanh=1 → nhịp cũ.
  const NHIP_LAP = (() => { try { if (/[?&]chaynhanh=1(&|$)/.test(location.search || '')) return 1; } catch (e) { /* bỏ qua */ } return G.ZED_NHIP_LAP || 1.25; })();
  const giayLap = (ten, a) => (a.giay || 1) * (/^(dung|di|chay)(_|$)/.test(ten) ? NHIP_LAP : 1);
  function khungLap(D, ten, t) { const a = D.dong_tac[ten]; return Math.floor(Math.max(0, t) / giayLap(ten, a) * a.so) % a.so; }
  function phanKhung(D, ten, t) { const a = D.dong_tac[ten], v = Math.max(0, t) / giayLap(ten, a) * a.so; return v - Math.floor(v); } // tiến độ trong khung lặp (0..1)
  // ---------- Soát mượt phiên 3 ----------
  // Mục 17 (?thocuti=0 tắt): hàng ĐỨNG THỞ có 4 khung cuối gần như trùng nhau, nối vòng 8→1 bị nhảy → phát đi đi về về 1-2-3-4-5-4-3-2
  // (cùng nhịp mỗi khung, cùng chu kỳ 8 bước). Tụ lực búa (bua_giu, 4 khung) nối vòng cũng nhảy → 1-2-3-4-3-2. i2: khung kế (góc vũ khí
  // cầm nội suy về đúng khung sẽ tới, không về khung i+1). Hàng cầm vũ khí lúc đứng (dung_<loại>) dùng cùng khung với hàng thân.
  const QUA_LAI = { dung: [0, 1, 2, 3, 4, 3, 2, 1], bua_giu: [0, 1, 2, 3, 2, 1] };
  function lapQuaLai(D, ten, t) {
    const q = G.THO_CUTI !== false && QUA_LAI[ten], a = D.dong_tac[ten];
    if (!q || !a || a.so < 5 - (ten === 'bua_giu' ? 1 : 0)) return null;
    const v = Math.max(0, t) / (giayLap(ten, a) / a.so), k = Math.floor(v) % q.length;
    return { ten, i: q[k], i2: q[(k + 1) % q.length], fl: v - Math.floor(v) };
  }
  // Mục 20 (?nhipcuti=0 tắt): PHA BƯỚC chung 0..1 cho đi bộ và chạy (mỗi em bé một pha, nhớ theo P): đổi đi↔chạy giữ đúng chỗ trong
  // bước (không nhảy chân), vừa bắt đầu đi / chạy thì vào từ khung 1 (chân chạm đất), lướt kiếm cũng đi theo pha bước (nhanh gấp đôi)
  // thay cho đồng hồ P.t. Vùng đệm: đang đi bộ thì phải nhanh hơn 0,65 mới sang chạy, đang chạy thì chậm hơn 0,55 mới về đi bộ.
  // Chỉ lần vẽ của chính em bé (o.t = P.t) mới đẩy pha; bóng mờ (o.t cũ) vẽ theo cách cũ. Chỉ là hình: tốc độ thật không đổi.
  const BUOC = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  const BUOC_VAO = 0.65, BUOC_RA = 0.55;
  const buocCua = (o) => (G.NHIP_CUTI !== false && BUOC && o.p && (o.t == null || o.t === o.p.t) ? o.p : null);
  function buoc(o, D, ten0, nhan) { // ten0: ép hàng ('chay'), không thì chọn đi / chạy theo P.diTL có vùng đệm; nhan: hệ số nhịp
    const p = buocCua(o);
    if (!p) return null;
    const t = G.time || 0;
    let b = BUOC.get(p);
    if (!b) BUOC.set(p, (b = { ph: 0, t, chay: true, di: false }));
    const dt = b.di ? kep(t - b.t, 0, 0.1) : 0;
    if (!b.di) b.ph = 0; // vừa bắt đầu bước: khung 1
    b.di = true; b.t = t;
    const tl = p.diTL;
    if (tl == null) b.chay = true;
    else if (b.chay && tl < BUOC_RA) b.chay = false;
    else if (!b.chay && tl > BUOC_VAO) b.chay = true;
    const ten = ten0 || (b.chay || !D.dong_tac.di ? 'chay' : 'di'), a = D.dong_tac[ten];
    if (!a) return null;
    b.ph = (b.ph + (dt * (nhan || 1)) / giayLap(ten, a)) % 1;
    const v = b.ph * a.so, i = Math.floor(v) % a.so;
    return { ten, i, fl: v - Math.floor(v), i2: (i + 1) % a.so };
  }
  function nghiBuoc(o) { const p = buocCua(o), b = p && BUOC.get(p); if (b) { b.di = false; b.t = G.time || 0; } }

  // Chọn động tác + khung (cùng thứ tự ưu tiên như SC.chonEmBe ở js/sprite_custom.js). Trả { ten, i, theo? }: theo = động tác đánh mà
  // vũ khí đi theo khi thân đang ở hàng chạy (chạy mà đánh, G.CHAY_DANH).
  function chon(o, D) {
    const s = chon0(o, D);
    if (s && !s.buoc && !(s.ghep && o.move)) nghiBuoc(o); // mục 20: không bước → lần bước sau vào từ khung 1
    // chạy + chém: ghép eo (chân hàng chạy, thân trên hàng đòn) — chỉ hàng có điểm eo, chỉ khi đang chạy
    if (s && s.ghep && o.move && coEo(s.ten) && D.dong_tac.chay) {
      if (eoSua()) { // chân cùng hướng thân trên; chạy ngược hướng chém → chạy lùi (phát ngược thứ tự khung, nhịp ×0,8)
        const so = D.dong_tac.chay.so, lui = nguocMat(o), B = buoc(o, D, 'chay', lui ? LUI_NHIP : 1); // mục 20: chân theo pha bước chung
        const i = B ? (lui ? so - 1 - B.i : B.i) : lui ? so - 1 - khungLap(D, 'chay', s.tc * LUI_NHIP) : khungLap(D, 'chay', s.tc);
        return { ten: s.ten, i: s.i, u: s.u, eo: { i, moi: 1, lui: lui ? 1 : 0 } };
      }
      const B = buoc(o, D, 'chay');
      return { ten: s.ten, i: s.i, u: s.u, eo: { i: B ? B.i : khungLap(D, 'chay', s.tc) } };
    }
    if (s && s.ghep) { const r = { ten: s.ten, i: s.i, u: s.u }; return s.theo ? Object.assign(r, { theo: s.theo }) : r; }
    return s;
  }
  function chon0(o, D) {
    const p = o.p, t = (o.t != null ? o.t : G.time) || 0, tc = o.tc != null && isFinite(o.tc) ? o.tc : t;
    const mv = p && p.mv, wt = o.weapon && o.weapon.type;
    let goc = wt; // loại vũ khí thật (giáo đang bay thì o.weapon là 'fist' nhưng chiêu đặc biệt vẫn là của giáo)
    try { if (p && G.curW) { const w = G.curW(p); if (w && w.type) goc = w.type; } } catch (e) { goc = wt; }
    const mot = (ten, u) => ({ ten, i: khungMot(D, ten, u), u: kep(u || 0, 0, 1) });
    const lap = (ten, tt) => lapQuaLai(D, ten, tt) || ({ ten, i: khungLap(D, ten, tt), fl: phanKhung(D, ten, tt) });
    const buocB = (ten0, nhan) => { const B = buoc(o, D, ten0, nhan); if (B) B.buoc = 1; return B; }; // mục 20
    if (p && p.dead) return mot('chet', (p.deadT || 0) / 0.6);
    if (o.dodge >= 0) return mot('lon', o.dodge);
    if (p && p.dashT > 0) {
      if (mv && mv.kind === 'xoc') return mot('thuong_xoc', mv.dashDur > 0 ? 1 - p.dashT / mv.dashDur : 0.5);
      return buocB('chay', 2) || lap('chay', t * 2); // Nhát lướt kiếm sau lộn: hàng chạy nhanh gấp đôi (mục 20: theo pha bước, không theo P.t)
    }
    if (p && p.specT > 0 && DB[goc]) return mot(DB[goc], 1 - p.specT / 0.35);
    if (p && p.castT > 0) return Object.assign(mot('chuong', 1 - p.castT / 0.3), { ghep: 1, tc });
    if (mv && mv.holding && !(o.atk >= 0)) { const k = GIU[wt]; return k ? Object.assign(lap(k, t), { ghep: 1, tc }) : lap('dung', t); }
    if (o.atk >= 0) {
      const ci = p ? p.comboI | 0 : Math.floor(t / 1.6), u = o.atk;
      let r = null;
      if (!wt || wt === 'fist') r = mot('dam', u);
      else if (wt === 'sword') r = mot('kiem_' + (((ci % 3) + 3) % 3 + 1), u);
      else if (wt === 'spear') r = (mv && mv.kind === 'quet') || ci === 3 ? mot('thuong_quet', u) : mot('thuong_' + (kep(ci, 0, 2) + 1), u);
      else if (wt === 'hammer') r = mot(mv && mv.kind === 'nenDat' ? 'bua_nen_dat' : 'bua_nen', u);
      else if (wt === 'bow') r = mot(mv && mv.kind === 'banManh' ? 'phitieu_chum' : 'phitieu', u);
      if (r) {
        const cd = G.CHAY_DANH; // chạy mà đánh: thân giữ hàng chạy (chân bước), chỉ vũ khí vung theo neo của khung đòn đánh
        if (eoBat()) return Object.assign(r, { ghep: 1, tc }); // cách mới: ghép eo (hàng thẳng) hoặc toàn thân hàng đòn (hàng cúi)
        if (o.move && (cd === 'than' || (cd === 'lai' && !(u >= 0.2 && u < 0.65)))) { const B = buocB('chay'); return { ten: 'chay', i: B ? B.i : khungLap(D, 'chay', tc), theo: r, buoc: B ? 1 : 0 }; }
        return r;
      }
    }
    if ((p && p.hurtT > 0) || (!p && o.flash)) return mot('trung', p ? 1 - p.hurtT / 0.2 : 0.3);
    if (o.move) return buocB() || lap(p && p.diTL != null && p.diTL < DI_BO ? 'di' : 'chay', tc);
    return lap('dung', t);
  }

  // Cấp hình vũ khí (0 Trắng .. 3 Thức tỉnh = G.STAGE_NAMES) và hệ đang mang.
  function capVk(w) { let c = 0; try { c = G.wStage ? G.wStage(w) : w.stage || 0; } catch (e) { c = 0; } return kep(c | 0, 0, 3); }
  function heVk(w) {
    if (!w) return null;
    if (w.coat && G.EL && G.EL[w.coat]) return w.coat;
    return w.branch && capVk(w) > 0 && G.EL && G.EL[w.branch] ? w.branch : null;
  }
  // Ảnh một vũ khí (loại, cấp) — nhuộm nhẹ theo hệ (nhớ lại, mỗi tổ hợp vẽ một lần). Trả { img, x, y, w, h }.
  const NHUOM = new Map();
  function anhVk(V, loai, cap, he) {
    const r = V.tep.vk[loai][cap];
    if (!he || typeof document === 'undefined') return { img: V.img, x: r[0], y: r[1], w: r[2], h: r[3] };
    const k = loai + cap + he;
    let cv = NHUOM.get(k);
    if (!cv) {
      cv = document.createElement('canvas'); cv.width = r[2]; cv.height = r[3];
      const q = cv.getContext('2d'); q.imageSmoothingEnabled = false;
      q.drawImage(V.img, r[0], r[1], r[2], r[3], 0, 0, r[2], r[3]);
      q.globalCompositeOperation = 'source-atop'; q.globalAlpha = 0.3; q.fillStyle = G.EL[he].col; q.fillRect(0, 0, r[2], r[3]);
      NHUOM.set(k, cv);
    }
    return { img: cv, x: 0, y: 0, w: r[2], h: r[3] };
  }
  // Vũ khí đặt ở khung này: { da (động tác của neo), n (neo), cap, loai } hoặc null.
  // Cầm vũ khí lúc đứng/đi/chạy: hàng neo <hàng thân>_<loại> (cùng khung với hàng thân). null: không có / tắt ?camvk=0.
  const CAM_HANG = { dung: 1, di: 1, chay: 1 };
  function camCua(D, s, w) {
    if (G.CAM_VK === false || s.theo || !CAM_HANG[s.ten] || !w || w.type === 'fist' || !VK_LOAI[w.type]) return null;
    const ten = s.ten + '_' + VK_LOAI[w.type];
    return D.dong_tac[ten] ? { ten, i: s.i, fl: s.fl, i2: s.i2, cam: 1 } : null;
  }
  // ---------- ĐÒN QUAY THEO HƯỚNG NHẮM (zed-8-huong) ----------
  // HV_DAM: hàng đâm / ném (vũ khí xoay quanh nắm tay theo góc nhắm, kẹp ±KEP_DAM; quá thì nghiêng thân trên quanh eo, tối đa NGHIENG).
  // HV_CHEM: hàng chém / quét / nện (giữ đường vung theo ảnh, chỉ nghiêng cả đường vung tối đa ±KEP_CHEM).
  // Mưa Phi Tiêu (db_phitieu, rơi từ trời) và nện đất đặc biệt (db_bua, vòng quanh người) không theo hướng nên không xoay.
  const HV_DAM = { thuong_1: 1, thuong_2: 1, thuong_3: 1, thuong_xoc: 1, db_thuong: 1, phitieu: 1, phitieu_chum: 1, phitieu_ngam: 1, dam: 1 };
  const HV_CHEM = { kiem_1: 1, kiem_2: 1, kiem_3: 1, thuong_quet: 1, bua_nen: 1, bua_nen_dat: 1, db_kiem: 1 };
  const KEP_DAM = 75, KEP_CHEM = 35, NGHIENG = 12, HV_TAU = 0.05; // HV_TAU: hằng thời gian làm mượt (giây) — 95% sau ~0,15 s
  const hvBat = () => G.HUONG_VK !== false;
  const HV = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  const ss = (x) => { x = kep(x, 0, 1); return x * x * (3 - 2 * x); };
  // Góc nhắm (độ, so với mặt) → { g: cộng vào góc vũ khí, lean: nghiêng thân trên } theo loại đòn. rel ±90 (js/moves.js setAim kẹp sẵn).
  function lechTu(rel, loai, coEoKhung) {
    if (loai === 'chem') return { g: kep(rel, -KEP_CHEM, KEP_CHEM), lean: 0 };
    const g = kep(rel, -KEP_DAM, KEP_DAM), du = Math.abs(rel) - KEP_DAM;
    return { g, lean: coEoKhung && du > 0 ? Math.sign(rel) * Math.min(NGHIENG, du * 0.8) : 0 };
  }
  // Điểm eo [y, x] (ô 96 nguồn) của khung đòn ten/i ở bộ đang mặc (G.ZED_EO, js/zed_eo_data.js) — trục nghiêng thân trên. null: không có.
  function eoKhung(T, ten, i) {
    const Z = G.ZED_EO; if (!Z || !Z.bo) return null;
    const B = Z.bo[BO_MA[T && T._ma] || 'moi'] || Z.bo.moi;
    return (B && B[ten] && B[ten][i]) || null;
  }
  // Hàng ném / đấm TAY KHÔNG (phitieu, phitieu_ngam, phitieu_chum, dam — không có neo vũ khí): cánh tay đang duỗi được cắt ra và xoay
  // quanh gốc tay theo cùng góc lệch như vũ khí đâm. Mỗi khung [trục x, trục y, x0, y0, x1, y1] (ô 96 nguồn) hoặc null (tay không duỗi →
  // chỉ nghiêng thân). Đo tự động từ ảnh (cột ngoài cùng của cánh tay, nới 2–3 điểm ảnh) bằng docs/anh-goc/zed/gan-vk/do-tay-nem.py.
  const TAY = {"moi":{"phitieu":[null,null,[62,53,62,48,83,58],null,null,null],"phitieu_ngam":[[58,57,58,52,79,62],[55,57,55,52,76,62],[55,56,55,51,76,61]],"phitieu_chum":[[58,52,58,46,79,59],[72,53,72,47,93,59],null,null,null,null],"dam":[null,null,[55,58,55,53,76,63],[55,58,55,53,76,63],null]},"rung":{"phitieu":[null,null,[62,55,62,50,83,60],null,null,null],"phitieu_ngam":[[59,56,59,51,80,61],[59,56,59,51,80,61],[58,56,58,51,79,61]],"phitieu_chum":[[58,51,58,45,79,58],[73,53,73,47,94,59],null,null,null,null],"dam":[null,null,[55,58,55,53,76,63],[55,58,55,53,76,63],null]},"bien":{"phitieu":[null,null,[63,53,63,48,84,58],null,null,null],"phitieu_ngam":[[58,56,58,51,79,61],[56,56,56,51,77,61],[55,56,55,51,76,61]],"phitieu_chum":[[57,53,57,47,78,59],[71,54,71,49,92,60],null,null,null,null],"dam":[null,null,[55,59,55,54,76,64],[55,59,55,54,76,64],null]},"lau":{"phitieu":[null,null,[64,53,64,48,85,58],null,null,null],"phitieu_ngam":[[59,54,59,50,80,59],[58,54,58,50,79,59],[57,54,57,50,78,59]],"phitieu_chum":[[58,51,58,45,79,58],[73,53,73,47,94,59],null,null,null,null],"dam":[null,null,[55,57,55,52,76,62],[55,57,55,52,76,62],null]}};
  const tayKhung = (T, ten, i) => { const B = TAY[BO_MA[T && T._ma] || 'moi'] || TAY.moi, r = B && B[ten]; return (r && r[i]) || null; };
  // Mục tiêu lệch cho khung vũ khí wa (chưa làm mượt). Góc nhắm CHỐT theo nhát (p.lastAtk): ai hỏi trước (vẽ hay fx đo vệt) cũng lấy
  // P.aimRel vừa đặt lúc ra đòn, cả nhát dùng đúng số đó. Phi tiêu ngắm (đang giữ): theo góc ngắm sống, làm mượt. Chiêu đặc biệt: P.aimRel
  // (js/moves.js M.cast đặt một lần lúc tung). Lean giảm dần ở 25% cuối nhát để về hàng đứng không giật.
  function huongCua(o, T, wa) {
    if (!hvBat() || wa.cam) return null;
    const loai = HV_DAM[wa.ten] ? 'dam' : HV_CHEM[wa.ten] ? 'chem' : null, p = o.p;
    if (!loai || !p || p.aimRel == null || !isFinite(p.aimRel) || !HV) return null;
    let h = HV.get(p); if (!h) HV.set(p, (h = { id: null, rel: 0, ng: 0, ngT: null, gv: 0, lv: 0, t: null }));
    const t = G.time || 0;
    let rel;
    if (wa.ten === 'phitieu_ngam') {
      if (h.ngT == null || t - h.ngT > 0.25) h.ng = 0; // vừa vào thế ngắm: đi từ thẳng trước mặt
      const dt = h.ngT == null ? 0 : Math.max(0, t - h.ngT);
      h.ng += (p.aimRel - h.ng) * (1 - Math.exp(-dt / 0.08)); h.ngT = t;
      rel = h.ng; h.id = null;
    } else if (/^db_/.test(wa.ten)) rel = p.aimRel;
    else {
      if (h.id !== p.lastAtk) { h.id = p.lastAtk; h.rel = p.aimRel; }
      rel = h.rel;
    }
    const L = lechTu(kep(rel, -90, 90), loai, !!eoKhung(T, wa.ten, wa.i));
    if (L.lean && wa.u != null) L.lean *= ss((1 - wa.u) / 0.25);
    L.h = h;
    return L;
  }
  // Làm mượt theo thời gian (chỉ ở lần VẼ thật, mỗi khung một lần): vào thế / đổi góc không giật; lần đo của fx (cùng G.time) không đổi trạng thái.
  function hvMuot(L) {
    const h = L.h, t = G.time || 0, dt = h.t == null ? 1 : t - h.t;
    if (!(dt >= 0) || dt > 0.25) { h.gv = L.g; h.lv = L.lean; }
    else if (dt > 0) { const k = 1 - Math.exp(-dt / HV_TAU); h.gv += (L.g - h.gv) * k; h.lv += (L.lean - h.lv) * k; }
    h.t = t;
    return { g: h.gv, lean: h.lv };
  }
  function hvNghi(o) { // lần vẽ không có đòn theo hướng: kéo trạng thái mượt về 0 (để nhát sau vào thế từ thẳng)
    const p = o.p, h = p && HV ? HV.get(p) : null;
    if (!h) return;
    const t = G.time || 0, dt = h.t == null ? 1 : t - h.t;
    if (!(dt >= 0) || dt > 0.25) { h.gv = 0; h.lv = 0; } else if (dt > 0) { const k = 1 - Math.exp(-dt / HV_TAU); h.gv -= h.gv * k; h.lv -= h.lv * k; }
    h.t = t;
  }
  // Ra lệch góc dùng cho js/fx.js aimed(): hình trên không của đòn (vệt chém code, vệt đâm, hu-quet-giao...) xoay đúng góc vũ khí đang vẽ
  // thay vì góc nhắm đầy đủ. d = info đòn của moves.js (type, move). null: không áp (cờ tắt, lướt chém...) → fx giữ góc thật.
  function lechHinh(P, d) {
    if (!hvBat() || !P || P.aimRel == null || !isFinite(P.aimRel) || !laZed({ key: P.key }) || !layThan()) return null;
    const mv = d && d.move;
    const loai = mv === 'dam' || mv === 'xoc' || mv === 'ban' || mv === 'banManh' ? 'dam' : mv === 'chem' || mv === 'quet' || mv === 'nen' || mv === 'nenDat' ? 'chem' : null;
    if (!loai) return null;
    const L = lechTu(kep(P.aimRel, -90, 90), loai, mv !== 'xoc'); // thương xốc (hàng thuong_xoc) không có điểm eo → không nghiêng thân
    return L.g + L.lean;
  }
  function vkCua(o, D, s, T, ve) {
    const w = o.weapon;
    if (!w || !w.type) return null;
    const wa = camCua(D, s, w) || s.theo || s, da = D.dong_tac[wa.ten];
    if (!da || !da.vk || !da.neo) return null;
    const n = da.neo[wa.i];
    if (!n) return null; // khung null: không vũ khí (Phi Thương khung 3–6: giáo đã ném đi)
    if (w.type === 'fist' && !/^db_/.test(wa.ten)) return null; // tay không (giáo đang bay)
    if (w.type !== 'fist' && VK_LOAI[w.type] !== da.vk) return null;
    let H = huongCua(o, T, wa);
    if (H && ve) H = hvMuot(H);
    const g = H ? H.g : 0, lean = H && !s.theo ? H.lean : 0; // chạy kiểu cũ (thân hàng chạy, s.theo): không nghiêng thân chạy
    return { da, n, wa, cap: capVk(w), he: heVk(w), ang: gocMuot(o, da, wa, n, g), cam: !!wa.cam, lean, hv: !!H, w };
  }
  // Trục nghiêng thân trên (toạ độ vẽ đã lật, điểm ảnh game tính từ chân) hoặc null.
  function trucNghieng(T, s, v, E) {
    if (!v || !v.lean || Math.abs(v.lean) < 0.05 || v.wa !== s) return null;
    if (s.eo) return E ? [E.ox + E.eA[1] / 2 - 24, E.oy + E.eA[0] / 2 - 45] : null;
    const e = eoKhung(T, s.ten, s.i);
    return e ? [e[1] / 2 - 24, e[0] / 2 - 45] : null;
  }
  function nghieng(q, P, deg, fn) {
    q.save(); q.translate(P[0], P[1]); q.rotate((deg * Math.PI) / 180); q.translate(-P[0], -P[1]);
    try { fn(); } finally { q.restore(); }
  }
  // ---------- VŨ KHÍ MƯỢT (bổ sung YEU-CAU zed-chay-danh 13/10 12:00: "mượt bằng hoặc hơn bản Zed cũ / G.KIEM_MUOT") ----------
  // Điểm cầm luôn là nắm tay của khung thân đang vẽ (vũ khí luôn nằm trong tay), còn GÓC vũ khí nội suy liên tục:
  //  - giữa hai khung đòn: từ góc neo khung này tới góc neo khung sau theo tiến độ u trong khung (MOC), đường ngắn nhất, chậm dần
  //    → không nhảy cóc mỗi lần thân đổi khung;
  //  - vào thế: đầu nhát, góc đi tiếp từ góc vừa vẽ (cuối nhát trước) tới đường vung trong VAO đầu đòn (chậm–nhanh–chậm, như kiemMuot
  //    chạy chém 0,33), mặt không đổi thì mới nối.
  // Chỉ đổi HÌNH (góc vẽ + vệt chém); đòn, hitAt, vùng trúng không đổi. Tắt cùng ?chaydanh=0.
  const VAO = 0.33;
  const NHO = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  const gocGan = (a, b) => a + ((((b - a) % 360) + 540) % 360) - 180; // b quy về số gần a nhất
  // Cầm vũ khí lúc đứng/đi/chạy: góc nội suy êm giữa khung này và khung sau (vòng lặp) theo tiến độ trong khung; vừa hết đòn (góc vừa vẽ
  // là của hàng đòn, cùng mặt, < 0,2 s) thì trong RA giây đầu góc đi dần từ góc cuối đòn về thế cầm (đường ngắn nhất: không lật 360°).
  const RA = 0.18;
  function gocCam(o, da, wa, n) {
    const i = wa.i, n2 = da.neo[wa.i2 != null ? wa.i2 % da.so : (i + 1) % da.so]; // i2: khung kế khi phát đi đi về về (mục 17) / pha bước (mục 20)
    let a = n[2];
    if (n2) { const fr = kep(wa.fl || 0, 0, 1), e = fr * fr * (3 - 2 * fr); a = n[2] + (gocGan(n[2], n2[2]) - n[2]) * e; }
    const p = o.p, r = p && NHO ? NHO.get(p) : null, f = o.face < 0 ? -1 : 1, t = G.time || 0;
    if (r) {
      if (!r.cam && r.ve != null && r.f === f && t - r.t < 0.2) { r.raA = r.ve; r.raT = t; }
      if (r.raT != null && t - r.raT < RA && r.f === f) { const a0 = gocGan(a, r.raA), k = (t - r.raT) / RA; a = a0 + (a - a0) * (0.5 - 0.5 * Math.cos(Math.PI * k)); }
    }
    return a;
  }
  // g: độ lệch theo hướng nhắm (zed-8-huong, đã làm mượt) cộng vào góc đích TRƯỚC khi nối vào thế → nối từ góc vừa vẽ tới góc đã xoay.
  function gocMuot(o, da, wa, n, g) {
    if (wa.cam) return gocCam(o, da, wa, n);
    g = g || 0;
    // đâm/ném: góc cuối (ảnh + lệch) không quá ±90° so với mặt → mũi không bao giờ chĩa ra sau lưng (thương 2 ảnh đã chếch -35°)
    const kd = (x) => (g && HV_DAM[wa.ten] ? kep(x, -90, 90) : x);
    if (G.CHAY_DANH_MOI === false || wa.u == null || da.lap) return kd(n[2] + g);
    const m = MOC[wa.ten], u = wa.u, i = wa.i;
    let a = n[2];
    if (m && m.length === da.so && i + 1 < da.so && da.neo[i + 1]) {
      const fr = kep((u - m[i]) / Math.max(1e-6, m[i + 1] - m[i]), 0, 1), e = fr * fr * (3 - 2 * fr);
      a = n[2] + (gocGan(n[2], da.neo[i + 1][2]) - n[2]) * e;
    }
    a = kd(a + g);
    const p = o.p, r = p && NHO ? NHO.get(p) : null, f = o.face < 0 ? -1 : 1;
    if (r && p.lastAtk != null) {
      if (r.id !== p.lastAtk) { r.id = p.lastAtk; r.dau = r.ve != null && r.f === f && (G.time || 0) - r.t < 0.2 ? r.ve : null; }
      if (r.dau != null && u < VAO) { const a0 = gocGan(a, r.dau), k = u / VAO; a = a0 + (a - a0) * (0.5 - 0.5 * Math.cos(Math.PI * k)); }
    }
    return a;
  }
  function ghiGoc(o, a, cam) { // sau khi vẽ: nhớ góc vừa vẽ (nối vào thế nhát sau; cam = góc của hàng cầm đứng/đi/chạy)
    const p = o.p; if (!p || !NHO) return;
    let r = NHO.get(p); if (!r) NHO.set(p, (r = { id: p.lastAtk, dau: null, ve: null, t: 0, f: 1 }));
    r.ve = a; r.t = G.time || 0; r.f = o.face < 0 ? -1 : 1; r.cam = !!cam;
  }
  function veVk(c, V, v) {
    const da = v.da, n = v.n, a = anhVk(V, da.vk, v.cap, v.he), g = da.vk_cam[v.cap], F = da.vk_tl;
    c.save();
    c.translate(n[0] / 2 - 24, n[1] / 2 - 45); // he_neo "nguon-96": chia 2 ra điểm ảnh game, trừ goc (24,45) → tính từ chân
    c.rotate(((v.ang != null ? v.ang : n[2]) * Math.PI) / 180); // góc độ: 0 mũi chỉ sang phải, dương chúc xuống (v.ang: góc đã nội suy, gocMuot)
    c.scale(F, F);
    // 15/10 viền + hào quang theo bậc ép đồ, ánh lướt theo cấp mài (js/vien_vk.js; ?vienvk=0 tắt): vẽ cùng hệ toạ độ đã xoay/lật của ảnh
    const VV = G.vienVk, r0 = VV && VV.co(v.w) ? V.tep.vk[da.vk][v.cap] : null, kv = r0 ? 'zed-vk:' + da.vk + v.cap : null;
    if (r0) { try { VV.truoc(c, v.w, V.img, r0[0], r0[1], r0[2], r0[3], kv, -g[0], -g[1], 1 / F); } catch (e) { ghiLoi(e); } }
    c.drawImage(a.img, a.x, a.y, a.w, a.h, -g[0], -g[1], a.w, a.h);
    if (r0) { try { VV.sau(c, v.w, V.img, r0[0], r0[1], r0[2], r0[3], kv, -g[0], -g[1], 1 / F); } catch (e) { ghiLoi(e); } }
    c.restore();
  }

  let tam = null; // canvas phụ khi phải nhuộm cả hình (trúng đòn, băng, độc)
  function ve(c, o) {
    const T = layThan();
    if (!T) return false;
    const D = T.tep, s = chon(o, D), a = D.dong_tac[s.ten];
    if (!a) return false;
    const V = lay('zed-vk'), v = V ? vkCua(o, D, s, T, true) : null;
    // Hàng tay không (ném phi tiêu, đấm): không có vũ khí để xoay → xoay cánh tay duỗi (TAY) + nghiêng thân trên như đòn đâm.
    let Hb = null;
    if (!v && !s.theo && !s.cam && HV_DAM[s.ten]) { Hb = huongCua(o, T, s); if (Hb) Hb = hvMuot(Hb); }
    if (!(v && v.hv) && !Hb) hvNghi(o);
    if (v) ghiGoc(o, v.ang, v.cam);
    const E = s.eo ? eoTinh(T, s, o) : null;
    // Nghiêng thân trên quanh eo (đâm/ném nhắm gần thẳng lên/xuống, zed-8-huong): N = trục eo, null = không nghiêng (như cũ).
    const N = trucNghieng(T, s, v || (Hb ? { lean: Hb.lean, wa: s } : null), E), lean = v ? v.lean : Hb ? Hb.lean : 0;
    const tay = Hb && Math.abs(Hb.g) > 0.05 ? tayKhung(T, s.ten, s.i) : null, gTay = Hb ? Hb.g : 0;
    // Vẽ phần trên (hàng nguồn 0..h) của khung thân dời (ox, oy); có tay thì cánh tay duỗi được khoét ra và vẽ lại xoay quanh gốc tay.
    const veTren = (q, h, ox, oy) => {
      const ve0 = () => q.drawImage(T.img, s.i * 96, a.hang * 96, 96, h, -24 + ox, -45 + oy, 48, h / 2);
      if (!tay) { ve0(); return; }
      const x0 = tay[2] / 2 - 24 + ox, y0 = tay[3] / 2 - 45 + oy, w = (tay[4] - tay[2]) / 2, hh = (tay[5] - tay[3]) / 2;
      q.save(); q.beginPath(); q.rect(-24 + ox, -45 + oy, 48, h / 2); q.rect(x0, y0, w, hh); q.clip('evenodd'); ve0(); q.restore();
      nghieng(q, [tay[0] / 2 - 24 + ox, tay[1] / 2 - 45 + oy], gTay, () => { q.beginPath(); q.rect(x0, y0, w, hh); q.clip(); ve0(); });
    };
    if (s.eo && E && E.moi) {
      // Ghép giữa đùi (zed-eo-sua): nửa trên = khung đòn hàng 0..cA, nửa dưới = khung chạy từ hàng cR (lấn 1 hàng, bị nửa trên đè).
      const aC = D.dong_tac.chay, cA = E.eA[2], cR = E.eR[2], yA = cA + 1, yB = E.eA[0] + 1, K = E.K, S = G.ZED_EO.vung_noi || 5;
      const dx = E.eR[1] - E.eA[1];
      // một hàng nguồn sy (cột x0 = toạ độ cột khung chạy của cột 0), kéo theo K với mức t (0 = giữ nguyên, 1 = khớp hẳn mép đích)
      const hang = (q, sx, sy, x0, yD, t) => {
        if (!K || !(t > 0)) { q.drawImage(T.img, sx, sy, 96, 1, x0 / 2 - 24, yD, 48, 0.5); return; }
        const tl = K.l + t * (K.L - K.l), tr = K.r + t * (K.R - K.r), k = (tr - tl + 1) / (K.r - K.l + 1);
        q.drawImage(T.img, sx, sy, 96, 1, (tl + (x0 - K.l) * k) / 2 - 24, yD, 48 * k, 0.5);
      };
      const tKeo = (k) => (k >= 0 && k < S ? (S - k) / S : 0); // k = số hàng tính từ mép nối
      // đang nghiêng: chỉ phần từ đai trở lên xoay, dải hông + đùi trên (dưới đai) đứng yên như chân; không nghiêng: vẽ liền tới vùng kéo
      const yT = N ? Math.min(yB, yA) : K && K.tren ? Math.max(0, yA - S) : yA;
      const lopEo = (q) => {
        const xoay = (fn) => (N ? nghieng(q, N, lean, fn) : fn());
        const vk = () => { q.save(); q.translate(E.ox, E.oy); veVk(q, V, v); q.restore(); };
        if (v && v.n[3]) xoay(vk);
        // nửa dưới: chân khung chạy từ hàng cR (cùng hướng thân trên, không lật); vùng nối kéo nếu nửa dưới hẹp hơn
        const y0 = K && !K.tren ? cR + 1 + S : cR;
        if (K && !K.tren) for (let y = cR; y < y0 && y < 96; y++) hang(q, s.eo.i * 96, aC.hang * 96 + y, 0, -45 + y / 2, y === cR ? 1 : tKeo(y - cR - 1));
        if (y0 < 96) q.drawImage(T.img, s.eo.i * 96, aC.hang * 96 + y0, 96, 96 - y0, -24, -45 + y0 / 2, 48, (96 - y0) / 2);
        // đang nghiêng: lót dải đai (6 hàng nguồn ngay trên đai, không xoay) để chỗ nối không hở
        if (N) q.drawImage(T.img, s.i * 96, a.hang * 96 + yB - 6, 96, 6, -24 + E.ox, -45 + E.oy + (yB - 6) / 2, 48, 3);
        // dải dưới (hàng yT..cA của khung đòn): không xoay; vùng nối kéo nếu nửa trên hẹp hơn
        for (let y = yT; y < yA; y++) hang(q, s.i * 96, a.hang * 96 + y, dx, -45 + E.oy + y / 2, K && K.tren ? tKeo(cA - y) : 0);
        // nửa trên: đai + thân + tay khung đòn (hàng 0..yT−1), dời về khung chạy; xoay quanh eo khi nghiêng
        xoay(() => {
          veTren(q, yT, E.ox, E.oy);
          if (v && !v.n[3]) vk();
          if (v && v.da.hang_tay != null) q.drawImage(T.img, v.wa.i * 96, v.da.hang_tay * 96, 96, yA, -24 + E.ox, -45 + E.oy, 48, yA / 2); // nắm tay đè lên cán
        });
      };
      return veLop(c, o, lopEo);
    }
    if (s.eo && E) {
      const aC = D.dong_tac.chay, yR = E.eR[0] + 1, yA = E.eA[0] + 1;
      const lopEo = (q) => {
        const xoay = (fn) => (N ? nghieng(q, N, lean, fn) : fn());
        const vk = () => { q.save(); q.translate(E.ox, E.oy); veVk(q, V, v); q.restore(); };
        if (v && v.n[3]) xoay(vk);
        // nửa dưới: chân khung chạy (từ dưới đai), lật theo hướng chạy
        q.save();
        if (E.rel < 0) { q.translate(E.kc, 0); q.scale(-1, 1); }
        q.drawImage(T.img, s.eo.i * 96, aC.hang * 96 + yR, 96, 96 - yR, -24, -45 + yR / 2, 48, (96 - yR) / 2);
        q.restore();
        // đang nghiêng: lót dải đai (6 hàng nguồn ngay trên eo, không xoay) để chỗ nối không hở
        if (N) q.drawImage(T.img, s.i * 96, a.hang * 96 + yA - 6, 96, 6, -24 + E.ox, -45 + E.oy + (yA - 6) / 2, 48, 3);
        // nửa trên: đai + thân + tay khung đòn, dời về điểm eo của khung chạy
        xoay(() => {
          veTren(q, yA, E.ox, E.oy);
          if (v && !v.n[3]) vk();
          if (v && v.da.hang_tay != null) q.drawImage(T.img, v.wa.i * 96, v.da.hang_tay * 96, 96, yA, -24 + E.ox, -45 + E.oy, 48, yA / 2); // nắm tay đè lên cán
        });
      };
      return veLop(c, o, lopEo);
    }
    const lop = (q) => {
      if (N) { // nửa dưới đứng yên (lấn lên 6 hàng nguồn để chỗ nối không hở), nửa trên + vũ khí + nắm tay xoay quanh eo
        const e = eoKhung(T, s.ten, s.i), yC = e[0] + 1, yL = Math.max(0, yC - 6);
        if (v && v.n[3]) nghieng(q, N, lean, () => veVk(q, V, v));
        q.drawImage(T.img, s.i * 96, a.hang * 96 + yL, 96, 96 - yL, -24, -45 + yL / 2, 48, (96 - yL) / 2);
        nghieng(q, N, lean, () => {
          veTren(q, yC, 0, 0);
          if (v && !v.n[3]) veVk(q, V, v);
          if (v && !s.theo && v.da.hang_tay != null) q.drawImage(T.img, v.wa.i * 96, v.da.hang_tay * 96, 96, 96, -24, -45, 48, 48); // nắm tay đè lên cán
        });
        return;
      }
      if (v && v.n[3]) veVk(q, V, v);
      veTren(q, 96, 0, 0);
      if (v && !v.n[3]) veVk(q, V, v);
      if (v && !s.theo && v.da.hang_tay != null) q.drawImage(T.img, v.wa.i * 96, v.da.hang_tay * 96, 96, 96, -24, -45, 48, 48); // nắm tay đè lên cán
    };
    return veLop(c, o, lop);
  }
  // Vẽ bóng + lật theo mặt + nhuộm (trúng đòn, băng, độc) + hào quang Gồng quanh một hàm vẽ người lop(q) (toạ độ tính từ chân).
  function veLop(c, o, lop) {
    const R = G.lamTron || Math.round; // soát mượt phiên 3 mục 1: cùng kiểu làm tròn với camera (nửa điểm ảnh; ?noisuy=0 như cũ)
    const x = R(o.x), y = R(o.y), f = o.face < 0 ? -1 : 1, t = (o.t != null ? o.t : G.time) || 0;
    const p = o.p, chet = !!(p && p.dead);
    c.save();
    if (o.alpha != null) c.globalAlpha = c.globalAlpha * o.alpha;
    c.imageSmoothingEnabled = false;
    if (!o.noShadow) {
      const sw = chet ? 12 : 8, sx = chet ? x - f * 6 : x;
      if (o.roundShadow && G.art && G.art.ellipse) G.art.ellipse(c, sx, y, sw + 1, Math.max(2, Math.round((sw + 1) * 0.45)), 'rgba(0,0,0,0.3)');
      else { c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(sx - sw + 2, y - 1, sw * 2 - 4, 1); c.fillRect(sx - sw, y, sw * 2, 1); c.fillRect(sx - sw + 2, y + 1, sw * 2 - 4, 1); }
    }
    c.translate(x + (f < 0 ? 1 : 0), y);
    c.scale(f, 1);
    const tint = SC.emBeTint ? SC.emBeTint(o) : null;
    if (tint && typeof document !== 'undefined') {
      // vùng 160×160 điểm ảnh game quanh chân (vũ khí dài vẫn lọt), nét ×2
      tam = tam || document.createElement('canvas');
      if (tam.width !== 320) { tam.width = 320; tam.height = 320; }
      const q = tam.getContext('2d');
      q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'source-over'; q.globalAlpha = 1; q.clearRect(0, 0, 320, 320);
      q.imageSmoothingEnabled = false; q.setTransform(2, 0, 0, 2, 160, 220);
      lop(q);
      q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'source-atop'; q.globalAlpha = tint[1]; q.fillStyle = tint[0]; q.fillRect(0, 0, 320, 320);
      q.globalCompositeOperation = 'source-over'; q.globalAlpha = 1;
      c.drawImage(tam, -80, -110, 160, 160);
    } else lop(c);
    if (o.gong) { // hào quang lúc Gồng (như js/hero_tinhlinh.js)
      for (let i = 0; i < 6; i++) {
        const ph = (t * 1.6 + i * 0.37) % 1, sx = Math.round(-10 + i * 4) + (i % 2), sy = Math.round(-4 - ph * 30);
        c.fillStyle = i % 2 ? '#fff3b0' : '#ffd27a';
        c.globalAlpha = (o.alpha != null ? o.alpha : 1) * (1 - ph) * 0.9;
        c.fillRect(sx, sy, 1, 4 + (i % 3));
      }
    }
    c.restore();
    return true;
  }

  // Mũi vũ khí cho vệt chém (js/fx.js đọc G.tinhLinh.tip): giữ nhịp / cửa sổ vệt của bản cũ, chỉ dời điểm cầm, hướng, độ dài theo neo mới.
  function doiTip(q, o) {
    const T = layThan(), V = lay('zed-vk');
    if (!T || !V) return;
    const D = T.tep, s = chon(o, D), v = vkCua(o, D, s, T, false);
    if (!v || v.cam) return; // vũ khí cầm lúc đứng/đi/chạy (cả lướt sau lộn): giữ mũi của bản cũ cho vệt/hiệu ứng
    const f = o.face < 0 ? -1 : 1, X0 = (G.lamTron || Math.round)(o.x) + (f < 0 ? 1 : 0), Y0 = (G.lamTron || Math.round)(o.y);
    const R = V.tep.vk[v.da.vk][v.cap], g = v.da.vk_cam[v.cap];
    const E = s.eo ? eoTinh(T, s, o) : null, ox = E ? E.ox : 0, oy = E ? E.oy : 0; // chạy + chém: vũ khí dời theo nửa trên đã khớp eo
    let gx = v.n[0] / 2 - 24 + ox, gy = v.n[1] / 2 - 45 + oy, ang = v.ang != null ? v.ang : v.n[2];
    const N = trucNghieng(T, s, v, E); // nghiêng thân trên (zed-8-huong): nắm tay xoay quanh eo, hướng vũ khí cộng thêm góc nghiêng
    if (N) { const b = (v.lean * Math.PI) / 180, cx = gx - N[0], cy = gy - N[1]; gx = N[0] + cx * Math.cos(b) - cy * Math.sin(b); gy = N[1] + cx * Math.sin(b) + cy * Math.cos(b); ang += v.lean; }
    const r = (ang * Math.PI) / 180;
    q.gx = X0 + f * gx; q.gy = Y0 + gy;
    q.dx = f * Math.cos(r); q.dy = Math.sin(r);
    q.L = Math.max(4, (R[2] - g[0]) * v.da.vk_tl);
    q.front = !v.n[3];
  }

  // Phi tiêu bay (đạn 'arrow' của người chơi): ảnh vk-phi-tieu theo cấp vũ khí đã ném, xoay khi bay.
  function vePhiTieu(c, o) {
    const V = lay('zed-vk');
    if (!V || !V.tep.vk.phitieu) return false;
    const cap = o.w ? capVk(o.w) : 0, a = anhVk(V, 'phitieu', cap, o.he && o.he.el && G.EL && G.EL[o.he.el] ? o.he.el : null), r0 = V.tep.vk.phitieu[0];
    const F = (o.big ? 11 : 8) / Math.max(r0[2], r0[3]); // cấp 1 rộng 8 điểm ảnh (ném chùm 11), cấp cao to dần theo ảnh
    const x = Math.round(o.x), y = Math.round(o.y - (o.z || 10));
    c.save();
    c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(x - 3, Math.round(o.y), 6, 1);
    c.imageSmoothingEnabled = false;
    c.translate(x, y); c.rotate(((G.time || 0) * 18 + (o.x + o.y) * 0.05) % (Math.PI * 2)); c.scale(F, F);
    c.drawImage(a.img, a.x, a.y, a.w, a.h, -a.w / 2, -a.h / 2, a.w, a.h);
    c.restore();
    return true;
  }

  // ---------- bọc G.art.hero, G.art.proj, G.tinhLinh.tip (ngoài cùng; lớp khác có thể bọc lại sau khi ảnh nạp nên kiểm mỗi khung) ----------
  // Soát mượt phiên 3 mục 22: khoá HÌNH của lần vẽ Cu Tí (js/fx.js viền bé chỉ dựng lại khi khoá đổi). null = không chắc (em bé khác, đang
  // nhuộm / trúng đòn / Gồng / ánh vũ khí chạy theo thời gian…) → nơi gọi dựng lại như cũ. Chỉ đọc, không đổi trạng thái vẽ.
  function khoaVe(o) {
    if (!o || !laZed(o) || o.gong || o.alpha != null && o.alpha !== 1 || o.flash) return null;
    const T = layThan(), p = o.p;
    if (!T || !p || p.dead || p.hurtT > 0) return null;
    const st = p.st || {};
    if (st.ice > 0 || st.poison > 0 || st.fire > 0) return null;
    const w = o.weapon, VV = G.vienVk;
    if (w && VV && VV.co && VV.co(w)) return null;
    const D = T.tep, s = chon(o, D), V = lay('zed-vk'), v = V ? vkCua(o, D, s, T, false) : null, h = HV && HV.get(p);
    return [T._ma, s.ten, s.i, s.eo ? s.eo.i + ':' + (s.eo.lui || 0) + ':' + (s.eo.moi || 0) : '', s.theo ? s.theo.ten + ':' + s.theo.i : '',
      v ? v.wa.ten + ':' + v.wa.i + ':' + v.cap + ':' + (v.he || '') + ':' + Math.round(v.ang / 2) + ':' + Math.round((v.lean || 0) * 2) : V ? '-' : '0',
      h ? Math.round(h.gv / 2) + ':' + Math.round(h.lv * 2) : '', o.face < 0 ? -1 : 1, w ? w.type + ':' + (w.coat || '') : '', o.dodge >= 0 ? 1 : 0, o.roundShadow ? 1 : 0].join('|');
  }
  G.zedMoi = { chon, MOC, eoTinh, lechHinh, lechTu, khoaVe, loi: [] };
  let dangGoiCu = false;
  const ghiLoi = (e) => { if (G.zedMoi.loi.length < 5) G.zedMoi.loi.push(String((e && e.message) || e)); };
  function boc() {
    const A = G.art;
    if (A && typeof A.hero === 'function' && !A.hero._zedMoi) {
      const cu = A.hero;
      // 14/10 (vũ khí cũ còn sót, mục 8): Zed chưa vẽ được bằng ảnh zed-* (chờ tải) → KHÔNG vẽ em bé code kiểu cũ; bạn nhỏ chưa có ảnh em-be-*
      // cũng vậy. ?vkcu=1 (G.VK_CU) vẽ như cũ (công cụ cần hình code thì mở kèm ?vkcu=1).
      const coEmBe = (o) => { const SC = G.spriteCustom; return !!(SC && SC.cuaEmBe && SC.cuaEmBe(o && o.key, o)); };
      const moi = function (c, o) {
        if (!dangGoiCu && laZed(o)) { try { if (ve(c, o)) return; } catch (e) { ghiLoi(e); } if (!G.VK_CU) return; }
        else if (!dangGoiCu && !G.VK_CU && !coEmBe(o)) return;
        const truoc = dangGoiCu; dangGoiCu = true;
        try { return cu.call(this, c, o); } finally { dangGoiCu = truoc; }
      };
      moi._zedMoi = true;
      A.hero = moi;
    }
    if (A && typeof A.proj === 'function' && !A.proj._zedMoi) {
      const cu = A.proj;
      const moi = function (c, o) {
        // phi tiêu mang hệ có ảnh hu-dan-ten-<hệ> (phi tiêu bọc lửa/nhớt/băng, js/fx_dan.js vẽ) thì để lớp trong vẽ ảnh đó
        const heAnh = o && o.he && o.he.el && G.fxAnh && G.fxAnh.co('hu-dan-ten-' + o.he.el);
        if (o && o.team === 'player' && o.kind === 'arrow' && !G.noRender && !heAnh) { try { if (vePhiTieu(c, o)) return; } catch (e) { ghiLoi(e); } if (!G.VK_CU) return; } // 14/10: zed-vk chưa về thì không vẽ mũi tên cũ
        return cu.apply(this, arguments);
      };
      moi._zedMoi = true; A.proj = moi;
    }
    const TL = G.tinhLinh;
    if (TL && typeof TL.tip === 'function' && !TL.tip._zedMoi) {
      const cu = TL.tip;
      const moi = function (o) {
        const q = cu.apply(this, arguments);
        if (q && laZed(o)) { try { doiTip(q, o); } catch (e) { ghiLoi(e); } }
        return q;
      };
      moi._zedMoi = true; TL.tip = moi;
    }
  }
  function giu() { try { boc(); } catch (e) { /* bỏ qua */ } if (typeof requestAnimationFrame === 'function') requestAnimationFrame(giu); }
  giu();
})();
