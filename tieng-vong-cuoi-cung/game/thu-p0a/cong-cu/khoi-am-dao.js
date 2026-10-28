/* ======================= ÂM ĐAO cấp 1–4 – khối thêm vào trang thử game/thu-p0a/am-dao.html =======================
   Theo docs/gameplay/KE-HOACH-VU-KHI.md mục 2d, 3 (Âm Đao), 4b, 5a–5f, 7a, 8a–8c, 10 + PHAN-HOI-6. Dựng TRÊN P0-A (khối khoi-p0a.js chạy trước).
   Trang sinh bằng cong-cu/tao-am-dao.py từ thu-p0a/index.html (bản P0-A gốc giữ nguyên để so). KHÔNG sửa demo.html.

   ?cap=1..4     cấp Âm Đao lúc vào (mặc định 1). Trong game: ⚙ → nút "Âm Đao cấp N" (đổi vòng 1→2→3→4→1)
   ?debug=input  log (lần bấm, giữ Chém, kỹ năng, vết, trúng)   ?hitbox=1  lớp hộp đòn (+ hộp vết Dư Âm)
   ?cg=36        BIẾN THỂ THỬ (KHVK 4b): Chuông Gỗ máu 36 thay 40 – CHỈ dùng nếu người thử không nhận ra cấp 2. Mặc định TẮT.
                 PH7 chốt: Chuông Gỗ GIỮ 40 máu; 36 không phải số chính thức, không đưa vào game chính.
   Mặc định (không thêm gì): TẮT log và lớp hộp đòn – link cho người chơi thử trên iPhone.
   Sửa theo PHAN-HOI-7 (28/10): lưỡi dài 17,8 px + khe hai nhánh rõ (tầm/hộp 90 GIỮ); chém vang = CÚ QUÉT THẤP (tư thế nhát 3, duyệt tạm);
   hồi chiêu Dư Âm bắt đầu khi hộp chém vang bật; vết chỉ lấy phần TRƯỚC Lam; tạm dừng / ⚙ / mất focus / chuyển tab huỷ giữ (không tích, không tự tung);
   vệt "quét âm" phủ đúng vùng quét trong hộp; VFX vết cắt theo hộp (cấp 4 mạnh hơn bằng độ sáng / rung / tiếng, KHÔNG to hơn hộp). */

/* ========== 1. KHỐI CẤU HÌNH Âm Đao (giao diện VK / CAP_VK / DON của KHGP2 6a) ========== */
const AD_Q = P0_Q;
const VK_AM_DAO = {
  ten: 'Âm Đao', pogo: 4, luotHuy: true,
  // đánh thường = bộ đòn ATK[1..6] (P0-A: su 7/7/9). Chỉ đổi: hộp nhát 1 mép trước 95 → 90 (KHVK 2d) để âm nhận khớp mép
  don: {1: {box: [4, -97, 86, 48], goc: [10, 10]}, 2: {goc: [10, 10]}, 3: {goc: [10, 30]}, 4: {goc: [10, 10]}, 5: {goc: [10, 10]}, 6: {goc: [10, 10]}},
  chiMang: {kieu: 'ngauNhien', tyLe: 0.05, heSo: 1.5},          // gieo 1 lần LÚC TẠO ĐÒN, hạt giống đặt lại mỗi lần vào phòng
  kyNang: {id: 'duAm', giu: 20, hoi: 150, tuToiDa: 60, choThem: 6,
    // chém vang = CÚ QUÉT THẤP: tư thế nhát 3 (chưa có clip mới). Hộp theo hình nhát 3 (thấp, quét trước-dưới), mép trước 90 – KHÔNG dùng [0,−100,96,56] của bản kế hoạch
    // (hộp cao, không khớp hình nhát 3). PH7: chủ dự án DUYỆT TẠM hộp quét thấp này tới khi có clip chém vang riêng
    chem: {su: 6, ac: 8, re: 14, hs: 5, mag: 2.4, sh: [0, 1], box: [-13, -66, 103, 66], goc: [15, 20]},
    vet: {tre: 24, bat: 4, goc: [10, 10], lan: 1, hs: 2, toiDa: 2, keo: 1}},   // vết vang sau 24 tick, hộp bật 4 tick, 'k': không chí mạng / Cộng hưởng
  amNhan: {mau: '#FFF4DC', vien: '#E0A060', quang: '#F3D9A8', cm: '#FFE08A'}   // ngà sáng viền đồng – KHÔNG teal
};
// Cấp: CHỈ ghi thay đổi (dạng dữ liệu, code không viết if(cap>=3))
const CAP_AM_DAO = [null,
  {mo: ['danhThuong']},                                   // 1
  {cong: {'don.*.goc.0': 0.20}},                          // 2: +20 % máu đánh thường (10 → 12)
  {mo: ['duAm'], an: 1},                                  // 3: mở Dư Âm
  {dat: {'kyNang.vet.goc': [16, 20], 'kyNang.vet.hs': 3, 'kyNang.vet.keo': 1.35}}   // 4: vết [10,10] → [16,20] (+ hình / tiếng / khựng mạnh hơn, hitstop vẫn ≤ 3)
];
VK.amDao = VK_AM_DAO; CAP_VK.amDao = CAP_AM_DAO;
ATK[1].box = VK_AM_DAO.don[1].box.slice();
{ const c = VK_AM_DAO.kyNang.chem; ATK[7] = {su: c.su, ac: c.ac, re: c.re, hs: c.hs, mag: c.mag, sh: c.sh, box: c.box, ch: 'atk7'}; }
const AD_CG36 = AD_Q.get('cg') === '36';   // BIẾN THỂ THỬ – mặc định Chuông Gỗ 40 máu (PH7)
if (AD_CG36) LOAI_QUAI.chuongGo.mau = 36;
SRC.hd = 'am-dao/lam-hanh-dong-am-dao-2x.json';           // sheet hành động Lam cầm Âm Đao (tao-asset-am-dao.py)
SRC.lam = 'am-dao/lam-chay-am-dao-2x.json';          // sheet chạy rig-v4 cầm Âm Đao

