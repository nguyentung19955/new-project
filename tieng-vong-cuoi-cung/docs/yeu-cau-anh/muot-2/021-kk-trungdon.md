# 021 – Kiếm Khách – trúng đòn: VẼ LẠI F2 và F4 (P1)
- **Trạng thái:** CHỜ
- **Clip:** `nhan-vat.json → clip.trungdon` – thư mục art gốc `art/kiem-khach/trungdon/` (6 khung `fNN.png`, ô 256×256, quay PHẢI, neo chân [128, 172])
- **Việc cần vẽ:** Vẽ **2 khung** `thay-02`, `thay-04`, THAY F2 và F4 (đang gần trùng F1, F3).
- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** "Chưa mượt: F1≈F2 mất nhịp va chạm, F3≈F4 dừng giữa phản ứng. Vẽ lại F2 (ngực bật lùi, tóc văng) và F4 (hạ hông, đầu hồi); khoá chân F5–F6."
- **Ảnh tham chiếu:** `021-kk-trungdon-thamchieu.png` (1467×300) = ghép ngang F1 | [Ô TRỐNG] | F3 | [Ô TRỐNG] | F5, cắt cửa sổ (x0=78, y0=90, rộng 93, cao 92) của ô 256×256 rồi phóng ×3 nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.
- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**
  ```
  This strip shows consecutive frames of a 2D side-view pixel-art hurt reaction of Kiếm Khách (The Masked Wanderer): white mask with icy-blue eye slit, long silver-cream ponytail, dark layered clothing with cyan rune marks, two icy-blue swords. Draw ONLY the 2 empty dashed cells: cell 2 = chest snapping backward from the hit, hair whipping; cell 4 = hips lowering, head coming back forward (recovering). Feet stay planted at "+". Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.
  ```
- **Lưu ảnh ra:** `art/muot-2/kk-trungdon/thay-02.png`, `art/muot-2/kk-trungdon/thay-04.png` – mỗi tệp PNG RGBA đúng **256×256** (cỡ ô gốc), nền trong suốt, chân ở **[128, 172]** như khung gốc, quay PHẢI. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷3, nearest) theo cửa sổ rộng 93 × cao 92, dán vào ô 256×256 trong suốt tại (78,90). Lưu kèm ảnh nguồn `art/muot-2/kk-trungdon/nguon-chatgpt.png`.
- **Thứ tự mới của clip sau khi lắp:** F0 F1 **thay-02** F3 **thay-04** F5 (6 khung)
- **ms mới cho cả clip:** 33, 33, 50, 50, 67, 67 (giữ)
- **Sự kiện dời chỉ số (phiên lắp tự làm):** số khung giữ 6. Lớp sức mạnh có thư mục trungdon → phiên lắp tự đặt lại lớp cho 2 khung thay.
- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.
- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.
