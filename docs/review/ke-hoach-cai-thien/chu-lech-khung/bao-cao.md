# Báo cáo: chữ lệch / tràn khung (chu-lech-khung)

Làm theo `YEU-CAU.md` cùng thư mục, nhánh `khoi-tao-du-an`. **Không chơi thử game**: chỉ dựng ảnh tĩnh giao diện (dừng vòng lặp khung hình, dựng trạng thái màn rồi vẽ đúng một khung), `node --check` mọi `game/js/*.js`, `python3 game/build.py`.
Không đụng logic đăng nhập Google / lưu mây / `?cloud=0` (`cloud.js`, `cloud_ui.js` không sửa; chỉ phần vẽ chữ trên nút), không chép apiKey.

## Kết quả đo (ảnh tĩnh, 31 màn × VI/EN, phông thay Inter)

"Tràn lòng" = hộp chữ thật (actualBoundingBox) ra ngoài lòng khung > 0,25 điểm game. Lòng = lòng THẬT đo từ ảnh khung (xem dưới), khung code = trong viền code.

| Cỡ màn | Trước VI | Sau VI | Trước EN | Sau EN |
|---|---|---|---|---|
| 480×270 (16:9, ×3) | 214 tràn + 33 chỉ qua đinh góc | **0** + 4 | 179 + 47 | **0** + 11 |
| 4:3 (1024×768, có lề) | 214 + 33 | **1**¹ + 4 | 179 + 47 | **0** + 11 |
| dọc (390×844, game xoay) | 214 + 46 | **0** + 4 | 179 + 54 | **0** + 11 |

- Chữ bị cắt "…" sau sửa: **0** (VI và EN, phông Inter). Phông rộng hơn nhiều (DejaVu Sans, thử chữ dài): 0 tràn; 1–2 nhãn cắt "…" (nút mẫu, "Learned: Shrine Keeper").
- Khung code (`?khunganh=0`): trước 50 / 35 tràn (VI / EN) → sau **0 / 0**.
- ¹ Một dải thông báo ở 4:3: soát lại bằng ảnh thì chữ nằm trong lòng (cách mép phải ~2,4 điểm); số đo lệch do dải đang "nảy" khi chụp.
- "Chỉ qua đinh góc" = khung quá hẹp, chữ đi qua ô vuông nhỏ trong lòng ở hàng góc (vẫn không chạm mây / viền): toàn nút mẫu trong tấm `mau` + 4 chỗ thật ở EN (xem *Còn lại*).

Theo loại (trước, 16:9, VI, gồm cả chỗ chỉ qua đinh góc): chữ nơi gọi tự vẽ trong ô con 129 · nút nhỏ 24 · tiêu đề bảng 21 · nút 13 · thẻ tên hộp thoại 13 · lời thoại 12 · thẻ kháng/yếu 12 · chữ trong bảng do nơi gọi vẽ 9 · thẻ "Sắp có" 6 · khung tên trùm 3 · dải thông báo 2 · thẻ 2 · tấm nhỏ 1.

Ảnh soát: **`xem-chu.png`** — mỗi hàng một chỗ lệch nặng nhất của từng loại khung, trái = trước (`?chucu=1`), phải = sau, VI rồi EN.

## Hàm chung (`js/ui_theme.js`)

