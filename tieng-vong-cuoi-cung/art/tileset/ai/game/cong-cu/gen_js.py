import base64, json
ROOT = '/home/claude/new-project/tieng-vong-cuoi-cung/'
png = open(ROOT + 'art/tileset/ai/game/tiles.png', 'rb').read()
mp = json.load(open(ROOT + 'art/tileset/ai/game/tiles.json'))
b64 = base64.b64encode(png).decode()
o = mp['o']; nh = mp['nhom']
ds = [[k, nh[k]] for k in o.keys()]
JS = r'''/* Tiếng Vọng Cuối Cùng – tileset từ ảnh AI (art/tileset/ai/*.png), 16×16 pixel thật, ghép liền mạch.
 * Thay thế trực tiếp cho lib/tiles.js: đổi thẻ <script src="lib/tiles.js"> thành <script src="lib/tiles-ai.js">.
 * API giống tiles.js: TV.tiles.KICH_THUOC, MAU, taoAtlas(), veBanDo(ctx, luoi, camX, camY), ve1(ctx, ten, x, y), danhSach().
 * Ký hiệu lưới: '#' đất, 'S' đá, 'W' tường leo, '=' ván một chiều, 'H' thang, '|' dây, '^' gai,
 *               'o' công tắc (tắt), 'O' công tắc (bật), 'D' cửa chuông đóng, 'd' cửa chuông mở, '.' trống.
 *
 * LƯU Ý NẠP ẢNH: atlas là ảnh PNG nhúng sẵn (data URI) nên trình duyệt giải mã KHÔNG đồng bộ (vài ms).
 *   - TV.tiles.sanSang là Promise, xong khi atlas đã vẽ xong → nên chờ nó trước vòng lặp game:
 *       TV.tiles.sanSang.then(function () { requestAnimationFrame(vongLap); });
 *   - Sau khi sanSang xong, taoAtlas()/veBanDo()/ve1() dùng đồng bộ y như tiles.js.
 *   - Gọi trước khi xong thì không lỗi, chỉ vẽ ra ô trống (canvas atlas được điền ngay khi ảnh tải xong).
 *   - TV.tiles.daSan === true khi đã sẵn sàng.
 * Autotile: 16 kiểu theo 4 hướng (B=1 Đ=2 N=4 T=8: Bắc/Đông/Nam/Tây có khối) × 4 biến thể + 4 góc trong phủ thêm.
 * Cửa chuông cao 3 ô: cua0_0 đỉnh, cua0_1 giữa, cua0_2 đáy (cua1_* là cửa mở).
 * Nguồn & cách làm: art/tileset/ai/game/README.md
 */
(function () {
  'use strict';
  var TV = (window.TV = window.TV || {});
  var T = 16;

  var C = {
    vien: '#0C0F14',
    dat0: '#2A1510', dat1: '#5C2D18', dat2: '#9A5B27',
    da0: '#3A3A40', da1: '#5E5D59', da2: '#8C8D86', vua: '#1E1C1C',
    reu0: '#3C5628', reu1: '#717E2D',
    go0: '#5A3F2B', go1: '#7A5A3A', go2: '#9A7A55',
    sat: '#353232',
    dong: '#E1B85A', dongToi: '#9C6B30', kem: '#F3E6C8',
    mau: '#6E2F28'
  };

  var ANH = 'data:image/png;base64,__B64__';
  var MAP = __MAP__;
  var DS = __DS__;
  var DANH_SACH = DS.map(function (d) { return { ten: d[0], nhom: d[1] }; });

  function hash(x, y, s) {
    var h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (h ^ (h >>> 16)) >>> 0;
  }

  /* ---------- atlas: canvas tạo ngay, ảnh vẽ vào khi giải mã xong ---------- */
  var cv = document.createElement('canvas');
  cv.width = __W__; cv.height = __H__;
  var atlas = { canvas: cv, map: MAP };
  var img = new Image();
  var sanSang = new Promise(function (ok, loi) {
    img.onload = function () {
      var g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      g.clearRect(0, 0, cv.width, cv.height);
      g.drawImage(img, 0, 0);
      TV.tiles.daSan = true;
      ok(atlas);
    };
    img.onerror = function () { loi(new Error('Không giải mã được atlas tiles-ai')); };
  });
  img.src = ANH;
  function taoAtlas() { return atlas; }

  /* ---------- chọn tile cho từng ô (giống tiles.js) ---------- */
  var B = 1, D = 2, N = 4, TY = 8;
  var VL_KY = { '#': 'dat', 'S': 'da', 'W': 'tuong' };
  function laKhoi(ch) { return ch === '#' || ch === 'S' || ch === 'W'; }
  function laCua(ch) { return ch === 'D' || ch === 'd'; }

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
      } else if (laCua(ch)) {
        // cửa cao 3 ô: đỉnh (vòm + chuông) / giữa / đáy (bậu cửa)
        var phan = !laCua(at(c, r - 1)) ? 0 : (!laCua(at(c, r + 1)) ? 2 : 1);
        ds.push((ch === 'D' ? 'cua0_' : 'cua1_') + phan);
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
    danhSach: function () { return DANH_SACH.slice(); },
    sanSang: sanSang,
    daSan: false,
    nguon: 'ai'
  };
})();
'''
from PIL import Image
im = Image.open(ROOT + 'art/tileset/ai/game/tiles.png')
JS = (JS.replace('__B64__', b64).replace('__MAP__', json.dumps(o, separators=(',', ':')))
        .replace('__DS__', json.dumps(ds, separators=(',', ':'), ensure_ascii=False))
        .replace('__W__', str(im.width)).replace('__H__', str(im.height)))
open(ROOT + 'game/lib/tiles-ai.js', 'w').write(JS)
print(len(JS))
