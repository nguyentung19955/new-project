# 016 – Hồn Vải – chết: 1 khung giữa F6–F7 (P0)
- **Trạng thái:** ĐÃ LẮP (02/11, phiên MƯỢT-2: 9→10 khung, ms mới; dáng đúng, vải hơi lấm tấm – nếu rảnh có thể vẽ lại cho sắc hơn) – trước đó: XONG (phiên chính vẽ bằng ChatGPT)
- **Clip:** `quai.json → loai.vai.hinh.chet` – thư mục art gốc `art/quai-moi/vai/chet/` (9 khung `fNN.png`, ô 96×96, quay TRÁI, neo chân [48, 82])
- **Việc cần vẽ:** Vẽ **1 khung mới** `moi-01`, chèn SAU F6.
- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** "Rơi đột ngột F6→F7 (IoU 0,24, cao giảm 73%) – teleport 1 khung. Thêm 1 khung giữa F6→F7 (thân lưng chừng, mặt nạ nghiêng, vải gập)."
- **Ảnh tham chiếu:** `016-vai-chet-thamchieu.png` (912×312) = ghép ngang F6 | [Ô TRỐNG] | F7, cắt cửa sổ (x0=0, y0=0, rộng 96, cao 96) của ô 96×96 rồi phóng ×3 nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.
- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**
  ```
  This strip shows consecutive frames of a 2D side-view pixel-art animation of the Cloth Wraith (floating ragged cloth ghost with a mask). The creature faces LEFT. Draw ONLY the missing in-between frame for the middle empty dashed cell: the wraith halfway down, mask tilted, cloth folding and crumpling - between the floating pose on the left and the collapsed heap on the right. Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.
  ```
- **Lưu ảnh ra:** `art/muot-2/vai-chet/moi-01.png` – mỗi tệp PNG RGBA đúng **96×96** (cỡ ô gốc), nền trong suốt, chân ở **[48, 82]** như khung gốc, quay TRÁI. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷3, nearest) theo cửa sổ rộng 96 × cao 96, dán vào ô 96×96 trong suốt tại (0,0). Lưu kèm ảnh nguồn `art/muot-2/vai-chet/nguon-chatgpt.png`.
- **Thứ tự mới của clip sau khi lắp:** F0 … F6 **moi-01** F7 F8 (10 khung)
- **ms mới cho cả clip:** 90, 90, 85, 85, 80, 80, 80, 80, 110, 160 (940 ms; bộ ChatGPT + 80 ms khung giữa)
- **Sự kiện dời chỉ số (phiên lắp tự làm):** vai.hinh.chet: so_hinh 9→10.
- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.
- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.
