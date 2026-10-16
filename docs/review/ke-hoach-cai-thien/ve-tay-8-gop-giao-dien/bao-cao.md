# Vẽ tay 8 gộp: giao diện nhỏ, icon phúc lành, kiếm 2 mới (16/10)

Đã chờ đủ báo cáo `can-chu-khung` và `bua-moi-16-10` (có lúc 15:21), đọc cả `kiem-moi-16-10`, rồi mới sửa game.
**Không chơi thử**: chỉ chụp ảnh headless. Không đổi luật, số liệu, thời gian đòn. Không đụng đăng nhập Google, lưu mây, `?cloud=0`.

## Tóm tắt

| Việc | Kết quả |
|---|---|
| 1. Giao diện | 17 hình vẽ code → ảnh gen (G1 đủ 7 hàng, G6 hàng 1–3). `?vecode=1` về vẽ code. |
| 2. Icon phúc lành | 14 icon `gd-phuc-lanh-<khoá>` đã vào thẻ chọn. Đúng thứ tự, đúng khoá. |
| 3. Kiếm 2 | Hàng mới 5 khung, chạm khung 3, neo kiếm cả 4 cấp. `?kiemmoi=0` về kiếm cũ. |

## Việc 1: giao diện

Công cụ cắt: `cong-cu/cat-gd.py` (bỏ nền xanh, thu NEAREST về cỡ đích). Ảnh xem tất cả: `cong-cu/ra/xem-tat-ca.png`.

| Ảnh | Thay chỗ nào |
|---|---|
| `gd-cham-moi` | Chấm đỏ "có mới" trên mặt NPC và trên nút |
| `gd-ban-do-cham`, `-khoa` | Chấm đường nối ải trên bản đồ vùng (đã mở / chưa mở) |
| `gd-o-diem`, `-trong` | Ô điểm kỹ năng ở Cụ Đồ |
| `gd-chuong-o`, `-trong`, `-noi` | Chấm bậc + vạch nối ở Cây chưởng (vạch đã mở nhuộm màu hệ như cũ) |
| `gd-bia-gach` | Hai gạch đồng bên chữ SPIRITBLADE (gạch trái lật ngang) |
| `gd-bong-thoai` + `-duoi` | Bong bóng thoại (thân 9 mảnh + đuôi; nền vàng thì nhuộm lòng) |
| `gd-lang-thanh-duoi`, `gd-lang-dia`, `-chon` | Dải mặt NPC ở làng, đĩa chân dung thường / đang chọn |
| `gd-loi-mon-rung` | Lối mòn Rừng già: lấy màu đất từ ảnh thay màu phẳng |
| `gd-tham-lau` | Thảm dẫn cửa Lâu đài: đã xoay 90° (viền vàng hai bên), lặp dọc; cửa trái / phải xoay ngang |
| `gd-long-khung` | Lòng gỗ trong ô con (lát lặp) |

Chữ trong khung:
- Bong bóng thoại nay đặt chữ bằng `T.chuTrongKhung`. Lòng đo bằng `chu-lech-khung/cong-cu/do-long-khung.py` (đã thêm `gd-bong-thoai`).
- Đo lại bằng công cụ `can-chu-khung` (37 màn, VI + EN): mọi màn **giống hệt trước**, trừ dải mặt NPC ở làng.
- Dải mặt NPC: công cụ báo 7 tên dưới mặt "lệch / tràn". Đây là báo nhầm: công cụ coi cả dải là một khung chữ, nhưng mỗi tên nằm dưới mặt của nó, đúng chỗ cũ. Dải dài thêm 3 điểm ở đáy để tên không đè vành đồng.

Không làm (ảnh có nhưng game không có chỗ dùng): chấm bản đồ màu vàng, ô điểm xám khoá, khung 2 của chấm đỏ.

## Việc 2: icon phúc lành

- p1 = guom, no, tre, riu, trong, ngua, nui. p2 = song, ca, ngan, than, hoa, noc, suong. Khớp prompt.
- Cỡ 90×90 (net 3 → ô 30×30 trên thẻ), giữ tỉ lệ, NEAREST. Bỏ cả lỗ nền xanh kín bên trong (lòng nỏ, giữa sóng, bụng rồng).
- Ảnh soát (VI trên, EN dưới): `anh-soat/phuc-lanh-nguoi-moi.jpg`, `phuc-lanh-1.jpg` … `phuc-lanh-5.jpg` (đủ 14 icon).

## Việc 3: kiếm 2

Làm giống phiên kiếm 1 / 3:
- Cắt 5 khung (ĐẠT): `docs/anh-goc/zed/moi16/09-kiem-2-5k-v2-gif/`.
- Cỡ ×1,2, đầu bằng hàng đứng mới, căn bàn chân trước.
- Neo nắm tay và góc kiếm từng khung, dùng cho cả 4 cấp kiếm.
- Chạm ở khung 3, mốc cũ giữ nguyên.

Góc kiếm (đo vạch đỏ người đặc, khớp K2 của `ve-tu-the.py`):

| Khung | 1 | 2 | 3 ★ | 4 | 5 |
|---|---|---|---|---|---|
| Góc | 135° | 25° | −55° (chém hất) | −115° | −45° |

- Chạy + chém: điểm eo đo trên khung mới. Ảnh: `ghep-eo-kiem-2.png`.
- Số đo: chân trước vào / ra 0,5 (cũ 1,5). Chân sau vào / ra 6,5 (cũ 2,5), vì thế đứng của ảnh mới rộng hơn.
- Ảnh soát: `kiem-2-x1.gif`, `kiem-2-x3.gif` (trái TRƯỚC, phải SAU), `luoi-kiem-2.png` (4 cấp).

Cần xem (không cần gen lại):
- Khung 1 và khung 2: mũi kiếm cấp 3–4 chạm hoặc lố dưới vạch đất, giống kiếm 1 khung 4. Nếu vướng mắt, chỉ cần giảm góc trong `gan-vk/neo-kiem-16-10.py`.
- Chạy + chém khung 1–2: thân trên cúi thấp trên chân chạy, trông như lao tới (hiện khoảng 0,13 giây).

## Kiểm

- `node --check` mọi `game/js/*.js`: đạt.
- `python3 game/build.py`: đạt, bản một tệp 29,63 / 30 MB (sau khi gộp phiên "Vẽ tay 8 gộp (trận)" chạy song song).
- `python3 game/build.py --hai-tep`: đạt. Người chơi tải 16,80 / 20 MB. Ảnh của phiên này thêm khoảng 0,27 MB.
- Bản một tệp còn cách trần 30 MB chỉ ~0,37 MB: phiên sau thêm ảnh nên để ý.
- `tests/smoke.py`: `errors: []`. `cloud_save_regression`: đạt.
- Nạp trang với `?cloud=0`, `?vecode=1`, `?kiemmoi=0`, `?hangcu=1`: 0 lỗi JS. `?vecode=1` không dùng ảnh mới.
- Ảnh soát trước / sau trong `anh-soat/` (dựng bằng `cong-cu/chup-soat.py`): chào, dải mặt, bản đồ, Cụ Đồ kỹ năng / chưởng, phúc lành, rừng, lâu đài.

## Quay lui

- `?vecode=1`: giao diện vẽ code như cũ.
- `?kiemmoi=0`: về kiếm 1 / 2 / 3 cũ.
- Hoặc `git revert` commit tương ứng.
