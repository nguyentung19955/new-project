/* ======================= P0-B – khối Vọng hai cấu hình, thêm vào bản THỬ game/thu-p0b/index.html =======================
   Theo docs/gameplay/KE-HOACH-GAMEPLAY-V2.md mục 4, 4a, 6, 7 + PHAN-HOI-1 mục 2, PHAN-HOI-3 mục 5, PHAN-HOI-7 mục 4.
   Trang sinh bằng cong-cu/tao-p0b.py từ game/thu-p0a/am-dao.html (Âm Đao CẤP 1, không Dư Âm) – KHÔNG sửa trang đó.

   Hai cấu hình chọn TRƯỚC khi vào phòng (màn bắt đầu, hoặc ?vong=a | ?vong=b). Trong phòng nút V chỉ có MỘT nghĩa. Không chạm đúp.
     A – Ghi chủ động (hiện tại): chạm V bắt đầu ghi (tối đa 3 s), chạm V lần nữa dừng → bóng phát. Code ghi y nguyên của trang Âm Đao.
     B – Vọng Chiến: vòng đệm 90 tick LUÔN ghi trạng thái Lam (không ghi phím; dừng trong hitstop); chạm V một lần → bóng phát lại
         đoạn 1,5 s vừa qua. Mới vào phòng chưa đủ 90 tick → phát đoạn đang có (> 3 tick); nút V mờ khi chưa đủ 90 tick.
         KHÔNG cắt phần đứng yên đầu đoạn (PH3 mục 5) – chỉ đo.
   Chung A và B (giống hệt): cùng phòng, cùng quái, Âm Đao cấp 1, BONG_MAU 0,25 / BONG_THE 0,5, cùng công thức Cộng hưởng (khối P0-A),
     1 bóng, gọi bóng mới thì bóng cũ mất, ĐỔI PHÒNG XOÁ BÓNG (mới thêm – P0-A không xoá), chết xoá bóng (sẵn có).
   Lượt 1 (mặc định): CẢ HAI MIỄN PHÍ. Lượt 2 = cờ riêng ?nac=1: B tốn 1 nấc Vọng (tối đa 2, hồi 1 nấc / 150 tick); A vẫn miễn phí (bảng mục 4).
   ?debug=vong  bảng log Vọng (độ trễ bấm V → hộp bóng đầu, gọi hụt, Cộng hưởng, sát thương bóng) + chuỗi cấu hình
   ?mot=1 chỉ 1 Bọ ở phòng D.   ?battu=1 Lam không chết (quay video).   Các cờ của P0-A / Âm Đao giữ nguyên (?hitbox=1, ?debug=input …). */

const VB_Q = (() => { try { return new URLSearchParams(location.search); } catch (e) { return new Map(); } })();
const VB_SO = {
  cau: (VB_Q.get('vong') || '').toLowerCase() === 'b' ? 'b' : (VB_Q.get('vong') || '').toLowerCase() === 'a' ? 'a' : '',   // '' = chưa chọn (màn bắt đầu)
  dem: 90,                // B: vòng đệm 90 tick = 1,5 s
  toiThieu: 3,            // B: phát khi đoạn có > 3 tick (giống A: rec.n > 3)
  nac: VB_Q.get('nac') === '1',   // LƯỢT 2: tài nguyên Vọng Chiến. Mặc định TẮT (lượt 1: cả hai miễn phí)
  nacToiDa: 2, hoiNac: 150,
  log: VB_Q.get('debug') === 'vong',
  ghiA: P.echoFrames      // A: tối đa 180 tick (3 s) như trang hiện tại – không đổi
};
function vbChuoiCfg() {
  return (VB_SO.cau || '?').toUpperCase() + '|bm' + CFG.BONG_MAU + '|bt' + CFG.BONG_THE + '|ch' + CFG.CH_MAU + '|ct' + CFG.CH_THE +
    (VB_SO.nac && VB_SO.cau === 'b' ? '|n' + VB_SO.nacToiDa + '|h' + VB_SO.hoiNac : '|mien-phi') + '|cap1';
}