/* ========== 2. Bộ máy Âm Đao ========== */
const AD = (() => {
  const CAP0 = Math.max(1, Math.min(4, +(AD_Q.get('cap') || 1) || 1));
  // giuT = tick MÔ PHỎNG đã giữ (= giuLogic bước logic + giuKhung bước khựng/hitstop); msBam = đồng hồ thật (performance.now) lúc nhận chạm
  // choNha: vừa huỷ giữ vì tạm dừng / mất focus → phải NHẢ hẳn rồi chạm lại mới đếm giữ mới (không tự nối lần giữ cũ)
  const KN = {giu: false, giuT: 0, giuLogic: 0, giuKhung: 0, msBam: 0, idBam: 0, nap: false, tu: false, tuT: 0, cho: null, hoi: 0, dung: 0, nVet: 0, choNha: false, dangChem: null};
  const TK = {giu: 0, nhaSom: 0, nap: 0, xepHang: 0, tungNgay: 0, tuTung: 0, xoa: 0, tung: 0, vet: 0, vetTrung: 0, vetHut: 0, huyTruocHop: 0, hoanHoi: 0, huyDung: 0};
  const A = {cap: CAP0, cs: null, KN, TK};
  /* ---- chỉ số: gốc → cấp 1..cap (một lần khi đổi cấp). Không đọc lại lúc trúng ---- */
  function datDuong(o, duong, f) { const p = duong.split('.'); let os = [o];
    for (let i = 0; i < p.length - 1; i++) { const n = []; for (const x of os) { if (p[i] === '*') n.push(...Object.values(x)); else n.push(x[p[i]]); } os = n; }
    const k = p[p.length - 1]; for (const x of os) x[k] = f(x[k]); }
  function chiSo(cap) {
    const cs = JSON.parse(JSON.stringify(VK_AM_DAO)); cs.co = {};
    for (let c = 1; c <= cap; c++) { const C = CAP_AM_DAO[c]; if (!C) continue;
      for (const m of C.mo || []) cs.co[m] = true;
      for (const [d, v] of Object.entries(C.cong || {})) datDuong(cs, d, x => x * (1 + v));
      for (const [d, v] of Object.entries(C.dat || {})) datDuong(cs, d, () => JSON.parse(JSON.stringify(v))); }
    cs.cap = cap; return cs;
  }
  function datCap(cap, lyDo) {
    A.cap = cap; const cs = A.cs = chiSo(cap);
    for (const k of [1, 2, 3, 4, 5, 6]) PL_CS[k] = Object.assign({}, PL_CS[k], {goc: cs.don[k].goc.slice(), chiMang: cs.chiMang, co: CO_LAM});
    const c = cs.kyNang.chem;
    PL_CS[7] = {id: 7, su: c.su, ac: c.ac, re: c.re, hs: c.hs, rung: c.mag, box: c.box, goc: c.goc.slice(), chiMang: cs.chiMang, co: CO_LAM, khung: 'atk7', vetBatDau: c.su};
    if (!cs.co.duAm) huyKyNang('doi-cap');
    P0.ghi('ÂM ĐAO cấp ' + cap + (lyDo ? ' (' + lyDo + ')' : '') + ': đánh thường ' + cs.don[1].goc.join('/') + ' (nhát 3 ' + cs.don[3].goc.join('/') + ')' +
      (cs.co.duAm ? ' · Dư Âm: chém vang (cú quét thấp) ' + c.goc.join('/') + ', vết ' + cs.kyNang.vet.goc.join('/') + ', hồi ' + cs.kyNang.hoi + ' (tính từ lúc hộp bật)' : ' · chưa có Dư Âm') +
      ' · chí mạng ' + Math.round(cs.chiMang.tyLe * 100) + '% ×' + cs.chiMang.heSo + ' · Chuông Gỗ ' + LOAI_QUAI.chuongGo.mau + ' máu' + (AD_CG36 ? ' (BIẾN THỂ THỬ ?cg=36)' : ' (mặc định)') +
      '  (đòn / vết / bóng đã tạo giữ số đã chốt)', 'ky');
    const b = document.getElementById('set-cap'); if (b) b.textContent = 'Âm Đao cấp ' + cap + ' – bấm để đổi (1→2→3→4)';
  }
  /* ---- ngẫu nhiên có hạt giống (mulberry32), đặt lại mỗi lần vào phòng ---- */
  let hat = 1;
  function datHat(phong) { hat = ((2 * 0x9E3779B9) ^ (phong * 7919 + 17)) >>> 0; }   // hạt cố định theo phòng: cùng chuỗi vung → cùng chuỗi chí mạng ở mọi cấp (so công bằng)
  function rng() { hat |= 0; hat = hat + 0x6D2B79F5 | 0; let t = Math.imul(hat ^ hat >>> 15, 1 | hat); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  function ghi(s, loai) { P0.ghi(s, loai || 'ky'); }

  /* ---- giữ Chém → Dư Âm (KHVK 7a) ---- */
  function conLai() { if (!pl.atkN) return 0; const a = ATK[pl.atkN]; return a.su + a.ac + a.re - pl.atkT; }
  function coTheNap() { return A.cs.co.duAm && KN.hoi <= 0 && pl.onGround && !pl.dead && pl.hurtT <= 8 && pl.dash <= 0 && pl.drawT <= 0 && pl.atkN !== 7; }
  function huyKyNang(lyDo) {
    if (KN.nap || KN.cho || KN.tu) { TK.xoa++; ghi('ky-nang: xoa:' + lyDo + (KN.cho ? ' (đang chờ tung từ #' + KN.cho.id + ')' : KN.tu ? ' (đang ở thế tụ)' : ' (đã nạp, chưa nhả)') + ' – KHÔNG mất hồi chiêu vì chưa tung'); }
    else if (KN.giu && KN.giuT >= 6 && A.cs && A.cs.co.duAm) ghi('giu #' + KN.idBam + ': huy:' + lyDo + ' (đang giữ ' + moTaGiu() + ')');
    KN.nap = false; KN.tu = false; KN.tuT = 0; KN.cho = null; if (lyDo !== 'cham-moi') KN.giu = false; nutCSS();
  }
  // PH7 mục 6: thời gian giữ = tick MÔ PHỎNG (bước logic + bước khựng) và ms THẬT (đồng hồ trang) – log ghi cả hai, tách riêng
  function msGiu() { return P0_SO.ghi ? null : Math.round(performance.now() - KN.msBam); }
  function moTaGiu() { const ms = msGiu();
    return KN.giuT + ' tick mô phỏng (' + KN.giuLogic + ' bước logic + ' + KN.giuKhung + ' bước khựng) · ' + (ms === null ? 'ms thật: – (công cụ tự bước, không có đồng hồ thật)' : ms + ' ms thật'); }
  // PH7 mục 6: tạm dừng / mở ⚙ / mất focus / chuyển tab / khựng máy > 250 ms → HUỶ lần giữ (và kỹ năng đã nạp / đang chờ tung).
  // Không tích thêm thời gian giữ, KHÔNG tự tung khi quay lại, không mất hồi chiêu (chưa tung). Phải nhả hẳn rồi chạm lại mới đếm giữ mới.
  function huyDung(lyDo) {
    if (!(KN.giu || KN.nap || KN.tu || KN.cho)) return;
    TK.huyDung++;
    ghi('giu #' + KN.idBam + ': HUY:' + lyDo + ' – đã giữ ' + moTaGiu() + (KN.cho ? ' · đang CHỜ TUNG' : KN.tu ? ' · đang ở THẾ TỤ' : KN.nap ? ' · ĐÃ NẠP' : ' · chưa nạp') +
      ' → dừng đếm, KHÔNG tự tung khi quay lại, không mất hồi chiêu; phải nhả rồi chạm lại', 'giu');
    KN.giu = false; KN.nap = false; KN.tu = false; KN.tuT = 0; KN.cho = null; KN.choNha = true; nutCSS();
  }
  function tung(lyDo, tre) {
    const cs = A.cs; KN.dung++; TK.tung++;
    if (lyDo.startsWith('tu-tung')) TK.tuTung++;
    KN.nap = false; KN.tu = false; KN.tuT = 0; KN.cho = null; KN.giu = false;   // lần giữ này đã dùng xong (ngón còn đè thì cũng không tính nữa)
    if (P0.CHO.co) { boCho('bởi Dư Âm'); }
    startAtk(7, 0);
    // PH7 mục 4: hồi chiêu CHƯA chạy lúc tung – chỉ bắt đầu khi hộp chém vang (và vết) thực sự xuất hiện (hopLam). Huỷ trước đó → không mất hồi
    pl.D.vet = {goc: cs.kyNang.vet.goc.slice(), tre: cs.kyNang.vet.tre, bat: cs.kyNang.vet.bat, hs: cs.kyNang.vet.hs, keo: cs.kyNang.vet.keo, cap: A.cap, lan: KN.dung, dat: false, hoi: cs.kyNang.hoi};
    KN.dangChem = {lan: KN.dung, f: S.frame};
    sfx.slash(); bell(660, 0.5, 0.07); bell(990, 0.35, 0.04, 0.03);
    ghi('ky-nang #' + KN.dung + ': TUNG (' + lyDo + (tre !== undefined ? ', chờ ' + tre + ' tick' : '') + ') – chém vang (cú quét thấp) D ' + pl.D.ma + ' chốt [' + pl.D.goc.join(',') + ']' +
      (pl.D.chiMang ? ' CHÍ MẠNG ×' + pl.D.heSoCM : '') + ', vết sẽ [' + pl.D.vet.goc.join(',') + '] (cấp ' + A.cap + ' lúc tung); hồi chiêu ' + cs.kyNang.hoi + ' tick CHƯA chạy – bắt đầu khi hộp bật (sau ' + cs.kyNang.chem.su + ' tick)');
    nutCSS();
  }
  function boCho(ly) { const C = P0.CHO, B = P0.BAM[C.id];
    if (!C.nhanLog) { P0.BAM[C.id] = {nhan: 'ra-ngay', ketCuc: null, fNhan: C.f}; P0.TK.bam++; C.nhanLog = true; }
    const b = P0.BAM[C.id]; if (b && !b.ketCuc) { b.ketCuc = 'bi-thay'; P0.TK.ketCuc++; P0.ghi('#' + C.id + ' → bi-thay  ' + ly, 'bam'); }
    C.co = false; }
  // bấm Chém (sau P0.bam): bắt đầu đếm giữ. Chạm mới khi kỹ năng đang chờ tung → chạm mới thắng (luật "thay thế" của hàng chờ)
  const CHAM = [];   // các lần nhả sớm gần nhất {ms, tick} – để đọc "một lần chạm thường dài bao nhiêu" trên máy thật
  function bam() {
    if (KN.cho) { ghi('ky-nang: xoa:bi-thay (chạm Chém mới #' + P0.CHO.id + ' sau khi đã xếp hàng #' + KN.cho.id + ') – không mất hồi chiêu'); TK.xoa++; KN.cho = null; }
    if (KN.nap || KN.tu) huyKyNang('cham-moi');
    if (KN.choNha) { ghi('giu: KHÔNG đếm lần giữ này – chưa thấy nhả hẳn sau lần huỷ do tạm dừng / mất focus (đánh thường vẫn ra)', 'giu'); KN.giu = false; return; }
    KN.giu = true; KN.giuT = 0; KN.giuLogic = 0; KN.giuKhung = 0; KN.msBam = performance.now();
    KN.idBam = P0.CHO.f === S.frame ? P0.CHO.id : -1; KN.nap = false; KN.tu = false; KN.tuT = 0; TK.giu++;
  }
  // mỗi bước, TRƯỚC updatePlayer (không chạy trong hitstop)
  function truocCapNhat() {
    if (KN.hoi > 0) { KN.hoi--; if (KN.hoi === 0 && A.cs.co.duAm) ghi('Dư Âm: hết hồi chiêu – sẵn sàng', 'ky'); }
    if (KN.giu) {
      if (I.a) {
        KN.giuT++; KN.giuLogic++;
        if (!KN.nap && KN.giuT >= A.cs.kyNang.giu && coTheNap()) { KN.nap = true; TK.nap++; bell(1175, 0.9, 0.05); bell(1760, 0.6, 0.025, 0.02);
          ghi('giu #' + KN.idBam + ': DA NAP (giữ ' + moTaGiu() + (pl.atkN ? ', đòn ' + P0X.tenDon(pl.atkN) + ' còn ' + conLai() + ' tick – chạy hết, không cắt' : ', đòn đã xong → thế tụ') + ')'); }
        if (KN.nap && !pl.onGround) huyKyNang('roi-dat');
        if (KN.nap && pl.atkN === 0) { if (!KN.tu) ghi('giu #' + KN.idBam + ': vào thế tụ'); KN.tu = true; KN.tuT++;
          if (KN.tuT > A.cs.kyNang.tuToiDa) tung('tu-tung: giữ quá ' + A.cs.kyNang.tuToiDa + ' tick ở thế tụ'); }
      } else {   // NHẢ
        KN.giu = false;
        if (!KN.nap) { TK.nhaSom++; const ms = msGiu(); CHAM.push({ms, tick: KN.giuT}); if (CHAM.length > 60) CHAM.shift();
          ghi('giu #' + KN.idBam + ': nha-som (giữ ' + moTaGiu() + (KN.giuT < A.cs.kyNang.giu ? ' < ' + A.cs.kyNang.giu + ' tick' : ' – đủ ngưỡng nhưng KHÔNG nạp được') + (A.cs.co.duAm ? (KN.hoi > 0 ? '; Dư Âm đang hồi ' + KN.hoi : '') : '; cấp ' + A.cap + ' chưa có Dư Âm') + ') → chỉ là đánh thường', 'giu'); }
        else if (pl.atkN && pl.atkN !== 7) { TK.xepHang++;
          if (P0.CHO.co) { boCho('bởi Dư Âm (nhả sau ngưỡng)'); ghi('ky-nang: thay-the nhát combo đang chờ'); }
          KN.cho = {id: KN.idBam, f: S.frame, han: S.frame + conLai() + A.cs.kyNang.choThem}; KN.nap = false;
          ghi('ky-nang: xep-hang (nhả sau ' + moTaGiu() + ', khi ' + P0X.tenDon(pl.atkN) + ' t' + pl.atkT + '/' + (ATK[pl.atkN].su + ATK[pl.atkN].ac + ATK[pl.atkN].re) + ', tung sau tối đa ' + conLai() + ' tick, hạn f' + KN.cho.han + ')'); }
        else { TK.tungNgay++; tung('nhả trong thế tụ sau ' + moTaGiu() + ' → tung ngay'); }
      }
    }
    if (KN.tu) { I.l = I.r = false; }   // thế tụ: đứng yên (nhảy / lướt vẫn được – lướt xoá kỹ năng)
    nutCSS();
  }
  // trong chonDon, TRƯỚC hàng chờ combo: kỹ năng đang chờ tung ở tick đầu tiên đòn hiện tại cho phép (hết re)
  function chonDon() {
    if (!KN.cho) return;
    if (S.frame > KN.cho.han) { TK.xoa++; ghi('ky-nang: het-han (không tung được trước f' + KN.cho.han + ': ' + (!pl.onGround ? 'đang trên không' : pl.hurtT > 8 ? 'bị đánh' : 'bận') + ') – không mất hồi chiêu'); KN.cho = null; return; }
    if (!pl.atkN && pl.dash <= 0 && pl.hurtT <= 8 && pl.onGround) tung('xep-hang → tung khi đòn trước hết re', S.frame - KN.cho.f - 1);
  }
  /* ---- vết Dư Âm: pool cố định, 1 vết / lần dùng kỹ năng (kể cả hụt), đặt LÚC hộp chém vang bật ---- */
  const VET = []; for (let i = 0; i < 2; i++) VET.push({on: false, x: 0, y: 0, w: 0, h: 0, t: 0, tre: 24, bat: 4, goc: [0, 0], hs: 2, keo: 1, cap: 1, lan: 0, face: 1, id: 0, D: null, trung: 0, trungChem: false});
  let vetI = 0;
  function datVet(D, hb) {
    let v = VET.find(x => !x.on); if (!v) { v = VET[vetI]; vetI = (vetI + 1) % VET.length; ghi('vết #' + v.id + ' bị thay (tối đa ' + VET.length + ' vết)', 'vet'); }
    const s = D.vet; s.dat = true; KN.nVet++; TK.vet++;
    // PH7 mục 5: vết chỉ lấy phần hộp PHÍA TRƯỚC tâm Lam (đòn chém chính vẫn giữ cả hộp, kể cả 13 px sau lưng)
    const fx = pl.x + pl.w / 2, x0 = pl.face > 0 ? Math.max(hb.x, fx) : hb.x, x1 = pl.face > 0 ? hb.x + hb.w : Math.min(hb.x + hb.w, fx);
    const cat = hb.w - (x1 - x0);
    Object.assign(v, {on: true, x: x0, y: hb.y, w: x1 - x0, h: hb.h, t: -1, tre: s.tre, bat: s.bat, goc: s.goc.slice(), hs: s.hs, keo: s.keo, cap: s.cap, lan: s.lan, face: pl.face, id: KN.nVet, D: null, trung: 0, maChem: D.ma});
    ghi('vết #' + v.id + ' ĐẶT (lần dùng Dư Âm #' + s.lan + ', từ chém vang D ' + D.ma + ') ở hộp [' + Math.round(v.x) + ',' + Math.round(v.y) + ' ' + Math.round(v.w) + '×' + v.h + '] = phần TRƯỚC Lam của hộp chém vang (bỏ ' + Math.round(cat) + ' px sau tâm Lam) – vang sau ' + s.tre + ' tick, [' + v.goc.join(',') + '] chốt cấp ' + s.cap, 'vet');
  }
  const VB = {x: 0, y: 0, w: 0, h: 0};
  function capNhatVet() {   // trong bước, trước giaiQuyet (không chạy trong hitstop)
    for (const v of VET) { if (!v.on) continue;
      v.t++;
      if (v.t === v.tre) {   // VANG: một D 'k' riêng, chỉ số đã chốt lúc dùng kỹ năng
        const D = P0X.layD(); D.ma = 200000 + v.id; D.src = 'k'; D.vk = 'amDao'; D.loai = 0; D.goc[0] = v.goc[0]; D.goc[1] = v.goc[1]; D.chiMang = false; D.heSoCM = 1; D.hs = v.hs;
        D.co = CO_VET; D.tBam = -1; v.D = D;
        const k = v.cap >= 4 ? 1 : 0; bell(k ? 392 : 523, k ? 1.6 : 1.1, k ? 0.13 : 0.09); bell(k ? 784 : 1046, 0.7, 0.04, 0.02); if (k) sfx.thud();
        shake(0, 1, k ? 2.4 : 1.4);
        ghi('vết #' + v.id + ' VANG (D ' + D.ma + " src 'k' [" + v.goc.join(',') + '], hộp bật ' + v.bat + ' tick; không chí mạng, không Cộng hưởng, không sinh vết)', 'vet'); }
      if (v.D && v.t >= v.tre && v.t < v.tre + v.bat) { VB.x = v.x; VB.y = v.y; VB.w = v.w; VB.h = v.h; if (P0.thuThap(v.D, VB, v.face, 0, v.x + v.w / 2 - v.face * 40)) v.trung++; }
      if (v.t === v.tre + v.bat) ghi('vết #' + v.id + ' hết hộp: trúng ' + v.D.daTrung.length + ' mục tiêu' + (v.D.boQua ? ' (bỏ qua ' + v.D.boQua + ' lần chồng lặp – mỗi mục tiêu 1 lần)' : ''), 'vet');
      if (v.t >= v.tre + 22) { v.on = false; v.D = null; }
    }
  }
  // gọi từ P0.thuThap của Lam: hộp chém vang bật lần đầu → đặt vết (dù có trúng hay không)
  function hopLam(D, hb, co) {
    if (D.src === 'p' && D.loai === 7 && D.vet && !D.vet.dat) {
      datVet(D, hb);
      D.vet.coTrung = co;
      // PH7 mục 4: hồi chiêu BẮT ĐẦU tại đây – tick hộp chém vang (và vết) thực sự xuất hiện
      KN.hoi = D.vet.hoi; KN.dangChem = null;
      ghi('Dư Âm #' + D.vet.lan + ': hộp chém vang BẬT (f' + S.frame + ') → hồi chiêu BẮT ĐẦU ' + KN.hoi + ' tick; từ giờ lướt / bị đánh KHÔNG hoàn hồi', 'ky');
    }
  }
  function hetChemVang(D) {   // thống kê trúng / hụt của lần dùng kỹ năng (sau khi hộp đã đóng)
    if (!D || D.loai !== 7 || !D.vet || D.vet.thongKe) return; D.vet.thongKe = true;
    if (!D.vet.dat) { TK.huyTruocHop++; TK.hoanHoi++; KN.dangChem = null;
      ghi('Dư Âm #' + D.vet.lan + ': chém vang bị huỷ (' + (pl.dash > 0 ? 'lướt' : pl.hurtT > 0 ? 'bị đánh' : 'khác') + ') TRƯỚC khi hộp bật → KHÔNG có vết, KHÔNG MẤT hồi chiêu (hồi chưa bắt đầu; hồi hiện tại ' + KN.hoi + ') – dùng lại được ngay', 'vet'); return; }
    if (D.daTrung.length) TK.vetTrung++; else TK.vetHut++;
    ghi('Dư Âm #' + D.vet.lan + ': chém vang ' + (D.daTrung.length ? 'TRÚNG ' + D.daTrung.length + ' mục tiêu' : 'HỤT (vết vẫn đặt – bẫy)') + ' → đúng 1 vết', 'vet');
  }
  /* ---- vẽ: âm nhận, thế tụ, vết ---- */
  let VIMG = null, VMETA = null, KIEM = null;
  (async () => { try { const r = await fetch('am-dao/vet-du-am-2x.json', {cache: 'no-cache'}); VMETA = await r.json(); VIMG = await loadImgDecode('am-dao/' + VMETA.anh);
    KIEM = await loadImgDecode('am-dao/am-dao-cap1.png'); } catch (e) { console.warn('Âm Đao: không nạp được VFX vết', e); } })();
  function luoiKhung(s) { const HD = LAM && LAM.HD; if (!HD || !s.h2 || !HD.meta.luoi) return null; const f = HD.meta.frames[s.k2]; return f ? HD.meta.luoi[f.ten] : null; }
  // điểm ra khỏi hộp theo tia từ mũi theo hướng lưỡi (toạ độ so với chân, nhìn phải)
  function raHop(L, box) {
    const gx = L.goc[0], gy = L.goc[1], mx = L.mui[0], my = L.mui[1];
    let dx = mx - gx, dy = my - gy; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const [bx, by, bw, bh] = box;
    if (mx < bx || mx > bx + bw || my < by || my > by + bh) return null;   // mũi ngoài hộp → không vẽ phần nối dài
    let t = 1e9; if (dx > 1e-6) t = Math.min(t, (bx + bw - mx) / dx); if (dx < -1e-6) t = Math.min(t, (bx - mx) / dx);
    if (dy > 1e-6) t = Math.min(t, (by + bh - my) / dy); if (dy < -1e-6) t = Math.min(t, (by - my) / dy);
    return {ex: mx + dx * t, ey: my + dy * t, dx, dy, dai: t, gx, gy, mx, my};
  }
  /* ---- PH7 mục 7: "quét âm" – vùng lưỡi + âm nhận quét qua giữa các tick, CẮT trong hộp đòn.
     Ghi đường lưỡi (chắn → mép âm nhận, hoặc → mũi nếu mũi ngoài hộp) ở MỖI tick của đòn; lúc hộp bật tô các dải nối hai tick liên tiếp,
     từ tick ngay trước hộp (đà vung) tới tick hiện tại. Không vẽ gì ngoài hộp → nhìn thấy đâu là chém tới đó. ---- */
  const QUET = {ma: -1, n: 0, L: []};   // L[atkT] = [gx, gy, ex, ey] (so với chân, nhìn phải)
  function ghiQuet(s, n, at, D) {
    if (!D || !n || !ATK[n]) return; if (QUET.ma !== D.ma) { QUET.ma = D.ma; QUET.n = n; QUET.L = []; }
    const L = luoiKhung(s); if (!L) return; const R = raHop(L, ATK[n].box);
    QUET.L[at] = R ? [R.gx, R.gy, R.ex, R.ey] : [L.goc[0], L.goc[1], L.mui[0], L.mui[1]];
  }
  function veQuet(g, X, Y, n, at, f, cm, D) {
    if (!D || QUET.ma !== D.ma) return; const a = ATK[n]; if (at < a.su || at >= a.su + a.ac) return;
    const [bx, by, bw, bh] = a.box, C = VK_AM_DAO.amNhan;
    g.save(); g.beginPath(); g.rect(f > 0 ? X + bx : X - bx - bw, Y + by, bw, bh); g.clip();
    let truoc = null;
    for (let t = Math.max(0, a.su - 3); t <= at; t++) { const l = QUET.L[t]; if (!l) continue;
      if (truoc && t >= a.su - 1) {
        const tuoi = at - t, al = Math.max(0, 0.34 - 0.05 * tuoi) * (at === a.su + a.ac - 1 ? 0.6 : 1);
        if (al > 0.01) { g.globalAlpha = al; g.fillStyle = cm ? C.cm : C.quang; g.beginPath();
          g.moveTo(X + truoc[0] * f, Y + truoc[1]); g.lineTo(X + truoc[2] * f, Y + truoc[3]); g.lineTo(X + l[2] * f, Y + l[3]); g.lineTo(X + l[0] * f, Y + l[1]); g.closePath(); g.fill(); } }
      truoc = l; }
    g.restore();
  }
  function veAmNhan(s, X, Y, n, at, bong, cm, D, g) {
    g = g || ctx;
    if (!n || !ATK[n]) return; const a = ATK[n]; if (at < a.su || at >= a.su + a.ac) return;   // CHỈ các tick hộp bật
    const f = s.l2 ? -1 : 1;
    if (!bong) veQuet(g, X, Y, n, at, f, cm, D);
    const L = luoiKhung(s); if (!L) return; const R = raHop(L, a.box); if (!R) return;
    const C = VK_AM_DAO.amNhan, k = cm ? 1.3 : 1;
    const P = (x, y) => [X + x * f, Y + y];
    const [g0x, g0y] = P(R.gx + (R.mx - R.gx) * 0.35, R.gy + (R.my - R.gy) * 0.35), [mX, mY] = P(R.mx, R.my), [eX, eY] = P(R.ex, R.ey);
    const cuoi = at === a.su + a.ac - 1, al = (bong ? 0.5 : 1) * (cuoi ? 0.6 : 1);
    g.save(); g.lineCap = 'round';
    // PH7: mọi nét âm nhận CẮT trong hộp (quầng / vạch mép / cung sóng không lố ra ngoài mép hộp)
    g.beginPath(); g.rect(f > 0 ? X + a.box[0] : X - a.box[0] - a.box[2], Y + a.box[1], a.box[2], a.box[3]); g.clip();
    g.globalAlpha = 0.38 * al; g.strokeStyle = bong ? '#CEF0D6' : C.quang; g.lineWidth = 15 * k; g.beginPath(); g.moveTo(g0x, g0y); g.lineTo(eX, eY); g.stroke();
    g.globalAlpha = 0.9 * al; g.strokeStyle = bong ? '#E6FFF6' : (cm ? C.cm : C.mau); g.lineWidth = 5.5 * k; g.beginPath(); g.moveTo(mX, mY); g.lineTo(eX, eY); g.stroke();
    g.lineWidth = 2 * k; g.beginPath(); g.moveTo(g0x, g0y); g.lineTo(mX, mY); g.stroke();
    // mép sáng = mép hộp đòn: vạch đồng vuông góc tia + 2 cung sóng âm
    const px = -R.dy * f, py = R.dx;   // pháp tuyến trên màn (đã lật)
    g.globalAlpha = al; g.strokeStyle = bong ? '#9FE3D2' : C.vien; g.lineWidth = 3.4 * k; g.beginPath(); g.moveTo(eX - px * 10 * k, eY - py * 8 * k); g.lineTo(eX + px * 10 * k, eY + py * 10 * k); g.stroke();
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(eX, eY, 3 * k, 0, 7); g.fill();
    g.globalAlpha = 0.45 * al; g.lineWidth = 1.5; const an = Math.atan2(R.dy, R.dx * f);
    for (const r of [5, 9]) { g.beginPath(); g.arc(eX - Math.cos(an) * (r + 2), eY - Math.sin(an) * (r + 2), r + 2, an - 0.9, an + 0.9); g.stroke(); }
    g.restore();
    if (DO_AN && g === ctx) DO_AN.push({f: S.frame, n, at, bong: !!bong, mui: [R.mx, R.my], mep: [+R.ex.toFixed(1), +R.ey.toFixed(1)], dai: +R.dai.toFixed(1), hop: a.box.slice()});
  }
  let DO_AN = null;   // công cụ đo: ghi điểm mép âm nhận mỗi lần vẽ
  function veTu(s, X, Y) {   // thế tụ / đã nạp: ánh dọc lưỡi (KHÔNG nối dài – không phải hộp đòn) + vòng nạp quanh tay
    const L = luoiKhung(s); const f = s.l2 ? -1 : 1, nap = KN.nap || KN.tu;
    const tien = Math.min(1, KN.giuT / A.cs.kyNang.giu), nhip = 0.5 + 0.5 * Math.sin(S.frame * 0.35);
    ctx.save(); ctx.lineCap = 'round';
    if (L && nap) { ctx.globalAlpha = 0.55 + 0.35 * nhip; ctx.strokeStyle = VK_AM_DAO.amNhan.quang; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(X + L.goc[0] * f, Y + L.goc[1]); ctx.lineTo(X + L.mui[0] * f, Y + L.mui[1]); ctx.stroke();
      ctx.globalAlpha = 0.9; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1.6; ctx.stroke(); }
    // vòng nạp trên đầu Lam
    const cx = X, cy = Y - 132, r = 9;
    ctx.globalAlpha = 0.85; ctx.fillStyle = 'rgba(12,15,20,.55)'; ctx.beginPath(); ctx.arc(cx, cy, r + 3, 0, 7); ctx.fill();
    ctx.strokeStyle = nap ? '#FFF4DC' : '#C9A56A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (nap ? 1 : tien)); ctx.stroke();
    if (nap) { ctx.globalAlpha = 0.5 * nhip; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, r + 5 + 3 * nhip, 0, 7); ctx.stroke(); }
    ctx.restore();
  }
  // PH7 mục 8: VFX vết tách 2 lớp. (a) VÙNG SÁT THƯƠNG: mọi hình vết vẽ CẮT trong đúng hộp vết (không lố mép) + viền hộp sáng lúc vang.
  // (b) TRANG TRÍ không mang hướng/khoảng cách: rung màn hình, tiếng, độ sáng. Cấp 4 mạnh hơn ở (b) và độ sáng (a), KHÔNG to hơn hộp.
  function veVet(g, OX, OY) {
    if (!VIMG || !VMETA) return; g = g || ctx; OX = OX === undefined ? ox : OX; OY = OY === undefined ? oy : OY;
    g.save(); g.imageSmoothingEnabled = true;
    for (const v of VET) { if (!v.on) continue;
      const t = v.t, c4 = v.cap >= 4;
      let fi, al = 1;
      if (t < 6) fi = 0; else if (t < 15) fi = 1; else if (t < v.tre) { fi = 2; al = 0.75 + 0.25 * Math.sin(t * 0.9); }
      else if (t < v.tre + 7) { fi = 3; al = c4 ? 1 : 0.85; }
      else { fi = 4; al = Math.max(0, 1 - (t - v.tre - 7) / 15); }
      const F = VMETA.frames[fi], X0 = v.x - OX, Y0 = v.y - OY, cx = X0 + v.w / 2, cy = Y0 + v.h / 2;
      const sc = Math.max(v.w / F.w, v.h / F.h) * (fi >= 3 ? 1.15 : 1);   // phủ kín hộp rồi CẮT theo hộp
      g.save(); g.beginPath(); g.rect(X0, Y0, v.w, v.h); g.clip(); g.globalCompositeOperation = 'lighter';
      g.globalAlpha = al; g.translate(cx, cy); if (v.face > 0 && fi < 3) g.scale(-1, 1);   // cung trong ảnh lồi sang trái → nhìn phải thì lật
      g.drawImage(VIMG, F.x, F.y, F.w, F.h, -F.ax * sc, -F.ay * sc, F.w * sc, F.h * sc);
      if (fi === 3 && c4) { g.globalAlpha = al * 0.55; g.drawImage(VIMG, F.x, F.y, F.w, F.h, -F.ax * sc, -F.ay * sc, F.w * sc, F.h * sc); }   // cấp 4: sáng hơn, CÙNG cỡ
      g.restore();
      if (t >= v.tre && t < v.tre + v.bat + 4) {   // viền đúng hộp lúc vang (vùng gây sát thương)
        g.save(); g.globalAlpha = (c4 ? 0.9 : 0.6) * (t < v.tre + v.bat ? 1 : 0.4); g.strokeStyle = c4 ? '#FFE08A' : '#F3D9A8'; g.lineWidth = c4 ? 2.5 : 1.5;
        g.strokeRect(X0 + g.lineWidth / 2, Y0 + g.lineWidth / 2, v.w - g.lineWidth, v.h - g.lineWidth); g.restore(); }
    }
    g.restore();
  }
  function veHUD() {   // biểu tượng vũ khí + cấp + vòng hồi Dư Âm (dưới HUD máu)
    const x = 6, y = 74, cs = A.cs; if (!cs) return;
    ctx.save(); ctx.fillStyle = 'rgba(12,15,20,.55)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, cs.co.duAm ? 186 : 112, 34, 9) : ctx.rect(x, y, 128, 34); ctx.fill();
    if (KIEM) { ctx.save(); ctx.translate(x + 22, y + 17); ctx.rotate(-0.5); ctx.drawImage(KIEM, -KIEM.width * 0.07, -KIEM.height * 0.07, KIEM.width * 0.14, KIEM.height * 0.14); ctx.restore(); }
    ctx.font = '800 13px "Be Vietnam Pro", sans-serif'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#F3E6C8'; ctx.fillText('Âm Đao', x + 42, y + 12);
    ctx.font = '700 11px "Be Vietnam Pro", sans-serif'; ctx.fillStyle = '#C9A56A'; ctx.fillText('cấp ' + A.cap, x + 42, y + 25);
    if (cs.co.duAm) { const cx = x + 166, cy = y + 17, r = 11, h = KN.hoi / cs.kyNang.hoi;
      ctx.fillStyle = '#0C0F14'; ctx.beginPath(); ctx.arc(cx, cy, r + 2, 0, 7); ctx.fill();
      ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
      ctx.strokeStyle = KN.hoi > 0 ? '#8a7a5a' : (KN.nap || KN.tu || KN.cho ? '#FFFFFF' : '#F3D9A8'); ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - h)); ctx.stroke();
      ctx.font = '800 9px "Be Vietnam Pro", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = KN.hoi > 0 ? '#8a7a5a' : '#F3E6C8'; ctx.fillText(KN.cho ? 'chờ' : 'DƯ', cx, cy + 1); ctx.textAlign = 'left';
      ctx.font = '700 10px "Be Vietnam Pro", sans-serif'; ctx.fillStyle = '#C9A56A'; ctx.fillText('Dư Âm', x + 104, y + 18); }
    ctx.restore(); ctx.textBaseline = 'alphabetic';
  }
  function veDebug(al) {   // chữ trạng thái giữ / kỹ năng trên đầu Lam (chỉ khi log / hộp đòn bật)
    if (!P0.SO.log && !HBO.on) return;
    const px = lerp(pl.px, pl.x, al) + 10 - ox, py = lerp(pl.py, pl.y, al) + 30 - oy;
    const s = (KN.giu ? 'giữ ' + KN.giuT + '/' + A.cs.kyNang.giu : '') + (KN.nap ? ' ĐÃ NẠP' : '') + (KN.tu ? ' TỤ ' + KN.tuT : '') + (KN.cho ? ' CHỜ TUNG #' + KN.cho.id + ' hạn ' + (KN.cho.han - S.frame) : '') + (KN.hoi > 0 ? '  hồi ' + KN.hoi : '');
    ctx.save(); ctx.font = 'bold 11px ui-monospace,Menlo,monospace'; ctx.textBaseline = 'top';
    if (s) { const w = ctx.measureText(s).width; ctx.fillStyle = 'rgba(60,40,10,.85)'; ctx.fillRect(px - w / 2 - 3, py - 186, w + 6, 14); ctx.fillStyle = '#FFD9A0'; ctx.fillText(s, px - w / 2, py - 185); }
    if (P0.SO.log) { ctx.fillStyle = 'rgba(12,15,20,.78)'; const x0 = W - 652, y0 = 88 + 10 * 13 + 6; ctx.fillRect(x0 - 4, y0, 652, 16);
      ctx.fillStyle = '#FFD9A0'; ctx.fillText('ÂM ĐAO cấp ' + A.cap + ' · giữ ' + TK.giu + ' · nhả sớm ' + TK.nhaSom + ' · nạp ' + TK.nap + ' · xếp hàng ' + TK.xepHang + ' · tung ngay ' + TK.tungNgay + ' · tự tung ' + TK.tuTung +
        ' · xoá ' + TK.xoa + ' · DÙNG ' + TK.tung + ' · VẾT ' + TK.vet + ' (trúng ' + TK.vetTrung + '/hụt ' + TK.vetHut + ')', x0, y0 + 2); }
    ctx.restore(); ctx.textBaseline = 'alphabetic';
  }
  function veHop() { for (const v of VET) { if (!v.on) continue; const bat = v.D && v.t >= v.tre && v.t < v.tre + v.bat;
    hbRect(v.x, v.y, v.w, v.h, bat ? '#ff4a4a' : '#ffa640', bat ? 'fill' : 'dash'); hbChu('vết #' + v.id + (bat ? ' VANG' : ' ' + (v.t < v.tre ? (v.tre - v.t) + ' tick' : 'tàn')), v.x - ox + 2, v.y - oy + 2, '#FFD9A0'); } }
  /* ---- nút Chém trên màn: lớp CSS .tu (đang giữ, có thể nạp) / .san (đã nạp) / .cho (chờ tung) / .hoi ---- */
  let cssCu = '';
  function nutCSS() { const b = document.getElementById('b-a'); if (!b || !A.cs) return;
    const c = !A.cs.co.duAm ? '' : KN.cho ? 'ad-cho' : (KN.nap || KN.tu) ? 'ad-san' : (KN.giu && KN.giuT >= 6) ? 'ad-tu' : KN.hoi > 0 ? 'ad-hoi' : '';
    if (c !== cssCu) { b.classList.remove('ad-cho', 'ad-san', 'ad-tu', 'ad-hoi'); if (c) b.classList.add(c); cssCu = c; } }
  const st = document.createElement('style');
  st.textContent = '#b-a.ad-tu{box-shadow:0 0 0 3px rgba(201,165,106,.7)}#b-a.ad-san{box-shadow:0 0 0 4px #FFF4DC,0 0 18px #F3D9A8}#b-a.ad-cho{box-shadow:0 0 0 4px #E0A060,0 0 12px #E0A060}#b-a.ad-hoi{opacity:.85}';
  document.head.appendChild(st);
  return Object.assign(A, {datCap, datHat, rng, bam, truocCapNhat, chonDon, huyKyNang, huyDung, tung, ghiQuet, QUET, CHAM, raHop, luoiKhung, capNhatVet, hopLam, hetChemVang, veAmNhan, veTu, veVet, veHUD, veDebug, veHop, VET,
    batDo() { DO_AN = []; }, layDo() { const r = DO_AN; DO_AN = null; return r; }});
})();
const CO_VET = {ch: false, duChan: true, hieuUng: false, kichDau: false};   // vết 'k' (KHVK 5b)

