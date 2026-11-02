# 025 – Phu Đèn Lạc – chết: VẼ LẠI F7 (chống tay) (P1)
- **Trạng thái:** CHỜ
- **Clip:** `quai.json → loai.phu.hinh.chet` – thư mục art gốc `art/quai-moi/phu/chet/` (9 khung `fNN.png`, ô 88×88, quay TRÁI, neo chân [44, 74])
- **Việc cần vẽ:** Vẽ **1 khung** `thay-07`, THAY F7.
- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** "Đoạn ngã F8–F9 nằm xuống đột ngột, trượt chân 8,8%. Thêm/sửa dáng chống tay ở F7; giữ khung cuối."
- **Ảnh tham chiếu:** `025-phu-chet-thamchieu.png` (840×288) = ghép ngang F6 | [Ô TRỐNG] | F8, cắt cửa sổ (x0=0, y0=0, rộng 88, cao 88) của ô 88×88 rồi phóng ×3 nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.
- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**
  ```
  This strip shows consecutive frames of a 2D side-view pixel-art animation of the Lost Lampbearer (hunched lantern-carrying wanderer). The creature faces LEFT. Draw ONLY the frame for the middle empty dashed cell: falling and catching himself with one hand on the ground, halfway between the left and right frames. Feet at "+". Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.
  ```
- **Lưu ảnh ra:** `art/muot-2/phu-chet/thay-07.png` – mỗi tệp PNG RGBA đúng **88×88** (cỡ ô gốc), nền trong suốt, chân ở **[44, 74]** như khung gốc, quay TRÁI. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷3, nearest) theo cửa sổ rộng 88 × cao 88, dán vào ô 88×88 trong suốt tại (0,0). Lưu kèm ảnh nguồn `art/muot-2/phu-chet/nguon-chatgpt.png`.
- **Thứ tự mới của clip sau khi lắp:** F0 … F6 **thay-07** F8 (9 khung)
- **ms mới cho cả clip:** 83, 83, 83, 100, 100, 117, 117, 117, 100
- **Sự kiện dời chỉ số (phiên lắp tự làm):** số khung giữ.
- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.
- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.
