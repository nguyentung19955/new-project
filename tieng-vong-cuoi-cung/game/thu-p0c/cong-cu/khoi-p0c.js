/* ======================= P0-C – khối thêm vào bản THỬ game/thu-p0c/index.html =======================
   Theo docs/gameplay/PHAN-HOI-9-P0B.md mục 4 + "GỬI CLAUDE" điểm 9, KE-HOACH-GAMEPLAY-V2.md mục 5, 7, 8, KE-HOACH-VU-KHI.md mục 3, 4b, 6b,
   PHAN-HOI-2 (Ấn Rèn I trước boss đầu), PHAN-HOI-5 (Thế tinh anh hồi + ổn định chống chuỗi choáng). Trang sinh bằng cong-cu/tao-p0c.py
   từ game/thu-p0a/am-dao.html (Âm Đao, đã sửa PH8) + bộ đất / phòng D–F của thu-phong-b – KHÔNG sửa các trang đó.

   Đi phòng: A (điểm lưu, hình nộm) → B (2 Chuông Gỗ) → C (quái gác) → D (2 Bọ) → E (TINH ANH) → F (lò rèn: chuông lưu + ĐE RÈN).
     ?vao=e  vào thẳng đầu phòng E (rút gọn)     ?vao=f  vào thẳng F (chỉ để xem đe; chưa có Ấn thì không rèn được)
   Tinh anh "Chuông Gỗ Gác Lớn": Chuông Gỗ biến thể (rig Chuông Gỗ phóng ×1,5 + tô màu), [160 máu, Thế 80], Thế THE_TINH_ANH
     (hồi khi không bị đánh, vỡ → choáng 150 → hồi phục 20 (Thế đầy) → ổn định 120 (Thế không xuống dưới 1); vỡ lần 2 / 3 trong 600 tick
     → choáng ×0,6 / ×0,4, tối thiểu 45). Nặng: đòn thường KHÔNG làm khựng / đẩy lùi (chỉ vỡ Thế mới ngắt đòn).
     Đòn 1 – ĐẬP: như Chuông Gỗ (báo trước 30 tick: GIƠ TAY cao + vươn người + lóe HỔ PHÁCH NGẢ CAM + "!" + tiếng ting; hộp đập ×1,5 bật tick 5–10).
     Đòn 2 – HÚC NGANG: báo trước 36 tick (RỤT NGƯỜI – thấp, bè, cúi đầu + mũi tên » trước ngực + lóe đỏ + bụi chân + tiếng trầm), rồi lao ngang
       6,5 px / tick tối đa 36 tick (dừng ở mép sân), hồi 46 tick (đứng thở, đánh được). Né: lùi xa khi thấy báo, hoặc lướt xuyên qua.
     (PH10: vàng ấm dành cho dẫn đường / an toàn – báo đòn không dùng vàng; hai đòn phân biệt chủ yếu bằng TƯ THẾ + hình báo.)
     Sau 2 lần đập liên tiếp nó lùi lại một đoạn rồi húc (nhịp khác rõ). Hạ được bằng đánh thường – Vọng KHÔNG bắt buộc.
     Chạm thân: ĐẨY Lam ra tới mép thân, không gây sát thương (PH10 chốt 2); húc vẫn gây sát thương. ?tamau=N: CHỈ ĐỂ KIỂM chu trình Thế.
     ?choang=120: BIẾN THỂ (tắt mặc định) choáng 120 thay 150.
   PH10: lướt xuyên thân giữ miễn tới khi ra khỏi thân · Lam rời E → tinh anh ngừng đánh, về chỗ, hồi đầy; không nhận đòn khi Lam ngoài E ·
     mốc hồi sinh ẩn ở đầu E · sau rèn: hình nộm ở F + 2 Chuông Gỗ thường ra sân E · log tinh anh kèm enemyId | loại | tên.
   Hạ tinh anh → rơi ẤN RÈN I (ảnh an-ren.png, cao 24 px). Chạm để nhặt (hiệu ứng ngắn). Ấn không tiêu hao, rèn MỘT lần.
   Đe rèn phòng F (2 trạng thái của thu-phong-b: nguội / đang rèn): có Ấn → nút "Rèn" (phím F) → Âm Đao CẤP 3, thông báo "Đánh thường mạnh hơn · Mở Dư Âm".
     Không menu, không vật liệu, không cấp khác. (Cấp 3 = bảng cấp có sẵn: gồm +20 % của cấp 2 – PH10 chốt 1.)
   Vọng: cấu hình TẠM = A (ghi chủ động, nút V bật / tắt ghi – code trang Âm Đao) + sửa PH9: mẫu cuối xử lý đủ, bóng nghỉ không hộp đòn;
     đổi phòng gameplay / chết xoá bóng. Không có cấu hình B ở trang này; luật Vọng / chi phí / kỹ năng vũ khí KHÔNG đổi trong lượt.
   LOG NỀN P0-C luôn thu (không cần ?debug): tinh anh (đòn, Thế, choáng, ổn định, trúng Lam), Ấn (rơi / nhặt), đe (tương tác, mở cấp),
     Dư Âm (tung, vết). ⚙ → "Xuất log P0-C". ?debug=p0c: bảng log trên màn + chữ trạng thái tinh anh. Cờ cũ (?hitbox=1, ?debug=input …) giữ. */

const P0C_PHIEN = '__PHIEN__';   // tao-p0c.py điền: ngày + mã băm nguồn
const P0C_SO = {
  log: P0_Q.get('debug') === 'p0c',
  choang120: P0_Q.get('choang') === '120',      // BIẾN THỂ (PH10, TẮT mặc định): choáng lần vỡ đầu 120 tick thay 150 – chỉ so khi trận thành "đứng chém quái bất động"
  ta: {ten: 'Chuông Gỗ Gác Lớn', loai: 'chuong-go-gac-lon', mau: 160, the: P0_Q.get('choang') === '120' ? Object.assign({}, THE_TINH_ANH, {choang: 120}) : THE_TINH_ANH, k: 1.5, w: 108, h: 162, cot: 19, min: 3, max: 27,   // cột trong phòng E
    thuc: 560,                     // thức khi Lam vào E và cách ≤ 560 px
    di: 0.8, giuCach: 96,          // đi tới Lam (px / tick), đứng lại khi tâm cách ≤ 96
    tinhAnhTint: 'rgba(58,18,34,0.42)',   // tô màu: gỗ sơn đỏ sẫm (phủ lên rig Chuông Gỗ)
    dap: {bao: 30, danh: 16, hop0: 5, hop1: 10, hoi: 34, cd: 34, tam: 175, lao: 3.6},
    hopDap: {dx: -135, dy: -121, w: 99, h: 55},   // = hộp đấm Chuông Gỗ {-90,-81,66,37} × 1,5 (so với chân, nhìn trái)
    huc: {bao: 36, chay: 36, toc: 6.5, hoi: 46, cd: 150, tamMin: 150, tamMax: 440, hopY0: 30, hopY1: 150},   // hộp húc = thân, từ 30 → 150 px trên chân
    lui: {t: 34, toc: 1.7}, dapLienTiepHuc: 2,
    ve: {toc: 1.6}},               // PH10 mục 4: Lam rời E khi đang đánh → ngừng đánh, đi về chỗ (cột 19) 1,6 px/tick, tới nơi HỒI ĐẦY máu + Thế rồi ngủ gác
  an: {cao: 24, nhatSau: 18},
  tamau: Math.max(0, +P0_Q.get('tamau') || 0),   // CHỈ ĐỂ KIỂM chu trình Thế (vỡ → choáng → ổn định → vỡ lại ×0,6 / ×0,4): máu tinh anh = N. Mặc định TẮT (160)
  dayThan: 6,                                    // chạm thân: ĐẨY Lam ra tới mép thân (tối đa 6 px / tick > chạy 4,4 → không đi xuyên thân được), KHÔNG gây sát thương (PH10 chốt 2); đập / húc vẫn gây sát thương
  xuyen: {day: 7, toiDa: 40, an: 4},             // PH10 mục 3: lướt VÀO thân lúc còn miễn sát thương → giữ miễn tới khi ra khỏi thân (đẩy theo hướng lướt 7 px/tick, tối đa 40 tick), ra rồi thêm 4 tick
  de: {gan: 80},
  // PH10 mục 2: màu báo – ĐẬP hổ phách ngả cam (không vàng ấm), HÚC đỏ; tư thế: đập giơ tay (đơn vị rig: ×0,107 px × 1,5), húc rụt người (thấp 14 %, bè 8 %)
  ve: {dong: '#9A6A44', dap: '#F0882A', huc: '#E5432E', mui: '#FF6E46', rut: 0.14, be: 0.08,
    dapTay: [20, -470, -30, -150, -520, 30], vuon: 0.06, hucTay: [-40, 60, 10, 30, 50, -10]},
  moc: {cot: 1},                                 // PH10 mục 6: mốc hồi sinh ẨN ở đầu sân E (cột 1) – đặt khi Lam vào E (trừ khi đã lưu ở chuông F)
  sauRen: {cg: [[9, 5, 13], [21, 17, 25]], nom: 11}   // PH10 mục 7: sau rèn – 2 Chuông Gỗ thường (40 máu, quái đã biết) ra sân E; hình nộm ở F cột 11 (chỗ an toàn tập giữ–thả)
};
const LOAI_TA = {ten: P0C_SO.ta.ten, mau: P0C_SO.ta.mau, the: P0C_SO.ta.the, nang: 'nang', than: [P0C_SO.ta.w, P0C_SO.ta.h], anDon: [P0C_SO.ta.w, P0C_SO.ta.h],
  khongNgatSau: 0, vaiTro: 'tinh-anh',
  don: {
    dap: {id: 'dap', su: P0C_SO.ta.dap.bao + P0C_SO.ta.dap.hop0, ac: 6, re: P0C_SO.ta.dap.danh - P0C_SO.ta.dap.hop1 + P0C_SO.ta.dap.hoi, goc: [1, 0], baoTruoc: 30,
      box: [P0C_SO.ta.hopDap.dx, P0C_SO.ta.hopDap.dy, P0C_SO.ta.hopDap.w, P0C_SO.ta.hopDap.h], dauHinh: 'GIƠ HAI TAY cao + lóe hổ phách ngả cam + dấu ! 30 tick', dauAm: 'ting (sfx.warn)'},
    huc: {id: 'huc', su: P0C_SO.ta.huc.bao, ac: P0C_SO.ta.huc.chay, re: P0C_SO.ta.huc.hoi, goc: [1, 0], baoTruoc: 36,
      dauHinh: 'RỤT NGƯỜI (thấp + bè ra) + mũi tên » chỉ hướng + lóe đỏ + bụi chân 36 tick', dauAm: 'tiếng trầm kéo (sfx.sweepPrep)'}}};
