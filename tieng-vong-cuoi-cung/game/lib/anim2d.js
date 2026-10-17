/* =====================================================================
   anim2d.js — bộ phát animation 2D từ sprite sheet dạng lưới (TV.Anim).
   Giai đoạn 1: chỉ là thư viện độc lập + trang thử xem-thu/anim2d.html.
   CHƯA tích hợp vào demo.html; không phụ thuộc atlas-in-san.js hay thứ gì khác.
   Không ES module: nạp bằng <script src="lib/anim2d.js"> rồi dùng TV.Anim.

   ĐỊNH DẠNG JSON (version 1) — ví dụ anim/lam.anim.json:
     { "version":1, "image":"lam.png", "frameWidth":64, "frameHeight":64, "pivot":[32,63],
       "animations": { "idle":{"row":0,"frames":6,"fps":8,"loop":true}, ... ,
                       "attack":{"row":4,"frames":6,"fps":14,"loop":false,"hitFrames":[2,3]} } }
     Sheet là lưới: khung i của animation nằm ở ô (i*frameWidth, row*frameHeight).
     Ô trống để trong suốt. pivot = điểm CHÂN của nhân vật tính trong ô (x, y), đơn vị pixel.
     hitFrames chỉ là METADATA (đọc qua sheet.anims[ten].hitFrames); bộ phát không dùng,
     không gọi hitbox, không gây sát thương.

   API:
     TV.Anim.taoSheet(img, json)  → sheet { img, imgLat, fw, fh, pivot:[px,py], pivotLat:[fw-1-px,py],
                                            anims, cols, rows, w, h, placeholder:false }
                                     Kiểm tra json.version===1 và các trường bắt buộc, báo lỗi rõ.
                                     Bản lật ngang (imgLat) tạo MỘT lần, vẽ quay trái không scale(-1).
     TV.Anim.tao(sheet)           → bộ phát { ten, khung, acc, het, set(ten), update(dtMs), frame(),
                                              xong(), khungCuoi(), hitFrames() }
         xong()      = het: animation KHÔNG loop đã hiển thị khung cuối đủ 1000/fps ms (tính theo
                       thời lượng, không phải "vừa tới khung cuối"). set() sang tên khác → het=false.
         khungCuoi() = không loop && khung === frames-1 (đã TỚI khung cuối, có thể chưa hết thời lượng).
         Khi non-loop đứng ở khung cuối, acc vẫn cộng dồn tới msKhung rồi dừng (khung không tăng).
     TV.Anim.ve(ctx, sheet, boPhat, xChan, yChan, lat)  — vẽ ô hiện tại, pivot trùng (round x, round y)
     TV.Anim.veKhung(ctx, sheet, ten, khung, xChan, yChan, lat) — vẽ một khung bất kỳ (dùng cho phát lại)
     TV.Anim.kiemLat(sheet, ten, khung) → kiểm chứng lật BẰNG ẢNH: vẽ khung thuận và lật lên 2 canvas tạm
                                     cùng pivot nguyên (X, Y), đo bbox pixel không trong suốt mỗi bản, trả
                                     { X, Y, thuan:{trai,phai,day}, lat:{trai,phai,day},
                                       lech:{trai,phai,day}, saiPixel, tamLech, dung }
                                     lech.trai = (trái thuận − X) − (X − phải lật)   (kỳ vọng 0)
                                     lech.phai = (phải thuận − X) − (X − trái lật)   (kỳ vọng 0)
                                     lech.day  = đáy thuận − đáy lật                  (kỳ vọng 0)
                                     saiPixel  = số pixel (x,y) thuận mà alpha khác pixel (2X−x, y) lật (kỳ vọng 0)
                                     tamLech   = tâm bbox thuận − X (chỉ THÔNG TIN: ≠0 nghĩa là hình không
                                                 đối xứng quanh pivot x, KHÔNG phải lỗi công thức; không tự căn giữa).
                                     dung = lech đều 0 && saiPixel === 0.
     TV.Anim.placeholder(json)    → canvas sheet tạm (khối màu) khi chưa có PNG
     TV.Anim.nap(urlJson)         → Promise sheet; PNG lỗi → placeholder, sheet.placeholder = true

   KIỂM CHỨNG CÔNG THỨC LẬT (đã chạy test node với canvas giả bằng mảng, 2026-10-17):
     imgLat = ảnh lật ngang toàn sheet → cột sheet c nằm ở cột w−1−c. Khung k thuận chiếm cột [k·fw, (k+1)·fw),
     nên trong imgLat nó chiếm [w−(k+1)·fw, w−k·fw) ⇒ sx = w − (k+1)·fw ĐÚNG (kể cả khi ảnh rộng hơn lưới).
     Cột trong ô: c thuận ↔ fw−1−c lật. Đích lật = X − pivotLat[0] + (fw−1−c) = X + px − c; đích thuận = X − px + c.
     ⇒ cột px luôn rơi đúng cột X ở cả hai chiều, mọi pixel đối xứng qua X: lech = {0,0,0}, saiPixel = 0
     với pivot x lệch tâm (px=3/fw=8, px=2/fw=9, px=0/fw=6) và ảnh rộng hơn lưới (tamLech ≠ 0 nhưng vẫn
     đối xứng đúng). Không phát hiện sai; không sửa công thức. Nút "Kiểm lật" trong trang thử chạy cùng
     phép đo này trên canvas thật của trình duyệt.

   CÁCH DÙNG TRONG VÒNG LẶP CỐ ĐỊNH (như demo.html: logic 60 bước/giây, render riêng):
     // trong step() — bước logic:
     bp.set(tenTheoTrangThai);      // set cùng tên nhiều lần KHÔNG reset
     bp.update(1000/60);            // CHỈ gọi ở bước logic, KHÔNG gọi trong render
     // trong render():
     TV.Anim.ve(ctx, sheet, bp, xChan, yChan, pl.face < 0);   // chỉ đọc bp.frame()/ten, không đổi trạng thái
   Bóng Tiếng Vọng: phải PHÁT LẠI từ dữ liệu đã ghi (ak/af/flip/sdx trong recordFrame của demo),
   tức là ghi (ten, khung, lat) mỗi bước rồi vẽ bằng TV.Anim.veKhung(...) — KHÔNG chạy lại bộ phát
   cho bóng, vì thời gian tích lũy sẽ lệch với bản ghi.
   ===================================================================== */
