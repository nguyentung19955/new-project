# 006 – Kiếm Khách – tiếp đất: 1 khung đứng dậy giữa F1–F2 (P0)
- **Trạng thái:** CHỜ
- **Clip:** `nhan-vat.json → clip.tiepdat` – thư mục art gốc `art/kiem-khach/tiepdat/` (3 khung `fNN.png`, ô 256×256, quay PHẢI, neo chân [128, 172])
- **Việc cần vẽ:** Vẽ **1 khung mới** `moi-01`, chèn SAU F1 (giữa F1 ngồi thụp và F2 đứng).
- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** "Snap khi đứng dậy (y 3,9%, cao 19%), 2 khung đầu trùng. Căn điểm chạm chân; thêm khung đứng dậy."
  - Nửa đường đứng dậy: gối còn gập ~nửa, hông nâng lên, thân thẳng dần, tóc rơi xuống sau lưng; hai chân giữ nguyên chỗ chạm đất (không trượt).
- **Ảnh tham chiếu:** `006-kk-tiepdat-thamchieu.png` (804×324) = ghép ngang F1 | [Ô TRỐNG] | F2, cắt cửa sổ (x0=84, y0=82, rộng 84, cao 100) của ô 256×256 rồi phóng ×3 nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.
- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**
  ```
  This strip shows consecutive frames of a 2D side-view pixel-art landing of Kiếm Khách (The Masked Wanderer): white mask with icy-blue eye slit, long silver-cream ponytail, dark layered clothing with cyan rune marks, two icy-blue swords: left = deep landing crouch, right = standing. Draw ONLY the missing in-between frame for the middle empty dashed cell: halfway standing up - knees half bent, hips rising, torso straightening, hair settling down the back. Both feet stay exactly where they touch the ground (marked by "+"). Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.
  ```
- **Lưu ảnh ra:** `art/muot-2/kk-tiepdat/moi-01.png` – mỗi tệp PNG RGBA đúng **256×256** (cỡ ô gốc), nền trong suốt, chân ở **[128, 172]** như khung gốc, quay PHẢI. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷3, nearest) theo cửa sổ rộng 84 × cao 100, dán vào ô 256×256 trong suốt tại (84,82). Lưu kèm ảnh nguồn `art/muot-2/kk-tiepdat/nguon-chatgpt.png`.
- **Thứ tự mới của clip sau khi lắp:** F0 F1 **moi-01** F2 (4 khung)
- **ms mới cho cả clip:** 33, 50, 50, 67 (200 ms; bộ ChatGPT 33,50,83 – chia khung cuối cho khung đứng dậy)
- **Sự kiện dời chỉ số (phiên lắp tự làm):** so_hinh 3→4 (clip theo tỉ lệ). Lớp sức mạnh có thư mục tiepdat → phiên lắp tự đặt lớp.
- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.
- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.
