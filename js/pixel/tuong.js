// SINH TỰ ĐỘNG bởi tools/build-pixel.js — đừng sửa tay (xung đột khi gộp nhánh: chạy lại node tools/build-pixel.js).
// Sprite pixel nhóm "tuong": "<nhóm>/<mã>" → dải khung assets/pixel/<nhóm>/<mã>.png. Game dùng khi bật pixel (js/pixel.js).
window.PIXEL_MANIFEST = window.PIXEL_MANIFEST || {};
Object.assign(window.PIXEL_MANIFEST, {
"tuong/chodo": {"name":"Chàng Chèo Đò","w":32,"h":32,"ax":15,"ay":30,"bbox":[6,0,21,30],"n":14,"anims":{"idle":{"start":0,"n":2,"fps":3,"loop":true},"attack":{"start":2,"n":4,"fps":10,"loop":false},"cast":{"start":6,"n":3,"fps":8,"loop":true},"hurt":{"start":9,"n":2,"fps":8,"loop":false},"die":{"start":11,"n":3,"fps":5,"loop":false}},"cd":1},
"tuong/giong": {"name":"Thánh Gióng","w":32,"h":32,"ax":15,"ay":30,"bbox":[5,0,21,31],"n":14,"anims":{"idle":{"start":0,"n":2,"fps":3,"loop":true},"attack":{"start":2,"n":4,"fps":10,"loop":false},"cast":{"start":6,"n":3,"fps":8,"loop":true},"hurt":{"start":9,"n":2,"fps":8,"loop":false},"die":{"start":11,"n":3,"fps":5,"loop":false}},"cd":1},
"tuong/tanvien": {"name":"Sơn Tinh","w":32,"h":32,"ax":15,"ay":30,"bbox":[5,0,21,31],"n":14,"anims":{"idle":{"start":0,"n":2,"fps":3,"loop":true},"attack":{"start":2,"n":4,"fps":10,"loop":false},"cast":{"start":6,"n":3,"fps":6,"loop":true},"hurt":{"start":9,"n":2,"fps":8,"loop":false},"die":{"start":11,"n":3,"fps":5,"loop":false}},"cd":1},
});