(function (root) {
'use strict';
var TV = root.TV = root.TV || {};
var Anim = TV.Anim = TV.Anim || {};

function loi(msg) { throw new Error('anim2d: ' + msg); }
function laSoNguyen(v) { return typeof v === 'number' && isFinite(v) && Math.floor(v) === v; }

/* Kiểm tra JSON, trả về bản chuẩn hóa (không đụng vào json gốc) */
Anim.kiemTra = function (json) {
  if (!json || typeof json !== 'object') loi('JSON không phải object');
  if (json.version !== 1) loi('version phải là 1 (nhận được ' + JSON.stringify(json.version) + ')');
  if (typeof json.image !== 'string' || !json.image) loi('thiếu trường "image" (tên tệp PNG)');
  if (!laSoNguyen(json.frameWidth) || json.frameWidth <= 0) loi('thiếu/sai "frameWidth" (số nguyên > 0)');
  if (!laSoNguyen(json.frameHeight) || json.frameHeight <= 0) loi('thiếu/sai "frameHeight" (số nguyên > 0)');
  var pv = json.pivot;
  if (!Array.isArray(pv) || pv.length !== 2 || !laSoNguyen(pv[0]) || !laSoNguyen(pv[1])) loi('thiếu/sai "pivot" (phải là [x, y] số nguyên)');
  if (pv[0] < 0 || pv[0] >= json.frameWidth || pv[1] < 0 || pv[1] >= json.frameHeight) loi('"pivot" nằm ngoài ô ' + json.frameWidth + '×' + json.frameHeight);
  var A = json.animations;
  if (!A || typeof A !== 'object' || Array.isArray(A)) loi('thiếu trường "animations"');
  var ten = Object.keys(A);
  if (!ten.length) loi('"animations" rỗng');
  var anims = {}, cols = 0, rows = 0;
  for (var i = 0; i < ten.length; i++) {
    var k = ten[i], a = A[k];
    if (!a || typeof a !== 'object') loi('animation "' + k + '" không phải object');
    if (!laSoNguyen(a.row) || a.row < 0) loi('animation "' + k + '": thiếu/sai "row"');
    if (!laSoNguyen(a.frames) || a.frames <= 0) loi('animation "' + k + '": thiếu/sai "frames" (số nguyên > 0)');
    if (typeof a.fps !== 'number' || !(a.fps > 0)) loi('animation "' + k + '": thiếu/sai "fps" (số > 0)');
    if (typeof a.loop !== 'boolean') loi('animation "' + k + '": thiếu "loop" (true/false)');
    var hf = [];
    if (a.hitFrames !== undefined) {
      if (!Array.isArray(a.hitFrames)) loi('animation "' + k + '": "hitFrames" phải là mảng');
      for (var j = 0; j < a.hitFrames.length; j++) {
        if (!laSoNguyen(a.hitFrames[j]) || a.hitFrames[j] < 0 || a.hitFrames[j] >= a.frames) loi('animation "' + k + '": hitFrames[' + j + '] ngoài 0..' + (a.frames - 1));
        hf.push(a.hitFrames[j]);
      }
    }
    anims[k] = { ten: k, row: a.row, frames: a.frames, fps: a.fps, loop: a.loop, hitFrames: hf, msKhung: 1000 / a.fps };
    if (a.frames > cols) cols = a.frames;
    if (a.row + 1 > rows) rows = a.row + 1;
  }
  return { version: 1, image: json.image, fw: json.frameWidth, fh: json.frameHeight, pivot: [pv[0], pv[1]], anims: anims, cols: cols, rows: rows, ten: ten };
};

/* Vẽ ảnh/canvas vào canvas mới (lật ngang nếu lat) — làm một lần lúc tạo sheet */
function sangCanvas(img, w, h, lat) {
  var c = document.createElement('canvas');
  c.width = w; c.height = h;
  var g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  if (lat) { g.translate(w, 0); g.scale(-1, 1); }
  g.drawImage(img, 0, 0);
  return c;
}

/* ---- 2. taoSheet ---- */
Anim.taoSheet = function (img, json) {
  var d = Anim.kiemTra(json);
  if (!img) loi('taoSheet: thiếu ảnh');
  var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  if (!(iw > 0 && ih > 0)) loi('taoSheet: ảnh chưa nạp xong hoặc kích thước 0');
  var canW = d.cols * d.fw, canH = d.rows * d.fh;
  if (iw < canW || ih < canH) console.warn('anim2d: ảnh ' + iw + '×' + ih + ' nhỏ hơn lưới cần ' + canW + '×' + canH + ' — ô thiếu sẽ trống');
  var sheet = {
    img: img, imgLat: sangCanvas(img, iw, ih, true),
    fw: d.fw, fh: d.fh, pivot: d.pivot, pivotLat: [d.fw - 1 - d.pivot[0], d.pivot[1]],
    anims: d.anims, tenAnims: d.ten, cols: d.cols, rows: d.rows, w: iw, h: ih,
    image: d.image, placeholder: false
  };
  return sheet;
};

/* ---- 3. bộ phát ---- */
Anim.tao = function (sheet) {
  if (!sheet || !sheet.anims) loi('tao: cần sheet từ TV.Anim.taoSheet');
  var daBao = {};
  var bp = { sheet: sheet, ten: null, khung: 0, acc: 0, het: false };
  bp.anim = function () { return bp.ten ? sheet.anims[bp.ten] : null; };
  bp.set = function (ten) {
    if (ten === bp.ten) return bp;                       // cùng tên → không reset
    if (!sheet.anims[ten]) {
      if (!daBao[ten]) { daBao[ten] = true; console.warn('anim2d: không có animation "' + ten + '" trong sheet (giữ nguyên "' + bp.ten + '")'); }
      return bp;
    }
    bp.ten = ten; bp.khung = 0; bp.acc = 0; bp.het = false;
    return bp;
  };
  /* Khung cuối của animation không loop: acc cộng dồn tới msKhung rồi het=true (khung không tăng) */
  function demKhungCuoi(a) {
    if (bp.acc >= a.msKhung) { bp.het = true; bp.acc = a.msKhung; }
  }
  bp.update = function (dtMs) {
    var a = bp.anim();
    if (!a || !(dtMs > 0)) return bp;
    if (!a.loop && bp.khung >= a.frames - 1) {           // đang ở khung cuối: đếm nốt thời lượng khung cuối
      bp.khung = a.frames - 1;
      if (bp.het) return bp;
      bp.acc += dtMs;
      demKhungCuoi(a);
      return bp;
    }
    bp.acc += dtMs;
    var n = Math.floor(bp.acc / a.msKhung);              // có thể nhảy nhiều khung nếu dt lớn
    if (n <= 0) return bp;
    bp.acc -= n * a.msKhung;
    var k = bp.khung + n;
    if (a.loop) k %= a.frames;
    else if (k >= a.frames - 1) {
      if (k > a.frames - 1) bp.acc += (k - (a.frames - 1)) * a.msKhung;   // nhảy vượt khung cuối: thời gian vượt tính vào khung cuối
      k = a.frames - 1;
      demKhungCuoi(a);
    }
    bp.khung = k;
    return bp;
  };
  bp.frame = function () { return bp.ten ? bp.khung : 0; };          // chỉ đọc
  bp.xong = function () { return !!bp.anim() && bp.het; };            // theo thời lượng: khung cuối đã hiển thị đủ msKhung
  bp.khungCuoi = function () { var a = bp.anim(); return !!a && !a.loop && bp.khung === a.frames - 1; };
  bp.hitFrames = function () { var a = bp.anim(); return a ? a.hitFrames : []; };   // metadata, chỉ để đọc
  return bp;
};

/* ---- 4. vẽ ---- */
Anim.veKhung = function (ctx, sheet, ten, khung, xChan, yChan, lat) {
  var a = sheet.anims[ten];
  if (!a) return;
  if (khung < 0) khung = 0; else if (khung >= a.frames) khung = a.frames - 1;
  var fw = sheet.fw, fh = sheet.fh;
  var X = Math.round(xChan), Y = Math.round(yChan);
  ctx.imageSmoothingEnabled = false;
  if (lat) {
    ctx.drawImage(sheet.imgLat, sheet.w - (khung + 1) * fw, a.row * fh, fw, fh, X - sheet.pivotLat[0], Y - sheet.pivotLat[1], fw, fh);
  } else {
    ctx.drawImage(sheet.img, khung * fw, a.row * fh, fw, fh, X - sheet.pivot[0], Y - sheet.pivot[1], fw, fh);
  }
};
Anim.ve = function (ctx, sheet, boPhat, xChan, yChan, lat) {
  if (!boPhat || !boPhat.ten) return;
  Anim.veKhung(ctx, sheet, boPhat.ten, boPhat.khung, xChan, yChan, !!lat);
};

/* ---- 4b. kiểm chứng lật bằng ảnh (xem ghi chú đầu file) — chỉ ĐO và BÁO, không sửa gì ---- */
function bboxAlpha(data, w, h) {
  var trai = -1, phai = -1, day = -1;
  for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
    if (data[(y * w + x) * 4 + 3] > 0) {
      if (trai < 0 || x < trai) trai = x;
      if (x > phai) phai = x;
      if (y > day) day = y;
    }
  }
  return { trai: trai, phai: phai, day: day, rong: trai < 0 };
}
Anim.kiemLat = function (sheet, ten, khung) {
  var a = sheet.anims[ten];
  if (!a) loi('kiemLat: không có animation "' + ten + '"');
  if (!laSoNguyen(khung) || khung < 0) khung = 0; else if (khung >= a.frames) khung = a.frames - 1;
  var fw = sheet.fw, fh = sheet.fh, W = fw * 2 + 4, H = fh * 2 + 2;
  var X = fw + 2, Y = fh + 1;                             // pivot nguyên, ô nằm trọn trong canvas tạm ở cả hai chiều
  var c1 = document.createElement('canvas'), c2 = document.createElement('canvas');
  c1.width = W; c1.height = H; c2.width = W; c2.height = H;
  var g1 = c1.getContext('2d'), g2 = c2.getContext('2d');
  Anim.veKhung(g1, sheet, ten, khung, X, Y, false);
  Anim.veKhung(g2, sheet, ten, khung, X, Y, true);
  var d1 = g1.getImageData(0, 0, W, H).data, d2 = g2.getImageData(0, 0, W, H).data;
  var b1 = bboxAlpha(d1, W, H), b2 = bboxAlpha(d2, W, H);
  var sai = 0;                                            // pixel thuận (x,y) phải khớp pixel lật (2X−x, y)
  for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
    var xl = 2 * X - x; if (xl < 0 || xl >= W) continue;
    var a1 = d1[(y * W + x) * 4 + 3] > 0, a2 = d2[(y * W + xl) * 4 + 3] > 0;
    if (a1 !== a2) sai++;
  }
  var lech = b1.rong || b2.rong
    ? { trai: NaN, phai: NaN, day: NaN }
    : { trai: (b1.trai - X) - (X - b2.phai), phai: (b1.phai - X) - (X - b2.trai), day: b1.day - b2.day };
  return {
    ten: ten, khung: khung, X: X, Y: Y, thuan: b1, lat: b2, lech: lech, saiPixel: sai,
    tamLech: b1.rong ? NaN : (b1.trai + b1.phai) / 2 - X,
    dung: !b1.rong && !b2.rong && lech.trai === 0 && lech.phai === 0 && lech.day === 0 && sai === 0
  };
};