LOAI_QUAI.tinhAnh = LOAI_TA;
for (const d of Object.values(LOAI_TA.don)) if (d.dauAm && !d.dauHinh) console.warn('P0-C: đòn ' + d.id + ' có dấu âm mà thiếu dấu hình');

/* ---------- tinh anh: dùng chung mảng Q (để đòn Lam / bóng / vết Dư Âm đi qua P0.thuThap + giaiQuyet như mọi quái) ---------- */
const TA = mkQuai(PE, P0C_SO.ta.cot, FLOOR, P0C_SO.ta.min, P0C_SO.ta.max, false);
TA.tinhAnh = true; TA.w = P0C_SO.ta.w; TA.h = P0C_SO.ta.h; TA.sy = FLOOR - TA.h; TA.sx = (PE.x0 + P0C_SO.ta.cot) * T;
Q.push(TA);
// PH10 mục 7: quái ĐÃ BIẾT cho đoạn sau rèn (ẩn tới khi rèn xong rồi vào lại E) + hình nộm thứ 2 ở F (luôn có – chỗ an toàn)
const CG_SAU = P0C_SO.sauRen.cg.map(([c, a, b]) => { const q = mkQuai(PE, c, FLOOR, a, b, false); q.sauRen = true; Q.push(q); return q; });
const NOM_F = mkQuai(PF, P0C_SO.sauRen.nom, FLOOR, P0C_SO.sauRen.nom, P0C_SO.sauRen.nom + 1, false); NOM_F.nom = true; NOM_F.face = -1; Q.push(NOM_F);

