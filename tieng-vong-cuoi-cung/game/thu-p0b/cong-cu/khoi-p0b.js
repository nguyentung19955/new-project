/* ======================= P0-B – khối Vọng hai cấu hình, thêm vào bản THỬ game/thu-p0b/index.html =======================
   Theo docs/gameplay/KE-HOACH-GAMEPLAY-V2.md mục 4, 4a, 6, 7 + PHAN-HOI-1 mục 2, PHAN-HOI-3 mục 5, PHAN-HOI-7 mục 4, PHAN-HOI-9 (28/10).
   Trang sinh bằng cong-cu/tao-p0b.py từ game/thu-p0a/am-dao.html (Âm Đao CẤP 1, không Dư Âm) – KHÔNG sửa trang đó.

   Cấu hình chọn TRƯỚC khi vào phòng (màn bắt đầu, hoặc ?vong=a | ?vong=b | ?vong=b2). Trong phòng nút V chỉ có MỘT nghĩa. Không chạm đúp.
     A  – Ghi chủ động: bấm V bắt đầu ghi (tối đa 3 s), đánh, bấm V lần nữa → bóng phát. Code ghi y nguyên của trang Âm Đao.
     B  – Vọng Chiến (B1, mốc): vòng đệm 90 tick LUÔN ghi trạng thái Lam (không ghi phím; dừng trong hitstop); bấm V một lần → bóng phát lại
          đoạn đang có (tối đa 1,5 s). Gọi được khi đoạn > 3 tick – KHÔNG phải đợi đầy 90 (90 là sức chứa tối đa).
     B2 – BIẾN THỂ, TẮT mặc định (chỉ ?vong=b2, PH9 mục 1.1): trong vòng đệm chọn lần BẮT ĐẦU ĐÒN gần nhất đã có hộp đòn xuất hiện, phát từ
          lúc bắt đầu đòn đó (gồm chuẩn bị) tới cuối bản ghi. Phần chuẩn bị nằm ngoài vòng đệm → bỏ đòn đó. Không có đòn hợp lệ → báo
          "chưa có đòn để vọng", không tốn nấc, không xoá bóng cũ. Giữ toạ độ gốc, không bám địch, không chọn đòn từng trúng.
   Chung (giống hệt): cùng phòng, cùng quái, Âm Đao cấp 1, BONG_MAU 0,25 / BONG_THE 0,5, cùng công thức Cộng hưởng (khối P0-A), 1 bóng,
     gọi bóng mới thì bóng cũ mất, ĐỔI PHÒNG GAMEPLAY xoá bóng (+ vòng đệm B), chết xoá bóng.
   SỬA PH9 mục 1.3 (cả A và B, trong tao-p0b.py): mẫu cuối của đoạn được xử lý ĐỦ (hình + hộp + hit của tick đó) rồi mới kết thúc phát;
     bóng xong → tư thế NGHỈ theo hướng cuối, không hộp đòn, mờ hơn (?tan=1: tan hẳn – biến thể, tắt mặc định, áp cho cả hai).
   Tài nguyên (lượt 2, cờ riêng): ?nac=1 → B/B2 tốn 1 nấc mỗi lần (2 nấc, hồi 1 / 150 tick mô phỏng); ?nac=1&suc=1 → sức chứa 1 nấc (chuẩn bị
     thử sau, TẮT mặc định). A luôn miễn phí (chỉ tham chiếu). Bấm khi thiếu nấc / thiếu lịch sử: không trừ gì, không xoá bóng cũ.
   LOG NỀN: luôn thu từ đầu (không cần ?debug). ⚙ → "Chép log lượt này" = CHÉP JSON + tóm tắt vào bộ nhớ tạm (không tải file; không che màn chơi).
   ĐÓNG BĂNG cho buổi thử iPhone (PH10 mục 4): mặc định A/B miễn phí, Âm Đao cấp 1, không Dư Âm, pogo cũ; B2 / nấc / tan TẮT. Link có cờ thử khác → màn đầu ghi "BIẾN THỂ".
   ?debug=vong  bảng log Vọng trên màn (chỉ để xem; log nền vẫn thu khi tắt)   ?battu=1 Lam không chết (quay video)
   Các cờ của P0-A / Âm Đao giữ nguyên (?hitbox=1, ?debug=input …). */

const VB_PHIEN = '__PHIEN__';   // tao-p0b.py điền: ngày + mã băm nguồn (ghi vào log để biết phiên bản game)
const VB_DONG_BANG = '28/10/2026 lần 2 (kiếm to, vệt chém mềm, nhảy mềm)';   // PH10 đóng băng 28/10; lần 2 = sửa theo nhận xét iPhone 28/10 (chỉ hình kiếm, vệt chém, nhảy – cấu hình Vọng giữ nguyên)
const VB_Q = (() => { try { return new URLSearchParams(location.search); } catch (e) { return new Map(); } })();
const VB_SO = {
  cau: (() => { const v = (VB_Q.get('vong') || '').toLowerCase(); return v === 'a' || v === 'b' || v === 'b2' ? v : ''; })(),   // '' = chưa chọn (màn bắt đầu)
  dem: 90,                // B: vòng đệm 90 tick = 1,5 s mô phỏng (SỨC CHỨA tối đa)
  toiThieu: 3,            // B: gọi được khi đoạn > 3 tick (giống A: rec.n > 3)
  nac: VB_Q.get('nac') === '1',   // LƯỢT TÀI NGUYÊN. Mặc định TẮT (lượt chính: cả hai miễn phí)
  nacToiDa: VB_Q.get('suc') === '1' ? 1 : 2,   // ?suc=1: 1 nấc / 150 (chuẩn bị thử sau, chỉ đổi sức chứa)
  hoiNac: 150,
  tan: VB_Q.get('tan') === '1',   // biến thể: bóng tan khi phát xong (cả A và B). Mặc định: giữ tư thế NGHỈ
  tanTick: 30,
  log: VB_Q.get('debug') === 'vong',
  ghiA: P.echoFrames      // A: tối đa 180 tick (3 s) như trang hiện tại – không đổi
};
const VB_LAB = () => VB_SO.cau === 'b' || VB_SO.cau === 'b2';
function vbChuoiCfg() {
  return (VB_SO.cau || '?').toUpperCase() + '|bm' + CFG.BONG_MAU + '|bt' + CFG.BONG_THE + '|ch' + CFG.CH_MAU + '|ct' + CFG.CH_THE +
    (VB_SO.nac && VB_LAB() ? '|n' + VB_SO.nacToiDa + '|h' + VB_SO.hoiNac : '|mien-phi') + (VB_SO.tan ? '|tan' : '|nghi') + '|cap1|' + VB_PHIEN;
}