/* ========== 3. Móc (bọc hàm P0 / demo có sẵn, không sửa thân) ========== */
const P0X = {tenDon: n => ({1: 'atk1', 2: 'atk2', 3: 'atk3', 4: 'nảy', 5: 'HẤT', 6: 'trên không', 7: 'CHÉM VANG (quét thấp)'})[n] || ('đòn ' + n), layD: null};
{ // lấy D từ pool của P0 bằng cách mượn taoDonLam rồi ghi đè (pool vòng 64 phần tử)
  const _tao = P0.taoDonLam;
  P0X.layD = () => { const sw = pl.atkSw, d = _tao(1); pl.atkSw = sw; d.tBam = -1; d.idBam = 0; d.vet = null; return d; };
  P0.taoDonLam = function (n) {   // chỉ số CHỐT từ pl.cs lúc tạo; chí mạng gieo 1 lần bằng bộ sinh có hạt giống
    const d = _tao(n), C = PL_CS[n]; d.vk = 'amDao'; d.vet = null; d.cap = AD.cap;
    d.chiMang = C.chiMang.kieu === 'ngauNhien' ? AD.rng() < C.chiMang.tyLe : false; d.heSoCM = C.chiMang.heSo;
    if (d.chiMang) P0.ghi('D ' + d.ma + ' ' + P0X.tenDon(n) + ': CHÍ MẠNG (gieo lúc vung, ' + Math.round(C.chiMang.tyLe * 100) + '%) → máu ×' + d.heSoCM + ', Thế không nhân', 'ky');
    return d; };
}
{ const _bam = P0.bam; P0.bam = function () { _bam(); AD.bam(); }; }
{ const _xoa = P0.xoaCho; P0.xoaCho = function (ly) { _xoa(ly); if (ly !== 'rut-dao' || AD.KN.giu) AD.huyKyNang(ly); }; }
{ const _dp = P0.doiPhong; let ph = -1; P0.doiPhong = function () { if (S.room !== ph) { if (ph >= 0) AD.huyKyNang('doi-phong'); ph = S.room; AD.datHat(S.room); } _dp(); }; }
{ const _cd = P0.chonDon; P0.chonDon = function (dir) { AD.chonDon(); _cd(dir); }; }
{ const _tt = P0.thuThap; P0.thuThap = function (D, hb, face, n, tuX) { const co = _tt(D, hb, face, n, tuX); AD.hopLam(D, hb, co); return co; }; }
{ const _gq = P0.giaiQuyet; P0.giaiQuyet = function () { AD.capNhatVet(); const nom = Q[6], h0 = nom.hp; _gq(); if (nom.hp !== h0) noiNom10(nom, h0 - nom.hp); }; }
{ const _up = updatePlayer; updatePlayer = function () { if (!pl.dead) AD.truocCapNhat(); const D = pl.D, n0 = pl.atkN; _up(); if (n0 === 7 && pl.atkN !== 7) AD.hetChemVang(D); }; }
// giữ Chém đếm xuyên hitstop: bước khựng (game khựng khi trúng) vẫn cộng giuT (ghi riêng giuKhung), để "giữ 20 tick" không dài ra khi đang chém trúng.
// PH7 mục 6: KHÔNG đếm khi tạm dừng. Đang dừng (⚙ / màn dừng) hoặc khoảng cách thật giữa hai bước > 250 ms (tab ẩn, máy khựng) → HUỶ giữ.
{ const _st = step; let msTruoc = -1;
  step = function () {
    const K = AD.KN, dangGiu = K.giu || K.nap || K.tu || K.cho;
    if (dangGiu && S.paused) AD.huyDung('tam-dung (⚙ / màn dừng)');
    if (!P0_SO.ghi && !(DBG.on && DBG.paused)) { const now = performance.now();
      if (dangGiu && msTruoc >= 0 && now - msTruoc > 250) AD.huyDung('gian-doan ' + Math.round(now - msTruoc) + ' ms giữa hai bước (tab ẩn / máy khựng)');
      msTruoc = now; }
    const hs = S.hitstop > 0 && !S.paused; _st();
    if (hs && K.giu && I.a) { K.giuT++; K.giuKhung++; }
    if (!I.a) K.choNha = false;
  }; }
