/* =====================================================================
   lam48-rig.js — Rig 2D pixel-perfect cho Lam 48×48 (dùng chung: Rig Lab 2D trên trình duyệt
   và tools/in-lam48.py chạy bằng Node).
   - Bộ phận: art/nhan-vat/lam-48/bo-phan-48/bo-phan.json (tạo bởi tools/lam48_bo_phan.py)
   - Xoay bộ phận bằng RotSprite: phóng EPX/Scale2x ×8 → xoay nearest → thu nhỏ, chọn màu đa số
   - Xương cha–con, IK 2 khớp cho tay/chân, áo choàng + chuông có quán tính (trễ 1–2 khung)
   - Dọn viền sau khi ghép: viền ngoài 1px liền, bỏ điểm lẻ, bỏ viền đôi
   Góc: độ, DƯƠNG = ngược chiều kim đồng hồ trên màn hình. Tay/chân thõng: + = vung ra trước;
   thân/đầu: âm = cúi tới trước; kiếm: góc tuyệt đối, 0 = chĩa sang phải, 90 = chĩa lên.
   ===================================================================== */
(function (root) {
'use strict';
var L48 = {};
var KEYS = '.OkcmgdGLWbyw';            // chỉ số 0 = trong suốt
var IDX = {}; for (var i = 0; i < KEYS.length; i++) IDX[KEYS[i]] = i;
L48.KEYS = KEYS; L48.IDX = IDX;
var O = IDX.O, W_ = IDX.W, L_ = IDX.L, G_ = IDX.G, y_ = IDX.y, w_ = IDX.w, b_ = IDX.b, g_ = IDX.g, m_ = IDX.m, d_ = IDX.d;
var CELL = 48;
var D2R = Math.PI / 180;

/* ---------------- chuẩn bị bộ phận ---------------- */
L48.chuanBi = function (data) {
  var rig = { data: data, parts: {}, pal: [], cache: {} };
  rig.pal.push(null);
  for (var k = 1; k < KEYS.length; k++) {
    var hx = data.pal[KEYS[k]];
    rig.pal.push([parseInt(hx.substr(0, 2), 16), parseInt(hx.substr(2, 2), 16), parseInt(hx.substr(4, 2), 16)]);
  }
  for (var n in data.parts) {
    var q = data.parts[n], d = new Uint8Array(q.w * q.h);
    for (var y = 0; y < q.h; y++) for (var x = 0; x < q.w; x++) d[y * q.w + x] = IDX[q.rows[y][x]] || 0;
    rig.parts[n] = { n: n, w: q.w, h: q.h, d: d, o: q.o, p: q.p, j: q.j,
      plx: q.p[0] - q.o[0], ply: q.p[1] - q.o[1], up: null };
  }
  return rig;
};
/* Thay dữ liệu điểm ảnh 1 bộ phận (Rig Lab đọc từ ảnh data URI) */
L48.datDiemAnh = function (rig, n, d) { var P = rig.parts[n]; P.d = d; P.up = null; for (var k in rig.cache) if (k.indexOf(n + '|') === 0) delete rig.cache[k]; };

/* EPX / Scale2x */
function epx(s, w, h) {
  var W2 = w * 2, o = new Uint8Array(W2 * h * 2);
  for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
    var P = s[y * w + x],
      A = y > 0 ? s[(y - 1) * w + x] : P, B = x < w - 1 ? s[y * w + x + 1] : P,
      C = x > 0 ? s[y * w + x - 1] : P, D = y < h - 1 ? s[(y + 1) * w + x] : P;
    var e0 = P, e1 = P, e2 = P, e3 = P;
    if (C === A && C !== D && A !== B) e0 = A;
    if (A === B && A !== C && B !== D) e1 = B;
    if (D === C && D !== B && C !== A) e2 = C;
    if (B === D && B !== A && D !== C) e3 = D;
    var i0 = (y * 2) * W2 + x * 2;
    o[i0] = e0; o[i0 + 1] = e1; o[i0 + W2] = e2; o[i0 + W2 + 1] = e3;
  }
  return o;
}
function up8(P) {
  if (P.up) return P.up;
  var d = P.d, w = P.w, h = P.h;
  for (var k = 0; k < 3; k++) { d = epx(d, w, h); w *= 2; h *= 2; }
  P.up = { d: d, w: w, h: h };
  return P.up;
}
function chuanGoc(a) { a = Math.round(a) % 360; if (a < -180) a += 360; if (a >= 180) a -= 360; return a; }

/* Xoay 1 bộ phận quanh khớp của nó. Kết quả: ảnh nhỏ + (ox,oy) = vị trí góc trên-trái so với khớp */
function xoay(rig, n, deg) {
  var a = chuanGoc(deg), key = n + '|' + a;
  if (rig.cache[key]) return rig.cache[key];
  var P = rig.parts[n], r;
  if (a === 0) {
    r = { w: P.w, h: P.h, d: P.d, ox: -P.plx, oy: -P.ply, xoay: false };
  } else {
    var U = up8(P), c = Math.cos(a * D2R), s = Math.sin(a * D2R);
    var xs = [], ys = [], cx = [0, P.w, 0, P.w], cy = [0, 0, P.h, P.h];
    for (var k = 0; k < 4; k++) { var X = cx[k] - P.plx, Y = cy[k] - P.ply; xs.push(X * c + Y * s); ys.push(-X * s + Y * c); }
    var x0 = Math.floor(Math.min.apply(null, xs)) - 1, x1 = Math.ceil(Math.max.apply(null, xs)) + 1;
    var y0 = Math.floor(Math.min.apply(null, ys)) - 1, y1 = Math.ceil(Math.max.apply(null, ys)) + 1;
    var w = x1 - x0, h = y1 - y0, d = new Uint8Array(w * h);
    var OFF = [[0, 0, 2], [-0.25, -0.25, 1], [0.25, -0.25, 1], [-0.25, 0.25, 1], [0.25, 0.25, 1]];
    var votes = new Float32Array(KEYS.length);
    for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) {
      votes.fill(0); var center = 0;
      for (var t = 0; t < OFF.length; t++) {
        var px = x0 + i + 0.5 + OFF[t][0], py = y0 + j + 0.5 + OFF[t][1];
        var lx = P.plx + (px * c - py * s), ly = P.ply + (px * s + py * c);
        var u = Math.floor(lx * 8), v = Math.floor(ly * 8), col = 0;
        if (u >= 0 && v >= 0 && u < U.w && v < U.h) col = U.d[v * U.w + u];
        votes[col] += OFF[t][2]; if (t === 0) center = col;
      }
      var best = center, bv = votes[center];
      for (var q = 0; q < votes.length; q++) if (votes[q] > bv) { bv = votes[q]; best = q; }
      d[j * w + i] = best;
    }
    // dọn trong bộ phận: điểm lẻ khác màu mà cả 4 bên giống nhau → lấy màu bên
    var e = new Uint8Array(d);
    for (j = 0; j < h; j++) for (i = 0; i < w; i++) {
      var v0 = d[j * w + i]; if (!v0) continue;
      var nb = [i > 0 ? d[j * w + i - 1] : 0, i < w - 1 ? d[j * w + i + 1] : 0, j > 0 ? d[(j - 1) * w + i] : 0, j < h - 1 ? d[(j + 1) * w + i] : 0];
      if (v0 !== W_ && v0 !== y_ && v0 !== w_ && nb[0] && nb[0] === nb[1] && nb[1] === nb[2] && nb[2] === nb[3] && nb[0] !== v0) e[j * w + i] = nb[0];
    }
    r = { w: w, h: h, d: e, ox: x0, oy: y0, xoay: true };
  }
  rig.cache[key] = r;
  return r;
}
L48.xoay = xoay;