const VB = (() => {
  const SO = VB_SO, LOG = [], SU = [];   // LOG: mọi dòng (log nền); SU: sự kiện tạm dừng / focus / tab / reset
  const RING = []; for (let i = 0; i < SO.dem; i++) RING.push({});
  let dau = 0, nR = 0;      // vòng đệm: dau = ô sẽ ghi tiếp; nR = số tick đang có (≤ 90)
  const TK = {bamV: 0, batDauGhi: 0, ghiQuaNgan: 0, phat: 0, phatTuDung: 0, bamKhongPhat: 0, thieuLichSu: 0, b2KhongDon: 0, hetNac: 0,
    khongGayHit: 0, khongCoDon: 0, coDonHut: 0, mucTieuChet: 0, huyDoiPhong: 0, huyThayBong: 0, huyKhac: 0,
    chBong: 0, mauBong: 0, theBong: 0, trungBong: 0, xoaDoiPhong: 0, xoaChet: 0, thayBong: 0, hopMauCuoi: 0, trungMauCuoi: 0, chMauCuoi: 0, reset: 0};
  const PHAT = [];          // mọi lần phát (đã xong hoặc đang chạy)
  let cur = null;           // lần phát đang chạy
  let dem = 0;              // bước logic (mọi bước không tạm dừng, KỂ CẢ bước khựng hitstop)
  let nac = SO.nacToiDa, hoiT = 0, phong = -1, res0 = 0;
  let tBamGhi = -1, fBamGhi = -1;   // A: lúc bấm bắt đầu ghi
  const msNow = () => P0_SO.ghi ? null : performance.now();   // công cụ tự bước → không có đồng hồ thật

  function ghi(s, loai) { const d = 'f' + S.frame + ' b' + dem + ' ' + s; LOG.push({s: d, loai: loai || '', t: P0_SO.ghi ? null : Math.round(performance.now())}); if (LOG.length > 6000) LOG.shift(); if (SO.log) console.log('[Vọng] ' + d); }
  function suKien(s) { SU.push({f: S.frame, b: dem, t: P0_SO.ghi ? null : Math.round(performance.now()), s}); if (SU.length > 500) SU.shift(); ghi('SỰ KIỆN: ' + s, 'su'); }

  /* ---- ghi vào vòng đệm: dùng ĐÚNG recordFrame của trang (cùng trường, cùng P0.ghiHop – hộp mang goc/co/maGoc) ---- */
  const GIA = {n: 0};
  function ghiVong(hb) {
    const slot = RING[dau], giu0 = REC[0], giuRec = rec;
    REC[0] = slot; rec = GIA; GIA.n = 0;
    try { recordFrame(hb); } finally { REC[0] = giu0; rec = giuRec; }
    dau = (dau + 1) % SO.dem; if (nR < SO.dem) nR++;
  }
  function chep(d, s) {
    for (const k in s) {
      if (k === 'hop') {
        if (!d.hop) { d.hop = []; for (let i = 0; i < 4; i++) d.hop.push({loai: '', x: 0, y: 0, w: 0, h: 0, goc: [0, 0], co: null, maGoc: 0, hs: 0, n: 0}); }
        for (let i = 0; i < 4; i++) { const a = s.hop[i], b = d.hop[i]; if (!a) continue; for (const j in a) { if (j === 'goc') { b.goc[0] = a.goc[0]; b.goc[1] = a.goc[1]; } else b[j] = a[j]; } }
      } else d[k] = s[k];
    }
  }
  function xoaVong(ly) { if (nR) ghi('vòng đệm xoá (' + ly + ', đang có ' + nR + ' tick)', 'xoa'); nR = 0; dau = 0; }
  const oVong = i => RING[(dau - nR + i + SO.dem * 2) % SO.dem];   // i = 0 (cũ nhất) … nR−1 (mới nhất)

  /* ---- trạng thái lịch sử (B) – TÁCH khỏi trạng thái nấc ---- */
  function lichSu() { return nR <= SO.toiThieu ? 'chua' : nR < SO.dem ? 'mot-phan' : 'day'; }
  /* ---- B2: chọn lần bắt đầu đòn gần nhất ĐÃ có hộp trong vòng đệm ---- */
  function chonB2() {
    const xet = [];
    for (let i = nR - 1; i >= 0; i--) {
      const s = oVong(i); if (!s.hb) continue;
      const sw = s.sw; if (xet.indexOf(sw) >= 0) continue; xet.push(sw);
      let j = i; while (j > 0) { const t = oVong(j - 1); if (t.n && t.sw === sw) j--; else break; }
      if (j === 0) return {ok: false, ly: 'đòn gần nhất (mã ' + sw + ') bắt đầu NGOÀI vòng đệm – bỏ'};   // đòn cũ hơn còn nằm ngoài xa hơn
      return {ok: true, dau: j, sw, at0: oVong(j).at};
    }
    return {ok: false, ly: nR ? 'không có đòn nào đã ra hộp trong ' + nR + ' tick' : 'vòng đệm trống'};
  }
  let b2Cache = -1, b2Ok = false;
  function b2SanSang() { if (b2Cache !== dem) { b2Cache = dem; b2Ok = SO.cau === 'b2' && nR > SO.toiThieu && chonB2().ok; } return b2Ok; }

  /* ---- mục tiêu còn sống trong phòng (phân loại "mục tiêu đã chết") ---- */
  function dichSong(room) {
    for (const q of Q) if (!q.dead && !q.gone && q.st !== 'die' && roomAt(q.x + q.w / 2) === room) return true;
    if (typeof BO !== 'undefined') for (const b of BO.DS) if (!b.gone && b.st !== 'chet' && roomAt(b.x + b.w / 2) === room) return true;
    return false;
  }
  function chamXac(r) {
    for (const q of Q) if ((q.dead || q.st === 'die') && !q.gone && overlap(r, q)) return true;
    if (typeof BO !== 'undefined') for (const b of BO.DS) if (b.st === 'chet' && !b.gone && overlap(r, b)) return true;
    return false;
  }

  /* ---- một lần phát ---- */
  function batDauPhat(kieu, them) {   // gọi NGAY SAU khi echo mới được tạo (stopRec)
    const n = echo.n; let hop0 = -1, yen = 0, coDon = false; const ma = [];
    for (let i = 0; i < n; i++) if (REC[i].hb) { if (hop0 < 0) hop0 = i; coDon = true; if (ma.indexOf(REC[i].sw) < 0) ma.push(REC[i].sw); }
    for (let i = 0; i < n; i++) { const r = REC[i]; if (r.n || Math.abs(r.x - REC[0].x) > 0.5 || Math.abs(r.y - REC[0].y) > 0.5) break; yen++; }
    echo.tanT = 0;
    const tBam = dem - 1;   // mốc = TRƯỚC bước bấm (cùng mốc với fBam: S.frame chưa tăng ở bước bấm) → bước ≥ tick; chênh = số bước khựng
    cur = Object.assign({id: echo.id, cau: SO.cau, kieu, n, tBam, fBam: S.frame, msBam: msNow(), tGhi: SO.cau === 'a' ? tBamGhi : -1, hop0, yen, coDon, soNhat: ma.length,
      hopCuoi: !!REC[n - 1].hb, trungCuoi: false, chCuoi: false, dichSongLucBam: dichSong(S.room), dichSongLucHop: null, chamXac: false,
      tHop: -1, fHop: -1, msHop: null, tTrung: -1, fTrung: -1, msTrung: null, trung: 0, mau: 0, the: 0, ch: 0, xong: false, lyDo: '', khongHit: '', phong: S.room}, them || {});
    PHAT.push(cur); TK.phat++; if (kieu === 'tu-dung') TK.phatTuDung++; if (cur.hopCuoi) TK.hopMauCuoi++;
    res0 = S.resCount;
    ghi('PHÁT bóng #' + cur.id + ' [' + vbChuoiCfg() + '] ' + (kieu === 'tu-dung' ? 'A tự dừng ở 180 tick' : 'bấm V') + ': đoạn ' + n + ' tick' +
      (cur.b2 ? ' (B2: bỏ ' + cur.b2.bo + ' tick đầu vòng đệm, bắt đầu từ đòn mã ' + cur.b2.sw + ')' : '') +
      (coDon ? ', ' + ma.length + ' nhát, hộp đầu ở tick ' + hop0 + ' của đoạn' : ', KHÔNG có đòn nào trong đoạn') + (cur.hopCuoi ? ', MẪU CUỐI có hộp' : '') +
      ', đứng yên đầu đoạn ' + yen + ' tick (KHÔNG cắt)' + (cur.dichSongLucBam ? '' : ', KHÔNG còn địch sống trong phòng') +
      (cur.tGhi >= 0 ? ' · từ lúc bấm bắt đầu ghi: ' + (dem - cur.tGhi) + ' bước' : ''), 'phat');
  }
  function ketThuc(ly) {
    if (!cur || cur.xong) return; const c = cur; c.xong = true; c.lyDo = ly; cur = null;
    if (!c.trung) {
      TK.khongGayHit++;
      const huy = ly !== 'phát xong';
      if (huy && ly.indexOf('đổi phòng') >= 0) { c.khongHit = 'huy-doi-phong'; TK.huyDoiPhong++; }
      else if (huy && ly.indexOf('bóng mới') >= 0) { c.khongHit = 'huy-thay-bong'; TK.huyThayBong++; }
      else if (huy) { c.khongHit = 'huy-khac'; TK.huyKhac++; }
      else if (!c.coDon) { c.khongHit = 'khong-co-don'; TK.khongCoDon++; }
      else if (c.chamXac || !c.dichSongLucBam || c.dichSongLucHop === false) { c.khongHit = 'muc-tieu-da-chet'; TK.mucTieuChet++; }
      else { c.khongHit = 'co-don-hut'; TK.coDonHut++; }
    }
    const TEN = {'huy-doi-phong': 'bị huỷ khi đổi phòng', 'huy-thay-bong': 'bị huỷ khi thay bóng', 'huy-khac': 'bị huỷ (' + ly + ')',
      'khong-co-don': 'không có đòn trong đoạn', 'muc-tieu-da-chet': 'mục tiêu đã chết', 'co-don-hut': 'có đòn nhưng hụt'};
    ghi('HẾT bóng #' + c.id + ' (' + ly + '): ' + (c.trung ? 'trúng ' + c.trung + ' lần, máu ' + c.mau + ', Thế ' + c.the + ', Cộng hưởng ' + c.ch :
      'KHÔNG GÂY HIT / ảnh hưởng chiến đấu – ' + TEN[c.khongHit]) + (c.trungCuoi ? ' · có trúng ở MẪU CUỐI' : '') +
      (c.tHop >= 0 ? ' · bấm V → hộp bóng đầu ' + (c.tHop - c.tBam) + ' bước (' + (c.fHop - c.fBam) + ' tick mô phỏng + ' + ((c.tHop - c.tBam) - (c.fHop - c.fBam)) + ' bước khựng' +
        (c.msHop !== null ? ', ' + Math.round(c.msHop - c.msBam) + ' ms thật' : '') + ')' : ' · hộp bóng KHÔNG bật') +
      (c.tTrung >= 0 ? ' · → trúng đầu ' + (c.tTrung - c.tBam) + ' bước' : ''), c.trung ? 'het' : 'hut');
  }
  /* bóng phát xong: tư thế NGHỈ theo hướng cuối (gọi từ updateEcho đã sửa ở bước SAU mẫu cuối) */
  const NGHI = {hb: false, nh: 0, n: 0, at: 0, sw: 0, hop: null};
  function nghi() {
    const c = echo.cur; for (const k in c) if (k !== 'hop') NGHI[k] = c[k];
    NGHI.hb = false; NGHI.nh = 0; NGHI.n = 0; NGHI.at = 0; NGHI.a2 = 'idle'; NGHI.l2 = c.f < 0; NGHI.ak = null;
    const k = hdK('tho', 0); NGHI.k2 = k >= 0 ? k : KHUNG_NGHI; NGHI.h2 = k >= 0;
    echo.cur = NGHI; echo.tanT = 0;
    ghi('bóng #' + echo.id + ' phát XONG (đủ ' + echo.n + ' mẫu) → ' + (SO.tan ? 'TAN trong ' + SO.tanTick + ' tick' : 'tư thế NGHỈ hướng ' + (c.f < 0 ? 'trái' : 'phải') + ', không hộp đòn, mờ'), 'nghi');
  }
  function doNoi() { return SO.tan && echo ? Math.max(0, 1 - (echo.tanT || 0) / SO.tanTick) : 1; }   // độ nổi bóng nghỉ (tan → 0)
  function sauBong() {   // gọi mỗi bước logic SAU thuThapBong (trước giaiQuyet)
    if (cur && echo && echo.id === cur.id && !echo.done && echo.cur.hb) {
      if (cur.tHop < 0) { cur.tHop = dem; cur.fHop = S.frame; cur.msHop = msNow(); cur.dichSongLucHop = dichSong(S.room);
        ghi('hộp bóng #' + cur.id + ' ĐẦU TIÊN bật: bấm V → hộp ' + (dem - cur.tBam) + ' bước logic (' + (S.frame - cur.fBam) + ' tick mô phỏng + ' +
          ((dem - cur.tBam) - (S.frame - cur.fBam)) + ' bước khựng)' + (cur.msHop !== null ? ' · ' + Math.round(cur.msHop - cur.msBam) + ' ms thật' : '') +
          ' = đứng yên đầu đoạn ' + cur.yen + ' + phần còn lại ' + (cur.hop0 - cur.yen) + ' tick + khựng', 'tre'); }
      const c = echo.cur; if (!cur.chamXac && chamXac({x: c.hx, y: c.hy, w: c.hw, h: c.hh})) cur.chamXac = true;
    }
    if (cur && echo && echo.id === cur.id && echo.done && S.frame - (cur.fXong || (cur.fXong = S.frame)) > CFG.resWindow) ketThuc('phát xong');
    if (cur && (!echo || echo.id !== cur.id)) ketThuc(echo ? 'bị bóng mới thay' : 'bóng bị xoá');
    if (SO.tan && echo && echo.done && ++echo.tanT >= SO.tanTick) { ghi('bóng #' + echo.id + ' đã tan', 'nghi'); echo = null; }
  }
  function sauGiaiQuyet() {   // sau P0.giaiQuyet: Cộng hưởng của tick (kể cả tick mẫu cuối)
    if (!cur) return; const d = S.resCount - res0;
    if (d > 0) { cur.ch += d; TK.chBong += d; res0 = S.resCount; if (echo && echo.id === cur.id && !echo.done && echo.i === echo.n) { cur.chCuoi = true; TK.chMauCuoi++; ghi('Cộng hưởng ở tick MẪU CUỐI của bóng #' + cur.id, 'ch'); } }
  }
  function bongTrung(e, m, t, chan) {   // một lần trúng của bóng (sau gom tick) – Q và Bọ
    TK.trungBong++; TK.mauBong += m; TK.theBong += t;
    if (cur) { if (!cur.trung) { cur.tTrung = dem; cur.fTrung = S.frame; cur.msTrung = msNow(); ghi('bóng #' + cur.id + ' TRÚNG ĐẦU: bấm V → trúng ' + (dem - cur.tBam) + ' bước (' + (S.frame - cur.fBam) + ' tick mô phỏng)', 'tre'); }
      cur.trung++; cur.mau += m; cur.the += t;
      if (echo && echo.id === cur.id && !echo.done && echo.i === echo.n) { if (!cur.trungCuoi) TK.trungMauCuoi++; cur.trungCuoi = true; ghi('  (trúng ở tick MẪU CUỐI của đoạn)', 'trung'); } }
    ghi('  bóng trúng ' + e + ': máu ' + m + (chan ? ' (bị chặn)' : '') + ', Thế ' + t, 'trung');
  }
  function thayBongCu() { if (echo) { if (cur) ketThuc(echo.done ? 'phát xong' : 'bị bóng mới thay'); if (!echo.done) TK.thayBong++; } }

  /* ---- nút V (thay cho đoạn "if(rec) stopRec(); else startRec();" của trang) ---- */
  function bamV() {
    TK.bamV++;
    if (SO.cau === 'a') {
      if (rec) { const n = rec.n; stopRec(); if (echo && !echo.done && echo.i === 0) { if (cur) ketThuc('bị bóng mới thay'); batDauPhat('bam'); }
        else { TK.bamKhongPhat++; TK.ghiQuaNgan++; ghi('A: dừng ghi ở ' + n + ' tick ≤ 3 → GHI QUÁ NGẮN, không phát', 'hut'); } }
      else { if (echo) { if (cur) ketThuc(echo.done ? 'phát xong' : 'bị bóng mới thay (bắt đầu ghi mới)'); if (!echo.done) TK.thayBong++; }
        tBamGhi = dem - 1; fBamGhi = S.frame; TK.batDauGhi++; startRec(); ghi('A: bấm V – BẮT ĐẦU GHI', 'ghi'); }
      return;
    }
    if (!VB_LAB()) return;
    // 1) lịch sử  2) B2: có đòn hợp lệ  3) nấc – thiếu cái nào cũng KHÔNG trừ gì, KHÔNG xoá bóng cũ
    if (nR <= SO.toiThieu) { TK.bamKhongPhat++; TK.thieuLichSu++; ghi('B: bấm V – đoạn ghi mới ' + nR + ' tick (≤ ' + SO.toiThieu + ') → CHƯA SẴN SÀNG, không phát, giữ bóng cũ', 'hut'); return; }
    let bo = 0, b2 = null;
    if (SO.cau === 'b2') { const c = chonB2();
      if (!c.ok) { TK.bamKhongPhat++; TK.b2KhongDon++; ghi('B2: bấm V – CHƯA CÓ ĐÒN ĐỂ VỌNG (' + c.ly + ') → không phát, không tốn nấc, giữ bóng cũ', 'hut'); toast('Chưa có đòn để vọng'); bell(260, 0.15, 0.03); return; }
      bo = c.dau; b2 = {bo, sw: c.sw, at0: c.at0, vong: nR}; }
    if (SO.nac && nac < 1) { TK.hetNac++; TK.bamKhongPhat++; ghi('B: bấm V – HẾT NẤC (hồi ' + (SO.hoiNac - hoiT) + ' tick nữa) → không phát, giữ bóng cũ', 'hut'); toast('Hết nấc Vọng'); bell(220, 0.2, 0.04); return; }
    thayBongCu();
    const m = nR - bo;
    for (let i = 0; i < m; i++) chep(REC[i], oVong(bo + i));   // cũ → mới, CHÉP sâu (vòng đệm ghi tiếp không đè bóng đang phát)
    rec = RECST; rec.n = m; stopRec();
    if (SO.nac) { if (nac >= SO.nacToiDa) hoiT = 0; nac--; }
    batDauPhat('bam', {b2, lichSu: lichSu(), vong: nR});
    if (SO.nac) ghi('B: tốn 1 nấc → còn ' + nac + '/' + SO.nacToiDa, 'nac');
  }
  function tuDung() { stopRec(); if (echo && !echo.done && echo.i === 0) { if (cur) ketThuc('bị bóng mới thay'); batDauPhat('tu-dung'); } }   // A: hết 180 tick tự dừng
  function truocKhung() { dem++; }   // mọi bước không tạm dừng (trước hitstop)
  function buoc(hb) {   // mỗi bước logic SAU hitstop (đúng chỗ recordFrame của A) = tick MÔ PHỎNG; tạm dừng / tab ẩn không chạy bước → không hồi
    if (VB_LAB() && !pl.dead) ghiVong(hb);
    if (SO.nac && VB_LAB() && nac < SO.nacToiDa) { if (++hoiT >= SO.hoiNac) { nac++; hoiT = 0; ghi('B: hồi 1 nấc → ' + nac + '/' + SO.nacToiDa, 'nac'); } }
  }
  function doiPhong() {
    if (S.room === phong) return;
    if (phong >= 0) {
      ghi('vào phòng ' + S.room + ' (' + (ROOMS[S.room] && ROOMS[S.room].name || '') + ')', 'phong');
      if (echo || rec) { TK.xoaDoiPhong++; ghi('ĐỔI PHÒNG → xoá bóng' + (rec ? ' + huỷ đang ghi' : ''), 'xoa'); }
      echo = null; rec = null; if (cur) ketThuc('đổi phòng xoá bóng');
      xoaVong('đổi phòng');
    }
    phong = S.room;
  }
  function chet() { if (echo || rec) TK.xoaChet++; ghi('Lam ngã → hồi sinh, xoá bóng', 'xoa'); if (cur) ketThuc('chết xoá bóng'); xoaVong('hồi sinh'); }
  function vanMoi() { xoaVong('ván mới'); if (cur) ketThuc('ván mới'); nac = SO.nacToiDa; hoiT = 0; phong = S.room; }
  /* ---- số tổng: mẫu số rõ ràng, tách tick mô phỏng / bước có khựng / ms thật ---- */
  function thongKeTre(L, kieu) {   // kieu 'hop' | 'trung'
    const ok = L.filter(p => (kieu === 'hop' ? p.tHop : p.tTrung) >= 0);
    const b = ok.map(p => (kieu === 'hop' ? p.tHop : p.tTrung) - p.tBam), t = ok.map(p => (kieu === 'hop' ? p.fHop : p.fTrung) - p.fBam);
    const ms = ok.filter(p => p.msBam !== null && (kieu === 'hop' ? p.msHop : p.msTrung) !== null).map(p => (kieu === 'hop' ? p.msHop : p.msTrung) - p.msBam);
    const tb = a => a.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : null;
    return {thanhCong: ok.length, tong: L.length, buocTB: tb(b), buocMin: b.length ? Math.min(...b) : null, buocMax: b.length ? Math.max(...b) : null,
      tickTB: tb(t), tickMin: t.length ? Math.min(...t) : null, tickMax: t.length ? Math.max(...t) : null, khungTB: tb(b.map((x, i) => x - t[i])), msTB: tb(ms)};
  }
  function tk() {
    const tb = a => a.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : null;
    const nhip = []; for (let i = 1; i < PHAT.length; i++) nhip.push(PHAT[i].tBam - PHAT[i - 1].tBam);
    const hop = thongKeTre(PHAT, 'hop'), trung = thongKeTre(PHAT, 'trung');
    return Object.assign({cfg: vbChuoiCfg(), phien: VB_PHIEN, dem, nR, lichSu: lichSu(), nac, nacToiDa: SO.nacToiDa, treHop: hop, treTrung: trung,
      treHopTB: hop.buocTB, treHopMin: hop.buocMin, treHopMax: hop.buocMax, treTrungTB: trung.buocTB,   // (tên cũ – đơn vị: bước logic kể cả khựng)
      yenTB: tb(PHAT.map(p => p.yen)), hop0TB: tb(PHAT.filter(p => p.hop0 >= 0).map(p => p.hop0)), doanTB: tb(PHAT.map(p => p.n)), soNhatTB: tb(PHAT.map(p => p.soNhat)),
      soNhat: PHAT.reduce((x, p) => x + p.soNhat, 0), nhipGoiTB: tb(nhip), nhipGoiMin: nhip.length ? Math.min(...nhip) : null, resTong: S.resCount,
      hut: TK.khongGayHit}, TK);   // hut = tên cũ của khongGayHit
  }
  function tomTat() {
    const t = tk(), h = t.treHop, r = t.treTrung;
    return ['P0-B · cấu hình ' + t.cfg, 'bấm V ' + t.bamV + (SO.cau === 'a' ? ' (bắt đầu ghi ' + t.batDauGhi + ', ghi quá ngắn ' + t.ghiQuaNgan + ', tự dừng 180 tick ' + t.phatTuDung + ')' : '') +
      ' · phát ' + t.phat + ' · bấm không phát ' + t.bamKhongPhat + ' (thiếu lịch sử ' + t.thieuLichSu + ', B2 chưa có đòn ' + t.b2KhongDon + ', hết nấc ' + t.hetNac + ')',
      'bấm V → hộp bóng đầu: ' + h.thanhCong + '/' + h.tong + ' lần có hộp · TB ' + h.tickTB + ' tick mô phỏng, ' + h.buocTB + ' bước (khựng ' + h.khungTB + ')' + (h.msTB !== null ? ', ' + h.msTB + ' ms thật' : ''),
      'bấm V → trúng đầu: ' + r.thanhCong + '/' + r.tong + ' lần trúng · TB ' + r.tickTB + ' tick, ' + r.buocTB + ' bước' + (r.msTB !== null ? ', ' + r.msTB + ' ms' : ''),
      'không gây hit / ảnh hưởng chiến đấu: ' + t.khongGayHit + '/' + t.phat + ' (không có đòn ' + t.khongCoDon + ', có đòn nhưng hụt ' + t.coDonHut + ', mục tiêu đã chết ' + t.mucTieuChet +
        ', huỷ khi đổi phòng ' + t.huyDoiPhong + ', huỷ khi thay bóng ' + t.huyThayBong + ', huỷ khác ' + t.huyKhac + ')',
      'bóng trúng ' + t.trungBong + ' · máu ' + t.mauBong + ' · Thế ' + t.theBong + ' · Cộng hưởng có bóng ' + t.chBong + ' / tổng ' + t.resTong + ' · số nhát trong đoạn TB ' + t.soNhatTB +
        ' · đoạn TB ' + t.doanTB + ' tick · nhịp gọi TB ' + t.nhipGoiTB + ' bước',
      'thay bóng đang phát ' + t.thayBong + ' · xoá khi đổi phòng ' + t.xoaDoiPhong + ' · reset ' + t.reset + ' · sự kiện tạm dừng / focus / tab ' + SU.length].join('\n');
  }
  return {SO, LOG, SU, TK, PHAT, RING, ghi, suKien, bamV, tuDung, truocKhung, buoc, sauBong, sauGiaiQuyet, bongTrung, doiPhong, chet, vanMoi, nghi, doNoi, tk, tomTat,
    lichSu, chonB2, b2SanSang, chuoi: vbChuoiCfg,
    get nR() { return nR; }, get nac() { return nac; }, get hoiT() { return hoiT; }, get cur() { return cur; }, get dem() { return dem; }};
})();