addEventListener('blur', () => AD.huyDung('mat-focus (cửa sổ mất focus)'));
document.addEventListener('visibilitychange', () => { if (document.hidden) AD.huyDung('chuyen-tab (trang bị ẩn)'); });
addEventListener('pagehide', () => AD.huyDung('pagehide (rời trang / chuyển app)'));
{ const _lc = lamChon; lamChon = function (chiHinh) { _lc(chiHinh); const HD = LAM && LAM.HD;
    if (AD.KN.tu && HD) { pl.a2 = 'tu'; pl.k2 = HD.meta.tu_the['c1-giuong']; pl.h2 = true; pl.l2 = pl.face < 0; } }; }
{ const _dl = drawLam; drawLam = function (bo, s, x, y) { _dl(bo, s, x, y);
    if (!LAM || !s.a2) return; const X = snap(x - ox + pl.w / 2), Y = snap(y - oy + pl.h);
    if (s === pl && bo === LAM) { if (pl.atkN && !pl.dead) { AD.ghiQuet(s, pl.atkN, pl.atkT, pl.D); AN_CHO.push([s, X, Y, pl.atkN, pl.atkT, false, pl.D && pl.D.chiMang, pl.D]); }
      if ((AD.KN.giu && AD.KN.giuT >= 6 && AD.cs.co.duAm && AD.KN.hoi <= 0) || AD.KN.nap || AD.KN.tu) AD.veTu(s, X, Y); }
    else if (echo && s === echo.cur && bo === LAM.E && !echo.done) AN_CHO.push([s, X, Y, s.n, s.at, true, false, null]); }; }
