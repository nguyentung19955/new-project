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
    nguoi: { ten: 'Người (2 chân)', kieu: 'buoc', nga: true,
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
    cay: { ten: 'Cây, đứng yên', kieu: 'nay', dungYen: true,
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

  // A: biên độ (1 = vừa). Trả về tư thế của động tác ten tại tiến độ u (0..1).
  XS.tuThe = function (mau, ten, u, A) {
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
        g.dy = -(M.dungYen ? 3 : 5) * A * hh; g.sy = 1 - 0.1 * A * cz; g.sx = 1 + 0.08 * A * cz;
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
  };

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

  // R: {w, h, px} hình pixel; Kh: {mau, khop, bo (bản đồ bộ phận)}. Trả về {w, h, ox, oy, px} với (ox, oy) là chân, D: lề.
  XS.dungKhung = function (R, Kh, P, o) {
    o = o || {};
    const M = MAU[Kh.mau], w = R.w, h = R.h, D = o.le != null ? o.le : Math.ceil(Math.max(w, h) * 1.05) + 4, W = w + 2 * D, H = h + 2 * D;
    const out = new Uint32Array(W * H), khop = Kh.khop, bomap = Kh.bo;
    const chan = khop.chan, bb = o.bb || XS.khungHinh(R);
    const pv = P.g.pv === 'giua' ? [bb.x0 + bb.w / 2, bb.y0 + bb.h / 2] : chan;
    const Gm = nhan([1, 0, 0, 1, D, D], bienDoi(P.g, pv[0], pv[1]));
    // ma trận thế giới của từng bộ phận (đi qua các bộ phận cha)
    const idx = {}; M.bo.forEach((b, k) => { idx[b.id] = k; });
    const the = {};
    const tinh = (b) => {
      if (the[b.id]) return the[b.id];
      const t = P.b[b.id] || {}, L = bienDoi(t, khop[b.a][0], khop[b.a][1]);
      const cha = b.cha ? tinh(M.bo[idx[b.cha]]) : Gm;
      return (the[b.id] = nhan(cha, L));
    };
    // khung bao nguồn của từng bộ phận
    const kbo = M.bo.map(() => [w, h, -1, -1]);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = bomap[y * w + x]; if (v === 255 || !R.px[y * w + x]) continue; const q = kbo[v]; if (!q) continue; if (x < q[0]) q[0] = x; if (y < q[1]) q[1] = y; if (x > q[2]) q[2] = x; if (y > q[3]) q[3] = y; }
    const thuTu = M.bo.map((b, k) => k).sort((a, b) => M.bo[a].z - M.bo[b].z); // vẽ từ lớp dưới lên
    const ve = (k, M2, chiKhop) => {
      const b = M.bo[k], q = kbo[k]; if (q[2] < 0) return;
      const inv = nghich(M2), song = (P.b[b.id] || {}).song, A0 = khop[b.a], A1 = khop[b.b];
      const vx = A1[0] - A0[0], vy = A1[1] - A0[1], L = Math.hypot(vx, vy) || 1, ux = vx / L, uy = vy / L;
      const pad = song ? Math.abs(song[0]) + 2 : 1;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const c of [[q[0] - pad, q[1] - pad], [q[2] + 1 + pad, q[1] - pad], [q[0] - pad, q[3] + 1 + pad], [q[2] + 1 + pad, q[3] + 1 + pad]]) { const p = apDung(M2, c[0], c[1]); x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
      x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0)); x1 = Math.min(W - 1, Math.ceil(x1)); y1 = Math.min(H - 1, Math.ceil(y1));
      const rk = chiKhop ? Math.max(1.6, Math.min(4, L * 0.25)) : 0;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        let sx = inv[0] * (x + 0.5) + inv[2] * (y + 0.5) + inv[4], sy = inv[1] * (x + 0.5) + inv[3] * (y + 0.5) + inv[5];
        if (song && !chiKhop) { const t = clamp(((sx - A0[0]) * ux + (sy - A0[1]) * uy) / L, 0, 1.3), d = song[0] * t * Math.sin(song[1] * TAU - t * 3); sx -= -uy * d; sy -= ux * d; }
        const ix = Math.floor(sx), iy = Math.floor(sy);
        if (ix < 0 || iy < 0 || ix >= w || iy >= h) continue;
        const i = iy * w + ix; if (bomap[i] !== k || !R.px[i]) continue;
        if (chiKhop && Math.hypot(sx - A0[0], sy - A0[1]) > rk) continue;
        out[y * W + x] = R.px[i];
      }
    };
    // lấp chỗ khớp: phần gần trục xoay vẽ theo bộ phận cha (để không hở khi tay chân xoay)
    for (const k of thuTu) { const b = M.bo[k]; ve(k, b.cha ? tinh(M.bo[idx[b.cha]]) : Gm, true); }
    for (const k of thuTu) ve(k, tinh(M.bo[k]), false);
    // điểm ảnh chưa gán bộ phận: đi theo thân
    const bt = idx.than != null ? idx.than : 0;
    let co = false; for (let i = 0; i < w * h; i++) if (R.px[i] && bomap[i] === 255) { co = true; break; }
    if (co) { const inv = nghich(tinh(M.bo[bt])); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (out[y * W + x]) continue; const sx = Math.floor(inv[0] * (x + 0.5) + inv[2] * (y + 0.5) + inv[4]), sy = Math.floor(inv[1] * (x + 0.5) + inv[3] * (y + 0.5) + inv[5]); if (sx < 0 || sy < 0 || sx >= w || sy >= h) continue; const i = sy * w + sx; if (R.px[i] && bomap[i] === 255) out[y * W + x] = R.px[i]; } }
    const px = o.vien ? XS.themVien(out, W, H, o.vien) : out;
    const c = apDung(Gm, chan[0], chan[1]);
    return { w: W, h: H, px, ox: Math.round(chan[0] + D), oy: Math.round(chan[1] + D), D, chanTT: c };
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
        const f = XS.dungKhung(R, cfg, XS.tuThe(cfg.mau, ten, u, A), { vien: cfg.vien, bb });
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
