# Bảng animation Zed — đối chiếu với code (13/10/2026)

Hướng đã chốt: **mỗi bộ trang phục = nguyên bộ animation Zed mặc sẵn bộ đó** (không ghép lớp). Vũ khí vẫn là ảnh riêng do code gắn + xoay theo tay.
Quy chuẩn chung: khung game 48×48 (ảnh nguồn 96×96, net 2), neo chân (24,45) **toạ độ game 48×48** (= (48,90) trên ảnh nguồn 96×96), quay PHẢI, mỗi động tác 1 hàng, nền #00FF00.
Nguồn số: `game/js/moves.js` (G.MOVES), `combat.js`, `sprite_custom.js` (MOC_DON, khungDon, chonEmBe), `chuong.js`; đối chiếu `docs/review/ke-hoach-cai-thien/he-thong-animation/PHU-LUC-4-DON-DANH-HITBOX.md` (đo ở commit 229e263). **Chưa sửa code, chưa thay asset.**

## Cách game chọn khung (quan trọng khi chốt số khung)
- Sát thương **chỉ theo đồng hồ**: đòn chạm khi tiến độ `u = 1 − atkT/atkDur` vượt `hitAt` (mặc định 0,45; búa nện 0,35). Đo thật: chạm ở u ≈ 0,48–0,50 (trễ 2 nhịp vì trừ dt trước khi so).
- Hình chỉ **đọc** tiến độ u để chọn khung → số khung ảnh tự do, nhưng **khung ★ = khung hiện ra tại u = hitAt** phải là tư thế chạm.
- Đòn cung/giáo/búa/chưởng: bảng mốc `MOC_DON` (6 khung): cung [0, .15, .30, **.45**, .62, .80]; giáo [0, .22, **.45**, .55, .70, .85]; búa [0, .20, .38, **.45**, .60, .80]; chưởng [0, .12, .25, .40, .60, .80].
- Kiếm: hàng `atk_sword` 6 khung = **3 nhát × 2 khung** (khung đổi ở u = 0,40), chọn theo `comboI`.
- Đứng/chạy/chết lặp theo `giay` của tấm; lộn, trúng đòn, chưởng, đặc biệt chọn theo tiến độ đồng hồ.
- Đang chạy mà đánh (`G.CHAY_DANH = 'than'`): **thân vẫn hàng chạy**, chỉ vũ khí code vung.

