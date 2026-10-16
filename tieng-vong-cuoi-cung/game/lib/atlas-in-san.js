/* =====================================================================
   atlas-in-san.js — nạp atlas sprite đã in sẵn (game/tools/in-atlas.py), KHÔNG cần WebGL/Three.js.
   Nguồn: art/sprite/atlas.json + lam.png, quai-chuong.png, boss.png.
   Bản build một file đặt sẵn TV.ATLAS_NHUNG = { json:{...}, anh:{ 'lam.png':'data:...', ... } }.
   API:  TV.atlasInSan : Promise → { lam, quaiChuong, boss }
         mỗi atlas có API y hệt TV.taoAtlasLam / taoAtlasQuaiChuong / taoAtlasBoss
         (canvas = ảnh đã vẽ vào canvas, w, h, cols, rows, pivot, fps, anims, kiemTra...).
   ===================================================================== */
(function (root) {
'use strict';
var TV = root.TV = root.TV || {};
var BASE = TV.ATLAS_GOC || '../art/sprite/';

function napAnh(src) {
  return new Promise(function (res, rej) {
    var im = new Image();
    im.onload = function () { res(im); };
    im.onerror = function () { rej(new Error('Không tải được ảnh ' + String(src).slice(0, 60))); };
    im.src = src;
  });
}
function napJson() {
  var nh = TV.ATLAS_NHUNG;
  if (nh && nh.json) return Promise.resolve(JSON.parse(JSON.stringify(nh.json)));
  return fetch(BASE + 'atlas.json', { cache: 'no-cache' }).then(function (r) {
    if (!r.ok) throw new Error('Không tải được atlas.json (' + r.status + ')');
    return r.json();
  });
}
function dungAtlas(meta) {
  var nh = TV.ATLAS_NHUNG, file = meta.anh;
  var src = (nh && nh.anh && nh.anh[file]) || (BASE + file);
  return napAnh(src).then(function (im) {
    var c = document.createElement('canvas');
    c.width = im.naturalWidth || im.width; c.height = im.naturalHeight || im.height;
    c.getContext('2d').drawImage(im, 0, 0);
    var at = { canvas: c };
    for (var k in meta) if (k !== 'anh') at[k] = meta[k];
    if (!at.kiemTra) at.kiemTra = [];
    return at;
  });
}

TV.atlasInSan = napJson().then(function (js) {
  var keys = Object.keys(js);
  return Promise.all(keys.map(function (k) { return dungAtlas(js[k]); })).then(function (list) {
    var out = {};
    keys.forEach(function (k, i) { out[k] = list[i]; });
    if (!out.lam || !out.quaiChuong) throw new Error('atlas.json thiếu Lam hoặc Quái Chuông');
    return out;
  });
});
TV.atlasInSan.catch(function () {});   // tránh cảnh báo "unhandled"; demo.html tự xử lý lỗi
})(typeof window !== 'undefined' ? window : this);
