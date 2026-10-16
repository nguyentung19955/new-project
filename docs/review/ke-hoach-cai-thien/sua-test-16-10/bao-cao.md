# Sửa 5 bài kiểm tra báo SAI (16/10)

Kết luận: **cả 5 bài đều do bài kiểm tra cũ, không phải game lỗi.** Không sửa code game. Không đổi cân bằng.

## Commit làm hỏng

Đã chạy lại từng bài ở từng commit từ 15/10:

| Commit | Kết quả |
|---|---|
| trước `6036f42c` | cả 5 bài ĐẠT |
| `6036f42c` Tư vấn 1 "mở dần" (?modan=0) | 4 bài SAI: viec_ngay, su_kien, so_yeu_quai, thanh_tuu |
| `8cc93669` Luyện vũ khí phiên 1 (?luyen=0) | thêm chỗ SAI trong so_yeu_quai, viec_ngay, su_kien (quặng / đá thành NLR, hoàn vàng) |
| `2a4b133a` Vẽ tay 9 | trum_song SAI (lỗi ở trang giả Node, không phải game) |

Tư vấn 2 (trùm công bằng) và Tư vấn 4 (phúc lành) **không** làm hỏng bài nào.

## Từng bài

| Bài | Nguyên nhân | Sửa gì |
|---|---|---|
| `viec_ngay` | Mở dần: người mới chỉ thấy Việc hôm nay sau Hang biển 1 (trước: Rừng già 2). Luyện: quặng / đá nhận về thành NLR. | **Sửa test.** Mục 1 kiểm cả hai: bản lưu cũ mở sau Rừng già 2, người mới mở sau Hang biển 1. Mục 1–9 chạy luật cũ `?luyen=0` (như đã ghim `?thuongb2=goc`). Thêm mục 10: Luyện bật thì 9 quặng → 9 NLR, 2 đá → 4 NLR. |
| `su_kien` | Mở dần: Ải ngày cần qua Hang biển 1; thẻ Sổ / Việc ẩn với người mới. Luyện: bản lưu mây cũ được chuyển, **hoàn vàng** phần thừa → vàng khác bản mây. | **Sửa test.** Ải ngày: thêm sao Hang biển 1. Khung thẻ: dùng bản lưu kiểu người chơi cũ. Mây: vàng = bản mây + phần hoàn (`luyenBao.vang`). Lưu mây / đăng nhập không đổi. |
| `so_yeu_quai` | Mở dần: thẻ Sổ ẩn với người mới, nên không có chấm đỏ. Luyện: 1 đá thưởng → 2 NLR. | **Sửa test.** Kiểm người mới chưa thấy Sổ, qua Hang biển 1 thì thấy. Phần thưởng đếm theo đá quy đổi (NLR ÷ 2). |
| `thanh_tuu` | Mở dần: thẻ Thành tựu ẩn với người mới tới Hang biển 1 → lỗi `nhan` khi bấm. | **Sửa test.** Kiểm cả người mới (Hang biển 1) và bản lưu cũ (Rừng già 1). |
| `trum_song` | Vẽ tay 9 đọc `c.__loc` trên khung vẽ. Khung vẽ giả của bài test trả về hàm rỗng thay vì "không có" → lỗi `goc.endsWith`. Trong trình duyệt thật không lỗi. | **Sửa trang giả** `tests/node_trang.js`: khoá bắt đầu bằng `__` trả "không có" như trình duyệt. |

Ghi chú: ở các commit Tư vấn 1, 2, 4, `trum_song` có lần SAI ở "cả hai tinh anh mới đều ra trận" (con tinh anh ra ngẫu nhiên). Bản hiện tại chạy 4 lần đều ĐẠT.

## Kết quả kiểm

- 18 bài `game/tests/*.test.js`: 17 ĐẠT, gồm `cloud_save_regression` ĐẠT. `may_luat` báo SKIP vì máy này thiếu bộ giả lập Firebase, giống trước giờ.
- `smoke.py`: `errors: []`.
- `node --check` mọi tệp `game/js/*.js`: không lỗi.
- `python3 game/build.py` và `--hai-tep`: chạy được. Không commit `game/dist` vì phiên này không đổi code game.
- Không đụng `cloud.js`, `cloud_ui.js`, `firebase-config.js`. Đăng nhập Google, lưu mây, `?cloud=0` giữ nguyên. Không chơi thử game.
