/* ======================= P0-A – khối thêm vào bản THỬ game/thu-p0a/index.html =======================
   Theo docs/gameplay/KE-HOACH-GAMEPLAY-V2.md mục 3, 6, 7, 8 + PHAN-HOI-3 (mã đòn bền, thứ tự trúng, quy ước tick).
   KHÔNG sửa demo.html: khối này được chèn bằng cong-cu/tao-tu-demo.py, cùng các móc nhỏ gọi P0.xxx().

   ?p0=0       nhịp CŨ (su 11/11/11, atkBuf 8 tick, ngưỡng hướng 0,38, vệt cũ) – quái, công thức, Thế GIỮ NGUYÊN như bản mới
   ?debug=input  log lần bấm Chém (4 loại nhận + đúng 1 kết cục) + log trúng / Cộng hưởng + số tick trên đầu Lam
   ?hitbox=1   lớp hộp đòn (phím H / nút ▣)      ?debug=anim  debug chậm (⏸ +1 ×¼) có sẵn của demo
   ?vao=lang   vào làng cũ như demo (kiểm phần cũ không hỏng)   ?bm=0.25 BONG_MAU, ?dmoi=1 (CHỈ ĐỂ SO LỖI: tạo D bóng mới mỗi tick)
   ?battu=1    không chết (quay video)            ?ghi=1  tắt vòng lặp rAF, để công cụ quay tự bước (TVP0.khung)
*/

/* ========== 1. KHỐI CẤU HÌNH – mọi thông số P0-A ở đây ========== */
const P0_Q = (() => { try { return new URLSearchParams(location.search); } catch (e) { return new Map(); } })();
const P0_SO = {
  bat: P0_Q.get('p0') !== '0',             // true = nhịp MỚI (P0-A)
  suMoi: {1: 7, 2: 7, 3: 9},               // khởi động combo đất mới (cũ 11/11/11). Đòn 4 (nảy), 5 (hất), 6 (trên không) giữ nguyên
  choThem: 6,                              // hạn chỗ chờ: hết đòn (hoặc lướt) đang chạy + 6 tick
  nguongHuong: 0.7,                        // ngưỡng cần gạt LÚC RA ĐÒN (≈ 45°). Cũ: 0,38 (tc.u) / 0,35 (pogoDown). Di chuyển, xuống ván, pogo tự động giữ nguyên
  bufCu: 8,                                // atkBuf của nhịp cũ (chỉ ?p0=0)
  log: P0_Q.get('debug') === 'input',
  ghi: P0_Q.get('ghi') === '1',
  batTu: P0_Q.get('battu') === '1',
  dMoiMoiTick: P0_Q.get('dmoi') === '1',   // CHỈ ĐỂ SO LỖI cũ của kế hoạch: mỗi tick một D bóng mới → hộp nhiều tick trúng nhiều lần
  vao: P0_Q.get('vao') || ''
};
// Thế (thang ×10, tick). Mục 5 kế hoạch V2.
const THE_VO  = {toiDa: 60, vo: true,  mat: false, choang: 120, hoiPhuc: 20, onDinh: 60, choHoi: 90, hoiMoi: 3, giamChoangLap: [1, 1, 1],     cuaSoLap: 600, chThe: 'voNgay'};
const THE_NOM = {toiDa: 60, vo: false, mat: false, choang: 60,  hoiPhuc: 20, onDinh: 60, choHoi: 90, hoiMoi: 3, giamChoangLap: [1, 0.6, 0.4], cuaSoLap: 600, chThe: 0.5};
const CFG = {resWindow: P.resWindow, khoaCH: 45, hsCH: 8, CH_MAU: 1, CH_THE: 0.5,
  BONG_MAU: P0_Q.get('bm') !== null && P0_Q.get('bm') !== '' ? +P0_Q.get('bm') : 0.25, BONG_THE: 0.5,
  hsKeng: 2, hsVo: 6, choangToiThieu: 45};
// Đòn của dao placeholder (giao diện DON mục 6a). goc = [máu, Thế] thang ×10. Chỉ số CHỐT lúc tạo đòn (pl.cs → D.goc).
const CO_LAM = {ch: true, duChan: true, hieuUng: true, kichDau: false};
function donDao(id, goc) { const a = ATK[id];
  return {id, su: a.su, ac: a.ac, re: a.re, hs: a.hs, rung: a.mag, box: a.box, goc, chiMang: {kieu: 'khong', tyLe: 0, heSo: 1}, co: CO_LAM, khung: a.ch, vetBatDau: null}; }
const VK = {dao: {ten: 'Dao (placeholder – Âm Đao cắm vào sau)', don: {}, kyNang: null, pogo: 4, luotHuy: true}};
const CAP_VK = {dao: [null]};              // chưa có cấp trong P0-A
const LOAI_QUAI = {
  chuongGo: {ten: 'Chuông Gỗ', mau: 40, the: null, nang: 'vua', than: [QW, QH], anDon: [QW, QH], khongNgatSau: 18, vaiTro: 'can-chien-nen',
    don: {dap: {id: 'dap', su: 35, ac: 6, re: 42, box: [QHB.dx, QHB.dy, QHB.w, QHB.h], goc: [1, 0], baoTruoc: 30, dauHinh: 'chuông lóe vàng 30 tick', dauAm: 'ting (sfx.warn)'}}},
  quaiGac: {ten: 'Quái gác', mau: 30, the: THE_VO, nang: 'neo', than: [QW, QH], anDon: [QW, QH], khongNgatSau: 0, vaiTro: 'giu-cong', don: {}},
  hinhNom: {ten: 'Hình nộm', mau: 999, the: THE_NOM, nang: 'neo', than: [QW, QH], anDon: [QW, QH], khongNgatSau: 0, vaiTro: 'do-so', don: {}}
};
for (const L of Object.values(LOAI_QUAI)) for (const d of Object.values(L.don)) if (d.dauAm && !d.dauHinh) console.warn('P0: đòn ' + d.id + ' có dấu âm mà thiếu dấu hình');

/* ========== 2. NHỊP: su mới + cắt bảng khung + vệt chém theo quy ước tick ========== */
const ATK_GOC = {}; for (const k in ATK) ATK_GOC[k] = {su: ATK[k].su};
if (P0_SO.bat) for (const k in P0_SO.suMoi) ATK[k].su = P0_SO.suMoi[k];
for (const k of [1, 2, 3, 5, 6, 4]) VK.dao.don[k] = donDao(k, k === 3 ? [10, 30] : [10, 10]);
const PL_CS = VK.dao.don;   // pl.cs: vũ khí + cấp + Âm Phù gộp 1 lần (P0-A: chỉ dao, không cấp)

