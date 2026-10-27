/* ======================= HƯỚNG MỚI "CỔ TÍCH CHUÔNG TÀN" – khối thêm vào bản THỬ game/thu-huong-moi/thu-huong-moi.html =======================
   Theo art/huong-moi/TU-VAN-CHUYEN-GIA-2-CO-TICH-CHUONG-TAN.md, mục 5 bước 1–2 + mục 3 (ánh sáng). CHƯA có ảnh gen mới: chỉ chỉnh bằng code
   trên asset hiện có + Lam cũ.
   Nguyên tắc hiệu năng (MDN "Optimizing canvas", trong file tư vấn): mọi xử lý điểm ảnh (tô màu, dịu vân, bo góc) làm MỘT LẦN lúc nạp;
   quầng sáng, sương, vignette, hạt bụi là ảnh VẼ SẴN – mỗi khung chỉ drawImage. Không shadowBlur, không ctx.filter, không blur mỗi khung.

   Cờ URL (bật/tắt từng lớp để so):  ?hm=0 tắt HẾT (= demo.html hiện tại)   ?grade=0 không tô màu   ?dat=0 không dịu vân / bo góc đất
     ?sang=0 không quầng sáng   ?suong=0 không sương / bóng tối vực   ?vignette=0   ?bui=0   ?bot=1 giữ đủ trang trí ở góc cảnh chuẩn
     ?vuc=0 giữ hố nông cũ (không đào vực)   ?quai=1 thêm 1 Chuông Gỗ sau vực (thử "nguy hiểm nổi nhất")
   Phần THỬ (không ghép): bot đi qua cảnh, API TVTHU (chụp / quay / đo). */

/* ---------- SỐ ĐANG DÙNG (chủ dự án chỉnh ở đây; giải thích trong GHI-CHU.md) ---------- */
const HM_SO = {
  BANG: {nenSau: '#17272C', goToi: '#39312E', goSang: '#65503C', aoLam: '#35465C', teal: '#648D88', dongCu: '#A78046', loiDen: '#F2D69A'},
  // tô màu: lanh = trộn dải màu LẠNH (xanh đêm – xanh ngọc xám) với dải ẤM (gỗ – đồng – vàng đèn); tron = mức thay bằng dải màu;
  // tp = tương phản giữ lại (1 = như cũ); sang = độ sáng; ds = bớt bão hoà
  GRADE: {
    xa:    {lanh: 0.85, tron: 0.70, tp: 0.50, sang: 0.70, ds: 0.35},   // nền xa (0,08): ít tương phản nhất
    giua:  {lanh: 0.60, tron: 0.62, tp: 0.60, sang: 0.68, ds: 0.30},   // nhà, cầu, giá chuông (0,40)
    gan:   {lanh: 0.35, tron: 0.55, tp: 0.75, sang: 0.78, ds: 0.25},   // khung rễ gần (0,65)
    tien:  {lanh: 0.50, tron: 0.70, tp: 0.80, sang: 0.62, ds: 0.30},   // tiền cảnh rễ treo (1,05) – bóng tối viền khung
    dat:   {lanh: 0.10, tron: 0.45, tp: 0.85, sang: 1.00, ds: 0.20},   // gạch + trang trí địa hình: sàn chơi RÕ hơn nền
    doVat: {lanh: 0.00, tron: 0.25, tp: 0.95, sang: 1.00, ds: 0.15},   // điểm lưu, cổng, công tắc, đèn
    quai:  {lanh: 0.10, tron: 0.25, tp: 0.95, sang: 0.95, ds: 0.15}    // chỉ khi ?quai=1 (bỏ rêu chanh)
  },
  REU: {tu: 62, den: 150, dich: 50, giuBao: 0.45, giuSang: 0.80},      // rêu xanh chanh (sắc độ 62–150°) → olive xỉn (50°), bão hoà ×0,45, sáng ×0,8
  DAT: {r: 5, kThan: 0.40, kCanh: 0.65, kTT: 0.55, boGoc: 6, vien: '#0d1517', sangThan: 0.80},   // dịu vân: giữ 40 % chi tiết nhỏ ở thân, 65 % ở ô cạnh; bo góc 6 logic; thân tối 20 % (mặt trên giữ sáng, tối dần xuống) → mặt sàn nổi
  SANG: {
    den:     {r: 150, a: 0.80},     // quầng đèn lồng (vẽ sau nền, trước gạch)
    denSan:  {r: 200, a: 0.16},     // vệt sáng rơi xuống sàn + Lam quanh đèn (vẽ sau Lam, rất nhẹ)
    chuong:  {r: 70,  a: 0.34},     // quầng chuông làng khi còn sáng
    tatSau: 84,                     // chuông tắt dần trong 84 bước (1,4 s) sau khi Lam đi qua
    vucDo:   {r: 120, a: 0.20}      // ánh cam đỏ rất mờ dưới đáy vực = nguy hiểm
  },
  SUONG: {a: 0.55, mau: '#648D88', toc: 0.12, tuY: 452, dayToi: 0.88},   // sương mỏng chỉ dưới mặt sàn (lộ ra ở vực); đáy vực tối 88 %
  VIGNETTE: {a: 0.13},              // tối góc 13 % (dải chân sàn chỉ ≤ 3 %)
  BUI: {n: 18}
};