/* ---- Bọ ở phòng D: đi qua hộp Lam / bóng của P0 (D bền: sw = D.ma, mỗi lần phát bóng mã mới) ---- */
function VB_trungBo(hb, D, face, n) {
  if (typeof BO === 'undefined' || !BO.N) return false;
  const bong = D.src === 'e', s0 = bong ? BO.DS.map(b => [b.hp, b.mai, b.swE, b.khoaCH]) : null;
  const co = BO.trung(hb, D.src, D.ma, face, n);
  if (co && bong) BO.DS.forEach((b, i) => { const [h0, m0, sw0, k0] = s0[i];
    if (b.swE !== D.ma || sw0 === D.ma) return;                       // con này không bị bóng này trúng ở lần gọi này
    const ch = b.khoaCH !== k0, them = ch ? Math.floor(CFG.CH_MAU * (b.lastPMau || 0)) : 0;   // phần thêm Cộng hưởng không tính là sát thương bóng
    const vaoMai = !(b.namDau || b.voDau) && n !== 4 && face !== b.face;  // trạng thái ĐẦU BƯỚC (Bọ tự lưu trong trung1)
    const dm = Math.max(0, h0 - Math.max(0, b.hp) - them), dt = vaoMai ? Math.min(m0, Math.floor((PL_CS[n] || PL_CS[1]).goc[1] * CFG.BONG_THE)) : 0;
    VB.bongTrung('Bọ#' + i + (vaoMai ? ' (mai)' : ' (thân/bụng)'), dm, dt, vaoMai); });
  return co;
}

