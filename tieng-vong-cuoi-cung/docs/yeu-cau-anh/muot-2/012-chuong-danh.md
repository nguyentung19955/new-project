# 012 – Chuông Kén Nứt – đánh: 1 khung giữa F5–F6 (P0)
- **Trạng thái:** CHỜ
- **Clip:** `quai.json → loai.chuong.hinh.danh` – thư mục art gốc `art/quai-moi/chuong/danh/` (9 khung `fNN.png`, ô 100×100, quay TRÁI, neo chân [46, 84])
- **Việc cần vẽ:** Vẽ **1 khung mới** `moi-01`, chèn SAU F5.
- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** "F4≈F5 giữ rồi F5→F6 bùng mạnh (tâm nhảy 11,5%). Thêm 1 khung giữa F5–F6 (vỏ mở nửa, tua hất, điểm phát sáng)."
- **Ảnh tham chiếu:** `012-chuong-danh-thamchieu.png` (948×324) = ghép ngang F5 | [Ô TRỐNG] | F6, cắt cửa sổ (x0=0, y0=0, rộng 100, cao 100) của ô 100×100 rồi phóng ×3 nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.
- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**
  ```
  This strip shows consecutive frames of a 2D side-view pixel-art animation of the Cracked Cocoon Bell (elite floating cracked bell-cocoon with tendrils, ash-violet and brick-red). The creature faces LEFT. Draw ONLY the missing in-between frame for the middle empty dashed cell: shell half-open, tendrils flinging outward, a small glowing point starting at the crack - halfway between the held pose on the left and the burst on the right. Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.
  ```
- **Lưu ảnh ra:** `art/muot-2/chuong-danh/moi-01.png` – mỗi tệp PNG RGBA đúng **100×100** (cỡ ô gốc), nền trong suốt, chân ở **[46, 84]** như khung gốc, quay TRÁI. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷3, nearest) theo cửa sổ rộng 100 × cao 100, dán vào ô 100×100 trong suốt tại (0,0). Lưu kèm ảnh nguồn `art/muot-2/chuong-danh/nguon-chatgpt.png`.
- **Thứ tự mới của clip sau khi lắp:** F0 … F5 **moi-01** F6 F7 F8 (10 khung)
- **ms mới cho cả clip:** 100, 100, 100, 90, 80, 60, 50, 80, 100, 120 (880 ms; bộ ChatGPT + 50 ms khung mở nửa)
- **Sự kiện dời chỉ số (phiên lắp tự làm):** so_hinh 9→10; khung_trung [5,6]→[5,6,7]; fx_danh (9 khung) giữ nhịp cũ bằng ms riêng 100,100,100,90,80,110,80,100,120 để sóng âm vẫn bùng đúng lúc khung F6 cũ.
- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.
- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.