/* ---------- CẢNH CHUẨN: góc phải Cổng làng 1 (A1), camera x 192 = sát mép phải phòng ---------- */
const HM_CANH = {
  camx: 192, camy: 0,
  den: {x: 17 * 32 + 16, y: 140},               // đèn lồng DUY NHẤT giữ lại trong cảnh (trên bậc 2, chỉ ra mép vực); hạ 92 → 140 để trên iPhone không bị dòng hướng dẫn che
  anDen: [6 * 32 + 16, 12 * 32 + 16],             // đèn cột 6 và đèn treo thêm cột 12 (A1): ẩn (cờ, không xoá)
  chuong: {x: 848, y: 214, k: 0.82, kMoi: 1.3},  // chuông làng treo dây giữa cột treo và khối tường – tắt khi Lam đi qua (y = đáy chuông)
  vuc: {x0: 608, x1: 704},                       // hố cột 19–21 → đào thành vực (chỉ bản thử)
  anDoLang: ['bang-nhiem-vu'],                   // bảng nhiệm vụ đứng ở sàn A1: ẩn
  // trang trí bỏ ở góc này (cờ ?bot=1 để giữ): chân rễ nhỏ, rễ treo đầu cột, đáy hố, mảng rễ rong-re trên sàn A1
  boTT: it => it.x !== undefined && it.x < 1152 && it.x > 200 && (/^chan-re|^re-treo-cot/.test(it.o || '')),
  boMep: it => it.giai === 'mep' && it.y === 512 && it.x0 === 608
};