/* ========== 3. Bộ máy P0 ========== */
const P0 = (() => {
  const SO = P0_SO;
  /* ---- log ---- */
  const LOG = [], TK = {bam: 0, ketCuc: 0, raDon: 0, datChay: 0, hatKhiChay: 0, trung: 0, ch: 0, boQua: 0};
  const BAM = {};   // id → {nhan, ketCuc}
  function ghi(s, loai) { const d = 'f' + S.frame + ' ' + s; LOG.push({f: S.frame, s: d, loai: loai || ''}); if (LOG.length > 400) LOG.shift(); if (SO.log) console.log('[P0] ' + d); }
  function nhan(id, kieu, them) { BAM[id] = {nhan: kieu, ketCuc: kieu.startsWith('loai:') ? '(loại: không có kết cục)' : null, fNhan: S.frame}; TK.bam++; ghi('#' + id + ' ' + kieu + (them ? '  ' + them : ''), 'bam'); }
  function ketCuc(id, kieu, them) { const b = BAM[id]; if (!b || b.ketCuc) { ghi('LỖI #' + id + ' kết cục thứ 2: ' + kieu, 'loi'); return; }
    b.ketCuc = kieu; TK.ketCuc++; ghi('#' + id + ' → ' + kieu + (them ? '  ' + them : ''), 'bam'); }
  function thieuKetCuc() { let n = 0; for (const id in BAM) if (!BAM[id].ketCuc && !(CHO.co && CHO.id === +id) && !(CU.id === +id && pl.atkBuf > 0)) n++; return n; }

  /* ---- hướng lúc bấm (ngưỡng 0,7) ---- */
  function huongBam() { const t = SO.nguongHuong;
    if (kb.u || (dpadId !== null && stickY < -t)) return 'u';
    if (kb.d || (dpadId !== null && stickY > t)) return 'd';
    return ''; }
  function tenDon(n) { return ({1: 'atk1', 2: 'atk2', 3: 'atk3', 4: 'nảy', 5: 'HẤT', 6: 'trên không'})[n]; }

  /* ---- hàng chờ 1 nhát (mục 3b) ---- */
  const CHO = {co: false, id: 0, f: 0, huong: '', han: 0, ngay: false, nhanLog: false, cy: 0};
  const CU = {id: 0, f: 0, cy: 0};          // nhịp cũ: lần bấm đang nằm trong atkBuf
  let nId = 0, tBam = -1, tBamId = 0;
  function conLai() {   // số tick còn lại của việc đang chặn ra đòn
    if (pl.atkN) { const a = ATK[pl.atkN]; return a.su + a.ac + a.re - pl.atkT; }
    if (pl.dash > 0) return pl.dash;
    return 0; }
  function ranh() { return (!pl.atkN || (pl.atkN === 4 && pl.atkBounced)) && pl.dash <= 0; }
  function bam() {   // gọi từ step() khi pressed('a') (sau "tạm dừng", trước hitstop)
    const id = ++nId, cy = dpadId !== null ? stickY : (kb.u ? -1 : kb.d ? 1 : 0), them = 'cần y=' + cy.toFixed(2) + (dangChay() ? ' đang chạy' : '');
    if (!SO.bat) {   // ---- nhịp CŨ: atkBuf 8, chỉ log ----
      if (pl.dead) { nhan(id, 'loai:chet', them); return; }
      if (pl.drawT > 0) { nhan(id, 'loai:rut-dao', them); return; }
      if (CU.id && pl.atkBuf > 0) ketCuc(CU.id, 'bi-de (atkBuf 8 nạp lại)');
      pl.atkBuf = SO.bufCu; CU.id = id; CU.f = S.frame; CU.cy = cy;
      nhan(id, (ranh() && pl.hurtT <= 8 && S.hitstop === 0) ? 'ra-ngay?' : 'atkBuf-8', them + (pl.atkN ? '  (đang ' + tenDon(pl.atkN) + ' t' + pl.atkT + ')' : ''));
      return; }
    // ---- nhịp MỚI ----
    if (pl.dead) { nhan(id, 'loai:chet', them); return; }
    if (pl.drawT > 0) { nhan(id, 'loai:rut-dao', them); return; }
    if (pl.hurtT > 8) { nhan(id, 'loai:bi-danh', them + ' (hurtT ' + pl.hurtT + ')'); return; }
    const cl = conLai(), dang = pl.atkN ? '  (đang ' + tenDon(pl.atkN) + ' t' + pl.atkT + ')' : pl.dash > 0 ? '  (đang lướt)' : '';
    const thay = CHO.co;
    if (CHO.co) { if (!CHO.nhanLog) { nhan(CHO.id, 'ra-ngay', CHO.themLog); CHO.nhanLog = true; } ketCuc(CHO.id, 'bi-thay', 'bởi #' + id); CHO.co = false; }
    CHO.co = true; CHO.id = id; CHO.f = S.frame; CHO.huong = huongBam(); CHO.cy = cy; CHO.han = S.frame + cl + SO.choThem;
    CHO.ngay = ranh() && S.hitstop === 0; CHO.nhanLog = false; CHO.themLog = them + dang;
    if (!CHO.ngay) { nhan(id, thay ? 'thay-the' : 'xep-hang', them + dang + '  hạn f' + CHO.han); CHO.nhanLog = true; }
  }
  function bamKhiDung() { if (pressed('a')) { const id = ++nId; nhan(id, 'loai:tam-dung'); } }
  function xoaCho(lyDo) {
    if (SO.bat) { if (!CHO.co) return; if (!CHO.nhanLog) { nhan(CHO.id, 'ra-ngay', CHO.themLog); CHO.nhanLog = true; } ketCuc(CHO.id, 'xoa:' + lyDo); CHO.co = false; return; }
    if (CU.id && pl.atkBuf > 0 && (lyDo === 'rut-dao' || lyDo === 'dat-lai')) { ketCuc(CU.id, 'mat:' + lyDo); CU.id = 0; }
  }
  function dangChay() { return pl.onGround && !pl.atkN && pl.hurtT <= 0 && pl.dash <= 0 && (I.l || I.r) && Math.abs(pl.vx) > 0.6; }
  // gọi NGAY TRƯỚC startAtk: ghi lần bấm gốc (để đo chạm → hộp) + thống kê "chém hất khi đang chạy"
  function raDon(n, idBam, fBam, chay) {
    TK.raDon++; tBam = idBam ? fBam : -1; tBamId = idBam;
    if ((n === 1 || n === 5) && chay) { TK.datChay++; if (n === 5) TK.hatKhiChay++; }
  }
  /* chọn đòn trong updatePlayer (thay khối "Chém:" của demo) */
  function chonDon(dir) {
    if (!SO.bat) {   // ---- y nguyên code cũ + log ----
      const wantDown = !pl.onGround && (downHeld() || (P.autoPogo && pl.vy > -2 && pogoTarget()));
      if (pl.atkBuf > 0 && pl.dash <= 0 && pl.hurtT <= 8) {
        let n = 0, moi = false; const chay = dangChay();
        if (!pl.atkN || (pl.atkN === 4 && pl.atkBounced)) { n = wantDown ? 4 : (!pl.onGround ? 6 : (I.u ? 5 : 1)); moi = true; }
        else if (pl.onGround && pl.atkN < 3) { const a = ATK[pl.atkN]; if (pl.atkT >= a.su + a.ac) n = pl.atkN + 1; }
        if (n) { const id = CU.id; raDon(n, id, CU.f, chay); startAtk(n, dir); if (moi) pl.pogoBuf = (n === 6) ? P.pogoBuf : 0;
          if (id) { ketCuc(id, 'thuc-hien ' + tenDon(n), 'chờ ' + Math.max(0, S.frame - CU.f - 1) + ' tick' + (n === 5 ? '  (cần y ' + CU.cy.toFixed(2) + ' > ngưỡng 0,38)' : '')); CU.id = 0; } }
      } else if (pl.pogoBuf > 0 && wantDown && pl.dash <= 0 && pl.atkN !== 4) { raDon(4, 0); startAtk(4, 0); pl.pogoBuf = 0; }
      return; }
    // ---- nhịp MỚI ----
    if (CHO.co && S.frame > CHO.han) { if (!CHO.nhanLog) { nhan(CHO.id, 'ra-ngay', CHO.themLog); CHO.nhanLog = true; } ketCuc(CHO.id, 'het-han'); CHO.co = false; }
    const xuong = h => !pl.onGround && (h === 'd' || (P.autoPogo && pl.vy > -2 && pogoTarget()));   // pogo tự động giữ nguyên
    if (CHO.co && pl.dash <= 0 && pl.hurtT <= 8) {
      let n = 0;
      if (!pl.atkN || (pl.atkN === 4 && pl.atkBounced)) n = xuong(CHO.huong) ? 4 : (!pl.onGround ? 6 : (CHO.huong === 'u' ? 5 : 1));
      else if (pl.onGround && pl.atkN < 3) { const a = ATK[pl.atkN]; if (pl.atkT >= a.su + a.ac) n = pl.atkN + 1; }
      if (n) {
        const id = CHO.id; raDon(n, id, CHO.f, dangChay()); CHO.co = false;
        startAtk(n, dir); pl.pogoBuf = (n === 6) ? P.pogoBuf : 0;
        if (!CHO.nhanLog) { BAM[id] = {nhan: 'ra-ngay', ketCuc: 'thuc-hien ' + tenDon(n), fNhan: CHO.f}; TK.bam++; TK.ketCuc++;
          ghi('#' + id + ' ra-ngay → ' + tenDon(n) + '  ' + CHO.themLog + (CHO.huong ? '  hướng ' + CHO.huong : ''), 'bam'); }
        else ketCuc(id, 'thuc-hien ' + tenDon(n), 'chờ ' + (S.frame - CHO.f - 1) + ' tick' + (CHO.huong ? '  hướng ' + CHO.huong : ''));
      }
    } else if (pl.pogoBuf > 0 && xuong(huongBam()) && pl.dash <= 0 && pl.atkN !== 4) { raDon(4, 0); startAtk(4, 0); pl.pogoBuf = 0; }
  }
  /* cuối mỗi bước (không chạy trong hitstop): nhịp cũ – lần bấm hết atkBuf mà chưa ra đòn = MẤT */
  function cuoiBuoc() {
    if (!SO.bat && CU.id && pl.atkBuf <= 0) { const b = BAM[CU.id]; if (b && !b.ketCuc) { ketCuc(CU.id, 'MAT (hết ' + SO.bufCu + ' tick, đòn đang chạy chưa cho nối)'); } CU.id = 0; }
    if (SO.ghi) ghiTick();
  }
  let phong = -1;
  function doiPhong() { if (S.room !== phong) { if (phong >= 0) xoaCho('doi-phong'); phong = S.room; } }

  /* ---- vệt chém theo quy ước tick (KHGP2 3c) ---- */
  function catBang(meta) {   // gọi trong napHD TRƯỚC khi kiểm khớp với ATK
    for (const d of Object.values(meta.don)) {
      d.su_goc = d.su; d.vet_goc = d.vet_chem.bat_dau;
      const moi = ATK[d.atk].su, cat = d.su - moi;
      if (cat > 0) { d.khung_theo_atkT = d.khung_theo_atkT.slice(cat); d.tu_the_theo_atkT = d.tu_the_theo_atkT.slice(cat); d.su = moi; }
      if (SO.bat) d.vet_chem.bat_dau = d.su;       // MỚI: vệt hiện cùng tick hộp (khung 0 hiện nhờ t = −1)
      VK.dao.don[d.atk] && (VK.dao.don[d.atk].vetBatDau = d.vet_chem.bat_dau);
    }
  }
  /* ---- dữ liệu đòn D (pool, không tạo mới mỗi tick) ---- */
  const DP = []; for (let i = 0; i < 64; i++) DP.push({ma: 0, src: '', vk: '', loai: 0, goc: [0, 0], chiMang: false, heSoCM: 1, hs: 0, co: CO_LAM, hb: null, daTrung: [], tBam: -1, idBam: 0, tickHop: -1, boQua: 0});
  let dI = 0, maBong = 0;
  function layD() { const d = DP[dI]; dI = (dI + 1) % DP.length; d.daTrung.length = 0; d.tickHop = -1; d.boQua = 0; d.treBam = undefined; return d; }
  function taoDonLam(n) {
    const C = PL_CS[n], d = layD();
    d.ma = pl.atkSw; d.src = 'p'; d.vk = 'dao'; d.loai = n; d.goc[0] = C.goc[0]; d.goc[1] = C.goc[1];
    d.chiMang = C.chiMang.kieu === 'ngauNhien' ? Math.random() < C.chiMang.tyLe : false; d.heSoCM = C.chiMang.heSo; d.hs = C.hs; d.co = C.co;
    d.tBam = tBam; d.idBam = tBamId; tBam = -1; tBamId = 0;
    return d;
  }
  /* bản ghi bóng: danh sách ≤ 4 hộp, mỗi hộp mang goc/co/maGoc đã chốt */
  function ghiHop(s, hb) {
    if (!s.hop) { s.hop = []; for (let i = 0; i < 4; i++) s.hop.push({loai: '', x: 0, y: 0, w: 0, h: 0, goc: [0, 0], co: CO_LAM, maGoc: 0, hs: 0, n: 0}); }
    s.nh = 0;
    if (hb && pl.D) { const h = s.hop[0]; h.loai = 'chem'; h.x = hb.x; h.y = hb.y; h.w = hb.w; h.h = hb.h; h.goc[0] = pl.D.goc[0]; h.goc[1] = pl.D.goc[1];
      h.co = pl.D.co; h.maGoc = pl.D.ma; h.hs = pl.D.hs; h.n = pl.atkN; s.nh = 1; }
  }
  // bảng ánh xạ maGoc → D bóng của LẦN PHÁT hiện tại
  const PHAT = {id: 0, bang: []};
  function phatMoi() { PHAT.id++; PHAT.bang.length = 0; ghi('bóng phát lần ' + PHAT.id + ' (bảng maGoc→maReplay mới)', 'bong'); }
  const RH = {x: 0, y: 0, w: 0, h: 0};
  function thuThapBong(c) {
    for (let i = 0; i < (c.nh || 0); i++) { const h = c.hop[i];
      let D = null;
      if (!SO.dMoiMoiTick) for (const b of PHAT.bang) if (b.maGoc === h.maGoc) { D = b.D; break; }
      if (!D) { D = layD(); D.ma = 100000 + (++maBong); D.src = 'e'; D.vk = 'dao'; D.loai = h.n; D.goc[0] = h.goc[0]; D.goc[1] = h.goc[1]; D.chiMang = false; D.heSoCM = 1; D.hs = h.hs; D.co = h.co; D.tBam = -1;
        PHAT.bang.push({maGoc: h.maGoc, D}); ghi('D bóng ' + D.ma + ' ← maGoc ' + h.maGoc + ' (lần phát ' + PHAT.id + ')' + (SO.dMoiMoiTick ? '  [dmoi=1: D MỚI MỖI TICK – lỗi để so]' : ''), 'bong'); }
      RH.x = h.x; RH.y = h.y; RH.w = h.w; RH.h = h.h;
      thuThap(D, RH, c.f, h.n, c.x + 10); }
  }
  /* ---- gom lần trúng trong tick (mục 6b + PH3 sửa 2) ---- */
  const HITS = []; for (let i = 0; i < 32; i++) HITS.push({D: null, e: null, face: 1, n: 1, tu: 0, tx: 0, ty: 0, m: 0, chan: false});
  let nHit = 0;
  function thuThap(D, hb, face, n, tuX) {
    if (D.tickHop < 0) { D.tickHop = S.frame; if (D.src === 'p' && D.tBam >= 0) { D.treBam = S.frame - D.tBam;
      ghi('hộp ' + tenDon(n) + ' bật: chạm #' + D.idBam + ' → hộp ' + D.treBam + ' tick (tính tick bấm = 1; su ' + ATK[n].su + ')', 'tre'); } }
    let co = false;
    for (const q of Q) {
      if (q.dead || q.gone || q.st === 'die' || !overlap(hb, q)) continue;
      if (D.daTrung.indexOf(q) >= 0) { D.boQua++; TK.boQua++; if (D.boQua === 1) ghi('  D ' + D.ma + ' vẫn chồng ' + tenQ(q) + ' nhưng đã trúng → bỏ qua các tick sau', 'bong'); continue; }
      D.daTrung.push(q); co = true;
      if (nHit >= HITS.length) continue;
      const h = HITS[nHit++]; h.D = D; h.e = q; h.face = face; h.n = n; h.tu = tuX === undefined ? pl.x + pl.w / 2 : tuX;
      const ix0 = Math.max(hb.x, q.x), ix1 = Math.min(hb.x + hb.w, q.x + q.w), iy0 = Math.max(hb.y, q.y), iy1 = Math.min(hb.y + hb.h, q.y + q.h);
      h.tx = ix1 > ix0 ? (ix0 + ix1) / 2 : q.x + q.w / 2; h.ty = iy1 > iy0 ? (iy0 + iy1) / 2 : q.y + q.h / 2;
    }
    return co;
  }
  function tenQ(q) { return (q.nom ? 'hình nộm' : q.guard ? 'quái gác' : 'Chuông Gỗ') + '#' + Q.indexOf(q); }
  function huP(ten, x, y, lat, opt) { const o = opt || {}; if (SO.bat) o.t = -1; return hu(ten, x, y, lat, o); }   // VFX: khung 0 hiện đúng tick trúng (nhịp mới)
  function tuTruoc(h, e) { return (h.tu - (e.x + e.w / 2)) * e.face > 0; }
  function voConNguyen(e) { const T = e.T; return !!(T && T.cfg.vo && T.v > 0); }
  function nhanThe(e) { return e.T && (e.T.pha === 'thuong' || e.T.pha === 'onDinh'); }
  function vo(e, lyDo) {   // Thế về 0 → vỡ
    const T = e.T, C = T.cfg; let k = 0; T.lanVo = T.lanVo.filter(f => S.frame - f < C.cuaSoLap); k = Math.min(T.lanVo.length, C.giamChoangLap.length - 1); T.lanVo.push(S.frame);
    T.v = 0; T.pha = 'choang'; T.t = Math.max(k ? CFG.choangToiThieu : 0, Math.round(C.choang * C.giamChoangLap[k])); T.tong = T.t;
    S.hitstop = Math.max(S.hitstop, CFG.hsVo); sfx.thud(); bell(330, 1.4, 0.12); shake(0, 1, 2.2);
    const cx = e.x + e.w / 2, cy = e.y + 40;
    fx('ring', cx, cy, 22, '', 0, '#D9894A'); fx('ring', cx, cy, 30, '', 0, '#F3C38A'); shatter(cx, cy, '#8A6A45', '#D9894A');
    popText(cx, e.y - 64, 'Choang! Vỡ ' + (C.vo ? 'vỏ' : 'Thế'), '#F3C38A');
    if (e.guard || e.nom) { e.st = 'choang'; e.t = 0; }
    ghi('  ' + tenQ(e) + ' VỠ (' + lyDo + ') → choáng ' + T.t + ' tick' + (k ? ' (lần vỡ thứ ' + (k + 1) + ' trong ' + C.cuaSoLap + ' tick)' : ''), 'the');
  }
  function giaiQuyet() {
    if (!nHit) return;
    let hsMax = 0, shk = null;
    for (const e of Q) {
      let n = 0; for (let i = 0; i < nHit; i++) if (HITS[i].e === e) n++;
      if (!n) continue;
      const T = e.T, vo0 = voConNguyen(e), the0 = T ? T.v : 0, pha0 = T ? T.pha : '';
      let sumM = 0, sumT = 0, L = null, E = null, h0 = null;
      for (let i = 0; i < nHit; i++) { const h = HITS[i]; if (h.e !== e) continue;
        const D = h.D, bong = D.src === 'e'; if (!h0) h0 = h;
        let m = bong ? D.goc[0] * CFG.BONG_MAU : D.goc[0] * (D.chiMang ? D.heSoCM : 1), t = Math.floor(bong ? D.goc[1] * CFG.BONG_THE : D.goc[1]);
        const chan = vo0 || !!(T && T.cfg.mat && T.v > 0 && tuTruoc(h, e));     // chặn theo Thế ĐẦU TICK
        if (chan) m = 0; else { m = Math.floor(m); if (D.goc[0] > 0) m = Math.max(1, m); }
        h.m = m; h.chan = chan; sumM += m; if (nhanThe(e)) sumT += t;
        const a = ATK[h.n] || ATK[1];
        hsMax = Math.max(hsMax, chan ? CFG.hsKeng : (bong ? Math.max(2, D.hs - 1) : D.hs));
        const mag = chan ? 0.8 : (bong ? a.mag * 0.7 : a.mag); if (!shk || mag > shk.m) shk = {x: chan ? h.face : a.sh[0] * h.face, y: chan ? 0 : a.sh[1], m: mag};
        if (D.co.ch && D.src === 'p' && (!L || D.ma < L.D.ma)) L = h;
        if (D.co.ch && D.src === 'e' && (!E || D.ma < E.D.ma)) E = h;
        TK.trung++;
      }
      // Thế (trạng thái mục 5)
      let vuaVo = false;
      if (T && nhanThe(e)) { T.lastHit = S.frame;
        if (T.pha === 'thuong') { T.v -= sumT; if (T.v <= 0) { vo(e, 'Thế ' + the0 + ' − ' + sumT); vuaVo = true; } }
        else T.v = Math.max(1, T.v - sumT); }
      // Cộng hưởng: cặp Lam ↔ bóng, chọn theo NGUỒN (không theo thứ tự duyệt)
      let cap = null;
      const memP = e.chP && S.frame - e.chP.f <= CFG.resWindow ? e.chP : null, memE = e.chE && S.frame - e.chE.f <= CFG.resWindow ? e.chE : null;
      if (S.frame >= (e.khoaCH || 0)) {
        if (L && E) cap = {mau: L.D.goc[0], kieu: 'cùng tick', a: L.D.ma, b: E.D.ma};
        else if (L && memE) cap = {mau: L.D.goc[0], kieu: 'bóng trước ' + (S.frame - memE.f) + ' tick', a: L.D.ma, b: memE.ma};
        else if (E && memP) cap = {mau: memP.mau, kieu: 'Lam trước ' + (S.frame - memP.f) + ' tick', a: memP.ma, b: E.D.ma};
      }
      let them = 0;
      if (cap) {
        e.chP = e.chE = null; e.khoaCH = S.frame + CFG.khoaCH; TK.ch++;
        if (T) { const C = T.cfg;
          if (C.vo || C.mat) { if (T.pha === 'thuong' && !vuaVo) { vo(e, 'Cộng hưởng'); vuaVo = true; } else if (T.pha === 'onDinh') T.v = Math.max(1, T.v); }
          else if (nhanThe(e) && !vuaVo) { const tru = Math.round(CFG.CH_THE * C.toiDa); if (T.pha === 'thuong') { T.v -= tru; if (T.v <= 0) { vo(e, 'Cộng hưởng −' + tru); vuaVo = true; } } else T.v = Math.max(1, T.v - tru); } }
        const chanThem = voConNguyen(e);   // vỏ còn nguyên sau bước Thế (chỉ khi đang ổn định / hồi phục) → phần thêm cũng bị chặn
        them = chanThem ? 0 : Math.floor(CFG.CH_MAU * cap.mau);
        hsMax = Math.max(hsMax, CFG.hsCH); S.resCount++; lhRung(150); LH.chPulse = 40; sfx.res();
        const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
        huP('cong_huong', cx, cy, false, {k: S.resFirst ? 1 : 1.3});
        if (!S.resFirst) { S.resFirst = true; flash('#CEF0D6', 14); shake(0, -1, 4.5); banner('Cộng hưởng!'); } else { flash('#CEF0D6', 6); shake(0, -1, 3); }
        popText(cx, e.y - 84, chanThem ? 'Cộng hưởng – vỏ ổn định' : 'Cộng hưởng +' + them, '#CEF0D6');
        ghi('  CỘNG HƯỞNG ' + tenQ(e) + ' (' + cap.kieu + '; Lam ' + cap.a + ' + bóng ' + cap.b + ') thêm ' + them + ' máu' + (chanThem ? ' (bị chặn: vỏ đang ổn định)' : '') + ' = CH_MAU × máuCơSở ' + cap.mau, 'ch');
      } else {
        if (L) e.chP = {f: S.frame, ma: L.D.ma, mau: L.D.goc[0]};
        if (E) e.chE = {f: S.frame, ma: E.D.ma};
      }
      // áp máu + phản hồi từng lần trúng
      const tong = sumM + them, hp0 = e.hp;
      e.hp -= tong;
      for (let i = 0; i < nHit; i++) { const h = HITS[i]; if (h.e !== e) continue; const bong = h.D.src === 'e', al = bong ? 0.6 : 1;
        if (h.chan) { S.kengN++; sfx.keng(); huP('keng', h.tx, h.ty, h.face < 0, {al}); popText(h.tx + (bong ? 26 : -10), h.ty - 6 + (bong ? 16 : 0), bong ? 'keng' : 'Keng!', bong ? '#9FE3D2' : '#F3E6C8'); }
        else { huP('trung_don', h.tx, h.ty, h.face < 0, {al}); if (!cap) sfx.hit(); popText(h.tx + (bong ? 26 : -10), h.ty - 6 + (bong ? 16 : 0), String(h.m), bong ? '#7FE0C8' : '#FFF4DC'); }
        ghi((bong ? 'bóng ' : 'Lam ') + 'D ' + h.D.ma + (bong ? '' : ' ' + tenDon(h.n)) + ' trúng ' + tenQ(e) + ': máu ' + h.m + (h.chan ? ' (vỏ chặn, Thế đầu tick ' + the0 + ')' : '') +
          (T ? '  Thế ' + (nhanThe(e) || vuaVo ? Math.floor(bong ? h.D.goc[1] * CFG.BONG_THE : h.D.goc[1]) : '0 (' + pha0 + ')') : ''), 'trung');
      }
      ghi('  → ' + tenQ(e) + ' tick này: máu −' + tong + ' (' + hp0 + ' → ' + e.hp + ')' + (T ? ', Thế ' + the0 + ' → ' + T.v + ' [' + T.pha + ']' : ''), 'trung');
      if (n > 1) ghi('  gom ' + n + ' lần trúng cùng tick trên ' + tenQ(e) + ': chặn theo Thế đầu tick (' + the0 + '), Thế trừ tổng ' + sumT, 'trung');
      if (e.nom) noiNom(e, tong);
      e.flash = 8;
      if (T) { T.tPrev = the0; }
      // phản ứng quái
      if (e.nom) { if (e.hp <= 0) e.hp = 1; }
      else if (e.guard) { if (e.st === 'sleep') { e.st = 'awake'; e.t = 0; } if (e.hp <= 0) killQuai(e, h0.face); }
      else {
        const L2 = e.L || LOAI_QUAI.chuongGo, khongNgat = (e.st === 'wind' && e.t >= L2.khongNgatSau) || e.st === 'strike';
        if (e.hp <= 0) killQuai(e, h0.face);
        else if (!khongNgat && tong > 0) { e.kvx = (h0.face || 1) * (h0.n === 3 ? 6 : 4.4); e.st = 'hit'; e.t = 0; }
        else if (khongNgat && tong > 0) { if (!e._kn || S.frame - e._kn > 30) popText(e.x + e.w / 2, e.y - 40, 'không ngắt!', '#FFB08A'); e._kn = S.frame; ghi('  ' + tenQ(e) + (e.st === 'strike' ? ' đang đập' : ' đã lấy đà ' + e.t + ' tick (≥ ' + L2.khongNgatSau + ')') + ' → không bị ngắt', 'trung'); }
      }
      if (hp0 > 0 && e.hp <= 0 && !e.nom) ghi('  ' + tenQ(e) + ' CHẾT', 'trung');
    }
    if (hsMax) S.hitstop = Math.max(S.hitstop, hsMax);
    if (shk) shake(shk.x || 0.01, shk.y, shk.m);
    nHit = 0;
  }
  /* ---- Thế theo thời gian (mỗi tick, sau updateQuai) ---- */
  function capNhatThe(q) {
    const T = q.T; if (!T || q.dead) return; const C = T.cfg;
    if (T.pha === 'choang') { if (--T.t <= 0) { T.pha = 'hoiPhuc'; T.t = C.hoiPhuc; T.v = C.toiDa; ghi('  ' + tenQ(q) + ' hồi phục (' + C.hoiPhuc + ' tick, Thế về đầy ' + C.toiDa + ')', 'the'); if (q.guard || q.nom) { q.st = q.nom ? 'nom' : 'awake'; q.t = 0; } } }
    else if (T.pha === 'hoiPhuc') { if (--T.t <= 0) { T.pha = 'onDinh'; T.t = C.onDinh; ghi('  ' + tenQ(q) + ' ổn định (' + C.onDinh + ' tick, Thế không xuống dưới 1)', 'the'); } }
    else if (T.pha === 'onDinh') { if (--T.t <= 0) { T.pha = 'thuong'; ghi('  ' + tenQ(q) + ' bình thường (phá lại được)', 'the'); } }
    if ((T.pha === 'thuong' || T.pha === 'onDinh') && T.v < C.toiDa) { const k = S.frame - T.lastHit - C.choHoi; if (k >= 0 && k % C.hoiMoi === 0) T.v++; }
    if (q.guard && T.pha === 'choang' && q.st !== 'die') { q.st = 'choang'; }
  }
  function datQuai(q) {   // gọi cuối resetQuai
    const L = q.nom ? LOAI_QUAI.hinhNom : q.guard ? LOAI_QUAI.quaiGac : LOAI_QUAI.chuongGo;
    q.L = L; q.hp = L.mau; q.max = L.mau; q.chP = q.chE = null; q.khoaCH = 0;
    q.T = L.the ? {cfg: L.the, v: L.the.toiDa, pha: 'thuong', t: 0, tong: 0, lastHit: -999, lanVo: [], tPrev: L.the.toiDa} : null;
    if (q.nom) { q.st = 'nom'; q.nomS = []; q.nomTong = 0; q.nomF = -999; }
  }
  /* ---- hình nộm ---- */
  function noiNom(q, tong) { if (S.frame - q.nomF > 60) { q.nomTong = 0; q.nomS.length = 0; } q.nomF = S.frame; q.nomTong += tong; q.nomS.push(tong); if (q.nomS.length > 6) q.nomS.shift(); }
  function capNhatNom(q) { q.t++; q.at++; if (q.flash > 0) q.flash--;
    if (S.frame - (q.T ? q.T.lastHit : 0) > 180 && S.frame - q.nomF > 180 && q.hp < q.max) { q.hp = q.max; } }
  function veNom(q, al) {
    const x = q.x + q.w / 2 - ox, y = q.y + q.h - oy; if (x < -120 || x > W + 120) return;
    const lac = q.flash > 0 ? Math.sin(q.flash * 1.7) * 3 : 0;
    ctx.save(); bong(x, y - 1, 34, 0.3);
    ctx.fillStyle = '#4A3826'; ctx.fillRect(x - 4, y - 96, 8, 96);                       // cọc
    ctx.fillStyle = '#5E4630'; ctx.fillRect(x - 34 + lac, y - 84, 68, 8);                 // xà ngang
    ctx.fillStyle = q.flash > 0 ? '#E8D3A8' : '#B89A6A'; ctx.beginPath(); ctx.ellipse(x + lac, y - 62, 24, 30, 0, 0, 7); ctx.fill();   // bao rơm
    ctx.strokeStyle = '#6E5637'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 20 + lac, y - 52); ctx.lineTo(x + 20 + lac, y - 52); ctx.moveTo(x - 22 + lac, y - 70); ctx.lineTo(x + 22 + lac, y - 70); ctx.stroke();
    ctx.fillStyle = q.flash > 0 ? '#EAD7B0' : '#C2A473'; ctx.beginPath(); ctx.arc(x + lac, y - 104, 14, 0, 7); ctx.fill();   // đầu
    ctx.fillStyle = '#3A2A1C'; ctx.fillRect(x - 6 + lac, y - 107, 3, 3); ctx.fillRect(x + 4 + lac, y - 107, 3, 3);
    ctx.font = 'bold 11px ui-monospace,Menlo,monospace'; ctx.textAlign = 'center';
    const dong = ['HÌNH NỘM  máu ' + q.hp + '/' + q.max];
    if (q.nomS.length) dong.push('vừa rồi: ' + q.nomS.join(' + ') + ' = ' + q.nomTong);
    if (pl.D && pl.D.treBam !== undefined && pl.D.src === 'p') dong.push('chạm → hộp: ' + pl.D.treBam + ' tick' + (pl.D.treBam > ATK[pl.D.loai].su ? ' (gồm lúc chờ)' : ''));
    dong.forEach((s, i) => { const w = ctx.measureText(s).width; ctx.fillStyle = 'rgba(12,15,20,.7)'; ctx.fillRect(x - w / 2 - 3, y - 190 + i * 13, w + 6, 13); ctx.fillStyle = '#F3E6C8'; ctx.fillText(s, x, y - 180 + i * 13); });
    ctx.textAlign = 'left'; ctx.restore();
  }
  /* ---- vẽ thêm trên quái: thanh Thế, nứt vỏ, choáng, máu ---- */
  function veQuai(q, al) {
    if (q.gone || q.st === 'die') return;
    const x = lerp(q.px, q.x, al) + q.w / 2 - ox, yc = lerp(q.py, q.y, al) - oy; if (x < -120 || x > W + 120) return;
    const T = q.T, top = yc - (q.nom ? 132 : 22);
    ctx.save();
    if (T) { const C = T.cfg, k = T.v / C.toiDa, bw = 64;
      if (C.vo && T.pha !== 'choang' && k < 1) {   // vết nứt 3 mức theo Thế còn lại
        ctx.strokeStyle = 'rgba(30,18,10,.85)'; ctx.lineWidth = 2.2; ctx.beginPath();
        const y0 = yc + 30, mx = x;
        if (k <= 0.67) { ctx.moveTo(mx - 6, y0); ctx.lineTo(mx + 2, y0 + 14); ctx.lineTo(mx - 4, y0 + 26); ctx.lineTo(mx + 6, y0 + 40); }
        if (k <= 0.34) { ctx.moveTo(mx + 2, y0 + 14); ctx.lineTo(mx + 16, y0 + 20); ctx.moveTo(mx - 4, y0 + 26); ctx.lineTo(mx - 20, y0 + 34); ctx.lineTo(mx - 24, y0 + 50); }
        if (k <= 0.17) { ctx.moveTo(mx + 6, y0 + 40); ctx.lineTo(mx + 18, y0 + 56); ctx.moveTo(mx + 16, y0 + 20); ctx.lineTo(mx + 26, y0 + 8); }
        ctx.stroke(); }
      ctx.fillStyle = 'rgba(12,15,20,.75)'; ctx.fillRect(x - bw / 2 - 2, top - 2, bw + 4, 9);
      ctx.fillStyle = T.pha === 'choang' ? '#5a4a3a' : '#C98A4B'; ctx.fillRect(x - bw / 2, top, Math.round(bw * Math.max(0, k)), 5);
      if (T.pha === 'onDinh') { ctx.strokeStyle = '#FFF0C8'; ctx.lineWidth = 1.5; ctx.strokeRect(x - bw / 2 - 1.5, top - 1.5, bw + 3, 8); }
      if (T.pha === 'choang') { for (let i = 0; i < 3; i++) { const a = S.frame * 0.12 + i * 2.094; ctx.fillStyle = '#F3E6C8'; ctx.beginPath(); ctx.arc(x + Math.cos(a) * 22, top - 10 + Math.sin(a) * 6, 3, 0, 7); ctx.fill(); }
        ctx.fillStyle = '#C98A4B'; ctx.fillRect(x - bw / 2, top + 6, Math.round(bw * T.t / T.tong), 2); }
      ctx.font = 'bold 10px ui-monospace,Menlo,monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#F3E6C8';
      ctx.fillText((C.vo ? 'vỏ ' : 'Thế ') + Math.max(0, T.v) + '/' + C.toiDa + ({choang: ' choáng ' + T.t, hoiPhuc: ' hồi phục', onDinh: ' ổn định ' + T.t, thuong: ''})[T.pha], x, top - 18); ctx.textAlign = 'left'; }
    if (!q.nom && (q.hp < q.max || T)) { const bw = 48, yy = top + (T ? 10 : 0); ctx.fillStyle = 'rgba(12,15,20,.7)'; ctx.fillRect(x - bw / 2 - 1, yy - 1, bw + 2, 5); ctx.fillStyle = '#B4553E'; ctx.fillRect(x - bw / 2, yy, Math.round(bw * Math.max(0, q.hp) / q.max), 3); }
    ctx.restore();
  }
  function veHitbox(al) { for (const q of Q) if (q.nom && !q.gone) hbRect(q.x, q.y, q.w, q.h, '#4fb4ff'); }
  /* ---- lớp debug input (?debug=input): số tick trên đầu Lam + bảng log ---- */
  function vetDangHien() { for (let i = 0; i < HU_MAX; i++) { const f = IFX[i]; if (!f.on || f.ten !== 'vet' || f.src !== 'p') continue;
      let fi = 0, acc = 0; for (; fi < f.buoc.length; fi++) { if (f.t < acc + f.buoc[fi]) break; acc += f.buoc[fi]; } return fi < f.buoc.length ? fi : -1; } return -1; }
  function veDebug(al) {
    if (!SO.log && !HBO.on) return;
    ctx.save(); ctx.font = 'bold 11px ui-monospace,Menlo,monospace'; ctx.textBaseline = 'top';
    const px = lerp(pl.px, pl.x, al) + 10 - ox, py = lerp(pl.py, pl.y, al) + 30 - oy;
    if (pl.atkN) { const a = ATK[pl.atkN], hop = pl.atkT >= a.su && pl.atkT < a.su + a.ac, vf = vetDangHien();
      const s = tenDon(pl.atkN) + ' t' + pl.atkT + '/' + (a.su + a.ac + a.re) + (hop ? ' HỘP' : '') + ' · khung ' + (pl.h2 ? LAM.HD.meta.frames[pl.k2].ten : '-') + ' · vệt ' + (vf < 0 ? '–' : vf);
      const w = ctx.measureText(s).width; ctx.fillStyle = hop ? 'rgba(160,20,20,.85)' : 'rgba(12,15,20,.8)'; ctx.fillRect(px - w / 2 - 3, py - 158, w + 6, 14); ctx.fillStyle = '#fff'; ctx.fillText(s, px - w / 2, py - 157); }
    if (CHO.co) { ctx.fillStyle = '#FFD25A'; ctx.fillText('chờ #' + CHO.id + (CHO.huong ? ' ' + CHO.huong : '') + ' hạn ' + (CHO.han - S.frame), px - 30, py - 142); }
    if (SO.log) {
      const L = LOG.slice(-10), x0 = W - 652, y0 = 88;
      ctx.fillStyle = 'rgba(12,15,20,.78)'; ctx.fillRect(x0 - 4, y0 - 34, 652, 10 * 13 + 38);
      const tl = TK.datChay ? (100 * TK.hatKhiChay / TK.datChay).toFixed(0) : '0';
      ctx.fillStyle = SO.bat ? '#7FE0C8' : '#FFB08A';
      ctx.fillText(SO.bat ? 'NHỊP MỚI (P0-A): su 7/7/9 · chờ 1 nhát (hết đòn + 6) · hướng 0,7' : 'NHỊP CŨ (?p0=0): su 11/11/11 · atkBuf 8 tick · hướng 0,38', x0, y0 - 30);
      ctx.fillStyle = '#FFD25A';
      ctx.fillText('bấm ' + TK.bam + ' · thiếu kết cục ' + thieuKetCuc() + ' · ra đòn ' + TK.raDon + ' · hất khi chạy ' + TK.hatKhiChay + '/' + TK.datChay + ' (' + tl + '%) · trúng ' + TK.trung + ' · Cộng hưởng ' + TK.ch, x0, y0 - 16);
      L.forEach((r, i) => { ctx.fillStyle = r.loai === 'bam' ? (/MAT|het-han|xoa|loai|bi-/.test(r.s) ? '#FF9A8A' : '#E8F0FF') : r.loai === 'ch' ? '#CEF0D6' : r.loai === 'the' ? '#F3C38A' : r.loai === 'bong' ? '#9FE3D2' : r.loai === 'tre' ? '#FFD25A' : '#c9c9c9'; ctx.fillText(r.s.slice(0, 100), x0, y0 + i * 13); });
    }
    ctx.restore(); ctx.textBaseline = 'alphabetic';
  }
  /* ---- bảng từng tick (đo quy ước tick) ---- */
  const TICK = [];
  function ghiTick() {
    if (TICK.length > 4000) TICK.shift();
    const a = pl.atkN ? ATK[pl.atkN] : null;
    TICK.push({f: S.frame, atkN: pl.atkN, atkT: pl.atkN ? pl.atkT : 0, hop: !!(a && pl.atkT >= a.su && pl.atkT < a.su + a.ac), khung: pl.h2 && pl.k2 >= 0 ? LAM.HD.meta.frames[pl.k2].ten : '', vet: vetDangHien(),
      ehop: !!(echo && !echo.done && echo.cur.hb), eat: echo && echo.cur ? echo.cur.at : 0});
  }
  /* ---- đầu ván: đặt Lam vào phòng A ---- */
  function vanMoi() {
    if (SO.vao === 'lang') return;
    for (const b of BELLS) b.on = false; const b = BELLS[BELLS.length - 1]; b.on = true; S.cp = b;
    placePlayer((PA.x0 + 4) * T + 6, FLOOR - pl.h); pl.face = 1; pl.drawT = SO.ghi ? 0 : RUT_T;
    LOG.length = 0; for (const k in TK) TK[k] = 0; for (const k in BAM) delete BAM[k]; CHO.co = false; CU.id = 0; phong = S.room;
  }
  return {SO, LOG, TK, BAM, CHO, TICK, PHAT, bam, bamKhiDung, xoaCho, chonDon, cuoiBuoc, doiPhong, catBang, taoDonLam, ghiHop, phatMoi, thuThap, thuThapBong, giaiQuyet,
    capNhatThe, datQuai, capNhatNom, veNom, veQuai, veHitbox, veDebug, vanMoi, thieuKetCuc, ghi, tenQ, vetDangHien};
})();