const AN_CHO = [];
{ const _hv = huVe; huVe = function () { AD.veVet(); _hv(); for (const a of AN_CHO) AD.veAmNhan(...a); AN_CHO.length = 0; }; }   // âm nhận vẽ SAU vệt chém (không bị vệt che)
{ const _vh = veHUD; veHUD = function () { _vh(); AD.veHUD(); }; }
{ const _vd = P0.veDebug; P0.veDebug = function (al) { _vd(al); AD.veDebug(al); }; }
{ const _vb = P0.veHitbox; P0.veHitbox = function (al) { _vb(al); AD.veHop(); }; }
{ const _vm = P0.vanMoi; P0.vanMoi = function () { _vm(); AD.huyKyNang('dat-lai'); AD.KN.hoi = 0; for (const v of AD.VET) v.on = false; AD.datHat(S.room); AD.datCap(AD.cap, 'vào ván'); }; }
// hình nộm: tổng sát thương 10 giây (KHVK mục 10)
function noiNom10(q, m) { (q.n10 = q.n10 || []).push([S.frame, m]); }
{ const _vn = P0.veNom; P0.veNom = function (q, al) { _vn(q, al); const L = (q.n10 || []).filter(r => S.frame - r[0] < 600); q.n10 = L;
    const x = q.x + q.w / 2 - ox, y = q.y + q.h - oy; if (x < -120 || x > W + 120) return; const s = 'tổng 10 giây: ' + L.reduce((a, r) => a + r[1], 0) + '  (Âm Đao cấp ' + AD.cap + ')';
    ctx.save(); ctx.font = 'bold 11px ui-monospace,Menlo,monospace'; ctx.textAlign = 'center'; const w = ctx.measureText(s).width;
    ctx.fillStyle = 'rgba(40,28,10,.8)'; ctx.fillRect(x - w / 2 - 3, y - 206, w + 6, 13); ctx.fillStyle = '#FFD9A0'; ctx.fillText(s, x, y - 196); ctx.restore(); }; }