/* ---- 5. placeholder: khối màu đơn giản, KHÔNG vẽ Lam ---- */
var MAU_PH = ['#9fd3c7', '#f7c59f', '#c7b8ea', '#a8d8a8', '#f4a6a6', '#f6e3a1', '#a6c8f4', '#d9b8a8'];
Anim.placeholder = function (json) {
  var d = Anim.kiemTra(json);
  var c = document.createElement('canvas');
  c.width = d.cols * d.fw; c.height = d.rows * d.fh;
  var g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  var fw = d.fw, fh = d.fh, px = d.pivot[0], py = d.pivot[1];
  for (var i = 0; i < d.ten.length; i++) {
    var a = d.anims[d.ten[i]], mau = MAU_PH[i % MAU_PH.length];
    for (var k = 0; k < a.frames; k++) {
      var ox = k * fw, oy = a.row * fh;
      // nhịp đơn giản để thấy chuyển động: thân cao/thấp theo khung, chân luôn ở pivot
      var ph = (k / a.frames) * Math.PI * 2, nhun = Math.round(Math.sin(ph) * 2);
      var than = Math.round(fh * 0.42), rong = Math.round(fw * 0.28), dau = Math.round(fw * 0.14);
      var chanY = oy + py;                                   // hàng pixel chân
      var thanY = chanY - than + nhun;                       // thân nhún lên xuống
      g.fillStyle = mau;
      g.fillRect(ox + px - (rong >> 1), thanY, rong, than - nhun);                     // thân (đáy tại chân)
      g.beginPath(); g.arc(ox + px + 0.5, thanY - dau + 1, dau, 0, Math.PI * 2); g.fill();   // đầu tròn
      // chân: hai vạch tối ở đúng pivot, lệch nhau theo khung (giả bước)
      g.fillStyle = 'rgba(0,0,0,0.45)';
      var buoc = (k % 2) ? 3 : -3;
      g.fillRect(ox + px - 4 + buoc, chanY - 3, 3, 4);
      g.fillRect(ox + px + 2 - buoc, chanY - 3, 3, 4);
      // chấm đánh dấu pivot
      g.fillStyle = '#d33'; g.fillRect(ox + px, oy + py, 1, 1);
      // chữ nhỏ: tên + số khung
      g.fillStyle = 'rgba(0,0,0,0.75)'; g.font = '8px monospace'; g.textBaseline = 'top';
      g.fillText(a.ten, ox + 2, oy + 2);
      g.fillText(String(k), ox + 2, oy + 11);
      // khung ô mờ
      g.strokeStyle = 'rgba(0,0,0,0.12)'; g.strokeRect(ox + 0.5, oy + 0.5, fw - 1, fh - 1);
    }
  }
  return c;
};

/* ---- 6. nạp ---- */
function napAnh(src) {
  return new Promise(function (res, rej) {
    var im = new Image();
    im.onload = function () { res(im); };
    im.onerror = function () { rej(new Error('không tải được ảnh ' + src)); };
    im.src = src;
  });
}
Anim.napAnh = napAnh;
Anim.nap = function (urlJson) {
  var thuMuc = urlJson.replace(/[^\/]*$/, '');
  return fetch(urlJson, { cache: 'no-cache' }).then(function (r) {
    if (!r.ok) throw new Error('anim2d: lỗi mạng ' + r.status + ' khi tải ' + urlJson);
    return r.json();
  }).then(function (json) {
    Anim.kiemTra(json);                                   // JSON sai → throw rõ ràng
    return napAnh(thuMuc + json.image).then(function (im) {
      var s = Anim.taoSheet(im, json); s.json = json; return s;
    }, function (e) {
      console.warn('anim2d: ' + e.message + ' → dùng placeholder');
      var s = Anim.taoSheet(Anim.placeholder(json), json);
      s.placeholder = true; s.loiAnh = e.message; s.json = json;
      return s;
    });
  });
};
})(typeof window !== 'undefined' ? window : this);
