// F3 ổn định 05/11 (docs/review/ke-hoach-cai-thien/on-dinh-f3-anh-bo-nho/bao-cao.md, tư vấn ChatGPT mục 5 + R6):
// BỘ ĐẾM HIỆU NĂNG NHẸ + TỰ GIẢM CHẤT LƯỢNG HÌNH.
// - Luôn ghi số liệu vào bộ nhớ (không gửi đi đâu): thời gian giữa hai khung (FPS, P95, P99), thời gian tính (update) / vẽ (render),
//   số quái / đạn / hiệu ứng / hạt / số sát thương, pixel ảnh đang giữ (bộ tải ảnh rời), số lỗi tải ảnh. Đọc: G.hieuNang.lay().
// - ?perf=1: hiện bảng số nhỏ góc trên trái. Mặc định không hiện.
// - Chất lượng HÌNH: Cao / Vừa / Thấp. Chỉ đổi phần TRÌNH BÀY (số hạt trang trí, bụi, chuyển động môi trường, số sát thương cùng lúc,
//   rung màn) qua G.VFX và G.theme.DOC.soToiDa. KHÔNG đụng quái, hitbox, luật, khựng hình (G.VFX.khung giữ nguyên).
// - Tự động (mặc định): chỉ khi đang đánh trong ải, đo thấy chậm LIÊN TỤC 12 giây (P95 khoảng cách khung > 25 ms) thì hạ một bậc;
//   bỏ qua lúc tải, lúc ẩn tab, 10 giây đầu sau khi quay lại app; tốt liên tục 60 giây mới nâng lại một bậc.
// - Người chơi chọn tay ở Cài đặt › Âm thanh, pin, điều khiển (nút "Hình ảnh"); lưu theo máy (localStorage 'tw-chat-luong'), không vào bản lưu.
// Cờ quay lui: ?chatluong=cao — luôn Cao, không bao giờ tự giảm (bỏ qua lựa chọn đã lưu).
(function () {
  const G = (window.G = window.G || {});
  const q = (re) => { try { return typeof location !== 'undefined' && re.test(location.search || ''); } catch (e) { return false; } };
  const HIEN = q(/[?&]perf=1(&|$)/);
  const CO_DINH_CAO = q(/[?&]chatluong=cao(&|$)/);
  const KHOA = 'tw-chat-luong';
  const N = 1024; // vòng đệm khoảng cách khung (~17 giây ở 60 khung/giây)
  const kc = new Float32Array(N), msTinh = new Float32Array(N), msVe = new Float32Array(N);
  let i = 0, so = 0, truoc = 0, boQuaDen = 0, chamLienTuc = 0, totLienTuc = 0, tGiay = 0, khungGiay = 0, daVeGiay = 0;
  const BAC = ['cao', 'vua', 'thap'];
  const MUC = { // hệ số nhân vào giá trị G.VFX gốc; so: trần số sát thương cùng lúc (G.theme.DOC.soToiDa)
    cao: { hat: 1, bui: 1, moiTruong: 1, rung: 1, so: 1 },
    vua: { hat: 0.6, bui: 0.6, moiTruong: 1, rung: 1, so: 0.84 },
    thap: { hat: 0.35, bui: 0.3, moiTruong: 0.5, rung: 0, so: 0.67 },
  };
  let goc = null, gocSo = null; // giá trị G.VFX / soToiDa trước khi bộ này đụng vào
  let chon = 'tu'; // 'tu' | 'cao' | 'vua' | 'thap'
  try { const v = localStorage.getItem(KHOA); if (v === 'cao' || v === 'vua' || v === 'thap') chon = v; } catch (e) { /* bỏ qua */ }
  if (CO_DINH_CAO) chon = 'cao';
  let tuBac = 'cao'; // bậc tự động đang dùng
  let dangAp = null;
  const so1 = { fps: 0, p95: 0, p99: 0, tinh: 0, ve: 0, tinhP95: 0, veP95: 0, quai: 0, dan: 0, hieuUng: 0, hat: 0, soBay: 0, px: 0, mb: 0, anh: 0, loiAnh: 0, giam: 0, nang: 0 };
  const nhatKy = []; // các lần tự đổi bậc (giờ, bậc, lý do)

  function apDung(bac) {
    const D0 = G.theme && G.theme.DOC;
    if (bac === dangAp && (!D0 || gocSo != null)) return;
    const V = G.VFX;
    if (!V) return;
    if (!goc) { goc = {}; for (const k of ['hat', 'bui', 'moiTruong', 'rung']) goc[k] = typeof V[k] === 'number' ? V[k] : 1; }
    const D = G.theme && G.theme.DOC;
    if (D && gocSo == null) gocSo = D.soToiDa;
    const m = MUC[bac] || MUC.cao;
    for (const k of ['hat', 'bui', 'moiTruong', 'rung']) V[k] = goc[k] * m[k];
    if (D && gocSo != null) D.soToiDa = Math.max(3, Math.round(gocSo * m.so));
    dangAp = bac;
  }
  const bacNay = () => (CO_DINH_CAO ? 'cao' : chon === 'tu' ? tuBac : chon);

  function pTram(a, n, p) { // phân vị p của n giá trị cuối trong vòng đệm a
    if (!n) return 0;
    const t = new Float32Array(n);
    for (let k = 0; k < n; k++) t[k] = a[(i - 1 - k + N) % N];
    t.sort();
    return t[Math.min(n - 1, Math.floor(p * (n - 1) + 0.5))];
  }
  function demSo() {
    try {
      const W = G.getWorld && G.getWorld();
      so1.quai = W && W.ents ? W.ents.length : 0;
      so1.dan = W && W.projs ? W.projs.length : 0;
      const st = G.fx && G.fx.stats ? G.fx.stats() : null;
      so1.hat = st ? st.parts : 0; so1.hieuUng = st ? st.fx : 0; so1.soBay = st ? st.nums : 0;
      const SC = G.spriteCustom, R = SC && SC.roi;
      const b = R && R.boNho ? R.boNho() : null;
      so1.px = b ? b.px : 0; so1.mb = b ? b.mb : 0; so1.anh = b ? b.so : 0; so1.loiAnh = R && R.loiTai ? R.loiTai() : (SC && SC.loi ? SC.loi.length : 0);
    } catch (e) { /* bỏ qua */ }
  }
  // Có nên tính giây này vào việc tự đổi bậc không: đang đánh trong ải, không tạm dừng / mở bảng, không đang tải ảnh vùng, không vừa quay lại.
  let canhTruoc = null;
  function dangDanh(nowMs) {
    if (G.scene !== canhTruoc) { canhTruoc = G.scene; boQuaDen = Math.max(boQuaDen, nowMs + 10000); } // vừa đổi màn (vào ải, đang tải): bỏ qua 10 giây
    if (nowMs < boQuaDen) return false;
    try {
      if (typeof document !== 'undefined' && document.hidden) return false;
      if (G.scene !== G.StageScene) return false;
      if (G.veYen && G.veYen.canhYen && G.veYen.canhYen()) return false; // tạm dừng, bản đồ, túi đồ, màn kết quả
      return true;
    } catch (e) { return false; }
  }
  function moiGiay(nowMs) {
    const n = Math.min(so, Math.max(1, khungGiay));
    const nW = Math.min(so, 600);
    so1.fps = khungGiay;
    so1.p95 = pTram(kc, nW, 0.95); so1.p99 = pTram(kc, nW, 0.99);
    so1.tinhP95 = pTram(msTinh, nW, 0.95); so1.veP95 = pTram(msVe, nW, 0.95);
    let st = 0, sv = 0;
    for (let k = 0; k < n; k++) { const j = (i - 1 - k + N) % N; st += msTinh[j]; sv += msVe[j]; }
    so1.tinh = st / n; so1.ve = sv / n;
    demSo();
    // P95 của riêng giây vừa qua: quyết định giây đó chậm / tốt
    const p95g = pTram(kc, n, 0.95);
    if (!CO_DINH_CAO && chon === 'tu' && dangDanh(nowMs) && khungGiay >= 5) {
      if (p95g > 25) { chamLienTuc++; totLienTuc = 0; } else if (p95g < 18.5) { totLienTuc++; chamLienTuc = 0; } else { chamLienTuc = 0; totLienTuc = 0; }
      const k = BAC.indexOf(tuBac);
      if (chamLienTuc >= 12 && k < BAC.length - 1) {
        tuBac = BAC[k + 1]; chamLienTuc = 0; totLienTuc = 0; so1.giam++;
        nhatKy.push({ t: Math.round(nowMs), bac: tuBac, ly: 'chậm 12 giây liền (P95 ' + p95g.toFixed(1) + ' ms)' });
      } else if (totLienTuc >= 60 && k > 0) {
        tuBac = BAC[k - 1]; totLienTuc = 0; so1.nang++;
        nhatKy.push({ t: Math.round(nowMs), bac: tuBac, ly: 'mượt 60 giây liền' });
      }
      if (nhatKy.length > 40) nhatKy.shift();
    } else if (!dangDanh(nowMs)) { chamLienTuc = 0; }
    apDung(bacNay());
    khungGiay = 0; daVeGiay = 0;
  }
  const HN = (G.hieuNang = {
    // engine.js gọi mỗi khung: now (giây, theo requestAnimationFrame), số bước logic, ms tính, ms vẽ, khung này có vẽ không
    khung(now, buoc, tinh, ve, coVe) {
      const ms = now * 1000;
      if (truoc > 0) {
        const d = ms - truoc;
        if (d > 0 && d < 1000) { kc[i] = d; msTinh[i] = tinh; msVe[i] = ve; i = (i + 1) % N; if (so < N) so++; khungGiay++; if (coVe) daVeGiay++; }
      }
      truoc = ms;
      if (!tGiay) tGiay = ms;
      if (ms - tGiay >= 1000) { tGiay = ms; moiGiay(ms); }
    },
    // engine.js gọi khi quay lại sau ẩn tab / chuyển app: không tính khoảng nghỉ, bỏ qua 10 giây đầu khi xét tự giảm
    tiepTuc() {
      truoc = 0; tGiay = 0; khungGiay = 0; chamLienTuc = 0; totLienTuc = 0;
      try { boQuaDen = performance.now() + 10000; } catch (e) { boQuaDen = 0; }
    },
    lay() { demSo(); return Object.assign({ bac: bacNay(), chon, tuBac, coDinh: CO_DINH_CAO, nhatKy: nhatKy.slice() }, so1); },
    bac: bacNay,
    chon: () => chon,
    // Người chơi chọn (Cài đặt): 'tu' | 'cao' | 'vua' | 'thap'
    dat(v) {
      if (CO_DINH_CAO) return;
      if (v !== 'tu' && !MUC[v]) return;
      chon = v; if (v === 'tu') { tuBac = 'cao'; chamLienTuc = 0; totLienTuc = 0; }
      try { if (v === 'tu') localStorage.removeItem(KHOA); else localStorage.setItem(KHOA, v); } catch (e) { /* bỏ qua */ }
      apDung(bacNay());
    },
    // Bấm nút Cài đặt: Tự động → Cao → Thấp → Tự động
    doi() { HN.dat(chon === 'tu' ? 'cao' : chon === 'cao' ? 'thap' : 'tu'); return chon; },
    nhan() { const b = bacNay(), ten = { cao: 'Cao', vua: 'Vừa', thap: 'Thấp' }[b]; return chon === 'tu' ? G.t ? G.t('Tự động: {0}', G.t(ten)) : 'Tự động: ' + ten : ten; },
    // cho kiểm thử: ép bậc tự động
    _tuBac(b) { if (MUC[b]) { tuBac = b; apDung(bacNay()); } },
    // ?perf=1: bảng số nhỏ (vẽ sau cùng, không nhận chạm)
    ve() {
      if (!HIEN) return;
      try {
        const c = G.ux, ui = G.ui;
        if (!c || !ui) return;
        const s = so1, dong = [
          'FPS ' + s.fps + '  P95 ' + s.p95.toFixed(1) + '  P99 ' + s.p99.toFixed(1) + ' ms',
          'tính ' + s.tinh.toFixed(2) + ' (P95 ' + s.tinhP95.toFixed(1) + ')  vẽ ' + s.ve.toFixed(2) + ' (P95 ' + s.veP95.toFixed(1) + ') ms',
          'quái ' + s.quai + '  đạn ' + s.dan + '  hiệu ứng ' + s.hieuUng + '  hạt ' + s.hat + '  số ' + s.soBay,
          'ảnh ' + s.anh + ' · ' + s.mb.toFixed(1) + ' MiB  lỗi ' + s.loiAnh + '  hình ' + bacNay() + (chon === 'tu' ? ' (tự)' : ''),
        ];
        const ga = c.globalAlpha;
        c.globalAlpha = 1; c.fillStyle = 'rgba(0,0,0,0.62)'; c.fillRect(2, 2, 196, 4 + dong.length * 8);
        dong.forEach((d, k) => ui.text(d, 5, 9 + k * 8, { size: 6.5, color: '#bfe8b0', raw: true }));
        c.globalAlpha = ga;
      } catch (e) { /* bảng số hỏng thì bỏ qua */ }
    },
    HIEN,
  });
  if (G.ngonNgu && G.ngonNgu.them) G.ngonNgu.them({ 'Hình ảnh': 'Graphics', 'Tự động: {0}': 'Auto: {0}', Cao: 'High', 'Vừa': 'Medium', 'Thấp': 'Low',
    'Hình ảnh: tự động. Máy chậm thì bớt hạt, bớt số bay, tắt rung.': 'Graphics: auto. On a slow device, fewer particles and numbers, no shake.',
    'Hình ảnh: cao (đủ hiệu ứng).': 'Graphics: high (all effects).',
    'Hình ảnh: thấp (ít hạt, ít số bay, không rung màn). Luật chơi không đổi.': 'Graphics: low (fewer particles and numbers, no screen shake). Gameplay unchanged.' });
  // áp bậc người chơi đã chọn ngay khi trang chạy (G.VFX đã có từ js/vfx_cfg.js)
  try { apDung(bacNay()); } catch (e) { /* bỏ qua */ }
})();
