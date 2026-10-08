// SINH TỰ ĐỘNG bởi tools/build-pixel.js — đừng sửa tay (xung đột khi gộp nhánh: chạy lại node tools/build-pixel.js).
// Sprite pixel nhóm "icon": "<nhóm>/<mã>" → dải khung assets/pixel/<nhóm>/<mã>.png. Game dùng khi bật pixel (js/pixel.js).
window.PIXEL_MANIFEST = window.PIXEL_MANIFEST || {};
Object.assign(window.PIXEL_MANIFEST, {
"icon/hanh-kim": {"name":"Hành Kim","w":16,"h":16,"ax":8,"ay":15,"bbox":[0,0,16,16],"n":1,"anims":{"main":{"start":0,"n":1,"fps":1,"loop":true}}},
"icon/hanh-moc": {"name":"Hành Mộc","w":16,"h":16,"ax":8,"ay":15,"bbox":[0,0,16,16],"n":1,"anims":{"main":{"start":0,"n":1,"fps":1,"loop":true}}},
"icon/hanh-thuy": {"name":"Hành Thủy","w":16,"h":16,"ax":8,"ay":15,"bbox":[0,0,16,16],"n":1,"anims":{"main":{"start":0,"n":1,"fps":1,"loop":true}}},
});