/* ========== 4. Móc bằng cách bọc hàm có sẵn (không sửa thân hàm cũ) ========== */
const _p0HuVet = huVet;
huVet = function (n, x, y, face, al) {   // nhịp mới: vệt tạo với t = −1 → khung 0 hiện đúng tick hộp (KHGP2 3c)
  if (!P0_SO.bat) return _p0HuVet(n, x, y, face, al);
  const d = LAM && LAM.HD && LAM.HD.meta.don['atk' + n]; if (!d) return;
  const v = d.vet_chem, Hh = {anh: 'vet-chem', anim: v.kieu, buoc: v.buoc, k: v.k, goc: v.goc, ten: 'vet'};
  hu(Hh, x + 10 + v.x * face, y + 30 + v.y, face < 0, {bam: 999, dx: v.x * face, dy: v.y, al: al || 1, src: al ? 'e' : 'p', t: -1});
};
const _p0UQ = updateQuai;
updateQuai = function (q) { if (q.nom) { P0.capNhatNom(q); P0.capNhatThe(q); return; } _p0UQ(q); P0.capNhatThe(q); };
const _p0DQ = drawQuai;
drawQuai = function (q, al) { if (q.nom) { P0.veNom(q, al); P0.veQuai(q, al); return; } _p0DQ(q, al); P0.veQuai(q, al); };
const _p0Hurt = hurt;
hurt = function (dir) { if (P0_SO.batTu && pl.hp <= 1) pl.hp = 2; _p0Hurt(dir); };
HINT.p0a = '{B} {A} vào hình nộm để xem số · ⚙ đổi nhịp cũ / mới';
HINT.p0b = 'Chuông Gỗ lóe vàng = sắp đập · đã lấy đà lâu thì chém không ngắt, hãy {S}';
HINT.p0c = 'Vỏ chặn máu (Keng) · chém tới vỡ rồi đánh lúc choáng';
const _p0Hint = hintNow;
hintNow = function () { const r = ROOMS[S.room]; return r === PA ? 'p0a' : r === PB ? 'p0b' : r === PC ? (qDown(Q[5]) ? 'go' : 'p0c') : _p0Hint(); };
// ⚙: đổi nhịp cũ / mới (tải lại trang với ?p0=0 / bỏ)
(() => { const b = document.getElementById('set-p0'); if (!b) return;
  b.textContent = 'Nhịp đánh: ' + (P0_SO.bat ? 'MỚI (su 7/7/9, chờ 1 nhát)' : 'CŨ (su 11, atkBuf 8)') + ' – bấm để đổi';
  b.addEventListener('click', () => { const u = new URL(location.href); if (P0_SO.bat) u.searchParams.set('p0', '0'); else u.searchParams.delete('p0'); location.href = u.toString(); }); })();