## Bảng
| # | Động tác (khoá code) | Thời lượng thật trong code | Lặp | Lúc chạm / ★ | Combo / giữ | Hiện có trong tấm | Ghi chú |
|---|---|---|---|---|---|---|---|
| 1 | Đứng `idle` | theo tấm (`giay` 1,0 s) | có | – | – | 6 khung | tự do 6–8 khung |
| 2 | Đi bộ | **KHÔNG CÓ trong code** | – | – | – | – | game chỉ có đứng/chạy; cần quyết định |
| 3 | Chạy `move` | theo tấm 0,6–0,65 s; nhịp chân theo tốc độ thật (`P.chayT`) | có | – | – | 8 (gốc) / 6 (bộ) | |
| 4 | Lộn né `ne` | **0,27 s** (`dodgeT`), bất tử 0,32, hồi 1 s | không | – | Nhát lướt kiếm sau lộn | 6 | `giay 0.4` trong tấm KHÔNG dùng |
| 5 | Trúng đòn `hit` | **0,2 s** (`hurtT`) | không | – | bị hình đòn đè nếu đang đánh | 3–4 | |
| 6 | Chết `die` | 8 khung × 0,075 = 0,6 s; màn thua sau 1,2 s | không (giữ khung cuối) | – | – | 8 | |
| 7 | Chưởng `cast` | **castT 0,3 s** nhưng hình chia cho **0,4** (lỗi L3: mất ¼ đầu) | không | đạn sinh **ngay khi bấm** (u = 0) | – | 6 | cần chốt: 0,3 hay sửa hình |
| 8 | Kiếm nhát 1 Chém ngang | 0,30 s | không | 0,45 | chuỗi 3 nhịp; nối nếu bấm trong **0,45 s** sau lúc đòn dự kiến hết; đệm nút 0,25 s; giữ nút cũng ra chuỗi | 2 khung (trong hàng 6) | |
| 9 | Kiếm nhát 2 Chém ngược | 0,30 s | không | 0,45 | như trên | 2 khung | |
| 10 | Kiếm nhát 3 Nhát kết | 0,46 s | không | 0,45 | như trên | 2 khung | mult 1,8 |
| 11 | Kiếm Nhát lướt (sau lộn) | 0,12 s lướt | – | dải quét mỗi nhịp | cửa sổ 0,35 s sau lộn | dùng hàng chạy ×2 | |
| 12–14 | Giáo đâm 1/2/3 | 0,38 / 0,34 / 0,34 s | không | 0,45 | **chuỗi 4 nhịp** (3 đâm + quét), gap 0,45 s, bấm-thả mới ra | 1 hàng 6 khung chung | danh sách của anh có 2 đâm + đâm sâu: khớp 3 đâm |
| 15 | Giáo Quét vòng (nhịp 4) | 0,52 s | không | 0,45 | | (chung hàng) | |
| 16 | Giáo Xốc tới (giữ-thả) | giữ: đà đầy 0,5 s, tối thiểu 0,3 s; lao 0,16 s | – | dải quét lúc lao | giữ nút | khung giữ = khung 0/1 hàng giáo | cần **tư thế giữ** |
| 17 | Búa Nện (bấm) | **0,80 s** | không | **0,35** (hình hiện tại đặt chạm ở 0,45 → lệch, lỗi L1) | không chuỗi | 6 | |
| 18 | Búa Lấy đà (giữ) | nấc 1 ≥ 0,5 s, nấc 2 ≥ 1,1 s, tối thiểu 0,45 s; đầy rồi giữ thêm 0,8 s tự thả | giữ tư thế | – | | khung 0/1 hàng búa | cần **tư thế giữ** (có thể lặp rung) |
| 19 | Búa Nện đất / Nện đất mạnh (thả) | 0,70 s, vào từ u = 0,36 | không | 0,45 | | (chung hàng búa) | sóng chấn là hiệu ứng riêng |
| 20 | Phi tiêu ném (thay **cung Bắn**) | 0,38 s đứng / 0,45 s chạy | không | 0,45 (đạn sinh lúc chạm) | không chuỗi | – (cung: 6) | phi tiêu **chưa có trong code**; tạm theo số của cung |
| 21 | Phi tiêu ngắm/ném chùm (thay **Tên mạnh**) | giữ: đà đầy 0,75 s, tối thiểu 0,3 s; thả: 0,5 s vào từ u = 0,45 | – | đạn bay **ngay khi thả** | giữ nút | khung giữ cung 0–2 theo đà | cần **tư thế ngắm 3 nấc** |
| 22 | Đặc biệt kiếm Trảm Nguyệt | specT 0,35 | không | sinh vệt **ngay khi bấm** | | dùng hàng `cast`/`atk` | **CHƯA có trong danh sách của anh** |
| 23 | Đặc biệt giáo Phi Thương | 0,35 | không | ngay khi bấm (ném giáo bay đi/về) | | `cast`/`atk` | **chưa có**; lúc giáo bay Zed đánh tay không "Đấm" 0,30 s |
| 24 | Đặc biệt búa Địa Chấn | 0,35 | không | vòng ngay; vệt nứt sau 0,12 s | | `cast`/`atk` | **chưa có** |
| 25 | Đặc biệt cung Mưa Tên → mưa phi tiêu | 0,35 | không | vùng tròn, mỗi 0,15 s | | `cast`/`atk` | **chưa có** |
| 26 | Đấm (tay không) | 0,30 s | không | 0,45 | | – | khi giáo đang bay |
| 27 | Báo trước `tele` | – | – | – | dùng làm tư thế giữ dự phòng | 4 | |
| Hiệu ứng | đạn phi tiêu, vệt chém, vệt đâm, sóng chấn, trúng đòn, bụi chân | — | — | — | — | hu-* đã có nhiều bản | asset riêng |