/* ---------------- hình học ---------------- */
function rot(vx, vy, a) { var c = Math.cos(a * D2R), s = Math.sin(a * D2R); return [vx * c + vy * s, -vx * s + vy * c]; }
function gocGiua(ux, uy, vx, vy) { return -Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy) / D2R; }
function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
function len(v) { return Math.hypot(v[0], v[1]); }
function dPart(rig, n, j) { var P = rig.parts[n]; return sub(P.j[j], P.p); }      // khớp con − khớp mình (tư thế chuẩn)
function restPivot(rig, n) { return rig.parts[n].p; }

/* IK 2 khớp: gốc S, đích T, xương 1 (n1→khớp j1), xương 2 (n2→khớp j2); uon = +1/−1 chọn phía khuỷu/gối.
   Trả góc THẾ GIỚI của 2 xương (so với hướng chuẩn của chúng). */
function ik(rig, S, T, n1, j1, n2, j2, uon) {
  var v1 = dPart(rig, n1, j1), v2 = dPart(rig, n2, j2), L1 = len(v1), L2 = len(v2);
  var dx = T[0] - S[0], dy = T[1] - S[1], dd = Math.hypot(dx, dy);
  dd = Math.max(Math.abs(L1 - L2) + 0.01, Math.min(L1 + L2 - 0.001, dd));
  var base = Math.atan2(dy, dx), cosA = (L1 * L1 + dd * dd - L2 * L2) / (2 * L1 * dd);
  var A = Math.acos(Math.max(-1, Math.min(1, cosA))) * (uon >= 0 ? 1 : -1);
  var e = [S[0] + Math.cos(base + A) * L1, S[1] + Math.sin(base + A) * L1];
  var a1 = gocGiua(v1[0], v1[1], e[0] - S[0], e[1] - S[1]);
  var a2 = gocGiua(v2[0], v2[1], T[0] - e[0], T[1] - e[1]);
  return [a1, a2];
}

