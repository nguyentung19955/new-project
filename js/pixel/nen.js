// SINH TỰ ĐỘNG bởi tools/build-pixel.js — đừng sửa tay (xung đột khi gộp nhánh: chạy lại node tools/build-pixel.js).
// Sprite pixel nhóm "nen": "<nhóm>/<mã>" → dải khung assets/pixel/<nhóm>/<mã>.png. Game dùng khi bật pixel (js/pixel.js).
window.PIXEL_MANIFEST = window.PIXEL_MANIFEST || {};
Object.assign(window.PIXEL_MANIFEST, {
"nen/co": {"name":"Cỏ","w":16,"h":16,"ax":8,"ay":15,"bbox":[0,0,16,16],"n":1,"anims":{"main":{"start":0,"n":1,"fps":1,"loop":true}}},
"nen/dat": {"name":"Đường đất","w":16,"h":16,"ax":8,"ay":15,"bbox":[0,0,16,16],"n":1,"anims":{"main":{"start":0,"n":1,"fps":1,"loop":true}}},
"nen/nuoc": {"name":"Nước","w":16,"h":16,"ax":8,"ay":15,"bbox":[0,0,16,16],"n":3,"anims":{"main":{"start":0,"n":3,"fps":3,"loop":true}}},
});