const P0C = (() => {
  const SO = P0C_SO, LOG = [], TK = {thuc: 0, dap: 0, huc: 0, trungLamDap: 0, trungLamHuc: 0, trungLamCham: 0, lamDanh: 0, mauMat: 0, voThe: 0, tickChoang: 0, chanOnDinh: 0,
    hoiThe: 0, dayThan: 0, chet: 0, anRoi: 0, anNhat: 0, deGan: 0, deKhongAn: 0, ren: 0, duAm: 0, vetTrung: 0, xoaBongDoiPhong: 0,
    roiE: 0, veCho: 0, hoiDayVe: 0, chanNgoaiE: 0, xuyen: 0, xuyenGiu: 0, xuyenTrungSau: 0, lamChet: 0, mocE: 0, renLap: 0, sauRen: 0, cgHa: 0};
  const msNow = () => P0_SO.ghi ? null : Math.round(performance.now());
  function ghi(s, loai, id) { const d = 'f' + S.frame + ' ' + (id ? '[' + id + '] ' : '') + s; LOG.push({f: S.frame, s: d, ngan: 'f' + S.frame + ' ' + s, loai: loai || '', id: id || '', t: msNow()}); if (LOG.length > 6000) LOG.shift(); if (SO.log) console.log('[P0-C] ' + d); }
  // PH10 chốt 7: MỌI dòng về tinh anh kèm enemyId (= tên trong log P0-A "Chuông Gỗ#<chỉ số trong Q>"), loại elite, tên hiển thị
  const taId = () => 'Chuông Gỗ#' + Q.indexOf(TA) + ' | elite:' + SO.ta.loai + ' | ' + SO.ta.ten;
  const ghiTA = (s, loai) => ghi(s, loai, taId());
  const AN = {on: false, x: 0, y: 0, vy: 0, t: 0, nay: 0, coAn: false, fNhat: -1, bay: 0};
  const REN = {t: 0, lan: 0};
  let IMG = null, META = null;
  (async () => { try { const r = await fetch('p0c/an-ren-2x.json', {cache: 'no-cache'}); META = await r.json(); IMG = await loadImgDecode('p0c/' + META.anh); }
    catch (e) { console.warn('P0-C: không nạp được ảnh Ấn Rèn', e); } })();

  /* ---- trạng thái tinh anh: q.ta (thật) ; q.st chỉ là bản sao để P0 / Q khác đọc. Đòn thường đặt q.st = 'hit' → bỏ (nặng, không khựng) ---- */
  function datLai(q) {
    const L = LOAI_TA; q.L = L; q.hp = SO.tamau || L.mau; q.max = q.hp; q.chP = q.chE = null; q.khoaCH = 0; q.daGhep = [];
    q.T = {cfg: L.the, v: L.the.toiDa, pha: 'thuong', t: 0, tong: 0, lastHit: -999, lanVo: [], tPrev: L.the.toiDa, matVo: false};
    q.ta = 'ngu'; q.st = 'ngu'; q.t = 0; q.cdDap = 0; q.cdHuc = 60; q.dapLien = 0; q.hucDir = 1; q.phaTruoc = 'thuong'; q.hp0 = q.hp; q.the0 = q.T.v; q.kvx = 0; q.face = -1;
  }
  function vao(q, ta) { q.ta = ta; q.st = ta; q.t = 0; q.tLuu = 0; }
  function laTrongE() { return ROOMS[S.room] === PE; }
  function lamTrongE() { const x = pl.x + pl.w / 2; return x >= PE.x0 * T_ && x < (PE.x0 + PE.w) * T_; }   // theo vị trí thật (không trễ 1 bước như S.room)
  const XU = {on: false, dir: 1, t: 0, f0: 0, x0: 0, lanDash: -99, daRa: -1};   // lướt xuyên thân (PH10 mục 3)
  const R2 = {x: 0, y: 0, w: 0, h: 0};
  function hopDap(q, out) { const fx = q.x + q.w / 2, fy = q.y + q.h, H = SO.ta.hopDap; out.y = fy + H.dy; out.w = H.w; out.h = H.h; out.x = q.face < 0 ? fx + H.dx : fx - H.dx - H.w; return out; }
  function hopHuc(q, out) { const H = SO.ta.huc; out.x = q.x - 4; out.w = q.w + 8; out.y = q.y + q.h - H.hopY1; out.h = H.hopY1 - H.hopY0; return out; }
  const R1 = {x: 0, y: 0, w: 0, h: 0};
  function danhLam(nguon, dir) {   // một lần tinh anh đánh trúng Lam (hurt tự lo miễn sát thương / lướt)
    if (!lamTrongE()) return;        // PH10 mục 4: không đòn nào của tinh anh lọt ra ngoài E (F / D)
    const hp0 = pl.hp; hurt(dir);
    if (pl.hp < hp0 && XU.daRa >= 0 && S.frame - XU.daRa < 30) { TK.xuyenTrungSau++; ghiTA('  (trúng ' + (S.frame - XU.daRa) + ' tick sau khi ra khỏi thân bằng lướt)', 'danh'); }
    if (pl.hp < hp0) { TK.lamDanh++; if (nguon === 'đập') TK.trungLamDap++; else if (nguon === 'húc') TK.trungLamHuc++; else TK.trungLamCham++;
      ghiTA('tinh anh ' + nguon.toUpperCase() + ' TRÚNG Lam → máu Lam ' + hp0 + ' → ' + pl.hp, 'danh'); }
  }
  function capNhat(q) {
    if (q.gone) return;
    if (q.flash > 0) q.flash--;
    if (q.st === 'hit') { q.st = q.ta; q.kvx = 0; q.t = q.tLuu; }   // nặng: đòn thường không ngắt / không đẩy lùi (giaiQuyet đặt st 'hit', t 0 → trả lại)
    if (q.st === 'die' && q.ta !== 'chet') vao(q, 'chet');
    q.vy = Math.min(q.vy + 0.6, 10); if (moveY(q, q.vy, false) !== 0) q.vy = 0;
    q.t++; q.at++;
    if (q.cdDap > 0) q.cdDap--; if (q.cdHuc > 0) q.cdHuc--;
    const T = q.T, dx = (pl.x + pl.w / 2) - (q.x + q.w / 2), adx = Math.abs(dx), x0 = (PE.x0 + SO.ta.min) * T_, x1 = (PE.x0 + SO.ta.max) * T_;
    // Thế: vỡ → huỷ đòn, choáng; hồi phục → đứng dậy; ổn định / bình thường → đánh tiếp
    if (q.ta !== 'chet' && T) {
      if (T.pha === 'choang' && q.ta !== 'choang') { const huy = q.ta; vao(q, 'choang'); q.kvx = 0; if (/Bao|^dap$|^huc$/.test(huy)) ghiTA('  vỡ Thế HUỶ đòn đang ra (' + huy + ')', 'the'); }
      else if (T.pha === 'hoiPhuc' && q.ta === 'choang') vao(q, 'dungDay');
      else if ((T.pha === 'onDinh' || T.pha === 'thuong') && q.ta === 'dungDay') { vao(q, 'di'); q.cdDap = 20; q.cdHuc = Math.max(q.cdHuc, 40); }
    }
    const S_ = SO.ta;
    // PH10 mục 4: Lam RỜI E (sang F hoặc D) khi tinh anh đang đánh → ngừng đánh NGAY (huỷ cả đòn đang báo / đang lao), đi về chỗ, tới nơi hồi đầy
    if (!lamTrongE() && !pl.dead && /^(thuc|di|lui|dapBao|dap|dapHoi|hucBao|huc|hucHoi)$/.test(q.ta)) {
      const huy = q.ta; vao(q, 've'); q.kvx = 0; TK.roiE++; TK.veCho++;
      ghiTA('Lam RỜI sân E (sang ' + ROOMS[roomAt(pl.x + pl.w / 2)].name + ') khi tinh anh đang ' + huy + ' → NGỪNG đánh, không truy đuổi, về chỗ (cột ' + S_.cot + '); tới nơi HỒI ĐẦY máu + Thế · máu lúc rời ' + q.hp + ', Thế ' + T.v, 'roi');
      if (pl.hp > 0) toast('Rời sân · tinh anh về chỗ, hồi đầy');
    }
    xuyenThan(q);
    switch (q.ta) {
      case 'ngu': if (laTrongE() && !pl.dead && adx < S_.thuc) { vao(q, 'thuc'); TK.thuc++; q.face = dx > 0 ? 1 : -1; sfx.thud(); bell(165, 1.0, 0.1); shake(0, 1, 2);
          popText(q.x + q.w / 2, q.y - 40, S_.ten, '#F3C38A'); ghiTA('TINH ANH thức: ' + S_.ten + ' [' + q.hp + ' máu, Thế ' + T.v + '/' + T.cfg.toiDa + '] · Lam cách ' + Math.round(adx) + ' px', 'ta'); } break;
      case 'thuc': if (q.t >= 40) vao(q, 'di'); break;
      case 'di': {
        if (pl.dead || !laTrongE()) break;
        q.face = dx > 0 ? 1 : -1;
        if (q.dapLien >= S_.dapLienTiepHuc && q.cdHuc <= 0) { vao(q, 'lui'); ghiTA('tinh anh lùi lấy đà (sau ' + q.dapLien + ' lần đập liên tiếp)', 'ta'); break; }
        if (q.cdDap <= 0 && adx < S_.dap.tam && Math.abs((pl.y + pl.h) - (q.y + q.h)) < 100) { vao(q, 'dapBao'); TK.dap++; sfx.warn(); ghiTA('ĐẬP #' + TK.dap + ' báo trước ' + S_.dap.bao + ' tick (GIƠ TAY + lóe hổ phách + ! + ting) · Lam cách ' + Math.round(adx) + ' px', 'don'); break; }
        if (q.cdHuc <= 0 && adx >= S_.huc.tamMin && adx <= S_.huc.tamMax) { batDauHuc(q, adx); break; }
        if (adx > S_.giuCach) { const ax = q.face > 0 ? q.x + q.w + 2 : q.x - 2, nx = q.x + q.face * S_.di;
          if (solidPt(ax, q.y + q.h + 4) && nx >= x0 && nx + q.w <= x1) moveX(q, q.face * S_.di, false); }
        break; }
      case 'lui': { const d = -(dx > 0 ? 1 : -1), nx = q.x + d * S_.lui.toc; q.face = dx > 0 ? 1 : -1;
        if (nx >= x0 && nx + q.w <= x1) moveX(q, d * S_.lui.toc, false);
        if (q.t >= S_.lui.t) { q.dapLien = 0; if (adx >= 110 && !pl.dead) batDauHuc(q, adx); else { vao(q, 'di'); q.cdHuc = 30; } }
        break; }
      case 'dapBao': if (q.t >= S_.dap.bao) vao(q, 'dap'); break;
      case 'dap': {
        if (q.t <= 5) { const ax = q.face > 0 ? q.x + q.w + 4 : q.x - 4, nx = q.x + q.face * S_.dap.lao; if (solidPt(ax, q.y + q.h + 4) && nx >= x0 && nx + q.w <= x1) moveX(q, q.face * S_.dap.lao, false); }
        if (q.t === S_.dap.hop0) { dust(q.x + q.w / 2 + q.face * 100, q.y + q.h, 6); shake(q.face, 1, 1.8); sfx.thud(); ghiTA('  đập: hộp BẬT (tick ' + S_.dap.hop0 + '–' + S_.dap.hop1 + ')', 'don'); }
        if (q.t >= S_.dap.hop0 && q.t <= S_.dap.hop1 && !pl.dead) { hopDap(q, R1); if (overlap(hurtBox(), R1)) danhLam('đập', q.face); }
        if (q.t >= S_.dap.danh) vao(q, 'dapHoi');
        break; }
      case 'dapHoi': if (q.t >= S_.dap.hoi) { vao(q, 'di'); q.cdDap = S_.dap.cd; q.dapLien++; } break;
      case 'hucBao': { if (q.t % 6 === 0) dust(q.x + q.w / 2 - q.hucDir * 40, q.y + q.h, 4);
        if (q.t >= S_.huc.bao) { vao(q, 'huc'); sfx.thud(); shake(q.hucDir, 0, 2); ghiTA('  húc: LAO (tốc ' + S_.huc.toc + ' px/tick, tối đa ' + S_.huc.chay + ' tick)', 'don'); }
        break; }
      case 'huc': {
        const nx = q.x + q.hucDir * S_.huc.toc; let dung = nx < x0 || nx + q.w > x1;
        if (!dung && moveX(q, q.hucDir * S_.huc.toc, false)) dung = true;
        if (q.t % 4 === 0) dust(q.x + q.w / 2 - q.hucDir * 50, q.y + q.h, 4);
        if (!pl.dead) { hopHuc(q, R1); if (overlap(hurtBox(), R1)) danhLam('húc', q.hucDir); }
        if (dung || q.t >= S_.huc.chay) { vao(q, 'hucHoi'); if (dung) { shake(q.hucDir, 0, 2.6); sfx.thud(); } ghiTA('  húc: dừng (' + (dung ? 'chạm mép sân' : 'hết ' + S_.huc.chay + ' tick') + ') → hồi ' + S_.huc.hoi + ' tick', 'don'); }
        break; }
      case 'hucHoi': if (q.t >= S_.huc.hoi) { vao(q, 'di'); q.cdHuc = S_.huc.cd; q.cdDap = 10; } break;
      case 've': {   // về chỗ: không đánh, không nhận đòn từ ngoài E (q.khongDanh), Lam vào lại E → đánh tiếp với máu hiện có
        const nha = q.sx + q.w / 2, c = q.x + q.w / 2, d = nha - c;
        if (lamTrongE() && !pl.dead) { vao(q, 'di'); q.cdDap = 20; q.cdHuc = Math.max(q.cdHuc, 60); ghiTA('Lam vào lại E trước khi tinh anh về tới chỗ → đánh tiếp (máu ' + q.hp + ', Thế ' + T.v + ', CHƯA hồi)', 'roi'); break; }
        if (Math.abs(d) > S_.ve.toc) { q.face = Math.sign(d); moveX(q, q.face * S_.ve.toc, false); break; }
        q.x = q.sx; q.face = -1; q.hp = q.max; T.v = T.cfg.toiDa; T.pha = 'thuong'; T.t = 0; T.lanVo = []; T.lastHit = -999; q.hp0 = q.hp; q.the0 = T.v; q.phaTruoc = 'thuong';
        q.dapLien = 0; q.cdDap = 0; q.cdHuc = 60; vao(q, 'ngu'); TK.hoiDayVe++;
        popText(q.x + q.w / 2, q.y - 40, 'Hồi đầy', '#CFE3C0');
        ghiTA('tinh anh VỀ TỚI chỗ → HỒI ĐẦY ' + q.hp + ' máu, Thế ' + T.v + '/' + T.cfg.toiDa + ' → ngủ gác (Lam vào E, cách ≤ ' + S_.thuc + ' px → thức lại)', 'roi');
        break; }
      case 'choang': TK.tickChoang++; break;
      case 'dungDay': break;
      case 'chet': if (q.t > 150) q.fade = Math.max(0, 1 - (q.t - 150) / 60); if (q.t >= 210) { q.dead = true; q.gone = true; } break;
    }
    // chạm thân: ĐẨY Lam ra (không gây sát thương – thân to + Lam lao tới khi chém dễ chạm oan); húc thì hộp húc lo sát thương
    // PH10: đẩy ra TỚI MÉP thân (tối đa SO.dayThan px/tick, lớn hơn tốc chạy) → đứng sát thân không rung, không đi xuyên chậm qua thân như bản trước;
    // muốn qua bên kia phải LƯỚT. Phía gần bị TƯỜNG chặn → đẩy sang phía kia (trượt qua thân ra ngoài) – không rung, không kẹt giữa tường và thân.
    if (q.ta !== 'chet' && q.ta !== 'huc' && !pl.dead && pl.dash <= 0 && !XU.on && overlap(pl, q)) {
      // hướng đẩy chọn MỘT lần khi bắt đầu chồng và GIỮ tới khi hết chồng (không lật qua lại mỗi tick); phía gần có tường → chọn phía kia
      if (!q.dayHuong) { let d = (pl.x + pl.w / 2) >= (q.x + q.w / 2) ? 1 : -1; const xr = d > 0 ? q.x + q.w + pl.w - 1 : q.x - pl.w + 1;
        if (solidPt(xr, pl.y + pl.h - 6) || solidPt(xr, pl.y + 6)) { d = -d; TK.dayNguoc = (TK.dayNguoc || 0) + 1; ghiTA('  chạm thân sát TƯỜNG → đẩy sang phía kia (không kẹt giữa tường và thân)', 'day'); }
        q.dayHuong = d; }
      const d = q.dayHuong, sau = d > 0 ? q.x + q.w - pl.x : pl.x + pl.w - q.x, buoc = Math.min(SO.dayThan, Math.max(0, sau));
      if (buoc > 0) { const x0 = pl.x; moveX(pl, d * buoc, false); TK.dayThan++; if (Math.abs(pl.x - x0) < 0.01) q.dayHuong = -d; }   // bị chặn hẳn → đổi hướng (giữ hướng mới)
    } else q.dayHuong = 0;
    if (q.ta === 'huc') q.at += 3;
    theoDoiThe(q);
    hoatHoa(q);
    q.tLuu = q.t;
  }
  const T_ = T;
  /* ---- PH10 mục 3: LƯỚT XUYÊN thân tinh anh lớn (thân 108 + vùng ăn đòn Lam 40 = 148 px; lướt 88 px / 11 tick miễn sát thương).
     Bản trước: lướt sớm 2–4 tick → hết miễn khi còn mắc trong thân → trúng húc (đo ở GHI-CHU). Sửa: chạm thân LÚC CÒN miễn sát thương của lướt
     → giữ miễn tới khi ra khỏi thân; hết lướt mà còn trong thân → đẩy tiếp theo HƯỚNG LƯỚT (không kéo ngược về); chặn → đổi hướng 1 lần.
     Tối đa 40 tick; ra khỏi thân → thêm 4 tick miễn (không bị bắt ngay ở mép). Lướt quá sớm (hết lướt + hết miễn TRƯỚC khi chạm thân) vẫn trúng. ---- */
  function xuyenThan(q) {
    if (pl.dash > 0) XU.lanDash = S.frame;
    if (q.ta === 'chet' || q.ta === 'ngu' || pl.dead) { if (XU.on) XU.on = false; return; }
    hopHuc(q, R2); const ov = overlap(hurtBox(), R2);
    if (!XU.on) {
      if (ov && pl.iframes > 0 && S.frame - XU.lanDash <= P.dashIFrames - P.dashFrames + 1 && pl.hurtT <= 0) {
        XU.on = true; XU.dir = pl.dashDir || pl.face; XU.t = 0; XU.f0 = S.frame; XU.x0 = pl.x; XU.doi = false; TK.xuyen++;
        ghiTA('LƯỚT XUYÊN thân: chạm thân lúc còn miễn (' + pl.iframes + ' tick, lướt còn ' + pl.dash + ') khi tinh anh ' + q.ta + ' → giữ miễn tới khi ra khỏi thân', 'xuyen'); }
      return;
    }
    XU.t++;
    if (!ov || XU.t > SO.xuyen.toiDa) {
      XU.on = false; XU.daRa = S.frame; pl.iframes = Math.max(pl.iframes, SO.xuyen.an);
      ghiTA('  ra khỏi thân sau ' + XU.t + ' tick (' + (ov ? 'HẾT ' + SO.xuyen.toiDa + ' tick – còn chồng' : 'đã ra') + ', dời ' + Math.round(pl.x - XU.x0) + ' px) → thêm ' + SO.xuyen.an + ' tick miễn', 'xuyen'); return; }
    if (pl.iframes <= 2) TK.xuyenGiu++; pl.iframes = Math.max(pl.iframes, 2);   // xuyenGiu: số tick mà miễn của lướt lẽ ra đã hết
    if (pl.dash <= 0) { const chan = moveX(pl, XU.dir * SO.xuyen.day, false); if (chan && !XU.doi) { XU.doi = true; XU.dir = -XU.dir; ghiTA('  xuyên: hướng lướt bị chặn (tường) → đẩy ra phía kia', 'xuyen'); } }
  }
  function batDauHuc(q, adx) { q.hucDir = (pl.x + pl.w / 2) > (q.x + q.w / 2) ? 1 : -1; q.face = q.hucDir; vao(q, 'hucBao'); TK.huc++; sfx.sweepPrep();
    ghiTA('HÚC #' + TK.huc + ' báo trước ' + SO.ta.huc.bao + ' tick (RỤT NGƯỜI + » trước ngực + lóe đỏ + bụi + tiếng trầm) · Lam cách ' + Math.round(adx) + ' px', 'don'); }
  /* ---- log Thế / máu theo từng tick (đọc trạng thái P0 sau khi gom trúng) ---- */
  function theoDoiThe(q) {
    const T = q.T; if (!T) return;
    if (q.ta === 'chet') { if (q.hp !== q.hp0) { ghiTA('  tinh anh: máu ' + q.hp0 + ' → 0 (nhát kết liễu)', 'mau'); q.hp0 = q.hp; } return; }
    if (q.hp !== q.hp0 || T.v !== q.the0) {
      const dm = q.hp0 - q.hp; if (dm > 0) TK.mauMat += dm;
      if (T.pha === 'onDinh' && T.v === 1 && q.the0 >= 1 && q.hp < q.hp0) { TK.chanOnDinh++; ghiTA('  ổn định: Thế giữ ở sàn 1 (không phá tiếp được) · máu ' + q.hp0 + ' → ' + q.hp, 'the'); }
      else if (T.v > q.the0 && q.hp === q.hp0) { if (T.v === q.the0 + 1 && (T.v % 10 === 0 || T.v === T.cfg.toiDa)) { TK.hoiThe++; ghiTA('  Thế tự hồi (không bị đánh ≥ ' + T.cfg.choHoi + ' tick, +1 / ' + T.cfg.hoiMoi + ' tick) → ' + T.v, 'the'); } }
      else if (q.hp < q.hp0 || T.v < q.the0) ghiTA('  tinh anh: máu ' + q.hp0 + ' → ' + Math.max(0, q.hp) + ' · Thế ' + (T.pha === 'choang' && T.v === q.the0 ? '– (đang choáng: không nhận Thế)' : q.the0 + ' → ' + T.v + ' [' + T.pha + ']'), 'mau');
      q.hp0 = q.hp; q.the0 = T.v;
    }
    if (T.pha !== q.phaTruoc) {
      if (T.pha === 'choang') { TK.voThe++; const n = T.lanVo.length;
        ghiTA('VỠ THẾ lần ' + TK.voThe + ' (lần ' + n + ' trong ' + T.cfg.cuaSoLap + ' tick) → CHOÁNG ' + T.tong + ' tick' + (n > 1 ? ' (chống chuỗi choáng: ×' + T.cfg.giamChoangLap[Math.min(n - 1, 2)] + ', tối thiểu ' + CFG.choangToiThieu + ')' : ' (đủ ' + T.cfg.choang + ')'), 'the'); }
      else if (T.pha === 'hoiPhuc') ghiTA('  hồi phục ' + T.cfg.hoiPhuc + ' tick → Thế về đầy ' + T.cfg.toiDa, 'the');
      else if (T.pha === 'onDinh') ghiTA('  ỔN ĐỊNH ' + T.cfg.onDinh + ' tick: đánh được, Thế giảm nhưng không xuống dưới 1 (chống chuỗi choáng)', 'the');
      else if (T.pha === 'thuong' && q.phaTruoc === 'onDinh') ghiTA('  hết ổn định → bình thường (phá Thế lại được) · Thế ' + T.v, 'the');
      q.phaTruoc = T.pha;
    }
  }
  /* ---- hoạt hoạ: trạng thái tinh anh → clip rig Chuông Gỗ (QBR.capNhatQuai qua đối tượng tạm) ---- */
  const PX = {H: null, st: '', t: 0, at: 0};
  function hoatHoa(q) {
    PX.H = q.H; PX.at = q.at; PX.t = q.t;
    switch (q.ta) {
      case 'ngu': PX.st = 'sleep'; break;
      case 'thuc': PX.st = 'wind'; PX.t = Math.min(q.t, 18); break;
      case 'di': case 'lui': case 've': PX.st = 'walk'; break;
      case 'dapBao': PX.st = 'wind'; break;
      case 'dap': PX.st = 'strike'; break;
      case 'dapHoi': PX.st = 'rec'; PX.t = Math.round(q.t * 26 / SO.ta.dap.hoi); break;
      case 'hucBao': PX.st = 'wind'; PX.t = Math.min(Math.round(q.t * 0.55), 20); break;
      case 'huc': PX.st = 'walk'; break;
      case 'hucHoi': PX.st = q.t < 16 ? 'hit' : 'dung'; break;
      case 'choang': PX.st = 'hit'; PX.t = 8; break;
      case 'dungDay': PX.st = 'dung'; break;
      case 'chet': PX.st = 'die'; break;
      default: PX.st = 'dung';
    }
    QBR.capNhatQuai(PX, S.frame); q.H = PX.H;
  }
  /* ---- vẽ: rig Chuông Gỗ phóng ×1,5 trên canvas phụ → tô màu (source-atop) → lóe / nháy → dán vào màn ---- */
  const OFF = {cv: null, g: null, W: 360, H: 290, AX: 180, AY: 276, r: 0};
  function ve(q, al) {
    if (q.gone || !QB || !q.H) return;
    const x = lerp(q.px, q.x, al) + q.w / 2 - ox, y = lerp(q.py, q.y, al) + q.h - oy; if (x < -220 || x > W + 220) return;
    QBR.tinh(q.H, S.frame, ANIM_AL);
    const cur = q.H.cur, k = SO.ta.k, flip = q.face > 0;
    // PH10: hai đòn phân biệt chủ yếu bằng TƯ THẾ + hình báo (không chỉ màu): ĐẬP = giơ hai tay cao; HÚC = rụt người (thấp, bè) + mũi tên »
    const uD = q.ta === 'dapBao' ? Math.min(1, q.t / 10) : 0, uH = q.ta === 'hucBao' ? Math.min(1, q.t / 10) : 0;
    if (uD > 0) { QBR.nutCong('quai', cur, 'tay-truoc', SO.ve.dapTay[0] * uD, SO.ve.dapTay[1] * uD, SO.ve.dapTay[2] * uD); QBR.nutCong('quai', cur, 'tay-sau', SO.ve.dapTay[3] * uD, SO.ve.dapTay[4] * uD, SO.ve.dapTay[5] * uD);
      QBR.nutCong('quai', cur, 'goc', 0, 0, 4 * uD); }                                             // ngả nhẹ ra sau lấy đà
    if (uH > 0) { QBR.nutCong('quai', cur, 'goc', 0, 0, -6 * uH); QBR.nutCong('quai', cur, 'tay-truoc', SO.ve.hucTay[0] * uH, SO.ve.hucTay[1] * uH, SO.ve.hucTay[2] * uH);
      QBR.nutCong('quai', cur, 'tay-sau', SO.ve.hucTay[3] * uH, SO.ve.hucTay[4] * uH, SO.ve.hucTay[5] * uH); }   // cúi đầu tới, tay ôm sát thân
    else if (q.ta === 'huc') QBR.nutCong('quai', cur, 'goc', 0, 0, -11);                        // chúi tới khi lao
    else if (q.ta === 'choang') QBR.nutCong('quai', cur, 'goc', 0, 4, 6 + Math.sin(S.frame * 0.1) * 2);
    const r = Math.max(1, Math.min(3, BK));
    if (!OFF.cv || OFF.r !== r) { OFF.cv = OFF.cv || document.createElement('canvas'); OFF.cv.width = Math.ceil(OFF.W * r); OFF.cv.height = Math.ceil(OFF.H * r); OFF.g = OFF.cv.getContext('2d'); OFF.r = r; }
    const g = OFF.g; g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, OFF.cv.width, OFF.cv.height);
    g.imageSmoothingEnabled = true; g.setTransform(r * k, 0, 0, r * k, OFF.AX * r, OFF.AY * r);
    QBR.ve(g, 'quai', cur, 0, 0, flip, {alpha: 1});
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop';
    g.fillStyle = SO.ta.tinhAnhTint; g.fillRect(0, 0, OFF.cv.width, OFF.cv.height);           // tô màu tinh anh
    let va = 0.1, vc = SO.ve.dong;                                                                 // ánh đồng sẫm nhẹ (không dùng vàng ấm – PH10: vàng ấm = dẫn đường / an toàn)
    if (q.ta === 'dapBao') { va = 0.18 + 0.32 * (0.5 + 0.5 * Math.sin(q.t * 0.7)); vc = SO.ve.dap; } // báo ĐẬP: lóe HỔ PHÁCH NGẢ CAM
    if (q.ta === 'hucBao') { va = 0.22 + 0.4 * (0.5 + 0.5 * Math.sin(q.t * 0.9)); vc = SO.ve.huc; }  // báo HÚC: lóe ĐỎ
    if (q.ta === 'huc') { va = 0.3; vc = SO.ve.huc; }
    if (va > 0) { g.globalAlpha = va; g.fillStyle = vc; g.fillRect(0, 0, OFF.cv.width, OFF.cv.height); }
    const tr = nhay(q.flash); if (tr > 0) { g.globalAlpha = tr * 0.85; g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, OFF.cv.width, OFF.cv.height); }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.globalAlpha = q.fade; if (q.ta !== 'chet') bong(x, y - 1, 62, 0.34);
    const sy = 1 - SO.ve.rut * uH + SO.ve.vuon * uD, sx = 1 + SO.ve.be * uH - SO.ve.vuon * 0.5 * uD;  // HÚC: rụt người (thấp, bè) · ĐẬP: vươn cao – neo ở chân
    ctx.drawImage(OFF.cv, snap(x - OFF.AX * sx), snap(y - OFF.AY * sy), OFF.W * sx, OFF.H * sy); ctx.restore();
    // dấu báo
    if (q.ta === 'dapBao') { at(x, y - 262); ctx.fillStyle = '#0C0F14'; ctx.fillRect(-2, -1, 5, 10); ctx.fillStyle = SO.ve.dap; ctx.fillRect(-1, 0, 3, 5); ctx.fillRect(-1, 6, 3, 2); ctx.restore(); ctx.imageSmoothingEnabled = true; }
    if (q.ta === 'hucBao') { const d = q.hucDir, p = (q.t % 12) / 12; ctx.save(); ctx.translate(x + d * (q.w / 2 + 40), y - 92);   // mũi tên » TRƯỚC NGỰC, chỉ hướng lao (không lẫn với tên trên đầu) ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let i = 0; i < 2; i++) { const xx = d * (i * 16 + p * 10) - d * 12; ctx.strokeStyle = '#0C0F14'; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.moveTo(xx - d * 8, -12); ctx.lineTo(xx + d * 4, 0); ctx.lineTo(xx - d * 8, 12); ctx.stroke();
        ctx.strokeStyle = SO.ve.mui; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xx - d * 8, -12); ctx.lineTo(xx + d * 4, 0); ctx.lineTo(xx - d * 8, 12); ctx.stroke(); ctx.lineWidth = 5; }
      ctx.restore(); }
    // tên tinh anh (trên thanh máu / Thế của P0.veQuai)
    if (q.ta !== 'chet' && q.ta !== 'ngu') { ctx.save(); ctx.font = '800 11px "Be Vietnam Pro", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(12,15,20,.7)';
      const s = SO.ta.ten.toUpperCase(), w = ctx.measureText(s).width, yy = lerp(q.py, q.y, al) - oy - 58; ctx.fillRect(x - w / 2 - 4, yy - 10, w + 8, 14); ctx.fillStyle = '#F3C38A'; ctx.fillText(s, x, yy + 1); ctx.restore(); }
  }
  function veHop(al) {   // ?hitbox=1: hộp đúng tỉ lệ ×1,5 (bản gốc vẽ hộp Chuông Gỗ cỡ thường – bỏ cho tinh anh)
    const q = TA; if (q.gone || !q.H) return; const qx = lerp(q.px, q.x, al), qy = lerp(q.py, q.y, al), dq = qx - q.x, dy = qy - q.y;
    hbRect(qx, qy, q.w, q.h, '#4fb4ff');
    if (q.ta === 'dapBao' || q.ta === 'dap') { hopDap(q, R1); const bat = q.ta === 'dap' && q.t >= SO.ta.dap.hop0 && q.t <= SO.ta.dap.hop1; hbRect(R1.x + dq, R1.y + dy, R1.w, R1.h, bat ? '#ff4a4a' : '#ffa640', bat ? 'fill' : 'dash'); }
    if (q.ta === 'hucBao' || q.ta === 'huc') { hopHuc(q, R1); hbRect(R1.x + dq, R1.y + dy, R1.w, R1.h, q.ta === 'huc' ? '#ff4a4a' : '#ffa640', q.ta === 'huc' ? 'fill' : 'dash'); }
    hbChu('tinh anh: ' + q.ta + ' t' + q.t + ' · máu ' + q.hp + ' · Thế ' + q.T.v + ' [' + q.T.pha + (q.T.t ? ' ' + q.T.t : '') + '] · cd đập ' + q.cdDap + ' húc ' + q.cdHuc, qx - ox - 60, qy + q.h - oy + 8, '#FFD9A0');   // dưới chân (bảng log ?debug=p0c ở trên)
  }
  function chet(q, face) {   // thay killQuai cho tinh anh
    q.st = 'die'; q.hp = 0; q.kvx = 0; vao(q, 'chet'); q.st = 'die'; TK.chet++;
    sfx.thud(); bell(196, 1.6, 0.12); shake(0, 1, 4); flash('#F3E6C8', 10); S.hitstop = Math.max(S.hitstop, 10);
    shatter(q.x + q.w / 2, q.y + 60, '#6B3A2A', '#E1B85A'); shatter(q.x + q.w / 2, q.y + 110, '#5A2A1A', '#C98A4B');
    ghiTA('TINH ANH HẠ (frame ' + S.frame + ') · đập ' + TK.dap + ' · húc ' + TK.huc + ' · vỡ Thế ' + TK.voThe + ' · Lam bị đánh ' + TK.lamDanh + ' · Dư Âm đã dùng ' + TK.duAm, 'ta');
    roiAn(q.x + q.w / 2, q.y + 70);
  }
  /* ---- Ấn Rèn I ---- */
  function roiAn(x, y) { AN.on = true; AN.x = x; AN.y = y; AN.vy = -7; AN.t = 0; AN.nay = 0; TK.anRoi++; bell(784, 0.5, 0.06); ghiTA('ẤN RÈN I rơi ở x ' + Math.round(x) + ' (phòng E)', 'an'); }
  function capNhatAn() {
    if (AN.bay > 0) AN.bay--;
    if (REN.t > 0) REN.t--;
    if (!AN.on) return;
    AN.t++; AN.vy = Math.min(AN.vy + 0.5, 9); AN.y += AN.vy;
    if (AN.y >= FLOOR) { AN.y = FLOOR; if (AN.vy > 2 && AN.nay < 1) { AN.vy = -AN.vy * 0.35; AN.nay++; dust(AN.x, FLOOR, 3); } else AN.vy = 0; }
    if (AN.t >= SO.an.nhatSau && !pl.dead && overlap(pl, {x: AN.x - 12, y: AN.y - SO.an.cao, w: 24, h: SO.an.cao})) nhatAn();
  }
  function nhatAn() {
    AN.on = false; AN.coAn = true; AN.fNhat = S.frame; AN.bay = 48; TK.anNhat++;
    sfx.pick(); bell(988, 0.5, 0.07); bell(1319, 0.7, 0.05, 0.12); burst(AN.x, AN.y - 12, '#F3D9A8', 14, 2); fx('ring', AN.x, AN.y - 12, 24, '', 0, '#F3C38A');
    flash('#F3E6C8', 6); popText(AN.x, AN.y - 44, 'Ấn Rèn I', '#F3D9A8'); toast('Ấn Rèn I · mang tới đe rèn (phòng sau)');
    ghi('NHẶT ẤN RÈN I (frame ' + S.frame + ', sau khi rơi ' + AN.t + ' tick)', 'an');
  }
  function veAn(al) {
    if (!AN.on || !IMG) return;
    const X = AN.x - ox, Y = AN.y - oy, h = SO.an.cao, w = META.w * h / META.h, nhun = AN.vy === 0 ? Math.sin(S.frame * 0.08) * 1.5 : 0;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(X, Y - 12, 2, X, Y - 12, 34);
    gl.addColorStop(0, 'rgba(255,214,150,' + (0.32 + 0.12 * Math.sin(S.frame * 0.1)).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(255,190,100,0)'); ctx.fillStyle = gl; ctx.fillRect(X - 36, Y - 48, 72, 72); ctx.restore();
    bong(X, Y - 1, 12, 0.35);
    ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(IMG, 0, 0, META.w2x, META.h2x, X - w / 2, Y - h - 1 - nhun, w, h); ctx.restore();
  }
  function veAnHUD() {   // biểu tượng Ấn (khung "đã nhặt") cạnh bảng vũ khí; vừa nhặt: bay từ chỗ nhặt về HUD (48 tick)
    if (!AN.coAn || !IMG) return;
    const cs = AD.cs, hx = 6 + (cs && cs.co.duAm ? 186 : 112) + 8, hy = 76, h = 28, w = META.w * h / META.h;
    let X = hx, Y = hy, a = 1, s = 1;
    if (AN.bay > 0) { const u = 1 - AN.bay / 48, e = u * u * (3 - 2 * u); X = lerp(AN.x - ox - w / 2, hx, e); Y = lerp(AN.y - oy - 40, hy, e); s = 1 + 0.6 * (1 - e); }
    ctx.save(); ctx.fillStyle = 'rgba(12,15,20,.55)'; if (AN.bay <= 0) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(hx - 4, hy - 2, w + 8, h + 4, 7) : ctx.rect(hx - 4, hy - 2, w + 8, h + 4); ctx.fill(); }
    if (REN.t > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = REN.t / 90; ctx.fillStyle = '#F3C38A'; ctx.beginPath(); ctx.arc(hx + w / 2, hy + h / 2, 20, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
    ctx.globalAlpha = a; ctx.drawImage(IMG, META.w2x, 0, META.w2x, META.h2x, X, Y, w * s, h * s); ctx.restore();
  }
  /* ---- đe rèn: có Ấn → nút Rèn (phím F) → Âm Đao cấp 3. Không menu, không vật liệu ---- */
  const st = document.createElement('style');
  st.textContent = '#btn-ren{position:absolute;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 54px);transform:translateX(-50%);height:44px;padding:0 18px;border-radius:22px;' +
    'border:2px solid #E1B85A;background:rgba(40,24,10,.88);color:#F3E6C8;font-size:16px;font-weight:800;cursor:pointer;z-index:3;touch-action:manipulation;animation:pulse 1.1s ease-in-out infinite}';
  document.head.appendChild(st);
  const nut = document.createElement('button'); nut.id = 'btn-ren'; nut.className = 'ui'; nut.type = 'button'; nut.hidden = true; nut.textContent = '🔨 Rèn Âm Đao';
  (document.getElementById('btn-noi') || document.body.lastChild).after(nut);
  let nutHien = false, deGanTruoc = false;
  function ganDe() { return ROOMS[S.room] === PF && !pl.dead && Math.abs(pl.x + pl.w / 2 - DE.x) <= SO.de.gan; }
  function coTheRen() { return ganDe() && AN.coAn && AD.cap < 3 && REN.lan === 0 && !S.paused; }   // rèn MỘT lần (Ấn không tiêu hao nhưng không thưởng lặp)
  function capNhatDe() {
    const g = ganDe();
    if (g && !deGanTruoc) { TK.deGan++; ghi('Lam tới đe rèn · ' + (AN.coAn ? (AD.cap < 3 ? 'CÓ Ấn Rèn I → hiện nút Rèn' : 'đã cấp ' + AD.cap) : 'CHƯA có Ấn → không rèn được'), 'de'); if (!AN.coAn) TK.deKhongAn++; }
    deGanTruoc = g;
    const h = coTheRen(); if (h !== nutHien) { nutHien = h; nut.hidden = !h; }
    if (h) { const t = '🔨 Rèn Âm Đao' + (touchMode ? '' : ' (F)'); if (nut.textContent !== t) nut.textContent = t; }
    if (REN.t > 0) DE.nong = 1;
  }
  function veDeTag() {   // dấu tương tác TRONG THẾ GIỚI trên đe (ngoài nút): có Ấn + chưa cấp 3 + đứng gần → "RÈN"; vừa rèn → tia lửa
    if (ROOMS[roomAt(ox + W / 2)] !== PF && ROOMS[roomAt(ox + W / 2)] !== PE) return;
    const X = DE.x - ox, Y = FLOOR - oy - 92; if (X < -80 || X > W + 80) return;
    if (coTheRen()) { const nh = Math.sin(S.frame * 0.12) * 2; ctx.save(); ctx.font = '800 13px "Be Vietnam Pro", sans-serif'; ctx.textAlign = 'center'; const s = 'RÈN' + (touchMode ? '' : ' (F)'), w = ctx.measureText(s).width + 16;
      ctx.fillStyle = 'rgba(40,24,10,.88)'; ctx.strokeStyle = '#E1B85A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(X - w / 2, Y - 12 + nh, w, 22, 11) : ctx.rect(X - w / 2, Y - 12 + nh, w, 22); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#F3E6C8'; ctx.fillText(s, X, Y + 4 + nh); ctx.restore(); }
  }
  function ren(cach) {
    if (!coTheRen()) { if (ganDe() && REN.lan > 0) { TK.renLap++; ghi('bấm Rèn lần nữa (' + cach + ') khi ĐÃ rèn → bỏ qua (không rèn lặp, không thưởng thêm)', 'de'); } return; }
    const c0 = AD.cap; AD.datCap(3, 'đe rèn – Ấn Rèn I'); AD.KN.hoi = 0; REN.t = 90; REN.lan++; TK.ren++;
    [0, 0.22, 0.44].forEach(w => bell(1320, 0.3, 0.06, w, typeof TINKP !== 'undefined' ? TINKP : undefined)); bell(523, 1.2, 0.08, 0.5); bell(784, 1.2, 0.06, 0.62);
    burst(DE.x, FLOOR - 48, '#FFB060', 18, 2.4); burst(DE.x, FLOOR - 48, '#F3E6C8', 8, 1.6); fx('ring', DE.x, FLOOR - 48, 26, '', 0, '#F3C38A'); shake(0, 1, 2); flash('#F3E6C8', 8);
    banner('Đánh thường mạnh hơn · Mở Dư Âm', true); popText(DE.x, FLOOR - 120, 'Âm Đao cấp 3', '#F3E6C8');   // PH10 chốt 1: cấp 3 gồm +20 % của cấp 2 – nói rõ
    setTimeout(() => toast('Giữ Chém rồi thả = Dư Âm · thử vào hình nộm'), 1600);
    nut.hidden = true; nutHien = false;
    ghi('MỞ CẤP: Âm Đao cấp ' + c0 + ' → 3 ở đe rèn (' + cach + ') · Dư Âm: chém vang ' + AD.cs.kyNang.chem.goc.join('/') + ', vết ' + AD.cs.kyNang.vet.goc.join('/') + ', giữ ' + AD.cs.kyNang.giu + ' tick, hồi ' + AD.cs.kyNang.hoi + ' · đánh thường ' + AD.cs.don[1].goc.join('/') + ' (nhát 3 ' + AD.cs.don[3].goc.join('/') + ')', 'cap');
  }
  nut.addEventListener('click', e => { audioInit(); ren('nút cảm ứng'); e.currentTarget.blur(); });
  addEventListener('keydown', e => { if (S.paused || e.repeat) return; if ((e.code === 'KeyF' || e.code === 'Enter') && ganDe() && AN.coAn) { ren('phím ' + e.code); e.preventDefault(); } });
  /* ---- Dư Âm / Vọng: đếm từ số của khối Âm Đao, xoá bóng khi đổi phòng gameplay (PH9) ---- */
  let duAm0 = 0, vet0 = 0, vv0 = 0, vh0 = 0, phong = -1;
  function theoDoiAD() {   // AD.TK: tung = số lần dùng; vetTrung = CHÉM VANG trúng (tên biến của khối Âm Đao); vetVangTrung / vetVangHut = VẾT vang trúng / hụt
    const K = AD.TK, ngoai = !lamTrongE() && !TA.gone && TA.ta !== 'chet' ? ' (Lam ở ngoài E → tinh anh không nhận đòn)' : '';
    if (K.tung > duAm0) { TK.duAm += K.tung - duAm0; ghi('DƯ ÂM tung #' + TK.duAm + ' (Âm Đao cấp ' + AD.cap + ')', 'duam'); }
    if (K.vetTrung > vet0) ghi('  Dư Âm: chém vang TRÚNG', 'duam');
    if (K.vetVangTrung > vv0) { TK.vetTrung += K.vetVangTrung - vv0; ghi('  Dư Âm: vết vang TRÚNG (tổng ' + TK.vetTrung + ')', 'duam'); }
    if (K.vetVangHut > vh0) ghi('  Dư Âm: vết vang HỤT' + ngoai, 'duam');
    duAm0 = K.tung; vet0 = K.vetTrung; vv0 = K.vetVangTrung; vh0 = K.vetVangHut;
  }
  function doiPhong() {
    if (S.room === phong) return;
    if (phong < 0) ghi('bắt đầu ở phòng ' + ROOMS[S.room].name, 'phong');
    else { ghi('vào phòng ' + ROOMS[S.room].name, 'phong');
      if (echo || rec) { TK.xoaBongDoiPhong++; ghi('đổi phòng gameplay → xoá bóng' + (rec ? ' + huỷ đang ghi' : '') + ' (PH9)', 'vong'); echo = null; rec = null; } }
    phong = S.room;
    if (ROOMS[S.room] === PE && !pl.dead) {
      // PH10 mục 6: mốc hồi sinh ẨN ở đầu E – chết ở E không phải đi lại A → D. Đã lưu ở chuông F (sau E) thì giữ chuông F.
      if (S.cp !== BELLS[4] && S.cp !== MOC_E) { for (const b of BELLS) b.on = false; S.cp = MOC_E; TK.mocE++; toast('Mốc hồi sinh: đầu sân tinh anh');
        ghi('MỐC HỒI SINH = đầu sân E (cột ' + SO.moc.cot + ', ẩn, không hồi máu) – chết ở E hồi sinh ở đây, không phải qua lại A → D', 'moc'); }
      // PH10 mục 7: đã rèn → vào lại E: 2 Chuông Gỗ thường (quái đã biết) ra sân – né đòn, rồi Dư Âm trong lúc nó hồi
      if (REN.lan > 0 && !SAU.mo) { SAU.mo = true; TK.sauRen++; for (const q of CG_SAU) { q.sauRenMo = true; resetQuai(q); q.H = null; }
        toast('2 Chuông Gỗ ra sân · né đòn rồi giữ Chém');
        ghi('SAU RÈN: 2 Chuông Gỗ thường ra sân E (' + CG_SAU.map(q => 'Chuông Gỗ#' + Q.indexOf(q) + ' ' + q.hp + ' máu').join(', ') + ') – quái đã biết, máu thường; né đập rồi dùng Dư Âm lúc nó hồi (26 + nghỉ 60 tick)', 'sau'); }
    }
  }
  const NGHI = {hb: false, nh: 0, n: 0, at: 0, sw: 0, hop: null};
  function bongNghi() {   // bóng phát xong (bước SAU mẫu cuối): tư thế NGHỈ theo hướng cuối, không hộp đòn
    const c = echo.cur; for (const k in c) if (k !== 'hop') NGHI[k] = c[k];
    NGHI.hb = false; NGHI.nh = 0; NGHI.n = 0; NGHI.at = 0; NGHI.a2 = 'idle'; NGHI.l2 = c.f < 0; NGHI.ak = null;
    const k = hdK('tho', 0); NGHI.k2 = k >= 0 ? k : KHUNG_NGHI; NGHI.h2 = k >= 0; echo.cur = NGHI;
    ghi('bóng #' + echo.id + ' phát xong đủ ' + echo.n + ' mẫu (mẫu cuối đã xử lý) → tư thế nghỉ, không hộp đòn', 'vong');
  }
  function buoc() { capNhatAn(); capNhatDe(); theoDoiAD();
    for (const q of CG_SAU) if (q.sauRenMo && !q.daGhiHa && qDown(q)) { q.daGhiHa = true; TK.cgHa++; ghi('SAU RÈN: hạ Chuông Gỗ#' + Q.indexOf(q) + ' (' + TK.cgHa + '/2) · Dư Âm đã dùng ' + TK.duAm + ', vết trúng ' + TK.vetTrung, 'sau'); } }
  const MOC_E = {x: (PE.x0 + SO.moc.cot) * T + 16, y: FLOOR, on: false, ring: 0, cd: 0, an: true};   // không nằm trong BELLS → không vẽ, không hồi máu khi chạm
  const SAU = {mo: false};
  function vanMoi() { datLai(TA); XU.on = false; XU.daRa = -1; SAU.mo = false; for (const q of CG_SAU) { q.sauRenMo = false; q.daGhiHa = false; q.gone = q.dead = true; } AN.on = false; AN.coAn = false; AN.bay = 0; REN.t = 0; REN.lan = 0; if (AD.cap !== 1) AD.datCap(1, 'ván mới P0-C (Ấn đặt lại → cấp về 1)'); nut.hidden = true; nutHien = false; duAm0 = AD.TK.tung; vet0 = AD.TK.vetTrung; vv0 = AD.TK.vetVangTrung; vh0 = AD.TK.vetVangHut; phong = -1; deGanTruoc = false;   // phong −1: ?vao= dời Lam SAU vanMoi → bước đầu chỉ ghi nhận phòng, không xoá bóng
    LOG.length = 0; for (const k in TK) TK[k] = 0; ghi('VÁN MỚI · phiên ' + P0C_PHIEN + ' · Âm Đao cấp ' + AD.cap + ' · Vọng: A ghi chủ động (cấu hình tạm)' +
      ' · tinh anh ' + TA.hp + ' máu' + (SO.tamau ? ' (BIẾN THỂ KIỂM ?tamau=' + SO.tamau + ')' : ' (mặc định)') + ', Thế ' + TA.T.cfg.toiDa + ', choáng ' + TA.T.cfg.choang + (SO.choang120 ? ' (BIẾN THỂ ?choang=120)' : ' (mặc định)') +
      ' · ĐỐI CHIẾU: tinh anh = Q[' + Q.indexOf(TA) + '] = "Chuông Gỗ#' + Q.indexOf(TA) + '" trong log P0-A (?debug=input) · elite:' + SO.ta.loai + ' · tên "' + SO.ta.ten + '"' +
      ' · Chuông Gỗ sau rèn = ' + CG_SAU.map(q => 'Chuông Gỗ#' + Q.indexOf(q)).join(', ') + ' · hình nộm F = hình nộm#' + Q.indexOf(NOM_F), 'van'); }
  function hoiSinh() {
    TK.lamChet++; XU.on = false;
    ghi('LAM NGÃ (lần ' + TK.lamChet + ') ở phòng ' + ROOMS[S.room].name + ' · hồi sinh ở ' + (S.cp === MOC_E ? 'MỐC đầu sân E' : S.cp === BELLS[4] ? 'chuông lưu F' : S.cp === BELLS[3] ? 'chuông lưu A' : 'mốc x ' + Math.round(S.cp.x)) +
      ' · Ấn: ' + (AN.coAn ? 'ĐÃ NHẶT (giữ)' : AN.on ? 'còn trên đất ở x ' + Math.round(AN.x) + ' (giữ)' : 'chưa rơi') + ' · Âm Đao cấp ' + AD.cap + (REN.lan ? ' (đã rèn – giữ)' : ''), 'chet');
    if (!TA.gone && TA.ta !== 'chet' && TA.ta !== 'ngu') { ghiTA('Lam ngã → tinh anh đặt lại đầy máu / Thế (máu lúc đó ' + TA.hp + ', Thế ' + TA.T.v + ')', 'ta'); resetQuai(TA); }
    if (echo || rec) ghi('Lam ngã → xoá bóng', 'vong');
  }
  function sauHoiSinh() { if (S.cp === MOC_E) toast('Hồi sinh ở đầu sân tinh anh'); }
  /* ---- PH10 mục 5: mảng sáng ấm nhẹ quanh chỗ tương tác đe (vẽ trên sàn, trước đe / Lam): rõ hơn khi rèn được ---- */
  function veSangDe() {
    const X = DE.x - ox, Y = FLOOR - oy; if (X < -200 || X > W + 200) return;
    const co = coTheRen(), a = co ? 0.24 + 0.06 * Math.sin(S.frame * 0.08) : 0.1;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(X, Y); ctx.scale(1, 0.22);
    const g = ctx.createRadialGradient(0, 0, 6, 0, 0, SO.de.gan + 30); g.addColorStop(0, 'rgba(255,196,120,' + a.toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,170,90,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, SO.de.gan + 30, 0, 7); ctx.fill(); ctx.restore();
  }
  /* ---- bảng log trên màn (?debug=p0c) ---- */
  function veDebug() {
    if (!SO.log) return;
    ctx.save(); ctx.font = 'bold 11px ui-monospace,Menlo,monospace'; ctx.textBaseline = 'top';
    const L = LOG.slice(-11), x0 = W - 560, y0 = 76;
    ctx.fillStyle = 'rgba(12,15,20,.8)'; ctx.fillRect(x0 - 4, y0 - 18, 560, 11 * 13 + 22);
    ctx.fillStyle = '#FFD25A'; ctx.fillText('P0-C · đập ' + TK.dap + ' húc ' + TK.huc + ' · vỡ Thế ' + TK.voThe + ' · ổn định chặn ' + TK.chanOnDinh + ' · Lam bị đánh ' + TK.lamDanh +
      ' · Ấn ' + (AN.coAn ? 'CÓ' : AN.on ? 'trên đất' : '–') + ' · cấp ' + AD.cap + ' · Dư Âm ' + TK.duAm, x0, y0 - 15);
    L.forEach((r, i) => { ctx.fillStyle = r.loai === 'the' ? '#F3C38A' : r.loai === 'danh' ? '#FF9A8A' : r.loai === 'an' || r.loai === 'cap' ? '#CEF0D6' : r.loai === 'don' ? '#FFE6A8' : r.loai === 'roi' || r.loai === 'xuyen' ? '#9FD6FF' : '#c9c9c9';
      ctx.fillText(((r.id ? '#' + Q.indexOf(TA) + ' ' : '') + r.ngan).slice(0, 88), x0, y0 + i * 13); });   // màn hẹp: chỉ "#7"; log xuất đủ enemyId | loại | tên
    ctx.restore(); ctx.textBaseline = 'alphabetic';
  }
  function tomTat() { return {phien: P0C_PHIEN, frame: S.frame, tk: Object.assign({}, TK), ta: {enemyId: 'Chuông Gỗ#' + Q.indexOf(TA), elite: SO.ta.loai, ten: SO.ta.ten, ta: TA.ta, hp: TA.hp, the: TA.T && TA.T.v, pha: TA.T && TA.T.pha, chet: TA.ta === 'chet' || TA.gone,
      choang: TA.T && TA.T.cfg.choang}, moc: S.cp === MOC_E ? 'E' : S.cp === BELLS[4] ? 'F' : S.cp === BELLS[3] ? 'A' : 'khac', ren_lan: REN.lan,
    sau_ren: {mo: SAU.mo, cg: CG_SAU.map(q => ({id: 'Chuông Gỗ#' + Q.indexOf(q), hp: q.hp, ha: qDown(q)}))},
    an: {tren_dat: AN.on, co: AN.coAn, f_nhat: AN.fNhat}, cap: AD.cap, du_am: !!(AD.cs && AD.cs.co.duAm)}; }
  function xuatLog() {
    const txt = JSON.stringify(tomTat(), null, 1) + '\n\n' + LOG.map(r => r.s + (r.t !== null ? '  [' + r.t + ' ms]' : '')).join('\n');
    // app Claude (artifact) không cho tải file → CHÉP vào bộ nhớ tạm ngay trong lần bấm (như P0-B), vẫn thử tải file
    try { navigator.clipboard.writeText(txt).then(() => toast('Đã chép log P0-C – dán vào tin nhắn'), () => toast('Không chép tự động được – xem file tải về')); } catch (e) {}
    try { const b = new Blob([txt], {type: 'text/plain'}), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'log-p0c-' + P0C_PHIEN + '-f' + S.frame + '.txt'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
    catch (e) { console.log(txt); }
    return txt;
  }
  return {SO, LOG, TK, AN, REN, XU, SAU, MOC_E, veDeTag, ghi, ghiTA, taId, lamTrongE, datLai, capNhat, ve, veHop, chet, veAn, veAnHUD, ren, coTheRen, bongNghi, doiPhong, buoc, vanMoi, hoiSinh, sauHoiSinh, veSangDe, veDebug, tomTat, xuatLog};
})();

/* ---------- móc (bọc hàm có sẵn, không sửa thân) ---------- */
{ const _rq = resetQuai; resetQuai = function (q) { _rq(q); if (q.tinhAnh) P0C.datLai(q); if (q.sauRen && !q.sauRenMo) { q.gone = true; q.dead = true; } }; }   // Chuông Gỗ sau rèn: ẩn tới khi mở
// PH10 mục 4: tinh anh KHÔNG nhận đòn khi Lam ở ngoài E (đòn Lam, vết Dư Âm, bóng) – không đánh được từ vùng an toàn F / từ D (P0.thuThap đọc q.khongDanh)
TA.khongDanh = () => !P0C.lamTrongE() && TA.ta !== 'chet';
{ const _uq = updateQuai; updateQuai = function (q) { if (q.tinhAnh) { if (q.ta !== 'chet') P0.capNhatThe(q); P0C.capNhat(q); return; } _uq(q); }; }
{ const _dq = drawQuai; drawQuai = function (q, al) { if (q.tinhAnh) { P0C.ve(q, al); if (!q.gone && q.ta !== 'chet') P0.veQuai(q, al); return; } _dq(q, al); }; }
{ const _kq = killQuai; killQuai = function (q, face) { if (q.tinhAnh) return P0C.chet(q, face); _kq(q, face); }; }
{ const _dh = drawHitbox; drawHitbox = function (al) { const g = TA.gone; TA.gone = true; try { _dh(al); } finally { TA.gone = g; } P0C.veHop(al); }; }
{ const _dp = P0.doiPhong; P0.doiPhong = function () { P0C.doiPhong(); _dp(); }; }
{ const _vm = P0.vanMoi; P0.vanMoi = function () { _vm(); P0C.vanMoi(); }; }
{ const _rs = respawn; respawn = function () { P0C.hoiSinh(); _rs(); P0C.sauHoiSinh(); }; }
{ const _vd = veDe; veDe = function () { P0C.veSangDe(); _vd(); }; }
{ const _cb = P0.cuoiBuoc; P0.cuoiBuoc = function () { _cb(); P0C.buoc(); }; }
{ const _vh = veHUD; veHUD = function () { _vh(); if (PBK.hud) AD.veHUD(); P0C.veAnHUD(); }; }   // HUD mới của thu-phong-b không gọi bảng Âm Đao → gọi lại
{ const _hv = huVe; huVe = function () { P0C.veAn(); _hv(); P0C.veDeTag(); }; }
{ const _vd = P0.veDebug; P0.veDebug = function (al) { _vd(al); }; }
{ const _rd = render; render = function (al) { _rd(al); P0C.veDebug(); }; }
// gợi ý ngắn theo tình huống (khối thu-phong-b): thêm câu cho E / F
Object.assign(HINT, {
  g_huc: 'Rụt người + » = sắp húc · lùi xa hoặc {S} xuyên',
  g_ta_dap: 'Giơ tay = sắp đập · lùi ra hoặc {S}',
  g_nom_duam: 'Thử: giữ {A} rồi thả vào hình nộm',
  g_duam_ho: 'Nó đang hồi · giữ {A} rồi thả',
  g_choang: 'Vỡ Thế · đánh dồn',
  g_an: 'Nhặt Ấn Rèn I',
  g_de: 'Đe rèn · cần Ấn Rèn I',
  g_ren: 'Có Ấn Rèn I · bấm Rèn',
  g_duam: 'Cấp 3 · GIỮ {A} rồi thả = Dư Âm'
});
{ const _th = tinhHuong; tinhHuong = function (r) {
    const x = pl.x + pl.w / 2;
    if (r === PE) { const q = TA, c = q.x + q.w / 2;
      if (P0C.AN.on && Math.abs(P0C.AN.x - x) < 420) return 'g_an';
      if (!q.gone && q.ta !== 'chet' && Math.abs(c - x) < 460) { if (q.ta === 'hucBao') return 'g_huc'; if (q.ta === 'dapBao') return 'g_ta_dap'; if (q.ta === 'choang') return 'g_choang'; }
      for (const g of CG_SAU) { if (!g.sauRenMo || qDown(g) || Math.abs(g.x + g.w / 2 - x) > 300) continue;
        if (g.st === 'wind') return 'g_da'; if (g.st === 'rec' && AD.cs.co.duAm && AD.KN.hoi <= 0) return 'g_duam_ho'; }
      return ''; }
    if (r === PF) { if (AD.cap >= 3 && Math.abs(NOM_F.x + NOM_F.w / 2 - x) < 240 && !(NOM_F.nomS && NOM_F.nomS.length)) return 'g_nom_duam';
      if (Math.abs(DE.x - x) > P0C.SO.de.gan + 20) return ''; return !P0C.AN.coAn ? 'g_de' : AD.cap < 3 ? 'g_ren' : 'g_duam'; }
    return _th(r); }; }
// ⚙: nút đổi cấp của trang Âm Đao CHỈ hiện ở ?debug=p0c (người thử lên cấp bằng đe rèn); thêm "Xuất log P0-C"
(() => { const b = document.getElementById('set-cap'); if (b && !P0C_SO.log) b.hidden = true;
  const b0 = document.getElementById('set-p0'), x = document.createElement('button'); x.id = 'set-log-p0c'; x.className = 'alt'; x.type = 'button'; x.textContent = 'Xuất log P0-C (lượt này)';
  (b || b0) ? (b || b0).after(x) : document.body.appendChild(x); x.addEventListener('click', () => P0C.xuatLog()); })();
(document.getElementById('start-p0') || {}).textContent = 'P0-C · Âm Đao cấp 1 · đi A → B → C → D → E (tinh anh Chuông Gỗ Gác Lớn: giơ tay = đập, rụt người + » = húc) → F (đe rèn). Hạ tinh anh → Ấn Rèn I → rèn ở đe = cấp 3 (đánh thường mạnh hơn + Dư Âm: giữ Chém). Thử ở hình nộm F rồi quay lại E: 2 Chuông Gỗ. Vọng A: V bật / tắt ghi. ?vao=e: vào thẳng tinh anh.';

/* ---------- API cho công cụ quay (chỉ dùng với ?ghi=1) ---------- */
window.TVP0C = {P0C, TA, CG_SAU, NOM_F, SO: P0C_SO,
  tt() { const q = TA; return {f: S.frame, x: +(pl.x + pl.w / 2).toFixed(1), y: +(pl.y + pl.h).toFixed(1), face: pl.face, hp: pl.hp, atkN: pl.atkN, dash: pl.dash, g: pl.onGround, room: ROOMS[S.room].name, iframes: pl.iframes,
    ta: {ta: q.ta, t: q.t, x: +(q.x + q.w / 2).toFixed(1), face: q.face, dl: q.dapLien, cdH: q.cdHuc, cdD: q.cdDap, hp: q.hp, the: q.T ? q.T.v : 0, pha: q.T ? q.T.pha : '', gone: !!q.gone, hucDir: q.hucDir, w: q.w},
    cg: CG_SAU.map(g => ({on: !!g.sauRenMo && !qDown(g), x: +(g.x + g.w / 2).toFixed(1), st: g.st, t: g.t, hp: g.hp, face: g.face})), nom: +(NOM_F.x + NOM_F.w / 2).toFixed(1),
    duam: !!(AD.cs && AD.cs.co.duAm), knHoi: AD.KN.hoi, knNap: !!AD.KN.nap, knTu: !!AD.KN.tu, xu: P0C.XU.on, moc: P0C.tomTat().moc, renLan: P0C.REN.lan, dashCd: pl.dashCd || 0,
    an: {on: P0C.AN.on, x: +P0C.AN.x.toFixed(1), y: +P0C.AN.y.toFixed(1), co: P0C.AN.coAn}, de: DE.x, cap: AD.cap, coTheRen: P0C.coTheRen(), kn: AD.KN.hoi, echo: !!echo, rec: !!rec}; },
  ren() { P0C.ren('công cụ (phím F)'); }, log() { return P0C.LOG.map(r => r.s); }, tomTat() { return P0C.tomTat(); }};