/* ---- móc vào trang (tao-p0b.py chèn các lời gọi VB.xxx / VB_trungBo vào am-dao.html) ---- */
{ const _dp = P0.doiPhong; P0.doiPhong = function () { _dp(); VB.doiPhong(); }; }
{ const _vm = P0.vanMoi; P0.vanMoi = function () { _vm(); VB.vanMoi(); }; }
{ const _gq = P0.giaiQuyet; P0.giaiQuyet = function () { _gq(); VB.sauGiaiQuyet(); }; }
{ const _rs = respawn; respawn = function () { VB.chet(); _rs(); }; }
{ const _vd = P0.veDebug; P0.veDebug = function (al) { _vd(al); if (VB.SO.log) vbVeDebug(); }; }
/* tạm dừng / tiếp tục (⚙, màn dừng) – ghi sự kiện vào log nền; bước tạm dừng không chạy mô phỏng nên không hồi nấc, không ghi vòng đệm */
{ let dung0 = null; const _st = step; step = function () { if (S.paused !== dung0) { if (dung0 !== null) VB.suKien(S.paused ? 'tạm dừng' : 'chơi tiếp'); dung0 = S.paused; } _st(); }; }
addEventListener('blur', () => VB.suKien('mất focus (blur)'));
addEventListener('focus', () => VB.suKien('có focus lại'));
document.addEventListener('visibilitychange', () => VB.suKien(document.hidden ? 'trang bị ẩn (chuyển tab / app)' : 'trang hiện lại'));
addEventListener('orientationchange', () => VB.suKien('xoay màn: ' + (innerWidth > innerHeight ? 'ngang' : 'dọc')));
function vbVeDebug() {
  const t = VB.tk(), x = 8, y0 = 128, h = t.treHop;
  ctx.save(); ctx.font = '12px "DejaVu Sans Mono", Menlo, monospace'; ctx.textBaseline = 'top';
  const L = ['VỌNG ' + t.cfg + '  (?debug=vong · log nền luôn thu)',
    'bấm V ' + t.bamV + ' · phát ' + t.phat + (t.phatTuDung ? ' (A tự dừng ' + t.phatTuDung + ')' : '') + ' · bấm không phát ' + t.bamKhongPhat + (VB.SO.nac ? ' · hết nấc ' + t.hetNac : '') + (VB.SO.cau === 'b2' ? ' · B2 chưa có đòn ' + t.b2KhongDon : ''),
    'bấm V → hộp bóng đầu: ' + h.thanhCong + '/' + h.tong + ' · TB ' + h.tickTB + ' tick mô phỏng / ' + h.buocTB + ' bước (khựng ' + h.khungTB + ') · → trúng đầu ' + t.treTrung.thanhCong + '/' + t.treTrung.tong + ' TB ' + t.treTrung.tickTB + ' tick',
    'đoạn TB ' + t.doanTB + ' tick, mở đầu chưa hộp TB ' + t.hop0TB + ' (đứng yên ' + t.yenTB + ', KHÔNG cắt) · không gây hit ' + t.khongGayHit + ' (không đòn ' + t.khongCoDon + ', hụt ' + t.coDonHut + ', địch chết ' + t.mucTieuChet + ', huỷ ' + (t.huyDoiPhong + t.huyThayBong + t.huyKhac) + ')',
    'bóng trúng ' + t.trungBong + ' · máu ' + t.mauBong + ' · Thế ' + t.theBong + ' · Cộng hưởng có bóng ' + t.chBong + ' / tổng ' + t.resTong + ' · mẫu cuối: có hộp ' + t.hopMauCuoi + ', trúng ' + t.trungMauCuoi,
    VB_LAB() ? 'vòng đệm ' + t.nR + '/90 (' + t.lichSu + ')' + (VB.SO.nac ? ' · nấc ' + t.nac + '/' + t.nacToiDa : ' · MIỄN PHÍ') : 'A: ' + (rec ? 'ĐANG GHI ' + rec.n + '/180' : 'không ghi')];
  for (const r of VB.LOG.slice(-10)) L.push(r.s.length > 120 ? r.s.slice(0, 118) + '…' : r.s);
  const w = 660; ctx.fillStyle = 'rgba(12,15,20,.78)'; ctx.fillRect(x - 4, y0 - 4, w, L.length * 14 + 8);
  L.forEach((s, i) => { ctx.fillStyle = i === 0 ? '#7FE0C8' : i < 6 ? '#F3E6C8' : '#c9c9c9'; ctx.fillText(s, x, y0 + i * 14); });
  ctx.restore();
}
/* ---- HUD: nhãn cấu hình + (B) thanh lịch sử (sẵn sàng / chưa đầy / đầy) TÁCH với ô nấc ---- */
{ const _hud = veHUD; veHUD = function () { _hud();
  const x = 10, y = 104, lab = VB_LAB(); ctx.save(); ctx.font = '700 12px "Be Vietnam Pro", sans-serif'; ctx.textBaseline = 'top';
  const s = VB.SO.cau === 'b2' ? 'B2 · từ đòn gần nhất' : VB.SO.cau === 'b' ? 'B · Vọng Chiến' : VB.SO.cau === 'a' ? 'A · Ghi chủ động' : '';
  ctx.fillStyle = 'rgba(12,15,20,.55)'; ctx.fillRect(x - 4, y - 2, lab ? 236 : 150, VB.SO.nac && lab ? 30 : 18); ctx.fillStyle = '#CEF0D6'; ctx.fillText(s, x, y);
  if (lab) { const ls = VB.lichSu(), k = VB.nR / VB.SO.dem, bx = x + 132;
    const san = ls !== 'chua' && (VB.SO.cau !== 'b2' || VB.b2SanSang());
    ctx.fillStyle = '#2a2e35'; ctx.fillRect(bx, y + 4, 40, 5); ctx.fillStyle = ls === 'day' ? '#CEF0D6' : san ? '#9fd8b0' : '#5a6a60'; ctx.fillRect(bx, y + 4, Math.round(40 * k), 5);
    ctx.font = '600 10px "Be Vietnam Pro", sans-serif'; ctx.fillStyle = san ? '#CEF0D6' : '#8a9a90';
    ctx.fillText(VB.SO.cau === 'b2' && ls !== 'chua' && !san ? 'chưa có đòn' : ls === 'chua' ? 'chưa sẵn sàng' : ls === 'day' ? 'sẵn sàng · đầy' : 'sẵn sàng', bx + 46, y + 1);
    if (VB.SO.nac) { ctx.fillStyle = '#CEF0D6'; ctx.fillText('nấc', x, y + 16);
      for (let i = 0; i < VB.SO.nacToiDa; i++) { ctx.fillStyle = i < VB.nac ? '#E1B85A' : '#2a2e35'; ctx.fillRect(x + 26 + i * 14, y + 18, 11, 6); } } }
  ctx.restore(); }; }