/* ---------------- tư thế ----------------
   Tư thế "mềm" (do người/mã viết):
     x,y   dời thân (hông) so với chuẩn; goc  xoay cả người quanh hông
     than  góc thân; dau  góc đầu (so với thân)
     tayT:[x,y] đích tay trước (tọa độ khung, IK) hoặc tayTrenT/cangTayT (góc so với cha); uonT ±1
     tayS: tương tự cho tay sau (uonS)
     kiem  góc kiếm tuyệt đối; anKiem: true để ẩn
     chanT/chanS:[x,y] đích cổ chân (IK) hoặc duiT/ongT; giayT/giayS góc ủng TUYỆT ĐỐI (mặc định 0 = phẳng)
     gio   gió thổi áo (độ, âm = bay ra sau); ao1/ao2/chuong/vat: cộng thêm
     chuongTay: chuông cầm ở tay sau; tayTruoc: vẽ tay sau lên trước (giơ chuông)
     hieuUng: {vet, sang, song, tia, bui, hoi, tuLuc, nhay}
   Tư thế "cứng" (sau khi giải): toàn số góc, dùng để vẽ + xuất JSON keyframe. */
var GOC_KEYS = ['x', 'y', 'goc', 'hong', 'than', 'dau', 'tayTrenT', 'cangTayT', 'kiem', 'tayTrenS', 'cangTayS',
  'duiT', 'ongT', 'giayT', 'duiS', 'ongS', 'giayS', 'vat', 'ao1', 'ao2', 'chuong'];
L48.GOC_KEYS = GOC_KEYS;

function hip(t) { return [24 + (t.x || 0), 33 + (t.y || 0)]; }
function viTriCon(rig, cha, chaPos, chaGoc, j) { var v = dPart(rig, cha, j), r = rot(v[0], v[1], chaGoc); return [chaPos[0] + r[0], chaPos[1] + r[1]]; }