const VB = (() => {
  const SO = VB_SO, LOG = [];
  const RING = []; for (let i = 0; i < SO.dem; i++) RING.push({});
  let dau = 0, nR = 0;      // vòng đệm: dau = ô sẽ ghi tiếp; nR = số tick đang có (≤ 90)
  const TK = {bamV: 0, batDauGhi: 0, phat: 0, phatTuDung: 0, bamKhongPhat: 0, hetNac: 0, hut: 0, khongCoDon: 0, coDonKhongTrung: 0,
    chBong: 0, mauBong: 0, theBong: 0, trungBong: 0, xoaDoiPhong: 0, xoaChet: 0, thayBong: 0};
  const PHAT = [];          // mọi lần phát (đã xong hoặc đang chạy)
  let cur = null;           // lần phát đang chạy
  let dem = 0;              // bước logic (mọi bước không tạm dừng, KỂ CẢ bước khựng hitstop)
  let nac = SO.nacToiDa, hoiT = 0, phong = -1, res0 = 0;
  let tBamGhi = -1, fBamGhi = -1;   // A: lúc bấm bắt đầu ghi

  function ghi(s, loai) { const d = 'f' + S.frame + ' b' + dem + ' ' + s; LOG.push({s: d, loai: loai || ''}); if (LOG.length > 300) LOG.shift(); if (SO.log) console.log('[Vọng] ' + d); }

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

  /* ---- một lần phát ---- */
  function batDauPhat(kieu) {   // gọi NGAY SAU khi echo mới được tạo (stopRec)
    const n = echo.n; let hop0 = -1, yen = 0, coDon = false;
    for (let i = 0; i < n; i++) if (REC[i].hb) { hop0 = i; coDon = true; break; }
    for (let i = 0; i < n; i++) { const r = REC[i]; if (r.n || Math.abs(r.x - REC[0].x) > 0.5 || Math.abs(r.y - REC[0].y) > 0.5) break; yen++; }
    const tBam = dem;
    cur = {id: echo.id, cau: SO.cau, kieu, n, tBam, fBam: S.frame, tGhi: SO.cau === 'a' ? tBamGhi : -1, hop0, yen, coDon,
      tHop: -1, fHop: -1, tTrung: -1, trung: 0, mau: 0, the: 0, ch: 0, xong: false, lyDo: '', phong: S.room};
    PHAT.push(cur); TK.phat++; if (kieu === 'tu-dung') TK.phatTuDung++;
    res0 = S.resCount;
    ghi('PHÁT bóng #' + cur.id + ' [' + vbChuoiCfg() + '] ' + (kieu === 'tu-dung' ? 'A tự dừng ở 180 tick' : 'bấm V') + ': đoạn ' + n + ' tick' +
      (coDon ? ', hộp đầu ở tick ' + hop0 + ' của đoạn' : ', KHÔNG có đòn nào trong đoạn') + ', đứng yên đầu đoạn ' + yen + ' tick (KHÔNG cắt)' +
      (cur.tGhi >= 0 ? ' · từ lúc bấm bắt đầu ghi: ' + (dem - cur.tGhi) + ' bước' : ''), 'phat');
  }
  function ketThuc(ly) {
    if (!cur || cur.xong) return; const c = cur; c.xong = true; c.lyDo = ly; cur = null;
    if (!c.trung) { TK.hut++; if (c.coDon) TK.coDonKhongTrung++; else TK.khongCoDon++; }
    ghi('HẾT bóng #' + c.id + ' (' + ly + '): ' + (c.trung ? 'trúng ' + c.trung + ' lần, máu ' + c.mau + ', Thế ' + c.the + ', Cộng hưởng ' + c.ch :
      'HỤT TÁC DỤNG – ' + (c.coDon ? 'có đòn nhưng không trúng gì' : 'đoạn không có đòn')) +
      (c.tHop >= 0 ? ' · bấm V → hộp bóng đầu ' + (c.tHop - c.tBam) + ' bước (' + (c.fHop - c.fBam) + ' tick mô phỏng)' : '') +
      (c.tTrung >= 0 ? ' · → trúng đầu ' + (c.tTrung - c.tBam) + ' bước' : ''), c.trung ? 'het' : 'hut');
  }
  function sauBong() {   // gọi mỗi bước logic SAU thuThapBong
    if (cur && echo && echo.id === cur.id && !echo.done && echo.cur.hb && cur.tHop < 0) {
      cur.tHop = dem; cur.fHop = S.frame;
      ghi('hộp bóng #' + cur.id + ' ĐẦU TIÊN bật: bấm V → hộp ' + (dem - cur.tBam) + ' bước logic (' + (S.frame - cur.fBam) + ' tick mô phỏng, trừ khựng)' +
        ' = đứng yên đầu đoạn ' + cur.yen + ' + phần còn lại ' + (cur.hop0 - cur.yen) + ' tick + khựng', 'tre');
    }
    if (cur) { const d = S.resCount - res0; if (d > 0) { cur.ch += d; TK.chBong += d; res0 = S.resCount; } }
    if (cur && echo && echo.id === cur.id && echo.done && S.frame - (cur.fXong || (cur.fXong = S.frame)) > CFG.resWindow) ketThuc('phát xong');
    if (cur && (!echo || echo.id !== cur.id)) ketThuc(echo ? 'bị bóng mới thay' : 'bóng bị xoá');
  }
  function bongTrung(e, m, t, chan) {   // một lần trúng của bóng (sau gom tick) – Q và Bọ
    TK.trungBong++; TK.mauBong += m; TK.theBong += t;
    if (cur) { if (!cur.trung) { cur.tTrung = dem; ghi('bóng #' + cur.id + ' TRÚNG ĐẦU: bấm V → trúng ' + (dem - cur.tBam) + ' bước', 'tre'); }
      cur.trung++; cur.mau += m; cur.the += t; }
    ghi('  bóng trúng ' + e + ': máu ' + m + (chan ? ' (bị chặn)' : '') + ', Thế ' + t, 'trung');
  }

  /* ---- nút V (thay cho đoạn "if(rec) stopRec(); else startRec();" của trang) ---- */
  function bamV() {
    TK.bamV++;
    if (SO.cau === 'a') {
      if (rec) { const n = rec.n; stopRec(); if (echo && !echo.done && echo.i === 0) { if (cur) ketThuc('bị bóng mới thay'); batDauPhat('bam'); } else { TK.bamKhongPhat++; ghi('A: dừng ghi ở ' + n + ' tick ≤ 3 → không phát', 'hut'); } }
      else { if (echo) { if (cur) ketThuc(echo.done ? 'phát xong' : 'bị bóng mới thay (bắt đầu ghi mới)'); if (!echo.done) TK.thayBong++; } tBamGhi = dem; fBamGhi = S.frame; TK.batDauGhi++; startRec(); ghi('A: bấm V – BẮT ĐẦU GHI', 'ghi'); }
      return;
    }
    if (SO.cau !== 'b') return;
    if (SO.nac && nac < 1) { TK.hetNac++; TK.bamKhongPhat++; ghi('B: bấm V – HẾT NẤC (hồi ' + (SO.hoiNac - hoiT) + ' tick nữa)', 'hut'); bell(220, 0.2, 0.04); return; }
    if (nR <= SO.toiThieu) { TK.bamKhongPhat++; ghi('B: bấm V – đoạn ghi mới ' + nR + ' tick (≤ ' + SO.toiThieu + ') → không phát', 'hut'); return; }
    if (echo) { if (cur) ketThuc(echo.done ? 'phát xong' : 'bị bóng mới thay'); if (!echo.done) TK.thayBong++; }
    const m = nR, o = (dau - m + SO.dem) % SO.dem;
    for (let i = 0; i < m; i++) chep(REC[i], RING[(o + i) % SO.dem]);   // cũ → mới, CHÉP sâu (vòng đệm ghi tiếp không đè bóng đang phát)
    rec = RECST; rec.n = m; stopRec();
    if (SO.nac) { if (nac >= SO.nacToiDa) hoiT = 0; nac--; }
    batDauPhat('bam');
    if (SO.nac) ghi('B: tốn 1 nấc → còn ' + nac + '/' + SO.nacToiDa, 'nac');
  }
  function tuDung() { stopRec(); if (echo && !echo.done && echo.i === 0) { if (cur) ketThuc('bị bóng mới thay'); batDauPhat('tu-dung'); } }   // A: hết 180 tick tự dừng
  function truocKhung() { dem++; }   // mọi bước không tạm dừng (trước hitstop)
  function buoc(hb) {   // mỗi bước logic SAU hitstop (đúng chỗ recordFrame của A)
    if (SO.cau === 'b' && !pl.dead) ghiVong(hb);
    if (SO.nac && SO.cau === 'b' && nac < SO.nacToiDa) { if (++hoiT >= SO.hoiNac) { nac++; hoiT = 0; ghi('B: hồi 1 nấc → ' + nac + '/' + SO.nacToiDa, 'nac'); } }
  }
  function doiPhong() {
    if (S.room === phong) return;
    if (phong >= 0) {
      if (echo || rec) { TK.xoaDoiPhong++; ghi('ĐỔI PHÒNG → xoá bóng' + (rec ? ' + huỷ đang ghi' : ''), 'xoa'); }
      echo = null; rec = null; if (cur) ketThuc('đổi phòng xoá bóng');
      xoaVong('đổi phòng');
    }
    phong = S.room;
  }
  function chet() { if (echo || rec) TK.xoaChet++; if (cur) ketThuc('chết xoá bóng'); xoaVong('hồi sinh'); }
  function vanMoi() { xoaVong('ván mới'); if (cur) ketThuc('ván mới'); nac = SO.nacToiDa; hoiT = 0; phong = S.room; }
  function tk() {
    const xong = PHAT.filter(p => p.tHop >= 0), tre = xong.map(p => p.tHop - p.tBam), treT = PHAT.filter(p => p.tTrung >= 0).map(p => p.tTrung - p.tBam);
    const tb = a => a.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : null;
    return Object.assign({cfg: vbChuoiCfg(), dem, nR, nac, treHopTB: tb(tre), treHopMin: tre.length ? Math.min(...tre) : null, treHopMax: tre.length ? Math.max(...tre) : null,
      treTrungTB: tb(treT), yenTB: tb(PHAT.map(p => p.yen)), hop0TB: tb(PHAT.filter(p => p.hop0 >= 0).map(p => p.hop0)), resTong: S.resCount}, TK);
  }
  return {SO, LOG, TK, PHAT, RING, ghi, bamV, tuDung, truocKhung, buoc, sauBong, bongTrung, doiPhong, chet, vanMoi, tk, chuoi: vbChuoiCfg,
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
{ const _rs = respawn; respawn = function () { VB.chet(); _rs(); }; }
{ const _vd = P0.veDebug; P0.veDebug = function (al) { _vd(al); if (VB.SO.log) vbVeDebug(); }; }
function vbVeDebug() {
  const t = VB.tk(), x = 8, y0 = 128;
  ctx.save(); ctx.font = '12px "DejaVu Sans Mono", Menlo, monospace'; ctx.textBaseline = 'top';
  const L = ['VỌNG ' + t.cfg + '  (?debug=vong)',
    'bấm V ' + t.bamV + ' · phát ' + t.phat + (t.phatTuDung ? ' (A tự dừng ' + t.phatTuDung + ')' : '') + ' · bấm không phát ' + t.bamKhongPhat + (VB.SO.nac ? ' · hết nấc ' + t.hetNac : ''),
    'bấm V → hộp bóng đầu: TB ' + t.treHopTB + ' (min ' + t.treHopMin + ', max ' + t.treHopMax + ') bước · → trúng đầu TB ' + t.treTrungTB,
    'đoạn mở đầu chưa có hộp TB ' + t.hop0TB + ' tick, trong đó đứng yên TB ' + t.yenTB + ' (KHÔNG cắt) · gọi HỤT ' + t.hut + ' (không đòn ' + t.khongCoDon + ', có đòn không trúng ' + t.coDonKhongTrung + ')',
    'bóng trúng ' + t.trungBong + ' · máu ' + t.mauBong + ' · Thế ' + t.theBong + ' · Cộng hưởng có bóng ' + t.chBong + ' / tổng ' + t.resTong,
    VB.SO.cau === 'b' ? 'vòng đệm ' + t.nR + '/90' + (VB.SO.nac ? ' · nấc ' + t.nac + '/2' : ' · MIỄN PHÍ') : 'A: ' + (rec ? 'ĐANG GHI ' + rec.n + '/180' : 'không ghi')];
  for (const r of VB.LOG.slice(-10)) L.push(r.s.length > 120 ? r.s.slice(0, 118) + '…' : r.s);
  const w = 640; ctx.fillStyle = 'rgba(12,15,20,.78)'; ctx.fillRect(x - 4, y0 - 4, w, L.length * 14 + 8);
  L.forEach((s, i) => { ctx.fillStyle = i === 0 ? '#7FE0C8' : i < 6 ? '#F3E6C8' : '#c9c9c9'; ctx.fillText(s, x, y0 + i * 14); });
  ctx.restore();
}
/* ---- HUD: nhãn cấu hình + (B) vòng đệm / nấc ---- */
{ const _hud = veHUD; veHUD = function () { _hud();
  const x = 10, y = 104; ctx.save(); ctx.font = '700 12px "Be Vietnam Pro", sans-serif'; ctx.textBaseline = 'top';
  const s = VB.SO.cau === 'b' ? 'B · Vọng Chiến' : VB.SO.cau === 'a' ? 'A · Ghi chủ động' : '';
  ctx.fillStyle = 'rgba(12,15,20,.55)'; ctx.fillRect(x - 4, y - 2, 150, 18); ctx.fillStyle = '#CEF0D6'; ctx.fillText(s, x, y);
  if (VB.SO.cau === 'b') { const k = VB.nR / VB.SO.dem; ctx.fillStyle = '#2a2e35'; ctx.fillRect(x + 104, y + 4, 36, 5); ctx.fillStyle = k >= 1 ? '#CEF0D6' : '#6f8f7a'; ctx.fillRect(x + 104, y + 4, Math.round(36 * k), 5);
    if (VB.SO.nac) for (let i = 0; i < VB.SO.nacToiDa; i++) { ctx.fillStyle = i < VB.nac ? '#CEF0D6' : '#2a2e35'; ctx.fillRect(x + 104 + i * 12, y + 11, 9, 4); } }
  ctx.restore(); }; }
/* ---- nút V mờ khi B chưa đủ 90 tick (hoặc hết nấc ở lượt 2) ---- */
{ const _ui = updRecUI; updRecUI = function () { _ui(); if (VB.SO.cau !== 'b') return;
  const mo = VB.nR < VB.SO.dem || (VB.SO.nac && VB.nac < 1); const o = mo ? '0.45' : ''; if (bV.style.opacity !== o) bV.style.opacity = o; }; }

/* ---- màn bắt đầu: chọn A / B TRƯỚC khi vào phòng; ⚙: đổi cấu hình (tải lại trang, vào lại từ đầu) ---- */
(() => {
  const st = document.getElementById('btn-start'), p = document.getElementById('start-p0'), sv = document.getElementById('start-v');
  const moTa = {a: 'A · Ghi chủ động: chạm Vọng bắt đầu ghi (tối đa 3 giây), chạm lần nữa → bóng lặp lại.',
    b: 'B · Vọng Chiến: chạm Vọng MỘT lần → bóng phát lại 1,5 giây vừa qua.'};
  if (p) p.textContent = 'P0-B · Âm Đao cấp 1 · ' + (VB.SO.cau ? 'cấu hình ' + VB.SO.cau.toUpperCase() : 'chọn cấu hình Vọng') +
    (VB.SO.nac ? ' · lượt 2: Vọng Chiến tốn nấc (2 nấc, hồi 1 / 150 tick)' : ' · lượt 1: Vọng MIỄN PHÍ ở cả A và B') + ' · ?debug=vong: log.';
  if (sv) sv.innerHTML = VB.SO.cau ? moTa[VB.SO.cau] : 'Chọn một cách gọi bóng. Trong phòng nút Vọng chỉ có một nghĩa.';
  if (!VB.SO.cau && st) {
    st.hidden = true;
    for (const k of ['a', 'b']) { const b = document.createElement('button'); b.type = 'button'; b.id = 'btn-vong-' + k; b.textContent = k === 'a' ? 'A – Ghi chủ động' : 'B – Vọng Chiến';
      b.style.margin = '4px'; st.before(b);
      b.addEventListener('click', () => { VB.SO.cau = k; if (sv) sv.innerHTML = moTa[k];
        try { const u = new URL(location.href); u.searchParams.set('vong', k); history.replaceState(null, '', u.toString()); } catch (e) {}
        VB.ghi('chọn cấu hình ' + vbChuoiCfg() + ' trên màn bắt đầu', 'cfg'); st.click(); }); }
  }
  const b0 = document.getElementById('set-cap'); if (b0) b0.hidden = true;   // P0-B: khoá Âm Đao cấp 1
  const s = document.getElementById('set-dbg'); if (s) { const b = document.createElement('button'); b.id = 'set-vong'; b.className = 'alt'; b.type = 'button';
    b.textContent = 'Vọng: ' + (VB.SO.cau ? VB.SO.cau.toUpperCase() : '?') + ' – bấm để đổi (vào lại từ đầu)'; s.before(b);
    b.addEventListener('click', () => { const u = new URL(location.href); u.searchParams.set('vong', VB.SO.cau === 'a' ? 'b' : 'a'); location.href = u.toString(); }); }
})();
HINT.p0a = '{B} chạm {A} = chém · ' + (VB_SO.cau === 'b' ? 'chạm {V} một lần = bóng phát lại 1,5 giây vừa qua' : 'chạm {V} ghi, chạm lần nữa = bóng lặp lại') + ' · đi sang phải';
VB.ghi('cấu hình ' + vbChuoiCfg() + (VB_SO.cau ? '' : ' (chưa chọn – màn bắt đầu)'), 'cfg');

/* ---- API cho công cụ quay / đo (chỉ dùng với ?ghi=1) ---- */
window.TVVB = {
  VB, SO: VB_SO,
  tk() { return VB.tk(); }, log() { return VB.LOG.map(r => r.s); }, phat() { return VB.PHAT.map(p => Object.assign({}, p)); },
  trangThai() {
    const bo = typeof BO !== 'undefined' ? BO.DS.map((b, i) => ({i, x: b.x + b.w / 2, st: b.st, t: b.t, hp: b.hp, mai: b.mai, face: b.face, chet: b.st === 'chet' || b.gone, vo: !!b.maiVo})) : [];
    return {f: S.frame, dem: VB.dem, room: S.room, lx: pl.x + pl.w / 2, ly: pl.y, face: pl.face, hurt: pl.hurtT, atkN: pl.atkN, g: pl.onGround, hp: pl.hp, dead: pl.dead,
      rec: rec ? rec.n : -1, echo: echo ? {id: echo.id, i: echo.i, n: echo.n, done: echo.done} : null, nR: VB.nR, nac: VB.nac,
      q: [3, 4, 5].map(i => ({i, x: Q[i].x + Q[i].w / 2, st: Q[i].st, hp: Q[i].hp, chet: Q[i].dead || Q[i].st === 'die' || Q[i].gone, room: roomAt(Q[i].x + Q[i].w / 2)})),
      bo, pd: [PD.x0 * T, (PD.x0 + PD.w) * T], pc: [PC.x0 * T, (PC.x0 + PC.w) * T]};
  }
};