/* ---- nút V: trạng thái LỊCH SỬ (chưa sẵn sàng = mờ / sẵn sàng chưa đầy = viền gạch / đầy) TÁCH trạng thái NẤC (hết nấc = viền vàng đỏ, chữ 0) ---- */
{ const st = document.createElement('style');
  st.textContent = '#b-v.vb-chua{opacity:.45}#b-v.vb-motphan{border-style:dashed!important;outline:2px dashed rgba(206,240,214,.75);outline-offset:3px}'+
    '#set .box{max-height:96vh;overflow:auto;-webkit-overflow-scrolling:touch}#b-v.vb-hetnac{filter:grayscale(.85);border-color:#d9894a!important}' +
    '#b-v.vb-hetnac::after{content:"0";position:absolute;right:-4px;top:-4px;font:800 11px/16px sans-serif;width:16px;height:16px;border-radius:8px;background:#d9894a;color:#0C0F14;text-align:center}' +
    '#vb-xuat-tt{white-space:pre-wrap;text-align:left;font:11px/1.35 Menlo,monospace;max-height:34vh;overflow:auto;background:rgba(12,15,20,.6);padding:6px;border-radius:6px;user-select:text;-webkit-user-select:text}';
  document.head.appendChild(st); }
{ const _ui = updRecUI; let k0 = ''; updRecUI = function () { _ui(); if (!VB_LAB()) return;
  const ls = VB.lichSu(), chua = ls === 'chua' || (VB.SO.cau === 'b2' && !VB.b2SanSang()), het = VB.SO.nac && VB.nac < 1;
  const k = (chua ? 'c' : '') + (ls === 'mot-phan' ? 'm' : '') + (het ? 'h' : ''); if (k === k0) return; k0 = k;
  bV.classList.toggle('vb-chua', chua); bV.classList.toggle('vb-motphan', !chua && ls === 'mot-phan'); bV.classList.toggle('vb-hetnac', !!het);
  if (bV.style.opacity) bV.style.opacity = ''; }; }

