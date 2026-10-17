// HÌNH TỰ VẼ (Xưởng Sprite, tools/xuong-sprite): quái, người làng hoặc em bé (ba bạn NPC) nào có tệp <mã>.sprite.json trong game/art/custom/
// thì vẽ bằng tấm sprite trong tệp đó, đủ các động tác (đứng thở, đi, chuẩn bị đánh, đánh, trúng đòn, chết), quay trái phải,
// chớp trắng khi trúng đòn. Quái và em bé không có tệp vẫn vẽ bằng code như cũ. Thư mục trống thì game y hệt trước.
// - game/build.py nhúng các tệp vào bản đóng gói thành G.customSpriteData (mảng), tệp này đọc rồi xoá đi.
// - Chỉ đổi HÌNH: luật chơi, thời gian ra đòn, vùng báo trước, hiệu ứng chém, đạn... vẫn của game.
// - Công cụ Xưởng Sprite cũng nạp chính tệp này để hình xem trong công cụ và trong game là một.
// Nạp SAU monster_art.js và hero_tinhlinh.js.
// Đợt 2 (YEU-CAU-2-DON-CU.md): bỏ hẳn tệp và mã của nhân vật / đồ cũ — thân Cu Tí (em-be-smith*), tệp đòn theo vũ khí (em-be-*-don),
// thân theo bộ trang phục (em-be-<key>-<bộ>), ảnh vũ khí AI cũ (vk-*), ảnh trang phục cũ (tp-*), hồ sơ ghép trang bị (ghep-*).
// Tệp các loại đó nay bị từ chối khi nạp (build.py cũng dừng). Em bé chỉ còn thân của ba bạn NPC: em-be-hunter, em-be-healer, em-be-wrestler.
(function () {
  'use strict';
  const G = (typeof window !== 'undefined') ? (window.G = window.G || {}) : (globalThis.G = globalThis.G || {});
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const seg = (u, a, b) => clamp((u - a) / (b - a), 0, 1);
  const ANIMS = ['idle', 'move', 'tele', 'atk', 'hit', 'die', 'ne', 'noi', 'ngoi']; // ngoi: ba bạn nhỏ ngồi chơi ở sân đình (14/10)
  const LOOP = { idle: true, move: true, noi: true, ngoi: true };
  // Phiên E2 — DÁNG PHA của 3 trùm vùng: tệp có mã <trùm>-p2 hoặc <trùm>-p3 (ví dụ nguTinh-p2), lưới rút gọn 4 hàng idle / tele / atk / hit (tools/tach-quai).
  // Trùm đang ở pha đó thì các hàng CÓ trong tệp pha lấy từ tệp pha; hàng không có (move, die với lưới 4 hàng) mượn tệp pha 1. Không có tệp pha: vẽ pha 1 như trước.
  // Để sẵn: nếu sau này tệp pha có thêm hàng move hoặc die thì game dùng luôn, không phải sửa code (trang công cụ hiện chỉ xuất 4 hàng).
  // 14/10 (YEU-CAU-TRUM-NHO): ba trùm nhỏ Nấm Chúa / Cua Đá / Hổ Lửa có thêm tệp pha 2 (<mã>-p2). Trùm nhỏ chỉ đổi HÌNH (js/mobs.js truyền
  // o.phase = 2 khi máu < 50%), không đổi chiêu hay số. Tắt: G.TRUM_NHO_PHA = false hoặc ?trumnho=0 (trùm nhỏ giữ hình pha 1 suốt trận).
  const PHA_MA = /^(nguTinh|mocTinh|hoTinh|namChua|cuaDa|hoLua)-p([23])$/, PHA_HANG = { idle: 1, tele: 1, atk: 1, hit: 1, move: 1, die: 1 };

  // Em bé còn dùng (ba bạn NPC ngồi ở sân đình, truyện, bảng Ông Từ). Thân Cu Tí cũ, đòn theo vũ khí, thân theo bộ: đã bỏ (đợt 2).
  const EM_BE_MA = /^em-be-(hunter|healer|wrestler)$/;
  // Loại tệp đã bỏ ở đợt 2: nạp thì báo lỗi, bỏ qua (bản lưu / trang công cụ cũ còn giữ tệp cũng không làm hỏng game).
  const LOAI_BO = { 'vu-khi': 'ảnh vũ khí cũ (vk-*)', 'trang-phuc': 'ảnh trang phục cũ (tp-*)', ghep: 'hồ sơ ghép trang bị (ghep-*)' };

  // Phiên di chuyển khi chém (12/10, phản hồi người chơi: "chạy mà chém thì tướng như đứng yên"):
  //  G.CHAY_DANH: đang CHẠY mà đánh thì thân AI vẽ thế nào. 'than': thân giữ hàng chạy (chân bước), chỉ vũ khí vung theo đòn;
  //    'lai': hàng đòn chỉ quanh lúc vung tới (u 0,2..0,65), còn lại hàng chạy; 'nhun': hàng đòn như cũ nhưng nhún theo bước.
  //    false: như cũ (chỉ hàng đòn, chân đứng im). Đứng yên mà đánh: luôn hàng đòn đầy đủ. Mở game với ?chaydanh=0|than|lai|nhun.
  //  G.NHUN_BUOC: thân nhấc lên 1 điểm ảnh ở hai nhịp mỗi vòng chạy (hàng chạy ít chuyển động). Tắt: G.NHUN_BUOC = false hoặc ?nhunbuoc=0.
  {
    let q = '';
    try { q = typeof location !== 'undefined' ? location.search || '' : ''; } catch (e) { q = ''; }
    if (G.CHAY_DANH === undefined) { const m = /[?&]chaydanh=(\w+)/.exec(q); G.CHAY_DANH = m ? (m[1] === '0' ? false : m[1]) : 'than'; }
    if (G.NHUN_BUOC === undefined) G.NHUN_BUOC = !/[?&]nhunbuoc=0(&|$)/.test(q);
  }

  const SC = (G.spriteCustom = { ds: {}, ANIMS, LOOP, loi: [] });
  // Phiên hiệu năng (V3): nạp tệp ảnh tải sau nhẹ nhàng hơn — giải mã ảnh ngoài luồng chính (img.decode) trước khi dùng, mỗi khung
  // chỉ nhận vài hình, và chỉ xoá hình đã nhớ của em bé / đồ khi hình mới đang được dùng (thay cho xoá theo nhịp 400 ms).
  // Tắt: G.NAP_SAU_MOI = false hoặc ?napsau=0 (như cũ).
  if (G.NAP_SAU_MOI === undefined) {
    let tat = false;
    try { tat = typeof location !== 'undefined' && /[?&]napsau=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; }
    G.NAP_SAU_MOI = !tat;
  }
  // Phiên Kiểm 3 pha (12/10): trùm vùng ở pha 2, 3 lúc đi / gục vẫn giữ hình pha (SC.veQuai). Tắt: G.PHA_TRUM_DU = false hoặc ?phatrum=0.
  if (G.PHA_TRUM_DU === undefined) {
    let tat = false;
    try { tat = typeof location !== 'undefined' && /[?&]phatrum=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; }
    G.PHA_TRUM_DU = !tat;
  }
  // Phiên bỏ khung trùng (12/10, rà soát A10): hàng có "khung": [0, 2, 3, 4, 5] (danh sách cột phát, bỏ cột ảnh AI trùng cột trước)
  // và tuỳ chọn "cham": <cột> (cột giữ nguyên mốc bắt đầu cũ = cột / so, ví dụ khung chạm đòn) thì phát theo danh sách đó: các cột trước
  // "cham" chia đều quãng trước mốc, các cột từ "cham" chia đều quãng sau; tổng thời lượng (giay) giữ nguyên. Hàng không có "khung": như cũ.
  // Tắt: G.KHUNG_TRUNG = false hoặc ?khungtrung=0.
  if (G.KHUNG_TRUNG === undefined) {
    let tat = false;
    try { tat = typeof location !== 'undefined' && /[?&]khungtrung=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; }
    G.KHUNG_TRUNG = !tat;
  }
  // 14/10: phân thân Hồ Tinh pha 2 vẽ bằng chính ảnh AI (trong suốt, nhuộm tím hồng). Tắt: G.PHAN_THAN_ANH = false hoặc ?phanthan=0.
  if (G.PHAN_THAN_ANH === undefined) {
    let tat = false;
    try { tat = typeof location !== 'undefined' && /[?&]phanthan=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; }
    G.PHAN_THAN_ANH = !tat;
  }
  // 14/10: trùm nhỏ đổi sang hình pha 2 khi máu < 50% (js/mobs.js). ?trumnho=0: tắt, giữ hình pha 1.
  if (G.TRUM_NHO_PHA === undefined) {
    let tat = false;
    try { tat = typeof location !== 'undefined' && /[?&]trumnho=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; }
    G.TRUM_NHO_PHA = !tat;
  }
  // 14/10 (sửa nhỏ, chủ dự án "Ok hết"): người làng cử động lại: hàng đứng lặp, hàng nói khi em bé lại gần / đang nói chuyện (village_scene.js
  // truyền look). Tắt: G.NL_DONG = false hoặc ?nldong=0 (như 12/10: đứng yên một khung đầu hàng đứng).
  if (G.NL_DONG === undefined) {
    let tat = false;
    try { tat = typeof location !== 'undefined' && /[?&]nldong=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; }
    G.NL_DONG = !tat;
  }
  // 15/10 con-ve-tay (docs/review/ke-hoach-cai-thien/con-ve-tay): ảnh AI của vài trùm có khung trúng đòn bị tô trắng gần hết thân (Cua Đá
  // hàng hit khung 3, cả hai pha) → lúc trúng đòn / choáng trông như bóng ma. Nay khung đó vẽ bằng khung 2 cùng hàng, phủ trắng nhẹ 25%.
  // Danh sách đo bằng ảnh (bao-cao.md): mã → { hàng: { cột trắng: cột thay } }. Không sửa tệp ảnh. Tắt: G.KHUNG_TRANG_SUA = false hoặc ?khungtrang=1.
  const KHUNG_TRANG = { cuaDa: { hit: { 2: 1 } }, 'cuaDa-p2': { hit: { 2: 1 } }, 'mocTinh-p2': { hit: { 2: 1 } }, 'hoTinh-p2': { hit: { 2: 1 } },
    hoLua: { hit: { 2: 1 } }, namChua: { hit: { 2: 1 } },
    // 15/10 soat-muot Phiên 1 (mục 11A): hai chỗ còn sót, đo ở soat-muot/khung-trang-trum.png — Hổ Lửa pha 2 hàng trúng đòn khung 2 (23% thân trắng),
    // Nấm Chúa pha 2 khung 3 (15%, loé hồng trắng). Cùng cờ ?khungtrang=1.
    'hoLua-p2': { hit: { 1: 0 } }, 'namChua-p2': { hit: { 2: 1 } } };
  const PHU_TRANG = 0.25;
  if (G.KHUNG_TRANG_SUA === undefined) {
    let cu = false;
    try { cu = typeof location !== 'undefined' && /[?&]khungtrang=1(&|$)/.test(location.search || ''); } catch (e) { cu = false; }
    G.KHUNG_TRANG_SUA = !cu;
  }
  // 15/10 con-ve-tay: quái / trùm có ảnh AI trúng đòn KHÔNG còn phủ trắng cả thân (55–85%, cộng thêm 75% đầu hàng trúng đòn — chồng lên khung
  // đã trắng thành trắng gấp đôi). Nay: viền sáng mảnh quanh thân + nhuộm đỏ nhẹ. Chớp báo ra đòn / đổi pha của trùm (o.baoDon) giữ như cũ.
  // (15/10 don-tep B: bỏ cờ quay lui ?chopcu=1 / G.CHOP_NHE — luôn viền sáng + đỏ nhẹ.)
  // 14/10 (quai-moi-4-con): Heo Rừng Con, Heo Rừng Nanh Dài, Chồn Bóng, Bọ Hung Mai Cứng dựng lại từ ảnh vẽ mới (đủ 6 động tác, net 2, căn tâm).
  // 15/10 don-tep B: bỏ 30 tấm cũ <mã>-cu.sprite.json (mục "cu_cua") cùng cờ ?quaicu=1 (G.QUAI_CU).
  // 15/10 soát mượt (ảnh gen P1–P4, P6, docs/anh-goc/soat-muot/bao-cao.md): 7 tấm (Cá Nóc Chúa, Nhím Biển, Nhím Gai Độc, Heo Nanh Dài, Hổ Lửa pha 2,
  // Nấm Chúa pha 2, Hồ Tinh) thay một hàng bằng ảnh gen mới; tấm có mục "muot". Tấm trước đó giữ ở <mã>-muotcu.sprite.json (mục "muot_cua": <mã>):
  // bình thường KHÔNG nạp. Cờ ?anhmuotcu=1 (G.ANH_MUOT_CU): nạp tấm đó dưới đúng mã, bỏ tấm mới (các vá tạm Phiên 1 tự chạy lại vì tấm cũ không có "bo_va").
  if (G.NET_CU === undefined) { let cu = false; try { cu = typeof location !== 'undefined' && /[?&]netcu=1(&|$)/.test(location.search || ''); } catch (e) { cu = false; } G.NET_CU = cu; }
  if (G.ANH_MUOT_CU === undefined) {
    let cu = false;
    try { cu = typeof location !== 'undefined' && /[?&]anhmuotcu=1(&|$)/.test(location.search || ''); } catch (e) { cu = false; }
    G.ANH_MUOT_CU = cu;
  }
  let napSauDangChay = false, trongNapSau = false;
  // Tải nhanh (12/10): ảnh rời. roiNhan(img, src) nhận ảnh anh/<mã>.<mã nội dung>.png vào hàng chờ; roiCan(ma) báo game đang cần hình ma
  // (chưa có thì tải ngay). Chỉ có ở bản 2 tệp ảnh rời (G.ANH_ROI); bản một tệp, công cụ: null, như cũ.
  let roiNhan = null, roiCan = null;
  // Nguồn ảnh hợp lệ: ảnh PNG base64 nhúng sẵn (như cũ) hoặc đường dẫn ảnh rời anh/….png của bản 2 tệp ảnh rời.
  SC.laAnh = (s) => typeof s === 'string' && (s.indexOf('data:image/png;base64,') === 0 || (!!G.ANH_ROI && /^anh\/[A-Za-z0-9_.-]{1,90}\.png$/.test(s)));
  SC.canAnh = (ma) => { if (roiCan) roiCan(ma); };
  // Gắn ảnh nguồn src vào img (đã gắn sẵn onload / onerror). Ảnh của tệp tải sau: giải mã xong (ngoài luồng chính) mới gọi onload,
  // để lần vẽ đầu không phải giải mã PNG ngay trong khung hình. Trình duyệt không có img.decode: như cũ.
  SC.napAnh = function (img, src) {
    if (roiNhan && roiNhan(img, src)) return; // tải nhanh 12/10: ảnh rời anh/… vào hàng chờ tải theo ưu tiên (khối ẢNH RỜI cuối tệp)
    if (!G.NAP_SAU_MOI || !trongNapSau || typeof img.decode !== 'function') { img.src = src; return; }
    const xong = img.onload, hong = img.onerror;
    img.onload = null; img.onerror = null;
    img.src = src;
    // Phiên Kiểm 3 pha (12/10): Safari (iPhone) đôi khi từ chối img.decode() với ảnh lớn dù ảnh vẫn nạp được. Trước đây lúc đó ảnh bị coi là
    // hỏng ngay (không bao giờ "ready": ví dụ tệp dáng pha trùm 3 MP không hiện). Nay: chưa nạp xong thì chờ onload / onerror thật như cách cũ.
    img.decode().then(() => { if (xong) xong.call(img); }, () => {
      if (img.complete && img.naturalWidth) { if (xong) xong.call(img); }
      else if (img.complete) { if (hong) hong.call(img); }
      else { img.onload = xong; img.onerror = hong; }
    });
  };
  // "net" (số nguyên 1..4, mặc định 1): ảnh trong tệp ("tam" hoặc "anh") có số điểm ảnh gấp net lần, còn MỌI số khác trong tệp
  // (khung_rong, khung_cao, goc, rong, cao, neo, vu_khi.cam/mui/day, trang_phuc.lech...) vẫn tính theo điểm ảnh GAME.
  // Game cắt vùng ảnh gấp net lần rồi vẽ ra đúng cỡ game: trên canvas thế giới nét gấp đôi (G.NET = 2) hiện đủ chi tiết.
  const docNet = (v) => (v == null || !isFinite(+v) ? 1 : clamp(Math.round(+v), 1, 4));
  SC.docNet = docNet;

  // ---------- nạp một tệp ----------
  // tep: nội dung tệp .sprite.json (đối tượng). Trả về sprite (đang nạp ảnh) hoặc null nếu tệp hỏng.
  // 16/10 quai-song-moi (docs/review/ke-hoach-cai-thien/quai-song-moi/bao-cao.md): 4 quái thường Sông sâu có ảnh thật. Cờ ?quaisongmoi=0
  // (G.QUAI_SONG_MOI = false): không nạp 4 tệp này → game vẽ HÌNH TẠM như trước (ảnh con mượn nhuộm màu, js/ky_nang_quai.js KN.veTam).
  // Bỏ ngay ở đây nên ảnh rời cũng không vào hàng tải / không tính vào "Đang tải ảnh vùng".
  if (G.QUAI_SONG_MOI == null) { let tat = false; try { tat = typeof location !== 'undefined' && /[?&]quaisongmoi=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; } G.QUAI_SONG_MOI = !tat; }
  const QUAI_SONG_MOI = { raiCa: 1, diaTrau: 1, baBa: 1, cocTia: 1 };
  SC.add = function (tep) {
    if (tep && tep.doi_tuong === 'hieu-ung') return G.fxAnh ? G.fxAnh.add(tep) : null; // hiệu ứng ảnh AI (js/fx_anh.js)
    if (tep && G.QUAI_SONG_MOI === false && tep.doi_tuong === 'quai' && QUAI_SONG_MOI[tep.ma]) return null;
    try {
      if (!tep || typeof tep !== 'object' || typeof tep.ma !== 'string' || !/^[A-Za-z0-9_-]{1,40}$/.test(tep.ma)) throw new Error('thiếu mã');
      if (LOAI_BO[tep.doi_tuong]) throw new Error('đã bỏ ở đợt 2: ' + LOAI_BO[tep.doi_tuong]);
      if (typeof tep.muot_cua === 'string') { // soát mượt: tấm trước khi thay hàng (xem G.ANH_MUOT_CU), chỉ dùng khi bật ?anhmuotcu=1
        if (!G.ANH_MUOT_CU) return null;
        tep = Object.assign({}, tep, { ma: tep.muot_cua });
      } else if (G.ANH_MUOT_CU && tep.muot) return null; // ?anhmuotcu=1: bỏ tấm đã thay hàng
      // 17/10 do-net: tấm Cu Tí trước khi dựng lại cho nét (<mã>-netcu, mục "net_cua") chỉ có ở bản hai tệp, chỉ nạp khi ?netcu=1
      // (bản một tệp không có → ?netcu=1 chỉ về cách vẽ cũ, js/zed_moi.js). Có tấm cũ thì bỏ tấm mới.
      if (typeof tep.net_cua === 'string') {
        if (!G.NET_CU) return null;
        tep = Object.assign({}, tep, { ma: tep.net_cua });
      } else if (G.NET_CU && tep.net_moi && Array.isArray(G.customSpriteData) && G.customSpriteData.some((t) => t && t.net_cua === tep.ma)) return null;
      if (tep.doi_tuong === 'em-be' && !EM_BE_MA.test(tep.ma)) throw new Error('đã bỏ ở đợt 2: em bé chỉ còn em-be-hunter, em-be-healer, em-be-wrestler');
      if (DO_LOAI[tep.doi_tuong]) return themDo(tep); // vật phẩm
      if (tep.doi_tuong === 'giao-dien') return themGd(tep); // ảnh giao diện (gd-<tên>): biểu tượng, ô phòng, khung bản đồ
      if (tep.doi_tuong === 'zed') return themZed(tep); // bộ Zed mới 13/10 (zed-moi: thân + nắm tay, zed-vk: vũ khí 4 cấp); js/zed_moi.js vẽ
      if (!SC.laAnh(tep.tam)) throw new Error('thiếu tấm sprite');
      const fw = tep.khung_rong | 0, fh = tep.khung_cao | 0, goc = tep.goc || [0, 0];
      if (fw < 1 || fh < 1 || fw > 1024 || fh > 1024) throw new Error('cỡ khung sai');
      const dt = {};
      for (const k of ANIMS) {
        const a = tep.dong_tac && tep.dong_tac[k];
        if (!a) continue;
        dt[k] = { hang: a.hang | 0, so: Math.max(1, a.so | 0), giay: +a.giay > 0 ? +a.giay : 0.6, lap: !!a.lap, mo: a.mo != null ? +a.mo : null };
        // 15/10 quai-moi-6-con: "lap_tu" (hàng đánh): chạy hết một lượt rồi LẶP các cột lap_tu..so-1 cho tới khi game đổi cử động (Nhím lăn dài).
        if (k === 'atk' && a.lap_tu != null && isFinite(+a.lap_tu)) dt[k].lapTu = clamp(Math.round(+a.lap_tu), 0, dt[k].so - 1);
        // 15/10 quai-moi-bien: "lap_den" (cột cuối của đoạn lặp, mặc định cột cuối hàng): Nhím Biển xoay bắn gai lặp cột 2–5, Cá Nóc Chúa lăn lặp cột 3–4.
        if (dt[k].lapTu != null) dt[k].lapDen = a.lap_den != null && isFinite(+a.lap_den) ? clamp(Math.round(+a.lap_den), dt[k].lapTu, dt[k].so - 1) : dt[k].so - 1;
        // 15/10 soát mượt (P2): "ve" (hàng đánh): các cột "duỗi về dáng đứng" phát sau lượt đánh thay cho vá thu gai (js/mobs.js).
        if (k === 'atk' && Array.isArray(a.ve) && a.ve.length) dt[k].ve = a.ve.slice(0, 8).map((x) => clamp(Math.round(+x || 0), 0, dt[k].so - 1));
        const bg = docBang(a, dt[k].so); if (bg) dt[k].bang = bg; // "khung" / "cham" (bỏ khung trùng); không có thì không thêm gì
      }
      if (!dt.idle) throw new Error('thiếu động tác đứng thở');
      const sp = {
        ma: tep.ma, ten: String(tep.ten || tep.ma), doi: tep.doi_tuong === 'em-be' ? 'em-be' : tep.doi_tuong === 'nguoi-lang' ? 'nguoi-lang' : 'quai', fw, fh, ax: +goc[0] || 0, ay: +goc[1] || 0,
        lat: /^(trai|trái|left)$/i.test(String(tep.huong || tep.quay || '')), // ảnh vẽ quay TRÁI thì ghi "huong":"trai" — game tự lật lại để đầu luôn hướng về phía đi
        net: docNet(tep.net), rong: tep.rong | 0 || fw, cao: tep.cao | 0 || fh, bong: +tep.bong || Math.max(6, (tep.rong | 0) * 0.62), dt, img: null, ready: false, mau: {}, vung: tep.vung || 'moi',
      };
      // Bộ phận "Đứng yên" và độ nhún cả người chọn trong công cụ. Tấm sprite đã dựng sẵn theo lựa chọn này, nên game chỉ
      // phát đúng từng khung, không tự thêm nhún, lắc hay xoay nào lên hình tự vẽ (bộ phận đứng yên giữ nguyên trong game).
      // Tệp cũ không có hai mục này: null, phát như trước.
      sp.dungYen = Array.isArray(tep.dung_yen) ? tep.dung_yen.filter((x) => typeof x === 'string' && /^[A-Za-z0-9_]{1,20}$/.test(x)).slice(0, 20) : null;
      sp.nhun = tep.nhun == null || !isFinite(+tep.nhun) ? null : clamp(+tep.nhun, 0, 200);
      // 15/10 sua-lang-npc: người làng có thể ghi tay ô mặt cho dải lối tắt, "vung_mat": [x, y, cạnh] theo điểm GAME trong khung đứng thở đầu
      // (Cụ Đồ ngồi: đầu chiếm gần nửa hình, ô mặt tự dò lệch lên mũ và bị vòng tròn cắt mất mặt). Không có thì tự dò như cũ.
      const vm = tep.vung_mat;
      sp.vungMatTay = Array.isArray(vm) && vm.length === 3 && vm.every((v) => isFinite(+v)) && +vm[2] > 0 ? vm.map((v) => +v) : null;
      // 14/10 trum-chet-pha3: "can_tam": { <động tác>: [độ dời ngang từng khung] } (điểm ảnh game, đo từ ảnh: tâm thân trên sàn → điểm neo).
      // Ảnh AI cắt không căn tâm: thân nhảy ngang giữa các khung / các hàng, lệch khỏi điểm neo (lật mặt thì lệch sang phía kia).
      // quai-moi-4-con: quái thường / tinh anh vẽ lại cũng có "can_tam" (đo lúc dựng tấm) — luôn dùng.
      // 15/10 soát mượt: "bo_va": vá tạm Phiên 1 không cần nữa vì ảnh mới đã vẽ đúng ('xi_vao', 'xi_ve' ở js/mobs.js; 'khung_trang' ở KHUNG_TRANG).
      sp.boVa = Array.isArray(tep.bo_va) ? tep.bo_va.filter((x) => typeof x === 'string').slice(0, 8) : null;
      if (tep.can_tam && typeof tep.can_tam === 'object') { sp.ct = {}; for (const k of Object.keys(dt)) { const v = tep.can_tam[k]; if (Array.isArray(v)) sp.ct[k] = v.map((x) => clamp(Math.round(+x || 0), -40, 40)); } }
      // Em bé thân AI: đồ đang mặc (mũ, áo, đồ lưng, bùa, dấu mặt nạ, cánh) vẫn khoác lên thân AI, trừ khi tệp ghi "khoac_do": false.
      // "neo": { "dau": [dx, dy], "than": [dx, dy], "tay": [dx, dy], "<động tác>": { "dau": [..], "than": [..], "tay": [..] } } dời chỗ đặt đồ
      // (đầu, thân) và vũ khí + nắm tay (tay) theo điểm ảnh cho khớp hình AI.
      if (sp.doi === 'em-be') {
        sp.khoacDo = tep.khoac_do !== false; sp.neo = docNeo(tep.neo);
        // Hàng chạy vẽ sẵn nhún lên xuống (nhập ảnh 12/10: hàng chạy 8 khung mới) thì tệp ghi "nhun_buoc": false: game không nhún thêm (G.NHUN_BUOC).
        sp.nhunBuoc = tep.nhun_buoc !== false;
        sp.caoNgoi = tep.cao_ngoi | 0; // 14/10: chiều cao khung ngồi (điểm game), 0 = không có hàng ngồi
      }
      if (typeof Image !== 'undefined') {
        const img = new Image();
        img.onload = () => { sp.img = img; sp.ready = true; if (sp.doi === 'em-be' && G.NAP_SAU_MOI && napSauDangChay) xoaNhoDoKhiCan(sp); };
        img.onerror = () => { SC.loi.push(sp.ma + ': ảnh hỏng'); };
        SC.napAnh(img, tep.tam);
      }
      SC.ds[sp.ma] = sp;
      // Chỉ nối vào game khi thật sự có hình tự vẽ: không có tệp nào thì game y hệt như chưa có tệp này.
      // Phiên E2: tệp <trùm>-p2 / <trùm>-p3 là DÁNG PHA của trùm vùng (lưới rút gọn 4 hàng), không phải một con quái mới: không thêm vào danh sách quái.
      const mp = sp.doi === 'quai' ? PHA_MA.exec(sp.ma) : null;
      if (mp) { sp.phaCua = mp[1]; sp.pha = +mp[2]; noiQuai(); }
      else if (sp.doi === 'quai') { noiQuai(); themVaoDanhSach(sp); } else if (sp.doi === 'nguoi-lang') noiNguoiLang(); else noiEmBe();
      return sp;
    } catch (e) {
      SC.loi.push((tep && tep.ma) + ': ' + e.message);
      if (typeof console !== 'undefined') console.warn('sprite_custom: bỏ qua tệp hỏng', tep && tep.ma, e.message);
      return null;
    }
  };
  // ---------- BỘ ZED MỚI (13/10/2026, docs/review/ke-hoach-cai-thien/zed-tich-hop) ----------
  // Tệp "doi_tuong": "zed" (mã zed-moi, zed-vk; dựng bằng docs/anh-goc/zed/dung-zed-game.py): chỉ nạp ảnh và giữ nguyên số liệu
  // vào SC.zed[mã] = { tep, img, ready }. Cách chọn khung, gắn vũ khí theo neo và vẽ nằm ở js/zed_moi.js.
  SC.zed = {};
  // KIẾM VUÔNG 17/10 (docs/review/ke-hoach-cai-thien/kiem-vuong/bao-cao.md): chủ game gen bộ kiếm mới đầu vuông, cán dài hai tay
  // (docs/anh-goc/zed/moi/vk-kiem-vuong.png → docs/anh-goc/zed/dung-kiem-vuong.py → mục "kiem_vuong" của zed-vk.sprite.json). Khi nạp
  // zed-vk: dán ảnh 4 kiếm mới xuống dưới tấm cũ (canvas), ô kiem 4 cấp trỏ sang ảnh mới, nhớ điểm cầm / đầu vuông ở z.kv → MỌI chỗ dùng
  // ô zed-vk 'kiem' (trên tay Cu Tí mọi bộ trang phục, HUD, túi đồ, Lò rèn, Luyện, nút đánh) đổi theo. Cùng tỉ lệ ô, lưỡi dài bằng lưỡi cũ
  // từng cấp; điểm cầm theo nắm tay trước sát chắn tay (js/zed_moi.js bienThe). Ảnh theo hệ / ảnh "gân" kiểu kiếm cũ không dùng cho kiếm
  // (js/vien_vk.js) → nhuộm hệ trên ảnh mới. Chỉ HÌNH. ?kiemvuong=0: không ghép, kiếm cũ y hệt trước.
  function kiemVuongBat() {
    if (G.KIEM_VUONG === undefined) { let t = false; try { t = typeof location !== 'undefined' && /[?&]kiemvuong=0(&|$)/.test(location.search || ''); } catch (e) { t = false; } G.KIEM_VUONG = !t; }
    return G.KIEM_VUONG !== false;
  }
  function ghepKiemVuong(z, img, k2) {
    const tep = z.tep, K = tep.kiem_vuong;
    let ok = false;
    try {
      if (k2 && K && Array.isArray(K.vk) && K.vk.length === 4 && tep.vk && tep.vk.kiem) {
        const W0 = img.naturalWidth || img.width, H0 = img.naturalHeight || img.height, W1 = k2.naturalWidth || k2.width, H1 = k2.naturalHeight || k2.height;
        const cv = document.createElement('canvas'); cv.width = Math.max(W0, W1); cv.height = H0 + 2 + H1;
        const q = cv.getContext('2d'); q.drawImage(img, 0, 0); q.drawImage(k2, 0, H0 + 2);
        const vk = Object.assign({}, tep.vk, { kiem: K.vk.map((r) => [r[0], r[1] + H0 + 2, r[2], r[3]]) });
        z.tep = Object.assign({}, tep, { vk });
        z.kv = { cam: K.cam, mui: K.mui, cu: tep.vk.kiem };
        z.img = cv; ok = true;
      }
    } catch (e) { ok = false; }
    if (!ok) { z.tep = tep; z.kv = null; z.img = img; }
    z.ready = true;
  }
  SC.kiemVuong = () => { const z = SC.zed && SC.zed['zed-vk']; return z && z.ready && z.kv ? z.kv : null; };
  function themZed(tep) {
    if (!/^zed-[a-z0-9-]{1,30}$/.test(tep.ma)) throw new Error('mã tệp Zed phải là zed-<tên>');
    if (!SC.laAnh(tep.tam)) throw new Error('thiếu tấm ảnh');
    const z = { ma: tep.ma, tep, img: null, ready: false };
    SC.zed[tep.ma] = z;
    if (typeof Image !== 'undefined') {
      const img = new Image();
      if (tep.ma === 'zed-vk' && kiemVuongBat() && tep.kiem_vuong && SC.laAnh(tep.kiem_vuong.tam) && typeof document !== 'undefined') {
        // KIẾM VUÔNG 17/10: chờ cả hai ảnh, ghép xong mới báo sẵn sàng (mọi chỗ dùng zed-vk thấy cùng một tấm)
        const k2 = new Image(); let con = 2, xong = false;
        const het = () => { if (--con > 0 || xong || SC.zed[tep.ma] !== z) return; xong = true; ghepKiemVuong(z, img, k2.naturalWidth ? k2 : null); };
        k2.onload = het; k2.onerror = het;
        img.onload = het;
        img.onerror = () => { SC.loi.push(tep.ma + ': ảnh hỏng'); };
        SC.napAnh(img, tep.tam); SC.napAnh(k2, tep.kiem_vuong.tam);
        return z;
      }
      img.onload = () => { if (SC.zed[tep.ma] !== z) return; z.img = img; z.ready = true; };
      img.onerror = () => { SC.loi.push(tep.ma + ': ảnh hỏng'); };
      SC.napAnh(img, tep.tam);
    }
    return z;
  }
  SC.remove = function (ma) { if (SC.do[ma]) boDo(ma); delete SC.ds[ma]; if (SC.gd) delete SC.gd[ma]; if (SC.zed) delete SC.zed[ma]; };
  SC.clear = function () { for (const k of Object.keys(SC.ds)) delete SC.ds[k]; for (const k of Object.keys(SC.do)) boDo(k); if (SC.gd) for (const k of Object.keys(SC.gd)) delete SC.gd[k]; };
  SC.get = function (ma) { const s = SC.ds[ma]; if (s && !s.ready && roiCan) roiCan(ma); return s && s.ready ? s : null; };
  SC.has = (ma) => !!SC.ds[ma];
  SC.dungYen = (ma, bo) => { const s = SC.ds[ma]; return !!(s && s.dungYen && s.dungYen.indexOf(bo) >= 0); };

  // ---------- chọn khung ----------
  // Động tác lặp: theo thời gian t (giây). Động tác một lần: theo tiến độ u (0..1).
  function khungLap(a, t) {
    if (a.bang && G.KHUNG_TRUNG) { const f = Math.max(0, t) / a.giay; return theoBang(a.bang, f - Math.floor(f + 1e-6)); }
    return Math.floor(Math.max(0, t) / (a.giay / a.so) + 1e-6) % a.so;
  }
  function khungMot(a, u) {
    if (a.bang && G.KHUNG_TRUNG) return theoBang(a.bang, clamp(u, 0, 1));
    return Math.min(a.so - 1, Math.floor(clamp(u, 0, 1) * a.so));
  }
  // Bảng phát (bỏ khung trùng): [{ s: mốc bắt đầu 0..1, i: cột ảnh }], xem G.KHUNG_TRUNG ở đầu tệp.
  function theoBang(b, u) { let k = 0; for (let j = 1; j < b.length; j++) if (u + 1e-6 >= b[j].s) k = j; return b[k].i; }
  function docBang(a, so) {
    if (!Array.isArray(a.khung)) return null;
    const ds = [];
    for (const x of a.khung) { const i = x | 0; if (i === +x && i >= 0 && i < so && ds.indexOf(i) < 0) ds.push(i); }
    if (!ds.length) return null;
    const n = ds.length, jc = a.cham != null ? ds.indexOf(+a.cham) : -1, b = [];
    if (jc < 0) { for (let j = 0; j < n; j++) b.push({ s: j / n, i: ds[j] }); return b; }
    const t0 = ds[jc] / so;
    for (let j = 0; j < jc; j++) b.push({ s: (j * t0) / jc, i: ds[j] });
    for (let j = jc; j < n; j++) b.push({ s: t0 + ((j - jc) * (1 - t0)) / (n - jc), i: ds[j] });
    if (b.length) b[0].s = 0;
    return b;
  }
  SC.docBang = docBang;
  SC.khungLap = khungLap; SC.khungMot = khungMot;
  // Phiên hiệu năng (V2): bộ nhớ đệm hình dùng chung một ngân sách điểm ảnh (js/bo_nho.js). Trang công cụ không nạp bo_nho.js:
  // dùng bản đơn giản (trần đếm số tấm, đầy thì xoá sạch như cũ).
  const taoNho = (G.boNho && G.boNho.tao) || ((ten, o) => { const m = new Map(), max = (o && o.max) || 2000; return { get: (k) => m.get(k), set: (k, v) => { if (m.size >= max) m.clear(); m.set(k, v); return v; }, cong() {}, del: (k) => m.delete(k), clear: () => m.clear(), get size() { return m.size; } }; });
  const boNhoBat = () => !!(G.boNho && G.BO_NHO);
  // Số hiệu của một tấm ảnh (khoá bộ nhớ đệm theo ẢNH chứ không theo tệp: ảnh đổi, ví dụ ghép hàng đòn, thì khoá đổi theo).
  const ID_ANH = new WeakMap(); let demAnh = 0;
  const idAnh = (img) => { let n = ID_ANH.get(img); if (!n) { n = ++demAnh; ID_ANH.set(img, n); } return n; };
  const NH_QUAI = taoNho('nhuom-quai', { max: 600, nhom: 'quai' }), NH_KHAC = taoNho('nhuom', { max: 600 });
  const THAN_NHO = taoNho('than-quai', { max: 800, nhom: 'quai' });
  // V5: tấm một màu CỠ MỘT KHUNG (sx, sy, sw, sh trên tấm sprite), thay cho nhuộm cả tờ (trùm lớn: 5 Mpx = 20 MB mỗi màu).
  // Trả về canvas sw×sh: vẽ bằng drawImage(cv, 0, 0, sw, sh, …) cho cùng điểm ảnh như cắt từ tờ đã nhuộm. Tắt bộ nhớ chung (?bonho=0): nhuộm cả tờ như cũ.
  function nhuomKhung(sp, col, sx, sy, sw, sh) {
    const C = sp.doi === 'quai' ? NH_QUAI : NH_KHAC, key = idAnh(sp.img) + '|' + col + '|' + sx + '|' + sy + '|' + sw + '|' + sh;
    let cv = C.get(key);
    if (cv) return cv;
    cv = document.createElement('canvas'); cv.width = sw; cv.height = sh;
    const x = cv.getContext('2d'); x.drawImage(sp.img, sx, sy, sw, sh, 0, 0, sw, sh); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, sw, sh);
    return C.set(key, cv);
  }
  // Dán phần (sx, sy, sw, sh) của tấm sprite đã nhuộm một màu lên bút c tại (dx, dy, dw, dh).
  function veNhuom(c, sp, col, sx, sy, sw, sh, dx, dy, dw, dh) {
    if (boNhoBat()) c.drawImage(nhuomKhung(sp, col, sx, sy, sw, sh), 0, 0, sw, sh, dx, dy, dw, dh);
    else c.drawImage(nhuom(sp, col), sx, sy, sw, sh, dx, dy, dw, dh);
  }
  SC.nhuomKhung = nhuomKhung;
  // Tấm ảnh một màu (chớp trắng, nhuộm băng, độc), nhớ theo màu. (Cả tờ: chỉ còn dùng khi tắt bộ nhớ chung, và cho công cụ.)
  function nhuom(sp, col) {
    let cv = sp.mau[col];
    if (!cv) {
      cv = document.createElement('canvas'); cv.width = sp.img.width; cv.height = sp.img.height;
      const x = cv.getContext('2d'); x.drawImage(sp.img, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, cv.width, cv.height);
      sp.mau[col] = cv;
    }
    return cv;
  }
  SC.nhuom = nhuom;
  // ---------- Đợt 7: nhuộm THÂN theo trạng thái (dính độc / cháy / đóng băng) ----------
  // Khác tấm một màu ở trên: giữ nguyên viền #14182e và các cụm sáng nhỏ (mắt, răng, nanh), chỉ hoà màu vào phần thân còn lại.
  // than: { mau: '#rrggbb', muc: 0..1 (mức hoà), suong: 0..1 (phủ trắng 1/3 trên thân, dùng cho băng) }.
  // Nhớ theo mã + khung + màu + mức hoà: mỗi khung chỉ tính một lần; lúc vẽ dán đúng một tấm, không thêm lệnh vẽ nào.
  // Ảnh không đọc được điểm ảnh (hiếm): trả null, người gọi vẽ thân thường như cũ.
  const VIEN = [0x14, 0x18, 0x2e], SANG = 0xc8; // SANG: mọi kênh màu ≥ mức này thì coi là "sáng" (mắt, răng, nanh của ảnh AI thường ngả kem chứ không trắng tinh)
  function naGiu(sp, d, w, h) { // 1 = giữ nguyên (viền, cụm sáng nhỏ), 0 = được nhuộm
    const giu = new Uint8Array(w * h), n = sp.net || 1, tran = Math.max(6, Math.round(0.015 * sp.rong * sp.cao)) * n * n, nhan = new Uint8Array(w * h), xep = [];
    for (let q = 0, j = 0; q < giu.length; q++, j += 4) {
      if (!d[j + 3]) continue;
      if (Math.abs(d[j] - VIEN[0]) <= 6 && Math.abs(d[j + 1] - VIEN[1]) <= 6 && Math.abs(d[j + 2] - VIEN[2]) <= 6) giu[q] = 1;
      else if (d[j] >= SANG && d[j + 1] >= SANG && d[j + 2] >= SANG) nhan[q] = 1; // sáng, chưa biết cụm to hay nhỏ
    }
    for (let q0 = 0; q0 < nhan.length; q0++) { // gom cụm sáng liền nhau; cụm nhỏ (mắt, răng) thì giữ, mảng sáng to (bụng trắng, thân băng) vẫn nhuộm
      if (nhan[q0] !== 1) continue;
      xep.length = 0; xep.push(q0); nhan[q0] = 2;
      for (let k = 0; k < xep.length; k++) {
        const q = xep[k], x = q % w;
        if (x > 0 && nhan[q - 1] === 1) { nhan[q - 1] = 2; xep.push(q - 1); }
        if (x < w - 1 && nhan[q + 1] === 1) { nhan[q + 1] = 2; xep.push(q + 1); }
        if (q >= w && nhan[q - w] === 1) { nhan[q - w] = 2; xep.push(q - w); }
        if (q + w < nhan.length && nhan[q + w] === 1) { nhan[q + w] = 2; xep.push(q + w); }
      }
      if (xep.length <= tran) for (let k = 0; k < xep.length; k++) giu[xep[k]] = 1;
    }
    return giu;
  }
  function khungThan(sp, hang, i, than) {
    if (sp.thanHong || !than || !(than.muc > 0)) return null;
    const muc = Math.round(clamp(than.muc, 0, 1) * 20), su = Math.round(clamp(than.suong || 0, 0, 1) * 20), key = hang + '|' + i + '|' + than.mau + '|' + muc + '|' + su, chung = boNhoBat(), kho = chung ? null : sp.than || (sp.than = {});
    const kc = chung ? idAnh(sp.img) + '|' + key : null; // V2: bộ nhớ chung (nhóm quái, xoá khi về làng), khoá theo ảnh
    let cv = chung ? THAN_NHO.get(kc) : kho[key];
    if (cv) return cv;
    try {
      const n = sp.net || 1, w = sp.fw * n, h = sp.fh * n, R = parseInt(than.mau.slice(1, 3), 16), Gm = parseInt(than.mau.slice(3, 5), 16), B = parseInt(than.mau.slice(5, 7), 16), k = muc / 20, ks = su / 20;
      cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(sp.img, i * w, hang * h, w, h, 0, 0, w, h);
      const im = x.getImageData(0, 0, w, h), d = im.data, kg = sp.giu || (sp.giu = {}), giu = kg[hang + '|' + i] || (kg[hang + '|' + i] = naGiu(sp, d, w, h));
      let y0 = h, y1 = -1; // hộp thân của khung này, để phủ sương 1/3 trên
      if (ks > 0) for (let y = 0; y < h; y++) for (let q = y * w * 4 + 3, e = q + w * 4; q < e; q += 4) if (d[q]) { if (y < y0) y0 = y; y1 = y; break; }
      const qs = ks > 0 && y1 >= y0 ? Math.round(y0 + (y1 - y0 + 1) / 3) * w : -1; // điểm ảnh trước mốc này thuộc 1/3 trên thân
      for (let q = 0, j = 0; q < giu.length; q++, j += 4) {
        if (!d[j + 3] || giu[q]) continue;
        let r = d[j] + (R - d[j]) * k, g = d[j + 1] + (Gm - d[j + 1]) * k, b = d[j + 2] + (B - d[j + 2]) * k;
        if (q < qs) { r += (255 - r) * ks; g += (255 - g) * ks; b += (255 - b) * ks; }
        d[j] = Math.round(r); d[j + 1] = Math.round(g); d[j + 2] = Math.round(b);
      }
      x.putImageData(im, 0, 0);
      if (chung) THAN_NHO.set(kc, cv); else kho[key] = cv;
      return cv;
    } catch (e) { sp.thanHong = true; return null; }
  }
  SC.khungThan = khungThan;
  // Dáng thân của quái (khung đứng thở đầu tiên), tính theo px game so với điểm neo chân, hình quay sang PHẢI (x âm = phía lưng):
  // { x0, x1, y0, y1 (hộp thân), w, h, tren[cột] (y điểm ảnh trên cùng của cột), sau[hàng] (x điểm ảnh ngoài cùng phía lưng), cx0 (cột 0 ứng với x nào), chan: [x trái, x phải] của phần chân }
  // Dùng để đặt hạt trạng thái bám đúng lưng, vai, chân. Không đọc được ảnh: null.
  SC.dangQuai = function (sp) {
    if (sp.dang !== undefined) return sp.dang;
    sp.dang = null;
    try {
      const n = sp.net || 1, w = sp.fw * n, h = sp.fh * n, a = sp.dt.idle, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(sp.img, 0, a.hang * h, w, h, 0, 0, w, h);
      const d = x.getImageData(0, 0, w, h).data, fw = sp.fw, fh = sp.fh, ax = sp.lat ? fw - sp.ax : sp.ax, tren = new Int16Array(fw).fill(32767), sau = new Int16Array(fh).fill(32767), truoc = new Int16Array(fh).fill(-32767);
      let x0 = 32767, x1 = -32767, y0 = 32767, y1 = -32767;
      for (let Y = 0; Y < h; Y++) for (let X = 0; X < w; X++) {
        if (d[(Y * w + X) * 4 + 3] < 128) continue;
        const gy = Math.floor(Y / n), gx0 = Math.floor(X / n), gx = sp.lat ? fw - 1 - gx0 : gx0, rx = gx - ax, ry = gy - sp.ay;
        if (ry < tren[gx]) tren[gx] = ry;
        if (rx < sau[gy]) sau[gy] = rx;
        if (rx > truoc[gy]) truoc[gy] = rx;
        if (rx < x0) x0 = rx; if (rx > x1) x1 = rx; if (ry < y0) y0 = ry; if (ry > y1) y1 = ry;
      }
      if (x1 < x0) return null;
      const H = y1 - y0 + 1; let c0 = 32767, c1 = -32767;
      for (let gy = 0; gy < fh; gy++) { const ry = gy - sp.ay; if (ry >= y1 - Math.max(1, Math.round(H * 0.15)) && ry <= y1 && sau[gy] < 32767) { c0 = Math.min(c0, sau[gy]); c1 = Math.max(c1, truoc[gy]); } }
      sp.dang = { x0, x1: x1 + 1, y0, y1: y1 + 1, w: x1 - x0 + 1, h: H, tren, sau, cx0: -ax, cy0: -sp.ay, chan: [c0, c1 + 1] };
    } catch (e) { sp.dang = null; }
    return sp.dang;
  };
  // 17/10 do-net (docs/review/ke-hoach-cai-thien/do-net/bao-cao.md): thu nhỏ sẵn một vùng ảnh về đúng cỡ vẽ khi game vẽ ảnh NHỎ hơn ảnh
  // (vũ khí Cu Tí, phi tiêu, trùm thu nhỏ như Hồ Tinh pha 3 ×0,72). rho = điểm ảnh thật / điểm ảnh nguồn (< 1). Mỗi điểm mới: đục nếu ≥ nửa ô
  // nguồn đục, màu = màu CÓ THẬT trong ô gần màu trung bình nhất (như do-net/cong-cu/thu_net.py) → không pha màu, không bỏ điểm ảnh như phép
  // thu "lấy điểm gần nhất" của trình duyệt (lởm chởm, nhấp nháy). Nhớ lại theo ảnh + vùng + cỡ. null: không cần / ?netcu=1.
  const NHO_ANH = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  SC.nhoAnh = function (img, x, y, w, h, rho) {
    if (G.NET_CU || !NHO_ANH || !(rho > 0) || rho > 0.95 || typeof document === 'undefined' || !img) return null;
    rho = Math.max(0.05, Math.round(rho * 50) / 50);
    let m = NHO_ANH.get(img); if (!m) NHO_ANH.set(img, (m = new Map()));
    const key = x + ',' + y + ',' + w + ',' + h + ',' + rho;
    if (m.has(key)) return m.get(key);
    if (m.size >= 240) return null; // cỡ vẽ đổi liên tục (phóng to/nhỏ dần): thôi thu sẵn, vẽ như cũ — không phình bộ nhớ
    let out = null;
    try {
      const W = Math.max(1, Math.round(w * rho)), H = Math.max(1, Math.round(h * rho)), sxs = w / W, sys = h / H;
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(img, x, y, w, h, 0, 0, w, h);
      const d = g.getImageData(0, 0, w, h).data;
      const o = document.createElement('canvas'); o.width = W; o.height = H;
      const og = o.getContext('2d'), od = og.createImageData(W, H), p = od.data;
      for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) {
        const xa = X * sxs, xb = xa + sxs, ya = Y * sys, yb = ya + sys;
        let r = 0, gg = 0, b = 0, ww = 0, tong = 0, al = 0;
        for (let yy = Math.floor(ya); yy < Math.ceil(yb) && yy < h; yy++) for (let xx = Math.floor(xa); xx < Math.ceil(xb) && xx < w; xx++) {
          const wt = (Math.min(xb, xx + 1) - Math.max(xa, xx)) * (Math.min(yb, yy + 1) - Math.max(ya, yy)), i = (yy * w + xx) * 4;
          tong += wt; al += wt * d[i + 3] / 255;
          if (d[i + 3] >= 128) { r += d[i] * wt; gg += d[i + 1] * wt; b += d[i + 2] * wt; ww += wt; }
        }
        if (!(ww > 0) || al / tong < 0.5) continue;
        r /= ww; gg /= ww; b /= ww;
        let best = -1, bd = 1e12;
        for (let yy = Math.floor(ya); yy < Math.ceil(yb) && yy < h; yy++) for (let xx = Math.floor(xa); xx < Math.ceil(xb) && xx < w; xx++) {
          const i = (yy * w + xx) * 4; if (d[i + 3] < 128) continue;
          const e = (d[i] - r) * (d[i] - r) + (d[i + 1] - gg) * (d[i + 1] - gg) + (d[i + 2] - b) * (d[i + 2] - b);
          if (e < bd) { bd = e; best = i; }
        }
        const k = (Y * W + X) * 4; p[k] = d[best]; p[k + 1] = d[best + 1]; p[k + 2] = d[best + 2]; p[k + 3] = 255;
      }
      og.putImageData(od, 0, 0);
      out = o;
    } catch (e) { out = null; }
    m.set(key, out);
    return out;
  };

  // Vẽ một khung tại gốc toạ độ hiện tại (gốc = điểm giữa chân). face < 0: lật sang trái (hình gốc quay sang phải).
  // o: { alpha, flash (0..1 chớp trắng), tint: [màu, độ đậm], dy, than: { mau, muc, suong } (nhuộm thân theo trạng thái, Đợt 7) }
  SC.veKhung = function (c, sp, ten, i, face, o) {
    o = o || {};
    let phu = 0; // 15/10 con-ve-tay: khung trắng toàn thân → khung kề + phủ trắng nhẹ (xem KHUNG_TRANG)
    if (G.KHUNG_TRANG_SUA !== false && KHUNG_TRANG[sp.ma] && sp.dt[ten] && !(sp.boVa && sp.boVa.indexOf('khung_trang') >= 0)) { const t0 = KHUNG_TRANG[sp.ma][ten], j = t0 ? t0[i] : undefined; if (j != null && j < sp.dt[ten].so) { i = j; phu = PHU_TRANG; } }
    const a = sp.dt[ten] || sp.dt.idle, n = sp.net || 1, sx = i * sp.fw * n, sy = a.hang * sp.fh * n, sw = sp.fw * n, sh = sp.fh * n, ga = c.globalAlpha;
    c.save();
    c.imageSmoothingEnabled = false;
    if ((face < 0) !== !!sp.lat) c.scale(-1, 1);
    const ct = sp.ct ? sp.ct[a === sp.dt[ten] ? ten : 'idle'] : null; // 14/10: căn tâm từng khung (xem "can_tam")
    const dx = -sp.ax + (ct && ct[i] ? ct[i] : 0), dy = -sp.ay + (o.dy || 0);
    if (o.alpha != null) c.globalAlpha = ga * clamp(o.alpha, 0, 1);
    const a1 = c.globalAlpha;
    const th = o.than ? khungThan(sp, a.hang, i, o.than) : null; // Đợt 7: thân đã nhuộm theo trạng thái (giữ viền, mắt), không có thì vẽ thân thường
    const vien = o.chopNhe > 0 ? clamp(o.chopNhe, 0, 1) : 0;
    if (vien) { // 15/10 con-ve-tay: viền sáng mảnh (bóng trắng dời 1 điểm ảnh bốn phía, vẽ DƯỚI thân) thay cho phủ trắng cả thân
      c.globalAlpha = a1 * 0.85 * vien;
      for (let k = 0; k < 4; k++) veNhuom(c, sp, '#fff6e0', sx, sy, sw, sh, dx + (k === 0 ? -1 : k === 1 ? 1 : 0), dy + (k === 2 ? -1 : k === 3 ? 1 : 0), sp.fw, sp.fh);
      c.globalAlpha = a1;
    }
    let nho = null;
    if (!th && !G.NET_CU) { try { const T = c.getTransform(), rho = Math.hypot(T.a, T.b) * sp.fw / sw; if (rho < 0.95) nho = SC.nhoAnh(sp.img, sx, sy, sw, sh, rho); } catch (e) { nho = null; } }
    if (th) c.drawImage(th, 0, 0, sw, sh, dx, dy, sp.fw, sp.fh);
    else if (nho) c.drawImage(nho, 0, 0, nho.width, nho.height, dx, dy, sp.fw, sp.fh); // do-net: trùm thu nhỏ (Hồ Tinh pha 3)
    else c.drawImage(sp.img, sx, sy, sw, sh, dx, dy, sp.fw, sp.fh);
    if (phu > 0) { c.globalAlpha = a1 * phu; veNhuom(c, sp, '#ffffff', sx, sy, sw, sh, dx, dy, sp.fw, sp.fh); }
    if (o.tint && o.tint[1] > 0) { c.globalAlpha = a1 * clamp(o.tint[1], 0, 1); veNhuom(c, sp, o.tint[0], sx, sy, sw, sh, dx, dy, sp.fw, sp.fh); }
    if (vien) { c.globalAlpha = a1 * 0.3 * vien; veNhuom(c, sp, '#ff4a3a', sx, sy, sw, sh, dx, dy, sp.fw, sp.fh); } // đỏ nhẹ
    if (o.flash > 0) { c.globalAlpha = a1 * clamp(o.flash, 0, 1); veNhuom(c, sp, '#ffffff', sx, sy, sw, sh, dx, dy, sp.fw, sp.fh); }
    c.restore();
  };

  // ---------- QUÁI ----------
  // Đổi tên cử động của game sang động tác của tấm sprite. D: thời lượng cử động trong game (giây).
  SC.chonQuai = function (sp, n, t, D) {
    const dt = sp.dt, mot = (ten, u) => { const a = dt[ten] || dt.idle; return { ten: dt[ten] ? ten : 'idle', i: dt[ten] ? khungMot(a, u) : khungLap(a, t), u }; };
    const lap = (ten, tt) => { const a = dt[ten] || dt.idle; return { ten: dt[ten] ? ten : 'idle', i: khungLap(a, tt == null ? t : tt), u: 0 }; };
    D = D > 0 ? D : (dt[n] && dt[n].giay) || 0.6;
    const u = clamp(t / D, 0, 1);
    if (n === 'idle' || n === 'intro') return lap('idle');
    if (n === 'move') return lap('move');
    if (n === 'tele' || n === 'phase2' || n === 'phase3') return mot('tele', u);
    if (n === 'atk') {
      const a = dt.atk; // "lap_tu": hết một lượt (t >= D) thì lặp các cột lap_tu..so-1, mỗi cột D / so giây (Nhím lăn theo vạch tới khi dừng)
      if (a && a.lapTu != null && t >= D) { const m = a.lapDen - a.lapTu + 1; return { ten: 'atk', i: a.lapTu + (Math.floor((t - D) / (D / a.so) + 1e-6) % m), u: 1 }; }
      return mot('atk', u);
    }
    // 15/10 quai-moi-bien: hai cử động riêng chỉ có ở tấm vẽ lại (code chỉ gọi khi tấm có, xem js/ky_nang_quai.js ocRut, js/chieu_trum.js caNocLan):
    //  - 'lan' (Cá Nóc Chúa Phồng lăn; quai-moi-lau: Hũ Lửa Sống lăn tới): lặp các cột lap_tu..lap_den của hàng đánh (khung lăn tròn), mỗi cột giay / so giây, suốt lúc lăn.
    //  - 'vo' (Ốc Mượn Hồn trong vỏ): chạy hàng báo đòn (rút vào vỏ) trong 0,3 giây rồi GIỮ khung cuối (vỏ rỗng) suốt lúc trong vỏ.
    if (n === 'lan') { const a = dt.atk; if (!a || a.lapTu == null) return lap('idle'); return { ten: 'atk', i: a.lapTu + (Math.floor(t / (a.giay / a.so) + 1e-6) % (a.lapDen - a.lapTu + 1)), u: 1 }; }
    if (n === 'vo') { const a = dt.tele; if (!a) return mot('hit', u); return { ten: 'tele', i: Math.min(a.so - 1, Math.floor((Math.max(0, t) / 0.3) * a.so)), u: 1 }; }
    if (n === 'hit') return mot('hit', u);
    if (n === 'stun') { const r = mot('hit', 0.35 + 0.15 * Math.sin(t * 9)); r.u = 1; return r; }
    if (n === 'die') { const r = mot('die', u); r.alpha = 1 - seg(u, dt.die && dt.die.mo != null ? dt.die.mo : 0.6, 1); return r; }
    if (n === 'spawn') { const r = lap('idle'); const k = seg(u, 0.1, 0.75); r.alpha = k; r.dy = Math.round((1 - k) * 6); return r; }
    if (/^chieu|^c\d$/.test(n)) return u < 0.4 ? mot('tele', u / 0.4) : mot('atk', (u - 0.4) / 0.6);
    return lap('idle');
  };
  // 14/10 trum-chet-pha3: nhịp khung ĐỀU cho trùm vùng (js/boss.js truyền o.nhip = { moc }). Cách cũ (chonQuai) kéo giãn
  // cả hàng theo độ dài cử động của monster_art.js: chiêu 2,2–2,6 giây → hàng đánh 4 khung chỉ ~3 khung/giây, chuyển pha 8 khung trong 2,4 giây,
  // gục 6 khung trong 3,4 giây (một khung đứng gần 0,6 giây rồi nhảy). Nay mọi hàng chạy ~12 khung/giây theo đồng hồ của cử động:
  //  - chiêu: báo trước (tele) tới đúng mốc ra đòn moc[0] (khung cuối đúng lúc đòn nổ; báo trước dài thì đưa đi đưa lại 3 khung cuối),
  //    rồi hàng đánh một lượt, đưa đi đưa lại 3 khung cuối tới hết phần ra đòn moc[1], sau đó về đứng thở;
  //  - chuyển pha: hàng báo trước một lượt rồi đưa đi đưa lại 3 khung cuối (nửa sau lấy tệp dáng pha mới như cũ);
  //  - gục: quằn quại (hàng trúng đòn qua lại, 10 khung/giây), rồi hàng gục 10 khung/giây kết thúc đúng lúc bắt đầu mờ, giữ khung cuối khi mờ dần.
  const NHIP = 12;
  function quaLai(a, tt, k, fps) { // đưa đi đưa lại k khung cuối của hàng a (k >= 2) theo thời gian tt
    const so = a.so, n = Math.min(k, so); if (n < 2) return so - 1;
    const p = Math.floor(Math.max(0, tt) * (fps || NHIP)) % (2 * n - 2), j = p < n ? p : 2 * n - 2 - p;
    return so - n + j;
  }
  SC.quaLai = quaLai;
  // 15/10 soat-muot Phiên 1 — các cột thật sự phát của một hàng (theo "khung" nếu có bảng bỏ khung trùng), theo thứ tự.
  function cotHang(a) { if (a.bang && G.KHUNG_TRUNG) return a.bang.map((b) => b.i); const r = []; for (let i = 0; i < a.so; i++) r.push(i); return r; }
  // Mục 6A (cờ ?baodeu=0, G.BAO_DEU ở js/mobs.js): báo đòn của quái thường trước đây trải 6 khung đúng bằng thời gian báo (1 giây → 6 khung/giây,
  // 0,8 giây → 7,5). Nay như trùm vùng: hàng báo chạy ~12 khung/giây một lượt, rồi đưa đi đưa lại 3 khung cuối, nhịp chỉnh nhẹ để đúng lúc ra đòn
  // (tt = T) đang ở khung cuối. Báo ngắn (không đủ một lượt ở ~12 khung/giây) thì vẫn một lượt trải đều như cũ. tt: giây từ lúc báo, T: tổng thời gian báo.
  function baoDeu(a, tt, T) {
    const L = cotHang(a), n = L.length;
    if (n < 2 || !(T > 0)) return khungMot(a, T > 0 ? tt / T : 1);
    if (T <= (n / NHIP) * 1.35) return khungMot(a, tt / T);
    const m = Math.min(3, n), dau = n - m, tDau = dau / NHIP;
    if (tt < tDau) return L[Math.min(n - 1, Math.floor(tt * NHIP))];
    const tCuoi = T - tDau, chuKy = 2 * m - 2, vong = Math.max(0, Math.round((tCuoi * NHIP - (m - 0.5)) / chuKy)), fps = (m - 0.5 + chuKy * vong) / Math.max(0.05, tCuoi);
    const p = Math.floor(Math.max(0, Math.min(tt, T * 0.999) - tDau) * fps) % chuKy, j = p < m ? p : chuKy - p;
    return L[dau + j];
  }
  SC.baoDeu = baoDeu;
  // Mục 10A (cờ ?xihoi=0, G.XI_HOI ở js/mobs.js): khung "xì hơi / thu gai" = hàng báo đòn phát NGƯỢC (u 0 → 1: từ khung cuối về khung đầu).
  function xiHoi(a, u) { const L = cotHang(a), n = L.length; return L[n - 1 - Math.min(n - 1, Math.floor(clamp(u, 0, 1) * n))]; }
  SC.xiHoi = xiHoi;
  SC.chonTrum = function (sp, n, t, D, moc) {
    const dt = sp.dt, co = (x) => !!dt[x];
    D = D > 0 ? D : (dt[n] && dt[n].giay) || 0.6;
    const u = clamp(t / D, 0, 1), r = (ten, i, o) => Object.assign({ ten, i, u }, o || {});
    if (/^chieu|^c\d$/.test(n)) {
      const m0 = moc && moc[0] > 0 ? moc[0] : 0.4, m1 = moc && moc[1] > m0 ? moc[1] : Math.min(1, m0 + 0.35);
      const Tw = m0 * D, T1 = m1 * D, te = co('tele') ? dt.tele : dt.idle, tk = co('tele') ? 'tele' : 'idle';
      if (t < Tw) {
        const nt = te.so, can = nt / NHIP; // thời gian một lượt hàng báo trước ở nhịp đều
        if (Tw <= can * 1.35) return r(tk, Math.min(nt - 1, Math.floor((t / Tw) * nt))); // báo trước ngắn: một lượt, nhanh hơn chút
        const dau = Math.max(0, nt - 3), tDau = dau / NHIP, tCuoi = Tw - tDau; // các khung đầu một lượt, 3 khung cuối đưa qua lại tới lúc ra đòn
        if (t < tDau) return r(tk, Math.floor(t * NHIP));
        // nhịp của đoạn qua lại chỉnh nhẹ quanh 12 khung/giây cho số vòng tròn: đúng mốc ra đòn đang ở khung cuối (p = 2 của chu kỳ 4)
        const vong = Math.max(0, Math.round((tCuoi * NHIP - 2.5) / 4)), fps = (2.5 + 4 * vong) / Math.max(0.05, tCuoi);
        return r(tk, quaLai(te, t - tDau, 3, fps));
      }
      const ak = co('atk') ? 'atk' : 'idle', at = dt[ak], ta = t - Tw;
      if (ta < at.so / NHIP) return r(ak, Math.min(at.so - 1, Math.floor(ta * NHIP)));
      if (t < T1) return r(ak, quaLai(at, ta - at.so / NHIP + 0.3, 3, 10)); // +0,3 giây: bắt đầu ở khung áp cuối (nối liền khung cuối vừa phát)
      return r('idle', khungLap(dt.idle, t - T1));
    }
    if (n === 'phase2' || n === 'phase3') {
      const te = co('tele') ? dt.tele : dt.idle, tk = co('tele') ? 'tele' : 'idle';
      if (t < te.so / NHIP) return r(tk, Math.floor(t * NHIP));
      return r(tk, quaLai(te, t - te.so / NHIP + 3 / NHIP, 3));
    }
    if (n === 'die') {
      const mo = dt.die && dt.die.mo != null ? dt.die.mo : 0.6, alpha = 1 - seg(u, mo, 1);
      if (!co('die')) return r('hit', co('hit') ? quaLai(dt.hit, t, dt.hit.so, 10) : 0, { alpha });
      const tg = dt.die.so / 10, t0 = Math.max(0, mo * D - tg); // hàng gục 10 khung/giây, xong đúng lúc bắt đầu mờ
      if (t < t0 && co('hit')) return r('hit', quaLai(dt.hit, t, dt.hit.so, 10), { alpha });
      return r('die', Math.min(dt.die.so - 1, Math.floor((t - t0) * 10)), { alpha });
    }
    return SC.chonQuai(sp, n, t, D);
  };
  // Phiên E2: tệp dáng pha của trùm vùng. sp: tệp pha 1; pha: 2 hoặc 3; ten: hàng sắp vẽ. Trả về tệp pha nếu đã nạp xong và có hàng đó, không thì null (vẽ pha 1).
  SC.phaTrum = function (sp, pha, ten) {
    if (!sp || pha < 2 || !PHA_HANG[ten]) return null;
    const p = SC.ds[sp.ma + '-p' + pha];
    if (p && !p.ready && roiCan) roiCan(p.ma); // phiên kiểm 3 pha trùm: bản ảnh rời, trùm đã sang pha mà dáng pha chưa về → tải ngay (ưu tiên cao nhất)
    return p && p.ready && p.dt[ten] ? p : null;
  };
  // Vẽ quái tự vẽ tại (x, y) với tuỳ chọn giống G.monsterArt.draw. bong: có vẽ bóng dưới chân không. D: thời lượng cử động trong game.
  SC.veQuai = function (c, sp, x, y, o, bong, D) {
    o = o || {};
    const n = o.anim || 'idle', t = Math.max(0, o.t || 0);
    let face = o.face || 0;
    if (!face) { const dir = o.dir == null ? Math.PI : o.dir; face = Math.cos(dir) > 0.01 ? 1 : -1; }
    const nhip = o.nhip || null; // 14/10: trùm vùng chạy nhịp khung đều (SC.chonTrum)
    // 15/10 soat-muot Phiên 1: o.xiHoi { u } (mục 10A) / o.baoDeu { tt, T } (mục 6A) do js/mobs.js truyền cho quái thường có ảnh AI.
    const xh = !nhip && o.xiHoi ? o.xiHoi : null, bd = !nhip && !xh && n === 'tele' && o.baoDeu ? o.baoDeu : null;
    const chon = (q) => {
      if (nhip) return SC.chonTrum(q, n, t, D, nhip.moc);
      const ve = xh && q.dt.atk && q.dt.atk.ve; // soát mượt P2: ảnh có khung duỗi về đứng → dùng khung đó thay hàng báo đòn phát ngược
      if (ve) return { ten: 'atk', i: ve[Math.min(ve.length - 1, Math.floor(clamp(xh.u, 0, 1) * ve.length))], u: 1 };
      if (xh && q.dt.tele) return { ten: 'tele', i: xiHoi(q.dt.tele, xh.u), u: 1 };
      if (bd && q.dt.tele) return { ten: 'tele', i: baoDeu(q.dt.tele, bd.tt, bd.T), u: clamp(bd.T > 0 ? bd.tt / bd.T : 1, 0, 1) };
      return SC.chonQuai(q, n, t, D);
    };
    let s = chon(sp);
    // Phiên E2: trùm vùng ở pha 2, 3 có tệp dáng pha thì các hàng có trong tệp đó (idle / tele / atk / hit) lấy từ tệp đó (xem SC.phaTrum). Cảnh chuyển pha: nửa đầu còn dáng cũ, như hình vẽ bằng code.
    let pha = o.phase | 0;
    if (pha >= 2 && (n === 'phase2' || n === 'phase3') && s.u < 0.5) pha--;
    const sp2 = pha >= 2 ? SC.phaTrum(sp, pha, s.ten) : null;
    let ve = sp; // tệp thật sự dùng để vẽ thân (bóng dưới chân vẫn theo tệp pha 1)
    if (sp2) { const s2 = chon(sp2); if (s2.ten === s.ten) { s = s2; ve = sp2; } }
    else if (pha >= 2 && G.PHA_TRUM_DU && (s.ten === 'move' || s.ten === 'die')) {
      // Phiên Kiểm 3 pha (12/10): tệp dáng pha chỉ có 4 hàng (idle / tele / atk / hit). Trước đây lúc trùm ĐI (move) hay GỤC (die) thì mượn
      // hàng của tệp pha 1, nên trùm đi lại giữa các chiêu lại hiện về hình pha 1 — chủ dự án chơi chỉ thấy "1 pha". Nay: đi thì dùng hàng
      // đứng thở của tệp pha (thân vẫn trôi theo bước đi), gục thì dùng hàng trúng đòn của tệp pha rồi mờ dần như hàng gục. Tắt: ?phatrum=0.
      const pf = SC.phaTrum(sp, pha, s.ten === 'move' ? 'idle' : 'hit');
      if (pf) {
        if (s.ten === 'move') s = { ten: 'idle', i: khungLap(pf.dt.idle, t), u: 0 };
        else if (nhip) s = { ten: 'hit', i: quaLai(pf.dt.hit, t, pf.dt.hit.so, 10), u: s.u, alpha: s.alpha, dy: s.dy }; // 14/10: tệp pha chưa có hàng gục: quằn quại đều nhịp rồi mờ. 15/10: 6 tấm pha 2/3 của Mộc/Ngư/Hồ Tinh đã có hàng die (SC.phaTrum lấy thẳng, không vào nhánh này); nhánh còn cho tệp pha thiếu die (trùm nhỏ -p2)
        else s = { ten: 'hit', i: khungMot(pf.dt.hit, Math.min(1, (s.u || 0) * 1.6)), u: s.u, alpha: s.alpha, dy: s.dy };
        ve = pf;
      }
    }
    let flash = o.hit || 0;
    // mục 24 (soát mượt Phiên 2, ?chopmo=0): chớp nhẹ trúng đòn mờ dần theo bình phương trong 0,07 giây (js/fx.js G.fx.chopMo), không bật/tắt cứng
    if (flash > 0 && G.fx && G.fx.chopMo) flash *= G.fx.chopMo(); // (G.CHOP_NHE / ?chopcu=1 đã bỏ 15/10)
    if (s.ten === 'hit' && n === 'hit' && s.u < 0.3) flash = Math.max(flash, 0.75); // chớp trắng đầu cú trúng đòn
    const chopNhe = flash; flash = 0; // 15/10 con-ve-tay: trúng đòn → viền sáng + đỏ nhẹ, không phủ trắng cả thân
    if (o.baoDon > 0) flash = Math.max(flash, o.baoDon); // Phiên E2: chớp trắng báo sắp ra đòn (js/boss.js truyền cho trùm vùng có ảnh AI); chỉ là hình
    c.save();
    const lt = G.lamTron || Math.round; // soát mượt phiên 3 mục 1: cùng kiểu làm tròn với camera (?noisuy=0 như cũ)
    c.translate(lt(x), lt(y));
    if (bong && G.bongAnh && G.bongAnh(c, 0, 0, sp.bong * (n === 'die' ? 1 - 0.5 * (s.u || 0) : 1) / 2, s.alpha == null ? 1 : s.alpha)) { /* 16/10 vẽ tay 6: ảnh bóng */ }
    else if (bong) {
      const w = sp.bong * (n === 'die' ? 1 - 0.5 * (s.u || 0) : 1);
      c.save();
      c.globalAlpha *= 0.28 * (s.alpha == null ? 1 : s.alpha);
      if (G.art && G.art.ellipse) G.art.ellipse(c, 0, 0, w / 2, Math.max(1.5, w * 0.14), '#000000');
      else { c.fillStyle = '#000'; c.beginPath(); c.ellipse(0, 0, w / 2, Math.max(1.5, w * 0.14), 0, 0, Math.PI * 2); c.fill(); }
      c.restore();
    }
    // o.than (Đợt 7): màu nhuộm thân khi quái dính độc / cháy / đóng băng, do js/mobs.js truyền khi cờ G.TRANG_THAI_TREN_THAN bật. Không có thì vẽ y cũ.
    SC.veKhung(c, ve, s.ten, s.i, face, { alpha: s.alpha, flash, chopNhe, dy: s.dy, than: o.than || null, tint: o.nhuomMa || null }); // o.nhuomMa: phân thân (bóng ma) nhuộm màu
    c.restore();
    return s;
  };

  // Bút giả: chuyển mọi lệnh vẽ sang bút thật, riêng drawImage thì hỏi hàm thay.
  function butGia(c, thay) {
    const nho = new Map();
    return new Proxy(c, {
      get(o, k) {
        if (k === 'drawImage') return thay;
        if (k === '__that') return o; // bút thật (hiệu ứng ảnh vẽ trong cử động của monster_art.js không bị bút giả nuốt)
        const v = o[k];
        if (typeof v !== 'function') return v;
        let f = nho.get(k);
        // 16/10 vẽ tay 9: nhớ theo CHÍNH hàm gốc. Bút thật có thể được G.ganChan (js/fx_anh.js) bọc SAU lần mượn đầu (làng / màn chào vẽ
        // trước trận) — nhớ bản cũ thì lệnh tô code của trùm lọt qua chặn. Hàm gốc đổi → buộc lại.
        if (!f || (f.__goc !== v && G.TRUM9 !== false)) { // ?trum9=0: nhớ hàm như cũ
          f = v.bind(o); f.__goc = v; nho.set(k, f); }
        return f;
      },
      set(o, k, v) { o[k] = v; return true; },
    });
  }
  SC.butGia = butGia;
  // Phiên hiệu năng (V1): bút giả DÙNG LẠI — mỗi bút thật giữ sẵn vài bút giả (Proxy tạo một lần), mượn rồi trả sau mỗi lần vẽ,
  // thay cho tạo Proxy + Map mới mỗi khung. Mượn lồng nhau (vẽ trong lúc đang vẽ) thì lấy bút giả khác còn rảnh.
  const BUT = new WeakMap();
  function muonBut(c, thay) {
    let ds = BUT.get(c);
    if (!ds) { ds = []; BUT.set(c, ds); }
    for (const b of ds) if (!b.ban) { b.ban = true; b.thay = thay; return b; }
    const b = { ban: true, thay, p: null }, nho = new Map();
    b.p = new Proxy(c, {
      get(o, k) {
        if (k === 'drawImage') return b.thay;
        if (k === '__that') return o; // bút thật (xem butGia)
        const v = o[k];
        if (typeof v !== 'function') return v;
        let f = nho.get(k);
        // 16/10 vẽ tay 9: nhớ theo CHÍNH hàm gốc. Bút thật có thể được G.ganChan (js/fx_anh.js) bọc SAU lần mượn đầu (làng / màn chào vẽ
        // trước trận) — nhớ bản cũ thì lệnh tô code của trùm lọt qua chặn. Hàm gốc đổi → buộc lại.
        if (!f || (f.__goc !== v && G.TRUM9 !== false)) { // ?trum9=0: nhớ hàm như cũ
          f = v.bind(o); f.__goc = v; nho.set(k, f); }
        return f;
      },
      set(o, k, v) { o[k] = v; return true; },
    });
    ds.push(b);
    return b;
  }
  function traBut(b) { b.ban = false; b.thay = null; }
  SC.muonBut = muonBut; SC.traBut = traBut;
  // Cờ tắt V1: G.BO_THAN = false hoặc ?bothan=0 → như cũ (dựng thân bằng code rồi bỏ đi, bút giả mới mỗi lần vẽ).
  if (G.BO_THAN === undefined) {
    let tat = false;
    try { tat = typeof location !== 'undefined' && /[?&]bothan=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; }
    G.BO_THAN = !tat;
  }

  let MA = null, draw0 = null, dur0 = null;
  function themVaoDanhSach(sp) {
    if (!MA || (MA._defs && MA._defs[sp.ma])) return;
    if (MA.list.some((m) => m.id === sp.ma)) return;
    MA.list.push({ id: sp.ma, ten: sp.ten, vung: sp.vung, loai: 'thuong', w: sp.rong, h: sp.cao, pha: 1, bay: false, tuVe: true,
      anims: Object.keys(sp.dt).map((k) => ({ id: k, ten: k, d: sp.dt[k].giay, lap: !!sp.dt[k].lap, moc: null })) });
  }
  function noiQuai() {
    MA = G.monsterArt;
    if (!MA || MA._spriteCustom) return;
    if (!SC.noi) return;
    MA._spriteCustom = true;
    draw0 = MA.draw; dur0 = MA.dur;
    MA.draw = function (c, id, x, y, o) {
      const sp = SC.ds[id];
      // 16/10 con-ve-tay-5: ảnh chưa tải / chưa có (quái vùng 4 Sông sâu) → thân code vẫn hiện vì thân dán bằng drawImage từ khung dựng sẵn
      // (không bị chặn); bóng, vệt, hạt vẽ code quanh thân thì bị chặn như mọi chỗ khác.
      if (!sp || !sp.ready) { if (sp && roiCan) roiCan(id); return draw0.call(MA, c, id, x, y, o); }
      o = o || {};
      const def = MA._defs && MA._defs[id];
      if (!def) { SC.veQuai(c, sp, x, y, o, true, 0); return; }
      // Quái có sẵn: để hình gốc vẽ bóng và hiệu ứng (vệt chém, tia lửa...), chỉ thay phần thân bằng hình tự vẽ.
      const T0 = c.getTransform(), a0 = c.globalAlpha, D = dur0.call(MA, id, o.anim) || 0;
      let xong = false;
      const thay = function (k0, mx, my, ma, mau) {
        // 14/10: phân thân Hồ Tinh pha 2 (monster_art.js gọi c.drawImage('bongMa', dx, dy, độ đậm, màu)): vẽ CHÍNH ảnh trùm đúng khung động tác,
        // dời (dx, dy), trong suốt và nhuộm màu. Trước đây lệnh này bị coi là thân nên bản sao không bao giờ hiện (vô hình).
        if (k0 === 'bongMa') {
          if (G.PHAN_THAN_ANH === false) return;
          c.save(); c.setTransform(T0); c.globalAlpha = a0 * clamp(+ma || 0.5, 0, 1);
          try { SC.veQuai(c, sp, x + (+mx || 0), y + (+my || 0), Object.assign({}, o, { hit: 0, baoDon: 0, than: null, nhuomMa: mau ? [mau, 0.6] : null }), false, D); } finally { c.restore(); }
          return;
        }
        if (xong) return;
        xong = true;
        c.save(); c.setTransform(T0); c.globalAlpha = a0;
        try { SC.veQuai(c, sp, x, y, o, false, D); } finally { c.restore(); }
      };
      MA._thayAnh = true; // 14/10: monster_art.js biết thân đang được thay bằng ảnh AI (vẽ phân thân bằng lệnh 'bongMa')
      if (G.BO_THAN === false) { try { draw0.call(MA, butGia(c, thay), id, x, y, o); } finally { MA._thayAnh = false; } return; }
      const b = muonBut(c, thay);
      MA._boThan = true; // V1: monster_art.js bỏ bước dựng thân bằng code (không bao giờ hiện ra), chỉ chạy Pose, bóng, hiệu ứng
      try { draw0.call(MA, b.p, id, x, y, o); } finally { MA._boThan = false; MA._thayAnh = false; traBut(b); }
    };
    MA.dur = function (id, anim) {
      const d = dur0.call(MA, id, anim);
      if (d) return d;
      const sp = SC.ds[id];
      return sp && sp.dt[anim] ? sp.dt[anim].giay : 0;
    };
  }

  // ---------- EM BÉ ----------
  const so2 = (a) => (Array.isArray(a) && a.length === 2 && isFinite(a[0]) && isFinite(a[1]) ? [clamp(Math.round(+a[0]), -30, 30), clamp(Math.round(+a[1]), -30, 30)] : null);
  function docNeo(n) {
    const goc = { dau: (n && so2(n.dau)) || [0, 0], than: (n && so2(n.than)) || [0, 0], tay: (n && so2(n.tay)) || [0, 0] }, kq = { goc, theo: {} };
    if (n && typeof n === 'object') for (const k of ANIMS) {
      const m = n[k]; if (!m || typeof m !== 'object') continue;
      kq.theo[k] = { dau: so2(m.dau) || goc.dau, than: so2(m.than) || goc.than, tay: so2(m.tay) || goc.tay };
    }
    return kq;
  }
  SC.docNeo = docNeo;
  // Điểm neo của động tác ten (động tác không ghi riêng thì dùng neo chung).
  SC.neoCua = (sp, ten) => (sp.neo ? sp.neo.theo[ten] || sp.neo.goc : null);
  // Mã tệp: em-be-hunter, em-be-healer, em-be-wrestler (ba bạn NPC). Đợt 2: bỏ em-be (chung), em-be-smith (Cu Tí cũ, nay là Zed:
  // js/zed_moi.js), thân theo bộ trang phục em-be-<key>-<bộ> và tệp đòn theo vũ khí em-be-<key>-don.
  SC.cuaEmBe = (key) => SC.get('em-be-' + (key || 'smith'));
  // 14/10: bạn nhỏ có hàng ngồi đã nạp xong -> chiều cao khung ngồi (điểm game), không thì 0 (js/village_scene.js: bé ngồi ở sân đình).
  SC.caoNgoi = (key) => { const sp = SC.cuaEmBe(key); return sp && sp.img && sp.dt.ngoi ? sp.caoNgoi || 24 : 0; };
  SC.chonEmBe = function (sp, o) {
    const p = o.p, t = (o.t != null ? o.t : G.time) || 0, dt = sp.dt;
    // 14/10 (YEU-CAU-BAN-NHO): ba bạn nhỏ phong cách Zed: o.ngoi (sân đình) -> hàng ngồi lặp; còn lại đứng (mọi động tác khác trỏ về hàng đứng).
    if (o.ngoi && dt.ngoi && !p) return { ten: 'ngoi', i: khungLap(dt.ngoi, t), u: 0 };
    const tc = o.tc != null && isFinite(o.tc) ? o.tc : t; // nhịp chân: thời gian chạy theo tốc độ đi thật (js/combat.js P.chayT), thiếu thì như cũ
    const mot = (ten, u) => { const k = dt[ten] ? ten : 'idle'; return { ten: k, i: dt[ten] ? khungMot(dt[k], u) : khungLap(dt.idle, t), u }; };
    const lap = (ten, tt) => { const k = dt[ten] ? ten : 'idle'; return { ten: k, i: khungLap(dt[k], tt), u: 0 }; };
    const wt = o.weapon && o.weapon.type;
    if (p && p.dead) { const u = (p.deadT || 0) / ((dt.die && dt.die.giay) || 0.6); return mot('die', u); }
    if (o.dodge >= 0) return dt.ne ? mot('ne', o.dodge) : lap('move', t);
    if (p && p.dashT > 0) return lap('move', t * 2);
    if (p && p.specT > 0) { const k = G.nhipChieu ? G.nhipChieu(1 - p.specT / 0.35, wt) : 1 - p.specT / 0.35; return mot('atk', k); } // G.nhipChieu: Trảm Nguyệt chém tới sớm (js/hero_tinhlinh.js)
    if (p && p.castT > 0) return mot('atk', 1 - p.castT / 0.4);
    if (p && p.mv && p.mv.holding && !(o.atk >= 0)) return mot('tele', 0.99);
    if (o.atk >= 0) {
      const cd = G.CHAY_DANH; // chạy mà đánh: chân vẫn bước (xem G.CHAY_DANH ở đầu tệp)
      if (o.move && (cd === 'than' || (cd === 'lai' && !(o.atk >= 0.2 && o.atk < 0.65)))) { const r = lap('move', tc); r.danh = true; return r; }
      return mot('atk', o.atk);
    }
    if ((p && p.hurtT > 0) || (!p && o.flash)) return mot('hit', p ? 1 - p.hurtT / 0.2 : 0.3);
    if (o.move) return lap('move', tc);
    return lap('idle', t);
  };
  // Nhún theo bước (G.NHUN_BUOC): số điểm ảnh dời thân lên (âm) ở khung này. Chỉ khi thân AI đang chạy (hàng chạy, hoặc chạy mà đánh
  // với G.CHAY_DANH = 'nhun'); vòng chạy 6 khung = 2 bước, nhấc lên ở khung giữa mỗi bước (1 và 4). Bóng đổ không nhún.
  SC.nhunBuoc = function (o) {
    if (!G.NHUN_BUOC || !o || !o.move || o.dodge >= 0 || (o.p && (o.p.dead || o.p.dashT > 0))) return 0;
    const sp = SC.cuaEmBe(o.key, o);
    if (!sp || !sp.img || !sp.dt.move || sp.nhunBuoc === false) return 0;
    let s = null;
    try { s = SC.chonEmBe(sp, o); } catch (e) { return 0; }
    const t = o.tc != null && isFinite(o.tc) ? o.tc : (o.t != null ? o.t : G.time) || 0, i = s.ten === 'move' ? s.i : G.CHAY_DANH === 'nhun' && o.atk >= 0 ? khungLap(sp.dt.move, t) : -1;
    return i >= 0 && i % 3 === 1 ? -1 : 0;
  };
  function emBeTint(o) {
    const p = o.p, st = p && p.st;
    if (o.flash || (p && p.hurtT > 0)) return ['#ffffff', 0.6];
    if (st && st.ice > 0) return ['#9fd8ff', 0.45];
    if (st && st.poison > 0) return ['#7fd957', 0.4];
    return null;
  }
  SC.emBeTint = emBeTint;

  // ---------- ĐỒ BÁM THÂN AI ----------
  // Đo xem thân AI ở khung (ten, i) dời / xoay bao nhiêu so với khung đứng thở đầu tiên (khung dùng để đặt neo), để đồ khoác lên
  // đi theo đúng thân AI (không theo khung xương code). Đo trên hình bóng (điểm ảnh có màu) ở cỡ điểm ảnh game, một lần mỗi khung.
  //  - Động tác đứng (đứng thở, chạy, lấy đà, đánh, trúng đòn): dò chỗ khớp nhất của vùng đầu và vùng thân (dời tối đa 8 điểm ảnh)
  //    -> { dau: [dx, dy], than: [dx, dy] }.
  //  - Lộn (ne) và chết (die): thân xoay cả người -> dò góc xoay (mỗi 15 độ) và chỗ đặt khớp nhất -> { rot, x, y }: đồ ghép lên thân
  //    rồi xoay, dời cả khối như thân. Lộn ưu tiên góc lăn tới đều (360 độ chia đều các khung).
  function matNa(sp) { // hình bóng từng khung theo điểm ảnh game: sp.mn[hang][i] = Uint8Array(fw*fh)
    if (sp.mn) return sp.mn;
    const N = sp.net || 1, W = sp.img.width, H = sp.img.height, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(sp.img, 0, 0);
    const d = x.getImageData(0, 0, W, H).data, fw = sp.fw, fh = sp.fh, h = Math.floor(N / 2);
    sp.mn = (ten, i) => {
      const a = sp.dt[ten] || sp.dt.idle, k = a.hang + ':' + i;
      sp.mn.c = sp.mn.c || {};
      let m = sp.mn.c[k]; if (m) return m;
      m = new Uint8Array(fw * fh);
      for (let y = 0; y < fh; y++) for (let q = 0; q < fw; q++) {
        const X = (i * fw + q) * N + h, Y = (a.hang * fh + y) * N + h;
        if (X < W && Y < H && d[(Y * W + X) * 4 + 3] > 127) m[y * fw + q] = 1;
      }
      return (sp.mn.c[k] = m);
    };
    return sp.mn;
  }
  function tamMat(m, fw, fh) { let n = 0, sx = 0, sy = 0, y0 = -1; for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) if (m[y * fw + x]) { n++; sx += x; sy += y; if (y0 < 0) y0 = y; } return n ? { n, x: sx / n, y: sy / n, y0 } : null; }
  // Dò dời (dx, dy) để vùng hàng [r0, r1) của khung gốc A khớp nhất với khung B (đếm điểm giống nhau, kể cả chỗ trống).
  function doDoi(A, B, fw, fh, r0, r1) {
    let best = -1, bx = 0, by = 0;
    r0 = Math.max(0, Math.floor(r0)); r1 = Math.min(fh, Math.ceil(r1));
    for (let dy = -8; dy <= 8; dy++) for (let dx = -8; dx <= 8; dx++) {
      let s = 0;
      for (let y = r0; y < r1; y++) {
        const yy = y + dy, inY = yy >= 0 && yy < fh;
        for (let x = 0; x < fw; x++) { const xx = x + dx, b = inY && xx >= 0 && xx < fw ? B[yy * fw + xx] : 0; if (A[y * fw + x] === b) s++; }
      }
      s -= (Math.abs(dx) + Math.abs(dy)) * 0.01; // hoà thì chọn dời ít
      if (s > best) { best = s; bx = dx; by = dy; }
    }
    return [bx, by];
  }
  SC.khopEmBe = function (sp, ten, i) {
    if (!sp || !sp.img || !sp.dt[ten]) return null;
    sp.khop = sp.khop || {};
    const k = ten + ':' + i;
    if (k in sp.khop) return sp.khop[k];
    let r = null;
    try {
      const mn = matNa(sp), fw = sp.fw, fh = sp.fh, A = mn('idle', 0), B = mn(ten, i), a = tamMat(A, fw, fh), b = tamMat(B, fw, fh), lat = sp.lat ? -1 : 1;
      if (a && b) {
        if (ten === 'ne' || ten === 'die') {
          const pts = []; for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) if (A[y * fw + x]) pts.push(x - a.x, y - a.y);
          const n = sp.dt[ten].so, goi = ten === 'ne' ? (360 * i) / n : 0;
          let best = -1e9, bt = 0, bdx = 0, bdy = 0;
          for (let t = ten === 'ne' ? 0 : -120; t <= (ten === 'ne' ? 345 : 120); t += 15) {
            const c = Math.cos((t * Math.PI) / 180), s = Math.sin((t * Math.PI) / 180), q = new Int16Array(pts.length);
            for (let j = 0; j < pts.length; j += 2) { q[j] = Math.round(pts[j] * c - pts[j + 1] * s + b.x); q[j + 1] = Math.round(pts[j] * s + pts[j + 1] * c + b.y); }
            for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
              let hit = 0;
              for (let j = 0; j < q.length; j += 2) { const X = q[j] + dx, Y = q[j + 1] + dy; if (X >= 0 && Y >= 0 && X < fw && Y < fh && B[Y * fw + X]) hit++; }
              const lech = Math.abs((((t - goi) % 360) + 540) % 360 - 180);
              const sc = hit / (a.n + b.n - hit) - (ten === 'ne' ? 0.0015 * lech : 0.0004 * Math.abs(t)) - (Math.abs(dx) + Math.abs(dy)) * 0.002;
              if (sc > best) { best = sc; bt = t; bdx = dx; bdy = dy; }
            }
          }
          // thân gốc: điểm p (toạ độ chân) -> R(p - c0) + c1  =>  đồ dựng ở tư thế đứng, xoay rot quanh chân rồi dời (x, y) = c1 - R c0
          const c0 = [a.x + 0.5 - sp.ax, a.y + 0.5 - sp.ay], c1 = [b.x + bdx + 0.5 - sp.ax, b.y + bdy + 0.5 - sp.ay], c = Math.cos((bt * Math.PI) / 180), s = Math.sin((bt * Math.PI) / 180);
          const X = c1[0] - (c0[0] * c - c0[1] * s), Y = c1[1] - (c0[0] * s + c0[1] * c);
          r = { rot: bt * lat, x: Math.round(X * lat), y: Math.round(Y) };
        } else if (!(ten === 'idle' && i === 0)) {
          const h = sp.ay - a.y0 + 1;
          const dau = doDoi(A, B, fw, fh, a.y0 - 2, a.y0 + 0.44 * h), than = doDoi(A, B, fw, fh, a.y0 + 0.5 * h, a.y0 + 0.85 * h);
          r = { dau: [dau[0] * lat, dau[1]], than: [than[0] * lat, than[1]] };
        }
      }
    } catch (e) { r = null; }
    return (sp.khop[k] = r);
  };
  // Đợt 2: bỏ áo trên thân AI (viền màu bậc áo, dấu ngực, aoAI, diemNguc) cùng trang phục cũ.
  // Bản đồ khoảng cách tới chỗ trống của hình bóng một khung (dùng đo đĩa đầu, js dauKhung).
  function khoangCach(M, fw, fh) {
    const D = new Float32Array(fw * fh);
    for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) {
      const j = y * fw + x; if (!M[j]) continue;
      D[j] = x === 0 || y === 0 ? 1 : Math.min(D[j - 1] + 1, D[j - fw] + 1, D[j - fw - 1] + 1.4, x < fw - 1 ? D[j - fw + 1] + 1.4 : 1);
    }
    for (let y = fh - 1; y >= 0; y--) for (let x = fw - 1; x >= 0; x--) {
      const j = y * fw + x; if (!M[j]) continue;
      D[j] = x === fw - 1 || y === fh - 1 ? 1 : Math.min(D[j], D[j + 1] + 1, D[j + fw] + 1, D[j + fw + 1] + 1.4, x > 0 ? D[j + fw - 1] + 1.4 : 1);
    }
    return D;
  }
  // Điểm neo của khung (ten, i) cho thân AI: từ tệp ghép (đợt 2: không còn tệp ghép nào → null; giữ hàm cho js/hero_tinhlinh.js).
  SC.diemKhung = function (sp, key, ten, i, kh) {
    return SC.ghep[key] ? SC.diemAI(key, ten, i, kh, sp) : null;
  };
  // ---------- TAY / KIẾM / MẶT KHI CHÉM (phiên 12/10, docs/review/ke-hoach-cai-thien/tay-kiem-mat) ----------
  // Lỗi: kiếm vẽ bằng code luôn đè lên thân AI (kể cả lúc giơ ra sau đầu, đi ngang mặt), bàn tay code (ô trắng) chồng lên tay AI,
  // và máy tự đo bàn tay trượt ở khung giơ tay qua đầu (nhận nhầm ngực). G.KIEM_KHOP bật:
  //  - bàn tay trước ở hàng atk_sword lấy theo bảng đo tay từng khung (TAY_KIEM) nếu ảnh đúng là ảnh đã đo (so số điểm ảnh từng khung);
  //  - SC.matKhung: vùng mặt của khung đang vẽ, để js/hero_tinhlinh.js (vkGhep) đặt kiếm ra sau thân khi lưỡi chĩa ra sau,
  //    và xoay lưỡi né mặt khi đang ở trước thân; bàn tay AI vẽ lại đè lên chuôi thay cho ô bàn tay code.
  // Tắt: G.KIEM_KHOP = false hoặc mở game với ?kiemkhop=0 -> y hệt trước.
  if (G.KIEM_KHOP === undefined) {
    let tat = false;
    try { tat = typeof location !== 'undefined' && /[?&]kiemkhop=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; }
    G.KIEM_KHOP = !tat;
  }
  // Rà soát A lần 2 (12/10): bề dày lưỡi theo ảnh + búa/giáo lấy đà nghiêng về trước khi ngả sau không khỏi mặt (js/hero_tinhlinh.js kiemKhop).
  // Tắt: G.VK_KHOP = false hoặc ?vkkhop=0 (giữ nguyên G.VK_NE_MAT của lần 1).
  if (G.VK_KHOP === undefined) {
    let tat = false;
    try { tat = typeof location !== 'undefined' && /[?&]vkkhop=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; }
    G.VK_KHOP = !tat;
  }
  // Đợt 2: bỏ bảng đo nắm tay TAY_KIEM / TAY_DON (hàng chém atk_sword, đòn theo vũ khí của thân cũ và thân theo bộ).
  // ---------- ĐIỂM ĐẦU THEO ĐẦU THẬT CỦA KHUNG (rà soát A, 12/10) ----------
  // Đo: ở hàng chưởng (cast), trúng đòn, đánh, điểm đỉnh đầu trong tệp ghép (hoặc ước lượng) có khi lệch hẳn khỏi đầu đang vẽ — Cu Lì
  // chưởng: đầu vẽ cao hơn khung đứng ~5 điểm ảnh mà điểm đỉnh đầu vẫn thấp → mũ (khăn xếp, nón lá) chụp xuống che mắt; Cái Bống, Cu Tèo
  // chưởng lệch 2–2,5. Nay: so vị trí đĩa mặt tự đo (SC.matKhung) của khung với khung đứng 0 cùng tấm; điểm đầu (đỉnh đầu, tâm đầu, mắt,
  // gáy) lệch dọc quá 1,5 điểm ảnh thì dời theo đầu thật (tối đa 6). Không áp ở đứng, chạy (đã đo tay) và lộn, chết (thân xoay cả người).
  // Tắt: G.DAU_THAT = false hoặc ?dauthat=0.
  if (G.DAU_THAT === undefined) { let tat = false; try { tat = typeof location !== 'undefined' && /[?&]dauthat=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; } G.DAU_THAT = !tat; }
  const DIEM_DAU_THAT = ['dinh_dau', 'tam_dau', 'mat', 'gay'], KHONG_DAU_THAT = { idle: 1, move: 1, ne: 1, die: 1 };
  {
    const dk2 = SC.diemKhung;
    SC.diemKhung = function (sp, key, ten, i, kh) {
      const kq = dk2(sp, key, ten, i, kh);
      if (!G.DAU_THAT || !kq || !sp || KHONG_DAU_THAT[ten] || !kq.diem.dinh_dau || !sp.dt.idle) return kq;
      let lech = 0;
      try {
        const m = SC.matKhung(sp, ten, i), m0 = SC.matKhung(sp, 'idle', 0), d0 = dk2(sp, key, 'idle', 0, SC.khopEmBe(sp, 'idle', 0));
        if (!m || !m0 || !d0 || !d0.diem.dinh_dau || m.r < 0.85 * m0.r) return kq; // đĩa đầu đo không chắc (đầu ngả, bị tay che): thôi
        lech = (m.y - m0.y) - (kq.diem.dinh_dau[1] - d0.diem.dinh_dau[1]); // >0: đầu thật thấp hơn điểm; <0: đầu thật cao hơn
      } catch (e) { return kq; }
      if (Math.abs(lech) <= 1.5) return kq;
      lech = clamp(lech, -6, 6);
      const r = { diem: Object.assign({}, kq.diem), nguon: Object.assign({}, kq.nguon) };
      for (const n of DIEM_DAU_THAT) if (r.diem[n]) { r.diem[n] = [r.diem[n][0], Math.round((r.diem[n][1] + lech) * 2) / 2]; r.nguon[n] = 'dau-that'; }
      return r;
    };
  }
  // ---------- NẮM TAY CẦM KIẾM (G.KIEM_SAU, phiên kiem-khong-che-mat 12/10; tắt: ?kiemsau=0) ----------
  // Trước: vẽ lại cả một ĐĨA tròn r = 2,5 của thân AI quanh nắm tay đè lên kiếm → lấy luôn cả ngực, hông phía sau tay, che mất núm chuôi
  // và một khúc chuôi (kiếm như dán cạnh tay). Nay: chọn đúng điểm ảnh BÀN TAY của khung — cùng màu da với giữa nắm tay (trong 2,6 điểm
  // ảnh), kèm viền tối sát nó — vẽ lại riêng những điểm đó (giữ nhuộm, nháy trúng đòn), rồi thêm 2 ngón tay màu da của chính ảnh vắt
  // ngang chuôi và một nét bóng giữa các ngón. Chuôi lòi ra hai đầu nắm tay: núm chuôi một bên, chắn kiếm + lưỡi bên kia.
  if (G.KIEM_SAU === undefined) { let tat = false; try { tat = typeof location !== 'undefined' && /[?&]kiemsau=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; } G.KIEM_SAU = !tat; }
  function pxTam(sp) { // màu từng điểm ảnh thật của cả tấm (đọc một lần)
    if (sp._pxNam !== undefined) return sp._pxNam;
    let r = null;
    try {
      const im = sp.img, w = im.width || im.naturalWidth, h = im.height || im.naturalHeight, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0); r = { d: x.getImageData(0, 0, w, h).data, w, h };
    } catch (e) { r = null; }
    return (sp._pxNam = r);
  }
  function matNam(sp, ten, i, P) {
    const k = ten + ':' + i + ':' + Math.round(P[0] * 2) + ':' + Math.round(P[1] * 2);
    sp._nam = sp._nam || new Map();
    if (sp._nam.has(k)) return sp._nam.get(k);
    let kq = null;
    try {
      const T = pxTam(sp), a = sp.dt[ten], n = sp.net || 1;
      if (T && a) {
        const fx = i * sp.fw * n, fy = a.hang * sp.fh * n, gx = (sp.lat ? sp.ax - P[0] : sp.ax + P[0]) * n, gy = (sp.ay + P[1]) * n, R = 2.6 * n;
        const lay = (x, y) => { if (x < 0 || y < 0 || x >= sp.fw * n || y >= sp.fh * n) return null; const o = ((fy + y) * T.w + fx + x) * 4; return T.d[o + 3] > 127 ? [T.d[o], T.d[o + 1], T.d[o + 2]] : null; };
        const sang = (c) => (0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]) / 255;
        const ds = [];
        for (let y = Math.floor(gy - R); y <= gy + R; y++) for (let x = Math.floor(gx - R); x <= gx + R; x++) {
          const c = lay(x, y); if (!c) continue;
          const d = Math.hypot(x + 0.5 - gx, y + 0.5 - gy); if (d > R) continue;
          ds.push({ x, y, c, d, l: sang(c) });
        }
        const goc = ds.filter((q) => q.d <= 1.2 * n && q.l > 0.3).sort((p, q) => p.l - q.l);
        if (goc.length) {
          const da = goc[goc.length >> 1].c, gan = (c) => Math.abs(c[0] - da[0]) + Math.abs(c[1] - da[1]) + Math.abs(c[2] - da[2]) < 95;
          const chon = new Set();
          for (const q of ds) if (q.l > 0.25 && gan(q.c)) chon.add(q.x + ',' + q.y);
          for (const q of ds) if (q.l <= 0.25 && [[1, 0], [-1, 0], [0, 1], [0, -1]].some((e) => chon.has(q.x + e[0] + ',' + (q.y + e[1])))) chon.add(q.x + ',' + q.y + 'v');
          const o = [];
          for (const key of chon) { const [x, y] = key.replace('v', '').split(',').map(Number); const lx = sp.lat ? sp.ax - (x + 1) / n : x / n - sp.ax; o.push(lx, y / n - sp.ay); }
          const bong = [Math.round(da[0] * 0.72), Math.round(da[1] * 0.68), Math.round(da[2] * 0.7)];
          kq = { o, s: 1 / n, da: hex2(da[0], da[1], da[2]), bong: hex2(bong[0], bong[1], bong[2]) };
        }
      }
    } catch (e) { kq = null; }
    if (sp._nam.size > 600) sp._nam.clear();
    sp._nam.set(k, kq);
    return kq;
  }
  // Vẽ nắm tay đè lên chuôi kiếm (gốc: chân bé, x về trước mặt). a: góc kiếm (độ). Trả false nếu không đo được (vẽ kiểu cũ).
  SC.veNam = function (c, sp, ten, i, P, a, tint) {
    const m = matNam(sp, ten, i, P); if (!m) return false;
    c.save();
    try {
      c.beginPath(); for (let j = 0; j < m.o.length; j += 2) c.rect(m.o[j], m.o[j + 1], m.s, m.s); c.clip();
      SC.veKhung(c, sp, ten, i, 1, { tint });
    } finally { c.restore(); }
    // ngón tay: 2 ô màu da (0,5 điểm ảnh, như nét ảnh AI) vắt ngang chuôi ngay trước nắm, một nét bóng sát chắn kiếm
    const r = (a * Math.PI) / 180, dx = Math.cos(r), dy = Math.sin(r), q = (u, v) => [Math.floor((P[0] + dx * u - dy * v) * 2) / 2, Math.floor((P[1] + dy * u + dx * v) * 2) / 2];
    const ga = c.globalAlpha;
    c.fillStyle = m.da; for (const v of [-0.5, 0, 0.5]) { const z = q(0.5, v); c.fillRect(z[0], z[1], 0.5, 0.5); }
    c.fillStyle = m.bong; for (const v of [-0.5, 0.5]) { const z = q(1.25, v); c.fillRect(z[0], z[1], 0.5, 0.5); }
    c.globalAlpha = ga;
    return true;
  };
  // Vùng mặt của khung (ten, i): đĩa đầu tự đo (dauKhung), dời về phía trước mặt và xuống dưới (mặt nằm nửa trước, nửa dưới của đầu).
  // { x, y, r } điểm ảnh game tính từ chân, x về trước mặt; null: khung cuộn tròn / không đo được.
  SC.matKhung = function (sp, ten, i) {
    if (!sp || !sp.img || !sp.dt[ten]) return null;
    sp.matC = sp.matC || {};
    const k = ten + ':' + i;
    if (k in sp.matC) return sp.matC[k];
    let r = null;
    try {
      const d = dauKhung(matNa(sp)(ten, i), sp.fw, sp.fh);
      if (d && d.uy > 0.5) { const x = d.hx + (sp.lat ? -1 : 1) * 0.3 * d.R, y = d.hy + 0.3 * d.R; r = { x: sp.lat ? sp.ax - x : x - sp.ax, y: y - sp.ay, r: 0.5 * d.R }; }
    } catch (e) { r = null; }
    return (sp.matC[k] = r);
  };
  // G.KIEM_SAU: khung không đo được mặt (mũ to của thân bộ che đầu, đầu ngả) thì mượn đĩa mặt của khung gần nhất cùng hàng, rồi khung
  // đứng — để kiếm vẫn né mặt. Khung cuộn tròn (lộn, chết) thì không mượn (mặt đã xoay đi chỗ khác).
  SC.matKhungGan = function (sp, ten, i) {
    const m = SC.matKhung(sp, ten, i); if (m || !sp || !sp.dt[ten] || ten === 'ne' || ten === 'die') return m;
    const n = sp.dt[ten].so || 1;
    for (let d = 1; d < n; d++) for (const j of [i - d, i + d]) if (j >= 0 && j < n) { const q = SC.matKhung(sp, ten, j); if (q) return q; }
    for (let j = 0; j < ((sp.dt.idle && sp.dt.idle.so) || 0); j++) { const q = SC.matKhung(sp, 'idle', j); if (q) return q; }
    // Kiểm chéo (phiên kiem-khong-che-mat thứ hai): Cu Tí bộ Lâu Đài KHÔNG khung đứng nào đo được mặt (mũ trùm cáo) nên trước đây mượn
    // mặt thân gốc — cao hơn mặt thật ~4 điểm ảnh (thân bộ đầu to, mặt thấp) → núm chuôi lúc đứng vẽ đè lên miệng. Nay mượn trước các
    // khung đo được của CHÍNH tấm này (chạy, rồi mọi hàng khác), thân gốc chỉ là cách cuối. Tắt cùng ?kiemsau=0 (chỉ G.KIEM_SAU gọi hàm này).
    for (const h of ['move'].concat(Object.keys(sp.dt).filter((x) => x !== 'idle' && x !== 'move' && x !== 'ne' && x !== 'die' && x !== ten)))
      for (let j = 0; j < ((sp.dt[h] && sp.dt[h].so) || 0); j++) { const q = SC.matKhung(sp, h, j); if (q) return q; }
    return null;
  };
  // Tâm và bán kính đầu của một khung (hình bóng M): khối tròn dày nhất ở nửa trên (như doNguc). null: không đo được.
  function dauKhung(M, fw, fh) {
    const a = tamMat(M, fw, fh); if (!a || a.n < 30) return null;
    const D = khoangCach(M, fw, fh);
    let y1 = 0; for (let j = 0; j < M.length; j++) if (M[j]) y1 = Math.max(y1, (j / fw) | 0);
    const yc = a.y0 + 0.6 * (y1 - a.y0 + 1);
    let R = 0; for (let y = a.y0; y < yc; y++) for (let x = 0; x < fw; x++) if (D[y * fw + x] > R) R = D[y * fw + x];
    if (R < 2.5) return null;
    let n = 0, hx = 0, hy = 0;
    for (let y = a.y0; y < yc; y++) for (let x = 0; x < fw; x++) if (D[y * fw + x] >= R - 0.5) { n++; hx += x + 0.5; hy += y + 0.5; }
    hx /= n; hy /= n;
    let w = 0, bx = 0, by = 0; // hướng từ tâm đầu về phía thân (trọng tâm phần còn lại, khối dày nặng hơn)
    for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) {
      const d = D[y * fw + x]; if (!d || Math.hypot(x + 0.5 - hx, y + 0.5 - hy) <= R + 1.5) continue;
      const q = d * d; w += q; bx += q * (x + 0.5); by += q * (y + 0.5);
    }
    let ux = 0, uy = 1; if (w) { const L = Math.hypot(bx / w - hx, by / w - hy); if (L >= 1) { ux = (bx / w - hx) / L; uy = (by / w - hy) / L; } }
    return { hx, hy, R, ux, uy };
  }
  function noiEmBe() {
    const A = G.art;
    if (!A || !A.hero || A._spriteCustom || !SC.noi) return;
    A._spriteCustom = true;
    const hero0 = A.hero;
    A.hero = function (c, o) {
      const sp = SC.cuaEmBe(o && o.key, o);
      // 14/10 (vũ khí cũ còn sót, mục 8): không có ảnh mới (em-be-* cho 3 bạn; Zed đã thử zed-* ở js/zed_moi.js trước khi tới đây) thì
      // KHÔNG vẽ em bé code kiểu cũ (chờ ảnh: không vẽ gì).
      if (!sp || !G.tinhLinh) return;
      if (G.VK_NGA && o && o.p && o.p.dead) o = Object.assign({}, o, { vkNga: true }); // rà soát A9: vũ khí nằm theo thân AI ngay khung chết đầu (js/hero_tinhlinh.js)
      let fr = null; // cùng độ nét ghép với em bé gốc (hero0 tính y như vậy) để nhận ra đúng chỗ vẽ thân
      try { fr = G.tinhLinh.frame(o, G.tinhLinh.netCua ? G.tinhLinh.netCua(c, o) : 1); } catch (e) { fr = null; }
      if (!fr) return;
      const s = SC.chonEmBe(sp, o), tint = emBeTint(o);
      let lop = null; // đồ đang mặc khoác lên thân AI: lớp sau thân và lớp trước thân, bám theo chính thân AI khung này
      const neo = SC.neoCua(sp, s.ten);
      if (sp.khoacDo && G.tinhLinh.lopDo) {
        try { const kh = SC.khopEmBe(sp, s.ten, s.i); lop = G.tinhLinh.lopDo(fr, neoGhep(fr.key, s, neo, kh, sp), kh, null); } catch (e) { lop = null; }
      }
      // (Đợt 2: bỏ áo khoác, viền bậc áo, dấu ngực, ánh viền trang phục trên thân AI cùng trang phục cũ.)
      // Vũ khí và nắm tay dời theo "neo.tay" cho khớp bàn tay của thân AI.
      if (neo && neo.tay && (neo.tay[0] || neo.tay[1])) o = Object.assign({}, o, { neoTay: neo.tay });
      // G.KIEM_KHOP: bàn tay AI (cắt tròn quanh điểm nắm của khung này) vẽ lại đè lên chuôi, thay cho ô bàn tay code (js/hero_tinhlinh.js drawFrame).
      if (G.KIEM_KHOP) o = Object.assign({}, o, { veTayAI: (cc, P, r) => { cc.save(); cc.beginPath(); cc.arc(P[0], P[1], r, 0, Math.PI * 2); cc.clip(); SC.veKhung(cc, sp, s.ten, s.i, 1, { tint }); cc.restore(); } });
      // G.KIEM_SAU: nắm tay thật — chỉ điểm ảnh bàn tay của khung (màu da + viền) đè lên chuôi, thêm ngón tay (SC.veNam).
      if (G.KIEM_KHOP && G.KIEM_SAU) o.veNam = (cc, P, a) => SC.veNam(cc, sp, s.ten, s.i, P, a, tint);
      // Em bé gốc vẫn vẽ bóng, vũ khí, hào quang trang phục; chỗ vẽ thân thì vẽ hình tự vẽ.
      const thay = function (img, x, y) {
        const than = img === fr.cv || (arguments.length === 3 && x === fr.ox && y === fr.oy && img && img.width === fr.cv.width && img.height === fr.cv.height);
        if (than) {
          if (lop && !lop.sau.trong) c.drawImage(lop.sau.cv, lop.sau.ox, lop.sau.oy, lop.sau.w, lop.sau.h);
          SC.veKhung(c, sp, s.ten, s.i, 1, { tint });
          if (lop && !lop.truoc.trong) c.drawImage(lop.truoc.cv, lop.truoc.ox, lop.truoc.oy, lop.truoc.w, lop.truoc.h);
          return;
        }
        return c.drawImage.apply(c, arguments);
      };
      if (G.BO_THAN === false) return hero0.call(A, butGia(c, thay), o);
      const b = muonBut(c, thay); // V1: bút giả dùng lại, không tạo Proxy mỗi khung
      try { return hero0.call(A, b.p, o); } finally { traBut(b); }
    };
  }

  // ---------- NGƯỜI LÀNG ----------
  // Mã tệp: nl-<mã người> (nl-lai Chú Lái Đò, nl-ren Ông Thợ Rèn, nl-xen Bà Hàng Xén, nl-may Cô Thợ May, nl-do Cụ Đồ, nl-tu Ông Từ, nl-mo Anh Mõ).
  // Hai động tác: idle (đứng thở) và noi (nói chuyện, vẫy tay: khi em bé tới gần, khi mở bảng). Thay hình trong làng, ở dải khuôn mặt và khung nói chuyện.
  SC.cuaNguoiLang = (k) => SC.get('nl-' + k);
  // Vẽ người làng tự vẽ, chân tại (x, y). o: { anim: 'idle' | 'noi', t (giây), face, s (số lần phóng) }
  SC.veNguoiLang = function (c, sp, x, y, o) {
    o = o || {};
    const ten = o.anim === 'noi' && sp.dt.noi ? 'noi' : 'idle', a = sp.dt[ten], s = o.s || 1;
    c.save(); c.translate(Math.round(x), Math.round(y)); if (s !== 1) c.scale(s, s);
    // G.NL_DONG (mặc định bật từ 14/10, xem đầu tệp): chạy khung theo o.t; tắt (?nldong=0) thì đứng yên khung đầu hàng đứng như 12/10
    SC.veKhung(c, sp, G.NL_DONG ? ten : 'idle', G.NL_DONG ? khungLap(a, Math.max(0, o.t || 0)) : 0, o.face < 0 ? -1 : 1, {});
    c.restore();
  };
  // Vùng khuôn mặt (phần đầu) của khung đứng thở đầu tiên: [x, y, rộng, cao] theo điểm ảnh THẬT của tấm sprite (gấp net lần).
  function vungMat(sp) {
    if (sp.mat) return sp.mat;
    const N = sp.net || 1, fw = sp.fw * N, fh = sp.fh * N;
    if (sp.vungMatTay) { // 15/10 sua-lang-npc: ô mặt ghi tay trong tệp ("vung_mat", điểm game × net), giữ trong khung
      const t = sp.vungMatTay, s2 = Math.max(1, Math.min(Math.round(t[2] * N), fw, fh));
      const mx = Math.max(0, Math.min(fw - s2, Math.round(t[0] * N))), my = Math.max(0, Math.min(fh - s2, Math.round(t[1] * N)));
      return (sp.mat = [mx, sp.dt.idle.hang * fh + my, s2, s2]);
    }
    const a = sp.dt.idle, cv = document.createElement('canvas'); cv.width = fw; cv.height = fh;
    const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(sp.img, 0, a.hang * fh, fw, fh, 0, 0, fw, fh);
    const d = x.getImageData(0, 0, fw, fh).data;
    let y0 = -1, y1 = -1; for (let y = 0; y < fh && y0 < 0; y++) for (let i = 0; i < fw; i++) if (d[(y * fw + i) * 4 + 3] > 127) { y0 = y; break; }
    for (let y = fh - 1; y >= 0 && y1 < 0; y--) for (let i = 0; i < fw; i++) if (d[(y * fw + i) * 4 + 3] > 127) { y1 = y; break; }
    if (y0 < 0) return (sp.mat = [0, a.hang * fh, fw, fh]);
    // 12/10: khung mặt là hình vuông bao trọn phần đầu (mũ + mặt), tâm ở giữa hộp bao của phần đầu, để mặt nằm giữa vòng tròn
    const hh = Math.max(6 * N, Math.round((y1 - y0 + 1) * 0.45));
    let x0 = fw, x1 = -1; for (let y = y0; y < y0 + hh && y < fh; y++) for (let i = 0; i < fw; i++) if (d[(y * fw + i) * 4 + 3] > 127) { if (i < x0) x0 = i; if (i > x1) x1 = i; }
    if (x1 < 0) { x0 = 0; x1 = fw - 1; }
    const sz = Math.max(hh, x1 - x0 + 1), cx = (x0 + x1 + 1) / 2, cy = y0 + hh / 2;
    const s2 = Math.min(sz, fw, fh), mx = Math.max(0, Math.min(fw - s2, Math.round(cx - s2 / 2))), my = Math.max(0, Math.min(fh - s2, Math.round(cy - s2 / 2))); // không vượt khung (Safari không vẽ nếu vùng cắt lòi ra ngoài ảnh)
    return (sp.mat = [mx, a.hang * fh + my, s2, s2]);
  }
  SC.vungMat = vungMat;
  let lanNL = 0;
  function noiNguoiLang() {
    const VS = G.villageScene;
    if (!VS || !VS.NPCS) { if (lanNL++ < 50 && typeof setTimeout !== 'undefined') setTimeout(noiNguoiLang, 50); return; }
    if (VS._spriteCustom) return;
    VS._spriteCustom = true;
    VS.tuVe = function (c, kind, x, y, s, o) {
      const sp = SC.cuaNguoiLang(kind); if (!sp) return false;
      const look = (o && o.look) || 0;
      SC.veNguoiLang(c, sp, x, y, { anim: look ? 'noi' : 'idle', t: o && o.t != null ? o.t : G.time || 0, face: look < 0 ? -1 : 1, s: s || 1 });
      return true;
    };
    VS.coAnh = function (k) { const sp = SC.cuaNguoiLang(k); return sp ? [sp.rong, sp.cao] : null; }; // [rộng, cao] điểm game: hộp chạm, đỉnh đầu
    VS.tuVeMat = function (ctx, k, cx, cy, s) {
      const sp = SC.cuaNguoiLang(k); if (!sp) return false;
      const m = vungMat(sp), k2 = Math.min((22 * s) / m[2], (22 * s) / m[3]), w = m[2] * k2, h = m[3] * k2, sm = ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled = false; ctx.drawImage(sp.img, m[0], m[1], m[2], m[3], cx - w / 2, cy - h / 2, w, h); ctx.imageSmoothingEnabled = sm;
      return true;
    };
  }

  // ======================= ĐỒ: VẬT PHẨM =======================
  // Mã tệp:  vp-<loại>   ví dụ vp-gold, vp-potion, vp-linhkhi-fire, vp-ore, vp-mat0, vp-shard2
  // (Đợt 2: bỏ vk-<loại>-<dòng>… ảnh vũ khí AI cũ và tp-<ô>-<hình> ảnh trang phục cũ; vũ khí Zed dùng bộ zed-vk.)
  const DO_LOAI = { 'vat-pham': 1 };
  const D2R = Math.PI / 180;
  SC.do = {};
  const hex2 = (r, g, b) => '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  function docDiem(src) { // ảnh -> mảng màu '#rrggbb' (null là trống)
    const w = src.width, h = src.height, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(src, 0, 0);
    const d = x.getImageData(0, 0, w, h).data, px = new Array(w * h).fill(null);
    for (let i = 0; i < w * h; i++) if (d[i * 4 + 3] > 127) px[i] = hex2(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]);
    return px;
  }
  function themDo(tep) {
    // rong, cao: cỡ theo điểm ảnh GAME; pw, ph: cỡ ảnh thật (gấp net lần); px: màu từng điểm ảnh THẬT (pw x ph).
    const doi = tep.doi_tuong, sp = { ma: tep.ma, ten: String(tep.ten || tep.ma), doi, net: docNet(tep.net), rong: 0, cao: 0, pw: 0, ph: 0, img: null, px: null, ready: false, xoay: new Map(), mau: {} };
    if (typeof tep.vat_pham !== 'string' || !/^[a-z0-9-]{2,20}$/.test(tep.vat_pham)) throw new Error('loại vật phẩm sai');
    sp.vp = tep.vat_pham;
    const xong = (src) => {
      sp.img = src; sp.pw = src.width; sp.ph = src.height; sp.rong = Math.max(1, Math.round(src.width / sp.net)); sp.cao = Math.max(1, Math.round(src.height / sp.net));
      if (G.NAP_SAU_MOI) { // V3: mảng màu từng điểm ảnh chỉ đọc khi cần lần đầu (đọc điểm ảnh 150 vũ khí lúc nạp làm giật)
        let px = null; const anh = src;
        Object.defineProperty(sp, 'px', { get() { if (!px) px = docDiem(anh); return px; }, set(v) { px = v; }, configurable: true, enumerable: true });
      } else sp.px = docDiem(src);
      sp.ready = true; sp.xoay.clear(); sp.mau = {};
      if (SC.do[sp.ma] !== sp) return;
      noiVatPham();
      xoaNhoDoKhiCan(sp);
    };
    if (boDo.cu && SC.do[sp.ma]) boDo(sp.ma);
    SC.do[sp.ma] = sp;
    if (tep.anhCanvas && tep.anhCanvas.getContext) xong(tep.anhCanvas); // công cụ đưa thẳng canvas (vẽ ngay, không chờ)
    else {
      if (!SC.laAnh(tep.anh)) throw new Error('thiếu ảnh');
      if (typeof Image !== 'undefined') { const img = new Image(); img.onload = () => xong(img); img.onerror = () => SC.loi.push(sp.ma + ': ảnh hỏng'); SC.napAnh(img, tep.anh); }
    }
    return sp;
  }
  function xoaNhoDo() {
    try { if (G.tinhLinh && G.tinhLinh.clearCache) G.tinhLinh.clearCache(); } catch (e) { /* bỏ qua */ }
    try { if (G.doRoi && G.doRoi.xoaNho) G.doRoi.xoaNho(); } catch (e) { /* bỏ qua */ }
  }
  // V3: trong lúc nạp tệp ảnh tải sau, một hình mới về chỉ xoá hình đã nhớ (em bé + đồ, vật rơi) khi nó đang được dùng: thân em bé
  // của nhân vật đang chơi, vũ khí cùng loại món đang mang, trang phục, vật phẩm. Gom lại, xoá nhiều nhất một lần mỗi giây.
  // Tải xong thì chayNapSau xoá thêm một lần cuối như cũ. Ngoài lúc nạp tệp tải sau (hoặc tắt cờ): xoá ngay như cũ.
  let henXoa = 0;
  function dangDung(sp) {
    try {
      const ma = sp.ma || '';
      if (sp.vp) return true;
      if (sp.doi === 'em-be' || /^em-be/.test(ma)) return true; // ba bạn NPC: luôn có thể đang hiện trong làng
      return false;
    } catch (e) { return true; }
  }
  function xoaNhoDoKhiCan(sp) {
    if (!G.NAP_SAU_MOI || !napSauDangChay) { xoaNhoDo(); return; }
    if (!dangDung(sp) || henXoa) return;
    henXoa = setTimeout(() => { henXoa = 0; xoaNhoDo(); }, 1000);
  }
  function boDo(ma) {
    const sp = SC.do[ma]; if (!sp) return;
    delete SC.do[ma];
    xoaNhoDo();
  }
  boDo.cu = true;
  const doSan = (ma) => { const s = SC.do[ma]; if (s && !s.ready && roiCan) roiCan(ma); return s && s.ready ? s : null; };

  // ---------- VŨ KHÍ ----------
  // ----- CỠ VŨ KHÍ ẢNH AI KHI VẼ (chỉ đổi HÌNH, không đổi tầm đánh, vùng trúng, sát thương) -----
  // Ảnh AI vẽ to (kiếm ~46 điểm ảnh, gấp rưỡi thân em bé 29). G.CO_VK: hệ số co theo loại, co quanh điểm cầm (cam); mũi, dây cung,
  // hạt hệ co theo. "lang": nhân thêm cho vũ khí bay theo em bé ở làng. "nam": chỗ bàn tay nắm trên ảnh AI, tính từ điểm cầm dọc
  // thân về phía mũi (điểm ảnh game của ảnh gốc), để chuôi nằm đúng trong tay (js/hero_tinhlinh.js).
  // Kiếm 0,66 (0,54 thì kiếm dài 25, vung sát người; 0,66: dài ~30, ngang một thân em bé 29).
  // Tắt: G.CO_VK = null, hoặc mở game với ?covk=0  -> vẽ y hệt bản cũ.
  if (G.CO_VK === undefined) {
    let tat = false;
    try { tat = typeof location !== 'undefined' && /[?&]covk=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; }
    G.CO_VK = tat ? null : { sword: 0.66, bow: 0.52, spear: 0.59, hammer: 0.48, lang: 0.9, nam: 1.5 };
  }
  // Hệ số co của một món: opts.lang (vũ khí bay ở làng) nhân thêm hệ số làng. Tắt cờ: 1.
  SC.coVk = function (loai, opts) {
    const C = G.CO_VK; if (!C || typeof C !== 'object') return 1;
    let k = +C[loai]; if (!(k > 0.05 && k <= 4)) k = 1;
    if (opts && opts.lang) { const l = +C.lang; if (l > 0.05 && l <= 4) k *= l; }
    return k;
  };
  // Chỗ tay nắm trên ảnh AI (đã co): khoảng cách từ điểm cầm dọc thân. Tắt cờ: null (giữ cách cũ).
  SC.namVk = function (loai, opts) {
    const C = G.CO_VK; if (!C || typeof C !== 'object' || loai === 'bow') return null;
    const n = isFinite(+C.nam) ? +C.nam : 0;
    return n * SC.coVk(loai, opts);
  };
  // Ảnh vũ khí AI cũ (vk-<loại>-<dòng>…): đợt 2 đã bỏ → luôn null; js/hero_tinhlinh.js vẽ vũ khí bằng code (js/weapon_art.js), còn hình
  // vũ khí chính của Zed là bộ zed-vk (js/zed_moi.js, js/vk_moi.js).
  SC.timVuKhi = function () { return null; };
  // ======================= GHÉP TRANG BỊ =======================
  // Đợt 2: bỏ tệp ghep-<key> (hồ sơ ghép trang bị của em bé cũ) và phần đặt món trang phục (tinhDatMon, datDo, TP_CHINH…). SC.ghep luôn
  // rỗng: các hàm dưới đây trả "không có" và js/hero_tinhlinh.js vẽ như khi chưa có tệp ghép. Giữ để công cụ / thân code đọc điểm neo.
  // Định dạng cũ: docs/review/ghep-trang-bi/DINH-DANG-GHEP.md. Hồ sơ hình thể nhân vật: tệp ghep-<key>.sprite.json
  //   { "doi_tuong": "ghep", "ma": "ghep-smith", "nhan_vat": "smith", "diem": {...}, "diem_theo": {...}, "cap": {...} }
  // Toạ độ trên nhân vật tính từ chân (x về trước mặt, y âm là lên), trên ảnh món đồ tính từ góc trên-trái; đơn vị điểm ảnh game,
  // đếm như vị trí điểm ảnh (điểm ảnh thứ i nằm ở i). Thân vẽ code tự tính điểm từ khung xương từng khung (js/hero_tinhlinh.js).
  const TEN_DIEM = ['dinh_dau', 'tam_dau', 'gay', 'mat', 'co', 'vai_sau', 'vai_truoc', 'nguc', 'eo', 'hong', 'khuyu_sau', 'khuyu_truoc', 'tay_sau', 'tay_truoc',
    'goi_sau', 'goi_truoc', 'chan_sau', 'chan_truoc', 'cam', 'lung', 'goc_canh'];
  const DIEM_DAU = { dinh_dau: 1, tam_dau: 1, gay: 1, mat: 1 }; // điểm thuộc đầu: thân AI dời theo phần đầu tự đo
  SC.TEN_DIEM = TEN_DIEM;
  SC.ghep = {};
  SC.ghepVer = 0;
  SC.khoaGhep = (key) => (SC.ghep[key] ? '|g' + SC.ghepVer : '');
  // Tên động tác: thân code (run, dodge, hurt, hold, ...) và thân AI (move, ne, hit, tele, ...) gọi khác nhau; khoá "theo" ghi tên nào cũng được.
  const CHUAN = { run: 'move', dash: 'move', dodge: 'ne', hurt: 'hit', hold: 'tele', spec: 'atk', cast: 'atk', sweep: 'atk', gong: 'idle' };
  const DOI_CODE = { move: 'run', ne: 'dodge', hit: 'hurt', tele: 'hold' };
  SC.TEN_AI = CHUAN; SC.TEN_CODE = DOI_CODE;
  // Các khoá "theo" áp cho (ten, i), ưu tiên tăng dần: động tác (tên khác, tên chuẩn, đúng tên) rồi khung.
  function khoaTheo(ten, i) {
    const c = CHUAN[ten] || ten, ds = [];
    for (const n of [DOI_CODE[c], c, ten]) if (n && ds.indexOf(n) < 0) ds.push(n);
    return ds.concat(ds.map((n) => n + ':' + (i | 0)));
  }
  SC.khoaTheo = khoaTheo;
  // Chỉnh theo cặp (nhân vật key + món ma) đã gộp "theo" của động tác / khung dong = { ten, i }. null: không có.
  SC.capTheo = function (key, ma, dong) {
    const g = SC.ghep[key], c = g && g.cap[ma];
    if (!c) return null;
    const r = Object.assign({}, c.goc);
    if (dong) for (const k of khoaTheo(dong.ten, dong.i)) if (c.theo[k]) Object.assign(r, c.theo[k]);
    return r;
  };
  // Thân AI: điểm neo khung (ten, i), toạ độ tính từ chân. Lấy diem_theo (khung thắng động tác), thiếu thì lấy "diem" (khung đứng
  // đầu tiên) rồi dời theo phần game tự đo (SC.khopEmBe): đầu dời theo dau, còn lại theo than; lăn/ngã: xoay, dời cả khối.
  // null: chưa có tệp ghép cho nhân vật này (game ước lượng từ khung xương như cũ).
  SC.diemAI = function (key, ten, i, khop, sp) {
    const g = SC.ghep[key];
    if (!g) return null;
    const th = {}, tt = sp && sp.ma && g.theoThan ? g.theoThan[sp.ma] : null; // tt: điểm riêng của tấm thân đang vẽ (diem_theo_than)
    for (const k of khoaTheo(ten, i)) { const q = (tt && tt[k]) || g.theo[k]; if (q) Object.assign(th, q); }
    const quay = !!(khop && khop.rot != null), d = {}, ng = {};
    const c = quay ? Math.cos(khop.rot * D2R) : 1, s = quay ? Math.sin(khop.rot * D2R) : 0;
    for (const n of TEN_DIEM) {
      if (th[n]) { d[n] = th[n].slice(); ng[n] = 'tep'; continue; }
      const p = g.diem[n];
      if (!p) continue;
      if (ten === 'idle' && (i | 0) === 0) { d[n] = p.slice(); ng[n] = 'tep'; continue; }
      if (quay) d[n] = [khop.x + p[0] * c - p[1] * s, khop.y + p[0] * s + p[1] * c];
      else { const q = khop ? (DIEM_DAU[n] ? khop.dau : khop.than) : null; d[n] = [p[0] + ((q && q[0]) || 0), p[1] + ((q && q[1]) || 0)]; }
      ng[n] = 'uoc-luong';
    }
    return { diem: d, nguon: ng };
  };
  // neo truyền cho lopDo: có tệp ghép thì thêm khung đang vẽ, điểm của khung và khoá bộ nhớ đệm. Không có: trả lại neo cũ (y hệt trước).
  function neoGhep(key, s, neo, kh, sp) {
    if (!SC.ghep[key]) return neo;
    const da = sp ? SC.diemKhung(sp, key, s.ten, s.i, kh) : SC.diemAI(key, s.ten, s.i, kh), n = Object.assign({}, neo || {});
    n.khung = { ten: s.ten, i: s.i }; n.diem = da ? da.diem : null; n.nguon = da ? da.nguon : null;
    n.khoa = '|g' + SC.ghepVer + ':' + ((sp && sp.ma) || '') + ':' + s.ten + ':' + s.i; // mã tấm thân: thân gốc và thân theo bộ có điểm riêng (diem_theo_than)
    return n;
  }
  // ---------- API cho công cụ (tools/tach-ghep, tach-do...): xem thử y hệt game ----------
  const r2 = (v) => Math.round(v * 100) / 100;
  // Bối cảnh của một khung. a: đối tượng vẽ em bé của game (o: key, move, atk, dodge, p, weapon, outfit...) hoặc
  // { key, dong_tac, khung, vu_khi ('sword'|'bow'|'spear'|'hammer'|null), v, outfit }.
  function ngCanh(a) {
    const TL = G.tinhLinh;
    if (!a || !TL || !TL.cxGia) return null;
    const key = TL.HERO[a.key] ? a.key : 'smith', of = TL.outfitOf(key, a), sp = SC.cuaEmBe(key, a);
    if (sp) { // thân AI
      let s;
      if (a.dong_tac != null) { const ten0 = String(a.dong_tac), ten = sp.dt[ten0] ? ten0 : SC.TEN_AI[ten0] || ten0, k = sp.dt[ten] ? ten : 'idle'; s = { ten: k, i: clamp(a.khung | 0, 0, sp.dt[k].so - 1) }; }
      else s = SC.chonEmBe(sp, a);
      const kh = SC.khopEmBe(sp, s.ten, s.i), neo = neoGhep(key, s, SC.neoCua(sp, s.ten), kh, sp);
      // nhịp đung đưa: trong game theo động tác của thân code cùng lúc; ở đây suy từ động tác AI (move = chạy; hàng đòn theo vũ khí = đánh, chưởng)
      const fr = a.dong_tac != null ? { key, of, anim: s.ten === 'move' ? 'run' : s.ten === 'idle' ? 'idle' : s.ten, f: s.i } : TL.frame(a, 1);
      return { ai: true, cx: TL.cxLopDo({ key, of, anim: fr.anim, f: fr.f }, neo, kh), ten: s.ten, i: s.i, key, of };
    }
    let ps;
    if (a.dong_tac != null) {
      const ten = SC.TEN_CODE[a.dong_tac] || String(a.dong_tac), vk = a.vu_khi === undefined ? 'sword' : a.vu_khi && a.vu_khi.type ? a.vu_khi.type : a.vu_khi || 'none';
      ps = TL.poseRs(key, vk, ten, clamp(a.khung | 0, 0, 13), a.v | 0, a.rs == null ? 6 : a.rs);
    } else ps = TL.frame(a, 1).ps;
    return { ai: false, cx: TL.cxGia(key, of, ps, null), ten: ps.anim, i: ps.f | 0, key, of };
  }
  SC.ngCanh = ngCanh;
  // Điểm neo nhân vật ở một khung. Gọi: diemNhanVat(o) hoặc diemNhanVat({ key, dong_tac, khung, vu_khi }) hoặc diemNhanVat(key, dong_tac, khung).
  // Trả về { diem: { tên: [x, y] tính từ chân }, nguon: { tên: 'xuong' | 'tep' | 'uoc-luong' }, than: 'code' | 'ai', dong_tac, khung, goc: { than, dau } }.
  // Cũng nhận diemNhanVat(key, o) (o: đối tượng vẽ em bé hoặc { dong_tac, khung, ... }).
  const thamSo = (a, b, c, tuy) => (typeof a !== 'string' ? a : b && typeof b === 'object' ? Object.assign({}, b, { key: a }) : Object.assign({ key: a, dong_tac: b == null ? 'idle' : b, khung: c }, tuy || {}));
  SC.diemNhanVat = function (a, dong_tac, khung) {
    const ctx = ngCanh(thamSo(a, dong_tac, khung));
    if (!ctx) return null;
    const dm = ctx.cx.diemCua(), ps = ctx.cx.ps, diem = {}, uoc = [];
    for (const n in dm.d) { diem[n] = [r2(dm.d[n][0] + (ps.x || 0)), r2(dm.d[n][1] + (ps.y || 0))]; if (dm.ng[n] === 'uoc-luong') uoc.push(n); }
    const gt = r2(ctx.cx.B.deg), gd = r2(ctx.cx.H.deg);
    return { diem, nguon: Object.assign({}, dm.ng), uoc_luong: uoc, than: ctx.ai ? 'ai' : 'code', dong_tac: ctx.ten, khung: ctx.i, goc: { than: gt, dau: gd }, gocThan: gt, gocDau: gd };
  };
  // Vũ khí: chỉnh theo cặp nhân vật + vũ khí (khoá: mã tệp vũ khí, "vk-<loại>-<dòng>", "vk-<loại>"; cụ thể nhất thắng), gộp "theo".
  // Trả về { dx, dy, xoay, bam } hoặc null. Chỉ dời / xoay hình vũ khí quanh điểm cầm, không đổi đòn đánh.
  // (anim, f): thân code thì là động tác và khung của khung xương; thân AI thì là hàng và khung ẢNH AI đang vẽ (SC.khungVk), để
  // "tele:3", "atk:0", "hit:2" trong tệp ghép chỉ đúng khung hình người chơi đang thấy.
  // bam (Đợt 5, tuỳ chọn): tên điểm neo của thân mà bàn tay nắm vũ khí bám vào (js/hero_tinhlinh.js vkGhep); null: chỉ dời / xoay như cũ.
  SC.capVuKhi = function (key, w, type, anim, f) {
    const g = SC.ghep[key];
    if (!g || !g.coVk || !type) return null;
    let wo = null, ma = null;
    try { wo = G.weaponArt && G.weaponArt.fromWeapon ? G.weaponArt.fromWeapon(w) : null; const s = wo && SC.timVuKhi(wo); ma = s && s.ma; } catch (e) { wo = null; }
    const ks = [ma, wo ? 'vk-' + type + '-' + (wo.family | 0) : null, 'vk-' + type];
    let k = null; for (const q of ks) if (q && g.cap[q]) { k = q; break; }
    if (!k) return null;
    const c = SC.capTheo(key, k, { ten: anim, i: f });
    if (!c || (!c.dx && !c.dy && !c.xoay && !c.bam)) return null;
    return { dx: c.dx || 0, dy: c.dy || 0, xoay: c.xoay || 0, bam: c.bam || null, bam_vk: c.bam_vk || null, khoa: k };
  };
  // Thân AI đang vẽ cho đối tượng o (như khi vẽ em bé): hàng, khung ảnh AI và điểm neo của khung đó (toạ độ tính từ chân), để vũ khí
  // chỉnh theo đúng khung ảnh AI. null: nhân vật chưa có tệp ghép chỉnh vũ khí, hoặc không dùng thân AI (khi đó game làm y như cũ).
  // Phiên 3: đang ở hàng đòn theo vũ khí thì luôn trả về (kể cả khi chưa có tệp ghép), kèm bàn tay trước tự đo (SC.diemKhung).
  SC.khungVk = function (o) {
    const key = o && o.key, g = SC.ghep[key], coVk = !!(g && g.coVk);
    if (!G.tinhLinh || !coVk) return null;
    const sp = SC.cuaEmBe(key, o);
    if (!sp || !sp.img) return null;
    try {
      const s = SC.chonEmBe(sp, o);
      const da = SC.diemKhung(sp, key, s.ten, s.i, SC.khopEmBe(sp, s.ten, s.i));
      return { ten: s.ten, i: s.i, diem: da ? da.diem : null, mat: G.KIEM_KHOP ? SC.matKhung(sp, s.ten, s.i) : null };
    } catch (e) { return null; }
  };
  // ---------- VẬT PHẨM ----------
  SC.vatPham = (kind) => (kind ? doSan('vp-' + kind) : null);
  // Vẽ vật phẩm vừa trong ô vuông size, tâm (cx, cy).
  SC.veVatPham = function (c, sp, cx, cy, size) {
    const w = sp.rong, h = sp.cao; let k = size / Math.max(w, h); if (k >= 1) k = Math.floor(k);
    const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
    c.drawImage(sp.img, Math.round(cx - (w * k) / 2), Math.round(cy - (h * k) / 2), Math.round(w * k), Math.round(h * k));
    c.imageSmoothingEnabled = sm;
  };
  let lanNoi = 0;
  function noiVatPham() {
    const T = G.theme;
    if (!T || !T.resIcon) { if (lanNoi++ < 50 && typeof setTimeout !== 'undefined') setTimeout(noiVatPham, 50); return; }
    if (T._spriteCustom) return;
    T._spriteCustom = true;
    const res0 = T.resIcon;
    T.resIcon = function (kind, x, y, h) {
      const sp = SC.vatPham(kind); if (!sp) return res0.apply(this, arguments);
      h = h || 7; SC.veVatPham(G.ux, sp, x + h / 2, y + h / 2, h);
    };
  }

  // ---------- GIAO DIỆN (ảnh AI cho bản đồ, nút…; tools/tach-giao-dien) ----------
  // Tệp: { "doi_tuong": "giao-dien", "ma": "gd-<tên>", "anh": "data:image/png;base64,…", "net": 2, "vien": [trên, phải, dưới, trái] }
  //   anh: MỘT ảnh tĩnh, số điểm ảnh gấp net lần cỡ game.   vien (tuỳ chọn, điểm ảnh GAME): cắt 9 mảnh, bốn góc giữ nguyên cỡ,
  //   cạnh và ruột kéo giãn (khung bản đồ to).
  // Mã đang dùng (js/minimap.js): gd-phong-<loại phòng> (12 biểu tượng), gd-o-phong, gd-o-phong-cur, gd-loi-noi, gd-khung-ban-do.
  // Không có tệp gd-* nào thì game vẽ bằng code y như cũ.
  SC.gd = {};
  function themGd(tep) {
    if (!/^gd-[a-z0-9_-]+$/.test(tep.ma)) throw new Error('mã giao diện phải là gd-<tên>');
    const g = { ma: tep.ma, ten: String(tep.ten || tep.ma), doi: 'giao-dien', net: docNet(tep.net), rong: 0, cao: 0, pw: 0, ph: 0, img: null, ready: false, vien: null, ghep9: new Map() };
    if (Array.isArray(tep.vien) && tep.vien.length === 4 && tep.vien.every((v) => isFinite(+v) && +v >= 0)) {
      g.vien = tep.vien.map((v) => Math.min(400, Math.round(+v)));
      if (!g.vien.some((v) => v > 0)) g.vien = null;
    }
    g.lap = tep.lap_canh === true && !!g.vien; // 14/10: "lap_canh": cạnh và lòng 9 mảnh LẶP (hoa văn không bị kéo dãn), góc giữ nguyên
    const xong = (src) => {
      g.img = src; g.pw = src.width; g.ph = src.height; g.rong = Math.max(1, Math.round(src.width / g.net)); g.cao = Math.max(1, Math.round(src.height / g.net));
      g.ghep9.clear(); g.ready = true;
    };
    SC.gd[g.ma] = g;
    if (tep.anhCanvas && tep.anhCanvas.getContext) xong(tep.anhCanvas); // công cụ đưa thẳng canvas (vẽ ngay, không chờ)
    else {
      if (!SC.laAnh(tep.anh)) { delete SC.gd[g.ma]; throw new Error('thiếu ảnh'); }
      if (typeof Image !== 'undefined') { const img = new Image(); img.onload = () => xong(img); img.onerror = () => { SC.loi.push(g.ma + ': ảnh hỏng'); if (SC.gd[g.ma] === g) delete SC.gd[g.ma]; }; SC.napAnh(img, tep.anh); }
    }
    return g;
  }
  SC.gdSan = (ma) => { const g = SC.gd[ma]; if (g && !g.ready && roiCan) roiCan(ma); return g && g.ready ? g : null; };
  // 16/10 (ve-tay-8-gop-giao-dien): ảnh THAY hình vẽ code — có ảnh và không ?vecode=1 (G.VE_CODE) thì trả ảnh, không thì null (nơi gọi vẽ code y cũ).
  SC.gdThay = (ma) => (G.VE_CODE === true ? null : SC.gdSan(ma));
  // Bản nhuộm của ảnh giao diện: điểm có màu gần `tu` (lòng ảnh) đổi thành màu `den` — dùng như ảnh gốc với SC.veGd (giữ vien / 9 mảnh).
  const NHUOM = new Map();
  SC.gdNhuom = function (g, tu, den) {
    if (!g || !g.ready || !den || den === tu) return g;
    const key = g.ma + '|' + den;
    let o = NHUOM.get(key);
    if (o && o.img0 === g.img) return o;
    const cv = document.createElement('canvas'); cv.width = g.pw; cv.height = g.ph;
    const x = cv.getContext('2d'); x.drawImage(g.img, 0, 0);
    try {
      const id = x.getImageData(0, 0, g.pw, g.ph), d = id.data, hx = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16)), A = hx(tu), B = hx(den);
      for (let i = 0; i < d.length; i += 4) if (d[i + 3] && Math.abs(d[i] - A[0]) + Math.abs(d[i + 1] - A[1]) + Math.abs(d[i + 2] - A[2]) < 60) { d[i] = B[0]; d[i + 1] = B[1]; d[i + 2] = B[2]; }
      x.putImageData(id, 0, 0);
    } catch (e) { return g; }
    o = Object.assign({}, g, { img: cv, img0: g.img, ghep9: new Map() });
    if (NHUOM.size > 16) NHUOM.clear();
    NHUOM.set(key, o);
    return o;
  };
  // Ảnh 9 mảnh dựng sẵn cho cỡ đích (w x h điểm ảnh game): một canvas w*net x h*net, nhớ lại để lần sau vẽ một phát.
  function gdGhep9(g, w, h) {
    const N = g.net, W = Math.max(1, Math.round(w * N)), H = Math.max(1, Math.round(h * N)), key = W + 'x' + H;
    let cv = g.ghep9.get(key); if (cv) return cv;
    if (g.ghep9.size > 6) g.ghep9.clear();
    cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
    // viền theo điểm ảnh THẬT; chật quá thì thu viền cho vừa
    let t = g.vien[0] * N, r = g.vien[1] * N, b = g.vien[2] * N, l = g.vien[3] * N;
    const giu = (a, b2, max, src) => { const m = Math.min(max, src - 1); if (a + b2 > m) { const k = m / (a + b2); return [Math.floor(a * k), Math.floor(b2 * k)]; } return [a, b2]; };
    [l, r] = giu(l, r, W, g.pw); [t, b] = giu(t, b, H, g.ph);
    const sx = [0, l, g.pw - r], sw = [l, g.pw - l - r, r], dx = [0, l, W - r], dw = [l, W - l - r, r];
    const sy = [0, t, g.ph - b], sh = [t, g.ph - t - b, b], dy = [0, t, H - b], dh = [t, H - t - b, b];
    for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
      if (!(sw[i] > 0 && sh[j] > 0 && dw[i] > 0 && dh[j] > 0)) continue;
      if (!g.lap || (i !== 1 && j !== 1)) { c.drawImage(g.img, sx[i], sy[j], sw[i], sh[j], dx[i], dy[j], dw[i], dh[j]); continue; }
      // 14/10 "lap_canh": mảnh cạnh / lòng lát lặp theo chiều dài (mảnh cuối cắt bớt), chiều kia giữ cỡ mảnh như góc
      const tw = i === 1 ? sw[1] : dw[i], th = j === 1 ? sh[1] : dh[j];
      for (let yy = 0; yy < dh[j]; yy += th) for (let xx = 0; xx < dw[i]; xx += tw) {
        const ww = Math.min(tw, dw[i] - xx), hh = Math.min(th, dh[j] - yy);
        c.drawImage(g.img, sx[i], sy[j], i === 1 ? ww : sw[i] * ww / tw, j === 1 ? hh : sh[j] * hh / th, dx[i] + xx, dy[j] + yy, ww, hh);
      }
    }
    g.ghep9.set(key, cv);
    return cv;
  }
  // Vẽ ảnh giao diện vào ô (x, y, w, h) theo toạ độ đang dùng của bút c. Có "vien" thì cắt 9 mảnh, không thì kéo giãn cả ảnh.
  // Phóng to thì giữ điểm ảnh sắc cạnh; thu nhỏ hơn ảnh gốc thì làm mịn để không rụng nét.
  SC.veGd = function (c, g, x, y, w, h) {
    if (!g || !g.ready || w <= 0 || h <= 0) return false;
    const src = g.vien && (Math.abs(w - g.rong) > 0.01 || Math.abs(h - g.cao) > 0.01) ? gdGhep9(g, w, h) : g.img;
    const us = c === G.ux ? G.uiScale || 1 : c === G.wx ? G.NET || 1 : 1, sm = c.imageSmoothingEnabled;
    c.imageSmoothingEnabled = w * us < src.width - 0.5 || h * us < src.height - 0.5;
    c.drawImage(src, x, y, w, h);
    c.imageSmoothingEnabled = sm;
    return true;
  };

  // Hàm vẽ bằng code (bỏ qua hình tự vẽ), cho công cụ so sánh.
  if (G.monsterArt && !G.monsterArt.drawCode) G.monsterArt.drawCode = G.monsterArt.draw;
  if (G.art && G.art.hero && !G.art.heroCode) G.art.heroCode = G.art.hero;
  SC.noi = true;

  // ---------- ẢNH TẢI SAU (Đợt 10, quyết định Q5) ----------
  // Bản đóng gói 2 tệp (python3 game/build.py --hai-tep): trang chỉ nhúng phần ảnh BẮT BUỘC cho màn chào / làng / ải 1; phần còn lại
  // (quái, trùm, vũ khí các dòng, hiệu ứng theo hệ…) nằm trong tệp linh-khi-anh.<mã>.json đặt cạnh trang. build.py ghi G.ANH_SAU = { tep, so, byte }.
  // - js/engine.js gọi SC.napSau() ngay sau khi khung hình đầu (màn chào) đã vẽ, rồi vẽ một chỉ báo nhỏ ở góc trong lúc tải (SC.sau).
  // - Tệp là mảng JSON MỖI HÌNH MỘT DÒNG: dòng nào về tới thì nhận hình đó luôn (SC.add như hình nhúng), không chờ cả tệp.
  // - Tải hỏng (mất mạng, 404, tệp cụt, nội dung lạ): GIỮ phần đã nhận, không báo lỗi lên màn chơi, ghi console.info, thử lại 2 lần (sau 3 giây và 10 giây).
  //   Vẫn không được thì thôi: hình thiếu vẽ bằng code như khi chưa có ảnh AI. Có mạng trở lại thì thử thêm một lượt.
  // - Bản một tệp, công cụ Xưởng Sprite, bản thử: không có G.ANH_SAU → không làm gì (SC.sau.tt = 'khong').
  // SC.sau.tt: 'khong' không có tệp phụ · 'cho' chưa bắt đầu · 'tai' đang tải · 'thu-lai' đang chờ thử lại · 'xong' · 'loi' (đã thôi).
  const KS = G.ANH_SAU && typeof G.ANH_SAU.tep === 'string' && /^[A-Za-z0-9._-]{1,80}$/.test(G.ANH_SAU.tep) ? G.ANH_SAU : null;
  const AS = (SC.sau = { tt: KS ? 'cho' : 'khong', tep: KS ? KS.tep : '', xong: 0, tong: KS ? KS.so | 0 : 0, lan: 0, loi: '', hetLuc: 0 });
  const CHO_THU = [3000, 10000], IM_LANG = 30000; // IM_LANG: quá 30 giây không thêm byte nào thì coi lượt đó hỏng
  if (G.ngonNgu && G.ngonNgu.them) G.ngonNgu.them({ 'Đang tải thêm ảnh… {0}%': 'Loading more art… {0}%', 'Mạng yếu: thiếu vài ảnh, game vẫn chơi bình thường': 'Weak network: some art is missing, the game still plays fine' });
  const ghi = (s) => { try { if (typeof console !== 'undefined' && console.info) console.info('[Linh Khí] ' + s); } catch (e) { /* bỏ qua */ } };
  const nghi = (ms) => new Promise((r) => setTimeout(r, ms));
  const daNhan = new Set();
  // Hình tải sau sẵn sàng muộn hơn lúc game đã vẽ: xoá các hình đã nhớ (em bé + đồ, vật rơi, vỏ phòng, mảnh giao diện) để dựng lại với ảnh mới.
  function xoaNhoSau(het) {
    xoaNhoDo();
    if (!het) return;
    try { if (G.roomArt && G.roomArt.xoaDem) G.roomArt.xoaDem(); } catch (e) { /* bỏ qua */ }
    try { if (G.theme && G.theme.clearCache) G.theme.clearCache(); } catch (e) { /* bỏ qua */ }
  }
  function demSan() { let n = 0; for (const k in SC.ds) if (SC.ds[k].ready) n++; for (const k in SC.do) if (SC.do[k].ready) n++; return n; }
  function nhanDong(s) {
    s = s.trim();
    if (!s || s === '[' || s === ']') return;
    if (s.charCodeAt(s.length - 1) === 44) s = s.slice(0, -1); // dấu phẩy cuối dòng
    let t; try { t = JSON.parse(s); } catch (e) { throw new Error('dòng hỏng hoặc tệp cụt'); } // dòng hỏng: cả lượt tải coi như hỏng (phần đã nhận vẫn giữ)
    if (!t || typeof t !== 'object' || typeof t.ma !== 'string') throw new Error('dòng không phải hình');
    if (daNhan.has(t.ma)) return; // lượt thử lại: hình đã nhận rồi thì bỏ qua
    daNhan.add(t.ma);
    trongNapSau = true; // V3: ảnh của dòng này giải mã ngoài luồng chính (SC.napAnh)
    try { SC.add(t); } finally { trongNapSau = false; }
    AS.xong = daNhan.size;
    return true;
  }
  // V3: chờ tới sau khung hình kế tiếp (đã vẽ xong), để mỗi khung chỉ nhận vài hình; trang ẩn (không có khung) thì chờ 100 ms.
  const choKhung = () => new Promise((r) => {
    let xong = false; const f = () => { if (!xong) { xong = true; r(); } };
    try { requestAnimationFrame(() => setTimeout(f, 0)); } catch (e) { /* bỏ qua */ }
    setTimeout(f, 100);
  });
  async function taiMotLuot() {
    const ngat = typeof AbortController !== 'undefined' ? new AbortController() : null;
    let hen = 0;
    const canh = () => { clearTimeout(hen); if (ngat) hen = setTimeout(() => ngat.abort(), IM_LANG); };
    try {
      canh();
      const res = await fetch(AS.tep, ngat ? { signal: ngat.signal } : undefined);
      if (!res.ok) throw new Error('máy chủ trả ' + res.status);
      let du = '', dau = false, moc = Date.now(), soHinh = 0;
      const nhan = async (chu, het) => {
        du += chu;
        const ds = du.split('\n'); du = het ? '' : ds.pop();
        for (const d of ds) {
          if (!dau && d.trim()) { dau = true; if (d.trim() !== '[') throw new Error('nội dung không phải tệp ảnh'); } // ví dụ sw.js trả trang HTML khi mất mạng
          const moi = nhanDong(d);
          if (G.NAP_SAU_MOI) { // V3: mỗi khung nhiều nhất 3 hình hoặc 5 ms, rồi nhường cho khung hình sau
            if (moi) soHinh++;
            if (soHinh >= 3 || Date.now() - moc > 5) { await choKhung(); moc = Date.now(); soHinh = 0; }
          } else if (Date.now() - moc > 6) { await nghi(0); moc = Date.now(); } // nhường khung hình: không làm giật game đang chạy
        }
      };
      if (res.body && res.body.getReader && typeof TextDecoder !== 'undefined') {
        const doc = res.body.getReader(), giai = new TextDecoder();
        for (;;) { const { done, value } = await doc.read(); if (done) break; canh(); await nhan(giai.decode(value, { stream: true }), false); }
        await nhan(giai.decode(), true);
      } else await nhan(await res.text(), true);
      if (daNhan.size < AS.tong) throw new Error('tệp cụt: mới có ' + daNhan.size + '/' + AS.tong + ' hình');
    } finally { clearTimeout(hen); }
  }
  // Máy đã lưu tệp ảnh của bản cũ (sw.js lưu mọi tệp để chơi khi mất mạng): xoá để không đầy máy. Chỉ đụng tệp linh-khi-anh.* khác tên hiện tại.
  function donBanCu() {
    try {
      if (typeof caches === 'undefined' || !caches.keys) return;
      caches.keys().then((ten) => ten.forEach((n) => caches.open(n).then((c) => c.keys().then((ks) => ks.forEach((k) => {
        if (/\/linh-khi-anh\.[0-9a-f]+\.json(\?|$)/.test(k.url) && k.url.indexOf('/' + AS.tep) < 0) c.delete(k);
      }))))).catch(() => {});
    } catch (e) { /* bỏ qua */ }
  }
  let dangChay = false;
  async function chayNapSau() {
    if (dangChay) return;
    dangChay = true;
    let san = -1;
    napSauDangChay = true;
    // Cách cũ (tắt V3): cứ 400 ms có hình mới là xoá hình đã nhớ của em bé + đồ. V3: chỉ xoá khi hình mới đang được dùng (xoaNhoDoKhiCan).
    const theoDoi = G.NAP_SAU_MOI ? 0 : setInterval(() => { const n = demSan(); if (n !== san) { san = n; xoaNhoSau(false); } }, 400);
    try {
      for (let lan = 0; lan <= CHO_THU.length; lan++) {
        AS.lan++; AS.tt = 'tai';
        try {
          await taiMotLuot();
          AS.tt = 'xong'; AS.loi = '';
          ghi('Đã tải xong ' + AS.tong + ' ảnh tải sau (' + AS.tep + ').');
          donBanCu();
          break;
        } catch (e) {
          AS.loi = String((e && e.message) || e);
          ghi('Chưa tải được tệp ảnh ' + AS.tep + ' (lượt ' + AS.lan + '): ' + AS.loi + '. Đã nhận ' + daNhan.size + '/' + AS.tong + ' hình; game vẫn chạy, hình thiếu vẽ bằng code.');
        }
        if (lan < CHO_THU.length) { AS.tt = 'thu-lai'; await nghi(CHO_THU[lan]); }
      }
      if (AS.tt !== 'xong') {
        AS.tt = 'loi'; AS.hetLuc = Date.now();
        ghi('Thôi không tải tệp ảnh nữa (đã thử ' + AS.lan + ' lượt). Mở lại game khi mạng tốt hơn để có đủ ảnh.');
        try { window.addEventListener('online', () => { chayNapSau(); }, { once: true }); } catch (e) { /* bỏ qua */ }
      }
    } finally {
      dangChay = false;
      // ảnh còn giải mã thêm vài nhịp sau khi dòng cuối về: theo dõi thêm 3 giây rồi xoá hình đã nhớ một lần cuối
      setTimeout(() => { clearInterval(theoDoi); napSauDangChay = false; xoaNhoSau(true); }, 3000);
    }
  }
  // Gọi nhiều lần cũng chỉ chạy một lần. Không có tệp phụ, hoặc trình duyệt không có fetch (rất cũ): không làm gì.
  SC.napSau = function () {
    if (roiMo) { roiMo(); return; } // bản ảnh rời: màn chào đã vẽ → tải nốt phần còn lại theo ưu tiên
    if (!KS || AS.tt !== 'cho') return;
    if (typeof fetch !== 'function' || typeof Promise === 'undefined') { AS.tt = 'loi'; AS.loi = 'trình duyệt không có fetch'; AS.hetLuc = Date.now(); ghi('Trình duyệt không tải được tệp ảnh rời: hình thiếu vẽ bằng code.'); return; }
    chayNapSau().catch((e) => { AS.tt = 'loi'; AS.loi = String((e && e.message) || e); AS.hetLuc = Date.now(); });
  };
  // ---------- ƯU TIÊN ẢNH TRÙM VÙNG (phiên kiểm 3 pha trùm, 12/10) ----------
  // Phản hồi chơi trên iPhone: "đánh thử trùm chỉ mới thấy 1 pha". Dáng pha 2, 3 (<trùm>-p2 / -p3) nằm giữa tệp ảnh tải sau 20 MB (từ ~9 MB trở đi):
  // mạng chậm, hoặc lượt tải bị ngắt (khoá máy, chuyển ứng dụng, Safari nạp lại trang khi thiếu bộ nhớ) thì trùm chỉ có hình pha 1, và sau 3 lượt hỏng
  // game thôi tải luôn tới khi mở lại. Nay:
  //  - stage.js gọi SC.uuTienTrum(<mã trùm>) khi vào MỘT ẢI của vùng (và khi vào phòng trùm): ảnh trùm (pha 1, 2, 3) chưa về thì tải RIÊNG mấy dòng đó
  //    của tệp ảnh (yêu cầu Range theo vị trí byte build.py ghi ở G.ANH_SAU.trum), không chờ cả tệp. Máy chủ không hỗ trợ Range (trả 200): thôi, để lượt
  //    tải thường lo như cũ (không tải thừa: ngắt ngay).
  //  - Lượt tải thường đã thôi (tt 'loi'): vào ải hoặc quay lại trang (visibilitychange) thì thử tải lại (phần đã nhận vẫn giữ).
  // Tắt: G.UU_TIEN_TRUM = false hoặc ?uutien=0.
  if (G.UU_TIEN_TRUM === undefined) { let tat = false; try { tat = typeof location !== 'undefined' && /[?&]uutien=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; } G.UU_TIEN_TRUM = !tat; }
  const VT_TRUM = KS && KS.trum && typeof KS.trum === 'object' ? KS.trum : null, dangUu = {};
  SC.uu = { lan: 0, dong: 0, loi: '' }; // cho kiểm thử
  function thuLaiNeuThoi() { if (G.UU_TIEN_TRUM && KS && AS.tt === 'loi' && !dangChay) { AS.tt = 'cho'; SC.napSau(); } }
  try { if (typeof document !== 'undefined' && document.addEventListener) document.addEventListener('visibilitychange', () => { if (!document.hidden) thuLaiNeuThoi(); }); } catch (e) { /* bỏ qua */ }
  SC.uuTienTrum = function (ma, phongTrum) {
    if (!G.UU_TIEN_TRUM) return false;
    // Bản ảnh rời (Tải nhanh 12/10, mặc định trên web): hàng chờ đã tự ưu tiên trùm + dáng pha khi vào ải 4–5. Thêm: VÀO PHÒNG TRÙM thì
    // báo "đang cần" cả 3 dáng (tải trước mọi thứ khác), và ảnh trùm nào đã tải hỏng thì thử lại ngay (trước đây chỉ thử lại khi có sự kiện 'online').
    if (roiCan) {
      if (!phongTrum || typeof ma !== 'string') return false;
      const ds = [ma, ma + '-p2', ma + '-p3'];
      if (SC.roiThuLai) SC.roiThuLai((m) => ds.indexOf(m) >= 0);
      for (const k of ds) if (SC.ds[k] && !SC.ds[k].ready) roiCan(k);
      return true;
    }
    if (!KS) return false;
    thuLaiNeuThoi();
    if (!VT_TRUM || typeof ma !== 'string' || dangUu[ma] || typeof fetch !== 'function') return false;
    let a = Infinity, b = -1;
    for (const k of [ma, ma + '-p2', ma + '-p3']) {
      const v = VT_TRUM[k];
      if (!Array.isArray(v) || daNhan.has(k) || !(v[0] >= 0 && v[1] > v[0])) continue;
      a = Math.min(a, v[0]); b = Math.max(b, v[1]);
    }
    if (b < 0) return false; // đã có đủ (hoặc tệp không có ảnh trùm này)
    dangUu[ma] = true; SC.uu.lan++;
    const ngat = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const hen = setTimeout(() => { if (ngat) ngat.abort(); }, 60000);
    fetch(AS.tep, { headers: { Range: 'bytes=' + a + '-' + (b - 1) }, signal: ngat ? ngat.signal : undefined }).then(async (res) => {
      if (res.status !== 206) { // không hỗ trợ Range (hoặc bản lưu của sw.js trả cả tệp): để lượt tải thường lo
        SC.uu.loi = 'máy chủ trả ' + res.status;
        try { if (ngat) ngat.abort(); else if (res.body && res.body.cancel) res.body.cancel(); } catch (e) { /* bỏ qua */ }
        return;
      }
      const ds = (await res.text()).split('\n');
      for (const d of ds) {
        try { if (nhanDong(d)) { SC.uu.dong++; await choKhung(); } } catch (e) { /* dòng cụt ở mép: lượt tải thường sẽ nhận */ }
      }
      ghi('Đã tải trước ảnh trùm ' + ma + ' (' + Math.round((b - a) / 1024) + ' KB).');
    }).catch((e) => { SC.uu.loi = String((e && e.message) || e); }).finally(() => { clearTimeout(hen); dangUu[ma] = false; });
    return true;
  };
  // Chỉ báo nhỏ ở góc (js/engine.js gọi sau khi vẽ xong cảnh): { pct } đang tải; { loi: true } vừa thôi (hiện 6 giây); null: không vẽ gì.
  SC.sauChiBao = function () {
    if (AS.tt === 'tai' || AS.tt === 'thu-lai') return { pct: AS.tong > 0 ? Math.min(99, Math.floor(AS.xong / AS.tong * 100)) : 0 };
    if (AS.tt === 'loi' && AS.hetLuc && Date.now() - AS.hetLuc < 6000) return { loi: true };
    return null;
  };
  // ---------- ẢNH RỜI, WebP, TẢI THEO NHU CẦU (tải nhanh 12/10) ----------
  // Bản 2 tệp mặc định (game/build.py anh_roi): trang chỉ có THÔNG SỐ các hình; mỗi ảnh là một tệp rời cạnh trang:
  //   anh/<mã>.<mã nội dung>.png (luôn có) và anh/<mã>.<mã nội dung>.webp (WebP lossless, điểm ảnh y hệt, khi nhỏ hơn PNG).
  // - Kiểm một lần lúc khởi động trình duyệt có đọc được WebP không (ảnh 1×1); không đọc được, hoặc ?webp=0, hoặc tệp .webp hỏng: tải .png.
  // - Thứ tự tải (nhỏ trước trong cùng bậc): hình game đang cần vẽ mà chưa có (SC.get, MA.draw, đồ, giao diện, hiệu ứng gọi roiCan) →
  //   hình cho màn chào / làng (_u[0] = 0, tải ngay khi trang chạy) → quái vùng đang chơi (vùng của ải vừa vào, hoặc vùng xa nhất đã tới),
  //   trùm + dáng pha vùng đó khi vào ải 4–5 → hiệu ứng, vũ khí, thân em bé theo bộ → quái vùng khác → trùm vùng khác (nền, sau cùng).
  //   Ngoài hình màn chào / làng, chỉ bắt đầu sau khi màn chào đã vẽ (js/engine.js gọi SC.napSau).
  // - Cùng lúc nhiều nhất 24 tệp (hình màn chào / làng / đang cần) hoặc 16 (phần còn lại; trùm / vùng khác: 3), ảnh giải mã ngoài luồng
  //   chính (img.decode), báo cho game theo từng đợt ngắn (không làm trễ chạm). Chưa về thì game vẽ bằng code như khi chưa có ảnh AI.
  // - Tệp hỏng / mất mạng: thử lại sau 3 và 10 giây, vẫn hỏng thì thôi (hình đó vẽ code), có mạng lại thì thử thêm.
  // Tắt khi đóng gói: LK_ANH_ROI=0 (về tệp linh-khi-anh.<mã>.json như Đợt 10).
  const ROI = G.ANH_ROI && typeof G.ANH_ROI === 'object' && Array.isArray(G.customSpriteData) ? G.ANH_ROI : null;
  let roiMo = null;
  // 14/10 (bước 1 làm chắc, mục 1): TẢI THEO VÙNG. Ảnh riêng một vùng (_u[4] = 1, game/build.py vung_rieng: quái, trùm + dáng pha, sàn / tường,
  // cửa, vật trang trí của Rừng già / Hang biển / Lâu đài cổ) KHÔNG tải ở màn chào. Chọn một ải trên bản đồ (SC.taiVung) hoặc vào ải thì mới tải
  // vùng đó; vùng chưa đủ ảnh thì thẻ ải hiện "Đang tải…" và vào ải phải chờ (màn chờ G.ChoVung), không vẽ hình code thay. Tải xong vùng đang chọn
  // và hết việc khác thì tải trước vùng kế tiếp. Hình game cần vẽ ngay (roiCan, ví dụ quái ở trang Ông Từ) vẫn tải ngay như cũ.
  // Tắt: ?taivung=0 hoặc G.TAI_VUNG = false (tải mọi ảnh sau màn chào như 12/10).
  if (G.TAI_VUNG === undefined) { let tat = false; try { tat = typeof location !== 'undefined' && /[?&]taivung=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; } G.TAI_VUNG = !tat; }
  SC.taiVung = () => {};
  SC.vungTien = () => ({ san: true, xong: 0, tong: 0, loi: 0 });
  G.choVung = function (r, trum, fn) { return fn(); };
  if (ROI) {
    const bayGio = () => { try { return Math.round(performance.now()); } catch (e) { return 0; } }; // mốc thời gian từng ảnh (cho bài đo tải)
    const theoSrc = new Map(), theoMa = new Map(), hang = [], choApDung = [], hongDs = [];
    // Firebase phục vụ HTTP/2 (nhiều tệp cùng lúc trên một kết nối): hình màn chào / làng và hình đang cần tải 24 tệp một lúc,
    // phần còn lại 16 (trong đó vùng khác / trùm nền nhiều nhất 3) để hình cần ngay không phải xếp hàng sau tệp lớn.
    const MAX_GAP = 24, MAX = 16, MAX_THAP = 3, WEBP_THU = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    let webpHong = 0, dang = 0, dangThap = 0, dangGap = 0, choThu = 0, mo = false, coWebp = null, vung = -1, trumMo = false, daXong = 0, ketThuc = false, henGd = 0, keoHen = false;
    const moVung = (G.REGIONS || [0, 0, 0]).map(() => 0); // tải theo vùng: 0 chưa mở, 1 tải trước (rảnh), 2 người chơi đã chọn vùng (vùng 4: 4 ô)
    // Vùng 4 còn mượn hình của vùng khác (G.VUNG4_MUON, bước 3 phiên 1): chọn vùng 4 thì tải luôn ảnh vùng mượn, chờ đủ cả hai.
    const vungMuon = (r) => (r === 3 && G.VUNG4_MUON != null && G.VUNG4_MUON !== r ? G.VUNG4_MUON : -1);
    let vungChon = -1;
    for (const t of G.customSpriteData) { const src = t && (t.tam || t.anh); if (typeof src === 'string' && Array.isArray(t._u)) theoSrc.set(src, t); }
    AS.tt = 'cho'; AS.tep = 'anh/'; AS.tong = 0; AS.xong = 0;
    SC.roi = { get webp() { return coWebp; }, hang: () => hang.length, dang: () => dang, xong: () => daXong, loi: () => hongDs.length, ds: theoMa };
    let tatWebp = false;
    try { tatWebp = typeof location !== 'undefined' && /[?&]webp=0(&|$)/.test(location.search || ''); } catch (e) { tatWebp = false; }
    if (G.ANH_WEBP === false || tatWebp || !ROI.webp || typeof Image === 'undefined') coWebp = false;
    else {
      try {
        const th = new Image();
        th.onload = () => { if (coWebp === null) { coWebp = th.width === 1; bom(); } };
        th.onerror = () => { if (coWebp === null) { coWebp = false; bom(); } };
        th.src = WEBP_THU;
        setTimeout(() => { if (coWebp === null) { coWebp = false; bom(); } }, 3000);
      } catch (e) { coWebp = false; }
    }
    // Vùng người chơi đang ở: vùng của ải vừa vào (G.startStage), chưa vào ải thì vùng xa nhất đã có sao (qua ải 5 thì vùng kế).
    const vungNay = () => {
      if (vung >= 0) return vung;
      try { let r = 0; const st = G.save && G.save.stars; if (st) for (const k in st) { const m = /^(\d+)-(\d+)$/.exec(k); if (m) r = Math.max(r, +m[1] + (+m[2] >= 4 ? 1 : 0)); } return Math.min(moVung.length - 1, r); } catch (e) { return 0; }
    };
    roiNhan = function (img, src) {
      const t = theoSrc.get(src);
      if (!t || typeof src !== 'string') return false;
      theoSrc.delete(src);
      const u = t._u;
      const ma = G.ANH_MUOT_CU && typeof t.muot_cua === 'string' ? t.muot_cua : G.NET_CU && typeof t.net_cua === 'string' ? t.net_cua : t.ma; // ?anhmuotcu=1 / ?netcu=1: tấm cũ mang mã gốc
      const it = { img, ma, png: src, webp: typeof t.webp === 'string' && /^anh\/[A-Za-z0-9_.-]{1,90}\.webp$/.test(t.webp) ? t.webp : null,
        bac: u[0] | 0, co: +u[1] || 0, vung: u[2] | 0, trum: !!u[3], khoa: !!(G.TAI_VUNG && u[4] && (u[2] | 0) >= 0 && (u[2] | 0) <= 3), can: 0, lan: 0, xong: img.onload, hong: img.onerror, dangTai: false, thap: false, ve: false, boWebp: false };
      img.onload = null; img.onerror = null;
      theoMa.set(ma, it); hang.push(it); AS.tong++;
      napSauDangChay = true; // hình em bé / đồ về muộn: chỉ xoá hình đã nhớ khi đang dùng (xoaNhoDoKhiCan), như lúc nạp tệp tải sau
      bom();
      return true;
    };
    roiCan = function (ma) {
      const it = theoMa.get(ma);
      if (!it || it.can || it.ve) return;
      it.can = 1;
      if (!it.dangTai) bom();
    };
    // Gọi nhiều lần trong cùng một nhịp (nhiều ảnh về cùng lúc) chỉ xếp lượt một lần.
    let bomHen = false;
    function bom() {
      if (bomHen) return;
      bomHen = true;
      setTimeout(() => { bomHen = false; bom0(); }, 0);
    }
    function bom0() {
      if (coWebp === null) return; // chờ kiểm WebP (vài mili giây)
      if (dang < MAX_GAP && hang.length) {
        const v = vungNay(), uu = (it) => (it.can ? 0 : it.khoa ? uuVung(it) : it.bac === 0 ? 1 : it.bac === 2 ? (it.vung === v ? 2 : 4) : it.bac === 3 ? (trumMo && it.vung === v ? 2 : 5) : 3);
        for (const it of hang) it.u = uu(it);
        hang.sort((a, b) => a.u - b.u || a.co - b.co);
        // trước màn chào, hoặc còn hình màn chào / làng / hình đang cần chưa về: chỉ tải các hình đó (cả đường truyền cho chúng)
        const conGap = dangGap > 0 || hang[0].u <= 1;
        const bo = [];
        while (dang < MAX_GAP && hang.length) {
          const it = hang.shift();
          if (it.u >= 90) { bo.push(it); break; } // ảnh riêng của vùng chưa mở: chưa tải (đã xếp cuối hàng)
          if (it.u > 1 && (!mo || conGap || dang >= MAX)) { bo.push(it); break; } // đã xếp theo ưu tiên: các hình sau cũng không được tải lúc này
          if (it.u >= 4 && dangThap >= MAX_THAP) { bo.push(it); continue; }
          tai(it, it.u >= 4, it.u <= 1);
        }
        if (bo.length) hang.unshift(...bo);
      }
      taiTruocKhiRanh();
      capNhat();
    }
    // Ưu tiên ảnh riêng vùng: vùng đã chọn (quái, nền) ngang quái vùng đang chơi; trùm vùng sau phần còn lại (ngay khi vào ải 4–5);
    // vùng tải trước: bậc thấp (nhiều nhất 3 tệp một lúc); vùng chưa mở: 99 (không tải).
    function uuVung(it) {
      const m = moVung[it.vung];
      if (m === 2) return it.trum ? (trumMo && it.vung === vung ? 2 : 3) : 2;
      if (m === 1) return it.trum ? 6 : 5;
      return 99;
    }
    // Hết việc (không còn ảnh nào đang tải / chờ thử lại / chờ nhận) → mở tải trước vùng kế tiếp của vùng vừa chọn.
    function taiTruocKhiRanh() {
      if (!mo || !G.TAI_VUNG || vungChon < 0 || dang || choThu || choApDung.length) return;
      for (const it of hang) if ((it.u == null ? 0 : it.u) < 90) return;
      const k = vungChon + 1;
      if (k < moVung.length && !moVung[k]) { moVung[k] = 1; ketThuc = false; napSauDangChay = true; ghi('Rảnh: tải trước ảnh vùng ' + (k + 1) + '.'); bom(); }
    }
    SC.taiVung = function (r) {
      r = r | 0;
      if (!G.TAI_VUNG || r < 0 || r >= moVung.length) return;
      const m = vungMuon(r);
      if (vungChon !== r || moVung[r] !== 2 || (m >= 0 && moVung[m] !== 2)) { vungChon = r; moVung[r] = 2; if (m >= 0) moVung[m] = 2; ketThuc = false; napSauDangChay = true; bom(); }
    };
    // Tiến độ ảnh riêng của vùng r (trum: tính cả trùm vùng và dáng pha). san: đủ ảnh để vào ải.
    SC.vungTien = function (r, trum) {
      let xong = 0, tong = 0, loi = 0;
      const m = vungMuon(r);
      if (G.TAI_VUNG) for (const it of theoMa.values()) {
        if (!it.khoa || (it.vung !== r && it.vung !== m) || (it.trum && !trum)) continue;
        tong++; if (it.ve) xong++; else if (hongDs.indexOf(it) >= 0) loi++;
      }
      return { san: xong >= tong, xong, tong, loi, pct: tong ? Math.floor(xong / tong * 100) : 100 };
    };
    // Màn chờ ảnh vùng: vào ải khi vùng chưa đủ ảnh thì đứng ở đây (thanh "Đang tải…"), đủ ảnh thì vào luôn. Không vẽ hình code thay ảnh.
    let cho = null;
    G.ChoVung = {
      enter() {},
      update() {
        if (!cho) return;
        const tt = SC.vungTien(cho.r, cho.trum);
        if (tt.san) { const fn = cho.fn; cho = null; try { fn(); } catch (e) { console.error('Linh Khí: vào ải sau khi tải ảnh vùng hỏng', e); if (G.scene === G.ChoVung) G.setScene(G.Village); } }
      },
      draw() {
        const ui = G.ui, T = G.theme, c = G.ux;
        if (!cho) return;
        c.fillStyle = '#120d10'; c.fillRect(0, 0, 480, 270);
        const tt = SC.vungTien(cho.r, cho.trum), R = G.REGIONS && G.REGIONS[cho.r];
        const x = 120, y = 82, w = 240, h = 106;
        if (T && T.panel) T.panel(x, y, w, h, G.t('Đang tải…')); else ui.panel(x, y, w, h, G.t('Đang tải…'));
        ui.text(G.t('Đang tải ảnh {0}', R ? (G.kd ? G.kd(G.t(R.name)) : R.name) : ''), 240, y + 40, { size: 8.5, align: 'center', color: '#f0e0c0' });
        ui.bar(150, y + 50, 180, 6, tt.tong ? tt.xong / tt.tong : 1, '#ffd27a');
        ui.text(tt.xong + '/' + tt.tong, 240, y + 66, { size: 7.5, align: 'center', color: '#d8c8a8' });
        const ranh = tt.loi > 0 && tt.loi + tt.xong >= tt.tong;
        const nut = (bx, chu, chinh) => (T && T.btn ? T.btn(bx, y + 72, 96, 24, G.t(chu), { size: 8.5, primary: chinh }) : ui.btn(bx, y + 72, 96, 24, G.t(chu)));
        if (ranh && nut(x + 18, 'Thử lại', true)) { if (SC.roiThuLai) { const r = cho.r; SC.roiThuLai((m) => { const it = theoMa.get(m); return !!(it && it.khoa && (it.vung === r || it.vung === vungMuon(r))); }); } }
        if (nut(x + w - 114, 'Về làng', false)) { cho = null; G.setScene(G.Village); }
      },
    };
    if (G.ngonNgu && G.ngonNgu.them) G.ngonNgu.them({ 'Đang tải ảnh {0}': 'Loading {0} images', 'Đang tải…': 'Loading…', 'Thử lại': 'Retry', 'Về làng': 'Back to village' });
    G.choVung = function (r, trum, fn) {
      r = Math.max(0, Math.min(moVung.length - 1, r | 0));
      SC.taiVung(r);
      if (!G.TAI_VUNG || SC.vungTien(r, trum).san) return fn();
      cho = { r, trum: !!trum, fn };
      G.setScene(G.ChoVung);
      return undefined;
    };
    function tai(it, thap, gap) {
      dang++; it.dangTai = true; it.thap = thap; if (thap) dangThap++; it.gap = gap; if (gap) dangGap++; it.tBat = bayGio();
      const url = (coWebp && it.webp && !it.boWebp ? it.webp : it.png) + (it.lan ? '?lan=' + it.lan : ''), img = it.img;
      let het = false;
      const xongTai = () => { het = true; dang--; it.dangTai = false; if (it.thap) dangThap--; if (it.gap) dangGap--; };
      const ok = () => { if (het) return; xongTai(); it.tGiai = bayGio(); choApDung.push(it); keo(); bom(); };
      const hong = () => {
        if (het) return; xongTai();
        if (url.indexOf('.webp') > 0) { // WebP lỗi: thử bản PNG; hỏng liền 3 ảnh WebP thì thôi WebP cho mọi ảnh còn lại
          it.boWebp = true; hang.push(it);
          if (++webpHong === 3 && coWebp) { coWebp = false; ghi('Ảnh WebP không đọc được: chuyển sang tải PNG.'); }
        }
        else if (it.lan < CHO_THU.length) { const ms = CHO_THU[it.lan++]; choThu++; setTimeout(() => { choThu--; hang.push(it); bom(); }, ms); }
        else { hongDs.push(it); SC.loi.push(it.ma + ': không tải được ảnh'); ghi('Không tải được ảnh ' + it.ma + ' (đã thử ' + (it.lan + 1) + ' lần): hình này vẽ bằng code.'); }
        bom();
      };
      img.src = url;
      // Safari đôi khi từ chối img.decode() với ảnh lớn dù ảnh vẫn nạp được (xem SC.napAnh): chưa nạp xong thì chờ onload / onerror thật.
      if (typeof img.decode === 'function') img.decode().then(ok, () => { if (img.complete && img.naturalWidth) ok(); else if (img.complete) hong(); else { img.onload = ok; img.onerror = hong; } });
      else { img.onload = ok; img.onerror = hong; }
    }
    // Ảnh đã giải mã xong: báo cho game (onload gốc của SC.add / themDo / themGd / fxAnh.add) theo từng đợt ngắn (≤ 6 ms),
    // giữa hai đợt nhường cho chạm và khung hình (setTimeout), để chạm không bị trễ mà máy chậm vẫn nhận kịp vài trăm hình.
    function keo() {
      if (keoHen || !choApDung.length) return;
      keoHen = true;
      let da = false;
      const chay = () => {
        if (da) return; da = true; keoHen = false;
        const t0 = Date.now();
        while (choApDung.length) {
          const it = choApDung.shift();
          it.ve = true; daXong++; AS.xong = daXong; it.tNhan = bayGio();
          try { if (it.xong) it.xong.call(it.img); } catch (e) { SC.loi.push(it.ma + ': ' + ((e && e.message) || e)); }
          if (/^gd-/.test(it.ma) && !henGd) henGd = setTimeout(() => { henGd = 0; xoaNhoSau(true); }, 700); // ô phòng, giao diện: dựng lại hình đã nhớ
          if (Date.now() - t0 > 6) break;
        }
        if (choApDung.length) keo();
        capNhat();
      };
      setTimeout(chay, 0);
    }
    function capNhat() {
      if (!mo) return;
      let conHang = 0, khoaCho = 0;
      for (const it of hang) { if ((it.u == null ? 0 : it.u) < 90) conHang++; else khoaCho++; }
      AS.tong = theoMa.size - khoaCho; // ảnh riêng của vùng chưa mở không tính vào "Đang tải thêm ảnh… %"
      if (conHang || dang || choApDung.length || choThu) { AS.tt = 'tai'; ketThuc = false; return; }
      if (ketThuc) return;
      ketThuc = true;
      AS.tt = hongDs.length ? 'loi' : 'xong'; AS.hetLuc = Date.now(); AS.loi = hongDs.length ? hongDs.length + ' ảnh không tải được' : '';
      ghi(hongDs.length ? 'Thiếu ' + hongDs.length + '/' + AS.tong + ' ảnh (vẽ bằng code); có mạng lại sẽ thử tiếp.' : 'Đã tải xong ' + AS.tong + ' ảnh rời (' + (coWebp ? 'WebP' : 'PNG') + ').');
      setTimeout(() => { if (ketThuc) { napSauDangChay = false; xoaNhoSau(true); } }, 300);
      if (!hongDs.length) donBanCuRoi();
    }
    // Máy đã lưu ảnh của bản cũ (sw.js): xoá ảnh anh/… không còn dùng và tệp linh-khi-anh.<mã>.json (cách cũ) để không đầy máy.
    function donBanCuRoi() {
      try {
        if (typeof caches === 'undefined' || !caches.keys) return;
        const giu = new Set();
        for (const it of theoMa.values()) { giu.add(it.png); if (it.webp) giu.add(it.webp); }
        // canh-truyen 15/10: ảnh cảnh truyện anh/truyen-*.webp|jpg (js/truyen.js tải lười) cũng là ảnh của bản này
        const TA = G.TRUYEN_ANH;
        if (TA && typeof TA === 'object') for (const k in TA) { const v = TA[k] || {}; for (const d in v) if (typeof v[d] === 'string') giu.add(v[d]); }
        const BA = G.BIA_ANH; // bia-moi 15/10: ảnh bìa màn hình chính anh/bia-*.webp|jpg (js/bia.js)
        if (BA && typeof BA === 'object') for (const k in BA) { const v = BA[k] || {}; for (const d in v) if (typeof v[d] === 'string') giu.add(v[d]); }
        caches.keys().then((ten) => ten.forEach((n) => caches.open(n).then((c) => c.keys().then((ks) => ks.forEach((k) => {
          const m = /\/(anh\/[^/?#]+)(\?|#|$)/.exec(k.url);
          if ((m && !giu.has(m[1])) || /\/linh-khi-anh\.[0-9a-f]+\.json(\?|$)/.test(k.url)) c.delete(k);
        }))))).catch(() => {});
      } catch (e) { /* bỏ qua */ }
    }
    // Thử lại ảnh đã tải hỏng (loc(mã) chọn ảnh nào; không có loc: mọi ảnh hỏng). Dùng ở SC.uuTienTrum và khi quay lại trang.
    SC.roiThuLai = function (loc) {
      let n = 0;
      for (let i = hongDs.length - 1; i >= 0; i--) { const it = hongDs[i]; if (loc && !loc(it.ma)) continue; hongDs.splice(i, 1); it.lan = 0; hang.push(it); n++; }
      if (n) { ketThuc = false; bom(); }
      return n;
    };
    roiMo = function () {
      if (mo) return;
      mo = true;
      // Vào ải: ưu tiên quái vùng đó; ải 4–5 thì cả trùm và dáng pha của vùng.
      const g0 = G.startStage;
      if (typeof g0 === 'function' && !g0.roi) {
        const g1 = function (r, i) {
          try { vung = Math.max(0, Math.min(moVung.length - 1, r | 0)); trumMo = (i | 0) >= 3; } catch (e) { /* bỏ qua */ }
          // tải theo vùng: vùng chưa đủ ảnh (ải trùm: cả trùm vùng) → màn chờ, đủ rồi mới vào ải
          if (G.TAI_VUNG && G.scene !== G.ChoVung) {
            const self = this, args = arguments;
            try { SC.taiVung(vung); if (!SC.vungTien(vung, (i | 0) >= 4).san) return G.choVung(vung, (i | 0) >= 4, () => g1.apply(self, args)); } catch (e) { /* bỏ qua: vào ải như cũ */ }
          }
          const kq = g0.apply(this, arguments); try { bom(); } catch (e) { /* bỏ qua */ } return kq;
        };
        g1.roi = true; G.startStage = g1;
      }
      try { window.addEventListener('online', () => { for (const it of hongDs.splice(0)) { it.lan = 0; hang.push(it); } bom(); }); } catch (e) { /* bỏ qua */ }
      // Phiên kiểm 3 pha trùm: iPhone khoá máy / chuyển ứng dụng giữa lúc tải thì ảnh hỏng mà không có sự kiện 'online'. Quay lại trang: thử lại các ảnh hỏng.
      try { document.addEventListener('visibilitychange', () => { if (!document.hidden && hongDs.length && SC.roiThuLai) SC.roiThuLai(); }); } catch (e) { /* bỏ qua */ }
      bom();
    };
  }

  // Tệp do game/build.py nhúng vào bản đóng gói (bản ảnh rời: chỉ thông số, ảnh vào hàng chờ tải ở trên).
  if (Array.isArray(G.customSpriteData)) { for (const t of G.customSpriteData) SC.add(t); delete G.customSpriteData; }
})();
