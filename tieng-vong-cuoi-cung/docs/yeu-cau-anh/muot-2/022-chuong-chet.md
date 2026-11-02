# 022 – Chuông Kén Nứt – chết: 1 khung chạm đất giữa F6–F7 (P1)
- **Trạng thái:** CHỜ
- **Clip:** `quai.json → loai.chuong.hinh.chet` – thư mục art gốc `art/quai-moi/chuong/chet/` (9 khung `fNN.png`, ô 100×100, quay TRÁI, neo chân [46, 84])
- **Việc cần vẽ:** Vẽ **1 khung mới** `moi-01`, chèn SAU F6.
- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** "Diễn biến tốt nhưng F6→F7 rơi xuống đất như dịch chuyển. Thêm 1 khung chạm đất (vỏ ép thấp, tua xoè)."
- **Ảnh tham chiếu:** `022-chuong-chet-thamchieu.png` (948×324) = ghép ngang F6 | [Ô TRỐNG] | F7, cắt cửa sổ (x0=0, y0=0, rộng 100, cao 100) của ô 100×100 rồi phóng ×3 nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.
- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**
  ```
  This strip shows consecutive frames of a 2D side-view pixel-art animation of the Cracked Cocoon Bell (elite floating cracked bell-cocoon with tendrils). The creature faces LEFT. Draw ONLY the missing in-between frame for the middle empty dashed cell: the moment of hitting the ground - shell squashed low, tendrils splayed out. Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.
  ```
- **Lưu ảnh ra:** `art/muot-2/chuong-chet/moi-01.png` – mỗi tệp PNG RGBA đúng **100×100** (cỡ ô gốc), nền trong suốt, chân ở **[46, 84]** như khung gốc, quay TRÁI. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷3, nearest) theo cửa sổ rộng 100 × cao 100, dán vào ô 100×100 trong suốt tại (0,0). Lưu kèm ảnh nguồn `art/muot-2/chuong-chet/nguon-chatgpt.png`.
- **Thứ tự mới của clip sau khi lắp:** F0 … F6 **moi-01** F7 F8 (10 khung)
- **ms mới cho cả clip:** 100, 100, 90, 90, 85, 85, 75, 60, 110, 180
- **Sự kiện dời chỉ số (phiên lắp tự làm):** chuong.hinh.chet: so_hinh 9→10.
- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.
- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.