/* ---- XUẤT LOG (nền, không cần ?debug): JSON + tóm tắt; lưu bản lượt trước khi đổi cấu hình / rời trang ---- */
const VB_BAT_DAU = new Date().toISOString();
/* cấu hình ĐÓNG BĂNG = link chỉ có ?vong=a|b (+ ?debug / ?hitbox để xem). Cờ khác (b2, nac, suc, tan, pogo, giu, cg, battu, …) → biến thể, ghi rõ trong log */
function vbDongBang() { const co = []; try { new URLSearchParams(location.search).forEach((v, k) => { if (k === 'vong' ? !(v === 'a' || v === 'b' || v === '') : ['debug', 'hitbox'].indexOf(k) < 0) co.push(k + '=' + v); }); } catch (e) {}
  return {ngay: VB_DONG_BANG, phien: VB_PHIEN, dung: !co.length, coThu: co}; }
function vbThietBi() {
  const ua = navigator.userAgent || '', ios = (ua.match(/OS (\d+[_\d]*) like Mac OS X/) || [])[1];
  return {ua, ios: ios ? ios.replace(/_/g, '.') : null, safari: /Safari/.test(ua) && !/CriOS|FxiOS|Chrome/.test(ua), man: [screen.width, screen.height], cuaSo: [innerWidth, innerHeight],
    dpr: devicePixelRatio || 1, huong: innerWidth > innerHeight ? 'ngang' : 'dọc', cam: 'ontouchstart' in window};
}
function vbGoiLog() {
  return {loai: 'tieng-vong-p0b-log', phien: VB_PHIEN, cfg: vbChuoiCfg(), url: location.href, batDau: VB_BAT_DAU, luc: new Date().toISOString(), thietBi: vbThietBi(),
    tomTat: VB.tomTat(), tk: VB.tk(), phat: VB.PHAT.map(p => Object.assign({}, p)), suKien: VB.SU.slice(), log: VB.LOG.map(r => (r.t !== null ? r.t + 'ms ' : '') + r.s),
    p0: {tk: P0.TK, log: P0.LOG.map(r => r.s)}, chet: S.deaths, congHuong: S.resCount, thoiGianChoi: S.play, dongBang: vbDongBang()};
}
function vbLuuTruoc() { try { localStorage.setItem('tv-p0b-log-truoc', JSON.stringify(vbGoiLog())); } catch (e) {} }
addEventListener('pagehide', () => { VB.suKien('pagehide (rời trang / chuyển app)'); vbLuuTruoc(); });
/* Đường lấy log DUY NHẤT: CHÉP vào bộ nhớ tạm (ngay trong lần bấm) rồi dán vào tin nhắn. KHÔNG tải file / bảng Chia sẻ (app Claude – artifact –
   không cho tải file; bảng Chia sẻ bật lên đè chữ "đã chép" gây rối). Chép bị từ chối → hiện tóm tắt + ô chứa TOÀN BỘ log, đã chọn sẵn, giữ ngón tay → Copy. */
