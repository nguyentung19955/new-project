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

  // ---------- CHỐNG VỠ HÌNH ----------
  // Khi tay chân xoay ra, chỗ nó vừa che trên thân bị trống (lộ nền), mép cắt giữa hai bộ phận tách ra thành khe.
  // Chuẩn bị một lần cho mỗi bản đồ bộ phận (lưu lại theo bản đồ):
  //  - lap[k]: chỗ thân (bộ phận "chủ" k) bị bộ phận con che, tô bằng màu thân xung quanh (lấp chỗ khoét), vẽ dưới cùng.
  //  - mep[k]: một mép thân dày 1 đến 2 điểm ảnh quanh đường cắt, đi theo bộ phận con k (vá khớp), vẽ dưới các bộ phận.
  //  - gioiHan[k]: góc xoay lớn nhất (độ) để mép cắt xa khớp nhất không lệch quá ~2,5 điểm ảnh (bộ phận dính sát thân xoay ít).
  const SANG = (c) => (c & 255) * 0.3 + ((c >>> 8) & 255) * 0.59 + ((c >>> 16) & 255) * 0.11;
  const nhoChuan = new WeakMap();
  // Scale2x trên bản đồ chỉ số: mỗi ô mới trỏ về một điểm ảnh gốc (không tạo màu mới). Phóng hai lần (4x) rồi lấy mẫu
  // điểm gần nhất khi xoay thì mép chéo, nét viền đi liền như vẽ tay (kiểu RotSprite), không răng cưa lởm chởm.
  function phong2(src, W, H, khoa) {
    const out = new Int32Array(W * H * 4), W2 = W * 2;
    const at = (x, y) => src[clamp(y, 0, H - 1) * W + clamp(x, 0, W - 1)];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const E = src[y * W + x], B = at(x, y - 1), Dd = at(x - 1, y), F = at(x + 1, y), Hh = at(x, y + 1);
      const kB = khoa(B), kD = khoa(Dd), kF = khoa(F), kH = khoa(Hh);
      let e0 = E, e1 = E, e2 = E, e3 = E;
      if (kB !== kH && kD !== kF) { if (kD === kB) e0 = Dd; if (kB === kF) e1 = F; if (kD === kH) e2 = Dd; if (kH === kF) e3 = F; }
      const o = y * 2 * W2 + x * 2; out[o] = e0; out[o + 1] = e1; out[o + W2] = e2; out[o + W2 + 1] = e3;
    }
    return out;
  }
  XS.chuanBiVa = function (R, Kh) {
    const M = MAU[Kh.mau], w = R.w, h = R.h, n = w * h, bomap = Kh.bo, khop = Kh.khop;
    const cu = nhoChuan.get(bomap);
    if (cu && cu.px === R.px && cu.khopS === JSON.stringify(khop)) return cu;
    const idx = {}; M.bo.forEach((b, k) => { idx[b.id] = k; });
    const goc = idx[XS.boGoc(Kh.mau)];
    // chủ của k: bộ phận cha, không có cha thì bộ phận gốc (chân gắn vào thân)
    const chu = M.bo.map((b, k) => (b.cha != null ? idx[b.cha] : k === goc ? -1 : goc));
    const cuaAi = (i) => (R.px[i] ? (bomap[i] === 255 ? goc : bomap[i]) : -1);
    const laConCua = (k, o) => { let c = k, d = 0; while (c >= 0 && d++ < 9) { if (chu[c] === o) return true; c = chu[c]; } return false; };
    const L = Math.max(3, Math.ceil(Math.max(w, h) * 0.22)), le = Math.max(w, h) >= 40 ? 2 : 1;
    const lap = M.bo.map(() => []), mep = M.bo.map(() => []), gioiHan = M.bo.map(() => 180);
    // 1) lấp: điểm của con nằm kẹp giữa thân (cả hai phía ngang hoặc dọc đều có thân trong L điểm), hoặc sát thân
    for (let o = 0; o < M.bo.length; o++) {
      const cua = new Uint8Array(n); let co = false;
      for (let i = 0; i < n; i++) if (cuaAi(i) === o) { cua[i] = 1; co = true; }
      if (!co) continue;
      const thay = (x, y, dx, dy) => { for (let s = 1; s <= L; s++) { const xx = x + dx * s, yy = y + dy * s; if (xx < 0 || yy < 0 || xx >= w || yy >= h) return false; const j = yy * w + xx; if (cua[j]) return true; if (!R.px[j]) return false; } return false; };
      const can = new Uint8Array(n); let soCan = 0;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x, k = cuaAi(i); if (k < 0 || k === o || !laConCua(k, o)) continue;
        const ke = (x > 0 && cua[i - 1]) || (x < w - 1 && cua[i + 1]) || (y > 0 && cua[i - w]) || (y < h - 1 && cua[i + w]);
        if (ke || (thay(x, y, -1, 0) && thay(x, y, 1, 0)) || (thay(x, y, 0, -1) && thay(x, y, 0, 1))) { can[i] = 1; soCan++; }
      }
      if (!soCan) continue;
      // màu: loang từ điểm thân không phải nét viền (qua cả nét viền) vào các điểm cần lấp
      const mau = new Uint32Array(n), q = new Int32Array(n); let qa = 0, qb = 0;
      for (let i = 0; i < n; i++) if (cua[i] && SANG(R.px[i]) >= 72) { mau[i] = R.px[i]; q[qb++] = i; }
      if (!qb) for (let i = 0; i < n; i++) if (cua[i]) { mau[i] = R.px[i]; q[qb++] = i; }
      while (qa < qb) {
        const i = q[qa++], x = i % w;
        for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) { if (j < 0 || j >= n || mau[j]) continue; if (!(can[j] || cua[j])) continue; mau[j] = mau[i]; q[qb++] = j; }
      }
      for (let i = 0; i < n; i++) if (can[i] && mau[i]) lap[o].push(i, mau[i]);
    }
    // 2) mép dư và giới hạn góc cho từng bộ phận con
    for (let k = 0; k < M.bo.length; k++) {
      const b = M.bo[k], A0 = khop[b.a]; let rs = 0, co = false;
      const da = new Uint8Array(n);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x; if (cuaAi(i) !== k) continue; co = true;
        for (let dy = -le; dy <= le; dy++) for (let dx = -le; dx <= le; dx++) {
          const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          const j = yy * w + xx, o = cuaAi(j); if (o < 0 || o === k || laConCua(o, k)) continue;
          if (Math.abs(dx) + Math.abs(dy) <= 1) rs = Math.max(rs, Math.hypot(x + 0.5 - A0[0], y + 0.5 - A0[1]));
          if (!da[j] && chu[k] >= 0 && (o === chu[k] || laConCua(k, o))) { da[j] = 1; mep[k].push(j, R.px[j]); }
        }
      }
      if (co && rs > 0 && k !== goc) gioiHan[k] = clamp((2.5 / rs) / D2R, 8, 180);
    }
    // lỗ có sẵn trong hình (cố ý, ví dụ khe giữa hai cánh): ghi lại thuộc bộ phận nào để khi dựng khung không vá mất
    const loGoc = new Uint8Array(n).fill(255);
    for (const c of XS.demLo(R.px, w, h).cum) for (const i of c) {
      const dem = {}, x = i % w; for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) { if (j < 0 || j >= n || !R.px[j]) continue; const k = cuaAi(j); dem[k] = (dem[k] || 0) + 1; }
      let bk = goc, bv = 0; for (const k in dem) if (dem[k] > bv) { bv = dem[k]; bk = +k; } loGoc[i] = bk;
    }
    // đổi danh sách [chỉ số, màu, ...] thành ảnh đặc cùng cỡ hình (tra nhanh khi dựng khung) kèm khung bao
    const dac = (ds) => { if (!ds.length) return null; const px = new Uint32Array(n); let x0 = w, y0 = h, x1 = -1, y1 = -1;
      for (let j = 0; j < ds.length; j += 2) { const i = ds[j], x = i % w, y = (i / w) | 0; px[i] = ds[j + 1]; if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
      return { px, bb: [x0, y0, x1, y1] }; };
    const id0 = new Int32Array(n); for (let i = 0; i < n; i++) id0[i] = i;
    const khoa = (i) => (R.px[i] ? R.px[i] + (bomap[i] + 1) * 4294967296 : 0);
    const up = phong2(phong2(id0, w, h, khoa), w * 2, h * 2, khoa);
    const kq = { px: R.px, khopS: JSON.stringify(khop), lap: lap.map(dac), mep: mep.map(dac), gioiHan, chu, goc, loGoc, up };
    nhoChuan.set(bomap, kq);
    return kq;
  };
  // Lỗ kín: điểm trống không loang ra được tới mép khung. Trả về { dem, cum: [[chỉ số...]] }.
  // Chỉ xét trong khung bao các điểm có hình (nới 1 điểm) cho nhanh: ngoài khung đó chắc chắn là "ngoài".
  XS.demLo = function (px, W, H) {
    let bx0 = W, by0 = H, bx1 = -1, by1 = -1;
    for (let y = 0; y < H; y++) { const r = y * W; for (let x = 0; x < W; x++) if (px[r + x]) { if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y; } }
    if (bx1 < 0) return { dem: 0, cum: [] };
    bx0 = Math.max(0, bx0 - 1); by0 = Math.max(0, by0 - 1); bx1 = Math.min(W - 1, bx1 + 1); by1 = Math.min(H - 1, by1 + 1);
    const ngoai = new Uint8Array(W * H), q = new Int32Array((bx1 - bx0 + 1) * (by1 - by0 + 1) + 4); let qa = 0, qb = 0;
    const vao = (i) => { if (!px[i] && !ngoai[i]) { ngoai[i] = 1; q[qb++] = i; } };
    for (let x = bx0; x <= bx1; x++) { vao(by0 * W + x); vao(by1 * W + x); }
    for (let y = by0; y <= by1; y++) { vao(y * W + bx0); vao(y * W + bx1); }
    while (qa < qb) { const i = q[qa++], x = i % W, y = (i / W) | 0; if (x > bx0) vao(i - 1); if (x < bx1) vao(i + 1); if (y > by0) vao(i - W); if (y < by1) vao(i + W); }
    const cum = []; let dem = 0;
    for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
      const s = y * W + x; if (px[s] || ngoai[s]) continue;
      const c = []; ngoai[s] = 1; q[0] = s; qa = 0; qb = 1;
      while (qa < qb) { const i = q[qa++], xi = i % W; c.push(i); for (const j of [xi > 0 ? i - 1 : -1, xi < W - 1 ? i + 1 : -1, i - W, i + W]) if (j >= 0 && j < W * H && !px[j] && !ngoai[j]) { ngoai[j] = 1; q[qb++] = j; } }
      dem += c.length; cum.push(c);
    }
    return { dem, cum };
  };
  // Vá lỗ kín nhỏ còn sót (do làm tròn khi xoay): lấy màu không phải nét viền hay gặp nhất xung quanh.
  // giu(i): điểm i của khung là lỗ có sẵn trong hình gốc (giữ nguyên, không vá).
  function vaLo(out, W, H, toiDa, giu) {
    const { cum } = XS.demLo(out, W, H);
    for (const c of cum) {
      if (c.length > toiDa || (giu && c.some(giu))) continue;
      for (let lan = 0; lan < 4; lan++) for (const i of c) {
        if (out[i]) continue;
        const dem = new Map(), x = i % W;
        for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i - W, i + W, x > 0 ? i - W - 1 : -1, x < W - 1 ? i - W + 1 : -1, x > 0 ? i + W - 1 : -1, x < W - 1 ? i + W + 1 : -1]) {
          if (j < 0 || j >= W * H || !out[j]) continue; const v = out[j]; dem.set(v, (dem.get(v) || 0) + (SANG(v) < 72 ? 1 : 3));
        }
        let best = 0, bv = 0; for (const [v, d] of dem) if (d > bv) { bv = d; best = v; }
        if (best && (bv >= 3 || lan > 1)) out[i] = best;
      }
    }
  }

  // Vá khe rộng một điểm mới sinh ra khi cử động (hai bên đều có hình, mà ở hình gốc theo cả người chỗ đó cũng có hình):
  // tô màu hay gặp quanh đó. Khe có sẵn trong hình vẽ (chỗ gốc trống) giữ nguyên.
  function vaKhe(out, W, H, R, invG) {
    for (let lan = 0; lan < 2; lan++) {
      const sua = [];
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
        const i = y * W + x; if (out[i] || !((out[i - 1] && out[i + 1]) || (out[i - W] && out[i + W]))) continue;
        const sx = Math.floor(invG[0] * (x + 0.5) + invG[2] * (y + 0.5) + invG[4]), sy = Math.floor(invG[1] * (x + 0.5) + invG[3] * (y + 0.5) + invG[5]);
        if (sx < 0 || sy < 0 || sx >= R.w || sy >= R.h || !R.px[sy * R.w + sx]) continue;
        const dem = new Map(); let best = 0, bc = 0;
        for (const j of [i - 1, i + 1, i - W, i + W, i - W - 1, i - W + 1, i + W - 1, i + W + 1]) { const c = out[j]; if (!c) continue; const v = (dem.get(c) || 0) + (SANG(c) < 72 ? 1 : 2); dem.set(c, v); if (v > bc) { bc = v; best = c; } }
        if (best) sua.push([i, best]);
      }
      if (!sua.length) break;
      for (const [i, c] of sua) out[i] = c;
    }
  }

  // CẦU NỐI: bộ phận bị thu nhỏ làm tách rời khỏi bộ phận nó gắn vào 1 đến 3 điểm ảnh (đuôi, tai, cánh mảnh...) thì ở dáng
  // gốc nét viền vẫn nối hai bên, nhưng hễ cử động là thành mảnh bay rời. Thêm vài điểm màu nét nối hai bên, thuộc bộ phận con.
  // Trả về { R, bo } (hình và bản đồ bộ phận đã nối, nhớ lại theo bản đồ) hoặc null nếu không có chỗ nào cần nối.
  const nhoCau = new WeakMap();
  function cauNoi(R, Kh) {
    const M = MAU[Kh.mau], w = R.w, h = R.h, bo0 = Kh.bo, ks = JSON.stringify(Kh.khop) + Kh.mau;
    const cu = nhoCau.get(bo0); if (cu && cu.px0 === R.px && cu.ks === ks) return cu.kq;
    const idx = {}; M.bo.forEach((b, k) => { idx[b.id] = k; });
    const goc = idx[XS.boGoc(Kh.mau)], chu = M.bo.map((b, k) => (b.cha != null ? idx[b.cha] : k === goc ? -1 : goc));
    const cua = (i) => (R.px[i] ? (bo0[i] === 255 ? goc : bo0[i]) : -1);
    let px = null, bo = null;
    for (let k = 0; k < M.bo.length; k++) {
      const p = chu[k]; if (p < 0) continue;
      let cham = false, co = false;
      for (let i = 0; i < w * h && !cham; i++) { if (cua(i) !== k) continue; co = true; const x = i % w, y = (i / w) | 0;
        for (let dy = -1; dy <= 1 && !cham; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < w && yy < h && cua(yy * w + xx) === p) { cham = true; break; } } }
      if (cham || !co) continue;
      let best = null, bv = 3.6;
      for (let i = 0; i < w * h; i++) { if (cua(i) !== k) continue; const x = i % w, y = (i / w) | 0;
        for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h || cua(yy * w + xx) !== p) continue; const dd = Math.hypot(dx, dy); if (dd < bv) { bv = dd; best = [x, y, xx, yy]; } } }
      if (!best) continue;
      px = px || R.px.slice(); bo = bo || bo0.slice();
      const [x0, y0, x1, y1] = best, c0 = R.px[y0 * w + x0], c1 = R.px[y1 * w + x1], mau = SANG(c0) <= SANG(c1) ? c0 : c1, so = Math.ceil(bv * 2);
      for (let t = 1; t < so; t++) for (const [ox, oy] of [[0, 0], [1, 0], [0, 1]]) {
        const x = Math.round(x0 + ((x1 - x0) * t) / so) + ox, y = Math.round(y0 + ((y1 - y0) * t) / so) + oy;
        if (x < 0 || y < 0 || x >= w || y >= h) continue; const i = y * w + x; if (!px[i]) { px[i] = mau; bo[i] = k; }
      }
    }
    const kq = px ? { R: { w, h, px }, bo } : null;
    nhoCau.set(bo0, { px0: R.px, ks, kq });
    return kq;
  }
  XS.cauNoi = cauNoi;
  // KHE NGOÀI THÂN: khi tay chân xoay ra, giữa bộ phận và thân hay hở một khe rộng đúng 1 điểm ảnh (ở hình gốc chỗ đó trống).
  // Tô màu viền vào khe đó để nó thành nét viền liền (không thành vết rách). Khe có sẵn trong hình gốc (có viền) giữ nguyên.
  const nhoKheGoc = new WeakMap();
  function kheGoc(R) { // điểm trống của hình gốc (đã thêm viền 1 điểm) mà hai bên đều có hình: khe vẽ sẵn
    const cu = nhoKheGoc.get(R.px); if (cu) return cu;
    const P = XS.noi(R.px, R.w, R.h, 1), v = XS.themVien(P.px, P.w, P.h, 0xff000000), W = P.w, H = P.h, t = new Uint8Array(W * H);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; if (!v[i] && ((v[i - 1] && v[i + 1]) || (v[i - W] && v[i + W]))) t[i] = 1; }
    const kq = { W, H, t }; nhoKheGoc.set(R.px, kq); return kq;
  }
  function vaKheVien(px, W, H, R, invG, vien) {
    const K = kheGoc(R);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x; if (px[i] || !((px[i - 1] && px[i + 1]) || (px[i - W] && px[i + W]))) continue;
      const sx = Math.floor(invG[0] * (x + 0.5) + invG[2] * (y + 0.5) + invG[4]) + 1, sy = Math.floor(invG[1] * (x + 0.5) + invG[3] * (y + 0.5) + invG[5]) + 1;
      if (sx >= 0 && sy >= 0 && sx < K.W && sy < K.H && K.t[sy * K.W + sx]) continue; // khe vẽ sẵn
      px[i] = vien;
    }
  }

  // R: {w, h, px} hình pixel; Kh: {mau, khop, bo (bản đồ bộ phận)}. Trả về {w, h, ox, oy, px} với (ox, oy) là chân, D: lề.
  // Xoay từng điểm ảnh bằng cách lấy mẫu điểm gần nhất trên hình phóng to Scale2x (không tạo màu pha, không viền mờ, không răng cưa). Thứ tự vẽ (dưới lên):
  // chỗ lấp trên thân, mép dư, phần quanh khớp, các bộ phận theo lớp (tay sau dưới thân, tay trước trên thân), rồi vá lỗ nhỏ, viền ngoài.
  XS.dungKhung = function (R, Kh, P, o) {
    o = o || {};
    if (!o.khongVa) { const cn = cauNoi(R, Kh); if (cn) { R = cn.R; Kh = Object.assign({}, Kh, { bo: cn.bo }); } }
    const M = MAU[Kh.mau], w = R.w, h = R.h, D = o.le != null ? o.le : Math.ceil(Math.max(w, h) * 1.05) + 4, W = w + 2 * D, H = h + 2 * D;
    const out = new Uint32Array(W * H), khop = Kh.khop, bomap = Kh.bo, nhanBo = o.nhan ? new Uint8Array(W * H).fill(255) : null; // nhanBo: bộ phận đã vẽ điểm đó (cho bài kiểm tra)
    const va = o.khongVa ? null : XS.chuanBiVa(R, Kh);
    const chan = khop.chan, bb = o.bb || XS.khungHinh(R);
    const pv = P.g.pv === 'giua' ? [bb.x0 + bb.w / 2, bb.y0 + bb.h / 2] : chan;
    const Gm = nhan([1, 0, 0, 1, D, D], bienDoi(P.g, pv[0], pv[1]));
    // ma trận thế giới của từng bộ phận (đi qua các bộ phận cha); góc xoay riêng bị giới hạn theo độ dính sát thân
    const idx = {}; M.bo.forEach((b, k) => { idx[b.id] = k; });
    const the = {};
    const tinh = (b) => {
      if (the[b.id]) return the[b.id];
      let t = P.b[b.id] || {};
      if (va && t.r) { const gh = va.gioiHan[idx[b.id]]; if (Math.abs(t.r) > gh) t = Object.assign({}, t, { r: Math.sign(t.r) * gh }); }
      const L = bienDoi(t, khop[b.a][0], khop[b.a][1]);
      const cha = b.cha ? tinh(M.bo[idx[b.cha]]) : Gm;
      return (the[b.id] = nhan(cha, L));
    };
    // khung bao nguồn của từng bộ phận
    const kbo = M.bo.map(() => [w, h, -1, -1]);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = bomap[y * w + x]; if (v === 255 || !R.px[y * w + x]) continue; const q = kbo[v]; if (!q) continue; if (x < q[0]) q[0] = x; if (y < q[1]) q[1] = y; if (x > q[2]) q[2] = x; if (y > q[3]) q[3] = y; }
    const thuTu = M.bo.map((b, k) => k).sort((a, b) => M.bo[a].z - M.bo[b].z); // vẽ từ lớp dưới lên
    // vẽ một danh sách điểm [chỉ số, màu, ...] theo ma trận M2 (lấy mẫu gần nhất: mỗi điểm đích hỏi ngược về nguồn)
    const veDs = (A, M2, kNhan) => {
      if (!A) return;
      const tam = A.px, q = A.bb, inv = nghich(M2);
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const c of [[q[0], q[1]], [q[2] + 1, q[1]], [q[0], q[3] + 1], [q[2] + 1, q[3] + 1]]) { const p = apDung(M2, c[0], c[1]); if (p[0] < x0) x0 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[0] > x1) x1 = p[0]; if (p[1] > y1) y1 = p[1]; }
      x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0)); x1 = Math.min(W - 1, Math.ceil(x1)); y1 = Math.min(H - 1, Math.ceil(y1));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const ix = Math.floor(inv[0] * (x + 0.5) + inv[2] * (y + 0.5) + inv[4]), iy = Math.floor(inv[1] * (x + 0.5) + inv[3] * (y + 0.5) + inv[5]);
        if (ix < 0 || iy < 0 || ix >= w || iy >= h) continue;
        const c = tam[iy * w + ix]; if (c) { out[y * W + x] = c; if (nhanBo) nhanBo[y * W + x] = kNhan; }
      }
    };
    const ve = (k, M2, chiKhop) => {
      const b = M.bo[k], q = kbo[k]; if (q[2] < 0) return;
      const inv = nghich(M2), song = (P.b[b.id] || {}).song, A0 = khop[b.a], A1 = khop[b.b];
      const vx = A1[0] - A0[0], vy = A1[1] - A0[1], L = Math.hypot(vx, vy) || 1, ux = vx / L, uy = vy / L;
      const pad = song ? Math.abs(song[0]) + 2 : 1;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const c of [[q[0] - pad, q[1] - pad], [q[2] + 1 + pad, q[1] - pad], [q[0] - pad, q[3] + 1 + pad], [q[2] + 1 + pad, q[3] + 1 + pad]]) { const p = apDung(M2, c[0], c[1]); x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
      x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0)); x1 = Math.min(W - 1, Math.ceil(x1)); y1 = Math.min(H - 1, Math.ceil(y1));
      const rk = chiKhop ? Math.max(1.6, Math.min(4, L * 0.25)) : 0;
      const xoay = !!va && (song || Math.abs(M2[1]) > 0.009 || Math.abs(M2[2]) > 0.009); // có xoay: lấy mẫu trên hình phóng to
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        let sx = inv[0] * (x + 0.5) + inv[2] * (y + 0.5) + inv[4], sy = inv[1] * (x + 0.5) + inv[3] * (y + 0.5) + inv[5];
        if (song && !chiKhop) { const t = clamp(((sx - A0[0]) * ux + (sy - A0[1]) * uy) / L, 0, 1.3), d = song[0] * t * Math.sin(song[1] * TAU - t * 3); sx -= -uy * d; sy -= ux * d; }
        if (sx < 0 || sy < 0 || sx >= w || sy >= h) continue;
        const i = xoay ? va.up[Math.floor(sy * 4) * w * 4 + Math.floor(sx * 4)] : Math.floor(sy) * w + Math.floor(sx);
        if (bomap[i] !== k || !R.px[i]) continue;
        if (chiKhop && Math.hypot(sx - A0[0], sy - A0[1]) > rk) continue;
        out[y * W + x] = R.px[i]; if (nhanBo) nhanBo[y * W + x] = k;
      }
    };
    const maTran = (k) => (k < 0 ? Gm : tinh(M.bo[k]));
    if (va) {
      // lấp chỗ thân bị con che (dưới cùng, đi theo thân), rồi mép dư của thân đi theo từng bộ phận con
      for (const k of thuTu) veDs(va.lap[k], maTran(k), k);
      for (const k of thuTu) veDs(va.mep[k], maTran(k), va.chu[k]);
    }
    // phần gần trục xoay vẽ theo bộ phận cha (để không hở khi tay chân xoay)
    for (const k of thuTu) { const b = M.bo[k]; ve(k, b.cha ? tinh(M.bo[idx[b.cha]]) : Gm, true); }
    for (const k of thuTu) ve(k, tinh(M.bo[k]), false);
    // điểm ảnh chưa gán bộ phận: đi theo thân
    const bt = idx.than != null ? idx.than : 0;
    let co = false; for (let i = 0; i < w * h; i++) if (R.px[i] && bomap[i] === 255) { co = true; break; }
    if (co) { const inv = nghich(tinh(M.bo[bt])); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (out[y * W + x]) continue; const sx = Math.floor(inv[0] * (x + 0.5) + inv[2] * (y + 0.5) + inv[4]), sy = Math.floor(inv[1] * (x + 0.5) + inv[3] * (y + 0.5) + inv[5]); if (sx < 0 || sy < 0 || sx >= w || sy >= h) continue; const i = sy * w + sx; if (R.px[i] && bomap[i] === 255) { out[y * W + x] = R.px[i]; if (nhanBo) nhanBo[y * W + x] = bt; } } }
    const toiDaVa = Math.max(6, Math.round(w * h * 0.01));
    const nghichBo = va ? M.bo.map((b) => nghich(tinh(b))) : null;
    const giu = va ? (i) => { const x = i % W + 0.5, y = ((i / W) | 0) + 0.5; for (let k = 0; k < M.bo.length; k++) { const m = nghichBo[k], sx = Math.floor(m[0] * x + m[2] * y + m[4]), sy = Math.floor(m[1] * x + m[3] * y + m[5]); if (sx >= 0 && sy >= 0 && sx < w && sy < h && va.loGoc[sy * w + sx] === k) return true; } return false; } : null;
    if (va) { vaKhe(out, W, H, R, nghich(Gm)); vaLo(out, W, H, toiDaVa, giu); }
    let px = out;
    if (o.vien) { px = XS.themVien(out, W, H, o.vien); if (va) { vaKheVien(px, W, H, R, nghich(Gm), o.vien); vaLo(px, W, H, toiDaVa, giu); } } // viền có thể khép miệng khe hẹp thành lỗ kín
    // lỗ kín còn lại không phải lỗ có sẵn trong hình (bài kiểm tra đếm: phải bằng 0)
    let loMoi = 0; if (va && o.nhan) for (const cc of XS.demLo(px, W, H).cum) if (!cc.some(giu)) loMoi += cc.length;
    const c = apDung(Gm, chan[0], chan[1]);
    M.bo.forEach((b) => tinh(b));
    return { w: W, h: H, px, ox: Math.round(chan[0] + D), oy: Math.round(chan[1] + D), D, chanTT: c, mt: the, nhan: nhanBo, chu: va && va.chu, loMoi };
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
