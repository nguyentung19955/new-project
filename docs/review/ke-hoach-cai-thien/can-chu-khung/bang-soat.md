# Bảng soát đầy đủ — chữ trong khung (màn 844×390, cả VI và EN)

Tự dựng bằng `cong-cu/bang-soat.py` từ số đo `cong-cu/do-can-chu.py` (ảnh chụp tự động, không chơi thử). Mỗi dòng: một khung có chữ.
"Lệch N / D": lệch tâm ngang / dọc lớn nhất của chữ trong khung so với tâm LÒNG khung (điểm game, + là lệch phải / xuống); "–": không soát chiều đó
(chữ căn trái / phải, hoặc khung lớn). Trước = `?canchucu=1`, sau = bản mới. Lỗi: tên lỗi còn lại sau khi sửa.
**Tổng: 884 khung-lượt (VI + EN) — đạt 814 (trong đó 149 đã sửa), còn lỗi 70.** Chỗ còn lỗi và lý do: `bao-cao.md` mục "Chưa sửa / cố ý".


## Tiếng Việt

| Màn | Khung | Chữ | Lệch N trước → sau | Lệch D trước → sau | Lỗi trước | Lỗi sau | Kết quả |
|---|---|---|---|---|---|---|---|
| chao | dải thông báo `gd-dai-thong-bao` 131×18 | Chạm để bắt đầu | -0,2 → -0,2 | -0,5 → -0,5 | chạm viền | chạm viền | còn: chạm viền |
| chao | nút `gd-nut-thuong` 108×22 | Đăng nhập Google | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| chao | nút `gd-nut-thuong` 108×22 | 🏆 Bảng vàng | -0,0 → -0,0 | +0,0 → +0,0 | – | – | đạt |
| chao | nút nhỏ `gd-nut-thuong` 52×16 | EN / VI | -0,1 → -0,1 | -0,5 → -0,5 | – | – | đạt |
| chao-co-luu | dải thông báo `gd-dai-thong-bao` 131×18 | Chạm để bắt đầu | -0,2 → -0,2 | -0,5 → -0,5 | chạm viền | chạm viền | còn: chạm viền |
| chao-co-luu | nút `gd-nut-thuong` 108×22 | Đăng nhập Google | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| chao-co-luu | nút `gd-nut-thuong` 108×22 | 🏆 Bảng vàng | -0,0 → -0,0 | +0,0 → +0,0 | – | – | đạt |
| chao-co-luu | nút nhỏ `gd-nut-thuong` 52×16 | EN / VI | -0,1 → -0,1 | -0,5 → -0,5 | – | – | đạt |
| truyen | nút nhỏ `gd-nut-thuong` 90×32 | Bỏ qua ✕ | -0,1 → -0,1 | +3,5 → +0,0 | lệch dọc | – | **đã sửa** |
| lang | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| lang | dải thông báo `gd-dai-thong-bao` 286×18 | Mở mới: Sổ yêu quái, Việc hôm nay, Thành tựu, … | – → – | – → – | – | – | đạt |
| lang | tấm nhỏ `gd-khung-nho` 44×31 | Hành trang | -0,1 → -0,1 | -0,9 → -1,2 | tràn | – | **đã sửa** |
| lai-do | thẻ Sắp có `gd-the-sap-co` 39×10 | sắp có | +0,0 → +0,0 | -0,5 → -0,5 | – | – | đạt |
| lai-do | thẻ Sắp có `gd-the-sap-co` 39×10 | sắp có | +0,0 → +0,0 | -0,5 → -0,5 | – | – | đạt |
| lai-do | thẻ Sắp có `gd-the-sap-co` 39×10 | sắp có | +0,0 → +0,0 | -0,5 → -0,5 | – | – | đạt |
| lai-do | nút nhỏ `gd-nut-thuong` 68×18 | ✕ Về làng | +0,1 → -0,2 | -0,5 → -0,5 | chạm viền | chạm viền | còn: chạm viền |
| lai-do | nút nhỏ `gd-nut-thuong` 68×18 | Sông sâu › | -0,0 → -0,0 | -1,0 → -1,0 | – | – | đạt |
| lai-do | nút nhỏ `gd-nut-thuong` 68×18 | Ải ngày | +0,4 → +0,4 | -0,5 → -0,5 | chạm viền | chạm viền | còn: chạm viền |
| lai-do | bảng `gd-khung-bang` 232×66 | Hang biển · Ải 3 / Trùm nhỏ Cua Đá · 8 phòng ·… | – → – | – → – | – | – | đạt |
| lai-do | nút `gd-nut-chinh` 64×38 | Lên đò | +0,2 → +0,2 | +3,2 → +0,2 | lệch dọc | – | **đã sửa** |
| lo-ren-mai | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| lo-ren-mai | bảng `gd-khung-bang` 326×226 | Lò rèn / Nguyên liệu rèn: 0 · Linh khí: 0 · Và… | – → – | – → – | – | – | đạt |
| lo-ren-mai | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Xong | -0,0 → -0,2 | -1,0 → -1,0 | – | – | đạt |
| lo-ren-mai | nút `gd-nut-chinh` 303×22 | Luyện | – → – | – → – | – | – | đạt |
| lo-ren-mai | ảnh khung `gd-o-ep-1` 32×32 | 1 | – → – | – → – | – | – | đạt |
| lo-ren-mai | ô con `gd-o-con-chon` 100×36 | Kiếm / Lv 3 · ★ | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-mai | ảnh khung `gd-o-ep-1` 32×32 | 1 | – → – | – → – | – | – | đạt |
| lo-ren-mai | ô con `gd-o-con` 100×36 | Phi tiêu / Lv 3 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-mai | ô con `gd-o-con` 100×36 | Thương / Lv 1 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-mai | ô con `gd-o-con` 100×36 | Búa / Lv 1 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-mai | ô con `gd-o-con` 198×156 | Kiếm tập sự · Luyện 3/15 / Sức mạnh vũ khí ×1,… | – → – | – → – | cắt, tràn | cắt | còn: cắt |
| lo-ren-mai | nút nhỏ `gd-nut-thuong` 61×13 | Lửa | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-mai | nút nhỏ `gd-nut-thuong` 61×13 | Độc | +0,2 → +0,2 | -1,1 → -1,1 | chạm viền | chạm viền | còn: chạm viền |
| lo-ren-mai | nút nhỏ `gd-nut-thuong` 61×13 | Băng | +0,1 → +0,1 | -1,1 → -1,1 | chạm viền | chạm viền | còn: chạm viền |
| lo-ren-mai | nút nhỏ `gd-nut-thuong` 76×16 | Luyện lên 4 | -0,0 → +0,3 | -1,0 → -1,0 | chạm viền | – | **đã sửa** |
| lo-ren-mai | thẻ tên hộp thoại 59×14 | Ông Thợ Rèn | +0,2 → -0,2 | +0,0 → -0,5 | chạm viền | – | **đã sửa** |
| lo-ren-mai | hộp thoại `gd-khung-thoai` 150×63 | Luyện vũ khí cần vàng, linh khí, / nguyên liệu… | – → – | – → – | – | – | đạt |
| lo-ren-linh-khi | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| lo-ren-linh-khi | bảng `gd-khung-bang` 326×226 | Lò rèn / Nguyên liệu rèn: 0 · Linh khí: 0 · Và… | – → – | – → – | – | – | đạt |
| lo-ren-linh-khi | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Xong | -0,0 → -0,2 | -1,0 → -1,0 | – | – | đạt |
| lo-ren-linh-khi | nút `gd-nut-chinh` 303×22 | Luyện | – → – | – → – | – | – | đạt |
| lo-ren-linh-khi | ảnh khung `gd-o-ep-1` 32×32 | 1 | – → – | – → – | – | – | đạt |
| lo-ren-linh-khi | ô con `gd-o-con-chon` 100×36 | Kiếm / Lv 3 · ★ | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-linh-khi | ảnh khung `gd-o-ep-1` 32×32 | 1 | – → – | – → – | – | – | đạt |
| lo-ren-linh-khi | ô con `gd-o-con` 100×36 | Phi tiêu / Lv 3 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-linh-khi | ô con `gd-o-con` 100×36 | Thương / Lv 1 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-linh-khi | ô con `gd-o-con` 100×36 | Búa / Lv 1 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-linh-khi | ô con `gd-o-con` 198×156 | Kiếm tập sự · Luyện 3/15 / Sức mạnh vũ khí ×1,… | – → – | – → – | cắt, tràn | cắt | còn: cắt |
| lo-ren-linh-khi | nút nhỏ `gd-nut-thuong` 61×13 | Lửa | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-linh-khi | nút nhỏ `gd-nut-thuong` 61×13 | Độc | +0,2 → +0,2 | -1,1 → -1,1 | chạm viền | chạm viền | còn: chạm viền |
| lo-ren-linh-khi | nút nhỏ `gd-nut-thuong` 61×13 | Băng | +0,1 → +0,1 | -1,1 → -1,1 | chạm viền | chạm viền | còn: chạm viền |
| lo-ren-linh-khi | nút nhỏ `gd-nut-thuong` 76×16 | Luyện lên 4 | -0,0 → +0,3 | -1,0 → -1,0 | chạm viền | – | **đã sửa** |
| lo-ren-linh-khi | thẻ tên hộp thoại 59×14 | Ông Thợ Rèn | +0,2 → -0,2 | +0,0 → -0,5 | chạm viền | – | **đã sửa** |
| lo-ren-linh-khi | hộp thoại `gd-khung-thoai` 150×63 | Luyện vũ khí cần vàng, linh khí, / nguyên liệu… | – → – | – → – | – | – | đạt |
| lo-ren-ep | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| lo-ren-ep | bảng `gd-khung-bang` 326×226 | Lò rèn / Nguyên liệu rèn: 0 · Linh khí: 0 · Và… | – → – | – → – | – | – | đạt |
| lo-ren-ep | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Xong | -0,0 → -0,2 | -1,0 → -1,0 | – | – | đạt |
| lo-ren-ep | nút `gd-nut-chinh` 303×22 | Luyện | – → – | – → – | – | – | đạt |
| lo-ren-ep | ảnh khung `gd-o-ep-1` 32×32 | 1 | – → – | – → – | – | – | đạt |
| lo-ren-ep | ô con `gd-o-con-chon` 100×36 | Kiếm / Lv 3 · ★ | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-ep | ảnh khung `gd-o-ep-1` 32×32 | 1 | – → – | – → – | – | – | đạt |
| lo-ren-ep | ô con `gd-o-con` 100×36 | Phi tiêu / Lv 3 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-ep | ô con `gd-o-con` 100×36 | Thương / Lv 1 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-ep | ô con `gd-o-con` 100×36 | Búa / Lv 1 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-ep | ô con `gd-o-con` 198×156 | Kiếm tập sự · Luyện 3/15 / Sức mạnh vũ khí ×1,… | – → – | – → – | cắt, tràn | cắt | còn: cắt |
| lo-ren-ep | nút nhỏ `gd-nut-thuong` 61×13 | Lửa | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-ep | nút nhỏ `gd-nut-thuong` 61×13 | Độc | +0,2 → +0,2 | -1,1 → -1,1 | chạm viền | chạm viền | còn: chạm viền |
| lo-ren-ep | nút nhỏ `gd-nut-thuong` 61×13 | Băng | +0,1 → +0,1 | -1,1 → -1,1 | chạm viền | chạm viền | còn: chạm viền |
| lo-ren-ep | nút nhỏ `gd-nut-thuong` 76×16 | Luyện lên 4 | -0,0 → +0,3 | -1,0 → -1,0 | chạm viền | – | **đã sửa** |
| lo-ren-ep | thẻ tên hộp thoại 59×14 | Ông Thợ Rèn | +0,2 → -0,2 | +0,0 → -0,5 | chạm viền | – | **đã sửa** |
| lo-ren-ep | hộp thoại `gd-khung-thoai` 150×63 | Luyện vũ khí cần vàng, linh khí, / nguyên liệu… | – → – | – → – | – | – | đạt |
| lo-ren-nang-lo | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| lo-ren-nang-lo | bảng `gd-khung-bang` 326×226 | Lò rèn / Nguyên liệu rèn: 0 · Linh khí: 0 · Và… | – → – | – → – | – | – | đạt |
| lo-ren-nang-lo | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Xong | -0,0 → -0,2 | -1,0 → -1,0 | – | – | đạt |
| lo-ren-nang-lo | nút `gd-nut-chinh` 303×22 | Luyện | – → – | – → – | – | – | đạt |
| lo-ren-nang-lo | ảnh khung `gd-o-ep-1` 32×32 | 1 | – → – | – → – | – | – | đạt |
| lo-ren-nang-lo | ô con `gd-o-con-chon` 100×36 | Kiếm / Lv 3 · ★ | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-nang-lo | ảnh khung `gd-o-ep-1` 32×32 | 1 | – → – | – → – | – | – | đạt |
| lo-ren-nang-lo | ô con `gd-o-con` 100×36 | Phi tiêu / Lv 3 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-nang-lo | ô con `gd-o-con` 100×36 | Thương / Lv 1 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-nang-lo | ô con `gd-o-con` 100×36 | Búa / Lv 1 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-nang-lo | ô con `gd-o-con` 198×156 | Kiếm tập sự · Luyện 3/15 / Sức mạnh vũ khí ×1,… | – → – | – → – | cắt, tràn | cắt | còn: cắt |
| lo-ren-nang-lo | nút nhỏ `gd-nut-thuong` 61×13 | Lửa | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-nang-lo | nút nhỏ `gd-nut-thuong` 61×13 | Độc | +0,2 → +0,2 | -1,1 → -1,1 | chạm viền | chạm viền | còn: chạm viền |
| lo-ren-nang-lo | nút nhỏ `gd-nut-thuong` 61×13 | Băng | +0,1 → +0,1 | -1,1 → -1,1 | chạm viền | chạm viền | còn: chạm viền |
| lo-ren-nang-lo | nút nhỏ `gd-nut-thuong` 76×16 | Luyện lên 4 | -0,0 → +0,3 | -1,0 → -1,0 | chạm viền | – | **đã sửa** |
| lo-ren-nang-lo | thẻ tên hộp thoại 59×14 | Ông Thợ Rèn | +0,2 → -0,2 | +0,0 → -0,5 | chạm viền | – | **đã sửa** |
| lo-ren-nang-lo | hộp thoại `gd-khung-thoai` 150×63 | Luyện vũ khí cần vàng, linh khí, / nguyên liệu… | – → – | – → – | – | – | đạt |
| hang-xen | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| hang-xen | bảng `gd-khung-bang` 326×226 | Hàng xén / 150 đổi 1 nguyên liệu của vùng đã h… | – → – | – → – | – | – | đạt |
| hang-xen | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Xong | -0,0 → -0,2 | -1,0 → -1,0 | – | – | đạt |
| hang-xen | nút nhỏ `gd-nut-chon` 66×17 | Nguyên liệu | -0,0 → -0,0 | -1,0 → -1,0 | – | – | đạt |
| hang-xen | nút nhỏ `gd-nut-thuong` 37×17 | NLR | +0,4 → +0,4 | -0,0 → -0,0 | chạm viền | chạm viền | còn: chạm viền |
| hang-xen | ô con `gd-o-con` 304×40 | Gỗ linh / Đang có 12 · vùng Rừng già | – → – | – → – | – | – | đạt |
| hang-xen | nút nhỏ `gd-nut-thuong` 76×28 | Hết lượt đổi | -0,0 → -0,0 | +2,2 → +0,0 | lệch dọc | – | **đã sửa** |
| hang-xen | nút nhỏ `gd-nut-thuong` 80×28 | Đổi 1 (150) | +0,1 → +0,1 | +3,0 → +0,0 | lệch dọc | – | **đã sửa** |
| hang-xen | ô con `gd-o-con` 304×40 | Vảy cá / Đang có 7 · vùng Hang biển | – → – | – → – | – | – | đạt |
| hang-xen | nút nhỏ `gd-nut-thuong` 76×28 | Hạ Ngư / Tinh để mở | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| hang-xen | nút nhỏ `gd-nut-thuong` 80×28 | Đổi 1 (150) | +0,1 → +0,1 | +3,0 → +0,0 | lệch dọc | – | **đã sửa** |
| hang-xen | ô con `gd-o-con` 304×40 | Đá lửa / Đang có 3 · vùng Lâu đài cổ | – → – | – → – | – | – | đạt |
| hang-xen | nút nhỏ `gd-nut-thuong` 76×28 | Hạ Hồ Tinh để mở | +0,2 → +0,0 | +0,0 → +0,0 | – | – | đạt |
| hang-xen | nút nhỏ `gd-nut-thuong` 80×28 | Đổi 1 (150) | +0,1 → +0,1 | +3,0 → +0,0 | lệch dọc | – | **đã sửa** |
| hang-xen | thẻ tên hộp thoại 59×14 | Bà Hàng Xén | +0,2 → +0,2 | -1,0 → -1,0 | – | – | đạt |
| hang-xen | hộp thoại `gd-khung-thoai` 150×41 | Hết hàng rồi cháu ạ. Thắng thêm / ải là bà lại… | – → – | – → – | – | – | đạt |
| hang-xen-quang | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| hang-xen-quang | bảng `gd-khung-bang` 326×226 | Hàng xén / 40 một nguyên liệu rèn. Mỗi ngày bà… | – → – | – → – | – | – | đạt |
| hang-xen-quang | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Xong | -0,0 → -0,2 | -1,0 → -1,0 | – | – | đạt |
| hang-xen-quang | nút nhỏ `gd-nut-thuong` 66×17 | Nguyên liệu | -0,0 → -0,0 | -1,0 → -1,0 | – | – | đạt |
| hang-xen-quang | nút nhỏ `gd-nut-chon` 37×17 | NLR | +0,4 → +0,4 | +0,2 → +0,0 | tràn | chạm viền | còn: chạm viền |
| hang-xen-quang | ô con `gd-o-con` 304×40 | Nguyên liệu rèn / Đang có 0 · dùng để luyện vũ… | – → – | – → – | – | – | đạt |
| hang-xen-quang | nút nhỏ `gd-nut-thuong` 76×20 | Mua 1 (40) | +0,1 → +0,1 | +0,0 → +0,0 | – | – | đạt |
| hang-xen-quang | nút nhỏ `gd-nut-thuong` 80×20 | Mua 5 (200) | +0,1 → +0,1 | +0,0 → +0,0 | – | – | đạt |
| hang-xen-quang | thẻ tên hộp thoại 59×14 | Bà Hàng Xén | +0,2 → +0,2 | -1,0 → -1,0 | – | – | đạt |
| hang-xen-quang | hộp thoại `gd-khung-thoai` 150×52 | Thiếu quặng mài vũ khí / thì mua của bà, mỗi /… | – → – | – → – | – | – | đạt |
| tho-may | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| tho-may | bảng `gd-khung-bang` 326×226 | Thợ may / Vàng: 4.321 / Hạ trùm vùng thì cô bà… | – → – | – → – | tràn | – | **đã sửa** |
| tho-may | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Xong | -0,0 → -0,2 | -1,0 → -1,0 | – | – | đạt |
| tho-may | nút `gd-nut-thuong` 98×22 | Nâng cấp | -0,0 → -0,0 | +0,0 → +0,0 | – | – | đạt |
| tho-may | nút `gd-nut-chinh` 98×22 | Mua | +0,2 → +0,2 | +0,2 → +0,0 | – | – | đạt |
| tho-may | ô con `gd-o-con` 100×128 | Thợ Săn Rừng / 1.500 / Đủ vàng rồi! | – → – | – → – | – | – | đạt |
| tho-may | nút nhỏ `gd-nut-chinh` 84×17 | Mua | -0,2 → -0,2 | -0,5 → -0,5 | – | – | đạt |
| tho-may | ô con `gd-o-con` 100×128 | Chiến Binh Biển / 3.000 / Hạ Ngư Tinh để mở bán | – → – | – → – | – | – | đạt |
| tho-may | ô con `gd-o-con` 100×128 | Hiệp Sĩ Lâu Đài / 5.000 / Hạ Hồ Tinh để mở bán | – → – | – → – | – | – | đạt |
| tho-may | thẻ tên hộp thoại 56×14 | Cô Thợ May | +0,2 → +0,2 | -1,0 → -1,0 | – | – | đạt |
| tho-may | hộp thoại `gd-khung-thoai` 150×41 | Bộ Thợ Săn Rừng may xong rồi, / 1.500 thôi chá… | – → – | – → – | – | – | đạt |
| cu-do | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| cu-do | bảng `gd-khung-bang` 326×226 | Gốc đa: chưởng của Cu Tí / Điểm chưởng: còn 14… | – → – | – → – | – | – | đạt |
| cu-do | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Xong | -0,0 → -0,2 | -1,0 → -1,0 | – | – | đạt |
| cu-do | nút `gd-nut-thuong` 73×22 | Cây kỹ năng | -0,1 → -0,1 | -0,2 → -0,2 | – | – | đạt |
| cu-do | nút `gd-nut-chinh` 73×22 | Cây chưởng | -0,1 → -0,1 | -0,2 → -0,2 | – | – | đạt |
| cu-do | nút `gd-nut-thuong` 73×22 | Hướng dẫn | -0,2 → -0,2 | -0,5 → -0,5 | – | – | đạt |
| cu-do | nút `gd-nut-thuong` 73×22 | Bảng vàng | +0,1 → +0,1 | -0,8 → -0,8 | – | – | đạt |
| cu-do | ô con `gd-o-con-chon` 98×120 | Hỏa chưởng | – → – | – → – | chạm viền | – | **đã sửa** |
| cu-do | ô con `gd-o-con` 44×18 | Hỏa lực / + | – → – | +0,4 → +0,4 | – | – | đạt |
| cu-do | ô con `gd-o-con` 44×18 | Nổ to / + | – → – | +0,9 → +0,8 | – | – | đạt |
| cu-do | ô con `gd-o-con` 44×18 | Vệt cháy / cần 5 | – → – | +0,4 → -0,1 | chữ đè chữ | chạm viền | còn: chạm viền |
| cu-do | ô con `gd-o-con` 44×18 | Lửa dai / cần 5 | – → – | +0,9 → +0,2 | chữ đè chữ | chạm viền | còn: chạm viền |
| cu-do | ô con `gd-o-con` 92×18 | Tích lực / cần 10 | – → – | +0,4 → +0,0 | – | – | đạt |
| cu-do | ô con `gd-o-con` 92×18 | Mưa tàn lửa / cần 18 | – → – | +0,9 → +0,0 | – | – | đạt |
| cu-do | ô con `gd-o-con` 90×15 | ✓ Đang dùng | +0,1 → +0,1 | +0,1 → +0,1 | – | – | đạt |
| cu-do | ô con `gd-o-con` 98×120 | Độc chưởng | – → – | – → – | – | – | đạt |
| cu-do | ô con `gd-o-con` 44×18 | Độc lực | – → – | -2,4 → +0,0 | lệch dọc | – | **đã sửa** |
| cu-do | ô con `gd-o-con` 44×18 | Mây dày | – → – | -2,4 → +0,0 | lệch dọc | – | **đã sửa** |
| cu-do | ô con `gd-o-con` 44×18 | Lây độc / cần 5 | – → – | +0,4 → -0,1 | chữ đè chữ | chạm viền | còn: chạm viền |
| cu-do | ô con `gd-o-con` 44×18 | Ăn mòn / cần 5 | – → – | +1,1 → +0,7 | chữ đè chữ | chạm viền, chữ đè chữ | còn: chạm viền, chữ đè chữ |
| cu-do | ô con `gd-o-con` 92×18 | Tam xà / cần 10 | – → – | +0,9 → +0,0 | – | – | đạt |
| cu-do | ô con `gd-o-con` 92×18 | Vạn độc / cần 18 | – → – | +0,4 → +0,0 | – | – | đạt |
| cu-do | nút nhỏ `gd-nut-thuong` 90×15 | Dùng cây này | +0,1 → +0,1 | -1,0 → -1,0 | – | – | đạt |
| cu-do | ô con `gd-o-con` 98×120 | Băng chưởng | – → – | – → – | – | – | đạt |
| cu-do | ô con `gd-o-con` 44×18 | Hàn lực | – → – | -2,4 → +0,0 | lệch dọc | – | **đã sửa** |
| cu-do | ô con `gd-o-con` 44×18 | Tầm xa | – → – | -1,4 → +0,0 | – | – | đạt |
| cu-do | ô con `gd-o-con` 44×18 | Xuyên băng / cần 5 | – → – | +0,4 → +0,3 | chữ đè chữ | chạm viền, chữ đè chữ | còn: chạm viền, chữ đè chữ |
| cu-do | ô con `gd-o-con` 44×18 | Đóng băng / cần 5 | – → – | +0,4 → -0,1 | chữ đè chữ | chạm viền | còn: chạm viền |
| cu-do | ô con `gd-o-con` 92×18 | Băng vỡ / cần 10 | – → – | +0,4 → +0,0 | – | – | đạt |
| cu-do | ô con `gd-o-con` 92×18 | Băng phong / cần 18 | – → – | +0,4 → +0,0 | – | – | đạt |
| cu-do | nút nhỏ `gd-nut-thuong` 90×15 | Dùng cây này | +0,1 → +0,1 | -1,0 → -1,0 | – | – | đạt |
| cu-do | ô con `gd-o-con` 304×31 | Hỏa lực 0/5 · Hỏa chưởng / Mỗi bậc: sát thương… | – → – | – → – | – | – | đạt |
| cu-do | nút nhỏ `gd-nut-chinh` 54×18 | Học | +0,1 → +0,1 | -1,0 → -1,0 | – | – | đạt |
| cu-do | thẻ tên hộp thoại 35×14 | Cụ Đồ | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| cu-do | hộp thoại `gd-khung-thoai` 150×52 | Con còn 14 điểm chưởng. / Chạm một nút để xem,… | – → – | – → – | – | – | đạt |
| cu-do-chuong | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| cu-do-chuong | bảng `gd-khung-bang` 326×226 | Gốc đa: chưởng của Cu Tí / Điểm chưởng: còn 14… | – → – | – → – | – | – | đạt |
| cu-do-chuong | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Xong | -0,0 → -0,2 | -1,0 → -1,0 | – | – | đạt |
| cu-do-chuong | nút `gd-nut-thuong` 73×22 | Cây kỹ năng | -0,1 → -0,1 | -0,2 → -0,2 | – | – | đạt |
| cu-do-chuong | nút `gd-nut-chinh` 73×22 | Cây chưởng | -0,1 → -0,1 | -0,2 → -0,2 | – | – | đạt |
| cu-do-chuong | nút `gd-nut-thuong` 73×22 | Hướng dẫn | -0,2 → -0,2 | -0,5 → -0,5 | – | – | đạt |
| cu-do-chuong | nút `gd-nut-thuong` 73×22 | Bảng vàng | +0,1 → +0,1 | -0,8 → -0,8 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con-chon` 98×120 | Hỏa chưởng | – → – | – → – | chạm viền | – | **đã sửa** |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Hỏa lực / + | – → – | +0,4 → +0,4 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Nổ to / + | – → – | +0,9 → +0,8 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Vệt cháy / cần 5 | – → – | +0,4 → -0,1 | chữ đè chữ | chạm viền | còn: chạm viền |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Lửa dai / cần 5 | – → – | +0,9 → +0,2 | chữ đè chữ | chạm viền | còn: chạm viền |
| cu-do-chuong | ô con `gd-o-con` 92×18 | Tích lực / cần 10 | – → – | +0,4 → +0,0 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 92×18 | Mưa tàn lửa / cần 18 | – → – | +0,9 → +0,0 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 90×15 | ✓ Đang dùng | +0,1 → +0,1 | +0,1 → +0,1 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 98×120 | Độc chưởng | – → – | – → – | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Độc lực | – → – | -2,4 → +0,0 | lệch dọc | – | **đã sửa** |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Mây dày | – → – | -2,4 → +0,0 | lệch dọc | – | **đã sửa** |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Lây độc / cần 5 | – → – | +0,4 → -0,1 | chữ đè chữ | chạm viền | còn: chạm viền |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Ăn mòn / cần 5 | – → – | +1,1 → +0,7 | chữ đè chữ | chạm viền, chữ đè chữ | còn: chạm viền, chữ đè chữ |
| cu-do-chuong | ô con `gd-o-con` 92×18 | Tam xà / cần 10 | – → – | +0,9 → +0,0 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 92×18 | Vạn độc / cần 18 | – → – | +0,4 → +0,0 | – | – | đạt |
| cu-do-chuong | nút nhỏ `gd-nut-thuong` 90×15 | Dùng cây này | +0,1 → +0,1 | -1,0 → -1,0 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 98×120 | Băng chưởng | – → – | – → – | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Hàn lực | – → – | -2,4 → +0,0 | lệch dọc | – | **đã sửa** |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Tầm xa | – → – | -1,4 → +0,0 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Xuyên băng / cần 5 | – → – | +0,4 → +0,3 | chữ đè chữ | chạm viền, chữ đè chữ | còn: chạm viền, chữ đè chữ |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Đóng băng / cần 5 | – → – | +0,4 → -0,1 | chữ đè chữ | chạm viền | còn: chạm viền |
| cu-do-chuong | ô con `gd-o-con` 92×18 | Băng vỡ / cần 10 | – → – | +0,4 → +0,0 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 92×18 | Băng phong / cần 18 | – → – | +0,4 → +0,0 | – | – | đạt |
| cu-do-chuong | nút nhỏ `gd-nut-thuong` 90×15 | Dùng cây này | +0,1 → +0,1 | -1,0 → -1,0 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 304×31 | Hỏa lực 0/5 · Hỏa chưởng / Mỗi bậc: sát thương… | – → – | – → – | – | – | đạt |
| cu-do-chuong | nút nhỏ `gd-nut-chinh` 54×18 | Học | +0,1 → +0,1 | -1,0 → -1,0 | – | – | đạt |
| cu-do-chuong | thẻ tên hộp thoại 35×14 | Cụ Đồ | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| cu-do-chuong | hộp thoại `gd-khung-thoai` 150×52 | Con còn 14 điểm chưởng. / Chạm một nút để xem,… | – → – | – → – | – | – | đạt |
| cu-do-huong-dan | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| cu-do-huong-dan | bảng `gd-khung-bang` 326×226 | Gốc đa: hướng dẫn / Đi lại trong làng / Kéo ở … | – → – | – → – | – | – | đạt |
| cu-do-huong-dan | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Xong | -0,0 → -0,2 | -1,0 → -1,0 | – | – | đạt |
| cu-do-huong-dan | nút `gd-nut-thuong` 73×22 | Cây kỹ năng | -0,1 → -0,1 | -0,2 → -0,2 | – | – | đạt |
| cu-do-huong-dan | nút `gd-nut-thuong` 73×22 | Cây chưởng | -0,1 → -0,1 | -0,2 → -0,2 | – | – | đạt |
| cu-do-huong-dan | nút `gd-nut-chinh` 73×22 | Hướng dẫn | -0,2 → -0,2 | -0,5 → -0,5 | – | – | đạt |
| cu-do-huong-dan | nút `gd-nut-thuong` 73×22 | Bảng vàng | +0,1 → +0,1 | -0,8 → -0,8 | – | – | đạt |
| cu-do-huong-dan | nút nhỏ `gd-nut-thuong` 30×18 | ‹ | -0,0 → -0,0 | -0,5 → -0,5 | – | – | đạt |
| cu-do-huong-dan | nút nhỏ `gd-nut-thuong` 30×18 | › | -0,0 → -0,0 | -0,5 → -0,5 | – | – | đạt |
| cu-do-huong-dan | thẻ tên hộp thoại 35×14 | Cụ Đồ | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| cu-do-huong-dan | hộp thoại `gd-khung-thoai` 150×52 | Lão chép cả ra đây, con / đọc thong thả. Bấm m… | – → – | – → – | – | – | đạt |
| bang-vang | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| bang-vang | bảng `gd-khung-bang` 326×226 | Gốc đa: bảng vàng / Xếp hạng theo Sức mạnh | – → – | – → – | – | – | đạt |
| bang-vang | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Xong | -0,0 → -0,2 | -1,0 → -1,0 | – | – | đạt |
| bang-vang | nút `gd-nut-thuong` 73×22 | Cây kỹ năng | -0,1 → -0,1 | -0,2 → -0,2 | – | – | đạt |
| bang-vang | nút `gd-nut-thuong` 73×22 | Cây chưởng | -0,1 → -0,1 | -0,2 → -0,2 | – | – | đạt |
| bang-vang | nút `gd-nut-thuong` 73×22 | Hướng dẫn | -0,2 → -0,2 | -0,5 → -0,5 | – | – | đạt |
| bang-vang | nút `gd-nut-chinh` 73×22 | Bảng vàng | +0,1 → +0,1 | -0,8 → -0,8 | – | – | đạt |
| bang-vang | ô con `gd-o-con` 304×104 | Bảng vàng cần mạng. Chưa bật lưu mây: chỉ lưu … | – → – | – → – | – | – | đạt |
| bang-vang | ô con `gd-o-con` 94×28 | Sức mạnh / 195 | +0,3 → +0,3 | -0,6 → -0,6 | – | – | đạt |
| bang-vang | ô con `gd-o-con` 94×28 | Tổng sao / ★ 13 | +0,3 → +0,3 | -0,6 → -0,6 | – | – | đạt |
| bang-vang | ô con `gd-o-con` 94×28 | Xa nhất / Hang biển 2 | -0,2 → -0,2 | -0,6 → -0,6 | – | – | đạt |
| bang-vang | thẻ tên hộp thoại 35×14 | Cụ Đồ | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| bang-vang | hộp thoại `gd-khung-thoai` 150×41 | Bảng vàng treo ở đình, phải có / mạng mới xem … | – → – | – → – | – | – | đạt |
| ong-tu | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| ong-tu | bảng `gd-khung-bang` 326×226 | Sân đình / Cu Tí · cấp 14 / Sức mạnh 195 | – → – | – → – | – | – | đạt |
| ong-tu | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Xong | -0,0 → -0,2 | -1,0 → -1,0 | – | – | đạt |
| ong-tu | nút nhỏ `gd-nut-chon` 42×17 | Cu Tí | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| ong-tu | nút nhỏ `gd-nut-thuong` 32×17 | Sổ | +0,0 → +0,0 | -0,0 → -0,0 | – | – | đạt |
| ong-tu | nút nhỏ `gd-nut-thuong` 60×17 | Thành tựu | -0,0 → -0,0 | -1,0 → -1,0 | – | – | đạt |
| ong-tu | ô con `gd-o-con` 304×34 | Cu Tèo / còn bị Mộc Tinh bắt / Hạ Mộc Tinh để … | – → – | – → – | – | – | đạt |
| ong-tu | ô con `gd-o-con` 304×34 | Cái Bống / còn bị Ngư Tinh bắt / Hạ Ngư Tinh đ… | – → – | – → – | – | – | đạt |
| ong-tu | ô con `gd-o-con` 304×34 | Cu Lì / còn bị Hồ Tinh bắt / Hạ Hồ Tinh để cứu… | – → – | – → – | – | – | đạt |
| ong-tu | thẻ tên hộp thoại 39×14 | Ông Từ | +0,0 → +0,2 | +0,0 → -0,5 | chạm viền | – | **đã sửa** |
| ong-tu | hộp thoại `gd-khung-thoai` 150×63 | Khẽ thôi, các bé đang chơi trong / sân. Còn 3 … | – → – | – → – | – | – | đạt |
| so-yeu-quai | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| so-yeu-quai | bảng `gd-khung-bang` 326×226 | Sân đình | – → – | – → – | – | – | đạt |
| so-yeu-quai | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Xong | -0,0 → -0,2 | -1,0 → -1,0 | – | – | đạt |
| so-yeu-quai | nút nhỏ `gd-nut-thuong` 42×17 | Cu Tí | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| so-yeu-quai | nút nhỏ `gd-nut-chon` 32×17 | Sổ | +0,0 → +0,0 | +0,0 → +0,0 | – | – | đạt |
| so-yeu-quai | nút nhỏ `gd-nut-thuong` 60×17 | Thành tựu | -0,0 → -0,0 | -1,0 → -1,0 | – | – | đạt |
| so-yeu-quai | nút nhỏ `gd-nut-chon` 99×16 | Rừng già | -0,7 → +0,1 | -1,0 → -1,0 | – | – | đạt |
| so-yeu-quai | nút nhỏ `gd-nut-thuong` 99×16 | Hang biển | -0,0 → -0,0 | -0,5 → -0,5 | chạm viền | chạm viền | còn: chạm viền |
| so-yeu-quai | nút nhỏ `gd-nut-thuong` 99×16 | Lâu đài cổ | +0,2 → +0,0 | +0,0 → +0,0 | chạm viền | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ô con `gd-o-con` 133×70 | Hoàn thành vùng / ★★ 0/12 · ★★★ 0/12 / Đủ 12 t… | – → – | – → – | tràn | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 41×41 | ? | +0,0 → +0,0 | – → – | – | – | đạt |
| so-yeu-quai | ảnh khung `gd-so-trang` 166×173 | ??? / Chưa gặp / Điểm yếu: ? | – → – | – → – | – | – | đạt |
| so-yeu-quai | thẻ tên hộp thoại 39×14 | Ông Từ | +0,0 → +0,2 | +0,0 → -0,5 | chạm viền | – | **đã sửa** |
| so-yeu-quai | hộp thoại `gd-khung-thoai` 150×41 | Con này cháu chưa gặp. Bóng / đen thôi, ông cũ… | – → – | – → – | – | – | đạt |
| thanh-tuu | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| thanh-tuu | bảng `gd-khung-bang` 326×226 | Sân đình / Danh hiệu / Chưa đeo danh hiệu | – → – | – → – | – | – | đạt |
| thanh-tuu | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Xong | -0,0 → -0,2 | -1,0 → -1,0 | – | – | đạt |
| thanh-tuu | nút nhỏ `gd-nut-thuong` 42×17 | Cu Tí | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| thanh-tuu | nút nhỏ `gd-nut-thuong` 32×17 | Sổ | +0,0 → +0,0 | -0,0 → -0,0 | – | – | đạt |
| thanh-tuu | nút nhỏ `gd-nut-chon` 60×17 | Thành tựu | -0,0 → -0,0 | -1,0 → -1,0 | – | – | đạt |
| thanh-tuu | nút nhỏ `gd-nut-thuong` 86×17 | Đổi danh hiệu | -0,0 → -0,0 | -0,5 → -0,5 | – | – | đạt |
| thanh-tuu | ô con `gd-o-con` 304×78 | Bước đầu / Huy hiệu Đồng / Qua ải hướng dẫn | – → – | – → – | – | – | đạt |
| thanh-tuu | nút nhỏ `gd-nut-chinh` 62×20 | Nhận | +0,2 → +0,2 | -1,0 → -1,0 | – | – | đạt |
| thanh-tuu | thẻ tên hộp thoại 39×14 | Ông Từ | +0,0 → +0,2 | +0,0 → -0,5 | chạm viền | – | **đã sửa** |
| thanh-tuu | hộp thoại `gd-khung-thoai` 150×41 | Có 3 huy hiệu đang chờ / cháu nhận đấy! | – → – | – → – | – | – | đạt |
| viec-hom-nay | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| viec-hom-nay | bảng `gd-khung-bang` 326×226 | Cổng làng / T6 · 16/10 / Đổi việc: còn 1 lần | – → – | – → – | – | – | đạt |
| viec-hom-nay | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Xong | -0,0 → -0,2 | -1,0 → -1,0 | – | – | đạt |
| viec-hom-nay | nút nhỏ `gd-nut-chon` 72×17 | Việc hôm nay | +0,0 → +0,0 | -1,0 → -1,0 | – | – | đạt |
| viec-hom-nay | nút nhỏ `gd-nut-thuong` 48×17 | Cài đặt | +0,3 → +0,3 | -1,0 → -1,0 | – | – | đạt |
| viec-hom-nay | ảnh khung `gd-the-viec` 304×34 | Hạ 30 quái / Dễ · 50, 2 nguyên liệu rèn | – → – | – → – | tràn | chạm viền | còn: chạm viền |
| viec-hom-nay | ảnh khung `gd-khung-xp` 84×10 | 0/30 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| viec-hom-nay | nút nhỏ `gd-nut-thuong` 48×18 | Đổi | +0,1 → +0,1 | +0,0 → +0,0 | – | – | đạt |
| viec-hom-nay | ảnh khung `gd-the-viec` 304×34 | Thắng 1 lượt Ải ngày / Vừa · 75, 2 nguyên liệu… | – → – | – → – | tràn | chạm viền | còn: chạm viền |
| viec-hom-nay | ảnh khung `gd-khung-xp` 84×10 | 0/1 | -0,1 → -0,1 | -0,4 → -0,4 | – | – | đạt |
| viec-hom-nay | nút nhỏ `gd-nut-thuong` 48×18 | Đổi | +0,1 → +0,1 | +0,0 → +0,0 | – | – | đạt |
| viec-hom-nay | ảnh khung `gd-the-viec` 304×34 | Qua 1 ải đạt 3 sao / Khó · 100, 3 nguyên liệu … | – → – | – → – | tràn | chạm viền | còn: chạm viền |
| viec-hom-nay | ảnh khung `gd-khung-xp` 84×10 | 0/1 | -0,1 → -0,1 | -0,4 → -0,4 | – | – | đạt |
| viec-hom-nay | nút nhỏ `gd-nut-thuong` 48×18 | Đổi | +0,1 → +0,1 | +0,0 → +0,0 | – | – | đạt |
| viec-hom-nay | ô con `gd-o-con` 148×68 | Rương ngày / Xong 3 việc: 2 nguyên liệu rèn, /… | – → – | – → – | – | – | đạt |
| viec-hom-nay | nút `gd-nut-thuong` 136×24 | Còn 3 việc | +0,1 → +0,1 | +0,2 → +0,0 | – | – | đạt |
| viec-hom-nay | ô con `gd-o-con` 152×68 | Tuần này: 0/5 ngày / T2 / T3 | – → – | – → – | – | – | đạt |
| viec-hom-nay | nút `gd-nut-thuong` 144×20 | Rương tuần: 22 nguyên liệu rèn | -0,2 → -0,2 | -0,5 → -0,5 | – | – | đạt |
| viec-hom-nay | thẻ tên hộp thoại 41×14 | Anh Mõ | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| viec-hom-nay | hộp thoại `gd-khung-thoai` 150×52 | Cốc cốc! Việc làng hôm / nay đây. Xong việc nà… | – → – | – → – | – | – | đạt |
| cai-dat | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| cai-dat | bảng `gd-khung-bang` 326×226 | Cổng làng / Lưu tiến trình / Chưa bật lưu mây:… | – → – | – → – | – | – | đạt |
| cai-dat | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Xong | -0,0 → -0,2 | -1,0 → -1,0 | – | – | đạt |
| cai-dat | nút nhỏ `gd-nut-thuong` 72×17 | Việc hôm nay | +0,0 → +0,0 | -1,0 → -1,0 | – | – | đạt |
| cai-dat | nút nhỏ `gd-nut-chon` 48×17 | Cài đặt | +0,3 → +0,3 | -1,0 → -1,0 | chạm viền | chạm viền | còn: chạm viền |
| cai-dat | nút `gd-nut-thuong` 116×32 | Âm thanh, điều khiển › / Đang tắt | -1,7 → +0,3 | -0,5 → +0,0 | tràn | – | **đã sửa** |
| cai-dat | nút `gd-nut-thuong` 86×32 | Độ nét: Cao | -0,1 → -0,1 | +3,5 → +0,0 | lệch dọc | – | **đã sửa** |
| cai-dat | nút `gd-nut-thuong` 86×32 | Toàn màn hình | -0,1 → -0,1 | +3,5 → +0,0 | lệch dọc | – | **đã sửa** |
| cai-dat | nút `gd-nut-thuong` 146×32 | Đăng nhập Google | -0,0 → -0,0 | +3,5 → +0,0 | lệch dọc | – | **đã sửa** |
| cai-dat | nút `gd-nut-thuong` 146×32 | ✉ Góp ý | -0,1 → -0,1 | +3,5 → +0,0 | lệch dọc | – | **đã sửa** |
| cai-dat | nút `gd-nut-nguy` 200×32 | Xoá tiến trình, chơi lại từ đầu | +0,0 → +0,0 | +3,0 → +0,0 | lệch dọc | – | **đã sửa** |
| cai-dat | nút `gd-nut-thuong` 92×32 | Ngôn ngữ / Tiếng Việt | +0,4 → +0,4 | -0,3 → -0,3 | – | – | đạt |
| cai-dat | thẻ tên hộp thoại 41×14 | Anh Mõ | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| cai-dat | hộp thoại `gd-khung-thoai` 150×41 | Cốc cốc cốc! Làng nước nghe / đây! Cần chỉnh g… | – → – | – → – | – | – | đạt |
| ban-do-vung | thẻ Sắp có `gd-the-sap-co` 39×10 | sắp có | +0,0 → +0,0 | -0,5 → -0,5 | – | – | đạt |
| ban-do-vung | thẻ Sắp có `gd-the-sap-co` 39×10 | sắp có | +0,0 → +0,0 | -0,5 → -0,5 | – | – | đạt |
| ban-do-vung | thẻ Sắp có `gd-the-sap-co` 39×10 | sắp có | +0,0 → +0,0 | -0,5 → -0,5 | – | – | đạt |
| ban-do-vung | nút nhỏ `gd-nut-thuong` 68×18 | ✕ Về làng | +0,1 → -0,2 | -0,5 → -0,5 | chạm viền | chạm viền | còn: chạm viền |
| ban-do-vung | nút nhỏ `gd-nut-thuong` 68×18 | Sông sâu › | -0,0 → -0,0 | -1,0 → -1,0 | – | – | đạt |
| ban-do-vung | nút nhỏ `gd-nut-thuong` 68×18 | Ải ngày | +0,4 → +0,4 | -0,5 → -0,5 | chạm viền | chạm viền | còn: chạm viền |
| ban-do-vung | bảng `gd-khung-bang` 232×66 | Chạm một ải trên tranh để xem. | – → – | – → – | – | – | đạt |
| ai-ngay | bảng `gd-khung-bang` 470×246 | Ải theo ngày / T6 · 16/10 / Ngày mới sau 09:19… | – → – | – → – | – | – | đạt |
| ai-ngay | nút nhỏ `gd-nut-thuong` 70×17 | ← Bản đồ | +0,2 → +0,4 | -0,0 → -0,0 | – | – | đạt |
| ai-ngay | ô con `gd-o-con` 352×66 | Ải Rèn / T2 / T3 | – → – | – → – | – | – | đạt |
| ai-ngay | nút `gd-nut-chinh` 98×30 | Dễ · Rừng già / 14 NLR | +0,4 → +0,4 | +0,9 → +0,1 | – | – | đạt |
| ai-ngay | nút `gd-nut-thuong` 98×30 | Vừa · Hang biển / Cần hạ Ngư Tinh | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| ai-ngay | nút `gd-nut-thuong` 98×30 | Khó · Lâu đài cổ / Cần hạ Hồ Tinh | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| ai-ngay | ô con `gd-o-con` 352×66 | Ải Vàng / T5 / T6 | – → – | – → – | – | – | đạt |
| ai-ngay | nút `gd-nut-chinh` 98×30 | Dễ · Rừng già / 520 | -0,2 → -0,2 | +0,0 → +0,0 | – | – | đạt |
| ai-ngay | nút `gd-nut-thuong` 98×30 | Vừa · Hang biển / Cần hạ Ngư Tinh | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| ai-ngay | nút `gd-nut-thuong` 98×30 | Khó · Lâu đài cổ / Cần hạ Hồ Tinh | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| hanh-trang | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| hanh-trang | bảng `gd-khung-bang` 470×226 | Hành trang / Cu Tí / Cấp 14 | – → – | – → – | cắt | cắt | còn: cắt |
| hanh-trang | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Xong | -0,0 → -0,2 | -1,0 → -1,0 | – | – | đạt |
| hanh-trang | nút `gd-nut-chinh` 110×19 | Nhân vật | +0,0 → +0,1 | -0,5 → -1,0 | – | – | đạt |
| hanh-trang | nút `gd-nut-thuong` 110×19 | Vũ khí | +0,4 → +0,4 | +0,0 → +0,0 | – | – | đạt |
| hanh-trang | nút `gd-nut-thuong` 110×19 | Kỹ năng | -0,0 → +0,1 | -0,5 → -1,0 | – | – | đạt |
| hanh-trang | nút `gd-nut-thuong` 110×19 | Tài nguyên | +0,0 → +0,2 | -0,5 → -1,0 | – | – | đạt |
| hanh-trang | ô con `gd-o-con` 112×96 | Bộ: Ninja Bóng Đêm / Mua Thợ Săn Rừng ở Cô… | – → – | – → – | cắt | cắt | còn: cắt |
| hanh-trang | nút nhỏ `gd-nut-thuong` 100×18 | Nét đã học: Ông Từ | +0,2 → +0,4 | -0,5 → +0,0 | chạm viền | chạm viền | còn: chạm viền |
| hanh-trang | ô con `gd-o-con` 157×12 | 196 / Máu | – → – | -0,5 → -0,5 | – | – | đạt |
| hanh-trang | ô con `gd-o-con` 157×12 | 120 / Mana | – → – | -0,5 → -0,5 | – | – | đạt |
| hanh-trang | ô con `gd-o-con` 157×12 | +8% / Sát thương thêm | – → – | -0,7 → -0,5 | chạm viền | – | **đã sửa** |
| hanh-trang | ô con `gd-o-con` 157×12 | 0% / Chí mạng | – → – | -0,7 → -0,5 | chạm viền | – | **đã sửa** |
| hanh-trang | ô con `gd-o-con` 157×12 | 0% / Giảm sát thương | – → – | -0,7 → -0,5 | chạm viền | – | **đã sửa** |
| hanh-trang | ô con `gd-o-con` 157×12 | 100% / Tốc chạy | – → – | -0,5 → -0,5 | chạm viền | chạm viền | còn: chạm viền |
| hanh-trang | ô con `gd-o-con` 157×12 | 0% / Kháng Lửa | – → – | -0,7 → -0,5 | chạm viền | – | **đã sửa** |
| hanh-trang | ô con `gd-o-con` 157×12 | 0% / Kháng Độc | – → – | -0,7 → -0,5 | chạm viền | – | **đã sửa** |
| hanh-trang | ô con `gd-o-con` 157×12 | 0% / Kháng Băng | – → – | -0,7 → -0,5 | chạm viền | – | **đã sửa** |
| hanh-trang | ô con `gd-o-con` 157×12 | +0% / Hồi chiêu nhanh | – → – | -0,2 → -0,5 | chạm viền | – | **đã sửa** |
| xem-vk | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| xem-vk | bảng `gd-khung-bang` 470×246 | Xem vũ khí / Kiếm tập sự / Kiếm · Trắng | – → – | – → – | – | – | đạt |
| xem-vk | nút nhỏ `gd-nut-thuong` 70×17 | ← Quay lại | -0,0 → +0,1 | -1,0 → -1,0 | – | – | đạt |
| xem-vk | ảnh khung `gd-o-ep-1` 70×70 | 1 | – → – | – → – | – | – | đạt |
| xem-vk | ô con `gd-o-con` 214×36 | Thành hình / Luyện cấp 6 / Đặc trưng 1: thứ để… | – → – | +0,1 → +0,1 | – | – | đạt |
| xem-vk | ô con `gd-o-con` 214×36 | Thức tỉnh / Luyện cấp 12 / Đặc trưng 2: phản ứ… | – → – | +0,1 → +0,1 | – | – | đạt |
| tran-hud | tấm nhỏ `gd-khung-nho` 293×25 | Kiếm: bấm Đánh ra chuỗi 3 nhát, Né xong đánh n… | – → – | – → – | – | – | đạt |
| tran-hud | ảnh khung `gd-khung-mau` 120×11 | 301 / 301 | -0,1 → -0,1 | -0,4 → -0,4 | – | – | đạt |
| tran-hud | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| tran-hud | tấm nhỏ `gd-khung-nho` 85×68 | Bản đồ / Phòng 2/8 | – → – | – → – | – | – | đạt |
| tran-hud | tấm nhỏ `gd-khung-nho` 110×17 | Linh khí 0 | – → – | +0,3 → +0,3 | – | – | đạt |
| tran-lau-dai | tấm nhỏ `gd-khung-nho` 293×25 | Kiếm: bấm Đánh ra chuỗi 3 nhát, Né xong đánh n… | – → – | – → – | – | – | đạt |
| tran-lau-dai | ảnh khung `gd-khung-mau` 120×11 | 301 / 301 | -0,1 → -0,1 | -0,4 → -0,4 | – | – | đạt |
| tran-lau-dai | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| tran-lau-dai | tấm nhỏ `gd-khung-nho` 85×68 | Bản đồ / Phòng 2/8 | – → – | – → – | – | – | đạt |
| tran-lau-dai | tấm nhỏ `gd-khung-nho` 110×17 | Linh khí 0 | – → – | +0,3 → +0,3 | – | – | đạt |
| thong-bao | tấm nhỏ `gd-khung-nho` 115×18 | Phúc lành: Than hồng | -0,0 → -0,0 | -0,5 → -0,5 | – | – | đạt |
| thong-bao | ảnh khung `gd-khung-mau` 120×11 | 301 / 301 | -0,1 → -0,1 | -0,4 → -0,4 | – | – | đạt |
| thong-bao | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| thong-bao | tấm nhỏ `gd-khung-nho` 85×68 | Bản đồ / Phòng 2/8 | – → – | – → – | – | – | đạt |
| thong-bao | tấm nhỏ `gd-khung-nho` 110×17 | Linh khí 0 | – → – | +0,3 → +0,3 | – | – | đạt |
| phuc-lanh | ảnh khung `gd-khung-mau` 120×11 | 196 / 196 | +0,1 → +0,1 | -0,4 → -0,4 | – | – | đạt |
| phuc-lanh | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| phuc-lanh | tấm nhỏ `gd-khung-nho` 85×68 | Bản đồ / Phòng 2/8 / 3 | – → – | – → – | – | – | đạt |
| phuc-lanh | tấm nhỏ `gd-khung-nho` 110×17 | Linh khí 0 | – → – | +0,3 → +0,3 | – | – | đạt |
| phuc-lanh | bảng `gd-khung-bang` 378×186 | Phúc lành: chọn một / Chỉ có tác dụng tới hết … | – → – | – → – | – | – | đạt |
| phuc-lanh | thẻ `gd-the-thuong` 112×126 | Vũ khí · Kiếm / Gươm Hồ Gươm / Nhát kết của ki… | – → – | – → – | tràn | – | **đã sửa** |
| phuc-lanh | thẻ `gd-the-thuong` 112×126 | Né / Ngựa sắt Thánh Gióng / Lướt né để lại vệt… | – → – | – → – | tràn | – | **đã sửa** |
| phuc-lanh | thẻ `gd-the-thuong` 112×126 | Hệ · Lửa / Than hồng Ông Táo / Cứ đòn trúng th… | – → – | – → – | – | – | đạt |
| trum | khung tên trùm `gd-khung-trum` 226×30 | Mộc Tinh | +0,2 → +0,2 | -1,2 → -1,2 | – | – | đạt |
| trum | tấm nhỏ `gd-khung-nho` 103×18 | Mộc Tinh xuất hiện | +0,0 → +0,0 | -0,5 → -0,5 | – | – | đạt |
| trum | ảnh khung `gd-khung-mau` 120×11 | 301 / 301 | -0,1 → -0,1 | -0,4 → -0,4 | – | – | đạt |
| trum | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| trum | tấm nhỏ `gd-khung-nho` 58×19 | Bản đồ | +0,1 → +0,1 | +0,5 → +0,5 | – | – | đạt |
| trum | tấm nhỏ `gd-khung-nho` 110×17 | Linh khí 0 | – → – | +0,3 → +0,3 | – | – | đạt |
| trum-the-khang | khung tên trùm `gd-khung-trum` 226×30 | Mộc Tinh | +0,2 → +0,2 | -1,2 → -1,2 | – | – | đạt |
| trum-the-khang | thẻ kháng/yếu `gd-the-nho` 52×13 | Kháng Lửa | +0,1 → +0,1 | -1,0 → -1,0 | – | – | đạt |
| trum-the-khang | thẻ kháng/yếu `gd-the-nho` 53×13 | Kháng Độc | +0,1 → +0,1 | -1,0 → -1,0 | – | – | đạt |
| trum-the-khang | thẻ kháng/yếu `gd-the-nho` 47×13 | Yếu Băng | -0,1 → -0,1 | -0,5 → -0,5 | chạm viền | chạm viền | còn: chạm viền |
| trum-the-khang | tấm nhỏ `gd-khung-nho` 103×18 | Mộc Tinh xuất hiện | +0,0 → +0,0 | -0,5 → -0,5 | – | – | đạt |
| trum-the-khang | ảnh khung `gd-khung-mau` 120×11 | 301 / 301 | -0,1 → -0,1 | -0,4 → -0,4 | – | – | đạt |
| trum-the-khang | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| trum-the-khang | tấm nhỏ `gd-khung-nho` 58×19 | Bản đồ | +0,1 → +0,1 | +0,5 → +0,5 | – | – | đạt |
| trum-the-khang | tấm nhỏ `gd-khung-nho` 110×17 | Linh khí 0 | – → – | +0,3 → +0,3 | – | – | đạt |
| cua-hang-ai | tấm nhỏ `gd-khung-nho` 234×25 | Kiếm: bấm Đánh ra chuỗi 3 nhát, Né xong đánh n… | -0,2 → -0,2 | -1,2 → -1,2 | – | – | đạt |
| cua-hang-ai | ảnh khung `gd-khung-mau` 120×11 | 196 / 196 | +0,1 → +0,1 | -0,4 → -0,4 | – | – | đạt |
| cua-hang-ai | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| cua-hang-ai | tấm nhỏ `gd-khung-nho` 85×68 | Bản đồ / Phòng 2/8 | – → – | – → – | – | – | đạt |
| cua-hang-ai | tấm nhỏ `gd-khung-nho` 110×17 | Linh khí 0 | – → – | +0,3 → +0,3 | – | – | đạt |
| ban-do | ảnh khung `gd-khung-mau` 120×11 | 301 / 301 | -0,1 → -0,1 | -0,4 → -0,4 | – | – | đạt |
| ban-do | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| ban-do | tấm nhỏ `gd-khung-nho` 85×68 | Bản đồ / Phòng 2/8 | – → – | – → – | – | – | đạt |
| ban-do | tấm nhỏ `gd-khung-nho` 110×17 | Linh khí 0 | – → – | +0,3 → +0,3 | – | – | đạt |
| ban-do | ảnh khung `gd-khung-ban-do` 442×268 | Bản đồ ải · Rừng già 3 / Chú giải / Bắt đầu | – → – | – → – | tràn | tràn | còn: tràn |
| tam-dung | ảnh khung `gd-khung-mau` 120×11 | 301 / 301 | -0,1 → -0,1 | -0,4 → -0,4 | – | – | đạt |
| tam-dung | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| tam-dung | tấm nhỏ `gd-khung-nho` 85×68 | Bản đồ / Phòng 2/8 | – → – | – → – | – | – | đạt |
| tam-dung | tấm nhỏ `gd-khung-nho` 110×17 | Linh khí 0 | – → – | +0,3 → +0,3 | – | – | đạt |
| tam-dung | bảng `gd-khung-bang` 186×216 | Tạm dừng | – → – | – → – | – | – | đạt |
| tam-dung | nút `gd-nut-thuong` 150×28 | Chơi tiếp | -0,1 → -0,1 | +0,2 → +0,0 | – | – | đạt |
| tam-dung | nút `gd-nut-thuong` 150×28 | Âm thanh: tắt | +0,2 → +0,2 | +2,2 → +0,0 | lệch dọc | – | **đã sửa** |
| tam-dung | nút `gd-nut-nguy` 150×28 | Bỏ ải, về làng | -1,8 → -0,2 | +0,2 → +0,0 | – | – | đạt |
| tam-dung | nút 73×26 | ✉ Góp ý | -0,1 → -0,1 | +0,5 → +0,0 | – | – | đạt |
| tam-dung | nút 73×26 | Việc hôm nay | +0,4 → +0,4 | +1,0 → +0,0 | – | – | đạt |
| tam-dung | nút `gd-nut-thuong` 150×26 | Hành trang (xem) | +3,9 → +0,2 | +0,8 → +0,0 | lệch ngang | – | **đã sửa** |
| tran-hanh-trang | ảnh khung `gd-khung-mau` 120×11 | 301 / 301 | -0,1 → -0,1 | -0,4 → -0,4 | – | – | đạt |
| tran-hanh-trang | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| tran-hanh-trang | tấm nhỏ `gd-khung-nho` 85×68 | Bản đồ / Phòng 2/8 | – → – | – → – | – | – | đạt |
| tran-hanh-trang | tấm nhỏ `gd-khung-nho` 110×17 | Linh khí 0 | – → – | +0,3 → +0,3 | – | – | đạt |
| tran-hanh-trang | bảng `gd-khung-bang` 470×226 | Hành trang (chỉ xem) / Trong ải chỉ xem. Về là… | – → – | – → – | cắt | cắt | còn: cắt |
| tran-hanh-trang | nút nhỏ `gd-nut-thuong` 60×17 | ← Quay lại | +0,1 → +0,1 | -1,0 → -1,0 | – | – | đạt |
| tran-hanh-trang | nút `gd-nut-chinh` 110×19 | Nhân vật | +0,0 → +0,1 | -0,5 → -1,0 | – | – | đạt |
| tran-hanh-trang | nút `gd-nut-thuong` 110×19 | Vũ khí | +0,4 → +0,4 | +0,0 → +0,0 | – | – | đạt |
| tran-hanh-trang | nút `gd-nut-thuong` 110×19 | Kỹ năng | -0,0 → +0,1 | -0,5 → -1,0 | – | – | đạt |
| tran-hanh-trang | nút `gd-nut-thuong` 110×19 | Tài nguyên | +0,0 → +0,2 | -0,5 → -1,0 | – | – | đạt |
| tran-hanh-trang | ô con `gd-o-con` 112×96 | Bộ: Ninja Bóng Đêm / Mua Thợ Săn Rừng ở Cô… | – → – | – → – | cắt | cắt | còn: cắt |
| tran-hanh-trang | ô con `gd-o-con` 157×12 | 301 / Máu | – → – | -0,5 → -0,5 | – | – | đạt |
| tran-hanh-trang | ô con `gd-o-con` 157×12 | 120 / Mana | – → – | -0,5 → -0,5 | – | – | đạt |
| tran-hanh-trang | ô con `gd-o-con` 157×12 | +16% / Sát thương thêm | – → – | -0,7 → -0,5 | chạm viền | – | **đã sửa** |
| tran-hanh-trang | ô con `gd-o-con` 157×12 | 0% / Chí mạng | – → – | -0,7 → -0,5 | chạm viền | – | **đã sửa** |
| tran-hanh-trang | ô con `gd-o-con` 157×12 | 0% / Giảm sát thương | – → – | -0,7 → -0,5 | chạm viền | – | **đã sửa** |
| tran-hanh-trang | ô con `gd-o-con` 157×12 | 100% / Tốc chạy | – → – | -0,5 → -0,5 | chạm viền | chạm viền | còn: chạm viền |
| tran-hanh-trang | ô con `gd-o-con` 157×12 | 0% / Kháng Lửa | – → – | -0,7 → -0,5 | chạm viền | – | **đã sửa** |
| tran-hanh-trang | ô con `gd-o-con` 157×12 | 0% / Kháng Độc | – → – | -0,7 → -0,5 | chạm viền | – | **đã sửa** |
| tran-hanh-trang | ô con `gd-o-con` 157×12 | 0% / Kháng Băng | – → – | -0,7 → -0,5 | chạm viền | – | **đã sửa** |
| tran-hanh-trang | ô con `gd-o-con` 157×12 | +0% / Hồi chiêu nhanh | – → – | -0,2 → -0,5 | chạm viền | – | **đã sửa** |
| thang | khung tên trùm `gd-khung-trum-nho` 196×26 | Nấm Chúa | +0,2 → -0,2 | +0,2 → -0,2 | chạm viền | – | **đã sửa** |
| thang | tấm nhỏ `gd-khung-nho` 207×18 | Xong việc: Qua 1 ải không dùng bình máu! | -0,1 → -0,1 | -1,0 → -1,0 | – | – | đạt |
| thang | ảnh khung `gd-khung-mau` 120×11 | 196 / 196 | +0,1 → +0,1 | -0,4 → -0,4 | – | – | đạt |
| thang | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| thang | tấm nhỏ `gd-khung-nho` 58×19 | Bản đồ | +0,1 → +0,1 | +0,5 → +0,5 | – | – | đạt |
| thang | tấm nhỏ `gd-khung-nho` 110×17 | Linh khí 0 | – → – | +0,3 → +0,3 | – | – | đạt |
| thang | bảng `gd-khung-bang` 346×234 | Qua ải Rừng già 2 / Qua ải / Không dùng bình m… | – → – | – → – | chữ đè chữ | – | **đã sửa** |
| thang | nút nhỏ `gd-nut-thuong` 68×17 | ✉ Góp ý | +0,2 → +0,1 | -1,0 → -1,0 | – | – | đạt |
| thang | nút `gd-nut-thuong` 96×26 | Về làng | -0,2 → -0,2 | +0,8 → +0,0 | – | – | đạt |
| thang | nút `gd-nut-thuong` 96×26 | Chơi lại | -0,1 → -0,1 | +0,8 → +0,0 | – | – | đạt |
| thang | nút `gd-nut-chinh` 116×30 | Ải tiếp theo ▶ | -0,0 → -0,0 | +2,8 → +0,0 | lệch dọc | – | **đã sửa** |
| thua | ảnh khung `gd-khung-mau` 120×11 | 196 / 196 | +0,1 → +0,1 | -0,4 → -0,4 | – | – | đạt |
| thua | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| thua | tấm nhỏ `gd-khung-nho` 85×68 | Bản đồ / Phòng 2/8 | – → – | – → – | – | – | đạt |
| thua | tấm nhỏ `gd-khung-nho` 110×17 | Linh khí 0 | – → – | +0,3 → +0,3 | – | – | đạt |
| thua | bảng `gd-khung-bang` 346×234 | Cháu ngã ở phòng Đánh quái rồi / +3 · +0 · Việ… | – → – | – → – | chữ đè chữ | – | **đã sửa** |
| thua | nút nhỏ `gd-nut-thuong` 68×17 | ✉ Góp ý | +0,2 → +0,1 | -1,0 → -1,0 | – | – | đạt |
| thua | nút `gd-nut-thuong` 140×26 | Về làng | -0,2 → -0,2 | -0,5 → -0,5 | – | – | đạt |
| thua | nút `gd-nut-thuong` 140×26 | Thử lại | +0,1 → +0,1 | -0,8 → -0,8 | – | – | đạt |

## Tiếng Anh

| Màn | Khung | Chữ | Lệch N trước → sau | Lệch D trước → sau | Lỗi trước | Lỗi sau | Kết quả |
|---|---|---|---|---|---|---|---|
| chao | dải thông báo `gd-dai-thong-bao` 102×18 | Tap to start | +0,3 → +0,3 | -1,0 → -1,0 | – | – | đạt |
| chao | nút `gd-nut-thuong` 108×22 | Sign in with Google | +0,3 → +0,3 | -0,8 → -0,8 | – | – | đạt |
| chao | nút `gd-nut-thuong` 108×22 | 🏆 Leaderboard | -0,0 → -0,0 | +0,0 → +0,0 | – | – | đạt |
| chao | nút nhỏ `gd-nut-chon` 52×16 | EN / VI | -0,1 → -0,1 | -0,5 → -0,5 | – | – | đạt |
| chao-co-luu | dải thông báo `gd-dai-thong-bao` 102×18 | Tap to start | +0,3 → +0,3 | -1,0 → -1,0 | – | – | đạt |
| chao-co-luu | nút `gd-nut-thuong` 108×22 | Sign in with Google | +0,3 → +0,3 | -0,8 → -0,8 | – | – | đạt |
| chao-co-luu | nút `gd-nut-thuong` 108×22 | 🏆 Leaderboard | -0,0 → -0,0 | +0,0 → +0,0 | – | – | đạt |
| chao-co-luu | nút nhỏ `gd-nut-chon` 52×16 | EN / VI | -0,1 → -0,1 | -0,5 → -0,5 | – | – | đạt |
| truyen | nút nhỏ `gd-nut-thuong` 90×32 | Skip ✕ | -0,1 → -0,1 | +3,5 → +0,0 | lệch dọc | – | **đã sửa** |
| lang | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| lang | dải thông báo `gd-dai-thong-bao` 315×18 | New: Monster Book, Today's jobs, Achievements,… | – → – | – → – | – | – | đạt |
| lang | tấm nhỏ `gd-khung-nho` 44×31 | Inventory | +0,1 → +0,1 | -0,9 → -1,2 | – | – | đạt |
| lai-do | thẻ Sắp có `gd-the-sap-co` 33×10 | soon | -0,0 → -0,0 | -1,0 → -1,0 | – | – | đạt |
| lai-do | thẻ Sắp có `gd-the-sap-co` 33×10 | soon | -0,0 → -0,0 | -1,0 → -1,0 | – | – | đạt |
| lai-do | thẻ Sắp có `gd-the-sap-co` 33×10 | soon | -0,0 → -0,0 | -1,0 → -1,0 | – | – | đạt |
| lai-do | nút nhỏ `gd-nut-thuong` 68×18 | ✕ To village | +0,1 → +0,1 | -1,0 → -1,0 | – | – | đạt |
| lai-do | nút nhỏ `gd-nut-thuong` 68×18 | Deep River › | +0,1 → +0,1 | -1,0 → -1,0 | – | – | đạt |
| lai-do | nút nhỏ `gd-nut-thuong` 68×18 | Daily trials | +0,0 → +0,0 | -1,0 → -1,0 | – | – | đạt |
| lai-do | bảng `gd-khung-bang` 232×66 | Sea Cave · Stage 3 / Mini-boss Rock Crab · 8 r… | – → – | – → – | – | – | đạt |
| lai-do | nút `gd-nut-chinh` 64×38 | Set sail | -0,0 → -0,3 | +3,8 → +0,2 | lệch dọc | – | **đã sửa** |
| lo-ren-mai | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| lo-ren-mai | bảng `gd-khung-bang` 326×226 | Forge / Forge materials: 0 · Spirit: 0 · Gold:… | – → – | – → – | – | – | đạt |
| lo-ren-mai | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Done | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-mai | nút `gd-nut-chinh` 303×22 | Temper | – → – | – → – | – | – | đạt |
| lo-ren-mai | ảnh khung `gd-o-ep-1` 32×32 | 1 | – → – | – → – | – | – | đạt |
| lo-ren-mai | ô con `gd-o-con-chon` 100×36 | Sword / Lv 3 · ★ | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-mai | ảnh khung `gd-o-ep-1` 32×32 | 1 | – → – | – → – | – | – | đạt |
| lo-ren-mai | ô con `gd-o-con` 100×36 | Shuriken / Lv 3 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-mai | ô con `gd-o-con` 100×36 | Spear / Lv 1 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-mai | ô con `gd-o-con` 100×36 | Hammer / Lv 1 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-mai | ô con `gd-o-con` 198×156 | Apprentice Sword · Temper 3/15 / Weapon power … | – → – | – → – | cắt, tràn | cắt | còn: cắt |
| lo-ren-mai | nút nhỏ `gd-nut-thuong` 61×13 | Fire | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-mai | nút nhỏ `gd-nut-thuong` 61×13 | Poison | -0,0 → -0,0 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-mai | nút nhỏ `gd-nut-thuong` 61×13 | Ice | -0,0 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-mai | nút nhỏ `gd-nut-thuong` 76×16 | Temper to 4 | -0,0 → +0,3 | -1,0 → -1,0 | chạm viền | – | **đã sửa** |
| lo-ren-mai | thẻ tên hộp thoại 53×14 | Blacksmith | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-mai | hộp thoại `gd-khung-thoai` 150×63 | Tempering needs gold, spirit, / forge material… | – → – | – → – | – | – | đạt |
| lo-ren-linh-khi | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| lo-ren-linh-khi | bảng `gd-khung-bang` 326×226 | Forge / Forge materials: 0 · Spirit: 0 · Gold:… | – → – | – → – | – | – | đạt |
| lo-ren-linh-khi | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Done | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-linh-khi | nút `gd-nut-chinh` 303×22 | Temper | – → – | – → – | – | – | đạt |
| lo-ren-linh-khi | ảnh khung `gd-o-ep-1` 32×32 | 1 | – → – | – → – | – | – | đạt |
| lo-ren-linh-khi | ô con `gd-o-con-chon` 100×36 | Sword / Lv 3 · ★ | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-linh-khi | ảnh khung `gd-o-ep-1` 32×32 | 1 | – → – | – → – | – | – | đạt |
| lo-ren-linh-khi | ô con `gd-o-con` 100×36 | Shuriken / Lv 3 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-linh-khi | ô con `gd-o-con` 100×36 | Spear / Lv 1 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-linh-khi | ô con `gd-o-con` 100×36 | Hammer / Lv 1 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-linh-khi | ô con `gd-o-con` 198×156 | Apprentice Sword · Temper 3/15 / Weapon power … | – → – | – → – | cắt, tràn | cắt | còn: cắt |
| lo-ren-linh-khi | nút nhỏ `gd-nut-thuong` 61×13 | Fire | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-linh-khi | nút nhỏ `gd-nut-thuong` 61×13 | Poison | -0,0 → -0,0 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-linh-khi | nút nhỏ `gd-nut-thuong` 61×13 | Ice | -0,0 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-linh-khi | nút nhỏ `gd-nut-thuong` 76×16 | Temper to 4 | -0,0 → +0,3 | -1,0 → -1,0 | chạm viền | – | **đã sửa** |
| lo-ren-linh-khi | thẻ tên hộp thoại 53×14 | Blacksmith | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-linh-khi | hộp thoại `gd-khung-thoai` 150×63 | Tempering needs gold, spirit, / forge material… | – → – | – → – | – | – | đạt |
| lo-ren-ep | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| lo-ren-ep | bảng `gd-khung-bang` 326×226 | Forge / Forge materials: 0 · Spirit: 0 · Gold:… | – → – | – → – | – | – | đạt |
| lo-ren-ep | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Done | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-ep | nút `gd-nut-chinh` 303×22 | Temper | – → – | – → – | – | – | đạt |
| lo-ren-ep | ảnh khung `gd-o-ep-1` 32×32 | 1 | – → – | – → – | – | – | đạt |
| lo-ren-ep | ô con `gd-o-con-chon` 100×36 | Sword / Lv 3 · ★ | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-ep | ảnh khung `gd-o-ep-1` 32×32 | 1 | – → – | – → – | – | – | đạt |
| lo-ren-ep | ô con `gd-o-con` 100×36 | Shuriken / Lv 3 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-ep | ô con `gd-o-con` 100×36 | Spear / Lv 1 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-ep | ô con `gd-o-con` 100×36 | Hammer / Lv 1 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-ep | ô con `gd-o-con` 198×156 | Apprentice Sword · Temper 3/15 / Weapon power … | – → – | – → – | cắt, tràn | cắt | còn: cắt |
| lo-ren-ep | nút nhỏ `gd-nut-thuong` 61×13 | Fire | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-ep | nút nhỏ `gd-nut-thuong` 61×13 | Poison | -0,0 → -0,0 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-ep | nút nhỏ `gd-nut-thuong` 61×13 | Ice | -0,0 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-ep | nút nhỏ `gd-nut-thuong` 76×16 | Temper to 4 | -0,0 → +0,3 | -1,0 → -1,0 | chạm viền | – | **đã sửa** |
| lo-ren-ep | thẻ tên hộp thoại 53×14 | Blacksmith | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-ep | hộp thoại `gd-khung-thoai` 150×63 | Tempering needs gold, spirit, / forge material… | – → – | – → – | – | – | đạt |
| lo-ren-nang-lo | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| lo-ren-nang-lo | bảng `gd-khung-bang` 326×226 | Forge / Forge materials: 0 · Spirit: 0 · Gold:… | – → – | – → – | – | – | đạt |
| lo-ren-nang-lo | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Done | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-nang-lo | nút `gd-nut-chinh` 303×22 | Temper | – → – | – → – | – | – | đạt |
| lo-ren-nang-lo | ảnh khung `gd-o-ep-1` 32×32 | 1 | – → – | – → – | – | – | đạt |
| lo-ren-nang-lo | ô con `gd-o-con-chon` 100×36 | Sword / Lv 3 · ★ | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-nang-lo | ảnh khung `gd-o-ep-1` 32×32 | 1 | – → – | – → – | – | – | đạt |
| lo-ren-nang-lo | ô con `gd-o-con` 100×36 | Shuriken / Lv 3 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-nang-lo | ô con `gd-o-con` 100×36 | Spear / Lv 1 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-nang-lo | ô con `gd-o-con` 100×36 | Hammer / Lv 1 | – → – | -3,4 → -0,1 | lệch dọc | – | **đã sửa** |
| lo-ren-nang-lo | ô con `gd-o-con` 198×156 | Apprentice Sword · Temper 3/15 / Weapon power … | – → – | – → – | cắt, tràn | cắt | còn: cắt |
| lo-ren-nang-lo | nút nhỏ `gd-nut-thuong` 61×13 | Fire | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-nang-lo | nút nhỏ `gd-nut-thuong` 61×13 | Poison | -0,0 → -0,0 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-nang-lo | nút nhỏ `gd-nut-thuong` 61×13 | Ice | -0,0 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-nang-lo | nút nhỏ `gd-nut-thuong` 76×16 | Temper to 4 | -0,0 → +0,3 | -1,0 → -1,0 | chạm viền | – | **đã sửa** |
| lo-ren-nang-lo | thẻ tên hộp thoại 53×14 | Blacksmith | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| lo-ren-nang-lo | hộp thoại `gd-khung-thoai` 150×63 | Tempering needs gold, spirit, / forge material… | – → – | – → – | – | – | đạt |
| hang-xen | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| hang-xen | bảng `gd-khung-bang` 326×226 | Peddler / 150 buys 1 material of a zone whose … | – → – | – → – | – | – | đạt |
| hang-xen | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Done | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| hang-xen | nút nhỏ `gd-nut-chon` 57×17 | Materials | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| hang-xen | nút nhỏ `gd-nut-thuong` 34×17 | FM | -0,0 → -0,0 | -0,0 → -0,0 | – | – | đạt |
| hang-xen | ô con `gd-o-con` 304×40 | Spirit Wood / Have 12 · zone Old Forest | – → – | – → – | – | – | đạt |
| hang-xen | nút nhỏ `gd-nut-thuong` 76×28 | No trades left | +0,3 → +0,1 | +2,5 → +0,0 | lệch dọc | – | **đã sửa** |
| hang-xen | nút nhỏ `gd-nut-thuong` 80×28 | Trade 1 (150) | +0,2 → +0,1 | +3,0 → +0,0 | lệch dọc | – | **đã sửa** |
| hang-xen | ô con `gd-o-con` 304×40 | Fish Scale / Have 7 · zone Sea Cave | – → – | – → – | – | – | đạt |
| hang-xen | nút nhỏ `gd-nut-thuong` 76×28 | Beat Ngu / Tinh first | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| hang-xen | nút nhỏ `gd-nut-thuong` 80×28 | Trade 1 (150) | +0,2 → +0,1 | +3,0 → +0,0 | lệch dọc | – | **đã sửa** |
| hang-xen | ô con `gd-o-con` 304×40 | Flint / Have 3 · zone Ancient Castle | – → – | – → – | – | – | đạt |
| hang-xen | nút nhỏ `gd-nut-thuong` 76×28 | Beat Ho Tinh first | +0,2 → +0,3 | -0,5 → +0,0 | – | – | đạt |
| hang-xen | nút nhỏ `gd-nut-thuong` 80×28 | Trade 1 (150) | +0,2 → +0,1 | +3,0 → +0,0 | lệch dọc | – | **đã sửa** |
| hang-xen | thẻ tên hộp thoại 41×14 | Peddler | -0,0 → -0,0 | -0,5 → -0,5 | – | – | đạt |
| hang-xen | hộp thoại `gd-khung-thoai` 150×52 | Sold out, dear. Win / more stages and new / st… | – → – | – → – | – | – | đạt |
| hang-xen-quang | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| hang-xen-quang | bảng `gd-khung-bang` 326×226 | Peddler / 40 per forge material. Up to 15 a da… | – → – | – → – | – | – | đạt |
| hang-xen-quang | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Done | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| hang-xen-quang | nút nhỏ `gd-nut-thuong` 57×17 | Materials | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| hang-xen-quang | nút nhỏ `gd-nut-chon` 34×17 | FM | -0,0 → -0,0 | +0,2 → +0,0 | – | – | đạt |
| hang-xen-quang | ô con `gd-o-con` 304×40 | Forge materials / Have 0 · used to temper weap… | – → – | – → – | – | – | đạt |
| hang-xen-quang | nút nhỏ `gd-nut-thuong` 76×20 | Buy 1 (40) | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| hang-xen-quang | nút nhỏ `gd-nut-thuong` 80×20 | Buy 5 (200) | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| hang-xen-quang | thẻ tên hộp thoại 41×14 | Peddler | -0,0 → -0,0 | -0,5 → -0,5 | – | – | đạt |
| hang-xen-quang | hộp thoại `gd-khung-thoai` 150×52 | Short on ore for sharpening? / Buy from me, bu… | – → – | – → – | – | – | đạt |
| tho-may | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| tho-may | bảng `gd-khung-bang` 326×226 | Tailor / Gold: 4,321 / Beat a land boss to put… | – → – | – → – | tràn | – | **đã sửa** |
| tho-may | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Done | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| tho-may | nút `gd-nut-thuong` 98×22 | Upgrade | +0,1 → +0,1 | -0,8 → -0,8 | – | – | đạt |
| tho-may | nút `gd-nut-chinh` 98×22 | Buy | +0,1 → +0,1 | -0,8 → -0,8 | – | – | đạt |
| tho-may | ô con `gd-o-con` 100×128 | Forest Hunter / 1,500 / Enough gold! | – → – | – → – | – | – | đạt |
| tho-may | nút nhỏ `gd-nut-chinh` 84×17 | Buy | +0,2 → +0,1 | -1,0 → -1,0 | – | – | đạt |
| tho-may | ô con `gd-o-con` 100×128 | Sea Warrior / 3,000 / Defeat Ngu Tinh to unlock | – → – | – → – | – | – | đạt |
| tho-may | ô con `gd-o-con` 100×128 | Castle Knight / 5,000 / Defeat Ho Tinh to unlo… | – → – | – → – | – | – | đạt |
| tho-may | thẻ tên hộp thoại 33×14 | Tailor | -0,0 → -0,0 | -0,5 → -0,5 | – | – | đạt |
| tho-may | hộp thoại `gd-khung-thoai` 150×41 | The Forest Hunter outfit / is ready, only 1,50… | – → – | – → – | – | – | đạt |
| cu-do | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| cu-do | bảng `gd-khung-bang` 326×226 | Banyan: Cu Ti's Palm / Palm points: 14 left / … | – → – | – → – | – | – | đạt |
| cu-do | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Done | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| cu-do | nút `gd-nut-thuong` 73×22 | Skill tree | +0,3 → +0,3 | +0,2 → +0,0 | – | – | đạt |
| cu-do | nút `gd-nut-chinh` 73×22 | Palm tree | +0,3 → +0,3 | +0,2 → +0,0 | – | – | đạt |
| cu-do | nút `gd-nut-thuong` 73×22 | Guide | +0,3 → +0,3 | +0,2 → +0,0 | – | – | đạt |
| cu-do | nút `gd-nut-thuong` 73×22 | Leaderboard | -0,1 → -0,1 | +0,8 → +0,0 | – | – | đạt |
| cu-do | ô con `gd-o-con-chon` 98×120 | Fire Palm | – → – | – → – | chạm viền | – | **đã sửa** |
| cu-do | ô con `gd-o-con` 44×18 | Heat / + | – → – | +0,9 → +0,8 | – | – | đạt |
| cu-do | ô con `gd-o-con` 44×18 | Big Blast / + | – → – | +0,4 → +0,4 | – | – | đạt |
| cu-do | ô con `gd-o-con` 44×18 | Burn Trail / req 5 | – → – | +0,4 → -0,3 | chữ đè chữ | chạm viền | còn: chạm viền |
| cu-do | ô con `gd-o-con` 44×18 | Long Burn / req 5 | – → – | -0,1 → -0,6 | chữ đè chữ | chạm viền | còn: chạm viền |
| cu-do | ô con `gd-o-con` 92×18 | Charge Up / req 10 | – → – | -0,1 → +0,0 | – | – | đạt |
| cu-do | ô con `gd-o-con` 92×18 | Ember Rain / req 18 | – → – | +0,4 → +0,0 | – | – | đạt |
| cu-do | ô con `gd-o-con` 90×15 | ✓ In use | +0,3 → +0,3 | +0,1 → +0,1 | – | – | đạt |
| cu-do | ô con `gd-o-con` 98×120 | Poison Palm | – → – | – → – | – | – | đạt |
| cu-do | ô con `gd-o-con` 44×18 | Venom | – → – | -1,4 → +0,0 | – | – | đạt |
| cu-do | ô con `gd-o-con` 44×18 | Dense Fog | – → – | -2,4 → +0,0 | lệch dọc | – | **đã sửa** |
| cu-do | ô con `gd-o-con` 44×18 | Contagion / req 5 | – → – | -0,1 → -0,6 | chữ đè chữ | chạm viền | còn: chạm viền |
| cu-do | ô con `gd-o-con` 44×18 | Corrode / req 5 | – → – | +0,4 → -0,3 | chữ đè chữ | chạm viền | còn: chạm viền |
| cu-do | ô con `gd-o-con` 92×18 | Triple Serpent / req 10 | – → – | -0,1 → +0,0 | – | – | đạt |
| cu-do | ô con `gd-o-con` 92×18 | Myriad Venom / req 18 | – → – | -0,1 → +0,0 | – | – | đạt |
| cu-do | nút nhỏ `gd-nut-thuong` 90×15 | Use this tree | -0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| cu-do | ô con `gd-o-con` 98×120 | Ice Palm | – → – | – → – | – | – | đạt |
| cu-do | ô con `gd-o-con` 44×18 | Frost | – → – | -1,4 → +0,0 | – | – | đạt |
| cu-do | ô con `gd-o-con` 44×18 | Range | – → – | -2,4 → +0,0 | lệch dọc | – | **đã sửa** |
| cu-do | ô con `gd-o-con` 44×18 | Ice Pierce / req 5 | – → – | +0,4 → -0,3 | chữ đè chữ | chạm viền | còn: chạm viền |
| cu-do | ô con `gd-o-con` 44×18 | Frozen / req 5 | – → – | +0,4 → -0,3 | chữ đè chữ | chạm viền | còn: chạm viền |
| cu-do | ô con `gd-o-con` 92×18 | Shatter / req 10 | – → – | +0,4 → +0,0 | – | – | đạt |
| cu-do | ô con `gd-o-con` 92×18 | Ice Seal / req 18 | – → – | +0,4 → +0,0 | – | – | đạt |
| cu-do | nút nhỏ `gd-nut-thuong` 90×15 | Use this tree | -0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| cu-do | ô con `gd-o-con` 304×31 | Heat 0/5 · Fire Palm / Per rank: +10% damage | – → – | – → – | – | – | đạt |
| cu-do | nút nhỏ `gd-nut-chinh` 54×18 | Learn | +0,0 → +0,0 | -0,5 → -0,5 | – | – | đạt |
| cu-do | thẻ tên hộp thoại 41×14 | Scholar | -0,0 → -0,0 | -0,5 → -0,5 | – | – | đạt |
| cu-do | hộp thoại `gd-khung-thoai` 150×52 | You have 14 Palm points, child. / Tap a node t… | – → – | – → – | – | – | đạt |
| cu-do-chuong | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| cu-do-chuong | bảng `gd-khung-bang` 326×226 | Banyan: Cu Ti's Palm / Palm points: 14 left / … | – → – | – → – | – | – | đạt |
| cu-do-chuong | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Done | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| cu-do-chuong | nút `gd-nut-thuong` 73×22 | Skill tree | +0,3 → +0,3 | +0,2 → +0,0 | – | – | đạt |
| cu-do-chuong | nút `gd-nut-chinh` 73×22 | Palm tree | +0,3 → +0,3 | +0,2 → +0,0 | – | – | đạt |
| cu-do-chuong | nút `gd-nut-thuong` 73×22 | Guide | +0,3 → +0,3 | +0,2 → +0,0 | – | – | đạt |
| cu-do-chuong | nút `gd-nut-thuong` 73×22 | Leaderboard | -0,1 → -0,1 | +0,8 → +0,0 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con-chon` 98×120 | Fire Palm | – → – | – → – | chạm viền | – | **đã sửa** |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Heat / + | – → – | +0,9 → +0,8 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Big Blast / + | – → – | +0,4 → +0,4 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Burn Trail / req 5 | – → – | +0,4 → -0,3 | chữ đè chữ | chạm viền | còn: chạm viền |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Long Burn / req 5 | – → – | -0,1 → -0,6 | chữ đè chữ | chạm viền | còn: chạm viền |
| cu-do-chuong | ô con `gd-o-con` 92×18 | Charge Up / req 10 | – → – | -0,1 → +0,0 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 92×18 | Ember Rain / req 18 | – → – | +0,4 → +0,0 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 90×15 | ✓ In use | +0,3 → +0,3 | +0,1 → +0,1 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 98×120 | Poison Palm | – → – | – → – | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Venom | – → – | -1,4 → +0,0 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Dense Fog | – → – | -2,4 → +0,0 | lệch dọc | – | **đã sửa** |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Contagion / req 5 | – → – | -0,1 → -0,6 | chữ đè chữ | chạm viền | còn: chạm viền |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Corrode / req 5 | – → – | +0,4 → -0,3 | chữ đè chữ | chạm viền | còn: chạm viền |
| cu-do-chuong | ô con `gd-o-con` 92×18 | Triple Serpent / req 10 | – → – | -0,1 → +0,0 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 92×18 | Myriad Venom / req 18 | – → – | -0,1 → +0,0 | – | – | đạt |
| cu-do-chuong | nút nhỏ `gd-nut-thuong` 90×15 | Use this tree | -0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 98×120 | Ice Palm | – → – | – → – | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Frost | – → – | -1,4 → +0,0 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Range | – → – | -2,4 → +0,0 | lệch dọc | – | **đã sửa** |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Ice Pierce / req 5 | – → – | +0,4 → -0,3 | chữ đè chữ | chạm viền | còn: chạm viền |
| cu-do-chuong | ô con `gd-o-con` 44×18 | Frozen / req 5 | – → – | +0,4 → -0,3 | chữ đè chữ | chạm viền | còn: chạm viền |
| cu-do-chuong | ô con `gd-o-con` 92×18 | Shatter / req 10 | – → – | +0,4 → +0,0 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 92×18 | Ice Seal / req 18 | – → – | +0,4 → +0,0 | – | – | đạt |
| cu-do-chuong | nút nhỏ `gd-nut-thuong` 90×15 | Use this tree | -0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| cu-do-chuong | ô con `gd-o-con` 304×31 | Heat 0/5 · Fire Palm / Per rank: +10% damage | – → – | – → – | – | – | đạt |
| cu-do-chuong | nút nhỏ `gd-nut-chinh` 54×18 | Learn | +0,0 → +0,0 | -0,5 → -0,5 | – | – | đạt |
| cu-do-chuong | thẻ tên hộp thoại 41×14 | Scholar | -0,0 → -0,0 | -0,5 → -0,5 | – | – | đạt |
| cu-do-chuong | hộp thoại `gd-khung-thoai` 150×52 | You have 14 Palm points, child. / Tap a node t… | – → – | – → – | – | – | đạt |
| cu-do-huong-dan | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| cu-do-huong-dan | bảng `gd-khung-bang` 326×226 | Banyan: guide / Around the village / Drag on t… | – → – | – → – | – | – | đạt |
| cu-do-huong-dan | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Done | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| cu-do-huong-dan | nút `gd-nut-thuong` 73×22 | Skill tree | +0,3 → +0,3 | +0,2 → +0,0 | – | – | đạt |
| cu-do-huong-dan | nút `gd-nut-thuong` 73×22 | Palm tree | +0,3 → +0,3 | +0,2 → +0,0 | – | – | đạt |
| cu-do-huong-dan | nút `gd-nut-chinh` 73×22 | Guide | +0,3 → +0,3 | +0,2 → +0,0 | – | – | đạt |
| cu-do-huong-dan | nút `gd-nut-thuong` 73×22 | Leaderboard | -0,1 → -0,1 | +0,8 → +0,0 | – | – | đạt |
| cu-do-huong-dan | nút nhỏ `gd-nut-thuong` 30×18 | ‹ | -0,0 → -0,0 | -0,5 → -0,5 | – | – | đạt |
| cu-do-huong-dan | nút nhỏ `gd-nut-thuong` 30×18 | › | -0,0 → -0,0 | -0,5 → -0,5 | – | – | đạt |
| cu-do-huong-dan | thẻ tên hộp thoại 41×14 | Scholar | -0,0 → -0,0 | -0,5 → -0,5 | – | – | đạt |
| cu-do-huong-dan | hộp thoại `gd-khung-thoai` 150×52 | I've written it all down, child. / Read at eas… | – → – | – → – | – | – | đạt |
| bang-vang | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| bang-vang | bảng `gd-khung-bang` 326×226 | Banyan tree: Leaderboard / Ranked by Power | – → – | – → – | – | – | đạt |
| bang-vang | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Done | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| bang-vang | nút `gd-nut-thuong` 73×22 | Skill tree | +0,3 → +0,3 | +0,2 → +0,0 | – | – | đạt |
| bang-vang | nút `gd-nut-thuong` 73×22 | Palm tree | +0,3 → +0,3 | +0,2 → +0,0 | – | – | đạt |
| bang-vang | nút `gd-nut-thuong` 73×22 | Guide | +0,3 → +0,3 | +0,2 → +0,0 | – | – | đạt |
| bang-vang | nút `gd-nut-chinh` 73×22 | Leaderboard | -0,1 → -0,1 | +0,8 → +0,0 | – | – | đạt |
| bang-vang | ô con `gd-o-con` 304×104 | The Leaderboard needs a connection. Cloud save… | – → – | – → – | – | – | đạt |
| bang-vang | ô con `gd-o-con` 94×28 | Power / 195 | +0,3 → +0,3 | -0,6 → -0,6 | – | – | đạt |
| bang-vang | ô con `gd-o-con` 94×28 | Total stars / ★ 13 | +0,3 → +0,3 | -0,6 → -0,6 | – | – | đạt |
| bang-vang | ô con `gd-o-con` 94×28 | Farthest / Sea Cave 2 | +0,2 → +0,2 | -0,6 → -0,6 | – | – | đạt |
| bang-vang | thẻ tên hộp thoại 41×14 | Scholar | -0,0 → -0,0 | -0,5 → -0,5 | – | – | đạt |
| bang-vang | hộp thoại `gd-khung-thoai` 150×52 | The Leaderboard hangs at the / village hall, c… | – → – | – → – | – | – | đạt |
| ong-tu | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| ong-tu | bảng `gd-khung-bang` 326×226 | Village Yard / Cu Ti · Lv 14 / Power 195 | – → – | – → – | – | – | đạt |
| ong-tu | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Done | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| ong-tu | nút nhỏ `gd-nut-chon` 42×17 | Cu Ti | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| ong-tu | nút nhỏ `gd-nut-thuong` 41×17 | Book | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| ong-tu | nút nhỏ `gd-nut-thuong` 75×17 | Achievements | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| ong-tu | ô con `gd-o-con` 304×34 | Cu Tèo / held by Moc Tinh / Defeat Moc Tinh to… | – → – | – → – | – | – | đạt |
| ong-tu | ô con `gd-o-con` 304×34 | Cái Bống / held by Ngu Tinh / Defeat Ngu Tinh … | – → – | – → – | – | – | đạt |
| ong-tu | ô con `gd-o-con` 304×34 | Cu Lì / held by Ho Tinh / Defeat Ho Tinh to re… | – → – | – → – | – | – | đạt |
| ong-tu | thẻ tên hộp thoại 64×14 | Shrine Keeper | -0,0 → -0,0 | -1,0 → -1,0 | – | – | đạt |
| ong-tu | hộp thoại `gd-khung-thoai` 150×85 | Quiet now, the children are / playing in the y… | – → – | – → – | – | – | đạt |
| so-yeu-quai | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| so-yeu-quai | bảng `gd-khung-bang` 326×226 | Village Yard | – → – | – → – | – | – | đạt |
| so-yeu-quai | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Done | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| so-yeu-quai | nút nhỏ `gd-nut-thuong` 42×17 | Cu Ti | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| so-yeu-quai | nút nhỏ `gd-nut-chon` 41×17 | Book | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| so-yeu-quai | nút nhỏ `gd-nut-thuong` 75×17 | Achievements | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| so-yeu-quai | nút nhỏ `gd-nut-chon` 99×16 | Old Forest | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| so-yeu-quai | nút nhỏ `gd-nut-thuong` 99×16 | Sea Cave | +0,3 → +0,3 | -0,5 → -0,5 | – | – | đạt |
| so-yeu-quai | nút nhỏ `gd-nut-thuong` 99×16 | Ancient Castle | +0,3 → +0,3 | -0,5 → -0,5 | – | – | đạt |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 31×31 | ? | -0,1 → -0,1 | +2,5 → -1,0 | lệch dọc | – | **đã sửa** |
| so-yeu-quai | ô con `gd-o-con` 133×70 | Region complete / ★★ 0/12 · ★★★ 0/12 / All 12 … | – → – | – → – | tràn | – | **đã sửa** |
| so-yeu-quai | ảnh khung `gd-so-o-0` 41×41 | ? | +0,0 → +0,0 | – → – | – | – | đạt |
| so-yeu-quai | ảnh khung `gd-so-trang` 166×173 | ??? / Not met yet / Weak to: ? | – → – | – → – | – | – | đạt |
| so-yeu-quai | thẻ tên hộp thoại 64×14 | Shrine Keeper | -0,0 → -0,0 | -1,0 → -1,0 | – | – | đạt |
| so-yeu-quai | hộp thoại `gd-khung-thoai` 150×41 | You have not met this one. Just a / shadow, I … | – → – | – → – | – | – | đạt |
| thanh-tuu | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| thanh-tuu | bảng `gd-khung-bang` 326×226 | Village Yard / Title / No title | – → – | – → – | – | – | đạt |
| thanh-tuu | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Done | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| thanh-tuu | nút nhỏ `gd-nut-thuong` 42×17 | Cu Ti | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| thanh-tuu | nút nhỏ `gd-nut-thuong` 41×17 | Book | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| thanh-tuu | nút nhỏ `gd-nut-chon` 75×17 | Achievements | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| thanh-tuu | nút nhỏ `gd-nut-thuong` 86×17 | Change title | -0,1 → +0,1 | -1,0 → -1,0 | – | – | đạt |
| thanh-tuu | ô con `gd-o-con` 304×78 | First Steps / Bronze badge / Clear the tutoria… | – → – | – → – | – | – | đạt |
| thanh-tuu | nút nhỏ `gd-nut-chinh` 62×20 | Claim | -0,1 → -0,1 | -0,5 → -0,5 | – | – | đạt |
| thanh-tuu | thẻ tên hộp thoại 64×14 | Shrine Keeper | -0,0 → -0,0 | -1,0 → -1,0 | – | – | đạt |
| thanh-tuu | hộp thoại `gd-khung-thoai` 150×41 | 3 badges are waiting for / you to claim! | – → – | – → – | – | – | đạt |
| viec-hom-nay | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| viec-hom-nay | bảng `gd-khung-bang` 326×226 | Village Gate / Fri · 16/10 / Swaps left: 1 | – → – | – → – | – | – | đạt |
| viec-hom-nay | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Done | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| viec-hom-nay | nút nhỏ `gd-nut-chon` 69×17 | Today's jobs | +0,2 → +0,2 | -1,0 → -1,0 | – | – | đạt |
| viec-hom-nay | nút nhỏ `gd-nut-thuong` 53×17 | Settings | +0,2 → +0,2 | -1,0 → -1,0 | – | – | đạt |
| viec-hom-nay | ảnh khung `gd-the-viec` 304×34 | Defeat 12 monsters with the Shuriken / Easy · … | – → – | – → – | tràn | chạm viền | còn: chạm viền |
| viec-hom-nay | ảnh khung `gd-khung-xp` 84×10 | 0/12 | +0,1 → +0,1 | -0,4 → -0,4 | – | – | đạt |
| viec-hom-nay | nút nhỏ `gd-nut-thuong` 48×18 | Swap | -0,0 → -0,0 | -1,0 → -1,0 | – | – | đạt |
| viec-hom-nay | ảnh khung `gd-the-viec` 304×34 | Defeat 3 elites / Normal · 75, 2 forge mater… | – → – | – → – | cắt, tràn | cắt, chạm viền | còn: cắt, chạm viền |
| viec-hom-nay | ảnh khung `gd-khung-xp` 84×10 | 0/3 | -0,1 → +0,1 | -0,4 → -0,4 | – | – | đạt |
| viec-hom-nay | nút nhỏ `gd-nut-thuong` 48×18 | Swap | -0,0 → -0,0 | -1,0 → -1,0 | – | – | đạt |
| viec-hom-nay | ảnh khung `gd-the-viec` 304×34 | Beat 1 boss with its weakness (third star) / H… | – → – | – → – | tràn | chạm viền | còn: chạm viền |
| viec-hom-nay | ảnh khung `gd-khung-xp` 84×10 | 0/1 | -0,1 → -0,1 | -0,4 → -0,4 | – | – | đạt |
| viec-hom-nay | nút nhỏ `gd-nut-thuong` 48×18 | Swap | -0,0 → -0,0 | -1,0 → -1,0 | – | – | đạt |
| viec-hom-nay | ô con `gd-o-con` 148×68 | Daily chest / All 3 jobs: 2 forge materials, 1… | – → – | – → – | – | – | đạt |
| viec-hom-nay | nút `gd-nut-thuong` 136×24 | 3 jobs left | +0,0 → +0,0 | +0,2 → +0,0 | – | – | đạt |
| viec-hom-nay | ô con `gd-o-con` 152×68 | This week: 0/5 days / Mon / Tue | – → – | – → – | – | – | đạt |
| viec-hom-nay | nút `gd-nut-thuong` 144×20 | Weekly: 22 forge materials | +0,0 → +0,0 | -1,0 → -1,0 | – | – | đạt |
| viec-hom-nay | thẻ tên hộp thoại 52×14 | Town Crier | -0,0 → -0,0 | -0,5 → -0,5 | – | – | đạt |
| viec-hom-nay | hộp thoại `gd-khung-thoai` 150×52 | Knock knock! Here are today's / village jobs. … | – → – | – → – | – | – | đạt |
| cai-dat | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| cai-dat | bảng `gd-khung-bang` 326×226 | Village Gate / Save progress / Cloud save off:… | – → – | – → – | – | – | đạt |
| cai-dat | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Done | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| cai-dat | nút nhỏ `gd-nut-thuong` 69×17 | Today's jobs | +0,2 → +0,2 | -1,0 → -1,0 | – | – | đạt |
| cai-dat | nút nhỏ `gd-nut-chon` 53×17 | Settings | +0,2 → +0,2 | -1,0 → -1,0 | – | – | đạt |
| cai-dat | nút `gd-nut-thuong` 116×32 | Sound, controls › / Off | +0,2 → +0,2 | +0,2 → +0,0 | – | – | đạt |
| cai-dat | nút `gd-nut-thuong` 86×32 | Sharpness: High | +0,0 → +0,0 | +3,0 → +0,0 | lệch dọc | – | **đã sửa** |
| cai-dat | nút `gd-nut-thuong` 86×32 | Fullscreen | -0,1 → -0,1 | +3,5 → +0,0 | lệch dọc | – | **đã sửa** |
| cai-dat | nút `gd-nut-thuong` 146×32 | Sign in with Google | -0,0 → -0,0 | +3,5 → +0,0 | lệch dọc | – | **đã sửa** |
| cai-dat | nút `gd-nut-thuong` 146×32 | ✉ Feedback | +0,0 → +0,0 | +3,5 → +0,0 | lệch dọc | – | **đã sửa** |
| cai-dat | nút `gd-nut-nguy` 200×32 | Erase progress, start over | +0,4 → +0,4 | +3,0 → +0,0 | lệch dọc | – | **đã sửa** |
| cai-dat | nút `gd-nut-thuong` 92×32 | Language / English | +0,1 → +0,1 | -0,3 → -0,3 | – | – | đạt |
| cai-dat | thẻ tên hộp thoại 52×14 | Town Crier | -0,0 → -0,0 | -0,5 → -0,5 | – | – | đạt |
| cai-dat | hộp thoại `gd-khung-thoai` 150×52 | Knock knock knock! Hear ye, / villagers! Need … | – → – | – → – | – | – | đạt |
| ban-do-vung | thẻ Sắp có `gd-the-sap-co` 33×10 | soon | -0,0 → -0,0 | -1,0 → -1,0 | – | – | đạt |
| ban-do-vung | thẻ Sắp có `gd-the-sap-co` 33×10 | soon | -0,0 → -0,0 | -1,0 → -1,0 | – | – | đạt |
| ban-do-vung | thẻ Sắp có `gd-the-sap-co` 33×10 | soon | -0,0 → -0,0 | -1,0 → -1,0 | – | – | đạt |
| ban-do-vung | nút nhỏ `gd-nut-thuong` 68×18 | ✕ To village | +0,1 → +0,1 | -1,0 → -1,0 | – | – | đạt |
| ban-do-vung | nút nhỏ `gd-nut-thuong` 68×18 | Deep River › | +0,1 → +0,1 | -1,0 → -1,0 | – | – | đạt |
| ban-do-vung | nút nhỏ `gd-nut-thuong` 68×18 | Daily trials | +0,0 → +0,0 | -1,0 → -1,0 | – | – | đạt |
| ban-do-vung | bảng `gd-khung-bang` 232×66 | Tap a stage on the map to view. | – → – | – → – | – | – | đạt |
| ai-ngay | bảng `gd-khung-bang` 470×246 | Daily trials / Fri · 16/10 / New day in 09:19:… | – → – | – → – | – | – | đạt |
| ai-ngay | nút nhỏ `gd-nut-thuong` 70×17 | ← Map | -0,0 → +0,3 | -1,0 → -1,0 | – | – | đạt |
| ai-ngay | ô con `gd-o-con` 352×66 | Forge Trial / Mon / Tue | – → – | – → – | – | – | đạt |
| ai-ngay | nút `gd-nut-chinh` 98×30 | Easy · Rừng già / 14 FM | -0,2 → -0,2 | +0,9 → +0,0 | – | – | đạt |
| ai-ngay | nút `gd-nut-thuong` 98×30 | Normal · Hang biển / Beat Ngu Tinh first | +0,4 → +0,4 | -0,5 → -0,5 | – | – | đạt |
| ai-ngay | nút `gd-nut-thuong` 98×30 | Hard · Lâu đài cổ / Beat Ho Tinh first | +0,4 → +0,4 | +0,0 → +0,0 | – | – | đạt |
| ai-ngay | ô con `gd-o-con` 352×66 | Gold Trial / Thu / Fri | – → – | – → – | – | – | đạt |
| ai-ngay | nút `gd-nut-chinh` 98×30 | Easy · Rừng già / 520 | -0,2 → -0,2 | -0,1 → -0,1 | – | – | đạt |
| ai-ngay | nút `gd-nut-thuong` 98×30 | Normal · Hang biển / Beat Ngu Tinh first | +0,4 → +0,4 | -0,5 → -0,5 | – | – | đạt |
| ai-ngay | nút `gd-nut-thuong` 98×30 | Hard · Lâu đài cổ / Beat Ho Tinh first | +0,4 → +0,4 | +0,0 → +0,0 | – | – | đạt |
| hanh-trang | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| hanh-trang | bảng `gd-khung-bang` 470×226 | Inventory / Cu Ti / Lv 14 | – → – | – → – | cắt | cắt | còn: cắt |
| hanh-trang | nút nhỏ `gd-nut-thuong` 60×17 | ✕ Done | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| hanh-trang | nút `gd-nut-chinh` 110×19 | Hero | +0,0 → +0,0 | -0,5 → -0,5 | – | – | đạt |
| hanh-trang | nút `gd-nut-thuong` 110×19 | Weapons | +0,3 → +0,3 | -1,0 → -1,0 | – | – | đạt |
| hanh-trang | nút `gd-nut-thuong` 110×19 | Skills | +0,3 → +0,3 | +0,0 → +0,0 | – | – | đạt |
| hanh-trang | nút `gd-nut-thuong` 110×19 | Items | +0,3 → +0,3 | -0,5 → -0,5 | – | – | đạt |
| hanh-trang | ô con `gd-o-con` 112×96 | Outfit: Night Ninja / Buy Forest Hunter at the… | – → – | – → – | cắt | cắt | còn: cắt |
| hanh-trang | nút nhỏ `gd-nut-thuong` 112×18 | Learned: Shrine Keeper | +0,6 → +0,2 | -1,0 → -1,0 | tràn | – | **đã sửa** |
| hanh-trang | ô con `gd-o-con` 157×12 | 196 / HP | – → – | -0,2 → -0,2 | – | – | đạt |
| hanh-trang | ô con `gd-o-con` 157×12 | 120 / Mana | – → – | -0,5 → -0,5 | – | – | đạt |
| hanh-trang | ô con `gd-o-con` 157×12 | +8% / Bonus damage | – → – | -0,7 → -0,5 | chạm viền | – | **đã sửa** |
| hanh-trang | ô con `gd-o-con` 157×12 | 0% / Crit chance | – → – | -0,5 → -0,5 | – | – | đạt |
| hanh-trang | ô con `gd-o-con` 157×12 | 0% / DMG resist | – → – | -0,5 → -0,5 | – | – | đạt |
| hanh-trang | ô con `gd-o-con` 157×12 | 100% / Speed | – → – | -0,7 → -0,5 | chạm viền | – | **đã sửa** |
| hanh-trang | ô con `gd-o-con` 157×12 | 0% / Fire resist | – → – | -0,5 → -0,5 | – | – | đạt |
| hanh-trang | ô con `gd-o-con` 157×12 | 0% / Poison resist | – → – | -0,5 → -0,5 | – | – | đạt |
| hanh-trang | ô con `gd-o-con` 157×12 | 0% / Ice resist | – → – | -0,5 → -0,5 | – | – | đạt |
| hanh-trang | ô con `gd-o-con` 157×12 | +0% / Cooldown speed | – → – | -0,7 → -0,5 | chạm viền | – | **đã sửa** |
| xem-vk | ảnh khung `gd-thanh-tren` 584×16 | 4321 / 0 / 12 | – → – | – → – | – | – | đạt |
| xem-vk | bảng `gd-khung-bang` 470×246 | View weapon / Apprentice Sword / Sword · White | – → – | – → – | – | – | đạt |
| xem-vk | nút nhỏ `gd-nut-thuong` 70×17 | ← Back | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| xem-vk | ảnh khung `gd-o-ep-1` 70×70 | 1 | – → – | – → – | – | – | đạt |
| xem-vk | ô con `gd-o-con` 214×36 | Formed / Temper Lv 6 / Trait 1: what it leaves… | – → – | +0,1 → +0,1 | – | – | đạt |
| xem-vk | ô con `gd-o-con` 214×36 | Awakened / Temper Lv 12 / Trait 2: chain react… | – → – | +0,1 → +0,1 | – | – | đạt |
| tran-hud | tấm nhỏ `gd-khung-nho` 298×25 | Sword: tap Attack for a 3-hit combo; attack ri… | – → – | – → – | – | – | đạt |
| tran-hud | ảnh khung `gd-khung-mau` 120×11 | 301 / 301 | -0,1 → -0,1 | -0,4 → -0,4 | – | – | đạt |
| tran-hud | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| tran-hud | tấm nhỏ `gd-khung-nho` 85×68 | Map / Rooms 2/8 | – → – | – → – | – | – | đạt |
| tran-hud | tấm nhỏ `gd-khung-nho` 110×17 | 0 Spirit | – → – | +0,3 → +0,3 | – | – | đạt |
| tran-lau-dai | tấm nhỏ `gd-khung-nho` 298×25 | Sword: tap Attack for a 3-hit combo; attack ri… | – → – | – → – | – | – | đạt |
| tran-lau-dai | ảnh khung `gd-khung-mau` 120×11 | 301 / 301 | -0,1 → -0,1 | -0,4 → -0,4 | – | – | đạt |
| tran-lau-dai | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| tran-lau-dai | tấm nhỏ `gd-khung-nho` 85×68 | Map / Rooms 2/8 | – → – | – → – | – | – | đạt |
| tran-lau-dai | tấm nhỏ `gd-khung-nho` 110×17 | 0 Spirit | – → – | +0,3 → +0,3 | – | – | đạt |
| thong-bao | tấm nhỏ `gd-khung-nho` 90×18 | Blessing: Ember | +0,1 → +0,1 | -1,0 → -1,0 | – | – | đạt |
| thong-bao | ảnh khung `gd-khung-mau` 120×11 | 301 / 301 | -0,1 → -0,1 | -0,4 → -0,4 | – | – | đạt |
| thong-bao | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| thong-bao | tấm nhỏ `gd-khung-nho` 85×68 | Map / Rooms 2/8 | – → – | – → – | – | – | đạt |
| thong-bao | tấm nhỏ `gd-khung-nho` 110×17 | 0 Spirit | – → – | +0,3 → +0,3 | – | – | đạt |
| phuc-lanh | ảnh khung `gd-khung-mau` 120×11 | 196 / 196 | +0,1 → +0,1 | -0,4 → -0,4 | – | – | đạt |
| phuc-lanh | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| phuc-lanh | tấm nhỏ `gd-khung-nho` 85×68 | Map / Rooms 2/8 / 3 | – → – | – → – | – | – | đạt |
| phuc-lanh | tấm nhỏ `gd-khung-nho` 110×17 | 0 Spirit | – → – | +0,3 → +0,3 | – | – | đạt |
| phuc-lanh | bảng `gd-khung-bang` 378×186 | Blessing: pick one / Lasts until this stage en… | – → – | – → – | – | – | đạt |
| phuc-lanh | thẻ `gd-the-thuong` 112×126 | Weapons · Sword / Sword of the / Returned Lake | – → – | – → – | tràn | – | **đã sửa** |
| phuc-lanh | thẻ `gd-the-thuong` 112×126 | Dodge / Saint Giong's Iron Horse / Dodging lea… | – → – | – → – | tràn | – | **đã sửa** |
| phuc-lanh | thẻ `gd-the-thuong` 112×126 | Element · Fire / Kitchen God's Embers / Every … | – → – | – → – | – | – | đạt |
| trum | khung tên trùm `gd-khung-trum` 226×30 | Moc Tinh | +0,2 → +0,2 | -0,8 → -0,8 | – | – | đạt |
| trum | tấm nhỏ `gd-khung-nho` 98×18 | Moc Tinh appears | -0,2 → -0,2 | +0,0 → +0,0 | – | – | đạt |
| trum | ảnh khung `gd-khung-mau` 120×11 | 301 / 301 | -0,1 → -0,1 | -0,4 → -0,4 | – | – | đạt |
| trum | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| trum | tấm nhỏ `gd-khung-nho` 58×19 | Map | -0,0 → -0,0 | +0,5 → +0,5 | – | – | đạt |
| trum | tấm nhỏ `gd-khung-nho` 110×17 | 0 Spirit | – → – | +0,3 → +0,3 | – | – | đạt |
| trum-the-khang | khung tên trùm `gd-khung-trum` 226×30 | Moc Tinh | +0,2 → +0,2 | -0,8 → -0,8 | – | – | đạt |
| trum-the-khang | thẻ kháng/yếu `gd-the-nho` 55×13 | Resists Fire | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| trum-the-khang | thẻ kháng/yếu `gd-the-nho` 66×13 | Resists Poison | -0,0 → -0,0 | -0,5 → -0,5 | – | – | đạt |
| trum-the-khang | thẻ kháng/yếu `gd-the-nho` 48×13 | Weak: Ice | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| trum-the-khang | tấm nhỏ `gd-khung-nho` 98×18 | Moc Tinh appears | -0,2 → -0,2 | +0,0 → +0,0 | – | – | đạt |
| trum-the-khang | ảnh khung `gd-khung-mau` 120×11 | 301 / 301 | -0,1 → -0,1 | -0,4 → -0,4 | – | – | đạt |
| trum-the-khang | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| trum-the-khang | tấm nhỏ `gd-khung-nho` 58×19 | Map | -0,0 → -0,0 | +0,5 → +0,5 | – | – | đạt |
| trum-the-khang | tấm nhỏ `gd-khung-nho` 110×17 | 0 Spirit | – → – | +0,3 → +0,3 | – | – | đạt |
| cua-hang-ai | tấm nhỏ `gd-khung-nho` 238×35 | Sword: tap Attack for a 3-hit combo; attack ri… | +0,5 → +0,5 | -1,5 → -1,5 | – | – | đạt |
| cua-hang-ai | ảnh khung `gd-khung-mau` 120×11 | 196 / 196 | +0,1 → +0,1 | -0,4 → -0,4 | – | – | đạt |
| cua-hang-ai | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| cua-hang-ai | tấm nhỏ `gd-khung-nho` 85×68 | Map / Rooms 2/8 | – → – | – → – | – | – | đạt |
| cua-hang-ai | tấm nhỏ `gd-khung-nho` 110×17 | 0 Spirit | – → – | +0,3 → +0,3 | – | – | đạt |
| ban-do | ảnh khung `gd-khung-mau` 120×11 | 301 / 301 | -0,1 → -0,1 | -0,4 → -0,4 | – | – | đạt |
| ban-do | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| ban-do | tấm nhỏ `gd-khung-nho` 85×68 | Map / Rooms 2/8 | – → – | – → – | – | – | đạt |
| ban-do | tấm nhỏ `gd-khung-nho` 110×17 | 0 Spirit | – → – | +0,3 → +0,3 | – | – | đạt |
| ban-do | ảnh khung `gd-khung-ban-do` 442×268 | Stage Map · Old Forest 3 / Legend / Start | – → – | – → – | tràn | tràn | còn: tràn |
| tam-dung | ảnh khung `gd-khung-mau` 120×11 | 301 / 301 | -0,1 → -0,1 | -0,4 → -0,4 | – | – | đạt |
| tam-dung | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| tam-dung | tấm nhỏ `gd-khung-nho` 85×68 | Map / Rooms 2/8 | – → – | – → – | – | – | đạt |
| tam-dung | tấm nhỏ `gd-khung-nho` 110×17 | 0 Spirit | – → – | +0,3 → +0,3 | – | – | đạt |
| tam-dung | bảng `gd-khung-bang` 186×216 | Paused | – → – | – → – | – | – | đạt |
| tam-dung | nút `gd-nut-thuong` 150×28 | Continue | +0,0 → +0,0 | +2,2 → +0,0 | lệch dọc | – | **đã sửa** |
| tam-dung | nút `gd-nut-thuong` 150×28 | Sound: off | +0,0 → +0,0 | +2,2 → +0,0 | lệch dọc | – | **đã sửa** |
| tam-dung | nút `gd-nut-nguy` 150×28 | Quit to village | -1,7 → +0,0 | +0,2 → +0,0 | – | – | đạt |
| tam-dung | nút 73×26 | ✉ Feedback | +0,2 → +0,2 | +2,0 → +0,0 | – | – | đạt |
| tam-dung | nút 73×26 | Today's jobs | -0,1 → -0,1 | +1,0 → +0,0 | – | – | đạt |
| tam-dung | nút `gd-nut-thuong` 150×26 | Inventory (view) | +3,9 → +0,2 | +0,8 → +0,0 | lệch ngang | – | **đã sửa** |
| tran-hanh-trang | ảnh khung `gd-khung-mau` 120×11 | 301 / 301 | -0,1 → -0,1 | -0,4 → -0,4 | – | – | đạt |
| tran-hanh-trang | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| tran-hanh-trang | tấm nhỏ `gd-khung-nho` 85×68 | Map / Rooms 2/8 | – → – | – → – | – | – | đạt |
| tran-hanh-trang | tấm nhỏ `gd-khung-nho` 110×17 | 0 Spirit | – → – | +0,3 → +0,3 | – | – | đạt |
| tran-hanh-trang | bảng `gd-khung-bang` 470×226 | Inventory (view only) / View only here. Change… | – → – | – → – | cắt | cắt | còn: cắt |
| tran-hanh-trang | nút nhỏ `gd-nut-thuong` 60×17 | ← Back | +0,2 → +0,2 | -0,5 → -0,5 | – | – | đạt |
| tran-hanh-trang | nút `gd-nut-chinh` 110×19 | Hero | +0,0 → +0,0 | -0,5 → -0,5 | – | – | đạt |
| tran-hanh-trang | nút `gd-nut-thuong` 110×19 | Weapons | +0,3 → +0,3 | -1,0 → -1,0 | – | – | đạt |
| tran-hanh-trang | nút `gd-nut-thuong` 110×19 | Skills | +0,3 → +0,3 | +0,0 → +0,0 | – | – | đạt |
| tran-hanh-trang | nút `gd-nut-thuong` 110×19 | Items | +0,3 → +0,3 | -0,5 → -0,5 | – | – | đạt |
| tran-hanh-trang | ô con `gd-o-con` 112×96 | Outfit: Night Ninja / Buy Forest Hunter at the… | – → – | – → – | cắt | cắt | còn: cắt |
| tran-hanh-trang | ô con `gd-o-con` 157×12 | 301 / HP | – → – | -0,2 → -0,2 | – | – | đạt |
| tran-hanh-trang | ô con `gd-o-con` 157×12 | 120 / Mana | – → – | -0,5 → -0,5 | – | – | đạt |
| tran-hanh-trang | ô con `gd-o-con` 157×12 | +16% / Bonus damage | – → – | -0,7 → -0,5 | chạm viền | – | **đã sửa** |
| tran-hanh-trang | ô con `gd-o-con` 157×12 | 0% / Crit chance | – → – | -0,5 → -0,5 | – | – | đạt |
| tran-hanh-trang | ô con `gd-o-con` 157×12 | 0% / DMG resist | – → – | -0,5 → -0,5 | – | – | đạt |
| tran-hanh-trang | ô con `gd-o-con` 157×12 | 100% / Speed | – → – | -0,7 → -0,5 | chạm viền | – | **đã sửa** |
| tran-hanh-trang | ô con `gd-o-con` 157×12 | 0% / Fire resist | – → – | -0,5 → -0,5 | – | – | đạt |
| tran-hanh-trang | ô con `gd-o-con` 157×12 | 0% / Poison resist | – → – | -0,5 → -0,5 | – | – | đạt |
| tran-hanh-trang | ô con `gd-o-con` 157×12 | 0% / Ice resist | – → – | -0,5 → -0,5 | – | – | đạt |
| tran-hanh-trang | ô con `gd-o-con` 157×12 | +0% / Cooldown speed | – → – | -0,7 → -0,5 | chạm viền | – | **đã sửa** |
| thang | khung tên trùm `gd-khung-trum-nho` 196×26 | Mushroom King | -0,0 → +0,1 | -0,8 → -1,2 | chạm viền | – | **đã sửa** |
| thang | tấm nhỏ `gd-khung-nho` 128×18 | Mushroom King appears | – → -0,2 | – → -1,0 | – | – | đạt |
| thang | ảnh khung `gd-khung-mau` 120×11 | 196 / 196 | +0,1 → +0,1 | -0,4 → -0,4 | – | – | đạt |
| thang | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| thang | tấm nhỏ `gd-khung-nho` 58×19 | Map | -0,0 → -0,0 | +0,5 → +0,5 | – | – | đạt |
| thang | tấm nhỏ `gd-khung-nho` 110×17 | 0 Spirit | – → – | +0,3 → +0,3 | – | – | đạt |
| thang | bảng `gd-khung-bang` 346×234 | Cleared Old Forest 2 / Stage cleared / No poti… | – → – | – → – | – | – | đạt |
| thang | nút nhỏ `gd-nut-thuong` 68×17 | ✉ Feedback | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| thang | nút `gd-nut-thuong` 96×26 | To village | -0,0 → -0,0 | +0,8 → +0,0 | – | – | đạt |
| thang | nút `gd-nut-thuong` 96×26 | Replay | -0,1 → -0,1 | +0,8 → +0,0 | – | – | đạt |
| thang | nút `gd-nut-chinh` 116×30 | Next stage ▶ | -0,0 → -0,0 | +1,8 → +0,0 | – | – | đạt |
| thua | ảnh khung `gd-khung-mau` 120×11 | 196 / 196 | +0,1 → +0,1 | -0,4 → -0,4 | – | – | đạt |
| thua | ảnh khung `gd-khung-mana` 108×8 | 60 / 120 | -0,0 → -0,0 | -0,4 → -0,4 | – | – | đạt |
| thua | tấm nhỏ `gd-khung-nho` 85×68 | Map / Rooms 2/8 | – → – | – → – | – | – | đạt |
| thua | tấm nhỏ `gd-khung-nho` 110×17 | 0 Spirit | – → – | +0,3 → +0,3 | – | – | đạt |
| thua | bảng `gd-khung-bang` 346×234 | You fell in the Fight room / +3 · +0 · Today's… | – → – | – → – | – | – | đạt |
| thua | nút nhỏ `gd-nut-thuong` 68×17 | ✉ Feedback | +0,1 → +0,1 | -0,5 → -0,5 | – | – | đạt |
| thua | nút `gd-nut-thuong` 140×26 | To village | +0,0 → +0,0 | -0,8 → -0,8 | – | – | đạt |
| thua | nút `gd-nut-thuong` 140×26 | Retry | -0,0 → -0,0 | -0,8 → -0,8 | – | – | đạt |