function vbChepCu(txt) {   // execCommand('copy') – còn chạy được ở nơi chặn navigator.clipboard (khung nhúng, http)
  try { const o = document.createElement('textarea'); o.value = txt; o.setAttribute('readonly', ''); o.style.cssText = 'position:fixed;left:0;top:0;opacity:0;font-size:16px';
    document.body.appendChild(o); o.focus(); o.select(); o.setSelectionRange(0, txt.length); const ok = document.execCommand('copy'); o.remove(); return !!ok; } catch (e) { return false; }
}
function vbXuat(noi) {   // noi: chỗ hiện kết quả (mặc định ô ở đầu bảng ⚙; màn kết thúc truyền ô thống kê của nó)
  const g = vbGoiLog(); let truoc = null; try { truoc = JSON.parse(localStorage.getItem('tv-p0b-log-truoc') || 'null'); } catch (e) {}
  if (truoc && truoc.batDau !== g.batDau) g.luotTruoc = truoc;   // lượt trước (cấu hình cũ) – lưu tự động khi đổi cấu hình / rời trang
  const tt = noi || document.getElementById('vb-xuat-tt'), tom = g.tomTat + (g.luotTruoc ? '\n\n(kèm lượt trước: ' + g.luotTruoc.cfg + ')\n' + g.luotTruoc.tomTat : '');
  const txt = g.tomTat + '\n\n' + JSON.stringify(g);
  VB.ghi('CHÉP LOG (' + txt.length + ' ký tự)', 'xuat');
  const hien = (ok, cach) => {
    VB.ghi(ok ? 'chép log: ĐƯỢC (' + cach + ')' : 'chép log: BỊ TỪ CHỐI → hiện ô chọn-copy', 'xuat');
    if (ok) toast('Đã chép log – dán vào tin nhắn');
    if (!tt) return; tt.hidden = false;
    tt.textContent = (ok ? '✓ ĐÃ CHÉP LOG (' + Math.round(txt.length / 1024) + ' KB) – dán (Paste) vào tin nhắn gửi Claude.\n\n'
      : '✗ Không chép tự động được. Giữ ngón tay trong ô dưới → Chọn tất cả → Copy (ô chứa TOÀN BỘ log). Nếu vẫn không được: copy đoạn tóm tắt này.\n\n') + tom;
    if (!ok) { const o = document.createElement('textarea'); o.id = 'vb-xuat-o'; o.readOnly = true; o.value = txt;
      o.style.cssText = 'display:block;width:100%;height:9em;margin-top:6px;font:11px Menlo,monospace;user-select:text;-webkit-user-select:text';
      tt.appendChild(o); try { o.focus(); o.select(); o.setSelectionRange(0, txt.length); } catch (e) {} }
  };
  let p = null; try { if (navigator.clipboard && navigator.clipboard.writeText) p = navigator.clipboard.writeText(txt); } catch (e) { p = null; }
  if (!p) { hien(vbChepCu(txt), 'execCommand'); return; }
  p.then(() => hien(true, 'clipboard'), () => hien(vbChepCu(txt), 'execCommand'));
}

