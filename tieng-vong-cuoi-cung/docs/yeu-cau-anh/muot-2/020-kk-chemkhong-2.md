# 020 – Kiếm Khách – chém xoay: khung xoay thứ 2 giữa F3–F4 (P1)
- **Trạng thái:** ĐÃ LẮP (02/11, phiên MƯỢT-2: màu đưa về bảng 20 màu gốc, ms + khung trúng theo file này; lớp sức mạnh theo neo; kiểm thử ĐẠT) – trước đó: XONG (phiên chính vẽ bằng ChatGPT)
- **Clip:** `nhan-vat.json → cap[0..2].clip.chemkhong` – thư mục art gốc `art/kiem-khach/chemkhong/` (7 khung `fNN.png`, ô 256×256, quay PHẢI, neo chân [128, 172])
- **Việc cần vẽ:** Vẽ **1 khung mới** `moi-01`, chèn SAU F3 gốc (giữa F3 và F4). Làm SAU 003.
- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** "F2→F3→F4 xoay nhảy ảnh. Thêm 1 khung xoay giữa F2–F3 (và F3–F4 nếu cần)." (đo IoU F3→F4 = 0,39)
- **Ảnh tham chiếu:** `020-kk-chemkhong-2-thamchieu.png` (894×297) = ghép ngang F3 | [Ô TRỐNG] | F4, cắt cửa sổ (x0=81, y0=89, rộng 94, cao 91) của ô 256×256 rồi phóng ×3 nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.
- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**
  ```
  This strip shows consecutive frames of a 2D side-view pixel-art mid-air spinning sword slash of Kiếm Khách (The Masked Wanderer): white mask with icy-blue eye slit, long silver-cream ponytail, dark layered clothing with cyan rune marks, two icy-blue swords. Draw ONLY the missing in-between frame for the middle empty dashed cell: the body rotated halfway between the left and right frames, swords and circular cyan trail continuing smoothly. Same body centre position. Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.
  ```
- **Lưu ảnh ra:** `art/muot-2/kk-chemkhong-2/moi-01.png` – mỗi tệp PNG RGBA đúng **256×256** (cỡ ô gốc), nền trong suốt, chân ở **[128, 172]** như khung gốc, quay PHẢI. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷3, nearest) theo cửa sổ rộng 94 × cao 91, dán vào ô 256×256 trong suốt tại (81,89). Lưu kèm ảnh nguồn `art/muot-2/kk-chemkhong-2/nguon-chatgpt.png`.
- **Thứ tự mới của clip sau khi lắp:** (sau 003) F0 F1 F2 moi(003) F3 **moi-01** F4 F5 F6 (9 khung)
- **ms mới cho cả clip:** 50, 50, 45, 33, 45, 33, 50, 65, 70 (441 ms)
- **Sự kiện dời chỉ số (phiên lắp tự làm):** so_hinh 8→9; trung [2,3,4,5]→[2,3,4,5,6].
- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.
- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.
