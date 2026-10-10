// HÌNH CHIBI KHUNG XƯƠNG (định dạng "linh-khi-rig", xem docs/phong-cach-moi/KE-HOACH-CHIBI.md).
// Mỗi nhân vật là MỘT ảnh chứa các mảnh (đầu, thân, tay, chân, đuôi, vũ khí). Mỗi khung hình game xoay và nhún
// từng mảnh quanh khớp của nó, nên chuyển động liên tục, mượt, hình nét ở mọi cỡ.
// Động tác SINH TỰ ĐỘNG theo "khung" (nguoi | bon-chan | cua) và "vai" của từng mảnh:
//   idle (đứng thở), move (đi), tele (chuẩn bị đánh), atk (đánh), hit (trúng đòn), die (chết).
// Hàm chung (công cụ Xưởng Rối cũng dùng, nên tệp này CHỈ dựa vào window.G):
//   G.chibi.add(tep)                   nạp một tệp rig (đối tượng), trả về rig (ảnh nạp không đồng bộ, rig.ready = true khi xong)
//   G.chibi.ds[ma]                     các rig đã nạp
//   G.chibi.pose(rig, anim, u, t)      tính tư thế: { g: {dx, dy, sx, sy, rot, alpha, flash}, m: { tenManh: {a, dx, dy} } }
//                                      u: tiến độ 0..1 (động tác một lần), t: thời gian giây (động tác lặp)
//   G.chibi.draw(ctx, rig, x, y, opts) vẽ, (x, y) = điểm chân. opts: { anim, u, t, flip, scale, flash (0..1), alpha, tint: [màu, độ đậm], bong, cao }
// Đơn vị: góc trong tệp là độ; trong tư thế góc là radian, dời tính theo phần chiều cao nhân vật (1 = cả người).
// Chiều dương của góc: xoay theo chiều kim đồng hồ trên màn hình (nhân vật quay PHẢI): thân dương = cúi tới trước,
// tay/chân buông xuống dương = bàn tay/bàn chân đưa ra SAU.
(function () {
  'use strict';
  const G = (typeof window !== 'undefined') ? (window.G = window.G || {}) : (globalThis.G = globalThis.G || {});
  const PI = Math.PI, TAU = PI * 2, D = PI / 180;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const seg = (u, a, b) => clamp((u - a) / (b - a), 0, 1);
  const eOut = (x) => 1 - (1 - x) * (1 - x) * (1 - x);            // nhanh rồi chậm
  const eIn = (x) => x * x;                                       // chậm rồi nhanh
  const eIO = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const bump = (x) => Math.sin(clamp(x, 0, 1) * PI);              // 0 -> 1 -> 0 mượt
  const ANIMS = ['idle', 'move', 'tele', 'atk', 'hit', 'die', 'roll']; // roll: lộn nhào (né)
  const LOOP = { idle: true, move: true };
  const KHUNG = { nguoi: 1, 'bon-chan': 1, cua: 1 };

  const C = (G.chibi = G.chibi || {});
  C.ds = C.ds || {};
  C.loi = C.loi || [];
  C.ANIMS = ANIMS; C.LOOP = LOOP;

  const P2 = (a) => (Array.isArray(a) && a.length >= 2 && isFinite(a[0]) && isFinite(a[1]) ? [+a[0], +a[1]] : null);

  // ---------- nạp tệp ----------
  C.add = function (tep) {
    try {
      if (!tep || typeof tep !== 'object') throw new Error('tệp rỗng');
      if (tep.loai !== 'linh-khi-rig') throw new Error('không phải tệp linh-khi-rig');
      if (typeof tep.ma !== 'string' || !/^[A-Za-z0-9_-]{1,40}$/.test(tep.ma)) throw new Error('mã sai');
      const coAnh = typeof tep.anh === 'string' && tep.anh.indexOf('data:image/png;base64,') === 0;
      if (!coAnh && !(tep.anhCanvas && tep.anhCanvas.getContext)) throw new Error('thiếu ảnh PNG');
      if (!Array.isArray(tep.manh) || !tep.manh.length) throw new Error('thiếu mảnh');
      const manh = [], theoTen = {};
      tep.manh.forEach((m, i) => {
        if (!m || typeof m.ten !== 'string') throw new Error('mảnh ' + i + ' thiếu tên');
        const o = Array.isArray(m.o) && m.o.length === 4 ? m.o.map(Number) : null;
        if (!o || !(o[2] > 0 && o[3] > 0)) throw new Error('mảnh ' + m.ten + ' thiếu ô ảnh');
        const dat = P2(m.dat) || [0, 0], truc = P2(m.truc) || [dat[0] + o[2] / 2, dat[1] + o[3] / 2];
        const p = { ten: m.ten, vai: String(m.vai || 'phu-kien'), cha: m.cha || null, o, dat, truc, lop: +m.lop || 0, i, con: [] };
        // nap: [bán kính, màu]: "bản lề ảo", hình tròn cùng màu chi vẽ ngay tại khớp để không bao giờ hở khoảng trống
        if (Array.isArray(m.nap) && +m.nap[0] > 0 && /^#[0-9a-fA-F]{6}$/.test(String(m.nap[1]))) p.nap = [+m.nap[0], String(m.nap[1])];
        if (theoTen[p.ten]) throw new Error('trùng tên mảnh ' + p.ten);
        theoTen[p.ten] = p; manh.push(p);
      });
      // cây cha con; cha không có thật thì coi là gốc
      for (const p of manh) { if (p.cha && !theoTen[p.cha]) p.cha = null; }
      for (const p of manh) { let q = p, n = 0; while (q.cha && n++ < 50) q = theoTen[q.cha]; if (n >= 50) p.cha = null; } // chặn vòng lặp
      for (const p of manh) if (p.cha) theoTen[p.cha].con.push(p);
      // thứ tự tính: cha trước con
      const thuTu = [], da = {};
      const di = (p) => { if (da[p.ten]) return; if (p.cha) di(theoTen[p.cha]); da[p.ten] = 1; thuTu.push(p); };
      manh.forEach(di);
      const veThuTu = manh.slice().sort((a, b) => a.lop - b.lop || a.i - b.i);
      // khung bao tư thế ráp
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const p of manh) { x0 = Math.min(x0, p.dat[0]); y0 = Math.min(y0, p.dat[1]); x1 = Math.max(x1, p.dat[0] + p.o[2]); y1 = Math.max(y1, p.dat[1] + p.o[3]); }
      const goc = P2(tep.goc) || [(x0 + x1) / 2, y1];
      const dt = {};
      for (const k of ANIMS) {
        const a = tep.dong_tac && tep.dong_tac[k];
        dt[k] = { bien_do: a && isFinite(a.bien_do) ? clamp(+a.bien_do, 0, 5) : 1, toc_do: a && isFinite(a.toc_do) && +a.toc_do > 0 ? clamp(+a.toc_do, 0.1, 5) : 1 };
      }
      const rig = {
        ma: tep.ma, ten: String(tep.ten || tep.ma), doi: tep.doi_tuong === 'em-be' ? 'em-be' : 'quai', thayCho: tep.thay_cho ? String(tep.thay_cho) : '',
        khung: KHUNG[tep.khung] ? tep.khung : 'nguoi', cao: +tep.cao > 0 ? +tep.cao : 40, goc, manh, theoTen, thuTu, veThuTu, dt,
        H: Math.max(1, goc[1] - y0), W: Math.max(1, x1 - x0), hop: [x0, y0, x1 - x0, y1 - y0],
        img: null, ready: false, mau: {}, tep,
      };
      rig.coVuKhi = manh.some((p) => p.vai === 'vu-khi');
      rig.tayTruoc = manh.find((p) => p.vai === 'tay-truoc') || null;
      const xong = (src) => { rig.img = src; rig.ready = true; rig.mau = {}; };
      if (tep.anhCanvas && tep.anhCanvas.getContext) xong(tep.anhCanvas);
      else if (typeof Image !== 'undefined') {
        const img = new Image();
        img.onload = () => xong(img);
        img.onerror = () => C.loi.push(rig.ma + ': ảnh hỏng');
        img.src = tep.anh;
      }
      C.ds[rig.ma] = rig;
      if (typeof C.onAdd === 'function') { try { C.onAdd(rig); } catch (e) { /* bỏ qua */ } }
      return rig;
    } catch (e) {
      C.loi.push((tep && tep.ma) + ': ' + e.message);
      if (typeof console !== 'undefined') console.warn('chibi_rig: bỏ qua tệp hỏng', tep && tep.ma, e.message);
      return null;
    }
  };
  C.get = (ma) => { const r = C.ds[ma]; return r && r.ready ? r : null; };
  C.remove = (ma) => { delete C.ds[ma]; };
  // Tìm rig thay cho một quái (mã quái trong game) hoặc em bé.
  C.choQuai = function (id) {
    if (!id) return null;
    for (const k in C.ds) { const r = C.ds[k]; if (r.ready && r.doi === 'quai' && (r.thayCho === id || r.ma === id)) return r; }
    return null;
  };
  C.choEmBe = function (key) {
    let mac = null;
    for (const k in C.ds) {
      const r = C.ds[k]; if (!r.ready || r.doi !== 'em-be') continue;
      if (key && (r.thayCho === key || r.thayCho === 'hero-' + key)) return r;
      if (!r.thayCho || r.thayCho === 'hero' || r.thayCho === 'em-be') mac = mac || r;
    }
    return mac;
  };

  // ---------- động tác ----------
  function moi() { return { g: { dx: 0, dy: 0, sx: 1, sy: 1, rot: 0, alpha: 1, flash: 0 }, m: {} }; }
  function dat(P, ten, a, dx, dy) { const q = P.m[ten] || (P.m[ten] = { a: 0, dx: 0, dy: 0 }); q.a += a || 0; q.dx += dx || 0; q.dy += dy || 0; }
  // đặt góc cho mọi mảnh có vai v
  function theoVai(rig, P, v, f) { for (const p of rig.manh) if (p.vai === v || (v.endsWith('*') && p.vai.indexOf(v.slice(0, -1)) === 0)) f(p); }
  // mỗi mảnh phụ kiện lắc lệch pha một chút theo thứ tự để không cùng nhịp
  const lech = (p) => (p.i * 0.7) % TAU;

  // NGƯỜI (em bé, lính, ma...)
  function nguoi(rig, P, n, u, t, B) {
    const g = P.g, v = (ten, a, dx, dy) => theoVai(rig, P, ten, (p) => dat(P, p.ten, a, dx, dy));
    if (n === 'idle') {
      const w = TAU * 0.85 * t, s = Math.sin(w);
      g.sy = 1 + 0.022 * s * B; g.sx = 1 - 0.012 * s * B;           // thở: phồng lên xẹp xuống, chân vẫn chạm đất
      v('dau', 3 * D * Math.sin(w - 0.8) * B);
      v('tay-truoc', -3 * D * s * B); v('tay-sau', 3 * D * s * B);
      v('vu-khi', 2 * D * Math.sin(w - 1.2) * B);
      theoVai(rig, P, 'phu-kien', (p) => dat(P, p.ten, 5 * D * Math.sin(w - 1.4 - lech(p)) * B));
      v('than', 1 * D * Math.sin(w * 0.5) * B);
    } else if (n === 'move') {
      const p = TAU * 1.7 * t, s = Math.sin(p);
      g.dy = -Math.abs(Math.sin(p)) * 0.045 * B;                     // nhún mỗi bước
      g.sy = 1 + 0.02 * Math.cos(2 * p) * B; g.sx = 1 - 0.01 * Math.cos(2 * p) * B;
      v('than', 4 * D * B);                                          // hơi nghiêng tới
      v('chan-truoc', -26 * D * s * B); v('chan-sau', 26 * D * s * B); // chân đung đưa ngược pha
      v('tay-truoc', 22 * D * s * B); v('tay-sau', -22 * D * s * B);   // tay ngược pha với chân cùng bên
      v('dau', (-3 + 2.5 * Math.sin(2 * p + 0.6)) * D * B);
      v('vu-khi', 4 * D * Math.sin(p - 0.5) * B);
      theoVai(rig, P, 'phu-kien', (q) => dat(P, q.ten, 8 * D * Math.sin(2 * p - 1 - lech(q)) * B));
    } else if (n === 'tele') {
      const e = eOut(u), r = Math.sin(TAU * 6 * t) * 0.6 * D * e;   // run nhẹ khi dồn sức
      g.sy = 1 - 0.07 * e * B; g.sx = 1 + 0.045 * e * B; g.dx = -0.03 * e * B; // co người lấy đà
      v('than', (-9 * e * B) * D + r);
      v('tay-truoc', 115 * D * e * B);                               // tay vũ khí đưa ra sau, giơ cao
      v('vu-khi', 15 * D * e * B);
      v('tay-sau', -30 * D * e * B);
      v('dau', 5 * D * e * B);
      v('chan-truoc', -10 * D * e * B); v('chan-sau', 8 * D * e * B);
      theoVai(rig, P, 'phu-kien', (q) => dat(P, q.ten, -6 * D * e * B));
    } else if (n === 'atk') {
      // 0..0.3: vung mạnh từ sau ra trước; 0.3..0.6: giữ; 0.6..1: thu về
      const k = eOut(seg(u, 0, 0.3)), ve = eIO(seg(u, 0.6, 1)), keo = 1 - ve;
      const tay = (115 + (-95 - 115) * k) * keo;
      g.dx = (0.08 * k * keo) * B; g.sy = 1 + (-0.07 + 0.1 * k) * keo * B * (1 - k * 0.6); g.sx = 1 + 0.045 * (1 - k) * keo * B;
      v('than', (-9 + 21 * k) * keo * D * B);                        // thân nghiêng tới
      v('tay-truoc', tay * D * B);
      v('vu-khi', (15 - 30 * k) * keo * D * B);
      v('tay-sau', (-30 + 55 * k) * keo * D * B);
      v('dau', (5 - 10 * k) * keo * D * B);
      v('chan-truoc', (-10 - 18 * k) * keo * D * B); v('chan-sau', (8 + 16 * k) * keo * D * B);
      theoVai(rig, P, 'phu-kien', (q) => dat(P, q.ten, (-6 + 22 * k) * keo * D * B * (1 - 0.3 * Math.sin(u * 20))));
    } else if (n === 'hit') {
      const k = Math.pow(1 - u, 2);
      g.dx = -0.07 * k * B; g.rot = -6 * D * k * B; g.sx = 1 + 0.05 * bump(u * 2) * B; g.sy = 1 - 0.05 * bump(u * 2) * B;
      g.flash = clamp(1 - u * 3.2, 0, 1);
      v('dau', -12 * D * k * B); v('than', -6 * D * k * B);
      v('tay-truoc', 25 * D * k * B); v('tay-sau', 30 * D * k * B);
      theoVai(rig, P, 'phu-kien', (q) => dat(P, q.ten, 14 * D * k * Math.cos(u * 14) * B));
    } else if (n === 'roll') {
      // LỘN NHÀO tới trước một vòng quanh giữa người (ease-in-out bậc 3), co tay chân lại ở giữa vòng.
      const co = bump(u) * B;
      lanTron(P, u, 0.18);
      g.sy = 1 - 0.12 * co; g.sx = 1 + 0.05 * co;
      v('chan-truoc', -55 * D * co); v('chan-sau', -40 * D * co);
      v('tay-truoc', -60 * D * co); v('tay-sau', -45 * D * co);
      v('dau', 14 * D * co); v('vu-khi', 20 * D * co);
    } else if (n === 'die') {
      const f = eIn(seg(u, 0.05, 0.55)), nay = bump(seg(u, 0.55, 0.75)) * 0.12, k = Math.max(0, f - nay);
      g.rot = -84 * D * k * B; g.dx = -0.18 * k * B;                // ngã ngửa ra sau
      g.sy = 1 - 0.06 * bump(seg(u, 0.5, 0.7)) * B;
      g.alpha = 1 - seg(u, 0.62, 1);
      g.flash = clamp(0.8 - u * 4, 0, 1);
      v('dau', -18 * D * f * B); v('tay-truoc', -60 * D * f * B); v('tay-sau', -40 * D * f * B);
      v('chan-truoc', -25 * D * f * B); v('chan-sau', 10 * D * f * B); v('vu-khi', 30 * D * f * B);
      theoVai(rig, P, 'phu-kien', (q) => dat(P, q.ten, -20 * D * f * B));
    }
  }

  // BỐN CHÂN (heo, sói, thú...). Mặt quay phải.
  // Cây xương: thân (hông, gốc) mang chân sau, đuôi và NGỰC (không bắt buộc: khớp cột sống ở giữa lưng);
  // ngực mang chân trước và CỔ (không bắt buộc), cổ mang đầu. Thiếu ngực/cổ thì các mảnh đó gắn thẳng vào thân.
  function bonChan(rig, P, n, u, t, B) {
    const g = P.g, v = (ten, a, dx, dy) => theoVai(rig, P, ten, (p) => dat(P, p.ten, a, dx, dy));
    const chan = (fg, fx, sg, sx) => { v('chan-truoc-gan', fg); v('chan-truoc-xa', fx); v('chan-sau-gan', sg); v('chan-sau-xa', sx); };
    if (n === 'idle') {
      const w = TAU * 0.8 * t, s = Math.sin(w);
      g.sy = 1 + 0.02 * s * B; g.sx = 1 - 0.01 * s * B;
      v('dau', 2.5 * D * Math.sin(w - 0.9) * B);
      v('nguc', 1.2 * D * Math.sin(w - 0.4) * B); v('co', 2 * D * Math.sin(w - 0.7) * B); // ngực phồng, cổ gật theo nhịp thở
      v('duoi', 9 * D * Math.sin(TAU * 1.6 * t) * B);
      theoVai(rig, P, 'phu-kien', (p) => dat(P, p.ten, 4 * D * Math.sin(w - 1.3 - lech(p)) * B));
    } else if (n === 'move') {
      const p = TAU * 2 * t, s = Math.sin(p), A = 24 * D * B;
      g.dy = -Math.abs(Math.sin(p)) * 0.05 * B;
      g.sy = 1 + 0.025 * Math.cos(2 * p) * B; g.sx = 1 - 0.012 * Math.cos(2 * p) * B;
      v('than', 1.5 * D * Math.sin(2 * p) * B);
      // NHỊP CHẠY NƯỚC KIỆU (trot): cặp chéo trước-gần + sau-xa cùng pha, cặp trước-xa + sau-gan lệch pha π
      chan(-A * s, A * s, A * s, -A * s);
      v('nguc', 3 * D * Math.sin(2 * p + 0.4) * B);                  // cột sống uốn: ngực lắc nhẹ so với hông
      v('co', 4 * D * Math.sin(2 * p + 0.6) * B);
      v('dau', 4 * D * Math.sin(2 * p + 0.8) * B);
      v('duoi', 16 * D * Math.sin(2 * p) * B);
      theoVai(rig, P, 'phu-kien', (q) => dat(P, q.ten, 8 * D * Math.sin(2 * p - 1 - lech(q)) * B));
    } else if (n === 'tele') {
      const e = eOut(u), r = Math.sin(TAU * 7 * t) * 0.7 * D * e;
      g.dx = -0.06 * e * B; g.sy = 1 - 0.08 * e * B; g.sx = 1 + 0.05 * e * B;
      v('than', -5 * D * e * B + r);                                 // lùi người, cúi đầu lấy đà
      v('nguc', 6 * D * e * B); v('co', 8 * D * e * B);
      v('dau', 12 * D * e * B);
      chan(-14 * D * e * B, -10 * D * e * B, 16 * D * e * B, 12 * D * e * B);
      v('duoi', (20 * e + 10 * Math.sin(TAU * 4 * t) * e) * D * B);
    } else if (n === 'atk') {
      const k = eOut(seg(u, 0, 0.28)), ve = eIO(seg(u, 0.55, 1)), keo = 1 - ve;
      g.dx = (-0.06 + 0.24 * k) * keo * B; g.dy = -0.05 * bump(seg(u, 0, 0.3)) * B;
      g.sx = 1 + 0.06 * k * keo * B; g.sy = 1 - 0.04 * k * keo * B;
      v('than', (-5 + 13 * k) * keo * D * B);                        // lao tới, chúi người
      v('nguc', (6 - 12 * k) * keo * D * B); v('co', (8 - 18 * k) * keo * D * B);
      v('dau', (12 - 34 * k) * keo * D * B);                         // húc hất đầu lên
      chan((-14 + 50 * k) * keo * D * B, (-10 + 40 * k) * keo * D * B, (16 - 40 * k) * keo * D * B, (12 - 34 * k) * keo * D * B);
      v('duoi', (20 + 15 * k) * keo * D * B);
    } else if (n === 'hit') {
      const k = Math.pow(1 - u, 2);
      g.dx = -0.07 * k * B; g.rot = -5 * D * k * B; g.sx = 1 - 0.05 * bump(u * 2) * B; g.sy = 1 + 0.04 * bump(u * 2) * B;
      g.flash = clamp(1 - u * 3.2, 0, 1);
      v('dau', -14 * D * k * B); v('nguc', -6 * D * k * B); v('co', -8 * D * k * B);
      chan(-12 * D * k * B, -8 * D * k * B, 10 * D * k * B, 6 * D * k * B);
      v('duoi', 25 * D * k * Math.cos(u * 12) * B);
    } else if (n === 'roll') {
      // LĂN TRÒN: co bốn chân sát bụng, cúi đầu, cuộn đuôi, rồi lăn một vòng tới trước như quả bóng
      const co = bump(u) * B;
      lanTron(P, u, 0.12);
      g.sy = 1 - 0.1 * co; g.sx = 1 - 0.06 * co;
      chan(-70 * D * co, -60 * D * co, 70 * D * co, 60 * D * co); // chân trước gập ra sau, chân sau gập ra trước: ôm lấy bụng
      v('dau', 30 * D * co); v('co', 15 * D * co); v('nguc', 6 * D * co);
      v('duoi', -40 * D * co);
    } else if (n === 'die') {
      const f = eIn(seg(u, 0.05, 0.5)), nay = bump(seg(u, 0.5, 0.7)) * 0.1, k = Math.max(0, f - nay);
      g.sy = 1 - 0.38 * k * B; g.sx = 1 + 0.12 * k * B; g.rot = 8 * D * k * B; // xẹp xuống đất
      g.alpha = 1 - seg(u, 0.6, 1);
      g.flash = clamp(0.8 - u * 4, 0, 1);
      chan(-55 * D * f * B, -45 * D * f * B, 55 * D * f * B, 45 * D * f * B); // chân duỗi ra hai bên
      v('dau', 18 * D * f * B); v('duoi', -30 * D * f * B); v('nguc', 8 * D * f * B); v('co', 10 * D * f * B);
    }
  }

  // CUA (cua, bọ, nhện): bò ngang, chân so le.
  function cua(rig, P, n, u, t, B) {
    const g = P.g, v = (ten, a, dx, dy) => theoVai(rig, P, ten, (p) => dat(P, p.ten, a, dx, dy));
    const chan = (f) => { for (const p of rig.manh) { const m = /^chan-(gan|xa)-(\d)$/.exec(p.vai); if (m) dat(P, p.ten, f(m[1] === 'gan' ? 0 : 1, (+m[2] || 1) - 1, p)); } };
    if (n === 'idle') {
      const w = TAU * 0.9 * t, s = Math.sin(w);
      g.sy = 1 + 0.02 * s * B; g.sx = 1 - 0.01 * s * B;
      v('cang-truoc', 6 * D * Math.sin(w - 0.5) * B); v('cang-sau', -5 * D * Math.sin(w - 1.1) * B);
      chan((b, i) => 3 * D * Math.sin(w + i * 1.3 + b * PI) * B);
      theoVai(rig, P, 'phu-kien', (p) => dat(P, p.ten, 5 * D * Math.sin(w - 1 - lech(p)) * B));
    } else if (n === 'move') {
      const p = TAU * 2.6 * t;
      g.dy = -Math.abs(Math.sin(p)) * 0.03 * B; g.dx = 0.015 * Math.sin(p) * B; // lạch bạch sang ngang
      g.rot = 2.5 * D * Math.sin(p) * B;
      chan((b, i) => 20 * D * Math.sin(p + i * (TAU / 3) + b * PI) * B); // so le từng chân, hai bên ngược pha
      v('cang-truoc', 8 * D * Math.sin(p + 0.5) * B); v('cang-sau', 8 * D * Math.sin(p + PI) * B);
      theoVai(rig, P, 'phu-kien', (q) => dat(P, q.ten, 8 * D * Math.sin(2 * p - lech(q)) * B));
    } else if (n === 'tele') {
      const e = eOut(u), r = Math.sin(TAU * 8 * t) * 1.5 * D * e;
      g.sy = 1 - 0.07 * e * B; g.sx = 1 + 0.05 * e * B; g.dx = -0.04 * e * B;
      v('cang-truoc', -55 * D * e * B + r); v('cang-sau', -40 * D * e * B - r);   // giơ càng lên
      chan((b, i) => (b ? 10 : -10) * D * e * B);
    } else if (n === 'atk') {
      const k = eOut(seg(u, 0, 0.25)), keo = 1 - eIO(seg(u, 0.55, 1));
      g.dx = (-0.04 + 0.16 * k) * keo * B; g.sy = 1 + (-0.07 + 0.1 * k) * keo * B;
      v('cang-truoc', (-55 + 85 * k) * keo * D * B); v('cang-sau', (-40 + 70 * k) * keo * D * B); // kẹp mạnh xuống
      v('than', 6 * D * k * keo * B);
      chan((b, i) => (b ? 10 - 18 * k : -10 + 18 * k) * keo * D * B);
    } else if (n === 'hit') {
      const k = Math.pow(1 - u, 2);
      g.dx = -0.07 * k * B; g.rot = -5 * D * k * B; g.flash = clamp(1 - u * 3.2, 0, 1);
      g.sx = 1 + 0.05 * bump(u * 2) * B; g.sy = 1 - 0.05 * bump(u * 2) * B;
      v('cang-truoc', 25 * D * k * B); v('cang-sau', 20 * D * k * B);
      chan((b, i) => (b ? 1 : -1) * 15 * D * k * Math.cos(u * 10 + i) * B);
    } else if (n === 'die') {
      const f = eIn(seg(u, 0.05, 0.5)), nay = bump(seg(u, 0.5, 0.7)) * 0.1, k = Math.max(0, f - nay);
      g.sy = 1 - 0.35 * k * B; g.sx = 1 + 0.1 * k * B; g.alpha = 1 - seg(u, 0.6, 1); g.flash = clamp(0.8 - u * 4, 0, 1);
      v('cang-truoc', 40 * D * f * B); v('cang-sau', 35 * D * f * B);
      chan((b, i) => (b ? -1 : 1) * (35 + i * 8) * D * f * B);
    }
  }

  // cua / bọ: rụt càng và chân rồi lăn
  const cua0 = cua;
  function cuaLan(rig, P, n, u, t, B) {
    if (n !== 'roll') return cua0(rig, P, n, u, t, B);
    const co = bump(u) * B;
    lanTron(P, u, 0.1);
    theoVai(rig, P, 'cang-*', (p) => dat(P, p.ten, 45 * D * co));
    for (const p of rig.manh) { const m = /^chan-(gan|xa)-(\d)$/.exec(p.vai); if (m) dat(P, p.ten, (m[1] === 'gan' ? -1 : 1) * 40 * D * co); }
  }
  const KHUNG_HAM = { nguoi, 'bon-chan': bonChan, cua: cuaLan };
  // LỘN / LĂN TRÒN dùng chung: cả người quay một vòng quanh GIỮA người (không quanh bàn chân), nhanh dần rồi chậm dần
  // (ease-in-out bậc 3), nảy lên một chút. Từng khung chỉ thêm phần co tay chân của riêng nó.
  function lanTron(P, u, nay) {
    const g = P.g, th = TAU * eIO(u);
    g.rot = th; g.dx = -0.5 * Math.sin(th); g.dy = -0.5 * (1 - Math.cos(th)) - nay * bump(u);
  }
  C.lanTron = lanTron;
  const GIOI_HAN_TAY = PI / 2; // tay xoay tối đa ±90° so với thân: không bao giờ bẻ ngược dị dạng
  function poseTho(rig, n, u, t, h) {
    const P = moi();
    (KHUNG_HAM[rig.khung] || nguoi)(rig, P, n, u, t, h.bien_do);
    if (rig.khung === 'nguoi') for (const p of rig.manh) if (/^tay-/.test(p.vai) && P.m[p.ten]) P.m[p.ten].a = clamp(P.m[p.ten].a, -GIOI_HAN_TAY, GIOI_HAN_TAY);
    return P;
  }
  // QUÁN TÍNH TRỄ (follow-through): đầu, phụ kiện (ống tên, khăn, tóc) và đuôi không dính cứng vào thân mà đi trễ pha:
  // lấy tư thế thân ở một chút trước đó (TRE giây) so với bây giờ; thân vừa nhún lên thì đầu gật xuống, vừa lao tới thì
  // đầu ngả ra sau, vừa nghiêng thì đầu nghiêng ngược lại. Vì là dao động hình sin trễ pha nên mượt, không cần nhớ trạng thái.
  const TRE = 0.12;
  const QT = { dau: 1, co: 0.6, 'phu-kien': 1.8, duoi: 1.5 };
  function quanTinh(rig, P, Pt) {
    const goc = rig.thuTu[0] && rig.thuTu[0].ten; // mảnh gốc (thân)
    const gT = (Q) => Q.g.rot + (goc && Q.m[goc] ? Q.m[goc].a : 0);
    const dY = P.g.dy - Pt.g.dy, dX = P.g.dx - Pt.g.dx, dR = gT(P) - gT(Pt);
    const lech = -dY * 1.3 - dX * 1.1 - dR * 0.7;
    if (Math.abs(lech) < 1e-5) return;
    for (const p of rig.manh) {
      const k = QT[p.vai]; if (!k) continue;
      dat(P, p.ten, clamp(lech * k, -0.35, 0.35));
    }
  }
  C.TRE = TRE;
  C.pose = function (rig, anim, u, t) {
    if (!rig) return moi();
    const n = ANIMS.indexOf(anim) >= 0 ? anim : 'idle', h = rig.dt[n] || { bien_do: 1, toc_do: 1 };
    t = (+t || 0) * (LOOP[n] ? h.toc_do : 1);
    // Động tác một lần: tốc độ > 1 thì làm xong sớm rồi giữ tư thế cuối (thời lượng do game quyết định).
    u = clamp((+u || 0) * (LOOP[n] ? 1 : h.toc_do), 0, 1);
    const P = poseTho(rig, n, u, t, h);
    if (n !== 'die') quanTinh(rig, P, poseTho(rig, n, LOOP[n] ? u : clamp(u - (n === 'roll' ? 0.12 : 0.07), 0, 1), LOOP[n] ? t - TRE : t, h)); // lộn nhào: đầu, ống tên chậm hơn thân 2-3 khung hình
    return P;
  };

  // CHUYỂN ĐỘNG TÁC MƯỢT: đổi động tác (đứng → đi → đánh...) thì trộn dần tư thế cũ sang mới trong CHUYEN giây
  // (nội suy làm mềm kiểu ease-in-out), không nhảy cóc. khoa: đối tượng riêng cho từng nhân vật (ví dụ người chơi).
  const CHUYEN = 0.18, nhoTron = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  const eSmooth = (k) => k * k * (3 - 2 * k);
  function tronTuThe(A, B, k) {
    const e = eSmooth(k), P = moi();
    for (const n in B.g) { const a = A.g[n] == null ? B.g[n] : A.g[n]; P.g[n] = a + (B.g[n] - a) * e; }
    const ten = {}; for (const n in A.m) ten[n] = 1; for (const n in B.m) ten[n] = 1;
    for (const n in ten) {
      const a = A.m[n] || { a: 0, dx: 0, dy: 0 }, b = B.m[n] || { a: 0, dx: 0, dy: 0 };
      P.m[n] = { a: a.a + (b.a - a.a) * e, dx: a.dx + (b.dx - a.dx) * e, dy: a.dy + (b.dy - a.dy) * e };
    }
    return P;
  }
  C.tronTuThe = tronTuThe;
  C.poseMuot = function (khoa, rig, anim, u, t, now) {
    const P = C.pose(rig, anim, u, t);
    if (!nhoTron || !khoa || typeof khoa !== 'object') return P;
    now = now != null ? now : (G.time || 0);
    let st = nhoTron.get(khoa);
    if (!st || st.rig !== rig || now < st.now || now - st.now > 0.5) { st = { rig, anim, tu: null, k: 1, cuoi: P, now }; nhoTron.set(khoa, st); }
    const dtg = now - st.now; st.now = now;
    if (anim !== st.anim) { st.tu = st.cuoi; st.anim = anim; st.k = 0; }
    let ra = P;
    if (st.k < 1 && st.tu) { st.k = Math.min(1, st.k + dtg / CHUYEN); ra = tronTuThe(st.tu, P, st.k); }
    st.cuoi = ra;
    return ra;
  };

  // ---------- vẽ ----------
  // Ảnh một màu (chớp trắng, nhuộm băng, độc), nhớ theo màu. Đây là "canvas phụ".
  function nhuom(rig, col) {
    let cv = rig.mau[col];
    if (!cv && typeof document !== 'undefined') {
      cv = document.createElement('canvas'); cv.width = rig.img.width; cv.height = rig.img.height;
      const x = cv.getContext('2d'); x.drawImage(rig.img, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, cv.width, cv.height);
      rig.mau[col] = cv;
    }
    return cv;
  }
  C.nhuom = nhuom;

  // Ma trận [a, b, c, d, e, f] (giống canvas): x' = a x + c y + e, y' = b x + d y + f
  const nhan = (M, N) => [M[0] * N[0] + M[2] * N[1], M[1] * N[0] + M[3] * N[1], M[0] * N[2] + M[2] * N[3], M[1] * N[2] + M[3] * N[3], M[0] * N[4] + M[2] * N[5] + M[4], M[1] * N[4] + M[3] * N[5] + M[5]];
  const T = (x, y) => [1, 0, 0, 1, x, y];
  const R = (a) => { const c = Math.cos(a), s = Math.sin(a); return [c, s, -s, c, 0, 0]; };
  const S = (x, y) => [x, 0, 0, y, 0, 0];

  // Ma trận của từng mảnh trong hệ toạ độ "tư thế ráp" (chưa co, chưa đặt vào màn).
  C.maTran = function (rig, P) {
    const out = {}, H = rig.H, g = P.g, gx = rig.goc[0], gy = rig.goc[1];
    // cả người: nhún/co giãn và nghiêng quanh điểm chân
    const goc = nhan(nhan(nhan(T(gx + g.dx * H, gy + g.dy * H), R(g.rot)), S(g.sx, g.sy)), T(-gx, -gy));
    for (const p of rig.thuTu) {
      const q = P.m[p.ten] || { a: 0, dx: 0, dy: 0 };
      const cha = p.cha ? out[p.cha] : goc;
      out[p.ten] = nhan(cha, nhan(nhan(T(p.truc[0] + q.dx * H, p.truc[1] + q.dy * H), R(q.a)), T(-p.truc[0], -p.truc[1])));
    }
    return out;
  };
  // Điểm (toạ độ tư thế ráp) gắn với mảnh ten, sau khi tạo dáng -> toạ độ tư thế ráp mới.
  C.diem = function (M, ten, x, y) { const m = M[ten]; if (!m) return [x, y]; return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]; };
  C.goc = function (M, ten) { const m = M[ten]; return m ? Math.atan2(m[1], m[0]) : 0; };

  // Vẽ. (x, y) = điểm chân trên ctx (đơn vị hiện tại của ctx).
  // opts: anim, u, t, flip (true = quay TRÁI), scale (nhân thêm), cao (ghi đè chiều cao), flash, alpha, tint, bong (vẽ bóng), pose (tư thế tính sẵn),
  //       sauManh(ctx, rig, M, k): gọi sau khi vẽ xong (ctx đang ở hệ toạ độ tư thế ráp, k = số co) để vẽ thêm (ví dụ vũ khí game).
  C.draw = function (ctx, rig, x, y, opts) {
    if (!ctx || !rig || !rig.ready || !rig.img) return false;
    opts = opts || {};
    const P = opts.pose || C.pose(rig, opts.anim || 'idle', opts.u || 0, opts.t != null ? opts.t : (G.time || 0));
    const k = ((opts.cao > 0 ? opts.cao : rig.cao) / rig.H) * (opts.scale > 0 ? opts.scale : 1);
    const alpha = clamp((opts.alpha == null ? 1 : +opts.alpha) * P.g.alpha, 0, 1);
    if (alpha <= 0.003) return true;
    const flash = clamp(Math.max(opts.flash || 0, P.g.flash || 0), 0, 1);
    const M = C.maTran(rig, P);
    ctx.save();
    if (opts.bong) {
      const w = rig.W * k * 0.62 * (P.g.sx || 1);
      ctx.save(); ctx.globalAlpha *= 0.28 * alpha; ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.ellipse(x, y, Math.max(2, w / 2), Math.max(1.5, w * 0.14), 0, 0, TAU); ctx.fill(); ctx.restore();
    }
    ctx.translate(x, y);
    ctx.scale(opts.flip ? -k : k, k);
    ctx.translate(-rig.goc[0], -rig.goc[1]);
    ctx.imageSmoothingEnabled = true;
    try { ctx.imageSmoothingQuality = 'high'; } catch (e) { /* trình duyệt cũ */ }
    const a0 = ctx.globalAlpha * alpha;
    const tint = opts.tint && opts.tint[1] > 0 ? opts.tint : null;
    const trang = flash > 0 ? nhuom(rig, '#ffffff') : null, mau = tint ? nhuom(rig, tint[0]) : null;
    for (const p of rig.veThuTu) {
      const m = M[p.ten];
      ctx.save();
      ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      const o = p.o;
      ctx.globalAlpha = a0;
      ctx.drawImage(rig.img, o[0], o[1], o[2], o[3], p.dat[0], p.dat[1], o[2], o[3]);
      if (p.nap && opts.banLe !== false) { ctx.beginPath(); ctx.arc(p.truc[0], p.truc[1], p.nap[0], 0, TAU); ctx.fillStyle = p.nap[1]; ctx.fill(); }
      if (mau) { ctx.globalAlpha = a0 * clamp(tint[1], 0, 1); ctx.drawImage(mau, o[0], o[1], o[2], o[3], p.dat[0], p.dat[1], o[2], o[3]); }
      if (trang) { ctx.globalAlpha = a0 * flash; ctx.drawImage(trang, o[0], o[1], o[2], o[3], p.dat[0], p.dat[1], o[2], o[3]); }
      ctx.restore();
      if (opts.giuaManh) { try { opts.giuaManh(ctx, rig, M, k, p); } catch (e) { /* bỏ qua */ } }
    }
    if (opts.sauManh) { ctx.globalAlpha = a0; try { opts.sauManh(ctx, rig, M, k); } catch (e) { /* bỏ qua */ } }
    ctx.restore();
    return true;
  };

  // ======================= NỐI VÀO GAME =======================
  // Chỉ nối khi thật sự có rig (không có tệp nào thì game y hệt như cũ). Công cụ ngoài nhúng riêng tệp này thì không có
  // G.monsterArt / G.art.hero nên phần này tự bỏ qua.
  // Chỉ đổi HÌNH: luật chơi, thời gian ra đòn, vùng báo trước, vệt chém, đạn... vẫn của game.

  // Điểm cầm vũ khí của mảnh tay trước (toạ độ tư thế ráp): mảnh có "cam" thì dùng, không thì lấy trung điểm cạnh xa trục nhất.
  function diemCam(rig) {
    const p = rig.tayTruoc; if (!p) return null;
    if (p._cam) return p._cam;
    const tm = P2(rig.tep && rig.tep.manh && rig.tep.manh[p.i] && rig.tep.manh[p.i].cam);
    if (tm) return (p._cam = tm);
    const x0 = p.dat[0], y0 = p.dat[1], w = p.o[2], h = p.o[3];
    let best = null, d = -1;
    for (const q of [[x0 + w / 2, y0 + h], [x0 + w / 2, y0], [x0, y0 + h / 2], [x0 + w, y0 + h / 2]]) {
      const dd = Math.hypot(q[0] - p.truc[0], q[1] - p.truc[1]); if (dd > d) { d = dd; best = q; }
    }
    // lùi vào trong một chút để vũ khí nằm trong lòng bàn tay
    return (p._cam = [p.truc[0] + (best[0] - p.truc[0]) * 0.85, p.truc[1] + (best[1] - p.truc[1]) * 0.85]);
  }
  C.diemCam = diemCam;

  // ---------- QUÁI ----------
  // Đổi tên cử động của game sang động tác chibi. D: thời lượng cử động trong game (giây).
  C.chonQuai = function (n, t, D) {
    D = D > 0 ? D : 0.6;
    const u = clamp(t / D, 0, 1);
    if (n === 'move') return { anim: 'move', u: 0, t: G.time || t };
    if (n === 'tele' || n === 'phase2' || n === 'phase3') return { anim: 'tele', u, t };
    if (n === 'atk') return { anim: 'atk', u, t };
    if (n === 'hit') return { anim: 'hit', u, t };
    if (n === 'stun') return { anim: 'hit', u: 0.35 + 0.12 * Math.sin(t * 9), t, flash: 0 };
    if (n === 'die') return { anim: 'die', u, t };
    if (n === 'spawn') { const k = seg(u, 0.1, 0.75); return { anim: 'idle', u: 0, t: G.time || t, alpha: k, dy: (1 - k) * 6 }; }
    if (/^chieu|^c\d$/.test(n)) return u < 0.4 ? { anim: 'tele', u: u / 0.4, t } : { anim: 'atk', u: (u - 0.4) / 0.6, t };
    return { anim: 'idle', u: 0, t: G.time || t };
  };
  let MA = null, maDraw0 = null;
  function noiQuai() {
    MA = G.monsterArt;
    if (!MA || MA._chibi || typeof MA.draw !== 'function') return;
    MA._chibi = true;
    maDraw0 = MA.draw;
    MA.drawTruocChibi = maDraw0;
    MA.draw = function (c, id, x, y, o) {
      const rig = C.choQuai(id);
      if (!rig) return maDraw0.call(MA, c, id, x, y, o);
      o = o || {};
      const n = o.anim || 'idle', t = Math.max(0, o.t || 0), D = (MA.dur && MA.dur(id, n)) || 0;
      let face = o.face || 0;
      if (!face) { const dir = o.dir == null ? Math.PI : o.dir; face = Math.cos(dir) > 0.01 ? 1 : -1; }
      const s = C.chonQuai(n, t, D);
      const T0 = c.getTransform(), a0 = c.globalAlpha;
      const ve = () => {
        c.save(); c.setTransform(T0); c.globalAlpha = a0 * (s.alpha == null ? 1 : s.alpha);
        try { C.draw(c, rig, x, y + (s.dy || 0), { anim: s.anim, u: s.u, t: s.t, flip: face < 0, flash: s.flash === 0 ? 0 : (o.hit || 0) }); } finally { c.restore(); }
      };
      // Hình gốc vẫn vẽ bóng và hiệu ứng riêng của quái; chỗ vẽ thân (drawImage 3 tham số của tấm khung) thì vẽ chibi.
      let than = null;
      const gia = butGia(c, function (img, a, b) {
        if (arguments.length === 3 && img && img.width != null) {
          if (!than) { than = [img.width, img.height]; ve(); return; }
          if (img.width === than[0] && img.height === than[1]) return; // lớp nhuộm / chớp trắng của thân gốc
        }
        return c.drawImage.apply(c, arguments);
      });
      maDraw0.call(MA, gia, id, x, y, o);
    };
  }
  // Bút giả: chuyển mọi lệnh vẽ sang bút thật, riêng drawImage thì hỏi hàm thay.
  function butGia(c, thay) {
    if (typeof Proxy === 'undefined') return c;
    const nho = new Map();
    return new Proxy(c, {
      get(o, k) {
        if (k === 'drawImage') return thay;
        const v = o[k];
        if (typeof v !== 'function') return v;
        let f = nho.get(k);
        if (!f) { f = v.bind(o); nho.set(k, f); }
        return f;
      },
      set(o, k, v) { o[k] = v; return true; },
    });
  }

  // ---------- EM BÉ ----------
  C.chonEmBe = function (o) {
    const p = o.p, t = (o.t != null ? o.t : G.time) || 0;
    if (p && p.dead) return { anim: 'die', u: (p.deadT || 0) / 0.9, t };
    if (o.dodge >= 0) return { anim: 'roll', u: o.dodge, t };
    if (p && p.dashT > 0) return { anim: 'move', u: 0, t: t * 2 };
    if (p && p.specT > 0) return { anim: 'atk', u: 1 - p.specT / 0.35, t };
    if (p && p.castT > 0) return { anim: 'atk', u: 1 - p.castT / 0.4, t };
    if (p && p.mv && p.mv.holding && !(o.atk >= 0)) return { anim: 'tele', u: 1, t };
    if (o.atk >= 0) return { anim: 'atk', u: o.atk, t };
    if ((p && p.hurtT > 0) || (!p && o.flash)) return { anim: 'hit', u: p ? 1 - p.hurtT / 0.2 : 0.3, t };
    if (o.move) return { anim: 'move', u: 0, t };
    return { anim: 'idle', u: 0, t };
  };
  function emBeTint(o) {
    const p = o.p, st = p && p.st;
    if (st && st.ice > 0) return ['#9fd8ff', 0.45];
    if (st && st.poison > 0) return ['#7fd957', 0.4];
    return null;
  }
  function noiEmBe() {
    const A = G.art;
    if (!A || !A.hero || A._chibi) return;
    A._chibi = true;
    const hero0 = A.hero;
    A.heroTruocChibi = hero0;
    A.hero = function (c, o) {
      const rig = C.choEmBe(o && o.key);
      if (!rig || !o) return hero0.call(A, c, o);
      let fr = null;
      try { fr = G.tinhLinh && G.tinhLinh.frame ? G.tinhLinh.frame(o) : null; } catch (e) { fr = null; }
      const s = C.chonEmBe(o), P = s.anim === 'die' ? C.pose(rig, s.anim, s.u, s.t) : C.poseMuot(o.p || null, rig, s.anim, s.u, s.t);
      if (s.anim === 'die') P.g.alpha = 1; // em bé ngã thì nằm yên, không mờ biến mất
      const M = C.maTran(rig, P);
      const k = rig.cao / rig.H, f = o.face < 0 ? -1 : 1, x = o.x || 0, y = o.y || 0;
      const flash = (o.flash || (o.p && o.p.hurtT > 0)) ? 0.6 : 0;
      c.save();
      if (o.alpha != null) c.globalAlpha *= o.alpha;
      if (!o.noShadow && !(o.p && o.p.dead)) {
        const sw = rig.W * k * 0.34 * (P.g.sx || 1);
        c.save(); c.globalAlpha *= 0.3; c.fillStyle = '#000'; c.beginPath(); c.ellipse(x, y, Math.max(3, sw), Math.max(1.5, sw * 0.35), 0, 0, TAU); c.fill(); c.restore();
      }
      c.translate(x, y);
      c.scale(f, 1);
      // Vũ khí của game gắn vào tay trước (rig không có mảnh vũ khí riêng)
      const wp = fr && fr.weapon && !rig.coVuKhi && o.weapon ? fr.weapon : null;
      let veVk = null;
      if (wp) {
        const cam = diemCam(rig);
        let hx = wp.x, hy = wp.y;
        if (cam) { const q = C.diem(M, rig.tayTruoc.ten, cam[0], cam[1]); hx = (q[0] - rig.goc[0]) * k; hy = (q[1] - rig.goc[1]) * k; }
        veVk = () => {
          try {
            const WA = G.weaponArt; if (!WA || !WA.draw) return;
            const wo = WA.fromWeapon ? WA.fromWeapon(o.weapon, { mood: o.wmood || wp.mood, t: s.t }) : o.weapon;
            if (o.weapon.coat && !wo.branch) { wo.branch = o.weapon.coat; wo.stage = 1; }
            if (wp.sx != null) { c.save(); c.translate(hx, hy); c.scale(wp.sx, 1); try { WA.draw(c, wo, 0, 0, wp.ang, wp.pull); } finally { c.restore(); } }
            else WA.draw(c, wo, hx, hy, wp.ang, wp.pull);
          } catch (e) { /* thiếu hình vũ khí thì bỏ qua */ }
        };
      }
      if (veVk && !wp.front) veVk();
      C.draw(c, rig, 0, 0, { pose: P, flash, tint: emBeTint(o) });
      if (veVk && wp.front) veVk();
      c.restore();
    };
  }

  function noi(rig) {
    if (!rig) return;
    if (rig.doi === 'em-be') noiEmBe(); else noiQuai();
  }
  C.onAdd = noi;

  // Tệp do game/build.py nhúng vào bản đóng gói (mảng G.chibiRigData).
  C.napSan = function () {
    if (Array.isArray(G.chibiRigData)) { for (const t of G.chibiRigData) C.add(t); delete G.chibiRigData; }
  };
  C.napSan();
})();
