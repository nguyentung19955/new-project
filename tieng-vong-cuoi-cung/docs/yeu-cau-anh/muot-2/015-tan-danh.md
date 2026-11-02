# 015 – Vọng Tàn – đánh: 1 khung chuông giữa đường F4–F5 (P0)
- **Trạng thái:** CHỜ
- **Clip:** `quai.json → loai.tan.hinh.danh` – thư mục art gốc `art/quai-moi/tan/danh/` (9 khung `fNN.png`, ô 112×112, quay TRÁI, neo chân [56, 91])
- **Việc cần vẽ:** Vẽ **1 khung mới** `moi-01`, chèn SAU F4.
- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** "Đọc được ý nhưng thiếu lực, không có khung va chạm sắc. Chọn đúng khung chuông chạm đất làm impact; khoá chân; thêm khung chuông giữa đường nếu F4→F5 gắt." (đo IoU F4→F5 = 0,59, thấp nhất clip)
- **Ảnh tham chiếu:** `015-tan-danh-thamchieu.png` (1056×360) = ghép ngang F4 | [Ô TRỐNG] | F5, cắt cửa sổ (x0=0, y0=0, rộng 112, cao 112) của ô 112×112 rồi phóng ×3 nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.
- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**
  ```
  This strip shows consecutive frames of a 2D side-view pixel-art animation of the Ruin Echo (elite: bird-skull creature carrying a huge bronze bell on its back, magenta-purple root tendrils). The creature faces LEFT. Draw ONLY the missing in-between frame for the middle empty dashed cell: the huge bell halfway down in its slam, body bending forward, tendrils trailing behind - between the raised pose on the left and the bell-on-ground impact on the right. Feet stay planted. Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.
  ```
- **Lưu ảnh ra:** `art/muot-2/tan-danh/moi-01.png` – mỗi tệp PNG RGBA đúng **112×112** (cỡ ô gốc), nền trong suốt, chân ở **[56, 91]** như khung gốc, quay TRÁI. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷3, nearest) theo cửa sổ rộng 112 × cao 112, dán vào ô 112×112 trong suốt tại (0,0). Lưu kèm ảnh nguồn `art/muot-2/tan-danh/nguon-chatgpt.png`.
- **Thứ tự mới của clip sau khi lắp:** F0 … F4 **moi-01** F5 … F8 (10 khung)
- **ms mới cho cả clip:** 133, 117, 100, 83, 50, 33, 67, 100, 117, 133 (933 ms; bộ ChatGPT + 33 ms khung giữa đường)
- **Sự kiện dời chỉ số (phiên lắp tự làm):** so_hinh 9→10; khung_trung [5,6]→[6,7]; chieu.chan_dong 5→6 (sóng ra đúng khung chuông chạm đất).
- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.
- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.
