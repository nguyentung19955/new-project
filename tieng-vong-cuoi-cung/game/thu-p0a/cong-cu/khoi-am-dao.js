/* ======================= ÂM ĐAO cấp 1–4 – khối thêm vào trang thử game/thu-p0a/am-dao.html =======================
   Theo docs/gameplay/KE-HOACH-VU-KHI.md mục 2d, 3 (Âm Đao), 4b, 5a–5f, 7a, 8a–8c, 10 + PHAN-HOI-6. Dựng TRÊN P0-A (khối khoi-p0a.js chạy trước).
   Trang sinh bằng cong-cu/tao-am-dao.py từ thu-p0a/index.html (bản P0-A gốc giữ nguyên để so). KHÔNG sửa demo.html.

   ?cap=1..4     cấp Âm Đao lúc vào (mặc định 1). Trong game: ⚙ → nút "Âm Đao cấp N" (đổi vòng 1→2→3→4→1)
   ?debug=input  log (lần bấm, giữ Chém, kỹ năng, vết, trúng)   ?hitbox=1  lớp hộp đòn (+ hộp vết Dư Âm)
   ?cg=36        BIẾN THỂ THỬ (KHVK 4b): Chuông Gỗ máu 36 thay 40 – CHỈ dùng nếu người thử không nhận ra cấp 2. Mặc định TẮT
   Mặc định (không thêm gì): TẮT log và lớp hộp đòn – link cho người chơi thử trên iPhone. */

