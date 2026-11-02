# 014 – Vọng Tàn – di: VẼ LẠI F0 (khung chuyển trọng lượng sai) (P0)
- **Trạng thái:** XONG (02/11, vẽ lại lần 2 – cùng cỡ thân/chuông với F1/F8, lấy mẫu giữa điểm ảnh + đúng bảng màu)
- **Clip:** `quai.json → loai.tan.hinh.di` – thư mục art gốc `art/quai-moi/tan/di/` (9 khung `fNN.png`, ô 112×112, quay TRÁI, neo chân [56, 91])
- **Việc cần vẽ:** Vẽ **1 khung** `thay-00`, THAY F0 (F0 hiện co cụm khác hẳn F1–F8 nên vòng lặp F8→F0→F1 nhảy).
- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** "Lỗi nặng nhất nhóm: trôi chân 22,4%, đáy nhấp nhô 18,8% – như vừa bước vừa nhảy. Căn lại từng khung theo chân/rễ chạm đất; 2 pha chống chân rõ, chuông đung đưa nặng; sửa/vẽ lại khung chuyển trọng lượng sai."
  - Dáng bước nằm giữa F8 và F1 (cùng chiều cao thân, chuông lệch nhẹ theo quán tính), chân/rễ chạm đất ở vạch +.
- **Ảnh tham chiếu:** `014-tan-di-thamchieu.png` (1056×360) = ghép ngang F8 | [Ô TRỐNG] | F1, cắt cửa sổ (x0=0, y0=0, rộng 112, cao 112) của ô 112×112 rồi phóng ×3 nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.
- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**
  ```
  This strip shows consecutive frames of a 2D side-view pixel-art animation of the Ruin Echo (elite: bird-skull creature carrying a huge bronze bell on its back, magenta-purple root tendrils). The creature faces LEFT. This is a looping walk: left = last frame, right = second frame. Draw ONLY the missing frame for the middle empty dashed cell: the walking pose halfway between them, same body height, the heavy bell lagging slightly behind the body, feet/roots planted on the ground line "+". Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.
  ```
- **Lưu ảnh ra:** `art/muot-2/tan-di/thay-00.png` – mỗi tệp PNG RGBA đúng **112×112** (cỡ ô gốc), nền trong suốt, chân ở **[56, 91]** như khung gốc, quay TRÁI. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷3, nearest) theo cửa sổ rộng 112 × cao 112, dán vào ô 112×112 trong suốt tại (0,0). Lưu kèm ảnh nguồn `art/muot-2/tan-di/nguon-chatgpt.png`.
- **Thứ tự mới của clip sau khi lắp:** **thay-00** F1 … F8 (9 khung, lặp)
- **ms mới cho cả clip:** 9 × 117 ms (bộ ChatGPT)
- **Sự kiện dời chỉ số (phiên lắp tự làm):** tan.hinh.di: ms 117.
- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.
- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.
