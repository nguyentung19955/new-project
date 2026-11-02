# 003 – Kiếm Khách – chém xoay trên không: 1 khung xoay giữa F2–F3 (P0)
- **Trạng thái:** XONG (02/11, phiên chính vẽ bằng ChatGPT; đã căn theo khung hàng xóm – IoU hàng xóm ≥ 0.87; ảnh 256×256 neo [128,172])
- **Clip:** `nhan-vat.json → cap[0..2].clip.chemkhong` – thư mục art gốc `art/kiem-khach/chemkhong/` (7 khung `fNN.png`, ô 256×256, quay PHẢI, neo chân [128, 172])
- **Việc cần vẽ:** Vẽ **1 khung mới** `moi-01`, chèn SAU F2 (giữa F2 và F3).
- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** "F2→F3→F4 xoay 'nhảy ảnh'. Thêm 1 khung xoay giữa F2–F3 (và F3–F4 nếu cần)." (khung F3–F4 để ở yêu cầu P1 020)
  - Thân ở góc xoay nằm giữa F2 (lộn ngược) và F3 (cuộn người, đầu chúc xuống phải) – xoay thêm ~45°; vòng vệt cyan liền mạch giữa hai khung; tóc theo hướng xoay.
- **Ảnh tham chiếu:** `003-kk-chemkhong-thamchieu.png` (894×297) = ghép ngang F2 | [Ô TRỐNG] | F3, cắt cửa sổ (x0=81, y0=89, rộng 94, cao 91) của ô 256×256 rồi phóng ×3 nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.
- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**
  ```
  This strip shows consecutive frames of a 2D side-view pixel-art mid-air spinning sword slash of Kiếm Khách (The Masked Wanderer): white mask with icy-blue eye slit, long silver-cream ponytail, dark layered clothing with cyan rune marks, two icy-blue swords. Draw ONLY the missing in-between frame for the middle empty dashed cell: the body rotated halfway between the left frame and the right frame (about 45 degrees further in the spin), swords and the circular cyan slash trail continuing smoothly, hair following the spin. Same body centre position. Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.
  ```
- **Lưu ảnh ra:** `art/muot-2/kk-chemkhong/moi-01.png` – mỗi tệp PNG RGBA đúng **256×256** (cỡ ô gốc), nền trong suốt, chân ở **[128, 172]** như khung gốc, quay PHẢI. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷3, nearest) theo cửa sổ rộng 94 × cao 91, dán vào ô 256×256 trong suốt tại (81,89). Lưu kèm ảnh nguồn `art/muot-2/kk-chemkhong/nguon-chatgpt.png`.
- **Thứ tự mới của clip sau khi lắp:** F0 F1 F2 **moi-01** F3 F4 F5 F6 (8 khung)
- **ms mới cho cả clip:** 50, 50, 45, 33, 50, 50, 65, 70 (413 ms; bộ ChatGPT + 33 ms khung xoay)
- **Sự kiện dời chỉ số (phiên lắp tự làm):** cả 3 cấp: so_hinh 7→8; trung [2,3,4]→[2,3,4,5].
- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.
- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.