- **Lòng thật**: `vien` của ảnh là ô cắt 9 mảnh (gồm núm / mây góc), không phải độ dày viền (nút 63×24 có vien [9,13,9,13] nhưng giữa nút viền chỉ ~4 điểm). `cong-cu/do-long-khung.py` loang từ tâm ảnh, ghi cho từng hàng ảnh đoạn lòng [trái, phải) vào bảng `LONG_BANG` (20 khung: gd-nut-*, gd-khung-bang/-thoai/-nho/-canh-bao/-trum*/-tinh-anh/-ban-do, gd-dai-thong-bao, gd-the-thuong/-nho/-sap-co, gd-thanh-tren, gd-o-con(-chon), gd-o-do-0). Ảnh soát `cong-cu/long-khung.png`. Ảnh đổi cỡ mà chưa đo lại → tự dùng `vien`.
- **`T.longKhung(ma, w, h, k, vien)`**: đổi bảng theo đúng cách game cắt 9 mảnh + thu đều (`khungVeDeu`) ra đoạn lòng ở từng hàng của khung đã co giãn; `.span(a, b)`, `.spanGiua` (bỏ qua đinh góc trong lòng — chỉ dùng khi khung quá nhỏ).
- **`T.datChu` / `T.chuTrongKhung(s, x, y, w, h, o)`**: chữ trong lòng trừ **2 điểm đệm**; căn giữa ngang theo đoạn lòng ở đúng các hàng chữ chiếm, dọc theo khối chữ hoa (cao "H" thật của phông) rồi đẩy cho dấu / chân chữ không chạm viền. Chữ dài: **thu cỡ** (tới 6,5) → **xuống dòng** nơi có chỗ (`o.dong`) → khung quá nhỏ: đệm hẹp dần 1 → 0,5 → 0 (vẫn trong lòng) → lòng giữa → **cuối cùng mới cắt "…"**. Có `o.vung` (chỉ đặt trong một phần khung: bên phải biểu tượng, dải tiêu đề…), `o.phu` (dòng phụ nhỏ, thu cỡ riêng), `o.align`. Kết quả nhớ theo chữ + khung + ngôn ngữ (không đo lại mỗi khung hình). Tiếng Anh: chia dòng trên bản dịch.
- Lối tắt cho nơi gọi: `T.chuO` (chữ trong ô con), `T.chuTam` (chữ trong tấm nhỏ) — `?chucu=1` thì vẽ y chỗ cũ.
- Dùng lại ở: `T.btn` / `T.sbtn` / `T.tab` (nhãn + dòng phụ), nút dạng thẻ của `ui.btn`, tiêu đề `T.panel`, `T.dialog` (lời thoại + thẻ tên), `T.toast` / `T.toastFit`, chú thích biểu tượng (`T.endFrame`), tiêu đề `T.card`, `T.bossBar` (tên + dấu hiệu, chỉ phía trên thanh máu).
- Đo chữ "số + tài nguyên" theo đúng cách vẽ (biểu tượng thay chữ) nên nút có giá không bị thu nhỏ oan.

## Nơi gọi đã chỉnh
- `hanh_trang.js`: 10 ô chỉ số (tên trái / số phải), nhãn cây kỹ năng, nút "Hành trang" ở làng, vùng cuộn cắt trong lòng khung bảng (trước chữ cuộn lấn viền đáy 2,5 điểm), dòng "Hạ … để mở …" trong lòng ô hình.
- `stage.js`: dòng vũ khí (tên / dòng linh khí mỗi dòng một dải), thẻ kháng / yếu dưới thanh trùm (trước đo chữ 6,5 mà vẽ 7,5 nên luôn tràn), dòng thông báo trận, ô lời chỉ dẫn.
- `village.js`: thẻ "Sắp có", "đang mang", thẻ đặc trưng hệ (Xem vũ khí), ba bạn dạy Cu Tí, chữ phiên bản (tránh núm góc), thẻ thông tin ải, nút đổi nguyên liệu, thẻ Bà Hàng Xén, nút lật trang, nút EN / VI.
- `chuong_ui.js` (nút cây chưởng: tên, "cần N", "+"; dòng mô tả), `ep_do.js` (chi tiết, hộp hỏi xác nhận), `bang_vang.js` (dòng "cần mạng", nút lật trang), `ai_ngay.js` (hai đoạn chữ cột trái), `luc_chien.js` (đường cơ sở dải Lực chiến).