L48.giai = function (rig, t) {
  var g = {}; GOC_KEYS.forEach(function (k) { g[k] = 0; });
  g.x = t.x || 0; g.y = t.y || 0; g.goc = t.goc || 0; g.hong = t.hong || 0;
  g.than = t.than || 0; g.dau = t.dau || 0;
  var H = hip(g), thanW = g.goc + g.than;
  // tay
  ['T', 'S'].forEach(function (s) {
    var up = 'tayTren' + s, lo = 'cangTay' + s, vai = 'vai' + s;
    var S = viTriCon(rig, 'than', H, thanW, vai);
    if (t['tay' + s]) {
      var r = ik(rig, S, t['tay' + s], up, 'khuyu' + s, lo, 'nam' + s, t['uon' + s] == null ? 1 : t['uon' + s]);
      g[up] = r[0] - thanW; g[lo] = r[1] - r[0];
    } else { g[up] = t[up] || 0; g[lo] = t[lo] || 0; }
  });
  g.kiem = t.kiem == null ? 24 : t.kiem;
  // chân
  ['T', 'S'].forEach(function (s) {
    var dui = 'dui' + s, ong = 'ong' + s, giay = 'giay' + s;
    var hp = rot(rig.parts[dui].p[0] - 24 + (s === 'T' ? -g.hong : g.hong), rig.parts[dui].p[1] - 33, g.goc), Hs = [H[0] + hp[0], H[1] + hp[1]];
    var dich = t['chan' + s];
    if (!dich && !t.chanTu && t[dui] == null && t[ong] == null) dich = [rig.parts[ong].j['coChan' + s][0], rig.parts[ong].j['coChan' + s][1]];
    if (dich) {
      var r = ik(rig, Hs, dich, dui, 'goi' + s, ong, 'coChan' + s, t['uonChan' + s] == null ? -1 : t['uonChan' + s]);
      g[dui] = r[0] - g.goc; g[ong] = r[1] - r[0];
    } else { g[dui] = t[dui] || 0; g[ong] = t[ong] || 0; }
    var ongW = g.goc + g[dui] + g[ong];
    g[giay] = (t[giay] == null ? (t.giayTheo ? ongW : 0) : t[giay]) - ongW;   // lưu tương đối
  });
  g.vat = t.vat || 0; g.ao1 = t.ao1 || 0; g.ao2 = t.ao2 || 0; g.chuong = t.chuong || 0;
  g._gio = t.gio || 0; g._vx = t.vx || 0; g._vy = t.vy || 0; g._lacChuong = t.lacChuong || 0;
  g._co = { chuongTay: !!t.chuongTay, tayTruoc: !!t.tayTruoc, anKiem: !!t.anKiem, matTat: !!t.matTat, kiemSau: !!t.kiemSau, kiemLung: !!t.kiemLung };
  g._hu = t.hieuUng || null;
  return g;
};

/* Quán tính áo choàng / chuông / vạt áo trên cả chuỗi khung (đã giải). vong: lặp.
   Áo đi theo góc thân với độ trễ, cộng gió + vận tốc; đoạn 2 trễ thêm 1 nhịp. Chuông: con lắc. */
L48.quanTinh = function (rig, ds, vong, holds) {
  var n = ds.length; if (!n) return ds;
  var seq = [];
  for (var i = 0; i < n; i++) { var hh = holds ? holds[i] || 1 : 1; for (var k = 0; k < hh; k++) seq.push(i); }
  var N = seq.length, laps = vong ? 3 : 1;
  var a1 = null, a2 = null, bc = null, bv = 0, vv = null, out = {};
  for (var lap = 0; lap < laps; lap++) for (var s = 0; s < N; s++) {
    var i2 = seq[s], g = ds[i2], prev = ds[seq[(s - 1 + N) % N]];
    if (!vong && s === 0) prev = g;
    var thanW = g.goc + g.than, vy = (g.y - prev.y) + g._vy, vx = (g.x - prev.x) + g._vx;
    var dauW = thanW + g.dau;
    // áo: đích tuyệt đối
    var dich1 = thanW * 0.55 + g._gio - vx * 4.5 - vy * 3.5;
    var dich2 = dich1 * 1.1 - vx * 2.5 - vy * 3;
    if (a1 === null) { a1 = dich1; a2 = dich2; }
    a1 += (dich1 - a1) * 0.55;
    a2 += (a1 * 1.0 + (dich2 - dich1) - a2) * 0.45;
    // chuông: con lắc theo gia tốc đầu
    var dichB = -dauW * 0.6 - vx * 9 + g._lacChuong;
    if (bc === null) bc = dichB;
    bv = bv * 0.55 + (dichB - bc) * 0.5; bc += bv;
    var dv = (g.duiT + g.duiS) * 0.25;
    if (vv === null) vv = dv;
    vv += (dv - vv) * 0.6;
    if (lap === laps - 1) out[i2] = [a1, a2, bc, vv];
  }
  ds.forEach(function (g, i) {
    var o = out[i] || [0, 0, 0, 0], thanW = g.goc + g.than;
    g.ao1 += Math.max(-75, Math.min(16, o[0] - thanW));
    g.ao2 += Math.max(-50, Math.min(50, o[1] - o[0]));
    g.chuong += Math.max(-70, Math.min(70, o[2]));
    g.vat += Math.max(-25, Math.min(25, o[3])) ;
  });
  return ds;
};

