# Dung lượng 16/10: bản một tệp vượt trần 30 MB

## Tóm tắt

| Số đo | Trước | Sau | Mục tiêu |
|---|---|---|---|
| Bản một tệp (`dist/linh-khi.html`) | **30,27 MB** | **28,35 MB** | ≤ 28,5 MB ✔ |
| Người chơi tải (bản web, `--hai-tep`) | 17,14 MB | **16,66 MB** | ≤ 20 MB ✔ |
| Tải trước khi vào vùng đầu (lõi + trang + bìa) | 6,02 MB | **5,53 MB** | không tăng ✔ (giảm 0,49) |
| Ảnh lõi | 4,64 MB | 4,15 MB | |
| Tổng ảnh PNG (trừ tấm cũ `-muotcu`) | 18,56 MB | 17,13 MB | |

Không thu nhỏ hình, không đổi cỡ ảnh, không đổi thông số hình (khung, neo, động tác), không xoá ảnh nào. Không đổi luật, số liệu, mã game.

## 1. Sprite lớn nhất và phần tăng từ 15/10

Thư mục `game/art/custom` (tệp .sprite.json): 25,91 MB cuối ngày 15/10 → 27,49 MB trước phiên này (**+1,58 MB**).

Lớn nhất (đều là trùm, ảnh đã ≤ 256 màu từ trước): hoTinh-p3 1,41 MB · hoTinh 1,33 · hoTinh-p2 1,24 · mocTinh 1,18 · mocTinh-p3 1,05 · mocTinh-p2 1,03 · nguTinh-p3 0,81 · nguTinh-p2 0,81 · nguTinh 0,75 · cuaDa 0,59.

Tăng nhiều nhất hôm nay:

| Ảnh | Tăng |
|---|---|
| cocTia, baBa, diaTrau, raiCa (quái Sông sâu, mới) | +140, +114, +96, +78 KB |
| zed-moi (hàng Cu Tí mới) | +140 KB |
| hu-song-dong (dòng chảy, vẽ tay 8) | +102 KB |
| gd-nen-song-* (sàn, tường, nước ngoài, sân Thuồng Luồng) | ~ +270 KB |
| gd-phuc-lanh-* (14 icon phúc lành) | ~ +240 KB |
| còn lại (cửa Sông sâu, lục bình, đèn dầu, nước dâng…) | ~ +400 KB |

Nhiều ảnh mới lưu dạng RGBA dù chỉ có 33–65 màu, hoặc hơn 256 màu → nặng gấp 2–3 lần cần thiết.

## 2. Đã nén gì

Công cụ: [cong-cu/nen.py](cong-cu/nen.py) (bảng chi tiết từng tấm: [cong-cu/ra/nen.json](cong-cu/ra/nen.json)). Bỏ qua tấm cũ `-muotcu` (không có trong bản một tệp, người chơi không tải).

1. **Không mất gì — 518 tấm, 16,89 → 16,42 MB.** Ảnh ≤ 256 màu chuyển sang PNG bảng màu; điểm trong suốt hẳn đưa về một màu; chọn cách mã hoá nhỏ nhất. Điểm ảnh nhìn thấy y hệt (đã so từng điểm).
2. **Nén bảng màu xuống 256 màu — 138 tấm (90 giao diện `gd-*`, 48 hiệu ứng `hu-*`), 1,63 → 0,66 MB.** Cách y như đợt nén 14/10: điểm đục vẫn đục, điểm trong suốt vẫn trong suốt, chỉ gộp màu gần nhau. Chỉ nhận khi sai số trung bình ≤ 4/255 (cao nhất thực tế 3,1), độ trong của điểm mờ lệch ≤ 12/255. Tấm nào không đạt thì giữ nguyên.
3. **Bỏ khung trùng: KHÔNG làm.** Thử chép đè các cột mà hàng đánh bỏ qua, nhưng ảnh so cho thấy đó là dáng khác hẳn (lấy đà, vung tay), không phải khung trùng → giữ nguyên. Ảnh: [anh/khong-dung-khung-trung.png](anh/khong-dung-khung-trung.png).
4. **Cắt viền trong suốt, gộp ảnh trùng, bỏ ảnh không dùng: không có gì đáng làm.** Các tấm quái/trùm không thừa hàng, cột hay mép (đã đo từng ô); không có hai tấm trùng nhau; tên ảnh đều được ghép động trong mã (`-p3`, `-fire`…) nên không chứng minh được tấm nào bỏ được → không xoá.

## 3. So ảnh trước / sau

`anh/so-256-mau-01.png` … `-18.png`: cả 138 tấm nén 256 màu, TRƯỚC | SAU cạnh nhau, phóng ×3, nền tối của game, mỗi tấm lấy vùng khác nhiều nhất. Trang 01 là các tấm sai số lớn nhất (trứng vỡ, icon phúc lành cá chép, rắn…): nhìn không thấy khác. Dựng lại: `python3 cong-cu/so-anh.py <thư mục bản trước>`.

## 4. Kiểm

| Bài | Kết quả |
|---|---|
| `node --check` mọi `game/js/*.js` | Đạt |
| `python3 game/build.py`, `--hai-tep` | Đạt, số đo ở bảng đầu |
| `node game/tests/*.test.js` (18 bài) | 18/18 đạt |
| `python3 tools/kiem-alpha.py --lech-ban-trong 12 --dist game/dist/anh` | Đạt (0 lỗi). Không ảnh nào đổi trong suốt ↔ đục |
| Ngoài chuỗi ảnh, mọi tệp .sprite.json giữ nguyên từng ký tự | Đạt (đã so) |

Không đụng đăng nhập Google, lưu mây, `?cloud=0`. Không chơi thử (chỉ ảnh so dựng bằng Python).

## 5. Lưu ý cho ảnh sắp tới

Còn trống ~0,15 MB tới 28,5 MB và 1,65 MB tới trần 30 MB. Ảnh mới nên lưu sẵn dạng bảng màu ≤ 256 màu (chạy `cong-cu/nen.py --ghi` sau khi thêm ảnh là đủ). Phần lớn dung lượng còn lại là 10 tấm trùm (~9 MB), đã tối ưu hết mức mà không đổi hình.
