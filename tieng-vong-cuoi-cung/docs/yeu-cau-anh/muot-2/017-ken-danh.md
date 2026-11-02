# 017 – Kèn Câm – đánh: 1 khung nâng kèn giữa F5–F6 (P0)
- **Trạng thái:** CHỜ
- **Clip:** `quai.json → loai.ken.hinh.danh` – thư mục art gốc `art/quai-moi/ken/danh/` (9 khung `fNN.png`, ô 112×112, quay TRÁI, neo chân [50, 92])
- **Việc cần vẽ:** Vẽ **1 khung mới** `moi-01`, chèn SAU F5.
- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** "Chuẩn bị quá lâu, lúc bắn chỉ 70ms; đường nâng kèn F4→F6 chưa liền. Khoá chân; nếu F4→F5/F5→F6 giật thì thêm 1 khung nâng kèn." (đo IoU F4→F5 = 0,93, F5→F6 = 0,59 → chèn giữa F5–F6)
- **Ảnh tham chiếu:** `017-ken-danh-thamchieu.png` (1056×360) = ghép ngang F5 | [Ô TRỐNG] | F6, cắt cửa sổ (x0=0, y0=0, rộng 112, cao 112) của ô 112×112 rồi phóng ×3 nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.
- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**
  ```
  This strip shows consecutive frames of a 2D side-view pixel-art animation of the Mute Horn (thin root-wood figure holding a long brass horn with a hanging banner). The creature faces LEFT. Draw ONLY the missing in-between frame for the middle empty dashed cell: the horn halfway along its raise between the left and right frames, banner swinging along, body and feet unchanged. Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.
  ```
- **Lưu ảnh ra:** `art/muot-2/ken-danh/moi-01.png` – mỗi tệp PNG RGBA đúng **112×112** (cỡ ô gốc), nền trong suốt, chân ở **[50, 92]** như khung gốc, quay TRÁI. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷3, nearest) theo cửa sổ rộng 112 × cao 112, dán vào ô 112×112 trong suốt tại (0,0). Lưu kèm ảnh nguồn `art/muot-2/ken-danh/nguon-chatgpt.png`.
- **Thứ tự mới của clip sau khi lắp:** F0 … F5 **moi-01** F6 F7 F8 (10 khung)
- **ms mới cho cả clip:** 67, 83, 100, 83, 67, 67, 50, 50, 83, 100 (750 ms; bộ ChatGPT + 50 ms khung nâng kèn)
- **Sự kiện dời chỉ số (phiên lắp tự làm):** so_hinh 9→10; chieu.khung_ban 6→7.
- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.
- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.