/* ---------------- vẽ 1 khung ---------------- */
function blit(buf, own, rot_, r, X, Y, id, isRot) {
  for (var j = 0; j < r.h; j++) for (var i = 0; i < r.w; i++) {
    var v = r.d[j * r.w + i]; if (!v) continue;
    var x = X + r.ox + i, y = Y + r.oy + j;
    if (x < 0 || y < 0 || x >= CELL || y > 45) continue;   // không vẽ dưới mặt đất
    buf[y * CELL + x] = v; own[y * CELL + x] = id; rot_[y * CELL + x] = isRot ? 1 : 0;
  }
}
L48.ve = function (rig, g, opt) {
  opt = opt || {};
  var buf = new Uint8Array(CELL * CELL), own = new Uint8Array(CELL * CELL), rt = new Uint8Array(CELL * CELL);
  var co = g._co || {};
  var H = hip(g), thanW = g.goc + g.than;
  var W = {}, A = {};   // vị trí khớp (đã làm tròn) + góc thế giới của từng bộ phận
  function R2(p) { return [Math.round(p[0]), Math.round(p[1])]; }
  A.than = thanW; W.than = R2(H);
  function con(n, cha, j, goc) { W[n] = R2(viTriCon(rig, cha, W[cha], A[cha], j)); A[n] = goc; }
  con('dau', 'than', 'co', thanW + g.dau);
  con('tayTrenT', 'than', 'vaiT', thanW + g.tayTrenT); con('cangTayT', 'tayTrenT', 'khuyuT', A.tayTrenT + g.cangTayT);
  con('tayTrenS', 'than', 'vaiS', thanW + g.tayTrenS); con('cangTayS', 'tayTrenS', 'khuyuS', A.tayTrenS + g.cangTayS);
  // kiếm: góc tuyệt đối, chuôi ở nắm tay trước (kiếm vẽ nằm ngang ⇒ góc 0 = phải)
  if (co.kiemLung) { var kl = rot(4, -3, thanW); W.kiem = R2([W.than[0] + kl[0], W.than[1] + kl[1]]); A.kiem = thanW + 197; }
  else con('kiem', 'cangTayT', 'namT', g.kiem);
  con('ao1', 'than', 'aoGoc', thanW + g.ao1); con('ao2', 'ao1', 'aoGiua', A.ao1 + g.ao2);
  if (co.chuongTay) { W.chuong = R2(viTriCon(rig, 'cangTayS', W.cangTayS, A.cangTayS, 'namS')); W.chuong[1] -= 1; A.chuong = g.chuong * 0.5; }
  else con('chuong', 'dau', 'moc', g.chuong);
  ['T', 'S'].forEach(function (s) {
    var hp = rot(rig.parts['dui' + s].p[0] - 24 + (s === 'T' ? -g.hong : g.hong), rig.parts['dui' + s].p[1] - 33, g.goc);
    W['dui' + s] = R2([H[0] + hp[0], H[1] + hp[1]]); A['dui' + s] = g.goc + g['dui' + s];
    con('ong' + s, 'dui' + s, 'goi' + s, A['dui' + s] + g['ong' + s]);
    con('giay' + s, 'ong' + s, 'coChan' + s, A['ong' + s] + g['giay' + s]);
  });
  W.vat = R2(H); A.vat = g.goc + g.vat;
  var lop = rig.data.lop.slice();
  if (co.tayTruoc) { lop = lop.filter(function (n) { return n !== 'tayTrenS' && n !== 'cangTayS'; }); var iD = lop.indexOf('chuong'); lop.splice(iD + 1, 0, 'tayTrenS', 'cangTayS'); }
  if (co.chuongTay) { lop = lop.filter(function (n) { return n !== 'chuong'; }); lop.splice(lop.indexOf('cangTayS') + 1, 0, 'chuong'); }
  if (co.kiemSau) { lop = lop.filter(function (n) { return n !== 'kiem'; }); lop.splice(lop.indexOf('than'), 0, 'kiem'); }
  if (co.kiemLung) { lop = lop.filter(function (n) { return n !== 'kiem'; }); lop.splice(lop.indexOf('than') + 1, 0, 'kiem'); }
  if (co.anKiem) lop = lop.filter(function (n) { return n !== 'kiem'; });
  var ids = {};
  lop.forEach(function (n, k) {
    ids[n] = k + 1;
    var r = xoay(rig, n, A[n]);
    blit(buf, own, rt, r, W[n][0], W[n][1], k + 1, r.xoay);
  });
  // mắt sáng trong bóng mũ (luôn 1 điểm W, thêm 1 điểm L)
  if (!co.matTat) {
    var em = rot(29 - 24, 14 - 19, A.dau); var ex = Math.round(W.dau[0] + em[0]), ey = Math.round(W.dau[1] + em[1]);
    if (ex >= 0 && ey >= 0 && ex < CELL && ey < CELL && own[ey * CELL + ex] === ids.dau && buf[ey * CELL + ex] !== 0) buf[ey * CELL + ex] = W_;
  } else {
    for (var q = 0; q < buf.length; q++) if (own[q] === ids.dau && (buf[q] === W_ || buf[q] === L_)) {
      var qx = q % CELL, qy = (q / CELL) | 0, em2 = rot(29 - 24, 14 - 19, A.dau);
      if (Math.abs(qx - (W.dau[0] + em2[0])) < 2.5 && Math.abs(qy - (W.dau[1] + em2[1])) < 2.5) buf[q] = O;
    }
  }
  if (opt.donVien !== false) donVien(buf, own, rt);
  var hu = g._hu;
  if (hu) hieuUng(rig, buf, own, ids, W, A, g, hu);
  return { d: buf, khop: W, goc: A, ids: ids, own: own };
};

