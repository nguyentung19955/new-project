/* Tiếng Vọng Cuối Cùng – tileset vẽ bằng code (16×16, pixel thật, ghép liền mạch).
 * Dùng: <script src="lib/tiles.js"></script>  →  TV.tiles.taoAtlas(), TV.tiles.veBanDo(ctx, luoi, camX, camY)
 * Ký hiệu lưới: '#' đất, 'S' đá, 'W' tường leo, '=' ván một chiều, 'H' thang, '|' dây, '^' gai,
 *               'o' công tắc (tắt), 'O' công tắc (bật), 'D' cửa chuông đóng, 'd' cửa chuông mở, '.' trống.
 * Autotile: 16 kiểu theo 4 hướng (B=1 Đ=2 N=4 T=8: Bắc/Đông/Nam/Tây có khối) + 4 góc trong phủ thêm.
 */
(function () {
  'use strict';
  var TV = (window.TV = window.TV || {});
  var T = 16;

  var C = {
    vien: '#0C0F14',
    dat0: '#3B2A1E', dat1: '#5A3F2B', dat2: '#7A5A3A',
    da0: '#3A3A40', da1: '#5C5A5E', da2: '#8A8686', vua: '#26262C',
    reu0: '#21413A', reu1: '#32804F',
    go0: '#5A3F2B', go1: '#7A5A3A', go2: '#9A7A55',
    sat: '#2A2C33',
    dong: '#E1B85A', dongToi: '#9C6B30', kem: '#F3E6C8',
    mau: '#6E2F28'
  };

  /* ---------- tiện ích ---------- */
  function hash(x, y, s) {
    var h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (h ^ (h >>> 16)) >>> 0;
  }
  function rng(seed) {
    var s = (seed >>> 0) || 1;
    return function () {
      s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }
  function Buf() { this.p = new Array(T * T).fill(null); }
  Buf.prototype.set = function (x, y, c) { if (x >= 0 && y >= 0 && x < T && y < T) this.p[y * T + x] = c; };
  Buf.prototype.get = function (x, y) { return (x >= 0 && y >= 0 && x < T && y < T) ? this.p[y * T + x] : null; };
  Buf.prototype.rect = function (x, y, w, h, c) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.set(x + i, y + j, c); };

  var B = 1, D = 2, N = 4, TY = 8; // Bắc, Đông, Nam, Tây

  /* ---------- nền vật liệu (phần đặc, không viền) ---------- */
  function nenDat(b, v) {
    var r = rng(hash(v, 11, 7));
    for (var y = 0; y < T; y++) for (var x = 0; x < T; x++) {
      var k = r(), c = C.dat1;
      if (k < 0.09) c = C.dat0; else if (k < 0.15) c = C.dat2;
      b.set(x, y, c);
    }
    // vệt đất tối ngang ngắn
    for (var i = 0; i < 3; i++) { var vx = 2 + ((r() * 10) | 0), vy = 2 + ((r() * 12) | 0); b.set(vx, vy, C.dat0); b.set(vx + 1, vy, C.dat0); }
    // đá tròn nằm trong đất (luôn cách mép ≥1 px để không cắt ngang mép)
    var soDa = [1, 2, 0, 1][v];
    for (var s = 0; s < soDa; s++) {
      var cx = 3 + ((r() * 10) | 0), cy = 4 + ((r() * 9) | 0), rr = r() < 0.5 ? 2 : 1;
      for (var dy = -rr - 1; dy <= rr + 1; dy++) for (var dx = -rr - 1; dx <= rr + 1; dx++) {
        var d = dx * dx + dy * dy;
        if (d <= rr * rr + 1) b.set(cx + dx, cy + dy, (dx + dy <= -rr) ? C.da2 : (dx + dy >= rr ? C.da0 : C.da1));
        else if (d <= (rr + 1) * (rr + 1) + 1 && dy >= 0) b.set(cx + dx, cy + dy, C.dat0);
      }
    }
    if (v === 2) { b.set(6, 9, C.reu0); b.set(7, 9, C.reu0); b.set(7, 8, C.reu1); } // mầm rêu nhỏ
  }

  // Đá: mẫu khối tròn tuần hoàn 16 px (tính theo hình xuyến) nên luôn khớp mép.
  function laVua(x, y) {
    x = (x + T) % T; y = (y + T) % T;
    if (y === 7 || y === 15) return true;
    if (y < 7) return x === 5 || x === 13;
    return x === 1 || x === 9;
  }
  function nenDa(b, v) {
    for (var y = 0; y < T; y++) for (var x = 0; x < T; x++) {
      if (laVua(x, y)) { b.set(x, y, C.vua); continue; }
      var L = laVua(x - 1, y), U = laVua(x, y - 1), R = laVua(x + 1, y), Dn = laVua(x, y + 1);
      var c = C.da1;
      if ((L && U) || (R && Dn) || (L && Dn) || (R && U)) c = C.vua;      // bo tròn góc khối
      else if (L || U) c = C.da2;
      else if (R || Dn) c = C.da0;
      // biến thể chỉ đổi khối nằm trọn trong ô (hàng trên x6..12, hàng dưới x2..8)
      var trongA = y < 7 && x >= 6 && x <= 12, trongB = y > 7 && x >= 2 && x <= 8;
      if (v === 1 && trongA && c === C.da1) c = C.da0;
      if (v === 3 && trongB && c === C.da1) c = C.da0;
      b.set(x, y, c);
    }
    if (v === 2) { b.set(8, 3, C.vua); b.set(9, 4, C.vua); b.set(9, 5, C.vua); } // vết nứt
    if (v === 3) { b.set(4, 15, C.reu0); b.set(5, 15, C.reu1); b.set(6, 15, C.reu0); b.set(9, 11, C.reu0); } // rêu trong khe
  }

  // Tường leo: vân dọc rõ (rãnh – sáng – thân – thân) + mấu bám ngang, khác hẳn đất/đá.
  function nenTuong(b, v) {
    var cot = [C.vua, C.da2, C.da1, C.da0];
    for (var y = 0; y < T; y++) for (var x = 0; x < T; x++) b.set(x, y, cot[x % 4]);
    // mấu bám: 2 mấu mỗi ô, so le, nằm trong ô
    var mau = [[2, 3], [10, 11]];
    for (var i = 0; i < 2; i++) {
      var mx = mau[i][0] + (v & 1) * 0, my = mau[i][1] - (v === 2 ? 2 : 0);
      b.set(mx, my, C.vien); b.set(mx + 1, my, C.vien); b.set(mx + 2, my, C.vien);
      b.set(mx, my - 1, C.go2); b.set(mx + 1, my - 1, C.go2); b.set(mx + 2, my - 1, C.go1);
    }
    if (v === 1 || v === 3) { // dây leo xanh tối bám rãnh
      var vx = v === 1 ? 4 : 12;
      for (var yy = 0; yy < T; yy++) b.set(vx, yy, (yy % 5 === 0) ? C.reu1 : C.reu0);
    }
  }

  var VL = {
    dat:   { nen: nenDat,   sang: C.dat2, toi: C.dat0, reu: 'day' },
    da:    { nen: nenDa,    sang: C.da2,  toi: C.da0,  reu: 'it'  },
    tuong: { nen: nenTuong, sang: C.da2,  toi: C.da0,  reu: 'it'  }
  };

  /* ---------- tile địa hình theo mặt nạ ---------- */
  function tileDiaHinh(ten, mask, v) {
    var vl = VL[ten], b = new Buf();
    vl.nen(b, v);
    var moB = !(mask & B), moD = !(mask & D), moN = !(mask & N), moT = !(mask & TY);
    var y, x;
    if (moT) for (y = 0; y < T; y++) { b.set(0, y, C.vien); b.set(1, y, vl.sang); }
    if (moD) for (y = 0; y < T; y++) { b.set(15, y, C.vien); b.set(14, y, vl.toi); }
    if (moN) for (x = 0; x < T; x++) { b.set(x, 15, C.vien); b.set(x, 14, vl.toi); }
    if (moB) {
      var x0 = moT ? 1 : 0, x1 = moD ? 14 : 15, r = rng(hash(v, mask, 31));
      for (x = x0; x <= x1; x++) {
        b.set(x, 0, C.vien);
        if (vl.reu === 'day') {
          // thảm rêu: mép ô (x=0,15) luôn sâu 4 để khớp ô bên cạnh
          var sau = (x <= 1 || x >= 14) ? 4 : 3 + (hash(x, v, 5) % 3);
          b.set(x, 1, C.reu1);
          b.set(x, 2, (hash(x, v, 9) % 3) ? C.reu1 : C.reu0);
          for (y = 3; y <= sau; y++) b.set(x, y, C.reu0);
          b.set(x, sau + 1, C.vien);
        } else {
          b.set(x, 1, C.da2);
          if (ten === 'tuong' || hash(x, v, 4) % 4 === 0) b.set(x, 1, C.reu1), b.set(x, 2, C.reu0);
        }
      }
      // rêu rủ dài (chỉ ở giữa ô, x 3..12)
      var soRu = vl.reu === 'day' ? 2 + (v % 2) : (v === 0 ? 0 : 1);
      for (var k = 0; k < soRu; k++) {
        var rx = 3 + ((r() * 10) | 0), dai = vl.reu === 'day' ? 3 + ((r() * 6) | 0) : 2 + ((r() * 3) | 0);
        var y0 = vl.reu === 'day' ? 5 : 2;
        for (y = y0; y < y0 + dai && y < 13; y++) b.set(rx, y, y === y0 + dai - 1 ? C.reu1 : C.reu0);
        b.set(rx, Math.min(y, 13), C.vien);
      }
      // rêu rủ xuống mép trái/phải khi là góc ngoài
      if (vl.reu === 'day') {
        if (moT) for (y = 2; y <= 6; y++) { b.set(1, y, y < 6 ? C.reu0 : C.reu1); b.set(2, y, y < 4 ? C.reu0 : b.get(2, y)); }
        if (moD) for (y = 2; y <= 7; y++) { b.set(14, y, y < 7 ? C.reu0 : C.reu1); }
      }
    }
    // góc ngoài bo tròn
    if (moB && moT) { b.set(0, 0, null); b.set(1, 0, null); b.set(0, 1, null); b.set(1, 1, C.vien); }
    if (moB && moD) { b.set(15, 0, null); b.set(14, 0, null); b.set(15, 1, null); b.set(14, 1, C.vien); }
    if (moN && moT) { b.set(0, 15, null); b.set(1, 15, null); b.set(0, 14, null); b.set(1, 14, C.vien); }
    if (moN && moD) { b.set(15, 15, null); b.set(14, 15, null); b.set(15, 14, null); b.set(14, 14, C.vien); }
    return b;
  }

  // Góc trong: phủ lên ô khi 2 cạnh kề có khối nhưng ô chéo trống. g: 'BD','BT','ND','NT'
  function tileGocTrong(ten, g) {
    var vl = VL[ten], b = new Buf();
    var fx = g.charAt(1) === 'D' ? function (x) { return 15 - x; } : function (x) { return x; };
    var fy = g.charAt(0) === 'N' ? function (y) { return 15 - y; } : function (y) { return y; };
    function p(x, y, c) { b.set(fx(x), fy(y), c); }
    p(0, 0, C.vien);
    if (g.charAt(0) === 'B') {
      // nối viền mép ô trên xuống và thảm rêu ô bên cạnh
      p(1, 0, g.charAt(1) === 'D' ? vl.toi : vl.sang);
      if (vl.reu === 'day') { p(0, 1, C.reu1); p(0, 2, C.reu0); p(0, 3, C.reu0); p(0, 4, C.reu0); p(0, 5, C.vien); p(1, 1, C.reu0); p(1, 2, C.reu0); }
      else { p(0, 1, C.da2); }
    } else {
      p(1, 0, g.charAt(1) === 'D' ? vl.toi : vl.sang); p(0, 1, vl.toi);
    }
    return b;
  }

  /* ---------- ván gỗ một chiều ---------- */
  function tileVan(lr, v) {
    var b = new Buf(), coTrai = lr & 1, coPhai = lr & 2, x;
    for (x = 0; x < T; x++) {
      b.set(x, 0, C.vien); b.set(x, 1, C.go2); b.set(x, 2, C.go1); b.set(x, 3, C.go1);
      b.set(x, 4, C.go1); b.set(x, 5, C.go0); b.set(x, 6, C.vien);
    }
    var r = rng(hash(v, lr, 77));
    for (var i = 0; i < 3; i++) { var gx = 2 + ((r() * 11) | 0), gy = 2 + ((r() * 3) | 0); b.set(gx, gy, C.go0); b.set(gx + 1, gy, C.go0); }
    b.set(0, 2, C.go0); b.set(0, 3, C.go0); b.set(0, 4, C.go0); // khe nối ván
    b.set(3, 3, C.sat); b.set(12, 3, C.sat);                   // đinh
    if (v === 1) { b.set(7, 1, C.kem); }
    if (!coTrai) {
      for (var y = 0; y <= 6; y++) b.set(0, y, C.vien);
      b.set(1, 1, C.go1);
      // ke chống bên trái
      for (var k = 0; k < 4; k++) { b.set(2 + k, 7 + k, C.go1); b.set(3 + k, 7 + k, C.go0); b.set(2 + k, 8 + k, C.vien); b.set(4 + k, 7 + k, C.vien); }
      b.set(2, 7, C.go0);
    }
    if (!coPhai) {
      for (y = 0; y <= 6; y++) b.set(15, y, C.vien);
      for (k = 0; k < 4; k++) { b.set(13 - k, 7 + k, C.go1); b.set(12 - k, 7 + k, C.go0); b.set(13 - k, 8 + k, C.vien); b.set(11 - k, 7 + k, C.vien); }
    }
    if (v === 2) { b.set(6, 7, C.reu0); b.set(6, 8, C.reu0); b.set(6, 9, C.reu1); b.set(10, 7, C.reu0); }
    return b;
  }

  /* ---------- thang (lặp dọc chu kỳ 8 px) ---------- */
  function tileThang(ud) {
    var b = new Buf(), tren = ud & 1, duoi = ud & 2, y, x;
    for (y = 0; y < T; y++) {
      b.set(1, y, C.vien); b.set(2, y, C.go2); b.set(3, y, C.go1); b.set(4, y, C.vien);
      b.set(11, y, C.vien); b.set(12, y, C.go2); b.set(13, y, C.go1); b.set(14, y, C.vien);
    }
    [4, 12].forEach(function (ry) {
      for (x = 5; x <= 10; x++) { b.set(x, ry - 1, C.vien); b.set(x, ry, C.go2); b.set(x, ry + 1, C.go0); b.set(x, ry + 2, C.vien); }
      // buộc dây chéo ở chỗ nối
      b.set(2, ry, C.kem); b.set(3, ry + 1, C.kem); b.set(12, ry, C.kem); b.set(13, ry + 1, C.kem);
    });
    if (!tren) { // đầu thang bo tròn
      for (y = 0; y < 2; y++) for (x = 0; x < T; x++) b.set(x, y, null);
      b.set(2, 2, C.vien); b.set(3, 2, C.vien); b.set(12, 2, C.vien); b.set(13, 2, C.vien);
      b.set(1, 2, null); b.set(4, 2, null); b.set(11, 2, null); b.set(14, 2, null);
    }
    if (!duoi) { b.set(2, 15, C.vien); b.set(3, 15, C.vien); b.set(12, 15, C.vien); b.set(13, 15, C.vien); }
    return b;
  }

  /* ---------- dây (lặp dọc chu kỳ 4 px) ---------- */
  function tileDay(ud) {
    var b = new Buf(), tren = ud & 1, duoi = ud & 2, y;
    for (y = 0; y < T; y++) {
      b.set(6, y, C.vien); b.set(9, y, C.vien);
      b.set(7, y, (y % 4 < 2) ? C.go2 : C.go1);
      b.set(8, y, (y % 4 < 2) ? C.go1 : C.go0);
    }
    if (!tren) { // khoen sắt treo
      for (y = 0; y < 5; y++) for (var x = 4; x <= 11; x++) b.set(x, y, null);
      b.set(6, 0, C.vien); b.set(7, 0, C.da2); b.set(8, 0, C.da1); b.set(9, 0, C.vien);
      b.set(5, 1, C.vien); b.set(6, 1, C.da2); b.set(9, 1, C.da0); b.set(10, 1, C.vien);
      b.set(5, 2, C.vien); b.set(6, 2, C.da1); b.set(9, 2, C.da0); b.set(10, 2, C.vien);
      b.set(6, 3, C.vien); b.set(7, 3, C.da1); b.set(8, 3, C.da0); b.set(9, 3, C.vien);
      b.set(7, 4, C.go1); b.set(8, 4, C.go0); b.set(6, 4, C.vien); b.set(9, 4, C.vien);
    }
    if (!duoi) { // nút thắt + đuôi sờn
      for (y = 10; y < T; y++) for (x = 4; x <= 11; x++) b.set(x, y, null);
      b.rect(5, 10, 6, 4, C.vien);
      b.rect(6, 10, 4, 3, C.go1); b.set(6, 10, C.go2); b.set(7, 11, C.go2); b.set(9, 12, C.go0);
      b.set(6, 14, C.go1); b.set(9, 14, C.go0); b.set(7, 14, C.vien); b.set(8, 14, C.vien);
      b.set(6, 15, C.vien); b.set(9, 15, C.vien);
    }
    return b;
  }

  /* ---------- gai ---------- */
  function tileGai() {
    var b = new Buf(), x, y;
    for (x = 0; x < T; x++) { b.set(x, 13, C.vien); b.set(x, 14, C.da1); b.set(x, 15, C.da0); }
    for (var s = 0; s < 4; s++) {
      var x0 = s * 4;
      b.set(x0 + 1, 5, C.vien); b.set(x0 + 2, 5, C.vien);
      for (y = 6; y <= 12; y++) {
        var w = y < 9 ? 1 : 2; // nửa bề rộng
        var l = y < 9 ? x0 + 1 : x0, rr = y < 9 ? x0 + 2 : x0 + 3;
        for (x = l; x <= rr; x++) b.set(x, y, x < x0 + 2 ? C.da2 : C.da0);
        if (y >= 9 && y <= 10) { b.set(l, y, C.vien); b.set(rr, y, C.vien); }
        if (w === 1) { b.set(l - 1, y, C.vien); b.set(rr + 1, y, C.vien); }
      }
      b.set(x0 + 1, 6, C.mau); b.set(x0 + 2, 6, C.mau); // mũi gai sẫm đỏ cho dễ nhận nguy hiểm
    }
    return b;
  }

  /* ---------- công tắc sàn ---------- */
  function tileCongTac(bat) {
    var b = new Buf(), x;
    for (x = 0; x < T; x++) { b.set(x, 12, C.vien); b.set(x, 13, C.da2); b.set(x, 14, C.da1); b.set(x, 15, C.da0); }
    if (!bat) {
      b.rect(4, 8, 8, 4, C.vien);
      b.rect(5, 9, 6, 1, C.go2); b.rect(5, 10, 6, 1, C.go1); b.rect(5, 11, 6, 1, C.go0);
      b.set(7, 9, C.dongToi); b.set(8, 9, C.dongToi);
    } else {
      b.rect(3, 10, 10, 2, C.vien);
      b.rect(4, 11, 8, 1, C.go0);
      b.set(7, 11, C.dong); b.set(8, 11, C.dong);
      // ánh sáng đồng hắt lên
      b.set(7, 9, C.dong); b.set(8, 9, C.kem); b.set(6, 8, C.dongToi); b.set(9, 8, C.dongToi); b.set(7, 7, C.dongToi);
      b.set(2, 13, C.dong); b.set(13, 13, C.dong);
    }
    return b;
  }

  /* ---------- cửa chuông (ghép dọc: đỉnh/giữa/đáy) ---------- */
  function tileCua(mo, ud) {
    var b = new Buf(), tren = ud & 1, x, y;
    for (y = 0; y < T; y++) { // khung
      b.set(0, y, C.vien); b.set(1, y, C.go1); b.set(2, y, C.go0); b.set(3, y, C.vien);
      b.set(12, y, C.vien); b.set(13, y, C.go1); b.set(14, y, C.go0); b.set(15, y, C.vien);
    }
    if (!mo) {
      for (y = 0; y < T; y++) for (x = 4; x <= 11; x++) b.set(x, y, (x === 6 || x === 9) ? C.go0 : (x === 4 ? C.go2 : C.go1));
      [3, 11].forEach(function (yy) { for (x = 4; x <= 11; x++) { b.set(x, yy, C.sat); b.set(x, yy + 1, C.vien); } b.set(5, yy, C.da2); b.set(10, yy, C.da2); });
    } else {
      // cửa đã kéo lên: chỉ còn rãnh trượt mờ
      for (y = 0; y < T; y++) { b.set(4, y, C.sat); b.set(11, y, C.sat); }
    }
    if (!tren) { // xà ngang + huy hiệu chuông
      for (x = 0; x < T; x++) { b.set(x, 0, C.vien); b.set(x, 1, C.go2); b.set(x, 2, C.go1); b.set(x, 3, C.vien); }
      var ch = mo ? C.dong : C.dongToi, chT = mo ? C.dongToi : C.vien;
      b.set(7, 4, C.vien); b.set(8, 4, C.vien);
      b.rect(6, 5, 4, 1, ch); b.rect(5, 6, 6, 3, ch); b.rect(4, 9, 8, 1, ch);
      b.set(5, 6, chT); b.set(10, 6, chT); b.rect(4, 10, 8, 1, C.vien); b.set(7, 11, chT); b.set(8, 11, chT);
      if (mo) { b.set(6, 6, C.kem); b.set(6, 7, C.kem); }
    }
    return b;
  }

  /* ---------- dựng atlas ---------- */
  var atlas = null;
  var DANH_SACH = []; // [{ten, nhom}]
  function taoAtlas() {
    if (atlas) return atlas;
    var list = [];
    function them(ten, buf, nhom) { list.push({ ten: ten, buf: buf, nhom: nhom }); }
    ['dat', 'da', 'tuong'].forEach(function (vl) {
      for (var m = 0; m < 16; m++) for (var v = 0; v < 4; v++) them(vl + '_' + m + '_' + v, tileDiaHinh(vl, m, v), vl);
      ['BT', 'BD', 'NT', 'ND'].forEach(function (g) { them(vl + '_gt_' + g, tileGocTrong(vl, g), vl + '_goc'); });
    });
    for (var lr = 0; lr < 4; lr++) for (var v = 0; v < 3; v++) them('van_' + lr + '_' + v, tileVan(lr, v), 'van');
    for (var ud = 0; ud < 4; ud++) {
      them('thang_' + ud, tileThang(ud), 'thang');
      them('day_' + ud, tileDay(ud), 'day');
      them('cua0_' + ud, tileCua(false, ud), 'cua');
      them('cua1_' + ud, tileCua(true, ud), 'cua');
    }
    them('gai', tileGai(), 'gai');
    them('congtac0', tileCongTac(false), 'congtac');
    them('congtac1', tileCongTac(true), 'congtac');

    var COT = 16, hang = Math.ceil(list.length / COT);
    var cv = document.createElement('canvas');
    cv.width = COT * T; cv.height = hang * T;
    var g = cv.getContext('2d');
    var map = {};
    list.forEach(function (it, i) {
      var ox = (i % COT) * T, oy = ((i / COT) | 0) * T;
      for (var p = 0; p < T * T; p++) {
        var c = it.buf.p[p];
        if (c) { g.fillStyle = c; g.fillRect(ox + (p % T), oy + ((p / T) | 0), 1, 1); }
      }
      map[it.ten] = [ox, oy];
      DANH_SACH.push({ ten: it.ten, nhom: it.nhom });
    });
    atlas = { canvas: cv, map: map };
    return atlas;
  }

  /* ---------- chọn tile cho từng ô ---------- */
  var VL_KY = { '#': 'dat', 'S': 'da', 'W': 'tuong' };
  function laKhoi(ch) { return ch === '#' || ch === 'S' || ch === 'W'; }

  function tinhO(luoi) {
    var H = luoi.length, Wd = 0, r, c;
    for (r = 0; r < H; r++) Wd = Math.max(Wd, luoi[r].length);
    function at(cx, cy) {
      if (cy < 0 || cy >= H || cx < 0 || cx >= Wd) return '.';
      return luoi[cy].charAt(cx) || '.';
    }
    var o = new Array(H * Wd);
    for (r = 0; r < H; r++) for (c = 0; c < Wd; c++) {
      var ch = at(c, r), ds = [];
      var vbien = hash(c, r, 1) % 4;
      if (laKhoi(ch)) {
        var vl = VL_KY[ch];
        var kb = laKhoi(at(c, r - 1)), kd = laKhoi(at(c + 1, r)), kn = laKhoi(at(c, r + 1)), kt = laKhoi(at(c - 1, r));
        var m = (kb ? B : 0) | (kd ? D : 0) | (kn ? N : 0) | (kt ? TY : 0);
        ds.push(vl + '_' + m + '_' + vbien);
        if (kb && kt && !laKhoi(at(c - 1, r - 1))) ds.push(vl + '_gt_BT');
        if (kb && kd && !laKhoi(at(c + 1, r - 1))) ds.push(vl + '_gt_BD');
        if (kn && kt && !laKhoi(at(c - 1, r + 1))) ds.push(vl + '_gt_NT');
        if (kn && kd && !laKhoi(at(c + 1, r + 1))) ds.push(vl + '_gt_ND');
      } else if (ch === '=') {
        ds.push('van_' + ((at(c - 1, r) === '=' ? 1 : 0) | (at(c + 1, r) === '=' ? 2 : 0)) + '_' + (hash(c, r, 3) % 3));
      } else if (ch === 'H') {
        ds.push('thang_' + ((at(c, r - 1) === 'H' ? 1 : 0) | (at(c, r + 1) === 'H' || laKhoi(at(c, r + 1)) ? 2 : 0)));
      } else if (ch === '|') {
        ds.push('day_' + ((at(c, r - 1) === '|' ? 1 : 0) | (at(c, r + 1) === '|' ? 2 : 0)));
      } else if (ch === 'D' || ch === 'd') {
        var cuaTren = at(c, r - 1) === 'D' || at(c, r - 1) === 'd';
        ds.push((ch === 'D' ? 'cua0_' : 'cua1_') + (cuaTren ? 1 : 0));
      } else if (ch === '^') ds.push('gai');
      else if (ch === 'o') ds.push('congtac0');
      else if (ch === 'O') ds.push('congtac1');
      o[r * Wd + c] = ds.length ? ds : null;
    }
    return { rong: Wd, cao: H, o: o };
  }

  var cache = new WeakMap();
  function layO(luoi) {
    var ca = cache.get(luoi);
    if (ca && ca.ban.length === luoi.length) {
      var giong = true;
      for (var i = 0; i < luoi.length; i++) if (ca.ban[i] !== luoi[i]) { giong = false; break; }
      if (giong) return ca.kq;
    }
    var kq = tinhO(luoi);
    cache.set(luoi, { ban: luoi.slice(), kq: kq });
    return kq;
  }

  /* ---------- vẽ bản đồ: chỉ drawImage từ atlas ---------- */
  function veBanDo(ctx, luoi, camX, camY) {
    var a = taoAtlas(), kq = layO(luoi);
    camX = Math.round(camX || 0); camY = Math.round(camY || 0);
    var tf = ctx.getTransform ? ctx.getTransform() : { a: 1, d: 1 };
    var vw = ctx.canvas.width / (tf.a || 1), vh = ctx.canvas.height / (tf.d || 1);
    var c0 = Math.max(0, Math.floor(camX / T)), c1 = Math.min(kq.rong - 1, Math.floor((camX + vw) / T));
    var r0 = Math.max(0, Math.floor(camY / T)), r1 = Math.min(kq.cao - 1, Math.floor((camY + vh) / T));
    ctx.imageSmoothingEnabled = false;
    for (var r = r0; r <= r1; r++) for (var c = c0; c <= c1; c++) {
      var ds = kq.o[r * kq.rong + c];
      if (!ds) continue;
      for (var k = 0; k < ds.length; k++) {
        var s = a.map[ds[k]];
        if (s) ctx.drawImage(a.canvas, s[0], s[1], T, T, c * T - camX, r * T - camY, T, T);
      }
    }
  }

  function ve1(ctx, ten, x, y) {
    var a = taoAtlas(), s = a.map[ten];
    if (s) ctx.drawImage(a.canvas, s[0], s[1], T, T, x, y, T, T);
  }

  TV.tiles = {
    KICH_THUOC: T,
    MAU: C,
    taoAtlas: taoAtlas,
    veBanDo: veBanDo,
    ve1: ve1,
    danhSach: function () { taoAtlas(); return DANH_SACH.slice(); }
  };
})();