const HM = (() => {
  let q; try { q = new URLSearchParams(location.search); } catch (e) { q = new Map(); }
  const bat = q.get('hm') !== '0';
  const CO = {bat, grade: bat && q.get('grade') !== '0', dat: bat && q.get('dat') !== '0', sang: bat && q.get('sang') !== '0',
    suong: bat && q.get('suong') !== '0', vignette: bat && q.get('vignette') !== '0', bui: bat && q.get('bui') !== '0',
    bot: bat && q.get('bot') !== '1', vuc: bat && q.get('vuc') !== '0', quai: bat && q.get('quai') === '1'};
  const SO = {ms: 0, ms_grade: 0, ms_dat: 0, anh: 0, mpx: 0};

  /* ---------- màu ---------- */
  const hex = h => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
  const B = HM_SO.BANG;
  const DAI_AM = [[0, '#0b1416'], [0.2, B.nenSau], [0.42, B.goToi], [0.62, B.goSang], [0.82, B.dongCu], [1, B.loiDen]].map(([t, c]) => [t, hex(c)]);
  const DAI_LANH = [[0, '#0a1215'], [0.25, B.nenSau], [0.55, B.aoLam], [0.8, B.teal], [1, '#c9d6c4']].map(([t, c]) => [t, hex(c)]);
  function dai(D, t, o) { let i = 1; while (i < D.length - 1 && D[i][0] < t) i++; const a = D[i - 1], b = D[i], k = Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0])));
    o[0] = a[1][0] + (b[1][0] - a[1][0]) * k; o[1] = a[1][1] + (b[1][1] - a[1][1]) * k; o[2] = a[1][2] + (b[1][2] - a[1][2]) * k; }
  const _a = [0, 0, 0], _l = [0, 0, 0];
  /* 1 màu (0..1) → màu đã tô theo preset P */
  function toMau(r, g, b, P, o) {
    // rêu xanh chanh → olive xỉn
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    if (d > 0.06 && mx > 0.08) {
      let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360;
      const R = HM_SO.REU, w = h > R.tu && h < R.den ? Math.min(1, (h - R.tu) / 12, (R.den - h) / 12) : 0;
      if (w > 0) { let s = d / mx, v = mx; const h2 = h + (R.dich - h) * w; s *= 1 - (1 - R.giuBao) * w; v *= 1 - (1 - R.giuSang) * w;
        const c = v * s, x = c * (1 - Math.abs((h2 / 60) % 2 - 1)), m = v - c, k = Math.floor(h2 / 60) % 6;
        const rr = [c, x, 0, 0, x, c][k], gg = [x, c, c, x, 0, 0][k], bb = [0, 0, x, c, c, x][k]; r = rr + m; g = gg + m; b = bb + m; }
    }
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    let Lc = (0.4 + (L - 0.4) * P.tp) * P.sang; Lc = Lc < 0 ? 0 : Lc > 1 ? 1 : Lc;
    const k = L > 0.002 ? Lc / L : 0;
    let br = r * k, bg = g * k, bb = b * k; if (L <= 0.002) br = bg = bb = Lc;
    br += (Lc - br) * P.ds; bg += (Lc - bg) * P.ds; bb += (Lc - bb) * P.ds;
    dai(DAI_AM, Lc, _a); dai(DAI_LANH, Lc, _l);
    const rr = _a[0] + (_l[0] - _a[0]) * P.lanh, rg = _a[1] + (_l[1] - _a[1]) * P.lanh, rb = _a[2] + (_l[2] - _a[2]) * P.lanh;
    o[0] = br + (rr - br) * P.tron; o[1] = bg + (rg - bg) * P.tron; o[2] = bb + (rb - bb) * P.tron;
  }
  /* bảng tra 3 chiều 33³ (như file .cube) – tính 35 937 màu 1 lần mỗi preset, mỗi điểm ảnh nội suy 3 chiều */
  const N = 33, LUTS = {};
  function lut(ten) {
    if (LUTS[ten]) return LUTS[ten];
    const P = HM_SO.GRADE[ten], L = new Float32Array(N * N * N * 3), o = [0, 0, 0];
    for (let bi = 0; bi < N; bi++) for (let gi = 0; gi < N; gi++) for (let ri = 0; ri < N; ri++) {
      toMau(ri / (N - 1), gi / (N - 1), bi / (N - 1), P, o); const j = ((bi * N + gi) * N + ri) * 3;
      L[j] = o[0] * 255; L[j + 1] = o[1] * 255; L[j + 2] = o[2] * 255; }
    return (LUTS[ten] = L);
  }
  function apLut(D, ten) {
    const L = lut(ten), s = (N - 1) / 255, n = D.length;
    for (let i = 0; i < n; i += 4) {
      if (D[i + 3] === 0) continue;
      const fr = D[i] * s, fg = D[i + 1] * s, fb = D[i + 2] * s;
      const r0 = Math.min(fr | 0, N - 2), g0 = Math.min(fg | 0, N - 2), b0 = Math.min(fb | 0, N - 2), dr = fr - r0, dg = fg - g0, db = fb - b0;
      const j000 = ((b0 * N + g0) * N + r0) * 3, j100 = j000 + 3, j010 = j000 + N * 3, j110 = j010 + 3, NN = N * N * 3;
      for (let c = 0; c < 3; c++) {
        const c00 = L[j000 + c] + (L[j100 + c] - L[j000 + c]) * dr, c10 = L[j010 + c] + (L[j110 + c] - L[j010 + c]) * dr;
        const c01 = L[j000 + NN + c] + (L[j100 + NN + c] - L[j000 + NN + c]) * dr, c11 = L[j010 + NN + c] + (L[j110 + NN + c] - L[j010 + NN + c]) * dr;
        const c0 = c00 + (c10 - c00) * dg, c1 = c01 + (c11 - c01) * dg;
        D[i + c] = c0 + (c1 - c0) * db;
      }
    }
  }
  /* ---------- dịu vân: giữ k phần chi tiết nhỏ (ảnh = mờ + k × (ảnh − mờ)); mờ hộp bán kính r, theo alpha, trong ô (cell) ---------- */
  function diuVan(D, w, h, r, kFn, cell) {
    const cw = cell || w, ch = cell || h;
    const A = new Float32Array(w * h * 4);   // tiền nhân alpha: r·a, g·a, b·a, a
    for (let i = 0, j = 0; i < D.length; i += 4, j += 4) { const a = D[i + 3] / 255; A[j] = D[i] * a; A[j + 1] = D[i + 1] * a; A[j + 2] = D[i + 2] * a; A[j + 3] = a; }
    const T1 = new Float32Array(A.length), T2 = new Float32Array(A.length);
    for (let y = 0; y < h; y++) { const cy0 = 0; for (let x = 0; x < w; x++) {   // ngang
      const c0 = Math.floor(x / cw) * cw, c1 = Math.min(w - 1, c0 + cw - 1), x0 = Math.max(c0, x - r), x1 = Math.min(c1, x + r);
      let s0 = 0, s1 = 0, s2 = 0, s3 = 0; for (let k = x0; k <= x1; k++) { const j = (y * w + k) * 4; s0 += A[j]; s1 += A[j + 1]; s2 += A[j + 2]; s3 += A[j + 3]; }
      const n = x1 - x0 + 1, j = (y * w + x) * 4; T1[j] = s0 / n; T1[j + 1] = s1 / n; T1[j + 2] = s2 / n; T1[j + 3] = s3 / n; } }
    for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) {   // dọc
      const c0 = Math.floor(y / ch) * ch, c1 = Math.min(h - 1, c0 + ch - 1), y0 = Math.max(c0, y - r), y1 = Math.min(c1, y + r);
      let s0 = 0, s1 = 0, s2 = 0, s3 = 0; for (let k = y0; k <= y1; k++) { const j = (k * w + x) * 4; s0 += T1[j]; s1 += T1[j + 1]; s2 += T1[j + 2]; s3 += T1[j + 3]; }
      const n = y1 - y0 + 1, j = (y * w + x) * 4; T2[j] = s0 / n; T2[j + 1] = s1 / n; T2[j + 2] = s2 / n; T2[j + 3] = s3 / n; }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4; if (D[i + 3] === 0 || T2[i + 3] < 0.02) continue;
      const k = kFn(x, y); if (k >= 1) continue;
      for (let c = 0; c < 3; c++) { const m = T2[i + c] / T2[i + 3]; D[i + c] = m + (D[i + c] - m) * k; }
    }
  }
  /* ---------- canvas ↔ điểm ảnh ---------- */
  function veRa(img, w, h) { const c = document.createElement('canvas'); c.width = w || img.naturalWidth || img.width; c.height = h || img.naturalHeight || img.height;
    const g = c.getContext('2d', {willReadFrequently: true}); g.drawImage(img, 0, 0, c.width, c.height); return c; }
  function xuLy(img, fn) {   // trả canvas mới đã xử lý (ảnh gốc giữ nguyên)
    const c = veRa(img), g = c.getContext('2d', {willReadFrequently: true}), id = g.getImageData(0, 0, c.width, c.height);
    fn(id.data, c.width, c.height); g.putImageData(id, 0, 0); SO.anh++; SO.mpx += c.width * c.height / 1e6; return c;
  }
  function tom(img, preset, van, sang) {
    const t0 = performance.now();
    const c = xuLy(img, (D, w, h) => {
      if (van && CO.dat) { const t1 = performance.now(); diuVan(D, w, h, HM_SO.DAT.r, () => van, 0); SO.ms_dat += performance.now() - t1; }
      if (CO.grade) apLut(D, preset);
      if (sang && CO.dat) for (let i = 0; i < D.length; i += 4) { D[i] *= sang; D[i + 1] *= sang; D[i + 2] *= sang; }
    });
    SO.ms_grade += performance.now() - t0; return c;
  }

  /* ---------- atlas gạch: dịu vân theo loại ô, bo góc lộ, tô màu ---------- */
  const GOC = {'tren-trai': 'tl', 'tren-phai': 'tr', 'day-trai': 'bl', 'day-phai': 'br', 'cot-tren': 'tl tr', 'cot-day': 'bl br', 'khoi': 'tl tr bl br',
    'noi-trai': 'tl bl', 'noi-phai': 'tr br'};
  function gachXuLy() {
    const cv = GCH.cv, g = cv.getContext('2d', {willReadFrequently: true}), id = g.getImageData(0, 0, cv.width, cv.height), D = id.data, w = cv.width, h = cv.height;
    const t0 = performance.now();
    const loai = new Map();   // ô (cột, hàng trong lưới 68) → hệ số giữ chi tiết
    for (const [ten, i] of Object.entries(GCH.o)) { const goc = ten.replace(/^(go|da)-/, '');
      loai.set(i, /^than|^goc-trong/.test(goc) ? HM_SO.DAT.kThan : /^van|^doc/.test(goc) ? 1 : HM_SO.DAT.kCanh); }
    if (CO.dat) {
      diuVan(D, w, h, HM_SO.DAT.r, (x, y) => { const i = Math.floor(y / 68) * 16 + Math.floor(x / 68); const k = loai.get(i); return k === undefined ? 1 : k; }, 68);
      // bo góc lộ (cạnh cắt vuông → góc tròn bán kính boGoc logic = ×2 trong atlas), vẽ lại viền tối theo cung
      const R = HM_SO.DAT.boGoc * 2, V = hex(HM_SO.DAT.vien).map(v => v * 255);
      for (const [ten, i] of Object.entries(GCH.o)) {
        const goc = GOC[ten.replace(/^(go|da)-/, '').replace(/-\d$/, '')]; if (!goc) continue;
        const [dx, dy] = GCH.k[i];
        for (const gc of goc.split(' ')) {
          const cx = gc[1] === 'l' ? dx + R : dx + 64 - R, cy = gc[0] === 't' ? dy + R : dy + 64 - R;
          const xa = gc[1] === 'l' ? dx - 2 : cx, xb = gc[1] === 'l' ? cx : dx + 66, ya = gc[0] === 't' ? dy - 2 : cy, yb = gc[0] === 't' ? cy : dy + 66;
          for (let y = ya; y < yb; y++) for (let x = xa; x < xb; x++) {
            const dd = Math.hypot(x + 0.5 - cx, y + 0.5 - cy), j = (y * w + x) * 4;
            if (dd > R) D[j + 3] = 0;
            else if (dd > R - 3) { const a = Math.min(1, (dd - (R - 3)) / 2) * 0.9; D[j] += (V[0] - D[j]) * a; D[j + 1] += (V[1] - D[j + 1]) * a; D[j + 2] += (V[2] - D[j + 2]) * a;
              if (dd > R - 1) D[j + 3] = D[j + 3] * Math.max(0, R - dd); }
          }
        }
      }
      SO.ms_dat += performance.now() - t0;
    }
    if (CO.grade) apLut(D, 'dat');
    if (CO.dat) for (const [ten, i] of Object.entries(GCH.o)) {   // thân lùi vào bóng (×sangThan); ô có MẶT TRÊN lộ: sáng ở mặt, tối dần xuống đúng mức thân → không có vạch nối
      const goc = ten.replace(/^(go|da)-/, ''); if (/^van|^doc/.test(goc)) continue;
      const mat = /^tren|^cot-tren|^khoi|^noi/.test(goc), kT = HM_SO.DAT.sangThan, [dx, dy] = GCH.k[i];
      for (let y = dy - 2; y < dy + 66; y++) { const t = Math.max(0, Math.min(1, (y - dy - 14) / 46)), k = mat ? 1 + (kT - 1) * t : kT;
        for (let x = dx - 2; x < dx + 66; x++) { const j = (y * w + x) * 4; D[j] *= k; D[j + 1] *= k; D[j + 2] *= k; } } }
    g.putImageData(id, 0, 0); SO.anh++; SO.mpx += w * h / 1e6;
    SO.ms_grade += performance.now() - t0;
  }

  /* ---------- ảnh vẽ sẵn: quầng, sương, bóng tối vực, vignette, chấm bụi ---------- */
  const VE = {};
  function quang(mau, mau2) {   // quầng tròn 128×128, alpha 1 ở tâm → 0 ở mép (độ mạnh đặt bằng globalAlpha lúc vẽ)
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64), [r, gg, b] = hex(mau).map(v => v * 255 | 0), [r2, g2, b2] = hex(mau2 || mau).map(v => v * 255 | 0);
    gr.addColorStop(0, `rgba(${r},${gg},${b},1)`); gr.addColorStop(0.18, `rgba(${r},${gg},${b},.62)`); gr.addColorStop(0.45, `rgba(${r2},${g2},${b2},.22)`);
    gr.addColorStop(0.75, `rgba(${r2},${g2},${b2},.06)`); gr.addColorStop(1, `rgba(${r2},${g2},${b2},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c;
  }
  function veSan() {
    VE.den = quang(B.loiDen, '#d9a24e'); VE.chuong = quang('#f4d58f', B.dongCu); VE.do = quang('#e0603c', '#a8322a');
    VE.luu = quang('#ffd678', '#ffbe50');
    // sương: 18 vệt mờ (hạt giống cố định) trong ảnh 256×96, lặp ngang liền (vệt sát mép vẽ 2 lần)
    const s = document.createElement('canvas'); s.width = 256; s.height = 96; const sg = s.getContext('2d'); let sd = 7;
    const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647, [r, g, b] = hex(HM_SO.SUONG.mau).map(v => v * 255 | 0);
    for (let i = 0; i < 18; i++) { const x = rnd() * 256, y = 30 + rnd() * 50, rx = 30 + rnd() * 50, a = 0.10 + rnd() * 0.14;
      for (const X of [x - 256, x, x + 256]) { const gr = sg.createRadialGradient(X, y, 0, X, y, rx); gr.addColorStop(0, `rgba(${r},${g},${b},${a})`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
        sg.save(); sg.translate(0, y); sg.scale(1, 0.45); sg.translate(0, -y); sg.fillStyle = gr; sg.fillRect(X - rx, y - rx, rx * 2, rx * 2); sg.restore(); } }
    VE.suong = s;
    // bóng tối dần xuống đáy vực (dải dọc 1×64)
    const t = document.createElement('canvas'); t.width = 1; t.height = 64; const tg = t.getContext('2d'), tr = tg.createLinearGradient(0, 0, 0, 64);
    tr.addColorStop(0, 'rgba(8,14,17,0)'); tr.addColorStop(0.3, 'rgba(8,14,17,.6)'); tr.addColorStop(1, `rgba(6,11,13,${HM_SO.SUONG.dayToi})`);
    tg.fillStyle = tr; tg.fillRect(0, 0, 1, 64); VE.toi = t;
    // vignette 240×135 (vẽ phóng ×4): elip, mạnh nhất ở góc; dải chân sàn (y > 72 % màn) gần như không tối, trừ 2 góc dưới
    const v = document.createElement('canvas'); v.width = 240; v.height = 135; const vg = v.getContext('2d'), id = vg.createImageData(240, 135), Dv = id.data;
    for (let y = 0; y < 135; y++) for (let x = 0; x < 240; x++) {
      const nx = (x + 0.5) / 120 - 1, ny = (y + 0.5) / 67.5 - 1, d = Math.sqrt(nx * nx * 0.9 + ny * ny * 1.1);
      let a = Math.min(1, Math.max(0, (d - 0.62) / 0.62)); a = a * a * (3 - 2 * a);
      const day = Math.max(0, Math.min(1, (y / 135 - 0.70) / 0.08)), mep = Math.max(0, Math.min(1, (Math.abs(nx) - 0.72) / 0.28));
      a *= 1 - day * (1 - mep) * 0.8;
      const j = (y * 240 + x) * 4; Dv[j] = 8; Dv[j + 1] = 13; Dv[j + 2] = 16; Dv[j + 3] = a * HM_SO.VIGNETTE.a * 255 / 0.92; }
    vg.putImageData(id, 0, 0); VE.vig = v;
    // chấm bụi 8×8
    const p = document.createElement('canvas'); p.width = p.height = 8; const pg = p.getContext('2d'), pr = pg.createRadialGradient(4, 4, 0, 4, 4, 4);
    pr.addColorStop(0, 'rgba(250,228,170,1)'); pr.addColorStop(0.5, 'rgba(242,214,154,.45)'); pr.addColorStop(1, 'rgba(242,214,154,0)'); pg.fillStyle = pr; pg.fillRect(0, 0, 8, 8); VE.bui = p;
  }

  /* ---------- chuông làng (cắt từ khung "điểm lưu tắt" có sẵn: chỉ quả chuông + quai, loang từ tâm theo alpha) ---------- */
  const CH = {img: null, sang: null, w: 0, h: 0, tat: false, t: 0, lac: 0};
  const LHT_TO = [];
  function catChuong() {
    const f = GIU.frames['diem-luu-tat'], X = f[0] + 52, Y = f[1] + 44, w = 50, h = 86;
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d', {willReadFrequently: true});
    g.drawImage(GIU.img0 || GIU.img, X, Y, w, h, 0, 0, w, h);
    const id = g.getImageData(0, 0, w, h), D = id.data, giu = new Uint8Array(w * h), st = [[25, 45]];
    while (st.length) { const [x, y] = st.pop(); if (x < 2 || y < 0 || x >= w - 2 || y >= h || (y < 14 && Math.abs(x - 25) > 5)) continue; const i = y * w + x; if (giu[i] || D[i * 4 + 3] < 40) continue; giu[i] = 1; st.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]); }
    for (let i = 0; i < w * h; i++) if (!giu[i]) D[i * 4 + 3] = 0;
    if (CO.grade) apLut(D, 'doVat');
    g.putImageData(id, 0, 0); CH.img = c; CH.w = w; CH.h = h;
    const s = document.createElement('canvas'); s.width = w; s.height = h; const sg = s.getContext('2d'); sg.drawImage(c, 0, 0);
    sg.globalCompositeOperation = 'source-atop'; sg.globalAlpha = 0.42; sg.fillStyle = B.loiDen; sg.fillRect(0, 0, w, h); CH.sang = s;
  }

  /* ---------- bụi sáng: 18 hạt trong vùng đèn (toạ độ so với đèn) ---------- */
  const BUI = [];
  function taoBui() { let sd = 3; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < HM_SO.BUI.n; i++) BUI.push({x: (rnd() - 0.5) * 150, y: 10 + rnd() * 250, vx: (rnd() - 0.5) * 0.12, vy: -0.05 - rnd() * 0.1, p: rnd() * 6.3, s: 1.4 + rnd() * 1.8}); }

  /* ---------- nạp: gọi 1 lần sau khi dựng gạch (lc = kết quả napLC) ---------- */
  /* ảnh đã xử lý → ImageBitmap (canvas làm nguồn drawImage bị chụp lại mỗi lần vẽ trên một số trình duyệt → chậm; bitmap thì như ảnh thường) */
  /* ảnh LỚN đã xử lý → lại thành <img> (PNG trong bộ nhớ, giải mã sẵn): trình duyệt vẽ/thu nhỏ y như ảnh gốc (có mipmap) */
  async function img(c) { if (!c || !c.toBlob) return c;
    try { const bl = await new Promise(r => c.toBlob(r, 'image/png')); const u = URL.createObjectURL(bl), im = new Image(); im.src = u; await im.decode(); return im; }
    catch (e) { return bm(c); } }
  async function bm(c) { if (!c || !c.getContext || typeof createImageBitmap !== 'function') return c; try { return await createImageBitmap(c); } catch (e) { return c; } }
  async function chuanBi(lc) {
    if (!bat) return;
    const t0 = performance.now();
    if (CO.grade || CO.dat) {
      const ten = ['xa', 'giua', 'gan'];
      NEN.lop.forEach((L, i) => { L.img = tom(L.img, ten[i] || 'gan', 0); });
      if (NEN.tien) NEN.tien.img = tom(NEN.tien.img, 'tien', 0);
      if (NEN.re) NEN.re.img = tom(NEN.re.img, 'dat', HM_SO.DAT.kTT, HM_SO.DAT.sangThan);
      gachXuLy();
      // trang trí địa hình: mỗi atlas 1 lần (mảng gỗ / mép / chân rễ / cổng…); tiền cảnh rễ-đá theo preset tiền cảnh
      const da = new Map();
      for (const o of Object.values(TT.O)) { if (!o.img || da.has(o.img)) continue; da.set(o.img, null); }
      for (const [k, o] of Object.entries(TT.O)) { if (!o.img) continue; let m = da.get(o.img);
        if (!m) { const go = /^mang-go/.test(k); m = tom(o.img, /^tien-canh/.test(k) ? 'tien' : 'dat', go ? HM_SO.DAT.kTT : 0, go ? HM_SO.DAT.sangThan : 0); da.set(o.img, m); } o.img = m; }
      for (const k of Object.keys(DOV)) DOV[k] = tom(DOV[k], 'doVat', 0);
      GIU.img0 = GIU.img; GIU.img = tom(GIU.img, 'doVat', 0);
      if (lhOn()) { const daL = new Map();   // ảnh gen làng mới: điểm lưu, đèn, rễ trần, chuông lớn, đồ làng, NPC (KHÔNG tô HUD, nút, chân dung)
        for (const [k, o] of Object.entries(LHT.O)) { if (!o.img || /^(hud|nut|can|cd)-/.test(k)) continue;
          if (!daL.has(o.img)) daL.set(o.img, tom(o.img, 'doVat', 0)); o.img = daL.get(o.img); }
        for (const m of daL.values()) LHT_TO.push(m); }
      if (CO.quai && CO.grade && QBR.json && QBR.json()) for (const nv of Object.values(QBR.json().nv)) for (const n of Object.values(nv.nut)) if (n.img) {
        n.img = tom(n.img, 'quai', 0);
        const c = n.vang; if (c && c.getContext) { const g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); g.drawImage(n.img, 0, 0); g.globalCompositeOperation = 'source-atop';
          g.globalAlpha = 0.7; g.fillStyle = '#D8583A'; g.fillRect(0, 0, c.width, c.height); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; } }   // lóe đòn: vàng → cam đỏ
    }
    catChuong(); veSan(); taoBui();
    const t1 = performance.now();   // đổi mọi canvas đã xử lý sang bitmap (1 lần)
    for (const L of NEN.lop) L.img = await img(L.img);
    if (NEN.tien) NEN.tien.img = await img(NEN.tien.img);
    if (NEN.re) NEN.re.img = await bm(NEN.re.img);
    if (CO.grade || CO.dat) GCH.cv = await img(GCH.cv);
    const bmo = new Map(); for (const o of Object.values(TT.O)) if (o.img && o.img.getContext) { if (!bmo.has(o.img)) bmo.set(o.img, await img(o.img)); o.img = bmo.get(o.img); }
    for (const k of Object.keys(DOV)) DOV[k] = await bm(DOV[k]);
    if (LHT_TO.length) { const doi = new Map(); for (const c of LHT_TO) doi.set(c, await img(c)); for (const o of Object.values(LHT.O)) if (doi.has(o.img)) o.img = doi.get(o.img); }
    if (GIU.img.getContext) GIU.img = await bm(GIU.img);
    CH.img = await bm(CH.img); CH.sang = await bm(CH.sang);
    for (const k of Object.keys(VE)) VE[k] = await bm(VE[k]);
    if (CO.quai && QBR.json && QBR.json()) for (const nv of Object.values(QBR.json().nv)) for (const n of Object.values(nv.nut)) { if (n.img && n.img.getContext) n.img = await bm(n.img); if (n.vang && n.vang.getContext) n.vang = await bm(n.vang); }
    SO.ms_doi_anh = Math.round(performance.now() - t1);
    if (CO.bot) {
      for (const d of Object.values(TT.DL)) if (d.dat) d.dat = d.dat.filter(it => !HM_CANH.boTT(it) && !(CO.vuc && HM_CANH.boMep(it)));
      for (let i = RE_DAT.length - 1; i >= 0; i--) if (RE_DAT[i].x < 1152) RE_DAT.splice(i, 1);
      for (const d of DEN) if (d.x === HM_CANH.den.x && d.x < 1152) d.y = HM_CANH.den.y;
      for (let i = LANG_DV.length - 1; i >= 0; i--) if (LANG_DV[i].x < 1152 && HM_CANH.anDoLang.includes(LANG_DV[i].o)) LANG_DV.splice(i, 1);
    }
    SO.ms = Math.round(performance.now() - t0); SO.ms_grade = Math.round(SO.ms_grade); SO.ms_dat = Math.round(SO.ms_dat); SO.mpx = +SO.mpx.toFixed(2);
  }

  /* ---------- mỗi bước logic ---------- */
  function buoc() {
    if (!bat) return;
    if (!CH.tat && S.room === A1.i && pl.x + pl.w / 2 > HM_CANH.chuong.x + 6 && !pl.dead) {
      CH.tat = true; CH.t = 0; CH.lac = 1;
      if (SND.ac) { bell(196, 2.6, 0.035); bell(392, 1.4, 0.015, 0.05); }   // ngân trầm lần cuối
      for (let i = 0; i < 5; i++) part(HM_CANH.chuong.x + (Math.random() - 0.5) * 18, HM_CANH.chuong.y - 6, (Math.random() - 0.5) * 0.25, 0.1 + Math.random() * 0.2, 50 + Math.random() * 30 | 0, B.dongCu, 1, 0.01);
    }
    if (CH.tat) CH.t++;
    for (const b of BUI) { b.x += b.vx; b.y += b.vy; b.p += 0.02;
      if (b.y < 8) b.y += 250; if (b.x < -80) b.x += 160; if (b.x > 80) b.x -= 160; }
  }
  function chuongSang() { return !CH.tat ? 1 : Math.max(0, 1 - CH.t / HM_SO.SANG.tatSau) * (0.85 + 0.15 * Math.sin(CH.t * 0.9)); }

  /* ---------- VẼ ---------- */
  // sau nền, trước đèn + gạch: sương mỏng + bóng tối dưới mặt sàn (chỉ lộ ra ở vực; gạch che phần còn lại) + ánh cam đỏ đáy vực
  function veSauNen(ox, oy) {
    if (!bat) return; ctx.imageSmoothingQuality = 'low';   // dải màu mềm: lọc thường là đủ (lọc 'high' tốn khi phóng to)
    const y0 = HM_SO.SUONG.tuY - oy;
    if (CO.suong && y0 < H) {
      ctx.drawImage(VE.toi, 0, 0, 1, 64, 0, y0, W, Math.max(1, H - y0 + 4));
      const k = HM_SO.SUONG.toc, sx = -((ox * 1.0 + S.frame * k) % 320 + 320) % 320;
      ctx.globalAlpha = HM_SO.SUONG.a;
      for (let x = sx; x < W; x += 320) ctx.drawImage(VE.suong, x, y0 - 6, 320, 120);
      const sx2 = -((ox * 1.0 - S.frame * k * 0.6 + 160) % 320 + 320) % 320; ctx.globalAlpha = HM_SO.SUONG.a * 0.6;
      for (let x = sx2; x < W; x += 320) ctx.drawImage(VE.suong, x, y0 + 30, 320, 120);
      ctx.globalAlpha = 1;
    }
    if (CO.sang && CO.vuc) { const V = HM_CANH.vuc, X = (V.x0 + V.x1) / 2 - ox, Y = H + 70 - oy, r = HM_SO.SANG.vucDo.r;
      if (X > -r && X < W + r) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = HM_SO.SANG.vucDo.a * (0.85 + 0.15 * Math.sin(S.frame * 0.025));
        ctx.drawImage(VE.do, X - r, Y - r, r * 2, r * 2); ctx.restore(); } }
    ctx.imageSmoothingQuality = 'high';
  }
  // đèn lồng (thay drawDen) + chuông làng treo
  function veDen(lop) {
    if (!bat) return false; ctx.imageSmoothingEnabled = true;
    const moi = lhOn();
    for (const d of DEN) { if (d.lop !== (lop || 'sau') || (d.them && !moi)) continue; const x = d.x - ox, y = d.y - oy; if (x < -160 || x > W + 160) continue;
      if (CO.bot && d.x < 1152 && HM_CANH.anDen.includes(d.x)) continue;
      const sw = Math.sin(S.frame * 0.03 + d.ph) * 3, sang = !(moi && d.boss && !boss.dead);
      ctx.strokeStyle = 'rgba(20,16,13,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, -oy - 4); ctx.lineTo(x + sw, y - 46); ctx.stroke();
      if (CO.sang && sang) { const r = HM_SO.SANG.den.r; ctx.save(); ctx.imageSmoothingQuality = 'low'; ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = HM_SO.SANG.den.a;
        ctx.drawImage(VE.den, x + sw - r, y - 22 - r, r * 2, r * 2); ctx.restore(); ctx.imageSmoothingQuality = 'high'; }
      if (moi) LHT.ve(ctx, 'den-' + d.kieu + '-' + (sang ? 'sang' : 'tat'), x + sw, y - 46, {xoay: sw * 0.012});
      else if (d.lop === 'sau') veKhung(GIU, GIU.img, 'den-long', x + sw, y);
    }
    if ((lop || 'sau') !== 'sau') return true;
    // chuông làng: treo dây từ mép trên; còn sáng → ánh đồng + quầng; Lam đi qua → ngân 1 lần, lắc, tắt dần, ở lại tắt
    const C = HM_CANH.chuong, X = C.x - ox, Y = C.y - oy;
    if (X > -80 && X < W + 80 && CH.img) {
      const lac = CH.tat ? Math.sin(CH.t * 0.11) * 0.09 * Math.exp(-CH.t / 110) : Math.sin(S.frame * 0.017) * 0.012, s = chuongSang();
      const w = CH.w * C.k, h = CH.h * C.k;
      ctx.strokeStyle = 'rgba(20,16,13,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X, -oy - 4); ctx.lineTo(X + Math.sin(lac) * 6, Y - h + 2); ctx.stroke();
      if (CO.sang && s > 0) { const r = HM_SO.SANG.chuong.r; ctx.save(); ctx.imageSmoothingQuality = 'low'; ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = HM_SO.SANG.chuong.a * s;
        ctx.drawImage(VE.chuong, X - r, Y - h * 0.45 - r, r * 2, r * 2); ctx.restore(); }
      if (lhOn() && LHT.O['diem-luu-chuong-tat']) {   // chuông rời ảnh gen mới (neo = vòng treo)
        LHT.ve(ctx, 'diem-luu-chuong-tat', X, Y - h, {xoay: lac, k: C.kMoi});
        if (s > 0) LHT.ve(ctx, 'diem-luu-chuong-sang', X, Y - h, {xoay: lac, k: C.kMoi, al: s});
      } else {
        ctx.save(); ctx.translate(X, Y - h); ctx.rotate(lac);
        ctx.drawImage(CH.img, -w / 2, 0, w, h);
        if (s > 0) { ctx.globalAlpha = s; ctx.drawImage(CH.sang, -w / 2, 0, w, h); }
        ctx.restore();
      }
    }
    return true;
  }
  // sau Lam + tiền cảnh: ánh đèn rơi xuống sàn / Lam (rất nhẹ), bụi sáng trong vùng đèn, vignette
  function veTruoc(ox, oy) {
    if (!bat) return; ctx.imageSmoothingQuality = 'low';
    const D = HM_CANH.den, dx = D.x - ox, dy = (CO.bot ? D.y : 92) - oy, sw = 0;
    if (CO.sang && dx > -250 && dx < W + 250) { const r = HM_SO.SANG.denSan.r; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = HM_SO.SANG.denSan.a;
      ctx.drawImage(VE.den, dx - r * 0.9, dy + 40, r * 1.8, r * 2.0); ctx.restore(); }
    if (CO.bui && dx > -120 && dx < W + 120) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const b of BUI) { const kc = Math.hypot(b.x, b.y - 90) / 170, a = Math.max(0, 1 - kc) * (0.45 + 0.35 * Math.sin(b.p));
        if (a <= 0.02) continue; ctx.globalAlpha = a; const s = b.s * 2; ctx.drawImage(VE.bui, dx + sw + b.x - s / 2, dy + b.y - s / 2, s, s); }
      ctx.restore();
    }
    if (CO.vignette) ctx.drawImage(VE.vig, 0, 0, W, H);
    ctx.imageSmoothingQuality = 'high';
  }

  return {CO, SO, CH, BUI, VE, bat, chuanBi, buoc, veSauNen, veDen, veTruoc, toMau, chuongSang,
    datLaiChuong() { CH.tat = false; CH.t = 0; }, tatChuong() { CH.tat = true; CH.t = 999; }};
})();

/* ---------- bản đồ bản thử: đào hố cột 19–21 A1 thành vực (không đáy); rơi xuống → về mép vực trái ---------- */
if (HM.CO.vuc) fill(A1, 19, 14, 21, ROWS - 1, '.');
if (HM.CO.quai) Q.push(mkQuai(A1, 26, FLOOR, 23, 27, false));

/* ======================= THỬ (không ghép vào demo.html) ======================= */
const HM_THU = (() => { let q; try { q = new URLSearchParams(location.search); } catch (e) { q = new Map(); } return {ghi: q.get('ghi') === '1'}; })();
const HM_BOT = {on: false, t: 0, x1: 0, xong: false, giuJ: false, giuT: 0};
function hmBotBuoc() {
  if (!HM_BOT.on || pl.dead) return; for (const k of KEYS) kb[k] = 0; HM_BOT.t++;
  if (HM_BOT.giuJ) { kb.j = 1; HM_BOT.giuT++; if ((HM_BOT.giuT > 2 && pl.vy >= 0 && !pl.onGround) || HM_BOT.giuT > 30) HM_BOT.giuJ = false; }
  const fx = pl.x + pl.w / 2, fy = pl.y + pl.h, dac = (x, y) => solidC(tile(Math.floor(x / T), Math.floor(y / T)));
  if (fx < HM_BOT.x1) kb.r = 1;
  const vatCan = dac(fx + 44, fy - 4) || dac(fx + 44, fy - 40), hetDat = !dac(fx + 26, fy + 4);
  if (pl.onGround && !HM_BOT.giuJ && (vatCan || hetDat) && fx < HM_BOT.x1 - 40) { HM_BOT.giuJ = true; HM_BOT.giuT = 0; kb.j = 1; }
  if (fx >= HM_BOT.x1 && pl.onGround) { HM_BOT.xong = true; HM_BOT.on = false; for (const k of KEYS) kb[k] = 0; }
  if (HM_BOT.t > 900) { HM_BOT.xong = true; HM_BOT.on = false; }
}
const _hmStep = step;
step = function () {
  hmBotBuoc(); _hmStep();
  if (HM.CO.vuc && !S.paused && pl.y > ROWS * T + 60) { placePlayer(HM_CANH.vuc.x0 - 40, FLOOR - pl.h); pl.iframes = 60; S.fade = 0.8; S.fadeDir = -1; toast('Vực sâu…'); }
};
if (HM_THU.ghi) loop = function () {};
window.TVTHU = {
  hm: HM, bot: HM_BOT, canh: HM_CANH,
  async batDau() { while (!(window.TVDEMO && TVDEMO.ready && loadEl.hidden)) await wait(50); audioInit(); startEl.hidden = true; S.paused = false; document.getElementById('warn').hidden = true; },
  anUI(v) { let st = document.getElementById('hm-an'); if (!st) { st = document.createElement('style'); st.id = 'hm-an'; document.head.appendChild(st); }
    st.textContent = v ? '#hint,#keys,#toast,#banner,.ui:not(.panel),button:not(#btn-start){visibility:hidden!important}' : ''; },
  /* đặt Lam (x, y chân) thế giới, mặt hướng f, camera cố định (camx, camy), đi 2 bước, vẽ 1 khung */
  datCam(x, y, camx, camy, f) { placePlayer(x - pl.w / 2, y - pl.h); pl.drawT = 0; pl.face = f || 1; const r = ROOMS[S.room];
    const cx = clamp(camx, r.x0 * T, (r.x0 + r.w) * T - W);
    for (let i = 0; i < 3; i++) { savePrev(); step(); S.camx = S.pcx = cx; S.camy = S.pcy = camy || 0; } render(1);
    return {camx: S.camx, camy: S.camy, ox, oy, x: pl.x, y: pl.y, room: S.room}; },
  khung(n, giuCam) { for (let i = 0; i < (n || 1); i++) { savePrev(); step(); if (giuCam) { S.camx = S.pcx = giuCam[0]; S.camy = S.pcy = giuCam[1]; } } render(1);
    return {f: S.frame, x: +(pl.x + pl.w / 2).toFixed(1), y: +(pl.y + pl.h).toFixed(1), ox, oy, xong: HM_BOT.xong, tat: HM.CH.tat, sang: +HM.chuongSang().toFixed(2), g: pl.onGround}; },
  batBot(x0, x1) { placePlayer(x0 - pl.w / 2, FLOOR - pl.h); pl.drawT = 0; pl.face = 1; Object.assign(HM_BOT, {on: true, t: 0, x1, xong: false, giuJ: false, giuT: 0}); },
  /* đo thời gian vẽ: n khung vẽ liên tiếp (không bước logic thêm) */
  doVe(n) { DO.reset(); for (let i = 0; i < n; i++) { savePrev(); step(); render(1); } const a = DO.ds.slice().sort((p, q) => p - q);
    return {n: a.length, tb: +(DO.tong / DO.n).toFixed(3), p50: +a[a.length >> 1].toFixed(3), p95: +a[Math.floor(a.length * 0.95)].toFixed(3), max: +DO.max.toFixed(3)}; },
  doLay() { const a = DO.ds.slice().sort((p, q) => p - q); if (!a.length) return null;
    return {n: a.length, tb: +(DO.tong / DO.n).toFixed(3), p50: +a[a.length >> 1].toFixed(3), p95: +a[Math.floor(a.length * 0.95)].toFixed(3), max: +DO.max.toFixed(3)}; },
  doXoa() { DO.reset(); },
  so() { return {hm: HM.SO, co: HM.CO, lc: LC_SO, tt: TT.so, bk: BK}; }
};