/* ---------------- dọn viền ---------------- */
function at4(s, x, y) { return (x < 0 || y < 0 || x >= CELL || y >= CELL) ? 0 : s[y * CELL + x]; }
function donVien(buf, own, rt) {
  var N = CELL, i, x, y;
  function at(x, y) { return (x < 0 || y < 0 || x >= N || y >= N) ? 0 : buf[y * N + x]; }
  // 1) viền ngoài liên tục: điểm có màu giáp nền (4 hướng) → viền
  var s = new Uint8Array(buf);
  for (y = 0; y < N; y++) for (x = 0; x < N; x++) {
    i = y * N + x; var v = s[i]; if (!v || v === O) continue;
    var sx = function (a, b) { return (a < 0 || b < 0 || a >= N || b >= N) ? 0 : s[b * N + a]; };
    if (!sx(x - 1, y) || !sx(x + 1, y) || !sx(x, y - 1) || !sx(x, y + 1)) buf[i] = O;
  }
  // 2) bỏ điểm lẻ (không có hàng xóm 8 hướng) và gai viền 1 điểm
  s = new Uint8Array(buf);
  for (y = 0; y < N; y++) for (x = 0; x < N; x++) {
    i = y * N + x; if (!s[i]) continue;
    var c8 = 0, last = 0;
    for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue; var xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < N && yy < N && s[yy * N + xx]) { c8++; last = s[yy * N + xx]; }
    }
    var c4 = (at4(s, x - 1, y) ? 1 : 0) + (at4(s, x + 1, y) ? 1 : 0) + (at4(s, x, y - 1) ? 1 : 0) + (at4(s, x, y + 1) ? 1 : 0);
    if (c8 === 0) buf[i] = 0;
    else if (s[i] === O && c4 <= 1 && c8 <= 2 && rt[i]) buf[i] = 0;          // răng cưa / gai của bộ phận xoay
    else if (c8 === 1 && s[i] === O && last === O) buf[i] = 0;
  }
  // 3) viền đôi: điểm viền ngoài mà mọi hàng xóm có màu (4 hướng) đều là viền, và
  //    (a) hàng xóm trong thuộc BỘ PHẬN KHÁC (2 viền chồng nhau), hoặc
  //    (b) góc chữ L răng cưa của bộ phận vừa xoay; bỏ được mà không đứt viền.
  s = new Uint8Array(buf);
  var RX = [-1, 0, 1, 1, 1, 0, -1, -1], RY = [-1, -1, -1, 0, 1, 1, 1, 0];
  var S = function (a, b) { return (a < 0 || b < 0 || a >= N || b >= N) ? 0 : s[b * N + a]; };
  for (y = 0; y < N; y++) for (x = 0; x < N; x++) {
    i = y * N + x; if (s[i] !== O) continue;
    var n4 = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]], empty = 0, filled = [], ok = true;
    n4.forEach(function (p) { var v = S(p[0], p[1]); if (!v) empty++; else { filled.push(p); if (v !== O) ok = false; } });
    if (!ok || !empty || filled.length < 2) continue;
    // liên thông vòng 8
    var ring = []; for (var k = 0; k < 8; k++) ring.push(S(x + RX[k], y + RY[k]) ? 1 : 0);
    var trans = 0; for (k = 0; k < 8; k++) if (ring[k] && !ring[(k + 1) % 8]) trans++;
    if (trans !== 1) continue;
    var khac = false, lgoc = false;
    filled.forEach(function (p) { var o2 = own[p[1] * N + p[0]]; if (o2 !== own[i]) khac = true; });
    if (filled.length === 2 && rt[i]) {
      var a = filled[0], b = filled[1];
      if (a[0] !== b[0] && a[1] !== b[1]) {   // vuông góc → góc L
        var cxn = a[0] + b[0] - x, cyn = a[1] + b[1] - y, cv = S(cxn, cyn);
        if (cv && cv !== O) lgoc = true;
      }
    }
    if (khac || lgoc) buf[i] = 0;
  }
}
L48.donVien = donVien;