(document.getElementById('start-p0') || {}).textContent = 'P0-A · ' + (P0_SO.bat ? 'nhịp MỚI: su 7/7/9, hàng chờ 1 nhát, ngưỡng hướng 0,7' : 'nhịp CŨ (?p0=0): su 11/11/11, atkBuf 8, ngưỡng 0,38') + ' · quái và công thức giống nhau ở cả hai bản. ?debug=input: log.';

/* ========== 5. API cho công cụ quay / đo (chỉ dùng với ?ghi=1) ========== */
if (P0_SO.ghi) loop = function () {};
window.TVP0 = {
  P0, SO: P0_SO, CFG, VK, LOAI_QUAI, THE_VO, THE_NOM,
  async batDau() { while (!(window.TVDEMO && TVDEMO.ready && loadEl.hidden)) await wait(50); audioInit(); startEl.hidden = true; S.paused = false; document.getElementById('warn').hidden = true; },
  anUI(v) { let st = document.getElementById('p0-an'); if (!st) { st = document.createElement('style'); st.id = 'p0-an'; document.head.appendChild(st); }
    st.textContent = v ? '#hint,#keys,#toast,.ui:not(.panel),button:not(#btn-start),#dpad,#acts{visibility:hidden!important}' : ''; },
  // bước n bước logic với đầu vào (phím) cho từng bước: phim = chuỗi các phím đang giữ ('r', 'a', 'ra'...) – giữ ở mọi bước
  khung(n, phim, cam) { for (let i = 0; i < (n || 1); i++) { this.datPhim(phim || '', cam); savePrev(); step(); } render(1);
    return {f: S.frame, atkN: pl.atkN, atkT: pl.atkT, x: pl.x, hp: pl.hp, room: S.room, hit: S.hitstop}; },
  datPhim(phim, cam) { for (const k of KEYS) { kb[k] = 0; tc[k] = 0; } stickY = 0; dpadId = null;
    for (const c of phim) if (KEYS.includes(c)) kb[c] = 1;
    if (cam) { const [dx, dy] = cam, d = Math.hypot(dx, dy); dpadId = 999; tc.r = dx > d * 0.38 ? 1 : 0; tc.l = dx < -d * 0.38 ? 1 : 0; tc.d = dy > d * 0.38 ? 1 : 0; tc.u = dy < -d * 0.38 ? 1 : 0; stickY = dy / d; } },
  datLam(x, face) { placePlayer(x, FLOOR - pl.h); pl.face = face || 1; pl.drawT = 0; savePrev(); },
  quai(i) { return Q[i]; },
  datLaiQuai(i) { const q = Q[i]; resetQuai(q); q.H = null; },
  datThe(i, v) { const q = Q[i]; q.T.v = v; q.T.lastHit = S.frame; },
  log() { return P0.LOG.map(r => r.s); }, tick() { return P0.TICK.slice(); }, tk() { return Object.assign({thieu: P0.thieuKetCuc()}, P0.TK); },
  xoaLog() { P0.LOG.length = 0; P0.TICK.length = 0; for (const k in P0.TK) P0.TK[k] = 0; },
  echo() { return echo ? {i: echo.i, n: echo.n, done: echo.done} : null; }, rec() { return rec ? rec.n : -1; },
  recHb() { const r = []; const n = echo ? echo.n : 0; for (let i = 0; i < n; i++) if (REC[i].hb) r.push(i); return r; },
  thongSo() { return {bat: P0_SO.bat, su: [ATK[1].su, ATK[2].su, ATK[3].su], vet: [1, 2, 3].map(n => LAM.HD.meta.don['atk' + n].vet_chem.bat_dau), khung: [1, 2, 3].map(n => LAM.HD.meta.don['atk' + n].khung_theo_atkT.length)}; }
};
