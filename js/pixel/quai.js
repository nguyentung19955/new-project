// SINH TỰ ĐỘNG bởi tools/build-pixel.js — đừng sửa tay (xung đột khi gộp nhánh: chạy lại node tools/build-pixel.js).
// Sprite pixel nhóm "quai": "<nhóm>/<mã>" → dải khung assets/pixel/<nhóm>/<mã>.png. Game dùng khi bật pixel (js/pixel.js).
window.PIXEL_MANIFEST = window.PIXEL_MANIFEST || {};
Object.assign(window.PIXEL_MANIFEST, {
"quai/tom": {"name":"Tôm Binh","w":32,"h":32,"ax":16,"ay":28,"bbox":[2,1,29,28],"n":11,"anims":{"walk":{"start":0,"n":3,"fps":6,"loop":true},"attack":{"start":3,"n":3,"fps":8,"loop":false},"hurt":{"start":6,"n":2,"fps":8,"loop":false},"die":{"start":8,"n":3,"fps":5,"loop":false}},"cd":1},
});