/* ---------------- hiệu ứng (vẽ sau khi dọn viền, không viền) ---------------- */
function put(buf, x, y, c, chiTrong) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= CELL || y >= CELL) return;
  if (chiTrong && buf[y * CELL + x]) return;
  buf[y * CELL + x] = c;
}
function hieuUng(rig, buf, own, ids, W, A, g, hu) {
  var grip = W.kiem;
  if (hu.vet != null) {   // vệt chém: cung từ góc vet → góc kiếm hiện tại, quanh nắm tay
    var a0 = hu.vet, a1 = A.kiem, r = hu.r || 17, cx = hu.cx != null ? hu.cx : grip[0], cy = hu.cy != null ? hu.cy : grip[1];
    var span = a1 - a0, steps = Math.ceil(Math.abs(span) * D2R * r * 2) + 2;
    for (var t = 0; t <= steps; t++) {
      var u = t / steps, th = u < 0.3 ? 1 : u < 0.7 ? 2 : 3, an = (a0 + span * u) * D2R;
      for (var l = 0; l < th + (hu.day || 0); l++) {
        var rr = r - l, col = l === 0 ? W_ : l === 1 ? L_ : G_;
        put(buf, cx + Math.cos(an) * rr, cy - Math.sin(an) * rr * (hu.det || 1), col, true);
      }
    }
  }
  if (hu.sang) {   // chuông sáng #CEF0D6
    for (var q = 0; q < buf.length; q++) if (own[q] === ids.chuong) {
      var v = buf[q]; if (v === y_ || v === w_) buf[q] = W_; else if (v === b_) buf[q] = L_;
    }
    for (q = 0; q < buf.length; q++) if (own[q] === ids.chuong && buf[q]) {
      var hx = q % CELL, hy = (q / CELL) | 0;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (o) { put(buf, hx + o[0] * 2, hy + o[1] * 2, L_, true); });
    }
  }
  if (hu.song) {   // vòng tiếng vọng quanh chuông
    var P = W.chuong, cxs = P[0], cys = P[1] + 5;
    [].concat(hu.song).forEach(function (R, k) {
      var n = Math.max(8, Math.round(R * 6));
      for (var t2 = 0; t2 < n; t2++) { if ((t2 + k) % 4 === 3) continue; var an2 = t2 / n * Math.PI * 2; put(buf, cxs + Math.cos(an2) * R, cys + Math.sin(an2) * R * 0.85, k ? L_ : W_, k > 0); }
    });
  }
  if (hu.tia) {    // tia lóe (đỡ đòn): [x,y,cỡ]
    var tx = hu.tia[0], ty = hu.tia[1], ts = hu.tia[2] || 3;
    for (var s2 = -ts; s2 <= ts; s2++) { put(buf, tx + s2, ty, Math.abs(s2) < 2 ? W_ : L_); put(buf, tx, ty + s2, Math.abs(s2) < 2 ? W_ : L_); }
    put(buf, tx - 1, ty - 1, W_); put(buf, tx + 1, ty + 1, W_); put(buf, tx + 1, ty - 1, L_); put(buf, tx - 1, ty + 1, L_);
  }
  if (hu.bui) {    // bụi chân: [x, độ loang]
    var bx = hu.bui[0], bs = hu.bui[1] || 4;
    for (var k2 = 0; k2 < bs; k2++) { put(buf, bx - 2 - k2 * 2, 45 - (k2 % 2), k2 % 2 ? m_ : g_, true); put(buf, bx + 2 + k2 * 2, 45 - ((k2 + 1) % 2), k2 % 2 ? g_ : m_, true); }
  }
  if (hu.hoi) {    // hồi máu: đốm sáng bay lên quanh người, hu.hoi = pha 0..1
    var ph = hu.hoi;
    [[14, 30], [33, 26], [18, 18], [36, 36], [12, 40], [30, 12]].forEach(function (p, k3) {
      var yy = p[1] - ((ph * 14 + k3 * 5) % 14); put(buf, p[0], yy, k3 % 2 ? L_ : W_, true); if (k3 % 3 === 0) put(buf, p[0], yy - 1, L_, true);
    });
  }
  if (hu.tuLuc) {  // tụ lực: đốm lóe dọc lưỡi kiếm
    var a = A.kiem * D2R, ph2 = hu.tuLuc;
    for (var k4 = 0; k4 < 4; k4++) {
      var dd = 7 + ((k4 * 4 + ph2 * 3) % 12), off = (k4 % 2 ? 2 : -2);
      put(buf, grip[0] + Math.cos(a) * dd - Math.sin(a) * off, grip[1] - Math.sin(a) * dd - Math.cos(a) * off, k4 % 2 ? L_ : W_, true);
    }
  }
}

