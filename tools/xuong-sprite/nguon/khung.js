// XƯỞNG SPRITE: khung cơ thể (mẫu xương), chia bộ phận, tư thế theo động tác, dựng từng khung hình và tấm sprite.
// Hình luôn quay mặt sang phải. Toạ độ y hướng xuống. Góc xoay tính bằng độ, dương là theo chiều kim đồng hồ.
(function () {
  'use strict';
  const XS = (window.XS = window.XS || {});
  const PI = Math.PI, TAU = PI * 2, D2R = PI / 180;
  const sn = (u) => Math.sin(u * TAU);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const EASE = { lin: (t) => t, in: (t) => t * t, out: (t) => 1 - (1 - t) * (1 - t), io: (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)),
    back: (t) => { const x = t - 1; return 1 + 2.70158 * x * x * x + 1.70158 * x * x; },
    nay: (t) => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375; return n * (t -= 2.625 / d) * t + 0.984375; } };
  function kf(u, K) { if (u <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (u <= K[i][0]) { const a = K[i - 1], b = K[i]; return a[1] + (b[1] - a[1]) * EASE[b[2] || 'io']((u - a[0]) / ((b[0] - a[0]) || 1)); } return K[K.length - 1][1]; }
  XS.kf = kf;

  // ---------- MẪU XƯƠNG ----------
  // khop: toạ độ khớp theo tỉ lệ khung bao hình (0..1). bo: bộ phận {id, ten, a: khớp gốc (trục xoay), b: khớp đầu mút,
  // w: độ to (để tự đoán), z: lớp (lớn nằm trên), cha, vai: vai trò để chọn cử động, pha: lệch nhịp 0..1}.
  // kieu: cách đi (buoc: bước chân, bay: bay lượn, nay: nhún nhảy, truon: trườn). nga: chết thì ngã ngửa.
  const MAU = {
    // dungYen: bộ phận mặc định "Đứng yên" (em bé: đầu và thân yên, chỉ tay chân cử động). nhun: độ nhún cả người mặc định (%).
    nguoi: { ten: 'Người (2 chân)', kieu: 'buoc', nga: true, dungYen: ['dau', 'than'], nhun: 0,
      khop: { chan: [0.5, 1], hong: [0.5, 0.6], co: [0.5, 0.36], dinh: [0.5, 0.02], vaiT: [0.62, 0.42], tayT: [0.8, 0.62], vaiS: [0.4, 0.42], tayS: [0.24, 0.62], hongT: [0.56, 0.64], banT: [0.62, 0.99], hongS: [0.44, 0.64], banS: [0.38, 0.99] },
      bo: [
        { id: 'than', ten: 'Thân', a: 'hong', b: 'co', w: 1.8, z: 0, vai: 'than' },
        { id: 'dau', ten: 'Đầu', a: 'co', b: 'dinh', w: 1.9, z: 1, cha: 'than', vai: 'dau' },
        { id: 'tayT', ten: 'Tay trước', a: 'vaiT', b: 'tayT', w: 1, z: 2, cha: 'than', vai: 'tay', pha: 0 },
        { id: 'tayS', ten: 'Tay sau', a: 'vaiS', b: 'tayS', w: 1, z: -2, cha: 'than', vai: 'tay', pha: 0.5 },
        { id: 'chanT', ten: 'Chân trước', a: 'hongT', b: 'banT', w: 1.1, z: -0.5, vai: 'chan', pha: 0 },
        { id: 'chanS', ten: 'Chân sau', a: 'hongS', b: 'banS', w: 1.1, z: -1, vai: 'chan', pha: 0.5 }] },
    bonChan: { ten: 'Bốn chân', kieu: 'buoc',
      khop: { chan: [0.5, 1], hong: [0.3, 0.45], vai: [0.68, 0.45], co: [0.74, 0.42], mui: [1, 0.32], vaiN: [0.7, 0.62], banTN: [0.73, 0.99], vaiX: [0.62, 0.62], banTX: [0.63, 0.99], hongN: [0.32, 0.62], banSN: [0.3, 0.99], hongX: [0.24, 0.62], banSX: [0.22, 0.99], goc: [0.16, 0.42], duoi: [0, 0.22] },
      bo: [
        { id: 'than', ten: 'Thân', a: 'hong', b: 'vai', w: 2.2, z: 0, vai: 'than' },
        { id: 'dau', ten: 'Đầu', a: 'co', b: 'mui', w: 2.4, z: 1, cha: 'than', vai: 'dau' },
        { id: 'chanTN', ten: 'Chân trước gần', a: 'vaiN', b: 'banTN', w: 1, z: 0.5, vai: 'chan', pha: 0 },
        { id: 'chanTX', ten: 'Chân trước xa', a: 'vaiX', b: 'banTX', w: 1, z: -1, vai: 'chan', pha: 0.5 },
        { id: 'chanSN', ten: 'Chân sau gần', a: 'hongN', b: 'banSN', w: 1, z: 0.5, vai: 'chan', pha: 0.5 },
        { id: 'chanSX', ten: 'Chân sau xa', a: 'hongX', b: 'banSX', w: 1, z: -1, vai: 'chan', pha: 0 },
        { id: 'duoi', ten: 'Đuôi', a: 'goc', b: 'duoi', w: 0.9, z: -0.5, cha: 'than', vai: 'duoi' }] },
    cua: { ten: 'Cua, bọ (nhiều chân)', kieu: 'buoc',
      khop: { chan: [0.5, 1], tamS: [0.32, 0.55], tamT: [0.68, 0.55], gocT: [0.74, 0.48], cangT: [1, 0.15], gocS: [0.26, 0.48], cangS: [0, 0.15], chanA0: [0.62, 0.72], chanA1: [0.84, 1], chanB0: [0.38, 0.72], chanB1: [0.16, 1] },
      bo: [
        { id: 'than', ten: 'Thân, mai', a: 'tamS', b: 'tamT', w: 2.4, z: 0, vai: 'than' },
        { id: 'cangT', ten: 'Càng trước', a: 'gocT', b: 'cangT', w: 1.2, z: 1, cha: 'than', vai: 'cang', pha: 0 },
        { id: 'cangS', ten: 'Càng sau', a: 'gocS', b: 'cangS', w: 1.2, z: 1, cha: 'than', vai: 'cang', pha: 0.5 },
        { id: 'chanA', ten: 'Chân bên phải', a: 'chanA0', b: 'chanA1', w: 0.9, z: -1, vai: 'chan', pha: 0 },
        { id: 'chanB', ten: 'Chân bên trái', a: 'chanB0', b: 'chanB1', w: 0.9, z: -1, vai: 'chan', pha: 0.5 }] },
    bay: { ten: 'Cá, chim bay', kieu: 'bay',
      khop: { chan: [0.5, 1], lung: [0.3, 0.55], nguc: [0.72, 0.55], mui: [1, 0.52], vaiN: [0.5, 0.42], canhN: [0.42, 0], vaiX: [0.56, 0.42], canhX: [0.7, 0.04], goc: [0.3, 0.56], duoi: [0, 0.5] },
      bo: [
        { id: 'than', ten: 'Thân', a: 'lung', b: 'nguc', w: 2, z: 0, vai: 'than' },
        { id: 'dau', ten: 'Đầu', a: 'nguc', b: 'mui', w: 1.5, z: 0.5, cha: 'than', vai: 'dau' },
        { id: 'canhN', ten: 'Cánh gần', a: 'vaiN', b: 'canhN', w: 1.3, z: 1, cha: 'than', vai: 'canh', pha: 0 },
        { id: 'canhX', ten: 'Cánh xa', a: 'vaiX', b: 'canhX', w: 1.1, z: -1, cha: 'than', vai: 'canh', pha: 0.08 },
        { id: 'duoi', ten: 'Đuôi', a: 'goc', b: 'duoi', w: 1.1, z: -0.5, cha: 'than', vai: 'duoi' }] },
    mem: { ten: 'Khối mềm (slime, lửa, ma)', kieu: 'nay',
      khop: { chan: [0.5, 1], day: [0.5, 1], giua: [0.5, 0.55], dinh: [0.5, 0], vaiT: [0.72, 0.58], tuaT: [1, 0.85], vaiS: [0.28, 0.58], tuaS: [0, 0.85] },
      bo: [
        { id: 'than', ten: 'Thân dưới', a: 'day', b: 'giua', w: 2.4, z: 0, vai: 'than' },
        { id: 'dinh', ten: 'Phần trên', a: 'giua', b: 'dinh', w: 2.2, z: 0.5, cha: 'than', vai: 'dinh' },
        { id: 'tuaT', ten: 'Tua phải', a: 'vaiT', b: 'tuaT', w: 0.9, z: 1, cha: 'than', vai: 'tua', pha: 0 },
        { id: 'tuaS', ten: 'Tua trái', a: 'vaiS', b: 'tuaS', w: 0.9, z: 1, cha: 'than', vai: 'tua', pha: 0.5 }] },
    ran: { ten: 'Rắn (trườn)', kieu: 'truon',
      khop: { chan: [0.5, 1], g0: [0.42, 0.66], g1: [0.62, 0.62], g2: [0.8, 0.5], mui: [1, 0.36], d1: [0.22, 0.7], d2: [0, 0.66] },
      bo: [
        { id: 'than', ten: 'Thân giữa', a: 'g0', b: 'g1', w: 1.6, z: 0, vai: 'than' },
        { id: 'co', ten: 'Cổ', a: 'g1', b: 'g2', w: 1.4, z: 0.5, cha: 'than', vai: 'dot', so: 1 },
        { id: 'dau', ten: 'Đầu', a: 'g2', b: 'mui', w: 1.7, z: 1, cha: 'co', vai: 'dau' },
        { id: 'duoi1', ten: 'Đuôi gần', a: 'g0', b: 'd1', w: 1.3, z: -0.5, cha: 'than', vai: 'dot', so: -1 },
        { id: 'duoi2', ten: 'Chóp đuôi', a: 'd1', b: 'd2', w: 1, z: -1, cha: 'duoi1', vai: 'dot', so: -2 }] },
    cay: { ten: 'Cây, đứng yên', kieu: 'nay', reCam: true,
      khop: { chan: [0.5, 1], re: [0.5, 1], goc: [0.5, 0.78], ngon: [0.5, 0.42], dinh: [0.5, 0], canhT0: [0.62, 0.5], canhT: [1, 0.32], canhS0: [0.38, 0.5], canhS: [0, 0.32] },
      bo: [
        { id: 'goc', ten: 'Gốc, rễ', a: 're', b: 'goc', w: 1.6, z: 0, vai: 'goc' },
        { id: 'than', ten: 'Thân', a: 'goc', b: 'ngon', w: 1.4, z: 0.2, cha: 'goc', vai: 'than' },
        { id: 'tan', ten: 'Tán, đầu', a: 'ngon', b: 'dinh', w: 2.3, z: 0.5, cha: 'than', vai: 'tan' },
        { id: 'canhT', ten: 'Cành phải', a: 'canhT0', b: 'canhT', w: 1, z: 1, cha: 'than', vai: 'tua', pha: 0 },
        { id: 'canhS', ten: 'Cành trái', a: 'canhS0', b: 'canhS', w: 1, z: 1, cha: 'than', vai: 'tua', pha: 0.5 }] },
  };
  XS.MAU = MAU;
  XS.MAU_THU_TU = ['nguoi', 'bonChan', 'cua', 'bay', 'mem', 'ran', 'cay'];
  // Gợi ý mẫu theo kiểu di chuyển của quái gốc.
  const GOI_Y = {
    cua: 'cua', cuaTuong: 'cua', cuaDa: 'cua', oc: 'cua', boHung: 'cua',
    caCon: 'bay', caChuon: 'bay', caNoc: 'bay', caNocChua: 'bay', ongVo: 'bay', doiThan: 'bay', denLong: 'bay',
    sua: 'mem', namPhong: 'mem', namPhongChua: 'mem', namChua: 'mem', huLua: 'mem', huChua: 'mem',
    heoCon: 'bonChan', heoNanh: 'bonChan', chonBong: 'bonChan', nhimDoc: 'bonChan', nhim: 'bonChan', nhimThan: 'bonChan', meoDen: 'bonChan', hoLua: 'bonChan', hoTinh: 'bonChan', socNo: 'bonChan',
    linhMa: 'nguoi', tuongDa: 'nguoi', tuongMa: 'nguoi', tieuYeu: 'nguoi',
    nguTinh: 'ran', haiQuy: 'cay', hoaBaoTu: 'cay', mocTinh: 'cay',
  };
  XS.goiYMau = (ma, bay) => (/^(em-be|nl-)/.test(ma) ? 'nguoi' : GOI_Y[ma] || (bay ? 'bay' : 'bonChan'));
  XS.MAU_BO = ['#ff5a46', '#ffd23c', '#3fd0a0', '#4aa3ff', '#c86bff', '#ff9a3c', '#9be05a', '#ff6fb0'];

  // ---------- đặt khớp lên hình, tự đoán bộ phận ----------
  XS.khungHinh = function (R) { const m = new Uint8Array(R.w * R.h); for (let i = 0; i < m.length; i++) m[i] = R.px[i] ? 1 : 0; return XS.khung(m, R.w, R.h); };
  XS.datKhop = function (R, mau) {
    const bb = XS.khungHinh(R), M = MAU[mau], k = {};
    for (const n in M.khop) k[n] = [bb.x0 + M.khop[n][0] * bb.w, bb.y0 + M.khop[n][1] * bb.h];
    return k;
  };
  function kcDoan(px, py, a, b) {
    const vx = b[0] - a[0], vy = b[1] - a[1], L = vx * vx + vy * vy, t = L ? clamp(((px - a[0]) * vx + (py - a[1]) * vy) / L, 0, 1) : 0;
    const dx = px - a[0] - vx * t, dy = py - a[1] - vy * t; return Math.sqrt(dx * dx + dy * dy);
  }
  // Mỗi điểm ảnh thuộc bộ phận có xương gần nhất (chia theo độ to), rồi làm mượt một lượt.
  XS.tuDoan = function (R, mau, khop) {
    const M = MAU[mau], w = R.w, h = R.h, bo = new Uint8Array(w * h).fill(255);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x; if (!R.px[i]) continue;
      let best = 0, bv = 1e9;
      M.bo.forEach((b, k) => { const d = kcDoan(x + 0.5, y + 0.5, khop[b.a], khop[b.b]) / b.w - b.z * 0.01; if (d < bv) { bv = d; best = k; } });
      bo[i] = best;
    }
    const out = bo.slice();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x; if (bo[i] === 255) continue;
      const dem = {}; let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; const v = bo[yy * w + xx]; if (v === 255) continue; dem[v] = (dem[v] || 0) + 1; n++; }
      let bk = bo[i], bc = dem[bk] || 0; for (const k in dem) if (dem[k] > bc) { bc = dem[k]; bk = +k; }
      if (bc >= 5) out[i] = bk;
    }
    return out;
  };
  // Đổi cỡ hình: chuyển bản đồ bộ phận và khớp cũ sang cỡ mới (giữ chỗ đã tô tay).
  XS.doiCoBoPhan = function (cu, R, mau, khopMoi) {
    const out = new Uint8Array(R.w * R.h).fill(255), sx = cu.w / R.w, sy = cu.h / R.h;
    let thieu = false;
    for (let y = 0; y < R.h; y++) for (let x = 0; x < R.w; x++) {
      const i = y * R.w + x; if (!R.px[i]) continue;
      const ox = Math.min(cu.w - 1, Math.floor((x + 0.5) * sx)), oy = Math.min(cu.h - 1, Math.floor((y + 0.5) * sy)), v = cu.bo[oy * cu.w + ox];
      if (v === 255 || v == null) thieu = true; else out[i] = v;
    }
    if (thieu) { const doan = XS.tuDoan(R, mau, khopMoi); for (let i = 0; i < out.length; i++) if (R.px[i] && out[i] === 255) out[i] = doan[i]; }
    return out;
  };

  // ---------- TƯ THẾ ----------
  // Tư thế: g = biến đổi cả hình quanh chân {r, dx, dy, sx, sy, pv: 'chan' | 'giua'}, b[id] = {r, dx, dy, sx, sy, song: [biên độ, pha]}.
  function TT() { this.g = { r: 0, dx: 0, dy: 0, sx: 1, sy: 1, pv: 'chan' }; this.b = {}; }
  TT.prototype.p = function (id) { return this.b[id] || (this.b[id] = { r: 0, dx: 0, dy: 0, sx: 1, sy: 1, song: null }); };
  // Danh sách động tác. giay: thời lượng mặc định. lap: lặp lại.
  XS.DONG_TAC = {
    idle: { ten: 'Đứng thở', giay: 1.2, lap: true },
    move: { ten: 'Đi', giay: 0.6, lap: true },
    tele: { ten: 'Chuẩn bị đánh', giay: 0.7 },
    atk: { ten: 'Đánh', giay: 0.55 },
    hit: { ten: 'Trúng đòn', giay: 0.35 },
    die: { ten: 'Chết', giay: 1.1 },
    ne: { ten: 'Né lăn', giay: 0.27, emBe: true },
    noi: { ten: 'Nói chuyện, vẫy tay', giay: 1.0, lap: true, nguoiLang: true },
  };
  // Người làng chỉ có hai động tác: đứng thở và nói chuyện (vẫy tay) khi em bé tới gần.
  XS.dsDongTac = (doi) => (doi === 'nguoi-lang' ? ['idle', 'noi'] : Object.keys(XS.DONG_TAC).filter((k) => (!XS.DONG_TAC[k].emBe || doi === 'em-be') && !XS.DONG_TAC[k].nguoiLang));

  // ---------- ĐỨNG YÊN TỪNG BỘ PHẬN ----------
  // Lựa chọn mặc định của một mẫu: { dung_yen: [mã bộ phận], nhun: % độ nhún cả người }.
  XS.chuyenMacDinh = (mau) => { const M = MAU[mau] || {}; return { dung_yen: (M.dungYen || []).slice(), nhun: M.nhun == null ? 100 : M.nhun }; };
  // Bộ phận gốc (cả người đi theo nó): "Thân", hoặc bộ phận đầu tiên không có bộ phận cha.
  XS.boGoc = (mau) => { const M = MAU[mau]; const t = M.bo.find((b) => b.id === 'than' && !b.cha); return (t || M.bo.find((b) => !b.cha) || M.bo[0]).id; };
  const YEN = { r: 0, dx: 0, dy: 0, sx: 1, sy: 1, song: null };
  // Áp lựa chọn lên tư thế P. tuy: { dung_yen: [...], nhun: 0..200 }. Không có tuy thì giữ nguyên (tệp cũ).
  // - Độ nhún cả người: co giãn phần nhấp nhô, bóp dẹt của cả hình khi đứng thở và đi (0 = không nhún).
  // - Bộ phận đứng yên: không xoay, không lắc, không nhún riêng; chỉ đi theo bộ phận cha nếu cha cử động.
  // - Bộ phận gốc (thân) đứng yên: cả hình không lắc, không nhún, không lao tới. Riêng Chết và Né lăn vẫn ngã, lăn cả người
  //   (game cần thấy rõ bé đã ngã, đang lăn né), nhưng bộ phận đứng yên vẫn không cử động riêng.
  function apChuyen(P, mau, ten, tuy) {
    if (!tuy) return P;
    const g = P.g, k = tuy.nhun == null ? 1 : clamp(tuy.nhun / 100, 0, 2);
    if (ten === 'idle' || ten === 'move') { g.dy *= k; g.sx = 1 + (g.sx - 1) * k; g.sy = 1 + (g.sy - 1) * k; }
    const yen = new Set(tuy.dung_yen || []);
    if (yen.has(XS.boGoc(mau)) && ten !== 'die' && ten !== 'ne') { g.r = 0; g.dx = 0; g.dy = 0; g.sx = 1; g.sy = 1; }
    for (const id of yen) if (MAU[mau].bo.some((b) => b.id === id)) P.b[id] = Object.assign({}, YEN);
    return P;
  }
  XS.apChuyen = apChuyen;

  // A: biên độ (1 = vừa). Trả về tư thế của động tác ten tại tiến độ u (0..1). tuy: lựa chọn đứng yên, độ nhún (xem apChuyen).
  XS.tuThe = function (mau, ten, u, A, tuy) { return apChuyen(tuThe0(mau, ten, u, A), mau, ten, tuy); };
  function tuThe0(mau, ten, u, A) {
    const M = MAU[mau], P = new TT(), g = P.g, kieu = M.kieu, mem = mau === 'mem';
    const moi = (cb) => { for (const b of M.bo) cb(b, P.p(b.id), b.pha || 0); };
    if (ten === 'idle') {
      const s = sn(u);
      g.sy = 1 + (mem ? 0.07 : 0.035) * A * s; g.sx = 1 - (mem ? 0.05 : 0.02) * A * s;
      if (kieu === 'bay') g.dy = -2.5 * A * sn(u + 0.25);
      moi((b, p, ph) => {
        if (b.vai === 'dau') p.r = 3 * A * sn(u + 0.15);
        else if (b.vai === 'tay') p.r = 5 * A * sn(u + ph);
        else if (b.vai === 'duoi') { p.r = 8 * A * s; p.song = [1.2 * A, u]; }
        else if (b.vai === 'canh') p.r = (kieu === 'bay' ? 20 : 6) * A * sn(u * 2 + ph);
        else if (b.vai === 'cang') p.r = 6 * A * sn(u + ph);
        else if (b.vai === 'dinh') { p.r = 3 * A * sn(u + 0.2); p.song = [1 * A, u]; }
        else if (b.vai === 'tua') { p.r = 10 * A * sn(u + ph); p.song = [1 * A, u + ph]; }
        else if (b.vai === 'tan') { p.r = 3 * A * s; p.song = [0.8 * A, u]; }
        else if (b.vai === 'dot') p.r = 5 * A * sn(u + b.so * 0.2);
      });
    } else if (ten === 'move') {
      if (kieu === 'buoc') {
        g.dy = -1.3 * A * Math.abs(sn(u)); g.r = 2 * A;
        if (mau === 'cua') { g.dx = 0.6 * A * sn(u * 2); g.r = 2 * A * sn(u); }
        moi((b, p, ph) => {
          if (b.vai === 'chan') p.r = (mau === 'cua' ? 20 : 28) * A * sn(u + ph);
          else if (b.vai === 'tay') p.r = -24 * A * sn(u + ph);
          else if (b.vai === 'dau') p.r = 2 * A * sn(u * 2);
          else if (b.vai === 'duoi') { p.r = 12 * A * sn(u); p.song = [1.5 * A, u * 2]; }
          else if (b.vai === 'cang') p.r = 6 * A * sn(u * 2 + ph);
        });
      } else if (kieu === 'bay') {
        g.dy = -2 * A * sn(u * 2 + 0.25) - 1; g.r = 4 * A;
        moi((b, p, ph) => {
          if (b.vai === 'canh') p.r = 35 * A * sn(u * 2 + ph);
          else if (b.vai === 'duoi') { p.r = 15 * A * sn(u + 0.2); p.song = [2 * A, u * 2]; }
          else if (b.vai === 'dau') p.r = -3 * A * sn(u * 2);
        });
      } else if (kieu === 'truon') {
        moi((b, p) => { if (b.vai === 'dot') p.r = 14 * A * sn(u - b.so * 0.22); else if (b.vai === 'dau') p.r = -8 * A * sn(u - 0.5); });
        g.dx = 0.5 * A * sn(u);
      } else { // nhún nhảy
        const hh = Math.sin(u * PI), cz = Math.cos(u * TAU);
        g.dy = -(M.reCam ? 3 : 5) * A * hh; g.sy = 1 - 0.1 * A * cz; g.sx = 1 + 0.08 * A * cz;
        moi((b, p, ph) => {
          if (b.vai === 'tua') p.r = 14 * A * sn(u + ph);
          else if (b.vai === 'dinh') { p.r = -5 * A * sn(u); p.song = [1.5 * A, u]; }
          else if (b.vai === 'tan') { p.r = 5 * A * sn(u); p.song = [1.2 * A, u]; }
          else if (b.vai === 'than' && b.cha) p.r = 3 * A * sn(u);
        });
      }
    } else if (ten === 'tele') {
      const k = kf(u, [[0, 0], [0.4, 1, 'back'], [1, 1]]), run = u > 0.4 ? sn(u * 9) * 0.7 : 0;
      g.r = -7 * A * k; g.dx = (-2 * k + run) * A; g.sx = 1 - (mem ? 0.12 : 0.06) * A * k; g.sy = 1 + (mem ? -0.14 : 0.06) * A * k;
      if (mem) g.sx = 1 + 0.12 * A * k;
      moi((b, p, ph) => {
        if (b.vai === 'tay') p.r = (ph ? -20 : -70) * A * k;
        else if (b.vai === 'cang') p.r = -35 * A * k + run * 6;
        else if (b.vai === 'canh') p.r = -30 * A * k;
        else if (b.vai === 'dau') p.r = -6 * A * k;
        else if (b.vai === 'chan') p.r = (ph ? -6 : 8) * A * k;
        else if (b.vai === 'duoi') p.r = 20 * A * k;
        else if (b.vai === 'dinh' || b.vai === 'tan') p.r = -10 * A * k;
        else if (b.vai === 'tua') p.r = (ph ? -25 : 25) * A * k;
        else if (b.vai === 'dot') p.r = 12 * A * k * (b.so % 2 ? 1 : -1);
      });
    } else if (ten === 'atk') {
      const lao = (a, b2, c, e) => kf(u, [[0, a], [0.18, b2, 'in'], [0.45, c], [1, e || 0, 'io']]);
      g.dx = lao(-2, 7, 6) * A; g.r = lao(-7, 10, 8) * A;
      const sx = lao(0.94, 1.1, 1.04, 1), sy = lao(1.06, 0.92, 0.97, 1);
      g.sx = 1 + (sx - 1) * A; g.sy = 1 + (sy - 1) * A;
      if (mem) { g.sy = 1 + (lao(0.86, 1.18, 1.05, 1) - 1) * A; g.sx = 1 + (lao(1.12, 0.9, 0.98, 1) - 1) * A; }
      moi((b, p, ph) => {
        if (b.vai === 'tay') p.r = (ph ? lao(-20, 10, 8) : lao(-70, 60, 50)) * A;
        else if (b.vai === 'cang') p.r = lao(-35, 30, 22) * A;
        else if (b.vai === 'canh') p.r = lao(-30, 40, 30) * A;
        else if (b.vai === 'dau') p.r = lao(-6, 10, 6) * A;
        else if (b.vai === 'duoi') p.r = lao(20, -15, -10) * A;
        else if (b.vai === 'chan') p.r = (ph ? lao(-6, 12, 8) : lao(8, -15, -10)) * A;
        else if (b.vai === 'dinh' || b.vai === 'tan') p.r = lao(-10, 14, 8) * A;
        else if (b.vai === 'tua') p.r = (ph ? lao(-25, 30, 20) : lao(25, -30, -20)) * A;
        else if (b.vai === 'dot') p.r = lao(12, -18, -10) * A * (b.so % 2 ? 1 : -1);
      });
    } else if (ten === 'hit') {
      const k = kf(u, [[0, 0], [0.2, 1, 'out'], [1, 0]]);
      g.dx = -3 * A * k; g.r = -10 * A * k; g.sx = 1 - 0.08 * A * k; g.sy = 1 + 0.05 * A * k;
      moi((b, p, ph) => {
        if (b.vai === 'tay') p.r = 30 * A * k;
        else if (b.vai === 'chan') p.r = (ph ? 8 : -10) * A * k;
        else if (b.vai === 'dau') p.r = -12 * A * k;
        else if (b.vai === 'canh' || b.vai === 'cang') p.r = 25 * A * k;
        else if (b.vai === 'duoi') p.r = -20 * A * k;
        else if (b.vai === 'dinh' || b.vai === 'tan') p.r = -12 * A * k;
        else if (b.vai === 'tua') p.r = (ph ? -20 : 20) * A * k;
        else if (b.vai === 'dot') p.r = -10 * A * k;
      });
    } else if (ten === 'die') {
      const k = kf(u, [[0, 0], [0.4, 1, 'nay'], [1, 1]]), A1 = Math.max(0.4, Math.min(1.4, A));
      if (M.nga) { g.r = -82 * k * Math.min(1, A1); g.dx = -2 * k; }
      else { g.sy = 1 - 0.42 * k * A1; g.sx = 1 + 0.14 * k * A1; g.r = -10 * k * A1; }
      moi((b, p, ph) => {
        if (b.vai === 'tay') p.r = (ph ? 30 : 45) * A1 * k;
        else if (b.vai === 'chan') p.r = (ph ? 20 : -20) * A1 * k;
        else if (b.vai === 'dau') p.r = -25 * A1 * k;
        else if (b.vai === 'canh' || b.vai === 'cang') p.r = 50 * A1 * k;
        else if (b.vai === 'duoi' || b.vai === 'tua') p.r = 30 * A1 * k * (ph ? -1 : 1);
        else if (b.vai === 'dot') p.r = 15 * A1 * k * (b.so % 2 ? 1 : -1);
        else if (b.vai === 'dinh' || b.vai === 'tan') p.r = -20 * A1 * k;
      });
    } else if (ten === 'noi') { // người làng nói chuyện: tay trước giơ lên vẫy, đầu gật, người nhún nhẹ
      const s2 = sn(u * 2);
      g.sy = 1 + 0.03 * A * sn(u * 2 + 0.25); g.r = 2 * A * sn(u);
      if (kieu === 'bay') g.dy = -2 * A * sn(u + 0.25);
      moi((b, p, ph) => {
        if (b.vai === 'tay') p.r = ph ? 8 * A * sn(u) : -115 * Math.min(1.3, A) + 28 * A * s2;
        else if (b.vai === 'dau') p.r = 6 * A * sn(u * 2 + 0.1);
        else if (b.vai === 'chan') p.r = 0;
        else if (b.vai === 'duoi') { p.r = 12 * A * s2; p.song = [1.2 * A, u * 2]; }
        else if (b.vai === 'canh' || b.vai === 'cang' || b.vai === 'tua') p.r = (ph ? 6 : -30) * A + (ph ? 0 : 18 * A * s2);
        else if (b.vai === 'dinh' || b.vai === 'tan') { p.r = 5 * A * s2; p.song = [1 * A, u]; }
        else if (b.vai === 'dot') p.r = 8 * A * sn(u * 2 + b.so * 0.2);
      });
    } else if (ten === 'ne') { // em bé lăn né
      g.pv = 'giua'; g.r = 360 * kf(u, [[0, 0], [1, 1, 'io']]); g.dy = -3 * Math.sin(u * PI); g.sx = g.sy = 1 - 0.1 * Math.sin(u * PI);
      moi((b, p, ph) => { if (b.vai === 'tay') p.r = (ph ? -40 : 40) * Math.sin(u * PI); else if (b.vai === 'chan') p.r = (ph ? 30 : -30) * Math.sin(u * PI); });
    }
    return P;
  }

  // ---------- DỰNG KHUNG HÌNH ----------
  // Ma trận 2x3 [a, b, c, d, e, f]: x' = a x + c y + e, y' = b x + d y + f.
  const nhan = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
  const nghich = (m) => { const det = m[0] * m[3] - m[1] * m[2] || 1e-9; return [m[3] / det, -m[1] / det, -m[2] / det, m[0] / det, (m[2] * m[5] - m[3] * m[4]) / det, (m[1] * m[4] - m[0] * m[5]) / det]; };
  // dịch(dx,dy) · dời về trục(px,py) · xoay r · co giãn (sx,sy) · dời trục về gốc
  function bienDoi(t, px, py) {
    const a = (t.r || 0) * D2R, c = Math.cos(a), s = Math.sin(a), sx = t.sx == null ? 1 : t.sx, sy = t.sy == null ? 1 : t.sy;
    const m = [c * sx, s * sx, -s * sy, c * sy, 0, 0];
    m[4] = px + (t.dx || 0) - (m[0] * px + m[2] * py); m[5] = py + (t.dy || 0) - (m[1] * px + m[3] * py);
    return m;
  }
  const apDung = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

  // ---------- CHUẨN BỊ HÌNH ĐỂ CỬ ĐỘNG KHÔNG VỠ ----------
  // Làm một lần cho mỗi hình + bản đồ bộ phận (có bộ nhớ đệm), dùng cho mọi khung hình:
  //  - làm sạch bản đồ: điểm chưa gán đi theo bộ phận gốc; mảnh nhỏ của một bộ phận nằm lạc giữa bộ phận khác
  //    (không dính vào phần chính của nó) trả về bộ phận bao quanh, để khi cử động không có mảnh bay rời khỏi thân;
  //  - trục xoay thật: khớp đặt lệch khỏi chỗ bộ phận dính vào thân thì xoay quanh điểm dính gần khớp nhất
  //    (tay không bị rời khỏi vai);
  //  - lớp vá: bộ phận cha giữ một mép dư lấn sang bộ phận con, và phần bộ phận con nằm lọt trong cha (bị bao kín)
  //    được tô bằng màu thân xung quanh. Lớp vá vẽ dưới cùng nên lúc đứng yên không thấy; khi tay chân xoay ra
  //    thì nó lấp chỗ hở thay vì lộ nền;
  //  - hệ số góc: bộ phận dính sát thân (phần lớn mép chạm bộ phận khác) xoay nhỏ hơn.
  const tamDem = typeof WeakMap === 'function' ? new WeakMap() : null;
  const sangC = (c) => (c & 255) * 0.3 + ((c >>> 8) & 255) * 0.59 + ((c >>> 16) & 255) * 0.11;
  function chuanBi(R, Kh, M) {
    const w = R.w, h = R.h, n = w * h, bo0 = Kh.bo, nb = M.bo.length;
    let sum = 7; for (let i = 0; i < n; i++) sum = (sum * 31 + (R.px[i] ? bo0[i] + 1 : 0)) >>> 0;
    const khoa = Kh.mau + ':' + sum + ':' + JSON.stringify(Kh.khop);
    const cu = tamDem && tamDem.get(R.px); if (cu && cu.khoa === khoa) return cu;
    const idx = {}; M.bo.forEach((b, k) => { idx[b.id] = k; });
    const goc = idx[XS.boGoc(Kh.mau)] != null ? idx[XS.boGoc(Kh.mau)] : 0;
    // 1. làm sạch
    const bo = new Uint8Array(n).fill(255);
    for (let i = 0; i < n; i++) if (R.px[i]) bo[i] = bo0[i] < nb ? bo0[i] : goc;
    const nhan = new Int32Array(n).fill(-1), dams = [];
    for (let s = 0; s < n; s++) {
      if (bo[s] === 255 || nhan[s] >= 0) continue;
      const v = bo[s], ds = [s]; nhan[s] = dams.length;
      for (let q = 0; q < ds.length; q++) { const i = ds[q], x = i % w, y = (i / w) | 0;
        for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) if (j >= 0 && bo[j] === v && nhan[j] < 0) { nhan[j] = dams.length; ds.push(j); } }
      dams.push({ v, ds });
    }
    const lonNhat = new Array(nb).fill(0); for (const d of dams) lonNhat[d.v] = Math.max(lonNhat[d.v], d.ds.length);
    for (const d of dams) {
      if (d.ds.length >= lonNhat[d.v] * 0.5 && d.ds.length > 2) continue; // phần chính (hoặc mảnh đủ lớn) giữ nguyên
      const dem = {}; let cham = 0;
      for (const i of d.ds) { const x = i % w, y = (i / w) | 0; for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) { if (j < 0) continue; if (bo[j] === 255) { cham++; continue; } if (bo[j] !== d.v) dem[bo[j]] = (dem[bo[j]] || 0) + 1; } }
      let bk = -1, bc = 0; for (const k in dem) if (dem[k] > bc) { bc = dem[k]; bk = +k; }
      if (bk >= 0 && bc >= cham * 0.5) for (const i of d.ds) bo[i] = bk; // mảnh lạc phần lớn nằm trong bộ phận khác
    }
    // 2. cây bộ phận: cha thật (không có cha thì bám bộ phận gốc), tập con cháu
    const cha = M.bo.map((b, k) => (k === goc ? -1 : b.cha && idx[b.cha] != null ? idx[b.cha] : goc));
    const trongCay = M.bo.map((b, k) => { const s = new Uint8Array(nb); for (let j = 0; j < nb; j++) { let t = j; while (t >= 0) { if (t === k) { s[j] = 1; break; } t = cha[t]; } } return s; });
    const toiNguong = (() => { const a = []; for (let i = 0; i < n; i++) if (bo[i] !== 255) a.push(sangC(R.px[i])); a.sort((p, q) => p - q); const tv = a[a.length >> 1] || 128; return Math.min(70, tv * 0.45); })();
    const d = Math.max(2, Math.round(h / 14));
    const vas = [], heSo = new Array(nb).fill(1), truc = M.bo.map((b) => Kh.khop[b.a].slice()), kb = M.bo.map(() => [w, h, -1, -1]);
    for (let i = 0; i < n; i++) { const v = bo[i]; if (v === 255) continue; const q = kb[v], x = i % w, y = (i / w) | 0; if (x < q[0]) q[0] = x; if (y < q[1]) q[1] = y; if (x > q[2]) q[2] = x; if (y > q[3]) q[3] = y; }
    for (let k = 0; k < nb; k++) {
      if (k === goc || kb[k][2] < 0) continue;
      const cay = trongCay[k], ngoai = (i) => bo[i] !== 255 && !cay[bo[i]];
      // khoảng cách (theo bước 4 hướng) từ điểm của bộ phận k tới phần không thuộc nhánh k
      const kc = new Int16Array(n).fill(-1), hang = [];
      let mepCham = 0, mepTong = 0; const cham = [];
      for (let i = 0; i < n; i++) {
        if (bo[i] !== k) continue; const x = i % w, y = (i / w) | 0;
        let la = false;
        for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) {
          if (j >= 0 && bo[j] === k) continue; if (j >= 0 && cay[bo[j]] ) continue;
          mepTong++; if (j >= 0 && ngoai(j)) { mepCham++; la = true; }
        }
        if (la) { kc[i] = 1; hang.push(i); cham.push(i); }
      }
      for (let q = 0; q < hang.length; q++) { const i = hang[q], x = i % w, y = (i / w) | 0; if (kc[i] >= d) continue;
        for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) if (j >= 0 && bo[j] === k && kc[j] < 0) { kc[j] = kc[i] + 1; hang.push(j); } }
      // phần bị bao kín: loang từ mép khung qua chỗ trống và qua chính bộ phận k; điểm của k không tới được là nằm lọt trong
      const toi = new Uint8Array(n), st = [];
      const vao = (i) => { if (!toi[i] && (bo[i] === 255 || bo[i] === k)) { toi[i] = 1; st.push(i); } };
      for (let x = 0; x < w; x++) { vao(x); vao((h - 1) * w + x); } for (let y = 0; y < h; y++) { vao(y * w); vao(y * w + w - 1); }
      while (st.length) { const i = st.pop(), x = i % w, y = (i / w) | 0; if (x > 0) vao(i - 1); if (x < w - 1) vao(i + 1); if (y > 0) vao(i - w); if (y < h - 1) vao(i + w); }
      // màu vá: loang từ điểm không thuộc nhánh k (bỏ nét tối) sang
      const mau = new Uint32Array(n), q2 = [];
      for (let i = 0; i < n; i++) if (ngoai(i) && sangC(R.px[i]) >= toiNguong) { mau[i] = R.px[i]; q2.push(i); }
      for (let q = 0; q < q2.length; q++) { const i = q2[q], x = i % w, y = (i / w) | 0;
        for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) if (j >= 0 && bo[j] !== 255 && !mau[j]) { mau[j] = mau[i]; q2.push(j); } }
      const ds = [];
      for (let i = 0; i < n; i++) if (bo[i] === k && ((kc[i] > 0 && kc[i] <= d) || !toi[i]) && mau[i]) ds.push(i, mau[i]);
      if (ds.length) vas.push({ k, cha: cha[k], ds });
      // hệ số góc theo độ dính: dính ít (<35% mép) xoay đủ, dính nhiều xoay nhỏ lại (tối thiểu 35%)
      const a = mepTong ? mepCham / mepTong : 0;
      heSo[k] = clamp(1.3 - 1.4 * a, 0.35, 1);
      // trục xoay: khớp lệch xa chỗ dính thì dời về điểm dính gần nhất
      if (cham.length) {
        const A0 = truc[k], L = Math.hypot(Kh.khop[M.bo[k].b][0] - A0[0], Kh.khop[M.bo[k].b][1] - A0[1]);
        let bi = -1, bd = 1e9; for (const i of cham) { const dd = Math.hypot((i % w) + 0.5 - A0[0], ((i / w) | 0) + 0.5 - A0[1]); if (dd < bd) { bd = dd; bi = i; } }
        if (bd > Math.max(2, L * 0.3)) truc[k] = [(bi % w) + 0.5, ((bi / w) | 0) + 0.5];
      }
    }
    // lỗ có sẵn trong hình gốc (chỗ trống bị hình bao kín): giữ nguyên, không lấp
    const loGoc = new Uint8Array(n), st2 = [];
    const vao2 = (i) => { if (!loGoc[i] && bo[i] === 255) { loGoc[i] = 1; st2.push(i); } };
    for (let x = 0; x < w; x++) { vao2(x); vao2((h - 1) * w + x); } for (let y = 0; y < h; y++) { vao2(y * w); vao2(y * w + w - 1); }
    while (st2.length) { const i = st2.pop(), x = i % w, y = (i / w) | 0; if (x > 0) vao2(i - 1); if (x < w - 1) vao2(i + 1); if (y > 0) vao2(i - w); if (y < h - 1) vao2(i + w); }
    for (let i = 0; i < n; i++) loGoc[i] = bo[i] === 255 && !loGoc[i] ? 1 : 0;
    const kq = { khoa, bo, vas, heSo, truc, kb, goc, cha, loGoc, toiNguong };
    if (tamDem) tamDem.set(R.px, kq);
    return kq;
  }
  function lapLo(out, W, H, inv, CB, w, h) {
    const N = W * H, ngoai = new Uint8Array(N), st = [];
    const vao = (i) => { if (!out[i] && !ngoai[i]) { ngoai[i] = 1; st.push(i); } };
    for (let x = 0; x < W; x++) { vao(x); vao((H - 1) * W + x); } for (let y = 0; y < H; y++) { vao(y * W); vao(y * W + W - 1); }
    while (st.length) { const i = st.pop(), x = i % W, y = (i / W) | 0; if (x > 0) vao(i - 1); if (x < W - 1) vao(i + 1); if (y > 0) vao(i - W); if (y < H - 1) vao(i + W); }
    let lo = [];
    for (let i = 0; i < N; i++) {
      if (out[i] || ngoai[i]) continue;
      const x = i % W, y = (i / W) | 0, sx = Math.floor(inv[0] * (x + 0.5) + inv[2] * (y + 0.5) + inv[4]), sy = Math.floor(inv[1] * (x + 0.5) + inv[3] * (y + 0.5) + inv[5]);
      if (sx >= 0 && sy >= 0 && sx < w && sy < h && CB.loGoc[sy * w + sx]) continue; // lỗ vốn có trong hình
      lo.push(i);
    }
    for (let vong = 0; lo.length && vong < 64; vong++) {
      const con = [], dat = [];
      for (const i of lo) {
        const x = i % W, y = (i / W) | 0, dem = new Map(); let tot = 0, tc = 0, bat = 0;
        for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1]) { if (j < 0 || !out[j]) continue; bat = bat || out[j]; if (sangC(out[j]) < CB.toiNguong) continue; const v = (dem.get(out[j]) || 0) + 1; dem.set(out[j], v); if (v > tc) { tc = v; tot = out[j]; } }
        if (bat) dat.push(i, tot || bat); else con.push(i);
      }
      for (let j = 0; j < dat.length; j += 2) out[dat[j]] = dat[j + 1];
      lo = con;
    }
  }
  XS.chuanBiCuDong = (R, Kh) => chuanBi(R, Kh, MAU[Kh.mau]);

  // R: {w, h, px} hình pixel; Kh: {mau, khop, bo (bản đồ bộ phận)}. Trả về {w, h, ox, oy, px} với (ox, oy) là chân, D: lề.
  // Cách vẽ (để cử động không bị vỡ hình): lấy mẫu điểm gần nhất (không pha màu, không viền mờ); vẽ lớp vá dưới cùng,
  // rồi phần quanh khớp theo bộ phận cha, rồi từng bộ phận từ lớp dưới lên (tay sau dưới thân, tay trước trên thân);
  // cuối cùng thêm viền tối liền quanh mép ngoài (cả chỗ khớp vừa lộ ra).
  XS.dungKhung = function (R, Kh, P, o) {
    o = o || {};
    const M = MAU[Kh.mau], w = R.w, h = R.h, D = o.le != null ? o.le : Math.ceil(Math.max(w, h) * 1.05) + 4, W = w + 2 * D, H = h + 2 * D;
    const out = new Uint32Array(W * H), khop = Kh.khop, CB = chuanBi(R, Kh, M), bomap = CB.bo;
    const chan = khop.chan, bb = o.bb || XS.khungHinh(R);
    const pv = P.g.pv === 'giua' ? [bb.x0 + bb.w / 2, bb.y0 + bb.h / 2] : chan;
    const Gm = nhan([1, 0, 0, 1, D, D], bienDoi(P.g, pv[0], pv[1]));
    // ma trận thế giới của từng bộ phận (đi qua các bộ phận cha)
    const idx = {}; M.bo.forEach((b, k) => { idx[b.id] = k; });
    const the = {};
    const tinh = (b) => {
      if (the[b.id]) return the[b.id];
      const k = idx[b.id], t0 = P.b[b.id] || {}, t = t0.r ? Object.assign({}, t0, { r: t0.r * CB.heSo[k] }) : t0, A = CB.truc[k], L = bienDoi(t, A[0], A[1]);
      const cha = b.cha ? tinh(M.bo[idx[b.cha]]) : Gm;
      return (the[b.id] = nhan(cha, L));
    };
    const mtCua = (k) => (k < 0 ? Gm : tinh(M.bo[k]));
    const kbo = CB.kb;
    const thuTu = M.bo.map((b, k) => k).sort((a, b) => M.bo[a].z - M.bo[b].z); // vẽ từ lớp dưới lên
    const vung = (q, pad, M2) => {
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const c of [[q[0] - pad, q[1] - pad], [q[2] + 1 + pad, q[1] - pad], [q[0] - pad, q[3] + 1 + pad], [q[2] + 1 + pad, q[3] + 1 + pad]]) { const p = apDung(M2, c[0], c[1]); x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
      return [Math.max(0, Math.floor(x0)), Math.max(0, Math.floor(y0)), Math.min(W - 1, Math.ceil(x1)), Math.min(H - 1, Math.ceil(y1))];
    };
    const ve = (k, M2, chiKhop) => {
      const b = M.bo[k], q = kbo[k]; if (q[2] < 0) return;
      const inv = nghich(M2), song = (P.b[b.id] || {}).song, A0 = CB.truc[k], A1 = khop[b.b];
      const vx = A1[0] - A0[0], vy = A1[1] - A0[1], L = Math.hypot(vx, vy) || 1, ux = vx / L, uy = vy / L;
      const pad = song ? Math.abs(song[0]) + 2 : 1, [x0, y0, x1, y1] = vung(q, pad, M2);
      const rk = chiKhop ? Math.max(1.6, Math.min(4, L * 0.25)) : 0;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        let sx = inv[0] * (x + 0.5) + inv[2] * (y + 0.5) + inv[4], sy = inv[1] * (x + 0.5) + inv[3] * (y + 0.5) + inv[5];
        if (song && !chiKhop) { const t = clamp(((sx - A0[0]) * ux + (sy - A0[1]) * uy) / L, 0, 1.3), d = song[0] * t * Math.sin(song[1] * TAU - t * 3); sx -= -uy * d; sy -= ux * d; }
        const ix = Math.floor(sx), iy = Math.floor(sy);
        if (ix < 0 || iy < 0 || ix >= w || iy >= h) continue;
        const i = iy * w + ix; if (bomap[i] !== k) continue;
        if (chiKhop && Math.hypot(sx - A0[0], sy - A0[1]) > rk) continue;
        out[y * W + x] = R.px[i];
      }
    };
    // 1. lớp vá (dưới cùng): đi theo bộ phận cha
    for (const v of CB.vas) {
      const M2 = mtCua(v.cha), inv = nghich(M2), mp = new Map();
      for (let j = 0; j < v.ds.length; j += 2) mp.set(v.ds[j], v.ds[j + 1]);
      const [x0, y0, x1, y1] = vung(kbo[v.k], 1, M2);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const ix = Math.floor(inv[0] * (x + 0.5) + inv[2] * (y + 0.5) + inv[4]), iy = Math.floor(inv[1] * (x + 0.5) + inv[3] * (y + 0.5) + inv[5]);
        if (ix < 0 || iy < 0 || ix >= w || iy >= h) continue;
        const c = mp.get(iy * w + ix); if (c) out[y * W + x] = c;
      }
    }
    // 2. lấp chỗ khớp: phần gần trục xoay vẽ theo bộ phận cha (để không hở khi tay chân xoay)
    for (const k of thuTu) if (CB.cha[k] >= 0) ve(k, mtCua(CB.cha[k]), true);
    // 3. từng bộ phận theo lớp
    for (const k of thuTu) ve(k, tinh(M.bo[k]), false);
    // 4. còn lỗ bị bao kín (không có trong hình gốc): lấp bằng màu bên cạnh (ưu tiên màu không phải nét tối)
    lapLo(out, W, H, nghich(mtCua(CB.goc)), CB, w, h);
    const px = o.vien ? XS.themVien(out, W, H, o.vien) : out;
    if (o.vien) lapLo(px, W, H, nghich(mtCua(CB.goc)), CB, w, h); // viền hai bên khe hẹp chạm nhau: lấp nốt túi nhỏ
    const c = apDung(Gm, chan[0], chan[1]);
    M.bo.forEach((b) => tinh(b));
    return { w: W, h: H, px, ox: Math.round(chan[0] + D), oy: Math.round(chan[1] + D), D, chanTT: c, mt: the };
  };

  // ---------- TẤM SPRITE ----------
  // Dựng mọi khung của mọi động tác, cắt chung một khung vừa đủ, xếp mỗi động tác một hàng.
  // cfg: { mau, khop, bo, vien (màu viền hoặc 0), doi, dong_tac: {ten: {bien, toc, giay}} }, goc: thời lượng gốc từ game.
  XS.soKhung = (ten, giay) => clamp(Math.round(giay * 12), ten === 'ne' ? 6 : XS.DONG_TAC[ten].lap ? 4 : 3, 16);
  XS.giayCua = function (ten, cfg, goc) {
    const d = (cfg.dong_tac && cfg.dong_tac[ten]) || {}, base = (goc && goc[ten]) || XS.DONG_TAC[ten].giay;
    if (XS.DONG_TAC[ten].lap || !(goc && goc[ten])) return +(base / ((d.toc || 100) / 100)).toFixed(3);
    return base; // động tác một lần của quái có sẵn: game quyết định độ dài
  };
  XS.dungTam = function (R, cfg, goc) {
    const ds = XS.dsDongTac(cfg.doi), bb = XS.khungHinh(R), hang = [];
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, ox = 0, oy = 0, W = 0;
    for (const ten of ds) {
      const giay = XS.giayCua(ten, cfg, goc), n = XS.soKhung(ten, giay), A = ((cfg.dong_tac[ten] || {}).bien == null ? 100 : cfg.dong_tac[ten].bien) / 100, ks = [];
      for (let i = 0; i < n; i++) {
        const u = XS.DONG_TAC[ten].lap ? i / n : (n > 1 ? i / (n - 1) : 0);
        const f = XS.dungKhung(R, cfg, XS.tuThe(cfg.mau, ten, u, A, cfg.dung_yen ? { dung_yen: cfg.dung_yen, nhun: cfg.nhun } : null), { vien: cfg.vien, bb });
        W = f.w; ox = f.ox; oy = f.oy;
        for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) if (f.px[y * f.w + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        ks.push(f);
      }
      hang.push({ ten, giay, n, ks });
    }
    if (x1 < 0) return null;
    x0 = Math.min(x0, ox - 1); x1 = Math.max(x1, ox + 1); y1 = Math.max(y1, oy);
    const fw = x1 - x0 + 1, fh = y1 - y0 + 1, nmax = Math.max.apply(null, hang.map((r) => r.n));
    const tam = new Uint32Array(fw * nmax * fh * hang.length), TW = fw * nmax;
    const dong_tac = {};
    hang.forEach((r, j) => {
      r.ks.forEach((f, i) => { for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) { const c = f.px[(y + y0) * W + x + x0]; if (c) tam[(j * fh + y) * TW + i * fw + x] = c; } });
      const d = cfg.dong_tac[r.ten] || {};
      dong_tac[r.ten] = { hang: j, so: r.n, giay: r.giay, lap: !!XS.DONG_TAC[r.ten].lap, bien: d.bien == null ? 100 : d.bien, toc: d.toc || 100, mo: r.ten === 'die' ? 0.6 : null };
    });
    return { w: TW, h: fh * hang.length, px: tam, fw, fh, ax: ox - x0, ay: oy - y0, dong_tac };
  };
})();
