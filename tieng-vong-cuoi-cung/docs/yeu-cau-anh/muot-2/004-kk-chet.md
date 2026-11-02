# 004 – Kiếm Khách – chết: sửa F3 + 1 khung khuỵu giữa F3–F4 (P0)
- **Trạng thái:** CHỜ
- **Clip:** `nhan-vat.json → clip.chet` – thư mục art gốc `art/kiem-khach/chet/` (7 khung `fNN.png`, ô 256×256, quay PHẢI, neo chân [128, 172])
- **Việc cần vẽ:** Vẽ **2 ảnh**: `thay-03` THAY khung F3 (F3 hiện gần trùng F2), và `moi-01` chèn SAU F3 (giữa F3 mới và F4).
- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** "F1→F2 đổi dáng lớn mà giữ 130ms; F2≈F3 khựng giữa lúc ngã; F3→F4 bị kéo xuống; F5≈F6 kéo dài. Thành 8 khung: thêm 1 khung khuỵu gối/hạ hông giữa F3–F4; sửa F3 cho khác F2; căn theo điểm chạm đất."
  - thay-03 (ô trống 1): vẫn quỳ như F2 nhưng hông hạ thấp hơn, đầu gục thêm, thân bắt đầu đổ tới – khác F2 rõ ràng.
  - moi-01 (ô trống 2): khuỵu gối, hạ hông sát đất, thân đổ ra trước, tay chống/kiếm trượt dần – nửa đường giữa thay-03 và F4 (nằm sấp).
  - Gối/chân chạm đất đúng vạch đất (dấu +), không bị kéo xuống.
- **Ảnh tham chiếu:** `004-kk-chet-thamchieu.png` (1416×300) = ghép ngang F2 | [Ô TRỐNG] | [Ô TRỐNG] | F4, cắt cửa sổ (x0=63, y0=90, rộng 113, cao 92) của ô 256×256 rồi phóng ×3 nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.
- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**
  ```
  This strip shows consecutive frames of a 2D side-view pixel-art death animation of Kiếm Khách (The Masked Wanderer): white mask with icy-blue eye slit, long silver-cream ponytail, dark layered clothing with cyan rune marks, two icy-blue swords. Draw ONLY the 2 missing frames for the 2 empty dashed cells, so the fall from kneeling (left) to lying face-down (right) is smooth: cell 2 = still kneeling but hips lower and head drooping more, body starting to tip forward (clearly different from the left frame); cell 3 = knees buckling, hips almost on the ground, torso falling forward halfway to the lying pose, swords sliding. Knees/feet on the same ground line marked by "+". Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.
  ```
- **Lưu ảnh ra:** `art/muot-2/kk-chet/thay-03.png`, `art/muot-2/kk-chet/moi-01.png` – mỗi tệp PNG RGBA đúng **256×256** (cỡ ô gốc), nền trong suốt, chân ở **[128, 172]** như khung gốc, quay PHẢI. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷3, nearest) theo cửa sổ rộng 113 × cao 92, dán vào ô 256×256 trong suốt tại (63,90). Lưu kèm ảnh nguồn `art/muot-2/kk-chet/nguon-chatgpt.png`.
- **Thứ tự mới của clip sau khi lắp:** F0 F1 F2 **thay-03** **moi-01** F4 F5 F6 (8 khung; F3 cũ chuyển sang tệp `art/muot-2/kk-chet/cu-f03.png` để lưu)
- **ms mới cho cả clip:** 50, 67, 67, 67, 83, 100, 100, 200 (734 ms, đúng bộ 8 khung ChatGPT; giữ khung cuối, không lặp)
- **Sự kiện dời chỉ số (phiên lắp tự làm):** so_hinh 7→8.
- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.
- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.