/* ---------------- tiện ích ---------------- */
L48.rgba = function (rig, d, out, ox, oy, stride) {
  for (var y = 0; y < CELL; y++) for (var x = 0; x < CELL; x++) {
    var v = d[y * CELL + x], k = ((oy + y) * stride + ox + x) * 4;
    if (!v) { out[k + 3] = 0; continue; }
    var c = rig.pal[v]; out[k] = c[0]; out[k + 1] = c[1]; out[k + 2] = c[2]; out[k + 3] = 255;
  }
};
/* Giải + quán tính + vẽ cả 1 animation. sua: {i: {góc ghi đè}} (từ JSON keyframe Rig Lab) */
L48.dungAnim = function (rig, anim, sua) {
  var ds = anim.frames.map(function (f) { return L48.giai(rig, f.tt || {}); });
  L48.quanTinh(rig, ds, anim.loop, anim.frames.map(function (f) { return f.hold || 1; }));
  if (sua) for (var i in sua) if (ds[i]) for (var k in sua[i]) if (GOC_KEYS.indexOf(k) >= 0) ds[i][k] = sua[i][k];
  return ds.map(function (g) { return { g: g, r: L48.ve(rig, g) }; });
};
L48.CELL = CELL;

if (typeof module !== 'undefined' && module.exports) module.exports = L48;
root.TV = root.TV || {}; root.TV.L48 = L48;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