## Dữ liệu còn thiếu / cần anh chốt trước khi gen
1. **Ảnh Zed chuẩn duy nhất**: dùng `docs/anh-goc/zed/zed-v2-canonical.png` (tóc trắng, sừng) hay bộ mới anh định gen? Cần 1 ảnh, thân không vũ khí.
2. **Bộ trang phục đầu tiên**: ảnh hoặc mô tả (món, màu, dáng). Và: các bộ có gắn với 3 vùng như hiện tại (bộ Rừng/Biển/Lâu, chọn theo áo đang mặc — quyết định Q1 ngày 11/10) không?
3. **Đi bộ**: code không có → thêm trạng thái đi (đẩy cần nhẹ) hay bỏ tấm đi?
4. **4 đòn đặc biệt + Đấm** (mục 22–26): gen riêng hay dùng chung hàng chưởng như hiện nay?
5. **Tư thế giữ** cho giáo (Xốc tới), búa (Lấy đà), phi tiêu (ngắm 3 nấc): gen riêng hay lấy khung đầu của hàng đòn?
6. **Chưởng**: castT 0,3 s nhưng hình đang tính theo 0,4 → chốt 0,3 (không đổi nhịp) thì cần sửa cách chọn khung ở bước tích hợp.
7. **Búa nện**: chạm ở 0,35 nhưng hình hiện đặt ở 0,45 → khung ★ của tấm mới phải đặt theo **0,35**; bước tích hợp sửa bảng mốc, không đổi nhịp.
8. **Combo kiếm/giáo nhiều hàng**: code hiện đọc 1 hàng 6 khung/vũ khí (kiếm 2 khung/nhát). Tấm mới nhiều khung hơn/nhiều hàng → bước tích hợp phải thêm bảng mốc mới cho từng nhát (giữ nguyên thời lượng + hitAt).
9. **Phi tiêu**: xác nhận dùng y nhịp cung (0,38/0,45 s, hitAt 0,45; giữ 0,75 s) — đổi cơ chế là việc code riêng.
10. **Chạy + đánh**: hiện thân giữ hàng chạy, chỉ vũ khí vung → có cần tấm "chạy-chém" không?
11. **Điểm nắm tay + góc vũ khí**: đo trên từng khung của từng bộ, lưu theo **toạ độ ảnh nguồn 96×96** (ghi rõ trường `he: "nguon-96"`), game chia 2 khi dùng.

## Số khung đề xuất (để chốt; ★ tính theo hitAt)
| Động tác | Khung | ★ |
|---|---|---|
| Đứng | 6–8 | – |
| Chạy | 8 | – |
| Lộn | 6 | – |
| Trúng đòn | 4 | – |
| Chết | 8 | – |
| Chưởng | 6 | khung 1 (đạn ra ngay) — hoặc sửa thành tư thế đẩy ở khung 2 nếu chấp nhận hình sớm hơn đạn ~0 s |
| Kiếm nhát 1 / 2 / 3 | 5 / 5 / 6 | khung 3 / 3 / 3 (u 0,45 ≈ 2,25/5 → khung 3; 0,45×6 = 2,7 → khung 3) |
| Giáo đâm 1–3, quét | 6 mỗi đòn | khung 3 |
| Búa nện | 8 | khung **3** (0,35×8 = 2,8) |
| Búa nện đất (thả) | 6 | khung 3 |
| Phi tiêu ném | 6 | khung 3 |
| Tư thế giữ (giáo/búa/phi tiêu) | 2–3 | – |