AD.datCap(AD.cap, '?cap=');
HINT.p0a = '{B} chạm {A} = đánh thường · GIỮ {A} (cấp 3+) = Dư Âm · ⚙ đổi cấp Âm Đao';
// ⚙: nút debug đổi cấp (thay nút "Nhịp đánh" – trang Âm Đao luôn dùng nhịp P0-A mới)
(() => { const b0 = document.getElementById('set-p0'); if (b0) b0.hidden = true;
  const b = document.createElement('button'); b.id = 'set-cap'; b.className = 'alt'; b.type = 'button'; if (b0) b0.after(b);
  b.textContent = 'Âm Đao cấp ' + AD.cap + ' – bấm để đổi (1→2→3→4)';
  b.addEventListener('click', () => AD.datCap(AD.cap % 4 + 1, 'nút ⚙')); })();
(document.getElementById('start-p0') || {}).textContent = 'Âm Đao cấp ' + AD.cap + ' (cấp 1–4: ⚙) · chạm Chém = đánh thường · GIỮ Chém ≥ 20 tick (cấp 3+) = Dư Âm · nhịp P0-A: su 7/7/9, hàng chờ 1 nhát. ?debug=input: log.';
/* ---- PH7 mục 7–8: công cụ ĐO "chỗ gây sát thương có VFX không" (chỉ dùng từ công cụ quay, không chạy khi chơi) ----
   Mỗi tick hộp bật: vẽ lại riêng phần nhìn thấy của đòn (vệt chém của Lam, thân lưỡi, quét âm, âm nhận) lên canvas phụ theo toạ độ CHÂN Lam,
   cộng dồn độ đục lớn nhất; rồi lấy mẫu trong hộp đòn: pixel có độ đục ≥ 0,2 = "có VFX". Vết: vẽ veVet lên canvas phụ, đo phần sáng lọt ra ngoài hộp. */