/* ========== 1. KHỐI CẤU HÌNH Âm Đao (giao diện VK / CAP_VK / DON của KHGP2 6a) ========== */
const AD_Q = P0_Q;
const VK_AM_DAO = {
  ten: 'Âm Đao', pogo: 4, luotHuy: true,
  // đánh thường = bộ đòn ATK[1..6] (P0-A: su 7/7/9). Chỉ đổi: hộp nhát 1 mép trước 95 → 90 (KHVK 2d) để âm nhận khớp mép
  don: {1: {box: [4, -97, 86, 48], goc: [10, 10]}, 2: {goc: [10, 10]}, 3: {goc: [10, 30]}, 4: {goc: [10, 10]}, 5: {goc: [10, 10]}, 6: {goc: [10, 10]}},
  chiMang: {kieu: 'ngauNhien', tyLe: 0.05, heSo: 1.5},          // gieo 1 lần LÚC TẠO ĐÒN, hạt giống đặt lại mỗi lần vào phòng
  kyNang: {id: 'duAm', giu: 20, hoi: 150, tuToiDa: 60, choThem: 6,
    // chém vang: tư thế nhát 3 (chưa có clip mới). Hộp theo hình nhát 3 (thấp, quét trước-dưới), mép trước 90 – KHÔNG dùng [0,−100,96,56] của bản kế hoạch (hộp cao, không khớp hình nhát 3)
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
if (AD_Q.get('cg') === '36') LOAI_QUAI.chuongGo.mau = 36;
SRC.hd = 'am-dao/lam-hanh-dong-am-dao-2x.json';           // sheet hành động Lam cầm Âm Đao (tao-asset-am-dao.py)
SRC.lam = 'am-dao/lam-chay-am-dao-2x.json';          // sheet chạy rig-v4 cầm Âm Đao

/* ========== 2. Bộ máy Âm Đao ========== */
const AD = (() => {
  const CAP0 = Math.max(1, Math.min(4, +(AD_Q.get('cap') || 1) || 1));
  const KN = {giu: false, giuT: 0, idBam: 0, nap: false, tu: false, tuT: 0, cho: null, hoi: 0, dung: 0, nVet: 0};
  const TK = {giu: 0, nhaSom: 0, nap: 0, xepHang: 0, tungNgay: 0, tuTung: 0, xoa: 0, tung: 0, vet: 0, vetTrung: 0, vetHut: 0, huyTruocHop: 0};
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
      (cs.co.duAm ? ' · Dư Âm: chém ' + c.goc.join('/') + ', vết ' + cs.kyNang.vet.goc.join('/') + ', hồi ' + cs.kyNang.hoi : ' · chưa có Dư Âm') +
      ' · chí mạng ' + Math.round(cs.chiMang.tyLe * 100) + '% ×' + cs.chiMang.heSo + '  (đòn / vết / bóng đã tạo giữ số đã chốt)', 'ky');
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
    else if (KN.giu && KN.giuT >= 6 && A.cs && A.cs.co.duAm) ghi('giu #' + KN.idBam + ': huy:' + lyDo + ' (đang giữ ' + KN.giuT + ' tick)');
    KN.nap = false; KN.tu = false; KN.tuT = 0; KN.cho = null; if (lyDo !== 'cham-moi') KN.giu = false; nutCSS();
  }
  function tung(lyDo, tre) {
    const cs = A.cs; KN.dung++; TK.tung++;
    if (lyDo.startsWith('tu-tung')) TK.tuTung++;
    KN.nap = false; KN.tu = false; KN.tuT = 0; KN.cho = null; KN.hoi = cs.kyNang.hoi; KN.giu = false;   // lần giữ này đã dùng xong (ngón còn đè thì cũng không tính nữa)
    if (P0.CHO.co) { boCho('bởi Dư Âm'); }
    startAtk(7, 0);
    pl.D.vet = {goc: cs.kyNang.vet.goc.slice(), tre: cs.kyNang.vet.tre, bat: cs.kyNang.vet.bat, hs: cs.kyNang.vet.hs, keo: cs.kyNang.vet.keo, cap: A.cap, lan: KN.dung, dat: false};
    sfx.slash(); bell(660, 0.5, 0.07); bell(990, 0.35, 0.04, 0.03);
    ghi('ky-nang #' + KN.dung + ': TUNG (' + lyDo + (tre !== undefined ? ', chờ ' + tre + ' tick' : '') + ') – chém vang D ' + pl.D.ma + ' chốt [' + pl.D.goc.join(',') + ']' +
      (pl.D.chiMang ? ' CHÍ MẠNG ×' + pl.D.heSoCM : '') + ', vết sẽ [' + pl.D.vet.goc.join(',') + '] (cấp ' + A.cap + ' lúc tung), hồi ' + KN.hoi + ' tick');
    nutCSS();
  }
  function boCho(ly) { const C = P0.CHO, B = P0.BAM[C.id];
    if (!C.nhanLog) { P0.BAM[C.id] = {nhan: 'ra-ngay', ketCuc: null, fNhan: C.f}; P0.TK.bam++; C.nhanLog = true; }
    const b = P0.BAM[C.id]; if (b && !b.ketCuc) { b.ketCuc = 'bi-thay'; P0.TK.ketCuc++; P0.ghi('#' + C.id + ' → bi-thay  ' + ly, 'bam'); }
    C.co = false; }
  // bấm Chém (sau P0.bam): bắt đầu đếm giữ. Chạm mới khi kỹ năng đang chờ tung → chạm mới thắng (luật "thay thế" của hàng chờ)
  function bam() {
    if (KN.cho) { ghi('ky-nang: xoa:bi-thay (chạm Chém mới #' + P0.CHO.id + ' sau khi đã xếp hàng #' + KN.cho.id + ') – không mất hồi chiêu'); TK.xoa++; KN.cho = null; }
    if (KN.nap || KN.tu) huyKyNang('cham-moi');
    KN.giu = true; KN.giuT = 0; KN.idBam = P0.CHO.f === S.frame ? P0.CHO.id : -1; KN.nap = false; KN.tu = false; KN.tuT = 0; TK.giu++;
  }
  // mỗi bước, TRƯỚC updatePlayer (không chạy trong hitstop)
  function truocCapNhat() {
    if (KN.hoi > 0) { KN.hoi--; if (KN.hoi === 0 && A.cs.co.duAm) ghi('Dư Âm: hết hồi chiêu – sẵn sàng', 'ky'); }
    if (KN.giu) {
      if (I.a) {
        KN.giuT++;
        if (!KN.nap && KN.giuT >= A.cs.kyNang.giu && coTheNap()) { KN.nap = true; TK.nap++; bell(1175, 0.9, 0.05); bell(1760, 0.6, 0.025, 0.02);
          ghi('giu #' + KN.idBam + ': DA NAP (giữ ' + KN.giuT + ' tick' + (pl.atkN ? ', đòn ' + P0X.tenDon(pl.atkN) + ' còn ' + conLai() + ' tick – chạy hết, không cắt' : ', đòn đã xong → thế tụ') + ')'); }
        if (KN.nap && !pl.onGround) huyKyNang('roi-dat');
        if (KN.nap && pl.atkN === 0) { if (!KN.tu) ghi('giu #' + KN.idBam + ': vào thế tụ'); KN.tu = true; KN.tuT++;
          if (KN.tuT > A.cs.kyNang.tuToiDa) tung('tu-tung: giữ quá ' + A.cs.kyNang.tuToiDa + ' tick ở thế tụ'); }
      } else {   // NHẢ
        KN.giu = false;
        if (!KN.nap) { TK.nhaSom++;
          ghi('giu #' + KN.idBam + ': nha-som (giữ ' + KN.giuT + ' tick < ' + A.cs.kyNang.giu + (A.cs.co.duAm ? (KN.hoi > 0 ? '; Dư Âm đang hồi ' + KN.hoi : '') : '; cấp ' + A.cap + ' chưa có Dư Âm') + ') → chỉ là đánh thường', 'giu'); }
        else if (pl.atkN && pl.atkN !== 7) { TK.xepHang++;
          if (P0.CHO.co) { boCho('bởi Dư Âm (nhả sau ngưỡng)'); ghi('ky-nang: thay-the nhát combo đang chờ'); }
          KN.cho = {id: KN.idBam, f: S.frame, han: S.frame + conLai() + A.cs.kyNang.choThem}; KN.nap = false;
          ghi('ky-nang: xep-hang (nhả khi ' + P0X.tenDon(pl.atkN) + ' t' + pl.atkT + '/' + (ATK[pl.atkN].su + ATK[pl.atkN].ac + ATK[pl.atkN].re) + ', tung sau tối đa ' + conLai() + ' tick, hạn f' + KN.cho.han + ')'); }
        else { TK.tungNgay++; tung('nhả trong thế tụ → tung ngay'); }
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
    Object.assign(v, {on: true, x: hb.x, y: hb.y, w: hb.w, h: hb.h, t: -1, tre: s.tre, bat: s.bat, goc: s.goc.slice(), hs: s.hs, keo: s.keo, cap: s.cap, lan: s.lan, face: pl.face, id: KN.nVet, D: null, trung: 0, maChem: D.ma});
    ghi('vết #' + v.id + ' ĐẶT (lần dùng Dư Âm #' + s.lan + ', từ chém vang D ' + D.ma + ') ở hộp [' + Math.round(hb.x) + ',' + Math.round(hb.y) + ' ' + hb.w + '×' + hb.h + '] – vang sau ' + s.tre + ' tick, [' + v.goc.join(',') + '] chốt cấp ' + s.cap, 'vet');
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
    }
  }
  function hetChemVang(D) {   // thống kê trúng / hụt của lần dùng kỹ năng (sau khi hộp đã đóng)
    if (!D || D.loai !== 7 || !D.vet || D.vet.thongKe) return; D.vet.thongKe = true;
    if (!D.vet.dat) { TK.huyTruocHop++; ghi('Dư Âm #' + D.vet.lan + ': chém vang bị huỷ (lướt / bị đánh) TRƯỚC khi hộp bật → KHÔNG có vết; hồi chiêu đã tính vì đã tung', 'vet'); return; }
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
  function veAmNhan(s, X, Y, n, at, bong, cm) {
    if (!n || !ATK[n]) return; const a = ATK[n]; if (at < a.su || at >= a.su + a.ac) return;   // CHỈ các tick hộp bật
    const L = luoiKhung(s); if (!L) return; const R = raHop(L, a.box); if (!R) return;
    const f = s.l2 ? -1 : 1, C = VK_AM_DAO.amNhan, k = cm ? 1.3 : 1;
    const P = (x, y) => [X + x * f, Y + y];
    const [g0x, g0y] = P(R.gx + (R.mx - R.gx) * 0.35, R.gy + (R.my - R.gy) * 0.35), [mX, mY] = P(R.mx, R.my), [eX, eY] = P(R.ex, R.ey);
    const cuoi = at === a.su + a.ac - 1, al = (bong ? 0.5 : 1) * (cuoi ? 0.6 : 1);
    ctx.save(); ctx.lineCap = 'round';
    ctx.globalAlpha = 0.38 * al; ctx.strokeStyle = bong ? '#CEF0D6' : C.quang; ctx.lineWidth = 15 * k; ctx.beginPath(); ctx.moveTo(g0x, g0y); ctx.lineTo(eX, eY); ctx.stroke();
    ctx.globalAlpha = 0.9 * al; ctx.strokeStyle = bong ? '#E6FFF6' : (cm ? C.cm : C.mau); ctx.lineWidth = 5.5 * k; ctx.beginPath(); ctx.moveTo(mX, mY); ctx.lineTo(eX, eY); ctx.stroke();
    ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.moveTo(g0x, g0y); ctx.lineTo(mX, mY); ctx.stroke();
    // mép sáng = mép hộp đòn: vạch đồng vuông góc tia + 2 cung sóng âm
    const px = -R.dy * f, py = R.dx;   // pháp tuyến trên màn (đã lật)
    ctx.globalAlpha = al; ctx.strokeStyle = bong ? '#9FE3D2' : C.vien; ctx.lineWidth = 3.4 * k; ctx.beginPath(); ctx.moveTo(eX - px * 10 * k, eY - py * 8 * k); ctx.lineTo(eX + px * 10 * k, eY + py * 10 * k); ctx.stroke();
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(eX, eY, 3 * k, 0, 7); ctx.fill();
    ctx.globalAlpha = 0.45 * al; ctx.lineWidth = 1.5; const an = Math.atan2(R.dy, R.dx * f);
    for (const r of [5, 9]) { ctx.beginPath(); ctx.arc(eX - Math.cos(an) * (r + 2), eY - Math.sin(an) * (r + 2), r + 2, an - 0.9, an + 0.9); ctx.stroke(); }
    ctx.restore();
    if (DO_AN) DO_AN.push({f: S.frame, n, at, bong: !!bong, mui: [R.mx, R.my], mep: [+R.ex.toFixed(1), +R.ey.toFixed(1)], dai: +R.dai.toFixed(1), hop: a.box.slice()});
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
  function veVet() {
    if (!VIMG || !VMETA) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.imageSmoothingEnabled = true;
    for (const v of VET) { if (!v.on) continue;
      const t = v.t, k4 = v.cap >= 4 ? v.keo : 1;
      let fi, al = 1, kk = 1.1;
      if (t < 6) fi = 0; else if (t < 15) fi = 1; else if (t < v.tre) { fi = 2; al = 0.75 + 0.25 * Math.sin(t * 0.9); }
      else if (t < v.tre + 7) { fi = 3; kk = (1.05 + 0.25 * (t - v.tre) / 7) * k4; al = Math.min(1, 0.85 * k4); }
      else { fi = 4; kk = 1.1 * k4; al = Math.max(0, 1 - (t - v.tre - 7) / 15); }
      const F = VMETA.frames[fi], cx = v.x + v.w / 2 - ox, cy = v.y + v.h / 2 - oy;
      const sc = (Math.max(v.w, v.h) * kk) / Math.max(F.w, F.h) * (fi === 3 ? 1.25 : 1);
      ctx.globalAlpha = al; ctx.save(); ctx.translate(cx, cy); if (v.face > 0 && fi < 3) ctx.scale(-1, 1);   // cung trong ảnh lồi sang trái → nhìn phải thì lật
      ctx.drawImage(VIMG, F.x, F.y, F.w, F.h, -F.ax * sc, -F.ay * sc, F.w * sc, F.h * sc);
      if (fi === 3 && v.cap >= 4) { ctx.globalAlpha = al * 0.5; ctx.drawImage(VIMG, F.x, F.y, F.w, F.h, -F.ax * sc * 1.2, -F.ay * sc * 1.2, F.w * sc * 1.2, F.h * sc * 1.2); }
      ctx.restore();
    }
    ctx.restore();
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
  return Object.assign(A, {datCap, datHat, rng, bam, truocCapNhat, chonDon, huyKyNang, tung, capNhatVet, hopLam, hetChemVang, veAmNhan, veTu, veVet, veHUD, veDebug, veHop, VET,
    batDo() { DO_AN = []; }, layDo() { const r = DO_AN; DO_AN = null; return r; }});
})();
const CO_VET = {ch: false, duChan: true, hieuUng: false, kichDau: false};   // vết 'k' (KHVK 5b)

/* ========== 3. Móc (bọc hàm P0 / demo có sẵn, không sửa thân) ========== */
const P0X = {tenDon: n => ({1: 'atk1', 2: 'atk2', 3: 'atk3', 4: 'nảy', 5: 'HẤT', 6: 'trên không', 7: 'CHÉM VANG'})[n] || ('đòn ' + n), layD: null};
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
// giữ Chém đếm theo THỜI GIAN THẬT của ngón tay: bước hitstop (game khựng khi trúng) vẫn cộng giuT, để "giữ 20 tick" không dài ra khi đang chém trúng
{ const _st = step; step = function () { const hs = S.hitstop > 0 && !S.paused; _st(); if (hs && AD.KN.giu && I.a) AD.KN.giuT++; }; }
{ const _lc = lamChon; lamChon = function (chiHinh) { _lc(chiHinh); const HD = LAM && LAM.HD;
    if (AD.KN.tu && HD) { pl.a2 = 'tu'; pl.k2 = HD.meta.tu_the['c1-giuong']; pl.h2 = true; pl.l2 = pl.face < 0; } }; }
{ const _dl = drawLam; drawLam = function (bo, s, x, y) { _dl(bo, s, x, y);
    if (!LAM || !s.a2) return; const X = snap(x - ox + pl.w / 2), Y = snap(y - oy + pl.h);
    if (s === pl && bo === LAM) { if (pl.atkN && !pl.dead) AN_CHO.push([s, X, Y, pl.atkN, pl.atkT, false, pl.D && pl.D.chiMang]);
      if ((AD.KN.giu && AD.KN.giuT >= 6 && AD.cs.co.duAm && AD.KN.hoi <= 0) || AD.KN.nap || AD.KN.tu) AD.veTu(s, X, Y); }
    else if (echo && s === echo.cur && bo === LAM.E && !echo.done) AN_CHO.push([s, X, Y, s.n, s.at, true, false]); }; }
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
window.TVAD = {AD, VK_AM_DAO, CAP_AM_DAO,
  cap(n) { AD.datCap(n, 'công cụ'); }, hoiNgay() { AD.KN.hoi = 0; }, kn() { const K = AD.KN; return {giu: K.giu, giuT: K.giuT, nap: K.nap, tu: K.tu, cho: !!K.cho, hoi: K.hoi, dung: K.dung, nVet: K.nVet}; },
  tk() { return Object.assign({}, AD.TK); }, vet() { return AD.VET.map(v => ({on: v.on, id: v.id, t: v.t, x: v.x, w: v.w, trung: v.D ? v.D.daTrung.length : -1})); },
  datQuai(i, x, face) { const q = Q[i]; q.x = x; q.px = x; if (face) q.face = face; q.H = null; }};