/* ---- màn bắt đầu: chọn A / B TRƯỚC khi vào phòng; ⚙: đổi cấu hình (lưu log lượt này, tải lại trang, vào lại từ đầu), xuất log, chơi lại ---- */
(() => {
  const st = document.getElementById('btn-start'), p = document.getElementById('start-p0'), sv = document.getElementById('start-v');
  const moTa = {a: '<b>A · Ghi chủ động</b>: <b>bấm Vọng để GHI</b>, đánh, <b>bấm Vọng lần nữa để PHÁT</b> – bóng làm lại đúng đoạn bạn đã ghi (tối đa 3 giây).',
    b: '<b>B · Vọng Chiến</b>: <b>bấm Vọng một lần để gọi lại 1,5 giây vừa qua</b> – bóng làm lại những gì bạn vừa làm.',
    b2: '<b>B2 · Vọng từ đòn gần nhất</b>: bấm Vọng một lần → bóng làm lại <b>từ nhát chém gần nhất</b> trong 1,5 giây vừa qua tới lúc bấm.'};
  if (p) p.textContent = 'P0-B · Âm Đao cấp 1 · ' + (VB.SO.cau ? 'cấu hình ' + VB.SO.cau.toUpperCase() : 'chọn cấu hình Vọng') +
    (VB.SO.nac ? ' · lượt tài nguyên: Vọng Chiến tốn nấc (' + VB.SO.nacToiDa + ' nấc, hồi 1 / 150 tick)' : ' · Vọng MIỄN PHÍ') + (VB.SO.tan ? ' · bóng tan khi xong' : '') + ' · ' + VB_PHIEN +
    (vbDongBang().dung ? ' · bản ĐÓNG BĂNG ' + VB_DONG_BANG : ' · BIẾN THỂ (không phải bản đóng băng: ' + vbDongBang().coThu.join(', ') + ')');
  if (sv) sv.innerHTML = VB.SO.cau ? moTa[VB.SO.cau] : moTa.a + '<br>' + moTa.b + '<br>Chọn một cách. Trong phòng nút Vọng chỉ có một nghĩa.';
  if (!VB.SO.cau && st) {
    st.hidden = true;
    for (const k of ['a', 'b']) { const b = document.createElement('button'); b.type = 'button'; b.id = 'btn-vong-' + k; b.textContent = k === 'a' ? 'A – Ghi chủ động' : 'B – Vọng Chiến';
      b.style.margin = '4px'; st.before(b);
      b.addEventListener('click', () => { VB.SO.cau = k; if (sv) sv.innerHTML = moTa[k];
        try { const u = new URL(location.href); u.searchParams.set('vong', k); history.replaceState(null, '', u.toString()); } catch (e) {}
        HINT.p0a = vbHint(); VB.ghi('chọn cấu hình ' + vbChuoiCfg() + ' trên màn bắt đầu', 'cfg'); st.click(); }); }
  }
  const b0 = document.getElementById('set-cap'); if (b0) b0.hidden = true;   // P0-B: khoá Âm Đao cấp 1
  const s = document.getElementById('set-dbg'); if (s) {
    const mk = (id, chu) => { const b = document.createElement('button'); b.id = id; b.className = 'alt'; b.type = 'button'; b.textContent = chu; s.before(b); return b; };
    mk('set-vong', 'Vọng: ' + (VB.SO.cau ? VB.SO.cau.toUpperCase() : '?') + ' – đổi A↔B (lưu log lượt này, vào lại từ đầu)').addEventListener('click', () => {
      VB.suKien('đổi cấu hình (tải lại trang)'); vbLuuTruoc(); const u = new URL(location.href); u.searchParams.set('vong', VB.SO.cau === 'a' ? 'b' : 'a'); location.href = u.toString(); });
    mk('set-lai', 'Chơi lại từ đầu (máu, quái, lịch sử, nấc như nhau)').addEventListener('click', () => {
      VB.TK.reset++; VB.suKien('CHƠI LẠI TỪ ĐẦU (reset máu, quái, lịch sử, nấc)'); newGame(); document.getElementById('btn-set-ok').click(); });
    mk('set-xuat', 'Chép log lượt này (dán vào tin nhắn)').addEventListener('click', () => { vbXuat(); });
    const tt = document.createElement('div'); tt.id = 'vb-xuat-tt'; tt.hidden = true; s.parentElement.prepend(tt);   // tóm tắt ở ĐẦU bảng ⚙ (bảng tạm dừng – không che lúc chơi)
  }
  const ag = document.getElementById('btn-again'); if (ag) { const b = document.createElement('button'); b.type = 'button'; b.className = 'alt'; b.id = 'end-xuat'; b.textContent = 'Chép log lượt này';
    ag.after(b); b.addEventListener('click', () => { const e = document.getElementById('end-stats'); if (e) e.style.whiteSpace = 'pre-wrap'; vbXuat(e || undefined); }); }
})();
function vbHint() { return '{B} chạm {A} = chém · ' + (VB_SO.cau === 'a' ? 'bấm {V} ghi, đánh, bấm {V} lần nữa = phát' : VB_SO.cau === 'b2' ? 'bấm {V} = bóng làm lại từ nhát chém gần nhất' : VB_SO.cau === 'b' ? 'bấm {V} = gọi lại 1,5 giây vừa qua' : 'chọn cách gọi bóng') + ' · đi sang phải'; }
HINT.p0a = vbHint();
VB.ghi('cấu hình ' + vbChuoiCfg() + (VB_SO.cau ? '' : ' (chưa chọn – màn bắt đầu)') + ' · ' + (vbDongBang().dung ? 'bản ĐÓNG BĂNG ' + VB_DONG_BANG : 'BIẾN THỂ: ' + vbDongBang().coThu.join(', ')) + ' · log nền bắt đầu', 'cfg');

/* ---- API cho công cụ quay / đo (chỉ dùng với ?ghi=1) ---- */
window.TVVB = {
  VB, SO: VB_SO,
  tk() { return VB.tk(); }, log() { return VB.LOG.map(r => r.s); }, phat() { return VB.PHAT.map(p => Object.assign({}, p)); }, goiLog() { return vbGoiLog(); },
  trangThai() {
    const bo = typeof BO !== 'undefined' ? BO.DS.map((b, i) => ({i, x: b.x + b.w / 2, st: b.st, t: b.t, hp: b.hp, mai: b.mai, face: b.face, chet: b.st === 'chet' || b.gone, vo: !!b.maiVo})) : [];
    return {f: S.frame, dem: VB.dem, room: S.room, lx: pl.x + pl.w / 2, ly: pl.y, face: pl.face, hurt: pl.hurtT, atkN: pl.atkN, g: pl.onGround, hp: pl.hp, dead: pl.dead,
      rec: rec ? rec.n : -1, echo: echo ? {id: echo.id, i: echo.i, n: echo.n, done: echo.done, hb: !!echo.cur.hb, a2: echo.cur.a2} : null, nR: VB.nR, nac: VB.nac,
      q: [3, 4, 5].map(i => ({i, x: Q[i].x + Q[i].w / 2, st: Q[i].st, hp: Q[i].hp, chet: Q[i].dead || Q[i].st === 'die' || Q[i].gone, room: roomAt(Q[i].x + Q[i].w / 2)})),
      bo, pd: [PD.x0 * T, (PD.x0 + PD.w) * T], pc: [PC.x0 * T, (PC.x0 + PC.w) * T]};
  }
};
