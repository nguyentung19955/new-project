# 011 – Chuông Kén Nứt – di: 1 khung nối F8→F0 (P0)
- **Trạng thái:** CHỜ
- **Clip:** `quai.json → loai.chuong.hinh.di` – thư mục art gốc `art/quai-moi/chuong/di/` (9 khung `fNN.png`, ô 100×100, quay TRÁI, neo chân [46, 84])
- **Việc cần vẽ:** Vẽ **1 khung mới** `moi-01`, chèn SAU F8 (khung cuối, nối vòng về F0).
- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** "Vòng lặp giật ở F8→F0 (thân + tua khác hẳn). Vẽ lại F8 gần F0 hơn hoặc thêm 1 khung nối."
  - Thân và tua ở giữa F8 và F0 để vòng lặp liền.
- **Ảnh tham chiếu:** `011-chuong-di-thamchieu.png` (948×324) = ghép ngang F8 | [Ô TRỐNG] | F0, cắt cửa sổ (x0=0, y0=0, rộng 100, cao 100) của ô 100×100 rồi phóng ×3 nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.
- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**
  ```
  This strip shows consecutive frames of a 2D side-view pixel-art animation of the Cracked Cocoon Bell (elite floating cracked bell-cocoon with tendrils, ash-violet and brick-red). The creature faces LEFT. This is a looping move cycle: left = last frame, right = first frame of the loop. Draw ONLY the missing bridge frame for the middle empty dashed cell, with body and tendrils halfway between the two, so the loop is seamless. Same floating height. Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.
  ```
- **Lưu ảnh ra:** `art/muot-2/chuong-di/moi-01.png` – mỗi tệp PNG RGBA đúng **100×100** (cỡ ô gốc), nền trong suốt, chân ở **[46, 84]** như khung gốc, quay TRÁI. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷3, nearest) theo cửa sổ rộng 100 × cao 100, dán vào ô 100×100 trong suốt tại (0,0). Lưu kèm ảnh nguồn `art/muot-2/chuong-di/nguon-chatgpt.png`.
- **Thứ tự mới của clip sau khi lắp:** F0 … F8 **moi-01** (10 khung, lặp)
- **ms mới cho cả clip:** 10 × 110 ms (bộ ChatGPT 9×110)
- **Sự kiện dời chỉ số (phiên lắp tự làm):** chuong.hinh.di: so_hinh 9→10, ms 110.
- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.
- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.
