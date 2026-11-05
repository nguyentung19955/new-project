# Tư vấn B — trận đấu dễ đọc (TU-VAN-TOAN-BO.txt §B7–B12, §C, fix 05/08/11/12)

Mã: `thap/js/tvb.js` + `thap/css/tvb.css` (nạp sau cùng, chỉ bọc HB/HT/REN/KG/GF — không sửa logic kéo/ghép của ghepfx.js).
Cắt ảnh: `python3 tools/thap-cat-tvb.py [Exx…]`.  Ảnh: `truoc/` (trước) · `sau/` (sau) — 360×780, 390×844, 430×932 DPR3 + ONLINE giả (mock server).

| Mục | Đã làm |
|---|---|
| B7 bàn đầy | nút Triệu hồi ảnh tắt + "BOARD FULL" 2 dòng; chạm → "BOARD FULL · MERGE TO FREE A SLOT" |
| §C / fix 08 ray trên | rộng 366 px@390, chữ ≥ 12 px@390, BOSS IN N hổ phách → đỏ (wave sau là trùm / trùm ở sân) |
| B8 dải xem nhanh | 64 px@390 ngay trên khay; chân dung 44, tên 14, 1 dòng 12, DMG/RATE 2 cột, nút mở 44; cấp sao = tấm E23 |
| B9 tấm mở rộng | 4 ô số 2×2, kỹ năng ≤ 3 dòng, mốc sao, nút đóng p7_ic_dong 44; SOLO tạm dừng (chạm ngoài = chạy tiếp), CO-OP/PVP/ONLINE chạy tiếp |
| B12 / fix 11 trùm | băng gọn 89 px@390: chân dung 56 · tên 18 · mối đe doạ 13 · "SKILL IN Ns"; SOLO dưới làn dưới, 2 bàn đáy băng = mép trên bàn mình (không che hàng ô nào); 2,4 s rồi thu lên ray |
| B10/B11 | nhãn ALLY / RIVAL / YOU 12 px@390 ở góc bàn, "VS" giữa khe PVP, tim 2 bên tách rõ |
| §C / fix 05/12 kéo ghép | E18 khung vuông cyan nhịp ở ô hợp lệ (đúng luật hopLeGhep), E19 gạch chéo mờ ô không ghép được, E17 bóng nhấc, E20 chớp ghép 8 khung, E21 chớp bật về |

fps đo 2 s trong trận: 57–60. 0 lỗi trang.
Chưa nối (chưa có ảnh khi hết 2 h chờ): E24 E25 E26 E27 E28 E29 E30 E31. E22 (đế ụ) có nhưng không nối — đổi đế cả 85 ụ đụng việc căn đầu ụ của phiên khác.
