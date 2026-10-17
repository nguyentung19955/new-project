/* =====================================================================
   atlas-in-san.js — nạp atlas sprite đã in sẵn (game/tools/in-atlas.py), KHÔNG cần WebGL/Three.js.
   Nguồn: art/sprite/atlas.json + lam.png, lam48.png (tools/in-lam48.py), lam3d.png (tools/in-lam3d.py), quai-chuong.png, boss.png.
   Bản build một file đặt sẵn TV.ATLAS_NHUNG = { json:{...}, anh:{ 'lam.png':'data:...', ... } }.
   API:  TV.atlasInSan : Promise → { lam, lam48, lam3d, quaiChuong, boss }  (lỗi: err.phan = danh sách phần hỏng)
         TV.napLaiAtlas() : nạp lại (nút Thử lại), cập nhật TV.atlasInSan
         mỗi atlas có API y hệt TV.taoAtlasLam / taoAtlasQuaiChuong / taoAtlasBoss
         (canvas = ảnh đã vẽ vào canvas, w, h, cols, rows, pivot, fps, anims, kiemTra...).
   ===================================================================== */
(function (root) {
'use strict';
var TV = root.TV = root.TV || {};
var BASE = TV.ATLAS_GOC || '../art/sprite/';

var TEN = { lam: 'nhân vật Lam', lam48: 'nhân vật Lam 48', lam3d: 'nhân vật Lam 3D', quaiChuong: 'Quái Chuông Gỗ', boss: 'Chuông Gác Làng' };
var lan = 0;   // số lần nạp lại: thêm ?r= để trình duyệt không dùng bản lỗi trong bộ nhớ đệm
function bust(src) { return (lan && !/^data:/.test(src)) ? src + (src.indexOf('?') < 0 ? '?' : '&') + 'r=' + lan + '_' + Date.now() : src; }

function napAnh(src) {
  return new Promise(function (res, rej) {
    var im = new Image();
    im.onload = function () { res(im); };
    im.onerror = function () { rej(new Error('không tải được ảnh')); };
    im.src = bust(src);
  });
}
function napJson() {
  var nh = TV.ATLAS_NHUNG;
  if (nh && nh.json) return Promise.resolve(JSON.parse(JSON.stringify(nh.json)));
  return fetch(bust(BASE + 'atlas.json'), { cache: 'no-cache' }).then(function (r) {
    if (!r.ok) throw new Error('lỗi mạng ' + r.status);
    return r.json();
  }).catch(function (e) {
    var er = new Error('Tệp mô tả atlas.json: ' + (e && e.message || e));
    er.phan = [er.message]; throw er;
  });
}
function dungAtlas(k, meta) {
  var nh = TV.ATLAS_NHUNG, file = meta.anh;
  var src = (nh && nh.anh && nh.anh[file]) || (BASE + file);
  return napAnh(src).then(function (im) {
    var c = document.createElement('canvas');
    c.width = im.naturalWidth || im.width; c.height = im.naturalHeight || im.height;
    c.getContext('2d').drawImage(im, 0, 0);
    var at = { canvas: c };
    for (var key in meta) if (key !== 'anh') at[key] = meta[key];
    if (!at.kiemTra) at.kiemTra = [];
    return at;
  }, function (e) {
    throw new Error('Ảnh ' + (TEN[k] || k) + ' (' + file + '): ' + (e && e.message || e));
  });
}

/* Nạp tất cả; lỗi ghi rõ TỪNG phần hỏng (err.phan = danh sách) */
function napTatCa() {
  return napJson().then(function (js) {
    var keys = Object.keys(js), out = {}, phan = [];
    return Promise.all(keys.map(function (k) {
      return dungAtlas(k, js[k]).then(function (at) { out[k] = at; }, function (e) { phan.push(e.message); });
    })).then(function () {
      if (!js.lam) phan.push('atlas.json thiếu nhân vật Lam');
      if (!js.quaiChuong) phan.push('atlas.json thiếu Quái Chuông Gỗ');
      if (phan.length) { var er = new Error(phan.join('; ')); er.phan = phan; throw er; }
      return out;
    });
  });
}
TV.atlasInSan = napTatCa();
TV.atlasInSan.catch(function () {});   // tránh cảnh báo "unhandled"; demo.html tự xử lý lỗi
/* Nút "Thử lại": nạp lại atlas không cần tải lại trang */
TV.napLaiAtlas = function () {
  lan++;
  TV.atlasInSan = napTatCa();
  TV.atlasInSan.catch(function () {});
  return TV.atlasInSan;
};
})(typeof window !== 'undefined' ? window : this);
