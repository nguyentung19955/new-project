# 024 – Kèn Câm – chết: 1 khung khuỵu gối giữa F5–F6 (P1)
- **Trạng thái:** VẼ LẠI (02/11, phiên MƯỢT-2 kiểm: moi-01 thân + đầu THẤP HƠN cả F5 lẫn F6 (đầu ~5–10 px dưới F5, F6) → khi chạy thấy lún xuống rồi nảy lên; hình hơi lấm tấm, kèn nhạt màu. Cần: dáng nằm giữa F5 và F6 – đầu cao ngang khoảng giữa F5 và F6, kèn trượt dần ra trước chạm đất, cờ rủ; viền tối 1 px, mảng màu phẳng sắc như F5/F6. Prompt thêm: 'head height exactly halfway between the left and right frames, never lower than both; same 1-pixel dark outline, flat crisp shading, no noise'.)
- **Clip:** `quai.json → loai.ken.hinh.chet` – thư mục art gốc `art/quai-moi/ken/chet/` (9 khung `fNN.png`, ô 112×112, quay TRÁI, neo chân [50, 92])
- **Việc cần vẽ:** Vẽ **1 khung mới** `moi-01`, chèn SAU F5.
- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** "Đầu clip giữ lâu, ngã F5→F6 quá nhanh; trượt chân 9%; giữ khung cuối; cần thì thêm khung khuỵu gối giữa F5–F6."
- **Ảnh tham chiếu:** `024-ken-chet-thamchieu.png` (1056×360) = ghép ngang F5 | [Ô TRỐNG] | F6, cắt cửa sổ (x0=0, y0=0, rộng 112, cao 112) của ô 112×112 rồi phóng ×3 nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.
- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**
  ```
  This strip shows consecutive frames of a 2D side-view pixel-art animation of the Mute Horn (thin root-wood figure with a long brass horn and hanging banner). The creature faces LEFT. Draw ONLY the missing in-between frame for the middle empty dashed cell: knees buckling, body halfway falling, horn dropping - between the left and right frames. Feet stay at "+". Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.
  ```
- **Lưu ảnh ra:** `art/muot-2/ken-chet/moi-01.png` – mỗi tệp PNG RGBA đúng **112×112** (cỡ ô gốc), nền trong suốt, chân ở **[50, 92]** như khung gốc, quay TRÁI. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷3, nearest) theo cửa sổ rộng 112 × cao 112, dán vào ô 112×112 trong suốt tại (0,0). Lưu kèm ảnh nguồn `art/muot-2/ken-chet/nguon-chatgpt.png`.
- **Thứ tự mới của clip sau khi lắp:** F0 … F5 **moi-01** F6 F7 F8 (10 khung)
- **ms mới cho cả clip:** 67, 67, 67, 83, 83, 83, 67, 100, 117, 150
- **Sự kiện dời chỉ số (phiên lắp tự làm):** ken.hinh.chet: so_hinh 9→10.
- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.
- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.