const PHU = {W: 520, H: 380, OX: 260, OY: 250, cv: null, g: null, acc: null, hop: null, so: 0, vet: null};
function phuMoi() { if (!PHU.cv) { PHU.cv = document.createElement('canvas'); PHU.cv.width = PHU.W; PHU.cv.height = PHU.H; PHU.g = PHU.cv.getContext('2d', {willReadFrequently: true}); }
  PHU.acc = new Float32Array(PHU.W * PHU.H); PHU.hop = null; PHU.so = 0; PHU.vet = null; }
function phuGop() { const d = PHU.g.getImageData(0, 0, PHU.W, PHU.H).data, A = PHU.acc; for (let i = 0; i < A.length; i++) { const a = d[i * 4 + 3] / 255; if (a > A[i]) A[i] = a; } }
function phuDon(chiN) {   // gọi SAU mỗi bước (sau render): chỉ đo khi hộp đòn Lam đang bật (chiN: chỉ đo đòn số đó)
  const n = pl.atkN; if (!n || !ATK[n] || (chiN && n !== chiN)) return false; const a = ATK[n], at = pl.atkT; if (at < a.su || at >= a.su + a.ac) return false;
  const g = PHU.g, X = PHU.OX, Y = PHU.OY, f = pl.face, fx = pl.x + pl.w / 2, fy = pl.y + pl.h;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, PHU.W, PHU.H);
  // vệt chém của Lam (đúng phép vẽ của huVe)
  for (const F of IFX) { if (!F.on || F.ten !== 'vet' || F.src !== 'p') continue;
    let fi = 0, acc = 0; for (; fi < F.buoc.length; fi++) { if (F.t < acc + F.buoc[fi]) break; acc += F.buoc[fi]; } if (fi >= F.buoc.length) continue;
    const last = fi === F.buoc.length - 1, al = F.al * (last ? Math.max(0.15, 1 - (F.t - acc) / F.buoc[fi]) : 1), R = HUI[F.anh]; if (!R || !R.img) continue;
    g.save(); g.globalAlpha = al; g.translate(X + (F.x - fx) * f, Y + (F.y - fy)); if (f < 0) g.scale(-1, 1);   // đo theo hướng phải
    if (F.goc) g.rotate(F.goc * Math.PI / 180); if (F.lat) g.scale(-1, 1);
    const id = R.meta.anims[F.anim].khung[Math.min(fi, R.meta.anims[F.anim].khung.length - 1)], fr = R.meta.frames[id], s = F.k / 2;
    g.drawImage(R.img, fr.x, fr.y, fr.w, fr.h, -fr.ax * s, -fr.ay * s, fr.w * s, fr.h * s); g.restore(); }
  // thân lưỡi (hình kiếm trong sheet): đoạn chắn → mũi, dày 6 px
  const L = AD.luoiKhung(pl); if (L) { g.save(); g.globalAlpha = 1; g.strokeStyle = '#fff'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(X + L.goc[0], Y + L.goc[1]); g.lineTo(X + L.mui[0], Y + L.mui[1]); g.stroke(); g.restore(); }
  // quét âm + âm nhận (đúng hàm vẽ trong game, đặt nhìn phải)
  const s0 = {h2: pl.h2, k2: pl.k2, l2: false}; AD.veAmNhan(s0, X, Y, n, at, false, pl.D && pl.D.chiMang, pl.D, g);
  phuGop(); PHU.so++; PHU.hop = a.box.slice(); return true;
}
function phuVet() {   // gọi sau mỗi bước: vẽ mọi vết đang có lên canvas phụ; trả số pixel sáng NGOÀI hộp vết
  const v = AD.VET.find(x => x.on); if (!v) return null;
  if (!PHU.vet || PHU.vet.id !== v.id) PHU.vet = {id: v.id, OX: v.x - 80, OY: v.y - 120, hop: [80, 120, v.w, v.h]};
  const g = PHU.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, PHU.W, PHU.H);
  AD.veVet(g, PHU.vet.OX, PHU.vet.OY); phuGop(); PHU.so++; PHU.hop = PHU.vet.hop; return v.t;
}
function phuKetQua(laVet) {   // lấy mẫu trong hộp (toạ độ canvas phụ). Dải mép 8 px; "cửa sổ" 8 px dọc mép: có VFX nếu ≥ 1 pixel phủ
  const A = PHU.acc, W = PHU.W, NG = 0.2; if (!PHU.hop) return null;
  const [bx, by, bw, bh] = PHU.hop, x0 = laVet ? bx : PHU.OX + bx, y0 = laVet ? by : PHU.OY + by;
  const phu = (x, y) => x >= 0 && y >= 0 && x < W && y < PHU.H && A[(y | 0) * W + (x | 0)] >= NG;
  let tong = 0, co = 0; const dai = {tren: [0, 0], duoi: [0, 0], truoc: [0, 0], sau: [0, 0]};
  for (let y = Math.ceil(y0); y < y0 + bh; y++) for (let x = Math.ceil(x0); x < x0 + bw; x++) { const p = phu(x, y); tong++; co += p;
    if (y < y0 + 8) { dai.tren[0]++; dai.tren[1] += p; } if (y >= y0 + bh - 8) { dai.duoi[0]++; dai.duoi[1] += p; }
    if (x >= x0 + bw - 8) { dai.truoc[0]++; dai.truoc[1] += p; } if (!laVet && x < PHU.OX) { dai.sau[0]++; dai.sau[1] += p; } }
  const cuaSo = (ngang, yA, yB, xA, xB) => { let n = 0, c = 0;
    if (ngang) for (let x = xA; x + 8 <= xB; x += 4) { n++; let h = false; for (let y = yA; y < yB && !h; y++) for (let xx = x; xx < x + 8 && !h; xx++) h = phu(xx, y); c += h; }
    else for (let y = yA; y + 8 <= yB; y += 4) { n++; let h = false; for (let x = xA; x < xB && !h; x++) for (let yy = y; yy < y + 8 && !h; yy++) h = phu(x, yy); c += h; }
    return n ? Math.round(100 * c / n) : null; };
  const X0 = Math.ceil(x0), Y0 = Math.ceil(y0), X1 = Math.floor(x0 + bw), Y1 = Math.floor(y0 + bh);
  let ngoai = 0; for (let y = 0; y < PHU.H; y++) for (let x = 0; x < W; x++) if (A[y * W + x] >= 0.02 && (x < x0 - 0.5 || x >= x0 + bw + 0.5 || y < y0 - 0.5 || y >= y0 + bh + 0.5)) ngoai++;
  const pct = r => r[0] ? Math.round(100 * r[1] / r[0]) : null;
  return {hop: PHU.hop, tick_do: PHU.so, phu_ca_hop: Math.round(100 * co / tong), dai_8px: {tren: pct(dai.tren), duoi: pct(dai.duoi), truoc: pct(dai.truoc), sau_tam_lam: pct(dai.sau)},
    cua_so_mep: {tren: cuaSo(true, Y0, Y0 + 8, X0, X1), duoi: cuaSo(true, Y1 - 8, Y1, X0, X1), truoc: cuaSo(false, Y0, Y1, X1 - 8, X1), sau: laVet ? null : cuaSo(false, Y0, Y1, X0, Math.min(X1, X0 + 8))},
    pixel_sang_ngoai_hop: ngoai};
}
function phuAnh() {   // ảnh bản đồ phủ: xám = có VFX, khung đỏ = hộp đòn, chấm xanh = chân Lam
  const g = PHU.g, A = PHU.acc, W = PHU.W; g.setTransform(1, 0, 0, 1, 0, 0); const im = g.createImageData(W, PHU.H);
  for (let i = 0; i < A.length; i++) { const v = A[i] >= 0.2 ? 235 : A[i] >= 0.02 ? 120 : 28; im.data[i * 4] = v; im.data[i * 4 + 1] = v; im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
  g.putImageData(im, 0, 0); if (PHU.hop) { const [bx, by, bw, bh] = PHU.hop, la = !!PHU.vet; g.strokeStyle = '#ff4040'; g.lineWidth = 1; g.strokeRect((la ? bx : PHU.OX + bx) + 0.5, (la ? by : PHU.OY + by) + 0.5, bw - 1, bh - 1); }
  if (!PHU.vet) { g.fillStyle = '#40a0ff'; g.fillRect(PHU.OX - 2, PHU.OY - 2, 4, 4); g.fillStyle = '#40a0ff'; g.fillRect(PHU.OX - 10, PHU.OY - 30, 20, 30 - 0); g.globalAlpha = 1; }
  return PHU.cv.toDataURL('image/png');
}
window.TVAD = {AD, VK_AM_DAO, CAP_AM_DAO,
  phuMoi, phuDon, phuVet, phuKetQua, phuAnh,
  cap(n) { AD.datCap(n, 'công cụ'); }, hoiNgay() { AD.KN.hoi = 0; }, kn() { const K = AD.KN; return {giu: K.giu, giuT: K.giuT, nap: K.nap, tu: K.tu, cho: !!K.cho, hoi: K.hoi, dung: K.dung, nVet: K.nVet, choNha: K.choNha, giuLogic: K.giuLogic, giuKhung: K.giuKhung}; },
  tk() { return Object.assign({}, AD.TK); }, vet() { return AD.VET.map(v => ({on: v.on, id: v.id, t: v.t, x: v.x, w: v.w, trung: v.D ? v.D.daTrung.length : -1})); },
  datQuai(i, x, face) { const q = Q[i]; q.x = x; q.px = x; if (face) q.face = face; q.H = null; }};