## Đổi bố cục / khung vì khung quá nhỏ cho chữ (chỉ khi bật, `?chucu=1` như cũ)
| Chỗ | Trước → sau | Vì |
|---|---|---|
| Ô con ảnh cạnh ngắn < 40 (dòng chỉ số 12, nút cây 18, hàng vũ khí 22…) | ảnh thu đều ½ (viền ~4 → ~2), ô chọn thêm nét vàng | ô code cũ viền 1 điểm, chữ đặt sát; cỡ / chỗ ô không đổi |
| Bảng ảnh cạnh ngắn < 90 (thẻ thông tin ải 226×60) | viền ảnh 10 → 5 | chữ dòng đầu nằm trên viền |
| Thẻ tên hộp thoại | cao 12 → 14 | lòng 8 điểm, chữ có dấu cao ~9 |
| Thẻ kháng / yếu | cao 10 → 13, rộng chữ + 8 → + 12, vành trắng giữ 2,5 | lòng chỉ 5 điểm |
| Thẻ "Sắp có" bản đồ vùng | rộng 32 → theo chữ (≥ 32) | "sắp có" / "coming soon" không vừa |
| Hộp hỏi ép đồ | cao 36 → 40 (lên trên 4), nút cao 14 → 15 | dòng hỏi nằm trên viền ảnh |
| Nút đổi nguyên liệu (Bà Hàng Xén) | 76/80×20 → ×28, chữ hai dòng | "Hạ Ngư Tinh để mở" |
| Thẻ Nguyên liệu / Quặng | rộng chữ + 9 → + 22 (nếu băng tiêu đề còn chỗ) | mây + đinh góc ~9 mỗi bên |
| Nút ‹ › lật trang | 26 → 30 (làng), 24 → 30 (bảng vàng) | hai đinh góc dồn vào giữa |
| Nút EN / VI (màn chào) | 44 → 52 (mép phải giữ) | |
| Nút "Bộ: …" / "Nét đã học" (Hành trang) | cao 14 / 16 → 18 | |
| Dòng thông báo trận | cao + 2 | |
| Ô lời chỉ dẫn | rộng chữ + 12 → + 16 | |
Vùng chạm chỉ đổi theo các nút trên (to ra, không chồng nút khác).

## Cờ quay lui
`?chucu=1` (`G.CHU_CU = true`): mọi chỗ trên vẽ y như trước phiên (kiểm bằng chính bộ soát: chế độ "cũ" ra đúng số tràn trước khi sửa). Các cờ cũ (`?khunganh=0`, `?churo=0`, `?rsc=0`, `?cloud=0`) giữ nguyên.

## Công cụ (`cong-cu/`)
- `do-long-khung.py [--ghi]`: đo lòng ảnh khung, ghi bảng vào `ui_theme.js`, ảnh soát `long-khung.png`.
- `xem-chu.py <thư mục>`: Chromium không màn hình mở `dist/linh-khi.html?cloud=0`, dừng vòng lặp, dựng 32 màn (tấm mẫu mọi kiểu khung, màn chào, truyện, làng + mọi bảng, bản đồ vùng, ải ngày, hành trang, trận, trùm + thẻ kháng, bản đồ, dừng, thắng, thua), vẽ một khung, đo mọi chữ so với lòng khung chứa nó. Biến: `PHONG=DejaVu`, `CO=169,43,doc`, `CANH=…`, `THEM='&khunganh=0'`; `xem-chu.py <thư mục> --anh` dựng `xem-chu.png`.

## Còn lại / lưu ý
- Máy thử không tải được Google Fonts: đo bằng Inter thay Be Vietnam Pro (rộng gần bằng), thêm một lượt DejaVu Sans (rộng hơn hẳn). Hàm đặt chữ đo bằng phông thật lúc chạy nên trên máy thật vẫn tự thu / xuống dòng.
- Khung hẹp, chữ EN dài vẫn đi qua đinh góc nhỏ trong lòng (không chạm mây / viền): "Upgrade forge" (thẻ Lò rèn 73×22), "Refine" (nút Ép 42×24), "Learned: Shrine Keeper" (100×18), "Inventory"/"Hành trang" (nút túi ở làng). Muốn sạch hẳn thì cần nút rộng hơn ở bản EN.
- Còn ~15 chữ nằm trong lòng nhưng đệm ngang 1–1,9 điểm (nút nhỏ thu hết cỡ, tiêu đề T.head đặt ở CX). Màn dọc đo thêm ~30 chỗ như vậy do làm tròn phông ở cỡ nhỏ.
- Số ải trên thẻ ải (gd-the-*) giữ chỗ neo mặt bia như cũ (không phải khung chữ); chữ dưới thẻ không đổi.
- Dung lượng bản một tệp: 28,74 → 28,78 MB (bảng lòng + mã ~32 KB; dựng lại sau khi rebase lên các phiên khác).
